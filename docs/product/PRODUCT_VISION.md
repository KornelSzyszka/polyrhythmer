# Polyrhythmer — wizja produktu

Stan: decyzja kierunkowa v0.1, 2026-09-17
Źródła robocze: PLR-002, PLR-003, PLR-004

## Produkt

Polyrhythmer jest mobilnym instrumentem treningowym do budowania, ćwiczenia i kontrolowanego rozwijania wielowarstwowych rytmów. Zajmuje miejsce pomiędzy metronomem a drum machine: daje więcej swobody niż klik, ale nie wymaga przygotowania sesji w DAW.

Pierwszym produktem komercyjnym jest aplikacja na iOS i Android. Web pozostaje bezpłatnym laboratorium do poznawania relacji rytmicznych, eksperymentowania i przekazywania konfiguracji do aplikacji mobilnej.

## Odbiorca

### Decyzja

Pierwszą grupą są średniozaawansowani i zaawansowani perkusiści, którzy regularnie korzystają z metronomu i ćwiczą niezależność, wewnętrzny puls, polirytmię albo nietypowe podziały.

### Rozszerzenie po walidacji

- basiści, gitarzyści, pianiści i inni instrumentaliści szukający podkładu szybszego do przygotowania niż DAW;
- nauczyciele przygotowujący ćwiczenia dla uczniów;
- producenci, jeśli późniejsza wersja otrzyma MIDI lub eksport do workflow DAW.

Początkujący oraz użytkownicy oczekujący kursu nie są głównym segmentem wersji 1.0.

## Problem użytkownika

Muzyk potrafi skonfigurować zwykły metronom, ale złożony układ rytmiczny wymaga wielu narzędzi albo czasochłonnego programowania w DAW. Podczas ćwiczenia potrzebuje szybko:

- zbudować kilka współzależnych warstw;
- odbierać sobie podpórki bez zatrzymywania sesji;
- zmieniać rytm w kontrolowany sposób;
- zachować udany wariant;
- wrócić do tej samej sesji na kolejnym treningu.

## Obietnica

> Buduj złożone rytmy, ćwicz wewnętrzny puls i rozwijaj groove podczas grania — bez uruchamiania DAW.

Hasło marki `Znajdź wspólny puls` pozostaje użyteczne dla webu, onboardingu i komunikacji wizualnej.

## Główna pętla

```text
Build → Challenge → Evolve → Keep → Reuse
```

1. **Build** — użytkownik tworzy wielowarstwowy pattern.
2. **Challenge** — wycisza, przesuwa lub automatyzuje podpórki.
3. **Evolve** — uruchamia kontrolowaną mutację w wybranych granicach.
4. **Keep** — zachowuje dobry wariant bez zatrzymywania transportu.
5. **Reuse** — wraca do zapisanej sesji podczas następnego ćwiczenia lub występu.

Kontrolowana ewolucja podczas grania jest głównym kandydatem na wyróżnik produktu. Losowość sama w sobie nie jest wartością; użytkownik określa, które warstwy i parametry mogą się zmieniać.

## Model aplikacji mobilnej

Główna nawigacja zawiera:

- **Sesja** — aktywny workspace z trybami `Graj`, `Buduj` i `Improwizuj`;
- **Biblioteka** — presety, ostatnie i zapisane sesje;
- **Ustawienia** — audio, zachowanie aplikacji, dostępność i dane lokalne.

Transport pozostaje dostępny we wszystkich trybach aktywnej sesji. Powracający użytkownik powinien uruchomić ostatnią konfigurację jednym świadomym dotknięciem `Start`. Transport nigdy nie startuje automatycznie po otwarciu aplikacji.

## Zakres wersji 1.0

### Produkt

- 2–4 warstwy rytmu;
- pattern per-step z pauzami i akcentami;
- polirytmia i polymetria;
- przesunięcie fazy i ograniczony swing;
- tempo automation, mute, solo i deterministyczny dropout;
- kontrolowana randomizacja z zapisywanym seedem;
- dwie sceny A/B i zmiany kwantyzowane do bezpiecznej granicy;
- dron tonalny jako część sesji;
- lokalna biblioteka, duplikowanie oraz import/eksport pliku;
- tryb występu chroniący przed przypadkową edycją;
- działanie offline.

### Poza wersją 1.0

- kursy i roadmapy edukacyjne;
- analiza gry z mikrofonu;
- MIDI, Ableton Link i integracje DAW;
- nagrywanie wielośladowe;
- konta, cloud sync i społeczność;
- marketplace presetów;
- gwarancja audio w tle przed potwierdzeniem zachowania na urządzeniach fizycznych.

## Mobile i web

### Mobile

Mobile odpowiada za codzienny workflow: bibliotekę, tryb występu, pełną edycję patternu, automatyzacje, sceny, kontrolowaną mutację i zachowywanie wariantów. Jest głównym kanałem monetyzacji.

### Web

Web daje natychmiastowy dostęp bez konta, bogatą wizualizację oraz eksperymentowanie z rytmem. Ma prowadzić użytkownika do mobile przez eksport, plik, link lub QR — dokładny mechanizm wymaga osobnego sprawdzenia limitów rozmiaru.

Web nie musi otrzymać pełnej biblioteki, trybu występu ani całego workflow automatyzacji.

## Model komercyjny

### Decyzja

- bez reklam i bez wymaganego konta;
- darmowa, użyteczna wersja mobile;
- jednorazowe odblokowanie Pro;
- brak subskrypcji w wersji 1.0.

### Hipoteza do walidacji

- Free: dwie warstwy, podstawowe akcenty, prosty gap click, podstawowy dron, kilka presetów i ograniczona biblioteka;
- Founder Pro: 19,99 EUR;
- docelowy Pro: 24,99 EUR, z testem 29,99 EUR po potwierdzeniu jakości trybu improwizacji;
- główny trigger Pro: pełny edytor, cztery warstwy, automatyzacje, sceny, kontrolowana mutacja i nieograniczona biblioteka.

Cena oraz dokładna granica Free/Pro pozostają hipotezami, dopóki nie przejdą eksperymentu z realnymi użytkownikami.

## Granice techniczne

Wspólny core mobile/web powinien być deterministyczny i niezależny od platformy:

```text
SessionDocument v2
        │ migracja + walidacja
        ▼
SessionProject + RuntimePerformanceState
        │
        ▼
EventPlanner
        │
        ├── Web Audio adapter
        └── mobile/native audio adapter, jeśli będzie potrzebny
```

Obecny Web Audio pozostaje referencyjnym adapterem. Przed wyborem technologii mobilnej należy sprawdzić na fizycznych urządzeniach latency, Bluetooth, lifecycle, blokadę ekranu i długą sesję. Model domenowy nie może zależeć od wyniku tego spike'a.

Rozwój rdzenia zaczyna się od testów charakterystycznych v1, wydzielenia czystego planera zdarzeń i dopiero potem migracji dokumentu sesji do v2. Nie łączymy migracji schematu, nowej osi czasu i mobilnego audio w jednym zadaniu.

## Walidacja produktu

Pierwsza walidacja obejmuje:

1. Test trzech komunikatów i cen 14,99 / 24,99 / 29,99 EUR na stronie webowej.
2. Dwanaście moderowanych sesji z perkusistami, w tym test zbudowania rytmu, odebrania podpórki, mutacji i zachowania wariantu.
3. Płatny Founder Beta: 30 miejsc po 19,99 EUR lifetime.

Sygnały wymagające zmiany kierunku:

- użytkownicy chcą głównie gap click — rozważyć prostszy produkt;
- dominują producenci — zweryfikować płatne zainteresowanie MIDI i eksportem;
- najwyższą konwersję mają nauczyciele — przesunąć priorytet na udostępniane sety i teacher pack.

## Otwarte decyzje

- Dokładny model patternu, akcentu, velocity, fazy i wspieranych siatek swing.
- Granica stosowania edycji podczas odtwarzania: krok, puls czy cykl.
- Zakres scen A/B: pattern, mix i dron albo mniejszy snapshot.
- Technologia aplikacji mobilnej i potrzeba natywnego adaptera audio.
- Podstawowa metoda współdzielenia w 1.0: plik/share sheet czy ograniczony link/QR.
- Finalna granica Free/Pro i cena po walidacji.

Te decyzje mają własne zadania. Nie blokują rozpoczęcia prototypu nawigacji ani testów charakterystycznych obecnego silnika.
