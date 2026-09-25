import { NAV, PLANS, SITE } from '@/components/marketing/content';
import type { BlogPost } from '@/lib/blog/posts';
import { LEGAL } from '@/lib/legal/config';
import { TRIAL_DAYS } from '@/lib/billing/trial';

/** Structured data (schema.org JSON-LD) for search results. Everything is built from the same constants the pages show. */

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE.url}/#organization`,
    name: SITE.name,
    alternateName: ['Crescelo AI', 'Crescelo AI Website Assistant'],
    legalName: LEGAL.operatorLine,
    url: SITE.url,
    description: SITE.description,
    slogan: 'Answer every visitor. Book the ones who are ready.',
    // a square logo of at least 112px, as Google requires for the logo in results
    logo: { '@type': 'ImageObject', '@id': `${SITE.url}/#logo`, url: `${SITE.url}/icon-512.png`, contentUrl: `${SITE.url}/icon-512.png`, width: 512, height: 512, caption: SITE.name },
    image: { '@id': `${SITE.url}/#logo` },
    knowsAbout: ['AI website assistants', 'Appointment booking chatbots', 'Lead capture', 'Retrieval-augmented generation', 'Customer support automation'],
    contactPoint: [{ '@type': 'ContactPoint', contactType: 'customer support', url: `${SITE.url}${SITE.contactPath}`, availableLanguage: ['English'] }],
    ...(SITE.socials.length ? { sameAs: SITE.socials.map((s) => s.href) } : {}),
  };
}

/** The site's name for search results ("Crescelo" instead of the domain). */
export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.url}/#website`,
    name: SITE.name,
    alternateName: ['Crescelo AI', 'Crescelo.com'],
    url: SITE.url,
    description: SITE.description,
    inLanguage: 'en',
    publisher: { '@id': `${SITE.url}/#organization` },
  };
}

/** The main navigation as SiteNavigationElement entries: tells search engines which pages are the site's key sections. */
export function siteNavigationSchema() {
  const items = [
    ...NAV.map((n) => ({ name: n.label, path: n.href, description: n.description })),
    { name: 'Blog', path: '/blog', description: 'Guides on AI assistants, online booking and lead capture' },
    { name: 'Contact', path: SITE.contactPath, description: 'Open a support ticket or talk to the team' },
    { name: 'Start free trial', path: '/login?mode=register', description: '14-day free trial of every Growth feature' },
  ];
  return {
    '@context': 'https://schema.org',
    '@graph': items.map((i) => ({
      '@type': 'SiteNavigationElement',
      '@id': `${SITE.url}/#nav-${i.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name: i.name,
      description: i.description,
      url: `${SITE.url}${i.path}`,
    })),
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
      'WhatsApp and Telegram channels',
      'Bring your own AI provider with no usage markup',
    ],
    offers: [
      {
        '@type': 'Offer',
        name: `${TRIAL_DAYS}-day free trial`,
        description: `All Growth features free for ${TRIAL_DAYS} days. A card is required to start; it is charged automatically when the trial ends unless cancelled.`,
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

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------

const isoDate = (d: string) => (d.length === 10 ? `${d}T08:00:00+00:00` : d);
const wordsIn = (post: BlogPost) =>
  post.body
    .map((b) => ('text' in b ? b.text : 'items' in b ? b.items.join(' ') : b.type === 'table' ? [...b.headers, ...b.rows.flat()].join(' ') : ''))
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;

export function blogImageUrl(slug: string) {
  return `${SITE.url}/blog/${slug}/opengraph-image`;
}

/** The blog as an entity of its own, so every article can say it belongs to it. */
export function blogSchema(posts: BlogPost[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${SITE.url}/blog#blog`,
    name: 'Crescelo Knowledge Hub',
    description: 'Guides for service businesses on AI website assistants, online booking, lead capture, costs and privacy.',
    url: `${SITE.url}/blog`,
    inLanguage: 'en',
    publisher: { '@id': `${SITE.url}/#organization` },
    isPartOf: { '@id': `${SITE.url}/#website` },
    blogPost: posts.slice(0, 12).map((p) => ({ '@type': 'BlogPosting', '@id': `${SITE.url}/blog/${p.slug}#article`, headline: p.title, url: `${SITE.url}/blog/${p.slug}`, datePublished: isoDate(p.datePublished) })),
  };
}

/** An ordered list of articles for the blog index (lets search engines see the collection). */
export function itemListSchema(posts: BlogPost[], limit = 24) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: posts.slice(0, limit).map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE.url}/blog/${p.slug}`, name: p.title })),
  };
}

/** One article: what Google needs for an article result (headline, image, dates, author, publisher, section, length). */
export function blogPostingSchema(post: BlogPost) {
  const url = `${SITE.url}/blog/${post.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: post.title.length > 110 ? post.title.slice(0, 107).replace(/\s+\S*$/, '') + '...' : post.title,
    description: post.description,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    image: { '@type': 'ImageObject', url: blogImageUrl(post.slug), width: 1200, height: 630 },
    datePublished: isoDate(post.datePublished),
    dateModified: isoDate(post.dateModified),
    inLanguage: 'en',
    author: { '@type': 'Organization', '@id': `${SITE.url}/#organization`, name: SITE.name, url: SITE.url },
    publisher: { '@id': `${SITE.url}/#organization` },
    isPartOf: { '@id': `${SITE.url}/blog#blog` },
    articleSection: post.clusterName || 'Knowledge Hub',
    keywords: [post.primaryKeyword, ...(post.secondaryKeywords || []), ...post.tags].filter(Boolean).join(', '),
    ...(post.primaryKeyword ? { about: { '@type': 'Thing', name: post.primaryKeyword } } : {}),
    wordCount: wordsIn(post),
    timeRequired: `PT${Math.max(1, post.readMinutes)}M`,
  };
}
