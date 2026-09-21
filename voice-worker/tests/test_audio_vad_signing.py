import numpy as np

from worker.audio import mulaw_decode, mulaw_encode, resample, rms
from worker.signing import sign_request, verify_call_token
from worker.vad import UtteranceSegmenter


def tone(ms: int, hz: int = 300, amp: int = 4000, sr: int = 8000) -> np.ndarray:
    t = np.arange(sr * ms // 1000) / sr
    return (amp * np.sin(2 * np.pi * hz * t)).astype(np.int16)


def silence(ms: int, sr: int = 8000) -> np.ndarray:
    return np.zeros(sr * ms // 1000, dtype=np.int16)


# ---------------------------------------------------------------- audio
def test_mulaw_roundtrip_is_close():
    pcm = tone(200, amp=12000)
    back = mulaw_decode(mulaw_encode(pcm))
    assert len(back) == len(pcm)
    err = rms(back.astype(np.int32) - pcm.astype(np.int32))
    assert err < 0.05 * rms(pcm)  # mu-law is ~8-bit companding: a few percent error


def test_mulaw_silence_is_ff():
    assert mulaw_encode(np.zeros(4, dtype=np.int16)) == b"\xff\xff\xff\xff"


def test_resample_lengths_and_tone_survive():
    pcm = tone(1000, hz=440, sr=8000)
    up = resample(pcm, 8000, 16000)
    assert len(up) == 16000
    down = resample(up, 16000, 8000)
    assert len(down) == 8000
    # dominant frequency is unchanged after a round trip
    spec = np.abs(np.fft.rfft(down.astype(np.float64)))
    assert abs(np.argmax(spec) - 440) <= 2


def test_downsample_removes_out_of_band_energy():
    high = tone(500, hz=7000, sr=16000)  # above the 4 kHz Nyquist of 8 kHz audio
    assert rms(resample(high, 16000, 8000)) < 0.1 * rms(high)


# ---------------------------------------------------------------- vad
def run(seg: UtteranceSegmenter, audio: np.ndarray):
    events = []
    for i in range(0, len(audio), 160):
        events += seg.feed(audio[i : i + 160])
    return events


def test_segments_one_utterance_with_preroll():
    seg = UtteranceSegmenter()
    events = run(seg, np.concatenate([silence(600), tone(900), silence(900)]))
    kinds = [e.kind for e in events]
    assert kinds == ["speech_start", "utterance"]
    utt = events[1].pcm
    assert 900 <= len(utt) * 1000 // 8000 <= 1900  # speech + preroll + trailing silence


def test_two_turns_are_split():
    seg = UtteranceSegmenter()
    audio = np.concatenate([silence(400), tone(600), silence(900), tone(700), silence(900)])
    assert [e.kind for e in run(seg, audio)] == ["speech_start", "utterance", "speech_start", "utterance"]


def test_clicks_and_short_noise_are_ignored():
    seg = UtteranceSegmenter()
    audio = np.concatenate([silence(500), tone(40), silence(1000)])
    assert run(seg, audio) == []


def test_steady_background_noise_is_not_speech():
    rng = np.random.default_rng(1)
    noise = (rng.normal(0, 150, 8000 * 3)).astype(np.int16)
    assert run(UtteranceSegmenter(), noise) == []


def test_very_long_speech_is_cut_at_the_limit():
    seg = UtteranceSegmenter(max_utterance_ms=2000)
    events = run(seg, tone(3000))
    assert "utterance" in [e.kind for e in events]


# ---------------------------------------------------------------- signing (vectors produced by lib/voice/auth.ts)
SECRET = "a" * 40
TS_SIG = "b3ab51497894eb30e2beeb30959d6cf5fbe6c6c20c7b7a76db3eb4359405dc6f"
TOKEN = (
    "eyJjYWxsSWQiOiJjMSIsImFzc2lzdGFudElkIjoiYTEiLCJmcm9tIjoiKzEiLCJ0byI6IisyIiwiZXhwIjoxODAwMDAwOTAwfQ"
    ".La-xiCZFXyPynUS4x59wOVTCj5sX0M2-Wkv-pl-gH9k"
)


def test_signature_matches_the_typescript_implementation():
    assert sign_request(SECRET, 1800000000, '{"x":1}') == TS_SIG


def test_call_token_from_the_app_verifies():
    payload = verify_call_token(SECRET, TOKEN, now=1800000000)
    assert payload and payload["callId"] == "c1" and payload["assistantId"] == "a1" and payload["to"] == "+2"


def test_call_token_rejections():
    assert verify_call_token(SECRET, TOKEN, now=1800001000) is None  # expired
    assert verify_call_token("b" * 40, TOKEN, now=1800000000) is None  # wrong secret
    body, sig = TOKEN.split(".")
    assert verify_call_token(SECRET, body + "." + sig[:-2] + "xx", now=1800000000) is None  # tampered
    assert verify_call_token(SECRET, "", now=1800000000) is None
