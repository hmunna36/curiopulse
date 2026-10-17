// Why Does Your Foot FLIP When You Draw a 6? Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds
// inside the shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;
const pulseOf = (t, times, len = 0.16) => times.reduce((m, f) => Math.max(m, clamp((t - f) / 0.03) * clamp((f + len - t) / 0.05)), 0);
const bumpAt = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);
const ORANGE = '#FF9A3C', CYAN = '#7FE9FF';

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the office at night: the ceiling light up and to the left is the key; the back light is cool, from the window side
const OFFICE_LIGHT = { ...LIGHTS.room, rim: [0.55, 0.78, 1.0], rimFrom: [0.8, -0.45], rimAmt: 1.15, pool: 0.5, halo: 0.12 };
const BOSS_LIGHT = { ...LIGHTS.inside, rim: [1.0, 0.72, 0.5], rimFrom: [-0.7, -0.5], rimAmt: 1.1, pool: 0.4, halo: 0.08 };
const OF_ANG = 1100 / OF_PW * Math.PI * 2;      // which part of the room is behind him: the bookshelf and the door

// ---------------------------------------------------------------- his faces
const FF = {
  // eyes on his raised finger, concentrating (the tip of his tongue out at the corner)
  focus: { eyeOpen: 0.95, pupil: 1, lookX: 0.85, lookY: -0.55, browY: 0.15, browTilt: 0.55, mouth: 'flat', mouthOpen: 0, blink: 0.12, cross: 0 },
  // down at his foot as it flips
  foot: { eyeOpen: 1.38, pupil: 0.55, lookX: 0.45, lookY: 1, browY: 1.45, browTilt: 0.35, mouth: 'o', mouthOpen: 0.75, blink: 0, cross: 0 },
  // up at us: yep
  yep: { eyeOpen: 1.0, pupil: 1, lookX: 0, lookY: 0, browY: 0.9, browTilt: -0.2, mouth: 'flat', mouthOpen: 0.2, blink: 0.2, cross: 0 },
  // a betrayed look down at his foot
  betrayed: { eyeOpen: 0.88, pupil: 1, lookX: 0.4, lookY: 0.95, browY: -0.25, browTilt: -0.8, mouth: 'flat', mouthOpen: 0, blink: 0.35, cross: 0 },
  // pleased: it works with the other hand
  pleased: { eyeOpen: 1.1, pupil: 0.95, lookX: -0.6, lookY: -0.4, browY: 1.1, browTilt: -0.3, mouth: 'grin', mouthOpen: 0.7, blink: 0, cross: 0 },
  grin: { eyeOpen: 1.05, pupil: 1, lookX: 0, lookY: 0, browY: 1.0, browTilt: -0.4, mouth: 'grin', mouthOpen: 0.85, blink: 0, cross: 0 },
  // eyes shut, imagining hard
  imagine: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 0.4, browTilt: 0.85, mouth: 'flat', mouthOpen: 0, blink: 1, cross: 0 },
  // one eye opens: it went wrong in there too
  peek: { eyeOpen: 1.1, pupil: 0.8, lookX: 0.7, lookY: -0.6, browY: 1.0, browTilt: 0.9, mouth: 'grimace', mouthOpen: 0.6, blink: 0, cross: 0, shutR: 1 },
  // deadpan, down at the cat shoe
  deadpan: { eyeOpen: 0.92, pupil: 1, lookX: 0.4, lookY: 0.95, browY: -0.25, browTilt: -0.35, mouth: 'flat', mouthOpen: 0, blink: 0.38, cross: 0 },
};

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
function okTick(x, y, r, k) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  circle(ctx, 0, 0, r + 6, '#FFFFFF'); circle(ctx, 0, 0, r, '#12B25C');
  ctx.beginPath(); ctx.moveTo(-r * 0.45, 0); ctx.lineTo(-r * 0.1, r * 0.36); ctx.lineTo(r * 0.5, -r * 0.34); ctx.lineWidth = r * 0.24; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#FFFFFF'; ctx.stroke();
  ctx.restore();
  softDot(gctx, x, y, r * 2.4, '#4DFFB4', 0.5 * clamp(k));
}

// ================================================================ the office: him in the chair, the room behind
function officeDraw(t, o) {
  ofRoom(o.cam, t, OF_ANG, 0, { lamp: o.lamp });
  applyCam(o.cam);
  ofChairBack(ctx);
  const H = fsHero(o.cam, t, o.A);
  applyCam(o.cam);
  ofOcclude(H);
  return H;
}

// ================================================================ the hook: frame 1 and round it
// tt = seconds since frame 1 (negative = the last frames of the Short, on their way here)
function hookA(tt) {
  const c = cu();
  const six = sixState('R', tt, c.six_t0);
  let face = FF.focus;
  face = lerpFace(face, FF.foot, ramp(tt, c.flip0 + 0.08, c.flip0 + 0.3));
  face = lerpFace(face, FF.yep, ramp(tt, c.yep - 0.15, c.yep + 0.12));
  face = lerpFace(face, FF.betrayed, ramp(tt, c.foot2 - 0.2, c.foot2 + 0.1));
  face = { ...face, blink: Math.max(face.blink || 0, pulseOf(tt, [c.clockwise_end + 0.05, c.hijacked_end + 0.1], 0.12)) };
  const ph = footPhaseHook(tt);
  const A = {
    face, tongue: 1 - ramp(tt, c.flip0 + 0.05, c.flip0 + 0.2),
    arms: { R: fsArmFor('R', six.F) }, handR: 'point',
    legUp: 1, ph, shake: footStutter(tt),
    bob: 1.2 * Math.sin(tt * 2.2), headRot: 0.05 * Math.sin(tt * 1.3) - 0.06 * ramp(tt, c.flip0, c.flip0 + 0.25) * (1 - ramp(tt, c.yep - 0.1, c.yep + 0.2)),
    headDX: 4 * ramp(tt, c.flip0, c.flip0 + 0.25) * (1 - ramp(tt, c.yep - 0.1, c.yep + 0.2)), headDY: 6 * ramp(tt, c.flip0, c.flip0 + 0.25) * (1 - ramp(tt, c.yep - 0.1, c.yep + 0.2)),
    tie: 0.05 * Math.sin(tt * 2.1),
  };
  // the foot goes the 6's way from the flip: its ring turns from orange to the 6's cyan
  const turned = ramp(tt, c.flip0 + 0.1, c.flip1);
  return { A, six, ph, turned, dir: tt < (c.flip0 + c.flip1) / 2 ? 1 : -1 };
}
function hookCam(tt) {
  const c = cu();
  const k = camKeys(tt, [[-0.4, 566, 1330, 2.42], [0, 566, 1330, 2.44], [0.45, 568, 1330, 2.5], [c.hand1_end, 572, 1332, 2.52],
    [c.yep, 566, 1336, 2.44], [c.hijacked_end, 560, 1360, 2.1], [c.foot2_end + 0.4, 556, 1368, 2.0]], E.inOutCubic);
  if (tt >= 0 && tt < 0.45) { const u = E.outCubic(tt / 0.45); k.zoom = lerp(2.44, 2.5, u); }
  const sh = 9 * footStutter(tt);
  k.x += sh * vnoise(tt * 33, 3); k.y += sh * vnoise(tt * 29, 8);
  return k;
}
function hookDraw(tt, t, o) {
  const c = cu(), S = hookA(tt), cam = o.cam;
  const H = officeDraw(t, { cam, A: S.A });
  const col = mixH(ORANGE, CYAN, S.turned);
  footRing(H.S, S.ph, S.dir, col, 1, { zoom: cam.zoom });
  sixTrail(H.S, S.six, 1, CYAN, { w: 7, zoom: cam.zoom });
  return { H, S };
}

SC.hook = (lt, t, shot) => {
  const c = cu(), cam = hookCam(t);
  const { H, S } = hookDraw(t, t, { cam });
  // CLOCKWISE beside the foot until it flips; then the tow rope and HIJACKED
  const T = H.toeS;
  tagPill('CLOCKWISE', T[0] - 250, T[1] - 30, ORANGE, popK(t, c.clockwise - 0.05, c.flip0 + 0.1, 0.12, 0.1), 38);
  towRope(H.fingerS('R'), [T[0], T[1] - 20], ramp(t, c.tow, c.tow + 0.25) * (1 - ramp(t, shot.end - 0.25, shot.end)), t);
  fsBurst('HIJACKED!', 380, 1440, 92, '#FF5A6E', popK(t, c.hijacked_end - 0.05, shot.end - 0.1, 0.14, 0.12), -0.1, 7);
  return { glow: 0.85, flash: 0.08 * bumpAt(t, c.flip0 + 0.12, 9), capY: 1120 };
};

// ================================================================ one boss: the LEFT side of the brain
// the same office, wider: the hand and the foot still loop together; his head turns to glass, cords grow from his brain
// to the hand and the foot (they cross in his neck), the LEFT half lights up with a face and a tie: the boss. Then the
// camera pushes into that half of his head (the way into the next shot)
function bossCam(t) {
  const c = cu(), h0 = hookCam(c.your3 - 0.06), HX = OF.hx - 25, HY = OF_HEADY - 14;
  // the dive ends with the left half of his brain where the boss stands in the next shot (screen 540, 600)
  const DX = OF.hx + HEMI.L[0], DY = OF_HEADY + HEMI.L[1], DZ = 6.0;
  return camKeys(t, [[c.your3 - 0.06, h0.x, h0.y, h0.zoom], [c.foot3_end, 572, 1362, 1.8], [c.boss_end, 570, 1356, 1.78],
    [c.left1 + 0.1, 548, 1290, 2.3], [c.brain, HX + 10, HY + 100, 3.0], [c.brain_end + 0.25, DX, DY - (600 - 960) / DZ, DZ]], E.inOutCubic);
}
SC.boss = (lt, t, shot) => {
  const c = cu(), cam = bossCam(t);
  const S = hookA(t);                                    // the hook's state carries on: the 6's loop, the foot after it
  const gk = ramp(t, c.share - 0.15, c.share + 0.2);
  const lit = ramp(t, c.left1 - 0.08, c.left1 + 0.18, E.outBack);
  S.A.face = lerpFace(FF.betrayed, FF.yep, ramp(t, c.your3, c.your3 + 0.3));
  S.A.glass = { k: gk, left: lit, right: 0, faceL: lit, faceR: 0, tie: ramp(t, c.left1 + 0.1, c.left1 + 0.35), moodL: 'smile' };
  const H = officeDraw(t, { cam, A: S.A });
  footRing(H.S, S.ph, -1, CYAN, 1, { zoom: cam.zoom });
  sixTrail(H.S, S.six, 1, CYAN, { w: 7, zoom: cam.zoom });
  // the hand, then the foot, light up as they are named
  const hp = pulseOf(t, [c.hand3], 0.35), fp = pulseOf(t, [c.foot3], 0.35);
  if (hp > 0.01) softDot(gctx, ...H.fingerS('R'), 140 * cam.zoom / 2, CYAN, 0.6 * hp);
  if (fp > 0.01) softDot(gctx, ...H.toeS, 170 * cam.zoom / 2, ORANGE, 0.6 * fp);
  // the cords from his brain: one to the hand, one to the foot
  const ck = ramp(t, c.share, c.boss_end, E.inOutSine);
  cord(cordPts(H, 'hand', 'R'), CYAN, ck, t, { w: 3.2 * cam.zoom, speed: 300 * cam.zoom });
  cord(cordPts(H, 'foot', 'R'), ORANGE, ck, t, { w: 3.2 * cam.zoom, speed: 300 * cam.zoom });
  // labels
  const hd = H.HS(0, -100);
  tagPill('ONE BOSS', hd[0], hd[1] - 40, '#FFD447', popK(t, c.boss - 0.05, c.left1 - 0.05, 0.12, 0.1), 40);
  const lb = H.HS(-30, -16);
  tagPill('LEFT BRAIN', clamp(lb[0] - 250, 230, 850), lb[1] - 120, '#FFB347', popK(t, c.left1 + 0.05, c.brain - 0.1, 0.12, 0.1), 40);
  // the push into the left half: zoom blur at the end
  const dive = ramp(t, c.brain_end - 0.1, shot.end, E.inCubic);
  const D = H.HS(HEMI.L[0], HEMI.L[1]);
  return { glow: 0.85, capY: 1100, zblur: 0.22 * dive, zcx: D[0], zcy: D[1], flash: 0.18 * dive };
};

// ================================================================ inside the left half: SAME WAY, and the six drags the foot along
// the boss at its desk with two wheels on one belt. Before "the six" both wheels turn together; then the boss cranks
// the HAND wheel the 6's way (counter-clockwise) while its other hand tries to hold the FOOT wheel clockwise, and the
// belt drags the FOOT wheel along
const WH = { A: [300, 1000], B: [780, 1000], R: 135, r: 44 };
const BB = { x: 540, y: 600, s: 1.0 };          // the boss: the left side of his brain as a character
function wheelAngles(t) {
  const c = cu(), w1 = 2.2, w2 = 4.4;
  // the hand wheel: clockwise slowly, then the 6's way from "six"
  let aH = w1 * (t - c.wants) * ramp(t, c.wants - 0.3, c.wants + 0.2);
  if (t > c.drag0) aH = w1 * (c.drag0 - c.wants) - w2 * (t - c.drag0) * ramp(t, c.drag0, c.drag0 + 0.35);
  // the foot wheel: with the hand wheel until "six"; held (it judders, a little clockwise) until "drags"; then dragged
  let aF = aH;
  if (t > c.drag0) {
    const held = w1 * (c.drag0 - c.wants) + 0.5 * Math.min(t - c.drag0, c.drags - c.drag0) + 0.05 * Math.sin((t - c.drag0) * 50) * (t < c.drags ? 1 : 0);
    const go = ramp(t, c.drags, c.drags + 0.3, E.inCubic);
    const dragged = held - w2 * Math.max(0, t - c.drags);
    aF = lerp(held, dragged, go);
  }
  return { aH, aF, holding: t > c.drag0 && t < c.drags + 0.15, yank: bumpAt(t, c.drags + 0.05, 5) };
}
SC.same = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0;
  const V = camKeys(lt, [[0, 540, 700, 1.3], [0.55, 540, 960, 1.0], [c.drag0 - T0, 540, 962, 1.0], [D, 540, 972, 1.04]], E.inOutCubic);
  const A = wheelAngles(t);
  // the wall, and the monitor on it (his real foot, flipping when the wheel does)
  screenSpace();
  const view = (cc, sc) => { cc.setTransform(sc, 0, 0, sc, 0, 0); cc.translate(540, 960); cc.scale(V.zoom, V.zoom); cc.translate(-V.x, -V.y); };
  view(ctx, 1); view(gctx, 0.5);
  ctx.drawImage(BOSS_WALL, 0, -60);
  const P = (x, y) => [540 + (x - V.x) * V.zoom, 960 + (y - V.y) * V.zoom];
  const flipped = t > c.drags + 0.15, mon = P(830, 560);
  bossMonitor(mon[0], mon[1], t, flipped ? -FS_W() * (t - c.drags) : FS_W() * (t - T0), flipped ? -1 : 1, flipped ? CYAN : ORANGE, ramp(t, T0 + 0.3, T0 + 0.6) * 0.8 * V.zoom);
  view(ctx, 1); view(gctx, 0.5);
  // the boss behind the desk; its hands on the wheels
  let mood = t > c.same - 0.1 ? 'grin' : 'calm';
  if (t > c.drag0 - 0.05) mood = 'squint';
  if (t > c.drags) mood = 'wow';
  if (t > c.along) mood = 'shrug';
  const look = mood === 'squint' ? [0.7, 0.9] : mood === 'wow' ? [0.9, 0.6] : mood === 'shrug' ? [0, 0] : [0, 0.7];
  const bob = 4 * Math.sin(t * 3.1) + 14 * A.yank;
  const knob = [WH.A[0] + Math.cos(A.aH) * WH.R * 0.78, WH.A[1] + Math.sin(A.aH) * WH.R * 0.78];
  const grip = A.holding ? [WH.B[0] + Math.cos(A.aF - Math.PI / 2) * WH.R, WH.B[1] + Math.sin(A.aF - Math.PI / 2) * WH.R] : [WH.B[0] + 6, WH.B[1] - WH.R - 10];
  const fling = ramp(t, c.drags + 0.1, c.drags + 0.35) * (1 - ramp(t, c.along, c.along + 0.4));
  const gripT = [lerp(grip[0], 880, fling), lerp(grip[1], 560, fling)];
  const loc = (q) => [(q[0] - BB.x) / BB.s, (q[1] - BB.y - bob) / BB.s];
  // the desk, behind the boss: it stands in front of it, at the wheels
  rrect(ctx, 60, 770, 960, 44, 18); ctx.fillStyle = '#5A3A6E'; ctx.fill();
  rrect(ctx, 90, 808, 900, 360, 14); ctx.fillStyle = '#3E2650'; ctx.fill();
  actor(() => bossBrain(ctx, BB.x, BB.y, BB.s, t, { mood, look, bob: 14 * A.yank, still: false, armL: loc(knob), armR: loc(gripT), sweat: ramp(t, c.drag0, c.drag0 + 0.3), lean: 0.05 * A.yank }));
  // the wheels and the belt (in front of the desk)
  bossWheel(ctx, WH.A[0], WH.A[1], WH.R, A.aH, CYAN, { glow: 1 });
  bossWheel(ctx, WH.B[0], WH.B[1], WH.R, A.aF, ORANGE, { glow: 1 });
  bossBelt(ctx, WH.A, WH.B, WH.r, A.aH * WH.r);
  // its hands again, in front of the wheels' rims
  for (const q of [knob, gripT]) circle(ctx, q[0], q[1], 21 * BB.s, '#FFA9C0');
  // labels (screen space)
  const pa = P(...WH.A), pb = P(...WH.B), pr = WH.R * V.zoom;
  tagPill('HAND', pa[0], P(0, 1192)[1], CYAN, ramp(t, T0 + 0.15, T0 + 0.35), 40);
  tagPill('FOOT', pb[0], P(0, 1192)[1], ORANGE, ramp(t, T0 + 0.25, T0 + 0.45), 40);
  const same = popK(t, c.same - 0.05, c.so - 0.05, 0.12, 0.12);
  wheelArrow(pa[0], pa[1], pr + 36, -2.4, 1, '#4DFFB4', same);
  wheelArrow(pb[0], pb[1], pr + 36, -2.4, 1, '#4DFFB4', same);
  if (same > 0.01) { screenSpace(); stamp('SAME WAY', 540, P(0, 872)[1], ramp(t, c.same - 0.05, c.same + 0.25), '#4DFFB4', -0.06, 70); }
  // the six on the HAND wheel, then its way and the FOOT wheel dragged along
  const sk = ramp(t, c.six2 - 0.08, c.six2 + 0.12);
  if (sk > 0.01) { screenSpace(); bigWord('6', pa[0], pa[1] + 4, 96, CYAN, E.outBack(sk, 2), 0); }
  wheelArrow(pa[0], pa[1], pr + 36, -0.9, -1, CYAN, popK(t, c.drag0, shot.end, 0.15, 0.1));
  wheelArrow(pb[0], pb[1], pr + 36, -2.2, 1, ORANGE, popK(t, c.drag0 + 0.1, c.drags + 0.1, 0.15, 0.08));
  wheelArrow(pb[0], pb[1], pr + 36, -0.9, -1, CYAN, popK(t, c.drags + 0.2, shot.end, 0.15, 0.1));
  fsBurst('YOINK!', pb[0] + 30, pb[1] - pr - 150, 84, '#FF9A3C', popK(t, c.along_end - 0.02, shot.end + 1, 0.1, 0.1), 0.08, 11);   // with the slide whistle, in the pause after "along."
  const ent = 1 - ramp(lt, 0, 0.35);
  return { glow: 0.85, zblur: 0.2 * ent, zcx: 540, zcy: 600, flash: 0.22 * ent + 0.08 * bumpAt(t, c.drags, 8) };
};

// ================================================================ the proof: the six with the LEFT hand
// back in the office: his right hand rests, his left hand draws the 6, and the foot keeps going clockwise; in his glass
// head the RIGHT half lights up for the left hand: two bosses
function payA(t) {
  const c = cu(), T0 = c.now - 0.08;
  const six = sixState('L', t, c.six3_t0);
  const raise = ramp(t, T0, T0 + 0.35);
  const restL = OF_ARM.gripL, fl = fsArmFor('L', six.F);
  const armL = armMix(restL, fl, raise);
  let face = lerpFace(FF.yep, FF.focus, ramp(t, T0, T0 + 0.3));
  face = { ...face, lookX: -0.85 };
  face = lerpFace(face, FF.pleased, ramp(t, c.hand4 - 0.1, c.hand4 + 0.2));
  face = lerpFace(face, FF.grin, ramp(t, c.right3 - 0.15, c.right3 + 0.1));
  const ph = 0.7 + FS_W() * (t - T0);
  const glass = ramp(t, c.left2 - 0.2, c.left2 + 0.15);
  return { six, ph, A: { face, arms: { L: armL }, handL: 'point', legUp: 1, ph, bob: 1.2 * Math.sin(t * 2.2), tie: 0.05 * Math.sin(t * 2.1),
    glass: { k: glass, left: 1, right: ramp(t, c.left2, c.left2 + 0.2, E.outBack), faceL: 1, faceR: ramp(t, c.left2 + 0.05, c.left2 + 0.3), tie: 1, moodL: 'smile', moodR: 'smile' } } };
}
SC.payoff = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0;
  const cam = camKeys(lt, [[0, 520, 1350, 2.25], [0.5, 520, 1356, 1.86], [c.hand4 - T0, 524, 1356, 1.82], [D, 524, 1352, 1.9]], E.inOutCubic);
  const S = payA(t);
  const H = officeDraw(t, { cam, A: S.A });
  footRing(H.S, S.ph, 1, ORANGE, 1, { zoom: cam.zoom });
  sixTrail(H.S, S.six, 1, CYAN, { w: 7, zoom: cam.zoom });
  const ck = ramp(t, c.left2, c.hand4_end, E.inOutSine);
  cord(cordPts(H, 'hand', 'L'), CYAN, ck, t, { w: 3.2 * cam.zoom, speed: 300 * cam.zoom });
  cord(cordPts(H, 'foot', 'R'), ORANGE, ck, t, { w: 3.2 * cam.zoom, speed: 300 * cam.zoom });
  const T = H.toeS;
  tagPill('STILL CLOCKWISE', T[0] - 40, T[1] + 150, ORANGE, popK(t, c.hand4_end - 0.05, shot.end + 1, 0.12, 0.1), 36);
  okTick(T[0] - 290, T[1] + 150, 40, popK(t, c.hand4_end, shot.end + 1, 0.14, 0.1));
  const hd = H.HS(0, -100);
  tagPill('TWO BOSSES', hd[0], hd[1] - 40, '#FFD447', popK(t, c.easier - 0.05, shot.end + 1, 0.12, 0.1), 40);
  return { glow: 0.85, capY: 1100, flash: 0.1 * (1 - ramp(lt, 0, 0.25)) };
};

// ================================================================ the weirdest fact: even imagining it
// he sits still, eyes shut, imagining the test: in a thought bubble a little 6 goes round and the little foot, trying
// to go clockwise, stumbles (it stutters, slows, flips back and forth)
function bubbleFoot(t) {
  const c = cu(), w = FS_W();
  if (t < c.fumble0) return { ph: w * (t - c.weirder), dir: 1, wob: 0 };
  const u = t - c.fumble0;
  const ph = w * (c.fumble0 - c.weirder) + 0.9 * Math.sin(u * 7) + 0.4 * u;
  return { ph, dir: Math.cos(u * 7) > 0 ? 1 : -1, wob: 1 };
}
SC.weird = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0;
  const cam = camKeys(lt, [[0, 534, 1290, 1.95], [0.4, 530, 1252, 1.75], [D, 532, 1246, 1.82]], E.inOutCubic);
  let face = lerpFace(FF.grin, FF.imagine, ramp(t, T0 + 0.05, T0 + 0.3));
  face = lerpFace(face, FF.peek, ramp(t, c.imagining_end - 0.05, c.imagining_end + 0.15));
  const A = { face, arms: { L: OF_ARM.lapL, R: OF_ARM.lapR }, legUp: 1 - ramp(lt, 0, 0.3), ph: 0, bob: 0.8 * Math.sin(t * 2.0), tie: 0.03 * Math.sin(t * 2.1),
    headRot: 0.03 * Math.sin(t * 1.4), headDY: 2 * Math.sin(t * 2.0) };
  const H = officeDraw(t, { cam, A });
  // sweat once it goes wrong in there
  const sw = ramp(t, c.fumbled, c.fumbled + 0.3);
  if (sw > 0.01) { const P = H.HS(60, -30); screenSpace(); sweatDrop(ctx, P[0] + 6, P[1] + 26 * ((t * 1.3) % 1), 1.0, sw); }
  // the bubble: what he imagines, above his head
  const bk = ramp(t, c.weirder - 0.05, c.weirder + 0.3);
  const BX = 640, BY = 548, BW = 470, BH = 320;
  const hd = H.HS(30, -96);
  thoughtBubble(BX, BY, BW, BH, bk, hd[0], hd[1]);
  if (bk > 0.3) {
    const s = E.outBack(clamp(bk), 1.6);
    // a little 6 going round (cyan) on the left...
    const six = sixState('R', t, c.weirder + 0.1);
    const toS = (lx, ly) => [BX + (-112 + (lx - FS_C6.R[0]) * 1.35) * s, BY + (30 + (ly - FS_C6.R[1]) * 1.35) * s];
    sixTrail(toS, six, 1, '#1E96D8', { w: 11, zoom: s });
    // ...and the little foot on the right: its ring orange, then (fumbled) it stutters, turns red and flips about
    const F = bubbleFoot(t);
    screenSpace();
    ctx.save(); ctx.translate(BX + 96 * s, BY + 16 * s); ctx.scale(s, s);
    fsShoe(ctx, 16 * Math.cos(F.ph), 13 * Math.sin(F.ph), 1.3, 0.15 * Math.cos(F.ph), FSPAL, {});
    ctx.restore();
    const ringP = (lx, ly) => [BX + 96 * s + (lx - FS_ANK[0]) * 1.3 * s, BY + 16 * s + (ly - FS_ANK[1] - 18) * 1.3 * s];
    footRing(ringP, F.ph, F.dir, F.wob > 0 ? '#FF5A6E' : ORANGE, 1, { zoom: 1.3 * s });
    if (F.wob > 0) { screenSpace(); bigWord('?!', BX + 196 * s, BY - 86 * s, 66, '#FF5A6E', E.outBack(ramp(t, c.fumbled, c.fumbled + 0.2), 2), 0.15); }
  }
  tagPill('2023 STUDY', 236, 470, '#8FB8FF', popK(t, c.study - 0.08, shot.end + 1, 0.12, 0.1), 36);
  tagPill('JUST IMAGINING', 262, 760, '#C8A8FF', popK(t, c.imagining - 0.05, shot.end + 1, 0.12, 0.1), 36);
  return { glow: 0.85, flash: 0.08 * (1 - ramp(lt, 0, 0.25)) };
};

// ================================================================ the button: not broken, a copycat
SC.button = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0;
  const cam = camKeys(lt, [[0, 562, 1346, 2.05], [0.35, 576, 1352, 2.35], [c.copycat - 0.3 - T0, 595, 1382, 2.9], [D, 597, 1384, 2.96]], E.inOutCubic);
  const six = sixState('R', t, T0 - 1.0);
  const ph = -FS_W() * (t - T0) + 2.0;
  const cat = ramp(t, c.cat, c.cat + 0.25);
  const face = lerpFace(FF.yep, FF.deadpan, ramp(t, c.foots - 0.1, c.foots + 0.2));
  const A = { face, arms: { R: fsArmFor('R', six.F) }, handR: 'point', legUp: ramp(lt, 0, 0.3, E.outBack), ph, bob: 1.2 * Math.sin(t * 2.2), tie: 0.05 * Math.sin(t * 2.1),
    shoe: { cat, look: [-0.3, -0.8], meow: pulseOf(t, [c.meow], 0.35), blink: pulseOf(t, [c.meow + 0.5], 0.12) } };
  const H = officeDraw(t, { cam, A });
  footRing(H.S, ph, -1, CYAN, 1 - 0.6 * cat, { zoom: cam.zoom });
  sixTrail(H.S, six, 1, CYAN, { w: 7, zoom: cam.zoom });
  const T = H.toeS;
  tagPill('NOT BROKEN', T[0] - 300, T[1] - 10, '#4DFFB4', popK(t, c.broken - 0.05, c.copycat - 0.05, 0.12, 0.1), 36);
  okTick(T[0] - 300, T[1] - 110, 34, popK(t, c.broken, c.copycat - 0.05, 0.14, 0.1));
  return { glow: 0.85, capY: 1100 };
};

// ================================================================ the cover: him mid-test, both trails, DID IT FLIP?
SC.cover = (lt, t) => {
  const c = cu(), tt = c.flip1 + 0.35, cam = { x: 566, y: 1336, zoom: 2.4, rot: 0 };
  const S = hookA(tt);
  S.A.face = FF.foot;
  const H = officeDraw(tt, { cam, A: S.A });
  footRing(H.S, S.ph, -1, CYAN, 1, { zoom: cam.zoom });
  sixTrail(H.S, S.six, 1, CYAN, { w: 7, zoom: cam.zoom });
  screenSpace();
  bigWord('DID IT', 540, 1040, 146, '#FFFFFF', 1, -0.04);
  bigWord('FLIP?', 540, 1188, 172, '#FFD447', 1, -0.03);
  return { glow: 0.85, noCaptions: true };
};

// ================================================================ the loop: the last 0.4 s are the hook at negative time
SC.loop = (lt, t, shot) => {
  const tt = t - TLd.duration, cam = hookCam(tt);
  hookDraw(tt, t, { cam });
  return { glow: 0.85, capY: 1120 };
};

setLights({ hook: OFFICE_LIGHT, loop: OFFICE_LIGHT, boss: OFFICE_LIGHT, same: BOSS_LIGHT, payoff: OFFICE_LIGHT, weird: OFFICE_LIGHT, button: OFFICE_LIGHT, cover: OFFICE_LIGHT });

function initScenes2() {
  initOffice();
  initBoss();
}
