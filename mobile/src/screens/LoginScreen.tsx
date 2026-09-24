import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { colors, typography } from '../theme/colors';
import { CresceloMark } from '../components/CresceloMark';
import { useAuth } from '../context/AuthContext';
import { Settings, Eye, EyeOff, Server, ShieldCheck } from 'lucide-react-native';

export function LoginScreen() {
  const { login, serverUrl, setServerUrl, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [customUrl, setCustomUrl] = useState(serverUrl);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your email and password');
      return;
    }

    try {
      setErrorMessage(null);
      setSubmitting(true);
      await login(email.trim(), password);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Login failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveServerUrl = () => {
    if (!customUrl.trim()) return;
    setServerUrl(customUrl.trim());
    setShowServerConfig(false);
    Alert.alert('Server Updated', `Connecting to: ${customUrl.trim()}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Brand Header */}
          <View style={styles.brandContainer}>
            <CresceloMark size={76} motion="still" />
            <Text style={styles.brandTitle}>CRESCELO</Text>
            <Text style={styles.brandSubtitle}>
              Live Appointments & Lead Intelligence
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign In</Text>
            <Text style={styles.cardSubtitle}>
              Use your Crescelo account credentials or staff access code
            </Text>

            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.input}
                placeholder="name@business.com"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={(t: string) => {
                  setEmail(t);
                  if (errorMessage) setErrorMessage(null);
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PASSWORD OR ACCESS CODE</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, { flex: 1, paddingRight: 40 }]}
                  placeholder="Enter password"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={(t: string) => {
                    setPassword(t);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={18} color={colors.textSecondary} />
                  ) : (
                    <Eye size={18} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.loginButton, (submitting || isLoading) && styles.disabledButton]}
              onPress={handleLogin}
              disabled={submitting || isLoading}
              activeOpacity={0.85}
            >
              {submitting || isLoading ? (
                <ActivityIndicator color={colors.textInverse} />
              ) : (
                <Text style={styles.loginButtonText}>Sign In to App</Text>
              )}
            </TouchableOpacity>

            {/* Server Settings Link */}
            <TouchableOpacity
              style={styles.serverSettingsToggle}
              onPress={() => setShowServerConfig(!showServerConfig)}
            >
              <Server size={14} color={colors.textSecondary} />
              <Text style={styles.serverSettingsToggleText}>
                {showServerConfig ? 'Hide Server Configuration' : 'Server Endpoint Settings'}
              </Text>
            </TouchableOpacity>

            {/* Server Configuration Tray */}
            {showServerConfig && (
              <View style={styles.serverConfigBox}>
                <Text style={styles.serverConfigTitle}>API Server URL</Text>
                <TextInput
                  style={styles.serverInput}
                  value={customUrl}
                  onChangeText={setCustomUrl}
                  placeholder="http://10.0.2.2:3000"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                />
                <View style={styles.serverPresetRow}>
                  <TouchableOpacity
                    style={styles.presetButton}
                    onPress={() => setCustomUrl('http://10.0.2.2:3000')}
                  >
                    <Text style={styles.presetText}>Emulator (10.0.2.2)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.presetButton}
                    onPress={() => setCustomUrl('https://crescelo.com')}
                  >
                    <Text style={styles.presetText}>Production</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.saveServerButton}
                  onPress={handleSaveServerUrl}
                >
                  <Text style={styles.saveServerButtonText}>Save Endpoint</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Secure Sync Notice */}
          <View style={styles.secureFooter}>
            <ShieldCheck size={16} color={colors.accent} />
            <Text style={styles.secureFooterText}>
              256-Bit Encrypted Sync with Crescelo Cloud
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bgDark,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingTop: 36,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  brandTitle: {
    ...typography.heading1,
    fontSize: 28,
    color: colors.textPrimary,
    marginTop: 16,
    letterSpacing: 3,
  },
  brandSubtitle: {
    ...typography.caption,
    color: colors.accent,
    marginTop: 6,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  cardTitle: {
    ...typography.heading2,
    fontSize: 22,
    marginBottom: 4,
  },
  cardSubtitle: {
    ...typography.bodySecondary,
    marginBottom: 20,
  },
  errorBox: {
    backgroundColor: colors.dangerBg,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: colors.bgDark,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  passwordContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    padding: 6,
  },
  loginButton: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.65,
  },
  loginButtonText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: '700',
  },
  serverSettingsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
    paddingVertical: 6,
  },
  serverSettingsToggleText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  serverConfigBox: {
    marginTop: 14,
    padding: 14,
    backgroundColor: colors.bgDark,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  serverConfigTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  serverInput: {
    backgroundColor: colors.bgCard,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 13,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  serverPresetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  presetButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: colors.bgElevated,
    borderRadius: 6,
    alignItems: 'center',
  },
  presetText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  saveServerButton: {
    backgroundColor: colors.bgElevated,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  saveServerButtonText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  secureFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 28,
  },
  secureFooterText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
});
