// Why Do We CRY? Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;
const shotOf = (id) => TLd.shots.find((s) => s.id === id);
// the strongest of a list of pulses at time t: each is on for `len` seconds, with soft edges
const pulseOf = (t, times, len = 0.16) => times.reduce((m, f) => Math.max(m, clamp((t - f) / 0.03) * clamp((f + len - t) / 0.05)), 0);
// a decaying bump after a moment
const bumpAt = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);
const lerp2 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the couch: one warm lamp on the right (the key, from above), the moon in the window behind him on the left (the rim)
const COUCH_LIGHT = { ...flipLight(LIGHTS.candle), pool: 0.6, halo: 0.12 };
// the same room, close: the set goes soft behind him
const CLOSE_LIGHT = (lt, t) => ({ ...COUCH_LIGHT, dof: lerp(1.6, 0.25, ramp(t, 2.1, 3.4, E.inOutCubic)) });
const END_LIGHT = (lt, t) => ({ ...COUCH_LIGHT, dof: lerp(0.25, 1.6, ramp(t, TLd.cues.loop - 0.1, TLd.duration - 0.03, E.inOutCubic)) });
setLights({ hook: CLOSE_LIGHT, honk: COUCH_LIGHT, spill: COUCH_LIGHT, only: COUCH_LIGHT, help: END_LIGHT, cover: { ...COUCH_LIGHT, dof: 1.4 },
  alarm: LIGHTS.inside, drain: LIGHTS.inside, photo: LIGHTS.diagram });

// ================================================================ the couch: frame 1 and round it
const HEADY = SOFA.seatY - 282 * SOFA.hs;                 // the middle of his head (world y) when he sits still
const TUB = { x: -30, y: -124, rot: -0.05 };              // the tub in his left hand (rig-local)
const TIP_MOUTH = [3, -241], TIP_LIPS = [16, -239], TIP_TUB = [-12, -177], TIP_REST = [6, -200];
const CAM_TIGHT0 = { x: 430, y: HEADY + 106, zoom: 2.78 }, CAM_TIGHT = { x: 430, y: HEADY + 104, zoom: 2.96 }, CAM_TWO = { x: 580, y: 988, zoom: 1.7 };
// his right wrist for a spoon whose bowl is at `tip`, the spoon lying at angle `ang`
const wristFor = (tip, ang) => [tip[0] - 58 * Math.cos(ang) + 9, tip[1] - 58 * Math.sin(ang) + 10];
const ANG_MOUTH = Math.PI + 0.36, ANG_TUB = Math.PI - 0.34;

// the opening, as a function of tt = seconds since frame 1
function hookA(tt) {
  const c = cu();
  // ---- the spoon: in (0.17), out empty, down into the tub, a new scoop, halfway up ... and it stops there when his eyes go
  const K = [
    [0, TIP_LIPS, ANG_MOUTH, 1, 0], [c.chomp, TIP_MOUTH, ANG_MOUTH, 1, 0.92], [0.52, TIP_MOUTH, ANG_MOUTH, 1, 0.92], [0.8, [30, -228], ANG_MOUTH - 0.1, 0, 0],
    [1.3, TIP_TUB, ANG_TUB, 0, 0], [1.75, [-20, -176], ANG_TUB + 0.1, 0.7, 0], [2.15, TIP_REST, ANG_TUB + 0.5, 1, 0],
    [c.relax + 0.25, TIP_REST, ANG_TUB + 0.5, 1, 0], [c.relax + 0.6, TIP_MOUTH, ANG_MOUTH, 1, 0.92], [c.sci - 0.1, TIP_MOUTH, ANG_MOUTH, 1, 0.92],
    [c.sci + 0.25, [30, -226], ANG_MOUTH - 0.1, 0, 0], [c.think + 0.2, TIP_TUB, ANG_TUB, 0, 0], [99, TIP_TUB, ANG_TUB, 0, 0],
  ];
  let i = 1; while (i < K.length - 1 && tt > K[i][0]) i++;
  const a = K[i - 1], b = K[i], u = E.inOutCubic(inv(a[0], b[0], tt));
  const tip = lerp2(a[1], b[1], u), ang = lerp(a[2], b[2], u), scoop = lerp(a[3], b[3], u), hide = lerp(a[4], b[4], u);
  // ---- the crying
  const burst = ramp(tt, c.spring - 0.02, c.spring + 0.14, E.outCubic);
  const well = lerp(0.55, 1, ramp(tt, c.eyes - 0.2, c.eyes + 0.25, E.inOutSine));
  const lampK = ramp(tt, c.face - 0.06, c.face + 0.2);
  const jets = burst * lerp(1, 0.72, ramp(tt, c.relax, c.relax + 0.5)) * lerp(1, 0.6, ramp(tt, c.face, c.face + 0.4));
  const cry = { well, run: ramp(tt, c.spring + 0.05, c.spring + 0.4), pour: 0.25 * burst, jets, reach: 0.95, bead: tt < 0.52 ? 0.45 + 1.06 * tt : -1 };
  // ---- his face
  let face = lerpFace(CRYFACE.bite, { ...CRYFACE.bite, mouthOpen: 0.18 }, ramp(tt, c.chomp - 0.1, c.chomp + 0.04));
  face = lerpFace(face, { ...CRYFACE.chew, mouthOpen: 0.3 + 0.5 * Math.abs(Math.sin(tt * 11)) }, ramp(tt, 0.55, 0.8));
  face = lerpFace(face, CRYFACE.brim, ramp(tt, c.eyes - 0.22, c.eyes + 0.12));
  face = lerpFace(face, { ...CRYFACE.wail, mouthOpen: 0.62 + 0.2 * Math.sin(tt * 13) }, ramp(tt, c.spring - 0.03, c.spring + 0.1));
  // the spoonful goes in mid-sob, and he chews through it
  const eat = ramp(tt, c.relax + 0.42, c.relax + 0.6) * (1 - ramp(tt, c.sci + 0.15, c.sci + 0.4));
  face = lerpFace(face, { ...CRYFACE.wail, mouth: 'o', mouthOpen: 0.2 + 0.25 * Math.abs(Math.sin(tt * 12)) }, eat);
  // the lamp: he looks up at it, then round at the dog
  const up = ramp(tt, c.face + 0.05, c.face + 0.3) * (1 - ramp(tt, c.backup - 0.1, c.backup + 0.15));
  face = lerpFace(face, { ...CRYFACE.sniff, lookY: -1.2, lookX: 0.1, eyeOpen: 1.25, blink: 0, mouth: 'wavy' }, up);
  face = lerpFace(face, { ...CRYFACE.sniff, lookX: 1, lookY: 0, eyeOpen: 1.15, blink: 0, mouth: 'wavy' }, ramp(tt, c.backup - 0.05, c.backup + 0.2));
  const sob = burst * (1 - 0.5 * up);
  const A = {
    face, tub: TUB, handR: wristFor(tip, ang), spoon: { tip, scoop, hide }, dent: 1, cry,
    headDY: 2.2 * Math.sin(tt * 11) * ramp(tt, 0.55, 0.8) * (1 - burst) - 5 * sob * Math.abs(Math.sin(tt * 7.5)) - 3 * burst,
    headRot: 0.03 * sob * Math.sin(tt * 7.5) - 0.02 * bumpAt(tt, c.spring, 5),
    bob: 2.4 * sob * Math.sin(tt * 15),
    lamp: { k: lampK, col: '#FF4055', lit: tt < c.called ? 0.55 : 0.3 + 0.7 * (Math.sin((tt - c.called) * 21) > -0.2 ? 1 : 0), beams: ramp(tt, c.called, c.called + 0.2) },
  };
  // ---- the dog: watching the film; a jet catches him; he looks at the man, then at the lamp, then his ears go up
  const hit = ramp(tt, c.spring + 0.32, c.spring + 0.45), shakeK = bumpAt(tt, c.leak_end + 0.05, 4.5) * hit;
  const D = {
    look: tt < c.spring + 0.3 ? [0, 0.2] : tt < c.face + 0.1 ? [-1, -0.1] : tt < c.backup - 0.05 ? [-0.9, -0.9] : [-1, -0.2],
    ears: -0.9 * hit * (1 - ramp(tt, c.relax, c.relax + 0.5)) + ramp(tt, c.backup - 0.04, c.backup + 0.1, E.outBack),
    blink: hit * (1 - ramp(tt, c.leak_end + 0.3, c.leak_end + 0.4)) > 0.5 ? 1 : 0,
    wet: hit * (1 - ramp(tt, c.relax + 0.2, c.relax + 1.2)),
    wide: 0.7 * ramp(tt, c.relax - 0.1, c.relax + 0.2) + 0.3 * ramp(tt, c.backup, c.backup + 0.15),
    tilt: 0.3 * shakeK * Math.sin(tt * 34) + 0.24 * ramp(tt, c.backup + 0.05, c.backup + 0.3, E.outBack),
    headDX: -6 * hit * (1 - ramp(tt, c.relax, c.relax + 0.4)), wag: 0, mouth: 'shut',
  };
  return { A, D, huh: ramp(tt, c.huh - 0.02, c.huh + 0.12, E.outBack), burst };
}
function hookCam(tt) {
  const c = cu();
  const k = camKeys(tt, [[0, CAM_TIGHT0.x, CAM_TIGHT0.y, CAM_TIGHT0.zoom], [0.34, CAM_TIGHT.x, CAM_TIGHT.y, CAM_TIGHT.zoom], [2.05, 430, HEADY + 103, 3.04],
    [3.45, CAM_TWO.x, CAM_TWO.y, CAM_TWO.zoom], [8.2, 577, 984, 1.78]]);
  const j = bumpAt(tt, c.spring, 8);
  const sh = shake(tt, 7 * j, 30, 3);
  k.x += sh[0] / k.zoom; k.y += sh[1] / k.zoom;
  return k;
}

// the room, the couch, the dog, him. o: {cam, A (him), D (the dog; null = no dog), dogX, lamp, tv, before: fn(), behind: fn(),
// after: fn(H)}
function couchDraw(t, o) {
  const cam = o.cam;
  sofaRoom(cam, t, { lamp: o.lamp });
  if (o.behind) { applyCam(cam); o.behind(); }
  applyCam(cam);
  sofaCouchBack();
  tissueBox(ctx, 668, 902, 0.62, t);
  if (o.D && !o.dogFront) actor(() => pupDraw(ctx, o.dogX === undefined ? SOFA.dogX : o.dogX, SOFA.dogY, 0.92, t, o.D));
  sofaCouchFront();
  tissueWad(ctx, 306, 1230, 16, 2); tissueWad(ctx, 566, 1240, 13, 5); tissueWad(ctx, 250, 1420, 19, 7);
  if (o.before) { applyCam(cam); o.before(); }
  const H = sofaHero(cam, t, o.A);
  applyCam(cam);
  if (o.D && o.dogFront) actor(() => pupDraw(ctx, o.dogX === undefined ? SOFA.dogX : o.dogX, SOFA.dogY, 0.92, t, o.D));   // the dog leans across him
  if (o.after) o.after(H);
  tvWash(t, o.tv === undefined ? 1 : o.tv);
  return H;
}

// S O S next to the lamp (L = the lamp on the screen); sc follows the camera when it pushes in, a fades them
function sosLetters(L, t, sc, a) {
  const c = cu();
  if (a <= 0.01) return;
  screenSpace();
  ['S', 'O', 'S'].forEach((ch, i) => {
    const k = ramp(t, c.called + i * 0.16, c.called + i * 0.16 + 0.14, E.outBack) * a;
    if (k > 0) bigWord(ch, L[0] + ((i - 1) * 96 + 196) * sc, L[1] + (-56 - 8 * Math.sin(t * 9 + i)) * sc, 132 * sc, '#FFFFFF', k, (i - 1) * 0.08, '#C4122E');
  });
}

// ================================================================ shots
SC.hook = (lt, t, shot) => {
  const c = cu(), S = hookA(t), cam = hookCam(t);
  const H = couchDraw(t, { cam, A: S.A, D: S.D, after: (H) => {
    // the fat tear: off his jaw and into the tub
    if (t >= 0.5 && t < c.plop) { const j = sofaHeadPt(H.st, -29, 68), u = inv(0.5, c.plop, t); paint(() => tearDrop(ctx, lerp(j[0], H.tubPt[0] - 6, u), lerp(j[1], H.tubPt[1], u * u), 7, 1)); }
    if (t >= c.plop && t < c.plop + 0.35) { const u = (t - c.plop) / 0.35; paint(() => { for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.5; tearDrop(ctx, H.tubPt[0] - 6 + Math.cos(a) * 46 * u, H.tubPt[1] + Math.sin(a) * 50 * u + 70 * u * u, 4.4 * (1 - u), 1 - u); } }); }
    // the dog's "?"
    if (S.huh > 0.01) { const p = pupPt(SOFA.dogX, SOFA.dogY, 0.92, S.D, 30, -112); paint(() => { ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(0.2); ctx.scale(S.huh, S.huh); ctx.font = '400 96px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = 12; ctx.strokeStyle = '#0B0B1A'; ctx.strokeText('?', 0, 0); ctx.fillStyle = '#FFD447'; ctx.fillText('?', 0, 0); ctx.restore(); }); }
  } });
  // S O S: the lamp says it, letter by letter
  const L = toScreen(cam, H.lampPt[0], H.lampPt[1]);
  sosLetters(L, t, 1, 1);
  const dive = ramp(t, shot.end - 0.16, shot.end, E.inCubic);
  return { glow: 0.85, capY: lerp(1420, 1330, ramp(t, 2.3, 3.2)), zblur: 0.22 * dive, zcx: L[0], zcy: L[1] + 150, flash: 0.1 * bumpAt(t, c.spring, 9) };
};

// ================================================================ into his head
// The framing of his head: keys [t, fx, fy, K, sy] put the point (fx, fy) of his head (head units) at (540, sy) with K px
// to a unit. The zoom is eased in its logarithm, so a long push feels even.
function headView(keys, lt) {
  let k = keys[0];
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1], b = keys[i];
    if (lt >= b[0]) { k = b; continue; }
    if (lt > a[0]) { const u = E.inOutCubic(inv(a[0], b[0], lt)); k = [lt, lerp(a[1], b[1], u), lerp(a[2], b[2], u), Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), u)), lerp(a[4], b[4], u)]; }
    break;
  }
  return { cx: 540 - k[1] * k[3], cy: k[4] - k[2] * k[3], K: k[3] };
}
function insideBg(t) {
  darkBg('#122258', '#030614');
  motes(t, 0.5);
}
// where the hook leaves him: the scene the camera pushes out of, and his head's place on the screen there
function hookEnd() {
  const T0 = shotOf('alarm').start, S0 = hookA(T0), cam0 = hookCam(T0), st0 = sofaSt(S0.A), hp = sofaHeadPt(st0, 0, 0), sp = toScreen(cam0, hp[0], hp[1]);
  return { T0, S0, hp, K0: SOFA.hs * cam0.zoom, sp };
}
const VIEW_EYES = [0, -9, 8.3, 830];
SC.alarm = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, HE = hookEnd();
  const V = headView([[0, (540 - HE.sp[0]) / HE.K0, 0, HE.K0, HE.sp[1]], [0.46, 0, -14, 7.4, 866], [1.0, 0, -37, 10, 712], [2.35, 0, -38, 10.7, 704], [2.8, 0, -38, 10.7, 704],
    [3.5, ...VIEW_EYES], [D, 0, -9, 8.6, 830]], lt);
  V.a = ramp(lt, 0.08, 0.4);
  if (V.a < 1) {   // the room is still there while his head turns to glass
    const zoom = V.K / SOFA.hs, cam = { x: HE.hp[0] - (V.cx - 540) / zoom, y: HE.hp[1] - (V.cy - 960) / zoom, zoom, rot: 0 };
    const Hc = couchDraw(t, { cam, A: { ...HE.S0.A, lamp: { ...HE.S0.A.lamp, lit: 0.5 * (1 - V.a), beams: 0 } }, D: HE.S0.D });
    sosLetters(toScreen(cam, Hc.lampPt[0], Hc.lampPt[1]), t, V.K / HE.K0, 1 - ramp(lt, 0.04, 0.24));
    screenSpace(); ctx.fillStyle = `rgba(5,10,30,${0.94 * ramp(lt, 0.1, 0.42)})`; ctx.fillRect(0, 0, W, H);
    if (V.a > 0.4) { ctx.globalAlpha = (V.a - 0.4) / 0.6; motes(t, 0.5); ctx.globalAlpha = 1; }
  } else insideBg(t);
  const sig = t < c.and_it ? 0 : (t - c.and_it) / 0.44;
  const ringing = ramp(t, c.alarm - 0.1, c.alarm + 0.03) * lerp(1, 0.3, ramp(t, c.opens, c.opens + 0.5));
  thDraw(V, t, {
    core: 0.25 + 0.75 * ramp(t, c.feelings - 0.14, c.feelings + 0.22, E.outBack), ring: ringing,
    sig, open: ramp(t, c.opens - 0.02, c.tap + 0.24, E.inOutSine), flow: ramp(t, c.tap + 0.02, c.tap + 0.26),
    fill: 0.85 * ramp(t, c.tap + 0.2, c.eye_end + 0.3, E.inOutSine), spill: ramp(t, c.eye + 0.1, c.eye_end + 0.3),
    look: t < c.alarm - 0.1 ? [0, 0.2] : t < c.and_it ? [0, -1] : [0, 0.35], bellK: ramp(lt, 0.3, 0.5, E.outBack),
  });
  // labels: what is what, while the camera is on it
  const P1 = thPt(V, 3, -33), k1 = ramp(t, c.feelings - 0.02, c.feelings + 0.2) * (1 - ramp(t, c.brain_end + 0.05, c.brain_end + 0.25));
  thLabel('FEELINGS', 800, P1[1] + 150, P1[0] + 44, P1[1] + 16, '#FF86A6', k1, 48);
  const P2 = thPt(V, 44, -27), k2 = ramp(t, c.tap + 0.05, c.tap + 0.28);
  thLabel('TEAR GLAND', 772, 508, P2[0], P2[1] - 8, '#7FE9FF', k2, 44);
  const arrive = ramp(lt, 0, 0.3);
  return { glow: 0.9, zblur: 0.3 * (1 - arrive) * ramp(lt, 0, 0.06), zcx: V.cx, zcy: V.cy, flash: 0.12 * bumpAt(t, c.alarm, 9) };
};

// ---- the drain in the corner of each eye, the pipe down to the nose, and what comes out of it
SC.drain = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, T0 = shot.start;
  const V = headView([[0, 0, -9, 8.6, 830], [c.drain - T0 + 0.05, 0, 5, 19, 800], [c.leads - T0 - 0.1, 0, 5.4, 20, 800], [c.nose1 - T0 + 0.25, 0, 13, 16.5, 810],
    [c.so - T0 - 0.05, 0, 14, 16.8, 810], [c.nose2 - T0 + 0.3, 0, 22, 14.5, 800], [D, 0, 23, 15.2, 800]], lt);
  V.a = 1;
  insideBg(t);
  thDraw(V, t, {
    core: 1, ring: 0.3 * (1 - ramp(lt, 0, 0.6)), sig: 2, open: 1, flow: 1, fill: 0.85 + 0.1 * Math.sin(t * 3), spill: 1,
    swirl: ramp(t, c.tiny - 0.1, c.drain + 0.1), pulseDrain: Math.max(bumpAt(t, c.drain, 5), bumpAt(t, c.in_each + 0.2, 5)),
    duct: ramp(t, c.leads - 0.05, c.nose1_end - 0.05, (x) => x), drip: ramp(t, c.gurgle - 0.05, c.gurgle + 0.25) * (0.45 + 0.55 * ramp(t, c.nose2 - 0.1, c.nose2 + 0.2)),
    look: t < c.leads ? [0, 0.3] : [0, 0.9],
  });
  const PR = thPt(V, TH.DRAIN[0], TH.DRAIN[1]), PL = thPt(V, -TH.DRAIN[0], TH.DRAIN[1]);
  const k = ramp(t, c.drain - 0.03, c.drain + 0.2) * (1 - ramp(t, c.leads + 0.1, c.leads + 0.35));
  if (k > 0.01) { screenSpace(); paint(() => { ctx.setLineDash([9, 9]); line(ctx, 470, 640, lerp(470, PL[0] + 26, clamp(k * 1.3)), lerp(640, PL[1] - 40, clamp(k * 1.3)), 4, 'rgba(127,233,255,0.9)'); ctx.setLineDash([]); if (k > 0.75) circle(ctx, PL[0] + 26, PL[1] - 40, 8, '#7FE9FF'); }); }
  thLabel('DRAIN', 540, 600, PR[0] - 26, PR[1] - 40, '#7FE9FF', k, 54);
  const PN = thPt(V, 0, 9), k2 = ramp(t, c.nose1 - 0.05, c.nose1 + 0.2) * (1 - ramp(t, c.so, c.so + 0.2));
  pill(540, PN[1] - 250, 'TO THE NOSE', '#FF9A3C', k2, 46);
  return { glow: 0.9, flash: 0.1 * bumpAt(t, c.gurgle, 8) };
};

// ================================================================ back on the couch
const SOS_LAMP = (t) => ({ k: 1, col: '#FF4055', lit: 0.3 + 0.7 * (Math.sin(t * 21) > -0.2 ? 1 : 0), beams: 0.7 });
// ---- the nose: he blows it
SC.honk = (lt, t, shot) => {
  const c = cu();
  const hk = ramp(t, c.honk - 0.02, c.honk + 0.05) * (1 - ramp(t, c.honk_end - 0.06, c.honk_end + 0.08));
  const up = ramp(lt, 0, 0.16, E.outCubic);
  const A = {
    face: { ...CRYFACE.wail, mouth: 'flat', mouthOpen: 0, browY: 1.1 + 0.5 * hk, blink: 1 }, tub: TUB, spoonInTub: true,
    handR: [22 + 40 * (1 - up), -238 + 60 * (1 - up)], tissue: up, puff: hk * (0.75 + 0.25 * Math.sin(t * 60)),
    cry: { well: 1, run: 1, pour: 0.3, jets: 0 }, headDY: -4 * hk + 2 * Math.sin(t * 60) * hk, headRot: 0.03 * Math.sin(t * 47) * hk, bob: 2 * Math.sin(t * 60) * hk, lamp: SOS_LAMP(t),
  };
  const Dg = { look: [-1, 0], ears: -1 * hk + 0.4 * (1 - hk), wide: 0.5 + 0.5 * hk, headDX: 16 * hk, tilt: 0.1 * hk, mouth: 'shut' };
  const j = shake(t, 9 * hk, 34, 5), cam = { x: 572 + j[0] / 1.86, y: 984 + j[1] / 1.86, zoom: 1.86 + 0.04 * lt, rot: 0 };
  const H = couchDraw(t, { cam, A, D: Dg });
  const P = toScreen(cam, H.head[0], H.head[1]);
  bdBurst('HONK!', P[0] + 300, P[1] - 250, 150, inv(c.honk, c.honk + 0.08, t) * (1 - ramp(t, c.honk_end + 0.08, c.honk_end + 0.2)), '#FFD447', 0.1, '#FF5A6E');
  if (hk > 0.1) shockLines(P[0], P[1] + 50, 170, ((t - c.honk) * 3.2) % 1, 9, '#FFFFFF', 3);
  return { glow: 0.85, flash: 0.22 * (1 - ramp(lt, 0, 0.1)) + 0.1 * bumpAt(t, c.honk, 10) };
};

// ---- the rest goes down his face ... where everyone can see it
const PEEPS = [[206, 560, 1.15], [290, 672, 0.95], [606, 862, 1.2], [872, 800, 1.1], [300, 1452, 1.0], [840, 1466, 0.9]];
SC.spill = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, T0 = shot.start;
  const wide = ramp(t, c.face2_end - 0.05, c.where + 0.3, E.inOutCubic);
  const cam = camKeys(lt, [[0, 444, 1040, 2.2], [c.face2_end - T0 - 0.05, 448, 1042, 2.34], [c.where - T0 + 0.32, 540, 1004, 1.24], [D, 540, 1000, 1.3]]);
  const seen = ramp(t, c.spot, c.spot + 0.12);
  const dart = seen * Math.sin((t - c.spot) * 9);
  const A = {
    face: lerpFace({ ...CRYFACE.wail, mouthOpen: 0.5 + 0.2 * Math.sin(t * 12) }, { ...CRYFACE.sniff, lookX: dart, lookY: -0.1, eyeOpen: 1.3, pupil: 0.8, blink: 0, mouth: 'grimace' }, seen),
    tub: TUB, spoonInTub: true, handR: [58, -52], bendR: 1,
    cry: { well: 1, run: 1, pour: 1, jets: 0.5 * (1 - seen), reach: 0.8 }, tubFull: ramp(lt, 0.25, 1.3),
    headDY: -3 * (1 - seen) * Math.abs(Math.sin(t * 7.5)), headRot: 0.025 * (1 - seen) * Math.sin(t * 7.5), bob: 2 * (1 - seen) * Math.sin(t * 15),
    lamp: SOS_LAMP(t), ambient: 0.1,
  };
  const Dg = { look: [-1, -0.1], ears: 0.5 * seen, wide: 0.6 + 0.4 * seen, tilt: 0.12 * seen, mouth: 'shut' };
  const order = [0, 3, 2, 1, 5, 4], times = [c.where, c.everyone, c.everyone + 0.2, c.everyone + 0.4, c.can, c.see];
  const H = couchDraw(t, { cam, A, D: Dg, lamp: 1 - 0.72 * seen, tv: 1 - 0.5 * seen,
    behind: () => { for (let i = 0; i < 4; i++) { const P = PEEPS[order[i]]; if (P[1] < 900 && order[i] !== 2) peepEyes(P[0], P[1], P[2], 430, 930, ramp(t, times[i], times[i] + 0.14), t, order[i]); } },
  });
  applyCam(cam);
  // the one that peeps over the back of the couch, and the two on the floor
  order.forEach((pi, i) => { const P = PEEPS[pi]; if (P[1] >= 900 || pi === 2) peepEyes(P[0], P[1], P[2], 430, 930, ramp(t, times[i], times[i] + 0.14), t, pi); });
  // the spotlight: everything but him goes dark
  if (seen > 0.01) {
    const P = toScreen(cam, H.head[0], H.head[1] + 110);
    screenSpace();
    const g = ctx.createRadialGradient(P[0], P[1], 150 * cam.zoom, P[0], P[1], 520 * cam.zoom);
    g.addColorStop(0, 'rgba(2,3,14,0)'); g.addColorStop(1, `rgba(2,3,14,${0.62 * seen})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const tp = toScreen(cam, 430, 250), w0 = 40 * cam.zoom, w1 = 250 * cam.zoom, by = P[1] + 330 * cam.zoom;
    const cg = ctx.createLinearGradient(0, tp[1], 0, by); cg.addColorStop(0, `rgba(255,244,214,${0.13 * seen})`); cg.addColorStop(1, `rgba(255,244,214,${0.02 * seen})`);
    ctx.fillStyle = cg; ctx.beginPath(); ctx.moveTo(tp[0] - w0, tp[1]); ctx.lineTo(tp[0] + w0, tp[1]); ctx.lineTo(P[0] + w1, by); ctx.lineTo(P[0] - w1, by); ctx.closePath(); ctx.fill();
    ctx.restore();
    softDot(gctx, P[0], P[1] - 60 * cam.zoom, 300 * cam.zoom, '#FFE9B8', 0.07 * seen);
  }
  return { glow: 0.85, flash: 0.2 * (1 - ramp(lt, 0, 0.1)) + 0.16 * bumpAt(t, c.spot, 12) + 0.85 * ramp(t, c.shutter, c.shutter + 0.05) * (1 - ramp(t, c.shutter + 0.05, shot.end + 0.02)) };
};

// ================================================================ the proof: the same face, with the tears taken off
function boardBg(t) {
  darkBg('#16285A', '#040818');
  screenSpace();
  for (let i = 0; i < 7; i++) softDot(ctx, (i * 211 + 80) % W, 260 + ((i * 337) % 1300), 240, i % 2 ? '#3A5FC0' : '#6A4AB8', 0.07);
}
SC.photo = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, T0 = shot.start;
  boardBg(t);
  screenSpace();
  // close on the photo while the eraser works; then it steps back and the two dials come up under it
  const back = ramp(t, c.photo_end - 0.16, c.photo_end + 0.42, E.inOutCubic);
  const card = { x: 540, y: lerp(872, 690, back), s: lerp(1.48, 0.82, back) * (1 + 0.012 * lt / D), rot: -0.035 };
  // the two rubs
  const r1 = ramp(t, c.erase - 0.02, c.erase + 0.34, (x) => x), r2 = ramp(t, c.tears - 0.02, c.tears + 0.34, (x) => x);
  const tl = 1 - ramp(t, c.erase + 0.04, c.erase + 0.3), tr = 1 - ramp(t, c.tears + 0.04, c.tears + 0.3);
  bdCard(t, { ...card, k: ramp(lt, 0, 0.26), tl, tr, flip: ramp(t, c.photo - 0.05, c.photo + 0.2), face: CRYFACE.sad });
  // the eraser: in at the pause, over one cheek, over the other, away
  const ek = ramp(t, c.snap - 0.05, c.snap + 0.15, E.outBack) * (1 - ramp(t, c.photo + 0.1, c.photo + 0.3));
  if (ek > 0.01) {
    const pL = bdFacePt(-27, 40, card), pR = bdFacePt(27, 40, card), rest = [card.x + 300, card.y - 180];
    let p = rest;
    p = lerp2(p, pL, ramp(t, c.erase - 0.22, c.erase, E.inOutCubic));
    p = lerp2(p, pR, ramp(t, c.erase + 0.34, c.tears, E.inOutCubic));
    p = lerp2(p, [card.x + 420, card.y - 420], ramp(t, c.photo - 0.05, c.photo + 0.25, E.inCubic));
    const rub = (r1 > 0 && r1 < 1 ? Math.sin(r1 * Math.PI * 6) : 0) + (r2 > 0 && r2 < 1 ? Math.sin(r2 * Math.PI * 6) : 0);
    bdEraser(p[0] + 6 * rub, p[1] + 46 * rub + 14, 0.5 + 0.12 * rub, ek * 1.45);
    bdCrumbs(pL[0], pL[1] + 40, c.erase + 0.05, t, 1); bdCrumbs(pR[0], pR[1] + 40, c.tears + 0.05, t, 4);
  }
  // the dials: what people made of it. LOOKS SAD: 5.29 with the tears, 4.05 without (a scale of 1 to 7)
  const d1 = ramp(t, c.less1 - 0.05, c.sadness + 0.45, E.inOutCubic), sad = lerp(5.29, 4.05, d1);
  const d2 = ramp(t, c.less2 - 0.05, c.helping + 0.3, E.inOutCubic);
  const wob = (d) => (d > 0 && d < 1 ? 0.012 * Math.sin(t * 31) * (1 - Math.abs(2 * d - 1)) : 0);
  bdDial(272, 1166, 146, (sad - 1) / 6 + wob(d1), ramp(t, c.photo_end + 0.3, c.photo_end + 0.56), { title: 'LOOKS SAD', val: sad.toFixed(2), sub: 'on a scale of 1 to 7', col: '#8FB8FF', ticks: ['1', '', '', '4', '', '', '7'], ghost: d1 > 0 ? (5.29 - 1) / 6 : undefined, drop: d1 > 0 && d1 < 1 ? 1 : 0 });
  bdDial(700, 1166, 146, lerp(0.74, 0.52, d2) + wob(d2), ramp(t, c.photo_end + 0.42, c.photo_end + 0.68), { title: 'WANT TO HELP', sub: '41 countries', col: '#4DFFB4', ticks: ['less', '', 'more'], ghost: d2 > 0 ? 0.74 : undefined, drop: 0 });
  // a sparkle where the tears were
  const sp = bumpAt(t, c.photo, 4.5);
  if (sp > 0.03 && t >= c.photo) for (const [hx, hy] of [[-34, 30], [36, 44]]) { const P = bdFacePt(hx, hy, card); paint(() => { ctx.save(); ctx.translate(P[0], P[1]); ctx.rotate(t * 2); ctx.fillStyle = `rgba(255,255,255,${sp})`; ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? 8 : 36; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); ctx.restore(); }); }
  return { glow: 0.85, capY: 1410, flash: 0.5 * (1 - ramp(lt, 0, 0.16)) };
};

// ================================================================ the only animal: a tear check on everyone in the room
const ELLY_AT = { x: 606, y: 668, s: 0.82 };
SC.only = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, T0 = shot.start;
  const cam = camKeys(lt, [[0, 548, 1000, 1.52], [0.55, 548, 978, 1.2], [D, 548, 972, 1.27]]);
  const rise = ramp(lt, 0.02, 0.5, E.outBack);
  const onHim = ramp(t, c.cries2 - 0.1, c.cries2 + 0.05), give = ramp(t, c.trunk, c.trunk + 0.3, E.outCubic);
  const A = {
    face: lerpFace({ ...CRYFACE.wail, mouthOpen: 0.5 + 0.2 * Math.sin(t * 12) }, { ...CRYFACE.sniff, lookX: 0.4, lookY: -1, eyeOpen: 1.2, blink: 0, mouth: 'wavy' }, give),
    tub: TUB, spoonInTub: true, handR: [58, -52], bendR: 1,
    cry: { well: 1, run: 1, pour: 0.6, jets: 0.8 * (1 - 0.5 * give), reach: 0.9 },
    headDY: -3 * Math.abs(Math.sin(t * 7.5)) * (1 - give), headRot: 0.025 * Math.sin(t * 7.5) * (1 - give), bob: 2 * Math.sin(t * 15) * (1 - give), lamp: SOS_LAMP(t),
  };
  const Dg = { look: t < c.youre ? [-0.2, -1] : t < c.cries2 ? [0, 0.1] : [-1, -0.1], ears: 0.6 * (1 - ramp(lt, 0.5, 1.0)), wide: t < c.youre ? 0.9 : 0.3, blink: pulseOf(t, [c.only + 0.2], 0.12) > 0.5 ? 1 : 0, mouth: 'shut', wet: 0.5 };
  const tipA = [150, 262], tipB = [-150, 120];
  const tip = lerp2(tipA, tipB, give), chewing = 1 - give;
  let tipW = null;
  const H = couchDraw(t, { cam, A, D: Dg, behind: () => {
    actor(() => { tipW = ellyDraw(ctx, ELLY_AT.x, ELLY_AT.y, ELLY_AT.s, t, { rise, look: t < c.youre - 0.1 ? [0, 0.3] : t < c.cries2 - 0.1 ? [0.2, 0.1] : [-0.8, 0.7], blink: pulseOf(t, [c.youre + 0.25], 0.12) > 0.5 ? 1 : 0, chew: chewing, trunk: [tip[0], tip[1] + 6 * Math.sin(t * 9) * chewing] }); });
    if (rise > 0.9) { if (give > 0.02) tissueWad(ctx, tipW[0] - 6, tipW[1] + 18, 22, 3); else popPiece(ctx, tipW[0], tipW[1] + 16, 13, t); }
  } });
  applyCam(cam);
  popTub(ctx, 792, 880 - 138 * 0.5, 0.5, 0.04);          // its popcorn, on the back of the couch
  // the check: the elephant, the dog, him
  const eE = toScreen(cam, ELLY_AT.x + 98 * ELLY_AT.s, ELLY_AT.y + 26 * ELLY_AT.s), eD = toScreen(cam, ...pupPt(SOFA.dogX, SOFA.dogY, 0.92, Dg, 32, -14)), eH = toScreen(cam, H.eyeR[0], H.eyeR[1]);
  let sp = [540, 300], lock = 0, col = '#7FE9FF';
  const hop = (from, to, t0) => lerp2(from, to, ramp(t, t0 - 0.22, t0, E.inOutCubic));
  sp = hop([760, 330], eE, c.youre); sp = hop(sp, eD, c.only); sp = hop(sp, eH, c.cries2);
  lock = t < c.only - 0.22 ? ramp(t, c.youre, c.youre + 0.12) : t < c.cries2 - 0.22 ? ramp(t, c.only, c.only + 0.12) : ramp(t, c.cries2, c.cries2 + 0.12);
  if (t >= c.cries2) col = '#FF5A6E';
  const sk = ramp(lt, 0.5, 0.7) * (1 - ramp(t, c.feelings2_end, c.feelings2_end + 0.15));
  if (sk > 0.01) { ctx.globalAlpha = sk; tearScope(sp[0], sp[1], 74, lock, col, t); ctx.globalAlpha = 1; }
  verdictPill(eE[0] - 40, eE[1] - 150, 'DRY', true, ramp(t, c.youre + 0.14, c.youre + 0.32), 52);
  verdictPill(eD[0] - 150, eD[1] + 150, 'DRY', true, ramp(t, c.only + 0.14, c.only + 0.32), 52);
  bdBurst('SOAKED', eH[0] - 96, eH[1] - 300, 90, inv(c.cries2 + 0.12, c.cries2 + 0.2, t) * (1 - ramp(t, c.trunk + 0.3, c.trunk + 0.45)), '#FF5A6E', -0.1, '#FFFFFF');
  return { glow: 0.85, flash: 0.22 * (1 - ramp(lt, 0, 0.12)) };
};

// ================================================================ the button: backup shows up, and the loop
const CAM_END = { x: 585, y: 1006, zoom: 1.8 };
function helpA(t) {
  const c = cu(), D = TLd.duration, tt = t - D;
  const come = ramp(t, c.whine, c.backup2 + 0.1, E.inOutCubic), away = ramp(t, c.lick_end + 0.05, c.lick_end + 0.4, E.inOutCubic);
  const lickHim = ramp(t, c.shows - 0.05, c.shows + 0.1) * (1 - ramp(t, c.up_end + 0.05, c.up_end + 0.2));
  const lickSp = ramp(t, c.lick - 0.08, c.lick + 0.06) * (1 - ramp(t, c.lick_end - 0.08, c.lick_end + 0.04));
  const calm = ramp(t, c.backup2, c.up_end);                              // he feels better
  const robbed = ramp(t, c.lick + 0.1, c.lick + 0.25) * (1 - ramp(t, c.dig - 0.05, c.dig + 0.15));
  const again = ramp(t, c.dig + 0.2, D - 0.05, E.inOutSine);              // ... and the film gets him again
  // ---- the spoon: held out with a scoop on it; the dog cleans it; down into the tub; up to his lips = frame 1
  const K = [
    [0, TIP_REST, ANG_TUB + 0.5, 1, 0], [c.good - 0.1, TIP_REST, ANG_TUB + 0.5, 1, 0], [c.cry, TIP_MOUTH, ANG_MOUTH, 1, 0.92], [c.seems, TIP_MOUTH, ANG_MOUTH, 1, 0.92],
    [c.help, [30, -228], ANG_MOUTH - 0.1, 0, 0], [c.most + 0.1, TIP_TUB, ANG_TUB, 0, 0], [c.most_end, [-18, -176], ANG_TUB + 0.1, 1, 0], [c.when, TIP_REST, ANG_TUB + 0.5, 1, 0],
    [c.lick, TIP_REST, ANG_TUB + 0.5, 1, 0], [c.lick + 0.16, TIP_REST, ANG_TUB + 0.5, 0, 0],
    [c.dig, TIP_REST, ANG_TUB + 0.5, 0, 0], [c.dig + 0.34, TIP_TUB, ANG_TUB, 0, 0], [c.dig + 0.62, [-18, -176], ANG_TUB + 0.1, 1, 0], [D, TIP_LIPS, ANG_MOUTH, 1, 0],
  ];
  let i = 1; while (i < K.length - 1 && t > K[i][0]) i++;
  const a = K[i - 1], b = K[i], u = E.inOutCubic(inv(a[0], b[0], t));
  const tip = lerp2(a[1], b[1], u), ang = lerp(a[2], b[2], u), scoop = lerp(a[3], b[3], u), hide = lerp(a[4], b[4], u);
  const bite = ramp(t, c.cry - 0.14, c.cry) * (1 - ramp(t, c.seems + 0.05, c.help));
  // ---- his face
  let face = { ...CRYFACE.sniff, lookX: 0.2, mouth: 'wavy', blink: 0.15 + 0.85 * (Math.sin(t * 3.1) > 0.93 ? 1 : 0) };
  face = lerpFace(face, { ...CRYFACE.sniff, mouth: 'o', mouthOpen: 0.2 + 0.2 * Math.abs(Math.sin(t * 12)), blink: 1, browY: 1.3 }, bite);
  face = lerpFace(face, { ...CRYFACE.better, blink: lickHim > 0.5 ? 1 : 0.1 }, calm);
  face = lerpFace(face, CRYFACE.robbed, robbed);
  face = lerpFace(face, { ...FACES.annoyed, lookX: 1, lookY: -0.1, browTilt: -0.9, blink: 0.34 }, ramp(t, c.some - 0.1, c.some + 0.1) * (1 - ramp(t, c.dig, c.dig + 0.2)));
  face = lerpFace(face, { ...CRYFACE.chew, lookX: -0.2, lookY: 1 }, ramp(t, c.dig, c.dig + 0.2) * (1 - again));
  face = lerpFace(face, CRYFACE.bite, again);
  const dry = ramp(t, c.shows, c.up_end + 0.3);                           // the dog licks his face dry
  const cry = { well: lerp(lerp(0.9, 0.2, dry), 0.55, again), run: 1 - dry, pour: 0, jets: 0.3 * (1 - ramp(t, c.most, c.most_end)), reach: 0.7, bead: tt > -0.4245 ? 0.45 + 1.06 * tt : -1 };
  const ok = ramp(t, c.ding, c.ding + 0.1), lampOut = ramp(t, c.ding + 0.35, c.ding + 0.6, E.inCubic);
  const A = {
    face, tub: TUB, handR: wristFor(tip, ang), spoon: { tip, scoop, hide }, dent: 1, cry,
    headDY: 2 * lickHim * Math.sin(t * 30) + 2.4 * bite * Math.sin(t * 11), bob: 2 * (1 - calm) * Math.sin(t * 13) * ramp(t, c.good - 0.2, c.good) * (1 - ramp(t, c.most, c.most_end)),
    headDX: 0, headRot: 0.07 * calm * (1 - ramp(t, c.lick - 0.1, c.lick + 0.1)) + 0.02 * lickHim * Math.sin(t * 14),
    lamp: { k: 1 - lampOut, col: ok > 0.5 ? '#3DFFA0' : '#FF4055', lit: ok > 0.5 ? 1 - 0.4 * lampOut : 0.3 + 0.7 * (Math.sin(t * 21) > -0.2 ? 1 : 0), beams: 0.7 * (1 - ok) },
  };
  // ---- the dog: over to him, a paw on his arm, a lick up his cheek; then the spoon; then back to his place, pleased
  const near = come * (1 - away);
  const Dg = {
    dx: -84 * near, tilt: -0.26 * near * (1 - lickSp) - 0.12 * lickSp + 0.13 * Math.sin(t * 2.6) * (1 - come) * (1 - ramp(t, c.dig, c.dig + 0.3)) * ramp(t, c.and_a, c.and_a + 0.4), paw: near * (1 - lickSp), pawX: -30, pawY: -20,
    headDY: -30 * near * (1 - lickSp) + 16 * lickSp - 5 * lickHim * Math.abs(Math.sin(t * 14)),
    look: away > 0.5 ? (t < c.dig + 0.3 ? [-0.9, 0] : [0, 0.2]) : [-1, -0.3 + 0.9 * lickSp],
    ears: 0.6 * ramp(t, c.most, c.whine) * (1 - come), wide: 0.4 * ramp(t, c.most, c.whine) * (1 - come),
    blink: lickHim > 0.4 ? 1 : 0,
    mouth: lickHim > 0.3 || lickSp > 0.3 ? 'lick' : (away > 0.3 && t < c.dig + 0.15 ? 'lick' : 'shut'),
    lickX: lickSp > 0.3 ? -92 : (lickHim > 0.3 ? -66 : 26), lickY: lickSp > 0.3 ? 34 : (lickHim > 0.3 ? 30 - 22 * Math.abs(Math.sin(t * 14)) : 34 + 6 * Math.sin(t * 16)),
    wag: come * (1 - ramp(t, c.dig, c.dig + 0.4)), smug: ramp(t, c.lick_end + 0.2, c.lick_end + 0.4) * (1 - ramp(t, c.dig + 0.2, c.dig + 0.5)),
  };
  return { A, D: Dg, dogX: SOFA.dogX - 100 * near, near, calm, ok, heart: ramp(t, c.up - 0.05, c.up + 0.15, E.outBack) * (1 - ramp(t, c.lick - 0.15, c.lick)) };
}
SC.help = (lt, t, shot) => {
  const c = cu(), D = TLd.duration, S = helpA(t);
  const k = camKeys(t, [[shot.start, 572, 990, 1.66], [c.backup2 + 0.2, CAM_END.x, CAM_END.y, CAM_END.zoom], [c.loop, CAM_END.x + 2, CAM_END.y, CAM_END.zoom + 0.03], [D, CAM_TIGHT0.x, CAM_TIGHT0.y, CAM_TIGHT0.zoom]]);
  // (the dog is in front of him only while it leans across; back in its place it is part of the set again, as on frame 1)
  const H = couchDraw(t, { cam: k, A: S.A, D: S.D, dogX: S.dogX, dogFront: S.near > 0.002 });
  if (S.heart > 0.01) { const P = toScreen(k, 560, 880); heartIcon(P[0], P[1] - 30 * S.heart, 1.5 * S.heart, 1); }
  return { glow: 0.85, capY: lerp(1330, 1420, ramp(t, c.loop, D)), flash: 0.2 * (1 - ramp(lt, 0, 0.1)) + 0.1 * bumpAt(t, c.ding, 9) };
};

// ================================================================ the cover (rendered by src/cover.sh from a one-shot timeline)
SC.cover = (lt, t) => {
  const cam = { x: 430, y: HEADY + 96, zoom: 3.2, rot: 0 };
  const A = { face: { ...CRYFACE.wail, mouthOpen: 0.8 }, tub: TUB, handR: wristFor(TIP_REST, ANG_TUB + 0.5), spoon: { tip: TIP_REST, scoop: 1, hide: 0 }, cry: { well: 1, run: 1, pour: 0.7, jets: 1, reach: 0.9, seed: 0.3 }, headDY: -4 };
  couchDraw(0.4, { cam, A, D: null });
  screenSpace();
  bigWord('WHY DO WE', 540, 1228, 150, '#FFFFFF', 1, -0.03);
  bigWord('CRY?', 540, 1400, 236, '#7FE9FF', 1, -0.03);
  return { glow: 0.85, noCaptions: true };
};

function initScenes2() {
  initSofa();
}
