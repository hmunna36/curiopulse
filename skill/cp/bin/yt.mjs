#!/usr/bin/env node
// YouTube Data API uploader for CurioPulse Shorts (no dependencies; Node 22+). Adapted from the va skill's
// yt.mjs (same OAuth client, a separate refresh token for the CurioPulse channel).
//
//   node yt.mjs auth                      one-time: open Google's consent page, pick the CurioPulse channel
//   node yt.mjs whoami                    read-only check: which channel the token belongs to
//   node yt.mjs upload <publish.json> [--dry-run] [--schedule=auto]
//   node yt.mjs upcoming                  every video already scheduled on the channel + the next free slots
//   node yt.mjs next-free                 just the next free release day (YYYY-MM-DD, IST)
//   node yt.mjs reschedule <videoId> <ISO time, e.g. 2026-10-02T23:30:00+05:30>
//   node yt.mjs status <videoId>...       processing / privacy / scheduled time
//   node yt.mjs stats [n] [--json]        public counts (views, likes, comments) of the last n uploads
//   node yt.mjs analytics [n] [--curve <videoId>] [--json]
//                                         YouTube Analytics per video: stayed to watch, average % viewed, net
//                                         subscribers and subscribers per 1,000 views; --curve adds one video's
//                                         retention curve. Needs the yt-analytics.readonly scope (the token from
//                                         before 5 Oct 2026 lacks it: run `auth` once more and allow it).
//   node yt.mjs next-slot [--json]        the next free YouTube slot and the length arm a Short for it must be built
//                                         to (the length test: 23:30 slots are 30-35 s, 11:30 slots are 45-50 s)
//   node yt.mjs comments-due [--dry-run]  posts the "Next up" comment on every Short that has gone public since it was
//                                         uploaded (the queue is ~/.config/cp/comment-queue.json; `upload` fills it).
//                                         "Next up" names the channel's next scheduled video at that moment. One comment
//                                         per Short, never a reply. Pinning is done by hand: the API cannot pin.
//   node yt.mjs queue-comment <publish.json>   put an already uploaded Short into that queue (no call to YouTube)
//   node yt.mjs channel-info [--json]     read-only: the channel's description, trailer, Home sections and playlists
//   node yt.mjs playlists                 read-only: the channel's playlists
//   node yt.mjs playlist-create "<title>" "<description>" [--dry-run]
//   node yt.mjs playlist-add "<title or id>" <videoId>... [--dry-run]     (skips videos already in it)
//   node yt.mjs channel-set [--trailer <videoId>] [--description-file <file>] [--dry-run]
//   node yt.mjs section-add "<playlist title or id>" [--dry-run]          a Home-tab row for one playlist
//   node yt.mjs numbers                   the log every run starts with: rewrites <skill>/numbers.md (the length
//                                         test's arms side by side, then every upload) and appends a line to
//                                         <skill>/numbers.jsonl. Read-only on YouTube (reference/analytics.md).
//
// Release slots: YouTube 11:30 AM AND 11:30 PM IST (the user, 2 Oct 2026); Instagram 18:30 AND 21:00 IST (the user,
// 15 Oct 2026: the 06:30 slot moved to 21:00, after the nostril Reel's views ran fastest 21:30-03:30 IST and slowest
// 12:30-16:30; 06:30 and 18:30 from 4 Oct). Each run takes the next free slot on each platform.
// --schedule=auto (or "publishAt": "auto") takes the next free YouTube slot (no CurioPulse video public or scheduled
// within 3 hours of it, at least 2 hours away), then the next free Instagram slot that is not before that YouTube
// release (the times taken are in ~/.config/cp/ig-queue.json: "busy" plus the queue). It writes both times into
// youtube.publishAt and instagram.publishAt, so `ig.mjs prepare` and `ig.mjs queue` use the same slot.
//
// Credentials (never printed, never committed):
//   ~/.config/va/youtube-client.json   the OAuth "Desktop app" client of Google Cloud project "My First Project"
//                                      (plenary-ability-231608; created before 28 July 2020, so it is exempt from
//                                      YouTube's lock-to-private rule for unaudited API clients). A
//                                      ~/.config/cp/youtube-client.json, if present, wins.
//   ~/.config/cp/youtube-token.json    the CurioPulse refresh token from `auth` (chmod 600)
//   In the cloud (the "Next up" comment routine, user, 17 Oct 2026) the same two come from the environment instead:
//   CP_YT_CLIENT_ID + CP_YT_CLIENT_SECRET (or CP_YT_CLIENT_JSON, the client JSON) and CP_YT_REFRESH_TOKEN; they win.
//
// publish.json (videos/<slug>/publish.json; paths relative to that folder):
// { "slug": "…", "file": "<slug>-short.mp4", "title": "…", "description": "…", "tags": ["…"],
//   "cover": "cover.jpg", "captions": "<slug>.srt",
//   "youtube": { "publishAt": "auto", "privacy": "private", "categoryId": "27", "language": "en",
//                "madeForKids": false, "syntheticMedia": false, "notifySubscribers": true },
//   "instagram": { "publishAt": "auto", "caption": "…", "coverTime": 5.2, "shareToFeed": true } }
//   "youtube.playlist": "<title of one of the channel's playlists>" adds the Short to it after the upload (optional).
//   "pinnedComment": "Next up: … Subscribe…\n<a question for the viewer>": `upload` queues its second line (the
//   question) for `comments-due`; the "Next up" line itself is written from the channel's schedule when it is posted.
// Progress is written back (youtube.id, url, thumbnailSet, captionsSet, playlistSet), so a re-run resumes.
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const CONF = path.join(os.homedir(), '.config/cp');
const CLIENT_FILE = [path.join(CONF, 'youtube-client.json'), path.join(os.homedir(), '.config/va/youtube-client.json')].find((f) => fs.existsSync(f)) ?? path.join(CONF, 'youtube-client.json');
const TOKEN_FILE = path.join(CONF, 'youtube-token.json');
const ENV_CLIENT = process.env.CP_YT_CLIENT_ID && process.env.CP_YT_CLIENT_SECRET
  ? JSON.stringify({client_id: process.env.CP_YT_CLIENT_ID, client_secret: process.env.CP_YT_CLIENT_SECRET})
  : process.env.CP_YT_CLIENT_JSON;
const ENV_REFRESH = process.env.CP_YT_REFRESH_TOKEN;
const hasToken = () => Boolean(ENV_REFRESH) || fs.existsSync(TOKEN_FILE);
const IG_QUEUE = path.join(CONF, 'ig-queue.json');
const COMMENT_QUEUE = process.env.CP_COMMENT_QUEUE ?? path.join(CONF, 'comment-queue.json');   // the env var: dry runs, and the cloud routine (the repo's state/comment-queue.json)
const CHANNEL = 'CurioPulse';
const SCOPE = 'https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/yt-analytics.readonly'; // upload, thumbnails, captions + read-only analytics
const API = 'https://www.googleapis.com/youtube/v3';
const UPLOAD = 'https://www.googleapis.com/upload/youtube/v3';
const YTA = 'https://youtubeanalytics.googleapis.com/v2/reports';
const CHUNK = 8 * 1024 * 1024; // a multiple of 256 KiB, as resumable uploads require
export const SLOTS = {youtube: ['11:30', '23:30'], instagram: ['18:30', '21:00']}; // IST: two slots a day on each platform (YouTube: user, 2 Oct 2026; Meta: user, 15 Oct 2026; Facebook-only 16 Oct while Instagram was suspended, back the same evening)
const IST_MS = 5.5 * 3600 * 1000;
const istDate = (ms) => new Date(ms + IST_MS).toISOString().slice(0, 10); // YYYY-MM-DD in IST
const istHM = (ms) => new Date(ms + IST_MS).toISOString().slice(11, 16); // HH:MM in IST
// The length test (user, 5 Oct 2026) ran from 6 Oct 23:30 to 16 Oct 11:30 IST: a Short that took a 23:30 YouTube slot
// was built to the SHORT arm (30-35 s), one that took an 11:30 slot to the STANDARD arm (45-50 s). Its readings
// (analytics.md, 14 and 15 Oct 2026) favoured 30-35 s, and the user chose it for every slot (15 Oct 2026: "yes"):
// from LENGTH_TEST.end on, every Short is HOUSE_ARM. `next-slot` tells a run which arm it is building, qa.py reads the
// arm from publish.json ("length"), and `numbers` keeps the test's rows and adds one for the Shorts made since.
export const LENGTH_ARMS = {
  short: {min: 30, max: 35, words: '66-76', chars: '400-470'},
  standard: {min: 45, max: 50, words: '95-110', chars: '560-680'},
};
export const LENGTH_TEST = {name: 'length-2026-10', start: '2026-10-06T23:30:00+05:30', end: '2026-10-16T11:30:00+05:30', slots: {'23:30': 'short', '11:30': 'standard'}};
export const HOUSE_ARM = 'short'; // every slot from LENGTH_TEST.end on (user, 15 Oct 2026)
const SINCE_GROUP = 'since 16 Oct · 30-35 s, the test'; // the numbers report's row for the Shorts made to the rules of 15 Oct
const inTest = (ms) => Boolean(LENGTH_TEST) && ms >= Date.parse(LENGTH_TEST.start) && ms < Date.parse(LENGTH_TEST.end);
const armOfSlot = (ms) => (inTest(ms) ? LENGTH_TEST.slots[istHM(ms)] ?? 'standard' : !LENGTH_TEST || ms >= Date.parse(LENGTH_TEST.end) ? HOUSE_ARM : 'standard');
// The pill test (user, 24 Oct 2026: "yes let's test it for 2 weeks"): a Short released in a 23:30 YouTube slot from
// PILL_TEST.start to PILL_TEST.end ends with a short silent Subscribe pill (on screen 1.6 s, gone 0.6 s before the
// loop), one in an 11:30 slot ends with none, as every Short has since 16 Oct. 14 Shorts an arm. `next-slot` tells a
// run its arm, timeline_lib.py sets the pill's cues from publish.json "subscribe", qa.py checks the arm, and `numbers`
// keeps a row for each. The verdict (reference/analytics.md, the pill test) is read about 11 Nov 2026.
export const PILL_TEST = {name: 'pill-2026-10', start: '2026-10-25T23:30:00+05:30', end: '2026-11-08T23:30:00+05:30', slots: {'23:30': 'pill', '11:30': 'none'}};
const inPillTest = (ms) => Boolean(PILL_TEST) && ms >= Date.parse(PILL_TEST.start) && ms < Date.parse(PILL_TEST.end);
const pillOfSlot = (ms) => (inPillTest(ms) ? PILL_TEST.slots[istHM(ms)] ?? 'none' : 'none');
const PILL_GROUPS = {pill: 'PILL TEST · pill (23:30)', none: 'PILL TEST · no pill (11:30)'};
// The topic test (user, 24 Oct 2026: "this que for 1 slot and in another slot some other extremely curious topic not
// only about human body", then "yes"): over the same two weeks as the pill test, each day has one TEST Short (topics.md
// Queue: a test the viewer does on themselves) and one CURIOUS Short (topics.md Curious queue: an impossible-sounding
// true thing about space, animals, Earth, physics...). The kind alternates by day so that it never lines up with the
// pill's slot: on even days from day0 the 23:30 slot is curious and 11:30 a test; on odd days the other way round.
// 7 of each kind in each slot. `next-slot` prints the kind; the run picks its topic from the matching queue.
export const KIND_TEST = {name: 'kind-2026-10', start: '2026-10-25T23:30:00+05:30', end: '2026-11-08T23:30:00+05:30', day0: '2026-10-25'};
const inKindTest = (ms) => Boolean(KIND_TEST) && ms >= Date.parse(KIND_TEST.start) && ms < Date.parse(KIND_TEST.end);
const kindOfSlot = (ms) => {
  if (!inKindTest(ms)) return 'test';
  const d = Math.round((Date.parse(istDate(ms)) - Date.parse(KIND_TEST.day0)) / 86400000);
  return istHM(ms) === (d % 2 === 0 ? '23:30' : '11:30') ? 'curious' : 'test';
};
const SKILL_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const istTime = (ms) => new Date(ms + IST_MS).toISOString().slice(0, 16).replace('T', ' ') + ' IST';

const die = (msg) => {
  console.error(`yt: ${msg}`);
  process.exit(1);
};
const client = () => {
  if (ENV_CLIENT) {
    let j;
    try {
      j = JSON.parse(ENV_CLIENT);
    } catch {
      die('CP_YT_CLIENT_JSON is not valid JSON');
    }
    const c = j.installed ?? j.web ?? j;
    if (!c.client_id || !c.client_secret) die('CP_YT_CLIENT_JSON has no client_id/client_secret');
    return c;
  }
  if (!fs.existsSync(CLIENT_FILE)) die(`missing ${CLIENT_FILE} (the Desktop OAuth client JSON from Google Cloud)`);
  const j = JSON.parse(fs.readFileSync(CLIENT_FILE, 'utf8'));
  const c = j.installed ?? j.web ?? j;
  if (!c.client_id || !c.client_secret) die(`${CLIENT_FILE} has no client_id/client_secret`);
  return c;
};
const b64url = (buf) => buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

// ---- auth -------------------------------------------------------------------------------------------------
async function auth() {
  const c = client();
  const verifier = b64url(crypto.randomBytes(48));
  const challenge = b64url(crypto.createHash('sha256').update(verifier).digest());
  const state = b64url(crypto.randomBytes(16));
  const server = http.createServer();
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const redirect = `http://127.0.0.1:${server.address().port}`;
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  for (const [k, v] of Object.entries({client_id: c.client_id, redirect_uri: redirect, response_type: 'code', scope: SCOPE, access_type: 'offline', prompt: 'consent select_account', code_challenge: challenge, code_challenge_method: 'S256', state}))
    url.searchParams.set(k, v);
  console.log(`Open this URL, choose the ${CHANNEL} channel, and allow access:`);
  console.log(url.toString());
  if (process.platform === 'darwin' && !process.argv.includes('--no-open')) import('node:child_process').then(({spawn}) => spawn('open', [url.toString()], {stdio: 'ignore', detached: true}).unref());
  const code = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timed out after 15 minutes')), 15 * 60 * 1000);
    server.on('request', (req, res) => {
      const q = new URL(req.url, redirect).searchParams;
      if (!q.get('code') && !q.get('error')) return res.end();
      const ok = q.get('state') === state && q.get('code');
      res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
      res.end(`<body style="font:18px system-ui;background:#05060F;color:#F2F4F7;padding:40px">${ok ? 'CurioPulse uploader connected. You can close this tab.' : 'Authorization failed: ' + (q.get('error') ?? 'state mismatch')}</body>`);
      clearTimeout(timer);
      ok ? resolve(q.get('code')) : reject(new Error(q.get('error') ?? 'state mismatch'));
    });
  });
  server.close();
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({code, client_id: c.client_id, client_secret: c.client_secret, redirect_uri: redirect, grant_type: 'authorization_code', code_verifier: verifier}),
  });
  const t = await r.json();
  if (!t.refresh_token) die(`token exchange failed: ${t.error ?? r.status} ${t.error_description ?? ''}`);
  fs.mkdirSync(CONF, {recursive: true, mode: 0o700});
  fs.writeFileSync(TOKEN_FILE, JSON.stringify({refresh_token: t.refresh_token, scope: t.scope, obtained: new Date().toISOString()}, null, 2) + '\n', {mode: 0o600});
  fs.chmodSync(TOKEN_FILE, 0o600);
  console.log(`saved the refresh token to ${TOKEN_FILE}`);
  const ch = await myChannel();
  if (ch && ch.snippet.title !== CHANNEL) console.log(`WARNING: this token belongs to "${ch.snippet.title}", not ${CHANNEL}. Run auth again and pick ${CHANNEL}.`);
  await whoami();
}

let cached = null;
async function accessToken() {
  if (cached && cached.exp > Date.now() + 60_000) return cached.token;
  if (!hasToken()) die(`no token yet: run \`node ${process.argv[1]} auth\` and pick the ${CHANNEL} channel`);
  const c = client();
  const refresh_token = ENV_REFRESH || JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8')).refresh_token;
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({client_id: c.client_id, client_secret: c.client_secret, refresh_token, grant_type: 'refresh_token'}),
  });
  const t = await r.json();
  if (!t.access_token) die(`token refresh failed: ${t.error ?? r.status} ${t.error_description ?? ''} (re-run auth if the access was revoked)`);
  cached = {token: t.access_token, exp: Date.now() + (t.expires_in ?? 3600) * 1000};
  return cached.token;
}
async function api(method, url, {json, body, headers = {}, ok = [200]} = {}) {
  for (let attempt = 1; ; attempt++) {
    const r = await fetch(url, {
      method,
      headers: {Authorization: `Bearer ${await accessToken()}`, ...(json ? {'Content-Type': 'application/json; charset=UTF-8'} : {}), ...headers},
      body: json ? JSON.stringify(json) : body,
    });
    if (ok.includes(r.status)) return r;
    const text = await r.text();
    if (r.status === 401 && attempt < 3) {
      // a token issued a moment ago is now and then refused once (9 Oct 2026: six of some 25 calls in one night, each
      // fine on the next try). Get a new one and try again; a revoked sign-in still fails, at the refresh or here.
      cached = null;
      await new Promise((res) => setTimeout(res, 1500 * attempt));
      continue;
    }
    if ((r.status >= 500 || r.status === 429) && attempt < 5) {
      await new Promise((res) => setTimeout(res, 2000 * attempt * attempt));
      continue;
    }
    let msg = text;
    try {
      const e = JSON.parse(text).error;
      msg = `${e.code} ${e.message}${e.errors?.[0]?.reason ? ` (${e.errors[0].reason})` : ''}`;
    } catch {}
    throw new Error(`${method} ${url.split('?')[0]} → ${msg}`);
  }
}

// ---- whoami -----------------------------------------------------------------------------------------------------
async function myChannel() {
  const r = await (await api('GET', `${API}/channels?part=snippet,statistics,contentDetails&mine=true`)).json();
  return r.items?.[0];
}
async function whoami() {
  const ch = await myChannel();
  if (!ch) die(`the token has no YouTube channel (choose the ${CHANNEL} channel when authorizing)`);
  console.log(`channel: ${ch.snippet.title} (${ch.id}), ${ch.statistics?.videoCount ?? '?'} videos, ${ch.statistics?.subscriberCount ?? '?'} subscribers`);
  if (ch.snippet.title !== CHANNEL) die(`this token is for "${ch.snippet.title}", not ${CHANNEL}: run auth again and pick ${CHANNEL}`);
}

// ---- calendar ---------------------------------------------------------------------------------------------------
async function channelVideos() {
  const ch = await myChannel();
  const uploads = ch?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploads) return [];
  const ids = [];
  let page = '';
  do {
    const r = await (await api('GET', `${API}/playlistItems?part=contentDetails&playlistId=${uploads}&maxResults=50${page ? `&pageToken=${page}` : ''}`)).json();
    for (const it of r.items ?? []) ids.push(it.contentDetails.videoId);
    page = r.nextPageToken;
  } while (page && ids.length < 150);
  const out = [];
  for (let i = 0; i < ids.length; i += 50) {
    const r = await (await api('GET', `${API}/videos?part=status,snippet&id=${ids.slice(i, i + 50).join(',')}`)).json();
    for (const v of r.items ?? []) {
      const when = v.status.publishAt ?? (v.status.privacyStatus === 'public' ? v.snippet.publishedAt : null);
      out.push({id: v.id, title: v.snippet.title, privacy: v.status.privacyStatus, when, scheduled: Boolean(v.status.publishAt && Date.parse(v.status.publishAt) > Date.now())});
    }
  }
  return out;
}
// Instagram release times already taken, in ms. "busy" holds the Reels scheduled in Business Suite, as
// 'YYYY-MM-DDTHH:MM' (IST); a bare date is from the one-slot days (before 4 Oct 2026) and stands for 18:30.
function igTaken() {
  if (!fs.existsSync(IG_QUEUE)) return [];
  const q = JSON.parse(fs.readFileSync(IG_QUEUE, 'utf8'));
  return [
    ...(q.busy ?? []).map((b) => Date.parse(`${b.length === 10 ? `${b}T18:30` : b.slice(0, 16)}:00+05:30`)),
    ...(q.posts ?? []).filter((p) => p.status !== 'cancelled').map((p) => Date.parse(p.publishAt)),
  ].filter((t) => !Number.isNaN(t));
}
// YouTube has TWO slots a day, 11:30 and 23:30 IST (the user, 2 Oct 2026, after the 11:30 AM releases brought
// subscribers). Each run takes the next free slot: a slot is free when no video of the channel is public or
// scheduled within 3 hours of it, and it is at least 2 hours away (upload + processing).
// `pill`: during the pill test, skip the slots of the other arm (a Short built with the pill only takes a 23:30 slot,
// one built without it only an 11:30 slot; the skipped slot is the next run's)
async function nextFreeYouTubeSlot(pill) {
  const taken = (await channelVideos()).filter((v) => v.when).map((v) => Date.parse(v.when));
  for (let d = 0; d < 60; d++) {
    const date = istDate(Date.now() + d * 86400000);
    for (const hm of SLOTS.youtube) {
      const iso = `${date}T${hm}:00+05:30`;
      const t = Date.parse(iso);
      if (t < Date.now() + 2 * 3600 * 1000) continue;
      if (pill && inPillTest(t) && pillOfSlot(t) !== pill) continue;
      if (!taken.some((w) => Math.abs(w - t) < 3 * 3600 * 1000)) return iso;
    }
  }
  throw new Error('no free YouTube slot in the next 60 days');
}
// Instagram has TWO slots a day as well, 18:30 and 21:00 IST (the user, 15 Oct 2026; 06:30 and 18:30 from 4 Oct). A
// Reel takes the next free slot: nothing taken within 2 hours of it (the two slots are 2.5 hours apart), at least 2
// hours away, and not before `notBefore` (the Short's own YouTube release), so a Reel never comes out ahead of its Short.
function nextFreeIgSlot(notBefore = 0) {
  const taken = igTaken();
  for (let d = 0; d < 90; d++) {
    const date = istDate(Date.now() + d * 86400000);
    for (const hm of SLOTS.instagram) {
      const iso = `${date}T${hm}:00+05:30`;
      const t = Date.parse(iso);
      if (t < Date.now() + 2 * 3600 * 1000 || t < notBefore) continue;
      if (!taken.some((w) => Math.abs(w - t) < 2 * 3600 * 1000)) return iso;
    }
  }
  throw new Error('no free Instagram slot in the next 90 days');
}
export async function nextFreeDay() {
  return istDate(Date.parse(await nextFreeYouTubeSlot())); // kept for older callers: the day of the next YouTube slot
}
async function listUpcoming() {
  const vids = (await channelVideos()).filter((v) => v.scheduled).sort((a, b) => Date.parse(a.when) - Date.parse(b.when));
  if (!vids.length) console.log('YouTube: nothing scheduled');
  for (const v of vids) console.log(`${istTime(Date.parse(v.when))}  ${v.id}  ${v.title}`);
  const ig = igTaken().filter((t) => t >= Date.now()).sort((a, b) => a - b);
  if (ig.length) console.log(`Instagram slots taken: ${ig.map((t) => istTime(t).replace(' IST', '')).join(', ')}`);
  const yt = await nextFreeYouTubeSlot();
  console.log(`next free YouTube slot: ${istTime(Date.parse(yt))} (slots ${SLOTS.youtube.join(' and ')} IST) · next free Instagram slot after it: ${istTime(Date.parse(nextFreeIgSlot(Date.parse(yt))))} (slots ${SLOTS.instagram.join(' and ')} IST)`);
}
async function nextSlot(asJson) {
  const iso = await nextFreeYouTubeSlot();
  const arm = armOfSlot(Date.parse(iso));
  const a = LENGTH_ARMS[arm];
  const test = inTest(Date.parse(iso));
  const length = {arm, min: a.min, max: a.max, ...(test ? {test: LENGTH_TEST.name} : {}), slot: iso};
  const pt = inPillTest(Date.parse(iso));
  const subscribe = {arm: pillOfSlot(Date.parse(iso)), ...(pt ? {test: PILL_TEST.name} : {}), slot: iso};
  const kt = inKindTest(Date.parse(iso));
  const kind = {kind: kindOfSlot(Date.parse(iso)), ...(kt ? {test: KIND_TEST.name} : {}), slot: iso};
  if (asJson) return console.log(JSON.stringify({slot: iso, length, subscribe, kind}));
  console.log(`next free YouTube slot: ${istTime(Date.parse(iso))}`);
  console.log(`length arm: ${arm.toUpperCase()} = ${a.min}-${a.max} s, ${a.words} words in all (about ${a.chars} characters)${test ? ` · length test "${LENGTH_TEST.name}": 23:30 slots are short, 11:30 slots are standard` : ' · every Short is 30-35 s since 16 Oct 2026 (the length test is over)'}`);
  console.log(`subscribe arm: ${subscribe.arm === 'pill' ? 'PILL = the short silent Subscribe pill over the last 2.2 s (timeline_lib.py sets it; nobody says "subscribe")' : 'NONE = no pill, the Short ends on the button and loops'}${pt ? ` · pill test "${PILL_TEST.name}" until ${istTime(Date.parse(PILL_TEST.end))}: 23:30 slots get the pill, 11:30 slots none` : ''}`);
  console.log(`topic kind: ${kind.kind === 'curious' ? 'CURIOUS = take the topic from topics.md "Curious queue" (story.md §6)' : 'TEST = take the topic from topics.md "Queue" (a test the viewer does on themselves)'}${kt ? ` · topic test "${KIND_TEST.name}" until ${istTime(Date.parse(KIND_TEST.end))}: the kind alternates by day` : ''}`);
  console.log(`put into publish.json → "length": ${JSON.stringify(length)}, "subscribe": ${JSON.stringify(subscribe)}, "kind": ${JSON.stringify(kind)}`);
}
async function reschedule(id, when) {
  const t = Date.parse(when);
  if (!id || Number.isNaN(t)) die('usage: yt.mjs reschedule <videoId> <ISO time, e.g. 2026-10-02T23:30:00+05:30>');
  if (t < Date.now() + 10 * 60 * 1000) die('the new time must be at least 10 minutes away');
  const r = await (await api('GET', `${API}/videos?part=status&id=${id}`)).json();
  const cur = r.items?.[0]?.status;
  if (!cur) die(`no video ${id} on this channel`);
  if (cur.privacyStatus !== 'private') die(`video ${id} is ${cur.privacyStatus}; only private/scheduled videos can be rescheduled`);
  // videos.update clears every status field it isn't sent, so send back all the writable ones
  const status = {privacyStatus: 'private', publishAt: new Date(t).toISOString(), license: cur.license, embeddable: cur.embeddable, publicStatsViewable: cur.publicStatsViewable, selfDeclaredMadeForKids: cur.selfDeclaredMadeForKids ?? cur.madeForKids ?? false, containsSyntheticMedia: cur.containsSyntheticMedia ?? false};
  const u = await (await api('PUT', `${API}/videos?part=status`, {json: {id, status}})).json();
  console.log(`${id}: now scheduled for ${u.status?.publishAt} (${istTime(Date.parse(u.status?.publishAt))})`);
}

// ---- upload -----------------------------------------------------------------------------------------------------
const checkText = (spec) => {
  const y = spec.youtube ?? {};
  const problems = [];
  if (!spec.title || spec.title.length > 100) problems.push(`title must be 1–100 characters (${spec.title?.length ?? 0})`);
  for (const [k, s] of [['title', spec.title], ['description', spec.description]]) if (/[<>]/.test(s ?? '')) problems.push(`${k} contains < or > (YouTube rejects angle brackets; write it in words)`);
  if (Buffer.byteLength(spec.description ?? '') > 5000) problems.push('description over 5000 bytes');
  if ((spec.tags ?? []).join(',').length > 500) problems.push('tags over 500 characters');
  if (!/#shorts/i.test(`${spec.title} ${spec.description}`)) problems.push('no #Shorts hashtag in the title or description');
  if (y.publishAt && y.publishAt !== 'auto') {
    const t = Date.parse(y.publishAt);
    if (Number.isNaN(t)) problems.push(`youtube.publishAt is not a date: ${y.publishAt}`);
    else if (t < Date.now() + 10 * 60 * 1000) problems.push(`youtube.publishAt must be in the future: ${y.publishAt}`);
    if ((y.privacy ?? 'private') !== 'private') problems.push('a scheduled video must be uploaded as private');
  }
  return problems;
};
async function uploadVideo(file, resource, notify) {
  const size = fs.statSync(file).size;
  const init = await api('POST', `${UPLOAD}/videos?uploadType=resumable&part=snippet,status&notifySubscribers=${notify}`, {
    json: resource,
    headers: {'X-Upload-Content-Type': 'video/mp4', 'X-Upload-Content-Length': String(size)},
  });
  const session = init.headers.get('location');
  if (!session) throw new Error('no upload session URL');
  const fd = fs.openSync(file, 'r');
  let start = 0;
  let failures = 0;
  try {
    while (true) {
      const end = Math.min(size, start + CHUNK) - 1;
      const buf = Buffer.alloc(end - start + 1);
      fs.readSync(fd, buf, 0, buf.length, start);
      let r;
      try {
        r = await fetch(session, {method: 'PUT', headers: {Authorization: `Bearer ${await accessToken()}`, 'Content-Length': String(buf.length), 'Content-Range': `bytes ${start}-${end}/${size}`}, body: buf});
      } catch (e) {
        r = null;
      }
      if (r && (r.status === 200 || r.status === 201)) {
        process.stdout.write(`\r  uploaded ${(size / 1e6).toFixed(1)} MB, 100%   \n`);
        return await r.json();
      }
      if (r && r.status === 308) {
        const range = r.headers.get('range');
        start = range ? Number(range.split('-')[1]) + 1 : 0;
        failures = 0;
        process.stdout.write(`\r  uploaded ${(start / 1e6).toFixed(1)} of ${(size / 1e6).toFixed(1)} MB, ${Math.floor((100 * start) / size)}%   `);
        continue;
      }
      // network error or 5xx: ask the server how much it has, then resume
      if (++failures > 6) throw new Error(`upload failed (${r ? r.status + ' ' + (await r.text()).slice(0, 200) : 'network error'})`);
      await new Promise((res) => setTimeout(res, 2000 * failures * failures));
      const q = await fetch(session, {method: 'PUT', headers: {Authorization: `Bearer ${await accessToken()}`, 'Content-Length': '0', 'Content-Range': `bytes */${size}`}}).catch(() => null);
      if (q && (q.status === 200 || q.status === 201)) return await q.json();
      if (q && q.status === 308) start = q.headers.get('range') ? Number(q.headers.get('range').split('-')[1]) + 1 : 0;
    }
  } finally {
    fs.closeSync(fd);
  }
}
async function upload(specPath, dryRun, autoSchedule = false) {
  const specFile = path.resolve(specPath);
  const base = path.dirname(specFile);
  const spec = JSON.parse(fs.readFileSync(specFile, 'utf8'));
  const save = () => fs.writeFileSync(specFile, JSON.stringify(spec, null, 2) + '\n');
  const y = (spec.youtube ??= {});
  const ig = (spec.instagram ??= {});
  const problems = checkText(spec);
  for (const k of ['file', 'cover', 'captions']) if (spec[k] && !fs.existsSync(path.resolve(base, spec[k]))) problems.push(`${k} not found: ${spec[k]}`);
  if (!spec.file) problems.push('no "file"');
  if (spec.cover && fs.existsSync(path.resolve(base, spec.cover)) && fs.statSync(path.resolve(base, spec.cover)).size > 2e6) problems.push('cover over 2 MB (YouTube thumbnail limit)');
  if (problems.length) die(`fix publish.json first:\n  ${problems.join('\n  ')}`);
  if (!y.id && (autoSchedule || y.publishAt === 'auto') && dryRun && !hasToken()) {
    console.log('schedule: auto (the day is picked at upload time; it needs the YouTube token)');
  } else if (!y.id && (autoSchedule || y.publishAt === 'auto')) {
    const slot = await nextFreeYouTubeSlot(spec.subscribe?.arm);
    y.privacy = 'private';
    y.publishAt = slot;
    if (!ig.skip && !ig.id && (!ig.publishAt || ig.publishAt === 'auto' || autoSchedule)) ig.publishAt = nextFreeIgSlot(Date.parse(slot));
    if (!dryRun) save();
    console.log(`schedule: YouTube ${istTime(Date.parse(slot))}, Instagram ${ig.publishAt ? istTime(Date.parse(ig.publishAt)) : 'unchanged'}`);
    const built = spec.length?.arm;
    if (spec.subscribe?.slot && spec.subscribe.slot !== slot) console.log(`note: built for ${istTime(Date.parse(spec.subscribe.slot))}, but it takes ${istTime(Date.parse(slot))}: the next free slot of its own pill-test arm (${spec.subscribe.arm})`);
    if (LENGTH_ARMS[built] && built !== armOfSlot(Date.parse(slot))) console.log(`note: built to the ${built} length arm, but ${istTime(Date.parse(slot))} is a ${armOfSlot(Date.parse(slot))} slot (the numbers report lists the length and the slot of every Short)`);
  }
  const file = path.resolve(base, spec.file);
  if (dryRun) {
    console.log(`"${spec.title}" · ${y.privacy ?? 'private'}${y.publishAt ? ` → public at ${y.publishAt}` : ''} · ${(fs.statSync(file).size / 1e6).toFixed(1)} MB · ${spec.tags?.length ?? 0} tags`);
    console.log('dry run: everything checks out');
    return;
  }
  const ch = await myChannel();
  if (!ch) die('the token has no channel');
  if (ch.snippet.title !== CHANNEL) die(`this token is for "${ch.snippet.title}", not ${CHANNEL}: run \`yt.mjs auth\` and pick ${CHANNEL}`);
  console.log(`channel: ${ch.snippet.title} (${ch.id})\n${spec.title}`);
  if (!y.id) {
    const resource = {
      snippet: {title: spec.title, description: spec.description ?? '', tags: spec.tags ?? [], categoryId: y.categoryId ?? '27', defaultLanguage: y.language ?? 'en', defaultAudioLanguage: y.language ?? 'en'},
      status: {
        privacyStatus: y.privacy ?? 'private',
        ...(y.publishAt && y.publishAt !== 'auto' ? {publishAt: new Date(y.publishAt).toISOString()} : {}),
        selfDeclaredMadeForKids: y.madeForKids ?? false,
        containsSyntheticMedia: y.syntheticMedia ?? false,
        license: 'youtube',
        embeddable: true,
        publicStatsViewable: true,
      },
    };
    const res = await uploadVideo(file, resource, y.notifySubscribers ?? true);
    y.id = res.id;
    y.url = `https://youtube.com/shorts/${res.id}`;
    y.uploaded = new Date().toISOString();
    save();
    console.log(`  video ${y.id}: ${res.status?.privacyStatus}${res.status?.publishAt ? `, public ${istTime(Date.parse(res.status.publishAt))}` : ''} → ${y.url}`);
  } else console.log(`  already uploaded: ${y.url}`);
  if (spec.cover && !y.thumbnailSet) {
    const img = fs.readFileSync(path.resolve(base, spec.cover));
    try {
      await api('POST', `${UPLOAD}/thumbnails/set?videoId=${y.id}&uploadType=media`, {body: img, headers: {'Content-Type': spec.cover.endsWith('.png') ? 'image/png' : 'image/jpeg'}});
      y.thumbnailSet = true;
      save();
      console.log('  thumbnail set');
    } catch (e) {
      console.log(`  thumbnail not set (${e.message.slice(0, 160)}); retry with the same command later`);
    }
  }
  if (spec.captions && !y.captionsSet) {
    const boundary = `cp${crypto.randomBytes(8).toString('hex')}`;
    const meta = JSON.stringify({snippet: {videoId: y.id, language: y.language ?? 'en', name: '', isDraft: false}});
    const srt = fs.readFileSync(path.resolve(base, spec.captions));
    const body = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${boundary}\r\nContent-Type: application/octet-stream\r\n\r\n`),
      srt,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);
    await api('POST', `${UPLOAD}/captions?part=snippet&uploadType=multipart`, {body, headers: {'Content-Type': `multipart/related; boundary=${boundary}`}});
    y.captionsSet = true;
    save();
    console.log('  captions uploaded');
  }
  if (y.playlist && !/REPLACE/.test(y.playlist) && !y.playlistSet) {
    try {
      await playlistAdd(y.playlist, [y.id], false);
      y.playlistSet = true;
      save();
    } catch (e) {
      console.log(`  not added to the playlist "${y.playlist}" (${e.message.slice(0, 160)}); retry with the same command later`);
    }
  }
  try {
    queueComment(spec);
  } catch (e) {
    console.log(`  the "Next up" comment was not queued (${e.message.slice(0, 160)}); \`yt.mjs queue-comment <publish.json>\` does it later`);
  }
}

// ---- the "Next up" comment (since 9 Oct 2026) -------------------------------------------------------------------
// One top-level comment per Short, from the channel, posted once the Short is public (YouTube takes no comments on a
// private video). The queue lives in ~/.config/cp/comment-queue.json; `upload` adds to it, `comments-due` posts.
const readCommentQueue = () => {
  try {
    return JSON.parse(fs.readFileSync(COMMENT_QUEUE, 'utf8'));
  } catch {
    return {posts: []};
  }
};
const writeCommentQueue = (q) => {
  fs.mkdirSync(path.dirname(COMMENT_QUEUE), {recursive: true});
  q.posts = q.posts.slice(-60);
  fs.writeFileSync(COMMENT_QUEUE, JSON.stringify(q, null, 2) + '\n');
};
function queueComment(spec) {
  const y = spec.youtube ?? {};
  if (!y.id || y.comment === false) return false;
  const q = readCommentQueue();
  if (q.posts.some((p) => p.videoId === y.id)) return false;
  const draft = String(spec.pinnedComment ?? '').replace(/\s*\(suggestion[^)]*\)\s*$/i, '').trim();
  let question = draft.split('\n').slice(1).join(' ').trim();       // line 1 is the drafted "Next up": rewritten when posted
  if (/REPLACE|<[a-z ]+>/i.test(question)) question = '';              // a template line that was never filled in is not posted
  q.posts.push({videoId: y.id, slug: spec.slug, title: spec.title, publishAt: y.publishAt && y.publishAt !== 'auto' ? new Date(y.publishAt).toISOString() : new Date().toISOString(), question, status: 'queued', queued: new Date().toISOString()});
  writeCommentQueue(q);
  console.log(`  "Next up" comment queued for ${spec.slug}: \`yt.mjs comments-due\` posts it once the Short is public`);
  return true;
}
async function commentsDue(dryRun) {
  const q = readCommentQueue();
  const due = q.posts.filter((p) => p.status === 'queued');
  if (!due.length) return console.log('comments: nothing queued');
  const ch = await myChannel();
  if (!ch || ch.snippet.title !== CHANNEL) die(`this token is not for ${CHANNEL}`);
  const vids = await channelVideos();
  for (const p of due) {
    const v = vids.find((x) => x.id === p.videoId);
    if (!v) {
      p.status = 'gone';
      console.log(`comments: ${p.slug}: the video is no longer on the channel`);
      continue;
    }
    if (v.privacy !== 'public') {
      console.log(`comments: ${p.slug}: not public yet (${v.when ? istTime(Date.parse(v.when)) : 'no release time'})`);
      continue;
    }
    let threads;
    try {
      threads = (await (await api('GET', `${API}/commentThreads?part=snippet&videoId=${p.videoId}&maxResults=100&order=time`)).json()).items ?? [];
    } catch (e) {
      p.tries = (p.tries ?? 0) + 1;
      if (p.tries >= 3) p.status = 'failed';
      p.note = e.message.slice(0, 200);
      console.log(`comments: ${p.slug}: could not read its comments (${p.note})`);
      continue;
    }
    const mine = threads.find((t) => t.snippet?.topLevelComment?.snippet?.authorChannelId?.value === ch.id);
    if (mine) {
      Object.assign(p, {status: 'posted', commentId: mine.id, note: 'the channel had commented already'});
      console.log(`comments: ${p.slug}: the channel has a comment there already; nothing posted`);
      continue;
    }
    const t0 = Date.parse(v.when);
    const next = vids.filter((x) => x.id !== v.id && x.when && Date.parse(x.when) > t0 && (x.privacy === 'public' || x.scheduled)).sort((a, b) => Date.parse(a.when) - Date.parse(b.when))[0];
    const text = [next ? `Next up: ${next.title} Subscribe so you don't miss it!` : 'Subscribe for a new strange question every day.', p.question].filter(Boolean).join('\n');
    if (dryRun) {
      console.log(`comments: ${p.slug}: would post on ${p.videoId}:\n${text.split('\n').map((l) => '    | ' + l).join('\n')}`);
      continue;
    }
    try {
      const r = await (await api('POST', `${API}/commentThreads?part=snippet`, {json: {snippet: {videoId: p.videoId, topLevelComment: {snippet: {textOriginal: text}}}}})).json();
      Object.assign(p, {status: 'posted', commentId: r.id, posted: new Date().toISOString(), text});
      console.log(`comments: ${p.slug}: posted on ${p.videoId} ("${text.split('\n')[0]}"). To pin it: the YouTube app, the comment's menu, Pin`);
    } catch (e) {
      p.tries = (p.tries ?? 0) + 1;
      if (p.tries >= 3) p.status = 'failed';
      p.note = e.message.slice(0, 200);
      console.log(`comments: ${p.slug}: not posted (${p.note})`);
    }
  }
  if (!dryRun) writeCommentQueue(q);
}

// ---- replies to viewers' comments (the user, 24 Oct 2026: "update the comment scheduler to also reply comments on youtube") --
// comments-inbox: the viewers' top-level comments on the channel's videos that the channel has not answered yet, from the
// last --hours (default 72), oldest first, as JSON for the routine that writes the replies; plus how many replies the channel
// posted in the last 24 h (the routine's daily cap). Read only (1 quota unit a page).
// comment-reply <commentId> (--file <text file> | <text...>) [--dry-run]: ONE reply, from the channel, under one viewer's
// top-level comment. It re-reads the thread first and refuses when the channel has replied there already (a second run never
// answers twice), when the comment is the channel's own or not on a CurioPulse video, and when the text has a link or runs
// over 300 characters (50 quota units a reply).
const URL_RE = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|ly|me|gg|xyz|link|shop|app)\b)/i;
async function threadReplies(t) {
  const shown = t.replies?.comments ?? [];
  if ((t.snippet?.totalReplyCount ?? 0) <= shown.length) return shown;
  const out = [];
  let page = '';
  do {
    const r = await (await api('GET', `${API}/comments?part=snippet&parentId=${t.id}&maxResults=100&textFormat=plainText${page ? `&pageToken=${page}` : ''}`)).json();
    out.push(...(r.items ?? []));
    page = r.nextPageToken;
  } while (page && out.length < 500);
  return out;
}
async function commentsInbox(hours, asJson) {
  const ch = await myChannel();
  if (!ch || ch.snippet.title !== CHANNEL) die(`this token is not for ${CHANNEL}`);
  const since = Date.now() - hours * 3600 * 1000, day = Date.now() - 24 * 3600 * 1000;
  const threads = [];
  let page = '';
  for (let n = 0; n < 8; n++) {                          // newest first; stop once a whole page is older than the window
    const r = await (await api('GET', `${API}/commentThreads?part=snippet,replies&allThreadsRelatedToChannelId=${ch.id}&maxResults=100&order=time&textFormat=plainText${page ? `&pageToken=${page}` : ''}`)).json();
    const items = r.items ?? [];
    threads.push(...items);
    page = r.nextPageToken;
    if (!page || !items.length || items.every((t) => Date.parse(t.snippet.topLevelComment.snippet.publishedAt) < since)) break;
  }
  const inbox = [];
  let answered = 0, ours = 0, repliesLast24h = 0, viewerRepliesToUs = 0;
  for (const t of threads) {
    const top = t.snippet.topLevelComment.snippet, when = Date.parse(top.publishedAt);
    const replies = (t.snippet.totalReplyCount ?? 0) > 0 ? await threadReplies(t) : [];
    repliesLast24h += replies.filter((c) => c.snippet.authorChannelId?.value === ch.id && Date.parse(c.snippet.publishedAt) > day).length;
    if (when < since) continue;
    if (top.authorChannelId?.value === ch.id) {                // the channel's own comment (the "Next up"): viewers answer it there
      ours++;
      const lastOurs = Math.max(0, ...replies.filter((c) => c.snippet.authorChannelId?.value === ch.id).map((c) => Date.parse(c.snippet.publishedAt)));
      for (const r of replies) {                                // a viewer's reply with no reply from the channel after it
        const w = Date.parse(r.snippet.publishedAt);
        if (r.snippet.authorChannelId?.value === ch.id || w < since) continue;
        viewerRepliesToUs++;
        if (w < lastOurs) { answered++; continue; }
        inbox.push({id: r.id, kind: 'reply-in-our-thread', threadId: t.id, context: (top.textOriginal ?? '').replace(/\s+/g, ' ').slice(0, 200), videoId: t.snippet.videoId, author: r.snippet.authorDisplayName, text: r.snippet.textOriginal ?? r.snippet.textDisplay, publishedAt: r.snippet.publishedAt, likeCount: r.snippet.likeCount ?? 0});
      }
      continue;
    }
    if (replies.some((c) => c.snippet.authorChannelId?.value === ch.id)) { answered++; continue; }
    inbox.push({id: t.id, kind: 'comment', videoId: t.snippet.videoId, author: top.authorDisplayName, text: top.textOriginal ?? top.textDisplay, publishedAt: top.publishedAt, likeCount: top.likeCount ?? 0, replies: t.snippet.totalReplyCount ?? 0});
  }
  const ids = [...new Set(inbox.map((c) => c.videoId))], titles = {};
  for (let i = 0; i < ids.length; i += 50) {
    const r = await (await api('GET', `${API}/videos?part=snippet&id=${ids.slice(i, i + 50).join(',')}`)).json();
    for (const v of r.items ?? []) titles[v.id] = v.snippet.title;
  }
  for (const c of inbox) c.videoTitle = titles[c.videoId] ?? '?';
  inbox.sort((a, b) => Date.parse(a.publishedAt) - Date.parse(b.publishedAt));
  const out = {channel: ch.snippet.title, windowHours: hours, repliesLast24h, unanswered: inbox.length, alreadyAnswered: answered, ourOwnComments: ours, viewerRepliesInOurThreads: viewerRepliesToUs, inbox};
  if (asJson) return console.log(JSON.stringify(out, null, 1));
  console.log(`${CHANNEL}: ${inbox.length} viewer comments unanswered in the last ${hours} h (${answered} answered already); the channel replied ${repliesLast24h} times in the last 24 h`);
  for (const c of inbox) console.log(`  ${c.id}  ${istTime(Date.parse(c.publishedAt))}  ${c.author} on "${c.videoTitle}": ${c.text.replace(/\s+/g, ' ').slice(0, 140)}`);
}
// comments-mine [--hours N]: the channel's own replies in the last N hours (default 24), newest first: read only. The routine
// reads it so its replies do not all sound the same.
async function commentsMine(hours) {
  const ch = await myChannel();
  if (!ch || ch.snippet.title !== CHANNEL) die(`this token is not for ${CHANNEL}`);
  const since = Date.now() - hours * 3600 * 1000, out = [];
  let page = '';
  for (let n = 0; n < 8; n++) {
    const r = await (await api('GET', `${API}/commentThreads?part=snippet,replies&allThreadsRelatedToChannelId=${ch.id}&maxResults=100&order=time&textFormat=plainText${page ? `&pageToken=${page}` : ''}`)).json();
    for (const t of r.items ?? []) {
      const replies = (t.snippet.totalReplyCount ?? 0) > 0 ? await threadReplies(t) : [];
      for (const c of replies) if (c.snippet.authorChannelId?.value === ch.id && Date.parse(c.snippet.publishedAt) > since)
        out.push({at: c.snippet.publishedAt, to: t.snippet.topLevelComment.snippet.authorDisplayName, comment: (t.snippet.topLevelComment.snippet.textOriginal ?? '').slice(0, 100), reply: c.snippet.textOriginal ?? c.snippet.textDisplay});
    }
    page = r.nextPageToken;
    if (!page) break;
  }
  out.sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  console.log(`${CHANNEL}: ${out.length} replies from the channel in the last ${hours} h`);
  for (const x of out) console.log(`  ${istTime(Date.parse(x.at))}  to ${x.to} ("${x.comment.replace(/\s+/g, ' ')}"): ${x.reply.replace(/\s+/g, ' ')}`);
}
async function commentReply(id, text, dryRun) {
  if (!id || !text) die('usage: yt.mjs comment-reply <commentId> (--file <text file> | <text...>) [--dry-run]');
  text = text.trim();
  if (text.length < 2 || text.length > 300) die(`the reply is ${text.length} characters: keep it between 2 and 300`);
  if (URL_RE.test(text)) die('the reply has a link in it: replies never carry links');
  const ch = await myChannel();
  if (!ch || ch.snippet.title !== CHANNEL) die(`this token is not for ${CHANNEL}`);
  // a top-level comment's id, or a reply's id ("<thread id>.<reply id>": a viewer answering the channel in its own thread)
  const threadId = id.split('.')[0], inThread = id.includes('.');
  const t = (await (await api('GET', `${API}/commentThreads?part=snippet,replies&id=${encodeURIComponent(threadId)}&textFormat=plainText`)).json()).items?.[0];
  if (!t) die(`no comment thread ${threadId} (deleted, held for review, or not a top-level comment)`);
  if (t.snippet.channelId && t.snippet.channelId !== ch.id) die(`comment ${id} is not on a ${CHANNEL} video`);
  const top = t.snippet.topLevelComment.snippet;
  const replies = (t.snippet.totalReplyCount ?? 0) > 0 ? await threadReplies(t) : [];
  let who = top.authorDisplayName, said = top.textOriginal ?? '';
  if (inThread) {
    if (top.authorChannelId?.value !== ch.id) die(`${id} is a reply in a viewer's thread: answer the thread (${threadId}) instead`);
    const target = replies.find((c) => c.id === id);
    if (!target) die(`no reply ${id} in that thread (deleted or held for review)`);
    if (target.snippet.authorChannelId?.value === ch.id) die(`${id} is the channel's own reply: not answered`);
    const w = Date.parse(target.snippet.publishedAt);
    if (replies.some((c) => c.snippet.authorChannelId?.value === ch.id && Date.parse(c.snippet.publishedAt) > w)) return console.log(`reply: ${id}: the channel has answered after it already; nothing posted`);
    who = target.snippet.authorDisplayName; said = target.snippet.textOriginal ?? '';
    if (who && !text.startsWith(who)) text = `${who} ${text}`;   // in a thread, the @handle tells the viewer it is for them
    if (text.length > 300) die(`with the @handle the reply is ${text.length} characters: keep it under 300`);
  } else {
    if (top.authorChannelId?.value === ch.id) die(`comment ${id} is the channel's own: not answered`);
    if (replies.some((c) => c.snippet.authorChannelId?.value === ch.id)) return console.log(`reply: ${id}: the channel has replied there already; nothing posted`);
  }
  if (dryRun) return console.log(`reply: ${id}: would reply to ${who} ("${said.replace(/\s+/g, ' ').slice(0, 80)}"):\n    | ${text.split('\n').join('\n    | ')}`);
  const r = await (await api('POST', `${API}/comments?part=snippet`, {json: {snippet: {parentId: threadId, textOriginal: text}}})).json();
  console.log(`reply: ${id}: posted (${r.id}) to ${who} on video ${t.snippet.videoId}`);
}

// ---- playlists and the channel page -----------------------------------------------------------------------------
async function myPlaylists() {
  const out = [];
  let page = '';
  do {
    const r = await (await api('GET', `${API}/playlists?part=snippet,contentDetails,status&mine=true&maxResults=50${page ? `&pageToken=${page}` : ''}`)).json();
    out.push(...(r.items ?? []));
    page = r.nextPageToken ?? '';
  } while (page);
  return out;
}
async function findPlaylist(titleOrId) {
  const all = await myPlaylists();
  const hit = all.find((p) => p.id === titleOrId) ?? all.find((p) => p.snippet.title.trim().toLowerCase() === String(titleOrId).trim().toLowerCase());
  if (!hit) throw new Error(`no playlist "${titleOrId}" on the channel (it has: ${all.map((p) => `"${p.snippet.title}"`).join(', ') || 'none'})`);
  return hit;
}
async function playlistsList() {
  const all = await myPlaylists();
  if (!all.length) return console.log('no playlists');
  for (const p of all) console.log(`${p.id}  ${String(p.contentDetails?.itemCount ?? 0).padStart(3)} videos  ${p.status?.privacyStatus}  "${p.snippet.title}"`);
}
async function playlistCreate(title, description, dryRun) {
  if (!title) die('usage: yt.mjs playlist-create "<title>" "<description>" [--dry-run]');
  const all = await myPlaylists();
  const have = all.find((p) => p.snippet.title.trim().toLowerCase() === title.trim().toLowerCase());
  if (have) return console.log(`playlist "${title}" exists already: ${have.id}`);
  if (dryRun) return console.log(`dry run: would create the public playlist "${title}" (${(description ?? '').length} characters of description)`);
  const r = await (await api('POST', `${API}/playlists?part=snippet,status`, {json: {snippet: {title, description: description ?? '', defaultLanguage: 'en'}, status: {privacyStatus: 'public'}}})).json();
  console.log(`created the playlist "${title}": ${r.id}`);
}
async function playlistAdd(titleOrId, videoIds, dryRun) {
  if (!titleOrId || !videoIds.length) die('usage: yt.mjs playlist-add "<title or id>" <videoId>... [--dry-run]');
  const pl = await findPlaylist(titleOrId);
  const inIt = new Set();
  let page = '';
  do {
    const r = await (await api('GET', `${API}/playlistItems?part=contentDetails&playlistId=${pl.id}&maxResults=50${page ? `&pageToken=${page}` : ''}`)).json();
    for (const it of r.items ?? []) inIt.add(it.contentDetails.videoId);
    page = r.nextPageToken ?? '';
  } while (page);
  for (const id of videoIds) {
    if (inIt.has(id)) {
      console.log(`  ${id}: already in "${pl.snippet.title}"`);
      continue;
    }
    if (dryRun) {
      console.log(`  dry run: would add ${id} to "${pl.snippet.title}"`);
      continue;
    }
    await api('POST', `${API}/playlistItems?part=snippet`, {json: {snippet: {playlistId: pl.id, resourceId: {kind: 'youtube#video', videoId: id}}}});
    console.log(`  ${id}: added to "${pl.snippet.title}"`);
  }
}
// the trailer shown to people who have not subscribed, and the channel description. channels.update replaces the
// whole brandingSettings part, so everything YouTube returned is sent back with only these two fields changed.
async function channelSet(args) {
  const val = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
  const trailer = val('--trailer'), descFile = val('--description-file'), dryRun = args.includes('--dry-run');
  if (!trailer && !descFile) die('usage: yt.mjs channel-set [--trailer <videoId>] [--description-file <file>] [--dry-run]');
  const ch = (await (await api('GET', `${API}/channels?part=brandingSettings,snippet&mine=true`)).json()).items?.[0];
  if (!ch || ch.snippet.title !== CHANNEL) die(`this token is not for ${CHANNEL}`);
  const b = structuredClone(ch.brandingSettings ?? {});
  b.channel ??= {};
  const before = {trailer: b.channel.unsubscribedTrailer ?? null, description: b.channel.description ?? ''};
  if (trailer) b.channel.unsubscribedTrailer = trailer;
  if (descFile) b.channel.description = fs.readFileSync(descFile, 'utf8').replace(/\s+$/, '');
  console.log(`trailer: ${before.trailer ?? '(none)'} → ${b.channel.unsubscribedTrailer ?? '(none)'}`);
  if (descFile) console.log(`description: ${before.description.length} → ${b.channel.description.length} characters`);
  console.log(`kept as they are: ${Object.keys(b.channel).filter((k) => !['unsubscribedTrailer', 'description'].includes(k)).join(', ') || '(nothing else)'}; banner ${b.image?.bannerExternalUrl ? 'kept' : '(none set)'}`);
  if (dryRun) return console.log('dry run: nothing sent');
  const r = await (await api('PUT', `${API}/channels?part=brandingSettings`, {json: {id: ch.id, brandingSettings: b}})).json();
  console.log(`saved. trailer now ${r.brandingSettings?.channel?.unsubscribedTrailer ?? '(none)'}; banner ${r.brandingSettings?.image?.bannerExternalUrl ? 'still there' : 'MISSING: set it again in Studio'}`);
}
async function sectionAdd(titleOrId, dryRun, first = false) { // --first: put the row at the top of the Home tab (24 Oct 2026)
  if (!titleOrId) die('usage: yt.mjs section-add "<playlist title or id>" [--dry-run]');
  const pl = await findPlaylist(titleOrId);
  const sections = (await (await api('GET', `${API}/channelSections?part=snippet,contentDetails&mine=true`)).json()).items ?? [];
  if (sections.some((s) => (s.contentDetails?.playlists ?? []).includes(pl.id))) return console.log(`"${pl.snippet.title}" has a Home row already`);
  const position = first ? 0 : sections.reduce((m, s) => Math.max(m, (s.snippet.position ?? -1) + 1), 0);
  if (dryRun) return console.log(`dry run: would add a Home row for "${pl.snippet.title}" at position ${position}`);
  await api('POST', `${API}/channelSections?part=snippet,contentDetails`, {json: {snippet: {type: 'singlePlaylist', position}, contentDetails: {playlists: [pl.id]}}});
  console.log(`Home row added for "${pl.snippet.title}" at position ${position}`);
}

// ---- stats (read-only, Data API) ---------------------------------------------------------------------------------
const secondsOf = (iso) => {
  const m = /P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso ?? '') ?? [];
  return (Number(m[1] ?? 0) * 24 + Number(m[2] ?? 0)) * 3600 + Number(m[3] ?? 0) * 60 + Number(m[4] ?? 0);
};
async function stats(n, asJson) {
  const ch = await myChannel();
  const uploads = ch?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploads) die('this channel has no uploads playlist');
  const ids = [];
  let page = '';
  do {
    const r = await (await api('GET', `${API}/playlistItems?part=contentDetails&playlistId=${uploads}&maxResults=50${page ? `&pageToken=${page}` : ''}`)).json();
    for (const it of r.items ?? []) ids.push(it.contentDetails.videoId);
    page = r.nextPageToken;
  } while (page && ids.length < n);
  const rows = [];
  const want = ids.slice(0, n);
  for (let i = 0; i < want.length; i += 50) {
    const r = await (await api('GET', `${API}/videos?part=snippet,statistics,status,contentDetails&id=${want.slice(i, i + 50).join(',')}`)).json();
    for (const v of r.items ?? []) {
      const when = v.status.publishAt ?? v.snippet.publishedAt;
      const s = v.statistics ?? {};
      rows.push({
        id: v.id,
        title: v.snippet.title,
        privacy: v.status.privacyStatus,
        publishAt: when,
        publishIST: istTime(Date.parse(when)),
        hoursLive: v.status.privacyStatus === 'public' ? Math.max(0, Math.round((Date.now() - Date.parse(when)) / 3600000)) : 0,
        seconds: secondsOf(v.contentDetails?.duration),
        views: Number(s.viewCount ?? 0),
        likes: s.likeCount === undefined ? null : Number(s.likeCount),
        comments: s.commentCount === undefined ? null : Number(s.commentCount),
      });
    }
  }
  rows.sort((a, b) => Date.parse(b.publishAt) - Date.parse(a.publishAt));
  if (asJson) return console.log(JSON.stringify({channel: ch.snippet.title, subscribers: Number(ch.statistics?.subscriberCount ?? 0), at: new Date().toISOString(), videos: rows}, null, 1));
  console.log(`channel: ${ch.snippet.title}, ${ch.statistics?.subscriberCount ?? '?'} subscribers, ${ch.statistics?.videoCount ?? '?'} videos, ${ch.statistics?.viewCount ?? '?'} views (as of ${istTime(Date.now())})`);
  console.log('published (IST)       live h   len   views  likes  comm  id           title');
  for (const r of rows) {
    const live = r.privacy === 'public' ? String(r.hoursLive).padStart(6) : r.privacy.slice(0, 6).padStart(6);
    console.log(`${r.publishIST.padEnd(21)} ${live} ${String(r.seconds).padStart(5)}s ${String(r.views).padStart(7)} ${String(r.likes ?? '-').padStart(6)} ${String(r.comments ?? '-').padStart(5)}  ${r.id}  ${r.title.slice(0, 60)}`);
  }
}

// ---- analytics (read-only, YouTube Analytics API) ----------------------------------------------------------------
async function uploadIds(n) {
  const ch = await myChannel();
  const uploads = ch?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploads) die('this channel has no uploads playlist');
  const ids = [];
  let page = '';
  do {
    const r = await (await api('GET', `${API}/playlistItems?part=contentDetails&playlistId=${uploads}&maxResults=50${page ? `&pageToken=${page}` : ''}`)).json();
    for (const it of r.items ?? []) ids.push(it.contentDetails.videoId);
    page = r.nextPageToken;
  } while (page && ids.length < n);
  return {ch, ids: ids.slice(0, n)};
}
async function report(params) {
  const q = new URLSearchParams({ids: 'channel==MINE', startDate: '2020-01-01', endDate: istDate(Date.now()), ...params});
  const r = await (await api('GET', `${YTA}?${q}`)).json();
  const cols = (r.columnHeaders ?? []).map((c) => c.name);
  return (r.rows ?? []).map((row) => Object.fromEntries(row.map((v, i) => [cols[i], v])));
}
async function analytics(n, asJson, curveId) {
  const {ch, ids} = await uploadIds(n);
  if (!ids.length) die('no uploads yet');
  const base = 'views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained,subscribersLost,likes,shares';
  const byVideo = (metrics) => report({dimensions: 'video', filters: `video==${ids.join(',')}`, metrics, sort: '-views', maxResults: String(ids.length)});
  let rows;
  try {
    rows = await byVideo(`${base},engagedViews`);
  } catch (e) {
    if (/insufficient|scope|forbidden/i.test(e.message)) die(`${e.message}\n  the token lacks yt-analytics.readonly: run \`node ~/.claude/skills/cp/bin/yt.mjs auth\` again and allow it`);
    if (!/engagedViews|Unknown identifier/i.test(e.message)) throw e;
    rows = await byVideo(base); // older API without engaged views: fall back
  }
  const info = {};
  for (let i = 0; i < ids.length; i += 50) {
    const r = await (await api('GET', `${API}/videos?part=snippet,status&id=${ids.slice(i, i + 50).join(',')}`)).json();
    for (const v of r.items ?? []) info[v.id] = {title: v.snippet.title, when: v.status.publishAt ?? v.snippet.publishedAt};
  }
  const out = ids.map((id) => {
    const r = rows.find((x) => x.video === id) ?? {};
    const views = Number(r.views ?? 0);
    const net = Number(r.subscribersGained ?? 0) - Number(r.subscribersLost ?? 0);
    return {
      id, title: info[id]?.title ?? '?', publishIST: info[id] ? istTime(Date.parse(info[id].when)) : '?', views,
      engagedViews: r.engagedViews === undefined ? null : Number(r.engagedViews),
      stayedPct: r.engagedViews === undefined || !views ? null : Math.round((1000 * Number(r.engagedViews)) / views) / 10,
      avgViewPct: r.averageViewPercentage === undefined ? null : Math.round(Number(r.averageViewPercentage) * 10) / 10,
      avgViewSec: r.averageViewDuration === undefined ? null : Number(r.averageViewDuration),
      watchMin: Number(r.estimatedMinutesWatched ?? 0), subsNet: net, subsPer1k: views ? Math.round((10000 * net) / views) / 10 : null,
      likes: Number(r.likes ?? 0), shares: Number(r.shares ?? 0),
    };
  });
  let curve = null;
  if (curveId) {
    const pts = await report({dimensions: 'elapsedVideoTimeRatio', filters: `video==${curveId}`, metrics: 'audienceWatchRatio,relativeRetentionPerformance', sort: 'elapsedVideoTimeRatio'});
    curve = pts.map((p) => ({at: Number(p.elapsedVideoTimeRatio), watch: Number(p.audienceWatchRatio), relative: Number(p.relativeRetentionPerformance)}));
  }
  if (asJson) return console.log(JSON.stringify({channel: ch.snippet.title, at: new Date().toISOString(), videos: out, curve}, null, 1));
  console.log(`channel: ${ch.snippet.title} · YouTube Analytics, all time to ${istDate(Date.now())} (lags Studio by 1-2 days)`);
  console.log('published (IST)        views stayed%  avg%  avg s  watch min  subs  /1k  likes shares  id           title');
  const f = (v, w, d = '-') => String(v ?? d).padStart(w);
  for (const r of out) console.log(`${r.publishIST.padEnd(21)} ${f(r.views, 6)} ${f(r.stayedPct, 7)} ${f(r.avgViewPct, 5)} ${f(r.avgViewSec, 6)} ${f(Math.round(r.watchMin), 10)} ${f(r.subsNet, 5)} ${f(r.subsPer1k, 4)} ${f(r.likes, 6)} ${f(r.shares, 6)}  ${r.id}  ${r.title.slice(0, 50)}`);
  if (curve) {
    if (!curve.length) return console.log(`retention ${curveId}: no data yet (YouTube needs a day or two and enough views)`);
    const at = (x) => curve.reduce((b, p) => (Math.abs(p.at - x) < Math.abs(b.at - x) ? p : b));
    console.log(`retention ${curveId} (audience watch ratio; above 1.0 = rewatches):`);
    console.log('  ' + [0.01, 0.1, 0.25, 0.5, 0.75, 0.9, 1].map((x) => `${Math.round(x * 100)}%: ${at(x).watch.toFixed(2)}`).join('  '));
    let drop = {d: 0};
    for (let i = 1; i < curve.length; i++) if (curve[i - 1].watch - curve[i].watch > drop.d) drop = {d: curve[i - 1].watch - curve[i].watch, at: curve[i].at};
    if (drop.at !== undefined) console.log(`  steepest drop: -${drop.d.toFixed(2)} at ${Math.round(drop.at * 100)}% of the video`);
  }
}

// ---- numbers: the log every run starts with (reference/analytics.md) ---------------------------------------------
// Rewrites <skill>/numbers.md and appends one line to <skill>/numbers.jsonl (the history: views at 24 h, 72 h … can be
// read back from it). Public counters come from the Data API (live); stayed / viewed / subscribers come from the
// Analytics API, which runs about two days behind.
async function numbers(outDir = SKILL_DIR) {
  const {ch, ids} = await uploadIds(60);
  if (!ids.length) die('no uploads yet');
  const now = Date.now();
  const vids = [];
  for (let i = 0; i < ids.length; i += 50) {
    const r = await (await api('GET', `${API}/videos?part=snippet,statistics,status,contentDetails&id=${ids.slice(i, i + 50).join(',')}`)).json();
    for (const v of r.items ?? []) {
      const st = v.statistics ?? {};
      vids.push({id: v.id, title: v.snippet.title, privacy: v.status.privacyStatus, when: Date.parse(v.status.publishAt ?? v.snippet.publishedAt), seconds: secondsOf(v.contentDetails?.duration), views: Number(st.viewCount ?? 0), likes: Number(st.likeCount ?? 0), comments: Number(st.commentCount ?? 0)});
    }
  }
  vids.sort((a, b) => b.when - a.when);
  let an = [];
  let note = '';
  const base = 'views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained,subscribersLost,likes,shares';
  const byVideo = (metrics) => report({dimensions: 'video', filters: `video==${ids.join(',')}`, metrics, sort: '-views', maxResults: String(ids.length)});
  try {
    try {
      an = await byVideo(`${base},engagedViews`);
    } catch (e) {
      if (!/engagedViews|Unknown identifier/i.test(e.message)) throw e;
      an = await byVideo(base);
    }
  } catch (e) {
    note = /insufficient|scope|forbidden/i.test(e.message) ? 'the token lacks yt-analytics.readonly: the user must run `yt.mjs auth` again and allow both permissions' : e.message;
  }
  const testStart = LENGTH_TEST ? Date.parse(LENGTH_TEST.start) : Infinity;
  const testEnd = LENGTH_TEST?.end ? Date.parse(LENGTH_TEST.end) : Infinity;
  const pillStart = PILL_TEST ? Date.parse(PILL_TEST.start) : Infinity, pillEnd = PILL_TEST ? Date.parse(PILL_TEST.end) : Infinity;
  for (const v of vids) {
    v.live = v.privacy === 'public' && v.when <= now;
    v.hours = v.live ? (now - v.when) / 3600000 : 0;
    v.slot = istHM(v.when);
    v.group = v.seconds > 90 ? 'long-form' // the weekly film; a CurioPulse Short has never run past 75 s
      : v.when >= pillEnd ? 'after the pill test'
      : v.when >= pillStart ? PILL_GROUPS[pillOfSlot(v.when)] // the pill test (24 Oct 2026): the slot says the arm
      : v.when >= testEnd ? SINCE_GROUP // the rules of 15 Oct 2026: every Short 30-35 s, a test the viewer tries, no pill
      : v.when >= testStart ? (v.seconds && v.seconds <= 37 ? 'TEST · short arm (30-35 s)' : v.seconds >= 43 ? 'TEST · standard arm (45-50 s)' : 'TEST · between the arms')
      : v.seconds > 55 ? 'before · 64-75 s' : `before · 46-50 s · ${v.slot} slot`;
    const r = an.find((x) => x.video === v.id);
    if (r && Number(r.views) > 0) {
      v.a = {views: Number(r.views), engaged: r.engagedViews === undefined ? null : Number(r.engagedViews), avgPct: Number(r.averageViewPercentage), avgSec: Number(r.averageViewDuration),
        subs: Number(r.subscribersGained ?? 0) - Number(r.subscribersLost ?? 0), likes: Number(r.likes ?? 0), shares: Number(r.shares ?? 0)};
    }
  }
  // history: one line per run
  const logFile = path.join(outDir, 'numbers.jsonl');
  let prev = null;
  if (fs.existsSync(logFile)) {
    const lines = fs.readFileSync(logFile, 'utf8').trim().split('\n').filter(Boolean);
    try { prev = JSON.parse(lines[lines.length - 1]); } catch {}
  }
  const subsNow = Number(ch.statistics?.subscriberCount ?? 0);
  const snap = {at: new Date(now).toISOString(), subscribers: subsNow, videos: Object.fromEntries(vids.map((v) => [v.id, {views: v.views, likes: v.likes, comments: v.comments, ...(v.a ? {a: v.a} : {})}]))};
  fs.appendFileSync(logFile, JSON.stringify(snap) + '\n');
  // the report
  const mean = (xs) => (xs.length ? xs.reduce((p, q) => p + q, 0) / xs.length : null);
  const f = (x, d = 0, unit = '') => (x === null || x === undefined || Number.isNaN(x) ? '–' : `${x.toFixed(d)}${unit}`);
  const order = ['after the pill test', PILL_GROUPS.pill, PILL_GROUPS.none, SINCE_GROUP, 'TEST · short arm (30-35 s)', 'TEST · standard arm (45-50 s)', 'TEST · between the arms', 'before · 46-50 s · 23:30 slot', 'before · 46-50 s · 11:30 slot', 'before · 64-75 s'];
  const groups = [...order.filter((g) => g.startsWith('TEST') && !g.includes('between') || g.startsWith('PILL') && Date.now() >= pillStart || vids.some((v) => v.group === g)), ...new Set(vids.map((v) => v.group).filter((g) => g !== 'long-form' && !order.includes(g)))];
  const md = [];
  md.push('# CurioPulse numbers', '');
  md.push(`Written by \`yt.mjs numbers\` on ${istTime(now)}. Do not edit: every /cp run rewrites it. How to read it: \`reference/analytics.md\`.`, '');
  md.push(`**Channel:** ${subsNow} subscribers${prev ? ` (${subsNow - prev.subscribers >= 0 ? '+' : ''}${subsNow - prev.subscribers} since the log of ${istTime(Date.parse(prev.at))})` : ''} · ${vids.filter((v) => v.live).length} public videos, ${vids.filter((v) => !v.live).length} scheduled.`);
  md.push(`Views and likes are the public counters, live. Stayed, viewed and subscribers come from YouTube Analytics, which runs about two days behind: a dash means YouTube has not processed that day yet.${note ? ` **Analytics failed: ${note}.**` : ''}`, '');
  md.push(`## The length test${LENGTH_TEST ? ` (${LENGTH_TEST.name}, ${istTime(testStart)} to ${LENGTH_TEST.end ? istTime(testEnd) : 'now'})` : ' (ended)'}, and the Shorts since`, '');
  md.push(`During the test a Short in a 23:30 slot was built to 30-35 s, one in an 11:30 slot to 45-50 s. The verdict was **views per Short** and **subscribers per 1,000 views**; a shorter video scores a higher average % viewed by construction, so that column is not the verdict. The "before" rows are the same slots before the test. **"${SINCE_GROUP}"** are the Shorts made to the rules of 15 Oct 2026 (every Short 30-35 s, a test the viewer tries, no Subscribe pill: \`reference/analytics.md\`); read them against the short arm.`, '');
  if (PILL_TEST) md.push(`**The pill test** (${PILL_TEST.name}, ${istTime(pillStart)} to ${istTime(pillEnd)}; user, 24 Oct 2026): a Short in a 23:30 slot ends with a short silent Subscribe pill, one in an 11:30 slot with none. The verdict is **subscribers per 1,000 views** (the pill must win it clearly) with **views per Short** and **stayed to watch** about the same; how to read it: \`reference/analytics.md\`, the pill test.`, '');
  md.push('| Group | Shorts | Views per Short (live 48 h+) | Stayed to watch | Avg % viewed | Avg seconds watched | Subs per 1,000 views |', '|---|---|---|---|---|---|---|');
  const median = (xs) => { const q = [...xs].sort((p, r) => p - r); return q.length ? (q.length % 2 ? q[(q.length - 1) / 2] : (q[q.length / 2 - 1] + q[q.length / 2]) / 2) : null; };
  const rowOf = (g, all, withMedian) => {
    const settled = all.filter((v) => v.hours >= 48);
    const withA = all.filter((v) => v.a && v.a.views >= 200);
    const aViews = withA.reduce((p, v) => p + v.a.views, 0);
    const eng = withA.every((v) => v.a.engaged !== null) && aViews ? (100 * withA.reduce((p, v) => p + v.a.engaged, 0)) / aViews : null;
    const base = `| ${g} | ${all.length} | ${settled.length ? `${f(mean(settled.map((v) => v.views)))} (${settled.length})` : '–'} | ${withA.length ? f(eng, 1, ' %') : '–'} | ${f(mean(withA.map((v) => v.a.avgPct)), 1, ' %')} | ${f(mean(withA.map((v) => v.a.avgSec)), 0, ' s')} | ${aViews ? `${f((1000 * withA.reduce((p, v) => p + v.a.subs, 0)) / aViews, 1)} (${withA.length})` : '–'} |`;
    return withMedian ? `${base} ${settled.length ? f(median(settled.map((v) => v.views))) : '–'} | ${withA.length ? f(median(withA.map((v) => (1000 * v.a.subs) / v.a.views)), 1) : '–'} |` : base;
  };
  for (const g of groups) md.push(rowOf(g, vids.filter((v) => v.group === g && v.live)));
  md.push('', 'In brackets: how many Shorts the figure rests on. Analytics figures count a Short once YouTube has processed 200 of its views.', '');
  if (PILL_TEST && Date.now() >= pillStart) {
    // the two slots have different audiences, so each arm is read against the same slot's Shorts just before the test
    md.push(`### The pill test against the same slots before it`, '');
    md.push(`Each arm sits in one slot, and the slots differ by themselves, so read each arm against the Shorts of the same slot from ${istTime(testEnd)} to the test's start (no pill in either slot then). The pill helps only if the 23:30 row gains on its "before" row clearly more than the 11:30 row gains on its own (\`reference/analytics.md\`, the pill test). The last two columns are middles per Short, which one hit cannot swing.`, '');
    md.push('| Slot | Shorts | Views per Short (live 48 h+) | Stayed to watch | Avg % viewed | Avg seconds watched | Subs per 1,000 views | Middle views per Short | Middle subs per 1,000 |', '|---|---|---|---|---|---|---|---|---|');
    const shorts = vids.filter((v) => v.live && v.seconds && v.seconds <= 90);
    for (const hm of ['23:30', '11:30']) {
      md.push(rowOf(`${hm} · before (16 Oct to the test, no pill)`, shorts.filter((v) => v.slot === hm && v.when >= testEnd && v.when < pillStart), true));
      md.push(rowOf(`${hm} · the test (${PILL_TEST.slots[hm] === 'pill' ? 'pill' : 'no pill'})`, shorts.filter((v) => v.slot === hm && v.when >= pillStart && v.when < pillEnd), true));
    }
    md.push('');
  }
  if (KIND_TEST && Date.now() >= Date.parse(KIND_TEST.start)) {
    // the topic test (24 Oct 2026): the kind alternates by day across both slots, so each kind is read straight
    const ks = Date.parse(KIND_TEST.start), ke = Date.parse(KIND_TEST.end);
    const shorts = vids.filter((v) => v.live && v.seconds && v.seconds <= 90 && v.when >= ks && v.when < ke);
    md.push(`### The topic test (${KIND_TEST.name}): test Shorts against curious Shorts`, '');
    md.push('Each day has one of each, alternating slots, so the two rows face the same audiences and the same pill split. Read views per Short (middle), stayed to watch and the end of the curve together; subscribers per 1,000 last (`reference/analytics.md`, the topic test).', '');
    md.push('| Kind | Shorts | Views per Short (live 48 h+) | Stayed to watch | Avg % viewed | Avg seconds watched | Subs per 1,000 views | Middle views per Short | Middle subs per 1,000 |', '|---|---|---|---|---|---|---|---|---|');
    md.push(rowOf('test (body, mind, screen)', shorts.filter((v) => kindOfSlot(v.when) === 'test'), true));
    md.push(rowOf('curious (the world)', shorts.filter((v) => kindOfSlot(v.when) === 'curious'), true));
    md.push('');
  }
  md.push('## Every upload (newest first)', '');
  md.push('"Counted" is how many of the views Analytics has processed so far; the columns after it rest on those views only, and stay blank under 200.', '');
  md.push('| Released (IST) | Length | Group | Views | Likes | Counted | Stayed | Avg % viewed | Avg s | Subs | Per 1,000 | Title |', '|---|---|---|---|---|---|---|---|---|---|---|---|');
  for (const v of vids) {
    const a = v.a && v.a.views >= 200 ? v.a : null;
    md.push(`| ${istTime(v.when).replace(' IST', '')}${v.live ? '' : ' (scheduled)'} | ${v.seconds ? `${v.seconds} s` : '–'} | ${v.group} | ${v.views} | ${v.likes} | ${v.a ? v.a.views : '–'} | ${a && a.engaged !== null ? f((100 * a.engaged) / a.views, 1, ' %') : '–'} | ${a ? f(a.avgPct, 1, ' %') : '–'} | ${a ? f(a.avgSec, 0) : '–'} | ${a ? a.subs : '–'} | ${a ? f((1000 * a.subs) / a.views, 1) : '–'} | [${v.title.replace(/\|/g, '/')}](https://youtu.be/${v.id}) |`);
  }
  md.push('');
  fs.writeFileSync(path.join(outDir, 'numbers.md'), md.join('\n'));
  console.log(md.join('\n'));
  console.log(`written: ${path.join(outDir, 'numbers.md')} · logged: ${logFile}`);
}

async function channelInfo(asJson) {
  const ch = (await (await api('GET', `${API}/channels?part=snippet,statistics,brandingSettings,contentDetails&mine=true`)).json()).items?.[0];
  if (!ch) die('the token has no YouTube channel');
  const sections = (await (await api('GET', `${API}/channelSections?part=snippet,contentDetails&mine=true`)).json()).items ?? [];
  const lists = await myPlaylists();
  const b = ch.brandingSettings?.channel ?? {};
  const out = {
    id: ch.id, title: ch.snippet.title, handle: ch.snippet.customUrl, subscribers: Number(ch.statistics?.subscriberCount ?? 0),
    description: b.description ?? ch.snippet.description ?? '', keywords: b.keywords ?? '', country: b.country ?? null,
    trailer: b.unsubscribedTrailer ?? null, banner: Boolean(ch.brandingSettings?.image?.bannerExternalUrl),
    sections: sections.map((x) => ({id: x.id, type: x.snippet.type, position: x.snippet.position, title: x.snippet.title ?? null, playlists: x.contentDetails?.playlists ?? []})),
    playlists: lists.map((p) => ({id: p.id, title: p.snippet.title, items: p.contentDetails?.itemCount ?? 0, privacy: p.status?.privacyStatus})),
  };
  if (asJson) return console.log(JSON.stringify(out, null, 1));
  console.log(`${out.title} (${out.handle ?? out.id}) · ${out.subscribers} subscribers · banner ${out.banner ? 'set' : 'not set'}`);
  console.log(`description (${out.description.length} characters):\n${out.description.split('\n').map((l) => '  | ' + l).join('\n')}`);
  console.log(`trailer for people who have not subscribed: ${out.trailer ?? '(none)'}`);
  console.log(`Home rows: ${out.sections.length ? out.sections.map((x) => `${x.position}:${x.type}${x.title ? ` "${x.title}"` : ''}`).join(', ') : '(none)'}`);
  console.log(`playlists: ${out.playlists.length ? out.playlists.map((p) => `"${p.title}" (${p.items}, ${p.privacy})`).join(' · ') : '(none)'}`);
}

async function status(ids) {
  const r = await (await api('GET', `${API}/videos?part=status,processingDetails,snippet&id=${ids.join(',')}`)).json();
  for (const v of r.items ?? [])
    console.log(`${v.id}: "${v.snippet.title}" · ${v.status.privacyStatus}${v.status.publishAt ? ` (public ${istTime(Date.parse(v.status.publishAt))})` : ''} · upload ${v.status.uploadStatus} · processing ${v.processingDetails?.processingStatus ?? '?'}${v.status.rejectionReason ? ` · rejected: ${v.status.rejectionReason}` : ''}`);
  if (!(r.items ?? []).length) console.log('no such video on this channel');
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('/yt.mjs')) {
  const [cmd, ...args] = process.argv.slice(2);
  try {
    if (cmd === 'auth') await auth();
    else if (cmd === 'whoami') await whoami();
    else if (cmd === 'upload') await upload(args.find((a) => !a.startsWith('--')) ?? die('usage: yt.mjs upload <publish.json> [--dry-run] [--schedule=auto]'), args.includes('--dry-run'), args.includes('--schedule=auto'));
    else if (cmd === 'upcoming') await listUpcoming();
    else if (cmd === 'next-free') console.log(await nextFreeDay());
    else if (cmd === 'next-slot') await nextSlot(args.includes('--json'));
    else if (cmd === 'numbers') await numbers();
    else if (cmd === 'reschedule') await reschedule(args[0], args[1]);
    else if (cmd === 'thumbnail') { // thumbnail <videoId> <image.jpg|png>: replace a live or scheduled video's thumbnail (17 Oct 2026)
      if (!args[0] || !args[1] || !fs.existsSync(args[1])) throw new Error('usage: yt.mjs thumbnail <videoId> <image.jpg|png>');
      const img = fs.readFileSync(args[1]);
      if (img.length > 2e6) throw new Error(`the image is ${(img.length / 1e6).toFixed(1)} MB; YouTube's limit is 2 MB`);
      await api('POST', `${UPLOAD}/thumbnails/set?videoId=${args[0]}&uploadType=media`, {body: img, headers: {'Content-Type': args[1].toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'}});
      console.log(`thumbnail set on ${args[0]} from ${args[1]}`);
    }
    else if (cmd === 'status') await status(args);
    else if (cmd === 'thumbnail') {   // yt.mjs thumbnail <videoId> <image.jpg|png>: replace one video's thumbnail (under 2 MB)
      const [vid, img] = args;
      if (!vid || !img || !fs.existsSync(img)) die('usage: yt.mjs thumbnail <videoId> <image.jpg|png>');
      if (fs.statSync(img).size > 2e6) die('image over 2 MB (YouTube thumbnail limit)');
      await api('POST', `${UPLOAD}/thumbnails/set?videoId=${vid}&uploadType=media`, {body: fs.readFileSync(img), headers: {'Content-Type': img.endsWith('.png') ? 'image/png' : 'image/jpeg'}});
      console.log(`thumbnail set on ${vid}`);
    }
    else if (cmd === 'channel-info') await channelInfo(args.includes('--json'));
    else if (cmd === 'comments-due') await commentsDue(args.includes('--dry-run'));
    else if (cmd === 'comments-inbox') await commentsInbox(Math.max(1, Math.min(720, Number(args[args.indexOf('--hours') + 1]) || 72)), args.includes('--json'));
    else if (cmd === 'comments-mine') await commentsMine(Math.max(1, Math.min(720, Number(args[args.indexOf('--hours') + 1]) || 24)));
    else if (cmd === 'comment-reply') {
      const fi = args.indexOf('--file');
      const rest = args.filter((a, i) => a !== '--dry-run' && i !== fi && i !== fi + 1);
      const text = fi >= 0 ? fs.readFileSync(args[fi + 1], 'utf8') : rest.slice(1).join(' ');
      await commentReply(rest[0], text, args.includes('--dry-run'));
    }
    else if (cmd === 'queue-comment') {
      const spec = JSON.parse(fs.readFileSync(path.resolve(args[0] ?? die('usage: yt.mjs queue-comment <publish.json>')), 'utf8'));
      if (!spec.youtube?.id) die('this publish.json has no youtube.id: upload the Short first');
      if (!queueComment(spec)) console.log(`not queued: ${spec.slug} is in the queue already, or has "comment": false`);
    }
    else if (cmd === 'playlists') await playlistsList();
    else if (cmd === 'playlist-create') await playlistCreate(args.filter((a) => !a.startsWith('--'))[0], args.filter((a) => !a.startsWith('--'))[1], args.includes('--dry-run'));
    else if (cmd === 'playlist-add') await playlistAdd(args.filter((a) => !a.startsWith('--'))[0], args.filter((a) => !a.startsWith('--')).slice(1), args.includes('--dry-run'));
    else if (cmd === 'channel-set') await channelSet(args);
    else if (cmd === 'section-add') await sectionAdd(args.filter((a) => !a.startsWith('--'))[0], args.includes('--dry-run'), args.includes('--first'));
    else if (cmd === 'stats') await stats(Math.max(1, Math.min(200, Number(args.find((a) => /^\d+$/.test(a)) ?? 10))), args.includes('--json'));
    else if (cmd === 'analytics') {
      const ci = args.indexOf('--curve');
      const n = Number(args.find((a, i) => /^\d+$/.test(a) && (ci < 0 || i !== ci + 1)) ?? 10);
      await analytics(Math.max(1, Math.min(200, n)), args.includes('--json'), ci >= 0 ? args[ci + 1] : null);
    }
    else console.log('usage: yt.mjs auth | whoami | thumbnail <videoId> <image> | upcoming | next-free | reschedule <id> <time> | upload <publish.json> [--dry-run] [--schedule=auto] | status <videoId>... | stats [n] [--json] | analytics [n] [--curve <videoId>] [--json] | next-slot [--json] | comments-due [--dry-run] | queue-comment <publish.json> | comments-inbox [--hours N] [--json] | comments-mine [--hours N] | comment-reply <commentId> (--file f | text) [--dry-run] | channel-info | playlists | playlist-create | playlist-add | channel-set | section-add | numbers');
  } catch (e) {
    die(e.message);
  }
}
