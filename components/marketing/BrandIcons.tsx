import type { ReactNode } from 'react';
import { CalendarDays, Globe, Mail, Phone, Sparkles, Webhook } from 'lucide-react';

/**
 * Small glyphs for the integrations animation, so a visitor recognises each tool at a glance. Brand marks are drawn as
 * simplified white glyphs on the brand colour (an approximation, not the official artwork); the rest come from the icon set.
 */

const svg = (children: ReactNode) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
    {children}
  </svg>
);

export function WhatsAppGlyph() {
  return svg(
    <>
      <path d="M12 3.2a8.8 8.8 0 0 0-7.6 13.2L3.2 20.8l4.5-1.2A8.8 8.8 0 1 0 12 3.2z" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9.1 7.9c.3-.4.6-.4.9-.3l.9 2c.1.3 0 .5-.2.7l-.5.6c.6 1.2 1.6 2.2 2.9 2.9l.6-.6c.2-.2.5-.3.7-.2l2 .9c.3.2.3.5.1.9-.5 1-1.4 1.5-2.4 1.3-3-.6-5.5-3.1-6.1-6.1-.1-1 .3-1.8 1.1-2.1z" fill="#fff" />
    </>
  );
}

export function TelegramGlyph() {
  return svg(
    <path
      d="M20.6 4.4 3.5 11c-1 .4-1 1.1-.2 1.3l4.4 1.4 1.7 5.2c.2.6.4.8.9.8.4 0 .6-.2.9-.4l2.1-2 4.4 3.3c.8.4 1.4.2 1.6-.8l2.9-13.7c.3-1.2-.4-1.7-1.6-1.3zM9 13.6l8.5-5.4c.4-.3.8-.1.5.2L11 14.6l-.3 3.1z"
      fill="#fff"
    />
  );
}

export function SlackGlyph() {
  return svg(
    <g stroke="#fff" strokeWidth="2.3" strokeLinecap="round">
      <path d="M9.3 4.5 8.1 19.5M15.9 4.5 14.7 19.5M4.5 9.3h15M4.1 14.7h15" />
    </g>
  );
}

export function SheetsGlyph() {
  return svg(
    <>
      <rect x="5.5" y="3.5" width="13" height="17" rx="2" fill="#fff" />
      <path d="M8.5 10h7M8.5 13.5h7M8.5 17h7M12 8v11" stroke="#0F9D58" strokeWidth="1.4" />
    </>
  );
}

export function YouTubeGlyph() {
  return svg(
    <>
      <rect x="3" y="6" width="18" height="12" rx="3.6" fill="#fff" />
      <path d="M10.2 9.2v5.6l4.8-2.8z" fill="#FF0000" />
    </>
  );
}

export interface OrbitIcon {
  icon: ReactNode;
  /** Background of the round badge behind the glyph. */
  bg: string;
}

const lucide = (Icon: typeof Mail) => <Icon size={20} strokeWidth={2.2} color="#08251a" aria-hidden="true" />;

/** Icon and badge colour for each integration id shown on the home page. */
export const ORBIT_ICONS: Record<string, OrbitIcon> = {
  whatsapp: { icon: <WhatsAppGlyph />, bg: '#25D366' },
  telegram: { icon: <TelegramGlyph />, bg: '#229ED9' },
  slack: { icon: <SlackGlyph />, bg: '#4A154B' },
  sheets: { icon: <SheetsGlyph />, bg: '#0F9D58' },
  voice: { icon: lucide(Phone), bg: '#ffbcf2' },
  email: { icon: lucide(Mail), bg: '#ffa946' },
  calendar: { icon: lucide(CalendarDays), bg: '#cdeee4' },
  webhooks: { icon: lucide(Webhook), bg: '#f0d7ff' },
  provider: { icon: lucide(Sparkles), bg: '#abff44' },
  urls: { icon: lucide(Globe), bg: '#ffe0b0' },
  youtube: { icon: <YouTubeGlyph />, bg: '#FF0000' },
};
