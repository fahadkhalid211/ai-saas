'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { NAV, LOGIN_HREF, SIGNUP_HREF } from './content';
import { ButtonLink, Logo } from './ui';

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
    menuRef.current?.querySelector<HTMLElement>('a')?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
      window.__mkLenis?.start();
    };
  }, [open]);

  return (
    <header className={`mk-header ${scrolled ? 'is-scrolled' : ''}`}>
      <a href="#main" className="mk-skip">
        Skip to content
      </a>
      <div className="mk-wrap mk-header-row">
        <Link href="/" aria-label="Crescelo home" className="mk-logo-link">
          <Logo />
        </Link>

        <nav aria-label="Primary" className="mk-nav-desktop">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="mk-nav-link">
              {n.label}
            </a>
          ))}
        </nav>

        <div className="mk-header-actions">
          <Link href={LOGIN_HREF} className="mk-nav-link mk-login">
            Log in
          </Link>
          <ButtonLink href={SIGNUP_HREF} className="mk-btn-sm mk-cta-desktop">
            Create your assistant
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

      {open ? (
        <div id="mk-mobile-menu" ref={menuRef} className="mk-mobile" role="dialog" aria-label="Menu">
          <nav aria-label="Mobile">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="mk-mobile-link" onClick={() => setOpen(false)}>
                <span>{n.label}</span>
                {n.description ? <small>{n.description}</small> : null}
              </a>
            ))}
          </nav>
          <div className="mk-mobile-actions">
            <ButtonLink href={SIGNUP_HREF}>Create your assistant</ButtonLink>
            <ButtonLink href={LOGIN_HREF} variant="ghost">
              Log in
            </ButtonLink>
          </div>
        </div>
      ) : null}
    </header>
  );
}
