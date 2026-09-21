"""One phone call: carrier media stream <-> speech models <-> the Kortex app.

Protocol (Telnyx bidirectional media streaming): events `connected`, `start`, `media`, `dtmf`, `stop` arrive as
JSON text frames; we reply with `{"event":"media","media":{"payload": base64 mu-law}}` and `{"event":"clear"}`
to flush queued audio when the caller interrupts.
"""
from __future__ import annotations

import asyncio
import base64
import json
import logging
import re
import time
from typing import Any, Callable, Dict, List, Optional

from .appclient import AppClient
from .audio import mulaw_decode, resample
from .carrier import Carrier
from .config import Config
from .signing import verify_call_token
from .speech import STT, TTS
from .vad import UtteranceSegmenter

log = logging.getLogger("voice.call")

SEND_CHUNK_BYTES = 4000  # 0.5 s of 8 kHz mu-law per message
DTMF_TEXT = {"0": "I want to speak to a person", "1": "yes", "2": "no"}
JUNK = re.compile(r"^[\W_]*(?:you|uh|um|hmm|mm|thank you\.?|thanks for watching\.?)?[\W_]*$", re.IGNORECASE)


class CallSession:
    def __init__(
        self,
        ws: Any,
        cfg: Config,
        app: AppClient,
        stt: STT,
        tts: TTS,
        carrier: Carrier,
        clock: Callable[[], float] = time.monotonic,
    ) -> None:
        self.ws = ws
        self.cfg = cfg
        self.app = app
        self.stt = stt
        self.tts = tts
        self.carrier = carrier
        self.clock = clock

        self.segmenter = UtteranceSegmenter(sample_rate=8000, end_silence_ms=cfg.end_silence_ms)
        self.state: Optional[Dict[str, Any]] = None
        self.call_id = ""
        self.mode = ""
        self.language = "en"
        self.voice = ""
        self.to = ""
        self.max_seconds = 600

        self._t0 = self.clock()
        self._gen = 0  # bumped on barge-in so stale speech is dropped
        self._speaking_until = 0.0
        self._last_activity = self.clock()
        self._busy = False
        self._closing = False
        self._idle_prompted = False
        self._utterances: "asyncio.Queue[Optional[Any]]" = asyncio.Queue()
        self._tasks: List["asyncio.Task[Any]"] = []
        self._voicemail: List[str] = []
        self._started = False

    # ------------------------------------------------------------------ lifecycle
    async def run(self) -> None:
        try:
            async for raw in self.ws:
                try:
                    msg = json.loads(raw)
                except (TypeError, ValueError):
                    continue
                event = msg.get("event")
                if event == "start":
                    if not await self._on_start(msg):
                        break
                elif event == "media" and self._started:
                    await self._on_media(msg)
                elif event == "dtmf" and self._started:
                    digit = (msg.get("dtmf") or {}).get("digit")
                    if digit in DTMF_TEXT and self.mode == "ai":
                        await self._utterances.put(("text", DTMF_TEXT[digit]))
                elif event == "stop":
                    break
                if self._closing:
                    break
        finally:
            await self._finish()

    async def _finish(self) -> None:
        self._closing = True
        for t in self._tasks:
            t.cancel()
        for t in self._tasks:
            try:
                await t
            except (asyncio.CancelledError, Exception):
                pass
        if self.state:
            await self.app.end(self.state, self.clock() - self._t0, " ".join(self._voicemail) or None)

    # ------------------------------------------------------------------ start
    async def _on_start(self, msg: Dict[str, Any]) -> bool:
        start = msg.get("start") or {}
        params = start.get("custom_parameters") or start.get("customParameters") or {}
        payload = verify_call_token(self.cfg.secret, params.get("callToken", ""))
        if not payload:
            log.warning("rejecting stream: missing or invalid call token")
            await self._close(1008, "unauthorized")
            return False

        self.call_id = payload["callId"]
        self.to = payload.get("to", "")
        session = await self.app.session(self.call_id, payload.get("from", ""), self.to)

        if not session.get("ok"):
            await self._hangup_after_saying("Sorry, we can't take your call right now. Goodbye.")
            return True
        if session.get("mode") == "forward":
            await self.carrier.transfer(self.call_id, session["number"], self.to)
            self._closing = True
            return True

        self.mode = session["mode"]
        self.state = session["state"]
        self.language = session.get("language") or "en"
        self.voice = session.get("voice") or ""
        self.max_seconds = int(session.get("maxSeconds") or 600)
        self._started = True

        self._tasks = [
            asyncio.create_task(self._turn_loop()),
            asyncio.create_task(self._idle_watch()),
            asyncio.create_task(self._max_duration()),
        ]
        await self._speak(session["greeting"], self._gen)
        return True

    # ------------------------------------------------------------------ audio in
    async def _on_media(self, msg: Dict[str, Any]) -> None:
        media = msg.get("media") or {}
        if media.get("track") not in (None, "inbound"):
            return
        payload = media.get("payload")
        if not payload:
            return
        pcm = mulaw_decode(base64.b64decode(payload))
        for ev in self.segmenter.feed(pcm):
            if ev.kind == "speech_start":
                self._last_activity = self.clock()
                self._idle_prompted = False
                if self.clock() < self._speaking_until - 0.15:
                    await self._barge_in()
            elif ev.kind == "utterance" and ev.pcm is not None:
                await self._utterances.put(("audio", ev.pcm))

    async def _barge_in(self) -> None:
        """The caller spoke over us: stop talking now and drop any sentences still queued."""
        self._gen += 1
        self._speaking_until = 0.0
        await self._send({"event": "clear"})

    # ------------------------------------------------------------------ audio out
    async def _send(self, obj: Dict[str, Any]) -> None:
        try:
            await self.ws.send(json.dumps(obj))
        except Exception:
            self._closing = True

    async def _speak(self, text: str, gen: int) -> None:
        if not text.strip() or self._closing:
            return
        audio = await self.tts.synthesize(text, self.voice, self.language)
        if gen != self._gen or self._closing:
            return  # interrupted while synthesising
        for i in range(0, len(audio), SEND_CHUNK_BYTES):
            chunk = audio[i : i + SEND_CHUNK_BYTES]
            await self._send({"event": "media", "media": {"payload": base64.b64encode(chunk).decode()}})
        now = self.clock()
        self._speaking_until = max(now, self._speaking_until) + len(audio) / 8000.0
        self._last_activity = self._speaking_until

    async def _wait_playback(self, gen: int) -> None:
        while gen == self._gen and self.clock() < self._speaking_until and not self._closing:
            await asyncio.sleep(min(0.25, max(0.01, self._speaking_until - self.clock())))
        if gen == self._gen:
            await asyncio.sleep(0.2)

    async def _hangup_after_saying(self, text: str) -> None:
        gen = self._gen
        await self._speak(text, gen)
        await self._wait_playback(gen)
        await self.carrier.hangup(self.call_id)
        self._closing = True

    # ------------------------------------------------------------------ turns
    async def _turn_loop(self) -> None:
        while True:
            item = await self._utterances.get()
            if item is None:
                return
            kind, data = item
            self._busy = True
            try:
                if kind == "audio":
                    pcm_16k = resample(data, 8000, 16000)
                    text = (await self.stt.transcribe(pcm_16k, self.language)).strip()
                else:
                    text = data
                if len(re.sub(r"\W", "", text)) < 2 or JUNK.match(text):
                    continue
                if self.mode == "voicemail":
                    self._voicemail.append(text)
                    continue
                await self._process_text(text)
            except asyncio.CancelledError:
                raise
            except Exception:
                log.exception("turn failed")
                await self._speak("Sorry, I'm having trouble. Could you say that again?", self._gen)
            finally:
                self._busy = False
                self._last_activity = max(self.clock(), self._speaking_until)

    async def _process_text(self, text: str) -> None:
        assert self.state is not None
        gen = self._gen
        transfer_to: Optional[str] = None
        hang_up = False
        async for evt in self.app.turn(self.state, text):
            kind = evt.get("type")
            if kind == "say":
                await self._speak(evt["text"], gen)
            elif kind == "action":
                action = evt.get("action") or {}
                if action.get("type") == "transfer":
                    transfer_to = action.get("number")
                elif action.get("type") == "hangup":
                    hang_up = True
            elif kind == "state":
                self.state = evt["state"]
        if transfer_to:
            await self._wait_playback(gen)
            await self.carrier.transfer(self.call_id, transfer_to, self.to)
            self._closing = True
        elif hang_up:
            await self._wait_playback(gen)
            await self.carrier.hangup(self.call_id)
            self._closing = True

    # ------------------------------------------------------------------ watchdogs
    async def _idle_watch(self) -> None:
        while not self._closing:
            await asyncio.sleep(1.0)
            if self._busy or self.segmenter.in_speech:
                continue
            quiet = self.clock() - max(self._last_activity, self._speaking_until)
            if self.mode == "voicemail":
                if self._voicemail and quiet > 4:
                    await self._hangup_after_saying("Thank you. Your message has been recorded. Goodbye.")
                elif quiet > 20:
                    await self._hangup_after_saying("I did not hear a message. Goodbye.")
                continue
            if quiet > self.cfg.idle_hangup_seconds and self._idle_prompted:
                await self._hangup_after_saying("I haven't heard anything, so I'll end the call. Goodbye.")
            elif quiet > self.cfg.idle_prompt_seconds and not self._idle_prompted:
                self._idle_prompted = True
                await self._speak("Are you still there?", self._gen)

    async def _max_duration(self) -> None:
        await asyncio.sleep(self.max_seconds)
        if not self._closing:
            await self._hangup_after_saying("I need to end this call now. Thanks for calling. Goodbye.")

    async def _close(self, code: int, reason: str) -> None:
        try:
            await self.ws.close(code, reason)
        except Exception:
            pass
        self._closing = True
