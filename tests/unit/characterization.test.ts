import { afterEach, describe, expect, it, vi } from 'vitest';

import { eventsInWindow, rhythmEvents } from '../../src/domain/rhythm';
import {
  isSession,
  MAX_LAYERS,
  MAX_MASTER_GAIN,
  type RhythmLayer,
  type SessionState,
} from '../../src/domain/session';
import { Scheduler } from '../../src/audio/scheduler';
import type { ClickVoices } from '../../src/audio/voices';
import { TransportClock } from '../../src/transport/clock';
import { defaultNotePalette } from '../../src/domain/note-colors';

const layer = (
  id: string,
  beatsPerCycle: number,
  overrides: Partial<RhythmLayer> = {},
): RhythmLayer => ({
  id,
  beatsPerCycle,
  sound: 'wood',
  color: '#e4b46a',
  accentFirst: true,
  gain: 0.65,
  pan: 0,
  muted: false,
  solo: false,
  enabled: true,
  ...overrides,
});

const sessionFixture = (overrides: Partial<SessionState> = {}): SessionState => ({
  version: 1,
  bpm: 90,
  cycleBeats: 4,
  subdivision: 0,
  layers: [
    layer('three', 3),
    layer('two', 2, { sound: 'sine' }),
    layer('five', 5, { enabled: false }),
    layer('seven', 7, { enabled: false }),
  ],
  drone: {
    enabled: false,
    root: 2,
    octave: 3,
    mode: 'dorian',
    chord: 'fifth',
    gain: 0.3,
    filterHz: 1200,
    spread: 0.5,
  },
  notePalette: defaultNotePalette(),
  visualMode: 'circle',
  masterGain: 0.7,
  ...overrides,
});

afterEach(() => vi.useRealTimers());

describe('SessionState v1 characterization', () => {
  it('accepts a stable serialized fixture and both supported boundaries', () => {
    const minimum = sessionFixture({
      bpm: 20,
      cycleBeats: 1,
      masterGain: 0,
      layers: [
        layer('min-left', 1, { gain: 0, pan: -1 }),
        layer('min-right', 1, { gain: 0, pan: -1 }),
        layer('min-third', 1, { gain: 0, pan: -1, enabled: false }),
        layer('min-fourth', 1, { gain: 0, pan: -1, enabled: false }),
      ],
      drone: {
        enabled: false,
        root: 0,
        octave: 1,
        mode: 'major',
        chord: 'root',
        gain: 0,
        filterHz: 100,
        spread: 0,
      },
    });
    const maximum = sessionFixture({
      bpm: 300,
      cycleBeats: 16,
      masterGain: MAX_MASTER_GAIN,
      layers: Array.from({ length: MAX_LAYERS }, (_, index) =>
        layer(`max-${index}`, 16, { gain: 1, pan: 1, sound: 'bell', enabled: index < 2 }),
      ),
      drone: {
        enabled: true,
        root: 11,
        octave: 5,
        mode: 'phrygian',
        chord: 'triad',
        gain: 1,
        filterHz: 8000,
        spread: 1,
      },
    });

    for (const fixture of [sessionFixture(), minimum, maximum]) {
      expect(isSession(JSON.parse(JSON.stringify(fixture)))).toBe(true);
    }
  });
});

describe('v1 rhythm event characterization', () => {
  it.each([
    {
      ratio: '3:2',
      left: 3,
      right: 2,
      expected: [
        ['left', 0, 0],
        ['right', 0, 0],
        ['left', 1, 2],
        ['right', 1, 3],
        ['left', 2, 4],
      ],
    },
    {
      ratio: '5:4',
      left: 5,
      right: 4,
      expected: [
        ['left', 0, 0],
        ['right', 0, 0],
        ['left', 1, 4],
        ['right', 1, 5],
        ['left', 2, 8],
        ['right', 2, 10],
        ['left', 3, 12],
        ['right', 3, 15],
        ['left', 4, 16],
      ],
    },
  ])('keeps the exact $ratio event order on the common grid', ({ left, right, expected }) => {
    const events = rhythmEvents([
      { id: 'left', beatsPerCycle: left },
      { id: 'right', beatsPerCycle: right },
    ]);

    expect(events.map(({ layerId, beat, step }) => [layerId, beat, step])).toEqual(expected);
    expect(events.map(({ position }) => position)).toEqual(
      events.map(({ position }) => position).sort((a, b) => a - b),
    );
    expect(new Set(events.map(({ layerId, beat }) => `${layerId}:${beat}`))).toHaveLength(
      left + right,
    );
  });

  it('partitions half-open windows without omissions or boundary duplicates', () => {
    const events = rhythmEvents([
      { id: 'left', beatsPerCycle: 3 },
      { id: 'right', beatsPerCycle: 2 },
    ]);
    const whole = eventsInWindow(events, 0, 2);
    const partitioned = [
      ...eventsInWindow(events, 0, 0.5),
      ...eventsInWindow(events, 0.5, 1),
      ...eventsInWindow(events, 1, 1.5),
      ...eventsInWindow(events, 1.5, 2),
    ];

    expect(partitioned).toEqual(whole);
    expect(eventsInWindow(events, 0, 0.5).some((event) => event.cyclePosition === 0.5)).toBe(false);
    expect(
      eventsInWindow(events, 0.5, 1).filter((event) => event.cyclePosition === 0.5),
    ).toHaveLength(1);
    expect(new Set(whole.map((event) => `${event.layerId}:${event.cyclePosition}`))).toHaveLength(
      whole.length,
    );
  });
});

describe('v1 transport characterization', () => {
  it('preserves phase through pause, resume and BPM changes, while Stop resets it', () => {
    const clock = new TransportClock();
    clock.configure(0, 120, 4);
    clock.start(10);

    expect(clock.position(11)).toBe(0.5);
    clock.pause(11.5);
    expect(clock.position(100)).toBe(0.75);

    clock.start(100);
    expect(clock.position(100.5)).toBe(1);
    clock.configure(100.5, 60, 4);
    expect(clock.position(100.5)).toBe(1);
    expect(clock.position(102.5)).toBe(1.5);

    clock.stop();
    expect(clock.position(999)).toBe(0);
    clock.start(200);
    expect(clock.position(201)).toBe(0.25);
  });
});

describe('v1 scheduler characterization', () => {
  it('drops overdue events after a large audio-clock jump instead of playing a burst', () => {
    vi.useFakeTimers();
    const clock = new TransportClock();
    clock.configure(0, 120, 4);
    clock.start(0);
    const context = { currentTime: 0, state: 'running' } as unknown as AudioContext;
    const played: { layerId: string; beat: number; at: number }[] = [];
    const voices = {
      play: (playedLayer: RhythmLayer, beat: number, at: number) => {
        played.push({ layerId: playedLayer.id, beat, at });
      },
      cancel: vi.fn(),
    } as unknown as ClickVoices;
    const scheduler = new Scheduler(context, clock, voices, () => sessionFixture());

    scheduler.start();
    expect(played).toHaveLength(2);
    played.length = 0;

    Object.assign(context, { currentTime: 20 });
    vi.advanceTimersByTime(25);

    expect(played).toEqual([
      { layerId: 'three', beat: 0, at: 20 },
      { layerId: 'two', beat: 0, at: 20 },
    ]);
    expect(played.every((event) => event.at >= context.currentTime)).toBe(true);

    scheduler.stop();
  });
});
