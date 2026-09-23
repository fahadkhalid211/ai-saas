'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Eye, EyeOff, KeyRound, RefreshCw } from 'lucide-react';
import '../brand.css';
import { brandFontClasses } from '@/lib/brand-fonts';
import { BrandMark } from '@/components/brand/BrandMark';
import { GoogleRecaptchaNotice } from '@/components/security/GoogleRecaptcha';

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition';

/** Platform-owner sign-in. Not linked from anywhere; needs the master e-mail and the ADMIN_API_KEY. */
export default function MasterLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !key.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/master/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), key: key.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        router.replace('/dashboard');
        return;
      }
      setError(data.error || 'Invalid credentials');
    } catch {
      setError('Something went wrong. Try again.');
    }
    setBusy(false);
  };

  return (
    <div className={`kx-app ${brandFontClasses} min-h-screen w-full flex items-center justify-center bg-slate-950 font-sans p-4`}>
      <form onSubmit={submit} className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-7 space-y-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <BrandMark size={40} showWord={false} />
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Owner access</h1>
        </div>
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <div className="space-y-1">
          <label htmlFor="m-email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email</label>
          <input id="m-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} autoFocus required />
        </div>
        <div className="space-y-1">
          <label htmlFor="m-key" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Master key</label>
          <div className="relative">
            <input id="m-key" type={showKey ? 'text' : 'password'} autoComplete="current-password" value={key} onChange={(e) => setKey(e.target.value)} className={`${inputClass} pr-10 font-mono`} required />
            <button type="button" onClick={() => setShowKey(!showKey)} aria-label={showKey ? 'Hide key' : 'Show key'} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={busy || !email.trim() || !key.trim()} className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer">
          {busy ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <KeyRound className="h-3.5 w-3.5" />}
          <span>{busy ? 'Checking...' : 'Sign in'}</span>
        </button>
        <div className="flex justify-center pt-1">
          <GoogleRecaptchaNotice />
        </div>
      </form>
    </div>
  );
}
