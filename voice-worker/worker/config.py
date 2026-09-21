"""Worker configuration from environment variables."""
from __future__ import annotations

import os
from dataclasses import dataclass


def _int(name: str, default: int) -> int:
    try:
        return int(os.environ.get(name, default))
    except ValueError:
        return default


@dataclass(frozen=True)
class Config:
    app_base_url: str
    secret: str
    host: str = "0.0.0.0"
    port: int = 8765
    max_concurrent_calls: int = 4
    stt_model: str = "small"
    stt_compute: str = "int8"
    stt_threads: int = 4
    piper_voice_dir: str = "/models/piper"
    default_voice: str = "en_US-lessac-medium"
    telnyx_api_key: str = ""
    telnyx_account_sid: str = ""
    end_silence_ms: int = 550
    idle_prompt_seconds: int = 12
    idle_hangup_seconds: int = 22

    @staticmethod
    def from_env() -> "Config":
        secret = os.environ.get("VOICE_WORKER_SECRET", "")
        if len(secret) < 32:
            raise SystemExit("VOICE_WORKER_SECRET must be set (>= 32 characters) and match the app.")
        base = os.environ.get("APP_BASE_URL", "")
        if not base.startswith("http"):
            raise SystemExit("APP_BASE_URL must be the app's https URL, e.g. https://your-app.vercel.app")
        return Config(
            app_base_url=base,
            secret=secret,
            host=os.environ.get("HOST", "0.0.0.0"),
            port=_int("PORT", 8765),
            max_concurrent_calls=_int("MAX_CONCURRENT_CALLS", 4),
            stt_model=os.environ.get("STT_MODEL", "small"),
            stt_compute=os.environ.get("STT_COMPUTE", "int8"),
            stt_threads=_int("STT_THREADS", 4),
            piper_voice_dir=os.environ.get("PIPER_VOICE_DIR", "/models/piper"),
            default_voice=os.environ.get("DEFAULT_VOICE", "en_US-lessac-medium"),
            telnyx_api_key=os.environ.get("TELNYX_API_KEY", ""),
            telnyx_account_sid=os.environ.get("TELNYX_ACCOUNT_SID", ""),
            end_silence_ms=_int("END_SILENCE_MS", 550),
            idle_prompt_seconds=_int("IDLE_PROMPT_SECONDS", 12),
            idle_hangup_seconds=_int("IDLE_HANGUP_SECONDS", 22),
        )
