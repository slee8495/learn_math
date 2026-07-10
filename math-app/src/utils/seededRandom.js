// Deterministic PRNG so a given (dayNum, conceptId, index) seed always
// produces the same "random" quiz problem — no server, no stored state,
// just math on the seed.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Inclusive on both ends.
export function randInt(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}

export function randNonZeroInt(rng, min, max) {
  let v;
  do {
    v = randInt(rng, min, max);
  } while (v === 0);
  return v;
}

export function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}
