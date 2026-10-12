import { T, useT } from '@/lib/i18n/context';
import React from 'react';
import {
  RefreshCw,
  AlertTriangle,
  Upload,
  Sparkles,
  Globe,
  CheckCircle2,
  Search,
  Wand2,
  Trash2,
  X,
  FileText,
  Check,
  Edit3,
  Bot,
  ShieldCheck,
  Plus,
  HardDrive,
} from 'lucide-react';
import type { KnowledgeReviewDraft, KnowledgeStorageUsage } from './hooks/useCrmKnowledge';

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

export interface KnowledgeTabProps {
  activeAssistant: any;
  assistants?: any[];
  setActiveAssistant?: (assistant: any) => void;
  handleDeleteAssistant?: (assistantId: string) => Promise<void> | void;
  onOpenNewAssistantModal?: () => void;
  fetchKnowledge: (assistantId: string, forceFresh?: boolean) => Promise<void>;
  isSyncingSources?: boolean;
  uploadFailureAlert: any;
  setUploadFailureAlert: (alert: any) => void;
  handleUploadFiles: (e: React.FormEvent) => Promise<void>;
  selectedFiles: FileList | null;
  setSelectedFiles: (files: FileList | null) => void;
  fileInputRef?: React.RefObject<HTMLInputElement | null>;
  resetUploaderFiles?: () => void;
  uploadTextTitle: string;
  setUploadTextTitle: (title: string) => void;
  uploadText: string;
  setUploadText: (text: string) => void;
  isUploading: boolean;
  uploadStatusText?: string | null;
  handleImportUrl: (e: React.FormEvent) => Promise<void>;
  urlInput: string;
  setUrlInput: (url: string) => void;
  urlCustomTitle: string;
  setUrlCustomTitle: (title: string) => void;
  sourceFilter: string;
  setSourceFilter: (filter: string) => void;
  sources: KnowledgeSource[];
  setFailedSourceModal: (source: KnowledgeSource) => void;
  handleOpenCorrectionModal: (source: KnowledgeSource) => void;
  handleDeleteSource: (sourceOrId: KnowledgeSource | string) => void | Promise<void>;
  deleteConfirmSource?: KnowledgeSource | null;
  setDeleteConfirmSource?: (source: KnowledgeSource | null) => void;
  isDeletingSource?: boolean;
  confirmDeleteSource?: () => Promise<void>;
  recentlyDeletedIds?: Record<string, boolean>;
  deleteToast?: string | null;
  setDeleteToast?: (toast: string | null) => void;
  isImportingUrl: boolean;
  urlFeedback: { type: 'success' | 'error'; message: string } | null;
  reviewDraft?: KnowledgeReviewDraft | null;
  setReviewDraft?: React.Dispatch<React.SetStateAction<KnowledgeReviewDraft | null>>;
  isExtracting?: boolean;
  extractionStatusText?: string | null;
  isSavingDraft?: boolean;
  draftSaveSuccess?: string | null;
  setDraftSaveSuccess?: (msg: string | null) => void;
  handleExtractContent?: (e?: React.FormEvent) => Promise<void>;
  handleSaveReviewDraft?: () => Promise<void>;
  handleDiscardReviewDraft?: () => void;
  handleExtractUrl?: (e?: React.FormEvent) => Promise<void>;
  storageUsage?: KnowledgeStorageUsage | null;
}

export const KnowledgeTab: React.FC<KnowledgeTabProps> = ({
  activeAssistant,
  assistants,
  setActiveAssistant,
  handleDeleteAssistant,
  onOpenNewAssistantModal,
  fetchKnowledge,
  isSyncingSources = false,
  uploadFailureAlert,
  setUploadFailureAlert,
  handleUploadFiles,
  selectedFiles,
  setSelectedFiles,
  fileInputRef,
  resetUploaderFiles,
  storageUsage,
  uploadTextTitle,
  setUploadTextTitle,
  uploadText,
  setUploadText,
  isUploading,
  uploadStatusText,
  handleImportUrl,
  urlInput,
  setUrlInput,
  urlCustomTitle,
  setUrlCustomTitle,
  sourceFilter,
  setSourceFilter,
  sources,
  setFailedSourceModal,
  handleOpenCorrectionModal,
  handleDeleteSource,
  deleteConfirmSource,
  setDeleteConfirmSource,
  isDeletingSource,
  confirmDeleteSource,
  recentlyDeletedIds,
  deleteToast,
  setDeleteToast,
  isImportingUrl,
  urlFeedback,
  reviewDraft,
  setReviewDraft,
  isExtracting = false,
  extractionStatusText,
  isSavingDraft = false,
  draftSaveSuccess,
  setDraftSaveSuccess,
  handleExtractContent,
  handleSaveReviewDraft,
  handleDiscardReviewDraft,
  handleExtractUrl,
}) => {
  const __t = useT();
  const totalChunks = sources.reduce((sum, s) => sum + (s.chunkCount || 0), 0);
  const readySources = sources.filter((s) => s.status === 'ready');
  const failedSources = sources.filter((s) => s.status === 'failed');
  const processingSources = sources.filter((s) => s.status === 'processing');
  const pctIndexed = sources.length > 0 ? Math.round((readySources.length / sources.length) * 100) : 0;
  const filteredSources = sources.filter((s) =>
    s.title.toLowerCase().includes(sourceFilter.toLowerCase())
  );
  return (
              <div className="max-w-5xl space-y-6 mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white"><T>Knowledge Base</T></h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                       <T>Train your assistant by uploading business documents, website links, or FAQs so it can answer customer questions accurately.</T>
                     </p>
                  </div>
                  <button
                    onClick={() => {
                      if (activeAssistant) fetchKnowledge(activeAssistant.id, true);
                    }}
                    disabled={isSyncingSources}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-xs flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isSyncingSources ? 'animate-spin text-blue-600' : ''}`} />
                    <span>{isSyncingSources ? <T>{'Syncing Sources...'}</T> : <T>{'Sync Sources'}</T>}</span>
                  </button>
                </div>

                {/* Active Bot Scope & Switcher Banner */}
                <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-gradient-to-r from-blue-50/80 via-white to-blue-50/40 dark:from-blue-950/40 dark:via-slate-900 dark:to-blue-950/20 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs shrink-0">
                        <Bot className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            <T>Adding documents for:</T>
                          </span>
                          {assistants && assistants.length > 1 ? (
                            <select
                              value={activeAssistant?.id || ''}
                              onChange={(e) => {
                                const selected = assistants.find((a) => a.id === e.target.value);
                                if (selected && setActiveAssistant) {
                                  setActiveAssistant(selected);
                                }
                              }}
                              aria-label="Choose which assistant to add documents to"
                              className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-blue-700 dark:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            >
                              {assistants.map((ast) => (
                                <option key={ast.id} value={ast.id}>
                                  {ast.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-sm font-bold text-blue-700 dark:text-blue-400">
                              {activeAssistant?.name || <T>{'Default Assistant'}</T>}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">
                          <T>Assistant ID (only needed if support asks for it):</T> <span className="font-mono text-slate-600 dark:text-slate-400">{activeAssistant?.id || <T>{'demo-assistant'}</T>}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {handleDeleteAssistant && assistants && assistants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (activeAssistant?.id) {
                              handleDeleteAssistant(activeAssistant.id);
                            }
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-sm font-semibold shadow-xs transition cursor-pointer"
                          title="Permanently remove this assistant and all its documents"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                          <span><T>Delete this assistant</T></span>
                        </button>
                      )}
                      {onOpenNewAssistantModal && (
                        <button
                          type="button"
                          onClick={onOpenNewAssistantModal}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs transition cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span><T>Create another assistant</T></span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-blue-100 dark:border-blue-900/40 text-sm text-blue-900 dark:text-blue-200">
                    <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>
                      <strong><T>Kept separate:</T></strong> <T>everything you upload here only teaches</T> <strong>{activeAssistant?.name || <T>{'this assistant'}</T>}</strong><T>. If you have more than one assistant, they never see each other&apos;s documents.</T>
                    </span>
                  </div>
                </div>

                {/* Plain-language summary cards. Hover any card for the technical detail behind it. */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                    <div className="text-xs font-medium text-slate-600 dark:text-slate-400"><T>Your documents</T></div>
                    <div className="text-base font-semibold text-slate-900 dark:text-white mt-0.5">
                      {sources.length} {sources.length === 1 ? <T>{'file'}</T> : <T>{'files'}</T>}
                    </div>
                    <div className="text-xs mt-0.5 font-medium">
                      {sources.length === 0 ? (
                        <span className="text-slate-500 dark:text-slate-500"><T>None yet — add one below</T></span>
                      ) : failedSources.length > 0 ? (
                        <span className="text-rose-700 dark:text-rose-400">{pctIndexed}<T>% ready (</T>{failedSources.length} <T>need attention)</T></span>
                      ) : processingSources.length > 0 ? (
                        <span className="text-amber-700 dark:text-amber-400">{pctIndexed}<T>% ready (</T>{processingSources.length} <T>still reading)</T></span>
                      ) : (
                        <span className="text-emerald-700 dark:text-emerald-400"><T>All ready to use</T></span>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs" title="Stored as 384-dimensional embeddings (BGE-small) for retrieval.">
                    <div className="text-xs font-medium text-slate-600 dark:text-slate-400"><T>Knowledge saved</T></div>
                    <div className="text-base font-semibold text-slate-900 dark:text-white mt-0.5">
                      {totalChunks} {totalChunks === 1 ? <T>{'passage'}</T> : <T>{'passages'}</T>}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5"><T>Ready to search instantly</T></div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                      <span><T>Storage used</T></span>
                      <HardDrive className="h-3.5 w-3.5 text-blue-500" />
                    </div>
                    <div className="text-base font-semibold text-slate-900 dark:text-white mt-0.5 font-mono">
                      {storageUsage ? __t("{usedMb} MB", { usedMb: storageUsage.usedMb }) : <T>{'0 MB'}</T>}
                      <span className="text-xs font-normal text-slate-500 font-sans">
                        {' '}/ {storageUsage ? __t("{limitMb} MB", { limitMb: storageUsage.limitMb }) : <T>{'50 MB'}</T>}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          style={{ width: `${Math.min(100, storageUsage?.percentUsed ?? 0)}%` }}
                          className={`h-full transition-all duration-500 ${
                            (storageUsage?.percentUsed ?? 0) >= 100
                              ? 'bg-rose-500'
                              : (storageUsage?.percentUsed ?? 0) > 80
                              ? 'bg-amber-500'
                              : 'bg-blue-600'
                          }`}
                        />
                      </div>
                      <div className="text-xs text-slate-500 flex justify-between font-mono">
                        <span>{storageUsage?.percentUsed ?? 0}<T>% used</T></span>
                        <span>{storageUsage?.planName || <T>{'Plan'}</T>}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs" title="Hybrid retrieval: cosine similarity + BM25 keywords, merged with reciprocal rank fusion.">
                    <div className="text-xs font-medium text-slate-600 dark:text-slate-400"><T>How it searches</T></div>
                    <div className="text-base font-semibold text-blue-700 dark:text-blue-400 mt-0.5">
                      <T>Smart search</T>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5"><T>Finds answers even with typos or different wording</T></div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs" title="Local CPU embeddings: $0.00/mo regardless of AI provider costs.">
                    <div className="text-xs font-medium text-slate-600 dark:text-slate-400"><T>Cost to read your documents</T></div>
                    <div className="text-base font-semibold text-slate-900 dark:text-white mt-0.5">
                      <T>$0.00 / mo</T>
                    </div>
                    <div className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5 font-medium"><T>Always free, however much you upload</T></div>
                  </div>
                </div>

                {/* Status: Deleted Toast Notification */}
                {deleteToast && (
                  <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/60 p-3.5 shadow-xs flex items-center justify-between animate-in fade-in">
                    <div className="flex items-center gap-2 text-xs font-semibold text-rose-800 dark:text-rose-200">
                      <Trash2 className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                      <span>{deleteToast}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeleteToast?.(null)}
                      className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-300 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Upload Failure Alert */}
                {uploadFailureAlert && (
                  <div className="rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-4 shadow-xs flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-900 dark:text-rose-200">
                          <T>Upload Processing Failed:</T> <T>{uploadFailureAlert.title}</T>
                        </span>
                        <button
                          type="button"
                          onClick={() => setUploadFailureAlert(null)}
                          className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-300 cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="text-rose-800 dark:text-rose-300 leading-relaxed">
                        <strong><T>Why it failed:</T></strong> {uploadFailureAlert.reason}
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-rose-200 dark:border-rose-900/50 text-slate-700 dark:text-slate-300">
                        <strong className="text-rose-700 dark:text-rose-400"><T>What you should do next:</T></strong>{' '}
                        {uploadFailureAlert.whatToDoNext}
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload Form */}
                <form
                  onSubmit={handleExtractContent || handleUploadFiles}
                  className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-4 hover:border-blue-500 dark:hover:border-blue-500 transition shadow-xs"
                >
                  <div className="flex flex-col items-center justify-center text-center space-y-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        <T>Drop files here or click to browse</T>
                      </span>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                        <T>Works with PDF, Word, spreadsheets, plain text, images, audio and video files</T>
                      </p>
                    </div>
                    {storageUsage && (
                      <div className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                        <HardDrive className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                        <span>
                          <T>Storage:</T> <strong>{storageUsage.usedMb} <T>MB</T></strong> / <strong>{storageUsage.limitMb} <T>MB</T></strong> ({storageUsage.percentUsed}<T>% used)</T>
                        </span>
                        {storageUsage.isAtLimit ? (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                            <T>Limit Reached</T>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            • {Math.max(0, storageUsage.limitMb - storageUsage.usedMb).toFixed(1)} <T>MB available</T>
                          </span>
                        )}
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.csv,.json,.docx,.txt,.jpg,.jpeg,.png,.webp,.mp4,.webm,.mov,.mkv,.avi,.m4v,.3gp,.mp3,.wav,.m4a,.ogg,.flac,.aac"
                      onChange={(e) => setSelectedFiles(e.target.files)}
                      className="text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                    />
                    {selectedFiles && selectedFiles.length > 0 && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                        <span className="font-semibold">
                          <T>Selected</T> {selectedFiles.length} <T>file(s):</T>
                        </span>
                        <span className="font-mono text-[11px] truncate max-w-xs">
                          {Array.from(selectedFiles).map((f) => f.name).join(', ')}
                        </span>
                        {resetUploaderFiles && (
                          <button
                            type="button"
                            onClick={resetUploaderFiles}
                            className="ml-auto p-0.5 text-emerald-600 hover:text-emerald-900 dark:hover:text-emerald-100 cursor-pointer rounded hover:bg-emerald-100 dark:hover:bg-emerald-900"
                            title="Clear selected files"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                    <span className="flex-shrink mx-4 text-xs text-slate-500 dark:text-slate-500 uppercase font-semibold">
                      <T>Or just type it in</T>
                    </span>
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Section Title (e.g. Return Policy, Store Hours, Contact Info)"
                      value={uploadTextTitle}
                      onChange={(e) => setUploadTextTitle(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500"
                    />
                    <textarea
                      rows={3}
                      placeholder="Paste business instructions, FAQs, shipping details, or company background..."
                      value={uploadText}
                      onChange={(e) => setUploadText(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isExtracting || isUploading || ((!selectedFiles || selectedFiles.length === 0) && !uploadText.trim())}
                      className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition shadow-xs cursor-pointer"
                    >
                      {isExtracting ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>{extractionStatusText || <T>{'Reading...'}</T>}</span>
                        </>
                      ) : isUploading ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>{uploadStatusText || <T>{'Adding...'}</T>}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5" />
                          <span><T>Add this</T></span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Draft Saved Success Toast */}
                {draftSaveSuccess && (
                  <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 p-3.5 shadow-xs flex items-center justify-between animate-in fade-in">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{draftSaveSuccess}</span>
                    </div>
                    {setDraftSaveSuccess && (
                      <button
                        type="button"
                        onClick={() => setDraftSaveSuccess(null)}
                        className="text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300 cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}

                {/* Interactive Extracted Knowledge Review & Edit Panel */}
                {reviewDraft && (
                  <div className="rounded-xl border-2 border-blue-500/80 dark:border-blue-500/60 bg-white dark:bg-slate-900 p-5 shadow-md space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                              <T>Step 2: Review &amp; Edit Extracted Knowledge</T>
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              {reviewDraft.type.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            <T>Verify the extracted text below. Edit any names, terminology, or prices before saving to the knowledge base.</T>
                          </p>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono self-start sm:self-auto bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                        {reviewDraft.content.trim() ? reviewDraft.content.trim().split(/\s+/).length : 0} <T>words &bull;</T> {reviewDraft.content.length} <T>chars</T>
                      </div>
                    </div>

                    {/* Title Input */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        <T>Document Title in Knowledge Base</T>
                      </label>
                      <input
                        type="text"
                        value={reviewDraft.title}
                        onChange={(e) =>
                          setReviewDraft?.((prev) => (prev ? { ...prev, title: e.target.value, isEdited: true } : null))
                        }
                        placeholder="Enter title for this document..."
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 font-medium"
                      />
                    </div>

                    {/* Editable Transcript Textarea */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Edit3 className="h-3 w-3 text-blue-500" />
                          <span><T>Extracted Content (Fully Editable)</T></span>
                        </label>
                        {reviewDraft.isEdited && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                            <T>(Content modified by user)</T>
                          </span>
                        )}
                      </div>
                      <textarea
                        rows={12}
                        value={reviewDraft.content}
                        onChange={(e) =>
                          setReviewDraft?.((prev) => (prev ? { ...prev, content: e.target.value, isEdited: true } : null))
                        }
                        placeholder="Extracted knowledge transcript..."
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3.5 text-xs text-slate-900 dark:text-slate-100 font-mono leading-relaxed outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition"
                      />
                    </div>

                    {/* Actions Toolbar */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={handleDiscardReviewDraft}
                        disabled={isSavingDraft}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition cursor-pointer"
                      >
                        <T>Discard Draft</T>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSaveReviewDraft}
                          disabled={isSavingDraft || !reviewDraft.content.trim()}
                          className="flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 text-xs font-semibold shadow-xs disabled:opacity-50 transition cursor-pointer"
                        >
                          {isSavingDraft ? (
                            <>
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              <span><T>Generating Chunks &amp; Saving...</T></span>
                            </>
                          ) : (
                            <>
                              <Check className="h-3.5 w-3.5" />
                              <span><T>Save to Knowledge Base</T></span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Import Knowledge from URL (YouTube, Video, Webpage) */}
                <form
                  onSubmit={handleImportUrl}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3.5 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40">
                        <Globe className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          <T>Import from a link</T>
                        </span>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          <T>A YouTube video, a page on your website, or a direct video/audio file — in any language.</T>
                        </p>
                      </div>
                    </div>

                    {urlInput.trim() && (
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full font-semibold border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                        {/(?:youtube\.com|youtu\.be)/i.test(urlInput)
                          ? <T>{'YouTube video'}</T>
                          : /\.(mp4|webm|mov|mkv|avi|mp3|wav|m4a|ogg|flac)$/i.test(urlInput.split('?')[0])
                          ? <T>{'Video/audio link'}</T>
                          : <T>{'Web page'}</T>}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    <div className="md:col-span-2">
                      <input
                        type="url"
                        required
                        placeholder="https://www.youtube.com/watch?v=... or https://yourcompany.com/about"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Custom Title (optional)"
                        value={urlCustomTitle}
                        onChange={(e) => setUrlCustomTitle(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {urlFeedback && (
                    <div
                      className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                        urlFeedback.type === 'success'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {urlFeedback.type === 'success' ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                      )}
                      <span><T>{urlFeedback.message}</T></span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2.5">
                    {handleExtractUrl && (
                      <button
                        type="button"
                        onClick={handleExtractUrl}
                        disabled={isExtracting || isImportingUrl || !urlInput.trim()}
                        className="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-3.5 py-2 text-xs font-semibold disabled:opacity-50 transition shadow-xs cursor-pointer"
                      >
                        {isExtracting ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            <span><T>Reading...</T></span>
                          </>
                        ) : (
                          <>
                            <FileText className="h-3.5 w-3.5 text-blue-500" />
                            <span><T>Preview first</T></span>
                          </>
                        )}
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={isImportingUrl || isExtracting || !urlInput.trim()}
                      className="flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 text-xs font-semibold disabled:opacity-50 transition shadow-xs cursor-pointer"
                    >
                      {isImportingUrl ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span><T>Adding...</T></span>
                        </>
                      ) : (
                        <>
                          <Globe className="h-3.5 w-3.5" />
                          <span><T>Add directly</T></span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Failed sources alert banner */}
                {sources.some((s) => s.status === 'failed') && (
                  <div className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/20 p-3.5 flex items-start gap-3 text-sm">
                    <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <div className="flex-1 text-slate-700 dark:text-slate-300">
                      <span className="font-semibold text-rose-900 dark:text-rose-200">
                        {sources.filter((s) => s.status === 'failed').length} <T>file(s) had a problem.</T>
                      </span>{' '}
                      <T>Click</T> <span className="font-semibold text-rose-700 dark:text-rose-400"><T>&ldquo;See what to do&rdquo;</T></span> <T>in the list below for the exact reason and how to fix it.</T>
                    </div>
                  </div>
                )}

                {/* Structured Enterprise Table */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white"><T>Your documents</T></span>
                      <span className="text-sm text-slate-500 dark:text-slate-400 font-mono">({sources.length})</span>
                    </div>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search sources..."
                        value={sourceFilter}
                        onChange={(e) => setSourceFilter(e.target.value)}
                        className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 w-48"
                      />
                    </div>
                  </div>

                  {sources.length === 0 ? (
                    <div className="p-10 text-center space-y-2">
                      <div className="mx-auto w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        <T>Nothing uploaded for</T> {activeAssistant?.name || <T>{'this assistant'}</T>} <T>yet</T>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                        <T>Use the panels above to add a document, a web page or a video link. It will only be used to answer for this assistant.</T>
                      </p>
                    </div>
                  ) : filteredSources.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                      <T>No documents found matching your filter "</T>{sourceFilter}".
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="py-3 px-5"><T>Document Name</T></th>
                          <th className="py-3 px-5"><T>Type</T></th>
                          <th className="py-3 px-5"><T>Chunks</T></th>
                          <th className="py-3 px-5"><T>Status</T></th>
                          <th className="py-3 px-5"><T>Date</T></th>
                          <th className="py-3 px-5 text-right"><T>Actions</T></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                        {filteredSources.map((source) => (
                          <tr key={source.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition">
                            <td className="py-3.5 px-5 font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
                              <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                                source.type === 'pdf'
                                  ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                                  : source.type === 'csv'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                  : source.type === 'json'
                                  ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                  : source.type === 'youtube'
                                  ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                                  : source.type === 'web'
                                  ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800'
                                  : ['mp4', 'webm', 'mov', 'mkv', 'avi', 'm4v', 'video'].includes(source.type.toLowerCase())
                                  ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800'
                                  : ['mp3', 'wav', 'm4a', 'ogg', 'flac', 'aac', 'audio'].includes(source.type.toLowerCase())
                                  ? 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800'
                                  : 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                              }`}>
                                {source.type === 'youtube'
                                  ? <T>{'YOUTUBE'}</T>
                                  : source.type === 'web'
                                  ? <T>{'WEB'}</T>
                                  : ['mp4', 'webm', 'mov', 'mkv', 'avi', 'm4v', 'video'].includes(source.type.toLowerCase())
                                  ? <T>{'VIDEO'}</T>
                                  : ['mp3', 'wav', 'm4a', 'ogg', 'flac', 'aac', 'audio'].includes(source.type.toLowerCase())
                                  ? <T>{'AUDIO'}</T>
                                  : source.type.toUpperCase()}
                              </span>
                              <span className="truncate max-w-[280px]" title={source.title}><T>{source.title}</T></span>
                            </td>
                            <td className="py-3.5 px-5 text-slate-500 dark:text-slate-400 uppercase font-mono text-[11px]">
                              {source.type}
                            </td>
                            <td className="py-3.5 px-5 font-mono text-blue-600 dark:text-blue-400 font-bold">
                              {source.chunkCount} <T>chunks</T>
                            </td>
                            <td className="py-3.5 px-5">
                              {(source.status === 'deleted' || recentlyDeletedIds?.[source.id]) ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 font-bold text-[11px] animate-pulse">
                                  <CheckCircle2 className="h-3 w-3 text-rose-600 dark:text-rose-400" />
                                  <T>Deleted</T>
                                </span>
                              ) : source.status === 'ready' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-semibold text-[11px]">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                  <T>Ready</T>
                                </span>
                              ) : source.status === 'processing' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 font-semibold text-[11px]">
                                  <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                                  <T>Processing</T>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setFailedSourceModal(source)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 font-semibold text-xs hover:bg-rose-100 dark:hover:bg-rose-900/60 transition cursor-pointer"
                                  title="Click to see what went wrong and how to fix it"
                                >
                                  <AlertTriangle className="h-3 w-3 text-rose-500" />
                                  <span><T>See what to do</T></span>
                                </button>
                              )}
                            </td>
                            <td className="py-3.5 px-5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                              {new Date(source.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3.5 px-5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {source.status === 'ready' && !recentlyDeletedIds?.[source.id] && (
                                  <button
                                    onClick={() => handleOpenCorrectionModal(source)}
                                    className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition cursor-pointer"
                                    title="Correct misheard audio/OCR words, add fact overrides, or edit text"
                                  >
                                    <Wand2 className="h-3.5 w-3.5 text-indigo-500" />
                                    <span><T>Correct</T></span>
                                    {source.corrections && source.corrections.length > 0 && (
                                      <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200">
                                        {source.corrections.length}
                                      </span>
                                    )}
                                  </button>
                                )}
                                <button
                                  disabled={source.status === 'deleted' || Boolean(recentlyDeletedIds?.[source.id])}
                                  onClick={() => {
                                    if (setDeleteConfirmSource) {
                                      setDeleteConfirmSource(source);
                                    } else {
                                      handleDeleteSource(source.id);
                                    }
                                  }}
                                  className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                  title="Delete source"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Delete Confirmation Popup Modal */}
                {deleteConfirmSource && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400">
                          <Trash2 className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white"><T>Delete Knowledge Source?</T></h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400"><T>This action cannot be undone.</T></p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        <T>Are you sure you want to delete</T> <strong className="text-slate-900 dark:text-white font-semibold">&ldquo;<T>{deleteConfirmSource.title}</T>&rdquo;</strong><T>? All associated vector chunks and trained embeddings will be permanently removed from your AI assistant.</T>
                      </p>
                      <div className="flex justify-end gap-2.5 pt-2">
                        <button
                          type="button"
                          disabled={isDeletingSource}
                          onClick={() => setDeleteConfirmSource?.(null)}
                          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer"
                        >
                          <T>Cancel</T>
                        </button>
                        <button
                          type="button"
                          disabled={isDeletingSource}
                          onClick={() => confirmDeleteSource?.()}
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white transition flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                        >
                          {isDeletingSource ? (
                            <>
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              <span><T>Deleting...</T></span>
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-3.5 w-3.5" />
                              <span><T>Yes, Delete Source</T></span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
  );
};
