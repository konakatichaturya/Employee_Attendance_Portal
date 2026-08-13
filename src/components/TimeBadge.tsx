import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { SharedTheme } from '../theme';

interface TimeBadgeProps {
  theme: SharedTheme;
  mainText: string;
  unit: string;
  tone?: 'neutral' | 'success';
  size?: number;
}

// Big concentric-ring time display — replaces the old flat "heroTime" text
// block so the check-in/out card reads at a glance, the way a real HR app's
// dashboard clock does.
export function TimeBadge({ theme, mainText, unit, tone = 'neutral', size = 132 }: TimeBadgeProps) {
  const styles = useMemo(() => createStyles(theme, tone, size), [theme, tone, size]);
  return (
    <View style={styles.ring}>
      <View style={styles.core}>
        <Text style={styles.mainText} numberOfLines={1} adjustsFontSizeToFit>
          {mainText}
        </Text>
        <Text style={styles.unitText}>{unit}</Text>
      </View>
    </View>
  );
}

function createStyles(theme: SharedTheme, tone: 'neutral' | 'success', size: number) {
  const accentColor = tone === 'success' ? theme.colors.success : theme.colors.primary;
  const accentBg = tone === 'success' ? theme.colors.successBg : theme.colors.primaryLight;
  const core = size * 0.78;
  return StyleSheet.create({
    ring: {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: accentBg,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
    },
    core: {
      width: core,
      height: core,
      borderRadius: core / 2,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: accentColor,
      ...theme.elevation.md,
      paddingHorizontal: 6,
    },
    mainText: {
      fontSize: size * 0.19,
      fontWeight: '700',
      color: accentColor,
    },
    unitText: {
      ...theme.typography.captionMedium,
      color: theme.colors.textMuted,
      marginTop: 2,
    },
  });
}
