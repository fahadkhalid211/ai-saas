'use client';

import { useState } from 'react';
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
  const [sourceFilter, setSourceFilter] = useState('');

  // Modals & Alerts
  const [failedSourceModal, setFailedSourceModal] = useState<KnowledgeSource | null>(null);
  const [uploadFailureAlert, setUploadFailureAlert] = useState<{
    title: string;
    reason: string;
    whatToDoNext: string;
  } | null>(null);

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
      setIsUploading(false);
      setUploadStatusText(null);
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

  const handleDeleteSource = async (id: string) => {
    try {
      await fetch(`/api/knowledge?id=${id}`, { method: 'DELETE' });
      setSources((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Failed to delete source:', err);
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
    sourceFilter,
    setSourceFilter,
    failedSourceModal,
    setFailedSourceModal,
    uploadFailureAlert,
    setUploadFailureAlert,
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
  };
}
