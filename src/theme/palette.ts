import { NOTE_PALETTE_COLORS } from './note-palette';

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
  noteColors: readonly string[];
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
  '#e4b46a',
  '#81b6bf',
  '#c3a1d9',
  '#a5bd80',
  '#df8f6f',
  '#d5a6e8',
  '#7fc7a8',
  '#d8c06d',
  '#8fa9df',
  '#d98eae',
  '#8bc4bb',
  '#c5a27d',
] as const;

export const BUILT_IN_PALETTES: Palette[] = [
  {
    id: 'forest',
    name: 'Forest',
    builtIn: true,
    colors: {
      background: '#111512',
      surface: '#1a1f1a',
      text: '#eae9df',
      muted: '#a0a89e',
      border: '#333a32',
      accent: '#e4b46a',
    },
    noteColors: NOTE_PALETTE_COLORS,
  },
  {
    id: 'autumn',
    name: 'Autumn',
    builtIn: true,
    colors: {
      background: '#15120f',
      surface: '#211b16',
      text: '#f1e8dc',
      muted: '#b7a99b',
      border: '#49392c',
      accent: '#c37a24',
    },
    noteColors: [
      '#dcae43',
      '#c96f3d',
      '#88a5ad',
      '#53686d',
      '#9a5b2f',
      '#6fbf9d',
      '#3d7652',
      '#8c786a',
      '#675448',
      '#a62c35',
      '#5b1424',
      '#3a286c',
    ],
  },
  {
    id: 'high-contrast',
    name: 'High Contrast',
    builtIn: true,
    colors: {
      background: '#000000',
      surface: '#000000',
      text: '#ffffff',
      muted: '#ffffff',
      border: '#ffffff',
      accent: '#ffff00',
    },
    noteColors: Array(12).fill('#ffffff'),
  },
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
  const channels = [1, 3, 5].map(
    (offset) => Number.parseInt(color.slice(offset, offset + 2), 16) / 255,
  );
  const linear = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
};

export const contrastRatio = (foreground: string, background: string) => {
  const [lighter, darker] = [relativeLuminance(foreground), relativeLuminance(background)].sort(
    (left, right) => right - left,
  );
  return (lighter + 0.05) / (darker + 0.05);
};
