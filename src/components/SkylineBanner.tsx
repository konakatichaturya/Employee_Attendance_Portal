import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import type { SharedTheme } from '../theme';

interface SkylineBannerProps {
  theme: SharedTheme;
  height?: number;
}

// Decorative night-skyline illustration used behind dashboard hero headers —
// built once from react-native-svg primitives (already installed) rather than
// shipping an external image asset, and re-themed off the app's own palette.
export function SkylineBanner({ theme, height = 150 }: SkylineBannerProps) {
  const buildings = [
    { x: 0, w: 34, h: 60 },
    { x: 32, w: 26, h: 88 },
    { x: 56, w: 40, h: 52 },
    { x: 94, w: 30, h: 100 },
    { x: 122, w: 24, h: 68 },
    { x: 144, w: 46, h: 84 },
    { x: 188, w: 28, h: 56 },
    { x: 214, w: 36, h: 96 },
    { x: 248, w: 26, h: 64 },
    { x: 272, w: 42, h: 78 },
    { x: 312, w: 30, h: 54 },
    { x: 340, w: 34, h: 92 },
    { x: 372, w: 28, h: 62 },
  ];

  return (
    <View style={[styles.wrapper, { height, borderRadius: theme.radius.xl }]}>
      <Svg width="100%" height="100%" viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <LinearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={theme.colors.primaryDark} />
            <Stop offset="1" stopColor={theme.colors.primary} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={400} height={160} fill="url(#sky)" />

        <Circle cx={330} cy={40} r={30} fill="rgba(255,255,255,0.08)" />
        <Circle cx={330} cy={40} r={18} fill="rgba(255,255,255,0.35)" />

        {[
          [40, 24],
          [90, 18],
          [160, 30],
          [230, 16],
          [270, 26],
        ].map(([cx, cy]) => (
          <Circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={1.6} fill="rgba(255,255,255,0.6)" />
        ))}

        {buildings.map((b) => (
          <Rect key={b.x} x={b.x} y={160 - b.h} width={b.w} height={b.h} fill="rgba(10,14,30,0.35)" />
        ))}

        <Path d="M0 160 L0 150 Q200 120 400 150 L400 160 Z" fill="rgba(10,14,30,0.18)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    overflow: 'hidden',
  },
});
