export const MODES = ['chromatic', 'major', 'minor', 'dorian', 'phrygian', 'pentatonic'] as const;
export type Mode = (typeof MODES)[number];
export const CHORDS = ['root', 'minor', 'major', 'fifth', 'octave', 'triad'] as const;
export type Chord = (typeof CHORDS)[number];
export const SCALE_DEFINITIONS: Record<
  Mode,
  { label: string; description: string; chords: Chord[] }
> = {
  chromatic: {
    label: 'Chromatyczna',
    description: 'Wszystkie dźwięki — napięcie i pełna swoboda.',
    chords: [...CHORDS],
  },
  major: {
    label: 'Durowa',
    description: 'Jasna i stabilna; naturalny punkt wyjścia.',
    chords: ['root', 'major', 'minor', 'fifth', 'triad'],
  },
  minor: {
    label: 'Molowa',
    description: 'Ciemniejsza, miękka i introspektywna.',
    chords: ['root', 'major', 'minor', 'fifth', 'triad'],
  },
  dorian: {
    label: 'Dorycka',
    description: 'Molowa z podniesioną sekstą; pulsująca i otwarta.',
    chords: ['root', 'major', 'minor', 'fifth', 'triad'],
  },
  phrygian: {
    label: 'Frygijska',
    description: 'Napięta dzięki obniżonej sekundzie.',
    chords: ['root', 'major', 'minor', 'fifth', 'triad'],
  },
  pentatonic: {
    label: 'Pentatoniczna',
    description: 'Pięć dźwięków; prosta, przestrzenna i odporna na zgrzyty.',
    chords: ['root', 'fifth', 'octave'],
  },
};
export const midiToHz = (note: number) => 440 * 2 ** ((note - 69) / 12);
export function voicing(root: number, mode: Mode, chord: Chord): number[] {
  if (chord === 'root') return [root];
  if (chord === 'octave') return [root, root + 12];
  if (chord === 'fifth') return [root, root + 7, root + 12];
  if (chord === 'minor') return [root, root + 3, root + 7];
  if (chord === 'major') return [root, root + 4, root + 7];
  return [root, root + (mode === 'major' || mode === 'chromatic' ? 4 : 3), root + 7];
}
