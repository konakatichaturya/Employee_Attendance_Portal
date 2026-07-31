import type { GeoPoint } from '../../types';

// Rounding to ~11m precision keeps the cache small while still deduping repeat
// lookups for the same spot (e.g. checking in from the same office desk).
function cacheKey(location: GeoPoint): string {
  return `${location.latitude.toFixed(4)},${location.longitude.toFixed(4)}`;
}

const cache = new Map<string, string>();

export async function reverseGeocode(location: GeoPoint): Promise<string> {
  const key = cacheKey(location);
  const cached = cache.get(key);
  if (cached) return cached;

  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${location.latitude}&lon=${location.longitude}&zoom=18&addressdetails=0`;
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`Reverse geocoding failed: ${response.status}`);
  }

  const data: { display_name?: string } = await response.json();
  if (!data.display_name) {
    throw new Error('No address found for this location');
  }

  cache.set(key, data.display_name);
  return data.display_name;
}
