import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { Database } from '@/lib/db';
import { enforceRateLimit } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Crescelo-Key',
    },
  });
}

function safeSecretCompare(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export async function POST(req: NextRequest) {
  try {
    const rateLimit = enforceRateLimit(req, 'wp-verify-key', { windowMs: 60 * 1000, max: 20 });
    if (rateLimit.errorResponse) return rateLimit.errorResponse;

    const body = await req.json().catch(() => ({}));
    const { apiKey, siteUrl, siteName = 'My WordPress Website' } = body;

    const cleanKey = typeof apiKey === 'string' ? apiKey.trim() : '';
    if (!cleanKey) {
      return NextResponse.json(
        { success: false, error: 'API Key is required.' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    if (!siteUrl) {
      return NextResponse.json(
        { success: false, error: 'Site URL is required.' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const cleanDomain = siteUrl
      .replace(/^https?:\/\//i, '')
      .replace(/\/.*$/, '')
      .replace(/[^a-z0-9.-]/gi, '')
      .toLowerCase();

    // 1. Search all assistants to locate the matching webhookSecret / key
    const allAssistants = await Database.getAssistants('default-workspace');
    let matchedAssistant = allAssistants.find((a) => {
      if (!a.webhookSecret) return false;
      return safeSecretCompare(a.webhookSecret, cleanKey);
    });

    // 2. Also check if key matches master ADMIN_API_KEY
    if (!matchedAssistant && process.env.ADMIN_API_KEY && safeSecretCompare(process.env.ADMIN_API_KEY, cleanKey)) {
      matchedAssistant = allAssistants[0] || null;
    }

    // 3. If still not found, check if key is formatted as cres_wp_ or cres_sec_
    if (!matchedAssistant) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid API Key. Please verify your key in your Crescelo dashboard or generate a new one.',
        },
        { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Associate domain with the assistant
    const currentDomains = matchedAssistant.allowedDomains || [];
    if (!currentDomains.some((d) => d.toLowerCase() === cleanDomain)) {
      await Database.updateAssistant(matchedAssistant.id, {
        allowedDomains: [...currentDomains, cleanDomain],
      });
    }

    const hostUrl = req.nextUrl.origin;

    return NextResponse.json(
      {
        success: true,
        assistantId: matchedAssistant.id,
        assistantName: matchedAssistant.name,
        siteSecret: matchedAssistant.webhookSecret,
        hostUrl,
        widgetUrl: `${hostUrl}/widget.js`,
        message: 'Successfully verified and connected to Crescelo AI Assistant.',
      },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Crescelo-Key',
        },
      }
    );
  } catch (error: any) {
    console.error('[WordPressConnector] Verify-key failed:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Verification failed.' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
