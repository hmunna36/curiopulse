// Can You Say MIT's HARDEST Tongue Twister? 👅 Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds
// inside the shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;
const bumpAt = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);
const pulseOf = (t, times, len = 0.16) => times.reduce((m, f) => Math.max(m, clamp((t - f) / 0.03) * clamp((f + len - t) / 0.05)), 0);
const lastOf = (t, list) => list.reduce((m, f) => (f <= t && f > m ? f : m), -1e9);
const nextOf = (t, list) => list.reduce((m, f) => (f >= t && f < m ? f : m), 1e9);
const sinceK = (t, list, dur) => { const f = lastOf(t, list); return t - f < dur ? (t - f) / dur : 0; };
const shutK = (t, list, pre) => 1 - clamp((nextOf(t, list) - t - 0.015) / pre);   // 1 just before a pop: the spot is shut
const twL2 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
const TW_WPS = 4.5;                                    // his words a second when he rattles the twister (3 shapes a word)

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the club: a spotlight from the top left is the key, the pink neon behind him on the right is the rim
const STAGE_LIGHT = { ...LIGHTS.lanterns, key: [-0.45, -0.72, 0.55], keyTint: [1.08, 1.02, 0.94], rimFrom: [0.9, -0.3], rim: [1.0, 0.42, 0.78], rimAmt: 1.3, haloColor: [1.0, 0.6, 0.85], halo: 0.12, pool: 0.64 };
// inside: the glass head on a dark field
const SEC_LIGHT = { ...LIGHTS.diagram, rim: [0.6, 0.9, 1.0], rimAmt: 0.6 };
// the booth: a cool lamp from the left, the monitor's green on the right
const LAB_LIGHT = { ...LIGHTS.screen, key: [-0.5, -0.7, 0.58], rim: [0.45, 1.0, 0.75], rimAmt: 1.0, pool: 0.62 };
setLights({ hook: STAGE_LIGHT, payoff: STAGE_LIGHT, button: STAGE_LIGHT, loop: STAGE_LIGHT, cover: STAGE_LIGHT, section: SEC_LIGHT, lab: LAB_LIGHT });

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
// a comic burst with a word in it (screen space)
function burstWord(txt, x, y, r, col, k, rot = -0.08, size = 110) {
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
function okTick(x, y, r, k, good = true) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  circle(ctx, 0, 0, r + 6, '#FFFFFF'); circle(ctx, 0, 0, r, good ? '#12B25C' : '#E8344A');
  ctx.lineWidth = r * 0.24; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#FFFFFF'; ctx.beginPath();
  if (good) { ctx.moveTo(-r * 0.45, 0); ctx.lineTo(-r * 0.1, r * 0.36); ctx.lineTo(r * 0.5, -r * 0.34); }
  else { ctx.moveTo(-r * 0.38, -r * 0.38); ctx.lineTo(r * 0.38, r * 0.38); ctx.moveTo(r * 0.38, -r * 0.38); ctx.lineTo(-r * 0.38, r * 0.38); }
  ctx.stroke(); ctx.restore();
}
// a big letter with a dark edge, popping (screen space)
function twLetter(L, x, y, size, col, k, rot = 0) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.font = `400 ${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = size * 0.12; ctx.lineJoin = 'round'; ctx.strokeStyle = '#0B0B1A'; ctx.strokeText(L, 0, 0); ctx.fillStyle = col; ctx.fillText(L, 0, 0);
  ctx.restore();
  softDot(gctx, x, y, size * 0.9, col, 0.3 * clamp(k));
}

// ---------------------------------------------------------------- him on the stage
// the arms as elbow + wrist (rig-local): the mic hand under his chin (screen right), the counting hand beside his head
const ARM_MIC = { e: [120, -276], w: [52, -347] }, ARM_REST_R = { e: [98, -282], w: [84, -196] };
const ARM_COUNT = { e: [-146, -388], w: [-100, -456] }, ARM_REST_L = { e: [-98, -282], w: [-86, -196] };
const ARM_GRIP = { e: [-120, -300], w: [-30, -360] };   // his left hand on the mic too (the button: both hands)
// head units -> world
function twHeadPt(st, r, q) {
  const a = r.lean + (st.headRot || 0), cs = Math.cos(a), sn = Math.sin(a);
  return [st.x + st.s * (r.head[0] + (st.headDX || 0) + q[0] * cs - q[1] * sn), st.y + st.s * (r.head[1] + (st.headDY || 0) + q[0] * sn + q[1] * cs)];
}
function twGrip(c, wr, ang, pal) {   // fingers wrapped round the mic handle
  c.save(); c.translate(wr[0], wr[1]); c.rotate(ang);
  for (let i = 0; i < 3; i++) { rrect(c, -14, -6 + i * 11, 28, 10, 5); c.fillStyle = pal.skinSh; c.fill(); rrect(c, -13, -6 + i * 11, 25, 8, 4); c.fillStyle = pal.skin; c.fill(); }
  c.restore();
}
// A: {vis (mouth), n (fingers up), countUp, micUp, grip (left hand on the mic), knot, jam, jamOut, puff, face, headRot,
//     headDX, headDY, micAng, sweat}
function twStageHero(cam, t, A) {
  let pose = { ...POSES.stand, hand: 'open', handL: 'none', handR: 'none' };
  const cuK = clamp(A.countUp === undefined ? 1 : A.countUp), mu = clamp(A.micUp === undefined ? 1 : A.micUp), gr = clamp(A.grip || 0);
  let aL = armMix(ARM_REST_L, ARM_COUNT, E.inOutCubic(cuK)); aL = armMix(aL, ARM_GRIP, E.inOutCubic(gr));
  const aR = armMix(ARM_REST_R, ARM_MIC, E.inOutCubic(mu));
  aR.w[1] += A.micBob || 0;
  pose = armAt(pose, 'L', aL.e, aL.w); pose = armAt(pose, 'R', aR.e, aR.w);
  if (cuK < 0.05 && gr < 0.05) pose.handL = 'open';
  const st = { x: TWS.hx, y: TWS.fy, s: TWS.hs, pose, face: { ...A.face, mouth: 'none' }, headRot: A.headRot || 0, headDX: A.headDX || 0, headDY: A.headDY || 0, seed: 3 };
  const micAng = A.micAng === undefined ? -0.42 : A.micAng;
  const r = charLayer(cam, st, t, { pal: TWPAL, post: (lc, rr, s2) => {
    lc.save(); lc.translate(s2.x, s2.y); lc.scale(s2.s, s2.s);
    twHead(lc, s2, rr, (c) => { twMouth(c, A.vis || 'flat', { pal: TWPAL }); if (A.puff) twPuff(c, A.puff, 1); });
    twMic(lc, rr.wrR, micAng);
    twGrip(lc, rr.wrR, micAng, TWPAL);
    twHead(lc, s2, rr, (c) => { if (A.knot) twKnot(c, A.knot, t); if (A.jam) twJam(c, A.jam, t, A.jamOut || 0); });
    if (gr > 0.5) twGrip(lc, rr.wrL, 0.5, TWPAL);
    else if (cuK > 0.05 && gr < 0.05) twCountHand(lc, rr.wrL, A.n || 1, TWPAL, t, -0.12);
    lc.restore();
  } });
  const out = { st, r, hp: (q) => twHeadPt(st, r, q) };
  if (A.talk > 0.01) {
    screenSpace();
    const m = toScreen(cam, ...out.hp([22, 40])), z = cam.zoom / 4;
    for (let i = 0; i < 3; i++) {
      const ph = ((t * 3.4 + i / 3) % 1 + 1) % 1, R0 = (34 + 70 * ph) * z, a = A.talk * (1 - ph) * 0.9;
      ctx.beginPath(); ctx.arc(m[0] - 10 * z, m[1], R0, -0.55, 0.15); ctx.lineWidth = 5 * z; ctx.lineCap = 'round'; ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.stroke();
    }
    applyCam(cam);
  }
  if (A.sweat > 0.01) { screenSpace(); const run = ((t * 0.5) % 1 + 1) % 1, P = toScreen(cam, ...out.hp([58, -14 + 18 * run])); sweatDrop(ctx, P[0], P[1], cam.zoom / 3.0, A.sweat * Math.min(1, (1 - run) * 4)); applyCam(cam); }
  return out;
}
function stageDraw(cam, t, A, o = {}) {
  twStageBg(cam, t, { flick: o.flick });
  applyCam(cam);
  const Hh = twStageHero(cam, t, A);
  applyCam(cam);
  if (o.crowd !== false) twCrowd(t, { cheer: o.cheer || 0 });
  return Hh;
}

// ---------------------------------------------------------------- his faces
const TF = {
  talk: { eyeOpen: 1.08, pupil: 0.95, lookX: 0, lookY: 0, browY: 0.9, browTilt: 0.45, mouth: 'none', mouthOpen: 0, blink: 0, cross: 0 },
  knot: { eyeOpen: 1.32, pupil: 0.62, lookX: 0, lookY: 1, browY: 1.45, browTilt: 0.35, mouth: 'none', mouthOpen: 0, blink: 0, cross: 1 },
  sheep: { eyeOpen: 1.04, pupil: 1, lookX: 0, lookY: 0, browY: 0.85, browTilt: 1.15, mouth: 'none', mouthOpen: 0, blink: 0, cross: 0 },
  puffed: { eyeOpen: 1.22, pupil: 0.8, lookX: 0, lookY: 0.7, browY: 1.2, browTilt: 0.6, mouth: 'none', mouthOpen: 0, blink: 0, cross: 0.6 },
  smug: { eyeOpen: 0.86, pupil: 1, lookX: 0.15, lookY: 0, browY: 0.55, browTilt: -0.55, mouth: 'none', mouthOpen: 0, blink: 0.18, cross: 0 },
  frantic: { eyeOpen: 1.3, pupil: 0.7, lookX: 0, lookY: 0, browY: 1.35, browTilt: 0.9, mouth: 'none', mouthOpen: 0, blink: 0, cross: 0 },
  down: { eyeOpen: 1.25, pupil: 0.8, lookX: 0, lookY: 1, browY: 1.2, browTilt: 0.9, mouth: 'none', mouthOpen: 0, blink: 0, cross: 0 },
  frozen: { eyeOpen: 1.18, pupil: 0.72, lookX: 0, lookY: 0, browY: 0.6, browTilt: 0.2, mouth: 'none', mouthOpen: 0, blink: 0, cross: 0 },
  game: { eyeOpen: 0.95, pupil: 1, lookX: 0, lookY: 0, browY: 0.2, browTilt: -0.75, mouth: 'none', mouthOpen: 0, blink: 0, cross: 0 },
};

// ================================================================ the hook: frame 1 and round it (valid at negative time)
function hookA(tt) {
  const c = cu();
  const knot = ramp(tt, c.knot - 0.04, c.knot + 0.16, E.outBack) * (1 - ramp(tt, c.untie, c.untie + 0.2, E.inCubic));
  const V = twVisAt(tt + 0.08, TW_WPS);
  const n = clamp(1 + Math.floor(Math.max(0, Math.min(tt, c.knot - 0.01)) / (6 / TW_WPS)), 1, 4);
  let vis = V.v;
  if (tt >= c.knot - 0.04) vis = 'A';
  if (tt >= c.untie + 0.12) vis = 'flat';
  if (tt >= c.jam - 0.1) vis = 'P';
  if (tt >= c.pk_out) vis = tt < c.pk_out + 0.25 ? 'O' : 'ooh';
  let face = TF.talk;
  face = { ...face, shutL: popK(tt, c.your_turn + 0.05, c.your_turn + 0.38, 0.05, 0.08) };
  face = lerpFace(face, TF.knot, ramp(tt, c.knot - 0.04, c.knot + 0.08) * (1 - ramp(tt, c.tangled - 0.05, c.tangled + 0.12)));
  face = lerpFace(face, TF.sheep, ramp(tt, c.tangled - 0.05, c.tangled + 0.12) * (1 - ramp(tt, c.jam - 0.2, c.jam)));
  face = lerpFace(face, TF.puffed, ramp(tt, c.jam - 0.2, c.jam) * (1 - ramp(tt, c.pk_out, c.pk_out + 0.15)));
  face = lerpFace(face, TF.frantic, ramp(tt, c.pk_out, c.pk_out + 0.12));
  face = { ...face, blink: Math.max(face.blink || 0, pulseOf(tt, [c.pk_out + 0.02, c.untie + 0.05], 0.1)) };
  const jam = ramp(tt, c.jam, c.jam + 0.25, E.outBack) * (tt < c.pk_out + 0.3 ? 1 : 0);
  const jamOut = ramp(tt, c.pk_out, c.pk_out + 0.18, E.inCubic);
  return {
    vis, n, countUp: 1 - ramp(tt, c.untie, c.untie + 0.35, E.inOutCubic), knot, jam, jamOut, talk: tt < c.knot - 0.04 ? 1 : 0,
    micUp: 1 - 0.42 * popK(tt, c.knot - 0.04, c.jam - 0.3, 0.12, 0.3),
    face, sweat: popK(tt, c.knot + 0.1, c.jam, 0.15, 0.2),
    headDY: 1.5 * Math.sin(tt * 9) * (tt < c.knot ? 1 : 0) + 7 * bumpAt(tt, c.knot, 7) - 5 * bumpAt(tt, c.pk_out, 8),
    headRot: 0.025 * Math.sin(tt * 4.5) * (tt < c.knot ? 1 : 0) - 0.05 * bumpAt(tt, c.knot, 6),
    micBob: 3 * Math.sin(tt * 9),
  };
}
const HOOK_CAM0 = [520, 1052, 4.0];
function hookCam(tt) {
  const c = cu(), M = [540, 1072];   // his mouth (world)
  const k = camKeys(tt, [[-0.45, 520, 1048, 3.85], [0, ...HOOK_CAM0], [1.6, 522, 1054, 4.12], [c.knot - 0.05, 524, 1056, 4.22], [c.knot + 0.25, 528, 1080, 4.45],
    [c.tangled + 0.3, 528, 1078, 4.4], [c.your_mouth + 0.1, 532, 1076, 4.5], [c.two, M[0] - 4, M[1] - 6, 5.4], [c.once, M[0] - 6, M[1] - 8, 5.8], [c.win, M[0] - 6, M[1] - 8, 5.9]], E.inOutCubic);
  if (tt >= 0 && tt < 0.4) { const u = E.outCubic(tt / 0.4); k.zoom = lerp(4.0, 4.07, u); }   // the first push is quick off the mark
  const sh = bumpAt(tt, c.knot, 9);
  k.y += 7 * sh * Math.sin((tt - c.knot) * 55); k.x += 4 * sh * Math.sin((tt - c.knot) * 41);
  return k;
}

// the window on his cheek into the side view; the section shot starts where the dive ends
const SEC_F0 = [650, 978], SEC_Z0 = 2.3;
const WIN_HP = [-44, 32];
function secWindow(P, R, z, t, so) {
  if (R < 2) return;
  screenSpace();
  ctx.beginPath(); ctx.arc(P[0], P[1], R, 0, 7); ctx.fillStyle = '#0B1230'; ctx.fill();
  ctx.save(); gctx.save();
  ctx.beginPath(); ctx.arc(P[0], P[1], R, 0, 7); ctx.clip();
  gctx.beginPath(); gctx.arc(P[0], P[1], R, 0, 7); gctx.clip();
  const cam = { x: SEC_F0[0] - (P[0] - 540) / z, y: SEC_F0[1] - (P[1] - 960) / z, zoom: z };
  twSecBg(cam, t); applyCam(cam); twSection(t, so);
  ctx.restore(); gctx.restore();
  screenSpace();
  paint(() => { ctx.beginPath(); ctx.arc(P[0], P[1], R, 0, 7); ctx.lineWidth = Math.max(5, R * 0.04); ctx.strokeStyle = 'rgba(159,230,255,0.95)'; ctx.stroke(); });
}
let HOOK_WIN = null;

SC.hook = (lt, t, shot) => {
  const c = cu(), A = hookA(t), cam0 = hookCam(t);
  const win = ramp(t, c.win, c.win + 0.2, E.outBack);
  const dive = ramp(t, c.win + 0.12, shot.end, E.inOutCubic);
  const cam = dive > 0.001 && HOOK_WIN ? scaledCam(cam0, HOOK_WIN, 1 + 4.5 * E.inCubic(dive)) : cam0;
  const Hh = stageDraw(cam, t, A, { crowd: false });
  HOOK_WIN = Hh.hp(WIN_HP);
  // the knot: a twang of shock lines; the PK! as the two letters pop out as one
  const mouth = toScreen(cam, ...Hh.hp([0, 44]));
  shockLines(mouth[0], mouth[1] + 40, 150, popK(t, c.knot, c.knot + 0.35, 0.05, 0.15), 10, '#FFFFFF', 4);
  burstWord('PK!', clamp(mouth[0] + 40, 300, 780), mouth[1] - 250, 150, '#FF9A3C', popK(t, c.pk_out + 0.02, c.win + 0.1, 0.08, 0.12), -0.1, 120);
  // the count: a small number by his raised hand (screen)
  // the window on his cheek: the side view with P and K both shut, then the dive through it
  if (win > 0.001) {
    const P0 = toScreen(cam, ...HOOK_WIN), zf = dive > 0.001 ? 1 + 4.5 * E.inCubic(dive) : 1;
    const R = lerp(0, 24 * cam0.zoom, win) * zf + 1300 * E.inCubic(ramp(t, shot.end - 0.22, shot.end));
    const P = twL2(P0, [540, 960], E.inOutCubic(ramp(t, c.win + 0.1, shot.end)));
    const z = lerp(0.7, SEC_Z0, E.inOutCubic(ramp(t, c.win, shot.end)));
    secWindow(P, R, z, t, { lips: 1, back: 1, glowP: 1, glowK: 1, open: 0, mic: 0, eye: { lookX: 1, lookY: 0.3 } });
  }
  return { glow: 0.85, flash: 0.1 * bumpAt(t, c.knot, 10) + 0.12 * bumpAt(t, c.pk_out, 9), zblur: 0.16 * E.inCubic(dive), zcx: 540, zcy: 960 };
};

// ================================================================ the side view: P at the lips, K at the back; speed up: both at once
function secState(t) {
  const c = cu();
  const slowP = c.pops_p, slowK = c.pops_k, fP = c.fast_p, fK = c.fast_k, fD = c.fast_d, fB = c.fast_both;
  const allP = slowP.concat(fP, fB), allK = slowK.concat(fK, fB);
  const held = (spans) => spans.reduce((m, [a, b]) => Math.max(m, ramp(t, a - 0.04, a + 0.04) * (1 - ramp(t, b, b + 0.04))), 0);
  const fastP = fP.concat(fB), fastK = fK.concat(fB);
  const lips = Math.max(held(c.shut_p), shutK(t, fastP, 0.11)), back = Math.max(held(c.shut_k), shutK(t, fastK, 0.11));
  const dTimes = slowP.concat(slowK).map((f) => f + 0.2).concat(fD, fB.map((f) => f + 0.1));
  const tip = pulseOf(t, dTimes, 0.08) * 0.9;
  const puffP = sinceK(t, allP, 0.5), puffK = sinceK(t, allK, 0.6);
  const glowP = Math.max(popK(t, c.p - 0.1, c.k - 0.1, 0.1, 0.25) * 0.85, pulseOf(t, allP, 0.14), lips * 0.6);
  const glowK = Math.max(popK(t, c.k - 0.1, c.speed, 0.1, 0.25) * 0.85, pulseOf(t, allK, 0.14), back * 0.6);
  const open = 0.3 + 0.15 * Math.sin(t * 7);
  return { lips, back, tip, puffP, puffK, glowP, glowK, glowD: tip, open, mic: 0, eye: { lookX: 1, lookY: 0.2 + 0.4 * ramp(t, c.both, c.both + 0.2) } };
}
// the rhythm strip (screen space): two rows of beats, P and K; on "easier rhythm" the K dots slide under the P dots
function twSeq(t, k) {
  if (k <= 0.01) return;
  const c = cu(), s = E.outBack(clamp(k), 1.8);
  screenSpace();
  ctx.save(); ctx.translate(354, 610); ctx.scale(0.75 * s, 0.75 * s);
  rrect(ctx, -330, -84, 660, 168, 26); ctx.fillStyle = 'rgba(8,8,22,0.88)'; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(159,230,255,0.6)'; ctx.stroke();
  const snap = ramp(t, c.easier - 0.05, c.rhythm_end, E.inOutCubic);
  const both = ramp(t, c.both - 0.05, c.both + 0.1);
  const pops = c.fast_p.concat(c.fast_k, c.fast_both).filter((f) => f <= t).length;
  const head = pops % 8;
  ctx.font = '400 50px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#FFD447'; ctx.fillText('P', -290, -36); ctx.fillStyle = '#7FE9FF'; ctx.fillText('K', -290, 38);
  for (let i = 0; i < 8; i++) {
    const x = -220 + i * 70;
    const onP = i % 2 === 0, onK = i % 2 === 1;
    // the playhead
    if (i === head) { rrect(ctx, x - 30, -78, 60, 156, 14); ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fill(); }
    circle(ctx, x, -36, 20, 'rgba(255,255,255,0.08)'); circle(ctx, x, 38, 20, 'rgba(255,255,255,0.08)');
    if (onP) circle(ctx, x, -36, 17, '#FFD447');
    if (onK) { const xx = lerp(x, x - 70, snap); circle(ctx, xx, 38, 17, mixH('#7FE9FF', '#FF9A3C', both)); }
  }
  // after the snap: both rows light together, a link between each pair
  if (snap > 0.5) for (let i = 0; i < 8; i += 2) { const x = -220 + i * 70; line(ctx, x, -16, x, 18, 5, rgba('#FF9A3C', (snap - 0.5) * 2)); }
  ctx.restore();
  softDot(gctx, 354, 610, 220, '#7FE9FF', 0.08 * clamp(k));
}
SC.section = (lt, t, shot) => {
  const c = cu(), T0 = shot.start;
  const cam = camKeys(t, [[T0, SEC_F0[0], SEC_F0[1], SEC_Z0], [c.say + 0.35, 626, 992, 1.75], [c.p - 0.15, 700, 984, 2.5], [c.lips_end, 702, 984, 2.6],
    [c.k - 0.12, 566, 966, 2.45], [c.back_end, 568, 968, 2.5], [c.speed + 0.25, 622, 990, 1.85], [c.both - 0.25, 624, 986, 1.92], [c.both + 0.2, 628, 984, 2.15], [shot.end, 628, 984, 2.2]], E.inOutCubic);
  const shake = bumpAt(t, c.both, 8);
  cam.x += 5 * shake * Math.sin(t * 60); cam.y += 4 * shake * Math.sin(t * 47);
  twSecBg(cam, t); applyCam(cam);
  const S = secState(t), R = twSection(t, S);
  const tp = (p) => toScreen(cam, p[0], p[1]);
  // the letters at their spots, and the names
  const L = tp(R.lips), B = tp(R.back), D = tp(R.tip);
  const kP = Math.max(popK(t, c.p - 0.05, c.speed + 0.2, 0.1, 0.12), popK(t, c.both - 0.05, shot.end + 1, 0.08, 0.1));
  const kK = Math.max(popK(t, c.k - 0.05, c.speed + 0.2, 0.1, 0.12), popK(t, c.both - 0.05, shot.end + 1, 0.08, 0.1));
  const bounceP = 10 * pulseOf(t, c.pops_p.concat(c.fast_p, c.fast_both), 0.14), bounceK = 10 * pulseOf(t, c.pops_k.concat(c.fast_k, c.fast_both), 0.14);
  twLetter('P', clamp(L[0] + 150, 200, 900), clamp(L[1] - 150 - bounceP, 640, 1200), 170, '#FFD447', kP, 0.06);
  twLetter('K', clamp(B[0] - 30, 180, 880), clamp(B[1] - 250 - bounceK, 640, 1200), 170, '#7FE9FF', kK, -0.06);
  tagPill('LIPS', clamp(L[0] + 150, 200, 880), clamp(L[1] + 10, 700, 1240), '#FFD447', popK(t, c.lips - 0.05, c.speed, 0.1, 0.12), 40);
  tagPill('BACK', clamp(B[0] - 30, 200, 880), clamp(B[1] - 100, 700, 1240), '#7FE9FF', popK(t, c.back - 0.05, c.speed, 0.1, 0.12), 40);
  // the rhythm strip from "Speed up"; the tip's D in the fast part
  twSeq(t, popK(t, c.speed - 0.05, c.both - 0.02, 0.15, 0.08));
  tagPill('d', clamp(D[0] + 20, 200, 880), clamp(D[1] + 80, 700, 1240), '#4DFFB4', popK(t, c.speed + 0.4, c.both - 0.1, 0.1, 0.1) * (0.7 + 0.3 * S.glowD), 30);
  // BOTH: one pop from both ends at once
  burstWord('PK!', clamp((L[0] + B[0]) / 2 + 40, 300, 780), clamp((L[1] + B[1]) / 2 - 210, 640, 1000), 170, '#FF9A3C', popK(t, c.both + 0.02, shot.end + 1, 0.08, 0.1), -0.08, 140);
  tagPill('BOTH AT ONCE', 540, 1160, '#FF9A3C', popK(t, c.both + 0.15, shot.end + 1, 0.1, 0.1), 46);
  return { glow: 0.9, flash: 0.12 * (1 - ramp(lt, 0, 0.12)) + 0.1 * bumpAt(t, c.both, 9) };
};

// ================================================================ the payoff: five tries, the fifth falls apart
const TRY_TXT = [
  ['PAD KID POURED', 'CURD PULLED COD'], ['PAD KID POURED', 'CURD PULLED COD'], ['PAD KID PORED', 'KURD PULLED COD'],
  ['PKAD KID PURD', 'CUD PKULLED KOD'], ['PKA KUPD POKD', 'KURP PUKD CPOD'],
];
function tryTimes() {
  const c = cu();
  // the first stays up through "easy..." (its tick lands on "easy"); then a quick flurry of worse tries; the fifth on "fifth"
  const e2 = c.easy_end + 0.02, g = Math.max(0.1, (c.fifth - 0.05 - e2) / 3);
  return [c.first - 0.05, e2, e2 + g, e2 + 2 * g, c.fifth - 0.05];
}
function twBubble(i, t, k, fall) {
  if (k <= 0.01) return;
  const c = cu(), s = E.outBack(clamp(k), 2), mess = [0, 0, 0.35, 0.75, 1][i];
  screenSpace();
  const bx = 540, by = 560;
  ctx.save(); ctx.translate(bx, by); ctx.scale(s, s);
  const deflate = clamp(fall * 3.2);
  if (deflate < 0.98) {
    ctx.save(); ctx.scale(1 - 0.25 * deflate, 1 - 0.6 * deflate);
    rrect(ctx, -360, -92, 720, 184, 70); ctx.fillStyle = '#0B0B1A'; ctx.fill();
    rrect(ctx, -352, -84, 704, 168, 64); ctx.fillStyle = '#FFFFFF'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(40, 80); ctx.lineTo(80, 150); ctx.lineTo(104, 80); ctx.closePath(); ctx.fillStyle = '#FFFFFF'; ctx.fill();
    ctx.restore();
  }
  // the number badge
  circle(ctx, -350, -78, 38, '#0B0B1A'); circle(ctx, -350, -78, 32, ['#4DFFB4', '#4DFFB4', '#FFD447', '#FF9A3C', '#FF5A6E'][i]);
  ctx.font = '400 46px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#0B0B1A'; ctx.fillText(String(i + 1), -350, -74);
  // the words, letter by letter: they wobble more each try, and on the fifth they fall
  ctx.font = '400 62px Anton';
  TRY_TXT[i].forEach((ln, j) => {
    const w = ctx.measureText(ln).width; let x = -w / 2;
    for (let q = 0; q < ln.length; q++) {
      const ch = ln[q], cw = ctx.measureText(ch).width, seed = i * 100 + j * 30 + q;
      const rot = mess * 0.35 * Math.sin(seed * 2.3 + t * 9 * mess), dy = mess * 9 * Math.sin(seed * 1.7 + t * 11);
      const drop = fall > 0 ? 0.5 * 2600 * Math.pow(Math.max(0, fall * 1.1 - hash(seed) * 0.25), 2) : 0;
      const spin = fall > 0 ? (hash(seed + 7) - 0.5) * 6 * fall : 0;
      ctx.save(); ctx.translate(x + cw / 2 + (fall > 0 ? (hash(seed + 3) - 0.5) * 120 * fall : 0), (j ? 30 : -34) + dy + drop); ctx.rotate(rot + spin);
      ctx.fillStyle = ch === ' ' ? 'rgba(0,0,0,0)' : (i >= 3 && hash(seed + 11) < 0.3 ? '#E8344A' : '#141428');
      ctx.fillText(ch, 0, 0);
      ctx.restore();
      x += cw;
    }
  });
  ctx.restore();
}
SC.payoff = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, TT = tryTimes();
  const cur = TT.reduce((m, f, i) => (t >= f - 0.02 ? i : m), -1);
  const fall = ramp(t, c.falls, c.apart_end + 0.2, (x) => x);
  const rate = TW_WPS * (1 + 0.15 * Math.max(0, cur));
  const V = twVisAt(t - T0, rate);
  let face = lerpFace(TF.talk, TF.frantic, ramp(t, TT[2], TT[4]));
  face = lerpFace(face, TF.down, ramp(t, c.falls, c.falls + 0.15));
  const A = {
    vis: t < c.falls ? V.v : 'ooh', n: Math.max(1, cur + 1), countUp: 1, face, sweat: ramp(t, TT[2], TT[3]), talk: t < c.falls ? 1 : 0,
    headDY: 1.5 * Math.sin(t * 10) + 6 * ramp(t, c.falls, c.falls + 0.3), headRot: 0.03 * Math.sin(t * 6) * (t < c.falls ? 1 : 0), micBob: 3 * Math.sin(t * 10),
  };
  const cam = camKeys(lt, [[0, 540, 1064, 2.8], [c.fifth - T0, 540, 1060, 2.95], [shot.end - T0, 540, 1066, 3.1]], E.inOutCubic);
  const Hh = stageDraw(cam, t, A, {});
  if (cur >= 0) {
    const k = popK(t, TT[cur] - 0.02, cur < 4 ? (TT[cur + 1] || 99) - 0.01 : shot.end + 1, 0.06, 0.02);
    twBubble(cur, t, cur === 0 ? ramp(t, TT[0] - 0.02, TT[0] + 0.12) : 1, cur === 4 ? fall : 0);
    if (cur <= 1) okTick(884, 610, 36, popK(t, cur === 0 ? c.easy - 0.02 : TT[1], TT[cur + 1] - 0.01, 0.08, 0.02), true);
    if (cur === 4) okTick(884, 610, 36, popK(t, c.falls - 0.05, shot.end + 1, 0.08, 0.1), false);
  }
  return { glow: 0.85, flash: 0.1 * (1 - ramp(lt, 0, 0.12)), push: { k: 1 + 0.02 * ramp(lt, 0, shot.end - T0), cx: 540, cy: 900 } };
};

// ================================================================ the lab: MIT tried it on volunteers; some stopped talking
SC.lab = (lt, t, shot) => {
  const c = cu(), T0 = shot.start;
  const stop = t >= c.flat;
  const cam = camKeys(t, [[T0, 646, 1150, 1.86], [c.volunteers, 640, 1156, 1.94], [c.flat + 0.5, 630, 1166, 2.02], [c.talking, 596, 1196, 2.32], [shot.end, 570, 1206, 2.62]], E.inOutCubic);
  twLabBg(cam, t);
  applyCam(cam);
  twMonitor(TWLAB.mon[0], TWLAB.mon[1], 0.8, t, { flat: ramp(t, c.flat, c.flat + 0.6, (x) => x), rec: 1, wpm: stop ? 0 : 210 });
  // him at the desk, headphones on, talking fast into the mic... then not
  let pose = { ...POSES.sit, hand: 'open' };
  pose = armAt(pose, 'L', [-118, -86], [-56, -74]); pose = armAt(pose, 'R', [118, -86], [56, -74]);
  let face = { ...TF.talk, lookX: 0.2 };
  face = lerpFace(face, TF.frozen, ramp(t, c.flat - 0.02, c.flat + 0.06));
  face = { ...face, blink: Math.max(face.blink, pulseOf(t, [c.talking_end + 0.25], 0.14)) };
  const V = twVisAt(t - T0, TW_WPS);
  const vis = stop ? 'gape' : V.v;
  const st = { x: TWLAB.hx, y: TWLAB.fy, s: TWLAB.hs, pose, face: { ...face, mouth: 'none' }, noLegs: true, seed: 3, headDY: stop ? 0 : 1.2 * Math.sin(t * 9), headRot: stop ? 0 : 0.02 * Math.sin(t * 4) };
  const r = charLayer(cam, st, t, { pal: TWPAL, post: (lc, rr, s2) => {
    lc.save(); lc.translate(s2.x, s2.y); lc.scale(s2.s, s2.s);
    twHead(lc, s2, rr, (cc) => { twMouth(cc, vis, { pal: TWPAL }); twHeadphones(cc); });
    lc.restore();
  } });
  applyCam(cam);
  twStudioMic(t);
  twLabDesk(t);
  // the deadpan: a sweat drop, then nothing
  if (stop) { screenSpace(); const P = toScreen(cam, ...twHeadPt(st, r, [56, -6 + 30 * ramp(t, c.stopped, c.talking_end + 0.6)])); sweatDrop(ctx, P[0], P[1], cam.zoom / 3.0, popK(t, c.stopped, shot.end + 1, 0.12, 0.1)); }

  return { glow: 0.85, flash: 0.12 * (1 - ramp(lt, 0, 0.12)) };
};

// ================================================================ the button: still talking? then go faster (into frame 1)
SC.button = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = TLd.duration;
  const H0 = hookA(-0.45);
  const start = ramp(t, D - 0.62, D - 0.45, E.inOutCubic);   // the last frames become the hook's
  let face = lerpFace(TF.frozen, TF.sheep, ramp(t, c.still + 0.1, c.still + 0.3));
  face = lerpFace(face, TF.smug, ramp(t, c.talking2 + 0.2, c.talking2 + 0.4));
  face = lerpFace(face, TF.game, ramp(t, c.then - 0.05, c.then + 0.15));
  face = lerpFace(face, H0.face, start);
  const shake = bumpAt(t, c.still + 0.05, 6);
  const HA = hookA(t - D);                                    // the hook at negative time: the last frames hand over to it
  let vis = t < c.still + 0.15 ? 'gape' : 'smirk';
  if (t >= c.then - 0.05) vis = 'flat';
  if (t >= c.faster_end + 0.05) vis = HA.vis;
  const A = {
    vis, n: 1, countUp: ramp(t, c.faster - 0.1, c.faster_end + 0.3, E.inOutCubic), grip: popK(t, c.then - 0.1, c.faster - 0.05, 0.15, 0.2), face,
    talk: t >= c.faster_end + 0.05 ? 1 : 0,
    headDX: 6 * shake * Math.sin((t - c.still) * 50) * (1 - start), headDY: lerp(1.2 * Math.sin(t * 9), HA.headDY, start),
    headRot: lerp(-0.04 * ramp(t, c.then, c.then + 0.2), HA.headRot, start), micBob: lerp(3 * Math.sin(t * 9), HA.micBob, start),
  };
  const c0 = hookCam(-0.45);
  const cam = camKeys(t, [[T0, 532, 1092, 2.85], [c.talking2, 530, 1086, 3.05], [c.then, 528, 1080, 3.2], [c.faster, 526, 1070, 3.45], [D - 0.45, c0.x, c0.y, c0.zoom]], E.inOutCubic);
  const Hh = stageDraw(cam, t, A, { flick: popK(t, c.faster, c.faster_end + 0.2, 0.05, 0.2), cheer: popK(t, c.talking2, c.faster_end, 0.2, 0.3) });
  const m = toScreen(cam, ...Hh.hp([0, 44]));
  return { glow: 0.85, flash: 0.14 * (1 - ramp(lt, 0, 0.1)) + 0.08 * bumpAt(t, c.faster, 9), zblur: 0.1 * bumpAt(t, c.faster, 6), zcx: m[0], zcy: m[1], push: { k: 1 + 0.02 * ramp(t, c.faster, D), cx: m[0], cy: m[1] } };
};
SC.loop = (lt, t, shot) => {
  const tt = t - TLd.duration, A = hookA(tt), cam = hookCam(tt);
  stageDraw(cam, t, A, { crowd: false });
  return { glow: 0.85 };
};

// ================================================================ the cover (rendered by src/cover.sh from a one-shot timeline)
SC.cover = (lt, t) => {
  const c = cu(), A = hookA(c.knot + 0.35);
  const cam = { x: 530, y: 1071, zoom: 3.6, rot: 0 };
  stageDraw(cam, 4.0, A, { crowd: false });
  screenSpace();
  bigWord('5X FAST?', 540, 462, 150, '#FFD447', 1, -0.03);
  tagPill("MIT'S HARDEST", 540, 1430, '#FF4D9A', 1, 64, '#FFFFFF');
  return { glow: 0.85, noCaptions: true };
};

function initScenes2() {
  initStage();
  initLab();
}
