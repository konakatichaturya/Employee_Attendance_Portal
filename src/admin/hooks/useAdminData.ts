import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mockServer } from '../../services/mock/mockServer';
import { useAppSelector } from '../../store/hooks';

export function useAdminEmployees() {
  return useQuery({
    queryKey: ['admin', 'employees'],
    queryFn: () => mockServer.getAllEmployeesForAdmin(),
  });
}

export function useAdminOverviewStats() {
  return useQuery({
    queryKey: ['admin', 'overview-stats'],
    queryFn: () => mockServer.getAdminOverviewStats(),
  });
}

export function useAdminAttendanceTrend(days: number) {
  return useQuery({
    queryKey: ['admin', 'trend', days],
    queryFn: () => mockServer.getAttendanceTrendForAdmin(days),
  });
}

export function useAdminDepartmentBreakdown() {
  return useQuery({
    queryKey: ['admin', 'department-breakdown'],
    queryFn: () => mockServer.getDepartmentBreakdownForAdmin(),
  });
}

export function useAdminTopEmployees(limit: number) {
  return useQuery({
    queryKey: ['admin', 'top-employees', limit],
    queryFn: () => mockServer.getTopEmployeesByHoursForAdmin(limit),
  });
}

export function useAdminHeatmap(days: number) {
  return useQuery({
    queryKey: ['admin', 'heatmap', days],
    queryFn: () => mockServer.getAttendanceHeatmapForAdmin(days),
  });
}

export function useAdminEmployeeAttendance(employeeId: string | null) {
  return useQuery({
    queryKey: ['admin', 'attendance', employeeId],
    queryFn: () => mockServer.getEmployeeAttendanceForAdmin(employeeId as string),
    enabled: !!employeeId,
  });
}

export function useAdminLeaveRequests() {
  return useQuery({
    queryKey: ['admin', 'leave-requests'],
    queryFn: () => mockServer.getAllLeaveRequestsForAdmin(),
  });
}

export function useManagers() {
  return useQuery({
    queryKey: ['managers-for-assignment'],
    queryFn: () => mockServer.getManagers(),
  });
}

export function useCreateManager() {
  const token = useAppSelector((s) => s.auth.token);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { employeeId: string; name: string; email: string; phone: string; department: string; password: string }) =>
      mockServer.createManager(token as string, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'employees'] });
      queryClient.invalidateQueries({ queryKey: ['managers-for-assignment'] });
    },
  });
}

export function useCreateEmployee() {
  const token = useAppSelector((s) => s.auth.token);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      employeeId: string;
      name: string;
      email: string;
      phone: string;
      department: string;
      password: string;
      managerId: string;
    }) => mockServer.createEmployee(token as string, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'employees'] });
    },
  });
}
