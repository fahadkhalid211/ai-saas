"""Telephone audio helpers: G.711 mu-law, resampling and framing. Pure numpy, no native codecs."""
from __future__ import annotations

import numpy as np

MULAW_BIAS = 0x84
MULAW_CLIP = 32635


def mulaw_decode(data: bytes) -> np.ndarray:
    """G.711 mu-law bytes -> int16 PCM."""
    u = np.frombuffer(data, dtype=np.uint8).astype(np.int32)
    u = ~u & 0xFF
    sign = u & 0x80
    exponent = (u >> 4) & 0x07
    mantissa = u & 0x0F
    sample = (((mantissa << 3) + MULAW_BIAS) << exponent) - MULAW_BIAS
    return np.where(sign != 0, -sample, sample).astype(np.int16)


def mulaw_encode(pcm: np.ndarray) -> bytes:
    """int16 PCM -> G.711 mu-law bytes."""
    x = pcm.astype(np.int32)
    sign = np.where(x < 0, 0x80, 0)
    x = np.minimum(np.abs(x), MULAW_CLIP) + MULAW_BIAS
    exponent = np.zeros_like(x)
    for e in range(7, 0, -1):
        exponent = np.where((exponent == 0) & (x >= (1 << (e + 7))), e, exponent)
    mantissa = (x >> (exponent + 3)) & 0x0F
    return (~(sign | (exponent << 4) | mantissa) & 0xFF).astype(np.uint8).tobytes()


def _lowpass(x: np.ndarray, cutoff_ratio: float, taps: int = 63) -> np.ndarray:
    """Windowed-sinc low-pass. cutoff_ratio is cutoff / sample_rate (0..0.5)."""
    n = np.arange(taps) - (taps - 1) / 2
    h = np.sinc(2 * cutoff_ratio * n) * np.hamming(taps)
    h /= h.sum()
    return np.convolve(x, h, mode="same")


def resample(pcm: np.ndarray, src_hz: int, dst_hz: int) -> np.ndarray:
    """Resample int16 mono audio. Low-passes before downsampling to avoid aliasing."""
    if src_hz == dst_hz or pcm.size == 0:
        return pcm.astype(np.int16)
    x = pcm.astype(np.float64)
    if dst_hz < src_hz:
        x = _lowpass(x, 0.45 * dst_hz / src_hz)
    n_out = int(round(len(x) * dst_hz / src_hz))
    positions = np.linspace(0, len(x) - 1, n_out)
    out = np.interp(positions, np.arange(len(x)), x)
    return np.clip(out, -32768, 32767).astype(np.int16)


def pcm16_to_float32(pcm: np.ndarray) -> np.ndarray:
    return pcm.astype(np.float32) / 32768.0


def chunk_bytes(data: bytes, size: int):
    """Yields fixed-size chunks (the last may be shorter)."""
    for i in range(0, len(data), size):
        yield data[i : i + size]


def rms(pcm: np.ndarray) -> float:
    if pcm.size == 0:
        return 0.0
    return float(np.sqrt(np.mean(np.square(pcm.astype(np.float64)))))
