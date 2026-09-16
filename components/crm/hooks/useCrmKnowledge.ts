'use client';

import { useState, useRef, useEffect } from 'react';
import { extractAudioFromVideoFile } from '@/lib/media/audioExtractor';

export interface KnowledgeSource {
  id: string;
  title: string;
  type: string;
  chunkCount: number;
  fileSizeBytes?: number;
  status: string;
  errorMessage?: string;
  errorResolution?: string;
  corrections?: Array<{
    id: string;
    type: 'replace' | 'note' | 'edit';
    findText?: string;
    replaceText?: string;
    note?: string;
    appliedAt: string;
  }>;
  createdAt: string;
}

export interface KnowledgeReviewDraft {
  title: string;
  content: string;
  type: string;
  fileSizeBytes?: number;
  originalFileName?: string;
  isEdited?: boolean;
}

interface UseCrmKnowledgeOptions {
  activeAssistant: any;
}

export function useCrmKnowledge({ activeAssistant }: UseCrmKnowledgeOptions) {
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState<string | null>(null);
  const [uploadText, setUploadText] = useState('');
  const [uploadTextTitle, setUploadTextTitle] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sourceFilter, setSourceFilter] = useState('');

  const resetUploaderFiles = () => {
    setSelectedFiles(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Modals & Alerts
  const [failedSourceModal, setFailedSourceModal] = useState<KnowledgeSource | null>(null);
  const [uploadFailureAlert, setUploadFailureAlert] = useState<{
    title: string;
    reason: string;
    whatToDoNext: string;
  } | null>(null);

  // Deletion Confirmation & Status state
  const [deleteConfirmSource, setDeleteConfirmSource] = useState<KnowledgeSource | null>(null);
  const [isDeletingSource, setIsDeletingSource] = useState(false);
  const [recentlyDeletedIds, setRecentlyDeletedIds] = useState<Record<string, boolean>>({});
  const [deleteToast, setDeleteToast] = useState<string | null>(null);

  // URL Ingestion state
  const [urlInput, setUrlInput] = useState('');
  const [urlCustomTitle, setUrlCustomTitle] = useState('');
  const [isImportingUrl, setIsImportingUrl] = useState(false);
  const [urlFeedback, setUrlFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Knowledge Correction Modal state
  const [correctSource, setCorrectSource] = useState<KnowledgeSource | null>(null);
  const [isCorrectModalOpen, setIsCorrectModalOpen] = useState(false);

  // Unanswered Queries (Knowledge Gap Engine) state
  const [unansweredQueries, setUnansweredQueries] = useState<any[]>([]);
  const [resolvingQueryId, setResolvingQueryId] = useState<string | null>(null);
  const [knowledgeAnswerText, setKnowledgeAnswerText] = useState('');
  const [isSavingKnowledgeGap, setIsSavingKnowledgeGap] = useState(false);

  // Two-Stage Ingestion & Review Draft state
  const [reviewDraft, setReviewDraft] = useState<KnowledgeReviewDraft | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStatusText, setExtractionStatusText] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftSaveSuccess, setDraftSaveSuccess] = useState<string | null>(null);

  const fetchKnowledge = async (assistantId: string) => {
    try {
      const res = await fetch(`/api/knowledge?assistantId=${assistantId}`);
      const data = await res.json();
      if (data.sources) {
        setSources((prev) => {
          if (
            prev.length === data.sources.length &&
            prev.every(
              (s, i) =>
                s.id === data.sources[i]?.id &&
                s.status === data.sources[i]?.status &&
                s.chunkCount === data.sources[i]?.chunkCount
            )
          ) {
            return prev;
          }
          return data.sources;
        });
      }
    } catch (err) {
      console.error('Failed to fetch sources:', err);
    }
  };

  // Automatically synchronize knowledge sources whenever active assistant switches
  useEffect(() => {
    if (activeAssistant?.id) {
      setSources([]);
      setReviewDraft(null);
      setUploadFailureAlert(null);
      setUrlFeedback(null);
      setDraftSaveSuccess(null);
      fetchKnowledge(activeAssistant.id);
    }
  }, [activeAssistant?.id]);

  const handleUploadFiles = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssistant) return;
    if ((!selectedFiles || selectedFiles.length === 0) && !uploadText.trim()) return;

    setIsUploading(true);
    setUploadFailureAlert(null);
    setUploadStatusText('Preparing files...');

    try {
      const body = new FormData();
      body.append('assistantId', activeAssistant.id);

      if (selectedFiles) {
        const fileList = Array.from(selectedFiles);
        for (const f of fileList) {
          try {
            const processedFile = await extractAudioFromVideoFile(f, (status) => {
              setUploadStatusText(status);
            });
            // Pass original filename so source preserves the expected name & extension
            body.append('files', processedFile, f.name);
          } catch (extractErr: unknown) {
            const msg = extractErr instanceof Error ? extractErr.message : String(extractErr);
            setUploadFailureAlert({
              title: f.name,
              reason: msg,
              whatToDoNext:
                'Please ensure your video has audible speaking voice or export the audio as MP3/M4A and try again.',
            });
            setIsUploading(false);
            setUploadStatusText(null);
            return;
          }
        }
      }

      if (uploadText.trim()) {
        body.append('text', uploadText.trim());
        body.append('title', uploadTextTitle.trim() || 'Business Knowledge Description');
      }

      setUploadStatusText('Uploading & indexing chunks...');

      const res = await fetch('/api/knowledge/upload', {
        method: 'POST',
        body,
      });

      if (!res.ok) {
        let errorMsg = `Server returned status ${res.status}`;
        let whatToDo = 'Please check the file format and requirements, or try again.';
        try {
          const errData = await res.json();
          if (errData.error) errorMsg = errData.error;
        } catch {
          const text = await res.text().catch(() => '');
          if (res.status === 413 || text.includes('FUNCTION_PAYLOAD_TOO_LARGE')) {
            errorMsg = 'File size exceeds the 4.5MB serverless upload limit.';
            whatToDo =
              'Video files contain heavy video frames. Please export the audio track as an MP3 or M4A file (usually 2-5 MB) and upload it.';
          } else if (res.status === 401) {
            errorMsg = 'Your administrator session has expired.';
            whatToDo = 'Please refresh the page to renew your login session.';
          } else if (res.status === 504) {
            errorMsg = 'The upload timed out while processing.';
            whatToDo = 'For long recordings, export a shorter audio clip (MP3/M4A) and re-upload.';
          } else if (text) {
            errorMsg = text.slice(0, 200);
          }
        }

        setUploadFailureAlert({
          title: selectedFiles?.[0]?.name || uploadTextTitle || 'Upload Failed',
          reason: errorMsg,
          whatToDoNext: whatToDo,
        });
        return;
      }

      const data = await res.json();
      if (data.success) {
        setSelectedFiles(null);
        setUploadText('');
        setUploadTextTitle('');
        await fetchKnowledge(activeAssistant.id);

        const failedList = (data.sources || []).filter((s: any) => s.status === 'failed');
        if (failedList.length > 0) {
          const first = failedList[0];
          setUploadFailureAlert({
            title: first.title,
            reason: first.error || 'Content extraction failed',
            whatToDoNext:
              first.whatToDoNext ||
              'Please check the file format and requirements, or convert the document and try again.',
          });
        } else {
          setUploadFailureAlert(null);
        }
      } else {
        setUploadFailureAlert({
          title: selectedFiles?.[0]?.name || uploadTextTitle || 'Upload Failed',
          reason: data.error || 'Failed to process and index knowledge content.',
          whatToDoNext: 'Please check your AI Engine settings and verify the file is readable.',
        });
      }
    } catch (err: unknown) {
      console.error('Upload error:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      setUploadFailureAlert({
        title: selectedFiles?.[0]?.name || uploadTextTitle || 'Upload Error',
        reason: errMsg || 'A network error occurred while uploading.',
        whatToDoNext: 'Please check your network connection and server status, then try again.',
      });
    } finally {
      resetUploaderFiles();
      setIsUploading(false);
      setUploadStatusText(null);
    }
  };

  const handleExtractContent = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeAssistant) return;

    const fileList = selectedFiles ? Array.from(selectedFiles) : [];
    const hasFiles = fileList.length > 0;
    const hasRawText = Boolean(uploadText.trim());

    if (!hasFiles && !hasRawText) return;

    // Case A: Raw text entered directly
    if (!hasFiles && hasRawText) {
      setReviewDraft({
        title: uploadTextTitle.trim() || 'Business Knowledge Description',
        content: uploadText.trim(),
        type: 'description',
        fileSizeBytes: new Blob([uploadText.trim()]).size,
      });
      setUploadText('');
      setUploadTextTitle('');
      setUploadFailureAlert(null);
      return;
    }

    // Case B: Files selected for extraction
    setIsExtracting(true);
    setUploadFailureAlert(null);
    setDraftSaveSuccess(null);
    setExtractionStatusText('Preparing document...');

    try {
      const extractedSections: string[] = [];
      let detectedType = 'txt';
      let totalBytes = 0;
      let primaryTitle = fileList[0].name;

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        totalBytes += file.size;
        const ext = file.name.split('.').pop()?.toLowerCase() || 'txt';
        const isVideo = ['mp4', 'webm', 'mov', 'mkv', 'avi', 'm4v', '3gp'].includes(ext);
        const isAudio = ['mp3', 'wav', 'm4a', 'ogg', 'flac', 'aac', 'opus', 'wma'].includes(ext);

        let fileToUpload: File = file;

        if (isVideo) {
          setExtractionStatusText(`Extracting audio track locally from ${file.name}...`);
          try {
            fileToUpload = await extractAudioFromVideoFile(file, (status) => {
              setExtractionStatusText(status);
            });
          } catch (extractErr: unknown) {
            const msg = extractErr instanceof Error ? extractErr.message : String(extractErr);
            setUploadFailureAlert({
              title: file.name,
              reason: msg,
              whatToDoNext:
                'Please ensure your video contains spoken dialogue, or export the audio as MP3/M4A and try again.',
            });
            setIsExtracting(false);
            setExtractionStatusText(null);
            return;
          }
        }

        const progressLabel =
          isVideo || isAudio
            ? `Transcribing speech with AI Engine (${file.name})...`
            : ['pdf', 'docx'].includes(ext)
            ? `Extracting text from ${file.name}...`
            : ['jpg', 'jpeg', 'png', 'webp'].includes(ext)
            ? `Reading text with Vision AI & OCR (${file.name})...`
            : `Reading ${file.name}...`;

        setExtractionStatusText(progressLabel);

        const formData = new FormData();
        formData.append('assistantId', activeAssistant.id);
        formData.append('file', fileToUpload, file.name);

        const res = await fetch('/api/knowledge/extract', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.success) {
          const reason = data?.error || `Extraction server returned status ${res.status}`;
          const nextStep =
            data?.whatToDoNext ||
            (res.status === 413
              ? 'File exceeds upload limit. Please export a smaller segment and try again.'
              : 'Please verify document format or check server AI settings.');

          setUploadFailureAlert({
            title: file.name,
            reason,
            whatToDoNext: nextStep,
          });
          setIsExtracting(false);
          setExtractionStatusText(null);
          return;
        }

        detectedType = data.type || (isVideo ? 'video' : isAudio ? 'audio' : ext);
        if (fileList.length > 1) {
          extractedSections.push(`=== Source Document: ${file.name} ===\n\n${data.content}`);
        } else {
          extractedSections.push(data.content);
        }
      }

      const combinedContent = extractedSections.join('\n\n\n');
      if (fileList.length > 1) {
        primaryTitle = `${fileList[0].name} (+${fileList.length - 1} more)`;
      }

      setReviewDraft({
        title: primaryTitle,
        content: combinedContent,
        type: fileList.length > 1 ? 'multi-source' : detectedType,
        fileSizeBytes: totalBytes,
        originalFileName: fileList[0].name,
      });

      // Clear the selected file from uploader input
      resetUploaderFiles();
      setUploadFailureAlert(null);
    } catch (err: unknown) {
      console.error('Extraction error:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      setUploadFailureAlert({
        title: fileList[0]?.name || 'Extraction Error',
        reason: errMsg || 'Failed to extract content from file.',
        whatToDoNext: 'Please check your connection, verify document is not corrupted, and try again.',
      });
    } finally {
      setIsExtracting(false);
      setExtractionStatusText(null);
    }
  };

  const handleSaveReviewDraft = async () => {
    if (!activeAssistant || !reviewDraft || !reviewDraft.content.trim()) return;

    setIsSavingDraft(true);
    setUploadFailureAlert(null);
    setDraftSaveSuccess(null);

    try {
      const formData = new FormData();
      formData.append('assistantId', activeAssistant.id);
      formData.append('text', reviewDraft.content.trim());
      formData.append('title', reviewDraft.title.trim() || 'Reviewed Knowledge Document');
      formData.append('sourceType', reviewDraft.type || 'txt');
      if (reviewDraft.fileSizeBytes) {
        formData.append('fileSizeBytes', String(reviewDraft.fileSizeBytes));
      }

      const res = await fetch('/api/knowledge/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        const firstFailed = data?.sources?.find((s: any) => s.status === 'failed');
        setUploadFailureAlert({
          title: reviewDraft.title,
          reason: firstFailed?.error || data?.error || 'Failed to index knowledge into database.',
          whatToDoNext:
            firstFailed?.whatToDoNext || 'Please check database connectivity or try saving again.',
        });
        return;
      }

      await fetchKnowledge(activeAssistant.id);
      setDraftSaveSuccess(`Successfully indexed "${reviewDraft.title}" into knowledge base!`);
      setTimeout(() => setDraftSaveSuccess(null), 6000);
      setReviewDraft(null);
    } catch (saveErr: unknown) {
      console.error('Save review draft error:', saveErr);
      const errMsg = saveErr instanceof Error ? saveErr.message : String(saveErr);
      setUploadFailureAlert({
        title: reviewDraft.title,
        reason: errMsg || 'Network error while saving knowledge.',
        whatToDoNext: 'Please verify server status and try again.',
      });
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleDiscardReviewDraft = () => {
    setReviewDraft(null);
    setDraftSaveSuccess(null);
  };

  const handleExtractUrl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeAssistant || !urlInput.trim()) return;

    setIsExtracting(true);
    setUrlFeedback(null);
    setUploadFailureAlert(null);
    setExtractionStatusText('Fetching and extracting content from URL...');

    try {
      const res = await fetch('/api/knowledge/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId: activeAssistant.id,
          url: urlInput.trim(),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        setUrlFeedback({
          type: 'error',
          message: data?.error || 'Failed to extract content from this URL.',
        });
        return;
      }

      setReviewDraft({
        title: urlCustomTitle.trim() || data.title || urlInput.trim(),
        content: data.content || '',
        type: data.type || 'web',
        fileSizeBytes: data.fileSizeBytes,
      });

      setUrlInput('');
      setUrlCustomTitle('');
      setUrlFeedback({
        type: 'success',
        message: 'Content extracted! Please review and verify the text below before saving.',
      });
      setTimeout(() => setUrlFeedback(null), 5000);
    } catch (err: unknown) {
      console.error('URL extraction error:', err);
      setUrlFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Network error extracting URL content.',
      });
    } finally {
      setIsExtracting(false);
      setExtractionStatusText(null);
    }
  };

  const handleImportUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssistant || !urlInput.trim()) return;

    setIsImportingUrl(true);
    setUrlFeedback(null);

    try {
      const res = await fetch('/api/knowledge/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId: activeAssistant.id,
          url: urlInput.trim(),
          customTitle: urlCustomTitle.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setUrlFeedback({
          type: 'success',
          message: `Successfully indexed "${data.source.title}" (${data.source.chunks} chunks generated)!`,
        });
        setUrlInput('');
        setUrlCustomTitle('');
        await fetchKnowledge(activeAssistant.id);
        setTimeout(() => setUrlFeedback(null), 5000);
      } else {
        setUrlFeedback({
          type: 'error',
          message: data.error || 'Failed to extract knowledge from this URL.',
        });
        if (data.source) {
          setUploadFailureAlert({
            title: data.source.title,
            reason: data.error,
            whatToDoNext: data.whatToDoNext,
          });
        }
        fetchKnowledge(activeAssistant.id);
      }
    } catch (err: any) {
      setUrlFeedback({
        type: 'error',
        message: err?.message || 'Network error importing URL.',
      });
    } finally {
      setIsImportingUrl(false);
    }
  };

  const handleDeleteSource = (sourceOrId: KnowledgeSource | string) => {
    if (typeof sourceOrId === 'string') {
      const found = sources.find((s) => s.id === sourceOrId);
      if (found) {
        setDeleteConfirmSource(found);
      } else {
        setDeleteConfirmSource({
          id: sourceOrId,
          title: 'Knowledge Source',
          type: 'doc',
          status: 'ready',
          chunkCount: 0,
          createdAt: new Date().toISOString(),
        });
      }
    } else {
      setDeleteConfirmSource(sourceOrId);
    }
  };

  const confirmDeleteSource = async () => {
    if (!deleteConfirmSource) return;
    const target = deleteConfirmSource;
    setIsDeletingSource(true);
    try {
      // Mark as deleted immediately in local list so status displays 'Deleted'
      setRecentlyDeletedIds((prev) => ({ ...prev, [target.id]: true }));
      setSources((prev) =>
        prev.map((s) => (s.id === target.id ? { ...s, status: 'deleted' } : s))
      );
      setDeleteToast(`Status: Deleted - "${target.title}" was removed.`);

      await fetch(`/api/knowledge?id=${target.id}`, { method: 'DELETE' });

      // Close modal
      setDeleteConfirmSource(null);

      // Keep showing 'Deleted' status for 2.5 seconds before removing from list
      setTimeout(() => {
        setSources((prev) => prev.filter((s) => s.id !== target.id));
        setRecentlyDeletedIds((prev) => {
          const copy = { ...prev };
          delete copy[target.id];
          return copy;
        });
      }, 2500);
      setTimeout(() => setDeleteToast(null), 5000);
    } catch (err) {
      console.error('Failed to delete source:', err);
    } finally {
      setIsDeletingSource(false);
    }
  };

  const handleOpenCorrectionModal = (source: KnowledgeSource) => {
    setCorrectSource(source);
    setIsCorrectModalOpen(true);
  };

  const fetchUnansweredQueries = async (assistantId: string) => {
    try {
      const res = await fetch(`/api/analytics/unanswered?assistantId=${assistantId}`);
      const data = await res.json();
      if (data.unanswered) {
        setUnansweredQueries(data.unanswered);
      }
    } catch (err) {
      console.error('Failed to fetch unanswered queries:', err);
    }
  };

  const handleResolveUnansweredQuery = async (
    id: string,
    action: 'resolve' | 'delete' | 'addKnowledge',
    query?: string
  ) => {
    if (!activeAssistant) return;
    try {
      if (action === 'addKnowledge') {
        if (!knowledgeAnswerText.trim()) return;
        setIsSavingKnowledgeGap(true);
      }
      const res = await fetch('/api/analytics/unanswered', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          assistantId: activeAssistant.id,
          action,
          query,
          answer: action === 'addKnowledge' ? knowledgeAnswerText.trim() : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (action === 'addKnowledge') {
          setResolvingQueryId(null);
          setKnowledgeAnswerText('');
          await fetchKnowledge(activeAssistant.id);
        }
        await fetchUnansweredQueries(activeAssistant.id);
      }
    } catch (err) {
      console.error('Error updating unanswered query:', err);
    } finally {
      setIsSavingKnowledgeGap(false);
    }
  };

  return {
    sources,
    setSources,
    isUploading,
    uploadStatusText,
    uploadText,
    setUploadText,
    uploadTextTitle,
    setUploadTextTitle,
    selectedFiles,
    setSelectedFiles,
    fileInputRef,
    resetUploaderFiles,
    sourceFilter,
    setSourceFilter,
    failedSourceModal,
    setFailedSourceModal,
    uploadFailureAlert,
    setUploadFailureAlert,
    deleteConfirmSource,
    setDeleteConfirmSource,
    isDeletingSource,
    confirmDeleteSource,
    recentlyDeletedIds,
    deleteToast,
    setDeleteToast,
    urlInput,
    setUrlInput,
    urlCustomTitle,
    setUrlCustomTitle,
    isImportingUrl,
    urlFeedback,
    setUrlFeedback,
    correctSource,
    setCorrectSource,
    isCorrectModalOpen,
    setIsCorrectModalOpen,
    unansweredQueries,
    setUnansweredQueries,
    resolvingQueryId,
    setResolvingQueryId,
    knowledgeAnswerText,
    setKnowledgeAnswerText,
    isSavingKnowledgeGap,
    fetchKnowledge,
    handleUploadFiles,
    handleImportUrl,
    handleDeleteSource,
    handleOpenCorrectionModal,
    fetchUnansweredQueries,
    handleResolveUnansweredQuery,
    // Two-Stage Ingestion & Review Draft
    reviewDraft,
    setReviewDraft,
    isExtracting,
    extractionStatusText,
    isSavingDraft,
    draftSaveSuccess,
    setDraftSaveSuccess,
    handleExtractContent,
    handleSaveReviewDraft,
    handleDiscardReviewDraft,
    handleExtractUrl,
  };
}
