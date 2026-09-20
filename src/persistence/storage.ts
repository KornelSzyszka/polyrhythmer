import {
  defaultProgression,
  defaultSession,
  isSession,
  type SessionState,
} from '../domain/session';
import { defaultNotePalette } from '../domain/note-colors';
import { LAYER_COLORS } from '../theme/palette';
export const STORAGE_KEY = 'polyrhythmer.session.v1';
const object = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);
export function upgradeSession(value: unknown): SessionState | null {
  if (!object(value)) return null;
  const layers = Array.isArray(value.layers)
    ? value.layers.slice(0, 4).map((layer, index) =>
        object(layer)
          ? {
              ...layer,
              color: 'color' in layer ? layer.color : LAYER_COLORS[index % LAYER_COLORS.length],
              enabled: 'enabled' in layer ? layer.enabled : index < 2,
            }
          : layer,
      )
    : [];
  while (layers.length < 4) {
    const index = layers.length;
    layers.push({
      id: crypto.randomUUID(),
      beatsPerCycle: index === 2 ? 5 : 7,
      sound: index % 2 ? 'sine' : 'wood',
      color: LAYER_COLORS[index % LAYER_COLORS.length],
      accentFirst: true,
      gain: 0.65,
      pan: 0,
      muted: false,
      solo: false,
      enabled: false,
    });
  }
  const candidate = {
    ...value,
    ...(!('subdivision' in value) ? { subdivision: 0 } : {}),
    ...(!('clickSound' in value) ? { clickSound: defaultSession().clickSound } : {}),
    ...(!('notePalette' in value) ? { notePalette: defaultNotePalette() } : {}),
    ...(!object(value.drone) || !('progression' in value.drone)
      ? {
          drone: {
            ...(object(value.drone) ? value.drone : {}),
            progression: defaultProgression(),
          },
        }
      : {
          drone: {
            ...value.drone,
            progression: Array.isArray(value.drone.progression)
              ? value.drone.progression.map((step, index) =>
                  object(step) && !('startStep' in step) ? { ...step, startStep: index } : step,
                )
              : value.drone.progression,
          },
        }),
    layers,
  };
  return isSession(candidate) ? candidate : null;
}
export function loadSession(): { state: SessionState; warning: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { state: defaultSession(), warning: '' };
    const state = upgradeSession(JSON.parse(raw));
    if (state) return { state, warning: '' };
    throw new Error('Invalid session');
  } catch {
    return {
      state: defaultSession(),
      warning: 'Nie udało się odczytać zapisu. Przywrócono bezpieczną sesję 3:2.',
    };
  }
}
export function saveSession(state: SessionState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
