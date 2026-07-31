import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = 'auth_token';

export const secureStorage = {
  async getToken(): Promise<string | null> {
    if (Platform.OS === 'web') {
      return AsyncStorage.getItem(AUTH_TOKEN_KEY);
    }
    return SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  },
  async setToken(token: string): Promise<void> {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      return;
    }
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
  },
  async clearToken(): Promise<void> {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
  },
};
