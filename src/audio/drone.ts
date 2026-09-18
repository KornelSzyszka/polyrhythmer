import { midiToHz, voicing } from '../domain/harmony';
import type { DroneState } from '../domain/session';
interface DroneVoice {
  oscillator: OscillatorNode;
  pan: StereoPannerNode;
}
export class DroneEngine {
  private voices: DroneVoice[] = [];
  private gain?: GainNode;
  private filter?: BiquadFilterNode;
  private lfo?: OscillatorNode;
  private modulation?: GainNode;
  private retiring = 0;
  constructor(
    private context: AudioContext,
    private output: AudioNode,
  ) {}
  get activeCount() {
    return this.voices.length + (this.lfo ? 1 : 0) + this.retiring;
  }
  update(state: DroneState, playing: boolean) {
    if (!playing || !state.enabled) {
      this.stop();
      return;
    }
    const now = this.context.currentTime;
    if (!this.gain) {
      this.gain = this.context.createGain();
      this.gain.gain.value = 0;
      this.filter = this.context.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.Q.value = 0.5;
      this.filter.connect(this.gain).connect(this.output);
      this.lfo = this.context.createOscillator();
      this.lfo.frequency.value = 0.12;
      this.modulation = this.context.createGain();
      this.modulation.gain.value = 35;
      this.lfo.connect(this.modulation).connect(this.filter.frequency);
      this.lfo.start();
    }
    const notes = voicing((state.octave + 1) * 12 + state.root, state.mode, state.chord);
    // Fixed three voices: retune and fade the bus; changing harmony never accumulates oscillators.
    if (!this.voices.length) {
      for (let i = 0; i < 3; i++) {
        const oscillator = this.context.createOscillator();
        oscillator.type = 'triangle';
        const pan = this.context.createStereoPanner();
        oscillator.connect(pan).connect(this.filter!);
        oscillator.frequency.value = midiToHz(notes[i % notes.length]);
        oscillator.detune.value = (i - 1) * 3;
        oscillator.start();
        this.voices.push({ oscillator, pan });
      }
    }
    this.voices.forEach((voice, i) => {
      voice.oscillator.frequency.setTargetAtTime(midiToHz(notes[i % notes.length]), now, 0.08);
      voice.pan.pan.setTargetAtTime((i - 1) * state.spread, now, 0.04);
    });
    this.filter!.frequency.setTargetAtTime(state.filterHz, now, 0.06);
    this.gain.gain.setTargetAtTime(state.gain * 0.12, now, 0.08);
  }
  stop() {
    if (!this.gain) return;
    const now = this.context.currentTime;
    const gain = this.gain,
      filter = this.filter!,
      lfo = this.lfo!,
      modulation = this.modulation!;
    const voices = this.voices;
    gain.gain.cancelAndHoldAtTime(now);
    gain.gain.linearRampToValueAtTime(0, now + 0.08);
    this.retiring += voices.length + 1;
    let remaining = voices.length + 1;
    const ended = () => {
      this.retiring--;
      remaining--;
      if (!remaining) {
        filter.disconnect();
        gain.disconnect();
        modulation.disconnect();
      }
    };
    for (const v of voices) {
      v.oscillator.onended = () => {
        v.oscillator.disconnect();
        v.pan.disconnect();
        ended();
      };
      v.oscillator.stop(now + 0.09);
    }
    lfo.onended = () => {
      lfo.disconnect();
      ended();
    };
    lfo.stop(now + 0.09);
    this.voices = [];
    this.gain = undefined;
    this.filter = undefined;
    this.lfo = undefined;
    this.modulation = undefined;
  }
}
