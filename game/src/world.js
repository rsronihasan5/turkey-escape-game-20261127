// world.js — stage layouts, collision and line of sight.
// One job: know where things are and what blocks movement or vision.
import { STAGES, VIEW_W, VIEW_H } from './config.js';
import { makeRng, pickInRange } from './random.js';

export function buildStage(index) {
  const def = STAGES[index];
  const rng = makeRng(def.cornSeed * 7919 + 13);
  const corns = [];
  let tries = 0;
  while (corns.length < def.cornCount && tries < 400) {
    tries++;
    const x = pickInRange(rng, 60, VIEW_W - 60);
    const y = pickInRange(rng, 60, VIEW_H - 60);
    if (def.obstacles.some((o) => circleHitsRect(x, y, 24, o))) continue;
    if (def.haystacks.some((h) => Math.hypot(x - h.x, y - h.y) < h.r + 24)) continue;
    if (Math.hypot(x - def.spawn.x, y - def.spawn.y) < 70) continue;
    if (Math.hypot(x - def.exit.x - def.exit.w / 2, y - def.exit.y - def.exit.h / 2) < 70) continue;
    if (corns.some((c) => Math.hypot(c.x - x, c.y - y) < 46)) continue;
    corns.push({ x, y, taken: false, bob: rng() * Math.PI * 2 });
  }
  return {
    def,
    index,
    obstacles: def.obstacles.map((o) => ({ ...o })),
    haystacks: def.haystacks.map((h) => ({ ...h })),
    corns,
    exit: { ...def.exit },
    spawn: { ...def.spawn },
    knives: def.knifePaths.map((path) => ({
      path: path.map((p) => ({ ...p })),
      seg: 0,
      t: 0,
      x: path[0].x,
      y: path[0].y,
      angle: 0,
    })),
    ovens: def.ovens.map((o) => ({ ...o, flicker: 0 })),
  };
}

export function circleHitsRect(cx, cy, r, rect) {
  const nx = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
  const ny = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
  return Math.hypot(cx - nx, cy - ny) < r;
}

export function pointInRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

// Move a circle against the stage's obstacles and walls, sliding along them.
export function moveCircle(stage, ent, dx, dy) {
  const r = ent.r;
  let nx = ent.x + dx;
  if (!stage.obstacles.some((o) => circleHitsRect(nx, ent.y, r, o))) {
    ent.x = Math.max(26 + r, Math.min(VIEW_W - 26 - r, nx));
  }
  let ny = ent.y + dy;
  if (!stage.obstacles.some((o) => circleHitsRect(ent.x, ny, r, o))) {
    ent.y = Math.max(26 + r, Math.min(VIEW_H - 26 - r, ny));
  }
}

// Does segment (x1,y1)-(x2,y2) cross any sight-blocking obstacle?
export function sightBlocked(stage, x1, y1, x2, y2) {
  for (const o of stage.obstacles) {
    if (!o.blocksSight) continue;
    if (segmentHitsRect(x1, y1, x2, y2, o)) return true;
  }
  return false;
}

function segmentHitsRect(x1, y1, x2, y2, rect) {
  if (pointInRect(x1, y1, rect) || pointInRect(x2, y2, rect)) return true;
  const edges = [
    [rect.x, rect.y, rect.x + rect.w, rect.y],
    [rect.x + rect.w, rect.y, rect.x + rect.w, rect.y + rect.h],
    [rect.x + rect.w, rect.y + rect.h, rect.x, rect.y + rect.h],
    [rect.x, rect.y + rect.h, rect.x, rect.y],
  ];
  return edges.some(([ax, ay, bx, by]) => segmentsCross(x1, y1, x2, y2, ax, ay, bx, by));
}

function segmentsCross(x1, y1, x2, y2, x3, y3, x4, y4) {
  const d = (x2 - x1) * (y4 - y3) - (y2 - y1) * (x4 - x3);
  if (d === 0) return false;
  const t = ((x3 - x1) * (y4 - y3) - (y3 - y1) * (x4 - x3)) / d;
  const u = ((x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1)) / d;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

export function nearestHaystack(stage, x, y) {
  let best = null;
  let bestD = Infinity;
  for (const h of stage.haystacks) {
    const d = Math.hypot(x - h.x, y - h.y) - h.r;
    if (d < bestD) { bestD = d; best = h; }
  }
  return bestD < 26 ? best : null;
}
