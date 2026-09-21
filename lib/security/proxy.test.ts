import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from '../../proxy';

describe('Server-Level Proxy, Rate Limiting & Security', () => {
  it('allows standard API requests and appends rate limit headers', () => {
    const req = new NextRequest('http://localhost:3000/api/templates', {
      method: 'GET',
      headers: {
        host: 'localhost:3000',
      },
    });

    const res = proxy(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('X-RateLimit-Limit')).toBe('60');
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
  });

  it('enforces route-specific rate limits and returns 429 when exhausted', () => {
    const path = `/api/lead?t=${Date.now()}`;
    const headers = {
      host: 'localhost:3000',
      'cf-connecting-ip': `198.51.100.${Math.floor(Math.random() * 200) + 1}`,
    };

    // Lead route has limit of 15
    for (let i = 0; i < 15; i++) {
      const req = new NextRequest(`http://localhost:3000${path}`, { headers });
      const res = proxy(req);
      expect(res.status).toBe(200);
    }

    // 16th request must be rejected with 429
    const req16 = new NextRequest(`http://localhost:3000${path}`, { headers });
    const res16 = proxy(req16);
    expect(res16.status).toBe(429);
    expect(res16.headers.get('Retry-After')).toBeDefined();
    expect(res16.headers.get('X-RateLimit-Remaining')).toBe('0');
  });

  it('blocks untrusted cross-origin mutations on sensitive management endpoints', () => {
    const req = new NextRequest('http://localhost:3000/api/assistants', {
      method: 'POST',
      headers: {
        host: 'my-saas.com',
        origin: 'https://evil-attacker.com',
      },
      body: JSON.stringify({ name: 'Hacked Assistant' }),
    });

    const res = proxy(req);
    expect(res.status).toBe(403);
  });

  it('allows same-origin mutations on sensitive management endpoints', () => {
    const req = new NextRequest('http://localhost:3000/api/assistants', {
      method: 'POST',
      headers: {
        host: 'my-saas.com',
        origin: 'https://my-saas.com',
      },
      body: JSON.stringify({ name: 'Valid Assistant' }),
    });

    const res = proxy(req);
    expect(res.status).toBe(200);
  });

  it('sends signed-out visitors from /dashboard to /login, and lets a session cookie through', () => {
    const anon = proxy(new NextRequest('http://localhost:3000/dashboard', { method: 'GET' }));
    expect(anon.status).toBe(307);
    expect(anon.headers.get('location')).toBe('http://localhost:3000/login');

    const withCookie = proxy(
      new NextRequest('http://localhost:3000/dashboard', { method: 'GET', headers: { cookie: 'kortex_admin_session=abc' } })
    );
    expect(withCookie.status).toBe(200);
    expect(withCookie.headers.get('X-Robots-Tag')).toContain('noindex');
  });

  it('applies SAMEORIGIN frame protection on regular pages', () => {
    const req = new NextRequest('http://localhost:3000/login', {
      method: 'GET',
    });

    const res = proxy(req);
    expect(res.headers.get('X-Frame-Options')).toBe('SAMEORIGIN');
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });

  it('does not apply SAMEORIGIN frame blocking on embed routes', () => {
    const req = new NextRequest('http://localhost:3000/embed/ast_123', {
      method: 'GET',
    });

    const res = proxy(req);
    expect(res.headers.get('X-Frame-Options')).toBeNull();
  });
});
