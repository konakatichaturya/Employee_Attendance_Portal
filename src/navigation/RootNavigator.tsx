import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { AdminTabNavigator } from './AdminTabNavigator';
import { Loader } from '../components/Loader';
import { useAppSelector } from '../store/hooks';
import { WebAppFrame } from '../components/WebAppFrame';
import { ChangePasswordScreen } from '../features/auth/ChangePasswordScreen';
import { NativeLandingPage } from '../marketing/NativeLandingPage';
import type { AuthStackParamList } from './types';

// Native (ios/android) fallback — Metro picks RootNavigator.web.tsx instead for
// every web build. Deliberately has NO import of the desktop admin
// dashboard module: it transitively pulls in jsPDF (a browser-only library)
// for payslip PDFs, and jsPDF's module-level code throws on Hermes if it's
// ever included in a native bundle. Keeping this file's import graph free of
// that is what prevents the crash. (NativeLandingPage is fine to import here
// — it's a native-safe port of the marketing site, not the web one.)
export function RootNavigator() {
  const status = useAppSelector((s) => s.auth.status);
  const employee = useAppSelector((s) => s.auth.employee);

  const [showLanding, setShowLanding] = useState(true);
  const [authInitialRoute, setAuthInitialRoute] = useState<keyof AuthStackParamList>('Login');

  // Whenever the user isn't authenticated (fresh launch, or just logged out),
  // the landing page is the front door again — same as the web behavior.
  useEffect(() => {
    if (status === 'unauthenticated') setShowLanding(true);
  }, [status]);

  if (status === 'idle' || status === 'checking') {
    return <Loader fullScreen label="Loading WorkTrack..." />;
  }

  if (status === 'authenticated' && employee?.mustChangePassword) {
    return <ChangePasswordScreen />;
  }

  if (status === 'unauthenticated' && showLanding) {
    return (
      <WebAppFrame>
        <NativeLandingPage
          onLogin={() => {
            setAuthInitialRoute('Login');
            setShowLanding(false);
          }}
          onGetStarted={() => {
            setAuthInitialRoute('Register');
            setShowLanding(false);
          }}
        />
      </WebAppFrame>
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
          <AuthNavigator initialRouteName={authInitialRoute} />
        )}
      </NavigationContainer>
    </WebAppFrame>
  );
}
