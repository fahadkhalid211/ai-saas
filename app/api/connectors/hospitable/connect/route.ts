/**
 * POST /api/connectors/hospitable/connect
 *
 * Registers a Hospitable Personal Access Token (PAT) or OAuth access token
 * for an assistant. Validates the token against the Hospitable API, then
 * stores it encrypted and returns the webhook URL + secret for the user to
 * configure in their Hospitable dashboard.
 *
 * Called from the admin Connect UI (/connect/hospitable).
 */

import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { encryptSecret } from '@/lib/security/crypto';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import { validateToken, listProperties } from '@/lib/integrations/hospitable/client';
import { getPostgresPool } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS });
}

function fail(status: number, error: string) {
  return NextResponse.json({ success: false, error }, { status, headers: CORS });
}

export async function POST(req: NextRequest) {
  try {
    const rateLimit = enforceRateLimit(req, 'hospitable-connect', {
      windowMs: 60_000,
      max: 10,
    });
    if (rateLimit.errorResponse) return rateLimit.errorResponse;

    const body = await req.json().catch(() => ({}));
    const { assistantId, accessToken } = body as {
      assistantId?: string;
      accessToken?: string;
    };

    if (!assistantId) return fail(400, 'assistantId is required');
    if (!accessToken) return fail(400, 'accessToken is required');

    // Verify the assistant exists
    const assistant = await Database.getAssistantById(assistantId);
    if (!assistant) return fail(404, 'Assistant not found');

    // Validate the Hospitable token
    let isValid = false;
    try {
      isValid = await validateToken(accessToken);
    } catch (err: any) {
      return fail(502, `Could not reach Hospitable API: ${err?.message}`);
    }
    if (!isValid) {
      return fail(401, 'Invalid Hospitable access token. Check that your token is active and has the required scopes (property:read, listing:read, financials:read).');
    }

    // Get property count for the confirmation message
    let propertyCount = 0;
    try {
      const { data } = await listProperties(accessToken);
      propertyCount = data.length;
    } catch {
      // Non-fatal — token validated above
    }

    const pool = getPostgresPool();
    if (!pool) return fail(503, 'Database not configured');

    // Encrypt token and generate a webhook secret
    const encryptedToken = encryptSecret(accessToken);
    const webhookSecret = generateWebhookSecret();

    await pool.query(
      `INSERT INTO hospitable_tenants
         (assistant_id, access_token, webhook_secret, sync_enabled, created_at, updated_at)
       VALUES ($1, $2, $3, TRUE, NOW(), NOW())
       ON CONFLICT (assistant_id) DO UPDATE SET
         access_token   = EXCLUDED.access_token,
         webhook_secret = EXCLUDED.webhook_secret,
         sync_enabled   = TRUE,
         updated_at     = NOW()`,
      [assistantId, encryptedToken, webhookSecret]
    );

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;

    return NextResponse.json(
      {
        success: true,
        propertyCount,
        webhookUrl: `${appUrl}/api/webhook/hospitable`,
        webhookSecret,
        message: `Connected successfully! Found ${propertyCount} propert${propertyCount === 1 ? 'y' : 'ies'}. Please register the webhook URL and secret in your Hospitable dashboard under Apps → Webhooks.`,
        nextStep: 'trigger_sync',
      },
      { status: 200, headers: CORS }
    );
  } catch (err: any) {
    console.error('[hospitable-connect] Error:', err);
    return fail(500, err?.message ?? 'Internal server error');
  }
}

function generateWebhookSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 48 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}
