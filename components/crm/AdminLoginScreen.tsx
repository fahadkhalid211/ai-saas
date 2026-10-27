'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Users,
  RefreshCw,
  Sparkles,
  Building2,
  KeyRound,
  Lock,
  ArrowRight,
  Globe,
  Eye,
  EyeOff,
} from 'lucide-react';
import { EMAIL_REGEX } from '@/lib/security/validation';
import Link from 'next/link';
import { brandFontClasses } from '@/lib/brand-fonts';
import { GoogleRecaptchaNotice } from '@/components/security/GoogleRecaptcha';
import { useI18n, T, useT } from '@/lib/i18n/context';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';

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

/** A password box with a button that shows or hides what was typed, so a typo in a new password can be seen before it is saved. */
function PasswordField({
  id,
  name,
  autoComplete,
  value,
  onChange,
  placeholder,
  visible,
  onToggle,
  invalid = false,
  describedBy,
  autoFocus,
}: {
  id: string;
  name: string;
  autoComplete: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  visible: boolean;
  onToggle: () => void;
  invalid?: boolean;
  describedBy?: string;
  autoFocus?: boolean;
}) {
  const __t = useT();
  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        id={id}
        name={name}
        autoComplete={autoComplete}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border ${
          invalid ? 'border-rose-400 dark:border-rose-600 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'
        } bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 transition`}
        required
      />
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={visible}
        aria-label={visible ? __t('Hide password') : __t('Show password')}
        title={visible ? __t('Hide password') : __t('Show password')}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
      >
        {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
      </button>
    </div>
  );
}

interface AdminLoginScreenProps {
  /** The plan and billing period picked on the pricing page, shown before the account is created. */
  selectedPlanNote?: string | null;
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
  /** The password typed a second time; it must match before the account can be created. */
  regConfirmInput: string;
  setRegConfirmInput: (val: string) => void;
  regTemplateInput: string;
  setRegTemplateInput: (val: string) => void;
  isLoggingIn: boolean;
  handleLogin: (e: React.FormEvent) => void;
  needsTwoFactor?: boolean;
  twoFactorCode?: string;
  setTwoFactorCode?: (val: string) => void;
  handleGoogleLogin?: () => void;
  handleAppleLogin?: () => void;
  handleSSOLogin?: (domainOrEmail: string) => void;
  onBackToHome?: () => void;
}

export function AdminLoginScreen({
  selectedPlanNote,
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
  regConfirmInput,
  setRegConfirmInput,
  regTemplateInput,
  setRegTemplateInput,
  isLoggingIn,
  handleLogin,
  needsTwoFactor,
  twoFactorCode,
  setTwoFactorCode,
  handleGoogleLogin,
  handleAppleLogin,
  handleSSOLogin,
  onBackToHome,
}: AdminLoginScreenProps) {
  const __t = useT();
  const { dict } = useI18n();
  const auth = dict?.auth;
  const [showSsoPrompt, setShowSsoPrompt] = useState(false);
  const [ssoInput, setSsoInput] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showStaffPassword, setShowStaffPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotLoading(true);
    setForgotError(null);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.success) {
        setForgotSuccess(true);
      } else {
        setForgotError(data?.error || __t('Failed to send reset link. Please try again.'));
      }
    } catch {
      setForgotError(__t('Something went wrong. Please try again.'));
    } finally {
      setForgotLoading(false);
    }
  };

  const isRegEmailValid = !regEmailInput || EMAIL_REGEX.test(regEmailInput.trim());
  const isRegPasswordValid = !regPasswordInput || regPasswordInput.trim().length >= 6;
  const isRegConfirmValid = !regConfirmInput || regConfirmInput.trim() === regPasswordInput.trim();
  const isRegBusinessNameValid = !regBusinessNameInput || regBusinessNameInput.trim().length >= 2;
  const isStaffEmailValid = !staffEmailInput || EMAIL_REGEX.test(staffEmailInput.trim());

  const isSubmitDisabled =
    isLoggingIn ||
    (authLoginMode === 'staff' && (!staffEmailInput.trim() || !staffPasswordInput.trim() || !isStaffEmailValid || Boolean(needsTwoFactor && !twoFactorCode?.trim()))) ||
    (authLoginMode === 'register' && (
      !regBusinessNameInput.trim() ||
      !isRegBusinessNameValid ||
      !regEmailInput.trim() ||
      !isRegEmailValid ||
      !regPasswordInput.trim() ||
      !isRegPasswordValid ||
      !regConfirmInput.trim() ||
      regConfirmInput.trim() !== regPasswordInput.trim()
    ));

  return (
    <div
      className={`kx-app ${brandFontClasses} min-h-screen w-full flex items-center justify-center font-sans px-4 py-12 sm:py-20 relative overflow-hidden`}
      style={{ background: 'radial-gradient(60rem 30rem at 10% -10%, #e9e0ff 0%, transparent 60%), radial-gradient(50rem 26rem at 100% 0%, #d8ffb0 0%, transparent 55%), radial-gradient(50rem 30rem at 50% 110%, #ffd9e6 0%, transparent 60%), #fffeeb' }}
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-[0_24px_60px_-20px_rgba(8,37,26,0.35)] ring-1 ring-[#08251a]/10 p-7 sm:p-8 z-10 space-y-5">
        <div className="flex items-center justify-between w-full mb-1">
          <Link
            href="/"
            className="text-xs font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 transition"
          >
            <span>&larr; {auth?.viewWebsite || <T>{'View our website'}</T>}</span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher variant="compact" />
            {onBackToHome && (
              <button
                type="button"
                onClick={onBackToHome}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
              >
                <span>{auth?.back || <T>{'Back'}</T>}</span>
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-col items-center text-center space-y-1.5">
          <div className="h-12 w-12 rounded-2xl bg-[#abff44]/40 border border-[#08251a]/15 flex items-center justify-center text-[#08251a] mb-0.5">
            {authLoginMode === 'register' ? <Building2 className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {authLoginMode === 'register' ? (auth?.registerTitle || <T>{'Create Business Account'}</T>) : (auth?.loginTitle || <T>{'Crescelo Management'}</T>)}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
            {authLoginMode === 'register'
              ? (auth?.registerSubtitle || <T>{'Create your account, then add a card to start your 14-day free trial. Charged after 14 days unless you cancel. Cancel any time.'}</T>)
              : (auth?.loginSubtitle || <T>{'Sign in to access your business assistant, CRM leads, and live conversations.'}</T>)}
          </p>
          {authLoginMode === 'register' && selectedPlanNote && (
            <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1" role="status">
              {selectedPlanNote}
            </p>
          )}
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
            <span>{auth?.continueWithGoogle || <T>{'Continue with Google'}</T>}</span>
          </button>

          {/* SSO button temporarily hidden per user request */}

          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full"></div>
            <span className="bg-white dark:bg-slate-900 px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
              {auth?.orWithEmail || <T>{'or continue with email'}</T>}
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
            <span>{auth?.registerTab || <T>{'Register'}</T>}</span>
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
            <span>{auth?.loginTab || <T>{'Sign In'}</T>}</span>
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-3.5">
          {/* Form 1: Self-Serve SaaS Registration */}
          {authLoginMode === 'register' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label htmlFor="reg-business" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {auth?.businessNameLabel || <T>{'Business / Company Name'}</T>}
                </label>
                <input
                  type="text"
                  value={regBusinessNameInput}
                  id="reg-business"
                  name="organization"
                  autoComplete="organization"
                  aria-invalid={!isRegBusinessNameValid}
                  aria-describedby={!isRegBusinessNameValid ? 'reg-business-error' : undefined}
                  onChange={(e) => setRegBusinessNameInput(e.target.value)}
                  placeholder={auth?.businessNamePlaceholder || 'e.g. Apex Health Clinic'}
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${
                    !isRegBusinessNameValid
                      ? 'border-rose-400 dark:border-rose-600 focus:ring-rose-500'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'
                  } bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 transition`}
                  autoFocus
                  required
                />
                {!isRegBusinessNameValid && (
                  <p id="reg-business-error" role="alert" className="text-[10.5px] text-rose-500 font-medium">
                    {auth?.businessNameError || <T>{'Business name must be at least 2 characters.'}</T>}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="reg-email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {auth?.ownerEmailLabel || <T>{'Owner Work Email'}</T>}
                </label>
                <input
                  type="email"
                  value={regEmailInput}
                  id="reg-email"
                  name="email"
                  autoComplete="email"
                  aria-invalid={!isRegEmailValid}
                  aria-describedby={!isRegEmailValid ? 'reg-email-error' : undefined}
                  onChange={(e) => setRegEmailInput(e.target.value)}
                  placeholder={auth?.ownerEmailPlaceholder || 'owner@company.com'}
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${
                    !isRegEmailValid
                      ? 'border-rose-400 dark:border-rose-600 focus:ring-rose-500'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'
                  } bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 transition`}
                  required
                />
                {!isRegEmailValid && (
                  <p id="reg-email-error" role="alert" className="text-[10.5px] text-rose-500 font-medium">
                    {auth?.ownerEmailError || <T>{'Please enter a valid email address.'}</T>}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="reg-password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {auth?.passwordLabel || <T>{'Account Password'}</T>}
                </label>
                <PasswordField
                  id="reg-password"
                  name="new-password"
                  autoComplete="new-password"
                  value={regPasswordInput}
                  onChange={setRegPasswordInput}
                  placeholder={auth?.passwordPlaceholder || 'At least 6 characters...'}
                  visible={showRegPassword}
                  onToggle={() => setShowRegPassword((v) => !v)}
                  invalid={!isRegPasswordValid}
                  describedBy={!isRegPasswordValid ? 'reg-password-error' : undefined}
                />
                {!isRegPasswordValid && (
                  <p id="reg-password-error" role="alert" className="text-[10.5px] text-rose-500 font-medium">
                    {auth?.passwordError || <T>{'Password must be at least 6 characters.'}</T>}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="reg-password-confirm" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <T>Repeat password</T>
                </label>
                <PasswordField
                  id="reg-password-confirm"
                  name="confirm-password"
                  autoComplete="new-password"
                  value={regConfirmInput}
                  onChange={setRegConfirmInput}
                  placeholder={__t('Type the same password again')}
                  visible={showRegPassword}
                  onToggle={() => setShowRegPassword((v) => !v)}
                  invalid={!isRegConfirmValid}
                  describedBy={!isRegConfirmValid ? 'reg-password-confirm-error' : undefined}
                />
                {!isRegConfirmValid && (
                  <p id="reg-password-confirm-error" role="alert" className="text-[10.5px] text-rose-500 font-medium">
                    <T>The two passwords do not match.</T>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Form 3: Staff & Tenant Login */}
          {authLoginMode === 'staff' && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="staff-email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {auth?.staffEmailLabel || <T>{'Account Email Address'}</T>}
                </label>
                <input
                  type="email"
                  value={staffEmailInput}
                  id="staff-email"
                  name="email"
                  autoComplete="username"
                  aria-invalid={!isStaffEmailValid}
                  aria-describedby={!isStaffEmailValid ? 'staff-email-error' : undefined}
                  onChange={(e) => setStaffEmailInput(e.target.value)}
                  placeholder={auth?.staffEmailPlaceholder || 'owner@company.com or staff@crescelo.com'}
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${
                    !isStaffEmailValid
                      ? 'border-rose-400 dark:border-rose-600 focus:ring-rose-500'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'
                  } bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 transition`}
                  autoFocus
                  required
                />
                {!isStaffEmailValid && (
                  <p id="staff-email-error" role="alert" className="text-[10.5px] text-rose-500 font-medium">
                    {auth?.ownerEmailError || <T>{'Please enter a valid email address.'}</T>}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="staff-password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>{auth?.staffPasswordLabel || <T>{'Password or Access Code'}</T>}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(staffEmailInput.trim());
                      setForgotError(null);
                      setForgotSuccess(false);
                      setShowForgotPassword(true);
                    }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 hover:underline cursor-pointer"
                  >
                    <T>Forgot password?</T>
                  </button>
                </div>
                <PasswordField
                  id="staff-password"
                  name="password"
                  autoComplete="current-password"
                  value={staffPasswordInput}
                  onChange={setStaffPasswordInput}
                  placeholder={auth?.staffPasswordPlaceholder || 'Enter password or access code...'}
                  visible={showStaffPassword}
                  onToggle={() => setShowStaffPassword((v) => !v)}
                />
              </div>
              {needsTwoFactor && (
                <div className="space-y-1.5">
                  <label htmlFor="staff-2fa" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <T>Authentication code</T>
                  </label>
                  <input
                    id="staff-2fa"
                    name="twoFactorCode"
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    value={twoFactorCode || ''}
                    onChange={(e) => setTwoFactorCode?.(e.target.value)}
                    placeholder={__t("6-digit authenticator code (e.g. 123 456) or recovery code")}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    autoFocus
                    required
                  />
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full py-2.5 rounded-xl bg-[#abff44] hover:bg-[#9af02e] disabled:opacity-50 text-[#08251a] text-xs font-bold shadow-md shadow-[#abff44]/40 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoggingIn ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>{auth?.signingIn || <T>{'Processing request...'}</T>}</span>
              </>
            ) : (
              <>
                {authLoginMode === 'register' && <Sparkles className="h-3.5 w-3.5" />}
                {authLoginMode === 'staff' && <Users className="h-3.5 w-3.5" />}
                <span>
                  {authLoginMode === 'register' ? (auth?.createAccountBtn || <T>{'Start Free Trial'}</T>) : needsTwoFactor ? <T>{'Verify 2FA & Sign In'}</T> : (auth?.signInBtn || <T>{'Sign In to Workspace'}</T>)}
                </span>
              </>
            )}
          </button>

          {authLoginMode === 'register' && (
            <p className="text-center text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
              <T>By starting your free trial you agree to our</T>{' '}
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"><T>Terms of Service</T></a>,{' '}
              <a href="/acceptable-use" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"><T>Acceptable Use Policy</T></a> <T>and</T>{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"><T>Privacy Policy</T></a><T>, and confirm you are at least 18.</T>
            </p>
          )}

          <div className="flex justify-center pt-1">
            <GoogleRecaptchaNotice />
          </div>
        </form>

        <div className="pt-2 text-center text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
          <a href="/terms" className="underline hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"><T>Terms</T></a> · <a href="/privacy" className="underline hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"><T>Privacy</T></a> · <a href="/cookies" className="underline hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"><T>Cookies</T></a>
        </div>
      </div>
      {showForgotPassword && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setShowForgotPassword(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="forgot-password-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="text-center space-y-1.5">
              <div className="h-11 w-11 mx-auto rounded-2xl bg-[#abff44]/40 border border-[#08251a]/15 flex items-center justify-center text-[#08251a] mb-1">
                <KeyRound className="h-5 w-5" />
              </div>
              <h3 id="forgot-password-title" className="text-base font-bold text-slate-900 dark:text-white">
                <T>Reset your password</T>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <T>Enter the email address for your account. We will send you instructions to reset your password.</T>
              </p>
            </div>

            {forgotError && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess ? (
              <div className="space-y-4 text-center py-2">
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs space-y-1">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mx-auto" />
                  <p className="font-semibold">
                    <T>Instructions sent</T>
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">
                    <T>If an account exists for this address, please check your inbox and spam folder for the password reset link.</T>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="w-full py-2.5 rounded-xl bg-[#abff44] hover:bg-[#9af02e] text-[#08251a] text-xs font-bold shadow-md shadow-[#abff44]/40 transition cursor-pointer"
                >
                  <T>Back to sign in</T>
                </button>
              </div>
            ) : (
              <form onSubmit={handleRequestPasswordReset} className="space-y-3.5">
                <div className="space-y-1">
                  <label htmlFor="forgot-email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <T>Account Email Address</T>
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    autoFocus
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer"
                  >
                    <T>Cancel</T>
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading || !forgotEmail.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-[#abff44] hover:bg-[#9af02e] disabled:opacity-50 text-[#08251a] text-xs font-bold shadow-md shadow-[#abff44]/40 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {forgotLoading ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span><T>Sending...</T></span>
                      </>
                    ) : (
                      <span><T>Send reset link</T></span>
                    )}
                  </button>
                </div>

                <p className="text-center text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  <T>Still having trouble?</T>{' '}
                  <a href="/support/contact" className="underline hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                    <T>Contact support</T>
                  </a>
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
