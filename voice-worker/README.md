# Kortex voice worker

Answers inbound phone calls with the Kortex assistant and books appointments. This service only handles
**audio** (voice detection, speech-to-text, text-to-speech, interruptions). All business logic (knowledge answers,
booking, leads, call log) stays in the Next.js app under `/api/voice/*`, so calls behave like web chat.

```
Caller -> Telnyx number -> TeXML webhook (/api/channels/voice) -> wss media stream -> this worker
                                                                          |  HTTPS + HMAC
                                                                          v
                                                        /api/voice/session | turn | end  (Next.js)
```

Running cost: the carrier number (about $1-2 a month) plus carrier per-minute fees. Speech runs locally on CPU
(faster-whisper, Piper), and the language model is the assistant's own configured provider. Confirm current carrier
prices for your countries before quoting customers.

## Setup

1. **Server.** One small always-on Linux machine with Docker (Oracle Cloud Always Free ARM, or a ~$5 VPS). Point a DNS
   name at it (`voice.example.com`). Open ports 80 and 443 only.
2. **Secrets.** In the app's environment set `VOICE_WORKER_SECRET` (`openssl rand -hex 32`), `VOICE_WEBHOOK_SECRET`,
   and `VOICE_STREAM_URL=wss://voice.example.com/` (the URL Caddy serves). Copy `.env.example` to `.env` here and
   use the same `VOICE_WORKER_SECRET`.
3. **Start.**
   ```
   docker compose up -d --build
   docker compose run --rm worker sh scripts/download-voice.sh en_US-lessac-medium
   docker compose restart worker
   curl https://voice.example.com/healthz     # -> ok
   ```
   The first start downloads the Whisper model into the `models` volume.
4. **Telnyx.** Buy a local number. Create a **TeXML application** whose voice webhook URL is
   `https://YOUR-APP/api/channels/voice?k=<VOICE_WEBHOOK_SECRET>` (POST), and assign the number to it. Set the
   application's *failover* URL/number to the business owner's phone so calls still ring a person if the app is
   unreachable. Copy the API key and TeXML account SID into `.env` (needed to transfer or hang up).
5. **Assign the number.** In the dashboard, the platform admin enters the number (E.164) on the assistant's Phone
   settings. Tenants cannot assign numbers. Enable the phone channel and set the transfer number, greeting and
   opening hours behaviour.
6. **Test.** Call the number. Expect the AI-assistant greeting, a knowledge answer, an interruption, and a booking
   that appears under Appointments and Leads.

## Things to verify on your first real call

These parts follow vendor documentation but could not be exercised against a live carrier in development:

- Telnyx TeXML `<Connect><Stream ... bidirectionalMode="rtp">` and the custom `<Parameter>` names arriving in the
  `start` event (`start.custom_parameters`). The worker also accepts `customParameters`.
- The carrier "update call" request for transfer and hang-up (`worker/carrier.py`): confirm the endpoint, body format
  and account SID against Telnyx's current docs.
- Your installed `piper-tts` version's synthesis API (`worker/speech.py` handles the 1.2 and 1.3 call styles).
- The installed `websockets` version's `process_request` signature (`worker/server.py`, health endpoint).

## Capacity

Whisper `small` int8 on 4 CPU cores handles roughly 3 to 5 simultaneous calls. `MAX_CONCURRENT_CALLS` refuses
streams beyond that. Add workers for more, or use a smaller `STT_MODEL` (`base`) for lower latency. Latency target
from the caller finishing a sentence to the first spoken word is about 1.5 seconds; measure it on your hardware.

## Tests

```
python -m venv .venv && . .venv/bin/activate
pip install -r requirements-dev.txt
pytest
```

The tests use fake speech models, a fake carrier socket and a fake app, and include signing vectors produced by the
TypeScript implementation so the two sides stay compatible.
