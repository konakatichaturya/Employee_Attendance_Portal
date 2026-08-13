import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { format, parseISO } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GlassCard } from '../../../components/GlassCard';
import { AppButton } from '../../../components/AppButton';
import { TimeBadge } from '../../../components/TimeBadge';
import { LocationMapPreview } from './LocationMapPreview';
import { HourTimelineBar } from './HourTimelineBar';
import { useTheme, type Theme } from '../../../theme/ThemeContext';
import type { AttendanceRecord } from '../../../types';

const SHIFT_START_HOUR = 9;
const SHIFT_GRACE_HOUR = 10;
const TIMELINE_START_HOUR = 8;
const TIMELINE_END_HOUR = 20;

interface AttendanceStatusCardProps {
  record: AttendanceRecord | null | undefined;
  onCheckIn: () => void;
  onCheckOut: () => void;
  loading: boolean;
}

function punctualityLabel(date: Date, theme: Theme): { label: string; color: string } {
  const hour = date.getHours() + date.getMinutes() / 60;
  if (hour < SHIFT_START_HOUR) return { label: 'Early', color: theme.colors.success };
  if (hour < SHIFT_GRACE_HOUR) return { label: 'On time', color: theme.colors.success };
  return { label: 'Late', color: theme.colors.warning };
}

function elapsedHoursLabel(from: Date, to: Date): string {
  const hours = (to.getTime() - from.getTime()) / 3600000;
  return hours.toFixed(2);
}

export function AttendanceStatusCard({ record, onCheckIn, onCheckOut, loading }: AttendanceStatusCardProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const hasCheckedIn = !!record?.checkInTime;
  const hasCheckedOut = !!record?.checkOutTime;
  const now = new Date();

  const checkInDate = record?.checkInTime ? parseISO(record.checkInTime) : null;
  const checkOutDate = record?.checkOutTime ? parseISO(record.checkOutTime) : null;

  return (
    <GlassCard>
      <Text style={styles.dateText}>{format(now, 'EEE, dd MMM').toUpperCase()}</Text>

      {record?.pendingSync && (
        <View style={styles.pendingBanner}>
          <MaterialCommunityIcons name="cloud-sync-outline" size={16} color={theme.colors.warning} />
          <Text style={styles.pendingBannerText}>Saved offline — will sync automatically when you're back online</Text>
        </View>
      )}

      {!hasCheckedIn && (
        <View style={styles.heroWrapper}>
          <TimeBadge theme={theme} mainText={format(now, 'h:mm')} unit={format(now, 'a')} />
          <Text style={[styles.heroStatus, { color: punctualityLabel(now, theme).color }]}>
            {punctualityLabel(now, theme).label}
          </Text>
        </View>
      )}

      {hasCheckedIn && (
        <View style={styles.heroWrapper}>
          <TimeBadge
            theme={theme}
            mainText={elapsedHoursLabel(checkInDate!, checkOutDate ?? now)}
            unit="HRS"
            tone="success"
          />
          <Text style={styles.heroCaption}>
            {hasCheckedOut ? 'Checked out at' : 'Since first in at'}{' '}
            {format(hasCheckedOut ? checkOutDate! : checkInDate!, 'h:mm a')}
          </Text>
        </View>
      )}

      <View style={styles.timelineWrapper}>
        <HourTimelineBar
          startHour={TIMELINE_START_HOUR}
          endHour={TIMELINE_END_HOUR}
          checkInTime={checkInDate}
          checkOutTime={checkOutDate}
        />
      </View>

      <View style={styles.shiftRow}>
        <MaterialCommunityIcons name="clock-time-four-outline" size={14} color={theme.colors.textMuted} />
        <Text style={styles.shiftText}>
          <Text style={styles.shiftLabel}>WORKING HOURS  </Text>
          Starts 9:00 AM–10:00 AM & Ends 6:00 PM–7:00 PM
        </Text>
      </View>

      {!!record?.checkInLocation && (
        <>
          <Text style={styles.locationLabel}>Check-in location</Text>
          <LocationMapPreview location={record.checkInLocation} label="Check-in location" />
        </>
      )}
      {!!record?.checkOutLocation && (
        <>
          <Text style={styles.locationLabel}>Check-out location</Text>
          <LocationMapPreview location={record.checkOutLocation} label="Check-out location" />
        </>
      )}

      {!hasCheckedOut && (
        <AppButton
          label={hasCheckedIn ? 'Clock Out' : 'Clock In'}
          onPress={hasCheckedIn ? onCheckOut : onCheckIn}
          variant={hasCheckedIn ? 'secondary' : 'success'}
          size="lg"
          loading={loading}
          style={styles.actionButton}
          icon={
            <MaterialCommunityIcons
              name={hasCheckedIn ? 'logout' : 'login'}
              size={20}
              color={theme.colors.textInverse}
            />
          }
        />
      )}
    </GlassCard>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
  dateText: {
    ...theme.typography.captionMedium,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.sm,
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.warningBg,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  pendingBannerText: {
    ...theme.typography.caption,
    color: theme.colors.warning,
    flexShrink: 1,
  },
  heroWrapper: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  heroStatus: {
    ...theme.typography.bodyMedium,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  heroCaption: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  timelineWrapper: {
    marginBottom: theme.spacing.md,
  },
  shiftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: theme.spacing.md,
  },
  shiftText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    flexShrink: 1,
  },
  locationLabel: {
    ...theme.typography.captionMedium,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  shiftLabel: {
    color: theme.colors.textMuted,
    fontWeight: '700',
  },
  actionButton: {
    marginTop: 4,
  },
  });
}
