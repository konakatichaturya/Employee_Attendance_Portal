import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mockServer } from '../../services/mock/mockServer';
import { useAppSelector } from '../../store/hooks';

export function usePendingApprovalsForManager() {
  const token = useAppSelector((s) => s.auth.token);
  return useQuery({
    queryKey: ['approvals', 'manager', token],
    queryFn: () => mockServer.getPendingApprovalsForManager(token as string),
    enabled: !!token,
  });
}

export function useDecideAsManager() {
  const token = useAppSelector((s) => s.auth.token);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, requestId, decision }: { employeeId: string; requestId: string; decision: 'approve' | 'reject' }) =>
      mockServer.decideAsManager(token as string, employeeId, requestId, decision),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['leave'] });
    },
  });
}
