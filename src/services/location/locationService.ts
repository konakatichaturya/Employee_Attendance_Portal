import * as Location from 'expo-location';
import type { GeoPoint } from '../../types';

export class LocationPermissionDeniedError extends Error {
  constructor() {
    super('Location permission was denied. Enable it in settings to check in/out.');
    this.name = 'LocationPermissionDeniedError';
  }
}

export async function getCurrentLocation(): Promise<GeoPoint> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new LocationPermissionDeniedError();
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}
