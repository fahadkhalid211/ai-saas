import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { sendTestDiagnosticEmail } from '@/lib/email';
import { withAdminAuth, getAuthContext } from '@/lib/security/auth';
import { getClientIp } from '@/lib/security/rate-limit';
import { validateSafeExternalUrl } from '@/lib/security/ssrf';
import { getMasterEmail } from '@/lib/security/master';

export const GET = withAdminAuth(async (req: Request) => {
  try {
    const ctx = await getAuthContext(req);
    if (!ctx.isMasterAdmin) {
      return NextResponse.json({ error: 'Forbidden: only master admin may view global SMTP settings' }, { status: 403 });
    }

    const settings = await Database.getSmtpSettings();
    return NextResponse.json({
      success: true,
      settings: settings
        ? {
            ...settings,
            pass: settings.pass ? '••••••••' : undefined,
            resendApiKey: settings.resendApiKey ? '••••••••' : undefined,
          }
        : null,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
});

export const POST = withAdminAuth(async (req: Request) => {
  try {
    const ctx = await getAuthContext(req);
    if (!ctx.isMasterAdmin) {
      return NextResponse.json({ error: 'Forbidden: only master admin may configure global SMTP' }, { status: 403 });
    }

    const body = await req.json();
    const { action, to } = body;
    const config = body.settings || body.config || {};
    const ip = getClientIp(req);

    if (action === 'save_settings') {
      const existing = await Database.getSmtpSettings();
      const updates: any = { ...config };

      // Validate SMTP host against SSRF if provided
      if (updates.host && typeof updates.host === 'string') {
        const checkHost = updates.host.startsWith('http') ? updates.host : `http://${updates.host.trim()}`;
        const validation = await validateSafeExternalUrl(checkHost);
        if (!validation.safe) {
          return NextResponse.json({ success: false, error: `Invalid SMTP host: ${validation.error}` }, { status: 400 });
        }
      }

      // Preserve existing password / API key if masked or left blank
      if (!updates.pass || updates.pass.includes('••••')) {
        updates.pass = existing?.pass;
      }
      if (!updates.resendApiKey || updates.resendApiKey.includes('••••')) {
        updates.resendApiKey = existing?.resendApiKey;
      }

      // Harmonize sender name and email into canonical from field
      if (updates.fromEmail && !updates.from) {
        updates.from = updates.fromName ? `${updates.fromName} <${updates.fromEmail}>` : updates.fromEmail;
      } else if (updates.from && !updates.fromEmail) {
        const match = updates.from.match(/<([^>]+)>/);
        updates.fromEmail = match ? match[1] : updates.from;
      }

      const saved = await Database.saveSmtpSettings(updates);
      await Database.addAuditLog({
        actor: { id: ctx.memberId || 'admin', name: ctx.role || 'Master Admin', email: getMasterEmail(), ip },
        action: 'settings.smtp_updated',
        targetType: 'system_settings',
        details: { host: saved.host, port: saved.port, user: saved.user, from: saved.from, provider: saved.provider },
      });

      // Never echo unmasked secrets in response
      const maskedSettings = {
        ...saved,
        pass: saved.pass ? '••••••••' : undefined,
        resendApiKey: saved.resendApiKey ? '••••••••' : undefined,
      };
      return NextResponse.json({ success: true, settings: maskedSettings });
    }

    if (action === 'test_send') {
      if (!to || !to.trim() || !to.includes('@')) {
        return NextResponse.json({ success: false, error: 'A valid recipient email address is required for testing.' }, { status: 400 });
      }

      const existing = await Database.getSmtpSettings();
      const resolvedConfig = config ? { ...config } : {};

      // Validate SMTP host against SSRF if provided
      if (resolvedConfig.host && typeof resolvedConfig.host === 'string') {
        const checkHost = resolvedConfig.host.startsWith('http') ? resolvedConfig.host : `http://${resolvedConfig.host.trim()}`;
        const validation = await validateSafeExternalUrl(checkHost);
        if (!validation.safe) {
          return NextResponse.json({ success: false, error: `Invalid SMTP host: ${validation.error}` }, { status: 400 });
        }
      }

      if (resolvedConfig.pass && resolvedConfig.pass.includes('••••')) {
        resolvedConfig.pass = existing?.pass;
      }
      if (resolvedConfig.resendApiKey && resolvedConfig.resendApiKey.includes('••••')) {
        resolvedConfig.resendApiKey = existing?.resendApiKey;
      }

      const result = await sendTestDiagnosticEmail(to.trim(), resolvedConfig);
      if (!result.success) {
        return NextResponse.json({
          success: false,
          error: result.error || 'SMTP delivery failed. Please check host, port, credentials, and firewall.',
        }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        simulated: result.simulated,
        message: result.simulated
          ? 'Notice: Neither live SMTP nor Resend API key is configured. Email was simulated and printed to terminal logs.'
          : 'Success! Test email delivered successfully to ' + to.trim(),
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
});
