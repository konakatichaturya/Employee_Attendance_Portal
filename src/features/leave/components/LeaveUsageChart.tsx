import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DonutChart } from '../../../admin/components/DonutChart';
import { useWebTheme, type WebTheme } from '../../../admin/ThemeContext';
import type { LeaveBalance } from '../../../types';

interface LeaveUsageChartProps {
  balances: LeaveBalance[];
}

function colorFor(theme: WebTheme, type: LeaveBalance['type']): string {
  switch (type) {
    case 'Casual':
      return theme.colors.primary;
    case 'Sick':
      return theme.colors.warning;
    case 'Earned':
      return theme.colors.success;
    default:
      return theme.colors.textMuted;
  }
}

export function LeaveUsageChart({ balances }: LeaveUsageChartProps) {
  const { theme } = useWebTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const applicable = balances.filter((b) => b.type !== 'Unpaid');
  const totalUsed = applicable.reduce((sum, b) => sum + b.used, 0);
  const leastUsed = applicable.length > 0 ? [...applicable].sort((a, b) => a.used - b.used)[0] : null;

  return (
    <View>
      <Text style={styles.cardTitle}>Leave Usage</Text>
      <View style={styles.chartRow}>
        <DonutChart
          segments={applicable.map((b) => ({ label: b.type, value: b.used, color: colorFor(theme, b.type) }))}
          centerValue={`${totalUsed}`}
          centerLabel="days used"
          size={120}
          strokeWidth={16}
        />
        <View style={styles.legend}>
          {applicable.map((b) => {
            const remaining = b.total - b.used;
            return (
              <View key={b.type} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: colorFor(theme, b.type) }]} />
                <Text style={styles.legendLabel}>{b.type}</Text>
                <Text style={styles.legendValue}>
                  {b.used}/{b.total} used · {remaining} left
                </Text>
              </View>
            );
          })}
        </View>
      </View>
      {leastUsed && (
        <View style={styles.leastUsedBadge}>
          <Text style={styles.leastUsedText}>
            Least used: {leastUsed.type} ({leastUsed.used} of {leastUsed.total} days used)
          </Text>
        </View>
      )}
    </View>
  );
}

function createStyles(theme: WebTheme) {
  return StyleSheet.create({
    cardTitle: {
      ...theme.typography.h2,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.md,
    },
    chartRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.lg,
    },
    legend: {
      flex: 1,
      gap: theme.spacing.sm,
    },
    legendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    legendDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    legendLabel: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      width: 60,
    },
    legendValue: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
      flexShrink: 1,
    },
    leastUsedBadge: {
      marginTop: theme.spacing.md,
      backgroundColor: theme.colors.primaryLight,
      borderRadius: theme.radius.md,
      padding: theme.spacing.sm,
    },
    leastUsedText: {
      ...theme.typography.captionMedium,
      color: theme.colors.primaryDark,
    },
  });
}
