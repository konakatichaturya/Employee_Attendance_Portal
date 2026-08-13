import React, { useState } from 'react';
import { useWindowDimensions } from 'react-native';
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
import { LandingPage } from '../marketing/LandingPage';
import type { UserRole } from '../types';

// Below this viewport width, the desktop sidebar/panel web UI (built with fixed
// desktop-only widths) doesn't fit and breaks. A phone browser at the same public
// URL should instead get the same mobile-first UI as the native app.
const MOBILE_WEB_BREAKPOINT = 768;

// Metro resolves this file (not RootNavigator.tsx) for every web build, because
// of the `.web.tsx` suffix. That split matters: this file pulls in the desktop
// admin dashboard, which transitively imports jsPDF for payslip PDFs — a
// browser-only library whose module-level code crashes Hermes on native if it
// ever ends up in that bundle. Keeping the desktop-only import chain entirely
// out of RootNavigator.tsx (the native fallback) is what prevents that.
export function RootNavigator() {
  const status = useAppSelector((s) => s.auth.status);
  const employee = useAppSelector((s) => s.auth.employee);
  const { width } = useWindowDimensions();
  const isMobileWeb = width < MOBILE_WEB_BREAKPOINT;

  // Desktop web only: the marketing landing page is the front door for signed-out
  // visitors; picking Log In / Get Started there hands off into the existing
  // AdminAuthPage with the right persona/mode preset. Mobile-web skips straight
  // to AdminAuthPage/AuthNavigator as before — no landing page there.
  const [authEntry, setAuthEntry] = useState<{ persona: UserRole; mode: 'login' | 'register' } | null>(null);

  if (status === 'idle' || status === 'checking') {
    return <Loader fullScreen label="Loading WorkTrack..." />;
  }

  if (status === 'authenticated' && employee?.mustChangePassword) {
    return <ChangePasswordScreen />;
  }

  if (!isMobileWeb) {
    // Role-gating equivalent to a ProtectedRoute: unauthenticated users always land on
    // the login page, only admins ever reach AdminDashboard, and every other role gets
    // EmployeeWebDashboard (which further gates its Approvals section by role).
    return (
      <WebThemeProvider>
        {status !== 'authenticated' ? (
          authEntry ? (
            <AdminAuthPage
              initialPersona={authEntry.persona}
              initialMode={authEntry.mode}
              onBack={() => setAuthEntry(null)}
            />
          ) : (
            <LandingPage
              onLogin={() => setAuthEntry({ persona: 'employee', mode: 'login' })}
              onGetStarted={() => setAuthEntry({ persona: 'employee', mode: 'register' })}
            />
          )
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
