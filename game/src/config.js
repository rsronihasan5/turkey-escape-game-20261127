// config.js — every tunable number, colour, stage layout and shop item for
// Giblet's Great Escape. One job: hold the game's data, no logic.
export const VIEW_W = 960;
export const VIEW_H = 600;

export const COLORS = {
  skyTop: '#f7b267',
  skyMid: '#f4845f',
  skyLow: '#e85d3d',
  grass: '#7fae4c',
  grassDark: '#6b9a3e',
  dirt: '#c89b62',
  dirtDark: '#b3854f',
  fence: '#8a5a2b',
  fenceDark: '#6e4520',
  barn: '#a63d2f',
  barnRoof: '#7d2c22',
  hay: '#e8c25a',
  hayDark: '#c9a13c',
  kitchenFloor: '#d9c7a7',
  kitchenWall: '#f2e3c6',
  counter: '#8d6b4a',
  counterTop: '#b98d5f',
  oven: '#3d3d3d',
  ovenGlow: '#ff7a1a',
  turkeyBody: '#8a5a2b',
  turkeyDark: '#6e4520',
  turkeyWing: '#5f3d1c',
  turkeyHead: '#c98d5f',
  turkeyBeak: '#f2a541',
  turkeyWattle: '#d93a2b',
  turkeyTail: '#b4762e',
  farmerShirt: '#3d6fb4',
  farmerOveralls: '#2f4f8f',
  farmerSkin: '#e8b98a',
  farmerHat: '#e8c25a',
  corn: '#ffd23f',
  cornHusk: '#5f9e3a',
  knife: '#dfe6ea',
  knifeHandle: '#3d2b1f',
  text: '#2b1a0e',
  panel: '#fff3d6',
  panelEdge: '#8a5a2b',
  danger: '#d93a2b',
  good: '#2f7d32',
};

// Movement and chase tuning: the turkey outruns the farmer only while
// sprinting, so a narrow escape stays fair and walking gets you caught.
export const TURKEY_WALK = 168;
export const TURKEY_SPRINT = 252;
export const TURKEY_SPRINT_DRAIN = 30; // stamina per second while sprinting
export const TURKEY_SPRINT_REGEN = 20; // stamina per second while resting
export const TURKEY_RADIUS = 16;
export const BOOTS_BONUS = 0.18; // +18% speed per pair of Speed Boots
export const FARMER_PATROL = 72;
export const FARMER_SEARCH = 112;
export const FARMER_CHASE = 208;
export const FARMER_RADIUS = 18;
export const FARMER_CATCH_DIST = 30;
export const VISION_RANGE = 265;
export const VISION_HALF_ANGLE = 0.62; // radians, about 35 degrees each side
export const SUSPICION_RATE = 2.4; // per second while the turkey is visible
export const SUSPICION_DECAY = 0.55; // per second while unseen
export const SEARCH_TIME = 4.0; // seconds the farmer hunts the last seen spot
export const DECOY_TIME = 4.0;
export const SMOKE_TIME = 3.0;
export const SMOKE_RADIUS = 72;
export const INVULN_TIME = 2.0; // seconds of safety after losing a life
export const OVEN_BURN_TIME = 0.6; // seconds standing in the oven before a hit
export const KNIFE_HIT_DIST = 26;

export const SCORE = {
  corn: 5,
  perMeter: 1,
  stageClear: 500,
  hideBonus: 25, // first hide of a stage
  ghostBonus: 300, // clear a stage never spotted
};

// The shop sells between stages. Corn is the currency, earned in the run.
export const SHOP_ITEMS = [
  {
    id: 'boots',
    key: '1',
    name: 'Speed Boots',
    cost: 30,
    max: 2,
    desc: '+18% run speed each. Outrun the farmer, don\'t just out-hide him.',
  },
  {
    id: 'decoy',
    key: '2',
    name: 'Decoy Turkey',
    cost: 25,
    max: 3,
    desc: 'Press Q to drop a straw turkey. The farmer chases it for 4 seconds.',
  },
  {
    id: 'smoke',
    key: '3',
    name: 'Smoke Puff',
    cost: 20,
    max: 3,
    desc: 'Press F for a puff of smoke. Breaks the farmer\'s line of sight.',
  },
];

// Stage layouts. Obstacles with blocksSight:true hide the turkey from the
// farmer's vision cone. The exit is the doorway to the next stage.
export const STAGES = [
  {
    name: 'Farmyard',
    sub: 'Stage 1 of 3 — slip past Farmer Bramwell',
    ground: 'grass',
    spawn: { x: 90, y: 300 },
    exit: { x: 912, y: 250, w: 40, h: 100, label: 'TO THE BARNYARD' },
    farmerSpawn: { x: 700, y: 150 },
    waypoints: [
      { x: 700, y: 150 }, { x: 700, y: 400 }, { x: 500, y: 400 },
      { x: 500, y: 150 }, { x: 620, y: 300 },
    ],
    obstacles: [
      { x: 0, y: 0, w: 960, h: 26, type: 'fence', blocksSight: false },
      { x: 0, y: 574, w: 960, h: 26, type: 'fence', blocksSight: false },
      { x: 0, y: 26, w: 26, h: 548, type: 'fence', blocksSight: false },
      { x: 934, y: 26, w: 26, h: 224, type: 'fence', blocksSight: false },
      { x: 934, y: 350, w: 26, h: 224, type: 'fence', blocksSight: false },
      { x: 180, y: 80, w: 150, h: 110, type: 'barn', blocksSight: true },
      { x: 620, y: 420, w: 120, h: 90, type: 'crate', blocksSight: true },
      { x: 380, y: 240, w: 90, h: 70, type: 'crate', blocksSight: true },
    ],
    haystacks: [
      { x: 300, y: 470, r: 34 },
      { x: 560, y: 120, r: 34 },
      { x: 800, y: 480, r: 30 },
    ],
    cornCount: 8,
    cornSeed: 11,
    knifePaths: [],
    ovens: [],
    parSeconds: 75,
  },
  {
    name: 'Barnyard',
    sub: 'Stage 2 of 3 — the carving knife is loose',
    ground: 'dirt',
    spawn: { x: 90, y: 300 },
    exit: { x: 912, y: 250, w: 40, h: 100, label: 'INTO THE KITCHEN' },
    farmerSpawn: { x: 480, y: 120 },
    waypoints: [
      { x: 480, y: 120 }, { x: 760, y: 120 }, { x: 840, y: 480 },
      { x: 300, y: 480 }, { x: 300, y: 180 },
    ],
    obstacles: [
      { x: 0, y: 0, w: 960, h: 26, type: 'fence', blocksSight: false },
      { x: 0, y: 574, w: 960, h: 26, type: 'fence', blocksSight: false },
      { x: 0, y: 26, w: 26, h: 548, type: 'fence', blocksSight: false },
      { x: 934, y: 26, w: 26, h: 224, type: 'fence', blocksSight: false },
      { x: 934, y: 350, w: 26, h: 224, type: 'fence', blocksSight: false },
      { x: 200, y: 60, w: 170, h: 90, type: 'barn', blocksSight: true },
      { x: 560, y: 60, w: 170, h: 90, type: 'barn', blocksSight: true },
      { x: 420, y: 300, w: 110, h: 80, type: 'crate', blocksSight: true },
      { x: 700, y: 380, w: 100, h: 80, type: 'crate', blocksSight: true },
    ],
    haystacks: [
      { x: 250, y: 450, r: 34 },
      { x: 840, y: 150, r: 30 },
    ],
    cornCount: 10,
    cornSeed: 27,
    knifePaths: [
      [{ x: 500, y: 220 }, { x: 500, y: 520 }],
    ],
    ovens: [],
    parSeconds: 90,
  },
  {
    name: 'Kitchen',
    sub: 'Stage 3 of 3 — past the oven, out the back door!',
    ground: 'kitchen',
    spawn: { x: 90, y: 300 },
    exit: { x: 912, y: 250, w: 40, h: 100, label: 'FREEDOM!' },
    farmerSpawn: { x: 480, y: 180 },
    waypoints: [
      { x: 480, y: 180 }, { x: 700, y: 200 }, { x: 700, y: 385 },
      { x: 300, y: 385 }, { x: 300, y: 200 },
    ],
    obstacles: [
      { x: 0, y: 0, w: 960, h: 26, type: 'wall', blocksSight: false },
      { x: 0, y: 574, w: 960, h: 26, type: 'wall', blocksSight: false },
      { x: 0, y: 26, w: 26, h: 548, type: 'wall', blocksSight: false },
      { x: 934, y: 26, w: 26, h: 224, type: 'wall', blocksSight: false },
      { x: 934, y: 350, w: 26, h: 224, type: 'wall', blocksSight: false },
      { x: 200, y: 60, w: 200, h: 70, type: 'counter', blocksSight: true },
      { x: 560, y: 60, w: 200, h: 70, type: 'counter', blocksSight: true },
      { x: 200, y: 470, w: 200, h: 70, type: 'counter', blocksSight: true },
      { x: 560, y: 470, w: 200, h: 70, type: 'counter', blocksSight: true },
      { x: 430, y: 240, w: 100, h: 90, type: 'table', blocksSight: true },
    ],
    haystacks: [],
    cornCount: 10,
    cornSeed: 41,
    knifePaths: [
      [{ x: 330, y: 180 }, { x: 330, y: 430 }],
      [{ x: 630, y: 430 }, { x: 630, y: 180 }],
    ],
    ovens: [
      { x: 430, y: 130, w: 100, h: 60 },
      { x: 430, y: 410, w: 100, h: 60 },
    ],
    parSeconds: 100,
  },
];
