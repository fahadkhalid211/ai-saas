import { describe, it, expect } from 'vitest';
import { chunkDocument, extractStructuralSections } from './chunker';
import { ExtractedDocument } from './types';

describe('Structure-Aware Document Chunking', () => {
  it('should extract sections based on markdown headings', () => {
    const text = `
# Company Overview
Crescelo empowers businesses with conversational intelligence.

## Pricing Plans
Starter plan is $29/mo. Pro plan is $79/mo. Enterprise is custom.

### Support & SLA
All tiers include 99.9% uptime SLA and email support.
    `.trim();

    const sections = extractStructuralSections(text);
    expect(sections.length).toBe(3);
    expect(sections[0].heading).toBe('Company Overview');
    expect(sections[1].heading).toBe('Pricing Plans');
    expect(sections[2].heading).toBe('Support & SLA');
  });

  it('should preserve heading context in generated chunks', () => {
    const doc: ExtractedDocument = {
      title: 'Business Policy',
      type: 'pdf',
      content: `
# Booking Policy
Appointments can be rescheduled up to 24 hours in advance without any fee.

# Cancellation Policy
Cancellations made within 2 hours of the scheduled time incur a 50% deposit charge.
      `.trim(),
    };

    const chunks = chunkDocument(doc, { maxChunkCharacters: 500 });
    expect(chunks.length).toBe(2);
    expect(chunks[0].content).toContain('### Booking Policy');
    expect(chunks[0].metadata.section).toBe('Booking Policy');
    expect(chunks[1].content).toContain('### Cancellation Policy');
    expect(chunks[1].metadata.section).toBe('Cancellation Policy');
  });

  it('should subdivide oversized sections while maintaining heading prefix', () => {
    const longParagraph = 'Our firm specializes in commercial real estate litigation and property dispute resolution. '.repeat(15);
    const doc: ExtractedDocument = {
      title: 'Legal Services',
      type: 'docx',
      content: `
# Real Estate Practice
${longParagraph}
# Tax Law
We assist corporate clients with tax compliance and audits.
      `.trim(),
    };

    const chunks = chunkDocument(doc, { maxChunkCharacters: 350 });
    expect(chunks.length).toBeGreaterThan(2);
    // Every sub-chunk of Real Estate Practice should retain the heading
    const realEstateChunks = chunks.filter((c) => c.metadata.section === 'Real Estate Practice');
    expect(realEstateChunks.length).toBeGreaterThan(1);
    for (const c of realEstateChunks) {
      expect(c.content).toContain('### Real Estate Practice');
    }
  });
});
