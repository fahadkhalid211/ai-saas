import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit, getClientIp } from './lib/security/rate-limit';
import { logEvent } from './lib/logging/logger';
import { decideRoute } from './lib/i18n/routing';
import { LOCALE_COOKIE } from './lib/i18n/config';
import translatedBlog from './lib/i18n/blog-manifest.json';

interface RouteLimitConfig {
  prefix: string;
  windowMs: number;
  max: number;
}

const ROUTE_RATE_LIMITS: RouteLimitConfig[] = [
  { prefix: '/api/auth', windowMs: 60 * 1000, max: 15 },
  { prefix: '/api/master', windowMs: 60 * 1000, max: 60 }, // sign-in has its own stricter limit (5/min) in the route
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

/** Called by other services (signed or secret-protected) or by the visitor's own page, so a browser Origin check does not apply. */
const NO_ORIGIN_CHECK = ['/api/billing/webhook', '/api/channels/', '/api/voice/', '/api/csp-report', '/api/log/client', '/api/cron/', '/api/support/contact'];

/** Largest request body accepted, by content-length. File uploads and chat attachments are allowed more. */
const MAX_BODY_BYTES = 1_000_000;
const LARGE_BODY_ROUTES: { prefix: string; max: number }[] = [
  { prefix: '/api/knowledge/upload', max: 50_000_000 },
  { prefix: '/api/knowledge/extract', max: 50_000_000 },
  { prefix: '/api/chat', max: 8_000_000 },
  { prefix: '/api/playground/sources', max: 6_000_000 },
];
function bodyTooLarge(request: NextRequest, pathname: string): boolean {
  const m = request.method.toUpperCase();
  if (m === 'GET' || m === 'HEAD' || m === 'OPTIONS') return false;
  const declared = Number(request.headers.get('content-length'));
  if (!Number.isFinite(declared) || declared <= 0) return false;
  const limit = LARGE_BODY_ROUTES.find((r) => pathname.startsWith(r.prefix))?.max ?? MAX_BODY_BYTES;
  return declared > limit;
}

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

  // Every API mutation that a signed-in browser can make is checked. Only the endpoints that other sites or services call
  // on purpose are exempt: the widget's public API, signed webhooks, the log/report collectors and scheduled jobs.
  const exempt = PUBLIC_WIDGET_API.some((p) => pathname === p || pathname.startsWith(p + '/')) || NO_ORIGIN_CHECK.some((p) => pathname.startsWith(p));
  if (exempt && !SENSITIVE_MUTATION_ROUTES.some((route) => pathname.startsWith(route))) {
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

    if (bodyTooLarge(request, pathname)) {
      logEvent({ level: 'warn', category: 'security', event: 'security.body_too_large', ip: getClientIp(request), meta: { path: pathname, bytes: request.headers.get('content-length') } });
      return withWidgetCors(NextResponse.json({ error: 'Request body too large.' }, { status: 413 }), pathname);
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

  // Language: which version of the page this address gets (see lib/i18n/routing.ts).
  const decision = decideRoute({
    pathname,
    search: request.nextUrl.search,
    method: request.method.toUpperCase(),
    host: request.headers.get('host') || '',
    cookies: { locale: request.cookies.get(LOCALE_COOKIE)?.value },
    country: request.headers.get('x-vercel-ip-country') || request.headers.get('cf-ipcountry'),
    acceptLanguage: request.headers.get('accept-language'),
    userAgent: request.headers.get('user-agent'),
    accept: request.headers.get('accept'),
    translatedBlog: translatedBlog as Record<string, string[]>,
  });

  let response: NextResponse;
  if (decision.action === 'redirect') {
    response = NextResponse.redirect(new URL(decision.to, request.url), decision.status);
    for (const c of decision.cookies || []) {
      response.cookies.set(c.name, c.value, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
    }
    // an answer that depends on who is asking must not be cached for the next person
    if (decision.private) response.headers.set('Cache-Control', 'private, no-store');
  } else if (decision.action === 'rewrite') {
    response = NextResponse.rewrite(new URL(decision.to, request.url));
  } else {
    response = NextResponse.next();
  }
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
