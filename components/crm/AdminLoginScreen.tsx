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
  Sparkles,
  Building2,
} from 'lucide-react';

interface AdminLoginScreenProps {
  theme: 'light' | 'dark';
  authError: string | null;
  authLoginMode: 'admin' | 'staff' | 'register';
  setAuthLoginMode: (mode: 'admin' | 'staff' | 'register') => void;
  setAuthError: (err: string | null) => void;
  authApiKeyInput: string;
  setAuthApiKeyInput: (val: string) => void;
  showAuthPasscode: boolean;
  setShowAuthPasscode: (show: boolean) => void;
  staffEmailInput: string;
  setStaffEmailInput: (val: string) => void;
  staffPasswordInput: string;
  setStaffPasswordInput: (val: string) => void;
  regBusinessNameInput: string;
  setRegBusinessNameInput: (val: string) => void;
  regEmailInput: string;
  setRegEmailInput: (val: string) => void;
  regPasswordInput: string;
  setRegPasswordInput: (val: string) => void;
  regTemplateInput: string;
  setRegTemplateInput: (val: string) => void;
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
  regBusinessNameInput,
  setRegBusinessNameInput,
  regEmailInput,
  setRegEmailInput,
  regPasswordInput,
  setRegPasswordInput,
  regTemplateInput,
  setRegTemplateInput,
  isLoggingIn,
  handleLogin,
}: AdminLoginScreenProps) {
  const isSubmitDisabled =
    isLoggingIn ||
    (authLoginMode === 'admin' && !authApiKeyInput.trim()) ||
    (authLoginMode === 'staff' && (!staffEmailInput.trim() || !staffPasswordInput.trim())) ||
    (authLoginMode === 'register' && (!regBusinessNameInput.trim() || !regEmailInput.trim() || !regPasswordInput.trim()));

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} min-h-screen w-full flex items-center justify-center bg-slate-950 font-sans p-4 relative overflow-hidden`}>
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-7 z-10 space-y-5">
        <div className="flex flex-col items-center text-center space-y-1.5">
          <div className="h-12 w-12 rounded-2xl bg-blue-600/10 dark:bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-0.5">
            {authLoginMode === 'register' ? <Building2 className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {authLoginMode === 'register' ? 'Create Business Account' : 'Kortex AI Management'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
            {authLoginMode === 'register'
              ? 'Launch your automated AI customer assistant and hosted landing page in 2 minutes.'
              : 'Sign in to access your business assistant, CRM leads, and live conversations.'}
          </p>
        </div>

        {authError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* 3 Authentication Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setAuthLoginMode('register'); setAuthError(null); }}
            className={`flex-1 py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
              authLoginMode === 'register'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="h-3 w-3" />
            <span>Register</span>
          </button>
          <button
            type="button"
            onClick={() => { setAuthLoginMode('staff'); setAuthError(null); }}
            className={`flex-1 py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
              authLoginMode === 'staff'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="h-3 w-3" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => { setAuthLoginMode('admin'); setAuthError(null); }}
            className={`flex-1 py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
              authLoginMode === 'admin'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Key className="h-3 w-3" />
            <span>Master Key</span>
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-3.5">
          {/* Form 1: Self-Serve SaaS Registration */}
          {authLoginMode === 'register' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Business / Company Name</label>
                <input
                  type="text"
                  value={regBusinessNameInput}
                  onChange={(e) => setRegBusinessNameInput(e.target.value)}
                  placeholder="e.g. Apex Health Clinic"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  autoFocus
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Owner Work Email</label>
                <input
                  type="email"
                  value={regEmailInput}
                  onChange={(e) => setRegEmailInput(e.target.value)}
                  placeholder="owner@company.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Account Password</label>
                <input
                  type="password"
                  value={regPasswordInput}
                  onChange={(e) => setRegPasswordInput(e.target.value)}
                  placeholder="At least 6 characters..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Industry Starter Template</label>
                <select
                  value={regTemplateInput}
                  onChange={(e) => setRegTemplateInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="classic-barbershop">Barbershop & Grooming Salon</option>
                  <option value="fitness-gym">Fitness & Athletics Gym</option>
                  <option value="real-estate">Prestige Living Real Estate</option>
                  <option value="ecommerce-store">LuxeLiving Retail E-Commerce</option>
                  <option value="b2b-saas">CloudScale B2B SaaS</option>
                  <option value="legal-law-firm">Sterling & Vance Legal Counsel</option>
                  <option value="dental-clinic">Beacon Family Dental Clinic</option>
                  <option value="nexus-ai">Nexus AI Technology Platform</option>
                  <option value="hyperion-agency">Hyperion Creative Agency</option>
                  <option value="aether-finance">Aether Finance & Wealth Management</option>
                </select>
              </div>
            </div>
          )}

          {/* Form 2: Master Admin Key Login */}
          {authLoginMode === 'admin' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Master Admin Key / Passcode</span>
                <span className="text-[10px] text-slate-400 font-normal">ADMIN_API_KEY (default: kortex_admin_secret_key_2026)</span>
              </label>
              <div className="relative">
                <input
                  type={showAuthPasscode ? 'text' : 'password'}
                  value={authApiKeyInput}
                  onChange={(e) => setAuthApiKeyInput(e.target.value)}
                  placeholder="Enter ADMIN_API_KEY or kortex_admin_secret_key_2026"
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
          )}

          {/* Form 3: Staff & Tenant Login */}
          {authLoginMode === 'staff' && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Account Email Address</label>
                <input
                  type="email"
                  value={staffEmailInput}
                  onChange={(e) => setStaffEmailInput(e.target.value)}
                  placeholder="owner@company.com or staff@kortexai.com"
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
                  placeholder="Enter password or access code..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoggingIn ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Processing request...</span>
              </>
            ) : (
              <>
                {authLoginMode === 'register' && <Sparkles className="h-3.5 w-3.5" />}
                {authLoginMode === 'admin' && <Key className="h-3.5 w-3.5" />}
                {authLoginMode === 'staff' && <Users className="h-3.5 w-3.5" />}
                <span>
                  {authLoginMode === 'register'
                    ? 'Create Workspace & Launch AI'
                    : authLoginMode === 'admin'
                    ? 'Unlock Management Console'
                    : 'Sign In to Workspace'}
                </span>
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-[11px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800">
          Kortex AI Multi-Tenant SaaS · AES-256 GCM Security
        </div>
      </div>
    </div>
  );
}
