import { COLORS, defaultSession, isSession, type SessionState } from '../domain/session';
export const STORAGE_KEY = 'polyrhythmer.session.v1';
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
export function upgradeSession(value: unknown): SessionState | null {
  if (!object(value)) return null;
  const layers = Array.isArray(value.layers)
    ? value.layers.map((layer, index) => object(layer) && !('color' in layer) ? { ...layer, color: COLORS[index % COLORS.length] } : layer)
    : value.layers;
  const candidate = {
    ...value,
    ...(!('subdivision' in value) ? { subdivision: 0 } : {}),
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
    return { state: defaultSession(), warning: 'Nie udało się odczytać zapisu. Przywrócono bezpieczną sesję 3:2.' };
  }
}
export function saveSession(state: SessionState): boolean {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; }
  catch { return false; }
}
