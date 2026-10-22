import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { BILLING_PLANS } from '@/lib/billing/plans';
import { parseFileOrText, isMediaFile, isVideoFile, isAudioFile } from '@/lib/rag/parsers';
import { extractFromUrl, isYouTubeUrl, YOUTUBE_NOT_SUPPORTED_MESSAGE } from '@/lib/rag/url-extractor';
import { applyCostCapToMedia } from '@/lib/ai/spend/guard';
import { diagnoseKnowledgeFailure } from '@/lib/rag/diagnostics';
import { withAdminAuth, getAuthContext } from '@/lib/security/auth';
import { validateSafeExternalUrl } from '@/lib/security/ssrf';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import { logged } from '@/lib/logging/route';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const POSTHandler = withAdminAuth(async (req: Request) => {
  const rateLimit = enforceRateLimit(req, 'knowledge-extract', { windowMs: 60 * 1000, max: 15 });
  if (rateLimit.errorResponse) return rateLimit.errorResponse;

  let activeFilename = 'unknown';
  let activeType = 'txt';
  let activeFileSize = 0;

  try {
    const ctx = await getAuthContext(req);
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

    const assistant = await Database.getAssistantById(assistantId, ctx.workspaceId);
    if (!assistant) {
      return NextResponse.json({ success: false, error: 'Assistant not found or forbidden' }, { status: 404 });
    }

    // Storage Quota Enforcement
    const targetWorkspaceId = assistant.workspaceId || (ctx.workspaceId !== '*' ? ctx.workspaceId : 'default-workspace');
    const wsBilling = await Database.getWorkspaceBilling(targetWorkspaceId);
    const plan = BILLING_PLANS.find((p) => p.id === wsBilling.planId) || BILLING_PLANS[0];
    const storageLimitMb = plan.knowledgeStorageLimitMb;
    const storageLimitBytes = storageLimitMb * 1024 * 1024;
    const currentStorage = await Database.getWorkspaceKnowledgeStorage(targetWorkspaceId);

    if (currentStorage.totalBytes >= storageLimitBytes) {
      return NextResponse.json(
        {
          success: false,
          storageLimitReached: true,
          error: `Knowledge Base storage limit reached. Your ${plan.name} plan includes ${storageLimitMb} MB of knowledge storage (Current: ${currentStorage.totalMb} MB used). Upgrade your plan to extract and index new knowledge.`,
          currentStorageMb: currentStorage.totalMb,
          limitMb: storageLimitMb,
          planName: plan.name,
          planId: plan.id,
        },
        { status: 403 }
      );
    }

    // Extraction Mode 1: File Extraction (PDF, DOCX, CSV, Image, Audio, Video)
    if (file && file.size > 0) {
      if (currentStorage.totalBytes + file.size > storageLimitBytes) {
        const currentMb = currentStorage.totalMb;
        const incomingMb = Number((file.size / (1024 * 1024)).toFixed(2));
        return NextResponse.json(
          {
            success: false,
            storageLimitReached: true,
            error: `File size (${incomingMb} MB) exceeds remaining Knowledge Base storage. Your ${plan.name} plan includes ${storageLimitMb} MB of storage (Current: ${currentMb} MB used). Upgrade your plan to increase capacity.`,
            currentStorageMb: currentMb,
            limitMb: storageLimitMb,
            incomingMb,
            planName: plan.name,
            planId: plan.id,
          },
          { status: 403 }
        );
      }
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
      // images and audio are read by AI on the assistant's key, so they count toward its monthly cost cap
      const media = await applyCostCapToMedia(assistant, { apiKey: assistant.apiKeyEncrypted, provider: assistant.provider });
      const parsePromise = parseFileOrText({
        filename: activeFilename,
        type: ext,
        buffer,
        options: media.options,
      }).finally(() => media.settle());

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

    // Extraction Mode 2: URL Extraction (Webpage, Direct media stream)
    if (url && url.trim()) {
      const cleanUrl = url.trim();
      activeFilename = cleanUrl;
      activeType = 'web';

      if (isYouTubeUrl(cleanUrl)) {
        return NextResponse.json({ success: false, error: YOUTUBE_NOT_SUPPORTED_MESSAGE }, { status: 400 });
      }

      const ssrfCheck = await validateSafeExternalUrl(cleanUrl);
      if (!ssrfCheck.safe) {
        return NextResponse.json(
          { success: false, error: ssrfCheck.error || 'Target URL points to an internal or forbidden address.' },
          { status: 400 }
        );
      }

      const media = await applyCostCapToMedia(assistant, { apiKey: assistant.apiKeyEncrypted, provider: assistant.provider });
      const doc = await extractFromUrl(cleanUrl, media.options).finally(() => media.settle());

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

export const POST = logged(POSTHandler, { route: '/api/knowledge/extract' });
