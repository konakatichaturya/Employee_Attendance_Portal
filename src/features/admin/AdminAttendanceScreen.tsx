import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { format } from 'date-fns';
import { Screen } from '../../components/Screen';
import { OfflineBanner } from '../../components/OfflineBanner';
import { SuccessOverlay } from '../../components/SuccessOverlay';
import { VideoHero } from '../../components/VideoHero';
import { GradientBlobBackdrop } from '../../components/GradientBlobBackdrop';
import { useTheme, type Theme } from '../../theme/ThemeContext';
import { useCheckIn, useCheckOut, useTodayAttendance } from '../../hooks/useAttendanceQueries';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { AttendanceStatusCard } from '../dashboard/components/AttendanceStatusCard';
import { showErrorToast } from '../../components/toast';
import { LocationPermissionDeniedError } from '../../services/location/locationService';
import { NATIVE_VIDEO } from '../../constants/nativeMedia';

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
      <GradientBlobBackdrop />
      {isOffline && <OfflineBanner />}
      <ScrollView contentContainerStyle={styles.content}>
        <VideoHero
          theme={theme}
          title="Attendance"
          subtitle={format(new Date(), 'EEEE, dd MMMM yyyy')}
          videoSrc={NATIVE_VIDEO.attendance}
          height={120}
        />
        <View style={styles.heroSpacer} />

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
  heroSpacer: {
    height: theme.spacing.md,
  },
  });
}
