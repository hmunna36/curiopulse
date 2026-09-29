#!/usr/bin/env node
// Instagram Reels publisher for CurioPulse (@curio_pulse_tv), through Meta's "Instagram API with Instagram Login"
// (graph.instagram.com; no Facebook Page needed). No dependencies; Node 22+.
//
// The API cannot schedule. So `queue` books a Reel into ~/.config/cp/ig-queue.json and keeps a spool copy of the
// MP4, and a launchd job (install-job) runs `run-due` every day at 18:10 IST (and at login).
// run-due takes every Reel due within 25 minutes (or overdue): it creates the container and uploads, waits until
// Instagram has processed it, sleeps until the exact release time (18:30 IST), publishes, and records the permalink.
//
//   node ig.mjs token [--clipboard]       store the long-lived token from the Meta App Dashboard (hidden input / clipboard)
//   node ig.mjs whoami                    read-only: which account the token belongs to, days left on the token
//   node ig.mjs refresh                   extend the token another 60 days (run-due does this weekly by itself)
//   node ig.mjs queue <publish.json>      book the Reel (instagram.publishAt from publish.json; "auto" = next free day)
//   node ig.mjs upcoming                  the queue, busy days and the last results
//   node ig.mjs run-due [--dry-run]       what the launchd job runs
//   node ig.mjs publish-now <slug>        publish a queued Reel right away
//   node ig.mjs cancel <slug>             take a Reel out of the queue (nothing is deleted on Instagram)
//   node ig.mjs busy <YYYY-MM-DD>...      mark days as taken outside the API (e.g. a Reel scheduled in Business Suite)
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
import {execFileSync, spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline';

const HOME = os.homedir();
const CONF = path.join(HOME, '.config/cp');
const TOKEN_FILE = path.join(CONF, 'instagram.json');
const QUEUE_FILE = path.join(CONF, 'ig-queue.json');
const SPOOL = path.join(HOME, '.cache/cp/ig-spool');
const LOG_FILE = path.join(HOME, 'Library/Logs/curiopulse-ig.log');
const FFMPEG = path.join(HOME, '.cache/cp/bin/ffmpeg');
const REPO_RAW = 'https://raw.githubusercontent.com/hmunna36/curiopulse/main';
const V = 'v25.0';
const G = `https://graph.instagram.com/${V}`;
const SLOT = '18:30'; // IST, set by the user 2026-09-29
const LEAD_MIN = 25; // start preparing a Reel this many minutes before its release
const IST_MS = 5.5 * 3600 * 1000;
const LABEL = 'com.curiopulse.ig-publish';
const PLIST = path.join(HOME, 'Library/LaunchAgents', `${LABEL}.plist`);
const istDate = (ms) => new Date(ms + IST_MS).toISOString().slice(0, 10);
const istTime = (ms) => new Date(ms + IST_MS).toISOString().slice(0, 16).replace('T', ' ') + ' IST';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function log(msg) {
  const line = `${new Date().toISOString()} ${msg}`;
  console.log(msg);
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
const loadQueue = () => readJSON(QUEUE_FILE, {busy: [], posts: []});
const saveQueue = (q) => writeJSON(QUEUE_FILE, q);

// ---- token ------------------------------------------------------------------------------------------------------
function tokenData() {
  if (!fs.existsSync(TOKEN_FILE)) die(`no Instagram token yet: run \`node ${process.argv[1]} token\` (see the cp skill's reference/publish.md)`);
  return readJSON(TOKEN_FILE);
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
}
async function whoami() {
  const t = tokenData();
  const who = await me();
  const days = Math.floor((Date.parse(t.expires_at) - Date.now()) / 86400000);
  console.log(`account: @${who.username} (${who.account_type ?? '?'}), user_id ${who.user_id ?? t.user_id}, ${who.media_count ?? '?'} posts`);
  console.log(`token: ~${days} days left (refreshed ${t.refreshed?.slice(0, 10)}); run-due refreshes it weekly`);
  try {
    const lim = await graph('GET', `${G}/${t.user_id}/content_publishing_limit`, {fields: 'config,quota_usage'});
    const d = lim.data?.[0];
    if (d) console.log(`publishing quota: ${d.quota_usage} of ${d.config?.quota_total} used in the last 24 h`);
  } catch (e) {
    console.log(`publishing quota: unavailable (${e.message.slice(0, 100)})`);
  }
}
async function refresh(force = false) {
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
  writeJSON(TOKEN_FILE, t, 0o600);
  log(`token refreshed; valid until ${t.expires_at.slice(0, 10)}`);
  return true;
}

// ---- queue ------------------------------------------------------------------------------------------------------
function busyDays(q) {
  return new Set([...(q.busy ?? []), ...q.posts.filter((p) => p.status !== 'cancelled').map((p) => istDate(Date.parse(p.publishAt)))]);
}
function nextFreeIgDay(q) {
  const busy = busyDays(q);
  for (let d = 0; d < 90; d++) {
    const date = istDate(Date.now() + d * 86400000);
    if (Date.parse(`${date}T${SLOT}:00+05:30`) < Date.now() + 60 * 60 * 1000) continue;
    if (!busy.has(date)) return date;
  }
  throw new Error('no free Instagram day in the next 90 days');
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
  if (!when) when = `${nextFreeIgDay({...q, posts: q.posts.filter((p) => p.slug !== slug)})}T${SLOT}:00+05:30`;
  const t = Date.parse(when);
  if (Number.isNaN(t)) die(`not a date: ${when}`);
  if (t < Date.now() + 5 * 60 * 1000) die(`the release time must be at least 5 minutes away: ${when}`);
  const clash = q.posts.find((p) => p.slug !== slug && p.status !== 'cancelled' && istDate(Date.parse(p.publishAt)) === istDate(t));
  if (clash || (q.busy ?? []).includes(istDate(t))) log(`note: ${istDate(t)} already has a Reel (${clash?.slug ?? 'booked outside the API'}); queuing anyway`);
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
  if (!fs.existsSync(PLIST)) console.log('note: the publishing job is not installed yet — run `ig.mjs install-job`');
  if (!fs.existsSync(TOKEN_FILE)) console.log('note: no Instagram token yet — run `ig.mjs token` before the release time');
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
async function prepareAndPublish(q, post, {now = false} = {}) {
  const save = () => saveQueue(q);
  try {
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
  if (!fs.existsSync(TOKEN_FILE)) {
    notify('CurioPulse Reel NOT published', 'No Instagram token: run ig.mjs token');
    die('no Instagram token: run `ig.mjs token`');
  }
  try {
    await refresh();
  } catch (e) {
    log(`warning: ${e.message}`);
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
  <key>StartCalendarInterval</key><dict><key>Hour</key><integer>18</integer><key>Minute</key><integer>10</integer></dict>
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
  log(`installed ${PLIST}: run-due every day at 18:10 (Mac local time = IST) and at login`);
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
  console.log(`publishing job: installed (${state ?? '?'}, last exit ${last ?? 'n/a'}); 18:10 daily + at login; tz ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
}

// ---- views ------------------------------------------------------------------------------------------------------
function upcoming() {
  const q = loadQueue();
  const posts = [...q.posts].sort((a, b) => Date.parse(a.publishAt) - Date.parse(b.publishAt));
  if (!posts.length) console.log('queue: empty');
  for (const p of posts) console.log(`${istTime(Date.parse(p.publishAt))}  ${p.status.padEnd(9)}  ${p.slug}${p.permalink ? `  ${p.permalink}` : ''}${p.error ? `  (${p.error.slice(0, 90)})` : ''}`);
  const busy = (q.busy ?? []).filter((d) => d >= istDate(Date.now()));
  if (busy.length) console.log(`booked outside the API: ${busy.join(', ')}`);
  console.log(`next free Instagram day: ${nextFreeIgDay(q)} ${SLOT} IST`);
  jobStatus();
  if (fs.existsSync(TOKEN_FILE)) {
    const t = readJSON(TOKEN_FILE);
    console.log(`token: @${t.username}, ~${Math.floor((Date.parse(t.expires_at) - Date.now()) / 86400000)} days left`);
  } else console.log('token: none yet (run `ig.mjs token`)');
}
function markBusy(days) {
  const q = loadQueue();
  for (const d of days) if (/^\d{4}-\d{2}-\d{2}$/.test(d) && !(q.busy ??= []).includes(d)) q.busy.push(d);
  q.busy.sort();
  saveQueue(q);
  console.log(`busy days: ${q.busy.join(', ')}`);
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
  if (!file || !fs.existsSync(file)) die('usage: ig.mjs test-container <file.mp4>');
  const slug = `test-${Date.now()}`;
  const post = {slug, caption: 'test container (never published)', shareToFeed: true, spool: spoolCopy(path.resolve(file), slug), videoUrl: null, size: fs.statSync(file).size};
  try {
    const c = await createContainer(post);
    log(`test: container ${c.id} via ${c.method}; waiting for processing…`);
    await waitFinished(c.id);
    log(`test: container ${c.id} FINISHED via ${c.method}. It was NOT published and expires unused in 24 h.`);
  } finally {
    try {
      fs.unlinkSync(post.spool);
    } catch {}
  }
}

const [cmd, ...args] = process.argv.slice(2);
try {
  if (cmd === 'token') await setToken(args.includes('--clipboard'));
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
  else console.log('usage: ig.mjs token [--clipboard] | whoami | refresh | queue <publish.json> [--at ISO] | upcoming | run-due [--dry-run] | publish-now <slug> | cancel <slug> | busy <date>... | test-container <mp4> | install-job | uninstall-job | job-status');
} catch (e) {
  die(e.message);
}
