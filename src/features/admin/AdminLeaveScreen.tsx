import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { format, parseISO } from 'date-fns';
import { Screen } from '../../components/Screen';
import { GlassCard } from '../../components/GlassCard';
import { Loader } from '../../components/Loader';
import { EmptyState } from '../../components/EmptyState';
import { VideoHero } from '../../components/VideoHero';
import { GradientBlobBackdrop } from '../../components/GradientBlobBackdrop';
import { useTheme, type Theme } from '../../theme/ThemeContext';
import { useAdminLeaveRequests } from '../../admin/hooks/useAdminData';
import { NATIVE_VIDEO } from '../../constants/nativeMedia';
import type { LeaveStatus } from '../../types';

export function AdminLeaveScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const STATUS_META: Record<LeaveStatus, { color: string; bg: string }> = useMemo(
    () => ({
      Pending: { color: theme.colors.warning, bg: theme.colors.warningBg },
      Approved: { color: theme.colors.success, bg: theme.colors.successBg },
      Rejected: { color: theme.colors.danger, bg: theme.colors.dangerBg },
    }),
    [theme],
  );
  const requestsQuery = useAdminLeaveRequests();
  const requests = requestsQuery.data ?? [];

  return (
    <Screen edges={['top', 'left', 'right']}>
      <GradientBlobBackdrop />
      <ScrollView contentContainerStyle={styles.content}>
        <VideoHero
          theme={theme}
          title="Leave Requests"
          subtitle="Read-only — approval flows through each employee's manager"
          videoSrc={NATIVE_VIDEO.leave}
          height={120}
        />
        <View style={styles.heroSpacer} />

        {requestsQuery.isLoading ? (
          <Loader label="Loading leave requests..." />
        ) : requests.length === 0 ? (
          <EmptyState icon="calendar-clock-outline" title="No leave requests yet" />
        ) : (
          requests.map((req) => {
            const meta = STATUS_META[req.status];
            const awaiting = req.status === 'Pending' ? 'Manager' : '—';
            return (
              <GlassCard key={req.id} style={styles.card}>
                <View style={styles.headerRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{req.employeeName}</Text>
                    <Text style={styles.meta}>
                      {req.type} leave • {req.days} day{req.days > 1 ? 's' : ''} • {format(parseISO(req.fromDate), 'dd MMM')} –{' '}
                      {format(parseISO(req.toDate), 'dd MMM')}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
                    <Text style={[styles.statusText, { color: meta.color }]}>{req.status}</Text>
                  </View>
                </View>
                {awaiting !== '—' && <Text style={styles.awaiting}>Awaiting: {awaiting}</Text>}
              </GlassCard>
            );
          })
        )}
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
  heroSpacer: {
    height: theme.spacing.md,
  },
  subheading: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: 2,
    marginBottom: theme.spacing.md,
  },
  card: {
    marginBottom: theme.spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  name: {
    ...theme.typography.bodyMedium,
    color: theme.colors.textPrimary,
  },
  meta: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: theme.radius.pill,
  },
  statusText: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
  awaiting: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  });
}
