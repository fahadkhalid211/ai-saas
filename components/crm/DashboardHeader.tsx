'use client';

import React, { useState, useRef, useEffect } from 'react';
import { BrandMark } from '@/components/brand/BrandMark';
import {
  Bot,
  Plus,
  LayoutTemplate,
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
} from 'lucide-react';

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
  handleDeleteAssistant?: (id: string) => Promise<void> | void;
  currentUser?: any;
  dbStatus?: {
    connected: boolean;
    provider: string;
    isServerless: boolean;
    message?: string;
  } | null;
  onOpenTour?: () => void;
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
  handleDeleteAssistant,
  currentUser,
  dbStatus,
  onOpenTour,
}: DashboardHeaderProps) {
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
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsNotifOpen]);

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shrink-0">
      {/* Left Section: Brand & Assistant Dropdown */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
          <BrandMark size={34} showWord={false} />
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="kx-brand-word">Crescelo</span>
              <span className="text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-1.5 py-0.5 rounded">
                Enterprise
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Business Knowledge Engine</p>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />

        {/* Clean Assistant Switcher Dropdown */}
        <div className="relative" ref={assistantMenuRef}>
          <button
            type="button"
            onClick={() => {
              setIsAssistantMenuOpen(!isAssistantMenuOpen);
              setIsAccountMenuOpen(false);
            }}
            className="flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/70 dark:hover:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 transition shadow-2xs cursor-pointer"
            title="Switch Active AI Assistant"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
            <div className="flex items-center gap-1.5 text-left">
              <span className="text-slate-500 dark:text-slate-400 font-normal hidden lg:inline text-[11px]">Bot:</span>
              <span className="max-w-[130px] sm:max-w-[170px] truncate">{activeAssistant?.name || 'Select Bot'}</span>
            </div>
            <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${isAssistantMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Assistant Dropdown Menu Panel */}
          {isAssistantMenuOpen && (
            <div className="absolute left-0 mt-2 w-72 sm:w-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white">Switch AI Assistant</span>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400">Isolated knowledge base &amp; memory</p>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {assistants.length} bot{assistants.length !== 1 ? 's' : ''}
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
                            <span className="truncate">{ast.name}</span>
                            {isCurrent && <Check className="h-3 w-3 text-blue-600 dark:text-blue-400 shrink-0" />}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                            {ast.provider?.toUpperCase() || 'GEMINI'} · {ast.id}
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
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsAssistantMenuOpen(false);
                    setShowNewModal(true);
                  }}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 hover:bg-blue-100/70 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-xs font-semibold transition cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>New Bot</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAssistantMenuOpen(false);
                    setActiveTab('templates');
                  }}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  <LayoutTemplate className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Templates</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Section: Compact Status, Deploy, Notifications & Account Dropdown */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Consolidated System Status Badge */}
        <div
          className="hidden md:flex items-center gap-2 text-[11px] font-medium bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 px-2.5 py-1.5 rounded-xl text-slate-600 dark:text-slate-300"
          title={`Database: ${dbStatus?.connected ? (dbStatus.provider === 'postgres' ? 'PostgreSQL' : 'Supabase') : 'Ephemeral'} | Engine: ${activeAssistant?.provider?.toUpperCase() || 'GEMINI'}`}
        >
          <span className={`h-2 w-2 rounded-full ${dbStatus?.connected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
          <span>{dbStatus?.connected ? 'Live Cloud' : 'Ephemeral'}</span>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <span className="font-semibold text-blue-600 dark:text-blue-400 font-mono uppercase">
            {activeAssistant?.provider || 'GEMINI'}
          </span>
        </div>

        {/* Tour Guide Button */}
        {onOpenTour && (
          <button
            type="button"
            onClick={onOpenTour}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-2xs transition cursor-pointer"
            title="Product Tour"
          >
            <Compass className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Tour</span>
          </button>
        )}

        {/* Deploy & Embed Widget Button */}
        <button
          type="button"
          onClick={() => setShowEmbedModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
          title="Deploy Chatbot Widget &amp; WordPress Integration"
        >
          <Globe className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Deploy</span>
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
            title="Activity Notifications"
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
                  <span className="font-bold text-xs text-slate-900 dark:text-white">Activity Notifications</span>
                </div>
                {unreadNotifCount > 0 && (
                  <button
                    onClick={handleMarkAllNotificationsRead}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
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

        {/* Clean Account / Profile Dropdown Menu */}
        <div className="relative" ref={accountMenuRef}>
          <button
            type="button"
            onClick={() => {
              setIsAccountMenuOpen(!isAccountMenuOpen);
              setIsAssistantMenuOpen(false);
            }}
            className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white hover:bg-slate-50 dark:bg-slate-800/80 dark:hover:bg-slate-800 transition shadow-2xs cursor-pointer text-left"
            title="Account &amp; System Settings"
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
                    : 'ME'}
                </span>
              )}
            </div>
            <div className="hidden sm:block leading-tight">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[100px]">
                {currentUser?.name || 'My Profile'}
              </div>
              <div className="text-[10px] text-blue-600 dark:text-blue-400 font-medium truncate max-w-[100px]">
                {currentUser?.title || (currentUser?.role === 'owner' ? 'Owner' : 'Admin')}
              </div>
            </div>
            <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform duration-200 ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Account Dropdown Menu Panel */}
          {isAccountMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-1">
              {/* Account Header */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {currentUser?.name || 'Administrator'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {currentUser?.email || 'admin@crescelo.com'}
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[9.5px] font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    {currentUser?.role === 'owner' ? 'Workspace Owner' : 'Team Admin'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {currentUser?.title || 'Lead'}
                  </span>
                </div>
              </div>

              {/* Menu Items */}
              <div className="pt-1 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsAccountMenuOpen(false);
                    setActiveTab('profile');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Profile &amp; Settings</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    toggleTheme();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    {theme === 'light' ? (
                      <Sun className="h-4 w-4 text-amber-500" />
                    ) : (
                      <Moon className="h-4 w-4 text-blue-400" />
                    )}
                    <span>Appearance</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono capitalize">{theme}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsAccountMenuOpen(false);
                    setShowEmbedModal(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <Globe className="h-4 w-4 text-emerald-500" />
                  <span>Deploy &amp; Widget Snippet</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsAccountMenuOpen(false);
                    setActiveTab('team');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <ShieldCheck className="h-4 w-4 text-purple-500" />
                  <span>Team &amp; Access Control</span>
                </button>
              </div>

              {/* Divider & Logout */}
              <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAccountMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                >
                  <Lock className="h-4 w-4 text-red-500" />
                  <span>Lock Session / Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
