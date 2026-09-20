import { CHORDS, MODES, type Chord, type Mode } from './harmony';
import { defaultNotePalette, NOTE_TIMBRES, type NotePalette, type NoteTimbre } from './note-colors';
import { LAYER_COLORS } from '../theme/palette';
import { lcm } from './rhythm';
export const SOUNDS = ['wood', 'sine', 'bell'] as const;
export const CLICK_SOUNDS = ['soft', 'wood', 'glass'] as const;
export const MAX_LAYERS = 4;
export const MAX_MASTER_GAIN = 2;
export interface ClickSoundState {
  sound: (typeof CLICK_SOUNDS)[number];
  pitch: number;
  variation: number;
}
export interface RhythmLayer {
  id: string;
  beatsPerCycle: number;
  sound: (typeof SOUNDS)[number];
  color: string;
  accentFirst: boolean;
  gain: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  enabled: boolean;
}
export interface DroneState {
  enabled: boolean;
  root: number;
  octave: number;
  mode: Mode;
  chord: Chord;
  progression?: HarmonyStep[];
  gain: number;
  filterHz: number;
  spread: number;
}
export interface HarmonyStep {
  startStep: number;
  root: number;
  chord: Chord;
}
export interface SessionState {
  version: 1;
  bpm: number;
  cycleBeats: number;
  subdivision: number;
  clickSound: ClickSoundState;
  layers: RhythmLayer[];
  drone: DroneState;
  notePalette: NotePalette;
  visualMode: 'circle' | 'timeline' | 'polygons';
  masterGain: number;
}
export const newLayer = (beats: number, index: number, enabled = true): RhythmLayer => ({
  id: crypto.randomUUID(),
  beatsPerCycle: beats,
  sound: index % 2 ? 'sine' : 'wood',
  color: LAYER_COLORS[index % LAYER_COLORS.length],
  accentFirst: true,
  gain: 0.65,
  pan: 0,
  muted: false,
  solo: false,
  enabled,
});
const progressionRoots = [2, 9, 7, 0, 5, 2, 4, 7];
const progressionChords: Chord[] = [
  'fifth',
  'triad',
  'minor',
  'major',
  'fifth',
  'root',
  'minor',
  'major',
];
export const commonStepCount = (state: Pick<SessionState, 'layers'>) =>
  lcm(state.layers.filter((layer) => layer.enabled).map((layer) => layer.beatsPerCycle));
export const defaultProgression = (): HarmonyStep[] => [
  { startStep: 0, root: progressionRoots[0], chord: progressionChords[0] },
];
export const progressionFor = (state: SessionState): HarmonyStep[] => {
  return [...(state.drone.progression ?? defaultProgression())].sort(
    (left, right) => left.startStep - right.startStep,
  );
};
export const progressionStepAt = (state: SessionState, position: number): HarmonyStep => {
  const steps = commonStepCount(state);
  const progression = progressionFor(state);
  const phase = ((position % 1) + 1) % 1;
  const currentStep = Math.min(steps - 1, Math.floor(phase * steps));
  return (
    [...progression].reverse().find((step) => step.startStep <= currentStep) ??
    progression.at(-1) ??
    defaultProgression()[0]
  );
};
export const defaultSession = (): SessionState => ({
  version: 1,
  bpm: 90,
  cycleBeats: 4,
  subdivision: 0,
  clickSound: {
    sound: 'soft',
    pitch: 0,
    variation: 18,
  },
  layers: [newLayer(3, 0), newLayer(2, 1), newLayer(5, 2, false), newLayer(7, 3, false)],
  drone: {
    enabled: false,
    root: 2,
    octave: 3,
    mode: 'dorian',
    chord: 'fifth',
    progression: defaultProgression(),
    gain: 0.3,
    filterHz: 1200,
    spread: 0.5,
  },
  notePalette: defaultNotePalette(),
  visualMode: 'circle',
  masterGain: 0.7,
});
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object';
const range = (v: unknown, min: number, max: number, integer = false) =>
  typeof v === 'number' &&
  Number.isFinite(v) &&
  v >= min &&
  v <= max &&
  (!integer || Number.isInteger(v));
export function isSession(v: unknown): v is SessionState {
  if (
    !object(v) ||
    v.version !== 1 ||
    !range(v.bpm, 20, 300) ||
    !range(v.cycleBeats, 1, 16, true) ||
    !range(v.subdivision, 0, 6, true) ||
    !object(v.clickSound) ||
    !CLICK_SOUNDS.includes(v.clickSound.sound as (typeof CLICK_SOUNDS)[number]) ||
    !range(v.clickSound.pitch, -12, 12) ||
    !range(v.clickSound.variation, 0, 50) ||
    !range(v.masterGain, 0, MAX_MASTER_GAIN) ||
    !['circle', 'timeline', 'polygons'].includes(String(v.visualMode))
  )
    return false;
  if (!Array.isArray(v.layers) || v.layers.length !== MAX_LAYERS) return false;
  if (
    !v.layers.every(
      (l) =>
        object(l) &&
        typeof l.id === 'string' &&
        /^[a-zA-Z0-9-]{1,64}$/.test(l.id) &&
        range(l.beatsPerCycle, 1, 16, true) &&
        SOUNDS.includes(l.sound as (typeof SOUNDS)[number]) &&
        typeof l.color === 'string' &&
        /^#[0-9a-f]{6}$/i.test(l.color) &&
        range(l.gain, 0, 1) &&
        range(l.pan, -1, 1) &&
        ['muted', 'solo', 'accentFirst', 'enabled'].every((k) => typeof l[k] === 'boolean'),
    )
  )
    return false;
  if (new Set(v.layers.map((l) => l.id)).size !== v.layers.length) return false;
  const d = v.drone;
  const notePalette = v.notePalette;
  return (
    object(d) &&
    typeof d.enabled === 'boolean' &&
    range(d.root, 0, 11, true) &&
    range(d.octave, 1, 5, true) &&
    MODES.includes(d.mode as Mode) &&
    CHORDS.includes(d.chord as Chord) &&
    (!('progression' in d) ||
      (Array.isArray(d.progression) &&
        d.progression.length <= commonStepCount({ layers: v.layers as RhythmLayer[] }) &&
        d.progression.every(
          (step) =>
            object(step) &&
            range(
              step.startStep,
              0,
              commonStepCount({ layers: v.layers as RhythmLayer[] }) - 1,
              true,
            ) &&
            range(step.root, 0, 11, true) &&
            CHORDS.includes(step.chord as Chord),
        ) &&
        new Set(d.progression.map((step) => step.startStep)).size === d.progression.length)) &&
    range(d.gain, 0, 1) &&
    range(d.filterHz, 100, 8000) &&
    range(d.spread, 0, 1) &&
    object(notePalette) &&
    range(notePalette.referenceOctave, 1, 5, true) &&
    Array.isArray(notePalette.notes) &&
    notePalette.notes.length === 12 &&
    notePalette.notes.every(
      (note) =>
        object(note) &&
        typeof note.color === 'string' &&
        /^#[0-9a-f]{6}$/i.test(note.color) &&
        NOTE_TIMBRES.includes(note.timbre as NoteTimbre),
    )
  );
}
