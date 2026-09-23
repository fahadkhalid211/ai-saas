'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
      render?: (container: string | HTMLElement, options: any) => number;
    };
  }
}

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

/**
 * Hook to execute Google reCAPTCHA v3 or return null if unconfigured
 */
export function useRecaptcha() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) {
      return;
    }

    if (window.grecaptcha) {
      window.grecaptcha.ready(() => setIsReady(true));
      return;
    }

    const scriptId = 'google-recaptcha-v3-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(RECAPTCHA_SITE_KEY)}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.grecaptcha) {
          window.grecaptcha.ready(() => setIsReady(true));
        }
      };
      document.head.appendChild(script);
    }
  }, []);

  const executeRecaptcha = useCallback(
    async (action: string = 'submit'): Promise<string | null> => {
      if (!RECAPTCHA_SITE_KEY) {
        return null;
      }

      if (!window.grecaptcha) {
        console.warn('[reCAPTCHA] grecaptcha is not available yet');
        return null;
      }

      try {
        return await new Promise<string>((resolve, reject) => {
          window.grecaptcha?.ready(async () => {
            try {
              const token = await window.grecaptcha!.execute(RECAPTCHA_SITE_KEY, { action });
              resolve(token);
            } catch (err) {
              reject(err);
            }
          });
        });
      } catch (err) {
        console.error('[reCAPTCHA] execution error:', err);
        return null;
      }
    },
    []
  );

  return { executeRecaptcha, isReady };
}

/**
 * Visual reCAPTCHA notice badge to display on forms and fields
 */
export function GoogleRecaptchaNotice({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex items-center gap-1.5 text-[11px] text-slate-400 py-1 select-none ${className}`}
    >
      <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
      <span>
        Protected by{' '}
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-300 hover:text-white underline underline-offset-2"
        >
          reCAPTCHA
        </a>{' '}
        &amp; Google{' '}
        <a
          href="https://policies.google.com/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-300 hover:text-white underline underline-offset-2"
        >
          Terms
        </a>
      </span>
    </div>
  );
}
