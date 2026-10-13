'use client';

import { T, useT } from '@/lib/i18n/context';
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, RefreshCw, Check, Copy, Minus, ChevronDown, MessageSquare, Headphones } from 'lucide-react';
import { CresceloOrb, type OrbState } from '@/components/brand/CresceloOrb';
import { CresceloMark } from '@/components/brand/CresceloMark';
import { PlatformBookingCard, type BookingConfig } from './PlatformBookingCard';
import { stripActionTokens } from '@/lib/chat/handoff';
import { getPlatformConciergeAnswer } from '@/lib/ai/concierge';
import type { AssistantAction } from '@/lib/platform/account';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'agent';
  content: string;
  createdAt?: string;
  senderName?: string;
  /** Buttons the dashboard assistant offers under its answer (confirm a plan change, open a tab, open the billing portal). */
  actions?: AssistantAction[];
}

const DASHBOARD_SUGGESTIONS = [
  'What plan am I on?',
  'How do I connect OpenAI?',
  'Upgrade my plan',
  'How do I add the widget to WordPress?',
];

const DEFAULT_SUGGESTIONS = [
  'How does Zero Token Markup work?',
  'How do I connect Google Gemini or OpenAI?',
  'How do I add a knowledge base to my assistant?',
  'How do I embed the chat widget on my website?',
];

/** Renders **bold** spans (the assistant's replies use them) without showing the asterisks. */
function renderRich(text: string): React.ReactNode {
  return text.replace(/^\s{0,3}#{1,6}\s+/gm, '').split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
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

const res401 = (err: any) => /sign in|401/i.test(String(err?.message || ''));

interface FloatingPlatformChatbotProps {
  /** 'floating' (default): the launcher orb in the corner of the page. 'header': a compact button that drops the chat down from the dashboard header. */
  variant?: 'floating' | 'header';
  /** Dashboard only: open one of the dashboard tabs (the assistant offers this as a button). */
  onNavigate?: (tab: string) => void;
  /** Dashboard only: called after a plan change so the billing screen can refresh. */
  onBillingChanged?: () => void;
}

export function FloatingPlatformChatbot({ variant = 'floating', onNavigate, onBillingChanged }: FloatingPlatformChatbotProps = {}) {
  const __t = useT();
  const inHeader = variant === 'header';
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      content: inHeader
        ? 'Hi! I am your Crescelo assistant. I know the setup guides and **your account**: ask about your plan and usage, how to connect a provider, add the widget or set up booking, or ask me to **upgrade or downgrade your plan** (I will always ask you to confirm first).'
        : 'Hi there! 👋 I am your **Crescelo Platform Concierge**. Ask me anything about our zero token markup pricing, connecting your AI models (Google Gemini, OpenAI, Claude, Groq, Ollama), adding knowledge bases, or navigating the dashboard!',
      createdAt: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationToken, setConversationToken] = useState<string | null>(null);
  const [isTakeoverActive, setIsTakeoverActive] = useState(false);
  const [assignedAgentName, setAssignedAgentName] = useState('Support Agent');
  const [hasUnread, setHasUnread] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [bookingConfig, setBookingConfig] = useState<BookingConfig | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

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

  // Polling for live agent messages and takeover status in the conversation
  useEffect(() => {
    if (!conversationId) return;

    let isMounted = true;
    const pollConversation = async () => {
      try {
        let url = `/api/conversations?id=${encodeURIComponent(conversationId)}`;
        if (conversationToken) {
          url += `&token=${encodeURIComponent(conversationToken)}`;
        }
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        if (!data || !isMounted) return;

        const conv = data.conversation;
        if (conv) {
          if (conv.isLiveTakeover) {
            setIsTakeoverActive(true);
            if (conv.assignedAgentName) {
              setAssignedAgentName(conv.assignedAgentName);
            }
          } else if (conv.isLiveTakeover === false) {
            setIsTakeoverActive(false);
          }
        }

        const msgList: any[] = (conv && conv.messages) || data.newMessages || [];
        if (Array.isArray(msgList) && msgList.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id).filter(Boolean));
            const newToAppend: ChatMessage[] = [];

            for (const m of msgList) {
              if ((m.role === 'agent' || m.role === 'system') && !existingIds.has(m.id)) {
                newToAppend.push({
                  id: m.id || 'msg_' + Math.random().toString(36).substring(2, 9),
                  role: m.role as 'agent' | 'system',
                  content: m.content,
                  senderName: m.senderName || conv?.assignedAgentName || assignedAgentName,
                  createdAt: m.createdAt || new Date().toISOString(),
                });
              }
            }

            if (newToAppend.length > 0) {
              if (!isOpen) setHasUnread(true);
              return [...prev, ...newToAppend];
            }
            return prev;
          });
        }
      } catch {
        // Silent poll error
      }
    };

    pollConversation();
    const timer = setInterval(pollConversation, 3000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [conversationId, conversationToken, isOpen, assignedAgentName]);

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

  /** The dashboard assistant: answers from the person's own account and the product guides, and proposes actions. */
  const askDashboard = async (text: string) => {
    setIsLoading(true);
    const id = 'ast_' + (Date.now() + 1);
    setMessages((prev) => [...prev, { id, role: 'assistant', content: '', createdAt: new Date().toISOString() }]);
    try {
      const history = messages
        .filter((m) => (m.role === 'user' || m.role === 'assistant') && m.content)
        .slice(-8)
        .map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/platform-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, content: data.reply, actions: data.actions || [] } : m)));
    } catch (err: any) {
      const reply = res401(err) ? 'Your session has ended. Please sign in again.' : getPlatformConciergeAnswer(text);
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, content: reply } : m)));
    } finally {
      setIsLoading(false);
      if (!isOpen) setHasUnread(true);
    }
  };

  const say = (content: string) => setMessages((prev) => [...prev, { id: 'ast_' + Date.now() + Math.random().toString(36).slice(2, 6), role: 'assistant', content, createdAt: new Date().toISOString() }]);

  /** Runs a button under an answer. A plan change only ever runs from the confirm button, and the server checks the person's role again. */
  const runAction = async (msg: ChatMessage, a: AssistantAction) => {
    if (busyAction) return;
    if (a.type === 'navigate') {
      if (onNavigate) onNavigate(a.tab);
      else window.location.href = `/dashboard?tab=${encodeURIComponent(a.tab)}`;
      return;
    }
    if (a.type === 'change_plan' && a.note === 'choose') {
      sendMessage(`switch to ${a.planId} ${a.interval}`);
      return;
    }
    const key = a.type === 'change_plan' ? `plan:${a.planId}:${a.interval}` : a.type;
    setBusyAction(key);
    try {
      if (a.type === 'open_portal') {
        const res = await fetch('/api/billing/portal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.url) {
          window.location.href = data.url;
          return;
        }
        say(data.error || 'The billing portal is available once a subscription is active.');
        return;
      }
      // change_plan: consume the buttons first so it cannot be sent twice
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, actions: [] } : m)));
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: a.planId, billingInterval: a.interval }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && !data.isSandbox && data.url) {
        say('Taking you to secure checkout to finish this.');
        window.location.href = data.url;
        return;
      }
      if (res.ok) {
        say(`Done. ${data.message || 'Your plan was updated.'}`);
        onBillingChanged?.();
      } else {
        say(`I could not change the plan: ${data.error || 'please try again from Plans & Billing.'}`);
      }
    } catch {
      say('I could not reach the server. Please try again from Plans & Billing.');
    } finally {
      setBusyAction(null);
    }
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

    if (inHeader) {
      await askDashboard(text);
      return;
    }

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

    let isTakeoverStream = isTakeoverActive;
    const botMsgId = 'ast_' + (Date.now() + 1);

    // Only add bot placeholder bubble if AI is not paused by live takeover
    if (!isTakeoverActive) {
      const initialBotMsg: ChatMessage = {
        id: botMsgId,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, initialBotMsg]);
    }

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
            } else if (parsed.type === 'takeover_active') {
              isTakeoverStream = true;
              setIsTakeoverActive(true);
              if (parsed.agentName) setAssignedAgentName(parsed.agentName);
              if (parsed.conversationId) setConversationId(parsed.conversationId);
              if (parsed.conversationToken) setConversationToken(parsed.conversationToken);
              // Clean up empty placeholder assistant bubble
              setMessages((prev) => prev.filter((m) => m.id !== botMsgId));
            } else if (
              (parsed.type === 'citations' || parsed.type === 'done' || parsed.type === 'conversation_id') &&
              parsed.conversationId
            ) {
              setConversationId(parsed.conversationId);
              if (parsed.conversationToken) setConversationToken(parsed.conversationToken);
            } else if (parsed.type === 'error' && parsed.error) {
              if (!isTakeoverStream && !isTakeoverActive) {
                if (!accumulated.trim()) {
                  accumulated = getPlatformConciergeAnswer(text);
                } else {
                  accumulated += `\n\n*(Notice: ${parsed.error})*`;
                }
                setMessages((prev) =>
                  prev.map((m) => (m.id === botMsgId ? { ...m, content: accumulated } : m))
                );
              }
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
            } else if (parsed.type === 'takeover_active') {
              isTakeoverStream = true;
              setIsTakeoverActive(true);
              if (parsed.agentName) setAssignedAgentName(parsed.agentName);
              if (parsed.conversationId) setConversationId(parsed.conversationId);
              if (parsed.conversationToken) setConversationToken(parsed.conversationToken);
              setMessages((prev) => prev.filter((m) => m.id !== botMsgId));
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
      // ONLY if live agent takeover is not active
      if (!isTakeoverStream && !isTakeoverActive) {
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
      }

      if (!isOpen) {
        setHasUnread(true);
      }
    } catch (err: any) {
      console.warn('[PlatformChatbot] fetch error:', err?.message);
      if (!isTakeoverStream && !isTakeoverActive) {
        const fallbackReply = getPlatformConciergeAnswer(text);
        setMessages((prev) =>
          prev.map((m) => (m.id === botMsgId ? { ...m, content: fallbackReply } : m))
        );
      }
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
      className={inHeader ? 'relative font-sans' : 'fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[99999] font-sans'}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && isOpen) setIsOpen(false);
      }}
    >
      {/* Launcher: the orb on its own; a small label slides out on hover */}
      {inHeader && (
        <button
          type="button"
          onClick={() => setIsOpen((o) => !o)}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Minimize the Crescelo assistant' : 'Open the Crescelo assistant'}
          title={__t("Ask the Crescelo assistant")}
          className={`relative flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer shadow-2xs ${
            isOpen
              ? 'border-[#abff44]/60 bg-[#08251a] text-[#e9ffc2]'
              : 'border-slate-200 dark:border-slate-700/80 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/70 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
          }`}
        >
          <CresceloOrb size={22} mark state={isLoading ? 'thinking' : 'idle'} />
          <span className="hidden sm:inline"><T>Assistant</T></span>
          <ChevronDown className={`h-3.5 w-3.5 opacity-70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          {hasUnread && !isOpen && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#abff44] opacity-70" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-[#abff44] ring-2 ring-white dark:ring-slate-900" />
            </span>
          )}
        </button>
      )}

      {!inHeader && !isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{ backgroundColor: '#08251a', color: '#fffeeb' }}
          className="mk-chat-launcher group relative flex items-center gap-3 pl-2.5 pr-4 py-2 sm:pl-3 sm:pr-4.5 sm:py-2.5 rounded-full cursor-pointer select-none bg-[#08251a] text-[#fffeeb] border-2 border-[#1a1a1a] shadow-[0_0.25rem_0_#1a1a1a,0_0.625rem_1.5rem_rgba(8,37,26,0.28)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_0.375rem_0_#1a1a1a,0_0.875rem_1.875rem_rgba(8,37,26,0.35)] active:translate-y-0.5 active:shadow-[0_0.125rem_0_#1a1a1a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#abff44] max-w-[calc(100vw-2rem)]"
          aria-label={__t("Open Crescelo AI assistant - Instant answers & booking")}
        >
          {/* Orb avatar with live pulse indicator */}
          <div className="relative shrink-0 flex items-center justify-center">
            <div className="transition-transform duration-300 group-hover:scale-105">
              <CresceloOrb size={42} state="idle" followPointer />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3" title={__t("Online now")}>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#abff44] opacity-80" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-[#abff44] ring-2 ring-[#08251a]" />
            </span>
          </div>

          {/* Text descriptions: Title with badge, and subtitle */}
          <div className="flex flex-col text-left leading-tight min-w-0 pr-1">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs sm:text-sm tracking-tight text-[#fffeeb] group-hover:text-[#abff44] transition-colors">
                <T>Chat with Crescelo</T>
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-[#abff44] text-[#08251a] text-[10px] font-extrabold uppercase tracking-wider leading-none shadow-xs">
                <T>AI</T>
              </span>
            </div>
            <span className="text-[11px] sm:text-xs text-[#fffeeb]/75 truncate font-medium">
              <T>Ask anything or book a demo</T>
            </span>
          </div>

          {/* Chat action icon pill on right */}
          <div className="relative shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[#abff44]/15 border border-[#abff44]/35 text-[#abff44] group-hover:bg-[#abff44] group-hover:text-[#08251a] group-hover:border-[#abff44] transition-all duration-300">
            <MessageSquare className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#abff44] opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#abff44] ring-2 ring-[#08251a]" />
              </span>
            )}
          </div>
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label={__t("Crescelo assistant")}
          data-lenis-prevent
          style={{ backgroundColor: '#1a1918', color: '#e8e5dc' }}
          className={`mk-chat-panel flex flex-col bg-[#1f1e1d] ${
            inHeader
              ? 'absolute right-0 top-full mt-2 z-[99999] w-[25rem] h-[35rem] max-h-[calc(100vh-5.5rem)] max-sm:fixed max-sm:inset-x-2 max-sm:top-[4.5rem] max-sm:mt-0 max-sm:w-auto'
              : 'relative w-[calc(100vw-2rem)] sm:w-[23.75rem] md:w-[25.625rem] max-w-[25.625rem] h-[36.25rem] max-h-[85vh]'
          } text-[#e8e5dc] rounded-3xl shadow-[0_28px_90px_rgba(0,0,0,0.55)] border border-white/10 overflow-hidden animate-in fade-in ${
            inHeader ? 'slide-in-from-top-3' : 'slide-in-from-bottom-5'
          } duration-300`}
        >
          {/* soft light from above, the only colour in the panel */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(171,255,68,0.10),transparent)]" aria-hidden="true" />

          {/* Header */}
          <div className="relative flex items-center justify-between px-4 pt-4 pb-3">
            <div className="flex items-center gap-3">
              <CresceloOrb size={44} state={orbState} />
              <div>
                <h3 className="text-[19px] leading-none text-[#faf9f5] tracking-tight" style={serif}>
                  <T>Crescelo</T>
                </h3>
                <p className="mt-1 text-[11px] text-[#a19f96]" aria-live="polite">
                  {orbState === 'thinking' ? <T>{'Thinking…'}</T> : orbState === 'speaking' ? <T>{'Answering…'}</T> : isTakeoverActive ? <T>{`Live Agent Connected (${assignedAgentName})`}</T> : inHeader ? <T>{'Ask about your plan or any setup guide'}</T> : <T>{'Ask about pricing, setup or features'}</T>}
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
                  setConversationToken(null);
                  setIsTakeoverActive(false);
                }}
                title={__t("Start over")}
                aria-label={__t("Start over")}
                className="p-2 text-[#a19f96] hover:text-[#faf9f5] hover:bg-white/[0.06] rounded-xl transition"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title={inHeader ? 'Minimize' : 'Close'}
                aria-label={inHeader ? 'Minimize chat' : 'Close chat'}
                className="p-2 text-[#a19f96] hover:text-[#faf9f5] hover:bg-white/[0.06] rounded-xl transition"
              >
                {inHeader ? <Minus className="w-[18px] h-[18px]" /> : <X className="w-[18px] h-[18px]" />}
              </button>
            </div>
          </div>

          {/* Live Takeover Status Banner */}
          {isTakeoverActive && (
            <div className="mx-4 mt-1 mb-2 px-3 py-1.5 rounded-xl bg-[#08251a] border border-[#abff44]/30 flex items-center justify-between text-[11px] text-[#abff44]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#abff44] animate-pulse" />
                <span className="font-semibold"><T>Live Agent Connected</T> ({assignedAgentName})</span>
              </div>
              <span className="text-[10px] text-[#abff44]/70 font-mono font-medium"><T>AI Paused</T></span>
            </div>
          )}

          {/* Messages */}
          <div data-lenis-prevent className="relative flex-1 min-h-0 overscroll-contain px-4 pt-2 pb-3 overflow-y-auto space-y-4 [scrollbar-width:thin] [scrollbar-color:rgba(250,249,245,0.18)_transparent]">
            {messages.map((m) => {
              if (m.role === 'system') {
                return (
                  <div key={m.id} className="flex justify-center my-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#08251a] border border-[#abff44]/30 text-[#abff44] text-[11px] font-semibold shadow-xs text-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#abff44] animate-pulse shrink-0" />
                      <span>{m.content}</span>
                    </div>
                  </div>
                );
              }

              if (m.role === 'agent') {
                return (
                  <div key={m.id} className="flex gap-2.5 justify-start">
                    <span className="mt-0.5 shrink-0 flex items-center justify-center w-[26px] h-[26px] rounded-full bg-[#abff44] text-[#08251a]">
                      <Headphones className="w-3.5 h-3.5" />
                    </span>
                    <div className="relative group max-w-[84%] px-3.5 py-2.5 text-[13px] leading-relaxed bg-[#1b382b] text-[#faf9f5] border border-[#abff44]/30 rounded-2xl rounded-tl-md">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#abff44] mb-1">
                        <span>{m.senderName || assignedAgentName || 'Live Support Agent'}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#abff44]/20 text-[#abff44] uppercase tracking-wider font-extrabold">Agent</span>
                      </div>
                      <div className="whitespace-pre-wrap break-words">{m.content}</div>
                    </div>
                  </div>
                );
              }

              return (
              <div key={m.id} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <span className="mt-0.5 shrink-0">
                    <CresceloOrb size={26} mark />
                  </span>
                )}

                <div
                  style={
                    m.role === 'user'
                      ? { backgroundColor: '#abff44', color: '#08251a' }
                      : { backgroundColor: '#2c2b29', color: '#e8e5dc' }
                  }
                  className={`mk-chat-msg-${m.role === 'user' ? 'user' : 'bot'} relative group max-w-[84%] px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[#abff44] text-[#08251a] font-medium rounded-2xl rounded-tr-md'
                      : 'bg-[#2c2b29] text-[#e8e5dc] border border-white/[0.06] rounded-2xl rounded-tl-md'
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">
                    {m.content ? (
                      m.role === 'assistant' ? renderRich(actionsOf(m.content).text) : m.content
                    ) : (
                      <span className="flex items-center gap-1 py-1" aria-label={__t("Thinking")}>
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
                            <T>Live agent notified. Someone will join this chat shortly.</T>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => sendMessage('I would like to talk to a live agent')}
                            disabled={isLoading}
                            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.05] px-3 py-1.5 text-[12px] font-medium text-[#e8e5dc] transition hover:border-[#abff44]/50 hover:bg-white/[0.09] disabled:opacity-40"
                          >
                            <T>Talk to a live agent</T>
                          </button>
                        )}
                      </div>
                    );
                  })()}

                  {m.role === 'assistant' && m.actions && m.actions.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {m.actions.map((a, i) => {
                        const primary = a.type === 'change_plan' && a.note !== 'choose';
                        const key = a.type === 'change_plan' ? `plan:${a.planId}:${a.interval}` : a.type;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => runAction(m, a)}
                            disabled={Boolean(busyAction) || isLoading}
                            className={
                              primary
                                ? 'inline-flex items-center gap-1.5 rounded-full bg-[#abff44] px-3.5 py-1.5 text-[12px] font-semibold text-[#08251a] transition hover:brightness-105 active:scale-95 disabled:opacity-50'
                                : 'inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.05] px-3 py-1.5 text-[12px] font-medium text-[#e8e5dc] transition hover:border-[#abff44]/50 hover:bg-white/[0.09] disabled:opacity-40'
                            }
                          >
                            {busyAction === key ? <T>{'Working…'}</T> : <T>{a.label}</T>}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {m.role === 'assistant' && m.content && (
                    <button
                      type="button"
                      onClick={() => handleCopy(m.id, actionsOf(m.content).text)}
                      title={__t("Copy answer")}
                      aria-label={__t("Copy answer")}
                      className="absolute -bottom-2 right-2 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 p-1 text-[#a19f96] hover:text-[#faf9f5] bg-[#33322f] border border-white/10 rounded-md transition"
                    >
                      {copiedId === m.id ? <Check className="w-3 h-3 text-[#abff44]" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

            {/* Suggestions on the first view */}
            {messages.length <= 2 && !isLoading && (
              <div className="pt-1">
                <p className="text-[10.5px] font-semibold text-[#8b8981] uppercase tracking-[0.14em] mb-2"><T>Try asking</T></p>
                <div className="flex flex-wrap gap-1.5">
                  {(inHeader ? DASHBOARD_SUGGESTIONS : DEFAULT_SUGGESTIONS).map((sug, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => sendMessage(sug)}
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#d8d5cb' }}
                      className="mk-chat-pill-btn text-left text-xs text-[#d8d5cb] hover:text-[#faf9f5] bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.16] hover:border-[#abff44]/50 px-3 py-1.5 rounded-full transition duration-200"
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
              style={{ backgroundColor: '#262624' }}
              className="mk-chat-input-box flex items-center gap-2 rounded-2xl border border-white/10 bg-[#262624] pl-3.5 pr-1.5 py-1.5 focus-within:border-[#abff44]/50 transition"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={inHeader ? 'Ask about your plan, or how to set something up…' : 'Ask anything about Crescelo…'}
                disabled={isLoading}
                aria-label={__t("Your question")}
                style={{ outline: 'none', boxShadow: 'none' }}
                className="flex-1 bg-transparent text-[13px] text-[#faf9f5] placeholder-[#8b8981] outline-none focus:outline-none focus-visible:outline-none selection:bg-white/20 selection:text-white py-1.5"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                style={{ backgroundColor: '#abff44', color: '#08251a' }}
                className="grid place-items-center h-9 w-9 rounded-xl bg-[#abff44] text-[#08251a] hover:brightness-105 active:scale-95 disabled:opacity-30 disabled:hover:brightness-100 transition shrink-0"
                aria-label={__t("Send message")}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="mt-2 text-center text-[10.5px] leading-snug text-[#8b8981]"><T>AI assistant, replies may be inaccurate. Messages are processed as described in our</T> <a href="/privacy" className="underline"><T>Privacy Policy</T></a>.</p>
            <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center justify-center gap-1.5 text-[10px] text-[#8b8981]">
              <CresceloMark size={13} motion="draw" />
              <span><T>Powered by</T> <strong className="font-semibold text-[#faf9f5]"><T>Crescelo</T></strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
