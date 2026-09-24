/**
 * Browser-side helper: sends an error report to /api/log/client. Best effort, deduplicated and capped per page load,
 * and it never throws (a failing reporter must not cause more errors).
 */
export interface ClientErrorReport {
  kind: 'error' | 'unhandledrejection' | 'boundary';
  message: string;
  name?: string;
  stack?: string;
  source?: string;
  line?: number;
  column?: number;
  digest?: string;
}

const seen = new Set<string>();
let sent = 0;
const MAX_PER_PAGE = 10;

export function reportClientError(report: ClientErrorReport): void {
  try {
    if (typeof window === 'undefined' || typeof fetch !== 'function') return;
    if (sent >= MAX_PER_PAGE) return;
    const key = `${report.kind}|${report.message}|${report.source || ''}|${report.line || ''}`;
    if (seen.has(key)) return;
    seen.add(key);
    sent++;
    void fetch('/api/log/client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // only the path, never the query string (it may hold tokens)
      body: JSON.stringify({ ...report, page: window.location.pathname }),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // ignore
  }
}
