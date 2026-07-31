import { mockServer } from '../mock/mockServer';
import type { LeaveBalance, LeaveRequest, LeaveType } from '../../types';

export const leaveApi = {
  getBalances(token: string): Promise<LeaveBalance[]> {
    return mockServer.getLeaveBalances(token);
  },
  getRequests(token: string): Promise<LeaveRequest[]> {
    return mockServer.getLeaveRequests(token);
  },
  apply(
    token: string,
    input: { type: LeaveType; fromDate: string; toDate: string; reason: string; days: number },
  ): Promise<LeaveRequest> {
    return mockServer.applyLeave(token, input);
  },
};
