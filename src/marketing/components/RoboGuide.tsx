import React, { useEffect, useMemo, useState } from 'react';
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
import type { WebTheme } from '../../admin/ThemeContext';
import { vivid } from '../vividPalette';

interface RoboGuideProps {
  theme: WebTheme;
}

const MESSAGE = "Hi, I'm here to help! 👋 This is our page — WorkTrack makes attendance & leave effortless.";

const fixedStyle = { position: 'fixed', zIndex: 60 } as any;

// A static chat-widget mascot docked bottom-right (no walking — it just sits
// there like a normal chat bubble) with a gentle idle breathing/glow
// animation and a speech bubble introducing the product. Built entirely from
// RN views (no image asset needed).
export function RoboGuide({ theme }: RoboGuideProps) {
  const styles = useMemo(() => createStyles(theme), [theme]);
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
    bubble.value = withDelay(500, withSpring(1, { damping: 13, stiffness: 140 }));
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
    transform: [{ translateY: -breathe.value * 4 }, { scale: 1 + breathe.value * 0.02 }],
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: 0.6 + glow.value * 0.4 }));
  const shadowStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: 1 - breathe.value * 0.1 }], opacity: 0.16 + breathe.value * 0.05 }));
  const bubbleStyle = useAnimatedStyle(() => ({
    opacity: bubble.value,
    transform: [{ scale: 0.85 + bubble.value * 0.15 }, { translateY: (1 - bubble.value) * 10 }],
  }));

  return (
    <View style={[styles.dock, fixedStyle]} pointerEvents="box-none">
      {!dismissed && (
        <Animated.View style={[styles.bubble, bubbleStyle]} pointerEvents={dismissed ? 'none' : 'auto'}>
          <Pressable onPress={closeBubble} style={styles.bubbleClose} accessibilityRole="button" accessibilityLabel="Dismiss">
            <MaterialCommunityIcons name="close" size={12} color={BUBBLE_CLOSE_ICON} />
          </Pressable>
          <Text style={styles.bubbleText}>{MESSAGE}</Text>
        </Animated.View>
      )}

      <Pressable onPress={dismissed ? openBubble : undefined} accessibilityRole="button" accessibilityLabel="WorkTrack chat assistant">
        {/* A fixed, saturated gradient puck behind the bot — guarantees contrast
            against both a light and a dark page background, since the bot's own
            pale shell alone was blending into a light-mode page. */}
        <View style={styles.puck}>
          <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
            <Defs>
              <LinearGradient id="botPuck" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={vivid.blue} />
                <Stop offset="1" stopColor={vivid.purple} />
              </LinearGradient>
            </Defs>
            <Circle cx={PUCK_SIZE / 2} cy={PUCK_SIZE / 2} r={PUCK_SIZE / 2} fill="url(#botPuck)" />
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

            <View style={styles.armLeft} />
            <View style={styles.armRight} />
          </Animated.View>
        </View>
        <Animated.View style={[styles.shadow, shadowStyle]} />
      </Pressable>
    </View>
  );
}

const SHELL = '#F2F4F7';
const SHELL_SHADE = '#D7DCE3';
const TEAL = '#2FD5C8';
const TEAL_DARK = '#1CA79C';
const VISOR = '#151B2C';
const EYE_GLOW = '#5FE3FF';
const PUCK_SIZE = 108;
// The speech bubble is always a white card (by design, for contrast against
// any page background) — so its text/close-button colors are fixed dark
// tones too, not theme-driven ones that flip light in dark mode and vanish
// against the white bubble.
const BUBBLE_TEXT = '#16305C';
const BUBBLE_CLOSE_BG = '#EEF1F5';
const BUBBLE_CLOSE_ICON = '#5B6472';

function createStyles(theme: WebTheme) {
  return StyleSheet.create({
    dock: {
      bottom: 20,
      right: 24,
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
      width: 84,
      alignItems: 'center',
    },
    ear: {
      position: 'absolute',
      top: 6,
      width: 12,
      height: 22,
      borderRadius: 6,
      backgroundColor: TEAL,
      borderWidth: 2,
      borderColor: TEAL_DARK,
    },
    earLeft: {
      left: -2,
      transform: [{ rotate: '-18deg' }],
    },
    earRight: {
      right: -2,
      transform: [{ rotate: '18deg' }],
    },
    head: {
      width: 76,
      height: 58,
      borderRadius: 34,
      backgroundColor: SHELL,
      borderWidth: 3,
      borderColor: SHELL_SHADE,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.elevation.md,
    },
    visor: {
      width: 54,
      height: 34,
      borderRadius: 18,
      backgroundColor: VISOR,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    },
    eye: {
      width: 14,
      height: 8,
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      backgroundColor: EYE_GLOW,
    },
    body: {
      width: 68,
      height: 46,
      borderRadius: 30,
      backgroundColor: SHELL,
      borderWidth: 3,
      borderColor: SHELL_SHADE,
      marginTop: -6,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.elevation.sm,
    },
    shield: {
      width: 22,
      height: 18,
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4,
      borderBottomLeftRadius: 11,
      borderBottomRightRadius: 11,
      backgroundColor: TEAL,
    },
    armLeft: {
      position: 'absolute',
      bottom: 6,
      left: -4,
      width: 16,
      height: 22,
      borderRadius: 10,
      backgroundColor: SHELL,
      borderWidth: 2.5,
      borderColor: SHELL_SHADE,
      transform: [{ rotate: '20deg' }],
    },
    armRight: {
      position: 'absolute',
      bottom: 6,
      right: -4,
      width: 16,
      height: 22,
      borderRadius: 10,
      backgroundColor: SHELL,
      borderWidth: 2.5,
      borderColor: SHELL_SHADE,
      transform: [{ rotate: '-20deg' }],
    },
    shadow: {
      width: 54,
      height: 11,
      borderRadius: 8,
      backgroundColor: '#000000',
      marginTop: 4,
    },
    bubble: {
      maxWidth: 240,
      backgroundColor: '#FFFFFF',
      borderRadius: theme.radius.lg,
      borderWidth: 1.5,
      borderColor: TEAL,
      padding: 14,
      paddingRight: 22,
      marginBottom: 10,
      ...theme.elevation.lg,
    },
    bubbleClose: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 18,
      height: 18,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: BUBBLE_CLOSE_BG,
    },
    bubbleText: {
      ...theme.typography.caption,
      color: BUBBLE_TEXT,
      lineHeight: 17,
    },
  });
}
