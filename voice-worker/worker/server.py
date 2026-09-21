"""WebSocket server: accepts carrier media streams and runs a CallSession for each."""
from __future__ import annotations

import asyncio
import logging

import websockets
from websockets.http11 import Response

from .appclient import AppClient
from .call import CallSession
from .carrier import NoCarrier, TelnyxCarrier
from .config import Config
from .speech import PiperTTS, WhisperSTT

log = logging.getLogger("voice.server")


async def serve(cfg: Config) -> None:
    app = AppClient(cfg.app_base_url, cfg.secret)
    stt = WhisperSTT(cfg.stt_model, cfg.stt_compute, cfg.stt_threads)
    tts = PiperTTS(cfg.piper_voice_dir, cfg.default_voice)
    carrier = TelnyxCarrier(cfg.telnyx_api_key, cfg.telnyx_account_sid) if cfg.telnyx_api_key else NoCarrier()
    if not cfg.telnyx_api_key:
        log.warning("TELNYX_API_KEY not set: transfers and hang-ups cannot be sent to the carrier")

    log.info("loading speech model (%s, %s)...", cfg.stt_model, cfg.stt_compute)
    await asyncio.to_thread(stt.load)  # warm up so the first call is not slow
    slots = asyncio.Semaphore(cfg.max_concurrent_calls)

    async def handler(ws) -> None:
        if slots.locked():
            log.warning("at capacity: refusing stream")
            await ws.close(1013, "busy")
            return
        async with slots:
            await CallSession(ws, cfg, app, stt, tts, carrier).run()

    def health(_connection, request):
        if request.path == "/healthz":
            return Response(200, "OK", websockets.Headers([("Content-Type", "text/plain")]), b"ok\n")
        return None

    async with websockets.serve(handler, cfg.host, cfg.port, process_request=health, max_size=2**20, ping_interval=20):
        log.info("voice worker listening on %s:%s (max %s concurrent calls)", cfg.host, cfg.port, cfg.max_concurrent_calls)
        await asyncio.Future()
