import React, { useState } from 'react';
import { PhoneChannelCard } from '@/components/crm/PhoneChannelCard';
import {
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Check,
  Globe,
  SendHorizontal,
  Radio,
  Webhook,
  EyeOff,
  Eye,
  ShieldCheck,
  Zap,
  Sparkles,
  Copy,
  Activity,
  FileCode,
  Shield,
  Send,
  Mail,
  AlertCircle,
  Info,
} from 'lucide-react';

export interface ChannelsTabProps {
  activeAssistant: any;
  formData: any;
  setFormData: (data: any) => void;
  handleSaveSettings: () => void;
  isSaving: boolean;
  saveSuccess: boolean;
  saveError: string | null;
  leads: any[];
  smtpConfig: any;
  setSmtpConfig: React.Dispatch<React.SetStateAction<any>>;
  smtpLoading: boolean;
  smtpSaveSuccess: boolean;
  smtpSaveError: string | null;
  smtpTestEmail: string;
  setSmtpTestEmail: (email: string) => void;
  smtpTesting: boolean;
  smtpTestResult: { success: boolean; message: string } | null;
  handleSaveSmtpSettings: () => Promise<void>;
  handleTestEmailSend: () => Promise<void>;
  isMasterAdmin?: boolean;
}

export const ChannelsTab: React.FC<ChannelsTabProps> = ({
  isMasterAdmin = false,
  activeAssistant,
  formData,
  setFormData,
  handleSaveSettings,
  isSaving,
  saveSuccess,
  saveError,
  leads,
  smtpConfig,
  setSmtpConfig,
  smtpLoading,
  smtpSaveSuccess,
  smtpSaveError,
  smtpTestEmail,
  setSmtpTestEmail,
  smtpTesting,
  smtpTestResult,
  handleSaveSmtpSettings,
  handleTestEmailSend,
}) => {
  const [showTelegramToken, setShowTelegramToken] = useState(false);
  const [showWhatsAppToken, setShowWhatsAppToken] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [copiedWaWebhookUrl, setCopiedWaWebhookUrl] = useState(false);
  const [copiedWaVerifyToken, setCopiedWaVerifyToken] = useState(false);

  const [telegramStatus, setTelegramStatus] = useState<{
    loading: boolean;
    tested?: boolean;
    success?: boolean;
    error?: string;
    botInfo?: { id: number; username: string; firstName: string; canJoinGroups: boolean };
  }>({ loading: false });

  const [telegramWebhookStatus, setTelegramWebhookStatus] = useState<{
    loading: boolean;
    success?: boolean;
    error?: string;
    message?: string;
  }>({ loading: false });

  const [webhookTestStatus, setWebhookTestStatus] = useState<{
    loading: boolean;
    tested?: boolean;
    success?: boolean;
    error?: string;
    statusCode?: number;
    latencyMs?: number;
  }>({ loading: false });

  async function handleTelegramVerify() {
    if (!formData.telegramBotToken?.trim()) {
      setTelegramStatus({ loading: false, tested: true, success: false, error: 'Please enter a Telegram Bot API Token.' });
      return;
    }
    setTelegramStatus({ loading: true });
    try {
      const res = await fetch(`/api/channels/telegram?action=verify&token=${encodeURIComponent(formData.telegramBotToken.trim())}`);
      const data = await res.json();
      if (data.ok && data.bot) {
        setTelegramStatus({ loading: false, tested: true, success: true, botInfo: data.bot });
      } else {
        setTelegramStatus({ loading: false, tested: true, success: false, error: data.error || 'Invalid Bot Token' });
      }
    } catch (err: any) {
      setTelegramStatus({ loading: false, tested: true, success: false, error: err?.message || 'Verification failed' });
    }
  }

  async function handleTelegramSetWebhook() {
    if (!activeAssistant) return;
    setTelegramWebhookStatus({ loading: true });
    try {
      const webhookUrl = `${window.location.origin}/api/channels/telegram`;
      const res = await fetch(`/api/channels/telegram?action=setWebhook&assistantId=${activeAssistant.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl }),
      });
      const data = await res.json();
      if (data.ok) {
        setTelegramWebhookStatus({
          loading: false,
          success: true,
          message: 'Webhook registered with Telegram! Incoming bot messages will receive live AI answers.',
        });
        setTimeout(() => setTelegramWebhookStatus({ loading: false }), 6000);
      } else {
        setTelegramWebhookStatus({ loading: false, success: false, error: data.error || 'Failed to register webhook' });
      }
    } catch (err: any) {
      setTelegramWebhookStatus({ loading: false, success: false, error: err?.message || 'Failed to register webhook' });
    }
  }

  async function handleWebhookTestPing() {
    if (!formData.webhookUrl?.trim()) {
      setWebhookTestStatus({ loading: false, tested: true, success: false, error: 'Please provide a Target Webhook URL.' });
      return;
    }
    setWebhookTestStatus({ loading: true });
    try {
      const res = await fetch('/api/webhook/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId: activeAssistant?.id,
          webhookUrl: formData.webhookUrl.trim(),
          webhookSecret: formData.webhookSecret?.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setWebhookTestStatus({
          loading: false,
          tested: true,
          success: true,
          statusCode: data.statusCode,
          latencyMs: data.latencyMs,
        });
      } else {
        setWebhookTestStatus({
          loading: false,
          tested: true,
          success: false,
          error: data.error || 'Webhook ping failed',
          statusCode: data.statusCode,
          latencyMs: data.latencyMs,
        });
      }
    } catch (err: any) {
      setWebhookTestStatus({
        loading: false,
        tested: true,
        success: false,
        error: err?.message || 'Failed to test webhook ping',
      });
    }
  }

  return (
              <div className="max-w-6xl space-y-8 mx-auto pb-12">
                {/* Header Section with Save Trigger */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Channels &amp; Integrations
                      </h1>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 uppercase tracking-wider">
                        Omnichannel v2.0
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                      Connect your assistant to Telegram, WhatsApp, and other platforms, or send real-time alerts to tools like Zapier or your CRM.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {saveSuccess && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 animate-in fade-in">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Saved Successfully</span>
                      </div>
                    )}
                    {saveError && (
                      <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>{saveError}</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleSaveSettings}
                      disabled={isSaving}
                      className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-xs font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer"
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Save Channel Settings</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 4 Summary Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Web Widget Card */}
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Web Chat Widget
                      </div>
                      <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Embedded &amp; Live</span>
                      </div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        Active on web pages
                      </div>
                    </div>
                    <div className="h-11 w-11 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/40">
                      <Globe className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Telegram Card */}
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Telegram Bot API
                      </div>
                      <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{formData.telegramBotEnabled ? 'Enabled' : 'Disabled'}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                        <span className={`h-1.5 w-1.5 rounded-full ${formData.telegramBotEnabled ? 'bg-sky-500' : 'bg-slate-400'}`}></span>
                        {formData.telegramBotToken ? 'Token Set' : 'Token Missing'}
                      </div>
                    </div>
                    <div className="h-11 w-11 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-100 dark:border-sky-900/40">
                      <SendHorizontal className="h-5 w-5" />
                    </div>
                  </div>

                  {/* WhatsApp Cloud Card */}
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        WhatsApp Cloud API
                      </div>
                      <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{formData.whatsappEnabled ? 'Enabled' : 'Disabled'}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                        <span className={`h-1.5 w-1.5 rounded-full ${formData.whatsappEnabled ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        {formData.whatsappPhoneNumberId ? 'Phone ID Set' : 'Setup Required'}
                      </div>
                    </div>
                    <div className="h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/40">
                      <Radio className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Webhooks & Zapier Card */}
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Zapier &amp; Webhooks
                      </div>
                      <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{formData.webhookUrl ? 'Connected' : 'Inactive'}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                        <span className={`h-1.5 w-1.5 rounded-full ${formData.webhookUrl ? 'bg-amber-500' : 'bg-slate-400'}`}></span>
                        {(formData.webhookEvents || ['lead.created']).length} Events Active
                      </div>
                    </div>
                    <div className="h-11 w-11 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-900/40">
                      <Webhook className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                {/* CHANNEL 1: TELEGRAM BOT CONNECTOR */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3.5">
                      <div className="h-12 w-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-200 dark:border-sky-900/50">
                        <SendHorizontal className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-slate-900 dark:text-white">
                            Telegram Bot Integration
                          </h2>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                            Zero Cost
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Deploy a 24/7 autonomous Telegram assistant that answers questions from your knowledge base and captures leads.
                        </p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.telegramBotEnabled || false}
                        onChange={(e) =>
                          setFormData({ ...formData, telegramBotEnabled: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-sky-600"></div>
                      <span className="ml-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {formData.telegramBotEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Configuration Inputs */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Telegram Bot API Token <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showTelegramToken ? 'text' : 'password'}
                            placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                            value={formData.telegramBotToken || ''}
                            onChange={(e) =>
                              setFormData({ ...formData, telegramBotToken: e.target.value })
                            }
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-sky-500 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowTelegramToken(!showTelegramToken)}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          >
                            {showTelegramToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          Generated via <span className="font-semibold text-sky-600 dark:text-sky-400">@BotFather</span> on Telegram.
                        </p>
                      </div>

                      {/* Action buttons: Verify and Set Webhook */}
                      <div className="flex flex-wrap gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={handleTelegramVerify}
                          disabled={telegramStatus.loading}
                          className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3.5 py-2 text-xs font-semibold shadow-2xs transition disabled:opacity-50 cursor-pointer"
                        >
                          {telegramStatus.loading ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin text-sky-500" />
                          ) : (
                            <ShieldCheck className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                          )}
                          <span>Verify Bot Token</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleTelegramSetWebhook}
                          disabled={telegramWebhookStatus.loading || !formData.telegramBotToken}
                          className="flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 text-xs font-semibold shadow-2xs transition disabled:opacity-50 cursor-pointer"
                        >
                          {telegramWebhookStatus.loading ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Zap className="h-3.5 w-3.5" />
                          )}
                          <span>Register Live Webhook</span>
                        </button>
                      </div>

                      {/* Verification feedback box */}
                      {telegramStatus.tested && (
                        <div
                          className={`p-3 rounded-xl border text-xs ${
                            telegramStatus.success
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
                              : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300'
                          }`}
                        >
                          {telegramStatus.success && telegramStatus.botInfo ? (
                            <div className="space-y-1">
                              <div className="font-bold flex items-center gap-1.5">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                <span>Verified Bot: @{telegramStatus.botInfo.username}</span>
                              </div>
                              <p className="text-[11px] opacity-90 font-mono">
                                Name: {telegramStatus.botInfo.firstName} (ID: {telegramStatus.botInfo.id})
                              </p>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                              <span>{telegramStatus.error || 'Token verification failed'}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Webhook status message */}
                      {telegramWebhookStatus.message && (
                        <div className="p-3 rounded-xl border border-sky-200 dark:border-sky-800/60 bg-sky-50 dark:bg-sky-950/30 text-xs text-sky-800 dark:text-sky-300 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-sky-600 shrink-0" />
                          <span>{telegramWebhookStatus.message}</span>
                        </div>
                      )}
                      {telegramWebhookStatus.error && (
                        <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/30 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                          <span>{telegramWebhookStatus.error}</span>
                        </div>
                      )}
                    </div>

                    {/* Right: 3-Step Setup Guide */}
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-3">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-sky-500" />
                        <span>Quick 60-Second Telegram Setup</span>
                      </div>
                      <ol className="text-xs text-slate-600 dark:text-slate-400 space-y-2.5 list-decimal pl-4">
                        <li>
                          Open Telegram and search for <strong className="text-slate-900 dark:text-white">@BotFather</strong>.
                        </li>
                        <li>
                          Send <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-[11px] font-mono">/newbot</code>, choose a bot display name and a username ending in <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-[11px] font-mono">bot</code>.
                        </li>
                        <li>
                          Copy the token provided by @BotFather, paste it into the field on the left, and click <strong className="text-slate-900 dark:text-white">Register Live Webhook</strong>.
                        </li>
                      </ol>
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        Webhook URL: <span className="text-sky-600 dark:text-sky-400">{typeof window !== 'undefined' ? window.location.origin : ''}/api/channels/telegram</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CHANNEL: PHONE CALLS */}
                <PhoneChannelCard
                  activeAssistant={activeAssistant}
                  formData={formData}
                  setFormData={setFormData}
                  handleSaveSettings={handleSaveSettings}
                  isSaving={isSaving}
                  isMasterAdmin={isMasterAdmin}
                />

                {/* CHANNEL 2: WHATSAPP CLOUD API */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3.5">
                      <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-900/50">
                        <Radio className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-slate-900 dark:text-white">
                            WhatsApp Cloud API (Meta Official)
                          </h2>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            Enterprise
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Direct integration with Meta Graph API for official business phone numbers with zero 3rd-party per-message fees.
                        </p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.whatsappEnabled || false}
                        onChange={(e) =>
                          setFormData({ ...formData, whatsappEnabled: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
                      <span className="ml-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {formData.whatsappEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: WhatsApp API Credentials */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Phone Number ID <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 109823485729104"
                          value={formData.whatsappPhoneNumberId || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, whatsappPhoneNumberId: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
                        />
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          From Meta Developer App &gt; WhatsApp &gt; API Setup &gt; Phone number ID.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          System User Access Token <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showWhatsAppToken ? 'text' : 'password'}
                            placeholder="EAAB..."
                            value={formData.whatsappAccessToken || ''}
                            onChange={(e) =>
                              setFormData({ ...formData, whatsappAccessToken: e.target.value })
                            }
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowWhatsAppToken(!showWhatsAppToken)}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          >
                            {showWhatsAppToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Meta Webhook Verify Token
                        </label>
                        <input
                          type="text"
                          placeholder="kortex_wa_token"
                          value={formData.whatsappVerifyToken || 'kortex_wa_token'}
                          onChange={(e) =>
                            setFormData({ ...formData, whatsappVerifyToken: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Right: Meta Webhook Setup Helper */}
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-3.5">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Meta App Dashboard Webhook Settings</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Paste these two values into <strong className="text-slate-900 dark:text-white">developers.facebook.com &gt; WhatsApp &gt; Configuration &gt; Callback URL</strong>:
                      </p>

                      <div className="space-y-2">
                        <div>
                          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                            Callback URL:
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              readOnly
                              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/channels/whatsapp`}
                              className="flex-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-mono text-slate-700 dark:text-slate-300 outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  `${window.location.origin}/api/channels/whatsapp`
                                );
                                setCopiedWaWebhookUrl(true);
                                setTimeout(() => setCopiedWaWebhookUrl(false), 2500);
                              }}
                              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                              title="Copy Callback URL"
                            >
                              {copiedWaWebhookUrl ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                            Verify Token:
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              readOnly
                              value={formData.whatsappVerifyToken || 'kortex_wa_token'}
                              className="flex-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-mono text-slate-700 dark:text-slate-300 outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  formData.whatsappVerifyToken || 'kortex_wa_token'
                                );
                                setCopiedWaVerifyToken(true);
                                setTimeout(() => setCopiedWaVerifyToken(false), 2500);
                              }}
                              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                              title="Copy Verify Token"
                            >
                              {copiedWaVerifyToken ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                        Subscribed Webhook Field: <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">messages</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* INTEGRATION 3: OUTBOUND WEBHOOK DISPATCHER (ZAPIER / MAKE / CRMS) */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3.5">
                      <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-900/50">
                        <Webhook className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-slate-900 dark:text-white">
                            Outbound Webhooks (Zapier, Make.com, n8n, CRMs)
                          </h2>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            Real-time Event Stream
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Automatically post captured leads and escalation alerts to external webhooks with HMAC SHA-256 signatures.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleWebhookTestPing}
                      disabled={webhookTestStatus.loading || !formData.webhookUrl}
                      className="flex items-center gap-1.5 rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-950/70 text-amber-900 dark:text-amber-200 px-4 py-2 text-xs font-semibold shadow-2xs transition disabled:opacity-50 cursor-pointer"
                    >
                      {webhookTestStatus.loading ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-600" />
                      ) : (
                        <Activity className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      )}
                      <span>Send Live Test Ping</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Webhook URL & Secret */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Target Webhook URL
                        </label>
                        <input
                          type="url"
                          placeholder="https://hooks.zapier.com/hooks/catch/... or https://hook.eu1.make.com/..."
                          value={formData.webhookUrl || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, webhookUrl: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
                        />
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          Compatible with Zapier "Catch Hook", Make.com "Custom Webhook", n8n, Slack, or any backend HTTP endpoint.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Webhook Signing Secret (Optional)
                        </label>
                        <div className="relative">
                          <input
                            type={showWebhookSecret ? 'text' : 'password'}
                            placeholder="whsec_..."
                            value={formData.webhookSecret || ''}
                            onChange={(e) =>
                              setFormData({ ...formData, webhookSecret: e.target.value })
                            }
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          >
                            {showWebhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          Included in the <code className="font-mono">X-Kortex-Signature</code> header as HMAC SHA-256 for payload verification.
                        </p>
                      </div>

                      {/* Event Subscriptions */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          Dispatched Events
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={(formData.webhookEvents || ['lead.created']).includes('lead.created')}
                              onChange={(e) => {
                                const current: string[] = formData.webhookEvents || ['lead.created'];
                                const next = e.target.checked
                                  ? [...current, 'lead.created']
                                  : current.filter((x: string) => x !== 'lead.created');
                                setFormData({ ...formData, webhookEvents: next });
                              }}
                              className="rounded text-amber-600 focus:ring-amber-500 dark:bg-slate-950 dark:border-slate-800"
                            />
                            <span><strong className="font-semibold">lead.created</strong> — Fired immediately whenever a visitor submits the contact/lead form</span>
                          </label>

                          <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={(formData.webhookEvents || []).includes('conversation.escalated')}
                              onChange={(e) => {
                                const current: string[] = formData.webhookEvents || ['lead.created'];
                                const next = e.target.checked
                                  ? [...current, 'conversation.escalated']
                                  : current.filter((x: string) => x !== 'conversation.escalated');
                                setFormData({ ...formData, webhookEvents: next });
                              }}
                              className="rounded text-amber-600 focus:ring-amber-500 dark:bg-slate-950 dark:border-slate-800"
                            />
                            <span><strong className="font-semibold">conversation.escalated</strong> — Fired when a user requests human support assistance</span>
                          </label>
                        </div>
                      </div>

                      {/* Test Ping Result Box */}
                      {webhookTestStatus.tested && (
                        <div
                          className={`p-3 rounded-xl border text-xs ${
                            webhookTestStatus.success
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
                              : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300'
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold">
                            <div className="flex items-center gap-1.5">
                              {webhookTestStatus.success ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                              )}
                              <span>
                                {webhookTestStatus.success ? 'Test Ping Received (200 OK)' : 'Ping Failed'}
                              </span>
                            </div>
                            {webhookTestStatus.latencyMs !== undefined && (
                              <span className="font-mono text-[11px] opacity-80">
                                {webhookTestStatus.latencyMs}ms latency
                              </span>
                            )}
                          </div>
                          {webhookTestStatus.error && (
                            <p className="mt-1 text-[11px] font-mono opacity-90">
                              {webhookTestStatus.error}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: Sample JSON Payload Preview */}
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-300 pb-2 border-b border-slate-800">
                        <span className="flex items-center gap-1.5">
                          <FileCode className="h-3.5 w-3.5 text-amber-400" />
                          <span>Sample Outbound Payload</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 uppercase">POST / JSON</span>
                      </div>
                      <pre className="text-[11px] font-mono text-emerald-400 leading-relaxed overflow-x-auto whitespace-pre-wrap">
{`{
  "event": "lead.created",
  "assistantId": "${activeAssistant?.id || 'ast_123'}",
  "timestamp": "${new Date().toISOString()}",
  "data": {
    "name": "Sarah Connor",
    "email": "sarah@cyberdyne.io",
    "phone": "+1 (555) 234-5678",
    "notes": "Looking for enterprise bot deployment",
    "customData": {
      "companySize": "50-200"
    }
  }
}`}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* INTEGRATION 4: AGENCY WHITE-LABELING & RESELLER BRANDING */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3.5">
                      <div className="h-12 w-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200 dark:border-purple-900/50">
                        <Shield className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-slate-900 dark:text-white">
                            Agency White-Labeling &amp; Custom Branding
                          </h2>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                            Reseller Ready
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Sell chatbots under your agency brand. Remove default "Powered by Kortex AI" or replace with your custom branding and backlink.
                        </p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.whiteLabelEnabled || false}
                        onChange={(e) =>
                          setFormData({ ...formData, whiteLabelEnabled: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-purple-600"></div>
                      <span className="ml-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {formData.whiteLabelEnabled ? 'White-Label Enabled' : 'Default Branding'}
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Custom Branding Controls */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Custom Agency Footer Text
                        </label>
                        <input
                          type="text"
                          disabled={!formData.whiteLabelEnabled}
                          placeholder="e.g. Powered by Apex Growth Agency (or leave blank for 100% unbranded)"
                          value={formData.customBrandingText || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, customBrandingText: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-purple-500 disabled:opacity-40 disabled:cursor-not-allowed"
                        />
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          If left blank with White-Label enabled, the widget footer will be completely clean and unbranded.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Custom Agency Link (URL)
                        </label>
                        <input
                          type="url"
                          disabled={!formData.whiteLabelEnabled || !formData.customBrandingText}
                          placeholder="https://apexsolutions.agency"
                          value={formData.customBrandingUrl || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, customBrandingUrl: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-purple-500 disabled:opacity-40 disabled:cursor-not-allowed"
                        />
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          Clicking your agency text will open this URL in a new tab.
                        </p>
                      </div>
                    </div>

                    {/* Right: Live Visual Preview of the Widget Footer */}
                    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex flex-col justify-center items-center space-y-4">
                      <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                        Live Widget Footer Preview
                      </div>
                      
                      {/* Mockup Chat Box Base */}
                      <div className="w-full max-w-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-md overflow-hidden">
                        {/* Fake Input Row */}
                        <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-7 rounded-lg text-[11px] text-slate-400 flex items-center px-2.5">
                            Ask anything about our business...
                          </div>
                          <div className="h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            <Send className="h-3 w-3" />
                          </div>
                        </div>

                        {/* The Actual Footer Branding Bar */}
                        <div className="py-2 px-4 bg-white dark:bg-slate-900 text-center text-[11px] text-slate-400 dark:text-slate-500">
                          {formData.whiteLabelEnabled ? (
                            formData.customBrandingText ? (
                              formData.customBrandingUrl ? (
                                <a
                                  href={formData.customBrandingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-slate-600 dark:text-slate-300 font-medium hover:underline hover:text-blue-600"
                                >
                                  {formData.customBrandingText}
                                </a>
                              ) : (
                                <span>{formData.customBrandingText}</span>
                              )
                            ) : (
                              <span className="italic text-slate-300 dark:text-slate-600 text-[10px]">
                                (Completely Clean &amp; Unbranded)
                              </span>
                            )
                          ) : (
                            <span>
                              <Zap className="h-3 w-3 text-blue-500 inline mr-1" />Powered by{' '}
                              <span className="text-slate-600 dark:text-slate-300 font-medium underline">
                                Kortex AI
                              </span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 text-center">
                        {formData.whiteLabelEnabled
                          ? 'Client sees only your agency branding or zero platform badges.'
                          : 'Displays default platform branding.'}
                      </div>
                    </div>
                  </div>
                </div>


                {/* INTEGRATION 5: EMAIL DELIVERY & SMTP CONFIGURATION */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3.5">
                      <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-900/50">
                        <Mail className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-slate-900 dark:text-white">
                            Email Delivery &amp; SMTP Configuration
                          </h2>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                            Booking Reminders &amp; Alerts
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Configure live email sending for appointment confirmations and 24-hour / 1-hour client reminder emails.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {smtpSaveSuccess && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>SMTP Saved</span>
                        </div>
                      )}
                      {smtpSaveError && (
                        <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span>{smtpSaveError}</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={handleSaveSmtpSettings}
                        disabled={smtpLoading}
                        className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
                      >
                        {smtpLoading ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            <span>Save Email Config</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Provider & Credentials Settings */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setSmtpConfig({ ...smtpConfig, provider: 'smtp' })}
                          className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                            smtpConfig.provider === 'smtp'
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          Custom SMTP (Gmail, Outlook, Postmark, Mailgun, SES)
                        </button>
                        <button
                          type="button"
                          onClick={() => setSmtpConfig({ ...smtpConfig, provider: 'resend' })}
                          className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                            smtpConfig.provider === 'resend'
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          Resend API (Cloud Transactional Email)
                        </button>
                      </div>

                      {smtpConfig.provider === 'smtp' ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                SMTP Server Host
                              </label>
                              <input
                                type="text"
                                placeholder="smtp.gmail.com or smtp.postmarkapp.com"
                                value={smtpConfig.host}
                                onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Port
                              </label>
                              <input
                                type="number"
                                placeholder="587"
                                value={smtpConfig.port || 587}
                                onChange={(e) => setSmtpConfig({ ...smtpConfig, port: Number(e.target.value) || 587 })}
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                SMTP Username / Email
                              </label>
                              <input
                                type="text"
                                placeholder="user@domain.com"
                                value={smtpConfig.user}
                                onChange={(e) => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                SMTP Password / App Key
                              </label>
                              <div className="relative">
                                <input
                                  type={showSmtpPassword ? 'text' : 'password'}
                                  placeholder="••••••••••••••••"
                                  value={smtpConfig.pass}
                                  onChange={(e) => setSmtpConfig({ ...smtpConfig, pass: e.target.value })}
                                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-3 pr-9 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                  {showSmtpPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                </button>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              From Address (Sender)
                            </label>
                            <input
                              type="text"
                              placeholder="Crown &amp; Blade &lt;bookings@crownandblade.com&gt;"
                              value={smtpConfig.from}
                              onChange={(e) => setSmtpConfig({ ...smtpConfig, from: e.target.value })}
                              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                            />
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                              For Gmail, generate an App Password from your Google Account Security settings.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              Resend API Key
                            </label>
                            <input
                              type="password"
                              placeholder="re_123456789abcdef..."
                              value={smtpConfig.resendApiKey || ''}
                              onChange={(e) => setSmtpConfig({ ...smtpConfig, resendApiKey: e.target.value })}
                              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                            />
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                              Obtain your API key from resend.com/api-keys.
                            </p>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              Verified Sender Email
                            </label>
                            <input
                              type="text"
                              placeholder="Crown &amp; Blade &lt;onboarding@resend.dev&gt; or verified custom domain"
                              value={smtpConfig.from}
                              onChange={(e) => setSmtpConfig({ ...smtpConfig, from: e.target.value })}
                              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Diagnostic Email Test Sender */}
                    <div className="lg:col-span-5 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white">
                          <Send className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <span>Live SMTP Diagnostic Sender</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                          Send a real-time verification email to ensure your credentials, TLS handshake, and DNS sender authentication are 100% operational.
                        </p>

                        <div className="mt-3">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Recipient Email Address
                          </label>
                          <input
                            type="email"
                            placeholder="admin@yourdomain.com"
                            value={smtpTestEmail}
                            onChange={(e) => setSmtpTestEmail(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                          />
                        </div>

                        {smtpTestResult && (
                          <div className={`mt-3 p-3 rounded-xl text-xs border flex items-start gap-2 ${
                            smtpTestResult.success
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                          }`}>
                            {smtpTestResult.success ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <span className="font-semibold">{smtpTestResult.success ? 'Delivery Verified' : 'Delivery Test Failed'}:</span>{' '}
                              <span>{smtpTestResult.message}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleTestEmailSend}
                        disabled={smtpTesting || !smtpTestEmail.trim()}
                        className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {smtpTesting ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Connecting &amp; Sending...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Send Live Test Email</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Save Reminder */}
                <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-xs text-blue-900 dark:text-blue-200">
                    <Info className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>
                      Remember to click <strong>Save Channel Settings</strong> above to apply your Telegram, WhatsApp, and Webhook tokens to the live bot.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="shrink-0 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
  );
};
