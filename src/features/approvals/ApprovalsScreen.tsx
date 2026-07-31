import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { AppButton } from '../../components/AppButton';
import { Loader } from '../../components/Loader';
import { EmptyState } from '../../components/EmptyState';
import { useTheme, type Theme } from '../../theme/ThemeContext';
import { useDecideAsManager, usePendingApprovalsForManager } from '../../admin/hooks/useApprovals';
import { showErrorToast, showSuccessToast } from '../../components/toast';
import type { LeaveRequest } from '../../types';

export function ApprovalsScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const approvalsQuery = usePendingApprovalsForManager();
  const decideAsManager = useDecideAsManager();

  const isLoading = approvalsQuery.isLoading;
  const approvals: (LeaveRequest & { employeeId: string; employeeName: string })[] = approvalsQuery.data ?? [];
  const isSubmitting = decideAsManager.isPending;

  const decide = (requestId: string, employeeId: string, decision: 'approve' | 'reject') => {
    decideAsManager.mutate(
      { employeeId, requestId, decision },
      {
        onSuccess: () => showSuccessToast(decision === 'approve' ? 'Request approved' : 'Request rejected'),
        onError: (error: any) => showErrorToast('Could not update request', error?.message ?? 'Please try again.'),
      },
    );
  };

  return (
    <Screen edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Approvals</Text>
        <Text style={styles.subheading}>Leave requests from your direct reports.</Text>

        {isLoading ? (
          <Loader label="Loading approvals..." />
        ) : approvals.length === 0 ? (
          <EmptyState
            icon="clipboard-check-outline"
            title="Nothing to review"
            message="You don't have any leave requests awaiting your decision right now."
          />
        ) : (
          approvals.map((item) => (
            <Card key={item.id} style={styles.card}>
              <View style={styles.headerRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.employeeName}</Text>
                  <Text style={styles.meta}>
                    {item.type} leave • {item.days} day{item.days > 1 ? 's' : ''} • {item.fromDate} to {item.toDate}
                  </Text>
                </View>
                <MaterialCommunityIcons name="calendar-clock-outline" size={20} color={theme.colors.primary} />
              </View>
              <Text style={styles.reason}>{item.reason}</Text>

              <View style={styles.actions}>
                <AppButton
                  label="Approve"
                  variant="success"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  style={styles.actionButton}
                  onPress={() => decide(item.id, item.employeeId, 'approve')}
                />
                <AppButton
                  label="Reject"
                  variant="danger"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  style={styles.actionButton}
                  onPress={() => decide(item.id, item.employeeId, 'reject')}
                />
              </View>
            </Card>
          ))
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
    heading: {
      ...theme.typography.h2,
      color: theme.colors.textPrimary,
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
      marginBottom: 4,
    },
    name: {
      ...theme.typography.subtitle,
      color: theme.colors.textPrimary,
    },
    meta: {
      ...theme.typography.caption,
      color: theme.colors.textMuted,
    },
    reason: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      marginTop: 4,
      marginBottom: theme.spacing.sm,
    },
    actions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    actionButton: {
      flex: 1,
    },
  });
}
