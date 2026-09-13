import { NextRequest, NextResponse } from 'next/server';
import { Database, DEFAULT_BARBER_LANDING_CONFIG } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/security/auth';
import { getClientIp } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const assistantId = searchParams.get('assistantId');
    const slug = searchParams.get('slug');

    if (slug) {
      const ast = await Database.getAssistantBySlug(slug);
      if (!ast) {
        return NextResponse.json({ error: 'Landing page not found for slug' }, { status: 404 });
      }
      return NextResponse.json({
        assistantId: ast.id,
        assistantName: ast.name,
        config: ast.landingPageConfig || DEFAULT_BARBER_LANDING_CONFIG,
      });
    }

    if (!assistantId) {
      return NextResponse.json({ error: 'assistantId or slug parameter required' }, { status: 400 });
    }

    const ast = await Database.getAssistantById(assistantId);
    if (!ast) {
      return NextResponse.json({ error: 'Assistant not found' }, { status: 404 });
    }

    return NextResponse.json({
      assistantId: ast.id,
      assistantName: ast.name,
      config: ast.landingPageConfig || DEFAULT_BARBER_LANDING_CONFIG,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch landing page config' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await verifyAdminRequest(req))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }

    const body = await req.json();
    const { assistantId, config } = body;

    if (!assistantId || !config) {
      return NextResponse.json({ error: 'assistantId and config required' }, { status: 400 });
    }

    const updated = await Database.updateLandingPageConfig(assistantId, config);
    if (!updated) {
      return NextResponse.json({ error: 'Assistant not found' }, { status: 404 });
    }

    const ip = getClientIp(req);
    await Database.addAuditLog({
      actor: { id: 'admin', name: 'Master Admin', ip },
      action: 'landing_page.updated',
      targetType: 'landing_page',
      targetId: assistantId,
      details: { businessName: config.businessName, slug: config.slug },
    });

    return NextResponse.json({ success: true, config: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update landing page' }, { status: 500 });
  }
}
