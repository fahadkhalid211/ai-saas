"""Carrier control: hang up a call or move it to a person. Telnyx TeXML REST API.

Uses `POST /v2/texml/Accounts/{account_sid}/Calls/{call_sid}` with `Status=completed` to hang up, and a replacement
`TeXML` document to transfer. Confirm the exact request shape against Telnyx's current "Update call" docs
before going live (see README).
"""
from __future__ import annotations

from typing import Optional, Protocol
from xml.sax.saxutils import escape

import httpx


class Carrier(Protocol):
    async def transfer(self, call_id: str, number: str, caller_id: Optional[str] = None) -> bool: ...
    async def hangup(self, call_id: str) -> bool: ...


class TelnyxCarrier:
    def __init__(self, api_key: str, account_sid: str, client: Optional[httpx.AsyncClient] = None):
        self.api_key = api_key
        self.account_sid = account_sid
        self._client = client or httpx.AsyncClient(timeout=10.0)

    def _url(self, call_id: str) -> str:
        return f"https://api.telnyx.com/v2/texml/Accounts/{self.account_sid}/Calls/{call_id}"

    async def _update(self, call_id: str, body: dict) -> bool:
        if not (self.api_key and self.account_sid):
            return False
        try:
            res = await self._client.post(self._url(call_id), json=body, headers={"Authorization": f"Bearer {self.api_key}"})
            return res.status_code < 300
        except httpx.HTTPError:
            return False

    async def transfer(self, call_id: str, number: str, caller_id: Optional[str] = None) -> bool:
        cid = f' callerId="{escape(caller_id)}"' if caller_id else ""
        texml = f'<?xml version="1.0" encoding="UTF-8"?><Response><Dial{cid} timeout="25"><Number>{escape(number)}</Number></Dial></Response>'
        return await self._update(call_id, {"TeXML": texml})

    async def hangup(self, call_id: str) -> bool:
        return await self._update(call_id, {"Status": "completed"})


class NoCarrier:
    """Used when carrier credentials are not configured: records requests so the caller is never stranded silently."""

    def __init__(self) -> None:
        self.transfers: list = []
        self.hangups: list = []

    async def transfer(self, call_id: str, number: str, caller_id: Optional[str] = None) -> bool:
        self.transfers.append((call_id, number))
        return False

    async def hangup(self, call_id: str) -> bool:
        self.hangups.append(call_id)
        return False
