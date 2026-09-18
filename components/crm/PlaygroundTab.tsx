'use client';

import React from 'react';
import {
  Globe,
  FileText,
  X,
  Paperclip,
  Mic,
  MicOff,
  Send,
  Video,
  FileSpreadsheet,
  FileEdit,
} from 'lucide-react';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { ChatBookingCard } from '@/components/chat/ChatBookingCard';

const Youtube = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export interface PlaygroundTabProps {
  activeAssistant: any;
  chatMessages: any[];
  setChatMessages: React.Dispatch<React.SetStateAction<any[]>>;
  isStreaming: boolean;
  streamingStatus: string | null;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  playgroundAttachment: any;
  setPlaygroundAttachment: (att: any) => void;
  playgroundFileInputRef: React.RefObject<HTMLInputElement | null>;
  handlePlaygroundVoiceToggle: () => void;
  isVoiceListening: boolean;
  inputQuery: string;
  setInputQuery: (val: string) => void;
  handleSendMessage: (q?: string) => void | Promise<void>;
  activeCitations: any[];
}

export const PlaygroundTab: React.FC<PlaygroundTabProps> = ({
  activeAssistant,
  chatMessages,
  setChatMessages,
  isStreaming,
  streamingStatus,
  chatEndRef,
  playgroundAttachment,
  setPlaygroundAttachment,
  playgroundFileInputRef,
  handlePlaygroundVoiceToggle,
  isVoiceListening,
  inputQuery,
  setInputQuery,
  handleSendMessage,
  activeCitations,
}) => {
  return (
    <div className="h-full flex flex-col max-w-6xl space-y-4 mx-auto">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Test Your Assistant</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                       Chat with your assistant in real time to test answers before your customers see them.
                     </p>
                  </div>
                  <button
                    onClick={() =>
                      setChatMessages([
                        {
                          role: 'assistant',
                          content: activeAssistant?.welcomeMessage || 'Hello! How can I assist you today?',
                        },
                      ])
                    }
                    className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg shadow-xs transition"
                  >
                    Clear Chat
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[500px]">
                  {/* Chat Messenger (2 cols) */}
                  <div className="lg:col-span-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between overflow-hidden">
                    {/* Chat Messages */}
                    <div className="p-4 overflow-y-auto space-y-3.5 flex-1 max-h-[460px]">
                      {chatMessages.map((msg, i) => (
                        <div
                          key={i}
                          className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                              msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-br-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-xs border border-slate-200/80 dark:border-slate-700/60'
                            }`}
                          >
                            {msg.role === 'assistant' ? (
                              (() => {
                                const hasBookingAction = msg.content.includes('[ACTION:BOOKING_FORM]');
                                const cleanContent = msg.content.replace(/\[ACTION:BOOKING_FORM\]/g, '').trim();
                                return (
                                  <>
                                    {cleanContent && <MarkdownRenderer content={cleanContent} />}
                                    {hasBookingAction && (
                                      <ChatBookingCard
                                        assistantId={activeAssistant?.id}
                                        businessName={activeAssistant?.name || 'Our Team'}
                                      />
                                    )}
                                  </>
                                );
                              })()
                            ) : (
                              <div className="whitespace-pre-wrap">{msg.content}</div>
                            )}

                            {/* Web Citations ONLY for Live Web Search - Never expose internal knowledge base files, URLs, or documents */}
                            {(() => {
                              const isLive = Boolean(msg.isWebSearch || (msg.citations || []).some((c: any) => c.isLiveWebSearch));
                              if (!isLive) return null;
                              const webCitations = (msg.citations || []).filter((c: any) => c && c.url && (c.url.startsWith('http://') || c.url.startsWith('https://')));
                              if (webCitations.length === 0) return null;
                              return (
                                <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px]">
                                  <div className="font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                                    <span className="flex items-center gap-1"><Globe className="h-3 w-3 text-sky-500" /> Web Sources:</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {webCitations.map((c: any, ci: number) => (
                                      <a
                                        key={ci}
                                        href={c.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 border px-2 py-0.5 rounded text-[10px] font-mono transition hover:underline hover:opacity-90 bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800"
                                        title={c.preview || c.url}
                                      >
                                        <span className="flex items-center gap-1"><Globe className="h-3 w-3 text-sky-500 shrink-0" /><span className="truncate max-w-[200px]">{c.sourceTitle}</span></span>
                                        <span className="text-[9px] opacity-70">↗</span>
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      ))}
                      {isStreaming && (
                        <div className="flex items-center gap-2 text-xs py-1">
                          {streamingStatus ? (
                            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium animate-pulse">
                              <svg className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                              </svg>
                              <span>{streamingStatus}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                              <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
                              <span>Retrieving context &amp; generating streaming answer...</span>
                            </div>
                          )}
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Starter Pills */}
                    {activeAssistant?.starterQuestions && activeAssistant.starterQuestions.length > 0 && (
                      <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5">
                        {activeAssistant.starterQuestions.slice(0, 3).map((q: string, i: number) => (
                          <button
                            key={i}
                            onClick={() => handleSendMessage(q)}
                            className="text-[11px] rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Chat Input Bar */}
                    <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                      {playgroundAttachment && (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                            <span className="font-semibold truncate max-w-[200px] text-slate-800 dark:text-slate-200">{playgroundAttachment.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({Math.round(playgroundAttachment.size / 1024)} KB)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setPlaygroundAttachment(null);
                              if (playgroundFileInputRef.current) playgroundFileInputRef.current.value = '';
                            }}
                            className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <input
                          ref={playgroundFileInputRef}
                          type="file"
                          accept=".pdf,.docx,.txt,.csv,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 15 * 1024 * 1024) {
                              alert('File is too large. Maximum size is 15 MB.');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = () => {
                              setPlaygroundAttachment({
                                name: file.name,
                                type: file.type || file.name.split('.').pop() || 'file',
                                size: file.size,
                                data: reader.result as string,
                              });
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => playgroundFileInputRef.current?.click()}
                          title="Attach file to chat"
                          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer shrink-0"
                        >
                          <Paperclip className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handlePlaygroundVoiceToggle}
                        title={isVoiceListening ? 'Stop Voice Dictation' : 'Speak / Voice Dictation'}
                        className={`p-2 rounded-lg border transition cursor-pointer shrink-0 ${
                          isVoiceListening
                            ? 'bg-red-500 text-white border-red-600 animate-pulse'
                            : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {isVoiceListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </button>
                      <input
                        type="text"
                        placeholder="Type a message to test your knowledge base..."
                        value={inputQuery}
                        onChange={(e) => setInputQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSendMessage();
                        }}
                        className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => handleSendMessage()}
                        disabled={isStreaming || !inputQuery.trim()}
                        className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 transition shadow-xs"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Send</span>
                      </button>
                    </div>
                  </div>
                </div>

                  {/* RAG Inspector Panel (1 col) */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-5 space-y-4 flex flex-col justify-between shadow-xs">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">RAG Inspector</span>
                        <span className="text-[10px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded">
                          Connected
                        </span>
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Active AI Provider</label>
                        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
                          <span className="font-semibold text-slate-900 dark:text-white uppercase font-mono">{activeAssistant?.provider || 'Ollama'}</span>
                          <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">{activeAssistant?.modelName || 'llama3.2'}</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                          Retrieved Fragments ({activeCitations.length})
                        </label>
                        {activeCitations.length === 0 ? (
                          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-[11px] text-slate-500 dark:text-slate-400 text-center">
                            Ask a question to see retrieved knowledge chunks and citations here.
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {activeCitations.map((c, i) => {
                              const st = (c.sourceType || '').toLowerCase();
                              const stTitle = (c.sourceTitle || '').toLowerCase();
                              const isYt = st === 'youtube' || stTitle.includes('youtube');
                              const isWeb = st === 'web';
                              const isVid = ['mp4', 'webm', 'mov', 'mkv', 'avi', 'm4v', 'video'].some((e) => st.includes(e) || stTitle.endsWith(`.${e}`));
                              const isAud = ['mp3', 'wav', 'm4a', 'ogg', 'flac', 'aac', 'audio'].some((e) => st.includes(e) || stTitle.endsWith(`.${e}`));
                              const renderCitationIcon = () => {
                                if (isYt) return <Youtube className="h-3 w-3 text-red-500 shrink-0" />;
                                if (isWeb) return <Globe className="h-3 w-3 text-emerald-500 shrink-0" />;
                                if (isVid) return <Video className="h-3 w-3 text-purple-500 shrink-0" />;
                                if (isAud) return <Mic className="h-3 w-3 text-cyan-500 shrink-0" />;
                                if (st === 'pdf' || stTitle.endsWith('.pdf')) return <FileText className="h-3 w-3 text-red-500 shrink-0" />;
                                if (st === 'csv' || stTitle.endsWith('.csv')) return <FileSpreadsheet className="h-3 w-3 text-green-500 shrink-0" />;
                                return <FileEdit className="h-3 w-3 text-blue-500 shrink-0" />;
                              };
                              return (
                                <div key={i} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-[11px] space-y-1">
                                  <div className="flex items-center justify-between text-[10px] font-mono">
                                    <div className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1.5 truncate pr-2">
                                      <span>[{i + 1}]</span>
                                      <span className="truncate flex items-center gap-1">{renderCitationIcon()} {c.sourceTitle}</span>
                                    </div>
                                    {c.url && (
                                      <a
                                        href={c.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sky-600 dark:text-sky-400 hover:underline shrink-0 flex items-center gap-0.5 font-sans font-medium"
                                      >
                                        <span>Visit</span>
                                        <span className="text-[9px]">↗</span>
                                      </a>
                                    )}
                                  </div>
                                  <div className="text-slate-600 dark:text-slate-300 line-clamp-2">{c.preview}</div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex justify-between font-mono">
                      <span>Vector Dims: <strong>384</strong></span>
                      <span>Embed Cost: <strong className="text-emerald-600 dark:text-emerald-400">$0.00</strong></span>
                    </div>
                  </div>
                </div>
              </div>
  );
};
