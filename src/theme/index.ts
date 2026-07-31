import { MD3LightTheme, type MD3Theme } from 'react-native-paper';
import { lightColors } from './colors';
import { spacing, radius, elevation } from './spacing';
import { typography } from './typography';

export const paperTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: 12,
  colors: {
    ...MD3LightTheme.colors,
    primary: lightColors.primary,
    onPrimary: lightColors.onPrimary,
    primaryContainer: lightColors.primaryLight,
    secondary: lightColors.accent,
    onSecondary: lightColors.onAccent,
    background: lightColors.background,
    surface: lightColors.surface,
    error: lightColors.danger,
    outline: lightColors.border,
  },
};

export const theme = {
  colors: lightColors,
  spacing,
  radius,
  elevation,
  typography,
};

export type AppTheme = typeof theme;
export * from './colors';
export * from './spacing';
export * from './typography';
