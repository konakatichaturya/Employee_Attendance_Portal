import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DrawerContentScrollView, type DrawerContentComponentProps } from '@react-navigation/drawer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, type Theme } from '../theme/ThemeContext';
import { useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { ConfirmModal } from '../components/ConfirmModal';
import { Logo } from '../components/Logo';

interface AppDrawerContentProps extends DrawerContentComponentProps {
  brandLabel?: string;
  icons: Record<string, keyof typeof MaterialCommunityIcons.glyphMap>;
}

// Native equivalent of the web admin dashboard's AdminSidebar (src/admin/components/AdminSidebar.tsx):
// same brand header, nav-item, active-state, and light/dark toggle pattern, adapted as
// react-navigation drawer content instead of a fixed desktop-width rail. Also hosts Log Out,
// since the drawer (not any single screen) is now the one place reachable from anywhere.
export function AppDrawerContent({
  state,
  navigation,
  descriptors,
  brandLabel = 'WorkTrack',
  icons,
}: AppDrawerContentProps) {
  const { theme, mode, toggleMode } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useAppDispatch();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const confirmLogout = async () => {
    setLoggingOut(true);
    await dispatch(logout());
    setLoggingOut(false);
    setLogoutModalVisible(false);
  };

  return (
    <DrawerContentScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      <View style={styles.brandRow}>
        <Logo theme={theme} size="sm" />
        <Text style={styles.brandText}>{brandLabel}</Text>
      </View>

      {state.routes.map((route, index) => {
        const isActive = state.index === index;
        const label = descriptors[route.key]?.options.title ?? route.name;
        const icon = icons[route.name] ?? 'circle-outline';
        return (
          <Pressable
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={[styles.navItem, isActive && styles.navItemActive]}
            accessibilityRole="button"
          >
            <MaterialCommunityIcons name={icon} size={20} color={isActive ? theme.colors.primary : theme.colors.textMuted} />
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{label}</Text>
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

      <Pressable onPress={() => setLogoutModalVisible(true)} style={styles.navItem} accessibilityRole="button">
        <MaterialCommunityIcons name="logout" size={20} color={theme.colors.danger} />
        <Text style={[styles.navLabel, styles.logoutLabel]}>Log Out</Text>
      </Pressable>

      <ConfirmModal
        visible={logoutModalVisible}
        title="Log out"
        message="Are you sure you want to log out of WorkTrack?"
        confirmLabel="Log Out"
        destructive
        loading={loggingOut}
        onConfirm={confirmLogout}
        onCancel={() => setLogoutModalVisible(false)}
      />
    </DrawerContentScrollView>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    scrollView: {
      backgroundColor: theme.colors.surface,
    },
    container: {
      flexGrow: 1,
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
    logoutLabel: {
      color: theme.colors.danger,
    },
    spacer: {
      flex: 1,
      minHeight: theme.spacing.lg,
    },
  });
}
