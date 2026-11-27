// random.js — a tiny seeded generator so corn and decoration are identical
// every run, while gameplay stays fair. One job: deterministic randomness.
export function makeRng(seed) {
  let s = seed >>> 0;
  return function next() {
    // mulberry32
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickInRange(rng, min, max) {
  return min + rng() * (max - min);
}
