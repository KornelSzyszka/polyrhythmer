# Strategia realizacji Polyrhythmer

Stan: v0.1, 2026-09-17

## Cel operacyjny

Doprowadzić Polyrhythmer od działającego laboratorium webowego do wiarygodnego, płatnego instrumentu treningowego na iOS i Androidzie. Wersja 1.0 ma rozwiązywać pełny cykl praktyki: zbudować rytm, utrudnić ćwiczenie, kontrolowanie rozwinąć groove, zachować rezultat i wrócić do niego później.

Ten dokument łączy strategię produktu z wykonywaniem pracy. Wizję i zakres produktu definiuje `PRODUCT_VISION.md`, a rolę Foundera i bramki decyzyjne `FOUNDER_ROLE.md`.

## Hierarchia pracy

```text
Wizja produktu
    ↓
Strategiczne rezultaty i ryzyka
    ↓
Kamienie milowe
    ↓
Fale taktyczne
    ↓
Taski PLR
    ↓
Dowody: kod, test, pomiar, prototyp albo rozmowa z użytkownikiem
```

Task nie jest celem samym w sobie. Ma zmienić poziom pewności albo dojrzałości konkretnego rezultatu.

## Zasady strategiczne

1. **Wiarygodność muzyczna przed szerokością funkcji.** Stabilny timing, zrozumiały model rytmu i kontrolowana zmiana są ważniejsze niż długa lista możliwości.
2. **Narzędzie przed kursem.** Wersja 1.0 służy do ćwiczeń i improwizacji; materiały edukacyjne są późniejszą warstwą.
3. **Mobile do codziennego użycia, web do eksperymentu i pozyskania.** Nie wymuszamy identycznego zakresu obu kanałów.
4. **Deterministyczny core, wymienne adaptery.** Model domenowy i planowanie zdarzeń nie zależą od Web Audio, Capacitor ani natywnego backendu.
5. **Walidacja rynku równolegle do implementacji.** Nie czekamy z rozmowami i testem ceny do ukończenia aplikacji.
6. **Najpierw redukujemy ryzyko.** Trudne do odwrócenia decyzje poprzedzamy kontraktem, prototypem lub pomiarem.

## Strumienie strategiczne

| Strumień | Rezultat wersji 1.0 | Główne ryzyko |
|---|---|---|
| Produkt i rynek | potwierdzony problem, komunikat oraz akceptowalna cena | zbudowanie narzędzia bez wystarczającego popytu |
| Core rytmiczny | deterministyczny model sesji i przewidywalny planner zdarzeń | regresje muzyczne i niestabilna semantyka |
| Experience | szybki workflow `Build → Challenge → Evolve → Keep → Reuse` | złożoność blokująca ćwiczenie |
| Mobile i audio | wiarygodne zachowanie na fizycznym iOS i Androidzie | jitter, lifecycle, Bluetooth i ograniczenia tła |
| Komercjalizacja | jasna granica Free/Pro oraz zakup jednorazowy | tarcie sklepu i zła granica wartości |
| Release quality | powtarzalne QA, prywatność, recovery i gotowość sklepowa | utrata sesji lub publikacja niedojrzałego produktu |

Strumienie biegną równolegle, ale implementacja zależy od kontraktów, a release od dowodów z urządzeń i użytkowników.

## Kamienie milowe

### M0 — Fundament kierunku — zakończony

- odbiorca, problem, obietnica i zakres 1.0;
- hipoteza monetyzacji;
- analiza obecnego core i spike platformy mobilnej;
- system agentów, modeli, skilli i bramek Foundera.

Dowody: PLR-001–PLR-007 oraz PLR-016.

### M1 — Kontrakty i prototypy — aktualny

- testy charakterystyczne v1;
- kontrakt `SessionDocument v2`;
- prototyp głównych przepływów mobile;
- pakiet walidacji rynku i ceny.

Wyjście z M1 wymaga akceptacji semantyki muzycznej, modelu danych i głównego doświadczenia.

### M2 — Rdzeń gotowy do mobile

- czysty `EventPlanner` oddzielony od adapterów;
- migracja v1 → v2 i runtime performance state;
- diagnostyczny shell mobile;
- wykonane pomiary audio na urządzeniach;
- decyzja Web Audio versus natywny `AudioPort`.

### M3 — Funkcjonalne mobile alpha

- aktywna sesja: `Graj`, `Buduj`, `Improwizuj`;
- biblioteka lokalna, zapis wariantów i import/eksport;
- sceny A/B, automatyzacje i tryb występu w uzgodnionym zakresie;
- odzyskiwanie po lifecycle i błędach persistence;
- wewnętrzna dystrybucja testowa.

### M4 — Walidowana beta komercyjna

- testy z docelową grupą i iteracja najważniejszych problemów;
- ustalona granica Free/Pro i cena;
- płatność jednorazowa oraz restore purchase;
- macierz urządzeń i długie sesje zaliczone;
- Founder Beta gotowa do uruchomienia.

### M5 — Release 1.0

- wymagania sklepowe, prywatność, listing i materiały wsparcia;
- brak otwartych blockerów P0;
- bramka `release` zaakceptowana przez Foundera;
- obserwowalność pierwszych wydań i procedura hotfixu.

## Aktualna taktyka

### Fala A — ochrona, kontrakt, doświadczenie

Uruchamiamy równolegle maksymalnie trzy niezależne zadania:

1. PLR-008 — testy charakterystyczne silnika v1;
2. PLR-010 — kontrakt `SessionDocument v2`;
3. PLR-013 — prototyp przepływów mobile.

Founder reviewuje wszystkie trzy wyniki. PLR-010 wymaga bramek `musical` i `architecture`, a PLR-013 `experience` i `musical`.

### Fala B — planner, shell i walidacja

Po spełnieniu zależności:

- PLR-009 — wydzielenie `EventPlanner`;
- PLR-011 — diagnostyczny shell Capacitor;
- PLR-012 — protokół fizycznego QA audio;
- PLR-014 — pakiet walidacji rynku i ceny.

PLR-012 i PLR-014 mogą rozpocząć się wcześniej, jeżeli nie wypierają krytycznych zadań Fali A.

### Fala C — decyzja mobilnego audio

- PLR-015 — wykonanie testów na fizycznych urządzeniach;
- decyzja architektoniczna o adapterze audio;
- rozpisanie implementacji M2 i M3 na podstawie zaakceptowanych kontraktów.

Nie rozpisujemy szczegółowo całego mobile alpha przed M1, ponieważ kontrakt danych i prototyp UX mogą istotnie zmienić granice tasków.

## Workflow pojedynczego zadania

```text
backlog → ready → in_progress → review → done
                 ↘ blocked ↗
```

### Definition of Ready

Task może wejść w `ready`, gdy ma:

- jeden mierzalny rezultat i jednego właściciela;
- jawny zakres zapisu oraz rzeczy poza zakresem;
- zależności i zamkniętą listę `context_refs`;
- deliverable, kryteria odbioru i sposób weryfikacji;
- dobrany rozmiar, model, reasoning i skille;
- `founder_mode` i tylko rzeczywiście potrzebne `decision_gates`.

### Definition of Done

Task jest `done`, gdy:

- deliverable istnieje i spełnia kryteria odbioru;
- wykonano proporcjonalne testy, pomiar albo review;
- sekcja `Outcome` mówi, co faktycznie osiągnięto;
- decyzje trafiły do właściwego źródła prawdy;
- rejestr i zależne taski są zaktualizowane;
- nie ukryto blockerów ani niewykonanej weryfikacji.

## Rytm pracy w tym chacie

Każdy cykl pracy ma siedem kroków:

1. **Stan** — co jest potwierdzone, w toku i zablokowane.
2. **Największe ryzyko** — co obecnie najbardziej zagraża wartości lub wykonalności.
3. **Fala** — maksymalnie trzy równoległe rezultaty.
4. **Wykonanie** — agenci realizują zamknięte taski bez rozszerzania zakresu.
5. **Integracja** — koordynator sprawdza wyniki, zależności i wspólne źródła prawdy.
6. **Bramki Foundera** — Founder dostaje krótkie pakiety decyzji, nie surowe raporty.
7. **Aktualizacja** — statusy, postęp, ryzyka i następna fala.

W dowolnym momencie Founder może wejść w pairing, implementację lub review. Nie zmienia to obowiązku udokumentowania rezultatu i jego weryfikacji.

## Mierzenie postępu

Nie używamy procentu zamkniętych tasków jako procentu produktu. Każdy strumień oceniamy na podstawie dojrzałości rezultatu:

| Poziom | Znaczenie |
|---:|---|
| 0 | nieokreślony |
| 1 | zbadany, ale otwarty |
| 2 | zaprojektowany lub sprototypowany |
| 3 | zaimplementowany |
| 4 | zweryfikowany w warunkach docelowych |

Wagi wersji 1.0:

- produkt i rynek — 15%;
- core rytmiczny — 25%;
- experience i aplikacja — 25%;
- mobile/audio reliability — 15%;
- komercjalizacja — 10%;
- release quality — 10%.

Postęp aktualizujemy po kamieniu milowym albo gdy nowy dowód zmienia poziom któregoś strumienia. Bieżąca ocena wynosi około 25%; jest przedziałem decyzyjnym, nie metryką księgową.

## Reguły sterowania zakresem

- Nowy pomysł trafia najpierw do `later`, chyba że usuwa ryzyko aktualnego kamienia milowego.
- Rozszerzenie 1.0 wymaga wskazania, co zostaje przesunięte albo jaki dodatkowy koszt akceptujemy.
- Jeden task nie łączy migracji danych, nowej osi czasu, UI i adaptera platformy.
- Dwie nieudane próby tego samego rozwiązania uruchamiają eskalację, nie trzecią próbę bez zmiany hipotezy.
- Publikacja, wydatek i zewnętrzny kontakt wymagają osobnego zadania oraz właściwej bramki.
