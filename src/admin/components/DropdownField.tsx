import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useWebTheme, type WebTheme } from '../ThemeContext';
import { lightColors } from '../../theme/colors';

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownFieldProps {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  options: DropdownOption[];
  error?: string;
  emptyMessage?: string;
  placeholder?: string;
}

export function DropdownField({
  label,
  value,
  onChange,
  options,
  error,
  emptyMessage,
  placeholder = 'Select…',
}: DropdownFieldProps) {
  const { theme } = useWebTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const selectStyle: React.CSSProperties = {
    width: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: 15,
    color: lightColors.textPrimary,
    padding: '12px 8px',
    cursor: 'pointer',
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {options.length === 0 ? (
        <Text style={styles.emptyText}>{emptyMessage ?? 'No options available'}</Text>
      ) : (
        <View style={[styles.selectWrapper, !!error && styles.selectWrapperError]}>
          {React.createElement(
            'select',
            {
              value: value ?? '',
              'aria-label': label,
              style: selectStyle,
              onChange: (e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value),
            },
            [
              React.createElement('option', { key: '__placeholder', value: '', disabled: true, hidden: true }, placeholder),
              ...options.map((option) =>
                React.createElement('option', { key: option.value, value: option.value }, option.label)
              ),
            ]
          )}
        </View>
      )}
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

function createStyles(theme: WebTheme) {
  return StyleSheet.create({
    container: {
      marginBottom: theme.spacing.md,
    },
    label: {
      ...theme.typography.captionMedium,
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    // Stays light regardless of dark/light mode, matching PillSelector and InputField.
    selectWrapper: {
      borderWidth: 1.5,
      borderColor: lightColors.border,
      borderRadius: theme.radius.md,
      backgroundColor: lightColors.surface,
    },
    selectWrapperError: {
      borderColor: lightColors.danger,
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
