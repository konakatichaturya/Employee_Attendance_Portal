import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { format, parseISO } from 'date-fns';
import { AdminCard as Card } from '../components/AdminCard';
import { AdminLoader as Loader } from '../components/AdminLoader';
import { AdminEmptyState as EmptyState } from '../components/AdminEmptyState';
import { useWebTheme, type WebTheme } from '../ThemeContext';
import { useAdminLeaveRequests } from '../hooks/useAdminData';
import type { LeaveStatus } from '../../types';

export function LeaveRequestsPage() {
  const { theme } = useWebTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const statusColors: Record<LeaveStatus, { bg: string; text: string }> = {
    Pending: { bg: theme.colors.warningBg, text: theme.colors.warning },
    Approved: { bg: theme.colors.successBg, text: theme.colors.success },
    Rejected: { bg: theme.colors.dangerBg, text: theme.colors.danger },
  };

  const requestsQuery = useAdminLeaveRequests();
  const requests = requestsQuery.data ?? [];

  if (requestsQuery.isLoading) {
    return <Loader label="Loading leave requests..." />;
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Leave Requests</Text>
      <Text style={styles.subheading}>
        Read-only view of every leave request across the company. Approval happens through each employee's
        manager — admin does not action requests directly.
      </Text>

      {requests.length === 0 ? (
        <EmptyState
          icon="calendar-clock-outline"
          title="No leave requests yet"
          message="Requests will appear here once employees apply for leave in the mobile app."
        />
      ) : (
        <Card padded={false}>
          <View style={styles.headerRow}>
            <Text style={[styles.headerCell, styles.employeeCol]}>Employee</Text>
            <Text style={[styles.headerCell, styles.typeCol]}>Type</Text>
            <Text style={[styles.headerCell, styles.dateCol]}>From</Text>
            <Text style={[styles.headerCell, styles.dateCol]}>To</Text>
            <Text style={[styles.headerCell, styles.daysCol]}>Days</Text>
            <Text style={[styles.headerCell, styles.statusCol]}>Status</Text>
            <Text style={[styles.headerCell, styles.actionCol]}>Awaiting</Text>
          </View>

          {requests.map((req) => {
            const colors = statusColors[req.status];
            const awaiting = req.status === 'Pending' ? 'Manager' : '—';
            return (
              <View key={req.id} style={styles.row}>
                <View style={styles.employeeCol}>
                  <Text style={styles.employeeName}>{req.employeeName}</Text>
                  <Text style={styles.reasonText} numberOfLines={1}>
                    {req.reason}
                  </Text>
                </View>
                <Text style={[styles.typeCol, styles.cellText]}>{req.type}</Text>
                <Text style={[styles.dateCol, styles.cellText]}>{format(parseISO(req.fromDate), 'dd MMM')}</Text>
                <Text style={[styles.dateCol, styles.cellText]}>{format(parseISO(req.toDate), 'dd MMM')}</Text>
                <Text style={[styles.daysCol, styles.cellText]}>{req.days}</Text>
                <View style={styles.statusCol}>
                  <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
                    <Text style={[styles.statusText, { color: colors.text }]}>{req.status}</Text>
                  </View>
                </View>
                <Text style={[styles.actionCol, styles.cellText]}>{awaiting}</Text>
              </View>
            );
          })}
        </Card>
      )}
    </ScrollView>
  );
}

function createStyles(theme: WebTheme) {
  return StyleSheet.create({
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
      marginBottom: theme.spacing.lg,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
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
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    employeeCol: {
      flex: 2,
    },
    typeCol: {
      flex: 1,
    },
    dateCol: {
      flex: 1,
    },
    daysCol: {
      width: 50,
    },
    statusCol: {
      flex: 1,
    },
    actionCol: {
      width: 80,
    },
    employeeName: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
    },
    reasonText: {
      ...theme.typography.caption,
      color: theme.colors.textMuted,
    },
    cellText: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
    },
    statusBadge: {
      alignSelf: 'flex-start',
      paddingVertical: 3,
      paddingHorizontal: 8,
      borderRadius: theme.radius.pill,
    },
    statusText: {
      ...theme.typography.captionMedium,
    },
  });
}
