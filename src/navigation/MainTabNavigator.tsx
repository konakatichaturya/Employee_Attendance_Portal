import React from 'react';
import { View } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeLeaveAssistant } from '../features/ai/NativeLeaveAssistant';
import { DashboardNavigator } from './DashboardNavigator';
import { LeaveNavigator } from './LeaveNavigator';
import { AttendanceHistoryScreen } from '../features/history/AttendanceHistoryScreen';
import { CalendarScreen } from '../features/calendar/CalendarScreen';
import { ApprovalsScreen } from '../features/approvals/ApprovalsScreen';
import { MyTeamScreen } from '../features/team/MyTeamScreen';
import { PayslipsScreen } from '../features/payroll/PayslipsScreen';
import { ProfileScreen } from '../features/profile/ProfileScreen';
import { AppDrawerContent } from './AppDrawerContent';
import { useTheme } from '../theme/ThemeContext';
import { useAppSelector } from '../store/hooks';
import type { MainTabParamList } from './types';

const Drawer = createDrawerNavigator<MainTabParamList>();

const ICONS: Record<keyof MainTabParamList, keyof typeof MaterialCommunityIcons.glyphMap> = {
  DashboardTab: 'view-dashboard',
  HistoryTab: 'history',
  LeaveTab: 'calendar-text',
  CalendarTab: 'calendar-month',
  ApprovalsTab: 'clipboard-check-outline',
  TeamTab: 'account-group',
  PayslipsTab: 'file-pdf-box',
  ProfileTab: 'account-circle',
};

export function MainTabNavigator() {
  const { theme } = useTheme();
  const employee = useAppSelector((s) => s.auth.employee);
  const role = employee?.role;

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
        {/* Dashboard and Leave host nested stacks with their own headers (and drawer-toggle
            button) — the outer drawer header is suppressed for those two to avoid a
            double header bar. */}
        <Drawer.Screen name="DashboardTab" component={DashboardNavigator} options={{ title: 'Home', headerShown: false }} />
        <Drawer.Screen name="HistoryTab" component={AttendanceHistoryScreen} options={{ title: 'History' }} />
        <Drawer.Screen name="LeaveTab" component={LeaveNavigator} options={{ title: 'Leave', headerShown: false }} />
        <Drawer.Screen name="CalendarTab" component={CalendarScreen} options={{ title: 'Calendar' }} />
        {role === 'manager' && (
          <>
            <Drawer.Screen name="ApprovalsTab" component={ApprovalsScreen} options={{ title: 'Approvals' }} />
            <Drawer.Screen name="TeamTab" component={MyTeamScreen} options={{ title: 'My Team' }} />
          </>
        )}
        <Drawer.Screen name="PayslipsTab" component={PayslipsScreen} options={{ title: 'Payslips' }} />
        <Drawer.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
      </Drawer.Navigator>

      <NativeLeaveAssistant />
    </View>
  );
}
