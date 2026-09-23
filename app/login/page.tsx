'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import '../brand.css';
import { AdminLoginScreen } from '@/components/crm/AdminLoginScreen';

/** Customer sign-in and registration. The platform-owner sign-in is a separate, unlinked page. */
export default function LoginPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [authLoginMode, setAuthLoginMode] = useState<'staff' | 'register'>('staff');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [staffEmailInput, setStaffEmailInput] = useState('');
  const [staffPasswordInput, setStaffPasswordInput] = useState('');
  const [regBusinessNameInput, setRegBusinessNameInput] = useState('');
  const [regEmailInput, setRegEmailInput] = useState('');
  const [regPasswordInput, setRegPasswordInput] = useState('');
  const [regTemplateInput, setRegTemplateInput] = useState('classic-barbershop');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('kortex_theme');
      if (saved === 'dark' || saved === 'light') setTheme(saved);
    } catch {}
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'register') setAuthLoginMode('register');
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
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const payload = registering
        ? {
            mode: 'register',
            businessName: regBusinessNameInput.trim(),
            email: regEmailInput.trim(),
            password: regPasswordInput.trim(),
            industryTemplateSlug: regTemplateInput,
          }
        : { mode: 'staff', email: staffEmailInput.trim(), password: staffPasswordInput.trim() };
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.replace('/dashboard');
      } else {
        setAuthError(data.error || 'Authentication failed');
        setIsLoggingIn(false);
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication failed');
      setIsLoggingIn(false);
    }
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

  return (
    <AdminLoginScreen
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
      regTemplateInput={regTemplateInput}
      setRegTemplateInput={setRegTemplateInput}
      isLoggingIn={isLoggingIn}
      handleLogin={handleLogin}
      handleGoogleLogin={handleGoogleLogin}
      handleAppleLogin={handleAppleLogin}
      handleSSOLogin={handleSSOLogin}
    />
  );
}
