let ctx: AudioContext | null = null;
let fimAudio: HTMLAudioElement | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function beep(frequency: number, start: number, duration: number, gain = 0.12, type: OscillatorType = "square") {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  g.gain.setValueAtTime(gain, ac.currentTime + start);
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + duration);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start(ac.currentTime + start);
  osc.stop(ac.currentTime + start + duration + 0.02);
}

export function preloadSounds() {
  if (typeof window === "undefined") return;
  if (!fimAudio) {
    fimAudio = new Audio("/sounds/confirm.mp3");
    fimAudio.preload = "auto";
  }
}

export function playKeyTone() {
  beep(880, 0, 0.07, 0.06, "square");
}

export function playFimTone() {
  preloadSounds();
  if (!fimAudio) return;
  fimAudio.pause();
  fimAudio.currentTime = 0;
  void fimAudio.play();
}
