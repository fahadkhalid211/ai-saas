"""Turn-taking: splits a continuous caller audio stream into utterances.

An adaptive energy detector with hangover. It is deliberately dependency-free so it runs anywhere; it can be
swapped for Silero VAD by providing the same `is_speech(frame)` method.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Optional

import numpy as np

from .audio import rms


class EnergyVAD:
    """Classifies 20 ms frames as speech or not, tracking the background noise floor."""

    def __init__(self, min_rms: float = 350.0, ratio: float = 3.0):
        self.noise_floor = 120.0
        self.min_rms = min_rms
        self.ratio = ratio

    def is_speech(self, frame: np.ndarray) -> bool:
        level = rms(frame)
        threshold = max(self.min_rms, self.noise_floor * self.ratio)
        speech = level > threshold
        if not speech:
            # Learn the floor only from non-speech frames, slowly, so speech never raises it.
            self.noise_floor = 0.98 * self.noise_floor + 0.02 * max(level, 30.0)
        return speech


@dataclass
class SegmenterEvent:
    kind: str  # "speech_start" | "utterance"
    pcm: Optional[np.ndarray] = None  # int16 mono at the input rate, for "utterance"


@dataclass
class UtteranceSegmenter:
    """Feeds audio in; emits speech_start when the caller begins and utterance when they finish."""

    sample_rate: int = 8000
    frame_ms: int = 20
    start_frames: int = 4  # 80 ms of speech counts as a start (ignores clicks)
    end_silence_ms: int = 550  # silence that ends a turn
    max_utterance_ms: int = 15000
    min_utterance_ms: int = 250
    preroll_ms: int = 200
    vad: EnergyVAD = field(default_factory=EnergyVAD)

    def __post_init__(self) -> None:
        self._frame_len = self.sample_rate * self.frame_ms // 1000
        self._end_frames = self.end_silence_ms // self.frame_ms
        self._preroll_frames = self.preroll_ms // self.frame_ms
        self._preroll: List[np.ndarray] = []
        self._speech: List[np.ndarray] = []
        self._in_speech = False
        self._pending_start = 0
        self._silence = 0
        self._buf = np.zeros(0, dtype=np.int16)

    @property
    def in_speech(self) -> bool:
        return self._in_speech

    def reset(self) -> None:
        self._preroll.clear()
        self._speech.clear()
        self._in_speech = False
        self._pending_start = 0
        self._silence = 0
        self._buf = np.zeros(0, dtype=np.int16)

    def feed(self, pcm: np.ndarray) -> List[SegmenterEvent]:
        """Accepts any amount of audio; returns the events completed by it."""
        events: List[SegmenterEvent] = []
        self._buf = np.concatenate([self._buf, pcm.astype(np.int16)])
        while len(self._buf) >= self._frame_len:
            frame, self._buf = self._buf[: self._frame_len], self._buf[self._frame_len :]
            events.extend(self._frame(frame))
        return events

    def _frame(self, frame: np.ndarray) -> List[SegmenterEvent]:
        out: List[SegmenterEvent] = []
        speech = self.vad.is_speech(frame)

        if not self._in_speech:
            self._preroll.append(frame)
            self._preroll = self._preroll[-(self._preroll_frames + self.start_frames):]
            self._pending_start = self._pending_start + 1 if speech else 0
            if self._pending_start >= self.start_frames:
                self._in_speech = True
                self._silence = 0
                self._speech = list(self._preroll)
                self._preroll.clear()
                out.append(SegmenterEvent("speech_start"))
            return out

        self._speech.append(frame)
        self._silence = 0 if speech else self._silence + 1
        too_long = len(self._speech) * self.frame_ms >= self.max_utterance_ms
        if self._silence >= self._end_frames or too_long:
            pcm = np.concatenate(self._speech)
            self._in_speech = False
            self._speech = []
            self._pending_start = 0
            self._silence = 0
            if len(pcm) * 1000 // self.sample_rate >= self.min_utterance_ms:
                out.append(SegmenterEvent("utterance", pcm))
        return out
