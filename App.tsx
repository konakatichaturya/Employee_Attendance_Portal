import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import {
  useFonts,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
} from '@expo-google-fonts/fredoka';
import { store } from './src/store/store';
import { useAppDispatch, useAppSelector } from './src/store/hooks';
import { bootstrapAuth, forceUnauthenticated } from './src/store/slices/authSlice';
import { registerUnauthorizedHandler } from './src/services/api/client';
import { initDb } from './src/services/storage/db';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useAttendanceOfflineSync } from './src/hooks/useAttendanceOfflineSync';
import { useLeaveDecisionNotifications } from './src/hooks/useLeaveDecisionNotifications';
import { Loader } from './src/components/Loader';
import { NativeThemeProvider, useTheme } from './src/theme/ThemeContext';
import { toastConfig } from './src/components/toastConfig';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function AppBootstrap() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((s) => s.auth.status);
  const [dbReady, setDbReady] = useState(false);
  const [fontsLoaded] = useFonts({ Fredoka_600SemiBold, Fredoka_700Bold });

  useAttendanceOfflineSync();
  useLeaveDecisionNotifications();

  useEffect(() => {
    registerUnauthorizedHandler(() => dispatch(forceUnauthenticated()));

    (async () => {
      await initDb();
      setDbReady(true);
      dispatch(bootstrapAuth());
    })();
  }, [dispatch]);

  if (!dbReady || !fontsLoaded || status === 'idle') {
    return <Loader fullScreen label="Loading WorkTrack..." />;
  }

  return <RootNavigator />;
}

function ThemedApp() {
  const { mode, paperTheme } = useTheme();
  return (
    <PaperProvider theme={paperTheme}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <AppBootstrap />
      <Toast config={toastConfig} />
    </PaperProvider>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <NativeThemeProvider>
              <ThemedApp />
            </NativeThemeProvider>
          </QueryClientProvider>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
