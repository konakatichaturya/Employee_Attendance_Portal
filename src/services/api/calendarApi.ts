import { mockServer } from '../mock/mockServer';
import type { CalendarEvent } from '../../types';

export const calendarApi = {
  getEvents(): Promise<CalendarEvent[]> {
    return mockServer.getCalendarEvents();
  },
  createEvent(
    adminToken: string,
    input: { title: string; type: CalendarEvent['type']; date: string; description?: string },
  ): Promise<CalendarEvent> {
    return mockServer.createCalendarEvent(adminToken, input);
  },
  deleteEvent(adminToken: string, id: string): Promise<void> {
    return mockServer.deleteCalendarEvent(adminToken, id);
  },
};
