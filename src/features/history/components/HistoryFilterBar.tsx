import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme, type Theme } from '../../../theme/ThemeContext';
import type { HistoryFilter } from '../../../types';

interface HistoryFilterBarProps {
  value: HistoryFilter;
  onChange: (filter: HistoryFilter) => void;
}

const OPTIONS: { key: HistoryFilter; label: string }[] = [
  { key: '7d', label: 'Last 7 Days' },
  { key: '30d', label: 'Last 30 Days' },
  { key: 'custom', label: 'Custom Range' },
];

export function HistoryFilterBar({ value, onChange }: HistoryFilterBarProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.container}>
      {OPTIONS.map((option) => {
        const selected = value === option.key;
        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            style={[styles.segment, selected && styles.segmentSelected]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: theme.radius.md,
      padding: 4,
    },
    segment: {
      flex: 1,
      paddingVertical: 8,
      alignItems: 'center',
      borderRadius: theme.radius.sm,
    },
    segmentSelected: {
      backgroundColor: theme.colors.surface,
      ...theme.elevation.sm,
    },
    segmentText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
    segmentTextSelected: {
      color: theme.colors.primary,
      fontWeight: '700',
    },
  });
}
