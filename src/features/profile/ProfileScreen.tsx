import React, { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { GlassCard } from '../../components/GlassCard';
import { InputField } from '../../components/InputField';
import { AppButton } from '../../components/AppButton';
import { ConfirmModal } from '../../components/ConfirmModal';
import { VideoHero } from '../../components/VideoHero';
import { GradientBlobBackdrop } from '../../components/GradientBlobBackdrop';
import { useTheme, type Theme } from '../../theme/ThemeContext';
import { useAppSelector } from '../../store/hooks';
import { useUpdateProfile } from '../../hooks/useProfile';
import { useManagers } from '../../admin/hooks/useAdminData';
import { phoneSchema } from './schema';
import { ImageSourceSheet } from './components/ImageSourceSheet';
import { showErrorToast, showSuccessToast } from '../../components/toast';
import { NATIVE_VIDEO } from '../../constants/nativeMedia';

const profileFormSchema = z.object({ phone: phoneSchema });
type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const employee = useAppSelector((s) => s.auth.employee);
  const updateProfileMutation = useUpdateProfile();
  const managersQuery = useManagers();
  const managerName = managersQuery.data?.find((m) => m.id === employee?.reportsToId)?.name;

  const [sheetVisible, setSheetVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [pendingAvatarUri, setPendingAvatarUri] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { phone: employee?.phone ?? '' },
  });

  const requestAndPick = async (source: 'camera' | 'gallery') => {
    setSheetVisible(false);
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permission.status !== 'granted') {
      showErrorToast('Permission needed', `Allow ${source === 'camera' ? 'camera' : 'photo library'} access to continue.`);
      return;
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          });

    if (!result.canceled && result.assets?.[0]?.uri) {
      const uri = result.assets[0].uri;
      setPendingAvatarUri(uri);
      try {
        await updateProfileMutation.mutateAsync({ avatarUri: uri });
        showSuccessToast('Profile photo updated');
      } catch (error: any) {
        showErrorToast('Could not update photo', error?.message);
      } finally {
        setPendingAvatarUri(null);
      }
    }
  };

  const onSavePress = () => {
    handleSubmit(() => setConfirmVisible(true))();
  };

  const onConfirmSave = handleSubmit(async (values) => {
    try {
      await updateProfileMutation.mutateAsync({ phone: values.phone });
      setConfirmVisible(false);
      showSuccessToast('Profile updated', 'Your changes have been saved.');
    } catch (error: any) {
      setConfirmVisible(false);
      showErrorToast('Could not save changes', error?.message ?? 'Please try again.');
    }
  });

  const avatarUri = pendingAvatarUri ?? employee?.avatarUri;

  return (
    <Screen>
      <GradientBlobBackdrop />
      <ScrollView contentContainerStyle={styles.content}>
        <VideoHero theme={theme} title="My Profile" subtitle="Manage your account details" videoSrc={NATIVE_VIDEO.calendar} height={110} />
        <View style={styles.heroSpacer} />

        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper} onTouchEnd={() => setSheetVisible(true)}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialCommunityIcons name="account" size={40} color={theme.colors.onPrimary} />
              </View>
            )}
            <View style={styles.editBadge}>
              <MaterialCommunityIcons name="camera" size={18} color={theme.colors.primary} />
            </View>
          </View>
          {!avatarUri && (
            <Text style={styles.addPhotoHint} onPress={() => setSheetVisible(true)}>
              Add Photo
            </Text>
          )}
          <Text style={styles.employeeName}>{employee?.name}</Text>
          <View style={styles.employeeIdBadge}>
            <MaterialCommunityIcons name="badge-account-outline" size={14} color="rgba(255,255,255,0.85)" />
            <Text style={styles.employeeId}>
              {employee?.id} · {employee?.department}
            </Text>
          </View>
        </View>

        <GlassCard style={styles.card}>
          <Text style={styles.sectionLabel}>Account Details</Text>
          <ReadOnlyRow label="Full Name" value={employee?.name ?? ''} />
          <ReadOnlyRow label="Email" value={employee?.email ?? ''} />
          <ReadOnlyRow label="Department" value={employee?.department ?? ''} last={!managerName} />
          {!!managerName && <ReadOnlyRow label="Reports To" value={managerName} last />}
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={styles.sectionLabel}>Contact Information</Text>
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
          <AppButton
            label="Save Changes"
            onPress={onSavePress}
            disabled={!isDirty}
            loading={updateProfileMutation.isPending && !pendingAvatarUri}
          />
        </GlassCard>
      </ScrollView>

      <ImageSourceSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onPickCamera={() => requestAndPick('camera')}
        onPickGallery={() => requestAndPick('gallery')}
      />

      <ConfirmModal
        visible={confirmVisible}
        title="Save changes?"
        message="Your phone number will be updated on your profile."
        confirmLabel="Save"
        loading={updateProfileMutation.isPending}
        onConfirm={onConfirmSave}
        onCancel={() => setConfirmVisible(false)}
      />
    </Screen>
  );
}

function ReadOnlyRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={[styles.readOnlyRow, !last && styles.readOnlyRowBorder]}>
      <Text style={styles.readOnlyLabel}>{label}</Text>
      <Text style={styles.readOnlyValue}>{value}</Text>
    </View>
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
    heading: {
      ...theme.typography.h2,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.md,
    },
    avatarSection: {
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radius.xl,
      paddingVertical: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      ...theme.elevation.md,
    },
    avatarWrapper: {
      width: 96,
      height: 96,
      marginBottom: theme.spacing.sm,
    },
    avatarImage: {
      width: 96,
      height: 96,
      borderRadius: 48,
      borderWidth: 3,
      borderColor: 'rgba(255,255,255,0.4)',
    },
    avatarPlaceholder: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: 'rgba(255,255,255,0.15)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: 'rgba(255,255,255,0.6)',
    },
    editBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: theme.colors.primary,
      ...theme.elevation.sm,
    },
    addPhotoHint: {
      ...theme.typography.captionMedium,
      color: theme.colors.textInverse,
      marginBottom: theme.spacing.xs,
    },
    employeeName: {
      ...theme.typography.h3,
      color: theme.colors.textInverse,
    },
    employeeIdBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 2,
    },
    employeeId: {
      ...theme.typography.caption,
      color: 'rgba(255,255,255,0.85)',
    },
    card: {
      marginBottom: theme.spacing.md,
    },
    sectionLabel: {
      ...theme.typography.captionMedium,
      color: theme.colors.textMuted,
      marginBottom: theme.spacing.sm,
      textTransform: 'uppercase',
    },
    readOnlyRow: {
      paddingVertical: 10,
    },
    readOnlyRowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    readOnlyLabel: {
      ...theme.typography.caption,
      color: theme.colors.textMuted,
      marginBottom: 2,
    },
    readOnlyValue: {
      ...theme.typography.body,
      color: theme.colors.textPrimary,
    },
  });
}
