import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme, type Theme } from '../../../theme/ThemeContext';
import { lightColors } from '../../../theme/colors';
import { LEAVE_TYPES } from '../schema';

interface LeaveTypeSelectorProps {
  value: (typeof LEAVE_TYPES)[number] | null;
  onChange: (type: (typeof LEAVE_TYPES)[number]) => void;
}

export function LeaveTypeSelector({ value, onChange }: LeaveTypeSelectorProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Leave Type</Text>
      <View style={styles.row}>
        {LEAVE_TYPES.map((type) => {
          const selected = value === type;
          return (
            <Pressable
              key={type}
              onPress={() => onChange(type)}
              style={[styles.chip, selected && styles.chipSelected]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{type}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      marginBottom: theme.spacing.md,
    },
    label: {
      ...theme.typography.captionMedium,
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: theme.radius.pill,
      borderWidth: 1.5,
      borderColor: lightColors.border,
      backgroundColor: lightColors.surface,
    },
    chipSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    chipText: {
      ...theme.typography.bodyMedium,
      color: lightColors.textSecondary,
    },
    chipTextSelected: {
      color: theme.colors.onPrimary,
    },
  });
}
