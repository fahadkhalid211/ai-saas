'use client';

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
  AlertTriangle,
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
  setCustomEmbedHost,
  copiedCode,
  setCopiedCode,
}) => {
  return (
    <div className="max-w-5xl space-y-6 mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                      Welcome to {activeAssistant?.name}
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Your business assistant is ready. Train it on proprietary business files, configure rules, and embed it anywhere.
                    </p>
                  </div>
                </div>

                {/* Metric Stat Cards (Balanced Typography) */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Articles</div>
                    <div className="text-base font-semibold text-slate-900 dark:text-white mt-0.5">
                      {sources.length} Documents
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">+100% indexed</div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Vector Chunks</div>
                    <div className="text-base font-semibold text-slate-900 dark:text-white mt-0.5">
                      {totalChunks} Chunks
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">384-dim BGE-Small</div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Retrieval Mode</div>
                    <div className="text-base font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                      Hybrid RRF
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Cosine + BM25 Keywords</div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Embedding Cost</div>
                    <div className="text-base font-semibold text-slate-900 dark:text-white mt-0.5">
                      $0.00 / mo
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">Local CPU Embeddings</div>
                  </div>
                </div>

                {/* Knowledge Gap & Unanswered Questions Engine */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-amber-500" />
                        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                          Knowledge Gaps &amp; Unanswered Questions
                        </h2>
                        {unansweredQueries.filter((q) => !q.resolved).length > 0 && (
                          <span className="rounded-full bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                            {unansweredQueries.filter((q) => !q.resolved).length} Needs Answer
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Questions visitors asked that the AI couldn't answer from current documents. Add the answer with 1-click to immediately retrain the AI.
                      </p>
                    </div>
                  </div>

                  {unansweredQueries.length === 0 ? (
                    <div className="rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 p-4 text-center">
                      <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 inline mr-1" /> No knowledge gaps detected!
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        Your assistant has answered questions using your indexed knowledge base. New missing questions will appear here automatically.
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
                                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                                      &ldquo;{item.query}&rdquo;
                                    </span>
                                    {item.resolved ? (
                                      <span className="rounded bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                                        Resolved
                                      </span>
                                    ) : (
                                      <span className="rounded bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                                        Missing Answer
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-400">
                                    Logged {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {item.suggestedAnswer && (
                                      <span className="text-slate-500 dark:text-slate-400 ml-2 italic">
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
                                      className="px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 transition cursor-pointer"
                                    >
                                      {isResolving ? 'Cancel' : '1-Click Answer'}
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleResolveUnansweredQuery(item.id, 'delete')}
                                    title="Dismiss"
                                    className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Inline Quick Answer Composer */}
                              {isResolving && (
                                <div className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5 animate-in fade-in duration-150">
                                  <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    Type the answer to this question. It will be indexed immediately:
                                  </div>
                                  <textarea
                                    rows={2}
                                    value={knowledgeAnswerText}
                                    onChange={(e) => setKnowledgeAnswerText(e.target.value)}
                                    placeholder="e.g. Yes, we offer full refunds within 14 days of purchase. Contact support@ourstore.com with your order number."
                                    className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                                  />
                                  <div className="flex justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setResolvingQueryId(null)}
                                      className="px-2.5 py-1 rounded text-xs text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      disabled={!knowledgeAnswerText.trim() || isSavingKnowledgeGap}
                                      onClick={() => handleResolveUnansweredQuery(item.id, 'addKnowledge', item.query)}
                                      className="flex items-center gap-1.5 px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50 transition shadow-xs cursor-pointer"
                                    >
                                      {isSavingKnowledgeGap ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                                      <span>{isSavingKnowledgeGap ? 'Indexing...' : 'Save to Knowledge Base'}</span>
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
                      <span>Upload Knowledge Documents</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Upload your product lists (CSV), contracts (PDF/DOCX), catalogues (JSON), or plain text. The local engine chunks and embeds them instantly for $0.
                    </p>
                    <button
                      onClick={() => setActiveTab('knowledge')}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Go to Knowledge Base &rarr;
                    </button>
                  </div>

                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 shadow-xs">
                    <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-900 dark:text-white">
                      <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span>Test Chat in Testing Studio</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Simulate customer questions. Verify citations, check accuracy on product pricing or terms, and test fallback behavior before launching.
                    </p>
                    <button
                      onClick={() => setActiveTab('playground')}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Open Testing Studio &rarr;
                    </button>
                  </div>
                </div>

                {/* Embed Snippet Card */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                      <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span>Embed On Any Business Website (WordPress, Shopify, Webflow)</span>
                    </div>
                    <button
                      onClick={() => {
                        const effectiveHost = (customEmbedHost.trim() || (typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com')).replace(/\/+$/, '');
                        navigator.clipboard.writeText(
                          `<script src="${effectiveHost}/widget.js" data-assistant="${activeAssistant?.id}" defer></script>`
                        );
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2000);
                      }}
                      className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 shadow-xs transition cursor-pointer"
                    >
                      <Copy className="h-3 w-3" />
                      <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>

                  {typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && !customEmbedHost.trim() && (
                    <div className="rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/20 p-3.5 flex items-start gap-2.5 text-xs">
                      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div className="text-slate-700 dark:text-slate-300 space-y-1">
                        <span className="font-semibold text-amber-900 dark:text-amber-200">
                          Embedding on a live HTTPS website (e.g. WordPress)?
                        </span>
                        <p className="leading-relaxed">
                          Web browsers automatically block <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 py-0.5 rounded text-amber-800 dark:text-amber-300 font-semibold">http://localhost:3000</code> on live HTTPS websites due to browser <strong>Mixed Content Security</strong>.
                        </p>
                        <p className="leading-relaxed">
                          To display the widget on a live site, deploy this app to a public HTTPS domain (e.g., <strong>Vercel</strong>, <strong>Railway</strong>) or use a secure HTTPS tunnel (like Cloudflare Tunnel or localtunnel), then enter your live URL in the field below.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>Server Host URL</span>
                      <span className="text-[11px] text-slate-400 font-normal">Leave blank to use current origin</span>
                    </label>
                    <input
                      type="url"
                      placeholder={typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}
                      value={customEmbedHost}
                      onChange={(e) => setCustomEmbedHost(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Paste this snippet before the closing <code className="text-blue-600 dark:text-blue-400 font-mono">&lt;/body&gt;</code> tag on your website:
                  </p>
                  <div className="overflow-x-auto rounded-lg bg-slate-50 dark:bg-slate-950 p-3 text-xs font-mono text-slate-800 dark:text-cyan-300 border border-slate-200 dark:border-slate-800">
                    &lt;script src=&quot;{(customEmbedHost.trim() || (typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com')).replace(/\/+$/, '')}/widget.js&quot; data-assistant=&quot;{activeAssistant?.id}&quot; defer&gt;&lt;/script&gt;
                  </div>
                </div>
              </div>
  );
};
