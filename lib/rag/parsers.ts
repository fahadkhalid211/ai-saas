import mammoth from 'mammoth';
import { parse as parseCsvSync } from 'csv-parse/sync';
import { ExtractedDocument } from './types';

// PDF Parsing with pdf-parse
async function parsePdf(buffer: Buffer, title: string): Promise<ExtractedDocument> {
  try {
    // Dynamic import to avoid SSR issues
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(buffer);
    
    // Normalize newlines and whitespace
    const cleanText = data.text
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return {
      title,
      type: 'pdf',
      content: cleanText,
      metadata: {
        pageCount: data.numpages,
        info: data.info,
      },
    };
  } catch (error: any) {
    console.error('Error parsing PDF:', error);
    throw new Error(`Failed to parse PDF file: ${error?.message || 'Unknown error'}`);
  }
}

// DOCX Parsing with mammoth
async function parseDocx(buffer: Buffer, title: string): Promise<ExtractedDocument> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const cleanText = result.value
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return {
      title,
      type: 'docx',
      content: cleanText,
      metadata: {
        warnings: result.messages,
      },
    };
  } catch (error: any) {
    console.error('Error parsing DOCX:', error);
    throw new Error(`Failed to parse DOCX file: ${error?.message || 'Unknown error'}`);
  }
}

// CSV Parsing with Row-Aware Semantic Serialization
function parseCsv(content: string, title: string): ExtractedDocument {
  try {
    const records = parseCsvSync(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const typedRecords = (records || []) as Record<string, any>[];
    if (!Array.isArray(typedRecords) || typedRecords.length === 0) {
      return {
        title,
        type: 'csv',
        content: content.trim(),
      };
    }

    const headers = Object.keys(typedRecords[0] || {});
    const sections: ExtractedDocument['sections'] = [];
    const serializedRows: string[] = [];

    typedRecords.forEach((row, idx) => {
      // Serialize row cleanly: "Field1: Value1 | Field2: Value2"
      const rowParts: string[] = [];
      for (const [key, val] of Object.entries(row)) {
        if (val !== null && val !== undefined && String(val).trim() !== '') {
          rowParts.push(`${key}: ${String(val).trim()}`);
        }
      }
      const serializedRow = `[Record #${idx + 1}] ${rowParts.join(' | ')}`;
      serializedRows.push(serializedRow);

      sections.push({
        heading: `Record ${idx + 1}`,
        text: serializedRow,
        metadata: {
          row: idx + 1,
          ...row,
        },
      });
    });

    const fullContent = `Dataset: ${title}\nColumns: ${headers.join(', ')}\nTotal Records: ${records.length}\n\n` +
      serializedRows.join('\n');

    return {
      title,
      type: 'csv',
      content: fullContent,
      sections,
      metadata: {
        rowCount: records.length,
        columns: headers,
      },
    };
  } catch (error: any) {
    console.warn('CSV parse warning, falling back to raw text:', error);
    return {
      title,
      type: 'csv',
      content: content.trim(),
    };
  }
}

// JSON Parsing with Hierarchical Flattening
function parseJson(content: string, title: string): ExtractedDocument {
  try {
    const parsed = JSON.parse(content);
    const sections: ExtractedDocument['sections'] = [];
    const textPieces: string[] = [];

    if (Array.isArray(parsed)) {
      parsed.forEach((item, idx) => {
        let itemStr = '';
        if (typeof item === 'object' && item !== null) {
          const parts = Object.entries(item).map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`);
          itemStr = `[Item #${idx + 1}] ${parts.join(' | ')}`;
        } else {
          itemStr = `[Item #${idx + 1}] ${String(item)}`;
        }
        textPieces.push(itemStr);
        sections.push({
          heading: `Item ${idx + 1}`,
          text: itemStr,
          metadata: { itemIndex: idx + 1 },
        });
      });
    } else if (typeof parsed === 'object' && parsed !== null) {
      // Top-level key inspection
      for (const [key, val] of Object.entries(parsed)) {
        let sectionText = '';
        if (typeof val === 'object' && val !== null) {
          sectionText = `${key}:\n${JSON.stringify(val, null, 2)}`;
        } else {
          sectionText = `${key}: ${String(val)}`;
        }
        textPieces.push(sectionText);
        sections.push({
          heading: key,
          text: sectionText,
        });
      }
    } else {
      textPieces.push(String(parsed));
    }

    return {
      title,
      type: 'json',
      content: textPieces.join('\n\n'),
      sections,
      metadata: {
        isArray: Array.isArray(parsed),
      },
    };
  } catch (error: any) {
    console.error('Error parsing JSON:', error);
    throw new Error(`Failed to parse JSON: ${error?.message || 'Invalid JSON syntax'}`);
  }
}

// Image OCR Parsing with Tesseract.js (JPG, PNG, WEBP)
async function parseImage(buffer: Buffer, title: string): Promise<ExtractedDocument> {
  try {
    const Tesseract = await import('tesseract.js');
    const ret = await Tesseract.recognize(buffer, 'eng');

    const cleanText = (ret.data.text || '')
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!cleanText || cleanText.length < 3) {
      throw new Error('Image contains no detectable text. Please upload documents or screenshots with legible text.');
    }

    return {
      title,
      type: 'image',
      content: `[Image Document: ${title}]\n\n` + cleanText,
      metadata: {
        confidence: ret.data.confidence,
      },
    };
  } catch (error: any) {
    console.error('Error parsing Image OCR:', error);
    throw new Error(`Image extraction failed: ${error?.message || 'OCR failed'}`);
  }
}

// Universal parser entry point
export async function parseFileOrText(params: {
  filename: string;
  type: string;
  buffer?: Buffer;
  text?: string;
}): Promise<ExtractedDocument> {
  const { filename, type, buffer, text } = params;
  const lowerName = filename.toLowerCase();

  if (type === 'pdf' || lowerName.endsWith('.pdf')) {
    if (!buffer) throw new Error('PDF buffer required');
    return await parsePdf(buffer, filename);
  }

  if (type === 'docx' || lowerName.endsWith('.docx')) {
    if (!buffer) throw new Error('DOCX buffer required');
    return await parseDocx(buffer, filename);
  }

  // Images (JPG, JPEG, PNG, WEBP)
  const isImage =
    type === 'image' ||
    type === 'jpg' ||
    type === 'jpeg' ||
    type === 'png' ||
    type === 'webp' ||
    /\.(jpe?g|png|webp)$/i.test(lowerName);

  if (isImage) {
    if (!buffer) throw new Error('Image buffer required for OCR');
    return await parseImage(buffer, filename);
  }

  const textContent = text || (buffer ? buffer.toString('utf-8') : '');

  if (type === 'csv' || lowerName.endsWith('.csv')) {
    return parseCsv(textContent, filename);
  }

  if (type === 'json' || lowerName.endsWith('.json')) {
    return parseJson(textContent, filename);
  }

  // Plain text / Markdown / Text Description
  const clean = textContent.replace(/\r\n/g, '\n').trim();
  return {
    title: filename,
    type: (type as any) || 'txt',
    content: clean,
  };
}

