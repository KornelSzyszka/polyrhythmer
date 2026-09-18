export function gcd(a: number, b: number): number {
  while (b) [a, b] = [b, a % b];
  return a;
}
export function lcm(values: number[]): number {
  return values.reduce((a, b) => (a / gcd(a, b)) * b, 1);
}
export interface RhythmEvent { layerId: string; beat: number; step: number; position: number }
export function rhythmEvents(layers: { id: string; beatsPerCycle: number }[]): RhythmEvent[] {
  const steps = lcm(layers.map(layer => layer.beatsPerCycle));
  return layers.flatMap(layer => Array.from({ length: layer.beatsPerCycle }, (_, beat) => ({
    layerId: layer.id, beat, step: beat * steps / layer.beatsPerCycle,
    position: beat / layer.beatsPerCycle,
  }))).sort((a, b) => a.step - b.step);
}
export function subdivisionEvents(cycleBeats: number, subdivision: number): RhythmEvent[] {
  if (subdivision < 1) return [];
  const count = cycleBeats * subdivision;
  return Array.from({ length: count }, (_, beat) => ({
    layerId: 'reference', beat, step: beat, position: beat / count,
  }));
}
export const cycleDuration = (bpm: number, cycleBeats: number) => 60 * cycleBeats / bpm;

/** Half-open windows prevent duplicates at scheduler boundaries. */
export function eventsInWindow(events: RhythmEvent[], from: number, to: number) {
  const result: (RhythmEvent & { cyclePosition: number })[] = [];
  for (let cycle = Math.floor(from); cycle <= Math.floor(to); cycle++) {
    for (const event of events) {
      const cyclePosition = cycle + event.position;
      if (cyclePosition >= from && cyclePosition < to) result.push({ ...event, cyclePosition });
    }
  }
  return result;
}
