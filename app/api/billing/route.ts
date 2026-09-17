import { NextResponse } from 'next/server';
import { Database, InvoiceRecord } from '@/lib/db';
import { BILLING_PLANS } from '@/lib/billing/plans';
import { withAdminAuth } from '@/lib/security/auth';

export const GET = withAdminAuth(async (req: Request) => {
  try {
    const ws = await Database.getWorkspaceBilling('default-workspace');
    const convs = await Database.getConversations();

    // Calculate chats used in current billing period
    const periodStart = new Date(ws.currentPeriodStart).getTime();
    const periodEnd = new Date(ws.currentPeriodEnd).getTime();

    const periodConvs = convs.filter((c) => {
      const cTime = new Date(c.createdAt).getTime();
      return cTime >= periodStart && cTime <= periodEnd;
    });

    const chatsUsed = periodConvs.length;
    const chatLimit = ws.monthlyChatLimit || 100;
    const remainingChats = Math.max(0, chatLimit - chatsUsed);
    const percentUsed = Math.min(100, Math.round((chatsUsed / chatLimit) * 100));

    const overagesCount = Math.max(0, chatsUsed - chatLimit);
    const overageCost = (overagesCount * (ws.overageRatePerChat || 0.50)).toFixed(2);

    const estimatedHoursSaved = (chatsUsed * 0.3).toFixed(1);
    const estimatedDollarSavings = Math.round(Number(estimatedHoursSaved) * 20);

    const storageUsage = await Database.getWorkspaceKnowledgeStorage(ws.id || 'default-workspace');
    const currentPlan = BILLING_PLANS.find((p) => p.id === ws.planId) || BILLING_PLANS[0];
    const storageLimitMb = currentPlan.knowledgeStorageLimitMb;
    const storageLimitBytes = storageLimitMb * 1024 * 1024;
    const storagePercentUsed = Math.min(100, Math.round((storageUsage.totalBytes / storageLimitBytes) * 100));

    return NextResponse.json({
      workspaceId: ws.id,
      name: ws.name,
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
      paymentMethod: ws.paymentMethod || {
        brand: 'Visa',
        last4: '4242',
        expMonth: 12,
        expYear: 2028,
      },
      billingEmail: ws.billingEmail || 'billing@kortexai.com',
      invoices: ws.invoices || [],
      plans: BILLING_PLANS,
    });
  } catch (error: any) {
    console.error('Error fetching billing data:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch billing data' }, { status: 500 });
  }
});

export const POST = withAdminAuth(async (req: Request) => {
  try {
    const body = await req.json();
    const { action, planId, billingInterval } = body;

    if (action === 'change_plan') {
      const targetPlan = BILLING_PLANS.find((p) => p.id === planId);
      if (!targetPlan) {
        return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
      }

      const ws = await Database.getWorkspaceBilling('default-workspace');
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

      const updated = await Database.updateWorkspaceBilling('default-workspace', {
        planId: targetPlan.id,
        planName: targetPlan.name,
        billingInterval: interval,
        monthlyChatLimit: targetPlan.chatSessionsLimit,
        overageRatePerChat: targetPlan.overageRate,
        invoices: updatedInvoices,
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

export const PATCH = withAdminAuth(async (req: Request) => {
  try {
    const body = await req.json();
    const { paymentMethod, billingEmail } = body;

    const updates: any = {};
    if (paymentMethod) updates.paymentMethod = paymentMethod;
    if (billingEmail) updates.billingEmail = billingEmail;

    const updated = await Database.updateWorkspaceBilling('default-workspace', updates);

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
