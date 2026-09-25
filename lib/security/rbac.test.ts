import { tokenFor } from '@/lib/security/test-session';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  generateSessionToken,
  getAuthContext,
  hasRole,
  requireRole,
  withRoleAuth,
  withAdminAuth,
  getAdminKey,
} from './auth';

describe('Sprint 2: Role-Based Access Control (RBAC) & Audit Lockdown', () => {
  const masterKey = getAdminKey();

  it('hasRole should correctly evaluate permissions', () => {
    expect(hasRole('owner', ['viewer'])).toBe(true);
    expect(hasRole('admin', ['viewer'])).toBe(true);
    expect(hasRole('billing_manager', ['billing_manager'])).toBe(true);
    expect(hasRole('billing_manager', ['owner', 'admin'])).toBe(false);
    expect(hasRole('support_agent', ['support_agent'])).toBe(true);
    expect(hasRole('support_agent', ['billing_manager'])).toBe(false);
    expect(hasRole('viewer', ['viewer'])).toBe(true);
    expect(hasRole('viewer', ['support_agent', 'billing_manager', 'admin', 'owner'])).toBe(false);
  });

  it('requireRole should allow master-admin regardless of role parameter', () => {
    expect(requireRole({ role: 'viewer', isMasterAdmin: true }, ['owner', 'admin'])).toBe(true);
    expect(requireRole({ role: 'viewer', isMasterAdmin: false }, ['owner', 'admin'])).toBe(false);
    expect(requireRole({ role: 'admin', isMasterAdmin: false }, ['owner', 'admin'])).toBe(true);
  });

  it('withRoleAuth should allow authorized roles and block unauthorized roles with 403', async () => {
    const protectedAction = withRoleAuth(['owner', 'admin'], async () => {
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    });

    // 1. Viewer token -> should get 403 Forbidden
    const viewerToken = await tokenFor('viewer', 'tm_viewer_1', 'ws_test');
    const viewerReq = new Request('http://localhost:3000/api/test', {
      headers: { Authorization: `Bearer ${viewerToken}` },
    });
    const viewerRes = await protectedAction(viewerReq, {});
    expect(viewerRes.status).toBe(403);
    const viewerJson = await viewerRes.json();
    expect(viewerJson.error).toContain('Forbidden');

    // 2. Support agent token -> should get 403 Forbidden
    const supportToken = await tokenFor('support_agent', 'tm_support_1', 'ws_test');
    const supportReq = new Request('http://localhost:3000/api/test', {
      headers: { Authorization: `Bearer ${supportToken}` },
    });
    const supportRes = await protectedAction(supportReq, {});
    expect(supportRes.status).toBe(403);

    // 3. Billing manager token -> should get 403 Forbidden for admin-only action
    const billingToken = await tokenFor('billing_manager', 'tm_billing_1', 'ws_test');
    const billingReq = new Request('http://localhost:3000/api/test', {
      headers: { Authorization: `Bearer ${billingToken}` },
    });
    const billingRes = await protectedAction(billingReq, {});
    expect(billingRes.status).toBe(403);

    // 4. Admin token -> should get 200 OK
    const adminToken = await tokenFor('admin', 'tm_admin_1', 'ws_test');
    const adminReq = new Request('http://localhost:3000/api/test', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminRes = await protectedAction(adminReq, {});
    expect(adminRes.status).toBe(200);

    // 5. Owner token -> should get 200 OK
    const ownerToken = await tokenFor('owner', 'tm_owner_1', 'ws_test');
    const ownerReq = new Request('http://localhost:3000/api/test', {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    const ownerRes = await protectedAction(ownerReq, {});
    expect(ownerRes.status).toBe(200);

    // 6. Master admin key -> should get 200 OK
    const masterReq = new Request('http://localhost:3000/api/test', {
      headers: { Authorization: `Bearer ${masterKey}` },
    });
    const masterRes = await protectedAction(masterReq, {});
    expect(masterRes.status).toBe(200);
  });

  it('billing route RBAC should allow billing_manager but block viewer and support_agent', async () => {
    const billingAction = withRoleAuth(['owner', 'admin', 'billing_manager'], async () => {
      return new Response(JSON.stringify({ billingUpdated: true }), { status: 200 });
    });

    const billingToken = await tokenFor('billing_manager', 'tm_bm_1', 'ws_test');
    const req1 = new Request('http://localhost:3000/api/billing', {
      headers: { Authorization: `Bearer ${billingToken}` },
    });
    const res1 = await billingAction(req1, {});
    expect(res1.status).toBe(200);

    const viewerToken = await tokenFor('viewer', 'tm_view_1', 'ws_test');
    const req2 = new Request('http://localhost:3000/api/billing', {
      headers: { Authorization: `Bearer ${viewerToken}` },
    });
    const res2 = await billingAction(req2, {});
    expect(res2.status).toBe(403);

    const supportToken = await tokenFor('support_agent', 'tm_sup_1', 'ws_test');
    const req3 = new Request('http://localhost:3000/api/billing', {
      headers: { Authorization: `Bearer ${supportToken}` },
    });
    const res3 = await billingAction(req3, {});
    expect(res3.status).toBe(403);
  });

  it('isMasterAdmin should only be true for master-admin or wildcard master sessions', async () => {
    // 1. Direct master key
    const masterReq = new Request('http://localhost:3000/api/auth', {
      headers: { Authorization: `Bearer ${masterKey}` },
    });
    const masterCtx = await getAuthContext(masterReq);
    expect(masterCtx.authenticated).toBe(true);
    expect(masterCtx.isMasterAdmin).toBe(true);

    // 2. Master session token with isMasterAdmin flag
    const masterToken = await tokenFor('admin', 'master-admin', '*', true);
    const masterTokenReq = new Request('http://localhost:3000/api/auth', {
      headers: { Authorization: `Bearer ${masterToken}` },
    });
    const masterTokenCtx = await getAuthContext(masterTokenReq);
    expect(masterTokenCtx.authenticated).toBe(true);
    expect(masterTokenCtx.isMasterAdmin).toBe(true);

    // 3. Regular tenant owner session token -> should NOT be master admin
    const tenantOwnerToken = await tokenFor('owner', 'tm_tenant_owner_1', 'ws_custom_123');
    const tenantReq = new Request('http://localhost:3000/api/auth', {
      headers: { Authorization: `Bearer ${tenantOwnerToken}` },
    });
    const tenantCtx = await getAuthContext(tenantReq);
    expect(tenantCtx.authenticated).toBe(true);
    expect(tenantCtx.isMasterAdmin).toBe(false);

    // 4. Regular staff session token -> should NOT be master admin
    const staffToken = await tokenFor('support_agent', 'tm_staff_1', 'ws_custom_123');
    const staffReq = new Request('http://localhost:3000/api/auth', {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    const staffCtx = await getAuthContext(staffReq);
    expect(staffCtx.authenticated).toBe(true);
    expect(staffCtx.isMasterAdmin).toBe(false);
  });

  it('audit trail route should allow workspace owner and master admin, but reject all other staff roles', async () => {
    const { GET: auditHandler } = await import('../../app/api/audit/route');

    // Tenant owner -> 200 OK
    const ownerToken = await tokenFor('owner', 'tm_tenant_owner_1', 'ws_custom_123');
    const ownerReq = new Request('http://localhost:3000/api/audit', {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    const ownerRes = await auditHandler(ownerReq);
    expect(ownerRes.status).toBe(200);
    const ownerData = await ownerRes.json();
    expect(Array.isArray(ownerData.logs)).toBe(true);

    // Regular admin -> 403 Forbidden
    const adminToken = await tokenFor('admin', 'tm_admin_1', 'ws_custom_123');
    const adminReq = new Request('http://localhost:3000/api/audit', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminRes = await auditHandler(adminReq);
    expect(adminRes.status).toBe(403);
    const adminData = await adminRes.json();
    expect(adminData.error).toContain('restricted exclusively to workspace owner and master administrator');

    // Support agent -> 403 Forbidden
    const staffToken = await tokenFor('support_agent', 'tm_staff_1', 'ws_custom_123');
    const staffReq = new Request('http://localhost:3000/api/audit', {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    const staffRes = await auditHandler(staffReq);
    expect(staffRes.status).toBe(403);

    // Viewer -> 403 Forbidden
    const viewerToken = await tokenFor('viewer', 'tm_viewer_1', 'ws_custom_123');
    const viewerReq = new Request('http://localhost:3000/api/audit', {
      headers: { Authorization: `Bearer ${viewerToken}` },
    });
    const viewerRes = await auditHandler(viewerReq);
    expect(viewerRes.status).toBe(403);

    // Master admin key -> 200 OK
    const masterReq = new Request('http://localhost:3000/api/audit', {
      headers: { Authorization: `Bearer ${masterKey}` },
    });
    const masterRes = await auditHandler(masterReq);
    expect(masterRes.status).toBe(200);
    const masterData = await masterRes.json();
    expect(Array.isArray(masterData.logs)).toBe(true);
  });
});
