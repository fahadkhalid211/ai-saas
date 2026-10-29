"""Speech-to-text and text-to-speech. Both run on CPU with free, open models.

The heavy libraries are imported lazily so the rest of the worker (and its tests) work without them.
Fake implementations are provided for tests and dry runs.
"""
from __future__ import annotations

import asyncio
import os
from typing import Optional, Protocol

import numpy as np

from .audio import mulaw_encode, pcm16_to_float32, resample


class STT(Protocol):
    async def transcribe(self, pcm_16k: np.ndarray, language: str) -> str: ...


class TTS(Protocol):
    async def synthesize(self, text: str, voice: str, language: str) -> bytes:
        """Returns 8 kHz G.711 mu-law audio ready to send to the carrier."""
        ...


class WhisperSTT:
    """faster-whisper (CTranslate2). `small` with int8 is a good CPU trade-off for telephone audio."""

    def __init__(self, model_size: str = "small", compute_type: str = "int8", cpu_threads: int = 4):
        self.model_size = model_size
        self.compute_type = compute_type
        self.cpu_threads = cpu_threads
        self._model = None

    def load(self) -> None:
        if self._model is None:
            from faster_whisper import WhisperModel  # imported lazily

            self._model = WhisperModel(self.model_size, device="cpu", compute_type=self.compute_type, cpu_threads=self.cpu_threads)

    def _run(self, pcm_16k: np.ndarray, language: str) -> str:
        self.load()
        lang = (language or "").split("-")[0] or None
        segments, _info = self._model.transcribe(  # type: ignore[union-attr]
            pcm16_to_float32(pcm_16k),
            language=lang,
            beam_size=1,
            vad_filter=False,
            condition_on_previous_text=False,
            temperature=0.0,
        )
        return " ".join(s.text.strip() for s in segments).strip()

    async def transcribe(self, pcm_16k: np.ndarray, language: str) -> str:
        return await asyncio.to_thread(self._run, pcm_16k, language)


class PiperTTS:
    """Piper neural TTS (fast on CPU). Voices are .onnx files in `voice_dir`, named like en_US-lessac-medium.onnx.

    NOTE: written against piper-tts 1.2/1.3. The synthesis call differs between releases, so both are handled.
    Verify with a real voice after installing (see README).
    """

    def __init__(self, voice_dir: str, default_voice: str = "en_US-lessac-medium"):
        self.voice_dir = voice_dir
        self.default_voice = default_voice
        self._voices: dict = {}

    def _load(self, name: str):
        if name not in self._voices:
            from piper import PiperVoice  # imported lazily

            path = os.path.join(self.voice_dir, f"{name}.onnx")
            if not os.path.exists(path):
                raise FileNotFoundError(f"Piper voice not found: {path}")
            self._voices[name] = PiperVoice.load(path)
        return self._voices[name]

    def _pick(self, voice: str, language: str) -> str:
        if voice:
            return voice
        lang = (language or "en").replace("-", "_")
        for f in sorted(os.listdir(self.voice_dir)) if os.path.isdir(self.voice_dir) else []:
            if f.endswith(".onnx") and (f.startswith(lang) or f.startswith(lang.split("_")[0] + "_")):
                return f[:-5]
        return self.default_voice

    def _run(self, text: str, voice: str, language: str) -> bytes:
        v = self._load(self._pick(voice, language))
        rate = int(getattr(getattr(v, "config", None), "sample_rate", 22050))
        if hasattr(v, "synthesize_stream_raw"):
            pcm = b"".join(v.synthesize_stream_raw(text))
        else:
            chunks = list(v.synthesize(text))
            pcm = b"".join(getattr(c, "audio_int16_bytes") for c in chunks)
            if chunks:
                rate = int(getattr(chunks[0], "sample_rate", rate))
        samples = np.frombuffer(pcm, dtype=np.int16)
        return mulaw_encode(resample(samples, rate, 8000))

    async def synthesize(self, text: str, voice: str, language: str) -> bytes:
        return await asyncio.to_thread(self._run, text, voice, language)


class FakeSTT:
    """Returns queued transcripts in order. For tests and dry runs."""

    def __init__(self, texts: Optional[list] = None):
        self.texts = list(texts or [])
        self.calls = 0

    async def transcribe(self, pcm_16k: np.ndarray, language: str) -> str:
        self.calls += 1
        return self.texts.pop(0) if self.texts else ""


class FakeTTS:
    """Produces `ms` milliseconds of silence per sentence, as 8 kHz mu-law."""

    def __init__(self, ms: int = 200):
        self.ms = ms
        self.spoken: list = []

    async def synthesize(self, text: str, voice: str, language: str) -> bytes:
        self.spoken.append(text)
        return b"\xff" * (8 * self.ms)  # 0xFF is mu-law silence


class CartesiaTTS:
    """Option B: Cartesia Sonic neural TTS (ultra-realistic, sub-100ms streaming voice)."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("CARTESIA_API_KEY", "")

    async def synthesize(self, text: str, voice: str, language: str) -> bytes:
        if not self.api_key:
            raise ValueError("CARTESIA_API_KEY is not configured")
        import urllib.request
        import json

        voice_id = voice if (voice and len(voice) > 20) else "a0e99841-438c-4a64-b679-ae501e7d6091"
        model_id = "sonic-english" if (language or "en").startswith("en") else "sonic-multilingual"

        req = urllib.request.Request(
            "https://api.cartesia.ai/tts/bytes",
            data=json.dumps({
                "model_id": model_id,
                "transcript": text,
                "voice": {"mode": "id", "id": voice_id},
                "output_format": {
                    "container": "raw",
                    "encoding": "pcm_mulaw",
                    "sample_rate": 8000
                }
            }).encode("utf-8"),
            headers={
                "X-API-Key": self.api_key,
                "Cartesia-Version": "2024-06-10",
                "Content-Type": "application/json"
            }
        )

        def _fetch():
            with urllib.request.urlopen(req, timeout=10) as resp:
                return resp.read()

        return await asyncio.to_thread(_fetch)


class MultiTierTTS:
    """Dispatches to PiperTTS for Option A (Standard), or CartesiaTTS for Option B (Premium)."""

    def __init__(self, local_tts: TTS, cartesia_tts: Optional[TTS] = None):
        self.local_tts = local_tts
        self.cartesia_tts = cartesia_tts

    async def synthesize_tier(self, text: str, voice: str, language: str, tier: str = "standard", provider: str = "local") -> bytes:
        if tier == "premium" and (provider == "cartesia" or not provider):
            if self.cartesia_tts:
                try:
                    return await self.cartesia_tts.synthesize(text, voice, language)
                except Exception as err:
                    import logging
                    logging.getLogger("voice.speech").warning("Cartesia TTS synthesis failed (%s: %s), falling back to local Piper", type(err).__name__, err)
        return await self.local_tts.synthesize(text, voice, language)

    async def synthesize(self, text: str, voice: str, language: str) -> bytes:
        return await self.local_tts.synthesize(text, voice, language)
