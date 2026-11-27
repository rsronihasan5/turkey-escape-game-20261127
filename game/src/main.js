// main.js — bootstrap and game loop for Giblet's Great Escape.
// One job: wire the canvas, the loop and the screens together.
import { VIEW_W, VIEW_H, SHOP_ITEMS } from './config.js';
import { createGameState, startRun, startStage, clearStage } from './state.js';
import { createInput } from './input.js';
import { updateTurkey } from './turkey.js';
import { updateFarmer } from './farmer.js';
import { updateKnives, updateOvens } from './hazards.js';
import { updateCorn } from './corn.js';
import { buyItem, continueToNextStage } from './shop.js';
import { draw } from './render.js';
import { buttonAt } from './ui.js';
import { applyShotParam, debugWarpToExit, debugStageClear } from './shots.js';
import { sfx } from './audio.js';
import { pushLog } from './log.js';
import { pointInRect } from './world.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = VIEW_W;
canvas.height = VIEW_H;

const state = createGameState();
const input = createInput(canvas);
let showHowTo = false;
let last = performance.now();

// Test hooks for the local play-test driver.
window.__turkeyGame = {
  state,
  warpToExit: () => debugWarpToExit(state),
  stageClear: () => debugStageClear(state),
  startRun: () => startRun(state),
};

applyShotParam(state);

function handleClicks() {
  if (!input.consumeClick()) return;
  const m = input.mousePos();
  if (state.screen === 'title' && showHowTo) {
    showHowTo = false;
    sfx.click();
    return;
  }
  const b = buttonAt(state, m.x, m.y);
  if (!b || b.disabled) return;
  sfx.click();
  if (b.id === 'start') {
    sfx.init();
    sfx.startMusic();
    startRun(state);
  } else if (b.id === 'how') {
    showHowTo = true;
  } else if (b.id.startsWith('buy-')) {
    const item = SHOP_ITEMS.find((i) => `buy-${i.id}` === b.id);
    if (item) buyItem(state, item);
  } else if (b.id === 'continue') {
    continueToNextStage(state);
  } else if (b.id === 'resume') {
    state.screen = 'play';
  } else if (b.id === 'restart') {
    startRun(state);
  } else if (b.id === 'quit' || b.id === 'title') {
    sfx.stopMusic();
    state.screen = 'title';
    state.stage = null;
  } else if (b.id === 'again') {
    sfx.startMusic();
    startRun(state);
  }
}

function handleKeys() {
  if (input.wasPressed('m', 'M')) {
    state.muted = sfx.toggleMute();
    pushLog(state, state.muted ? 'Sound off.' : 'Sound on.');
  }
  if (state.screen === 'title') {
    if (input.wasPressed('Enter')) {
      sfx.init();
      sfx.startMusic();
      startRun(state);
    }
    return;
  }
  if (state.screen === 'play') {
    if (input.wasPressed('p', 'P', 'Escape')) {
      state.screen = 'paused';
      return;
    }
  } else if (state.screen === 'paused') {
    if (input.wasPressed('p', 'P', 'Escape', 'Enter')) state.screen = 'play';
    return;
  }
  if (state.screen === 'shop') {
    for (const item of SHOP_ITEMS) {
      if (input.wasPressed(item.key)) buyItem(state, item);
    }
    if (input.wasPressed('Enter')) continueToNextStage(state);
    return;
  }
  if (state.screen === 'caught' || state.screen === 'escaped') {
    if (input.wasPressed('r', 'R', 'Enter')) {
      sfx.startMusic();
      startRun(state);
    }
    return;
  }
}

function update(dt) {
  state.time += dt;
  state.titleBob += dt * 0.9;
  if (state.screen !== 'play') return;
  state.stageTime += dt;
  updateTurkey(state, input, dt);
  updateFarmer(state, dt);
  updateKnives(state, dt);
  updateOvens(state, dt);
  updateCorn(state);
  // Reaching the exit clears the stage.
  if (state.screen === 'play' && pointInRect(state.turkey.x, state.turkey.y, state.stage.exit)) {
    sfx.stageClear();
    clearStage(state);
  }
}

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  handleClicks();
  handleKeys();
  update(dt);
  draw(ctx, state, input.mousePos(), showHowTo);
  input.endFrame();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
