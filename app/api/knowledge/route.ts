import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { BILLING_PLANS } from '@/lib/billing/plans';
import { withAdminAuth, getAuthContext } from '@/lib/security/auth';

export const GET = withAdminAuth(async (req: Request) => {
  try {
    const ctx = await getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const assistantId = searchParams.get('assistantId');

    if (!assistantId) {
      return NextResponse.json({ error: 'assistantId query parameter required' }, { status: 400 });
    }

    const assistant = await Database.getAssistantById(assistantId, ctx.workspaceId);
    if (!assistant) {
      return NextResponse.json({ error: 'Assistant not found or forbidden' }, { status: 404 });
    }

    const sources = await Database.getKnowledgeSources(assistantId);
    const chunks = await Database.getChunksByAssistant(assistantId);

    const targetWorkspaceId = assistant.workspaceId || (ctx.workspaceId !== '*' ? ctx.workspaceId : 'default-workspace');
    const wsBilling = await Database.getWorkspaceBilling(targetWorkspaceId);
    const plan = BILLING_PLANS.find((p) => p.id === wsBilling.planId) || BILLING_PLANS[0];
    const storageUsage = await Database.getWorkspaceKnowledgeStorage(targetWorkspaceId);
    const limitMb = plan.knowledgeStorageLimitMb;
    const limitBytes = limitMb * 1024 * 1024;
    const percentUsed = Math.min(100, Math.round((storageUsage.totalBytes / limitBytes) * 100));

    return NextResponse.json({
      sources,
      totalSources: sources.length,
      totalChunks: chunks.length,
      storage: {
        usedBytes: storageUsage.totalBytes,
        usedMb: storageUsage.totalMb,
        limitMb,
        percentUsed,
        isAtLimit: storageUsage.totalBytes >= limitBytes,
        planName: plan.name,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch knowledge' }, { status: 500 });
  }
});

export const DELETE = withAdminAuth(async (req: Request) => {
  try {
    const ctx = await getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Source id required' }, { status: 400 });
    }

    const deleted = await Database.deleteKnowledgeSource(id, ctx.workspaceId);
    if (!deleted) {
      return NextResponse.json({ error: 'Knowledge source not found or forbidden' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete knowledge source' }, { status: 500 });
  }
});
