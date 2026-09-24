import { PLANS, SITE } from '@/components/marketing/content';
import { LEGAL } from '@/lib/legal/config';
import { TRIAL_DAYS } from '@/lib/billing/trial';

/** Structured data (schema.org JSON-LD) for search results. Everything is built from the same constants the pages show. */

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE.url}/#organization`,
    name: SITE.name,
    legalName: LEGAL.operatorLine,
    url: SITE.url,
    logo: { '@type': 'ImageObject', url: `${SITE.url}/icon-512.png`, width: 512, height: 512 },
    email: SITE.contactEmail,
    address: { '@type': 'PostalAddress', addressCountry: 'PK' },
    contactPoint: [{ '@type': 'ContactPoint', contactType: 'customer support', email: SITE.contactEmail, availableLanguage: ['English'] }],
    ...(SITE.socials.length ? { sameAs: SITE.socials.map((s) => s.href) } : {}),
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.url}/#website`,
    name: SITE.name,
    url: SITE.url,
    inLanguage: 'en',
    publisher: { '@id': `${SITE.url}/#organization` },
  };
}

export function softwareSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${SITE.url}/#software`,
    name: SITE.name,
    url: SITE.url,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: SITE.description,
    image: `${SITE.url}/opengraph-image`,
    publisher: { '@id': `${SITE.url}/#organization` },
    featureList: [
      'Answers visitor questions from your own documents',
      'Books appointments in the chat with slot locking',
      'Captures leads and sends them to email, webhooks, Slack and Google Sheets',
      'Hands over to a person in one click',
      'WhatsApp, Telegram and phone channels',
      'Bring your own AI provider with no usage markup',
    ],
    offers: [
      {
        '@type': 'Offer',
        name: `${TRIAL_DAYS}-day free trial`,
        description: `All Growth features for ${TRIAL_DAYS} days, no credit card required.`,
        price: '0',
        priceCurrency: 'USD',
        eligibleDuration: { '@type': 'QuantitativeValue', value: TRIAL_DAYS, unitCode: 'DAY' },
        url: `${SITE.url}/login?mode=register`,
        availability: 'https://schema.org/InStock',
      },
      ...PLANS.map((p) => ({
        '@type': 'Offer',
        name: p.name,
        description: p.tagline,
        url: `${SITE.url}/pricing`,
        price: String(p.monthly),
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: String(p.monthly),
          priceCurrency: 'USD',
          billingDuration: 1,
          billingIncrement: 1,
          unitCode: 'MON',
          referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'MON' },
        },
      })),
    ],
  };
}

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })),
  };
}

/** A page in its place in the site: shown as a breadcrumb trail in search results. */
export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/' }, ...trail].map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: `${SITE.url}${t.path === '/' ? '' : t.path}`,
    })),
  };
}

export function webPageSchema(name: string, description: string, path: string, type: 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage' = 'WebPage') {
  return {
    '@context': 'https://schema.org',
    '@type': type,
    name,
    description,
    url: `${SITE.url}${path}`,
    inLanguage: 'en',
    isPartOf: { '@id': `${SITE.url}/#website` },
    publisher: { '@id': `${SITE.url}/#organization` },
  };
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
