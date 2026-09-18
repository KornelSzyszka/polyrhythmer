# Polyrhythmer

A local polyrhythmic metronome with SVG visualization, a tonal drone, and offline support. Vanilla TypeScript + Vite; no backend, accounts, analytics, or runtime dependencies.

## Running locally

Requirements: Node.js 22.12 or newer (verified with 24.16).

```powershell
npm ci
npm run dev
```

For a production build, including the service worker:

```powershell
npm run build
npm run preview
```

Open the URL printed by Vite. Wait for **Ready offline** before disconnecting from the network. The service worker is disabled in development mode.

## Features

- Presets 3:2, 4:3, 5:4, 7:4, and 7:5; four fixed layer slots, with 1–16 beats per layer and an enable switch for each slot. The first two slots are enabled by default.
- Tempo from 20–300 BPM, tap tempo, and a 1–16 quarter-note cycle. At 120 BPM with a four-quarter-note cycle, one full rotation takes two seconds. Layer counts divide this shared duration.
- Start/Pause preserves the current position. Stop returns to the beginning. Space controls transport when focus is on the page background.
- The compact layer panel exposes layer enable, colour, and beats per cycle. Four fixed layer cards fit without changing the panel size; disabling a layer preserves its settings.
- The drone follows the transport. Choose the root, octave, harmony, mode, filter, and stereo width. The mode determines the third in Triad harmony.
- The circle, timeline, and polygons show the same cycle. Polygon vertex count matches each layer's beat count. The Motion switch chooses one shared indicator or a separate smooth dot for every layer; the expanded table shows exact beat steps.
- Configuration is saved automatically on the device. Playback never resumes automatically after a refresh.

## Architecture

```text
UI → serializable SessionState → AudioEngine
                                  ├─ TransportClock → Scheduler → ClickVoices
                                  └─ DroneEngine
AudioContext.currentTime → TransportClock → SVG visualization
SessionState ↔ localStorage (version and range validation)
```

- `src/domain`: pure gcd/lcm, event, and harmony calculations plus configuration validation.
- `src/transport/clock.ts`: cycle position and audio-time mapping; tempo changes preserve phase.
- `src/audio`: one lazily created AudioContext; the scheduler wakes every 25 ms and plans 100 ms ahead. Timers are not the audio clock. Events missed during throttling are skipped to avoid a burst of overdue clicks.
- Rhythm changes cancel old voices, apply a short fade, and schedule new ones from the preserved position with a 15 ms margin. Editing may cause a short pause. The drone uses three fixed oscillators and an LFO, interpolates parameters, and disconnects nodes after release.
- `src/visual`: SVG updated through requestAnimationFrame, only as a consumer of clock position.
- `src/ui`: controls, validation, and coordination; it does not create audio nodes.
- `src/persistence`: corrupt or unknown storage falls back to 3:2. Storage errors do not stop the application.
- `scripts/build-sw.mjs`: precaches all build resources and derives the cache identifier from their contents. Updates require user action after transport stops. Old caches are retained for open tabs and can be cleared through site data settings.

The LCM grid is used for descriptions and the table; the scheduler uses a sparse list of actual beats, so patterns such as 11:13:15:16 do not create tens of thousands of empty events.

## Verification

```powershell
npm test
npx playwright install chromium
npm run build
npm run test:e2e
npm audit
```

Unit tests cover the rhythm grid, scheduler ordering and window boundaries, tuning, validation, and phase continuity. Playwright tests the production build: transport, drone, oscillator cleanup, limits, invalid storage, responsive layout, refresh, and offline startup.

E2E screenshots are written to `test-results/desktop.png` and `test-results/mobile.png`.

## Publishing and installation

Publish `dist/` on a static HTTPS host such as GitHub Pages or Cloudflare Pages. The build uses relative paths and can run from a subdirectory. Serve `sw.js` without a long HTTP cache; `assets/*` may use immutable caching. No SPA fallback rule is required beyond the precached document.

Chrome offers an install button when browser criteria are met. On iOS, use Safari → Share → Add to Home Screen. Audio requires a Start gesture. The first load must happen online, and the system may remove the cache.

## Scope and limitations

The functional MVP scope is implemented, along with tap tempo, modes, pan, filter, stereo width, a timeline, and four fixed layer slots. Optional reverb and the v2/v3 roadmap are not implemented: custom preset libraries, JSON import/export, swing, patterns, polymeter, MIDI, and recording.

**Physical-device acceptance remains required:** Android Chrome and iOS Safari, speaker/headphone listening, Bluetooth, screen lock, and 30 minutes of continuous operation. Automated Chromium does not replace this part of MVP-12. The operating system may suspend background audio; the application reports this state and lets the user resume playback.
