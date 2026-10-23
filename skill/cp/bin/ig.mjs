#!/usr/bin/env node
// Instagram Reels for CurioPulse (@curio_pulse_tv). No dependencies; Node 22+. Two routes:
//
// A. Meta Business Suite in Chrome (the route in use since 2026-09-29).
//    The user's Facebook account is blocked, so no Meta developer app and no API token can exist.
//    `prepare` builds the Instagram-spec copy and splits it into parts under 10 MB (Claude in Chrome's upload limit).
//    The /cp run then schedules the Reel in Business Suite itself, in its slot (18:30 or 21:00 IST; the sheet gives
//    the date and time): see the skill's reference/publish.md. After that, `busy <date>T<HH:MM>` records the slot.
// B. The API ("Instagram API with Instagram Login", graph.instagram.com; no Facebook Page needed), used as soon as
//    `token` has stored a token (it also installs the launchd job). Everything below `queue` belongs to this route.
//
// The API cannot schedule. So `queue` books a Reel into ~/.config/cp/ig-queue.json and keeps a spool copy of the
// MP4, and a launchd job (install-job) runs `run-due` 20 minutes before each slot, at 06:10 and 18:10 IST (and at login).
// run-due takes every Reel due within 25 minutes (or overdue): it creates the container and uploads, waits until
// Instagram has processed it, sleeps until the exact release time (18:30 or 21:00 IST), publishes, and records the permalink.
//
//   node ig.mjs prepare <publish.json> [--out DIR]   route A: IG copy + ≤9 MB parts + SHA-256 + caption/time sheet
//   node ig.mjs route                     prints "api" (a token exists) or "business-suite"
//   node ig.mjs token [--clipboard]       store the long-lived token from the Meta App Dashboard (hidden input / clipboard)
//   node ig.mjs whoami                    read-only: which account the token belongs to, days left on the token
//   node ig.mjs refresh                   extend the token another 60 days (run-due does this weekly by itself)
//   node ig.mjs queue <publish.json>      book the Reel (instagram.publishAt from publish.json; "auto" = next free slot)
//   node ig.mjs upcoming                  the queue, the slots taken and the last results
//   node ig.mjs run-due [--dry-run]       what the launchd job runs
//   node ig.mjs publish-now <slug>        publish a queued Reel right away
//   node ig.mjs cancel <slug>             take a Reel out of the queue (nothing is deleted on Instagram)
//   node ig.mjs busy <YYYY-MM-DDTHH:MM>... mark slots (IST) as taken outside the API (a Reel scheduled in Business Suite);
//                                         a bare date counts as that day's 18:30
//   node ig.mjs test-container <file.mp4> create + upload + process a container WITHOUT publishing (proves the route)
//   node ig.mjs install-job | uninstall-job | job-status
//
// Files: ~/.config/cp/instagram.json (token, chmod 600; never printed or committed), ~/.config/cp/ig-queue.json,
// ~/.cache/cp/ig-spool/<slug>.mp4 (a copy re-muxed to 128 kbps AAC, no edit list: Instagram's Reel spec),
// ~/Library/Logs/curiopulse-ig.log.
// Upload routes, in order:
//   1. resumable upload of the local spool file (officially documented for Facebook Login; tried first because
//      it needs no hosting);
//   2. video_url = the MP4's public raw.githubusercontent.com URL (the curiopulse repo is public).
// The route that worked is recorded as "method".
//
// C. THE CLOUD (user, 18 Oct 2026: publish without the Mac). The GitHub Actions workflow .github/workflows/ig-publish.yml
//    in the curiopulse repo runs `run-due` at 17:47 and 20:17 IST, sleeps until the slot and publishes by video_url.
//    It sets CP_IG_CLOUD=1 and reads everything from the repo's state/ folder:
//      state/ig-queue.json   the Mac's queue (publish-short.sh copies it in with every commit; the cloud never writes it)
//      state/ig-results.json what the cloud did with each Reel (status, permalink…); only the cloud writes it
//      state/ig-token.enc    the token, AES-256-GCM; the key is the repo secret IG_TOKEN_KEY (and ~/.config/cp/ig-cloud-key).
//                            Instagram hands out a NEW token string on every refresh, so the cloud refreshes it weekly
//                            and commits the re-encrypted file; nothing else may refresh it then.
//      state/ig-cloud.json   {"enabled": true}: until then scheduled runs only look (no double posts with the Mac's job)
//   node ig.mjs cloud-setup               Mac: make the key (once) and encrypt the current token into state/ig-token.enc
//   node ig.mjs cloud-enable              Mac: hand publishing to the cloud (writes state/ig-cloud.json, removes the launchd job)
//   node ig.mjs pull-results              Mac: copy the cloud's results into ~/.config/cp/ig-queue.json
//   node ig.mjs refresh-weekly            cloud: refresh the token if it is a week old
// Before every upload and every publish the account's last 25 posts are checked for the same caption, so a Reel
// that is already live is recorded, never posted twice.
import crypto from 'node:crypto';
import {execFileSync, spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline';

const HOME = os.homedir();
const CONF = path.join(HOME, '.config/cp');
const TOKEN_FILE = path.join(CONF, 'instagram.json');
const QUEUE_FILE = process.env.CP_IG_CLOUD === '1' ? path.resolve(process.env.CP_IG_STATE ?? 'state', 'ig-queue.json') : path.join(CONF, 'ig-queue.json');
const SPOOL = path.join(HOME, '.cache/cp/ig-spool');
const LOG_FILE = path.join(HOME, 'Library/Logs/curiopulse-ig.log');
const FFMPEG = path.join(HOME, '.cache/cp/bin/ffmpeg');
const REPO_RAW = 'https://raw.githubusercontent.com/hmunna36/curiopulse/main';
const V = 'v25.0';
const G = `https://graph.instagram.com/${V}`;
const SLOTS = ['18:30', '21:00']; // IST: two Reels a day (user, 15 Oct 2026; one a day at 21:00 on 16 Oct while Instagram was suspended)
const LEGACY_SLOT = '18:30'; // what a bare date in "busy" stands for (every Reel booked before 4 Oct 2026)
const LEAD_MIN = Number(process.env.CP_IG_LEAD_MIN ?? 25); // start preparing a Reel this many minutes before its release
// route C (see the header): CLOUD is the GitHub Actions job; MAC_CLOUD is this Mac once publishing has moved there
const CLOUD = process.env.CP_IG_CLOUD === '1';
const STATE = path.resolve(process.env.CP_IG_STATE ?? (CLOUD ? 'state' : path.join(process.env.CP_REPO ?? path.join(HOME, 'Desktop/curiopulse'), 'state')));
const RESULTS_FILE = path.join(STATE, 'ig-results.json');
const TOKEN_ENC = path.join(STATE, 'ig-token.enc');
const KEY_FILE = path.join(CONF, 'ig-cloud-key');
const CLOUD_FLAG = path.join(CONF, 'ig-cloud.json');
const MAC_CLOUD = !CLOUD && fs.existsSync(CLOUD_FLAG) && JSON.parse(fs.readFileSync(CLOUD_FLAG, 'utf8')).enabled === true;
const RESULT_FIELDS = ['status', 'attempts', 'containerId', 'method', 'containerAt', 'mediaId', 'permalink', 'publishedAt', 'error'];
const ACTIONS_URL = 'https://github.com/hmunna36/curiopulse/actions/workflows/ig-publish.yml';
const JOB_TIMES = SLOTS.map((hm) => {
  const m = Number(hm.slice(0, 2)) * 60 + Number(hm.slice(3)) - 20; // the launchd job starts 20 minutes before each slot
  return {h: Math.floor(m / 60), m: m % 60, label: `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`};
});
const IST_MS = 5.5 * 3600 * 1000;
const LABEL = 'com.curiopulse.ig-publish';
const PLIST = path.join(HOME, 'Library/LaunchAgents', `${LABEL}.plist`);
const istDate = (ms) => new Date(ms + IST_MS).toISOString().slice(0, 10);
const istTime = (ms) => new Date(ms + IST_MS).toISOString().slice(0, 16).replace('T', ' ') + ' IST';
const istHM = (ms) => new Date(ms + IST_MS).toISOString().slice(11, 16); // HH:MM in IST
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function log(msg) {
  const line = `${new Date().toISOString()} ${msg}`;
  console.log(msg);
  if (CLOUD) return; // the Actions log is the log
  try {
    fs.mkdirSync(path.dirname(LOG_FILE), {recursive: true});
    fs.appendFileSync(LOG_FILE, line + '\n');
  } catch {}
}
function notify(title, msg) {
  if (process.platform !== 'darwin') return;
  spawnSync('osascript', ['-e', `display notification ${JSON.stringify(msg)} with title ${JSON.stringify(title)}`]);
}
const die = (msg) => {
  log(`ig: ${msg}`);
  process.exit(1);
};
const readJSON = (f, dflt) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : dflt);
const writeJSON = (f, obj, mode) => {
  fs.mkdirSync(path.dirname(f), {recursive: true, mode: 0o700});
  fs.writeFileSync(f, JSON.stringify(obj, null, 2) + '\n', mode ? {mode} : undefined);
  if (mode) fs.chmodSync(f, mode);
};
// A result belongs to one booking: a Reel queued again (new queuedAt) starts clean.
function applyResults(q, results) {
  for (const p of q.posts) {
    const r = results[p.slug];
    if (r && r.queuedAt === p.queuedAt) for (const k of RESULT_FIELDS) if (k in r) p[k] = r[k];
  }
  return q;
}
// In the cloud the queue is read-only (the Mac owns it) and everything the cloud learns goes to ig-results.json.
const loadQueue = () => {
  const q = readJSON(QUEUE_FILE, {busy: [], posts: []});
  return CLOUD ? applyResults(q, readJSON(RESULTS_FILE, {})) : q;
};
const saveQueue = (q) => {
  if (!CLOUD) return writeJSON(QUEUE_FILE, q);
  const results = readJSON(RESULTS_FILE, {});
  for (const p of q.posts) {
    if (p.status === 'queued' && !p.attempts) continue;
    results[p.slug] = {queuedAt: p.queuedAt, ...Object.fromEntries(RESULT_FIELDS.filter((k) => p[k] != null).map((k) => [k, p[k]]))};
  }
  writeJSON(RESULTS_FILE, results);
};

// ---- token ------------------------------------------------------------------------------------------------------
// Route C keeps the token encrypted in the public repo: AES-256-GCM, 32-byte key (base64) outside the repo.
function seal(obj, keyB64) {
  const key = Buffer.from(keyB64, 'base64');
  if (key.length !== 32) throw new Error('the token key must be 32 bytes, base64');
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', key, iv);
  const data = Buffer.concat([c.update(JSON.stringify(obj), 'utf8'), c.final()]);
  return {v: 1, alg: 'aes-256-gcm', iv: iv.toString('base64'), tag: c.getAuthTag().toString('base64'), data: data.toString('base64')};
}
function unseal(blob, keyB64) {
  const d = crypto.createDecipheriv('aes-256-gcm', Buffer.from(keyB64, 'base64'), Buffer.from(blob.iv, 'base64'));
  d.setAuthTag(Buffer.from(blob.tag, 'base64'));
  return JSON.parse(Buffer.concat([d.update(Buffer.from(blob.data, 'base64')), d.final()]).toString('utf8'));
}
const tokenKey = () => (CLOUD ? process.env.CP_IG_TOKEN_KEY : fs.existsSync(KEY_FILE) ? fs.readFileSync(KEY_FILE, 'utf8').trim() : null);
let cloudToken = null; // filled by initToken() in the cloud, and on the Mac once publishing has moved there
async function initToken() {
  if (!CLOUD && !MAC_CLOUD) return;
  const key = tokenKey();
  if (!key) die(CLOUD ? 'no IG_TOKEN_KEY secret in this repository (Settings → Secrets and variables → Actions)' : `no ${KEY_FILE}: run \`ig.mjs cloud-setup\``);
  let blob;
  if (CLOUD) blob = readJSON(TOKEN_ENC, null);
  else {
    // the cloud refreshes the token, so the Mac reads the committed copy, not its own old one
    const r = await fetch(`${REPO_RAW}/state/ig-token.enc?t=${Date.now()}`).catch(() => null);
    blob = r?.ok ? await r.json() : null;
  }
  if (!blob) die(`no encrypted token at ${CLOUD ? TOKEN_ENC : `${REPO_RAW}/state/ig-token.enc`}: run \`ig.mjs cloud-setup\` on the Mac and push`);
  try {
    cloudToken = unseal(blob, key);
  } catch {
    die('the token key does not open state/ig-token.enc (wrong IG_TOKEN_KEY?)');
  }
}
function tokenData() {
  if (CLOUD || MAC_CLOUD) return cloudToken ?? die('internal: initToken() was not called');
  if (!fs.existsSync(TOKEN_FILE)) die(`no Instagram token yet: run \`node ${process.argv[1]} token\` (see the cp skill's reference/publish.md)`);
  return readJSON(TOKEN_FILE);
}
function saveToken(t) {
  if (CLOUD) return writeJSON(TOKEN_ENC, seal(t, tokenKey()));
  if (MAC_CLOUD) die('the GitHub Actions job owns the token now; a refresh here would invalidate its copy');
  writeJSON(TOKEN_FILE, t, 0o600);
}
async function graph(method, url, params = {}, {token} = {}) {
  const tok = token ?? tokenData().access_token;
  const u = new URL(url);
  let body;
  if (method === 'GET') {
    for (const [k, v] of Object.entries(params)) u.searchParams.set(k, typeof v === 'string' ? v : JSON.stringify(v));
  } else {
    body = new URLSearchParams(Object.fromEntries(Object.entries(params).map(([k, v]) => [k, typeof v === 'string' ? v : JSON.stringify(v)])));
  }
  for (let attempt = 1; ; attempt++) {
    let r, text;
    try {
      r = await fetch(u, {method, headers: {Authorization: `Bearer ${tok}`}, body});
      text = await r.text();
    } catch (e) {
      if (attempt < 4) {
        await sleep(3000 * attempt);
        continue;
      }
      throw new Error(`${method} ${u.pathname}: ${e.message}`);
    }
    let j = {};
    try {
      j = JSON.parse(text);
    } catch {}
    if (r.ok) return j;
    const e = j.error ?? {};
    const transient = r.status >= 500 || [1, 2, 4, 17, 341].includes(e.code) || e.is_transient;
    if (transient && attempt < 4) {
      await sleep(4000 * attempt);
      continue;
    }
    const err = new Error(`${method} ${u.pathname} → ${r.status} ${e.message ?? text.slice(0, 200)}${e.code ? ` (code ${e.code}${e.error_subcode ? `/${e.error_subcode}` : ''})` : ''}`);
    err.code = e.code;
    err.subcode = e.error_subcode;
    throw err;
  }
}
async function me(token) {
  const j = await graph('GET', `${G}/me`, {fields: 'user_id,username,account_type,media_count'}, {token});
  return j.data?.[0] ?? j; // the docs show both a flat object and a {data:[…]} wrapper
}
async function readSecret(useClipboard) {
  if (useClipboard) return execFileSync('pbpaste', {encoding: 'utf8'}).trim();
  if (!process.stdin.isTTY) return fs.readFileSync(0, 'utf8').trim();
  process.stdout.write('Paste the Instagram access token (input hidden), then press Return: ');
  const rl = readline.createInterface({input: process.stdin, output: process.stdout, terminal: true});
  rl._writeToOutput = () => {};
  const tok = await new Promise((r) => rl.question('', r));
  rl.close();
  process.stdout.write('\n');
  return tok.trim();
}
async function setToken(useClipboard) {
  const tok = await readSecret(useClipboard);
  if (!tok || tok.length < 40 || /\s/.test(tok)) die('that does not look like an access token (copy the whole token from the Meta App Dashboard)');
  const who = await me(tok);
  if (!who.user_id && !who.id) die('the token works but returned no account id');
  const now = Date.now();
  writeJSON(TOKEN_FILE, {access_token: tok, user_id: String(who.user_id ?? who.id), username: who.username, account_type: who.account_type, obtained: new Date(now).toISOString(), refreshed: new Date(now).toISOString(), expires_at: new Date(now + 60 * 86400000).toISOString()}, 0o600);
  log(`saved the token for @${who.username} (${who.account_type ?? '?'}, user_id ${who.user_id ?? who.id}) to ${TOKEN_FILE}`);
  if (useClipboard) spawnSync('pbcopy', {input: ''}); // don't leave the token on the clipboard
  if (!fs.existsSync(PLIST)) installJob(); // a token switches Instagram to the API route (B)
}
async function whoami() {
  const t = tokenData();
  const who = await me();
  const days = Math.floor((Date.parse(t.expires_at) - Date.now()) / 86400000);
  console.log(`account: @${who.username} (${who.account_type ?? '?'}), user_id ${who.user_id ?? t.user_id}, ${who.media_count ?? '?'} posts`);
  console.log(`token: ~${days} days left (refreshed ${t.refreshed?.slice(0, 10)}); ${CLOUD || MAC_CLOUD ? 'the GitHub Actions job' : 'run-due'} refreshes it weekly`);
  try {
    const lim = await graph('GET', `${G}/${t.user_id}/content_publishing_limit`, {fields: 'config,quota_usage'});
    const d = lim.data?.[0];
    if (d) console.log(`publishing quota: ${d.quota_usage} of ${d.config?.quota_total} used in the last 24 h`);
  } catch (e) {
    console.log(`publishing quota: unavailable (${e.message.slice(0, 100)})`);
  }
}
async function refresh(force = false) {
  if (MAC_CLOUD) die('the GitHub Actions job owns the token now and refreshes it weekly; a refresh here would invalidate its copy');
  const t = tokenData();
  const age = Date.now() - Date.parse(t.refreshed ?? t.obtained);
  if (!force && age < 7 * 86400000) return false;
  if (age < 86400000) {
    if (force) console.log('the token is under 24 h old; Instagram only refreshes older tokens');
    return false;
  }
  const u = new URL('https://graph.instagram.com/refresh_access_token');
  u.searchParams.set('grant_type', 'ig_refresh_token');
  u.searchParams.set('access_token', t.access_token);
  const r = await fetch(u);
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) throw new Error(`token refresh failed: ${j.error?.message ?? r.status}`);
  t.access_token = j.access_token;
  t.refreshed = new Date().toISOString();
  t.expires_at = new Date(Date.now() + (j.expires_in ?? 60 * 86400) * 1000).toISOString();
  saveToken(t);
  log(`token refreshed; valid until ${t.expires_at.slice(0, 10)}`);
  return true;
}

// ---- queue ------------------------------------------------------------------------------------------------------
// Release times already taken, in ms. "busy" holds the Reels scheduled outside the API (Business Suite), as
// 'YYYY-MM-DDTHH:MM' in IST; a bare date is from the one-slot days and stands for 18:30.
function takenTimes(q) {
  return [
    ...(q.busy ?? []).map((b) => Date.parse(`${b.length === 10 ? `${b}T${LEGACY_SLOT}` : b.slice(0, 16)}:00+05:30`)),
    ...(q.posts ?? []).filter((p) => p.status !== 'cancelled').map((p) => Date.parse(p.publishAt)),
  ].filter((t) => !Number.isNaN(t));
}
const slotTaken = (taken, t) => taken.some((w) => Math.abs(w - t) < 2 * 3600 * 1000); // the two slots are 2.5 h apart
// The next free slot (18:30 or 21:00 IST) at least an hour away and not before `notBefore` (ms), as an ISO time.
function nextFreeIgSlot(q, notBefore = 0) {
  const taken = takenTimes(q);
  for (let d = 0; d < 90; d++) {
    const date = istDate(Date.now() + d * 86400000);
    for (const hm of SLOTS) {
      const iso = `${date}T${hm}:00+05:30`;
      const t = Date.parse(iso);
      if (t < Date.now() + 60 * 60 * 1000 || t < notBefore) continue;
      if (!slotTaken(taken, t)) return iso;
    }
  }
  throw new Error('no free Instagram slot in the next 90 days');
}
function spoolCopy(src, slug) {
  fs.mkdirSync(SPOOL, {recursive: true});
  const out = path.join(SPOOL, `${slug}.mp4`);
  // Instagram's Reel spec: AAC ≤ 48 kHz (128 kbps listed), moov first, no edit list. The video stream is copied.
  const r = spawnSync(FFMPEG, ['-v', 'error', '-y', '-i', src, '-map', '0:v:0', '-map', '0:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '128k', '-ar', '48000', '-ac', '2', '-use_editlist', '0', '-movflags', '+faststart', out], {encoding: 'utf8'});
  if (r.status !== 0) {
    log(`spool re-mux failed (${(r.stderr || '').trim().slice(0, 200)}); spooling an exact copy instead`);
    fs.copyFileSync(src, out);
  }
  return out;
}
async function queue(specPath, at) {
  const specFile = path.resolve(specPath);
  const base = path.dirname(specFile);
  const spec = JSON.parse(fs.readFileSync(specFile, 'utf8'));
  const ig = (spec.instagram ??= {});
  const slug = spec.slug ?? path.basename(base);
  const file = path.resolve(base, spec.file ?? `${slug}-short.mp4`);
  if (!fs.existsSync(file)) die(`file not found: ${file}`);
  const caption = ig.caption ?? '';
  const problems = [];
  if (!caption.trim()) problems.push('instagram.caption is empty');
  if (caption.length > 2200) problems.push(`caption over 2,200 characters (${caption.length})`);
  if ((caption.match(/#\w+/g) ?? []).length > 30) problems.push('caption has more than 30 hashtags');
  if ((caption.match(/@\w+/g) ?? []).length > 20) problems.push('caption has more than 20 @-mentions');
  if (problems.length) die(`fix publish.json first: ${problems.join('; ')}`);
  const q = loadQueue();
  const existing = q.posts.find((p) => p.slug === slug && p.status !== 'cancelled');
  if (existing?.status === 'published') die(`${slug} is already published: ${existing.permalink}`);
  let when = at ?? (ig.publishAt && ig.publishAt !== 'auto' ? ig.publishAt : null);
  if (!when) when = nextFreeIgSlot({...q, posts: q.posts.filter((p) => p.slug !== slug)}, Date.parse(spec.youtube?.publishAt ?? '') || 0);
  const t = Date.parse(when);
  if (Number.isNaN(t)) die(`not a date: ${when}`);
  if (t < Date.now() + 5 * 60 * 1000) die(`the release time must be at least 5 minutes away: ${when}`);
  const clash = q.posts.find((p) => p.slug !== slug && p.status !== 'cancelled' && Math.abs(Date.parse(p.publishAt) - t) < 2 * 3600 * 1000);   // 2 h, the same rule as slotTaken (18:30 and 21:00 are 2.5 h apart)
  if (clash || slotTaken(takenTimes({busy: q.busy, posts: []}), t)) log(`note: ${istTime(t)} already has a Reel (${clash?.slug ?? 'booked outside the API'}); queuing anyway`);
  const rel = path.relative(path.resolve(base, '../..'), file).split(path.sep).join('/'); // videos/<slug>/<file>
  const cover = spec.cover ? path.relative(path.resolve(base, '../..'), path.resolve(base, spec.cover)).split(path.sep).join('/') : null;
  const post = {
    slug,
    title: spec.title,
    publishAt: new Date(t).toISOString(),
    caption,
    shareToFeed: ig.shareToFeed ?? true,
    aiLabel: ig.aiLabel ?? false,
    thumbOffsetMs: ig.coverTime != null ? Math.round(ig.coverTime * 1000) : null,
    coverUrl: cover ? `${REPO_RAW}/${cover}` : null,
    videoUrl: `${REPO_RAW}/${rel}`,
    spool: spoolCopy(file, slug),
    size: fs.statSync(file).size,
    status: 'queued',
    queuedAt: new Date().toISOString(),
  };
  if (existing) Object.assign(existing, post);
  else q.posts.push(post);
  saveQueue(q);
  ig.publishAt = new Date(t + IST_MS).toISOString().slice(0, 19) + '+05:30';
  ig.queued = true;
  fs.writeFileSync(specFile, JSON.stringify(spec, null, 2) + '\n');
  log(`queued ${slug} for ${istTime(t)} (spool ${(fs.statSync(post.spool).size / 1e6).toFixed(1)} MB)`);
  if (MAC_CLOUD) console.log('note: GitHub Actions publishes it: commit with publish-short.sh before the release so state/ig-queue.json carries it');
  else if (!fs.existsSync(PLIST)) console.log('note: the publishing job is not installed yet — run `ig.mjs install-job`');
  if (!MAC_CLOUD && !fs.existsSync(TOKEN_FILE)) console.log('note: no Instagram token yet — run `ig.mjs token` before the release time');
}

// ---- publishing -------------------------------------------------------------------------------------------------
async function urlOk(url, size) {
  try {
    const r = await fetch(url, {method: 'HEAD', redirect: 'follow'});
    if (!r.ok) return false;
    const len = Number(r.headers.get('content-length') ?? 0);
    return !size || !len || len === size;
  } catch {
    return false;
  }
}
async function createContainer(post, {tryResumable = true} = {}) {
  const t = tokenData();
  const base = {media_type: 'REELS', caption: post.caption, share_to_feed: String(post.shareToFeed ?? true)};
  if (post.aiLabel) base.is_ai_generated = 'true';
  if (post.coverUrl && (await urlOk(post.coverUrl))) base.cover_url = post.coverUrl;
  else if (post.thumbOffsetMs != null) base.thumb_offset = String(post.thumbOffsetMs);
  const errors = [];
  // 1. resumable upload of the local spool file
  if (tryResumable && post.spool && fs.existsSync(post.spool)) {
    try {
      const c = await graph('POST', `${G}/${t.user_id}/media`, {...base, upload_type: 'resumable'});
      if (!c.id || !c.uri) throw new Error(`no upload uri in the reply (${JSON.stringify(c).slice(0, 120)})`);
      const buf = fs.readFileSync(post.spool);
      const r = await fetch(c.uri, {method: 'POST', headers: {Authorization: `OAuth ${t.access_token}`, offset: '0', file_size: String(buf.length), 'Content-Type': 'application/octet-stream'}, body: buf});
      const j = await r.json().catch(() => ({}));
      if (!r.ok || j.success === false || j.debug_info) throw new Error(`upload → ${r.status} ${JSON.stringify(j).slice(0, 200)}`);
      return {id: c.id, method: 'resumable'};
    } catch (e) {
      errors.push(`resumable: ${e.message}`);
      log(`  resumable route failed: ${e.message.slice(0, 220)}`);
    }
  }
  // 2. the public GitHub URL of the committed MP4
  if (post.videoUrl && (await urlOk(post.videoUrl, post.size))) {
    try {
      const c = await graph('POST', `${G}/${t.user_id}/media`, {...base, video_url: post.videoUrl});
      if (!c.id) throw new Error(`no container id (${JSON.stringify(c).slice(0, 120)})`);
      return {id: c.id, method: 'video_url'};
    } catch (e) {
      errors.push(`video_url: ${e.message}`);
    }
  } else errors.push(`video_url: ${post.videoUrl} is not reachable (pushed to GitHub? repo still public?)`);
  throw new Error(errors.join(' | '));
}
async function waitFinished(id, maxMin = 20) {
  const t0 = Date.now();
  while (Date.now() - t0 < maxMin * 60000) {
    const s = await graph('GET', `${G}/${id}`, {fields: 'status_code,status'});
    if (s.status_code === 'FINISHED') return;
    if (s.status_code === 'ERROR' || s.status_code === 'EXPIRED') throw new Error(`container ${id}: ${s.status_code} ${s.status ?? ''}`);
    if (s.status_code === 'PUBLISHED') return 'published';
    await sleep(20000);
  }
  throw new Error(`container ${id} still processing after ${maxMin} min`);
}
async function publishContainer(post) {
  const t = tokenData();
  try {
    const lim = await graph('GET', `${G}/${t.user_id}/content_publishing_limit`, {fields: 'config,quota_usage'});
    const d = lim.data?.[0];
    if (d && d.quota_usage >= (d.config?.quota_total ?? 50)) throw new Error(`publishing quota used up (${d.quota_usage}/${d.config?.quota_total})`);
  } catch (e) {
    if (/quota used up/.test(e.message)) throw e;
  }
  let res;
  try {
    res = await graph('POST', `${G}/${t.user_id}/media_publish`, {creation_id: post.containerId});
  } catch (e) {
    // a failed publish can still have gone live: look before anyone retries
    await sleep(15000);
    const s = await graph('GET', `${G}/${post.containerId}`, {fields: 'status_code'}).catch(() => ({}));
    if (s.status_code !== 'PUBLISHED') throw e;
    const recent = await graph('GET', `${G}/${t.user_id}/media`, {fields: 'id,caption,permalink,timestamp', limit: '5'});
    const hit = (recent.data ?? []).find((m) => (m.caption ?? '').slice(0, 60) === post.caption.slice(0, 60));
    if (!hit) throw new Error(`publish reported "${e.message}", the container says PUBLISHED, but the post is not in the last 5 posts`);
    res = {id: hit.id};
  }
  const m = await graph('GET', `${G}/${res.id}`, {fields: 'id,permalink,shortcode,timestamp'});
  return m;
}
// The Reel's caption among the account's last 25 posts (since a day before it was queued): it is already live.
async function alreadyLive(post) {
  const t = tokenData();
  const r = await graph('GET', `${G}/${t.user_id}/media`, {fields: 'id,caption,permalink,timestamp', limit: '25'});
  const since = Date.parse(post.queuedAt ?? '') - 86400000 || 0;
  return (r.data ?? []).find((m) => (m.caption ?? '').slice(0, 60) === post.caption.slice(0, 60) && Date.parse(m.timestamp) >= since) ?? null;
}
function recordLive(q, post, m) {
  Object.assign(post, {status: 'published', mediaId: m.id, permalink: m.permalink, publishedAt: m.timestamp ?? new Date().toISOString()});
  delete post.error;
  saveQueue(q);
  log(`${post.slug}: already live, recorded (${m.permalink})`);
}
async function prepareAndPublish(q, post, {now = false} = {}) {
  const save = () => saveQueue(q);
  try {
    const live = await alreadyLive(post);
    if (live) return recordLive(q, post, live);
    if (!post.containerId || post.status === 'failed') {
      post.status = 'uploading';
      post.attempts = (post.attempts ?? 0) + 1;
      save();
      const c = await createContainer(post);
      Object.assign(post, {containerId: c.id, method: c.method, containerAt: new Date().toISOString()});
      save();
      log(`${post.slug}: container ${c.id} via ${c.method}`);
    }
    const already = await waitFinished(post.containerId);
    post.status = 'ready';
    save();
    if (already !== 'published' && !now) {
      const wait = Date.parse(post.publishAt) - Date.now();
      if (wait > 0) {
        log(`${post.slug}: processed; publishing at ${istTime(Date.parse(post.publishAt))}`);
        await sleep(wait);
      }
      const liveNow = await alreadyLive(post); // another run may have published it while this one slept
      if (liveNow) return recordLive(q, post, liveNow);
    }
    const m = await publishContainer(post);
    Object.assign(post, {status: 'published', mediaId: m.id, permalink: m.permalink, publishedAt: m.timestamp ?? new Date().toISOString()});
    save();
    log(`${post.slug}: PUBLISHED ${m.permalink}`);
    notify('CurioPulse Reel is live', `${post.title ?? post.slug}\n${m.permalink}`);
    try {
      fs.unlinkSync(post.spool);
    } catch {}
  } catch (e) {
    post.status = 'failed';
    post.error = e.message.slice(0, 500);
    if (/expired|2207020|1363008|FILE_NOT_FOUND|ProcessingFailed|ERROR/.test(e.message)) delete post.containerId; // start over next time
    save();
    log(`${post.slug}: FAILED ${e.message}`);
    notify('CurioPulse Reel failed', `${post.slug}: ${e.message.slice(0, 120)}`);
    throw e;
  }
}
async function runDue(dryRun) {
  if (MAC_CLOUD) return console.log(`publishing runs in GitHub Actions now (${ACTIONS_URL}); nothing to do on the Mac`);
  const enabled = !CLOUD || readJSON(path.join(STATE, 'ig-cloud.json'), {}).enabled === true;
  if (!enabled && !dryRun) return console.log('cloud publishing is not enabled yet (state/ig-cloud.json): the Mac\'s job still publishes; looking only');
  const q = loadQueue();
  const soon = Date.now() + LEAD_MIN * 60000;
  const due = q.posts.filter((p) => ['queued', 'uploading', 'ready', 'failed'].includes(p.status) && Date.parse(p.publishAt) <= soon && (p.attempts ?? 0) < 4);
  if (!due.length) {
    const next = q.posts.filter((p) => p.status === 'queued').sort((a, b) => Date.parse(a.publishAt) - Date.parse(b.publishAt))[0];
    console.log(`nothing due${next ? `; next: ${next.slug} at ${istTime(Date.parse(next.publishAt))}` : ''}`);
    return;
  }
  if (dryRun) {
    for (const p of due) console.log(`would publish ${p.slug} at ${istTime(Date.parse(p.publishAt))} (${p.status})`);
    return;
  }
  if (!CLOUD && !fs.existsSync(TOKEN_FILE)) {
    notify('CurioPulse Reel NOT published', 'No Instagram token: run ig.mjs token');
    die('no Instagram token: run `ig.mjs token`');
  }
  if (!CLOUD) {
    // in the cloud the workflow's refresh-weekly step does this, and commits the new token before anything else
    try {
      await refresh();
    } catch (e) {
      log(`warning: ${e.message}`);
    }
  }
  let failed = 0;
  for (const p of due.sort((a, b) => Date.parse(a.publishAt) - Date.parse(b.publishAt))) {
    log(`${p.slug}: due ${istTime(Date.parse(p.publishAt))} (${p.status})`);
    try {
      await prepareAndPublish(q, p);
    } catch {
      failed++;
    }
  }
  if (failed) process.exitCode = 1;
}

// ---- launchd job ------------------------------------------------------------------------------------------------
function installJob() {
  const node = process.execPath;
  const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>${LABEL}</string>
  <key>ProgramArguments</key>
  <array><string>${node}</string><string>${path.resolve(process.argv[1])}</string><string>run-due</string></array>
  <key>StartCalendarInterval</key><array>${JOB_TIMES.map((x) => `<dict><key>Hour</key><integer>${x.h}</integer><key>Minute</key><integer>${x.m}</integer></dict>`).join('')}</array>
  <key>RunAtLoad</key><true/>
  <key>StandardOutPath</key><string>${path.join(HOME, 'Library/Logs/curiopulse-ig.out.log')}</string>
  <key>StandardErrorPath</key><string>${path.join(HOME, 'Library/Logs/curiopulse-ig.out.log')}</string>
  <key>EnvironmentVariables</key><dict><key>PATH</key><string>/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin</string></dict>
</dict>
</plist>
`;
  fs.mkdirSync(path.dirname(PLIST), {recursive: true});
  fs.writeFileSync(PLIST, plist);
  const uid = process.getuid();
  spawnSync('launchctl', ['bootout', `gui/${uid}/${LABEL}`], {stdio: 'ignore'});
  const r = spawnSync('launchctl', ['bootstrap', `gui/${uid}`, PLIST], {encoding: 'utf8'});
  if (r.status !== 0) die(`launchctl bootstrap failed: ${r.stderr.trim()}`);
  log(`installed ${PLIST}: run-due every day at ${JOB_TIMES.map((x) => x.label).join(' and ')} (Mac local time = IST) and at login`);
}
function uninstallJob() {
  spawnSync('launchctl', ['bootout', `gui/${process.getuid()}/${LABEL}`], {stdio: 'ignore'});
  if (fs.existsSync(PLIST)) fs.unlinkSync(PLIST);
  log('publishing job removed (queued Reels stay in the queue)');
}
function jobStatus() {
  const r = spawnSync('launchctl', ['print', `gui/${process.getuid()}/${LABEL}`], {encoding: 'utf8'});
  if (r.status !== 0) return console.log('publishing job: NOT installed (run `ig.mjs install-job`)');
  const state = r.stdout.match(/state = (\S+)/)?.[1];
  const last = r.stdout.match(/last exit code = (.+)/)?.[1];
  const both = JOB_TIMES.every((x) => r.stdout.includes(`"Hour" => ${x.h}`));
  console.log(`publishing job: installed (${state ?? '?'}, last exit ${last ?? 'n/a'}); ${JOB_TIMES.map((x) => x.label).join(' and ')} daily + at login; tz ${Intl.DateTimeFormat().resolvedOptions().timeZone}${both ? '' : ' (an older job with one time may be loaded: run `ig.mjs install-job` again)'}`);
}

// ---- route A: Business Suite ----------------------------------------------------------------------------------
async function prepare(specPath, outDir) {
  const specFile = path.resolve(specPath);
  const base = path.dirname(specFile);
  const spec = JSON.parse(fs.readFileSync(specFile, 'utf8'));
  const ig = spec.instagram ?? {};
  const slug = spec.slug ?? path.basename(base);
  const file = path.resolve(base, spec.file ?? `${slug}-short.mp4`);
  if (!fs.existsSync(file)) die(`file not found: ${file}`);
  if (!(ig.caption ?? '').trim()) die('instagram.caption is empty in publish.json');
  const out = path.resolve(outDir ?? path.join(SPOOL, slug));
  fs.mkdirSync(out, {recursive: true});
  for (const f of fs.readdirSync(out)) if (f.startsWith(`${slug}-reel.mp4`)) fs.unlinkSync(path.join(out, f));
  // the Reel spec copy: video stream copied, AAC 128 k / 48 kHz, no edit list, moov first
  const reel = path.join(out, `${slug}-reel.mp4`);
  const r = spawnSync(FFMPEG, ['-v', 'error', '-y', '-i', file, '-map', '0:v:0', '-map', '0:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '128k', '-ar', '48000', '-ac', '2', '-use_editlist', '0', '-movflags', '+faststart', reel], {encoding: 'utf8'});
  if (r.status !== 0) die(`re-mux failed: ${(r.stderr || '').trim().slice(0, 300)}`);
  const buf = fs.readFileSync(reel);
  const sha = (await import('node:crypto')).createHash('sha256').update(buf).digest('hex');
  const PART = 9_000_000; // Claude in Chrome's file_upload takes < 10 MB per call
  const parts = [];
  for (let i = 0, k = 1; i < buf.length; i += PART, k++) {
    const p = path.join(out, `${slug}-reel.mp4.part${String(k).padStart(2, '0')}`);
    fs.writeFileSync(p, buf.subarray(i, i + PART));
    parts.push(p);
  }
  let when = ig.publishAt && ig.publishAt !== 'auto' ? ig.publishAt : null;
  let note = null;
  if (when && !(Date.parse(when) > Date.now() + 20 * 60 * 1000)) {
    // a catch-up after a missed slot: never leave the Reel behind, give it the next free slot
    note = `instagram.publishAt (${when}) has passed or is under 20 minutes away, so this sheet uses the next free slot; write the new time into publish.json`;
    when = null;
  }
  if (!when) when = nextFreeIgSlot(loadQueue(), Date.parse(spec.youtube?.publishAt ?? '') || 0); // never before the Short's YouTube release
  const t = Date.parse(when);
  const sheet = {
    ...(note ? {note} : {}),
    slug,
    reel,
    size: buf.length,
    sha256: sha,
    parts,
    date: istDate(t),
    time: istHM(t), // 18:30 or 21:00 IST: type these hours and minutes in Business Suite
    publishAtIST: istTime(t),
    afterScheduling: `node ${process.argv[1]} busy ${istDate(t)}T${istHM(t)}`,
    caption: ig.caption,
    cover: spec.cover ? path.resolve(base, spec.cover) : null,
    coverTime: ig.coverTime ?? null,
  };
  fs.writeFileSync(path.join(out, `${slug}-reel.json`), JSON.stringify(sheet, null, 2) + '\n');
  console.log(JSON.stringify(sheet, null, 2));
}

// ---- views ------------------------------------------------------------------------------------------------------
function upcoming() {
  const q = loadQueue();
  const posts = [...q.posts].sort((a, b) => Date.parse(a.publishAt) - Date.parse(b.publishAt));
  if (!posts.length) console.log('queue: empty');
  for (const p of posts) console.log(`${istTime(Date.parse(p.publishAt))}  ${p.status.padEnd(9)}  ${p.slug}${p.permalink ? `  ${p.permalink}` : ''}${p.error ? `  (${p.error.slice(0, 90)})` : ''}`);
  const busy = (q.busy ?? [])
    .filter((b) => b.slice(0, 10) >= istDate(Date.now()))
    .map((b) => (b.length === 10 ? `${b} ${LEGACY_SLOT}` : b.slice(0, 16).replace('T', ' ')))
    .sort();
  if (busy.length) console.log(`booked outside the API: ${busy.join(', ')}`);
  console.log(`next free Instagram slot: ${istTime(Date.parse(nextFreeIgSlot(q)))} (slots ${SLOTS.join(' and ')} IST; yt.mjs also keeps a Reel from going before its Short's YouTube release)`);
  if (CLOUD || MAC_CLOUD) {
    console.log(`publishing: GitHub Actions, ${ACTIONS_URL}`);
    if (cloudToken) console.log(`token: @${cloudToken.username}, ~${Math.floor((Date.parse(cloudToken.expires_at) - Date.now()) / 86400000)} days left (refreshed ${cloudToken.refreshed?.slice(0, 10)} by the cloud)`);
    return;
  }
  jobStatus();
  if (fs.existsSync(TOKEN_FILE)) {
    const t = readJSON(TOKEN_FILE);
    console.log(`token: @${t.username}, ~${Math.floor((Date.parse(t.expires_at) - Date.now()) / 86400000)} days left`);
  } else console.log('token: none yet (run `ig.mjs token`)');
}
function markBusy(slots) {
  const q = loadQueue();
  q.busy ??= [];
  for (const raw of slots) {
    const s = raw.replace(' ', 'T').slice(0, 16);
    if (!/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(s)) {
      console.log(`skipped "${raw}": use YYYY-MM-DDTHH:MM in IST, e.g. 2026-10-17T21:00`);
      continue;
    }
    if (s.length === 10) console.log(`note: ${s} has no time, so it counts as that day's ${LEGACY_SLOT} slot; use ${s}T21:00 for the late slot`);
    if (!q.busy.includes(s)) q.busy.push(s);
  }
  q.busy.sort();
  saveQueue(q);
  console.log(`busy slots: ${q.busy.join(', ')}`);
}
function cancel(slug) {
  const q = loadQueue();
  const p = q.posts.find((x) => x.slug === slug && x.status !== 'cancelled');
  if (!p) die(`no queued Reel "${slug}"`);
  if (p.status === 'published') die(`${slug} is already published (${p.permalink}); delete it in the Instagram app if needed`);
  p.status = 'cancelled';
  saveQueue(q);
  try {
    fs.unlinkSync(p.spool);
  } catch {}
  log(`${slug}: cancelled`);
}
async function testContainer(file) {
  const slug = `test-${Date.now()}`;
  let post;
  if (/^https:\/\//.test(file ?? '')) post = {slug, caption: 'test container (never published)', shareToFeed: true, videoUrl: file}; // the cloud's route
  else if (file && fs.existsSync(file)) post = {slug, caption: 'test container (never published)', shareToFeed: true, spool: spoolCopy(path.resolve(file), slug), videoUrl: null, size: fs.statSync(file).size};
  else die('usage: ig.mjs test-container <file.mp4 | https URL of an MP4>');
  try {
    const c = await createContainer(post);
    log(`test: container ${c.id} via ${c.method}; waiting for processing…`);
    await waitFinished(c.id);
    log(`test: container ${c.id} FINISHED via ${c.method}. It was NOT published and expires unused in 24 h.`);
  } finally {
    try {
      if (post.spool) fs.unlinkSync(post.spool);
    } catch {}
  }
}

// ---- route C: the cloud ---------------------------------------------------------------------------------------
function cloudSetup(force) {
  // after cloud-enable only a brand-new token (`ig.mjs token`) may replace the cloud's copy
  if (MAC_CLOUD && !force) die('publishing is already in the cloud and it owns the token; for a new token from `ig.mjs token` run `cloud-setup --force`');
  const t = readJSON(TOKEN_FILE, null) ?? die('no Instagram token on this Mac: run `ig.mjs token` first');
  if (!fs.existsSync(KEY_FILE)) {
    fs.mkdirSync(CONF, {recursive: true, mode: 0o700});
    fs.writeFileSync(KEY_FILE, crypto.randomBytes(32).toString('base64') + '\n', {mode: 0o600});
    log(`made the token key ${KEY_FILE}`);
  }
  writeJSON(TOKEN_ENC, seal(t, tokenKey()));
  log(`encrypted the token for @${t.username} into ${TOKEN_ENC} (commit and push it)`);
  console.log(`the repository secret IG_TOKEN_KEY must hold the key: \`pbcopy < ${KEY_FILE}\`, then paste it at https://github.com/hmunna36/curiopulse/settings/secrets/actions/new`);
}
function cloudEnable() {
  if (!fs.existsSync(KEY_FILE)) die('run `ig.mjs cloud-setup` first');
  if (MAC_CLOUD) die('publishing is already in the cloud');
  cloudSetup(); // seal the Mac's token as it is now: it may have been refreshed since cloud-setup
  const since = new Date().toISOString();
  writeJSON(path.join(STATE, 'ig-cloud.json'), {enabled: true, since});
  writeJSON(CLOUD_FLAG, {enabled: true, since});
  if (fs.existsSync(PLIST)) uninstallJob();
  log(`publishing handed to GitHub Actions; commit and push ${path.join(STATE, 'ig-cloud.json')} so its scheduled runs publish`);
}
async function pullResults() {
  const r = await fetch(`${REPO_RAW}/state/ig-results.json?t=${Date.now()}`).catch(() => null);
  if (!r?.ok) return console.log('no cloud results yet');
  const q = applyResults(readJSON(QUEUE_FILE, {busy: [], posts: []}), await r.json());
  writeJSON(QUEUE_FILE, q);
  console.log(`merged the cloud's results into ${QUEUE_FILE}`);
}

// ---- insights (read-only; the user, 23 Oct 2026: "pull analytics from yt and instagram") ------------------------
// ig.mjs insights [n] [--json]: the account's followers and 28-day reach/views, then each of the last n posts with
// views, reach, likes, comments, shares, saves and (Reels) the average watch time. Reads only; posts nothing.
async function insights(n, asJson) {
  const t = tokenData();
  const acct = await graph('GET', `${G}/me`, {fields: 'user_id,username,followers_count,follows_count,media_count'}).then((j) => j.data?.[0] ?? j);
  const out = {account: acct, days28: {}, posts: []};
  const until = Math.floor(Date.now() / 1000), since = until - 28 * 86400;
  for (const metric of ['reach', 'views', 'accounts_engaged', 'total_interactions', 'follows_and_unfollows']) {
    try {
      const j = await graph('GET', `${G}/${t.user_id}/insights`, {metric, period: 'day', metric_type: 'total_value', since: String(since), until: String(until)});
      const d = j.data?.[0];
      out.days28[metric] = d?.total_value?.value ?? d?.total_value?.breakdowns?.[0]?.results ?? null;
    } catch (e) {
      out.days28[metric] = `n/a (${e.message.slice(0, 80)})`;
    }
  }
  const media = await graph('GET', `${G}/${t.user_id}/media`, {fields: 'id,caption,timestamp,media_product_type,like_count,comments_count,permalink', limit: String(n)});
  for (const m of media.data ?? []) {
    const row = {id: m.id, at: m.timestamp, type: m.media_product_type, likes: m.like_count, comments: m.comments_count, caption: (m.caption ?? '').split('\n')[0].slice(0, 60), permalink: m.permalink};
    for (const metrics of ['views,reach,saved,shares,total_interactions,ig_reels_avg_watch_time,ig_reels_video_view_total_time,reels_skip_rate', 'views,reach,saved,shares,total_interactions,ig_reels_avg_watch_time,ig_reels_video_view_total_time', 'views,reach,saved,shares,total_interactions,ig_reels_avg_watch_time', 'views,reach,saved,shares,total_interactions', 'reach,saved']) {
      try {
        const j = await graph('GET', `${G}/${m.id}/insights`, {metric: metrics});
        for (const d of j.data ?? []) row[d.name] = d.values?.[0]?.value ?? d.total_value?.value;
        delete row.error;
        break;
      } catch (e) {
        row.error = e.message.slice(0, 80);
      }
    }
    out.posts.push(row);
  }
  if (asJson) return console.log(JSON.stringify(out, null, 2));
  console.log(`@${acct.username}: ${acct.followers_count} followers, follows ${acct.follows_count}, ${acct.media_count} posts`);
  console.log(`last 28 days: ${Object.entries(out.days28).map(([k, v]) => `${k} ${typeof v === 'object' && v ? JSON.stringify(v) : v}`).join(' · ')}`);
  console.log('posted (IST)          views   reach  likes comm shares saves  avg-watch  caption');
  for (const r of out.posts) {
    const w = r.ig_reels_avg_watch_time != null ? `${(r.ig_reels_avg_watch_time / 1000).toFixed(1)} s` : '-';
    console.log(`${istTime(Date.parse(r.at))}  ${String(r.views ?? '-').padStart(6)}  ${String(r.reach ?? '-').padStart(6)}  ${String(r.likes ?? '-').padStart(5)} ${String(r.comments ?? '-').padStart(4)} ${String(r.shares ?? '-').padStart(6)} ${String(r.saved ?? '-').padStart(5)}  ${w.padStart(9)}  ${r.caption}${r.error && r.views == null ? `  [${r.error}]` : ''}`);
  }
}

const [cmd, ...args] = process.argv.slice(2);
try {
  if (['whoami', 'refresh', 'refresh-weekly', 'run-due', 'publish-now', 'test-container', 'upcoming', 'insights'].includes(cmd) && !(cmd === 'run-due' && MAC_CLOUD)) await initToken();
  if (cmd === 'upcoming' && MAC_CLOUD) await pullResults().catch(() => {});
  if (cmd === 'insights') await insights(Number(args.find((a) => /^\d+$/.test(a)) ?? 20), args.includes('--json'));
  else if (cmd === 'prepare') await prepare(args.find((a) => !a.startsWith('--')) ?? die('usage: ig.mjs prepare <publish.json> [--out DIR]'), args.includes('--out') ? args[args.indexOf('--out') + 1] : undefined);
  else if (cmd === 'route') console.log(fs.existsSync(TOKEN_FILE) ? 'api' : 'business-suite');
  else if (cmd === 'token') await setToken(args.includes('--clipboard'));
  else if (cmd === 'whoami') await whoami();
  else if (cmd === 'refresh') console.log((await refresh(true)) ? 'refreshed' : 'not refreshed');
  else if (cmd === 'queue') await queue(args.find((a) => !a.startsWith('--')) ?? die('usage: ig.mjs queue <publish.json> [--at ISO]'), args.includes('--at') ? args[args.indexOf('--at') + 1] : undefined);
  else if (cmd === 'upcoming') upcoming();
  else if (cmd === 'run-due') await runDue(args.includes('--dry-run'));
  else if (cmd === 'publish-now') {
    const q = loadQueue();
    const p = q.posts.find((x) => x.slug === args[0] && !['cancelled', 'published'].includes(x.status));
    if (!p) die(`no unpublished Reel "${args[0]}" in the queue`);
    await prepareAndPublish(q, p, {now: true});
  } else if (cmd === 'cancel') cancel(args[0]);
  else if (cmd === 'busy') markBusy(args);
  else if (cmd === 'test-container') await testContainer(args[0]);
  else if (cmd === 'install-job') installJob();
  else if (cmd === 'uninstall-job') uninstallJob();
  else if (cmd === 'job-status') jobStatus();
  else if (cmd === 'cloud-setup') cloudSetup(args.includes('--force'));
  else if (cmd === 'cloud-enable') cloudEnable();
  else if (cmd === 'pull-results') await pullResults();
  else if (cmd === 'refresh-weekly') {
    // not before cloud-enable: a refresh hands out a new token, and the Mac still publishes with the old one until then
    if (CLOUD && readJSON(path.join(STATE, 'ig-cloud.json'), {}).enabled !== true) console.log('not refreshing: cloud publishing is not enabled yet');
    else console.log((await refresh(false)) ? 'refreshed' : 'not due');
  }
  else console.log('usage: ig.mjs prepare <publish.json> [--out DIR] | route | token [--clipboard] | whoami | refresh | queue <publish.json> [--at ISO] | upcoming | run-due [--dry-run] | publish-now <slug> | cancel <slug> | busy <YYYY-MM-DDTHH:MM>... | test-container <mp4|url> | install-job | uninstall-job | job-status | cloud-setup | cloud-enable | pull-results | refresh-weekly | insights [n] [--json]');
} catch (e) {
  die(e.message);
}
