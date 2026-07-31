import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import { format, parseISO } from 'date-fns';
import { useTheme, type Theme } from '../../../theme/ThemeContext';

export interface TrendPoint {
  date: string;
  presentRate: number;
  absentCount: number;
  lateCount: number;
  leaveCount: number;
}

interface TrendLineChartProps {
  data: TrendPoint[];
  totalEmployees: number;
  height?: number;
}

export function TrendLineChart({ data, totalEmployees, height = 180 }: TrendLineChartProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const SERIES = useMemo(
    () =>
      [
        { key: 'present', label: 'Present', color: theme.colors.success },
        { key: 'absent', label: 'Absent', color: theme.colors.danger },
        { key: 'late', label: 'Late', color: theme.colors.warning },
        { key: 'leave', label: 'Leave', color: theme.colors.accent },
      ] as const,
    [theme],
  );

  const [width, setWidth] = useState(0);
  const padding = 8;

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const total = totalEmployees || 1;
  const seriesValues: Record<(typeof SERIES)[number]['key'], number[]> = {
    present: data.map((d) => d.presentRate),
    absent: data.map((d) => (d.absentCount / total) * 100),
    late: data.map((d) => (d.lateCount / total) * 100),
    leave: data.map((d) => (d.leaveCount / total) * 100),
  };

  const toPoints = (values: number[]) => {
    if (width === 0 || values.length === 0) return '';
    const stepX = (width - padding * 2) / Math.max(values.length - 1, 1);
    return values
      .map((v, i) => {
        const x = padding + i * stepX;
        const y = padding + (1 - Math.min(v, 100) / 100) * (height - padding * 2);
        return `${x},${y}`;
      })
      .join(' ');
  };

  const labelIndices = data.length > 8 ? [0, Math.floor(data.length / 2), data.length - 1] : data.map((_, i) => i);

  return (
    <View>
      <View onLayout={onLayout} style={{ height }}>
        {width > 0 && (
          <Svg width={width} height={height}>
            {[0, 25, 50, 75, 100].map((v) => {
              const y = padding + (1 - v / 100) * (height - padding * 2);
              return (
                <Line key={v} x1={0} y1={y} x2={width} y2={y} stroke={theme.colors.border} strokeWidth={1} />
              );
            })}
            {SERIES.map((s) => (
              <Polyline
                key={s.key}
                points={toPoints(seriesValues[s.key])}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}
            {SERIES.map((s) =>
              seriesValues[s.key].map((v, i) => {
                if (!labelIndices.includes(i)) return null;
                const stepX = (width - padding * 2) / Math.max(data.length - 1, 1);
                const x = padding + i * stepX;
                const y = padding + (1 - Math.min(v, 100) / 100) * (height - padding * 2);
                return <Circle key={`${s.key}-${i}`} cx={x} cy={y} r={3} fill={s.color} />;
              }),
            )}
          </Svg>
        )}
      </View>

      <View style={styles.xLabels}>
        {labelIndices.map((i) => (
          <Text key={i} style={styles.xLabel}>
            {format(parseISO(data[i].date), 'dd MMM')}
          </Text>
        ))}
      </View>

      <View style={styles.legend}>
        {SERIES.map((s) => (
          <View key={s.key} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: s.color }]} />
            <Text style={styles.legendText}>{s.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    xLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 4,
    },
    xLabel: {
      ...theme.typography.caption,
      color: theme.colors.textMuted,
    },
    legend: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
      marginTop: theme.spacing.sm,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    legendText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
  });
}
