'use client';

import { T, useT } from '@/lib/i18n/context';
import { A } from '@/components/i18n/A';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from '@/components/i18n/Link';
import { usePathname } from 'next/navigation';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { LOGIN_HREF, SIGNUP_HREF } from './content';
import { ButtonLink, Logo } from './ui';
import { MEGA_DIRECT_LINKS, MEGA_MENUS, type MegaMenu } from './mega-menu-data';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import { useI18n } from '@/lib/i18n/context';
import './mega-menu.css';

type MenuId = MegaMenu['id'];

/** The panel that opens under the bar: link columns with icons on the left, a feature card on the right. */
function MegaPanel({ menu, onNavigate, id }: { menu: MegaMenu; onNavigate: () => void; id: string }) {
  return (
    <div id={id} className="mk-mega" role="region" aria-label={`${menu.label} menu`}>
      <div className="mk-mega-grid">
        <div className="mk-mega-cols" style={{ gridTemplateColumns: `repeat(${menu.columns.length}, minmax(0, 1fr))` }}>
          {menu.columns.map((col) => (
            <div key={col.title} className="mk-mega-col">
              <p className="mk-mega-col-title"><T>{col.title}</T></p>
              <ul>
                {col.links.map((l) => {
                  const Icon = l.icon;
                  return (
                    <li key={l.label}>
                      <Link href={l.href} className="mk-mega-link" onClick={onNavigate}>
                        <span className="mk-mega-icon" data-tone={l.tone} aria-hidden="true">
                          <Icon size={20} strokeWidth={2} />
                        </span>
                        <span className="mk-mega-text">
                          <span className="mk-mega-label">
                            <T>{l.label}</T>
                            {l.badge ? <em className="mk-mega-badge"><T>{l.badge}</T></em> : null}
                          </span>
                          <span className="mk-mega-desc"><T>{l.description}</T></span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <aside className="mk-mega-feature" aria-label={menu.feature.title}>
          <span className="mk-mega-glow" aria-hidden="true" />
          {menu.feature.preview ? (
            <div className="mk-mega-chat" aria-hidden="true">
              <span className="mk-mega-bubble is-visitor"><T>{menu.feature.preview.visitor}</T></span>
              <span className="mk-mega-bubble is-bot"><T>{menu.feature.preview.assistant}</T></span>
            </div>
          ) : null}
          <p className="mk-mega-feature-eyebrow"><T>{menu.feature.eyebrow}</T></p>
          <p className="mk-mega-feature-title"><T>{menu.feature.title}</T></p>
          <p className="mk-mega-feature-body"><T>{menu.feature.body}</T></p>
          <div className="mk-mega-feature-actions">
            <Link href={menu.feature.cta.href} className="mk-mega-feature-cta" onClick={onNavigate}>
              <T>{menu.feature.cta.label}</T>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            {menu.feature.secondary ? (
              <Link href={menu.feature.secondary.href} className="mk-mega-feature-secondary" onClick={onNavigate}>
                <T>{menu.feature.secondary.label}</T>
              </Link>
            ) : null}
          </div>
        </aside>
      </div>

      {menu.footerLinks?.length ? (
        <div className="mk-mega-footer">
          {menu.footerLinks.map((f) => (
            <Link key={f.href + f.label} href={f.href} onClick={onNavigate}>
              <T>{f.label}</T> <ArrowRight size={14} aria-hidden="true" />
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function Header() {
  const __t = useT();
  const { dict } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false); // mobile menu
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState<MenuId | null>(null); // desktop mega menu
  const [mobileGroup, setMobileGroup] = useState<MenuId | null>('product');
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  const closeMenu = useCallback(() => {
    clearTimer();
    setMenu(null);
  }, []);
  // hover opens after a beat and closes after a longer one, so the pointer can cross the gap to the panel
  const hoverOpen = (id: MenuId) => {
    clearTimer();
    timer.current = setTimeout(() => setMenu(id), menu ? 0 : 90);
  };
  const hoverClose = () => {
    clearTimer();
    timer.current = setTimeout(() => setMenu(null), 220);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // navigating anywhere closes both menus
  useEffect(() => {
    setOpen(false);
    closeMenu();
  }, [pathname, closeMenu]);

  // desktop menu: Escape closes it, and so does a click or focus anywhere outside it
  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu();
        navRef.current?.querySelector<HTMLElement>(`[data-menu="${menu}"]`)?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) closeMenu();
    };
    const onFocusIn = (e: FocusEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) closeMenu();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('focusin', onFocusIn);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('focusin', onFocusIn);
    };
  }, [menu, closeMenu]);

  // mobile menu: lock the page behind it, Escape closes it
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.__mkLenis?.stop();
    menuRef.current?.querySelector<HTMLElement>('button, a')?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
      window.__mkLenis?.start();
    };
  }, [open]);

  // leaving the mobile layout with the menu open would leave the page locked
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 960px)');
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const active = MEGA_MENUS.find((m) => m.id === menu) || null;

  return (
    <header translate="no" className={`mk-header notranslate ${scrolled ? 'is-scrolled' : ''}`}>
      <A href="#main" className="mk-skip">
        <T>Skip to content</T>
      </A>
      <div className="mk-wrap mk-header-wrap">
        <div className="mk-header-row">
          <Link href="/" aria-label="Crescelo home" className="mk-logo-link">
            <Logo />
          </Link>

          <div ref={navRef} className="mk-nav-desktop" onMouseLeave={hoverClose} onMouseEnter={clearTimer}>
            <nav aria-label={__t("Primary")} className="mk-nav-list">
              {MEGA_MENUS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  data-menu={m.id}
                  className={`mk-nav-link mk-nav-trigger ${menu === m.id ? 'is-open' : ''}`}
                  aria-expanded={menu === m.id}
                  aria-controls={`mk-mega-${m.id}`}
                  onMouseEnter={() => hoverOpen(m.id)}
                  onClick={() => (menu === m.id ? closeMenu() : setMenu(m.id))}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setMenu(m.id);
                      requestAnimationFrame(() => document.querySelector<HTMLElement>(`#mk-mega-${m.id} a`)?.focus());
                    }
                  }}
                >
                  <T>{m.label}</T>
                  <ChevronDown size={15} aria-hidden="true" className="mk-nav-chevron" />
                </button>
              ))}
              {MEGA_DIRECT_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="mk-nav-link" onMouseEnter={hoverClose}>
                  <T>{l.label}</T>
                </Link>
              ))}
            </nav>
            {active ? <MegaPanel key={active.id} menu={active} id={`mk-mega-${active.id}`} onNavigate={closeMenu} /> : null}
          </div>

          <div className="mk-header-actions flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher variant="navbar" className="mk-lang-desktop" />
            <Link href={LOGIN_HREF} className="mk-nav-link mk-login">
              {dict.nav.login}
            </Link>
            <ButtonLink href={SIGNUP_HREF} className="mk-btn-sm mk-cta-desktop">
              {dict.nav.signup}
            </ButtonLink>
            <button
              ref={toggleRef}
              type="button"
              className="mk-burger"
              aria-expanded={open}
              aria-controls="mk-mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((v) => !v)}
            >
              <span aria-hidden="true" className={`mk-burger-lines ${open ? 'is-open' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {open ? (
        <div id="mk-mobile-menu" ref={menuRef} className="mk-mobile" role="dialog" aria-label={__t("Menu")}>
          <nav aria-label={__t("Mobile")} className="mk-mobile-nav">
            {MEGA_MENUS.map((m) => {
              const expanded = mobileGroup === m.id;
              return (
                <div key={m.id} className="mk-acc">
                  <button
                    type="button"
                    className="mk-acc-head"
                    aria-expanded={expanded}
                    aria-controls={`mk-acc-${m.id}`}
                    onClick={() => setMobileGroup(expanded ? null : m.id)}
                  >
                    <span><T>{m.label}</T></span>
                    <ChevronDown size={20} aria-hidden="true" className="mk-acc-chevron" />
                  </button>
                  <div id={`mk-acc-${m.id}`} className="mk-acc-body" hidden={!expanded}>
                    {m.columns.map((col) => (
                      <div key={col.title} className="mk-acc-group">
                        <p className="mk-mega-col-title"><T>{col.title}</T></p>
                        <ul>
                          {col.links.map((l) => {
                            const Icon = l.icon;
                            return (
                              <li key={l.label}>
                                <Link href={l.href} className="mk-mega-link" onClick={() => setOpen(false)}>
                                  <span className="mk-mega-icon" data-tone={l.tone} aria-hidden="true">
                                    <Icon size={20} strokeWidth={2} />
                                  </span>
                                  <span className="mk-mega-text">
                                    <span className="mk-mega-label">
                                      <T>{l.label}</T>
                                      {l.badge ? <em className="mk-mega-badge"><T>{l.badge}</T></em> : null}
                                    </span>
                                    <span className="mk-mega-desc"><T>{l.description}</T></span>
                                  </span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {MEGA_DIRECT_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="mk-mobile-link" onClick={() => setOpen(false)}>
                <span><T>{l.label}</T></span>
              </Link>
            ))}
            <Link href="/support/contact" className="mk-mobile-link" onClick={() => setOpen(false)}>
              <span><T>Contact support</T></span>
            </Link>
          </nav>
          <div className="mk-mobile-actions space-y-2">
            <div className="flex items-center justify-between px-1 pb-1">
              <span className="text-xs text-slate-500 font-medium">{dict.switcher.language}</span>
              <LanguageSwitcher variant="navbar" direction="up" />
            </div>
            <ButtonLink href={SIGNUP_HREF}>{dict.nav.signup}</ButtonLink>
            <ButtonLink href={LOGIN_HREF} variant="ghost">
              {dict.nav.login}
            </ButtonLink>
          </div>
        </div>
      ) : null}
    </header>
  );
}
