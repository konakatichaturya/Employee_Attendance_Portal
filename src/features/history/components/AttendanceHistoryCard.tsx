import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { format, parseISO } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from '../../../components/Card';
import { useTheme, type Theme } from '../../../theme/ThemeContext';
import type { AttendanceRecord } from '../../../types';

export function AttendanceHistoryCard({ record }: { record: AttendanceRecord }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <Animated.View entering={FadeIn.duration(220)}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.dateBlock}>
            <Text style={styles.day}>{format(parseISO(record.date), 'dd')}</Text>
            <Text style={styles.month}>{format(parseISO(record.date), 'MMM')}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.details}>
            <Text style={styles.weekday}>{format(parseISO(record.date), 'EEEE')}</Text>
            <View style={styles.timesRow}>
              <View style={styles.timeItem}>
                <MaterialCommunityIcons name="login" size={14} color={theme.colors.success} />
                <Text style={styles.timeText}>
                  {record.checkInTime ? format(parseISO(record.checkInTime), 'hh:mm a') : '--:--'}
                </Text>
              </View>
              <View style={styles.timeItem}>
                <MaterialCommunityIcons name="logout" size={14} color={theme.colors.danger} />
                <Text style={styles.timeText}>
                  {record.checkOutTime ? format(parseISO(record.checkOutTime), 'hh:mm a') : '--:--'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.hoursBlock}>
            <Text style={styles.hoursValue}>{record.workingHours ?? '--'}</Text>
            <Text style={styles.hoursLabel}>hrs</Text>
          </View>
        </View>
      </Card>
    </Animated.View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    card: {
      marginBottom: theme.spacing.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    dateBlock: {
      width: 44,
      alignItems: 'center',
    },
    day: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
    },
    month: {
      ...theme.typography.caption,
      color: theme.colors.textMuted,
      textTransform: 'uppercase',
    },
    divider: {
      width: 1,
      height: 36,
      backgroundColor: theme.colors.border,
      marginHorizontal: theme.spacing.sm,
    },
    details: {
      flex: 1,
    },
    weekday: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
      marginBottom: 4,
    },
    timesRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    timeItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    timeText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
    hoursBlock: {
      alignItems: 'center',
      minWidth: 40,
    },
    hoursValue: {
      ...theme.typography.subtitle,
      color: theme.colors.primary,
    },
    hoursLabel: {
      ...theme.typography.caption,
      color: theme.colors.textMuted,
    },
  });
}
