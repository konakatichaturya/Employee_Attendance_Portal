import React, { useMemo } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useWebTheme, type WebTheme } from '../ThemeContext';

interface AdminCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
}

export function AdminCard({ children, style, padded = true }: AdminCardProps) {
  const { theme } = useWebTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return <View style={[styles.base, padded && styles.padded, style]}>{children}</View>;
}

function createStyles(theme: WebTheme) {
  return StyleSheet.create({
    base: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    padded: {
      padding: theme.spacing.md,
    },
  });
}
