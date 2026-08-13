import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type DashboardStackParamList = {
  DashboardHome: undefined;
  Attendance: undefined;
};

export type LeaveStackParamList = {
  LeaveHome: undefined;
  ApplyLeave: undefined;
};

export type MainTabParamList = {
  DashboardTab: NavigatorScreenParams<DashboardStackParamList>;
  HistoryTab: undefined;
  LeaveTab: NavigatorScreenParams<LeaveStackParamList>;
  CalendarTab: undefined;
  ApprovalsTab: undefined;
  TeamTab: undefined;
  PayslipsTab: undefined;
  ProfileTab: undefined;
};

export type AdminTabParamList = {
  AdminOverviewTab: undefined;
  AdminEmployeesTab: undefined;
  AdminLeaveTab: undefined;
  AdminAttendanceTab: undefined;
  HistoryTab: undefined;
  AdminMyLeaveTab: NavigatorScreenParams<LeaveStackParamList>;
  CalendarTab: undefined;
  PayslipsTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  AdminMain: NavigatorScreenParams<AdminTabParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
