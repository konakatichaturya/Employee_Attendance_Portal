import React, { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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

export function DateField({ label, value, onChange, minimumDate, maximumDate, error, placeholder = 'Select date' }: DateFieldProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [open, setOpen] = useState(false);

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setOpen(false);
    }
    if (event.type === 'set' && selectedDate) {
      onChange(selectedDate);
      if (Platform.OS === 'ios') setOpen(false);
    } else if (event.type === 'dismissed') {
      setOpen(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.field, !!error && styles.fieldError]}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <MaterialCommunityIcons name="calendar-outline" size={18} color={lightColors.textMuted} />
        <Text style={[styles.value, !value && styles.placeholder]}>
          {value ? format(value, 'EEE, dd MMM yyyy') : placeholder}
        </Text>
      </Pressable>
      {!!error && <Text style={styles.errorText}>{error}</Text>}

      {open && (
        <DateTimePicker
          value={value ?? minimumDate ?? new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
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
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
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
