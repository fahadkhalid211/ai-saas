# Load Tests — Grafana k6

Load tests for the AI SaaS app using [k6](https://k6.io) (Grafana's open-source load testing tool).

## Prerequisites

### Install k6

```powershell
# Windows — Chocolatey (recommended)
choco install k6

# Windows — winget
winget install k6

# Verify
k6 version
```

> macOS: `brew install k6` · Linux: see [k6 install docs](https://grafana.com/docs/k6/latest/set-up/install-k6/)

---

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `BASE_URL` | `http://localhost:3000` | App URL to load test |
| `ASSISTANT_ID` | `YOUR_ASSISTANT_ID` | The assistant ID to use in requests |

Set them via `--env` flags or a `.env` file (k6 reads env vars from the shell automatically).

---

## Test scripts

| Script | Purpose | Typical VUs |
|---|---|---|
| `smoke.js` | Quick sanity check — 1 VU, 1 iteration | 1 |
| `widget.js` | Widget config endpoint — high-volume public fetch | 20–100 |
| `conversations-poll.js` | Live-agent polling — simulates open chat widgets | 30–80 |
| `chat.js` | Full chat flow — AI responses, most expensive | 5–20 |

---

## Running tests

### Via npm scripts (recommended)

```bash
# Set your assistant ID first
$env:ASSISTANT_ID = "your-assistant-id"

npm run test:load:smoke
npm run test:load:widget
npm run test:load:poll
npm run test:load:chat
npm run test:load          # runs all in sequence
```

### Directly with k6

```bash
# Smoke test
k6 run load-tests/smoke.js

# Widget load test against production
k6 run --env BASE_URL=https://your-app.vercel.app --env ASSISTANT_ID=xxx load-tests/widget.js

# Chat load test with higher VUs
k6 run --vus 20 --duration 2m --env ASSISTANT_ID=xxx load-tests/chat.js
```

---

## Viewing results in Grafana

### Option A — Grafana Cloud (free tier)

1. Sign up at [grafana.com/products/cloud/k6](https://grafana.com/products/cloud/k6/)
2. Get your API token from the k6 Cloud UI
3. Run:

```bash
k6 login cloud --token YOUR_TOKEN
k6 run --out cloud load-tests/chat.js
```

A live dashboard URL is printed in the terminal output.

### Option B — Local Grafana + InfluxDB

1. Start InfluxDB and Grafana (e.g. via Docker):

```bash
docker run -d -p 8086:8086 influxdb:1.8
docker run -d -p 3001:3000 grafana/grafana
```

2. Run k6 with InfluxDB output:

```bash
k6 run --out influxdb=http://localhost:8086/k6 load-tests/chat.js
```

3. In Grafana (localhost:3001), add InfluxDB as a datasource and import dashboard **ID 2587** from grafana.com.

### Option C — Summary only (no external tools)

k6 always prints a full summary table to stdout at the end of every run — no external tool needed for basic results.

---

## Reading the summary output

```
✓ chat 200.................: 100% ✓ 150 ✗ 0
✓ chat has content.........: 100% ✓ 150 ✗ 0

http_req_duration.........: avg=3.2s   min=800ms  med=2.9s   max=12s    p(90)=6s   p(95)=8s
chat_stream_duration......: avg=3.1s                                      p(95)=7.8s
chat_errors...............: 0.00% ✓ 0  ✗ 150
```

Key metrics to watch:
- **`p(95)` of `http_req_duration`** — 95% of users got a response within this time
- **`chat_errors` rate** — should stay below 5% under normal load
- **`http_req_failed`** — network-level failures (timeouts, connection refused)
