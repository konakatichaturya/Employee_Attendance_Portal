import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '../store/hooks';
import { calendarApi } from '../services/api/calendarApi';
import type { CalendarEvent } from '../types';

export function useCalendarEvents() {
  return useQuery({
    queryKey: ['calendar', 'events'],
    queryFn: () => calendarApi.getEvents(),
  });
}

export function useCreateCalendarEvent() {
  const token = useAppSelector((s) => s.auth.token);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { title: string; type: CalendarEvent['type']; date: string; description?: string }) =>
      calendarApi.createEvent(token as string, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar', 'events'] });
    },
  });
}

export function useDeleteCalendarEvent() {
  const token = useAppSelector((s) => s.auth.token);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => calendarApi.deleteEvent(token as string, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar', 'events'] });
    },
  });
}
