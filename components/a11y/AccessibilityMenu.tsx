'use client';

import { T, useT } from '@/lib/i18n/context';
import { A } from '@/components/i18n/A';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { RATES, chunkText, voicesForLanguage, withPause } from '@/lib/a11y/read-aloud';
import './accessibility-menu.css';

/**
 * A menu on every page (except the chat embed) with two jobs:
 *  1. Read the page aloud, using the browser's own speech engine (nothing is sent anywhere).
 *  2. Personal display settings: text size, contrast, a colour-vision friendly palette, a readable font, underlined links,
 *     a stronger focus ring and reduced motion. Choices are kept in this browser and applied as data-a11y-* attributes on <html>
 *     (the rules live in app/a11y.css; app/layout.tsx applies them before first paint so nothing flashes).
 * It is fully keyboard operable: it opens from a button, Escape closes it, and focus returns to the button.
 */

export const STORAGE_KEY = 'crescelo_a11y';

interface Prefs {
  text: '100' | '125' | '150' | '175';
  contrast: 'normal' | 'high';
  cvd: 'off' | 'on';
  font: 'normal' | 'readable';
  links: 'normal' | 'underline';
  focus: 'normal' | 'strong';
  motion: 'normal' | 'reduce';
}
const DEFAULTS: Prefs = { text: '100', contrast: 'normal', cvd: 'off', font: 'normal', links: 'normal', focus: 'normal', motion: 'normal' };

function load(): Prefs {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
  } catch {
    return { ...DEFAULTS };
  }
}
function apply(p: Prefs) {
  const root = document.documentElement;
  (Object.keys(DEFAULTS) as (keyof Prefs)[]).forEach((k) => {
    if (p[k] === DEFAULTS[k]) root.removeAttribute(`data-a11y-${k}`);
    else root.setAttribute(`data-a11y-${k}`, p[k]);
  });
}
function save(p: Prefs) {
  try {
    const changed = Object.fromEntries((Object.keys(DEFAULTS) as (keyof Prefs)[]).filter((k) => p[k] !== DEFAULTS[k]).map((k) => [k, p[k]]));
    if (Object.keys(changed).length) localStorage.setItem(STORAGE_KEY, JSON.stringify(changed));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* private mode: the setting still applies for this visit */
  }
}

/** Every readable block in the page's main content, in order, skipping anything hidden or purely decorative. */
function readableBlocks(): { el: HTMLElement; text: string }[] {
  const root = (document.querySelector('main') as HTMLElement | null) || document.body;
  const all = Array.from(root.querySelectorAll<HTMLElement>('h1,h2,h3,h4,h5,h6,p,li,blockquote,figcaption,dt,dd,th,td,summary,label'));
  const set = new Set(all);
  const blocks: { el: HTMLElement; text: string }[] = [];
  for (const el of all) {
    if (el.closest('[aria-hidden="true"],[hidden],script,style,noscript,.a11y-menu,[data-a11y-skip]')) continue;
    if (el.getClientRects().length === 0) continue;
    // read the innermost blocks only, so a list item that holds a paragraph is not read twice
    if (Array.from(el.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li,blockquote,figcaption,dt,dd,th,td,summary,label')).some((c) => set.has(c as HTMLElement))) continue;
    const text = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
    if (text.length < 2) continue;
    blocks.push({ el, text: /^H[1-6]$|^TH$|^SUMMARY$|^LI$|^DT$/.test(el.tagName) ? withPause(text) : text });
  }
  return blocks;
}

type ReadState = 'idle' | 'reading' | 'paused';

export function AccessibilityMenu() {
  const __t = useT();
  const pathname = usePathname();
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [state, setState] = useState<ReadState>('idle');
  const [rate, setRate] = useState<number>(1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceName, setVoiceName] = useState('');
  const [hasSelection, setHasSelection] = useState(false);
  const [note, setNote] = useState('');
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const run = useRef(0); // bumps on every start/stop so a stale utterance callback does nothing
  const reading = useRef<HTMLElement | null>(null);

  // apply and remember the settings
  useEffect(() => {
    setPrefs(load());
  }, []);
  const update = useCallback((patch: Partial<Prefs>) => {
    setPrefs((cur) => {
      const next = { ...cur, ...patch };
      apply(next);
      save(next);
      return next;
    });
  }, []);

  // voices load asynchronously in most browsers
  useEffect(() => {
    if (!supported) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load);
  }, [supported]);

  const pageVoices = voicesForLanguage(voices, typeof document !== 'undefined' ? document.documentElement.lang || 'en' : 'en');

  const clearHighlight = () => {
    reading.current?.classList.remove('a11y-reading');
    reading.current = null;
  };

  const stop = useCallback(() => {
    run.current += 1;
    if (supported) window.speechSynthesis.cancel();
    clearHighlight();
    setState('idle');
  }, [supported]);

  // stop speaking when the visitor moves to another page or leaves
  useEffect(() => {
    stop();
    setOpen(false);
  }, [pathname, stop]);
  useEffect(() => {
    const off = () => window.speechSynthesis?.cancel();
    window.addEventListener('pagehide', off);
    return () => {
      window.removeEventListener('pagehide', off);
      off();
    };
  }, []);

  const speak = useCallback(
    (blocks: { el: HTMLElement | null; text: string }[]) => {
      if (!supported || !blocks.length) {
        setNote(supported ? 'There is no readable text on this page.' : 'Your browser cannot read pages aloud. Try Chrome, Edge, Safari or Firefox.');
        return;
      }
      setNote('');
      window.speechSynthesis.cancel();
      clearHighlight();
      const id = ++run.current;
      const voice = voices.find((v) => v.name === voiceName) || pageVoices[0];
      let b = 0;
      const next = () => {
        if (id !== run.current) return;
        if (b >= blocks.length) {
          clearHighlight();
          setState('idle');
          return;
        }
        const { el, text } = blocks[b++];
        clearHighlight();
        if (el) {
          el.classList.add('a11y-reading');
          reading.current = el;
          el.scrollIntoView({ block: 'center', behavior: prefs.motion === 'reduce' || window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        }
        const parts = chunkText(text);
        let i = 0;
        const say = () => {
          if (id !== run.current) return;
          if (i >= parts.length) return next();
          const u = new SpeechSynthesisUtterance(parts[i++]);
          u.rate = rate;
          u.lang = voice?.lang || document.documentElement.lang || 'en';
          if (voice) u.voice = voice;
          u.onend = say;
          u.onerror = (e) => {
            if (id !== run.current || e.error === 'interrupted' || e.error === 'canceled') return;
            setNote('The voice stopped unexpectedly. Try another voice.');
            stop();
          };
          window.speechSynthesis.speak(u);
        };
        say();
      };
      setState('reading');
      next();
    },
    [supported, voices, voiceName, pageVoices, rate, prefs.motion, stop]
  );

  const readPage = () => speak(readableBlocks());
  const readSelection = () => {
    const text = window.getSelection()?.toString().replace(/\s+/g, ' ').trim() || '';
    speak(text ? [{ el: null, text }] : []);
  };
  const pauseResume = () => {
    if (!supported) return;
    if (state === 'reading') {
      window.speechSynthesis.pause();
      setState('paused');
    } else if (state === 'paused') {
      window.speechSynthesis.resume();
      setState('reading');
    }
  };

  // open, close, and hand focus back
  const close = useCallback(() => {
    setOpen(false);
    button.current?.focus();
  }, []);
  useEffect(() => {
    if (!open) return;
    setHasSelection(!!window.getSelection()?.toString().trim());
    panel.current?.querySelector<HTMLElement>('button, select, input')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
      }
    };
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!panel.current?.contains(t) && !button.current?.contains(t)) setOpen(false);
    };
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      document.removeEventListener('mousedown', onDown);
    };
  }, [open, close]);

  // the widget embedded in other people's sites has its own controls
  if (pathname?.startsWith('/embed')) return null;

  const choice = <K extends keyof Prefs>(k: K, label: string, options: [Prefs[K], string][]) => (
    <fieldset className="a11y-group">
      <legend><T>{label}</T></legend>
      <div className="a11y-row">
        {options.map(([v, text]) => (
          <button key={String(v)} type="button" aria-pressed={prefs[k] === v} onClick={() => update({ [k]: v } as Partial<Prefs>)}>
            <T>{text}</T>
          </button>
        ))}
      </div>
    </fieldset>
  );

  return (
    <div className="a11y-menu" data-a11y-skip>
      <button
        ref={button}
        type="button"
        className="a11y-trigger"
        aria-expanded={open}
        aria-controls={`${uid}-panel`}
        aria-haspopup="dialog"
        onClick={() => setOpen((o) => !o)}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="4.5" r="1.8" />
          <path d="M5 8.5l7 1.5 7-1.5M12 10v4.5M12 14.5l-3 6M12 14.5l3 6" />
        </svg>
        <span className="a11y-only"><T>Accessibility options: read this page aloud, text size and colours</T></span>
      </button>

      {open ? (
        <div ref={panel} id={`${uid}-panel`} role="dialog" aria-label={__t("Accessibility options")} className="a11y-panel">
          <div className="a11y-head">
            <h2><T>Accessibility</T></h2>
            <button type="button" className="a11y-close" onClick={close} aria-label={__t("Close accessibility options")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <section aria-labelledby={`${uid}-listen`} className="a11y-section">
            <h3 id={`${uid}-listen`}><T>Listen to this page</T></h3>
            {supported ? (
              <>
                <div className="a11y-row">
                  {state === 'idle' ? (
                    <button type="button" className="a11y-primary" onClick={readPage}><T>Read page aloud</T></button>
                  ) : (
                    <>
                      <button type="button" className="a11y-primary" onClick={pauseResume}><T>{state === 'paused' ? 'Resume' : 'Pause'}</T></button>
                      <button type="button" onClick={stop}><T>Stop</T></button>
                    </>
                  )}
                  {hasSelection && state === 'idle' ? <button type="button" onClick={readSelection}><T>Read selected text</T></button> : null}
                </div>
                <label className="a11y-field">
                  <span><T>Speed</T></span>
                  <select value={rate} onChange={(e) => setRate(Number(e.target.value))}>
                    {RATES.map((r) => (
                      <option key={r} value={r}>{r === 1 ? 'Normal' : `${r}x`}</option>
                    ))}
                  </select>
                </label>
                {pageVoices.length > 1 ? (
                  <label className="a11y-field">
                    <span><T>Voice</T></span>
                    <select value={voiceName || pageVoices[0]?.name} onChange={(e) => setVoiceName(e.target.value)}>
                      {pageVoices.map((v) => (
                        <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
                      ))}
                    </select>
                  </label>
                ) : null}
                <p className="a11y-help"><T>Uses your browser&apos;s built-in voice. Nothing is sent to us or anyone else. The block being read is highlighted.</T></p>
              </>
            ) : (
              <p className="a11y-help"><T>Your browser cannot read pages aloud. Chrome, Edge, Safari and Firefox can.</T></p>
            )}
            <p className="a11y-live" role="status" aria-live="polite"><T>{note || (state === 'reading' ? 'Reading…' : state === 'paused' ? 'Paused' : '')}</T></p>
          </section>

          <section aria-labelledby={`${uid}-display`} className="a11y-section">
            <h3 id={`${uid}-display`}><T>Display</T></h3>
            {choice('text', 'Text size', [['100', 'Normal'], ['125', 'Large'], ['150', 'Larger'], ['175', 'Largest']])}
            {choice('contrast', 'Contrast', [['normal', 'Standard'], ['high', 'High']])}
            {choice('cvd', 'Colour-blind friendly colours', [['off', 'Off'], ['on', 'On']])}
            {choice('font', 'Font', [['normal', 'Standard'], ['readable', 'Easy to read']])}
            {choice('links', 'Links', [['normal', 'Standard'], ['underline', 'Always underlined']])}
            {choice('focus', 'Keyboard focus outline', [['normal', 'Standard'], ['strong', 'Extra thick']])}
            {choice('motion', 'Animation', [['normal', 'Standard'], ['reduce', 'Reduce motion']])}
            <button type="button" className="a11y-reset" onClick={() => { setPrefs({ ...DEFAULTS }); apply(DEFAULTS); save(DEFAULTS); }}><T>Reset all</T></button>
          </section>

          <p className="a11y-help">
            <T>Everything on this site can be used with a keyboard:</T> <kbd>Tab</kbd> <T>moves forward,</T> <kbd>Shift</kbd>+<kbd>Tab</kbd> <T>back,</T> <kbd>Enter</kbd> <T>or</T> <kbd>Space</kbd> <T>activates,</T> <kbd>Esc</kbd> <T>closes.</T> <A href="/accessibility"><T>Accessibility statement</T></A>
          </p>
        </div>
      ) : null}
    </div>
  );
}
