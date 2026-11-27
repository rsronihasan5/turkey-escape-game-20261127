// renderHud.js — the heads-up display and the live event log.
// One job: show score, distance, lives, corn, stamina and what happened.
import { COLORS, VIEW_W } from './config.js';

export function drawHud(ctx, state) {
  const s = state;
  ctx.fillStyle = 'rgba(43,26,14,0.88)';
  ctx.fillRect(0, 0, VIEW_W, 34);
  ctx.fillStyle = '#fff3d6';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE ${Math.floor(s.score)}`, 12, 22);
  ctx.fillText(`DIST ${Math.floor(s.distance)}m`, 150, 22);
  // Lives as hearts.
  ctx.fillStyle = '#ff5a5a';
  for (let i = 0; i < 3; i++) {
    const x = 268 + i * 22;
    ctx.beginPath();
    if (i < s.lives) {
      ctx.moveTo(x, 20);
      ctx.bezierCurveTo(x - 7, 12, x - 12, 18, x, 26);
      ctx.bezierCurveTo(x + 12, 18, x + 7, 12, x, 20);
      ctx.fill();
    } else {
      ctx.globalAlpha = 0.3;
      ctx.moveTo(x, 20);
      ctx.bezierCurveTo(x - 7, 12, x - 12, 18, x, 26);
      ctx.bezierCurveTo(x + 12, 18, x + 7, 12, x, 20);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
  ctx.fillStyle = '#ffd23f';
  ctx.fillText(`🌽 ${s.corn}`, 340, 22);
  // Stamina bar.
  ctx.fillStyle = '#fff3d6';
  ctx.fillText('STAMINA', 420, 22);
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillRect(500, 12, 110, 12);
  ctx.fillStyle = s.stamina > 25 ? '#7fae4c' : '#d93a2b';
  ctx.fillRect(500, 12, 110 * (s.stamina / 100), 12);
  // Stage + consumables + mute.
  ctx.fillStyle = '#fff3d6';
  ctx.textAlign = 'right';
  const items = [];
  if (s.upgrades.boots) items.push(`👢x${s.upgrades.boots}`);
  if (s.upgrades.decoy) items.push(`🦃x${s.upgrades.decoy} (Q)`);
  if (s.upgrades.smoke) items.push(`💨x${s.upgrades.smoke} (F)`);
  ctx.fillText(`${s.stage.def.name}  ${items.join(' ')}  ${s.muted ? '🔇' : '🔊'} M`, VIEW_W - 12, 22);
  ctx.textAlign = 'left';
}

export function drawLog(ctx, state) {
  ctx.font = '13px sans-serif';
  ctx.textAlign = 'left';
  state.log.forEach((entry, i) => {
    const y = 600 - 14 - i * 18;
    ctx.fillStyle = 'rgba(43,26,14,0.55)';
    const w = ctx.measureText(entry.msg).width + 12;
    ctx.fillRect(8, y - 13, w, 17);
    ctx.fillStyle = i === 0 ? '#fff3d6' : 'rgba(255,243,214,0.75)';
    ctx.fillText(entry.msg, 14, y);
  });
}

export function drawFlashMessage(ctx, state) {
  if (state.messageTimer <= 0 || !state.message) return;
  const a = Math.min(1, state.messageTimer);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.font = 'bold 30px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(43,26,14,0.75)';
  const w = ctx.measureText(state.message).width + 36;
  ctx.fillRect(VIEW_W / 2 - w / 2, 92, w, 44);
  ctx.fillStyle = state.message.includes('SPOTTED') ? '#ff8a70' : '#fff3d6';
  ctx.fillText(state.message, VIEW_W / 2, 123);
  ctx.restore();
}

export function drawPauseHint(ctx) {
  ctx.fillStyle = 'rgba(255,243,214,0.85)';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('WASD/arrows move · SHIFT sprint · SPACE hide · Q decoy · F smoke · P pause · M mute', VIEW_W - 10, 592);
  ctx.textAlign = 'left';
}
