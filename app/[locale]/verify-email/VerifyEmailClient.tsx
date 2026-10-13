'use client';

import { T, useT } from '@/lib/i18n/context';
import Link from '@/components/i18n/Link';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MailCheck, TriangleAlert } from 'lucide-react';

/**
 * Where the link in the confirmation e-mail lands when it is opened somewhere other than the browser that is signed in to the
 * account. The person chooses a password; that replaces the one from the sign-up form, which proves they own the mailbox and
 * locks out anyone who filled that form in with an address that was not theirs (see /api/auth/verify-email).
 */
export function VerifyEmailClient() {
  const __t = useT();
  const params = useSearchParams();
  const token = params.get('token') || '';
  const invalid = params.get('status') === 'invalid' || !token;
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError(__t('Choose a password of at least 6 characters.'));
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.success) {
        window.location.href = '/dashboard?emailVerified=1';
        return;
      }
      setError(data?.error || __t('Something went wrong. Please try again.'));
    } catch {
      setError(__t('Something went wrong. Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main id="main" className="min-h-screen flex items-center justify-center bg-[#fffeeb] dark:bg-[#061811] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[#e8e6d1] dark:border-[#1a4734] bg-white dark:bg-[#08251a] p-7 shadow-xl">
        {invalid ? (
          <>
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 mb-3">
              <TriangleAlert className="h-5 w-5" aria-hidden="true" />
              <h1 className="text-lg font-bold"><T>This link is not valid</T></h1>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <T>The link has expired or was already used. Sign in and use "Send again" in the yellow bar at the top of the dashboard to get a new one.</T>
            </p>
            <Link href="/login" className="mt-5 inline-block rounded-xl bg-[#abff44] px-4 py-2 text-sm font-semibold text-[#08251a]"><T>Go to sign in</T></Link>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 text-emerald-700 dark:text-[#abff44] mb-3">
              <MailCheck className="h-5 w-5" aria-hidden="true" />
              <h1 className="text-lg font-bold"><T>Confirm your email</T></h1>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <T>Choose a password to finish. It replaces any password set when this account was created, so only you can sign in.</T>
            </p>
            <form onSubmit={submit} className="mt-5 space-y-3">
              <label htmlFor="ve-password" className="block text-xs font-semibold text-slate-700 dark:text-slate-200"><T>New password</T></label>
              <input
                id="ve-password"
                type="password"
                autoComplete="new-password"
                minLength={6}
                maxLength={128}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#061c14] px-3 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-600"
              />
              {error ? <p role="alert" className="text-xs font-medium text-rose-700 dark:text-rose-300">{error}</p> : null}
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl bg-[#08251a] dark:bg-[#abff44] text-white dark:text-[#08251a] px-4 py-2.5 text-sm font-semibold disabled:opacity-60 cursor-pointer"
              >
                {busy ? <T>Confirming…</T> : <T>Confirm and sign in</T>}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
