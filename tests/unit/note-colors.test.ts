import { describe, expect, it } from 'vitest';

import {
  colorForMidi,
  defaultNotePalette,
  mixNoteColors,
  perceptualLightness,
} from '../../src/domain/note-colors';
import {
  harmonicFocusAt,
  harmonicNotes,
  harmonicPulseEnergy,
} from '../../src/domain/harmonic-performance';
import { defaultSession, isSession } from '../../src/domain/session';
import { upgradeSession } from '../../src/persistence/storage';

describe('note colors', () => {
  it('keeps the chosen color at reference octave and normalizes other octaves', () => {
    const palette = defaultNotePalette();
    palette.notes[0].color = '#6699cc';

    const c2 = colorForMidi(36, palette);
    const c3 = colorForMidi(48, palette);
    const c4 = colorForMidi(60, palette);

    expect(c3).toBe('#6699cc');
    expect(perceptualLightness(c2)).toBeLessThan(perceptualLightness(c3));
    expect(perceptualLightness(c4)).toBeGreaterThan(perceptualLightness(c3));
  });

  it('mixes chord colors deterministically and independently of their order', () => {
    const colors = ['#ef6f6c', '#72c47b', '#5b9bea'];

    expect(mixNoteColors(colors)).toMatch(/^#[0-9a-f]{6}$/);
    expect(mixNoteColors(colors)).toBe(mixNoteColors([...colors].reverse()));
  });
});

describe('harmonic performance focus', () => {
  it('cycles chord tones on unique audible rhythm positions', () => {
    const state = defaultSession();
    state.drone.enabled = true;
    state.drone.chord = 'triad';

    const notes = harmonicNotes(state);
    expect(notes).toHaveLength(3);
    expect(harmonicFocusAt(state, 0)?.noteIndex).toBe(0);
    expect(harmonicFocusAt(state, 1 / 3)?.noteIndex).toBe(1);
    expect(harmonicFocusAt(state, 1)?.noteIndex).toBe(1);
  });

  it('turns the most recent rhythmic accent into a bounded visual envelope', () => {
    const state = defaultSession();
    state.drone.enabled = true;

    expect(harmonicPulseEnergy(state, 0, 2, true)).toBe(1);
    expect(harmonicPulseEnergy(state, 0.1, 2, true)).toBeGreaterThan(0);
    expect(harmonicPulseEnergy(state, 0.1, 2, true)).toBeLessThan(1);
    expect(harmonicPulseEnergy(state, 0.1, 2, false)).toBe(0);
  });
});

describe('note palette session contract', () => {
  it('validates twelve persisted note assignments', () => {
    const session = defaultSession();
    expect(session.notePalette.notes).toHaveLength(12);
    expect(isSession(session)).toBe(true);

    session.notePalette.notes[0].color = '#bad';
    expect(isSession(session)).toBe(false);
  });

  it('upgrades a legacy v1 session without note assignments', () => {
    const legacy = JSON.parse(JSON.stringify(defaultSession())) as Record<string, unknown>;
    delete legacy.notePalette;

    const upgraded = upgradeSession(legacy);

    expect(upgraded?.notePalette).toEqual(defaultNotePalette());
    expect(isSession(upgraded)).toBe(true);
  });
});
