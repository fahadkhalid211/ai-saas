import { CookieConsent } from '@/components/legal/CookieConsent';
import { ReferralTracker } from '@/components/referral/ReferralTracker';
import { AccessibilityMenu } from '@/components/a11y/AccessibilityMenu';
import { PageAccessibility } from '@/components/a11y/PageAccessibility';
import { I18nProvider } from '@/lib/i18n/context';
import { GeoLanguageBanner } from '@/components/i18n/GeoLanguageBanner';
import { SITE } from '@/components/marketing/content';
import type { Metadata, Viewport } from "next";
import { notFound } from 'next/navigation';
import { catalogScript } from '@/lib/i18n/server';
import { isLocaleCode, PREFIXED_LOCALES } from '@/lib/i18n/paths';
import { OG_LOCALE } from '@/lib/i18n/paths';
import { translate } from '@/lib/i18n/translate';
import { Sora, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./a11y.css";

// Sora: a wide, geometric sans, light for headings. Used for every heading and all body text, on the public pages and the dashboard.
const soraSans = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const A11Y_BOOT = "(function(){try{var p=JSON.parse(localStorage.getItem('crescelo_a11y')||'{}'),d=document.documentElement;for(var k in p){if(typeof p[k]==='string')d.setAttribute('data-a11y-'+k,p[k]);}}catch(e){}})();";

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fffeeb' },
    { media: '(prefers-color-scheme: dark)', color: '#1f1e1d' },
  ],
};

const baseMetadata: Metadata = {
  metadataBase: new URL(SITE.url),
  keywords: ['AI website assistant', 'AI chatbot for service businesses', 'appointment booking chatbot', 'lead capture chatbot', 'website chat widget', 'BYOK AI chatbot'],
  authors: [{ name: 'Crescelo', url: SITE.url }],
  // Search Console ownership: set GOOGLE_SITE_VERIFICATION (Google) and BING_SITE_VERIFICATION (Bing Webmaster Tools) to the tokens
  // they give you. Bing's index feeds ChatGPT search, Copilot and others, so it matters as much as Google for AI answers.
  verification:
    process.env.GOOGLE_SITE_VERIFICATION || process.env.BING_SITE_VERIFICATION
      ? {
          google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
          other: process.env.BING_SITE_VERIFICATION ? { 'msvalidate.01': process.env.BING_SITE_VERIFICATION } : undefined,
        }
      : undefined,
  creator: 'Crescelo',
  publisher: 'Crescelo',
  category: 'technology',
  formatDetection: { telephone: false },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
  title: { default: 'Crescelo: AI website assistant for service businesses', template: '%s' },
  description: SITE.description,
  applicationName: 'Crescelo',
  openGraph: {
    type: 'website',
    siteName: 'Crescelo',
    locale: 'en_US',
    url: SITE.url,
    title: 'Crescelo: AI website assistant for service businesses',
    description: SITE.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crescelo: AI website assistant for service businesses',
    description: SITE.description,
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};


/** The site-wide metadata in the page's language. Pages override title and description with their own. */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const loc = isLocaleCode(locale) ? locale : 'en';
  const tr = (v: string) => translate(v, loc);
  const title = tr('Crescelo: AI website assistant for service businesses');
  const description = tr(SITE.description);
  return {
    ...baseMetadata,
    title: { default: title, template: '%s' },
    description,
    openGraph: { ...baseMetadata.openGraph, locale: OG_LOCALE[loc], title, description },
    twitter: { ...baseMetadata.twitter, title, description },
  };
}

export function generateStaticParams() {
  return [{ locale: 'en' }, ...PREFIXED_LOCALES.map((locale) => ({ locale }))];
}

export const dynamicParams = false;

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocaleCode(locale)) notFound();
  const script = catalogScript(locale);
  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${soraSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Applies a visitor's saved accessibility settings before first paint, so nothing flashes. */}
        <script dangerouslySetInnerHTML={{ __html: A11Y_BOOT }} />
        {/* The page's translations, loaded before anything renders so the browser shows exactly what the server sent. */}
        {script ? <script src={script.src} /> : null}
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white font-sans">
        <I18nProvider locale={locale}>
          <ReferralTracker />
          <GeoLanguageBanner />
          {children}
          <PageAccessibility />
          <AccessibilityMenu />
          <CookieConsent />
        </I18nProvider>
      </body>
    </html>
  );
}
