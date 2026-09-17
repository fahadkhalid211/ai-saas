import { ExtractedDocument, ChunkItem } from './types';

interface ChunkerOptions {
  maxChunkCharacters?: number; // default ~1800 chars (~450 tokens)
  chunkOverlap?: number;       // default ~200 chars (~50 tokens)
}

export function chunkDocument(
  doc: ExtractedDocument,
  options: ChunkerOptions = {}
): ChunkItem[] {
  const maxChars = options.maxChunkCharacters || 1800;
  const overlap = options.chunkOverlap || 200;
  const chunks: ChunkItem[] = [];

  // Case 1: Document already parsed into distinct sections (like CSV rows or JSON items)
  if (doc.sections && doc.sections.length > 0) {
    let currentBatch: string[] = [];
    let currentLength = 0;
    let sectionIndex = 0;

    for (let i = 0; i < doc.sections.length; i++) {
      const section = doc.sections[i];
      const sectionText = section.heading ? `### ${section.heading}\n${section.text}` : section.text;

      // If this section is explicitly marked as isOverview, emit it standalone as Chunk 0
      if (section.metadata?.isOverview) {
        if (currentBatch.length > 0) {
          const batchContent = currentBatch.join('\n\n');
          chunks.push({
            content: batchContent,
            chunkIndex: chunks.length,
            tokenCount: Math.ceil(batchContent.length / 4),
            metadata: {
              sourceTitle: doc.title,
              sourceType: doc.type,
              section: `Batch ${sectionIndex++}`,
            },
          });
          currentBatch = [];
          currentLength = 0;
        }

        chunks.push({
          content: sectionText,
          chunkIndex: chunks.length,
          tokenCount: Math.ceil(sectionText.length / 4),
          metadata: {
            sourceTitle: doc.title,
            sourceType: doc.type,
            section: 'Dataset Overview',
            isOverview: true,
            ...section.metadata,
          },
        });
        continue;
      }
      if (sectionText.length > maxChars) {
        if (currentBatch.length > 0) {
          const batchContent = currentBatch.join('\n\n');
          chunks.push({
            content: batchContent,
            chunkIndex: chunks.length,
            tokenCount: Math.ceil(batchContent.length / 4),
            metadata: {
              sourceTitle: doc.title,
              sourceType: doc.type,
              section: `Batch ${sectionIndex++}`,
            },
          });
          currentBatch = [];
          currentLength = 0;
        }

        const subChunks = splitTextByDelimiters(sectionText, maxChars, overlap);
        subChunks.forEach((sub) => {
          chunks.push({
            content: sub,
            chunkIndex: chunks.length,
            tokenCount: Math.ceil(sub.length / 4),
            metadata: {
              sourceTitle: doc.title,
              sourceType: doc.type,
              section: section.heading || `Section ${i + 1}`,
              ...section.metadata,
            },
          });
        });
        continue;
      }

      // Group small sections together until maxChars is reached
      if (currentLength + sectionText.length > maxChars && currentBatch.length > 0) {
        const batchContent = currentBatch.join('\n\n');
        chunks.push({
          content: batchContent,
          chunkIndex: chunks.length,
          tokenCount: Math.ceil(batchContent.length / 4),
          metadata: {
            sourceTitle: doc.title,
            sourceType: doc.type,
            section: `Records batch ${sectionIndex++}`,
          },
        });
        currentBatch = [];
        currentLength = 0;
      }

      currentBatch.push(sectionText);
      currentLength += sectionText.length;
    }

    if (currentBatch.length > 0) {
      const batchContent = currentBatch.join('\n\n');
      chunks.push({
        content: batchContent,
        chunkIndex: chunks.length,
        tokenCount: Math.ceil(batchContent.length / 4),
        metadata: {
          sourceTitle: doc.title,
          sourceType: doc.type,
          section: `Records batch ${sectionIndex}`,
        },
      });
    }

    return chunks;
  }

  // Case 2: Standard unstructured text (PDF, DOCX, TXT, Description)
  // Check if document contains Markdown headings or clear section delimiters
  const structuralSections = extractStructuralSections(doc.content);
  if (structuralSections.length > 0) {
    // Structure-aware: keep headings with their content
    for (let sIdx = 0; sIdx < structuralSections.length; sIdx++) {
      const sec = structuralSections[sIdx];
      const trimmedText = (sec.text || '').trim();
      if (!trimmedText) continue;

      const secHeading = sec.heading ? sec.heading.trim() : undefined;
      const secText = secHeading ? `### ${secHeading}\n\n${trimmedText}` : trimmedText;

      if (secText.length <= maxChars) {
        chunks.push({
          content: secText,
          chunkIndex: chunks.length,
          tokenCount: Math.ceil(secText.length / 4),
          metadata: {
            sourceTitle: doc.title,
            sourceType: doc.type,
            section: secHeading || `Section ${sIdx + 1}`,
            ...doc.metadata,
          },
        });
      } else {
        const headerReserve = secHeading ? secHeading.length + 30 : 0;
        const subChunks = splitTextByDelimiters(trimmedText, maxChars - headerReserve, overlap);
        subChunks.forEach((sub, subIdx) => {
          const subContent = secHeading
            ? `### ${secHeading}${subChunks.length > 1 ? ` (Part ${subIdx + 1})` : ''}\n\n${sub}`
            : sub;
          chunks.push({
            content: subContent,
            chunkIndex: chunks.length,
            tokenCount: Math.ceil(subContent.length / 4),
            metadata: {
              sourceTitle: doc.title,
              sourceType: doc.type,
              section: secHeading || `Section ${sIdx + 1}`,
              ...doc.metadata,
            },
          });
        });
      }
    }
    if (chunks.length > 0) {
      return chunks;
    }
  }

  // Fallback: Standard unstructured text splitting
  const rawChunks = splitTextByDelimiters(doc.content, maxChars, overlap);
  rawChunks.forEach((chunkText, idx) => {
    chunks.push({
      content: chunkText,
      chunkIndex: idx,
      tokenCount: Math.ceil(chunkText.length / 4),
      metadata: {
        sourceTitle: doc.title,
        sourceType: doc.type,
        ...doc.metadata,
      },
    });
  });

  return chunks;
}

/**
 * Extracts structural sections from markdown or formatted document text
 * based on headings (#, ##, ###), Q&A prefixes, or uppercase section titles.
 */
export function extractStructuralSections(text: string): { heading?: string; text: string }[] {
  if (!text || !text.trim()) return [];
  const lines = text.split('\n');
  const sections: { heading?: string; text: string }[] = [];
  let currentHeading: string | undefined;
  let currentLines: string[] = [];

  const flush = (nextHeading?: string) => {
    const joined = currentLines.join('\n').trim();
    if (joined) {
      sections.push({
        heading: currentHeading,
        text: joined,
      });
      currentHeading = nextHeading;
    } else if (currentHeading && nextHeading) {
      currentHeading = `${currentHeading}: ${nextHeading}`;
    } else if (nextHeading) {
      currentHeading = nextHeading;
    }
    currentLines = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Match Markdown headings (# Title, ## Section, ### Sub)
    const mdMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    // Match Q&A patterns (Q: ... or Question: ...)
    const qaMatch = trimmed.match(/^(Q(?:uestion)?:\s*.+)$/i);
    // Match All-Caps section headers (e.g. "PRICING & PACKAGES", "TERMS OF SERVICE:")
    const allCapsMatch =
      trimmed.length >= 4 &&
      trimmed.length <= 60 &&
      /^[A-Z0-9\s:_\-–&]{4,60}:?$/.test(trimmed) &&
      /[A-Z]/.test(trimmed);

    if (mdMatch || qaMatch || allCapsMatch) {
      const detected = mdMatch ? mdMatch[2].trim() : trimmed.replace(/:$/, '');
      flush(detected);
    } else {
      currentLines.push(line);
    }
  }

  flush();
  return sections;
}

function splitTextByDelimiters(text: string, maxChars: number, overlap: number): string[] {
  if (!text || text.trim() === '') return [];
  if (text.length <= maxChars) return [text.trim()];

  const paragraphs = text.split(/\n\s*\n/);
  const result: string[] = [];
  let currentChunk = '';

  for (const para of paragraphs) {
    const trimmedPara = para.trim();
    if (!trimmedPara) continue;

    if (trimmedPara.length > maxChars) {
      // Paragraph itself is larger than chunk size: split into sentences
      const sentences = trimmedPara.split(/(?<=[.?!])\s+/);
      for (const sent of sentences) {
        if (currentChunk.length + sent.length + 1 <= maxChars) {
          currentChunk += (currentChunk ? ' ' : '') + sent;
        } else {
          if (currentChunk) result.push(currentChunk.trim());
          currentChunk = sent;
        }
      }
    } else {
      if (currentChunk.length + trimmedPara.length + 2 <= maxChars) {
        currentChunk += (currentChunk ? '\n\n' : '') + trimmedPara;
      } else {
        if (currentChunk) result.push(currentChunk.trim());
        currentChunk = trimmedPara;
      }
    }
  }

  if (currentChunk) {
    result.push(currentChunk.trim());
  }

  // Add overlap if multiple chunks
  if (result.length > 1 && overlap > 0) {
    const overlapping: string[] = [];
    for (let i = 0; i < result.length; i++) {
      if (i === 0) {
        overlapping.push(result[i]);
      } else {
        const prevChunk = result[i - 1];
        const overlapSnippet = prevChunk.slice(-overlap);
        overlapping.push(overlapSnippet + '\n' + result[i]);
      }
    }
    return overlapping;
  }

  return result;
}
