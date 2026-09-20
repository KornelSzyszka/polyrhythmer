import { voicing } from './harmony';
import { colorForMidi, octaveForMidi, pitchClassForMidi } from './note-colors';
import { rhythmEvents } from './rhythm';
import type { SessionState } from './session';
import { progressionStepAt } from './session';

export interface HarmonicNote {
  midi: number;
  pitchClass: number;
  octave: number;
  color: string;
  timbre: OscillatorType;
  angle: number;
}

export interface HarmonicFocus {
  noteIndex: number;
  note: HarmonicNote;
  eventPosition: number;
  elapsedCycles: number;
}

const modulo = (value: number, divisor: number) => ((value % divisor) + divisor) % divisor;

export const circleOfFifthsIndex = (pitchClass: number) => modulo(pitchClass * 7, 12);

export function harmonicNotes(state: SessionState, position = 0): HarmonicNote[] {
  const step = progressionStepAt(state, position);
  const notes = voicing((state.drone.octave + 1) * 12 + step.root, state.drone.mode, step.chord);
  return notes.map((midi) => {
    const pitchClass = pitchClassForMidi(midi);
    return {
      midi,
      pitchClass,
      octave: octaveForMidi(midi),
      color: colorForMidi(midi, state.notePalette),
      timbre: state.notePalette.notes[pitchClass].timbre,
      angle: (circleOfFifthsIndex(pitchClass) / 12) * Math.PI * 2,
    };
  });
}

export function harmonicEventPositions(state: SessionState): number[] {
  const enabled = state.layers.filter((layer) => layer.enabled);
  const solo = enabled.some((layer) => layer.solo);
  const audible = enabled.filter((layer) => !layer.muted && (!solo || layer.solo));
  const positions = rhythmEvents(audible).map((event) => event.position);
  return [...new Set(positions)].sort((left, right) => left - right);
}

export function harmonicFocusAt(state: SessionState, position: number): HarmonicFocus | null {
  const notes = harmonicNotes(state, position);
  const positions = harmonicEventPositions(state);
  if (!notes.length || !positions.length) return null;
  const cycle = Math.floor(position);
  const phase = modulo(position, 1);
  let positionIndex = positions.length - 1;
  while (positionIndex >= 0 && positions[positionIndex] > phase + 1e-9) positionIndex--;
  let eventCycle = cycle;
  if (positionIndex < 0) {
    positionIndex = positions.length - 1;
    eventCycle--;
  }
  const eventPosition = eventCycle + positions[positionIndex];
  const ordinal = eventCycle * positions.length + positionIndex;
  const noteIndex = modulo(ordinal, notes.length);
  return {
    noteIndex,
    note: notes[noteIndex],
    eventPosition,
    elapsedCycles: Math.max(0, position - eventPosition),
  };
}

export function harmonicPulseEnergy(
  state: SessionState,
  position: number,
  cycleDuration: number,
  playing: boolean,
): number {
  if (!playing || !state.drone.enabled) return 0;
  const focus = harmonicFocusAt(state, position);
  if (!focus) return 0;
  const elapsedSeconds = focus.elapsedCycles * cycleDuration;
  return Math.max(0, Math.min(1, Math.exp(-elapsedSeconds / 0.32)));
}
