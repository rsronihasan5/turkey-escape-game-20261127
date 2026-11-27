// turkey.js — the player: Giblet the turkey. Movement, sprint and stamina,
// hiding in haystacks, decoys and smoke. One job: move the turkey.
import {
  TURKEY_WALK, TURKEY_SPRINT, TURKEY_SPRINT_DRAIN, TURKEY_SPRINT_REGEN,
  BOOTS_BONUS, SCORE,
} from './config.js';
import { moveCircle, nearestHaystack, pointInRect } from './world.js';
import { pushLog, flashMessage } from './log.js';
import { sfx } from './audio.js';

export function updateTurkey(state, input, dt) {
  const t = state.turkey;
  const stage = state.stage;
  if (t.invuln > 0) t.invuln -= dt;
  if (state.messageTimer > 0) state.messageTimer -= dt;

  // Hide / unhide in a haystack with Space.
  if (input.wasPressed(' ')) {
    if (t.hidden) {
      t.hidden = false;
      pushLog(state, 'Out of the hay — stay low!');
    } else {
      const hay = nearestHaystack(stage, t.x, t.y);
      if (hay) {
        t.hidden = true;
        sfx.hide();
        if (!state.stageHidden) {
          state.stageHidden = true;
          state.score += SCORE.hideBonus;
          state.stats.hides++;
          pushLog(state, `Hidden in the hay! +${SCORE.hideBonus} sneaky points.`);
        } else {
          pushLog(state, 'Hidden in the hay. The farmer walks right past...');
        }
      }
    }
  }

  // Decoy (Q) and smoke (F) consumables.
  if (input.wasPressed('q') && state.upgrades.decoy > 0) {
    state.upgrades.decoy--;
    state.decoys.push({ x: t.x, y: t.y, t: 4.0 });
    sfx.gobble();
    pushLog(state, 'Decoy turkey deployed! The farmer takes the bait.');
  }
  if (input.wasPressed('f') && state.upgrades.smoke > 0) {
    state.upgrades.smoke--;
    state.smokes.push({ x: t.x, y: t.y, t: 3.0 });
    sfx.hide();
    pushLog(state, 'Smoke puff! The farmer loses your trail.');
  }

  // Movement. Hidden turkeys stay put.
  let mx = 0;
  let my = 0;
  if (input.down('ArrowLeft', 'a')) mx -= 1;
  if (input.down('ArrowRight', 'd')) mx += 1;
  if (input.down('ArrowUp', 'w')) my -= 1;
  if (input.down('ArrowDown', 's')) my += 1;
  const moving = (mx !== 0 || my !== 0) && !t.hidden;
  t.moving = moving;
  if (moving) {
    const len = Math.hypot(mx, my);
    mx /= len; my /= len;
    const sprinting = input.down('Shift') && state.stamina > 1;
    let speed = (sprinting ? TURKEY_SPRINT : TURKEY_WALK) * (1 + state.upgrades.boots * BOOTS_BONUS);
    if (sprinting) {
      state.stamina = Math.max(0, state.stamina - TURKEY_SPRINT_DRAIN * dt);
    } else {
      state.stamina = Math.min(100, state.stamina + TURKEY_SPRINT_REGEN * dt);
    }
    const step = speed * dt;
    moveCircle(stage, t, mx * step, my * step);
    state.distance += (step * SCORE.perMeter) / 10;
    state.score += (step * SCORE.perMeter) / 10;
    t.stepPhase += dt * (sprinting ? 14 : 9);
    if (mx !== 0) t.facing = mx > 0 ? 1 : -1;
    t.vx = mx * speed; t.vy = my * speed;
  } else {
    state.stamina = Math.min(100, state.stamina + TURKEY_SPRINT_REGEN * dt);
    t.vx = 0; t.vy = 0;
  }

  // Smoke clouds and decoys age out.
  for (const d of state.decoys) d.t -= dt;
  state.decoys = state.decoys.filter((d) => d.t > 0);
  for (const s of state.smokes) s.t -= dt;
  state.smokes = state.smokes.filter((s) => s.t > 0);

  // Reaching the exit clears the stage.
  if (pointInRect(t.x, t.y, stage.exit)) {
    flashMessage(state, stage.def.name + ' cleared!');
  }
}
