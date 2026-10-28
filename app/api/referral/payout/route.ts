import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { getPartnerSessionFromRequest } from '@/lib/security/referral-auth';

export async function POST(req: NextRequest) {
  try {
    const session = getPartnerSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Partner session expired' }, { status: 401 });
    }

    const body = await req.json();
    const { amount, method, details } = body;

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return NextResponse.json({ error: 'Please enter a valid payout amount' }, { status: 400 });
    }

    if (!method || !details) {
      return NextResponse.json({ error: 'Payout method and payout details are required' }, { status: 400 });
    }

    const result = await Database.requestReferralPayout(
      session.partnerId,
      numAmount,
      String(method),
      String(details)
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Payout request failed' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Payout request submitted successfully. Processing typically takes 1-3 business days.',
      payout: result.payout,
    });
  } catch (error: any) {
    console.error('[Referral Payout Error]:', error);
    return NextResponse.json({ error: error?.message || 'Payout request failed' }, { status: 500 });
  }
}
