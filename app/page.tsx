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
import { NewAssistantModal } from '@/components/crm/modals/NewAssistantModal';
import { DiagnosticModal } from '@/components/crm/modals/DiagnosticModal';
import { CorrectionModal } from '@/components/crm/modals/CorrectionModal';
import { PaymentMethodModal } from '@/components/crm/modals/PaymentMethodModal';
import { EmbedModal } from '@/components/crm/modals/EmbedModal';
import { LeadDetailsModal } from '@/components/crm/modals/LeadDetailsModal';
import { AppointmentDetailsModal } from '@/components/crm/modals/AppointmentDetailsModal';
import { NewLandingPageModal } from '@/components/crm/modals/NewLandingPageModal';
import { CounterQrModal } from '@/components/crm/modals/CounterQrModal';
import { OverviewTab } from '@/components/crm/OverviewTab';
import { PlaygroundTab } from '@/components/crm/PlaygroundTab';
import { EngineTab } from '@/components/crm/EngineTab';
import { BehaviorTab } from '@/components/crm/BehaviorTab';
import { LeadsTab } from '@/components/crm/LeadsTab';
import { DocsTab } from '@/components/crm/DocsTab';
import { TemplatesTab } from '@/components/crm/TemplatesTab';
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

  function handleOpenCorrectionModal(source: KnowledgeSource) {
    setCorrectSource(source);
    setIsCorrectModalOpen(true);
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
              <OverviewTab
                activeAssistant={activeAssistant}
                sources={sources}
                totalChunks={totalChunks}
                unansweredQueries={unansweredQueries}
                resolvingQueryId={resolvingQueryId}
                setResolvingQueryId={setResolvingQueryId}
                knowledgeAnswerText={knowledgeAnswerText}
                setKnowledgeAnswerText={setKnowledgeAnswerText}
                isSavingKnowledgeGap={isSavingKnowledgeGap}
                handleResolveUnansweredQuery={handleResolveUnansweredQuery}
                setActiveTab={setActiveTab}
                customEmbedHost={customEmbedHost}
                setCustomEmbedHost={setCustomEmbedHost}
                copiedCode={copiedCode}
                setCopiedCode={setCopiedCode}
              />
            )}

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
              <PlaygroundTab
                activeAssistant={activeAssistant}
                chatMessages={chatMessages}
                setChatMessages={setChatMessages}
                isStreaming={isStreaming}
                streamingStatus={streamingStatus}
                chatEndRef={chatEndRef}
                playgroundAttachment={playgroundAttachment}
                setPlaygroundAttachment={setPlaygroundAttachment}
                playgroundFileInputRef={playgroundFileInputRef}
                handlePlaygroundVoiceToggle={handlePlaygroundVoiceToggle}
                isVoiceListening={isVoiceListening}
                inputQuery={inputQuery}
                setInputQuery={setInputQuery}
                handleSendMessage={handleSendMessage}
                activeCitations={activeCitations}
              />
            )}

            {activeTab === 'engine' && (
              <EngineTab
                formData={formData}
                setFormData={setFormData}
                saveSuccess={saveSuccess}
                saveError={saveError}
                handleSaveSettings={handleSaveSettings}
                isSaving={isSaving}
              />
            )}

            {activeTab === 'behavior' && (
              <BehaviorTab
                formData={formData}
                setFormData={setFormData}
                saveSuccess={saveSuccess}
                saveError={saveError}
                handleSaveSettings={handleSaveSettings}
                isSaving={isSaving}
              />
            )}

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
              <LeadsTab
                leads={leads}
                handleManualSyncLeads={handleManualSyncLeads}
                isSyncingLeads={isSyncingLeads}
                activeAssistant={activeAssistant}
                setSelectedLeadModal={setSelectedLeadModal}
              />
            )}

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
              <DocsTab />
            )}

            {/* TAB: BOT TEMPLATES GALLERY */}
            {activeTab === 'templates' && (
              <TemplatesTab
                templateSuccessMsg={templateSuccessMsg}
                applyingTemplateId={applyingTemplateId}
                handleApplyTemplate={handleApplyTemplate}
              />
            )}

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

        {/* MODALS */}
        <NewAssistantModal
          isOpen={showNewModal}
          onClose={() => setShowNewModal(false)}
          onSubmit={handleCreateAssistant}
          newAssistantName={newAssistantName}
          setNewAssistantName={setNewAssistantName}
        />

        <DiagnosticModal
          failedSource={failedSourceModal}
          onClose={() => setFailedSourceModal(null)}
          onDeleteSource={handleDeleteSource}
        />

        <CorrectionModal
          isOpen={isCorrectModalOpen}
          onClose={() => setIsCorrectModalOpen(false)}
          correctSource={correctSource}
          activeAssistantId={activeAssistant?.id}
          onSuccess={() => {
            if (activeAssistant) fetchKnowledge(activeAssistant.id);
          }}
        />

        <PaymentMethodModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSubmit={handleUpdatePaymentMethod}
          cardBrand={cardBrand}
          setCardBrand={setCardBrand}
          cardLast4={cardLast4}
          setCardLast4={setCardLast4}
          cardExpMonth={cardExpMonth}
          setCardExpMonth={setCardExpMonth}
          cardExpYear={cardExpYear}
          setCardExpYear={setCardExpYear}
          billingEmailInput={billingEmailInput}
          setBillingEmailInput={setBillingEmailInput}
          isUpdatingCard={isUpdatingCard}
        />

        <EmbedModal
          isOpen={showEmbedModal}
          onClose={() => setShowEmbedModal(false)}
          assistantId={activeAssistant?.id}
          customEmbedHost={customEmbedHost}
        />

        <LeadDetailsModal
          lead={selectedLeadModal}
          onClose={() => setSelectedLeadModal(null)}
          assistantName={activeAssistant?.name}
        />

        <AppointmentDetailsModal
          appt={selectedAppointmentModal}
          onClose={() => setSelectedAppointmentModal(null)}
          onStatusChange={handleUpdateAppointmentStatus}
        />

        <NewLandingPageModal
          isOpen={showNewPageModal}
          onClose={() => setShowNewPageModal(false)}
          onSubmit={handleCreateNewLandingPage}
          newPageName={newPageName}
          setNewPageName={setNewPageName}
          newPageSlug={newPageSlug}
          setNewPageSlug={setNewPageSlug}
          newPageIndustry={newPageIndustry}
          setNewPageIndustry={setNewPageIndustry}
        />

        <CounterQrModal
          isOpen={showCounterQrModal}
          onClose={() => setShowCounterQrModal(false)}
          slug={landingConfig.slug}
          assistantId={activeAssistant?.id}
        />

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
      </div>
    </div>
  );
}
