import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View, type KeyboardTypeOptions } from 'react-native';
import { useTheme, type Theme } from '../theme/ThemeContext';
import { lightColors } from '../theme/colors';

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  numberOfLines?: number;
  editable?: boolean;
  rightElement?: React.ReactNode;
  onBlur?: () => void;
}

export function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'sentences',
  multiline,
  numberOfLines,
  editable = true,
  rightElement,
  onBlur,
}: InputFieldProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          focused && styles.inputWrapperFocused,
          !!error && styles.inputWrapperError,
          !editable && styles.inputWrapperDisabled,
          multiline && { height: 22 * (numberOfLines ?? 4) + 24 },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={lightColors.textMuted}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          style={[styles.input, multiline && styles.multilineInput]}
          accessibilityLabel={label}
          accessibilityHint={placeholder}
        />
        {rightElement}
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
    // The input box itself always stays light, regardless of the app's dark/light
    // mode — matching how it already looked everywhere (readable text entry against
    // dark forms) before dark mode existed. Only the label/error text below it,
    // which sits directly on the (possibly dark) page background, follows the theme.
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: lightColors.border,
      borderRadius: theme.radius.md,
      backgroundColor: lightColors.surface,
      paddingHorizontal: theme.spacing.sm,
    },
    inputWrapperFocused: {
      borderColor: lightColors.primary,
    },
    inputWrapperError: {
      borderColor: lightColors.danger,
    },
    inputWrapperDisabled: {
      backgroundColor: lightColors.surfaceAlt,
    },
    input: {
      flex: 1,
      ...theme.typography.body,
      color: lightColors.textPrimary,
      paddingVertical: 12,
    },
    multilineInput: {
      textAlignVertical: 'top',
      paddingTop: 12,
    },
    errorText: {
      ...theme.typography.caption,
      color: theme.colors.danger,
      marginTop: 4,
    },
  });
}
