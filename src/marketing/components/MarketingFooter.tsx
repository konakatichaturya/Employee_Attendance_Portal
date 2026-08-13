import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { WebTheme } from '../../admin/ThemeContext';
import { Logo } from '../../components/Logo';
import { FOOTER_COLUMNS, SOCIAL_ICONS } from '../content';
import { vivid } from '../vividPalette';

interface MarketingFooterProps {
  theme: WebTheme;
}

export function MarketingFooter({ theme }: MarketingFooterProps) {
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.root}>
      <View style={styles.topRow}>
        <Logo theme={theme} size="sm" tone="inverse" showLabel />
        <View style={styles.socialRow}>
          {SOCIAL_ICONS.map((icon) => (
            <View key={icon} style={styles.socialIcon}>
              <MaterialCommunityIcons name={icon} size={16} color="#FFFFFF" />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.columnsRow}>
        {FOOTER_COLUMNS.map((col) => (
          <View key={col.heading} style={styles.column}>
            <Text style={styles.columnHeading}>{col.heading}</Text>
            {col.links.map((link) => (
              <Text key={link} style={styles.columnLink}>
                {link}
              </Text>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.bottomText}>Attendance & Leave, simplified.</Text>
        <Text style={styles.bottomText}>© {new Date().getFullYear()} WorkTrack.</Text>
      </View>
    </View>
  );
}

function createStyles(theme: WebTheme) {
  return StyleSheet.create({
    root: {
      backgroundColor: vivid.navy,
      paddingHorizontal: theme.spacing.xxl,
      paddingTop: theme.spacing.xxl,
      paddingBottom: theme.spacing.xl,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.xxl,
    },
    socialRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    socialIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.12)',
    },
    columnsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xl,
      paddingBottom: theme.spacing.xl,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.14)',
    },
    column: {
      minWidth: 160,
      gap: 10,
    },
    columnHeading: {
      ...theme.typography.captionMedium,
      color: '#FFFFFF',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
      marginBottom: 4,
    },
    columnLink: {
      ...theme.typography.body,
      color: 'rgba(255,255,255,0.72)',
    },
    bottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
      paddingTop: theme.spacing.lg,
    },
    bottomText: {
      ...theme.typography.caption,
      color: 'rgba(255,255,255,0.55)',
    },
  });
}
