import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useWebTheme, type WebTheme } from '../admin/ThemeContext';
import { AppButton } from '../components/AppButton';
import { MarketingNav } from './components/MarketingNav';
import { HeroCarousel } from './components/HeroCarousel';
import { MarketingFooter } from './components/MarketingFooter';
import { FeatureCard } from './components/FeatureCard';
import { RoboGuide } from './components/RoboGuide';
import { ANNOUNCEMENT, FEATURES } from './content';
import { vivid, VIVID_FEATURE_COLORS } from './vividPalette';

function featureColor(index: number): string {
  return VIVID_FEATURE_COLORS[index % VIVID_FEATURE_COLORS.length];
}

interface LandingPageProps {
  onLogin: () => void;
  onGetStarted: () => void;
}

export function LandingPage({ onLogin, onGetStarted }: LandingPageProps) {
  const { theme, mode, toggleMode } = useWebTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.root}>
      <MarketingNav theme={theme} mode={mode} onToggleMode={toggleMode} onLogin={onLogin} onGetStarted={onGetStarted} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.announcement}>
          <MaterialCommunityIcons name="bullhorn-outline" size={14} color="#FFFFFF" />
          <Text style={styles.announcementText}>{ANNOUNCEMENT}</Text>
        </View>

        <View style={styles.heroWrapper}>
          <View style={[styles.blob, styles.blobPrimary]} />
          <View style={[styles.blob, styles.blobAccent]} />
          <View style={[styles.blob, styles.blobSuccess]} />
          <View style={[styles.blob, styles.blobPurple]} />
          <HeroCarousel theme={theme} onCta={onGetStarted} />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>FEATURES</Text>
          </View>
          <Text style={styles.sectionHeading}>Everything your team needs, in one place</Text>
          <View style={styles.featureGrid}>
            {FEATURES.map((f, index) => (
              <FeatureCard key={f.label} theme={theme} feature={f} color={featureColor(index)} />
            ))}
          </View>
        </View>

        <View style={styles.ctaBanner}>
          <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
            <Defs>
              <LinearGradient id="ctaGradient" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={vivid.blue} />
                <Stop offset="0.55" stopColor={vivid.purple} />
                <Stop offset="1" stopColor={vivid.pink} />
              </LinearGradient>
            </Defs>
            <Rect x={0} y={0} width="100%" height="100%" fill="url(#ctaGradient)" />
          </Svg>
          <Text style={styles.ctaHeading}>Ready to get started?</Text>
          <Text style={styles.ctaSubheading}>Sign in or create your account in under a minute.</Text>
          <AppButton
            label="Get Started"
            onPress={onGetStarted}
            variant="outline"
            size="lg"
            fullWidth={false}
            style={{ backgroundColor: '#FFFFFF', borderColor: 'transparent' }}
          />
        </View>

        <MarketingFooter theme={theme} />
      </ScrollView>

      <RoboGuide theme={theme} />
    </View>
  );
}

function createStyles(theme: WebTheme) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      flexGrow: 1,
    },
    announcement: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: vivid.blue,
      paddingVertical: 8,
    },
    announcementText: {
      ...theme.typography.captionMedium,
      color: '#FFFFFF',
    },
    heroWrapper: {
      overflow: 'hidden',
    },
    blob: {
      position: 'absolute',
      borderRadius: 999,
    },
    blobPrimary: {
      width: 380,
      height: 380,
      top: -100,
      left: -120,
      backgroundColor: vivid.blue,
      opacity: 0.28,
    },
    blobAccent: {
      width: 300,
      height: 300,
      top: 30,
      right: -100,
      backgroundColor: vivid.orange,
      opacity: 0.24,
    },
    blobSuccess: {
      width: 260,
      height: 260,
      bottom: -80,
      left: '30%',
      backgroundColor: vivid.green,
      opacity: 0.22,
    },
    blobPurple: {
      width: 240,
      height: 240,
      bottom: 60,
      right: '15%',
      backgroundColor: vivid.purple,
      opacity: 0.2,
    },
    section: {
      paddingHorizontal: theme.spacing.xxl,
      paddingVertical: theme.spacing.xxl,
    },
    sectionBadge: {
      alignSelf: 'center',
      backgroundColor: vivid.blue,
      borderRadius: theme.radius.pill,
      paddingVertical: 4,
      paddingHorizontal: 12,
      marginBottom: theme.spacing.sm,
    },
    sectionBadgeText: {
      ...theme.typography.overline,
      color: '#FFFFFF',
    },
    sectionHeading: {
      ...theme.typography.h1,
      fontSize: 28,
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
    },
    featureGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
      justifyContent: 'center',
    },
    ctaBanner: {
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      marginHorizontal: theme.spacing.xxl,
      borderRadius: theme.radius.xl,
      paddingVertical: theme.spacing.xxl,
      paddingHorizontal: theme.spacing.lg,
      overflow: 'hidden',
      position: 'relative',
    },
    ctaHeading: {
      ...theme.typography.h2,
      color: theme.colors.textInverse,
      marginBottom: 4,
    },
    ctaSubheading: {
      ...theme.typography.body,
      color: 'rgba(255,255,255,0.85)',
      marginBottom: theme.spacing.lg,
    },
  });
}
