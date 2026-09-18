# Polyrhythmer

Lokalny metronom polirytmiczny z wizualizacją SVG, dronem tonalnym i obsługą offline. Vanilla TypeScript + Vite; bez backendu, kont, analityki i zależności runtime.

## Uruchomienie

Pełna instrukcja z katalogiem, komendami, zatrzymaniem i krokami UI: [Uruchom i przetestuj](docs/TRY_IT.md).

Wymagany Node.js 22.12+ (sprawdzono na 24.16).

```powershell
npm ci
npm run dev
```

Tryb produkcyjny, w tym service worker:

```powershell
npm run build
npm run preview
```

Otwórz adres wyświetlony przez Vite. Poczekaj na **Gotowy offline** przed odłączeniem sieci. Service worker jest wyłączony w trybie `dev`.

## Obsługa

- Presety 3:2, 4:3, 5:4, 7:4 i 7:5; od 2 do 4 warstw, od 1 do 16 uderzeń każdej warstwy.
- Tempo 20–300 BPM, tap tempo, cykl 1–16 ćwierćnut. Przy 120 BPM i cyklu 4 ćwierćnut pełny obrót trwa 2 sekundy. Liczby warstw dzielą ten wspólny czas.
- Start/Pauza zachowuje pozycję. Stop wraca do początku. Spacja steruje transportem, kiedy fokus jest na tle strony.
- Każda warstwa ma barwę, głośność, akcent, panoramę, mute i solo. Mute ma pierwszeństwo przed solo.
- Dron gra wraz z transportem. Wybierz ton, oktawę, harmonię, tryb, filtr i szerokość stereo. Tryb określa tercję przy harmonii „Trójdźwięk”.
- Okrąg, oś czasu i wielokąty pokazują ten sam cykl. W widoku wielokątów liczba wierzchołków odpowiada liczbie uderzeń warstwy. Przełącznik „Ruch” wybiera jedną wspólną wskazówkę albo osobną płynną kropkę dla każdej warstwy; rozwijana tabela podaje dokładne kroki uderzeń.
- Konfiguracja zapisuje się automatycznie na urządzeniu. Odtwarzanie nigdy nie wznawia się samo po odświeżeniu.

## Architektura

```text
UI → serializowalny SessionState → AudioEngine
                                  ├─ TransportClock → Scheduler → ClickVoices
                                  └─ DroneEngine
AudioContext.currentTime → TransportClock → wizualizacja SVG
SessionState ↔ localStorage (walidacja wersji i zakresów)
```

- `src/domain`: czyste obliczenia gcd/lcm, eventów i harmonii oraz walidacja konfiguracji.
- `src/transport/clock.ts`: pozycja cyklu i mapowanie jej na czas audio; tempo zachowuje fazę.
- `src/audio`: jeden leniwie tworzony AudioContext; scheduler budzi się co 25 ms i planuje 100 ms naprzód. Timer nie jest zegarem dźwięku. Przegapione eventy po throttlingu są pomijane, aby uniknąć serii zaległych kliknięć.
- Zmiana rytmu anuluje stare głosy, stosuje krótki fade i planuje nowe od zachowanej pozycji z 15 ms marginesem. Może wystąpić krótka przerwa przy edycji. Dron ma stałe trzy oscylatory i LFO, interpoluje parametry i rozłącza node’y po wygaszeniu.
- `src/visual`: SVG aktualizowany przez requestAnimationFrame, wyłącznie jako odbiorca pozycji zegara.
- `src/ui`: kontrolki, walidacja i koordynacja; nie tworzy node’ów audio.
- `src/persistence`: uszkodzony lub nieznany zapis wraca do 3:2. Błąd zapisu nie zatrzymuje aplikacji.
- `scripts/build-sw.mjs`: precache kompletu zasobów buildu, identyfikator cache na podstawie treści. Aktualizacja wymaga działania użytkownika po zatrzymaniu transportu. Stare cache są zachowywane dla otwartych kart; można je wyczyścić przez ustawienia danych witryny.

Siatka LCM służy do opisu i tabeli; scheduler używa rzadkiej listy faktycznych uderzeń, więc nawet 11:13:15:16 nie tworzy dziesiątek tysięcy pustych eventów.

## Weryfikacja

```powershell
npm test
npx playwright install chromium
npm run build
npm run test:e2e
npm audit
```

Unit testy sprawdzają siatkę rytmu, kolejność i granice okien schedulera, strojenie, walidację i ciągłość fazy. Playwright sprawdza rzeczywisty produkcyjny build: transport, dron, zwalnianie oscylatorów, limity, błędny storage, układ mobilny, odświeżenie i start offline.

Zrzuty ekranu: `test-results/desktop.png` i `test-results/mobile.png` po testach E2E.

## Publikacja i instalacja

Publikuj zawartość `dist/` na hostingu statycznym z HTTPS (np. GitHub Pages lub Cloudflare Pages). Build używa względnych ścieżek, więc może działać w podkatalogu. Serwuj `sw.js` bez długiego cache HTTP; dla `assets/*` można ustawić cache immutable. Nie ma routingu wymagającego reguł SPA.

Chrome oferuje przycisk instalacji, gdy spełnione są kryteria przeglądarki. Na iOS: Safari → Udostępnij → Do ekranu początkowego. Audio wymaga gestu Start. Pierwsze pobranie musi nastąpić online, a cache może zostać usunięty przez system.

## Zakres i ograniczenia

Zaimplementowano funkcjonalny zakres MVP z dokumentu oraz tap tempo, tryby, panoramę, filtr, szerokość stereo i oś czasu. Nie zaimplementowano opcjonalnego pogłosu ani roadmapy v2/v3: biblioteki własnych presetów, importu/eksportu JSON, swingu, patternów, polimetrii, MIDI i nagrywania.

**Do odbioru na fizycznych urządzeniach:** Android Chrome i iOS Safari, odsłuch na głośniku/słuchawkach, Bluetooth, blokada ekranu i 30 minut ciągłej pracy. Automatyczny Chromium nie zastępuje tej części MVP-12. System operacyjny może wstrzymywać audio w tle; aplikacja pokazuje ten stan i pozwala wznowić odtwarzanie.

Lista odbioru: [docs/QA.md](docs/QA.md).

## Dokumentacja

- [Indeks dokumentacji](docs/README.md)
- [Architektura i przepływy](docs/ARCHITECTURE.md)
- [Development i weryfikacja](docs/DEVELOPMENT.md)
- [Odbiór na urządzeniach](docs/QA.md)

Wzorce techniczne: [planowanie Web Audio w MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques), [aktualizacja service workera](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/skipWaiting), [Vite](https://vite.dev/guide/static-deploy).
