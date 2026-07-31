import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme, type Theme } from '../theme/ThemeContext';

interface ProgressRingProps {
  progress: number; // 0..1
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  centerLabel?: string;
  centerSubLabel?: string;
}

export function ProgressRing({
  progress,
  size = 84,
  strokeWidth = 9,
  color,
  trackColor,
  centerLabel,
  centerSubLabel,
}: ProgressRingProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const resolvedColor = color ?? theme.colors.primary;
  const resolvedTrackColor = trackColor ?? theme.colors.surfaceAlt;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, progress));
  const strokeDashoffset = circumference * (1 - clamped);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={resolvedTrackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={resolvedColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        {!!centerLabel && <Text style={styles.label}>{centerLabel}</Text>}
        {!!centerSubLabel && <Text style={styles.subLabel}>{centerSubLabel}</Text>}
      </View>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    center: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      ...theme.typography.subtitle,
      color: theme.colors.textPrimary,
    },
    subLabel: {
      ...theme.typography.caption,
      color: theme.colors.textMuted,
    },
  });
}
