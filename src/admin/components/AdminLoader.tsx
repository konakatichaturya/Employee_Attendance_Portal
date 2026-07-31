import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useWebTheme, type WebTheme } from '../ThemeContext';

interface AdminLoaderProps {
  label?: string;
}

export function AdminLoader({ label }: AdminLoaderProps) {
  const { theme } = useWebTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {!!label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
}

function createStyles(theme: WebTheme) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.lg,
    },
    label: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.sm,
    },
  });
}
