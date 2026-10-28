import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { getClientIp } from '@/lib/security/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { code, referrer, landingPath } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Referral code is required' }, { status: 400 });
    }

    const ip = getClientIp(req);
    const userAgent = req.headers.get('user-agent') || '';

    await Database.recordReferralClick(code, {
      ip,
      referrer: typeof referrer === 'string' ? referrer : req.headers.get('referer') || '',
      landingPath: typeof landingPath === 'string' ? landingPath : '/',
      userAgent,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
