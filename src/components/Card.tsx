import React, { useMemo } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useTheme, type Theme } from '../theme/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
  elevationLevel?: keyof Theme['elevation'];
}

export function Card({ children, style, padded = true, elevationLevel = 'sm' }: CardProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={[styles.base, padded && styles.padded, theme.elevation[elevationLevel], style]}>{children}</View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    base: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
    },
    padded: {
      padding: theme.spacing.md,
    },
  });
}
