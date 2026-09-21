import type { Metadata } from 'next';
import { SITE } from '@/components/marketing/content';
import { Header } from '@/components/marketing/Header';
import { Hero } from '@/components/marketing/Hero';
import { LogoStrip } from '@/components/marketing/LogoStrip';
import { ProblemSolution } from '@/components/marketing/ProblemSolution';
import { BehindTheScenes, FeatureCarousel, Tools } from '@/components/marketing/Showpieces';
import { Demo } from '@/components/marketing/Features';
import { Playground } from '@/components/marketing/Playground';
import { Compare, DiagonalBenefits, IntegrationsStage, Paths, Stories } from '@/components/marketing/Sections2';
import { Metrics, Security, UseCases } from '@/components/marketing/Sections';
import { Pricing } from '@/components/marketing/Pricing';
import { Faq, FinalCta, Footer } from '@/components/marketing/Closing';
import { FAQ, PLANS } from '@/components/marketing/content';

const TITLE = 'Crescelo: a website assistant that answers, books and hands over';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: TITLE,
  description: SITE.description,
  alternates: { canonical: SITE.path },
  openGraph: {
    type: 'website',
    url: SITE.path,
    siteName: SITE.name,
    title: TITLE,
    description: SITE.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: SITE.description,
  },
};

function jsonLd() {
  const data = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.url,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: SITE.name,
      applicationCategory: 'BusinessApplication',
      description: SITE.description,
      offers: PLANS.map((p) => ({
        '@type': 'Offer',
        name: p.name,
        price: String(p.monthly),
        priceCurrency: 'USD',
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.items.map((i) => ({
        '@type': 'Question',
        name: i.q,
        acceptedAnswer: { '@type': 'Answer', text: i.a },
      })),
    },
  ];
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export default function WelcomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd() }} />
      <Header />
      <main id="main">
        <Hero />
        <LogoStrip />
        <ProblemSolution />
        <Tools />
        <BehindTheScenes />
        <FeatureCarousel />
        <Demo />
        <DiagonalBenefits />
        <Paths />
        <Playground />
        <UseCases />
        <Stories />
        <Metrics />
        <IntegrationsStage />
        <Security />
        <Compare />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
