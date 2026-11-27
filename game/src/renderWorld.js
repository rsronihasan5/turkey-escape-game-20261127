// renderWorld.js — draws the farm, the barn, the kitchen, the turkey, the
// farmer, the knives, the oven, the corn and the haystacks. All art is drawn
// in code with canvas primitives. One job: draw the world.
import { COLORS, VISION_RANGE, VISION_HALF_ANGLE, SMOKE_RADIUS } from './config.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawGround(ctx, stage, time) {
  const def = stage.def;
  if (def.ground === 'kitchen') {
    ctx.fillStyle = COLORS.kitchenFloor;
    ctx.fillRect(0, 0, 960, 600);
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 2;
    for (let x = 0; x < 960; x += 60) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 600); ctx.stroke();
    }
    for (let y = 0; y < 600; y += 60) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(960, y); ctx.stroke();
    }
    ctx.fillStyle = COLORS.kitchenWall;
    ctx.fillRect(0, 0, 960, 26);
    ctx.fillRect(0, 574, 960, 26);
  } else {
    const g = ctx.createLinearGradient(0, 0, 0, 600);
    g.addColorStop(0, def.ground === 'dirt' ? '#a87a4a' : COLORS.grass);
    g.addColorStop(1, def.ground === 'dirt' ? '#8f6538' : COLORS.grassDark);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 960, 600);
    // Grass tufts / dirt speckles, fixed positions.
    ctx.fillStyle = 'rgba(0,0,0,0.10)';
    for (let i = 0; i < 90; i++) {
      const x = (i * 173) % 940 + 10;
      const y = (i * 271) % 560 + 20;
      ctx.fillRect(x, y, 5, 3);
    }
    if (def.ground === 'dirt') {
      ctx.fillStyle = COLORS.dirt;
      ctx.beginPath();
      ctx.ellipse(480, 300, 330, 190, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export function drawObstacles(ctx, stage) {
  for (const o of stage.obstacles) {
    if (o.type === 'fence') {
      ctx.fillStyle = COLORS.fence;
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.fillStyle = COLORS.fenceDark;
      const horizontal = o.w >= o.h;
      for (let p = 0; p < (horizontal ? o.w : o.h); p += 34) {
        if (horizontal) ctx.fillRect(o.x + p, o.y, 4, o.h);
        else ctx.fillRect(o.x, o.y + p, o.w, 4);
      }
    } else if (o.type === 'wall') {
      ctx.fillStyle = '#b98d5f';
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.fillStyle = '#8d6b4a';
      ctx.fillRect(o.x, o.y + o.h - 6, o.w, 6);
    } else if (o.type === 'barn') {
      ctx.fillStyle = COLORS.barn;
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.fillStyle = COLORS.barnRoof;
      ctx.beginPath();
      ctx.moveTo(o.x - 8, o.y + 26);
      ctx.lineTo(o.x + o.w / 2, o.y - 22);
      ctx.lineTo(o.x + o.w + 8, o.y + 26);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#5f2a20';
      ctx.fillRect(o.x + o.w / 2 - 18, o.y + o.h - 46, 36, 46);
      ctx.strokeStyle = '#e8c25a';
      ctx.lineWidth = 3;
      ctx.strokeRect(o.x + o.w / 2 - 18, o.y + o.h - 46, 36, 46);
    } else if (o.type === 'crate') {
      ctx.fillStyle = '#b98d5f';
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.strokeStyle = '#8d6b4a';
      ctx.lineWidth = 4;
      ctx.strokeRect(o.x + 4, o.y + 4, o.w - 8, o.h - 8);
      ctx.beginPath();
      ctx.moveTo(o.x, o.y); ctx.lineTo(o.x + o.w, o.y + o.h);
      ctx.moveTo(o.x + o.w, o.y); ctx.lineTo(o.x, o.y + o.h);
      ctx.stroke();
    } else if (o.type === 'counter' || o.type === 'table') {
      ctx.fillStyle = COLORS.counterTop;
      rr(ctx, o.x, o.y, o.w, o.h, 8);
      ctx.fill();
      ctx.fillStyle = COLORS.counter;
      ctx.fillRect(o.x + 6, o.y + 12, o.w - 12, o.h - 12);
      ctx.fillStyle = '#e8e0c8';
      ctx.beginPath();
      ctx.arc(o.x + 24, o.y + 18, 8, 0, Math.PI * 2);
      ctx.arc(o.x + o.w - 24, o.y + 18, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export function drawOvens(ctx, stage, time) {
  for (const o of stage.ovens) {
    const glow = 0.55 + 0.35 * Math.sin(time * 6 + o.flicker);
    ctx.fillStyle = COLORS.oven;
    rr(ctx, o.x, o.y, o.w, o.h, 8);
    ctx.fill();
    ctx.fillStyle = `rgba(255,122,26,${glow})`;
    rr(ctx, o.x + 10, o.y + 12, o.w - 20, o.h - 24, 6);
    ctx.fill();
    ctx.fillStyle = '#ffd23f';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HOT OVEN!', o.x + o.w / 2, o.y - 6);
  }
}

export function drawHaystacks(ctx, stage) {
  for (const h of stage.haystacks) {
    ctx.fillStyle = COLORS.hayDark;
    ctx.beginPath();
    ctx.ellipse(h.x, h.y + 4, h.r, h.r * 0.82, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.hay;
    ctx.beginPath();
    ctx.ellipse(h.x, h.y, h.r, h.r * 0.86, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = COLORS.hayDark;
    ctx.lineWidth = 2;
    for (let a = -0.9; a <= 0.9; a += 0.45) {
      ctx.beginPath();
      ctx.moveTo(h.x, h.y - h.r * 0.4);
      ctx.quadraticCurveTo(h.x + Math.sin(a) * h.r * 0.7, h.y, h.x + Math.sin(a) * h.r * 0.9, h.y + h.r * 0.6);
      ctx.stroke();
    }
    ctx.fillStyle = '#2b1a0e';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HIDE (SPACE)', h.x, h.y + h.r + 14);
  }
}

export function drawCorn(ctx, stage, time) {
  for (const c of stage.corns) {
    if (c.taken) continue;
    const bob = Math.sin(time * 3 + c.bob) * 3;
    ctx.save();
    ctx.translate(c.x, c.y + bob);
    ctx.fillStyle = COLORS.cornHusk;
    ctx.beginPath();
    ctx.moveTo(-8, 6); ctx.lineTo(-14, -10); ctx.lineTo(-4, -2); ctx.closePath();
    ctx.moveTo(8, 6); ctx.lineTo(14, -10); ctx.lineTo(4, -2); ctx.closePath();
    ctx.fill();
    ctx.fillStyle = COLORS.corn;
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d9a400';
    ctx.lineWidth = 1.5;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath(); ctx.moveTo(i * 4, -9); ctx.lineTo(i * 4, 9); ctx.stroke();
    }
    ctx.restore();
  }
}

export function drawExit(ctx, stage, time) {
  const e = stage.exit;
  const pulse = 0.5 + 0.3 * Math.sin(time * 4);
  ctx.fillStyle = `rgba(47,125,50,${0.25 + pulse * 0.2})`;
  ctx.fillRect(e.x, e.y, e.w, e.h);
  ctx.strokeStyle = COLORS.good;
  ctx.lineWidth = 4;
  ctx.strokeRect(e.x, e.y, e.w, e.h);
  ctx.fillStyle = COLORS.good;
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT →', e.x + e.w / 2, e.y + e.h / 2 + 4);
  ctx.fillStyle = '#2b1a0e';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(e.label, e.x - 10, e.y + e.h / 2 + 4);
  ctx.textAlign = 'left';
}

// The turkey: a round brown body, a fanned tail, a wattle and a worried eye.
export function drawTurkey(ctx, t, time) {
  ctx.save();
  ctx.translate(t.x, t.y);
  if (t.invuln > 0 && Math.floor(time * 12) % 2 === 0) ctx.globalAlpha = 0.45;
  const bob = t.moving ? Math.sin(t.stepPhase) * 2 : Math.sin(time * 2) * 1.2;
  // Tail fan.
  ctx.fillStyle = COLORS.turkeyTail;
  for (let i = -2; i <= 2; i++) {
    ctx.save();
    ctx.rotate((i * 0.38) - t.facing * 0.2);
    ctx.beginPath();
    ctx.ellipse(-t.facing * 16, -6, 7, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // Body.
  ctx.fillStyle = COLORS.turkeyBody;
  ctx.beginPath();
  ctx.ellipse(0, bob * 0.4, 17, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.turkeyWing;
  ctx.beginPath();
  ctx.ellipse(-t.facing * 3, 2 + bob * 0.4, 10, 7, -0.4 * t.facing, 0, Math.PI * 2);
  ctx.fill();
  // Head.
  ctx.fillStyle = COLORS.turkeyHead;
  ctx.beginPath();
  ctx.arc(t.facing * 13, -12 + bob * 0.4, 8, 0, Math.PI * 2);
  ctx.fill();
  // Beak + wattle.
  ctx.fillStyle = COLORS.turkeyBeak;
  ctx.beginPath();
  ctx.moveTo(t.facing * 19, -13 + bob * 0.4);
  ctx.lineTo(t.facing * 27, -10 + bob * 0.4);
  ctx.lineTo(t.facing * 19, -8 + bob * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = COLORS.turkeyWattle;
  ctx.beginPath();
  ctx.ellipse(t.facing * 16, -4 + bob * 0.4, 3, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Worried eye.
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(t.facing * 15, -14 + bob * 0.4, 3.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(t.facing * 16, -14 + bob * 0.4, 1.7, 0, Math.PI * 2);
  ctx.fill();
  // Legs.
  ctx.strokeStyle = '#f2a541';
  ctx.lineWidth = 2.5;
  const legSwing = t.moving ? Math.sin(t.stepPhase) * 4 : 0;
  ctx.beginPath();
  ctx.moveTo(-4, 12); ctx.lineTo(-4 + legSwing, 18);
  ctx.moveTo(5, 12); ctx.lineTo(5 - legSwing, 18);
  ctx.stroke();
  ctx.restore();
  if (t.hidden) {
    ctx.fillStyle = 'rgba(43,26,14,0.85)';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HIDDEN IN THE HAY', t.x, t.y - 30);
  }
}

// Farmer Bramwell: straw hat, blue overalls, a net, and a vision cone.
export function drawFarmer(ctx, f, state, time) {
  const mode = f.mode;
  // Vision cone.
  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.rotate(f.dir);
  const coneColor = mode === 'chase' ? 'rgba(217,58,43,0.20)'
    : f.suspicion > 0.25 ? 'rgba(242,165,65,0.18)' : 'rgba(255,220,120,0.10)';
  ctx.fillStyle = coneColor;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, VISION_RANGE, -VISION_HALF_ANGLE, VISION_HALF_ANGLE);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  // Next-move preview: dotted line to his destination.
  if (f.preview.length > 0) {
    const dest = f.preview[0];
    ctx.strokeStyle = mode === 'chase' ? 'rgba(217,58,43,0.7)' : 'rgba(43,26,14,0.45)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(f.x, f.y);
    ctx.lineTo(dest.x, dest.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = mode === 'chase' ? '#d93a2b' : 'rgba(43,26,14,0.6)';
    ctx.beginPath();
    ctx.arc(dest.x, dest.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  // Body.
  ctx.save();
  ctx.translate(f.x, f.y);
  const walk = mode === 'patrol' ? Math.sin(time * 5) * 1.5 : Math.sin(time * 11) * 2;
  ctx.fillStyle = COLORS.farmerOveralls;
  rr(ctx, -13, -4 + walk * 0.3, 26, 26, 6);
  ctx.fill();
  ctx.fillStyle = COLORS.farmerShirt;
  rr(ctx, -14, -12 + walk * 0.3, 28, 14, 6);
  ctx.fill();
  // Head + straw hat.
  ctx.fillStyle = COLORS.farmerSkin;
  ctx.beginPath();
  ctx.arc(0, -20 + walk * 0.3, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.farmerHat;
  ctx.beginPath();
  ctx.ellipse(0, -27 + walk * 0.3, 17, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, -30 + walk * 0.3, 9, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  // Eyes look toward his heading.
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(Math.cos(f.dir) * 4 - 3, -21 + walk * 0.3, 1.6, 0, Math.PI * 2);
  ctx.arc(Math.cos(f.dir) * 4 + 3, -21 + walk * 0.3, 1.6, 0, Math.PI * 2);
  ctx.fill();
  // The net he carries.
  ctx.strokeStyle = '#8d6b4a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(12, -6);
  ctx.lineTo(24, -18);
  ctx.stroke();
  ctx.strokeStyle = '#d9c7a7';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(27, -22, 9, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  // Intent marker: "?" while suspicious, "!" while chasing.
  if (f.intent) {
    const big = f.intent === '!';
    ctx.fillStyle = big ? '#d93a2b' : '#f2a541';
    ctx.font = `bold ${big ? 30 : 24}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(f.intent, f.x, f.y - 42 - Math.sin(time * 6) * 3);
  }
  // Suspicion bar while he is onto something.
  if (f.suspicion > 0.05 && f.mode !== 'chase') {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(f.x - 22, f.y - 52, 44, 7);
    ctx.fillStyle = '#f2a541';
    ctx.fillRect(f.x - 21, f.y - 51, 42 * f.suspicion, 5);
  }
}

export function drawKnives(ctx, stage, time) {
  for (const k of stage.knives) {
    ctx.save();
    ctx.translate(k.x, k.y);
    ctx.rotate(k.angle);
    ctx.fillStyle = COLORS.knife;
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(7, 6);
    ctx.lineTo(0, 12);
    ctx.lineTo(-7, 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = COLORS.knifeHandle;
    rr(ctx, -4, 10, 8, 12, 3);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#2b1a0e';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CARVING KNIFE!', k.x, k.y - 24);
  }
}

export function drawDecoysAndSmoke(ctx, state, time) {
  for (const d of state.decoys) {
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.translate(d.x, d.y);
    ctx.fillStyle = '#c9a13c';
    ctx.beginPath();
    ctx.ellipse(0, 0, 15, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8a5a2b';
    ctx.beginPath();
    ctx.arc(11, -10, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#2b1a0e';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DECOY', d.x, d.y - 24);
  }
  for (const s of state.smokes) {
    const a = Math.min(1, s.t);
    ctx.fillStyle = `rgba(220,220,220,${0.55 * a})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, SMOKE_RADIUS * (1.1 - a * 0.1), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(180,180,180,${0.4 * a})`;
    ctx.beginPath();
    ctx.arc(s.x - 20, s.y - 10, 26, 0, Math.PI * 2);
    ctx.arc(s.x + 22, s.y + 8, 24, 0, Math.PI * 2);
    ctx.fill();
  }
}
