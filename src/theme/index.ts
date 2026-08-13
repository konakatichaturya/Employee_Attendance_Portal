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

// A structurally-widened theme shape (colors as plain `string`, not the literal hex
// types `AppTheme` infers) — used by components shared across the native `Theme` and
// web `WebTheme` contexts, since both of those are themselves string-widened (their
// `colors` object is chosen dynamically between light/dark at runtime) and neither is
// directly assignable to the narrower `AppTheme`.
export interface SharedThemeColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  onPrimary: string;
  accent: string;
  onAccent: string;
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  danger: string;
  dangerBg: string;
  shadow: string;
}

export interface SharedTheme {
  colors: SharedThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  elevation: typeof elevation;
  typography: typeof typography;
}
