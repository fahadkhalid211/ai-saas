import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/security/auth';
import { getClientIp } from '@/lib/security/rate-limit';
import { runWithLogContext, type LogContext } from './context';
import { logEvent } from './logger';
import { safePath } from './redact';

export interface LoggedOptions {
  /** The route pattern, for example "/api/assistants/[id]". Used to group requests in the viewer. */
  route: string;
  /**
   * Fraction (0..1) of SUCCESSFUL requests to record. Failures (status 400 and above) and exceptions are always recorded.
   * Use it only for high-volume, low-value endpoints such as widget config or dashboard polling.
   */
  sample?: number;
}

function requestIdFrom(req: Request): string {
  const supplied = req.headers.get('x-request-id');
  if (supplied && /^[A-Za-z0-9_-]{8,64}$/.test(supplied)) return supplied;
  return crypto.randomUUID();
}

function levelForStatus(status: number): 'info' | 'warn' | 'error' {
  if (status >= 500) return 'error';
  if (status >= 400) return 'warn';
  return 'info';
}

/**
 * Wraps a route handler so that every request is recorded with who made it, what it was, how it ended and how long it took,
 * and so that anything written to the log while it runs carries the same request id. The handler keeps its exact signature.
 *
 * An uncaught exception is recorded and answered with a generic 500 that includes the request id, so the master admin
 * can find the failure in the log without the caller ever seeing internals.
 */
export function logged<R extends Request, A extends unknown[]>(
  handler: (req: R, ...rest: A) => Promise<Response> | Response,
  options: LoggedOptions
): (req: R, ...rest: A) => Promise<Response> {
  return async (req: R, ...rest: A): Promise<Response> => {
    if (req.method === 'OPTIONS') return handler(req, ...rest);

    const started = performance.now();
    let url: URL | null = null;
    try {
      url = new URL(req.url);
    } catch {
      // keep going with an empty path
    }

    const ctx: LogContext = {
      requestId: requestIdFrom(req),
      method: req.method,
      route: options.route,
      path: url ? safePath(url.pathname, url.search) : undefined,
      ip: getClientIp(req),
      userAgent: (req.headers.get('user-agent') || '').slice(0, 200) || undefined,
      deployment: req.headers.get('x-vercel-id') || undefined,
    };
    try {
      const auth = await getAuthContext(req);
      if (auth.authenticated) {
        ctx.userId = auth.memberId || undefined;
        ctx.workspaceId = auth.workspaceId || undefined;
        ctx.role = auth.isMasterAdmin ? 'master' : auth.role;
      }
    } catch {
      // an unconfigured secret must not stop the request from being served (or logged)
    }

    return runWithLogContext(ctx, async () => {
      let response: Response;
      try {
        response = await handler(req, ...rest);
      } catch (error) {
        logEvent({
          level: 'error',
          category: 'request',
          event: 'http.unhandled_exception',
          status: 500,
          durationMs: performance.now() - started,
          error,
        });
        return NextResponse.json({ error: 'Internal server error', requestId: ctx.requestId }, { status: 500, headers: { 'x-request-id': ctx.requestId } });
      }

      const status = response.status;
      const sample = options.sample ?? 1;
      if (status >= 400 || sample >= 1 || Math.random() < sample) {
        logEvent({
          level: levelForStatus(status),
          category: 'request',
          event: 'http.request',
          status,
          durationMs: performance.now() - started,
          meta: { contentLength: Number(req.headers.get('content-length')) || undefined },
        });
      }
      try {
        response.headers.set('x-request-id', ctx.requestId);
      } catch {
        // immutable response (for example Response.redirect): leave it as is
      }
      return response;
    });
  };
}
