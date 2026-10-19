'use client';

import { T, useT } from '@/lib/i18n/context';
import { useState } from 'react';
import { ArrowRight, MailCheck, RefreshCw } from 'lucide-react';

interface Props {
  /** The address the confirmation link was sent to. */
  email: string;
  /** Closes the popup and goes on to the dashboard. */
  onContinue: () => void;
}

type ResendState = 'idle' | 'sending' | 'sent' | 'failed' | 'limited' | 'notSetUp';

/**
 * Shown right after an account is created: the next step is to confirm the email address, and the person should know that before
 * the dashboard asks for it. The account is already signed in, so "send it again" works from here.
 */
export function RegistrationEmailNotice({ email, onContinue }: Props) {
  const __t = useT();
  const [state, setState] = useState<ResendState>('idle');

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

  const note: Partial<Record<ResendState, string>> = {
    sent: __t('Sent again. Check your inbox and spam folder.'),
    failed: __t('We could not send it just now. Try again in a few minutes.'),
    limited: __t('You asked a few times already. Wait a little before asking again.'),
    notSetUp: __t('Email sending is not set up on this site yet, so no link could be sent.'),
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reg-email-title"
        aria-describedby="reg-email-body"
        className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 text-center shadow-[0_24px_60px_-20px_rgba(8,37,26,0.5)]"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#abff44]/30 text-[#08251a] dark:text-[#abff44]">
          <MailCheck className="h-7 w-7" aria-hidden="true" />
        </div>
        <h2 id="reg-email-title" className="text-lg font-bold text-slate-900 dark:text-white">
          <T>Your account is created. Now confirm your email address.</T>
        </h2>
        <div id="reg-email-body" className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          <p>
            <T>We sent a confirmation link to</T> <strong className="break-all text-slate-900 dark:text-white">{email}</strong>.
          </p>
          <p>
            <T>Open the link in that email to confirm it is yours. You need to do this before you can start your 14-day free trial.</T>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <T>Cannot see it? Look in your spam or promotions folder.</T>
          </p>
        </div>

        {state !== 'idle' && state !== 'sending' && note[state] ? (
          <p role="status" className="mt-3 text-xs font-semibold text-slate-700 dark:text-slate-200">
            {note[state]}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onContinue}
            autoFocus
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#abff44] py-2.5 text-xs font-bold text-[#08251a] shadow-md shadow-[#abff44]/40 transition hover:bg-[#9af02e] cursor-pointer"
          >
            <span><T>Got it, continue to dashboard</T></span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={resend}
            disabled={state === 'sending'}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-60 cursor-pointer"
          >
            {state === 'sending' ? <RefreshCw className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : null}
            <span>{state === 'sending' ? <T>Sending...</T> : <T>Send the link again</T>}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
