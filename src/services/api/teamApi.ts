import { mockServer } from '../mock/mockServer';
import type { Employee } from '../../types';

export const teamApi = {
  getMyTeam(token: string): Promise<Employee[]> {
    return mockServer.getMyTeam(token);
  },
};
