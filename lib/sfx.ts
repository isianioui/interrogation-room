let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();
  }
  return ctx;
}

function beep(frequency: number, durationMs: number, delayMs = 0, volume = 0.15) {
  const audioCtx = getContext();
  if (!audioCtx) return;
  const startTime = audioCtx.currentTime + delayMs / 1000;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "square";
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + durationMs / 1000);

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(startTime);
  osc.stop(startTime + durationMs / 1000 + 0.02);
}

/** Sharp double-beep played when a contradiction is caught. */
export function playContradictionAlert() {
  beep(880, 120, 0);
  beep(660, 140, 140);
}

/** Soft click for general UI actions. */
export function playClick() {
  beep(440, 60, 0, 0.08);
}

/** Low buzz for a bad outcome (guilty verdict, evidence hit). */
export function playBuzz() {
  beep(160, 300, 0, 0.12);
}

/** Bright chime for a good outcome (released verdict). */
export function playChime() {
  beep(523, 120, 0, 0.1);
  beep(659, 120, 100, 0.1);
  beep(784, 200, 200, 0.1);
}
