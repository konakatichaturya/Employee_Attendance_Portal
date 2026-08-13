import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWebTheme, type WebTheme, type WebThemeMode } from '../ThemeContext';
import { Logo } from '../../components/Logo';

export interface SidebarItem<T extends string> {
  key: T;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  /** Marks items that open a slide-out panel instead of switching the main page (e.g. Calendar). */
  flyout?: boolean;
}

interface AdminSidebarProps<T extends string> {
  active: T;
  onChange: (section: T) => void;
  items: SidebarItem<T>[];
  brandLabel: string;
}

export function AdminSidebar<T extends string>({ active, onChange, items, brandLabel }: AdminSidebarProps<T>) {
  const { theme, mode, toggleMode } = useWebTheme();
  const styles = useMemo(() => createStyles(theme, mode), [theme, mode]);

  return (
    <View style={styles.sidebar}>
      <View style={styles.brandRow}>
        <Logo theme={theme} size="sm" />
        <Text style={styles.brandText}>{brandLabel}</Text>
      </View>

      {items.map((item) => {
        const isActive = active === item.key;
        return (
          <Pressable
            key={item.key}
            onPress={() => onChange(item.key)}
            style={({ pressed }) => [styles.navItem, isActive && styles.navItemActive, pressed && styles.navItemPressed]}
            accessibilityRole="button"
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={20}
              color={isActive ? theme.colors.primary : theme.colors.textMuted}
            />
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{item.label}</Text>
            {item.flyout && (
              <MaterialCommunityIcons
                name="chevron-right"
                size={16}
                color={isActive ? theme.colors.primary : theme.colors.textMuted}
                style={styles.flyoutChevron}
              />
            )}
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

function createStyles(theme: WebTheme, mode: WebThemeMode) {
  return StyleSheet.create({
    sidebar: {
      width: 240,
      backgroundColor: mode === 'dark' ? 'rgba(24,29,48,0.55)' : 'rgba(255,255,255,0.55)',
      borderRightWidth: 1,
      borderRightColor: 'rgba(255,255,255,0.12)',
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.sm,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    } as any,
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
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
      transition: 'background-color 150ms ease, transform 100ms ease',
      cursor: 'pointer',
    } as any,
    navItemActive: {
      backgroundColor: theme.colors.primaryLight,
    },
    navItemPressed: {
      opacity: 0.7,
      transform: [{ scale: 0.98 }],
    },
    navLabel: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      flex: 1,
    },
    navLabelActive: {
      color: theme.colors.primary,
      fontWeight: '700',
    },
    flyoutChevron: {
      marginLeft: -4,
    },
    spacer: {
      flex: 1,
      minHeight: theme.spacing.lg,
    },
  });
}
