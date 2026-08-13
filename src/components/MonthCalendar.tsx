import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import type { SharedTheme } from '../theme';
import type { CalendarEvent } from '../types';

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface MonthCalendarProps {
  theme: SharedTheme;
  events: CalendarEvent[];
  selectedDate: string; // yyyy-MM-dd
  onSelectDate: (date: string) => void;
}

// Plain-RN month grid — no calendar library is installed, and none is needed
// for a simple day-picker with event dots, so this is built once and shared
// by every native and web surface that needs to browse holidays/meetings.
export function MonthCalendar({ theme, events, selectedDate, onSelectDate }: MonthCalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(selectedDate));
  const styles = useMemo(() => createStyles(theme), [theme]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const list = map.get(event.date) ?? [];
      list.push(event);
      map.set(event.date, list);
    }
    return map;
  }, [events]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(visibleMonth));
    const end = endOfWeek(endOfMonth(visibleMonth));
    return eachDayOfInterval({ start, end });
  }, [visibleMonth]);

  return (
    <View>
      <View style={styles.header}>
        <Pressable
          onPress={() => setVisibleMonth((m) => subMonths(m, 1))}
          style={styles.navButton}
          accessibilityRole="button"
          accessibilityLabel="Previous month"
        >
          <MaterialCommunityIcons name="chevron-left" size={22} color={theme.colors.textSecondary} />
        </Pressable>
        <Text style={styles.monthLabel}>{format(visibleMonth, 'MMMM yyyy')}</Text>
        <Pressable
          onPress={() => setVisibleMonth((m) => addMonths(m, 1))}
          style={styles.navButton}
          accessibilityRole="button"
          accessibilityLabel="Next month"
        >
          <MaterialCommunityIcons name="chevron-right" size={22} color={theme.colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((label, index) => (
          <Text key={`${label}-${index}`} style={styles.weekdayLabel}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayEvents = eventsByDate.get(dateStr) ?? [];
          const inMonth = isSameMonth(day, visibleMonth);
          const selected = isSameDay(day, new Date(selectedDate));
          const todayFlag = isToday(day);
          const hasHoliday = dayEvents.some((e) => e.type === 'holiday');
          const hasMeeting = dayEvents.some((e) => e.type === 'meeting');

          return (
            <Pressable
              key={dateStr}
              onPress={() => onSelectDate(dateStr)}
              style={[styles.dayCell, selected && styles.dayCellSelected]}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.dayText,
                  !inMonth && styles.dayTextMuted,
                  selected && styles.dayTextSelected,
                  todayFlag && !selected && styles.dayTextToday,
                ]}
              >
                {format(day, 'd')}
              </Text>
              {(hasHoliday || hasMeeting) && (
                <View style={styles.dotRow}>
                  {hasHoliday && <View style={[styles.dot, { backgroundColor: theme.colors.danger }]} />}
                  {hasMeeting && <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function createStyles(theme: SharedTheme) {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    navButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceAlt,
    },
    monthLabel: {
      ...theme.typography.subtitle,
      color: theme.colors.textPrimary,
    },
    weekdayRow: {
      flexDirection: 'row',
      marginBottom: 4,
    },
    weekdayLabel: {
      flex: 1,
      textAlign: 'center',
      ...theme.typography.captionMedium,
      color: theme.colors.textMuted,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    dayCell: {
      width: `${100 / 7}%`,
      aspectRatio: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radius.md,
      marginBottom: 2,
    },
    dayCellSelected: {
      backgroundColor: theme.colors.primary,
    },
    dayText: {
      ...theme.typography.body,
      color: theme.colors.textPrimary,
    },
    dayTextMuted: {
      color: theme.colors.textMuted,
    },
    dayTextSelected: {
      color: theme.colors.onPrimary,
      fontWeight: '700',
    },
    dayTextToday: {
      color: theme.colors.primary,
      fontWeight: '700',
    },
    dotRow: {
      flexDirection: 'row',
      gap: 3,
      marginTop: 2,
      height: 5,
    },
    dot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
    },
  });
}
