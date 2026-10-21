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
  Headphones,
} from 'lucide-react';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { ChatBookingCard } from '@/components/chat/ChatBookingCard';
import { consumeChatStream } from '@/lib/chat/stream';
import { useAdaptivePoll } from '@/lib/chat/use-adaptive-poll';
import { isHandoffActive } from '@/lib/chat/poll-schedule';
import { CresceloMark } from '@/components/brand/CresceloMark';

function getContrastingTextColor(hexColor?: string): string {
  if (!hexColor) return '#ffffff';
  const hex = hexColor.replace('#', '');
  if (hex.length !== 6 && hex.length !== 3) return '#ffffff';
  const fullHex = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
  const r = parseInt(fullHex.substring(0, 2), 16);
  const g = parseInt(fullHex.substring(2, 4), 16);
  const b = parseInt(fullHex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? '#08251a' : '#ffffff';
}

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
      id?: string;
      role: 'user' | 'assistant' | 'agent' | 'system';
      content: string;
      senderName?: string;
      citations?: any[];
      isWebSearch?: boolean;
      attachment?: { name: string; type: string; size?: number };
    }[]
  >([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationToken, setConversationToken] = useState<string | null>(null);
  const [isTakeoverActive, setIsTakeoverActive] = useState(false);
  const [assignedAgentName, setAssignedAgentName] = useState<string>('Live Support Agent');
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

  // Play a subtle audio chime on message send
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  };

  // Play a two-tone chime on receiving an AI reply
  const playReceiveChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.12);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.3);
      gain2.gain.setValueAtTime(0.12, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.55);
    } catch {}
  };

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

  // Real-time Live Operator Sync polling.
  // Uses the per-conversation capability token issued by /api/chat (rather
  // than an admin session) so this endpoint can't be used to read arbitrary
  // conversations by guessing an id. Also fetches incrementally via
  // sinceCount so each poll only transfers new messages, not the whole
  // (ever-growing) transcript.
  // Tracks how many messages (of ANY role) the server confirmed we've
  // already seen, so each poll only asks for what's new since then.
  const knownServerMessageCountRef = useRef(0);
  const currentConvIdRef = useRef<string | null>(null);

  const [handoffActive, setHandoffActive] = useState(false);

  // Start counting from the beginning when the conversation changes to a different one.
  useEffect(() => {
    if (currentConvIdRef.current !== conversationId) {
      currentConvIdRef.current = conversationId;
      knownServerMessageCountRef.current = 0;
      setHandoffActive(false);
    }
  }, [conversationId]);

  const pollConv = async () => {
    if (!conversationId || !conversationToken) return;
    try {
      const params = new URLSearchParams({
        id: conversationId,
        token: conversationToken,
        sinceCount: String(knownServerMessageCountRef.current),
      });
      const res = await fetch(`/api/conversations?${params.toString()}`);
      if (!res.ok) return;
      const data = await res.json();
      if (!data || !data.conversation) return;

      const conv = data.conversation;
      setIsTakeoverActive(Boolean(conv.isLiveTakeover));
      setHandoffActive(isHandoffActive(conv));
      if (conv.assignedAgentName) setAssignedAgentName(conv.assignedAgentName);

      if (typeof data.totalMessageCount === 'number') {
        knownServerMessageCountRef.current = data.totalMessageCount;
      }

      const incomingMessages = data.newMessages || [];
      if (incomingMessages.length === 0) return;

      setMessages((prev) => {
        const prevIds = new Set(prev.map((m) => m.id).filter(Boolean));
        const newMessagesToAdd = incomingMessages.filter(
          (m: any) => (m.role === 'agent' || m.role === 'system') && (!m.id || !prevIds.has(m.id))
        );

        if (newMessagesToAdd.length === 0) return prev;

        const formatted = newMessagesToAdd.map((m: any) => ({
          id: m.id,
          role: m.role as 'agent' | 'system',
          content: m.content,
          senderName: m.senderName || conv.assignedAgentName || 'Live Support Agent',
        }));

        return [...prev, ...formatted];
      });
    } catch {
      // Silent polling error
    }
  };

  // The pace follows what is happening (lib/chat/poll-schedule.ts): quick while a person is involved or the visitor is active,
  // slow when idle, and not at all in a hidden tab. It used to ask every 2.5 seconds for as long as the page was open.
  useAdaptivePoll(pollConv, { enabled: Boolean(conversationId && conversationToken), handoffActive: handoffActive || isTakeoverActive });

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
    playChime();
    setIsStreaming(true);
    setStreamingStatus(null);

    if (!isTakeoverActive) {
      const assistantPlaceholder = {
        role: 'assistant' as const,
        content: '',
        citations: [],
      };
      setMessages([...newMessages, assistantPlaceholder]);
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId,
          visitorId,
          conversationId: conversationId || undefined,
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

      let replyCitations: any[] = [];
      let isWebSearch = false;

      await consumeChatStream(res.body, {
        onToken: (accumulated) => {
          setStreamingStatus(null);
          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
              updated[lastIdx] = {
                ...updated[lastIdx],
                content: accumulated,
                citations: replyCitations,
                isWebSearch: isWebSearch,
              };
            }
            return updated;
          });
        },
        onStatus: (statusText) => {
          setStreamingStatus(statusText);
        },
        onCitations: (citations, webSearch) => {
          replyCitations = citations;
          isWebSearch = Boolean(webSearch);
          setStreamingStatus(null);
        },
        onTakeover: (agentName, convId, convToken) => {
          if (convId) setConversationId(convId);
          if (convToken) setConversationToken(convToken);
          setIsTakeoverActive(true);
          if (agentName) setAssignedAgentName(agentName);
          setStreamingStatus(null);
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.role === 'assistant' && !last.content) {
              return prev.slice(0, -1);
            }
            return prev;
          });
        },
        onDone: (convId, convToken) => {
          if (convId) setConversationId(convId);
          if (convToken) setConversationToken(convToken);
          playReceiveChime();
        },
      });
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
      setConversationId(null);
      setConversationToken(null);
      setIsTakeoverActive(false);
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
  const primaryTextColor = getContrastingTextColor(primaryColor);

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans text-slate-900 dark:text-slate-100 antialiased">
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 py-3 shrink-0 shadow-xs"
        style={{ backgroundColor: primaryColor, color: primaryTextColor }}
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
        {/* Live Agent Takeover Banner */}
        {isTakeoverActive && (
          <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl px-3 py-2 flex items-center justify-between text-xs text-purple-700 dark:text-purple-300 shadow-xs">
            <div className="flex items-center gap-2 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <div className="flex items-center gap-1.5">
                <Headphones className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                <span>Live Support Agent Connected ({assignedAgentName})</span>
              </div>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/60 px-2 py-0.5 rounded-full border border-purple-300/50 dark:border-purple-750">
              AI Paused
            </span>
          </div>
        )}

        {messages.map((msg, index) => {
          if (msg.role === 'system') {
            return (
              <div key={msg.id || index} className="flex justify-center my-2">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold shadow-xs text-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span>{msg.content}</span>
                </div>
              </div>
            );
          }

          if (msg.role === 'agent') {
            const hasBookingAction =
              msg.content.includes('[ACTION:BOOKING_FORM]') ||
              /\[BOOKING_FORM\]/i.test(msg.content);
            const cleanContent = msg.content
              .replace(/\s*\[ACTION:[A-Z_]+\]/g, '')
              .replace(/\s*\[BOOKING_FORM\]/gi, '')
              .trim();
            return (
              <div key={index} className="flex flex-col items-start">
                <div className="max-w-[88%] sm:max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs bg-white dark:bg-slate-900 border-1.5 border-purple-300 dark:border-purple-700 text-slate-900 dark:text-slate-100 rounded-bl-xs">
                  <div className="flex items-center gap-1.5 font-bold text-purple-600 dark:text-purple-400 text-[11px] mb-1.5 pb-1 border-b border-purple-100 dark:border-purple-900/50">
                    <Headphones className="h-3 w-3" />
                    <span>{msg.senderName || assignedAgentName || 'Live Support Agent'}</span>
                    <span className="ml-auto text-[9.5px] font-normal text-purple-500 dark:text-purple-400 opacity-80">Support Team</span>
                  </div>
                  {cleanContent && <MarkdownRenderer content={cleanContent} />}
                  {hasBookingAction && (
                    <div className="mt-3">
                      <ChatBookingCard
                        assistantId={assistantId}
                        primaryColor={primaryColor}
                        businessName={config?.name || 'Our Team'}
                        conversationId={conversationId || undefined}
                        availableDays={config?.bookingAvailableDays}
                        startHour={config?.bookingStartHour}
                        endHour={config?.bookingEndHour}
                        slotMinutes={config?.bookingSlotDuration}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          }

          const isUser = msg.role === 'user';
          return (
            <div key={index} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs ${
                  isUser
                    ? 'rounded-br-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs'
                }`}
                style={isUser ? { backgroundColor: primaryColor, color: primaryTextColor } : undefined}
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
                    {(() => {
                      const hasBookingAction = msg.content.includes('[ACTION:BOOKING_FORM]') || /\[BOOKING_FORM\]/i.test(msg.content);
                      const cleanContent = msg.content.replace(/\s*\[ACTION:[A-Z_]+\]/g, '').replace(/\s*\[BOOKING_FORM\]/gi, '').trim();
                      return (
                        <>
                          {cleanContent && <MarkdownRenderer content={cleanContent} />}
                          {hasBookingAction && (
                            <ChatBookingCard
                              assistantId={assistantId}
                              primaryColor={primaryColor}
                              businessName={config?.name || 'Our Team'}
                              conversationId={conversationId || undefined}
                              availableDays={config?.bookingAvailableDays}
                              startHour={config?.bookingStartHour}
                              endHour={config?.bookingEndHour}
                              slotMinutes={config?.bookingSlotDuration}
                            />
                          )}
                        </>
                      );
                    })()}
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
            className="p-2 rounded-xl disabled:opacity-40 transition shadow-xs cursor-pointer shrink-0"
            style={{ backgroundColor: primaryColor, color: primaryTextColor }}
            title="Send Message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        {/* Branding */}
        <div className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5 pt-1">
          {config.whiteLabelEnabled ? (
            config.customBrandingText ? (
              config.customBrandingUrl ? (
                <a
                  href={config.customBrandingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline font-medium text-slate-500 dark:text-slate-400"
                >
                  {config.customBrandingText}
                </a>
              ) : (
                <span className="font-medium text-slate-500 dark:text-slate-400">{config.customBrandingText}</span>
              )
            ) : null
          ) : (
            <a
              href="https://crescelo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition group"
            >
              <CresceloMark size={13} motion="draw" />
              <span>
                Powered by <strong className="font-semibold text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-white transition">Crescelo</strong>
              </span>
            </a>
          )}
        </div>
      </footer>
    </div>
  );
}
