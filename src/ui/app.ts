import { AudioEngine } from '../audio/engine';
import { MAX_LAYERS, newLayer, SOUNDS, type RhythmLayer, type SessionState } from '../domain/session';
import { lcm, rhythmEvents } from '../domain/rhythm';
import { loadSession, saveSession } from '../persistence/storage';
import { availablePalettes, defaultPreferences, isBuiltInPalette, loadPreferences, paletteById, savePreferences, type Palette, type PaletteColors, type PreferencesState } from '../persistence/preferences';
import { renderVisual, animateVisual } from '../visual/views';

const notes = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const soundNames = { wood: 'Drewno', sine: 'Miękki', bell: 'Dzwonek' };
const modeNames = { chromatic: 'Chromatyczny', major: 'Durowy', minor: 'Molowy', dorian: 'Dorycki', phrygian: 'Frygijski' };
const subdivisionNames = { 0: 'Wyłączona', 1: 'Ćwierćnuty', 2: 'Ósemki', 3: 'Triola ósemkowa', 4: 'Szesnastki', 5: 'Kwintola', 6: 'Sekstola' };
const paletteColorKeys: (keyof PaletteColors)[] = ['background', 'surface', 'text', 'muted', 'border', 'accent'];
const paletteColorNames: Record<keyof PaletteColors, string> = { background: 'Tło', surface: 'Powierzchnia', text: 'Tekst', muted: 'Wyciszenie', border: 'Obramowanie', accent: 'Akcent' };
const selected = (a: unknown, b: unknown) => a === b ? 'selected' : '';
const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]!);
const range = (id: string, label: string, value: number, min = 0, max = 1, step = .01, unit = '%') => `<label class="range-label" for="${id}">${label}<output id="${id}-value">${unit === '%' ? Math.round(value * 100) : value}${unit}</output></label><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}" aria-valuetext="${unit === '%' ? Math.round(value * 100) : value}${unit}">`;
const layersPerTab = 4;
const layerColor = (layer: RhythmLayer) => layer.color;
export class App {
  state: SessionState;
  engine: AudioEngine;
  preferences: PreferencesState;
  private root: HTMLElement;
  private taps: number[] = [];
  private busy = false;
  private status = 'Gotowy do gry';
  private editingPaletteId: string | null = null;
  private activeLayerTab = 0;
  constructor(root: HTMLElement) {
    const loaded = loadSession(), loadedPreferences = loadPreferences(); this.state = loaded.state; this.preferences = loadedPreferences.preferences; this.root = root;
    this.applyPalette();
    this.engine = new AudioEngine(this.state);
    this.engine.onInterrupted = () => { this.status = 'Audio wstrzymane przez przeglądarkę — naciśnij Start'; this.updateTransport(); };
    this.render();
    if (loaded.warning || loadedPreferences.warning) this.message([loaded.warning, loadedPreferences.warning].filter(Boolean).join(' '));
    root.addEventListener('click', event => void this.click(event));
    root.addEventListener('change', event => this.change(event));
    root.addEventListener('input', event => this.input(event));
    document.addEventListener('keydown', event => {
      if (event.code === 'Space' && event.target === document.body) { event.preventDefault(); void this.toggle(); }
    });
    const frame = () => {
      animateVisual(this.root.querySelector('#visual')!, this.engine.position, this.engine.clock.running, this.engine.clock.duration);
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }
  private render() {
    const s = this.state;
    const palettes = availablePalettes(this.preferences);
    const paletteRows = palettes.map(palette => `<div class="palette-row"><button type="button" class="palette-select" data-palette-action="select" data-palette-id="${palette.id}" aria-pressed="${this.preferences.activePaletteId === palette.id}" aria-label="Wybierz paletę ${escapeHtml(palette.name)}"><span class="palette-name">${escapeHtml(palette.name)}</span><span class="palette-swatches" aria-label="Kolory palety">${paletteColorKeys.map(key => `<i title="${paletteColorNames[key]}" style="--swatch:${palette.colors[key]}"></i>`).join('')}</span></button>${palette.builtIn ? '<small>Wbudowana</small>' : `<button type="button" data-palette-action="edit" data-palette-id="${palette.id}">Edytuj</button><button type="button" data-palette-action="delete" data-palette-id="${palette.id}">Usuń</button>`}</div>`).join('');
    const active = document.activeElement?.id;
    const steps = lcm(s.layers.map(l => l.beatsPerCycle));
    const tabCount = Math.ceil(s.layers.length / layersPerTab);
    this.activeLayerTab = Math.min(this.activeLayerTab, tabCount - 1);
    const visibleStart = this.activeLayerTab * layersPerTab;
    const visibleLayers = s.layers.slice(visibleStart, visibleStart + layersPerTab);
    this.root.innerHTML = `<div class="shell">
      <header class="topbar"><a class="brand" href="./" aria-label="Polyrhythmer — strona główna"><span class="brand-mark">◉</span> polyrhythmer<span class="version">01</span></a><div class="top-actions"><span id="offline-status" class="offline-badge">● <span>Sesja lokalna</span></span><button id="install" class="quiet" hidden>Zainstaluj ↗</button><button id="update" class="quiet" hidden>Nowa wersja ↻</button><button id="developer-mode" class="quiet" aria-label="Przełącz tryb deweloperski" aria-pressed="${this.preferences.developerMode}">Dev: ${this.preferences.developerMode ? 'wł.' : 'wył.'}</button><button id="developer-settings" class="quiet" aria-label="Palety wyglądu">Palety</button><button id="help" class="help" aria-label="Jak korzystać">?</button></div></header>
      <main>
        <section class="intro"><div><p class="eyebrow">MAŁE LABORATORIUM RYTMU</p><h1>Znajdź wspólny puls<span>.</span></h1><p class="subtitle">Różne rytmy. Jeden moment spotkania.</p></div><span class="session-number">SESJA / 001<br><span>Stwórz przestrzeń do ćwiczeń</span></span></section>
        <div class="workspace">
          <section class="instrument panel" aria-label="Wizualizacja i transport"><div class="panel-top"><span class="section-tag"><i></i> POLIRYTM</span><div class="segmented" aria-label="Widok"><button id="circle" aria-pressed="${s.visualMode === 'circle'}">Okrąg</button><button id="timeline" aria-pressed="${s.visualMode === 'timeline'}">Oś czasu</button><button id="polygons" aria-pressed="${s.visualMode === 'polygons'}">Wielokąty</button></div></div>
            <div id="visual">${renderVisual(s, { visualMotion: this.preferences.visualMotion })}</div>
            <div class="visual-motion"><span>RUCH</span><div class="segmented" aria-label="Ruch wizualizacji"><button id="motion-pointer" aria-pressed="${this.preferences.visualMotion === 'pointer'}">Wskazówka</button><button id="motion-runners" aria-pressed="${this.preferences.visualMotion === 'runners'}">Kropki</button></div></div>
            <div class="visual-legend">${s.layers.map((l, i) => `<span style="--layer:${layerColor(l)}"><i></i>${i + 1} / ${l.beatsPerCycle} uderz.</span>`).join('')}<span class="cycle-length">${(60 * s.cycleBeats / s.bpm).toFixed(2)} s / cykl</span></div>
            <div class="transport"><div class="tempo"><label for="bpm">TEMPO</label><div><button id="slower" aria-label="Zmniejsz tempo">−</button><input id="bpm" type="number" min="20" max="300" step="1" value="${s.bpm}" aria-describedby="tempo-error"><span>BPM</span><button id="faster" aria-label="Zwiększ tempo">+</button></div><span id="tempo-error" class="field-error"></span></div><div class="play-controls"><button id="play" class="play">▶ <span>Start</span></button><button id="stop" class="stop" aria-label="Stop">■</button></div><button id="tap" class="tap">Tap tempo<span>wybij rytm</span></button></div>
            <div class="transport-bottom"><span id="transport-status" role="status">${this.status}</span><span>SPACJA <span class="muted">start / pauza</span></span></div>
          </section>
          <aside class="rhythm-panel panel"><div class="panel-heading"><div><p class="eyebrow">NIEZALEŻNE GŁOSY</p><h2>Warstwy rytmu <span>${s.layers.length}/${MAX_LAYERS}</span></h2></div><button id="add-layer" class="add" aria-label="Dodaj warstwę" ${s.layers.length >= MAX_LAYERS ? 'disabled' : ''}>+</button></div>
            <div class="presets"><span>ODKRYWAJ</span>${['3:2','4:3','5:4','7:4','7:5'].map(p => `<button data-preset="${p}" aria-pressed="${s.layers.map(l => l.beatsPerCycle).join(':') === p}">${p}</button>`).join('')}</div>
            <div class="layer-tabs" role="tablist" aria-label="Grupy warstw">${Array.from({length: tabCount}, (_, tab) => { const start = tab * layersPerTab; const end = Math.min(start + layersPerTab, s.layers.length); return `<button type="button" role="tab" class="layer-tab" data-layer-tab="${tab}" aria-selected="${tab === this.activeLayerTab}" aria-controls="layer-group-${tab}">${start + 1}–${end}</button>`; }).join('')}</div>
            <div class="layers" id="layer-group-${this.activeLayerTab}" role="tabpanel" aria-label="Warstwy ${visibleStart + 1}–${visibleStart + visibleLayers.length}">${visibleLayers.map((l, offset) => { const i = visibleStart + offset; return `<section class="layer ${l.muted ? 'is-muted' : ''}" style="--layer:${layerColor(l)}"><div class="layer-heading"><span class="layer-number">${String(i + 1).padStart(2, '0')}</span><h3>Warstwa ${i + 1}</h3><button data-action="mute" data-index="${i}" aria-label="Wycisz warstwę ${i + 1}" aria-pressed="${l.muted}" class="tiny">M</button><button data-action="solo" data-index="${i}" aria-label="Solo warstwy ${i + 1}" aria-pressed="${l.solo}" class="tiny">S</button><button data-action="remove" data-index="${i}" aria-label="Usuń warstwę ${i + 1}" class="remove" ${s.layers.length <= 2 ? 'disabled' : ''}>×</button></div>
              <div class="layer-toolbar"><label for="color-${i}">Kolor <input id="color-${i}" data-index="${i}" type="color" value="${l.color}" aria-label="Kolor warstwy ${i + 1}"></label><div class="layer-order"><span>Kolejność</span><button data-action="move-up" data-index="${i}" aria-label="Przesuń warstwę ${i + 1} wyżej" ${i === 0 ? 'disabled' : ''}>↑</button><button data-action="move-down" data-index="${i}" aria-label="Przesuń warstwę ${i + 1} niżej" ${i === s.layers.length - 1 ? 'disabled' : ''}>↓</button></div></div>
              <div class="layer-main"><div class="beat-stepper"><button data-action="less" data-index="${i}" aria-label="Mniej uderzeń warstwy ${i + 1}" ${l.beatsPerCycle === 1 ? 'disabled' : ''}>−</button><label><input id="beats-${i}" data-index="${i}" type="number" min="1" max="16" value="${l.beatsPerCycle}" aria-label="Uderzenia warstwy ${i + 1}"><span>uderz. / cykl</span></label><button data-action="more" data-index="${i}" aria-label="Więcej uderzeń warstwy ${i + 1}" ${l.beatsPerCycle === 16 ? 'disabled' : ''}>+</button></div><label class="sound-label" for="sound-${i}">BARWA<select id="sound-${i}" data-index="${i}">${SOUNDS.map(sound => `<option value="${sound}" ${selected(sound,l.sound)}>${soundNames[sound]}</option>`).join('')}</select></label></div>
              <div class="beat-dots" aria-hidden="true">${Array.from({length:l.beatsPerCycle},(_,j)=>`<i class="${j === 0 && l.accentFirst ? 'accent' : ''}"></i>`).join('')}</div>
              <div class="layer-gain">${range(`gain-${i}`, 'Głośność', l.gain)}</div><details class="layer-details"><summary>Akcent i panorama</summary><label class="check"><input id="accent-${i}" data-index="${i}" type="checkbox" ${l.accentFirst ? 'checked' : ''}>Akcent pierwszego uderzenia</label>${range(`pan-${i}`, 'Panorama L ↔ R', l.pan, -1, 1, .01, '')}</details>
            </section>`; }).join('')}</div>
            <div class="cycle-setting"><label for="cycle-beats">Długość wspólnego cyklu<small>Jedna ćwierćnuta = jeden puls BPM</small></label><select id="cycle-beats">${Array.from({length:16},(_,i)=>`<option value="${i+1}" ${selected(s.cycleBeats,i+1)}>${i+1} ♩</option>`).join('')}</select></div>
            <div class="cycle-setting"><label for="subdivision">Podział podpórki<small>Regularny klik pomaga utrzymać wspólny puls</small></label><select id="subdivision">${Object.entries(subdivisionNames).map(([v,n])=>`<option value="${v}" ${selected(s.subdivision,Number(v))}>${n}</option>`).join('')}</select></div>
          </aside>
        </div>
        <section class="drone-panel panel" aria-label="Dron tonalny"><div class="drone-intro"><p class="eyebrow">TŁO DLA TWOJEGO RYTMU</p><div class="drone-title"><h2>Dron tonalny</h2><button id="drone-enabled" class="switch" role="switch" aria-checked="${s.drone.enabled}" aria-label="Dron tonalny"><span></span></button></div><p>Stały ton. Więcej przestrzeni.</p><div class="drone-wave" aria-hidden="true">∿∿∿∿∿∿</div></div>
          <div class="drone-controls"><div class="drone-selects"><label for="root">TON PODSTAWOWY<select id="root">${notes.map((n,i)=>`<option value="${i}" ${selected(s.drone.root,i)}>${n}</option>`).join('')}</select></label><label for="octave">OKTAWA<select id="octave">${[1,2,3,4,5].map(n=>`<option ${selected(s.drone.octave,n)}>${n}</option>`).join('')}</select></label><label for="mode">TRYB<select id="mode">${Object.entries(modeNames).map(([v,n])=>`<option value="${v}" ${selected(s.drone.mode,v)}>${n}</option>`).join('')}</select></label><label for="chord">HARMONIA<select id="chord">${Object.entries({root:'Pryma',fifth:'Pryma + kwinta + oktawa',octave:'Pryma + oktawa',triad:'Trójdźwięk'}).map(([v,n])=>`<option value="${v}" ${selected(s.drone.chord,v)}>${n}</option>`).join('')}</select></label></div>
          <div class="drone-sliders"><div>${range('drone-gain','Poziom drona',s.drone.gain)}</div><div>${range('filter','Jasność',s.drone.filterHz,100,8000,50,' Hz')}</div><div>${range('spread','Szerokość stereo',s.drone.spread)}</div></div></div></section>
        <details class="event-details"><summary>Jak spotykają się rytmy? <span>${steps} wspólnych kroków ↗</span></summary><p>Każda warstwa dzieli ten sam cykl na równe odcinki. Krok 0 to wspólny początek.</p><table><caption>Uderzenia na siatce ${steps} kroków</caption><thead><tr><th>Warstwa</th><th>Kroki uderzeń</th></tr></thead><tbody>${s.layers.map((l,i)=>`<tr><th>${i+1} · ${l.beatsPerCycle} uderz.</th><td>${rhythmEvents([ ...s.layers ]).filter(e=>e.layerId===l.id).map(e=>e.step).join(', ')}</td></tr>`).join('')}</tbody></table></details>
        <p id="message" class="message" role="alert"></p>
      </main><footer><span>Stworzone do uważnego słuchania.</span><div class="master">${range('master','Głośność główna',s.masterGain)}</div><span>BEZ KONT. BEZ POŚPIECHU.</span></footer>
      <dialog id="help-dialog"><button id="close-help" class="close-dialog" aria-label="Zamknij pomoc">×</button><p class="eyebrow">KRÓTKI PRZEWODNIK</p><h2>Wiele rytmów, jeden cykl.</h2><p>Wybierz proporcję, np. 3:2, i naciśnij Start. Pierwsza warstwa zagra trzy, a druga dwa równo rozmieszczone uderzenia w tym samym czasie.</p><p>BPM określa tempo ćwierćnut. Długość cyklu mówi, ile ćwierćnut mieści się w pełnym obrocie. Przy 90 BPM i 4 ćwierćnutach cykl trwa 2,67 s.</p><p><strong>M</strong> wycisza warstwę. <strong>S</strong> pozwala słuchać tylko wybranych warstw. Pauza zachowuje pozycję, Stop wraca do zera. Spacja działa, gdy fokus nie jest w kontrolce.</p><p>Włącz dron, by ćwiczyć na tle stałego tonu. Tryb zmienia tercję trójdźwięku; pryma i kwinta pozostają te same.</p><p>Ustawienia zapisują się na tym urządzeniu. Gdy zobaczysz „Gotowy offline”, możesz wrócić bez internetu. Do instalacji na iOS wybierz Udostępnij → Do ekranu początkowego. System może zatrzymać dźwięk w tle lub po zablokowaniu ekranu.</p></dialog>
      <dialog id="developer-dialog"><button id="close-developer" class="close-dialog" aria-label="Zamknij ustawienia palet">×</button><p class="eyebrow">USTAWIENIA PALET</p><h2>Palety wyglądu</h2><p class="developer-copy">Wybierz paletę, aby jej użyć i załadować kolory do edytora. Palety zapisują się lokalnie.</p><div class="palette-list">${paletteRows}</div><hr><h3 id="palette-form-title">Nowa paleta</h3><label class="developer-field" for="palette-name">Nazwa<input id="palette-name" maxlength="32" value=""></label><div class="palette-colors">${paletteColorKeys.map(key => `<label>${paletteColorNames[key]}<input id="palette-${key}" type="color" value="${key === 'accent' ? '#e4b46a' : key === 'text' ? '#eae9df' : key === 'muted' ? '#a0a89e' : key === 'border' ? '#333a32' : key === 'surface' ? '#1a1f1a' : '#111512'}"></label>`).join('')}</div><div class="developer-actions"><button id="save-palette" type="button">Zapisz paletę</button><button id="cancel-palette-edit" type="button" class="quiet" hidden>Anuluj edycję</button></div></dialog>
    </div>`;
    this.updateTransport();
    if (active) document.getElementById(active)?.focus({ preventScroll: true });
    document.dispatchEvent(new Event('app-render'));
  }
  private commit(render = true) {
    const next = structuredClone(this.state);
    this.engine.update(next);
    if (render) this.render();
    if (!saveSession(next)) this.message('Zapis lokalny jest niedostępny. Ustawienia działają do zamknięcia strony.');
  }
  private message(text: string) { this.root.querySelector('#message')!.textContent = text; }
  private applyPalette() {
    const palette = paletteById(this.preferences, this.preferences.activePaletteId) ?? paletteById(defaultPreferences(), 'forest')!;
    document.documentElement.dataset.palette = palette.id;
    (Object.entries(palette.colors) as [keyof PaletteColors, string][]).forEach(([key, value]) => document.documentElement.style.setProperty(`--${key}`, value));
  }
  private saveAppearancePreferences() {
    this.applyPalette();
    if (!savePreferences(this.preferences)) this.message('Zapis ustawień wyglądu jest niedostępny. Zmiana działa do zamknięcia strony.');
  }
  private paletteFormValues(): { name: string; colors: PaletteColors } | null {
    const name = (this.root.querySelector('#palette-name') as HTMLInputElement).value.trim();
    if (!name) { this.message('Nadaj palecie nazwę.'); return null; }
    const colors = Object.fromEntries(paletteColorKeys.map(key => [key, (this.root.querySelector(`#palette-${key}`) as HTMLInputElement).value])) as unknown as PaletteColors;
    return { name, colors };
  }
  private openDeveloperSettings() { (this.root.querySelector('#developer-dialog') as HTMLDialogElement).showModal(); }
  private refreshDeveloperSettings() { this.render(); this.openDeveloperSettings(); }
  private selectPalette(palette: Palette) {
    this.preferences.activePaletteId = palette.id;
    this.saveAppearancePreferences();
    this.render();
    this.openDeveloperSettings();
    this.loadPaletteIntoEditor(palette);
  }
  private loadPaletteIntoEditor(palette: Palette) {
    this.editingPaletteId = palette.builtIn ? null : palette.id;
    (this.root.querySelector('#palette-form-title')!).textContent = palette.builtIn ? `Kolory: ${palette.name}` : `Edytuj: ${palette.name}`;
    (this.root.querySelector('#palette-name') as HTMLInputElement).value = palette.name;
    paletteColorKeys.forEach(key => { (this.root.querySelector(`#palette-${key}`) as HTMLInputElement).value = palette.colors[key]; });
    (this.root.querySelector('#cancel-palette-edit') as HTMLButtonElement).hidden = palette.builtIn;
  }
  private editPalette(palette: Palette) {
    this.loadPaletteIntoEditor(palette);
  }
  private savePalette() {
    const values = this.paletteFormValues(); if (!values) return;
    const duplicate = availablePalettes(this.preferences).find(palette => palette.name.trim().toLocaleLowerCase() === values.name.toLocaleLowerCase() && palette.id !== this.editingPaletteId);
    if (duplicate) {
      if (!window.confirm(`Paleta „${duplicate.name}” już istnieje. Czy chcesz ją nadpisać?`)) return;
      if (duplicate.builtIn) { this.message('Nie można nadpisać palety wbudowanej. Wybierz inną nazwę.'); return; }
      this.preferences.palettes = this.preferences.palettes.filter(palette => palette.id !== this.editingPaletteId).map(palette => palette.id === duplicate.id ? { ...palette, ...values } : palette);
      this.preferences.activePaletteId = duplicate.id;
    } else if (this.editingPaletteId) {
      this.preferences.palettes = this.preferences.palettes.map(palette => palette.id === this.editingPaletteId ? { ...palette, ...values } : palette);
      this.preferences.activePaletteId = this.editingPaletteId;
    } else {
      const id = `custom-${crypto.randomUUID()}`; this.preferences.palettes.push({ id, ...values, builtIn: false }); this.preferences.activePaletteId = id;
    }
    this.editingPaletteId = null; this.saveAppearancePreferences(); this.refreshDeveloperSettings();
  }
  private deletePalette(id: string) {
    if (isBuiltInPalette(id)) return;
    this.preferences.palettes = this.preferences.palettes.filter(palette => palette.id !== id);
    if (this.preferences.activePaletteId === id) this.preferences.activePaletteId = 'forest';
    this.editingPaletteId = null; this.saveAppearancePreferences(); this.refreshDeveloperSettings();
  }
  private updateTransport() {
    const playing = this.engine.clock.running;
    this.root.querySelector('#play')!.innerHTML = `${playing ? 'Ⅱ' : '▶'} <span>${playing ? 'Pauza' : 'Start'}</span>`;
    this.root.querySelector('#play')!.setAttribute('aria-label', playing ? 'Pauza' : 'Start');
    (this.root.querySelector('#play') as HTMLButtonElement).disabled = this.busy;
    this.root.querySelector('#transport-status')!.textContent = this.status;
    this.root.querySelector('.instrument')!.classList.toggle('playing', playing);
  }
  private async toggle() {
    if (this.busy) return;
    if (this.engine.clock.running) { this.engine.pause(); this.status = 'Pauza — Twój rytm czeka'; this.updateTransport(); return; }
    this.busy = true; this.updateTransport();
    try { await this.engine.play(); this.status = this.engine.clock.running ? 'Odtwarzanie · zsynchronizowane' : 'Zatrzymano'; this.message(''); }
    catch (error) { this.status = 'Nie udało się uruchomić audio'; this.message(error instanceof Error ? error.message : 'Naciśnij Start, aby ponowić.'); }
    finally { this.busy = false; this.updateTransport(); }
  }
  private async click(event: Event) {
    const button = (event.target as HTMLElement).closest('button'); if (!button) return;
    if (button.dataset.paletteAction) {
      const palette = paletteById(this.preferences, button.dataset.paletteId!);
      if (button.dataset.paletteAction === 'select' && palette) this.selectPalette(palette);
      if (button.dataset.paletteAction === 'edit' && palette && !palette.builtIn) this.editPalette(palette);
      if (button.dataset.paletteAction === 'delete') this.deletePalette(button.dataset.paletteId!);
      return;
    }
    if (button.dataset.preset) {
      this.state.layers = button.dataset.preset.split(':').map((v,i)=>newLayer(Number(v),i)); this.activeLayerTab = 0; this.commit(); return;
    }
    if (button.dataset.layerTab) {
      this.activeLayerTab = Number(button.dataset.layerTab); this.render(); return;
    }
    if (button.dataset.action) {
      const index = Number(button.dataset.index), layer = this.state.layers[index];
      switch (button.dataset.action) {
        case 'mute': layer.muted = !layer.muted; break;
        case 'solo': layer.solo = !layer.solo; break;
        case 'remove': if (this.state.layers.length > 2) this.state.layers.splice(index,1); break;
        case 'move-up': if (index > 0) { [this.state.layers[index - 1], this.state.layers[index]] = [layer, this.state.layers[index - 1]]; this.activeLayerTab = Math.floor((index - 1) / layersPerTab); } break;
        case 'move-down': if (index < this.state.layers.length - 1) { [this.state.layers[index], this.state.layers[index + 1]] = [this.state.layers[index + 1], layer]; this.activeLayerTab = Math.floor((index + 1) / layersPerTab); } break;
        case 'less': layer.beatsPerCycle = Math.max(1,layer.beatsPerCycle - 1); break;
        case 'more': layer.beatsPerCycle = Math.min(16,layer.beatsPerCycle + 1); break;
      }
      this.commit(); return;
    }
    switch(button.id) {
      case 'play': await this.toggle(); break;
      case 'stop': this.engine.stop(); this.status = 'Zatrzymano · początek cyklu'; this.updateTransport(); break;
      case 'slower': this.state.bpm = Math.max(20,this.state.bpm-1); this.commit(); break;
      case 'faster': this.state.bpm = Math.min(300,this.state.bpm+1); this.commit(); break;
      case 'tap': {
        const now = performance.now();
        if (this.taps.length && now-this.taps.at(-1)! > 3000) this.taps = [];
        this.taps.push(now); this.taps = this.taps.slice(-6);
        if (this.taps.length > 1) { this.state.bpm = Math.min(300,Math.max(20,Math.round(60000*(this.taps.length-1)/(now-this.taps[0])))); this.commit(); }
        break;
      }
      case 'circle': case 'timeline': case 'polygons': this.state.visualMode = button.id; this.commit(); break;
      case 'motion-pointer': case 'motion-runners': this.preferences.visualMotion = button.id === 'motion-pointer' ? 'pointer' : 'runners'; this.saveAppearancePreferences(); this.render(); break;
      case 'add-layer': if (this.state.layers.length < MAX_LAYERS) { const previousLength = this.state.layers.length; this.state.layers.push(newLayer(5, previousLength)); if (previousLength > 0 && previousLength % layersPerTab === 0) this.activeLayerTab = previousLength / layersPerTab; this.commit(); } break;
      case 'drone-enabled': this.state.drone.enabled = !this.state.drone.enabled; this.commit(); break;
      case 'help': (this.root.querySelector('#help-dialog') as HTMLDialogElement).showModal(); break;
      case 'close-help': (this.root.querySelector('#help-dialog') as HTMLDialogElement).close(); break;
      case 'developer-settings': this.openDeveloperSettings(); break;
      case 'developer-mode': this.preferences.developerMode = !this.preferences.developerMode; this.saveAppearancePreferences(); this.render(); break;
      case 'close-developer': (this.root.querySelector('#developer-dialog') as HTMLDialogElement).close(); break;
      case 'save-palette': this.savePalette(); break;
      case 'cancel-palette-edit': this.editingPaletteId = null; this.refreshDeveloperSettings(); break;
    }
  }
  private change(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.id === 'active-palette' && paletteById(this.preferences, input.value)) { this.selectPalette(paletteById(this.preferences, input.value)!); return; }
    if (input.type === 'range') return;
    if (!input.checkValidity() || input.value === '') {
      input.setAttribute('aria-invalid','true');
      if (input.id === 'bpm') this.root.querySelector('#tempo-error')!.textContent = 'Podaj tempo od 20 do 300 BPM.';
      else this.message('Liczba uderzeń musi być liczbą całkowitą od 1 do 16.');
      return;
    }
    const value = Number(input.value), index = Number(input.dataset.index);
    if (input.id === 'bpm') this.state.bpm = value;
    else if (input.id === 'cycle-beats') this.state.cycleBeats = value;
    else if (input.id === 'subdivision') this.state.subdivision = value;
    else if (input.id.startsWith('beats-')) this.state.layers[index].beatsPerCycle = value;
    else if (input.id.startsWith('sound-')) this.state.layers[index].sound = input.value as typeof SOUNDS[number];
    else if (input.id.startsWith('color-')) this.state.layers[index].color = input.value;
    else if (input.id.startsWith('accent-')) this.state.layers[index].accentFirst = input.checked;
    else if (input.id === 'root') this.state.drone.root = value;
    else if (input.id === 'octave') this.state.drone.octave = value;
    else if (input.id === 'mode') this.state.drone.mode = input.value as SessionState['drone']['mode'];
    else if (input.id === 'chord') this.state.drone.chord = input.value as SessionState['drone']['chord'];
    else return;
    this.commit();
  }
  private input(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.type !== 'range') return;
    const value = Number(input.value);
    if (input.id.startsWith('gain-')) this.state.layers[Number(input.id.slice(5))].gain = value;
    else if (input.id.startsWith('pan-')) this.state.layers[Number(input.id.slice(4))].pan = value;
    else if (input.id === 'drone-gain') this.state.drone.gain = value;
    else if (input.id === 'filter') this.state.drone.filterHz = value;
    else if (input.id === 'spread') this.state.drone.spread = value;
    else if (input.id === 'master') this.state.masterGain = value;
    else return;
    const display = input.id === 'filter' ? `${value} Hz` : input.id.startsWith('pan-') ? `${value}` : `${Math.round(value*100)}%`;
    this.root.querySelector(`#${input.id}-value`)!.textContent = display;
    input.setAttribute('aria-valuetext', display); this.commit(false);
  }
}
