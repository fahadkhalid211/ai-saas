import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit, getClientIp } from './lib/security/rate-limit';
import { logEvent } from './lib/logging/logger';

interface RouteLimitConfig {
  prefix: string;
  windowMs: number;
  max: number;
}

const ROUTE_RATE_LIMITS: RouteLimitConfig[] = [
  { prefix: '/api/auth', windowMs: 60 * 1000, max: 15 },
  { prefix: '/api/master', windowMs: 60 * 1000, max: 10 },
  { prefix: '/api/chat', windowMs: 60 * 1000, max: 35 },
  { prefix: '/api/appointments', windowMs: 60 * 1000, max: 30 },
  { prefix: '/api/landing-page', windowMs: 60 * 1000, max: 40 },
  { prefix: '/api/templates', windowMs: 60 * 1000, max: 60 },
  { prefix: '/api/lead', windowMs: 60 * 1000, max: 15 },
  { prefix: '/api/csp-report', windowMs: 60 * 1000, max: 30 },
  { prefix: '/api/widget-events', windowMs: 60 * 1000, max: 60 },
  // Voice: all calls share the worker's / carrier's addresses, so these are per-service ceilings, not per-caller.
  // Per-caller and per-number limits are enforced inside the handlers.
  { prefix: '/api/voice', windowMs: 60 * 1000, max: 900 },
  { prefix: '/api/channels/voice', windowMs: 60 * 1000, max: 300 },
];

const DEFAULT_API_LIMIT = { windowMs: 60 * 1000, max: 120 };

const SENSITIVE_MUTATION_ROUTES = [
  '/api/assistants',
  '/api/team',
  '/api/knowledge',
  '/api/smtp',
  '/api/landing-page',
];

/** Endpoints called from customers' websites (the embedded widget): every response, errors included, must carry CORS headers,
 *  otherwise the browser reports a 429 or 500 as a misleading "blocked by CORS policy". */
const PUBLIC_WIDGET_API = ['/api/chat', '/api/lead', '/api/appointments', '/api/widget', '/api/widget-events', '/api/conversations'];

function withWidgetCors(response: NextResponse, pathname: string): NextResponse {
  if (PUBLIC_WIDGET_API.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    response.headers.set('Access-Control-Expose-Headers', 'Retry-After, X-RateLimit-Remaining');
  }
  return response;
}

function getRateLimitConfig(pathname: string): { windowMs: number; max: number; bucketKey: string } {
  for (const config of ROUTE_RATE_LIMITS) {
    if (pathname.startsWith(config.prefix)) {
      return {
        windowMs: config.windowMs,
        max: config.max,
        bucketKey: `server_rl:${config.prefix}`,
      };
    }
  }
  return {
    windowMs: DEFAULT_API_LIMIT.windowMs,
    max: DEFAULT_API_LIMIT.max,
    bucketKey: 'server_rl:api_default',
  };
}

function verifyOrigin(request: NextRequest, pathname: string): boolean {
  const method = request.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return true;
  }

  const isSensitive = SENSITIVE_MUTATION_ROUTES.some((route) => pathname.startsWith(route));
  if (!isSensitive) {
    return true;
  }

  const origin = request.headers.get('origin');
  if (!origin) {
    return true;
  }

  try {
    const originUrl = new URL(origin);
    const hostHeader = request.headers.get('host') || '';
    const hostName = hostHeader.split(':')[0].toLowerCase();
    const originHost = originUrl.hostname.toLowerCase();

    if (originHost === hostName || originHost === 'localhost' || originHost === '127.0.0.1') {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // The dashboard needs a session cookie; without one, go to sign-in. The API still verifies the
  // token itself, so this only saves a round trip.
  if ((pathname === '/dashboard' || pathname.startsWith('/dashboard/')) && !request.cookies.get('kortex_admin_session')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 1. Verify Origin / CSRF on sensitive mutation endpoints
  if (pathname.startsWith('/api/')) {
    const isWidgetApi = PUBLIC_WIDGET_API.some((p) => pathname === p || pathname.startsWith(p + '/'));

    // Handle CORS preflight OPTIONS requests directly for public widget endpoints
    if (request.method === 'OPTIONS' && isWidgetApi) {
      const preflight = new NextResponse(null, { status: 204 });
      preflight.headers.set('Access-Control-Allow-Origin', '*');
      preflight.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
      preflight.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      preflight.headers.set('Access-Control-Max-Age', '86400');
      return preflight;
    }

    const originAllowed = verifyOrigin(request, pathname);
    if (!originAllowed) {
      logEvent({ level: 'warn', category: 'security', event: 'security.csrf_blocked', ip: getClientIp(request), meta: { path: pathname, method: request.method, origin: request.headers.get('origin') } });
      return withWidgetCors(NextResponse.json(
        { error: 'Forbidden: cross-origin request blocked.' },
        { status: 403 }
      ), pathname);
    }

    // 2. Server-level Rate Limiting for API routes
    const clientIp = getClientIp(request);
    const { windowMs, max, bucketKey } = getRateLimitConfig(pathname);
    const limitResult = checkRateLimit(`${bucketKey}:${clientIp}`, { windowMs, max });

    if (!limitResult.allowed) {
      logEvent({ level: 'warn', category: 'security', event: 'security.rate_limited', ip: clientIp, meta: { limiter: 'proxy', path: pathname, max } });
      const retryAfterSec = Math.max(1, Math.ceil((limitResult.resetTime - Date.now()) / 1000));
      return withWidgetCors(NextResponse.json(
        {
          error: 'Too many requests. Please slow down and try again.',
          retryAfter: retryAfterSec,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfterSec),
            'X-RateLimit-Limit': String(max),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(limitResult.resetTime),
          },
        }
      ), pathname);
    }

    // Pass through to route handler with rate limit headers added
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', String(max));
    response.headers.set('X-RateLimit-Remaining', String(limitResult.remaining));
    response.headers.set('X-RateLimit-Reset', String(limitResult.resetTime));

    // Security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    return withWidgetCors(response, pathname);
  }

  // For non-API routes, pass through with standard security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  // only the signed-in areas refuse to be framed; public pages and /embed/ may be shown inside other sites
  if (pathname === '/master' || pathname === '/login' || pathname === '/dashboard' || /^\/(master|login|dashboard)\//.test(pathname)) {
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  }
  if (pathname === '/master' || pathname.startsWith('/dashboard')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
