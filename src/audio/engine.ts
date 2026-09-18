import type { SessionState } from '../domain/session';
import { TransportClock } from '../transport/clock';
import { ClickVoices } from './voices';
import { DroneEngine } from './drone';
import { Scheduler } from './scheduler';
export class AudioEngine {
  readonly clock = new TransportClock();
  private context?: AudioContext;
  private master?: GainNode;
  private clicks?: ClickVoices;
  private drone?: DroneEngine;
  private scheduler?: Scheduler;
  private generation = 0;
  onInterrupted: () => void = () => {};
  constructor(private state: SessionState) {
    this.state = structuredClone(state);
    this.clock.configure(0, state.bpm, state.cycleBeats);
  }
  get position() {
    return this.clock.position(this.context?.currentTime ?? 0);
  }
  get activeVoices() {
    return (this.clicks?.activeCount ?? 0) + (this.drone?.activeCount ?? 0);
  }
  async play() {
    const generation = ++this.generation;
    if (!this.context) {
      this.context = new AudioContext({ latencyHint: 'interactive' });
      this.master = this.context.createGain();
      this.master.gain.value = this.state.masterGain;
      this.master.connect(this.context.destination);
      this.clicks = new ClickVoices(this.context, this.master);
      this.drone = new DroneEngine(this.context, this.master);
      this.scheduler = new Scheduler(
        this.context,
        this.clock,
        this.clicks,
        () => this.state,
        (noteIndex, when) => this.drone?.accent(noteIndex, when),
      );
      this.context.onstatechange = () => {
        if (this.context?.state !== 'running' && this.clock.running) {
          this.pause();
          this.onInterrupted();
        }
      };
    }
    await this.context.resume();
    if (generation !== this.generation) return;
    if (this.context.state !== 'running')
      throw new Error('Przeglądarka wstrzymała audio. Naciśnij Start, aby spróbować ponownie.');
    if (this.clock.running) return;
    this.clock.start(this.context.currentTime + 0.025);
    this.drone!.update(this.state.drone, this.state.notePalette, true);
    this.scheduler!.start();
  }
  pause() {
    this.generation++;
    this.clock.pause(this.context?.currentTime ?? 0);
    this.scheduler?.stop();
    this.drone?.stop();
  }
  stop() {
    this.pause();
    this.clock.stop();
  }
  update(state: SessionState) {
    const rhythmChanged =
      state.bpm !== this.state.bpm ||
      state.cycleBeats !== this.state.cycleBeats ||
      state.subdivision !== this.state.subdivision ||
      JSON.stringify(state.layers) !== JSON.stringify(this.state.layers);
    this.state = state;
    const now = this.context?.currentTime ?? 0;
    if (rhythmChanged) {
      const playing = this.clock.running;
      this.scheduler?.stop();
      this.clock.pause(now);
      this.clock.configure(now, state.bpm, state.cycleBeats);
      if (playing) {
        this.clock.start(now + 0.015);
        this.scheduler!.start();
      }
    }
    this.master?.gain.setTargetAtTime(state.masterGain, now, 0.025);
    this.drone?.update(state.drone, state.notePalette, this.clock.running);
  }
}
