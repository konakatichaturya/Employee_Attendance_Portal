// A brighter, more saturated companion palette used only within the marketing
// landing page (blobs, gradients, feature icons) — kept separate from the
// shared app theme so the actual product screens (dashboards, forms, buttons)
// stay in their calmer, professional palette. The landing page is allowed to
// be louder than the app it's selling.
export const vivid = {
  blue: '#2E6BFF',
  blueDeep: '#0B3FE0',
  cyan: '#00C2FF',
  purple: '#8B5CF6',
  pink: '#FF4FA3',
  orange: '#FF7A29',
  green: '#0FD97C',
  yellow: '#FFC93C',
  navy: '#0A1B3D',
} as const;

export const VIVID_FEATURE_COLORS = [vivid.blue, vivid.orange, vivid.green, vivid.purple, vivid.pink, vivid.cyan] as const;
