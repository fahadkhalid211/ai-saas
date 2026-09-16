import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { parseFileOrText, isMediaFile, isVideoFile, isAudioFile } from '@/lib/rag/parsers';
import { extractFromUrl } from '@/lib/rag/url-extractor';
import { diagnoseKnowledgeFailure } from '@/lib/rag/diagnostics';
import { withAdminAuth } from '@/lib/security/auth';
import { validateSafeExternalUrl } from '@/lib/security/ssrf';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export const POST = withAdminAuth(async (req: Request) => {
  let activeFilename = 'unknown';
  let activeType = 'txt';
  let activeFileSize = 0;

  try {
    const contentType = req.headers.get('content-type') || '';
    let assistantId = '';
    let file: File | null = null;
    let url = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      assistantId = (formData.get('assistantId') as string) || '';
      file = formData.get('file') as File | null;
      url = (formData.get('url') as string) || '';
    } else if (contentType.includes('application/json')) {
      const body = await req.json();
      assistantId = body.assistantId || '';
      url = body.url || '';
    }

    if (!assistantId) {
      return NextResponse.json({ success: false, error: 'assistantId is required' }, { status: 400 });
    }

    const assistant = await Database.getAssistantById(assistantId);
    if (!assistant) {
      return NextResponse.json({ success: false, error: 'Assistant not found' }, { status: 404 });
    }

    // Extraction Mode 1: File Extraction (PDF, DOCX, CSV, Image, Audio, Video)
    if (file && file.size > 0) {
      activeFilename = file.name;
      activeFileSize = file.size;
      const ext = activeFilename.split('.').pop()?.toLowerCase() || 'txt';
      activeType = ext;

      const isVideo = isVideoFile(activeFilename) || ['mp4', 'webm', 'mov', 'mkv', 'avi', 'm4v', '3gp'].includes(ext);
      const isAudio = isAudioFile(activeFilename) || ['mp3', 'wav', 'm4a', 'ogg', 'flac', 'aac', 'opus', 'wma'].includes(ext);
      const detectedType = isVideo ? 'video' : isAudio ? 'audio' : ext;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const timeoutMs = isVideo || isAudio ? 270_000 : 90_000;
      const parsePromise = parseFileOrText({
        filename: activeFilename,
        type: ext,
        buffer,
        options: {
          apiKey: assistant.apiKeyEncrypted,
          provider: assistant.provider,
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error(`File processing timed out after ${Math.round(timeoutMs / 1000)} seconds`)),
          timeoutMs
        )
      );

      const doc = await Promise.race([parsePromise, timeoutPromise]);

      const extractedContent = doc.content ? doc.content.trim() : '';
      if (!extractedContent) {
        throw new Error('No readable text content could be extracted from this file.');
      }

      return NextResponse.json({
        success: true,
        title: activeFilename,
        type: detectedType,
        content: extractedContent,
        fileSizeBytes: activeFileSize,
        metadata: {
          ...doc.metadata,
          pageCount: (doc.metadata as any)?.pageCount,
          sectionCount: doc.sections?.length || 0,
        },
      });
    }

    // Extraction Mode 2: URL Extraction (YouTube, Webpage, Direct media stream)
    if (url && url.trim()) {
      const cleanUrl = url.trim();
      activeFilename = cleanUrl;
      activeType = 'web';

      const ssrfCheck = await validateSafeExternalUrl(cleanUrl);
      if (!ssrfCheck.safe) {
        return NextResponse.json(
          { success: false, error: ssrfCheck.error || 'Target URL points to an internal or forbidden address.' },
          { status: 400 }
        );
      }

      const doc = await extractFromUrl(cleanUrl, {
        apiKey: assistant.apiKeyEncrypted,
        provider: assistant.provider,
      });

      const extractedContent = doc.content ? doc.content.trim() : '';
      if (!extractedContent) {
        throw new Error('No readable text content could be extracted from this URL.');
      }

      return NextResponse.json({
        success: true,
        title: doc.title || cleanUrl,
        type: doc.type || 'web',
        content: extractedContent,
        fileSizeBytes: Buffer.byteLength(extractedContent, 'utf-8'),
        metadata: {
          url: cleanUrl,
          ...doc.metadata,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'A file or URL must be provided for extraction.' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error(`Extraction failed for ${activeFilename}:`, error);

    const diag = diagnoseKnowledgeFailure({
      filename: activeFilename,
      type: activeType,
      errorMessage: error?.message,
      fileSizeBytes: activeFileSize,
    });

    return NextResponse.json(
      {
        success: false,
        title: activeFilename,
        error: diag.reason,
        whatToDoNext: diag.whatToDoNext,
      },
      { status: 422 }
    );
  }
});
