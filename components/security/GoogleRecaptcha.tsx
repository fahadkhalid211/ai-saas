'use client';

import { T } from '@/lib/i18n/context';
import React, { useEffect, useState, useCallback } from 'react';
import { ShieldCheck } from 'lucide-react';

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
      render?: (container: string | HTMLElement, options: any) => number;
    };
  }
}

const rawSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';
const RECAPTCHA_SITE_KEY = rawSiteKey.replace(/^["']|["']$/g, '').trim();

/**
 * Hook to execute Google reCAPTCHA v3 or return null if unconfigured/blocked
 */
export function useRecaptcha() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    if (window.grecaptcha) {
      try {
        window.grecaptcha.ready(() => setIsReady(true));
      } catch {
        setIsReady(true);
      }
      return;
    }

    const scriptId = 'google-recaptcha-v3-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(RECAPTCHA_SITE_KEY)}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.grecaptcha) {
          try {
            window.grecaptcha.ready(() => setIsReady(true));
          } catch {
            setIsReady(true);
          }
        }
      };
      script.onerror = () => {
        console.warn('[reCAPTCHA] Failed to load Google reCAPTCHA script (likely blocked by ad-blocker or firewall).');
      };
      document.head.appendChild(script);
    } else {
      // Check if already attached
      const interval = setInterval(() => {
        if (window.grecaptcha) {
          clearInterval(interval);
          try {
            window.grecaptcha.ready(() => setIsReady(true));
          } catch {
            setIsReady(true);
          }
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, []);

  const executeRecaptcha = useCallback(
    async (action: string = 'submit'): Promise<string | null> => {
      if (!RECAPTCHA_SITE_KEY) {
        return null;
      }

      // If window.grecaptcha is not ready yet, poll briefly (up to 2500ms)
      // to handle cases where the user clicks submit before script finishes downloading.
      const waitForGrecaptcha = async (): Promise<boolean> => {
        if (typeof window === 'undefined') return false;
        if (window.grecaptcha) return true;

        const startTime = Date.now();
        while (Date.now() - startTime < 2500) {
          await new Promise((res) => setTimeout(res, 100));
          if (window.grecaptcha) return true;
        }
        return false;
      };

      const available = await waitForGrecaptcha();
      if (!available || !window.grecaptcha) {
        console.warn('[reCAPTCHA] Script unavailable or blocked (adblock/network). Proceeding without token.');
        return null;
      }

      try {
        // Execute with a 3500ms timeout guarantee so registration UI never hangs indefinitely
        const executionPromise = new Promise<string>((resolve, reject) => {
          try {
            window.grecaptcha?.ready(async () => {
              try {
                const token = await window.grecaptcha!.execute(RECAPTCHA_SITE_KEY, { action });
                resolve(token);
              } catch (err) {
                reject(err);
              }
            });
          } catch (err) {
            reject(err);
          }
        });

        const timeoutPromise = new Promise<null>((resolve) => {
          setTimeout(() => {
            console.warn('[reCAPTCHA] grecaptcha.execute timed out after 3500ms.');
            resolve(null);
          }, 3500);
        });

        return await Promise.race([executionPromise, timeoutPromise]);
      } catch (err) {
        console.warn('[reCAPTCHA] Execution failed:', err);
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
  if (!RECAPTCHA_SITE_KEY) {
    return null;
  }

  return (
    <div
      className={`flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 py-1 select-none ${className}`}
    >
      <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
      <span>
        <T>Protected by</T>{' '}
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium underline underline-offset-2 transition-colors"
        >
          <T>reCAPTCHA</T>
        </a>{' '}
        <T>&amp; Google</T>{' '}
        <a
          href="https://policies.google.com/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium underline underline-offset-2 transition-colors"
        >
          <T>Terms</T>
        </a>
      </span>
    </div>
  );
}
