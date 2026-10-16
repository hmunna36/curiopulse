// Why Does This Dot VANISH? (Find Your Blind Spot) Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt =
// seconds inside the shot, t = seconds in the video) and returns post options for main.js.
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;
E.linear = E.linear || ((x) => x);
E.inBack = E.inBack || ((x, s = 1.7) => (s + 1) * x * x * x - s * x * x);
function shotOf(id) { return TLd.shots.find((s) => s.id === id); }
// the strongest of a list of pulses at time t: each is on for `len` seconds, with soft edges
const pulseOf = (t, times, len = 0.16) => times.reduce((m, f) => Math.max(m, clamp((t - f) / 0.03) * clamp((f + len - t) / 0.05)), 0);
// a decaying bump after a moment
const bumpAt = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);
function faceSeq(t, seq) {
  let f = seq[0][1];
  for (let i = 1; i < seq.length; i++) {
    const [t1, g] = seq[i];
    if (t >= t1 + 0.12) f = g;
    else if (t > t1) f = lerpFace(f, g, (t - t1) / 0.12);
  }
  return f;
}
// a small filled tag (screen space)
function tagPill(txt, x, y, col, k, size = 40, ink = '#0B0B1A') {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + size * 0.9, h = size * 1.5;
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = col; ctx.fill();
  paint(() => { ctx.fillStyle = ink; ctx.fillText(txt, 0, 2); });
  ctx.restore();
}

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// his bedroom at midnight: the phone's cool light from the front and above (the key), the bedside lamp low on the left
// behind him (a warm rim); the room behind him soft in the close shots
const BED_LIGHT = { ...LIGHTS.night, key: [-0.28, -0.62, 0.73], keyTint: [0.94, 1.0, 1.10], rimFrom: [-0.9, 0.2], rim: [1.0, 0.70, 0.42], rimAmt: 1.1, pool: 0.5, halo: 0.1, haloColor: [0.62, 0.74, 1.0], dof: 0.6 };
const INSIDE_LIGHT = { ...LIGHTS.inside, pool: 0.22, halo: 0 };
const BRAIN_LIGHT = { ...LIGHTS.screen, pool: 0.3, halo: 0 };
const SEA_LIGHT = { ...LIGHTS.water, pool: 0.35, halo: 0.08 };
setLights({
  hook: BED_LIGHT, loop: BED_LIGHT, cover: BED_LIGHT, inside: INSIDE_LIGHT, paint: BRAIN_LIGHT,
  octopus: (lt, t) => (t < cu().its - 0.05 ? SEA_LIGHT : INSIDE_LIGHT), button: SEA_LIGHT,
});

// ---------------------------------------------------------------- his faces
const BF = {
  test: { eyeOpen: 1.12, pupil: 0.95, lookX: -0.85, lookY: -0.6, browY: 0.45, browTilt: 0.5, mouth: 'flat', mouthOpen: 0.2, blink: 0, cross: 0, shutL: 1, shutR: 0 },
  strain: { eyeOpen: 1.22, pupil: 0.85, lookX: -0.9, lookY: -0.65, browY: 0.25, browTilt: 0.95, mouth: 'wavy', mouthOpen: 0.3, blink: 0, cross: 0, shutL: 1, shutR: 0 },
  gasp: { eyeOpen: 1.5, pupil: 0.5, lookX: -0.85, lookY: -0.55, browY: 1.6, browTilt: 0.3, mouth: 'o', mouthOpen: 0.85, blink: 0, cross: 0, shutL: 1, shutR: 0 },
  wow: { eyeOpen: 1.35, pupil: 0.6, lookX: -0.4, lookY: -0.3, browY: 1.3, browTilt: 0.4, mouth: 'o', mouthOpen: 0.45, blink: 0, cross: 0, shutL: 1, shutR: 0 },
  calm: { eyeOpen: 1, pupil: 1, lookX: -0.5, lookY: -0.3, browY: 0.3, browTilt: 0.2, mouth: 'flat', mouthOpen: 0.3, blink: 0, cross: 0, shutL: 0.3, shutR: 0 },
};

// ================================================================ the hook: we are his phone
const BCAM = { x: 560, y: 998, zoom: 3.55, rot: 0 };
// his state as a function of tt = seconds since frame 1 (negative = the last frames of the Short, on their way here)
function hookA(tt) {
  const c = cu();
  // his palm comes up from the duvet and lands on his eye on frame 1 (a small press-bounce after it lands)
  const up = tt < 0 ? E.inOutCubic(ramp(tt, -0.4, -0.02)) : 1;
  const arm = tt < 0 ? bdArmMix(BD_ARM.duvet, BD_ARM.palm, up) : BD_ARM.palm;
  const press = tt < 0 ? 0 : Math.max(0, Math.sin(tt * 22) * Math.exp(-tt * 9)) * 0.9;
  let face = tt < 0 ? lerpFace(BF.calm, BF.test, up) : faceSeq(tt, [[-1, BF.test], [c.bring - 0.1, BF.strain], [c.the_dot - 0.12, BF.gasp], [c.your_eye - 0.1, BF.wow]]);
  face = { ...face, blink: Math.max(face.blink || 0, pulseOf(tt, [c.x_end + 0.25], 0.12)) };
  // the double-take: on "vanished?" his eye darts to where the dot was, back to the X, and once more
  const dart = tt < 0 ? 0 : Math.max(popK(tt, c.vanished + 0.02, c.vanished + 0.45, 0.09, 0.09), popK(tt, c.vanished_end - 0.12, c.vanished_end + 0.22, 0.07, 0.08));
  face = { ...face, lookX: lerp(face.lookX, 0.95, dart), lookY: lerp(face.lookY, -0.42, dart) };
  const jolt = bumpAt(tt, c.the_dot - 0.04, 5);
  return {
    armR: arm, palm: 1, press, face,
    bob: tt < 0 ? 0 : 1.2 * Math.sin(tt * 2.3), lean: 0,
    headDY: -9 * jolt, headDX: -3 * jolt + 3 * dart, headRot: tt < 0 ? 0 : -0.02 * jolt + 0.012 * Math.sin(tt * 1.7) + 0.035 * dart,
  };
}
function hookCam(tt) {
  const c = cu();
  if (tt < 0) { const u = ramp(tt, -0.4, 0, E.inOutSine); return { x: BCAM.x, y: BCAM.y + 6 * (1 - u), zoom: lerp(3.46, BCAM.zoom, u), rot: 0 }; }
  // a slow drift, then the push in as he brings his phone closer ("bring your phone closer"), then the jolt back
  let zoom = BCAM.zoom + 0.06 * ramp(tt, 0, c.bring, E.inOutSine) + 0.42 * ramp(tt, c.bring, c.closer_end + 0.1, E.inOutSine);
  let x = BCAM.x, y = BCAM.y + 4 * ramp(tt, c.bring, c.closer_end, E.inOutSine);
  const back = ramp(tt, c.the_dot - 0.06, c.the_dot + 0.25, E.outBack);
  zoom -= 0.2 * back;
  // after the window opens, drift toward his open eye
  const toEye = ramp(tt, c.your_eye - 0.1, c.it1_end, E.inOutSine);
  x = lerp(x, 528, toEye); y = lerp(y, 1012, toEye); zoom += 0.3 * toEye;
  const sh0 = 6 * Math.max(0, 1 - tt / 0.2), sh1 = 9 * bumpAt(tt, c.the_dot - 0.04, 7);
  const sh = shake(tt, sh0 + sh1, 26, 3);
  return { x: x + sh[0] / zoom, y: y + sh[1] / zoom, zoom, rot: 0 };
}
// what is in the window on his eye: the eye cut in half, small, with the hole lit on "HOLE"
const WIN = { r: 52, s: 0.14 };
function windowInner(t, Ept, holeGlow) {
  eyeOn({ x: Ept[0] + 6, y: Ept[1], s: WIN.s }, () => eyeCut(t, { sens: SENS_A.map((a, i) => ({ look: [-1, 0.2 * Math.sin(t * 2 + i)] })), holeGlow, plug: 1, cableOut: 420, noSkin: true }));
}
// the bedroom, him, the window. o: {cam, S, win: 0..1, holeGlow, ring, winR (world), card: 0..1}
function hookDraw(tt, t, o) {
  const S = o.S, cam = o.cam;
  bdRoom(cam, t);
  applyCam(cam);
  const Hh = bdHero(cam, t, S);
  applyCam(cam);
  bdDuvet(t);
  if ((o.win || 0) > 0.01) { applyCam(cam); eyeWindow(Hh.eyeOpen, o.winR || WIN.r, o.win, () => windowInner(t, Hh.eyeOpen, o.holeGlow || 0), o.ring || 0); }
  testCard(o.card === undefined ? 1 : o.card);
  return Hh;
}
SC.hook = (lt, t, shot) => {
  const c = cu(), S = hookA(t), cam = hookCam(t);
  // the dive: into the window on his eye; it ends where the next shot's eyeball is, at its size
  const d0 = c.it1_end - 0.32, dive = ramp(t, d0, shot.end, E.inCubic);
  const Hh0 = { st: bdSt(S) }, EYE = bdHeadPt(Hh0.st, -24, -2);
  let winR = WIN.r;
  if (dive > 0) {
    const P0 = toScreen(cam, EYE[0], EYE[1]);
    const kEnd = (300 * IN0.s) / (300 * WIN.s * cam.zoom);
    Object.assign(cam, scaledCam(cam, EYE, 1 + (kEnd - 1) * dive));
    cam.sx = (IN0.P[0] - P0[0]) * dive; cam.sy = (IN0.P[1] - P0[1]) * dive;
    winR = lerp(WIN.r, 150, dive * dive);
  }
  const win = ramp(t, c.your_eye - 0.05, c.your_eye + 0.3);
  const holeGlow = Math.max(pulseOf(t, [c.hole1 - 0.04], 0.55) * (0.7 + 0.3 * Math.sin(t * 30)), ramp(t, c.hole1_end, c.hole1_end + 0.2) * 0.7);
  const ring = bumpAt(t, c.hole1 - 0.04, 4);
  const card = 1 - ramp(t, d0 - 0.06, d0 + 0.06);
  hookDraw(t, t, { cam, S, win, winR, holeGlow, ring, card });
  return { glow: 0.85, capY: 1490, zblur: 0.36 * dive, zcx: lerp(540, IN0.P[0], dive), zcy: lerp(960, IN0.P[1], dive), flash: 0.18 * bumpAt(t, c.the_dot - 0.04, 9) };
};

// ================================================================ inside the eye: the cable, the wall, nobody
const IN0 = { P: [540, 900], s: 1.15 };   // how the inside shot opens: where the eyeball's middle is on screen, and its scale
function secBg(t) { darkBg('#1C3F7C', '#050919'); motes(t, 0.3); }
SC.inside = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0;
  secBg(t);
  // the camera: arrive on the whole eye, travel to the back wall where the cable plugs in, pull back for the beams,
  // then push in on the hole
  const V = eyeKeys(lt, [[0, 0, 0, IN0.s, IN0.P[0], IN0.P[1]], [c.cable - T0 + 0.3, 200, 110, 1.55, 470, 880], [c.plugs_end - T0, 210, 120, 1.62, 470, 880],
    [c.light - T0, 120, 60, 1.25, 520, 880], [c.so - T0 + 0.35, 20, 0, 0.98, 600, 860], [c.landed_end - T0, 30, 0, 1.0, 600, 860],
    [c.nobody - T0 + 0.1, 228, 132, 2.25, 500, 820], [D, 230, 134, 2.35, 500, 820]]);
  const thud = bumpAt(t, c.plugs_end + 0.12, 7);   // the plug goes home in the pause after "plugs in..."
  V.x += 7 * thud * vnoise(t * 36, 2); V.y += 7 * thud * vnoise(t * 33, 6);
  // the plug goes in on "plugs in" (with a bounce), the wires glow on "cable"
  const plug = ramp(t, c.plugs - 0.15, c.plugs_end + 0.12, E.inCubic);
  const pulses = [0, 1, 2, 3].map((j) => { const u = ((t - c.cable) * 0.9 + j / 4) % 1; return [u, t > c.cable - 0.05 ? 0.95 - 0.6 * ramp(t, c.light, c.so) : 0]; });
  const wireGlow = ramp(t, c.cable - 0.05, c.cable + 0.2) * (1 - ramp(t, c.plugs_end, c.plugs_end + 0.4));
  // the beams: the X's light lands on the sensor straight back; the dot's light lands in the hole
  const kX = ramp(t, c.so - 0.05, c.so + 0.45, E.inOutSine), kD = ramp(t, c.dot2 - 0.05, c.landed_end - 0.1, E.inOutSine);
  const xHit = kX >= 0.999, dHit = kD >= 0.999;
  // who stands where, and what they do
  const iTry = 8;   // the sensor just below the hole tries to step in on "no room"
  const tryK = popK(t, c.room - 0.08, c.light - 0.02, 0.18, 0.2);
  const sens = SENS_A.map((a, i) => {
    let mood = 'calm', look = [-1, 0.25 * Math.sin(t * 2.1 + i)], lean = 0, hop = 0, fire = 0, jit = 0;
    if (t > c.plugs_end + 0.1 && t < c.plugs_end + 0.5 && (i === 7 || i === iTry)) { mood = 'oof'; jit = 2; }
    if (i === iTry) { lean = -0.5 * tryK; hop = 10 * tryK; if (tryK > 0.6) mood = 'oof'; }
    if (i === SENS_X && xHit) { mood = t < c.landed + 0.4 ? 'shout' : 'ready'; fire = 1 - 0.5 * ramp(t, c.landed + 0.3, c.landed + 0.6); jit = mood === 'shout' ? 2.5 : 0; }
    if (dHit && (i === 7 || i === 8)) { look = i === 7 ? [0.6, 1] : [0.4, -1]; mood = t > c.nobody ? 'meh' : 'calm'; }
    const pop = 1, wave = 10 * pulseOf(t, [c.light + 0.06 * Math.abs(i - 6)], 0.18);
    return { pop, mood, look, lean, hop: hop + wave, fire, jit };
  });
  const beams = [
    { from: [-1600, 0], to: wallPt(0, EYB.R - 30 - 75), col: '#FFFFFF', k: kX, w: 22, a: 1 - 0.6 * ramp(t, c.landed + 0.4, c.landed + 0.8) },
    { from: [-1600, -760], to: wallPt(HOLE_A, EYB.R - 54), col: '#FF4A5C', k: kD, w: 22, bead: dHit ? 26 : 0, beadCol: '#FF3B4E', a: 1 },
  ];
  const holeGlow = 0.6 * popK(t, c.noroom - 0.05, c.so, 0.15, 0.2) + 0.9 * pulseOf(t, [c.nobody - 0.05], 0.5);
  const res = eyeOn(V, () => eyeCut(t, { sens, plug, cablePulses: pulses, wireGlow, beams, holeGlow, noSkin: true }));
  // what things are
  const H0 = eyePt(V, ...wallPt(HOLE_A, EYB.R + 60)), CB = eyePt(V, ...res.cableAt(0.45));
  const ck = ramp(t, c.cable - 0.02, c.cable + 0.16) * (1 - ramp(t, c.noroom - 0.22, c.noroom - 0.08));
  tagPill('TO YOUR BRAIN', clamp(CB[0], 300, 640), CB[1] + 110, '#FFB25A', ck, 40);
  const nk = ramp(t, c.noroom - 0.04, c.noroom + 0.14) * (1 - ramp(t, c.so - 0.25, c.so - 0.1));
  const S5 = eyePt(V, ...wallPt(SENS_A[4], EYB.R - 30 - 60));
  const sk = ramp(t, c.light - 0.04, c.light + 0.14) * (1 - ramp(t, c.so - 0.25, c.so - 0.1));
  thinLeader([360, 560], S5, sk >= 0.99 ? 1 : sk, '#FF9A3C'); pill(360, 520, 'LIGHT SENSORS', '#FF9A3C', sk, 40);
  const HP = eyePt(V, ...wallPt(HOLE_A, EYB.R - 44));
  tagPill('NO ROOM!', clamp(HP[0] - 10, 220, 700), HP[1] + 130, '#FF5A6E', nk, 46, '#FFFFFF');
  const bk = ramp(t, c.landed_end + 0.15, c.landed_end + 0.3);
  tagPill('YOUR BLIND SPOT', clamp(HP[0] - 40, 300, 640), clamp(HP[1] + 150, 600, 1180), '#FFD447', bk, 40);
  // the neighbours look at the bead: nobody home
  const qk = popK(t, c.nobody + 0.05, shot.end + 1, 0.12, 0.1);
  if (qk > 0.01) for (const [j, dx] of [[7, -30], [8, 40]]) { const Q = eyePt(V, ...wallPt(SENS_A[j], EYB.R - 30 - 98)); screenSpace(); bigWord('?', Q[0] + dx, Q[1] - 30, 90, '#C8A8FF', E.outBack(qk, 2.2), j === 7 ? -0.2 : 0.2); }
  // the X's sensor shouts what it saw
  const XS = eyePt(V, ...wallPt(0, EYB.R - 30 - 140));
  eyeShout('X!', XS[0] - 70, XS[1] - 40, 92, popK(t, c.so + 0.45, c.landed + 0.45, 0.1, 0.15), 1, -0.08, '#FFFFFF', 3);
  const arrive = ramp(lt, 0, 0.3);
  return { glow: 0.9, capY: 1440, zblur: 0.3 * (1 - arrive), zcx: IN0.P[0], zcy: IN0.P[1], flash: 0.22 * (1 - ramp(lt, 0, 0.14)) + 0.05 * thud };
};

// ================================================================ the brain paints over the hole
SC.paint = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0;
  darkBg('#182B5E', '#04061A'); motes(t, 0.25);
  const hole = ramp(t, T0 + 0.12, T0 + 0.4);
  const brush = ramp(t, c.because - 0.1, c.brain2 + 0.1, E.inOutCubic);
  const dab = ramp(t, c.paints - 0.12, c.paints + 0.12, E.inOutSine);
  // "with whatever's around it": the brush dips back into the wall beside the hole, then finishes
  const dip = Math.sin(Math.PI * ramp(t, c.whatevers - 0.05, c.around + 0.05));
  const fill = clamp(ramp(t, c.paints + 0.05, c.whatevers - 0.05) * 0.6 + ramp(t, c.around, c.it2_end + 0.05) * 0.4);
  const mood = t < c.because ? (t < T0 + 0.5 ? 'calm' : 'worried') : t < c.it2_end + 0.1 ? 'think' : 'grin';
  const look = t < c.because ? [0.8, -1] : [0.9, -1];
  // the room pushes in a little on the screen, and slides as the brush works
  const k = 1 + 0.06 * ramp(lt, 0, D, E.inOutSine);
  const pulses = [0, 1, 2].map((j) => [((t - T0) * 1.2 + j / 3) % 1, 0.9]);
  ctx.save(); gctx.save();
  const res = brainPaint(t, { hole, brush, dab: dab * (1 - 0.85 * dip), fill, stroke: t * 14, loaded: ramp(t, c.paints - 0.1, c.paints + 0.05), mood, look, pulses });
  ctx.restore(); gctx.restore();
  // the hole pulses on "hole"; a sparkle where it was once it is painted
  const hk = pulseOf(t, [c.hole2 - 0.05], 0.45);
  if (hk > 0.01) { screenSpace(); paint(() => { ctx.beginPath(); ctx.arc(BP_H[0], BP_H[1], 120, 0, 7); ctx.lineWidth = 8; ctx.strokeStyle = rgba('#FFD447', hk); ctx.stroke(); }); }
  const sp = popK(t, c.it2_end + 0.05, c.it2_end + 0.65, 0.08, 0.2);
  if (sp > 0.01) { screenSpace(); twinkleStar(BP_H[0] + 30, BP_H[1] - 30, 46 * sp, sp); }
  void res;
  return { glow: 0.9, push: { k, cx: 540, cy: 760 }, capY: 1500, flash: 0.22 * (1 - ramp(lt, 0, 0.12)) };
};
// a four-point sparkle (screen space)
function twinkleStar(x, y, r, a) {
  for (const [c, sc] of [[ctx, 1], [gctx, 0.5]]) {
    c.save(); c.setTransform(sc, 0, 0, sc, 0, 0); c.translate(x, y);
    c.beginPath();
    for (let i = 0; i < 8; i++) { const an = (i / 8) * Math.PI * 2 - Math.PI / 2, rr = i % 2 ? r * 0.22 : r; c.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); }
    c.closePath(); c.fillStyle = rgba(c === gctx ? '#FFE680' : '#FFFFFF', a); c.fill(); c.restore();
  }
}

// ================================================================ the octopus: wired from behind
const OCT_AT = { x: 590, y: 900, s: 1.55 };
SC.octopus = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0;
  const split = ramp(t, c.its - 0.12, c.its + 0.18, E.inOutCubic);
  if (split < 1) {
    seaBack({ x: 540, y: 960, zoom: 1 + 0.05 * lt / D }, t);
    const pop = ramp(t, T0, T0 + 0.3, E.outBack);
    const away = split;
    screenSpace();
    ctx.save(); gctx.save();
    const s = OCT_AT.s * (0.6 + 0.4 * pop) * (1 - 0.6 * away), x = lerp(OCT_AT.x, 900, away), y = lerp(OCT_AT.y, 360, away);
    octopus(ctx, x, y, s, { t, coverEye: 1, phone: 1, phoneDot: 1, look: [-0.9, -0.5], face: t < c.octopus_end ? 'smile' : 'grin' });
    ctx.restore(); gctx.restore();
  }
  if (split > 0) {
    // two eyes cut in half, one above the other: ours (wired in front: a hole) and the octopus's (wired from behind)
    secBg(t);
    const pk = E.outBack(split, 1.4);
    const wiresO = ramp(t, c.wired - 0.1, c.behind_end, E.inOutSine), glowO = popK(t, c.behind - 0.1, c.no_hole + 0.3, 0.2, 0.3);
    const yes = ramp(t, c.no_hole - 0.05, c.no_hole + 0.15), noHole = pulseOf(t, [c.hole3 - 0.03], 0.45);
    const VU = { x: 470, y: 660, s: 0.7 * pk }, VO = { x: 470, y: 1175, s: 0.7 * pk };
    const sensU = SENS_A.map((a, i) => ({ look: [-1, 0.2 * Math.sin(t * 2 + i)] }));
    const sensO = SENS_A.map((a, i) => ({ look: [-1, 0.2 * Math.sin(t * 2.2 + i)], hop: 8 * pulseOf(t, [c.all + 0.05 * i], 0.16), mood: t > c.all ? 'ready' : 'calm' }));
    eyeOn(VU, () => eyeCut(t, { sens: sensU, plug: 1, holeGlow: 0.5 + 0.5 * noHole, cableOut: 800, noSkin: true }));
    eyeOn(VO, () => eyeCut(t, { sens: sensO, behind: true, wires: wiresO, wireGlow: glowO, cableOut: 800, noSkin: true, extra: { look: [-1, 0], mood: t > c.no_hole ? 'ready' : 'calm', hop: 10 * pulseOf(t, [c.no_hole + 0.1], 0.2) } }));
    pill(240, 430, 'YOU', '#FFB25A', pk, 44); pill(290, 930, 'OCTOPUS', OCT.col, pk, 44);
    const HU = eyePt(VU, ...wallPt(HOLE_A, EYB.R - 44)), HO = eyePt(VO, ...wallPt(HOLE_A, EYB.R - 44));
    tagPill('HOLE', HU[0] + 120, HU[1] + 30, '#FF5A6E', ramp(t, c.its + 0.1, c.its + 0.3), 38, '#FFFFFF');
    tagPill('WIRED FROM BEHIND', 560, 1420, '#4DFFB4', ramp(t, c.behind - 0.06, c.behind + 0.1), 38);
    if (yes > 0.01) bigTick(HO[0] + 110, HO[1] - 10, 60, yes);
    // the octopus watches from the corner
    screenSpace(); ctx.save(); gctx.save();
    octopus(ctx, lerp(-200, 165, E.outBack(clamp(split * 1.2), 1.3)), 1500, 0.5, { t, coverEye: 0, phone: 0, look: [0.8, -0.6], face: t > c.no_hole ? 'smug' : 'smile', sway: 0.5 });
    ctx.restore(); gctx.restore();
  }
  return { glow: 0.9, capY: split > 0.5 ? 1585 : 1330, push: { k: 1 + 0.07 * ramp(t, c.its, c.all_end, E.inOutSine) * split, cx: 520, cy: 1150 }, flash: 0.2 * (1 - ramp(lt, 0, 0.12)) + 0.14 * bumpAt(t, c.its, 9) };
};
// a big green tick (screen space)
function bigTick(x, y, r, k) {
  if (k <= 0.01) return;
  const q = E.outBack(clamp(k), 2.2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(q, q);
  for (const [w, col] of [[r * 0.5, '#0B0B1A'], [r * 0.3, '#4DFFB4']]) { ctx.beginPath(); ctx.moveTo(-r * 0.7, 0); ctx.lineTo(-r * 0.15, r * 0.55); ctx.lineTo(r * 0.85, -r * 0.6); ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = col; ctx.stroke(); }
  ctx.restore();
  softDot(gctx, x, y, r * 1.6, '#4DFFB4', 0.3 * clamp(k));
}

// ================================================================ the button: show-off
SC.button = (lt, t, shot) => {
  const c = cu(), T0 = shot.start;
  seaBack({ x: 540, y: 960, zoom: 1.04 }, t);
  const pop = ramp(t, T0, T0 + 0.3, E.outBack), shades = ramp(t, T0 + 0.25, c.show - 0.1, E.linear);
  const wave = popK(t, c.show + 0.05, c.show_end + 0.6, 0.15, 0.3);
  screenSpace(); ctx.save(); gctx.save();
  octopus(ctx, OCT_AT.x, 930, OCT_AT.s * (0.7 + 0.3 * pop), { t, coverEye: 1, phone: 1, phoneDot: 1, shades, wave, look: [-0.9, -0.5], face: 'smug' });
  ctx.restore(); gctx.restore();
  // a glint on the shades as he says it
  const gl = popK(t, c.show + 0.1, c.show + 0.55, 0.06, 0.2);
  if (gl > 0.01) twinkleStar(OCT_AT.x + 0.58 * OCT_AT.s * 100, 930 + 0.0, 40 * gl, gl);
  return { glow: 0.9, flash: 0.2 * (1 - ramp(lt, 0, 0.12)) };
};

SC.loop = (lt, t, shot) => {
  const tt = t - TLd.duration, S = hookA(tt), cam = hookCam(tt);
  hookDraw(tt, t, { cam, S, card: ramp(tt, -0.25, -0.1) });
  return { glow: 0.85, flash: 0.2 * (1 - ramp(lt, 0, 0.1)) };
};

// ================================================================ the cover (rendered by src/cover.sh from a one-shot timeline)
SC.cover = (lt, t) => {
  const S = hookA(0.6), cam = { x: 560, y: 1030, zoom: 3.2, rot: 0 };
  S.face = BF.strain;
  hookDraw(0.6, 0.6, { cam, S, card: 1 });
  screenSpace();
  bigWord('FIND YOUR', 540, 1290, 120, '#FFFFFF', 1, -0.03);
  bigWord('BLIND SPOT', 540, 1440, 150, '#FFD447', 1, -0.03);
  return { glow: 0.85, noCaptions: true };
};

function initScenes2() {
  initBed();
  initSea();
}
