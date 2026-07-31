import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme, type Theme } from '../../../theme/ThemeContext';
import { useReverseGeocode } from '../../../hooks/useReverseGeocode';
import type { GeoPoint } from '../../../types';

interface LocationMapPreviewProps {
  location: GeoPoint;
  label: string;
}

export function LocationMapPreview({ location, label }: LocationMapPreviewProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { data: address, isPending } = useReverseGeocode(location);
  const coords = `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {label}
        {'\n'}
        {isPending ? 'Locating…' : address ?? coords}
      </Text>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
  container: {
    height: 130,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
  },
  });
}
