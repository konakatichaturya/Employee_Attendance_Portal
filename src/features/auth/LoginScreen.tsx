import React, { useState } from 'react';
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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '../../components/Screen';
import { InputField } from '../../components/InputField';
import { AppButton } from '../../components/AppButton';
import { VideoHero } from '../../components/VideoHero';
import { GlassCard } from '../../components/GlassCard';
import { GradientBlobBackdrop } from '../../components/GradientBlobBackdrop';
import { theme } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { clearPendingOtp, requestLoginOtp, verifyLoginOtp } from '../../store/slices/authSlice';
import { loginSchema, type LoginFormValues } from './schema';
import { showErrorToast, showSuccessToast } from '../../components/toast';
import { ADMIN_CREDENTIALS, DEMO_CREDENTIALS, MANAGER_CREDENTIALS } from '../../services/mock/seed';
import { NATIVE_VIDEO } from '../../constants/nativeMedia';
import { vivid } from '../../marketing/vividPalette';
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

const PERSONA_CREDENTIALS: Record<Persona, { email: string; password: string }> = {
  admin: ADMIN_CREDENTIALS,
  employee: DEMO_CREDENTIALS,
  manager: MANAGER_CREDENTIALS,
};

export function LoginScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const pendingOtp = useAppSelector((s) => s.auth.pendingOtp);
  const [persona, setPersona] = useState<Persona>('employee');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState('');

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
      await dispatch(requestLoginOtp({ ...values, expectedRole: persona })).unwrap();
    } catch (error: any) {
      showErrorToast('Login failed', error ?? 'Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const onVerify = async () => {
    if (!pendingOtp) return;
    setSubmitting(true);
    try {
      await dispatch(verifyLoginOtp({ email: pendingOtp.email, code })).unwrap();
      showSuccessToast('Welcome back!', 'Logged in successfully.');
    } catch (error: any) {
      showErrorToast('Verification failed', error ?? 'Please check the code and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const onCancelOtp = () => {
    dispatch(clearPendingOtp());
    setCode('');
  };

  return (
    <Screen edges={['top', 'left', 'right', 'bottom']}>
      <GradientBlobBackdrop />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <VideoHero
            theme={theme}
            title="WorkTrack"
            subtitle="Attendance & Leave, simplified"
            videoSrc={NATIVE_VIDEO.leave}
            height={140}
          />
          <View style={styles.bannerSpacer} />

          {!pendingOtp && (
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
                    color={persona === key ? vivid.blue : theme.colors.textMuted}
                  />
                  <Text style={[styles.personaSegmentText, persona === key && styles.personaSegmentTextActive]}>
                    {PERSONA_META[key].label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {!pendingOtp ? (
            <GlassCard style={styles.form}>
              <Text style={styles.heading}>
                <Text style={styles.headingAccent}>{PERSONA_META[persona].label}</Text> sign in
              </Text>
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
                <MaterialCommunityIcons name="information-outline" size={16} color={vivid.blue} />
                <Text style={styles.hintText}>
                  Demo {PERSONA_META[persona].label.toLowerCase()} login: {PERSONA_CREDENTIALS[persona].email} /{' '}
                  {PERSONA_CREDENTIALS[persona].password}
                </Text>
              </View>

              <Pressable
                onPress={() => navigation.navigate('Register')}
                style={styles.registerLink}
                accessibilityRole="button"
              >
                <Text style={styles.registerLinkText}>
                  New here? <Text style={styles.registerLinkTextBold}>Create an account</Text>
                </Text>
              </Pressable>
            </GlassCard>
          ) : (
            <GlassCard style={styles.form}>
              <Text style={styles.heading}>Enter verification code</Text>
              <Text style={styles.subheading}>We've sent a 6-digit code for {pendingOtp.email}.</Text>

              <View style={styles.hintBox}>
                <MaterialCommunityIcons name="information-outline" size={16} color={vivid.blue} />
                <Text style={styles.hintText}>
                  This demo has no real email/SMS service connected, so here's your code: {pendingOtp.devCode}
                </Text>
              </View>

              <InputField
                label="Verification code"
                value={code}
                onChangeText={setCode}
                placeholder="123456"
                keyboardType="number-pad"
              />

              <AppButton
                label="Verify & Sign In"
                onPress={onVerify}
                loading={submitting}
                disabled={code.trim().length < 6}
                size="lg"
                style={styles.submitButton}
              />

              <Pressable onPress={onCancelOtp} style={styles.registerLink} accessibilityRole="button">
                <Text style={styles.registerLinkText}>
                  Wrong account? <Text style={styles.registerLinkTextBold}>Go back</Text>
                </Text>
              </Pressable>
            </GlassCard>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  bannerSpacer: {
    height: theme.spacing.lg,
  },
  personaToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
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
    color: vivid.blue,
  },
  form: {
    width: '100%',
  },
  heading: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
  },
  headingAccent: {
    color: vivid.blue,
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
    color: vivid.blue,
    fontWeight: '700',
  },
});
