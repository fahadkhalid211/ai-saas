'use client';

import React from 'react';
import {
  ShieldCheck,
  AlertCircle,
  Key,
  Users,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react';

interface AdminLoginScreenProps {
  theme: 'light' | 'dark';
  authError: string | null;
  authLoginMode: 'admin' | 'staff';
  setAuthLoginMode: (mode: 'admin' | 'staff') => void;
  setAuthError: (err: string | null) => void;
  authApiKeyInput: string;
  setAuthApiKeyInput: (val: string) => void;
  showAuthPasscode: boolean;
  setShowAuthPasscode: (show: boolean) => void;
  staffEmailInput: string;
  setStaffEmailInput: (val: string) => void;
  staffPasswordInput: string;
  setStaffPasswordInput: (val: string) => void;
  isLoggingIn: boolean;
  handleLogin: (e: React.FormEvent) => void;
}

export function AdminLoginScreen({
  theme,
  authError,
  authLoginMode,
  setAuthLoginMode,
  setAuthError,
  authApiKeyInput,
  setAuthApiKeyInput,
  showAuthPasscode,
  setShowAuthPasscode,
  staffEmailInput,
  setStaffEmailInput,
  staffPasswordInput,
  setStaffPasswordInput,
  isLoggingIn,
  handleLogin,
}: AdminLoginScreenProps) {
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
