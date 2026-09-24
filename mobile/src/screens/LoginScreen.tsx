import React, { useState, useRef } from 'react';
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
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react-native';
import { colors, typography } from '../theme/colors';
import { CresceloMark } from '../components/CresceloMark';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </Svg>
  );
}

export function LoginScreen() {
  const { login, loginWithGoogle, quickDemoLogin, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<'email' | 'password' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const googleScaleAnim = useRef(new Animated.Value(1)).current;
  const loginScaleAnim = useRef(new Animated.Value(1)).current;

  const triggerHaptic = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics not available
    }
  };

  const handleGoogleLogin = async () => {
    triggerHaptic();
    try {
      setErrorMessage(null);
      setGoogleLoading(true);
      await loginWithGoogle();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Google sign-in could not be completed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    triggerHaptic();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your email and password');
      return;
    }

    try {
      setErrorMessage(null);
      setSubmitting(true);
      await login(email.trim(), password);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Login failed. Please verify credentials or connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoAccess = async () => {
    triggerHaptic();
    try {
      setErrorMessage(null);
      setDemoLoading(true);
      await quickDemoLogin();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Could not connect to workspace. Please check internet connection.');
    } finally {
      setDemoLoading(false);
    }
  };

  const isAnyLoading = submitting || googleLoading || demoLoading || isLoading;

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#020a05', '#061d14', '#020804']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Ambient background glow orb */}
      <View style={styles.ambientGlow} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Brand Header */}
          <View style={styles.brandContainer}>
            <View style={styles.logoHalo}>
              <CresceloMark size={76} motion="still" />
            </View>
            <Text style={styles.brandTitle}>CRESCELO</Text>
            <Text style={styles.brandSubtitle}>
              Live Appointments & Lead Intelligence
            </Text>

            {/* Cloud Status Pill */}
            <View style={styles.cloudStatusPill}>
              <View style={styles.livePulseDot} />
              <Text style={styles.cloudStatusText}>Connected to Crescelo Cloud</Text>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign In</Text>
            <Text style={styles.cardSubtitle}>
              Access your real-time booking calendar and client leads
            </Text>

            {errorMessage ? (
              <View style={styles.errorBox}>
                <AlertCircle size={16} color={colors.danger} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Google OAuth Hero Button */}
            <TouchableOpacity
              style={[
                styles.googleButton,
                googleLoading && styles.disabledButton,
              ]}
              onPress={handleGoogleLogin}
              disabled={isAnyLoading}
              activeOpacity={0.85}
              onPressIn={() => {
                Animated.spring(googleScaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
              }}
              onPressOut={() => {
                Animated.spring(googleScaleAnim, { toValue: 1, useNativeDriver: true }).start();
              }}
            >
              <Animated.View style={[styles.googleButtonContent, { transform: [{ scale: googleScaleAnim }] }]}>
                {googleLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <View style={styles.googleIconWrapper}>
                      <GoogleIcon size={20} />
                    </View>
                    <Text style={styles.googleButtonText}>Continue with Google</Text>
                  </>
                )}
              </Animated.View>
            </TouchableOpacity>

            {/* Luxury Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR SIGN IN WITH EMAIL</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedInput === 'email' && styles.inputContainerFocused,
                ]}
              >
                <Mail
                  size={18}
                  color={focusedInput === 'email' ? colors.accent : colors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="name@business.com"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={(t: string) => {
                    setEmail(t);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PASSWORD OR ACCESS CODE</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedInput === 'password' && styles.inputContainerFocused,
                ]}
              >
                <Lock
                  size={18}
                  color={focusedInput === 'password' ? colors.accent : colors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Enter your account password"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={(t: string) => {
                    setPassword(t);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => {
                    triggerHaptic();
                    setShowPassword(!showPassword);
                  }}
                >
                  {showPassword ? (
                    <EyeOff size={18} color={colors.textSecondary} />
                  ) : (
                    <Eye size={18} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Primary Sign In Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                isAnyLoading && styles.disabledButton,
              ]}
              onPress={handleEmailLogin}
              disabled={isAnyLoading}
              activeOpacity={0.88}
              onPressIn={() => {
                Animated.spring(loginScaleAnim, { toValue: 0.98, useNativeDriver: true }).start();
              }}
              onPressOut={() => {
                Animated.spring(loginScaleAnim, { toValue: 1, useNativeDriver: true }).start();
              }}
            >
              <Animated.View style={[styles.loginButtonContent, { transform: [{ scale: loginScaleAnim }] }]}>
                {submitting ? (
                  <ActivityIndicator color={colors.textInverse} size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>Sign In to App</Text>
                )}
              </Animated.View>
            </TouchableOpacity>

            {/* Quick Demo Workspace Access */}
            <TouchableOpacity
              style={styles.demoAccessButton}
              onPress={handleDemoAccess}
              disabled={isAnyLoading}
              activeOpacity={0.7}
            >
              {demoLoading ? (
                <ActivityIndicator size="small" color={colors.accent} />
              ) : (
                <>
                  <Sparkles size={14} color={colors.accent} />
                  <Text style={styles.demoAccessText}>
                    Explore Live Workspace Preview
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Secure Sync Badge */}
          <View style={styles.secureFooter}>
            <ShieldCheck size={15} color={colors.accent} />
            <Text style={styles.secureFooterText}>
              256-Bit Encrypted TLS Connection to crescelo.com
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
    backgroundColor: '#020a05',
  },
  keyboardContainer: {
    flex: 1,
  },
  ambientGlow: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: (width * 0.75) / 2,
    backgroundColor: '#abff44',
    opacity: 0.08,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 22,
    paddingTop: 36,
    paddingBottom: 36,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 26,
  },
  logoHalo: {
    shadowColor: '#abff44',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  brandTitle: {
    ...typography.heading1,
    fontSize: 28,
    color: '#fffeeb',
    marginTop: 14,
    letterSpacing: 4,
    fontWeight: '800',
  },
  brandSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
    fontSize: 12,
    letterSpacing: 0.8,
  },
  cloudStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(8, 37, 26, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(171, 255, 68, 0.22)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    marginTop: 12,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  cloudStatusText: {
    fontSize: 11,
    color: colors.textPrimary,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  card: {
    backgroundColor: 'rgba(9, 29, 21, 0.85)',
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(171, 255, 68, 0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 12,
  },
  cardTitle: {
    ...typography.heading2,
    fontSize: 21,
    color: colors.textPrimary,
    marginBottom: 3,
  },
  cardSubtitle: {
    ...typography.bodySecondary,
    fontSize: 12,
    marginBottom: 18,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  errorText: {
    flex: 1,
    color: '#ff6b6b',
    fontSize: 13,
    fontWeight: '500',
  },
  googleButton: {
    backgroundColor: '#13211b',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  googleIconWrapper: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 1,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.8,
    fontSize: 10,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#04130d',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
  },
  inputContainerFocused: {
    borderColor: colors.accent,
    backgroundColor: '#051810',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 13,
    color: colors.textPrimary,
    fontSize: 14,
  },
  eyeButton: {
    padding: 8,
  },
  loginButton: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  loginButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.65,
  },
  loginButtonText: {
    color: '#08251a',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  demoAccessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 8,
  },
  demoAccessText: {
    ...typography.caption,
    color: colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  secureFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 22,
  },
  secureFooterText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
});
