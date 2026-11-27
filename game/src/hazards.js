// hazards.js — the oven and the carving knives. One job: hurt the turkey
// when it stands where dinner gets made.
import { KNIFE_HIT_DIST, OVEN_BURN_TIME } from './config.js';
import { pointInRect } from './world.js';
import { sfx } from './audio.js';
import { loseLife } from './state.js';

export function updateKnives(state, dt) {
  const stage = state.stage;
  for (const k of stage.knives) {
    const a = k.path[k.seg];
    const b = k.path[(k.seg + 1) % k.path.length];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    k.t += (46 * dt) / len; // steady patrol speed along the path
    if (k.t >= 1) {
      k.t = 0;
      k.seg = (k.seg + 1) % k.path.length;
    }
    const na = k.path[k.seg];
    const nb = k.path[(k.seg + 1) % k.path.length];
    k.x = na.x + (nb.x - na.x) * k.t;
    k.y = na.y + (nb.y - na.y) * k.t;
    k.angle = Math.atan2(nb.y - na.y, nb.x - na.x) + Math.PI / 2;
    // A knife that touches the turkey costs a life.
    const t = state.turkey;
    if (Math.hypot(t.x - k.x, t.y - k.y) < KNIFE_HIT_DIST && t.invuln <= 0) {
      sfx.hurt();
      loseLife(state, 'Sliced by the carving knife!');
    }
  }
}

export function updateOvens(state, dt) {
  const t = state.turkey;
  const stage = state.stage;
  for (const o of stage.ovens) {
    o.flicker += dt;
    const inOven = pointInRect(t.x, t.y, o);
    if (inOven && t.invuln <= 0) {
      t.ovenTime += dt;
      if (t.ovenTime >= OVEN_BURN_TIME) {
        t.ovenTime = 0;
        sfx.hurt();
        // Shove the turkey out of the oven as well as costing a life.
        t.y = o.y + o.h + 26;
        loseLife(state, 'Singed by the oven!');
      }
    } else {
      t.ovenTime = Math.max(0, t.ovenTime - dt * 2);
    }
  }
}
