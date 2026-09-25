import { tokenFor } from '@/lib/security/test-session';
import { describe, it, expect } from 'vitest';
import {
  getAdminKey,
  generateSessionToken,
  verifySessionToken,
  verifyAdminRequest,
  withAdminAuth,
  getSessionPayload,
  getAuthContext,
} from './auth';

describe('Security Auth Module', () => {
  it('should return a non-empty admin key', () => {
    const key = getAdminKey();
    expect(key).toBeDefined();
    expect(typeof key).toBe('string');
    expect(key.length).toBeGreaterThan(5);
  });

  it('should generate and verify a valid session token', () => {
    const token = generateSessionToken('admin', 'user-123');
    expect(token).toContain('.');
    const isValid = verifySessionToken(token);
    expect(isValid).toBe(true);
  });

  it('should reject invalid or tampered tokens', () => {
    expect(verifySessionToken('')).toBe(false);
    expect(verifySessionToken('invalid-token')).toBe(false);
    expect(verifySessionToken('part1.part2.part3')).toBe(false);

    const validToken = generateSessionToken('admin', 'user-123');
    const [payload, sig] = validToken.split('.');
    const tampered = `${payload}.${sig.slice(0, -2)}aa`;
    expect(verifySessionToken(tampered)).toBe(false);
  });

  it('should verify admin request via Authorization header with master key', async () => {
    const masterKey = getAdminKey();
    const req = new Request('http://localhost/api/test', {
      headers: { authorization: `Bearer ${masterKey}` },
    });
    const isAuthed = await verifyAdminRequest(req);
    expect(isAuthed).toBe(true);
  });

  it('should verify admin request via cookie header', async () => {
    const token = generateSessionToken('admin');
    const req = new Request('http://localhost/api/test', {
      headers: { cookie: `kortex_admin_session=${token}; other=123` },
    });
    const isAuthed = await verifyAdminRequest(req);
    expect(isAuthed).toBe(true);
  });

  it('should reject unauthorized requests', async () => {
    const req = new Request('http://localhost/api/test');
    const isAuthed = await verifyAdminRequest(req);
    expect(isAuthed).toBe(false);
  });

  it('withAdminAuth should return 401 for unauthenticated requests and 200 for valid ones', async () => {
    const handler = withAdminAuth(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));

    const unauthedReq = new Request('http://localhost/api/test');
    const unauthedRes = await handler(unauthedReq, {});
    expect(unauthedRes.status).toBe(401);

    const masterKey = getAdminKey();
    const authedReq = new Request('http://localhost/api/test', {
      headers: { authorization: `Bearer ${masterKey}` },
    });
    const authedRes = await handler(authedReq, {});
    expect(authedRes.status).toBe(200);
  });

  it('should embed workspaceId in session tokens and extract it via getSessionPayload', () => {
    const token = generateSessionToken('owner', 'user-456', 'ws-tenant-789');
    expect(verifySessionToken(token)).toBe(true);

    const payload = getSessionPayload(token);
    expect(payload).toBeDefined();
    expect(payload?.role).toBe('owner');
    expect(payload?.memberId).toBe('user-456');
    expect(payload?.workspaceId).toBe('ws-tenant-789');
  });

  it('getAuthContext should resolve authenticated context with workspaceId', async () => {
    const token = await tokenFor('admin', 'staff-99', 'ws-corp-1');
    const req = new Request('http://localhost/api/test', {
      headers: { authorization: `Bearer ${token}` },
    });
    const ctx = await getAuthContext(req);
    expect(ctx.authenticated).toBe(true);
    expect(ctx.role).toBe('admin');
    expect(ctx.memberId).toBe('staff-99');
    expect(ctx.workspaceId).toBe('ws-corp-1');
  });
});
