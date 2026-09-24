import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
  Linking,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from 'react-native';
import { colors, typography } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AppointmentData } from '../types';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Check,
  X,
  ExternalLink,
  Sparkles,
} from 'lucide-react-native';

type FilterTab = 'all' | 'upcoming' | 'today' | 'completed' | 'cancelled';

export function AppointmentsScreen() {
  const { selectedAssistant, workspace } = useAuth();

  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [selectedApt, setSelectedApt] = useState<AppointmentData | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (selectedAssistant) {
      loadAppointments();
    }
  }, [selectedAssistant]);

  const loadAppointments = async () => {
    if (!selectedAssistant) return;
    try {
      setLoading(true);
      const data = await api.getAppointments(selectedAssistant.id);
      setAppointments(data);
    } catch (err: any) {
      console.warn('Failed to load appointments:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAppointments();
  };

  const todayStr = useMemo(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }, []);

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      // Query filter
      const matchesSearch =
        apt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (apt.serviceName && apt.serviceName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (apt.phone && apt.phone.includes(searchQuery));

      if (!matchesSearch) return false;

      // Tab filter
      if (activeTab === 'today') {
        return apt.date === todayStr && apt.status !== 'cancelled';
      }
      if (activeTab === 'upcoming') {
        return apt.date >= todayStr && (apt.status === 'confirmed' || apt.status === 'pending');
      }
      if (activeTab === 'completed') {
        return apt.status === 'completed';
      }
      if (activeTab === 'cancelled') {
        return apt.status === 'cancelled';
      }
      return true;
    });
  }, [appointments, searchQuery, activeTab, todayStr]);

  // Metric counts
  const metrics = useMemo(() => {
    const today = appointments.filter((a) => a.date === todayStr && a.status !== 'cancelled').length;
    const upcoming = appointments.filter(
      (a) => a.date >= todayStr && (a.status === 'confirmed' || a.status === 'pending')
    ).length;
    const completed = appointments.filter((a) => a.status === 'completed').length;
    return { total: appointments.length, today, upcoming, completed };
  }, [appointments, todayStr]);

  const handleStatusChange = async (
    status: 'confirmed' | 'completed' | 'cancelled',
    cancellationReason?: string
  ) => {
    if (!selectedApt) return;
    try {
      setUpdatingStatus(true);
      await api.updateAppointmentStatus(selectedApt.id, status, cancellationReason);

      // Update locally
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === selectedApt.id
            ? { ...a, status, cancellationReason: cancellationReason || a.cancellationReason }
            : a
        )
      );
      setSelectedApt((prev) => (prev ? { ...prev, status, cancellationReason } : null));
      Alert.alert('Status Updated', `Appointment marked as ${status}.`);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return {
          bg: colors.successBg,
          text: colors.success,
          label: 'Confirmed',
          icon: CheckCircle,
        };
      case 'completed':
        return {
          bg: colors.infoBg,
          text: colors.info,
          label: 'Completed',
          icon: Check,
        };
      case 'cancelled':
        return {
          bg: colors.dangerBg,
          text: colors.danger,
          label: 'Cancelled',
          icon: XCircle,
        };
      default:
        return {
          bg: colors.warningBg,
          text: colors.warning,
          label: 'Pending',
          icon: AlertCircle,
        };
    }
  };

  const renderAppointmentItem = ({ item }: { item: AppointmentData }) => {
    const badge = getStatusBadge(item.status);
    const StatusIcon = badge.icon;
    const isToday = item.date === todayStr;

    return (
      <TouchableOpacity
        style={styles.aptCard}
        onPress={() => setSelectedApt(item)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          {/* Date & Time Capsule */}
          <View style={[styles.dateCapsule, isToday && styles.todayDateCapsule]}>
            <Calendar size={13} color={isToday ? colors.accent : colors.textSecondary} />
            <Text style={[styles.dateText, isToday && styles.todayDateText]}>
              {isToday ? 'TODAY' : item.date}
            </Text>
            <Text style={styles.timeDivider}>•</Text>
            <Clock size={13} color={isToday ? colors.accent : colors.textSecondary} />
            <Text style={[styles.timeText, isToday && styles.todayDateText]}>
              {item.timeSlot}
            </Text>
          </View>

          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
            <StatusIcon size={12} color={badge.text} />
            <Text style={[styles.statusText, { color: badge.text }]}>
              {badge.label}
            </Text>
          </View>
        </View>

        {/* Client & Service Info */}
        <View style={styles.clientRow}>
          <View style={styles.clientAvatar}>
            <Text style={styles.avatarInitial}>
              {item.name ? item.name.charAt(0).toUpperCase() : 'C'}
            </Text>
          </View>
          <View style={styles.clientMeta}>
            <Text style={styles.clientName}>{item.name}</Text>
            <Text style={styles.serviceName}>
              {item.serviceName || 'General Consultation'} • {item.durationMinutes || 30}m
            </Text>
          </View>
        </View>

        {/* Card Footer with Quick Contact */}
        <View style={styles.cardFooter}>
          <Text style={styles.contactSummary} numberOfLines={1}>
            {item.phone || item.email}
          </Text>
          <Text style={styles.tapDetailsText}>Details &rarr;</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.headerSubtitle}>
            {workspace?.name || 'Workspace'}
          </Text>
          <Text style={styles.headerTitle}>
            {selectedAssistant?.name || 'Appointments'}
          </Text>
        </View>
        <View style={styles.syncIndicator}>
          <View style={styles.syncDot} />
          <Text style={styles.syncText}>Live Cloud Sync</Text>
        </View>
      </View>

      {/* Metrics Row */}
      <View style={styles.metricsContainer}>
        <TouchableOpacity
          style={[styles.metricBox, activeTab === 'all' && styles.metricActive]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={styles.metricVal}>{metrics.total}</Text>
          <Text style={styles.metricLabel}>Total</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.metricBox, activeTab === 'upcoming' && styles.metricActive]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.metricVal, { color: colors.accent }]}>
            {metrics.upcoming}
          </Text>
          <Text style={styles.metricLabel}>Upcoming</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.metricBox, activeTab === 'today' && styles.metricActive]}
          onPress={() => setActiveTab('today')}
        >
          <Text style={[styles.metricVal, { color: colors.info }]}>
            {metrics.today}
          </Text>
          <Text style={styles.metricLabel}>Today</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.metricBox, activeTab === 'completed' && styles.metricActive]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={styles.metricVal}>{metrics.completed}</Text>
          <Text style={styles.metricLabel}>Completed</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <Search size={16} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by client name, email, phone..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabBar}>
        {(['all', 'upcoming', 'today', 'completed', 'cancelled'] as FilterTab[]).map(
          (tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === tab && styles.tabButtonTextActive,
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {/* Appointments List */}
      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Fetching scheduled bookings...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredAppointments}
          keyExtractor={(item: AppointmentData) => item.id}
          renderItem={renderAppointmentItem}
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
              <Calendar size={44} color={colors.border} />
              <Text style={styles.emptyTitle}>No appointments found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'No results match your search query.'
                  : activeTab === 'today'
                  ? 'No appointments scheduled for today.'
                  : 'New customer bookings will appear here in real time.'}
              </Text>
            </View>
          }
        />
      )}

      {/* Appointment Detail Modal */}
      <Modal
        visible={!!selectedApt}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedApt(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedApt && (
              <>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalClientName}>{selectedApt.name}</Text>
                    <Text style={styles.modalServiceName}>
                      {selectedApt.serviceName || 'Consultation'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeModalBtn}
                    onPress={() => setSelectedApt(null)}
                  >
                    <X size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Schedule Card */}
                <View style={styles.modalSectionCard}>
                  <View style={styles.modalRow}>
                    <Calendar size={18} color={colors.accent} />
                    <View style={styles.modalRowText}>
                      <Text style={styles.modalRowLabel}>DATE</Text>
                      <Text style={styles.modalRowValue}>{selectedApt.date}</Text>
                    </View>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.modalRow}>
                    <Clock size={18} color={colors.accent} />
                    <View style={styles.modalRowText}>
                      <Text style={styles.modalRowLabel}>TIME & DURATION</Text>
                      <Text style={styles.modalRowValue}>
                        {selectedApt.timeSlot} ({selectedApt.durationMinutes || 30} minutes)
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Contact Actions */}
                <View style={styles.modalActionsRow}>
                  {selectedApt.phone && (
                    <TouchableOpacity
                      style={styles.contactActionBtn}
                      onPress={() => Linking.openURL(`tel:${selectedApt.phone}`)}
                    >
                      <Phone size={18} color={colors.textInverse} />
                      <Text style={styles.contactActionBtnText}>Call Client</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[
                      styles.contactActionBtn,
                      { backgroundColor: colors.bgElevated, borderWidth: 1, borderColor: colors.border },
                    ]}
                    onPress={() => Linking.openURL(`mailto:${selectedApt.email}`)}
                  >
                    <Mail size={18} color={colors.accent} />
                    <Text style={[styles.contactActionBtnText, { color: colors.textPrimary }]}>
                      Email Client
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Additional Details */}
                <View style={styles.detailsGroup}>
                  <Text style={styles.detailsGroupTitle}>BOOKING DETAILS</Text>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailItemLabel}>Email</Text>
                    <Text style={styles.detailItemVal}>{selectedApt.email}</Text>
                  </View>

                  {selectedApt.phone && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailItemLabel}>Phone</Text>
                      <Text style={styles.detailItemVal}>{selectedApt.phone}</Text>
                    </View>
                  )}

                  {selectedApt.notes && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailItemLabel}>Customer Notes</Text>
                      <Text style={styles.detailItemVal}>{selectedApt.notes}</Text>
                    </View>
                  )}

                  {selectedApt.cancellationReason && (
                    <View style={styles.detailItem}>
                      <Text style={[styles.detailItemLabel, { color: colors.danger }]}>
                        Cancellation Reason
                      </Text>
                      <Text style={[styles.detailItemVal, { color: colors.danger }]}>
                        {selectedApt.cancellationReason}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Status Update Buttons */}
                <View style={styles.statusActionContainer}>
                  <Text style={styles.detailsGroupTitle}>UPDATE STATUS</Text>
                  <View style={styles.statusButtonsRow}>
                    {selectedApt.status !== 'confirmed' && (
                      <TouchableOpacity
                        style={[styles.statusBtn, { borderColor: colors.success }]}
                        onPress={() => handleStatusChange('confirmed')}
                        disabled={updatingStatus}
                      >
                        <Text style={[styles.statusBtnText, { color: colors.success }]}>
                          Confirm
                        </Text>
                      </TouchableOpacity>
                    )}

                    {selectedApt.status !== 'completed' && (
                      <TouchableOpacity
                        style={[styles.statusBtn, { borderColor: colors.info }]}
                        onPress={() => handleStatusChange('completed')}
                        disabled={updatingStatus}
                      >
                        <Text style={[styles.statusBtnText, { color: colors.info }]}>
                          Mark Done
                        </Text>
                      </TouchableOpacity>
                    )}

                    {selectedApt.status !== 'cancelled' && (
                      <TouchableOpacity
                        style={[styles.statusBtn, { borderColor: colors.danger }]}
                        onPress={() => {
                          if (Platform.OS === 'ios' && typeof (Alert as any).prompt === 'function') {
                            (Alert as any).prompt(
                              'Cancel Appointment',
                              'Reason for cancellation:',
                              (reason: string) => handleStatusChange('cancelled', reason)
                            );
                          } else {
                            Alert.alert('Cancel Appointment', 'Are you sure you want to cancel this booking?', [
                              { text: 'Back', style: 'cancel' },
                              {
                                text: 'Cancel Appointment',
                                style: 'destructive',
                                onPress: () => handleStatusChange('cancelled', 'Cancelled from mobile app'),
                              },
                            ]);
                          }
                        }}
                        disabled={updatingStatus}
                      >
                        <Text style={[styles.statusBtnText, { color: colors.danger }]}>
                          Cancel
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerTitle: {
    ...typography.heading1,
    fontSize: 22,
    marginTop: 2,
  },
  syncIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.bgCard,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  syncDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  syncText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  metricBox: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  metricActive: {
    borderColor: colors.accent,
    backgroundColor: colors.bgElevated,
  },
  metricVal: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  metricLabel: {
    ...typography.caption,
    fontSize: 10,
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    color: colors.textPrimary,
    fontSize: 13,
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
  aptCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgDark,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
  },
  todayDateCapsule: {
    borderColor: colors.accent,
    borderWidth: 1,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  todayDateText: {
    color: colors.accent,
  },
  timeDivider: {
    color: colors.textMuted,
  },
  timeText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  clientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accent,
  },
  clientMeta: {
    flex: 1,
  },
  clientName: {
    ...typography.heading3,
    fontSize: 16,
  },
  serviceName: {
    ...typography.bodySecondary,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  contactSummary: {
    fontSize: 12,
    color: colors.textMuted,
    maxWidth: '75%',
  },
  tapDetailsText: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '600',
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
    paddingVertical: 64,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderTopWidth: 1,
    borderColor: colors.border,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  modalClientName: {
    ...typography.heading2,
    fontSize: 22,
  },
  modalServiceName: {
    ...typography.bodySecondary,
    color: colors.accent,
    marginTop: 2,
  },
  closeModalBtn: {
    padding: 6,
  },
  modalSectionCard: {
    backgroundColor: colors.bgDark,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalRowText: {
    flex: 1,
  },
  modalRowLabel: {
    ...typography.caption,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  modalRowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: 10,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  contactActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    paddingVertical: 12,
    borderRadius: 12,
  },
  contactActionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textInverse,
  },
  detailsGroup: {
    marginBottom: 20,
  },
  detailsGroupTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  detailItemLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  detailItemVal: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '500',
    maxWidth: '65%',
    textAlign: 'right',
  },
  statusActionContainer: {
    marginTop: 4,
  },
  statusButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  statusBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    backgroundColor: colors.bgDark,
  },
  statusBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
