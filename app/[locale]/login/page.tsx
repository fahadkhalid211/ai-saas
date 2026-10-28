'use client';

import { T, useT } from '@/lib/i18n/context';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import '../brand.css';
import { AdminLoginScreen } from '@/components/crm/AdminLoginScreen';
import { RegistrationEmailNotice } from '@/components/crm/RegistrationEmailNotice';
import { useRecaptcha } from '@/components/security/GoogleRecaptcha';
import { readSelectedPlan, rememberSelectedPlan, trackEvent } from '@/lib/analytics/track';
import { BILLING_PLANS } from '@/lib/billing/plans';
import { captureReferralFromUrl, getStoredReferralCode } from '@/lib/analytics/referral-client';

/** Customer sign-in and registration. The platform-owner sign-in is a separate, unlinked page. */
export default function LoginPage() {
  const __t = useT();
  const router = useRouter();
  const { executeRecaptcha } = useRecaptcha();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [authLoginMode, setAuthLoginMode] = useState<'staff' | 'register'>('staff');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  // set at once, unlike the state above, which only reaches the button after a render: stops several clicks in one moment
  const submittingRef = useRef(false);
  const [staffEmailInput, setStaffEmailInput] = useState('');
  const [staffPasswordInput, setStaffPasswordInput] = useState('');
  const [regBusinessNameInput, setRegBusinessNameInput] = useState('');
  const [regEmailInput, setRegEmailInput] = useState('');
  const [regPasswordInput, setRegPasswordInput] = useState('');
  const [regConfirmInput, setRegConfirmInput] = useState('');
  // set once the account exists: the popup about confirming the email address is shown before going on to the dashboard
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [regTemplateInput, setRegTemplateInput] = useState('general');
  const [selectedPlanNote, setSelectedPlanNote] = useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [needsTwoFactor, setNeedsTwoFactor] = useState(false);
  const [googleTwoFactor, setGoogleTwoFactor] = useState(false);

  // The plan and billing period chosen on the pricing page: kept for the whole sign-up and shown before the account is made.
  useEffect(() => {
    captureReferralFromUrl();
    const params = new URLSearchParams(window.location.search);
    const plan = params.get('plan');
    const billing = params.get('billing') === 'monthly' ? 'monthly' : 'annual';
    if (plan && BILLING_PLANS.some((p) => p.id === plan)) rememberSelectedPlan({ plan, billing });
    const chosen = readSelectedPlan();
    const found = chosen && BILLING_PLANS.find((p) => p.id === chosen.plan);
    if (found && chosen) {
      const price = chosen.billing === 'annual' ? found.annualMonthlyPrice : found.monthlyPrice;
      setSelectedPlanNote(`Selected plan: ${found.name}, $${price} / month, billed ${chosen.billing === 'annual' ? `annually ($${price * 12} / year)` : 'monthly'}. Next you add a card to start 14 days free with all Growth features. You are charged this amount when the trial ends unless you cancel first.`);
    }
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('kortex_theme');
      if (saved === 'dark' || saved === 'light') setTheme(saved);
    } catch {}
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'register') setAuthLoginMode('register');
    if (params.get('twofactor') === '1') setGoogleTwoFactor(true);
    const errParam = params.get('error');
    const msgParam = params.get('message');
    if (msgParam) {
      setAuthError(msgParam);
    } else if (errParam) {
      setAuthError(`Sign-in notice: ${errParam}`);
    }

    // Already signed in: go straight to the dashboard.
    fetch('/api/auth')
      .then((r) => r.json())
      .then((d) => {
        if (d?.authenticated) router.replace('/dashboard');
      })
      .catch(() => undefined);
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const registering = authLoginMode === 'register';
    const missing = registering
      ? !regBusinessNameInput.trim() || !regEmailInput.trim() || !regPasswordInput.trim()
      : !staffEmailInput.trim() || !staffPasswordInput.trim();
    if (missing) return;
    if (registering && regPasswordInput.trim() !== regConfirmInput.trim()) {
      setAuthError(__t('The two passwords do not match.'));
      return;
    }
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const recaptchaToken = await executeRecaptcha(registering ? 'register' : 'login');
      const payload = registering
        ? {
            mode: 'register',
            businessName: regBusinessNameInput.trim(),
            email: regEmailInput.trim(),
            password: regPasswordInput.trim(),
            industryTemplateSlug: regTemplateInput,
            recaptchaToken,
            referralCode: getStoredReferralCode() || undefined,
          }
        : {
            mode: 'staff',
            email: staffEmailInput.trim(),
            password: staffPasswordInput.trim(),
            ...(needsTwoFactor || twoFactorCode.trim() ? { twoFactorCode: twoFactorCode.trim() } : {}),
            recaptchaToken,
          };
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (registering) {
          trackEvent('sign_up', { method: 'email', plan: readSelectedPlan()?.plan ?? 'none' });
          // the account is made and signed in: tell them about the confirmation email first, they go on from the popup
          setRegisteredEmail(regEmailInput.trim());
          setIsLoggingIn(false);
          return;
        }
        router.replace('/dashboard');
      } else {
        if (data.requiresTwoFactor) {
          // password accepted, the account also needs its authenticator code
          setNeedsTwoFactor(true);
        }
        setAuthError(data.error || 'Authentication failed');
        setIsLoggingIn(false);
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication failed');
      setIsLoggingIn(false);
    } finally {
      submittingRef.current = false;
    }
  };

  const handleGoogleTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorCode.trim()) return;
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const recaptchaToken = await executeRecaptcha('login');
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'oauth_2fa', twoFactorCode: twoFactorCode.trim(), recaptchaToken }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.replace('/dashboard');
        return;
      }
      if (data.expired) setGoogleTwoFactor(false);
      setTwoFactorCode('');
      setAuthError(data.error || 'Authentication failed');
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication failed');
    }
    setIsLoggingIn(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      window.location.href = '/api/auth/oauth/google';
    } catch (err: any) {
      setAuthError(err?.message || 'Google authentication failed');
      setIsLoggingIn(false);
    }
  };

  const handleAppleLogin = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      window.location.href = '/api/auth/oauth/apple';
    } catch (err: any) {
      setAuthError(err?.message || 'Apple authentication failed');
      setIsLoggingIn(false);
    }
  };

  const handleSSOLogin = async (domainOrEmail: string) => {
    if (!domainOrEmail || !domainOrEmail.trim()) {
      setAuthError('Please enter your company domain or corporate work email.');
      return;
    }
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/sso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domainOrEmail.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.replace('/dashboard');
      } else {
        setAuthError(data.error || 'Enterprise SSO authentication failed');
        setIsLoggingIn(false);
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Enterprise SSO authentication failed');
      setIsLoggingIn(false);
    }
  };

  if (googleTwoFactor) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <form onSubmit={handleGoogleTwoFactor} className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white"><T>Two-step verification</T></h1>
          <p className="text-xs text-slate-500"><T>Google confirmed it is you. Enter the 6-digit code from your authenticator app, or a recovery code, to finish signing in.</T></p>
          {authError && <p role="alert" className="text-xs text-rose-500">{authError}</p>}
          <input
            name="twoFactorCode"
            autoComplete="one-time-code"
            inputMode="numeric"
            autoFocus
            required
            value={twoFactorCode}
            onChange={(e) => setTwoFactorCode(e.target.value)}
            placeholder={__t("6-digit code")}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" disabled={isLoggingIn} className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold">
            {isLoggingIn ? <T>{'Verifying...'}</T> : <T>{'Verify and sign in'}</T>}
          </button>
          <button type="button" onClick={() => { setGoogleTwoFactor(false); setAuthError(null); }} className="w-full text-xs text-slate-500 hover:underline">
            <T>Back to sign in</T>
          </button>
        </form>
      </main>
    );
  }

  return (
    <>
    {registeredEmail ? <RegistrationEmailNotice email={registeredEmail} onContinue={() => router.replace('/dashboard')} /> : null}
    <AdminLoginScreen
      selectedPlanNote={selectedPlanNote}
      theme={theme}
      authError={authError}
      authLoginMode={authLoginMode}
      setAuthLoginMode={setAuthLoginMode}
      setAuthError={setAuthError}
      staffEmailInput={staffEmailInput}
      setStaffEmailInput={setStaffEmailInput}
      staffPasswordInput={staffPasswordInput}
      setStaffPasswordInput={setStaffPasswordInput}
      regBusinessNameInput={regBusinessNameInput}
      setRegBusinessNameInput={setRegBusinessNameInput}
      regEmailInput={regEmailInput}
      setRegEmailInput={setRegEmailInput}
      regPasswordInput={regPasswordInput}
      setRegPasswordInput={setRegPasswordInput}
      regConfirmInput={regConfirmInput}
      setRegConfirmInput={setRegConfirmInput}
      regTemplateInput={regTemplateInput}
      setRegTemplateInput={setRegTemplateInput}
      isLoggingIn={isLoggingIn}
      handleLogin={handleLogin}
      needsTwoFactor={needsTwoFactor}
      twoFactorCode={twoFactorCode}
      setTwoFactorCode={setTwoFactorCode}
      handleGoogleLogin={handleGoogleLogin}
      handleAppleLogin={handleAppleLogin}
      handleSSOLogin={handleSSOLogin}
    />
    </>
  );
}
