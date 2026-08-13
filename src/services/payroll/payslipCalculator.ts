import { addDays, format, getDaysInMonth, parseISO } from 'date-fns';
import type { Employee, LeaveBalance, LeaveRequest, LeaveType } from '../../types';

export interface PayslipDeductionLine {
  type: LeaveType;
  days: number;
}

export interface Payslip {
  year: number;
  month: number; // 1-12
  monthLabel: string;
  baseSalary: number;
  daysInMonth: number;
  perDayRate: number;
  deductedDays: number;
  deductionAmount: number;
  netPay: number;
  deductions: PayslipDeductionLine[];
}

const PAID_TYPES: LeaveType[] = ['Casual', 'Sick', 'Earned'];

function monthKey(date: Date): string {
  return format(date, 'yyyy-MM');
}

/**
 * Deterministic, rule-based payroll math (no real payroll system exists here,
 * same spirit as the app's other "AI" features). Casual/Sick/Earned leave is
 * unpaid-neutral as long as it stays within that type's balance; once
 * cumulative usage for a type crosses its total, the extra days — plus any
 * leave explicitly taken as Unpaid — are deducted at a per-calendar-day rate
 * for whichever month those specific days fall in.
 */
export function calculatePayslip(
  employee: Pick<Employee, 'monthlySalary'>,
  balances: LeaveBalance[],
  requests: LeaveRequest[],
  year: number,
  month: number,
): Payslip {
  const baseSalary = employee.monthlySalary;
  const targetKey = `${year}-${String(month).padStart(2, '0')}`;
  const approved = requests.filter((r) => r.status === 'Approved');
  const deductedByType = new Map<LeaveType, number>();

  const addDeduction = (type: LeaveType, day: Date) => {
    if (monthKey(day) !== targetKey) return;
    deductedByType.set(type, (deductedByType.get(type) ?? 0) + 1);
  };

  PAID_TYPES.forEach((type) => {
    const total = balances.find((b) => b.type === type)?.total ?? 0;
    const typeRequests = approved.filter((r) => r.type === type).sort((a, b) => a.fromDate.localeCompare(b.fromDate));

    let usedSoFar = 0;
    typeRequests.forEach((req) => {
      const end = parseISO(req.toDate);
      let day = parseISO(req.fromDate);
      while (day <= end) {
        usedSoFar += 1;
        if (usedSoFar > total) addDeduction(type, day);
        day = addDays(day, 1);
      }
    });
  });

  approved
    .filter((r) => r.type === 'Unpaid')
    .forEach((req) => {
      const end = parseISO(req.toDate);
      let day = parseISO(req.fromDate);
      while (day <= end) {
        addDeduction('Unpaid', day);
        day = addDays(day, 1);
      }
    });

  const deductions: PayslipDeductionLine[] = Array.from(deductedByType.entries())
    .map(([type, days]) => ({ type, days }))
    .sort((a, b) => b.days - a.days);
  const deductedDays = deductions.reduce((sum, d) => sum + d.days, 0);

  const daysInMonth = getDaysInMonth(new Date(year, month - 1, 1));
  const perDayRate = daysInMonth > 0 ? baseSalary / daysInMonth : 0;
  const deductionAmount = Math.round(perDayRate * deductedDays);
  const netPay = Math.max(0, Math.round(baseSalary - deductionAmount));

  return {
    year,
    month,
    monthLabel: format(new Date(year, month - 1, 1), 'MMMM yyyy'),
    baseSalary,
    daysInMonth,
    perDayRate,
    deductedDays,
    deductionAmount,
    netPay,
    deductions,
  };
}

/** Last `count` months (most recent first), including the current one. */
export function recentMonths(count: number, from: Date = new Date()): { year: number; month: number }[] {
  const months: { year: number; month: number }[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(from.getFullYear(), from.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }
  return months;
}
