import { cycleDuration } from '../domain/rhythm';
export class TransportClock {
  private anchorTime = 0;
  private anchorPosition = 0;
  duration = cycleDuration(90, 4);
  running = false;
  position(now: number): number {
    return (
      this.anchorPosition + (this.running ? Math.max(0, now - this.anchorTime) / this.duration : 0)
    );
  }
  start(at: number) {
    this.anchorTime = at;
    this.running = true;
  }
  pause(now: number) {
    this.anchorPosition = this.position(now);
    this.running = false;
  }
  stop() {
    this.running = false;
    this.anchorPosition = 0;
  }
  configure(now: number, bpm: number, beats: number) {
    this.anchorPosition = this.position(now);
    this.anchorTime = now;
    this.duration = cycleDuration(bpm, beats);
  }
  timeAt(position: number): number {
    return this.anchorTime + (position - this.anchorPosition) * this.duration;
  }
}
