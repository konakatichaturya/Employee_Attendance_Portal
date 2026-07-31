import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { format } from 'date-fns';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { Loader } from '../../components/Loader';
import { useTheme, type Theme } from '../../theme/ThemeContext';
import { DonutChart } from './components/DonutChart';
import { KpiTileRow } from './components/KpiTileRow';
import { TrendLineChart } from './components/TrendLineChart';
import { DepartmentBarChart } from './components/DepartmentBarChart';
import { TopEmployeesTable } from './components/TopEmployeesTable';
import { AttendanceHeatmap } from './components/AttendanceHeatmap';
import { AttendanceInsightsCard } from './components/AttendanceInsightsCard';
import {
  useAdminAttendanceTrend,
  useAdminDepartmentBreakdown,
  useAdminHeatmap,
  useAdminOverviewStats,
  useAdminTopEmployees,
} from '../../admin/hooks/useAdminData';
import type { DayStatus } from '../../services/mock/mockServer';

export function AdminOverviewScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const statusColors: Record<DayStatus, string> = {
    Present: theme.colors.success,
    Absent: theme.colors.danger,
    Late: theme.colors.warning,
    Leave: theme.colors.accent,
  };

  const statsQuery = useAdminOverviewStats();
  const trendQuery = useAdminAttendanceTrend(14);
  const deptQuery = useAdminDepartmentBreakdown();
  const topQuery = useAdminTopEmployees(5);
  const heatmapQuery = useAdminHeatmap(14);

  if (statsQuery.isLoading || !statsQuery.data) {
    return <Loader fullScreen label="Loading dashboard..." />;
  }

  const stats = statsQuery.data;
  const onTimePresent = Math.max(stats.presentToday - stats.lateToday, 0);

  return (
    <Screen edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.heading}>Attendance Dashboard</Text>
          <Text style={styles.subheading}>{format(new Date(), 'EEEE, dd MMMM yyyy')}</Text>
        </View>

        <AttendanceInsightsCard
          presentRate={stats.presentRate}
          presentToday={stats.presentToday}
          absentToday={stats.absentToday}
          lateToday={stats.lateToday}
          onLeaveToday={stats.onLeaveToday}
          totalEmployees={stats.totalEmployees}
          departmentBreakdown={deptQuery.data ?? []}
        />

        <KpiTileRow
          tiles={[
            { key: 'total', label: 'Total Employees', value: `${stats.totalEmployees}`, icon: 'account-group-outline', color: theme.colors.primary },
            {
              key: 'present',
              label: 'Present Rate',
              value: `${stats.presentRate}%`,
              sublabel: `${stats.presentToday}/${stats.totalEmployees}`,
              icon: 'check-circle-outline',
              color: theme.colors.success,
            },
            { key: 'absent', label: 'Absent', value: `${stats.absentToday}`, icon: 'close-circle-outline', color: theme.colors.danger },
            { key: 'late', label: 'Late', value: `${stats.lateToday}`, icon: 'clock-alert-outline', color: theme.colors.warning },
            { key: 'leave', label: 'On Leave', value: `${stats.onLeaveToday}`, icon: 'calendar-clock-outline', color: theme.colors.accent },
          ]}
        />

        <View style={styles.spacer} />

        <Card style={styles.chartCard}>
          <Text style={styles.cardTitle}>Attendance Status Overview</Text>
          <View style={styles.donutBody}>
            <DonutChart
              segments={[
                { label: 'Present', value: onTimePresent, color: statusColors.Present },
                { label: 'Late', value: stats.lateToday, color: statusColors.Late },
                { label: 'Absent', value: stats.absentToday, color: statusColors.Absent },
                { label: 'Leave', value: stats.onLeaveToday, color: statusColors.Leave },
              ]}
              centerValue={`${stats.totalEmployees}`}
              centerLabel="employees"
              size={140}
              strokeWidth={18}
            />
            <View style={styles.donutLegend}>
              {(
                [
                  ['Present', onTimePresent],
                  ['Late', stats.lateToday],
                  ['Absent', stats.absentToday],
                  ['Leave', stats.onLeaveToday],
                ] as [DayStatus, number][]
              ).map(([label, value]) => (
                <View key={label} style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: statusColors[label] }]} />
                  <Text style={styles.legendLabel}>{label}</Text>
                  <Text style={styles.legendValue}>{value}</Text>
                </View>
              ))}
            </View>
          </View>
        </Card>

        <View style={styles.spacer} />

        <Card style={styles.chartCard}>
          <Text style={styles.cardTitle}>Daily Attendance Trend</Text>
          {trendQuery.data ? (
            <TrendLineChart data={trendQuery.data} totalEmployees={stats.totalEmployees} />
          ) : (
            <Loader label="Loading trend..." />
          )}
        </Card>

        <View style={styles.spacer} />

        <Card style={styles.chartCard}>
          <Text style={styles.cardTitle}>Attendance by Department</Text>
          {deptQuery.data ? <DepartmentBarChart data={deptQuery.data} /> : <Loader label="Loading..." />}
        </Card>

        <View style={styles.spacer} />

        <Card style={styles.chartCard}>
          <Text style={styles.cardTitle}>Top 5 Employees by Work Hours</Text>
          {topQuery.data ? <TopEmployeesTable data={topQuery.data} /> : <Loader label="Loading..." />}
        </Card>

        <View style={styles.spacer} />

        <Card style={styles.chartCard}>
          <Text style={styles.cardTitle}>Attendance Heatmap (last 14 days)</Text>
          {heatmapQuery.data ? <AttendanceHeatmap data={heatmapQuery.data} /> : <Loader label="Loading heatmap..." />}
        </Card>
      </ScrollView>
    </Screen>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    content: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.xxl,
    },
    headerRow: {
      marginBottom: theme.spacing.md,
    },
    heading: {
      ...theme.typography.h2,
      color: theme.colors.textPrimary,
    },
    subheading: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    spacer: {
      height: theme.spacing.md,
    },
    chartCard: {
      marginBottom: 0,
    },
    cardTitle: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.md,
    },
    donutBody: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.lg,
    },
    donutLegend: {
      flex: 1,
      gap: theme.spacing.sm,
    },
    legendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    legendDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    legendLabel: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      flex: 1,
    },
    legendValue: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
    },
  });
}
