import { useMutation } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { profileApi } from '../services/api/profileApi';
import { authApi } from '../services/api/authApi';
import { updateEmployee } from '../store/slices/authSlice';
import type { Employee } from '../types';

export function useUpdateProfile() {
  const token = useAppSelector((s) => s.auth.token);
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (updates: Partial<Pick<Employee, 'phone' | 'avatarUri'>>) =>
      profileApi.update(token as string, updates),
    onSuccess: (employee) => {
      dispatch(updateEmployee(employee));
    },
  });
}

export function useChangePassword() {
  const token = useAppSelector((s) => s.auth.token);
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (newPassword: string) => authApi.changePassword(token as string, newPassword),
    onSuccess: (employee) => {
      dispatch(updateEmployee(employee));
    },
  });
}
