// Why Does the SUN Make You SNEEZE? Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;
const HOLD = { a: 0.3, b: -1.35 };                      // his right arm, holding the popcorn against his belly
const FACE_SHEEP = { eyeOpen: 1.05, pupil: 0.95, lookX: 0, lookY: 0, browY: 1, browTilt: 1, mouth: 'grimace', mouthOpen: 1, blink: 0, cross: 0 };
const FACE_SMUG = { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 0.9, browTilt: -0.5, mouth: 'grin', mouthOpen: 0.7, blink: 0, cross: 0 };

// ---------------------------------------------------------------- comic text
function loudWord(txt, x, y, size, col, k, t, spread = 0.56, amp = 7) {
  if (k <= 0) return;
  const n = txt.length;
  for (let i = 0; i < n; i++) {
    const u = n > 1 ? i / (n - 1) : 0.5, sz = size * (0.8 + 0.4 * u);
    bigWord(txt[i], x + (i - (n - 1) / 2) * size * spread + amp * Math.sin(t * 40 + i * 2.1), y - 26 * Math.sin(u * 2.2) + amp * Math.cos(t * 33 + i * 1.7), sz, col, k, -0.1 + 0.06 * Math.sin(t * 25 + i));
  }
}
// ACHOO! popping at t0 for `hold` seconds
function achooWord(x, y, size, col, t, t0, hold = 0.55) {
  const k = ramp(t, t0, t0 + 0.11, E.outBack) * (1 - ramp(t, t0 + hold, t0 + hold + 0.16));
  if (k <= 0) return;
  shockLines(x, y, size * 1.5, inv(t0, t0 + 0.4, t), 14, '#FFFFFF', 3 + Math.round(t0 * 10));
  loudWord('ACHOO!', x, y, size, col, k, t);
}
// the popcorn in his right hand (rig-local, inside sunChar's post): the bucket, then his hand on it
function heldBucket(c, r, fill, jolt = 0) {
  popBucket(c, r.wrR[0] - 14, r.wrR[1] + 62, 0.66, -0.06 + 0.25 * jolt, fill);
  circle(c, r.wrR[0] + r.armDirR[0] * 14, r.wrR[1] + r.armDirR[1] * 14, 21, PAL.skinSh); circle(c, r.wrR[0] + r.armDirR[0] * 14 - 2, r.wrR[1] + r.armDirR[1] * 14 - 2, 18, PAL.skin);
}

// ---------------------------------------------------------------- 1. hook: out of the dark cinema, into the sun ... ah ... ah ... ACHOO, ACHOO
SC.hook = (lt, t, shot) => {
  const c = cu();
  const walk = ramp(t, -0.2, c.prickle + 0.05, E.outCubic), hx = lerp(366, 614, walk) + 34 * ramp(t, c.prickle, c.sun, E.inOutSine);
  const act = sneezeAct(t, [c.achoo1, c.achoo2], 0.6);
  const zk = camKeys(t, [[0, 0, 0, 1.6], [1.3, 0, 0, 1.46], [c.windup, 0, 0, 1.48], [c.achoo1 - 0.04, 0, 0, 1.6], [c.achoo1 + 0.13, 0, 0, 1.4], [c.achoo2 - 0.04, 0, 0, 1.5], [c.achoo2 + 0.13, 0, 0, 1.32], [shot.end, 0, 0, 1.35]]);
  const cam = { x: hx + lerp(26, -8, ramp(t, 0, c.sun, E.inOutSine)), y: 1128, zoom: zk.zoom, rot: 0 };
  const [qx, qy] = shake(t, 18 * decay(t, c.achoo1, 6) + 26 * decay(t, c.achoo2, 5.5), 28, 2);
  cam.sx = qx; cam.sy = qy;
  const sun = sunAt(hx), glare = 0.62 + 0.45 * ramp(t, 0.5, c.sun_end) + 0.5 * (decay(t, c.achoo1, 5) + decay(t, c.achoo2, 5));
  streetBack(cam, t, { door: 0.5 + 0.5 * ramp(t, 0, 0.3, E.outBack), flick: decay(t, c.achoo2, 3) });
  sunDraw(cam, t, glare);
  // him
  const tk = (0.25 * ramp(t, c.prickle - 0.1, c.prickle + 0.1) + 0.75 * ramp(t, c.prickle, c.tingle + 0.3, E.inOutSine)) * (1 - ramp(t, c.windup, c.windup + 0.25));
  const moving = 1 - 0.7 * ramp(t, c.prickle - 0.1, c.prickle + 0.2) - 0.3 * ramp(t, c.sun - 0.15, c.sun + 0.2);
  let base = lerpPose(POSES.stand, walkPlanted(t + 0.4, { speed: 10 }), moving);
  base.armR = HOLD; base.hand = 'open';
  const pose = sneezePose(base, act, true);
  pose.armR = { a: HOLD.a + 0.5 * clamp(act.s * 1.5), b: HOLD.b + 0.5 * clamp(act.s * 1.5) };
  let face = lerpFace(FACES.calm, FACE_SQUINT, clamp(tk + sun * 0.5 * (1 - act.w)));
  face = sneezeFace(face, act);
  if (act.n === 2 && act.s < 0.25) face = lerpFace(face, FACES.dazed, 1 - act.s * 4);
  const hd = sneezeHead(act), tw = tk * 4 * Math.sin(t * 46);
  const st = { x: hx, y: ST.G, s: 1, pose, face, headDX: hd.headDX + tw, headDY: hd.headDY, headRot: hd.headRot, frizz: act.n === 2 ? 0.35 * (1 - act.s) + 0.25 : 0 };
  const fill = act.n === 0 ? 1 : act.n === 1 ? 0.55 : 0.12;
  const r = sunChar(cam, st, t, { sun, dark: 0.8 * (1 - inv(366, 450, hx)), flash: 0.14 * (decay(t, c.achoo1, 9) + decay(t, c.achoo2, 9)) + 0.3 * Math.sin(Math.PI * inv(0.2, 0.55, t)), post: (lc, rr) => heldBucket(lc, rr, fill, act.s) });
  streetVeil(cam, sun);
  // the popcorn goes up
  applyCam(cam);
  const bx = hx + r.wrR[0] - 14, by = ST.G + r.wrR[1] - 30;
  popcornBurst(ctx, bx, by, t, c.achoo1, 16, 11, 1, 0.9);
  popcornBurst(ctx, bx, by, t, c.achoo2, 26, 12, 1.2, 1.15);
  // the prickle in his nose: a sparkle that grows as the light hits
  const nose = toScreen(cam, hx + st.headDX, ST.G - 470 + 18 + st.headDY);
  screenSpace();
  if (tk > 0) { sparkle(nose[0] + 3, nose[1] + 6, 12 + (13 + 8 * Math.sin(t * 30)) * tk, 0.6 + 0.4 * tk, '#FFF3B0'); softDot(gctx, nose[0], nose[1] + 6, 34, '#FF9A3C', 0.22 * tk);
    for (let i = 0; i < 3; i++) { const a = -0.25 + i * 0.5 + 0.2 * Math.sin(t * 20 + i), R = 66 + 12 * Math.sin(t * 26 + i * 2); line(ctx, nose[0] + Math.cos(a) * 40, nose[1] + 6 + Math.sin(a) * 40, nose[0] + Math.cos(a) * R, nose[1] + 6 + Math.sin(a) * R, 4, `rgba(255,243,176,${0.85 * tk})`); } }
  for (const [ts, sz, sd] of [[c.achoo1, 1, 5], [c.achoo2, 1.3, 6]]) sprayBurst(nose[0], nose[1] + 96, t, ts, 1.45, sz, sd);
  screenSpace();
  achooWord(540, 562, 170, '#FFD447', t, c.achoo1, 0.5);
  achooWord(540, 592, 206, '#FF9A3C', t, c.achoo2, 0.42);
  return { glow: 0.7, flash: 0.06 * decay(t, 0, 9) + 0.16 * (decay(t, c.achoo1, 12) + decay(t, c.achoo2, 12)) };
};

// ---------------------------------------------------------------- 2. bless: the stare; "Bless you."; it's not a cold (the germ gets crossed out)
SC.bless = (lt, t, shot) => {
  const c = cu(), hx = 648;
  const cam = { x: hx - 40 - 46 * ramp(t, c.germ - 0.2, c.germ + 0.2, E.inOutSine), y: 1104, zoom: lerp(2.2, 2.34, lt / (shot.end - shot.start)), rot: 0 };
  streetBack(cam, t, { door: 1 });
  sunDraw(cam, t, 1);
  const look = ramp(t, c.bless - 0.18, c.bless + 0.05), gk = ramp(t, c.germ, c.germ + 0.16), dead = ramp(t, c.xcold, c.xcold + 0.14);
  let face = lerpFace(FACES.dazed, FACE_SHEEP, look);
  face = lerpFace(face, Object.assign({}, FACES.confused, { lookX: -1, lookY: -0.4 }), gk * (1 - dead));
  face = lerpFace(face, FACES.grin, ramp(t, c.xcold + 0.1, c.xcold + 0.3));
  const no = Math.sin((t - c.not) * 17) * 9 * ramp(t, c.not, c.not + 0.1) * (1 - ramp(t, c.cold_end - 0.1, c.cold_end + 0.1));
  const sniff = 5 * Math.sin(Math.PI * inv(shot.start + 0.12, shot.start + 0.45, t));
  const pose = Object.assign({}, POSES.stand, { armR: HOLD });
  const st = { x: hx, y: ST.G, s: 1, pose, face, headDX: no, headDY: -sniff - 4 * Math.sin(Math.PI * inv(c.bless_end, c.bless_end + 0.3, t)), headRot: 0.04 * look, frizz: 0.32 };
  sunChar(cam, st, t, { sun: 1, post: (lc, rr) => { heldBucket(lc, rr, 0.12); kernel(lc, rr.head[0] + 22 + no, rr.head[1] - 78 + st.headDY, 17, 0.5); kernel(lc, rr.shL[0] + 10, rr.shL[1] - 24, 15, 2); } });
  streetVeil(cam, 1);
  // one last kernel comes down past his nose
  applyCam(cam); { const d = lt; if (d < 0.7) kernel(ctx, hx + 90, 760 + 900 * d * d, 15, d * 9); }
  // the cold germ, and the X
  germ(300, 650, 84, gk, t, dead);
  bigX(300, 650, 0.5, dead);
  return { glow: 0.7 };
};

// ---------------------------------------------------------------- 3. one in four: four people leave the cinema; the one who steps into the sun sneezes
SC.onein4 = (lt, t, shot) => {
  const c = cu();
  const going = Math.min(t, c.achoo3 - 0.1) - c.achoo3, hx = 652 + going * 46, act = sneezeAct(t, [c.achoo3], 0.5);
  const cam = camKeys(t, [[shot.start, hx + 96, 1262, 1.13], [c.sudden, hx + 92, 1258, 1.16], [c.achoo3 + 0.12, hx + 40, 1206, 1.36], [shot.end, hx + 36, 1202, 1.38]], E.inOutSine);
  const [qx, qy] = shake(t, 14 * decay(t, c.achoo3, 6), 28, 4);
  cam.sx = qx; cam.sy = qy;
  streetBack(cam, t, { door: 1 });
  sunDraw(cam, t, 0.75 + 0.45 * ramp(t, c.sudden, c.light) + 0.4 * decay(t, c.achoo3, 5));
  applyCam(cam);
  const wk = 1 - ramp(t, c.achoo3 - 0.25, c.achoo3 - 0.05), seen = ramp(t, c.achoo3 + 0.05, c.achoo3 + 0.16);
  const P = [[hx + 384, 0, { shield: true }], [hx + 192, 1, {}], [hx - 192, 2, {}]];
  for (const [x, k, o] of P) if (x < hx) drawPed(ctx, x, ST.G - 4, 0.94, k, t, Object.assign(o, { walk: wk, sun: sunAt(x), turn: seen * 0.6, wide: seen > 0.5 }));
  const moving = wk;
  let base = lerpPose(POSES.stand, walkPlanted(t, { speed: 6.2 }), moving);
  const st = Object.assign({ x: hx, y: ST.G, s: 1, pose: sneezePose(base, act), face: sneezeFace(lerpFace(FACES.calm, FACE_SQUINT, sunAt(hx)), act) }, sneezeHead(act));
  sunChar(cam, st, t, { sun: sunAt(hx), flash: 0.14 * decay(t, c.achoo3, 9) + 0.16 * Math.sin(Math.PI * inv(c.achoo3 - 0.55, c.achoo3 - 0.25, t)) });
  applyCam(cam);
  for (const [x, k, o] of P) if (x >= hx) drawPed(ctx, x, ST.G + 4, 0.94, k, t, Object.assign(o, { walk: wk, sun: 1, turn: -seen, wide: seen > 0.5, shield: o.shield && seen < 0.5 }));
  streetVeil(cam, 1);
  // 1 in 4: a marker over each head; his is the one
  const cnt = [[P[0][0], false, c.one], [P[1][0], false, c.one + 0.12], [hx, true, c.four], [P[2][0], false, c.one + 0.24]];
  for (const [x, me, t0] of cnt) {
    const k = ramp(t, t0, t0 + 0.16, E.outBack) * (1 - ramp(t, c.achoo3 - 0.15, c.achoo3 + 0.05));
    if (k <= 0) continue;
    const p = toScreen(cam, x, ST.G - 540 - 62 + (me ? 10 * Math.sin(t * 9) : 0));
    screenSpace();
    if (me) { ctx.save(); ctx.translate(p[0], p[1]); ctx.scale(k, k); ctx.beginPath(); ctx.moveTo(-44, -52); ctx.lineTo(44, -52); ctx.lineTo(0, 14); ctx.closePath(); ctx.fillStyle = '#FFD447'; ctx.fill(); ctx.lineWidth = 7; ctx.lineJoin = 'round'; ctx.strokeStyle = '#0B0B1A'; ctx.stroke(); ctx.restore(); softDot(gctx, p[0], p[1] - 14, 60, '#FFD447', 0.7 * k); }
    else { circle(ctx, p[0], p[1] - 16, 17 * k, '#0B0B1A'); circle(ctx, p[0], p[1] - 16, 11 * k, '#9AA6D0'); }
  }
  const hs = toScreen(cam, hx + (st.headDX || 0), ST.G - 452 + (st.headDY || 0));
  sprayBurst(hs[0], hs[1] + 96, t, c.achoo3, 1.45, 0.8, 9);
  screenSpace();
  achooWord(540, Math.max(hs[1] - 250, 524), 128, '#FFD447', t, c.achoo3, 0.4);
  return { glow: 0.7, flash: 0.14 * decay(t, c.achoo3, 12) };
};

// ---------------------------------------------------------------- 9. button: sunglasses; the foot tease; subscribe; he peeks ... ACHOO ... again; back into the dark
SC.button = (lt, t, shot) => {
  const c = cu(), D = TLd.duration;
  const cam = camKeys(t, [[shot.start, 690, 1150, 1.3], [c.shades + 0.2, 694, 1146, 1.42], [c.nextup, 692, 1150, 1.36], [c.foot - 0.3, 668, 1268, 1.1],
    [c.dash, 660, 1268, 1.1], [c.slamdoor, 470, 1200, 1.34], [D, 440, 1170, 1.46]], E.inOutSine);
  const [qx, qy] = shake(t, 16 * decay(t, c.achoo4, 6) + 12 * decay(t, c.achoo5, 6) + 20 * decay(t, c.slamdoor, 8), 28, 6);
  cam.sx = qx; cam.sy = qy;
  const act = sneezeAct(t, [c.achoo4, c.achoo5], 0.34);
  const run = ramp(t, c.dash, c.dash + 0.42, E.inCubic), hx = lerp(704, 352, run), gone = ramp(t, c.dash + 0.34, c.dash + 0.44);
  const door = 1 - ramp(t, c.slamdoor - 0.13, c.slamdoor, E.inCubic);
  streetBack(cam, t, { door, flick: decay(t, c.slamdoor, 2.5) });
  const on = ramp(t, c.shades + 0.14, c.shades + 0.2), peek = ramp(t, c.peek, c.peek + 0.16, E.outBack) * (t < c.achoo4 ? 1 : 0);
  sunDraw(cam, t, 0.9 + 0.3 * peek + 0.45 * (decay(t, c.achoo4, 5) + decay(t, c.achoo5, 5)));
  // acting
  const shrug = ramp(t, c.what - 0.1, c.what + 0.14, E.outBack) * (1 - ramp(t, c.shades - 0.1, c.shades + 0.12));
  const smug = ramp(t, c.shades + 0.14, c.shades + 0.4) * (1 - ramp(t, c.peek - 0.1, c.peek + 0.1));
  const tease = ramp(t, c.foot - 0.2, c.foot) * (1 - ramp(t, c.asleep_end + 0.25, c.asleep_end + 0.5));
  let pose = lerpPose(POSES.stand, POSES.flinch, 0.8 * shrug);
  pose = lerpPose(pose, POSE_HIPS, smug);
  if (tease > 0) { pose = Object.assign({}, pose, { legL: { a: pose.legL.a + tease * (0.42 + 0.1 * Math.sin(t * 34)), b: pose.legL.b - tease * (0.7 + 0.16 * Math.sin(t * 34 + 1)) }, lean: pose.lean + 0.05 * tease }); }
  const bob = smug * (1 - tease) * 5 * Math.sin(t * 7);
  pose = Object.assign({}, pose, { hipY: pose.hipY + bob });
  if (peek > 0) pose = lerpPose(pose, ikReach(pose, 'R', [52, pose.hipY - 262], 1), peek);
  pose = sneezePose(pose, act);
  if (run > 0) pose = lerpPose(pose, Object.assign({}, walkPlanted(t, { speed: 26, lift: 40 }), { lean: -0.2 }), clamp(run * 4));
  let face = lerpFace(FACES.calm, FACES.confused, shrug);
  face = lerpFace(face, FACE_SMUG, smug);
  face = lerpFace(face, Object.assign({}, FACES.confused, { lookX: -0.6, lookY: 1, mouth: 'wavy' }), tease);
  if (t >= c.peek) face = lerpFace(face, Object.assign({}, FACES.startled, { lookX: 0.8, lookY: -1 }), peek);
  face = sneezeFace(face, act);
  if (act.n >= 1 && act.s < 0.3 && act.w < 0.1) face = lerpFace(face, act.n === 2 ? Object.assign({}, FACES.annoyed, { lookX: 0, lookY: 0 }) : FACES.dazed, 1 - act.s * 3.3);
  const hd = sneezeHead(act);
  const st = { x: hx, y: ST.G, s: lerp(1, 0.9, run), pose, face, headDX: hd.headDX - 14 * tease, headDY: hd.headDY + 8 * tease, headRot: hd.headRot - 0.12 * tease + 0.05 * smug * Math.sin(t * 3.5), frizz: act.n ? 0.3 : 0 };
  const drop = springStep(t - c.shades, 5.5, 0.42), glint = Math.sin(Math.PI * inv(c.ting, c.ting + 0.36, t));
  let r = null;
  if (gone < 1) {
    ctx.globalAlpha = 1 - gone;
    r = sunChar(cam, st, t, { sun: sunAt(hx), flash: 0.14 * (decay(t, c.achoo4, 9) + decay(t, c.achoo5, 9)),
      post: (lc, rr) => { if (t >= c.shades && t < c.achoo4) { lc.save(); lc.translate(0, -620 * (1 - drop)); shades(lc, rr, st, peek, 1, glint); lc.restore(); } } });
    ctx.globalAlpha = 1;
  }
  streetVeil(cam, 1);
  applyCam(cam);
  // the shades, sneezed off: up, over and gone
  if (t >= c.achoo4) {
    const d = t - c.achoo4, sx = 704 - 330 * d, sy = ST.G - 520 - 1250 * d + 0.5 * 2700 * d * d;
    if (sy < ST.G + 400) { ctx.save(); ctx.translate(sx, sy); ctx.rotate(-9 * d); shadesShape(ctx, 0); ctx.restore(); }
  }
  // pins and needles in his foot (the tease): prickles round the lifted foot
  if (tease > 0.02 && r) {
    const f = toScreen(cam, hx + r.anL[0], ST.G + r.anL[1] + 6);
    for (let i = 0; i < 7; i++) { const a = i / 7 * 6.283 + Math.floor(t * 12) * 1.3, R = 70 + 26 * hash(i + Math.floor(t * 12)); sparkle(f[0] + Math.cos(a) * R, f[1] + Math.sin(a) * R * 0.7, 20 * tease * (0.6 + 0.4 * hash(i * 3 + Math.floor(t * 12))), 0.95 * tease, '#FFE27A'); }
    softDot(gctx, f[0], f[1], 110, '#FFD447', 0.35 * tease);
  }
  if (smug > 0.5 && glint > 0) { const hp = toScreen(cam, hx + 40, ST.G - 486); sparkle(hp[0], hp[1], 64 * glint, glint, '#FFFFFF'); }
  const hs = toScreen(cam, hx + (st.headDX || 0), ST.G - 452 + (st.headDY || 0));
  sprayBurst(hs[0], hs[1] + 80, t, c.achoo4, 1.45, 1, 14);
  sprayBurst(hs[0], hs[1] + 80, t, c.achoo5, 1.5, 0.85, 15);
  // the dash: speed lines, and dust where he stood
  if (run > 0 && run < 1) for (let i = 0; i < 6; i++) { const p = toScreen(cam, hx + 60 + i * 44, ST.G - 120 - i * 62); line(ctx, p[0], p[1], p[0] + 150 * (1 - run * 0.5), p[1], 6, `rgba(255,255,255,${0.5 * (1 - run)})`); }
  screenSpace();
  achooWord(470, 540, 124, '#FFD447', t, c.achoo4, 0.45);
  achooWord(486, 548, 112, '#FF9A3C', t, c.achoo5, 0.4);
  return { glow: 0.7, flash: 0.14 * (decay(t, c.achoo4, 12) + decay(t, c.achoo5, 12)), blur: run > 0 && run < 1 ? [34 * Math.sin(Math.PI * run), 0] : null };
};

// ---------------------------------------------------------------- the section shots (sneezehead.js): helpers
function secBg(t) { darkBg('#3C2052', '#0A0514'); motes(t, 0.6); }
// a label pill with a leader to a point of the section
function secLabel(cam, txt, px, py, wx, wy, k, col, size = 44) {
  if (k <= 0) return;
  const p = shScreen(cam, wx, wy);
  leader([px, py + (p[1] > py ? size * 0.8 : -size * 0.8)], p, clamp(k * 1.4), col);
  pill(px, py, txt, col, k, size);
}
// the hedge, on screen for the whole explanation: this is the leading idea, not a proven one
function guessStamp(t) { const c = cu(); stamp('BEST GUESS', 318, 470, ramp(t, c.guess, c.guess + 0.2), '#FFD447', -0.07, 72); }

// ---------------------------------------------------------------- 4. why: into his head; two wires, drawn on, that run side by side
SC.why = (lt, t, shot) => {
  const c = cu();
  secBg(t);
  const cam = sectionCam(t, [[shot.start, 70, -70, 1.7, 830], [c.why_end + 0.25, 44, -40, 1.28, 820], [c.crossed, 48, -40, 1.3, 820], [shot.end, 70, -44, 1.4, 820]]);
  const os = ramp(t, c.scientists - 0.05, c.think + 0.2, E.inOutSine), ts = ramp(t, c.think, c.crossed + 0.05, E.inOutSine);
  const zap = ramp(t, c.crossed + 0.05, c.crossed + 0.2);
  headCut(cam, t, { optic: os, tri: ts, opticHi: 0.55 * os, triHi: 0.55 * ts, closeHi: ramp(t, c.wires - 0.05, c.wires + 0.15), spill: zap * (Math.sin(t * 23) > -0.3 ? 1 : 0.25) });
  screenSpace();
  const kw = ramp(t, c.why - 0.04, c.why + 0.1, E.outBack) * (1 - ramp(t, c.why_end + 0.1, c.why_end + 0.28));
  bigWord('WHY?', 540, 580, 240, '#FFD447', kw, -0.05);
  guessStamp(t);
  return { glow: 0.9, zblur: 0.45 * (1 - ramp(lt, 0, 0.3)), zcx: 600, zcy: 780, flash: 0.4 * (1 - ramp(lt, 0, 0.14)) };
};

// ---------------------------------------------------------------- 5. mech: the eye's nerve, how close it runs to the nose's nerve; light floods in, fires one, spills into the other
SC.mech = (lt, t, shot) => {
  const c = cu();
  secBg(t);
  const cam = sectionCam(t, [[shot.start, 70, -44, 1.4, 820], [c.eyes, 190, -62, 2.5, 800], [c.runs, 176, -56, 2.5, 800], [c.close + 0.1, 132, -40, 3.0, 800],
    [c.nerve2, 150, -16, 2.6, 800], [c.nose, 232, 40, 2.4, 800], [c.nose_end + 0.12, 236, 42, 2.4, 800], [c.flood, 210, -60, 1.7, 800], [c.fires_end, 176, -54, 2.0, 800],
    [c.spills + 0.12, 132, -40, 3.0, 800], [c.other_end, 90, -14, 2.2, 810], [shot.end, 84, -10, 2.1, 810]]);
  const beam = ramp(t, c.sudden2 - 0.05, c.flood + 0.1), fire = ramp(t, c.fires - 0.08, c.fires + 0.12), spill = ramp(t, c.spills - 0.02, c.spills + 0.1);
  const run = ramp(t, c.spills + 0.12, c.spills + 0.4);
  const eyeHi = ramp(t, c.nerve1 - 0.05, c.eyes) * (1 - ramp(t, c.nerve2 - 0.1, c.nerve2 + 0.2));
  const noseHi = ramp(t, c.nerve2 - 0.05, c.nerve2 + 0.2) * (1 - ramp(t, c.sudden2 - 0.1, c.sudden2 + 0.2));
  const [qx, qy] = shake(t, 5 * spill * (1 - ramp(t, c.other, c.other_end)), 30, 5);
  cam.x += qx; cam.y += qy;
  headCut(cam, t, { opticHi: Math.max(0.3, eyeHi, fire), triHi: Math.max(0.25, noseHi, run), noseHi: Math.max(noseHi, 0.7 * run),
    closeHi: ramp(t, c.close - 0.12, c.close + 0.08) * (1 - ramp(t, c.nerve2, c.nerve2 + 0.25)) + ramp(t, c.spills - 0.12, c.spills + 0.08),
    beam, fire, spill: spill * (0.55 + 0.45 * (Math.sin(t * 31) > 0 ? 1 : 0.4)), triRun: run,
    shield: ramp(t, c.guards - 0.02, c.guards + 0.2) * (1 - ramp(t, c.sudden2 - 0.12, c.sudden2 + 0.05)), stemHi: ramp(t, c.other, c.other_end + 0.2) });
  screenSpace();
  const k1 = ramp(t, c.nerve1, c.nerve1 + 0.18, E.outBack) * (1 - ramp(t, c.close - 0.1, c.close + 0.05));
  secLabel(cam, "EYE'S NERVE", 330, 600, 150, -57, k1, '#FFD447', 50);
  const k2 = ramp(t, c.nerve2, c.nerve2 + 0.18, E.outBack) * (1 - ramp(t, c.sudden2 - 0.2, c.sudden2 - 0.02));
  secLabel(cam, "NOSE'S NERVE", 350, 1090, 196, 47, k2, '#FF9A3C', 50);
  guessStamp(t);
  return { glow: 0.92, flash: 0.1 * decay(t, c.spills, 9) };
};

// ---------------------------------------------------------------- 6. fire: the brain hears "something's up the nose": NOSE ALERT, the big red button, FIRE!
SC.fire = (lt, t, shot) => {
  const c = cu();
  secBg(t);
  const cam = sectionCam(t, [[shot.start, 84, -10, 2.1, 810], [c.brain + 0.12, 40, -170, 1.62, 800], [c.alert - 0.12, 40, -170, 1.62, 800], [c.alert + 0.2, 104, -76, 1.22, 800],
    [c.fire - 0.16, 100, -80, 1.25, 800], [c.fire + 0.06, -40, 30, 2.05, 830], [shot.end, -44, 26, 2.25, 830]]);
  const al = ramp(t, c.alert - 0.04, c.alert + 0.1), pn = ramp(t, c.alert, c.alert + 0.18);
  const slam = ramp(t, c.slam - 0.11, c.slam, E.inCubic), after = decay(t, c.slam, 5);
  const [qx, qy] = shake(t, 26 * after, 30, 9);
  cam.x += qx; cam.y += qy;
  headCut(cam, t, { opticHi: 0.5, triHi: 0.8, fire: 0.7 * (1 - al), triRun: 1 - al, beam: 1 - ramp(t, c.so, c.brain), alarm: al, noseHi: al,
    face: ramp(t, c.so, c.so + 0.2), panic: pn, button: ramp(t, c.upthe - 0.1, c.upthe + 0.1), arm: t >= c.upthe ? slam : null, press: slam,
    stemHi: 0.6 + 0.4 * slam, rot: -0.07 * ramp(t, c.slam + 0.1, shot.end, E.inOutSine) });
  screenSpace();
  // NOSE ALERT, blinking, pointing at the nose
  const ka = ramp(t, c.alert, c.alert + 0.14, E.outBack) * (1 - ramp(t, c.fire - 0.2, c.fire - 0.05));
  if (ka > 0 && Math.sin(t * 30) > -0.6) { const p = shScreen(cam, 318, 70); leader([640, 1060], p, 1, '#FF5A6E'); pill(640, 1100, 'NOSE ALERT!', '#FF5A6E', ka, 52); }
  if (after > 0.05) shockLines(shScreen(cam, -60, 60)[0], shScreen(cam, -60, 60)[1], 120, inv(c.slam, c.slam + 0.4, t), 14, '#FFD0D6', 8);
  const klax = t > c.slam ? 0.5 + 0.5 * Math.sin((t - c.slam) * 34) : 0;
  return { glow: 0.92, flash: 0.3 * decay(t, c.slam, 10), tint: '#FF5060', tintA: 0.22 * klax * ramp(t, c.slam, c.slam + 0.1) };
};

// ---------------------------------------------------------------- 7. family: the holiday photo. Gran, him and the kid sneeze one after another
const PAL_GRAN = Object.assign({}, PAL, { hair: '#DADAE8', hairHi: '#FFFFFF', coat: '#B784E0', coatSh: '#8E5CC0', coatHi: '#DCC0F6', coatDk: '#6E44A0', strap: '#B784E0', strapSh: '#8E5CC0' });
const PAL_KID = Object.assign({}, PAL, { coat: '#FF6B6B', coatSh: '#CC4444', coatHi: '#FFA6A6', coatDk: '#A83030', strap: '#FFE27A', strapSh: '#D0A020' });
SC.family = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  // the wall
  darkBg('#4A2A44', '#140A18'); screenSpace();
  for (let i = 0; i < 9; i++) for (let j = 0; j < 14; j++) { const x = 60 + i * 120 + (j % 2) * 60, y = 100 + j * 130; ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 4); ctx.fillStyle = 'rgba(255,200,220,0.045)'; ctx.fillRect(-16, -16, 32, 32); ctx.restore(); }
  const FX = 170, FY = 470, FW = 740, FH = 650;
  // the frame
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(FX - 30, FY - 20, FW + 80, FH + 80);
  rrect(ctx, FX - 44, FY - 44, FW + 88, FH + 88, 14); const fg = ctx.createLinearGradient(FX, FY - 44, FX + FW, FY + FH + 44); fg.addColorStop(0, '#F2D27A'); fg.addColorStop(0.5, '#B8862E'); fg.addColorStop(1, '#E6C062'); ctx.fillStyle = fg; ctx.fill();
  rrect(ctx, FX - 14, FY - 14, FW + 28, FH + 28, 6); ctx.fillStyle = '#7A541A'; ctx.fill();
  // the photo: a sunny day out
  ctx.save(); ctx.beginPath(); ctx.rect(FX, FY, FW, FH); ctx.clip();
  const sg = ctx.createLinearGradient(0, FY, 0, FY + FH); sg.addColorStop(0, '#2E66C8'); sg.addColorStop(0.6, '#8FC0F0'); sg.addColorStop(1, '#FFE0B0'); ctx.fillStyle = sg; ctx.fillRect(FX, FY, FW, FH);
  const sx = FX + FW - 110, sy = FY + 110;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const rg = ctx.createRadialGradient(sx, sy, 10, sx, sy, 520); rg.addColorStop(0, 'rgba(255,236,170,0.6)'); rg.addColorStop(1, 'rgba(255,200,120,0)'); ctx.fillStyle = rg; ctx.fillRect(FX, FY, FW, FH);
  for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283 + t * 0.2; ctx.fillStyle = 'rgba(255,236,170,0.14)'; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + Math.cos(a - 0.05) * 700, sy + Math.sin(a - 0.05) * 700); ctx.lineTo(sx + Math.cos(a + 0.05) * 700, sy + Math.sin(a + 0.05) * 700); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  circle(ctx, sx, sy, 56, '#FFF6D8');
  ctx.fillStyle = '#5DBB6A'; ctx.beginPath(); ctx.moveTo(FX, FY + FH - 150); ctx.quadraticCurveTo(FX + 300, FY + FH - 260, FX + FW, FY + FH - 120); ctx.lineTo(FX + FW, FY + FH); ctx.lineTo(FX, FY + FH); ctx.closePath(); ctx.fill();
  // the three of them
  const who = [
    { x: 338, hy: 812, s: 1.02, pal: PAL_GRAN, ts: c.fam1, lead: 0.36, gran: true },
    { x: 772, hy: 900, s: 0.8, pal: PAL_KID, ts: c.fam3, lead: 0.5 },
    { x: 556, hy: 760, s: 1.18, pal: PAL, ts: c.fam2, lead: 0.42 },
  ];
  const mouths = [];
  for (const w of who) {
    const act = sneezeAct(t, [w.ts], w.lead), settle = ramp(t, w.ts + 0.35, w.ts + 0.7);
    let face = sneezeFace(Object.assign({}, FACE_SQUINT, { lookX: 0, lookY: 0 }), act);
    face = lerpFace(face, FACES.dazed, settle * (1 - act.s));
    face = lerpFace(face, Object.assign({}, FACE_SHEEP, { lookX: w.gran ? 1 : w.pal === PAL_KID ? -1 : 0 }), ramp(t, c.families - 0.1, c.families + 0.15));
    const hd = sneezeHead(act), st = Object.assign({ x: w.x, y: w.hy + 470 * w.s, s: w.s, pose: sneezePose(POSES.stand, act), face, noLegs: true, frizz: 0.3 * settle }, hd);
    if (w.gran) circle(ctx, w.x + hd.headDX * w.s, w.hy - 80 * w.s + hd.headDY * w.s, 34 * w.s, PAL_GRAN.hair);   // her bun
    const r = drawCharacter(ctx, st, t, w.pal);
    if (w.gran) { ctx.save(); ctx.translate(st.x, st.y); ctx.scale(st.s, st.s); ctx.translate(r.head[0] + hd.headDX, r.head[1] + hd.headDY); ctx.rotate(hd.headRot + 0.25 * act.s); ctx.translate(0, 14 * act.s);
      ctx.lineWidth = 5; ctx.strokeStyle = '#5A3A7A'; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.arc(sd * 24, -2, 21, 0, 7); ctx.stroke(); } line(ctx, -4, -2, 4, -2, 5, '#5A3A7A'); ctx.restore(); }
    mouths.push([w.x + hd.headDX * w.s, w.hy + (56 + hd.headDY) * w.s, w.ts, w.s]);
  }
  ctx.restore();
  // glass glare on the photo, and the sneezes that leave it
  ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.beginPath(); ctx.moveTo(FX, FY); ctx.lineTo(FX + 260, FY); ctx.lineTo(FX, FY + 420); ctx.closePath(); ctx.fill();
  mouths.forEach(([mx, my, ts, s], i) => sprayBurst(mx, my + 30 * s, t, ts, 1.5, 0.75 * s, 20 + i));
  screenSpace();
  const kw = (ts) => ramp(t, ts, ts + 0.1, E.outBack) * (1 - ramp(t, c.itruns - 0.05, c.itruns + 0.12));
  bigWord('achoo!', 322, 640, 80, '#C8A8FF', kw(c.fam1), -0.12);
  bigWord('ACHOO!', 580, 560, 116, '#FFD447', kw(c.fam2), 0.04);
  bigWord('choo!', 800, 742, 70, '#FF86A6', kw(c.fam3), 0.14);
  // passed down: gran -> him -> the kid
  const kp = ramp(t, c.itruns + 0.1, c.families + 0.1);
  if (kp > 0) for (const [x0, y0, x1, y1, k0] of [[380, 640, 500, 588, 0], [640, 600, 760, 730, 0.5]]) {
    const k = clamp(kp * 2 - k0); if (k <= 0) continue;
    const mx = (x0 + x1) / 2, my = Math.min(y0, y1) - 70, ex = lerp(x0, x1, k), ey = (1 - k) * (1 - k) * y0 + 2 * (1 - k) * k * my + k * k * y1;
    for (const [cc, sc, w, col] of [[gctx, 0.5, 20, 'rgba(77,255,180,0.6)'], [ctx, 1, 9, '#4DFFB4']]) {
      cc.save(); cc.setTransform(sc, 0, 0, sc, 0, 0); cc.setLineDash([16, 12]); cc.lineWidth = w; cc.lineCap = 'round'; cc.strokeStyle = col;
      cc.beginPath(); cc.moveTo(x0, y0); for (let u = 0.05; u <= k; u += 0.05) cc.lineTo(lerp(lerp(x0, mx, u), lerp(mx, x1, u), u), lerp(lerp(y0, my, u), lerp(my, y1, u), u)); cc.stroke(); cc.setLineDash([]);
      if (cc === ctx && k > 0.9) { cc.beginPath(); cc.moveTo(x1 + 4, y1 + 6); cc.lineTo(x1 - 30, y1 - 6); cc.lineTo(x1 - 6, y1 - 34); cc.closePath(); cc.fillStyle = col; cc.fill(); }
      cc.restore();
    }
  }
  const [qx, qy] = shake(t, 10 * (decay(t, c.fam1, 9) + decay(t, c.fam2, 9) + decay(t, c.fam3, 9)), 30, 12);
  return { glow: 0.6, push: { k: 1.1 + 0.07 * lt / D, cx: 540 + qx, cy: 800 + qy }, flash: 0.3 * (1 - ramp(lt, 0, 0.1)) };
};

// ---------------------------------------------------------------- 8. card: the doctor's chart. A C H O O, spelled out; he stares at us
const ACH = [['A', 'UTOSOMAL DOMINANT'], ['C', 'OMPELLING'], ['H', 'ELIO-'], ['O', 'PHTHALMIC'], ['O', 'UTBURST']];
const CARD_CAPY = 1480;
SC.card = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#15505C', '#04161C'); screenSpace();
  for (let i = 0; i <= 6; i++) { ctx.fillStyle = 'rgba(160,240,255,0.035)'; ctx.fillRect(i * 180 - 2, 0, 4, H); ctx.fillRect(0, i * 180 + 200, W, 4); }
  // him, the patient: reading it ... then the stare
  const stare = ramp(t, c.stare, c.stare + 0.22, E.inOutSine);
  let face = lerpFace(Object.assign({}, FACES.calm, { lookX: 0.1, lookY: -1, browY: 0.9 }), Object.assign({}, FACES.confused, { lookX: 0.2, lookY: -1 }), ramp(t, c.achoo, c.achoo + 0.3));
  face = lerpFace(face, Object.assign({}, FACES.annoyed, { lookX: 0, lookY: 0, blink: 0.42 }), stare);
  face.blink = Math.max(face.blink, Math.sin(Math.PI * inv(c.purpose_end + 0.05, c.purpose_end + 0.3, t)) > 0.5 ? 1 : 0);
  const st = { x: 540, y: 1196 + 470 * 1.5, s: 1.5, pose: POSES.stand, face, headRot: -0.03 * (1 - stare), headDY: -6 * (1 - stare) };
  charLayer(CAM0, st, t, { ambient: 0.06 });
  // the chart
  const drop = springStep(lt, 3.2, 0.5), cy = lerp(-700, 0, drop);
  const X0 = 150, Y0 = 428, CW = 780, CH = 606;
  ctx.save(); ctx.translate(0, cy); ctx.rotate(0.012 * Math.sin(t * 1.3) * (1 - 0));
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; rrect(ctx, X0 + 14, Y0 + 18, CW, CH, 26); ctx.fill();
  rrect(ctx, X0, Y0, CW, CH, 26); ctx.fillStyle = '#FBF8F0'; ctx.fill();
  ctx.save(); rrect(ctx, X0, Y0, CW, CH, 26); ctx.clip(); ctx.fillStyle = '#E23A4A'; ctx.fillRect(X0, Y0, CW, 92); ctx.restore();
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(X0 + 44, Y0 + 26, 14, 40); ctx.fillRect(X0 + 31, Y0 + 39, 40, 14);
  ctx.font = '400 54px Anton'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFFFFF'; ctx.fillText('DIAGNOSIS', X0 + 92, Y0 + 50);
  ctx.font = '800 25px Montserrat'; ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.fillText('PHOTIC SNEEZE REFLEX', X0 + CW - 34, Y0 + 36);
  ctx.font = '700 21px Montserrat'; ctx.fillText('ALSO KNOWN AS:', X0 + CW - 34, Y0 + 66);
  rrect(ctx, 480, Y0 - 34, 120, 56, 14); ctx.fillStyle = '#8A93A8'; ctx.fill(); rrect(ctx, 500, Y0 - 22, 80, 22, 8); ctx.fillStyle = '#3A4258'; ctx.fill();   // the clip
  // the letters: A C H O O across the page as she says it, then down the margin as each one is spelled out
  const fold = ramp(t, c.syndrome_end - 0.12, c.syndrome_end + 0.28, E.inOutCubic);
  ACH.forEach(([L, rest], i) => {
    const t0 = lerp(c.achoo, c.achoo_end - 0.2, i / 4), k = ramp(t, t0, t0 + 0.13, E.outBack);
    if (k <= 0) return;
    const x = lerp(280 + i * 130, 214, fold), y = lerp(Y0 + 250, Y0 + 152 + i * 86, fold), sz = lerp(190, 84, fold);
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.rotate((1 - fold) * (i % 2 ? 0.05 : -0.05));
    ctx.font = `400 ${sz}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#E23A4A'; ctx.fillText(L, 0, 0);
    ctx.restore();
    const kr = ramp(t, c.syndrome_end + 0.14 + i * 0.09, c.syndrome_end + 0.32 + i * 0.09);
    if (kr > 0) { ctx.save(); ctx.beginPath(); ctx.rect(240, y - 50, 680 * kr, 100); ctx.clip(); ctx.font = '400 62px Anton'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#1A1C2C'; ctx.fillText(rest, 244, y + 8); ctx.restore(); }
  });
  const ks = ramp(t, c.syndrome - 0.03, c.syndrome + 0.12, E.outBack) * (1 - fold);
  if (ks > 0) { ctx.save(); ctx.translate(540, Y0 + 420); ctx.scale(ks, ks); ctx.font = '400 96px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#1A1C2C'; ctx.fillText('SYNDROME', 0, 0); ctx.restore(); }
  // the question she asks: a blank to fill in
  const kq = (1 - ramp(t, c.achoo - 0.12, c.achoo)) * ramp(lt, 0.35, 0.6);
  if (kq > 0) { ctx.globalAlpha = kq; ctx.font = '800 40px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#6A6F85'; ctx.fillText('MEDICAL NAME:', 540, Y0 + 180);
    for (let i = 0; i < 5; i++) { rrect(ctx, 232 + i * 130, Y0 + 318, 96, 12, 6); ctx.fillStyle = '#C9C4B6'; ctx.fill(); }
    if (Math.sin(t * 9) > 0) { ctx.fillStyle = '#E23A4A'; ctx.fillRect(238, Y0 + 220, 8, 84); } ctx.globalAlpha = 1; }
  // (a real one, on purpose)
  const kf = ramp(t, c.real, c.real + 0.16, E.outBack);
  if (kf > 0) { ctx.save(); ctx.translate(700, Y0 + CH - 46); ctx.rotate(-0.07); ctx.scale(kf, kf); rrect(ctx, -150, -30, 300, 60, 12); ctx.lineWidth = 6; ctx.strokeStyle = '#17B978'; ctx.stroke();
    ctx.font = '400 38px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#17B978'; ctx.fillText('REAL. SINCE 1978.', 0, 3); ctx.restore(); }
  ctx.restore();
  screenSpace();
  return { glow: 0.5, capY: CARD_CAPY, push: { k: 1 + 0.03 * lt / D + 0.17 * stare, cx: 540, cy: lerp(760, 1110, stare) } };
};


// ---------------------------------------------------------------- the cover (rendered from a one-shot timeline copy; not in the Short)
SC.cover = (lt, t, shot) => {
  const cam = { x: 618, y: 990, zoom: 2.45, rot: 0 }, tt = 1.2, act = { w: 0, s: 0.92, n: 1 };
  streetBack(cam, tt, { door: 1 });
  sunDraw(cam, tt, 1.0);
  const base = Object.assign({}, POSES.stand, { armR: HOLD });
  const pose = sneezePose(base, act, true);
  pose.armR = { a: HOLD.a + 0.5, b: HOLD.b + 0.5 };
  const st = Object.assign({ x: 648, y: ST.G, s: 1, pose, face: sneezeFace(FACE_SQUINT, act), frizz: 0.3 }, sneezeHead(act));
  const r = sunChar(cam, st, tt, { sun: 1, post: (lc, rr) => heldBucket(lc, rr, 0.5, 0.9) });
  streetVeil(cam, 1);
  applyCam(cam);
  popcornBurst(ctx, 648 + r.wrR[0] - 14, ST.G + r.wrR[1] - 30, 0.17, 0, 22, 12, 1.2, 0.8);
  const nose = toScreen(cam, 648 + st.headDX, ST.G - 452 + st.headDY);
  sprayBurst(nose[0], nose[1] + 150, 0.13, 0, 1.45, 1.5, 6);
  screenSpace();
  shockLines(nose[0], nose[1] - 20, 250, 0.45, 14, '#FFFFFF', 4);
  bigWord('SUN', 372, 520, 270, '#FFD447', 1, -0.07);
  bigWord('SNEEZE?', 512, 742, 196, '#FFFFFF', 1, -0.03);
  return { glow: 0.7, noCaptions: true, noSubscribe: true };
};

function initScenes2() {
  initStreet();
  initSneezeHead();
}
