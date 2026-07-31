import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, isWithinInterval, parseISO, startOfDay, subDays } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useWebTheme, type WebTheme } from './ThemeContext';
import { AdminCard as Card } from './components/AdminCard';
import { AdminLoader as Loader } from './components/AdminLoader';
import { AdminEmptyState as EmptyState } from './components/AdminEmptyState';
import { AdminConfirmModal } from './components/AdminConfirmModal';
import { AdminSidebar, type SidebarItem } from './components/AdminSidebar';
import { KpiTileRow } from './components/KpiTileRow';
import { AppButton } from '../components/AppButton';
import { InputField } from '../components/InputField';
import { DateField } from '../components/DateField';
import { HistoryFilterBar } from '../features/history/components/HistoryFilterBar';
import { LeaveTypeSelector } from '../features/leave/components/LeaveTypeSelector';
import { LeaveUsageChart } from '../features/leave/components/LeaveUsageChart';
import { ImageSourceSheet } from '../features/profile/components/ImageSourceSheet';
import { applyLeaveSchema, calculateLeaveDays, type ApplyLeaveFormValues } from '../features/leave/schema';
import { getInitials } from '../utils/getInitials';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { useAttendanceHistory, useCheckIn, useCheckOut, useTodayAttendance } from '../hooks/useAttendanceQueries';
import { useApplyLeave, useLeaveBalances, useLeaveRequests } from '../hooks/useLeaveQueries';
import { useApprovalRecommendation, useImproveLeaveReason } from '../hooks/useAskAi';
import { useMyTeam } from './hooks/useTeam';
import { LeaveAssistantChat } from '../features/ai/LeaveAssistantChat';
import { useUpdateProfile } from '../hooks/useProfile';
import { useReverseGeocode } from '../hooks/useReverseGeocode';
import { useDecideAsManager, usePendingApprovalsForManager } from './hooks/useApprovals';
import { showErrorToast, showSuccessToast } from '../components/toast';
import { LocationPermissionDeniedError } from '../services/location/locationService';
import type { AttendanceRecord, Employee, HistoryFilter, LeaveRequest, LeaveStatus } from '../types';

type EmployeeSection = 'overview' | 'attendance' | 'leave' | 'approvals' | 'team' | 'history' | 'profile';

export function EmployeeWebDashboard() {
  const { theme } = useWebTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useAppDispatch();
  const employee = useAppSelector((s) => s.auth.employee);
  const isManager = employee?.role === 'manager';
  const [section, setSection] = useState<EmployeeSection>('overview');
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const items: SidebarItem<EmployeeSection>[] = [
    { key: 'overview', label: 'Dashboard', icon: 'view-dashboard-outline' },
    { key: 'attendance', label: 'Attendance', icon: 'fingerprint' },
    { key: 'leave', label: 'Apply Leave', icon: 'calendar-clock-outline' },
    ...(isManager ? [{ key: 'approvals' as const, label: 'Approvals', icon: 'clipboard-check-outline' as const }] : []),
    ...(isManager ? [{ key: 'team' as const, label: 'My Team', icon: 'account-group-outline' as const }] : []),
    { key: 'history', label: 'History', icon: 'history' },
    { key: 'profile', label: 'Profile', icon: 'account-circle-outline' },
  ];

  const confirmLogout = async () => {
    setLoggingOut(true);
    await dispatch(logout());
    setLoggingOut(false);
    setLogoutModalVisible(false);
  };

  return (
    <View style={styles.root}>
      <AdminSidebar active={section} onChange={setSection} items={items} brandLabel="WorkTrack" brandIcon="calendar-check" />

      <View style={styles.contentArea}>
        <View style={styles.topBar}>
          <View />
          <View style={styles.topBarRight}>
            {employee?.avatarUri ? (
              <Image source={{ uri: employee.avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(employee?.name)}</Text>
              </View>
            )}
            <Text style={styles.userName}>{employee?.name}</Text>
            <MaterialCommunityIcons
              name="logout"
              size={20}
              color={theme.colors.textMuted}
              onPress={() => setLogoutModalVisible(true)}
              suppressHighlighting
            />
          </View>
        </View>

        <View style={styles.pageArea}>
          {section === 'overview' && <OverviewSection onNavigate={setSection} />}
          {section === 'attendance' && <AttendanceSection />}
          {section === 'leave' && <LeaveSection />}
          {section === 'approvals' && <ApprovalsSection />}
          {section === 'team' && <MyTeamSection />}
          {section === 'history' && <HistorySection />}
          {section === 'profile' && <ProfileSection />}
        </View>
      </View>

      <AdminConfirmModal
        visible={logoutModalVisible}
        title="Log out"
        message="Are you sure you want to log out?"
        confirmLabel="Log Out"
        destructive
        loading={loggingOut}
        onConfirm={confirmLogout}
        onCancel={() => setLogoutModalVisible(false)}
      />

      <LeaveAssistantChat theme={theme} />
    </View>
  );
}

function ApprovalsSection() {
  const { theme } = useWebTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const approvalsQuery = usePendingApprovalsForManager();

  const isLoading = approvalsQuery.isLoading;
  const approvals: (LeaveRequest & { employeeId: string; employeeName: string })[] = approvalsQuery.data ?? [];

  if (isLoading) {
    return <Loader label="Loading approvals..." />;
  }

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.heading}>Pending Approvals</Text>
      <Text style={styles.subheading}>Review leave requests from your direct reports.</Text>

      {approvals.length === 0 ? (
        <EmptyState title="Nothing to review" message="You do not have any leave requests awaiting your decision right now." />
      ) : (
        approvals.map((item) => (
          <ApprovalCard
            key={item.id}
            item={item}
            siblingRequests={approvals.filter((a) => a.employeeId === item.employeeId && a.id !== item.id)}
          />
        ))
      )}
    </ScrollView>
  );
}

function ApprovalCard({
  item,
  siblingRequests,
}: {
  item: LeaveRequest & { employeeId: string; employeeName: string };
  siblingRequests: (LeaveRequest & { employeeId: string; employeeName: string })[];
}) {
  const { theme } = useWebTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const recommendationMutation = useApprovalRecommendation();
  const decideAsManager = useDecideAsManager();
  const isSubmitting = decideAsManager.isPending;

  const decide = (decision: 'approve' | 'reject') => {
    decideAsManager.mutate(
      { employeeId: item.employeeId, requestId: item.id, decision },
      {
        onSuccess: () => showSuccessToast(decision === 'approve' ? 'Request approved' : 'Request rejected'),
        onError: (error: any) => showErrorToast('Could not update request', error?.message ?? 'Please try again.'),
      },
    );
  };

  const getRecommendation = () => {
    recommendationMutation.mutate({
      employeeName: item.employeeName,
      request: { type: item.type, fromDate: item.fromDate, toDate: item.toDate, reason: item.reason, days: item.days },
      recentRequests: siblingRequests.map((r) => ({ type: r.type, fromDate: r.fromDate, toDate: r.toDate, status: r.status })),
    });
  };

  return (
    <Card style={styles.approvalCard}>
      <View style={styles.approvalHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.employeeName}>{item.employeeName}</Text>
          <Text style={styles.reasonText}>
            {item.type} leave • {item.days} day{item.days > 1 ? 's' : ''} • {item.fromDate} to {item.toDate}
          </Text>
        </View>
        <MaterialCommunityIcons name="calendar-clock-outline" size={20} color={theme.colors.primary} />
      </View>
      <Text style={styles.reasonText}>{item.reason}</Text>

      <Pressable
        onPress={getRecommendation}
        disabled={recommendationMutation.isPending}
        style={styles.aiButton}
        accessibilityRole="button"
      >
        {recommendationMutation.isPending ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : (
          <MaterialCommunityIcons name="creation" size={16} color={theme.colors.primary} />
        )}
        <Text style={styles.aiButtonText}>
          {recommendationMutation.isPending
            ? 'Checking…'
            : recommendationMutation.data
              ? 'Re-check with AI'
              : 'Check with AI'}
        </Text>
      </Pressable>
      {recommendationMutation.data && <Text style={styles.aiInsightText}>{recommendationMutation.data}</Text>}

      <View style={styles.approvalActions}>
        <AppButton
          label="Approve"
          variant="success"
          size="lg"
          fullWidth={false}
          loading={isSubmitting}
          disabled={isSubmitting}
          icon={<MaterialCommunityIcons name="check-circle-outline" size={20} color={theme.colors.textInverse} />}
          onPress={() => decide('approve')}
          style={styles.approveButton}
        />
        <AppButton
          label="Reject"
          variant="danger"
          size="lg"
          fullWidth={false}
          loading={isSubmitting}
          disabled={isSubmitting}
          icon={<MaterialCommunityIcons name="close-circle-outline" size={20} color={theme.colors.textInverse} />}
          onPress={() => decide('reject')}
          style={styles.rejectButton}
        />
      </View>
    </Card>
  );
}

function TeamMemberRow({ member, meta, onPress }: { member: Employee; meta: string; onPress?: () => void }) {
  const { theme } = useWebTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <Pressable onPress={onPress} style={styles.teamRow} disabled={!onPress}>
      <View style={styles.avatarSmall}>
        <Text style={styles.avatarSmallText}>{getInitials(member.name)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.employeeName}>{member.name}</Text>
        <Text style={styles.reasonText}>{meta}</Text>
      </View>
    </Pressable>
  );
}

function MyTeamSection() {
  const { theme } = useWebTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const teamQuery = useMyTeam();
  const team = teamQuery.data ?? [];

  if (teamQuery.isLoading) {
    return <Loader label="Loading your team..." />;
  }

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.heading}>My Team</Text>
      <Text style={styles.subheading}>Employees who report to you</Text>

      {team.length === 0 ? (
        <EmptyState
          icon="account-group-outline"
          title="No team members yet"
          message="Employees will appear here once an admin assigns them to you."
        />
      ) : (
        <Card>
          {team.map((member) => (
            <TeamMemberRow key={member.id} member={member} meta={`${member.department} · ${member.id}`} />
          ))}
        </Card>
      )}
    </ScrollView>
  );
}

function AttendanceStatusBadge({ record }: { record: AttendanceRecord | null | undefined }) {
  const { theme } = useWebTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const hasCheckedIn = !!record?.checkInTime;
  const hasCheckedOut = !!record?.checkOutTime;
  const label = hasCheckedOut ? 'Checked Out' : hasCheckedIn ? 'Checked In' : 'Not Checked In';
  const color = hasCheckedOut ? theme.colors.textMuted : hasCheckedIn ? theme.colors.success : theme.colors.warning;
  const bg = hasCheckedOut ? theme.colors.surfaceAlt : hasCheckedIn ? theme.colors.successBg : theme.colors.warningBg;

  return (
    <View style={[styles.statusBadge, { backgroundColor: bg }]}>
      <View style={[styles.statusDot, { backgroundColor: color }]} />
      <Text style={[styles.statusText, { color }]}>{label}</Text>
    </View>
  );
}

function AttendanceActionCard() {
  const { theme } = useWebTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const todayQuery = useTodayAttendance();
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

  const record = todayQuery.data;
  const hasCheckedIn = !!record?.checkInTime;
  const hasCheckedOut = !!record?.checkOutTime;
  const { data: checkInAddress, isPending: addressPending } = useReverseGeocode(record?.checkInLocation);

  const reportError = (error: any) => {
    if (error instanceof LocationPermissionDeniedError) {
      showErrorToast('Location required', error.message);
    } else {
      showErrorToast('Something went wrong', error?.message ?? 'Please try again.');
    }
  };

  const handleCheckIn = () => {
    checkInMutation.mutate(undefined, {
      onSuccess: (r) =>
        showSuccessToast(
          r.pendingSync ? 'Saved offline' : 'Checked in!',
          r.pendingSync ? "We'll sync when you're back online." : 'Have a productive day.',
        ),
      onError: reportError,
    });
  };

  const handleCheckOut = () => {
    checkOutMutation.mutate(undefined, {
      onSuccess: (r) =>
        showSuccessToast(
          r.pendingSync ? 'Saved offline' : 'Checked out!',
          r.pendingSync ? "We'll sync when you're back online." : 'See you tomorrow.',
        ),
      onError: reportError,
    });
  };

  if (todayQuery.isLoading) {
    return <Loader label="Loading attendance..." />;
  }

  return (
    <Card style={styles.actionCard}>
      <View style={styles.attendanceHeaderRow}>
        <Text style={styles.cardTitle}>Today's Attendance</Text>
        <AttendanceStatusBadge record={record} />
      </View>

      <View style={styles.timesRow}>
        <View style={styles.timeBlock}>
          <MaterialCommunityIcons name="login" size={18} color={theme.colors.success} />
          <Text style={styles.timeLabel}>Check-In</Text>
          <Text style={styles.timeValue}>{record?.checkInTime ? format(parseISO(record.checkInTime), 'hh:mm a') : '--:--'}</Text>
        </View>
        <View style={styles.timeBlock}>
          <MaterialCommunityIcons name="logout" size={18} color={theme.colors.danger} />
          <Text style={styles.timeLabel}>Check-Out</Text>
          <Text style={styles.timeValue}>{record?.checkOutTime ? format(parseISO(record.checkOutTime), 'hh:mm a') : '--:--'}</Text>
        </View>
        <View style={styles.timeBlock}>
          <MaterialCommunityIcons name="clock-outline" size={18} color={theme.colors.primary} />
          <Text style={styles.timeLabel}>Hours</Text>
          <Text style={styles.timeValue}>{record?.workingHours ? `${record.workingHours}h` : '--'}</Text>
        </View>
      </View>

      {record?.checkInLocation && (
        <Text style={styles.locationText}>
          <MaterialCommunityIcons name="map-marker-outline" size={14} color={theme.colors.textMuted} />{' '}
          {addressPending
            ? 'Locating…'
            : checkInAddress ?? `${record.checkInLocation.latitude.toFixed(5)}, ${record.checkInLocation.longitude.toFixed(5)}`}
        </Text>
      )}

      {!hasCheckedOut && (
        <AppButton
          label={hasCheckedIn ? 'Check Out' : 'Check In'}
          onPress={hasCheckedIn ? handleCheckOut : handleCheckIn}
          variant={hasCheckedIn ? 'secondary' : 'success'}
          size="lg"
          loading={checkInMutation.isPending || checkOutMutation.isPending}
          style={styles.submitButton}
        />
      )}
      {hasCheckedOut && <Text style={styles.doneText}>You're all done for today. See you tomorrow!</Text>}
    </Card>
  );
}

function OverviewSection({ onNavigate }: { onNavigate: (s: EmployeeSection) => void }) {
  const { theme } = useWebTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const employee = useAppSelector((s) => s.auth.employee);
  const todayQuery = useTodayAttendance();
  const balancesQuery = useLeaveBalances();

  if (todayQuery.isLoading || balancesQuery.isLoading) {
    return <Loader label="Loading your dashboard..." />;
  }

  const record = todayQuery.data;
  const leaveDaysLeft = (balancesQuery.data ?? [])
    .filter((b) => b.type !== 'Unpaid')
    .reduce((sum, b) => sum + (b.total - b.used), 0);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Hi, {employee?.name?.split(' ')[0]}</Text>
      <Text style={styles.subheading}>
        {employee?.id} · {employee?.department} · {format(new Date(), 'EEEE, dd MMMM yyyy')}
      </Text>

      <View style={styles.spacer} />

      <KpiTileRow
        tiles={[
          {
            key: 'checkin',
            label: 'Check-In',
            value: record?.checkInTime ? format(parseISO(record.checkInTime), 'hh:mm a') : '--:--',
            icon: 'login',
            color: theme.colors.primary,
          },
          {
            key: 'checkout',
            label: 'Check-Out',
            value: record?.checkOutTime ? format(parseISO(record.checkOutTime), 'hh:mm a') : '--:--',
            icon: 'logout',
            color: theme.colors.danger,
          },
          { key: 'hours', label: 'Hours Today', value: record?.workingHours ? `${record.workingHours}h` : '--', icon: 'clock-outline', color: theme.colors.success },
          { key: 'leave', label: 'Leave Left', value: `${leaveDaysLeft}`, icon: 'beach', color: theme.colors.accent },
        ]}
      />

      <View style={styles.spacer} />

      <View style={styles.chartsRow}>
        <View style={styles.chartCard}>
          <AttendanceActionCard />
        </View>
        <Card style={styles.chartCard}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            {(
              [
                ['attendance', 'fingerprint', 'Attendance'],
                ['leave', 'calendar-plus', 'Apply Leave'],
                ['history', 'history', 'History'],
                ['profile', 'account-circle', 'Profile'],
              ] as [EmployeeSection, keyof typeof MaterialCommunityIcons.glyphMap, string][]
            ).map(([key, icon, label]) => (
              <Pressable key={key} style={styles.quickAction} onPress={() => onNavigate(key)} accessibilityRole="button">
                <MaterialCommunityIcons name={icon} size={22} color={theme.colors.primary} />
                <Text style={styles.quickActionLabel}>{label}</Text>
              </Pressable>
            ))}
          </View>
        </Card>
      </View>

      <View style={styles.spacer} />

      {balancesQuery.data && (
        <Card style={styles.chartCardWide}>
          <LeaveUsageChart balances={balancesQuery.data} />
        </Card>
      )}
    </ScrollView>
  );
}

export function AttendanceSection() {
  const { theme } = useWebTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Attendance</Text>
      <Text style={styles.subheading}>{format(new Date(), 'EEEE, dd MMMM yyyy')}</Text>
      <View style={styles.spacer} />
      <View style={{ maxWidth: 480 }}>
        <AttendanceActionCard />
      </View>
    </ScrollView>
  );
}

export function LeaveSection() {
  const { theme } = useWebTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const balancesQuery = useLeaveBalances();
  const requestsQuery = useLeaveRequests();
  const applyLeaveMutation = useApplyLeave();
  const improveReasonMutation = useImproveLeaveReason();

  const statusColors: Record<LeaveStatus, { bg: string; text: string }> = {
    Pending: { bg: theme.colors.warningBg, text: theme.colors.warning },
    Approved: { bg: theme.colors.successBg, text: theme.colors.success },
    Rejected: { bg: theme.colors.dangerBg, text: theme.colors.danger },
  };

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ApplyLeaveFormValues>({
    resolver: zodResolver(applyLeaveSchema),
    defaultValues: { type: 'Casual', fromDate: undefined, toDate: undefined, reason: '' },
  });

  const type = watch('type');
  const fromDate = watch('fromDate');
  const toDate = watch('toDate');
  const reason = watch('reason');
  const days = fromDate && toDate ? calculateLeaveDays(fromDate, toDate) : 0;
  const balance = balancesQuery.data?.find((b) => b.type === type);
  const remainingAfter = balance ? balance.total - balance.used - days : null;

  const onImproveReason = async () => {
    try {
      const improved = await improveReasonMutation.mutateAsync({ type, reason });
      setValue('reason', improved, { shouldValidate: true, shouldDirty: true });
    } catch (error: any) {
      showErrorToast('Could not improve reason', error?.message ?? 'Please try again.');
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      await applyLeaveMutation.mutateAsync({
        type: values.type,
        fromDate: format(values.fromDate, 'yyyy-MM-dd'),
        toDate: format(values.toDate, 'yyyy-MM-dd'),
        reason: values.reason,
        days: calculateLeaveDays(values.fromDate, values.toDate),
      });
      showSuccessToast('Leave requested', 'Your request has been submitted for approval.');
      reset({ type: 'Casual', fromDate: undefined, toDate: undefined, reason: '' });
    } catch (error: any) {
      showErrorToast('Could not submit leave', error?.message ?? 'Please try again.');
    }
  });

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Leave</Text>
      <Text style={styles.subheading}>View your balance and apply for time off</Text>

      <View style={styles.spacer} />

      {balancesQuery.data && (
        <KpiTileRow
          tiles={balancesQuery.data
            .filter((b) => b.type !== 'Unpaid')
            .map((b) => ({
              key: b.type,
              label: b.type,
              value: `${b.total - b.used}`,
              sublabel: `${b.used}/${b.total} used`,
              icon: 'beach' as const,
              color: theme.colors.primary,
            }))}
        />
      )}

      <View style={styles.spacer} />

      {balancesQuery.data && (
        <Card style={styles.chartCard}>
          <LeaveUsageChart balances={balancesQuery.data} />
        </Card>
      )}

      <View style={styles.spacer} />

      <View style={styles.chartsRow}>
        <Card style={styles.chartCard}>
          <Text style={styles.cardTitle}>Apply for Leave</Text>

          <Controller
            control={control}
            name="type"
            render={({ field: { value, onChange } }) => <LeaveTypeSelector value={value} onChange={onChange} />}
          />

          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <Controller
                control={control}
                name="fromDate"
                render={({ field: { value, onChange } }) => (
                  <DateField
                    label="From Date"
                    value={value ?? null}
                    onChange={onChange}
                    minimumDate={new Date()}
                    error={errors.fromDate?.message}
                  />
                )}
              />
            </View>
            <View style={styles.dateField}>
              <Controller
                control={control}
                name="toDate"
                render={({ field: { value, onChange } }) => (
                  <DateField
                    label="To Date"
                    value={value ?? null}
                    onChange={onChange}
                    minimumDate={fromDate ?? new Date()}
                    error={errors.toDate?.message}
                  />
                )}
              />
            </View>
          </View>

          <Controller
            control={control}
            name="reason"
            render={({ field: { value, onChange, onBlur } }) => (
              <InputField
                label="Reason"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Briefly describe your reason for leave"
                multiline
                numberOfLines={3}
                error={errors.reason?.message}
              />
            )}
          />

          <Pressable
            onPress={onImproveReason}
            disabled={improveReasonMutation.isPending}
            style={styles.aiButton}
            accessibilityRole="button"
          >
            {improveReasonMutation.isPending ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <MaterialCommunityIcons name="creation" size={16} color={theme.colors.primary} />
            )}
            <Text style={styles.aiButtonText}>
              {improveReasonMutation.isPending ? 'Improving…' : 'Improve with AI'}
            </Text>
          </Pressable>

          {days > 0 && (
            <View style={styles.previewBox}>
              <Text style={styles.durationText}>{days} day(s)</Text>
              {balance && type !== 'Unpaid' && (
                <Text style={[styles.durationText, remainingAfter !== null && remainingAfter < 0 && { color: theme.colors.danger }]}>
                  {remainingAfter} / {balance.total} days left after this request
                </Text>
              )}
            </View>
          )}

          <AppButton label="Submit Request" onPress={onSubmit} loading={applyLeaveMutation.isPending} style={styles.submitButton} />
        </Card>

        <Card style={styles.chartCardWide}>
          <Text style={styles.cardTitle}>My Requests</Text>
          {requestsQuery.isLoading ? (
            <Loader label="Loading..." />
          ) : (requestsQuery.data ?? []).length === 0 ? (
            <EmptyState icon="calendar-clock-outline" title="No leave requests yet" />
          ) : (
            (requestsQuery.data ?? []).map((req) => {
              const colors = statusColors[req.status];
              return (
                <View key={req.id} style={styles.requestRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.employeeName}>
                      {req.type} · {format(parseISO(req.fromDate), 'dd MMM')} – {format(parseISO(req.toDate), 'dd MMM')}
                    </Text>
                    <Text style={styles.reasonText} numberOfLines={1}>
                      {req.reason}
                    </Text>
                  </View>
                  <View style={[styles.statusBadgePlain, { backgroundColor: colors.bg }]}>
                    <Text style={[styles.statusText, { color: colors.text }]}>{req.status}</Text>
                  </View>
                </View>
              );
            })
          )}
        </Card>
      </View>
    </ScrollView>
  );
}

function HistorySection() {
  const { theme } = useWebTheme();
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

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Attendance History</Text>
      <Text style={styles.subheading}>{filteredRecords.length} records · {totalHours.toFixed(1)} total hrs</Text>

      <View style={styles.spacer} />

      <View style={{ maxWidth: 480 }}>
        <HistoryFilterBar value={filter} onChange={setFilter} />
      </View>

      {filter === 'custom' && (
        <View style={[styles.dateRow, { maxWidth: 480, marginTop: theme.spacing.sm }]}>
          <View style={styles.dateField}>
            <DateField label="From" value={customFrom} onChange={setCustomFrom} maximumDate={customTo ?? new Date()} />
          </View>
          <View style={styles.dateField}>
            <DateField label="To" value={customTo} onChange={setCustomTo} minimumDate={customFrom ?? undefined} maximumDate={new Date()} />
          </View>
        </View>
      )}

      <View style={styles.spacer} />

      {historyQuery.isLoading ? (
        <Loader label="Loading history..." />
      ) : filteredRecords.length === 0 ? (
        <EmptyState icon="calendar-search" title="No attendance records" message="Try a different date range." />
      ) : (
        <Card padded={false}>
          <View style={styles.headerRow}>
            <Text style={[styles.headerCell, styles.dateCol]}>Date</Text>
            <Text style={[styles.headerCell, styles.timeCol]}>Check-In</Text>
            <Text style={[styles.headerCell, styles.timeCol]}>Check-Out</Text>
            <Text style={[styles.headerCell, styles.hoursCol]}>Hours</Text>
          </View>
          {filteredRecords.map((r) => (
            <View key={r.id} style={styles.row}>
              <Text style={[styles.dateCol, styles.cellText]}>{format(parseISO(r.date), 'dd MMM yyyy')}</Text>
              <Text style={[styles.timeCol, styles.cellText]}>
                {r.checkInTime ? format(parseISO(r.checkInTime), 'hh:mm a') : '--:--'}
              </Text>
              <Text style={[styles.timeCol, styles.cellText]}>
                {r.checkOutTime ? format(parseISO(r.checkOutTime), 'hh:mm a') : '--:--'}
              </Text>
              <Text style={[styles.hoursCol, styles.cellText]}>{r.workingHours ?? '--'}</Text>
            </View>
          ))}
        </Card>
      )}
    </ScrollView>
  );
}

function ProfileSection() {
  const { theme } = useWebTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const employee = useAppSelector((s) => s.auth.employee);
  const updateProfileMutation = useUpdateProfile();
  const [phone, setPhone] = useState(employee?.phone ?? '');
  const [sheetVisible, setSheetVisible] = useState(false);
  const [pendingAvatarUri, setPendingAvatarUri] = useState<string | null>(null);

  const avatarUri = pendingAvatarUri ?? employee?.avatarUri;

  const requestAndPick = async (source: 'camera' | 'gallery') => {
    setSheetVisible(false);
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permission.status !== 'granted') {
      showErrorToast('Permission needed', `Allow ${source === 'camera' ? 'camera' : 'photo library'} access to continue.`);
      return;
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7 });

    if (!result.canceled && result.assets?.[0]?.uri) {
      const uri = result.assets[0].uri;
      setPendingAvatarUri(uri);
      try {
        await updateProfileMutation.mutateAsync({ avatarUri: uri });
        showSuccessToast('Profile photo updated');
      } catch (error: any) {
        showErrorToast('Could not update photo', error?.message);
      } finally {
        setPendingAvatarUri(null);
      }
    }
  };

  const onSave = () => {
    updateProfileMutation.mutate(
      { phone },
      {
        onSuccess: () => showSuccessToast('Profile updated'),
        onError: (error: any) => showErrorToast('Could not save changes', error?.message ?? 'Please try again.'),
      },
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Profile</Text>

      <View style={styles.spacer} />

      <Card style={styles.chartCard}>
        <View style={styles.profileHeader}>
          <Pressable
            style={styles.avatarWrapper}
            onPress={() => setSheetVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Change profile photo"
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarLargeImage} />
            ) : (
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarLargeText}>{getInitials(employee?.name)}</Text>
              </View>
            )}
            <View style={styles.editBadge}>
              <MaterialCommunityIcons name="camera" size={16} color={theme.colors.onPrimary} />
            </View>
          </Pressable>
          <View>
            <Text style={styles.detailName}>{employee?.name}</Text>
            <Text style={styles.detailMeta}>{employee?.email}</Text>
            <Text style={styles.detailMeta}>
              {employee?.department} · {employee?.id}
            </Text>
          </View>
        </View>

        <View style={styles.spacer} />

        <View style={styles.profileFormNarrow}>
          <InputField
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="+91 98765 43210"
            keyboardType="phone-pad"
          />

          <AppButton
            label="Save Changes"
            onPress={onSave}
            fullWidth={false}
            loading={updateProfileMutation.isPending && !pendingAvatarUri}
            disabled={phone === employee?.phone}
            style={styles.submitButton}
          />
        </View>
      </Card>

      <ImageSourceSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onPickCamera={() => requestAndPick('camera')}
        onPickGallery={() => requestAndPick('gallery')}
      />
    </ScrollView>
  );
}

function createStyles(theme: WebTheme) {
  return StyleSheet.create({
    root: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: theme.colors.background,
    },
    contentArea: {
      flex: 1,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    topBarRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    avatar: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      ...theme.typography.captionMedium,
      color: theme.colors.textInverse,
    },
    avatarSmall: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarSmallText: {
      ...theme.typography.captionMedium,
      color: theme.colors.textInverse,
    },
    teamRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingVertical: 10,
    },
    userName: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
    },
    pageArea: {
      flex: 1,
    },
    content: {
      padding: theme.spacing.xl,
    },
    heading: {
      ...theme.typography.h1,
      color: theme.colors.textPrimary,
    },
    subheading: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    spacer: {
      height: theme.spacing.lg,
    },
    cardTitle: {
      ...theme.typography.h2,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.md,
    },
    actionCard: {},
    attendanceHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    approvalCard: {
      marginBottom: theme.spacing.sm,
    },
    approvalHeaderRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    approvalActions: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginTop: theme.spacing.md,
    },
    approveButton: {
      minWidth: 150,
    },
    rejectButton: {
      minWidth: 150,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: theme.radius.pill,
    },
    statusBadgePlain: {
      paddingVertical: 3,
      paddingHorizontal: 8,
      borderRadius: theme.radius.pill,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    statusText: {
      ...theme.typography.captionMedium,
    },
    timesRow: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: theme.radius.md,
      padding: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    timeBlock: {
      flex: 1,
      alignItems: 'center',
      gap: 2,
    },
    timeLabel: {
      ...theme.typography.caption,
      color: theme.colors.textMuted,
    },
    timeValue: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
    },
    locationText: {
      ...theme.typography.caption,
      color: theme.colors.textMuted,
      marginBottom: theme.spacing.md,
    },
    doneText: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
    },
    quickActionsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
    },
    quickAction: {
      alignItems: 'center',
      gap: 4,
      width: 80,
    },
    quickActionLabel: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    chartsRow: {
      flexDirection: 'row',
      gap: theme.spacing.lg,
      flexWrap: 'wrap',
    },
    chartCard: {
      flex: 1,
      minWidth: 340,
    },
    chartCardWide: {
      flex: 1.4,
      minWidth: 380,
    },
    fieldLabel: {
      ...theme.typography.captionMedium,
      color: theme.colors.textSecondary,
      marginBottom: 6,
      marginTop: theme.spacing.sm,
    },
    dateRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    dateField: {
      flex: 1,
    },
    aiButton: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 6,
      marginTop: -8,
      marginBottom: theme.spacing.sm,
    },
    aiButtonText: {
      ...theme.typography.captionMedium,
      color: theme.colors.primary,
    },
    aiInsightText: {
      ...theme.typography.caption,
      color: theme.colors.primaryDark,
      backgroundColor: theme.colors.primaryLight,
      borderRadius: theme.radius.sm,
      padding: 8,
      marginTop: 4,
    },
    previewBox: {
      backgroundColor: theme.colors.primaryLight,
      borderRadius: theme.radius.md,
      padding: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
      gap: 4,
    },
    durationText: {
      ...theme.typography.captionMedium,
      color: theme.colors.textPrimary,
    },
    submitButton: {
      marginTop: theme.spacing.sm,
    },
    requestRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      gap: theme.spacing.sm,
    },
    employeeName: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
    },
    reasonText: {
      ...theme.typography.caption,
      color: theme.colors.textMuted,
    },
    headerRow: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerCell: {
      ...theme.typography.captionMedium,
      color: theme.colors.textMuted,
    },
    row: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    dateCol: {
      flex: 1,
    },
    timeCol: {
      flex: 1,
    },
    hoursCol: {
      width: 60,
      textAlign: 'right',
    },
    cellText: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
    },
    profileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    profileFormNarrow: {
      maxWidth: 320,
    },
    avatarWrapper: {
      width: 120,
      height: 120,
    },
    avatarLarge: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarLargeImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
    },
    avatarLargeText: {
      ...theme.typography.h2,
      color: theme.colors.textInverse,
    },
    editBadge: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: theme.colors.surface,
    },
    detailName: {
      ...theme.typography.h1,
      color: theme.colors.textPrimary,
    },
    detailMeta: {
      ...theme.typography.subtitle,
      color: theme.colors.textMuted,
    },
  });
}
