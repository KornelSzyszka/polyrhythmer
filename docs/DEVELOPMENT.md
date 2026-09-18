# Development

## Wymagania

- Node.js 22.12 lub nowszy; projekt był sprawdzany na Node.js 24.16.
- npm zgodny z `package-lock.json`.
- Chromium Playwright do testów E2E.

## Start lokalny

```powershell
npm ci
npm run dev
```

Vite nasłuchuje na `127.0.0.1`. Service worker jest celowo wyłączony w `dev`, więc zachowanie offline sprawdzaj na produkcyjnym preview.

## Komendy

| Komenda | Co sprawdza lub uruchamia |
|---|---|
| `npm run dev` | Serwer deweloperski Vite |
| `npm test` | Jednostkowe testy Vitest |
| `npm run build` | TypeScript, Vite i generator service workera |
| `npm run preview` | Lokalny serwer zawartości `dist/` |
| `npm run test:e2e` | Playwright przeciw produkcyjnemu preview |
| `npm audit` | Znane podatności zależności npm |

Przed pierwszym E2E:

```powershell
npx playwright install chromium
```

## Praca nad zmianą

1. Zidentyfikuj właściciela zachowania w [architekturze](ARCHITECTURE.md).
2. Dodaj lub zaktualizuj najwęższy test chroniący kontrakt.
3. Wprowadź małą zmianę bez przenoszenia odpowiedzialności między modułami przypadkiem.
4. Uruchom najpierw test wąski, potem build; E2E dla zmian integracyjnych.
5. Zaktualizuj dokumentację, jeśli zmieniły się komendy, kontrakty, granice lub QA.

## Mapa weryfikacji

| Zmieniony obszar | Minimalna weryfikacja |
|---|---|
| `src/domain`, `src/transport` | `npm test`, `npm run build` |
| `src/audio`, `src/ui`, `src/persistence` | `npm test`, `npm run build`, `npm run test:e2e` |
| PWA, manifest, assety, ścieżki | `npm run build`, `npm run test:e2e`, próba offline |
| CSS lub SVG | `npm run build`, E2E i zrzuty desktop/mobile |
| Zachowanie mobilne/audio | Powyższe oraz `docs/QA.md` na urządzeniach |

## Konwencje architektoniczne

- Utrzymuj `src/domain` jako czyste funkcje i typy.
- Nie używaj czasu ściennego ani timera JS jako zegara dźwięku.
- Nie umieszczaj obiektów Web Audio w `SessionState`.
- Waliduj każdy stan pochodzący ze storage przed użyciem.
- Dla zmiany schematu sesji zaprojektuj kompatybilność wersji przed implementacją.
- Zwalniaj oscylatory i rozłączaj node'y; test E2E ma chronić przed akumulacją głosów.
- Zachowuj względne ścieżki buildu, bo aplikacja może być publikowana w podkatalogu.

## Debugowanie

- Brak dźwięku: użyj przycisku Start, sprawdź stan `AudioContext` i komunikat transportu.
- Dryf obrazu wobec dźwięku: diagnozuj wizualizację oddzielnie; audio opiera się na `AudioContext.currentTime`.
- Seria kliknięć po powrocie do karty byłaby regresją schedulera — spóźnione eventy mają być pomijane.
- Offline nie działa w `dev`: wykonaj `npm run build`, potem `npm run preview` i poczekaj na „Gotowy offline”.
- Zapis wraca do 3:2: sprawdź `polyrhythmer.session.v1` oraz kontrakt `isSession()`.

## Publikacja

Artefaktem jest `dist/`. Hosting musi używać HTTPS dla PWA. `sw.js` nie powinien mieć długiego cache HTTP, natomiast hashowane assety mogą być serwowane jako immutable. Projekt nie wymaga reguły SPA fallback poza dokumentem głównym zawartym w precache.
