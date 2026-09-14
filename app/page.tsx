'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bot, RefreshCw } from 'lucide-react';
import { Appointment } from '@/components/crm/AppointmentsTab';
import { AdminLoginScreen } from '@/components/crm/AdminLoginScreen';
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
import { ChannelsTab } from '@/components/crm/ChannelsTab';
import { ConversationsTab } from '@/components/crm/ConversationsTab';
import { LandingPageTab } from '@/components/crm/LandingPageTab';
import { WidgetTab } from '@/components/crm/WidgetTab';
import { AppointmentsTab } from '@/components/crm/AppointmentsTab';

import { useCrmAssistants } from '@/components/crm/hooks/useCrmAssistants';
import { useCrmBilling } from '@/components/crm/hooks/useCrmBilling';
import { useCrmChannels } from '@/components/crm/hooks/useCrmChannels';
import { useCrmLanding } from '@/components/crm/hooks/useCrmLanding';
import { useCrmTeamSecurity } from '@/components/crm/hooks/useCrmTeamSecurity';
import { useCrmKnowledge } from '@/components/crm/hooks/useCrmKnowledge';
import { useCrmPlayground } from '@/components/crm/hooks/useCrmPlayground';
import { Lead } from '@/types/crm';

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

  const [activeTab, setActiveTab] = useState<
    'overview' | 'analytics' | 'billing' | 'landing_page' | 'team' | 'security' | 'audit' | 'knowledge' | 'engine' | 'behavior' | 'widget' | 'channels' | 'playground' | 'leads' | 'appointments' | 'docs' | 'templates' | 'history'
  >('overview');

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
  const [incomingToast, setIncomingToast] = useState<any | null>(null);
  const lastNotifIdRef = useRef<string | null>(null);

  // Embed State
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [customEmbedHost, setCustomEmbedHost] = useState('');

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
      osc1.frequency.setValueAtTime(587.33, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15);
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
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.3);
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
      teamSecurity.fetch2faStatus();
      teamSecurity.fetchAuditLogs();
      fetchNotifications();
      channels.fetchSmtpSettings();
    }
  }, [activeAssistant?.id]);

  const totalChunks = knowledge.sources.reduce((sum, s) => sum + (s.chunkCount || 0), 0);

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
      <AdminLoginScreen
        theme={theme}
        authError={authError}
        authLoginMode={authLoginMode}
        setAuthLoginMode={setAuthLoginMode}
        setAuthError={setAuthError}
        authApiKeyInput={authApiKeyInput}
        setAuthApiKeyInput={setAuthApiKeyInput}
        showAuthPasscode={showAuthPasscode}
        setShowAuthPasscode={setShowAuthPasscode}
        staffEmailInput={staffEmailInput}
        setStaffEmailInput={setStaffEmailInput}
        staffPasswordInput={staffPasswordInput}
        setStaffPasswordInput={setStaffPasswordInput}
        isLoggingIn={isLoggingIn}
        handleLogin={handleLogin}
      />
    );
  }

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} h-screen w-full flex flex-col font-sans transition-colors duration-150`}>
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
        />

        {/* Main Shell (Sidebar + Content Workspace) */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Left Enterprise Sidebar */}
          <DashboardSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            teamCount={teamSecurity.teamMembers.length}
            auditCount={teamSecurity.auditLogs.length}
            sourcesCount={knowledge.sources.length}
            leadsCount={leads.length}
            appointmentsCount={appointments.length}
            conversationsCount={conversations.length}
          />

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
              />
            )}

            {/* TAB: HOSTED BUSINESS LANDING PAGE */}
            {activeTab === 'landing_page' && (
              <LandingPageTab
                landingConfig={landing.landingConfig}
                setLandingConfig={landing.setLandingConfig}
                isSavingLanding={landing.isSavingLanding}
                saveLandingSuccess={landing.saveLandingSuccess}
                saveLandingError={landing.saveLandingError}
                copiedLandingUrl={landing.copiedLandingUrl}
                setCopiedLandingUrl={landing.setCopiedLandingUrl}
                setShowCounterQrModal={landing.setShowCounterQrModal}
                presetNotice={landing.presetNotice}
                setPresetNotice={landing.setPresetNotice}
                allLandingPages={landing.allLandingPages}
                landingPageLimits={landing.landingPageLimits}
                isPurchasingAddon={landing.isPurchasingAddon}
                addonSuccessMsg={landing.addonSuccessMsg}
                addonErrorMsg={landing.addonErrorMsg}
                setShowNewPageModal={landing.setShowNewPageModal}
                handlePurchaseExtraLandingPage={landing.handlePurchaseExtraLandingPage}
                handleSaveLandingConfig={landing.handleSaveLandingConfig}
                activeAssistant={activeAssistant}
                appointments={appointments}
                theme={theme}
              />
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
            {activeTab === 'audit' && (
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
                fetchKnowledge={knowledge.fetchKnowledge}
                uploadFailureAlert={knowledge.uploadFailureAlert}
                setUploadFailureAlert={knowledge.setUploadFailureAlert}
                handleUploadFiles={knowledge.handleUploadFiles}
                selectedFiles={knowledge.selectedFiles}
                setSelectedFiles={knowledge.setSelectedFiles}
                uploadTextTitle={knowledge.uploadTextTitle}
                setUploadTextTitle={knowledge.setUploadTextTitle}
                uploadText={knowledge.uploadText}
                setUploadText={knowledge.setUploadText}
                isUploading={knowledge.isUploading}
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
                isImportingUrl={knowledge.isImportingUrl}
                urlFeedback={knowledge.urlFeedback}
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
        />

        <CounterQrModal
          isOpen={landing.showCounterQrModal}
          onClose={() => landing.setShowCounterQrModal(false)}
          slug={landing.landingConfig.slug}
          assistantId={activeAssistant?.id}
        />

        {/* Bottom-Left Notification Arrival Toast & Chime Alert */}
        <NotificationToast
          incomingToast={incomingToast}
          setIncomingToast={setIncomingToast}
          setIsNotifOpen={setIsNotifOpen}
        />
      </div>
    </div>
  );
}
