import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';

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
  const [conversationSentimentFilter, setConversationSentimentFilter] = useState<'all' | 'waiting' | 'urgent' | 'positive' | 'neutral'>('all');
  const [agentNameInput, setAgentNameInput] = useState<string>('Alex (Support)');
  const [agentReplyText, setAgentReplyText] = useState<string>('');
  const [isSendingAgentMessage, setIsSendingAgentMessage] = useState<boolean>(false);

  // Maintain list sorted by most recent activity descending so latest chat is always at top
  const sortedConversations = React.useMemo(() => {
    const list = [...(conversations || [])];
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
  }, [conversations]);

  const waitingCount = sortedConversations.filter((c) => c.status === 'waiting_for_agent' && !c.isLiveTakeover).length;

  const handleToggleConversationStatus = async (convId: string, resolved: boolean) => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: convId, resolved }),
      });
      if (res.ok) {
        setConversations((prev) =>
          prev.map((c) => (c.id === convId ? { ...c, resolved } : c))
        );
        if (selectedConversation && selectedConversation.id === convId) {
          setSelectedConversation((prev: any) => ({ ...prev, resolved }));
        }
      }
    } catch (err) {
      console.error('Failed to update conversation status', err);
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
          // Immediately increment local count to prevent subsequent poll from fetching the message we just added
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

  function downloadConversationTranscript(conv: any) {
    if (!conv || !conv.messages || conv.messages.length === 0) return;
    const assistantName = activeAssistant?.name || 'AI Assistant';
    const dateStr = new Date(conv.createdAt).toLocaleString();
    const linesArr = [
      '=======================================================',
      `${assistantName.toUpperCase()} - CONVERSATION TRANSCRIPT`,
      `Session ID: ${conv.id}`,
      `Date Started: ${dateStr}`,
      `Total Messages: ${conv.messages.length}`,
      '=======================================================',
      '',
    ];

    conv.messages.forEach((m: any) => {
      const time = new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const sender = m.role === 'user' ? 'Visitor' : assistantName;
      linesArr.push(`[${time}] ${sender}:`);
      linesArr.push(m.content);
      linesArr.push('');
    });

    const blob = new Blob([linesArr.join('\r\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript_${conv.id}_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const handleSelectConversation = async (conv: any) => {
    // Show immediately with what we have, then fetch fresh data
    setSelectedConversation(conv);
    selectedConvKnownCountRef.current = conv.messages?.length || 0;
    try {
      const res = await fetch(`/api/conversations?id=${encodeURIComponent(conv.id)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.conversation) {
          setSelectedConversation(data.conversation);
          selectedConvKnownCountRef.current = data.conversation.messages?.length || 0;
        }
      }
    } catch {
      // Keep stale data if fetch fails
    }
  };

  // Auto-select conversation from notification target or default to topmost (latest) conversation
  useEffect(() => {
    if (targetConversationId && sortedConversations.length > 0) {
      const target = sortedConversations.find((c) => c.id === targetConversationId);
      if (target) {
        handleSelectConversation(target);
        if (onClearTargetConversationId) onClearTargetConversationId();
        return;
      }
    }

    if (!selectedConversation && sortedConversations.length > 0) {
      handleSelectConversation(sortedConversations[0]);
    }
  }, [targetConversationId, sortedConversations]);

  // Live polling for selected conversation in Conversations tab.
  // Fetches incrementally via sinceCount and deduplicates strictly by message ID
  const selectedConvKnownCountRef = useRef(0);
  useEffect(() => {
    if (!selectedConversation) return;
    selectedConvKnownCountRef.current = selectedConversation.messages?.length || 0;

    const interval = setInterval(async () => {
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
              return {
                ...prev,
                ...data.conversation,
                messages: [...(prev.messages || []), ...trulyNew],
              };
            });

            if (incoming.length > 0) {
              setConversations((prev) =>
                prev.map((c) => {
                  if (c.id !== data.conversation.id) return c;
                  const existingIds = new Set((c.messages || []).map((m: any) => m.id).filter(Boolean));
                  const trulyNew = incoming.filter((m: any) => !m.id || !existingIds.has(m.id));
                  return {
                    ...c,
                    ...data.conversation,
                    messages: [...(c.messages || []), ...trulyNew],
                  };
                })
              );
            }
          }
        }
      } catch (e) {
        // silent
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [selectedConversation?.id, playNotificationChime]);

  return (
              <div className="max-w-6xl space-y-6 mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                      <History className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      <span>Conversation History &amp; Logs</span>
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Inspect real visitor interactions, retrieved knowledge citations, and response transcripts.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => activeAssistant && fetchConversations(activeAssistant.id)}
                    disabled={isLoadingConversations}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition shadow-xs"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isLoadingConversations ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
                    <span>Refresh Logs</span>
                  </button>
                </div>

                {sortedConversations.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center shadow-xs space-y-3">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">No Conversations Recorded Yet</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                      When visitors start chatting with your bot in the widget or Testing Studio, full transcripts will appear here.
                    </p>
                    <button
                      onClick={() => setActiveTab('playground')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
                    >
                      <span>Open Testing Studio &rarr;</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Conversations List */}
                    <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                      <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {sortedConversations.length} Active Sessions
                        </span>
                        <select
                            value={conversationSentimentFilter}
                            onChange={(e) => setConversationSentimentFilter(e.target.value as any)}
                            className="text-[11px] font-medium rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-0.5 text-slate-700 dark:text-slate-300 outline-none"
                          >
                            <option value="all">All Sessions</option>
                            <option value="waiting">Waiting for Agent ({waitingCount})</option>
                            <option value="urgent">Urgent</option>
                            <option value="positive">Positive</option>
                            <option value="neutral">Neutral</option>
                          </select>
                      </div>
                      <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[600px] overflow-y-auto">
                        {sortedConversations
                          .filter((c) => {
                            if (conversationSentimentFilter === 'waiting') {
                              return c.status === 'waiting_for_agent' && !c.isLiveTakeover;
                            }
                            if (conversationSentimentFilter === 'urgent') return c.sentiment === 'urgent' || c.escalated;
                            if (conversationSentimentFilter === 'positive') return c.sentiment === 'positive';
                            if (conversationSentimentFilter === 'neutral') return c.sentiment === 'neutral' || !c.sentiment;
                            return true;
                          })
                          .map((conv) => {
                          const isSelected = selectedConversation?.id === conv.id;
                          const msgCount = conv.messages?.length || 0;
                          const lastMsg = conv.messages && conv.messages[conv.messages.length - 1];
                          return (
                            <button
                              key={conv.id}
                              type="button"
                              onClick={() => handleSelectConversation(conv)}
                              className={`w-full text-left p-3.5 transition flex flex-col gap-1.5 ${
                                isSelected
                                  ? 'bg-blue-50/70 dark:bg-blue-950/40 border-l-3 border-blue-600'
                                  : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-900 dark:text-white font-mono">
                                  {conv.visitorId ? conv.visitorId.slice(0, 14) : conv.id.slice(0, 10)}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  {conv.status === 'waiting_for_agent' && !conv.isLiveTakeover && (
                                    <span className="flex items-center gap-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 text-[9px] font-bold border border-amber-300 dark:border-amber-800 animate-pulse">
                                      <Headphones className="h-2.5 w-2.5" /> Waiting
                                    </span>
                                  )}
                                  {conv.isLiveTakeover && (
                                    <span className="flex items-center gap-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 text-[9px] font-bold border border-purple-300 dark:border-purple-800">
                                      <Headphones className="h-2.5 w-2.5" /> Live Agent
                                    </span>
                                  )}
                                  {conv.sentiment === 'urgent' && conv.status !== 'waiting_for_agent' && (
                                    <span className="flex items-center gap-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 text-[9px] font-bold border border-rose-200 dark:border-rose-800">
                                      <AlertCircle className="h-2.5 w-2.5" /> Urgent
                                    </span>
                                  )}
                                  {conv.sentiment === 'positive' && (
                                    <span className="flex items-center gap-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 text-[9px] font-bold border border-emerald-200 dark:border-emerald-800">
                                      <ThumbsUp className="h-2.5 w-2.5" /> Positive
                                    </span>
                                  )}
                                  {conv.resolved && (
                                    <span className="flex items-center gap-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 text-[9px] font-bold border border-blue-200 dark:border-blue-800">
                                      <CheckCircle2 className="h-2.5 w-2.5" /> Solved
                                    </span>
                                  )}
                                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                    {msgCount} msgs
                                  </span>
                                </div>
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                                {lastMsg ? lastMsg.content : 'No messages'}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {new Date(conv.createdAt).toLocaleDateString()} at {new Date(conv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Selected Conversation Transcript */}
                    <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                      {selectedConversation ? (
                        <div className="space-y-4">
                          <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                                Session: {selectedConversation.id}
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                Started {new Date(selectedConversation.createdAt).toLocaleString()}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold px-2.5 py-1 text-[11px]">
                                {selectedConversation.messages?.length || 0} Messages
                              </span>
                              <button
                                type="button"
                                onClick={() => handleToggleTakeover(selectedConversation.id, !selectedConversation.isLiveTakeover)}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                                  selectedConversation.isLiveTakeover
                                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40'
                                }`}
                                title={selectedConversation.isLiveTakeover ? "Click to release back to AI bot" : "Click to pause AI and take over as live human agent"}
                              >
                                <Headphones className="h-3.5 w-3.5" />
                                <span>{selectedConversation.isLiveTakeover ? 'Live Agent (AI Paused)' : 'Take Over Chat'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleConversationStatus(selectedConversation.id, !selectedConversation.resolved)}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                                  selectedConversation.resolved
                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                                }`}
                              >
                                <CheckCircle2 className={`h-3.5 w-3.5 ${selectedConversation.resolved ? 'text-emerald-600' : 'text-slate-400'}`} />
                                <span>{selectedConversation.resolved ? 'Resolved' : 'Mark Resolved'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => downloadConversationTranscript(selectedConversation)}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-semibold transition shadow-xs"
                                title="Download chat transcript as TXT"
                              >
                                <Download className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                <span>Download Chat</span>
                              </button>
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
                                    <span>Customer Waiting for Live Agent</span>
                                  </div>
                                  <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                                    Visitor requested human assistance. Click to take over and start typing real-time responses.
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleToggleTakeover(selectedConversation.id, true)}
                                className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition shrink-0 cursor-pointer flex items-center gap-1.5"
                              >
                                <Headphones className="h-3.5 w-3.5" />
                                <span>Accept &amp; Take Over</span>
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
                                  Live Operator Mode Active &bull; Assigned to: <strong>{selectedConversation.assignedAgentName || agentNameInput}</strong>
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleToggleTakeover(selectedConversation.id, false)}
                                className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-950/60 px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1"
                              >
                                <Bot className="h-3 w-3 text-purple-500" />
                                <span>Hand Back to AI</span>
                              </button>
                            </div>
                          )}

                          <div className="space-y-3 max-h-[440px] overflow-y-auto pr-2">
                            {(selectedConversation.messages || []).map((m: any, idx: number) => {
                              const isUser = m.role === 'user';
                              const isAgent = m.role === 'agent';
                              return (
                                <div
                                  key={m.id || idx}
                                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                                >
                                  <div className="text-[10px] text-slate-400 mb-1 px-1 flex items-center gap-1">
                                    <span>
                                      {isUser ? 'Visitor' : isAgent ? (m.senderName || 'Live Agent') : 'AI Assistant'}
                                    </span>
                                    <span>&bull;</span>
                                    <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  <div
                                    className={`rounded-2xl px-4 py-2.5 text-xs max-w-[85%] leading-relaxed ${
                                      isUser
                                        ? 'bg-blue-600 text-white rounded-br-xs'
                                        : isAgent
                                        ? 'bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-950 dark:text-purple-100 rounded-bl-xs'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-xs'
                                    }`}
                                  >
                                    {isAgent && (
                                      <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-purple-700 dark:text-purple-300 mb-1 border-b border-purple-200/60 dark:border-purple-800/60 pb-1">
                                        <Headphones className="h-3 w-3" />
                                        <span>{m.senderName || 'Live Support Agent'}</span>
                                      </div>
                                    )}
                                    {isUser ? (
                                      <div className="whitespace-pre-wrap">{m.content}</div>
                                    ) : (
                                      <MarkdownRenderer content={m.content} />
                                    )}

                                    {/* Web Sources Preview (Strictly for live web search - Never display internal knowledge base) */}
                                    {(() => {
                                      const isLive = Boolean(m.isWebSearch || (m.citations || []).some((cite: any) => cite.isLiveWebSearch));
                                      if (!isLive) return null;
                                      const webCitations = (m.citations || []).filter((cite: any) => cite && cite.url && (cite.url.startsWith('http://') || cite.url.startsWith('https://')));
                                      if (webCitations.length === 0) return null;
                                      return (
                                        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-[10.5px]">
                                          <div className="font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                                            <Globe className="h-3 w-3 text-sky-500" />
                                            <span>Web Sources:</span>
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
                                                  <span>{cite.sourceTitle || 'Web Source'}</span>
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
                            {/* Quick canned replies */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px]">
                              <span className="text-slate-400 shrink-0 font-medium">Quick replies:</span>
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

                            <div className="flex gap-2 items-center">
                              <div className="relative">
                                <input
                                  type="text"
                                  value={agentNameInput}
                                  onChange={(e) => setAgentNameInput(e.target.value)}
                                  placeholder="Agent Name"
                                  className="w-32 text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                                  title="Your display name to the customer"
                                />
                              </div>
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
                                    ? "Type reply to visitor as Live Agent (AI is paused)..."
                                    : "Type reply to take over chat from AI bot..."
                                }
                                className="flex-1 text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-purple-500"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setAgentReplyText('[ACTION:BOOKING_FORM] Please select your service, date, and preferred time slot using our appointment booking form below:');
                                }}
                                className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0"
                                title="Insert appointment booking card into chat for customer"
                              >
                                <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                <span className="hidden sm:inline">Send Booking Form</span>
                              </button>
                              <button
                                type="button"
                                onClick={handleSendAgentMessage}
                                disabled={isSendingAgentMessage || !agentReplyText.trim()}
                                className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition shadow-xs cursor-pointer"
                              >
                                <Send className="h-3.5 w-3.5" />
                                <span>{isSendingAgentMessage ? 'Sending...' : 'Send'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-20 text-center text-xs text-slate-400">
                          Select a conversation from the left to inspect the transcript.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
  );
};
