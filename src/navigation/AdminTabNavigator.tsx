import React from 'react';
import { View } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeLeaveAssistant } from '../features/ai/NativeLeaveAssistant';
import { AdminOverviewScreen } from '../features/admin/AdminOverviewScreen';
import { AdminEmployeesScreen } from '../features/admin/AdminEmployeesScreen';
import { AdminLeaveScreen } from '../features/admin/AdminLeaveScreen';
import { LeaveNavigator } from './LeaveNavigator';
import { AdminAttendanceScreen } from '../features/admin/AdminAttendanceScreen';
import { AttendanceHistoryScreen } from '../features/history/AttendanceHistoryScreen';
import { CalendarScreen } from '../features/calendar/CalendarScreen';
import { PayslipsScreen } from '../features/payroll/PayslipsScreen';
import { ProfileScreen } from '../features/profile/ProfileScreen';
import { AppDrawerContent } from './AppDrawerContent';
import { useTheme } from '../theme/ThemeContext';
import type { AdminTabParamList } from './types';

const Drawer = createDrawerNavigator<AdminTabParamList>();

const ICONS: Record<keyof AdminTabParamList, keyof typeof MaterialCommunityIcons.glyphMap> = {
  AdminOverviewTab: 'view-dashboard',
  AdminEmployeesTab: 'account-group',
  AdminLeaveTab: 'calendar-clock',
  AdminAttendanceTab: 'fingerprint',
  HistoryTab: 'history',
  AdminMyLeaveTab: 'calendar-account',
  CalendarTab: 'calendar-month',
  PayslipsTab: 'file-pdf-box',
  ProfileTab: 'account-circle',
};

export function AdminTabNavigator() {
  const { theme } = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <Drawer.Navigator
        drawerContent={(props) => <AppDrawerContent {...props} icons={ICONS} />}
        screenOptions={{
          headerShown: true,
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.textPrimary,
          headerTitleStyle: { ...theme.typography.subtitle, color: theme.colors.textPrimary },
          drawerType: 'front',
          sceneStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Drawer.Screen name="AdminOverviewTab" component={AdminOverviewScreen} options={{ title: 'Overview' }} />
        <Drawer.Screen name="AdminEmployeesTab" component={AdminEmployeesScreen} options={{ title: 'Employees' }} />
        <Drawer.Screen name="AdminLeaveTab" component={AdminLeaveScreen} options={{ title: 'Leave' }} />
        <Drawer.Screen name="AdminAttendanceTab" component={AdminAttendanceScreen} options={{ title: 'Attendance' }} />
        <Drawer.Screen name="HistoryTab" component={AttendanceHistoryScreen} options={{ title: 'History' }} />
        {/* My Leave hosts a nested stack with its own header (and drawer-toggle button) —
            the outer drawer header is suppressed here to avoid a double header bar. */}
        <Drawer.Screen name="AdminMyLeaveTab" component={LeaveNavigator} options={{ title: 'My Leave', headerShown: false }} />
        <Drawer.Screen name="CalendarTab" component={CalendarScreen} options={{ title: 'Calendar' }} />
        <Drawer.Screen name="PayslipsTab" component={PayslipsScreen} options={{ title: 'Payslips' }} />
        <Drawer.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
      </Drawer.Navigator>

      <NativeLeaveAssistant />
    </View>
  );
}
