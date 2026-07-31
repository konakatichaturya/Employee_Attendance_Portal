import { mockServer } from '../mock/mockServer';
import type { AttendanceRecord, GeoPoint } from '../../types';

export const attendanceApi = {
  getAll(token: string): Promise<AttendanceRecord[]> {
    return mockServer.getAttendance(token);
  },
  getToday(token: string): Promise<AttendanceRecord | null> {
    return mockServer.getTodayAttendance(token);
  },
  checkIn(token: string, location: GeoPoint): Promise<AttendanceRecord> {
    return mockServer.checkIn(token, location);
  },
  checkOut(token: string, location: GeoPoint): Promise<AttendanceRecord> {
    return mockServer.checkOut(token, location);
  },
};
