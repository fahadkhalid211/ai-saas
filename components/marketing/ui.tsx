'use client';

import { T } from '@/lib/i18n/context';
import { A } from '@/components/i18n/A';
import Link from '@/components/i18n/Link';
import type { CSSProperties, ReactNode } from 'react';
import { useCountUp, useInView } from './hooks';
import { CresceloMark } from '@/components/brand/CresceloMark';

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
  as: Tag = 'h2',
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  id: string;
  align?: 'left' | 'center';
  /** Use "h1" for the main heading of a page. */
  as?: 'h1' | 'h2';
}) {
  return (
    <Reveal className={`mk-head ${align === 'center' ? 'is-center' : ''}`}>
      <p className="mk-eyebrow mk-rise" style={{ ['--mk-delay' as string]: '0ms' }}>
        <T>{eyebrow}</T>
      </p>
      <Tag id={id} className="mk-h2 mk-rise" style={{ ['--mk-delay' as string]: '140ms' }}>
        <T>{title}</T>
      </Tag>
      {intro ? (
        <p className="mk-lead mk-rise" style={{ ['--mk-delay' as string]: '260ms' }}>
          <T>{intro}</T>
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
  onClick,
}: {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'ghost';
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}) {
  const cls = `mk-btn mk-btn-${variant} ${className}`;
  if (href.startsWith('#')) {
    return (
      <A href={href} className={cls} style={style} onClick={onClick}>
        {children}
      </A>
    );
  }
  return (
    <Link href={href} className={cls} style={style} onClick={onClick}>
      {children}
    </Link>
  );
}

export function Counter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [ref, seen] = useInView<HTMLSpanElement>();
  const value = useCountUp(end, seen);
  return (
    <span ref={ref}>
      <span className="mk-sr">
        <T>{end}</T>
        <T>{suffix}</T>
      </span>
      <span aria-hidden="true">
        <T>{value}</T>
        <T>{suffix}</T>
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
      <CresceloMark size={30} />
      <span><T>Crescelo</T></span>
    </span>
  );
}
