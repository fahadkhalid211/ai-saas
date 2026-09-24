'use client';

import { useState } from 'react';
import { showErrorModal } from '@/lib/ui/notify';

interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  fromName?: string;
  fromEmail?: string;
  secure?: boolean;
  resendApiKey?: string;
  resendFrom?: string;
  provider: 'smtp' | 'resend';
}

interface UseCrmChannelsOptions {
  playNotificationChime: () => void;
}

export function useCrmChannels({ playNotificationChime }: UseCrmChannelsOptions) {
  const [smtpConfig, setSmtpConfig] = useState<SmtpConfig>({
    host: '',
    port: 587,
    user: '',
    pass: '',
    from: '',
    fromName: '',
    fromEmail: '',
    secure: false,
    resendApiKey: '',
    resendFrom: '',
    provider: 'smtp',
  });
  const [smtpLoading, setSmtpLoading] = useState(false);
  const [smtpSaveSuccess, setSmtpSaveSuccess] = useState(false);
  const [smtpSaveError, setSmtpSaveError] = useState<string | null>(null);
  const [smtpTestEmail, setSmtpTestEmail] = useState('');
  const [smtpTesting, setSmtpTesting] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchSmtpSettings = async () => {
    try {
      setSmtpLoading(true);
      const res = await fetch('/api/email/test');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSmtpConfig((prev) => ({
            ...prev,
            host: data.settings.host || '',
            port: data.settings.port || 587,
            user: data.settings.user || '',
            pass: data.settings.pass || '',
            from: data.settings.from || '',
            fromName: data.settings.fromName || '',
            fromEmail: data.settings.fromEmail || data.settings.from || '',
            secure: data.settings.secure ?? false,
            provider: data.settings.provider || 'smtp',
            resendApiKey: data.settings.resendApiKey || '',
            resendFrom: data.settings.resendFrom || '',
          }));
        }
      }
    } catch (e) {
      console.warn('Failed to load SMTP settings', e);
    } finally {
      setSmtpLoading(false);
    }
  };

  const handleSaveSmtpSettings = async () => {
    try {
      setSmtpLoading(true);
      setSmtpSaveSuccess(false);
      setSmtpSaveError(null);
      const payloadConfig = {
        ...smtpConfig,
        from: smtpConfig.fromName && smtpConfig.fromEmail
          ? `${smtpConfig.fromName} <${smtpConfig.fromEmail}>`
          : smtpConfig.fromEmail || smtpConfig.from,
      };
      const res = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_settings',
          settings: payloadConfig,
          config: payloadConfig,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save SMTP settings');
      setSmtpSaveSuccess(true);
      setTimeout(() => setSmtpSaveSuccess(false), 3000);
    } catch (err: any) {
      setSmtpSaveError(err.message);
      showErrorModal({ title: "SMTP settings weren't saved", message: err.message || 'Failed to save SMTP settings' });
    } finally {
      setSmtpLoading(false);
    }
  };

  const handleTestEmailSend = async () => {
    if (!smtpTestEmail.trim()) return;
    try {
      setSmtpTesting(true);
      setSmtpTestResult(null);
      const res = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_send',
          to: smtpTestEmail.trim(),
          config: smtpConfig,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setSmtpTestResult({
          success: false,
          message: data.error || data.details || 'Email sending failed. Please verify credentials.',
        });
      } else {
        setSmtpTestResult({
          success: true,
          message: data.message || ('Test email dispatched to ' + smtpTestEmail + '! Check inbox or spam folder.'),
        });
        playNotificationChime();
      }
    } catch (err: any) {
      setSmtpTestResult({
        success: false,
        message: err.message || 'Network error sending test email',
      });
    } finally {
      setSmtpTesting(false);
    }
  };

  return {
    smtpConfig,
    setSmtpConfig,
    smtpLoading,
    setSmtpLoading,
    smtpSaveSuccess,
    setSmtpSaveSuccess,
    smtpSaveError,
    setSmtpSaveError,
    smtpTestEmail,
    setSmtpTestEmail,
    smtpTesting,
    setSmtpTesting,
    smtpTestResult,
    setSmtpTestResult,
    fetchSmtpSettings,
    handleSaveSmtpSettings,
    handleTestEmailSend,
  };
}
