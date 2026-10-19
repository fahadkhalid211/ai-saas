import { describe, expect, it } from 'vitest';
import { parseModelQuestions, questionsFromKnowledge, samplePassages, suggestForAssistant, topicOfTitle } from './suggest-questions';

const dental = {
  sources: [
    { id: 's1', title: 'Beacon Dental - Patient Guide.pdf', status: 'ready' },
    { id: 's2', title: 'Fees and insurance.docx', status: 'ready' },
  ],
  chunks: [
    { knowledgeSourceId: 's1', content: 'We are open Monday to Friday 8am to 5pm. Please book an appointment online or by phone. Parking is available behind the clinic.' },
    { knowledgeSourceId: 's2', content: 'A check-up costs $85. We accept most dental insurance plans and can bill your provider directly. Payment methods: card or invoice.' },
  ],
};

describe('questions built from the knowledge base (no model)', () => {
  it('asks only about what the documents cover, and nothing from another industry', () => {
    const qs = questionsFromKnowledge(dental.sources, dental.chunks);
    expect(qs.length).toBeGreaterThanOrEqual(3);
    expect(qs.length).toBeLessThanOrEqual(4);
    expect(qs).toEqual(expect.arrayContaining(['How much does it cost?', 'What are your opening hours?']));
    expect(qs.join(' ')).not.toMatch(/haircut|barber|beard|fade/i);
    // delivery is not mentioned anywhere in these documents, so it is not offered
    expect(qs).not.toContain('How long does delivery take?');
  });

  it('offers a delivery question for a shop whose documents talk about delivery', () => {
    const qs = questionsFromKnowledge(
      [{ id: 'a', title: 'Shipping & returns', status: 'ready' }],
      [{ knowledgeSourceId: 'a', content: 'Delivery takes 3-5 days. Returns are free within 30 days for a full refund.' }]
    );
    expect(qs).toEqual(expect.arrayContaining(['How long does delivery take?', 'What is your return and refund policy?']));
  });

  it('has nothing to ask when there are no documents', () => {
    expect(questionsFromKnowledge([], [])).toEqual([]);
  });

  it('falls back to the titles of the documents when no common topic appears', () => {
    const qs = questionsFromKnowledge(
      [{ id: 'a', title: 'Quarterly Maintenance Handbook.pdf', status: 'ready' }],
      [{ knowledgeSourceId: 'a', content: 'Torque the bolts to the listed values and log the result.' }]
    );
    expect(qs).toEqual(['What does Quarterly Maintenance Handbook cover?']);
  });

  it('ignores sources that failed to process when naming topics', () => {
    const qs = questionsFromKnowledge(
      [{ id: 'a', title: 'Broken Upload.pdf', status: 'failed' }],
      [{ knowledgeSourceId: 'a', content: 'plain text with no topic words at all here' }]
    );
    expect(qs.join(' ')).not.toContain('Broken Upload');
  });
});

describe('titles', () => {
  it('turns a file name into a topic, and drops names that say nothing', () => {
    expect(topicOfTitle('Services & Pricing 2026.pdf')).toBe('Services & Pricing 2026');
    expect(topicOfTitle('Beacon Dental - Patient Guide.pdf')).toBe('Beacon Dental');
    expect(topicOfTitle('https://www.acme-roofing.com')).toBe('acme-roofing');
    expect(topicOfTitle('a1b2c3d4e5f6a7b8c9d0e1f2')).toBe('');
    expect(topicOfTitle('Untitled')).toBe('');
  });
});

describe('model replies', () => {
  it('keeps only proper short questions and no more than four', () => {
    const reply = 'Here you go: ["1. How much is a check-up?", "Opening hours", "Do you accept insurance?", "Where is the clinic?", "Can I book online?", "Is parking available?"]';
    expect(parseModelQuestions(reply)).toEqual(['How much is a check-up?', 'Do you accept insurance?', 'Where is the clinic?', 'Can I book online?']);
  });

  it('copes with a reply that is not JSON', () => {
    expect(parseModelQuestions('Sorry, I cannot help with that.')).toEqual([]);
    expect(parseModelQuestions('[not json')).toEqual([]);
  });

  it('samples passages from every source, not only the first', () => {
    const text = samplePassages(dental.sources, dental.chunks);
    expect(text).toContain('Beacon Dental');
    expect(text).toContain('Fees and insurance');
  });
});

describe('suggestForAssistant', () => {
  it('uses the assistant\'s own engine when it answers with usable questions', async () => {
    const out = await suggestForAssistant(dental.sources, dental.chunks, async () => '["How much is a check-up?","Do you take insurance?","When are you open?"]');
    expect(out.method).toBe('ai');
    expect(out.questions).toHaveLength(3);
  });

  it('falls back to questions built from the documents when the engine fails or answers badly', async () => {
    const failing = await suggestForAssistant(dental.sources, dental.chunks, async () => {
      throw new Error('quota exceeded');
    });
    expect(failing.method).toBe('knowledge');
    expect(failing.questions.length).toBeGreaterThan(0);
    const garbage = await suggestForAssistant(dental.sources, dental.chunks, async () => 'no questions here');
    expect(garbage.method).toBe('knowledge');
  });

  it('works with no engine at all, and returns nothing for an empty knowledge base', async () => {
    expect((await suggestForAssistant(dental.sources, dental.chunks)).method).toBe('knowledge');
    expect(await suggestForAssistant([], [], async () => '["x?"]')).toEqual({ questions: [], method: 'knowledge' });
  });
});
