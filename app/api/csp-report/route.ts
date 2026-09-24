import { NextResponse } from 'next/server';
import { logged } from '@/lib/logging/route';
import { logEvent } from '@/lib/logging/logger';
import { parseCspReports } from '@/lib/security/csp';
import { enforceDistributedRateLimitByKey } from '@/lib/security/rate-limit-redis';

const MAX_BODY_BYTES = 8 * 1024;

/**
 * Receives Content Security Policy violation reports from browsers. Public by nature (browsers send it without cookies), so it
 * accepts only small bodies, records nothing but the directive, the blocked HOST and the page path, and records each distinct
 * violation only a few times an hour so a noisy page cannot fill the log.
 */
async function POSTHandler(req: Request) {
  const text = await req.text().catch(() => '');
  if (!text || text.length > MAX_BODY_BYTES) return new NextResponse(null, { status: 204 });

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  for (const v of parseCspReports(body)) {
    const limited = await enforceDistributedRateLimitByKey(`csp-report:${v.directive}:${v.blockedHost}:${v.documentPath}`, { windowMs: 60 * 60 * 1000, max: 3 });
    if (limited) continue; // already recorded enough times this hour
    logEvent({
      level: 'warn',
      category: 'security',
      event: 'security.csp_violation',
      message: `${v.directive} blocked ${v.blockedHost}`,
      meta: { directive: v.directive, blockedHost: v.blockedHost, path: v.documentPath, source: v.sourceFile },
    });
  }
  return new NextResponse(null, { status: 204 });
}

export const POST = logged(POSTHandler, { route: '/api/csp-report', sample: 0.05 });
