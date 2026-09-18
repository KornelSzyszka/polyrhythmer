import { MODES, type Mode } from './harmony';
import { LAYER_COLORS } from '../theme/palette';
export const SOUNDS = ['wood', 'sine', 'bell'] as const;
export const MAX_LAYERS = 12;
export const MAX_MASTER_GAIN = 2;
export interface RhythmLayer {
  id: string; beatsPerCycle: number; sound: typeof SOUNDS[number];
  color: string; accentFirst: boolean; gain: number; pan: number; muted: boolean; solo: boolean;
}
export interface DroneState {
  enabled: boolean; root: number; octave: number; mode: Mode;
  chord: 'root' | 'fifth' | 'octave' | 'triad'; gain: number; filterHz: number; spread: number;
}
export interface SessionState {
  version: 1; bpm: number; cycleBeats: number; subdivision: number; layers: RhythmLayer[];
  drone: DroneState; visualMode: 'circle' | 'timeline' | 'polygons'; masterGain: number;
}
export const newLayer = (beats: number, index: number): RhythmLayer => ({
  id: crypto.randomUUID(), beatsPerCycle: beats, sound: index % 2 ? 'sine' : 'wood',
  color: LAYER_COLORS[index % LAYER_COLORS.length], accentFirst: true, gain: .65, pan: 0, muted: false, solo: false,
});
export const defaultSession = (): SessionState => ({
  version: 1, bpm: 90, cycleBeats: 4, subdivision: 0, layers: [newLayer(3, 0), newLayer(2, 1)],
  drone: { enabled: false, root: 2, octave: 3, mode: 'dorian', chord: 'fifth', gain: .3, filterHz: 1200, spread: .5 },
  visualMode: 'circle', masterGain: .7,
});
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object';
const range = (v: unknown, min: number, max: number, integer = false) => typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max && (!integer || Number.isInteger(v));
export function isSession(v: unknown): v is SessionState {
  if (!object(v) || v.version !== 1 || !range(v.bpm, 20, 300) || !range(v.cycleBeats, 1, 16, true) || !range(v.subdivision, 0, 6, true) || !range(v.masterGain, 0, MAX_MASTER_GAIN) || !['circle', 'timeline', 'polygons'].includes(String(v.visualMode))) return false;
  if (!Array.isArray(v.layers) || v.layers.length < 2 || v.layers.length > MAX_LAYERS) return false;
  if (!v.layers.every(l => object(l) && typeof l.id === 'string' && /^[a-zA-Z0-9-]{1,64}$/.test(l.id) && range(l.beatsPerCycle, 1, 16, true) && SOUNDS.includes(l.sound as typeof SOUNDS[number]) && typeof l.color === 'string' && /^#[0-9a-f]{6}$/i.test(l.color) && range(l.gain, 0, 1) && range(l.pan, -1, 1) && ['muted', 'solo', 'accentFirst'].every(k => typeof l[k] === 'boolean'))) return false;
  if (new Set(v.layers.map(l => l.id)).size !== v.layers.length) return false;
  const d = v.drone;
  return object(d) && typeof d.enabled === 'boolean' && range(d.root, 0, 11, true) && range(d.octave, 1, 5, true) && MODES.includes(d.mode as Mode) && ['root', 'fifth', 'octave', 'triad'].includes(String(d.chord)) && range(d.gain, 0, 1) && range(d.filterHz, 100, 8000) && range(d.spread, 0, 1);
}
