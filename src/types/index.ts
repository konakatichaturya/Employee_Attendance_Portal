export type UserRole = 'admin' | 'manager' | 'employee';

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  avatarUri: string | null;
  role: UserRole;
  designation?: string;
  /** Employee ID of the direct approver: the employee's (or admin's) manager. */
  reportsToId?: string;
  /** True for Admin-created accounts until the holder sets their own password. */
  mustChangePassword?: boolean;
  /** Base monthly salary used for payslip generation, in the app's local currency. */
  monthlySalary: number;
}

export interface AuthState {
  employee: Employee | null;
  token: string | null;
  status: 'idle' | 'checking' | 'authenticated' | 'unauthenticated';
  /**
   * Set once credentials pass and a one-time code has been issued, cleared
   * once that code is verified (or the attempt is cancelled). `devCode` is
   * the code itself — this app has no real email/SMS provider connected, so
   * the code is surfaced directly in the UI instead of actually being sent.
   */
  pendingOtp: { email: string; role: UserRole; devCode: string } | null;
}

export type AttendanceStatus = 'checked-in' | 'checked-out' | 'absent';

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface AttendanceRecord {
  id: string;
  date: string; // yyyy-MM-dd
  checkInTime: string | null; // ISO
  checkOutTime: string | null; // ISO
  checkInLocation: GeoPoint | null;
  checkOutLocation: GeoPoint | null;
  status: AttendanceStatus;
  workingHours: number | null;
  pendingSync?: boolean;
}

export type LeaveType = 'Casual' | 'Sick' | 'Earned' | 'Unpaid';

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  id: string;
  type: LeaveType;
  fromDate: string; // yyyy-MM-dd
  toDate: string; // yyyy-MM-dd
  reason: string;
  status: LeaveStatus;
  days: number;
  createdAt: string;
}

export const DESIGNATIONS = [
  'Data Engineer',
  'Front End Engineer',
  'Backend Engineer',
  'QA Engineer',
  'DevOps Engineer',
  'Infra Engineer',
  'Engineering Manager',
  'Product Manager',
  'Designer',
  'Other',
] as const;

export type Designation = (typeof DESIGNATIONS)[number];

export interface LeaveBalance {
  type: LeaveType;
  total: number;
  used: number;
}

export type HistoryFilter = '7d' | '30d' | 'custom';

export type CalendarEventType = 'holiday' | 'meeting';

export interface CalendarEvent {
  id: string;
  title: string;
  type: CalendarEventType;
  date: string; // yyyy-MM-dd
  description?: string;
}
