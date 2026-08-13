import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { BlurView } from 'expo-blur';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import type { SharedTheme } from '../theme';
import { vivid } from '../marketing/vividPalette';

interface VideoHeroProps {
  theme: SharedTheme;
  title: string;
  subtitle: string;
  videoSrc: string;
  height?: number;
  right?: React.ReactNode;
}

// Native counterpart to the web dashboard's DashboardHero — real streamed
// video (expo-video) behind a frosted-glass (expo-blur) title panel, using
// the same vivid gradient scrim so the two surfaces read as one design
// language.
export function VideoHero({ theme, title, subtitle, videoSrc, height = 150, right }: VideoHeroProps) {
  const styles = useMemo(() => createStyles(theme, height), [theme, height]);
  const player = useVideoPlayer(videoSrc, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <View style={styles.wrapper}>
      <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />

      <View style={styles.scrim} />
      <Svg style={StyleSheet.absoluteFill as any} width="100%" height="100%">
        <Defs>
          <LinearGradient id="videoHeroGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={vivid.blue} stopOpacity={0.45} />
            <Stop offset="1" stopColor={vivid.purple} stopOpacity={0.4} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill="url(#videoHeroGrad)" />
      </Svg>

      <View style={styles.content}>
        <BlurView intensity={40} tint="dark" style={styles.glassPanel}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </BlurView>
        {right}
      </View>
    </View>
  );
}

function createStyles(theme: SharedTheme, height: number) {
  return StyleSheet.create({
    wrapper: {
      width: '100%',
      height,
      borderRadius: theme.radius.xl,
      overflow: 'hidden',
      justifyContent: 'flex-end',
    },
    scrim: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(7,11,26,0.28)',
    },
    content: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      padding: theme.spacing.md,
    },
    glassPanel: {
      borderRadius: theme.radius.lg,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.3)',
      alignSelf: 'flex-start',
    },
    title: {
      ...theme.typography.h3,
      color: '#FFFFFF',
    },
    subtitle: {
      ...theme.typography.caption,
      color: 'rgba(255,255,255,0.85)',
      marginTop: 2,
    },
  });
}
