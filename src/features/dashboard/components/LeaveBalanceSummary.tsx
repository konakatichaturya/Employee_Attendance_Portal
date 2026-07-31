import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../../../components/Card';
import { ProgressRing } from '../../../components/ProgressRing';
import { useTheme, type Theme } from '../../../theme/ThemeContext';
import type { LeaveBalance } from '../../../types';

interface LeaveBalanceSummaryProps {
  balances: LeaveBalance[];
}

function colorFor(type: LeaveBalance['type'], theme: Theme): string {
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

export function LeaveBalanceSummary({ balances }: LeaveBalanceSummaryProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const applicable = balances.filter((b) => b.type !== 'Unpaid');

  return (
    <Card>
      <Text style={styles.heading}>Leave Balance</Text>
      <View style={styles.row}>
        {applicable.map((b) => {
          const remaining = b.total - b.used;
          const progress = b.total > 0 ? b.used / b.total : 0;
          const color = colorFor(b.type, theme);
          return (
            <View key={b.type} style={styles.ringBlock}>
              <ProgressRing
                progress={progress}
                size={72}
                strokeWidth={7}
                color={color}
                centerLabel={`${remaining}`}
                centerSubLabel="left"
              />
              <Text style={[styles.ringLabel, { color }]}>{b.type}</Text>
              <Text style={styles.ringSubLabel}>
                {b.used}/{b.total} used
              </Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
  heading: {
    ...theme.typography.subtitle,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ringBlock: {
    alignItems: 'center',
    gap: 4,
  },
  ringLabel: {
    ...theme.typography.captionMedium,
  },
  ringSubLabel: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  });
}
