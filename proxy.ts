import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit, getClientIp } from './lib/security/rate-limit';

interface RouteLimitConfig {
  prefix: string;
  windowMs: number;
  max: number;
}

const ROUTE_RATE_LIMITS: RouteLimitConfig[] = [
  { prefix: '/api/auth', windowMs: 60 * 1000, max: 15 },
  { prefix: '/api/chat', windowMs: 60 * 1000, max: 35 },
  { prefix: '/api/appointments', windowMs: 60 * 1000, max: 30 },
  { prefix: '/api/landing-page', windowMs: 60 * 1000, max: 40 },
  { prefix: '/api/templates', windowMs: 60 * 1000, max: 60 },
  { prefix: '/api/lead', windowMs: 60 * 1000, max: 15 },
  { prefix: '/api/widget-events', windowMs: 60 * 1000, max: 60 },
];

const DEFAULT_API_LIMIT = { windowMs: 60 * 1000, max: 120 };

const SENSITIVE_MUTATION_ROUTES = [
  '/api/assistants',
  '/api/team',
  '/api/knowledge',
  '/api/smtp',
  '/api/landing-page',
];

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

  // 1. Verify Origin / CSRF on sensitive mutation endpoints
  if (pathname.startsWith('/api/')) {
    const originAllowed = verifyOrigin(request, pathname);
    if (!originAllowed) {
      return NextResponse.json(
        { error: 'Forbidden: cross-origin request blocked.' },
        { status: 403 }
      );
    }

    // 2. Server-level Rate Limiting for API routes
    const clientIp = getClientIp(request);
    const { windowMs, max, bucketKey } = getRateLimitConfig(pathname);
    const limitResult = checkRateLimit(`${bucketKey}:${clientIp}`, { windowMs, max });

    if (!limitResult.allowed) {
      const retryAfterSec = Math.max(1, Math.ceil((limitResult.resetTime - Date.now()) / 1000));
      return NextResponse.json(
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
      );
    }

    // Pass through to route handler with rate limit headers added
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', String(max));
    response.headers.set('X-RateLimit-Remaining', String(limitResult.remaining));
    response.headers.set('X-RateLimit-Reset', String(limitResult.resetTime));

    // Security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    return response;
  }

  // For non-API routes, pass through with standard security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (!pathname.startsWith('/embed/')) {
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  }
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
