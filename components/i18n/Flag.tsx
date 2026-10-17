import React from 'react';
import { Globe } from 'lucide-react';

/**
 * Flags as inline SVG. The emoji versions (🇸🇪) are drawn as two letters ("SE") on Windows, which has no flag glyphs, so a
 * language switcher built on them looks broken for the many visitors on that system. These are the languages the site offers:
 * English (US flag, the language the prices are charged in), Swedish, Finnish, Italian and Spanish.
 */
const FLAGS: Record<string, React.ReactNode> = {
  en: (
    <>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect key={i} y={(i * 16) / 7} width="24" height={16 / 7 + 0.05} fill={i % 2 === 0 ? '#B22234' : '#FFFFFF'} />
      ))}
      <rect width="11" height={(16 / 7) * 4} fill="#3C3B6E" />
      {[0, 1, 2].flatMap((r) => [0, 1, 2, 3].map((c) => <circle key={`${r}${c}`} cx={1.8 + c * 2.5} cy={1.6 + r * 2.4} r="0.55" fill="#FFFFFF" />))}
    </>
  ),
  sv: (
    <>
      <rect width="24" height="16" fill="#006AA7" />
      <rect x="7" width="3.4" height="16" fill="#FECC00" />
      <rect y="6.3" width="24" height="3.4" fill="#FECC00" />
    </>
  ),
  fi: (
    <>
      <rect width="24" height="16" fill="#FFFFFF" />
      <rect x="6.6" width="4" height="16" fill="#003580" />
      <rect y="6" width="24" height="4" fill="#003580" />
    </>
  ),
  it: (
    <>
      <rect width="8" height="16" fill="#009246" />
      <rect x="8" width="8" height="16" fill="#FFFFFF" />
      <rect x="16" width="8" height="16" fill="#CE2B37" />
    </>
  ),
  es: (
    <>
      <rect width="24" height="16" fill="#AA151B" />
      <rect y="4" width="24" height="8" fill="#F1BF00" />
    </>
  ),
};

/** A small flag for a language code ('en', 'sv', 'fi', 'it', 'es'). Decorative: the language name is always written next to it. */
export function Flag({ locale, size = 20, className = '' }: { locale: string; size?: number; className?: string }) {
  const art = FLAGS[locale];
  const height = Math.round((size * 2) / 3);
  if (!art) return <Globe size={Math.round(size * 0.85)} aria-hidden="true" className={className} />;
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 overflow-hidden rounded-[3px] shadow-[0_0_0_1px_rgba(15,23,42,0.18)] ${className}`}
      style={{ width: size, height, lineHeight: 0 }}
    >
      <svg viewBox="0 0 24 16" width={size} height={height} preserveAspectRatio="none" focusable="false" style={{ display: 'block' }}>
        {art}
      </svg>
    </span>
  );
}
