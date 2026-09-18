import { describe, expect, it } from 'vitest';
import { defaultSession } from '../../src/domain/session';
import { BUILT_IN_PALETTES, contrastRatio, createVisualTheme, LAYER_COLORS } from '../../src/theme/palette';
import { renderVisual } from '../../src/visual/views';

describe('theme tokens', () => {
  it('provides three ordinary palettes and a high-contrast variant', () => {
    expect(BUILT_IN_PALETTES.map(palette => palette.id)).toEqual(['forest', 'slate', 'dawn', 'high-contrast']);
    expect(LAYER_COLORS).toHaveLength(12);
    for (const palette of BUILT_IN_PALETTES) {
      expect(contrastRatio(palette.colors.text, palette.colors.background)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(palette.colors.accent, palette.colors.background)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('passes the active palette roles explicitly into every SVG view', () => {
    const theme = createVisualTheme(BUILT_IN_PALETTES[3].colors);
    for (const visualMode of ['circle', 'timeline', 'polygons'] as const) {
      const state = defaultSession();
      state.visualMode = visualMode;
      const svg = renderVisual(state, { visualMotion: 'pointer', theme });
      expect(svg).toContain(theme.pointer);
      if (visualMode !== 'timeline') expect(svg).toContain(theme.halo);
    }
  });
});
