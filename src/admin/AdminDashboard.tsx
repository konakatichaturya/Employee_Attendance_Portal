import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWebTheme, type WebTheme, type WebThemeMode } from './ThemeContext';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { AdminConfirmModal } from './components/AdminConfirmModal';
import { AdminSidebar, type SidebarItem } from './components/AdminSidebar';
import { CalendarDrawer } from './components/CalendarDrawer';
import { DashboardBackdrop } from './components/DashboardBackdrop';
import { SummaryPage } from './pages/SummaryPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { LeaveRequestsPage } from './pages/LeaveRequestsPage';
import { AttendanceSection as MyAttendanceSection, LeaveSection as MyLeaveSection } from './EmployeeWebDashboard';
import { LeaveAssistantChat } from '../features/ai/LeaveAssistantChat';
import { PayslipsSection } from '../features/payroll/PayslipsSection';

export type AdminSection = 'summary' | 'employees' | 'leave' | 'calendar' | 'myAttendance' | 'myLeave' | 'payslips';

const ITEMS: SidebarItem<AdminSection>[] = [
  { key: 'summary', label: 'Overview', icon: 'view-dashboard-outline' },
  { key: 'employees', label: 'Employees', icon: 'account-group-outline' },
  { key: 'leave', label: 'Leave Requests', icon: 'calendar-clock-outline' },
  { key: 'calendar', label: 'Calendar', icon: 'calendar-month-outline', flyout: true },
  { key: 'myAttendance', label: 'My Attendance', icon: 'fingerprint' },
  { key: 'myLeave', label: 'My Leave', icon: 'calendar-account-outline' },
  { key: 'payslips', label: 'Payslips', icon: 'file-pdf-box' },
];

export function AdminDashboard() {
  const { theme, mode } = useWebTheme();
  const styles = useMemo(() => createStyles(theme, mode), [theme, mode]);
  const dispatch = useAppDispatch();
  const employee = useAppSelector((s) => s.auth.employee);
  const [section, setSection] = useState<AdminSection>('summary');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleSectionChange = (key: AdminSection) => {
    if (key === 'calendar') {
      setCalendarOpen(true);
    } else {
      setSection(key);
    }
  };

  const confirmLogout = async () => {
    setLoggingOut(true);
    await dispatch(logout());
    setLoggingOut(false);
    setLogoutModalVisible(false);
  };

  return (
    <View style={styles.root}>
      <DashboardBackdrop />
      <AdminSidebar
        active={calendarOpen ? 'calendar' : section}
        onChange={handleSectionChange}
        items={ITEMS}
        brandLabel="WorkTrack Admin"
      />

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
          {section === 'payslips' && <PayslipsSection />}
        </View>
      </View>

      <CalendarDrawer open={calendarOpen} onClose={() => setCalendarOpen(false)} manageable />

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

      <LeaveAssistantChat theme={theme} />
    </View>
  );
}

function createStyles(theme: WebTheme, mode: WebThemeMode) {
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
      borderBottomColor: 'rgba(255,255,255,0.12)',
      backgroundColor: mode === 'dark' ? 'rgba(24,29,48,0.5)' : 'rgba(255,255,255,0.5)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    } as any,
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
