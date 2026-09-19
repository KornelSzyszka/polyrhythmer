import { describe, expect, it } from 'vitest';

import { defaultSession } from '../../src/domain/session';
import { pointOnPolygon, polygonPoints, renderVisual } from '../../src/visual/views';

describe('polygon visualization', () => {
  it('creates a regular polygon with its first vertex at twelve o clock', () => {
    expect(polygonPoints(4, 100)).toBe('240,140 340,240 240,340 140,240');
  });

  it('moves smoothly along consecutive polygon edges', () => {
    expect(pointOnPolygon(4, 100, 0)).toEqual({ x: 240, y: 140 });
    expect(pointOnPolygon(4, 100, 0.125)).toEqual({ x: 290, y: 190 });
    expect(pointOnPolygon(4, 100, 0.25)).toEqual({ x: 340, y: 240 });
    expect(pointOnPolygon(2, 100, 0.75)).toEqual({ x: 240, y: 240 });
  });

  it('renders one polygon layer and one beat marker per configured beat', () => {
    const state = defaultSession();
    state.visualMode = 'polygons';
    state.layers[0].beatsPerCycle = 5;
    state.layers[1].beatsPerCycle = 2;

    const svg = renderVisual(state);

    expect(svg).toContain('aria-label="Wielokąty rytmu 5:2"');
    expect(svg.match(/class="polygon-layer"/g)).toHaveLength(2);
    expect(svg.match(/data-beat=/g)).toHaveLength(7);
    expect(svg).toContain('id="polygon-head"');
    expect(svg).toContain('class="polygon-low-count"');
  });

  it.each(['circle', 'timeline', 'polygons'] as const)(
    'replaces the pointer with one runner per layer in %s view',
    (visualMode) => {
      const state = defaultSession();
      state.visualMode = visualMode;

      const pointer = renderVisual(state, { visualMotion: 'pointer' });
      const runners = renderVisual(state, { visualMotion: 'runners' });

      expect(pointer).toContain(
        `id="${visualMode === 'timeline' ? 'timeline' : visualMode === 'circle' ? 'circle' : 'polygon'}-head"`,
      );
      expect(pointer.match(/class="visual-runner/g)).toBeNull();
      expect(runners).not.toContain('-head"');
      expect(runners.match(/class="visual-runner/g)).toHaveLength(2);
    },
  );

  it.each(['circle', 'timeline', 'polygons'] as const)(
    'renders the configured support subdivision in %s view',
    (visualMode) => {
      const state = defaultSession();
      state.visualMode = visualMode;

      expect(renderVisual(state).match(/data-subdivision-beat=/g)).toBeNull();

      state.cycleBeats = 4;
      state.subdivision = 3;
      const svg = renderVisual(state);

      expect(svg.match(/data-subdivision-beat=/g)).toHaveLength(12);
      expect(svg.match(/subdivision-marker subdivision-accent/g)).toHaveLength(4);
    },
  );

  it.each(['circle', 'timeline', 'polygons'] as const)(
    'uses the persistent layer color in %s view',
    (visualMode) => {
      const state = defaultSession();
      state.visualMode = visualMode;
      state.layers[0].color = '#ff00aa';

      expect(renderVisual(state)).toContain('#ff00aa');
    },
  );

  it.each(['circle', 'polygons'] as const)(
    'renders a mixed radial harmony field in %s view',
    (visualMode) => {
      const state = defaultSession();
      state.drone.enabled = true;
      state.drone.chord = 'triad';
      state.visualMode = visualMode;

      const svg = renderVisual(state);

      expect(svg).toContain('id="harmony-field"');
      expect(svg).toContain('class="harmony-field radial-harmony"');
      expect(svg.match(/id="harmony-note-/g)).toHaveLength(3);
      expect(svg).toContain('id="harmony-focus"');
    },
  );

  it('renders one aurora strand per sounding chord tone on the timeline', () => {
    const state = defaultSession();
    state.drone.enabled = true;
    state.drone.chord = 'triad';
    state.visualMode = 'timeline';

    const svg = renderVisual(state);

    expect(svg).toContain('class="harmony-field timeline-harmony"');
    expect(svg.match(/class="harmony-aurora"/g)).toHaveLength(3);
  });

  it('numbers only shared timeline steps that contain a beat', () => {
    const state = defaultSession();
    state.visualMode = 'timeline';

    const svg = renderVisual(state);

    expect([...svg.matchAll(/data-step-label="(\d+)"/g)].map((match) => Number(match[1]))).toEqual([
      0, 2, 3, 4,
    ]);
    expect(svg).not.toContain('data-step-label="1"');
    expect(svg).not.toContain('data-step-label="5"');
    expect(svg).toContain('data-step-label="0" data-step-label-side="bottom"');
    expect(svg).toContain('data-step-label="2" data-step-label-side="top"');
    expect(svg).toContain('data-step-label="3" data-step-label-side="bottom"');
    expect(svg).toContain('data-step-label="4" data-step-label-side="top"');
  });
});
