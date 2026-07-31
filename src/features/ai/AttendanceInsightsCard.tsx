import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AdminCard as Card } from '../../admin/components/AdminCard';
import { useWebTheme, type WebTheme } from '../../admin/ThemeContext';
import { useAttendanceInsights } from '../../hooks/useAskAi';

interface AttendanceInsightsCardProps {
  presentRate: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  onLeaveToday: number;
  totalEmployees: number;
  departmentBreakdown: { department: string; employeeCount: number; presentRate: number }[];
}

export function AttendanceInsightsCard(props: AttendanceInsightsCardProps) {
  const { theme } = useWebTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insightsMutation = useAttendanceInsights();

  const generate = () => {
    insightsMutation.mutate({
      presentRate: props.presentRate,
      presentToday: props.presentToday,
      absentToday: props.absentToday,
      lateToday: props.lateToday,
      onLeaveToday: props.onLeaveToday,
      totalEmployees: props.totalEmployees,
      departmentBreakdown: props.departmentBreakdown,
    });
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <MaterialCommunityIcons name="creation" size={18} color={theme.colors.primary} />
          <Text style={styles.cardTitle}>AI Insights</Text>
        </View>
        <Pressable
          onPress={generate}
          disabled={insightsMutation.isPending || props.totalEmployees === 0}
          style={styles.generateButton}
          accessibilityRole="button"
        >
          {insightsMutation.isPending ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Text style={styles.generateButtonText}>
              {insightsMutation.data ? 'Regenerate' : 'Generate summary'}
            </Text>
          )}
        </Pressable>
      </View>

      {props.totalEmployees === 0 ? (
        <Text style={styles.mutedText}>No employees yet — insights will appear once people register.</Text>
      ) : insightsMutation.isError ? (
        <Text style={styles.errorText}>{(insightsMutation.error as any)?.message ?? 'Could not generate insights.'}</Text>
      ) : insightsMutation.data ? (
        <Text style={styles.bodyText}>{insightsMutation.data}</Text>
      ) : (
        <Text style={styles.mutedText}>Generate an AI summary of today's attendance patterns.</Text>
      )}
    </Card>
  );
}

function createStyles(theme: WebTheme) {
  return StyleSheet.create({
    card: {
      marginBottom: theme.spacing.lg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    headerTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    cardTitle: {
      ...theme.typography.h2,
      color: theme.colors.textPrimary,
    },
    generateButton: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 6,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primaryLight,
    },
    generateButtonText: {
      ...theme.typography.captionMedium,
      color: theme.colors.primary,
    },
    bodyText: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
    },
    mutedText: {
      ...theme.typography.body,
      color: theme.colors.textMuted,
    },
    errorText: {
      ...theme.typography.body,
      color: theme.colors.danger,
    },
  });
}
