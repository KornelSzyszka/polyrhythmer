export const PREFERENCE_LANGUAGES = ['pl', 'en', 'de', 'it', 'es', 'pt-BR'] as const;
export type Language = typeof PREFERENCE_LANGUAGES[number];

const translations: Record<Exclude<Language, 'pl'>, Record<string, string>> = {
  en: {
    'Język': 'Language', 'Polski': 'Polish', 'Angielski': 'English', 'Niemiecki': 'German', 'Włoski': 'Italian', 'Hiszpański': 'Spanish', 'Portugalski (Brazylia)': 'Portuguese (Brazil)',
    'Sesja lokalna': 'Local session', 'Zainstaluj ↗': 'Install ↗', 'Nowa wersja ↻': 'New version ↻', 'Palety': 'Palettes', 'Jak korzystać': 'How it works',
    'MAŁE LABORATORIUM RYTMU': 'SMALL RHYTHM LAB', 'Znajdź wspólny puls': 'Find the common pulse', 'Znajdź wspólny puls.': 'Find the common pulse.', 'Różne rytmy. Jeden moment spotkania.': 'Different rhythms. One meeting point.', 'Stwórz przestrzeń do ćwiczeń': 'Create space to practise',
    'POLIRYTM': 'POLYRHYTHM', 'Widok': 'View', 'Okrąg': 'Circle', 'Oś czasu': 'Timeline', 'Wielokąty': 'Polygons', 'RUCH': 'MOTION', 'Ruch wizualizacji': 'Visual motion', 'Wskazówka': 'Pointer', 'Kropki': 'Dots',
    'TEMPO': 'TEMPO', 'Zmniejsz tempo': 'Decrease tempo', 'Zwiększ tempo': 'Increase tempo', 'Start': 'Start', 'Pauza': 'Pause', 'Stop': 'Stop', 'Tap tempo': 'Tap tempo', 'wybij rytm': 'tap the rhythm', 'SPACJA': 'SPACE', 'start / pauza': 'start / pause',
    'NIEZALEŻNE GŁOSY': 'INDEPENDENT VOICES', 'Warstwy rytmu': 'Rhythm layers', 'Dodaj warstwę': 'Add layer', 'ODKRYWAJ': 'EXPLORE', 'Grupy warstw': 'Layer groups', 'Kolor': 'Colour', 'Kolejność': 'Order', 'uderz. / cykl': 'beats / cycle', 'BARWA': 'SOUND', 'Głośność': 'Volume', 'Akcent i panorama': 'Accent and panning', 'Akcent pierwszego uderzenia': 'Accent the first beat', 'Panorama L ↔ R': 'Pan L ↔ R',
    'Długość wspólnego cyklu': 'Common cycle length', 'Jedna ćwierćnuta = jeden puls BPM': 'One quarter note = one BPM pulse', 'Podział podpórki': 'Support subdivision', 'Regularny klik pomaga utrzymać wspólny puls': 'A steady click helps maintain the common pulse',
    'TŁO DLA TWOJEGO RYTMU': 'A BED FOR YOUR RHYTHM', 'Dron tonalny': 'Tonal drone', 'Stały ton. Więcej przestrzeni.': 'A sustained tone. More space.', 'TON PODSTAWOWY': 'ROOT NOTE', 'OKTAWA': 'OCTAVE', 'TRYB': 'MODE', 'HARMONIA': 'HARMONY', 'Poziom drona': 'Drone level', 'Jasność': 'Brightness', 'Szerokość stereo': 'Stereo width',
    'Jak spotykają się rytmy?': 'How do the rhythms meet?', 'Stworzone do uważnego słuchania.': 'Made for attentive listening.', 'Głośność główna': 'Master volume', 'BEZ KONT. BEZ POŚPIECHU.': 'NO ACCOUNT. NO RUSH.',
    'KRÓTKI PRZEWODNIK': 'SHORT GUIDE', 'Wiele rytmów, jeden cykl.': 'Many rhythms, one cycle.', 'Zamknij pomoc': 'Close help', 'USTAWIENIA PALET': 'PALETTE SETTINGS', 'Palety wyglądu': 'Appearance palettes', 'Zamknij ustawienia palet': 'Close palette settings', 'Nowa paleta': 'New palette', 'Nazwa': 'Name', 'Zapisz paletę': 'Save palette', 'Anuluj edycję': 'Cancel editing', 'Wbudowana': 'Built-in', 'Edytuj': 'Edit', 'Usuń': 'Delete',
    'Gotowy do gry': 'Ready to play', 'Pauza — Twój rytm czeka': 'Paused — your rhythm is waiting', 'Odtwarzanie · zsynchronizowane': 'Playing · synchronized', 'Zatrzymano': 'Stopped', 'Zatrzymano · początek cyklu': 'Stopped · start of cycle', 'Nie udało się uruchomić audio': 'Could not start audio', 'Naciśnij Start, aby ponowić.': 'Press Start to try again.', 'Audio wstrzymane przez przeglądarkę — naciśnij Start': 'Audio was interrupted by the browser — press Start',
    'JEDEN WSPÓLNY CYKL': 'ONE COMMON CYCLE', 'wspólnych kroków': 'common steps', 'WIELOKĄTNY PULS': 'POLYGONAL PULSE', 'WSPÓLNY PULS': 'COMMON PULSE', 'cykl': 'cycle',
  },
  de: { 'Język': 'Sprache', 'Polski': 'Polnisch', 'Angielski': 'Englisch', 'Niemiecki': 'Deutsch', 'Włoski': 'Italienisch', 'Hiszpański': 'Spanisch', 'Portugalski (Brazylia)': 'Portugiesisch (Brasilien)', 'Sesja lokalna': 'Lokale Sitzung', 'Zainstaluj ↗': 'Installieren ↗', 'Nowa wersja ↻': 'Neue Version ↻', 'Palety': 'Paletten', 'Jak korzystać': 'Anleitung', 'MAŁE LABORATORIUM RYTMU': 'KLEINES RHYTHMUSLABOR', 'Znajdź wspólny puls': 'Finde den gemeinsamen Puls', 'Znajdź wspólny puls.': 'Finde den gemeinsamen Puls.', 'Różne rytmy. Jeden moment spotkania.': 'Verschiedene Rhythmen. Ein Treffpunkt.', 'POLIRYTM': 'POLYRHYTHMUS', 'Widok': 'Ansicht', 'Okrąg': 'Kreis', 'Oś czasu': 'Zeitachse', 'Wielokąty': 'Polygone', 'Start': 'Start', 'Pauza': 'Pause', 'Stop': 'Stopp', 'Tap tempo': 'Tempo tippen', 'Warstwy rytmu': 'Rhythmusebenen', 'Dodaj warstwę': 'Ebene hinzufügen', 'Dron tonalny': 'Klangteppich', 'Głośność': 'Lautstärke', 'Głośność główna': 'Hauptlautstärke', 'Gotowy do gry': 'Spielbereit', 'Odtwarzanie · zsynchronizowane': 'Wiedergabe · synchronisiert', 'Zatrzymano': 'Gestoppt', 'JEDEN WSPÓLNY CYKL': 'EIN GEMEINSAMER ZYKLUS', 'WSPÓLNY PULS': 'GEMEINSAMER PULS' },
  it: { 'Język': 'Lingua', 'Polski': 'Polacco', 'Angielski': 'Inglese', 'Niemiecki': 'Tedesco', 'Włoski': 'Italiano', 'Hiszpański': 'Spagnolo', 'Portugalski (Brazylia)': 'Portoghese (Brasile)', 'Sesja lokalna': 'Sessione locale', 'Zainstaluj ↗': 'Installa ↗', 'Nowa wersja ↻': 'Nuova versione ↻', 'Palety': 'Palette', 'Jak korzystać': 'Come funziona', 'MAŁE LABORATORIUM RYTMU': 'PICCOLO LABORATORIO RITMICO', 'Znajdź wspólny puls.': 'Trova il battito comune.', 'Różne rytmy. Jeden moment spotkania.': 'Ritmi diversi. Un punto d’incontro.', 'POLIRYTM': 'POLIRITMO', 'Widok': 'Vista', 'Okrąg': 'Cerchio', 'Oś czasu': 'Linea del tempo', 'Wielokąty': 'Poligoni', 'Start': 'Avvia', 'Pauza': 'Pausa', 'Stop': 'Stop', 'Tap tempo': 'Batti il tempo', 'Warstwy rytmu': 'Livelli ritmici', 'Dodaj warstwę': 'Aggiungi livello', 'Dron tonalny': 'Drone tonale', 'Głośność': 'Volume', 'Głośność główna': 'Volume principale', 'Gotowy do gry': 'Pronto a suonare', 'Odtwarzanie · zsynchronizowane': 'In riproduzione · sincronizzato', 'Zatrzymano': 'Fermato', 'JEDEN WSPÓLNY CYKL': 'UN CICLO COMUNE', 'WSPÓLNY PULS': 'BATTITO COMUNE' },
  es: { 'Język': 'Idioma', 'Polski': 'Polaco', 'Angielski': 'Inglés', 'Niemiecki': 'Alemán', 'Włoski': 'Italiano', 'Hiszpański': 'Español', 'Portugalski (Brazylia)': 'Portugués (Brasil)', 'Sesja lokalna': 'Sesión local', 'Zainstaluj ↗': 'Instalar ↗', 'Nowa wersja ↻': 'Nueva versión ↻', 'Palety': 'Paletas', 'Jak korzystać': 'Cómo funciona', 'MAŁE LABORATORIUM RYTMU': 'PEQUEÑO LABORATORIO RÍTMICO', 'Znajdź wspólny puls.': 'Encuentra el pulso común.', 'Różne rytmy. Jeden moment spotkania.': 'Ritmos distintos. Un punto de encuentro.', 'POLIRYTM': 'POLIRRITMO', 'Widok': 'Vista', 'Okrąg': 'Círculo', 'Oś czasu': 'Línea de tiempo', 'Wielokąty': 'Polígonos', 'Start': 'Iniciar', 'Pauza': 'Pausa', 'Stop': 'Detener', 'Tap tempo': 'Marcar tempo', 'Warstwy rytmu': 'Capas rítmicas', 'Dodaj warstwę': 'Añadir capa', 'Dron tonalny': 'Drone tonal', 'Głośność': 'Volumen', 'Głośność główna': 'Volumen principal', 'Gotowy do gry': 'Listo para tocar', 'Odtwarzanie · zsynchronizowane': 'Reproduciendo · sincronizado', 'Zatrzymano': 'Detenido', 'JEDEN WSPÓLNY CYKL': 'UN CICLO COMÚN', 'WSPÓLNY PULS': 'PULSO COMÚN' },
  'pt-BR': { 'Język': 'Idioma', 'Polski': 'Polonês', 'Angielski': 'Inglês', 'Niemiecki': 'Alemão', 'Włoski': 'Italiano', 'Hiszpański': 'Espanhol', 'Portugalski (Brazylia)': 'Português (Brasil)', 'Sesja lokalna': 'Sessão local', 'Zainstaluj ↗': 'Instalar ↗', 'Nowa wersja ↻': 'Nova versão ↻', 'Palety': 'Paletas', 'Jak korzystać': 'Como funciona', 'MAŁE LABORATORIUM RYTMU': 'PEQUENO LABORATÓRIO RÍTMICO', 'Znajdź wspólny puls.': 'Encontre o pulso comum.', 'Różne rytmy. Jeden moment spotkania.': 'Ritmos diferentes. Um ponto de encontro.', 'POLIRYTM': 'POLIRRITMO', 'Widok': 'Visualização', 'Okrąg': 'Círculo', 'Oś czasu': 'Linha do tempo', 'Wielokąty': 'Polígonos', 'Start': 'Iniciar', 'Pauza': 'Pausar', 'Stop': 'Parar', 'Tap tempo': 'Marcar tempo', 'Warstwy rytmu': 'Camadas rítmicas', 'Dodaj warstwę': 'Adicionar camada', 'Dron tonalny': 'Drone tonal', 'Głośność': 'Volume', 'Głośność główna': 'Volume principal', 'Gotowy do gry': 'Pronto para tocar', 'Odtwarzanie · zsynchronizowane': 'Tocando · sincronizado', 'Zatrzymano': 'Parado', 'JEDEN WSPÓLNY CYKL': 'UM CICLO COMUM', 'WSPÓLNY PULS': 'PULSO COMUM' },
};

export const translateText = (value: string, language: Language): string => {
  if (language === 'pl') return value;
  const leading = value.match(/^\s*/)?.[0] ?? '';
  const trailing = value.match(/\s*$/)?.[0] ?? '';
  const source = value.trim();
  const exact = translations[language][source];
  if (exact) return `${leading}${exact}${trailing}`;
  return value
    .replace(/Znajdź wspólny puls/g, language === 'en' ? 'Find the common pulse' : language === 'de' ? 'Finde den gemeinsamen Puls' : language === 'it' ? 'Trova il battito comune' : language === 'es' ? 'Encuentra el pulso común' : 'Encontre o pulso comum')
    .replace(/^Warstwa (\d+)$/, language === 'en' ? 'Layer $1' : language === 'de' ? 'Ebene $1' : language === 'it' ? 'Livello $1' : language === 'es' ? 'Capa $1' : 'Camada $1')
    .replace(/^(\d+) uderz\.$/, language === 'en' ? '$1 beats' : language === 'de' ? '$1 Schläge' : language === 'it' ? '$1 colpi' : language === 'es' ? '$1 golpes' : '$1 toques');
};

export function translateDom(root: HTMLElement, language: Language) {
  document.documentElement.lang = language;
  if (language === 'pl') return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  nodes.forEach(node => { node.textContent = translateText(node.textContent ?? '', language); });
  root.querySelectorAll<HTMLElement>('*').forEach(element => {
    ['aria-label', 'title', 'aria-valuetext'].forEach(attribute => {
      const value = element.getAttribute(attribute);
      if (value) element.setAttribute(attribute, translateText(value, language));
    });
  });
}
