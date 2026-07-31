import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { format } from 'date-fns';
import { Screen } from '../../components/Screen';
import { OfflineBanner } from '../../components/OfflineBanner';
import { SuccessOverlay } from '../../components/SuccessOverlay';
import { useTheme, type Theme } from '../../theme/ThemeContext';
import { useCheckIn, useCheckOut, useTodayAttendance } from '../../hooks/useAttendanceQueries';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { AttendanceStatusCard } from '../dashboard/components/AttendanceStatusCard';
import { showErrorToast } from '../../components/toast';
import { LocationPermissionDeniedError } from '../../services/location/locationService';

export function AdminAttendanceScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isOffline = useNetworkStatus();
  const todayQuery = useTodayAttendance();
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();
  const [successInfo, setSuccessInfo] = useState<{ title: string; message: string } | null>(null);

  const reportActionError = (error: any) => {
    if (error instanceof LocationPermissionDeniedError) {
      showErrorToast('Location required', error.message);
    } else {
      showErrorToast('Something went wrong', error?.message ?? 'Please try again.');
    }
  };

  const handleCheckIn = () => {
    checkInMutation.mutate(undefined, {
      onSuccess: (record) =>
        setSuccessInfo(
          record.pendingSync
            ? { title: 'Saved offline', message: "We'll sync your check-in once you're back online." }
            : { title: 'Checked in!', message: 'Have a productive day.' },
        ),
      onError: reportActionError,
    });
  };

  const handleCheckOut = () => {
    checkOutMutation.mutate(undefined, {
      onSuccess: (record) =>
        setSuccessInfo(
          record.pendingSync
            ? { title: 'Saved offline', message: "We'll sync your check-out once you're back online." }
            : { title: 'Checked out!', message: 'See you tomorrow.' },
        ),
      onError: reportActionError,
    });
  };

  return (
    <Screen edges={['top', 'left', 'right']}>
      {isOffline && <OfflineBanner />}
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.heading}>Attendance</Text>
          <Text style={styles.subheading}>{format(new Date(), 'EEEE, dd MMMM yyyy')}</Text>
        </View>

        <AttendanceStatusCard
          record={todayQuery.data}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
          loading={checkInMutation.isPending || checkOutMutation.isPending}
        />
      </ScrollView>

      <SuccessOverlay
        visible={!!successInfo}
        title={successInfo?.title ?? ''}
        message={successInfo?.message}
        onDone={() => setSuccessInfo(null)}
      />
    </Screen>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
  content: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
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
  });
}
