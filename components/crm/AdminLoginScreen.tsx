'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertCircle,
  Users,
  RefreshCw,
  Sparkles,
  Building2,
  KeyRound,
  Lock,
  ArrowRight,
  Globe,
} from 'lucide-react';
import { EMAIL_REGEX } from '@/lib/security/validation';
import Link from 'next/link';
import { brandFontClasses } from '@/lib/brand-fonts';

const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

const AppleIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 170 170" className={className} fill="currentColor">
    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.7-7.9-12.04-14.47-6.26-9.48-11.26-20.49-15.01-33.02-3.75-12.53-5.63-24.16-5.63-34.9 0-13.41 3.44-24.47 10.33-33.19 6.89-8.72 15.35-13.15 25.38-13.3 4.89 0 10.38 1.34 16.48 4.02 6.1 2.68 10.05 4.09 11.85 4.23 2.18-.36 6.35-1.84 12.51-4.44 6.16-2.6 11.45-3.81 15.86-3.63 12.05.68 21.6 4.75 28.66 12.22-10.59 6.42-15.77 15.24-15.54 26.47.23 8.79 3.63 16.15 10.21 22.08 6.58 5.93 14.38 9.38 23.41 10.35-2.18 6.53-4.89 13.06-8.13 19.59zM119.22 31.84c0-7.39 2.66-14.42 7.98-21.09 5.32-6.67 11.96-10.75 19.92-12.25.23 1.15.34 2.12.34 2.92 0 7.39-2.8 14.53-8.41 21.42-5.61 6.89-12.44 10.87-20.49 11.94-.23-1.15-.34-2.12-.34-2.94z" />
  </svg>
);

interface AdminLoginScreenProps {
  theme: 'light' | 'dark';
  authError: string | null;
  authLoginMode: 'staff' | 'register';
  setAuthLoginMode: (mode: 'staff' | 'register') => void;
  setAuthError: (err: string | null) => void;
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
  handleGoogleLogin?: () => void;
  handleAppleLogin?: () => void;
  handleSSOLogin?: (domainOrEmail: string) => void;
  onBackToHome?: () => void;
}

export function AdminLoginScreen({
  theme,
  authError,
  authLoginMode,
  setAuthLoginMode,
  setAuthError,
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
  handleGoogleLogin,
  handleAppleLogin,
  handleSSOLogin,
  onBackToHome,
}: AdminLoginScreenProps) {
  const [showSsoPrompt, setShowSsoPrompt] = useState(false);
  const [ssoInput, setSsoInput] = useState('');

  const isRegEmailValid = !regEmailInput || EMAIL_REGEX.test(regEmailInput.trim());
  const isRegPasswordValid = !regPasswordInput || regPasswordInput.trim().length >= 6;
  const isRegBusinessNameValid = !regBusinessNameInput || regBusinessNameInput.trim().length >= 2;
  const isStaffEmailValid = !staffEmailInput || EMAIL_REGEX.test(staffEmailInput.trim());

  const isSubmitDisabled =
    isLoggingIn ||
    (authLoginMode === 'staff' && (!staffEmailInput.trim() || !staffPasswordInput.trim() || !isStaffEmailValid)) ||
    (authLoginMode === 'register' && (
      !regBusinessNameInput.trim() ||
      !isRegBusinessNameValid ||
      !regEmailInput.trim() ||
      !isRegEmailValid ||
      !regPasswordInput.trim() ||
      !isRegPasswordValid
    ));

  return (
    <div className={`kx-app ${brandFontClasses} ${theme === 'dark' ? 'dark' : ''} min-h-screen w-full flex items-center justify-center bg-slate-950 font-sans p-4 relative overflow-hidden`}>
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-7 z-10 space-y-5">
        <div className="flex items-center justify-between w-full mb-1">
          <Link
            href="/"
            className="text-xs font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 transition"
          >
            <span>&larr; View our website</span>
          </Link>
          {onBackToHome && (
            <button
              type="button"
              onClick={onBackToHome}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
            >
              <span>Back</span>
            </button>
          )}
        </div>
        <div className="flex flex-col items-center text-center space-y-1.5">
          <div className="h-12 w-12 rounded-2xl bg-blue-600/10 dark:bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-0.5">
            {authLoginMode === 'register' ? <Building2 className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {authLoginMode === 'register' ? 'Create Business Account' : 'Crescelo Management'}
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

        {/* Social & SSO Quick-Auth Actions */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs flex items-center justify-center gap-2.5 transition disabled:opacity-50 cursor-pointer"
          >
            <GoogleIcon className="h-4 w-4 shrink-0" />
            <span>Continue with Google</span>
          </button>

          {/* SSO button temporarily hidden per user request */}

          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full"></div>
            <span className="bg-white dark:bg-slate-900 px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
              or continue with email
            </span>
          </div>
        </div>

        {/* Register / sign-in tabs */}
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
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${
                    !isRegBusinessNameValid
                      ? 'border-rose-400 dark:border-rose-600 focus:ring-rose-500'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'
                  } bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 transition`}
                  autoFocus
                  required
                />
                {!isRegBusinessNameValid && (
                  <p className="text-[10.5px] text-rose-500 font-medium">Business name must be at least 2 characters.</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Owner Work Email</label>
                <input
                  type="email"
                  value={regEmailInput}
                  onChange={(e) => setRegEmailInput(e.target.value)}
                  placeholder="owner@company.com"
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${
                    !isRegEmailValid
                      ? 'border-rose-400 dark:border-rose-600 focus:ring-rose-500'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'
                  } bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 transition`}
                  required
                />
                {!isRegEmailValid && (
                  <p className="text-[10.5px] text-rose-500 font-medium">Please enter a valid email address.</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Account Password</label>
                <input
                  type="password"
                  value={regPasswordInput}
                  onChange={(e) => setRegPasswordInput(e.target.value)}
                  placeholder="At least 6 characters..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${
                    !isRegPasswordValid
                      ? 'border-rose-400 dark:border-rose-600 focus:ring-rose-500'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'
                  } bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 transition`}
                  required
                />
                {!isRegPasswordValid && (
                  <p className="text-[10.5px] text-rose-500 font-medium">Password must be at least 6 characters.</p>
                )}
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
                  placeholder="owner@company.com or staff@crescelo.com"
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${
                    !isStaffEmailValid
                      ? 'border-rose-400 dark:border-rose-600 focus:ring-rose-500'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'
                  } bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 transition`}
                  autoFocus
                  required
                />
                {!isStaffEmailValid && (
                  <p className="text-[10.5px] text-rose-500 font-medium">Please enter a valid email address.</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Password or Access Code</span>
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
                {authLoginMode === 'staff' && <Users className="h-3.5 w-3.5" />}
                <span>
                  {authLoginMode === 'register' ? 'Create Workspace & Launch AI' : 'Sign In to Workspace'}
                </span>
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-[11px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800">
          Crescelo Multi-Tenant SaaS · AES-256 GCM Security
        </div>
      </div>
    </div>
  );
}
