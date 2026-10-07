#!/usr/bin/env node
// YouTube Data API uploader for CurioPulse LONG-FORM videos (no dependencies; Node 22+). A copy of the Shorts
// uploader (skill/cp/bin/yt.mjs) without Instagram, with a weekly slot, and with credentials from the environment.
//
//   node yt.mjs whoami                    read-only check: which channel the token belongs to
//   node yt.mjs upload <publish.json> [--dry-run] [--schedule=auto]
//   node yt.mjs upcoming                  every video already scheduled on the channel + the next free long-form slot
//   node yt.mjs next-free                 the next free long-form slot (ISO time, IST)
//   node yt.mjs reschedule <videoId> <ISO time, e.g. 2026-10-11T17:30:00+05:30>
//   node yt.mjs status <videoId>...       processing / privacy / scheduled time
//   node yt.mjs demand "<question>"...    read-only: the videos of 4-20 min that YouTube ranks first for the question,
//                                         with views, length, year, channel and thumbnail address, then the median.
//                                         A film is made only for a question whose median is 1,000,000 or more
//                                         (reference/long-form.md). About 100 quota units per question, of the
//                                         10,000 a day that every upload of the account shares: 4 at most per run.
//   node yt.mjs auth                      (the Mac only) one-time consent; writes ~/.config/cp/youtube-token.json
//
// Release slot: ONE long-form video a week, Sunday 17:30 IST (my choice, 4 Oct 2026; change LONG_SLOT below or set
// CPL_SLOT="<weekday 0-6, 0 = Sunday> <HH:MM>"). --schedule=auto takes the next such slot that is at least 3 hours
// away and has no CurioPulse video public or scheduled within 3 hours of it (the Shorts go out at 11:30 and 23:30).
//
// Credentials (never printed, never committed), first match wins:
//   cloud routine: the environment variables YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN
//   the Mac:       ~/.config/cp/youtube-client.json or ~/.config/va/youtube-client.json, and ~/.config/cp/youtube-token.json
//
// publish.json (long/<slug>/publish.json; paths relative to that folder):
// { "slug": "…", "kind": "long", "file": "<slug>.mp4", "title": "…", "description": "…", "tags": ["…"],
//   "cover": "cover.jpg" (1280x720), "captions": "<slug>.srt",
//   "youtube": { "publishAt": "auto", "privacy": "private", "categoryId": "27", "language": "en",
//                "madeForKids": false, "syntheticMedia": false, "notifySubscribers": true } }
// Progress is written back (youtube.id, url, thumbnailSet, captionsSet), so a re-run resumes.
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';

const CONF = path.join(os.homedir(), '.config/cp');
const CLIENT_FILE = [path.join(CONF, 'youtube-client.json'), path.join(os.homedir(), '.config/va/youtube-client.json')].find((f) => fs.existsSync(f)) ?? path.join(CONF, 'youtube-client.json');
const TOKEN_FILE = path.join(CONF, 'youtube-token.json');
const ENV = process.env;
const FROM_ENV = Boolean(ENV.YT_CLIENT_ID && ENV.YT_CLIENT_SECRET && ENV.YT_REFRESH_TOKEN);
const CHANNEL = 'CurioPulse';
const SCOPE = 'https://www.googleapis.com/auth/youtube.force-ssl'; // upload, thumbnails, captions
const API = 'https://www.googleapis.com/youtube/v3';
const UPLOAD = 'https://www.googleapis.com/upload/youtube/v3';
const CHUNK = 8 * 1024 * 1024; // a multiple of 256 KiB, as resumable uploads require
const [slotDay, slotTime] = (ENV.CPL_SLOT ?? '0 17:30').split(' ');
export const LONG_SLOT = {weekday: Number(slotDay), time: slotTime}; // IST: Sunday 17:30
const IST_MS = 5.5 * 3600 * 1000;
const istDate = (ms) => new Date(ms + IST_MS).toISOString().slice(0, 10); // YYYY-MM-DD in IST
const istTime = (ms) => new Date(ms + IST_MS).toISOString().slice(0, 16).replace('T', ' ') + ' IST';

const die = (msg) => {
  console.error(`yt: ${msg}`);
  process.exit(1);
};
const client = () => {
  if (FROM_ENV) return {client_id: ENV.YT_CLIENT_ID, client_secret: ENV.YT_CLIENT_SECRET};
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
  if (!FROM_ENV && !fs.existsSync(TOKEN_FILE)) die(`no YouTube credentials: set YT_CLIENT_ID, YT_CLIENT_SECRET and YT_REFRESH_TOKEN in the cloud environment (on the Mac: \`node ${process.argv[1]} auth\`)`);
  const c = client();
  const {refresh_token} = FROM_ENV ? {refresh_token: ENV.YT_REFRESH_TOKEN} : JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8'));
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
// ONE long-form video a week (LONG_SLOT, IST). A slot is free when it is at least 3 hours away (upload + processing)
// and no video of the channel is public or scheduled within 3 hours of it.
async function nextFreeYouTubeSlot() {
  const taken = (await channelVideos()).filter((v) => v.when).map((v) => Date.parse(v.when));
  for (let d = 0; d < 120; d++) {
    const ms = Date.now() + d * 86400000;
    if (new Date(ms + IST_MS).getUTCDay() !== LONG_SLOT.weekday) continue;
    const iso = `${istDate(ms)}T${LONG_SLOT.time}:00+05:30`;
    const t = Date.parse(iso);
    if (t < Date.now() + 3 * 3600 * 1000) continue;
    if (!taken.some((w) => Math.abs(w - t) < 3 * 3600 * 1000)) return iso;
  }
  throw new Error('no free long-form slot in the next 120 days');
}
async function listUpcoming() {
  const vids = (await channelVideos()).filter((v) => v.scheduled).sort((a, b) => Date.parse(a.when) - Date.parse(b.when));
  if (!vids.length) console.log('YouTube: nothing scheduled');
  for (const v of vids) console.log(`${istTime(Date.parse(v.when))}  ${v.id}  ${v.title}`);
  console.log(`next free long-form slot: ${istTime(Date.parse(await nextFreeYouTubeSlot()))}`);
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
  if (/#shorts/i.test(`${spec.title} ${spec.description}`)) problems.push('a long-form video must not carry #Shorts');
  if (!/^0:00 /m.test(spec.description ?? '')) problems.push('no chapters in the description (a line starting "0:00 ", then at least two more time lines)');
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
  const problems = checkText(spec);
  for (const k of ['file', 'cover', 'captions']) if (spec[k] && !fs.existsSync(path.resolve(base, spec[k]))) problems.push(`${k} not found: ${spec[k]}`);
  if (!spec.file) problems.push('no "file"');
  if (spec.cover && fs.existsSync(path.resolve(base, spec.cover)) && fs.statSync(path.resolve(base, spec.cover)).size > 2e6) problems.push('cover over 2 MB (YouTube thumbnail limit)');
  if (problems.length) die(`fix publish.json first:\n  ${problems.join('\n  ')}`);
  if (!y.id && (autoSchedule || y.publishAt === 'auto') && dryRun && !FROM_ENV && !fs.existsSync(TOKEN_FILE)) {
    console.log('schedule: auto (the day is picked at upload time; it needs the YouTube token)');
  } else if (!y.id && (autoSchedule || y.publishAt === 'auto')) {
    const slot = await nextFreeYouTubeSlot();
    y.privacy = 'private';
    y.publishAt = slot;
    if (!dryRun) save();
    console.log(`schedule: YouTube ${istTime(Date.parse(slot))}`);
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
    y.url = `https://youtu.be/${res.id}`;
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
}

async function status(ids) {
  const r = await (await api('GET', `${API}/videos?part=status,processingDetails,snippet&id=${ids.join(',')}`)).json();
  for (const v of r.items ?? [])
    console.log(`${v.id}: "${v.snippet.title}" · ${v.status.privacyStatus}${v.status.publishAt ? ` (public ${istTime(Date.parse(v.status.publishAt))})` : ''} · upload ${v.status.uploadStatus} · processing ${v.processingDetails?.processingStatus ?? '?'}${v.status.rejectionReason ? ` · rejected: ${v.status.rejectionReason}` : ''}`);
  if (!(r.items ?? []).length) console.log('no such video on this channel');
}

// ---- demand: is this question already watched by the million? (reference/long-form.md, "Which questions get made")
async function demand(questions) {
  if (!questions.length) die('usage: yt.mjs demand "<question>" ["<another>" ...]   (about 100 quota units each)');
  if (questions.length > 4) die('at most 4 questions in one call: each costs about 100 of the 10,000 units a day the uploads share');
  const secs = (iso) => {
    const m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso ?? '') ?? [];
    return Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0);
  };
  for (const q of questions) {
    const s = await (await api('GET', `${API}/search?part=snippet&type=video&videoDuration=medium&maxResults=8&relevanceLanguage=en&q=${encodeURIComponent(q)}`)).json();
    const ids = (s.items ?? []).map((i) => i.id.videoId).filter(Boolean);
    if (!ids.length) { console.log(`\n"${q}": no results`); continue; }
    const v = (await (await api('GET', `${API}/videos?part=snippet,statistics,contentDetails&id=${ids.join(',')}`)).json()).items ?? [];
    const rows = v.map((x) => ({views: Number(x.statistics?.viewCount ?? 0), title: x.snippet.title, ch: x.snippet.channelTitle, d: secs(x.contentDetails?.duration), y: x.snippet.publishedAt.slice(0, 4), id: x.id}));
    console.log(`\n"${q}"  (videos of 4-20 min that YouTube ranks first)`);
    for (const r of rows) console.log(`  ${String(r.views).padStart(10)}  ${Math.floor(r.d / 60)}:${String(r.d % 60).padStart(2, '0')}  ${r.y}  ${r.ch.slice(0, 22).padEnd(22)}  ${r.title.slice(0, 70)}  https://i.ytimg.com/vi/${r.id}/mqdefault.jpg`);
    const sorted = rows.map((r) => r.views).sort((a, b) => a - b);
    const median = sorted.length % 2 ? sorted[(sorted.length - 1) / 2] : Math.round((sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2);
    const millions = sorted.filter((x) => x >= 1e6).length;
    const ok = median >= 1e6 || millions >= 3;
    console.log(`  median ${median.toLocaleString('en-US')} views; ${millions} of ${rows.length} at a million or more; top ${sorted[sorted.length - 1].toLocaleString('en-US')}`);
    console.log(`  → ${ok ? 'QUALIFIES for a film' : 'does NOT qualify (median under 1,000,000 and fewer than three at a million): rephrase once, else drop it'}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('/yt.mjs')) {
  const [cmd, ...args] = process.argv.slice(2);
  try {
    if (cmd === 'auth') await auth();
    else if (cmd === 'whoami') await whoami();
    else if (cmd === 'upload') await upload(args.find((a) => !a.startsWith('--')) ?? die('usage: yt.mjs upload <publish.json> [--dry-run] [--schedule=auto]'), args.includes('--dry-run'), args.includes('--schedule=auto'));
    else if (cmd === 'upcoming') await listUpcoming();
    else if (cmd === 'next-free') console.log(await nextFreeYouTubeSlot());
    else if (cmd === 'reschedule') await reschedule(args[0], args[1]);
    else if (cmd === 'status') await status(args);
    else if (cmd === 'demand') await demand(args);
    else console.log('usage: yt.mjs auth | whoami | upcoming | next-free | reschedule <id> <time> | upload <publish.json> [--dry-run] [--schedule=auto] | status <videoId>... | demand "<question>"...');
  } catch (e) {
    die(e.message);
  }
}
