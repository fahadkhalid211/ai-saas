import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { colors, typography } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ConversationData, MessageData } from '../types';
import {
  MessageSquare,
  Headphones,
  Bot,
  Send,
  ArrowLeft,
  Search,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  User,
  Clock,
  Calendar,
  Sparkles,
  RefreshCw,
  X,
  Radio,
} from 'lucide-react-native';

type FilterTab = 'all' | 'waiting' | 'live' | 'bot' | 'resolved';

interface LiveChatScreenProps {
  route?: { params?: { conversationId?: string | null } };
  navigation?: any;
  initialConversationId?: string | null;
  onClearInitialConversationId?: () => void;
}

export function LiveChatScreen({
  route,
  navigation,
  initialConversationId,
  onClearInitialConversationId,
}: LiveChatScreenProps) {
  const { selectedAssistant, member } = useAuth();
  const targetConvId = route?.params?.conversationId || initialConversationId;

  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationData | null>(null);
  const [loadingList, setLoadingList] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  // Chat room state
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const messagesEndRef = useRef<FlatList<MessageData>>(null);
  const selectedConvIdRef = useRef<string | null>(null);
  const knownMessageCountRef = useRef<number>(0);

  const agentDisplayName = useMemo(() => {
    return member?.name ? `${member.name} (Support)` : 'Support Agent';
  }, [member]);

  // Sync ref with state
  useEffect(() => {
    selectedConvIdRef.current = selectedConversation?.id || null;
    knownMessageCountRef.current = selectedConversation?.messages?.length || 0;
  }, [selectedConversation]);

  // Load conversations list
  const loadConversations = async (silent: boolean = false) => {
    if (!selectedAssistant) return;
    try {
      if (!silent) setLoadingList(true);
      const list = await api.getConversations(selectedAssistant.id);

      // Sort conversations descending by most recent activity
      const sorted = [...list].sort((a, b) => {
        const aLast = a.messages && a.messages.length > 0
          ? new Date(a.messages[a.messages.length - 1].createdAt).getTime()
          : 0;
        const bLast = b.messages && b.messages.length > 0
          ? new Date(b.messages[b.messages.length - 1].createdAt).getTime()
          : 0;
        const aTime = Math.max(
          aLast,
          a.updatedAt ? new Date(a.updatedAt).getTime() : 0,
          a.createdAt ? new Date(a.createdAt).getTime() : 0
        );
        const bTime = Math.max(
          bLast,
          b.updatedAt ? new Date(b.updatedAt).getTime() : 0,
          b.createdAt ? new Date(b.createdAt).getTime() : 0
        );
        return bTime - aTime;
      });

      setConversations(sorted);

      // Keep selected conversation in sync if currently viewing one
      if (selectedConvIdRef.current) {
        const matching = sorted.find((c) => c.id === selectedConvIdRef.current);
        if (matching) {
          setSelectedConversation((prev) => {
            if (!prev) return matching;
            return {
              ...matching,
              messages: (matching.messages && matching.messages.length >= (prev.messages?.length || 0))
                ? matching.messages
                : prev.messages,
            };
          });
        }
      }
    } catch (e) {
      console.warn('Failed to load conversations:', e);
    } finally {
      if (!silent) setLoadingList(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (selectedAssistant) {
      loadConversations();
    }
  }, [selectedAssistant]);

  // If targetConvId is provided (e.g. from notification click or navigation), open it directly
  useEffect(() => {
    if (targetConvId && conversations.length > 0) {
      const match = conversations.find((c) => c.id === targetConvId);
      if (match) {
        handleOpenConversation(match);
      } else {
        // Fetch it individually if not in recent list
        api.getConversation(targetConvId).then((res) => {
          if (res?.conversation) {
            handleOpenConversation(res.conversation);
          }
        }).catch(console.warn);
      }
      if (onClearInitialConversationId) onClearInitialConversationId();
    }
  }, [targetConvId, conversations]);

  // Adaptive background polling:
  // 3s when browsing conversation list; 1.5s when inside an active conversation room!
  useEffect(() => {
    if (!selectedAssistant) return;

    let isMounted = true;
    const pollIntervalMs = selectedConversation ? 1500 : 3000;

    const intervalId = setInterval(async () => {
      if (!isMounted) return;

      if (selectedConvIdRef.current) {
        // Fast sync for the active room
        try {
          const res = await api.getConversation(
            selectedConvIdRef.current,
            knownMessageCountRef.current
          );

          if (!isMounted) return;

          if (res?.newMessages && res.newMessages.length > 0) {
            setSelectedConversation((prev) => {
              if (!prev || prev.id !== selectedConvIdRef.current) return prev;
              const existingIds = new Set((prev.messages || []).map((m) => m.id));
              const fresh = res.newMessages!.filter((m) => !existingIds.has(m.id));
              if (fresh.length === 0) return prev;

              const updatedMessages = [...(prev.messages || []), ...fresh];
              knownMessageCountRef.current = updatedMessages.length;
              return {
                ...prev,
                ...(res.conversation || {}),
                messages: updatedMessages,
              };
            });

            // Also update entry in list
            setConversations((prev) =>
              prev.map((c) =>
                c.id === selectedConvIdRef.current
                  ? {
                      ...c,
                      ...(res.conversation || {}),
                      messages: [
                        ...(c.messages || []),
                        ...res.newMessages!.filter(
                          (m) => !(c.messages || []).some((ex) => ex.id === m.id)
                        ),
                      ],
                    }
                  : c
              )
            );
          } else if (res?.conversation) {
            // Update metadata like status/takeover
            setSelectedConversation((prev) =>
              prev && prev.id === selectedConvIdRef.current
                ? { ...prev, ...res.conversation }
                : prev
            );
          }
        } catch (e) {
          // silent on poll error
        }
      } else {
        // Background sync for conversation list
        loadConversations(true);
      }
    }, pollIntervalMs);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [selectedAssistant, selectedConversation]);

  // Open a conversation
  const handleOpenConversation = async (conv: ConversationData) => {
    setSelectedConversation(conv);
    knownMessageCountRef.current = conv.messages?.length || 0;
    try {
      const full = await api.getConversation(conv.id);
      if (full?.conversation) {
        setSelectedConversation(full.conversation);
        knownMessageCountRef.current = full.conversation.messages?.length || 0;
      }
    } catch (e) {
      console.warn('Failed to load full conversation:', e);
    }
  };

  // Close active room and return to list
  const handleCloseConversation = () => {
    setSelectedConversation(null);
    loadConversations(true);
  };

  // Toggle Live Takeover
  const handleToggleTakeover = async () => {
    if (!selectedConversation || isUpdatingStatus) return;
    const newTakeoverState = !selectedConversation.isLiveTakeover;

    setIsUpdatingStatus(true);
    // Optimistic UI update
    setSelectedConversation((prev) =>
      prev
        ? {
            ...prev,
            isLiveTakeover: newTakeoverState,
            status: newTakeoverState ? 'live_agent' : 'bot',
            assignedAgentName: newTakeoverState ? agentDisplayName : undefined,
          }
        : null
    );

    try {
      await api.updateConversationStatus(selectedConversation.id, {
        isLiveTakeover: newTakeoverState,
        status: newTakeoverState ? 'live_agent' : 'bot',
        assignedAgentName: newTakeoverState ? agentDisplayName : undefined,
      });

      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversation.id
            ? {
                ...c,
                isLiveTakeover: newTakeoverState,
                status: newTakeoverState ? 'live_agent' : 'bot',
                assignedAgentName: newTakeoverState ? agentDisplayName : undefined,
              }
            : c
        )
      );
    } catch (e) {
      console.warn('Failed to toggle takeover:', e);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Toggle Resolved status
  const handleToggleResolved = async () => {
    if (!selectedConversation || isUpdatingStatus) return;
    const newResolvedState = !selectedConversation.resolved;

    setIsUpdatingStatus(true);
    setSelectedConversation((prev) =>
      prev
        ? {
            ...prev,
            resolved: newResolvedState,
            status: newResolvedState ? 'resolved' : prev.isLiveTakeover ? 'live_agent' : 'bot',
          }
        : null
    );

    try {
      await api.updateConversationStatus(selectedConversation.id, {
        resolved: newResolvedState,
        status: newResolvedState ? 'resolved' : selectedConversation.isLiveTakeover ? 'live_agent' : 'bot',
      });

      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversation.id
            ? {
                ...c,
                resolved: newResolvedState,
                status: newResolvedState ? 'resolved' : c.isLiveTakeover ? 'live_agent' : 'bot',
              }
            : c
        )
      );
    } catch (e) {
      console.warn('Failed to toggle resolved status:', e);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Send Live Agent Message
  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = (textOverride || inputMessage).trim();
    if (!selectedConversation || !textToSend || isSending) return;

    if (!textOverride) setInputMessage('');
    setIsSending(true);

    try {
      const res = await api.sendAgentMessage(
        selectedConversation.id,
        textToSend,
        agentDisplayName,
        true
      );

      if (res?.message) {
        knownMessageCountRef.current += 1;
        setSelectedConversation((prev) => {
          if (!prev) return prev;
          const existingIds = new Set((prev.messages || []).map((m) => m.id));
          if (existingIds.has(res.message.id)) return prev;
          return {
            ...prev,
            isLiveTakeover: true,
            status: 'live_agent',
            assignedAgentName: agentDisplayName,
            messages: [...(prev.messages || []), res.message],
          };
        });

        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedConversation.id
              ? {
                  ...c,
                  isLiveTakeover: true,
                  status: 'live_agent',
                  assignedAgentName: agentDisplayName,
                  messages: [...(c.messages || []), res.message],
                  updatedAt: new Date().toISOString(),
                }
              : c
          )
        );
      }
    } catch (e) {
      console.warn('Failed to send agent message:', e);
      if (!textOverride) setInputMessage(textToSend); // Restore unsent message
    } finally {
      setIsSending(false);
    }
  };

  // Quick Action: Send interactive booking card
  const handleSendBookingCard = () => {
    handleSendMessage('[ACTION:BOOKING_FORM]');
  };

  // Filtering conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      // Query search
      const q = searchQuery.toLowerCase();
      const lastMsgText = c.messages && c.messages.length > 0
        ? c.messages[c.messages.length - 1].content.toLowerCase()
        : '';
      const matchesSearch =
        !q ||
        (c.visitorName && c.visitorName.toLowerCase().includes(q)) ||
        (c.visitorEmail && c.visitorEmail.toLowerCase().includes(q)) ||
        c.id.toLowerCase().includes(q) ||
        lastMsgText.includes(q);

      if (!matchesSearch) return false;

      // Filter tabs
      if (activeFilter === 'waiting') return c.status === 'waiting_for_agent' && !c.isLiveTakeover;
      if (activeFilter === 'live') return c.isLiveTakeover || c.status === 'live_agent';
      if (activeFilter === 'bot') return !c.isLiveTakeover && c.status !== 'waiting_for_agent' && !c.resolved;
      if (activeFilter === 'resolved') return c.resolved === true;

      return true;
    });
  }, [conversations, searchQuery, activeFilter]);

  // Counts for tabs
  const metrics = useMemo(() => {
    const waiting = conversations.filter((c) => c.status === 'waiting_for_agent' && !c.isLiveTakeover).length;
    const live = conversations.filter((c) => c.isLiveTakeover || c.status === 'live_agent').length;
    const total = conversations.length;
    return { waiting, live, total };
  }, [conversations]);

  // Time formatting helper
  const formatTimeAgo = (iso?: string) => {
    if (!iso) return '';
    try {
      const date = new Date(iso);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays}d ago`;
    } catch {
      return '';
    }
  };

  const formatMsgTime = (iso?: string) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Render individual conversation item in list
  const renderConversationItem = ({ item }: { item: ConversationData }) => {
    const lastMsg = item.messages && item.messages.length > 0
      ? item.messages[item.messages.length - 1]
      : null;

    const isWaiting = item.status === 'waiting_for_agent' && !item.isLiveTakeover;
    const isLive = item.isLiveTakeover || item.status === 'live_agent';

    let lastMsgPreview = lastMsg?.content || 'No messages yet';
    if (lastMsgPreview.includes('[ACTION:BOOKING_FORM]')) {
      lastMsgPreview = '📅 Appointment booking card sent';
    }

    return (
      <TouchableOpacity
        style={[
          styles.convCard,
          isWaiting && styles.convCardWaiting,
          isLive && styles.convCardLive,
        ]}
        onPress={() => handleOpenConversation(item)}
        activeOpacity={0.75}
      >
        <View style={styles.cardHeaderRow}>
          <View style={styles.visitorIdentity}>
            <View
              style={[
                styles.avatarCircle,
                isWaiting && styles.avatarWaiting,
                isLive && styles.avatarLive,
              ]}
            >
              <User
                size={16}
                color={isWaiting ? colors.warning : isLive ? colors.accent : colors.textPrimary}
              />
            </View>
            <View>
              <Text style={styles.visitorName} numberOfLines={1}>
                {item.visitorName || item.visitorEmail || `Visitor #${item.id.slice(-6)}`}
              </Text>
              {item.visitorEmail && item.visitorName && (
                <Text style={styles.visitorEmailText} numberOfLines={1}>
                  {item.visitorEmail}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.headerRightCol}>
            <Text style={styles.timeAgoText}>
              {formatTimeAgo(lastMsg?.createdAt || item.updatedAt || item.createdAt)}
            </Text>
            {isWaiting ? (
              <View style={styles.badgeWaiting}>
                <AlertTriangle size={10} color={colors.warning} />
                <Text style={styles.badgeWaitingText}>Waiting</Text>
              </View>
            ) : isLive ? (
              <View style={styles.badgeLive}>
                <Radio size={10} color={colors.accent} />
                <Text style={styles.badgeLiveText}>Live Agent</Text>
              </View>
            ) : item.resolved ? (
              <View style={styles.badgeResolved}>
                <CheckCircle2 size={10} color={colors.textMuted} />
                <Text style={styles.badgeResolvedText}>Resolved</Text>
              </View>
            ) : (
              <View style={styles.badgeBot}>
                <Bot size={10} color={colors.textSecondary} />
                <Text style={styles.badgeBotText}>AI Bot</Text>
              </View>
            )}
          </View>
        </View>

        {/* Message preview snippet */}
        <Text style={styles.lastMessageSnippet} numberOfLines={2}>
          {lastMsg?.role === 'agent' ? 'You: ' : lastMsg?.role === 'user' ? 'Visitor: ' : 'AI: '}
          {lastMsgPreview}
        </Text>

        {/* Card Footer badges */}
        <View style={styles.cardFooter}>
          {item.sentiment === 'urgent' && (
            <View style={styles.sentimentUrgentBadge}>
              <Text style={styles.sentimentUrgentText}>Urgent</Text>
            </View>
          )}
          {item.messages && (
            <View style={styles.msgCountPill}>
              <MessageSquare size={11} color={colors.textMuted} />
              <Text style={styles.msgCountText}>{item.messages.length} msgs</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Render individual message bubble in room
  const renderMessageBubble = ({ item }: { item: MessageData }) => {
    const isUser = item.role === 'user';
    const isAgent = item.role === 'agent';
    const isAssistant = item.role === 'assistant';
    const isSystem = item.role === 'system';

    if (isSystem) {
      return (
        <View style={styles.systemMessageContainer}>
          <View style={styles.systemMessagePill}>
            <Text style={styles.systemMessageText}>{item.content}</Text>
          </View>
        </View>
      );
    }

    const hasBookingCard =
      item.content.includes('[ACTION:BOOKING_FORM]') || item.content.includes('[BOOKING_FORM]');
    const cleanContent = item.content
      .replace(/\[ACTION:BOOKING_FORM\]/g, '')
      .replace(/\[BOOKING_FORM\]/g, '')
      .trim();

    return (
      <View
        style={[
          styles.messageRow,
          isAgent ? styles.messageRowAgent : styles.messageRowOther,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isUser && styles.bubbleUser,
            isAssistant && styles.bubbleAssistant,
            isAgent && styles.bubbleAgent,
          ]}
        >
          {/* Sender header tag */}
          <View style={styles.senderHeaderRow}>
            {isAssistant && (
              <View style={styles.aiSenderBadge}>
                <Bot size={11} color={colors.accent} />
                <Text style={styles.aiSenderText}>Crescelo AI</Text>
              </View>
            )}
            {isAgent && (
              <View style={styles.agentSenderBadge}>
                <Headphones size={11} color={colors.textInverse} />
                <Text style={styles.agentSenderText}>{item.senderName || 'Live Agent'}</Text>
              </View>
            )}
            {isUser && (
              <View style={styles.userSenderBadge}>
                <User size={11} color={colors.textSecondary} />
                <Text style={styles.userSenderText}>Visitor</Text>
              </View>
            )}
            <Text
              style={[
                styles.bubbleTime,
                isAgent ? styles.bubbleTimeAgent : styles.bubbleTimeOther,
              ]}
            >
              {formatMsgTime(item.createdAt)}
            </Text>
          </View>

          {/* Clean text body */}
          {cleanContent.length > 0 && (
            <Text
              style={[
                styles.bubbleText,
                isAgent ? styles.bubbleTextAgent : styles.bubbleTextOther,
              ]}
            >
              {cleanContent}
            </Text>
          )}

          {/* Interactive booking card announcement */}
          {hasBookingCard && (
            <View style={styles.bookingCardNotice}>
              <View style={styles.bookingCardNoticeHeader}>
                <Calendar size={14} color={isAgent ? colors.textInverse : colors.accent} />
                <Text
                  style={[
                    styles.bookingCardNoticeTitle,
                    isAgent ? { color: colors.textInverse } : { color: colors.accent },
                  ]}
                >
                  Interactive Booking Card Sent
                </Text>
              </View>
              <Text
                style={[
                  styles.bookingCardNoticeDesc,
                  isAgent ? { color: 'rgba(4, 20, 13, 0.8)' } : { color: colors.textSecondary },
                ]}
              >
                Visitor can select a date and time slot directly in the chat widget.
              </Text>
            </View>
          )}

          {/* Attachment display */}
          {item.attachment && (
            <View style={styles.attachmentPill}>
              <Text style={styles.attachmentText}>📎 {item.attachment.name}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  // ----------------------------------------------------
  // SUB-VIEW: ACTIVE CHAT ROOM
  // ----------------------------------------------------
  if (selectedConversation) {
    const isWaiting =
      selectedConversation.status === 'waiting_for_agent' && !selectedConversation.isLiveTakeover;
    const isLive = Boolean(selectedConversation.isLiveTakeover);

    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {/* Room Top Header */}
          <View style={styles.roomHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleCloseConversation}
              activeOpacity={0.7}
            >
              <ArrowLeft size={20} color={colors.textPrimary} />
            </TouchableOpacity>

            <View style={styles.roomTitleCol}>
              <Text style={styles.roomTitle} numberOfLines={1}>
                {selectedConversation.visitorName ||
                  selectedConversation.visitorEmail ||
                  `Visitor #${selectedConversation.id.slice(-6)}`}
              </Text>
              <View style={styles.roomStatusRow}>
                <View
                  style={[
                    styles.roomStatusDot,
                    isLive
                      ? styles.statusDotLive
                      : isWaiting
                      ? styles.statusDotWaiting
                      : styles.statusDotBot,
                  ]}
                />
                <Text style={styles.roomStatusSubtitle}>
                  {isLive
                    ? `Live Takeover Active (${selectedConversation.assignedAgentName || 'You'})`
                    : isWaiting
                    ? 'Visitor Waiting for Agent'
                    : 'AI Assistant Active'}
                </Text>
              </View>
            </View>

            {/* Takeover & Resolve Buttons */}
            <View style={styles.roomHeaderActions}>
              <TouchableOpacity
                style={[
                  styles.takeoverToggleBtn,
                  isLive ? styles.takeoverActiveBtn : styles.takeoverInactiveBtn,
                ]}
                onPress={handleToggleTakeover}
                disabled={isUpdatingStatus}
                activeOpacity={0.8}
              >
                <Headphones
                  size={13}
                  color={isLive ? colors.textInverse : colors.accent}
                />
                <Text
                  style={[
                    styles.takeoverToggleText,
                    isLive ? { color: colors.textInverse } : { color: colors.accent },
                  ]}
                >
                  {isLive ? 'Hand to AI' : 'Take Over'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.resolveBtn,
                  selectedConversation.resolved && styles.resolveBtnActive,
                ]}
                onPress={handleToggleResolved}
                disabled={isUpdatingStatus}
                activeOpacity={0.8}
              >
                <CheckCircle2
                  size={14}
                  color={selectedConversation.resolved ? colors.success : colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Urgent / Status Banner */}
          {isWaiting && (
            <View style={styles.waitingNoticeBanner}>
              <AlertTriangle size={15} color={colors.warning} />
              <Text style={styles.waitingNoticeText}>
                Visitor requested live human assistance. Reply below or tap 'Take Over' to respond.
              </Text>
            </View>
          )}

          {isLive && (
            <View style={styles.liveNoticeBanner}>
              <Radio size={13} color={colors.accent} />
              <Text style={styles.liveNoticeText}>
                Live Takeover is ON. AI bot responses are paused for this conversation.
              </Text>
            </View>
          )}

          {/* Messages Feed */}
          <FlatList
            ref={messagesEndRef}
            data={selectedConversation.messages || []}
            keyExtractor={(m, index) => m.id || `msg-${index}`}
            renderItem={renderMessageBubble}
            contentContainerStyle={styles.messagesListContent}
            onContentSizeChange={() => messagesEndRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => messagesEndRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <View style={styles.emptyMessagesContainer}>
                <Bot size={36} color={colors.textMuted} />
                <Text style={styles.emptyMessagesText}>No messages in this chat session yet.</Text>
              </View>
            }
          />

          {/* Quick Reply Toolbar */}
          <View style={styles.quickActionToolbar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionScroll}>
              <TouchableOpacity
                style={styles.quickActionPillBooking}
                onPress={handleSendBookingCard}
                activeOpacity={0.75}
              >
                <Calendar size={13} color={colors.accent} />
                <Text style={styles.quickActionPillBookingText}>Send Booking Form</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionPill}
                onPress={() => handleSendMessage('Hello! How can I help you today?')}
                activeOpacity={0.75}
              >
                <Text style={styles.quickActionPillText}>👋 Hello!</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionPill}
                onPress={() => handleSendMessage('Let me look into that for you right now.')}
                activeOpacity={0.75}
              >
                <Text style={styles.quickActionPillText}>🔍 Checking now...</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionPill}
                onPress={() => handleSendMessage('Is there anything else I can assist you with?')}
                activeOpacity={0.75}
              >
                <Text style={styles.quickActionPillText}>🤝 Anything else?</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Bottom Chat Input Bar */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Reply as live agent..."
              placeholderTextColor={colors.textMuted}
              value={inputMessage}
              onChangeText={setInputMessage}
              multiline
              maxLength={1500}
            />

            <TouchableOpacity
              style={[
                styles.sendBtn,
                (!inputMessage.trim() || isSending) && styles.sendBtnDisabled,
              ]}
              onPress={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isSending}
              activeOpacity={0.8}
            >
              {isSending ? (
                <ActivityIndicator size="small" color={colors.textInverse} />
              ) : (
                <Send size={18} color={colors.textInverse} />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ----------------------------------------------------
  // SUB-VIEW: CONVERSATION LIST
  // ----------------------------------------------------
  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.headerSubtitle}>REAL-TIME LIVE CHAT</Text>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Conversations</Text>
            {metrics.waiting > 0 && (
              <View style={styles.waitingCountBadge}>
                <AlertTriangle size={12} color={colors.warning} />
                <Text style={styles.waitingCountBadgeText}>{metrics.waiting} waiting</Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.refreshIconBtn}
          onPress={() => loadConversations()}
          activeOpacity={0.7}
        >
          <RefreshCw size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Search size={16} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by visitor, email or message..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          <TouchableOpacity
            style={[styles.tabButton, activeFilter === 'all' && styles.tabButtonActive]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[styles.tabButtonText, activeFilter === 'all' && styles.tabButtonTextActive]}>
              All ({metrics.total})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeFilter === 'waiting' && styles.tabButtonActive,
              metrics.waiting > 0 && styles.tabButtonHighlight,
            ]}
            onPress={() => setActiveFilter('waiting')}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeFilter === 'waiting' && styles.tabButtonTextActive,
                metrics.waiting > 0 && { color: colors.warning },
              ]}
            >
              Waiting ({metrics.waiting})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeFilter === 'live' && styles.tabButtonActive]}
            onPress={() => setActiveFilter('live')}
          >
            <Text style={[styles.tabButtonText, activeFilter === 'live' && styles.tabButtonTextActive]}>
              Live Takeover ({metrics.live})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeFilter === 'bot' && styles.tabButtonActive]}
            onPress={() => setActiveFilter('bot')}
          >
            <Text style={[styles.tabButtonText, activeFilter === 'bot' && styles.tabButtonTextActive]}>
              AI Active
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeFilter === 'resolved' && styles.tabButtonActive]}
            onPress={() => setActiveFilter('resolved')}
          >
            <Text style={[styles.tabButtonText, activeFilter === 'resolved' && styles.tabButtonTextActive]}>
              Resolved
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Conversation List */}
      {loadingList ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Syncing live chats...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.id}
          renderItem={renderConversationItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadConversations();
              }}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MessageSquare size={48} color={colors.border} />
              <Text style={styles.emptyTitle}>No Conversations Found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'Try adjusting your search criteria.'
                  : 'Visitor conversations from your website widget will appear here in real time.'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgDark,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  waitingCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.warningBg,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  waitingCountBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.warning,
  },
  refreshIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
  },
  tabBar: {
    marginBottom: 12,
  },
  tabScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tabButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabButtonActive: {
    backgroundColor: colors.accentGlowStrong,
    borderColor: colors.accent,
  },
  tabButtonHighlight: {
    borderColor: 'rgba(245, 158, 11, 0.5)',
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabButtonTextActive: {
    color: colors.accent,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 10,
  },
  convCard: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
  },
  convCardWaiting: {
    borderColor: 'rgba(245, 158, 11, 0.6)',
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
  },
  convCardLive: {
    borderColor: 'rgba(171, 255, 68, 0.5)',
    backgroundColor: 'rgba(171, 255, 68, 0.04)',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  visitorIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.bgDark,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarWaiting: {
    borderColor: colors.warning,
    backgroundColor: colors.warningBg,
  },
  avatarLive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentGlow,
  },
  visitorName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  visitorEmailText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  headerRightCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  timeAgoText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  badgeWaiting: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.warningBg,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeWaitingText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.warning,
  },
  badgeLive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accentGlow,
    borderColor: 'rgba(171, 255, 68, 0.4)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeLiveText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accent,
  },
  badgeResolved: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeResolvedText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
  },
  badgeBot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeBotText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  lastMessageSnippet: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sentimentUrgentBadge: {
    backgroundColor: colors.dangerBg,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  sentimentUrgentText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.danger,
    textTransform: 'uppercase',
  },
  msgCountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  msgCountText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
  },

  // -------------------------
  // Chat Room Styles
  // -------------------------
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bg,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  roomTitleCol: {
    flex: 1,
  },
  roomTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  roomStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  roomStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusDotLive: {
    backgroundColor: colors.accent,
  },
  statusDotWaiting: {
    backgroundColor: colors.warning,
  },
  statusDotBot: {
    backgroundColor: colors.textSecondary,
  },
  roomStatusSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
  },
  roomHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  takeoverToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  takeoverActiveBtn: {
    backgroundColor: colors.accent,
  },
  takeoverInactiveBtn: {
    backgroundColor: colors.accentGlow,
    borderWidth: 1,
    borderColor: 'rgba(171, 255, 68, 0.4)',
  },
  takeoverToggleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  resolveBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resolveBtnActive: {
    borderColor: colors.success,
    backgroundColor: colors.successBg,
  },
  waitingNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.warningBg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245, 158, 11, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  waitingNoticeText: {
    flex: 1,
    fontSize: 12,
    color: colors.warning,
    fontWeight: '600',
  },
  liveNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accentGlow,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(171, 255, 68, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  liveNoticeText: {
    flex: 1,
    fontSize: 12,
    color: colors.accent,
    fontWeight: '600',
  },
  messagesListContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  messageRow: {
    width: '100%',
    flexDirection: 'row',
  },
  messageRowAgent: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '82%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUser: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopLeftRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderTopLeftRadius: 4,
  },
  bubbleAgent: {
    backgroundColor: colors.accent,
    borderTopRightRadius: 4,
  },
  senderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    gap: 12,
  },
  aiSenderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  aiSenderText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accent,
  },
  agentSenderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  agentSenderText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textInverse,
  },
  userSenderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userSenderText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  bubbleTime: {
    fontSize: 10,
  },
  bubbleTimeAgent: {
    color: 'rgba(4, 20, 13, 0.7)',
  },
  bubbleTimeOther: {
    color: colors.textMuted,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bubbleTextAgent: {
    color: colors.textInverse,
    fontWeight: '500',
  },
  bubbleTextOther: {
    color: colors.textPrimary,
  },
  bookingCardNotice: {
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  bookingCardNoticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  bookingCardNoticeTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  bookingCardNoticeDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  attachmentPill: {
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    alignSelf: 'flex-start',
  },
  attachmentText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 4,
  },
  systemMessagePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  systemMessageText: {
    fontSize: 11,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  emptyMessagesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyMessagesText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  quickActionToolbar: {
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  quickActionScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickActionPillBooking: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.accentGlow,
    borderWidth: 1,
    borderColor: 'rgba(171, 255, 68, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  quickActionPillBookingText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accent,
  },
  quickActionPill: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  quickActionPillText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.bg,
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 14,
    color: colors.textPrimary,
    maxHeight: 100,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: colors.border,
    opacity: 0.6,
  },
});
