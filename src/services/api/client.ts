import axios from 'axios';
import Constants from 'expo-constants';
import { secureStorage } from '../storage/secureStorage';

const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl ?? 'https://api.example.com';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await secureStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let onUnauthorized: (() => void) | null = null;

export function registerUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      await secureStorage.clearToken();
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);
