import { localStore } from '../storage/localStore';
import { attendanceApi } from '../api/attendanceApi';
import type { GeoPoint } from '../../types';

const QUEUE_KEY = 'pending_attendance_actions';

export interface PendingAttendanceAction {
  id: string;
  type: 'check-in' | 'check-out';
  location: GeoPoint;
  queuedAt: string;
}

export async function getPendingAttendanceActions(): Promise<PendingAttendanceAction[]> {
  return (await localStore.get<PendingAttendanceAction[]>(QUEUE_KEY)) ?? [];
}

export async function enqueueAttendanceAction(action: PendingAttendanceAction): Promise<void> {
  const queue = await getPendingAttendanceActions();
  await localStore.set(QUEUE_KEY, [...queue, action]);
}

/**
 * Replays queued actions in order against the real API, stopping at the first
 * failure so later actions aren't applied out of order on the next attempt.
 */
export async function flushPendingAttendanceActions(token: string): Promise<number> {
  const remaining = await getPendingAttendanceActions();
  let flushed = 0;

  while (remaining.length > 0) {
    const action = remaining[0];
    try {
      if (action.type === 'check-in') {
        await attendanceApi.checkIn(token, action.location);
      } else {
        await attendanceApi.checkOut(token, action.location);
      }
      remaining.shift();
      flushed += 1;
    } catch {
      break;
    }
  }

  await localStore.set(QUEUE_KEY, remaining);
  return flushed;
}
