import { describe, expect, it } from 'vitest';
import { INDUSTRIES, industryBySlug, industryForArticle } from './industries';
import { INTEGRATION_PAGES } from './integration-pages';
import { GLOSSARY } from './glossary';
import { getCard } from './blog';
import { productFeatureFor } from './blog/product-link';
import { BLOG_TOPICS, INDEXED_TOPICS } from './blog/topics';
import { PRODUCT_FEATURES } from './product-features';
import robots from '../app/robots';
import sitemap from '../app/sitemap';

const featureSlugs = new Set(PRODUCT_FEATURES.map((f) => f.slug));

describe('industry pages', () => {
  it('have unique slugs, titles and descriptions of a sensible length', () => {
    expect(new Set(INDUSTRIES.map((i) => i.slug)).size).toBe(INDUSTRIES.length);
    expect(new Set(INDUSTRIES.map((i) => i.seoDescription)).size).toBe(INDUSTRIES.length);
    for (const i of INDUSTRIES) {
      expect(`${i.seoTitle} | Crescelo`.length, i.slug).toBeLessThanOrEqual(65);
      expect(i.seoDescription.length, i.slug).toBeLessThanOrEqual(160);
      expect(i.seoDescription.length, i.slug).toBeGreaterThanOrEqual(70);
      expect(i.faq.length, i.slug).toBeGreaterThanOrEqual(3);
      expect(i.limits.length, i.slug).toBeGreaterThanOrEqual(2);
    }
  });

  it('link only to articles and features that exist', () => {
    for (const i of INDUSTRIES) {
      for (const s of i.articles) expect(getCard(s), `${i.slug} -> ${s}`).toBeDefined();
      for (const f of i.features) expect(featureSlugs.has(f), `${i.slug} -> ${f}`).toBe(true);
    }
  });

  it('never promise what the product does not do', () => {
    const text = JSON.stringify(INDUSTRIES).toLowerCase();
    for (const bad of ['crescelo is hipaa compliant', 'two-way sync with google', 'guaranteed', 'zero double']) expect(text, bad).not.toContain(bad);
  });

  it('matches articles to an industry', () => {
    expect(industryForArticle('ai-patient-scheduling-dental-practices', 'dental practices')?.slug).toBe('dental-clinics');
    expect(industryForArticle('legal-intake-automation-conflict-checks', '')?.slug).toBe('law-firms');
    expect(industryBySlug('nope')).toBeUndefined();
  });
});

describe('integration pages and glossary', () => {
  it('are complete and link to real features', () => {
    for (const i of INTEGRATION_PAGES) {
      expect(`${i.seoTitle} | Crescelo`.length, i.slug).toBeLessThanOrEqual(65);
      expect(i.seoDescription.length, i.slug).toBeLessThanOrEqual(160);
      expect(i.steps.length, i.slug).toBeGreaterThanOrEqual(3);
      for (const f of i.features) expect(featureSlugs.has(f), `${i.slug} -> ${f}`).toBe(true);
    }
  });
  it('define each term once', () => {
    expect(new Set(GLOSSARY.map((g) => g.slug)).size).toBe(GLOSSARY.length);
    for (const g of GLOSSARY) expect(g.definition.length, g.slug).toBeGreaterThan(40);
  });
});

describe('blog topics and product links', () => {
  it('have no unnamed bucket, and keep the off-topic topics out of the indexed list', () => {
    expect(BLOG_TOPICS.length).toBeGreaterThanOrEqual(20);
    expect(new Set(BLOG_TOPICS.map((t) => t.slug)).size).toBe(BLOG_TOPICS.length);
    expect(INDEXED_TOPICS.every((t) => !t.offTopic)).toBe(true);
    expect(BLOG_TOPICS.filter((t) => t.offTopic).map((t) => t.name).sort()).toEqual(['Hiring & Recruiting', 'Small Business Operations']);
  });
  it('points an article at a feature page that exists', () => {
    expect(productFeatureFor('reduce-no-shows', 'How to cut no-shows', [])).toBe('appointment-booking');
    expect(productFeatureFor('something', 'unrelated', [])).toBe('ai-assistant');
    for (const f of ['x-whatsapp', 'y-handover', 'z-lead']) expect(featureSlugs.has(productFeatureFor(f, f))).toBe(true);
  });
});

describe('robots and sitemap', () => {
  it('lets crawlers read noindex pages and names the AI crawlers', () => {
    const r = robots();
    const rules = Array.isArray(r.rules) ? r.rules : [r.rules];
    const star = rules.find((x) => x.userAgent === '*')!;
    const disallow = ([] as string[]).concat(star.disallow || []);
    expect(disallow).not.toContain('/login');
    expect(disallow).toContain('/api/');
    expect(disallow).toContain('/media/internal/');
    const agents = rules.flatMap((x) => ([] as string[]).concat(x.userAgent || []));
    for (const a of ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended']) expect(agents).toContain(a);
  });
  it('lists the new pages once, in English only, and not the status page', () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toContain('https://www.crescelo.com/use-case/dental-clinics');
    expect(urls).toContain('https://www.crescelo.com/integrations/whatsapp');
    expect(urls).toContain('https://www.crescelo.com/about');
    expect(urls).toContain('https://www.crescelo.com/custom-ai');
    expect(urls.some((u) => /\/es\/(about|use-case\/dental-clinics|glossary)/.test(u))).toBe(false);
    expect(urls.some((u) => u.endsWith('/status'))).toBe(false);
    expect(new Set(urls).size).toBe(urls.length);
  });
  it('internal media exists and is disallowed from search indexing', async () => {
    const fs = await import('node:fs');
    expect(fs.existsSync('public/media/internal/unanswered-questions-guide-77a5886e.jpg')).toBe(true);
    const r = robots();
    const rules = Array.isArray(r.rules) ? r.rules : [r.rules];
    for (const rule of rules) {
      if (rule.disallow) {
        const disallow = ([] as string[]).concat(rule.disallow);
        expect(disallow.includes('/') || disallow.includes('/media/internal/')).toBe(true);
      }
    }
  });
});
