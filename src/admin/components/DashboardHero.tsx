import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import type { WebTheme } from '../ThemeContext';
import { vivid } from '../../marketing/vividPalette';

interface DashboardHeroProps {
  theme: WebTheme;
  title: string;
  subtitle: string;
  videoSrc: string;
  right?: React.ReactNode;
  compact?: boolean;
  /** Dials back the scrim/gradient so the footage itself reads more clearly instead of being tinted over. */
  highlight?: boolean;
}

const videoStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

// A compact video-backed hero banner used at the top of dashboard pages —
// real footage + a vivid gradient scrim behind a frosted-glass title panel,
// matching the treatment already used on the marketing/auth pages.
export function DashboardHero({ theme, title, subtitle, videoSrc, right, compact, highlight }: DashboardHeroProps) {
  const styles = React.useMemo(() => createStyles(theme, compact, highlight), [theme, compact, highlight]);

  return (
    <View style={styles.hero}>
      {React.createElement('video', {
        src: videoSrc,
        autoPlay: true,
        muted: true,
        loop: true,
        playsInline: true,
        style: videoStyle,
      })}

      <View style={styles.scrim} />
      <Svg style={StyleSheet.absoluteFill as any} width="100%" height="100%">
        <Defs>
          <LinearGradient id="heroGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={vivid.blue} stopOpacity={highlight ? 0.22 : 0.5} />
            <Stop offset="1" stopColor={vivid.purple} stopOpacity={highlight ? 0.18 : 0.45} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill="url(#heroGrad)" />
      </Svg>

      <View style={styles.content}>
        <View style={styles.glassPanel}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        {right}
      </View>
    </View>
  );
}

function createStyles(theme: WebTheme, compact?: boolean, highlight?: boolean) {
  return StyleSheet.create({
    hero: {
      width: '100%',
      minHeight: compact ? 96 : 136,
      borderRadius: theme.radius.xl,
      overflow: 'hidden',
      marginBottom: theme.spacing.lg,
      justifyContent: 'center',
      ...theme.elevation.md,
    },
    scrim: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: highlight ? 'rgba(7,11,26,0.12)' : 'rgba(7,11,26,0.34)',
    },
    content: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: compact ? theme.spacing.md : theme.spacing.lg,
    },
    glassPanel: {
      backgroundColor: highlight ? 'rgba(10,16,32,0.28)' : 'rgba(255,255,255,0.16)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.35)',
      borderRadius: theme.radius.lg,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
    } as any,
    title: {
      ...(compact ? theme.typography.h2 : theme.typography.h1),
      color: '#FFFFFF',
      textShadow: '0 1px 6px rgba(0,0,0,0.35)',
    } as any,
    subtitle: {
      ...theme.typography.body,
      color: 'rgba(255,255,255,0.88)',
      marginTop: 2,
      textShadow: '0 1px 4px rgba(0,0,0,0.3)',
    } as any,
  });
}
