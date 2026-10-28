import { NextResponse } from 'next/server';
import { createClearPartnerSessionCookie } from '@/lib/security/referral-auth';

export async function POST() {
  const res = NextResponse.json({ success: true, message: 'Logged out successfully' });
  res.headers.set('Set-Cookie', createClearPartnerSessionCookie());
  return res;
}
