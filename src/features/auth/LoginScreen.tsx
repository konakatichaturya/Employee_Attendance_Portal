import React, { useMemo, useState } from 'react';
import {
  Image,
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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '../../components/Screen';
import { InputField } from '../../components/InputField';
import { AppButton } from '../../components/AppButton';
import { useTheme, type Theme } from '../../theme/ThemeContext';
import { useAppDispatch } from '../../store/hooks';
import { login } from '../../store/slices/authSlice';
import { loginSchema, type LoginFormValues } from './schema';
import { showErrorToast, showSuccessToast } from '../../components/toast';
import { ADMIN_CREDENTIALS, DEMO_CREDENTIALS, MANAGER_CREDENTIALS } from '../../services/mock/seed';
import { AuthHeader } from './AuthHeader';
import type { UserRole } from '../../types';
import type { AuthStackParamList } from '../../navigation/types';

type Persona = UserRole;

const PERSONA_META: Record<Persona, { label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }> = {
  admin: { label: 'Admin', icon: 'shield-account-outline' },
  employee: { label: 'Employee', icon: 'account-outline' },
  manager: { label: 'Manager', icon: 'account-tie-outline' },
};

const SUBTITLE: Record<Persona, string> = {
  admin: 'Manage employees, policies, attendance, and organizational settings.',
  employee: 'Check in, apply for leave, and track your attendance.',
  manager: 'Review team attendance, manage leave requests, and monitor availability.',
};

export function LoginScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const [persona, setPersona] = useState<Persona>('employee');
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
      showErrorToast('Login failed', error ?? 'Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const demoCredentials =
    persona === 'admin' ? ADMIN_CREDENTIALS : persona === 'manager' ? MANAGER_CREDENTIALS : DEMO_CREDENTIALS;

  return (
    <Screen edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <AuthHeader icon="calendar-check" tagline="Attendance & Leave, simplified" />

          <View style={styles.personaToggle}>
            {(Object.keys(PERSONA_META) as Persona[]).map((key) => (
              <Pressable
                key={key}
                onPress={() => setPersona(key)}
                style={[styles.personaSegment, persona === key && styles.personaSegmentActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: persona === key }}
              >
                <MaterialCommunityIcons
                  name={PERSONA_META[key].icon}
                  size={15}
                  color={persona === key ? theme.colors.primary : theme.colors.textMuted}
                />
                <Text style={[styles.personaSegmentText, persona === key && styles.personaSegmentTextActive]}>
                  {PERSONA_META[key].label}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.form}>
            <Text style={styles.heading}>{PERSONA_META[persona].label} sign in</Text>
            <Text style={styles.subheading}>{SUBTITLE[persona]}</Text>

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

            <AppButton
              label="Log In"
              onPress={handleSubmit(onSubmit)}
              loading={submitting}
              size="lg"
              style={styles.submitButton}
            />

            <View style={styles.hintBox}>
              <MaterialCommunityIcons name="information-outline" size={16} color={theme.colors.primary} />
              <Text style={styles.hintText}>
                Demo login: {demoCredentials.email} / {demoCredentials.password}
              </Text>
            </View>

            {persona === 'employee' && (
              <Pressable
                onPress={() => navigation.navigate('Register')}
                style={styles.registerLink}
                accessibilityRole="button"
              >
                <Text style={styles.registerLinkText}>
                  New here? <Text style={styles.registerLinkTextBold}>Create an account</Text>
                </Text>
              </Pressable>
            )}
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
  personaToggle: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.md,
    padding: 4,
    marginBottom: theme.spacing.lg,
  },
  personaSegment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: theme.radius.sm,
  },
  personaSegmentActive: {
    backgroundColor: theme.colors.surface,
    ...theme.elevation.sm,
  },
  personaSegmentText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  personaSegmentTextActive: {
    color: theme.colors.primary,
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
  registerLink: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  registerLinkText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  registerLinkTextBold: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  });
}
