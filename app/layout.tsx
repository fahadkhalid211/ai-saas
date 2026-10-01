import { CookieConsent } from '@/components/legal/CookieConsent';
import { AccessibilityMenu } from '@/components/a11y/AccessibilityMenu';
import { PageAccessibility } from '@/components/a11y/PageAccessibility';
import { SITE } from '@/components/marketing/content';
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./a11y.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  keywords: ['AI website assistant', 'AI chatbot for service businesses', 'appointment booking chatbot', 'lead capture chatbot', 'website chat widget', 'BYOK AI chatbot'],
  authors: [{ name: 'Crescelo', url: SITE.url }],
  // Google Search Console ownership: set GOOGLE_SITE_VERIFICATION in the environment to the token Search Console gives you.
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Applies a visitor's saved accessibility settings before first paint, so nothing flashes. */}
        <script dangerouslySetInnerHTML={{ __html: A11Y_BOOT }} />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white font-sans">
        {children}
        <PageAccessibility />
        <AccessibilityMenu />
        <CookieConsent />
      </body>
    </html>
  );
}
