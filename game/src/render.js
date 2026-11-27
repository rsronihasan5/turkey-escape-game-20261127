// render.js — draws one whole frame for whichever screen is showing:
// the title scene, the run, the shop, the pause menu or an ending.
// One job: compose the frame.
import { COLORS, VIEW_W, VIEW_H, SHOP_ITEMS } from './config.js';
import { drawGround, drawObstacles, drawOvens, drawHaystacks, drawCorn, drawExit, drawTurkey, drawFarmer, drawKnives, drawDecoysAndSmoke } from './renderWorld.js';
import { drawHud, drawLog, drawFlashMessage, drawPauseHint } from './renderHud.js';
import { buttonsFor } from './ui.js';
import { ownedCount, canBuy } from './shop.js';

function panel(ctx, x, y, w, h) {
  ctx.fillStyle = COLORS.panel;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = COLORS.panelEdge;
  ctx.lineWidth = 4;
  ctx.strokeRect(x, y, w, h);
}

function drawButton(ctx, b, hover) {
  ctx.fillStyle = b.disabled ? '#b9a98a' : hover ? '#f2a541' : '#e8c25a';
  ctx.fillRect(b.x, b.y, b.w, b.h);
  ctx.strokeStyle = COLORS.panelEdge;
  ctx.lineWidth = 3;
  ctx.strokeRect(b.x, b.y, b.w, b.h);
  ctx.fillStyle = b.disabled ? '#6e6252' : COLORS.text;
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2 + 6);
  ctx.textAlign = 'left';
}

export function drawButtons(ctx, state, mouse) {
  for (const b of buttonsFor(state)) {
    const hover = mouse.x >= b.x && mouse.x <= b.x + b.w && mouse.y >= b.y && mouse.y <= b.y + b.h;
    drawButton(ctx, b, hover && !b.disabled);
  }
}

function drawTitleScene(ctx, state) {
  // A sunset farm scene, not a text wall: barn, fences, hay, a turkey
  // sprinting for its life with the farmer in hot pursuit.
  const g = ctx.createLinearGradient(0, 0, 0, 600);
  g.addColorStop(0, COLORS.skyTop);
  g.addColorStop(0.55, COLORS.skyMid);
  g.addColorStop(1, COLORS.skyLow);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 960, 600);
  ctx.fillStyle = '#fff3d6';
  ctx.beginPath();
  ctx.arc(770, 110, 52, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,243,214,0.5)';
  ctx.beginPath();
  ctx.arc(770, 110, 70, 0, Math.PI * 2);
  ctx.fill();
  // Rolling hills.
  ctx.fillStyle = '#6b9a3e';
  ctx.beginPath();
  ctx.moveTo(0, 420);
  ctx.quadraticCurveTo(240, 330, 480, 410);
  ctx.quadraticCurveTo(720, 480, 960, 400);
  ctx.lineTo(960, 600);
  ctx.lineTo(0, 600);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#7fae4c';
  ctx.beginPath();
  ctx.moveTo(0, 470);
  ctx.quadraticCurveTo(300, 400, 640, 470);
  ctx.quadraticCurveTo(820, 510, 960, 460);
  ctx.lineTo(960, 600);
  ctx.lineTo(0, 600);
  ctx.closePath();
  ctx.fill();
  // Barn on the left, fence along the bottom.
  ctx.fillStyle = COLORS.barn;
  ctx.fillRect(60, 300, 170, 120);
  ctx.fillStyle = COLORS.barnRoof;
  ctx.beginPath();
  ctx.moveTo(48, 306);
  ctx.lineTo(145, 250);
  ctx.lineTo(242, 306);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#5f2a20';
  ctx.fillRect(125, 360, 40, 60);
  ctx.fillStyle = COLORS.fence;
  ctx.fillRect(0, 520, 960, 12);
  ctx.fillStyle = COLORS.fenceDark;
  for (let x = 20; x < 960; x += 60) ctx.fillRect(x, 506, 8, 40);
  // Haystacks.
  for (const [hx, hy] of [[330, 480], [880, 470]]) {
    ctx.fillStyle = COLORS.hay;
    ctx.beginPath();
    ctx.ellipse(hx, hy, 46, 38, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = COLORS.hayDark;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hx, hy - 20);
    ctx.quadraticCurveTo(hx + 20, hy, hx, hy + 26);
    ctx.stroke();
  }
  // The chase: turkey ahead, farmer behind, dust in the air.
  // It runs across the middle of the scene, above the buttons.
  const runX = 480 + Math.sin(state.titleBob) * 26;
  const bob = Math.abs(Math.sin(state.titleBob * 3)) * 6;
  const fakeTurkey = { x: runX, y: 392 - bob, r: 16, facing: 1, invuln: 0, moving: true, stepPhase: state.titleBob * 10 };
  drawTurkey(ctx, fakeTurkey, state.time);
  const fakeFarmer = {
    x: runX - 150, y: 400, r: 18, dir: 0, mode: 'chase',
    suspicion: 1, waypointIndex: 0, lastSeen: null, searchTimer: 0,
    chaseLost: 0, preview: [], intent: '!',
  };
  drawFarmer(ctx, fakeFarmer, state, state.time);
  ctx.fillStyle = 'rgba(200,155,98,0.5)';
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(runX - 60 - i * 22, 414 - (i % 2) * 6, 5 + i, 0, Math.PI * 2);
    ctx.fill();
  }
  // Title block.
  ctx.fillStyle = 'rgba(43,26,14,0.55)';
  ctx.fillRect(0, 18, 960, 128);
  ctx.fillStyle = '#ffd23f';
  ctx.font = 'bold 52px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText("GIBLET'S GREAT ESCAPE", 480, 72);
  ctx.fillStyle = '#fff3d6';
  ctx.font = 'italic 20px Georgia, serif';
  ctx.fillText('One turkey. One farmer. One Thanksgiving dinner to dodge.', 480, 104);
  ctx.font = '15px sans-serif';
  ctx.fillText('Farmyard → Barnyard → Kitchen — grab corn, hide in the hay, and don\'t get caught!', 480, 132);
  ctx.textAlign = 'left';
}

function drawHowTo(ctx) {
  panel(ctx, 180, 150, 600, 290);
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('HOW TO PLAY', 480, 182);
  ctx.font = '15px sans-serif';
  const lines = [
    'WASD or arrow keys — waddle. Hold SHIFT to sprint (uses stamina).',
    'Farmer Bramwell patrols with a vision cone. If he sees you,',
    'his suspicion fills — then he CHASES. Break line of sight!',
    'SPACE near a haystack to hide. Q drops a decoy, F puffs smoke.',
    'Grab corn to spend in the shop between stages.',
    'Dodge the carving knives and stay out of the hot oven.',
    'Reach the green EXIT of all 3 stages to escape Thanksgiving.',
    'You have 3 lives. Getting caught costs one — and the farmer',
    'drags you back to the start of the stage.',
  ];
  lines.forEach((l, i) => ctx.fillText(l, 480, 212 + i * 22));
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('Click anywhere to close.', 480, 424);
  ctx.textAlign = 'left';
}

function drawShop(ctx, state) {
  panel(ctx, 150, 90, 660, 380);
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('BETWEEN STAGES — CORN SHOP', 480, 128);
  ctx.font = '15px sans-serif';
  ctx.fillText(`You carry ${state.corn} corn. Spend it before ${state.stageIndex + 2 <= 3 ? 'stage ' + (state.stageIndex + 2) : 'the end'} — corn does not save you from the oven.`, 480, 154);
  SHOP_ITEMS.forEach((item, i) => {
    const y = 218 + i * 64;
    const owned = ownedCount(state, item.id);
    const affordable = canBuy(state, item);
    ctx.fillStyle = affordable ? '#fff3d6' : 'rgba(0,0,0,0.08)';
    ctx.fillRect(220, y - 38, 520, 52);
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${item.key}. ${item.name} — ${item.cost} corn  (own ${owned}/${item.max})`, 232, y - 18);
    ctx.font = '13px sans-serif';
    ctx.fillText(item.desc, 232, y + 2);
  });
  ctx.textAlign = 'left';
}

function drawEndScreen(ctx, state, escaped) {
  ctx.fillStyle = escaped ? 'rgba(47,125,50,0.82)' : 'rgba(125,44,34,0.86)';
  ctx.fillRect(0, 0, 960, 600);
  ctx.fillStyle = '#fff3d6';
  ctx.font = 'bold 46px Georgia, serif';
  ctx.textAlign = 'center';
  if (escaped) {
    ctx.fillText('ESCAPED!', 480, 120);
    ctx.font = 'italic 22px Georgia, serif';
    ctx.fillText('Giblet lives to gobble another day.', 480, 158);
  } else {
    ctx.fillText('CAUGHT!', 480, 120);
    ctx.font = 'italic 22px Georgia, serif';
    ctx.fillText(state.endStats?.reason || 'Thanksgiving dinner it is...', 480, 158);
  }
  // Score breakdown.
  panel(ctx, 280, 190, 400, 210);
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('YOUR RUN', 480, 222);
  ctx.font = '16px sans-serif';
  const rows = [
    ['Final score', Math.floor(state.score)],
    ['Distance run', `${Math.floor(state.distance)} m`],
    ['Corn collected', state.stats.cornCollected],
    ['Times spotted', state.stats.spotted],
    ['Times caught', state.stats.timesCaught],
    ['Stages cleared', `${state.stats.stagesCleared} / 3`],
    ['Lives left', state.lives],
  ];
  rows.forEach(([k, v], i) => {
    ctx.textAlign = 'left';
    ctx.fillText(k, 310, 252 + i * 22);
    ctx.textAlign = 'right';
    ctx.fillText(String(v), 650, 252 + i * 22);
  });
  ctx.textAlign = 'left';
}

export function draw(ctx, state, mouse, showHowTo) {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  if (state.screen === 'title') {
    drawTitleScene(ctx, state);
    drawButtons(ctx, state, mouse);
    if (showHowTo) drawHowTo(ctx);
    return;
  }
  if (state.screen === 'shop') {
    drawGround(ctx, state.stage, state.time);
    drawObstacles(ctx, state.stage);
    drawShop(ctx, state);
    drawButtons(ctx, state, mouse);
    drawLog(ctx, state);
    return;
  }
  if (state.screen === 'caught' || state.screen === 'escaped') {
    drawEndScreen(ctx, state, state.screen === 'escaped');
    drawButtons(ctx, state, mouse);
    return;
  }
  // play or paused: the world, then the HUD.
  drawGround(ctx, state.stage, state.time);
  drawObstacles(ctx, state.stage);
  drawOvens(ctx, state.stage, state.time);
  drawHaystacks(ctx, state.stage);
  drawExit(ctx, state.stage, state.time);
  drawCorn(ctx, state.stage, state.time);
  drawDecoysAndSmoke(ctx, state, state.time);
  drawTurkey(ctx, state.turkey, state.time);
  drawFarmer(ctx, state.farmer, state, state.time);
  drawKnives(ctx, state.stage, state.time);
  drawHud(ctx, state);
  drawLog(ctx, state);
  drawFlashMessage(ctx, state);
  if (state.screen === 'play') drawPauseHint(ctx);
  if (state.screen === 'paused') {
    ctx.fillStyle = 'rgba(43,26,14,0.6)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.fillStyle = '#fff3d6';
    ctx.font = 'bold 40px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', 480, 240);
    ctx.font = '16px sans-serif';
    ctx.fillText('Take a breath. The farmer is waiting.', 480, 272);
    ctx.textAlign = 'left';
    drawButtons(ctx, state, mouse);
  }
}
