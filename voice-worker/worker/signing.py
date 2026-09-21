"""Request signing and call tokens. Byte-for-byte compatible with lib/voice/auth.ts in the Next.js app."""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import time
from typing import Optional


def sign_request(secret: str, timestamp_seconds: int, raw_body: str) -> str:
    """HMAC-SHA256 hex of `<timestamp>.<body>`."""
    return hmac.new(secret.encode(), f"{timestamp_seconds}.{raw_body}".encode(), hashlib.sha256).hexdigest()


def signed_headers(secret: str, raw_body: str, now: Optional[float] = None) -> dict:
    ts = int(now if now is not None else time.time())
    return {
        "x-voice-timestamp": str(ts),
        "x-voice-signature": sign_request(secret, ts, raw_body),
        "content-type": "application/json",
    }


def _b64u_decode(s: str) -> bytes:
    return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))


def verify_call_token(secret: str, token: str, now: Optional[float] = None) -> Optional[dict]:
    """Returns the payload (callId, assistantId, from, to, exp) if the token is genuine and unexpired."""
    if not secret or not token or token.count(".") != 1:
        return None
    body, sig = token.split(".")
    expected = base64.urlsafe_b64encode(hmac.new(secret.encode(), body.encode(), hashlib.sha256).digest()).rstrip(b"=").decode()
    if not hmac.compare_digest(sig, expected):
        return None
    try:
        payload = json.loads(_b64u_decode(body))
    except Exception:
        return None
    if not payload.get("callId") or not payload.get("assistantId") or not isinstance(payload.get("exp"), (int, float)):
        return None
    current = now if now is not None else time.time()
    return payload if payload["exp"] > current else None
