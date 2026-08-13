import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { InputField } from '../../components/InputField';
import { AppButton } from '../../components/AppButton';
import { VideoHero } from '../../components/VideoHero';
import { GlassCard } from '../../components/GlassCard';
import { GradientBlobBackdrop } from '../../components/GradientBlobBackdrop';
import { useTheme, type Theme } from '../../theme/ThemeContext';
import { useAppSelector } from '../../store/hooks';
import { useChangePassword } from '../../hooks/useProfile';
import { changePasswordSchema, type ChangePasswordFormValues } from './schema';
import { showErrorToast, showSuccessToast } from '../../components/toast';
import { NATIVE_VIDEO } from '../../constants/nativeMedia';
import { vivid } from '../../marketing/vividPalette';

export function ChangePasswordScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const employee = useAppSelector((s) => s.auth.employee);
  const changePassword = useChangePassword();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = (values: ChangePasswordFormValues) => {
    changePassword.mutate(values.password, {
      onSuccess: () => showSuccessToast('Password updated', "You're all set."),
      onError: (error: any) => showErrorToast('Could not update password', error?.message ?? 'Please try again.'),
    });
  };

  return (
    <Screen edges={['top', 'left', 'right', 'bottom']}>
      <GradientBlobBackdrop />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <VideoHero theme={theme} title="Almost there" subtitle="Set a new password to continue" videoSrc={NATIVE_VIDEO.leave} height={130} />
          <View style={styles.bannerSpacer} />

          <GlassCard style={styles.form}>
            <Text style={styles.heading}>Choose a new password</Text>
            <Text style={styles.subheading}>
              {employee?.name ? `Hi ${employee.name}, ` : ''}for security, set your own password before continuing
              — you're currently using the temporary one your admin gave you.
            </Text>

            <Controller
              control={control}
              name="password"
              render={({ field: { value, onChange, onBlur } }) => (
                <InputField
                  label="New Password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="At least 8 characters"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  error={errors.password?.message}
                  rightElement={
                    <MaterialCommunityIcons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color={theme.colors.textMuted}
                      onPress={() => setShowPassword((s) => !s)}
                      suppressHighlighting
                    />
                  }
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { value, onChange, onBlur } }) => (
                <InputField
                  label="Confirm Password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Re-enter your new password"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  error={errors.confirmPassword?.message}
                  rightElement={
                    <MaterialCommunityIcons
                      name={showConfirmPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color={theme.colors.textMuted}
                      onPress={() => setShowConfirmPassword((s) => !s)}
                      suppressHighlighting
                    />
                  }
                />
              )}
            />

            <AppButton
              label="Save & Continue"
              onPress={handleSubmit(onSubmit)}
              loading={changePassword.isPending}
              size="lg"
              style={styles.submitButton}
            />
          </GlassCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  bannerSpacer: {
    height: theme.spacing.lg,
  },
  form: {
    width: '100%',
  },
  heading: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
  },
  subheading: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    marginTop: 4,
  },
  submitButton: {
    marginTop: theme.spacing.sm,
    backgroundColor: vivid.blue,
    borderRadius: theme.radius.pill,
  },
  });
}
