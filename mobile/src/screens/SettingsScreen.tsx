import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  SafeAreaView,
  TextInput,
  Modal,
} from 'react-native';
import { colors, typography } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { CresceloMark } from '../components/CresceloMark';
import {
  User,
  Bot,
  Bell,
  Server,
  LogOut,
  Shield,
  Check,
  ChevronRight,
  Sparkles,
  Smartphone,
  ExternalLink,
} from 'lucide-react-native';

export function SettingsScreen() {
  const {
    member,
    workspace,
    assistants,
    selectedAssistant,
    setSelectedAssistant,
    serverUrl,
    setServerUrl,
    logout,
  } = useAuth();

  const [bookingAlerts, setBookingAlerts] = useState(true);
  const [soundVibrate, setSoundVibrate] = useState(true);
  const [leadAlerts, setLeadAlerts] = useState(true);

  // Server edit modal
  const [serverModalVisible, setServerModalVisible] = useState(false);
  const [newServerUrl, setNewServerUrl] = useState(serverUrl);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of Crescelo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  const handleSaveServer = () => {
    if (!newServerUrl.trim()) return;
    setServerUrl(newServerUrl.trim());
    setServerModalVisible(false);
    Alert.alert('Server Updated', `Now syncing with: ${newServerUrl.trim()}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          <Text style={styles.headerSubtitle}>ACCOUNT & PREFERENCES</Text>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitial}>
              {member?.name ? member.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{member?.name || 'Crescelo User'}</Text>
            <Text style={styles.profileEmail}>{member?.email || 'admin@crescelo.com'}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>
                  {(member?.role || 'Admin').toUpperCase()}
                </Text>
              </View>
              {workspace?.planName && (
                <View style={styles.planBadge}>
                  <Text style={styles.planBadgeText}>{workspace.planName} Plan</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Assistant Selector Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACTIVE AI ASSISTANT</Text>
          <Text style={styles.sectionSubtitle}>
            Select the bot whose bookings and alerts appear on this device
          </Text>

          {assistants.length === 0 ? (
            <View style={styles.emptyAssistantsBox}>
              <Bot size={20} color={colors.textSecondary} />
              <Text style={styles.emptyAssistantsText}>
                No assistants registered in this workspace.
              </Text>
            </View>
          ) : (
            assistants.map((assistant) => {
              const isSelected = selectedAssistant?.id === assistant.id;
              return (
                <TouchableOpacity
                  key={assistant.id}
                  style={[styles.assistantRow, isSelected && styles.assistantRowSelected]}
                  onPress={() => setSelectedAssistant(assistant)}
                  activeOpacity={0.7}
                >
                  <View style={styles.assistantLeft}>
                    <Bot
                      size={20}
                      color={isSelected ? colors.accent : colors.textSecondary}
                    />
                    <View>
                      <Text
                        style={[
                          styles.assistantName,
                          isSelected && styles.assistantNameSelected,
                        ]}
                      >
                        {assistant.name}
                      </Text>
                      {assistant.description ? (
                        <Text style={styles.assistantDesc} numberOfLines={1}>
                          {assistant.description}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                  {isSelected && (
                    <View style={styles.checkBubble}>
                      <Check size={14} color={colors.textInverse} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Push Notification Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOTIFICATION PREFERENCES</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>New Appointment Bookings</Text>
              <Text style={styles.settingDesc}>
                Alert instantly when a visitor schedules a meeting
              </Text>
            </View>
            <Switch
              value={bookingAlerts}
              onValueChange={setBookingAlerts}
              trackColor={{ false: colors.bgElevated, true: colors.accent }}
              thumbColor={bookingAlerts ? colors.textInverse : colors.textSecondary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Lead & Contact Captures</Text>
              <Text style={styles.settingDesc}>
                Notify when the AI captures new visitor contact details
              </Text>
            </View>
            <Switch
              value={leadAlerts}
              onValueChange={setLeadAlerts}
              trackColor={{ false: colors.bgElevated, true: colors.accent }}
              thumbColor={leadAlerts ? colors.textInverse : colors.textSecondary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Haptics & Vibration</Text>
              <Text style={styles.settingDesc}>
                Vibrate on incoming high-priority notifications
              </Text>
            </View>
            <Switch
              value={soundVibrate}
              onValueChange={setSoundVibrate}
              trackColor={{ false: colors.bgElevated, true: colors.accent }}
              thumbColor={soundVibrate ? colors.textInverse : colors.textSecondary}
            />
          </View>
        </View>

        {/* Server & Cloud Connection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CLOUD SYNC & BACKEND</Text>

          <TouchableOpacity
            style={styles.clickableSettingRow}
            onPress={() => setServerModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.clickableLeft}>
              <Server size={18} color={colors.accent} />
              <View>
                <Text style={styles.settingLabel}>Backend Server Endpoint</Text>
                <Text style={styles.serverValueText} numberOfLines={1}>
                  {serverUrl}
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <LogOut size={18} color={colors.danger} />
          <Text style={styles.logoutText}>Sign Out of Crescelo</Text>
        </TouchableOpacity>

        {/* Brand Footer */}
        <View style={styles.footer}>
          <CresceloMark size={40} motion="still" />
          <Text style={styles.footerBrand}>CRESCELO MOBILE</Text>
          <Text style={styles.footerVersion}>Version 1.0.0 • Android Native Client</Text>
          <Text style={styles.footerCopyright}>
            Synced with web dashboard at {workspace?.name || 'Crescelo Workspace'}
          </Text>
        </View>
      </ScrollView>

      {/* Edit Server URL Modal */}
      <Modal
        visible={serverModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setServerModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Change Server Endpoint</Text>
            <Text style={styles.modalSubtitle}>
              Enter the URL of your Crescelo backend or local dev server:
            </Text>

            <TextInput
              style={styles.serverInputModal}
              value={newServerUrl}
              onChangeText={setNewServerUrl}
              placeholder="https://crescelo.com"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.presetRow}>
              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => setNewServerUrl('http://10.0.2.2:3000')}
              >
                <Text style={styles.presetChipText}>Emulator (10.0.2.2)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => setNewServerUrl('https://crescelo.com')}
              >
                <Text style={styles.presetChipText}>Production</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setServerModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveServer}
              >
                <Text style={styles.modalSaveText}>Save & Reconnect</Text>
              </TouchableOpacity>
            </View>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  topHeader: {
    marginBottom: 20,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  headerTitle: {
    ...typography.heading1,
    fontSize: 24,
    marginTop: 2,
  },
  profileCard: {
    flexDirection: 'row',
    backgroundColor: colors.bgCard,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 14,
    marginBottom: 24,
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  profileInitial: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.accent,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...typography.heading2,
    fontSize: 18,
  },
  profileEmail: {
    ...typography.bodySecondary,
    marginTop: 2,
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  roleBadge: {
    backgroundColor: colors.bgElevated,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  planBadge: {
    backgroundColor: colors.accentGlow,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accent,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  sectionSubtitle: {
    ...typography.bodySecondary,
    fontSize: 12,
    marginBottom: 12,
  },
  emptyAssistantsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.bgCard,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  emptyAssistantsText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  assistantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgCard,
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  assistantRowSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.bgElevated,
  },
  assistantLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  assistantName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  assistantNameSelected: {
    color: colors.accent,
  },
  assistantDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    maxWidth: 220,
  },
  checkBubble: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  settingInfo: {
    flex: 1,
    paddingRight: 12,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  settingDesc: {
    ...typography.caption,
    fontSize: 11,
    marginTop: 2,
  },
  clickableSettingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  clickableLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  serverValueText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.dangerBg,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.danger,
    marginTop: 10,
    marginBottom: 32,
  },
  logoutText: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerBrand: {
    ...typography.caption,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.textPrimary,
    marginTop: 10,
  },
  footerVersion: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  footerCopyright: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    backgroundColor: colors.bgCard,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    ...typography.heading2,
    fontSize: 18,
    marginBottom: 6,
  },
  modalSubtitle: {
    ...typography.bodySecondary,
    marginBottom: 16,
  },
  serverInputModal: {
    backgroundColor: colors.bgDark,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 12,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  presetChip: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: colors.bgElevated,
    borderRadius: 8,
    alignItems: 'center',
  },
  presetChipText: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: '600',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: colors.bgElevated,
  },
  modalCancelText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: colors.accent,
  },
  modalSaveText: {
    color: colors.textInverse,
    fontWeight: '700',
  },
});
