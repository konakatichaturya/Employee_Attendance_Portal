import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { WebTheme } from '../../admin/ThemeContext';
import { AppButton } from '../../components/AppButton';
import { HeroMockupCard } from './HeroMockupCard';
import { HERO_SLIDES } from '../content';
import { vivid } from '../vividPalette';

const pointerStyle = { cursor: 'pointer' } as any;

const ROTATE_INTERVAL_MS = 5000;

interface HeroCarouselProps {
  theme: WebTheme;
  onCta: () => void;
}

export function HeroCarousel({ theme, onCta }: HeroCarouselProps) {
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, ROTATE_INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const jumpTo = (next: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIndex(next);
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, ROTATE_INTERVAL_MS);
  };

  const goNext = () => jumpTo((index + 1) % HERO_SLIDES.length);
  const goPrev = () => jumpTo((index - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  const slide = HERO_SLIDES[index];

  // Crossfades the headline/subheadline/mockup on every slide change (auto-rotate
  // or manual dot tap) so the transition reads as motion rather than a hard cut.
  const fade = useSharedValue(1);
  useEffect(() => {
    fade.value = 0;
    fade.value = withTiming(1, { duration: 350 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);
  const fadeStyle = useAnimatedStyle(() => ({ opacity: fade.value }));

  return (
    <View style={styles.root}>
      <View style={styles.textColumn}>
        <Pressable
          onPress={goNext}
          accessibilityRole="button"
          accessibilityLabel="Show next slide"
          style={pointerStyle}
        >
          <Animated.View style={fadeStyle}>
            <Text style={styles.headline}>{slide.headline}</Text>
            <Text style={styles.subheadline}>{slide.subheadline}</Text>
          </Animated.View>
        </Pressable>

        <AppButton
          label={slide.ctaLabel}
          onPress={onCta}
          size="md"
          fullWidth={false}
          style={{ ...styles.ctaButton, backgroundColor: vivid.blue }}
        />

        <View style={styles.controlsRow}>
          <Pressable
            onPress={goPrev}
            accessibilityRole="button"
            accessibilityLabel="Previous slide"
            style={[styles.navCircle, pointerStyle]}
          >
            <MaterialCommunityIcons name="chevron-left" size={20} color={theme.colors.textSecondary} />
          </Pressable>

          <View style={styles.dotRow}>
            {HERO_SLIDES.map((s, i) => (
              <Pressable
                key={s.variant}
                onPress={() => jumpTo(i)}
                style={[styles.dotHit, pointerStyle]}
                accessibilityRole="button"
                accessibilityLabel={`Show slide ${i + 1}`}
              >
                <View style={[styles.dot, i === index && styles.dotActive]} />
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={goNext}
            accessibilityRole="button"
            accessibilityLabel="Next slide"
            style={[styles.navCircle, pointerStyle]}
          >
            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      <Animated.View style={[styles.mockupColumn, fadeStyle]}>
        <Pressable
          onPress={goNext}
          accessibilityRole="button"
          accessibilityLabel="Show next slide"
          style={pointerStyle}
        >
          <HeroMockupCard theme={theme} variant={slide.variant} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

function createStyles(theme: WebTheme) {
  return StyleSheet.create({
    root: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxl,
      paddingHorizontal: theme.spacing.xxl,
      paddingVertical: theme.spacing.xxl,
      flexWrap: 'wrap',
    },
    textColumn: {
      flex: 1,
      minWidth: 320,
    },
    headline: {
      fontSize: 44,
      lineHeight: 50,
      fontWeight: '800',
      fontFamily: 'Fredoka_700Bold',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.md,
    },
    subheadline: {
      ...theme.typography.subtitle,
      fontWeight: '400',
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.lg,
      maxWidth: 460,
    },
    ctaButton: {
      alignSelf: 'flex-start',
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.radius.pill,
      marginBottom: theme.spacing.lg,
      ...theme.elevation.md,
    },
    controlsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    navCircle: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceAlt,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    dotRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    dotHit: {
      padding: 4,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.border,
    },
    dotActive: {
      backgroundColor: vivid.blue,
      width: 18,
    },
    mockupColumn: {
      flex: 1,
      minWidth: 320,
      maxWidth: 440,
    },
  });
}
