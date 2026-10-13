'use client';

import { T } from '@/lib/i18n/context';
import React, { useState } from 'react';
import {
  FileCheck,
  BarChart3,
  CreditCard,
  Globe,
  UserCheck,
  ShieldCheck,
  ClipboardList,
  Activity,
  Newspaper,
  Ticket,
  Upload,
  MessageSquare,
  Share2,
  Cpu,
  Sliders,
  Palette,
  Users,
  Calendar,
  History as HistoryIcon,
  BookOpen,
  UserCircle,
  Compass,
  ChevronDown,
  SendHorizontal,
  Radio,
  PhoneCall,
  Webhook,
  Mail,
  Shield,
  LifeBuoy,
  Sparkles,
} from 'lucide-react';
import {
  IntegrationId,
  INTEGRATIONS_CONFIG,
  SlackIcon,
  GoogleSheetsIcon,
} from '@/components/crm/ChannelsTab';
import { ADVANCED_ONLY_TABS } from '@/lib/ui/simple-mode';

function renderIntegrationIcon(id: IntegrationId | string) {
  switch (id as string) {
    case 'slack':
      return <SlackIcon className="h-3.5 w-3.5 shrink-0" />;
    case 'google-sheets':
      return <GoogleSheetsIcon className="h-3.5 w-3.5 shrink-0" />;
    case 'telegram':
      return <SendHorizontal className="h-3.5 w-3.5 text-sky-500 shrink-0" />;
    case 'whatsapp':
      return <Radio className="h-3.5 w-3.5 text-emerald-500 shrink-0" />;
    case 'phone':
      return <PhoneCall className="h-3.5 w-3.5 text-indigo-500 shrink-0" />;
    case 'webhooks':
      return <Webhook className="h-3.5 w-3.5 text-amber-500 shrink-0" />;
    case 'smtp':
      return <Mail className="h-3.5 w-3.5 text-blue-500 shrink-0" />;
    case 'whitelabel':
      return <Shield className="h-3.5 w-3.5 text-purple-500 shrink-0" />;
    case 'mcp':
      return <Cpu className="h-3.5 w-3.5 text-purple-500 shrink-0" />;
    default:
      return <Share2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />;
  }
}

interface TabItem {
  id: string;
  label: string;
  icon: any;
  count?: number;
  waitingCount?: number;
}

interface TabSection {
  title: string;
  items: TabItem[];
}

interface DashboardSidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  selectedIntegration?: IntegrationId;
  setSelectedIntegration?: (id: IntegrationId) => void;
  teamCount: number;
  auditCount: number;
  sourcesCount: number;
  leadsCount: number;
  appointmentsCount: number;
  conversationsCount: number;
  waitingConversationsCount?: number;
  landingPagesCount?: number;
  isMasterAdmin?: boolean;
  isOwner?: boolean;
  onOpenTour?: () => void;
  onOpenSetup?: () => void;
  /** "Simple view": hides the more technical tabs (lib/ui/simple-mode.ts). Defaults to on for a reason — see there. */
  simpleMode?: boolean;
  onToggleSimpleMode?: () => void;
}

export function DashboardSidebar({
  activeTab,
  setActiveTab,
  selectedIntegration = 'slack',
  setSelectedIntegration,
  teamCount,
  auditCount,
  sourcesCount,
  leadsCount,
  appointmentsCount,
  conversationsCount,
  waitingConversationsCount = 0,
  landingPagesCount,
  isMasterAdmin = false,
  isOwner = false,
  onOpenTour,
  onOpenSetup,
  simpleMode = false,
  onToggleSimpleMode,
}: DashboardSidebarProps) {
  const canViewAudit = Boolean(isOwner || isMasterAdmin);
  const [isChannelsExpanded, setIsChannelsExpanded] = useState<boolean>(false);

  const allSections: TabSection[] = [
    {
      title: 'Get Started',
      items: [
        { id: 'overview', label: 'Overview', icon: FileCheck },
        { id: 'knowledge', label: 'My Documents', icon: Upload, count: sourcesCount },
        { id: 'playground', label: 'Try It Out', icon: MessageSquare },
      ],
    },
    {
      title: 'Grow & Engage',
      items: [
        { id: 'leads', label: 'Leads', icon: Users, count: leadsCount },
        { id: 'appointments', label: 'Appointments', icon: Calendar, count: appointmentsCount },
        {
          id: 'history',
          label: 'Chat History',
          icon: HistoryIcon,
          count: conversationsCount,
          waitingCount: waitingConversationsCount,
        },
        { id: 'analytics', label: 'Analytics & KPIs', icon: BarChart3 },
      ],
    },
    {
      title: 'Customize & Channels',
      items: [
        { id: 'widget', label: 'Add to My Website', icon: Palette },
        { id: 'channels', label: 'Channels & Integrations', icon: Share2 },
        { id: 'behavior', label: 'Behavior & Rules', icon: Sliders },
      ],
    },
    {
      title: 'Settings & Account',
      items: [
        { id: 'engine', label: 'AI Settings', icon: Cpu },
        { id: 'team', label: 'Team', icon: UserCheck, count: teamCount },
        { id: 'billing', label: 'Plans & Billing', icon: CreditCard },
        { id: 'security', label: 'Security', icon: ShieldCheck },
        ...(canViewAudit ? [{ id: 'audit', label: 'Audit Trail', icon: ClipboardList, count: auditCount }] : []),
        // The system log is for the platform owner only (the API refuses everyone else with a 404).
        ...(isMasterAdmin ? [{ id: 'customers', label: 'Customers', icon: Users }] : []),
        ...(isMasterAdmin ? [{ id: 'system_logs', label: 'System Logs', icon: Activity }] : []),
        ...(isMasterAdmin ? [{ id: 'blog_admin', label: 'Blog Articles', icon: Newspaper }] : []),
        ...(isMasterAdmin ? [{ id: 'access_codes', label: 'Access Codes', icon: Ticket }] : []),
        { id: 'support', label: isMasterAdmin ? 'Support Inbox' : 'Support', icon: LifeBuoy },
        { id: 'profile', label: 'My Profile', icon: UserCircle },
        { id: 'docs', label: 'Guides & Docs', icon: BookOpen },
      ],
    },
  ];

  // Simple view hides the tabs a first-time owner never needs and would only find intimidating (lib/ui/simple-mode.ts).
  // Nothing is deleted or disabled by this — turning it off shows every tab again, exactly where it was.
  const sections: TabSection[] = simpleMode
    ? allSections.map((s) => ({ ...s, items: s.items.filter((t) => !ADVANCED_ONLY_TABS.has(t.id)) })).filter((s) => s.items.length > 0)
    : allSections;

  return (
    <aside className="w-60 h-full max-h-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 flex flex-col justify-between shrink-0 overflow-hidden select-none">
      <div className="flex flex-col flex-1 min-h-0 gap-5 overflow-y-auto pr-1 overscroll-contain mk-sidebar-scroll">
        {sections.map((section) => (
          <div key={section.title}>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-3 mb-1.5">
              <T>{section.title}</T>
            </div>
            <nav className="space-y-0.5">
              {section.items.map((tab) => {
                if (tab.id === 'channels') {
                  const isChannelsActive = activeTab === 'channels';
                  const showSubMenu = isChannelsExpanded;
                  return (
                    <div key={tab.id} className="space-y-1">
                      <button
                        type="button"
                        data-tour="nav-channels"
                        onClick={() => {
                          const nextExpanded = !isChannelsExpanded;
                          setIsChannelsExpanded(nextExpanded);
                          if (nextExpanded) {
                            setActiveTab('channels');
                          }
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition cursor-pointer select-none ${
                          isChannelsActive
                            ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Share2 className={`h-4 w-4 ${isChannelsActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`} />
                          <span><T>{tab.label}</T></span>
                        </div>
                        <ChevronDown
                          className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${showSubMenu ? 'rotate-0' : '-rotate-90'}`}
                        />
                      </button>

                      {/* Integrations Sub-List */}
                      {showSubMenu && (
                        <div className="ml-3 pl-2.5 my-1 border-l-2 border-slate-200 dark:border-slate-800 space-y-0.5 animate-in fade-in duration-150">
                          {INTEGRATIONS_CONFIG.filter((item) => item.id !== 'phone').map((item) => {
                            const isSelected = isChannelsActive && selectedIntegration === item.id;
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedIntegration?.(item.id);
                                    setActiveTab('channels');
                                  }}
                                  className={`w-full flex items-center justify-between rounded-md px-2 py-1 text-xs font-medium transition cursor-pointer ${
                                    isSelected
                                      ? 'bg-blue-100/70 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold'
                                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 truncate">
                                    {renderIntegrationIcon(item.id)}
                                    <span className="truncate">{item.shortName}</span>
                                  </div>
                                  {isSelected && (
                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  );
                }

                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    data-tour={`nav-${tab.id}`}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`} />
                      <span><T>{tab.label}</T></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {tab.waitingCount && tab.waitingCount > 0 ? (
                        <span className="rounded-full bg-amber-500 text-slate-950 px-1.5 py-0.2 text-[11px] font-bold animate-pulse">
                          {tab.waitingCount} <T>Waiting</T>
                        </span>
                      ) : null}
                      {tab.count !== undefined && (
                        <span
                          className={`rounded px-1.5 py-0.5 text-xs font-mono ${
                            isActive
                              ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 font-bold'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {tab.count}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        ))}

        {/* Status Compliance Box */}
        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-sm space-y-1.5">
          <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-300">
            <span><T>Assistant status</T></span>
            <span className="text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase"><T>Ready</T></span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
            <T>Your assistant is ready to answer customers.</T>
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
        {onOpenTour ? (
          <div className="flex flex-col gap-1.5">
            {onOpenSetup ? (
              <button
                type="button"
                onClick={onOpenSetup}
                className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-semibold cursor-pointer transition"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span><T>Setup guide</T></span>
              </button>
            ) : null}
            <button
              type="button"
              onClick={onOpenTour}
              className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold cursor-pointer transition"
            >
              <Compass className="h-3.5 w-3.5" />
              <span><T>Guided tour</T></span>
            </button>
          </div>
        ) : (
          <span className="text-slate-400 dark:text-slate-500"><T>Crescelo</T></span>
        )}
        {onToggleSimpleMode ? (
          <button
            type="button"
            onClick={onToggleSimpleMode}
            aria-pressed={simpleMode}
            title={
              simpleMode
                ? "Showing a simple view with the everyday tabs only. Click to see every setting."
                : 'Showing every setting. Click to go back to the simple view.'
            }
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-semibold cursor-pointer transition ${
              simpleMode
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <Sparkles className="h-3 w-3 shrink-0" />
            {simpleMode ? <T>{'Simple view'}</T> : <T>{'Advanced view'}</T>}
          </button>
        ) : null}
      </div>
    </aside>
  );
}
