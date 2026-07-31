import { format, subDays } from 'date-fns';
import { localStore } from '../storage/localStore';
import { upsertAttendanceRecords } from '../storage/db';
import type { AttendanceRecord, Employee, GeoPoint, LeaveBalance, LeaveRequest, LeaveStatus, LeaveType } from '../../types';
import {
  ADMIN_CREDENTIALS,
  DEMO_CREDENTIALS,
  MANAGER_CREDENTIALS,
  generateSeedAttendance,
  seedAdmin,
  seedEmployee,
  seedLeaveBalances,
  seedLeaveRequests,
  seedManager,
} from './seed';

const KEYS = {
  seeded: 'seeded',
  employees: 'employees',
  credentials: 'credentials',
  attendanceByEmployee: 'attendance_by_employee',
  leaveRequestsByEmployee: 'leave_requests_by_employee',
  leaveBalancesByEmployee: 'leave_balances_by_employee',
  sessions: 'sessions',
};

const NETWORK_DELAY_MS = 650;

function delay(ms: number = NETWORK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class ApiError extends Error {
  constructor(message: string, public code: string = 'UNKNOWN') {
    super(message);
    this.name = 'ApiError';
  }
}

export type AttendanceCategory = 'Early' | 'On time' | 'Late' | 'Off work';

function classifyStart(checkInTime: string | null): AttendanceCategory {
  if (!checkInTime) return 'Off work';
  const hour = new Date(checkInTime).getHours() + new Date(checkInTime).getMinutes() / 60;
  if (hour < 9) return 'Early';
  if (hour < 10) return 'On time';
  return 'Late';
}

function freshLeaveBalances(): LeaveBalance[] {
  return seedLeaveBalances.map((b) => ({ ...b, used: 0 }));
}

export type DayStatus = 'Present' | 'Absent' | 'Late' | 'Leave';

function isOnApprovedLeave(date: string, requests: LeaveRequest[]): boolean {
  return requests.some((r) => r.status === 'Approved' && r.fromDate <= date && date <= r.toDate);
}

function dayStatusFor(date: string, record: AttendanceRecord | undefined, requests: LeaveRequest[]): DayStatus {
  if (isOnApprovedLeave(date, requests)) return 'Leave';
  if (record?.checkInTime) {
    return classifyStart(record.checkInTime) === 'Late' ? 'Late' : 'Present';
  }
  return 'Absent';
}

/**
 * Backfills per-employee attendance/leave data for any employee that doesn't
 * have an entry yet (new registrations, or browsers seeded before this
 * per-employee model existed).
 */
async function ensureEmployeeDataSeeded(): Promise<void> {
  const employees = (await localStore.get<Employee[]>(KEYS.employees)) ?? [];

  const attendanceMap = (await localStore.get<Record<string, AttendanceRecord[]>>(KEYS.attendanceByEmployee)) ?? {};
  const balancesMap = (await localStore.get<Record<string, LeaveBalance[]>>(KEYS.leaveBalancesByEmployee)) ?? {};
  const requestsMap = (await localStore.get<Record<string, LeaveRequest[]>>(KEYS.leaveRequestsByEmployee)) ?? {};

  let attendanceChanged = false;
  let balancesChanged = false;
  let requestsChanged = false;

  for (const employee of employees) {
    if (!(employee.id in attendanceMap)) {
      attendanceMap[employee.id] = employee.id === seedEmployee.id ? generateSeedAttendance() : [];
      attendanceChanged = true;
    }
    if (!(employee.id in balancesMap)) {
      balancesMap[employee.id] = employee.id === seedEmployee.id ? seedLeaveBalances : freshLeaveBalances();
      balancesChanged = true;
    }
    if (!(employee.id in requestsMap)) {
      requestsMap[employee.id] = employee.id === seedEmployee.id ? seedLeaveRequests : [];
      requestsChanged = true;
    }
  }

  if (attendanceChanged) {
    await localStore.set(KEYS.attendanceByEmployee, attendanceMap);
    await upsertAttendanceRecords(Object.values(attendanceMap).flat());
  }
  if (balancesChanged) await localStore.set(KEYS.leaveBalancesByEmployee, balancesMap);
  if (requestsChanged) await localStore.set(KEYS.leaveRequestsByEmployee, requestsMap);
}

const ORG_SEED_ACCOUNTS: { employee: Employee; credentials: { email: string; password: string } }[] = [
  { employee: seedAdmin, credentials: ADMIN_CREDENTIALS },
  { employee: seedManager, credentials: MANAGER_CREDENTIALS },
  { employee: seedEmployee, credentials: DEMO_CREDENTIALS },
];

/**
 * Backfills the demo accounts for browsers seeded before this role model existed, and
 * reconciles role/reportsToId on ones that already exist - the app's data model (adding
 * reportsToId, the team-lead/manager chain, etc.) has changed shape over time, and a
 * browser seeded under an older shape would otherwise carry stale relationships forever.
 */
async function ensureOrgSeeded(): Promise<void> {
  let employees = (await localStore.get<Employee[]>(KEYS.employees)) ?? [];
  const credentials = (await localStore.get<Record<string, string>>(KEYS.credentials)) ?? {};
  let employeesChanged = false;
  let credentialsChanged = false;

  for (const { employee, credentials: creds } of ORG_SEED_ACCOUNTS) {
    const existing = employees.find((e) => e.email.toLowerCase() === creds.email);
    if (!existing) {
      employees = [...employees.filter((e) => e.id !== employee.id), employee];
      employeesChanged = true;
    } else if (existing.role !== employee.role || existing.reportsToId !== employee.reportsToId) {
      employees = employees.map((e) =>
        e.email.toLowerCase() === creds.email ? { ...e, role: employee.role, reportsToId: employee.reportsToId } : e,
      );
      employeesChanged = true;
    }
    if (!credentials[creds.email]) {
      credentials[creds.email] = creds.password;
      credentialsChanged = true;
    }
  }

  if (employeesChanged) await localStore.set(KEYS.employees, employees);
  if (credentialsChanged) await localStore.set(KEYS.credentials, credentials);
}

/**
 * Repairs employees whose reportsToId points at someone who is no longer (or never
 * was) a valid team lead/manager - e.g. a registered employee from an earlier version
 * of the registration flow this app went through. Re-links them to the current default
 * team lead/manager so the approval chain keeps working.
 */
async function ensureReportingChainsValid(): Promise<void> {
  const employees = (await localStore.get<Employee[]>(KEYS.employees)) ?? [];
  const defaultManager = employees.find((e) => e.role === 'manager');
  let changed = false;

  const fixed = employees.map((e) => {
    if (e.role === 'employee' || e.role === 'admin') {
      const validReport = !!e.reportsToId && employees.some((mgr) => mgr.id === e.reportsToId && mgr.role === 'manager');
      if (!validReport && defaultManager) {
        changed = true;
        return { ...e, reportsToId: defaultManager.id };
      }
    }
    return e;
  });

  if (changed) await localStore.set(KEYS.employees, fixed);
}

/**
 * Converts any employee left over from the old 4-role model (role: 'team_lead') into a
 * plain Employee reporting to the default manager. Without this, a browser that used the
 * app before the 3-role model shipped keeps a role value the UI's Record<UserRole, ...>
 * lookups (role badges, persona tabs, etc.) have no entry for, which crashes on render.
 */
async function ensureLegacyRolesMigrated(): Promise<void> {
  const employees = (await localStore.get<Employee[]>(KEYS.employees)) ?? [];
  const defaultManager = employees.find((e) => e.role === 'manager');
  let changed = false;

  const fixed = employees.map((e) => {
    if (e.role !== 'admin' && e.role !== 'manager' && e.role !== 'employee') {
      changed = true;
      return { ...e, role: 'employee' as const, reportsToId: defaultManager?.id };
    }
    return e;
  });

  if (changed) await localStore.set(KEYS.employees, fixed);
}

async function ensureSeeded(): Promise<void> {
  const seeded = await localStore.get<boolean>(KEYS.seeded);
  if (!seeded) {
    await localStore.set(KEYS.employees, [seedEmployee, seedManager, seedAdmin]);
    await localStore.set(KEYS.credentials, {
      [DEMO_CREDENTIALS.email]: DEMO_CREDENTIALS.password,
      [ADMIN_CREDENTIALS.email]: ADMIN_CREDENTIALS.password,
      [MANAGER_CREDENTIALS.email]: MANAGER_CREDENTIALS.password,
    });
    await localStore.set(KEYS.seeded, true);
  }

  await ensureLegacyRolesMigrated();
  await ensureOrgSeeded();
  await ensureReportingChainsValid();
  await ensureEmployeeDataSeeded();
}

async function requireSession(token: string): Promise<string> {
  const sessions = (await localStore.get<Record<string, string>>(KEYS.sessions)) ?? {};
  const email = sessions[token];
  if (!email) {
    throw new ApiError('Session expired. Please log in again.', 'UNAUTHORIZED');
  }
  return email;
}

async function resolveEmployeeForToken(token: string): Promise<Employee> {
  const email = await requireSession(token);
  const employees = (await localStore.get<Employee[]>(KEYS.employees)) ?? [seedEmployee];
  return employees.find((e) => e.email.toLowerCase() === email) ?? seedEmployee;
}

// seedEmployee is a login demo account, not a real hire — admin-facing views
// (roster, stats, attendance, leave) should only reflect people who actually registered.
function isAdminVisible(e: Employee): boolean {
  return e.role !== 'admin' && e.id !== seedEmployee.id;
}

export const mockServer = {
  async login(
    email: string,
    password: string,
    expectedRole?: Employee['role'],
  ): Promise<{ token: string; employee: Employee }> {
    await ensureSeeded();
    await delay();

    const normalizedEmail = email.trim().toLowerCase();
    const credentials = (await localStore.get<Record<string, string>>(KEYS.credentials)) ?? {};
    if (credentials[normalizedEmail] !== password) {
      throw new ApiError('Invalid email or password.', 'INVALID_CREDENTIALS');
    }

    const employees = (await localStore.get<Employee[]>(KEYS.employees)) ?? [seedEmployee];
    const employee = employees.find((e) => e.email.toLowerCase() === normalizedEmail) ?? seedEmployee;

    if (expectedRole && employee.role !== expectedRole) {
      const roleLabel: Record<Employee['role'], string> = {
        admin: 'an admin',
        manager: 'a manager',
        employee: 'an employee',
      };
      throw new ApiError(
        `This account is not registered as ${roleLabel[expectedRole]}. Select the correct tab and try again.`,
        'ROLE_MISMATCH',
      );
    }

    const token = `tok_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const sessions = (await localStore.get<Record<string, string>>(KEYS.sessions)) ?? {};
    sessions[token] = normalizedEmail;
    await localStore.set(KEYS.sessions, sessions);

    return { token, employee };
  },

  // Self-registration is employee-only; Admin and Manager are predefined/admin-created
  // accounts (see seed.ts, createManager) and cannot be created here.
  async register(input: {
    employeeId: string;
    name: string;
    email: string;
    phone: string;
    department: string;
    password: string;
    managerId: string;
  }): Promise<{ token: string; employee: Employee }> {
    await ensureSeeded();
    await delay();

    const normalizedEmail = input.email.trim().toLowerCase();
    const employeeId = input.employeeId.trim();
    const employees = (await localStore.get<Employee[]>(KEYS.employees)) ?? [seedEmployee];

    if (employees.some((e) => e.email.toLowerCase() === normalizedEmail)) {
      throw new ApiError('An account with this email already exists.', 'EMAIL_TAKEN');
    }
    if (employees.some((e) => e.id.toLowerCase() === employeeId.toLowerCase())) {
      throw new ApiError('An account with this Employee ID already exists.', 'EMPLOYEE_ID_TAKEN');
    }

    const manager = employees.find((e) => e.id === input.managerId && e.role === 'manager');
    if (!manager) {
      throw new ApiError('Select a valid manager.', 'INVALID_MANAGER');
    }

    const employee: Employee = {
      id: employeeId,
      name: input.name.trim(),
      email: normalizedEmail,
      phone: input.phone.trim(),
      department: input.department.trim(),
      avatarUri: null,
      role: 'employee',
      reportsToId: manager.id,
    };

    await localStore.set(KEYS.employees, [...employees, employee]);
    const credentials = (await localStore.get<Record<string, string>>(KEYS.credentials)) ?? {};
    credentials[normalizedEmail] = input.password;
    await localStore.set(KEYS.credentials, credentials);

    const attendanceMap = (await localStore.get<Record<string, AttendanceRecord[]>>(KEYS.attendanceByEmployee)) ?? {};
    attendanceMap[employee.id] = [];
    await localStore.set(KEYS.attendanceByEmployee, attendanceMap);

    const balancesMap = (await localStore.get<Record<string, LeaveBalance[]>>(KEYS.leaveBalancesByEmployee)) ?? {};
    balancesMap[employee.id] = freshLeaveBalances();
    await localStore.set(KEYS.leaveBalancesByEmployee, balancesMap);

    const requestsMap = (await localStore.get<Record<string, LeaveRequest[]>>(KEYS.leaveRequestsByEmployee)) ?? {};
    requestsMap[employee.id] = [];
    await localStore.set(KEYS.leaveRequestsByEmployee, requestsMap);

    const token = `tok_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const sessions = (await localStore.get<Record<string, string>>(KEYS.sessions)) ?? {};
    sessions[token] = normalizedEmail;
    await localStore.set(KEYS.sessions, sessions);

    return { token, employee };
  },

  async logout(token: string): Promise<void> {
    await delay(200);
    const sessions = (await localStore.get<Record<string, string>>(KEYS.sessions)) ?? {};
    delete sessions[token];
    await localStore.set(KEYS.sessions, sessions);
  },

  async getSessionEmployee(token: string): Promise<Employee> {
    await ensureSeeded();
    const email = await requireSession(token);
    await delay(300);
    const employees = (await localStore.get<Employee[]>(KEYS.employees)) ?? [seedEmployee];
    return employees.find((e) => e.email.toLowerCase() === email) ?? seedEmployee;
  },

  async updateProfile(token: string, updates: Partial<Pick<Employee, 'phone' | 'avatarUri'>>): Promise<Employee> {
    const employee = await resolveEmployeeForToken(token);
    await delay();
    const employees = (await localStore.get<Employee[]>(KEYS.employees)) ?? [seedEmployee];
    const updated: Employee = { ...employee, ...updates };
    await localStore.set(
      KEYS.employees,
      employees.map((e) => (e.id === employee.id ? updated : e)),
    );
    return updated;
  },

  async changePassword(token: string, newPassword: string): Promise<Employee> {
    const employee = await resolveEmployeeForToken(token);
    await delay(400);

    const credentials = (await localStore.get<Record<string, string>>(KEYS.credentials)) ?? {};
    credentials[employee.email] = newPassword;
    await localStore.set(KEYS.credentials, credentials);

    const employees = (await localStore.get<Employee[]>(KEYS.employees)) ?? [seedEmployee];
    const updated: Employee = { ...employee, mustChangePassword: false };
    await localStore.set(
      KEYS.employees,
      employees.map((e) => (e.id === employee.id ? updated : e)),
    );
    return updated;
  },

  async getAttendance(token: string): Promise<AttendanceRecord[]> {
    const employee = await resolveEmployeeForToken(token);
    await delay();
    const map = (await localStore.get<Record<string, AttendanceRecord[]>>(KEYS.attendanceByEmployee)) ?? {};
    const records = map[employee.id] ?? [];
    await upsertAttendanceRecords(records);
    return records;
  },

  async getTodayAttendance(token: string): Promise<AttendanceRecord | null> {
    const employee = await resolveEmployeeForToken(token);
    await delay(300);
    const map = (await localStore.get<Record<string, AttendanceRecord[]>>(KEYS.attendanceByEmployee)) ?? {};
    const all = map[employee.id] ?? [];
    const today = format(new Date(), 'yyyy-MM-dd');
    return all.find((r) => r.date === today) ?? null;
  },

  async checkIn(token: string, location: GeoPoint): Promise<AttendanceRecord> {
    const employee = await resolveEmployeeForToken(token);
    await delay();
    const map = (await localStore.get<Record<string, AttendanceRecord[]>>(KEYS.attendanceByEmployee)) ?? {};
    const all = map[employee.id] ?? [];
    const today = format(new Date(), 'yyyy-MM-dd');

    if (all.some((r) => r.date === today && r.checkInTime)) {
      throw new ApiError('You have already checked in today.', 'ALREADY_CHECKED_IN');
    }

    const record: AttendanceRecord = {
      id: `ATT-${today}`,
      date: today,
      checkInTime: new Date().toISOString(),
      checkOutTime: null,
      checkInLocation: location,
      checkOutLocation: null,
      status: 'checked-in',
      workingHours: null,
    };

    map[employee.id] = [record, ...all.filter((r) => r.date !== today)];
    await localStore.set(KEYS.attendanceByEmployee, map);
    await upsertAttendanceRecords([record]);
    return record;
  },

  async checkOut(token: string, location: GeoPoint): Promise<AttendanceRecord> {
    const employee = await resolveEmployeeForToken(token);
    await delay();
    const map = (await localStore.get<Record<string, AttendanceRecord[]>>(KEYS.attendanceByEmployee)) ?? {};
    const all = map[employee.id] ?? [];
    const today = format(new Date(), 'yyyy-MM-dd');
    const existing = all.find((r) => r.date === today);

    if (!existing || !existing.checkInTime) {
      throw new ApiError('You need to check in before checking out.', 'NOT_CHECKED_IN');
    }
    if (existing.checkOutTime) {
      throw new ApiError('You have already checked out today.', 'ALREADY_CHECKED_OUT');
    }

    const checkOutTime = new Date();
    const checkInTime = new Date(existing.checkInTime);
    const workingHours = Math.round(((checkOutTime.getTime() - checkInTime.getTime()) / 3600000) * 100) / 100;

    const updated: AttendanceRecord = {
      ...existing,
      checkOutTime: checkOutTime.toISOString(),
      checkOutLocation: location,
      status: 'checked-out',
      workingHours,
    };

    map[employee.id] = all.map((r) => (r.date === today ? updated : r));
    await localStore.set(KEYS.attendanceByEmployee, map);
    await upsertAttendanceRecords([updated]);
    return updated;
  },

  async getLeaveBalances(token: string): Promise<LeaveBalance[]> {
    const employee = await resolveEmployeeForToken(token);
    await delay(300);
    const map = (await localStore.get<Record<string, LeaveBalance[]>>(KEYS.leaveBalancesByEmployee)) ?? {};
    return map[employee.id] ?? freshLeaveBalances();
  },

  async getLeaveRequests(token: string): Promise<LeaveRequest[]> {
    const employee = await resolveEmployeeForToken(token);
    await delay();
    const map = (await localStore.get<Record<string, LeaveRequest[]>>(KEYS.leaveRequestsByEmployee)) ?? {};
    const list = map[employee.id] ?? [];
    return [...list].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  },

  async applyLeave(
    token: string,
    input: { type: LeaveType; fromDate: string; toDate: string; reason: string; days: number },
  ): Promise<LeaveRequest> {
    const employee = await resolveEmployeeForToken(token);
    await delay(800);

    const balancesMap = (await localStore.get<Record<string, LeaveBalance[]>>(KEYS.leaveBalancesByEmployee)) ?? {};
    const balances = balancesMap[employee.id] ?? freshLeaveBalances();
    const balance = balances.find((b) => b.type === input.type);
    if (balance && input.type !== 'Unpaid' && balance.total - balance.used < input.days) {
      throw new ApiError(`Insufficient ${input.type} leave balance.`, 'INSUFFICIENT_BALANCE');
    }

    const request: LeaveRequest = {
      id: `LR-${Date.now()}`,
      type: input.type,
      fromDate: input.fromDate,
      toDate: input.toDate,
      reason: input.reason,
      status: 'Pending',
      days: input.days,
      createdAt: new Date().toISOString(),
    };

    const requestsMap = (await localStore.get<Record<string, LeaveRequest[]>>(KEYS.leaveRequestsByEmployee)) ?? {};
    requestsMap[employee.id] = [request, ...(requestsMap[employee.id] ?? [])];
    await localStore.set(KEYS.leaveRequestsByEmployee, requestsMap);

    // Balance is only deducted once the request is fully approved (see
    // decideAsManager) - a pending or rejected request shouldn't touch it.
    return request;
  },

  // Lets the "Create Employee" admin form list real managers to assign to.
  async getManagers(): Promise<{ id: string; name: string; department: string }[]> {
    await ensureSeeded();
    await delay(200);
    const employees = (await localStore.get<Employee[]>(KEYS.employees)) ?? [];
    return employees
      .filter((e) => e.role === 'manager')
      .map((e) => ({ id: e.id, name: e.name, department: e.department }));
  },

  // ---- Admin-facing ----

  async getAllEmployeesForAdmin(): Promise<Employee[]> {
    await ensureSeeded();
    await delay();
    const employees = (await localStore.get<Employee[]>(KEYS.employees)) ?? [];
    return employees.filter(isAdminVisible);
  },

  async createManager(
    adminToken: string,
    input: { employeeId: string; name: string; email: string; phone: string; department: string; password: string },
  ): Promise<Employee> {
    const admin = await resolveEmployeeForToken(adminToken);
    if (admin.role !== 'admin') {
      throw new ApiError('Only admins can create manager accounts.', 'FORBIDDEN');
    }
    await delay(400);

    const normalizedEmail = input.email.trim().toLowerCase();
    const employeeId = input.employeeId.trim();
    const employees = (await localStore.get<Employee[]>(KEYS.employees)) ?? [];

    if (employees.some((e) => e.email.toLowerCase() === normalizedEmail)) {
      throw new ApiError('An account with this email already exists.', 'EMAIL_TAKEN');
    }
    if (employees.some((e) => e.id.toLowerCase() === employeeId.toLowerCase())) {
      throw new ApiError('An account with this Employee ID already exists.', 'EMPLOYEE_ID_TAKEN');
    }

    const manager: Employee = {
      id: employeeId,
      name: input.name.trim(),
      email: normalizedEmail,
      phone: input.phone.trim(),
      department: input.department.trim(),
      avatarUri: null,
      role: 'manager',
      mustChangePassword: true,
    };

    await localStore.set(KEYS.employees, [...employees, manager]);
    const credentials = (await localStore.get<Record<string, string>>(KEYS.credentials)) ?? {};
    credentials[normalizedEmail] = input.password;
    await localStore.set(KEYS.credentials, credentials);

    const attendanceMap = (await localStore.get<Record<string, AttendanceRecord[]>>(KEYS.attendanceByEmployee)) ?? {};
    attendanceMap[manager.id] = [];
    await localStore.set(KEYS.attendanceByEmployee, attendanceMap);

    const balancesMap = (await localStore.get<Record<string, LeaveBalance[]>>(KEYS.leaveBalancesByEmployee)) ?? {};
    balancesMap[manager.id] = freshLeaveBalances();
    await localStore.set(KEYS.leaveBalancesByEmployee, balancesMap);

    const requestsMap = (await localStore.get<Record<string, LeaveRequest[]>>(KEYS.leaveRequestsByEmployee)) ?? {};
    requestsMap[manager.id] = [];
    await localStore.set(KEYS.leaveRequestsByEmployee, requestsMap);

    return manager;
  },

  async createEmployee(
    adminToken: string,
    input: {
      employeeId: string;
      name: string;
      email: string;
      phone: string;
      department: string;
      password: string;
      managerId: string;
    },
  ): Promise<Employee> {
    const admin = await resolveEmployeeForToken(adminToken);
    if (admin.role !== 'admin') {
      throw new ApiError('Only admins can create employee accounts.', 'FORBIDDEN');
    }
    await delay(400);

    const normalizedEmail = input.email.trim().toLowerCase();
    const employeeId = input.employeeId.trim();
    const employees = (await localStore.get<Employee[]>(KEYS.employees)) ?? [];

    if (employees.some((e) => e.email.toLowerCase() === normalizedEmail)) {
      throw new ApiError('An account with this email already exists.', 'EMAIL_TAKEN');
    }
    if (employees.some((e) => e.id.toLowerCase() === employeeId.toLowerCase())) {
      throw new ApiError('An account with this Employee ID already exists.', 'EMPLOYEE_ID_TAKEN');
    }

    const manager = employees.find((e) => e.id === input.managerId && e.role === 'manager');
    if (!manager) {
      throw new ApiError('Select a valid manager.', 'INVALID_MANAGER');
    }

    const employee: Employee = {
      id: employeeId,
      name: input.name.trim(),
      email: normalizedEmail,
      phone: input.phone.trim(),
      department: input.department.trim(),
      avatarUri: null,
      role: 'employee',
      reportsToId: manager.id,
      mustChangePassword: true,
    };

    await localStore.set(KEYS.employees, [...employees, employee]);
    const credentials = (await localStore.get<Record<string, string>>(KEYS.credentials)) ?? {};
    credentials[normalizedEmail] = input.password;
    await localStore.set(KEYS.credentials, credentials);

    const attendanceMap = (await localStore.get<Record<string, AttendanceRecord[]>>(KEYS.attendanceByEmployee)) ?? {};
    attendanceMap[employee.id] = [];
    await localStore.set(KEYS.attendanceByEmployee, attendanceMap);

    const balancesMap = (await localStore.get<Record<string, LeaveBalance[]>>(KEYS.leaveBalancesByEmployee)) ?? {};
    balancesMap[employee.id] = freshLeaveBalances();
    await localStore.set(KEYS.leaveBalancesByEmployee, balancesMap);

    const requestsMap = (await localStore.get<Record<string, LeaveRequest[]>>(KEYS.leaveRequestsByEmployee)) ?? {};
    requestsMap[employee.id] = [];
    await localStore.set(KEYS.leaveRequestsByEmployee, requestsMap);

    return employee;
  },

  async getEmployeeAttendanceForAdmin(employeeId: string): Promise<AttendanceRecord[]> {
    await delay(300);
    const map = (await localStore.get<Record<string, AttendanceRecord[]>>(KEYS.attendanceByEmployee)) ?? {};
    return map[employeeId] ?? [];
  },

  async getAdminOverviewStats(): Promise<{
    totalEmployees: number;
    presentToday: number;
    absentToday: number;
    lateToday: number;
    onLeaveToday: number;
    presentRate: number;
  }> {
    await ensureSeeded();
    await delay(300);
    const employees = ((await localStore.get<Employee[]>(KEYS.employees)) ?? []).filter(isAdminVisible);
    const attendanceMap = (await localStore.get<Record<string, AttendanceRecord[]>>(KEYS.attendanceByEmployee)) ?? {};
    const requestsMap = (await localStore.get<Record<string, LeaveRequest[]>>(KEYS.leaveRequestsByEmployee)) ?? {};
    const today = format(new Date(), 'yyyy-MM-dd');

    let presentToday = 0;
    let absentToday = 0;
    let lateToday = 0;
    let onLeaveToday = 0;

    for (const emp of employees) {
      const record = (attendanceMap[emp.id] ?? []).find((r) => r.date === today);
      const status = dayStatusFor(today, record, requestsMap[emp.id] ?? []);
      if (status === 'Present') presentToday += 1;
      else if (status === 'Late') {
        presentToday += 1;
        lateToday += 1;
      } else if (status === 'Leave') onLeaveToday += 1;
      else absentToday += 1;
    }

    const total = employees.length;
    return {
      totalEmployees: total,
      presentToday,
      absentToday,
      lateToday,
      onLeaveToday,
      presentRate: total > 0 ? Math.round((presentToday / total) * 1000) / 10 : 0,
    };
  },

  async getAttendanceTrendForAdmin(
    days: number,
  ): Promise<{ date: string; presentRate: number; absentCount: number; lateCount: number; leaveCount: number }[]> {
    await delay(400);
    const employees = ((await localStore.get<Employee[]>(KEYS.employees)) ?? []).filter(isAdminVisible);
    const attendanceMap = (await localStore.get<Record<string, AttendanceRecord[]>>(KEYS.attendanceByEmployee)) ?? {};
    const requestsMap = (await localStore.get<Record<string, LeaveRequest[]>>(KEYS.leaveRequestsByEmployee)) ?? {};
    const total = employees.length;

    const result: { date: string; presentRate: number; absentCount: number; lateCount: number; leaveCount: number }[] =
      [];
    for (let i = days - 1; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      let present = 0;
      let absent = 0;
      let late = 0;
      let leave = 0;
      for (const emp of employees) {
        const record = (attendanceMap[emp.id] ?? []).find((r) => r.date === date);
        const status = dayStatusFor(date, record, requestsMap[emp.id] ?? []);
        if (status === 'Present') present += 1;
        else if (status === 'Late') {
          present += 1;
          late += 1;
        } else if (status === 'Leave') leave += 1;
        else absent += 1;
      }
      result.push({
        date,
        presentRate: total > 0 ? Math.round((present / total) * 1000) / 10 : 0,
        absentCount: absent,
        lateCount: late,
        leaveCount: leave,
      });
    }
    return result;
  },

  async getDepartmentBreakdownForAdmin(): Promise<{ department: string; employeeCount: number; presentRate: number }[]> {
    await delay(300);
    const employees = ((await localStore.get<Employee[]>(KEYS.employees)) ?? []).filter(isAdminVisible);
    const attendanceMap = (await localStore.get<Record<string, AttendanceRecord[]>>(KEYS.attendanceByEmployee)) ?? {};
    const requestsMap = (await localStore.get<Record<string, LeaveRequest[]>>(KEYS.leaveRequestsByEmployee)) ?? {};
    const today = format(new Date(), 'yyyy-MM-dd');

    const byDept = new Map<string, { total: number; present: number }>();
    for (const emp of employees) {
      const entry = byDept.get(emp.department) ?? { total: 0, present: 0 };
      entry.total += 1;
      const record = (attendanceMap[emp.id] ?? []).find((r) => r.date === today);
      const status = dayStatusFor(today, record, requestsMap[emp.id] ?? []);
      if (status === 'Present' || status === 'Late') entry.present += 1;
      byDept.set(emp.department, entry);
    }

    return Array.from(byDept.entries())
      .map(([department, { total, present }]) => ({
        department,
        employeeCount: total,
        presentRate: total > 0 ? Math.round((present / total) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.presentRate - a.presentRate);
  },

  async getTopEmployeesByHoursForAdmin(
    limit: number,
  ): Promise<{ employeeId: string; employeeName: string; totalHours: number }[]> {
    await delay(300);
    const employees = ((await localStore.get<Employee[]>(KEYS.employees)) ?? []).filter(isAdminVisible);
    const attendanceMap = (await localStore.get<Record<string, AttendanceRecord[]>>(KEYS.attendanceByEmployee)) ?? {};

    const totals = employees.map((emp) => {
      const hours = (attendanceMap[emp.id] ?? []).reduce((sum, r) => sum + (r.workingHours ?? 0), 0);
      return { employeeId: emp.id, employeeName: emp.name, totalHours: Math.round(hours * 10) / 10 };
    });

    return totals.sort((a, b) => b.totalHours - a.totalHours).slice(0, limit);
  },

  async getAttendanceHeatmapForAdmin(
    days: number,
  ): Promise<{ employeeId: string; employeeName: string; days: { date: string; status: DayStatus }[] }[]> {
    await delay(400);
    const employees = ((await localStore.get<Employee[]>(KEYS.employees)) ?? []).filter(isAdminVisible);
    const attendanceMap = (await localStore.get<Record<string, AttendanceRecord[]>>(KEYS.attendanceByEmployee)) ?? {};
    const requestsMap = (await localStore.get<Record<string, LeaveRequest[]>>(KEYS.leaveRequestsByEmployee)) ?? {};

    const dates: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      dates.push(format(subDays(new Date(), i), 'yyyy-MM-dd'));
    }

    return employees.map((emp) => ({
      employeeId: emp.id,
      employeeName: emp.name,
      days: dates.map((date) => {
        const record = (attendanceMap[emp.id] ?? []).find((r) => r.date === date);
        return { date, status: dayStatusFor(date, record, requestsMap[emp.id] ?? []) };
      }),
    }));
  },

  async getAllLeaveRequestsForAdmin(): Promise<(LeaveRequest & { employeeId: string; employeeName: string })[]> {
    await delay();
    const map = (await localStore.get<Record<string, LeaveRequest[]>>(KEYS.leaveRequestsByEmployee)) ?? {};
    const employees = (await localStore.get<Employee[]>(KEYS.employees)) ?? [];
    const all: (LeaveRequest & { employeeId: string; employeeName: string })[] = [];
    for (const [employeeId, requests] of Object.entries(map)) {
      const emp = employees.find((e) => e.id === employeeId);
      if (!emp || !isAdminVisible(emp)) continue;
      requests.forEach((r) => all.push({ ...r, employeeId, employeeName: emp.name }));
    }
    return all.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  },

  // ---- Team roster views ----

  // The people who report directly to the current user (a manager's direct employees).
  async getMyTeam(token: string): Promise<Employee[]> {
    const leader = await resolveEmployeeForToken(token);
    await delay();
    const employees = (await localStore.get<Employee[]>(KEYS.employees)) ?? [];
    return employees.filter((e) => e.reportsToId === leader.id);
  },

  // ---- Manager approval chain ----
  // Admin has no direct approve/reject action: leave requests flow straight to the
  // employee's manager. Admin only monitors status.

  async getPendingApprovalsForManager(
    token: string,
  ): Promise<(LeaveRequest & { employeeId: string; employeeName: string })[]> {
    const manager = await resolveEmployeeForToken(token);
    await delay();
    const employees = (await localStore.get<Employee[]>(KEYS.employees)) ?? [];
    const reports = employees.filter((e) => e.reportsToId === manager.id);
    const requestsMap = (await localStore.get<Record<string, LeaveRequest[]>>(KEYS.leaveRequestsByEmployee)) ?? {};

    const pending: (LeaveRequest & { employeeId: string; employeeName: string })[] = [];
    for (const report of reports) {
      (requestsMap[report.id] ?? [])
        .filter((r) => r.status === 'Pending')
        .forEach((r) => pending.push({ ...r, employeeId: report.id, employeeName: report.name }));
    }
    return pending.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  },

  async decideAsManager(
    token: string,
    employeeId: string,
    requestId: string,
    decision: 'approve' | 'reject',
  ): Promise<void> {
    const manager = await resolveEmployeeForToken(token);
    await delay(400);

    const employees = (await localStore.get<Employee[]>(KEYS.employees)) ?? [];
    const target = employees.find((e) => e.id === employeeId);
    if (!target || target.reportsToId !== manager.id) {
      throw new ApiError('This request is not assigned to you.', 'FORBIDDEN');
    }

    const requestsMap = (await localStore.get<Record<string, LeaveRequest[]>>(KEYS.leaveRequestsByEmployee)) ?? {};
    const list = requestsMap[employeeId] ?? [];
    const request = list.find((r) => r.id === requestId);
    if (!request || request.status !== 'Pending') {
      throw new ApiError('This request is not awaiting your approval.', 'NOT_PENDING');
    }

    const nextStatus: LeaveStatus = decision === 'approve' ? 'Approved' : 'Rejected';
    requestsMap[employeeId] = list.map((r) => (r.id === requestId ? { ...r, status: nextStatus } : r));
    await localStore.set(KEYS.leaveRequestsByEmployee, requestsMap);

    if (decision === 'approve' && request.type !== 'Unpaid') {
      await deductLeaveBalance(employeeId, request);
    }
  },
};

async function deductLeaveBalance(employeeId: string, request: LeaveRequest): Promise<void> {
  const balancesMap = (await localStore.get<Record<string, LeaveBalance[]>>(KEYS.leaveBalancesByEmployee)) ?? {};
  const balances = balancesMap[employeeId] ?? freshLeaveBalances();
  balancesMap[employeeId] = balances.map((b) =>
    b.type === request.type ? { ...b, used: b.used + request.days } : b,
  );
  await localStore.set(KEYS.leaveBalancesByEmployee, balancesMap);
}
