import React, { useMemo } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format, parseISO } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { GlassCard } from '../../components/GlassCard';
import { Loader } from '../../components/Loader';
import { EmptyState } from '../../components/EmptyState';
import { VideoHero } from '../../components/VideoHero';
import { GradientBlobBackdrop } from '../../components/GradientBlobBackdrop';
import { useTheme, type Theme } from '../../theme/ThemeContext';
import { useLeaveRequests } from '../../hooks/useLeaveQueries';
import { NATIVE_VIDEO } from '../../constants/nativeMedia';
import type { LeaveRequest, LeaveStatus } from '../../types';
import type { LeaveStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<LeaveStackParamList>;

function statusColor(status: LeaveStatus, theme: Theme) {
  switch (status) {
    case 'Approved':
      return { fg: theme.colors.success, bg: theme.colors.successBg };
    case 'Rejected':
      return { fg: theme.colors.danger, bg: theme.colors.dangerBg };
    default:
      return { fg: theme.colors.warning, bg: theme.colors.warningBg };
  }
}

function LeaveRequestCard({ item }: { item: LeaveRequest }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const colors = statusColor(item.status, theme);
  return (
    <GlassCard style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.type}>{item.type} Leave</Text>
        <View style={[styles.badge, { backgroundColor: colors.bg }]}>
          <Text style={[styles.badgeText, { color: colors.fg }]}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.dateRange}>
        {format(parseISO(item.fromDate), 'dd MMM yyyy')} → {format(parseISO(item.toDate), 'dd MMM yyyy')} ·{' '}
        {item.days} day{item.days > 1 ? 's' : ''}
      </Text>
      <Text style={styles.reason} numberOfLines={2}>
        {item.reason}
      </Text>
    </GlassCard>
  );
}

export function LeaveStatusScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<Nav>();
  const requestsQuery = useLeaveRequests();

  if (requestsQuery.isLoading) {
    return <Loader fullScreen label="Loading leave requests..." />;
  }

  return (
    <Screen>
      <GradientBlobBackdrop />
      <FlatList
        data={requestsQuery.data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <LeaveRequestCard item={item} />}
        refreshControl={
          <RefreshControl refreshing={requestsQuery.isRefetching} onRefresh={() => requestsQuery.refetch()} />
        }
        ListHeaderComponent={
          <VideoHero
            theme={theme}
            title="Leave Requests"
            subtitle="Track every request you've submitted"
            videoSrc={NATIVE_VIDEO.leave}
            height={120}
            right={
              <Pressable
                style={styles.newButton}
                onPress={() => navigation.navigate('ApplyLeave')}
                accessibilityRole="button"
                accessibilityLabel="Apply for leave"
              >
                <MaterialCommunityIcons name="plus" size={18} color={theme.colors.onPrimary} />
                <Text style={styles.newButtonText}>Apply</Text>
              </Pressable>
            }
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="calendar-blank-outline"
            title="No leave requests yet"
            message="Tap Apply to submit your first leave request."
          />
        }
      />
    </Screen>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.xs,
    },
    heading: {
      ...theme.typography.h2,
      color: theme.colors.textPrimary,
    },
    newButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: theme.colors.primary,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: theme.radius.pill,
    },
    newButtonText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.onPrimary,
    },
    listContent: {
      padding: theme.spacing.md,
      flexGrow: 1,
    },
    card: {
      marginBottom: theme.spacing.sm,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    type: {
      ...theme.typography.subtitle,
      color: theme.colors.textPrimary,
    },
    badge: {
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: theme.radius.pill,
    },
    badgeText: {
      ...theme.typography.captionMedium,
    },
    dateRange: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    reason: {
      ...theme.typography.caption,
      color: theme.colors.textMuted,
    },
  });
}
