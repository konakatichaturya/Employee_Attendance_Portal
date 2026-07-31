import React, { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, type Theme } from '../../../theme/ThemeContext';

interface ImageSourceSheetProps {
  visible: boolean;
  onClose: () => void;
  onPickCamera: () => void;
  onPickGallery: () => void;
}

export function ImageSourceSheet({ visible, onClose, onPickCamera, onPickGallery }: ImageSourceSheetProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Update profile photo</Text>

          <Pressable style={styles.option} onPress={onPickCamera}>
            <View style={styles.optionIcon}>
              <MaterialCommunityIcons name="camera" size={20} color={theme.colors.primary} />
            </View>
            <Text style={styles.optionLabel}>Take Photo</Text>
          </Pressable>

          <Pressable style={styles.option} onPress={onPickGallery}>
            <View style={styles.optionIcon}>
              <MaterialCommunityIcons name="image" size={20} color={theme.colors.primary} />
            </View>
            <Text style={styles.optionLabel}>Choose from Gallery</Text>
          </Pressable>

          <Pressable style={styles.cancel} onPress={onClose}>
            <Text style={styles.cancelLabel}>Cancel</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(20, 22, 27, 0.45)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.radius.xl,
      borderTopRightRadius: theme.radius.xl,
      padding: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
    },
    title: {
      ...theme.typography.subtitle,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      gap: theme.spacing.sm,
    },
    optionIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionLabel: {
      ...theme.typography.body,
      color: theme.colors.textPrimary,
    },
    cancel: {
      marginTop: theme.spacing.sm,
      paddingVertical: 12,
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: theme.radius.md,
    },
    cancelLabel: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
    },
  });
}
