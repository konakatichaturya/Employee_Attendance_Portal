import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTheme, type Theme } from '../theme/ThemeContext';

interface LoaderProps {
  label?: string;
  fullScreen?: boolean;
}

export function Loader({ label, fullScreen = false }: LoaderProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {!!label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.lg,
    },
    fullScreen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    label: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.sm,
    },
  });
}
