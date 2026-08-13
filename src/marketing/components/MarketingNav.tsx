import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import type { WebTheme } from '../../admin/ThemeContext';
import { Logo } from '../../components/Logo';
import { AppButton } from '../../components/AppButton';
import { NAV_LINKS } from '../content';
import { vivid } from '../vividPalette';

interface MarketingNavProps {
  theme: WebTheme;
  mode: 'light' | 'dark';
  onToggleMode: () => void;
  onLogin: () => void;
  onGetStarted: () => void;
}

export function MarketingNav({ theme, mode, onToggleMode, onLogin, onGetStarted }: MarketingNavProps) {
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View>
      <View style={styles.bar}>
        <View style={styles.brandRow}>
          <Logo theme={theme} size="sm" showLabel />
        </View>

        <View style={styles.linkRow}>
          {NAV_LINKS.map((label) => (
            <Text key={label} style={styles.link}>
              {label}
            </Text>
          ))}
        </View>

        <View style={styles.actions}>
          <Pressable onPress={onToggleMode} accessibilityRole="button" accessibilityLabel="Toggle theme" style={styles.iconButton}>
            <MaterialCommunityIcons name={mode === 'dark' ? 'weather-sunny' : 'weather-night'} size={20} color={theme.colors.textMuted} />
          </Pressable>
          <AppButton label="Log In" variant="outline" onPress={onLogin} fullWidth={false} style={styles.navButton} />
          <AppButton
            label="Get Started"
            onPress={onGetStarted}
            fullWidth={false}
            style={{ ...styles.navButton, backgroundColor: vivid.blue }}
          />
        </View>
      </View>

      <Svg width="100%" height={3}>
        <Defs>
          <LinearGradient id="navAccent" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={vivid.blue} />
            <Stop offset="0.5" stopColor={vivid.purple} />
            <Stop offset="1" stopColor={vivid.pink} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width="100%" height={3} fill="url(#navAccent)" />
      </Svg>
    </View>
  );
}

function createStyles(theme: WebTheme) {
  return StyleSheet.create({
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    linkRow: {
      flexDirection: 'row',
      gap: theme.spacing.lg,
    },
    link: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    iconButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceAlt,
    },
    navButton: {
      paddingHorizontal: theme.spacing.md,
    },
  });
}
