import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { getPartnerSessionFromRequest } from '@/lib/security/referral-auth';

export async function GET(req: NextRequest) {
  try {
    const session = getPartnerSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Partner session expired' }, { status: 401 });
    }

    const stats = await Database.getReferralStats(session.partnerId);
    if (!stats) {
      return NextResponse.json({ error: 'Partner profile not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, stats });
  } catch (error: any) {
    console.error('[Referral Dashboard API Error]:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch dashboard data' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = getPartnerSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Partner session expired' }, { status: 401 });
    }

    const body = await req.json();
    const { phone, payoutMethod, payoutDetails, socialLinks, platforms } = body;

    const updates: any = {};
    if (phone && typeof phone === 'string') updates.phone = phone.trim();
    if (payoutMethod && typeof payoutMethod === 'string') updates.payoutMethod = payoutMethod;
    if (payoutDetails !== undefined) updates.payoutDetails = String(payoutDetails).trim();
    if (socialLinks && typeof socialLinks === 'object') updates.socialLinks = socialLinks;
    if (Array.isArray(platforms)) updates.platforms = platforms;

    const updated = await Database.updateReferralPartner(session.partnerId, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    const stats = await Database.getReferralStats(session.partnerId);
    return NextResponse.json({ success: true, stats, message: 'Settings updated successfully' });
  } catch (error: any) {
    console.error('[Referral Update API Error]:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update partner settings' }, { status: 500 });
  }
}
