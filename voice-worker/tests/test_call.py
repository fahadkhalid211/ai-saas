"""End-to-end call handling with fake carrier socket, fake speech models and a fake app."""
import asyncio
import base64
import json

import numpy as np

from worker.audio import mulaw_encode
from worker.call import CallSession
from worker.carrier import NoCarrier
from worker.config import Config
from worker.speech import FakeSTT, FakeTTS

SECRET = "a" * 40
TOKEN = (
    "eyJjYWxsSWQiOiJjMSIsImFzc2lzdGFudElkIjoiYTEiLCJmcm9tIjoiKzEiLCJ0byI6IisyIiwiZXhwIjoxODAwMDAwOTAwfQ"
    ".La-xiCZFXyPynUS4x59wOVTCj5sX0M2-Wkv-pl-gH9k"
)
CFG = Config(app_base_url="https://app.example", secret=SECRET, end_silence_ms=300, idle_prompt_seconds=999, idle_hangup_seconds=9999)


class FakeClock:
    """Stands in for time.monotonic so the test controls when the token is valid: verify_call_token uses time.time,
    so we patch that separately in the tests that need it."""

    def __init__(self):
        self.t = 0.0

    def __call__(self):
        return self.t


class FakeApp:
    def __init__(self, session, turns):
        self._session = session
        self._turns = list(turns)
        self.turn_inputs = []
        self.ended = None

    async def session(self, call_id, from_, to):
        return self._session

    async def turn(self, state, text):
        self.turn_inputs.append(text)
        for e in self._turns.pop(0):
            yield e

    async def end(self, state, duration, voicemail_text=None):
        self.ended = (state, voicemail_text)


class FakeWS:
    def __init__(self, incoming):
        self.incoming = incoming  # async generator factory
        self.sent = []
        self.closed = None

    def __aiter__(self):
        return self.incoming().__aiter__()

    async def send(self, data):
        self.sent.append(json.loads(data))

    async def close(self, code=1000, reason=""):
        self.closed = (code, reason)


def start_msg(token=TOKEN):
    return json.dumps({"event": "start", "start": {"custom_parameters": {"callToken": token}}})


def media_msg(pcm):
    return json.dumps({"event": "media", "media": {"track": "inbound", "payload": base64.b64encode(mulaw_encode(pcm)).decode()}})


def speech(ms):
    t = np.arange(8 * ms) / 8000
    return (4000 * np.sin(2 * np.pi * 300 * t)).astype(np.int16)


def quiet(ms):
    return np.zeros(8 * ms, dtype=np.int16)


AI_SESSION = {"ok": True, "mode": "ai", "greeting": "Hello, this is an AI assistant.", "state": {"callId": "c1", "turns": 0}, "language": "en", "voice": "", "maxSeconds": 600}


async def frames(*parts):
    """Feeds 20 ms frames, yielding to the event loop so background tasks get to run."""
    for pcm in parts:
        for i in range(0, len(pcm), 160):
            yield media_msg(pcm[i : i + 160])
            await asyncio.sleep(0)


def patch_time(monkeypatch):
    import worker.signing as signing

    monkeypatch.setattr(signing.time, "time", lambda: 1800000000.0)


def make(monkeypatch, app, incoming, stt_texts):
    patch_time(monkeypatch)
    ws = FakeWS(incoming)
    carrier = NoCarrier()
    tts = FakeTTS(ms=100)
    session = CallSession(ws, CFG, app, FakeSTT(stt_texts), tts, carrier)
    return session, ws, carrier, tts


def run(coro):
    return asyncio.run(coro)


def test_greets_answers_and_ends(monkeypatch):
    app = FakeApp(AI_SESSION, [[{"type": "say", "text": "We open at nine."}, {"type": "state", "state": {"callId": "c1", "turns": 1}}]])

    async def incoming():
        yield json.dumps({"event": "connected"})
        yield start_msg()
        async for m in frames(quiet(400), speech(800), quiet(700)):
            yield m
        await asyncio.sleep(0.3)  # let the turn finish
        yield json.dumps({"event": "stop"})

    session, ws, _, tts = make(monkeypatch, app, incoming, ["when do you open"])
    run(session.run())

    assert tts.spoken[0] == "Hello, this is an AI assistant."  # AI greeting first
    assert app.turn_inputs == ["when do you open"]
    assert "We open at nine." in tts.spoken
    assert any(m["event"] == "media" for m in ws.sent)
    assert app.ended and app.ended[0]["turns"] == 1  # final state reported to the app


def test_rejects_a_stream_without_a_valid_token(monkeypatch):
    app = FakeApp(AI_SESSION, [])

    async def incoming():
        yield start_msg(token="bad.token")

    session, ws, _, _ = make(monkeypatch, app, incoming, [])
    run(session.run())
    assert ws.closed == (1008, "unauthorized")
    assert app.ended is None  # no session was ever created


def test_barge_in_clears_queued_audio(monkeypatch):
    app = FakeApp(AI_SESSION, [])

    async def incoming():
        yield start_msg()
        await asyncio.sleep(0.05)
        # The greeting (100 ms of audio) is now "playing"; the caller starts talking over it.
        async for m in frames(speech(400)):
            yield m
        await asyncio.sleep(0.05)
        yield json.dumps({"event": "stop"})

    session, ws, _, _ = make(monkeypatch, app, incoming, [])
    session.tts = FakeTTS(ms=1500)  # a long greeting, still "playing" when the caller interrupts
    session.clock = lambda: 0.0  # freeze time so playback never finishes
    run(session.run())
    assert any(m["event"] == "clear" for m in ws.sent)


def test_action_hangup_is_sent_to_the_carrier(monkeypatch):
    app = FakeApp(AI_SESSION, [[{"type": "say", "text": "Goodbye!"}, {"type": "action", "action": {"type": "hangup"}}, {"type": "state", "state": {"callId": "c1", "turns": 1}}]])

    async def incoming():
        yield start_msg()
        async for m in frames(quiet(300), speech(800), quiet(600)):
            yield m
        await asyncio.sleep(1.2)
        yield json.dumps({"event": "stop"})

    session, _, carrier, _ = make(monkeypatch, app, incoming, ["no that is all bye"])
    run(session.run())
    assert carrier.hangups == ["c1"]


def test_transfer_action_goes_to_the_carrier(monkeypatch):
    app = FakeApp(AI_SESSION, [[{"type": "say", "text": "One moment."}, {"type": "action", "action": {"type": "transfer", "number": "+14155559999"}}, {"type": "state", "state": {"callId": "c1", "turns": 1}}]])

    async def incoming():
        yield start_msg()
        async for m in frames(quiet(300), speech(800), quiet(600)):
            yield m
        await asyncio.sleep(1.2)
        yield json.dumps({"event": "stop"})

    session, _, carrier, _ = make(monkeypatch, app, incoming, ["let me talk to a person"])
    run(session.run())
    assert carrier.transfers == [("c1", "+14155559999")]


def test_dtmf_zero_asks_for_a_person(monkeypatch):
    app = FakeApp(AI_SESSION, [[{"type": "state", "state": {"callId": "c1", "turns": 1}}]])

    async def incoming():
        yield start_msg()
        yield json.dumps({"event": "dtmf", "dtmf": {"digit": "0"}})
        await asyncio.sleep(0.2)
        yield json.dumps({"event": "stop"})

    session, _, _, _ = make(monkeypatch, app, incoming, [])
    run(session.run())
    assert app.turn_inputs == ["I want to speak to a person"]


def test_ignores_silence_hallucinations(monkeypatch):
    app = FakeApp(AI_SESSION, [])

    async def incoming():
        yield start_msg()
        async for m in frames(quiet(300), speech(600), quiet(600)):
            yield m
        await asyncio.sleep(0.2)
        yield json.dumps({"event": "stop"})

    session, _, _, _ = make(monkeypatch, app, incoming, ["you"])
    run(session.run())
    assert app.turn_inputs == []  # a bare "you" from silence is not sent to the assistant


def test_forward_mode_transfers_immediately(monkeypatch):
    app = FakeApp({"ok": True, "mode": "forward", "number": "+14155550001"}, [])

    async def incoming():
        yield start_msg()
        yield json.dumps({"event": "stop"})

    session, _, carrier, _ = make(monkeypatch, app, incoming, [])
    run(session.run())
    assert carrier.transfers == [("c1", "+14155550001")]
