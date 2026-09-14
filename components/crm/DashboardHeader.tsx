'use client';

import React from 'react';
import {
  Bot,
  Plus,
  LayoutTemplate,
  Sun,
  Moon,
  Bell,
  Globe,
  Lock,
} from 'lucide-react';

interface AssistantOption {
  id: string;
  name: string;
  provider?: string;
  [key: string]: any;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read?: boolean;
}

interface DashboardHeaderProps {
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
}

export function DashboardHeader({
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
}: DashboardHeaderProps) {
  return (
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
          className="flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 text-xs font-semibold shadow-xs transition cursor-pointer"
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
  );
}
