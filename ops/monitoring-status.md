# Crescelo System Monitoring & Status Platform

Production monitoring, health check engine, incident detection, and live public status platform for **Crescelo SaaS**.

- **Public Status URL:** `https://status.crescelo.com` (also accessible at `/status`)
- **Developer Console:** `/admin/monitoring` (accessible to master admins)
- **Health Check APIs:**
  - Overall health: `GET /api/health`
  - Per-service health: `GET /api/health/[service]` (e.g. `GET /api/health/database`, `GET /api/health/ai`, `GET /api/health/booking`, etc.)
  - Public status feed: `GET /api/monitoring/status`
  - Failure context API: `GET /api/monitoring/events`
  - Incident management: `POST /api/monitoring/incidents`

---

## 1. Architecture & Event Pipeline

```
Application Activity / API Routes / Background Jobs
              ↓
  lib/logging/logger.ts (onLogRow hook)
              ↓
  lib/monitoring/engine.ts (Event Normalization & Secret Redaction)
              ↓
  Sliding Window Metrics Engine (5-minute sliding window)
   • Error rates
   • Consecutive failures
   • Latency percentiles
              ↓
  Incident Detection State Machine
   • Warning threshold exceeded  → Degraded (YELLOW) + Incident Created
   • Critical threshold exceeded → Major Outage (RED) + Alert Escalated
   • Metrics normalize & probe ok → Automatic Recovery + Duration Logged
              ↓
  Persistent Store (PostgreSQL / Supabase with local resilient fallback)
   • kortex_monitor_services
   • kortex_monitor_incidents
   • kortex_monitor_timeline
   • kortex_monitor_health_checks
   • kortex_monitor_alerts
   • kortex_monitor_deployments
              ↓
  Alert Dispatcher (Email to Master Admin + Slack/Discord/Webhook)
              ↓
  Public Status Page (status.crescelo.com) & Internal Console (/admin/monitoring)
```

### Safety & Resilience
- **Never blocks user requests**: Monitoring runs asynchronously via `onLogRow` callbacks.
- **Circuit breaker**: If the monitoring database is unreachable or slow, a 30-second circuit breaker trips and state safely persists to local disk (`.data/monitoring/monitoring.json`) or memory without throwing into application code.
- **Strict secret redaction**: Passwords, API keys (`sk-*`, `gsk_*`, `AIza*`), JWT tokens, authorization headers, and database connection strings are masked before persistence.

---

## 2. Monitored Services

Crescelo monitors 11 distinct services derived directly from the application architecture:

| Service ID | Service Name | Category | Health Probe Logic |
|------------|--------------|----------|-------------------|
| `api` | API Gateway & Core Endpoints | `core` | Route latency, JSON serialization, RSS memory |
| `database` | Database & Persistence Engine | `data` | Lightweight `pingCloudDb()` probe and pool query |
| `auth` | Authentication & Session Engine | `core` | Session signature verification, secret integrity |
| `chatbot` | Chatbot & Streaming Engine | `ai` | Assistant state accessibility, streaming readiness |
| `ai` | AI / LLM Provider Gateways | `ai` | Groq, OpenAI, Anthropic, Gemini credentials and gateways |
| `booking` | Appointment & Booking System | `core` | Mutex calendar slot locking and appointment store query |
| `knowledge` | Knowledge Base & Vector Search | `data` | Embeddings store and chunk count query |
| `scraper` | Web Scraping & URL Crawler | `data` | Cheerio crawler readiness |
| `workers` | Background Workers & Cron | `infra` | Vercel cron endpoints and job schedule state |
| `notifications` | Email & Notification Dispatcher | `channels`| SMTP / Resend delivery readiness and push token store |
| `channels` | Omnichannel Webhooks & Voice | `channels`| Lemon Squeezy, WhatsApp, Telegram, Voice worker webhooks |

---

## 3. Real Health Check Endpoints

### Overall Health
```http
GET /api/health
GET /api/health?fresh=true
```

Response:
```json
{
  "status": "operational",
  "timestamp": "2026-09-28T21:50:00.000Z",
  "activeIncidentsCount": 0,
  "services": [
    {
      "id": "api",
      "name": "API Gateway & Core Endpoints",
      "status": "operational",
      "latencyMs": 8,
      "lastCheckedAt": "2026-09-28T21:49:58.000Z",
      "uptime30d": 99.98
    },
    {
      "id": "database",
      "name": "Database & Persistence Engine",
      "status": "operational",
      "latencyMs": 14,
      "lastCheckedAt": "2026-09-28T21:49:58.000Z",
      "uptime30d": 99.99
    }
  ]
}
```

HTTP Status Codes:
- `200 OK`: Operational or Degraded
- `503 Service Unavailable`: Major Outage on any critical service

### Individual Service Probe
```http
GET /api/health/database
GET /api/health/ai
GET /api/health/booking
```

---

## 4. Incident Detection & Auto-Recovery

### Thresholds (Configurable)
- **Error Rate Warning (`MONITOR_ERROR_RATE_WARN`):** 5% (0.05) → Transitions to `degraded`
- **Error Rate Critical (`MONITOR_ERROR_RATE_CRIT`):** 20% (0.20) → Transitions to `outage`
- **Consecutive Failures Warning (`MONITOR_FAILURES_WARN`):** 3 consecutive errors
- **Consecutive Failures Critical (`MONITOR_FAILURES_CRIT`):** 5 consecutive errors
- **Latency Warning (`MONITOR_LATENCY_WARN_MS`):** 1,500ms
- **Latency Critical (`MONITOR_LATENCY_CRIT_MS`):** 4,000ms

### State Machine
```
[Normal] ──(threshold breached)──> [DETECTED]
                                        ↓
                                  [INVESTIGATING]
                                        ↓
                                   [IDENTIFIED]
                                        ↓
                                   [MONITORING]
                                        ↓
                                    [RESOLVED] (Auto or Manual)
```

### Auto-Recovery
When a service with an active incident has clean health probes and its sliding-window error rate drops back to 0%:
1. Incident status automatically transitions to `resolved`.
2. `resolvedAt` timestamp is recorded.
3. Total outage duration in seconds is calculated and saved.
4. Timeline entry is appended: `"Automatic recovery detected: Error rate returned to normal (0%) and health checks succeeded."`
5. Service status returns to `operational`.
6. Recovery alert is dispatched.

---

## 5. Developer Investigation ("View Context")

When investigating an error in `/admin/monitoring`:
- Clicking **"View Context"** opens the correlation drawer.
- The engine fetches all events **±5 minutes** around the target failure.
- Events sharing the same `requestId`, `correlationId`, or `userId` are automatically linked to trace the exact sequence of events before and after the failure.

---

## 6. Deployment Correlation

When an incident is detected:
- The engine looks up recent deployments registered within the last 30 minutes.
- The incident automatically records `deploymentRef` (commit SHA and version).
- In `/admin/monitoring`, developers can compare incident start times with release times to verify whether a code change triggered the issue.

---

## 7. Production Deployment & DNS Setup for status.crescelo.com

### Step 1: DNS Configuration
Add a CNAME record at your DNS provider (Cloudflare, Namecheap, Route53, etc.):

| Type | Host / Name | Target / Value | TTL |
|------|-------------|----------------|-----|
| `CNAME` | `status` | `cname.vercel-dns.com` | Auto (or 300) |

*(If using Cloudflare, set proxy status to "DNS Only" or ensure SSL mode is Full/Strict).*

### Step 2: Vercel Domain Configuration
1. Go to **Vercel Dashboard → Crescelo Project → Settings → Domains**.
2. Add `status.crescelo.com`.
3. Vercel automatically provisions a free Let's Encrypt SSL certificate.

### Step 3: Next.js Rewrite (Already Configured)
In `next.config.ts`, incoming requests with `Host: status.crescelo.com` automatically rewrite to `/status`:
```ts
async rewrites() {
  return {
    beforeFiles: [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'status\\.crescelo\\.com' }],
        destination: '/status/:path*',
      },
    ],
  };
}
```

---

## 8. Environment Variables

Add to `.env` or Vercel Environment Variables:

```bash
# Alerting
MONITOR_WEBHOOK_URL="https://hooks.slack.com/services/..." # Optional Slack/Discord webhook
MASTER_EMAIL="admin@crescelo.com"                          # Master admin email for critical alerts

# Thresholds (Optional overrides)
MONITOR_ERROR_RATE_WARN=0.05      # 5%
MONITOR_ERROR_RATE_CRIT=0.20      # 20%
MONITOR_LATENCY_WARN_MS=1500      # 1.5 seconds
MONITOR_LATENCY_CRIT_MS=4000      # 4 seconds
MONITOR_FAILURES_WARN=3           # 3 consecutive errors
MONITOR_FAILURES_CRIT=5           # 5 consecutive errors
MONITOR_ALERT_COOLDOWN_MIN=30     # 30-minute deduplication window

# Retention (Days)
MONITOR_RAW_RETENTION_DAYS=30
MONITOR_ERRORS_RETENTION_DAYS=90
MONITOR_INCIDENTS_RETENTION_DAYS=365
```

---

## 9. Database Migration

The schema in `supabase/schema-monitoring-v1.sql` automatically applies on boot via the idempotent advisory lock in `lib/monitoring/store.ts`.

To apply manually in Supabase SQL editor:
```sql
\i supabase/schema-monitoring-v1.sql
```
