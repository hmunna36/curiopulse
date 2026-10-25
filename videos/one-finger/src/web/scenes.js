// Why Can't You Raise Just ONE Finger? ☝️ Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
// Worlds: trail.js (sky-blue's mountain trail), fist3d.js (his hand in 3D), robin.js (the robin, tags, bursts),
// parlour.js (ring-finger's 1880s parlour, used here for the 1830s), piano.js (the keyboard, the gadget, the piano, the
// museum).
'use strict';

const cu = () => TLd.cues;

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
setLights({
  hook: LIGHTS.day, inside: LIGHTS.day, practice: LIGHTS.day, button: LIGHTS.day, loop: LIGHTS.day, cover: LIGHTS.day,
  parlour: { ...LIGHTS.candle }, keys: { ...LIGHTS.candle }, lid: { ...LIGHTS.candle },
  museum: { ...LIGHTS.night, rimFrom: [0.0, -1.0], rim: [1.0, 0.86, 0.62] },
});

const OF_F = 3300;                               // the 3D camera's focal length (px per cm at 1 cm)
const OF_HEAD = [TR.hx, TR.hy - 470 * TR.hs];    // the middle of his head on the trail (world)

// ---------------------------------------------------------------- the trail behind him, and him
// the background with its own (slower) camera: far things move less than he does
function ofBack(cam, t, o = {}) {
  const pz = o.par === undefined ? 0.35 : o.par;
  const bc = { x: lerp(TR.hx + 40, cam.x, pz) + (o.panX || 0), y: lerp(1120, cam.y, pz) + (o.panY || 0), zoom: 1 + (cam.zoom - 1) * pz, rot: cam.rot || 0 };
  trSky(bc, t, {});
  trSun(bc, t, { rays: 0.5 });
  trClouds(bc, t, {});
  trRidges(bc, t, {});
  if (o.ledge) trLedge(bc, t, {});
}
// him from a description: A = {face, hide: 'L' | 'R' (the arm that is drawn in 3D instead), armR (the free arm's lift),
// lean, hdx, hdy, hrot, dx, dy}
function ofHero(cam, t, A = {}) {
  const pose = JSON.parse(JSON.stringify(POSES.stand));
  pose.lean = A.lean || 0;
  pose.armL = { a: 0.18, b: 0.1 };
  pose.armR = { a: 0.18 + (A.armR || 0), b: 0.1 + (A.armRb || 0) };
  const st = { x: TR.hx + (A.dx || 0), y: TR.hy + (A.dy || 0), s: TR.hs, pose, face: A.face || FACES.calm, hideArm: A.hide || 'L',
    headDX: A.hdx || 0, headDY: A.hdy || 0, headRot: A.hrot || 0, blink: 0 };
  return charLayer(cam, st, t, { pal: PAL });
}
// a blink on a loop-safe clock (0 most of the time, 1 for ~0.12 s)
function ofBlink(t, w = 0.55, ph = 0) { const u = ((t * loopW(w) / (Math.PI * 2) + ph) % 1 + 1) % 1; return u < 0.035 ? Math.sin(u / 0.035 * Math.PI) : 0; }

// ---------------------------------------------------------------- the hook as a state (valid at negative time: the loop)
// everything at time tt (video seconds; tt < 0 = the last frames of the Short, which must be frame 0)
let OF_YAW = -0.52;
function hookA(tt) {
  const c = cu();
  const A = {};
  // his fist: a ready squeeze that tightens on "fist", the middle finger up on "MIDDLE", the ring finger creeping after
  const bob = Math.sin(tt * loopW(2.6)) * 0.5 + 0.5;
  A.squeeze = 0.3 + 0.12 * bob + 0.55 * ramp(tt, c.fist - 0.08, c.fist + 0.22, E.outBack) * (1 - ramp(tt, c.middle - 0.3, c.middle, E.inOutSine));
  A.liftM = clamp(ramp(tt, c.lift_m, c.lift_m + 0.42, E.outBack));
  const crp = ramp(tt, c.creep, c.creep + 0.5, E.outCubic) + 0.07 * Math.sin((tt - c.creep) * 9) * ramp(tt, c.creep, c.creep + 0.3) * (1 - ramp(tt, c.too, c.too + 0.6));
  A.liftR = 0.58 * crp; A.creepR = 0.2 * crp;
  A.creepL = 0.22 * ramp(tt, c.creep + 0.12, c.creep + 0.55, E.outCubic);
  A.tremR = ramp(tt, c.creep, c.creep + 0.25) * (1 - 0.6 * ramp(tt, c.cuffs, c.click));
  A.thumb = 0;
  // the 3D camera: close on the fist at frame 0, out a little as the finger rises, in on the ring finger, then wider for
  // the handcuffs
  A.V = fkKeys(tt, [
    [-1, -0.46, 0.1, 0.3, 6.6, 0.8, 50, 610, 1080, -0.08],
    [0, -0.46, 0.1, 0.3, 6.6, 0.8, 50, 610, 1080, -0.08],
    [c.fist + 0.5, -0.42, 0.12, 0.3, 6.8, 0.8, 47, 612, 1090, -0.08],
    [c.middle + 0.1, -0.4, 0.14, 0.3, 9.0, 0.8, 62, 600, 1110, -0.1],
    [c.ring + 0.1, -0.4, 0.14, 0.3, 9.0, 0.8, 62, 600, 1110, -0.1],
    [c.too, -0.55, 0.2, -0.9, 9.6, 1.2, 40, 580, 980, -0.06],
    [c.theyre, -0.55, 0.2, -0.9, 9.6, 1.2, 38, 580, 980, -0.06],
    [c.cuffs - 0.25, 0.16, 0.2, 0.0, 10.4, 1.2, 31, 560, 900, -0.03],
    [c.click + 0.5, 0.16, 0.2, 0.0, 10.4, 1.2, 29.5, 560, 890, -0.03],
  ], OF_F);
  A.V.yaw += OF_YAW + 0.46;
  // the 2D camera on him (his head), pushing in with the 3D camera
  const push = ramp(tt, c.ring, c.too, E.inOutCubic) - 0.5 * ramp(tt, c.cuffs - 0.3, c.cuffs + 0.3, E.inOutCubic);
  A.cam = { x: 545 + 30 * push, y: 1318 - 20 * push, zoom: 2.95 + 0.25 * ramp(tt, 0, c.middle, E.inOutSine) * 0 + 0.45 * push, rot: 0 };
  // his face: pleased with his fist, an effort on "fist", proud on "MIDDLE", then the ring finger: brows up
  const look = { lookX: 0.75, lookY: 0.65 };
  let f = { ...FACES.grin, ...look, mouthOpen: 0.55 };
  f = lerpFace(f, { ...FACES.nervous, ...look, mouth: 'grimace' }, ramp(tt, c.fist - 0.1, c.fist + 0.15) * (1 - ramp(tt, c.can, c.can + 0.25)));
  f = lerpFace(f, { ...FACES.grin, ...look, lookY: 0.2, mouthOpen: 1 }, ramp(tt, c.middle, c.middle + 0.2));
  f = lerpFace(f, { ...FACES.worried, lookX: 0.4, lookY: 0.95, mouth: 'o', mouthOpen: 0.5, browY: 1.1 }, ramp(tt, c.ring + 0.15, c.ring + 0.45));
  f = lerpFace(f, { ...FACES.annoyed, lookX: 0.5, lookY: 0.9, mouth: 'flat' }, ramp(tt, c.theyre, c.theyre + 0.3));
  f.blink = Math.max(f.blink || 0, ofBlink(tt, 0.5, 0.3));
  A.face = f;
  A.hdx = 3 * Math.sin(tt * loopW(1.3));
  A.hrot = 0.04 * Math.sin(tt * loopW(0.9)) + 0.06 * ramp(tt, c.ring, c.ring + 0.4) - 0.06 * ramp(tt, c.theyre, c.theyre + 0.4);
  // the robin: flies in to the fingertip, lands on "one.", looks at the ring finger, at us, hops at the click
  A.birdIn = ramp(tt, c.land - 0.55, c.land, E.outCubic);
  A.birdOn = tt >= c.land;
  A.cuffK = ramp(tt, c.cuffs - 0.05, c.click - 0.05, E.outCubic);
  A.lock = ramp(tt, c.click - 0.08, c.click);
  return A;
}

// the hand of the hook (or its mirror image for the left hand) drawn from a state A at time t. o: {mirror, glass, inside,
// bird: fn(pr, G) -> extra drawing, cuffs: {k, lock}}
function ofHookHand(A, t, o = {}) {
  const G = fkGeo({ lift: { M: A.liftM || 0, R: A.liftR || 0 }, creep: { R: A.creepR || 0, L: A.creepL || 0, M: A.creepM || 0 },
    squeeze: A.squeeze || 0, tremble: { R: A.tremR || 0, M: A.tremM || 0 }, thumb: A.thumb || 0, t });
  const V = Object.assign({}, A.V, { mirror: !!o.mirror });
  const pr = fkCam(V);
  screenSpace();
  const items = [];
  if ((A.cuffK || 0) > 0.01) items.push(...fkCuffItems(ctx, pr, G, 'M', 'R', { k: A.cuffK, ua: 0.4, ub: 0.42, from: [420, -260], taut: A.taut }));
  actor(() => fkDraw(ctx, pr, G, { items }));
  return { G, pr, V };
}

// the robin on (or flying to) a fingertip
function ofBirdAt(pr, G, k, t, o = {}) {
  const tip = pr(fkTip(G, k, -(o.down === undefined ? 1.35 : o.down))), s = tip[2] * (o.size || 0.052);
  const inK = o.inK === undefined ? 1 : o.inK;
  if (inK <= 0.001) return null;
  const from = o.from || [1180, 250];
  const u = E.outCubic(inK), x = lerp(from[0], tip[0], u), y = lerp(from[1], tip[1], u) - Math.sin(Math.PI * u) * 120 * (1 - u);
  const flying = inK < 0.999;
  ofBird(ctx, x, y, s, Object.assign({ t, flap: flying ? 1 : (o.flap || 0), perch: flying ? 0.2 : 1, facing: o.facing || -1 }, o.bird || {}));
  return [x, y, s];
}

// ---------------------------------------------------------------- shots
SC.hook = (lt, t, shot) => {
  const c = cu(), A = hookA(t);
  screenSpace();
  ofBack(A.cam, t);
  ofHero(A.cam, t, { face: A.face, hide: 'L', hdx: A.hdx, hrot: A.hrot });
  const H = ofHookHand(A, t);
  // the ring finger highlighted while she asks about it
  const rk = popK(t, c.ring - 0.05, c.theyre + 0.2, 0.15, 0.15);
  if (rk > 0.01) {
    const q = H.pr(fkSegPt(H.G, 'R', 0, 0.85, 'front', 1.0)), r = q[2] * 2.2 * E.outBack(rk, 2);
    paint(() => {
      ctx.save(); ctx.setLineDash([18, 12]); ctx.lineDashOffset = -t * 60; ctx.lineWidth = 8; ctx.strokeStyle = rgba('#FFD447', rk);
      ctx.beginPath(); ctx.arc(q[0], q[1], r, 0, 7); ctx.stroke(); ctx.restore();
    });
    softDot(gctx, q[0], q[1], r * 0.5, '#FFD447', 0.07 * rk);
  }
  // the robin
  const look = ramp(t, c.ring, c.ring + 0.3) * (1 - ramp(t, c.theyre, c.theyre + 0.2));
  const mood = t >= c.theyre ? 'judge' : t >= c.ring ? 'curious' : 'calm';
  const hop = ramp(t, c.click, c.click + 0.12) * (1 - ramp(t, c.click + 0.12, c.click + 0.4));
  ofBirdAt(H.pr, H.G, 'M', t, { inK: A.birdIn, bird: { look: 0.9 * look - 0.3 * ramp(t, c.theyre, c.theyre + 0.2), tilt: -0.25 * look + 0.15 * ramp(t, c.theyre, c.theyre + 0.25),
    mood, facing: t >= c.theyre ? 1 : -1, blink: ofBlink(t, 0.8, 0.6), squash: 0.6 * popK(t, c.land, c.land + 0.25, 0.04, 0.2) - 0.5 * hop, flap: hop } });
  // the click: sparks on the cuffs
  if (A.cuffK > 0.01) {
    const q = H.pr(fkSegPt(H.G, 'M', 0, 0.5, 'front', 1.3)), q2 = H.pr(fkSegPt(H.G, 'R', 0, 0.52, 'front', 1.3));
    const sk = popK(t, c.click, c.click + 0.35, 0.03, 0.2);
    ofSpark(q[0] + 30, q[1] - 30, 46, '#FFFFFF', sk); ofSpark(q2[0] - 20, q2[1] + 10, 34, '#BFF0FF', sk);
  }
  return { glow: 0.8, zblur: 0.025 * popK(t, c.click, c.click + 0.12, 0.02, 0.1) };
};

SC.loop = (lt, t, shot) => {
  const A = hookA(t - TLd.duration);
  screenSpace();
  ofBack(A.cam, t);
  ofHero(A.cam, t, { face: A.face, hide: 'L', hdx: A.hdx, hrot: A.hrot });
  ofHookHand(A, t);
  return { glow: 0.8 };
};

// ---------------------------------------------------------------- the palm view (practice, the button): a state like hookA's
function ofPalmDraw(t, A, o = {}) {
  screenSpace();
  ofBack(A.cam, t);
  ofHero(A.cam, t, { face: A.face, hide: o.mirror ? 'R' : 'L', hdx: A.hdx, hrot: A.hrot, dx: A.heroDx || 0 });
  return ofHookHand(A, t, { mirror: !!o.mirror });
}

// ---------------------------------------------------------------- inside: the ring finger tries, the camera goes round to
// his side, the skin turns to glass, the cords and the cuffs between them
function insideA(t) {
  const c = cu(), A = {};
  const drop = ramp(t, c.drop_m, c.drop_m + 0.32, E.inOutCubic);
  const tryR = ramp(t, c.try_r, c.try_r + 0.45, E.outCubic);
  const pull1 = ramp(t, c.cuffed - 0.12, c.cuffed + 0.25) * (1 - ramp(t, c.on, c.on + 0.25));
  const pull2 = ramp(t, c.both - 0.05, c.both + 0.3);
  const pull = Math.max(pull1, pull2);
  A.drop = drop; A.tryR = tryR; A.pull = pull;
  A.liftM = 1 - drop;
  A.liftR = 0.58 * (1 - drop) + (0.4 * tryR * (1 - 0.35 * ramp(t, c.stuck, c.stuck + 0.3)) + 0.22 * pull) * drop;
  A.creepR = 0.2 * (1 - drop);
  A.creepM = (0.62 * tryR + 0.25 * pull) * drop;
  A.creepL = 0.18 * (1 - drop) + (0.6 * tryR + 0.3 * pull) * drop;
  A.tremR = tryR * (0.6 + 0.4 * pull); A.tremM = 0.4 * tryR * drop;
  A.squeeze = 0.35;
  A.V = fkKeys(t, [
    [c.now2 - 0.06, 0.1, 0.2, 0.0, 10.4, 1.2, 29.5, 560, 890, -0.03],
    [c.drop_m + 0.15, -0.75, 0.2, 0.0, 8.2, 0.6, 40, 560, 920, -0.05],
    [c.ring2, -1.85, 0.3, 0.0, 7.6, -0.4, 47, 540, 900, 0],
    [c.finger3_end, -2.86, 0.4, -0.1, 7.3, -0.9, 45, 540, 900, 0],
    [c.stuck + 0.1, -2.86, 0.4, -0.1, 7.3, -0.9, 45, 540, 900, 0],
    [c.its, -2.9, 0.46, -0.3, 7.0, -1.3, 33, 540, 870, 0],
    [c.both, -2.94, 0.48, -0.45, 6.8, -1.4, 31, 540, 870, 0],
    [c.sides_end + 0.6, -2.94, 0.48, -0.45, 6.8, -1.4, 30, 540, 870, 0],
  ], OF_F);
  // the orbit takes him out of the picture: 0 = his face behind the fist .. 1 = we look over his shoulder
  A.orbit = clamp(((A.V.yaw - -0.56) / (-2.86 - -0.56)));
  return A;
}
SC.inside = (lt, t, shot) => {
  const c = cu(), A = insideA(t), u = A.orbit;
  screenSpace();
  // the trail turns behind the hand; he slides out to the left as the camera goes round
  const cam = { x: 545 + 1100 * E.inCubic(clamp(u * 1.6)), y: 1318, zoom: 2.95 - 1.3 * E.inOutSine(u), rot: 0 };
  ofBack(cam, t, { panX: -520 * u, panY: 60 * u });
  if (u < 0.62) ofHero(cam, t, { face: { ...FACES.annoyed, lookX: 0.5, lookY: 0.9, mouth: 'flat' }, hide: 'L' });
  // the hand: skin, then glass, then the cords and cuffs inside
  const G = fkGeo({ lift: { M: A.liftM, R: A.liftR }, creep: { R: A.creepR, M: A.creepM, L: A.creepL }, squeeze: A.squeeze,
    tremble: { R: A.tremR, M: A.tremM }, t });
  const pr = fkCam(A.V);
  const gk = ramp(t, c.glass, c.glass + 0.45, E.inOutSine);
  const outerK = 1 - ramp(t, c.glass + 0.05, c.glass + 0.3, E.inCubic);
  const items = outerK > 0.01 ? fkCuffItems(ctx, pr, G, 'M', 'R', { k: outerK, ua: 0.4, ub: 0.42 }) : [];
  screenSpace();
  actor(() => fkDraw(ctx, pr, G, { items, povArm: u > 0.55 }));
  fkGlass(ctx, pr, G, gk, { noArm: u > 0.55 });
  const mrK = ramp(t, c.glass + 0.12, c.glass + 0.42), rlK = ramp(t, c.click2 - 0.14, c.click2 + 0.06);
  const glowMR = 0.35 * popK(t, c.cuffed - 0.05, c.cuffed + 0.6, 0.1, 0.3), glowRL = 0.45 * popK(t, c.click2, c.click2 + 0.6, 0.05, 0.3);
  fkInside(ctx, gctx, pr, G, { k: gk, t,
    glow: { R: Math.max(A.tryR * 0.6, A.pull), M: A.pull * 0.8, L: A.pull * 0.8 * ramp(t, c.click2, c.click2 + 0.2) },
    slide: { R: -(A.pull + 0.4 * A.tryR) * (t > c.glass ? 1 : 0), M: -0.6 * A.pull, L: -0.6 * A.pull * ramp(t, c.click2, c.click2 + 0.2) },
    cuffs: [{ a: 'R', b: 'M', y: FK_JY.MR, k: mrK, lock: 1, taut: A.pull, glow: glowMR },
      { a: 'R', b: 'L', y: FK_JY.RL, k: rlK, lock: ramp(t, c.click2 - 0.06, c.click2 + 0.02), taut: A.pull * ramp(t, c.click2, c.click2 + 0.2), glow: glowRL }] });
  // a spark on each cuff as it locks
  if (rlK > 0.01) {
    const a = pr(fkCordAt(G, 'R', FK_JY.RL)), b = pr(fkCordAt(G, 'L', FK_JY.RL));
    const sk = popK(t, c.click2, c.click2 + 0.35, 0.03, 0.2);
    ofSpark((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 70, 30, '#FFFFFF', sk);
  }
  // the robin leaves as the middle finger drops (it was on the fingertip)
  const fly = ramp(t, c.drop_m - 0.02, c.drop_m + 0.6, E.inCubic);
  if (fly < 0.999 && u < 0.3) {
    const H0 = pr(fkTip(G, 'M', -1.35));
    ofBird(ctx, lerp(H0[0], 1250, fly), lerp(H0[1], 120, fly) - 160 * Math.sin(Math.PI * fly) * 0.3, H0[2] * 0.052 * (1 - 0.3 * fly), { t, flap: fly > 0.01 ? 1 : 0, facing: 1, mood: 'shock', perch: 1 - fly });
  }
  return { glow: 0.85, blur: [-70 * Math.sin(Math.PI * clamp(u * 1.3)) * (u < 0.77 ? 1 : 0), 0] };
};

// ---------------------------------------------------------------- practice: the coach
function practiceA(t) {
  const c = cu(), A = {};
  const cr = [0.85, 0.5, 0.15];
  let lift = 0, creep = 0;
  c.reps.forEach((r, i) => { const e = ramp(t, r, r + 0.16, E.outCubic) * (1 - ramp(t, r + 0.3, r + 0.5, E.inOutCubic)); lift = Math.max(lift, e); creep = Math.max(creep, cr[i] * e); });
  const fin = clamp(ramp(t, c.practice + 0.02, c.practice + 0.32, E.outBack));
  A.liftM = Math.max(lift, fin); A.creepR = Math.max(creep, 0.02 * fin); A.creepL = 0.3 * creep;
  A.tremR = creep * 0.7; A.squeeze = 0.55 + 0.25 * creep; A.fin = fin;
  A.V = fkKeys(t, [[c.a - 0.06, -0.56, 0.12, 0.3, 7.6, 0.8, 49, 610, 1070, -0.08], [c.practice, -0.52, 0.12, 0.3, 8.4, 0.8, 53, 600, 1060, -0.08],
    [c.practice + 0.5, -0.52, 0.12, 0.3, 9.0, 0.8, 57, 600, 1030, -0.08]], OF_F);
  A.cam = { x: 545, y: 1318, zoom: 3.0, rot: 0 };
  let f = { ...FACES.nervous, lookX: 0.7, lookY: 0.6, mouth: 'grimace' };
  f = lerpFace(f, { ...FACES.grin, lookX: 0.6, lookY: 0.2, mouthOpen: 1 }, ramp(t, c.practice + 0.1, c.practice + 0.35));
  f.blink = ofBlink(t, 0.5, 0.1);
  A.face = f; A.hdx = 3 * Math.sin(t * loopW(1.3)); A.hrot = 0.05 * Math.sin(t * 7) * (1 - fin);
  return A;
}
SC.practice = (lt, t, shot) => {
  const c = cu(), A = practiceA(t);
  const H = ofPalmDraw(t, A);
  // a sweat drop on him while he works
  const hd = toScreen(A.cam, OF_HEAD[0] + 52, OF_HEAD[1] - 40);
  sweatDrop(ctx, hd[0], hd[1] + 30 * ((t * 1.4) % 1), 1.3, 1 - A.fin);
  // the coach: on the top of his fist, whistle and sweatband; it hops onto the fingertip for the perfect one
  const top = H.pr(fkSegPt(H.G, 'I', 1, 0.05, 'back', 1.1)), tip = H.pr(fkTip(H.G, 'M', -1.35));
  const hop = ramp(t, c.practice + 0.2, c.practice + 0.5, E.inOutCubic);
  const bx = lerp(top[0] - 10, tip[0], hop), by = lerp(top[1], tip[1], hop) - 90 * Math.sin(Math.PI * hop), bs = lerp(top[2], tip[2], hop) * 0.052;
  const toot = Math.max(...c.reps.map((r) => popK(t, r, r + 0.25, 0.04, 0.1)), popK(t, c.whistle, c.whistle + 0.6, 0.04, 0.2));
  ofBird(ctx, bx, by, bs, { t, facing: hop > 0.5 ? -1 : 1, whistle: ramp(t, shot.start, shot.start + 0.25), band: ramp(t, shot.start + 0.1, shot.start + 0.35), blow: toot,
    mood: t > c.whistle ? 'smug' : 'judge', flap: hop > 0.05 && hop < 0.95 ? 1 : 0, squash: 0.5 * popK(t, c.practice + 0.5, c.practice + 0.7, 0.04, 0.15), blink: ofBlink(t, 0.7, 0.2) });
  // the rep numbers
  c.reps.forEach((r, i) => {
    const k = popK(t, r + 0.05, r + 0.75, 0.08, 0.15), q = H.pr(fkTip(H.G, 'M', 1.2));
    if (k > 0.01) { screenSpace(); bigWord(String(i + 1), clamp(q[0] + 150, 260, 820), clamp(q[1] - 30 - 60 * (t - r), 470, 1150), 120, '#4DFFB4', E.outBack(clamp(k), 2.2), 0.08); }
  });
  ofSpark(tip[0] + 110, tip[1] + 60, 50, '#FFFFFF', popK(t, c.practice + 0.3, c.practice + 0.8, 0.05, 0.2));
  return { glow: 0.8 };
};

// ---------------------------------------------------------------- 1830s: Schumann in his parlour
const SCHUPAL = Object.assign({}, PARPAL, {});
function ofCravat(lc) {
  lc.fillStyle = '#F2EEE4'; lc.beginPath(); lc.moveTo(-34, -372); lc.lineTo(0, -290); lc.lineTo(34, -372); lc.closePath(); lc.fill();
  lc.fillStyle = '#EDE6D6'; lc.beginPath(); lc.ellipse(0, -360, 30, 16, 0, 0, 7); lc.fill();
  lc.fillStyle = '#E2D8C2'; lc.beginPath(); lc.moveTo(-6, -350); lc.lineTo(-22, -310); lc.lineTo(0, -318); lc.lineTo(22, -310); lc.lineTo(6, -350); lc.closePath(); lc.fill();
}
SC.parlour = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  screenSpace();
  ctx.drawImage(PARLOUR_BG, 0, 0);
  for (const cx of [796, 845, 894]) { softDot(gctx, cx, 830 + 2 * Math.sin(t * 13 + cx), 60, '#FFC27A', 0.7); ellipse(ctx, cx, 828, 6, 12, '#FFE9B0'); }
  const cam = { x: 520, y: 1010, zoom: 1.42 + 0.08 * lt / D, rot: 0 };
  applyCam(cam);
  const bow = ramp(t, c.schumann - 0.1, c.schumann + 0.25, E.inOutSine) * (1 - ramp(t, c.schumann + 0.45, c.schumann + 0.8, E.inOutSine));
  const pose = JSON.parse(JSON.stringify(POSES.stand));
  pose.lean = 0.16 * bow; pose.armL = { a: 0.35, b: 0.6 }; pose.armR = { a: 0.15 + 0.5 * bow, b: 1.2 * bow + 0.1 };
  const face = lerpFace({ ...FACES.grin, lookX: 0.1, lookY: 0.1, mouthOpen: 0.4 }, { ...FACES.calm, blink: 1, mouth: 'grin', mouthOpen: 0.5 }, bow);
  charLayer(cam, { x: 400, y: 1760, s: 2.05, pose, face }, t, { pal: SCHUPAL, ambient: 0.04, post: (lc) => { lc.save(); lc.translate(400, 1760); lc.scale(2.05, 2.05); lc.translate(0, 0); lc.rotate(pose.lean); ofCravat(lc); lc.restore(); } });
  ofTag('1830s', 540, 520, '#F2CC8F', popK(t, c.composer - 0.05, shot.end + 1, 0.15), null, 56);
  parOldFilm(t);
  return { glow: 0.85, desat: 0.72, tint: '#C8964F', tintA: 0.22 };
};

// his hand on the keys (palm down, fingers away from us) with the gadget yanking the middle finger
function keysState(t) {
  const c = cu();
  let yank = 0;
  c.yanks.forEach((y) => { yank = Math.max(yank, ramp(t, y, y + 0.14, E.outCubic) * (1 - ramp(t, y + 0.18, y + 0.34, E.inOutCubic))); });
  const stiff = clamp(ramp(t, c.crick - 0.04, c.crick + 0.16, E.outBack));
  return { yank, stiff, liftM: 0.52 + 0.33 * yank * (1 - stiff) + 0.48 * stiff };
}
SC.keys = (lt, t, shot) => {
  const c = cu(), S = keysState(t), D = shot.end - shot.start;
  screenSpace();
  const g0 = ctx.createLinearGradient(0, 0, 0, H); g0.addColorStop(0, '#2E1A12'); g0.addColorStop(1, '#120A06');
  ctx.fillStyle = g0; ctx.fillRect(0, 0, W, H);
  softDot(gctx, 820, 300, 340, '#FFC27A', 0.35); softDot(ctx, 820, 300, 520, '#FFC27A', 0.12);
  const tr = 0.012 * Math.sin(t * 61) * popK(t, c.crick, c.crick + 0.35, 0.02, 0.3);
  const V = fkKeys(lt, [[0, -2.05, 0.34, 0.5, 0.5, 13.5, 58, 540, 860, 0], [D, -2.0, 0.3, 0.5, 0.5, 13.0, 50, 540, 860, 0]], 3000);
  V.roll += tr;
  const prW = fkCam(V), prH = fkCam(Object.assign({}, V, { rotX: Math.PI / 2 }));
  const lift = { I: 0.5, M: S.liftM, R: 0.52, L: 0.55 };
  const G = fkGeo({ lift, thumb: 1, squeeze: 0, tremble: { M: 0.5 * popK(t, c.crick + 0.1, c.crick + 1.2, 0.05, 0.3) }, t });
  const tipsY = FK_ORD.map((k) => -G.f[k].pts[3][2]), tipsZ = FK_ORD.map((k) => G.f[k].pts[3][1]);
  const ky = Math.min(...tipsY.filter((_, i) => FK_ORD[i] !== 'M'), -G.thumb.pts[3][2]) - 0.62;
  const K = { y: ky, z0: Math.min(...tipsZ) - 5.5, x0: -16, x1: 18 };
  screenSpace();
  pnKeyboard(ctx, prW, K);
  // the gadget behind his hand, its arm out over the middle finger
  const loopH = fkSegPt(G, 'M', 1, 0.45, 'back', 1.0), loopW = [loopH[0], -loopH[2], loopH[1]];
  const gd = { post: [FK_F.M.x, K.z0 + 18], y: K.y, top: 13, tip: [FK_F.M.x, loopW[2]], lift: S.yank * (1 - S.stiff), loop: loopW,
    snap: ramp(t, c.crick, c.crick + 0.02), snapT: c.crick, t };
  actor(() => pnGadget(ctx, prW, gd));
  actor(() => fkDraw(ctx, prH, G, { sleeve: '#24222C', sleeveDk: '#F2EEE4' }));
  pnGadgetCord(ctx, prW, gd);
  // stiff marks and CRICK!
  const tp = prH(fkTip(G, 'M', 0.6)), sk = popK(t, c.crick, c.crick + 0.9, 0.04, 0.2);
  if (sk > 0.01) { screenSpace(); for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + (i - 1) * 0.5; line(ctx, tp[0] + Math.cos(a) * 60, tp[1] + Math.sin(a) * 60, tp[0] + Math.cos(a) * (60 + 70 * sk), tp[1] + Math.sin(a) * (60 + 70 * sk), 9, rgba('#FFFFFF', sk)); } }
  ofBurst('CRICK!', clamp(tp[0] + 210, 300, 800), clamp(tp[1] - 170, 470, 1100), 150, '#FFD447', popK(t, c.crick + 0.02, shot.end + 1, 0.08, 0.1), -0.12, 5);
  const gq = prW([FK_F.M.x, K.y + 7.5 + 13, K.z0 + 18]);
  ofTag('GADGET', clamp(gq[0] + 40, 320, 760), clamp(gq[1] - 120, 470, 1000), '#FF9A3C', popK(t, c.gadget - 0.05, c.crick - 0.1, 0.12, 0.15), [gq[0], gq[1] - 10], 46);
  parOldFilm(t);
  return { glow: 0.85, desat: 0.65, tint: '#C8964F', tintA: 0.2, zblur: 0.05 * popK(t, c.crick, c.crick + 0.15, 0.02, 0.1) };
};

// Schumann at the grand piano: "Piano career:" ... "over." the lid slams
SC.lid = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  screenSpace();
  ctx.drawImage(PN_ROOM, 0, 0);
  const slamK = ramp(t, c.slam - 0.14, c.slam, E.inCubic), bounce = 0.06 * Math.sin((t - c.slam) * 30) * Math.exp(-(t - c.slam) * 8) * (t > c.slam ? 1 : 0);
  const lid = clamp(1 - slamK + bounce);
  const shake = 14 * popK(t, c.slam, c.slam + 0.35, 0.01, 0.3) * Math.sin(t * 70);
  const cam = { x: 540 + shake, y: 1010, zoom: 1.0 + 0.05 * lt / D, rot: 0.004 * shake };
  applyCam(cam);
  softDot(ctx, 720, 980, 560, '#FFB86A', 0.22); softDot(gctx, 720, 980, 320, '#FFB86A', 0.16);
  for (const cx of [470, 515]) { softDot(gctx, cx, 1060, 70, '#FFC27A', 0.6); ellipse(ctx, cx, 1058, 6, 12, '#FFE9B0'); }
  actor(() => pnGrand(ctx, 330, 1200, 2.45, lid, t));
  pnGrandRim(ctx, 330, 1200, 2.45, lid);
  // he stands at the keyboard end, his right hand bandaged at his chest; the slam makes him jump
  const jolt = popK(t, c.slam, c.slam + 0.45, 0.03, 0.35);
  const pose = JSON.parse(JSON.stringify(POSES.stand));
  pose.armL = { a: 0.75 + 0.25 * jolt, b: 2.05 }; pose.armR = { a: 0.2 + 0.6 * jolt, b: 0.4 * jolt + 0.1 };
  let face = { ...FACES.calm, lookX: -0.5, lookY: 0.2, mouth: 'flat', browY: 0.6, browTilt: 1.0 };
  face = lerpFace(face, { ...FACES.worried, lookX: 0.7, lookY: 0.4 }, ramp(t, c.career, c.career + 0.3));
  face = lerpFace(face, FACES.shock, jolt);
  const st = { x: 205, y: 1880, s: 1.75, pose, face, frizz: 1.2 * jolt, headDY: -30 * jolt };
  charLayer(cam, st, t, { pal: SCHUPAL, ambient: 0.05, post: (lc, r) => {
    lc.save(); lc.translate(st.x, st.y); lc.scale(st.s, st.s); ofCravat(lc);
    const w = r.wrL; lc.fillStyle = '#F4F0E6'; lc.beginPath(); lc.ellipse(w[0], w[1] - 10, 34, 30, 0, 0, 7); lc.fill();
    lc.strokeStyle = '#CFC6B4'; lc.lineWidth = 4; for (let i = -1; i <= 1; i++) { lc.beginPath(); lc.moveTo(w[0] - 30, w[1] - 10 + i * 12); lc.lineTo(w[0] + 30, w[1] - 16 + i * 12); lc.stroke(); }
    lc.restore();
  } });
  // BANG and a puff of dust
  const bk = popK(t, c.slam, c.slam + 0.6, 0.03, 0.2);
  ofBurst('BANG!', 700, 830, 190, '#FF5A6E', bk, -0.1, 8, '#FFFFFF');
  if (bk > 0.01) { applyCam(cam); for (let i = 0; i < 9; i++) { const a = Math.PI * (1.05 + 0.9 * i / 8), r = 80 + 220 * ramp(t, c.slam, c.slam + 0.5); circle(ctx, 720 + Math.cos(a) * r * 1.6, 1190 + Math.sin(a) * r * 0.35, 30 + 10 * (i % 3), rgba('#CDB89A', 0.5 * bk)); } }
  parOldFilm(t);
  return { glow: 0.85, desat: 0.7, tint: '#C8964F', tintA: 0.22 };
};

// ---------------------------------------------------------------- the museum: the gadget on trial
SC.museum = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 540, y: 980, zoom: 1.0 + 0.08 * E.inOutSine(clamp(lt / D)), rot: 0 };
  pnMuseumBg(t, cam);
  applyCam(cam);
  pnSpot(540, 1150, 260, 1);
  pnPlinth(540, 1150, 300, 420);
  pnGadgetModel(530, 1146, 15, t, 1);
  pnDome(540, 1146, 175, 330, 1);
  paint(() => { ctx.fillStyle = '#B8913E'; rrect(ctx, 430, 1250, 220, 60, 8); ctx.fill(); ctx.font = '800 26px Montserrat'; ctx.fillStyle = '#2A1A0A'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('EXHIBIT A · 1830s', 540, 1281); });
  // the question
  const qk = popK(t, c.qmark, shot.end + 1, 0.1, 0.1);
  if (qk > 0.01) { screenSpace(); const qc = toScreen(cam, 540, 690); bigWord('?', qc[0], qc[1] + 6 * Math.sin(t * 5), 260, '#FFD447', E.outBack(qk, 2.4), 0.06 * Math.sin(t * 3)); }
  // two historians rise on their plinths and argue
  const inL = ramp(t, c.historians - 0.05, c.historians + 0.35, E.outBack), inR = ramp(t, c.historians + 0.15, c.historians + 0.5, E.outBack);
  applyCam(cam);
  for (const [x, k, side] of [[250, inL, 1], [830, inR, -1]]) {
    if (k <= 0.01) continue;
    const y = 1250 + (1 - k) * 600;
    pnPlinth(x, y, 210, 700);
    const talking = side > 0 ? Math.max(popK(t, c.yes, c.yes + 0.5, 0.04, 0.1), popK(t, c.yes2, c.yes2 + 0.5, 0.04, 0.1)) : popK(t, c.no, c.no + 0.55, 0.04, 0.1);
    pnBust(x, y - 6, 80, { talk: talking * (0.5 + 0.5 * Math.abs(Math.sin(t * 22))), angry: ramp(t, c.yes, c.yes + 0.2), look: side, rot: 0.06 * side * talking });
  }
  screenSpace();
  const lb = toScreen(cam, 250, 960), rb = toScreen(cam, 800, 960);
  const lh = toScreen(cam, 250, 1000), rh = toScreen(cam, 830, 1000);
  ofSpeech('IT DID!', lh[0] + 90, lh[1] - 270, popK(t, c.yes, c.no + 0.05, 0.08, 0.08), lh[0] + 30, lh[1] - 120, 72, -0.06);
  ofSpeech('DID NOT!', rh[0] - 110, rh[1] - 330, popK(t, c.no, c.yes2 + 0.02, 0.08, 0.08), rh[0] - 30, rh[1] - 120, 72, 0.05);
  ofSpeech('DID!', lh[0] + 90, lh[1] - 270, popK(t, c.yes2, shot.end + 1, 0.08, 0.08), lh[0] + 30, lh[1] - 120, 80, -0.08);
  return { glow: 0.9 };
};

// ---------------------------------------------------------------- the button: his OTHER hand, and then he sees us
function buttonA(t) {
  const c = cu(), A = {};
  const up = ramp(t, c.now3 - 0.05, c.now3 + 0.3, E.outCubic);
  A.liftM = clamp(ramp(t, c.lift_m2, c.lift_m2 + 0.42, E.outBack));
  const crp2 = ramp(t, c.lift_m2 + 0.2, c.lift_m2 + 0.7, E.outCubic); A.liftR = 0.58 * crp2; A.creepR = 0.2 * crp2; A.creepL = 0.2 * ramp(t, c.lift_m2 + 0.3, c.lift_m2 + 0.8);
  A.tremR = ramp(t, c.lift_m2 + 0.2, c.lift_m2 + 0.5);
  A.squeeze = 0.4;
  const hide = ramp(t, c.hide - 0.05, c.hide + 0.35, E.inOutCubic);
  A.hide = hide;
  A.V = fkKeys(t, [[c.now3 - 0.06, -0.52, 0.1, 0.3, 6.6, 0.8, 50, 470, 1080 + 700 * (1 - up), 0.08], [c.lift_m2, -0.5, 0.12, 0.3, 8.6, 0.8, 62, 480, 1175, 0.1],
    [c.hide - 0.05, -0.5, 0.12, 0.3, 8.6, 0.8, 62, 480, 1175, 0.1], [c.hide + 0.4, -1.9, 0.12, 0.3, 8.6, 0.8, 60, 330, 1560, 0.4]], OF_F);
  A.V.cy += 700 * (1 - up);
  A.cam = { x: 417, y: 1318, zoom: 2.95, rot: 0 };
  let f = { ...FACES.grin, lookX: -0.75, lookY: 0.55, mouthOpen: 0.6 };
  f = lerpFace(f, { ...FACES.startled, lookX: 0, lookY: 0 }, ramp(t, c.see, c.see + 0.15));
  f = lerpFace(f, { ...FACES.nervous, lookX: -0.4, lookY: -0.3, mouth: 'grimace' }, hide);
  f.blink = ofBlink(t, 0.5, 0.7);
  A.face = f; A.hdx = 0; A.hrot = -0.05 * hide;
  return A;
}
SC.button = (lt, t, shot) => {
  const c = cu(), A = buttonA(t);
  const H = ofPalmDraw(t, A, { mirror: true });
  const inK = ramp(t, c.land2 - 0.5, c.land2, E.outCubic), flee = ramp(t, c.hide, c.hide + 0.5, E.inCubic);
  if (inK > 0.001 && flee < 0.999) {
    const tip = H.pr(fkTip(H.G, 'M', -1.35)), s = tip[2] * 0.052;
    const x = lerp(lerp(-140, tip[0], E.outCubic(inK)), 1200, flee), y = lerp(lerp(260, tip[1], E.outCubic(inK)), 300, flee) - 120 * Math.sin(Math.PI * inK) * (1 - inK);
    ofBird(ctx, x, y, s, { t, facing: 1, flap: inK < 0.999 || flee > 0.001 ? 1 : 0, perch: inK < 0.999 ? 0.2 : 1, mood: t > c.see ? 'judge' : 'calm',
      look: -0.2 * ramp(t, c.see, c.see + 0.2), squash: 0.6 * popK(t, c.land2, c.land2 + 0.25, 0.04, 0.2), blink: ofBlink(t, 0.8, 0.4) });
  }
  return { glow: 0.8 };
};

// ---------------------------------------------------------------- the cover (src/cover.sh): the cuffed fingers, the robin, his look
SC.cover = (lt, t, shot) => {
  const c = cu(), A = hookA(c.click + 0.6);
  A.V = Object.assign({}, A.V, { tx: 0.2, ty: 10.4, tz: 1.2, D: 40, cx: 660, cy: 990 });
  A.cam = { x: 545, y: 1318, zoom: 3.0, rot: 0 };
  screenSpace();
  ofBack(A.cam, t);
  ofHero(A.cam, t, { face: { ...FACES.annoyed, lookX: 0.5, lookY: 0.9, mouth: 'flat' }, hide: 'L' });
  const H = ofHookHand(A, t);
  ofBirdAt(H.pr, H.G, 'M', t, { inK: 1, bird: { mood: 'judge', facing: -1, look: 0.3 } });
  screenSpace();
  bigWord('CAN YOU?', 540, 1440, 200, '#FFD447', 1, -0.05);
  return { glow: 0.8, noCaptions: true };
};

function initScenes2() {
  initTrail();
  initParlour();
  initPianoRoom();
}
