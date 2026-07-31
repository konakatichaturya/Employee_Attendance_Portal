import AsyncStorage from '@react-native-async-storage/async-storage';

const NAMESPACE = 'ealm';

export const localStore = {
  async get<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(`${NAMESPACE}:${key}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  async set<T>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(`${NAMESPACE}:${key}`, JSON.stringify(value));
  },
  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(`${NAMESPACE}:${key}`);
  },
  async clearAll(keys: string[]): Promise<void> {
    await AsyncStorage.multiRemove(keys.map((k) => `${NAMESPACE}:${k}`));
  },
};
