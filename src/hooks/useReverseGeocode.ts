import { useQuery } from '@tanstack/react-query';
import { reverseGeocode } from '../services/location/reverseGeocode';
import type { GeoPoint } from '../types';

export function useReverseGeocode(location: GeoPoint | null | undefined) {
  return useQuery({
    queryKey: ['reverse-geocode', location?.latitude.toFixed(4), location?.longitude.toFixed(4)],
    queryFn: () => reverseGeocode(location as GeoPoint),
    enabled: !!location,
    staleTime: Infinity,
    retry: 1,
  });
}
