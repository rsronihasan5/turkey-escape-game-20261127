// state.js — the one central game state and the transitions between screens.
// One job: hold the run and move it between title, play, shop and endings.
import { STAGES, SCORE } from './config.js';
import { buildStage } from './world.js';
import { pushLog, flashMessage } from './log.js';

export function createGameState() {
  return {
    screen: 'title', // title | play | shop | paused | caught | escaped
    time: 0,
    stageIndex: 0,
    stage: null,
    score: 0,
    distance: 0, // metres run
    lives: 3,
    corn: 0,
    stamina: 100,
    stageTime: 0,
    turkey: null,
    farmer: null,
    decoys: [],
    smokes: [],
    upgrades: { boots: 0, decoy: 0, smoke: 0 },
    log: [],
    message: '',
    messageTimer: 0,
    stats: { spotted: 0, timesCaught: 0, cornCollected: 0, hides: 0, stagesCleared: 0 },
    stageSpotted: false,
    stageHidden: false,
    shopSelection: 0,
    endStats: null,
    titleBob: 0,
  };
}

export function startRun(state) {
  state.score = 0;
  state.distance = 0;
  state.lives = 3;
  state.corn = 0;
  state.stamina = 100;
  state.upgrades = { boots: 0, decoy: 0, smoke: 0 };
  state.stats = { spotted: 0, timesCaught: 0, cornCollected: 0, hides: 0, stagesCleared: 0 };
  state.log = [];
  startStage(state, 0);
  state.screen = 'play';
  pushLog(state, 'Run! Escape the farm before dinner.');
}

export function startStage(state, index) {
  state.stageIndex = index;
  state.stage = buildStage(index);
  state.stageTime = 0;
  state.stageSpotted = false;
  state.stageHidden = false;
  state.decoys = [];
  state.smokes = [];
  const s = state.stage;
  state.turkey = {
    x: s.spawn.x, y: s.spawn.y, r: 16, vx: 0, vy: 0,
    facing: 1, hidden: false, invuln: 0, ovenTime: 0, moving: false, stepPhase: 0,
  };
  state.farmer = {
    x: s.def.farmerSpawn.x, y: s.def.farmerSpawn.y, r: 18,
    dir: Math.PI, mode: 'patrol', suspicion: 0, waypointIndex: 0,
    lastSeen: null, searchTimer: 0, chaseLost: 0,
    preview: [], intent: '', targetDecoy: null,
  };
  pushLog(state, `${s.def.name} — ${s.def.sub}`);
}

export function clearStage(state) {
  const def = state.stage.def;
  const timeBonus = Math.max(0, Math.round((def.parSeconds - state.stageTime) * 4));
  const ghost = state.stageSpotted ? 0 : SCORE.ghostBonus;
  state.score += SCORE.stageClear + timeBonus + ghost;
  state.stats.stagesCleared++;
  state.endStats = { stageBonus: SCORE.stageClear, timeBonus, ghost };
  if (state.stageIndex >= STAGES.length - 1) {
    state.screen = 'escaped';
    pushLog(state, 'ESCAPED! Out the back door and into the woods!');
  } else {
    state.screen = 'shop';
    pushLog(state, `${def.name} cleared! +${SCORE.stageClear} stage, +${timeBonus} time${ghost ? `, +${ghost} never-spotted` : ''}.`);
  }
}

export function loseLife(state, reason) {
  const t = state.turkey;
  if (t.invuln > 0 || state.screen !== 'play') return;
  state.lives--;
  state.stats.timesCaught++;
  t.invuln = 2.0;
  t.ovenTime = 0;
  if (state.lives <= 0) {
    state.screen = 'caught';
    state.endStats = { reason };
    pushLog(state, `${reason} Thanksgiving dinner it is...`);
    return;
  }
  // Caught but still alive: dragged back to the start, farmer loses the trail.
  t.x = state.stage.spawn.x;
  t.y = state.stage.spawn.y;
  t.hidden = false;
  state.farmer.mode = 'patrol';
  state.farmer.suspicion = 0;
  state.farmer.lastSeen = null;
  flashMessage(state, `${reason} — ${state.lives} ${state.lives === 1 ? 'life' : 'lives'} left!`);
  pushLog(state, `${reason} Lost a life — back to the start!`);
}

export function addScore(state, n) {
  state.score += n;
}
