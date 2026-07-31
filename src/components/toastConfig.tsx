import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ToastConfig } from 'react-native-toast-message';
import { useTheme, type Theme } from '../theme/ThemeContext';

function ToastCard({
  icon,
  variant,
  text1,
  text2,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  variant: 'success' | 'error' | 'info';
  text1?: string;
  text2?: string;
}) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const iconColor = variant === 'success' ? theme.colors.success : variant === 'error' ? theme.colors.danger : theme.colors.primary;

  return (
    <View style={styles.card}>
      <View style={[styles.iconWrapper, { backgroundColor: `${iconColor}1A` }]}>
        <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.textWrapper}>
        {!!text1 && <Text style={styles.title}>{text1}</Text>}
        {!!text2 && <Text style={styles.message}>{text2}</Text>}
      </View>
    </View>
  );
}

export const toastConfig: ToastConfig = {
  success: ({ text1, text2 }) => <ToastCard icon="check-circle" variant="success" text1={text1} text2={text2} />,
  error: ({ text1, text2 }) => <ToastCard icon="alert-circle" variant="error" text1={text1} text2={text2} />,
  info: ({ text1, text2 }) => <ToastCard icon="information" variant="info" text1={text1} text2={text2} />,
};

function createStyles(theme: Theme) {
  return StyleSheet.create({
    card: {
      width: '92%',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.md,
      padding: theme.spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      ...theme.elevation.md,
    },
    iconWrapper: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.sm,
    },
    textWrapper: {
      flex: 1,
    },
    title: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
    },
    message: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
  });
}
