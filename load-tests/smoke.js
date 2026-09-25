/**
 * load-tests/smoke.js
 * ─────────────────────────────────────────────────────────
 * Smoke test — 1 VU, short duration.
 * Run this first to confirm all endpoints are reachable
 * before kicking off a full load test.
 *
 * Usage:
 *   k6 run load-tests/smoke.js
 *   k6 run --env BASE_URL=https://your-app.com --env ASSISTANT_ID=xxx load-tests/smoke.js
 */
import http from 'k6/http';
import { check, group } from 'k6';

const BASE_URL    = __ENV.BASE_URL    || 'http://localhost:3000';
const ASSISTANT_ID = __ENV.ASSISTANT_ID || 'YOUR_ASSISTANT_ID';

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    // Every single check must pass in a smoke test
    checks: ['rate==1.0'],
    http_req_failed: ['rate==0'],
  },
};

export default function () {
  // ── 1. Widget config ─────────────────────────────────────────
  group('Widget config endpoint', () => {
    const res = http.get(`${BASE_URL}/api/widget?assistantId=${ASSISTANT_ID}`);
    check(res, {
      'widget config status 200': (r) => r.status === 200,
      'widget config has name':   (r) => {
        try { return JSON.parse(r.body).name !== undefined; } catch { return false; }
      },
    });
  });

  // ── 2. Create conversation ───────────────────────────────────
  let convId, token;
  group('Create conversation', () => {
    const res = http.post(
      `${BASE_URL}/api/conversations`,
      JSON.stringify({ assistantId: ASSISTANT_ID }),
      { headers: { 'Content-Type': 'application/json' } },
    );
    check(res, {
      'create conversation 200': (r) => r.status === 200,
      'has conversationId':      (r) => {
        try {
          const b = JSON.parse(r.body);
          convId = b.conversationId;
          token  = b.token;
          return !!convId;
        } catch { return false; }
      },
    });
  });

  if (!convId) {
    console.error('Cannot continue smoke test — no conversationId returned');
    return;
  }

  // ── 3. Poll conversations (live-agent polling endpoint) ──────
  group('Poll conversations', () => {
    const res = http.get(
      `${BASE_URL}/api/conversations?conversationId=${convId}&sinceCount=0`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    check(res, {
      'poll conversations 200': (r) => r.status === 200,
    });
  });

  // ── 4. Send a chat message ───────────────────────────────────
  group('Chat message', () => {
    const res = http.post(
      `${BASE_URL}/api/chat`,
      JSON.stringify({
        message: 'Hello, smoke test',
        conversationId: convId,
        assistantId: ASSISTANT_ID,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        timeout: '30s',
      },
    );
    check(res, {
      'chat 200':      (r) => r.status === 200,
      'chat has body': (r) => r.body.length > 10,
    });
  });
}
