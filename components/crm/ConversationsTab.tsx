import { T } from '@/lib/i18n/context';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import {
  History,
  RefreshCw,
  MessageSquare,
  AlertCircle,
  ThumbsUp,
  CheckCircle2,
  Headphones,
  Download,
  Globe,
  Calendar,
  Send,
  Bot,
  Search,
  Star,
  Zap,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  ShieldCheck,
  FileText,
  User,
  Filter,
  X,
} from 'lucide-react';
import {
  enrichConversation,
  detectLanguage,
  MessageToolCall,
} from '@/lib/chat/conversation-enrichment';

export interface ConversationsTabProps {
  activeAssistant: any;
  setActiveTab: (tab: any) => void;
  conversations: any[];
  setConversations: React.Dispatch<React.SetStateAction<any[]>>;
  isLoadingConversations: boolean;
  fetchConversations: (assistantId: string) => Promise<void>;
  playNotificationChime?: () => void;
  targetConversationId?: string | null;
  onClearTargetConversationId?: () => void;
}

export const ConversationsTab: React.FC<ConversationsTabProps> = ({
  activeAssistant,
  setActiveTab,
  conversations,
  setConversations,
  isLoadingConversations,
  fetchConversations,
  playNotificationChime,
  targetConversationId,
  onClearTargetConversationId,
}) => {
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'bot' | 'waiting_for_agent' | 'live_agent' | 'resolved'>('all');
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'urgent' | 'positive' | 'neutral'>('all');
  const [agentNameInput, setAgentNameInput] = useState<string>('Alex (Support)');
  const [agentReplyText, setAgentReplyText] = useState<string>('');
  const [isSendingAgentMessage, setIsSendingAgentMessage] = useState<boolean>(false);
  const [expandedToolTurns, setExpandedToolTurns] = useState<Record<string, boolean>>({});

  // Ensure every conversation in the list is fully enriched with title, language, summary, and metrics
  const enrichedConversations = useMemo(() => {
    return (conversations || []).map((c) => enrichConversation(c, activeAssistant));
  }, [conversations, activeAssistant]);

  // Maintain list sorted by most recent activity descending so latest chat is always at top
  const sortedConversations = useMemo(() => {
    const list = [...enrichedConversations];
    list.sort((a, b) => {
      const aLastMsg = a.messages && a.messages.length > 0
        ? new Date(a.messages[a.messages.length - 1].createdAt).getTime()
        : 0;
      const bLastMsg = b.messages && b.messages.length > 0
        ? new Date(b.messages[b.messages.length - 1].createdAt).getTime()
        : 0;
      const aTime = Math.max(
        aLastMsg,
        a.updatedAt ? new Date(a.updatedAt).getTime() : 0,
        a.createdAt ? new Date(a.createdAt).getTime() : 0
      );
      const bTime = Math.max(
        bLastMsg,
        b.updatedAt ? new Date(b.updatedAt).getTime() : 0,
        b.createdAt ? new Date(b.createdAt).getTime() : 0
      );
      return bTime - aTime;
    });
    return list;
  }, [enrichedConversations]);

  // Filter conversations by search query and status
  const filteredConversations = useMemo(() => {
    return sortedConversations.filter((conv) => {
      // 1. Status Filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'waiting_for_agent') {
          const isWaiting = conv.status === 'waiting_for_agent' || (conv.escalated && !conv.resolved && !conv.isLiveTakeover);
          if (!isWaiting) return false;
        } else if (statusFilter === 'live_agent') {
          const isLive = conv.status === 'live_agent' || conv.isLiveTakeover;
          if (!isLive) return false;
        } else if (statusFilter === 'resolved') {
          if (!conv.resolved && conv.status !== 'resolved') return false;
        } else if (statusFilter === 'bot') {
          const isBot = conv.status === 'bot' || (!conv.isLiveTakeover && conv.status !== 'waiting_for_agent' && !conv.resolved);
          if (!isBot) return false;
        }
      }

      // 2. Sentiment Filter
      if (sentimentFilter !== 'all') {
        if (sentimentFilter === 'urgent' && conv.sentiment !== 'urgent' && !conv.escalated) return false;
        if (sentimentFilter === 'positive' && conv.sentiment !== 'positive') return false;
        if (sentimentFilter === 'neutral' && conv.sentiment !== 'neutral' && conv.sentiment) return false;
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = conv.title?.toLowerCase().includes(q);
        const inSummary = conv.summary?.toLowerCase().includes(q);
        const inLanguage = conv.language?.toLowerCase().includes(q);
        const inVisitor = conv.visitorId?.toLowerCase().includes(q) ||
          conv.visitorEmail?.toLowerCase().includes(q) ||
          conv.visitorName?.toLowerCase().includes(q) ||
          conv.id?.toLowerCase().includes(q);
        const inMessages = (conv.messages || []).some((m: any) =>
          m.content?.toLowerCase().includes(q)
        );
        if (!inTitle && !inSummary && !inLanguage && !inVisitor && !inMessages) {
          return false;
        }
      }

      return true;
    });
  }, [sortedConversations, statusFilter, sentimentFilter, searchQuery]);

  // Overall At-a-Glance Metrics
  const stats = useMemo(() => {
    const total = sortedConversations.length;
    let totalMessages = 0;
    let totalTokens = 0;
    let totalCost = 0;
    let ratingSum = 0;
    let ratedCount = 0;
    let positiveCount = 0;
    let waitingCount = 0;
    let liveCount = 0;
    let resolvedCount = 0;
    let botCount = 0;

    for (const c of sortedConversations) {
      const msgs = c.messages || [];
      totalMessages += msgs.length;
      totalTokens += c.tokensUsed || 0;
      totalCost += c.costUsd || 0;

      const r = c.rating || 5.0;
      ratingSum += r;
      ratedCount++;
      if (r >= 4.0 || c.sentiment === 'positive' || c.resolved) {
        positiveCount++;
      }

      if (c.status === 'waiting_for_agent' && !c.isLiveTakeover) {
        waitingCount++;
      } else if (c.isLiveTakeover || c.status === 'live_agent') {
        liveCount++;
      } else if (c.resolved) {
        resolvedCount++;
      } else {
        botCount++;
      }
    }

    const avgRating = ratedCount > 0 ? ratingSum / ratedCount : 5.0;
    const satisfactionPct = total > 0 ? Math.round((positiveCount / total) * 100) : 100;
    const avgCostPerConv = total > 0 ? totalCost / total : 0;
    const avgTurnsPerConv = total > 0 ? Math.round((totalMessages / total) * 10) / 10 : 0;

    return {
      total,
      totalMessages,
      totalTokens,
      totalCost,
      avgRating,
      satisfactionPct,
      avgCostPerConv,
      avgTurnsPerConv,
      waitingCount,
      liveCount,
      resolvedCount,
      botCount,
      activeCount: botCount + waitingCount + liveCount,
    };
  }, [sortedConversations]);

  const handleToggleConversationStatus = async (convId: string, resolved: boolean) => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: convId, resolved, status: resolved ? 'resolved' : 'bot' }),
      });
      if (res.ok) {
        setConversations((prev) =>
          prev.map((c) => (c.id === convId ? { ...c, resolved, status: resolved ? 'resolved' : 'bot' } : c))
        );
        if (selectedConversation && selectedConversation.id === convId) {
          setSelectedConversation((prev: any) => ({ ...prev, resolved, status: resolved ? 'resolved' : 'bot' }));
        }
      }
    } catch (err) {
      console.error('Failed to update conversation status', err);
    }
  };

  const handleSetConversationRating = async (convId: string, rating: number) => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: convId, rating }),
      });
      if (res.ok) {
        setConversations((prev) =>
          prev.map((c) => (c.id === convId ? { ...c, rating } : c))
        );
        if (selectedConversation && selectedConversation.id === convId) {
          setSelectedConversation((prev: any) => ({ ...prev, rating }));
        }
      }
    } catch (err) {
      console.error('Failed to update conversation rating', err);
    }
  };

  const handleToggleTakeover = async (convId: string, isLiveTakeover: boolean) => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: convId,
          isLiveTakeover,
          assignedAgentName: agentNameInput.trim() || 'Support Agent',
          status: isLiveTakeover ? 'live_agent' : 'bot',
        }),
      });
      if (res.ok) {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  isLiveTakeover,
                  assignedAgentName: agentNameInput.trim() || 'Support Agent',
                  status: isLiveTakeover ? 'live_agent' : 'bot',
                }
              : c
          )
        );
        if (selectedConversation && selectedConversation.id === convId) {
          setSelectedConversation((prev: any) => ({
            ...prev,
            isLiveTakeover,
            assignedAgentName: agentNameInput.trim() || 'Support Agent',
            status: isLiveTakeover ? 'live_agent' : 'bot',
          }));
        }
      }
    } catch (err) {
      console.error('Failed to toggle live takeover', err);
    }
  };

  const handleSendAgentMessage = async () => {
    if (!selectedConversation || !agentReplyText.trim() || isSendingAgentMessage) return;
    const textToSend = agentReplyText.trim();
    setIsSendingAgentMessage(true);
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: textToSend,
          agentName: agentNameInput.trim() || 'Support Agent',
          takeover: true,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAgentReplyText('');
        if (data.message) {
          selectedConvKnownCountRef.current = (selectedConvKnownCountRef.current || 0) + 1;
          setSelectedConversation((prev: any) => {
            if (!prev) return prev;
            const existingIds = new Set((prev.messages || []).map((m: any) => m.id).filter(Boolean));
            if (data.message.id && existingIds.has(data.message.id)) {
              return prev;
            }
            return {
              ...prev,
              isLiveTakeover: true,
              messages: [...(prev.messages || []), data.message],
            };
          });
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id !== selectedConversation.id) return c;
              const existingIds = new Set((c.messages || []).map((m: any) => m.id).filter(Boolean));
              if (data.message.id && existingIds.has(data.message.id)) {
                return c;
              }
              return {
                ...c,
                isLiveTakeover: true,
                updatedAt: new Date().toISOString(),
                messages: [...(c.messages || []), data.message],
              };
            })
          );
        }
      }
    } catch (err) {
      console.error('Failed to send agent message', err);
    } finally {
      setIsSendingAgentMessage(false);
    }
  };

  const toggleToolTurn = (msgId: string) => {
    setExpandedToolTurns((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  function downloadConversationTranscript(conv: any) {
    if (!conv || !conv.messages || conv.messages.length === 0) return;
    const assistantName = activeAssistant?.name || 'AI Assistant';
    const dateStr = new Date(conv.createdAt).toLocaleString();
    const enriched = enrichConversation(conv, activeAssistant);

    const linesArr = [
      '================================================================================',
      `${assistantName.toUpperCase()} - FULL CONVERSATION TRANSCRIPT & AUDIT LOG`,
      '================================================================================',
      `Session ID:       ${enriched.id}`,
      `Title:            ${enriched.title || 'Untitled Session'}`,
      `Language:         ${enriched.language || 'English'}`,
      `Customer Rating:  ${enriched.rating ? `${enriched.rating} / 5.0 Stars` : 'Unrated (5.0 default)'}`,
      `Status:           ${enriched.status || (enriched.resolved ? 'Resolved' : 'Bot')}`,
      `Started:          ${dateStr}`,
      `Total Messages:   ${enriched.messages?.length || 0}`,
      `Total Tokens:     ${enriched.tokensUsed || 0}`,
      `Estimated Cost:   $${(enriched.costUsd || 0).toFixed(5)} USD`,
      '--------------------------------------------------------------------------------',
      'AI EXECUTIVE SUMMARY:',
      enriched.summary || 'General visitor conversation.',
      '================================================================================',
      '',
    ];

    (enriched.messages || []).forEach((m: any, idx: number) => {
      const time = new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      let sender = 'Visitor';
      if (m.role === 'agent') sender = `Live Agent (${m.senderName || 'Support'})`;
      else if (m.role === 'assistant') sender = `${assistantName} (AI Agent)`;
      else if (m.role === 'system') sender = 'System Event';

      linesArr.push(`[${time}] Turn #${idx + 1} - ${sender}:`);

      // Record tools and skills used
      const tools = m.toolsUsed || [];
      const skills = m.skillsUsed || [];
      if (tools.length > 0 || skills.length > 0) {
        linesArr.push(`  * Skills Used: ${skills.length > 0 ? skills.join(', ') : 'Standard Cognition'}`);
        tools.forEach((t: MessageToolCall) => {
          linesArr.push(`  * Tool Executed: [${t.displayName || t.name}]`);
          if (t.input) linesArr.push(`    - Tool Input:  ${JSON.stringify(t.input)}`);
          if (t.output) linesArr.push(`    - Tool Output: ${JSON.stringify(t.output)}`);
        });
      }

      if (m.tokensUsed) {
        linesArr.push(`  * Turn Usage: ${m.tokensUsed} tokens (~$${(m.costUsd || 0).toFixed(5)})`);
      }

      linesArr.push(`  Content:`);
      linesArr.push(`  ${m.content.replace(/\n/g, '\n  ')}`);
      linesArr.push('');
    });

    linesArr.push('================================================================================');
    linesArr.push('END OF TRANSCRIPT');
    linesArr.push('================================================================================');

    const blob = new Blob([linesArr.join('\r\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript_${conv.id.slice(0, 10)}_${(conv.title || 'chat').toLowerCase().replace(/[^a-z0-9]/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const handleSelectConversation = async (conv: any) => {
    const enriched = enrichConversation(conv, activeAssistant);
    setSelectedConversation(enriched);
    selectedConvKnownCountRef.current = conv.messages?.length || 0;
    try {
      const res = await fetch(`/api/conversations?id=${encodeURIComponent(conv.id)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.conversation) {
          const freshEnriched = enrichConversation(data.conversation, activeAssistant);
          setSelectedConversation(freshEnriched);
          selectedConvKnownCountRef.current = freshEnriched.messages?.length || 0;
        }
      }
    } catch {
      // Keep state if fetch fails
    }
  };

  // Auto-select conversation from notification target or default to topmost
  useEffect(() => {
    if (targetConversationId && sortedConversations.length > 0) {
      const target = sortedConversations.find((c) => c.id === targetConversationId);
      if (target) {
        handleSelectConversation(target);
        if (onClearTargetConversationId) onClearTargetConversationId();
        return;
      }
    }

    if (targetConversationId && !sortedConversations.find((c) => c.id === targetConversationId)) {
      fetch(`/api/conversations?id=${encodeURIComponent(targetConversationId)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.conversation) {
            const enriched = enrichConversation(d.conversation, activeAssistant);
            setConversations((prev) => [enriched, ...prev.filter((c) => c.id !== d.conversation.id)]);
            setSelectedConversation(enriched);
            selectedConvKnownCountRef.current = enriched.messages?.length || 0;
            if (onClearTargetConversationId) onClearTargetConversationId();
          }
        })
        .catch(() => undefined);
      return;
    }

    if (!selectedConversation && sortedConversations.length > 0) {
      handleSelectConversation(sortedConversations[0]);
    }
  }, [targetConversationId, sortedConversations]);

  // Live polling for selected conversation in Conversations tab
  const selectedConvKnownCountRef = useRef(0);
  useEffect(() => {
    if (!selectedConversation) return;
    selectedConvKnownCountRef.current = selectedConversation.messages?.length || 0;

    const pollOnce = async () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      try {
        const params = new URLSearchParams({
          id: selectedConversation.id,
          sinceCount: String(selectedConvKnownCountRef.current),
        });
        const res = await fetch(`/api/conversations?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.conversation) {
            if (typeof data.totalMessageCount === 'number') {
              selectedConvKnownCountRef.current = data.totalMessageCount;
            }
            const incoming = data.newMessages || [];

            setSelectedConversation((prev: any) => {
              if (!prev || prev.id !== data.conversation.id) return prev;
              const existingIds = new Set((prev.messages || []).map((m: any) => m.id).filter(Boolean));
              const trulyNew = incoming.filter((m: any) => !m.id || !existingIds.has(m.id));

              if (trulyNew.length === 0 && prev.isLiveTakeover === data.conversation.isLiveTakeover) {
                return prev;
              }
              if (trulyNew.length > 0) {
                const lastMsg = trulyNew[trulyNew.length - 1];
                if (lastMsg && lastMsg.role === 'user' && playNotificationChime) {
                  playNotificationChime();
                }
              }
              const merged = {
                ...prev,
                ...data.conversation,
                messages: [...(prev.messages || []), ...trulyNew],
              };
              return enrichConversation(merged, activeAssistant);
            });

            if (incoming.length > 0) {
              setConversations((prev) =>
                prev.map((c) => {
                  if (c.id !== data.conversation.id) return c;
                  const existingIds = new Set((c.messages || []).map((m: any) => m.id).filter(Boolean));
                  const trulyNew = incoming.filter((m: any) => !m.id || !existingIds.has(m.id));
                  const merged = {
                    ...c,
                    ...data.conversation,
                    messages: [...(c.messages || []), ...trulyNew],
                  };
                  return enrichConversation(merged, activeAssistant);
                })
              );
            }
          }
        }
      } catch (e) {
        // silent
      }
    };

    pollOnce();
    const isLiveActive = Boolean(
      selectedConversation?.isLiveTakeover ||
      selectedConversation?.status === 'waiting_for_agent' ||
      selectedConversation?.status === 'live_agent'
    );
    const pollIntervalMs = isLiveActive ? 2000 : 8000;
    const interval = setInterval(pollOnce, pollIntervalMs);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        pollOnce();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [selectedConversation?.id, selectedConversation?.isLiveTakeover, selectedConversation?.status, playNotificationChime, activeAssistant]);

  return (
    <div className="max-w-6xl space-y-6 mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <History className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span><T>Chat History &amp; Admin Intelligence</T></span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            <T>Inspect transcripts, audit agent tools &amp; skills, review AI summaries, and step in with live takeover.</T>
          </p>
        </div>
        <button
          type="button"
          onClick={() => activeAssistant && fetchConversations(activeAssistant.id)}
          disabled={isLoadingConversations}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition shadow-xs cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoadingConversations ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
          <span><T>Refresh Logs</T></span>
        </button>
      </div>

      {/* FEATURE 1: Conversations, ratings, usage and AI cost at a glance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Conversations at a glance */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span><T>Conversations</T></span>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              {stats.activeCount} <T>active</T>
            </span>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 flex-wrap text-[10px]">
            <span className="px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-900">
              {stats.botCount} <T>Bot</T>
            </span>
            {stats.waitingCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-800 animate-pulse">
                {stats.waitingCount} <T>Waiting</T>
              </span>
            )}
            {stats.liveCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800">
                {stats.liveCount} <T>Live</T>
              </span>
            )}
            <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-900">
              {stats.resolvedCount} <T>Resolved</T>
            </span>
          </div>
        </div>

        {/* Customer Ratings at a glance */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span><T>Ratings &amp; CSAT</T></span>
            <Star className="h-4 w-4 text-amber-500 fill-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-1">
              {stats.avgRating.toFixed(1)}
              <span className="text-xs text-amber-500">★</span>
            </span>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              / 5.0 CSAT
            </span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-0.5 text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3 w-3 ${
                    star <= Math.round(stats.avgRating)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-300 dark:text-slate-700'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              {stats.satisfactionPct}% <T>satisfaction</T>
            </span>
          </div>
        </div>

        {/* Usage at a glance */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span><T>Usage &amp; Activity</T></span>
            <Zap className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.totalMessages}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <T>messages</T>
            </span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[10.5px] text-slate-500 dark:text-slate-400">
            <span>{(stats.totalTokens).toLocaleString()} <T>tokens</T></span>
            <span>~{stats.avgTurnsPerConv} <T>msgs/chat</T></span>
          </div>
        </div>

        {/* AI Cost at a glance */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span><T>AI Cost</T></span>
            <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              ${stats.totalCost.toFixed(4)}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-900">
              <T>Est. spend</T>
            </span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[10.5px] text-slate-500 dark:text-slate-400">
            <span><T>Avg:</T> ${(stats.avgCostPerConv).toFixed(4)}/<T>chat</T></span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">&lt; $0.01/<T>session</T></span>
          </div>
        </div>
      </div>

      {sortedConversations.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center shadow-xs space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <MessageSquare className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white"><T>No Conversations Recorded Yet</T></h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            <T>When visitors start chatting with your bot in the widget or Testing Studio, full transcripts will appear here.</T>
          </p>
          <button
            onClick={() => setActiveTab('playground')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <span><T>Open Testing Studio &rarr;</T></span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* FEATURE 2: Search and filter conversations by status */}
          <div className="lg:col-span-5 min-w-0 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs flex flex-col">
            {/* Search Box */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2.5">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search title, visitor, summary, messages..."
                  className="w-full text-xs pl-8 pr-7 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none focus:ring-1 focus:ring-blue-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[11px]">
                {[
                  { id: 'all', label: 'All', count: stats.total },
                  { id: 'bot', label: 'AI Bot', count: stats.botCount },
                  { id: 'waiting_for_agent', label: 'Waiting', count: stats.waitingCount },
                  { id: 'live_agent', label: 'Live', count: stats.liveCount },
                  { id: 'resolved', label: 'Resolved', count: stats.resolvedCount },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id as any)}
                    className={`px-2 py-1 rounded-md font-semibold transition shrink-0 cursor-pointer ${
                      statusFilter === tab.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`ml-1 text-[10px] px-1 py-0.2 rounded-full ${
                      statusFilter === tab.id ? 'bg-blue-700 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Secondary Sentiment Filter & Counter */}
              <div className="flex items-center justify-between pt-1 text-[10.5px] text-slate-500 dark:text-slate-400">
                <span>
                  Showing {filteredConversations.length} of {sortedConversations.length} sessions
                </span>
                <select
                  value={sentimentFilter}
                  onChange={(e) => setSentimentFilter(e.target.value as any)}
                  className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 py-0.5 text-[10.5px] text-slate-700 dark:text-slate-300 outline-none"
                >
                  <option value="all">All Sentiments</option>
                  <option value="positive">Positive</option>
                  <option value="urgent">Urgent</option>
                  <option value="neutral">Neutral</option>
                </select>
              </div>
            </div>

            {/* FEATURE 3: Every conversation gets a title, its language and an AI summary */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[640px] overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  <p><T>No conversations match your search or filters.</T></p>
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setStatusFilter('all'); setSentimentFilter('all'); }}
                    className="mt-2 text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                  >
                    <T>Reset all filters</T>
                  </button>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = selectedConversation?.id === conv.id;
                  const msgCount = conv.messages?.length || 0;
                  const langInfo = detectLanguage(conv.messages?.map((m: any) => m.content).join(' ') || '');

                  return (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() => handleSelectConversation(conv)}
                      className={`w-full text-left p-3.5 transition flex flex-col gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/70 dark:bg-blue-950/40 border-l-3 border-blue-600'
                          : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Title & Status Badges */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                          {conv.title || `Chat #${conv.id.slice(0, 8)}`}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {conv.status === 'waiting_for_agent' && !conv.isLiveTakeover && (
                            <span className="flex items-center gap-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 text-[9px] font-bold border border-amber-300 dark:border-amber-800 animate-pulse">
                              <Headphones className="h-2.5 w-2.5" /> <T>Waiting</T>
                            </span>
                          )}
                          {conv.isLiveTakeover && (
                            <span className="flex items-center gap-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 text-[9px] font-bold border border-purple-300 dark:border-purple-800">
                              <Headphones className="h-2.5 w-2.5" /> <T>Live Agent</T>
                            </span>
                          )}
                          {conv.resolved && (
                            <span className="flex items-center gap-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 text-[9px] font-bold border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="h-2.5 w-2.5" /> <T>Solved</T>
                            </span>
                          )}
                          <span className="flex items-center gap-0.5 text-[10px] text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-800/40">
                            ★ {(conv.rating || 5.0).toFixed(1)}
                          </span>
                        </div>
                      </div>

                      {/* AI Summary Snippet */}
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        <span className="text-slate-400 italic">Summary:</span> {conv.summary || 'Visitor conversation.'}
                      </div>

                      {/* Metadata: Language, Messages, Tokens, Cost, Timestamp */}
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
                            <span>{langInfo.flag}</span>
                            <span>{conv.language || langInfo.name}</span>
                          </span>
                          <span>&bull;</span>
                          <span>{msgCount} <T>msgs</T></span>
                          <span>&bull;</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            ${(conv.costUsd || 0).toFixed(4)}
                          </span>
                        </div>
                        <div>
                          {new Date(conv.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Transcript & Details Panel */}
          <div className="lg:col-span-7 min-w-0 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs overflow-hidden">
            {selectedConversation ? (
              <div className="space-y-4">
                {/* Transcript Header with Title, Language, Rating, Actions */}
                <div className="pb-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">
                          {selectedConversation.title || `Chat Session ${selectedConversation.id.slice(0, 8)}`}
                        </h2>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10.5px] font-semibold text-slate-700 dark:text-slate-300">
                          <Globe className="h-3 w-3 text-blue-500" />
                          <span>{selectedConversation.language || 'English'}</span>
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>Session ID: <code className="font-mono">{selectedConversation.id}</code></span>
                        <span>&bull;</span>
                        <span>{new Date(selectedConversation.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleTakeover(selectedConversation.id, !selectedConversation.isLiveTakeover)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                          selectedConversation.isLiveTakeover
                            ? 'bg-purple-600 hover:bg-purple-700 text-white border-purple-600 shadow-xs'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40'
                        }`}
                        title={selectedConversation.isLiveTakeover ? "Release back to AI" : "Take over chat as live human agent"}
                      >
                        <Headphones className="h-3.5 w-3.5" />
                        <span>{selectedConversation.isLiveTakeover ? <T>Live Agent (AI Paused)</T> : <T>Take Over Chat</T>}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleConversationStatus(selectedConversation.id, !selectedConversation.resolved)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                          selectedConversation.resolved
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <CheckCircle2 className={`h-3.5 w-3.5 ${selectedConversation.resolved ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                        <span>{selectedConversation.resolved ? <T>Resolved</T> : <T>Mark Resolved</T>}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadConversationTranscript(selectedConversation)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-semibold transition shadow-xs whitespace-nowrap cursor-pointer"
                        title="Download full transcript with agent tool logs"
                      >
                        <Download className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        <span><T>Download Audit Log</T></span>
                      </button>
                    </div>
                  </div>

                  {/* Customer Rating Bar (Interactive) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700 dark:text-slate-300"><T>Customer Rating &amp; CSAT:</T></span>
                      <div className="flex items-center gap-1 text-amber-400">
                        {[1, 2, 3, 4, 5].map((starVal) => {
                          const current = Math.round(selectedConversation.rating || 5.0);
                          return (
                            <button
                              key={starVal}
                              type="button"
                              onClick={() => handleSetConversationRating(selectedConversation.id, starVal)}
                              className="hover:scale-125 transition cursor-pointer"
                              title={`Set rating to ${starVal} stars`}
                            >
                              <Star
                                className={`h-4 w-4 ${
                                  starVal <= current
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-slate-300 dark:text-slate-600'
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {(selectedConversation.rating || 5.0).toFixed(1)} / 5.0
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                      <span><T>Usage:</T> <strong>{selectedConversation.tokensUsed || 0}</strong> <T>tokens</T></span>
                      <span>&bull;</span>
                      <span><T>Est. AI Cost:</T> <strong className="text-emerald-600 dark:text-emerald-400">${(selectedConversation.costUsd || 0).toFixed(5)}</strong></span>
                    </div>
                  </div>

                  {/* FEATURE 3: AI Summary Box */}
                  <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-200">
                      <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span><T>AI Executive Summary</T></span>
                    </div>
                    <p className="text-xs text-blue-950 dark:text-blue-100 leading-relaxed font-normal">
                      {selectedConversation.summary || 'Summary generating...'}
                    </p>
                  </div>
                </div>

                {/* Waiting for Agent Attention Banner */}
                {selectedConversation.status === 'waiting_for_agent' && !selectedConversation.isLiveTakeover && (
                  <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="relative flex h-3 w-3 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                      </span>
                      <div>
                        <div className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                          <Headphones className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                          <span><T>Customer Waiting for Live Agent</T></span>
                        </div>
                        <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                          <T>Visitor requested human assistance. Click to take over and start typing real-time responses.</T>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleTakeover(selectedConversation.id, true)}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition shrink-0 cursor-pointer flex items-center gap-1.5"
                    >
                      <Headphones className="h-3.5 w-3.5" />
                      <span><T>Accept &amp; Take Over</T></span>
                    </button>
                  </div>
                )}

                {/* Live Operator Active Banner */}
                {selectedConversation.isLiveTakeover && (
                  <div className="bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/80 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span className="font-semibold text-purple-900 dark:text-purple-200">
                        <T>Live Operator Mode Active &bull; Assigned to:</T> <strong>{selectedConversation.assignedAgentName || agentNameInput}</strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleTakeover(selectedConversation.id, false)}
                      className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-950/60 px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1"
                    >
                      <Bot className="h-3 w-3 text-purple-500" />
                      <span><T>Hand Back to AI</T></span>
                    </button>
                  </div>
                )}

                {/* FEATURE 4: Full transcripts that show which skills and tools the agent used */}
                <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2">
                  {(selectedConversation.messages || []).map((m: any, idx: number) => {
                    if (m.role === 'system') {
                      return (
                        <div key={m.id || idx} className="flex justify-center my-2">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-[11px] font-semibold text-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                            <span>{m.content}</span>
                          </div>
                        </div>
                      );
                    }

                    const isUser = m.role === 'user';
                    const isAgent = m.role === 'agent';
                    const isAssistant = m.role === 'assistant';
                    const tools: MessageToolCall[] = m.toolsUsed || [];
                    const skills: string[] = m.skillsUsed || [];
                    const isExpanded = Boolean(expandedToolTurns[m.id || String(idx)]);

                    return (
                      <div
                        key={m.id || idx}
                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                      >
                        {/* Turn Header */}
                        <div className="text-[10px] text-slate-400 mb-1 px-1 flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-600 dark:text-slate-300">
                            {isUser ? <T>Visitor</T> : isAgent ? (m.senderName || <T>Live Agent</T>) : `${activeAssistant?.name || 'AI Assistant'}`}
                          </span>
                          <span>&bull;</span>
                          <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                          {m.tokensUsed > 0 && (
                            <>
                              <span>&bull;</span>
                              <span className="text-slate-500">{m.tokensUsed} tokens</span>
                            </>
                          )}
                          {m.costUsd > 0 && (
                            <>
                              <span>&bull;</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">${(m.costUsd).toFixed(5)}</span>
                            </>
                          )}
                        </div>

                        {/* SKILLS & TOOLS BADGES FOR AGENT TURNS */}
                        {!isUser && (tools.length > 0 || skills.length > 0) && (
                          <div className="mb-1.5 flex items-center gap-1.5 flex-wrap">
                            {skills.map((skillName: string, sIdx: number) => {
                              let badgeColor = 'bg-blue-50 dark:bg-blue-950/70 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300';
                              let icon = <Layers className="h-3 w-3" />;
                              if (skillName.includes('Web')) {
                                badgeColor = 'bg-sky-50 dark:bg-sky-950/70 border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300';
                                icon = <Globe className="h-3 w-3" />;
                              } else if (skillName.includes('Booking') || skillName.includes('Scheduler')) {
                                badgeColor = 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300';
                                icon = <Calendar className="h-3 w-3" />;
                              } else if (skillName.includes('Security') || skillName.includes('FigureGuard')) {
                                badgeColor = 'bg-teal-50 dark:bg-teal-950/70 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300';
                                icon = <ShieldCheck className="h-3 w-3" />;
                              } else if (skillName.includes('Document')) {
                                badgeColor = 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300';
                                icon = <FileText className="h-3 w-3" />;
                              } else if (skillName.includes('Human') || skillName.includes('Operator')) {
                                badgeColor = 'bg-purple-50 dark:bg-purple-950/70 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300';
                                icon = <Headphones className="h-3 w-3" />;
                              }

                              return (
                                <span
                                  key={sIdx}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeColor}`}
                                >
                                  {icon}
                                  <span>{skillName}</span>
                                </span>
                              );
                            })}

                            {/* Collapsible toggle button for tool inputs/outputs */}
                            {tools.length > 0 && (
                              <button
                                type="button"
                                onClick={() => toggleToolTurn(m.id || String(idx))}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9.5px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                              >
                                <span>{tools.length} <T>{tools.length === 1 ? 'tool used' : 'tools used'}</T></span>
                                {isExpanded ? <ChevronUp className="h-2.5 w-2.5" /> : <ChevronDown className="h-2.5 w-2.5" />}
                              </button>
                            )}
                          </div>
                        )}

                        {/* DETAILED TOOL EXECUTION DRAWER */}
                        {!isUser && isExpanded && tools.length > 0 && (
                          <div className="w-full max-w-[90%] mb-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-xs space-y-2">
                            <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 text-[11px]">
                              <Zap className="h-3.5 w-3.5 text-amber-500" />
                              <span><T>Agent Tool Execution Trace:</T></span>
                            </div>
                            <div className="space-y-2">
                              {tools.map((tool, tIdx) => (
                                <div
                                  key={tIdx}
                                  className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1 text-[10.5px]"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                                      {tool.displayName || tool.name}()
                                    </span>
                                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                      status: {tool.status || 'success'}
                                    </span>
                                  </div>
                                  {tool.input && (
                                    <div>
                                      <span className="text-slate-400 font-medium">Input: </span>
                                      <code className="text-slate-700 dark:text-slate-300 font-mono text-[10px]">
                                        {typeof tool.input === 'string' ? tool.input : JSON.stringify(tool.input)}
                                      </code>
                                    </div>
                                  )}
                                  {tool.output && (
                                    <div>
                                      <span className="text-slate-400 font-medium">Output: </span>
                                      <code className="text-slate-700 dark:text-slate-300 font-mono text-[10px]">
                                        {typeof tool.output === 'string' ? tool.output : JSON.stringify(tool.output)}
                                      </code>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Message Bubble Content */}
                        <div
                          className={`rounded-2xl px-4 py-2.5 text-xs max-w-[85%] leading-relaxed ${
                            isUser
                              ? 'bg-[#08251a] text-[#fffeeb] border border-[#12432f] dark:bg-[#abff44]/18 dark:border dark:border-[#abff44]/35 dark:text-[#fffeeb] rounded-br-xs shadow-xs'
                              : isAgent
                              ? 'bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-950 dark:text-purple-100 rounded-bl-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-xs border border-slate-200/80 dark:border-slate-750'
                          }`}
                        >
                          {isAgent && (
                            <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-purple-700 dark:text-purple-300 mb-1 border-b border-purple-200/60 dark:border-purple-800/60 pb-1">
                              <Headphones className="h-3 w-3" />
                              <span>{m.senderName || <T>Live Support Agent</T>}</span>
                            </div>
                          )}

                          {isUser ? (
                            <div className="whitespace-pre-wrap">{m.content}</div>
                          ) : (
                            <div>
                              {(() => {
                                const hasBooking = m.content?.includes('[ACTION:BOOKING_FORM]') || /\[BOOKING_FORM\]/i.test(m.content || '');
                                const clean = (m.content || '')
                                  .replace(/\s*\[ACTION:[A-Z_]+\]/g, '')
                                  .replace(/\s*\[BOOKING_FORM\]/gi, '')
                                  .trim();
                                return (
                                  <>
                                    {clean && <MarkdownRenderer content={clean} />}
                                    {hasBooking && (
                                      <div className="mt-2.5 flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/90 dark:bg-blue-950/50 border border-blue-200/90 dark:border-blue-800/70 text-blue-950 dark:text-blue-200 text-xs shadow-xs">
                                        <div className="h-6 w-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                                          <Calendar className="h-3.5 w-3.5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="font-bold text-blue-900 dark:text-blue-100"><T>Appointment Booking Card Dispatched</T></div>
                                          <div className="text-[10.5px] text-blue-700/80 dark:text-blue-300/80"><T>Interactive booking calendar &amp; slots picker displayed to visitor</T></div>
                                        </div>
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          )}

                          {/* Web Sources Preview */}
                          {(() => {
                            const isLive = Boolean(m.isWebSearch || (m.citations || []).some((cite: any) => cite.isLiveWebSearch));
                            if (!isLive) return null;
                            const webCitations = (m.citations || []).filter((cite: any) => cite && cite.url && (cite.url.startsWith('http://') || cite.url.startsWith('https://')));
                            if (webCitations.length === 0) return null;
                            return (
                              <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-[10.5px]">
                                <div className="font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                                  <Globe className="h-3 w-3 text-sky-500" />
                                  <span><T>Web Sources Consulted:</T></span>
                                </div>
                                <div className="space-y-1">
                                  {webCitations.map((cite: any, cIdx: number) => (
                                    <div key={cIdx} className="text-blue-600 dark:text-blue-400 font-mono text-[10px] flex items-center gap-1.5">
                                      <span>&bull;</span>
                                      <a
                                        href={cite.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:underline flex items-center gap-1 font-semibold"
                                      >
                                        <span>{cite.sourceTitle || <T>Web Source</T>}</span>
                                        <span>↗</span>
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Live Operator Composer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px]">
                    <span className="text-slate-400 shrink-0 font-medium"><T>Quick replies:</T></span>
                    {[
                      'Hello! How can I assist you today?',
                      'Checking on that right now for you!',
                      'Thanks for waiting, I have the details.',
                      'Let me connect you with our team specialist.',
                    ].map((quickText, qIdx) => (
                      <button
                        key={qIdx}
                        type="button"
                        onClick={() => setAgentReplyText(quickText)}
                        className="px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-700 hover:border-purple-300 transition whitespace-nowrap cursor-pointer"
                      >
                        {quickText}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center min-w-0">
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="relative">
                        <input
                          type="text"
                          value={agentNameInput}
                          onChange={(e) => setAgentNameInput(e.target.value)}
                          placeholder="Agent Name"
                          className="w-28 sm:w-32 text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                          title="Your display name to the customer"
                        />
                      </div>
                    </div>

                    <div className="flex-1 flex items-center gap-2 min-w-0">
                      <input
                        type="text"
                        value={agentReplyText}
                        onChange={(e) => setAgentReplyText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendAgentMessage();
                          }
                        }}
                        placeholder={
                          selectedConversation.isLiveTakeover
                            ? "Type reply to visitor (AI paused)..."
                            : "Type reply to take over chat..."
                        }
                        className="flex-1 min-w-0 text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-purple-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setAgentReplyText('[ACTION:BOOKING_FORM] Please select your service, date, and preferred time slot using our appointment booking form below:');
                        }}
                        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0"
                        title="Insert appointment booking card into chat for customer"
                      >
                        <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="hidden md:inline"><T>Booking Form</T></span>
                        <span className="md:hidden"><T>Booking</T></span>
                      </button>
                      <button
                        type="button"
                        onClick={handleSendAgentMessage}
                        disabled={isSendingAgentMessage || !agentReplyText.trim()}
                        className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition shadow-xs cursor-pointer shrink-0"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>{isSendingAgentMessage ? <T>Sending...</T> : <T>Send</T>}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-xs text-slate-400">
                <T>Select a conversation from the left to inspect the transcript.</T>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
