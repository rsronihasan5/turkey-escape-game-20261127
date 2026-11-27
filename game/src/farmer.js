// farmer.js — Farmer Bramwell, the telegraphed rival. He patrols, grows
// suspicious, chases, searches and corners. His vision cone, intent marker
// and next-move preview are always visible so the player can outplay him.
import {
  FARMER_PATROL, FARMER_SEARCH, FARMER_CHASE, FARMER_CATCH_DIST,
  VISION_RANGE, VISION_HALF_ANGLE, SUSPICION_RATE, SUSPICION_DECAY,
  SEARCH_TIME, SMOKE_RADIUS, DECOY_TIME,
} from './config.js';
import { moveCircle, sightBlocked } from './world.js';
import { pushLog, flashMessage } from './log.js';
import { sfx } from './audio.js';
import { loseLife } from './state.js';

function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

function angleTo(a, b) { return Math.atan2(b.y - a.y, b.x - a.x); }

function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// Can the farmer see a point? Range, cone, sight-blocking walls, haystack
// hiding and smoke all count. Decoys count as a turkey to him.
export function canSee(state, tx, ty) {
  const f = state.farmer;
  const d = Math.hypot(tx - f.x, ty - f.y);
  if (d > VISION_RANGE) return false;
  if (Math.abs(angleDiff(angleTo(f, { x: tx, y: ty }), f.dir)) > VISION_HALF_ANGLE && d > 46) return false;
  if (sightBlocked(state.stage, f.x, f.y, tx, ty)) return false;
  for (const s of state.smokes) {
    if (Math.hypot(tx - s.x, ty - s.y) < SMOKE_RADIUS) return false;
  }
  return true;
}

export function updateFarmer(state, dt) {
  const f = state.farmer;
  const t = state.turkey;
  const stage = state.stage;
  const def = stage.def;

  // A live decoy is the farmer's favourite turkey.
  const decoy = state.decoys[0] || null;
  const target = decoy ? { x: decoy.x, y: decoy.y } : { x: t.x, y: t.y };
  const targetVisible = decoy
    ? canSee(state, decoy.x, decoy.y)
    : !t.hidden && canSee(state, t.x, t.y);

  // Suspicion: seeing the turkey fills it, losing sight drains it.
  // Up close he cannot miss you: suspicion fills far faster.
  if (targetVisible) {
    const close = Math.hypot(target.x - f.x, target.y - f.y) < 70;
    f.suspicion = Math.min(1, f.suspicion + (SUSPICION_RATE + (close ? 1.6 : 0)) * dt);
    f.lastSeen = { x: target.x, y: target.y };
    if (f.suspicion >= 1 && f.mode !== 'chase') {
      f.mode = 'chase';
      f.chaseLost = 0;
      if (!decoy) {
        state.stats.spotted++;
        state.stageSpotted = true;
        sfx.spotted();
        flashMessage(state, 'SPOTTED! Run, Giblet, run!');
        pushLog(state, 'Farmer Bramwell spotted you! He is coming!');
      } else {
        pushLog(state, 'The farmer spotted the decoy — nicely done!');
      }
    }
  } else {
    f.suspicion = Math.max(0, f.suspicion - SUSPICION_DECAY * dt);
  }

  // Next-move preview: where the farmer is heading, so the player can dodge.
  f.preview = [];
  if (f.mode === 'patrol') {
    const wp = def.waypoints[f.waypointIndex];
    f.preview.push({ x: wp.x, y: wp.y });
  } else if (f.mode === 'chase' || f.mode === 'search') {
    const dest = f.lastSeen || target;
    f.preview.push({ x: dest.x, y: dest.y });
  }

  // Intent marker over the farmer's head.
  f.intent = f.mode === 'chase' ? '!' : f.suspicion > 0.25 ? '?' : '';

  let speed = FARMER_PATROL;
  let dest = null;
  if (f.mode === 'patrol') {
    const wp = def.waypoints[f.waypointIndex];
    dest = wp;
    if (dist(f, wp) < 14) f.waypointIndex = (f.waypointIndex + 1) % def.waypoints.length;
  } else if (f.mode === 'chase') {
    speed = FARMER_CHASE;
    // Cornering: aim where the turkey will be, not where it is.
    const px = target.x + (decoy ? 0 : t.vx * 0.45);
    const py = target.y + (decoy ? 0 : t.vy * 0.45);
    dest = { x: px, y: py };
    if (!targetVisible) {
      f.chaseLost += dt;
      if (f.chaseLost > 1.6) {
        f.mode = 'search';
        f.searchTimer = SEARCH_TIME;
        pushLog(state, 'You broke his line of sight — he is searching!');
      }
    } else {
      f.chaseLost = 0;
    }
  } else if (f.mode === 'search') {
    speed = FARMER_SEARCH;
    dest = f.lastSeen || def.waypoints[0];
    f.searchTimer -= dt;
    if (dist(f, dest) < 20 || f.searchTimer <= 0) {
      f.mode = 'patrol';
      f.suspicion = 0;
      pushLog(state, 'The farmer gave up searching. Phew.');
    }
  } else if (f.mode === 'suspicious') {
    speed = FARMER_SEARCH;
    dest = f.lastSeen || def.waypoints[0];
    if (dist(f, dest) < 20) {
      f.mode = 'patrol';
      f.suspicion = 0;
    }
  }

  // Unstick: if the farmer has barely moved toward a destination for a
  // while (wedged on an obstacle corner), sidestep perpendicular to his
  // heading for a short burst, then resume the chase or patrol.
  if (f.unstickTimer > 0) {
    f.unstickTimer -= dt;
    const a = f.dir + f.unstickDir * Math.PI / 2;
    moveCircle(stage, f, Math.cos(a) * FARMER_PATROL * dt, Math.sin(a) * FARMER_PATROL * dt);
  } else if (dest) {
    const d = Math.hypot(dest.x - f.x, dest.y - f.y);
    if (d > 2) {
      const step = Math.min(d, speed * dt);
      const nx = ((dest.x - f.x) / d) * step;
      const ny = ((dest.y - f.y) / d) * step;
      f.dir = Math.atan2(ny, nx);
      moveCircle(stage, f, nx, ny);
    }
  }
  f.checkTimer = (f.checkTimer ?? 0) + dt;
  if (f.checkTimer >= 0.5) {
    f.checkTimer = 0;
    const moved = Math.hypot(f.x - (f.checkX ?? f.x), f.y - (f.checkY ?? f.y));
    f.checkX = f.x;
    f.checkY = f.y;
    if (dest && moved < 8) {
      f.stuckTime = (f.stuckTime ?? 0) + 0.5;
      if (f.stuckTime > 0.8) {
        f.stuckTime = 0;
        f.unstickTimer = 0.7;
        f.unstickDir = (f.unstickDir ?? 1) * -1;
      }
    } else {
      f.stuckTime = 0;
    }
  }

  // Caught! Only the real turkey counts, and never while invulnerable.
  // A bump while patrolling counts as spotted too — he saw you up close.
  if (!decoy && dist(f, t) < FARMER_CATCH_DIST && !t.hidden) {
    if (f.mode !== 'chase' && !state.stageSpotted) {
      state.stats.spotted++;
      state.stageSpotted = true;
    }
    sfx.caught();
    loseLife(state, 'Caught by Farmer Bramwell!');
  }
  // A decoy that gets "caught" just vanishes in a puff of straw.
  if (decoy && dist(f, decoy) < FARMER_CATCH_DIST) {
    state.decoys.shift();
    f.mode = 'search';
    f.searchTimer = SEARCH_TIME;
    f.lastSeen = { x: decoy.x, y: decoy.y };
    pushLog(state, 'The decoy fell apart! He is searching the straw...');
  }
}
