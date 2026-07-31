import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { localStore } from '../services/storage/localStore';
import { theme as baseTheme } from '../theme';
import { darkColors, lightColors } from '../theme/colors';

export type WebThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'web_theme_mode';

function buildTheme(mode: WebThemeMode) {
  return { ...baseTheme, colors: mode === 'dark' ? darkColors : lightColors };
}

export type WebTheme = ReturnType<typeof buildTheme>;

interface WebThemeContextValue {
  mode: WebThemeMode;
  theme: WebTheme;
  toggleMode: () => void;
}

const WebThemeContext = createContext<WebThemeContextValue | null>(null);

export function WebThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<WebThemeMode>('dark');

  useEffect(() => {
    localStore.get<WebThemeMode>(STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark') setMode(saved);
    });
  }, []);

  const toggleMode = () => {
    setMode((prev) => {
      const next: WebThemeMode = prev === 'dark' ? 'light' : 'dark';
      localStore.set(STORAGE_KEY, next);
      return next;
    });
  };

  const value = useMemo<WebThemeContextValue>(() => ({ mode, theme: buildTheme(mode), toggleMode }), [mode]);

  return <WebThemeContext.Provider value={value}>{children}</WebThemeContext.Provider>;
}

export function useWebTheme(): WebThemeContextValue {
  const ctx = useContext(WebThemeContext);
  if (!ctx) {
    throw new Error('useWebTheme must be used within WebThemeProvider');
  }
  return ctx;
}
