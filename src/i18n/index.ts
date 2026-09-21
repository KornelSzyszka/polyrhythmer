export const PREFERENCE_LANGUAGES = ['pl', 'en', 'de', 'it', 'es', 'pt-BR'] as const;
export type Language = (typeof PREFERENCE_LANGUAGES)[number];

const translations: Record<Exclude<Language, 'pl'>, Record<string, string>> = {
  en: {
    Język: 'Language',
    Polski: 'Polish',
    Angielski: 'English',
    Niemiecki: 'German',
    Włoski: 'Italian',
    Hiszpański: 'Spanish',
    'Portugalski (Brazylia)': 'Portuguese (Brazil)',
    'Sesja lokalna': 'Local session',
    'Tryb lokalny': 'Local mode',
    'Gotowy offline': 'Offline ready',
    'Tryb offline': 'Offline mode',
    'Przygotowanie offline': 'Preparing offline mode',
    'Offline niedostępny': 'Offline unavailable',
    'Zainstaluj ↗': 'Install ↗',
    'Nowa wersja ↻': 'New version ↻',
    'Dev: wył.': 'Dev: off',
    'Dev: wł.': 'Dev: on',
    'wył.': 'off',
    'wł.': 'on',
    Palety: 'Palettes',
    'Jak korzystać': 'How it works',
    'MAŁE LABORATORIUM RYTMU': 'SMALL RHYTHM LAB',
    'SESJA / 001': 'SESSION / 001',
    'Znajdź wspólny puls': 'Find the common pulse',
    'Znajdź wspólny puls.': 'Find the common pulse.',
    'Różne rytmy. Jeden moment spotkania.': 'Different rhythms. One meeting point.',
    'Stwórz przestrzeń do ćwiczeń': 'Create space to practise',
    POLIRYTM: 'POLYRHYTHM',
    'Wizualizacja i transport': 'Visualization and transport',
    Widok: 'View',
    Okrąg: 'Circle',
    'Oś czasu': 'Timeline',
    Wielokąty: 'Polygons',
    RUCH: 'MOTION',
    'Ruch wizualizacji': 'Visual motion',
    Wskazówka: 'Pointer',
    Kropki: 'Dots',
    TEMPO: 'TEMPO',
    'Zmniejsz tempo': 'Decrease tempo',
    'Zwiększ tempo': 'Increase tempo',
    Start: 'Start',
    Pauza: 'Pause',
    Stop: 'Stop',
    'Tap tempo': 'Tap tempo',
    'wybij rytm': 'tap the rhythm',
    SPACJA: 'SPACE',
    'start / pauza': 'start / pause',
    'NIEZALEŻNE GŁOSY': 'INDEPENDENT VOICES',
    'Warstwy rytmu': 'Rhythm layers',
    'Dodaj warstwę': 'Add layer',
    ODKRYWAJ: 'EXPLORE',
    'Grupy warstw': 'Layer groups',
    Kolor: 'Colour',
    Kolejność: 'Order',
    'uderz. / cykl': 'beats / cycle',
    BARWA: 'SOUND',
    Głośność: 'Volume',
    'Akcent i panorama': 'Accent and panning',
    'Akcent pierwszego uderzenia': 'Accent the first beat',
    'Panorama L ↔ R': 'Pan L ↔ R',
    'Długość wspólnego cyklu': 'Common cycle length',
    'Jedna ćwierćnuta = jeden puls BPM': 'One quarter note = one BPM pulse',
    'Podział podpórki': 'Support subdivision',
    'Regularny klik pomaga utrzymać wspólny puls': 'A steady click helps maintain the common pulse',
    'Brzmienie kliku': 'Click sound',
    'BRZMIENIE KLIKU': 'CLICK SOUND',
    'Ustawienia kliku': 'Click settings',
    'Zamknij ustawienia kliku': 'Close click settings',
    'Wybierz charakter i delikatne rozstrojenie kolejnych uderzeń.':
      'Choose the character and subtle detuning of successive clicks.',
    Preset: 'Preset',
    Wysokość: 'Pitch',
    'Różnica między klikami': 'Difference between clicks',
    'TŁO DLA TWOJEGO RYTMU': 'A BED FOR YOUR RHYTHM',
    RESONARA: 'RESONARA',
    'Warstwa harmoniczna': 'Harmonic layer',
    'Skala, progresja i stałe tło dronowe.': 'Scale, progression and sustained drone bed.',
    PROGRESJA: 'PROGRESSION',
    'Akordy zaczynają się na wybranych stepach.': 'Chords start on selected steps.',
    'Dodaj akord +': 'Add chord +',
    'Dodaj pierwszy akord do progresji.': 'Add the first chord to the progression.',
    'STARTING STEP': 'STARTING STEP',
    'Wybierz starting step, ton i akord dostępny w aktualnej skali.':
      'Choose a starting step, root and chord available in the current scale.',
    'Edytuj akord': 'Edit chord',
    'Usuń akord od kroku': 'Delete chord from step',
    'TON STARTOWY': 'STARTING NOTE',
    SKALA: 'SCALE',
    'COMMON STEPS': 'COMMON STEPS',
    'Każdy krok może być nutą lub akordem.': 'Each step can be a note or a chord.',
    'Kliknij krok, aby ustawić akord ze skali.': 'Click a step to set a chord from the scale.',
    'Ustaw akord dla kroku': 'Set chord for step',
    'Edytuj ↗': 'Edit ↗',
    'Zamknij ustawienia akordu': 'Close chord settings',
    'Wybierz ton i akord dostępny w aktualnej skali.':
      'Choose a root and a chord available in the current scale.',
    'TON AKORDU': 'CHORD ROOT',
    AKORD: 'CHORD',
    'Ustaw akord': 'Set chord',
    Chromatyczna: 'Chromatic',
    Durowa: 'Major',
    Molowa: 'Minor',
    Dorycka: 'Dorian',
    Frygijska: 'Phrygian',
    Pentatoniczna: 'Pentatonic',
    Pentatoniczny: 'Pentatonic',
    'Nuta / pryma': 'Note / root',
    'Akord molowy': 'Minor chord',
    'Akord durowy': 'Major chord',
    'Pryma + kwinta': 'Root + fifth',
    'Pryma + oktawa': 'Root + octave',
    Trójdźwięk: 'Triad',
    'Wszystkie dźwięki — napięcie i pełna swoboda.': 'Every note — tension and complete freedom.',
    'Jasna i stabilna; naturalny punkt wyjścia.': 'Bright and stable; a natural starting point.',
    'Ciemniejsza, miękka i introspektywna.': 'Darker, softer and introspective.',
    'Molowa z podniesioną sekstą; pulsująca i otwarta.':
      'Minor with a raised sixth; open and propulsive.',
    'Napięta dzięki obniżonej sekundzie.': 'Tense through its lowered second.',
    'Pięć dźwięków; prosta, przestrzenna i odporna na zgrzyty.':
      'Five notes; simple, spacious and forgiving.',
    'Dron tonalny': 'Tonal drone',
    'Stały ton. Więcej przestrzeni.': 'A sustained tone. More space.',
    'Zaawansowane ustawienia': 'Advanced settings',
    'Zamknij zaawansowane ustawienia': 'Close advanced settings',
    'Dopasuj charakter drona i paletę nut bez rozbudowywania głównego panelu.':
      'Shape the drone and note palette without expanding the main panel.',
    'TON PODSTAWOWY': 'ROOT NOTE',
    OKTAWA: 'OCTAVE',
    TRYB: 'MODE',
    HARMONIA: 'HARMONY',
    'Poziom drona': 'Drone level',
    Jasność: 'Brightness',
    'Szerokość stereo': 'Stereo width',
    'Jak spotykają się rytmy?': 'How do the rhythms meet?',
    'Stworzone do uważnego słuchania.': 'Made for attentive listening.',
    'Głośność główna': 'Master volume',
    'BEZ KONT. BEZ POŚPIECHU.': 'NO ACCOUNT. NO RUSH.',
    'KRÓTKI PRZEWODNIK': 'SHORT GUIDE',
    'Wiele rytmów, jeden cykl.': 'Many rhythms, one cycle.',
    'Wybierz proporcję, np. 3:2, i naciśnij Start. Pierwsza warstwa zagra trzy, a druga dwa równo rozmieszczone uderzenia w tym samym czasie.':
      'Choose a ratio, for example 3:2, then press Start. The first layer plays three and the second two evenly spaced beats in the same time.',
    'BPM określa tempo ćwierćnut. Długość cyklu mówi, ile ćwierćnut mieści się w pełnym obrocie. Przy 90 BPM i 4 ćwierćnutach cykl trwa 2,67 s.':
      'BPM sets the quarter-note tempo. Cycle length determines how many quarter notes fit in one full rotation. At 90 BPM and four quarter notes, the cycle lasts 2.67 seconds.',
    'Każda karta warstwy pozwala ustawić jej kolor i liczbę uderzeń w cyklu. Pauza zachowuje pozycję, Stop wraca do zera. Spacja działa, gdy fokus nie jest w kontrolce.':
      'Each layer card lets you set its colour and number of beats per cycle. Pause keeps the position; Stop returns to zero. Space works when focus is not in a control.',
    'Włącz dron, by ćwiczyć na tle stałego tonu. Tryb zmienia tercję trójdźwięku; pryma i kwinta pozostają te same.':
      'Enable the drone to practise against a sustained tone. Mode changes the triad third; the root and fifth remain the same.',
    'Ustawienia zapisują się na tym urządzeniu. Gdy zobaczysz „Gotowy offline”, możesz wrócić bez internetu. Do instalacji na iOS wybierz Udostępnij → Do ekranu początkowego. System może zatrzymać dźwięk w tle lub po zablokowaniu ekranu.':
      'Settings are saved on this device. When you see “Offline ready”, you can return without an internet connection. On iOS, choose Share → Add to Home Screen to install. The system may stop audio in the background or after the screen is locked.',
    'Zamknij pomoc': 'Close help',
    'USTAWIENIA PALET': 'PALETTE SETTINGS',
    'Palety wyglądu': 'Appearance palettes',
    'Wybierz paletę, aby jej użyć i załadować kolory do edytora. Palety zapisują się lokalnie.':
      'Choose a palette to use it and load its colours into the editor. Palettes are saved locally.',
    Leśna: 'Forest',
    Łupek: 'Slate',
    Świt: 'Dawn',
    Tło: 'Background',
    Powierzchnia: 'Surface',
    Tekst: 'Text',
    Wyciszenie: 'Muted',
    Obramowanie: 'Border',
    Akcent: 'Accent',
    'Zamknij ustawienia palet': 'Close palette settings',
    'Nowa paleta': 'New palette',
    Nazwa: 'Name',
    'Zapisz paletę': 'Save palette',
    'Anuluj edycję': 'Cancel editing',
    Wbudowana: 'Built-in',
    Edytuj: 'Edit',
    Usuń: 'Delete',
    'Gotowy do gry': 'Ready to play',
    'Pauza — Twój rytm czeka': 'Paused — your rhythm is waiting',
    'Odtwarzanie · zsynchronizowane': 'Playing · synchronized',
    Zatrzymano: 'Stopped',
    'Zatrzymano · początek cyklu': 'Stopped · start of cycle',
    'Nie udało się uruchomić audio': 'Could not start audio',
    'Naciśnij Start, aby ponowić.': 'Press Start to try again.',
    'Audio wstrzymane przez przeglądarkę — naciśnij Start':
      'Audio was interrupted by the browser — press Start',
    'JEDEN WSPÓLNY CYKL': 'ONE COMMON CYCLE',
    'wspólnych kroków': 'common steps',
    'WIELOKĄTNY PULS': 'POLYGONAL PULSE',
    'WSPÓLNY PULS': 'COMMON PULSE',
    cykl: 'cycle',
  },
  de: {
    Język: 'Sprache',
    Polski: 'Polnisch',
    Angielski: 'Englisch',
    Niemiecki: 'Deutsch',
    Włoski: 'Italienisch',
    Hiszpański: 'Spanisch',
    'Portugalski (Brazylia)': 'Portugiesisch (Brasilien)',
    'Sesja lokalna': 'Lokale Sitzung',
    'Zainstaluj ↗': 'Installieren ↗',
    'Nowa wersja ↻': 'Neue Version ↻',
    Palety: 'Paletten',
    'Jak korzystać': 'Anleitung',
    'MAŁE LABORATORIUM RYTMU': 'KLEINES RHYTHMUSLABOR',
    'Znajdź wspólny puls': 'Finde den gemeinsamen Puls',
    'Znajdź wspólny puls.': 'Finde den gemeinsamen Puls.',
    'Różne rytmy. Jeden moment spotkania.': 'Verschiedene Rhythmen. Ein Treffpunkt.',
    POLIRYTM: 'POLYRHYTHMUS',
    Widok: 'Ansicht',
    Okrąg: 'Kreis',
    'Oś czasu': 'Zeitachse',
    Wielokąty: 'Polygone',
    Start: 'Start',
    Pauza: 'Pause',
    Stop: 'Stopp',
    'Tap tempo': 'Tempo tippen',
    'Warstwy rytmu': 'Rhythmusebenen',
    'Dodaj warstwę': 'Ebene hinzufügen',
    'Dron tonalny': 'Klangteppich',
    'Brzmienie kliku': 'Klickklang',
    Preset: 'Preset',
    Wysokość: 'Tonhöhe',
    'Różnica między klikami': 'Unterschied zwischen Klicks',
    Głośność: 'Lautstärke',
    'Głośność główna': 'Hauptlautstärke',
    'Gotowy do gry': 'Spielbereit',
    'Odtwarzanie · zsynchronizowane': 'Wiedergabe · synchronisiert',
    Zatrzymano: 'Gestoppt',
    'JEDEN WSPÓLNY CYKL': 'EIN GEMEINSAMER ZYKLUS',
    'WSPÓLNY PULS': 'GEMEINSAMER PULS',
  },
  it: {
    Język: 'Lingua',
    Polski: 'Polacco',
    Angielski: 'Inglese',
    Niemiecki: 'Tedesco',
    Włoski: 'Italiano',
    Hiszpański: 'Spagnolo',
    'Portugalski (Brazylia)': 'Portoghese (Brasile)',
    'Sesja lokalna': 'Sessione locale',
    'Zainstaluj ↗': 'Installa ↗',
    'Nowa wersja ↻': 'Nuova versione ↻',
    Palety: 'Palette',
    'Jak korzystać': 'Come funziona',
    'MAŁE LABORATORIUM RYTMU': 'PICCOLO LABORATORIO RITMICO',
    'Znajdź wspólny puls.': 'Trova il battito comune.',
    'Różne rytmy. Jeden moment spotkania.': 'Ritmi diversi. Un punto d’incontro.',
    POLIRYTM: 'POLIRITMO',
    Widok: 'Vista',
    Okrąg: 'Cerchio',
    'Oś czasu': 'Linea del tempo',
    Wielokąty: 'Poligoni',
    Start: 'Avvia',
    Pauza: 'Pausa',
    Stop: 'Stop',
    'Tap tempo': 'Batti il tempo',
    'Warstwy rytmu': 'Livelli ritmici',
    'Dodaj warstwę': 'Aggiungi livello',
    'Dron tonalny': 'Drone tonale',
    'Brzmienie kliku': 'Suono del clic',
    Preset: 'Preset',
    Wysokość: 'Altezza',
    'Różnica między klikami': 'Differenza tra i clic',
    Głośność: 'Volume',
    'Głośność główna': 'Volume principale',
    'Gotowy do gry': 'Pronto a suonare',
    'Odtwarzanie · zsynchronizowane': 'In riproduzione · sincronizzato',
    Zatrzymano: 'Fermato',
    'JEDEN WSPÓLNY CYKL': 'UN CICLO COMUNE',
    'WSPÓLNY PULS': 'BATTITO COMUNE',
  },
  es: {
    Język: 'Idioma',
    Polski: 'Polaco',
    Angielski: 'Inglés',
    Niemiecki: 'Alemán',
    Włoski: 'Italiano',
    Hiszpański: 'Español',
    'Portugalski (Brazylia)': 'Portugués (Brasil)',
    'Sesja lokalna': 'Sesión local',
    'Zainstaluj ↗': 'Instalar ↗',
    'Nowa wersja ↻': 'Nueva versión ↻',
    Palety: 'Paletas',
    'Jak korzystać': 'Cómo funciona',
    'MAŁE LABORATORIUM RYTMU': 'PEQUEÑO LABORATORIO RÍTMICO',
    'Znajdź wspólny puls.': 'Encuentra el pulso común.',
    'Różne rytmy. Jeden moment spotkania.': 'Ritmos distintos. Un punto de encuentro.',
    POLIRYTM: 'POLIRRITMO',
    Widok: 'Vista',
    Okrąg: 'Círculo',
    'Oś czasu': 'Línea de tiempo',
    Wielokąty: 'Polígonos',
    Start: 'Iniciar',
    Pauza: 'Pausa',
    Stop: 'Detener',
    'Tap tempo': 'Marcar tempo',
    'Warstwy rytmu': 'Capas rítmicas',
    'Dodaj warstwę': 'Añadir capa',
    'Dron tonalny': 'Drone tonal',
    'Brzmienie kliku': 'Sonido del clic',
    Preset: 'Preset',
    Wysokość: 'Altura',
    'Różnica między klikami': 'Diferencia entre clics',
    Głośność: 'Volumen',
    'Głośność główna': 'Volumen principal',
    'Gotowy do gry': 'Listo para tocar',
    'Odtwarzanie · zsynchronizowane': 'Reproduciendo · sincronizado',
    Zatrzymano: 'Detenido',
    'JEDEN WSPÓLNY CYKL': 'UN CICLO COMÚN',
    'WSPÓLNY PULS': 'PULSO COMÚN',
  },
  'pt-BR': {
    Język: 'Idioma',
    Polski: 'Polonês',
    Angielski: 'Inglês',
    Niemiecki: 'Alemão',
    Włoski: 'Italiano',
    Hiszpański: 'Espanhol',
    'Portugalski (Brazylia)': 'Português (Brasil)',
    'Sesja lokalna': 'Sessão local',
    'Zainstaluj ↗': 'Instalar ↗',
    'Nowa wersja ↻': 'Nova versão ↻',
    Palety: 'Paletas',
    'Jak korzystać': 'Como funciona',
    'MAŁE LABORATORIUM RYTMU': 'PEQUENO LABORATÓRIO RÍTMICO',
    'Znajdź wspólny puls.': 'Encontre o pulso comum.',
    'Różne rytmy. Jeden moment spotkania.': 'Ritmos diferentes. Um ponto de encontro.',
    POLIRYTM: 'POLIRRITMO',
    Widok: 'Visualização',
    Okrąg: 'Círculo',
    'Oś czasu': 'Linha do tempo',
    Wielokąty: 'Polígonos',
    Start: 'Iniciar',
    Pauza: 'Pausar',
    Stop: 'Parar',
    'Tap tempo': 'Marcar tempo',
    'Warstwy rytmu': 'Camadas rítmicas',
    'Dodaj warstwę': 'Adicionar camada',
    'Dron tonalny': 'Drone tonal',
    'Brzmienie kliku': 'Som do clique',
    Preset: 'Predefinição',
    Wysokość: 'Altura',
    'Różnica między klikami': 'Diferença entre cliques',
    Głośność: 'Volume',
    'Głośność główna': 'Volume principal',
    'Gotowy do gry': 'Pronto para tocar',
    'Odtwarzanie · zsynchronizowane': 'Tocando · sincronizado',
    Zatrzymano: 'Parado',
    'JEDEN WSPÓLNY CYKL': 'UM CICLO COMUM',
    'WSPÓLNY PULS': 'PULSO COMUM',
  },
};

const terms: Record<Exclude<Language, 'pl'>, Record<string, string>> = {
  en: {
    Chromatyczny: 'Chromatic',
    Durowy: 'Major',
    Molowy: 'Minor',
    Dorycki: 'Dorian',
    Frygijski: 'Phrygian',
    Pryma: 'Root',
    'Pryma + kwinta + oktawa': 'Root + fifth + octave',
    'Pryma + oktawa': 'Root + octave',
    Trójdźwięk: 'Triad',
    Wyłączona: 'Off',
    Ćwierćnuty: 'Quarter notes',
    Ósemki: 'Eighth notes',
    'Triola ósemkowa': 'Eighth-note triplet',
    Szesnastki: 'Sixteenth notes',
    Kwintola: 'Quintuplet',
    Sekstola: 'Sextuplet',
    Drewno: 'Wood',
    Miękki: 'Soft',
    Dzwonek: 'Bell',
    Drewniany: 'Wooden',
    Szklisty: 'Glassy',
    'uderzeń / cykl': 'beats / cycle',
    'Barwy nut': 'Note colours',
    'Oktawa bazowa: 3': 'Reference octave: 3',
    Barwa: 'Timbre',
    Sinus: 'Sine',
    Trójkąt: 'Triangle',
    Piła: 'Sawtooth',
    Prostokąt: 'Square',
  },
  de: {
    Chromatyczny: 'Chromatisch',
    Durowy: 'Dur',
    Molowy: 'Moll',
    Dorycki: 'Dorisch',
    Frygijski: 'Phrygisch',
    Pryma: 'Grundton',
    'Pryma + kwinta + oktawa': 'Grundton + Quinte + Oktave',
    'Pryma + oktawa': 'Grundton + Oktave',
    Trójdźwięk: 'Dreiklang',
    Wyłączona: 'Aus',
    Ćwierćnuty: 'Viertelnoten',
    Ósemki: 'Achtelnoten',
    'Triola ósemkowa': 'Achteltriole',
    Szesnastki: 'Sechzehntelnoten',
    Kwintola: 'Quintole',
    Sekstola: 'Sextole',
    Drewno: 'Holz',
    Miękki: 'Weich',
    Dzwonek: 'Glocke',
    Drewniany: 'Holz',
    Szklisty: 'Gläsern',
    'uderzeń / cykl': 'Schläge / Zyklus',
    'Barwy nut': 'Notenfarben',
    'Oktawa bazowa: 3': 'Referenzoktave: 3',
    Barwa: 'Klangfarbe',
    Sinus: 'Sinus',
    Trójkąt: 'Dreieck',
    Piła: 'Sägezahn',
    Prostokąt: 'Rechteck',
  },
  it: {
    Chromatyczny: 'Cromatico',
    Durowy: 'Maggiore',
    Molowy: 'Minore',
    Dorycki: 'Dorico',
    Frygijski: 'Frigio',
    Pryma: 'Fondamentale',
    'Pryma + kwinta + oktawa': 'Fondamentale + quinta + ottava',
    'Pryma + oktawa': 'Fondamentale + ottava',
    Trójdźwięk: 'Triade',
    Wyłączona: 'Disattivato',
    Ćwierćnuty: 'Note da un quarto',
    Ósemki: 'Crome',
    'Triola ósemkowa': 'Terzina di crome',
    Szesnastki: 'Semicrome',
    Kwintola: 'Quintina',
    Sekstola: 'Sestina',
    Drewno: 'Legno',
    Miękki: 'Morbido',
    Dzwonek: 'Campanella',
    Drewniany: 'Legno',
    Szklisty: 'Vetro',
    'uderzeń / cykl': 'colpi / ciclo',
    'Barwy nut': 'Colori delle note',
    'Oktawa bazowa: 3': 'Ottava di riferimento: 3',
    Barwa: 'Timbro',
    Sinus: 'Sinusoide',
    Trójkąt: 'Triangolare',
    Piła: 'Dente di sega',
    Prostokąt: 'Quadra',
  },
  es: {
    Chromatyczny: 'Cromático',
    Durowy: 'Mayor',
    Molowy: 'Menor',
    Dorycki: 'Dórico',
    Frygijski: 'Frigio',
    Pryma: 'Tónica',
    'Pryma + kwinta + oktawa': 'Tónica + quinta + octava',
    'Pryma + oktawa': 'Tónica + octava',
    Trójdźwięk: 'Tríada',
    Wyłączona: 'Desactivado',
    Ćwierćnuty: 'Negras',
    Ósemki: 'Corcheas',
    'Triola ósemkowa': 'Tresillo de corcheas',
    Szesnastki: 'Semicorcheas',
    Kwintola: 'Quintillo',
    Sekstola: 'Seisillo',
    Drewno: 'Madera',
    Miękki: 'Suave',
    Dzwonek: 'Campana',
    Drewniany: 'Madera',
    Szklisty: 'Vítreo',
    'uderzeń / cykl': 'golpes / ciclo',
    'Barwy nut': 'Colores de notas',
    'Oktawa bazowa: 3': 'Octava de referencia: 3',
    Barwa: 'Timbre',
    Sinus: 'Senoidal',
    Trójkąt: 'Triangular',
    Piła: 'Diente de sierra',
    Prostokąt: 'Cuadrada',
  },
  'pt-BR': {
    Chromatyczny: 'Cromático',
    Durowy: 'Maior',
    Molowy: 'Menor',
    Dorycki: 'Dórico',
    Frygijski: 'Frígio',
    Pryma: 'Tônica',
    'Pryma + kwinta + oktawa': 'Tônica + quinta + oitava',
    'Pryma + oktawa': 'Tônica + oitava',
    Trójdźwięk: 'Tríade',
    Wyłączona: 'Desativado',
    Ćwierćnuty: 'Semínimas',
    Ósemki: 'Colcheias',
    'Triola ósemkowa': 'Tercina de colcheias',
    Szesnastki: 'Semicolcheias',
    Kwintola: 'Quiáltera',
    Sekstola: 'Sextina',
    Drewno: 'Madeira',
    Miękki: 'Suave',
    Dzwonek: 'Sino',
    Drewniany: 'Madeira',
    Szklisty: 'Vítreo',
    'uderzeń / cykl': 'toques / ciclo',
    'Barwy nut': 'Cores das notas',
    'Oktawa bazowa: 3': 'Oitava de referência: 3',
    Barwa: 'Timbre',
    Sinus: 'Senoidal',
    Trójkąt: 'Triangular',
    Piła: 'Dente de serra',
    Prostokąt: 'Quadrada',
  },
};

export const translateText = (value: string, language: Language): string => {
  if (language === 'pl') return value;
  const leading = value.match(/^\s*/)?.[0] ?? '';
  const trailing = value.match(/\s*$/)?.[0] ?? '';
  const source = value.trim();
  const exact =
    translations[language][source] ??
    terms[language][source] ??
    translations.en[source] ??
    terms.en[source];
  if (exact) return `${leading}${exact}${trailing}`;
  const steps = source.match(/^(\d+) wspólnych kroków( ↗)?$/);
  if (steps) {
    const unit =
      language === 'en'
        ? 'common steps'
        : language === 'de'
          ? 'gemeinsame Schritte'
          : language === 'it'
            ? 'passi comuni'
            : language === 'es'
              ? 'pasos comunes'
              : 'passos em comum';
    return `${leading}${steps[1]} ${unit}${steps[2] ?? ''}${trailing}`;
  }
  const cycle = source.match(/^CYKL (\d+)$/);
  if (cycle) {
    const label =
      language === 'en'
        ? 'CYCLE'
        : language === 'de'
          ? 'ZYKLUS'
          : language === 'it'
            ? 'CICLO'
            : language === 'es'
              ? 'CICLO'
              : 'CICLO';
    return `${leading}${label} ${cycle[1]}${trailing}`;
  }
  const beatCount = source.match(/^(\d+) \/ (\d+) uderz\.$/);
  if (beatCount)
    return `${leading}${beatCount[1]} / ${beatCount[2]} ${language === 'en' ? 'beats' : language === 'de' ? 'Schläge' : language === 'it' ? 'colpi' : language === 'es' ? 'golpes' : 'toques'}${trailing}`;
  const duration = source.match(/^([\d.]+) s \/ cykl$/);
  if (duration)
    return `${leading}${duration[1]} s / ${language === 'en' ? 'cycle' : language === 'de' ? 'Zyklus' : language === 'it' ? 'ciclo' : language === 'es' ? 'ciclo' : 'ciclo'}${trailing}`;
  const semitone = source.match(/^([+-]?\d+) półtonu$/);
  if (semitone) {
    const unit =
      language === 'en'
        ? 'semitones'
        : language === 'de'
          ? 'Halbtöne'
          : language === 'it'
            ? 'semitoni'
            : language === 'es'
              ? 'semitonos'
              : 'semitons';
    return `${leading}${semitone[1]} ${unit}${trailing}`;
  }
  const cents = source.match(/^(\d+) centów$/);
  if (cents) {
    const unit = language === 'en' ? 'cents' : language === 'de' ? 'Cent' : 'cent';
    return `${leading}${cents[1]} ${unit}${trailing}`;
  }
  const noteControl = source.match(/^(Kolor|Barwa) nuty (.+)$/);
  if (noteControl) {
    const labels = {
      en: noteControl[1] === 'Kolor' ? 'Colour of note' : 'Timbre of note',
      de: noteControl[1] === 'Kolor' ? 'Farbe der Note' : 'Klangfarbe der Note',
      it: noteControl[1] === 'Kolor' ? 'Colore della nota' : 'Timbro della nota',
      es: noteControl[1] === 'Kolor' ? 'Color de la nota' : 'Timbre de la nota',
      'pt-BR': noteControl[1] === 'Kolor' ? 'Cor da nota' : 'Timbre da nota',
    } as const;
    return `${leading}${labels[language]} ${noteControl[2]}${trailing}`;
  }
  const rhythm = source.match(/^Rytm ([\d:]+)\. Pierwsze uderzenie na godzinie dwunastej\.$/);
  if (rhythm && language === 'en')
    return `${leading}Rhythm ${rhythm[1]}. First beat at twelve o’clock.${trailing}`;
  const timeline = source.match(/^Oś czasu rytmu ([\d:]+)$/);
  if (timeline && language === 'en') return `${leading}Rhythm timeline ${timeline[1]}${trailing}`;
  const polygons = source.match(/^Wielokąty rytmu ([\d:]+)$/);
  if (polygons && language === 'en') return `${leading}Rhythm polygons ${polygons[1]}${trailing}`;
  return value
    .replace(
      /Znajdź wspólny puls/g,
      language === 'en'
        ? 'Find the common pulse'
        : language === 'de'
          ? 'Finde den gemeinsamen Puls'
          : language === 'it'
            ? 'Trova il battito comune'
            : language === 'es'
              ? 'Encuentra el pulso común'
              : 'Encontre o pulso comum',
    )
    .replace(
      /^Warstwa (\d+)$/,
      language === 'en'
        ? 'Layer $1'
        : language === 'de'
          ? 'Ebene $1'
          : language === 'it'
            ? 'Livello $1'
            : language === 'es'
              ? 'Capa $1'
              : 'Camada $1',
    )
    .replace(
      /^(\d+) uderz\.$/,
      language === 'en'
        ? '$1 beats'
        : language === 'de'
          ? '$1 Schläge'
          : language === 'it'
            ? '$1 colpi'
            : language === 'es'
              ? '$1 golpes'
              : '$1 toques',
    );
};

export function translateDom(root: HTMLElement, language: Language) {
  document.documentElement.lang = language;
  if (language === 'pl') return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  nodes.forEach((node) => {
    node.textContent = translateText(node.textContent ?? '', language);
  });
  root.querySelectorAll<HTMLElement>('*').forEach((element) => {
    ['aria-label', 'title', 'aria-valuetext'].forEach((attribute) => {
      const value = element.getAttribute(attribute);
      if (value) element.setAttribute(attribute, translateText(value, language));
    });
  });
}
