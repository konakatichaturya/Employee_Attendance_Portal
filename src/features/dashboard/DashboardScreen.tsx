import React, { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { GlassCard } from '../../components/GlassCard';
import { Loader } from '../../components/Loader';
import { OfflineBanner } from '../../components/OfflineBanner';
import { SuccessOverlay } from '../../components/SuccessOverlay';
import { ConfirmModal } from '../../components/ConfirmModal';
import { useTheme, type Theme } from '../../theme/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { useAttendanceHistory, useCheckIn, useCheckOut, useTodayAttendance } from '../../hooks/useAttendanceQueries';
import { useLeaveBalances, useLeaveRequests } from '../../hooks/useLeaveQueries';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { AttendanceStatusCard } from './components/AttendanceStatusCard';
import { LeaveBalanceSummary } from './components/LeaveBalanceSummary';
import { QuickActionGrid } from './components/QuickActionGrid';
import { GreetingHeader } from './components/GreetingHeader';
import { StatTileRow } from '../../components/StatTileRow';
import { VideoHero } from '../../components/VideoHero';
import { GradientBlobBackdrop } from '../../components/GradientBlobBackdrop';
import { showErrorToast } from '../../components/toast';
import { LocationPermissionDeniedError } from '../../services/location/locationService';
import { NATIVE_VIDEO } from '../../constants/nativeMedia';
import type { DashboardStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<DashboardStackParamList>;

export function DashboardScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<Nav>();
  const parentNavigation = navigation.getParent() as any;
  const dispatch = useAppDispatch();
  const employee = useAppSelector((s) => s.auth.employee);
  const isOffline = useNetworkStatus();

  const todayQuery = useTodayAttendance();
  const balancesQuery = useLeaveBalances();
  const historyQuery = useAttendanceHistory();
  const requestsQuery = useLeaveRequests();
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

  const currentMonth = new Date().toISOString().slice(0, 7);
  const presentThisMonth =
    historyQuery.data?.filter((r) => r.date.startsWith(currentMonth) && !!r.checkInTime).length ?? 0;
  const leaveDaysLeft = (balancesQuery.data ?? [])
    .filter((b) => b.type !== 'Unpaid')
    .reduce((sum, b) => sum + (b.total - b.used), 0);
  const pendingRequests = requestsQuery.data?.filter((r) => r.status === 'Pending').length ?? 0;
  const hoursTodayLabel = todayQuery.data?.workingHours
    ? `${todayQuery.data.workingHours}h`
    : todayQuery.data?.checkInTime
      ? 'Active'
      : '--';
  const greetingSubtitle = todayQuery.data?.checkOutTime
    ? "You're all done for today!"
    : todayQuery.data?.checkInTime
      ? 'Have a great day at work!'
      : 'Begin another great day by clocking in.';

  const [successInfo, setSuccessInfo] = useState<{ title: string; message: string } | null>(null);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const refreshing = todayQuery.isRefetching || balancesQuery.isRefetching;

  const onRefresh = () => {
    todayQuery.refetch();
    balancesQuery.refetch();
  };

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

  const confirmLogout = async () => {
    setLoggingOut(true);
    await dispatch(logout());
    setLoggingOut(false);
    setLogoutModalVisible(false);
  };

  if (todayQuery.isLoading || balancesQuery.isLoading) {
    return <Loader fullScreen label="Loading your dashboard..." />;
  }

  return (
    <Screen edges={['top', 'left', 'right']}>
      <GradientBlobBackdrop />
      {isOffline && <OfflineBanner />}
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}
      >
        <GreetingHeader
          name={employee?.name}
          avatarUri={employee?.avatarUri}
          subtitle={greetingSubtitle}
          onAvatarPress={() => parentNavigation?.navigate('ProfileTab')}
          onLogout={() => setLogoutModalVisible(true)}
        />

        <VideoHero
          theme={theme}
          title={`Hi, ${employee?.name?.split(' ')[0] ?? 'there'}`}
          subtitle={greetingSubtitle}
          videoSrc={NATIVE_VIDEO.attendance}
          height={140}
        />
        <View style={styles.spacer} />

        <AttendanceStatusCard
          record={todayQuery.data}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
          loading={checkInMutation.isPending || checkOutMutation.isPending}
        />

        <View style={styles.spacer} />

        <StatTileRow
          tiles={[
            {
              key: 'hours',
              label: 'Hours Today',
              value: hoursTodayLabel,
              icon: 'clock-outline',
              color: theme.colors.primary,
            },
            {
              key: 'present',
              label: 'Present (Mo.)',
              value: `${presentThisMonth}`,
              icon: 'calendar-check',
              color: theme.colors.success,
            },
            {
              key: 'leave-left',
              label: 'Leave Left',
              value: `${leaveDaysLeft}`,
              icon: 'beach',
              color: theme.colors.accent,
            },
            {
              key: 'pending',
              label: 'Pending Req.',
              value: `${pendingRequests}`,
              icon: 'clipboard-clock-outline',
              color: theme.colors.warning,
            },
          ]}
        />

        <View style={styles.spacer} />

        <LeaveBalanceSummary balances={balancesQuery.data ?? []} />

        <View style={styles.spacer} />

        <GlassCard padded={false} style={styles.actionsCard}>
          <Text style={styles.sectionHeading}>Quick Actions</Text>
          <QuickActionGrid
            actions={[
              {
                key: 'attendance',
                label: 'Attendance',
                icon: 'fingerprint',
                color: theme.colors.primary,
                onPress: () => navigation.navigate('Attendance'),
              },
              {
                key: 'apply-leave',
                label: 'Apply Leave',
                icon: 'calendar-plus',
                color: theme.colors.accent,
                onPress: () => parentNavigation?.navigate('LeaveTab', { screen: 'ApplyLeave' }),
              },
              {
                key: 'history',
                label: 'View History',
                icon: 'history',
                color: theme.colors.danger,
                onPress: () => parentNavigation?.navigate('HistoryTab'),
              },
              {
                key: 'profile',
                label: 'Profile',
                icon: 'account-circle',
                color: theme.colors.success,
                onPress: () => parentNavigation?.navigate('ProfileTab'),
              },
              {
                key: 'leave-status',
                label: 'Leave Status',
                icon: 'clipboard-list',
                color: theme.colors.warning,
                onPress: () => parentNavigation?.navigate('LeaveTab'),
              },
            ]}
          />
        </GlassCard>
      </ScrollView>

      <SuccessOverlay
        visible={!!successInfo}
        title={successInfo?.title ?? ''}
        message={successInfo?.message}
        onDone={() => setSuccessInfo(null)}
      />

      <ConfirmModal
        visible={logoutModalVisible}
        title="Log out"
        message="Are you sure you want to log out of WorkTrack?"
        confirmLabel="Log Out"
        destructive
        loading={loggingOut}
        onConfirm={confirmLogout}
        onCancel={() => setLogoutModalVisible(false)}
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
  spacer: {
    height: theme.spacing.md,
  },
  actionsCard: {
    padding: theme.spacing.md,
    backgroundColor: 'transparent',
  },
  sectionHeading: {
    ...theme.typography.subtitle,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  });
}
