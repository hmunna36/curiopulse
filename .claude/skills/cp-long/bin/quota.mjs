#!/usr/bin/env node
// ElevenLabs characters left (nothing is printed but the numbers). Exit 0 = at least <needed> characters are
// available on a PAID plan, 2 = not enough or no key.
// usage: node quota.mjs [needed=4000]   (a long-form script is ~2,200-2,700 characters, plus retakes)
// Keys: the environment variable ELEVENLABS_API_KEY (cloud routine), else every ELEVENLABS_API_KEY* line of
// $ELEVENLABS_ENV_FILE or ~/.config/va/elevenlabs.env (the Mac).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const NEED = Number(process.argv[2] ?? 4000);
let keys = [];
if (process.env.ELEVENLABS_API_KEY) keys = [process.env.ELEVENLABS_API_KEY.trim()];
else {
  const file = process.env.ELEVENLABS_ENV_FILE ?? path.join(os.homedir(), '.config/va/elevenlabs.env');
  if (fs.existsSync(file)) keys = [...new Set([...fs.readFileSync(file, 'utf8').matchAll(/^\s*ELEVENLABS_API_KEY\w*\s*=\s*"?([^"\n]+)"?/gm)].map((m) => m[1].trim()))];
}
if (!keys.length) {
  console.log('no ElevenLabs key: set ELEVENLABS_API_KEY in the cloud environment');
  process.exit(2);
}
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
    // Paid plans only (user, 1 Oct 2026): free plans are non-commercial.
    if (String(s.tier ?? '').toLowerCase() === 'free') {
      console.log(`account ${i + 1}: free plan (no commercial licence), not used`);
      continue;
    }
    const left = Math.max(0, s.character_limit - s.character_count);
    const reset = s.next_character_count_reset_unix ? new Date(s.next_character_count_reset_unix * 1000).toISOString().slice(0, 10) : '?';
    total += left;
    resets.push(reset);
    console.log(`account ${i + 1}: ${left} of ${s.character_limit} left, resets ${reset}`);
  } catch (e) {
    console.log(`account ${i + 1}: ${String(e.cause?.code ?? e.message ?? e).slice(0, 80)} (is api.elevenlabs.io allowed by the environment's network setting?)`);
  }
}
const next = resets.filter((d) => d !== '?').sort()[0] ?? '?';
console.log(`total: ${total} characters available; a long-form video needs about ${NEED}${total < NEED ? ` — NOT ENOUGH (next reset ${next})` : ''}`);
process.exit(total >= NEED ? 0 : 2);
