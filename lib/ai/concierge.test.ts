import { describe, it, expect } from 'vitest';
import { getPlatformConciergeAnswer } from './concierge';
import { BILLING_PLANS } from '@/lib/billing/plans';
import { GUIDES } from '@/lib/platform/guides';
import { searchGuides, guideChunks } from '@/lib/platform/knowledge';

describe('Crescelo assistant: hand-written guides', () => {
  it('explains that AI usage carries no markup', () => {
    const answer = getPlatformConciergeAnswer('How does zero token markup work?');
    expect(answer).toMatch(/no markup/i);
    expect(answer).toMatch(/own key/i);
  });

  it('walks through connecting each provider', () => {
    expect(getPlatformConciergeAnswer('How do I connect OpenAI?')).toContain('platform.openai.com');
    expect(getPlatformConciergeAnswer('connect claude')).toContain('Anthropic');
    expect(getPlatformConciergeAnswer('how to use gemini')).toContain('aistudio.google.com');
    expect(getPlatformConciergeAnswer('groq api key')).toContain('console.groq.com');
    expect(getPlatformConciergeAnswer('run a local model with ollama')).toContain('OLLAMA_ORIGINS');
  });

  it('explains the knowledge base', () => {
    const answer = getPlatformConciergeAnswer('How do I add a knowledge base to my assistant?');
    expect(answer).toContain('Knowledge Base');
    expect(answer).toContain('PDF');
  });

  it('gives the real embed code and the WordPress steps', () => {
    expect(getPlatformConciergeAnswer('How do I embed the chat widget on my website?')).toContain('widget.js');
    expect(getPlatformConciergeAnswer('add it to wordpress with elementor')).toContain('Elementor');
  });

  it('quotes prices from the plan table, never stale ones', () => {
    const answer = getPlatformConciergeAnswer('What are your pricing plans?');
    for (const p of BILLING_PLANS) {
      expect(answer).toContain(p.name);
      expect(answer).toContain(`$${p.monthlyPrice}`);
    }
    expect(answer).not.toMatch(/\$19\b|\$29\b|\$79\b|\$199\b/);
  });

  it('states the trial terms accurately: a card is required', () => {
    const answer = getPlatformConciergeAnswer('do I need a credit card for the free trial?');
    expect(answer).toMatch(/card is required/i);
    expect(answer).toContain('14-day');
  });

  it('is honest about calendar sync', () => {
    const answer = getPlatformConciergeAnswer('does it sync with google calendar?');
    expect(answer).toMatch(/not available yet/i);
    expect(answer).toMatch(/read-only/i);
  });

  it('sends people to support tickets, not to a mailbox', () => {
    const all = GUIDES.map((g) => g.body).join('\n') + getPlatformConciergeAnswer('how do I contact support');
    expect(all).not.toMatch(/@crescelo\.com/);
    expect(getPlatformConciergeAnswer('how do I contact support')).toContain('/support/contact');
  });

  it('falls back to a topic overview for things it has no guide for', () => {
    const answer = getPlatformConciergeAnswer('zzzz qqqq');
    expect(answer).toContain('I can walk you through');
  });

  it('every guide is findable by its own title', () => {
    for (const g of GUIDES) {
      const ids = searchGuides(g.title, 3).map((h) => h.guide.id);
      expect(ids, g.title).toContain(g.id);
    }
  });

  it('exposes the guides as chunks for the website assistant', () => {
    const chunks = guideChunks();
    expect(chunks).toHaveLength(GUIDES.length);
    expect(new Set(chunks.map((c) => c.id)).size).toBe(chunks.length);
    expect(chunks.every((c) => c.assistantId === 'demo-assistant' && c.content.length > 60)).toBe(true);
  });
});
