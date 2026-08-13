import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { GlassCard } from '../../components/GlassCard';
import { Loader } from '../../components/Loader';
import { EmptyState } from '../../components/EmptyState';
import { AppButton } from '../../components/AppButton';
import { VideoHero } from '../../components/VideoHero';
import { GradientBlobBackdrop } from '../../components/GradientBlobBackdrop';
import { CreateManagerModal } from './components/CreateManagerModal';
import { CreateEmployeeModal } from './components/CreateEmployeeModal';
import { useTheme, type Theme } from '../../theme/ThemeContext';
import { useAdminEmployees } from '../../admin/hooks/useAdminData';
import { getInitials } from '../../utils/getInitials';
import { NATIVE_VIDEO } from '../../constants/nativeMedia';
import type { Employee } from '../../types';

export function AdminEmployeesScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const ROLE_META: Record<Employee['role'], { label: string; color: string; bg: string }> = useMemo(
    () => ({
      admin: { label: 'Admin', color: theme.colors.danger, bg: theme.colors.dangerBg },
      manager: { label: 'Manager', color: theme.colors.primary, bg: theme.colors.primaryLight },
      employee: { label: 'Employee', color: theme.colors.textSecondary, bg: theme.colors.surfaceAlt },
    }),
    [theme],
  );
  const employeesQuery = useAdminEmployees();
  const employees = employeesQuery.data ?? [];
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [createManagerVisible, setCreateManagerVisible] = useState(false);
  const [createEmployeeVisible, setCreateEmployeeVisible] = useState(false);

  return (
    <Screen edges={['top', 'left', 'right']}>
      <GradientBlobBackdrop />
      <ScrollView contentContainerStyle={styles.content}>
        <VideoHero
          theme={theme}
          title="Employees"
          subtitle={`${employees.length} in the company roster`}
          videoSrc={NATIVE_VIDEO.calendar}
          height={120}
        />
        <View style={styles.heroSpacer} />

        <View style={styles.headerActions}>
          <AppButton
            label="Create Manager"
            variant="outline"
            onPress={() => setCreateManagerVisible(true)}
            icon={<MaterialCommunityIcons name="account-plus-outline" size={18} color={theme.colors.primary} />}
            style={styles.headerButton}
          />
          <AppButton
            label="Create Employee"
            onPress={() => setCreateEmployeeVisible(true)}
            icon={<MaterialCommunityIcons name="account-plus-outline" size={18} color={theme.colors.onPrimary} />}
            style={styles.headerButton}
          />
        </View>

        <CreateManagerModal visible={createManagerVisible} onClose={() => setCreateManagerVisible(false)} />
        <CreateEmployeeModal visible={createEmployeeVisible} onClose={() => setCreateEmployeeVisible(false)} />

        {employeesQuery.isLoading ? (
          <Loader label="Loading employees..." />
        ) : employees.length === 0 ? (
          <EmptyState
            icon="account-group-outline"
            title="No employees yet"
            message="Employees will appear here once they register."
          />
        ) : (
          <GlassCard padded={false}>
            {employees.map((emp, index) => {
              const meta = ROLE_META[emp.role];
              const isExpanded = expandedId === emp.id;
              const reports = employees.filter((e) => e.reportsToId === emp.id);
              return (
                <View key={emp.id}>
                  <Pressable
                    onPress={() => setExpandedId(isExpanded ? null : emp.id)}
                    style={[styles.row, index === employees.length - 1 && !isExpanded && styles.rowLast]}
                  >
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{getInitials(emp.name)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.name}>{emp.name}</Text>
                      <Text style={styles.meta}>
                        {emp.department} · {emp.id}
                      </Text>
                      {!!emp.reportsToId && (
                        <Text style={styles.meta}>
                          Reports to {employees.find((m) => m.id === emp.reportsToId)?.name ?? '—'}
                        </Text>
                      )}
                    </View>
                    <View style={[styles.roleBadge, { backgroundColor: meta.bg }]}>
                      <Text style={[styles.roleBadgeText, { color: meta.color }]}>{meta.label}</Text>
                    </View>
                  </Pressable>
                  {isExpanded && emp.role === 'manager' && (
                    <View style={styles.teamWrap}>
                      <Text style={styles.teamHeading}>Team ({reports.length})</Text>
                      {reports.length === 0 ? (
                        <Text style={styles.meta}>No reports yet.</Text>
                      ) : (
                        reports.map((r) => (
                          <Text key={r.id} style={styles.teamMember}>
                            • {r.name} — {r.department}
                          </Text>
                        ))
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </GlassCard>
        )}
      </ScrollView>
    </Screen>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
  content: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  heroSpacer: {
    height: theme.spacing.md,
  },
  subheading: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: 2,
    marginBottom: theme.spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  headerButton: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...theme.typography.captionMedium,
    color: theme.colors.textInverse,
  },
  name: {
    ...theme.typography.bodyMedium,
    color: theme.colors.textPrimary,
  },
  meta: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  roleBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: theme.radius.pill,
  },
  roleBadgeText: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
  teamWrap: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.surfaceAlt,
  },
  teamHeading: {
    ...theme.typography.captionMedium,
    color: theme.colors.textPrimary,
    marginBottom: 4,
    marginTop: 4,
  },
  teamMember: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  });
}
