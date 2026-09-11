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
