import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { format } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { GlassCard } from '../../components/GlassCard';
import { Loader } from '../../components/Loader';
import { EmptyState } from '../../components/EmptyState';
import { AppButton } from '../../components/AppButton';
import { InputField } from '../../components/InputField';
import { DateField } from '../../components/DateField';
import { MonthCalendar } from '../../components/MonthCalendar';
import { VideoHero } from '../../components/VideoHero';
import { GradientBlobBackdrop } from '../../components/GradientBlobBackdrop';
import { useTheme, type Theme } from '../../theme/ThemeContext';
import { useAppSelector } from '../../store/hooks';
import { useCalendarEvents, useCreateCalendarEvent, useDeleteCalendarEvent } from '../../hooks/useCalendarQueries';
import { showErrorToast, showSuccessToast } from '../../components/toast';
import { NATIVE_VIDEO } from '../../constants/nativeMedia';
import type { CalendarEvent, CalendarEventType } from '../../types';

const TYPE_META: Record<CalendarEventType, { label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap; color: (t: Theme) => string }> = {
  holiday: { label: 'Holiday', icon: 'beach', color: (t) => t.colors.danger },
  meeting: { label: 'Meeting', icon: 'account-group', color: (t) => t.colors.primary },
};

export function CalendarScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const employee = useAppSelector((s) => s.auth.employee);
  const isAdmin = employee?.role === 'admin';

  const eventsQuery = useCalendarEvents();
  const events = eventsQuery.data ?? [];
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [formVisible, setFormVisible] = useState(false);

  const dayEvents = events.filter((e) => e.date === selectedDate);
  const upcoming = events.filter((e) => e.date >= format(new Date(), 'yyyy-MM-dd')).slice(0, 8);

  if (eventsQuery.isLoading) {
    return <Loader fullScreen label="Loading calendar..." />;
  }

  return (
    <Screen edges={['top', 'left', 'right']}>
      <GradientBlobBackdrop />
      <ScrollView contentContainerStyle={styles.content}>
        <VideoHero
          theme={theme}
          title="Calendar"
          subtitle="Company holidays and meetings"
          videoSrc={NATIVE_VIDEO.calendar}
          height={120}
        />
        {isAdmin && (
          <AppButton
            label="Add Event"
            onPress={() => setFormVisible(true)}
            fullWidth={false}
            icon={<MaterialCommunityIcons name="plus" size={18} color={theme.colors.onPrimary} />}
            style={styles.addEventButton}
          />
        )}

        <GlassCard>
          <MonthCalendar theme={theme} events={events} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        </GlassCard>

        <View style={styles.spacer} />

        <Text style={styles.sectionHeading}>{format(new Date(selectedDate), 'EEEE, dd MMMM')}</Text>
        {dayEvents.length === 0 ? (
          <Text style={styles.emptyDayText}>No events on this day.</Text>
        ) : (
          <GlassCard padded={false}>
            {dayEvents.map((event, index) => (
              <EventRow key={event.id} event={event} isAdmin={isAdmin} last={index === dayEvents.length - 1} />
            ))}
          </GlassCard>
        )}

        <View style={styles.spacer} />

        <Text style={styles.sectionHeading}>Upcoming</Text>
        {upcoming.length === 0 ? (
          <EmptyState icon="calendar-blank-outline" title="No upcoming events" />
        ) : (
          <GlassCard padded={false}>
            {upcoming.map((event, index) => (
              <EventRow key={event.id} event={event} isAdmin={isAdmin} last={index === upcoming.length - 1} showDate />
            ))}
          </GlassCard>
        )}
      </ScrollView>

      {isAdmin && (
        <AddEventModal visible={formVisible} defaultDate={selectedDate} onClose={() => setFormVisible(false)} />
      )}
    </Screen>
  );
}

function EventRow({
  event,
  isAdmin,
  last,
  showDate,
}: {
  event: CalendarEvent;
  isAdmin: boolean;
  last: boolean;
  showDate?: boolean;
}) {
  const { theme } = useTheme();
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
        <MaterialCommunityIcons name={meta.icon} size={18} color={meta.color(theme)} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventMeta}>
          {meta.label}
          {showDate ? ` · ${format(new Date(event.date), 'dd MMM yyyy')}` : ''}
          {event.description ? ` · ${event.description}` : ''}
        </Text>
      </View>
      {isAdmin && (
        <Pressable onPress={onDelete} disabled={deleteEvent.isPending} accessibilityRole="button" accessibilityLabel="Delete event">
          <MaterialCommunityIcons name="trash-can-outline" size={18} color={theme.colors.textMuted} />
        </Pressable>
      )}
    </View>
  );
}

function AddEventModal({ visible, defaultDate, onClose }: { visible: boolean; defaultDate: string; onClose: () => void }) {
  const { theme } = useTheme();
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

            <Text style={styles.typeLabel}>Type</Text>
            <View style={styles.typeToggle}>
              {(Object.keys(TYPE_META) as CalendarEventType[]).map((key) => (
                <Pressable
                  key={key}
                  onPress={() => setType(key)}
                  style={[styles.typePill, type === key && styles.typePillActive]}
                  accessibilityRole="button"
                >
                  <MaterialCommunityIcons
                    name={TYPE_META[key].icon}
                    size={16}
                    color={type === key ? theme.colors.primary : theme.colors.textMuted}
                  />
                  <Text style={[styles.typePillText, type === key && styles.typePillTextActive]}>{TYPE_META[key].label}</Text>
                </Pressable>
              ))}
            </View>

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

function createStyles(theme: Theme) {
  return StyleSheet.create({
    content: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.xxl,
    },
    addEventButton: {
      alignSelf: 'flex-start',
      marginBottom: theme.spacing.md,
    },
    heading: {
      ...theme.typography.h2,
      color: theme.colors.textPrimary,
    },
    subheading: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    spacer: {
      height: theme.spacing.md,
    },
    sectionHeading: {
      ...theme.typography.subtitle,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm,
    },
    emptyDayText: {
      ...theme.typography.body,
      color: theme.colors.textMuted,
    },
    eventRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      padding: theme.spacing.md,
    },
    eventRowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    eventIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
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
      backgroundColor: 'rgba(20, 22, 27, 0.45)',
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
      padding: theme.spacing.lg,
      ...theme.elevation.lg,
    },
    sheetTitle: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.md,
    },
    sheetForm: {
      maxHeight: 420,
    },
    typeLabel: {
      ...theme.typography.captionMedium,
      color: theme.colors.textSecondary,
      marginBottom: 6,
    },
    typeToggle: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    typePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.radius.pill,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
    },
    typePillActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight,
    },
    typePillText: {
      ...theme.typography.captionMedium,
      color: theme.colors.textMuted,
    },
    typePillTextActive: {
      color: theme.colors.primary,
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
