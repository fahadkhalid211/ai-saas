import { NextResponse } from 'next/server';
import { withRoleAuth, getAuthContext, requireWorkspaceAssistant } from '@/lib/security/auth';
import { spendSummary } from '@/lib/ai/spend/guard';
import { logged } from '@/lib/logging/route';

export const dynamic = 'force-dynamic';

/** This month's estimated spend on the assistant's own AI key, against its cost cap (AI Engine tab). */
const GETHandler = withRoleAuth(['owner', 'admin', 'billing_manager'], async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const ctx = await getAuthContext(req);
    const { id } = await params;
    const assistant = await requireWorkspaceAssistant(ctx, id);
    if (!assistant) {
      return NextResponse.json({ error: 'Assistant not found' }, { status: 404 });
    }
    return NextResponse.json({ spend: await spendSummary(assistant) });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to load spend' }, { status: 500 });
  }
});

export const GET = logged(GETHandler, { route: '/api/assistants/[id]/spend' });
