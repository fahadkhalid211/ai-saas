import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { colors, typography } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { InAppNotificationData } from '../types';
import {
  Bell,
  Calendar,
  XCircle,
  UserCheck,
  AlertTriangle,
  MessageSquare,
  Clock,
  CheckCheck,
  Sparkles,
} from 'lucide-react-native';

type FilterType = 'all' | 'unread' | 'bookings' | 'leads';

export function NotificationsScreen() {
  const { selectedAssistant } = useAuth();

  const [notifications, setNotifications] = useState<InAppNotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  useEffect(() => {
    if (selectedAssistant) {
      loadNotifications();
    }
  }, [selectedAssistant]);

  const loadNotifications = async () => {
    if (!selectedAssistant) return;
    try {
      setLoading(true);
      const res = await api.getNotifications(selectedAssistant.id);
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const handleMarkAsRead = async (item: InAppNotificationData) => {
    if (item.read) return;

    // Optimistic local update
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));

    try {
      await api.markNotificationRead(item.id);
    } catch (e) {
      console.warn('Failed to mark notification read:', e);
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;

    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await api.markAllNotificationsRead(selectedAssistant?.id);
    } catch (e) {
      console.warn('Failed to mark all notifications read:', e);
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (activeFilter === 'unread') return !item.read;
      if (activeFilter === 'bookings') {
        return (
          item.type === 'appointment_booked' || item.type === 'appointment_cancelled'
        );
      }
      if (activeFilter === 'leads') {
        return item.type === 'lead_captured';
      }
      return true;
    });
  }, [notifications, activeFilter]);

  const formatTimestamp = (iso: string) => {
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
    } catch (e) {
      return iso;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment_booked':
        return {
          icon: Calendar,
          color: colors.accent,
          bg: colors.accentGlow,
        };
      case 'appointment_cancelled':
        return {
          icon: XCircle,
          color: colors.danger,
          bg: colors.dangerBg,
        };
      case 'lead_captured':
        return {
          icon: Sparkles,
          color: colors.lavender,
          bg: 'rgba(240, 215, 255, 0.15)',
        };
      case 'takeover_requested':
        return {
          icon: AlertTriangle,
          color: colors.warning,
          bg: colors.warningBg,
        };
      default:
        return {
          icon: MessageSquare,
          color: colors.info,
          bg: colors.infoBg,
        };
    }
  };

  const renderNotificationItem = ({ item }: { item: InAppNotificationData }) => {
    const meta = getNotificationIcon(item.type);
    const IconComponent = meta.icon;

    return (
      <TouchableOpacity
        style={[styles.notifCard, !item.read && styles.unreadNotifCard]}
        onPress={() => handleMarkAsRead(item)}
        activeOpacity={0.75}
      >
        <View style={styles.cardLeft}>
          <View style={[styles.iconWrapper, { backgroundColor: meta.bg }]}>
            <IconComponent size={20} color={meta.color} />
          </View>
        </View>

        <View style={styles.cardCenter}>
          <View style={styles.titleRow}>
            <Text style={[styles.notifTitle, !item.read && styles.unreadTitle]}>
              {item.title}
            </Text>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.notifMessage} numberOfLines={3}>
            {item.message}
          </Text>
          <View style={styles.timeRow}>
            <Clock size={11} color={colors.textMuted} />
            <Text style={styles.timeText}>{formatTimestamp(item.createdAt)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.headerSubtitle}>REAL-TIME ALERTS</Text>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.unreadCountBadge}>
                <Text style={styles.unreadCountBadgeText}>{unreadCount} new</Text>
              </View>
            )}
          </View>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllBtn}
            onPress={handleMarkAllRead}
            activeOpacity={0.7}
          >
            <CheckCheck size={14} color={colors.accent} />
            <Text style={styles.markAllBtnText}>Mark read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabBar}>
        {(['all', 'unread', 'bookings', 'leads'] as FilterType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeFilter === tab && styles.tabButtonActive]}
            onPress={() => setActiveFilter(tab)}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeFilter === tab && styles.tabButtonTextActive,
              ]}
            >
              {tab === 'all'
                ? 'All'
                : tab === 'unread'
                ? `Unread (${unreadCount})`
                : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item: InAppNotificationData) => item.id}
          renderItem={renderNotificationItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Bell size={44} color={colors.border} />
              <Text style={styles.emptyTitle}>All caught up!</Text>
              <Text style={styles.emptySubtitle}>
                {activeFilter === 'unread'
                  ? 'No unread notifications right now.'
                  : 'New booking alerts, lead captures, and reminders will appear here.'}
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
    paddingBottom: 14,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  headerTitle: {
    ...typography.heading1,
    fontSize: 22,
  },
  unreadCountBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadCountBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textInverse,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.bgCard,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  markAllBtnText: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 6,
  },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  tabButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  tabButtonText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: colors.textInverse,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: 12,
  },
  unreadNotifCard: {
    borderColor: colors.accentGlowStrong,
    backgroundColor: colors.bgElevated,
  },
  cardLeft: {
    justifyContent: 'flex-start',
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardCenter: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  unreadTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginLeft: 6,
  },
  notifMessage: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: colors.textSecondary,
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 72,
  },
  emptyTitle: {
    ...typography.heading3,
    marginTop: 14,
  },
  emptySubtitle: {
    ...typography.bodySecondary,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 32,
  },
});
