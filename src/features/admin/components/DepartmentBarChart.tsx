import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme, type Theme } from '../../../theme/ThemeContext';

export interface DepartmentStat {
  department: string;
  employeeCount: number;
  presentRate: number;
}

interface DepartmentBarChartProps {
  data: DepartmentStat[];
}

export function DepartmentBarChart({ data }: DepartmentBarChartProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const barColors = [theme.colors.primary, theme.colors.accent, theme.colors.success, theme.colors.warning, theme.colors.danger];

  return (
    <View style={styles.container}>
      {data.map((dept, i) => (
        <View key={dept.department} style={styles.row}>
          <Text style={styles.label} numberOfLines={1}>
            {dept.department}
          </Text>
          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                { width: `${Math.min(dept.presentRate, 100)}%`, backgroundColor: barColors[i % barColors.length] },
              ]}
            />
          </View>
          <Text style={styles.value}>{dept.presentRate}%</Text>
        </View>
      ))}
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      gap: theme.spacing.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    label: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      width: 90,
    },
    track: {
      flex: 1,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.surfaceAlt,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      borderRadius: 4,
    },
    value: {
      ...theme.typography.captionMedium,
      color: theme.colors.textPrimary,
      width: 40,
      textAlign: 'right',
    },
  });
}
