import { describe, it, expect, beforeEach } from 'vitest';
import { Database } from '../db';

describe('Referral Pending Clock & 30-Day Clearance Holding Period', () => {
  const partnerCode = `clearance_ref_${Date.now()}`;
  let partnerId = '';

  beforeEach(async () => {
    await Database.getState();
  });

  it('should initialize a partner for clearance testing', async () => {
    const partner = await Database.createReferralPartner({
      name: 'Clearance Test Partner',
      email: `${partnerCode}@partner.test`,
      phone: '+1 555 111 2222',
      referralCode: partnerCode,
      passwordHash: 'scrypt:test',
      platforms: ['youtube'],
      socialLinks: {},
      commissionPercent: 10,
      status: 'active',
    });
    expect(partner.id).toBeDefined();
    partnerId = partner.id;
  });

  it('should show pending clock during trial period and withhold withdrawable commission', async () => {
    const wsId = 'ws_trial_' + Date.now();
    const trialEndsAt = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(); // 10 days in future

    // Seed workspace
    const state = await Database.getState();
    if (!state.workspaces) state.workspaces = [];
    state.workspaces.push({
      id: wsId,
      name: 'Trial Workspace',
      planId: 'starter',
      planName: 'Starter Plan',
      billingInterval: 'monthly',
      monthlyChatLimit: 100,
      overageRatePerChat: 0.1,
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: trialEndsAt,
      trialStartedAt: new Date().toISOString(),
      trialEndsAt,
      subscriptionStatus: 'trialing',
      invoices: [],
    });

    const email = `trial_user_${Date.now()}@test.com`;
    await Database.linkWorkspaceToReferral(wsId, partnerCode, email, 'Trial User');

    const stateAfter = await Database.getState();
    const created = (stateAfter.referredCustomers || []).find((c) => c.customerEmail === email);
    expect(created).toBeDefined();

    const stats = await Database.getReferralStats(partnerId);
    expect(stats).not.toBeNull();

    const cust = stats?.customers.find((c) => c.id === created!.id);
    expect(cust).toBeDefined();
    expect(cust?.isPending).toBe(true);
    expect(cust?.status).toBe('trial');
    expect(cust?.clearanceStatus).toBe('trial');
    expect(cust?.daysRemaining).toBeGreaterThanOrEqual(9);

    // Commission should NOT be in totalEarningsToDate or pendingPayout yet
    expect(stats?.totalEarningsToDate).toBe(0);
    expect(stats?.pendingPayout).toBe(0);
  });

  it('should transition to "clearing" with pending clock after first successful card payment (within 30 days)', async () => {
    const wsId = 'ws_clearing_' + Date.now();
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();

    const state = await Database.getState();
    if (!state.workspaces) state.workspaces = [];
    state.workspaces.push({
      id: wsId,
      name: 'Clearing Workspace',
      planId: 'starter',
      planName: 'Starter Plan',
      billingInterval: 'monthly',
      monthlyChatLimit: 100,
      overageRatePerChat: 0.1,
      currentPeriodStart: fiveDaysAgo,
      currentPeriodEnd: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      subscriptionStatus: 'active',
      invoices: [
        {
          id: `inv_first_${Date.now()}`,
          date: fiveDaysAgo,
          planName: 'Starter Plan (Monthly)',
          amount: 49,
          status: 'paid',
        },
      ],
    });

    const email = `clearing_user_${Date.now()}@test.com`;
    await Database.linkWorkspaceToReferral(wsId, partnerCode, email, 'Clearing User');

    const stateAfter = await Database.getState();
    const created = (stateAfter.referredCustomers || []).find((c) => c.customerEmail === email);
    expect(created).toBeDefined();

    const stats = await Database.getReferralStats(partnerId);
    const cust = stats?.customers.find((c) => c.id === created!.id);

    expect(cust).toBeDefined();
    expect(cust?.isPending).toBe(true);
    expect(cust?.status).toBe('clearing');
    expect(cust?.clearanceStatus).toBe('clearing');
    expect(cust?.daysRemaining).toBe(25); // ~25 days remaining out of 30

    // Still withholds withdrawable commission
    expect(stats?.pendingPayout).toBe(0);
  });

  it('should unlock commission and mature to "active" after 30 days without refund', async () => {
    const wsId = 'ws_cleared_' + Date.now();
    const thirtyFiveDaysAgo = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString();

    const state = await Database.getState();
    if (!state.workspaces) state.workspaces = [];
    state.workspaces.push({
      id: wsId,
      name: 'Cleared Workspace',
      planId: 'growth',
      planName: 'Growth Plan',
      billingInterval: 'monthly',
      monthlyChatLimit: 500,
      overageRatePerChat: 0.1,
      currentPeriodStart: thirtyFiveDaysAgo,
      currentPeriodEnd: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      subscriptionStatus: 'active',
      invoices: [
        {
          id: `inv_cleared_${Date.now()}`,
          date: thirtyFiveDaysAgo,
          planName: 'Growth Plan (Monthly)',
          amount: 129,
          status: 'paid',
        },
      ],
    });

    const email = `cleared_user_${Date.now()}@test.com`;
    await Database.linkWorkspaceToReferral(wsId, partnerCode, email, 'Cleared User');

    const stateAfter = await Database.getState();
    const created = (stateAfter.referredCustomers || []).find((c) => c.customerEmail === email);
    expect(created).toBeDefined();

    const stats = await Database.getReferralStats(partnerId);
    const cust = stats?.customers.find((c) => c.id === created!.id);

    expect(cust).toBeDefined();
    expect(cust?.isPending).toBe(false);
    expect(cust?.status).toBe('active');
    expect(cust?.clearanceStatus).toBe('active');
    expect(cust?.daysRemaining).toBe(0);

    // 10% of Growth ($129) is $12.90
    expect(cust?.monthlyCommission).toBe(12.9);
    expect(stats?.totalEarningsToDate).toBe(12.9);
    expect(stats?.pendingPayout).toBe(12.9);
  });

  it('should void commission and mark "refunded" if a refund occurs during clearance', async () => {
    const wsId = 'ws_refunded_' + Date.now();
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();

    const state = await Database.getState();
    if (!state.workspaces) state.workspaces = [];
    state.workspaces.push({
      id: wsId,
      name: 'Refunded Workspace',
      planId: 'growth',
      planName: 'Growth Plan',
      billingInterval: 'monthly',
      monthlyChatLimit: 500,
      overageRatePerChat: 0.1,
      currentPeriodStart: tenDaysAgo,
      currentPeriodEnd: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      subscriptionStatus: 'active',
      hasRefunded: true,
      refundedAt: new Date().toISOString(),
      invoices: [
        {
          id: `inv_ref_${Date.now()}`,
          date: tenDaysAgo,
          planName: 'Growth Plan',
          amount: 129,
          status: 'paid',
        },
      ],
    });

    const email = `refunded_user_${Date.now()}@test.com`;
    await Database.linkWorkspaceToReferral(wsId, partnerCode, email, 'Refunded User');

    const stateAfter = await Database.getState();
    const created = (stateAfter.referredCustomers || []).find((c) => c.customerEmail === email);
    expect(created).toBeDefined();

    const stats = await Database.getReferralStats(partnerId);
    const cust = stats?.customers.find((c) => c.id === created!.id);

    expect(cust).toBeDefined();
    expect(cust?.isPending).toBe(false);
    expect(cust?.status).toBe('refunded');
    expect(cust?.monthlyCommission).toBe(0);
  });

  it('should allow admin to manually clear a referral early', async () => {
    const state = await Database.getState();
    const clearingCust = (state.referredCustomers || []).find(
      (c) => c.partnerId === partnerId && c.customerEmail.includes('clearing_user')
    );
    expect(clearingCust).toBeDefined();

    const result = await Database.manuallyClearReferralCustomer(clearingCust!.id);
    expect(result.success).toBe(true);
    expect(result.customer?.clearedManually).toBe(true);

    const stats = await Database.getReferralStats(partnerId);
    const cust = stats?.customers.find((c) => c.id === clearingCust!.id);

    expect(cust?.status).toBe('active');
    expect(cust?.isPending).toBe(false);
    expect(cust?.clearedManually).toBe(true);
  });
});
