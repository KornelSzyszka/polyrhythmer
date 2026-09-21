import { NOTE_PALETTE_COLORS } from '../theme/note-palette';

export const NOTE_TIMBRES = ['sine', 'triangle', 'sawtooth', 'square'] as const;
export type NoteTimbre = (typeof NOTE_TIMBRES)[number];

export interface NoteStyle {
  color: string;
  timbre: NoteTimbre;
}

export interface NotePalette {
  referenceOctave: number;
  notes: NoteStyle[];
}

interface Oklab {
  l: number;
  a: number;
  b: number;
}

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const normalizeHex = (color: string) => color.toLowerCase();
const linearize = (value: number) =>
  value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
const delinearize = (value: number) =>
  value <= 0.0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055;

const hexToOklab = (color: string): Oklab => {
  const value = Number.parseInt(color.slice(1), 16);
  const r = linearize(((value >> 16) & 255) / 255);
  const g = linearize(((value >> 8) & 255) / 255);
  const b = linearize((value & 255) / 255);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return {
    l: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
};

const oklabToHex = ({ l, a, b }: Oklab): string => {
  const lRoot = l + 0.3963377774 * a + 0.2158037573 * b;
  const mRoot = l - 0.1055613458 * a - 0.0638541728 * b;
  const sRoot = l - 0.0894841775 * a - 1.291485548 * b;
  const lLinear = lRoot ** 3;
  const mLinear = mRoot ** 3;
  const sLinear = sRoot ** 3;
  const channels = [
    4.0767416621 * lLinear - 3.3077115913 * mLinear + 0.2309699292 * sLinear,
    -1.2684380046 * lLinear + 2.6097574011 * mLinear - 0.3413193965 * sLinear,
    -0.0041960863 * lLinear - 0.7034186147 * mLinear + 1.707614701 * sLinear,
  ].map((channel) => Math.round(clamp(delinearize(channel)) * 255));
  return `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
};

export const defaultNotePalette = (): NotePalette => ({
  referenceOctave: 3,
  notes: NOTE_PALETTE_COLORS.map((color) => ({ color, timbre: 'triangle' })),
});

export const pitchClassForMidi = (midi: number) => ((midi % 12) + 12) % 12;
export const octaveForMidi = (midi: number) => Math.floor(midi / 12) - 1;

export function colorForMidi(midi: number, palette: NotePalette): string {
  const style = palette.notes[pitchClassForMidi(midi)];
  const octaveDelta = octaveForMidi(midi) - palette.referenceOctave;
  if (octaveDelta === 0) return normalizeHex(style.color);
  const lab = hexToOklab(style.color);
  const chromaScale = 1 - Math.min(Math.abs(octaveDelta) * 0.06, 0.24);
  return oklabToHex({
    l: clamp(lab.l + octaveDelta * 0.075, 0.2, 0.88),
    a: lab.a * chromaScale,
    b: lab.b * chromaScale,
  });
}

export function mixNoteColors(colors: string[]): string {
  if (!colors.length) return '#000000';
  const mixed = colors
    .map(hexToOklab)
    .reduce((sum, color) => ({ l: sum.l + color.l, a: sum.a + color.a, b: sum.b + color.b }), {
      l: 0,
      a: 0,
      b: 0,
    });
  return oklabToHex({
    l: mixed.l / colors.length,
    a: mixed.a / colors.length,
    b: mixed.b / colors.length,
  });
}

export const perceptualLightness = (color: string) => hexToOklab(color).l;
