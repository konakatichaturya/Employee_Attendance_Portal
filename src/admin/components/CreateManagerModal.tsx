import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useWebTheme, type WebTheme } from '../ThemeContext';
import { AppButton } from '../../components/AppButton';
import { InputField } from '../../components/InputField';
import { useCreateManager } from '../hooks/useAdminData';
import { showErrorToast, showSuccessToast } from '../../components/toast';

interface CreateManagerModalProps {
  visible: boolean;
  onClose: () => void;
}

const initialForm = { employeeId: '', name: '', email: '', phone: '', department: '', password: '' };

export function CreateManagerModal({ visible, onClose }: CreateManagerModalProps) {
  const { theme } = useWebTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const createManager = useCreateManager();
  const [form, setForm] = useState(initialForm);

  const setField = (key: keyof typeof initialForm) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  const isValid =
    form.employeeId.trim() && form.name.trim() && form.email.trim() && form.phone.trim() && form.department.trim() && form.password.trim().length >= 8;

  const handleClose = () => {
    setForm(initialForm);
    onClose();
  };

  const onSubmit = () => {
    createManager.mutate(form, {
      onSuccess: () => {
        showSuccessToast('Manager created', `${form.name} can now sign in from the Manager tab.`);
        handleClose();
      },
      onError: (error: any) => showErrorToast('Could not create manager', error?.message ?? 'Please try again.'),
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} accessibilityElementsHidden />
        <View style={styles.sheet}>
          <Text style={styles.title}>Create Manager</Text>
          <Text style={styles.subtitle}>They'll be able to sign in from the Manager tab with the password you set here.</Text>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <InputField label="Employee ID" value={form.employeeId} onChangeText={setField('employeeId')} placeholder="MGR-002" autoCapitalize="characters" />
            <InputField label="Full Name" value={form.name} onChangeText={setField('name')} placeholder="Jane Doe" />
            <InputField label="Email" value={form.email} onChangeText={setField('email')} placeholder="jane@company.com" keyboardType="email-address" autoCapitalize="none" />
            <InputField label="Phone Number" value={form.phone} onChangeText={setField('phone')} placeholder="+91 98765 43210" keyboardType="phone-pad" />
            <InputField label="Department" value={form.department} onChangeText={setField('department')} placeholder="Engineering" />
            <InputField label="Password" value={form.password} onChangeText={setField('password')} placeholder="At least 8 characters" secureTextEntry autoCapitalize="none" />
          </ScrollView>

          <View style={styles.actions}>
            <AppButton label="Cancel" variant="outline" onPress={handleClose} style={styles.actionButton} disabled={createManager.isPending} />
            <AppButton
              label="Create"
              onPress={onSubmit}
              style={styles.actionButton}
              loading={createManager.isPending}
              disabled={!isValid || createManager.isPending}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(theme: WebTheme) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg,
    },
    sheet: {
      width: '100%',
      maxWidth: 440,
      maxHeight: '85%',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.lg,
    },
    title: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
      marginBottom: 4,
    },
    subtitle: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
    },
    form: {
      maxHeight: 420,
    },
    actions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    actionButton: {
      flex: 1,
    },
  });
}
