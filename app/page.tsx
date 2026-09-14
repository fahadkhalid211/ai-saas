'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  FileText,
  Upload,
  Cpu,
  Sliders,
  Palette,
  MessageSquare,
  Users,
  CheckCircle2,
  Copy,
  Trash2,
  ExternalLink,
  Plus,
  RefreshCw,
  Send,
  Paperclip,
  Download,
  FileSpreadsheet,
  FileCode,
  FileCheck,
  Eye,
  EyeOff,
  Sparkles,
  Info,
  ShieldCheck,
  Lock,
  Key,
  LogOut,
  ChevronDown,
  Globe,
  Zap,
  AlertTriangle,
  Sun,
  Moon,
  Search,
  HelpCircle,
  X,
  ArrowRight,
  Share2,
  Radio,
  Webhook,
  SendHorizontal,
  Activity,
  Check,
  Link2,
  Shield,
  BookOpen,
  Calendar,
  Clock,
  CreditCard,
  LayoutTemplate,
  History,
  Wand2,
  FileEdit,
  BarChart3,
  TrendingUp,
  PieChart,
  Mic,
  MicOff,
  Target,
  Scale,
  Dumbbell,
  Home,
  ShoppingBag,
  Briefcase,
  Phone,
  Mail,
  Rocket,
  Lightbulb,
  Plug,
  Brain,
  ClipboardList,
  Video,
  AlertCircle,
  ThumbsUp,
  Headphones,
  UserCheck,
  QrCode,
  Bell,
  UserPlus,
  KeyRound,
  ShieldAlert,
  MapPin,
  Scissors,
  Smartphone,
  Monitor,
  DollarSign,
  Filter,
  Award,
} from 'lucide-react';
import { diagnoseKnowledgeFailure } from '@/lib/rag/diagnostics';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { BOT_TEMPLATES, BotTemplate } from '@/lib/templates';
import { BILLING_PLANS, PlanTier } from '@/lib/billing/plans';
import {
  LandingPageConfig,
  DEFAULT_BARBER_LANDING_CONFIG,
  TEMPLATE_LANDING_CONFIGS,
  getLandingConfigForSlugOrTemplate,
} from '@/lib/landing/types';
import { AuditTab } from '@/components/crm/AuditTab';
import { SecurityTab } from '@/components/crm/SecurityTab';
import { TeamTab } from '@/components/crm/TeamTab';
import { BillingTab } from '@/components/crm/BillingTab';
import { AnalyticsTab } from '@/components/crm/AnalyticsTab';
import { KnowledgeTab } from '@/components/crm/KnowledgeTab';
import { ChannelsTab } from '@/components/crm/ChannelsTab';
import { ConversationsTab } from '@/components/crm/ConversationsTab';
import { LandingPageTab, LANDING_TEMPLATES_LIST } from '@/components/crm/LandingPageTab';
import { WidgetTab, SupportCustomField } from '@/components/crm/WidgetTab';
import { AppointmentsTab, Appointment } from '@/components/crm/AppointmentsTab';

const Youtube = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

interface Assistant {
  id: string;
  name: string;
  description?: string;
  systemPrompt: string;
  welcomeMessage: string;
  fallbackMessage: string;
  temperature: number;
  maxTokens?: number;
  contextChunks?: number;
  provider: string;
  modelName: string;
  apiKeyEncrypted?: string;
  customBaseUrl?: string;
  primaryColor: string;
  launcherPosition: string;
  starterQuestions: string[];
  collectLeadEmail: boolean;
  allowWebSearch?: boolean;
  allowedDomains: string[];
  supportReceiverEmail?: string;
  supportCcEmails?: string[];
  supportCustomFields?: SupportCustomField[];
  // Omnichannel Connectors
  telegramBotToken?: string;
  telegramBotEnabled?: boolean;
  whatsappPhoneNumberId?: string;
  whatsappAccessToken?: string;
  whatsappVerifyToken?: string;
  whatsappEnabled?: boolean;
  // Outbound Webhook Dispatcher
  webhookUrl?: string;
  webhookSecret?: string;
  webhookEvents?: string[];
  // Agency White-Labeling
  whiteLabelEnabled?: boolean;
  customBrandingText?: string;
  customBrandingUrl?: string;
  // Proactive Engagement
  proactiveMessageEnabled?: boolean;
  proactiveMessageText?: string;
  proactiveMessageDelay?: number;
  // Appointment & Calendar Booking
  bookingEnabled?: boolean;
  bookingProvider?: 'direct' | 'calendly' | 'cal_com';
  bookingUrl?: string;
  bookingPromptText?: string;
  bookingSlotDuration?: number;
  bookingStartHour?: string;
  bookingEndHour?: string;
  bookingAvailableDays?: string[];
}

interface KnowledgeSource {
  id: string;
  title: string;
  type: string;
  chunkCount: number;
  fileSizeBytes?: number;
  status: string;
  errorMessage?: string;
  errorResolution?: string;
  corrections?: Array<{
    id: string;
    type: 'replace' | 'note' | 'edit';
    findText?: string;
    replaceText?: string;
    note?: string;
    appliedAt: string;
  }>;
  createdAt: string;
}

interface Lead {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  notes?: string;
  customData?: Record<string, any>;
  createdAt: string;
}

export default function DashboardPage() {
  // Theme state: default light, persisted in localStorage
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = localStorage.getItem('kortex_theme') as 'light' | 'dark' | null;
    if (saved) {
      setTheme(saved);
      if (saved === 'dark') document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('kortex_theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Enterprise Admin Authentication & Session state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [authApiKeyInput, setAuthApiKeyInput] = useState<string>('');
  const [showAuthPasscode, setShowAuthPasscode] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [authLoginMode, setAuthLoginMode] = useState<'admin' | 'staff'>('admin');
  const [staffEmailInput, setStaffEmailInput] = useState<string>('');
  const [staffPasswordInput, setStaffPasswordInput] = useState<string>('');

  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [activeAssistant, setActiveAssistant] = useState<Assistant | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'analytics' | 'billing' | 'landing_page' | 'team' | 'security' | 'audit' | 'knowledge' | 'engine' | 'behavior' | 'widget' | 'channels' | 'playground' | 'leads' | 'appointments' | 'docs' | 'templates' | 'history'
  >('overview');

  // Knowledge state
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadText, setUploadText] = useState('');
  const [uploadTextTitle, setUploadTextTitle] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [sourceFilter, setSourceFilter] = useState('');

  // Engine & Behavior state
  const [formData, setFormData] = useState<Partial<Assistant>>({});
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSyncingLeads, setIsSyncingLeads] = useState(false);

  // Playground state
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string; citations?: any[]; isWebSearch?: boolean }[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingStatus, setStreamingStatus] = useState<string | null>(null);
  const [activeCitations, setActiveCitations] = useState<any[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Leads state
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadModal, setSelectedLeadModal] = useState<Lead | null>(null);

  // Appointments & Calendar Booking state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isSyncingAppointments, setIsSyncingAppointments] = useState(false);
  const [selectedAppointmentModal, setSelectedAppointmentModal] = useState<Appointment | null>(null);

  // Unanswered Queries (Knowledge Gap Engine) state
  const [unansweredQueries, setUnansweredQueries] = useState<any[]>([]);
  const [resolvingQueryId, setResolvingQueryId] = useState<string | null>(null);
  const [knowledgeAnswerText, setKnowledgeAnswerText] = useState('');
  const [isSavingKnowledgeGap, setIsSavingKnowledgeGap] = useState(false);

  // Conversation History state
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);

  // Template Marketplace state
  const [applyingTemplateId, setApplyingTemplateId] = useState<string | null>(null);
  const [templateSuccessMsg, setTemplateSuccessMsg] = useState<string | null>(null);

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [analyticsRange, setAnalyticsRange] = useState<number>(30);
  const [analyticsSlugFilter, setAnalyticsSlugFilter] = useState<string>('all');

  const fetchAnalytics = async (assistantId?: string, slug?: string, days?: number) => {
    setIsLoadingAnalytics(true);
    try {
      const astId = assistantId !== undefined ? assistantId : activeAssistant?.id;
      const targetSlug = slug !== undefined ? slug : analyticsSlugFilter;
      const targetDays = days !== undefined ? days : analyticsRange;
      const params = new URLSearchParams();
      if (astId) params.set('assistantId', astId);
      if (targetSlug && targetSlug !== 'all') params.set('slug', targetSlug);
      if (targetDays !== undefined) params.set('days', targetDays.toString());

      const url = `/api/analytics?${params.toString()}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data);
      }
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  // Billing & Subscription state
  const [billingData, setBillingData] = useState<any>(null);
  const [isLoadingBilling, setIsLoadingBilling] = useState(false);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
  const [changingPlanId, setChangingPlanId] = useState<string | null>(null);
  const [planChangeMsg, setPlanChangeMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cardBrand, setCardBrand] = useState('Visa');
  const [cardLast4, setCardLast4] = useState('4242');
  const [cardExpMonth, setCardExpMonth] = useState('12');
  const [cardExpYear, setCardExpYear] = useState('2028');
  const [billingEmailInput, setBillingEmailInput] = useState('billing@kortexai.com');
  const [isUpdatingCard, setIsUpdatingCard] = useState(false);

  const fetchBilling = async () => {
    setIsLoadingBilling(true);
    try {
      const res = await fetch('/api/billing');
      if (res.ok) {
        const data = await res.json();
        setBillingData(data);
        if (data.billingInterval) setBillingInterval(data.billingInterval);
        if (data.paymentMethod) {
          setCardBrand(data.paymentMethod.brand || 'Visa');
          setCardLast4(data.paymentMethod.last4 || '4242');
          setCardExpMonth(String(data.paymentMethod.expMonth || '12'));
          setCardExpYear(String(data.paymentMethod.expYear || '2028'));
        }
        if (data.billingEmail) setBillingEmailInput(data.billingEmail);
      }
    } catch (err) {
      console.error('Failed to fetch billing data:', err);
    } finally {
      setIsLoadingBilling(false);
    }
  };

  const handleSwitchPlan = async (targetPlanId: string) => {
    setChangingPlanId(targetPlanId);
    setPlanChangeMsg(null);
    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_plan',
          planId: targetPlanId,
          billingInterval,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPlanChangeMsg({ type: 'success', text: data.message || `Successfully activated ${targetPlanId} plan!` });
        await fetchBilling();
      } else {
        setPlanChangeMsg({ type: 'error', text: data.error || 'Failed to switch plan' });
      }
    } catch (err: any) {
      setPlanChangeMsg({ type: 'error', text: err.message || 'Network error updating plan' });
    } finally {
      setChangingPlanId(null);
    }
  };

  const handleUpdatePaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingCard(true);
    try {
      const res = await fetch('/api/billing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: {
            brand: cardBrand,
            last4: cardLast4,
            expMonth: parseInt(cardExpMonth, 10) || 12,
            expYear: parseInt(cardExpYear, 10) || 2028,
          },
          billingEmail: billingEmailInput,
        }),
      });
      if (res.ok) {
        setShowPaymentModal(false);
        await fetchBilling();
      }
    } catch (err) {
      console.error('Failed to update payment method:', err);
    } finally {
      setIsUpdatingCard(false);
    }
  };

  const handleDownloadInvoice = (inv: any) => {
    const text = `===========================================
               KORTEX AI INVOICE
===========================================
Invoice ID:      ${inv.id}
Date:            ${inv.date}
Status:          ${inv.status.toUpperCase()}
Plan:            ${inv.planName}
Amount Paid:     ${inv.amount}.00 USD
Payment Method:  ${billingData?.paymentMethod?.brand || 'Visa'} ending in •••• ${billingData?.paymentMethod?.last4 || '4242'}
Billing Email:   ${billingData?.billingEmail || 'billing@kortexai.com'}
-------------------------------------------
Chat-Session Based Billing Model
No Per-Message Fees. Pure Customer Outcomes.
Thank you for using Kortex AI Business Engine.
===========================================`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${inv.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Landing Page State
  const [landingConfig, setLandingConfig] = useState<LandingPageConfig>(DEFAULT_BARBER_LANDING_CONFIG);
  const [isSavingLanding, setIsSavingLanding] = useState(false);
  const [saveLandingSuccess, setSaveLandingSuccess] = useState(false);
  const [saveLandingError, setSaveLandingError] = useState<string | null>(null);
  const [copiedLandingUrl, setCopiedLandingUrl] = useState(false);
  const [showCounterQrModal, setShowCounterQrModal] = useState(false);
  const [presetNotice, setPresetNotice] = useState<string | null>(null);

  // Team Management & RBAC State
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isAddingTeamMember, setIsAddingTeamMember] = useState(false);
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'owner' | 'admin' | 'support_agent' | 'billing_manager' | 'viewer'>('support_agent');
  const [teamError, setTeamError] = useState<string | null>(null);
  const [teamSuccess, setTeamSuccess] = useState<string | null>(null);

  // 2FA / Security State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSetupData, setTwoFactorSetupData] = useState<{ secret: string; otpUrl: string; recoveryCodes: string[] } | null>(null);
  const [twoFactorCodeInput, setTwoFactorCodeInput] = useState('');
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [twoFactorSuccess, setTwoFactorSuccess] = useState<string | null>(null);
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);

  // Security Audit Trail State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isSyncingAudit, setIsSyncingAudit] = useState(false);

  // In-App Notifications State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Multi-Landing Page & Add-on Management State
  const [allLandingPages, setAllLandingPages] = useState<LandingPageConfig[]>([]);
  const [landingPageLimits, setLandingPageLimits] = useState<{
    planTier: string;
    baseLimit: number;
    extraSlots: number;
    totalAllowed: number;
    currentCount: number;
  }>({
    planTier: 'starter',
    baseLimit: 1,
    extraSlots: 0,
    totalAllowed: 1,
    currentCount: 1,
  });
  const [isPurchasingAddon, setIsPurchasingAddon] = useState(false);
  const [addonSuccessMsg, setAddonSuccessMsg] = useState<string | null>(null);
  const [addonErrorMsg, setAddonErrorMsg] = useState<string | null>(null);
  const [showNewPageModal, setShowNewPageModal] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const [newPageIndustry, setNewPageIndustry] = useState('barbershop');

  // Email Delivery & SMTP Diagnostic State
  const [smtpConfig, setSmtpConfig] = useState<{
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
    resendApiKey?: string;
    provider: 'smtp' | 'resend';
  }>({
    host: '',
    port: 587,
    user: '',
    pass: '',
    from: '',
    resendApiKey: '',
    provider: 'smtp',
  });
  const [smtpLoading, setSmtpLoading] = useState(false);
  const [smtpSaveSuccess, setSmtpSaveSuccess] = useState(false);
  const [smtpSaveError, setSmtpSaveError] = useState<string | null>(null);
  const [smtpTestEmail, setSmtpTestEmail] = useState('');
  const [smtpTesting, setSmtpTesting] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Audio Notification Chime & Bottom-Left Toast
  const [incomingToast, setIncomingToast] = useState<any | null>(null);
  const lastNotifIdRef = useRef<string | null>(null);

  const playNotificationChime = () => {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
      gain1.gain.setValueAtTime(0.18, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.12);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.3); // D6
      gain2.gain.setValueAtTime(0.15, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.55);
    } catch (err) {
      console.warn('Audio notification error:', err);
    }
  };

  const fetchAllLandingPages = async () => {
    try {
      const res = await fetch('/api/landing-page?all=true');
      if (res.ok) {
        const data = await res.json();
        const pagesList = data.landingPages || data.pages;
        if (Array.isArray(pagesList)) {
          setAllLandingPages(pagesList);
        }
        if (data.limits) {
          setLandingPageLimits(data.limits);
        } else if (data.totalAllowed !== undefined) {
          setLandingPageLimits({
            planTier: data.planName || 'starter',
            baseLimit: data.planLimit || 1,
            extraSlots: data.extraSlots || 0,
            totalAllowed: data.totalAllowed || 1,
            currentCount: data.currentCount || (pagesList ? pagesList.length : 1),
          });
        }
      }
    } catch (e) {
      console.warn('Failed to fetch all landing pages', e);
    }
  };

  const handlePurchaseExtraLandingPage = async () => {
    setIsPurchasingAddon(true);
    setAddonSuccessMsg(null);
    setAddonErrorMsg(null);
    try {
      const res = await fetch('/api/billing/addon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addonType: 'extra_landing_page' }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to purchase add-on');
      }
      setAddonSuccessMsg('Extra Landing Page slot unlocked for $100! Your workspace limit has been updated.');
      playNotificationChime();
      await fetchAllLandingPages();
      await fetchBilling();
      await fetchNotifications();
      setTimeout(() => setAddonSuccessMsg(null), 5000);
    } catch (err: any) {
      setAddonErrorMsg(err.message);
    } finally {
      setIsPurchasingAddon(false);
    }
  };

  const handleCreateNewLandingPage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageName.trim() || !newPageSlug.trim()) return;

    try {
      const basePreset = TEMPLATE_LANDING_CONFIGS[newPageSlug] || TEMPLATE_LANDING_CONFIGS[newPageIndustry] || DEFAULT_BARBER_LANDING_CONFIG;
      const cleanSlug = newPageSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      const newConfig: LandingPageConfig = {
        ...basePreset,
        id: 'lp_' + cleanSlug,
        businessName: newPageName,
        slug: cleanSlug,
        industry: newPageIndustry,
      };

      const res = await fetch('/api/landing-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId: activeAssistant?.id || 'demo-assistant',
          config: newConfig,
          isNewPage: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create new landing page');
      }

      setShowNewPageModal(false);
      setNewPageName('');
      setNewPageSlug('');
      await fetchAllLandingPages();
      setLandingConfig(newConfig);
      setPresetNotice('Created new landing page: ' + newConfig.businessName);
      setTimeout(() => setPresetNotice(null), 4000);
    } catch (err: any) {
      alert(err.message);
    }
  };

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
            from: data.settings.from || '',
            provider: data.settings.provider || 'smtp',
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
      const res = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_settings',
          settings: smtpConfig,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save SMTP settings');
      setSmtpSaveSuccess(true);
      setTimeout(() => setSmtpSaveSuccess(false), 3000);
    } catch (err: any) {
      setSmtpSaveError(err.message);
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


  const fetchLandingConfig = async (astId: string) => {
    try {
      const res = await fetch(`/api/landing-page?assistantId=${encodeURIComponent(astId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.config) setLandingConfig(data.config);
      }
    } catch (e) {
      console.warn('Failed to fetch landing config', e);
    }
  };

  const handleSaveLandingConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssistant) return;
    setIsSavingLanding(true);
    setSaveLandingSuccess(false);
    setSaveLandingError(null);
    try {
      const res = await fetch('/api/landing-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId: activeAssistant.id,
          config: landingConfig,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaveLandingSuccess(true);
        setTimeout(() => setSaveLandingSuccess(false), 3000);
      } else {
        setSaveLandingError(data.error || 'Failed to update landing page');
      }
    } catch (err: any) {
      setSaveLandingError(err.message || 'Network error saving landing page');
    } finally {
      setIsSavingLanding(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const res = await fetch('/api/team');
      if (res.ok) {
        const data = await res.json();
        setTeamMembers(data.members || []);
      }
    } catch (e) {}
  };

  const handleAddTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) return;
    setIsAddingTeamMember(true);
    setTeamError(null);
    setTeamSuccess(null);
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newMemberName.trim(),
          email: newMemberEmail.trim(),
          role: newMemberRole,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTeamSuccess(`Invited ${newMemberName} as ${newMemberRole.replace('_', ' ')}.`);
        setNewMemberName('');
        setNewMemberEmail('');
        setShowAddTeamModal(false);
        await fetchTeamMembers();
      } else {
        setTeamError(data.error || 'Failed to add team member');
      }
    } catch (err: any) {
      setTeamError(err.message || 'Network error adding member');
    } finally {
      setIsAddingTeamMember(false);
    }
  };

  const handleUpdateTeamMemberRole = async (id: string, role: string) => {
    try {
      const res = await fetch('/api/team', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, role }),
      });
      if (res.ok) {
        await fetchTeamMembers();
      }
    } catch (e) {}
  };

  const handleDeleteTeamMember = async (id: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    try {
      const res = await fetch(`/api/team?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchTeamMembers();
      }
    } catch (e) {}
  };

  const fetchAuditLogs = async () => {
    setIsSyncingAudit(true);
    try {
      const res = await fetch('/api/audit');
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.logs || []);
      }
    } catch (e) {} finally {
      setIsSyncingAudit(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        const list = data.notifications || [];
        setNotifications(list);
        setUnreadNotifCount(data.unreadCount || 0);

        if (list.length > 0) {
          const latest = list[0];
          if (lastNotifIdRef.current && latest.id !== lastNotifIdRef.current && !latest.read) {
            playNotificationChime();
            setIncomingToast(latest);
          }
          lastNotifIdRef.current = latest.id;
        }
      }
    } catch (e) {}
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_all_read' }),
      });
      if (res.ok) {
        setUnreadNotifCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch (e) {}
  };

  const fetch2faStatus = async () => {
    try {
      const res = await fetch('/api/auth/2fa');
      if (res.ok) {
        const data = await res.json();
        setTwoFactorEnabled(Boolean(data.enabled));
      }
    } catch (e) {}
  };

  const handleStart2faSetup = async () => {
    setTwoFactorLoading(true);
    setTwoFactorError(null);
    try {
      const res = await fetch('/api/auth/2fa?action=setup');
      const data = await res.json();
      if (res.ok) {
        setTwoFactorSetupData(data);
      } else {
        setTwoFactorError(data.error || 'Failed to initiate 2FA setup');
      }
    } catch (err: any) {
      setTwoFactorError(err.message || 'Network error');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleConfirm2faEnable = async () => {
    if (!twoFactorSetupData || !twoFactorCodeInput.trim()) return;
    setTwoFactorLoading(true);
    setTwoFactorError(null);
    setTwoFactorSuccess(null);
    try {
      const res = await fetch('/api/auth/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'enable',
          secret: twoFactorSetupData.secret,
          code: twoFactorCodeInput.trim(),
          recoveryCodes: twoFactorSetupData.recoveryCodes,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTwoFactorEnabled(true);
        setTwoFactorSuccess('Two-factor authentication is now active and protecting your account.');
        setTwoFactorSetupData(null);
        setTwoFactorCodeInput('');
      } else {
        setTwoFactorError(data.error || 'Invalid code');
      }
    } catch (err: any) {
      setTwoFactorError(err.message || 'Error enabling 2FA');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleDisable2fa = async () => {
    if (!confirm('Are you sure you want to disable two-factor authentication?')) return;
    setTwoFactorLoading(true);
    setTwoFactorError(null);
    try {
      const res = await fetch('/api/auth/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disable' }),
      });
      if (res.ok) {
        setTwoFactorEnabled(false);
        setTwoFactorSuccess('Two-factor authentication disabled.');
      }
    } catch (err: any) {
      setTwoFactorError(err.message || 'Error disabling 2FA');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  // Playground voice dictation
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  const handlePlaygroundVoiceToggle = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('Voice dictation is not supported in this browser. Please use Google Chrome, Edge, or Safari.');
      return;
    }

    if (isVoiceListening) {
      setIsVoiceListening(false);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsVoiceListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputQuery(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Voice recognition error:', event.error);
        setIsVoiceListening(false);
      };

      recognition.onend = () => {
        setIsVoiceListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error('Failed to start speech recognition', e);
      setIsVoiceListening(false);
    }
  };

  const renderTemplateIcon = (iconName: string) => {
    switch (iconName) {
      case 'Dumbbell':
        return <Dumbbell className="h-5 w-5 text-rose-500" />;
      case 'Home':
        return <Home className="h-5 w-5 text-emerald-500" />;
      case 'ShoppingBag':
        return <ShoppingBag className="h-5 w-5 text-purple-500" />;
      case 'Briefcase':
        return <Briefcase className="h-5 w-5 text-blue-500" />;
      case 'Scale':
        return <Scale className="h-5 w-5 text-slate-700 dark:text-slate-300" />;
      case 'Activity':
        return <Activity className="h-5 w-5 text-sky-500" />;
      default:
        return <Bot className="h-5 w-5 text-blue-500" />;
    }
  };

  // Modals & Alerts
  const [showNewModal, setShowNewModal] = useState(false);
  const [newAssistantName, setNewAssistantName] = useState('');
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedIframeCode, setCopiedIframeCode] = useState(false);
  const [playgroundAttachment, setPlaygroundAttachment] = useState<{
    name: string;
    type: string;
    size: number;
    data: string;
  } | null>(null);
  const playgroundFileInputRef = useRef<HTMLInputElement>(null);
  const [failedSourceModal, setFailedSourceModal] = useState<KnowledgeSource | null>(null);
  const [uploadFailureAlert, setUploadFailureAlert] = useState<{
    title: string;
    reason: string;
    whatToDoNext: string;
  } | null>(null);

  // URL Ingestion state
  const [urlInput, setUrlInput] = useState('');
  const [urlCustomTitle, setUrlCustomTitle] = useState('');
  const [isImportingUrl, setIsImportingUrl] = useState(false);
  const [urlFeedback, setUrlFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Custom host override for embed code on live sites
  const [customEmbedHost, setCustomEmbedHost] = useState('');

  // Knowledge Correction Modal state
  const [correctSource, setCorrectSource] = useState<KnowledgeSource | null>(null);
  const [isCorrectModalOpen, setIsCorrectModalOpen] = useState(false);
  const [correctionTab, setCorrectionTab] = useState<'replace' | 'override' | 'editor' | 'history'>('replace');
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [overrideNote, setOverrideNote] = useState('');
  const [fullSourceText, setFullSourceText] = useState('');
  const [sourceChunks, setSourceChunks] = useState<any[]>([]);
  const [pastCorrections, setPastCorrections] = useState<any[]>([]);
  const [isLoadingCorrectionData, setIsLoadingCorrectionData] = useState(false);
  const [isSavingCorrection, setIsSavingCorrection] = useState(false);
  const [correctionSuccessMsg, setCorrectionSuccessMsg] = useState<string | null>(null);
  const [correctionErrorMsg, setCorrectionErrorMsg] = useState<string | null>(null);

  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes <= 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Initial auth verification and dashboard bootstrap
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth');
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          await fetchAssistants();
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsAuthChecking(false);
      }
    }
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authLoginMode === 'admin') {
      if (!authApiKeyInput.trim()) return;
    } else {
      if (!staffEmailInput.trim() || !staffPasswordInput.trim()) return;
    }
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const payload =
        authLoginMode === 'admin'
          ? {
              mode: 'admin',
              key: authApiKeyInput.trim(),
              apiKey: authApiKeyInput.trim(),
            }
          : {
              mode: 'staff',
              email: staffEmailInput.trim(),
              password: staffPasswordInput.trim(),
            };
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setAuthApiKeyInput('');
        setStaffEmailInput('');
        setStaffPasswordInput('');
        await fetchAssistants();
      } else {
        setAuthError(data.error || (authLoginMode === 'admin' ? 'Invalid Admin Passcode or Key' : 'Invalid Staff Credentials'));
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
    } catch {}
    setIsAuthenticated(false);
  };

  useEffect(() => {
    if (activeAssistant) {
      setFormData(activeAssistant);
      fetchKnowledge(activeAssistant.id);
      fetchLeads(activeAssistant.id);
      fetchAppointments(activeAssistant.id);
      fetchUnansweredQueries(activeAssistant.id);
      fetchConversations(activeAssistant.id);
      fetchAnalytics(activeAssistant.id);
      fetchBilling();
      fetchLandingConfig(activeAssistant.id);
      fetchAllLandingPages();
      fetchTeamMembers();
      fetchAuditLogs();
      fetchNotifications();
      fetch2faStatus();
      // Reset playground
      setChatMessages([
        {
          role: 'assistant',
          content: activeAssistant.welcomeMessage || 'Hello! How can I assist you today?',
        },
      ]);
      setActiveCitations([]);

      // Zero-reload background polling: automatically updates counts & tables in real time
      const pollTimer = setInterval(() => {
        fetchKnowledge(activeAssistant.id);
        fetchLeads(activeAssistant.id);
        fetchAppointments(activeAssistant.id);
        fetchUnansweredQueries(activeAssistant.id);
        fetchConversations(activeAssistant.id);
        fetchNotifications();
      }, 3000);

      return () => clearInterval(pollTimer);
    }
  }, [activeAssistant?.id]);

  useEffect(() => {
    if (activeTab === 'landing_page' || activeTab === 'analytics') {
      fetchAllLandingPages();
    }
  }, [activeTab]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isStreaming]);

  async function fetchAssistants() {
    try {
      const res = await fetch('/api/assistants');
      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }
      const data = await res.json();
      if (data.assistants && data.assistants.length > 0) {
        setAssistants(data.assistants);
        if (!activeAssistant) {
          setActiveAssistant(data.assistants[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch assistants:', err);
    }
  }

  async function fetchKnowledge(assistantId: string) {
    try {
      const res = await fetch(`/api/knowledge?assistantId=${assistantId}`);
      const data = await res.json();
      if (data.sources) {
        setSources((prev) => {
          if (
            prev.length === data.sources.length &&
            prev.every(
              (s, i) =>
                s.id === data.sources[i]?.id &&
                s.status === data.sources[i]?.status &&
                s.chunkCount === data.sources[i]?.chunkCount
            )
          ) {
            return prev;
          }
          return data.sources;
        });
      }
    } catch (err) {
      console.error('Failed to fetch sources:', err);
    }
  }

  async function fetchLeads(assistantId: string) {
    try {
      const res = await fetch(`/api/lead?assistantId=${assistantId}`);
      const data = await res.json();
      if (data.leads) {
        setLeads((prev) => {
          if (
            prev.length === data.leads.length &&
            prev.every((l, i) => l.id === data.leads[i]?.id)
          ) {
            return prev;
          }
          return data.leads;
        });
      }
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    }
  }

  async function fetchAppointments(assistantId: string) {
    try {
      const res = await fetch(`/api/appointments?assistantId=${assistantId}`);
      const data = await res.json();
      if (data.appointments) {
        setAppointments((prev) => {
          if (
            prev.length === data.appointments.length &&
            prev.every((a, i) => a.id === data.appointments[i]?.id && a.status === data.appointments[i]?.status)
          ) {
            return prev;
          }
          return data.appointments;
        });
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    }
  }

  async function handleManualSyncAppointments() {
    if (!activeAssistant) return;
    setIsSyncingAppointments(true);
    await fetchAppointments(activeAssistant.id);
    setTimeout(() => setIsSyncingAppointments(false), 500);
  }

  async function handleUpdateAppointmentStatus(id: string, status: Appointment['status']) {
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_status', id, status }),
      });
      const data = await res.json();
      if (data.success) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status } : a))
        );
        if (selectedAppointmentModal && selectedAppointmentModal.id === id) {
          setSelectedAppointmentModal((prev) => prev ? { ...prev, status } : null);
        }
      }
    } catch (err) {
      console.error('Failed to update appointment status:', err);
    }
  }

  async function handleDeleteAppointment(id: string) {
    if (!confirm('Are you sure you want to delete this appointment?')) return;
    try {
      const res = await fetch(`/api/appointments?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setAppointments((prev) => prev.filter((a) => a.id !== id));
        if (selectedAppointmentModal?.id === id) {
          setSelectedAppointmentModal(null);
        }
      }
    } catch (err) {
      console.error('Failed to delete appointment:', err);
    }
  }

  async function fetchUnansweredQueries(assistantId: string) {
    try {
      const res = await fetch(`/api/analytics/unanswered?assistantId=${assistantId}`);
      const data = await res.json();
      if (data.unanswered) {
        setUnansweredQueries(data.unanswered);
      }
    } catch (err) {
      console.error('Failed to fetch unanswered queries:', err);
    }
  }

  async function handleResolveUnansweredQuery(
    id: string,
    action: 'resolve' | 'delete' | 'addKnowledge',
    query?: string
  ) {
    if (!activeAssistant) return;
    try {
      if (action === 'addKnowledge') {
        if (!knowledgeAnswerText.trim()) return;
        setIsSavingKnowledgeGap(true);
      }
      const res = await fetch('/api/analytics/unanswered', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          assistantId: activeAssistant.id,
          action,
          query,
          answer: action === 'addKnowledge' ? knowledgeAnswerText.trim() : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (action === 'addKnowledge') {
          setResolvingQueryId(null);
          setKnowledgeAnswerText('');
          await fetchKnowledge(activeAssistant.id);
        }
        await fetchUnansweredQueries(activeAssistant.id);
      }
    } catch (err) {
      console.error('Error updating unanswered query:', err);
    } finally {
      setIsSavingKnowledgeGap(false);
    }
  }

  async function fetchConversations(assistantId: string) {
    try {
      setIsLoadingConversations(true);
      const res = await fetch(`/api/conversations?assistantId=${assistantId}`);
      const data = await res.json();
      if (data.conversations) {
        setConversations(data.conversations);
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setIsLoadingConversations(false);
    }
  }

  async function handleApplyTemplate(templateId: string) {
    if (!activeAssistant) return;
    try {
      setApplyingTemplateId(templateId);
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          assistantId: activeAssistant.id,
          seedKnowledge: true,
        }),
      });
      const data = await res.json();
      if (data.success && data.assistant) {
        setActiveAssistant(data.assistant);
        setFormData(data.assistant);
        setTemplateSuccessMsg(`Applied "${data.assistant.name}" template & seeded ${data.seededKnowledgeCount || 0} sample knowledge articles!`);
        await fetchKnowledge(data.assistant.id);
        setTimeout(() => setTemplateSuccessMsg(null), 5000);
      }
    } catch (err) {
      console.error('Failed to apply template:', err);
    } finally {
      setApplyingTemplateId(null);
    }
  }

  const handleManualSyncLeads = async () => {
    if (!activeAssistant) return;
    setIsSyncingLeads(true);
    await fetchLeads(activeAssistant.id);
    setTimeout(() => setIsSyncingLeads(false), 500);
  };

  async function handleCreateAssistant(e: React.FormEvent) {
    e.preventDefault();
    if (!newAssistantName.trim()) return;

    try {
      const res = await fetch('/api/assistants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAssistantName.trim(),
          welcomeMessage: `Hello! Welcome to ${newAssistantName.trim()}. How can I assist you?`,
        }),
      });
      const data = await res.json();
      if (data.assistant) {
        setAssistants((prev) => [...prev, data.assistant]);
        setActiveAssistant(data.assistant);
        setShowNewModal(false);
        setNewAssistantName('');
      }
    } catch (err) {
      console.error('Failed to create assistant:', err);
    }
  }

  async function handleSaveSettings() {
    if (!activeAssistant) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/assistants/${activeAssistant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to save settings');
      }
      if (data.assistant) {
        setActiveAssistant(data.assistant);
        setFormData(data.assistant);
        setAssistants((prev) =>
          prev.map((a) => (a.id === data.assistant.id ? data.assistant : a))
        );
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      }
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      setSaveError(err?.message || 'Failed to save settings');
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUploadFiles(e: React.FormEvent) {
    e.preventDefault();
    if (!activeAssistant) return;
    if ((!selectedFiles || selectedFiles.length === 0) && !uploadText.trim()) return;

    setIsUploading(true);
    const body = new FormData();
    body.append('assistantId', activeAssistant.id);

    if (selectedFiles) {
      Array.from(selectedFiles).forEach((f) => body.append('files', f));
    }
    if (uploadText.trim()) {
      body.append('text', uploadText.trim());
      body.append('title', uploadTextTitle.trim() || 'Business Knowledge Description');
    }

    try {
      const res = await fetch('/api/knowledge/upload', {
        method: 'POST',
        body,
      });
      const data = await res.json();
      if (data.success) {
        setSelectedFiles(null);
        setUploadText('');
        setUploadTextTitle('');
        await fetchKnowledge(activeAssistant.id);

        const failedList = (data.sources || []).filter((s: any) => s.status === 'failed');
        if (failedList.length > 0) {
          const first = failedList[0];
          setUploadFailureAlert({
            title: first.title,
            reason: first.error || 'Content extraction failed',
            whatToDoNext:
              first.whatToDoNext ||
              'Please check the file format and requirements, or convert the document and try again.',
          });
        } else {
          setUploadFailureAlert(null);
        }
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleImportUrl(e: React.FormEvent) {
    e.preventDefault();
    if (!activeAssistant || !urlInput.trim()) return;

    setIsImportingUrl(true);
    setUrlFeedback(null);

    try {
      const res = await fetch('/api/knowledge/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId: activeAssistant.id,
          url: urlInput.trim(),
          customTitle: urlCustomTitle.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setUrlFeedback({
          type: 'success',
          message: `Successfully indexed "${data.source.title}" (${data.source.chunks} chunks generated)!`,
        });
        setUrlInput('');
        setUrlCustomTitle('');
        await fetchKnowledge(activeAssistant.id);
        setTimeout(() => setUrlFeedback(null), 5000);
      } else {
        setUrlFeedback({
          type: 'error',
          message: data.error || 'Failed to extract knowledge from this URL.',
        });
        if (data.source) {
          setUploadFailureAlert({
            title: data.source.title,
            reason: data.error,
            whatToDoNext: data.whatToDoNext,
          });
        }
        fetchKnowledge(activeAssistant.id);
      }
    } catch (err: any) {
      setUrlFeedback({
        type: 'error',
        message: err?.message || 'Network error importing URL.',
      });
    } finally {
      setIsImportingUrl(false);
    }
  }

  async function handleDeleteSource(id: string) {
    try {
      await fetch(`/api/knowledge?id=${id}`, { method: 'DELETE' });
      setSources((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Failed to delete source:', err);
    }
  }

  async function handleOpenCorrectionModal(source: KnowledgeSource) {
    setCorrectSource(source);
    setIsCorrectModalOpen(true);
    setCorrectionTab('replace');
    setFindText('');
    setReplaceText('');
    setOverrideNote('');
    setCorrectionSuccessMsg(null);
    setCorrectionErrorMsg(null);
    setIsLoadingCorrectionData(true);
    try {
      const res = await fetch(`/api/knowledge/correct?sourceId=${source.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load correction data');
      setSourceChunks(data.chunks || []);
      setFullSourceText(data.fullText || '');
      setPastCorrections(data.corrections || []);
    } catch (err: any) {
      setCorrectionErrorMsg(err.message || 'Failed to load source chunks');
    } finally {
      setIsLoadingCorrectionData(false);
    }
  }

  async function handleApplyCorrection(action: 'find_replace' | 'add_override_note' | 'edit_content') {
    if (!correctSource) return;
    setIsSavingCorrection(true);
    setCorrectionSuccessMsg(null);
    setCorrectionErrorMsg(null);
    try {
      const payload: any = {
        sourceId: correctSource.id,
        action,
      };
      if (action === 'find_replace') {
        if (!findText.trim()) {
          setCorrectionErrorMsg('Please specify the term to find.');
          setIsSavingCorrection(false);
          return;
        }
        payload.findText = findText;
        payload.replaceText = replaceText;
      } else if (action === 'add_override_note') {
        if (!overrideNote.trim()) {
          setCorrectionErrorMsg('Please enter the override note or authoritative fact.');
          setIsSavingCorrection(false);
          return;
        }
        payload.note = overrideNote;
      } else if (action === 'edit_content') {
        if (!fullSourceText.trim()) {
          setCorrectionErrorMsg('Content cannot be empty.');
          setIsSavingCorrection(false);
          return;
        }
        payload.fullText = fullSourceText;
      }

      const res = await fetch('/api/knowledge/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Correction failed');

      setCorrectionSuccessMsg(data.message || 'Correction applied and vector embeddings updated successfully!');

      // Reload fresh chunk and correction data
      const refreshRes = await fetch(`/api/knowledge/correct?sourceId=${correctSource.id}`);
      const refreshData = await refreshRes.json();
      if (refreshRes.ok) {
        setSourceChunks(refreshData.chunks || []);
        setFullSourceText(refreshData.fullText || '');
        setPastCorrections(refreshData.corrections || []);
      }

      // Refresh knowledge list in dashboard
      if (activeAssistant) {
        fetchKnowledge(activeAssistant.id);
      }

      if (action === 'find_replace') {
        setFindText('');
        setReplaceText('');
      } else if (action === 'add_override_note') {
        setOverrideNote('');
      }
    } catch (err: any) {
      setCorrectionErrorMsg(err.message || 'Failed to apply correction');
    } finally {
      setIsSavingCorrection(false);
    }
  }

  async function handleSendMessage(textToSend?: string) {
    const text = textToSend || inputQuery;
    if (!text.trim() || isStreaming || !activeAssistant) return;

    const newMsgs = [...chatMessages, { role: 'user', content: text.trim() }];
    setChatMessages(newMsgs);
    setInputQuery('');
    setIsStreaming(true);
    setStreamingStatus(null);

    const tempIndex = newMsgs.length;
    setChatMessages([...newMsgs, { role: 'assistant', content: '', citations: [] }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId: activeAssistant.id,
          messages: newMsgs.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error('Failed to get chat response');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let streamed = '';
      let citations: any[] = [];
      let isWebSearch = false;

      if (reader) {
        let updateTimer: any = null;
        const flushUpdate = () => {
          setChatMessages((prev) => {
            const updated = [...prev];
            updated[tempIndex] = {
              role: 'assistant',
              content: streamed,
              citations,
              isWebSearch,
            };
            return updated;
          });
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'status') {
                  if (data.status === 'searching_web') {
                    setStreamingStatus(data.message || 'Searching the web...');
                  } else if (data.status === 'web_results_found') {
                    setStreamingStatus('Web sources found, formulating answer...');
                  }
                } else if (data.type === 'citations') {
                  citations = data.citations || [];
                  isWebSearch = Boolean(data.isWebSearch);
                  setActiveCitations(isWebSearch ? citations : []);
                } else if (data.type === 'token') {
                  setStreamingStatus(null);
                  streamed += data.token;
                  if (!updateTimer) {
                    updateTimer = setTimeout(() => {
                      updateTimer = null;
                      flushUpdate();
                    }, 35);
                  }
                }
              } catch {
                // partial parse
              }
            }
          }
        }
        if (updateTimer) {
          clearTimeout(updateTimer);
        }
        flushUpdate();
      }
    } catch (err) {
      console.error('Playground chat error:', err);
      setChatMessages((prev) => {
        const updated = [...prev];
        updated[tempIndex] = {
          role: 'assistant',
          content: 'Error: Unable to connect to the AI service. Please verify your provider settings.',
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
      setStreamingStatus(null);
    }
  }

  const totalChunks = sources.reduce((sum, s) => sum + (s.chunkCount || 0), 0);
  const filteredSources = sources.filter((s) =>
    s.title.toLowerCase().includes(sourceFilter.toLowerCase())
  );

  if (isAuthChecking) {
    return (
      <div className={`${theme === 'dark' ? 'dark' : ''} h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 font-sans`}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md animate-pulse">
            <Bot className="h-6 w-6" />
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-600" />
            <span>Verifying workspace session...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={`${theme === 'dark' ? 'dark' : ''} min-h-screen w-full flex items-center justify-center bg-slate-950 font-sans p-4 relative overflow-hidden`}>
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-8 z-10 space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="h-14 w-14 rounded-2xl bg-blue-600/10 dark:bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-1">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Admin Authentication
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
              This dashboard is protected by enterprise master key verification. Please authenticate to access the management console.
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Login Type Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setAuthLoginMode('admin'); setAuthError(null); }}
              className={`flex-1 py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                authLoginMode === 'admin'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Key className="h-3.5 w-3.5" />
              <span>Master Admin Key</span>
            </button>
            <button
              type="button"
              onClick={() => { setAuthLoginMode('staff'); setAuthError(null); }}
              className={`flex-1 py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                authLoginMode === 'staff'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Staff Login</span>
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {authLoginMode === 'admin' ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Master Admin Key / Passcode</span>
                  <span className="text-[10px] text-slate-400 font-normal">ADMIN_API_KEY</span>
                </label>
                <div className="relative">
                  <input
                    type={showAuthPasscode ? 'text' : 'password'}
                    value={authApiKeyInput}
                    onChange={(e) => setAuthApiKeyInput(e.target.value)}
                    placeholder="Enter admin passcode or key..."
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs font-mono placeholder:font-sans placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAuthPasscode(!showAuthPasscode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showAuthPasscode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Staff Email Address</label>
                  <input
                    type="email"
                    value={staffEmailInput}
                    onChange={(e) => setStaffEmailInput(e.target.value)}
                    placeholder="staff@kortexai.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    autoFocus
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Password or Access Code</span>
                    <span className="text-[10px] text-slate-400">e.g. Staff123!</span>
                  </label>
                  <input
                    type="password"
                    value={staffPasswordInput}
                    onChange={(e) => setStaffPasswordInput(e.target.value)}
                    placeholder="Enter password or 6-digit access code..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn || (authLoginMode === 'admin' ? !authApiKeyInput.trim() : (!staffEmailInput.trim() || !staffPasswordInput.trim()))}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <Key className="h-3.5 w-3.5" />
                  <span>{authLoginMode === 'admin' ? 'Unlock Management Console' : 'Sign In to Staff Portal'}</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-[11px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800">
            Kortex AI Enterprise Security Guard · AES-256 GCM Protected
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} h-screen w-full flex flex-col font-sans transition-colors duration-150`}>
      <div className="flex h-screen w-full flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 overflow-hidden">
        
        {/* Top Enterprise Header */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 flex items-center justify-between sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-5">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white text-base tracking-tight">KORTEX AI</span>
                  <span className="text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded">
                    Enterprise SaaS
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Business Knowledge Chatbot Engine</p>
              </div>
            </div>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />

            {/* Assistant Selector */}
            <div className="relative flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-slate-500 dark:text-slate-400 font-medium">Assistant:</span>
                <select
                  value={activeAssistant?.id || ''}
                  onChange={(e) => {
                    const ast = assistants.find((a) => a.id === e.target.value);
                    if (ast) setActiveAssistant(ast);
                  }}
                  className="bg-transparent text-slate-800 dark:text-slate-200 outline-none cursor-pointer pr-2 font-semibold"
                >
                  {assistants.map((ast) => (
                    <option key={ast.id} value={ast.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      {ast.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setShowNewModal(true)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-xs"
                title="Create New Assistant"
              >
                <Plus className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>New Bot</span>
              </button>

              <button
                onClick={() => setActiveTab('templates')}
                className="flex items-center gap-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/40 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition shadow-xs cursor-pointer"
                title="Browse Ready-made Industry Bot Templates"
              >
                <LayoutTemplate className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Templates</span>
              </button>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Active Provider Indicator */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg">
              <span className="text-slate-500 dark:text-slate-400 font-sans">Active Engine:</span>
              <span className="text-blue-600 dark:text-blue-400 uppercase font-bold">
                {activeAssistant?.provider || 'OLLAMA'}
              </span>
            </div>

            {/* Theme Toggle (Light / Dark) */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-xs"
              title="Toggle Light / Dark Mode"
            >
              {theme === 'light' ? (
                <>
                  <Sun className="h-4 w-4 text-amber-500" />
                  <span className="hidden sm:inline font-medium">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-blue-400" />
                  <span className="hidden sm:inline font-medium">Dark Mode</span>
                </>
              )}
            </button>

            {/* Real-time In-App Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative flex items-center justify-center p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-xs cursor-pointer"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                    {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-4 z-50 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-blue-600" />
                      <span className="font-bold text-xs text-slate-900 dark:text-white">Activity Notifications</span>
                    </div>
                    {unreadNotifCount > 0 && (
                      <button
                        onClick={handleMarkAllNotificationsRead}
                        className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-slate-400">No activity yet</div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className={`py-2.5 px-1 flex gap-2.5 ${!n.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}>
                          <div className="mt-0.5">
                            <span className="h-2 w-2 rounded-full bg-blue-600 inline-block" />
                          </div>
                          <div className="flex-1 space-y-0.5">
                            <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{n.title}</div>
                            <div className="text-slate-500 text-[11px] leading-relaxed">{n.message}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{new Date(n.createdAt).toLocaleTimeString()}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Deploy / WordPress Plugin Button */}
            <button
              onClick={() => setShowEmbedModal(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 text-xs font-semibold shadow-xs transition"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Deploy &amp; WordPress</span>
            </button>

            {/* Lock / Logout Session Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/50 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition shadow-xs cursor-pointer"
              title="Lock Admin Dashboard"
            >
              <Lock className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
              <span className="hidden sm:inline font-medium">Lock</span>
            </button>
          </div>
        </header>

        {/* Main Shell (Sidebar + Content Workspace) */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Left Enterprise Sidebar */}
          <aside className="w-60 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 flex flex-col justify-between shrink-0">
            <div className="space-y-6">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2">
                  Management
                </div>
                <nav className="space-y-1">
                  {[
                    { id: 'overview', label: 'Overview', icon: FileCheck },
                    { id: 'analytics', label: 'Analytics & KPIs', icon: BarChart3 },
                    { id: 'billing', label: 'Plans & Billing', icon: CreditCard },
                    { id: 'landing_page', label: 'Landing Page', icon: Globe },
                    { id: 'team', label: 'Team & RBAC', icon: UserCheck, count: teamMembers.length },
                    { id: 'security', label: 'Security & 2FA', icon: ShieldCheck },
                    { id: 'audit', label: 'Audit Trail', icon: ClipboardList, count: auditLogs.length },
                    { id: 'knowledge', label: 'Knowledge Base', icon: Upload, count: sources.length },
                    { id: 'playground', label: 'Testing Studio', icon: MessageSquare },
                    { id: 'channels', label: 'Channels & Integrations', icon: Share2 },
                    { id: 'engine', label: 'AI Engine (BYOK)', icon: Cpu },
                    { id: 'behavior', label: 'Behavior & Rules', icon: Sliders },
                    { id: 'widget', label: 'Widget & Styling', icon: Palette },
                    { id: 'leads', label: 'Captured Leads', icon: Users, count: leads.length },
                    { id: 'appointments', label: 'Appointments', icon: Calendar, count: appointments.length },
                    { id: 'history', label: 'Chat History', icon: History, count: conversations.length },
                    { id: 'templates', label: 'Bot Templates', icon: LayoutTemplate },
                    { id: 'docs', label: 'Guides & Docs', icon: BookOpen },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition ${
                          isActive
                            ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`} />
                          <span>{tab.label}</span>
                        </div>
                        {tab.count !== undefined && (
                          <span
                            className={`rounded px-1.5 py-0.5 text-[11px] font-mono ${
                              isActive
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 font-bold'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {tab.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Status Compliance Box */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs space-y-2">
                <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-300">
                  <span>Enterprise RAG</span>
                  <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase">Ready</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  Zero cloud embedding fees. 384-dim normalized vector cosine search.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 font-mono">
              <span>KORTEX v2.0</span>
            </div>
          </aside>

          {/* Main Content Workspace */}
          <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6 sm:p-8">
            

            {/* TAB: ANALYTICS & KPIS */}
            {activeTab === 'analytics' && (
              <AnalyticsTab
                analyticsData={analyticsData}
                isLoadingAnalytics={isLoadingAnalytics}
                analyticsRange={analyticsRange}
                setAnalyticsRange={setAnalyticsRange}
                analyticsSlugFilter={analyticsSlugFilter}
                setAnalyticsSlugFilter={setAnalyticsSlugFilter}
                fetchAnalytics={fetchAnalytics}
                activeAssistant={activeAssistant}
                allLandingPages={allLandingPages}
                setActiveTab={setActiveTab}
                appointments={appointments}
              />
            )}


            {/* TAB: PLANS & BILLING (CHAT-BASED PRICING) */}
            {activeTab === 'billing' && (
              <BillingTab
                billingData={billingData}
                fetchBilling={fetchBilling}
                isLoadingBilling={isLoadingBilling}
                planChangeMsg={planChangeMsg}
                setPlanChangeMsg={setPlanChangeMsg}
                billingInterval={billingInterval}
                setBillingInterval={setBillingInterval}
                changingPlanId={changingPlanId}
                handleSwitchPlan={handleSwitchPlan}
                setShowPaymentModal={setShowPaymentModal}
                handleDownloadInvoice={handleDownloadInvoice}
              />
            )}

            {/* TAB: HOSTED BUSINESS LANDING PAGE */}
            {activeTab === 'landing_page' && (
              <LandingPageTab
                landingConfig={landingConfig}
                setLandingConfig={setLandingConfig}
                isSavingLanding={isSavingLanding}
                saveLandingSuccess={saveLandingSuccess}
                saveLandingError={saveLandingError}
                copiedLandingUrl={copiedLandingUrl}
                setCopiedLandingUrl={setCopiedLandingUrl}
                setShowCounterQrModal={setShowCounterQrModal}
                presetNotice={presetNotice}
                setPresetNotice={setPresetNotice}
                allLandingPages={allLandingPages}
                landingPageLimits={landingPageLimits}
                isPurchasingAddon={isPurchasingAddon}
                addonSuccessMsg={addonSuccessMsg}
                addonErrorMsg={addonErrorMsg}
                setShowNewPageModal={setShowNewPageModal}
                handlePurchaseExtraLandingPage={handlePurchaseExtraLandingPage}
                handleSaveLandingConfig={handleSaveLandingConfig}
                activeAssistant={activeAssistant}
                appointments={appointments}
                theme={theme}
              />
            )}

            {/* TAB: MULTI-USER TEAM & RBAC */}
            {activeTab === 'team' && (
              <TeamTab
                teamMembers={teamMembers}
                teamSuccess={teamSuccess}
                teamError={teamError}
                showAddTeamModal={showAddTeamModal}
                setShowAddTeamModal={setShowAddTeamModal}
                fetchTeamMembers={fetchTeamMembers}
                handleUpdateTeamMemberRole={handleUpdateTeamMemberRole}
                handleDeleteTeamMember={handleDeleteTeamMember}
                handleAddTeamMember={handleAddTeamMember}
                newMemberName={newMemberName}
                setNewMemberName={setNewMemberName}
                newMemberEmail={newMemberEmail}
                setNewMemberEmail={setNewMemberEmail}
                newMemberRole={newMemberRole}
                setNewMemberRole={setNewMemberRole}
                isAddingTeamMember={isAddingTeamMember}
              />
            )}

            {/* TAB: SECURITY & TWO-FACTOR AUTHENTICATION (2FA) */}
            {activeTab === 'security' && (
              <SecurityTab
                twoFactorEnabled={twoFactorEnabled}
                twoFactorSuccess={twoFactorSuccess}
                twoFactorError={twoFactorError}
                twoFactorLoading={twoFactorLoading}
                twoFactorSetupData={twoFactorSetupData}
                twoFactorCodeInput={twoFactorCodeInput}
                setTwoFactorCodeInput={setTwoFactorCodeInput}
                handleDisable2fa={handleDisable2fa}
                handleStart2faSetup={handleStart2faSetup}
                handleConfirm2faEnable={handleConfirm2faEnable}
              />
            )}

            {/* TAB: AUDIT TRAIL */}
            {activeTab === 'audit' && (
              <AuditTab
                auditLogs={auditLogs}
                isSyncingAudit={isSyncingAudit}
                fetchAuditLogs={fetchAuditLogs}
              />
            )}

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="max-w-5xl space-y-6 mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                      Welcome to {activeAssistant?.name}
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Your business assistant is ready. Train it on proprietary business files, configure rules, and embed it anywhere.
                    </p>
                  </div>
                </div>

                {/* Metric Stat Cards (Balanced Typography) */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Articles</div>
                    <div className="text-base font-semibold text-slate-900 dark:text-white mt-0.5">
                      {sources.length} Documents
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">+100% indexed</div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Vector Chunks</div>
                    <div className="text-base font-semibold text-slate-900 dark:text-white mt-0.5">
                      {totalChunks} Chunks
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">384-dim BGE-Small</div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Retrieval Mode</div>
                    <div className="text-base font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                      Hybrid RRF
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Cosine + BM25 Keywords</div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Embedding Cost</div>
                    <div className="text-base font-semibold text-slate-900 dark:text-white mt-0.5">
                      $0.00 / mo
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">Local CPU Embeddings</div>
                  </div>
                </div>

                {/* Knowledge Gap & Unanswered Questions Engine */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-amber-500" />
                        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                          Knowledge Gaps &amp; Unanswered Questions
                        </h2>
                        {unansweredQueries.filter((q) => !q.resolved).length > 0 && (
                          <span className="rounded-full bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                            {unansweredQueries.filter((q) => !q.resolved).length} Needs Answer
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Questions visitors asked that the AI couldn't answer from current documents. Add the answer with 1-click to immediately retrain the AI.
                      </p>
                    </div>
                  </div>

                  {unansweredQueries.length === 0 ? (
                    <div className="rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 p-4 text-center">
                      <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 inline mr-1" /> No knowledge gaps detected!
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        Your assistant has answered questions using your indexed knowledge base. New missing questions will appear here automatically.
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                        {unansweredQueries.slice(0, 8).map((item) => {
                          const isResolving = resolvingQueryId === item.id;
                          return (
                            <div key={item.id} className="p-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                                      &ldquo;{item.query}&rdquo;
                                    </span>
                                    {item.resolved ? (
                                      <span className="rounded bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                                        Resolved
                                      </span>
                                    ) : (
                                      <span className="rounded bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                                        Missing Answer
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-400">
                                    Logged {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {item.suggestedAnswer && (
                                      <span className="text-slate-500 dark:text-slate-400 ml-2 italic">
                                        &bull; Answer: {item.suggestedAnswer.slice(0, 60)}...
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  {!item.resolved && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setResolvingQueryId(isResolving ? null : item.id);
                                        setKnowledgeAnswerText('');
                                      }}
                                      className="px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 transition cursor-pointer"
                                    >
                                      {isResolving ? 'Cancel' : '1-Click Answer'}
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleResolveUnansweredQuery(item.id, 'delete')}
                                    title="Dismiss"
                                    className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Inline Quick Answer Composer */}
                              {isResolving && (
                                <div className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5 animate-in fade-in duration-150">
                                  <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    Type the answer to this question. It will be indexed immediately:
                                  </div>
                                  <textarea
                                    rows={2}
                                    value={knowledgeAnswerText}
                                    onChange={(e) => setKnowledgeAnswerText(e.target.value)}
                                    placeholder="e.g. Yes, we offer full refunds within 14 days of purchase. Contact support@ourstore.com with your order number."
                                    className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                                  />
                                  <div className="flex justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setResolvingQueryId(null)}
                                      className="px-2.5 py-1 rounded text-xs text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      disabled={!knowledgeAnswerText.trim() || isSavingKnowledgeGap}
                                      onClick={() => handleResolveUnansweredQuery(item.id, 'addKnowledge', item.query)}
                                      className="flex items-center gap-1.5 px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50 transition shadow-xs cursor-pointer"
                                    >
                                      {isSavingKnowledgeGap ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                                      <span>{isSavingKnowledgeGap ? 'Indexing...' : 'Save to Knowledge Base'}</span>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Action Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 shadow-xs">
                    <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-900 dark:text-white">
                      <Upload className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span>Upload Knowledge Documents</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Upload your product lists (CSV), contracts (PDF/DOCX), catalogues (JSON), or plain text. The local engine chunks and embeds them instantly for $0.
                    </p>
                    <button
                      onClick={() => setActiveTab('knowledge')}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Go to Knowledge Base &rarr;
                    </button>
                  </div>

                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 shadow-xs">
                    <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-900 dark:text-white">
                      <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span>Test Chat in Testing Studio</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Simulate customer questions. Verify citations, check accuracy on product pricing or terms, and test fallback behavior before launching.
                    </p>
                    <button
                      onClick={() => setActiveTab('playground')}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Open Testing Studio &rarr;
                    </button>
                  </div>
                </div>

                {/* Embed Snippet Card */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                      <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span>Embed On Any Business Website (WordPress, Shopify, Webflow)</span>
                    </div>
                    <button
                      onClick={() => {
                        const effectiveHost = (customEmbedHost.trim() || (typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com')).replace(/\/+$/, '');
                        navigator.clipboard.writeText(
                          `<script src="${effectiveHost}/widget.js" data-assistant="${activeAssistant?.id}" defer></script>`
                        );
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2000);
                      }}
                      className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 shadow-xs transition cursor-pointer"
                    >
                      <Copy className="h-3 w-3" />
                      <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>

                  {typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && !customEmbedHost.trim() && (
                    <div className="rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/20 p-3.5 flex items-start gap-2.5 text-xs">
                      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div className="text-slate-700 dark:text-slate-300 space-y-1">
                        <span className="font-semibold text-amber-900 dark:text-amber-200">
                          Embedding on a live HTTPS website (e.g. WordPress)?
                        </span>
                        <p className="leading-relaxed">
                          Web browsers automatically block <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 py-0.5 rounded text-amber-800 dark:text-amber-300 font-semibold">http://localhost:3000</code> on live HTTPS websites due to browser <strong>Mixed Content Security</strong>.
                        </p>
                        <p className="leading-relaxed">
                          To display the widget on a live site, deploy this app to a public HTTPS domain (e.g., <strong>Vercel</strong>, <strong>Railway</strong>) or use a secure HTTPS tunnel (like Cloudflare Tunnel or localtunnel), then enter your live URL in the field below.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>Server Host URL</span>
                      <span className="text-[11px] text-slate-400 font-normal">Leave blank to use current origin</span>
                    </label>
                    <input
                      type="url"
                      placeholder={typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}
                      value={customEmbedHost}
                      onChange={(e) => setCustomEmbedHost(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Paste this snippet before the closing <code className="text-blue-600 dark:text-blue-400 font-mono">&lt;/body&gt;</code> tag on your website:
                  </p>
                  <div className="overflow-x-auto rounded-lg bg-slate-50 dark:bg-slate-950 p-3 text-xs font-mono text-slate-800 dark:text-cyan-300 border border-slate-200 dark:border-slate-800">
                    &lt;script src=&quot;{(customEmbedHost.trim() || (typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com')).replace(/\/+$/, '')}/widget.js&quot; data-assistant=&quot;{activeAssistant?.id}&quot; defer&gt;&lt;/script&gt;
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: KNOWLEDGE BASE */}
            {activeTab === 'knowledge' && (
              <KnowledgeTab
                activeAssistant={activeAssistant}
                fetchKnowledge={fetchKnowledge}
                uploadFailureAlert={uploadFailureAlert}
                setUploadFailureAlert={setUploadFailureAlert}
                handleUploadFiles={handleUploadFiles}
                selectedFiles={selectedFiles}
                setSelectedFiles={setSelectedFiles}
                uploadTextTitle={uploadTextTitle}
                setUploadTextTitle={setUploadTextTitle}
                uploadText={uploadText}
                setUploadText={setUploadText}
                isUploading={isUploading}
                handleImportUrl={handleImportUrl}
                urlInput={urlInput}
                setUrlInput={setUrlInput}
                urlCustomTitle={urlCustomTitle}
                setUrlCustomTitle={setUrlCustomTitle}
                sourceFilter={sourceFilter}
                setSourceFilter={setSourceFilter}
                sources={sources}
                setFailedSourceModal={setFailedSourceModal}
                handleOpenCorrectionModal={handleOpenCorrectionModal}
                handleDeleteSource={handleDeleteSource}
                isImportingUrl={isImportingUrl}
                urlFeedback={urlFeedback}
              />
            )}

            {/* TAB 3: TESTING STUDIO (SPLIT PANE) */}
            {activeTab === 'playground' && (
              <div className="h-full flex flex-col max-w-6xl space-y-4 mx-auto">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Testing Studio</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Verify assistant responses and inspect retrieved knowledge chunks in real time.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setChatMessages([
                        {
                          role: 'assistant',
                          content: activeAssistant?.welcomeMessage || 'Hello! How can I assist you today?',
                        },
                      ])
                    }
                    className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg shadow-xs transition"
                  >
                    Clear Chat
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[500px]">
                  {/* Chat Messenger (2 cols) */}
                  <div className="lg:col-span-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between overflow-hidden">
                    {/* Chat Messages */}
                    <div className="p-4 overflow-y-auto space-y-3.5 flex-1 max-h-[460px]">
                      {chatMessages.map((msg, i) => (
                        <div
                          key={i}
                          className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                              msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-br-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-xs border border-slate-200/80 dark:border-slate-700/60'
                            }`}
                          >
                            {msg.role === 'assistant' ? (
                              <MarkdownRenderer content={msg.content} />
                            ) : (
                              <div className="whitespace-pre-wrap">{msg.content}</div>
                            )}

                            {/* Web Citations ONLY for Live Web Search - Never expose internal knowledge base files, URLs, or documents */}
                            {(() => {
                              const isLive = Boolean(msg.isWebSearch || (msg.citations || []).some((c: any) => c.isLiveWebSearch));
                              if (!isLive) return null;
                              const webCitations = (msg.citations || []).filter((c: any) => c && c.url && (c.url.startsWith('http://') || c.url.startsWith('https://')));
                              if (webCitations.length === 0) return null;
                              return (
                                <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px]">
                                  <div className="font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                                    <span className="flex items-center gap-1"><Globe className="h-3 w-3 text-sky-500" /> Web Sources:</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {webCitations.map((c: any, ci: number) => (
                                      <a
                                        key={ci}
                                        href={c.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 border px-2 py-0.5 rounded text-[10px] font-mono transition hover:underline hover:opacity-90 bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800"
                                        title={c.preview || c.url}
                                      >
                                        <span className="flex items-center gap-1"><Globe className="h-3 w-3 text-sky-500 shrink-0" /><span className="truncate max-w-[200px]">{c.sourceTitle}</span></span>
                                        <span className="text-[9px] opacity-70">↗</span>
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      ))}
                      {isStreaming && (
                        <div className="flex items-center gap-2 text-xs py-1">
                          {streamingStatus ? (
                            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium animate-pulse">
                              <svg className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                              </svg>
                              <span>{streamingStatus}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                              <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
                              <span>Retrieving context &amp; generating streaming answer...</span>
                            </div>
                          )}
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Starter Pills */}
                    {activeAssistant?.starterQuestions && activeAssistant.starterQuestions.length > 0 && (
                      <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5">
                        {activeAssistant.starterQuestions.slice(0, 3).map((q, i) => (
                          <button
                            key={i}
                            onClick={() => handleSendMessage(q)}
                            className="text-[11px] rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Chat Input Bar */}
                    <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                      {playgroundAttachment && (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                            <span className="font-semibold truncate max-w-[200px] text-slate-800 dark:text-slate-200">{playgroundAttachment.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({Math.round(playgroundAttachment.size / 1024)} KB)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setPlaygroundAttachment(null);
                              if (playgroundFileInputRef.current) playgroundFileInputRef.current.value = '';
                            }}
                            className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <input
                          ref={playgroundFileInputRef}
                          type="file"
                          accept=".pdf,.docx,.txt,.csv,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 15 * 1024 * 1024) {
                              alert('File is too large. Maximum size is 15 MB.');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = () => {
                              setPlaygroundAttachment({
                                name: file.name,
                                type: file.type || file.name.split('.').pop() || 'file',
                                size: file.size,
                                data: reader.result as string,
                              });
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => playgroundFileInputRef.current?.click()}
                          title="Attach file to chat"
                          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer shrink-0"
                        >
                          <Paperclip className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handlePlaygroundVoiceToggle}
                        title={isVoiceListening ? 'Stop Voice Dictation' : 'Speak / Voice Dictation'}
                        className={`p-2 rounded-lg border transition cursor-pointer shrink-0 ${
                          isVoiceListening
                            ? 'bg-red-500 text-white border-red-600 animate-pulse'
                            : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {isVoiceListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </button>
                      <input
                        type="text"
                        placeholder="Type a message to test your knowledge base..."
                        value={inputQuery}
                        onChange={(e) => setInputQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSendMessage();
                        }}
                        className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => handleSendMessage()}
                        disabled={isStreaming || !inputQuery.trim()}
                        className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 transition shadow-xs"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Send</span>
                      </button>
                    </div>
                  </div>
                </div>

                  {/* RAG Inspector Panel (1 col) */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-5 space-y-4 flex flex-col justify-between shadow-xs">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">RAG Inspector</span>
                        <span className="text-[10px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded">
                          Connected
                        </span>
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Active AI Provider</label>
                        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
                          <span className="font-semibold text-slate-900 dark:text-white uppercase font-mono">{activeAssistant?.provider || 'Ollama'}</span>
                          <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">{activeAssistant?.modelName || 'llama3.2'}</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                          Retrieved Fragments ({activeCitations.length})
                        </label>
                        {activeCitations.length === 0 ? (
                          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-[11px] text-slate-500 dark:text-slate-400 text-center">
                            Ask a question to see retrieved knowledge chunks and citations here.
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {activeCitations.map((c, i) => {
                              const st = (c.sourceType || '').toLowerCase();
                              const stTitle = (c.sourceTitle || '').toLowerCase();
                              const isYt = st === 'youtube' || stTitle.includes('youtube');
                              const isWeb = st === 'web';
                              const isVid = ['mp4', 'webm', 'mov', 'mkv', 'avi', 'm4v', 'video'].some((e) => st.includes(e) || stTitle.endsWith(`.${e}`));
                              const isAud = ['mp3', 'wav', 'm4a', 'ogg', 'flac', 'aac', 'audio'].some((e) => st.includes(e) || stTitle.endsWith(`.${e}`));
                              const renderCitationIcon = () => {
                                if (isYt) return <Youtube className="h-3 w-3 text-red-500 shrink-0" />;
                                if (isWeb) return <Globe className="h-3 w-3 text-emerald-500 shrink-0" />;
                                if (isVid) return <Video className="h-3 w-3 text-purple-500 shrink-0" />;
                                if (isAud) return <Mic className="h-3 w-3 text-cyan-500 shrink-0" />;
                                if (st === 'pdf' || stTitle.endsWith('.pdf')) return <FileText className="h-3 w-3 text-red-500 shrink-0" />;
                                if (st === 'csv' || stTitle.endsWith('.csv')) return <FileSpreadsheet className="h-3 w-3 text-green-500 shrink-0" />;
                                return <FileEdit className="h-3 w-3 text-blue-500 shrink-0" />;
                              };
                              return (
                                <div key={i} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-[11px] space-y-1">
                                  <div className="flex items-center justify-between text-[10px] font-mono">
                                    <div className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1.5 truncate pr-2">
                                      <span>[{i + 1}]</span>
                                      <span className="truncate flex items-center gap-1">{renderCitationIcon()} {c.sourceTitle}</span>
                                    </div>
                                    {c.url && (
                                      <a
                                        href={c.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sky-600 dark:text-sky-400 hover:underline shrink-0 flex items-center gap-0.5 font-sans font-medium"
                                      >
                                        <span>Visit</span>
                                        <span className="text-[9px]">↗</span>
                                      </a>
                                    )}
                                  </div>
                                  <div className="text-slate-600 dark:text-slate-300 line-clamp-2">{c.preview}</div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex justify-between font-mono">
                      <span>Vector Dims: <strong>384</strong></span>
                      <span>Embed Cost: <strong className="text-emerald-600 dark:text-emerald-400">$0.00</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: AI ENGINE (BYOK) */}
            {activeTab === 'engine' && (
              <div className="max-w-4xl space-y-6 mx-auto">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">AI Engine &amp; BYOK Configuration</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Choose between 100% free open-source models (Ollama local or Groq free tier) or connect customer-provided API keys (OpenAI, Anthropic, Gemini, DeepSeek).
                  </p>
                </div>

                {saveSuccess && (
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-3 text-xs text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Configuration saved successfully!</span>
                  </div>
                )}

                {saveError && (
                  <div className="flex items-center gap-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 p-3 text-xs text-rose-700 dark:text-rose-300">
                    <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span>{saveError}</span>
                  </div>
                )}

                {/* Provider Selection Cards */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Select AI Provider</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'groq', label: 'Groq Cloud', tag: 'ULTRA-FAST (FREE)', desc: 'Instant sub-second Llama 3.3' },
                      { id: 'gemini', label: 'Google Gemini', tag: 'FAST (FREE TIER)', desc: 'Gemini 1.5 & 2.0 Flash' },
                      { id: 'ollama', label: 'Local Ollama', tag: '100% FREE', desc: 'Runs on your PC CPU/GPU' },
                      { id: 'openai', label: 'OpenAI', tag: 'BYOK', desc: 'GPT-4o & GPT-4o-mini' },
                      { id: 'anthropic', label: 'Anthropic Claude', tag: 'BYOK', desc: 'Claude 3.5 Sonnet & Haiku' },
                      { id: 'deepseek', label: 'DeepSeek', tag: 'BYOK', desc: 'DeepSeek-V3 & R1' },
                    ].map((prov) => {
                      const isSelected = (formData.provider || 'ollama') === prov.id;
                      return (
                        <button
                          key={prov.id}
                          type="button"
                          onClick={() => {
                            const defaultModels: Record<string, string> = {
                              ollama: 'llama3.2',
                              groq: 'openai/gpt-oss-120b',
                              openai: 'gpt-4o-mini',
                              gemini: 'gemini-1.5-flash',
                              anthropic: 'claude-3-5-haiku-20241022',
                              deepseek: 'deepseek-chat',
                            };
                            setFormData({
                              ...formData,
                              provider: prov.id,
                              modelName: defaultModels[prov.id] || 'llama3.2',
                            });
                          }}
                          className={`text-left p-3.5 rounded-xl border transition relative ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-slate-900 dark:text-white shadow-xs'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{prov.label}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              prov.tag.includes('ULTRA-FAST')
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}>
                              {prov.tag}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-snug">
                            {prov.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Groq Callout */}
                {formData.provider === 'groq' && (
                  <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-4 text-xs text-emerald-800 dark:text-emerald-200 flex items-start gap-3">
                    <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-1.5">
                      <p className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                        <span>Recommended for Lightning Speed (~500+ tokens/sec)</span>
                        <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded text-[10px]">100% Free Tier</span>
                      </p>
                      <p className="text-slate-600 dark:text-slate-300 text-[11.5px] leading-relaxed">
                        Groq runs open-source Llama 3 models on specialized LPU hardware with near-instant responses. Their free tier offers 14,400 requests/day at $0 cost (no credit card required).
                      </p>
                      <div className="pt-1">
                        <a
                          href="https://console.groq.com/keys"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition shadow-xs"
                        >
                          <span>Get Free Groq API Key (10 Seconds)</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Gemini Callout */}
                {formData.provider === 'gemini' && (
                  <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-4 text-xs text-blue-800 dark:text-blue-200 flex items-start gap-3">
                    <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div className="space-y-1.5">
                      <p className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2">
                        <span>Sub-Second Speed with Google Gemini Flash</span>
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded text-[10px]">Free Tier</span>
                      </p>
                      <p className="text-slate-600 dark:text-slate-300 text-[11.5px] leading-relaxed">
                        Google AI Studio provides 15 requests per minute completely free with Gemini 1.5 &amp; 2.0 Flash.
                      </p>
                      <div className="pt-1">
                        <a
                          href="https://aistudio.google.com/app/apikey"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition shadow-xs"
                        >
                          <span>Get Free Gemini API Key</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ollama CPU Notice */}
                {formData.provider === 'ollama' && (
                  <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-amber-900 dark:text-amber-200">Local CPU Speed Note</p>
                      <p className="text-slate-600 dark:text-slate-300 text-[11.5px] leading-relaxed">
                        Running local LLMs on a CPU (without an Nvidia GPU) typically runs at 2-4 tokens/sec, taking ~30-60 seconds per response.
                      </p>
                      <p className="text-amber-800 dark:text-amber-300 text-[11.5px]">
                        <strong>Instant Response Tip (1-2s):</strong> Switch to <strong>Groq Cloud</strong> above (free API key at console.groq.com) for 100x faster generation at $0 cost!
                      </p>
                    </div>
                  </div>
                )}

                {/* Engine Settings Box */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                        Model Identifier
                      </label>
                      <input
                        type="text"
                        value={formData.modelName || ''}
                        onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                        placeholder="e.g. openai/gpt-oss-120b, qwen/qwen3.8-27b, gpt-4o-mini"
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-mono outline-none focus:border-blue-500"
                      />
                      {(formData.provider || 'ollama') === 'groq' && (
                        <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">Groq Models:</span>
                          {[
                            { id: 'openai/gpt-oss-120b', label: 'GPT-OSS 120B (Recommended)' },
                            { id: 'qwen/qwen3.8-27b', label: 'Qwen 3.8 27B (Ultra-Fast)' },
                            { id: 'openai/gpt-oss-20b', label: 'GPT-OSS 20B' },
                          ].map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setFormData({ ...formData, modelName: m.id })}
                              className={`text-[10px] px-2 py-0.5 rounded border transition font-mono ${
                                formData.modelName === m.id
                                  ? 'bg-blue-100 dark:bg-blue-900/60 border-blue-400 text-blue-800 dark:text-blue-300 font-bold'
                                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-blue-600'
                              }`}
                            >
                              {m.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center justify-between">
                        <span>Temperature ({formData.temperature ?? 0.3})</span>
                        <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
                          {(formData.temperature ?? 0.3) <= 0.2 ? 'Strict & Factual' : (formData.temperature ?? 0.3) <= 0.5 ? 'Balanced (Recommended)' : 'Creative'}
                        </span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={formData.temperature ?? 0.3}
                        onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                        className="w-full mt-1 accent-blue-600"
                      />
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        Controls response randomness: <strong>0.0</strong> is strict & deterministic (zero hallucination, ideal for factual business support); <strong>0.3–0.5</strong> is natural & conversational; <strong>0.8+</strong> is creative.
                      </p>
                    </div>
                  </div>

                  {/* Performance Tuning Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center justify-between">
                        <span>Knowledge Context Chunks</span>
                        <span className="text-blue-600 dark:text-blue-400 font-mono font-bold">{formData.contextChunks ?? 5} chunks</span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="15"
                        step="1"
                        value={formData.contextChunks ?? 5}
                        onChange={(e) => setFormData({ ...formData, contextChunks: parseInt(e.target.value) })}
                        className="w-full mt-2 accent-blue-600"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center justify-between">
                        <span>Max Response Tokens</span>
                        <span className="text-blue-600 dark:text-blue-400 font-mono font-bold">{formData.maxTokens ?? 2048} tokens</span>
                      </label>
                      <input
                        type="range"
                        min="250"
                        max="4096"
                        step="50"
                        value={formData.maxTokens ?? 2048}
                        onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })}
                        className="w-full mt-2 accent-blue-600"
                      />
                    </div>
                  </div>

                  {/* Live Web Search Permission Toggle */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Allow Live Online Web Search</span>
                        {(formData.allowWebSearch ?? true) ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-1.5 py-0.5 rounded-full">ENABLED</span>
                        ) : (
                          <span className="text-[10px] bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 font-bold px-1.5 py-0.5 rounded-full">DISABLED</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-lg">
                        When enabled, visitors can ask the bot to search the internet for fresh information in real-time. The bot automatically verifies and saves the new findings into this assistant's knowledge base.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input
                        type="checkbox"
                        checked={formData.allowWebSearch ?? true}
                        onChange={(e) => setFormData({ ...formData, allowWebSearch: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* API Key input if not Ollama */}
                  {(formData.provider || 'ollama') !== 'ollama' && (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                        {(formData.provider || '').toUpperCase()} API Key (BYOK)
                      </label>
                      <div className="relative">
                        <input
                          type={showApiKey ? 'text' : 'password'}
                          value={formData.apiKeyEncrypted || ''}
                          onChange={(e) => setFormData({ ...formData, apiKeyEncrypted: e.target.value })}
                          placeholder="gsk_... or sk-..."
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 pr-10 text-xs text-slate-900 dark:text-slate-100 font-mono outline-none focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                          {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Ollama endpoint if Ollama */}
                  {(formData.provider || 'ollama') === 'ollama' && (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                        Ollama Endpoint URL
                      </label>
                      <input
                        type="text"
                        value={formData.customBaseUrl || 'http://localhost:11434/v1'}
                        onChange={(e) => setFormData({ ...formData, customBaseUrl: e.target.value })}
                        placeholder="http://localhost:11434/v1"
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-mono outline-none focus:border-blue-500"
                      />
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleSaveSettings}
                      disabled={isSaving}
                      className="flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 transition shadow-xs"
                    >
                      {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                      <span>Save Engine Settings</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: BEHAVIOR & RULES */}
            {activeTab === 'behavior' && (
              <div className="max-w-4xl space-y-6 mx-auto">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Behavior &amp; Guardrails</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Define how your assistant represents the business, its personality tone, and what it says when information is missing.
                  </p>
                </div>

                {saveSuccess && (
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-3 text-xs text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Behavior updated successfully!</span>
                  </div>
                )}

                {saveError && (
                  <div className="flex items-center gap-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 p-3 text-xs text-rose-700 dark:text-rose-300">
                    <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span>{saveError}</span>
                  </div>
                )}

                {/* Template Presets */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Quick Personality Templates</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      {
                        name: 'E-commerce Sales Rep',
                        prompt: 'You are an enthusiastic, knowledgeable sales assistant. Guide customers to the right products, highlight benefits, and confirm exact prices and shipping policies from the provided knowledge.',
                      },
                      {
                        name: 'Customer Support Specialist',
                        prompt: 'You are an empathetic, concise, and problem-solving support agent. Help customers troubleshoot issues, follow return guidelines, and provide clear step-by-step instructions.',
                      },
                      {
                        name: 'Corporate FAQ Bot',
                        prompt: 'You are an executive assistant representing our firm. Provide formal, precise, and verified facts. Never speculate on unannounced policies.',
                      },
                    ].map((t) => (
                      <button
                        key={t.name}
                        type="button"
                        onClick={() => setFormData({ ...formData, systemPrompt: t.prompt })}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition shadow-xs"
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Inputs */}
                <div className="space-y-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                      System Instructions &amp; Role
                    </label>
                    <textarea
                      rows={5}
                      value={formData.systemPrompt || ''}
                      onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 leading-relaxed font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                        Welcome Message
                      </label>
                      <input
                        type="text"
                        value={formData.welcomeMessage || ''}
                        onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                        Fallback Message
                      </label>
                      <input
                        type="text"
                        value={formData.fallbackMessage || ''}
                        onChange={(e) => setFormData({ ...formData, fallbackMessage: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleSaveSettings}
                      disabled={isSaving}
                      className="flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 transition shadow-xs"
                    >
                      {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                      <span>Save Guardrails</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: WIDGET & STYLING */}
            {activeTab === 'widget' && (
              <WidgetTab
                formData={formData}
                setFormData={setFormData}
                handleSaveSettings={handleSaveSettings}
                isSaving={isSaving}
                saveSuccess={saveSuccess}
                saveError={saveError}
              />
            )}

            {/* TAB: CHANNELS & INTEGRATIONS */}
            {activeTab === 'channels' && (
              <ChannelsTab
                activeAssistant={activeAssistant}
                formData={formData}
                setFormData={setFormData}
                handleSaveSettings={handleSaveSettings}
                isSaving={isSaving}
                saveSuccess={saveSuccess}
                saveError={saveError}
                leads={leads}
                smtpConfig={smtpConfig}
                setSmtpConfig={setSmtpConfig}
                smtpLoading={smtpLoading}
                smtpSaveSuccess={smtpSaveSuccess}
                smtpSaveError={smtpSaveError}
                smtpTestEmail={smtpTestEmail}
                setSmtpTestEmail={setSmtpTestEmail}
                smtpTesting={smtpTesting}
                smtpTestResult={smtpTestResult}
                handleSaveSmtpSettings={handleSaveSmtpSettings}
                handleTestEmailSend={handleTestEmailSend}
              />
            )}

            {/* TAB 7: LEADS & INQUIRIES */}
            {activeTab === 'leads' && (
              <div className="max-w-6xl space-y-6 mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Captured Leads &amp; Support Requests</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Inquiries, contact info, and custom field data submitted by visitors via the chat widget.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Live Sync Active</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleManualSyncLeads}
                      disabled={isSyncingLeads}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-xs disabled:opacity-50 transition cursor-pointer"
                      title="Fetch newest leads right now"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isSyncingLeads ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
                      <span>{isSyncingLeads ? 'Syncing...' : 'Sync Now'}</span>
                    </button>

                    <button
                      onClick={() => {
                        const csvHeader = 'ID,Name,Email,Phone,Comments,Custom Fields,Date\n';
                        const csvRows = leads
                          .map((l) => {
                            const customStr = l.customData
                              ? Object.entries(l.customData)
                                  .map(([k, v]) => `${k}: ${v}`)
                                  .join(' | ')
                              : '';
                            return `"${l.id}","${(l.name || '').replace(/"/g, '""')}","${l.email}","${(l.phone || '').replace(/"/g, '""')}","${(l.notes || '').replace(/"/g, '""')}","${customStr.replace(/"/g, '""')}","${l.createdAt}"`;
                          })
                          .join('\n');
                        const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `leads-${activeAssistant?.name || 'export'}.csv`;
                        a.click();
                      }}
                      disabled={leads.length === 0}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
                  {leads.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                      No leads or support requests captured yet. When visitors use the support form in the widget, submissions will appear here.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="py-3 px-5">Visitor Contact</th>
                          <th className="py-3 px-5">Phone</th>
                          <th className="py-3 px-5">Comments / Notes</th>
                          <th className="py-3 px-5">Custom Fields</th>
                          <th className="py-3 px-5">Date</th>
                          <th className="py-3 px-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {leads.map((lead) => {
                          const customEntries = lead.customData ? Object.entries(lead.customData) : [];
                          return (
                            <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                              <td className="py-3.5 px-5">
                                <div className="font-semibold text-slate-900 dark:text-white">
                                  {lead.name || 'Website Visitor'}
                                </div>
                                <div className="text-blue-600 dark:text-blue-400 font-mono text-[11px]">
                                  {lead.email}
                                </div>
                              </td>
                              <td className="py-3.5 px-5 font-mono text-slate-700 dark:text-slate-300">
                                {lead.phone || '—'}
                              </td>
                              <td className="py-3.5 px-5 max-w-[200px]">
                                {lead.notes ? (
                                  <span className="text-slate-600 dark:text-slate-400 line-clamp-2" title={lead.notes}>
                                    {lead.notes}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic">None</span>
                                )}
                              </td>
                              <td className="py-3.5 px-5">
                                {customEntries.length > 0 ? (
                                  <div className="flex flex-wrap gap-1 max-w-[220px]">
                                    {customEntries.map(([k, v]) => (
                                      <span
                                        key={k}
                                        className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                                      >
                                        <strong className="font-medium mr-1">{k}:</strong> {String(v)}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic text-[11px]">—</span>
                                )}
                              </td>
                              <td className="py-3.5 px-5 text-slate-500 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                                {new Date(lead.createdAt).toLocaleDateString()}{' '}
                                <span className="text-[10px] opacity-75">
                                  {new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </td>
                              <td className="py-3.5 px-5 text-right">
                                <button
                                  type="button"
                                  onClick={() => setSelectedLeadModal(lead)}
                                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 px-2.5 py-1 rounded transition cursor-pointer"
                                >
                                  Details
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* TAB: BOOKED APPOINTMENTS */}
            {activeTab === 'appointments' && (
              <AppointmentsTab
                activeAssistant={activeAssistant}
                setActiveTab={setActiveTab}
                appointments={appointments}
                isSyncingAppointments={isSyncingAppointments}
                setSelectedAppointmentModal={setSelectedAppointmentModal}
                handleManualSyncAppointments={handleManualSyncAppointments}
                handleUpdateAppointmentStatus={handleUpdateAppointmentStatus}
                handleDeleteAppointment={handleDeleteAppointment}
              />
            )}

            {/* TAB: GUIDES & DOCS */}
            {activeTab === 'docs' && (
              <div className="p-6 max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    Guides &amp; Documentation
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Step-by-step guides to set up integrations, train your AI, and get the most out of Kortex AI.
                  </p>
                </div>

                {/* Section: Getting Started */}
                <div>
                  <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                    Getting Started
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        title: 'Training Your AI with Data',
                        badge: 'Core',
                        badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
                        steps: [
                          'Go to Knowledge Base in the sidebar.',
                          'Click "Upload File" — supports PDF, CSV, DOCX, TXT, PNG/JPG images.',
                          'Or paste a URL / YouTube link to extract content automatically.',
                          'Wait for status to turn "Ready" (green). This means the AI has indexed the data.',
                          'Test it instantly in Testing Studio by asking questions.',
                        ],
                        tip: 'For large datasets, use CSV files with column headers. The AI understands tabular data like member lists, product catalogs, and FAQs.',
                      },
                      {
                        title: 'Embedding the Widget on Your Site',
                        badge: 'Setup',
                        badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
                        steps: [
                          'Go to Widget & Styling → click "Embed on Your Site".',
                          'Copy the one-line <script> tag shown in the modal.',
                          'Paste it before the </body> tag on any HTML page.',
                          'For WordPress: use a plugin like "Insert Headers and Footers" to paste the script.',
                          'For Webflow/Framer: paste in "Custom Code" → Before </body>.',
                        ],
                        tip: 'The widget loads asynchronously — it won\'t slow down your page. Works on any site.',
                      },
                    ].map((guide) => (
                      <div
                        key={guide.title}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${guide.badgeColor}`}>
                            {guide.badge}
                          </span>
                          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{guide.title}</h3>
                        </div>
                        <ol className="space-y-1.5 mb-3">
                          {guide.steps.map((step, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                              <span className="shrink-0 w-4 h-4 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold mt-0.5">
                                {i + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                        {guide.tip && (
                          <div className="flex items-start gap-2 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl p-2.5">
                            <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <span>{guide.tip}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section: Integrations */}
                <div>
                  <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                    Integrations
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        title: 'Connect WhatsApp',
                        badge: 'WhatsApp Cloud API',
                        badgeColor: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
                        steps: [
                          'Go to Meta for Developers → create a new app → choose "Business" type.',
                          'Add the WhatsApp product to your app.',
                          'Under WhatsApp → Getting Started: copy your Phone Number ID and temporary Access Token.',
                          'In Kortex → Channels & Integrations → WhatsApp, paste both values.',
                          'Set the Verify Token to any string you choose (e.g. "kortex2024").',
                          'In Meta Dashboard → WhatsApp → Configuration, set Webhook URL to the one shown in Kortex and use your same Verify Token.',
                          'Subscribe to the "messages" webhook field and click Verify.',
                          'Enable WhatsApp in Kortex and save.',
                        ],
                        tip: 'Use a permanent System User token for production instead of the temporary token which expires.',
                      },
                      {
                        title: 'Connect Telegram',
                        badge: 'Telegram Bot API',
                        badgeColor: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
                        steps: [
                          'Open Telegram and search for @BotFather.',
                          'Send /newbot and follow the prompts to name your bot.',
                          'BotFather gives you a Bot Token — copy it.',
                          'Go to Kortex → Channels & Integrations → Telegram Bot.',
                          'Paste your Bot Token and click "Test Connection" to verify it works.',
                          'Click "Set Webhook" — this connects Telegram to your Kortex assistant.',
                          'Enable the bot and save. Users can now chat your AI via Telegram.',
                        ],
                        tip: 'Your Telegram bot is public by default. Consider setting /setprivacy with BotFather to control group access.',
                      },
                      {
                        title: 'Outbound Webhooks',
                        badge: 'Automation',
                        badgeColor: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
                        steps: [
                          'Go to Channels & Integrations → Outbound Webhooks.',
                          'Enter your endpoint URL (e.g. a Zapier Webhook, Make.com, or your own server).',
                          'Set a Webhook Secret — this signs each request with HMAC SHA-256 for security.',
                          'Select which events to send: Lead Captured, Message Sent, etc.',
                          'Click "Send Test Ping" to verify your endpoint receives data.',
                          'Save. Every matching event will now POST JSON to your URL.',
                        ],
                        tip: 'Verify the X-Kortex-Signature header on your receiving server to prevent spoofed requests.',
                      },
                      {
                        title: 'White-Label / Agency Branding',
                        badge: 'Agency',
                        badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
                        steps: [
                          'Go to Channels & Integrations → White-Label Agency Branding.',
                          'Toggle "Enable White-Label" to ON.',
                          'Enter your brand name (e.g. "Powered by Acme AI") in Custom Branding Text.',
                          'Enter your brand URL for the clickable link.',
                          'Save — the widget footer now shows your brand instead of Kortex AI.',
                        ],
                        tip: 'You can leave the URL blank to disable the link and just show your brand text.',
                      },
                    ].map((guide) => (
                      <div
                        key={guide.title}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${guide.badgeColor}`}>
                            {guide.badge}
                          </span>
                          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{guide.title}</h3>
                        </div>
                        <ol className="space-y-1.5 mb-3">
                          {guide.steps.map((step, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                              <span className="shrink-0 w-4 h-4 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold mt-0.5">
                                {i + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                        {guide.tip && (
                          <div className="flex items-start gap-2 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl p-2.5">
                            <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <span>{guide.tip}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section: AI & Knowledge Tips */}
                <div>
                  <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                    AI & Knowledge Tips
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        iconName: 'file',
                        title: 'Best File Formats',
                        body: 'PDFs and CSVs give the best accuracy. For member data, use a CSV with headers like Name, Email, DOB, Plan. Avoid scanned images when possible — use real text PDFs.',
                      },
                      {
                        iconName: 'target',
                        title: 'Writing a Good System Prompt',
                        body: 'Be specific: tell the AI its role ("You are a support agent for Acme Gym"), what it should and shouldn\'t answer, and what tone to use. Short and clear beats long and vague.',
                      },
                      {
                        iconName: 'refresh',
                        title: 'Re-training After Updates',
                        body: 'After updating source material (new FAQ, updated policy), delete the old knowledge source and re-upload the new file. The AI uses what\'s indexed — stale data = stale answers.',
                      },
                      {
                        iconName: 'globe',
                        title: 'Adding Web Pages',
                        body: 'Use the URL field to scrape any public webpage — product pages, terms, about pages. Works best on pages without JavaScript-rendered content (static HTML).',
                      },
                      {
                        iconName: 'youtube',
                        title: 'YouTube Transcripts',
                        body: 'Paste a YouTube URL to extract the video transcript. Great for indexing explainer videos, tutorials, and interviews. Only works if captions are available on the video.',
                      },
                      {
                        iconName: 'eye',
                        title: 'Image Text (OCR)',
                        body: 'Upload PNG/JPG files — the AI extracts printed text from the image. Works best on clear, high-contrast text. Handwritten notes and low-quality scans may not extract well.',
                      },
                    ].map((card) => (
                      <div
                        key={card.title}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs"
                      >
                        <div className="mb-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 inline-block border border-slate-200 dark:border-slate-700">
                          {card.iconName === 'file' && <FileText className="h-5 w-5 text-blue-500" />}
                          {card.iconName === 'target' && <Target className="h-5 w-5 text-rose-500" />}
                          {card.iconName === 'refresh' && <RefreshCw className="h-5 w-5 text-amber-500" />}
                          {card.iconName === 'globe' && <Globe className="h-5 w-5 text-emerald-500" />}
                          {card.iconName === 'youtube' && <Youtube className="h-5 w-5 text-red-500" />}
                          {card.iconName === 'eye' && <Eye className="h-5 w-5 text-purple-500" />}
                        </div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-xs mb-1.5">{card.title}</h4>
                        <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed">{card.body}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section: Lead Capture */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-3 flex items-center gap-2">
                    <span className="flex items-center gap-1.5"><ClipboardList className="h-4 w-4 text-blue-500 inline" /><span>Setting Up Lead Capture</span></span>
                  </h3>
                  <ol className="space-y-2">
                    {[
                      'Go to Behavior & Rules → Lead Capture section.',
                      'Toggle "Collect Lead Email" to ON.',
                      'Enter the Receiver Email — this is who gets notified when a lead submits their info.',
                      'Optionally add CC emails (comma-separated) for your team.',
                      'Add Custom Form Fields if you need more than just name/email/phone (e.g. "Company", "Budget", "Membership Plan").',
                      'Save Settings. The widget will now show a contact form when visitors express interest.',
                      'View all captured leads in the Captured Leads tab.',
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <span className="shrink-0 w-4 h-4 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold mt-0.5">
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

              </div>
            )}

            {/* TAB 9: BOT TEMPLATES GALLERY */}
            {activeTab === 'templates' && (
              <div className="max-w-6xl space-y-6 mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                      <LayoutTemplate className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      <span>Ready-to-Use Industry Bot Templates</span>
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Instantly configure your assistant with expert system prompts, starter questions, lead fields, and seeded knowledge articles.
                    </p>
                  </div>
                </div>

                {templateSuccessMsg && (
                  <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 p-4 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2.5 animate-in fade-in">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="font-semibold">{templateSuccessMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {BOT_TEMPLATES.map((tmpl) => {
                    const isApplying = applyingTemplateId === tmpl.id;
                    return (
                      <div
                        key={tmpl.id}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition"
                      >
                        <div className="space-y-3.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">{renderTemplateIcon(tmpl.icon)}</div>
                              <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{tmpl.name}</h3>
                                <span className="text-[10.5px] font-semibold text-slate-500 dark:text-slate-400">
                                  {tmpl.industry}
                                </span>
                              </div>
                            </div>
                            <span
                              className="h-3.5 w-3.5 rounded-full border border-slate-200 dark:border-slate-700 shrink-0 mt-1"
                              style={{ backgroundColor: tmpl.primaryColor }}
                              title={`Theme: ${tmpl.primaryColor}`}
                            />
                          </div>

                          <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-snug">
                            {tmpl.tagline}
                          </p>

                          <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed">
                            {tmpl.description}
                          </p>

                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                            <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                              Included Starter Questions:
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {tmpl.starterQuestions.slice(0, 3).map((q, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md"
                                >
                                  {q}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-[10.5px] text-slate-500 dark:text-slate-400 pt-1">
                            {tmpl.bookingEnabled && (
                              <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                                <Calendar className="h-3 w-3" /> Booking Ready
                              </span>
                            )}
                            {tmpl.collectLeadEmail && (
                              <span className="flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400">
                                <Users className="h-3 w-3" /> Lead Capture
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              {tmpl.sampleKnowledge.length} Sample Docs
                            </span>
                          </div>
                        </div>

                        <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">
                          <button
                            type="button"
                            disabled={isApplying}
                            onClick={() => handleApplyTemplate(tmpl.id)}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white py-2 text-xs font-semibold transition shadow-xs disabled:opacity-50 cursor-pointer"
                          >
                            {isApplying ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                <span>Applying Template...</span>
                              </>
                            ) : (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                <span>Use This Template</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 10: CHAT HISTORY & CONVERSATION LOGS */}
            {activeTab === 'history' && (
              <ConversationsTab
                activeAssistant={activeAssistant}
                setActiveTab={setActiveTab}
                conversations={conversations}
                setConversations={setConversations}
                isLoadingConversations={isLoadingConversations}
                fetchConversations={fetchConversations}
                playNotificationChime={playNotificationChime}
              />
            )}

          </main>
        </div>

        {/* MODAL: NEW ASSISTANT */}
        {showNewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Create New Business Assistant</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Create an isolated assistant with its own knowledge base, prompt instructions, and website widget.
              </p>
              <form onSubmit={handleCreateAssistant} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Assistant Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sales Specialist, Store Support AI"
                    value={newAssistantName}
                    onChange={(e) => setNewAssistantName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewModal(false)}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition"
                  >
                    Create Assistant
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: FILE FAILURE DIAGNOSTIC & WHAT TO DO NEXT */}
        {failedSourceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-4">
            <div className="w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-5 animate-in fade-in duration-150">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      File Indexing Diagnostic
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-sm" title={failedSourceModal.title}>
                      {failedSourceModal.title}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFailedSourceModal(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Content Cards */}
              {(() => {
                const diag = diagnoseKnowledgeFailure({
                  filename: failedSourceModal.title,
                  type: failedSourceModal.type,
                  errorMessage: failedSourceModal.errorMessage,
                  fileSizeBytes: failedSourceModal.fileSizeBytes,
                });
                return (
                  <div className="space-y-3.5 text-xs">
                    {/* Card 1: Why it failed */}
                    <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/20 space-y-1.5">
                      <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                        Why This File Failed:
                      </div>
                      <p className="text-rose-900 dark:text-rose-200 leading-relaxed">
                        {diag.reason}
                      </p>
                    </div>

                    {/* Card 2: What you should do next */}
                    <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/20 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        What You Should Do Next:
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                        {diag.whatToDoNext}
                      </p>
                    </div>

                    {/* Metadata summary */}
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-wrap gap-4 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      <div>
                        Type: <span className="font-semibold uppercase text-slate-700 dark:text-slate-200">{failedSourceModal.type}</span>
                      </div>
                      {failedSourceModal.fileSizeBytes && (
                        <div>
                          Size: <span className="font-semibold text-slate-700 dark:text-slate-200">{formatBytes(failedSourceModal.fileSizeBytes)}</span>
                        </div>
                      )}
                      <div>
                        Logged: <span className="text-slate-700 dark:text-slate-200">{new Date(failedSourceModal.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Technical details accordion */}
                    {failedSourceModal.errorMessage && (
                      <details className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                        <summary className="cursor-pointer font-semibold hover:text-slate-800 dark:hover:text-slate-200">
                          View Technical Log Details
                        </summary>
                        <pre className="mt-2 p-2 bg-slate-100 dark:bg-slate-900 rounded text-[10px] font-mono text-slate-700 dark:text-slate-300 overflow-x-auto whitespace-pre-wrap">
                          {failedSourceModal.errorMessage}
                        </pre>
                      </details>
                    )}
                  </div>
                );
              })()}

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={async () => {
                    await handleDeleteSource(failedSourceModal.id);
                    setFailedSourceModal(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-semibold transition cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove Failed Record</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFailedSourceModal(null)}
                  className="rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition cursor-pointer"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: KNOWLEDGE SOURCE CORRECTION & OVERRIDES */}
        {isCorrectModalOpen && correctSource && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
            <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in duration-150">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 p-5 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50">
                    <Wand2 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                        Knowledge Correction &amp; Fact Patching
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {correctSource.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md" title={correctSource.title}>
                      {correctSource.title} · {sourceChunks.length || correctSource.chunkCount} active vector chunks
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCorrectModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Subheader / Tabs */}
              <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <button
                  type="button"
                  onClick={() => setCorrectionTab('replace')}
                  className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-medium border-b-2 transition cursor-pointer ${
                    correctionTab === 'replace'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  <span>Phonetic &amp; Term Replace</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCorrectionTab('override')}
                  className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-medium border-b-2 transition cursor-pointer ${
                    correctionTab === 'override'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Authoritative Fact Override</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCorrectionTab('editor')}
                  className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-medium border-b-2 transition cursor-pointer ${
                    correctionTab === 'editor'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  <FileEdit className="h-3.5 w-3.5" />
                  <span>Direct Text Editor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCorrectionTab('history')}
                  className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-medium border-b-2 transition cursor-pointer ${
                    correctionTab === 'history'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  <History className="h-3.5 w-3.5" />
                  <span>History</span>
                  {pastCorrections.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                      {pastCorrections.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Body */}
              <div className="p-5 overflow-y-auto space-y-4 flex-1">
                {/* Alerts */}
                {correctionSuccessMsg && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 animate-in fade-in">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{correctionSuccessMsg}</span>
                  </div>
                )}
                {correctionErrorMsg && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 animate-in fade-in">
                    <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                    <span>{correctionErrorMsg}</span>
                  </div>
                )}

                {isLoadingCorrectionData ? (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
                    <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
                    <span className="text-xs">Loading chunks and vectors...</span>
                  </div>
                ) : (
                  <>
                    {/* TAB 1: Phonetic & Term Replace */}
                    {correctionTab === 'replace' && (
                      <div className="space-y-4">
                        <div className="bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-xl p-3.5 text-xs text-slate-600 dark:text-slate-300">
                          <p className="font-semibold text-indigo-950 dark:text-indigo-200 mb-1">
                            Fix Misheard Words &amp; Typos Across Embeddings
                          </p>
                          <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                            Did speech-to-text transcribe someone&apos;s name or product incorrectly (e.g. &ldquo;Jon Dough&rdquo; instead of &ldquo;John Doe&rdquo;)? Enter the misheard phrase and the correct term. We will update the text across all chunks and automatically recalculate high-dimensional vector embeddings in-place without re-uploading the file.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              Word / Phrase to Find
                            </label>
                            <input
                              type="text"
                              value={findText}
                              onChange={(e) => setFindText(e.target.value)}
                              placeholder="e.g. Jon Dough or $49"
                              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              Corrected Replacement
                            </label>
                            <input
                              type="text"
                              value={replaceText}
                              onChange={(e) => setReplaceText(e.target.value)}
                              placeholder="e.g. John Doe or $59"
                              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        </div>

                        {/* Live match indicator */}
                        {(() => {
                          if (!findText.trim()) return null;
                          let occurrences = 0;
                          let matchingChunks = 0;
                          try {
                            const regex = new RegExp(findText.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                            sourceChunks.forEach((c) => {
                              const m = (c.content || '').match(regex);
                              if (m && m.length > 0) {
                                occurrences += m.length;
                                matchingChunks++;
                              }
                            });
                          } catch (e) {}

                          return (
                            <div className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                              occurrences > 0
                                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200'
                                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                            }`}>
                              <span className="flex items-center gap-1.5 font-medium">
                                <Search className="h-3.5 w-3.5" />
                                {occurrences > 0
                                  ? `Found ${occurrences} occurrence(s) across ${matchingChunks} chunk(s)`
                                  : `No occurrences of "${findText.trim()}" found in current chunks`}
                              </span>
                              {occurrences > 0 && replaceText && (
                                <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                                  Will replace with &ldquo;{replaceText}&rdquo;
                                </span>
                              )}
                            </div>
                          );
                        })()}

                        <button
                          type="button"
                          disabled={isSavingCorrection || !findText.trim()}
                          onClick={() => handleApplyCorrection('find_replace')}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
                        >
                          {isSavingCorrection ? (
                            <>
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              <span>Updating Chunks &amp; Vector Embeddings...</span>
                            </>
                          ) : (
                            <>
                              <Wand2 className="h-3.5 w-3.5" />
                              <span>Apply Replacement &amp; Re-Index Vectors</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* TAB 2: Fact Override Note */}
                    {correctionTab === 'override' && (
                      <div className="space-y-4">
                        <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-xl p-3.5 text-xs text-slate-600 dark:text-slate-300">
                          <p className="font-semibold text-emerald-950 dark:text-emerald-200 mb-1">
                            Official Fact &amp; Knowledge Override
                          </p>
                          <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                            Have an authoritative policy change or crucial fact that should supersede any outdated audio/video transcription or legacy document statement? Write it here. An official override banner will be injected into this source&apos;s vector embeddings with maximum retrieval weight.
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Official Correction / Rule
                          </label>
                          <textarea
                            rows={4}
                            value={overrideNote}
                            onChange={(e) => setOverrideNote(e.target.value)}
                            placeholder="e.g. As of 2026, the gym closes at 11 PM on weekends instead of 10 PM. Personal training sessions are $65/hr."
                            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        <button
                          type="button"
                          disabled={isSavingCorrection || !overrideNote.trim()}
                          onClick={() => handleApplyCorrection('add_override_note')}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
                        >
                          {isSavingCorrection ? (
                            <>
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              <span>Embedding Override Rule...</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="h-3.5 w-3.5" />
                              <span>Inject Authoritative Override &amp; Re-Index</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* TAB 3: Direct Text Editor */}
                    {correctionTab === 'editor' && (
                      <div className="space-y-4">
                        <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-xs text-slate-600 dark:text-slate-300">
                          <p className="font-semibold text-slate-900 dark:text-white mb-1">
                            Full Document Text Editor
                          </p>
                          <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                            View or edit the full synthesized text of this knowledge source. Saving will regenerate chunk boundaries and fresh vector embeddings across the entire document.
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Document Content ({fullSourceText.length} characters)
                          </label>
                          <textarea
                            rows={10}
                            value={fullSourceText}
                            onChange={(e) => setFullSourceText(e.target.value)}
                            className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        <button
                          type="button"
                          disabled={isSavingCorrection || !fullSourceText.trim()}
                          onClick={() => handleApplyCorrection('edit_content')}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
                        >
                          {isSavingCorrection ? (
                            <>
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              <span>Re-chunking &amp; Re-indexing Vectors...</span>
                            </>
                          ) : (
                            <>
                              <FileEdit className="h-3.5 w-3.5" />
                              <span>Save &amp; Re-chunk Entire Document</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* TAB 4: History */}
                    {correctionTab === 'history' && (
                      <div className="space-y-3">
                        {pastCorrections.length === 0 ? (
                          <div className="py-8 text-center text-slate-400 text-xs">
                            No corrections or overrides have been applied to this knowledge source yet.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {pastCorrections.map((corr, idx) => (
                              <div
                                key={corr.id || idx}
                                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                                    {corr.type === 'replace' ? 'Term Replacement' : corr.type === 'note' ? 'Fact Override' : 'Text Edit'}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {corr.appliedAt ? new Date(corr.appliedAt).toLocaleString() : 'Recent'}
                                  </span>
                                </div>
                                {corr.findText && (
                                  <div className="text-slate-600 dark:text-slate-300 text-[11px]">
                                    Replaced <code className="text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-1 py-0.5 rounded">{corr.findText}</code> with <code className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1 py-0.5 rounded">{corr.replaceText}</code>
                                  </div>
                                )}
                                {corr.note && (
                                  <p className="text-slate-600 dark:text-slate-300 text-[11px] italic">
                                    &ldquo;{corr.note}&rdquo;
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <button
                  type="button"
                  onClick={() => setIsCorrectModalOpen(false)}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}


        {/* MODAL: UPDATE PAYMENT METHOD */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Update Payment Details</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleUpdatePaymentMethod} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Card Brand</label>
                  <select
                    value={cardBrand}
                    onChange={(e) => setCardBrand(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="American Express">American Express</option>
                    <option value="Discover">Discover</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Last 4 Digits</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={cardLast4}
                    onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, ''))}
                    placeholder="4242"
                    required
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-mono text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Exp Month</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={cardExpMonth}
                      onChange={(e) => setCardExpMonth(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-mono text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Exp Year</label>
                    <input
                      type="number"
                      min={2026}
                      max={2040}
                      value={cardExpYear}
                      onChange={(e) => setCardExpYear(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-mono text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Billing Email Address</label>
                  <input
                    type="email"
                    value={billingEmailInput}
                    onChange={(e) => setBillingEmailInput(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-mono text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingCard}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {isUpdatingCard ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    <span>Save Card</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* MODAL: EMBED & DEPLOY */}
        {showEmbedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Deploy on Website &amp; WordPress</h2>
                <button
                  onClick={() => setShowEmbedModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Option 1: Single-Line JavaScript Embed</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mb-2">
                    Paste this snippet before <code className="text-blue-600 dark:text-blue-400">&lt;/body&gt;</code> on any HTML, Shopify, or Webflow site:
                  </p>
                  <div className="relative">
                    <pre className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-800 dark:text-cyan-300 overflow-x-auto">
{`<script src="${(customEmbedHost.trim() || (typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com')).replace(/\/+$/, '')}/widget.js" data-assistant="${activeAssistant?.id}" defer></script>`}
                    </pre>
                    <button
                      onClick={() => {
                        const effectiveHost = (customEmbedHost.trim() || (typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com')).replace(/\/+$/, '');
                        navigator.clipboard.writeText(
                          `<script src="${effectiveHost}/widget.js" data-assistant="${activeAssistant?.id}" defer></script>`
                        );
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2000);
                      }}
                      className="absolute right-2 top-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded text-[10px] text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                    >
                      {copiedCode ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-slate-900 dark:text-white">Option 2: Inline Iframe Embed (Embed Anywhere on Page)</h4>
                    <span className="text-[10px] bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold px-2 py-0.5 rounded">Inline Chatbox</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mb-2">
                    Embed the chatbox directly inside any page container, contact section, blog post, or full-width customer portal without a floating bubble:
                  </p>
                  <div className="relative">
                    <pre className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-800 dark:text-cyan-300 overflow-x-auto">
{`<iframe src="${(customEmbedHost.trim() || (typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com')).replace(/\/+$/, '')}/embed/${activeAssistant?.id}" width="100%" height="650" frameborder="0" style="border:none; border-radius:16px; width:100%; height:650px; box-shadow:0 4px 20px rgba(0,0,0,0.06);" allow="microphone"></iframe>`}
                    </pre>
                    <button
                      onClick={() => {
                        const effectiveHost = (customEmbedHost.trim() || (typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com')).replace(/\/+$/, '');
                        navigator.clipboard.writeText(
                          `<iframe src="${effectiveHost}/embed/${activeAssistant?.id}" width="100%" height="650" frameborder="0" style="border:none; border-radius:16px; width:100%; height:650px; box-shadow:0 4px 20px rgba(0,0,0,0.06);" allow="microphone"></iframe>`
                        );
                        setCopiedIframeCode(true);
                        setTimeout(() => setCopiedIframeCode(false), 2000);
                      }}
                      className="absolute right-2 top-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded text-[10px] text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                    >
                      {copiedIframeCode ? 'Copied!' : 'Copy Iframe'}
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Option 3: 1-Click WordPress Plugin</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mb-2">
                    The standalone plugin is included in your repository at <code className="text-slate-700 dark:text-slate-300 font-mono">wordpress/ai-business-assistant/</code>.
                  </p>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                    <li>Zip the <code className="font-mono">ai-business-assistant</code> folder and upload to WordPress Admin &rarr; Plugins &rarr; Add New.</li>
                    <li>Activate the plugin and open <code className="font-mono">AI Assistant</code> settings in the WordPress menu.</li>
                    <li>Set Server URL to <code className="font-mono">{typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}</code> and Assistant ID to <code className="font-mono">{activeAssistant?.id}</code>.</li>
                  </ol>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowEmbedModal(false)}
                  className="rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: VIEW LEAD DETAILS */}
        {selectedLeadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-5 animate-in fade-in duration-150">
              <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      {selectedLeadModal.name || 'Website Visitor'}
                    </h2>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-mono">
                      {selectedLeadModal.email}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLeadModal(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div>
                    <div className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wide">Phone Number</div>
                    <div className="font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                      {selectedLeadModal.phone || 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wide">Submission Date</div>
                    <div className="text-slate-800 dark:text-slate-200 mt-0.5">
                      {new Date(selectedLeadModal.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Custom Fields */}
                {selectedLeadModal.customData && Object.keys(selectedLeadModal.customData).length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Custom Fields
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                      {Object.entries(selectedLeadModal.customData).map(([key, val]) => (
                        <div key={key} className="flex justify-between items-center text-xs border-b border-slate-200/50 dark:border-slate-700/50 pb-1.5 last:border-none last:pb-0">
                          <span className="font-semibold text-slate-600 dark:text-slate-400">{key}:</span>
                          <span className="font-medium text-slate-900 dark:text-white font-mono">{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Visitor Comments */}
                <div>
                  <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Visitor Comments / Message
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {selectedLeadModal.notes || <span className="text-slate-400 italic">No additional comments provided.</span>}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex gap-2">
                  <a
                    href={`mailto:${selectedLeadModal.email}?subject=Re:%20Support%20Inquiry%20via%20${encodeURIComponent(activeAssistant?.name || 'AI Assistant')}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
                  >
                    <span>Reply Email</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  {selectedLeadModal.phone && (
                    <a
                      href={`tel:${selectedLeadModal.phone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold shadow-xs transition"
                    >
                      <span>Call</span>
                    </a>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLeadModal(null)}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: VIEW APPOINTMENT DETAILS */}
        {selectedAppointmentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-5 animate-in fade-in duration-150">
              <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Appointment Details
                    </h3>
                    <div className="text-[11px] text-slate-500 font-mono">
                      ID: {selectedAppointmentModal.id}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAppointmentModal(null)}
                  className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                      Client Name
                    </div>
                    <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                      {selectedAppointmentModal.name}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                      Email Address
                    </div>
                    <div className="font-mono text-blue-600 dark:text-blue-400 mt-0.5">
                      {selectedAppointmentModal.email}
                    </div>
                  </div>
                  {selectedAppointmentModal.phone && (
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                        Phone Number
                      </div>
                      <div className="font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                        {selectedAppointmentModal.phone}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                      Booking Status
                    </div>
                    <div className="mt-0.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        selectedAppointmentModal.status === 'confirmed'
                          ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                          : selectedAppointmentModal.status === 'pending'
                          ? 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                          : selectedAppointmentModal.status === 'completed'
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                          : 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200'
                      }`}>
                        {selectedAppointmentModal.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-1.5">
                  <div className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 tracking-wider">
                    Scheduled Time Slot
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-600" />
                    <span>{selectedAppointmentModal.date}</span>
                    <span>•</span>
                    <span>{selectedAppointmentModal.timeSlot}</span>
                  </div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold">
                    Duration: {selectedAppointmentModal.durationMinutes >= 60 ? `${Math.floor(selectedAppointmentModal.durationMinutes / 60)} Hour(s)` : `${selectedAppointmentModal.durationMinutes} Minutes`}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Meeting Notes / Visitor Inquiries
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {selectedAppointmentModal.notes || <span className="text-slate-400 italic">No notes provided for this booking.</span>}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-500">Change Status:</span>
                    <select
                      value={selectedAppointmentModal.status}
                      onChange={(e) => handleUpdateAppointmentStatus(selectedAppointmentModal.id, e.target.value as any)}
                      className="text-xs font-semibold rounded-lg px-2 py-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`mailto:${selectedAppointmentModal.email}?subject=Regarding%20Your%20Scheduled%20Appointment%20(${selectedAppointmentModal.date}%20at%20${encodeURIComponent(selectedAppointmentModal.timeSlot)})`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                    >
                      <span>Email Client</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setSelectedAppointmentModal(null)}
                      className="rounded-lg border border-slate-200 dark:border-slate-700 px-3.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: COUNTERTOP QR CODE */}

        {/* Bottom-Left Notification Arrival Toast & Chime Alert */}
        {incomingToast && (
          <div className="fixed bottom-6 left-6 z-50 max-w-sm w-full bg-white dark:bg-slate-900 border border-blue-500/40 dark:border-blue-500/30 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-bottom-5 duration-300 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{incomingToast.title}</span>
                <button
                  type="button"
                  onClick={() => setIncomingToast(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">{incomingToast.message}</p>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIncomingToast(null);
                    setIsNotifOpen(true);
                  }}
                  className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  View Notifications
                </button>
                <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                <span className="text-[10px] text-slate-400 font-mono">Just now</span>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Create New Landing Page */}
        {showNewPageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Create New Landing Page</h3>
                    <p className="text-xs text-slate-500">Add a dedicated hosted website for your business or campaign.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewPageModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateNewLandingPage} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Business Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Health & Aesthetics"
                    value={newPageName}
                    onChange={(e) => {
                      setNewPageName(e.target.value);
                      if (!newPageSlug) {
                        setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                      }
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">URL Slug (/site/[slug])</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. apex-health"
                    value={newPageSlug}
                    onChange={(e) => setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Base Industry Template</label>
                  <select
                    value={newPageIndustry}
                    onChange={(e) => setNewPageIndustry(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="barbershop">Barbershop &amp; Men's Grooming</option>
                    <option value="gym">Gym &amp; Fitness Athletics</option>
                    <option value="real_estate">Real Estate &amp; Properties</option>
                    <option value="ecommerce">E-Commerce &amp; Retail</option>
                    <option value="saas">B2B SaaS &amp; Tech</option>
                    <option value="legal">Legal &amp; Law Firm</option>
                    <option value="healthcare">Dental &amp; Healthcare</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowNewPageModal(false)}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Landing Page</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showCounterQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-sm w-full text-center space-y-5 shadow-2xl relative">
              <button
                onClick={() => setShowCounterQrModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 border border-blue-200 dark:border-blue-800 mx-auto">
                <QrCode className="h-6 w-6" />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  In-Store Countertop QR Code
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Print and place this on your reception desk for walk-in booking and live prices.
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-center shadow-inner">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                    typeof window !== 'undefined'
                      ? `${window.location.origin}/site/${landingConfig.slug || activeAssistant?.id || 'demo-assistant'}`
                      : 'http://localhost:3000/site/classic-barbershop'
                  )}`}
                  alt="Countertop QR Code"
                  className="w-52 h-52 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition shadow-xs"
                >
                  Print Countertop Display
                </button>
                <button
                  type="button"
                  onClick={() => setShowCounterQrModal(false)}
                  className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl text-xs transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
