import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';
import { localStore } from '../services/storage/localStore';
import { theme as baseTheme } from './index';
import { darkColors, lightColors } from './colors';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'native_theme_mode';

function buildTheme(mode: ThemeMode) {
  return { ...baseTheme, colors: mode === 'dark' ? darkColors : lightColors };
}

function buildPaperTheme(mode: ThemeMode): MD3Theme {
  const colors = mode === 'dark' ? darkColors : lightColors;
  const base = mode === 'dark' ? MD3DarkTheme : MD3LightTheme;
  return {
    ...base,
    roundness: 12,
    colors: {
      ...base.colors,
      primary: colors.primary,
      onPrimary: colors.onPrimary,
      primaryContainer: colors.primaryLight,
      secondary: colors.accent,
      onSecondary: colors.onAccent,
      background: colors.background,
      surface: colors.surface,
      error: colors.danger,
      outline: colors.border,
    },
  };
}

export type Theme = ReturnType<typeof buildTheme>;

interface ThemeContextValue {
  mode: ThemeMode;
  theme: Theme;
  paperTheme: MD3Theme;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function NativeThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    localStore.get<ThemeMode>(STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark') setMode(saved);
    });
  }, []);

  const toggleMode = () => {
    setMode((prev) => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      localStore.set(STORAGE_KEY, next);
      return next;
    });
  };

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, theme: buildTheme(mode), paperTheme: buildPaperTheme(mode), toggleMode }),
    [mode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within NativeThemeProvider');
  }
  return ctx;
}
