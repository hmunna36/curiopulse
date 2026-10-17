#!/usr/bin/env node
// Facebook Page Reels for CurioPulse (the Page "CurioPulse" on the user's new account), through the Pages API of the Meta app
// "CurioPulse Page Publisher" (App ID 2668049813624414). Written 16 Oct 2026; NOT yet proven end to end: the first
// `reel` is the test. No dependencies; Node 22+.
//
//   node fb.mjs token --system         store the Page token from a SYSTEM-USER token (one hidden prompt, no app secret): the way for a
//                                       Page owned by a business portfolio (16 Oct 2026: /me/accounts is empty for such a Page).
//   node fb.mjs token                  store a Page token. You paste a user token from the Graph API Explorer (hidden input)
//                                       and then the app secret (hidden input); the user token is exchanged for a long-lived
//                                       one, the Page token is taken from /me/accounts (never expires when it comes from a
//                                       long-lived user token) and ONLY the Page token is saved (chmod 600). The app secret
//                                       and the user token are never written anywhere.
//   node fb.mjs whoami                 read-only: the Page's name, id and followers
//   node fb.mjs reel <publish.json> [--at ISO] [--dry-run]
//                                       upload the Reel (Instagram-spec copy is not needed: the Short's MP4 from the public
//                                       repo) and SCHEDULE it (Facebook schedules natively: 10 minutes to 75 days ahead).
//                                       --at defaults to publish.json's instagram.publishAt.
//   node fb.mjs status <video_id>      read-only: the upload/processing/scheduling status of a Reel
//
// Files: ~/.config/cp/facebook.json (the Page token; never printed or committed).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline';

const V = 'v25.0';
const G = `https://graph.facebook.com/${V}`;
const APP_ID = '2668049813624414';
const PAGE_ID = '1390449614145195'; // the Page "CurioPulse" (Business Suite asset id; read fine in the Explorer 16 Oct 2026)
const REPO_RAW = 'https://raw.githubusercontent.com/hmunna36/curiopulse/main';
const CFG = path.join(os.homedir(), '.config/cp/facebook.json');
const IST_MS = 5.5 * 3600 * 1000;
const die = (m) => { console.error(`fb: ${m}`); process.exit(1); };
const log = (m) => console.log(m);
const cfg = () => { try { return JSON.parse(fs.readFileSync(CFG, 'utf8')); } catch { die(`no Page token yet: run \`node ${process.argv[1]} token\``); } };

async function graph(method, url, params = {}, token) {
  const u = new URL(url.startsWith('http') ? url : `${G}/${url}`);
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) (method === 'GET' ? u.searchParams : body).set(k, String(v));
  if (token) (method === 'GET' ? u.searchParams : body).set('access_token', token);
  const r = await fetch(u, {method, body: method === 'GET' ? undefined : body});
  const text = await r.text();
  let j = {};
  try { j = JSON.parse(text); } catch {}
  if (!r.ok) {
    const e = j.error ?? {};
    throw new Error(`${method} ${u.pathname} → ${r.status} ${e.message ?? text.slice(0, 200)}${e.code ? ` (code ${e.code}${e.error_subcode ? `/${e.error_subcode}` : ''})` : ''}`);
  }
  return j;
}
async function hidden(prompt) {
  if (!process.stdin.isTTY) return fs.readFileSync(0, 'utf8').trim();
  process.stdout.write(prompt);
  const rl = readline.createInterface({input: process.stdin, output: process.stdout, terminal: true});
  rl._writeToOutput = () => {};
  const v = await new Promise((r) => rl.question('', r));
  rl.close();
  process.stdout.write('\n');
  return v.trim();
}

async function setSystemToken() {
  // a system-user token (Business Settings > System users > Generate token): no app secret, no exchange; the Page token is read by id
  const tok = await hidden('Paste the system-user token (input hidden), then press Return: ');
  if (tok.length < 40 || /\s/.test(tok)) die('that does not look like an access token');
  const page = await graph('GET', PAGE_ID, {fields: 'id,name,access_token'}, tok);
  if (!page.access_token) die(`the token reads the Page "${page.name}" but returned no Page access token: check that the system user has the Page (Content) and the app, and that pages_manage_posts is ticked`);
  fs.mkdirSync(path.dirname(CFG), {recursive: true});
  fs.writeFileSync(CFG, JSON.stringify({page_id: page.id, page_name: page.name, page_token: page.access_token, tasks: page.tasks, via: 'system-user', obtained: new Date().toISOString()}, null, 2) + '\n', {mode: 0o600});
  log(`saved the Page token for "${page.name}" (page id ${page.id}, tasks: ${(page.tasks ?? []).join(', ') || '?'}) to ${CFG}`);
}
async function setToken() {
  const short = await hidden('Paste the user token from the Graph API Explorer (input hidden), then press Return: ');
  if (short.length < 40 || /\s/.test(short)) die('that does not look like an access token');
  const secret = await hidden('Paste the app secret of "CurioPulse Page Publisher" (App settings > Basic > Show; input hidden), then press Return: ');
  if (secret.length < 20 || /\s/.test(secret)) die('that does not look like an app secret');
  const ex = await graph('GET', 'oauth/access_token', {grant_type: 'fb_exchange_token', client_id: APP_ID, client_secret: secret, fb_exchange_token: short});
  const pages = await graph('GET', 'me/accounts', {fields: 'id,name,access_token,tasks', limit: 50}, ex.access_token);
  let list = pages.data ?? [];
  if (!list.length) {
    // a Page owned by a business portfolio does not show in /me/accounts: ask for it by id (16 Oct 2026: the Explorer read it fine)
    const direct = await graph('GET', PAGE_ID, {fields: 'id,name,access_token'}, ex.access_token).catch(() => null);
    if (direct?.access_token) list = [direct];
  }
  if (!list.length) die('the token reaches no Page: in the Graph API Explorer tick pages_show_list, pages_manage_posts and pages_read_engagement and choose the CurioPulse Page when Facebook asks which Pages to allow');
  const page = list.find((p) => /curiopulse/i.test(p.name)) ?? (list.length === 1 ? list[0] : null);
  if (!page) die(`several Pages and none is named CurioPulse: ${list.map((p) => p.name).join(', ')}`);
  fs.mkdirSync(path.dirname(CFG), {recursive: true});
  fs.writeFileSync(CFG, JSON.stringify({page_id: page.id, page_name: page.name, page_token: page.access_token, tasks: page.tasks, obtained: new Date().toISOString()}, null, 2) + '\n', {mode: 0o600});
  log(`saved the Page token for "${page.name}" (page id ${page.id}, tasks: ${(page.tasks ?? []).join(', ') || '?'}) to ${CFG}`);
}
async function whoami() {
  const c = cfg();
  const p = await graph('GET', c.page_id, {fields: 'name,fan_count,followers_count,link'}, c.page_token);
  log(`page: ${p.name} (id ${c.page_id}), ${p.followers_count ?? p.fan_count ?? '?'} followers, ${p.link ?? ''}`);
  const tk = await graph('GET', 'debug_token', {input_token: c.page_token}, c.page_token).catch(() => null);
  const d = tk?.data;
  if (d) log(`token: ${d.expires_at ? `expires ${new Date(d.expires_at * 1000).toISOString().slice(0, 10)}` : 'does not expire'}; scopes: ${(d.scopes ?? []).join(', ')}`);
}
async function reel(file, args) {
  const c = cfg();
  const spec = JSON.parse(fs.readFileSync(file, 'utf8'));
  const base = path.dirname(path.resolve(file));
  const mp4 = path.resolve(base, spec.file);
  const rel = path.relative(path.resolve(base, '../..'), mp4).split(path.sep).join('/');
  const url = `${REPO_RAW}/${rel}`;
  const atArg = args.includes('--at') ? args[args.indexOf('--at') + 1] : spec.instagram?.publishAt;
  const t = Date.parse(atArg ?? '');
  if (Number.isNaN(t)) die('give a release time with --at (ISO) or instagram.publishAt in publish.json');
  if (t < Date.now() + 11 * 60 * 1000) die('Facebook schedules 10 minutes to 75 days ahead');
  if (t > Date.now() + 74 * 86400 * 1000) die('Facebook schedules at most 75 days ahead');
  const caption = (spec.instagram?.caption ?? '').replace(/Follow @curio_pulse_tv/g, 'Follow CurioPulse');
  const dry = args.includes('--dry-run');
  if (spec.facebook?.videoId && !args.includes('--force')) die(`already on the Page (video ${spec.facebook.videoId}, ${spec.facebook.publishAt}): use \`status ${spec.facebook.videoId}\`, or --force to upload again`);
  log(`${dry ? 'would schedule' : 'scheduling'} ${spec.slug ?? rel} on the Page "${c.page_name}" for ${new Date(t + IST_MS).toISOString().slice(0, 16).replace('T', ' ')} IST from ${url}`);
  if (dry) return;
  const head = await fetch(url, {method: 'HEAD'});
  if (!head.ok) die(`${url} is not reachable (${head.status}): push the Short to GitHub first`);
  const start = await graph('POST', `${c.page_id}/video_reels`, {upload_phase: 'start'}, c.page_token);
  if (!start.video_id || !start.upload_url) die(`no upload slot in the reply: ${JSON.stringify(start).slice(0, 200)}`);
  const up = await fetch(start.upload_url, {method: 'POST', headers: {Authorization: `OAuth ${c.page_token}`, file_url: url}});
  const uj = await up.json().catch(() => ({}));
  if (!up.ok || uj.success === false) die(`upload failed: ${up.status} ${JSON.stringify(uj).slice(0, 200)}`);
  log(`uploaded (video ${start.video_id}); finishing`);
  const fin = await graph('POST', `${c.page_id}/video_reels`, {upload_phase: 'finish', video_id: start.video_id, video_state: 'SCHEDULED', scheduled_publish_time: Math.floor(t / 1000), description: caption}, c.page_token);
  log(`finish: ${JSON.stringify(fin).slice(0, 200)}`);
  spec.facebook = {videoId: start.video_id, publishAt: new Date(t + IST_MS).toISOString().slice(0, 19) + '+05:30', via: 'api', scheduledAt: new Date().toISOString()};
  fs.writeFileSync(file, JSON.stringify(spec, null, 2) + '\n');
  log(`check it with: node ${process.argv[1]} status ${start.video_id}`);
}
async function status(id) {
  const c = cfg();
  const j = await graph('GET', id, {fields: 'status,scheduled_publish_time,description,permalink_url'}, c.page_token);
  log(JSON.stringify(j, null, 1).slice(0, 800));
}

const [cmd, ...args] = process.argv.slice(2);
if (cmd === 'token' && args.includes('--system')) await setSystemToken();
else if (cmd === 'token') await setToken();
else if (cmd === 'whoami') await whoami();
else if (cmd === 'reel' && args[0]) await reel(args[0], args);
else if (cmd === 'status' && args[0]) await status(args[0]);
else console.log('usage: fb.mjs token [--system] | whoami | reel <publish.json> [--at ISO] [--dry-run] [--force] | status <video_id>');
