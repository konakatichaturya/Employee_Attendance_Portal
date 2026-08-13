import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { Logo } from '../components/Logo';
import { AppButton } from '../components/AppButton';
import { VideoBackground } from '../components/VideoHero';
import { useTheme, type Theme } from '../theme/ThemeContext';
import { vivid, VIVID_FEATURE_COLORS } from './vividPalette';
import { ANNOUNCEMENT, FEATURES, HERO_SLIDES, SOCIAL_ICONS, type HeroVariant } from './content';
import { NATIVE_IMAGE, NATIVE_VIDEO } from '../constants/nativeMedia';
import { NativeRoboGuide } from './NativeRoboGuide';

const ROTATE_INTERVAL_MS = 5000;

const FEATURE_IMAGE: Record<string, string> = {
  'Attendance Tracking': NATIVE_IMAGE.attendance,
  'Leave Management': NATIVE_IMAGE.leave,
  'Company Calendar': NATIVE_IMAGE.calendar,
  'Team & Reporting Lines': NATIVE_IMAGE.team,
  'Location Verification': NATIVE_IMAGE.location,
  Approvals: NATIVE_IMAGE.approvals,
};

interface NativeLandingPageProps {
  onLogin: () => void;
  onGetStarted: () => void;
}

// Native counterpart to the desktop marketing LandingPage — same copy
// (src/marketing/content.ts), same vivid palette, real streamed video in the
// hero (expo-video) and real photos in the feature grid, adapted to a single
// scrollable phone-width column instead of a wide multi-column desktop layout.
export function NativeLandingPage({ onLogin, onGetStarted }: NativeLandingPageProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setIndex((i) => (i + 1) % HERO_SLIDES.length), ROTATE_INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const jumpTo = (next: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIndex(next);
    timerRef.current = setInterval(() => setIndex((i) => (i + 1) % HERO_SLIDES.length), ROTATE_INTERVAL_MS);
  };

  const slide = HERO_SLIDES[index];

  return (
    <View style={styles.root}>
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.navRow}>
        <Logo theme={theme} size="sm" />
        <Pressable onPress={onLogin} accessibilityRole="button" accessibilityLabel="Log in">
          <Text style={styles.navLoginText}>Log In</Text>
        </Pressable>
      </View>

      <View style={styles.announcement}>
        <MaterialCommunityIcons name="bell-ring-outline" size={14} color={vivid.blue} />
        <Text style={styles.announcementText} numberOfLines={1}>
          {ANNOUNCEMENT}
        </Text>
      </View>

      <HeroSlideCard key={slide.variant} variant={slide.variant} />

      <Text style={styles.headline}>{slide.headline}</Text>
      <Text style={styles.subheadline}>{slide.subheadline}</Text>
      <AppButton
        label={slide.ctaLabel}
        onPress={onGetStarted}
        size="lg"
        fullWidth={false}
        style={{ backgroundColor: vivid.blue, alignSelf: 'flex-start', borderRadius: theme.radius.pill, paddingHorizontal: theme.spacing.lg }}
      />

      <View style={styles.dotsRow}>
        {HERO_SLIDES.map((s, i) => (
          <Pressable key={s.variant} onPress={() => jumpTo(i)} style={styles.dotHit} accessibilityRole="button">
            <View style={[styles.dot, i === index && styles.dotActive]} />
          </Pressable>
        ))}
      </View>

      <View style={styles.sectionSpacer} />
      <Text style={styles.sectionTitle}>Everything your team needs</Text>
      <View style={styles.featureGrid}>
        {FEATURES.map((f, i) => (
          <FeatureTile
            key={f.label}
            label={f.label}
            icon={f.icon}
            imageUri={FEATURE_IMAGE[f.label]}
            color={VIVID_FEATURE_COLORS[i % VIVID_FEATURE_COLORS.length]}
          />
        ))}
      </View>

      <View style={styles.sectionSpacer} />
      <View style={styles.ctaBanner}>
        <Svg style={StyleSheet.absoluteFill as any} width="100%" height="100%">
          <Defs>
            <LinearGradient id="ctaGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={vivid.blue} />
              <Stop offset="1" stopColor={vivid.purple} />
            </LinearGradient>
          </Defs>
          <Rect x={0} y={0} width="100%" height="100%" fill="url(#ctaGrad)" />
        </Svg>
        <Text style={styles.ctaTitle}>Ready to simplify attendance & leave?</Text>
        <Pressable onPress={onGetStarted} style={styles.ctaButton} accessibilityRole="button">
          <Text style={styles.ctaButtonText}>Get Started</Text>
        </Pressable>
      </View>

      <View style={styles.sectionSpacer} />
      <View style={styles.footer}>
        <Logo theme={theme} size="sm" tone="inverse" />
        <Text style={styles.footerTagline}>Attendance & leave, simplified.</Text>
        <View style={styles.socialRow}>
          {SOCIAL_ICONS.map((icon) => (
            <View key={icon} style={styles.socialIcon}>
              <MaterialCommunityIcons name={icon} size={16} color="#FFFFFF" />
            </View>
          ))}
        </View>
        <Text style={styles.footerCopyright}>© {new Date().getFullYear()} WorkTrack. All rights reserved.</Text>
      </View>
    </ScrollView>
    <NativeRoboGuide theme={theme} />
    </View>
  );
}

function HeroSlideCard({ variant }: { variant: HeroVariant }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.heroCard}>
      <VideoBackground src={NATIVE_VIDEO[variant]} />
      <View style={styles.heroScrim} />
    </View>
  );
}

function FeatureTile({
  label,
  icon,
  imageUri,
  color,
}: {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  imageUri: string;
  color: string;
}) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.featureTile}>
      <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} />
      <View style={[styles.featureScrim, { backgroundColor: `${color}66` }]} />
      <View style={styles.featureIconBadge}>
        <MaterialCommunityIcons name={icon} size={18} color="#FFFFFF" />
      </View>
      <Text style={styles.featureLabel}>{label}</Text>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scroll: {
      flex: 1,
    },
    content: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.xxl,
    },
    navRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
    },
    navLoginText: {
      ...theme.typography.bodyMedium,
      color: vivid.blue,
    },
    announcement: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: theme.colors.primaryLight,
      borderRadius: theme.radius.pill,
      paddingVertical: 6,
      paddingHorizontal: 12,
      marginBottom: theme.spacing.md,
    },
    announcementText: {
      ...theme.typography.caption,
      color: theme.colors.primaryDark,
      flexShrink: 1,
    },
    heroCard: {
      width: '100%',
      aspectRatio: 1.35,
      borderRadius: theme.radius.xl,
      overflow: 'hidden',
      backgroundColor: theme.colors.primaryDark,
      marginBottom: theme.spacing.md,
      ...theme.elevation.lg,
    },
    heroScrim: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(10,14,30,0.18)',
    },
    headline: {
      fontSize: 30,
      lineHeight: 36,
      fontWeight: '800',
      fontFamily: 'Fredoka_700Bold',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm,
    },
    subheadline: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
    },
    dotsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: theme.spacing.md,
    },
    dotHit: {
      padding: 6,
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
    sectionSpacer: {
      height: theme.spacing.xl,
    },
    sectionTitle: {
      ...theme.typography.h2,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.md,
    },
    featureGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    featureTile: {
      width: '48%',
      aspectRatio: 1.1,
      borderRadius: theme.radius.lg,
      overflow: 'hidden',
      backgroundColor: theme.colors.surfaceAlt,
      padding: theme.spacing.sm,
      justifyContent: 'flex-end',
    },
    featureScrim: {
      ...StyleSheet.absoluteFillObject,
    },
    featureIconBadge: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: 'rgba(255,255,255,0.25)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    featureLabel: {
      ...theme.typography.captionMedium,
      color: '#FFFFFF',
    },
    ctaBanner: {
      borderRadius: theme.radius.xl,
      overflow: 'hidden',
      padding: theme.spacing.lg,
    },
    ctaTitle: {
      ...theme.typography.h3,
      color: '#FFFFFF',
    },
    ctaButton: {
      marginTop: 14,
      alignSelf: 'flex-start',
      backgroundColor: '#FFFFFF',
      paddingVertical: 14,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.radius.pill,
      ...theme.elevation.md,
    },
    ctaButtonText: {
      ...theme.typography.bodyMedium,
      fontSize: 16,
      fontWeight: '700',
      color: vivid.blue,
    },
    footer: {
      alignItems: 'center',
      backgroundColor: vivid.navy,
      borderRadius: theme.radius.xl,
      padding: theme.spacing.lg,
      gap: 8,
    },
    footerTagline: {
      ...theme.typography.caption,
      color: 'rgba(255,255,255,0.75)',
    },
    socialRow: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 4,
    },
    socialIcon: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: 'rgba(255,255,255,0.12)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    footerCopyright: {
      ...theme.typography.caption,
      color: 'rgba(255,255,255,0.5)',
      marginTop: 8,
    },
  });
}
