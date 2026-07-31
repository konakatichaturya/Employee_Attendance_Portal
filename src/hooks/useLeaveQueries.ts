import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '../store/hooks';
import { leaveApi } from '../services/api/leaveApi';
import type { LeaveType } from '../types';

export function useLeaveBalances() {
  const token = useAppSelector((s) => s.auth.token);
  return useQuery({
    queryKey: ['leave', 'balances', token],
    queryFn: () => leaveApi.getBalances(token as string),
    enabled: !!token,
  });
}

export function useLeaveRequests() {
  const token = useAppSelector((s) => s.auth.token);
  return useQuery({
    queryKey: ['leave', 'requests', token],
    queryFn: () => leaveApi.getRequests(token as string),
    enabled: !!token,
  });
}

interface ApplyLeaveInput {
  type: LeaveType;
  fromDate: string;
  toDate: string;
  reason: string;
  days: number;
}

export function useApplyLeave() {
  const token = useAppSelector((s) => s.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ApplyLeaveInput) => leaveApi.apply(token as string, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave'] });
    },
  });
}
