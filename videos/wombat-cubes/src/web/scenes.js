// Why Do Wombats Poop CUBES? 🟫 Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
// The worlds: the Tasmanian bush at golden hour (wb_bush.js), the wombat and the props (wb_wombat.js), the gut in section
// (wb_gut.js), the cube factory (wb_factory.js).
'use strict';

const cu = () => TLd.cues;
const wbShotOf = (id) => TLd.shots.find((s) => s.id === id);

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// golden hour: the low sun is on the right (the key from the right, a warm orange rim); inside the gut: the body light;
// the factory: warm pendant lamps overhead
const WB_BUSH = { ...LIGHTS.sunset, pool: 0.34, halo: 0.12 };
const WB_GUT = { ...LIGHTS.inside, pool: 0.3 };
const WB_FACT = { ...LIGHTS.lanterns, pool: 0.5 };
setLights({ hook: WB_BUSH, answer: WB_BUSH, gut: (lt) => (lt < 0.3 ? WB_BUSH : WB_GUT), notes: WB_BUSH, roll: WB_BUSH,
  factory: WB_FACT, belt: WB_FACT, button: WB_BUSH, loop: WB_BUSH, cover: WB_BUSH });

// ---------------------------------------------------------------- his faces
const WF = {
  bliss: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 0.7, browTilt: -0.45, mouth: 'o', mouthOpen: 1.0, blink: 1, cross: 0 },
  freeze: { eyeOpen: 1.4, pupil: 0.55, lookX: 0, lookY: 0.1, browY: 1.5, browTilt: 0.3, mouth: 'o', mouthOpen: 0.8, blink: 0, cross: 0 },
  cross: { eyeOpen: 1.2, pupil: 0.8, lookX: 0, lookY: 0.9, browY: 1.1, browTilt: 0.5, mouth: 'o', mouthOpen: 0.45, blink: 0, cross: 1 },
  side: { eyeOpen: 1.2, pupil: 0.8, lookX: 1, lookY: 0.1, browY: 1.2, browTilt: 0.6, mouth: 'o', mouthOpen: 0.35, blink: 0, cross: 0 },
  yuck: { eyeOpen: 0.75, pupil: 0.9, lookX: 0.7, lookY: 0.4, browY: -0.1, browTilt: 1.2, mouth: 'grimace', mouthOpen: 1, blink: 0.25, cross: 0, squeeze: 0.5 },
  peer: { eyeOpen: 1.1, pupil: 1, lookX: -1, lookY: 0.5, browY: 0.9, browTilt: 0.7, mouth: 'flat', mouthOpen: 0.2, blink: 0, cross: 0 },
  wow: { eyeOpen: 1.35, pupil: 0.8, lookX: -0.7, lookY: 0.4, browY: 1.4, browTilt: 0.2, mouth: 'o', mouthOpen: 0.6, blink: 0, cross: 0 },
  shrug: { eyeOpen: 1.05, pupil: 1, lookX: 0.2, lookY: -0.2, browY: 1.2, browTilt: 0.8, mouth: 'wavy', mouthOpen: 0.3, blink: 0, cross: 0 },
  upR: { eyeOpen: 1.15, pupil: 0.9, lookX: 0.9, lookY: -0.6, browY: 1.1, browTilt: 0.4, mouth: 'flat', mouthOpen: 0.2, blink: 0, cross: 0 },
  read: { eyeOpen: 1.2, pupil: 0.9, lookX: 0.9, lookY: -0.5, browY: 1.3, browTilt: 0.2, mouth: 'o', mouthOpen: 0.4, blink: 0, cross: 0 },
  nod: { eyeOpen: 0.9, pupil: 1, lookX: 0.6, lookY: -0.2, browY: 0.6, browTilt: -0.3, mouth: 'grin', mouthOpen: 0.45, blink: 0.15, cross: 0 },
  deadpan: { eyeOpen: 0.8, pupil: 1, lookX: 0.3, lookY: 0.1, browY: 0.2, browTilt: -0.1, mouth: 'flat', mouthOpen: 0.1, blink: 0.4, cross: 0 },
  shiftyL: { eyeOpen: 0.85, pupil: 1, lookX: -1, lookY: 0, browY: 0.3, browTilt: -0.7, mouth: 'flat', mouthOpen: 0.15, blink: 0.25, cross: 0 },
  shiftyR: { eyeOpen: 0.85, pupil: 1, lookX: 1, lookY: 0, browY: 0.3, browTilt: -0.7, mouth: 'flat', mouthOpen: 0.15, blink: 0.25, cross: 0 },
  sneaky: { eyeOpen: 0.8, pupil: 1, lookX: 0.4, lookY: 0.3, browY: 0.5, browTilt: -0.8, mouth: 'grin', mouthOpen: 0.4, blink: 0.3, cross: 0 },
  boss: { eyeOpen: 1.0, pupil: 1, lookX: -0.8, lookY: 0.1, browY: 0.6, browTilt: -0.2, mouth: 'grin', mouthOpen: 0.4, blink: 0, cross: 0 },
  bossR: { eyeOpen: 1.0, pupil: 1, lookX: 0.8, lookY: 0.1, browY: 0.6, browTilt: -0.2, mouth: 'grin', mouthOpen: 0.4, blink: 0, cross: 0 },
  gape: { eyeOpen: 1.4, pupil: 0.6, lookX: -0.9, lookY: 0.2, browY: 1.5, browTilt: 0.3, mouth: 'scream', mouthOpen: 0.7, blink: 0, cross: 0 },
};
const wbFace = (keys, t) => {   // keys: [[t, face], ...] -> the face at t, blended over 0.16 s after each key
  let f = keys[0][1];
  for (let i = 1; i < keys.length; i++) f = lerpFace(f, keys[i][1], smooth(inv(keys[i][0], keys[i][0] + 0.16, t)));
  return f;
};
const wbSince = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);

// ---------------------------------------------------------------- the hero
const WB_SIT = Object.assign({}, POSES.sit, { lean: 0 });
// draws him lit on his own layer; o: {x, y, s, pose, face, headRot, headDX, headDY, post(c, r, st), hat}
function wbHero(cam, t, o) {
  const st = { x: o.x, y: o.y, s: o.s, pose: o.pose, face: o.face, headRot: o.headRot || 0, headDX: o.headDX || 0,
    headDY: o.headDY || 0, noLegs: o.noLegs !== false };
  const r = charLayer(cam, st, t, { pal: PAL, ambient: 0.05, post: (c, rr, s2) => {
    if ((o.hat || 0) > 0.01) wbHeadSpace(c, rr, s2, (cc) => wbHardHat(cc, 0, -62 - 120 * (1 - E.outBack(clamp(o.hat), 1.6)), 1.02));
    if (o.post) o.post(c, rr, s2);
  } });
  return { st, r };
}
function wbRigSpace(c, st, fn) { c.save(); c.translate(st.x, st.y); c.scale(st.s, st.s); fn(c); c.restore(); }
function wbHeadSpace(c, r, st, fn) {
  c.save(); c.translate(st.x, st.y); c.scale(st.s, st.s);
  c.translate(r.head[0] + (st.headDX || 0), r.head[1] + (st.headDY || 0)); c.rotate(r.lean + (st.headRot || 0));
  fn(c); c.restore();
}
// his forearm, hand and what it holds, drawn again over his head (rig space): e, w = elbow, wrist (rig-local)
function wbHandOver(c, st, e, w, o = {}) {
  wbRigSpace(c, st, (cc) => {
    if (!o.noArm) {
      line(cc, e[0], e[1], w[0], w[1], 38, PAL.coat);
      const L = Math.hypot(w[0] - e[0], w[1] - e[1]) || 1, dx = (w[0] - e[0]) / L, dy = (w[1] - e[1]) / L;
      line(cc, w[0] - dx * 6, w[1] - dy * 6, w[0] + dx * 2, w[1] + dy * 2, 42, PAL.coatSh);
    }
    const L = Math.hypot(w[0] - e[0], w[1] - e[1]) || 1, dx = (w[0] - e[0]) / L, dy = (w[1] - e[1]) / L;
    const hx = w[0] + dx * 14, hy = w[1] + dy * 14;
    circle(cc, hx, hy, 21, PAL.skin);
    if (o.cube) {   // the cube held between thumb and fingers, on top of the hand
      const cx = hx + dx * 22 + (o.cdx || 0), cy = hy + dy * 22 + (o.cdy || 0);
      wbCube(cc, cx, cy, o.cubeS || 28, o.cubeRot || 0, { wet: 0.4 });
      circle(cc, cx - 12, cy + 12, 8.5, PAL.skin); circle(cc, cx + 4, cy + 15, 8, PAL.skin);   // the fingertips over its front
    }
    if (o.ball) wbBall(cc, hx + dx * 26, hy + dy * 26, 20, 0);
  });
}

// ---------------------------------------------------------------- the hook (valid at negative time: the Short's last frames)
// tt = seconds since frame 1. Frame 1: a little brown cube at his open lips, eyes shut in bliss; "Don't": he freezes;
// "cube": he looks at it, cross-eyed; "wombat": a wombat rises behind the log beside him, chewing; "POOP.": the hold, then
// his face drops and he lets go of the cube.
const WB_MOUTH_E = [116, -128], WB_MOUTH_W = [34, -206];        // the arm with the cube at his lips (rig-local)
const WB_LOW_E = [118, -96], WB_LOW_W = [70, -150];             // ...on its way up (the loop)
const WB_LOOK_W = [44, -192];                                   // lowered a touch to look at it
function hookA(tt) {
  const c = cu();
  const up = tt < 0 ? smooth(inv(-0.55, -0.04, tt)) : 1;
  const look = smooth(inv(c.cube - 0.1, c.cube + 0.25, tt)) * (1 - smooth(inv(c.wombat + 0.1, c.wombat + 0.4, tt)) * 0.5);
  let w = [lerp(WB_LOW_W[0], WB_MOUTH_W[0], up), lerp(WB_LOW_W[1], WB_MOUTH_W[1], up)];
  w = [lerp(w[0], WB_LOOK_W[0], look), lerp(w[1], WB_LOOK_W[1], look)];
  const e = [lerp(WB_LOW_E[0], WB_MOUTH_E[0], up), lerp(WB_LOW_E[1], WB_MOUTH_E[1], up)];
  const dropK = smooth(inv(c.drop, c.drop + 0.12, tt));
  const hand = { e: [lerp(e[0], 128, dropK), lerp(e[1], -100, dropK)], w: [lerp(w[0], 96, dropK), lerp(w[1], -150, dropK)] };
  let face = tt < 0 ? lerpFace(Object.assign({}, WF.bliss, { blink: 0.6, mouthOpen: 0.5 }), WF.bliss, up) : WF.bliss;
  if (tt >= 0) face = wbFace([[0, WF.bliss], [c.freeze, WF.freeze], [c.cube, WF.cross], [c.wombat + 0.05, WF.side], [c.react, WF.yuck]], tt);
  const jolt = wbSince(tt, c.freeze, 10) * 4 + wbSince(tt, c.react, 8) * 6;
  const rise = tt < 0 ? 0 : ramp(tt, c.rise, c.rise + 0.45, E.outBack);
  // the cube falls from his hand after "POOP."
  const fall = tt > c.drop ? (tt - c.drop) : -1;
  return { hand, face, jolt, rise, fall, holding: tt < c.drop };
}
function hookCam(tt) {
  const c = cu();
  const k = camKeys(tt, [[-0.55, 512, 1336, 2.76], [0, 511, 1334, 2.92], [c.rise, 508, 1332, 3.04], [c.rise + 0.55, 548, 1326, 2.36],
    [c.poop + 0.3, 548, 1324, 2.42]]);
  const sh = shake(tt, 7 * wbSince(tt, c.react, 7), 24, 3);
  k.x += sh[0] / k.zoom; k.y += sh[1] / k.zoom;
  return k;
}
// the wombat behind the log: rise 0..1 brings its head up over the log on his right
function wbLogWombat(t, rise, o = {}) {
  if (rise <= 0.01) return;
  const y = 1373 + (1 - rise) * 260;
  wbWombat(ctx, 780, y, 1.1, Object.assign({ flip: true, lid: 0.45, chew: t, grass: 1, look: 0.2 }, o));
}
function wbSitHero(cam, t, A) {
  const st0 = { x: WBB.heroX, y: WBB.heroY, s: 1 };
  let pose = WB_SIT;
  pose = armAt(pose, 'R', A.hand.e, A.hand.w);
  pose.hand = 'open';
  const H = wbHero(cam, t, { ...st0, pose, face: A.face, headDY: (A.jolt || 0) * -0.6, headRot: A.headRot || 0,
    post: (c, r, st) => { if (A.overHead !== false) wbHandOver(c, st, A.hand.e, A.hand.w, { cube: A.holding, cubeRot: A.cubeRot || -0.08 }); } });
  return H;
}
function hookDraw(tt, t) {
  const cam = hookCam(tt), A = hookA(tt);
  wbBushBack(cam, t, { soft: 0.85 });
  applyCam(cam);
  wbLogWombat(t, A.rise, { look: 0.4, lid: 0.5 });
  wbLog(t);
  const H = wbSitHero(cam, t, A);
  applyCam(cam);
  wbGrassBand(t, 1700, 230, 820, 1.75, 4);
  if (A.fall >= 0) {   // the dropped cube falls and lands FLAT on the grass in front of him: it does not roll (the thunk)
    const p = toWorld(H.st, [96 + 10, -150 - 30]), land = 1488;
    const y = Math.min(land, p[1] + 2600 * A.fall * A.fall), landed = y >= land;
    wbCube(ctx, p[0] - 30 * Math.min(1, A.fall / 0.25), y - (landed ? 14 * wbSince(A.fall, 0.25, 18) : 0), 28, landed ? 0 : 0.5 * A.fall);
  }
  wbMotes(t, 0.8, 5);
  return { cam, H, A };
}
SC.hook = (lt, t) => {
  hookDraw(lt, t);
  return { glow: 0.85, zblur: 0.03 * (1 - ramp(lt, 0, 0.25)) };
};
SC.loop = (lt, t) => {
  hookDraw(t - TL.duration, t);
  return { glow: 0.85 };
};

// ---------------------------------------------------------------- "And no, its butt isn't square. Its GUT makes the corners."
// the two-shot in the clearing: the wombat's round rump toward him, his magnifier on it; ROUND; the glare; then the lens
// slides to its belly and goes x-ray; the camera dives into the lens
const WB_AW = { x: 430, y: 1660, s: 1.12 };                       // the wombat (facing left: its rump toward him)
const WB_AH = { x: 748, y: 1700, s: 1.1 };                        // him, crouched behind a tussock, leaning toward it
function wbAnswerState(t) {
  const c = cu();
  const move = smooth(inv(c.lens_move + 0.2, c.lens_move + 0.6, t));
  const rump = [WB_AW.x + 146 * WB_AW.s, WB_AW.y - 92 * WB_AW.s];
  const colon = [WB_AW.x + 40 * WB_AW.s, WB_AW.y - 168 * WB_AW.s];    // the last part of the gut, where the cubes are
  const lens = [lerp(rump[0] - 22, colon[0], move), lerp(rump[1] + 4, colon[1], move) - 20 * Math.sin(Math.PI * move)];
  const scan = smooth(inv(c.lens_move, c.xray + 0.25, t));             // the x-ray wipe across the wombat, head to rump
  return { move, rump, colon, lens, scan };
}
SC.answer = (lt, t, shot) => {
  const c = cu(), S = wbAnswerState(t);
  const camA = camKeys(t, [[shot.start, 470, 1430, 1.38], [c.lens_move, 474, 1428, 1.44], [c.xray + 0.3, 520, 1470, 1.9],
    [c.dive, 530, 1480, 2.15]]);
  const dk = smooth(inv(c.dive, shot.end, t));
  const cam = dk > 0 ? scaledCam(camA, S.lens, lerp(1, 3.4, E.inCubic(dk))) : camA;
  wbBushBack(cam, t, { soft: 0.6 });
  applyCam(cam);
  // the wombat: it side-eyes him over its shoulder on "butt"; a scan line turns it x-ray from "Its" (head to rump)
  const gl = smooth(inv(c.glare, c.glare + 0.2, t)) * (1 - smooth(inv(c.lens_move, c.lens_move + 0.3, t)) * 0.7);
  const wo = { flip: true, lid: 0.25 + 0.25 * gl, look: -gl, brow: -gl, chew: t, headRot: -0.05 * gl };
  const x0 = WB_AW.x - 250 * WB_AW.s, x1 = WB_AW.x + 170 * WB_AW.s, sx = lerp(x0, x1, S.scan);
  wbWombat(ctx, WB_AW.x, WB_AW.y, WB_AW.s, wo);
  if (S.scan > 0.001) {
    ctx.save(); ctx.beginPath(); ctx.rect(x0 - 40, WB_AW.y - 330, sx - x0 + 40, 360); ctx.clip();
    wbWombat(ctx, WB_AW.x, WB_AW.y, WB_AW.s, Object.assign({}, wo, { glass: 1, gutPhase: t * 1.6 }));
    ctx.restore();
    if (S.scan < 0.999) paint(() => { line(ctx, sx, WB_AW.y - 280, sx, WB_AW.y, 6, '#BFF6FF'); });
    if (S.scan < 0.999) softDot(gctx, sx, WB_AW.y - 140, 100, '#7FE9FF', 0.45);
  }
  // him: crouched behind a tussock, leaning in, the magnifier in his left hand on its handle
  const ang = Math.atan2(0.42, 1);
  const hand = [S.lens[0] + Math.cos(ang) * 74 * 1.9, S.lens[1] + Math.sin(ang) * 74 * 1.9];
  let pose = Object.assign({}, WB_SIT, { lean: -0.3 });
  const st0 = { x: WB_AH.x, y: WB_AH.y, s: WB_AH.s };
  pose = ikReach(pose, 'L', ikLocal(st0, hand[0], hand[1]), 1);
  pose = armAt(pose, 'R', [86, -100], [62, -48]);
  pose.hand = 'open';
  const face = wbFace([[shot.start, WF.peer], [c.ring, WF.nod], [c.lens_move, WF.peer], [c.xray, WF.wow]], t);
  wbHero(cam, t, { ...st0, pose, face, headRot: -0.1 });
  applyCam(cam);
  wbTussock(760, 1790, 1.9, t, 21); wbTussock(860, 1800, 1.7, t, 22); wbTussock(660, 1800, 1.5, t, 23);
  // the dotted circle round its rump
  const rk = ramp(t, c.ring, c.ring + 0.3);
  if (rk > 0.01 && S.move < 0.05) paint(() => {
    ctx.save(); ctx.setLineDash([16, 12]); ctx.lineDashOffset = -t * 60;
    ctx.beginPath(); ctx.arc(S.rump[0] - 40, S.rump[1] - 6, 112, -Math.PI * 0.6, -Math.PI * 0.6 + Math.PI * 2 * rk);
    ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(255,255,255,0.92)'; ctx.stroke(); ctx.restore();
  });
  // the magnifier: its fur close; after the scan, the last part of its gut with the cubes in it, close
  wbMagnifier(ctx, S.lens[0], S.lens[1], 74, ang, { under: '#C9A877', fill: (cc) => {
    cc.save(); cc.scale(1.8, 1.8); cc.translate(-S.lens[0], -S.lens[1]);
    const xr = S.scan > 0.98 ? 1 : 0;
    if (xr) { cc.fillStyle = '#0B1C2E'; cc.fillRect(S.lens[0] - 120, S.lens[1] - 120, 240, 240); }
    wbWombat(cc, WB_AW.x, WB_AW.y, WB_AW.s, Object.assign({}, wo, xr ? { glass: 1, gutPhase: t * 1.6, cubesBig: 1 } : {}));
    cc.restore();
  } });
  screenSpace();
  const rs = toScreen(cam, S.rump[0] - 40, S.rump[1] - 150);
  wbTag('ROUND', clamp(rs[0], 240, 820), clamp(rs[1], 520, 1180), '#7FE9FF', popK(t, c.ring + 0.12, c.lens_move + 0.1), 50);
  const ls = toScreen(cam, S.lens[0], S.lens[1] - 130);
  wbTag('THE GUT', clamp(ls[0], 240, 820), clamp(ls[1] - 30, 520, 1180), '#FF9A3C', popK(t, c.gut, c.dive + 0.1) * (1 - dk), 46);
  wbMotes(t, 0.6 * (1 - dk), 7);
  const lz = toScreen(cam, S.lens[0], S.lens[1]);
  return { glow: 0.85, zblur: 0.2 * Math.sin(Math.PI * clamp(dk)), zcx: lz[0], zcy: lz[1] };
};

// ---------------------------------------------------------------- "See those two stiff stripes? Every squeeze, they pull in faster... and pinch corners."
SC.gut = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const sq = c.squeezes;
  const push = 1 + 0.05 * lt / D;
  ctx.save();
  const S = wbGutSection({ t, squeezes: sq, labels: popK(t, c.label_stiff, sq[0] + 0.05, 0.2, 0.15), arrows: popK(t, c.pull - 0.1, c.corners2_end + 0.2, 0.15, 0.2),
    corners: t > c.cube_done - 0.05 ? 1 : 0, cornerT: c.cube_done, soft: 0 });
  ctx.restore();
  void S;
  // the lens rim leaving the frame as we go through it
  const rimK = smooth(inv(0, 0.42, lt));
  if (rimK < 0.999) {
    screenSpace();
    const R = lerp(470, 1500, E.inCubic(rimK));
    ctx.beginPath(); ctx.arc(540, WBG.cy, R + 400, 0, Math.PI * 2); ctx.arc(540, WBG.cy, R, 0, Math.PI * 2, true); ctx.fillStyle = '#1A2630'; ctx.fill('evenodd');
    ctx.beginPath(); ctx.arc(540, WBG.cy, R, 0, Math.PI * 2); ctx.lineWidth = 60; ctx.strokeStyle = '#B88A3A'; ctx.stroke();
  }
  // him, watching from a corner window
  const pf = wbFace([[shot.start, WF.wow], [c.cube_done, WF.nod]], t);
  wbPortrait(188, 1192, 80, t, ramp(t, c.every - 0.1, c.every + 0.25), Object.assign({}, pf, { lookX: 0.8, lookY: -0.6 }));
  return { glow: 0.9, push: { k: push, cx: 540, cy: WBG.cy }, zblur: 0.16 * (1 - rimK), zcx: 540, zcy: WBG.cy };
};

// ---------------------------------------------------------------- "Why cubes? Wombats leave poop on rocks, like notes."
const WB_NW = { x: 648, s: 0.95 };   // the wombat on the rock (facing right: its rump to the left, where the cube goes)
const WB_NC = { x: 480 };            // the cube on the rock
function wbRockScene(cam, t, o = {}) {
  wbBushBack(cam, t, { soft: o.soft || 0.15, sunDX: 40, sunDY: -330 });
  applyCam(cam);
  wbCreek(t, o.splashT, { sx: o.sx, sy: o.sy });
  const top = wbRock(t);
  return top;
}
SC.notes = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 510, 1260, 1.2], [D, 540, 1236, 1.3]]);
  const top = wbRockScene(cam, t);
  // the wombat on top of the rock: at "poop" its rear dips and a cube pops out behind it; then it looks back, proud
  const plopK = ramp(t, c.plop1 - 0.12, c.plop1 + 0.05);
  const proud = smooth(inv(c.plop1 + 0.15, c.plop1 + 0.45, t));
  wbWombat(ctx, WB_NW.x, top.y(WB_NW.x), WB_NW.s, { flip: false, squash: 0.6 * Math.sin(Math.PI * plopK), lid: 0.35 + 0.1 * proud,
    look: -proud, smile: 0.7 * proud, chew: t, grass: 0 });
  // the cube and its note
  if (t > c.plop1 - 0.02) {
    const ck = E.outBack(clamp((t - c.plop1 + 0.02) / 0.18), 2.5);
    wbCube(ctx, WB_NC.x, top.y(WB_NC.x) - 20 * ck, 40 * ck, 0, { flag: ramp(t, c.note, c.note + 0.35), flagText: 'MINE.' });
  }
  // him on the left: a shrug on "Why cubes?", then he looks at the cube, then he reads the note
  const shrug = popK(t, c.why - 0.05, c.wombats1 + 0.1, 0.18, 0.25);
  let pose = Object.assign({}, POSES.stand);
  const st0 = { x: 222, y: 1716, s: 1.02 };
  pose = ikReach(pose, 'L', [lerp(-108, -150, shrug), lerp(-216, -300, shrug)], -1);
  pose = ikReach(pose, 'R', [lerp(108, 150, shrug), lerp(-216, -300, shrug)], -1);
  pose.hand = shrug > 0.4 ? 'spread' : 'open';
  const face = wbFace([[shot.start, WF.shrug], [c.plop1 + 0.05, WF.upR], [c.note + 0.05, WF.read]], t);
  wbHero(cam, t, { ...st0, pose, face, headRot: 0.05 * shrug - 0.04 * smooth(inv(c.note, c.note + 0.3, t)), noLegs: false });
  applyCam(cam);
  wbTussock(120, 1760, 1.5, t, 11); wbTussock(400, 1770, 1.2, t, 12);
  wbMotes(t, 0.7, 9);
  return { glow: 0.85 };
};

// ---------------------------------------------------------------- "Scientists think round notes... would roll off."
function wbBallPath(t) {
  const c = cu();
  const top = { y: (x) => WBB.rockTop + 8 * Math.pow((x - WBB.rockX) / (WBB.rockW / 2), 4) };
  const x0 = 822, r = 22;
  if (t < c.place) return null;
  if (t < c.go) {   // dropped in from above, a little squash, then still
    const k = clamp((t - c.place) / 0.18);
    return { x: x0, y: lerp(top.y(x0) - 260, top.y(x0) - r, E.inQuad(k)), spin: 0, sq: wbSince(t, c.place + 0.18, 14) };
  }
  if (t < c.edge) {   // rolls right along the top, speeding up
    const u = (t - c.go) / (c.edge - c.go), x = lerp(x0, 942, u * u);
    return { x, y: top.y(x) - r, spin: (x - x0) / r, sq: 0 };
  }
  const L = [1012, WBB.rockTop + 196];   // the ledge
  if (t < c.bonk1) {   // falls off the edge to the ledge
    const u = (t - c.edge) / (c.bonk1 - c.edge);
    return { x: lerp(942, L[0], u), y: lerp(top.y(942) - r, L[1] - r, u * u), spin: (942 - x0) / r + u * 4, sq: 0 };
  }
  if (t < c.splash) {   // bonk, bounce out to the creek
    const u = (t - c.bonk1) / (c.splash - c.bonk1);
    return { x: lerp(L[0], 1076, u), y: lerp(L[1] - r, WBB.creekY + 40, u) - 140 * Math.sin(Math.PI * u) * (1 - u * 0.3), spin: 6 + u * 5, sq: wbSince(t, c.bonk1, 16) };
  }
  return null;
}
SC.roll = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(t, [[shot.start, 740, 1300, 1.5], [c.edge, 770, 1320, 1.52], [c.splash, 800, 1380, 1.5], [shot.end, 790, 1350, 1.55]]);
  const top = wbRockScene(cam, t, { splashT: c.splash, sx: 1080, sy: WBB.creekY + 60 });
  // the cube with its note stays put
  wbCube(ctx, WB_NC.x, top.y(WB_NC.x) - 20, 40, 0, { flag: 1, flagText: 'MINE.' });
  // the wombat watches the ball go; smug at "off"
  const b = wbBallPath(t);
  const follow = b ? clamp((b.x - 680) / 300, -1, 1) : 1;
  const smug = smooth(inv(c.smug, c.smug + 0.25, t));
  wbWombat(ctx, 676, top.y(676), 0.95, { flip: false, look: lerp(follow, 0, smug), lid: lerp(0.3, 0.55, smug), smile: smug, brow: 0.3 * smug,
    headRot: 0.05 * smug, chew: t });
  // the ball drops onto the rock from above (his test), squashes, sits... then rolls
  if (b) wbBall(ctx, b.x, b.y + 4 * b.sq, 22 * (1 + 0.1 * b.sq), b.spin);
  // the splash: a crown of drops
  if (t > c.splash) splashDrops(1080, WBB.creekY + 50, c.splash, t, 26, 4, 0.6);
  screenSpace();
  const ts = toScreen(cam, 830, top.y(830) - 170);
  wbTag('ROUND', ts[0], ts[1], '#7FE9FF', popK(t, c.round - 0.05, c.edge + 0.1), 40);
  wbMotes(t, 0.6, 13);
  return { glow: 0.85 };
};

// ---------------------------------------------------------------- "Factories need molds or knives for cubes."
function wbPulseDown(t, t0) { return t < t0 - 0.1 ? 0 : (t < t0 ? E.inQuad((t - t0 + 0.1) / 0.1) : (t < t0 + 0.18 ? 1 : 1 - E.inOutSine(clamp((t - t0 - 0.18) / 0.45)))); }
SC.factory = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 540, 1110, 1.16], [D, 540, 1096, 1.24]]);
  wbFactoryBack(cam, t);
  applyCam(cam);
  // him behind the belt: hard hat, clipboard; he looks at each machine as it works
  let pose = Object.assign({}, POSES.stand);
  const st0 = { x: 540, y: 1430, s: 1.0 };
  pose = ikReach(pose, 'L', [-46, -290], -1);
  pose = ikReach(pose, 'R', [96, -236], 1);
  pose.hand = 'open';
  const face = wbFace([[shot.start, WF.nod], [c.molds - 0.15, WF.boss], [c.knives - 0.1, WF.bossR], [c.cubes3, WF.nod]], t);
  wbHero(cam, t, { ...st0, pose, face, hat: 1, headRot: -0.06 * smooth(inv(c.molds - 0.2, c.molds, t)) + 0.12 * smooth(inv(c.knives - 0.2, c.knives, t)),
    post: (cc, r, st) => wbRigSpace(cc, st, (q) => wbClipboard(q, -46 + 4, -290 + 30, 0.9, 0.1)) });
  applyCam(cam);
  // the press and the blade
  const pd = wbPulseDown(t, c.press), bd = wbPulseDown(t, c.chop);
  const pBot = wbPress(WBF.pressX, t, pd);
  const bBot = wbBlade(WBF.bladeX, t, bd);
  wbBelt(t, 90);
  // cubes on the belt riding right; the press makes one on "molds", the blade cuts one off the bar on "knives"
  const bt = WBF.beltY - 14;
  for (let i = 0; i < 8; i++) {
    const x = ((i * 190 + (t - shot.start) * 90) % 1520) - 260;
    if (Math.abs(x - WBF.pressX) < 70 || Math.abs(x - WBF.bladeX) < 70) continue;
    wbFactoryCube(x, bt - 26, 52);
  }
  if (t > c.press) wbFactoryCube(WBF.pressX + (t - c.press) * 90, bt - 26, 52);
  else { rrect(ctx, WBF.pressX - 34, bt - 40, 68, 40, 18); ctx.fillStyle = '#8C97AC'; ctx.fill(); }   // a lump waiting for the mould
  // the bar under the blade and the cut cube
  rrect(ctx, WBF.bladeX - 230, bt - 52, 200 + (t > c.chop ? 0 : 60), 52, 6); ctx.fillStyle = '#8C97AC'; ctx.fill();
  if (t > c.chop) wbFactoryCube(WBF.bladeX + 30 + (t - c.chop) * 90, bt - 26, 52);
  // sparks and a hiss puff on each hit
  for (const [t0, x] of [[c.press, WBF.pressX], [c.chop, WBF.bladeX]]) {
    const k = popK(t, t0, t0 + 0.35, 0.03, 0.2);
    if (k > 0.01) { shockLines(x, bt - 40, 120, k, 10, '#FFE9A8', 3); softDot(gctx, x, bt - 30, 90, '#FFD08A', 0.8 * k); }
  }
  void pBot; void bBot;
  screenSpace();
  const pt = toScreen(cam, WBF.pressX, 860), bt2 = toScreen(cam, WBF.bladeX, 900);
  wbTag('MOLD', clamp(pt[0], 200, 860), pt[1], '#8FB8FF', popK(t, c.molds, shot.end + 1), 42);
  wbTag('KNIFE', clamp(bt2[0], 200, 860), bt2[1], '#8FB8FF', popK(t, c.knives, shot.end + 1), 42);
  return { glow: 0.8 };
};

// ---------------------------------------------------------------- "Wombats? Up to a hundred a day... from salad."
SC.belt = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 500, 1140, 1.28], [D, 486, 1130, 1.34]]);
  wbFactoryBack(cam, t, { soft: 0.4 });
  applyCam(cam);
  // him on the left, behind the belt: the cubes ride past him; the clipboard drops on the crunch
  let pose = Object.assign({}, POSES.stand);
  const st0 = { x: 176, y: 1430, s: 1.0 };
  const dropK = smooth(inv(c.crunch, c.crunch + 0.2, t));
  pose = ikReach(pose, 'L', [lerp(-46, -100, dropK), lerp(-290, -200, dropK)], -1);
  pose.hand = 'open';
  const face = wbFace([[shot.start, Object.assign({}, WF.peer, { lookX: 1 })], [c.hundred, Object.assign({}, WF.wow, { lookX: 0.9 })], [c.count100, Object.assign({}, WF.gape, { lookX: 0.8 })]], t);
  wbHero(cam, t, { ...st0, pose, face, hat: 1, headRot: 0.08,
    post: (cc, r, st) => { if (dropK < 0.99) wbRigSpace(cc, st, (q) => wbClipboard(q, -46, -260 + 260 * dropK * dropK, 0.9, 0.1 + 1.2 * dropK)); } });
  applyCam(cam);
  wbBelt(t, 0);   // the belt has stopped: this machine needs none
  const bt = WBF.beltY - 14;
  // the cubes it makes: each flies out behind it and lands on a growing pyramid (4, 3, 2), the counter with it
  const WX = 470, rearX = WX - 150 * 1.05, CS = 40;
  const pile = [];
  for (const [row, n] of [[0, 4], [1, 3], [2, 2]]) for (let k = 0; k < n; k++) pile.push([150 + row * 21 + k * 42, bt - CS / 2 - row * (CS - 2)]);
  c.plops.forEach((tp, i) => {
    if (t < tp || i >= pile.length) return;
    const u = clamp((t - tp) / 0.22), to = pile[i], from = [rearX - 10, bt - 70];
    const x = lerp(from[0], to[0], u), y = lerp(from[1], to[1], u) - 120 * Math.sin(Math.PI * u);
    const land = wbSince(t, tp + 0.22, 16);
    wbCube(ctx, x, y + 6 * land, CS * (1 + 0.12 * land), u < 1 ? -2.6 * u : 0, {});
  });
  // the wombat: standing still on the belt in its hard hat, munching; a little hop of its rear on every cube
  const hatK = ramp(t, c.hat - 0.25, c.hat + 0.05, E.outBounce || E.outBack);
  const plopNow = c.plops.reduce((m, tp) => Math.max(m, wbSince(t, tp, 12)), 0);
  const bite = t > c.crunch ? 1 : 0;
  wbWombat(ctx, WX, bt, 1.05, { flip: false, hat: hatK, lid: 0.4, chew: t, squash: 0.35 * plopNow,
    jaw: 0.6 * popK(t, c.crunch - 0.12, c.crunch + 0.2, 0.08, 0.15), smile: 0.3 });
  // its lettuce (at its mouth)
  const mx = WX + (140 + 63) * 1.05, my = bt - (122 - 32) * 1.05;
  wbLettuce(ctx, mx + 8, my + 10, 0.85, 0.5 + 0.08 * Math.sin(t * 13), bite);
  // the counter
  screenSpace();
  let n = 0;
  c.plops.forEach((tp, i) => { if (t >= tp) n = Math.round(100 * (i + 1) / c.plops.length); });
  if (t >= c.count100) n = 100;
  wbCounter(540, 560, n, ramp(t, c.up - 0.25, c.up), t);
  if (t > c.count100) { const k = popK(t, c.count100, c.count100 + 0.5, 0.05, 0.3); softDot(gctx, 540, 590, 260, '#FFD447', 0.6 * k); }
  return { glow: 0.8, push: { k: 1 + 0.04 * wbSince(t, c.count100, 6), cx: 540, cy: 560 } };
};

// ---------------------------------------------------------------- "So... found a cute little cube on a log?"
SC.button = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, DUR = TL.duration;
  const end = hookCam(shot.end - DUR);
  const cam = camKeys(t, [[shot.start, 540, 1300, 1.95], [c.pick, 528, 1320, 2.2], [c.lift + 0.1, 520, 1334, 2.45], [shot.end, end.x, end.y, end.zoom]]);
  wbBushBack(cam, t, { soft: 0.8 });
  applyCam(cam);
  // the wombat watches from behind the log, then ducks out of sight before the loop
  const rise = 1 - smooth(inv(c.lift + 0.2, c.lift + 0.75, t));
  wbLogWombat(t, rise, { lid: 0.55, look: 0.5 });
  wbLog(t);
  // the cube on the log until he takes it
  const CUBE = [598, 1286];
  const grab = smooth(inv(c.pick, c.pick + 0.35, t));
  if (t < c.pick + 0.32) wbCube(ctx, CUBE[0], CUBE[1], 28, 0, {});
  // his arm: reaches up and back to the cube, then brings it to his lips (into hookA at negative time)
  const st0 = { x: WBB.heroX, y: WBB.heroY, s: 1 };
  const cl = ikLocal(st0, CUBE[0] - 10, CUBE[1] + 30);
  const reachE = [150, -170], reachW = [cl[0], cl[1]];
  const lift = smooth(inv(c.lift - 0.25, shot.end, t));
  const back = hookA(shot.end - DUR);
  const outK = popK(t, c.pick - 0.25, c.lift - 0.05, 0.3, 0.3);
  let e = [lerp(WB_LOW_E[0] + 10, reachE[0], outK), lerp(WB_LOW_E[1] + 40, reachE[1], outK)];
  let w = [lerp(WB_LOW_W[0] + 30, reachW[0], outK), lerp(WB_LOW_W[1] + 70, reachW[1], outK)];
  e = [lerp(e[0], back.hand.e[0], lift), lerp(e[1], back.hand.e[1], lift)];
  w = [lerp(w[0], back.hand.w[0], lift), lerp(w[1], back.hand.w[1], lift)];
  let face = wbFace([[shot.start, WF.deadpan], [c.so + 0.1, WF.upR], [c.look_l, WF.shiftyL], [c.look_r, WF.shiftyR], [c.cube2, WF.sneaky]], t);
  face = lerpFace(face, back.face, smooth(inv(c.lift + 0.1, shot.end, t)));
  const headRot = -0.07 * popK(t, c.look_l, c.look_r, 0.12, 0.12) + 0.07 * popK(t, c.look_r, c.cube2, 0.12, 0.15);
  wbSitHero(cam, t, { hand: { e, w }, face, holding: grab > 0.5, headRot, overHead: true });
  applyCam(cam);
  wbGrassBand(t, 1700, 230, 820, 1.75, 4);
  wbMotes(t, 0.8, 5);
  return { glow: 0.85 };
};

// ---------------------------------------------------------------- the cover: the cube at his lips, the wombat beside him
SC.cover = (lt, t) => {
  const tt = 2.75;
  hookDraw(tt, tt);
  screenSpace();
  bigWord('WOMBAT', 540, 560, 170, '#FFFFFF', 1, -0.04);
  bigWord('POOP CUBES?!', 540, 1350, 150, '#FFD447', 1, 0.03);
  return { glow: 0.85, noCaptions: true };
};

function initScenes2() {
  initBush();
  initFactory();
}
