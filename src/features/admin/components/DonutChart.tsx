import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme, type Theme } from '../../../theme/ThemeContext';

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  centerValue: string;
  centerLabel: string;
  size?: number;
  strokeWidth?: number;
}

export function DonutChart({ segments, centerValue, centerLabel, size = 160, strokeWidth = 22 }: DonutChartProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;

  let cumulative = 0;
  const arcs = segments
    .filter((s) => s.value > 0)
    .map((s) => {
      const fraction = s.value / total;
      const arcLength = fraction * circumference;
      const gap = segments.length > 1 ? 2 : 0;
      const dashArray = `${Math.max(arcLength - gap, 0)} ${circumference - arcLength + gap}`;
      const dashOffset = -cumulative;
      cumulative += arcLength;
      return { ...s, dashArray, dashOffset };
    });

  return (
    <View style={styles.wrapper}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle cx={size / 2} cy={size / 2} r={radius} stroke={theme.colors.surfaceAlt} strokeWidth={strokeWidth} fill="none" />
          {arcs.map((arc) => (
            <Circle
              key={arc.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={arc.color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={arc.dashArray}
              strokeDashoffset={arc.dashOffset}
              strokeLinecap="butt"
              rotation={-90}
              origin={`${size / 2}, ${size / 2}`}
            />
          ))}
        </Svg>
        <View style={[StyleSheet.absoluteFill, styles.center]}>
          <Text style={styles.centerValue}>{centerValue}</Text>
          <Text style={styles.centerLabel}>{centerLabel}</Text>
        </View>
      </View>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    wrapper: {
      alignItems: 'center',
    },
    center: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    centerValue: {
      ...theme.typography.h1,
      color: theme.colors.textPrimary,
    },
    centerLabel: {
      ...theme.typography.caption,
      color: theme.colors.textMuted,
    },
  });
}
