import { PREFERENCE_LANGUAGES, type Language } from '../i18n';
import { BUILT_IN_PALETTES, type Palette, type PaletteColors } from '../theme/palette';
import { NOTE_PALETTE_COLORS } from '../theme/note-palette';

export const PREFERENCES_STORAGE_KEY = 'synesterra.preferences.v1';
export const LEGACY_PREFERENCES_STORAGE_KEY = 'polyrhythmer.preferences.v1';

export type { Palette, PaletteColors } from '../theme/palette';
export { PREFERENCE_LANGUAGES } from '../i18n';
export interface PreferencesState {
  version: 1;
  language: Language;
  visualMotion: 'pointer' | 'runners';
  activePaletteId: string;
  palettes: Palette[];
}

const COLOR = /^#[0-9a-fA-F]{6}$/;
const ID = /^[a-z0-9-]{1,64}$/;
const object = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

export { BUILT_IN_PALETTES } from '../theme/palette';

export const defaultPreferences = (): PreferencesState => ({
  version: 1,
  language: 'en',
  visualMotion: 'pointer',
  activePaletteId: 'forest',
  palettes: [],
});
export const availablePalettes = (preferences: PreferencesState): Palette[] => [
  ...BUILT_IN_PALETTES,
  ...preferences.palettes,
];
export const paletteById = (preferences: PreferencesState, id: string): Palette | undefined =>
  availablePalettes(preferences).find((palette) => palette.id === id);
export const isBuiltInPalette = (id: string) =>
  BUILT_IN_PALETTES.some((palette) => palette.id === id);

const isColors = (value: unknown): value is PaletteColors =>
  object(value) &&
  ['background', 'surface', 'text', 'muted', 'border', 'accent'].every(
    (key) => typeof value[key] === 'string' && COLOR.test(value[key] as string),
  );
const isCustomPalette = (value: unknown): value is Palette =>
  object(value) &&
  typeof value.id === 'string' &&
  ID.test(value.id) &&
  !isBuiltInPalette(value.id) &&
  typeof value.name === 'string' &&
  value.name.trim().length > 0 &&
  value.name.length <= 32 &&
  value.builtIn === false &&
  isColors(value.colors) &&
  Array.isArray(value.noteColors) &&
  value.noteColors.length === 12 &&
  value.noteColors.every((color) => typeof color === 'string' && COLOR.test(color));

const migratePalette = (value: Record<string, unknown>): Record<string, unknown> => ({
  ...value,
  noteColors:
    Array.isArray(value.noteColors) && value.noteColors.length === 12
      ? value.noteColors
      : NOTE_PALETTE_COLORS,
});

const isLegacyAutumnPalette = (value: unknown): value is Record<string, unknown> => {
  if (!object(value)) return false;
  const name = typeof value.name === 'string' ? value.name.trim().toLocaleLowerCase() : '';
  return name === 'jesień' || name === 'jesien' || value.id === 'autumn';
};

const migratePreferences = (value: Record<string, unknown>): Record<string, unknown> => {
  const palettes = Array.isArray(value.palettes)
    ? value.palettes
        .filter((palette) => !isLegacyAutumnPalette(palette))
        .map((palette) => (object(palette) ? migratePalette(palette) : palette))
    : value.palettes;
  const activePaletteId =
    typeof value.activePaletteId === 'string' ? value.activePaletteId : 'forest';
  return {
    ...value,
    palettes,
    activePaletteId:
      activePaletteId === 'slate' || activePaletteId === 'dawn'
        ? 'forest'
        : activePaletteId === 'autumn' ||
            (Array.isArray(value.palettes) &&
              value.palettes.some(
                (palette) =>
                  object(palette) &&
                  palette.id === activePaletteId &&
                  isLegacyAutumnPalette(palette),
              ))
          ? 'autumn'
          : activePaletteId,
    language: 'language' in value ? value.language : 'en',
    visualMotion: 'visualMotion' in value ? value.visualMotion : 'pointer',
  };
};

export const isPreferences = (value: unknown): value is PreferencesState =>
  object(value) &&
  value.version === 1 &&
  PREFERENCE_LANGUAGES.includes(value.language as Language) &&
  ['pointer', 'runners'].includes(String(value.visualMotion)) &&
  typeof value.activePaletteId === 'string' &&
  Array.isArray(value.palettes) &&
  value.palettes.length <= 20 &&
  value.palettes.every(isCustomPalette) &&
  new Set(value.palettes.map((palette) => palette.id)).size === value.palettes.length &&
  !!paletteById(
    {
      version: 1,
      language: value.language as Language,
      visualMotion: value.visualMotion as PreferencesState['visualMotion'],
      activePaletteId: value.activePaletteId,
      palettes: value.palettes,
    },
    value.activePaletteId,
  );

export function loadPreferences(): { preferences: PreferencesState; warning: string } {
  try {
    const current = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    const raw = current ?? localStorage.getItem(LEGACY_PREFERENCES_STORAGE_KEY);
    if (!raw) return { preferences: defaultPreferences(), warning: '' };
    const value: unknown = JSON.parse(raw);
    const parsed: unknown = object(value) ? migratePreferences(value) : value;
    if (isPreferences(parsed)) {
      if (!current) {
        try {
          localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(parsed));
        } catch {
          // The valid legacy preferences remain usable even when migration cannot be persisted.
        }
      }
      return { preferences: parsed, warning: '' };
    }
    throw new Error('Invalid preferences');
  } catch {
    return {
      preferences: defaultPreferences(),
      warning: 'Nie udało się odczytać palet. Przywrócono paletę Forest.',
    };
  }
}
export function savePreferences(preferences: PreferencesState): boolean {
  try {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
    return true;
  } catch {
    return false;
  }
}
