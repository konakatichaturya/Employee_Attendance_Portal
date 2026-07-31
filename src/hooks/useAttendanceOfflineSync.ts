import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '../store/hooks';
import { flushPendingAttendanceActions } from '../services/sync/attendanceSyncQueue';

export function useAttendanceOfflineSync() {
  const token = useAppSelector((s) => s.auth.token);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token) return;

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (!state.isConnected) return;
      flushPendingAttendanceActions(token).then((flushed) => {
        if (flushed > 0) {
          queryClient.invalidateQueries({ queryKey: ['attendance'] });
        }
      });
    });

    return () => unsubscribe();
  }, [token, queryClient]);
}
