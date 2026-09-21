"""Signed HTTP client for the Kortex app's /api/voice endpoints."""
from __future__ import annotations

import json
from typing import AsyncIterator, Optional

import httpx

from .signing import signed_headers


class AppClient:
    def __init__(self, base_url: str, secret: str, client: Optional[httpx.AsyncClient] = None):
        self.base_url = base_url.rstrip("/")
        self.secret = secret
        # No overall read timeout on turns: replies stream. Connect and per-chunk reads are bounded.
        self._client = client or httpx.AsyncClient(timeout=httpx.Timeout(connect=5.0, read=30.0, write=10.0, pool=5.0))

    async def _post(self, path: str, payload: dict) -> httpx.Response:
        raw = json.dumps(payload, separators=(",", ":"))
        return await self._client.post(self.base_url + path, content=raw, headers=signed_headers(self.secret, raw))

    async def session(self, call_id: str, from_: str, to: str) -> dict:
        res = await self._post("/api/voice/session", {"callId": call_id, "from": from_, "to": to})
        res.raise_for_status()
        return res.json()

    async def turn(self, state: dict, text: str) -> AsyncIterator[dict]:
        """Yields events as the app produces them: say / action / state."""
        raw = json.dumps({"state": state, "text": text}, separators=(",", ":"))
        async with self._client.stream(
            "POST", self.base_url + "/api/voice/turn", content=raw, headers=signed_headers(self.secret, raw)
        ) as res:
            res.raise_for_status()
            async for line in res.aiter_lines():
                line = line.strip()
                if line:
                    yield json.loads(line)

    async def end(self, state: dict, duration_seconds: float, voicemail_text: Optional[str] = None) -> None:
        payload = {"state": state, "durationSeconds": round(duration_seconds)}
        if voicemail_text:
            payload["voicemailText"] = voicemail_text
        try:
            await self._post("/api/voice/end", payload)
        except httpx.HTTPError:
            pass  # The call is over; the app will show it as abandoned rather than fail the worker.

    async def aclose(self) -> None:
        await self._client.aclose()
