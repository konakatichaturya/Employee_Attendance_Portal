import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, type Theme } from '../../theme/ThemeContext';

interface AuthHeaderProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  tagline: string;
}

export function AuthHeader({ icon, tagline }: AuthHeaderProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.wrapper}>
      <View style={styles.ringOuter}>
        <View style={styles.ringInner}>
          <MaterialCommunityIcons name={icon} size={40} color={theme.colors.onPrimary} />
        </View>
      </View>
      <Text style={styles.appName}>WorkTrack</Text>
      <Text style={styles.tagline}>{tagline}</Text>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  ringOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  ringInner: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.elevation.md,
  },
  appName: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
  },
  tagline: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  });
}
