// ui.js — clickable button rectangles for every screen, shared by the
// renderer and the click handler so they can never disagree. One job:
// where the buttons are.
import { VIEW_W, VIEW_H } from './config.js';
import { SHOP_ITEMS } from './config.js';
import { ownedCount, canBuy } from './shop.js';

export function buttonsFor(state) {
  const cx = VIEW_W / 2;
  if (state.screen === 'title') {
    return [
      { id: 'start', label: '▶  START THE ESCAPE', x: cx - 150, y: 452, w: 300, h: 52 },
      { id: 'how', label: 'HOW TO PLAY', x: cx - 150, y: 514, w: 300, h: 40 },
    ];
  }
  if (state.screen === 'shop') {
    const btns = SHOP_ITEMS.map((item, i) => ({
      id: `buy-${item.id}`,
      label: `${item.key}. ${item.name} — ${item.cost} corn  (${ownedCount(state, item.id)}/${item.max})`,
      x: cx - 260, y: 218 + i * 64, w: 520, h: 52,
      disabled: !canBuy(state, item),
    }));
    btns.push({ id: 'continue', label: 'CONTINUE TO ' + (state.stageIndex + 1 < 3 ? 'STAGE ' + (state.stageIndex + 2) : 'THE END'), x: cx - 150, y: 428, w: 300, h: 52 });
    return btns;
  }
  if (state.screen === 'paused') {
    return [
      { id: 'resume', label: 'RESUME', x: cx - 130, y: 300, w: 260, h: 48 },
      { id: 'restart', label: 'RESTART RUN', x: cx - 130, y: 360, w: 260, h: 48 },
      { id: 'quit', label: 'QUIT TO TITLE', x: cx - 130, y: 420, w: 260, h: 48 },
    ];
  }
  if (state.screen === 'caught' || state.screen === 'escaped') {
    return [
      { id: 'again', label: '↻  RUN AGAIN  (R)', x: cx - 150, y: 440, w: 300, h: 52 },
      { id: 'title', label: 'BACK TO TITLE', x: cx - 150, y: 504, w: 300, h: 40 },
    ];
  }
  return [];
}

export function buttonAt(state, x, y) {
  return buttonsFor(state).find((b) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) || null;
}
