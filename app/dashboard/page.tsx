'use client';

import { SubscriptionGate } from '@/components/crm/SubscriptionGate';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RefreshCw, Globe } from 'lucide-react';
import '../brand.css';
import { brandFontClasses } from '@/lib/brand-fonts';
import { ErrorModalHost } from '@/components/ui/ErrorModal';
import { CresceloMark } from '@/components/brand/CresceloMark';
import { Appointment } from '@/components/crm/AppointmentsTab';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/crm/DashboardHeader';
import { DashboardSidebar } from '@/components/crm/DashboardSidebar';
import { NotificationToast } from '@/components/crm/NotificationToast';
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
import { ChannelsTab, IntegrationId } from '@/components/crm/ChannelsTab';
import { ConversationsTab } from '@/components/crm/ConversationsTab';
import { WidgetTab } from '@/components/crm/WidgetTab';
import { AppointmentsTab } from '@/components/crm/AppointmentsTab';
import { ProfileTab } from '@/components/crm/ProfileTab';
import { SystemLogsTab } from '@/components/crm/SystemLogsTab';
import { OnboardingWizardModal } from '@/components/crm/onboarding/OnboardingWizardModal';
import { TourGuideModal } from '@/components/crm/tour/TourGuideModal';
import { TOUR_STEPS } from '@/components/crm/tour/tourData';

import { useCrmAssistants } from '@/components/crm/hooks/useCrmAssistants';
import { useCrmBilling } from '@/components/crm/hooks/useCrmBilling';
import { useCrmChannels } from '@/components/crm/hooks/useCrmChannels';
import { useCrmLanding } from '@/components/crm/hooks/useCrmLanding';
import { useCrmTeamSecurity } from '@/components/crm/hooks/useCrmTeamSecurity';
import { useCrmKnowledge } from '@/components/crm/hooks/useCrmKnowledge';
import { useCrmPlayground } from '@/components/crm/hooks/useCrmPlayground';
import { Lead } from '@/types/crm';
import { BILLING_PLANS } from '@/lib/billing/plans';

export default function DashboardPage() {
  const router = useRouter();
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

  const [activeTab, setActiveTab] = useState<
    'overview' | 'profile' | 'analytics' | 'billing' | 'landing_page' | 'team' | 'security' | 'audit' | 'system_logs' | 'knowledge' | 'engine' | 'behavior' | 'widget' | 'channels' | 'playground' | 'leads' | 'appointments' | 'docs' | 'templates' | 'history'
  >('overview');
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationId>('slack');

  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isMasterAdmin, setIsMasterAdmin] = useState<boolean>(false);

  // Assistants Hook
  const {
    assistants,
    setAssistants,
    activeAssistant,
    setActiveAssistant,
    formData,
    setFormData,
    isSaving,
    saveSuccess,
    saveError,
    showNewModal,
    setShowNewModal,
    newAssistantName,
    setNewAssistantName,
    fetchAssistants,
    handleCreateAssistant,
    handleSaveSettings,
    handleDeleteAssistant,
  } = useCrmAssistants();

  // Leads & Appointments
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadModal, setSelectedLeadModal] = useState<Lead | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isSyncingAppointments, setIsSyncingAppointments] = useState(false);
  const [selectedAppointmentModal, setSelectedAppointmentModal] = useState<Appointment | null>(null);
  const [isSyncingLeads, setIsSyncingLeads] = useState(false);

  // Conversation History state
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [targetConversationId, setTargetConversationId] = useState<string | null>(null);

  const handleOpenConversation = (convId?: string) => {
    if (convId) setTargetConversationId(convId);
    setActiveTab('history');
  };

  // Template Marketplace state
  const [applyingTemplateId, setApplyingTemplateId] = useState<string | null>(null);
  const [templateSuccessMsg, setTemplateSuccessMsg] = useState<string | null>(null);

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [analyticsRange, setAnalyticsRange] = useState<number>(30);
  const [analyticsSlugFilter, setAnalyticsSlugFilter] = useState<string>('all');

  // In-App Notifications State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  // Queue of unread notifications waiting to be shown as a toast, one at a
  // time (oldest first). The visible toast is always toastQueue[0].
  const [toastQueue, setToastQueue] = useState<any[]>([]);
  const seenNotifIdsRef = useRef<Set<string>>(new Set());
  const initialFetchDoneRef = useRef(false);

  const dismissFrontToast = useCallback(() => {
    setToastQueue((prev) => prev.slice(1));
  }, []);

  // Embed State
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [customEmbedHost, setCustomEmbedHost] = useState('');

  // Onboarding Wizard — show on first login
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Product Tour
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);

  const handleOpenTour = () => {
    setTourStepIndex(0);
    setIsTourOpen(true);
  };

  const handleTourNext = () => {
    const next = tourStepIndex + 1;
    if (next < TOUR_STEPS.length) {
      const step = TOUR_STEPS[next];
      if (step.tab) setActiveTab(step.tab as any);
      setTourStepIndex(next);
    } else {
      setIsTourOpen(false);
    }
  };

  const handleTourPrev = () => {
    const prev = tourStepIndex - 1;
    if (prev >= 0) {
      const step = TOUR_STEPS[prev];
      if (step.tab) setActiveTab(step.tab as any);
      setTourStepIndex(prev);
    }
  };

  const handleTourGoToStep = (index: number) => {
    const step = TOUR_STEPS[index];
    if (step.tab) setActiveTab(step.tab as any);
    setTourStepIndex(index);
  };

  // Database Connectivity Status
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    provider: 'postgres' | 'supabase' | 'ephemeral';
    isServerless: boolean;
    message?: string;
  } | null>(null);
  const [dismissedDbBanner, setDismissedDbBanner] = useState(false);

  const fetchDbStatus = async () => {
    try {
      const res = await fetch('/api/db-status');
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
      }
    } catch {}
  };

  const playNotificationChime = () => {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      
      // Two-tone alert chime (E5 -> A5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.12);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.3);
      gain2.gain.setValueAtTime(0.18, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.55);
    } catch (err) {
      console.warn('Audio notification error:', err);
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
          if (!initialFetchDoneRef.current) {
            initialFetchDoneRef.current = true;
            list.forEach((n: any) => seenNotifIdsRef.current.add(n.id));

            // On initial load, immediately pop toast for any pending unread urgent escalation from last 10 mins
            const now = Date.now();
            const recentUrgent = list.filter((n: any) => {
              if (n.read) return false;
              if (n.type !== 'chat_escalated') return false;
              const age = now - new Date(n.createdAt).getTime();
              return age < 10 * 60 * 1000;
            });
            if (recentUrgent.length > 0) {
              playNotificationChime();
              setToastQueue((prev) => [...prev, ...recentUrgent.slice().reverse()]);
            }
          } else {
            const freshUnread = list.filter(
              (n: any) => !n.read && !seenNotifIdsRef.current.has(n.id)
            );
            list.forEach((n: any) => seenNotifIdsRef.current.add(n.id));

            if (freshUnread.length > 0) {
              playNotificationChime();
              setToastQueue((prev) => [...prev, ...freshUnread.slice().reverse()]);
              const hasChatActivity = freshUnread.some(
                (n: any) => n.type === 'chat_escalated' || n.type === 'chat_new' || n.type === 'chat_message'
              );
              if (hasChatActivity && activeAssistant?.id) {
                fetchConversations(activeAssistant.id);
              }
            }
          }
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

  // Billing Hook
  const billing = useCrmBilling();

  // Channels Hook
  const channels = useCrmChannels({ playNotificationChime });

  // Landing Page Hook
  const landing = useCrmLanding({
    activeAssistant,
    playNotificationChime,
    fetchBilling: billing.fetchBilling,
    fetchNotifications,
  });

  // Team & Security Hook
  const teamSecurity = useCrmTeamSecurity();

  // Knowledge Hook
  const knowledge = useCrmKnowledge({ activeAssistant });

  // Playground Hook
  const playground = useCrmPlayground({ activeAssistant });

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

  const fetchConversations = async (assistantId: string) => {
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
  };

  const fetchLeads = async (assistantId: string) => {
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
  };

  const fetchAppointments = async (assistantId: string) => {
    try {
      const res = await fetch(`/api/appointments?assistantId=${assistantId}`);
      const data = await res.json();
      if (data.appointments) {
        setAppointments(data.appointments);
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    }
  };

  const handleManualSyncAppointments = async () => {
    if (!activeAssistant) return;
    setIsSyncingAppointments(true);
    await fetchAppointments(activeAssistant.id);
    setTimeout(() => setIsSyncingAppointments(false), 500);
  };

  const handleUpdateAppointmentStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.success && data.appointment) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? data.appointment : a))
        );
        if (selectedAppointmentModal?.id === id) {
          setSelectedAppointmentModal(data.appointment);
        }
      }
    } catch (err) {
      console.error('Failed to update appointment status:', err);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to cancel and delete this appointment?')) return;
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
  };

  const handleManualSyncLeads = async () => {
    if (!activeAssistant) return;
    setIsSyncingLeads(true);
    await fetchLeads(activeAssistant.id);
    setTimeout(() => setIsSyncingLeads(false), 500);
  };

  const handleApplyTemplate = async (templateId: string) => {
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
        await knowledge.fetchKnowledge(data.assistant.id);
        setTimeout(() => setTemplateSuccessMsg(null), 5000);
      }
    } catch (err) {
      console.error('Failed to apply template:', err);
    } finally {
      setApplyingTemplateId(null);
    }
  };

  // Initial auth verification and dashboard bootstrap
  useEffect(() => {
    async function checkAuth() {
      try {
        fetchDbStatus();
        const res = await fetch('/api/auth');
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          setIsMasterAdmin(Boolean(data.isMasterAdmin));
          if (data.member) {
            setCurrentUser(data.member);
          }
          await fetchAssistants();
        } else {
          setIsAuthenticated(false);
          setIsMasterAdmin(false);
          router.replace('/login');
        }
      } catch {
        setIsAuthenticated(false);
        setIsMasterAdmin(false);
        router.replace('/login');
      } finally {
        setIsAuthChecking(false);
      }
    }
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
    } catch {}
    setIsAuthenticated(false);
    setIsMasterAdmin(false);
    router.replace('/login');
  };

  useEffect(() => {
    if (activeAssistant) {
      setFormData(activeAssistant);
      knowledge.fetchKnowledge(activeAssistant.id);
      fetchLeads(activeAssistant.id);
      fetchAppointments(activeAssistant.id);
      knowledge.fetchUnansweredQueries(activeAssistant.id);
      fetchConversations(activeAssistant.id);
      fetchAnalytics(activeAssistant.id);
      billing.fetchBilling();
      landing.fetchLandingConfig(activeAssistant.id);
      landing.fetchAllLandingPages();
      teamSecurity.fetchTeamMembers();
      if (isMasterAdmin) {
        teamSecurity.fetchAuditLogs();
      }
      fetchNotifications();
      channels.fetchSmtpSettings();
    }
  }, [activeAssistant?.id]);

  // 2FA status is only shown on the Security tab, so it is fetched when that tab opens instead of in the dashboard-load burst
  useEffect(() => {
    if (isAuthenticated && activeTab === 'security') teamSecurity.fetch2faStatus();
  }, [isAuthenticated, activeTab]);

  // Background notification check - relaxed to 10s and paused when tab is hidden
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      if (typeof document === 'undefined' || document.visibilityState !== 'hidden') {
        fetchNotifications();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated, activeAssistant?.id]);

  // Auto-sync appointments when Appointments tab is active - relaxed to 15s and paused when tab is hidden
  useEffect(() => {
    if (!isAuthenticated || !activeAssistant?.id || activeTab !== 'appointments') return;
    fetchAppointments(activeAssistant.id);
    const interval = setInterval(() => {
      if (typeof document === 'undefined' || document.visibilityState !== 'hidden') {
        fetchAppointments(activeAssistant.id);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated, activeAssistant?.id, activeTab]);

  // Auto-refresh conversation list when History tab is open - relaxed to 8s and paused when tab is hidden
  useEffect(() => {
    if (!isAuthenticated || !activeAssistant?.id || activeTab !== 'history') return;
    fetchConversations(activeAssistant.id);
    const interval = setInterval(() => {
      if (typeof document === 'undefined' || document.visibilityState !== 'hidden') {
        fetchConversations(activeAssistant.id);
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [isAuthenticated, activeAssistant?.id, activeTab]);

  // Immediate refresh when tab becomes visible again after being hidden
  useEffect(() => {
    if (!isAuthenticated) return;
    const onVisibilityChange = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchNotifications();
        if (activeTab === 'history' && activeAssistant?.id) {
          fetchConversations(activeAssistant.id);
        } else if (activeTab === 'appointments' && activeAssistant?.id) {
          fetchAppointments(activeAssistant.id);
        }
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [isAuthenticated, activeAssistant?.id, activeTab]);

  // Auto-sync landing pages and quota limits immediately when Landing Page tab opens
  useEffect(() => {
    if (!isAuthenticated || activeTab !== 'landing_page') return;
    landing.fetchAllLandingPages();
  }, [isAuthenticated, activeTab]);

  const totalChunks = knowledge.sources.reduce((sum, s) => sum + (s.chunkCount || 0), 0);

  if (isAuthChecking) {
    return (
      <div className={`kx-app ${brandFontClasses} ${theme === 'dark' ? 'dark' : ''} h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 font-sans`}>
        <div className="flex flex-col items-center gap-3">
          <CresceloMark size={72} motion="draw" />
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-600" />
            <span>Verifying workspace session...</span>
          </div>
        </div>
      </div>
    );
  }

  // Signed-out visitors are sent to /login by the session check above; render nothing meanwhile.
  if (!isAuthenticated) return null;

  return (
    <div className={`kx-app ${brandFontClasses} ${theme === 'dark' ? 'dark' : ''} h-screen w-full flex flex-col font-sans transition-colors duration-150`}>
      <div className="flex h-screen w-full flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 overflow-hidden">
        
        {/* Top Enterprise Header */}
        <DashboardHeader
          activeAssistant={activeAssistant}
          assistants={assistants}
          setActiveAssistant={setActiveAssistant}
          setShowNewModal={setShowNewModal}
          setActiveTab={setActiveTab}
          theme={theme}
          toggleTheme={toggleTheme}
          isNotifOpen={isNotifOpen}
          setIsNotifOpen={setIsNotifOpen}
          unreadNotifCount={unreadNotifCount}
          notifications={notifications}
          handleMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          setShowEmbedModal={setShowEmbedModal}
          handleLogout={handleLogout}
          handleDeleteAssistant={handleDeleteAssistant}
          currentUser={currentUser}
          dbStatus={dbStatus}
          onOpenTour={handleOpenTour}
        />

        <SubscriptionGate isMasterAdmin={isMasterAdmin} onLogout={handleLogout} onOpenBilling={() => setActiveTab('billing')} />

        {/* Cloud Persistence Notice Banner */}
        {dbStatus && !dbStatus.connected && dbStatus.isServerless && !dismissedDbBanner && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-900 dark:text-amber-200 px-4 py-2 text-xs font-medium flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-bold uppercase tracking-wider text-[10px] bg-amber-500 text-slate-900 px-1.5 py-0.5 rounded font-mono">
                Storage Warning
              </span>
              <span>
                Cloud database is not connected. Booked appointments and chats are currently in temporary serverless memory and reset across requests. Set <code className="font-mono font-bold">DATABASE_URL</code> or Supabase variables in Vercel to persist permanently.
              </span>
            </div>
            <button
              onClick={() => setDismissedDbBanner(true)}
              className="text-amber-800 dark:text-amber-300 hover:text-amber-950 dark:hover:text-white text-xs font-semibold px-2 py-0.5 cursor-pointer ml-4 shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main Shell (Sidebar + Content Workspace) */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          
          {/* Left Enterprise Sidebar */}
          <DashboardSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            selectedIntegration={selectedIntegration}
            setSelectedIntegration={setSelectedIntegration}
            teamCount={teamSecurity.teamMembers.length}
            auditCount={teamSecurity.auditLogs.length}
            sourcesCount={knowledge.sources.length}
            leadsCount={leads.length}
            appointmentsCount={appointments.length}
            conversationsCount={conversations.length}
            waitingConversationsCount={conversations.filter((c) => c.status === 'waiting_for_agent' && !c.isLiveTakeover).length}
            landingPagesCount={landing.allLandingPages.length}
            isMasterAdmin={isMasterAdmin}
            isOwner={currentUser?.role === 'owner' || isMasterAdmin}
            onOpenTour={handleOpenTour}
          />

          {/* Main Content Workspace */}
          <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6 sm:p-8">

            {/* TAB: USER PROFILE */}
            {activeTab === 'profile' && (
              <ProfileTab
                currentUser={currentUser}
                onProfileUpdated={(updated) => setCurrentUser(updated)}
              />
            )}
            
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
                allLandingPages={landing.allLandingPages}
                setActiveTab={setActiveTab}
                appointments={appointments}
              />
            )}

            {/* TAB: PLANS & BILLING */}
            {activeTab === 'billing' && (
              <BillingTab
                billingData={billing.billingData}
                fetchBilling={billing.fetchBilling}
                isLoadingBilling={billing.isLoadingBilling}
                planChangeMsg={billing.planChangeMsg}
                setPlanChangeMsg={billing.setPlanChangeMsg}
                billingInterval={billing.billingInterval}
                setBillingInterval={billing.setBillingInterval}
                changingPlanId={billing.changingPlanId}
                handleSwitchPlan={billing.handleSwitchPlan}
                setShowPaymentModal={billing.setShowPaymentModal}
                handleDownloadInvoice={billing.handleDownloadInvoice}
                handleOpenCustomerPortal={billing.handleOpenCustomerPortal}
              />
            )}

            {/* TAB: HOSTED BUSINESS LANDING PAGE (Deferred to Next Update & Roadmap) */}
            {activeTab === 'landing_page' && (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-lg mx-auto space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Globe className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Landing Page Studio Moving to Next Update
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Autonomous industry landing pages are currently in active beta polish. Check out the 11 beta archetypes and milestones on our public roadmap.
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('overview')}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    Back to Overview
                  </button>
                  <a
                    href="/roadmap"
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition"
                  >
                    View Roadmap ↗
                  </a>
                </div>
              </div>
            )}

            {/* TAB: MULTI-USER TEAM & RBAC */}
            {activeTab === 'team' && (
              <TeamTab
                teamMembers={teamSecurity.teamMembers}
                teamSuccess={teamSecurity.teamSuccess}
                teamError={teamSecurity.teamError}
                showAddTeamModal={teamSecurity.showAddTeamModal}
                setShowAddTeamModal={teamSecurity.setShowAddTeamModal}
                fetchTeamMembers={teamSecurity.fetchTeamMembers}
                handleUpdateTeamMemberRole={teamSecurity.handleUpdateTeamMemberRole}
                handleDeleteTeamMember={teamSecurity.handleDeleteTeamMember}
                handleAddTeamMember={teamSecurity.handleAddTeamMember}
                newMemberName={teamSecurity.newMemberName}
                setNewMemberName={teamSecurity.setNewMemberName}
                newMemberEmail={teamSecurity.newMemberEmail}
                setNewMemberEmail={teamSecurity.setNewMemberEmail}
                newMemberRole={teamSecurity.newMemberRole}
                setNewMemberRole={teamSecurity.setNewMemberRole}
                isAddingTeamMember={teamSecurity.isAddingTeamMember}
              />
            )}

            {/* TAB: SECURITY & 2FA */}
            {activeTab === 'security' && (
              <SecurityTab
                twoFactorEnabled={teamSecurity.twoFactorEnabled}
                twoFactorSuccess={teamSecurity.twoFactorSuccess}
                twoFactorError={teamSecurity.twoFactorError}
                twoFactorLoading={teamSecurity.twoFactorLoading}
                twoFactorSetupData={teamSecurity.twoFactorSetupData}
                twoFactorCodeInput={teamSecurity.twoFactorCodeInput}
                setTwoFactorCodeInput={teamSecurity.setTwoFactorCodeInput}
                handleDisable2fa={teamSecurity.handleDisable2fa}
                handleStart2faSetup={teamSecurity.handleStart2faSetup}
                handleConfirm2faEnable={teamSecurity.handleConfirm2faEnable}
              />
            )}

            {/* TAB: AUDIT TRAIL */}
            {/* TAB: SYSTEM LOGS (platform owner only) */}
            {activeTab === 'system_logs' && isMasterAdmin && <SystemLogsTab />}

            {activeTab === 'audit' && (currentUser?.role === 'owner' || isMasterAdmin) && (
              <AuditTab
                auditLogs={teamSecurity.auditLogs}
                isSyncingAudit={teamSecurity.isSyncingAudit}
                fetchAuditLogs={teamSecurity.fetchAuditLogs}
              />
            )}

            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <OverviewTab
                activeAssistant={activeAssistant}
                sources={knowledge.sources}
                totalChunks={totalChunks}
                unansweredQueries={knowledge.unansweredQueries}
                resolvingQueryId={knowledge.resolvingQueryId}
                setResolvingQueryId={knowledge.setResolvingQueryId}
                knowledgeAnswerText={knowledge.knowledgeAnswerText}
                setKnowledgeAnswerText={knowledge.setKnowledgeAnswerText}
                isSavingKnowledgeGap={knowledge.isSavingKnowledgeGap}
                handleResolveUnansweredQuery={knowledge.handleResolveUnansweredQuery}
                setActiveTab={setActiveTab}
                customEmbedHost={customEmbedHost}
                setCustomEmbedHost={setCustomEmbedHost}
                copiedCode={copiedCode}
                setCopiedCode={setCopiedCode}
              />
            )}

            {/* TAB: KNOWLEDGE BASE */}
            {activeTab === 'knowledge' && (
              <KnowledgeTab
                activeAssistant={activeAssistant}
                assistants={assistants}
                setActiveAssistant={setActiveAssistant}
                handleDeleteAssistant={handleDeleteAssistant}
                onOpenNewAssistantModal={() => setShowNewModal(true)}
                fetchKnowledge={knowledge.fetchKnowledge}
                isSyncingSources={knowledge.isSyncingSources}
                uploadFailureAlert={knowledge.uploadFailureAlert}
                setUploadFailureAlert={knowledge.setUploadFailureAlert}
                handleUploadFiles={knowledge.handleUploadFiles}
                selectedFiles={knowledge.selectedFiles}
                setSelectedFiles={knowledge.setSelectedFiles}
                fileInputRef={knowledge.fileInputRef}
                resetUploaderFiles={knowledge.resetUploaderFiles}
                storageUsage={knowledge.storageUsage}
                uploadTextTitle={knowledge.uploadTextTitle}
                setUploadTextTitle={knowledge.setUploadTextTitle}
                uploadText={knowledge.uploadText}
                setUploadText={knowledge.setUploadText}
                isUploading={knowledge.isUploading}
                uploadStatusText={knowledge.uploadStatusText}
                handleImportUrl={knowledge.handleImportUrl}
                urlInput={knowledge.urlInput}
                setUrlInput={knowledge.setUrlInput}
                urlCustomTitle={knowledge.urlCustomTitle}
                setUrlCustomTitle={knowledge.setUrlCustomTitle}
                sourceFilter={knowledge.sourceFilter}
                setSourceFilter={knowledge.setSourceFilter}
                sources={knowledge.sources}
                setFailedSourceModal={knowledge.setFailedSourceModal}
                handleOpenCorrectionModal={knowledge.handleOpenCorrectionModal}
                handleDeleteSource={knowledge.handleDeleteSource}
                deleteConfirmSource={knowledge.deleteConfirmSource}
                setDeleteConfirmSource={knowledge.setDeleteConfirmSource}
                isDeletingSource={knowledge.isDeletingSource}
                confirmDeleteSource={knowledge.confirmDeleteSource}
                recentlyDeletedIds={knowledge.recentlyDeletedIds}
                deleteToast={knowledge.deleteToast}
                setDeleteToast={knowledge.setDeleteToast}
                isImportingUrl={knowledge.isImportingUrl}
                urlFeedback={knowledge.urlFeedback}
                reviewDraft={knowledge.reviewDraft}
                setReviewDraft={knowledge.setReviewDraft}
                isExtracting={knowledge.isExtracting}
                extractionStatusText={knowledge.extractionStatusText}
                isSavingDraft={knowledge.isSavingDraft}
                draftSaveSuccess={knowledge.draftSaveSuccess}
                setDraftSaveSuccess={knowledge.setDraftSaveSuccess}
                handleExtractContent={knowledge.handleExtractContent}
                handleSaveReviewDraft={knowledge.handleSaveReviewDraft}
                handleDiscardReviewDraft={knowledge.handleDiscardReviewDraft}
                handleExtractUrl={knowledge.handleExtractUrl}
              />
            )}

            {/* TAB: TESTING STUDIO */}
            {activeTab === 'playground' && (
              <PlaygroundTab
                activeAssistant={activeAssistant}
                chatMessages={playground.chatMessages}
                setChatMessages={playground.setChatMessages}
                isStreaming={playground.isStreaming}
                streamingStatus={playground.streamingStatus}
                chatEndRef={playground.chatEndRef}
                playgroundAttachment={playground.playgroundAttachment}
                setPlaygroundAttachment={playground.setPlaygroundAttachment}
                playgroundFileInputRef={playground.playgroundFileInputRef}
                handlePlaygroundVoiceToggle={playground.handlePlaygroundVoiceToggle}
                isVoiceListening={playground.isVoiceListening}
                inputQuery={playground.inputQuery}
                setInputQuery={playground.setInputQuery}
                handleSendMessage={playground.handleSendMessage}
                activeCitations={playground.activeCitations}
              />
            )}

            {/* TAB: ENGINE */}
            {activeTab === 'engine' && (
              <EngineTab
                formData={formData}
                setFormData={setFormData}
                saveSuccess={saveSuccess}
                saveError={saveError}
                handleSaveSettings={handleSaveSettings}
                isSaving={isSaving}
                activeAssistant={activeAssistant}
              />
            )}

            {/* TAB: BEHAVIOR */}
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

            {/* TAB: WIDGET */}
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

            {/* TAB: CHANNELS */}
            {activeTab === 'channels' && (
              <ChannelsTab
                selectedIntegration={selectedIntegration}
                setSelectedIntegration={setSelectedIntegration}
                activeAssistant={activeAssistant}
                formData={formData}
                setFormData={setFormData}
                handleSaveSettings={handleSaveSettings}
                isSaving={isSaving}
                saveSuccess={saveSuccess}
                saveError={saveError}
                leads={leads}
                smtpConfig={channels.smtpConfig}
                setSmtpConfig={channels.setSmtpConfig}
                smtpLoading={channels.smtpLoading}
                smtpSaveSuccess={channels.smtpSaveSuccess}
                smtpSaveError={channels.smtpSaveError}
                smtpTestEmail={channels.smtpTestEmail}
                setSmtpTestEmail={channels.setSmtpTestEmail}
                smtpTesting={channels.smtpTesting}
                smtpTestResult={channels.smtpTestResult}
                handleSaveSmtpSettings={channels.handleSaveSmtpSettings}
                handleTestEmailSend={channels.handleTestEmailSend}
                isMasterAdmin={isMasterAdmin}
              />
            )}

            {/* TAB: LEADS */}
            {activeTab === 'leads' && (
              <LeadsTab
                leads={leads}
                handleManualSyncLeads={handleManualSyncLeads}
                isSyncingLeads={isSyncingLeads}
                activeAssistant={activeAssistant}
                setSelectedLeadModal={setSelectedLeadModal}
              />
            )}

            {/* TAB: APPOINTMENTS */}
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

            {/* TAB: DOCS */}
            {activeTab === 'docs' && (
              <DocsTab />
            )}

            {/* TAB: TEMPLATES */}
            {activeTab === 'templates' && (
              <TemplatesTab
                templateSuccessMsg={templateSuccessMsg}
                applyingTemplateId={applyingTemplateId}
                handleApplyTemplate={handleApplyTemplate}
                assistants={assistants}
                activeAssistant={activeAssistant}
                allLandingPages={landing.allLandingPages}
                onSaveLandingPage={landing.handleAIGenerateLandingPage}
                onOpenEditor={(cfg) => {
                  landing.setLandingConfig(cfg);
                  landing.setViewMode('editor');
                  setActiveTab('landing_page');
                }}
                onBackToList={() => setActiveTab('landing_page')}
                setActiveTab={(tab: any) => setActiveTab(tab)}
              />
            )}

            {/* TAB: HISTORY */}
            {activeTab === 'history' && (
              <ConversationsTab
                activeAssistant={activeAssistant}
                setActiveTab={setActiveTab}
                conversations={conversations}
                setConversations={setConversations}
                isLoadingConversations={isLoadingConversations}
                fetchConversations={fetchConversations}
                playNotificationChime={playNotificationChime}
                targetConversationId={targetConversationId}
                onClearTargetConversationId={() => setTargetConversationId(null)}
              />
            )}

          </main>
        </div>

        {/* MODALS */}
        {(() => {
          const currentPlan = BILLING_PLANS.find((p) => p.id === billing.billingData?.planId) || BILLING_PLANS[0];
          const botLimit = currentPlan.botLimit;
          const isAtBotQuota = botLimit !== 'Unlimited' && assistants.length >= botLimit;
          return (
            <NewAssistantModal
              isOpen={showNewModal}
              onClose={() => setShowNewModal(false)}
              onSubmit={handleCreateAssistant}
              newAssistantName={newAssistantName}
              setNewAssistantName={setNewAssistantName}
              isAtQuota={isAtBotQuota}
              currentCount={assistants.length}
              botLimit={botLimit}
              planName={currentPlan.name}
              onUpgradePlan={() => {
                setShowNewModal(false);
                setActiveTab('billing');
              }}
            />
          );
        })()}

        <DiagnosticModal
          failedSource={knowledge.failedSourceModal}
          onClose={() => knowledge.setFailedSourceModal(null)}
          onDeleteSource={knowledge.handleDeleteSource}
        />

        <CorrectionModal
          isOpen={knowledge.isCorrectModalOpen}
          onClose={() => knowledge.setIsCorrectModalOpen(false)}
          correctSource={knowledge.correctSource}
          activeAssistantId={activeAssistant?.id}
          onSuccess={() => {
            if (activeAssistant) knowledge.fetchKnowledge(activeAssistant.id);
          }}
        />

        <PaymentMethodModal
          isOpen={billing.showPaymentModal}
          onClose={() => billing.setShowPaymentModal(false)}
          onSubmit={billing.handleUpdatePaymentMethod}
          cardBrand={billing.cardBrand}
          setCardBrand={billing.setCardBrand}
          cardLast4={billing.cardLast4}
          setCardLast4={billing.setCardLast4}
          cardExpMonth={billing.cardExpMonth}
          setCardExpMonth={billing.setCardExpMonth}
          cardExpYear={billing.cardExpYear}
          setCardExpYear={billing.setCardExpYear}
          billingEmailInput={billing.billingEmailInput}
          setBillingEmailInput={billing.setBillingEmailInput}
          isUpdatingCard={billing.isUpdatingCard}
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
          isOpen={landing.showNewPageModal}
          onClose={() => landing.setShowNewPageModal(false)}
          onSubmit={landing.handleCreateNewLandingPage}
          newPageName={landing.newPageName}
          setNewPageName={landing.setNewPageName}
          newPageSlug={landing.newPageSlug}
          setNewPageSlug={landing.setNewPageSlug}
          newPageIndustry={landing.newPageIndustry}
          setNewPageIndustry={landing.setNewPageIndustry}
          assistants={assistants}
          newPageAssistantId={landing.newPageAssistantId}
          setNewPageAssistantId={landing.setNewPageAssistantId}
          existingPagesCount={landing.allLandingPages?.length || 0}
        />

        <CounterQrModal
          isOpen={landing.showCounterQrModal}
          onClose={() => landing.setShowCounterQrModal(false)}
          slug={landing.landingConfig.slug}
          assistantId={activeAssistant?.id}
        />

        {/* Bottom-Left Notification Arrival Toast & Chime Alert */}
        <NotificationToast
          toastQueue={toastQueue}
          onDismiss={dismissFrontToast}
          setIsNotifOpen={setIsNotifOpen}
          setActiveTab={setActiveTab}
          onOpenConversation={handleOpenConversation}
        />

        {/* First-Run Onboarding Wizard */}
        <OnboardingWizardModal
          isOpen={showOnboarding}
          onClose={() => {
            setShowOnboarding(false);
            localStorage.setItem('kortex_onboarding_completed', '1');
          }}
          assistantName={activeAssistant?.name}
          onGoToTab={(tab) => setActiveTab(tab as any)}
          onOpenEmbed={() => setShowEmbedModal(true)}
        />

        {/* Branded error dialog for every failed save */}
        <ErrorModalHost />

        {/* Interactive Product Tour */}
        <TourGuideModal
          isOpen={isTourOpen}
          stepIndex={tourStepIndex}
          onNext={handleTourNext}
          onPrev={handleTourPrev}
          onClose={() => setIsTourOpen(false)}
          onGoToStep={handleTourGoToStep}
        />

      </div>
    </div>
  );
}
