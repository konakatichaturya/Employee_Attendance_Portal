import React from 'react';
import { Platform, useWindowDimensions } from 'react-native';
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

// Below this viewport width, the desktop sidebar/panel web UI (built with fixed
// desktop-only widths) doesn't fit and breaks. A phone browser at the same public
// URL should instead get the same mobile-first UI as the native app.
const MOBILE_WEB_BREAKPOINT = 768;

export function RootNavigator() {
  const status = useAppSelector((s) => s.auth.status);
  const employee = useAppSelector((s) => s.auth.employee);
  const { width } = useWindowDimensions();
  const isMobileWeb = Platform.OS === 'web' && width < MOBILE_WEB_BREAKPOINT;

  if (status === 'idle' || status === 'checking') {
    return <Loader fullScreen label="Loading WorkTrack..." />;
  }

  if (status === 'authenticated' && employee?.mustChangePassword) {
    return <ChangePasswordScreen />;
  }

  if (Platform.OS === 'web' && !isMobileWeb) {
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
