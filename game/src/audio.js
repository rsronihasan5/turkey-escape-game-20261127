// audio.js — every sound is synthesized with WebAudio, no audio files.
// One job: bleeps, gobbles and a little Thanksgiving tune, plus mute.
let ctx = null;
let muted = false;
let musicTimer = null;
let musicStep = 0;

// A plain, original little tune in C major pentatonic, looped.
const MELODY = [
  523, 0, 587, 659, 0, 659, 587, 523, 440, 0, 523, 587, 659, 0, 784, 659,
  587, 523, 587, 659, 587, 440, 0, 392, 440, 523, 0, 0,
];

function ensureCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, dur, type, vol, when = 0, slideTo = 0) {
  if (muted) return;
  const ac = ensureCtx();
  if (!ac) return;
  const t0 = ac.currentTime + when;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo > 0) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export const sfx = {
  init() { ensureCtx(); },
  isMuted() { return muted; },
  toggleMute() {
    muted = !muted;
    if (muted) this.stopMusic();
    return muted;
  },
  gobble() {
    tone(320, 0.09, 'square', 0.12);
    tone(240, 0.09, 'square', 0.12, 0.1);
    tone(300, 0.12, 'square', 0.12, 0.2);
  },
  coin() {
    tone(880, 0.08, 'sine', 0.14);
    tone(1318, 0.16, 'sine', 0.12, 0.07);
  },
  spotted() {
    tone(220, 0.16, 'sawtooth', 0.16, 0, 440);
    tone(440, 0.16, 'sawtooth', 0.14, 0.16, 660);
  },
  caught() {
    tone(180, 0.3, 'sawtooth', 0.18, 0, 60);
    tone(90, 0.4, 'square', 0.14, 0.1, 45);
  },
  hurt() {
    tone(300, 0.18, 'sawtooth', 0.15, 0, 120);
  },
  hide() {
    tone(500, 0.12, 'sine', 0.1, 0, 700);
  },
  buy() {
    tone(660, 0.09, 'triangle', 0.14);
    tone(990, 0.14, 'triangle', 0.12, 0.08);
  },
  denied() {
    tone(160, 0.15, 'square', 0.12);
  },
  stageClear() {
    [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.18, 'triangle', 0.14, i * 0.11));
  },
  win() {
    [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) => tone(f, 0.22, 'triangle', 0.15, i * 0.13));
  },
  click() {
    tone(700, 0.05, 'sine', 0.08);
  },
  startMusic() {
    if (muted || musicTimer !== null) return;
    ensureCtx();
    musicStep = 0;
    musicTimer = setInterval(() => {
      if (muted) return;
      const f = MELODY[musicStep % MELODY.length];
      musicStep++;
      if (f > 0) tone(f, 0.22, 'triangle', 0.045);
    }, 240);
  },
  stopMusic() {
    if (musicTimer !== null) {
      clearInterval(musicTimer);
      musicTimer = null;
    }
  },
};
