import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { InputField } from '../components/InputField';
import { AppButton } from '../components/AppButton';
import { PillSelector } from '../components/PillSelector';
import { theme } from '../theme';
import { useAppDispatch } from '../store/hooks';
import { login, register } from '../store/slices/authSlice';
import { authApi } from '../services/api/authApi';
import { loginSchema, registerSchema, type LoginFormValues, type RegisterFormValues } from '../features/auth/schema';
import { showErrorToast, showSuccessToast } from '../components/toast';
import { ADMIN_CREDENTIALS, DEMO_CREDENTIALS, MANAGER_CREDENTIALS } from '../services/mock/seed';

const FEATURES: { icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string }[] = [
  { icon: 'clock-check-outline', label: 'Real-time attendance tracking across your company' },
  { icon: 'calendar-clock-outline', label: 'Approve or reject leave requests in one place' },
  { icon: 'chart-donut', label: 'At-a-glance summaries of who is early, late, or off' },
];

type Persona = 'admin' | 'employee' | 'manager';

const PERSONA_META: Record<Persona, { label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }> = {
  admin: { label: 'Admin', icon: 'shield-account-outline' },
  employee: { label: 'Employee', icon: 'account-outline' },
  manager: { label: 'Manager', icon: 'account-tie-outline' },
};

export function AdminAuthPage() {
  const [persona, setPersona] = useState<Persona>('admin');
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const handlePersonaChange = (next: Persona) => {
    setPersona(next);
    setMode('login');
  };

  return (
    <View style={styles.root}>
      <View style={styles.brandPanel}>
        <View style={styles.brandIcon}>
          <MaterialCommunityIcons name="calendar-check" size={30} color={theme.colors.onPrimary} />
        </View>
        <Text style={styles.brandTitle}>WorkTrack</Text>
        <Text style={styles.brandTagline}>Attendance & leave management for your whole team.</Text>

        <View style={styles.featureList}>
          {FEATURES.map((f) => (
            <View key={f.label} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <MaterialCommunityIcons name={f.icon} size={18} color={theme.colors.onPrimary} />
              </View>
              <Text style={styles.featureText}>{f.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.formPanel}>
        <ScrollView contentContainerStyle={styles.formScroll} keyboardShouldPersistTaps="handled">
          <View style={styles.formCard}>
            <View style={styles.personaToggle}>
              {(Object.keys(PERSONA_META) as Persona[]).map((key) => (
                <Pressable
                  key={key}
                  onPress={() => handlePersonaChange(key)}
                  style={[styles.personaSegment, persona === key && styles.personaSegmentActive]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: persona === key }}
                >
                  <MaterialCommunityIcons
                    name={PERSONA_META[key].icon}
                    size={16}
                    color={persona === key ? theme.colors.primary : theme.colors.textMuted}
                  />
                  <Text style={[styles.personaSegmentText, persona === key && styles.personaSegmentTextActive]}>
                    {PERSONA_META[key].label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {persona === 'employee' && mode === 'login' && (
              <LoginForm persona={persona} onSwitchToRegister={() => setMode('register')} />
            )}
            {persona === 'employee' && mode === 'register' && (
              <RegisterForm onSwitchToLogin={() => setMode('login')} />
            )}
            {persona !== 'employee' && <LoginForm persona={persona} />}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

function LoginForm({ persona, onSwitchToRegister }: { persona: Persona; onSwitchToRegister?: () => void }) {
  const dispatch = useAppDispatch();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitting(true);
    try {
      // The selected persona tab is enforced against the account's actual role
      // in mockServer.login(), so logging in from the wrong tab fails clearly.
      await dispatch(login({ ...values, expectedRole: persona })).unwrap();
      showSuccessToast('Welcome back!', 'Logged in successfully.');
    } catch (error: any) {
      showErrorToast('Login failed', error || 'Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const demoCredentials =
    persona === 'admin' ? ADMIN_CREDENTIALS : persona === 'manager' ? MANAGER_CREDENTIALS : DEMO_CREDENTIALS;

  const subtitle: Record<Persona, string> = {
    admin: 'Manage employees, policies, attendance, and organizational settings.',
    employee: 'Check in, apply for leave, and track your attendance.',
    manager: 'Review team attendance, manage leave requests, and monitor availability.',
  };

  return (
    <>
      <Text style={styles.heading}>{PERSONA_META[persona].label} sign in</Text>
      <Text style={styles.subheading}>{subtitle[persona]}</Text>

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
        name="password"
        render={({ field: { value, onChange, onBlur } }) => (
          <InputField
            label="Password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Enter your password"
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

      <AppButton label="Log In" onPress={handleSubmit(onSubmit)} loading={submitting} size="lg" style={styles.submitButton} />

      <View style={styles.hintBox}>
        <MaterialCommunityIcons name="information-outline" size={16} color={theme.colors.primary} />
        <Text style={styles.hintText}>
          Demo login: {demoCredentials.email} / {demoCredentials.password}
        </Text>
      </View>

      {onSwitchToRegister && (
        <Pressable onPress={onSwitchToRegister} style={styles.switchLink} accessibilityRole="button">
          <Text style={styles.switchLinkText}>
            New here? <Text style={styles.switchLinkTextBold}>Create an account</Text>
          </Text>
        </Pressable>
      )}
    </>
  );
}

// Only Employees can self-register; Admin and Manager are predefined/admin-created accounts.
function RegisterForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const dispatch = useAppDispatch();
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
      showErrorToast('Registration failed', error || 'Please check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Text style={styles.heading}>Sign up</Text>
      <Text style={styles.subheading}>Enter your employee details to get started</Text>

      <View style={styles.fieldGrid}>
        <View style={styles.fieldHalf}>
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
        </View>
        <View style={styles.fieldHalf}>
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
        </View>
      </View>

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

      <View style={styles.fieldGrid}>
        <View style={styles.fieldHalf}>
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
        </View>
        <View style={styles.fieldHalf}>
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
        </View>
      </View>

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

      <View style={styles.fieldGrid}>
        <View style={styles.fieldHalf}>
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
        </View>
        <View style={styles.fieldHalf}>
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
        </View>
      </View>

      <AppButton
        label="Create Account"
        onPress={handleSubmit(onSubmit)}
        loading={submitting}
        size="lg"
        style={styles.submitButton}
      />

      <Pressable onPress={onSwitchToLogin} style={styles.switchLink} accessibilityRole="button">
        <Text style={styles.switchLinkText}>
          Already have an account? <Text style={styles.switchLinkTextBold}>Sign in</Text>
        </Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
  },
  brandPanel: {
    flex: 1,
    minWidth: 360,
    maxWidth: 480,
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.xxl,
    justifyContent: 'center',
  },
  brandIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  brandTitle: {
    ...theme.typography.h1,
    color: theme.colors.textInverse,
    marginBottom: theme.spacing.xs,
  },
  brandTagline: {
    ...theme.typography.body,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: theme.spacing.xl,
  },
  featureList: {
    gap: theme.spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    ...theme.typography.body,
    color: 'rgba(255,255,255,0.9)',
    flex: 1,
  },
  formPanel: {
    flex: 1.3,
  },
  formScroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  formCard: {
    width: '100%',
    maxWidth: 460,
  },
  personaToggle: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.md,
    padding: 4,
    marginBottom: theme.spacing.xl,
  },
  personaSegment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: theme.radius.sm,
  },
  personaSegmentActive: {
    backgroundColor: theme.colors.surface,
    ...theme.elevation.sm,
  },
  personaSegmentText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.textMuted,
  },
  personaSegmentTextActive: {
    color: theme.colors.primary,
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
  fieldGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  fieldHalf: {
    flex: 1,
  },
  submitButton: {
    marginTop: theme.spacing.sm,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.primaryLight,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.md,
  },
  hintText: {
    ...theme.typography.caption,
    color: theme.colors.primaryDark,
    flexShrink: 1,
  },
  switchLink: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  switchLinkText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  switchLinkTextBold: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
