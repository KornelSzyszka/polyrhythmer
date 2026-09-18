# Dokumentacja Polyrhythmer

- [Uruchom i przetestuj](TRY_IT.md) — gotowe komendy PowerShell, adres aplikacji i scenariusze do przeklikania.

- [Wizja produktu](product/PRODUCT_VISION.md) — odbiorca, obietnica, zakres 1.0, model komercyjny i granice mobile/web.
- [Rola Foundera](product/FOUNDER_ROLE.md) — odpowiedzialność produktowa, muzyczna i techniczna oraz bramki decyzyjne.
- [Strategia realizacji](product/DELIVERY_STRATEGY.md) — kamienie milowe, fale taktyczne, workflow i mierzenie postępu.
- [Architektura](ARCHITECTURE.md) — granice modułów, przepływy, stan i inwarianty czasu audio.
- [Development](DEVELOPMENT.md) — środowisko, komendy, zasady zmian i mapa testów.
- [Odbiór na urządzeniach](QA.md) — ręczna checklista Android/iOS, audio, Bluetooth i offline.

Szybkie uruchomienie, opis funkcji i zakres produktu pozostają w głównym [README](../README.md).

## Źródła prawdy

- Komendy: `package.json`.
- Kontrakt sesji: `src/domain/session.ts`.
- Matematyka rytmu: `src/domain/rhythm.ts`.
- Czas transportu: `src/transport/clock.ts`.
- Orkiestracja audio: `src/audio/engine.ts`.
- Manualny odbiór urządzeń: `docs/QA.md`.
