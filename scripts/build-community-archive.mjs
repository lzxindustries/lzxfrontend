#!/usr/bin/env node
/**
 * Build the LZX Discourse static archive into public/community/.
 *
 * Requires the KiCad workspace scrape at ../kicad/archive/discourse.
 */
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const frontendRoot = join(here, '..');
const kicadRoot = join(frontendRoot, '..', 'lzxindustries', 'kicad');
const publish = join(kicadRoot, 'tools', 'discourse_publish.py');

const result = spawnSync(
  process.platform === 'win32' ? 'python' : 'python3',
  [publish, '--skip-validate', '--frontend'],
  {cwd: kicadRoot, stdio: 'inherit'},
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log('\nCommunity archive ready under public/community/');
console.log('Preview: yarn dev → http://localhost:3000/community/');
