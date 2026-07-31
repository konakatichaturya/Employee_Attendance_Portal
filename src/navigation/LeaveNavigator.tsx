import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { LeaveStatusScreen } from '../features/leave/LeaveStatusScreen';
import { ApplyLeaveScreen } from '../features/leave/ApplyLeaveScreen';
import { useTheme } from '../theme/ThemeContext';
import type { LeaveStackParamList } from './types';

const Stack = createNativeStackNavigator<LeaveStackParamList>();

export function LeaveNavigator() {
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
        name="LeaveHome"
        component={LeaveStatusScreen}
        options={{ title: 'Leave', headerLeft: () => <DrawerToggleButton tintColor={theme.colors.textPrimary} /> }}
      />
      <Stack.Screen name="ApplyLeave" component={ApplyLeaveScreen} options={{ title: 'Apply Leave' }} />
    </Stack.Navigator>
  );
}
