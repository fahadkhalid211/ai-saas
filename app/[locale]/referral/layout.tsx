import type { ReactNode } from 'react';
import { EB_Garamond } from 'next/font/google';
import '@/components/marketing/marketing.css';
import '@/components/marketing/theme.css';
import '@/components/marketing/sections.css';
import { SmoothScroll } from '@/components/marketing/SmoothScroll';
import { ScrollToTop } from '@/components/marketing/ScrollToTop';

const wordmark = EB_Garamond({ subsets: ['latin'], display: 'swap', variable: '--font-mk-wordmark' });

export default function ReferralLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`mk ${wordmark.variable} min-h-screen bg-[var(--mk-bg)] text-[var(--mk-ink)] selection:bg-[var(--mk-lime)] selection:text-[var(--mk-deep)]`}>
      <noscript>
        <style>{'.mk-reveal{opacity:1!important;transform:none!important}'}</style>
      </noscript>
      <SmoothScroll />
      {children}
      <ScrollToTop />
    </div>
  );
}
