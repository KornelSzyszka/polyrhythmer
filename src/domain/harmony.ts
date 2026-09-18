export const MODES = ['chromatic', 'major', 'minor', 'dorian', 'phrygian'] as const;
export type Mode = (typeof MODES)[number];
export const midiToHz = (note: number) => 440 * 2 ** ((note - 69) / 12);
export function voicing(
  root: number,
  mode: Mode,
  chord: 'root' | 'fifth' | 'octave' | 'triad',
): number[] {
  if (chord === 'root') return [root];
  if (chord === 'octave') return [root, root + 12];
  if (chord === 'fifth') return [root, root + 7, root + 12];
  return [root, root + (mode === 'major' || mode === 'chromatic' ? 4 : 3), root + 7];
}
