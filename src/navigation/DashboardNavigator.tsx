import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { DashboardScreen } from '../features/dashboard/DashboardScreen';
import { AttendanceScreen } from '../features/attendance/AttendanceScreen';
import { useTheme } from '../theme/ThemeContext';
import type { DashboardStackParamList } from './types';

const Stack = createNativeStackNavigator<DashboardStackParamList>();

export function DashboardNavigator() {
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: theme.colors.primary,
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTitleStyle: { color: theme.colors.textPrimary },
      }}
    >
      <Stack.Screen
        name="DashboardHome"
        component={DashboardScreen}
        options={{ title: 'Home', headerLeft: () => <DrawerToggleButton tintColor={theme.colors.textPrimary} /> }}
      />
      <Stack.Screen name="Attendance" component={AttendanceScreen} options={{ title: 'Attendance' }} />
    </Stack.Navigator>
  );
}
