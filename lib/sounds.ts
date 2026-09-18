let ctx: AudioContext | null = null;

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

export function playKeyTone() {
  beep(880, 0, 0.07, 0.06, "square");
}

export function playConfirmTone() {
  beep(1480, 0, 0.12, 0.14, "square");
}

export function playFimTone() {
  const notes = [1568, 1568, 1865, 1568, 2093, 1865, 1568];
  notes.forEach((freq, i) => {
    beep(freq, i * 0.11, 0.1, 0.16, "square");
  });
  beep(2489, 0.82, 0.35, 0.18, "square");
}
