import React, { useMemo } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, type Theme } from '../theme/ThemeContext';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
}

// Frosted-glass card (expo-blur) for use over the GradientBlobBackdrop —
// native counterpart to the web dashboard's translucent AdminCard.
export function GlassCard({ children, style, padded = true }: GlassCardProps) {
  const { theme, mode } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <BlurView intensity={50} tint={mode === 'dark' ? 'dark' : 'light'} style={[styles.base, padded && styles.padded, style]}>
      {children}
    </BlurView>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    base: {
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.14)',
      overflow: 'hidden',
      ...theme.elevation.sm,
    },
    padded: {
      padding: theme.spacing.md,
    },
  });
}
