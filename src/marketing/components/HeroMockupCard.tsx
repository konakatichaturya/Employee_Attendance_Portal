import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { SharedTheme } from '../../theme';
import type { HeroVariant } from '../content';
import { vivid } from '../vividPalette';

// Free, no-attribution stock clips (Mixkit Stock Video Free License) — see
// public/videos/NOTICE.md for source/license details per file. Served as
// static files from Expo web's `public/` folder, so this is a plain web
// <video> element (no expo-av/native video support needed, and this whole
// marketing module only renders on desktop web anyway).
const VIDEO_SRC: Record<HeroVariant, string> = {
  attendance: '/videos/hero-attendance.mp4',
  leave: '/videos/hero-leave.mp4',
  calendar: '/videos/hero-calendar.mp4',
};

const CAPTION: Record<
  HeroVariant,
  { icon: keyof typeof MaterialCommunityIcons.glyphMap; title: string; subtitle: string; color: string }
> = {
  attendance: {
    icon: 'login',
    title: 'Checked in, verified.',
    subtitle: 'Location-confirmed attendance, one tap.',
    color: vivid.blue,
  },
  leave: {
    icon: 'check-circle',
    title: 'Approved in seconds.',
    subtitle: 'Leave requests, decided without the back-and-forth.',
    color: vivid.orange,
  },
  calendar: {
    icon: 'calendar-star',
    title: 'Nothing missed.',
    subtitle: 'Holidays and meetings, always visible.',
    color: vivid.green,
  },
};

interface HeroMockupCardProps {
  theme: SharedTheme;
  variant: HeroVariant;
}

export function HeroMockupCard({ theme, variant }: HeroMockupCardProps) {
  const styles = useMemo(() => createStyles(theme), [theme]);
  const caption = CAPTION[variant];
  const accentColor = caption.color;

  return (
    // Keyed by variant so the <video> element fully remounts on slide change —
    // swapping `src` alone doesn't reliably restart playback in every browser.
    <View style={{ ...styles.wrapper, borderColor: accentColor }} key={variant}>
      {React.createElement('video', {
        src: VIDEO_SRC[variant],
        autoPlay: true,
        muted: true,
        loop: true,
        playsInline: true,
        style: videoStyle,
      })}

      <View style={styles.scrim} />
      <View style={[styles.accentStripe, { backgroundColor: accentColor }]} />

      <View style={styles.captionBar}>
        <View style={[styles.captionIcon, { backgroundColor: accentColor }]}>
          <MaterialCommunityIcons name={caption.icon} size={20} color="#FFFFFF" />
        </View>
        <View style={styles.captionText}>
          <Text style={styles.captionTitle}>{caption.title}</Text>
          <Text style={styles.captionSubtitle}>{caption.subtitle}</Text>
        </View>
        <View style={styles.nextBadge}>
          <MaterialCommunityIcons name="arrow-right" size={18} color="#FFFFFF" />
        </View>
      </View>
    </View>
  );
}

const videoStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

function createStyles(theme: SharedTheme) {
  return StyleSheet.create({
    wrapper: {
      width: '100%',
      aspectRatio: 1.35,
      borderRadius: theme.radius.xl,
      overflow: 'hidden',
      backgroundColor: theme.colors.primaryDark,
      borderWidth: 3,
      ...theme.elevation.lg,
    },
    scrim: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(10, 14, 30, 0.12)',
    },
    accentStripe: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 5,
    },
    captionBar: {
      position: 'absolute',
      left: 14,
      right: 14,
      bottom: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: 'rgba(10, 14, 30, 0.6)',
      borderRadius: theme.radius.lg,
      padding: 14,
    },
    captionIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(255,255,255,0.18)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    captionText: {
      flex: 1,
    },
    nextBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(255,255,255,0.22)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    captionTitle: {
      ...theme.typography.bodyMedium,
      color: '#FFFFFF',
    },
    captionSubtitle: {
      ...theme.typography.caption,
      color: 'rgba(255,255,255,0.85)',
      marginTop: 2,
    },
  });
}
