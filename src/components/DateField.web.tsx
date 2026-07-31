import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { format } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
// .web.tsx sibling uses a real HTML date input for the OS picker behavior.
//
// The input's own text rendering is unreliable across mobile browsers (iOS Safari
// in particular can render it completely blank regardless of CSS overrides), so we
// don't rely on it to show anything. Instead the input is made fully transparent
// and stacked on top of a normal <Text> that we render and color ourselves — the
// input is purely an invisible tap target that opens the native date picker and
// reports the chosen value back via onChange.
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

  const inputStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    margin: 0,
    padding: 0,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    opacity: 0,
    cursor: 'pointer',
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.field, !!error && styles.fieldError]}>
        <Text style={[styles.value, !value && styles.placeholder]}>
          {value ? format(value, 'EEE, dd MMM yyyy') : placeholder}
        </Text>
        <MaterialCommunityIcons name="calendar-outline" size={18} color={lightColors.textMuted} />
        {React.createElement('input', {
          type: 'date',
          value: toInputValue(value),
          min: toInputValue(minimumDate),
          max: toInputValue(maximumDate),
          'aria-label': label,
          style: inputStyle,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            const parsed = parseInputValue(e.target.value);
            if (parsed) onChange(parsed);
          },
        })}
      </View>
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
    // Stays light regardless of dark/light mode — see InputField.tsx for why.
    field: {
      position: 'relative',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1.5,
      borderColor: lightColors.border,
      borderRadius: theme.radius.md,
      backgroundColor: lightColors.surface,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 12,
    },
    fieldError: {
      borderColor: lightColors.danger,
    },
    value: {
      ...theme.typography.body,
      color: lightColors.textPrimary,
    },
    placeholder: {
      color: lightColors.textMuted,
    },
    errorText: {
      ...theme.typography.caption,
      color: theme.colors.danger,
      marginTop: 4,
    },
  });
}
