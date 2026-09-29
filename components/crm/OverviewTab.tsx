'use client';

import { resolveEmbedHost } from '@/lib/embed';
import React from 'react';
import {
  HelpCircle,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Plus,
  Upload,
  MessageSquare,
  Globe,
  Copy,
} from 'lucide-react';
import { KnowledgeSource } from '@/components/crm/KnowledgeTab';

export interface OverviewTabProps {
  activeAssistant: any;
  sources: KnowledgeSource[];
  totalChunks: number;
  unansweredQueries: any[];
  resolvingQueryId: string | null;
  setResolvingQueryId: (id: string | null) => void;
  knowledgeAnswerText: string;
  setKnowledgeAnswerText: (text: string) => void;
  isSavingKnowledgeGap: boolean;
  handleResolveUnansweredQuery: (id: string, action: 'delete' | 'addKnowledge', queryText?: string) => void | Promise<void>;
  setActiveTab: (tab: any) => void;
  customEmbedHost: string;
  setCustomEmbedHost: (host: string) => void;
  copiedCode: boolean;
  setCopiedCode: (copied: boolean) => void;
  /** Opens the full "add to your website" instructions (EmbedModal), including the email-a-web-developer option. */
  onOpenEmbedModal?: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  activeAssistant,
  sources,
  totalChunks,
  unansweredQueries,
  resolvingQueryId,
  setResolvingQueryId,
  knowledgeAnswerText,
  setKnowledgeAnswerText,
  isSavingKnowledgeGap,
  handleResolveUnansweredQuery,
  setActiveTab,
  customEmbedHost,
  copiedCode,
  setCopiedCode,
  onOpenEmbedModal,
}) => {
  return (
    <div className="max-w-5xl space-y-6 mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                      Welcome to {activeAssistant?.name}
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Three things to do: add your documents, try asking it a few questions, then put it on your website.
                    </p>
                  </div>
                </div>

                {/* Plain-language summary cards. Hover any card for the technical detail behind it. */}
                {(() => {
                  const readySources = (sources || []).filter((s) => s.status === 'ready');
                  const failedSources = (sources || []).filter((s) => s.status === 'failed');
                  const processingSources = (sources || []).filter((s) => s.status === 'processing');
                  const pctIndexed = (sources || []).length > 0 ? Math.round((readySources.length / sources.length) * 100) : 0;

                  return (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                        <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Your documents</div>
                        <div className="text-base font-semibold text-slate-900 dark:text-white mt-0.5">
                          {sources.length} {sources.length === 1 ? 'file' : 'files'} uploaded
                        </div>
                        <div className="text-xs mt-0.5 font-medium">
                          {sources.length === 0 ? (
                            <span className="text-slate-500 dark:text-slate-500">Add your first one below</span>
                          ) : failedSources.length > 0 ? (
                            <span className="text-rose-700 dark:text-rose-400">{pctIndexed}% ready ({failedSources.length} need attention)</span>
                          ) : processingSources.length > 0 ? (
                            <span className="text-amber-700 dark:text-amber-400">{pctIndexed}% ready ({processingSources.length} still reading)</span>
                          ) : (
                            <span className="text-emerald-700 dark:text-emerald-400">All ready to use</span>
                          )}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs" title="Stored as 384-dimensional embeddings (BGE-small) for retrieval.">
                        <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Knowledge saved</div>
                        <div className="text-base font-semibold text-slate-900 dark:text-white mt-0.5">
                          {totalChunks} {totalChunks === 1 ? 'passage' : 'passages'}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Ready to search instantly</div>
                      </div>

                      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs" title="Hybrid retrieval: cosine similarity + BM25 keywords, merged with reciprocal rank fusion.">
                        <div className="text-xs font-medium text-slate-600 dark:text-slate-400">How it searches</div>
                        <div className="text-base font-semibold text-blue-700 dark:text-blue-400 mt-0.5">
                          Smart search
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Finds answers even with typos or different wording</div>
                      </div>

                      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs" title="Local CPU embeddings: $0.00/mo regardless of AI provider costs.">
                        <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Cost to read your documents</div>
                        <div className="text-base font-semibold text-slate-900 dark:text-white mt-0.5">
                          $0.00 / mo
                        </div>
                        <div className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5 font-medium">Always free, however much you upload</div>
                      </div>
                    </div>
                  );
                })()}

                {/* Knowledge Gap & Unanswered Questions Engine */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-amber-500" />
                        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                          Questions it couldn&apos;t answer
                        </h2>
                        {unansweredQueries.filter((q) => !q.resolved).length > 0 && (
                          <span className="rounded-full bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                            {unansweredQueries.filter((q) => !q.resolved).length} need an answer
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        When a visitor asks something your documents don&apos;t cover, it shows up here honestly instead of guessing. Type the answer once, in a sentence or two, and it will know it from then on.
                      </p>
                    </div>
                  </div>

                  {unansweredQueries.length === 0 ? (
                    <div className="rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 p-4 text-center">
                      <div className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 inline mr-1" /> Nothing to fix — it has answered everything so far!
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">
                        If it ever gets stuck on a question, it will show up here so you can teach it the answer.
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                        {unansweredQueries.slice(0, 8).map((item) => {
                          const isResolving = resolvingQueryId === item.id;
                          return (
                            <div key={item.id} className="p-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                      &ldquo;{item.query}&rdquo;
                                    </span>
                                    {item.resolved ? (
                                      <span className="rounded bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                                        Answered
                                      </span>
                                    ) : (
                                      <span className="rounded bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                                        Needs an answer
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-slate-500 dark:text-slate-500">
                                    Asked {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {item.suggestedAnswer && (
                                      <span className="text-slate-600 dark:text-slate-400 ml-2 italic">
                                        &bull; Answer: {item.suggestedAnswer.slice(0, 60)}...
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  {!item.resolved && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setResolvingQueryId(isResolving ? null : item.id);
                                        setKnowledgeAnswerText('');
                                      }}
                                      className="px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 transition cursor-pointer"
                                    >
                                      {isResolving ? 'Cancel' : 'Answer it'}
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleResolveUnansweredQuery(item.id, 'delete')}
                                    title="Remove this question"
                                    className="p-1 text-slate-500 hover:text-rose-700 transition cursor-pointer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Inline Quick Answer Composer */}
                              {isResolving && (
                                <div className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5 animate-in fade-in duration-150">
                                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Type the answer below, the way you&apos;d say it to a customer. It will remember it right away:
                                  </div>
                                  <textarea
                                    rows={2}
                                    value={knowledgeAnswerText}
                                    onChange={(e) => setKnowledgeAnswerText(e.target.value)}
                                    placeholder="e.g. Yes, we offer full refunds within 14 days of purchase. Contact support@ourstore.com with your order number."
                                    className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                                  />
                                  <div className="flex justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setResolvingQueryId(null)}
                                      className="px-2.5 py-1 rounded text-sm text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      disabled={!knowledgeAnswerText.trim() || isSavingKnowledgeGap}
                                      onClick={() => handleResolveUnansweredQuery(item.id, 'addKnowledge', item.query)}
                                      className="flex items-center gap-1.5 px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50 transition shadow-xs cursor-pointer"
                                    >
                                      {isSavingKnowledgeGap ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                                      <span>{isSavingKnowledgeGap ? 'Saving...' : 'Save this answer'}</span>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Action Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 shadow-xs">
                    <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-900 dark:text-white">
                      <Upload className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span>Add your documents</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Upload your price list, FAQs, policies, or any file about your business — PDF, Word, a spreadsheet, or plain text. It reads them in seconds, at no cost.
                    </p>
                    <button
                      onClick={() => setActiveTab('knowledge')}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 dark:text-blue-400 hover:underline"
                    >
                      Go to My Documents &rarr;
                    </button>
                  </div>

                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 shadow-xs">
                    <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-900 dark:text-white">
                      <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span>Try it out</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Ask it the questions a real customer would ask, and see exactly how it replies — before any visitor ever sees it.
                    </p>
                    <button
                      onClick={() => setActiveTab('playground')}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 dark:text-blue-400 hover:underline"
                    >
                      Open Try It Out &rarr;
                    </button>
                  </div>
                </div>

                {/* Embed Snippet Card */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                      <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span>Add it to your website</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const effectiveHost = resolveEmbedHost(customEmbedHost, typeof window !== 'undefined' ? window.location.origin : undefined).host;
                          navigator.clipboard.writeText(
                            `<script src="${effectiveHost}/widget.js" data-assistant="${activeAssistant?.id}" defer></script>`
                          );
                          setCopiedCode(true);
                          setTimeout(() => setCopiedCode(false), 2000);
                        }}
                        className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 shadow-xs transition cursor-pointer"
                      >
                        <Copy className="h-3 w-3" />
                        <span>{copiedCode ? 'Copied!' : 'Copy code'}</span>
                      </button>
                      {onOpenEmbedModal && (
                        <button
                          onClick={onOpenEmbedModal}
                          className="flex items-center gap-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 px-2.5 py-1 rounded-md shadow-xs transition cursor-pointer font-semibold"
                        >
                          Full instructions
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    This works on WordPress, Wix, Squarespace, Shopify or a plain HTML site. If you built the site yourself, click &ldquo;Full instructions&rdquo; for the exact steps for your platform. If someone else manages your website, click there too — it can email them the code for you, so you never have to touch it.
                  </p>
                </div>
              </div>
  );
};
