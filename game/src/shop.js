// shop.js — the between-stage upgrade shop. Corn buys Speed Boots, Decoy
// Turkeys and Smoke Puffs. One job: shop rules, no drawing.
import { SHOP_ITEMS } from './config.js';
import { pushLog } from './log.js';
import { sfx } from './audio.js';
import { startStage } from './state.js';

export function ownedCount(state, id) {
  if (id === 'boots') return state.upgrades.boots;
  return state.upgrades[id];
}

export function canBuy(state, item) {
  return state.corn >= item.cost && ownedCount(state, item.id) < item.max;
}

export function buyItem(state, item) {
  if (!canBuy(state, item)) {
    sfx.denied();
    pushLog(state, `Not enough corn for ${item.name} — keep pecking!`);
    return false;
  }
  state.corn -= item.cost;
  if (item.id === 'boots') state.upgrades.boots++;
  else state.upgrades[item.id]++;
  sfx.buy();
  pushLog(state, `Bought ${item.name} for ${item.cost} corn.`);
  return true;
}

export function continueToNextStage(state) {
  sfx.stageClear();
  startStage(state, state.stageIndex + 1);
  state.screen = 'play';
}
