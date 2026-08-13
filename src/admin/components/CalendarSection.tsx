import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { format } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWebTheme, type WebTheme } from '../ThemeContext';
import { AdminCard as Card } from './AdminCard';
import { AdminLoader as Loader } from './AdminLoader';
import { AdminEmptyState as EmptyState } from './AdminEmptyState';
import { DashboardHero } from './DashboardHero';
import { DropdownField } from './DropdownField';
import { AppButton } from '../../components/AppButton';
import { InputField } from '../../components/InputField';
import { DateField } from '../../components/DateField';
import { MonthCalendar } from '../../components/MonthCalendar';
import { useCalendarEvents, useCreateCalendarEvent, useDeleteCalendarEvent } from '../../hooks/useCalendarQueries';
import { showErrorToast, showSuccessToast } from '../../components/toast';
import type { CalendarEvent, CalendarEventType } from '../../types';

const TYPE_META: Record<CalendarEventType, { label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap; color: (t: WebTheme) => string }> = {
  holiday: { label: 'Holiday', icon: 'beach', color: (t) => t.colors.danger },
  meeting: { label: 'Meeting', icon: 'account-group', color: (t) => t.colors.primary },
};

interface CalendarSectionProps {
  manageable?: boolean;
}

// Shared by both web surfaces: read-only inside EmployeeWebDashboard, with
// add/delete controls enabled inside the admin console (AdminDashboard).
export function CalendarSection({ manageable = false }: CalendarSectionProps) {
  const { theme } = useWebTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const eventsQuery = useCalendarEvents();
  const events = eventsQuery.data ?? [];
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [formVisible, setFormVisible] = useState(false);

  const dayEvents = events.filter((e) => e.date === selectedDate);
  const upcoming = events.filter((e) => e.date >= format(new Date(), 'yyyy-MM-dd')).slice(0, 8);

  if (eventsQuery.isLoading) {
    return <Loader label="Loading calendar..." />;
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <DashboardHero
        theme={theme}
        title="Calendar"
        subtitle="Company holidays and meetings"
        videoSrc="/videos/hero-calendar-desk.mp4"
        compact
        highlight
        right={
          manageable ? (
            <AppButton
              label="Add Event"
              onPress={() => setFormVisible(true)}
              fullWidth={false}
              icon={<MaterialCommunityIcons name="plus" size={18} color={theme.colors.onPrimary} />}
            />
          ) : undefined
        }
      />

      <View style={styles.layoutRow}>
        <Card style={styles.calendarCard}>
          <MonthCalendar theme={theme} events={events} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        </Card>

        <Card style={styles.listCard}>
          <Text style={styles.sectionHeading}>{format(new Date(selectedDate), 'EEEE, dd MMMM')}</Text>
          {dayEvents.length === 0 ? (
            <Text style={styles.emptyDayText}>No events on this day.</Text>
          ) : (
            dayEvents.map((event, index) => (
              <EventRow key={event.id} event={event} manageable={manageable} last={index === dayEvents.length - 1} />
            ))
          )}

          <View style={styles.sectionSpacer} />

          <Text style={styles.sectionHeading}>Upcoming</Text>
          {upcoming.length === 0 ? (
            <EmptyState icon="calendar-blank-outline" title="No upcoming events" />
          ) : (
            upcoming.map((event, index) => (
              <EventRow key={event.id} event={event} manageable={manageable} last={index === upcoming.length - 1} showDate />
            ))
          )}
        </Card>
      </View>

      {manageable && (
        <AddEventModal visible={formVisible} defaultDate={selectedDate} onClose={() => setFormVisible(false)} />
      )}
    </ScrollView>
  );
}

function EventRow({
  event,
  manageable,
  last,
  showDate,
}: {
  event: CalendarEvent;
  manageable: boolean;
  last: boolean;
  showDate?: boolean;
}) {
  const { theme } = useWebTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const deleteEvent = useDeleteCalendarEvent();
  const meta = TYPE_META[event.type];

  const onDelete = () => {
    deleteEvent.mutate(event.id, {
      onSuccess: () => showSuccessToast('Event removed'),
      onError: (error: any) => showErrorToast('Could not remove event', error?.message ?? 'Please try again.'),
    });
  };

  return (
    <View style={[styles.eventRow, !last && styles.eventRowBorder]}>
      <View style={[styles.eventIcon, { backgroundColor: `${meta.color(theme)}1A` }]}>
        <MaterialCommunityIcons name={meta.icon} size={16} color={meta.color(theme)} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventMeta}>
          {meta.label}
          {showDate ? ` · ${format(new Date(event.date), 'dd MMM yyyy')}` : ''}
          {event.description ? ` · ${event.description}` : ''}
        </Text>
      </View>
      {manageable && (
        <Pressable onPress={onDelete} disabled={deleteEvent.isPending} accessibilityRole="button" accessibilityLabel="Delete event">
          <MaterialCommunityIcons name="trash-can-outline" size={16} color={theme.colors.textMuted} />
        </Pressable>
      )}
    </View>
  );
}

function AddEventModal({ visible, defaultDate, onClose }: { visible: boolean; defaultDate: string; onClose: () => void }) {
  const { theme } = useWebTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const createEvent = useCreateCalendarEvent();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<CalendarEventType>('holiday');
  const [date, setDate] = useState<Date>(new Date(defaultDate));
  const [description, setDescription] = useState('');

  const isValid = title.trim().length > 0;

  const reset = () => {
    setTitle('');
    setType('holiday');
    setDate(new Date(defaultDate));
    setDescription('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = () => {
    createEvent.mutate(
      { title, type, date: format(date, 'yyyy-MM-dd'), description: description || undefined },
      {
        onSuccess: () => {
          showSuccessToast('Event added');
          handleClose();
        },
        onError: (error: any) => showErrorToast('Could not add event', error?.message ?? 'Please try again.'),
      },
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} accessibilityElementsHidden />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Add Calendar Event</Text>

          <ScrollView style={styles.sheetForm} showsVerticalScrollIndicator={false}>
            <InputField label="Title" value={title} onChangeText={setTitle} placeholder="Diwali" />
            <DropdownField
              label="Type"
              value={type}
              onChange={(v) => setType(v as CalendarEventType)}
              options={[
                { value: 'holiday', label: 'Holiday' },
                { value: 'meeting', label: 'Meeting' },
              ]}
            />
            <DateField label="Date" value={date} onChange={setDate} />
            <InputField
              label="Description (optional)"
              value={description}
              onChangeText={setDescription}
              placeholder="Add details for your team"
              multiline
              numberOfLines={3}
            />
          </ScrollView>

          <View style={styles.sheetActions}>
            <AppButton label="Cancel" variant="outline" onPress={handleClose} style={styles.sheetButton} disabled={createEvent.isPending} />
            <AppButton
              label="Add Event"
              onPress={onSubmit}
              style={styles.sheetButton}
              loading={createEvent.isPending}
              disabled={!isValid || createEvent.isPending}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(theme: WebTheme) {
  return StyleSheet.create({
    content: {
      padding: theme.spacing.xl,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.lg,
    },
    heading: {
      ...theme.typography.h1,
      color: theme.colors.textPrimary,
    },
    subheading: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    layoutRow: {
      flexDirection: 'row',
      gap: theme.spacing.lg,
      flexWrap: 'wrap',
    },
    calendarCard: {
      flex: 1,
      minWidth: 340,
    },
    listCard: {
      flex: 1,
      minWidth: 340,
    },
    sectionHeading: {
      ...theme.typography.subtitle,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm,
    },
    sectionSpacer: {
      height: theme.spacing.lg,
    },
    emptyDayText: {
      ...theme.typography.body,
      color: theme.colors.textMuted,
      marginBottom: theme.spacing.sm,
    },
    eventRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
    },
    eventRowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    eventIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    eventTitle: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
    },
    eventMeta: {
      ...theme.typography.caption,
      color: theme.colors.textMuted,
      marginTop: 2,
    },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg,
    },
    sheet: {
      width: '100%',
      maxWidth: 440,
      maxHeight: '85%',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.lg,
    },
    sheetTitle: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.md,
    },
    sheetForm: {
      maxHeight: 420,
    },
    sheetActions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    sheetButton: {
      flex: 1,
    },
  });
}
