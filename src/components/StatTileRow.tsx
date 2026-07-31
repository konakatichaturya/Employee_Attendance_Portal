import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, type Theme } from '../theme/ThemeContext';

interface StatTile {
  key: string;
  label: string;
  value: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
}

interface StatTileRowProps {
  tiles: StatTile[];
}

export function StatTileRow({ tiles }: StatTileRowProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.row}>
      {tiles.map((tile) => (
        <View key={tile.key} style={[styles.tile, { backgroundColor: tile.color }]}>
          <MaterialCommunityIcons name={tile.icon} size={20} color="rgba(255,255,255,0.9)" />
          <Text style={styles.value}>{tile.value}</Text>
          <Text style={styles.label} numberOfLines={1}>
            {tile.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
    },
    tile: {
      flex: 1,
      borderRadius: theme.radius.lg,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xs,
      gap: 4,
      ...theme.elevation.sm,
    },
    value: {
      ...theme.typography.h3,
      color: theme.colors.textInverse,
    },
    label: {
      ...theme.typography.caption,
      color: 'rgba(255,255,255,0.85)',
    },
  });
}
