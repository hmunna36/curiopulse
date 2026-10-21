// Why Do Some People Have NO Wrist Tendon? 🖐️ Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds
// inside the shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;
// the strongest of a list of pulses at time t: each is on for `len` seconds, with soft edges
const pulseOf = (t, times, len = 0.16) => times.reduce((m, f) => Math.max(m, clamp((t - f) / 0.03) * clamp((f + len - t) / 0.05)), 0);
// a decaying bump after a moment
const bumpAt = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the living room at night: the TV in front of him is the key (cool, from the front, a little to the right), the warm
// floor lamp far left behind him is the rim (vulcan-salute's)
const TV_LIGHT = (lt, t) => ({ ...LIGHTS.night, key: [0.30, -0.42, 0.85], keyTint: [0.9 + 0.04 * tvFlick(t), 0.98, 1.1 + 0.05 * tvFlick(t)],
  rimFrom: [-0.85, -0.35], rim: [1.0, 0.70, 0.42], rimAmt: 1.2, pool: 0.62, halo: 0.12, haloColor: [0.6, 0.75, 1.0], dof: 0.8 });
// the jungle by moonlight: the moon is behind the ancestor (a cool rim from above)
const MOON_LIGHT = { ...LIGHTS.night, rimFrom: [0.1, -0.95], rim: [0.75, 0.82, 1.0], rimAmt: 1.4, pool: 0.4 };
// the ball park: floodlights high on both sides, the key from the upper left
const PARK_LIGHT = { ...LIGHTS.night, key: [-0.45, -0.70, 0.55], keyTint: [1.06, 1.04, 0.98], rimFrom: [0.85, -0.55], rim: [1.0, 0.95, 0.85], rimAmt: 1.3, pool: 0.45, halo: 0.10 };
setLights({ hook: TV_LIGHT, glass: TV_LIGHT, seven: LIGHTS.diagram, onearm: TV_LIGHT, jungle: MOON_LIGHT, grip: TV_LIGHT, steal: TV_LIGHT,
  pitch: PARK_LIGHT, button: TV_LIGHT, loop: TV_LIGHT, cover: TV_LIGHT });

// ---------------------------------------------------------------- his faces
const VF = {
  // eyes on his raised hand (screen right)
  focus: { eyeOpen: 1.05, pupil: 0.95, lookX: 0.85, lookY: -0.35, browY: 0.5, browTilt: 0.6, mouth: 'flat', mouthOpen: -0.2, blink: 0, cross: 0 },
  wow: { eyeOpen: 1.3, pupil: 0.65, lookX: 0.8, lookY: -0.3, browY: 1.45, browTilt: 0.3, mouth: 'o', mouthOpen: 0.55, blink: 0, cross: 0 },
  pleased: { eyeOpen: 1.05, pupil: 0.95, lookX: 0.8, lookY: -0.3, browY: 1.0, browTilt: -0.4, mouth: 'grin', mouthOpen: 0.45, blink: 0, cross: 0 },
  inspect: { eyeOpen: 1.12, pupil: 0.85, lookX: 0.75, lookY: -0.2, browY: 0.8, browTilt: 0.7, mouth: 'o', mouthOpen: 0.25, blink: 0, cross: 0 },
  huh: { eyeOpen: 1.2, pupil: 0.8, lookX: 0.8, lookY: -0.3, browY: 1.2, browTilt: 0.9, mouth: 'wavy', mouthOpen: 0.35, blink: 0, cross: 0 },
  // looking at the other hand (screen left)
  huhL: { eyeOpen: 1.2, pupil: 0.8, lookX: -0.85, lookY: -0.3, browY: 1.2, browTilt: 0.9, mouth: 'wavy', mouthOpen: 0.35, blink: 0, cross: 0 },
  sadL: { eyeOpen: 0.95, pupil: 0.95, lookX: -0.8, lookY: -0.25, browY: 0.6, browTilt: 1.3, mouth: 'flat', mouthOpen: -0.6, blink: 0.15, cross: 0 },
  sad: { eyeOpen: 0.95, pupil: 0.95, lookX: 0.8, lookY: -0.25, browY: 0.6, browTilt: 1.3, mouth: 'flat', mouthOpen: -0.6, blink: 0.15, cross: 0 },
  strain: { eyeOpen: 0.78, pupil: 1, lookX: 0, lookY: -0.2, browY: -0.3, browTilt: 1.1, mouth: 'grimace', mouthOpen: 0.75, blink: 0.25, cross: 0, squeeze: 0.35 },
  shrug: { eyeOpen: 1.05, pupil: 0.95, lookX: 0, lookY: 0, browY: 1.2, browTilt: -0.3, mouth: 'flat', mouthOpen: 0.1, blink: 0, cross: 0 },
  shock: { eyeOpen: 1.38, pupil: 0.55, lookX: 0.8, lookY: -0.1, browY: 1.5, browTilt: 0.4, mouth: 'scream', mouthOpen: 0.7, blink: 0, cross: 0 },
  caught: { eyeOpen: 1.3, pupil: 0.62, lookX: 0, lookY: 0, browY: 1.3, browTilt: 0.6, mouth: 'grimace', mouthOpen: 0.5, blink: 0, cross: 0 },
};

// ================================================================ the living room: frame 1 and round it
// tt = seconds since frame 1 (negative = the last frames of the Short, on their way here)
function hookA(tt) {
  const c = cu();
  let opp, flex;
  if (tt < 0) {   // the loop: the thumb comes across and the wrist starts to bend, into frame 1
    opp = lerp(0.25, 1, ramp(tt, -0.40, -0.12, E.inOutSine));
    flex = lerp(0.12, 0.55, ramp(tt, -0.40, 0, E.inOutSine));
  } else {
    const first = lerp(0.55, 1, ramp(tt, 0, c.pop0, E.outCubic));                        // frame 1: the wrist bends, the cord pops
    const relax = ramp(tt, c.touch - 0.12, c.touch + 0.22, E.inOutSine);                // "Touch...": he lets go and starts again
    const meet = ramp(tt, c.thumb, c.pinky_end - 0.05, E.inOutSine);                   // the thumb goes over to the pinky
    const bend = ramp(tt, c.bend - 0.04, c.pop2 - 0.02, E.inOutCubic);                 // "bend your wrist": the cord comes up again
    opp = lerp(1, lerp(0.2, 1, meet), relax);
    flex = lerp(first, lerp(0.08, 1, bend), relax);
  }
  const cord = clamp((flex - 0.62) / 0.3);
  const pop = Math.max(bumpAt(tt, c.pop0, 6), bumpAt(tt, c.pop2, 6));
  let face = lerpFace(VF.focus, VF.wow, pop);
  face = lerpFace(face, VF.inspect, ramp(tt, c.got, c.got + 0.2) * (1 - ramp(tt, c.touch - 0.1, c.touch + 0.2)));
  face = lerpFace(face, VF.pleased, ramp(tt, c.pop2 + 0.15, c.pop2 + 0.45));
  face = { ...face, blink: Math.max(face.blink || 0, pulseOf(tt, [c.tendon_end + 0.25, c.pinky + 0.1], 0.12)) };
  const H = { view: 0, opp, flex, cord, pop, tremble: 0.25 * ramp(tt, c.bend - 0.1, c.pop2) * (1 - ramp(tt, c.pop2, c.pop2 + 0.3)) };
  const A = {
    face, HR: H, armR: WT_ARM.up,
    headDX: 3 * Math.sin(tt * 1.7), headDY: 1.2 * Math.sin(tt * 2.3), bob: 1.0 * Math.sin(tt * 2.3),
    headRot: 0.05 * Math.sin(tt * 1.1) + 0.06 * ramp(tt, c.got, c.got + 0.3) * (1 - ramp(tt, c.touch, c.touch + 0.3)),
    handRot: -0.04 + 0.02 * Math.sin(tt * 2.1),
  };
  return { A, H, pop, cord };
}
function hookCam(tt) {
  const c = cu();
  const k = camKeys(tt, [[-0.4, 596, 1056, 2.92], [0, 600, 1053, 3.0], [0.5, 604, 1050, 3.12], [c.touch, 606, 1050, 3.14],
    [c.pinky_end, 610, 1052, 3.2], [c.wrist_end, 614, 1056, 3.26], [c.wrist_end + 0.6, 616, 1058, 3.3]], E.inOutCubic);
  if (tt >= 0 && tt < 0.5) { const u = E.outCubic(tt / 0.5); k.zoom = lerp(3.0, 3.12, u); k.x = lerp(600, 604, u); k.y = lerp(1053, 1050, u); }
  const sh = shake(tt, 3.0 * Math.max(bumpAt(tt, c.pop0, 10), bumpAt(tt, c.pop2, 10)), 26, 3);
  k.sx = sh[0]; k.sy = sh[1];
  return k;
}
function roomDraw(t, o) {
  roomBack(o.cam, t);
  const Hh = wtHero(o.cam, t, o.A);
  applyCam(o.cam);
  if (o.after) o.after(Hh);
  return Hh;
}
// a dashed ring round a world point on the screen (the cord), with a little arrow coming in from the left
function cordRing(cam, p, k, t, col = '#FFD447', r0 = 66) {
  if (k <= 0.01) return;
  const P = toScreen(cam, p[0], p[1]), r = r0 * E.outBack(clamp(k), 1.8);
  screenSpace();
  paint(() => {
    ctx.save(); ctx.translate(P[0], P[1]); ctx.rotate(t * 0.8);
    ctx.setLineDash([16, 12]); ctx.beginPath(); ctx.ellipse(0, 0, r * 0.7, r * 1.25, 0, 0, 7); ctx.lineWidth = 6; ctx.strokeStyle = col; ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
  });
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); gctx.beginPath(); gctx.ellipse(P[0], P[1], r * 0.7, r * 1.25, 0, 0, 7); gctx.lineWidth = 12; gctx.strokeStyle = rgba(col, 0.45 * clamp(k)); gctx.stroke(); gctx.restore();
}
// a pop mark: short rays bursting out of a point
function popRays(cam, p, k, n = 9, col = '#FFF1D0', len = 60) {
  if (k <= 0.01 || k >= 1) return;
  const P = toScreen(cam, p[0], p[1]);
  shockLines(P[0], P[1], len, k, n, col, 11);
}

// ================================================================ shots
SC.hook = (lt, t, shot) => {
  const c = cu(), S = hookA(t), cam = hookCam(t);
  const Hh = roomDraw(t, { cam, A: S.A });
  const cp = Hh.hp([0, 26]);
  // "Got this tendon?": a ring round it
  cordRing(cam, cp, popK(t, c.got - 0.05, c.touch - 0.1, 0.14, 0.12), t);
  cordRing(cam, cp, popK(t, c.pop2 + 0.02, c.pop2 + 0.62, 0.12, 0.1), t, '#7FE9FF', 58);   // and again when it pops up the second time
  return { glow: 0.85, flash: 0.05 * bumpAt(t, c.pop2, 8) };
};
SC.loop = (lt, t, shot) => SC.hook(lt, t - TLd.duration, shot);

// ---------------------------------------------------------------- the answer: the forearm turns to glass; the body forgot to delete it
SC.glass = (lt, t, shot) => {
  const c = cu();
  const gk = ramp(t, c.cord - 0.05, c.muscle + 0.2, E.inOutSine);
  const sq = 0.5 + 0.5 * Math.sin(t * 6.3) * ramp(t, c.muscle, c.muscle + 0.3);
  const H = { view: 0, opp: 1, flex: 1, cord: 1, glass: gk, squeeze: sq * gk };
  let face = lerpFace(VF.pleased, VF.wow, ramp(t, c.cord, c.cord + 0.2));
  face = lerpFace(face, VF.inspect, ramp(t, c.body, c.body + 0.3));
  face = lerpFace(face, VF.huh, ramp(t, c.click_later, c.click_later + 0.2));
  const A = { face, HR: H, armR: WT_ARM.up, headDX: 3 * Math.sin(t * 1.7), headDY: 1.2 * Math.sin(t * 2.3), bob: Math.sin(t * 2.3), handRot: -0.04 + 0.02 * Math.sin(t * 2.1) };
  const cam = camKeys(t, [[shot.start, 616, 1058, 3.3], [c.muscle, 612, 1170, 3.1], [c.forgot, 614, 1176, 3.06], [shot.end, 616, 1180, 3.1]], E.inOutCubic);
  const Hh = roomDraw(t, { cam, A });
  // the label on the little muscle, with a thin leader
  const fa = Hh.F ? Hh.F.fa : 200, mp = Hh.hp([0, fa * 0.74]), M = toScreen(cam, mp[0], mp[1]);
  const kl = popK(t, c.muscle + 0.05, shot.end + 1, 0.16, 0.1);
  if (kl > 0.01) {
    const L = [330, clamp(M[1], 1050, 1150)];
    thinLeader([L[0] + 130, L[1]], [M[0] - 30, M[1]], kl, '#FFD447');
    tagPill('PALMARIS LONGUS', L[0], L[1], '#FFD447', kl, 34);
  }
  // the computer's question: delete it? ... LATER
  const kd = ramp(t, c.forgot - 0.12, c.forgot + 0.12, E.outBack) * (1 - ramp(t, c.click_later + 0.32, c.click_later + 0.5, E.inCubic));
  const D = [330, 880];
  const cur0 = [700, 980], cur1 = [D[0] + 96, D[1] + 61];
  const cm = ramp(t, c.forgot + 0.1, c.click_later - 0.04, E.inOutCubic);
  deleteDialog(D[0], D[1], kd, { hover: cm > 0.9 ? 'later' : null, click: bumpAt(t, c.click_later, 10) * (t >= c.click_later ? 1 : 0), cursor: kd > 0.5 ? [lerp(cur0[0], cur1[0], cm), lerp(cur0[1], cur1[1], cm)] : null });
  return { glow: 0.85, flash: 0.04 * bumpAt(t, c.click_later, 10) };
};

// ---------------------------------------------------------------- one in seven: already deleted
SC.seven = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  roomBack({ x: 540, y: 1090, zoom: 2.4 }, t);
  screenSpace(); ctx.fillStyle = 'rgba(6,8,22,0.62)'; ctx.fillRect(0, 0, W, H);
  // seven wrists in a row, popping in one after another
  for (let i = 0; i < 7; i++) {
    const k = ramp(t, c.one1 - 0.05 + i * 0.06, c.one1 + 0.18 + i * 0.06, E.outBack);
    const last = i === 6, del = last ? ramp(t, c.x_seven - 0.05, c.x_seven + 0.12) : 0;
    const bob = 6 * Math.sin(t * 3 + i);
    wtPalmIcon(176 + i * 118, 930 + bob, 0.86, t, { k, cord: last ? 1 - del : 1, deleted: del });
  }
  bigWord('1 IN 7', 540, 600, 170, '#FFD447', ramp(t, c.seven - 0.03, c.seven + 0.2, E.outBack), -0.04);
  // the computer again: this time the cursor clicks YES on the seventh
  const kd = ramp(t, c.already - 0.1, c.already + 0.1, E.outBack) * (1 - ramp(t, c.x_seven, c.x_seven + 0.16, E.inCubic));
  const Dp = [640, 760], cur1 = [Dp[0] - 96, Dp[1] + 61], cm = ramp(t, c.already, c.deleted, E.inOutCubic);
  deleteDialog(Dp[0], Dp[1], kd * 0.92, { hover: cm > 0.9 ? 'yes' : null, click: t >= c.deleted + 0.12 ? bumpAt(t, c.deleted + 0.12, 10) : 0, cursor: kd > 0.5 ? [lerp(940, cur1[0], cm), lerp(1000, cur1[1], cm)] : null, question: 'Delete this muscle?' });
  stamp('DELETED', 700, 1110, ramp(t, c.x_seven, c.x_seven + 0.18), '#FF5A6E', -0.16, 64);
  return { glow: 0.8, push: { k: 1 + 0.05 * lt / D, cx: 540, cy: 900 } };
};

// ---------------------------------------------------------------- sometimes in just one arm: both forearms up
SC.onearm = (lt, t, shot) => {
  const c = cu();
  const up = ramp(t, shot.start - 0.1, shot.start + 0.3, E.outBack);
  const armL = armMix(WT_ARM.restL, WT_ARM.upL, up);
  const HR = { view: 0, opp: 1, flex: 1, cord: 1 };
  const HL = { view: 0, opp: ramp(t, shot.start + 0.1, c.onearm, E.inOutSine), flex: ramp(t, c.just - 0.1, c.onearm + 0.05), cord: 0 };
  let face = lerpFace(VF.focus, VF.huhL, ramp(t, c.just - 0.15, c.just + 0.1));
  face = lerpFace(face, VF.sadL, ramp(t, c.huh, c.huh + 0.25));
  const A = { face, HR, HL, armR: WT_ARM.up, armL, headDX: 3 * Math.sin(t * 1.7), headDY: 1.2 * Math.sin(t * 2.3), bob: Math.sin(t * 2.3),
    headRot: -0.07 * ramp(t, c.just - 0.15, c.just + 0.1), handRot: -0.04, handRotL: 0.04 };
  const cam = camKeys(t, [[shot.start, 540, 1062, 2.22], [shot.end, 540, 1056, 2.34]], E.inOutCubic);
  const Hh = roomDraw(t, { cam, A });
  const pR = toScreen(cam, ...Hh.hp([0, 26])), pL = toScreen(cam, ...Hh.hpL([0, 26]));
  tagPill('✓', pR[0], pR[1] - 300, '#4DFFB4', ramp(t, shot.start + 0.15, shot.start + 0.35), 46);
  burstWord('?', pL[0], pL[1] - 290, 70, popK(t, c.huh, shot.end + 1, 0.12, 0.1), '#FF5A6E', '#FFFFFF', 0.1, 4);
  cordRing(cam, Hh.hpL([0, 26]), popK(t, c.onearm, shot.end + 1, 0.14, 0.1), t, '#FF5A6E', 56);
  return { glow: 0.85 };
};

// ---------------------------------------------------------------- the ancestor in the trees
SC.jungle = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(t, [[shot.start, 560, 1060, 1.0], [c.ancestors, 572, 1010, 1.18], [shot.end, 576, 1000, 1.24]], E.inOutCubic);
  const sway = jgBack(cam, t);
  applyCam(cam);
  const hx = 580, hy = jgBranchY(580, sway) + 6;
  const swing = 0.16 * Math.sin(t * 2.6) + 0.08 * Math.sin(t * 1.1);
  const o = { swing, glow: ramp(t, c.helped - 0.1, c.helped + 0.3), squeeze: 0.5 + 0.5 * Math.sin(t * 9), look: 0.6, grin: ramp(t, c.ancestors, c.ancestors + 0.3), reach: 0.5 + 0.5 * Math.sin(t * 2.6 + 1.2), blink: pulseOf(t, [shot.start + 0.9], 0.12) };
  jgAncestor(gctx, hx, hy, 1.15, t, o, true);
  actor(() => jgAncestor(ctx, hx, hy, 1.15, t, o));
  tagPill('PROBABLY', 760, 520, '#C8A8FF', ramp(t, c.probably - 0.04, c.probably + 0.16), 36);
  return { glow: 0.85, push: { k: 1 + 0.03 * lt / D, cx: 540, cy: 900 } };
};

// ---------------------------------------------------------------- the same grip without it
SC.grip = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const sq = ramp(t, c.grip - 0.1, c.hard + 0.1, E.inOutSine);
  const val = 41 * sq + 0.6 * Math.sin(t * 23) * sq;
  let face = lerpFace(VF.focus, VF.strain, sq * (1 - ramp(t, c.without, c.without + 0.25)));
  face = lerpFace(face, VF.shrug, ramp(t, c.it2_end - 0.1, c.it2_end + 0.2));
  const A = { face: { ...face, lookX: 0 }, armR: WT_ARM.gripR, armL: WT_ARM.gripL, fistL: true, fistR: true,
    headDX: 2 * Math.sin(t * 1.7), headDY: 1.2 * Math.sin(t * 2.3) + 3 * sq * Math.sin(t * 31) * 0.3, bob: Math.sin(t * 2.3) };
  const cam = camKeys(t, [[shot.start, 540, 1176, 2.42], [shot.end, 540, 1180, 2.52]], E.inOutCubic);
  const Hh = roomDraw(t, { cam, A });
  const r = Hh.r, st = Hh.st, wR = toScreen(cam, ...toWorld(st, r.wrR)), wL = toScreen(cam, ...toWorld(st, r.wrL));
  const kk = ramp(t, shot.start, shot.start + 0.2, E.outBack);
  gripMeter(wR[0] + 4, wR[1] - 150, 1.22, val, t, { k: kk, label: 'CORD', labelCol: '#4DFFB4', tremble: sq, shake: sq * 0.6 });
  gripMeter(wL[0] - 4, wL[1] - 150, 1.22, val, t, { k: kk, label: 'NO CORD', labelCol: '#FF86A6', tremble: sq, shake: sq * 0.6 });
  // =: two fat bars between the dials (an Anton "=" with its outline read as an 8 on a phone)
  const ke = ramp(t, c.without - 0.04, c.without + 0.18, E.outBack);
  if (ke > 0.01) {
    screenSpace();
    const ey = Math.min(wR[1], wL[1]) - 150;
    ctx.save(); ctx.translate(540, ey); ctx.scale(ke, ke);
    for (const dy of [-22, 22]) { rrect(ctx, -54, dy - 15, 108, 30, 15); ctx.lineWidth = 10; ctx.strokeStyle = '#0B0B1A'; ctx.stroke(); ctx.fillStyle = '#FFD447'; ctx.fill(); }
    ctx.restore();
    softDot(gctx, 270, ey * 0.5, 60, '#FFD447', 0.35 * ke);
  }
  return { glow: 0.8, push: { k: 1 + 0.02 * lt / D, cx: 540, cy: 900 } };
};

// ---------------------------------------------------------------- the surgeon takes it
SC.steal = (lt, t, shot) => {
  const c = cu();
  const gin = ramp(t, c.surgeons - 0.12, c.take, E.outCubic);
  const pull = ramp(t, c.take + 0.05, c.snap - 0.02, E.inOutSine), snap = ramp(t, c.snap - 0.02, c.snap + 0.02);
  const away = ramp(t, c.snap, c.snap + 0.35, E.inCubic);
  // the pinch point (hand units of his raised hand): on the cord, then pulled out to the right
  const at0 = [0, 30], at1 = [72, -10], at = [lerp(at0[0], at1[0], pull) + 260 * away, lerp(at0[1], at1[1], pull) - 240 * away];
  const H = { view: 0, opp: 1, flex: 1, cord: 1 - Math.max(snap, ramp(t, c.take, c.take + 0.1) * 0.6), gone: snap,
    pulled: { k: ramp(t, c.take, c.take + 0.06) * (1 - away), at: [-at[0], at[1]], snap } };   // wtHand draws the palm mirrored: flip x so the noodle meets the glove
  let face = lerpFace(VF.inspect, VF.wow, ramp(t, c.surgeons, c.surgeons + 0.2));
  face = lerpFace(face, VF.shock, ramp(t, c.snap, c.snap + 0.12));
  const A = { face, HR: H, armR: WT_ARM.up, glove: { k: gin * (1 - away), at, rot: -0.5 },
    headDX: 3 * Math.sin(t * 1.7), headDY: 1.2 * Math.sin(t * 2.3) - 6 * bumpAt(t, c.snap, 7), bob: Math.sin(t * 2.3), handRot: -0.04 - 0.06 * pull * (1 - snap) };
  const cam = camKeys(t, [[shot.start, 606, 1078, 3.0], [c.take, 612, 1072, 3.15], [shot.end, 614, 1070, 3.18]], E.inOutCubic);
  const sh = shake(t, 4 * bumpAt(t, c.snap, 9), 30, 5); cam.sx = sh[0]; cam.sy = sh[1];
  const Hh = roomDraw(t, { cam, A });
  const sp = toScreen(cam, ...Hh.hp([-at[0], at[1]]));
  burstWord('BOING!', Math.min(740, sp[0]), sp[1] - 120, 96, popK(t, c.snap, c.snap + 0.5, 0.1, 0.12), '#FFD447', '#0B0B1A', -0.12, 7);
  return { glow: 0.85, flash: 0.05 * bumpAt(t, c.snap, 9) };
};

// ---------------------------------------------------------------- ... to rebuild pitchers' elbows
SC.pitch = (lt, t, shot) => {
  const c = cu();
  const toRel = ramp(t, c.throw - 0.06, c.throw + 0.1, E.inCubic), toFol = ramp(t, c.throw + 0.1, c.throw + 0.34, E.outCubic);
  let arms = pitchMix(PITCH.set, PITCH.cock, ramp(t, shot.start, shot.start + 0.35, E.inOutCubic));
  arms = pitchMix(arms, PITCH.release, toRel);
  arms = pitchMix(arms, PITCH.follow, toFol);
  let p = { hipY: -222 + 4 * Math.sin(t * 2), lean: -0.03 + 0.08 * toFol, armL: { a: 0.2, b: 0.1 }, armR: { a: 0.2, b: 0.1 },
    legL: { a: 0.3 - 0.1 * toFol, b: -0.1 }, legR: { a: 0.16 + 0.12 * toFol, b: 0.05 }, hand: 'fist', feetFront: 0 };
  p = armAt(p, 'R', arms.R.e, arms.R.w); p = armAt(p, 'L', arms.L.e, arms.L.w);
  const face = lerpFace({ ...VF.focus, lookX: 0, lookY: 0.05, mouth: 'flat', mouthOpen: -0.3, browY: -0.2, browTilt: 0.9 }, VF.caught, ramp(t, c.elbows_end, c.elbows_end + 0.2));
  const st = { x: 540, y: 1500, s: 1.25, pose: p, face, headDX: 0, headDY: 0, headRot: 0.04 * toFol, seed: 4 };
  const cam = camKeys(t, [[shot.start, 540, 1080, 1.45], [c.baseball, 560, 1060, 1.6], [c.throw, 548, 1060, 1.6], [shot.end, 540, 1064, 1.72]], E.inOutCubic);
  const sh = shake(t, 5 * bumpAt(t, c.thwack, 8), 30, 9); cam.sx = sh[0]; cam.sy = sh[1];
  parkBack(cam, t);
  const ballIn = t < c.throw + 0.02;
  const r = charLayer(cam, st, t, { pal: PITCHPAL, ambient: 0.04, post: (lc, rr, s2) => {
    lc.save(); lc.translate(s2.x, s2.y); lc.scale(s2.s, s2.s);
    actor(() => pitchMitt(lc, rr.wrL, -0.3));
    if (ballIn) actor(() => baseball(lc, rr.wrR[0] + rr.armDirR[0] * 16, rr.wrR[1] + rr.armDirR[1] * 16, 15));
    // the cap, and a number on his chest
    const hd = rr.head;
    lc.save(); lc.translate(hd[0], hd[1]); lc.rotate(rr.lean); actor(() => pitchCap(lc, 1)); lc.restore();
    paint(() => { lc.save(); lc.translate(rr.chest[0], rr.chest[1] - 6); lc.rotate(rr.lean); lc.font = '900 44px Montserrat'; lc.textAlign = 'center'; lc.textBaseline = 'middle'; lc.fillStyle = '#D2343F'; lc.fillText('7', 26, -6); lc.restore(); });
    lc.restore();
  } });
  // the round window on his throwing elbow: the new ligament slides in
  const elW = toWorld(st, r.elR), E0 = toScreen(cam, elW[0], elW[1]);
  const kw = ramp(t, c.rebuild - 0.06, c.rebuild + 0.18, E.outBack) * (1 - ramp(t, c.throw - 0.14, c.throw - 0.02, E.inCubic));
  elbowWindow(Math.min(800, E0[0] + 10), E0[1] - 30, 150, t, { k: kw, lig: ramp(t, c.rebuild + 0.05, c.baseball + 0.3, E.inOutSine), glow: 1 });
  tagPill('FROM THE WRIST', Math.min(660, E0[0] - 60), E0[1] + 170, '#FFD447', kw * ramp(t, c.rebuild + 0.25, c.rebuild + 0.45), 32);
  // the ball, at us
  if (!ballIn) {
    const wW = toWorld(st, r.wrR), W0 = toScreen(cam, wW[0], wW[1]);
    const u = clamp((t - c.throw) / (c.thwack - c.throw)), e = u * u;
    const bx = lerp(W0[0], 560, e), by = lerp(W0[1], 860, e), br = lerp(18, 420, e * e);
    screenSpace();
    if (u < 1) { baseball(ctx, bx, by, br, t * 18); softDot(gctx, bx * 0.5, by * 0.5, br * 0.7, '#FFFFFF', 0.25); }
  }
  return { glow: 0.85, flash: 0.75 * bumpAt(t, c.thwack, 7) * (t >= c.thwack ? 1 : 0), zblur: 0.05 * ramp(t, c.throw, c.thwack) * (t < c.thwack ? 1 : 0), zcx: 560, zcy: 860 };
};

// ---------------------------------------------------------------- the button: no cord? the other arm ... or ask a pitcher
SC.button = (lt, t, shot) => {
  const c = cu();
  const upL = ramp(t, c.check - 0.08, c.check + 0.3, E.outBack) * (1 - ramp(t, c.loop_in - 0.42, c.loop_in - 0.06, E.inOutSine));
  const armL = armMix(WT_ARM.restL, WT_ARM.upL, upL);
  const HR = { view: 0, opp: 1, flex: lerp(1, 0.12, ramp(t, c.loop_in - 0.5, c.loop_in, E.inOutSine)), cord: 0, gone: 1 };
  const HL = upL > 0.05 ? { view: 0, opp: ramp(t, c.check + 0.1, c.other, E.inOutSine), flex: ramp(t, c.other - 0.05, c.arm2_end), cord: 0 } : null;
  let face = lerpFace(VF.sad, VF.huhL, ramp(t, c.check - 0.1, c.check + 0.15));
  face = lerpFace(face, VF.sadL, ramp(t, c.arm2_end, c.arm2_end + 0.2));
  face = lerpFace(face, VF.caught, ramp(t, c.ask - 0.1, c.ask + 0.15));
  face = lerpFace(face, VF.focus, ramp(t, c.loop_in - 0.45, c.loop_in - 0.1));
  const A = { face, HR, HL, armR: WT_ARM.up, armL, headDX: 3 * Math.sin(t * 1.7), headDY: 1.2 * Math.sin(t * 2.3), bob: Math.sin(t * 2.3),
    headRot: -0.07 * ramp(t, c.check - 0.1, c.check + 0.15) * (1 - ramp(t, c.ask - 0.1, c.ask + 0.15)), handRot: -0.04, handRotL: 0.04 };
  const wide = ramp(t, c.check - 0.15, c.check + 0.2, E.inOutCubic) * (1 - ramp(t, c.loop_in - 0.45, c.loop_in, E.inOutCubic));
  const k0 = camKeys(t, [[shot.start, 614, 1058, 3.2], [c.nocord_end, 618, 1060, 3.28]], E.inOutCubic);
  const cam = { x: lerp(k0.x, 540, wide), y: lerp(k0.y, 1060, wide), zoom: lerp(k0.zoom, 2.25, wide), rot: 0 };
  // the very end hands over to the loop: the hook's camera at -0.4 s
  const ho = ramp(t, c.loop_in - 0.45, c.loop_in, E.inOutCubic), hc = hookCam(-0.4);
  cam.x = lerp(cam.x, hc.x, ho); cam.y = lerp(cam.y, hc.y, ho); cam.zoom = lerp(cam.zoom, hc.zoom, ho);
  const Hh = roomDraw(t, { cam, A });
  const pR = Hh.hp([0, 26]);
  cordRing(cam, pR, popK(t, c.nocord - 0.05, c.check - 0.05, 0.14, 0.1), t, '#FF5A6E', 60);
  if (HL) cordRing(cam, Hh.hpL([0, 26]), popK(t, c.arm2_end, c.ask, 0.12, 0.1), t, '#FF5A6E', 56);
  // or ask a pitcher: a round window with the pitcher (him, in his cap) tipping his cap, the cord in his elbow
  const kw = ramp(t, c.ask - 0.05, c.ask + 0.18, E.outBack) * (1 - ramp(t, c.loop_in - 0.5, c.loop_in - 0.25, E.inCubic));
  if (kw > 0.01) pitcherWindow(760, 690, 170 * kw, t, ramp(t, c.pitcher2_end - 0.05, c.pitcher2_end + 0.25));
  return { glow: 0.85 };
};
// the pitcher in a round window (screen space): head and shoulders, the cap, a wink, his elbow glowing
function pitcherWindow(x, y, R, t, wink) {
  if (R <= 2) return;
  screenSpace();
  ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.fillStyle = '#1F6B3C'; ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.clip();
  paint(() => {
    const g = ctx.createLinearGradient(0, y - R, 0, y + R); g.addColorStop(0, '#16204A'); g.addColorStop(0.55, '#1F6B3C'); g.addColorStop(1, '#0E3A22');
    ctx.fillStyle = g; ctx.fillRect(x - R, y - R, 2 * R, 2 * R);
    softDot(ctx, x - R * 0.6, y - R * 0.7, R * 0.7, '#FFF4D6', 0.35);
    const s = R / 170;
    let p = { hipY: -222, lean: 0, armL: { a: 0.2, b: 0.1 }, armR: { a: 0.2, b: 0.1 }, legL: { a: 0.07, b: 0 }, legR: { a: 0.07, b: 0 }, hand: 'thumb', feetFront: 0 };
    p = armAt(p, 'R', [150, -330], [170, -440]);   // his arm up: a thumbs-up by his face
    const face = { ...VF.pleased, lookX: 0, lookY: 0, shutL: clamp(wink), mouth: 'grin', mouthOpen: 0.5 };
    const st = { x: x - 6 * s, y: y + 600 * s, s: 1.25 * s, pose: p, face, seed: 4, noLegs: true };
    ctx.save(); drawCharacterRig(ctx, st, t, PITCHPAL); ctx.restore();
    const r = rig(p), hd = toWorld(st, r.head);
    ctx.save(); ctx.translate(hd[0], hd[1]); ctx.scale(st.s, st.s); pitchCap(ctx, 1); ctx.restore();
    const el = toWorld(st, r.elR);
    softDot(ctx, el[0], el[1], 26 * s, '#FFD447', 0.9);
  });
  ctx.restore();
  paint(() => { ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.lineWidth = 7; ctx.strokeStyle = '#FFD447'; ctx.stroke(); });
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); gctx.beginPath(); gctx.arc(x, y, R, 0, 7); gctx.lineWidth = 14; gctx.strokeStyle = 'rgba(255,212,71,0.45)'; gctx.stroke(); gctx.restore();
}

// ---------------------------------------------------------------- the cover (src/cover.sh renders it on its own)
SC.cover = (lt, t, shot) => {
  const A = { face: VF.wow, HR: { view: 0, opp: 1, flex: 1, cord: 1, pop: 0.6 }, armR: WT_ARM.up, handRot: -0.04 };
  const cam = { x: 600, y: 1050, zoom: 3.0, rot: 0 };
  const Hh = roomDraw(1.2, { cam, A });
  cordRing(cam, Hh.hp([0, 26]), 1, 0.4);
  bigWord('GOT THIS?', 540, 560, 150, '#FFD447', 1, -0.05);
  bigWord('1 IN 7 DON\'T', 540, 1440, 104, '#FFFFFF', 1, -0.03);
  return { glow: 0.85 };
};

function initScenes2() {
  initRoom();
  initJungle();
  initPark();
}
