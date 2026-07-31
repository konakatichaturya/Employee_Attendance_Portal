import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { AdminTabNavigator } from './AdminTabNavigator';
import { Loader } from '../components/Loader';
import { useAppSelector } from '../store/hooks';
import { AdminDashboard } from '../admin/AdminDashboard';
import { EmployeeWebDashboard } from '../admin/EmployeeWebDashboard';
import { AdminAuthPage } from '../admin/AdminAuthPage';
import { WebThemeProvider } from '../admin/ThemeContext';
import { WebAppFrame } from '../components/WebAppFrame';
import { ChangePasswordScreen } from '../features/auth/ChangePasswordScreen';

export function RootNavigator() {
  const status = useAppSelector((s) => s.auth.status);
  const employee = useAppSelector((s) => s.auth.employee);

  if (status === 'idle' || status === 'checking') {
    return <Loader fullScreen label="Loading WorkTrack..." />;
  }

  if (status === 'authenticated' && employee?.mustChangePassword) {
    return <ChangePasswordScreen />;
  }

  if (Platform.OS === 'web') {
    // Role-gating equivalent to a ProtectedRoute: unauthenticated users always land on
    // the login page, only admins ever reach AdminDashboard, and every other role gets
    // EmployeeWebDashboard (which further gates its Approvals section by role).
    return (
      <WebThemeProvider>
        {status !== 'authenticated' ? (
          <AdminAuthPage />
        ) : employee?.role === 'admin' ? (
          <AdminDashboard />
        ) : (
          <EmployeeWebDashboard />
        )}
      </WebThemeProvider>
    );
  }

  return (
    <WebAppFrame>
      <NavigationContainer>
        {status === 'authenticated' ? (
          employee?.role === 'admin' ? (
            <AdminTabNavigator />
          ) : (
            <MainTabNavigator />
          )
        ) : (
          <AuthNavigator />
        )}
      </NavigationContainer>
    </WebAppFrame>
  );
}
