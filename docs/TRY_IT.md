# Uruchom i przetestuj Polyrhythmer

Polyrhythmer działa w przeglądarce. Całe obecne środowisko to aplikacja Vite: nie potrzebujesz backendu, bazy danych, Dockera, konta ani klucza API. To działający prototyp web/PWA; dokument nie oznacza odbioru planowanej aplikacji mobilnej.

## Przygotowanie jednorazowe — PowerShell

Otwórz terminal w folderze projektu. Na obecnym komputerze:

```powershell
Set-Location 'C:\Users\kszys\Desktop\Programming\Codex\Polyrhythmer'
node --version
npm --version
```

Na innym komputerze zamień wyłącznie ścieżkę na swój katalog. Projekt dokumentuje Node.js 22.12+; bieżące sprawdzenie wykonano na Node.js 24.16.0 i npm 11.13.0.

Jeśli zależności nie są zainstalowane albo zmienił się `package-lock.json`:

```powershell
npm ci
```

Nie wykonuj instalacji przed każdym startem. W bieżącej sesji wykorzystano istniejące `node_modules`; czystej instalacji nie powtarzano.

## Codzienna praca — Terminal 1

```powershell
Set-Location 'C:\Users\kszys\Desktop\Programming\Codex\Polyrhythmer'
npm run dev -- --port 5173 --strictPort
```

Pozostaw terminal uruchomiony. Po komunikacie Vite z adresem otwórz [http://127.0.0.1:5173/](http://127.0.0.1:5173/). Zmiany kodu są odświeżane przez Vite. Ten tryb nie obsługuje service workera; nie używaj go do odbioru offline.

## Test całego buildu, w tym offline — Terminal 1

To zalecany wariant do poniższego odbioru. Jeśli działa `dev`, zatrzymaj go przez **Ctrl+C**. Następnie:

```powershell
Set-Location 'C:\Users\kszys\Desktop\Programming\Codex\Polyrhythmer'
npm run build
```

Po pomyślnym zakończeniu buildu:

```powershell
npm run preview -- --port 4173 --strictPort
```

Otwórz [http://127.0.0.1:4173/](http://127.0.0.1:4173/). Preview serwuje ostatni build; po zmianie kodu trzeba ponownie wykonać build. Nie potrzebujesz drugiego serwera ani logowania. Porty 5173 i 4173 mają oddzielne dane przeglądarki — ustawienia z dev nie muszą pojawić się w preview.

`--strictPort` zapobiega cichej zmianie adresu, gdy port jest zajęty. W takiej sytuacji sprawdź istniejącą instancję zamiast uruchamiać kolejne procesy.

## Status, logi i zatrzymanie — Terminal 2

Nie zamykaj Terminala 1 podczas testu. W drugim PowerShell:

```powershell
(Invoke-WebRequest -Uri 'http://127.0.0.1:4173/').StatusCode
Get-NetTCPConnection -State Listen -LocalPort 4173 -ErrorAction SilentlyContinue |
    Select-Object LocalAddress, LocalPort, OwningProcess
```

Odpowiedź HTTP powinna wynosić `200`. Dla dev użyj portu 5173 w obu poleceniach. Logi serwera są w Terminalu 1, błędy aplikacji w przeglądarce: **F12 → Console**. Nie ma osobnej usługi do logów.

Zatrzymaj serwer przez **Ctrl+C w Terminalu 1**. Nie usuwaj `localStorage`, danych witryny ani cache w ramach zwykłego restartu. Po zatrzymaniu preview zapisana PWA może nadal otwierać się z cache — sam widok strony nie potwierdza, że serwer działa.

## Scenariusz podstawowy — około 5 minut

Użyj Chrome lub Edge, włącz dźwięk dla strony i zacznij od niskiej głośności. Nazwy kontrolek sprawdzono w kodzie UI. Testy Playwright nie potwierdzają tego, co słyszysz na swoim urządzeniu.

Scenariusz zmienia zapisane ustawienia. Jeśli chcesz zachować własną sesję, użyj osobnego profilu przeglądarki; nie czyść danych dotychczasowego profilu. Dla powtarzalnego początku wybierz **3:2**, ustaw **TEMPO: 120**, naciśnij Tab, ustaw **Długość wspólnego cyklu: 4 ♩** i wyłącz **Dron tonalny**, jeśli jest włączony.

| Krok | Co zrobić | Oczekiwany wynik |
|---|---|---|
| 1 | Otwórz adres preview | Nagłówek „Znajdź wspólny puls.”, dwie warstwy, przycisk „Start”; audio nie startuje samo |
| 2 | Przy powyższych ustawieniach kliknij „Start” | Pojawia się „Pauza” i „Odtwarzanie · zsynchronizowane”; cykl trwa 2,00 s, warstwy mają 3 i 2 uderzenia. Rytm potwierdź odsłuchem |
| 3 | W trakcie cyklu kliknij „Pauza”, odczekaj, kliknij „Start” | Dźwięk ustaje po pauzie, pozycja zostaje zachowana; Start wznawia |
| 4 | Kliknij kwadrat „■” (nazwa dostępności: „Stop”) | „Zatrzymano · początek cyklu”; kolejny Start zaczyna od początku |
| 5 | Wybierz „5:4”, potem „Start”, jeśli odtwarzanie jest zatrzymane | Warstwy mają 5 i 4 uderzenia na ten sam cykl |
| 6 | W Warstwie 1 kliknij „M”, potem ponownie „M” | Warstwa zostaje oznaczona jako wyciszona, potem przywrócona; zmianę dźwięku sprawdź odsłuchem |
| 7 | Wybierz nowy kolor Warstwy 1, potem kliknij strzałkę w dół przy „Kolejność” | Kolor od razu zmienia kartę, legendę i wizualizację; warstwa przechodzi na pozycję 2 razem ze swoim rytmem, barwą i kolorem |
| 8 | Kliknij „S” w Warstwie 1, potem wyłącz „S” | Słychać tylko warstwę solo, potem obie; warstwa z aktywnym M pozostaje wyciszona |
| 9 | Włącz przełącznik „Dron tonalny”, wybierz „TON PODSTAWOWY: F” | Przełącznik jest aktywny, F wybrane; podczas transportu powinien być słyszalny stały ton |
| 10 | Wybierz „HARMONIA: Trójdźwięk”; zmień „TRYB” z „Durowy” na „Molowy” | Ustawienia się zmieniają; różnicę harmonii i brak trzasków oceń słuchem |
| 11 | Kliknij „Oś czasu”, „Wielokąty”, następnie „Okrąg”; w każdym widoku przełącz „Ruch” z „Wskazówka” na „Kropki” | Zmienia się forma wizualizacji bez resetowania rytmu; aktywna jest wskazówka albo po jednej płynnej kropce na warstwę, nigdy oba warianty naraz |
| 12 | Kliknij „?” (nazwa dostępności: „Jak korzystać”), potem Escape | Otwiera się pomoc „Wiele rytmów, jeden cykl.”, Escape zamyka okno |
| 13 | Kliknij Stop i odśwież stronę | Kolejność, kolory i pozostałe ustawienia pozostają zapisane, widoczny jest Start; odtwarzanie nie wznawia się samo |
| 14 | Kliknij „Palety”, dodaj nazwę i wybierz kolory, następnie „Zapisz paletę” | Paleta staje się aktywna i pozostaje dostępna po odświeżeniu; transport nie pauzuje |

### Palety deweloperskie

Przycisk **Dev: wył.** przełącza trwały tryb deweloperski. Dopiero w trybie włączonym pojawia się **Palety**, które otwierają lokalne ustawienia deweloperskie. Możesz wybrać paletę aktywną, utworzyć własną, edytować ją albo usunąć. Wbudowane palety są nieusuwalne, ponieważ zapewniają bezpieczny wygląd po uszkodzonym zapisie. Dane są przechowywane wyłącznie w `localStorage` tego adresu i portu, pod kluczem niezależnym od sesji rytmu.

### Podział podpórki

Wybierz **Podział podpórki** pod długością wspólnego cyklu. Dostępne są: Wyłączona, Ćwierćnuty, Ósemki, Triola ósemkowa, Szesnastki, Kwintola i Sekstola. Wybrany wariant dodaje regularny klik referencyjny i pokazuje odpowiadające mu świetlne łuny w wizualizacji; mocniejsze łuny oznaczają ćwierćnuty. Długość cyklu, proporcje oraz znaczniki warstw pozostają bez zmian. Wyłączona usuwa łuny podpórki i zachowuje dotychczasowe brzmienie sesji.

Do powtórzenia: Stop → preset 3:2 → tempo 120 → cykl 4 ♩ → dron wyłączony. Preset odtwarza dwie warstwy z domyślnymi ustawieniami M/S, ale nie zeruje całej sesji.

## Walidacja i limity

| Czynność | Oczekiwany wynik |
|---|---|
| W TEMPO wpisz 301 i naciśnij Tab | „Podaj tempo od 20 do 300 BPM.”; potem wpisz 120 i Tab, aby usunąć błąd |
| Wybierz 3:2, kliknij dziesięć razy „+” przy nagłówku Warstwy rytmu | Dwanaście warstw, trzy zakładki i nieaktywny przycisk dodawania; nie myl go z przyciskiem zwiększania uderzeń |
| Na zakładce 1–4 przesuń Warstwę 4 w dół | Otwiera się zakładka 5–8, a przesunięta warstwa jest widoczna jako Warstwa 5 z zachowanym kolorem i ustawieniami |
| Ponownie wybierz 3:2 | Powrót do dwóch warstw |
| Włącz widok urządzenia w DevTools i ustaw szerokość 390 px | Brak poziomego przewijania całej strony; to emulacja układu, nie odbiór fizycznego telefonu |

## Offline w desktopowym Chromium

1. Użyj preview na porcie 4173, z dostępną siecią i uruchomionym serwerem. Poczekaj na **Gotowy offline**.
2. Otwórz **F12 → Network**. Z listy ograniczania sieci wybierz **Offline** (lokalizowane nazwy menu mogą się różnić).
3. Odśwież stronę. Powinna się załadować i pokazać **Tryb offline**.
4. Kliknij Start, potem Stop. UI powinien działać; dźwięk sprawdź samodzielnie.
5. Przywróć **No throttling / Bez ograniczeń**, odśwież i zakończ test.

Jeśli odświeżenie nie działa, sprawdź port, zakończenie precache i **Application → Service Workers**. Nie kasuj danych witryny jako pierwszego kroku diagnozy.

Na telefonie `127.0.0.1` oznacza sam telefon, a nie komputer. Ta instrukcja lokalna nie jest adresem do mobilnego odbioru PWA. Odbiór przez HTTPS, instalacja, blokada ekranu, Bluetooth i 30-minutowy odsłuch: [QA.md](QA.md). Publikacja oraz udostępnianie środowiska wymagają osobnego ustalenia.

## Automatyczna weryfikacja

Zatrzymaj ręczny preview, żeby Playwright uruchomił własny serwer na 4173. Z katalogu projektu:

```powershell
npm test
npm run build
npm run test:e2e
```

Jeżeli brakuje przeglądarki testowej, jednorazowo:

```powershell
npx playwright install chromium
```

Playwright sam uruchamia i zatrzymuje preview. Zapisuje obrazy `test-results/desktop.png` i `test-results/mobile.png`. Testy sprawdzają m.in. transport, zapis, offline, walidację i zwalnianie oscylatorów. Nie zastępują odsłuchu.

## Dowody aktualnego sprawdzenia

Sprawdzono 2026-09-18 na Windows:

- `npm test`: 44/44 testy.
- `npm run build`: TypeScript, Vite i generowanie service workera zakończone powodzeniem.
- `npm run test:e2e`: 11/11 scenariuszy Chromium; preview uruchamiane przez Playwright na porcie 4173.
- Komendy dev, instalacji i diagnostyki PowerShell wynikają z konfiguracji lub opisują procedurę; nie uruchamiano ich ponownie w tym odbiorze.

Kroki UI oparto na `src/ui/app.ts` i istniejących E2E. Nie każdy opisany krok jest objęty testem automatycznym. Fizyczny odsłuch i mobilne QA pozostają niewykonane; kontrolki dźwięku opisują oczekiwane zachowanie. To zapis konkretnej weryfikacji, nie gwarancja dla przyszłych zmian.
