import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import type { SharedTheme } from '../theme';

type LogoSize = 'sm' | 'md' | 'lg' | 'xl';
type LogoTone = 'brand' | 'inverse';

interface LogoProps {
  theme: SharedTheme;
  size?: LogoSize;
  tone?: LogoTone;
  showLabel?: boolean;
  label?: string;
}

const SIZE_PRESETS: Record<LogoSize, { mark: number; label: keyof SharedTheme['typography'] }> = {
  sm: { mark: 34, label: 'subtitle' },
  md: { mark: 54, label: 'h3' },
  lg: { mark: 76, label: 'h2' },
  xl: { mark: 112, label: 'h1' },
};

// Single source of truth for the app's brand mark — a bespoke monogram (a
// verified-time ring + checkmark, rendered in react-native-svg so it's crisp
// at any size on both native and web) rather than a generic icon-in-a-circle.
// Used on the login/auth screens, the web sidebar, the native drawer, the
// desktop auth brand panel, and the marketing landing page.
export function Logo({ theme, size = 'md', tone = 'brand', showLabel = false, label = 'WorkTrack' }: LogoProps) {
  const preset = SIZE_PRESETS[size];
  const inverse = tone === 'inverse';
  const styles = useMemo(() => createStyles(theme, preset, inverse), [theme, preset, inverse]);
  const gradientId = `logoGradient-${React.useId()}`;

  // A slow, gentle breathing pulse — subtle enough to sit in a nav bar or
  // sidebar all day without being distracting, but reads as "alive".
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 1100, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
    );
  }, []);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.markShadow, inverse && styles.markShadowInverse, pulseStyle]}>
        <Svg width={preset.mark} height={preset.mark} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={theme.colors.primaryDark} />
              <Stop offset="1" stopColor={theme.colors.accent} />
            </LinearGradient>
          </Defs>
          <Path
            d="M30 4 H70 A26 26 0 0 1 96 30 V70 A26 26 0 0 1 70 96 H30 A26 26 0 0 1 4 70 V30 A26 26 0 0 1 30 4 Z"
            fill={inverse ? 'rgba(255,255,255,0.16)' : `url(#${gradientId})`}
          />
          <Circle cx={50} cy={50} r={26} stroke="#FFFFFF" strokeWidth={6} fill="none" opacity={0.9} />
          <Path
            d="M36 51 L46 61 L67 38"
            stroke="#FFFFFF"
            strokeWidth={7.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      </Animated.View>
      {showLabel && <Text style={styles.label}>{label}</Text>}
    </View>
  );
}

function createStyles(theme: SharedTheme, preset: (typeof SIZE_PRESETS)[LogoSize], inverse: boolean) {
  return StyleSheet.create({
    wrapper: {
      alignItems: 'center',
    },
    markShadow: {
      borderRadius: preset.mark * 0.28,
      ...theme.elevation.md,
    },
    markShadowInverse: {
      shadowOpacity: 0,
      elevation: 0,
    },
    label: {
      ...theme.typography[preset.label],
      color: inverse ? theme.colors.textInverse : theme.colors.textPrimary,
      marginTop: theme.spacing.xs,
    },
  });
}
