/**
 * load-tests/widget.js
 * ─────────────────────────────────────────────────────────
 * Simulates site visitors fetching the widget config.
 * This is the highest-volume public endpoint — every page
 * load on a customer's website hits it.
 *
 * Usage:
 *   k6 run load-tests/widget.js
 *   k6 run --env BASE_URL=https://your-app.com --env ASSISTANT_ID=xxx load-tests/widget.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL     = __ENV.BASE_URL     || 'http://localhost:3000';
const ASSISTANT_ID = __ENV.ASSISTANT_ID || 'YOUR_ASSISTANT_ID';

// Custom metrics
const errorRate     = new Rate('widget_errors');
const widgetLatency = new Trend('widget_latency', true);

export const options = {
  stages: [
    { duration: '20s', target: 20  },  // ramp: 20 concurrent visitors
    { duration: '1m',  target: 50  },  // ramp: peak traffic (50 visitors)
    { duration: '30s', target: 100 },  // stress: 100 concurrent
    { duration: '20s', target: 0   },  // cool-down
  ],
  thresholds: {
    // Widget config must be fast — it blocks chat widget render
    http_req_duration:    ['p(95)<500', 'p(99)<1000'],
    widget_errors:        ['rate<0.01'],
    widget_latency:       ['p(95)<500'],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/api/widget?assistantId=${ASSISTANT_ID}`, {
    tags: { endpoint: 'widget-config' },
  });

  widgetLatency.add(res.timings.duration);

  const ok = check(res, {
    'widget 200':      (r) => r.status === 200,
    'widget has data': (r) => {
      try { return !!JSON.parse(r.body).name; } catch { return false; }
    },
  });

  errorRate.add(!ok);

  // Simulate a visitor reading the page for 1–3 seconds before next action
  sleep(1 + Math.random() * 2);
}
