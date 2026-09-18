import { type SessionState } from '../domain/session';
import { lcm } from '../domain/rhythm';
import { PREFERENCE_LANGUAGES, translateText, type Language } from '../i18n';
import { createVisualTheme, type VisualTheme } from '../theme/palette';

const coordinate = (value: number) => String(Number(value.toFixed(3)));
export function polygonPoints(sides: number, radius: number): string {
  return Array.from({ length: sides }, (_, vertex) => {
    const angle = vertex / sides * Math.PI * 2;
    return `${coordinate(240 + Math.sin(angle) * radius)},${coordinate(240 - Math.cos(angle) * radius)}`;
  }).join(' ');
}

export function pointOnPolygon(sides: number, radius: number, phase: number): { x: number; y: number } {
  const vertices = sides === 1
    ? [{ x: 240, y: 240 - radius }]
    : Array.from({ length: sides }, (_, vertex) => {
      const angle = vertex / sides * Math.PI * 2;
      return { x: 240 + Math.sin(angle) * radius, y: 240 - Math.cos(angle) * radius };
    });
  if (vertices.length === 1) return vertices[0];
  const progress = ((phase % 1) + 1) % 1 * vertices.length;
  const from = vertices[Math.floor(progress)];
  const to = vertices[(Math.floor(progress) + 1) % vertices.length];
  const offset = progress % 1;
  return {
    x: Number((from.x + (to.x - from.x) * offset).toFixed(3)),
    y: Number((from.y + (to.y - from.y) * offset).toFixed(3)),
  };
}

const beatMarkers = (beats: number, radius: number, color: string, layerNumber: number, theme: VisualTheme) =>
  Array.from({ length: beats }, (_, beat) => {
    const angle = beat / beats * Math.PI * 2;
    const x = coordinate(240 + Math.sin(angle) * radius);
    const y = coordinate(240 - Math.cos(angle) * radius);
    return `<g><circle data-beat="${beat / beats}" cx="${x}" cy="${y}" r="${beat === 0 ? 9 : 6}" fill="${color}"/>${beat === 0 ? `<text x="${x}" y="${coordinate(Number(y) + 3.5)}" text-anchor="middle" fill="${theme.beatLabel}" class="beat-number">${layerNumber}</text>` : ''}</g>`;
  }).join('');

const subdivisionMarkers = (cycleBeats: number, subdivision: number, mode: 'circle' | 'timeline' | 'polygons') => {
  if (subdivision < 1) return '';
  const count = cycleBeats * subdivision;
  const markers = Array.from({ length: count }, (_, beat) => {
    const className = `subdivision-marker${beat % subdivision === 0 ? ' subdivision-accent' : ''}`;
    if (mode === 'timeline') {
      const x = coordinate(50 + 384 * beat / count);
      return `<circle class="${className}" data-subdivision-beat="${beat / count}" cx="${x}" cy="380" r="${beat % subdivision === 0 ? 2.8 : 1.6}"/>`;
    }
    const angle = beat / count * Math.PI * 2;
    const radius = 211;
    const x = coordinate(240 + Math.sin(angle) * radius);
    const y = coordinate(240 - Math.cos(angle) * radius);
    return `<circle class="${className}" data-subdivision-beat="${beat / count}" cx="${x}" cy="${y}" r="${beat % subdivision === 0 ? 2.8 : 1.6}"/>`;
  }).join('');
  return `<g class="subdivision-markers" aria-hidden="true">${markers}</g>`;
};

export interface VisualOptions { visualMotion: 'pointer' | 'runners'; theme?: VisualTheme; }
export function renderVisual(state: SessionState, options: VisualOptions = { visualMotion: 'pointer' }): string {
  const theme = options.theme ?? createVisualTheme({ background: '#111512', surface: '#1a1f1a', text: '#eae9df', muted: '#a0a89e', border: '#333a32', accent: '#e4b46a' });
  const ratio = state.layers.map(l => l.beatsPerCycle).join(':');
  const solo = state.layers.some(l => l.solo);
  if (state.visualMode === 'timeline') {
    return `<svg viewBox="0 0 480 480" role="img" aria-label="Oś czasu rytmu ${ratio}">
      <text x="240" y="65" class="svg-overline" text-anchor="middle">JEDEN WSPÓLNY CYKL</text>
      ${Array.from({ length: 17 }, (_, i) => `<line x1="${50 + i * 24}" x2="${50 + i * 24}" y1="110" y2="360" class="grid-line"/>`).join('')}
      ${state.layers.map((l, i) => `<g opacity="${l.muted || (solo && !l.solo) ? .25 : 1}"><text x="26" y="${155 + i * 55}" fill="${l.color}" class="svg-label">${i + 1}</text><line x1="50" x2="434" y1="${150 + i * 55}" y2="${150 + i * 55}" stroke="${l.color}" opacity=".3"/>${Array.from({ length: l.beatsPerCycle }, (_, beat) => `<circle data-beat="${beat / l.beatsPerCycle}" cx="${50 + 384 * beat / l.beatsPerCycle}" cy="${150 + i * 55}" r="${beat === 0 ? 7 : 5}" fill="${l.color}"/>`).join('')}${options.visualMotion === 'runners' ? `<circle class="visual-runner timeline-runner" data-y="${150 + i * 55}" cx="50" cy="${150 + i * 55}" r="5" fill="${l.color}"/>` : ''}</g>`).join('')}
      ${options.visualMotion === 'pointer' ? `<line id="timeline-head" x1="50" x2="50" y1="105" y2="365" stroke="${theme.pointer}" stroke-width="1.5"/>` : ''}
      ${subdivisionMarkers(state.cycleBeats, state.subdivision, 'timeline')}
      <text x="50" y="395" class="svg-label">0</text><text x="434" y="395" class="svg-label" text-anchor="end">1 cykl</text>
      <text x="240" y="445" class="svg-label" text-anchor="middle">${lcm(state.layers.map(l => l.beatsPerCycle))} wspólnych kroków</text></svg>`;
  }
  if (state.visualMode === 'polygons') {
    return `<svg viewBox="0 0 480 480" role="img" aria-label="Wielokąty rytmu ${ratio}">
      <defs><radialGradient id="polygon-halo"><stop stop-color="${theme.halo}" stop-opacity=".07"/><stop offset="1" stop-color="${theme.halo}" stop-opacity="0"/></radialGradient></defs>
      <circle cx="240" cy="240" r="232" fill="url(#polygon-halo)"/>
      ${state.layers.map((layer, index) => {
        const radius = 188 - index * 34;
        const opacity = layer.muted || (solo && !layer.solo) ? .2 : 1;
        const shape = layer.beatsPerCycle >= 3
          ? `<polygon class="polygon-layer" points="${polygonPoints(layer.beatsPerCycle, radius)}" fill="${layer.color}" fill-opacity=".035" stroke="${layer.color}" stroke-opacity=".48" stroke-width="1.5"/>`
          : layer.beatsPerCycle === 2
            ? `<line class="polygon-layer" x1="240" y1="${240 - radius}" x2="240" y2="${240 + radius}" stroke="${layer.color}" stroke-opacity=".48" stroke-width="1.5"/><circle class="polygon-low-count" cx="240" cy="240" r="${radius}" fill="none" stroke="${layer.color}" stroke-opacity=".14" stroke-dasharray="2 9"/>`
            : `<circle class="polygon-layer polygon-low-count" cx="240" cy="240" r="${radius}" fill="none" stroke="${layer.color}" stroke-opacity=".3" stroke-dasharray="2 9"/>`;
        const runner = options.visualMotion === 'runners' ? `<circle class="visual-runner polygon-runner" data-sides="${layer.beatsPerCycle}" data-radius="${radius}" cx="240" cy="${240 - radius}" r="5" fill="${layer.color}"/>` : '';
        return `<g opacity="${opacity}">${shape}${beatMarkers(layer.beatsPerCycle, radius, layer.color, index + 1, theme)}${runner}</g>`;
      }).join('')}
      ${subdivisionMarkers(state.cycleBeats, state.subdivision, 'polygons')}
      ${options.visualMotion === 'pointer' ? `<g id="polygon-head"><line x1="240" y1="163" x2="240" y2="32" stroke="${theme.pointer}" stroke-opacity=".5"/><path d="M235 39 L240 29 L245 39" fill="none" stroke="${theme.pointer}"/></g>` : ''}
      <circle cx="240" cy="240" r="3" fill="${theme.pointer}" opacity=".7"/>
      <text x="240" y="230" text-anchor="middle" class="svg-ratio ${state.layers.length > 2 ? 'small' : ''}">${ratio}</text>
      <text x="240" y="256" text-anchor="middle" class="svg-overline">WIELOKĄTNY PULS</text>
      <text id="cycle-counter" x="240" y="282" text-anchor="middle" class="svg-label">CYKL 01</text>
    </svg>`;
  }
  return `<svg viewBox="0 0 480 480" role="img" aria-label="Rytm ${ratio}. Pierwsze uderzenie na godzinie dwunastej.">
    <defs><radialGradient id="halo"><stop stop-color="${theme.halo}" stop-opacity=".055"/><stop offset="1" stop-color="${theme.halo}" stop-opacity="0"/></radialGradient></defs>
    <circle cx="240" cy="240" r="232" fill="url(#halo)"/>
    ${Array.from({ length: 60 }, (_, i) => { const a = i * Math.PI / 30; return `<line x1="${240 + Math.sin(a) * 216}" y1="${240 - Math.cos(a) * 216}" x2="${240 + Math.sin(a) * (i % 5 === 0 ? 223 : 219)}" y2="${240 - Math.cos(a) * (i % 5 === 0 ? 223 : 219)}" stroke="${i % 5 === 0 ? theme.gridStrong : theme.grid}"/>`; }).join('')}
    ${state.layers.map((l, i) => { const r = 185 - i * 32; return `<g opacity="${l.muted || (solo && !l.solo) ? .2 : 1}"><circle cx="240" cy="240" r="${r}" fill="none" stroke="${l.color}" stroke-opacity=".27" stroke-width="1"/>
      ${beatMarkers(l.beatsPerCycle, r, l.color, i + 1, theme)}${options.visualMotion === 'runners' ? `<circle class="visual-runner circle-runner" data-radius="${r}" cx="240" cy="${240 - r}" r="5" fill="${l.color}"/>` : ''}</g>`; }).join('')}
    ${subdivisionMarkers(state.cycleBeats, state.subdivision, 'circle')}
    ${options.visualMotion === 'pointer' ? `<g id="circle-head"><line x1="240" y1="172" x2="240" y2="30" stroke="${theme.pointer}" stroke-opacity=".45"/><circle cx="240" cy="30" r="3" fill="${theme.pointer}"/></g>` : ''}
    <text x="240" y="230" text-anchor="middle" class="svg-ratio ${state.layers.length > 2 ? 'small' : ''}">${ratio}</text>
    <text x="240" y="256" text-anchor="middle" class="svg-overline">WSPÓLNY PULS</text>
    <text id="cycle-counter" x="240" y="282" text-anchor="middle" class="svg-label">CYKL 01</text>
  </svg>`;
}
export function animateVisual(container: HTMLElement, position: number, playing: boolean, duration: number) {
  const phase = position % 1;
  container.querySelector('#circle-head, #polygon-head')?.setAttribute('transform', `rotate(${phase * 360} 240 240)`);
  const head = container.querySelector('#timeline-head');
  head?.setAttribute('x1', String(50 + phase * 384)); head?.setAttribute('x2', String(50 + phase * 384));
  container.querySelectorAll<SVGCircleElement>('.timeline-runner').forEach(dot => dot.setAttribute('cx', String(50 + phase * 384)));
  container.querySelectorAll<SVGCircleElement>('.circle-runner').forEach(dot => {
    const radius = Number(dot.dataset.radius), angle = phase * Math.PI * 2;
    dot.setAttribute('cx', coordinate(240 + Math.sin(angle) * radius));
    dot.setAttribute('cy', coordinate(240 - Math.cos(angle) * radius));
  });
  container.querySelectorAll<SVGCircleElement>('.polygon-runner').forEach(dot => {
    const point = pointOnPolygon(Number(dot.dataset.sides), Number(dot.dataset.radius), phase);
    dot.setAttribute('cx', String(point.x)); dot.setAttribute('cy', String(point.y));
  });
  const count = container.querySelector('#cycle-counter');
  if (count) {
    const language = PREFERENCE_LANGUAGES.includes(document.documentElement.lang as Language) ? document.documentElement.lang as Language : 'en';
    count.textContent = translateText(`CYKL ${String(Math.floor(position) + 1).padStart(2, '0')}`, language);
  }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  container.querySelectorAll<SVGCircleElement>('[data-beat]').forEach(dot => {
    const distance = (phase - Number(dot.dataset.beat) + 1) % 1;
    dot.classList.toggle('pulse', playing && !reduced && distance * duration < .12);
  });
}
