/**
 * load-tests/conversations-poll.js
 * ─────────────────────────────────────────────────────────
 * Simulates many open chat widgets polling the live-agent
 * sync endpoint at realistic intervals (~3.5 s).
 *
 * The widget polls GET /api/conversations?conversationId=X&sinceCount=N
 * every 3.5 s while open. This test measures whether the server
 * can handle many concurrent polling widgets without degrading.
 *
 * Usage:
 *   k6 run load-tests/conversations-poll.js
 *   k6 run --env BASE_URL=https://your-app.com --env ASSISTANT_ID=xxx load-tests/conversations-poll.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter } from 'k6/metrics';

const BASE_URL     = __ENV.BASE_URL     || 'http://localhost:3000';
const ASSISTANT_ID = __ENV.ASSISTANT_ID || 'YOUR_ASSISTANT_ID';

const pollErrors = new Rate('poll_errors');
const pollCount  = new Counter('poll_requests_total');

export const options = {
  // Each VU represents one open chat widget
  stages: [
    { duration: '30s', target: 30  },  // 30 open widgets
    { duration: '2m',  target: 30  },  // hold for 2 min
    { duration: '30s', target: 80  },  // spike: 80 open widgets
    { duration: '30s', target: 0   },  // cool-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],  // polling must respond in <1 s
    poll_errors:       ['rate<0.01'],
  },
};

// Each VU sets up its own conversation once, then polls repeatedly
export function setup() { return {}; }

export default function () {
  // ── Step 1: create a conversation (once per VU "session") ──
  const createRes = http.post(
    `${BASE_URL}/api/conversations`,
    JSON.stringify({ assistantId: ASSISTANT_ID }),
    { headers: { 'Content-Type': 'application/json' } },
  );

  let convId, token, sinceCount = 0;
  const ok = check(createRes, {
    'conversation created': (r) => {
      try {
        const b = JSON.parse(r.body);
        convId = b.conversationId;
        token  = b.token;
        return !!convId;
      } catch { return false; }
    },
  });

  if (!ok) {
    pollErrors.add(1);
    return;
  }

  // ── Step 2: poll repeatedly, like the widget does ──────────
  // Simulate a widget open for ~35 seconds (10 polls at 3.5 s each)
  for (let i = 0; i < 10; i++) {
    const pollRes = http.get(
      `${BASE_URL}/api/conversations?conversationId=${convId}&sinceCount=${sinceCount}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        tags: { endpoint: 'poll-conversations' },
      },
    );

    pollCount.add(1);

    const pollOk = check(pollRes, {
      'poll 200':        (r) => r.status === 200,
      'poll has body':   (r) => r.body.length > 0,
    });

    pollErrors.add(!pollOk);

    if (pollOk) {
      try {
        const data = JSON.parse(pollRes.body);
        // Advance sinceCount to only fetch new messages next poll
        if (data.messages && data.messages.length > 0) {
          sinceCount = data.messages.length;
        }
      } catch { /* ignore parse errors in load test */ }
    }

    // Match the widget's 3.5 s polling interval
    sleep(3.5);
  }
}
