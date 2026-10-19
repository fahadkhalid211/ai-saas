import React, { useId } from 'react';

/**
 * Logos for the AI providers a person can connect a key from, so each card is recognised at a glance.
 * They are simplified drawings of each company's mark (not the official artwork), used only to identify the provider the key
 * belongs to. Providers without a mark here (Groq, the free engine, a local model) simply show no logo.
 */

type Props = { id: string; size?: number; className?: string };

/** Google Gemini: the four-point star in Google's blue to purple to red. */
function Gemini({ size }: { size: number }) {
  const g = useId();
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={g} x1="3" y1="21" x2="21" y2="3" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#4285F4" />
          <stop offset="0.55" stopColor="#9B72CB" />
          <stop offset="1" stopColor="#D96570" />
        </linearGradient>
      </defs>
      <path d="M12 1.5c.7 5.6 4.9 9.8 10.5 10.5-5.6.7-9.8 4.9-10.5 10.5C11.3 16.9 7.1 12.7 1.5 12 7.1 11.3 11.3 7.1 12 1.5Z" fill={`url(#${g})`} />
    </svg>
  );
}

/** OpenAI: six rounded loops woven around a centre. */
function OpenAI({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false" className="text-slate-900 dark:text-white">
      <g fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinejoin="round">
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <rect key={deg} x="9.2" y="2.2" width="5.6" height="9.4" rx="2.8" transform={`rotate(${deg} 12 12)`} />
        ))}
      </g>
    </svg>
  );
}

/** Anthropic Claude: the terracotta burst of rounded rays. */
function Claude({ size }: { size: number }) {
  const rays = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
      <g stroke="#D97757" strokeWidth="2.1" strokeLinecap="round">
        {rays.map((deg, i) => (
          <line key={deg} x1="12" y1={i % 2 ? 6.6 : 4.8} x2="12" y2={i % 2 ? 10 : 9.2} transform={`rotate(${deg} 12 12)`} />
        ))}
      </g>
      <circle cx="12" cy="12" r="1.6" fill="#D97757" />
    </svg>
  );
}

/** DeepSeek: the blue whale. */
function DeepSeek({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
      <path
        d="M2.4 12.6c0-3.7 3.1-6.5 7.3-6.5 2.3 0 3.8.8 5.2 1.9l3.3-1.8-.9 3.6c1 1 1.6 2.2 1.6 3.6 0 3.6-3.7 5.7-8.5 5.7-4.7 0-8-2.1-8-6.5Z"
        fill="#4D6BFE"
      />
      <path d="M17.6 9.6c1.4-.9 2.7-1.3 4-.9-.7 1.3-1.6 2.1-2.8 2.6l-1.2-1.7Z" fill="#4D6BFE" />
      <circle cx="8" cy="11.3" r="1.1" fill="#fff" />
      <path d="M6.2 15.3c1.4 1.2 3.3 1.7 5.4 1.5" fill="none" stroke="#fff" strokeOpacity=".75" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

const LOGOS: Record<string, React.ComponentType<{ size: number }>> = {
  gemini: Gemini,
  openai: OpenAI,
  anthropic: Claude,
  deepseek: DeepSeek,
};

export function hasProviderLogo(id: string): boolean {
  return id in LOGOS;
}

/** The logo of a provider ('gemini', 'openai', 'anthropic', 'deepseek'); nothing for the others. Decorative: the name is always written beside it. */
export function ProviderLogo({ id, size = 18, className = '' }: Props) {
  const Logo = LOGOS[id];
  if (!Logo) return null;
  return (
    <span className={`inline-flex shrink-0 items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <Logo size={size} />
    </span>
  );
}
