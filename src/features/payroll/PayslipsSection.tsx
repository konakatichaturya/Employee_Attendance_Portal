import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWebTheme, type WebTheme } from '../../admin/ThemeContext';
import { AdminCard as Card } from '../../admin/components/AdminCard';
import { AdminLoader as Loader } from '../../admin/components/AdminLoader';
import { DashboardHero } from '../../admin/components/DashboardHero';
import { useAppSelector } from '../../store/hooks';
import { useLeaveBalances, useLeaveRequests } from '../../hooks/useLeaveQueries';
import { calculatePayslip, recentMonths } from '../../services/payroll/payslipCalculator';
import { downloadPayslipPdf } from '../../services/payroll/payslipPdf';
import { formatPayCurrency } from '../../services/payroll/currency';

const MASK = '••••••';

export function PayslipsSection() {
  const { theme } = useWebTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const employee = useAppSelector((s) => s.auth.employee);
  const balancesQuery = useLeaveBalances();
  const requestsQuery = useLeaveRequests();
  const [amountsVisible, setAmountsVisible] = useState(false);

  const months = useMemo(() => recentMonths(12), []);

  if (!employee || balancesQuery.isLoading || requestsQuery.isLoading) {
    return <Loader label="Loading payslips..." />;
  }

  const balances = balancesQuery.data ?? [];
  const requests = requestsQuery.data ?? [];

  const payslips = months.map(({ year, month }) => calculatePayslip(employee, balances, requests, year, month));

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <DashboardHero
        theme={theme}
        title="Payslips"
        subtitle="Monthly pay, with leave-based deductions applied automatically"
        videoSrc="/videos/hero-leave.mp4"
      />

      <Card padded={false}>
        <View style={styles.listHeader}>
          <Text style={styles.listHeaderTitle}>Recent Payslips</Text>
          <Pressable
            onPress={() => setAmountsVisible((v) => !v)}
            style={styles.visibilityToggle}
            accessibilityRole="button"
            accessibilityLabel={amountsVisible ? 'Hide amounts' : 'Show amounts'}
          >
            <MaterialCommunityIcons name={amountsVisible ? 'eye-off-outline' : 'eye-outline'} size={16} color={theme.colors.primary} />
            <Text style={styles.visibilityToggleText}>{amountsVisible ? 'Hide amounts' : 'Show amounts'}</Text>
          </Pressable>
        </View>

        {payslips.map((payslip, index) => (
          <View key={`${payslip.year}-${payslip.month}`} style={[styles.row, index !== payslips.length - 1 && styles.rowBorder]}>
            <View style={styles.rowLeft}>
              <View style={styles.monthIcon}>
                <MaterialCommunityIcons name="file-document-outline" size={18} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={styles.monthLabel}>{payslip.monthLabel}</Text>
                <Text style={styles.deductionMeta}>
                  {payslip.deductedDays > 0
                    ? `${payslip.deductedDays} day(s) deducted · ${payslip.deductions.map((d) => `${d.type} ${d.days}`).join(', ')}`
                    : 'No deductions'}
                </Text>
              </View>
            </View>

            <Text style={[styles.netPay, !amountsVisible && styles.netPayMasked]}>
              {amountsVisible ? formatPayCurrency(payslip.netPay) : MASK}
            </Text>

            <Pressable
              onPress={() => downloadPayslipPdf(employee, payslip)}
              style={styles.downloadButton}
              accessibilityRole="button"
              accessibilityLabel={`Download payslip for ${payslip.monthLabel}`}
            >
              <MaterialCommunityIcons name="download-outline" size={16} color={theme.colors.primary} />
              <Text style={styles.downloadText}>PDF</Text>
            </Pressable>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

function createStyles(theme: WebTheme) {
  return StyleSheet.create({
    content: {
      padding: theme.spacing.xl,
    },
    listHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    listHeaderTitle: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
    },
    visibilityToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    visibilityToggleText: {
      ...theme.typography.captionMedium,
      color: theme.colors.primary,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.md,
    },
    rowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    rowLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    monthIcon: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: theme.colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    monthLabel: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
    },
    deductionMeta: {
      ...theme.typography.caption,
      color: theme.colors.textMuted,
      marginTop: 2,
    },
    netPay: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
      minWidth: 100,
      textAlign: 'right',
    },
    netPayMasked: {
      color: theme.colors.textMuted,
      letterSpacing: 2,
    },
    downloadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    downloadText: {
      ...theme.typography.captionMedium,
      color: theme.colors.primary,
    },
  });
}
