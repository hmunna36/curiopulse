// Why Can't You NOT Think of a White Bear? Short: the shots. Each SC.<id>(lt, t, shot) draws one frame
// (lt = seconds inside the shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
// hook + guard + poster are ONE picture as a function of t (headScene): him at the campfire, eyes squeezed shut,
// fingers on his temples; his thought bubble beside him; the guard's lookout growing out of his hair.
'use strict';

const cu = () => TLd.cues;
const bumpAt = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);
const pulseOf = (t, times, len = 0.16) => times.reduce((m, f) => Math.max(m, clamp((t - f) / 0.03) * clamp((f + len - t) / 0.05)), 0);
const lastOf = (t, times) => times.reduce((m, f) => (f <= t && f > m ? f : m), -99);
const wbL2 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the campfire at night: the fire low on the right is the rim, the key a warm wash from above
const FIRE_LIGHT = { ...LIGHTS.lanterns, rimAmt: 1.2, pool: 0.5 };
const NIGHT_LIGHT = { ...LIGHTS.night, rimFrom: [-0.85, -0.3], rim: [1.0, 0.72, 0.42], rimAmt: 1.0 };   // the lit tent behind him, on the left
const LAB_LIGHT = { ...flipLight(LIGHTS.day), rimAmt: 0.7, pool: 0.3 };
setLights({ hook: FIRE_LIGHT, guard: FIRE_LIGHT, poster: FIRE_LIGHT, button: FIRE_LIGHT, loop: FIRE_LIGHT, cover: FIRE_LIGHT, lab: LAB_LIGHT, night: NIGHT_LIGHT });

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
  const star = (R, fill) => { ctx.beginPath(); for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2, rr = i % 2 ? R * 0.72 : R; ctx.lineTo(Math.cos(a) * rr * 1.25, Math.sin(a) * rr); } ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); };
  star(r + 10, '#0B0B1A'); star(r, col);
  ctx.font = `400 ${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = 10; ctx.strokeStyle = '#0B0B1A'; ctx.strokeText(txt, 0, 6); ctx.fillStyle = '#FFFFFF'; ctx.fillText(txt, 0, 6);
  ctx.restore();
  softDot(gctx, x, y, r * 1.6, col, 0.35 * clamp(k));
}
// sparkles and a ring where a thought pops in or out (screen space)
function popSparks(x, y, k, z = 1, col = '#BFF4FF') {
  if (k <= 0.01 || k >= 0.99) return;
  screenSpace();
  for (let i = 0; i < 10; i++) {
    const a = i / 10 * Math.PI * 2 + 0.3, d = (30 + 120 * E.outCubic(k)) * z * (0.7 + 0.5 * hash(i * 3.3)), r = (9 - 7 * k) * z;
    const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d;
    paint(() => { line(ctx, px - r, py, px + r, py, 3 * z, rgba('#FFFFFF', 1 - k)); line(ctx, px, py - r, px, py + r, 3 * z, rgba('#FFFFFF', 1 - k)); });
    softDot(gctx, px, py, 26 * z, col, 0.6 * (1 - k));
  }
  paint(() => { ctx.beginPath(); ctx.arc(x, y, (20 + 90 * E.outCubic(k)) * z, 0, 7); ctx.lineWidth = 6 * z * (1 - k); ctx.strokeStyle = rgba('#FFFFFF', 0.9 * (1 - k)); ctx.stroke(); });
}
// a puff of smoke where a thought vanished (screen space)
function poofPuff(x, y, k, z = 1) {
  if (k <= 0.01 || k >= 0.99) return;
  screenSpace();
  paint(() => { for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2 + 0.4, d = (14 + 60 * E.outCubic(k)) * z; circle(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d * 0.8, (20 + 12 * hash(i * 2.7)) * z * (1 - 0.75 * k), rgba('#FFFFFF', 0.92 * (1 - k))); } });
}
// a green tick / red cross in a disc (screen space)
function verdictDisc(x, y, r, k, ok) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  circle(ctx, 0, 0, r + 7, '#FFFFFF'); circle(ctx, 0, 0, r, ok ? '#12B25C' : '#E8343C');
  ctx.lineWidth = r * 0.24; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#FFFFFF'; ctx.beginPath();
  if (ok) { ctx.moveTo(-r * 0.45, 0); ctx.lineTo(-r * 0.1, r * 0.36); ctx.lineTo(r * 0.5, -r * 0.34); }
  else { ctx.moveTo(-r * 0.38, -r * 0.38); ctx.lineTo(r * 0.38, r * 0.38); ctx.moveTo(r * 0.38, -r * 0.38); ctx.lineTo(-r * 0.38, r * 0.38); }
  ctx.stroke(); ctx.restore();
}

// ================================================================ him at the campfire
const WBH = { x: 400, y: CAMP.GY + 40, s: 1 };           // his feet (world); his head's centre is then (400, 870)
// arms (rig-local elbow + wrist): fingertips on the temples; one hand down; a thumbs-up
const ARM_TEMPLE_R = { e: [176, -332], w: [104, -420] };
const ARM_TEMPLE_L = { e: [-176, -332], w: [-104, -420] };
const ARM_PRESS_R = { e: [168, -338], w: [98, -428] };     // pressing harder: the wrists in a little
const ARM_PRESS_L = { e: [-168, -338], w: [-98, -428] };
const ARM_DOWN_R = { e: [104, -282], w: [100, -200] };
const ARM_DOWN_L = { e: [-104, -282], w: [-100, -200] };
// his faces
const HF = {
  squeeze: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 1.0, browTilt: 1.25, mouth: 'grimace', mouthOpen: 1, blink: 1, cross: 0, squeeze: 1 },
  hard: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 1.25, browTilt: 1.5, mouth: 'grimace', mouthOpen: 1, blink: 1, cross: 0, squeeze: 1 },
  dismay: { eyeOpen: 1.25, pupil: 0.7, lookX: 0.85, lookY: -0.9, browY: 1.35, browTilt: 0.95, mouth: 'o', mouthOpen: 0.55, blink: 0, cross: 0, squeeze: 0 },
  peek: { eyeOpen: 1.05, pupil: 0.9, lookX: 0.6, lookY: -0.25, browY: 0.6, browTilt: -0.3, mouth: 'flat', mouthOpen: 0.2, blink: 0, cross: 0, squeeze: 0.25, shutR: 1 },
  smug: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 0.7, browTilt: 0.3, mouth: 'grin', mouthOpen: 0.7, blink: 1, cross: 0, squeeze: 0.6 },
  horror: { eyeOpen: 1.4, pupil: 0.5, lookX: 0.8, lookY: -0.85, browY: 1.5, browTilt: 0.5, mouth: 'scream', mouthOpen: 0.8, blink: 0, cross: 0, squeeze: 0 },
  wide: { eyeOpen: 1.35, pupil: 0.45, lookX: 0.1, lookY: -0.2, browY: 0.9, browTilt: 0.6, mouth: 'flat', mouthOpen: 0.1, blink: 0, cross: 0, squeeze: 0 },
  cringe: { eyeOpen: 0.9, pupil: 0.6, lookX: 0.6, lookY: -0.8, browY: 1.1, browTilt: 1.2, mouth: 'grimace', mouthOpen: 1, blink: 0.35, cross: 0, squeeze: 0.4 },
};
// the head scene's state at time t (valid at negative t: the loop's last frames are the hook's)
function headA(t) {
  const c = cu();
  // the face: squeezing; a look at the bubble on "Too late"; harder on "Keep trying"; anguish when the bear's back
  let face = HF.squeeze;
  face = lerpFace(face, HF.dismay, popK(t, c.too + 0.04, c.late_end + 0.2, 0.08, 0.14));
  face = lerpFace(face, HF.hard, popK(t, c.keep - 0.05, c.every + 0.3, 0.12, 0.4));
  face = lerpFace(face, HF.cringe, popK(t, c.pops[0] + 0.05, 99, 0.12, 0.1));
  const strain = 0.6 + 0.4 * popK(t, c.keep - 0.05, c.every + 0.3, 0.12, 0.4) + 0.5 * bumpAt(t, c.white, 5);
  const press = clamp(0.5 + 0.5 * Math.sin(t * 5.3)) * 0.3 + 0.7 * popK(t, c.keep - 0.05, c.every + 0.3, 0.12, 0.4);
  const armR = armMix(ARM_TEMPLE_R, ARM_PRESS_R, press), armL = armMix(ARM_TEMPLE_L, ARM_PRESS_L, press);
  // the head shakes hard on "Keep trying" (he shakes the bear out)
  const shakeOut = popK(t, c.keep + 0.05, c.keep + 0.7, 0.06, 0.12);
  return {
    face, armR, armL,
    headDX: 1.6 * strain * Math.sin(t * 47) + 9 * shakeOut * Math.sin(t * 31),
    headDY: -3 * bumpAt(t, c.white, 8),
    headRot: 0.025 * Math.sin(t * 2.1) + 0.05 * shakeOut * Math.sin(t * 31) + 0.06 * popK(t, c.too + 0.04, c.late_end + 0.2, 0.08, 0.14),
  };
}
// the hero, lit by the fire, with his hands drawn again over his head (fingertips on the temples)
function wbHero(cam, t, A, o = {}) {
  let pose = { ...POSES.stand, hand: 'point' };
  pose = armAt(pose, 'R', A.armR.e, A.armR.w); pose = armAt(pose, 'L', A.armL.e, A.armL.w);
  if (A.handR) pose.handR = A.handR;
  if (A.handL) pose.handL = A.handL;
  const st = { x: WBH.x, y: WBH.y, s: WBH.s, pose, face: A.face, headDX: A.headDX || 0, headDY: A.headDY || 0, headRot: A.headRot || 0, seed: 3 };
  const pal = o.pal || PAL;
  const r = campChar(cam, st, t, { pal, ambient: 0.1, post: (lc, rr) => {
    rigSpace(lc, st, (c) => {
      // the forearms and hands again, over his head (the rig draws the head last)
      for (const [side, k] of [[-1, 'L'], [1, 'R']]) {
        const el = rr['el' + k], wr = rr['wr' + k], d = rr['armDir' + k];
        if ((pose['hand' + k] || pose.hand) === 'point' && wr[1] < -380) {
          capsuleShaded(c, el, wr, 38, pal.coat, pal.coatSh, pal.coatHi, pal);
          line(c, wr[0] - d[0] * 6, wr[1] - d[1] * 6, wr[0] + d[0] * 2, wr[1] + d[1] * 2, 42, pal.coatSh);
          drawHand(c, wr, d, 'point', pal, side, t);
        }
      }
      if (o.post) o.post(c, rr, st);
    });
  } });
  return { st, r, hp: (q) => headPt(st, r, q) };
}

// ---------------------------------------------------------------- the guard on his lookout
const GUARD_S = 0.22;
const G_ARMS = {
  rest: { R: { e: [96, -300], w: [86, -222] }, L: { e: [-96, -300], w: [-86, -222] } },
  salute: { R: { e: [128, -400], w: [62, -500] }, L: { e: [-96, -300], w: [-86, -222] } },
  binos: { R: { e: [96, -372], w: [30, -462] }, L: { e: [-96, -372], w: [-30, -462] } },
  whisper: { R: { e: [112, -352], w: [58, -446] }, L: { e: [-96, -300], w: [-86, -222] } },
  unfold: { R: { e: [100, -318], w: [44, -330] }, L: { e: [-100, -318], w: [-44, -330] } },
  show: { R: { e: [150, -404], w: [238, -470] }, L: { e: [60, -360], w: [150, -446] } },
};
const GF = {
  proud: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 0.5, browTilt: -0.3, mouth: 'grin', mouthOpen: 0.5, blink: 0, cross: 0 },
  focus: { eyeOpen: 0.8, pupil: 1, lookX: 0.2, lookY: 0, browY: 0.1, browTilt: -0.6, mouth: 'flat', mouthOpen: 0, blink: 0.2, cross: 0 },
  whisper: { eyeOpen: 1.1, pupil: 0.9, lookX: -0.6, lookY: 0, browY: 0.8, browTilt: 0.4, mouth: 'o', mouthOpen: 0.25, blink: 0, cross: 0 },
  puzzled: { eyeOpen: 1.1, pupil: 0.9, lookX: 0.4, lookY: -0.5, browY: 1.0, browTilt: 0.9, mouth: 'wavy', mouthOpen: 0.3, blink: 0, cross: 0 },
  eager: { eyeOpen: 1.2, pupil: 0.8, lookX: 0.9, lookY: -0.4, browY: 1.1, browTilt: 0.2, mouth: 'grin', mouthOpen: 1, blink: 0, cross: 0 },
};
// what the guard is doing at t: the lookout grows, salute, binoculars that sweep, a whisper, the poster out and up
function guardA(t) {
  const c = cu();
  const up = ramp(t, c.hired - 0.05, c.hired + 0.4, (x) => E.outBack(x, 2.2));
  let arms = G_ARMS.salute, face = GF.proud, sweep = 0;
  const binos = ramp(t, c.watch - 0.15, c.watch + 0.15, E.inOutCubic) * (1 - ramp(t, c.any - 0.15, c.any + 0.1));
  const mixArms = (a, b, k) => ({ R: armMix(a.R, b.R, k), L: armMix(a.L, b.L, k) });
  arms = mixArms(G_ARMS.salute, G_ARMS.rest, ramp(t, c.guard_end, c.watch - 0.15));
  arms = mixArms(arms, G_ARMS.binos, binos);
  if (binos > 0.5) { face = GF.focus; sweep = Math.sin((t - c.watch) * 2.6) * ramp(t, c.watch, c.watch + 0.4) * 0.6 + Math.sin((t - c.every) * 4.4) * popK(t, c.every, c.any, 0.2, 0.15) * 0.4; }
  const wh = popK(t, c.any - 0.1, c.but + 0.1, 0.15, 0.2);
  arms = mixArms(arms, G_ARMS.whisper, wh);
  if (wh > 0.5) face = GF.whisper;
  const unf = ramp(t, c.but + 0.1, c.spot_one, E.inOutCubic) * (1 - ramp(t, c.has - 0.1, c.picture - 0.05, E.inOutCubic));
  arms = mixArms(arms, G_ARMS.unfold, unf);
  const show = ramp(t, c.has - 0.1, c.picture - 0.04, E.inOutCubic);
  arms = mixArms(arms, G_ARMS.show, show);
  if (t > c.but) face = GF.puzzled;
  if (t > c.picture - 0.1) face = GF.eager;
  // the poster bobs up on every pop
  const bob = c.pops.reduce((m, f) => Math.max(m, bumpAt(t, f, 7) * (t >= f ? 1 : 0)), 0);
  const posterK = ramp(t, c.spot - 0.1, c.has, E.outCubic);
  return { up, arms, face, sweep, binos, posterK: t > c.but ? posterK : 0, show, bob, whisper: wh };
}
// the lookout and the guard, from his crown (world). Returns the guard's rig and the poster's world centre
function wbLookout(cam, t, Hh, GA) {
  if (GA.up <= 0.01) return null;
  const base = Hh.hp([0, -82]), G = wbTowerGeo(base, 1, GA.up);
  applyCam(cam);
  wbTowerBack(ctx, G, t);
  let pose = { ...POSES.stand, hand: 'open' };
  pose = armAt(pose, 'R', GA.arms.R.e, GA.arms.R.w); pose = armAt(pose, 'L', GA.arms.L.e, GA.arms.L.w);
  const gs = GUARD_S * G.u;
  const gst = { x: G.foot[0] + 3 * Math.sin(t * 1.7), y: G.foot[1], s: gs, pose, face: GA.face, noLegs: true, headRot: 0.18 * GA.sweep + 0.04 * Math.sin(t * 2), headDX: 0, headDY: 0, seed: 5 };
  let posterW = null;
  const r = campChar(cam, gst, t, { pal: RANGER, ambient: 0.08, post: (lc, rr) => {
    headSpace(lc, rr, gst, (c) => { wbHat(c); if (GA.binos > 0.5) wbBinos(c); });
    rigSpace(lc, gst, (c) => {
      // a gold star badge on his chest
      paint(() => { c.save(); c.translate(-38, -340); c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr2 = i % 2 ? 7 : 16; c.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2); } c.closePath(); c.fillStyle = '#FFD447'; c.fill(); c.restore(); });
      // the poster: folded at his chest, then held out to his right (screen right), toward the bubble
      if (GA.posterK > 0.01) {
        const pc = wbL2([0, -360], [214, -520 - 30 * GA.bob], GA.show);
        c.save(); c.translate(pc[0], pc[1]); c.rotate(lerp(0, -0.1, GA.show));
        wbPoster(c, 190, 240, GA.posterK, t);
        c.restore();
        posterW = toWorld(gst, pc);
        // his hands on its edges
        for (const k of ['R', 'L']) { const wr = rr['wr' + k]; circle(c, wr[0], wr[1], 21, RANGER.skinSh); circle(c, wr[0] - 2, wr[1] - 2, 18, RANGER.skin); }
      }
    });
  } });
  applyCam(cam);
  wbTowerFront(ctx, G, t);
  return { gst, r, posterW, G };
}

// ---------------------------------------------------------------- the bubble and what is in it
// where the bubble sits (world), by time: beside his head in the hook; up and right when the lookout is there
function bubbleW(t) {
  const c = cu(), k = ramp(t, c.brain, c.guard_end, E.inOutCubic);
  return { x: lerp(494, 548, k), y: lerp(742, 700, k), w: lerp(132, 118, k), h: lerp(98, 90, k) };
}
// the bear(s) in the bubble at t: [{k (pop 0..1), out (poof 0..1), dx, dy, s}]
function bubbleBears(t) {
  const c = cu(), out = [];
  const gone1 = c.keep + 0.42;
  if (t >= c.white - 0.02 && t < gone1 + 0.4) out.push({ k: ramp(t, c.white, c.white + 0.3), out: ramp(t, gone1, gone1 + 0.3), dx: 0, dy: 6, s: 1, wave: ramp(t, c.white + 0.25, c.white + 0.6), seed: 0 });
  const P = c.pops;
  const pos = [[[0, 6, 1]], [[-0.24, 8, 0.8], [0.25, 4, 0.8]], [[-0.3, 10, 0.68], [0.3, 10, 0.68], [0, -2, 0.74]]];
  for (let i = 0; i < 3; i++) {
    if (t < P[i] - 0.02) continue;
    const nxt = i < 2 ? P[i + 1] : 99;
    if (t >= nxt) continue;
    pos[i].forEach(([dx, dy, s], j) => out.push({ k: ramp(t, P[i] + (j === pos[i].length - 1 ? 0 : 0), P[i] + 0.22), out: 0, dx, dy, s, wave: j % 2 ? 1 : ramp(t, P[i] + 0.2, P[i] + 0.4), seed: i * 3 + j, held: j < (i === 0 ? 0 : pos[i - 1].length) }));
  }
  return out;
}
function drawBubbleHead(cam, t, Hh, o = {}) {
  const c = cu(), B = bubbleW(t);
  const P = toScreen(cam, B.x, B.y), z = cam.zoom, w = B.w * z, h = B.h * z;
  const tail = toScreen(cam, ...Hh.hp([48, -76]));
  const bears = bubbleBears(t);
  const bump = c.pops.reduce((m, f) => Math.max(m, bumpAt(t, f, 9) * (t >= f ? 1 : 0)), 0) + bumpAt(t, c.white, 8);
  // the bubble steps out of frame while the camera is close on the guard, and pops back for "Keep trying" and the poster
  const away = Math.max(popK(t, c.watch - 0.15, c.keep - 0.05, 0.18, 0.18), popK(t, c.any - 0.15, c.picture - 0.35, 0.18, 0.18));
  const kIn = (o.k === undefined ? 1 : o.k) * (1 - away);
  wbBubble(P[0], P[1], w, h, kIn, tail, (x, y, s) => {
    for (const b of bears) {
      if (b.out >= 0.999) continue;
      const pop = b.held ? 1 : E.outBack(clamp(b.k), 2.6), sc = (h * 0.0058) * b.s * pop * s * (1 - 0.9 * b.out);
      if (sc <= 0.001) continue;
      wbBear(ctx, x + b.dx * w, y + b.dy * z * 0.4 + h * 0.06 + 6 * Math.sin(t * 3 + b.seed), sc, t, { wave: b.wave, grin: 1, look: [0, -0.2] });
    }
  }, { bump });
  // pops and poofs round the bubble
  for (const f of [c.white, ...c.pops]) popSparks(P[0], P[1], ramp(t, f, f + 0.45, (x) => x), z / 3.1);
  poofPuff(P[0], P[1] + h * 0.06, ramp(t, c.keep + 0.42, c.keep + 0.9, (x) => x), z / 3.1);
  return { P, w, h };
}

// ---------------------------------------------------------------- the camera of the head scene (valid at negative t)
const HOOK_CAM = [432, 831, 3.1];
function headCam(t) {
  const c = cu();
  const WIDE = [445, 801, 2.45], GUARDC = [410, 762, 3.45], POSTW = [480, 775, 3.0];
  const k = camKeys(t, [[-0.45, 431, 832, 3.0], [0, ...HOOK_CAM], [c.go, 433, 832, 3.18], [c.too, 434, 830, 3.22], [c.brain, 434, 829, 3.18],
    [c.guard_end, ...WIDE], [c.watch + 0.05, ...GUARDC], [c.bears1 + 0.45, 412, 760, 3.55], [c.keep + 0.12, ...WIDE], [c.every + 0.3, 444, 798, 2.5],
    [c.any - 0.05, ...GUARDC], [c.bears2_end + 0.4, 412, 760, 3.5], [c.spot_one, 414, 758, 3.55], [c.has, 418, 760, 3.5], [c.picture - 0.1, ...POSTW], [c.pops[2] + 0.4, 482, 774, 3.08]], E.inOutCubic);
  if (t >= 0 && t < 0.4) k.zoom *= lerp(1.0, 1.02, E.outCubic(t / 0.4));
  const sh = bumpAt(t, c.white, 10) + 0.8 * bumpAt(t, c.hired, 9) + c.pops.reduce((m, f) => m + 0.6 * bumpAt(t, f, 10), 0) + 0.6 * bumpAt(t, c.too, 10);
  k.x += 3 * sh * Math.sin(t * 57); k.y += 4 * sh * Math.sin(t * 43);
  return k;
}
// the whole head scene at t, with this camera
function headScene(cam, t, o = {}) {
  const c = cu();
  campBack(cam, t, { soft: 0.9, fire: 1 });
  applyCam(cam);
  const A = o.A || headA(t);
  const Hh = wbHero(cam, t, A);
  const GA = o.noGuard ? { up: 0 } : guardA(t);
  const L = wbLookout(cam, t, Hh, GA);
  // the poster's beam into the bubble on every pop
  if (L && L.posterW) {
    const B = bubbleW(t), beam = c.pops.reduce((m, f) => Math.max(m, popK(t, f - 0.04, f + 0.38, 0.05, 0.2)), 0);
    if (beam > 0.01) {
      applyCam(cam);
      const a = L.posterW, b = [B.x - B.w * 0.25, B.y];
      both((cc, gl) => {
        cc.beginPath(); cc.moveTo(a[0], a[1] - 14); cc.lineTo(b[0], b[1] - B.h * 0.32); cc.lineTo(b[0], b[1] + B.h * 0.32); cc.lineTo(a[0], a[1] + 14); cc.closePath();
        cc.fillStyle = rgba('#FFF4C8', (gl ? 0.45 : 0.22) * beam); cc.fill();
      });
    }
  }
  const Bd = o.noBubble ? null : drawBubbleHead(cam, t, Hh, o.bubble || {});
  return { Hh, GA, L, Bd };
}

// ================================================================ the shots
SC.hook = (lt, t, shot) => {
  const c = cu(), cam = headCam(t);
  const S = headScene(cam, t);
  // the countdown: up on "Five", running from "Go!", red on "Too late"
  const tk = popK(t, c.five, c.brain + 0.2, 0.12, 0.2), v = 5 - clamp((t - c.go) / 5, 0, 1) * 5;
  const fail = t >= c.too ? 1 : 0;
  wbTimer(210, 640, 82, t >= c.go ? (fail ? 5 - (c.too - c.go) : v) : 5, tk, fail);
  verdictDisc(285, 565, 40, popK(t, c.too + 0.02, c.brain + 0.2, 0.08, 0.2), false);
  return { glow: 0.85, capY: 1470, flash: 0.1 * bumpAt(t, c.white, 12) };
};
SC.guard = (lt, t, shot) => {
  const c = cu(), cam = headCam(t);
  const S = headScene(cam, t);
  // "any bears?": a small question mark over the guard's hat
  if (S.L) {
    const q = toScreen(cam, ...toWorld(S.L.gst, [150, -560]));
    tagPill('?', q[0], q[1], '#FFD447', popK(t, c.any + 0.05, c.but, 0.1, 0.12), 46);
  }
  // the timer pops out early in this shot
  const tk = popK(t, c.five, c.brain + 0.2, 0.12, 0.2);
  wbTimer(210, 640, 82, 5 - (c.too - c.go), tk, 1);
  verdictDisc(285, 565, 40, popK(t, c.too + 0.02, c.brain + 0.2, 0.08, 0.2), false);
  return { glow: 0.85, capY: 1470 };
};
SC.poster = (lt, t, shot) => {
  const c = cu(), cam = headCam(t);
  const S = headScene(cam, t);
  // BEAR! on each pop, over the bubble
  if (S.Bd) c.pops.forEach((f, i) => burstWord(['BEAR!', 'BEAR!', 'BEAR!!'][i], S.Bd.P[0] - 20 + 50 * i, S.Bd.P[1] - S.Bd.h * 0.62, 70, '#FF5A6E', popK(t, f + 0.04, (i < 2 ? c.pops[i + 1] : f + 0.6), 0.08, 0.1), -0.1 + 0.08 * i, 52));
  return { glow: 0.85, capY: 1470, flash: c.pops.reduce((m, f) => Math.max(m, 0.1 * bumpAt(t, f, 12)), 0) };
};

// ---------------------------------------------------------------- the 1987 study
const LAB_HERO = { x: 679, y: 1352, s: 0.95 };
function labVolBear(cam, t, x, headY, who) {
  const c = cu(), times = c.dings.filter((_, j) => c.ding_who[j] === who);
  const f = lastOf(t + 0.22, times);
  const k = f > 0 ? popK(t, f - 0.22, f + 0.42, 0.06, 0.12) : 0;
  if (k <= 0.01) return;
  const P = toScreen(cam, x + 40, headY - 150), z = cam.zoom;
  wbBubble(P[0], P[1], 150 * z * 0.75, 112 * z * 0.75, k, toScreen(cam, x + 14, headY - 70), (bx, by, s) => wbBear(ctx, bx, by + 6, 0.62 * z * 0.75 * s, t, { wave: 1, grin: 1 }));
}
SC.lab = (lt, t, shot) => {
  const c = cu();
  const cam = camKeys(t, [[shot.start, 660, 905, 1.42], [c.people, 680, 915, 1.34], [c.over - 0.1, 682, 912, 1.32], [c.minute, 630, 830, 1.55], [shot.end, 624, 822, 1.6]], E.inOutCubic);
  const sweep = ramp(t, c.study, shot.end, (x) => x) * 5;
  wbLabBg(cam, t, sweep);
  applyCam(cam);
  // the volunteers either side of him (lemon-mouth-water's), looking up at their bubbles when they ring
  // him in the middle: eyes shut, his right hand over his bell; he slaps it on his rings
  const mine = c.dings.filter((_, j) => c.ding_who[j] === 1), fm = lastOf(t, mine);
  const slap = fm > 0 ? 1 - ramp(t, fm, fm + 0.25) : 0, wind = Math.max(...mine.map((f) => popK(t, f - 0.2, f, 0.12, 0.01)));
  let pose = { ...POSES.stand, hand: 'open' };
  const armR = { e: [118, -300], w: [lerp(64, 58, slap), lerp(-232, -206, slap) - 30 * wind] };
  pose = armAt(pose, 'R', armR.e, armR.w); pose = armAt(pose, 'L', [-110, -300], [-70, -214]);
  const annoyed = fm > 0 ? popK(t, fm - 0.15, fm + 0.5, 0.08, 0.2) : 0;
  const face = lerpFace(HF.squeeze, HF.cringe, annoyed);
  const st = { x: LAB_HERO.x, y: LAB_HERO.y, s: LAB_HERO.s, pose, face, noLegs: true, headDX: 1.2 * Math.sin(t * 41), headRot: 0.02 * Math.sin(t * 2), seed: 3 };
  charLayer(cam, st, t, { pal: PAL });
  applyCam(cam);
  const V = [[538, 1159, 1.1, 0, LMV[0]], [820, 1159, 1.1, 2, LMV[1]]];
  for (const [x, y, s, who, L] of V) {
    const times = c.dings.filter((_, j) => c.ding_who[j] === who), f = lastOf(t, times), up = f > 0 ? popK(t, f - 0.25, f + 0.5, 0.1, 0.2) : 0;
    actor(() => lmVol(ctx, x, y, s, t, { L, puff: 0, look: [0.3 * (who === 0 ? 1 : -1), lerp(0.2, -1, up)], wide: up, tilt: 0.06 * Math.sin(t * 1.3 + who) }));
  }
  lmBench(cam, t);
  // the bells, rung on cue
  const BX = [568, 735, 850];
  [0, 1, 2].forEach((who) => {
    const times = c.dings.filter((_, j) => c.ding_who[j] === who), f = lastOf(t, times);
    const hit = f > 0 ? 1 - ramp(t, f, f + 0.18) : 0;
    wbDeskBell(ctx, BX[who], 1156, 1.15, hit);
    if (f > 0) softDot(gctx, BX[who], 1120, 120, '#FFD447', 0.6 * (1 - ramp(t, f, f + 0.4)));
  });
  // their bubbles, then the DINGs
  labVolBear(cam, t, 538, 1159 - 253, 0);
  labVolBear(cam, t, LAB_HERO.x - 40, 906, 1);
  labVolBear(cam, t, 820, 1159 - 253, 2);
  c.dings.forEach((f, j) => {
    const P = toScreen(cam, BX[c.ding_who[j]], 1080);
    burstWord('DING!', P[0] + (j % 2 ? 30 : -30), P[1] - 40, 62, '#FFD447', popK(t, f, f + 0.42, 0.05, 0.12), j % 2 ? 0.12 : -0.12, 44);
  });
  // the study's name, then the verdict
  tagPill('THE WHITE BEAR STUDY, 1987', 540, 480, '#FFFFFF', popK(t, shot.start + 0.1, c.over, 0.12, 0.15), 36);
  const vk = ramp(t, c.once - 0.05, c.once + 0.2);
  if (vk > 0) { screenSpace(); bigWord('1+ A MINUTE', 492, 520, 116, '#4DFFB4', E.outBack(vk, 2), -0.04); }
  return { glow: 0.8, capY: 1560, flash: 0.1 * (1 - ramp(lt, 0, 0.12)) };
};

// ---------------------------------------------------------------- 2 a.m.: the replay
// the awkward wave, in his bubble: he waves at someone who was waving at someone else. u = 0..1 through one play
function waveClip(x, y, w, h, t, u, s) {
  // the ground and a lamp post
  screenSpace();
  const gy = y + h * 0.28;
  ctx.fillStyle = '#9DB2DA'; ctx.fillRect(x - w, gy, w * 2, h);
  // the passer-by walks from right to left, waving past him at someone off to the left
  const k = h / 300;
  const px = lerp(x + w * 0.42, x - w * 0.62, u), wv = Math.sin(t * 14);
  let pp = walkPose(t * 1.0, 9); pp = ikReach(pp, 'L', [-120, -470 + 20 * wv], 1); pp.hand = 'open';
  drawCharacter(ctx, { x: px, y: gy + 4 * k, s: 0.6 * k, pose: pp, face: { ...FACES.grin, lookX: -1 }, seed: 9, headRot: -0.08 }, t, FRPAL);
  // him: waves big, then freezes, his arm sinks, he blushes
  const freeze = ramp(u, 0.55, 0.7), sink = ramp(u, 0.7, 0.95, E.inOutCubic);
  let hp = { ...POSES.stand, hand: 'open' };
  const wvA = Math.sin(t * 16) * (1 - freeze);
  hp = ikReach(hp, 'R', [lerp(150 + 30 * wvA, 70, sink), lerp(-500, -330, sink)], 1);
  const face = lerpFace({ ...FACES.grin, lookX: 0.8 }, { ...FACES.nervous, lookX: -0.6, lookY: 0.4 }, freeze);
  const hx = x - w * 0.26;
  drawCharacter(ctx, { x: hx, y: gy + 4 * k, s: 0.6 * k, pose: hp, face, seed: 3 }, t, PAL);
  const hy = gy - 282 * 0.6 * k;
  if (freeze > 0.5) { ellipse(ctx, hx - 23 * k, hy + 14 * k, 12 * k, 8 * k, rgba('#FF5A6E', 0.7 * freeze)); ellipse(ctx, hx + 23 * k, hy + 14 * k, 12 * k, 8 * k, rgba('#FF5A6E', 0.7 * freeze)); sweatDrop(ctx, hx + 46 * k, hy - 30 * k, 1.1 * k, freeze); }
  if (u < 0.55) { ctx.font = `400 ${Math.round(64 * k)}px Anton`; ctx.textAlign = 'center'; ctx.lineWidth = 8 * k; ctx.strokeStyle = '#FFFFFF'; ctx.strokeText('HI!!', hx + 96 * k, hy - 70 * k); ctx.fillStyle = '#141A36'; ctx.fillText('HI!!', hx + 96 * k, hy - 70 * k); }
}
SC.night = (lt, t, shot) => {
  const c = cu();
  const cam = camKeys(t, [[shot.start, 214, 1000, 2.25], [c.replays, 220, 990, 2.35], [shot.end, 226, 984, 2.45]], E.inOutCubic);
  campBack(cam, t, { soft: 0.75, fire: 0.18, lights: 0.25 });
  applyCam(cam);
  // him sitting up in his sleeping bag at the tent's door, wide awake
  let pose = { ...POSES.sit };
  const blinkOnce = pulseOf(t, [c.moment + 0.1], 0.12);
  const face = { ...HF.wide, blink: blinkOnce, lookX: 0.35 + 0.1 * Math.sin(t * 0.8), lookY: -0.35 };
  const twitch = popK(t, c.replays, c.am + 0.3, 0.05, 0.1);
  const st = { x: 214, y: 1318, s: 1, pose, face, noArms: true, noLegs: true, headDX: 2 * twitch * Math.sin(t * 50), headRot: 0.03 * Math.sin(t * 1.2), seed: 3 };
  const rr0 = rig(pose);
  charLayer(cam, st, t, { pal: PAL, ambient: 0.2, pre: (lc) => rigSpace(lc, st, (cc) => wbHood(cc, rr0)), post: (lc, rr) => rigSpace(lc, st, (cc) => wbBag(cc, st, rr, t)) });
  gctx.save(); gctx.setTransform(1, 0, 0, 1, 0, 0); gctx.globalCompositeOperation = 'destination-out'; gctx.drawImage(layerC, 0, 0, W / 2, H / 2); gctx.restore();
  applyCam(cam);
  // the camping clock beside him
  wbClock(ctx, 94, 1262, 0.6, t, 1);
  // the bubble: the wave, again and again
  const B = toScreen(cam, 262, 852), z = cam.zoom, w = 262 * z, h = 190 * z;
  const play1 = ramp(t, c.cringiest - 0.1, c.replays, (x) => x), play2 = ramp(t, c.replays + 0.28, shot.end, (x) => x);
  const rew = popK(t, c.replays, c.replays + 0.28, 0.02, 0.02);
  const u = rew > 0 ? 1 - ramp(t, c.replays, c.replays + 0.28) : t < c.replays ? play1 : play2;
  wbBubble(B[0], B[1], w, h, ramp(t, shot.start, shot.start + 0.3), toScreen(cam, 240, 960), (x, y, s) => waveClip(x, y, w * 0.5, h * 0.5, t, u, s));
  if (rew > 0) { screenSpace(); bigWord('◀◀', B[0], B[1], 90, '#FFFFFF', rew); }
  tagPill('REPLAY ×999', B[0], B[1] + h * 0.58, '#FF86A6', ramp(t, c.replays, c.replays + 0.2), 40);
  return { glow: 0.8, vhs: 0.5 * rew };
};

// ---------------------------------------------------------------- the button: a red car instead... with the bear at the wheel
function buttonA(t) {
  const c = cu(), D = TLd.duration;
  let face = HF.peek;
  face = lerpFace(face, HF.squeeze, ramp(t, c.picture2 - 0.1, c.picture2 + 0.1));
  face = lerpFace(face, HF.smug, ramp(t, c.instead - 0.1, c.instead + 0.15));
  face = lerpFace(face, HF.squeeze, ramp(t, c.ready - 0.1, c.ready + 0.1));
  face = lerpFace(face, HF.horror, popK(t, c.bear_car + 0.06, c.loop + 0.05, 0.06, 0.12));
  const peekArm = 1 - ramp(t, c.picture2 - 0.25, c.picture2 + 0.05, E.inOutCubic);
  const armR = armMix(ARM_TEMPLE_R, { e: [150, -330], w: [104, -380] }, peekArm * 0.5);
  return { face, armR, armL: ARM_TEMPLE_L, headDX: 1.2 * Math.sin(t * 47) * (1 - peekArm), headDY: -5 * bumpAt(t, c.bear_car + 0.06, 8), headRot: 0.04 * peekArm + 0.03 * Math.sin(t * 2.1) };
}
SC.button = (lt, t, shot) => {
  const c = cu(), D = TLd.duration;
  const cam = camKeys(t, [[shot.start, 438, 828, 3.0], [c.picture2, 436, 830, 3.05], [c.instead, 438, 828, 3.1], [c.ready, 436, 830, 3.12], [c.loop, 431, 832, 3.0]], E.inOutCubic);
  const sh = bumpAt(t, c.honk, 10);
  cam.x += 3 * sh * Math.sin(t * 57); cam.y += 4 * sh * Math.sin(t * 43);
  campBack(cam, t, { soft: 0.9, fire: 1 });
  applyCam(cam);
  const Hh = wbHero(cam, t, buttonA(t));
  // the bubble: empty, then the red car drives in from the right and parks; on "Ready?" the bear pops up at the wheel
  const B = { x: 507, y: 742, w: 136, h: 100 };
  const P = toScreen(cam, B.x, B.y), z = cam.zoom, w = B.w * z, h = B.h * z;
  const drive = ramp(t, c.red - 0.05, c.car + 0.35, E.outCubic), park = bumpAt(t, c.car + 0.35, 7);
  wbBubble(P[0], P[1], w, h, 1, toScreen(cam, ...Hh.hp([48, -76])), (x, y, s) => {
    if (t < c.red - 0.05) return;
    // a road in the bubble
    ctx.fillStyle = '#7A86A6'; ctx.fillRect(x - w, y + h * 0.2, w * 2, h);
    for (let i = -3; i <= 3; i++) { ctx.fillStyle = '#F4F6FF'; ctx.fillRect(x + i * w * 0.2 - ((t * 400) % (w * 0.2)) * (1 - drive), y + h * 0.29, w * 0.08, 5); }
    const cx = lerp(x + w * 0.85, x + w * 0.02, drive);
    wbCar(ctx, cx, y + h * 0.2, h * 0.0062, t, { spin: -t * 20 * (1 - drive), lean: -0.04 * park * Math.sin(t * 30), bear: ramp(t, c.bear_car, c.bear_car + 0.2), honk: popK(t, c.honk, c.honk + 0.35, 0.04, 0.15) });
    if (drive < 0.95) for (let i = 0; i < 3; i++) line(ctx, cx + w * 0.3 + i * 14, y + h * (0.02 + 0.08 * i), cx + w * 0.5 + i * 14, y + h * (0.02 + 0.08 * i), 5, rgba('#FFFFFF', 0.8 * (1 - drive)));
  });
  verdictDisc(P[0] + w * 0.42, P[1] - h * 0.42, 34, popK(t, c.instead + 0.05, c.bear_car, 0.08, 0.1), true);
  burstWord('HONK!', P[0] + w * 0.05, P[1] - h * 0.66, 64, '#FFD447', popK(t, c.honk, c.loop, 0.06, 0.1), -0.1, 46);
  popSparks(P[0] - w * 0.1, P[1], ramp(t, c.bear_car, c.bear_car + 0.4, (x) => x), z / 3.1);
  return { glow: 0.85, capY: 1470 };
};
// the last 0.45 s: back to the picture of frame 1 (the car and the bear poof out of the bubble)
SC.loop = (lt, t, shot) => {
  const c = cu(), tt = t - TLd.duration, cam = headCam(tt);
  campBack(cam, t, { soft: 0.9, fire: 1 });
  applyCam(cam);
  const Hh = wbHero(cam, t, headA(tt));
  drawBubbleHead(cam, tt, Hh);
  const B = bubbleW(tt), P = toScreen(cam, B.x, B.y);
  poofPuff(P[0], P[1], ramp(t, shot.start, shot.start + 0.3, (x) => x), cam.zoom / 3.1);
  return { glow: 0.85, capY: 1470 };
};

// ================================================================ the cover (rendered by src/cover.sh from a one-shot timeline)
SC.cover = (lt, t) => {
  const c = cu(), T0 = c.white + 0.7;
  const A = { ...headA(T0), face: HF.hard, headDX: 0, headRot: -0.02 };
  const cam = { x: 440, y: 752, zoom: 3.0, rot: 0 };
  campBack(cam, T0, { soft: 0.9, fire: 1 });
  applyCam(cam);
  const Hh = wbHero(cam, T0, A);
  const B = { x: 516, y: 752, w: 150, h: 110 };
  const P = toScreen(cam, B.x, B.y), z = cam.zoom;
  wbBubble(P[0], P[1], B.w * z, B.h * z, 1, toScreen(cam, ...Hh.hp([48, -76])), (x, y, s) => wbBear(ctx, x, y + B.h * z * 0.06, B.h * z * 0.0058, T0, { wave: 1, grin: 1 }));
  screenSpace();
  bigWord("DON'T THINK", 540, 548, 138, '#FFFFFF', 1, -0.03);
  bigWord('OF A WHITE BEAR', 540, 676, 104, '#FFD447', 1, -0.03);
  return { glow: 0.85, noCaptions: true };
};

function initScenes2() {
  initCamp();
  initWbLab();
}
