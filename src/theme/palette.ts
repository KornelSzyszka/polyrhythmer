export interface PaletteColors {
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
}

export interface Palette {
  id: string;
  name: string;
  colors: PaletteColors;
  builtIn: boolean;
}

export interface VisualTheme {
  beatLabel: string;
  grid: string;
  gridStrong: string;
  halo: string;
  label: string;
  pointer: string;
}

export const LAYER_COLORS = [
  '#e4b46a', '#81b6bf', '#c3a1d9', '#a5bd80', '#df8f6f', '#d5a6e8',
  '#7fc7a8', '#d8c06d', '#8fa9df', '#d98eae', '#8bc4bb', '#c5a27d',
] as const;

export const BUILT_IN_PALETTES: Palette[] = [
  { id: 'forest', name: 'Leśna', builtIn: true, colors: { background: '#111512', surface: '#1a1f1a', text: '#eae9df', muted: '#a0a89e', border: '#333a32', accent: '#e4b46a' } },
  { id: 'slate', name: 'Łupek', builtIn: true, colors: { background: '#111827', surface: '#1f2937', text: '#e5e7eb', muted: '#9ca3af', border: '#374151', accent: '#67e8f9' } },
  { id: 'dawn', name: 'Świt', builtIn: true, colors: { background: '#faf7f0', surface: '#fffdf8', text: '#29251e', muted: '#6b6458', border: '#d9d0c0', accent: '#aa5b2d' } },
  { id: 'high-contrast', name: 'Wysoki kontrast', builtIn: true, colors: { background: '#000000', surface: '#000000', text: '#ffffff', muted: '#ffffff', border: '#ffffff', accent: '#ffff00' } },
];

export const createVisualTheme = (colors: PaletteColors): VisualTheme => ({
  beatLabel: colors.background,
  grid: colors.border,
  gridStrong: colors.muted,
  halo: colors.accent,
  label: colors.muted,
  pointer: colors.text,
});

const relativeLuminance = (color: string) => {
  const channels = [1, 3, 5].map(offset => Number.parseInt(color.slice(offset, offset + 2), 16) / 255);
  const linear = channels.map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4);
  return .2126 * linear[0] + .7152 * linear[1] + .0722 * linear[2];
};

export const contrastRatio = (foreground: string, background: string) => {
  const [lighter, darker] = [relativeLuminance(foreground), relativeLuminance(background)].sort((left, right) => right - left);
  return (lighter + .05) / (darker + .05);
};
