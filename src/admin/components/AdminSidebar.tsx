import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWebTheme, type WebTheme } from '../ThemeContext';

export interface SidebarItem<T extends string> {
  key: T;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

interface AdminSidebarProps<T extends string> {
  active: T;
  onChange: (section: T) => void;
  items: SidebarItem<T>[];
  brandLabel: string;
  brandIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
}

export function AdminSidebar<T extends string>({
  active,
  onChange,
  items,
  brandLabel,
  brandIcon = 'calendar-check',
}: AdminSidebarProps<T>) {
  const { theme, mode, toggleMode } = useWebTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.sidebar}>
      <View style={styles.brandRow}>
        <View style={styles.brandIcon}>
          <MaterialCommunityIcons name={brandIcon} size={20} color={theme.colors.onPrimary} />
        </View>
        <Text style={styles.brandText}>{brandLabel}</Text>
      </View>

      {items.map((item) => {
        const isActive = active === item.key;
        return (
          <Pressable
            key={item.key}
            onPress={() => onChange(item.key)}
            style={[styles.navItem, isActive && styles.navItemActive]}
            accessibilityRole="button"
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={20}
              color={isActive ? theme.colors.primary : theme.colors.textMuted}
            />
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{item.label}</Text>
          </Pressable>
        );
      })}

      <View style={styles.spacer} />

      <Pressable onPress={toggleMode} style={styles.navItem} accessibilityRole="button">
        <MaterialCommunityIcons
          name={mode === 'dark' ? 'weather-sunny' : 'weather-night'}
          size={20}
          color={theme.colors.textMuted}
        />
        <Text style={styles.navLabel}>{mode === 'dark' ? 'Light mode' : 'Dark mode'}</Text>
      </Pressable>
    </View>
  );
}

function createStyles(theme: WebTheme) {
  return StyleSheet.create({
    sidebar: {
      width: 240,
      backgroundColor: theme.colors.surface,
      borderRightWidth: 1,
      borderRightColor: theme.colors.border,
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.sm,
    },
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    brandIcon: {
      width: 32,
      height: 32,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    brandText: {
      ...theme.typography.subtitle,
      color: theme.colors.textPrimary,
    },
    navItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingVertical: 10,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.radius.md,
      marginBottom: 2,
    },
    navItemActive: {
      backgroundColor: theme.colors.primaryLight,
    },
    navLabel: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
    },
    navLabelActive: {
      color: theme.colors.primary,
      fontWeight: '700',
    },
    spacer: {
      flex: 1,
      minHeight: theme.spacing.lg,
    },
  });
}
