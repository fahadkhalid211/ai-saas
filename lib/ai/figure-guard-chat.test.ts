import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

// What the model is made to say. Each test sets it; the route, the prompt and the guard are the real ones.
let modelReply: string[] = [];
let lastSystemPrompt = '';
vi.mock('@/lib/ai/providers', async (orig) => {
  const actual = await orig<typeof import('@/lib/ai/providers')>();
  return {
    ...actual,
    streamChatResponse: async function* (messages: Array<{ role: string; content: string }>) {
      lastSystemPrompt = messages.find((m) => m.role === 'system')?.content || '';
      for (const t of modelReply) yield t;
    },
  };
});

// the route schedules work for after the response with next/server's after(), which only exists inside a real request
vi.mock('next/server', async (orig) => ({ ...(await orig<typeof import('next/server')>()), after: () => undefined }));

import { Database } from '../db';
import { POST as chat } from '../../app/api/chat/route';

const tag = Math.random().toString(36).slice(2, 8);

beforeAll(() => vi.stubEnv('TRUST_PROXY_HEADERS', 'true'));
afterAll(() => vi.unstubAllEnvs());
beforeEach(() => vi.stubEnv('TRUST_PROXY_HEADERS', 'true'));

/** An agency whose assistant was given no prices at all, like the customer in the report. */
async function agency(extraKnowledge = '') {
  const t = await Database.createTenantWorkspace({ businessName: `Agency ${tag}${Math.random()}`, ownerEmail: `agency-${tag}-${Math.random().toString(36).slice(2, 6)}@example.com`, password: 'a-good-password' });
  await Database.updateWorkspaceBilling(t.workspace.id, { requiresSubscription: false });
  await Database.updateAssistant(t.assistant.id, { provider: 'openai', apiKeyEncrypted: 'sk-test', bookingEnabled: true, systemPrompt: 'You are the assistant of a web design agency.' } as any);
  if (extraKnowledge) await Database.createKnowledgeSource({ assistantId: t.assistant.id, title: 'Services', type: 'txt', status: 'ready' } as any);
  return t.assistant.id as string;
}

async function ask(assistantId: string, question: string) {
  const res = await chat(
    new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': `10.7.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}` },
      body: JSON.stringify({ assistantId, visitorId: `v-${tag}-${Math.random()}`, messages: [{ role: 'user', content: question }] }),
    })
  );
  const text = await res.text();
  let reply = '';
  for (const line of text.split('\n')) {
    if (!line.startsWith('data: ') || line.includes('[DONE]')) continue;
    try {
      const evt = JSON.parse(line.slice(6));
      if (evt.type === 'token') reply += evt.token;
    } catch {
      /* not an event */
    }
  }
  return reply;
}

// the first question loads the local search model, which takes longer than the default test timeout
describe('an agency assistant with no prices in its knowledge', { timeout: 60_000 }, () => {
  it('has a prompt that forbids inventing figures, ahead of the rules that ask for specifics', async () => {
    const id = await agency();
    modelReply = ['We build custom websites.'];
    await ask(id, 'Tell me about your services');
    expect(lastSystemPrompt).toMatch(/NEVER INVENT FIGURES/);
    expect(lastSystemPrompt.indexOf('NEVER INVENT FIGURES')).toBeLessThan(lastSystemPrompt.indexOf('1. You must answer'));
  });

  it('never shows the visitor an invented price or product limit, and offers a person instead', async () => {
    const id = await agency();
    modelReply = [
      'We build custom e-commerce websites. ',
      'A typical online shop starts at $2,500 ',
      'and supports up to 500 products. ',
      'Delivery takes about 4-6 weeks. ',
      'Every business is different.',
    ];
    const reply = await ask(id, 'How much for an ecommerce website and how many products can it have?');
    expect(reply).toContain('We build custom e-commerce websites.');
    expect(reply).toContain('Every business is different.');
    expect(reply).not.toMatch(/\$|2,500|500 products|4-6 weeks/);
    expect(reply).toMatch(/won't guess a number/);
    expect(reply).toMatch(/\[ACTION:BOOKING_FORM\]/);
  });

  it('still lets the visitor\'s own numbers through, and replies with no figures are untouched', async () => {
    const id = await agency();
    modelReply = ['With 300 products, the team can scope a shop for you. Would you like to book a call? [ACTION:BOOKING_FORM]'];
    const reply = await ask(id, 'We sell about 300 products, can you build a shop?');
    expect(reply).toBe('With 300 products, the team can scope a shop for you. Would you like to book a call? [ACTION:BOOKING_FORM]');
  });
});
