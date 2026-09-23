'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles, RefreshCw, MessageSquare, ChevronDown, Check, Copy } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: string;
}

const DEFAULT_SUGGESTIONS = [
  'How does Zero Token Markup work?',
  'How do I connect Google Gemini or OpenAI?',
  'How do I add a knowledge base to my assistant?',
  'How do I embed the chat widget on my website?',
];

function CresceloAvatarFace({ size = 36 }: { size?: number }) {
  return (
    <svg viewBox="0 0 72 72" width={size} height={size} className="shrink-0" aria-hidden="true">
      {/* Brand Signal Crest */}
      <path d="M30 6a7 7 0 1 1 12 0" fill="none" stroke="#abff44" strokeWidth="3" strokeLinecap="round" />
      <circle cx="36" cy="10" r="2.2" fill="#abff44" />
      
      {/* Brand Ear Nodes */}
      <path d="M9 30c-3 0-5 3-5 7s2 7 5 7" fill="none" stroke="#abff44" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M63 30c3 0 5 3 5 7s-2 7-5 7" fill="none" stroke="#abff44" strokeWidth="2.5" strokeLinecap="round" />

      {/* Chassis Head - Crescelo Deep Obsidian */}
      <rect x="9" y="13" width="54" height="48" rx="18" fill="#08251a" stroke="#abff44" strokeWidth="2" />

      {/* Warm Cream Eye Portals */}
      <circle cx="26" cy="33" r="9" fill="#fffeeb" stroke="#1a1a1a" strokeWidth="1.5" />
      <circle cx="46" cy="33" r="9" fill="#fffeeb" stroke="#1a1a1a" strokeWidth="1.5" />

      {/* Pupils */}
      <circle cx="26" cy="33" r="4.2" fill="#08251a" />
      <circle cx="27.4" cy="31.4" r="1.6" fill="#abff44" />
      <circle cx="46" cy="33" r="4.2" fill="#08251a" />
      <circle cx="47.4" cy="31.4" r="1.6" fill="#abff44" />

      {/* Friendly Lime Smile */}
      <path d="M30 48c3.5 3.5 8.5 3.5 12 0" fill="none" stroke="#abff44" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export function FloatingPlatformChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      content:
        'Hi there! 👋 I am your **Crescelo Platform Concierge**. Ask me anything about our zero token markup pricing, connecting your AI models (Google Gemini, OpenAI, Claude, Groq, Ollama), adding knowledge bases, or navigating the dashboard!',
      createdAt: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [hasUnread, setHasUnread] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sendMessage = async (contentToSend?: string) => {
    const text = (contentToSend || input).trim();
    if (!text || isLoading) return;

    const userMsgId = 'usr_' + Date.now();
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInput('');
    setIsLoading(true);

    const botMsgId = 'ast_' + (Date.now() + 1);
    const initialBotMsg: ChatMessage = {
      id: botMsgId,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, initialBotMsg]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId: 'demo-assistant',
          message: text,
          conversationId: conversationId || undefined,
          history: messages
            .filter((m) => m.role === 'user' || m.role === 'assistant')
            .slice(-6)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Readable stream not supported');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const rawData = line.slice(6).trim();
            if (rawData === '[DONE]') continue;

            try {
              const parsed = JSON.parse(rawData);
              if (parsed.type === 'token' && parsed.content) {
                accumulated += parsed.content;
                setMessages((prev) =>
                  prev.map((m) => (m.id === botMsgId ? { ...m, content: accumulated } : m))
                );
              } else if (parsed.type === 'conversation_id' && parsed.conversationId) {
                setConversationId(parsed.conversationId);
              } else if (parsed.type === 'error' && parsed.error) {
                accumulated += `\n\n*(Notice: ${parsed.error})*`;
                setMessages((prev) =>
                  prev.map((m) => (m.id === botMsgId ? { ...m, content: accumulated } : m))
                );
              }
            } catch {
              // Plain text stream fallback
              if (rawData) {
                accumulated += rawData;
                setMessages((prev) =>
                  prev.map((m) => (m.id === botMsgId ? { ...m, content: accumulated } : m))
                );
              }
            }
          }
        }
      }

      if (!isOpen) {
        setHasUnread(true);
      }
    } catch (err: any) {
      console.error('[PlatformChatbot] send failed:', err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botMsgId
            ? {
                ...m,
                content:
                  m.content ||
                  "I'm sorry, I ran into an issue connecting to the AI engine. You can also view our documentation or reach out at contact@crescelo.com!",
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[99999] font-sans">
      {/* Launcher Button: circular avatar face at rest, expands to pill on hover */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center h-[54px] rounded-full p-1.5 bg-[#08251a] hover:bg-[#0d3a29] border-2 border-[#abff44] shadow-[0_10px_35px_rgba(0,0,0,0.55)] shadow-[#abff44]/20 hover:shadow-[#abff44]/35 hover:scale-105 active:scale-95 transition-all duration-300 ease-out cursor-pointer hover:pr-4"
          aria-label="Open Crescelo Platform Assistant"
        >
          {/* Avatar Face (always visible) */}
          <div className="relative w-[40px] h-[40px] rounded-full bg-[#051811] flex items-center justify-center overflow-hidden shrink-0">
            <CresceloAvatarFace size={36} />
            <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-[#abff44] border-2 border-[#08251a] rounded-full" />
          </div>

          {/* Text revealed on hover: expands smoothly to pill size */}
          <div className="max-w-0 opacity-0 group-hover:max-w-[130px] group-hover:opacity-100 group-hover:ml-2.5 overflow-hidden whitespace-nowrap transition-all duration-300 ease-out flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#fffeeb] tracking-wide">Ask Crescelo AI</span>
            <span className="text-[11px] text-[#abff44] font-bold">✨</span>
          </div>

          {hasUnread && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#abff44] opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#abff44]" />
            </span>
          )}
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Crescelo Concierge Chat"
          className="flex flex-col w-[92vw] sm:w-[380px] md:w-[420px] h-[580px] max-h-[85vh] bg-[#051811] text-slate-100 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] border-2 border-[#1c4533] overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-[#08251a] border-b border-[#1c4533]">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#051811] border border-[#abff44]/40 shrink-0">
                <CresceloAvatarFace size={32} />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#abff44] border-2 border-[#08251a] rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm tracking-tight text-[#fffeeb]">Crescelo Concierge</h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#abff44]/15 text-[#abff44] border border-[#abff44]/30">
                    Official AI
                  </span>
                </div>
                <p className="text-[11px] text-[#cfe3d6] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#abff44] inline-block animate-ping" />
                  Instant answers • Zero Token Markup
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setMessages([
                    {
                      id: 'msg_welcome_' + Date.now(),
                      role: 'assistant',
                      content:
                        'Conversation cleared. Ask me anything about Crescelo features, AI setup, zero-markup pricing, or dashboard guides!',
                      createdAt: new Date().toISOString(),
                    },
                  ]);
                  setConversationId(null);
                }}
                title="Clear conversation"
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`relative group max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-600/20'
                      : 'bg-slate-900 text-slate-200 border border-slate-800/80 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">
                    {m.content ? (
                      m.content
                    ) : (
                      <span className="flex items-center gap-1.5 py-0.5 text-slate-400 italic">
                        <Sparkles className="w-3.5 h-3.5 animate-spin text-blue-400" />
                        Thinking...
                      </span>
                    )}
                  </div>

                  {m.role === 'assistant' && m.content && (
                    <button
                      type="button"
                      onClick={() => handleCopy(m.id, m.content)}
                      title="Copy response"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-200 bg-slate-800/80 rounded transition"
                    >
                      {copiedId === m.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Quick Suggestion Chips on initial view */}
            {messages.length <= 2 && !isLoading && (
              <div className="pt-2">
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-sky-400" />
                  Popular Questions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {DEFAULT_SUGGESTIONS.map((sug, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => sendMessage(sug)}
                      className="text-left text-xs bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 px-2.5 py-1.5 rounded-lg transition duration-150"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-slate-900/90 border-t border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about Crescelo..."
                disabled={isLoading}
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none transition"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white rounded-xl shadow transition shrink-0"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="mt-2 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
              <span>Powered by Crescelo Sovereign RAG</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">100% Free Consultation</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
