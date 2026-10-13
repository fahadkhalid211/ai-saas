'use client';

import { T, useT } from '@/lib/i18n/context';
import { A } from '@/components/i18n/A';
import { useCallback, useEffect, useState } from 'react';
import { isNoTrackingPath } from '@/lib/privacy/no-tracking-paths';

const KEY = 'crescelo_cookie_consent';
const OPEN_EVENT = 'crescelo:cookie-settings';
const GA_ID = 'G-MEBPX2NE1Y';

type Choice = 'granted' | 'denied';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function read(): Choice | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
}

/** Loads Google Analytics, and only after the visitor has said yes. Ad features are off. */
function loadAnalytics() {
  if (document.getElementById('crescelo-ga')) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, { anonymize_ip: true, allow_google_signals: false, allow_ad_personalization_signals: false });
  const s = document.createElement('script');
  s.id = 'crescelo-ga';
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
}

/** Removes the analytics cookies Google set, so withdrawing consent takes effect straight away. */
function clearAnalyticsCookies() {
  const host = location.hostname;
  const domains = ['', host, '.' + host, '.' + host.split('.').slice(-2).join('.')];
  for (const c of document.cookie.split(';')) {
    const name = c.split('=')[0].trim();
    if (name === '_ga' || name.startsWith('_ga_') || name === '_gid') {
      for (const d of domains) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d ? `; domain=${d}` : ''}`;
    }
  }
}

/**
 * Cookie choice. Nothing but the essential cookies is set until the visitor accepts analytics; "Reject" is as prominent as
 * "Accept"; the choice is stored on this device and can be changed any time from "Cookie settings" in the footer.
 */
export function CookieConsent() {
  const __t = useT();
  const [choice, setChoice] = useState<Choice | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // No banner and no analytics inside a customer's embedded chat, on their hosted pages or in the signed-in app.
    if (isNoTrackingPath(window.location.pathname)) return;
    const saved = read();
    setChoice(saved);
    setOpen(saved === null);
    if (saved === 'granted') loadAnalytics();
    const reopen = () => setOpen(true);
    // any element marked data-cookie-settings reopens the choice, without depending on that element's own hydration
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement | null)?.closest?.('[data-cookie-settings]')) setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, reopen);
    document.addEventListener('click', onClick);
    return () => {
      window.removeEventListener(OPEN_EVENT, reopen);
      document.removeEventListener('click', onClick);
    };
  }, []);

  const decide = useCallback((c: Choice) => {
    try {
      localStorage.setItem(KEY, c);
    } catch {
      /* the choice still applies for this visit */
    }
    setChoice(c);
    setOpen(false);
    if (c === 'granted') loadAnalytics();
    else clearAnalyticsCookies();
  }, []);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label={__t("Cookie choices")}
      className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-[99998] rounded-2xl border border-white/10 bg-[#1f1e1d] p-4 sm:p-5 text-[#e8e5dc] shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
      style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif' }}
    >
      <p className="text-sm font-semibold text-[#faf9f5]"><T>Cookies</T></p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-[#c9c6bc]">
        <T>We always use the cookies needed to sign you in and keep the site secure. With your permission we also use Google Analytics to count visits and see which pages help. We never use advertising cookies.</T>{' '}
        <A href="/cookies" className="underline"><T>Cookie Policy</T></A>
      </p>
      <div className="mt-3.5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => decide('granted')}
          className="rounded-xl bg-[#abff44] px-4 py-2 text-[13px] font-semibold text-[#08251a] hover:brightness-105 cursor-pointer"
        >
          <T>Accept analytics</T>
        </button>
        <button
          type="button"
          onClick={() => decide('denied')}
          className="rounded-xl border border-white/25 bg-white/[0.06] px-4 py-2 text-[13px] font-semibold text-[#faf9f5] hover:bg-white/[0.1] cursor-pointer"
        >
          <T>Reject</T>
        </button>
        {choice !== null && (
          <button type="button" onClick={() => setOpen(false)} className="px-2 py-2 text-[13px] text-[#a19f96] underline cursor-pointer">
            <T>Close</T>
          </button>
        )}
      </div>
    </div>
  );
}

/** A footer link that reopens the choice. */
export function CookieSettingsLink({ className }: { className?: string }) {
  return (
    <button type="button" className={className} data-cookie-settings>
      <T>Cookie settings</T>
    </button>
  );
}
