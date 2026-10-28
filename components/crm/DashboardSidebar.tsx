'use client';

import { T, useT } from '@/lib/i18n/context';
import React, { useState, useEffect } from 'react';
import { BrandMark } from '@/components/brand/BrandMark';
import {
  Sparkles,
  Users,
  BarChart3,
  Globe,
  Share2,
  Calendar,
  ChevronDown,
  Upload,
  Cpu,
  Sliders,
  Palette,
  CreditCard,
  UserCheck,
  ShieldCheck,
  Shield,
  ClipboardList,
  UserCircle,
  LifeBuoy,
  HelpCircle,
  FileText,
  FileCheck,
  BookOpen,
  History as HistoryIcon,
  MessageSquare,
  Building,
  SendHorizontal,
  Radio,
  PhoneCall,
  Webhook,
  Mail,
  X,
} from 'lucide-react';
import { INTEGRATIONS_CONFIG, SlackIcon, GoogleSheetsIcon, InstagramIcon, TikTokIcon, type IntegrationId } from './ChannelsTab';

function renderIntegrationIcon(id: IntegrationId) {
  switch (id) {
    case 'slack':
      return <SlackIcon className="h-3.5 w-3.5 shrink-0" />;
    case 'google-sheets':
      return <GoogleSheetsIcon className="h-3.5 w-3.5 shrink-0" />;
    case 'telegram':
      return <SendHorizontal className="h-3.5 w-3.5 text-sky-500 shrink-0" />;
    case 'whatsapp':
      return <Radio className="h-3.5 w-3.5 text-emerald-500 shrink-0" />;
    case 'instagram':
      return <InstagramIcon className="h-3.5 w-3.5 text-pink-500 shrink-0" />;
    case 'tiktok':
      return <TikTokIcon className="h-3.5 w-3.5 text-cyan-500 shrink-0" />;
    case 'phone':
      return <PhoneCall className="h-3.5 w-3.5 text-indigo-500 shrink-0" />;
    case 'webhooks':
      return <Webhook className="h-3.5 w-3.5 text-amber-500 shrink-0" />;
    case 'smtp':
      return <Mail className="h-3.5 w-3.5 text-blue-500 shrink-0" />;
    case 'whitelabel':
      return <Shield className="h-3.5 w-3.5 text-purple-500 shrink-0" />;
    default:
      return <Share2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />;
  }
}


export interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  waitingCount?: number;
}

export interface TabGroup {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: TabItem[];
}

export interface DashboardSidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  selectedIntegration?: IntegrationId;
  setSelectedIntegration?: (id: IntegrationId) => void;
  teamCount?: number;
  auditCount?: number;
  sourcesCount?: number;
  leadsCount?: number;
  appointmentsCount?: number;
  conversationsCount?: number;
  waitingConversationsCount?: number;
  landingPagesCount?: number;
  isMasterAdmin?: boolean;
  isOwner?: boolean;
  onOpenSetup?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const ROW_BASE = 'flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium transition cursor-pointer select-none';
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
  landingPagesCount,
  isMasterAdmin = false,
  isOwner = false,
  onOpenSetup,
  isMobileOpen = false,
  onCloseMobile,
}: DashboardSidebarProps) {
  const __t = useT();
  const canViewAudit = Boolean(isOwner || isMasterAdmin);
  const [isChannelsExpanded, setIsChannelsExpanded] = useState<boolean>(false);
  const [manual, setManual] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isMobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseMobile?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, onCloseMobile]);

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
        { id: 'support', label: 'Support & Tickets', icon: LifeBuoy },
        { id: 'docs', label: 'Documentation', icon: BookOpen },
      ],
    },
    ...(isMasterAdmin
      ? [
          {
            id: 'master',
            title: 'Platform administration',
            icon: Building,
            items: [
              { id: 'customers', label: 'Customers', icon: Users },
              { id: 'access_codes', label: 'Access Codes', icon: Building },
              { id: 'blog_admin', label: 'Blog Posts', icon: FileText },
              { id: 'system_logs', label: 'System Logs', icon: ClipboardList },
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
              if (nextExpanded) {
                setActiveTab('channels');
                onCloseMobile?.();
              }
            }}
            className={`${ROW_BASE} ${isChannelsActive ? ROW_ACTIVE : ROW_IDLE}`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1 mr-1">
              <Share2 className={`h-4 w-4 shrink-0 ${isChannelsActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`} />
              <span className="truncate whitespace-nowrap"><T>{tab.label}</T></span>
            </div>
            <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-200 ${isChannelsExpanded ? 'rotate-0' : '-rotate-90'}`} />
          </button>

          {/* Integrations sub-list */}
          {isChannelsExpanded && (
            <div className="ml-2 pl-2 my-1 border-l-2 border-slate-200 dark:border-slate-800 space-y-0.5 animate-in fade-in duration-150">
              {INTEGRATIONS_CONFIG.filter((item) => item.id !== 'phone').map((item) => {
                const isSelected = isChannelsActive && selectedIntegration === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedIntegration?.(item.id);
                      setActiveTab('channels');
                      onCloseMobile?.();
                    }}
                    className={`w-full flex items-center justify-between rounded-md px-2 py-1 text-xs font-medium transition cursor-pointer ${
                      isSelected ? 'bg-blue-100/70 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold' : ROW_IDLE
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate">
                      {renderIntegrationIcon(item.id)}
                      <span className="truncate whitespace-nowrap">{item.shortName}</span>
                    </div>
                    {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0 ml-1" />}
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
        onClick={() => {
          setActiveTab(tab.id as any);
          onCloseMobile?.();
        }}
        className={`${ROW_BASE} ${isActive ? ROW_ACTIVE : ROW_IDLE}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 mr-1">
          <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`} />
          <span className="truncate whitespace-nowrap"><T>{tab.label}</T></span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {tab.waitingCount && tab.waitingCount > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 text-[10px] font-bold shrink-0 animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
              <span>{tab.waitingCount}</span>
              <span className="hidden sm:inline"><T>waiting</T></span>
            </span>
          ) : null}
          {tab.count !== undefined && (
            <span
              className={`rounded px-1.5 py-0.5 text-[10.5px] font-mono shrink-0 ${
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

  const renderSidebarContent = () => (
    <>
      <nav aria-label={__t("Dashboard")} className="flex flex-col flex-1 min-h-0 gap-1 overflow-y-auto pr-1 overscroll-contain mk-sidebar-scroll">
        {/* The home page of the dashboard: always in view, never inside a category */}
        {renderItem(overview)}

        {groups.map((group) => {
          const GroupIcon = group.icon;
          const holdsActive = group.items.some((i) => i.id === activeTab);
          const open = manual[group.id] ?? holdsActive;
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
                <div className="flex items-center gap-2 min-w-0 flex-1 mr-1">
                  <GroupIcon className={`h-4 w-4 shrink-0 ${holdsActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`} />
                  <span className="truncate whitespace-nowrap text-[12px] font-semibold tracking-tight"><T>{group.title}</T></span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!open && waiting > 0 ? (
                    <span className="rounded-full bg-amber-500 text-slate-950 px-1.5 py-0.2 text-[10px] font-bold animate-pulse">{waiting}</span>
                  ) : null}
                  <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-0' : '-rotate-90'}`} />
                </div>
              </button>
              {open && (
                <div id={regionId} className="ml-2 pl-2 mt-0.5 mb-1 border-l-2 border-slate-200 dark:border-slate-800 space-y-0.5 animate-in fade-in duration-150">
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
            onClick={() => {
              onOpenSetup();
              onCloseMobile?.();
            }}
            className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-semibold cursor-pointer transition"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span><T>Setup guide</T></span>
          </button>
        ) : (
          <span className="text-slate-400 dark:text-slate-500"><T>Crescelo</T></span>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 h-full max-h-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 flex-col justify-between shrink-0 overflow-hidden select-none">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer (visible only when toggled open) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={__t("Navigation Menu")}
            className="relative z-10 w-72 max-w-[85vw] h-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 flex flex-col justify-between shadow-2xl overflow-hidden select-none animate-in slide-in-from-left duration-200"
          >
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <BrandMark size={28} showWord={false} />
                <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white kx-brand-word">Crescelo</span>
              </div>
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition cursor-pointer"
                aria-label={__t("Close navigation")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {renderSidebarContent()}
          </aside>
        </div>
      )}
    </>
  );
}
