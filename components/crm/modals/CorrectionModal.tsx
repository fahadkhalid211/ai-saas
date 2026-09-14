'use client';

import React, { useState, useEffect } from 'react';
import {
  Wand2,
  X,
  ShieldCheck,
  FileEdit,
  History as HistoryIcon,
  Search,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { KnowledgeSource } from '@/components/crm/KnowledgeTab';

export interface CorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  correctSource: KnowledgeSource | null;
  activeAssistantId?: string;
  onSuccess?: () => void | Promise<void>;
}

export const CorrectionModal: React.FC<CorrectionModalProps> = ({
  isOpen,
  onClose,
  correctSource,
  activeAssistantId,
  onSuccess,
}) => {
  const [correctionTab, setCorrectionTab] = useState<'replace' | 'override' | 'editor' | 'history'>('replace');
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [overrideNote, setOverrideNote] = useState('');
  const [fullSourceText, setFullSourceText] = useState('');
  const [sourceChunks, setSourceChunks] = useState<any[]>([]);
  const [pastCorrections, setPastCorrections] = useState<any[]>([]);
  const [isLoadingCorrectionData, setIsLoadingCorrectionData] = useState(false);
  const [isSavingCorrection, setIsSavingCorrection] = useState(false);
  const [correctionSuccessMsg, setCorrectionSuccessMsg] = useState<string | null>(null);
  const [correctionErrorMsg, setCorrectionErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !correctSource) return;

    setCorrectionTab('replace');
    setFindText('');
    setReplaceText('');
    setOverrideNote('');
    setCorrectionSuccessMsg(null);
    setCorrectionErrorMsg(null);
    setIsLoadingCorrectionData(true);

    fetch('/api/knowledge/correct?sourceId=' + correctSource.id)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load correction data');
        setSourceChunks(data.chunks || []);
        setFullSourceText(data.fullText || '');
        setPastCorrections(data.corrections || []);
      })
      .catch((err: any) => {
        setCorrectionErrorMsg(err.message || 'Failed to load source chunks');
      })
      .finally(() => {
        setIsLoadingCorrectionData(false);
      });
  }, [isOpen, correctSource]);

  async function handleApplyCorrection(action: 'find_replace' | 'add_override_note' | 'edit_content') {
    if (!correctSource) return;
    setIsSavingCorrection(true);
    setCorrectionSuccessMsg(null);
    setCorrectionErrorMsg(null);
    try {
      const payload: any = {
        sourceId: correctSource.id,
        action,
      };
      if (action === 'find_replace') {
        if (!findText.trim()) {
          setCorrectionErrorMsg('Please specify the term to find.');
          setIsSavingCorrection(false);
          return;
        }
        payload.findText = findText;
        payload.replaceText = replaceText;
      } else if (action === 'add_override_note') {
        if (!overrideNote.trim()) {
          setCorrectionErrorMsg('Please enter the override note or authoritative fact.');
          setIsSavingCorrection(false);
          return;
        }
        payload.note = overrideNote;
      } else if (action === 'edit_content') {
        if (!fullSourceText.trim()) {
          setCorrectionErrorMsg('Content cannot be empty.');
          setIsSavingCorrection(false);
          return;
        }
        payload.fullText = fullSourceText;
      }

      const res = await fetch('/api/knowledge/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Correction failed');

      setCorrectionSuccessMsg(data.message || 'Correction applied and vector embeddings updated successfully!');

      const refreshRes = await fetch('/api/knowledge/correct?sourceId=' + correctSource.id);
      const refreshData = await refreshRes.json();
      if (refreshRes.ok) {
        setSourceChunks(refreshData.chunks || []);
        setFullSourceText(refreshData.fullText || '');
        setPastCorrections(refreshData.corrections || []);
      }

      if (onSuccess) {
        await onSuccess();
      }

      if (action === 'find_replace') {
        setFindText('');
        setReplaceText('');
      } else if (action === 'add_override_note') {
        setOverrideNote('');
      }
    } catch (err: any) {
      setCorrectionErrorMsg(err.message || 'Failed to apply correction');
    } finally {
      setIsSavingCorrection(false);
    }
  }

  if (!isOpen || !correctSource) return null;

  return (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
            <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in duration-150">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 p-5 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50">
                    <Wand2 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                        Knowledge Correction &amp; Fact Patching
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {correctSource.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md" title={correctSource.title}>
                      {correctSource.title} · {sourceChunks.length || correctSource.chunkCount} active vector chunks
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onClose()}
                  className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Subheader / Tabs */}
              <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <button
                  type="button"
                  onClick={() => setCorrectionTab('replace')}
                  className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-medium border-b-2 transition cursor-pointer ${
                    correctionTab === 'replace'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  <span>Phonetic &amp; Term Replace</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCorrectionTab('override')}
                  className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-medium border-b-2 transition cursor-pointer ${
                    correctionTab === 'override'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Authoritative Fact Override</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCorrectionTab('editor')}
                  className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-medium border-b-2 transition cursor-pointer ${
                    correctionTab === 'editor'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  <FileEdit className="h-3.5 w-3.5" />
                  <span>Direct Text Editor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCorrectionTab('history')}
                  className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-medium border-b-2 transition cursor-pointer ${
                    correctionTab === 'history'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  <HistoryIcon className="h-3.5 w-3.5" />
                  <span>History</span>
                  {pastCorrections.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                      {pastCorrections.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Body */}
              <div className="p-5 overflow-y-auto space-y-4 flex-1">
                {/* Alerts */}
                {correctionSuccessMsg && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 animate-in fade-in">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{correctionSuccessMsg}</span>
                  </div>
                )}
                {correctionErrorMsg && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 animate-in fade-in">
                    <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                    <span>{correctionErrorMsg}</span>
                  </div>
                )}

                {isLoadingCorrectionData ? (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
                    <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
                    <span className="text-xs">Loading chunks and vectors...</span>
                  </div>
                ) : (
                  <>
                    {/* TAB 1: Phonetic & Term Replace */}
                    {correctionTab === 'replace' && (
                      <div className="space-y-4">
                        <div className="bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-xl p-3.5 text-xs text-slate-600 dark:text-slate-300">
                          <p className="font-semibold text-indigo-950 dark:text-indigo-200 mb-1">
                            Fix Misheard Words &amp; Typos Across Embeddings
                          </p>
                          <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                            Did speech-to-text transcribe someone&apos;s name or product incorrectly (e.g. &ldquo;Jon Dough&rdquo; instead of &ldquo;John Doe&rdquo;)? Enter the misheard phrase and the correct term. We will update the text across all chunks and automatically recalculate high-dimensional vector embeddings in-place without re-uploading the file.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              Word / Phrase to Find
                            </label>
                            <input
                              type="text"
                              value={findText}
                              onChange={(e) => setFindText(e.target.value)}
                              placeholder="e.g. Jon Dough or $49"
                              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              Corrected Replacement
                            </label>
                            <input
                              type="text"
                              value={replaceText}
                              onChange={(e) => setReplaceText(e.target.value)}
                              placeholder="e.g. John Doe or $59"
                              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        </div>

                        {/* Live match indicator */}
                        {(() => {
                          if (!findText.trim()) return null;
                          let occurrences = 0;
                          let matchingChunks = 0;
                          try {
                            const regex = new RegExp(findText.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                            sourceChunks.forEach((c) => {
                              const m = (c.content || '').match(regex);
                              if (m && m.length > 0) {
                                occurrences += m.length;
                                matchingChunks++;
                              }
                            });
                          } catch (e) {}

                          return (
                            <div className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                              occurrences > 0
                                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200'
                                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                            }`}>
                              <span className="flex items-center gap-1.5 font-medium">
                                <Search className="h-3.5 w-3.5" />
                                {occurrences > 0
                                  ? `Found ${occurrences} occurrence(s) across ${matchingChunks} chunk(s)`
                                  : `No occurrences of "${findText.trim()}" found in current chunks`}
                              </span>
                              {occurrences > 0 && replaceText && (
                                <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                                  Will replace with &ldquo;{replaceText}&rdquo;
                                </span>
                              )}
                            </div>
                          );
                        })()}

                        <button
                          type="button"
                          disabled={isSavingCorrection || !findText.trim()}
                          onClick={() => handleApplyCorrection('find_replace')}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
                        >
                          {isSavingCorrection ? (
                            <>
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              <span>Updating Chunks &amp; Vector Embeddings...</span>
                            </>
                          ) : (
                            <>
                              <Wand2 className="h-3.5 w-3.5" />
                              <span>Apply Replacement &amp; Re-Index Vectors</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* TAB 2: Fact Override Note */}
                    {correctionTab === 'override' && (
                      <div className="space-y-4">
                        <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-xl p-3.5 text-xs text-slate-600 dark:text-slate-300">
                          <p className="font-semibold text-emerald-950 dark:text-emerald-200 mb-1">
                            Official Fact &amp; Knowledge Override
                          </p>
                          <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                            Have an authoritative policy change or crucial fact that should supersede any outdated audio/video transcription or legacy document statement? Write it here. An official override banner will be injected into this source&apos;s vector embeddings with maximum retrieval weight.
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Official Correction / Rule
                          </label>
                          <textarea
                            rows={4}
                            value={overrideNote}
                            onChange={(e) => setOverrideNote(e.target.value)}
                            placeholder="e.g. As of 2026, the gym closes at 11 PM on weekends instead of 10 PM. Personal training sessions are $65/hr."
                            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        <button
                          type="button"
                          disabled={isSavingCorrection || !overrideNote.trim()}
                          onClick={() => handleApplyCorrection('add_override_note')}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
                        >
                          {isSavingCorrection ? (
                            <>
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              <span>Embedding Override Rule...</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="h-3.5 w-3.5" />
                              <span>Inject Authoritative Override &amp; Re-Index</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* TAB 3: Direct Text Editor */}
                    {correctionTab === 'editor' && (
                      <div className="space-y-4">
                        <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-xs text-slate-600 dark:text-slate-300">
                          <p className="font-semibold text-slate-900 dark:text-white mb-1">
                            Full Document Text Editor
                          </p>
                          <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                            View or edit the full synthesized text of this knowledge source. Saving will regenerate chunk boundaries and fresh vector embeddings across the entire document.
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Document Content ({fullSourceText.length} characters)
                          </label>
                          <textarea
                            rows={10}
                            value={fullSourceText}
                            onChange={(e) => setFullSourceText(e.target.value)}
                            className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        <button
                          type="button"
                          disabled={isSavingCorrection || !fullSourceText.trim()}
                          onClick={() => handleApplyCorrection('edit_content')}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
                        >
                          {isSavingCorrection ? (
                            <>
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              <span>Re-chunking &amp; Re-indexing Vectors...</span>
                            </>
                          ) : (
                            <>
                              <FileEdit className="h-3.5 w-3.5" />
                              <span>Save &amp; Re-chunk Entire Document</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* TAB 4: History */}
                    {correctionTab === 'history' && (
                      <div className="space-y-3">
                        {pastCorrections.length === 0 ? (
                          <div className="py-8 text-center text-slate-400 text-xs">
                            No corrections or overrides have been applied to this knowledge source yet.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {pastCorrections.map((corr: any, idx: number) => (
                              <div
                                key={corr.id || idx}
                                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                                    {corr.type === 'replace' ? 'Term Replacement' : corr.type === 'note' ? 'Fact Override' : 'Text Edit'}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {corr.appliedAt ? new Date(corr.appliedAt).toLocaleString() : 'Recent'}
                                  </span>
                                </div>
                                {corr.findText && (
                                  <div className="text-slate-600 dark:text-slate-300 text-[11px]">
                                    Replaced <code className="text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-1 py-0.5 rounded">{corr.findText}</code> with <code className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1 py-0.5 rounded">{corr.replaceText}</code>
                                  </div>
                                )}
                                {corr.note && (
                                  <p className="text-slate-600 dark:text-slate-300 text-[11px] italic">
                                    &ldquo;{corr.note}&rdquo;
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <button
                  type="button"
                  onClick={() => onClose()}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
  );
};
