# Rola Foundera w Polyrhythmer

## Nazwa roli

**Founder, Technical Product Owner & Musical Director**

Founder łączy odpowiedzialność produktową i muzyczną z aktywną kompetencją techniczną. Może projektować architekturę, implementować, debugować, pisać testy i wykonywać code review. Nie jest jednak domyślnym wykonawcą pracy, którą może samodzielnie zamknąć zespół agentów.

## Odpowiedzialność

Founder odpowiada ostatecznie za:

- kierunek produktu, kolejność problemów i zakres wersji;
- jakość muzyczną, użyteczność ćwiczeń i odczucie rytmu;
- decyzje techniczne o wysokim koszcie odwrócenia lub dużym blast radius;
- model biznesowy, cenę, wydatki i publiczne obietnice;
- akceptację doświadczenia użytkownika i decyzję o publikacji.

Zespół agentów odpowiada za przygotowanie dowodów, rekomendacji, implementacji, testów, dokumentacji i utrzymanie rejestru zadań.

## Sposoby udziału

Founder może wejść w zadanie w jednym z czterech trybów:

| Tryb | Znaczenie |
|---|---|
| `informed` | Otrzymuje wynik; praca nie czeka na jego udział. |
| `consulted` | Dostarcza kontekst domenowy lub techniczny przed domknięciem rozwiązania. |
| `reviewer` | Ocenia gotowy rezultat, kod lub prototyp. |
| `owner` | Świadomie przejmuje wykonanie albo pairing przy konkretnym zadaniu. |

`owner` nigdy nie jest zakładany na podstawie samej kompetencji technicznej Foundera. Musi zostać jawnie ustawiony w tasku albo uzgodniony podczas pracy.

## Zasady współpracy

1. Agent samodzielnie wykonuje analizę i odwracalne prace mieszczące się w zaakceptowanym zakresie.
2. Agent nie przekazuje Founderowi wyszukiwania plików, rutynowego debugowania, przygotowania dokumentacji ani decyzji możliwej do rozstrzygnięcia zapisanymi kryteriami.
3. Founder może zaproponować kod lub rozwiązanie, ale agent nadal sprawdza je testami i zapisuje konsekwencje.
4. Spór techniczny rozstrzygamy dowodami: działającym eksperymentem, testem, pomiarem albo małym spike'em. Gdy dowody nie wystarczają, decyzję podejmuje Founder.
5. Agent zatrzymuje tylko część pracy zależną od bramki. Pozostałe bezpieczne i odwracalne elementy mogą postępować dalej.
6. Zmiana wcześniejszej decyzji jest dozwolona, lecz musi aktualizować właściwe źródło prawdy i zależne taski.

## Bramki decyzyjne

| Bramka | Kiedy jest wymagana | Typowe przykłady |
|---|---|---|
| `product` | Zmiana odbiorcy, problemu, zakresu lub priorytetu wydania | funkcja w 1.0, usunięcie głównego use case'u |
| `experience` | Zmiana głównego przepływu albo zachowania podczas aktywnej sesji | transport, edycja podczas gry, zapis wariantu |
| `musical` | Zmiana semantyki lub odczucia muzycznego | swing, phase, akcent, reguły improwizacji |
| `business` | Cena, monetyzacja, wydatek lub publiczna obietnica | Free/Pro, zakup jednorazowy, kampania |
| `architecture` | Decyzja trudna do odwrócenia lub przecinająca kluczowe granice | model sesji, backend audio, platforma mobile |
| `release` | Publikacja, dystrybucja albo nieodwracalna operacja zewnętrzna | App Store, Google Play, produkcyjny deploy |

Bramka nie służy do zatwierdzania każdej małej decyzji. Task określa `founder_mode` oraz `decision_gates`; pusta lista oznacza brak obowiązkowej decyzji Foundera.

## Format decyzji dla Foundera

Agent przekazuje możliwie krótki pakiet:

```markdown
Decision: jedno zdanie
Recommendation: jedna rekomendowana opcja
Evidence: maksymalnie 3 najważniejsze fakty lub wyniki
Alternative: najsilniejsza realna alternatywa
Consequences: koszt, ryzyko i co ta decyzja odblokowuje
Founder answer needed: konkretna odpowiedź lub wybór
```

Szczegóły i pełne dowody pozostają w tasku lub jego deliverable. Po decyzji agent zapisuje wynik w źródle prawdy i aktualizuje zależności.
