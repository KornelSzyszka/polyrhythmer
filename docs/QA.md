# Odbiór na urządzeniach

Poniższe punkty wymagają fizycznego urządzenia i odsłuchu. Nie zostały oznaczone jako wykonane na podstawie testów DOM.

## Android Chrome oraz iOS Safari

- [ ] Wejdź przez HTTPS, poczekaj na „Gotowy offline”, zainstaluj na ekranie głównym.
- [ ] Włącz tryb samolotowy, zamknij i ponownie otwórz aplikację. Uruchom 3:2, potem 5:4.
- [ ] Zmieniaj BPM 20 → 90 → 300. Warstwy mają wspólny początek i nie dryfują względem siebie.
- [ ] Sprawdź Pauza → Start oraz Stop → Start. Pauza zachowuje pozycję, Stop ją zeruje.
- [ ] Sprawdź wszystkie barwy, akcent, mute, solo i panoramę w słuchawkach.
- [ ] Włącz dron, zmieniaj ton i harmonię podczas grania. Sprawdź fade i brak trzasków po Stop.
- [ ] Sprawdź poziom głośności przy czterech warstwach i dronie.
- [ ] Zablokuj ekran i przejdź do innej aplikacji. Jeśli system przerwie audio, wróć i użyj Start.
- [ ] Wykonaj 30-minutową sesję; sprawdź drop-outy, temperaturę urządzenia i pamięć.
- [ ] Powtórz odsłuch przez Bluetooth; zanotuj opóźnienie obrazu względem dźwięku.
- [ ] Sprawdź VoiceOver/TalkBack, focus klawiatury i redukcję ruchu.
- [ ] Wgraj nowy build. Przycisk nowej wersji nie powinien przeładować strony podczas odtwarzania.

## Granice gwarancji

Audio jest planowane zegarem Web Audio w aktywnej karcie. Przeglądarka ani PWA nie gwarantują grania przy zablokowanym ekranie. Wizualizacja jest orientacyjna: urządzenie wyjściowe, szczególnie Bluetooth, może dodawać opóźnienie. Cache offline i localStorage są lokalnymi danymi witryny; usunięcie danych usuwa też sesję.
