'use client';

import React from 'react';
import {
  FileCheck,
  BarChart3,
  CreditCard,
  Globe,
  UserCheck,
  ShieldCheck,
  ClipboardList,
  Upload,
  MessageSquare,
  Share2,
  Cpu,
  Sliders,
  Palette,
  Users,
  Calendar,
  History as HistoryIcon,
  LayoutTemplate,
  BookOpen,
  UserCircle,
} from 'lucide-react';

interface DashboardSidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  teamCount: number;
  auditCount: number;
  sourcesCount: number;
  leadsCount: number;
  appointmentsCount: number;
  conversationsCount: number;
  waitingConversationsCount?: number;
}

export function DashboardSidebar({
  activeTab,
  setActiveTab,
  teamCount,
  auditCount,
  sourcesCount,
  leadsCount,
  appointmentsCount,
  conversationsCount,
  waitingConversationsCount = 0,
}: DashboardSidebarProps) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileCheck },
    { id: 'profile', label: 'My Profile', icon: UserCircle },
    { id: 'analytics', label: 'Analytics & KPIs', icon: BarChart3 },
    { id: 'billing', label: 'Plans & Billing', icon: CreditCard },
    { id: 'landing_page', label: 'Landing Page', icon: Globe },
    { id: 'team', label: 'Team & RBAC', icon: UserCheck, count: teamCount },
    { id: 'security', label: 'Security & 2FA', icon: ShieldCheck },
    { id: 'audit', label: 'Audit Trail', icon: ClipboardList, count: auditCount },
    { id: 'knowledge', label: 'Knowledge Base', icon: Upload, count: sourcesCount },
    { id: 'playground', label: 'Testing Studio', icon: MessageSquare },
    { id: 'channels', label: 'Channels & Integrations', icon: Share2 },
    { id: 'engine', label: 'AI Engine (BYOK)', icon: Cpu },
    { id: 'behavior', label: 'Behavior & Rules', icon: Sliders },
    { id: 'widget', label: 'Widget & Styling', icon: Palette },
    { id: 'leads', label: 'Captured Leads', icon: Users, count: leadsCount },
    { id: 'appointments', label: 'Appointments', icon: Calendar, count: appointmentsCount },
    { id: 'history', label: 'Chat History', icon: HistoryIcon, count: conversationsCount, waitingCount: waitingConversationsCount },
    { id: 'templates', label: 'Bot Templates', icon: LayoutTemplate },
    { id: 'docs', label: 'Guides & Docs', icon: BookOpen },
  ];

  return (
    <aside className="w-60 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2">
            Management
          </div>
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`} />
                    <span>{tab.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {tab.waitingCount && tab.waitingCount > 0 ? (
                      <span className="rounded-full bg-amber-500 text-white px-1.5 py-0.2 text-[10px] font-bold animate-pulse">
                        {tab.waitingCount} Waiting
                      </span>
                    ) : null}
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
                  </div>
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
  );
}
