import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme, type Theme } from '../theme/ThemeContext';

type Variant = 'primary' | 'secondary' | 'success' | 'outline' | 'danger' | 'ghost';
type Size = 'md' | 'lg';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  fullWidth = true,
  style,
}: AppButtonProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isDisabled = disabled || loading;
  const variantStyle = variantStyles(theme)[variant];

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.base,
        size === 'lg' ? styles.lg : styles.md,
        variantStyle.container,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.text.color as string} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text style={[styles.label, size === 'lg' && styles.labelLg, variantStyle.text]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    base: {
      borderRadius: theme.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    md: {
      paddingVertical: 12,
      paddingHorizontal: theme.spacing.md,
    },
    lg: {
      paddingVertical: 16,
      paddingHorizontal: theme.spacing.lg,
    },
    fullWidth: {
      width: '100%',
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    label: {
      ...theme.typography.bodyMedium,
    },
    labelLg: {
      fontSize: 16,
    },
    disabled: {
      opacity: 0.5,
    },
    pressed: {
      opacity: 0.85,
      transform: [{ scale: 0.99 }],
    },
  });
}

function variantStyles(theme: Theme): Record<Variant, { container: ViewStyle; text: { color: string } }> {
  return {
    primary: {
      container: { backgroundColor: theme.colors.primary },
      text: { color: theme.colors.onPrimary },
    },
    secondary: {
      container: { backgroundColor: theme.colors.accent },
      text: { color: theme.colors.onAccent },
    },
    success: {
      container: { backgroundColor: theme.colors.success },
      text: { color: theme.colors.textInverse },
    },
    outline: {
      container: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: theme.colors.primary },
      text: { color: theme.colors.primary },
    },
    danger: {
      container: { backgroundColor: theme.colors.danger },
      text: { color: theme.colors.textInverse },
    },
    ghost: {
      container: { backgroundColor: 'transparent' },
      text: { color: theme.colors.primary },
    },
  };
}
