// main.ts — hands Giblet's Great Escape in to make.fun.
//
// Copies game/ and screenshots/ from this repository into the output
// directory and writes /output/dossier.json with buildDossier from
// vendor/makefun-game.ts. Node 22, standard library only, no network.
//
// The output directory itself is never removed: only its contents are
// cleaned, because the grader runs as uid 65534 and /output is a
// root-owned mount point it cannot delete. Both runs write byte-identical
// output: the files are copied as-is and the dossier is deterministic.
import { buildDossier } from './vendor/makefun-game.ts';
import { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Clean only the contents of the output directory, never the directory.
mkdirSync(outDir, { recursive: true });
for (const entry of readdirSync(outDir)) {
  rmSync(join(outDir, entry), { recursive: true, force: true });
}

// Copy the game and its screenshots, in path order for determinism.
const gameSrc = join(repoRoot, 'game');
const shotsSrc = join(repoRoot, 'screenshots');
cpSync(gameSrc, join(outDir, 'game'), { recursive: true });
cpSync(shotsSrc, join(outDir, 'screenshots'), { recursive: true });

// Write the dossier the gate compares byte for byte.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
