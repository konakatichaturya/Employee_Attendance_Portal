import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import type { WebTheme } from '../../admin/ThemeContext';
import type { FeatureItem } from '../content';

interface FeatureCardProps {
  theme: WebTheme;
  feature: FeatureItem;
  color: string;
}

const pointerStyle = { cursor: 'pointer' } as any;

// Hover state modeled on BambooHR's feature-picker cards: hovering tints the
// card with its color, lifts it slightly, and a checkbox in the corner fills
// in with a checkmark — all animated, all reverting on hover-out.
export function FeatureCard({ theme, feature, color }: FeatureCardProps) {
  const styles = useMemo(() => createStyles(theme, color), [theme, color]);
  const gradientId = `featureGradient-${React.useId()}`;

  const hover = useSharedValue(0);
  const onHoverIn = () => {
    hover.value = withTiming(1, { duration: 220 });
  };
  const onHoverOut = () => {
    hover.value = withTiming(0, { duration: 220 });
  };

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + hover.value * 0.025 }, { translateY: hover.value * -4 }],
    borderColor: interpolateColor(hover.value, [0, 1], [`${color}55`, color]),
  }));

  const tintStyle = useAnimatedStyle(() => ({ opacity: hover.value * 0.12 }));
  const checkFillStyle = useAnimatedStyle(() => ({ transform: [{ scale: hover.value }] }));
  const checkIconStyle = useAnimatedStyle(() => ({ opacity: hover.value }));
  const checkBoxBorderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(hover.value, [0, 1], [theme.colors.border, color]),
  }));

  const hasPhoto = !!feature.bgImage;

  return (
    <Pressable onHoverIn={onHoverIn} onHoverOut={onHoverOut} style={pointerStyle} accessibilityRole="text">
      <Animated.View style={[styles.card, hasPhoto && styles.cardPhoto, cardStyle]}>
        {hasPhoto && (
          <>
            <Image source={{ uri: feature.bgImage }} style={styles.cardPhotoImage} resizeMode="cover" />
            <View style={[styles.cardPhotoScrim, { backgroundColor: color }]} />
          </>
        )}

        <Animated.View style={[styles.tint, { backgroundColor: color }, tintStyle]} />

        <Animated.View style={[styles.checkbox, hasPhoto && styles.checkboxOnPhoto, checkBoxBorderStyle]}>
          <Animated.View style={[styles.checkboxFill, { backgroundColor: color }, checkFillStyle]} />
          <Animated.View style={[StyleSheet.absoluteFill, styles.checkboxIconWrapper, checkIconStyle]}>
            <MaterialCommunityIcons name="check-bold" size={11} color="#FFFFFF" />
          </Animated.View>
        </Animated.View>

        <View style={[styles.badgeWrapper, hasPhoto && styles.badgeWrapperOnPhoto]}>
          <Svg width={56} height={56} viewBox="0 0 56 56" style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={color} stopOpacity={0.95} />
                <Stop offset="1" stopColor={color} stopOpacity={0.55} />
              </LinearGradient>
            </Defs>
            <Circle cx={28} cy={28} r={26} fill={`url(#${gradientId})`} />
          </Svg>
          {!hasPhoto && <View style={styles.glow} />}
          <MaterialCommunityIcons name={feature.icon} size={24} color="#FFFFFF" />
        </View>
        <Text style={[styles.label, hasPhoto && styles.labelOnPhoto]}>{feature.label}</Text>
      </Animated.View>
    </Pressable>
  );
}

function createStyles(theme: WebTheme, color: string) {
  return StyleSheet.create({
    card: {
      width: 200,
      alignItems: 'center',
      paddingVertical: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1.5,
      overflow: 'hidden',
      ...theme.elevation.sm,
    },
    cardPhoto: {
      borderColor: color,
    },
    cardPhotoImage: {
      ...StyleSheet.absoluteFillObject,
    },
    // Tints the photo with the feature's color so it stays on-brand and the
    // white label text placed on top stays legible.
    cardPhotoScrim: {
      ...StyleSheet.absoluteFillObject,
      opacity: 0.6,
    },
    tint: {
      ...StyleSheet.absoluteFillObject,
    },
    checkbox: {
      position: 'absolute',
      top: 10,
      left: 10,
      width: 18,
      height: 18,
      borderRadius: 4,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    checkboxOnPhoto: {
      backgroundColor: 'rgba(255,255,255,0.85)',
    },
    checkboxFill: {
      ...StyleSheet.absoluteFillObject,
    },
    checkboxIconWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeWrapper: {
      width: 56,
      height: 56,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
    },
    // A white ring so the medallion badge stands out clearly against the
    // busier photo background instead of blending into it.
    badgeWrapperOnPhoto: {
      borderRadius: 32,
      borderWidth: 3,
      borderColor: 'rgba(255,255,255,0.9)',
    },
    glow: {
      position: 'absolute',
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: color,
      opacity: 0.16,
    },
    label: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
      textAlign: 'center',
    },
    labelOnPhoto: {
      color: '#FFFFFF',
      fontWeight: '700',
    },
  });
}
