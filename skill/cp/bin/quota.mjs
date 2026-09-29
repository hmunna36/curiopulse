#!/usr/bin/env node
// ElevenLabs characters left across every key in ~/.config/va/elevenlabs.env (and nothing is printed but
// the numbers). Exit code 0 = at least <needed> characters are available in total, 2 = not enough.
// usage: node quota.mjs [needed=4300]      (a CurioPulse Short is ≈ 1,000–1,300 characters, plus retakes)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const NEED = Number(process.argv[2] ?? 1600);
const file = path.join(os.homedir(), '.config/va/elevenlabs.env');
if (!fs.existsSync(file)) {
  console.log(`no key file at ${file}`);
  process.exit(2);
}
const keys = [...new Set([...fs.readFileSync(file, 'utf8').matchAll(/^\s*ELEVENLABS_API_KEY\w*\s*=\s*"?([^"\n]+)"?/gm)].map((m) => m[1].trim()))];
let total = 0;
const resets = [];
for (const [i, key] of keys.entries()) {
  try {
    const r = await fetch('https://api.elevenlabs.io/v1/user/subscription', {headers: {'xi-api-key': key}});
    if (!r.ok) {
      console.log(`account ${i + 1}: HTTP ${r.status}`);
      continue;
    }
    const s = await r.json();
    const left = Math.max(0, s.character_limit - s.character_count);
    const reset = s.next_character_count_reset_unix ? new Date(s.next_character_count_reset_unix * 1000).toISOString().slice(0, 10) : '?';
    total += left;
    resets.push(reset);
    console.log(`account ${i + 1}: ${left} of ${s.character_limit} left, resets ${reset}`);
  } catch (e) {
    console.log(`account ${i + 1}: ${String(e.message ?? e).slice(0, 80)}`);
  }
}
const next = resets.filter((d) => d !== '?').sort()[0] ?? '?';
console.log(`total: ${total} characters available; a Short needs about ${NEED}${total < NEED ? ` — NOT ENOUGH (next reset ${next})` : ''}`);
process.exit(total >= NEED ? 0 : 2);
