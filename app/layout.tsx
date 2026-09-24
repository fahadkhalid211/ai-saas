import { CookieConsent } from '@/components/legal/CookieConsent';
import { SITE } from '@/components/marketing/content';
import { ReticleDev } from './reticle-dev';
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white font-sans">
        {process.env.NODE_ENV === 'development' ? <ReticleDev /> : null}
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
