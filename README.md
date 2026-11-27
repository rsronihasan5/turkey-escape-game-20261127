# Giblet's Great Escape — a turkey escape game

![make.fun bounty](https://make.fun/badge/turkey-run-game-01.svg)
![rank](https://make.fun/badge/turkey-run-game-01/rsronihasan5/turkey-escape-game-20261127/rank.svg)
![reward](https://make.fun/badge/turkey-run-game-01/rsronihasan5/turkey-escape-game-20261127/reward.svg)

You are Giblet, a turkey on Thanksgiving morning. Farmer Bramwell has the
carving knife out, the oven is hot, and dinner is at six. Run the farmyard,
sneak through the barnyard, dodge the kitchen — and get out the back door.

Built for the make.fun bounty **turkey-run-game-01**
(https://make.fun/bounty/turkey-run-game-01).

## Play

Open `game/index.html` in a desktop browser (or serve `game/` with any
static server). No network, no build step, no install.

- **WASD / arrow keys** — waddle. Hold **SHIFT** to sprint (uses stamina).
- **SPACE** near a haystack — hide. The farmer walks right past.
- **Q** — drop a Decoy Turkey (bought in the shop). **F** — Smoke Puff.
- **P** — pause. **M** — mute. Mouse clicks every button.

## The game

- **3 stages of rising difficulty:** Farmyard → Barnyard → Kitchen, each
  with its own layout, hiding spots and hazards.
- **A telegraphed rival:** Farmer Bramwell patrols with a visible vision
  cone, grows suspicious (`?`), chases (`!`) and corners by aiming where
  you will be — with a dotted next-move preview so you can outplay him.
- **A second system:** corn is currency. Spend it in the shop between
  stages on Speed Boots, Decoy Turkeys and Smoke Puffs. Stamina governs
  sprinting, and clearing a stage unseen pays a Ghost bonus.
- **Hazards:** patrolling carving knives and a glowing hot oven in the
  kitchen. Three lives; getting caught drags you back to the start.
- **Polish:** title scene, HUD (score, distance, lives, corn, stamina),
  live event log, pause menu, WebAudio sounds and music with a mute toggle,
  caught and escaped end screens with a score breakdown and restart.

## Scoring

- 1 point per metre run, 5 per corn, 500 per stage cleared, time bonus up
  to 4 points per second under par, +25 for the first hide of a stage,
  +300 Ghost bonus for clearing a stage never spotted.

## Structure

The source is split into one-job files under `game/src/`:

| File | Job |
| --- | --- |
| `config.js` | tuning, colours, stage layouts, shop items |
| `random.js` | seeded RNG for deterministic layouts |
| `audio.js` | WebAudio sounds and music (no audio files) |
| `input.js` | keyboard and mouse state |
| `log.js` | live event log |
| `state.js` | central game state and screen transitions |
| `world.js` | stage building, collision, line of sight |
| `turkey.js` | the player: movement, stamina, hiding, items |
| `farmer.js` | farmer AI: patrol, suspicion, chase, search |
| `hazards.js` | oven and carving-knife hazards |
| `corn.js` | corn pickups |
| `shop.js` | between-stage shop rules |
| `ui.js` | button rectangles shared by renderer and clicks |
| `renderWorld.js` | draws the farm, turkey, farmer, hazards |
| `renderHud.js` | HUD and event log |
| `render.js` | composes each screen |
| `shots.js` | screenshot scene staging + test hooks |
| `main.js` | bootstrap and game loop |

## Hand-in

`main.ts` (Node 22, standard library only) copies `game/` and
`screenshots/` to `/output` (or `$MAKEFUN_OUTPUT_DIR`) and writes
`/output/dossier.json` via `buildDossier` from `vendor/makefun-game.ts`.

## License

MIT — see [LICENSE](LICENSE).
