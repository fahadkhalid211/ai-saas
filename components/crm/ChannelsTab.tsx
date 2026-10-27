import { T, useT } from '@/lib/i18n/context';
import { SaveButton } from '@/components/ui/SaveButton';
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
import { CresceloMark } from '@/components/brand/CresceloMark';
import { GOOGLE_APPS_SCRIPT_TEMPLATE } from '@/lib/integrations/google-sheets-template';

import { Cpu } from 'lucide-react';
import { McpIntegrationPanel } from './mcp/McpIntegrationPanel';

export type IntegrationId =
  | 'slack'
  | 'google-sheets'
  | 'telegram'
  | 'whatsapp'
  | 'instagram'
  | 'phone'
  | 'webhooks'
  | 'smtp'
  | 'whitelabel'
  | 'mcp';

export interface IntegrationConfigItem {
  id: IntegrationId;
  name: string;
  shortName: string;
  category: string;
  badge: string;
  summary: string;
}

export const INTEGRATIONS_CONFIG: IntegrationConfigItem[] = [
  {
    id: 'slack',
    name: 'Slack Alerts',
    shortName: 'Slack',
    category: 'Alerts & Collaboration',
    badge: 'Real-Time Cards',
    summary: 'Post rich Block Kit cards into team channels for new leads and bookings.',
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    shortName: 'Google Sheets',
    category: 'Productivity & CRM',
    badge: 'Live Auto-Sync',
    summary: 'Append formatted 12-column customer rows directly to any Google Sheet.',
  },
  {
    id: 'telegram',
    name: 'Telegram Bot',
    shortName: 'Telegram Bot',
    category: 'Autonomous Messaging',
    badge: 'Zero API Cost',
    summary: 'Autonomous 24/7 client assistant answering questions and booking on Telegram.',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Cloud',
    shortName: 'WhatsApp Cloud',
    category: 'Autonomous Messaging',
    badge: 'Meta Business',
    summary: 'Official WhatsApp Business API integration for two-way automated client chats.',
  },
  {
    id: 'instagram',
    name: 'Instagram Direct',
    shortName: 'Instagram Direct',
    category: 'Autonomous Messaging',
    badge: 'Direct & Ad Inquiries',
    summary: 'Autonomous 24/7 client DMs, answer inquiries from Instagram Ads, and book appointments directly on Instagram.',
  },
  {
    id: 'webhooks',
    name: 'Zapier & Webhooks',
    shortName: 'Webhooks',
    category: 'Automation & CRM',
    badge: 'Event Stream',
    summary: 'Dispatch HMAC-SHA256 signed JSON payloads to Zapier, Make, n8n, or your CRM.',
  },
  {
    id: 'smtp',
    name: 'Custom SMTP',
    shortName: 'Custom SMTP',
    category: 'Email Delivery',
    badge: 'Branded Sender',
    summary: 'Route appointment confirmations and alerts via your dedicated mail server.',
  },
  {
    id: 'whitelabel',
    name: 'Agency White-Label',
    shortName: 'White-Label',
    category: 'Reseller & Agency',
    badge: 'Client Branding',
    summary: 'Remove Crescelo branding and display your agency watermark and backlink.',
  },
  {
    id: 'mcp',
    name: 'ChatGPT & Claude (MCP)',
    shortName: 'ChatGPT & Claude',
    category: 'AI Agent Ecosystem',
    badge: 'Model Context Protocol',
    summary: 'Connect ChatGPT, Claude, Cursor, and autonomous agents to your knowledge base, calendar, and CRM.',
  },
];

export const SlackIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 122.8 122.8" className={className}>
    <path d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zm6.5 0c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z" fill="#E01E5A" />
    <path d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zm0 6.5c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z" fill="#36C5F0" />
    <path d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2zm-6.5 0c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9v32.3z" fill="#2EB67D" />
    <path d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zm0-6.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z" fill="#ECB22E" />
  </svg>
);


export const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
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
  selectedIntegration?: IntegrationId;
  setSelectedIntegration?: (id: IntegrationId) => void;
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
  selectedIntegration: propSelectedIntegration,
  setSelectedIntegration: propSetSelectedIntegration,
}) => {
  const __t = useT();
  // Navigation State
  const [internalSelectedIntegration, setInternalSelectedIntegration] = useState<IntegrationId>('slack');
  const rawSelected = propSelectedIntegration ?? internalSelectedIntegration;
  const selectedIntegration: IntegrationId = rawSelected === 'phone' ? 'slack' : rawSelected;
  const setSelectedIntegration = propSetSelectedIntegration ?? setInternalSelectedIntegration;
  const [activeSubTab, setActiveSubTab] = useState<'settings' | 'guide'>('settings');

  // Secrets visibility toggles
  const [showTelegramToken, setShowTelegramToken] = useState(false);
  const [showWhatsAppToken, setShowWhatsAppToken] = useState(false);
  const [showInstagramToken, setShowInstagramToken] = useState(false);
  const [copiedIgWebhookUrl, setCopiedIgWebhookUrl] = useState(false);
  const [copiedIgVerifyToken, setCopiedIgVerifyToken] = useState(false);
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
      id: 'instagram' as const,
      name: 'Instagram Direct',
      category: 'Autonomous Messaging',
      badge: 'Direct & Ad Inquiries',
      summary: 'Autonomous 24/7 client DMs, answer inquiries from Instagram Ads, and book appointments directly on Instagram.',
      icon: <InstagramIcon className="h-5 w-5 text-pink-500" />,
      isActive: Boolean(formData.instagramEnabled && formData.instagramAccountId),
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
    {
      id: 'mcp' as const,
      name: 'ChatGPT & Claude (MCP)',
      category: 'AI Agent Ecosystem',
      badge: 'Model Context Protocol',
      summary: 'Connect ChatGPT, Claude, Cursor, and autonomous agents to your knowledge base, calendar, and CRM.',
      icon: <Cpu className="h-5 w-5 text-purple-500" />,
      isActive: true,
    },
  ];

  const currentItem = INTEGRATION_LIST.find((item) => item.id === selectedIntegration) || INTEGRATION_LIST[0];
  const activeCount = INTEGRATION_LIST.filter((i) => i.isActive).length;

  return (
    <div className="max-w-6xl space-y-7 mx-auto pb-14">
      {/* 1. Header Bar with Global Save Trigger & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            <span><T>Channels &amp; Integrations</T></span>
            <span>/</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400"><T>{currentItem.name}</T></span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              <T>{currentItem.name}</T>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 uppercase tracking-wider">
              {activeCount} <T>of</T> {INTEGRATION_LIST.length} <T>Connected</T>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            <T>{currentItem.summary}</T>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <SaveButton onClick={handleSaveSettings} saving={isSaving} error={saveError} idleLabel="Save Channel Settings" savingLabel="Saving Changes…" savedLabel="Channel Settings Saved" icon={<Check className="h-3.5 w-3.5" />} className="px-5 py-2.5" />
        </div>
      </div>

      {/* 2. Integration View Header & Dual Sub-Tabs */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs">
              {currentItem.icon}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  <T>{currentItem.name}</T>
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
                  {currentItem.isActive ? <T>{'Connected & Active'}</T> : <T>{'Setup Required'}</T>}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                <T>{currentItem.summary}</T>
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
              <span><T>Settings &amp; Test</T></span>
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
              <span><T>Step-by-Step Guide</T></span>
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
                      <T>Slack Incoming Webhook Configuration</T>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <T>Enter your Slack Incoming Webhook URL to stream alerts to your team channel.</T>
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
                      <span><T>Send Live Test Ping</T></span>
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
                        {formData.slackEnabled ? <T>{'Active'}</T> : <T>{'Disabled'}</T>}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        <T>Slack Incoming Webhook URL</T>
                      </label>
                      <input
                        type="url"
                        placeholder="https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX"
                        value={formData.slackWebhookUrl || ''}
                        onChange={(e) => setFormData({ ...formData, slackWebhookUrl: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-rose-500"
                      />
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        <T>Need a webhook URL? Switch to the</T> <strong><T>Step-by-Step Guide</T></strong> <T>tab above.</T>
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        <T>Notified Slack Events</T>
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
                          <span><strong className="font-semibold"><T>lead.created</T></strong> <T>— Post rich card when a visitor submits contact information</T></span>
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
                          <span><strong className="font-semibold"><T>appointment.created</T></strong> <T>— Post schedule alert with customer details &amp; meeting links</T></span>
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
                            <span>{slackTestStatus.success ? <T>{'Slack Webhook Verified (HTTP 200 OK)'}</T> : <T>{'Slack Dispatch Failed'}</T>}</span>
                          </div>
                          {slackTestStatus.latencyMs !== undefined && (
                            <span className="font-mono text-[11px] opacity-80">{slackTestStatus.latencyMs}<T>ms latency</T></span>
                          )}
                        </div>
                        {slackTestStatus.error && (
                          <p className="mt-1 text-[11px] font-mono opacity-90"><T>{slackTestStatus.error}</T></p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Slack Preview Mockup */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#1A1D21] text-slate-100 space-y-3 font-sans">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400 pb-2 border-b border-[#2C3136]">
                      <span className="flex items-center gap-2">
                        <SlackIcon className="h-4 w-4" />
                        <span className="text-white font-medium"><T>#general-leads channel</T></span>
                      </span>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400"><T>Slack Block Kit</T></span>
                    </div>

                    <div className="bg-[#222529] p-3.5 rounded-lg border-l-4 border-emerald-500 space-y-2.5 text-xs">
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span><T>🎯 New Lead Captured!</T></span>
                      </div>
                      <p className="text-slate-300 text-[11px]">
                        <T>A new prospective customer just engaged with</T> <strong className="text-white">{activeAssistant?.name || <T>{'AI Assistant'}</T>}</strong>:
                      </p>
                      <div className="grid grid-cols-2 gap-2 bg-[#1A1D21] p-2.5 rounded text-[11px]">
                        <div>
                          <span className="text-slate-400 block font-semibold"><T>Lead Name:</T></span>
                          <span className="text-white font-medium"><T>Jordan Rivera</T></span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-semibold"><T>Email Address:</T></span>
                          <span className="text-sky-400 font-medium"><T>jordan@acme-enterprises.com</T></span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-semibold"><T>Phone Number:</T></span>
                          <span className="text-white font-medium">+1 (555) 438-9210</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-semibold"><T>Source:</T></span>
                          <span className="text-emerald-400 font-medium"><T>Website Live Chat</T></span>
                        </div>
                      </div>
                      <div className="border-l-2 border-slate-600 pl-2 text-[11px] text-slate-300 italic">
                        <T>"Looking to automate appointment scheduling for our 12-location clinic network."</T>
                      </div>
                      <div className="text-[10px] text-slate-500 pt-1">
                        🤖 {activeAssistant?.name || <T>{'Crescelo AI'}</T>} <T>• Just now</T>
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
                      <T>How Slack Incoming Webhooks Work</T>
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      <T>Slack Incoming Webhooks provide a secure HTTPS endpoint where Crescelo posts real-time customer activity directly into a channel of your choice. No bot hosting or paid Slack apps required.</T>
                    </p>
                  </div>
                </div>

                {/* Important Callout to prevent Scopes/OAuth confusion */}
                <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                      <T>Don&apos;t Worry About &quot;OAuth Scopes&quot; or &quot;Bot Tokens&quot;</T>
                    </h4>
                    <p className="text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                      <T>If you visit Slack&apos;s</T> <em><T>OAuth &amp; Permissions</T></em> <T>tab, Slack shows warnings asking you to configure Bot Scopes, User Scopes, or Redirect URLs.</T> <strong><T>You can completely ignore all of that!</T></strong> <T>Incoming Webhooks require zero manual scope configuration. When you click</T> <em><T>&quot;Add New Webhook to Workspace&quot;</T></em> <T>under</T> <strong><T>Incoming Webhooks</T></strong><T>, Slack automatically grants the</T> <code className="font-mono bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded text-amber-900 dark:text-amber-200 font-semibold">incoming-webhook</code> <T>permission behind the scenes.</T>
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    <T>5-Step Quick Setup Guide</T>
                  </h4>
                  <ol className="space-y-3.5 list-decimal list-inside text-slate-700 dark:text-slate-300 leading-relaxed">
                    <li className="pl-1">
                      <strong><T>Open Slack API Dashboard:</T></strong> <T>Navigate to</T>{' '}
                      <a
                        href="https://api.slack.com/apps"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline font-semibold inline-flex items-center gap-1"
                      >
                        <T>api.slack.com/apps</T> <ExternalLink className="h-3 w-3 inline" />
                      </a>{' '}
                      <T>and click</T> <strong><T>Create New App</T></strong> &gt; <em><T>From scratch</T></em>.
                    </li>
                    <li className="pl-1">
                      <strong><T>Name your app:</T></strong> <T>Enter an App Name (e.g.</T> <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">Crescelo Alerts</code><T>) and select your Slack workspace.</T>
                    </li>
                    <li className="pl-1">
                      <strong><T>Click &quot;Incoming Webhooks&quot;:</T></strong> <T>In the left sidebar under</T> <strong><T>Features</T></strong><T>, click</T> <strong><T>Incoming Webhooks</T></strong> <em><T>(do not click OAuth &amp; Permissions)</T></em>.
                    </li>
                    <li className="pl-1">
                      <strong><T>Activate and Add to Workspace:</T></strong> <T>Toggle the switch to</T> <strong><T>On</T></strong> <T>(&quot;Activate Incoming Webhooks&quot;). Then scroll down to the bottom of the page and click the green button</T> <strong><T>Add New Webhook to Workspace</T></strong><T>. Choose the destination channel (e.g.</T> <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">#leads</code> <T>or</T> <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">#general</code><T>), and click</T> <em><T>Allow</T></em>.
                    </li>
                    <li className="pl-1">
                      <strong><T>Copy &amp; Paste:</T></strong> <T>Copy the generated Webhook URL (format:</T> <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">https://hooks.slack.com/services/T.../B.../...</code><T>), switch back to the</T> <strong><T>Settings &amp; Test</T></strong> <T>tab above, paste it into the field, and click</T> <strong><T>Send Live Test Ping</T></strong>!
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
                      <T>Google Sheets Web App Configuration</T>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <T>Automatically appends 12-column rows for every lead and booking into your spreadsheet.</T>
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
                      <span><T>Append Test Row</T></span>
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
                        {formData.googleSheetsEnabled ? <T>{'Active'}</T> : <T>{'Disabled'}</T>}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        <T>Google Apps Script Web App URL</T>
                      </label>
                      <input
                        type="url"
                        placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                        value={formData.googleSheetsWebhookUrl || ''}
                        onChange={(e) => setFormData({ ...formData, googleSheetsWebhookUrl: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
                      />
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        <T>Need the Apps Script template? Click the</T> <strong><T>Step-by-Step Guide</T></strong> <T>tab above.</T>
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        <T>Synced Events</T>
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
                          <span><strong className="font-semibold"><T>lead.created</T></strong> <T>— Append row when a new contact lead is captured</T></span>
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
                          <span><strong className="font-semibold"><T>appointment.created</T></strong> <T>— Append row with booking date, time, and service</T></span>
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
                            <span>{googleSheetsTestStatus.success ? <T>{'Row Appended Successfully (HTTP 200 OK)'}</T> : <T>{'Google Sheets Sync Failed'}</T>}</span>
                          </div>
                          {googleSheetsTestStatus.latencyMs !== undefined && (
                            <span className="font-mono text-[11px] opacity-80">{googleSheetsTestStatus.latencyMs}<T>ms latency</T></span>
                          )}
                        </div>
                        {googleSheetsTestStatus.error && (
                          <p className="mt-1 text-[11px] font-mono opacity-90"><T>{googleSheetsTestStatus.error}</T></p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Spreadsheet Live Preview */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 space-y-3 font-sans overflow-hidden">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400 pb-2 border-b border-slate-800">
                      <span className="flex items-center gap-2">
                        <GoogleSheetsIcon className="h-4 w-4" />
                        <span className="text-white font-medium"><T>Spreadsheet Auto-Sync View</T></span>
                      </span>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400"><T>12 Columns Auto-Generated</T></span>
                    </div>

                    <div className="overflow-x-auto text-[11px]">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#08251a] text-[#abff44] font-semibold border-b border-emerald-900/50">
                            <th className="p-2 whitespace-nowrap"><T>Timestamp</T></th>
                            <th className="p-2 whitespace-nowrap"><T>Event</T></th>
                            <th className="p-2 whitespace-nowrap"><T>Customer Name</T></th>
                            <th className="p-2 whitespace-nowrap"><T>Email</T></th>
                            <th className="p-2 whitespace-nowrap"><T>Service</T></th>
                            <th className="p-2 whitespace-nowrap"><T>Notes</T></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 font-mono text-[10px] text-slate-300">
                          <tr className="hover:bg-slate-900/60">
                            <td className="p-2 whitespace-nowrap text-slate-400">{new Date().toISOString().slice(0, 16)}</td>
                            <td className="p-2 whitespace-nowrap text-emerald-400"><T>lead.created</T></td>
                            <td className="p-2 whitespace-nowrap text-white font-sans"><T>Elena Rostova</T></td>
                            <td className="p-2 whitespace-nowrap"><T>elena@techlabs.co</T></td>
                            <td className="p-2 whitespace-nowrap"><T>Enterprise Consultation</T></td>
                            <td className="p-2 whitespace-nowrap truncate max-w-[120px]"><T>Requested custom demo</T></td>
                          </tr>
                          <tr className="hover:bg-slate-900/60">
                            <td className="p-2 whitespace-nowrap text-slate-400">{new Date(Date.now() - 3600000).toISOString().slice(0, 16)}</td>
                            <td className="p-2 whitespace-nowrap text-sky-400"><T>appointment.created</T></td>
                            <td className="p-2 whitespace-nowrap text-white font-sans"><T>Marcus Brody</T></td>
                            <td className="p-2 whitespace-nowrap"><T>marcus@brody.io</T></td>
                            <td className="p-2 whitespace-nowrap"><T>Haircut &amp; Styling</T></td>
                            <td className="p-2 whitespace-nowrap truncate max-w-[120px]"><T>Confirmed slot 2:30 PM</T></td>
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
                      <T>30-Second Google Apps Script Setup</T>
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      <T>Deploy this lightweight Google Apps Script directly in your spreadsheet. It handles concurrency, automatically initializes formatted headers on new sheets, and appends incoming customer rows.</T>
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    <T>Step-by-Step Instructions:</T>
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 text-slate-700 dark:text-slate-300 leading-relaxed">
                    <li><T>Create a new spreadsheet at</T> <strong><T>sheets.new</T></strong> <T>(or open an existing one).</T></li>
                    <li><T>In the top menu, click</T> <strong><T>Extensions &gt; Apps Script</T></strong>.</li>
                    <li><T>Delete any starter code, and paste the complete script below.</T></li>
                    <li><T>Click</T> <strong><T>Deploy &gt; New deployment</T></strong> <T>in the top right corner.</T></li>
                    <li><T>Click the gear icon next to</T> <em><T>Select type</T></em> <T>and select</T> <strong><T>Web app</T></strong>.</li>
                    <li><T>Set</T> <strong><T>Execute as:</T></strong> <em><T>Me</T></em><T>, and</T> <strong><T>Who has access:</T></strong> <em><T>Anyone</T></em> <T>(required so Crescelo can post rows).</T></li>
                    <li><T>Click</T> <strong><T>Deploy</T></strong><T>, grant account permissions, and copy the</T> <strong><T>Web app URL</T></strong>.</li>
                    <li><T>Paste the URL into the</T> <em><T>Settings &amp; Test</T></em> <T>tab above and click</T> <strong><T>Append Test Row</T></strong>!</li>
                  </ol>

                  <div className="relative pt-2">
                    <div className="flex items-center justify-between pb-2">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs"><T>Copy-Paste Google Apps Script Code:</T></span>
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
                            <span><T>Copied to Clipboard!</T></span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span><T>Copy Complete Script</T></span>
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
                      <T>Telegram Bot Token &amp; Webhook</T>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <T>Connect your Telegram bot token to provide automated answers directly in Telegram chats.</T>
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
                      {formData.telegramBotEnabled ? <T>{'Active'}</T> : <T>{'Disabled'}</T>}
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        <T>Telegram Bot API Token</T>
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
                        <span><T>1. Verify Bot Token</T></span>
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
                        <span><T>2. Register Webhook</T></span>
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
                          <span>{telegramStatus.success ? __t("Verified: @{username}", { username: telegramStatus.botInfo?.username }) : <T>{'Verification Failed'}</T>}</span>
                        </div>
                        {telegramStatus.error && <p className="mt-1 text-[11px] font-mono"><T>{telegramStatus.error}</T></p>}
                      </div>
                    )}

                    {telegramWebhookStatus.message && (
                      <div className="p-3 rounded-xl border bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                        <span><T>{telegramWebhookStatus.message}</T></span>
                      </div>
                    )}
                  </div>

                  {/* Telegram Preview */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#0E1621] text-white space-y-3 font-sans">
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800 text-slate-400">
                      <span className="flex items-center gap-2">
                        <SendHorizontal className="h-4 w-4 text-sky-400" />
                        <span className="text-white font-medium"><T>Telegram Chat Mockup</T></span>
                      </span>
                      <span className="text-[10px] text-sky-400"><T>@bot live view</T></span>
                    </div>

                    <div className="space-y-3 pt-2 text-xs">
                      <div className="bg-[#182533] p-3 rounded-2xl rounded-tl-sm max-w-[85%] space-y-1">
                        <p className="text-slate-200 text-[11px]">
                          <T>Hello! What are your consultation hours and rates?</T>
                        </p>
                        <span className="text-[9px] text-slate-400 block text-right"><T>10:42 AM</T></span>
                      </div>

                      <div className="bg-[#2B5278] p-3 rounded-2xl rounded-tr-sm max-w-[85%] ml-auto space-y-1">
                        <p className="text-white text-[11px] font-medium">
                          <T>We are open Monday–Saturday from 9:00 AM to 7:00 PM. Would you like me to reserve a consultation slot for you?</T>
                        </p>
                        <span className="text-[9px] text-sky-200 block text-right"><T>10:42 AM · ✓✓</T></span>
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
                      <T>How to Create a Telegram Bot in 2 Minutes</T>
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      <T>Telegram allows developers to create free autonomous bots through the official @BotFather. No credit card or developer fees required.</T>
                    </p>
                  </div>
                </div>

                <ol className="list-decimal list-inside space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
                  <li><T>Open Telegram and search for</T> <strong><T>@BotFather</T></strong> <T>(verified with blue checkmark).</T></li>
                  <li><T>Send the command</T> <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-sky-600">/newbot</code>.</li>
                  <li><T>Follow prompts to choose a display name (e.g.</T> <em><T>Crescelo Concierge</T></em><T>) and a username ending in</T> <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">bot</code> (e.g. <em><T>acme_clinic_bot</T></em>).</li>
                  <li><T>BotFather will reply with an</T> <strong><T>HTTP API Token</T></strong> (e.g. <code className="font-mono">712938192:AAHj...</code>).</li>
                  <li><T>Copy that token, switch to the</T> <strong><T>Settings &amp; Test</T></strong> <T>tab above, paste it, and click</T> <strong><T>Verify Bot Token</T></strong>.</li>
                  <li><T>Click</T> <strong><T>Register Webhook</T></strong> <T>to bind your bot to Crescelo. Messages sent to your bot will now receive instant AI responses!</T></li>
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
                      <T>Meta WhatsApp Business Cloud API</T>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <T>Connect official Meta Cloud API credentials to power WhatsApp client conversations.</T>
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
                      {formData.whatsappEnabled ? <T>{'Active'}</T> : <T>{'Disabled'}</T>}
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        <T>WhatsApp Phone Number ID</T>
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
                        <T>System User Access Token (Permanent)</T>
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
                        <T>Webhook Verify Token</T>
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
                    <h4 className="font-bold text-slate-900 dark:text-white"><T>Meta Webhook Credentials to Paste in Meta:</T></h4>
                    
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500"><T>Callback URL:</T></span>
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
                          {copiedWaWebhookUrl ? <T>{'Copied'}</T> : <T>{'Copy'}</T>}
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-slate-500"><T>Verify Token:</T></span>
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
                          {copiedWaVerifyToken ? <T>{'Copied'}</T> : <T>{'Copy'}</T>}
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
                      <T>Meta WhatsApp Business Setup</T>
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      <T>Connect official Meta Cloud API credentials to power WhatsApp customer conversations directly from your registered company number.</T>
                    </p>
                  </div>
                </div>

                <ol className="list-decimal list-inside space-y-2.5 text-slate-700 dark:text-slate-300 leading-relaxed">
                  <li><T>Go to</T> <strong><T>developers.facebook.com</T></strong> <T>and sign in with your Meta account.</T></li>
                  <li><T>Click</T> <strong><T>My Apps &gt; Create App</T></strong><T>, select</T> <em><T>Other &gt; Business</T></em>.</li>
                  <li><T>In your app dashboard, find</T> <strong><T>WhatsApp</T></strong> <T>and click</T> <em><T>Set up</T></em>.</li>
                  <li><T>Under</T> <em><T>API Setup</T></em><T>, copy your</T> <strong><T>Phone Number ID</T></strong> <T>and temporary/system token into the Settings tab.</T></li>
                  <li><T>Under</T> <em><T>Configuration &gt; Webhook</T></em><T>, click</T> <strong><T>Edit</T></strong><T>. Paste your Callback URL and Verify Token from the Settings tab.</T></li>
                  <li><T>Under</T> <em><T>Webhook fields</T></em><T>, subscribe to the</T> <strong><T>messages</T></strong> <T>event. Your assistant is now ready to receive WhatsApp messages!</T></li>
                </ol>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* INTEGRATION: INSTAGRAM DIRECT & AD INQUIRIES             */}
        {/* ======================================================== */}
        {selectedIntegration === 'instagram' && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs space-y-6">
            {activeSubTab === 'settings' ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <T>Meta Instagram Direct &amp; Ad Automation</T>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-300 border border-pink-200 dark:border-pink-900/60">
                        <T>Meta Messenger API</T>
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <T>Autonomous 24/7 client direct messaging, Click-to-Instagram Direct Ads context routing, and appointment scheduling.</T>
                    </p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.instagramEnabled || false}
                      onChange={(e) => setFormData({ ...formData, instagramEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-pink-600"></div>
                    <span className="ml-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {formData.instagramEnabled ? <T>{'Active'}</T> : <T>{'Disabled'}</T>}
                    </span>
                  </label>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border border-pink-200/60 dark:border-pink-900/40 flex items-start gap-3">
                  <Sparkles className="h-4 w-4 text-pink-600 dark:text-pink-400 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      <T>⚡ Click-to-Instagram Direct Ads Supported</T>
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      <T>When prospects click your Instagram Ads and send a DM, the AI assistant automatically detects referral ad metadata (Ad ID &amp; Campaign Title) to personalize responses, quote accurate pricing, and qualify leads.</T>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        <T>Instagram Account ID / Connected Facebook Page ID</T>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 17841400000000000"
                        value={formData.instagramAccountId || ''}
                        onChange={(e) => setFormData({ ...formData, instagramAccountId: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-pink-500"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        <T>Your Instagram Professional Account ID or linked Facebook Page ID from Meta App Dashboard.</T>
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        <T>Meta System User Access Token (Permanent)</T>
                      </label>
                      <div className="relative">
                        <input
                          type={showInstagramToken ? 'text' : 'password'}
                          placeholder="EAAG..."
                          value={formData.instagramAccessToken || ''}
                          onChange={(e) => setFormData({ ...formData, instagramAccessToken: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-pink-500 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowInstagramToken(!showInstagramToken)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                          {showInstagramToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        <T>Requires instagram_basic and instagram_manage_messages permissions.</T>
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        <T>Webhook Verify Token</T>
                      </label>
                      <input
                        type="text"
                        placeholder="custom_verification_secret"
                        value={formData.instagramVerifyToken || ''}
                        onChange={(e) => setFormData({ ...formData, instagramVerifyToken: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-pink-500"
                      />
                    </div>
                  </div>

                  {/* Callback URL Card */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3 text-xs">
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <InstagramIcon className="h-3.5 w-3.5 text-pink-500" />
                      <T>Meta Webhook Settings to Configure:</T>
                    </h4>

                    <div>
                      <span className="text-[11px] font-semibold text-slate-500"><T>Callback URL:</T></span>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          readOnly
                          value={
                            typeof window !== 'undefined'
                              ? `${window.location.origin}/api/channels/instagram?assistantId=${activeAssistant?.id || ''}`
                              : `/api/channels/instagram?assistantId=${activeAssistant?.id || ''}`
                          }
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-[11px]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const url = `${window.location.origin}/api/channels/instagram?assistantId=${activeAssistant?.id || ''}`;
                            navigator.clipboard.writeText(url);
                            setCopiedIgWebhookUrl(true);
                            setTimeout(() => setCopiedIgWebhookUrl(false), 2000);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-pink-600 text-white font-semibold text-xs transition cursor-pointer hover:bg-pink-700"
                        >
                          {copiedIgWebhookUrl ? <T>{'Copied'}</T> : <T>{'Copy'}</T>}
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-slate-500"><T>Verify Token:</T></span>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          readOnly
                          value={formData.instagramVerifyToken || 'crescelo_instagram_token'}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-[11px]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(formData.instagramVerifyToken || 'crescelo_instagram_token');
                            setCopiedIgVerifyToken(true);
                            setTimeout(() => setCopiedIgVerifyToken(false), 2000);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-pink-600 text-white font-semibold text-xs transition cursor-pointer hover:bg-pink-700"
                        >
                          {copiedIgVerifyToken ? <T>{'Copied'}</T> : <T>{'Copy'}</T>}
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
                      <p className="font-semibold text-slate-700 dark:text-slate-300">
                        <T>Required Webhook Subscription Fields:</T>
                      </p>
                      <div className="flex gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px] text-slate-800 dark:text-slate-200">
                          messages
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px] text-slate-800 dark:text-slate-200">
                          messaging_postbacks
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* INSTAGRAM SETUP GUIDE */
              <div className="space-y-5 text-xs">
                <div className="p-4 rounded-xl bg-pink-50/50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-900/60 flex items-start gap-3">
                  <InstagramIcon className="h-5 w-5 text-pink-600 dark:text-pink-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-pink-900 dark:text-pink-200 text-sm">
                      <T>Meta Instagram Direct &amp; Ads Setup Guide</T>
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      <T>Configure your Instagram Professional account with Meta Developer API to automate inquiries, capture leads from Instagram Ads, and book appointments autonomously.</T>
                    </p>
                  </div>
                </div>

                <ol className="list-decimal list-inside space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
                  <li>
                    <strong><T>Switch to a Professional Account</T></strong>: <T>In the Instagram mobile app, navigate to Settings &gt; Account type and tools &gt; Switch to Professional Account (Business or Creator).</T>
                  </li>
                  <li>
                    <strong><T>Connect to Facebook Page</T></strong>: <T>Link your Instagram Professional account to your business Facebook Page in Instagram Settings &gt; Creator/Business &gt; Connect or Create a Facebook Page.</T>
                  </li>
                  <li>
                    <strong><T>Enable Connected Tools in App</T></strong>: <T>In Instagram App &gt; Settings &gt; Messages and story replies &gt; Message controls &gt; Connected tools &gt; toggle ON &quot;Allow access to messages&quot;.</T>
                  </li>
                  <li>
                    <strong><T>Create Meta Developer App</T></strong>: <T>Go to developers.facebook.com &gt; My Apps &gt; Create App &gt; select &quot;Other&quot; &gt; &quot;Business&quot;.</T>
                  </li>
                  <li>
                    <strong><T>Add Messenger API for Instagram</T></strong>: <T>Under Add products to your app, locate Messenger (or Instagram Graph API) and click Set Up.</T>
                  </li>
                  <li>
                    <strong><T>Generate System User Token</T></strong>: <T>In Meta Business Manager &gt; System Users &gt; Generate Token with instagram_basic, instagram_manage_messages, pages_manage_metadata, and pages_read_engagement permissions. Paste this into the Settings tab.</T>
                  </li>
                  <li>
                    <strong><T>Configure Webhook</T></strong>: <T>In Meta App Dashboard &gt; Webhooks &gt; select &quot;Instagram&quot; (or Messenger) &gt; Edit Callback URL. Paste your Callback URL and Verify Token, then subscribe to the messages and messaging_postbacks events.</T>
                  </li>
                  <li>
                    <strong><T>Instagram Ads Tracking</T></strong>: <T>When you run Click-to-Instagram Direct Ads in Meta Ads Manager, any DM initiated by a prospect will automatically carry ad referral metadata into Crescelo, allowing the AI to answer specific ad questions!</T>
                  </li>
                </ol>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* INTEGRATION 5: PHONE & AI VOICE WORKER                  */}
        {/* ======================================================== */}
        {(selectedIntegration as string) === 'phone' && (
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
                      <T>How Crescelo Inbound AI Voice Works</T>
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      <T>Crescelo connects to wholesale telephony providers (Telnyx / Twilio) using TeXML and WebSocket audio streams. Faster-whisper transcribes caller audio, your assistant formulates knowledge responses, and Piper synthesizes neural speech in under 400ms.</T>
                    </p>
                  </div>
                </div>

                <ol className="list-decimal list-inside space-y-2.5 text-slate-700 dark:text-slate-300 leading-relaxed">
                  <li><T>Obtain an E.164 phone number from Telnyx (recommended for wholesale pricing) or Twilio.</T></li>
                  <li><T>In your Telnyx Mission Control Portal / Twilio Console, navigate to</T> <strong><T>Call Control / Phone Numbers</T></strong>.</li>
                  <li><T>Configure the Voice Webhook URL to:</T> <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-indigo-600">{typeof window !== 'undefined' ? `${window.location.origin}/api/channels/voice` : '/api/channels/voice'}</code></li>
                  <li><T>Set HTTP method to</T> <strong><T>POST</T></strong>.</li>
                  <li><T>In the</T> <em><T>Settings</T></em> <T>tab, assign the phone number to your assistant, set your greeting, and choose a neural voice.</T></li>
                  <li><T>Dial the number from your mobile phone to test live conversational answering!</T></li>
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
                      <T>Outbound Webhooks (Zapier, Make.com, n8n, CRM)</T>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <T>Stream captured leads and booking events into third-party automation tools with HMAC signatures.</T>
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
                    <span><T>Send Live Test Ping</T></span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        <T>Target Webhook URL</T>
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
                        <T>Webhook Signing Secret (Optional)</T>
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
                        <T>Dispatched Events</T>
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
                          <span><strong className="font-semibold"><T>lead.created</T></strong> <T>— Fired when a visitor submits contact details</T></span>
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
                          <span><strong className="font-semibold"><T>conversation.escalated</T></strong> <T>— Fired when a human agent is requested</T></span>
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
                            <span>{webhookTestStatus.success ? <T>{'Webhook 200 OK Received'}</T> : <T>{'Ping Failed'}</T>}</span>
                          </div>
                          {webhookTestStatus.latencyMs !== undefined && (
                            <span className="font-mono text-[11px] opacity-80">{webhookTestStatus.latencyMs}<T>ms latency</T></span>
                          )}
                        </div>
                        {webhookTestStatus.error && <p className="mt-1 text-[11px] font-mono"><T>{webhookTestStatus.error}</T></p>}
                      </div>
                    )}
                  </div>

                  {/* Sample JSON Payload */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300 pb-2 border-b border-slate-800">
                      <span className="flex items-center gap-1.5">
                        <FileCode className="h-3.5 w-3.5 text-amber-400" />
                        <span><T>Sample Outbound Payload</T></span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 uppercase"><T>POST / JSON</T></span>
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
                      <T>Connecting to Zapier, Make.com, or Custom Backends</T>
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      <T>Whenever an event fires, Crescelo sends an HTTPS POST request containing JSON data and an optional HMAC SHA-256 header (</T><code className="font-mono">X-Crescelo-Signature</code>).
                    </p>
                  </div>
                </div>

                <ol className="list-decimal list-inside space-y-2.5 text-slate-700 dark:text-slate-300 leading-relaxed">
                  <li><T>In</T> <strong><T>Zapier</T></strong><T>, create a Zap and select</T> <strong><T>Webhooks by Zapier &gt; Catch Hook</T></strong>.</li>
                  <li><T>In</T> <strong><T>Make.com</T></strong><T>, add a</T> <strong><T>Custom Webhook</T></strong> <T>module and click</T> <em><T>Create a Webhook</T></em>.</li>
                  <li><T>Copy the webhook URL provided by Zapier/Make and paste it into the</T> <em><T>Settings</T></em> <T>tab above.</T></li>
                  <li><T>(Optional) Define a signing secret to verify payload authenticity on your server.</T></li>
                  <li><T>Click</T> <strong><T>Send Live Test Ping</T></strong> <T>in Crescelo to test the trigger and establish data schema!</T></li>
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
                      <T>Custom Outbound SMTP Server Settings</T>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <T>Send lead notifications and calendar booking emails from your custom business email address.</T>
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <SaveButton onClick={handleSaveSmtpSettings} saving={smtpLoading} error={smtpSaveError} idleLabel="Save SMTP Settings" savedLabel="SMTP Saved" icon={<Check className="w-3.5 h-3.5" />} />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: Configuration Form */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          <T>SMTP Host</T>
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
                          <T>Port</T>
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
                          <T>SMTP Username</T>
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
                          <T>SMTP Password</T>
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
                          <T>Sender Name</T>
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
                          <T>Sender Email</T>
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
                        <span><T>Live SMTP Diagnostic Sender</T></span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        <T>Send a test email to verify credentials, TLS handshake, and DNS sender authentication.</T>
                      </p>

                      <div className="mt-3">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          <T>Recipient Email Address</T>
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
                            <span className="font-semibold">{smtpTestResult.success ? <T>{'Delivery Verified'}</T> : <T>{'Delivery Test Failed'}</T>}:</span>{' '}
                            <span><T>{smtpTestResult.message}</T></span>
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
                          <span><T>Connecting &amp; Sending...</T></span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span><T>Send Live Test Email</T></span>
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
                      <T>Recommended SMTP Providers &amp; Ports</T>
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      <T>Use port 587 with STARTTLS or port 465 with SSL. For Gmail, generate a 16-character App Password under Google Account Security.</T>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1.5">
                    <h5 className="font-bold text-slate-900 dark:text-white"><T>Gmail / Google Workspace</T></h5>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px]"><T>Host:</T> <code className="font-mono">smtp.gmail.com</code> <T>| Port: 587</T></p>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px]"><T>Password: Create a 16-letter App Password at</T> <em><T>myaccount.google.com/apppasswords</T></em>.</p>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1.5">
                    <h5 className="font-bold text-slate-900 dark:text-white"><T>SendGrid / Twilio</T></h5>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px]"><T>Host:</T> <code className="font-mono">smtp.sendgrid.net</code> <T>| Port: 587</T></p>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px]"><T>Username:</T> <code className="font-mono">apikey</code> <T>| Password: Your SendGrid API Key.</T></p>
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
                      <T>Agency White-Labeling &amp; Custom Branding</T>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <T>Remove "Powered by Crescelo" and replace with your agency watermark and backlink.</T>
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
                      {formData.whiteLabelEnabled ? <T>{'White-Label Active'}</T> : <T>{'Default Branding'}</T>}
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        <T>Custom Footer Watermark Text</T>
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
                        <T>Agency Backlink URL</T>
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
                      <T>Live Widget Footer Preview:</T>
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
                          <span className="inline-flex items-center gap-1.5">
                            <CresceloMark size={14} motion="draw" />
                            <span><T>Powered by</T> <strong className="text-slate-800 dark:text-slate-200"><T>Crescelo AI</T></strong></span>
                          </span>
                        )}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      <T>This watermark renders at the bottom of web widgets and landing pages.</T>
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
                      <T>Reselling Chatbots Under Your Agency Brand</T>
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      <T>White-labeling allows marketing agencies and consultants to deliver AI concierge systems to client websites without displaying Crescelo branding.</T>
                    </p>
                  </div>
                </div>

                <ol className="list-decimal list-inside space-y-2.5 text-slate-700 dark:text-slate-300 leading-relaxed">
                  <li><T>Toggle</T> <strong><T>White-Label Active</T></strong> <T>on in the Settings tab.</T></li>
                  <li><T>Enter your agency name in</T> <strong><T>Custom Footer Watermark Text</T></strong> (e.g. <em><T>Powered by Hyperion Growth</T></em>).</li>
                  <li><T>Enter your website URL in</T> <strong><T>Agency Backlink URL</T></strong>.</li>
                  <li><T>Click</T> <strong><T>Save Channel Settings</T></strong><T>. All widget scripts will immediately render your agency credit and link.</T></li>
                </ol>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* INTEGRATION 8: CHATGPT & CLAUDE (MCP)                   */}
        {/* ======================================================== */}
        {selectedIntegration === 'mcp' && (
          <McpIntegrationPanel activeSubTab={activeSubTab} />
        )}
      </div>

      {/* Bottom Save Reminder */}
      <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-xs text-blue-900 dark:text-blue-200">
          <Info className="h-4 w-4 text-blue-600 shrink-0" />
          <span>
            <T>Remember to click</T> <strong><T>Save Channel Settings</T></strong> <T>above to apply your integration updates to the live bot.</T>
          </span>
        </div>
        <SaveButton onClick={handleSaveSettings} saving={isSaving} error={saveError} idleLabel="Save Settings" savedLabel="Settings Saved" className="shrink-0" />
      </div>
    </div>
  );
};
