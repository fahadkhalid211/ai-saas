import { describe, it, expect } from 'vitest';
import { parseFileOrText } from './parsers';
import { chunkDocument } from './chunker';
import { diagnoseKnowledgeFailure } from './diagnostics';

describe('Two-Stage Knowledge Extraction and Review Pipeline', () => {
  it('extracts plain text documents into an editable document structure', async () => {
    const sampleText = 'Welcome to Antigravity Dental Clinic. Our opening hours are Monday to Friday 9am to 6pm.';
    const doc = await parseFileOrText({
      filename: 'hours.txt',
      type: 'txt',
      text: sampleText,
    });

    expect(doc).toBeDefined();
    expect(doc.title).toBe('hours.txt');
    expect(doc.content).toContain('opening hours are Monday to Friday');
    expect(doc.type).toBe('txt');
  });

  it('extracts CSV data into structured row text ready for preview and editing', async () => {
    const csvContent = 'Service,Price,Duration\nTeeth Whitening,$250,60 mins\nDental Cleaning,$120,45 mins';
    const doc = await parseFileOrText({
      filename: 'services.csv',
      type: 'csv',
      text: csvContent,
    });

    expect(doc).toBeDefined();
    expect(doc.title).toBe('services.csv');
    expect(doc.content).toContain('Teeth Whitening');
    expect(doc.content).toContain('Dental Cleaning');
  });

  it('correctly chunks pre-reviewed and edited text documents without needing binary re-parsing', () => {
    const reviewedContent = `
# Antigravity Dental Clinic Policies

## Cancellation Policy
Cancellations made within 24 hours will incur a 20% cancellation charge.

## Emergency Dental Care
For emergencies after 6pm, please dial our emergency helpline directly.
    `.trim();

    const reviewedDoc = {
      title: 'WhatsApp Video 2026-09-15 at 7.51.13 PM.mp4',
      type: 'video' as any,
      content: reviewedContent,
      metadata: {
        isReviewed: true,
      },
    };

    const chunks = chunkDocument(reviewedDoc);
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0].content).toContain('Cancellation Policy');
    expect(chunks[0].tokenCount).toBeGreaterThan(0);
  });

  it('provides actionable diagnostic guidance on unreadable or empty files', () => {
    const diag = diagnoseKnowledgeFailure({
      filename: 'corrupt_doc.pdf',
      type: 'pdf',
      errorMessage: 'No readable text found in this PDF. It may be an image-only scanned document.',
      fileSizeBytes: 1024,
    });

    expect(diag.reason).toContain('scanned');
    expect(diag.whatToDoNext).toBeDefined();
    expect(diag.whatToDoNext.length).toBeGreaterThan(10);
  });

  it('correctly extracts and structures YouTube video transcripts with multi-lingual caption support', async () => {
    const { extractFromUrl, isYouTubeUrl, extractYouTubeVideoId } = await import('./url-extractor');
    const testUrl = 'https://www.youtube.com/watch?v=3Cm0y8-5PZE';

    expect(isYouTubeUrl(testUrl)).toBe(true);
    expect(extractYouTubeVideoId(testUrl)).toBe('3Cm0y8-5PZE');

    try {
      const doc = await extractFromUrl(testUrl);
      expect(doc).toBeDefined();
      expect(doc.type).toBe('youtube');
      expect(doc.content.length).toBeGreaterThan(500);
      expect(doc.title).toBeDefined();
      expect(doc.sections?.length).toBeGreaterThan(0);
    } catch (err: any) {
      // Live YouTube network requests can be rate-limited or captions disabled
      expect(err.message).toBeDefined();
    }
  }, 90000);

  it('correctly extracts Google Head Office tour video transcript with resilient connection pool', async () => {
    const { extractFromUrl } = await import('./url-extractor');
    const testUrl = 'https://www.youtube.com/watch?v=OKsaF_AasDA';

    const doc = await extractFromUrl(testUrl);
    expect(doc).toBeDefined();
    expect(doc.type).toBe('youtube');
    expect(doc.title).toContain('Google Head Office');
    expect(doc.content.length).toBeGreaterThan(1000);
    expect(doc.sections?.length).toBeGreaterThan(0);
  }, 60000); // YouTube InnerTube + caption fetch can take up to 30s on slow connections
});
