import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useWebTheme, type WebTheme, type WebThemeMode } from '../ThemeContext';
import { CalendarSection } from './CalendarSection';

const DRAWER_WIDTH = 480;

interface CalendarDrawerProps {
  open: boolean;
  onClose: () => void;
  manageable?: boolean;
}

// Calendar isn't a normal page tab — it's a compact panel that stays hidden
// off the left edge and slides open on top of whatever page is behind it, so
// switching to the calendar never loses your place on the page you were on.
export function CalendarDrawer({ open, onClose, manageable }: CalendarDrawerProps) {
  const { theme, mode } = useWebTheme();
  const styles = React.useMemo(() => createStyles(theme, mode), [theme, mode]);
  const progress = useSharedValue(0);
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) setMounted(true);
    progress.value = withTiming(open ? 1 : 0, { duration: 280, easing: Easing.out(Easing.cubic) });
  }, [open]);

  useEffect(() => {
    if (open) return;
    const t = setTimeout(() => setMounted(false), 300);
    return () => clearTimeout(t);
  }, [open]);

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (1 - progress.value) * -DRAWER_WIDTH }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.45,
  }));

  if (!mounted) return null;

  return (
    <View style={styles.root} pointerEvents={open ? 'auto' : 'none'}>
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close calendar panel"
        />
      </Animated.View>

      <Animated.View style={[styles.panel, panelStyle]}>
        <Pressable onPress={onClose} style={styles.closeTab} accessibilityRole="button" accessibilityLabel="Close calendar panel">
          <MaterialCommunityIcons name="chevron-left" size={20} color="#FFFFFF" />
        </Pressable>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
          <CalendarSection manageable={manageable} />
        </ScrollView>
      </Animated.View>
    </View>
  );
}

function createStyles(theme: WebTheme, mode: WebThemeMode) {
  return StyleSheet.create({
    root: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 55,
    } as any,
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: '#000000',
    },
    panel: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      width: DRAWER_WIDTH,
      maxWidth: '92%',
      backgroundColor: mode === 'dark' ? 'rgba(20,25,42,0.85)' : 'rgba(255,255,255,0.85)',
      borderRightWidth: 1,
      borderRightColor: 'rgba(255,255,255,0.18)',
      backdropFilter: 'blur(26px)',
      WebkitBackdropFilter: 'blur(26px)',
      ...theme.elevation.lg,
    } as any,
    scroll: {
      flex: 1,
    },
    closeTab: {
      position: 'absolute',
      top: '50%',
      right: -18,
      marginTop: -18,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1,
      ...theme.elevation.md,
    },
  });
}
