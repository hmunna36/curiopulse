// Earth Has More TREES Than Our Galaxy Has STARS 🌲 Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
// THE CURIOUS KIND (story.md §6): the hero goes there. He sits on a bald hilltop at night clicking a tally counter at the Milky
// Way while the forest stands all round him; a scoreboard rises out of the forest (TREES 7 : STARS 1) and the trees do the
// wave; every star falls onto a treetop (the last onto his head, while the little sapling beside him gets none); the camera
// cranes up until the lit trees are a small island in a dark sea of them; from orbit a satellite squints (400 BILLION? a TIE?);
// he counts trunks in a roped plot by day; Earth gets its real number, 3 TRILLION, and greens over to almost double; and back
// on the hill the sapling taps his shoulder, he looks round... and goes straight back to counting stars.
'use strict';

const cu = () => TLd.cues;
const r2 = (t, a, b, e = E.inOutCubic) => ramp(t, a, b, e);
const bumpAt = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);
const pulse = (t, a, b) => Math.sin(Math.PI * clamp(inv(a, b, t)));

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the hill at night: a crescent moon high on the left is the key, the Milky Way's cool light the rim from the right
const L_HILL = { ...LIGHTS.night, key: [-0.42, -0.72, 0.56], keyTint: [0.92, 0.98, 1.1], rimFrom: [0.85, -0.4], rim: [0.62, 0.78, 1.0], rimAmt: 1.15,
  pool: 0.42, halo: 0.1, haloColor: [0.6, 0.75, 1.0] };
// the stars on the trees: a warm rim
const L_GOLD = { ...L_HILL, rim: [1.0, 0.86, 0.5], rimAmt: 1.3, halo: 0.14, haloColor: [1.0, 0.85, 0.5] };
const L_SPACE = { ...LIGHTS.diagram, key: [-0.6, -0.5, 0.62], rim: [0.55, 0.8, 1.0], rimAmt: 0.8 };
const L_PLOT = { ...LIGHTS.day, key: [0.45, -0.7, 0.55], rim: [1.0, 0.95, 0.8], rimAmt: 0.9, beams: 0.35, beamColor: [1.0, 0.96, 0.82] };
setLights({ hook: L_HILL, score: L_HILL, give: L_GOLD, left: L_GOLD, tie: L_SPACE, ground: L_PLOT, three: L_SPACE, button: L_HILL, cover: L_GOLD });

function initScenes2() { initTvWorld(); initTvSpace(); initTvFalls(); }

// ---------------------------------------------------------------- the hero
const HF = {
  count: Object.assign({}, FACES.calm, { lookX: 0.55, lookY: -1, browY: 0.7, browTilt: -0.1, mouth: 'o', mouthOpen: 0.32, eyeOpen: 1.08 }),
  side: Object.assign({}, FACES.calm, { lookX: -1, lookY: 0.25, browY: 0.2, browTilt: -0.4, mouth: 'flat', mouthOpen: 0.12, eyeOpen: 0.86 }),
  flat: Object.assign({}, FACES.calm, { lookX: 0, lookY: 0, browY: -0.1, browTilt: -0.5, mouth: 'flat', mouthOpen: 0.05, eyeOpen: 0.78 }),
  board: Object.assign({}, FACES.startled, { lookX: -0.5, lookY: -1, mouth: 'o', mouthOpen: 0.7 }),
  up: Object.assign({}, FACES.startled, { lookX: 0.1, lookY: -1, mouth: 'o', mouthOpen: 0.55 }),
  cross: Object.assign({}, FACES.confused, { lookX: 0, lookY: -1, cross: 0.85, mouth: 'wavy', mouthOpen: 0.3, browY: 1.0 }),
  sheep: Object.assign({}, FACES.grin, { lookX: -1, lookY: 0.1, browY: 0.9, browTilt: 0.9, mouthOpen: 0.45 }),
  glance: Object.assign({}, FACES.calm, { lookX: -1, lookY: 0.15, browY: 0.5, browTilt: -0.2, mouth: 'flat', mouthOpen: 0.08, eyeOpen: 0.95 }),
  focus: Object.assign({}, FACES.calm, { lookX: 0.8, lookY: -0.15, browY: -0.3, browTilt: -0.8, mouth: 'flat', mouthOpen: 0.1, eyeOpen: 0.9 }),
  slap: Object.assign({}, FACES.grin, { lookX: 0.9, lookY: 0, browY: 0.8, mouthOpen: 0.7 }),
};
// A: {x, z (metres), dy, pose, face, headRot, headDX, headDY, armL / armR: {e, w} rig-local points, handL / handR, pal, post(lc, r, st)}
function heroDraw(C, t, A) {
  const cam2 = tvHeroCam(C, A.x, A.z, A.dy || 0);
  if (!cam2) return null;
  const st = { x: 0, y: 0, s: 1, face: A.face || FACES.calm, headRot: A.headRot || 0, headDX: A.headDX || 0, headDY: A.headDY || 0, blink: A.blink || 0 };
  let pose = JSON.parse(JSON.stringify(A.pose || POSES.sit));
  if (A.armL) pose = armAt(pose, 'L', A.armL.e, A.armL.w);
  if (A.armR) pose = armAt(pose, 'R', A.armR.e, A.armR.w);
  if (A.handL) pose.handL = A.handL;
  if (A.handR) pose.handR = A.handR;
  st.pose = pose;
  const r = charLayer(cam2, st, t, { pal: A.pal || PAL, post: (lc, rr, st2) => { if (A.post) A.post(lc, rr, st2); } });
  // cut him out of the glow layer: no star or moon shines through him
  gctx.save(); gctx.setTransform(1, 0, 0, 1, 0, 0); gctx.globalCompositeOperation = 'destination-out';
  gctx.drawImage(layerC, 0, 0, W / 2, H / 2); gctx.restore();
  if (A.after) { screenSpace(); A.after(r, cam2); }
  return { r, cam2 };
}
// the star on his head: bigger than the trees' and outlined, so it reads as HIS
function headStar(x, y, rr, k, t) {
  if (k <= 0.01) return;
  tvTopper(x, y, rr, k, t, 3);
  paint(() => { tvStarPath(ctx, x, y, rr * k, 0.06 * Math.sin(t * 2 + 3)); ctx.lineWidth = Math.max(3, rr * 0.09); ctx.lineJoin = 'round'; ctx.strokeStyle = '#7A4A10'; ctx.stroke(); });
}
// a rig point -> screen
function rigS(cam2, p) { return [W / 2 + (p[0] - cam2.x) * cam2.zoom, H / 2 + (p[1] - cam2.y) * cam2.zoom]; }
// the head's top in rig units (his hair)
function headTop(r, st) { return [r.head[0] + (st.headDX || 0), r.head[1] + (st.headDY || 0) - 92]; }

// the counter's number: it ticks on every click
function countN(t, list) { let n = 0; for (const c of list) if (t >= c) n++; return n; }
function pressOf(t, list) { let p = 0; for (const c of list) p = Math.max(p, pulse(t, c, c + 0.16)); return p; }
const ARM_COUNT = { e: [172, -206], w: [118, -318] };       // his right hand up by his face, the counter toward the sky
const ARM_KNEE = { e: [132, -150], w: [118, -70] };         // on his knee
const ARM_LAP = { e: [-120, -150], w: [-70, -80] };         // the left one in his lap
// draws the counter at his right wrist (rig units) and his thumb on its button
function counterAt(lc, r, press, n, rot = -0.1) {
  const wr = r.wrR;
  tvClicker(lc, wr[0] + 8, wr[1] - 42, 0.92, press, n.toLocaleString('en-US'), rot);
  lc.fillStyle = PAL.skin; rrect(lc, wr[0] - 1, wr[1] - 98 + 7 * press, 16, 30, 8); lc.fill();
}
const N0 = 41203;   // the number on frame 0 (the button counts back up to it, for the loop)

// ================================================================ the hook (one continuous shot) and the loop's last frames
// tt = seconds since frame 1; valid at negative tt (the button's last frames are frame 0's picture)
const HOOK_C0 = [0.17, 9.9, -1.3, -0.07];
function hookC(tt) {
  const c = cu();
  if (tt <= 0) return tvCam({ x: HOOK_C0[0] - 0.03 * tt, y: HOOK_C0[1], z: HOOK_C0[2] + 0.05 * tt, pitch: HOOK_C0[3] });
  return tvKeys(tt, [[0, ...HOOK_C0], [c.trees1 - 0.12, 0.19, 9.9, -1.36, -0.07], [c.trees1_end + 0.35, 0.3, 9.78, -2.9, -0.03],
    [c.galaxy - 0.05, 0.3, 9.8, -3.0, -0.05], [c.stars1 + 0.04, 0.3, 10.0, -3.2, -0.52], [c.stars1_end + 0.22, 0.3, 10.0, -3.2, -0.54],
    [c.close - 0.12, 0.42, 9.78, -3.3, -0.03], [c.close_end + 2, 0.46, 9.78, -3.48, -0.025]]);
}
function hookA(tt, t) {
  const c = cu();
  const A = { x: 0, z: 0, pose: POSES.sit, armR: ARM_COUNT, armL: ARM_LAP, handR: 'thumb', headRot: 0.04 };
  let look = 0;
  if (tt >= 0) look = r2(tt, c.and1 - 0.05, c.and1 + 0.3, E.outBack);
  A.face = lerpFace(HF.count, HF.side, look);
  A.headRot = 0.04 - 0.1 * look;
  const clicks = c.click;
  A.post = (lc, r) => counterAt(lc, r, tt >= 0 ? pressOf(tt, clicks) : 0, N0 + (tt >= 0 ? countN(tt, clicks) - 1 : 0));
  return A;
}
function hookDraw(tt, t, o = {}) {
  const C = hookC(tt);
  const c = cu();
  const flare = tt >= 0 ? pulse(tt, c.shimmer - 0.05, c.shimmer + 0.9) : 0;
  tvWorld(C, t, { flare, at: [saplingAt(t, o.sap || {})], hero: (CC) => heroDraw(CC, t, o.A || hookA(tt, t)), after: o.after });
  return C;
}

// ---------------------------------------------------------------- the sapling beside him (it never gets a star)
const SAP = { x: -1.06, z: 0.95, h: 1.9 };
function saplingAt(t, o = {}) {
  return { z: SAP.z, fn: (C) => {
    const b = tvProj(C, SAP.x, tvH(SAP.x, SAP.z), SAP.z);
    if (!b) return;
    screenSpace();
    actor(() => tvSapling(b[0], b[1], SAP.h * b[2], t, o.droop || 0, o.look === undefined ? 0.6 : o.look));
  } };
}

// ================================================================ the shots
SC.hook = (lt, t, shot) => {
  hookDraw(t, t);
  return { glow: 0.9 };
};

// ---------------------------------------------------------------- the score: TREES 7 : STARS 1, and the wave
const BOARD = { x: 6, z: 150, w: 74 };
function boardDraw(C, t, rise, d) {
  const gy = tvH(BOARD.x, BOARD.z);
  const base = tvProj(C, BOARD.x, gy - 46 + 60 * rise, BOARD.z);
  if (!base) return;
  const s = BOARD.w * base[2] / 540;
  screenSpace();
  tvScoreboard(base[0], base[1], s, rise, t, d);
}
SC.score = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const C = tvKeys(t, [[shot.start, 1.4, 9.75, -5.3, -0.11], [shot.end, 1.2, 9.72, -4.7, -0.115]], E.inOutSine);
  const rise = r2(t, c.board, c.board + 0.55, E.outBack);
  const d = { a: '7', b: '1', fa: r2(t, c.flip7, c.flip7 + 0.3, E.inOutSine), fb: r2(t, c.flip1, c.flip1 + 0.3, E.inOutSine) };
  // the wave: left to right across the forest, then a second ripple on "one"
  const wave = (tr, b) => {
    const ph = clamp((tr.x + 160) / 320), hp = tr.h * b[2];
    return hp * 0.16 * (pulse(t, c.wave + ph * 0.9, c.wave + ph * 0.9 + 0.32) + 0.6 * pulse(t, c.flip1 + ph * 0.7, c.flip1 + ph * 0.7 + 0.28));
  };
  const drop = r2(t, c.drop, c.clunk, E.inQuad), bounce = bumpAt(t, c.clunk, 7) * Math.abs(Math.sin((t - c.clunk) * 18));
  const A = { x: 0, z: 0, pose: POSES.sit, armL: ARM_LAP, handR: t < c.drop ? 'thumb' : 'open' };
  const raise = r2(t, c.trees_win - 0.05, c.trees_win + 0.25, E.outBack);
  A.armR = t < c.drop ? ARM_COUNT : armMix(ARM_COUNT, ARM_KNEE, r2(t, c.drop, c.drop + 0.4));
  A.face = lerpFace(lerpFace(HF.side, HF.board, raise), HF.flat, r2(t, c.one_end + 0.05, c.one_end + 0.25));
  A.headRot = -0.06 * raise;
  A.post = (lc, r) => {
    if (t < c.drop) counterAt(lc, r, 0, N0 + c.click.length - 1);
    else {
      // the counter falls out of his hand into the grass
      const wr = ARM_COUNT.w, gx = 150, gy = -16;
      const x = lerp(wr[0] + 8, gx, drop), y = lerp(wr[1] - 42, gy, drop) - 30 * bounce;
      tvClicker(lc, x, y, 0.92, 0, (N0 + c.click.length - 1).toLocaleString('en-US'), -0.1 + 2.6 * drop);
    }
  };
  tvWorld(C, t, { hop: wave, at: [{ z: BOARD.z, fn: (CC) => boardDraw(CC, t, rise, d) }, saplingAt(t, { look: 0.2 })],
    hero: (CC) => heroDraw(CC, t, A) });
  return { glow: 0.95, push: { k: 1 + 0.012 * bumpAt(t, c.flip7, 6) + 0.012 * bumpAt(t, c.flip1, 6), cx: 540, cy: 760 } };
};

// ---------------------------------------------------------------- the give: every star onto a tree (the last onto his head)
let TV_FALLS = [], TV_GONE = [];
function initTvFalls() {
  // which trees get a star, and when: the patch's trees, far ones first, each from a bright star in the sky
  const rng = mulberry32(31), pt = TV_TREES.filter((tr) => tr.patch);
  TV_FALLS = pt.map((tr) => ({ tr, u: clamp(0.82 * (1 - tr.z / TVW.PATCH_Z) + 0.18 * rng()), star: Math.floor(rng() * TV_BRIGHT.length), arc: (rng() - 0.5) * 220 }));
}
function fallTimes(f) { const c = cu(); const t1 = c.pour + 0.25 + 2.35 * f.u; return [t1 - 0.5, t1]; }
function starOn(tr, t) {
  if (!tr.patch) return 0;
  const f = TV_FALLS.find((q) => q.tr === tr);
  if (!f) return 0;
  const [, t1] = fallTimes(f);
  return t < t1 ? 0 : E.outBack(clamp((t - t1) / 0.18));
}
// the sky stars that have left (by index): when the first fall from each one begins
function goneFn(t) {
  if (!TV_GONE.length) {
    TV_GONE = TV_BRIGHT.map(() => 1e9);
    for (const f of TV_FALLS) TV_GONE[f.star] = Math.min(TV_GONE[f.star], fallTimes(f)[0]);
    // every bright star leaves, even one no tree took (they go in the same rain)
    const c = cu();
    TV_GONE = TV_GONE.map((g, i) => (g < 1e8 ? g : c.pour + 0.2 + 2.2 * hash(i * 7.7)));
  }
  return (i) => (t >= TV_GONE[i] ? 1 : 0);
}
function giveC(t) {
  const c = cu();
  return tvKeys(t, [[c.give - 0.06, 0.28, 9.95, -5.6, -0.11], [c.tree_end - 0.1, 0.2, 9.9, -4.3, -0.1], [c.bonk + 0.22, 0.12, 9.82, -3.0, -0.08], [c.and2 + 0.2, 0.1, 9.8, -2.9, -0.08]], E.inOutSine);
}
function starOnHead(t) { const c = cu(); return t >= c.bonk ? 1 : 0; }
SC.give = (lt, t, shot) => {
  const c = cu();
  const C = giveC(t);
  const tips = new Map();
  const pour = clamp((t - c.pour) / 2.7);
  const A = { x: 0, z: 0, pose: POSES.sit, armL: ARM_LAP, armR: ARM_KNEE, handR: 'open' };
  const hit = t >= c.bonk;
  A.face = hit ? lerpFace(HF.up, HF.cross, r2(t, c.bonk, c.bonk + 0.12)) : HF.up;
  A.headDY = hit ? 10 * bumpAt(t, c.bonk, 10) : 0;
  let headS = null;
  A.after = (r, cam2) => {
    // the star that lands on his head
    const top = rigS(cam2, headTop(r, { headDY: A.headDY })), rr = 50 * cam2.zoom;
    if (hit) { headStar(top[0] + 6 * cam2.zoom, top[1] - rr * 0.05, rr, E.outBack(clamp((t - c.bonk) / 0.14)), t); if (t < c.bonk + 0.5) shockLines(top[0], top[1] - rr * 0.5, rr * 2.2, inv(c.bonk, c.bonk + 0.35, t), 9, '#FFE38A'); }
    headS = [top, rr];
  };
  tvWorld(C, t, {
    gone: goneFn(t),
    skyOver: () => {           // the sky empties as the stars leave
      screenSpace();
      const hy = tvHorizonY(C);
      ctx.fillStyle = `rgba(2,3,10,${0.78 * smooth(pour)})`; ctx.fillRect(0, 0, W, Math.max(0, hy + 40));
    },
    star: (tr) => starOn(tr, t),
    afterTree: (tr, b, tip) => { if (tr.patch && tip) tips.set(tr, [tip[0], tip[1] - tr.h * b[2] * 0.02, tr.h * b[2]]); },
    at: [saplingAt(t, { droop: r2(t, c.bonk + 0.1, c.bonk + 0.5), look: 0.9 })],
    hero: (CC) => heroDraw(CC, t, A),
  });
  // the stars in flight (in front of everything)
  screenSpace();
  for (const f of TV_FALLS) {
    const [t0, t1] = fallTimes(f);
    if (t < t0 || t >= t1) continue;
    const tip = tips.get(f.tr);
    if (!tip) continue;
    const s0 = tvBrightXY(C, TV_BRIGHT[f.star]), u = E.inQuad(inv(t0, t1, t));
    const at = (q) => [lerp(s0[0], tip[0], q) + f.arc * Math.sin(Math.PI * q) * 0.5, lerp(s0[1], tip[1], q)];
    const p = at(u), pb = at(Math.max(0, u - 0.18));
    const rr = Math.min(16, Math.max(1.5, tip[2] * 0.085)) * (1.4 - 0.4 * u);
    ctx.strokeStyle = 'rgba(255,226,140,0.45)'; ctx.lineWidth = Math.max(1.5, rr * 0.5); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(pb[0], pb[1]); ctx.lineTo(p[0], p[1]); ctx.stroke();
    softDot(gctx, p[0], p[1], rr * 2.4, '#FFD86A', 0.3);
    circle(ctx, p[0], p[1], rr * 0.7, '#FFF1B8');
  }
  // the last one, onto his head
  if (headS && t >= c.bonk - 0.55 && t < c.bonk) {
    const u = E.inQuad(inv(c.bonk - 0.55, c.bonk, t)), s0 = [headS[0][0] + 160, -60];
    const p = [lerp(s0[0], headS[0][0], u), lerp(s0[1], headS[0][1] - headS[1] * 0.55, u)];
    softDot(gctx, p[0], p[1], 60, '#FFD86A', 0.9);
    paint(() => { tvStarPath(ctx, p[0], p[1], headS[1] * 0.8, u * 6); ctx.fillStyle = '#FFD447'; ctx.fill(); });
  }
  return { glow: 0.8, push: { k: 1 + 0.02 * bumpAt(t, c.bonk, 8), cx: 540, cy: 1100 } };
};

// ---------------------------------------------------------------- the left: the lit trees are an island in a dark sea
function leftC(t) {
  const c = cu();
  return tvKeys(t, [[c.and2 - 0.06, -0.32, 9.85, -2.05, -0.02], [c.crane, -0.3, 9.9, -2.25, -0.01], [c.crane + 2.9, 0, 300, -272, 0.65],
    [c.funny, 0, 318, -290, 0.66]], E.inOutCubic);
}
SC.left = (lt, t, shot) => {
  const c = cu();
  const C = leftC(t);
  const A = { x: 0, z: 0, pose: POSES.sit, armL: ARM_LAP, armR: ARM_KNEE, handR: 'open' };
  const notice = r2(t, c.and2 + 0.15, c.and2 + 0.45, E.outBack);
  A.face = lerpFace(HF.cross, HF.sheep, notice);
  A.headRot = -0.12 * notice;
  A.after = (r, cam2) => { const top = rigS(cam2, headTop(r, {})), rr = 50 * cam2.zoom; headStar(top[0] + 6 * cam2.zoom, top[1] - rr * 0.05, rr, 1, t); };
  const glowK = r2(t, c.crane + 0.8, c.crane + 2.4);
  tvWorld(C, t, {
    gone: () => 1,
    skyOver: () => { screenSpace(); const hy = tvHorizonY(C); ctx.fillStyle = 'rgba(2,3,10,0.78)'; ctx.fillRect(0, 0, W, Math.max(0, hy + 40)); },
    star: (tr) => (tr.patch ? 1 : 0),
    at: [saplingAt(t, { droop: 1, look: 1 })],
    hero: (CC) => heroDraw(CC, t, A),
    after: (CC) => {
      // the island's glow, so it reads from up here
      const p = tvProj(CC, 0, 0, 70);
      if (p && glowK > 0) { softDot(gctx, p[0], p[1], 300, '#FFD86A', 0.14 * glowK); }
    },
  });
  // 2 TRILLION+ / STILL WAITING over the dark forest
  const k = r2(t, c.tag2, c.tag2 + 0.3, E.outBack);
  if (k > 0.01) {
    screenSpace();
    bigWord('2 TRILLION+', 540, 560, 118, '#7CFFB2', k, -0.03);
    bigWord('STILL WAITING', 540, 690, 70, '#E8EEF8', r2(t, c.still, c.still + 0.25, E.outBack), -0.03);
  }
  return { glow: 0.8, zblur: 0.05 * pulse(t, c.crane, c.crane + 1.2) };
};

// ---------------------------------------------------------------- the tie: from orbit, a satellite squints
SC.tie = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const pan = r2(t, c.about - 0.35, c.about + 0.3);
  tvsSpaceBg(t, 0, 300 * pan);
  screenSpace();
  // Earth's limb at the bottom (the forest-green land on it)
  tvsEarth(540, 2380 - 120 * pan, 1420, t, { rot: 0.1 + 0.01 * lt });
  const sq = r2(t, c.squint, c.squint + 0.3, E.outBack) * (1 - 0.6 * r2(t, c.scale, c.scale + 0.3));
  const sx = 600 - 30 * lt, sy = 560 - 900 * pan;
  tvsSatellite(sx, sy, 0.86, t, { squint: sq, beam: r2(t, c.squint, c.squint + 0.25) * (1 - pan), rot: -0.08 + 0.02 * Math.sin(t * 0.8), look: 0.2 * Math.sin(t * 2) });
  // its old count
  const ck = r2(t, c.readout, c.readout + 0.3, E.outBack) * (1 - r2(t, c.about - 0.3, c.about));
  tvsCard(540, 940 - 300 * pan, ck, '400 BILLION', 'TREES (THE OLD GUESS)', '#7CFFB2', -0.03);
  // the balance: level, a TIE
  const bk = r2(t, c.scale, c.scale + 0.35, E.outBack);
  const tilt = 0.22 * Math.cos((t - c.scale) * 9) * Math.exp(-Math.max(0, t - c.scale) * 3.2) * (t > c.scale ? 1 : 0);
  tvsBalance(540, 700, 1.0, tilt, bk, t, { labels: [['400 BILLION', 'TREES (OLD GUESS)'], ['100-400 BILLION', 'STARS']] });
  const tk = r2(t, c.level, c.level + 0.2, E.outBack);
  if (tk > 0.01) stamp('TIE?', 540, 1185, tk, '#FFD447', -0.1, 150);
  return { glow: 0.9, push: { k: 1 + 0.03 * lt / D, cx: 540, cy: 760 } };
};

// ---------------------------------------------------------------- the ground: by day, he counts every trunk in a roped plot
const PLOT_TREES = [[0.78, -2.05, 17, 0.42], [-3.0, 0.6, 19, 0.46], [3.5, 2.4, 18, 0.44], [-1.2, 3.9, 20, 0.46], [1.8, 5.6, 18, 0.45],
  [-4.4, 4.6, 17, 0.44]].map(([dx, dz, h, tk], i) => ({ x: TV_PLOT.x + dx, z: TV_PLOT.z + dz, y: tvH(TV_PLOT.x + dx, TV_PLOT.z + dz), h, w: 0.38,
  seed: 50 + i * 7, tone: 0.4, trunkK: tk, plot: i }));
const HERO_PLOT = { x: TV_PLOT.x, z: TV_PLOT.z - 2.4 };

function groundC(t) {
  const c = cu();
  const gx = HERO_PLOT.x, gz = HERO_PLOT.z, gy = tvH(gx, gz);
  return tvKeys(t, [[c.dive, gx + 0.62, gy + 1.08, gz - 3.3, -0.05], [c.ground, gx + 0.5, gy + 1.02, gz - 2.85, -0.05], [c.pull, gx + 0.46, gy + 1.0, gz - 2.7, -0.045]], E.inOutSine);
}
SC.ground = (lt, t, shot) => {
  const c = cu();
  const C = groundC(t);
  const counts = c.counts;
  const n = countN(t, counts);
  const slapK = r2(t, c.slap - 0.12, c.slap + 0.02, E.outCubic) * (1 - r2(t, c.slap + 0.35, c.slap + 0.6));
  let handS = null;
  const A = { x: HERO_PLOT.x, z: HERO_PLOT.z, pose: POSES.stand, handR: 'thumb', handL: 'open', after: (r, cam2) => { handS = rigS(cam2, r.wrR); },
    armL: { e: [-118, -340], w: [-60, -300] }, armR: armMix({ e: [110, -330], w: [70, -300] }, { e: [190, -400], w: [262, -400] }, slapK) };
  if (slapK > 0.5) A.handR = 'spread';
  const look = Math.sin(lt * 2.4) * 0.5;
  A.face = slapK > 0.3 ? HF.slap : lerpFace(HF.focus, Object.assign({}, HF.focus, { lookX: -0.6 }), 0.5 + 0.5 * look);
  A.headRot = 0.05 * look;
  A.post = (lc, r) => {
    // the clipboard in his left hand, tally marks for every trunk
    const wl = r.wrL;
    lc.save(); lc.translate(wl[0] + 24, wl[1] - 30); lc.rotate(-0.18);
    lc.fillStyle = '#8A5A34'; rrect(lc, -54, -70, 108, 140, 8); lc.fill();
    lc.fillStyle = '#F4F1E6'; lc.fillRect(-44, -54, 88, 116);
    lc.fillStyle = '#B9BEC6'; rrect(lc, -20, -78, 40, 16, 4); lc.fill();
    paint(() => {
      lc.strokeStyle = '#26324A'; lc.lineWidth = 4; lc.lineCap = 'round';
      for (let i = 0; i < Math.min(4, n + 3); i++) { lc.beginPath(); lc.moveTo(-30 + i * 12, -36); lc.lineTo(-30 + i * 12, -8); lc.stroke(); }
      if (n + 3 >= 5) { lc.beginPath(); lc.moveTo(-36, -12); lc.lineTo(16, -32); lc.stroke(); }
      for (let i = 0; i < Math.max(0, n - 2); i++) { lc.beginPath(); lc.moveTo(-30 + i * 12, 10); lc.lineTo(-30 + i * 12, 38); lc.stroke(); }
    });
    lc.restore();
    if (slapK < 0.5) counterAt(lc, r, pressOf(t, counts), 7 + n, -0.25);
  };
  tvWorld(C, t, {
    day: true, pal: TV_DAY, plotTrees: PLOT_TREES,
    trees: (tr) => !(tr.plot === undefined && tr.z < HERO_PLOT.z + 2 && Math.abs(tr.x - HERO_PLOT.x) < 20),
    at: [{ z: HERO_PLOT.z - 0.7, fn: (CC) => tvPlot(CC, t, TV_PLOT.x, HERO_PLOT.z + 3.6, 4.2) }],
    afterTree: (tr, b) => {
      // a tick pops over each trunk he counts
      if (tr.plot === undefined) return;
      const i = [1, 3, 2, 5, 4][tr.plot % 5], tc = counts[Math.min(counts.length - 1, i - 1)];
      const k = t >= tc ? E.outBack(clamp((t - tc) / 0.2)) : 0;
      if (k > 0.01 && tr.plot > 0) {
        const p = tvProj(C, tr.x, tr.y + 1.5, tr.z);
        if (p) { paint(() => { circle(ctx, p[0], p[1], 34 * k, '#2BD47A'); ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 8 * k; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(p[0] - 14 * k, p[1]); ctx.lineTo(p[0] - 3 * k, p[1] + 11 * k); ctx.lineTo(p[0] + 16 * k, p[1] - 12 * k); ctx.stroke(); }); }
      }
    },
    hero: (CC) => heroDraw(CC, t, A),
  });
  screenSpace();
  sunRays(820, 180, 0.7, { reach: 0.9 });
  if (handS && t >= c.slap && t < c.slap + 0.5) shockLines(handS[0] + 40, handS[1], 120, inv(c.slap, c.slap + 0.3, t), 8, '#FFFFFF');
  const pk = r2(t, c.plots, c.plots + 0.25, E.outBack);
  if (pk > 0.01) tvsCard(540, 560, pk, '430,000', 'FOREST PLOTS, COUNTED', '#FF9A3C', -0.03, 0.9);
  const dive = 1 - r2(t, c.dive, c.dive + 0.35, E.outCubic);
  return { glow: 0.7, flash: 0.85 * dive * dive, zblur: 0.35 * dive, push: { k: 1 + 0.03 * bumpAt(t, c.slap, 7), cx: 700, cy: 900 } };
};

// ---------------------------------------------------------------- the three: Earth gets its real number, then greens over
SC.three = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  tvsSpaceBg(t, 0, -60 * lt);
  screenSpace();
  const R = 330 + 30 * r2(t, c.pull, c.pull + 0.6) + 8 * lt;
  const green = r2(t, c.green, c.green + 0.9, E.inOutSine);
  tvsEarth(540, 1240, R, t, { rot: 0.15 + 0.02 * lt, green });
  // the old guess counts up while she says it ("Three TRILLION."), then slams into the real number
  const hitT = c.slam;
  if (t < hitT) {
    const k = clamp(inv(c.three + 0.05, hitT - 0.08, t)), bn = Math.round(lerp(400, 3040, E.inCubic(k)) / 10) * 10;
    const sh = shake(t, 3 + 5 * k, 26, 5);
    tvsCard(540 + sh[0], 560 + sh[1], 1, bn.toLocaleString('en-US') + ' BILLION', k > 0.02 ? 'TREES (COUNTING...)' : 'TREES (THE OLD GUESS)', '#7CFFB2', -0.03, 0.62 + 0.3 * k);
  } else {
    const sh = shake(t, 14 * bumpAt(t, hitT, 6), 30, 3), pop = 1 + 0.22 * bumpAt(t, hitT, 9);
    const roll = t < c.double ? '3 TRILLION' : '~5.6 TRILLION';
    tvsCard(540 + sh[0], 560 + sh[1], 1, roll, t < c.double ? 'TREES (COUNTED)' : 'TREES BEFORE FARMING', '#7CFFB2', -0.03, pop);
  }
  if (t >= hitT && t < hitT + 0.4) shockLines(540, 560, 380, inv(hitT, hitT + 0.35, t), 12, '#FFFFFF');
  // before farming: a small dial that turns back
  const fk = r2(t, c.before - 0.05, c.before + 0.25, E.outBack) * (1 - r2(t, c.double - 0.15, c.double + 0.05));
  if (fk > 0.01) tvsCard(540, 745, fk, '12,000 YEARS AGO', 'BEFORE FARMING', '#FF9A3C', 0.03, 0.6);
  const xk = r2(t, c.x2, c.x2 + 0.2, E.outBack);
  if (xk > 0.01) stamp('ALMOST 2×', 560, 750, xk, '#FFD447', -0.1, 104);
  return { glow: 0.9, flash: 0.7 * Math.pow(1 - r2(t, c.pull, c.pull + 0.3), 2), zblur: 0.25 * (1 - r2(t, c.pull, c.pull + 0.4)),
    push: { k: 1 + 0.02 * bumpAt(t, hitT, 6), cx: 540, cy: 600 } };
};

// ---------------------------------------------------------------- the button: the sapling taps him... and he goes back to the stars
SC.button = (lt, t, shot) => {
  const c = cu(), dur = TLd.duration;
  const tt = t - dur;                                     // < 0: frame 0's picture at the very end
  let C;
  if (t >= c.loop0) C = hookC(tt);
  else {
    const e = hookC(c.loop0 - dur);
    C = tvKeys(t, [[shot.start, 0.42, 9.8, -3.2, -0.03], [c.tap[0] - 0.3, -0.05, 9.82, -2.6, -0.04], [c.glance + 0.15, -0.05, 9.82, -2.45, -0.04], [c.loop0, e.x, e.y, e.z, e.pitch]], E.inOutSine);
  }
  // he counts the sky again; on "looking" the sapling taps his shoulder, he glances round... and goes straight back to it
  const taps = c.tap, tapK = Math.max(pulse(t, taps[0] - 0.08, taps[0] + 0.12), pulse(t, taps[1] - 0.08, taps[1] + 0.12));
  const reach = r2(t, taps[0] - 0.35, taps[0] - 0.08) * (1 - r2(t, c.back - 0.1, c.back + 0.2));
  const gl = r2(t, c.glance, c.glance + 0.14, E.outBack) * (1 - r2(t, c.back, c.back + 0.16));
  const clicks = [];
  for (let k = c.back + 0.2; k < dur - 0.05; k += 0.26) clicks.push(k);
  const early = [];
  for (let k = shot.start + 0.1; k < taps[0] - 0.3; k += 0.26) early.push(k);
  const all = early.concat(clicks);
  const nShown = N0 - clicks.length + countN(t, clicks);
  const A = { x: 0, z: 0, pose: POSES.sit, armR: ARM_COUNT, armL: ARM_LAP, handR: 'thumb' };
  A.face = lerpFace(HF.count, HF.glance, gl);
  A.headRot = 0.04 - 0.16 * gl;
  A.headDX = -10 * gl;
  A.post = (lc, r) => counterAt(lc, r, pressOf(t, all), t < c.back ? N0 - clicks.length : nShown);
  let shoulder = null;
  A.after = (r, cam2) => { shoulder = rigS(cam2, [r.shL[0] - 6, r.shL[1] - 6]); };
  tvWorld(C, t, {
    at: [saplingAt(t, { droop: 0.3 + 0.7 * (1 - reach), look: 1 })],
    hero: (CC) => heroDraw(CC, t, A),
    after: (CC) => {
      // the sapling's branch, reaching for his shoulder
      if (!shoulder || reach <= 0.01) return;
      const b = tvProj(CC, SAP.x, tvH(SAP.x, SAP.z), SAP.z);
      if (!b) return;
      const hp = SAP.h * b[2], from = [b[0] + hp * 0.12, b[1] - hp * 0.5];
      const to = [lerp(from[0], shoulder[0], reach), lerp(from[1], shoulder[1] - 8 * tapK, reach) - 14 * tapK];
      actor(() => {
        const mid = [lerp(from[0], to[0], 0.5), Math.min(from[1], to[1]) - hp * 0.1];
        ctx.strokeStyle = '#5A3E2A'; ctx.lineWidth = Math.max(5, hp * 0.035); ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(from[0], from[1]); ctx.quadraticCurveTo(mid[0], mid[1], to[0], to[1]); ctx.stroke();
        // needles along it, and a fan of them where it taps
        for (let i = 1; i <= 5; i++) {
          const u = i / 6, x = (1 - u) * (1 - u) * from[0] + 2 * u * (1 - u) * mid[0] + u * u * to[0], y = (1 - u) * (1 - u) * from[1] + 2 * u * (1 - u) * mid[1] + u * u * to[1];
          ctx.fillStyle = i % 2 ? '#2E8A55' : '#38A062';
          ctx.beginPath(); ctx.moveTo(x - hp * 0.05, y + hp * 0.02); ctx.lineTo(x, y - hp * 0.06); ctx.lineTo(x + hp * 0.05, y + hp * 0.02); ctx.closePath(); ctx.fill();
        }
        ctx.fillStyle = '#38A062';
        ctx.beginPath(); ctx.moveTo(to[0] - hp * 0.08, to[1] - hp * 0.02); ctx.lineTo(to[0] + hp * 0.02, to[1] - hp * 0.09); ctx.lineTo(to[0] + hp * 0.07, to[1] + hp * 0.03); ctx.lineTo(to[0] - hp * 0.03, to[1] + hp * 0.06); ctx.closePath(); ctx.fill();
      });
      if (tapK > 0.2) { screenSpace(); shockLines(to[0], to[1] - 10, 60, 0.3 + 0.7 * tapK, 6, '#E8EEF8'); }
    },
  });
  return { glow: 0.9 };
};

// ---------------------------------------------------------------- the cover (src/cover.sh): him with a star on his head, the
// scoreboard behind
SC.cover = (lt, t, shot) => {
  const C = tvCam({ x: 0.22, y: 9.6, z: -3.1, pitch: -0.21 });
  const A = { x: 0, z: 0, pose: POSES.sit, armL: ARM_LAP, armR: ARM_COUNT, handR: 'thumb', face: HF.cross };
  A.post = (lc, r) => counterAt(lc, r, 0, N0);
  A.after = (r, cam2) => { const top = rigS(cam2, headTop(r, {})), rr = 50 * cam2.zoom; headStar(top[0] + 6 * cam2.zoom, top[1] - rr * 0.05, rr, 1, t); };
  tvWorld(C, t, { star: (tr) => (tr.patch && hash(tr.i) < 0.5 ? 1 : 0), at: [{ z: BOARD.z, fn: (CC) => boardDraw(CC, t, 1, { a: '7', b: '1', fa: 1, fb: 1 }) }, saplingAt(t, { droop: 1, look: 1 })],
    hero: (CC) => heroDraw(CC, t, A) });
  return { glow: 0.95, noCaptions: true };
};
