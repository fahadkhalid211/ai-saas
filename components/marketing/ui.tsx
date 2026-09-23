'use client';

import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { useCountUp, useInView } from './hooks';

/** Fades and lifts children into place once. Content is visible without JS (see marketing.css). */
export function Reveal({
  children,
  delay = 0,
  as: Tag = 'div',
  className = '',
  id,
  style: userStyle,
}: {
  children: ReactNode;
  delay?: number;
  as?: 'div' | 'li' | 'article' | 'section';
  className?: string;
  id?: string;
  style?: CSSProperties;
}) {
  const [ref, seen] = useInView<HTMLElement>();
  const style = { '--mk-delay': `${delay}ms`, ...userStyle } as CSSProperties;
  const Component = Tag as 'div';
  return (
    <Component
      id={id}
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`mk-reveal ${seen ? 'is-in' : ''} ${className}`}
      style={style}
    >
      {children}
    </Component>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="mk-eyebrow">{children}</p>;
}

export function SectionHead({
  eyebrow,
  title,
  intro,
  id,
  align = 'left',
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  id: string;
  align?: 'left' | 'center';
}) {
  return (
    <Reveal className={`mk-head ${align === 'center' ? 'is-center' : ''}`}>
      <p className="mk-eyebrow mk-rise" style={{ ['--mk-delay' as string]: '0ms' }}>
        {eyebrow}
      </p>
      <h2 id={id} className="mk-h2 mk-rise" style={{ ['--mk-delay' as string]: '140ms' }}>
        {title}
      </h2>
      {intro ? (
        <p className="mk-lead mk-rise" style={{ ['--mk-delay' as string]: '260ms' }}>
          {intro}
        </p>
      ) : null}
    </Reveal>
  );
}

export function ButtonLink({
  href,
  children,
  variant = 'primary',
  className = '',
  style,
}: {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'ghost';
  className?: string;
  style?: CSSProperties;
}) {
  const cls = `mk-btn mk-btn-${variant} ${className}`;
  if (href.startsWith('#')) {
    return (
      <a href={href} className={cls} style={style}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} style={style}>
      {children}
    </Link>
  );
}

export function Counter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [ref, seen] = useInView<HTMLSpanElement>();
  const value = useCountUp(end, seen);
  return (
    <span ref={ref} aria-label={`${end}${suffix}`}>
      <span aria-hidden="true">
        {value}
        {suffix}
      </span>
    </span>
  );
}

export function Check() {
  return (
    <svg className="mk-check" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 8.5l3.2 3L13 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`mk-logo ${className}`}>
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
        <rect x="1" y="1" width="20" height="20" rx="6" fill="var(--mk-deep)" />
        <path d="M14.6 7.4A5 5 0 1 0 14.6 14.6" stroke="var(--mk-lime)" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
      <span>Crescelo</span>
    </span>
  );
}
