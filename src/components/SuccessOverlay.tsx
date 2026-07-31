import React, { useEffect, useMemo } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, type Theme } from '../theme/ThemeContext';

interface SuccessOverlayProps {
  visible: boolean;
  title: string;
  message?: string;
  onDone: () => void;
  autoDismissMs?: number;
}

export function SuccessOverlay({ visible, title, message, onDone, autoDismissMs = 1400 }: SuccessOverlayProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;
    scale.value = 0.5;
    opacity.value = 0;
    opacity.value = withTiming(1, { duration: 180 });
    scale.value = withSequence(withSpring(1.08, { damping: 8, stiffness: 180 }), withSpring(1, { damping: 10 }));

    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 200 }, (finished) => {
        if (finished) runOnJSDone();
      });
    }, autoDismissMs);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  function runOnJSDone() {
    onDone();
  }

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, animatedStyle]}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="check-bold" size={40} color={theme.colors.textInverse} />
          </View>
          <Text style={styles.title}>{title}</Text>
          {!!message && <Text style={styles.message}>{message}</Text>}
        </Animated.View>
      </View>
    </Modal>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(20, 22, 27, 0.5)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.lg,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      paddingVertical: theme.spacing.xl,
      paddingHorizontal: theme.spacing.xl,
      alignItems: 'center',
      minWidth: 240,
      ...theme.elevation.lg,
    },
    iconCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: theme.colors.success,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
    },
    title: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
      textAlign: 'center',
    },
    message: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      marginTop: 4,
      textAlign: 'center',
    },
  });
}
