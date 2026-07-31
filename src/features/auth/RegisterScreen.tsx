import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '../../components/Screen';
import { InputField } from '../../components/InputField';
import { AppButton } from '../../components/AppButton';
import { PillSelector } from '../../components/PillSelector';
import { useTheme, type Theme } from '../../theme/ThemeContext';
import { useAppDispatch } from '../../store/hooks';
import { register } from '../../store/slices/authSlice';
import { authApi } from '../../services/api/authApi';
import { registerSchema, type RegisterFormValues } from './schema';
import { showErrorToast, showSuccessToast } from '../../components/toast';
import { AuthHeader } from './AuthHeader';
import type { AuthStackParamList } from '../../navigation/types';

export function RegisterScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const managersQuery = useQuery({
    queryKey: ['managers-for-assignment'],
    queryFn: () => authApi.getManagers(),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      employeeId: '',
      name: '',
      email: '',
      phone: '',
      department: '',
      managerId: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setSubmitting(true);
    try {
      await dispatch(register(values)).unwrap();
      showSuccessToast('Account created', 'Welcome to WorkTrack!');
    } catch (error: any) {
      showErrorToast('Registration failed', error ?? 'Please check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <AuthHeader icon="account-plus" tagline="Create your team account" />

          <View style={styles.form}>
            <Text style={styles.heading}>Sign up</Text>
            <Text style={styles.subheading}>
              Enter your employee details to get started
            </Text>

            <Controller
              control={control}
              name="employeeId"
              render={({ field: { value, onChange, onBlur } }) => (
                <InputField
                  label="Employee ID"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="EMP-1024"
                  autoCapitalize="characters"
                  error={errors.employeeId?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="name"
              render={({ field: { value, onChange, onBlur } }) => (
                <InputField
                  label="Full Name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Jane Doe"
                  error={errors.name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { value, onChange, onBlur } }) => (
                <InputField
                  label="Email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="you@company.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="phone"
              render={({ field: { value, onChange, onBlur } }) => (
                <InputField
                  label="Phone Number"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="+91 98765 43210"
                  keyboardType="phone-pad"
                  error={errors.phone?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="department"
              render={({ field: { value, onChange, onBlur } }) => (
                <InputField
                  label="Department"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Engineering"
                  error={errors.department?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="managerId"
              render={({ field: { value, onChange } }) => (
                <PillSelector
                  label="Manager"
                  value={value || null}
                  onChange={onChange}
                  options={(managersQuery.data ?? []).map((m) => ({ value: m.id, label: m.name }))}
                  error={errors.managerId?.message}
                  emptyMessage="No managers available yet. Ask your admin to create one first."
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { value, onChange, onBlur } }) => (
                <InputField
                  label="Password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Create a password"
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
                  placeholder="Re-enter your password"
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
              label="Create Account"
              onPress={handleSubmit(onSubmit)}
              loading={submitting}
              size="lg"
              style={styles.submitButton}
            />

            <Pressable
              onPress={() => navigation.navigate('Login')}
              style={styles.loginLink}
              accessibilityRole="button"
            >
              <Text style={styles.loginLinkText}>
                Already have an account? <Text style={styles.loginLinkTextBold}>Sign in</Text>
              </Text>
            </Pressable>
          </View>
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
  },
  loginLink: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  loginLinkText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  loginLinkTextBold: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  });
}
