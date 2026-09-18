import { eventsInWindow, rhythmEvents, subdivisionEvents } from '../domain/rhythm';
import type { SessionState } from '../domain/session';
import { TransportClock } from '../transport/clock';
import { ClickVoices } from './voices';
export class Scheduler {
  private timer?: ReturnType<typeof setInterval>;
  private cursor = 0;
  constructor(
    private context: AudioContext,
    private clock: TransportClock,
    private voices: ClickVoices,
    private state: () => SessionState,
  ) {}
  start() {
    this.cursor = this.clock.position(this.context.currentTime);
    this.tick();
    this.timer = setInterval(() => this.tick(), 25);
  }
  stop() {
    clearInterval(this.timer);
    this.timer = undefined;
    this.voices.cancel(this.context.currentTime);
  }
  private tick() {
    if (!this.clock.running || this.context.state !== 'running') return;
    const now = this.context.currentTime;
    const state = this.state();
    // Drop missed events after background throttling; never burst overdue notes.
    const from = Math.max(this.cursor, this.clock.position(now));
    const to = this.clock.position(now + 0.1);
    const layers = state.layers.filter((l) => l.enabled);
    const solo = layers.some((l) => l.solo);
    for (const event of eventsInWindow(
      subdivisionEvents(state.cycleBeats, state.subdivision),
      from,
      to,
    )) {
      this.voices.playReference(
        this.clock.timeAt(event.cyclePosition),
        event.beat % state.subdivision === 0,
      );
    }
    for (const event of eventsInWindow(rhythmEvents(layers), from, to)) {
      const layer = layers.find((l) => l.id === event.layerId)!;
      if (!layer.muted && (!solo || layer.solo))
        this.voices.play(layer, event.beat, this.clock.timeAt(event.cyclePosition));
    }
    this.cursor = to;
  }
}
