import { mockServer } from '../mock/mockServer';
import type { Employee } from '../../types';

export const profileApi = {
  update(token: string, updates: Partial<Pick<Employee, 'phone' | 'avatarUri'>>): Promise<Employee> {
    return mockServer.updateProfile(token, updates);
  },
};
