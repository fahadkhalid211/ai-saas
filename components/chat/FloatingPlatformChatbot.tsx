'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, RefreshCw, Check, Copy } from 'lucide-react';
import { CresceloOrb, type OrbState } from '@/components/brand/CresceloOrb';
import { PlatformBookingCard, type BookingConfig } from './PlatformBookingCard';
import { stripActionTokens } from '@/lib/chat/handoff';
import { getPlatformConciergeAnswer } from '@/lib/ai/concierge';

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

/** Renders **bold** spans (the assistant's replies use them) without showing the asterisks. */
function renderRich(text: string): React.ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') && part.length > 4 ? (
      <strong key={i} className="font-semibold text-[#faf9f5]">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}

const ASSISTANT_ID = 'demo-assistant';
const BOOKING_INTENT = /\b(book|schedule|appointment|demo|meeting|call with|consultation|reserve|calendar)\b/i;

/** What the assistant asked the interface to show, taken from its control tokens. */
function actionsOf(content: string): { text: string; booking: boolean; human: boolean } {
  return {
    text: stripActionTokens(content),
    booking: content.includes('[ACTION:BOOKING_FORM]'),
    human: content.includes('[ACTION:HUMAN_ESCALATION]'),
  };
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
  const [bookingConfig, setBookingConfig] = useState<BookingConfig | null>(null);

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

  useEffect(() => {
    if (!isOpen || bookingConfig) return;
    fetch(`/api/widget/${ASSISTANT_ID}/config`)
      .then((r) => (r.ok ? r.json() : null))
      .then((c) => setBookingConfig(c || { bookingEnabled: false }))
      .catch(() => setBookingConfig({ bookingEnabled: false }));
  }, [isOpen, bookingConfig]);

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

    // Wanting to book: show the booking form straight away (with a live agent as the second option).
    if (bookingConfig?.bookingEnabled && BOOKING_INTENT.test(text)) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'ast_' + (Date.now() + 1),
          role: 'assistant',
          content: 'Happy to help you pick a time. Choose a day and slot below. [ACTION:BOOKING_FORM]',
          createdAt: new Date().toISOString(),
        },
      ]);
      return;
    }
    setIsLoading(true);

    const botMsgId = 'ast_' + (Date.now() + 1);
    const initialBotMsg: ChatMessage = {
      id: botMsgId,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, initialBotMsg]);

    const historyMsgs = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-6)
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    const payloadMessages = [
      ...historyMsgs,
      { role: 'user' as const, content: text },
    ];

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId: 'demo-assistant',
          messages: payloadMessages,
          message: text,
          conversationId: conversationId || undefined,
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
      let buffer = '';
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          const rawData = trimmed.slice(6).trim();
          if (!rawData || rawData === '[DONE]') continue;

          try {
            const parsed = JSON.parse(rawData);
            const token = parsed.token ?? parsed.content;

            if (parsed.type === 'token' && typeof token === 'string') {
              accumulated += token;
              setMessages((prev) =>
                prev.map((m) => (m.id === botMsgId ? { ...m, content: accumulated } : m))
              );
            } else if (
              (parsed.type === 'citations' || parsed.type === 'done' || parsed.type === 'conversation_id') &&
              parsed.conversationId
            ) {
              setConversationId(parsed.conversationId);
            } else if (parsed.type === 'error' && parsed.error) {
              // If an AI provider error occurred, provide the concierge answer if accumulated is empty
              if (!accumulated.trim()) {
                accumulated = getPlatformConciergeAnswer(text);
              } else {
                accumulated += `\n\n*(Notice: ${parsed.error})*`;
              }
              setMessages((prev) =>
                prev.map((m) => (m.id === botMsgId ? { ...m, content: accumulated } : m))
              );
            }
          } catch {
            if (rawData && !rawData.startsWith('{')) {
              accumulated += rawData;
              setMessages((prev) =>
                prev.map((m) => (m.id === botMsgId ? { ...m, content: accumulated } : m))
              );
            }
          }
        }
      }

      // Check remaining buffer
      if (buffer.trim().startsWith('data: ')) {
        const rawData = buffer.trim().slice(6).trim();
        if (rawData && rawData !== '[DONE]') {
          try {
            const parsed = JSON.parse(rawData);
            const token = parsed.token ?? parsed.content;
            if (parsed.type === 'token' && typeof token === 'string') {
              accumulated += token;
              setMessages((prev) =>
                prev.map((m) => (m.id === botMsgId ? { ...m, content: accumulated } : m))
              );
            }
          } catch {
            if (!rawData.startsWith('{')) {
              accumulated += rawData;
              setMessages((prev) =>
                prev.map((m) => (m.id === botMsgId ? { ...m, content: accumulated } : m))
              );
            }
          }
        }
      }

      // If the LLM stream yielded an empty string or error notice, deliver the platform concierge knowledge
      if (
        !accumulated.trim() ||
        accumulated.includes('*(Authentication Error:') ||
        accumulated.includes('*(Notice: Could not connect') ||
        accumulated.includes('*(AI Generation Error:')
      ) {
        accumulated = getPlatformConciergeAnswer(text);
        setMessages((prev) =>
          prev.map((m) => (m.id === botMsgId ? { ...m, content: accumulated } : m))
        );
      }

      if (!isOpen) {
        setHasUnread(true);
      }
    } catch (err: any) {
      console.warn('[PlatformChatbot] fetch error, using concierge knowledge fallback:', err?.message);
      // Fallback immediately to platform concierge answer so user gets their answer even on network hiccups
      const fallbackReply = getPlatformConciergeAnswer(text);
      setMessages((prev) =>
        prev.map((m) => (m.id === botMsgId ? { ...m, content: fallbackReply } : m))
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

  const lastMessage = messages[messages.length - 1];
  // What the orb is doing: waiting for the first words, or talking as they arrive.
  const orbState: OrbState = isLoading ? (lastMessage?.role === 'assistant' && lastMessage.content ? 'speaking' : 'thinking') : 'idle';
  const serif = { fontFamily: 'var(--font-mk-serif, var(--kx-serif, Georgia, "Times New Roman", serif))' } as const;

  return (
    <div
      className="fixed bottom-6 right-6 z-[99999] font-sans"
      onKeyDown={(e) => {
        if (e.key === 'Escape' && isOpen) setIsOpen(false);
      }}
    >
      {/* Launcher: the orb on its own; a small label slides out on hover */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#abff44]"
          aria-label="Open the Crescelo assistant"
        >
          <span className="pointer-events-none translate-x-3 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 transition-all duration-300 ease-out whitespace-nowrap rounded-full border border-white/10 bg-[#262624]/95 px-3.5 py-2 text-xs font-medium text-[#faf9f5] shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur">
            Ask Crescelo
          </span>
          <span className="relative block transition-transform duration-300 group-hover:scale-105 group-active:scale-95">
            <CresceloOrb size={64} state="idle" followPointer />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#abff44] opacity-70" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-[#abff44] ring-2 ring-[#1f1e1d]" />
              </span>
            )}
          </span>
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Crescelo assistant"
          className="relative flex flex-col w-[92vw] sm:w-[380px] md:w-[410px] h-[580px] max-h-[85vh] bg-[#1f1e1d] text-[#e8e5dc] rounded-3xl shadow-[0_28px_90px_rgba(0,0,0,0.55)] border border-white/10 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          {/* soft light from above, the only colour in the panel */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(171,255,68,0.10),transparent)]" aria-hidden="true" />

          {/* Header */}
          <div className="relative flex items-center justify-between px-4 pt-4 pb-3">
            <div className="flex items-center gap-3">
              <CresceloOrb size={44} state={orbState} />
              <div>
                <h3 className="text-[19px] leading-none text-[#faf9f5] tracking-tight" style={serif}>
                  Crescelo
                </h3>
                <p className="mt-1 text-[11px] text-[#a19f96]" aria-live="polite">
                  {orbState === 'thinking' ? 'Thinking…' : orbState === 'speaking' ? 'Answering…' : 'Ask about pricing, setup or features'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-0.5">
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
                title="Start over"
                aria-label="Start over"
                className="p-2 text-[#a19f96] hover:text-[#faf9f5] hover:bg-white/[0.06] rounded-xl transition"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close"
                aria-label="Close chat"
                className="p-2 text-[#a19f96] hover:text-[#faf9f5] hover:bg-white/[0.06] rounded-xl transition"
              >
                <X className="w-[18px] h-[18px]" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="relative flex-1 px-4 pt-2 pb-3 overflow-y-auto space-y-4 [scrollbar-width:thin] [scrollbar-color:rgba(250,249,245,0.18)_transparent]">
            {messages.map((m) => (
              <div key={m.id} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <span className="mt-0.5 shrink-0">
                    <CresceloOrb size={26} mark />
                  </span>
                )}

                <div
                  className={`relative group max-w-[84%] px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[#abff44] text-[#08251a] font-medium rounded-2xl rounded-tr-md'
                      : 'bg-[#2c2b29] text-[#e8e5dc] border border-white/[0.06] rounded-2xl rounded-tl-md'
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">
                    {m.content ? (
                      m.role === 'assistant' ? renderRich(actionsOf(m.content).text) : m.content
                    ) : (
                      <span className="flex items-center gap-1 py-1" aria-label="Thinking">
                        {[0, 1, 2].map((i) => (
                          <span key={i} className="h-1.5 w-1.5 rounded-full bg-[#abff44] animate-pulse" style={{ animationDelay: `${i * 180}ms`, animationDuration: '1.1s' }} />
                        ))}
                      </span>
                    )}
                  </div>

                  {m.role === 'assistant' && m.content && !(isLoading && m.id === lastMessage?.id) && (() => {
                    const a = actionsOf(m.content);
                    if (!a.booking && !a.human) return null;
                    return (
                      <div className="mt-2.5 space-y-2">
                        {a.booking && bookingConfig?.bookingEnabled && <PlatformBookingCard assistantId={ASSISTANT_ID} config={bookingConfig} />}
                        {a.human ? (
                          <div className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#abff44]" role="status">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#abff44]" />
                            Live agent notified. Someone will join this chat shortly.
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => sendMessage('I would like to talk to a live agent')}
                            disabled={isLoading}
                            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.05] px-3 py-1.5 text-[12px] font-medium text-[#e8e5dc] transition hover:border-[#abff44]/50 hover:bg-white/[0.09] disabled:opacity-40"
                          >
                            Talk to a live agent
                          </button>
                        )}
                      </div>
                    );
                  })()}

                  {m.role === 'assistant' && m.content && (
                    <button
                      type="button"
                      onClick={() => handleCopy(m.id, actionsOf(m.content).text)}
                      title="Copy answer"
                      aria-label="Copy answer"
                      className="absolute -bottom-2 right-2 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 p-1 text-[#a19f96] hover:text-[#faf9f5] bg-[#33322f] border border-white/10 rounded-md transition"
                    >
                      {copiedId === m.id ? <Check className="w-3 h-3 text-[#abff44]" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Suggestions on the first view */}
            {messages.length <= 2 && !isLoading && (
              <div className="pt-1">
                <p className="text-[10.5px] font-semibold text-[#8b8981] uppercase tracking-[0.14em] mb-2">Try asking</p>
                <div className="flex flex-wrap gap-1.5">
                  {DEFAULT_SUGGESTIONS.map((sug, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => sendMessage(sug)}
                      className="text-left text-xs text-[#d8d5cb] hover:text-[#faf9f5] bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.16] hover:border-[#abff44]/50 px-3 py-1.5 rounded-full transition duration-200"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="relative px-3 pb-3 pt-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#262624] pl-3.5 pr-1.5 py-1.5 focus-within:border-[#abff44]/50 transition"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about Crescelo…"
                disabled={isLoading}
                aria-label="Your question"
                style={{ outline: 'none', boxShadow: 'none' }}
                className="flex-1 bg-transparent text-[13px] text-[#faf9f5] placeholder-[#8b8981] outline-none focus:outline-none focus-visible:outline-none selection:bg-white/20 selection:text-white py-1.5"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="grid place-items-center h-9 w-9 rounded-xl bg-[#abff44] text-[#08251a] hover:brightness-105 active:scale-95 disabled:opacity-30 disabled:hover:brightness-100 transition shrink-0"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="mt-2 text-center text-[10.5px] text-[#8b8981]">Powered by Crescelo</p>
          </div>
        </div>
      )}
    </div>
  );
}
