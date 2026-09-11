'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Paperclip,
  Mic,
  MicOff,
  Globe,
  RefreshCw,
  CheckCircle2,
  Calendar,
  ExternalLink,
  FileText,
  X,
  FileSpreadsheet,
  FileCheck,
  Check,
  Zap,
} from 'lucide-react';
import { MarkdownRenderer } from '@/components/markdown-renderer';

interface EmbedPageProps {
  params: Promise<{ id: string }>;
}

export default function EmbedChatPage({ params }: EmbedPageProps) {
  const [assistantId, setAssistantId] = useState<string>('');
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Chat state
  const [messages, setMessages] = useState<
    {
      role: 'user' | 'assistant';
      content: string;
      citations?: any[];
      isWebSearch?: boolean;
      attachment?: { name: string; type: string; size?: number };
    }[]
  >([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingStatus, setStreamingStatus] = useState<string | null>(null);
  const [visitorId] = useState(() => 'embed_' + Math.random().toString(36).substring(2, 10));
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showLangMenu, setShowLangMenu] = useState(false);

  // File attachment state
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    type: string;
    size: number;
    data: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice dictation state
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    params.then((p) => {
      setAssistantId(p.id);
    });
  }, [params]);

  useEffect(() => {
    if (!assistantId) return;

    fetch(`/api/widget/${assistantId}/config`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load assistant configuration');
        return res.json();
      })
      .then((data) => {
        setConfig(data);
        if (data.welcomeMessage) {
          setMessages([
            {
              role: 'assistant',
              content: data.welcomeMessage,
            },
          ]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Config fetch error:', err);
        setError('Assistant not found or unavailable');
        setLoading(false);
      });
  }, [assistantId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingStatus]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('File is too large. Maximum allowed size is 15 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedFile({
        name: file.name,
        type: file.type || file.name.split('.').pop() || 'file',
        size: file.size,
        data: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleVoiceToggle = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('Voice dictation is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedLanguage === 'es' ? 'es-ES' : selectedLanguage === 'fr' ? 'fr-FR' : 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (e) {
      console.warn('Speech recognition error:', e);
      setIsListening(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if ((!text && !attachedFile) || isStreaming) return;

    const currentAttachment = attachedFile;
    const userMessage: any = {
      role: 'user',
      content: text || `Please analyze attached document: ${currentAttachment?.name}`,
      ...(currentAttachment ? { attachment: { name: currentAttachment.name, type: currentAttachment.type, size: currentAttachment.size } } : {}),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsStreaming(true);
    setStreamingStatus(null);

    const assistantPlaceholder = {
      role: 'assistant' as const,
      content: '',
      citations: [],
    };
    setMessages([...newMessages, assistantPlaceholder]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId,
          visitorId,
          preferredLanguage: selectedLanguage,
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          attachment: currentAttachment
            ? {
                name: currentAttachment.name,
                type: currentAttachment.type,
                size: currentAttachment.size,
                data: currentAttachment.data,
              }
            : undefined,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error('Failed to get response');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let streamBuffer = '';
      let replyText = '';
      let replyCitations: any[] = [];
      let isWebSearch = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        streamBuffer += decoder.decode(value, { stream: true });
        const lines = streamBuffer.split('\n');
        streamBuffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const jsonStr = trimmed.slice(6);
            if (jsonStr === '[DONE]') continue;

            try {
              const data = JSON.parse(jsonStr);
              if (data.type === 'status') {
                setStreamingStatus(data.message || 'Searching knowledge...');
              } else if (data.type === 'citations') {
                replyCitations = data.citations || [];
                isWebSearch = Boolean(data.isWebSearch);
                setStreamingStatus(null);
              } else if (data.type === 'token') {
                replyText += data.token;
                setStreamingStatus(null);
                setMessages((prev) => {
                  const updated = [...prev];
                  const lastIdx = updated.length - 1;
                  if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
                    updated[lastIdx] = {
                      ...updated[lastIdx],
                      content: replyText,
                      citations: replyCitations,
                      isWebSearch: isWebSearch,
                    };
                  }
                  return updated;
                });
              }
            } catch (e) {
              // ignore parse errors
            }
          }
        }
      }
    } catch (err) {
      console.error('Streaming error:', err);
      setMessages((prev) => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
          updated[lastIdx] = {
            ...updated[lastIdx],
            content: config?.fallbackMessage || "I'm sorry, I encountered a temporary issue. Please try again.",
          };
        }
        return updated;
      });
    } finally {
      setIsStreaming(false);
      setStreamingStatus(null);
    }
  };

  const handleRestartChat = () => {
    if (confirm('Start a new conversation? Current chat history will be cleared.')) {
      setMessages(
        config?.welcomeMessage
          ? [
              {
                role: 'assistant',
                content: config.welcomeMessage,
              },
            ]
          : []
      );
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex items-center gap-2.5 text-xs text-slate-500">
          <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
          <span>Loading assistant...</span>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center max-w-sm shadow-sm space-y-2">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{error || 'Assistant unavailable'}</p>
          <p className="text-xs text-slate-500">Please verify the Assistant ID in your iframe embed code.</p>
        </div>
      </div>
    );
  }

  const primaryColor = config.primaryColor || '#2563eb';

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans text-slate-900 dark:text-slate-100 antialiased">
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 py-3 text-white shrink-0 shadow-xs"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center font-bold text-xs shrink-0">
            {config.name ? config.name.slice(0, 2).toUpperCase() : 'AI'}
          </div>
          <div className="min-w-0">
            <h1 className="text-xs font-bold truncate leading-tight">{config.name}</h1>
            <div className="flex items-center gap-1.5 text-[10.5px] opacity-90">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Online &amp; Ready</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1 bg-white/15 hover:bg-white/25 border border-white/20 px-2 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer"
              title="Select Language"
            >
              <Globe className="h-3 w-3" />
              <span className="uppercase">{selectedLanguage}</span>
            </button>
            {showLangMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-32 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-1 z-50 text-slate-700 dark:text-slate-300 text-xs">
                {[
                  { code: 'en', label: 'English' },
                  { code: 'es', label: 'Español' },
                  { code: 'fr', label: 'Français' },
                  { code: 'de', label: 'Deutsch' },
                  { code: 'ar', label: 'العربية' },
                  { code: 'ur', label: 'اردو' },
                ].map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => {
                      setSelectedLanguage(l.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition cursor-pointer ${
                      selectedLanguage === l.code
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 font-semibold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{l.label}</span>
                    {selectedLanguage === l.code && <Check className="h-3 w-3 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reset / New Chat */}
          <button
            type="button"
            onClick={handleRestartChat}
            className="flex items-center gap-1 bg-white/15 hover:bg-white/25 border border-white/20 px-2 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer"
            title="Reset Conversation"
          >
            <RefreshCw className="h-3 w-3" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>
      </header>

      {/* Messages Container */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div key={index} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs ${
                  isUser
                    ? 'text-white rounded-br-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs'
                }`}
                style={isUser ? { backgroundColor: primaryColor } : undefined}
              >
                {/* User Attachment Pill */}
                {msg.attachment && (
                  <div
                    className={`mb-2 p-1.5 rounded-lg flex items-center gap-1.5 text-[10.5px] font-mono border ${
                      isUser
                        ? 'bg-white/15 border-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate max-w-[200px]">{msg.attachment.name}</span>
                    {msg.attachment.size ? (
                      <span className="opacity-75">({Math.round(msg.attachment.size / 1024)} KB)</span>
                    ) : null}
                  </div>
                )}

                {isUser ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div>
                    <MarkdownRenderer content={msg.content} />
                    {/* Web Sources Citations (Strictly for live web search - never internal knowledge base) */}
                    {(() => {
                      const isLive = Boolean(msg.isWebSearch || (msg.citations || []).some((c: any) => c.isLiveWebSearch));
                      if (!isLive) return null;
                      const webCitations = (msg.citations || []).filter(
                        (c: any) => c && c.url && (c.url.startsWith('http://') || c.url.startsWith('https://'))
                      );
                      if (webCitations.length === 0) return null;
                      return (
                        <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700 text-[10.5px]">
                          <div className="font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                            <Globe className="h-3 w-3 text-sky-500" />
                            <span>Web Sources:</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {webCitations.map((c: any, ci: number) => (
                              <a
                                key={ci}
                                href={c.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 border px-2 py-0.5 rounded text-[10px] font-mono bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800 hover:underline"
                              >
                                <span className="truncate max-w-[180px]">{c.sourceTitle || c.url}</span>
                                <ExternalLink className="h-2.5 w-2.5 opacity-70" />
                              </a>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Starter Questions (when exactly 1 message exists) */}
        {messages.length === 1 && config.starterQuestions && config.starterQuestions.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-medium text-slate-400 px-1">Suggested inquiries:</span>
            <div className="flex flex-wrap gap-1.5">
              {config.starterQuestions.map((q: string, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(q)}
                  className="text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 shadow-xs transition cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Live Status Indicator */}
        {isStreaming && (
          <div className="flex items-center gap-2 text-xs py-1 text-slate-500">
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-600" />
            <span className="italic">{streamingStatus || 'Formulating answer...'}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Footer / Input Area */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 space-y-2 shrink-0">
        {/* Attachment preview banner */}
        {attachedFile && (
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="h-4 w-4 text-blue-600 shrink-0" />
              <span className="font-semibold truncate max-w-[240px] text-slate-800 dark:text-slate-200">
                {attachedFile.name}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                ({Math.round(attachedFile.size / 1024)} KB)
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setAttachedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept=".pdf,.docx,.txt,.csv,.png,.jpg,.jpeg"
            className="hidden"
          />

          {/* Paperclip attachment button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach file (PDF, TXT, CSV, Image)"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 transition cursor-pointer shrink-0"
          >
            <Paperclip className="h-4 w-4" />
          </button>

          {/* Chat text input */}
          <input
            type="text"
            placeholder={attachedFile ? 'Ask a question about this file...' : 'Ask anything about our business...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
          />

          {/* Voice dictation button */}
          <button
            type="button"
            onClick={handleVoiceToggle}
            title={isListening ? 'Stop voice dictation' : 'Speak to dictate'}
            className={`p-2 rounded-xl border transition cursor-pointer shrink-0 ${
              isListening
                ? 'bg-red-500 text-white border-red-600 animate-pulse'
                : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>

          {/* Send button */}
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={isStreaming || (!input.trim() && !attachedFile)}
            className="p-2 rounded-xl text-white disabled:opacity-40 transition shadow-xs cursor-pointer shrink-0"
            style={{ backgroundColor: primaryColor }}
            title="Send Message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        {/* Branding */}
        <div className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1 pt-1">
          {config.whiteLabelEnabled ? (
            config.customBrandingText ? (
              <span>{config.customBrandingText}</span>
            ) : null
          ) : (
            <>
              <Zap className="h-2.5 w-2.5 text-blue-500" />
              <span>Powered by Kortex AI</span>
            </>
          )}
        </div>
      </footer>
    </div>
  );
}
