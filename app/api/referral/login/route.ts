import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { verifyPassword } from '@/lib/security/password';
import { generatePartnerToken, createPartnerSessionCookie } from '@/lib/security/referral-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const partner = await Database.getReferralPartnerByEmail(cleanEmail);

    if (!partner || !partner.passwordHash) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isValid = verifyPassword(password, partner.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (partner.status === 'suspended') {
      return NextResponse.json({ error: 'Your affiliate account is currently suspended. Please contact support.' }, { status: 403 });
    }

    const token = generatePartnerToken(partner.id);
    const cookieHeader = createPartnerSessionCookie(token);

    const res = NextResponse.json({
      success: true,
      partner: {
        id: partner.id,
        name: partner.name,
        email: partner.email,
        referralCode: partner.referralCode,
        commissionPercent: partner.commissionPercent,
      },
    });

    res.headers.set('Set-Cookie', cookieHeader);
    return res;
  } catch (error: any) {
    console.error('[Referral Login Error]:', error);
    return NextResponse.json({ error: error?.message || 'Login failed' }, { status: 500 });
  }
}
