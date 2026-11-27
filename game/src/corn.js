// corn.js — corn pickups, the run's currency. One job: let the turkey
// collect corn and count it.
import { SCORE } from './config.js';
import { pushLog } from './log.js';
import { sfx } from './audio.js';

export function updateCorn(state) {
  const t = state.turkey;
  for (const c of state.stage.corns) {
    if (c.taken) continue;
    if (Math.hypot(t.x - c.x, t.y - c.y) < 26) {
      c.taken = true;
      state.corn++;
      state.stats.cornCollected++;
      state.score += SCORE.corn;
      sfx.coin();
      pushLog(state, `Corn! +${SCORE.corn} points (${state.corn} in the pouch).`);
    }
  }
}
