let ctx: AudioContext | null = null;
let buffer: AudioBuffer | null = null;
let loading: Promise<AudioBuffer | null> | null = null;

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

function decodeConfirm(): Promise<AudioBuffer | null> {
  const ac = audio();
  if (!ac) return Promise.resolve(null);
  if (buffer) return Promise.resolve(buffer);
  if (loading) return loading;
  loading = fetch("/sounds/confirm.mp3")
    .then((res) => {
      if (!res.ok) throw new Error("mp3");
      return res.arrayBuffer();
    })
    .then((arr) => ac.decodeAudioData(arr))
    .then((decoded) => {
      buffer = decoded;
      return decoded;
    })
    .catch(() =>
      fetch("/sounds/confirm.wav")
        .then((res) => res.arrayBuffer())
        .then((arr) => ac.decodeAudioData(arr))
        .then((decoded) => {
          buffer = decoded;
          return decoded;
        }),
    )
    .catch(() => null);
  return loading;
}

export function preloadSounds() {
  void decodeConfirm();
}

function playBuffer(decoded: AudioBuffer) {
  const ac = audio();
  if (!ac) return;
  const src = ac.createBufferSource();
  src.buffer = decoded;
  src.connect(ac.destination);
  src.start();
}

export function playKeyTone() {
  beep(880, 0, 0.07, 0.06, "square");
}

export function playFimTone() {
  const ac = audio();
  if (ac && ac.state === "suspended") void ac.resume();
  if (buffer) {
    playBuffer(buffer);
    return;
  }
  void decodeConfirm().then((decoded) => {
    if (decoded) playBuffer(decoded);
  });
}
