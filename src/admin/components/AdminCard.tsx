import React, { useMemo } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useWebTheme, type WebTheme, type WebThemeMode } from '../ThemeContext';

interface AdminCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
}

export function AdminCard({ children, style, padded = true }: AdminCardProps) {
  const { theme, mode } = useWebTheme();
  const styles = useMemo(() => createStyles(theme, mode), [theme, mode]);
  return <View style={[styles.base, padded && styles.padded, style]}>{children}</View>;
}

function createStyles(theme: WebTheme, mode: WebThemeMode) {
  return StyleSheet.create({
    base: {
      backgroundColor: mode === 'dark' ? 'rgba(32,38,60,0.6)' : 'rgba(255,255,255,0.66)',
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: mode === 'dark' ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.75)',
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      ...theme.elevation.sm,
    } as any,
    padded: {
      padding: theme.spacing.md,
    },
  });
}
