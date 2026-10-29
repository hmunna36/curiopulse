// Would SATURN Float in Your Bathtub? 🪐 Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the
// shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;
const bumpAt = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);
const sbL2 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
const sbArmMix = (a, b, k) => ({ e: sbL2(a.e, b.e, k), w: sbL2(a.w, b.w, k) });

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the cosmic bath: the Sun low on the upper left is the key (warm), the Milky Way's blue is the rim from the right; the
// big close-up head gets the frontal key and the softer form shadow (venus-day, jupiter-no-ground: no brown cheek patches)
const BATH_LIGHT = { ...LIGHTS.night, key: [-0.5, -0.55, 0.66], keyTint: [1.12, 1.04, 0.92], shadowTint: [0.62, 0.66, 1.0], shadowDeep: 1.3,
  rimFrom: [0.85, -0.3], rim: [0.55, 0.74, 1.0], rimAmt: 1.15, pool: 0.45, poolTint: [0.32, 0.35, 0.72], halo: 0.12,
  haloColor: [0.62, 0.76, 1.0], form: 0.8, toonAt: 0.32, cast: 0.45 };
const TANK_LIGHT = { ...LIGHTS.water, pool: 0.25, form: 0.6, cast: 0.5, rimAmt: 0.5, halo: 0 };
setLights({ hook: BATH_LIGHT, cup: BATH_LIGHT, why: BATH_LIGHT, planets: TANK_LIGHT, catch: TANK_LIGHT, fizz: BATH_LIGHT,
  rings: BATH_LIGHT, button: BATH_LIGHT, loop: BATH_LIGHT, cover: BATH_LIGHT });

// ---------------------------------------------------------------- small graphics (screen space)
function tagPill(txt, x, y, col, k, size = 40, ink = '#0B0B1A') {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + size * 0.9, h = size * 1.5;
  rrect(ctx, -w / 2 - 4, -h / 2 - 4, w + 8, h + 8, h / 2 + 4); ctx.fillStyle = '#0B0B1A'; ctx.fill();
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = col; ctx.fill();
  ctx.fillStyle = ink; ctx.fillText(txt, 0, 2);
  ctx.restore();
}
function burstWord(txt, x, y, r, col, k, rot = -0.08, size = 90) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.4);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const star = (R, fill) => { ctx.beginPath(); for (let i = 0; i < 22; i++) { const a = (i / 22) * Math.PI * 2, rr = i % 2 ? R * 0.72 : R; ctx.lineTo(Math.cos(a) * rr * 1.3, Math.sin(a) * rr); } ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); };
  star(r + 9, '#0B0B1A'); star(r, col);
  ctx.font = `400 ${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = 9; ctx.strokeStyle = '#0B0B1A'; ctx.strokeText(txt, 0, 5); ctx.fillStyle = '#FFFFFF'; ctx.fillText(txt, 0, 5);
  ctx.restore();
}
function tickBadge(x, y, r, k, ok = true) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  circle(ctx, 0, 0, r + 6, '#0B0B1A'); circle(ctx, 0, 0, r, ok ? '#12B25C' : '#E5484D');
  ctx.lineWidth = r * 0.24; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#FFFFFF'; ctx.beginPath();
  if (ok) { ctx.moveTo(-r * 0.45, 0); ctx.lineTo(-r * 0.1, r * 0.36); ctx.lineTo(r * 0.5, -r * 0.34); }
  else { ctx.moveTo(-r * 0.36, -r * 0.36); ctx.lineTo(r * 0.36, r * 0.36); ctx.moveTo(r * 0.36, -r * 0.36); ctx.lineTo(-r * 0.36, r * 0.36); }
  ctx.stroke(); ctx.restore();
}
// a puff of cloud (screen or world space: draws in the current transform), k 0..1 its life
function cloudPuff(x, y, s, k, seed = 1, col = '#F2E2B8') {
  if (k <= 0 || k >= 1) return;
  paint(() => {
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + seed, d = s * (14 + 40 * E.outCubic(k)) * (0.7 + 0.5 * hash(i * 3.1 + seed));
      circle(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d * 0.7, s * (12 + 10 * hash(i + seed)) * (1 - 0.6 * k), rgba(col, 0.9 * (1 - k)));
    }
  });
}

// ================================================================ the hook (valid at negative time: the loop shot plays its start)
const SAT_R = 80;                       // Saturn's globe in the front shots (world units): a little wider than his head
const SAT_HOLD = [662, 1166];           // where he holds it (the globe's centre): under his chin, to his left
const SAT_X = 702, SAT_WY = 1302;       // where it floats: the rings' centre on the water
const ARM = {
  holdL: { e: [-40, -96], w: [70, -148] }, holdR: { e: [168, -96], w: [118, -150] },        // the hands behind the globe
  liftL: { e: [-60, -100], w: [10, -110] }, liftR: { e: [150, -96], w: [140, -104] },
  dropL: { e: [-36, -134], w: [24, -236] }, dropR: { e: [162, -134], w: [176, -236] },
  rimL: { e: [-124, -118], w: [-180, -150] }, rimR: { e: [128, -116], w: [184, -150] },
  cheerL: { e: [-140, -246], w: [-104, -346] }, cheerR: { e: [140, -246], w: [104, -346] },
  restL: { e: [-110, -112], w: [-140, -60] }, restR: { e: [110, -112], w: [140, -60] },
};
// where Saturn is during the hook: {mode: 'held' | 'fall' | 'under' | 'float', p: [x, y] globe centre, dy: float offset}
function hookSat(tt) {
  const c = cu();
  const fallT = c.splash - c.let_go;
  if (tt < 0) { const k = ramp(tt, -0.47, -0.04, E.outCubic); return { mode: 'held', p: [SAT_HOLD[0], SAT_HOLD[1] + 300 * (1 - k)] }; }
  if (tt < c.let_go) { const lift = -10 * Math.sin(Math.PI * ramp(tt, 0.1, 0.55, (x) => x)); return { mode: 'held', p: [SAT_HOLD[0], SAT_HOLD[1] + lift] }; }
  if (tt < c.splash) {
    const u = (tt - c.let_go) / fallT, yEnd = SAT_WY + 0.255 * SAT_R * 0.92 + 30;
    return { mode: 'fall', p: [SAT_HOLD[0] + (SAT_X - SAT_HOLD[0]) * u, SAT_HOLD[1] + (yEnd - SAT_HOLD[1]) * u * u], rot: 0.25 * u };
  }
  if (tt < c.pop) return { mode: 'under' };
  const u = tt - c.pop;
  let dy;
  if (u < 0.12) dy = lerp(70, -48, E.outCubic(u / 0.12));
  else dy = -48 * Math.exp(-(u - 0.12) * 4.2) * Math.cos((u - 0.12) * 10.5);
  return { mode: 'float', dy };
}
function hookA(tt) {
  const c = cu();
  let armL = ARM.holdL, armR = ARM.holdR;
  if (tt < 0) { const k = ramp(tt, -0.47, -0.04, E.outCubic); armL = sbArmMix(ARM.liftL, ARM.holdL, k); armR = sbArmMix(ARM.liftR, ARM.holdR, k); }
  const drop = ramp(tt, c.let_go, c.let_go + 0.16, E.outCubic);
  armL = sbArmMix(armL, ARM.dropL, drop); armR = sbArmMix(armR, ARM.dropR, drop);
  const peek = ramp(tt, c.peek - 0.1, c.peek + 0.3, E.inOutCubic);
  armL = sbArmMix(armL, ARM.rimL, peek); armR = sbArmMix(armR, ARM.rimR, peek);
  const cheer = ramp(tt, c.pop + 0.08, c.pop + 0.3, E.outBack) * (1 - ramp(tt, c.giant, c.giant + 0.5, E.inOutCubic));
  armL = sbArmMix(armL, ARM.cheerL, cheer); armR = sbArmMix(armR, ARM.cheerR, cheer);
  armL = sbArmMix(armL, ARM.restL, ramp(tt, c.giant, c.giant + 0.5, E.inOutCubic)); armR = sbArmMix(armR, ARM.restR, ramp(tt, c.giant, c.giant + 0.5, E.inOutCubic));
  let face = SBF.mischief;
  face = lerpFace(face, { ...SBF.mischief, lookX: 0.5, lookY: 0.9 }, ramp(tt, c.bath - 0.1, c.bath + 0.15));
  face = lerpFace(face, SBF.drop, ramp(tt, c.let_go, c.let_go + 0.1));
  face = lerpFace(face, SBF.peek, ramp(tt, c.peek - 0.05, c.peek + 0.2));
  face = lerpFace(face, SBF.delight, ramp(tt, c.pop + 0.02, c.pop + 0.12));
  face = lerpFace(face, SBF.proud, ramp(tt, c.giant, c.giant + 0.4));
  face = lerpFace(face, { ...SBF.proud, lookX: -0.6, lookY: 0.7 }, ramp(tt, c.rubber - 0.1, c.rubber + 0.2));
  const jolt = bumpAt(tt, c.pop, 8);
  return {
    armL, armR, face,
    lean: 0.1 * peek * (1 - ramp(tt, c.pop, c.pop + 0.15)) - 0.06 * jolt,
    headDY: 8 * peek * (1 - ramp(tt, c.pop, c.pop + 0.15)) - 10 * jolt, headRot: 0.04 * Math.sin(tt * 2.2) * (1 - peek) + 0.06 * peek * (1 - ramp(tt, c.pop, c.pop + 0.2)),
    handL: drop > 0.5 && peek < 0.5 ? 'spread' : 'open', handR: drop > 0.5 && peek < 0.5 ? 'spread' : 'open',
  };
}
// the duck in the hook: it watches the drop, does a double take at Saturn, and bobs in step with it
function hookDuck(tt) {
  const c = cu();
  const bob = 3.5 * Math.sin(tt * loopW(2.2));
  const dt = tt - c.double_take;
  let flip = false, look = 0;
  if (tt > c.splash) look = 0.6;
  if (dt > 0) flip = dt < 0.18 || dt > 0.42;        // looks at Saturn, back at us, at Saturn again (a 6-frame hold each)
  const sq = popK(tt, c.duck_squeak, c.duck_squeak + 0.18, 0.04, 0.1);
  return { x: 396, y: 1342, s: 0.62, bobY: bob, flip, look: flip ? 0 : look, squeak: sq, lid: dt > 0.42 };
}
const HOOK_CAM0 = [600, 1100, 2.1];
function hookCam(tt) {
  const c = cu();
  const k = camKeys(tt, [[-0.5, ...HOOK_CAM0], [0, ...HOOK_CAM0], [c.let_go, 602, 1104, 2.16], [c.splash, 612, 1150, 2.02],
    [c.peek + 0.3, 616, 1176, 2.0], [c.pop, 620, 1176, 1.96], [c.pull_back, 612, 1176, 1.9], [c.duck - 0.1, 545, 1180, 0.88],
    [c.duck_end + 0.5, 540, 1188, 0.84]], E.inOutCubic);
  const sh = bumpAt(tt, c.splash, 11) + 0.8 * bumpAt(tt, c.pop, 10);
  k.y += 7 * sh * Math.sin(tt * 57); k.x += 5 * sh * Math.sin(tt * 43);
  k.rot = -0.02 * ramp(tt, c.pull_back, c.duck_end + 0.5, E.inOutCubic);
  return k;
}
function satFaceAt(tt) {
  const c = cu();
  if (tt < c.let_go) return { mood: 'smug', look: [-0.6, 0.1], blink: 0 };
  if (tt < c.pop) return { mood: 'eek', look: [0, 1], blink: 0 };
  if (tt < c.pop + 0.35) return { mood: 'eek', look: [0, -0.4], blink: 0 };
  if (tt < c.like) return { mood: 'happy', look: [0, 0], blink: 0 };
  return { mood: 'smug', look: [-0.8, 0.2], blink: popK(tt, c.duck_end + 0.2, c.duck_end + 0.32, 0.03, 0.05) };
}
function hookDraw(cam, tt, t, o = {}) {
  const c = cu(), A = hookA(tt), S = hookSat(tt), F = satFaceAt(tt);
  const sat = S.mode === 'float' ? { x: SAT_X, wy: SAT_WY, R: SAT_R, dy: S.dy, face: F.mood, look: F.look, blink: F.blink, ringA: clamp(1 - S.dy / 26) } : null;
  if (sat) sat.bob = S.dy + 3.5 * Math.sin(tt * loopW(2.2)) * ramp(tt, c.pop + 0.6, c.pop + 1.2);
  const res = sbBathDraw(cam, t, A, {
    duck: hookDuck(tt),
    sat: sat ? { ...sat, bob: sat.bob } : null,
    ripplesAt: [[SAT_X, SAT_WY, 70, c.splash, 1], [SAT_X, SAT_WY, 60, c.pop, 0.9]],
    over: () => {
      if (S.mode === 'held' || S.mode === 'fall') {
        const p = S.p, R = SAT_R;
        ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(S.rot || 0); ctx.translate(-p[0], -p[1]);
        sbRingsDraw(p[0], p[1] - R * 0.02, R, 'back');
        sbGlobeDraw(p[0], p[1], R);
        sbSatFace(p[0], p[1] - R * 0.06, R, F.mood, { look: F.look, blink: F.blink });
        sbRingsDraw(p[0], p[1] - R * 0.02, R, 'front');
        ctx.restore();
        // his fingers over the globe's lower sides while he holds it
      }
      sbSplash(SAT_X, SAT_WY, t, c.splash, { s: 1.3, seed: 5, n: 30 });
      sbSplash(SAT_X, SAT_WY, t, c.pop, { s: 0.8, seed: 9, n: 18 });
      sbSurfacePops(SAT_X, SAT_WY, tt, c.splash + 0.25, c.pop - 0.1);
    },
  });
  return res;
}
// his hands again, over the globe he holds (on the main canvas, after him: they are in front of it)
function heroHandsOver(A, t) {
  const pose = sbHeroRig(A), r = rig(pose);
  ctx.save(); ctx.translate(SBH.x, SBH.y); ctx.scale(SBH.s, SBH.s);
  actor(() => { for (const [s2, k] of [[-1, 'L'], [1, 'R']]) drawHand(ctx, r['wr' + k], r['armDir' + k], 'open', SBPAL, s2, t); });
  ctx.restore();
}

SC.hook = (lt, t, shot) => {
  const cam = hookCam(t);
  hookDraw(cam, t, t);
  return { glow: 0.85 };
};
SC.loop = (lt, t, shot) => {
  const tt = t - TLd.duration;                       // -0.47 .. 0: the frames just before frame 1
  hookDraw(hookCam(tt), tt, t);
  return { glow: 0.85 };
};

// ================================================================ the cup: cup for cup, Saturn is lighter
// He scoops a cup of Saturn off its top, then holds both cups out on his palms: a human balance. On "LIGHTER" the Saturn
// cup floats UP and the cup of bathwater sinks.
const ARMC = {
  waterL: { e: [-140, -112], w: [-176, -176] },                 // the cup of bathwater on his left palm, low
  upR: { e: [176, -118], w: [158, -184] },                      // the empty cup, ready
  dipR: { e: [178, -104], w: [124, -104] },                     // into Saturn's top
  fullR: { e: [180, -126], w: [170, -206] },                    // lifted, heaped
  scaleL: { e: [-150, -150], w: [-206, -200] }, scaleR: { e: [150, -150], w: [206, -200] },
};
SC.cup = (lt, t, shot) => {
  const c = cu();
  let armR = sbArmMix(ARMC.upR, ARMC.dipR, ramp(t, c.dip, c.dip + 0.3, E.inOutCubic));
  armR = sbArmMix(armR, ARMC.fullR, ramp(t, c.lift_cup - 0.05, c.lift_cup + 0.3, E.outCubic));
  let armL = ARMC.waterL;
  const out = ramp(t, c.place - 0.25, c.place + 0.15, E.inOutCubic);
  armR = sbArmMix(armR, ARMC.scaleR, out); armL = sbArmMix(armL, ARMC.scaleL, out);
  // the balance: a spring; the Saturn side (his left hand is the water side) swings up
  const u = t - c.tip, tip = u < 0 ? 0 : 1 - Math.exp(-u * 5.5) * Math.cos(u * 12);
  armR = { e: [armR.e[0] + 4 * tip, armR.e[1] - 46 * tip], w: [armR.w[0] - 6 * tip, armR.w[1] - 96 * tip] };
  armL = { e: [armL.e[0], armL.e[1] + 26 * tip], w: [armL.w[0] + 6 * tip, armL.w[1] + 62 * tip] };
  let face = { ...SBF.study, lookX: 0.7, lookY: 0.9 };
  face = lerpFace(face, { ...SBF.study, lookX: 0.6, lookY: -0.2 }, ramp(t, c.lift_cup, c.lift_cup + 0.2));
  face = lerpFace(face, SBF.wow, ramp(t, c.tip + 0.04, c.tip + 0.18));
  face = lerpFace(face, { ...SBF.wow, lookX: 0.7, lookY: -0.8 }, ramp(t, c.tip + 0.3, c.tip + 0.5));
  face = lerpFace(face, { ...SBF.study, lookX: -0.8, lookY: 0.7, browTilt: 0.9 }, ramp(t, c.cup2 - 0.1, c.cup2 + 0.2));
  const filled = t >= c.lift_cup - 0.02;
  const A = {
    armL, armR, face, lean: -0.03 * tip, headRot: -0.06 * tip, headDY: -3 * tip, overHands: '',
    held: (lc, r, st) => {
      const wl = sbW(st, r.wrL), wr = sbW(st, r.wrR);
      // the cups sit on his palms
      sbCup(lc, wl[0] + 4, wl[1] - 18, 1.25, 'water', { tilt: 0.05 * Math.sin(t * 3) + 0.06 * tip });
      sbCup(lc, wr[0] - 4, wr[1] - 18, 1.25, filled ? 'saturn' : null, { tilt: -0.05 * Math.sin(t * 3) - 0.05 * tip });
    },
  };
  const cam = camKeys(t, [[shot.start, 650, 1178, 1.72], [c.lift_cup, 640, 1166, 1.68], [c.place + 0.1, 548, 1094, 1.3], [shot.end, 546, 1092, 1.34]], E.inOutCubic);
  sbBathDraw(cam, t, A, {
    duck: { x: 396, y: 1342, s: 0.62, bobY: 3.5 * Math.sin(t * loopW(2.2)), look: 0.6 },
    sat: { x: SAT_X, wy: SAT_WY, R: SAT_R, face: t > c.tip + 0.1 ? 'happy' : 'smug', look: t > c.lift_cup ? [-0.6, -0.8] : [-0.5, -0.9],
      sy: 1 - 0.07 * popK(t, c.dip + 0.12, c.lift_cup + 0.1, 0.1, 0.15) },
    over: () => {
      // the scoop lifts a swirl off Saturn's top
      const k = ramp(t, c.lift_cup - 0.05, c.lift_cup + 0.45, (x) => x);
      if (k > 0 && k < 1) cloudPuff(SAT_X - 8, SAT_WY - SAT_R * 0.85, 1.2, k, 3, '#EAD7A6');
    },
  });
  // the tag over the Saturn cup, once the beam swings
  const pr = rig(sbHeroRig(A)), wS = toScreen(cam, ...sbW(SBH, pr.wrR));
  tagPill('30% LIGHTER', clamp(wS[0] - 60, 260, 760), wS[1] - 250, '#4DFFB4', ramp(t, c.tag30, c.tag30 + 0.25, (x) => x), 50);
  return { glow: 0.85 };
};

// ================================================================ why: not rock, mostly gas
// his right fist knocks on Saturn's upper left (drawn again IN FRONT of the planet: it floats nearer the camera than he
// sits), then sinks into it like fluff (POOF), comes out with fluff on the knuckles; then the scan wipe
const ARMW = {
  readyR: { e: [150, -112], w: [96, -164] }, knockR: { e: [134, -126], w: [66, -112] },
  inR: { e: [146, -118], w: [96, -90] }, outR: { e: [150, -118], w: [104, -170] },
};
function whyArm(t) {
  const c = cu();
  const tap = popK(t, c.knock, c.knock + 0.16, 0.07, 0.09);
  let a = sbArmMix(ARMW.readyR, ARMW.knockR, tap);
  a = sbArmMix(a, ARMW.knockR, ramp(t, c.rock - 0.12, c.rock - 0.02, E.outCubic));
  a = sbArmMix(a, ARMW.inR, ramp(t, c.sink_fist - 0.04, c.sink_fist + 0.14, E.outCubic));
  a = sbArmMix(a, ARMW.outR, ramp(t, c.scan + 0.05, c.scan + 0.35, E.inOutCubic));
  return a;
}
SC.why = (lt, t, shot) => {
  const c = cu();
  const armR = whyArm(t);
  const inK = ramp(t, c.sink_fist - 0.04, c.sink_fist + 0.14) * (1 - ramp(t, c.scan + 0.05, c.scan + 0.3));
  let face = { ...SBF.study, lookX: 0.8, lookY: 0.8 };
  face = lerpFace(face, SBF.shock, ramp(t, c.sink_fist, c.sink_fist + 0.1));
  face = lerpFace(face, { ...SBF.wow, lookX: 0.8, lookY: 0.9 }, ramp(t, c.scan + 0.2, c.scan + 0.4));
  const A = { armL: ARM.restL, armR, face, headDY: -6 * bumpAt(t, c.sink_fist, 7), headRot: -0.05 * ramp(t, c.sink_fist, c.sink_fist + 0.2), handR: 'open' };
  const cam = camKeys(t, [[shot.start, 640, 1214, 2.05], [c.scan, 660, 1250, 2.3], [shot.end, 664, 1254, 2.38]], E.inOutCubic);
  const glass = ramp(t, c.scan, c.scan + 0.6, (x) => x);
  const wob = bumpAt(t, c.sink_fist, 6) * Math.sin((t - c.sink_fist) * 30);
  sbBathDraw(cam, t, A, {
    bg: { sun: false },                                   // the Sun stays out of this close-up: it sat behind his head
    duck: { x: 300, y: 1342, s: 0.62, bobY: 3.5 * Math.sin(t * loopW(2.2)), look: 0.6 },
    sat: { x: SAT_X, wy: SAT_WY, R: SAT_R, face: t < c.sink_fist ? 'smug' : t < c.scan + 0.3 ? 'eek' : 'happy', look: [-0.8, -0.2], glass,
      sx: 1 + 0.06 * wob, sy: 1 - 0.05 * wob },
    over: () => {
      // his forearm and fist again, in front of the planet, while he knocks and while it is in
      const pr = rig(sbHeroRig(A)), el = sbW(SBH, pr.elR), wr = sbW(SBH, pr.wrR), d = pr.armDirR;
      if (t < c.scan + 0.3) {
        actor(() => {
          line(ctx, lerp(el[0], wr[0], 0.35), lerp(el[1], wr[1], 0.35), wr[0], wr[1], 38 * SBH.s, SBPAL.skin);
          ctx.save(); ctx.translate(SBH.x, SBH.y); ctx.scale(SBH.s, SBH.s); drawHand(ctx, pr.wrR, d, 'open', SBPAL, 1, t); ctx.restore();
        });
        // fluff closes over the fist as it sinks in
        if (inK > 0.02) paint(() => {
          const hx = wr[0] + d[0] * 14 * SBH.s, hy = wr[1] + d[1] * 14 * SBH.s;
          for (let i = 0; i < 9; i++) {
            const a = i / 9 * Math.PI * 2, rr = (16 + 10 * hash(i * 2.1)) * inK;
            circle(ctx, hx + Math.cos(a) * 26 * inK, hy + Math.sin(a) * 20 * inK, rr, i % 2 ? '#E9D3A0' : '#F2E2B8');
          }
          circle(ctx, hx, hy, 24 * inK, '#EAD7A6');
        });
      }
      cloudPuff(SAT_X - SAT_R * 0.55, SAT_WY - SAT_R * 0.5, 1.1, ramp(t, c.sink_fist, c.sink_fist + 0.6, (x) => x), 2, '#EFDDAE');
      // fluff on his knuckles after
      const out = ramp(t, c.scan + 0.3, c.scan + 0.5);
      if (out > 0) paint(() => { for (let i = 0; i < 4; i++) circle(ctx, wr[0] + 14 + 12 * Math.cos(i * 1.7), wr[1] - 12 + 9 * Math.sin(i * 2.3), 11 * out, '#F2E2B8'); });
    },
  });
  const pS = toScreen(cam, SAT_X - SAT_R * 0.7, SAT_WY - SAT_R * 0.9);
  burstWord('POOF!', pS[0] - 120, pS[1] - 110, 70, '#FFD447', popK(t, c.sink_fist, c.sink_fist + 0.55, 0.06, 0.12), -0.12, 60);
  tagPill('HYDROGEN + HELIUM', 640, 840, '#FF9A3C', popK(t, c.gas_tag, shot.end + 1, 0.2, 0.1), 44);
  return { glow: 0.85 };
};

// ================================================================ the split-level shot: our planets in the bath
const TS_R = 150, TS_X = 640;           // Saturn in the tank
const sbFloorY = (x) => TK.floor - 40 + 35 * (1 - Math.pow((x - 540) / 800, 2));
// each planet: kind, radius, x, its drop, splash and landing times (from the cues), how it sinks
function tankPlanets() {
  const c = cu(), f = c.five_drops;
  const P = [
    { k: 'earth', x: 760, t0: c.earth_drop, ts: c.earth_drop + 0.66, tl: c.earth_hit, heavy: true },
    { k: 'jupiter', x: 272, t0: c.jup_drop, ts: c.jup_splash, tl: c.jup_land, heavy: false },
    { k: 'mars', x: 806, t0: f[0], ts: f[0] + 0.3, tl: f[0] + 0.85, heavy: true },
    { k: 'venus', x: 712, t0: f[1], ts: f[1] + 0.3, tl: f[1] + 0.85, heavy: true },
    { k: 'mercury', x: 846, t0: f[2], ts: f[2] + 0.3, tl: f[2] + 0.8, heavy: true },
    { k: 'neptune', x: 950, t0: f[3], ts: f[3] + 0.3, tl: f[3] + 1.25, heavy: false },
    { k: 'uranus', x: 560, t0: f[4], ts: f[4] + 0.3, tl: f[4] + 1.45, heavy: false },
  ];
  for (const p of P) p.R = Math.max(7, TS_R * SB_SIZE[p.k]);
  return P;
}
function planetY(p, t) {
  const yTop = -160 - p.R, yW = TK.wl - p.R * 0.2, yF = sbFloorY(p.x) - p.R;
  if (t < p.t0) return null;
  if (t < p.ts) { const u = (t - p.t0) / (p.ts - p.t0); return yTop + (yW - yTop) * u * u; }
  if (t < p.tl) { const u = (t - p.ts) / (p.tl - p.ts); return lerp(yW, yF, p.heavy ? u * (0.75 + 0.25 * u) : E.inOutSine(u)); }
  const d = t - p.tl;
  return yF - (p.heavy ? 16 : 6) * Math.exp(-d * 7) * Math.abs(Math.sin(d * 16));
}
function tankScene(cam, t, o = {}) {
  const c = cu();
  sbTankBack(cam, t);
  applyCam(cam);
  const P = tankPlanets();
  // Saturn: the back of the rings, the globe (two thirds under), the water over the part that is under, the rings' front
  const bob = 4 * Math.sin(t * loopW(2.0));
  const gy = TK.wl + 0.255 * TS_R * Math.cos(SB_EL_SIDE) + bob + (o.satDY || 0);
  const shud = o.shudder || 0, jx = 1 + 0.035 * shud * Math.sin(t * 47), jy = 1 - 0.035 * shud * Math.sin(t * 47 + 1);
  if (!o.noSat) {
    sbRingsDraw(TS_X, TK.wl + bob, TS_R, 'back', { side: true });
    sbGlobeDraw(TS_X, gy, TS_R, { side: true, sx: jx, sy: jy });
    if (o.cracks > 0) satCracks(TS_X, gy, TS_R, o.cracks);
    sbSatFace(TS_X, gy - TS_R * 0.42, TS_R * 0.62, o.face || 'smug', { look: o.look || [-0.2, 0.3], blink: o.blink || 0 });
  }
  // the duck at the surface on the left, its feet paddling under it
  const dx = 120, dyy = TK.wl - 8 + 3 * Math.sin(t * loopW(2.4));
  sbDuck(dx, dyy, 0.72, t, { look: 0.8, flip: true });
  paint(() => { for (const s of [-1, 1]) { const kk = Math.sin(t * 9 + (s > 0 ? 1.5 : 0)); ctx.beginPath(); ctx.moveTo(dx + s * 14, dyy + 16); ctx.lineTo(dx + s * 14 + 12 * kk, dyy + 46); ctx.lineTo(dx + s * 14 + 26 + 12 * kk, dyy + 44); ctx.closePath(); ctx.fillStyle = '#FF8A1F'; ctx.fill(); } });
  // the planets that sink
  for (const p of P) {
    const y = planetY(p, t);
    if (y === null) continue;
    sbWorldDraw(p.k, p.x, y, p.R, { rot: (t - p.t0) * (p.heavy ? 1.2 : 0.4) });
    if (p.R < 40) paint(() => { ctx.beginPath(); ctx.arc(p.x, y, p.R + 2.5, 0, 7); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.stroke(); });
    if (t > p.ts) sbBubbles(p.x, y + p.R * 0.3, t, p.ts, { n: p.k === 'jupiter' ? 16 : 8, s: p.k === 'jupiter' ? 1.4 : 0.8, spread: p.R * 1.4, seed: p.x });
  }
  if (o.core) o.core();
  const wave = sbTankWater(cam, t);
  // the front of Saturn's rings lies on the surface
  if (!o.noSat) sbRingsDraw(TS_X, TK.wl + bob, TS_R, 'front', { side: true });
  // splashes where the planets went in
  for (const p of P) sbSplashSide(p.x, TK.wl, t, p.ts, p.k === 'jupiter' ? 1.6 : p.R > 40 ? 1.1 : 0.7, p.x);
  void wave;
  sbTankCut(cam, t);
  return { P, gy };
}
// a side-view splash: a crown and drops above the line
function sbSplashSide(x, y, t, t0, s, seed) {
  const d = t - t0;
  if (d < 0 || d > 0.9) return;
  const rng = mulberry32(seed | 0);
  paint(() => {
    for (let i = 0; i < 18; i++) {
      const a = -Math.PI / 2 + (rng() - 0.5) * 2.0, v = (300 + rng() * 500) * s;
      const px = x + Math.cos(a) * v * d, py = y + Math.sin(a) * v * d + 0.5 * 2600 * d * d;
      if (py > y + 6) continue;
      const r = (4 + rng() * 7) * s * (1 - 0.5 * d);
      circle(ctx, px, py, r, rgba('#E9FAFF', 0.95 * clamp(1 - d / 0.9)));
    }
    const ck = clamp(d / 0.32);
    if (ck < 1) for (let i = -3; i <= 3; i++) {
      const bx = x + i * 16 * s * (1 + ck), h = 60 * s * Math.sin(Math.PI * ck) * (1 - Math.abs(i) * 0.15);
      line(ctx, bx, y, bx + i * 6 * s, y - h, 8 * s * (1 - ck), rgba('#EAF9FF', 0.9 * (1 - ck)));
    }
  });
}
// cracks across the globe (k 0..1 how far they have run)
function satCracks(x, y, R, k) {
  const rng = mulberry32(31);
  paint(() => {
    for (let j = 0; j < 4; j++) {
      const a0 = rng() * Math.PI * 2, pts = [[x + Math.cos(a0) * R * 0.15, y + Math.sin(a0) * R * 0.12]];
      let a = a0;
      for (let i = 0; i < 6; i++) { a += (rng() - 0.5) * 1.2; const L = R * 0.16; const p = pts[pts.length - 1]; pts.push([p[0] + Math.cos(a) * L, p[1] + Math.sin(a) * L * 0.9]); }
      const n = Math.max(2, Math.floor(pts.length * clamp(k)));
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < n; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.lineWidth = R * 0.03; ctx.strokeStyle = '#3A2410'; ctx.lineJoin = 'round'; ctx.stroke();
      ctx.lineWidth = R * 0.012; ctx.strokeStyle = 'rgba(255,236,190,0.9)'; ctx.stroke();
    }
  });
}
SC.planets = (lt, t, shot) => {
  const c = cu();
  // follow Earth in and down to the floor, then Jupiter, then back to see the whole floor, then up to Saturn
  const cam = camKeys(t, [[shot.start, 700, 900, 1.42], [c.earth_drop + 0.55, 712, 930, 1.42], [c.earth_hit - 0.05, 730, 1330, 1.38],
    [c.earth_hit + 0.32, 728, 1320, 1.38], [c.jup_splash - 0.02, 470, 960, 1.05], [c.jup_splash + 0.25, 440, 1010, 1.05], [c.jup_land, 450, 1240, 1.0],
    [c.five + 0.3, 560, 1180, 0.92], [c.only - 0.05, 570, 1140, 0.94], [c.floats2_end, 630, 960, 1.32], [shot.end, 634, 950, 1.36]], E.inOutCubic);
  const sm = t > c.floats2 - 0.1 ? 'happy' : 'smug';
  const R = tankScene(cam, t, { face: sm, look: t < c.jupiter ? [0.7, 0.9] : t < c.of ? [-0.7, 0.9] : [0.2, 0.9] });
  // the sound words, beside what made the sound
  const pE = R.P[0], eS = toScreen(cam, pE.x, sbFloorY(pE.x) - pE.R);
  burstWord('CLUNK!', eS[0] - 150, eS[1] - 170, 72, '#FF5A6E', popK(t, c.earth_hit, c.earth_hit + 0.4, 0.05, 0.1), -0.1, 60);
  const pJ = R.P[1], jS = toScreen(cam, pJ.x, sbFloorY(pJ.x) - pJ.R * 2.05);
  burstWord('bloop.', jS[0] + 150, jS[1] - 40, 64, '#8FB8FF', popK(t, c.jup_land, c.jup_land + 0.65, 0.05, 0.12), 0.08, 52);
  // FLOATS on Saturn
  const sS = toScreen(cam, TS_X, TK.wl - TS_R * 1.05);
  tagPill('FLOATS', sS[0] - 40, sS[1] - 40, '#7FE9FF', ramp(t, c.float_tag, c.float_tag + 0.2, (x) => x), 50);
  tickBadge(sS[0] + 118, sS[1] - 40, 32, ramp(t, c.float_tag + 0.12, c.float_tag + 0.32, (x) => x));
  return { glow: 0.85 };
};

// ================================================================ the catch: it falls apart, the core sinks
SC.catch = (lt, t, shot) => {
  const c = cu();
  const cam = camKeys(t, [[shot.start, 640, 960, 1.5], [c.core - 0.05, 640, 1000, 1.45], [c.sinks3_end, 640, 1150, 1.3]], E.inOutCubic);
  const scratch = bumpAt(t, c.scratch, 10);
  cam.x += 6 * scratch * Math.sin(t * 60);
  let face = 'smug';
  if (t > c.worried) face = 'worried';
  if (t > c.shudder) face = 'eek';
  const coreDrop = () => {
    if (t < c.core_drop) return;
    const y0 = TK.wl + 0.255 * TS_R + TS_R * 0.75, yF = sbFloorY(TS_X) - 30, u = clamp((t - c.core_drop) / (c.core_hit - c.core_drop));
    const y = t < c.core_hit ? lerp(y0, yF, u * u * (0.4 + 0.6 * u) + 0.0) : yF - 10 * Math.exp(-(t - c.core_hit) * 8) * Math.abs(Math.sin((t - c.core_hit) * 18));
    const cg = ctx.createRadialGradient(TS_X - 9, y - 9, 3, TS_X, y, 30);
    cg.addColorStop(0, '#B48A62'); cg.addColorStop(1, '#4E3222');
    ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(TS_X, y, 30, 0, 7); ctx.fill();
    paint(() => { circle(ctx, TS_X + 8, y - 4, 5, 'rgba(60,36,22,0.6)'); circle(ctx, TS_X - 10, y + 9, 4, 'rgba(60,36,22,0.6)'); });
    sbBubbles(TS_X, y, t, c.core_drop, { n: 8, s: 0.7, spread: 40, seed: 77 });
  };
  tankScene(cam, t, { face, look: t > c.worried ? [0, 1] : [-0.4, 0.5], shudder: ramp(t, c.shudder, c.shudder + 0.2) * (1 - ramp(t, c.core_hit, c.core_hit + 0.3)) + 0.4, cracks: ramp(t, c.shudder + 0.1, c.apart_end, (x) => x), core: coreDrop });
  const cS = toScreen(cam, TS_X, sbFloorY(TS_X) - 60);
  burstWord('CLUNK!', cS[0] + 170, cS[1] - 120, 62, '#FF5A6E', popK(t, c.core_hit, c.core_hit + 0.5, 0.05, 0.1), -0.1, 52);
  const pS = toScreen(cam, TS_X, TK.wl - TS_R * 1.1);
  tagPill('PROBABLY', pS[0], pS[1] - 40, '#C8A8FF', popK(t, c.probably, c.core_drop, 0.15, 0.12), 40);
  return { glow: 0.85, push: { k: 1 + 0.02 * scratch, cx: 540, cy: 900 } };
};

// ================================================================ the fizz: the gas goes UP (as bubble bath)
let SB_MOUND = null;
function mound() {
  if (SB_MOUND) return SB_MOUND;
  const rng = mulberry32(404), out = [];
  for (let i = 0; i < 300; i++) {
    const a = rng(), b = rng();
    // a dome over the tub, up to his nose: points in (u across, v up) of a half-ellipse
    const u = (a * 2 - 1), v = Math.sqrt(Math.max(0, 1 - u * u)) * Math.pow(b, 0.5);
    out.push({ u, v, r: 12 + 20 * Math.pow(rng(), 1.8), ph: rng() * 6, col: ['#FFF8E6', '#F6E8C6', '#FFFFFF', '#F0DDB0', '#FFF3D6'][Math.floor(rng() * 5)], d: rng() });
  }
  out.sort((p, q) => q.v - p.v);
  SB_MOUND = out;
  return out;
}
// the foam mound: grow 0..1 (how high), pop 0..1 (popping from the top down)
function foamMound(t, grow, pop) {
  if (grow <= 0) return;
  const M = mound(), cx = 610, by = 1310, wA = 380 * (0.4 + 0.6 * grow), hA = 300 * grow;
  for (const b of M) {
    const popAt = 1 - b.v;                              // the top pops first
    if (pop > 0 && pop > popAt * 0.85 + 0.05 * b.d) continue;
    const x = cx + b.u * wA, y = by - b.v * hA + 3 * Math.sin(t * 3 + b.ph), r = b.r * (0.6 + 0.4 * grow);
    const gg = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.05, x, y, r);
    gg.addColorStop(0, '#FFFFFF'); gg.addColorStop(0.55, b.col); gg.addColorStop(1, mixH(b.col, '#C9B48A', 0.25));
    ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  }
}
function foamPops(t, pop) {
  if (pop <= 0 || pop >= 1) return;
  const M = mound(), cx = 610, by = 1310;
  paint(() => {
    for (let i = 0; i < M.length; i += 3) {
      const b = M[i], at = (1 - b.v) * 0.85 + 0.05 * b.d, d = pop - at;
      if (d < 0 || d > 0.12) continue;
      const x = cx + b.u * 380, y = by - b.v * 300, k = d / 0.12;
      for (let j = 0; j < 5; j++) { const a = j / 5 * Math.PI * 2; line(ctx, x + Math.cos(a) * 10, y + Math.sin(a) * 10, x + Math.cos(a) * (14 + 26 * k), y + Math.sin(a) * (14 + 26 * k), 3, rgba('#FFFFFF', 1 - k)); }
    }
  });
}
SC.fizz = (lt, t, shot) => {
  const c = cu();
  const grow = ramp(t, c.erupt, c.buried, E.outBack);
  const cam = camKeys(t, [[shot.start, 610, 1180, 1.5], [c.erupt, 612, 1170, 1.52], [c.buried, 590, 1120, 1.62], [shot.end, 586, 1112, 1.64]], E.inOutCubic);
  const jolt = bumpAt(t, c.erupt, 9);
  cam.y += 6 * jolt * Math.sin(t * 50);
  let face = { ...SBF.down, lookX: 0.7, lookY: 0.9 };
  face = lerpFace(face, SBF.shock, ramp(t, c.erupt, c.erupt + 0.1));
  face = lerpFace(face, { ...SBF.deadpan, blink: 0.38 }, ramp(t, c.buried - 0.1, c.buried + 0.1));
  if (t > c.blink && t < c.blink + 0.12) face = { ...face, blink: 1 };
  const A = { armL: ARM.restL, armR: ARM.restR, face, headDY: -8 * jolt };
  sbBathDraw(cam, t, A, {
    duck: { x: 396, y: 1342, s: 0.62, bobY: 3.5 * Math.sin(t * loopW(2.2)), look: 0.6, flip: t > c.erupt + 0.2 },
    sat: t < c.erupt + 0.12 ? { x: SAT_X, wy: SAT_WY, R: SAT_R * (1 + 0.25 * ramp(t, c.erupt - 0.25, c.erupt + 0.1, E.inCubic)), face: 'eek', look: [0, -1],
      sx: 1 + 0.06 * Math.sin(t * 40), sy: 1 - 0.06 * Math.sin(t * 40) } : { x: SAT_X, wy: SAT_WY, R: SAT_R, noGlobe: true },
    over: () => { foamMound(t, grow, 0); },
  });
  return { glow: 0.85, flash: 0.25 * popK(t, c.erupt, c.erupt + 0.1, 0.02, 0.08) };
};

// ================================================================ the rings: left behind, they float (the duck takes them)
function ringsDuck(t) {
  const c = cu();
  const k = ramp(t, c.duck_in - 0.7, c.duck_in, E.inOutCubic);
  return { x: lerp(396, SAT_X, k), y: lerp(1342, SAT_WY + 6, k), s: 0.62, bobY: 3.5 * Math.sin(t * loopW(2.2)), look: 0.4, flip: k > 0.02 && k < 0.98, squeak: popK(t, c.duck_in + 0.02, c.duck_in + 0.2, 0.04, 0.1) };
}
SC.rings = (lt, t, shot) => {
  const c = cu();
  const pop = ramp(t, c.foam_pop, c.foam_pop + 0.45, (x) => x);
  const cam = camKeys(t, [[shot.start, 586, 1150, 1.6], [c.foam_pop + 0.4, 600, 1230, 1.42], [shot.end, 606, 1290, 1.32]], E.inOutCubic);
  let face = { ...SBF.deadpan };
  face = lerpFace(face, { ...SBF.down, lookX: 0.8, lookY: 1 }, ramp(t, c.rings - 0.1, c.rings + 0.2));
  face = lerpFace(face, { ...SBF.study, lookX: 0.8, lookY: 1, browTilt: 0.9 }, ramp(t, c.duck_in - 0.1, c.duck_in + 0.2));
  const A = { armL: ARM.restL, armR: ARM.restR, face };
  const D = ringsDuck(t);
  sbBathDraw(cam, t, A, {
    duck: null,
    sat: null,
    under: () => {
      // the rings on their own, floating; the duck inside them like a swim ring
      const bob = 3.5 * Math.sin(t * loopW(2.2));
      sbRingsDraw(SAT_X, SAT_WY + bob, SAT_R, 'back');
      sbDuck(D.x, D.y, D.s, t, D);
      sbRingsDraw(SAT_X, SAT_WY + bob, SAT_R, 'front');
    },
    over: () => { foamMound(t, 1, pop); foamPops(t, pop); },
  });
  return { glow: 0.85 };
};

// ================================================================ the button: it leaves a RING
SC.button = (lt, t, shot) => {
  const c = cu();
  const cam = camKeys(t, [[shot.start, 606, 1306, 1.3], [c.look_us, 598, 1314, 1.33], [shot.end, 592, 1318, 1.36]], E.inOutCubic);
  let face = { ...SBF.down, lookX: 0.8, lookY: 1 };
  face = lerpFace(face, SBF.deadpan, ramp(t, c.look_us, c.look_us + 0.15));
  face = { ...face, blink: Math.max(face.blink, popK(t, c.rimshot + 0.05, c.rimshot + 0.17, 0.03, 0.05)) };
  const brush = ramp(t, c.brush - 0.15, c.brush + 0.12, E.outBack);
  const reach = ramp(t, c.relift, shot.end, E.inOutCubic);
  let armR = sbArmMix(ARM.restR, { e: [150, -250], w: [118, -350] }, brush);
  armR = sbArmMix(armR, ARM.liftR, reach);
  let armL = sbArmMix(ARM.restL, ARM.liftL, reach);
  const A = { armL, armR, face, headRot: 0.04 * ramp(t, c.look_us, c.look_us + 0.2), handR: 'open',
    held: brush > 0.05 && reach < 0.6 ? (lc, r, st) => { const w = sbW(st, r.wrR); sbBrush(lc, w[0] + 6, w[1] - 26, 0.75, -0.5 + 0.1 * Math.sin(t * 5)); } : null, overHands: 'R' };
  const D = ringsDuck(t);
  sbBathDraw(cam, t, A, {
    duck: null, sat: null,
    under: () => {
      const bob = 3.5 * Math.sin(t * loopW(2.2));
      sbRingsDraw(SAT_X, SAT_WY + bob, SAT_R, 'back');
      sbDuck(D.x, D.y, D.s, t, { ...D, lid: t > c.ring_end });
      sbRingsDraw(SAT_X, SAT_WY + bob, SAT_R, 'front');
    },
  });
  return { glow: 0.85 };
};

// ================================================================ the cover: SINK OR FLOAT?
SC.cover = (lt, t, shot) => {
  const tt = 1.0;
  const cam = { x: 610, y: 1008, zoom: 1.85, rot: 0 };
  hookDraw(cam, tt, tt);
  screenSpace();
  bigWord('SINK', 540, 548, 186, '#FF5A6E', 1, -0.05);
  bigWord('OR FLOAT?', 540, 700, 150, '#7FE9FF', 1, -0.05);
  return { glow: 0.85, noCaptions: true };
};

function initScenes2() {
  sbInitSpace();
  sbInitPlanets();
  sbInitBath();
  mound();
}
