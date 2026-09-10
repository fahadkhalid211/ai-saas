export interface FailureDiagnostic {
  reason: string;
  whatToDoNext: string;
  category: 'media' | 'pdf' | 'size' | 'auth' | 'content' | 'general';
  actionLabel?: string;
}

/**
 * Universal diagnostics engine for knowledge ingestion errors.
 * Explains clearly WHY a file failed and provides actionable steps for WHAT the user should do next.
 */
export function diagnoseKnowledgeFailure(params: {
  filename: string;
  type?: string;
  errorMessage?: string;
  fileSizeBytes?: number;
}): FailureDiagnostic {
  const { filename, type = '', errorMessage = '', fileSizeBytes } = params;
  const lowerMsg = errorMessage.toLowerCase();
  const ext = filename.split('.').pop()?.toLowerCase() || type.toLowerCase();

  const isVideo = ['mp4', 'webm', 'mov', 'mkv', 'avi', 'm4v', '3gp', 'video'].includes(ext);
  const isAudio = ['mp3', 'wav', 'm4a', 'ogg', 'flac', 'aac', 'opus', 'wma', 'audio'].includes(ext);
  const isMedia = isVideo || isAudio;

  // 1. File Size Limit Exceeded (> 25MB for media Whisper APIs)
  if (
    lowerMsg.includes('exceeding the 25mb limit') ||
    lowerMsg.includes('exceeds the 25mb') ||
    lowerMsg.includes('maximum size') ||
    (fileSizeBytes && fileSizeBytes > 25 * 1024 * 1024 && isMedia)
  ) {
    const sizeMb = fileSizeBytes ? (fileSizeBytes / (1024 * 1024)).toFixed(1) : '25+';
    return {
      category: 'size',
      reason: `File size (${sizeMb} MB) exceeds the 25MB cloud transcription limit. Video files store heavy visual frames that consume large bandwidth.`,
      whatToDoNext:
        'Since the AI only needs the spoken explanation, export just the audio track as an MP3 or M4A file (using QuickTime, VLC, or any free audio converter). Audio files are usually 90% smaller (2-5 MB) and transcribe in seconds.',
      actionLabel: 'Export Audio as MP3 / M4A',
    };
  }

  // 2. Unsupported media format / Groq Whisper whitelist rejection
  if (
    lowerMsg.includes('file must be one of the following types') ||
    lowerMsg.includes('unsupported media') ||
    lowerMsg.includes('invalid media') ||
    lowerMsg.includes('codec')
  ) {
    return {
      category: 'media',
      reason: `The cloud speech engine could not demux the container format for "${filename}". Certain QuickTime (.mov) or MKV video encodings use non-standard audio codecs.`,
      whatToDoNext:
        'We have updated the transcriber with automatic container mapping. You can re-upload your file now, or export an MP3, WAV, or MP4 version for 100% compatibility.',
      actionLabel: 'Re-upload or Convert to MP4/MP3',
    };
  }

  // 3. No speech or audible voice detected
  if (
    lowerMsg.includes('no speech') ||
    lowerMsg.includes('no readable text') && isMedia ||
    lowerMsg.includes('empty transcription')
  ) {
    return {
      category: 'content',
      reason: `The transcription engine completed, but detected no audible spoken speech in "${filename}".`,
      whatToDoNext:
        'Verify that your video or audio recording has clear, audible speaking (not just background music or silence). Check your microphone input volume and re-upload a recording with clear narration.',
      actionLabel: 'Upload Video with Clear Speech',
    };
  }

  // 4. Scanned or Image-only PDF with no text layer
  if (
    (ext === 'pdf' || type === 'pdf') &&
    (lowerMsg.includes('image-only scanned document') ||
      lowerMsg.includes('no readable text found') ||
      lowerMsg.includes('no text'))
  ) {
    return {
      category: 'pdf',
      reason: `This PDF appears to be a scanned photocopy or flattened image without an embedded digital text layer.`,
      whatToDoNext:
        'Export the document with selectable text enabled (OCR), or convert the pages into PNG/JPEG screenshots and upload them so our built-in OCR engine can extract the text.',
      actionLabel: 'Upload as Images (OCR) or Text PDF',
    };
  }

  // 5. Image OCR failed / unreadable
  if (
    ['jpg', 'jpeg', 'png', 'webp', 'image'].includes(ext) ||
    lowerMsg.includes('ocr') ||
    lowerMsg.includes('image extraction failed')
  ) {
    return {
      category: 'content',
      reason: `The OCR vision model could not extract legible text from this image.`,
      whatToDoNext:
        'Ensure the image is clear, high-contrast, and contains readable typography (e.g. clean screenshots of brochures, policy documents, or feature tables).',
      actionLabel: 'Upload Clear Screenshot or Document',
    };
  }

  // 6. Groq / OpenAI API Key or Authentication Error
  if (
    lowerMsg.includes('groq api key required') ||
    lowerMsg.includes('openai api key required') ||
    lowerMsg.includes('invalid api key') ||
    lowerMsg.includes('401') ||
    lowerMsg.includes('unauthorized')
  ) {
    return {
      category: 'auth',
      reason: `The speech transcription service was unable to authenticate because a valid API key was not provided or has expired.`,
      whatToDoNext:
        'Go to the "AI Engine" tab in the dashboard, enter your free Groq API key (starts with "gsk_..."), and save your changes. Groq Whisper is free and processes speech in milliseconds.',
      actionLabel: 'Configure Groq API Key',
    };
  }

  // 7. Rate Limits or Quota Exceeded (429)
  if (lowerMsg.includes('429') || lowerMsg.includes('rate limit') || lowerMsg.includes('quota')) {
    return {
      category: 'auth',
      reason: `The AI provider reached its temporary rate limit or quota.`,
      whatToDoNext:
        'Please wait 30 seconds and click "Retry Upload", or switch to another API key in the AI Engine settings.',
      actionLabel: 'Wait and Retry',
    };
  }

  // 8. Corrupted or unparseable CSV / JSON
  if (ext === 'csv' || ext === 'json' || lowerMsg.includes('json') || lowerMsg.includes('csv')) {
    return {
      category: 'content',
      reason: `The tabular or structured file could not be parsed: ${errorMessage.replace(/^Error:\s*/, '')}`,
      whatToDoNext:
        'Open the file in Excel or VS Code, verify the syntax has valid headers and rows, save as UTF-8 CSV or standard JSON, and re-upload.',
      actionLabel: 'Check File Syntax & Re-upload',
    };
  }

  // 9. Generic Fallback
  const cleanError = errorMessage.replace(/^Error:\s*/i, '').trim();
  return {
    category: 'general',
    reason: cleanError || 'An unexpected error occurred while parsing and indexing this file.',
    whatToDoNext:
      'Check that the file is not empty or corrupted. You can also re-save the document as standard PDF, MP4, MP3, or TXT, and upload it again.',
    actionLabel: 'Re-upload File',
  };
}
