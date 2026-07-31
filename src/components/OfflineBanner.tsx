import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, type Theme } from '../theme/ThemeContext';

export function OfflineBanner() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="wifi-off" size={16} color={theme.colors.warning} />
      <Text style={styles.text}>You're offline. Showing last synced data.</Text>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: theme.colors.warningBg,
      paddingVertical: 8,
      paddingHorizontal: theme.spacing.md,
    },
    text: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
  });
}
