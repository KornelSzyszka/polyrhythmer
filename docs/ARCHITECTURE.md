# Architektura

## Model systemu

Polyrhythmer jest aplikacją działającą w całości w przeglądarce. Nie ma backendu ani zdalnego stanu. Jeden serializowalny `SessionState` opisuje konfigurację, a dwa niezależne odbiorniki używają go do wykonania: silnik audio generuje dźwięk, a warstwa wizualna renderuje bieżący cykl.

```text
zdarzenia użytkownika
        │
        ▼
   App / UI ───────► SessionState ───────► localStorage
        │                  │
        │                  ├──────────────► renderVisual()
        │                  │                       │
        ▼                  ▼                       ▼
   AudioEngine ───► TransportClock ◄──── animateVisual()
        │                  │
        ├──► Scheduler ────┴──► ClickVoices
        └──► DroneEngine

produkcja: Vite build ─► build-sw.mjs ─► service worker / cache offline
```

Źródłem czasu dźwięku jest `AudioContext.currentTime`. Wizualizacja tylko odczytuje pozycję `TransportClock`; opóźnienie klatki nie przesuwa dźwięku.

## Granice modułów

| Obszar | Odpowiedzialność | Nie powinien |
|---|---|---|
| `src/domain` | Model sesji, walidacja, rytm, LCM/GCD, harmonia | Znać DOM, Web Audio lub storage |
| `src/transport` | Pozycja cyklu oraz mapowanie pozycja ↔ czas audio | Tworzyć głosy audio |
| `src/audio` | Lifecycle `AudioContext`, scheduling i synteza | Renderować UI lub zapisywać stan |
| `src/ui` | Renderowanie kontrolek, obsługa zdarzeń i orkiestracja | Implementować matematykę czasu |
| `src/visual` | SVG koła, osi czasu i wielokątów oraz animacja wskaźnika | Sterować transportem |
| `src/persistence` | Bezpieczny odczyt/zapis `SessionState` oraz niezależnych preferencji wyglądu | Przyjmować niezwalidowany stan lub przekazywać preferencje do audio |
| `src/pwa.ts` | Instalacja, status offline i kontrolowana aktualizacja | Budować listę assetów |
| `scripts/build-sw.mjs` | Hash buildu i wygenerowanie precache | Zawierać logikę produktu |

`src/ui/app.ts` jest kompozycyjnym korzeniem i aktualnie najbardziej sprzężonym modułem. To akceptowalne przy skali MVP, ale nowa czysta logika nie powinna dalej powiększać tej klasy.

## Przepływ stanu

1. `App` wywołuje `loadSession()`.
2. JSON z `localStorage` przechodzi przez `isSession()`; niepoprawny zapis wraca do `defaultSession()`.
3. Kontrolka modyfikuje stan UI, a `commit()` przekazuje jego kopię do `AudioEngine`.
4. Silnik rekonfiguruje tylko to, co jest potrzebne, a UI renderuje się ponownie dla zmian strukturalnych.
5. Zatwierdzony stan jest zapisywany. Błąd zapisu nie zatrzymuje sesji bieżącej.

Stan ma `version: 1`. Każdy `RhythmLayer` przechowuje własny kolor `#RRGGBB`, dzięki czemu kolor podąża za warstwą przy zmianie kolejności tablicy `layers`. Odczyt starszej sesji v1 bez koloru uzupełnia go deterministycznie z wbudowanej palety przed walidacją. Dalsza zmiana kształtu wymaga jawnej decyzji: migracji starego zapisu albo bezpiecznego fallbacku, plus testów obu ścieżek.

Preferencje wyglądu są osobnym dokumentem `PreferencesState v1` pod kluczem `polyrhythmer.preferences.v1`. Zawierają aktywną paletę, lokalne własne definicje oraz wybór animacji wizualnej: wspólną wskazówkę albo osobne kropki warstw. Nie są częścią eksportowanej sesji i nie trafiają do `AudioEngine`. Starszy poprawny zapis bez wyboru animacji dostaje bezpieczną wartość `pointer`; uszkodzony zapis przywraca wbudowaną paletę, a użytkownik zawsze może wybrać bezpieczny wariant wbudowany.

Kierunek `SessionDocument v2` zdefiniowany w PLR-010 został zaakceptowany jako docelowa baza dla przenośnych sesji muzycznych. Implementacja pozostaje etapowa: najpierw ochrona zachowania v1, następnie czysty walidator/migrator, `SessionProject` i `RuntimePerformanceState`, a dopiero później przełączenie persistence. Nie należy łączyć tej migracji z implementacją mobile.

## Docelowa granica repozytoriów i backendu

Web/PWA oraz przyszłe aplikacje Capacitor Android/iOS pozostają w repozytorium `polyrhythmer`, ponieważ współdzielą domenę, UI, scheduler i adapter audio. Katalogi natywne są adapterami platformowymi, a nie osobnymi produktami. Nie planujemy osobnego repozytorium mobile ani przedwczesnego przenoszenia klienta do `apps/web`.

Przyszły backend powstanie dopiero dla zatwierdzonej funkcji konta, synchronizacji, subskrypcji lub telemetrii w osobnym repozytorium `polyrhythmer-api`. Domyślny stos to modularny monolit Django/DRF/PostgreSQL. API może przechowywać użytkowników, metadane i wersje `SessionDocument`, ale nie może znaleźć się na ścieżce krytycznej zegara, schedulera lub generowania dźwięku.

`SessionDocument` pozostaje kontraktem należącym do muzycznego core klienta. Przed pierwszym endpointem zapisującym dokument trzeba zdefiniować wersjonowany schemat, kanoniczne fixture'y i test zgodności klient–API. Osobne repozytorium kontraktów jest nieuzasadnione, dopóki nie pojawią się co najmniej dwa niezależne konsumery lub niezależny cykl wydania schematu.

## Przepływ czasu i audio

`TransportClock` przechowuje kotwicę czasu i pozycję wyrażoną w liczbie pełnych cykli. `configure()` najpierw oblicza aktualną pozycję, a dopiero potem zmienia długość cyklu, dlatego zmiana BPM zachowuje fazę.

`Scheduler`:

- budzi się co 25 ms;
- planuje 100 ms naprzód w czasie `AudioContext`;
- używa półotwartych okien, więc event na granicy trafia dokładnie do jednego okna;
- po throttlingu zaczyna od aktualnej pozycji i pomija spóźnione uderzenia;
- filtruje mute/solo przed przekazaniem eventu do `ClickVoices`.

Siatka LCM opisuje relacje rytmu i tabelę UI. Scheduler operuje na rzadkiej liście realnych uderzeń. Przykładowe 11:13:15:16 ma LCM 34320, ale tylko 55 zdarzeń na cykl.

`ClickVoices` tworzy krótko żyjący oscylator dla każdego kliknięcia i rozłącza node'y po `ended`. `DroneEngine` utrzymuje trzy głosy i jedno LFO; zmiana harmonii przestraja istniejące głosy, a Stop wygasza je przed rozłączeniem.

## PWA i offline

Tryb `dev` nie rejestruje service workera. `npm run build` wykonuje kolejno sprawdzenie TypeScript, build Vite i `scripts/build-sw.mjs`. Skrypt wylicza wersję cache z zawartości finalnych assetów i zapisuje `dist/sw.js`.

Nowy worker czeka na świadomą akcję użytkownika. UI nie wysyła `SKIP_WAITING`, gdy transport gra, aby uniknąć przeładowania w trakcie sesji. Starsze cache mogą pozostać potrzebne otwartym kartom i nie są agresywnie usuwane.

## Inwarianty i awarie

- Pauza zachowuje pozycję; Stop wraca do zera.
- Start wymaga działającego `AudioContext` i gestu użytkownika.
- Wstrzymanie kontekstu przez przeglądarkę pauzuje transport i informuje UI.
- Zmiana rytmu zatrzymuje stary scheduler i głosy, zachowuje pozycję, po czym startuje z niewielkim marginesem.
- Niepoprawny storage nie może przerwać startu aplikacji.
- Brak możliwości zapisu jest komunikatem, nie awarią bieżącej sesji.
- Przeglądarka może zatrzymać audio w tle; aplikacja nie obiecuje obejścia polityki systemu.

## Obserwowalność i testy

Projekt nie wysyła telemetrii. Lokalne sygnały diagnostyczne to status transportu/offline, błędy strony zbierane przez Playwright oraz licznik aktywnych głosów dostępny przez `AudioEngine.activeVoices`.

Vitest chroni matematykę, walidację i fazę zegara. Playwright sprawdza produkcyjny build, persistence, offline, ograniczenia warstw, błędny storage, layout i zwalnianie oscylatorów. Jakość dźwięku i lifecycle na urządzeniu wymagają [ręcznego QA](QA.md).
