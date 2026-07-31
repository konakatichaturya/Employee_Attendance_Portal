import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme, type Theme } from '../../../theme/ThemeContext';

export interface TopEmployeeStat {
  employeeId: string;
  employeeName: string;
  totalHours: number;
}

interface TopEmployeesTableProps {
  data: TopEmployeeStat[];
}

export function TopEmployeesTable({ data }: TopEmployeesTableProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View>
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.idCol]}>Employee ID</Text>
        <Text style={[styles.headerCell, styles.nameCol]}>Employee Name</Text>
        <Text style={[styles.headerCell, styles.hoursCol]}>Work Hours</Text>
      </View>
      {data.map((row, i) => (
        <View key={row.employeeId} style={styles.row}>
          <Text style={[styles.idCol, styles.cell]}>{row.employeeId}</Text>
          <Text style={[styles.nameCol, styles.cell, styles.nameCell]} numberOfLines={1}>
            {i === 0 && '🏆 '}
            {row.employeeName}
          </Text>
          <Text style={[styles.hoursCol, styles.cell, styles.hoursCell]}>{row.totalHours}</Text>
        </View>
      ))}
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    headerRow: {
      flexDirection: 'row',
      paddingVertical: 6,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerCell: {
      ...theme.typography.captionMedium,
      color: theme.colors.textMuted,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    idCol: {
      width: 90,
    },
    nameCol: {
      flex: 1,
    },
    hoursCol: {
      width: 80,
      textAlign: 'right',
    },
    cell: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
    },
    nameCell: {
      color: theme.colors.textPrimary,
    },
    hoursCell: {
      color: theme.colors.primary,
      fontWeight: '700',
    },
  });
}
