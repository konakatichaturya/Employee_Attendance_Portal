import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme, type Theme } from '../../../theme/ThemeContext';

interface HourTimelineBarProps {
  startHour: number;
  endHour: number;
  checkInTime: Date | null;
  checkOutTime: Date | null;
}

function hourLabel(hour: number): string {
  const h = hour % 24;
  const period = h < 12 ? 'AM' : 'PM';
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}${period}`;
}

function timeToFraction(date: Date, startHour: number, totalHours: number): number {
  const minutesFromStart = (date.getHours() - startHour) * 60 + date.getMinutes();
  return Math.max(0, Math.min(1, minutesFromStart / (totalHours * 60)));
}

export function HourTimelineBar({ startHour, endHour, checkInTime, checkOutTime }: HourTimelineBarProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const totalHours = endHour - startHour;
  const hours = Array.from({ length: totalHours + 1 }, (_, i) => startHour + i);

  const rangeStart = checkInTime ? timeToFraction(checkInTime, startHour, totalHours) : null;
  const rangeEnd = checkOutTime
    ? timeToFraction(checkOutTime, startHour, totalHours)
    : checkInTime
      ? timeToFraction(new Date(), startHour, totalHours)
      : null;

  return (
    <View>
      <View style={styles.track}>
        {rangeStart !== null && rangeEnd !== null && (
          <View
            style={[
              styles.fill,
              {
                left: `${rangeStart * 100}%`,
                width: `${Math.max((rangeEnd - rangeStart) * 100, 1.5)}%`,
              },
            ]}
          />
        )}
      </View>
      <View style={styles.labelsRow}>
        {hours.map((h) => (
          <Text key={h} style={styles.label}>
            {hourLabel(h)}
          </Text>
        ))}
      </View>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.surfaceAlt,
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: theme.colors.success,
    borderRadius: 3,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    fontSize: 9,
  },
  });
}
