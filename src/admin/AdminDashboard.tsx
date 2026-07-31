import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWebTheme, type WebTheme } from './ThemeContext';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { AdminConfirmModal } from './components/AdminConfirmModal';
import { AdminSidebar, type SidebarItem } from './components/AdminSidebar';
import { SummaryPage } from './pages/SummaryPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { LeaveRequestsPage } from './pages/LeaveRequestsPage';
import { AttendanceSection as MyAttendanceSection, LeaveSection as MyLeaveSection } from './EmployeeWebDashboard';

export type AdminSection = 'summary' | 'employees' | 'leave' | 'myAttendance' | 'myLeave';

const ITEMS: SidebarItem<AdminSection>[] = [
  { key: 'summary', label: 'Overview', icon: 'view-dashboard-outline' },
  { key: 'employees', label: 'Employees', icon: 'account-group-outline' },
  { key: 'leave', label: 'Leave Requests', icon: 'calendar-clock-outline' },
  { key: 'myAttendance', label: 'My Attendance', icon: 'fingerprint' },
  { key: 'myLeave', label: 'My Leave', icon: 'calendar-account-outline' },
];

export function AdminDashboard() {
  const { theme } = useWebTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useAppDispatch();
  const employee = useAppSelector((s) => s.auth.employee);
  const [section, setSection] = useState<AdminSection>('summary');
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const confirmLogout = async () => {
    setLoggingOut(true);
    await dispatch(logout());
    setLoggingOut(false);
    setLogoutModalVisible(false);
  };

  return (
    <View style={styles.root}>
      <AdminSidebar active={section} onChange={setSection} items={ITEMS} brandLabel="WorkTrack Admin" />

      <View style={styles.contentArea}>
        <View style={styles.topBar}>
          <View />
          <View style={styles.topBarRight}>
            <Text style={styles.userName}>{employee?.name}</Text>
            <MaterialCommunityIcons
              name="logout"
              size={20}
              color={theme.colors.textMuted}
              onPress={() => setLogoutModalVisible(true)}
              suppressHighlighting
            />
          </View>
        </View>

        <View style={styles.pageArea}>
          {section === 'summary' && <SummaryPage />}
          {section === 'employees' && <EmployeesPage />}
          {section === 'leave' && <LeaveRequestsPage />}
          {section === 'myAttendance' && <MyAttendanceSection />}
          {section === 'myLeave' && <MyLeaveSection />}
        </View>
      </View>

      <AdminConfirmModal
        visible={logoutModalVisible}
        title="Log out"
        message="Are you sure you want to log out of the admin dashboard?"
        confirmLabel="Log Out"
        destructive
        loading={loggingOut}
        onConfirm={confirmLogout}
        onCancel={() => setLogoutModalVisible(false)}
      />
    </View>
  );
}

function createStyles(theme: WebTheme) {
  return StyleSheet.create({
    root: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: theme.colors.background,
    },
    contentArea: {
      flex: 1,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    topBarRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    userName: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
    },
    pageArea: {
      flex: 1,
    },
  });
}
