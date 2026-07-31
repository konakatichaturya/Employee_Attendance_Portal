export const palette = {
  primary50: '#EAF1FF',
  primary100: '#D4E3FF',
  primary300: '#7DA6FF',
  primary500: '#2E5FEF',
  primary600: '#2450D6',
  primary700: '#1B3EAD',

  accent300: '#FFB27D',
  accent500: '#FF8A3D',
  accent600: '#F2721E',

  success500: '#1FAA59',
  success100: '#DCF5E6',
  warning500: '#F5A623',
  warning100: '#FCEACB',
  danger500: '#E5484D',
  danger100: '#FBE0E1',

  neutral0: '#FFFFFF',
  neutral50: '#F7F8FA',
  neutral100: '#F0F2F5',
  neutral200: '#E3E6EB',
  neutral300: '#CBD1DA',
  neutral400: '#9AA3B2',
  neutral500: '#707886',
  neutral600: '#525A67',
  neutral700: '#3A3F4A',
  neutral800: '#252932',
  neutral900: '#14161B',
} as const;

export const lightColors = {
  background: palette.neutral50,
  surface: palette.neutral0,
  surfaceAlt: palette.neutral100,
  border: palette.neutral200,

  textPrimary: palette.neutral900,
  textSecondary: palette.neutral600,
  textMuted: palette.neutral400,
  textInverse: palette.neutral0,

  primary: palette.primary500,
  primaryDark: palette.primary700,
  primaryLight: palette.primary100,
  onPrimary: palette.neutral0,

  accent: palette.accent500,
  onAccent: palette.neutral0,

  success: palette.success500,
  successBg: palette.success100,
  warning: palette.warning500,
  warningBg: palette.warning100,
  danger: palette.danger500,
  dangerBg: palette.danger100,

  shadow: 'rgba(20, 22, 27, 0.12)',
};

// Matches src/admin/theme.ts's palette for visual parity between the
// employee app and the admin console when dark mode is active.
export const darkColors = {
  background: '#0B0F1A',
  surface: '#141A2A',
  surfaceAlt: '#1B2233',
  border: '#242C40',

  textPrimary: '#F4F6FB',
  textSecondary: '#A6AFC3',
  textMuted: '#6C7691',
  textInverse: '#0B0F1A',

  primary: '#5B8DEF',
  primaryDark: '#9DC0FF',
  primaryLight: 'rgba(91, 141, 239, 0.16)',
  onPrimary: palette.neutral0,

  accent: '#9B7BFF',
  onAccent: palette.neutral0,

  success: '#3DD598',
  successBg: 'rgba(61, 213, 152, 0.16)',
  warning: '#FFB547',
  warningBg: 'rgba(255, 181, 71, 0.16)',
  danger: '#FF6B6B',
  dangerBg: 'rgba(255, 107, 107, 0.16)',

  shadow: 'rgba(0, 0, 0, 0.5)',
};

export type AppColors = typeof lightColors;
