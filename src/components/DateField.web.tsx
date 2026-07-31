import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { format } from 'date-fns';
import { useTheme, type Theme } from '../theme/ThemeContext';
import { lightColors } from '../theme/colors';

interface DateFieldProps {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  error?: string;
  placeholder?: string;
}

function toInputValue(date: Date | null | undefined): string {
  if (!date) return '';
  return format(date, 'yyyy-MM-dd');
}

function parseInputValue(value: string): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

// react-native-community/datetimepicker has no web implementation, so the native
// DateField (DateField.tsx) doesn't render a usable picker in the browser. This
// .web.tsx sibling is automatically picked up by the bundler for web builds and
// uses a real HTML date input instead, which is natively clickable/selectable.
export function DateField({
  label,
  value,
  onChange,
  minimumDate,
  maximumDate,
  error,
  placeholder = 'Select date',
}: DateFieldProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Stays light regardless of dark/light mode — see InputField.tsx for why.
  const inputStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    border: `1.5px solid ${error ? lightColors.danger : lightColors.border}`,
    borderRadius: theme.radius.md,
    backgroundColor: lightColors.surface,
    color: value ? lightColors.textPrimary : lightColors.textMuted,
    padding: '12px 10px',
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
    cursor: 'pointer',
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {React.createElement('input', {
        type: 'date',
        value: toInputValue(value),
        min: toInputValue(minimumDate),
        max: toInputValue(maximumDate),
        placeholder,
        'aria-label': label,
        style: inputStyle,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          const parsed = parseInputValue(e.target.value);
          if (parsed) onChange(parsed);
        },
      })}
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
      marginBottom: 6,
    },
    errorText: {
      ...theme.typography.caption,
      color: theme.colors.danger,
      marginTop: 4,
    },
  });
}
