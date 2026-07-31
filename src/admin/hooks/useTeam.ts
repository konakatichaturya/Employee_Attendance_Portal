import { useQuery } from '@tanstack/react-query';
import { teamApi } from '../../services/api/teamApi';
import { useAppSelector } from '../../store/hooks';

export function useMyTeam() {
  const token = useAppSelector((s) => s.auth.token);
  return useQuery({
    queryKey: ['team', 'my-team', token],
    queryFn: () => teamApi.getMyTeam(token as string),
    enabled: !!token,
  });
}
