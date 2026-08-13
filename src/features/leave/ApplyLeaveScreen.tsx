import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { GlassCard } from '../../components/GlassCard';
import { InputField } from '../../components/InputField';
import { DateField } from '../../components/DateField';
import { AppButton } from '../../components/AppButton';
import { ConfirmModal } from '../../components/ConfirmModal';
import { VideoHero } from '../../components/VideoHero';
import { GradientBlobBackdrop } from '../../components/GradientBlobBackdrop';
import { useTheme, type Theme } from '../../theme/ThemeContext';
import { useLeaveBalances } from '../../hooks/useLeaveQueries';
import { useApplyLeave } from '../../hooks/useLeaveQueries';
import { useImproveLeaveReason } from '../../hooks/useAskAi';
import { applyLeaveSchema, calculateLeaveDays, type ApplyLeaveFormValues } from './schema';
import { LeaveTypeSelector } from './components/LeaveTypeSelector';
import { LeaveBalanceSummary } from '../dashboard/components/LeaveBalanceSummary';
import { showErrorToast, showSuccessToast } from '../../components/toast';
import { NATIVE_VIDEO } from '../../constants/nativeMedia';

export function ApplyLeaveScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation();
  const balancesQuery = useLeaveBalances();
  const applyLeaveMutation = useApplyLeave();
  const improveReasonMutation = useImproveLeaveReason();
  const [confirmVisible, setConfirmVisible] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ApplyLeaveFormValues>({
    resolver: zodResolver(applyLeaveSchema),
    defaultValues: {
      type: 'Casual',
      fromDate: undefined,
      toDate: undefined,
      reason: '',
    },
  });

  const type = watch('type');
  const fromDate = watch('fromDate');
  const toDate = watch('toDate');
  const reason = watch('reason');

  const days = fromDate && toDate ? calculateLeaveDays(fromDate, toDate) : 0;
  const balance = balancesQuery.data?.find((b) => b.type === type);
  const remainingAfter = balance ? balance.total - balance.used - days : null;

  const onSubmitPress = () => {
    handleSubmit(() => setConfirmVisible(true))();
  };

  const onImproveReason = async () => {
    try {
      const improved = await improveReasonMutation.mutateAsync({ type, reason });
      setValue('reason', improved, { shouldValidate: true, shouldDirty: true });
    } catch (error: any) {
      showErrorToast('Could not improve reason', error?.message ?? 'Please try again.');
    }
  };

  const onConfirmSubmit = handleSubmit(async (values) => {
    try {
      await applyLeaveMutation.mutateAsync({
        type: values.type,
        fromDate: format(values.fromDate, 'yyyy-MM-dd'),
        toDate: format(values.toDate, 'yyyy-MM-dd'),
        reason: values.reason,
        days: calculateLeaveDays(values.fromDate, values.toDate),
      });
      setConfirmVisible(false);
      showSuccessToast('Leave requested', 'Your request has been submitted for approval.');
      navigation.goBack();
    } catch (error: any) {
      setConfirmVisible(false);
      showErrorToast('Could not submit leave', error?.message ?? 'Please try again.');
    }
  });

  return (
    <Screen>
      <GradientBlobBackdrop />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <VideoHero
          theme={theme}
          title="Apply for Leave"
          subtitle="Fill in the details below to request time off"
          videoSrc={NATIVE_VIDEO.leave}
          height={120}
        />
        <View style={styles.heroSpacer} />

        <View style={styles.card}>
          <LeaveBalanceSummary balances={balancesQuery.data ?? []} />
        </View>

        <GlassCard style={styles.card}>
          <Controller
            control={control}
            name="type"
            render={({ field: { value, onChange } }) => <LeaveTypeSelector value={value} onChange={onChange} />}
          />

          <View style={styles.dateRow}>
            <View style={styles.dateColumn}>
              <Controller
                control={control}
                name="fromDate"
                render={({ field: { value, onChange } }) => (
                  <DateField
                    label="From Date"
                    value={value ?? null}
                    onChange={onChange}
                    minimumDate={new Date()}
                    error={errors.fromDate?.message}
                  />
                )}
              />
            </View>
            <View style={styles.dateColumn}>
              <Controller
                control={control}
                name="toDate"
                render={({ field: { value, onChange } }) => (
                  <DateField
                    label="To Date"
                    value={value ?? null}
                    onChange={onChange}
                    minimumDate={fromDate ?? new Date()}
                    error={errors.toDate?.message}
                  />
                )}
              />
            </View>
          </View>

          <Controller
            control={control}
            name="reason"
            render={({ field: { value, onChange, onBlur } }) => (
              <InputField
                label="Reason"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Briefly describe your reason for leave"
                multiline
                numberOfLines={4}
                error={errors.reason?.message}
              />
            )}
          />

          <Pressable
            onPress={onImproveReason}
            disabled={improveReasonMutation.isPending}
            style={styles.aiButton}
            accessibilityRole="button"
          >
            {improveReasonMutation.isPending ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <MaterialCommunityIcons name="creation" size={16} color={theme.colors.primary} />
            )}
            <Text style={styles.aiButtonText}>
              {improveReasonMutation.isPending ? 'Improving…' : 'Improve with AI'}
            </Text>
          </Pressable>

          {days > 0 && (
            <View style={styles.previewBox}>
              <Text style={styles.previewLabel}>Duration</Text>
              <Text style={styles.previewValue}>
                {days} day{days > 1 ? 's' : ''}
              </Text>
              {balance && type !== 'Unpaid' && (
                <>
                  <View style={styles.previewDivider} />
                  <Text style={styles.previewLabel}>Balance after this request</Text>
                  <Text
                    style={[
                      styles.previewValue,
                      remainingAfter !== null && remainingAfter < 0 && styles.previewValueDanger,
                    ]}
                  >
                    {remainingAfter} / {balance.total} days
                  </Text>
                </>
              )}
            </View>
          )}
        </GlassCard>

        <AppButton label="Submit Request" onPress={onSubmitPress} size="lg" style={styles.submitButton} />
      </ScrollView>

      <ConfirmModal
        visible={confirmVisible}
        title="Confirm Leave Request"
        message={`Submit a ${days}-day ${type} leave request from ${
          fromDate ? format(fromDate, 'dd MMM yyyy') : ''
        } to ${toDate ? format(toDate, 'dd MMM yyyy') : ''}?`}
        confirmLabel="Submit"
        loading={applyLeaveMutation.isPending}
        onConfirm={onConfirmSubmit}
        onCancel={() => setConfirmVisible(false)}
      />
    </Screen>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    content: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.xxl,
    },
    aiButton: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 6,
      marginTop: -8,
      marginBottom: theme.spacing.sm,
    },
    aiButtonText: {
      ...theme.typography.captionMedium,
      color: theme.colors.primary,
    },
    heroSpacer: {
      height: theme.spacing.md,
    },
    card: {
      marginBottom: theme.spacing.md,
    },
    dateRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    dateColumn: {
      flex: 1,
    },
    previewBox: {
      backgroundColor: theme.colors.primaryLight,
      borderRadius: theme.radius.md,
      padding: theme.spacing.sm,
      marginTop: 4,
    },
    previewLabel: {
      ...theme.typography.caption,
      color: theme.colors.primaryDark,
    },
    previewValue: {
      ...theme.typography.subtitle,
      color: theme.colors.primaryDark,
      marginBottom: 4,
    },
    previewValueDanger: {
      color: theme.colors.danger,
    },
    previewDivider: {
      height: 1,
      backgroundColor: theme.colors.primary,
      opacity: 0.15,
      marginVertical: 6,
    },
    submitButton: {
      marginTop: 4,
    },
  });
}
