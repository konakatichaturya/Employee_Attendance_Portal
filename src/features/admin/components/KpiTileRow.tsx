import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, type Theme } from '../../../theme/ThemeContext';

interface KpiTile {
  key: string;
  label: string;
  value: string;
  sublabel?: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
}

interface KpiTileRowProps {
  tiles: KpiTile[];
}

export function KpiTileRow({ tiles }: KpiTileRowProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.row}>
      {tiles.map((tile) => (
        <View key={tile.key} style={styles.tile}>
          <View style={[styles.iconWrapper, { backgroundColor: `${tile.color}26` }]}>
            <MaterialCommunityIcons name={tile.icon} size={18} color={tile.color} />
          </View>
          <Text style={styles.value}>{tile.value}</Text>
          <Text style={styles.label} numberOfLines={1}>
            {tile.label}
          </Text>
          {!!tile.sublabel && (
            <Text style={[styles.sublabel, { color: tile.color }]} numberOfLines={1}>
              {tile.sublabel}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    tile: {
      flex: 1,
      minWidth: 140,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.md,
      gap: 4,
    },
    iconWrapper: {
      width: 34,
      height: 34,
      borderRadius: theme.radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    value: {
      ...theme.typography.h2,
      color: theme.colors.textPrimary,
    },
    label: {
      ...theme.typography.caption,
      color: theme.colors.textMuted,
    },
    sublabel: {
      ...theme.typography.captionMedium,
    },
  });
}
