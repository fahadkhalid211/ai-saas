import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Circle,
  Path,
  G,
  ClipPath,
} from 'react-native-svg';

interface CresceloMarkProps {
  size?: number;
  motion?: 'still' | 'draw';
}

export function CresceloMark({ size = 48, motion = 'still' }: CresceloMarkProps) {
  // Exact seed positioning based on 100x100 viewBox
  const seedDiameter = (size * 11.2) / 100;
  const seedLeft = (size * 63) / 100 - seedDiameter / 2;
  const seedTop = (size * 50) / 100 - seedDiameter / 2;

  // Breathing animation for seed & glow
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.12)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (motion === 'still') {
      // 3.4s gentle breathing pulse matching website mark.css
      const seedAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.22,
            duration: 1700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.82,
            duration: 1700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 0.28,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.10,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      );

      seedAnimation.start();
      glowAnimation.start();

      return () => {
        seedAnimation.stop();
        glowAnimation.stop();
      };
    } else {
      // 'draw' loader motion
      const drawAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.4,
            duration: 900,
            easing: Easing.bezier(0.65, 0, 0.35, 1),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.4,
            duration: 900,
            easing: Easing.bezier(0.65, 0, 0.35, 1),
            useNativeDriver: true,
          }),
        ])
      );

      const spinAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );

      drawAnimation.start();
      spinAnimation.start();

      return () => {
        drawAnimation.stop();
        spinAnimation.stop();
      };
    }
  }, [motion, pulseAnim, glowAnim, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[{ width: size, height: size }, styles.container]}>
      <Svg viewBox="0 0 100 100" width={size} height={size}>
        <Defs>
          <LinearGradient id="tileGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#12432f" />
            <Stop offset="100%" stopColor="#04140d" />
          </LinearGradient>
          <LinearGradient id="cGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#f1ffc9" />
            <Stop offset="45%" stopColor="#abff44" />
            <Stop offset="100%" stopColor="#74d321" />
          </LinearGradient>
          <ClipPath id="tileClip">
            <Rect x="0" y="0" width="100" height="100" rx={26} />
          </ClipPath>
        </Defs>

        {/* Base Tile */}
        <Rect x="0" y="0" width="100" height="100" rx={26} fill="url(#tileGrad)" />

        <G clipPath="url(#tileClip)">
          {/* Subtle Ambient Lime Glow */}
          <Circle cx="50" cy="50" r="40" fill="#abff44" opacity={0.16} />

          {/* Bold "C" Arc */}
          <Path
            d="M69.9 33.3 A26 26 0 1 0 69.9 66.7"
            fill="none"
            stroke="url(#cGrad)"
            strokeWidth={14}
            strokeLinecap="round"
          />

        </G>

        {/* Crisp Border Highlight */}
        <Rect
          x="1"
          y="1"
          width="98"
          height="98"
          rx={25}
          fill="none"
          stroke="#abff44"
          strokeOpacity={0.32}
          strokeWidth={1.5}
        />
      </Svg>

      {/* Breathing Seed Overlay */}
      <Animated.View
        style={{
          position: 'absolute',
          left: seedLeft,
          top: seedTop,
          width: seedDiameter,
          height: seedDiameter,
          borderRadius: seedDiameter / 2,
          backgroundColor: '#abff44',
          transform: [{ scale: pulseAnim }],
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
