'use client';

import { T, useT } from '@/lib/i18n/context';
import { useEffect, useState } from 'react';
import { MailCheck, X } from 'lucide-react';

interface Props {
  /** The signed-in member as the API returns it: `emailVerified === false` while the address is unconfirmed. */
  member: { email?: string; emailVerified?: boolean } | null;
}

/**
 * A bar at the top of the dashboard for an account whose email address has not been confirmed yet, with a way to ask for the
 * link again. After the person opens the link (which lands on /dashboard?emailVerified=1) it shows a short thank-you instead.
 */
export function EmailVerificationBanner({ member }: Props) {
  const __t = useT();
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'failed' | 'notSetUp' | 'limited'>('idle');
  const [justConfirmed, setJustConfirmed] = useState(false);

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get('emailVerified') === '1') {
        setJustConfirmed(true);
        url.searchParams.delete('emailVerified');
        window.history.replaceState(null, '', url.pathname + (url.search || '') + url.hash);
      }
    } catch {
      /* nothing to show */
    }
  }, []);

  const resend = async () => {
    setState('sending');
    try {
      const res = await fetch('/api/auth/resend-verification', { method: 'POST' });
      if (res.status === 429) return setState('limited');
      const data = await res.json().catch(() => ({}));
      if (data?.alreadyConfirmed) return setState('sent');
      if (data?.simulated) return setState('notSetUp');
      setState(data?.success ? 'sent' : 'failed');
    } catch {
      setState('failed');
    }
  };

  if (justConfirmed && member?.emailVerified !== false) {
    return (
      <div role="status" className="flex items-center justify-between gap-3 bg-emerald-100 dark:bg-emerald-950/60 border-b border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 px-4 py-2 text-xs font-semibold shrink-0">
        <span className="flex items-center gap-2"><MailCheck className="h-4 w-4" aria-hidden="true" /><T>Thank you, your email address is confirmed.</T></span>
        <button type="button" onClick={() => setJustConfirmed(false)} aria-label={__t("Close")} className="p-1 rounded hover:bg-emerald-200/60 dark:hover:bg-emerald-900 cursor-pointer"><X className="h-3.5 w-3.5" /></button>
      </div>
    );
  }

  if (!member || member.emailVerified !== false) return null;

  return (
    <div role="status" className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-amber-100 dark:bg-amber-950/50 border-b border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100 px-4 py-2 text-xs font-medium shrink-0">
      <span className="min-w-0">
        <strong><T>Please confirm your email address.</T></strong>{' '}
        <T>We sent a link to</T> <span className="font-semibold break-all">{member.email}</span>. <T>Until you open it, you cannot start your trial.</T>
        {state === 'sent' ? <> <span className="font-semibold"><T>Sent again. Check your inbox and spam folder.</T></span></> : null}
        {state === 'failed' ? <> <span className="font-semibold"><T>We could not send it just now. Try again in a few minutes.</T></span></> : null}
        {state === 'limited' ? <> <span className="font-semibold"><T>You asked a few times already. Wait a little before asking again.</T></span></> : null}
        {state === 'notSetUp' ? <> <span className="font-semibold"><T>Email sending is not set up on this site yet, so no link could be sent.</T></span></> : null}
      </span>
      <button
        type="button"
        onClick={resend}
        disabled={state === 'sending'}
        className="shrink-0 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-semibold px-3 py-1 cursor-pointer"
      >
        {state === 'sending' ? <T>Sending…</T> : <T>Send again</T>}
      </button>
    </div>
  );
}
