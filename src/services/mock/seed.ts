import type { AttendanceRecord, CalendarEvent, Employee, LeaveBalance, LeaveRequest } from '../../types';
import { addDays, format, subDays } from 'date-fns';

export const DEMO_CREDENTIALS = {
  email: 'employee@company.com',
  password: 'password123',
};

export const ADMIN_CREDENTIALS = {
  email: 'admin@company.com',
  password: 'admin1234',
};

export const MANAGER_CREDENTIALS = {
  email: 'manager@company.com',
  password: 'manager1234',
};

// Deterministic so a given employee always gets the same demo salary — there's
// no real payroll input in this app, so a stable hash of their ID stands in
// for "an admin entered this once" without needing a source of truth.
const SALARY_BANDS: Record<Employee['role'], [number, number]> = {
  admin: [120000, 180000],
  manager: [90000, 140000],
  employee: [45000, 95000],
};

export function generateMonthlySalary(role: Employee['role'], seedKey: string): number {
  let hash = 0;
  for (let i = 0; i < seedKey.length; i++) {
    hash = (hash * 31 + seedKey.charCodeAt(i)) >>> 0;
  }
  const fraction = (hash % 10000) / 10000;
  const [min, max] = SALARY_BANDS[role];
  return Math.round((min + fraction * (max - min)) / 500) * 500;
}

export const seedManager: Employee = {
  id: 'MGR-001',
  name: 'Kabir Malhotra',
  email: MANAGER_CREDENTIALS.email,
  phone: '+91 90000 33344',
  department: 'Engineering',
  avatarUri: null,
  role: 'manager',
  designation: 'Product Manager',
  monthlySalary: generateMonthlySalary('manager', 'MGR-001'),
};

export const seedEmployee: Employee = {
  id: 'EMP-1024',
  name: 'Ashwin Rao',
  email: DEMO_CREDENTIALS.email,
  phone: '+91 98765 43210',
  department: 'Engineering',
  avatarUri: null,
  role: 'employee',
  designation: 'Frontend Engineer',
  reportsToId: seedManager.id,
  monthlySalary: generateMonthlySalary('employee', 'EMP-1024'),
};

export const seedAdmin: Employee = {
  id: 'ADM-001',
  name: 'Priya Menon',
  email: ADMIN_CREDENTIALS.email,
  phone: '+91 90000 11122',
  department: 'HR Operations',
  avatarUri: null,
  role: 'admin',
  reportsToId: seedManager.id,
  monthlySalary: generateMonthlySalary('admin', 'ADM-001'),
};

export const seedLeaveBalances: LeaveBalance[] = [
  { type: 'Casual', total: 12, used: 4 },
  { type: 'Sick', total: 10, used: 2 },
  { type: 'Earned', total: 15, used: 6 },
  { type: 'Unpaid', total: 0, used: 0 },
];

export const seedLeaveRequests: LeaveRequest[] = [
  {
    id: 'LR-1001',
    type: 'Casual',
    fromDate: format(subDays(new Date(), 20), 'yyyy-MM-dd'),
    toDate: format(subDays(new Date(), 19), 'yyyy-MM-dd'),
    reason: 'Family function out of town',
    status: 'Approved',
    days: 2,
    createdAt: subDays(new Date(), 25).toISOString(),
  },
  {
    id: 'LR-1002',
    type: 'Sick',
    fromDate: format(subDays(new Date(), 8), 'yyyy-MM-dd'),
    toDate: format(subDays(new Date(), 8), 'yyyy-MM-dd'),
    reason: 'Fever and body ache, needed rest',
    status: 'Approved',
    days: 1,
    createdAt: subDays(new Date(), 9).toISOString(),
  },
];

export const seedCalendarEvents: CalendarEvent[] = [
  {
    id: 'CAL-1001',
    title: 'Independence Day',
    type: 'holiday',
    date: format(addDays(new Date(), 5), 'yyyy-MM-dd'),
    description: 'Public holiday — office closed.',
  },
  {
    id: 'CAL-1002',
    title: 'All-hands town hall',
    type: 'meeting',
    date: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
    description: 'Quarterly company update, 4:00 PM in the main hall.',
  },
  {
    id: 'CAL-1003',
    title: 'Diwali',
    type: 'holiday',
    date: format(addDays(new Date(), 21), 'yyyy-MM-dd'),
    description: 'Public holiday — office closed.',
  },
  {
    id: 'CAL-1004',
    title: 'Engineering sprint planning',
    type: 'meeting',
    date: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
    description: '10:30 AM, Engineering team sync.',
  },
];

function randomWorkingHours(): number {
  return Math.round((7.5 + Math.random() * 1.5) * 100) / 100;
}

export function generateSeedAttendance(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  for (let i = 1; i <= 30; i++) {
    const date = subDays(new Date(), i);
    const day = date.getDay();
    if (day === 0 || day === 6) continue;

    const dateStr = format(date, 'yyyy-MM-dd');
    const hours = randomWorkingHours();
    const checkIn = new Date(date);
    checkIn.setHours(9, Math.floor(Math.random() * 20), 0, 0);
    const checkOut = new Date(checkIn.getTime() + hours * 60 * 60 * 1000);

    records.push({
      id: `ATT-${dateStr}`,
      date: dateStr,
      checkInTime: checkIn.toISOString(),
      checkOutTime: checkOut.toISOString(),
      checkInLocation: { latitude: 12.9716 + Math.random() * 0.01, longitude: 77.5946 + Math.random() * 0.01 },
      checkOutLocation: { latitude: 12.9716 + Math.random() * 0.01, longitude: 77.5946 + Math.random() * 0.01 },
      status: 'checked-out',
      workingHours: hours,
    });
  }
  return records;
}
