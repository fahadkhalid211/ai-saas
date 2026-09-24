import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CresceloMark } from '../components/CresceloMark';
import { colors, typography } from '../theme/colors';

const { width } = Dimensions.get('window');

interface SplashScreenProps {
  statusText?: string;
}

export function SplashScreen({ statusText = 'Connecting to Crescelo Cloud...' }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const glowAnim = useRef(new Animated.Value(0.2)).current;
  const dotPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Logo entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Ambient glow pulse
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.55,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.2,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    glowLoop.start();

    // Dot pulse
    const dotLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(dotPulse, {
          toValue: 1.5,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(dotPulse, {
          toValue: 0.8,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    dotLoop.start();

    return () => {
      glowLoop.stop();
      dotLoop.stop();
    };
  }, [fadeAnim, scaleAnim, glowAnim, dotPulse]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#020905', '#08251a', '#030c07']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Ambient Radial Glow Orb */}
      <Animated.View
        style={[
          styles.glowOrb,
          {
            opacity: glowAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Animated Brand Mark */}
        <View style={styles.markContainer}>
          <CresceloMark size={108} motion="still" />
        </View>

        {/* Brand Title */}
        <Text style={styles.brandTitle}>CRESCELO</Text>

        {/* Elegant Accent Bar */}
        <View style={styles.accentBar} />

        {/* Subtitle */}
        <Text style={styles.brandSubtitle}>AI APPOINTMENTS & INTELLIGENCE</Text>
      </Animated.View>

      {/* Cloud Status Indicator */}
      <View style={styles.footer}>
        <View style={styles.statusPill}>
          <Animated.View
            style={[
              styles.statusDot,
              { transform: [{ scale: dotPulse }] },
            ]}
          />
          <Text style={styles.statusText}>{statusText}</Text>
        </View>
        <Text style={styles.versionText}>crescelo.com • v1.0.0 Native</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020905',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowOrb: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
    backgroundColor: '#abff44',
    filter: 'blur(60px)',
    opacity: 0.25,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markContainer: {
    marginBottom: 20,
    shadowColor: '#abff44',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
    elevation: 12,
  },
  brandTitle: {
    ...typography.heading1,
    fontSize: 32,
    letterSpacing: 6,
    color: '#fffeeb',
    fontWeight: '800',
    marginTop: 8,
  },
  accentBar: {
    width: 48,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.accent,
    marginVertical: 12,
  },
  brandSubtitle: {
    ...typography.caption,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 48,
    alignItems: 'center',
    gap: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(8, 37, 26, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(171, 255, 68, 0.25)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  statusText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  versionText: {
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
});
