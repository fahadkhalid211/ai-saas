'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { iconLabel } from '@/lib/a11y/names';

/**
 * Keyboard and screen-reader behaviour that every page gets without each component having to repeat it:
 *  - a "Skip to main content" link on pages that do not already have one, and a focusable target for it;
 *  - dialogs: any full-screen overlay that opens becomes a real dialog (role, name), keeps Tab inside it, closes on Escape,
 *    and hands focus back to whatever opened it;
 *  - buttons that only contain an icon get a name, and inputs that only have a placeholder get a label.
 * It works from the DOM, so it also covers pages added later. Components that already set their own roles and labels are left alone.
 */

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const visible = (el: HTMLElement) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
const focusables = (root: HTMLElement) => Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(visible);

/** The accessible name a button would have today, or '' if it has none. */
function nameOf(el: HTMLElement): string {
  return (
    el.getAttribute('aria-label') ||
    el.getAttribute('aria-labelledby') ||
    el.getAttribute('title') ||
    (el.textContent || '').trim() ||
    el.querySelector('img[alt]:not([alt=""])')?.getAttribute('alt') ||
    el.querySelector('svg title')?.textContent ||
    ''
  ).trim();
}

function nameIcons(root: ParentNode) {
  root.querySelectorAll<HTMLElement>('button, [role="button"], a[href]').forEach((el) => {
    if (nameOf(el)) return;
    const svg = el.querySelector('svg');
    const label = iconLabel(svg?.getAttribute('class') || '');
    if (label) el.setAttribute('aria-label', label);
  });
  root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"]), textarea, select').forEach((el) => {
    if (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.getAttribute('title')) return;
    if (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)) return;
    if (el.closest('label')) return;
    const hint = (el as HTMLInputElement).placeholder;
    if (hint) el.setAttribute('aria-label', hint);
  });
}

const isOverlay = (el: HTMLElement) =>
  el.classList.contains('fixed') &&
  el.classList.contains('inset-0') &&
  !el.hasAttribute('data-a11y-skip') &&
  getComputedStyle(el).pointerEvents !== 'none' &&
  focusables(el).length > 0;

const closeButton = (root: HTMLElement): HTMLElement | null => {
  const buttons = Array.from(root.querySelectorAll<HTMLElement>('button')).filter(visible);
  const named = (b: HTMLElement) => `${b.getAttribute('aria-label') || ''} ${b.getAttribute('title') || ''} ${(b.textContent || '').trim()}`.trim();
  return (
    buttons.find((b) => /^(close|dismiss|cancel|×|x|got it|done|no thanks|not now)\b/i.test(named(b))) ||
    buttons.find((b) => /\bclose\b/i.test(named(b))) ||
    buttons.find((b) => /lucide-x\b/.test(b.querySelector('svg')?.getAttribute('class') || '')) ||
    null
  );
};

export function PageAccessibility() {
  const pathname = usePathname();

  // skip link + a target for it
  useEffect(() => {
    if (document.querySelector('.mk-skip, .a11y-skip')) return;
    const main = document.querySelector<HTMLElement>('main');
    if (!main) return;
    if (!main.id) main.id = 'main-content';
    main.setAttribute('tabindex', '-1');
    const link = document.createElement('a');
    link.className = 'a11y-skip';
    link.href = `#${main.id}`;
    link.textContent = 'Skip to main content';
    link.addEventListener('click', (e) => {
      e.preventDefault();
      main.focus();
      main.scrollIntoView();
    });
    document.body.prepend(link);
    return () => link.remove();
  }, [pathname]);

  useEffect(() => {
    const tracked = new Map<HTMLElement, { opener: HTMLElement | null; onKey: (e: KeyboardEvent) => void }>();

    const adopt = (el: HTMLElement) => {
      if (tracked.has(el)) return;
      const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      if (!el.hasAttribute('role') && !el.querySelector('[role="dialog"],[role="alertdialog"]')) {
        el.setAttribute('role', 'dialog');
        el.setAttribute('aria-modal', 'true');
        if (!el.hasAttribute('aria-label') && !el.hasAttribute('aria-labelledby')) {
          const heading = el.querySelector('h1,h2,h3')?.textContent?.trim();
          el.setAttribute('aria-label', heading || 'Dialog');
        }
      }
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !e.defaultPrevented) {
          const btn = closeButton(el);
          if (btn) {
            e.stopPropagation();
            btn.click();
          }
          return;
        }
        if (e.key !== 'Tab') return;
        const items = focusables(el);
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey && (active === first || !el.contains(active))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (active === last || !el.contains(active))) {
          e.preventDefault();
          first.focus();
        }
      };
      el.addEventListener('keydown', onKey);
      tracked.set(el, { opener, onKey });
      // move focus into the dialog unless the component already did
      setTimeout(() => {
        if (!el.contains(document.activeElement)) {
          const items = focusables(el);
          (el.querySelector<HTMLElement>('[autofocus]') || items.find((i) => i.matches('input, textarea, select')) || items[0])?.focus();
        }
      }, 30);
    };

    let queued = false;
    const scan = () => {
      queued = false;
      nameIcons(document);
      document.querySelectorAll<HTMLElement>('.fixed.inset-0').forEach((el) => {
        if (isOverlay(el)) adopt(el);
      });
      // a dialog that has gone: return focus to what opened it
      tracked.forEach((info, el) => {
        if (el.isConnected) return;
        el.removeEventListener('keydown', info.onKey);
        tracked.delete(el);
        if (info.opener?.isConnected && !document.querySelector('[role="dialog"][aria-modal="true"]')) info.opener.focus();
      });
    };
    const queue = () => {
      if (queued) return;
      queued = true;
      setTimeout(scan, 60);
    };

    scan();
    const mo = new MutationObserver(queue);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      tracked.forEach((info, el) => el.removeEventListener('keydown', info.onKey));
      tracked.clear();
    };
  }, []);

  return null;
}
