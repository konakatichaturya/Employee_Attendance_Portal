import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { format } from 'date-fns';
import { useAppSelector } from '../store/hooks';
import { attendanceApi } from '../services/api/attendanceApi';
import { getCachedAttendance, upsertAttendanceRecords } from '../services/storage/db';
import { getCurrentLocation } from '../services/location/locationService';
import { enqueueAttendanceAction } from '../services/sync/attendanceSyncQueue';
import type { AttendanceRecord, GeoPoint } from '../types';

async function queueOfflineCheckIn(location: GeoPoint): Promise<AttendanceRecord> {
  const today = format(new Date(), 'yyyy-MM-dd');
  const record: AttendanceRecord = {
    id: `ATT-${today}`,
    date: today,
    checkInTime: new Date().toISOString(),
    checkOutTime: null,
    checkInLocation: location,
    checkOutLocation: null,
    status: 'checked-in',
    workingHours: null,
    pendingSync: true,
  };
  await enqueueAttendanceAction({
    id: record.id,
    type: 'check-in',
    location,
    queuedAt: record.checkInTime as string,
  });
  await upsertAttendanceRecords([record]);
  return record;
}

async function queueOfflineCheckOut(
  location: GeoPoint,
  existing: AttendanceRecord | null | undefined,
): Promise<AttendanceRecord> {
  const today = format(new Date(), 'yyyy-MM-dd');
  const checkOutTime = new Date();
  const checkInTime = existing?.checkInTime ? new Date(existing.checkInTime) : checkOutTime;
  const workingHours = Math.round(((checkOutTime.getTime() - checkInTime.getTime()) / 3600000) * 100) / 100;

  const record: AttendanceRecord = {
    id: `ATT-${today}`,
    date: today,
    checkInTime: existing?.checkInTime ?? checkOutTime.toISOString(),
    checkOutTime: checkOutTime.toISOString(),
    checkInLocation: existing?.checkInLocation ?? location,
    checkOutLocation: location,
    status: 'checked-out',
    workingHours,
    pendingSync: true,
  };
  await enqueueAttendanceAction({
    id: record.id,
    type: 'check-out',
    location,
    queuedAt: record.checkOutTime as string,
  });
  await upsertAttendanceRecords([record]);
  return record;
}

export function useTodayAttendance() {
  const token = useAppSelector((s) => s.auth.token);
  return useQuery({
    queryKey: ['attendance', 'today', token],
    queryFn: () => attendanceApi.getToday(token as string),
    enabled: !!token,
  });
}

export function useAttendanceHistory() {
  const token = useAppSelector((s) => s.auth.token);
  return useQuery({
    queryKey: ['attendance', 'all', token],
    queryFn: async () => {
      try {
        return await attendanceApi.getAll(token as string);
      } catch (error) {
        const cached = await getCachedAttendance();
        if (cached.length > 0) return cached;
        throw error;
      }
    },
    enabled: !!token,
  });
}

export function useCheckIn() {
  const token = useAppSelector((s) => s.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const location: GeoPoint = await getCurrentLocation();
      const netState = await NetInfo.fetch();
      if (!netState.isConnected) {
        return queueOfflineCheckIn(location);
      }
      return attendanceApi.checkIn(token as string, location);
    },
    onSuccess: (record) => {
      queryClient.setQueryData(['attendance', 'today', token], record);
      if (!record.pendingSync) {
        queryClient.invalidateQueries({ queryKey: ['attendance'] });
      }
    },
  });
}

export function useCheckOut() {
  const token = useAppSelector((s) => s.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const location: GeoPoint = await getCurrentLocation();
      const netState = await NetInfo.fetch();
      if (!netState.isConnected) {
        const existing = queryClient.getQueryData<AttendanceRecord | null>(['attendance', 'today', token]);
        return queueOfflineCheckOut(location, existing);
      }
      return attendanceApi.checkOut(token as string, location);
    },
    onSuccess: (record) => {
      queryClient.setQueryData(['attendance', 'today', token], record);
      if (!record.pendingSync) {
        queryClient.invalidateQueries({ queryKey: ['attendance'] });
      }
    },
  });
}
