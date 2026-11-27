// shots.js — screenshot staging: ?shot=title|play|caught|escaped|shop puts
// the game into a real state of its own code so a screenshot shows it.
// One job: set up a scene for a photo. Play-testing uses real input instead.
import { createGameState, startRun, startStage, clearStage } from './state.js';
import { pushLog } from './log.js';

export function applyShotParam(state) {
  const q = new URLSearchParams(window.location.search);
  const shot = q.get('shot');
  if (!shot) return false;
  if (shot === 'title') {
    return true; // title is the default screen
  }
  if (shot === 'play') {
    startRun(state);
    startStage(state, 1); // Barnyard: knives, crates, haystacks in frame
    state.turkey.x = 470;
    state.turkey.y = 320;
    state.turkey.facing = 1;
    state.corn = 6;
    state.score = 842;
    state.distance = 214;
    state.farmer.x = 620;
    state.farmer.y = 300;
    state.farmer.dir = Math.PI;
    state.farmer.mode = 'chase';
    state.farmer.suspicion = 1;
    state.farmer.intent = '!';
    state.farmer.lastSeen = { x: 470, y: 320 };
    state.farmer.preview = [{ x: 470, y: 320 }];
    state.stats.spotted = 1;
    state.stageSpotted = true;
    pushLog(state, 'Farmer Bramwell spotted you! He is coming!');
    pushLog(state, 'Corn! +5 points (6 in the pouch).');
    return true;
  }
  if (shot === 'caught') {
    startRun(state);
    state.lives = 0;
    state.score = 613;
    state.distance = 148;
    state.stats.cornCollected = 4;
    state.stats.spotted = 2;
    state.stats.timesCaught = 3;
    state.stats.stagesCleared = 1;
    state.screen = 'caught';
    state.endStats = { reason: 'Caught by Farmer Bramwell!' };
    pushLog(state, 'Caught by Farmer Bramwell! Thanksgiving dinner it is...');
    return true;
  }
  if (shot === 'escaped') {
    startRun(state);
    state.score = 2847;
    state.distance = 612;
    state.lives = 2;
    state.corn = 9;
    state.stats.cornCollected = 17;
    state.stats.spotted = 3;
    state.stats.timesCaught = 1;
    state.stats.stagesCleared = 3;
    state.screen = 'escaped';
    pushLog(state, 'ESCAPED! Out the back door and into the woods!');
    return true;
  }
  if (shot === 'shop') {
    startRun(state);
    state.corn = 47;
    state.score = 1250;
    state.distance = 260;
    state.screen = 'shop';
    pushLog(state, 'Farmyard cleared! +500 stage, +120 time.');
    return true;
  }
  return false;
}

// Test hooks used by the local play-test driver (never by the game itself).
export function debugWarpToExit(state) {
  if (state.screen !== 'play') return false;
  const e = state.stage.exit;
  state.turkey.x = e.x + e.w / 2;
  state.turkey.y = e.y + e.h / 2;
  return true;
}

export function debugStageClear(state) {
  if (state.screen !== 'play') return false;
  clearStage(state);
  return true;
}
