import type { ClickSoundState, RhythmLayer } from '../domain/session';
interface Voice {
  oscillator: OscillatorNode;
  gain: GainNode;
  pan?: StereoPannerNode;
  time: number;
}
export class ClickVoices {
  private voices = new Set<Voice>();
  constructor(
    private context: AudioContext,
    private output: AudioNode,
  ) {}
  get activeCount() {
    return this.voices.size;
  }
  play(layer: RhythmLayer, beat: number, time: number) {
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    const pan = this.context.createStereoPanner();
    const accent = beat === 0 && layer.accentFirst;
    const frequency = { wood: 750, sine: 1150, bell: 1650 }[layer.sound] * (accent ? 1.4 : 1);
    oscillator.type = layer.sound === 'wood' ? 'triangle' : 'sine';
    oscillator.frequency.setValueAtTime(frequency, time);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.65, time + 0.045);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(layer.gain * (accent ? 0.24 : 0.16), time + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.065);
    gain.gain.linearRampToValueAtTime(0, time + 0.075);
    pan.pan.value = layer.pan;
    oscillator.connect(gain).connect(pan).connect(this.output);
    const voice = { oscillator, gain, pan, time };
    this.voices.add(voice);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
      pan.disconnect();
      this.voices.delete(voice);
    };
    oscillator.start(time);
    oscillator.stop(time + 0.08);
  }
  playReference(time: number, beat: number, accent: boolean, settings: ClickSoundState) {
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    const baseFrequency = { soft: 420, wood: 560, glass: 880 }[settings.sound];
    const step = (beat % 3) - 1;
    const frequency =
      baseFrequency *
      2 ** (settings.pitch / 12) *
      2 ** ((step * settings.variation) / 1200) *
      (accent ? 1.32 : 1);
    oscillator.type = settings.sound === 'wood' ? 'triangle' : 'sine';
    oscillator.frequency.setValueAtTime(frequency, time);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(accent ? 0.12 : 0.055, time + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.045);
    gain.gain.linearRampToValueAtTime(0, time + 0.05);
    oscillator.connect(gain).connect(this.output);
    const voice = { oscillator, gain, time };
    this.voices.add(voice);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
      this.voices.delete(voice);
    };
    oscillator.start(time);
    oscillator.stop(time + 0.055);
  }
  cancel(now: number) {
    for (const voice of this.voices) {
      voice.gain.gain.cancelAndHoldAtTime(now);
      voice.gain.gain.linearRampToValueAtTime(0, now + 0.01);
      voice.oscillator.stop(now + 0.012);
    }
  }
}
