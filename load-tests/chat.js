/**
 * load-tests/chat.js
 * ─────────────────────────────────────────────────────────
 * Full chat flow: create conversation → send message → read SSE response.
 * This is the heaviest test — it exercises the AI backend.
 *
 * Usage:
 *   k6 run load-tests/chat.js
 *   k6 run --env BASE_URL=https://your-app.com --env ASSISTANT_ID=xxx load-tests/chat.js
 *   k6 run --out cloud load-tests/chat.js          # stream to Grafana Cloud
 *   k6 run --out influxdb=http://localhost:8086/k6 load-tests/chat.js  # local Grafana
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const BASE_URL     = __ENV.BASE_URL     || 'http://localhost:3000';
const ASSISTANT_ID = __ENV.ASSISTANT_ID || 'YOUR_ASSISTANT_ID';

// Custom metrics
const chatErrors      = new Rate('chat_errors');
const chatBodyBytes   = new Counter('chat_response_bytes');
const convCreateTime  = new Trend('conv_create_duration', true);
const chatStreamTime  = new Trend('chat_stream_duration', true);

// Sample prompts — rotated so all VUs don't send identical requests
const PROMPTS = [
  'What services do you offer?',
  'How do I get started?',
  'Can you help me with pricing?',
  'What are your support hours?',
  'How do I contact a human agent?',
  'Tell me about your features.',
  'What integrations do you support?',
  'How secure is my data?',
];

export const options = {
  stages: [
    { duration: '30s', target: 5  },   // gentle ramp — AI calls are expensive
    { duration: '1m',  target: 10 },   // hold at 10 concurrent users
    { duration: '30s', target: 20 },   // push to 20
    { duration: '30s', target: 0  },   // cool-down
  ],
  thresholds: {
    // AI responses can be slow — set realistic thresholds
    http_req_duration:   ['p(95)<15000'],   // 95% under 15 s (includes LLM time)
    chat_stream_duration:['p(95)<15000'],
    chat_errors:         ['rate<0.05'],     // under 5% error rate
  },
};

export default function () {
  const prompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];

  // ── Step 1: Create a conversation ───────────────────────────
  const createStart = Date.now();
  const createRes = http.post(
    `${BASE_URL}/api/conversations`,
    JSON.stringify({ assistantId: ASSISTANT_ID }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  convCreateTime.add(Date.now() - createStart);

  let convId, token;
  const createOk = check(createRes, {
    'create conv 200': (r) => r.status === 200,
    'has convId':      (r) => {
      try {
        const b = JSON.parse(r.body);
        convId = b.conversationId;
        token  = b.token;
        return !!convId;
      } catch { return false; }
    },
  });

  if (!createOk) {
    chatErrors.add(1);
    return;
  }

  sleep(0.5);

  // ── Step 2: Send a chat message ──────────────────────────────
  const chatStart = Date.now();
  const chatRes = http.post(
    `${BASE_URL}/api/chat`,
    JSON.stringify({
      message: prompt,
      conversationId: convId,
      assistantId: ASSISTANT_ID,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      timeout: '45s',
      tags: { endpoint: 'chat' },
    },
  );
  chatStreamTime.add(Date.now() - chatStart);

  const chatOk = check(chatRes, {
    'chat 200':         (r) => r.status === 200,
    'chat has content': (r) => r.body.length > 20,
  });

  chatErrors.add(!chatOk);
  if (chatOk) chatBodyBytes.add(chatRes.body.length);

  // Simulate a user reading the response (2–5 s think time)
  sleep(2 + Math.random() * 3);
}
