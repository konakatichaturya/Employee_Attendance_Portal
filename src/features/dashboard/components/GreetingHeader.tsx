import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, type Theme } from '../../../theme/ThemeContext';

interface GreetingHeaderProps {
  name: string | undefined;
  avatarUri: string | null | undefined;
  subtitle: string;
  onAvatarPress: () => void;
  onLogout: () => void;
}

function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function GreetingHeader({ name, avatarUri, subtitle, onAvatarPress, onLogout }: GreetingHeaderProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const firstName = name?.split(' ')[0] ?? '';

  return (
    <View style={styles.row}>
      <View style={styles.textBlock}>
        <Text style={styles.greeting}>
          {getTimeOfDayGreeting()}, {'\u{1F44B}'}
          {'\n'}
          {firstName}.
        </Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View style={styles.actions}>
        <View style={styles.avatarWrapper} onTouchEnd={onAvatarPress}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <MaterialCommunityIcons name="account" size={26} color={theme.colors.primary} />
            </View>
          )}
        </View>
        <MaterialCommunityIcons
          name="logout"
          size={20}
          color={theme.colors.textMuted}
          onPress={onLogout}
          suppressHighlighting
          style={styles.logoutIcon}
        />
      </View>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  textBlock: {
    flex: 1,
    paddingRight: theme.spacing.sm,
  },
  greeting: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  actions: {
    alignItems: 'center',
    gap: 8,
  },
  avatarWrapper: {
    width: 48,
    height: 48,
  },
  logoutIcon: {
    padding: 2,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  });
}
