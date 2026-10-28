import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { hashPassword } from '@/lib/security/password';
import { generatePartnerToken, createPartnerSessionCookie } from '@/lib/security/referral-auth';
import { getClientIp } from '@/lib/security/rate-limit';
import { MarketingPlatform } from '@/types/referral';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      password,
      phone,
      platforms,
      socialLinks,
      marketingStrategy,
      payoutMethod,
      payoutDetails,
      customCode,
    } = body;

    // 1. Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Please enter your full name (at least 2 characters)' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    if (!phone || typeof phone !== 'string' || phone.trim().length < 5) {
      return NextResponse.json({ error: 'Please enter a valid phone number with country code' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if partner already exists
    const existing = await Database.getReferralPartnerByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json(
        { error: 'An affiliate account with this email already exists. Please log in to your partner dashboard.' },
        { status: 409 }
      );
    }

    // 2. Determine unique referral code
    let refCode = '';
    if (customCode && typeof customCode === 'string') {
      const sanitized = customCode.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 24);
      if (sanitized.length >= 3) {
        const taken = await Database.getReferralPartnerByCode(sanitized);
        if (!taken) {
          refCode = sanitized;
        }
      }
    }

    if (!refCode) {
      const baseSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 15) || 'partner';
      let candidate = baseSlug;
      let counter = 1;
      while (await Database.getReferralPartnerByCode(candidate)) {
        candidate = `${baseSlug}${counter}`;
        counter++;
      }
      refCode = candidate;
    }

    // 3. Hash password & persist partner
    const passwordHash = hashPassword(password);
    const validPlatforms: MarketingPlatform[] = Array.isArray(platforms)
      ? (platforms.filter((p: string) =>
          [
            'instagram',
            'youtube',
            'tiktok',
            'linkedin',
            'twitter',
            'website',
            'newsletter',
            'discord',
            'facebook',
            'other',
          ].includes(p)
        ) as MarketingPlatform[])
      : ['other'];

    const partner = await Database.createReferralPartner({
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      passwordHash,
      referralCode: refCode,
      platforms: validPlatforms.length > 0 ? validPlatforms : ['other'],
      socialLinks: {
        instagram: socialLinks?.instagram ? String(socialLinks.instagram).trim() : undefined,
        youtube: socialLinks?.youtube ? String(socialLinks.youtube).trim() : undefined,
        tiktok: socialLinks?.tiktok ? String(socialLinks.tiktok).trim() : undefined,
        twitter: socialLinks?.twitter ? String(socialLinks.twitter).trim() : undefined,
        linkedin: socialLinks?.linkedin ? String(socialLinks.linkedin).trim() : undefined,
        website: socialLinks?.website ? String(socialLinks.website).trim() : undefined,
        other: socialLinks?.other ? String(socialLinks.other).trim() : undefined,
      },
      marketingStrategy: typeof marketingStrategy === 'string' ? marketingStrategy.trim() : '',
      payoutMethod: ['paypal', 'bank_transfer', 'crypto', 'wise'].includes(payoutMethod) ? payoutMethod : 'paypal',
      payoutDetails: typeof payoutDetails === 'string' ? payoutDetails.trim() : '',
      commissionPercent: 10, // 10% recurring commission per client
      status: 'active',
    });

    // 4. Issue session token
    const token = generatePartnerToken(partner.id);
    const cookieHeader = createPartnerSessionCookie(token);

    const res = NextResponse.json({
      success: true,
      message: 'Referral partner account registered successfully!',
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
    console.error('[Referral Register API Error]:', error);
    return NextResponse.json({ error: error?.message || 'Failed to register referral partner' }, { status: 500 });
  }
}
