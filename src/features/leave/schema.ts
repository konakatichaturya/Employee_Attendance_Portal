import { z } from 'zod';
import { differenceInCalendarDays, isBefore, startOfDay } from 'date-fns';

export const LEAVE_TYPES = ['Casual', 'Sick', 'Earned', 'Unpaid'] as const;

export const applyLeaveSchema = z
  .object({
    type: z.enum(LEAVE_TYPES),
    fromDate: z.date({ message: 'From date is required' }),
    toDate: z.date({ message: 'To date is required' }),
    reason: z.string().min(10, 'Reason must be at least 10 characters'),
  })
  .refine((data) => !isBefore(startOfDay(data.fromDate), startOfDay(new Date())), {
    message: 'From date cannot be in the past',
    path: ['fromDate'],
  })
  .refine((data) => !isBefore(startOfDay(data.toDate), startOfDay(new Date())), {
    message: 'To date cannot be in the past',
    path: ['toDate'],
  })
  .refine((data) => !isBefore(startOfDay(data.toDate), startOfDay(data.fromDate)), {
    message: 'To date must be on or after the from date',
    path: ['toDate'],
  });

export type ApplyLeaveFormValues = z.infer<typeof applyLeaveSchema>;

export function calculateLeaveDays(fromDate: Date, toDate: Date): number {
  return differenceInCalendarDays(startOfDay(toDate), startOfDay(fromDate)) + 1;
}
