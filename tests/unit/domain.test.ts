import { describe, expect, it } from 'vitest';
import { gcd, lcm, rhythmEvents, eventsInWindow, cycleDuration, subdivisionEvents } from '../../src/domain/rhythm';
import { midiToHz, voicing } from '../../src/domain/harmony';
import { COLORS, defaultSession, isSession, MAX_LAYERS, newLayer } from '../../src/domain/session';
import { upgradeSession } from '../../src/persistence/storage';
import { TransportClock } from '../../src/transport/clock';
import { defaultPreferences, isPreferences } from '../../src/persistence/preferences';

describe('rhythm model', () => {
  it.each([
    [3,2,6,[0,2,4],[0,3]], [5,4,20,[0,4,8,12,16],[0,5,10,15]],
    [7,5,35,[0,5,10,15,20,25,30],[0,7,14,21,28]],
  ])('places %i:%i on the common grid', (a,b,steps,left,right) => {
    const events = rhythmEvents([{id:'a',beatsPerCycle:a},{id:'b',beatsPerCycle:b}]);
    expect(lcm([a,b])).toBe(steps);
    expect(events.filter(e=>e.layerId==='a').map(e=>e.step)).toEqual(left);
    expect(events.filter(e=>e.layerId==='b').map(e=>e.step)).toEqual(right);
  });
  it('orders all supported two-layer combinations without losing events', () => {
    for(let a=1;a<=16;a++) for(let b=1;b<=16;b++) {
      const events = rhythmEvents([{id:'a',beatsPerCycle:a},{id:'b',beatsPerCycle:b}]);
      expect(events).toHaveLength(a+b);
      expect(events.map(e=>e.step)).toEqual(events.map(e=>e.step).sort((x,y)=>x-y));
      expect(new Set(events.map(e=>`${e.layerId}:${e.step}`)).size).toBe(a+b);
    }
  });
  it('handles maximal coprime layers with sparse events', () => {
    const events = rhythmEvents([11,13,15,16].map((n,i)=>({id:String(i),beatsPerCycle:n})));
    expect(events).toHaveLength(55); expect(lcm([11,13,15,16])).toBe(34320);
  });
  it('does not duplicate or omit notes across scheduling windows and cycles', () => {
    const events = rhythmEvents([{id:'a',beatsPerCycle:3},{id:'b',beatsPerCycle:2}]);
    const split = [...eventsInWindow(events,0,.5),...eventsInWindow(events,.5,1),...eventsInWindow(events,1,2)];
    expect(split).toEqual(eventsInWindow(events,0,2)); expect(split).toHaveLength(10);
    expect(eventsInWindow(events,4.7,5.1).map(e=>e.cyclePosition)).toEqual([5,5]);
  });
  it('calculates duration and greatest common divisor', () => { expect(gcd(20,15)).toBe(5); expect(cycleDuration(120,4)).toBe(2); });
  it('creates an optional regular reference grid without changing the polyrhythm', () => {
    expect(subdivisionEvents(4, 3).map(event => event.position)).toEqual([0, 1/12, 2/12, 3/12, 4/12, 5/12, 6/12, 7/12, 8/12, 9/12, 10/12, 11/12]);
    expect(subdivisionEvents(4, 0)).toEqual([]);
  });
});
describe('harmony', () => {
  it('uses standard tuning', () => { expect(midiToHz(69)).toBe(440); expect(midiToHz(60)).toBeCloseTo(261.6256); });
  it('voices the selected mode and chord', () => {
    expect(voicing(50,'dorian','triad')).toEqual([50,53,57]);
    expect(voicing(48,'major','triad')).toEqual([48,52,55]);
    expect(voicing(50,'phrygian','fifth')).toEqual([50,57,62]);
  });
});
describe('session validation', () => {
  it('accepts default and serialized states', () => { expect(isSession(defaultSession())).toBe(true); expect(isSession(JSON.parse(JSON.stringify(defaultSession())))).toBe(true); });
  it('accepts polygon visualization and rejects unknown visualization modes', () => {
    expect(isSession({ ...defaultSession(), visualMode: 'polygons' })).toBe(true);
    expect(isSession({ ...defaultSession(), visualMode: 'unknown' })).toBe(false);
  });
  it.each([NaN, Infinity, 0, 301, '90', null])('rejects invalid BPM %s', value => { const s = {...defaultSession(), bpm:value}; expect(isSession(s)).toBe(false); });
  it('rejects unsafe IDs, duplicates, fractions and unknown versions', () => {
    const s = defaultSession(); s.layers[0].id = '<script>'; expect(isSession(s)).toBe(false);
    s.layers[0].id = s.layers[1].id; expect(isSession(s)).toBe(false);
    s.layers[0].id = 'one'; s.layers[0].beatsPerCycle=2.5; expect(isSession(s)).toBe(false);
    expect(isSession({...defaultSession(),version:2})).toBe(false);
    expect(isSession({...defaultSession(),layers:[]})).toBe(false);
  });
  it('accepts twelve layers and rejects the thirteenth', () => {
    const session = defaultSession();
    session.layers = Array.from({ length: MAX_LAYERS }, (_, index) => newLayer(index + 1, index));
    expect(isSession(session)).toBe(true);
    session.layers.push(newLayer(1, MAX_LAYERS));
    expect(isSession(session)).toBe(false);
  });
  it('assigns and validates a persistent color for every layer', () => {
    const session = defaultSession();
    expect(session.layers.map(layer => layer.color)).toEqual(COLORS.slice(0, 2));
    session.layers[0].color = '#12abEF';
    expect(isSession(session)).toBe(true);
    session.layers[0].color = '#bad';
    expect(isSession(session)).toBe(false);
  });
  it('upgrades a legacy v1 session without layer colors', () => {
    const legacy = JSON.parse(JSON.stringify(defaultSession())) as Record<string, unknown>;
    (legacy.layers as Record<string, unknown>[]).forEach(layer => delete layer.color);

    const upgraded = upgradeSession(legacy);

    expect(upgraded).not.toBeNull();
    expect(upgraded?.layers.map(layer => layer.color)).toEqual(COLORS.slice(0, 2));
    expect(isSession(upgraded)).toBe(true);
  });
});
describe('transport', () => {
  it('preserves phase across tempo changes and pause/resume', () => {
    const clock = new TransportClock(); clock.configure(0,120,4); clock.start(10);
    expect(clock.position(11)).toBe(.5);
    clock.configure(11,60,4); expect(clock.position(11)).toBe(.5); expect(clock.position(13)).toBe(1);
    clock.pause(13); expect(clock.position(100)).toBe(1);
    clock.start(100); expect(clock.position(102)).toBe(1.5);
    clock.stop(); expect(clock.position(110)).toBe(0);
  });
  it('supports a future anchor without negative phase', () => {
    const clock = new TransportClock(); clock.start(1); expect(clock.position(0)).toBe(0); expect(clock.timeAt(0)).toBe(1);
  });
});
describe('palette preferences', () => {
  it('accepts defaults and a valid custom palette', () => {
    const preferences = defaultPreferences();
    expect(preferences.visualMotion).toBe('pointer');
    preferences.developerMode = true; preferences.visualMotion = 'runners'; preferences.palettes.push({ id: 'custom-night', name: 'Noc', builtIn: false, colors: { background: '#000000', surface: '#111111', text: '#ffffff', muted: '#999999', border: '#222222', accent: '#ffcc00' } });
    preferences.activePaletteId = 'custom-night';
    expect(isPreferences(preferences)).toBe(true);
  });
  it('rejects an unsafe color and unknown active palette', () => {
    const preferences = defaultPreferences();
    preferences.palettes.push({ id: 'custom-night', name: 'Noc', builtIn: false, colors: { background: '#bad', surface: '#111111', text: '#ffffff', muted: '#999999', border: '#222222', accent: '#ffcc00' } });
    expect(isPreferences(preferences)).toBe(false);
    const valid = defaultPreferences(); valid.activePaletteId = 'missing'; expect(isPreferences(valid)).toBe(false);
    expect(isPreferences({ ...defaultPreferences(), visualMotion: 'unknown' })).toBe(false);
  });
});
