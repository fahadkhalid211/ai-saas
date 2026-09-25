import { JsonLd } from '@/components/marketing/JsonLd';
import { faqSchema, organizationSchema, siteNavigationSchema, softwareSchema, websiteSchema } from '@/lib/schema';
import type { Metadata } from 'next';
import { SITE } from '@/components/marketing/content';
import { Header } from '@/components/marketing/Header';
import { Hero } from '@/components/marketing/Hero';
import { LogoStrip } from '@/components/marketing/LogoStrip';
import { ProblemSolution } from '@/components/marketing/ProblemSolution';
import { BehindTheScenes, FeatureCarousel, Tools } from '@/components/marketing/Showpieces';
import { Demo } from '@/components/marketing/Features';
import { Playground } from '@/components/marketing/Playground';
import { Compare, DiagonalBenefits, IntegrationsStage, Paths } from '@/components/marketing/Sections2';
import { Metrics, Security, UseCases } from '@/components/marketing/Sections';
import { Pricing } from '@/components/marketing/Pricing';
import { Faq, FinalCta, Footer } from '@/components/marketing/Closing';
import { FAQ, PLANS } from '@/components/marketing/content';

const TITLE = 'AI Website Assistant for Service Businesses | Crescelo';

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
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Crescelo: AI website assistant for service businesses' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: SITE.description,
    images: [{ url: '/twitter-image', alt: 'Crescelo: AI website assistant for service businesses' }],
  },
};

export default function WelcomePage() {
  return (
    <>
      <JsonLd data={[organizationSchema(), websiteSchema(), siteNavigationSchema(), softwareSchema(), faqSchema(FAQ.items)]} />
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
