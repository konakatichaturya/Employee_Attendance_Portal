import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useTheme, type Theme } from '../../../theme/ThemeContext';
import type { GeoPoint } from '../../../types';

interface LocationMapPreviewProps {
  location: GeoPoint;
  label: string;
}

export function LocationMapPreview({ location, label }: LocationMapPreviewProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        pointerEvents="none"
        scrollEnabled={false}
        zoomEnabled={false}
        region={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.004,
          longitudeDelta: 0.004,
        }}
      >
        <Marker coordinate={location} title={label} pinColor={theme.colors.primary} />
      </MapView>
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
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  });
}
