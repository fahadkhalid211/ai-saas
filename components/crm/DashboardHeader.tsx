'use client';

import { T, useT, useI18n } from '@/lib/i18n/context';
import React, { useState, useRef, useEffect } from 'react';
import { Flag } from '@/components/i18n/Flag';
import { SUPPORTED_LOCALES, type SupportedLocale } from '@/lib/i18n/types';
import { BrandMark } from '@/components/brand/BrandMark';
import { FloatingPlatformChatbot } from '@/components/chat/FloatingPlatformChatbot';
import { hasConnectedAiKey } from '@/lib/ai/resolve-provider';
import { useAiKeyHealth } from '@/lib/ai/use-key-health';
import {
  Bot,
  Plus,
  Sun,
  Moon,
  Bell,
  Globe,
  Lock,
  ChevronDown,
  Check,
  Trash2,
  User,
  ShieldCheck,
  Compass,
  Zap,
  CreditCard,
  Languages,
  Accessibility,
  LogOut,
} from 'lucide-react';

/** One row of the profile menu. */
function MenuRow({
  icon,
  label,
  hint,
  onClick,
  tone = 'default',
  trailing,
}: {
  icon: React.ReactNode;
  label: React.ReactNode;
  hint?: React.ReactNode;
  onClick: () => void;
  tone?: 'default' | 'danger';
  trailing?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer text-left ${
        tone === 'danger'
          ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30'
          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      <span className="shrink-0">{icon}</span>
      <span className="flex-1 min-w-0">
        <span className="block truncate">{label}</span>
        {hint ? <span className="block text-[10.5px] font-normal text-slate-400 dark:text-slate-500 truncate">{hint}</span> : null}
      </span>
      {trailing}
    </button>
  );
}

/** A small heading that groups the rows below it. */
function MenuGroup({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="pt-1.5" role="group">
      <div className="px-3 pb-1 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{title}</div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read?: boolean;
  type?: string;
  metadata?: Record<string, any>;
}

interface DashboardHeaderProps {
  onSelectNotification?: (notification: NotificationItem) => void;
  onSelectConversationId?: (convId: string) => void;
  activeAssistant: any;
  assistants: any[];
  setActiveAssistant: (ast: any) => void;
  setShowNewModal: (show: boolean) => void;
  setActiveTab: (tab: any) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isNotifOpen: boolean;
  setIsNotifOpen: (open: boolean) => void;
  unreadNotifCount: number;
  notifications: NotificationItem[];
  handleMarkAllNotificationsRead: () => void;
  setShowEmbedModal: (show: boolean) => void;
  handleLogout: () => void;
  handleDeleteAssistant?: (id: string) => Promise<void> | void;
  currentUser?: any;
  dbStatus?: {
    connected: boolean;
    provider: string;
    isServerless: boolean;
    message?: string;
  } | null;
  onOpenTour?: () => void;
  /** Opens the step-by-step setup wizard again. */
  onOpenSetup?: () => void;
  /** Called after the assistant changed the plan, so billing data can be reloaded. */
  onBillingChanged?: () => void;
}

export function DashboardHeader({
  onSelectNotification,
  onSelectConversationId,
  activeAssistant,
  assistants,
  setActiveAssistant,
  setShowNewModal,
  setActiveTab,
  theme,
  toggleTheme,
  isNotifOpen,
  setIsNotifOpen,
  unreadNotifCount,
  notifications,
  handleMarkAllNotificationsRead,
  setShowEmbedModal,
  handleLogout,
  handleDeleteAssistant,
  currentUser,
  dbStatus,
  onOpenTour,
  onOpenSetup,
  onBillingChanged,
}: DashboardHeaderProps) {
  const __t = useT();
  const { locale, setLocale } = useI18n();
  const [isLanguageListOpen, setIsLanguageListOpen] = useState(false);
  // Whether the key really works, kept current (checked with the provider every minute or so, and the moment a customer's chat is refused)
  const { health: keyHealth } = useAiKeyHealth(activeAssistant?.id, activeAssistant?.keyHealth);
  const [isAssistantMenuOpen, setIsAssistantMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  const assistantMenuRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (assistantMenuRef.current && !assistantMenuRef.current.contains(event.target as Node)) {
        setIsAssistantMenuOpen(false);
      }
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
        setIsLanguageListOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsNotifOpen]);

  const handleNotificationClick = (n: NotificationItem) => {
    if (!n.read) {
      fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_read', id: n.id }),
      }).catch(() => undefined);
      n.read = true;
    }

    if (onSelectNotification) {
      onSelectNotification(n);
      setIsNotifOpen(false);
      return;
    }

    const type = n.type || '';
    const meta = (n as any).metadata || {};

    if (type.startsWith('chat_') || meta.conversationId || /chat|message|visitor/i.test(n.title + ' ' + n.message)) {
      if (meta.conversationId && onSelectConversationId) {
        onSelectConversationId(meta.conversationId);
      }
      setActiveTab('history');
    } else if (type.startsWith('appointment_') || /appointment|booking|schedule/i.test(n.title + ' ' + n.message)) {
      setActiveTab('appointments');
    } else if (type.startsWith('lead_') || /lead|contact/i.test(n.title + ' ' + n.message)) {
      setActiveTab('leads');
    } else if (type.includes('cost_cap') || /spending|engine|cost/i.test(n.title + ' ' + n.message)) {
      setActiveTab('engine');
    } else if (type.includes('security') || type.includes('2fa') || /security|auth|login/i.test(n.title + ' ' + n.message)) {
      setActiveTab('security');
    } else if (type.includes('knowledge') || /source|scrape|document/i.test(n.title + ' ' + n.message)) {
      setActiveTab('knowledge');
    } else if (type.includes('channel') || /whatsapp|telegram/i.test(n.title + ' ' + n.message)) {
      setActiveTab('channels');
    } else {
      setActiveTab('overview');
    }

    setIsNotifOpen(false);
  };


  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-40 shrink-0 gap-2">
      {/* Left Section: Brand & Assistant Dropdown */}
      <div className="flex items-center gap-2 sm:gap-6 min-w-0">
        {/* Brand Logo */}
        <button type="button" className="flex items-center gap-3 cursor-pointer text-left rounded-lg" aria-label={__t("Crescelo overview")} onClick={() => setActiveTab('overview')}>
          <BrandMark size={34} showWord={false} />
          <span className="hidden sm:block kx-brand-word"><T>Crescelo</T></span>
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />

        {/* Clean Assistant Switcher Dropdown */}
        <div className="relative" ref={assistantMenuRef}>
          <button
            type="button"
            data-tour="header-bot"
            onClick={() => {
              setIsAssistantMenuOpen(!isAssistantMenuOpen);
              setIsAccountMenuOpen(false);
            }}
            className="flex items-center gap-2 sm:gap-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/70 dark:hover:bg-slate-800 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 transition shadow-2xs cursor-pointer"
            title={__t("Switch Active AI Assistant")}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
            <div className="flex items-center gap-1.5 text-left">
              <span className="text-slate-500 dark:text-slate-400 font-normal hidden lg:inline text-[11px]"><T>Bot:</T></span>
              <span className="max-w-[56px] min-[420px]:max-w-[110px] sm:max-w-[170px] truncate">{activeAssistant?.name || <T>{'Select Bot'}</T>}</span>
            </div>
            <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${isAssistantMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Assistant Dropdown Menu Panel */}
          {isAssistantMenuOpen && (
            <div className="absolute left-0 mt-2 w-72 sm:w-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white"><T>Switch AI Assistant</T></span>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400"><T>Isolated knowledge base &amp; memory</T></p>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {assistants.length} <T>bot</T>{assistants.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Bot List */}
              <div className="max-h-60 overflow-y-auto p-1 space-y-1">
                {assistants.map((ast) => {
                  const isCurrent = activeAssistant?.id === ast.id;
                  return (
                    <div
                      key={ast.id}
                      className={`group flex items-center justify-between gap-2 p-2 rounded-xl text-xs transition cursor-pointer ${
                        isCurrent
                          ? 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-semibold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                      }`}
                      onClick={() => {
                        setActiveAssistant(ast);
                        setIsAssistantMenuOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className={`p-1.5 rounded-lg shrink-0 ${isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                          <Bot className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate"><T>{ast.name}</T></span>
                            {isCurrent && <Check className="h-3 w-3 text-blue-600 dark:text-blue-400 shrink-0" />}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                            {ast.provider?.toUpperCase() || <T>{'GEMINI'}</T>} · {ast.id}
                          </div>
                        </div>
                      </div>

                      {/* Bot Removal Option */}
                      {assistants.length > 1 && handleDeleteAssistant && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAssistant(ast.id);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition opacity-80 group-hover:opacity-100 cursor-pointer"
                          title={`Delete ${ast.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Dropdown Bottom Actions */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAssistantMenuOpen(false);
                    setShowNewModal(true);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 hover:bg-blue-100/70 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-xs font-semibold transition cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span><T>New Bot</T></span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Section: AI status, the Crescelo assistant, Deploy, notifications and the profile menu (everything else lives in the profile menu) */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Status badge. "Live" only while the key is saved AND the provider accepts it; a rejected key, a provider that cannot be reached and a
            missing key each have their own state, and a click on any of them goes to the AI settings. */}
        {(() => {
          const hasKey = hasConnectedAiKey(activeAssistant);
          const engine = activeAssistant?.provider?.toUpperCase() || 'GROQ';
          const database = dbStatus?.connected ? (dbStatus.provider === 'postgres' ? 'PostgreSQL' : 'Supabase') : 'Ephemeral';
          type Mode = 'offline' | 'rejected' | 'issue' | 'checking' | 'live';
          const mode: Mode = !hasKey || keyHealth?.state === 'missing'
            ? 'offline'
            : keyHealth?.state === 'invalid'
              ? 'rejected'
              : keyHealth?.state === 'unreachable'
                ? 'issue'
                : keyHealth?.state === 'valid'
                  ? 'live'
                  : 'checking';
          const reason = keyHealth?.message ? ` ${keyHealth.message}` : '';
          const titles: Record<Mode, string> = {
            live: `${__t('AI engine connected and verified')}: ${engine} | ${__t('Database')}: ${database}`,
            checking: `${__t('Checking the AI connection…')} | ${__t('Database')}: ${database}`,
            issue: `${__t('The AI provider could not be reached right now. Your key may be fine; this is checked again every minute.')}${reason} | ${__t('Database')}: ${database}`,
            rejected: `${__t('The AI provider rejected your key, so the assistant cannot answer. Open AI Settings to fix it.')}${reason} | ${__t('Database')}: ${database}`,
            offline: `${__t('No AI engine is connected, so the assistant cannot answer. Add an API key in AI Settings.')} | ${__t('Database')}: ${database}`,
          };
          const title = titles[mode];
          const dot = { live: 'bg-emerald-500', checking: 'bg-slate-400 animate-pulse', issue: 'bg-amber-500', rejected: 'bg-rose-500', offline: 'bg-rose-500' }[mode];
          const word = { live: 'Live', checking: 'Checking…', issue: 'Connection issue', rejected: 'Key rejected', offline: 'Offline' }[mode];
          const wordClass = mode === 'rejected' || mode === 'offline'
            ? 'font-semibold text-rose-700 dark:text-rose-300'
            : mode === 'issue'
              ? 'font-semibold text-amber-700 dark:text-amber-300'
              : '';
          const body = (
            <>
              <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden="true" />
              <span className={wordClass}><T>{word}</T></span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              {mode === 'offline' ? (
                <span className="text-slate-500 dark:text-slate-400"><T>{'No AI connected'}</T></span>
              ) : (
                <span className="font-semibold text-blue-600 dark:text-blue-400 font-mono uppercase">{engine}</span>
              )}
            </>
          );
          const base = 'hidden md:flex items-center gap-2 whitespace-nowrap text-[11px] font-medium border px-2.5 py-1.5 rounded-xl';
          if (mode === 'live' || mode === 'checking') {
            return (
              <div className={`${base} bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300`} title={title} data-ai-status={mode} role="status">
                {body}
              </div>
            );
          }
          const tone = mode === 'issue'
            ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 hover:bg-amber-100/70 dark:hover:bg-amber-950/50'
            : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 hover:bg-rose-100/70 dark:hover:bg-rose-950/50';
          return (
            <button
              type="button"
              onClick={() => setActiveTab('engine')}
              title={title}
              aria-label={title}
              data-ai-status={mode}
              className={`${base} ${tone} text-slate-600 dark:text-slate-300 cursor-pointer transition`}
            >
              {body}
            </button>
          );
        })()}

        {/* Crescelo assistant: drops the chat down from here; stays mounted so the conversation survives minimizing */}
        <FloatingPlatformChatbot variant="header" onNavigate={(tab) => setActiveTab(tab)} onBillingChanged={onBillingChanged} />

        {/* Deploy & Embed Widget Button */}
        <button
          type="button"
          data-tour="header-deploy"
          onClick={() => setShowEmbedModal(true)}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
          title={__t("Deploy Chatbot Widget &amp; WordPress Integration")}
        >
          <Globe className="h-3.5 w-3.5" />
          <span><T>Deploy</T></span>
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={notifMenuRef}>
          <button
            type="button"
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsAssistantMenuOpen(false);
              setIsAccountMenuOpen(false);
            }}
            className="relative flex items-center justify-center p-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white hover:bg-slate-50 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition shadow-2xs cursor-pointer"
            title={__t("Activity Notifications")}
          >
            <Bell className="h-4 w-4" />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
              </span>
            )}
          </button>

          {/* Notifications Popover */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-4 z-50 space-y-3 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-blue-600" />
                  <span className="font-bold text-xs text-slate-900 dark:text-white"><T>Activity Notifications</T></span>
                </div>
                {unreadNotifCount > 0 && (
                  <button
                    onClick={handleMarkAllNotificationsRead}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                  >
                    <T>Mark all read</T>
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-slate-400"><T>No activity yet</T></div>
                ) : (
                  notifications.map((n) => {
                    const isCostCap = n.type === 'cost_cap_warning' || n.type === 'cost_cap_reached';
                    return (
                    <div
                      key={n.id}
                      className={`py-2.5 px-2 rounded-xl flex gap-2.5 cursor-pointer transition ${
                        !n.read ? 'bg-blue-50/70 dark:bg-blue-950/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                      onClick={() => handleNotificationClick(n)}
                      title={__t("Click to view related section")}
                    >
                      <div className="mt-0.5">
                        <span
                          className={`h-2 w-2 rounded-full inline-block ${
                            n.type === 'cost_cap_reached' ? 'bg-rose-500' : n.type === 'cost_cap_warning' ? 'bg-amber-500' : 'bg-blue-600'
                          }`}
                        />
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs"><T>{n.title}</T></div>
                        <div className="text-slate-500 text-[11px] leading-relaxed"><T>{n.message}</T></div>
                        <div className="text-[10px] text-slate-400 font-mono">{new Date(n.createdAt).toLocaleTimeString()}</div>
                      </div>
                    </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Clean Account / Profile Dropdown Menu */}
        <div className="relative" ref={accountMenuRef}>
          <button
            type="button"
            onClick={() => {
              setIsAccountMenuOpen(!isAccountMenuOpen);
              setIsLanguageListOpen(false);
              setIsAssistantMenuOpen(false);
            }}
            aria-haspopup="menu"
            aria-expanded={isAccountMenuOpen}
            className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white hover:bg-slate-50 dark:bg-slate-800/80 dark:hover:bg-slate-800 transition shadow-2xs cursor-pointer text-left"
            title={__t("Account &amp; System Settings")}
          >
            <div className="h-7 w-7 rounded-lg bg-blue-600 overflow-hidden flex items-center justify-center text-white text-[10.5px] font-bold shrink-0">
              {currentUser?.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  referrerPolicy="no-referrer"
                  alt={currentUser.name || 'User Profile'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>
                  {currentUser?.name
                    ? currentUser.name.slice(0, 2).toUpperCase()
                    : <T>{'ME'}</T>}
                </span>
              )}
            </div>
            <div className="hidden sm:block leading-tight">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[100px]">
                {currentUser?.name || <T>{'My Profile'}</T>}
              </div>
              <div className="text-[10px] text-blue-600 dark:text-blue-400 font-medium truncate max-w-[100px]">
                {currentUser?.title || (currentUser?.role === 'owner' ? <T>{'Owner'}</T> : <T>{'Admin'}</T>)}
              </div>
            </div>
            <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform duration-200 ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Account Dropdown Menu Panel: grouped by what it is for */}
          {isAccountMenuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] max-h-[calc(100vh-5rem)] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
            >
              {/* Who is signed in */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {currentUser?.name || <T>{'Administrator'}</T>}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {currentUser?.email || <T>{'admin@crescelo.com'}</T>}
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[9.5px] font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    {currentUser?.role === 'owner' ? <T>{'Workspace Owner'}</T> : <T>{'Team Admin'}</T>}
                  </span>
                  {currentUser?.title ? <span className="text-[10px] text-slate-400 font-mono">{currentUser.title}</span> : null}
                </div>
              </div>

              <MenuGroup title={<T>Account</T>}>
                <MenuRow
                  icon={<User className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                  label={<T>Profile &amp; Settings</T>}
                  onClick={() => {
                    setIsAccountMenuOpen(false);
                    setActiveTab('profile');
                  }}
                />
                <MenuRow
                  icon={<CreditCard className="h-4 w-4 text-emerald-500" />}
                  label={<T>Plans &amp; Billing</T>}
                  onClick={() => {
                    setIsAccountMenuOpen(false);
                    setActiveTab('billing');
                  }}
                />
                <MenuRow
                  icon={<ShieldCheck className="h-4 w-4 text-purple-500" />}
                  label={<T>Team &amp; Access Control</T>}
                  onClick={() => {
                    setIsAccountMenuOpen(false);
                    setActiveTab('team');
                  }}
                />
              </MenuGroup>

              {/* On a phone the Deploy button has no room in the bar, so it is offered here */}
              <div className="sm:hidden">
                <MenuGroup title={<T>Publish</T>}>
                  <MenuRow
                    icon={<Globe className="h-4 w-4 text-emerald-500" />}
                    label={<T>Deploy &amp; Widget Snippet</T>}
                    onClick={() => {
                      setIsAccountMenuOpen(false);
                      setShowEmbedModal(true);
                    }}
                  />
                </MenuGroup>
              </div>

              {(onOpenSetup || onOpenTour) && (
                <MenuGroup title={<T>Get started &amp; help</T>}>
                  {onOpenSetup && (
                    <MenuRow
                      icon={<Zap className="h-4 w-4 text-amber-500" />}
                      label={<T>Setup Wizard</T>}
                      hint={<T>Step-by-step guided setup</T>}
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        onOpenSetup();
                      }}
                    />
                  )}
                  {onOpenTour && (
                    <MenuRow
                      icon={<Compass className="h-4 w-4 text-sky-500" />}
                      label={<T>Product Tour</T>}
                      hint={<T>A quick look around the dashboard</T>}
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        onOpenTour();
                      }}
                    />
                  )}
                </MenuGroup>
              )}

              <MenuGroup title={<T>Preferences</T>}>
                <MenuRow
                  icon={theme === 'light' ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-blue-400" />}
                  label={<T>Appearance</T>}
                  onClick={() => toggleTheme()}
                  trailing={<span className="text-[11px] text-slate-400 font-mono capitalize">{theme}</span>}
                />
                <MenuRow
                  icon={<Languages className="h-4 w-4 text-indigo-500" />}
                  label={<T>Language</T>}
                  onClick={() => setIsLanguageListOpen((open) => !open)}
                  trailing={
                    <span className="flex items-center gap-1.5">
                      <Flag locale={locale} size={18} />
                      <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform duration-200 ${isLanguageListOpen ? 'rotate-180' : ''}`} />
                    </span>
                  }
                />
                {isLanguageListOpen && (
                  <div className="ml-3 pl-2 border-l border-slate-200 dark:border-slate-700 space-y-0.5" data-tour="header-language">
                    {(Object.keys(SUPPORTED_LOCALES) as SupportedLocale[]).map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        role="menuitemradio"
                        aria-checked={locale === loc}
                        onClick={() => {
                          setLocale(loc, true);
                          setIsLanguageListOpen(false);
                          setIsAccountMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                          locale === loc
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Flag locale={loc} size={18} />
                          <span>{SUPPORTED_LOCALES[loc].nativeLabel}</span>
                        </span>
                        {locale === loc && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
                      </button>
                    ))}
                  </div>
                )}
                <MenuRow
                  icon={<Accessibility className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                  label={<T>Accessibility</T>}
                  hint={<T>Read aloud, text size and colours</T>}
                  onClick={() => {
                    setIsAccountMenuOpen(false);
                    window.dispatchEvent(new CustomEvent('crescelo:toggle-a11y'));
                  }}
                />
              </MenuGroup>

              {/* Sign out */}
              <div className="mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                <MenuRow
                  tone="danger"
                  icon={<LogOut className="h-4 w-4 text-red-500" />}
                  label={<T>Lock Session / Sign Out</T>}
                  onClick={() => {
                    setIsAccountMenuOpen(false);
                    handleLogout();
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
