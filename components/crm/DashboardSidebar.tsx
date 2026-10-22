'use client';

import { T, useT } from '@/lib/i18n/context';
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

/** A category: a short row in the sidebar that opens to show its pages. */
interface TabGroup {
  id: string;
  title: string;
  icon: any;
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
  onOpenSetup?: () => void;
}

const ROW_BASE = 'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition cursor-pointer select-none';
const ROW_ACTIVE = 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 font-semibold';
const ROW_IDLE = 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200';

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
  isMasterAdmin = false,
  isOwner = false,
  onOpenSetup,
}: DashboardSidebarProps) {
  const __t = useT();
  const canViewAudit = Boolean(isOwner || isMasterAdmin);
  const [isChannelsExpanded, setIsChannelsExpanded] = useState<boolean>(false);
  // What the person opened or closed by hand. A category nobody touched is open only while it holds the page being shown,
  // so the sidebar starts short and follows the person around instead of growing.
  const [manual, setManual] = useState<Record<string, boolean>>({});

  const overview: TabItem = { id: 'overview', label: 'Overview', icon: FileCheck };

  const groups: TabGroup[] = [
    {
      id: 'assistant',
      title: 'Build your assistant',
      icon: Sparkles,
      items: [
        { id: 'knowledge', label: 'My Documents', icon: Upload, count: sourcesCount },
        { id: 'playground', label: 'Try It Out', icon: MessageSquare },
        { id: 'behavior', label: 'Behavior & Rules', icon: Sliders },
        { id: 'engine', label: 'AI Settings', icon: Cpu },
      ],
    },
    {
      id: 'customers',
      title: 'Customers',
      icon: Users,
      items: [
        { id: 'history', label: 'Chat History', icon: HistoryIcon, count: conversationsCount, waitingCount: waitingConversationsCount },
        { id: 'leads', label: 'Leads', icon: Users, count: leadsCount },
        { id: 'appointments', label: 'Appointments', icon: Calendar, count: appointmentsCount },
        { id: 'analytics', label: 'Analytics & KPIs', icon: BarChart3 },
      ],
    },
    {
      id: 'publish',
      title: 'Publish & connect',
      icon: Globe,
      items: [
        { id: 'widget', label: 'Add to My Website', icon: Palette },
        { id: 'channels', label: 'Channels & Integrations', icon: Share2 },
      ],
    },
    {
      id: 'account',
      title: 'Account',
      icon: UserCircle,
      items: [
        { id: 'billing', label: 'Plans & Billing', icon: CreditCard },
        { id: 'team', label: 'Team', icon: UserCheck, count: teamCount },
        { id: 'security', label: 'Security', icon: ShieldCheck },
        ...(canViewAudit ? [{ id: 'audit', label: 'Audit Trail', icon: ClipboardList, count: auditCount }] : []),
        { id: 'profile', label: 'My Profile', icon: UserCircle },
      ],
    },
    {
      id: 'help',
      title: 'Help',
      icon: LifeBuoy,
      items: [
        { id: 'support', label: isMasterAdmin ? 'Support Inbox' : 'Support', icon: LifeBuoy },
        { id: 'docs', label: 'Guides & Docs', icon: BookOpen },
      ],
    },
    // The platform owner's tools (the APIs behind them refuse everyone else with a 404).
    ...(isMasterAdmin
      ? [
          {
            id: 'platform',
            title: 'Platform admin',
            icon: Shield,
            items: [
              { id: 'customers', label: 'Customers', icon: Users },
              { id: 'system_logs', label: 'System Logs', icon: Activity },
              { id: 'blog_admin', label: 'Blog Articles', icon: Newspaper },
              { id: 'access_codes', label: 'Access Codes', icon: Ticket },
            ],
          },
        ]
      : []),
  ];

  const renderItem = (tab: TabItem) => {
    if (tab.id === 'channels') {
      const isChannelsActive = activeTab === 'channels';
      return (
        <div key={tab.id} className="space-y-1">
          <button
            type="button"
            aria-expanded={isChannelsExpanded}
            onClick={() => {
              const nextExpanded = !isChannelsExpanded;
              setIsChannelsExpanded(nextExpanded);
              if (nextExpanded) setActiveTab('channels');
            }}
            className={`${ROW_BASE} ${isChannelsActive ? ROW_ACTIVE : ROW_IDLE}`}
          >
            <div className="flex items-center gap-2.5">
              <Share2 className={`h-4 w-4 ${isChannelsActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`} />
              <span><T>{tab.label}</T></span>
            </div>
            <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${isChannelsExpanded ? 'rotate-0' : '-rotate-90'}`} />
          </button>

          {/* Integrations sub-list */}
          {isChannelsExpanded && (
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
                      isSelected ? 'bg-blue-100/70 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold' : ROW_IDLE
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      {renderIntegrationIcon(item.id)}
                      <span className="truncate">{item.shortName}</span>
                    </div>
                    {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />}
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
        type="button"
        aria-current={isActive ? 'page' : undefined}
        onClick={() => setActiveTab(tab.id as any)}
        className={`${ROW_BASE} ${isActive ? ROW_ACTIVE : ROW_IDLE}`}
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
                isActive ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              {tab.count}
            </span>
          )}
        </div>
      </button>
    );
  };

  return (
    <aside className="w-60 h-full max-h-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 flex flex-col justify-between shrink-0 overflow-hidden select-none">
      <nav aria-label={__t("Dashboard")} className="flex flex-col flex-1 min-h-0 gap-1 overflow-y-auto pr-1 overscroll-contain mk-sidebar-scroll">
        {/* The home page of the dashboard: always in view, never inside a category */}
        {renderItem(overview)}

        {groups.map((group) => {
          const GroupIcon = group.icon;
          const holdsActive = group.items.some((i) => i.id === activeTab);
          const open = manual[group.id] ?? holdsActive;
          // a closed category still shows when something in it needs attention (a customer is waiting for a person)
          const waiting = group.items.reduce((n, i) => n + (i.waitingCount || 0), 0);
          const regionId = `sidebar-group-${group.id}`;
          return (
            <div key={group.id} className="mt-1">
              <button
                type="button"
                aria-expanded={open}
                aria-controls={regionId}
                onClick={() => setManual((m) => ({ ...m, [group.id]: !open }))}
                className={`${ROW_BASE} ${holdsActive && !open ? ROW_ACTIVE : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'}`}
              >
                <div className="flex items-center gap-2.5">
                  <GroupIcon className={`h-4 w-4 ${holdsActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`} />
                  <span><T>{group.title}</T></span>
                </div>
                <div className="flex items-center gap-1.5">
                  {!open && waiting > 0 ? (
                    <span className="rounded-full bg-amber-500 text-slate-950 px-1.5 py-0.2 text-[11px] font-bold animate-pulse">{waiting}</span>
                  ) : null}
                  <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${open ? 'rotate-0' : '-rotate-90'}`} />
                </div>
              </button>
              {open && (
                <div id={regionId} className="ml-3 pl-2 mt-0.5 mb-1 border-l-2 border-slate-200 dark:border-slate-800 space-y-0.5 animate-in fade-in duration-150">
                  {group.items.map(renderItem)}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
        {onOpenSetup ? (
          <button
            type="button"
            onClick={onOpenSetup}
            className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-semibold cursor-pointer transition"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span><T>Setup guide</T></span>
          </button>
        ) : (
          <span className="text-slate-400 dark:text-slate-500"><T>Crescelo</T></span>
        )}
      </div>
    </aside>
  );
}
