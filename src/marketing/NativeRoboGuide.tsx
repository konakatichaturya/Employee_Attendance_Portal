import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Theme } from '../theme/ThemeContext';
import { vivid } from './vividPalette';

const MESSAGE = "Hi, I'm here to help! 👋 WorkTrack makes attendance & leave effortless.";
const PUCK_SIZE = 84;
const SHELL = '#F2F4F7';
const SHELL_SHADE = '#D7DCE3';
const TEAL = '#2FD5C8';
const TEAL_DARK = '#1CA79C';
const VISOR = '#151B2C';
const EYE_GLOW = '#5FE3FF';
const BUBBLE_TEXT = '#16305C';
const BUBBLE_CLOSE_BG = '#EEF1F5';
const BUBBLE_CLOSE_ICON = '#5B6472';

// Native counterpart to the web marketing page's RoboGuide mascot — same
// bot design (SVG puck + reanimated breathing/glow) and same dismissible
// greeting bubble, docked bottom-right over the landing page's ScrollView.
export function NativeRoboGuide({ theme }: { theme: Theme }) {
  const insets = useSafeAreaInsets();
  const styles = React.useMemo(() => createStyles(theme, insets.bottom), [theme, insets.bottom]);
  const [dismissed, setDismissed] = useState(false);

  const breathe = useSharedValue(0);
  const glow = useSharedValue(0.5);
  const bubble = useSharedValue(0);

  useEffect(() => {
    breathe.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
    glow.value = withRepeat(withSequence(withTiming(1, { duration: 900 }), withTiming(0.5, { duration: 900 })), -1, true);
    bubble.value = withDelay(600, withSpring(1, { damping: 13, stiffness: 140 }));
  }, []);

  const openBubble = () => {
    setDismissed(false);
    bubble.value = withSpring(1, { damping: 13, stiffness: 140 });
  };
  const closeBubble = () => {
    bubble.value = withTiming(0, { duration: 150 });
    setDismissed(true);
  };

  const botStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -breathe.value * 3 }, { scale: 1 + breathe.value * 0.02 }],
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: 0.6 + glow.value * 0.4 }));
  const bubbleStyle = useAnimatedStyle(() => ({
    opacity: bubble.value,
    transform: [{ scale: 0.85 + bubble.value * 0.15 }, { translateY: (1 - bubble.value) * 10 }],
  }));

  return (
    <View style={styles.dock} pointerEvents="box-none">
      {!dismissed && (
        <Animated.View style={[styles.bubble, bubbleStyle]} pointerEvents={dismissed ? 'none' : 'auto'}>
          <Pressable onPress={closeBubble} style={styles.bubbleClose} accessibilityRole="button" accessibilityLabel="Dismiss">
            <MaterialCommunityIcons name="close" size={12} color={BUBBLE_CLOSE_ICON} />
          </Pressable>
          <Text style={styles.bubbleText}>{MESSAGE}</Text>
        </Animated.View>
      )}

      <Pressable onPress={dismissed ? openBubble : undefined} accessibilityRole="button" accessibilityLabel="WorkTrack assistant">
        <View style={styles.puck}>
          <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
            <Defs>
              <LinearGradient id="nativeBotPuck" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={vivid.blue} />
                <Stop offset="1" stopColor={vivid.purple} />
              </LinearGradient>
            </Defs>
            <Circle cx={PUCK_SIZE / 2} cy={PUCK_SIZE / 2} r={PUCK_SIZE / 2} fill="url(#nativeBotPuck)" />
          </Svg>

          <Animated.View style={[styles.bot, botStyle]}>
            <View style={[styles.ear, styles.earLeft]} />
            <View style={[styles.ear, styles.earRight]} />

            <View style={styles.head}>
              <View style={styles.visor}>
                <Animated.View style={[styles.eye, glowStyle]} />
                <Animated.View style={[styles.eye, glowStyle]} />
              </View>
            </View>

            <View style={styles.body}>
              <View style={styles.shield} />
            </View>
          </Animated.View>
        </View>
      </Pressable>
    </View>
  );
}

function createStyles(theme: Theme, bottomInset: number) {
  return StyleSheet.create({
    dock: {
      position: 'absolute',
      bottom: 20 + bottomInset,
      right: 18,
      alignItems: 'flex-end',
    },
    puck: {
      width: PUCK_SIZE,
      height: PUCK_SIZE,
      borderRadius: PUCK_SIZE / 2,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.elevation.lg,
    },
    bot: {
      width: 64,
      alignItems: 'center',
    },
    ear: {
      position: 'absolute',
      top: 4,
      width: 9,
      height: 16,
      borderRadius: 4,
      backgroundColor: TEAL,
      borderWidth: 1.5,
      borderColor: TEAL_DARK,
    },
    earLeft: {
      left: -1,
      transform: [{ rotate: '-18deg' }],
    },
    earRight: {
      right: -1,
      transform: [{ rotate: '18deg' }],
    },
    head: {
      width: 58,
      height: 44,
      borderRadius: 26,
      backgroundColor: SHELL,
      borderWidth: 2.5,
      borderColor: SHELL_SHADE,
      alignItems: 'center',
      justifyContent: 'center',
    },
    visor: {
      width: 40,
      height: 26,
      borderRadius: 13,
      backgroundColor: VISOR,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
    },
    eye: {
      width: 10,
      height: 6,
      borderTopLeftRadius: 6,
      borderTopRightRadius: 6,
      backgroundColor: EYE_GLOW,
    },
    body: {
      width: 52,
      height: 34,
      borderRadius: 22,
      backgroundColor: SHELL,
      borderWidth: 2.5,
      borderColor: SHELL_SHADE,
      marginTop: -4,
      alignItems: 'center',
      justifyContent: 'center',
    },
    shield: {
      width: 16,
      height: 13,
      borderTopLeftRadius: 3,
      borderTopRightRadius: 3,
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
      backgroundColor: TEAL,
    },
    bubble: {
      maxWidth: 210,
      backgroundColor: '#FFFFFF',
      borderRadius: theme.radius.lg,
      borderWidth: 1.5,
      borderColor: TEAL,
      padding: 12,
      paddingRight: 20,
      marginBottom: 8,
      ...theme.elevation.lg,
    },
    bubbleClose: {
      position: 'absolute',
      top: 5,
      right: 5,
      width: 16,
      height: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: BUBBLE_CLOSE_BG,
    },
    bubbleText: {
      ...theme.typography.caption,
      color: BUBBLE_TEXT,
      lineHeight: 16,
    },
  });
}
