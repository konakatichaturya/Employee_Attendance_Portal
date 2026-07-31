import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme, type Theme } from '../theme/ThemeContext';
import { lightColors } from '../theme/colors';

interface PillOption {
  value: string;
  label: string;
}

interface PillSelectorProps {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  options: PillOption[];
  error?: string;
  emptyMessage?: string;
}

export function PillSelector({ label, value, onChange, options, error, emptyMessage }: PillSelectorProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {options.length === 0 ? (
        <Text style={styles.emptyText}>{emptyMessage ?? 'No options available'}</Text>
      ) : (
        <View style={styles.row}>
          {options.map((option) => {
            const selected = value === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => onChange(option.value)}
                style={[styles.chip, selected && styles.chipSelected]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
      {!!error && <Text style={styles.errorText}>{error}</Text>}
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
    // Unselected chips stay light regardless of dark/light mode — see InputField.tsx
    // for why. The selected state already reads clearly on any background (theme
    // primary on white/near-white text), so it can stay theme-reactive.
    chip: {
      paddingVertical: 8,
      paddingHorizontal: 14,
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
    emptyText: {
      ...theme.typography.caption,
      color: theme.colors.textMuted,
    },
    errorText: {
      ...theme.typography.caption,
      color: theme.colors.danger,
      marginTop: 4,
    },
  });
}
