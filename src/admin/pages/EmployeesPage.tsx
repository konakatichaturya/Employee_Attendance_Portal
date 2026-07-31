import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { format, parseISO } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AdminCard as Card } from '../components/AdminCard';
import { AdminLoader as Loader } from '../components/AdminLoader';
import { AdminEmptyState as EmptyState } from '../components/AdminEmptyState';
import { AppButton } from '../../components/AppButton';
import { CreateManagerModal } from '../components/CreateManagerModal';
import { CreateEmployeeModal } from '../components/CreateEmployeeModal';
import { useWebTheme, type WebTheme } from '../ThemeContext';
import { getInitials } from '../../utils/getInitials';
import { useAdminEmployeeAttendance, useAdminEmployees } from '../hooks/useAdminData';
import type { Employee } from '../../types';

export function EmployeesPage() {
  const { theme } = useWebTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const employeesQuery = useAdminEmployees();
  const employees = employeesQuery.data ?? [];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createManagerVisible, setCreateManagerVisible] = useState(false);
  const [createEmployeeVisible, setCreateEmployeeVisible] = useState(false);
  const selected = employees.find((e) => e.id === selectedId) ?? employees[0] ?? null;

  if (employeesQuery.isLoading) {
    return <Loader label="Loading employees..." />;
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.heading}>Employees</Text>
          <Text style={styles.subheading}>{employees.length} employees in the company roster</Text>
        </View>
        <View style={styles.headerActions}>
          <AppButton
            label="Create Manager"
            onPress={() => setCreateManagerVisible(true)}
            icon={<MaterialCommunityIcons name="account-plus-outline" size={18} color={theme.colors.onPrimary} />}
            fullWidth={false}
            style={styles.createButton}
          />
          <AppButton
            label="Create Employee"
            onPress={() => setCreateEmployeeVisible(true)}
            icon={<MaterialCommunityIcons name="account-plus-outline" size={18} color={theme.colors.onPrimary} />}
            fullWidth={false}
            style={styles.createButton}
          />
        </View>
      </View>

      <CreateManagerModal visible={createManagerVisible} onClose={() => setCreateManagerVisible(false)} />
      <CreateEmployeeModal visible={createEmployeeVisible} onClose={() => setCreateEmployeeVisible(false)} />

      {employees.length === 0 ? (
        <EmptyState
          icon="account-group-outline"
          title="No employees yet"
          message="Employees will appear here once they register in the WorkTrack mobile app."
        />
      ) : (
        <View style={styles.layoutRow}>
          <Card style={styles.rosterCard} padded={false}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.headerCell, styles.nameCol]}>Name</Text>
              <Text style={[styles.headerCell, styles.metaCol]}>Role</Text>
              <Text style={[styles.headerCell, styles.metaCol]}>Department</Text>
              <Text style={[styles.headerCell, styles.metaCol]}>ID</Text>
            </View>
            {employees.map((emp) => {
              const isActive = selected?.id === emp.id;
              return (
                <Pressable
                  key={emp.id}
                  onPress={() => setSelectedId(emp.id)}
                  style={[styles.row, isActive && styles.rowActive]}
                >
                  <View style={[styles.nameCol, styles.nameCell]}>
                    <View style={styles.avatarSmall}>
                      <Text style={styles.avatarSmallText}>{getInitials(emp.name)}</Text>
                    </View>
                    <View>
                      <Text style={styles.nameText}>{emp.name}</Text>
                      <Text style={styles.designationText}>{emp.email}</Text>
                    </View>
                  </View>
                  <View style={styles.metaCol}>
                    <RoleBadge role={emp.role} />
                  </View>
                  <Text style={[styles.metaCol, styles.metaText]}>{emp.department}</Text>
                  <Text style={[styles.metaCol, styles.metaText]}>{emp.id}</Text>
                </Pressable>
              );
            })}
          </Card>

          {selected && <EmployeeDetail employee={selected} allEmployees={employees} onSelect={setSelectedId} />}
        </View>
      )}
    </ScrollView>
  );
}

function RoleBadge({ role }: { role: Employee['role'] }) {
  const { theme } = useWebTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const meta: Record<Employee['role'], { label: string; bg: string; text: string }> = {
    admin: { label: 'Admin', bg: theme.colors.dangerBg, text: theme.colors.danger },
    manager: { label: 'Manager', bg: theme.colors.primaryLight, text: theme.colors.primary },
    employee: { label: 'Employee', bg: theme.colors.surfaceAlt, text: theme.colors.textSecondary },
  };
  const { label, bg, text } = meta[role];
  return (
    <View style={[styles.roleBadge, { backgroundColor: bg }]}>
      <Text style={[styles.roleBadgeText, { color: text }]}>{label}</Text>
    </View>
  );
}

function EmployeeDetail({
  employee,
  allEmployees,
  onSelect,
}: {
  employee: Employee;
  allEmployees: Employee[];
  onSelect: (id: string) => void;
}) {
  const { theme } = useWebTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const attendanceQuery = useAdminEmployeeAttendance(employee.id);
  const attendance = attendanceQuery.data ?? [];
  const teamMembers = allEmployees.filter((e) => e.reportsToId === employee.id);

  return (
    <Card style={styles.detailCard}>
      <View style={styles.detailHeader}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarLargeText}>{getInitials(employee.name)}</Text>
        </View>
        <View>
          <Text style={styles.detailName}>{employee.name}</Text>
          <Text style={styles.detailMeta}>
            {employee.department} · {employee.phone}
          </Text>
          <Text style={styles.detailMeta}>{employee.id}</Text>
        </View>
      </View>

      {employee.role === 'manager' && (
        <>
          <Text style={styles.detailSectionTitle}>Team ({teamMembers.length})</Text>
          {teamMembers.length === 0 ? (
            <Text style={styles.emptyReportText}>No one reports to this manager yet.</Text>
          ) : (
            <View style={styles.teamList}>
              {teamMembers.map((member) => (
                <Pressable key={member.id} onPress={() => onSelect(member.id)} style={styles.teamMemberRow}>
                  <View style={styles.avatarSmall}>
                    <Text style={styles.avatarSmallText}>{getInitials(member.name)}</Text>
                  </View>
                  <View style={styles.teamMemberInfo}>
                    <Text style={styles.nameText}>{member.name}</Text>
                    <Text style={styles.designationText}>
                      {member.department} · {member.id}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
          <View style={styles.sectionSpacer} />
        </>
      )}

      <Text style={styles.detailSectionTitle}>In/Out Report</Text>
      {attendance.length === 0 ? (
        <Text style={styles.emptyReportText}>No attendance records yet.</Text>
      ) : (
        <>
          <View style={styles.reportHeaderRow}>
            <Text style={[styles.reportHeaderCell, styles.dateCol]}>Date</Text>
            <Text style={[styles.reportHeaderCell, styles.timeCol]}>Checked In</Text>
            <Text style={[styles.reportHeaderCell, styles.timeCol]}>Checked Out</Text>
            <Text style={[styles.reportHeaderCell, styles.hoursCol]}>Hours</Text>
          </View>
          {attendance.slice(0, 10).map((day) => (
            <View key={day.date} style={styles.reportRow}>
              <Text style={[styles.dateCol, styles.reportCell]}>{format(parseISO(day.date), 'dd MMM')}</Text>
              <Text style={[styles.timeCol, styles.reportCell]}>
                {day.checkInTime ? format(parseISO(day.checkInTime), 'hh:mm a') : '--:--'}
              </Text>
              <Text style={[styles.timeCol, styles.reportCell]}>
                {day.checkOutTime ? format(parseISO(day.checkOutTime), 'hh:mm a') : '--:--'}
              </Text>
              <Text style={[styles.hoursCol, styles.reportCell]}>{day.workingHours ?? '--'}</Text>
            </View>
          ))}
        </>
      )}
    </Card>
  );
}

function createStyles(theme: WebTheme) {
  return StyleSheet.create({
    content: {
      padding: theme.spacing.xl,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    headerActions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    createButton: {
      marginTop: 4,
    },
    heading: {
      ...theme.typography.h1,
      color: theme.colors.textPrimary,
    },
    subheading: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      marginTop: 2,
      marginBottom: theme.spacing.lg,
    },
    layoutRow: {
      flexDirection: 'row',
      gap: theme.spacing.lg,
      alignItems: 'flex-start',
    },
    rosterCard: {
      flex: 1,
      minWidth: 380,
    },
    tableHeaderRow: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerCell: {
      ...theme.typography.captionMedium,
      color: theme.colors.textMuted,
    },
    nameCol: {
      flex: 2,
    },
    metaCol: {
      flex: 1,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    rowActive: {
      backgroundColor: theme.colors.primaryLight,
    },
    nameCell: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    avatarSmall: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarSmallText: {
      ...theme.typography.captionMedium,
      color: theme.colors.textInverse,
    },
    nameText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
    },
    designationText: {
      ...theme.typography.caption,
      color: theme.colors.textMuted,
    },
    metaText: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
    },
    roleBadge: {
      alignSelf: 'flex-start',
      paddingVertical: 3,
      paddingHorizontal: 8,
      borderRadius: theme.radius.pill,
    },
    roleBadgeText: {
      ...theme.typography.captionMedium,
    },
    detailCard: {
      flex: 1,
      minWidth: 380,
    },
    detailHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    avatarLarge: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarLargeText: {
      ...theme.typography.h3,
      color: theme.colors.textInverse,
    },
    detailName: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
    },
    detailMeta: {
      ...theme.typography.caption,
      color: theme.colors.textMuted,
    },
    teamList: {
      gap: 4,
      marginBottom: theme.spacing.sm,
    },
    teamMemberRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingVertical: 8,
      paddingHorizontal: 4,
      borderRadius: theme.radius.sm,
    },
    teamMemberInfo: {
      flex: 1,
    },
    sectionSpacer: {
      height: theme.spacing.md,
    },
    detailSectionTitle: {
      ...theme.typography.subtitle,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm,
    },
    emptyReportText: {
      ...theme.typography.body,
      color: theme.colors.textMuted,
    },
    reportHeaderRow: {
      flexDirection: 'row',
      paddingVertical: 6,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    reportHeaderCell: {
      ...theme.typography.captionMedium,
      color: theme.colors.textMuted,
    },
    dateCol: {
      flex: 1,
    },
    timeCol: {
      flex: 1,
    },
    hoursCol: {
      width: 50,
      textAlign: 'right',
    },
    reportRow: {
      flexDirection: 'row',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    reportCell: {
      ...theme.typography.body,
      color: theme.colors.textPrimary,
    },
  });
}
