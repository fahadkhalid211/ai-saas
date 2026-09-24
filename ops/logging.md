# System log (master admin only)

Where: dashboard → **System Logs** (only shown when you are signed in through `/master`). The API behind it answers
anonymous callers with 401 and every customer, including workspace owners, with 404.

## What is recorded
- **Every API request**: time, route, status, duration, user id, workspace, role, IP, browser, and a `request id`
  (also sent back to the caller as the `x-request-id` header, and shown on 500 errors, so a customer can quote it to you).
- **Events**: sign-ins (success, failure, lockout), master logins, OAuth, rate-limit hits, blocked cross-site requests,
  bad webhook signatures (Stripe, WhatsApp, Telegram, voice), bookings and slot conflicts, model calls (provider, model,
  time, failure; never the text), outbound webhooks, cron runs, slow or failing database calls, audit-trail actions.
- **Errors**: uncaught exceptions in any API route, page-render errors, everything the server prints with
  `console.error` / `console.warn`, and errors from visitors' browsers (uncaught errors and React error boundaries).
- **Never stored**: passwords, tokens, API keys, cookies, request bodies, chat or form text. Secrets that slip into an
  error message are masked before saving. Query-string values are dropped from paths.

## Using it
- **Find a problem**: filter by level `error`, or open **Error groups** (same failure grouped, with counts and first/last seen).
- **Follow one request**: expand a row → **Trace this request** shows every event with that request id, in order.
- **Follow one person**: **Only this user** / **Only this workspace**. A customer says "it broke at 3pm"? Filter by their
  user id and the time.
- **Live**: **Go live** refreshes every 5 seconds.
- **Export**: CSV or JSON, up to 50,000 rows, of whatever the filters currently show.

## Alerts
An e-mail goes to the master address when 10 or more errors happen within 5 minutes, or a new kind of error appears in
sign-in, database or security, at most once every 30 minutes. It needs e-mail sending to be configured (Resend or SMTP).
Turn off with `LOG_ALERTS=false`; tune with `LOG_ALERT_THRESHOLD`, `LOG_ALERT_WINDOW_MIN`, `LOG_ALERT_COOLDOWN_MIN`.

## Retention and size
Rows older than `LOG_RETENTION_DAYS` (default 30) are deleted by a daily Vercel cron (`/api/cron/log-retention`, 03:00 UTC).
**Set `CRON_SECRET` in Vercel**: Vercel sends it as the cron's bearer token; without it the job answers 401 and nothing is deleted.
Check size any time with `npm run db:verify` (line "system log"). Storage is created automatically on the first event; the SQL is in
`supabase/schema-logs-v1.sql` (also applied by `npm run db:schema`).

## Limits
- The phone worker (Python) logs nothing by itself yet; calls appear through the app's `/api/voice/*` requests and call-end events.
- Logging can never slow or break a request: writes happen after the response, in batches, and pause for 60 seconds if the database
  is unreachable (errors still go to the host's own logs). Measured cost inside a request: about 0.06 ms.
- Logs contain IP addresses and user ids. Keep the database hardening in `ops/postgres-harden.md` (TLS, limited login) in place.
