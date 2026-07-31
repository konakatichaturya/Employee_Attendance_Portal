import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { format, parseISO } from 'date-fns';
import { useWebTheme, type WebTheme } from '../ThemeContext';
import type { DayStatus } from '../../services/mock/mockServer';

export interface HeatmapRow {
  employeeId: string;
  employeeName: string;
  days: { date: string; status: DayStatus }[];
}

interface AttendanceHeatmapProps {
  data: HeatmapRow[];
}

const CELL_SIZE = 18;

export function AttendanceHeatmap({ data }: AttendanceHeatmapProps) {
  const { theme } = useWebTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const statusColors: Record<DayStatus, string> = {
    Present: theme.colors.success,
    Absent: theme.colors.danger,
    Late: theme.colors.warning,
    Leave: theme.colors.accent,
  };
  const dates = data[0]?.days.map((d) => d.date) ?? [];

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={styles.headerRow}>
            <Text style={styles.nameHeaderCell}>Employee</Text>
            {dates.map((date) => (
              <Text key={date} style={styles.dateHeaderCell}>
                {format(parseISO(date), 'd')}
              </Text>
            ))}
          </View>
          {data.map((row) => (
            <View key={row.employeeId} style={styles.row}>
              <Text style={styles.nameCell} numberOfLines={1}>
                {row.employeeName}
              </Text>
              {row.days.map((day) => (
                <View
                  key={day.date}
                  style={[styles.cell, { backgroundColor: statusColors[day.status] }]}
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.legend}>
        {(Object.keys(statusColors) as DayStatus[]).map((status) => (
          <View key={status} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: statusColors[status] }]} />
            <Text style={styles.legendText}>{status}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function createStyles(theme: WebTheme) {
  return StyleSheet.create({
    headerRow: {
      flexDirection: 'row',
      marginBottom: 4,
    },
    nameHeaderCell: {
      ...theme.typography.captionMedium,
      color: theme.colors.textMuted,
      width: 120,
    },
    dateHeaderCell: {
      ...theme.typography.caption,
      color: theme.colors.textMuted,
      width: CELL_SIZE,
      textAlign: 'center',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    nameCell: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      width: 120,
    },
    cell: {
      width: CELL_SIZE - 2,
      height: CELL_SIZE - 2,
      marginRight: 2,
      borderRadius: 3,
    },
    legend: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
      marginTop: theme.spacing.md,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    legendDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    legendText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
  });
}
