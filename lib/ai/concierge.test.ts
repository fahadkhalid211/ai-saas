import { describe, it, expect } from 'vitest';
import { getPlatformConciergeAnswer } from './concierge';

describe('Crescelo Platform Concierge Engine', () => {
  it('answers questions about Zero Token Markup', () => {
    const answer = getPlatformConciergeAnswer('How does Zero Token Markup work?');
    expect(answer).toContain('Zero Token Markup');
    expect(answer).toContain('0% Token Markup');
    expect(answer).toContain('BYOK');
  });

  it('answers questions about connecting models and API keys', () => {
    const answer = getPlatformConciergeAnswer('How do I connect Google Gemini or OpenAI?');
    expect(answer).toContain('Google Gemini');
    expect(answer).toContain('OpenAI');
    expect(answer).toContain('AI Engine (BYOK)');
  });

  it('answers questions about knowledge base training and RAG', () => {
    const answer = getPlatformConciergeAnswer('How do I add a knowledge base to my assistant?');
    expect(answer).toContain('Knowledge Base');
    expect(answer).toContain('PDF');
  });

  it('answers questions about embedding the chat widget', () => {
    const answer = getPlatformConciergeAnswer('How do I embed the chat widget on my website?');
    expect(answer).toContain('<script src="https://crescelo.com/widget.js"');
    expect(answer).toContain('Embed & Widget');
  });

  it('answers questions about pricing and subscription plans', () => {
    const answer = getPlatformConciergeAnswer('What are your pricing plans?');
    expect(answer).toContain('Starter ($19 / month)');
    expect(answer).toContain('Pro ($49 / month)');
    expect(answer).toContain('Enterprise ($149 / month)');
  });

  it('provides a helpful general introduction on greetings', () => {
    const answer = getPlatformConciergeAnswer('Hello, who are you?');
    expect(answer).toContain('Crescelo Platform Concierge');
    expect(answer).toContain('Zero Token Markup');
  });
});
