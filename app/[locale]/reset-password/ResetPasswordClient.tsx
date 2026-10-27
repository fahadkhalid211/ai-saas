'use client';

import { T, useT } from '@/lib/i18n/context';
import Link from '@/components/i18n/Link';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { brandFontClasses } from '@/lib/brand-fonts';

export function ResetPasswordClient() {
  const __t = useT();
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError(__t('Password reset link is invalid or missing. Please request a new one.'));
      return;
    }

    if (password.length < 6) {
      setError(__t('Password must be at least 6 characters.'));
      return;
    }

    if (password !== confirmPassword) {
      setError(__t('The two passwords do not match.'));
      return;
    }

    setBusy(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data?.success) {
        setSuccess(true);
      } else {
        setError(data?.error || __t('Failed to reset password. The link may have expired.'));
      }
    } catch {
      setError(__t('Something went wrong. Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main
      className={`min-h-screen flex items-center justify-center p-6 ${brandFontClasses}`}
      style={{
        background:
          'radial-gradient(60rem 30rem at 10% -10%, #e9e0ff 0%, transparent 60%), radial-gradient(50rem 26rem at 100% 0%, #d8ffb0 0%, transparent 55%), #fffeeb',
      }}
    >
      <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 sm:p-8 shadow-[0_24px_60px_-20px_rgba(8,37,26,0.35)] space-y-5">
        <div className="text-center space-y-2">
          <div className="h-12 w-12 mx-auto rounded-2xl bg-[#abff44]/40 border border-[#08251a]/15 flex items-center justify-center text-[#08251a] mb-1">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            <T>Choose a new password</T>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <T>Enter a new password of at least 6 characters for your Crescelo account.</T>
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-4 text-center py-2">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs space-y-1">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
              <p className="font-semibold text-sm">
                <T>Password updated successfully!</T>
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                <T>Your account password has been changed. You can now sign in with your new password.</T>
              </p>
            </div>
            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center py-2.5 rounded-xl bg-[#abff44] hover:bg-[#9af02e] text-[#08251a] text-xs font-bold shadow-md shadow-[#abff44]/40 transition cursor-pointer"
            >
              <T>Sign In to Workspace</T>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="new-password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                <T>New password</T>
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={__t('At least 6 characters')}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirm-new-password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                <T>Repeat new password</T>
              </label>
              <input
                id="confirm-new-password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={__t('Type password again')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full py-2.5 rounded-xl bg-[#abff44] hover:bg-[#9af02e] disabled:opacity-50 text-[#08251a] text-xs font-bold shadow-md shadow-[#abff44]/40 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {busy ? <T>Updating password...</T> : <T>Set New Password</T>}
            </button>

            <div className="text-center pt-2">
              <Link href="/login" className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 underline">
                &larr; <T>Back to sign in</T>
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
