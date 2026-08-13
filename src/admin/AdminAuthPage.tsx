import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { InputField } from '../components/InputField';
import { AppButton } from '../components/AppButton';
import { PillSelector } from '../components/PillSelector';
import { Logo } from '../components/Logo';
import { theme } from '../theme';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearPendingOtp, register, requestLoginOtp, verifyLoginOtp } from '../store/slices/authSlice';
import { authApi } from '../services/api/authApi';
import { loginSchema, registerSchema, type LoginFormValues, type RegisterFormValues } from '../features/auth/schema';
import { showErrorToast, showSuccessToast } from '../components/toast';
import { ADMIN_CREDENTIALS, DEMO_CREDENTIALS, MANAGER_CREDENTIALS } from '../services/mock/seed';
import { RoboGuide } from '../marketing/components/RoboGuide';
import { vivid, VIVID_FEATURE_COLORS } from '../marketing/vividPalette';

const videoBgStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

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

const PERSONA_CREDENTIALS: Record<Persona, { email: string; password: string }> = {
  admin: ADMIN_CREDENTIALS,
  employee: DEMO_CREDENTIALS,
  manager: MANAGER_CREDENTIALS,
};

interface AdminAuthPageProps {
  initialPersona?: Persona;
  initialMode?: 'login' | 'register';
  onBack?: () => void;
}

export function AdminAuthPage({ initialPersona = 'admin', initialMode = 'login', onBack }: AdminAuthPageProps) {
  const [persona, setPersona] = useState<Persona>(initialPersona);
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  const handlePersonaChange = (next: Persona) => {
    setPersona(next);
    setMode('login');
  };

  return (
    <View style={styles.root}>
      <View style={styles.brandPanel}>
        {/* Same free, no-attribution Mixkit clip used on the marketing hero
            (public/videos/NOTICE.md) — a semi-transparent gradient wash sits
            on top so the video reads as a colored background, not a raw clip,
            and the white text stays legible. */}
        {React.createElement('video', {
          src: '/videos/hero-leave.mp4',
          autoPlay: true,
          muted: true,
          loop: true,
          playsInline: true,
          style: videoBgStyle,
        })}
        <View style={styles.videoScrim} />
        <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
          <Defs>
            <LinearGradient id="authGradient" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={vivid.blue} />
              <Stop offset="0.75" stopColor={vivid.blue} />
              <Stop offset="1" stopColor={vivid.purple} />
            </LinearGradient>
          </Defs>
          <Rect x={0} y={0} width="100%" height="100%" fill="url(#authGradient)" fillOpacity={0.4} />
        </Svg>
        <View style={[styles.blob, styles.blobTop]} />
        <View style={[styles.blob, styles.blobBottom]} />

        {!!onBack && (
          <Pressable onPress={onBack} style={styles.backLink} accessibilityRole="button">
            <MaterialCommunityIcons name="arrow-left" size={16} color={theme.colors.onPrimary} />
            <Text style={styles.backLinkText}>Back to WorkTrack.com</Text>
          </Pressable>
        )}
        <View style={styles.brandLogo}>
          <Logo theme={theme} size="lg" tone="inverse" />
        </View>
        <Text style={styles.brandTitle}>WorkTrack</Text>
        <Text style={styles.brandTagline}>Attendance & leave management for your whole team.</Text>

        <View style={styles.featureList}>
          {FEATURES.map((f, index) => {
            const color = VIVID_FEATURE_COLORS[index % VIVID_FEATURE_COLORS.length];
            return (
              <View key={f.label} style={styles.featureRow}>
                <View style={[styles.featureIcon, { backgroundColor: '#FFFFFF', shadowColor: color }]}>
                  <MaterialCommunityIcons name={f.icon} size={18} color={color} />
                </View>
                <Text style={styles.featureText}>{f.label}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.formPanel}>
        <View style={[styles.formBlob, styles.formBlobTop]} />
        <View style={[styles.formBlob, styles.formBlobBottom]} />
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

      <RoboGuide theme={theme} />
    </View>
  );
}

function LoginForm({ persona, onSwitchToRegister }: { persona: Persona; onSwitchToRegister?: () => void }) {
  const dispatch = useAppDispatch();
  const pendingOtp = useAppSelector((s) => s.auth.pendingOtp);
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
      // The selected persona tab is enforced against the account's actual role
      // in mockServer.requestLoginOtp(), so logging in from the wrong tab fails clearly.
      await dispatch(requestLoginOtp({ ...values, expectedRole: persona })).unwrap();
    } catch (error: any) {
      showErrorToast('Login failed', error || 'Please check your credentials.');
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
      showErrorToast('Verification failed', error || 'Please check the code and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const onCancelOtp = () => {
    dispatch(clearPendingOtp());
    setCode('');
  };

  const subtitle: Record<Persona, string> = {
    admin: 'Manage employees, policies, attendance, and organizational settings.',
    employee: 'Check in, apply for leave, and track your attendance.',
    manager: 'Review team attendance, manage leave requests, and monitor availability.',
  };

  if (pendingOtp) {
    return (
      <>
        <Text style={styles.heading}>Enter verification code</Text>
        <Text style={styles.subheading}>We've sent a 6-digit code for {pendingOtp.email}.</Text>

        <View style={styles.hintBox}>
          <MaterialCommunityIcons name="information-outline" size={16} color={theme.colors.primary} />
          <Text style={styles.hintText}>
            This demo has no real email/SMS service connected, so here's your code: {pendingOtp.devCode}
          </Text>
        </View>

        <InputField label="Verification code" value={code} onChangeText={setCode} placeholder="123456" keyboardType="number-pad" />

        <AppButton
          label="Verify & Sign In"
          onPress={onVerify}
          loading={submitting}
          disabled={code.trim().length < 6}
          size="lg"
          style={{ ...styles.submitButton, backgroundColor: vivid.blue }}
        />

        <Pressable onPress={onCancelOtp} style={styles.switchLink} accessibilityRole="button">
          <Text style={styles.switchLinkText}>
            Wrong account? <Text style={styles.switchLinkTextBold}>Go back</Text>
          </Text>
        </Pressable>
      </>
    );
  }

  return (
    <>
      <Text style={styles.heading}>
        <Text style={styles.headingAccent}>{PERSONA_META[persona].label}</Text> sign in
      </Text>
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
      <Text style={styles.passwordRules}>Use at least 8 characters.</Text>

      <AppButton
        label="Log In"
        onPress={handleSubmit(onSubmit)}
        loading={submitting}
        size="lg"
        style={{ ...styles.submitButton, backgroundColor: vivid.blue }}
      />

      <View style={styles.hintBox}>
        <MaterialCommunityIcons name="information-outline" size={16} color={theme.colors.primary} />
        <Text style={styles.hintText}>
          Demo {PERSONA_META[persona].label.toLowerCase()} login: {PERSONA_CREDENTIALS[persona].email} /{' '}
          {PERSONA_CREDENTIALS[persona].password}
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
          <Text style={styles.passwordRules}>Use at least 8 characters.</Text>
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
        style={{ ...styles.submitButton, backgroundColor: vivid.blue }}
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
    overflow: 'hidden',
    position: 'relative',
  },
  // Just enough neutral darkening to keep the white text readable now that
  // the color gradient on top of it is mostly transparent (video-forward).
  videoScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 14, 30, 0.28)',
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
  blobTop: {
    width: 260,
    height: 260,
    top: -100,
    right: -100,
    opacity: 0.1,
  },
  blobBottom: {
    width: 220,
    height: 220,
    bottom: -80,
    left: -80,
    opacity: 0.1,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  backLinkText: {
    ...theme.typography.captionMedium,
    color: theme.colors.onPrimary,
  },
  brandLogo: {
    alignItems: 'flex-start',
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
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  featureText: {
    ...theme.typography.body,
    color: 'rgba(255,255,255,0.9)',
    flex: 1,
  },
  formPanel: {
    flex: 1.3,
    backgroundColor: '#EEF2FF',
    overflow: 'hidden',
    position: 'relative',
  },
  formBlob: {
    position: 'absolute',
    borderRadius: 999,
  },
  formBlobTop: {
    width: 300,
    height: 300,
    top: -110,
    right: -90,
    backgroundColor: vivid.blue,
    opacity: 0.14,
  },
  formBlobBottom: {
    width: 260,
    height: 260,
    bottom: -110,
    left: -90,
    backgroundColor: vivid.purple,
    opacity: 0.12,
  },
  formScroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  // Frosted-glass card: translucent white + backdrop blur so the panel's
  // colored blobs show through softly behind the form.
  formCard: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: 'rgba(255,255,255,0.62)',
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    padding: theme.spacing.xl,
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    ...theme.elevation.lg,
  } as any,
  personaToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
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
    color: '#16305C',
  },
  headingAccent: {
    color: vivid.blue,
  },
  subheading: {
    ...theme.typography.body,
    color: '#5B7295',
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
  passwordRules: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 6,
    marginBottom: theme.spacing.sm,
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
