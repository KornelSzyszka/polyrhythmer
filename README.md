# Synesterra

Synesterra is a browser-based rhythm and harmony instrument. It combines the **Polyrhythmer** rhythm workspace, the **Resonara** drone and harmonic progression workspace, synchronized SVG visualization, and offline PWA support.

The project is implemented in vanilla TypeScript and Vite. It has no backend, accounts, analytics, or runtime dependencies.

## Run locally

Requirements: Node.js 22.12 or newer (verified with Node.js 24.16).

```powershell
npm ci
npm run dev
```

Open the URL printed by Vite. Development mode does not register the service worker.

To exercise the production build and offline shell:

```powershell
npm run build
npm run preview
```

Wait until the offline status is ready before disconnecting from the network.

## Product model

Synesterra has three named layers:

- **Synesterra** is the complete instrument and repository.
- **Polyrhythmer** is the rhythm workspace: four fixed layer slots, presets, support subdivision, click synthesis, tempo, and transport.
- **Resonara** is the harmony workspace: scale context, tonal drone, sparse common-step progression, voicing, filter, and stereo width.

The current web/PWA includes:

- four persistent rhythm-layer slots with enable switches, 1–16 beats per cycle, individual colours, and presets;
- 20–300 BPM, tap tempo, a 1–16 quarter-note common cycle, and optional reference subdivisions;
- configurable click character, pitch variation, master gain, drone harmony, and per-note colour/timbre;
- circle, timeline, and polygon views driven by the same transport clock;
- sparse harmonic changes anchored to common steps;
- English, Polish, German, Italian, Spanish, and Brazilian Portuguese UI preferences;
- built-in and custom visual themes, including twelve note colours;
- local persistence and an installable offline shell.

Playback never starts automatically after a refresh.

## Architecture

```text
UI → serializable SessionState → AudioEngine
                                  ├─ TransportClock → Scheduler → ClickVoices
                                  └─ DroneEngine
AudioContext.currentTime → TransportClock → SVG visualization
SessionState ↔ validated localStorage
PreferencesState ↔ validated localStorage
Vite build → build-sw.mjs → versioned offline cache
```

- `src/domain` owns serializable music state, validation, rhythm, harmony, and colour calculations.
- `src/transport/clock.ts` owns cycle position and audio-time mapping; tempo changes preserve phase.
- `src/audio` owns the `AudioContext`, look-ahead scheduling, click voices, and drone voices.
- `src/visual` renders SVG and observes transport position without controlling it.
- `src/persistence` validates stored sessions and appearance preferences before use.
- `src/theme` and `src/i18n` own presentation contracts without entering the audio path.
- `src/ui/app.ts` is the composition root for controls, persistence, audio, and rendering.
- `scripts/build-sw.mjs` precaches the final Vite output under a content-derived cache version.

The LCM grid describes relationships and labels. Audio scheduling uses a sparse list of actual events, so coprime patterns do not allocate every empty grid step.

## Local data compatibility

Current data is stored under `synesterra.session.v1` and `synesterra.preferences.v1`. Valid data created before the repository rename is still read from `polyrhythmer.session.v1` and `polyrhythmer.preferences.v1`, then copied to the current keys. Legacy keys are intentionally retained as a rollback-safe fallback.

## Verification

```powershell
npm run check
npx playwright install chromium
npm run check:e2e
npm audit
```

`npm run check` covers TypeScript, ESLint, Prettier, and Vitest. `npm run check:e2e` builds the production PWA and runs Playwright against `127.0.0.1:4173`.

Browser automation covers transport, persistence and legacy migration, offline startup, responsive layout, themes, harmonic views, and audio-node cleanup. It does **not** prove sound quality, Bluetooth behavior, background playback, lock-screen behavior, or long-session reliability on physical Android/iOS devices.

## Publishing

Publish `dist/` to a static HTTPS host. The build uses relative paths and can run from a subdirectory. Serve `sw.js` without a long HTTP cache; fingerprinted assets may be immutable. No SPA fallback beyond the precached document is required.

Chrome can offer installation when its PWA criteria are met. On iOS, use Safari → Share → Add to Home Screen. Audio requires an explicit Start gesture, and the first load must happen online.

## Scope

The repository contains the shared web/PWA client and is the intended home for future Capacitor adapters. A future backend, if justified by accounts, synchronization, subscriptions, or telemetry, remains a separate concern and must never sit on the real-time audio path.

Planned mobile/product work still includes portable session import/export, a local library, performance workflows, controlled evolution, physical-device audio validation, and store delivery. Automated Chromium is not a substitute for those release gates.
