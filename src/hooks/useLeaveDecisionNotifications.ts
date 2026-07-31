import { useEffect } from 'react';
import { useLeaveRequests } from './useLeaveQueries';
import { localStore } from '../services/storage/localStore';
import { showErrorToast, showSuccessToast } from '../components/toast';
import type { LeaveStatus } from '../types';

const SEEN_KEY = 'leave_status_seen';

/**
 * Detects when a leave request transitions from Pending to Approved/Rejected
 * (e.g. an admin actioned it) and surfaces a toast the next time the
 * employee's app fetches their requests.
 */
export function useLeaveDecisionNotifications() {
  const { data } = useLeaveRequests();

  useEffect(() => {
    if (!data) return;

    (async () => {
      const seen = (await localStore.get<Record<string, LeaveStatus>>(SEEN_KEY)) ?? {};
      const nextSeen: Record<string, LeaveStatus> = { ...seen };

      for (const request of data) {
        const previousStatus = seen[request.id];
        if (previousStatus === 'Pending' && request.status !== previousStatus) {
          if (request.status === 'Approved') {
            showSuccessToast('Leave approved', `Your ${request.type} leave request was approved.`);
          } else if (request.status === 'Rejected') {
            showErrorToast('Leave rejected', `Your ${request.type} leave request was rejected.`);
          }
        }
        nextSeen[request.id] = request.status;
      }

      await localStore.set(SEEN_KEY, nextSeen);
    })();
  }, [data]);
}
