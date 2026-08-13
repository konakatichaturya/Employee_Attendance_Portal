import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { GlassCard } from '../../components/GlassCard';
import { Loader } from '../../components/Loader';
import { VideoHero } from '../../components/VideoHero';
import { GradientBlobBackdrop } from '../../components/GradientBlobBackdrop';
import { useTheme, type Theme } from '../../theme/ThemeContext';
import { useAppSelector } from '../../store/hooks';
import { useLeaveBalances, useLeaveRequests } from '../../hooks/useLeaveQueries';
import { calculatePayslip, recentMonths, type Payslip } from '../../services/payroll/payslipCalculator';
import { sharePayslipPdf } from '../../services/payroll/payslipPdfNative';
import { formatPayCurrency } from '../../services/payroll/currency';
import { showErrorToast } from '../../components/toast';
import { NATIVE_VIDEO } from '../../constants/nativeMedia';
import type { Employee } from '../../types';

const MASK = '••••••';

function PayslipRow({
  payslip,
  employee,
  visible,
}: {
  payslip: Payslip;
  employee: Pick<Employee, 'name' | 'id' | 'department' | 'email'>;
  visible: boolean;
}) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [sharing, setSharing] = useState(false);

  const onShare = async () => {
    setSharing(true);
    try {
      await sharePayslipPdf(employee, payslip);
    } catch (error: any) {
      showErrorToast('Could not generate payslip', error?.message ?? 'Please try again.');
    } finally {
      setSharing(false);
    }
  };

  return (
    <GlassCard style={styles.row}>
      <View style={styles.rowTop}>
        <View style={styles.rowLeft}>
          <View style={styles.monthIcon}>
            <MaterialCommunityIcons name="file-document-outline" size={18} color={theme.colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.monthLabel}>{payslip.monthLabel}</Text>
            <Text style={styles.deductionMeta}>
              {payslip.deductedDays > 0
                ? `${payslip.deductedDays} day(s) deducted · ${payslip.deductions.map((d) => `${d.type} ${d.days}`).join(', ')}`
                : 'No deductions'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.rowBottom}>
        <Text style={[styles.netPay, !visible && styles.netPayMasked]}>{visible ? formatPayCurrency(payslip.netPay) : MASK}</Text>

        <Pressable onPress={onShare} disabled={sharing} style={styles.downloadButton} accessibilityRole="button">
          {sharing ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <MaterialCommunityIcons name="share-outline" size={16} color={theme.colors.primary} />
          )}
          <Text style={styles.downloadText}>{sharing ? 'Preparing…' : 'Share PDF'}</Text>
        </Pressable>
      </View>
    </GlassCard>
  );
}

export function PayslipsScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const employee = useAppSelector((s) => s.auth.employee);
  const balancesQuery = useLeaveBalances();
  const requestsQuery = useLeaveRequests();
  const [amountsVisible, setAmountsVisible] = useState(false);

  const months = useMemo(() => recentMonths(12), []);

  if (!employee || balancesQuery.isLoading || requestsQuery.isLoading) {
    return <Loader fullScreen label="Loading payslips..." />;
  }

  const balances = balancesQuery.data ?? [];
  const requests = requestsQuery.data ?? [];
  const payslips = months.map(({ year, month }) => calculatePayslip(employee, balances, requests, year, month));

  return (
    <Screen>
      <GradientBlobBackdrop />
      <View style={styles.listContent}>
        <VideoHero
          theme={theme}
          title="Payslips"
          subtitle="Leave-based deductions applied automatically"
          videoSrc={NATIVE_VIDEO.leave}
          right={
            <Pressable
              onPress={() => setAmountsVisible((v) => !v)}
              style={styles.visibilityToggle}
              accessibilityRole="button"
              accessibilityLabel={amountsVisible ? 'Hide amounts' : 'Show amounts'}
            >
              <MaterialCommunityIcons name={amountsVisible ? 'eye-off-outline' : 'eye-outline'} size={18} color="#FFFFFF" />
            </Pressable>
          }
        />

        {payslips.map((payslip) => (
          <PayslipRow key={`${payslip.year}-${payslip.month}`} payslip={payslip} employee={employee} visible={amountsVisible} />
        ))}
      </View>
    </Screen>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    visibilityToggle: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.25)',
      marginBottom: 2,
    },
    listContent: {
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    row: {
      marginBottom: theme.spacing.sm,
    },
    rowTop: {
      flexDirection: 'row',
      alignItems: 'center',
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
    rowBottom: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: theme.spacing.sm,
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    netPay: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
    },
    netPayMasked: {
      color: theme.colors.textMuted,
      letterSpacing: 2,
    },
    downloadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 12,
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
