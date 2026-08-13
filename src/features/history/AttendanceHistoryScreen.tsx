import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { isWithinInterval, parseISO, startOfDay, subDays } from 'date-fns';
import { Screen } from '../../components/Screen';
import { Loader } from '../../components/Loader';
import { EmptyState } from '../../components/EmptyState';
import { DateField } from '../../components/DateField';
import { StatTileRow } from '../../components/StatTileRow';
import { VideoHero } from '../../components/VideoHero';
import { GradientBlobBackdrop } from '../../components/GradientBlobBackdrop';
import { useTheme, type Theme } from '../../theme/ThemeContext';
import { useAttendanceHistory } from '../../hooks/useAttendanceQueries';
import { HistoryFilterBar } from './components/HistoryFilterBar';
import { AttendanceHistoryCard } from './components/AttendanceHistoryCard';
import { NATIVE_VIDEO } from '../../constants/nativeMedia';
import type { AttendanceRecord, HistoryFilter } from '../../types';

export function AttendanceHistoryScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const historyQuery = useAttendanceHistory();
  const [filter, setFilter] = useState<HistoryFilter>('7d');
  const [customFrom, setCustomFrom] = useState<Date | null>(subDays(new Date(), 7));
  const [customTo, setCustomTo] = useState<Date | null>(new Date());

  const filteredRecords = useMemo(() => {
    const all = historyQuery.data ?? [];
    if (filter === '7d') {
      const from = startOfDay(subDays(new Date(), 7));
      return all.filter((r) => parseISO(r.date) >= from);
    }
    if (filter === '30d') {
      const from = startOfDay(subDays(new Date(), 30));
      return all.filter((r) => parseISO(r.date) >= from);
    }
    if (customFrom && customTo) {
      return all.filter((r) => isWithinInterval(parseISO(r.date), { start: startOfDay(customFrom), end: customTo }));
    }
    return all;
  }, [historyQuery.data, filter, customFrom, customTo]);

  const totalHours = filteredRecords.reduce((sum, r) => sum + (r.workingHours ?? 0), 0);
  const presentDays = filteredRecords.filter((r) => !!r.checkInTime).length;
  const avgHours = presentDays > 0 ? totalHours / presentDays : 0;

  const renderItem = ({ item }: { item: AttendanceRecord }) => <AttendanceHistoryCard record={item} />;

  return (
    <Screen>
      <GradientBlobBackdrop />
      <View style={styles.header}>
        <VideoHero
          theme={theme}
          title="Attendance History"
          subtitle={`${filteredRecords.length} records in range`}
          videoSrc={NATIVE_VIDEO.attendance}
          height={110}
        />
        <View style={styles.heroSpacer} />
        <HistoryFilterBar value={filter} onChange={setFilter} />

        {filter === 'custom' && (
          <View style={styles.customRow}>
            <View style={styles.customField}>
              <DateField label="From" value={customFrom} onChange={setCustomFrom} maximumDate={customTo ?? new Date()} />
            </View>
            <View style={styles.customField}>
              <DateField label="To" value={customTo} onChange={setCustomTo} minimumDate={customFrom ?? undefined} maximumDate={new Date()} />
            </View>
          </View>
        )}

        {filteredRecords.length > 0 && (
          <View style={styles.statsRow}>
            <StatTileRow
              tiles={[
                {
                  key: 'records',
                  label: 'Days Present',
                  value: `${presentDays}`,
                  icon: 'calendar-check',
                  color: theme.colors.primary,
                },
                {
                  key: 'hours',
                  label: 'Total Hours',
                  value: totalHours.toFixed(1),
                  icon: 'clock-outline',
                  color: theme.colors.success,
                },
                {
                  key: 'avg',
                  label: 'Avg Hrs/Day',
                  value: avgHours.toFixed(1),
                  icon: 'chart-line',
                  color: theme.colors.accent,
                },
              ]}
            />
          </View>
        )}
      </View>

      {historyQuery.isLoading ? (
        <Loader label="Loading attendance history..." />
      ) : (
        <FlatList
          data={filteredRecords}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={historyQuery.isRefetching} onRefresh={() => historyQuery.refetch()} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="calendar-search"
              title="No records found"
              message="Try a different date range to see your attendance history."
            />
          }
        />
      )}
    </Screen>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    header: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.sm,
    },
    heroSpacer: {
      height: theme.spacing.sm,
    },
    customRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    customField: {
      flex: 1,
    },
    statsRow: {
      marginTop: theme.spacing.sm,
      marginBottom: 4,
    },
    listContent: {
      padding: theme.spacing.md,
      flexGrow: 1,
    },
  });
}
