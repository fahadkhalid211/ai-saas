import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { sendTestDiagnosticEmail } from '@/lib/email';
import { withAdminAuth } from '@/lib/security/auth';

export const GET = withAdminAuth(async (_req: Request) => {
  try {
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
    const body = await req.json();
    const { action, to, config } = body;

    if (action === 'save_settings') {
      const existing = await Database.getSmtpSettings();
      const updates: any = { ...config };
      // Preserve existing password / API key if masked
      if (updates.pass && updates.pass.includes('••••')) {
        updates.pass = existing?.pass;
      }
      if (updates.resendApiKey && updates.resendApiKey.includes('••••')) {
        updates.resendApiKey = existing?.resendApiKey;
      }
      const saved = await Database.saveSmtpSettings(updates);
      await Database.addAuditLog({
        actor: { id: 'admin', name: 'Master Admin', ip: '127.0.0.1' },
        action: 'settings.smtp_updated',
        targetType: 'system_settings',
        details: { host: saved.host, port: saved.port, user: saved.user, from: saved.from },
      });
      return NextResponse.json({ success: true, settings: saved });
    }

    if (action === 'test_send') {
      if (!to || !to.trim() || !to.includes('@')) {
        return NextResponse.json({ success: false, error: 'A valid recipient email address is required for testing.' }, { status: 400 });
      }

      const existing = await Database.getSmtpSettings();
      const resolvedConfig = config ? { ...config } : {};
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
