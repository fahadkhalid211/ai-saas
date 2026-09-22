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
  FileSpreadsheet,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Settings,
  BookOpen,
  PhoneCall,
  Sliders,
  CheckCircle,
} from 'lucide-react';
import { GOOGLE_APPS_SCRIPT_TEMPLATE } from '@/lib/integrations/google-sheets-template';

export type IntegrationId =
  | 'slack'
  | 'google-sheets'
  | 'telegram'
  | 'whatsapp'
  | 'phone'
  | 'webhooks'
  | 'smtp'
  | 'whitelabel';

export const SlackIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 122.8 122.8" className={className}>
    <path d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zm6.5 0c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z" fill="#E01E5A" />
    <path d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zm0 6.5c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z" fill="#36C5F0" />
    <path d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2zm-6.5 0c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9v32.3z" fill="#2EB67D" />
    <path d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zm0-6.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z" fill="#ECB22E" />
  </svg>
);

export const GoogleSheetsIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 48 48" className={className}>
    <path fill="#0F9D58" d="M29 4H11c-2.2 0-4 1.8-4 4v32c0 2.2 1.8 4 4 4h26c2.2 0 4-1.8 4-4V16L29 4z" />
    <path fill="#EA4335" d="M29 4v12h12" opacity="0.2" />
    <path fill="#FFFFFF" d="M29 4v12h12L29 4z" />
    <path fill="#FFFFFF" opacity="0.3" d="M14 22h20v2H14zm0 6h20v2H14zm0 6h20v2H14z" />
    <rect x="14" y="22" width="20" height="15" rx="1.5" fill="#FFFFFF" />
    <path fill="#0F9D58" d="M16 24h7v4h-7zm9 0h7v4h-7zm-9 6h7v4h-7zm9 0h7v4h-7z" />
  </svg>
);

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
  // Navigation State
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationId>('slack');
  const [activeSubTab, setActiveSubTab] = useState<'settings' | 'guide'>('settings');

  // Secrets visibility toggles
  const [showTelegramToken, setShowTelegramToken] = useState(false);
  const [showWhatsAppToken, setShowWhatsAppToken] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);

  // Copy states
  const [copiedWaWebhookUrl, setCopiedWaWebhookUrl] = useState(false);
  const [copiedWaVerifyToken, setCopiedWaVerifyToken] = useState(false);
  const [copiedGoogleScript, setCopiedGoogleScript] = useState(false);

  // Diagnostic Test States
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

  const [slackTestStatus, setSlackTestStatus] = useState<{
    loading: boolean;
    tested?: boolean;
    success?: boolean;
    error?: string;
    statusCode?: number;
    latencyMs?: number;
  }>({ loading: false });

  const [googleSheetsTestStatus, setGoogleSheetsTestStatus] = useState<{
    loading: boolean;
    tested?: boolean;
    success?: boolean;
    error?: string;
    statusCode?: number;
    latencyMs?: number;
  }>({ loading: false });

  // Test Handlers
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

  async function handleSlackTestPing() {
    if (!formData.slackWebhookUrl?.trim()) {
      setSlackTestStatus({ loading: false, tested: true, success: false, error: 'Please enter a Slack Incoming Webhook URL.' });
      return;
    }
    setSlackTestStatus({ loading: true });
    try {
      const res = await fetch('/api/channels/slack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl: formData.slackWebhookUrl.trim(),
          assistantName: activeAssistant?.name || 'AI Assistant',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSlackTestStatus({
          loading: false,
          tested: true,
          success: true,
          statusCode: data.statusCode,
          latencyMs: data.latencyMs,
        });
      } else {
        setSlackTestStatus({
          loading: false,
          tested: true,
          success: false,
          error: data.error || 'Slack test ping failed',
          statusCode: data.statusCode,
          latencyMs: data.latencyMs,
        });
      }
    } catch (err: any) {
      setSlackTestStatus({
        loading: false,
        tested: true,
        success: false,
        error: err?.message || 'Failed to send test card to Slack',
      });
    }
  }

  async function handleGoogleSheetsTestPing() {
    if (!formData.googleSheetsWebhookUrl?.trim()) {
      setGoogleSheetsTestStatus({ loading: false, tested: true, success: false, error: 'Please enter a Google Sheets Web App URL.' });
      return;
    }
    setGoogleSheetsTestStatus({ loading: true });
    try {
      const res = await fetch('/api/channels/google-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl: formData.googleSheetsWebhookUrl.trim(),
          assistantName: activeAssistant?.name || 'AI Assistant',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGoogleSheetsTestStatus({
          loading: false,
          tested: true,
          success: true,
          statusCode: data.statusCode,
          latencyMs: data.latencyMs,
        });
      } else {
        setGoogleSheetsTestStatus({
          loading: false,
          tested: true,
          success: false,
          error: data.error || 'Google Sheets test row failed',
          statusCode: data.statusCode,
          latencyMs: data.latencyMs,
        });
      }
    } catch (err: any) {
      setGoogleSheetsTestStatus({
        loading: false,
        tested: true,
        success: false,
        error: err?.message || 'Failed to send test row to Google Sheets',
      });
    }
  }

  // Metadata for all 8 supported integrations
  const INTEGRATION_LIST = [
    {
      id: 'slack' as const,
      name: 'Slack Alerts',
      category: 'Alerts & Collaboration',
      badge: 'Real-Time Cards',
      summary: 'Post rich Block Kit cards into team channels for new leads and bookings.',
      icon: <SlackIcon className="h-5 w-5" />,
      isActive: Boolean(formData.slackEnabled && formData.slackWebhookUrl),
    },
    {
      id: 'google-sheets' as const,
      name: 'Google Sheets',
      category: 'Productivity & CRM',
      badge: 'Live Auto-Sync',
      summary: 'Append formatted 12-column customer rows directly to any Google Sheet.',
      icon: <GoogleSheetsIcon className="h-5 w-5" />,
      isActive: Boolean(formData.googleSheetsEnabled && formData.googleSheetsWebhookUrl),
    },
    {
      id: 'telegram' as const,
      name: 'Telegram Bot',
      category: 'Autonomous Messaging',
      badge: 'Zero API Cost',
      summary: 'Autonomous 24/7 client assistant answering questions and booking on Telegram.',
      icon: <SendHorizontal className="h-5 w-5 text-sky-500" />,
      isActive: Boolean(formData.telegramBotEnabled && formData.telegramBotToken),
    },
    {
      id: 'whatsapp' as const,
      name: 'WhatsApp Cloud',
      category: 'Autonomous Messaging',
      badge: 'Meta Business',
      summary: 'Official WhatsApp Business API integration for two-way automated client chats.',
      icon: <Radio className="h-5 w-5 text-emerald-500" />,
      isActive: Boolean(formData.whatsappEnabled && formData.whatsappPhoneNumberId),
    },
    {
      id: 'phone' as const,
      name: 'Phone & AI Voice',
      category: 'Inbound Telephony',
      badge: 'Sub-400ms Voice',
      summary: 'Connect carrier lines to answer incoming voice calls with local speech synthesis.',
      icon: <PhoneCall className="h-5 w-5 text-indigo-500" />,
      isActive: Boolean(formData.phoneEnabled && formData.phoneNumber),
    },
    {
      id: 'webhooks' as const,
      name: 'Zapier & Webhooks',
      category: 'Automation & CRM',
      badge: 'Event Stream',
      summary: 'Dispatch HMAC-SHA256 signed JSON payloads to Zapier, Make, n8n, or your CRM.',
      icon: <Webhook className="h-5 w-5 text-amber-500" />,
      isActive: Boolean(formData.webhookUrl),
    },
    {
      id: 'smtp' as const,
      name: 'Custom SMTP',
      category: 'Email Delivery',
      badge: 'Branded Sender',
      summary: 'Route appointment confirmations and alerts via your dedicated mail server.',
      icon: <Mail className="h-5 w-5 text-blue-500" />,
      isActive: Boolean(smtpConfig?.host && smtpConfig?.user),
    },
    {
      id: 'whitelabel' as const,
      name: 'Agency White-Label',
      category: 'Reseller & Agency',
      badge: 'Client Branding',
      summary: 'Remove Crescelo branding and display your agency watermark and backlink.',
      icon: <Shield className="h-5 w-5 text-purple-500" />,
      isActive: Boolean(formData.whiteLabelEnabled),
    },
  ];

  const currentItem = INTEGRATION_LIST.find((item) => item.id === selectedIntegration) || INTEGRATION_LIST[0];
  const activeCount = INTEGRATION_LIST.filter((i) => i.isActive).length;

  return (
    <div className="max-w-6xl space-y-7 mx-auto pb-14">
      {/* 1. Header Bar with Global Save Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Channels &amp; Integrations Hub
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 uppercase tracking-wider">
              {activeCount} of {INTEGRATION_LIST.length} Connected
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            Configure native integrations, messaging bots, real-time alerts, and automation pipelines with step-by-step guides.
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
            className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-xs font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer"
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

      {/* 2. Primary Integration Selector Dropdown & Quick Switcher */}
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Sliders className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Select Integration to Configure &amp; Inspect:</span>
          </div>

          {/* Styled Select Dropdown */}
          <div className="relative min-w-[280px]">
            <select
              value={selectedIntegration}
              onChange={(e) => setSelectedIntegration(e.target.value as IntegrationId)}
              className="w-full appearance-none rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 px-4 py-2.5 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 pr-10 cursor-pointer shadow-xs"
            >
              {INTEGRATION_LIST.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} — {item.isActive ? 'Active' : 'Setup Required'} ({item.category})
                </option>
              ))}
            </select>
            <ChevronDown className="h-4 w-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Quick-Switch Horizontal Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {INTEGRATION_LIST.map((item) => {
            const isSelected = selectedIntegration === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedIntegration(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/60'
                }`}
              >
                <span className="shrink-0">{item.icon}</span>
                <span>{item.name}</span>
                <span
                  className={`h-2 w-2 rounded-full ${
                    item.isActive ? (isSelected ? 'bg-white' : 'bg-emerald-500') : (isSelected ? 'bg-blue-300' : 'bg-slate-300 dark:bg-slate-600')
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Integration View Header & Dual Sub-Tabs */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs">
              {currentItem.icon}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {currentItem.name}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60">
                  {currentItem.badge}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    currentItem.isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {currentItem.isActive ? 'Connected & Active' : 'Setup Required'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {currentItem.summary}
              </p>
            </div>
          </div>

          {/* Sub-Tab Navigation Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold shrink-0">
            <button
              type="button"
              onClick={() => setActiveSubTab('settings')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
                activeSubTab === 'settings'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Settings &amp; Test</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('guide')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
                activeSubTab === 'guide'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Step-by-Step Guide</span>
            </button>
          </div>
        </div>

        {/* 4. ISOLATED INTEGRATION CONTENT PANELS */}

        {/* ======================================================== */}
        {/* INTEGRATION 1: SLACK ALERTS                             */}
        {/* ======================================================== */}
        {selectedIntegration === 'slack' && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs space-y-6">
            {activeSubTab === 'settings' ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Slack Incoming Webhook Configuration
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Enter your Slack Incoming Webhook URL to stream alerts to your team channel.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSlackTestPing}
                      disabled={slackTestStatus.loading || !formData.slackWebhookUrl}
                      className="flex items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-900/80 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 px-4 py-2 text-xs font-semibold shadow-2xs transition disabled:opacity-50 cursor-pointer"
                    >
                      {slackTestStatus.loading ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin text-rose-600" />
                      ) : (
                        <Send className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                      )}
                      <span>Send Live Test Ping</span>
                    </button>

                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.slackEnabled || false}
                        onChange={(e) => setFormData({ ...formData, slackEnabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
                      <span className="ml-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {formData.slackEnabled ? 'Active' : 'Disabled'}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Slack Incoming Webhook URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX"
                        value={formData.slackWebhookUrl || ''}
                        onChange={(e) => setFormData({ ...formData, slackWebhookUrl: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-rose-500"
                      />
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Need a webhook URL? Switch to the <strong>Step-by-Step Guide</strong> tab above.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Notified Slack Events
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(formData.slackEvents || ['lead.created', 'appointment.created']).includes('lead.created')}
                            onChange={(e) => {
                              const current: string[] = formData.slackEvents || ['lead.created', 'appointment.created'];
                              const next = e.target.checked
                                ? [...current, 'lead.created']
                                : current.filter((x: string) => x !== 'lead.created');
                              setFormData({ ...formData, slackEvents: next });
                            }}
                            className="rounded text-rose-600 focus:ring-rose-500 dark:bg-slate-950 dark:border-slate-800"
                          />
                          <span><strong className="font-semibold">lead.created</strong> — Post rich card when a visitor submits contact information</span>
                        </label>

                        <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(formData.slackEvents || ['lead.created', 'appointment.created']).includes('appointment.created')}
                            onChange={(e) => {
                              const current: string[] = formData.slackEvents || ['lead.created', 'appointment.created'];
                              const next = e.target.checked
                                ? [...current, 'appointment.created']
                                : current.filter((x: string) => x !== 'appointment.created');
                              setFormData({ ...formData, slackEvents: next });
                            }}
                            className="rounded text-rose-600 focus:ring-rose-500 dark:bg-slate-950 dark:border-slate-800"
                          />
                          <span><strong className="font-semibold">appointment.created</strong> — Post schedule alert with customer details &amp; meeting links</span>
                        </label>
                      </div>
                    </div>

                    {slackTestStatus.tested && (
                      <div
                        className={`p-3.5 rounded-xl border text-xs ${
                          slackTestStatus.success
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
                            : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <div className="flex items-center gap-1.5">
                            {slackTestStatus.success ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                            )}
                            <span>{slackTestStatus.success ? 'Slack Webhook Verified (HTTP 200 OK)' : 'Slack Dispatch Failed'}</span>
                          </div>
                          {slackTestStatus.latencyMs !== undefined && (
                            <span className="font-mono text-[11px] opacity-80">{slackTestStatus.latencyMs}ms latency</span>
                          )}
                        </div>
                        {slackTestStatus.error && (
                          <p className="mt-1 text-[11px] font-mono opacity-90">{slackTestStatus.error}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Slack Preview Mockup */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#1A1D21] text-slate-100 space-y-3 font-sans">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400 pb-2 border-b border-[#2C3136]">
                      <span className="flex items-center gap-2">
                        <SlackIcon className="h-4 w-4" />
                        <span className="text-white font-medium">#general-leads channel</span>
                      </span>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Slack Block Kit</span>
                    </div>

                    <div className="bg-[#222529] p-3.5 rounded-lg border-l-4 border-emerald-500 space-y-2.5 text-xs">
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>🎯 New Lead Captured!</span>
                      </div>
                      <p className="text-slate-300 text-[11px]">
                        A new prospective customer just engaged with <strong className="text-white">{activeAssistant?.name || 'AI Assistant'}</strong>:
                      </p>
                      <div className="grid grid-cols-2 gap-2 bg-[#1A1D21] p-2.5 rounded text-[11px]">
                        <div>
                          <span className="text-slate-400 block font-semibold">Lead Name:</span>
                          <span className="text-white font-medium">Jordan Rivera</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-semibold">Email Address:</span>
                          <span className="text-sky-400 font-medium">jordan@acme-enterprises.com</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-semibold">Phone Number:</span>
                          <span className="text-white font-medium">+1 (555) 438-9210</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-semibold">Source:</span>
                          <span className="text-emerald-400 font-medium">Website Live Chat</span>
                        </div>
                      </div>
                      <div className="border-l-2 border-slate-600 pl-2 text-[11px] text-slate-300 italic">
                        "Looking to automate appointment scheduling for our 12-location clinic network."
                      </div>
                      <div className="text-[10px] text-slate-500 pt-1">
                        🤖 {activeAssistant?.name || 'Crescelo AI'} • Just now
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* SLACK STEP-BY-STEP GUIDE */
              <div className="space-y-5 text-xs">
                <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-blue-900 dark:text-blue-200 text-sm">
                      How Slack Incoming Webhooks Work
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Slack Incoming Webhooks provide a secure HTTPS endpoint where Crescelo posts real-time customer activity directly into a channel of your choice. No bot hosting or paid Slack apps required.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    4-Step Slack Integration Setup
                  </h4>
                  <ol className="space-y-3.5 list-decimal list-inside text-slate-700 dark:text-slate-300 leading-relaxed">
                    <li className="pl-1">
                      <strong>Open Slack API Dashboard:</strong> Navigate to{' '}
                      <a
                        href="https://api.slack.com/apps"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline font-semibold inline-flex items-center gap-1"
                      >
                        api.slack.com/apps <ExternalLink className="h-3 w-3 inline" />
                      </a>{' '}
                      and click <strong>Create New App</strong> &gt; <em>From scratch</em>.
                    </li>
                    <li className="pl-1">
                      <strong>Name your app:</strong> Enter a name like <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">Crescelo Bot</code> and select your Slack workspace.
                    </li>
                    <li className="pl-1">
                      <strong>Activate Incoming Webhooks:</strong> In the left sidebar, click <strong>Incoming Webhooks</strong>, and toggle the switch to <strong>On</strong>.
                    </li>
                    <li className="pl-1">
                      <strong>Add Webhook to Workspace:</strong> Scroll down and click <strong>Add New Webhook to Workspace</strong>. Choose the channel you want notifications sent to (e.g. <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">#leads</code> or <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">#appointments</code>), and click <em>Allow</em>.
                    </li>
                    <li className="pl-1">
                      <strong>Copy &amp; Paste:</strong> Copy the generated Webhook URL, switch to the <strong>Settings &amp; Test</strong> tab above, paste it into the field, and click <strong>Send Live Test Ping</strong>!
                    </li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* INTEGRATION 2: GOOGLE SHEETS SYNC                       */}
        {/* ======================================================== */}
        {selectedIntegration === 'google-sheets' && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs space-y-6">
            {activeSubTab === 'settings' ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Google Sheets Web App Configuration
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Automatically appends 12-column rows for every lead and booking into your spreadsheet.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleGoogleSheetsTestPing}
                      disabled={googleSheetsTestStatus.loading || !formData.googleSheetsWebhookUrl}
                      className="flex items-center gap-1.5 rounded-xl border border-emerald-200 dark:border-emerald-900/80 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 px-4 py-2 text-xs font-semibold shadow-2xs transition disabled:opacity-50 cursor-pointer"
                    >
                      {googleSheetsTestStatus.loading ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-600" />
                      ) : (
                        <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      )}
                      <span>Append Test Row</span>
                    </button>

                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.googleSheetsEnabled || false}
                        onChange={(e) => setFormData({ ...formData, googleSheetsEnabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
                      <span className="ml-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {formData.googleSheetsEnabled ? 'Active' : 'Disabled'}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Google Apps Script Web App URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                        value={formData.googleSheetsWebhookUrl || ''}
                        onChange={(e) => setFormData({ ...formData, googleSheetsWebhookUrl: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
                      />
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Need the Apps Script template? Click the <strong>Step-by-Step Guide</strong> tab above.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Synced Events
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(formData.googleSheetsEvents || ['lead.created', 'appointment.created']).includes('lead.created')}
                            onChange={(e) => {
                              const current: string[] = formData.googleSheetsEvents || ['lead.created', 'appointment.created'];
                              const next = e.target.checked
                                ? [...current, 'lead.created']
                                : current.filter((x: string) => x !== 'lead.created');
                              setFormData({ ...formData, googleSheetsEvents: next });
                            }}
                            className="rounded text-emerald-600 focus:ring-emerald-500 dark:bg-slate-950 dark:border-slate-800"
                          />
                          <span><strong className="font-semibold">lead.created</strong> — Append row when a new contact lead is captured</span>
                        </label>

                        <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(formData.googleSheetsEvents || ['lead.created', 'appointment.created']).includes('appointment.created')}
                            onChange={(e) => {
                              const current: string[] = formData.googleSheetsEvents || ['lead.created', 'appointment.created'];
                              const next = e.target.checked
                                ? [...current, 'appointment.created']
                                : current.filter((x: string) => x !== 'appointment.created');
                              setFormData({ ...formData, googleSheetsEvents: next });
                            }}
                            className="rounded text-emerald-600 focus:ring-emerald-500 dark:bg-slate-950 dark:border-slate-800"
                          />
                          <span><strong className="font-semibold">appointment.created</strong> — Append row with booking date, time, and service</span>
                        </label>
                      </div>
                    </div>

                    {googleSheetsTestStatus.tested && (
                      <div
                        className={`p-3.5 rounded-xl border text-xs ${
                          googleSheetsTestStatus.success
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
                            : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <div className="flex items-center gap-1.5">
                            {googleSheetsTestStatus.success ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                            )}
                            <span>{googleSheetsTestStatus.success ? 'Row Appended Successfully (HTTP 200 OK)' : 'Google Sheets Sync Failed'}</span>
                          </div>
                          {googleSheetsTestStatus.latencyMs !== undefined && (
                            <span className="font-mono text-[11px] opacity-80">{googleSheetsTestStatus.latencyMs}ms latency</span>
                          )}
                        </div>
                        {googleSheetsTestStatus.error && (
                          <p className="mt-1 text-[11px] font-mono opacity-90">{googleSheetsTestStatus.error}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Spreadsheet Live Preview */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 space-y-3 font-sans overflow-hidden">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400 pb-2 border-b border-slate-800">
                      <span className="flex items-center gap-2">
                        <GoogleSheetsIcon className="h-4 w-4" />
                        <span className="text-white font-medium">Spreadsheet Auto-Sync View</span>
                      </span>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400">12 Columns Auto-Generated</span>
                    </div>

                    <div className="overflow-x-auto text-[11px]">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#08251a] text-[#abff44] font-semibold border-b border-emerald-900/50">
                            <th className="p-2 whitespace-nowrap">Timestamp</th>
                            <th className="p-2 whitespace-nowrap">Event</th>
                            <th className="p-2 whitespace-nowrap">Customer Name</th>
                            <th className="p-2 whitespace-nowrap">Email</th>
                            <th className="p-2 whitespace-nowrap">Service</th>
                            <th className="p-2 whitespace-nowrap">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 font-mono text-[10px] text-slate-300">
                          <tr className="hover:bg-slate-900/60">
                            <td className="p-2 whitespace-nowrap text-slate-400">{new Date().toISOString().slice(0, 16)}</td>
                            <td className="p-2 whitespace-nowrap text-emerald-400">lead.created</td>
                            <td className="p-2 whitespace-nowrap text-white font-sans">Elena Rostova</td>
                            <td className="p-2 whitespace-nowrap">elena@techlabs.co</td>
                            <td className="p-2 whitespace-nowrap">Enterprise Consultation</td>
                            <td className="p-2 whitespace-nowrap truncate max-w-[120px]">Requested custom demo</td>
                          </tr>
                          <tr className="hover:bg-slate-900/60">
                            <td className="p-2 whitespace-nowrap text-slate-400">{new Date(Date.now() - 3600000).toISOString().slice(0, 16)}</td>
                            <td className="p-2 whitespace-nowrap text-sky-400">appointment.created</td>
                            <td className="p-2 whitespace-nowrap text-white font-sans">Marcus Brody</td>
                            <td className="p-2 whitespace-nowrap">marcus@brody.io</td>
                            <td className="p-2 whitespace-nowrap">Haircut &amp; Styling</td>
                            <td className="p-2 whitespace-nowrap truncate max-w-[120px]">Confirmed slot 2:30 PM</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* GOOGLE SHEETS SETUP GUIDE */
              <div className="space-y-5 text-xs">
                <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-3">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                      30-Second Google Apps Script Setup
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Deploy this lightweight Google Apps Script directly in your spreadsheet. It handles concurrency, automatically initializes formatted headers on new sheets, and appends incoming customer rows.
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    Step-by-Step Instructions:
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 text-slate-700 dark:text-slate-300 leading-relaxed">
                    <li>Create a new spreadsheet at <strong>sheets.new</strong> (or open an existing one).</li>
                    <li>In the top menu, click <strong>Extensions &gt; Apps Script</strong>.</li>
                    <li>Delete any starter code, and paste the complete script below.</li>
                    <li>Click <strong>Deploy &gt; New deployment</strong> in the top right corner.</li>
                    <li>Click the gear icon next to <em>Select type</em> and select <strong>Web app</strong>.</li>
                    <li>Set <strong>Execute as:</strong> <em>Me</em>, and <strong>Who has access:</strong> <em>Anyone</em> (required so Crescelo can post rows).</li>
                    <li>Click <strong>Deploy</strong>, grant account permissions, and copy the <strong>Web app URL</strong>.</li>
                    <li>Paste the URL into the <em>Settings &amp; Test</em> tab above and click <strong>Append Test Row</strong>!</li>
                  </ol>

                  <div className="relative pt-2">
                    <div className="flex items-center justify-between pb-2">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs">Copy-Paste Google Apps Script Code:</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE);
                          setCopiedGoogleScript(true);
                          setTimeout(() => setCopiedGoogleScript(false), 2500);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition cursor-pointer shadow-xs"
                      >
                        {copiedGoogleScript ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            <span>Copied to Clipboard!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy Complete Script</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-72 leading-relaxed border border-slate-800">
                      {GOOGLE_APPS_SCRIPT_TEMPLATE}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* INTEGRATION 3: TELEGRAM BOT                             */}
        {/* ======================================================== */}
        {selectedIntegration === 'telegram' && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs space-y-6">
            {activeSubTab === 'settings' ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Telegram Bot Token &amp; Webhook
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Connect your Telegram bot token to provide automated answers directly in Telegram chats.
                    </p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.telegramBotEnabled || false}
                      onChange={(e) => setFormData({ ...formData, telegramBotEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-sky-600"></div>
                    <span className="ml-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {formData.telegramBotEnabled ? 'Active' : 'Disabled'}
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Telegram Bot API Token
                      </label>
                      <div className="relative">
                        <input
                          type={showTelegramToken ? 'text' : 'password'}
                          placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                          value={formData.telegramBotToken || ''}
                          onChange={(e) => setFormData({ ...formData, telegramBotToken: e.target.value })}
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
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleTelegramVerify}
                        disabled={telegramStatus.loading || !formData.telegramBotToken}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-sky-200 dark:border-sky-900 bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 text-sky-800 dark:text-sky-300 py-2.5 text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
                      >
                        {telegramStatus.loading ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin text-sky-600" />
                        ) : (
                          <ShieldCheck className="h-3.5 w-3.5 text-sky-600" />
                        )}
                        <span>1. Verify Bot Token</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleTelegramSetWebhook}
                        disabled={telegramWebhookStatus.loading || !formData.telegramBotToken}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white py-2.5 text-xs font-semibold transition disabled:opacity-50 cursor-pointer shadow-xs"
                      >
                        {telegramWebhookStatus.loading ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Zap className="h-3.5 w-3.5" />
                        )}
                        <span>2. Register Webhook</span>
                      </button>
                    </div>

                    {telegramStatus.tested && (
                      <div
                        className={`p-3 rounded-xl border text-xs ${
                          telegramStatus.success
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
                            : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-semibold">
                          {telegramStatus.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                          <span>{telegramStatus.success ? `Verified: @${telegramStatus.botInfo?.username}` : 'Verification Failed'}</span>
                        </div>
                        {telegramStatus.error && <p className="mt-1 text-[11px] font-mono">{telegramStatus.error}</p>}
                      </div>
                    )}

                    {telegramWebhookStatus.message && (
                      <div className="p-3 rounded-xl border bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{telegramWebhookStatus.message}</span>
                      </div>
                    )}
                  </div>

                  {/* Telegram Preview */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#0E1621] text-white space-y-3 font-sans">
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800 text-slate-400">
                      <span className="flex items-center gap-2">
                        <SendHorizontal className="h-4 w-4 text-sky-400" />
                        <span className="text-white font-medium">Telegram Chat Mockup</span>
                      </span>
                      <span className="text-[10px] text-sky-400">@bot live view</span>
                    </div>

                    <div className="space-y-3 pt-2 text-xs">
                      <div className="bg-[#182533] p-3 rounded-2xl rounded-tl-sm max-w-[85%] space-y-1">
                        <p className="text-slate-200 text-[11px]">
                          Hello! What are your consultation hours and rates?
                        </p>
                        <span className="text-[9px] text-slate-400 block text-right">10:42 AM</span>
                      </div>

                      <div className="bg-[#2B5278] p-3 rounded-2xl rounded-tr-sm max-w-[85%] ml-auto space-y-1">
                        <p className="text-white text-[11px] font-medium">
                          We are open Monday–Saturday from 9:00 AM to 7:00 PM. Would you like me to reserve a consultation slot for you?
                        </p>
                        <span className="text-[9px] text-sky-200 block text-right">10:42 AM · ✓✓</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* TELEGRAM SETUP GUIDE */
              <div className="space-y-5 text-xs">
                <div className="p-4 rounded-xl bg-sky-50/50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/60 flex items-start gap-3">
                  <SendHorizontal className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sky-900 dark:text-sky-200 text-sm">
                      How to Create a Telegram Bot in 2 Minutes
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Telegram allows developers to create free autonomous bots through the official @BotFather. No credit card or developer fees required.
                    </p>
                  </div>
                </div>

                <ol className="list-decimal list-inside space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
                  <li>Open Telegram and search for <strong>@BotFather</strong> (verified with blue checkmark).</li>
                  <li>Send the command <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-sky-600">/newbot</code>.</li>
                  <li>Follow prompts to choose a display name (e.g. <em>Crescelo Concierge</em>) and a username ending in <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">bot</code> (e.g. <em>acme_clinic_bot</em>).</li>
                  <li>BotFather will reply with an <strong>HTTP API Token</strong> (e.g. <code className="font-mono">712938192:AAHj...</code>).</li>
                  <li>Copy that token, switch to the <strong>Settings &amp; Test</strong> tab above, paste it, and click <strong>Verify Bot Token</strong>.</li>
                  <li>Click <strong>Register Webhook</strong> to bind your bot to Crescelo. Messages sent to your bot will now receive instant AI responses!</li>
                </ol>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* INTEGRATION 4: WHATSAPP CLOUD API                       */}
        {/* ======================================================== */}
        {selectedIntegration === 'whatsapp' && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs space-y-6">
            {activeSubTab === 'settings' ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Meta WhatsApp Business Cloud API
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Connect official Meta Cloud API credentials to power WhatsApp client conversations.
                    </p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.whatsappEnabled || false}
                      onChange={(e) => setFormData({ ...formData, whatsappEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
                    <span className="ml-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {formData.whatsappEnabled ? 'Active' : 'Disabled'}
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        WhatsApp Phone Number ID
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 104928192837182"
                        value={formData.whatsappPhoneNumberId || ''}
                        onChange={(e) => setFormData({ ...formData, whatsappPhoneNumberId: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        System User Access Token (Permanent)
                      </label>
                      <div className="relative">
                        <input
                          type={showWhatsAppToken ? 'text' : 'password'}
                          placeholder="EAAG..."
                          value={formData.whatsappAccessToken || ''}
                          onChange={(e) => setFormData({ ...formData, whatsappAccessToken: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowWhatsAppToken(!showWhatsAppToken)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                          {showWhatsAppToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Webhook Verify Token
                      </label>
                      <input
                        type="text"
                        placeholder="custom_verification_secret"
                        value={formData.whatsappVerifyToken || ''}
                        onChange={(e) => setFormData({ ...formData, whatsappVerifyToken: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Callback URL Card */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3 text-xs">
                    <h4 className="font-bold text-slate-900 dark:text-white">Meta Webhook Credentials to Paste in Meta:</h4>
                    
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500">Callback URL:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          readOnly
                          value={typeof window !== 'undefined' ? `${window.location.origin}/api/channels/whatsapp` : '/api/channels/whatsapp'}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-[11px]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/api/channels/whatsapp`);
                            setCopiedWaWebhookUrl(true);
                            setTimeout(() => setCopiedWaWebhookUrl(false), 2000);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs transition cursor-pointer"
                        >
                          {copiedWaWebhookUrl ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-slate-500">Verify Token:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          readOnly
                          value={formData.whatsappVerifyToken || 'crescelo_verify_token'}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-[11px]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(formData.whatsappVerifyToken || 'crescelo_verify_token');
                            setCopiedWaVerifyToken(true);
                            setTimeout(() => setCopiedWaVerifyToken(false), 2000);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs transition cursor-pointer"
                        >
                          {copiedWaVerifyToken ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* WHATSAPP SETUP GUIDE */
              <div className="space-y-5 text-xs">
                <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-3">
                  <Radio className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                      Meta WhatsApp Business Setup
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Connect official Meta Cloud API credentials to power WhatsApp customer conversations directly from your registered company number.
                    </p>
                  </div>
                </div>

                <ol className="list-decimal list-inside space-y-2.5 text-slate-700 dark:text-slate-300 leading-relaxed">
                  <li>Go to <strong>developers.facebook.com</strong> and sign in with your Meta account.</li>
                  <li>Click <strong>My Apps &gt; Create App</strong>, select <em>Other &gt; Business</em>.</li>
                  <li>In your app dashboard, find <strong>WhatsApp</strong> and click <em>Set up</em>.</li>
                  <li>Under <em>API Setup</em>, copy your <strong>Phone Number ID</strong> and temporary/system token into the Settings tab.</li>
                  <li>Under <em>Configuration &gt; Webhook</em>, click <strong>Edit</strong>. Paste your Callback URL and Verify Token from the Settings tab.</li>
                  <li>Under <em>Webhook fields</em>, subscribe to the <strong>messages</strong> event. Your assistant is now ready to receive WhatsApp messages!</li>
                </ol>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* INTEGRATION 5: PHONE & AI VOICE WORKER                  */}
        {/* ======================================================== */}
        {selectedIntegration === 'phone' && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs space-y-6">
            {activeSubTab === 'settings' ? (
              <PhoneChannelCard
                activeAssistant={activeAssistant}
                formData={formData}
                setFormData={setFormData}
                handleSaveSettings={handleSaveSettings}
                isSaving={isSaving}
                isMasterAdmin={Boolean(isMasterAdmin)}
              />
            ) : (
              /* PHONE SETUP GUIDE */
              <div className="space-y-5 text-xs">
                <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 flex items-start gap-3">
                  <PhoneCall className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-indigo-900 dark:text-indigo-200 text-sm">
                      How Crescelo Inbound AI Voice Works
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Crescelo connects to wholesale telephony providers (Telnyx / Twilio) using TeXML and WebSocket audio streams. Faster-whisper transcribes caller audio, your assistant formulates knowledge responses, and Piper synthesizes neural speech in under 400ms.
                    </p>
                  </div>
                </div>

                <ol className="list-decimal list-inside space-y-2.5 text-slate-700 dark:text-slate-300 leading-relaxed">
                  <li>Obtain an E.164 phone number from Telnyx (recommended for wholesale pricing) or Twilio.</li>
                  <li>In your Telnyx Mission Control Portal / Twilio Console, navigate to <strong>Call Control / Phone Numbers</strong>.</li>
                  <li>Configure the Voice Webhook URL to: <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-indigo-600">{typeof window !== 'undefined' ? `${window.location.origin}/api/channels/voice` : '/api/channels/voice'}</code></li>
                  <li>Set HTTP method to <strong>POST</strong>.</li>
                  <li>In the <em>Settings</em> tab, assign the phone number to your assistant, set your greeting, and choose a neural voice.</li>
                  <li>Dial the number from your mobile phone to test live conversational answering!</li>
                </ol>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* INTEGRATION 6: OUTBOUND WEBHOOKS (ZAPIER / MAKE / N8N)  */}
        {/* ======================================================== */}
        {selectedIntegration === 'webhooks' && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs space-y-6">
            {activeSubTab === 'settings' ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Outbound Webhooks (Zapier, Make.com, n8n, CRM)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Stream captured leads and booking events into third-party automation tools with HMAC signatures.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleWebhookTestPing}
                    disabled={webhookTestStatus.loading || !formData.webhookUrl}
                    className="flex items-center gap-1.5 rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 px-4 py-2 text-xs font-semibold shadow-2xs transition disabled:opacity-50 cursor-pointer"
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
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Target Webhook URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://hooks.zapier.com/hooks/catch/... or https://hook.eu1.make.com/..."
                        value={formData.webhookUrl || ''}
                        onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
                      />
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
                          onChange={(e) => setFormData({ ...formData, webhookSecret: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                          {showWebhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

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
                          <span><strong className="font-semibold">lead.created</strong> — Fired when a visitor submits contact details</span>
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
                          <span><strong className="font-semibold">conversation.escalated</strong> — Fired when a human agent is requested</span>
                        </label>
                      </div>
                    </div>

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
                            {webhookTestStatus.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                            <span>{webhookTestStatus.success ? 'Webhook 200 OK Received' : 'Ping Failed'}</span>
                          </div>
                          {webhookTestStatus.latencyMs !== undefined && (
                            <span className="font-mono text-[11px] opacity-80">{webhookTestStatus.latencyMs}ms latency</span>
                          )}
                        </div>
                        {webhookTestStatus.error && <p className="mt-1 text-[11px] font-mono">{webhookTestStatus.error}</p>}
                      </div>
                    )}
                  </div>

                  {/* Sample JSON Payload */}
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
            ) : (
              /* WEBHOOKS SETUP GUIDE */
              <div className="space-y-5 text-xs">
                <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
                  <Webhook className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                      Connecting to Zapier, Make.com, or Custom Backends
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Whenever an event fires, Crescelo sends an HTTPS POST request containing JSON data and an optional HMAC SHA-256 header (<code className="font-mono">X-Crescelo-Signature</code>).
                    </p>
                  </div>
                </div>

                <ol className="list-decimal list-inside space-y-2.5 text-slate-700 dark:text-slate-300 leading-relaxed">
                  <li>In <strong>Zapier</strong>, create a Zap and select <strong>Webhooks by Zapier &gt; Catch Hook</strong>.</li>
                  <li>In <strong>Make.com</strong>, add a <strong>Custom Webhook</strong> module and click <em>Create a Webhook</em>.</li>
                  <li>Copy the webhook URL provided by Zapier/Make and paste it into the <em>Settings</em> tab above.</li>
                  <li>(Optional) Define a signing secret to verify payload authenticity on your server.</li>
                  <li>Click <strong>Send Live Test Ping</strong> in Crescelo to test the trigger and establish data schema!</li>
                </ol>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* INTEGRATION 7: CUSTOM OUTBOUND SMTP SERVER               */}
        {/* ======================================================== */}
        {selectedIntegration === 'smtp' && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs space-y-6">
            {activeSubTab === 'settings' ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Custom Outbound SMTP Server Settings
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Send lead notifications and calendar booking emails from your custom business email address.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {smtpSaveSuccess && (
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        <Check className="w-3.5 h-3.5" /> Saved
                      </span>
                    )}
                    {smtpSaveError && (
                      <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-800">
                        <AlertTriangle className="w-3.5 h-3.5" /> {smtpSaveError}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={handleSaveSmtpSettings}
                      disabled={smtpLoading}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                    >
                      {smtpLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      <span>Save SMTP Settings</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: Configuration Form */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          SMTP Host
                        </label>
                        <input
                          type="text"
                          placeholder="smtp.gmail.com or smtp.sendgrid.net"
                          value={smtpConfig?.host || ''}
                          onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Port
                        </label>
                        <input
                          type="number"
                          placeholder="587"
                          value={smtpConfig?.port || ''}
                          onChange={(e) => setSmtpConfig({ ...smtpConfig, port: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          SMTP Username
                        </label>
                        <input
                          type="text"
                          placeholder="apikey or user@domain.com"
                          value={smtpConfig?.user || ''}
                          onChange={(e) => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          SMTP Password
                        </label>
                        <div className="relative">
                          <input
                            type={showSmtpPassword ? 'text' : 'password'}
                            placeholder="App Password or API key"
                            value={smtpConfig?.pass || ''}
                            onChange={(e) => setSmtpConfig({ ...smtpConfig, pass: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 font-mono pr-9"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                          >
                            {showSmtpPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Sender Name
                        </label>
                        <input
                          type="text"
                          placeholder="Acme Concierge"
                          value={smtpConfig?.fromName || ''}
                          onChange={(e) => setSmtpConfig({ ...smtpConfig, fromName: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Sender Email
                        </label>
                        <input
                          type="email"
                          placeholder="assistant@yourdomain.com"
                          value={smtpConfig?.fromEmail || ''}
                          onChange={(e) => setSmtpConfig({ ...smtpConfig, fromEmail: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right: Diagnostic Email Test Sender */}
                  <div className="lg:col-span-5 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white">
                        <Send className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Live SMTP Diagnostic Sender</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        Send a test email to verify credentials, TLS handshake, and DNS sender authentication.
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
            ) : (
              /* SMTP SETUP GUIDE */
              <div className="space-y-5 text-xs">
                <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 flex items-start gap-3">
                  <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-blue-900 dark:text-blue-200 text-sm">
                      Recommended SMTP Providers &amp; Ports
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Use port 587 with STARTTLS or port 465 with SSL. For Gmail, generate a 16-character App Password under Google Account Security.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1.5">
                    <h5 className="font-bold text-slate-900 dark:text-white">Gmail / Google Workspace</h5>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px]">Host: <code className="font-mono">smtp.gmail.com</code> | Port: 587</p>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px]">Password: Create a 16-letter App Password at <em>myaccount.google.com/apppasswords</em>.</p>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1.5">
                    <h5 className="font-bold text-slate-900 dark:text-white">SendGrid / Twilio</h5>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px]">Host: <code className="font-mono">smtp.sendgrid.net</code> | Port: 587</p>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px]">Username: <code className="font-mono">apikey</code> | Password: Your SendGrid API Key.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* INTEGRATION 8: AGENCY WHITE-LABELING                    */}
        {/* ======================================================== */}
        {selectedIntegration === 'whitelabel' && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs space-y-6">
            {activeSubTab === 'settings' ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Agency White-Labeling &amp; Custom Branding
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Remove "Powered by Crescelo" and replace with your agency watermark and backlink.
                    </p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.whiteLabelEnabled || false}
                      onChange={(e) => setFormData({ ...formData, whiteLabelEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-purple-600"></div>
                    <span className="ml-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {formData.whiteLabelEnabled ? 'White-Label Active' : 'Default Branding'}
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Custom Footer Watermark Text
                      </label>
                      <input
                        type="text"
                        placeholder="Powered by Acme Digital Agency"
                        value={formData.customBrandingText || ''}
                        onChange={(e) => setFormData({ ...formData, customBrandingText: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Agency Backlink URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://acmedigital.com"
                        value={formData.customBrandingUrl || ''}
                        onChange={(e) => setFormData({ ...formData, customBrandingUrl: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  {/* White-Label Preview */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col justify-between space-y-3">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Live Widget Footer Preview:
                    </span>
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center shadow-xs">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {formData.whiteLabelEnabled && formData.customBrandingText ? (
                          <a
                            href={formData.customBrandingUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 dark:text-purple-400 font-semibold hover:underline"
                          >
                            {formData.customBrandingText}
                          </a>
                        ) : (
                          <span>
                            ⚡ Powered by <strong className="text-slate-800 dark:text-slate-200">Crescelo AI</strong>
                          </span>
                        )}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      This watermark renders at the bottom of web widgets and landing pages.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* WHITE-LABEL GUIDE */
              <div className="space-y-5 text-xs">
                <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 flex items-start gap-3">
                  <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-purple-900 dark:text-purple-200 text-sm">
                      Reselling Chatbots Under Your Agency Brand
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      White-labeling allows marketing agencies and consultants to deliver AI concierge systems to client websites without displaying Crescelo branding.
                    </p>
                  </div>
                </div>

                <ol className="list-decimal list-inside space-y-2.5 text-slate-700 dark:text-slate-300 leading-relaxed">
                  <li>Toggle <strong>White-Label Active</strong> on in the Settings tab.</li>
                  <li>Enter your agency name in <strong>Custom Footer Watermark Text</strong> (e.g. <em>Powered by Hyperion Growth</em>).</li>
                  <li>Enter your website URL in <strong>Agency Backlink URL</strong>.</li>
                  <li>Click <strong>Save Channel Settings</strong>. All widget scripts will immediately render your agency credit and link.</li>
                </ol>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Save Reminder */}
      <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-xs text-blue-900 dark:text-blue-200">
          <Info className="h-4 w-4 text-blue-600 shrink-0" />
          <span>
            Remember to click <strong>Save Channel Settings</strong> above to apply your integration updates to the live bot.
          </span>
        </div>
        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="shrink-0 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};
