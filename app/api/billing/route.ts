import { NextResponse } from 'next/server';
import { Database, InvoiceRecord } from '@/lib/db';
import { BILLING_PLANS } from '@/lib/billing/plans';
import { withAdminAuth, withRoleAuth, getAuthContext } from '@/lib/security/auth';
import { getClientIp } from '@/lib/security/rate-limit';
import { validateEmail, sanitizeInput } from '@/lib/security/validation';
import { logged } from '@/lib/logging/route';
import { trialInfo } from '@/lib/billing/trial';
import { isStripeConfigured } from '@/lib/billing/stripe';
import { earlyBirdAvailableFor, paymentsAvailable } from '@/lib/billing/early-bird';

const GETHandler = withAdminAuth(async (req: Request) => {
  try {
    const ctx = await getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const queryWs = searchParams.get('workspaceId');
    const targetWsId = ctx.isMasterAdmin && queryWs ? queryWs : (ctx.workspaceId && ctx.workspaceId !== '*' ? ctx.workspaceId : 'default-workspace');

    const ws = await Database.getWorkspaceBilling(targetWsId);
    // Chats used in the current billing period: one COUNT
    const chatsUsed = await Database.countConversationsInPeriod(targetWsId, ws.currentPeriodStart, ws.currentPeriodEnd);
    const chatLimit = ws.monthlyChatLimit || 100;
    const remainingChats = Math.max(0, chatLimit - chatsUsed);
    const percentUsed = Math.min(100, Math.round((chatsUsed / chatLimit) * 100));

    const overagesCount = Math.max(0, chatsUsed - chatLimit);
    const overageCost = (overagesCount * (ws.overageRatePerChat || 0.50)).toFixed(2);

    const estimatedHoursSaved = (chatsUsed * 0.3).toFixed(1);
    const estimatedDollarSavings = Math.round(Number(estimatedHoursSaved) * 20);

    const storageUsage = await Database.getWorkspaceKnowledgeStorage(ws.id || targetWsId);
    const currentPlan = BILLING_PLANS.find((p) => p.id === ws.planId) || BILLING_PLANS[0];
    const storageLimitMb = currentPlan.knowledgeStorageLimitMb;
    const storageLimitBytes = storageLimitMb * 1024 * 1024;
    const storagePercentUsed = Math.min(100, Math.round((storageUsage.totalBytes / storageLimitBytes) * 100));

    return NextResponse.json({
      workspaceId: ws.id,
      name: ws.name,
      trial: trialInfo(ws),
      payments: { available: paymentsAvailable() },
      earlyBird: { available: earlyBirdAvailableFor(ws), active: Boolean(ws.earlyBird) },
      subscription: {
        // what the card is charged, and when: the end of the trial while trialing, otherwise the next renewal
        nextChargeAmount: ws.billingInterval === 'annual' ? currentPlan.annualMonthlyPrice * 12 : currentPlan.monthlyPrice,
        nextChargeDate: trialInfo(ws).endsAt || ws.currentPeriodEnd,
        cancelAtPeriodEnd: Boolean(ws.cancelAtPeriodEnd),
        hasStripeCustomer: Boolean(ws.stripeCustomerId),
      },
      planId: ws.planId,
      planName: ws.planName,
      billingInterval: ws.billingInterval,
      monthlyChatLimit: chatLimit,
      overageRatePerChat: ws.overageRatePerChat,
      chatsUsed,
      remainingChats,
      percentUsed,
      overagesCount,
      overageCost: parseFloat(overageCost),
      currentPeriodStart: ws.currentPeriodStart,
      currentPeriodEnd: ws.currentPeriodEnd,
      estimatedHoursSaved: parseFloat(estimatedHoursSaved),
      estimatedDollarSavings,
      knowledgeStorage: {
        usedBytes: storageUsage.totalBytes,
        usedMb: storageUsage.totalMb,
        limitMb: storageLimitMb,
        percentUsed: storagePercentUsed,
      },
      paymentMethod: ws.paymentMethod || null,
      billingEmail: ws.billingEmail || 'billing@crescelo.com',
      invoices: ws.invoices || [],
      plans: BILLING_PLANS,
    });
  } catch (error: any) {
    console.error('Error fetching billing data:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch billing data' }, { status: 500 });
  }
});

const POSTHandler = withRoleAuth(['owner', 'admin', 'billing_manager'], async (req: Request) => {
  try {
    const ctx = await getAuthContext(req);
    const body = await req.json();
    const { action, planId, billingInterval } = body;
    const targetWsId = ctx.isMasterAdmin && body.workspaceId
      ? body.workspaceId
      : (ctx.workspaceId && ctx.workspaceId !== '*' ? ctx.workspaceId : 'default-workspace');

    if (action === 'change_plan') {
      // With Stripe connected a plan is only ever set by a paid checkout (webhook). This direct route would otherwise let any
      // workspace owner give themselves a paid plan for free, and would sidestep the end of the trial.
      if (isStripeConfigured() && !ctx.isMasterAdmin) {
        return NextResponse.json({ error: 'Plans are changed through checkout. Use "Choose plan" to subscribe.' }, { status: 400 });
      }
      const targetPlan = BILLING_PLANS.find((p) => p.id === planId);
      if (!targetPlan) {
        return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
      }

      const ws = await Database.getWorkspaceBilling(targetWsId);
      const interval = billingInterval === 'annual' ? 'annual' : 'monthly';
      const amount = interval === 'annual' ? targetPlan.annualMonthlyPrice * 12 : targetPlan.monthlyPrice;

      const newInvoice: InvoiceRecord = {
        id: 'inv_' + Math.random().toString(36).substring(2, 9),
        date: new Date().toISOString().split('T')[0],
        planName: `${targetPlan.name} (${interval === 'annual' ? 'Annual - ' : ''}${targetPlan.chatSessionsLimit} Chats / mo)`,
        amount,
        status: 'paid',
      };

      const updatedInvoices = [newInvoice, ...(ws.invoices || [])];

      const updated = await Database.updateWorkspaceBilling(targetWsId, {
        planId: targetPlan.id,
        planName: targetPlan.name,
        billingInterval: interval,
        monthlyChatLimit: targetPlan.chatSessionsLimit,
        overageRatePerChat: targetPlan.overageRate,
        landingPageLimit: targetPlan.landingPageLimit,
        invoices: updatedInvoices,
      });

      await Database.addAuditLog({
        workspaceId: targetWsId,
        actor: {
          id: ctx.memberId,
          name: ctx.role === 'owner' ? 'Workspace Owner' : 'Billing Manager',
          ip: getClientIp(req),
        },
        action: 'billing.plan_changed',
        targetType: 'workspace_billing',
        targetId: targetWsId,
        details: {
          newPlanId: targetPlan.id,
          newPlanName: targetPlan.name,
          interval,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Successfully changed plan to ${targetPlan.name}`,
        plan: updated,
      });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating billing plan:', error);
    return NextResponse.json({ error: error.message || 'Failed to update billing' }, { status: 500 });
  }
});

const PATCHHandler = withRoleAuth(['owner', 'admin', 'billing_manager'], async (req: Request) => {
  try {
    const ctx = await getAuthContext(req);
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
    }

    const { paymentMethod, billingEmail } = body;
    const targetWsId = ctx.isMasterAdmin && body.workspaceId
      ? body.workspaceId
      : (ctx.workspaceId && ctx.workspaceId !== '*' ? ctx.workspaceId : 'default-workspace');

    const updates: any = {};

    // Card details are never accepted from the browser: the real card comes from Stripe through the webhook, and it is changed
    // in Stripe's billing portal. (A hand-typed "card" would fake a payment method.)
    if (paymentMethod !== undefined) {
      return NextResponse.json({ error: 'Card details are managed by Stripe. Use "Cancel or manage" to update your card.' }, { status: 400 });
    }
    if (false as boolean) {
      if (!paymentMethod || typeof paymentMethod !== 'object' || Array.isArray(paymentMethod)) {
        return NextResponse.json({ error: 'paymentMethod must be a valid JSON object' }, { status: 400 });
      }

      const { brand, last4, expMonth, expYear } = paymentMethod;

      if (!last4 || typeof last4 !== 'string' || !/^\d{4}$/.test(last4.trim())) {
        return NextResponse.json(
          { error: 'Card last4 must be exactly 4 numeric digits' },
          { status: 400 }
        );
      }

      const currentYear = new Date().getFullYear();
      const numMonth = Number(expMonth);
      const numYear = Number(expYear);

      if (!Number.isInteger(numMonth) || numMonth < 1 || numMonth > 12) {
        return NextResponse.json(
          { error: 'Card expMonth must be an integer between 1 and 12' },
          { status: 400 }
        );
      }

      if (!Number.isInteger(numYear) || numYear < currentYear || numYear > currentYear + 25) {
        return NextResponse.json(
          { error: `Card expYear must be an integer between ${currentYear} and ${currentYear + 25}` },
          { status: 400 }
        );
      }

      const cleanBrand = typeof brand === 'string' ? sanitizeInput(brand).slice(0, 30) : 'Visa';

      updates.paymentMethod = {
        brand: cleanBrand || 'Visa',
        last4: last4.trim(),
        expMonth: numMonth,
        expYear: numYear,
      };
    }

    if (billingEmail !== undefined) {
      const emailCheck = validateEmail(billingEmail);
      if (!emailCheck.valid || !emailCheck.value) {
        return NextResponse.json(
          { error: emailCheck.error || 'Invalid billing email address' },
          { status: 400 }
        );
      }
      updates.billingEmail = emailCheck.value;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid update fields provided' }, { status: 400 });
    }

    const updated = await Database.updateWorkspaceBilling(targetWsId, updates);

    await Database.addAuditLog({
      workspaceId: targetWsId,
      actor: {
        id: ctx.memberId,
        name: ctx.role === 'owner' ? 'Workspace Owner' : 'Billing Manager',
        ip: getClientIp(req),
      },
      action: 'billing.info_updated',
      targetType: 'workspace_billing',
      targetId: targetWsId,
      details: {
        hasPaymentMethod: Boolean(paymentMethod),
        billingEmail: updates.billingEmail,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment method and billing info updated successfully',
      billing: updated,
    });
  } catch (error: any) {
    console.error('Error updating payment info:', error);
    return NextResponse.json({ error: error.message || 'Failed to update payment info' }, { status: 500 });
  }
});

export const GET = logged(GETHandler, { route: '/api/billing' });
export const POST = logged(POSTHandler, { route: '/api/billing' });
export const PATCH = logged(PATCHHandler, { route: '/api/billing' });
