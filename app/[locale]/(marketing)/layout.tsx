import type { ReactNode } from 'react';
import { EB_Garamond, Figtree } from 'next/font/google';
import '@/components/marketing/marketing.css';
import '@/components/marketing/theme.css';
import '@/components/marketing/sections.css';
import { SmoothScroll } from '@/components/marketing/SmoothScroll';
import { ScrollToTop } from '@/components/marketing/ScrollToTop';
import { LazyPlatformChatbot } from '@/components/chat/LazyPlatformChatbot';

// EB Garamond for headings (as on the reference editorial sections) and Figtree for body text.
const serif = EB_Garamond({ subsets: ['latin'], display: 'swap', variable: '--font-mk-serif' });
const body = Figtree({ subsets: ['latin'], display: 'swap', variable: '--font-mk-body' });

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`mk ${serif.variable} ${body.variable}`}>
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
