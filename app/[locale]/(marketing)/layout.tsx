import type { ReactNode } from 'react';
import { EB_Garamond } from 'next/font/google';
import '@/components/marketing/marketing.css';
import '@/components/marketing/theme.css';
import '@/components/marketing/sections.css';
import { SmoothScroll } from '@/components/marketing/SmoothScroll';
import { ScrollToTop } from '@/components/marketing/ScrollToTop';
import { LazyPlatformChatbot } from '@/components/chat/LazyPlatformChatbot';

// Headings and body text are Geist (loaded once by the root layout). EB Garamond is kept only for the Crescelo logo wordmark.
const wordmark = EB_Garamond({ subsets: ['latin'], display: 'swap', variable: '--font-mk-wordmark' });

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`mk ${wordmark.variable}`}>
      <noscript>
        <style>{'.mk-reveal{opacity:1!important;transform:none!important}'}</style>
      </noscript>
      <SmoothScroll />
      {children}
      <ScrollToTop />
      <LazyPlatformChatbot />
    </div>
  );
}
