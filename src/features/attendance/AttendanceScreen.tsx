import React, { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, View } from 'react-native';
import { format } from 'date-fns';
import { Screen } from '../../components/Screen';
import { OfflineBanner } from '../../components/OfflineBanner';
import { SuccessOverlay } from '../../components/SuccessOverlay';
import { AppButton } from '../../components/AppButton';
import { VideoHero } from '../../components/VideoHero';
import { GradientBlobBackdrop } from '../../components/GradientBlobBackdrop';
import { useTheme, type Theme } from '../../theme/ThemeContext';
import { useCheckIn, useCheckOut, useTodayAttendance } from '../../hooks/useAttendanceQueries';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { AttendanceStatusCard } from '../dashboard/components/AttendanceStatusCard';
import { showErrorToast } from '../../components/toast';
import { LocationPermissionDeniedError } from '../../services/location/locationService';
import { NATIVE_VIDEO } from '../../constants/nativeMedia';
import type { DashboardStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<DashboardStackParamList>;

export function AttendanceScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<Nav>();
  const parentNavigation = navigation.getParent<any>();
  const isOffline = useNetworkStatus();

  const todayQuery = useTodayAttendance();
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

  const [successInfo, setSuccessInfo] = useState<{ title: string; message: string } | null>(null);
  const hasCheckedIn = !!todayQuery.data?.checkInTime;
  const hasCheckedOut = !!todayQuery.data?.checkOutTime;

  const handleCheckIn = () => {
    checkInMutation.mutate(undefined, {
      onSuccess: (record) =>
        setSuccessInfo(
          record.pendingSync
            ? { title: 'Saved offline', message: "We'll sync your check-in once you're back online." }
            : { title: 'Checked in!', message: 'Have a productive day.' },
        ),
      onError: (error: any) => reportActionError(error),
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
      onError: (error: any) => reportActionError(error),
    });
  };

  const reportActionError = (error: any) => {
    if (error instanceof LocationPermissionDeniedError) {
      showErrorToast('Location required', error.message);
    } else {
      showErrorToast('Something went wrong', error?.message ?? 'Please try again.');
    }
  };

  return (
    <Screen>
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

        <AppButton
          label="View Full History"
          variant="outline"
          onPress={() => parentNavigation?.navigate('HistoryTab')}
          style={styles.historyButton}
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
    historyButton: {
      marginTop: theme.spacing.md,
    },
  });
}
