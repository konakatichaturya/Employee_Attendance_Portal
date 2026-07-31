import React, { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useTheme, type Theme } from '../theme/ThemeContext';

interface WebAppFrameProps {
  children: React.ReactNode;
}

/**
 * On web, RN screens otherwise stretch edge-to-edge across a desktop browser
 * window, which makes phone-oriented layouts look sparse. Constrain to a
 * phone-width frame there; native platforms render children untouched.
 */
export function WebAppFrame({ children }: WebAppFrameProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View style={styles.backdrop}>
      <View style={[styles.frame, theme.elevation.lg]}>{children}</View>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceAlt,
    },
    frame: {
      flex: 1,
      width: '100%',
      maxWidth: 460,
      backgroundColor: theme.colors.background,
      overflow: 'hidden',
    },
  });
}
