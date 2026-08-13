// Headline-only weights (h1/h2/h3/subtitle) get the Fredoka display font
// loaded in App.tsx; body/caption text stays on the system font for
// readability at small sizes.
export const typography = {
  h1: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const, fontFamily: 'Fredoka_700Bold' },
  h2: { fontSize: 24, lineHeight: 30, fontWeight: '700' as const, fontFamily: 'Fredoka_700Bold' },
  h3: { fontSize: 20, lineHeight: 26, fontWeight: '600' as const, fontFamily: 'Fredoka_600SemiBold' },
  subtitle: { fontSize: 16, lineHeight: 22, fontWeight: '600' as const, fontFamily: 'Fredoka_600SemiBold' },
  body: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  bodyMedium: { fontSize: 14, lineHeight: 20, fontWeight: '600' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
  captionMedium: { fontSize: 12, lineHeight: 16, fontWeight: '600' as const },
  overline: { fontSize: 11, lineHeight: 14, fontWeight: '700' as const, letterSpacing: 0.6 },
};

export type TypographyVariant = keyof typeof typography;
