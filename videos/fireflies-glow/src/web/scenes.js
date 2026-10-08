// How Do Fireflies GLOW? Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;
const shotOf = (id) => TLd.shots.find((s) => s.id === id);
const clone = (p) => JSON.parse(JSON.stringify(p));
// into a rig's own space (feet at 0, 0)
function rigSpace(c, st, fn) { c.save(); c.translate(st.x, st.y); c.scale(st.s, st.s); fn(c); c.restore(); }
// the strongest of a list of pulses at time t: each is on for `len` seconds, with soft edges
const pulseOf = (t, times, len = 0.16) => times.reduce((m, f) => Math.max(m, clamp((t - f) / 0.03) * clamp((f + len - t) / 0.05)), 0);
// a decaying bump after each of a list of moments
const bumpOf = (t, times, rate = 9) => times.reduce((m, f) => Math.max(m, t >= f ? Math.exp(-(t - f) * rate) : 0), 0);

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the jar: a night meadow, the moon behind him on the right (the rim), the jar's own light from the glow layer
const JAR_LIGHT = { ...LIGHTS.night, pool: 0.6, halo: 0.12 };
// the meadow without him: moonlight from the right behind, and every lamp is a firefly
const MEADOW_LIGHT = { ...LIGHTS.night, pool: 0.36, halo: 0 };
setLights({ hook: JAR_LIGHT, button: JAR_LIGHT, cover: JAR_LIGHT, stick: MEADOW_LIGHT, snap: LIGHTS.diagram, tail: LIGHTS.inside, valve: LIGHTS.inside,
  cold: MEADOW_LIGHT, bulb: MEADOW_LIGHT, blink: MEADOW_LIGHT, code: MEADOW_LIGHT, reply: MEADOW_LIGHT, fake: MEADOW_LIGHT, date: MEADOW_LIGHT,
  eat: MEADOW_LIGHT, why: MEADOW_LIGHT, spider: MEADOW_LIGHT, armour: MEADOW_LIGHT });

// ================================================================ the jar: frame 1 and round it
// One world for the hook and the button: everything is a function of tt = seconds since frame 1 (negative tt = the last
// seconds of the Short, so its last frames run into its first: the loop).
const JAR = { HX: 540, HY: 1700, HEADY: 1230, X: 540, Y: 1430, S: 0.66 };   // his feet, the middle of his head, the middle of the glass (world)
// a dark jacket, so the jar's light reads in front of it
const NIGHTPAL = Object.assign({}, PAL, { coat: '#2C5A7C', coatSh: '#1D3F58', coatHi: '#6FA0C4', coatDk: '#16303F' });

function jarState(tt) {
  const c = cu(), D = TLd.duration, n = (x) => x - D, neg = tt < 0;
  const sb = shotOf('button'), tB = (sb ? sb.start : D) - D;      // (the cover's one-shot timeline has no button)
  // ---- the lid: it is in his hand above the jar on frame 1, lands, gets a twist. At the very end he lifts it again
  const lift = neg ? ramp(tt, n(c.loop), -0.03, E.inOutSine) : 1 - ramp(tt, 0, c.clap, E.inCubic);
  const land = !neg && tt >= c.clap ? Math.exp(-(tt - c.clap) * 9) : 0;
  const twist = neg ? 1 : ramp(tt, c.clap + 0.05, c.clap + 0.6, E.outCubic);
  const lid = { dx: 32 * lift, dy: -27 * lift + 3 * land, rot: 0.24 * lift + 0.06 * Math.sin(twist * 10) * (1 - twist) };
  // ---- the firefly inside: a soft lamp, a flare on "jar", and all of it on "glows"
  const flare = neg ? 0 : ramp(tt, c.lit - 0.05, c.lit + 0.16, E.outBack);
  const big = neg ? 0 : ramp(tt, c.hand - 0.12, c.glows + 0.14, E.inOutSine);
  let lit = neg ? lerp(0.8, 0.5, ramp(tt, n(c.loop) - 0.25, -0.05, E.inOutSine)) : 0.5 + 0.28 * flare + 0.22 * big;
  if (!neg) lit *= 1 - 0.8 * pulseOf(tt, c.blinks, 0.09);
  lit *= 0.95 + 0.05 * Math.sin(tt * 7.3);
  const fz = Math.exp(-Math.abs(tt) * 2.6);                                  // frantic round frame 1, calmer after
  const bug = { x: JAR.X + 10 * Math.sin(tt * 2.1) + 13 * fz * Math.sin(tt * 23), y: JAR.Y + 4 + 6 * Math.sin(tt * 3.3 + 1) + 9 * fz * Math.sin(tt * 31 + 1), lit };
  // ---- the visitor (the button): she turns up outside the glass with a fork, taps it, and gives up
  let vis = null;
  if (neg) {
    const inn = ramp(tt, tB - 0.05, tB + 0.4, E.outCubic), out = ramp(tt, n(c.huff), n(c.huff) + 0.55, E.inCubic);
    const tap = c.taps.reduce((m, x) => Math.max(m, Math.exp(-Math.abs(tt - n(x)) * 30)), 0);
    vis = { x: JAR.X + 102 + 250 * (1 - inn) + 420 * out - 9 * tap, y: JAR.Y - 26 + 70 * (1 - inn) - 360 * out, tap, out, inn,
      face: tt < n(c.huff) - 0.05 ? (tt > n(c.its_the) ? 'smug' : 'evil') : 'meh' };
  }
  if (neg) {
    bug.face = tt < n(c.huff) ? 'worried' : 'happy';
    bug.look = tt < n(c.jar2_end) ? [1, 0] : tt < n(c.its_the) ? [1, 0] : tt < n(c.huff) ? [0, -1] : [0, -0.6];
    bug.x = JAR.X - 14 * (1 - vis.out) + (10 * Math.sin(tt * 2.1) + 13 * fz * Math.sin(tt * 23)) * vis.out; // it keeps to the far side of the glass
  } else {
    bug.face = tt < c.clap + 0.3 ? 'shock' : tt < c.lit ? 'worried' : 'calm';
    bug.look = tt < c.lit ? [0, -1] : tt > c.glows_end ? [0, -1] : [0, 0];
  }
  // ---- him
  let p = clone(POSES.stand);
  const loc = (wx, wy) => [(wx - JAR.HX), (wy - JAR.HY)];
  const lidY = JAR.Y - 100 * JAR.S - 9 * JAR.S + lid.dy;
  const handL = [JAR.X - 75 * JAR.S + 4, JAR.Y + 36], handR = [JAR.X + lid.dx + 26, lidY - 12];
  p = ikReach(p, 'L', loc(handL[0], handL[1]), -1);
  p = ikReach(p, 'R', loc(handR[0], handR[1]), -1);
  p.hand = 'open';
  const down = { lookX: 0, lookY: 1 };
  let face;
  if (neg) {
    const her = { lookX: 1, lookY: 0.5 };
    face = Object.assign({}, FACES.confused, her, { browY: 0.9 });
    face = lerpFace(face, Object.assign({}, FACES.nervous, down), bumpOf(tt, c.taps.map(n), 4) * (1 - ramp(tt, n(c.its_the) - 0.1, n(c.its_the) + 0.1)));
    face = lerpFace(face, Object.assign({}, FACES.annoyed, her, { blink: 0.36, browTilt: -0.8 }), ramp(tt, n(c.its_the), n(c.its_the) + 0.25) * (1 - ramp(tt, n(c.huff) + 0.2, n(c.huff) + 0.45)));
    face = lerpFace(face, Object.assign({}, FACES.grin, down, { mouthOpen: 0.5, browY: 0.7 }), ramp(tt, n(c.huff) + 0.3, n(c.huff) + 0.6));
  } else {
    face = Object.assign({}, FACES.grin, down, { mouthOpen: 0.5, browY: 0.7 });
    face = lerpFace(face, Object.assign({}, FACES.startled, down, { mouthOpen: 0.6 }), ramp(tt, c.lit - 0.03, c.lit + 0.1) * (1 - ramp(tt, c.hand - 0.25, c.hand)));
    face = lerpFace(face, Object.assign({}, FACES.shock, { lookX: -0.7, lookY: 1, mouthOpen: 0.75, browY: 1.5 }), ramp(tt, c.hand - 0.1, c.hand + 0.1) * (1 - ramp(tt, c.glows + 0.3, c.glows + 0.55)));
    face = lerpFace(face, Object.assign({}, FACES.grin, down, { browY: 1.1, eyeOpen: 1.2 }), ramp(tt, c.glows + 0.3, c.glows + 0.55));
    face = Object.assign({}, face, { blink: Math.max(face.blink || 0, pulseOf(tt, c.blinks.map((b) => b + 0.1), 0.1)) });
  }
  const jolt = neg ? 0 : (tt >= c.lit ? Math.exp(-(tt - c.lit) * 7) : 0);
  const st = { x: JAR.HX, y: JAR.HY, s: 1, pose: p, face, noLegs: true,
    headDY: 8 - 9 * jolt + 1.5 * Math.sin(tt * 2.3), headDX: neg ? 7 * (1 - ramp(tt, n(c.huff) + 0.2, n(c.huff) + 0.5)) * ramp(tt, tB, tB + 0.3) : 0,
    headRot: 0.02 * Math.sin(tt * 1.7) + (neg ? 0.05 * (1 - ramp(tt, n(c.huff) + 0.2, n(c.huff) + 0.5)) * ramp(tt, tB, tB + 0.3) : 0) };
  return { st, lid, bug, vis, big, flare, land, handL, handR, lit };
}
function jarCam(tt) {
  const c = cu(), D = TLd.duration, n = (x) => x - D, tB = shotOf('button').start - D;
  const Y = (z) => JAR.HEADY + 380 / z;           // keeps the middle of his head at screen y 580 for any zoom
  const k = camKeys(tt, [[tB, 582, Y(2.66), 2.66], [n(c.huff), 584, Y(2.72), 2.72], [n(c.loop) - 0.05, 560, Y(2.72), 2.72], [-0.03, 540, Y(2.74), 2.74], [0, 540, Y(2.74), 2.74],
    [0.3, 540, Y(3.0), 3.0], [c.lit, 540, Y(3.02), 3.02], [c.glows + 0.4, 540, Y(3.12) + 6, 3.12], [shotOf('stick').start, 540, Y(3.18) + 10, 3.18]]);
  const land = tt >= c.clap ? Math.exp(-(tt - c.clap) * 11) : 0;
  const sh = shake(tt, 6 * land, 30, 3);
  k.x += sh[0] / k.zoom; k.y += sh[1] / k.zoom;
  return k;
}
function jarDraw(tt, t, o = {}) {
  const cam = o.cam || jarCam(tt), S = jarState(tt), st = S.st;
  mdwBack(cam, t, { soft: true, far: 1, glow: 0.35, keep: [170, 910, 330] });
  // ---- him: the jar's light climbs his jacket and the underside of his face
  const JP = toScreen(cam, JAR.X, JAR.Y + 10);
  const r = charLayer(cam, st, t, { pal: NIGHTPAL, post: (cc) => {
    cc.save(); cc.setTransform(1, 0, 0, 1, 0, 0); cc.globalCompositeOperation = 'source-atop';
    const g = cc.createRadialGradient(JP[0], JP[1], 40, JP[0], JP[1], 520 + 200 * S.big);
    g.addColorStop(0, rgba(FF.GLOW, 0.52 * S.lit)); g.addColorStop(0.45, rgba(FF.GLOW, (0.2 + 0.14 * S.big) * S.lit)); g.addColorStop(1, rgba(FF.GLOW, 0));
    cc.fillStyle = g; cc.fillRect(0, 0, W, H); cc.restore();
  } });
  applyCam(cam);
  // ---- the jar: glass behind, the firefly, glass in front, the lid
  ffJarBack(JAR.X, JAR.Y, JAR.S, S.lit);
  ffBug(S.bug.x, S.bug.y, 0.3, t, { lit: S.lit, tie: true, face: S.bug.face, look: S.bug.look, seed: 1, glow: 0.7 + 0.5 * S.big });
  ffJarFront(JAR.X, JAR.Y, JAR.S, S.lit, S.lid, t);
  // ---- his hands again, in front of the glass and on the lid: they catch the light
  const hp = Object.assign({}, NIGHTPAL, { skin: mixHex(PAL.skin, FF.CORE, 0.15 + 0.3 * S.big), skinSh: mixHex(PAL.skinSh, FF.GLOW, 0.15 + 0.3 * S.big) });
  rigSpace(ctx, st, (cc) => { drawHand(cc, r.wrL, r.armDirL, 'open', hp, -1, t); drawHand(cc, r.wrR, r.armDirR, 'open', hp, 1, t); });
  if (S.big > 0.02) for (const k of ['L', 'R']) { const w = toWorld(st, r['wr' + k]); softDot(gctx, w[0], w[1] + 6, 46, FF.GLOW, 0.16 * S.big * (0.85 + 0.15 * Math.sin(t * 9))); }
  // ---- the visitor, outside the glass
  if (S.vis && S.vis.out < 1) {
    const v = S.vis, fk = [-0.9 + 0.5 * v.tap, 0];
    ffBug(v.x, v.y, 0.5, t, { kind: 1, lash: true, lit: 0.5 + 0.2 * Math.sin(t * 5), face: v.face, look: [-1, 0.2], seed: 5, armL: [-52 + 12 * v.tap, 0], glow: 0.6, tilt: -0.06 - 0.3 * v.out });
    const f = ffPt(v.x, v.y, 0.5, [-52 + 12 * v.tap, 0], -0.06);
    ffFork(f[0], f[1] + 3 * Math.sin(t * 8.5 + 8.5), 0.5, -1.25 + 0.3 * v.tap);
    if (v.tap > 0.5) { const gx = JAR.X + 75 * JAR.S, gy = f[1] - 4; paint(() => { for (let i = 0; i < 5; i++) { const a = -1.2 + i * 0.6; line(ctx, gx + Math.cos(a) * 7 - 5, gy + Math.sin(a) * 7, gx + Math.cos(a) * 17 - 5, gy + Math.sin(a) * 17, 2.4, 'rgba(255,255,255,0.9)'); } }); }
  }
  return { cam, S, r };
}

// ================================================================ shots
SC.hook = (lt, t, shot) => {
  const c = cu();
  jarDraw(t, t);
  const dive = ramp(t, shot.end - 0.2, shot.end, E.inCubic);
  return { glow: 0.85, capY: 1500, zblur: 0.28 * dive, zcx: 540, zcy: 1100, flash: 0.4 * ramp(t, shot.end - 0.07, shot.end) };
};

// ---- the answer: a firefly and a glow stick, side by side; then the stick gets wings
function boardBack(t, dim = 0.42) {
  mdwBack(CAM0, t, { soft: true, far: 0.5, glow: 0.25 });
  screenSpace();
  ctx.fillStyle = `rgba(3,8,16,${dim})`; ctx.fillRect(0, 0, W, H);
}
SC.stick = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  boardBack(t);
  const up = ramp(t, c.stick - 0.14, c.stick + 0.2, E.outBack), wk = ramp(t, c.wings - 0.03, c.wings + 0.2, E.outBack);
  const look = t < c.stick - 0.1 ? [0, 0] : t < c.buzz + 0.05 ? [1, -0.2 - 0.5 * wk] : [0, 0];
  ffBug(318, 806, 2.25, t, { lit: 0.92, tie: true, face: t < c.wings + 0.16 ? 'calm' : 'meh', look, seed: 1 });
  if (up > 0) {
    const hover = wk * (26 + 12 * Math.sin(t * 9));
    ffStick(752, lerp(1560, 800, up) - hover, 430, 64, Math.PI / 2, { lit: 1, vial: 0, wings: wk, t });
    const eq = ramp(t, c.stick + 0.08, c.stick + 0.28, E.outBack);
    bigWord('=', 552, 800, 150, '#FFFFFF', eq);
    if (t >= c.buzz) paint(() => { for (let i = 0; i < 3; i++) { const a = clamp(1 - (t - c.buzz) * 2.6); for (const sd of [-1, 1]) line(ctx, 752 + sd * (96 + i * 18), 640 - hover + i * 16, 752 + sd * (110 + i * 18), 632 - hover + i * 16, 4, `rgba(255,255,255,${0.7 * a})`); } });
  }
  const arrive = 1 - ramp(lt, 0, 0.22);
  return { glow: 0.85, zblur: 0.2 * arrive, zcx: 318, zcy: 806, flash: 0.35 * (1 - ramp(lt, 0, 0.16)), push: { k: 1 + 0.04 * lt / D, cx: 540, cy: 820 } };
};

// ---- "Same trick": a glow stick is two liquids kept apart; bend it and they mix
function fistOn(x, y, sd, rot) {
  const c = ctx;
  c.save(); c.translate(x, y); c.rotate(rot);
  line(c, sd * 26, 80, sd * 150, 520, 120, NIGHTPAL.coat);
  circle(c, 0, 0, 66, PAL.skin);
  for (let i = 0; i < 4; i++) ellipse(c, -sd * 8, -42 + i * 27, 44, 15, PAL.skin);
  paint(() => { for (let i = 0; i < 3; i++) line(c, -sd * 44, -28 + i * 27, sd * 20, -28 + i * 27, 3, PAL.skinSh); });
  c.restore();
}
SC.snap = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#123440', '#03090F');
  screenSpace();
  const cr = t >= c.crack, press = ramp(t, c.same - 0.05, c.crack, E.inCubic);
  const bend = 52 * press * (1 - 0.7 * ramp(t, c.crack, c.crack + 0.14));
  const lit = cr ? ramp(t, c.crack, c.crack + 0.6, E.outCubic) : 0, mix = cr ? ramp(t, c.crack, c.crack + 0.75, E.outCubic) : 0;
  ffStick(540, 830, 600, 92, -0.05, { bend, vial: cr ? 0 : 1, lit, mix, shards: true, t });
  fistOn(232, 856 + 0.4 * bend, -1, 0.12 + 0.004 * bend);
  fistOn(848, 826 + 0.4 * bend, 1, -0.12 - 0.004 * bend);
  ffBurst('SNAP!', 540, 590, 150, cr ? inv(c.crack, c.crack + 0.1, t) * (1 - ramp(t, c.crack + 0.42, c.crack + 0.56)) : 0);
  const hit = cr ? Math.exp(-(t - c.crack) * 10) : 0;
  return { glow: 0.9, flash: 0.12 * hit + 0.22 * (1 - ramp(lt, 0, 0.12)), push: { k: 1 + 0.05 * lt / D + 0.03 * hit, cx: 540, cy: 830 } };
};

// ---- in its tail: the fuel, the enzyme that holds it, oxygen down the air pipe, and light
SC.tail = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const adv = Math.max(0, t - c.meet) * 0.72;
  const R = lanSection(t, { adv, flow: 1, sparksOn: 1, tap: null, fuel: ramp(lt, 0.0, 0.55, E.outCubic), view: { s: 1.12, x: -100.8, y: -135.6 }, labels: { fuel: [500, 448] },
    names: [ramp(lt, 0.2, 0.44), ramp(lt, 0.42, 0.66), ramp(t, c.oxygen - 0.06, c.oxygen + 0.18)],
    inset: { x: 214, y: 1122, r: 100, lit: 0.25 + 0.75 * clamp(R0glow(adv)), k: ramp(lt, 0.02, 0.26), ring: ramp(lt, 0.2, 0.4), face: adv > 1 ? 'happy' : 'calm' } });
  const arrive = 1 - ramp(lt, 0, 0.26);
  return { glow: 0.8 + 0.15 * R.glow, capY: 1362, zblur: 0.26 * arrive, zcx: 540, zcy: 860, flash: 0.36 * (1 - ramp(lt, 0, 0.16)) + 0.05 * R.glow, push: { k: 1 + 0.035 * lt / D, cx: 560, cy: 860 } };
};
const R0glow = (adv) => clamp(adv - 1.0) * 1.4;

// ---- cold light: no flame, a thermometer that stays where it is
SC.cold = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  boardBack(t);
  ffBug(372, 800, 2.3, t, { lit: 0.9 + 0.08 * Math.sin(t * 6), tie: true, face: t < c.cross ? 'calm' : 'happy', look: t < c.almost - 0.1 ? [1, -0.6] : [1, 0.5], seed: 1 });
  ffNoFlame(800, 590, 1.12, ramp(t, c.flame - 0.1, c.flame + 0.12), inv(c.cross, c.cross + 0.13, t), t);
  ffThermo(806, 912, 0.92, 0.17 + 0.012 * Math.sin(t * 5), ramp(t, c.almost - 0.08, c.almost + 0.16));
  pill(400, 1156, 'COLD LIGHT', '#7FE9FF', ramp(t, c.almost + 0.05, c.almost + 0.3), 54);
  const cut = 1 - ramp(lt, 0, 0.12);
  return { glow: 0.85, flash: 0.22 * cut, push: { k: 1 + 0.04 * lt / D, cx: 540, cy: 820 } };
};
// ---- ... and what a light bulb in the same place would do to him
function smokeCurl(x, y, s, d, seed = 0) {
  if (d <= 0) return;
  const a = clamp(d * 5) * clamp(1.6 - d * 0.7);
  paint(() => {
    ctx.lineCap = 'round'; ctx.strokeStyle = `rgba(190,190,205,${0.55 * a})`; ctx.lineWidth = (7 + 5 * d) * s;
    ctx.beginPath(); ctx.moveTo(x, y);
    for (let i = 1; i <= 9; i++) { const u = i / 9, yy = y - u * (60 + 150 * Math.min(d, 1.6)) * s; ctx.lineTo(x + Math.sin(u * 5 + d * 4 + seed) * (6 + 30 * u) * s, yy); }
    ctx.stroke();
  });
}
SC.bulb = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  boardBack(t);
  const done = t >= c.ding;
  const heat = done ? Math.max(0, 1 - (t - c.ding) * 7) : ramp(t, c.a_light, c.would, E.inOutSine);
  const cook = ramp(t, c.cook - 0.02, c.cook_end, E.inCubic);
  const face = done ? 'dazed' : t < c.bulbw ? ffFace('calm') : t < c.would ? 'worried' : 'sweat';
  const bx = 388 + (done ? 0 : 5 * heat * Math.sin(t * 40)), by = 720;
  ffBug(bx, by, 2.3, t, { lit: 0, noLamp: true, tie: true, face, look: done ? [0, 0] : [0, 1], seed: 1, cook, still: cook > 0.5 });
  const bp = ffPt(bx, by, 2.3, [0, 40]);
  ffBulb(bp[0], bp[1], 2.05, heat, t);
  for (const sd of [-1, 1]) ffHeat(bp[0] + sd * 150, bp[1] + 150, 1.5, heat * (1 - cook * 0.5), t, 2);
  if (heat > 0.4 && !done) for (const [dx, dy, ph] of [[-108, -180, 0], [104, -150, 0.5]]) { const u = (t * 1.6 + ph) % 1; sweatDrop(ctx, bx + dx, by + dy + 70 * u, 1.5, heat * (1 - u)); }
  ffThermo(806, 880, 0.92, 0.17 + 0.83 * ramp(t, c.a_light + 0.1, c.cook, E.inOutSine), 1);
  if (cook > 0.6) { smokeCurl(bx - 40, by - 300, 1.5, t - c.cook_end + 0.2, 1); smokeCurl(bx + 50, by - 280, 1.3, t - c.cook_end + 0.05, 3); smokeCurl(bx, by + 150, 1.2, t - c.ding, 5); }
  ffBurst('DING!', 770, 520, 118, done ? inv(c.ding, c.ding + 0.1, t) : 0, '#FFE08A', '#3A0A18', 0.08, 5);
  const cut = 1 - ramp(lt, 0, 0.1);
  return { glow: 0.85, flash: 0.18 * cut + 0.12 * bumpOf(t, [c.ding], 12), push: { k: 1 + 0.05 * lt / D, cx: 470, cy: 800 } };
};

// ---- the blinking: outside ...
SC.blink = (lt, t, shot) => {
  const c = cu();
  boardBack(t, 0.5);
  const on = pulseOf(t, [shot.start - 0.02, c.the_blink + 0.02, c.blinking + 0.1, c.blinking + 0.32, ...c.pips], 0.11);
  ffBug(540, 800, 2.6, t, { lit: 0.08 + 0.92 * on, tie: true, face: 'smug', look: [0, 0], seed: 1, glow: 1.2 });
  const cut = 1 - ramp(lt, 0, 0.1);
  return { glow: 0.9, flash: 0.2 * cut, push: { k: 1.02 + 0.03 * on, cx: 540, cy: 900 } };
};
// ---- ... and inside: a tap on the air pipe
function valveFlow(t) {
  const c = cu();
  return clamp(1 - ramp(t, c.cuts - 0.02, c.cuts + 0.1, E.inOutCubic) + ramp(t, c.reopen, c.reopen + 0.1, E.inOutCubic));
}
SC.valve = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  let adv = 6;
  for (let x = shot.start; x < t; x += 1 / 120) adv += valveFlow(x) * 0.72 / 120;
  const flow = valveFlow(t);
  const R = lanSection(t, { adv, flow, sparksOn: 1, tap: 1 - flow, fuel: 1, names: [0, 0, 1], view: { s: 1.3, x: 103.6, y: -244 }, labels: { air: [300, 500] },
    inset: { x: 244, y: 1050, r: 118, lit: 0.06 + 0.94 * flow, k: 1, ring: 0, face: flow > 0.5 ? 'smug' : 'meh' } });
  screenSpace();
  // the word by the tap
  const shut = ramp(t, c.cuts, c.cuts + 0.12, E.outBack) * (1 - ramp(t, c.reopen, c.reopen + 0.08));
  bigWord('OFF', 300, 822, 120, '#FF5A6E', shut, -0.07);
  bigWord('ON', 300, 822, 120, '#4DFFB4', ramp(t, c.reopen + 0.02, c.reopen + 0.14, E.outBack), -0.07);
  const cut = 1 - ramp(lt, 0, 0.12);
  return { glow: 0.8 + 0.15 * R.glow, capY: 1430, flash: 0.3 * cut, push: { k: 1 + 0.03 * lt / D, cx: 420, cy: 800 } };
};

// ---- a code: three species over the meadow, each with its own pattern
const SPECIES = [
  { x: 258, y: 800, s: 1.42, lamp: FF.GLOW, marks: [[0.4, 1], [2.4, 1]], strip: [290, 518], tie: true, seed: 1, kind: 0 },
  { x: 800, y: 700, s: 1.18, lamp: '#FFC94A', marks: [[0.6, 3.8]], strip: [760, 430], seed: 4, kind: 0 },
  { x: 560, y: 1090, s: 1.02, lamp: '#7CFFB0', marks: [[0.3, 0.6], [1.3, 0.6], [2.3, 0.6], [3.3, 0.6], [4.3, 0.6]], strip: [560, 1270], seed: 7, kind: 1 },
];
const CODE_BEATS = 8, CODE_PER = 1.5;
function meadowWide(t, far = 0.55) {
  mdwBack(CAM0, t, { far, glow: 0.35 });
  screenSpace();
  mdwGrass(t, { y: 1600, n: 44, h: [110, 250], w: [16, 30], col: ['#051517', '#0B2A26'], seed: 3 });
  mdwGrass(t, { y: 1790, n: 28, h: [170, 340], w: [24, 44], col: ['#02090B', '#051314'], seed: 5 });
}
SC.code = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  meadowWide(t);
  const play = ((lt + 0.1) / CODE_PER) % 1, beat = play * CODE_BEATS;
  const turn = [c.every, c.species + 0.25, c.has + 0.2];
  SPECIES.forEach((sp, i) => {
    const on = sp.marks.reduce((m, [a, len]) => Math.max(m, clamp((beat - a) / 0.12) * clamp((a + len - beat) / 0.2)), 0);
    const pk = bumpOf(t, [turn[i]], 5);
    const drift = [9 * Math.sin(t * 1.3 + i * 2), (i === 1 ? 26 * on : 0)];
    ffBug(sp.x + drift[0], sp.y + drift[1], sp.s * (1 + 0.12 * pk), t, { kind: sp.kind, lamp: sp.lamp, lit: 0.07 + 0.93 * on, tie: sp.tie, face: 'calm', look: [0, 0.2], seed: sp.seed, glow: 1.25 });
    ffStrip(sp.strip[0], sp.strip[1], 350, sp.marks, CODE_BEATS, play, sp.lamp, ramp(t, c.code - 0.1 + i * 0.1, c.code + 0.12 + i * 0.1), 64 * (1 + 0.14 * pk));
  });
  const cut = 1 - ramp(lt, 0, 0.12);
  return { glow: 0.9, capY: 1450, flash: 0.22 * cut, push: { k: 1 + 0.04 * lt / D, cx: 540, cy: 800 } };
};

// ---- he flashes, she flashes back; the aside; and then the lights go out
function eyesInDark(x, y, s, look, blink, lash) {
  for (const sd of [-1, 1]) {
    const e = ffPt(x, y, s, [sd * 15.5, -59]);
    ellipse(ctx, e[0], e[1], 13 * s, 15 * s * (1 - 0.92 * blink), '#F4F6FF');
    if (blink < 0.6) circle(ctx, e[0] + look[0] * 4.5 * s, e[1] + look[1] * 5 * s, 6.6 * s, '#05060F');
    softDot(gctx, e[0], e[1], 26 * s, '#CFE0FF', 0.25 * (1 - blink));
  }
}
SC.reply = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const dk = ramp(t, c.dark, c.dark + 0.07), still = dk > 0.5;
  meadowWide(t, 0.5 * (1 - dk));
  const tip = mdwBlade(822, 1930, 640, -46, t, 46, '#1C6446');
  const M = { x: 262, y: 836, s: 1.66 }, F = { x: 792, y: 806, s: 1.46 };
  const inlove = ramp(t, c.heart - 0.05, c.heart + 0.2), worry = ramp(t, c.it_gets, c.it_gets + 0.2);
  const his = Math.max(pulseOf(t, c.hisflash, 0.12), inlove * (0.55 + 0.25 * Math.sin(t * 6.2))) * (1 - dk);
  const hers = Math.max(pulseOf(t, [c.herflash], 0.26), inlove * (0.55 + 0.25 * Math.sin(t * 6.2 + 1))) * (1 - dk);
  const mFace = worry > 0.5 ? 'worried' : inlove > 0.5 ? 'love' : t > c.herflash ? 'happy' : 'calm';
  const fFace = worry > 0.5 ? 'worried' : inlove > 0.5 ? 'love' : t > c.hisflash[0] + 0.1 ? 'sweet' : 'calm';
  ffBug(M.x, M.y, M.s, t, { lit: 0.07 + 0.93 * his, tie: true, face: mFace, look: worry > 0.5 ? [0, -0.6] : [1, 0.2], seed: 1, glow: 1.15, still });
  ffBug(F.x, F.y, F.s, t, { lit: 0.07 + 0.93 * hers, lash: true, face: fFace, look: worry > 0.5 ? [0, -0.6] : [-1, -0.2], fly: false, seed: 3, armL: [-8, 10], armR: [10, 2], glow: 1.15, still });
  // the two patterns, written down: his, then hers
  ffStrip(520, 476, 340, [[0.4, 1], [2.4, 1]], 8, t >= c.hisflash[0] ? clamp((t - c.hisflash[0]) / 0.56 + 0.07) : 0, FF.GLOW, ramp(t, c.he - 0.08, c.he + 0.14));
  ffStrip(520, 552, 340, [[4.6, 2]], 8, t >= c.herflash ? clamp(0.6 + (t - c.herflash) / 1.4) : 0, '#FF86A6', ramp(t, c.she - 0.08, c.she + 0.14));
  paint(() => {   // who is who: a bow tie, a set of lashes
    const k1 = ramp(t, c.he - 0.08, c.he + 0.14), k2 = ramp(t, c.she - 0.08, c.she + 0.14);
    if (k1 > 0.5) { for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(318, 476); ctx.lineTo(318 + sd * 20, 464); ctx.lineTo(318 + sd * 20, 488); ctx.closePath(); ctx.fillStyle = '#FF5A6E'; ctx.fill(); } circle(ctx, 318, 476, 6, '#FFD0D6'); }
    if (k2 > 0.5) { ellipse(ctx, 318, 554, 15, 12, '#FFFFFF'); circle(ctx, 318, 555, 6, '#17122A'); for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + (i - 1) * 0.5; line(ctx, 318 + Math.cos(a) * 14, 554 + Math.sin(a) * 12, 318 + Math.cos(a) * 24, 554 + Math.sin(a) * 20, 3, '#FFFFFF'); } }
  });
  if (inlove > 0 && dk < 1) heartIcon(530, 700 - 40 * ramp(t, c.heart, c.heart + 1.6), 1.6 * E.outBack(clamp(inlove), 2.2), 1 - ramp(t, c.it_gets + 0.2, c.dark));
  // ---- "it gets dark": every lamp goes out. Two pairs of eyes
  if (dk > 0) {
    screenSpace();
    ctx.fillStyle = `rgba(1,3,8,${0.95 * dk})`; ctx.fillRect(0, 0, W, H);
    gctx.save(); gctx.globalCompositeOperation = 'destination-out'; gctx.fillStyle = `rgba(0,0,0,${dk})`; gctx.fillRect(0, 0, W, H); gctx.restore();
    const bl = pulseOf(t, [c.dark + 0.32], 0.12);
    eyesInDark(M.x, M.y, M.s, [1, 0], bl, false);
    eyesInDark(F.x, F.y, F.s, [-1, 0], bl, true);
  }
  const cut = 1 - ramp(lt, 0, 0.1);
  return { glow: 0.9, flash: 0.16 * cut, push: { k: 1 + 0.035 * lt / D, cx: 520, cy: 760 } };
};

// ================================================================ the leaf: someone bigger answers
const LEAF = { X: 596, Y: 806, S: 1.85 };
// what she is up to, moment by moment (every shot on the leaf reads this)
function leafState(t) {
  const c = cu();
  const lit0 = ramp(t, c.because - 0.05, c.because + 0.3);
  const slip = ramp(t, c.fake - 0.05, c.fake + 0.12, E.outBack) * (1 - ramp(t, c.fake_end + 0.25, c.fake_end + 0.5, E.inOutCubic));
  const drop = ramp(t, c.and_she - 0.04, c.and_she + 0.4, E.inCubic);                 // the mask is thrown away
  const cutl = ramp(t, c.down - 0.1, c.down + 0.3, E.outBack);                         // cutlery, behind her back
  const armed = ramp(t, c.and_she, c.and_she + 0.25, E.outBack);                       // ... and then in the open
  const ate = t >= c.eats + 0.26;
  const flash = pulseOf(t, [c.fakeflash], 0.26);
  const lit = t < c.and_she ? lit0 * (0.3 + 0.7 * Math.max(flash, 0.28 * (t > c.fakeflash + 0.3 ? 1 : 0))) : 0.55 + 0.15 * Math.sin(t * 5);
  let face = 'evil';
  if (t >= c.eats + 0.05) face = 'chew';
  if (t >= c.burp - 0.02 && t < c.burp + 0.3) face = 'shock';
  if (t >= c.burp + 0.3) face = 'smug';
  return { lit0, slip, drop, cutl, armed, ate, flash, lit, face };
}
function leafBack(t, cam) {
  mdwBack(cam, t, { far: 0.3, glow: 0.3 });
  applyCam(cam);
  mdwLeaf(560, 950, 470, 262, t);
}
function leafHer(t, S, o = {}) {
  const c = cu(), x = o.x === undefined ? LEAF.X : o.x, y = LEAF.Y, s = LEAF.S;
  // cutlery behind her back: the tips show over her shoulders
  if (S.cutl > 0 && S.armed < 0.5) {
    const kf = ffPt(x, y, s, [40, 34 - 50 * S.cutl]), fk = ffPt(x, y, s, [62, 42 - 50 * S.cutl]);
    ffKnife(kf[0], kf[1], s * 0.9, 0.2); ffFork(fk[0], fk[1], s * 0.9, 0.42);
  }
  const maskOn = S.drop < 1;
  const mrot = -0.5 * S.slip, mp = [-24 * S.slip, 6 * S.slip - 58];
  const armL = S.armed > 0.5 ? [-58, -40] : maskOn ? [-44 + mp[0] * 0.6, 44] : undefined;
  const armR = S.armed > 0.5 ? [58, -40] : S.cutl > 0 ? [30, 30] : undefined;
  ffBug(x, y, s, t, { kind: 1, lash: true, fly: false, lit: S.lit, face: o.face || S.face, look: o.look || [-0.6, 0], seed: 5, armL, armR, bib: S.armed, glow: 1.0, still: true });
  if (S.armed > 0.5) {
    const a = ffPt(x, y, s, [58, -40]), b = ffPt(x, y, s, [-58, -40]), wag = 0.1 * Math.sin(t * 9);
    ffKnife(a[0], a[1], s, 0.3 + wag); ffFork(b[0], b[1], s, -0.3 - wag);
  }
  if (maskOn) {
    const m = ffPt(x, y, s, mp);
    ffMask(m[0] + 620 * S.drop, m[1] + 60 * S.drop + 900 * S.drop * S.drop, s, mrot + 5 * S.drop);
  }
}
SC.fake = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, S = leafState(t);
  const cam = { x: 560, y: 850, zoom: 1.1 + 0.05 * lt / D, rot: 0 };
  leafBack(t, cam);
  leafHer(t, S, { look: [-0.4, -0.3] });
  screenSpace();
  // the dark she comes out of
  const dkk = 1 - ramp(t, c.because - 0.05, c.because + 0.35);
  if (dkk > 0) { ctx.fillStyle = `rgba(1,3,8,${0.9 * dkk})`; ctx.fillRect(0, 0, W, H); }
  const P = toScreen(cam, LEAF.X, 448);
  ffStrip(P[0], P[1], 380, [[4.6, 2]], 8, t >= c.fakeflash ? clamp(0.6 + (t - c.fakeflash) / 1.2) : 0, '#FF86A6', ramp(t, c.another - 0.05, c.another + 0.2));
  stamp('FAKE', 262, 640, inv(c.fake, c.fake + 0.14, t) * (1 - ramp(t, c.another + 0.5, c.another + 0.62)), '#FF4D5E', -0.16, 104);
  return { glow: 0.9 };
};
// he comes down with flowers
function suitor(t) {
  const c = cu();
  const k = ramp(t, c.he_flies - 0.05, c.date + 0.1, E.outCubic);
  const x = lerp(96, 268, k), y = lerp(250, 730, k) - 40 * Math.sin(Math.PI * k);
  return { x, y, s: 1.16, k };
}
function leafHim(t, face, look) {
  const m = suitor(t);
  ffBug(m.x, m.y, m.s, t, { tie: true, lit: 0.55 + 0.35 * Math.sin(t * 6.2), face, look: look || [1, 0.2], seed: 1, armR: [44, -6], glow: 1.0 });
  const f = ffPt(m.x, m.y + 6 * Math.sin(t * 8.5 + 1.7), m.s, [44, -6]);
  ffFlowers(f[0], f[1], m.s * 1.05, 0.3);
  return m;
}
SC.date = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, S = leafState(t);
  const cam = { x: 516, y: 836, zoom: 1.04 + 0.04 * lt / D, rot: 0 };
  leafBack(t, cam);
  leafHer(t, S, { look: [-1, -0.2] });
  const m = leafHim(t, 'love');
  screenSpace();
  const P = toScreen(cam, LEAF.X, 448);
  ffStrip(P[0], P[1], 380, [[4.6, 2]], 8, t >= c.fakeflash ? clamp(0.6 + (t - c.fakeflash) / 1.2) : 0, '#FF86A6', 1 - ramp(t, c.he_flies + 0.7, c.he_flies + 0.9));
  const Q = toScreen(cam, m.x + 20, m.y - 190);
  heartIcon(Q[0] + 50, Q[1] - 20 * Math.sin(t * 5), 0.9, m.k > 0.5 ? 1 : 0);
  const cut = 1 - ramp(lt, 0, 0.1);
  return { glow: 0.9, flash: 0.14 * cut };
};
SC.eat = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, S = leafState(t);
  const cam = { x: 500, y: 800, zoom: 1.16, rot: 0 };
  const sh = shake(t, 9 * bumpOf(t, [c.eats], 8), 30, 4); cam.x += sh[0]; cam.y += sh[1];
  leafBack(t, cam);
  const lunge = Math.sin(Math.PI * clamp(inv(c.eats - 0.1, c.eats + 0.3, t)));
  leafHer(t, S, { x: LEAF.X - 150 * lunge, look: S.ate ? [0, 0.2] : [-1, 0] });
  if (!S.ate) leafHim(t, t < c.and_she + 0.12 ? 'love' : 'shock', [1, 0]);
  else {
    // all that is left of him: a bow tie on its way down, and a petal or two
    const d = t - (c.eats + 0.26), bx = 300 + 26 * Math.sin(d * 5), by = 720 + 250 * d + 60 * d * d;
    paint(() => { ctx.save(); ctx.translate(bx, by); ctx.rotate(Math.sin(d * 6) * 0.6); for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(sd * 26, -15); ctx.lineTo(sd * 26, 15); ctx.closePath(); ctx.fillStyle = '#FF5A6E'; ctx.fill(); } circle(ctx, 0, 0, 7, '#FFD0D6'); ctx.restore();
      for (let i = 0; i < 3; i++) circle(ctx, 250 + i * 46 + 16 * Math.sin(d * 4 + i), 700 + 190 * d + i * 30, 8, ['#FF86A6', '#FFD447', '#C8A8FF'][i]); });
  }
  // a small glowing burp
  const bd = t - c.burp;
  if (bd > 0 && bd < 0.7) { const p = ffPt(LEAF.X, LEAF.Y, LEAF.S, [0, -38]); const a = clamp(1 - bd / 0.7); softDot(ctx, p[0] - 30 * bd, p[1] - 150 * bd, 30 + 60 * bd, FF.GLOW, 0.6 * a); softDot(gctx, p[0] - 30 * bd, p[1] - 150 * bd, 50 + 80 * bd, FF.GLOW, 0.7 * a); }
  screenSpace();
  const P = toScreen(cam, 330, 700);
  ffBurst('CHOMP!', P[0], P[1], 200, inv(c.eats, c.eats + 0.1, t) * (1 - ramp(t, c.eats + 0.4, c.eats + 0.52)), '#FF5A6E', '#FFFFFF', -0.1, 9);
  const cut = 1 - ramp(lt, 0, 0.1);
  return { glow: 0.9, flash: 0.14 * cut + 0.3 * bumpOf(t, [c.eats], 14) };
};
SC.why = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, S = leafState(t);
  const cam = { x: 580, y: 780, zoom: 1.3 + 0.06 * lt / D, rot: 0 };
  leafBack(t, cam);
  leafHer(t, S, { face: 'smug', look: [0, 0] });
  return { glow: 0.9, flash: 0.08 * (1 - ramp(lt, 0, 0.1)) };
};

// ---- why: a spider tries one of the males
SC.spider = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  boardBack(t, 0.3);
  screenSpace();
  // a twig to stand on
  ctx.lineCap = 'round'; ctx.lineWidth = 46; ctx.strokeStyle = '#3B2A22'; ctx.beginPath(); ctx.moveTo(-40, 1170); ctx.quadraticCurveTo(540, 1110, 1120, 1190); ctx.stroke();
  paint(() => { ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(120,90,70,0.6)'; ctx.beginPath(); ctx.moveTo(60, 1152); ctx.quadraticCurveTo(540, 1098, 1010, 1168); ctx.stroke(); });
  const lick = ramp(t, c.tastes - 0.08, c.tastes + 0.1, E.outCubic) * (1 - ramp(t, c.awful - 0.06, c.awful + 0.06));
  const sick = ramp(t, c.awful - 0.02, c.awful + 0.25);
  const spit = t >= c.yuck;
  const away = ramp(t, c.yuck + 0.05, c.yuck + 0.6, E.inCubic);
  const sx = 640 + 40 * sick - 16 * lick, sy = 960;
  const mx = 300 - 150 * away, my = 870 - 420 * away;
  ffBug(mx, my, 1.2, t, { tie: true, lit: 0.5 + 0.2 * Math.sin(t * 5), face: sick > 0.5 ? 'smug' : lick > 0.3 ? 'shock' : 'worried', look: [1, 0.1], seed: 1, glow: 0.9 });
  ffSpider(sx, sy, 1.62, t, { face: sick > 0.4 ? 'yuck' : lick > 0.05 ? 'hungry' : 'hungry', look: [-1, -0.1], sick, step: sick > 0.4 ? t * 2.2 : 0 });
  // the lick
  if (lick > 0.02 && sick < 0.4) {
    const a = [sx - 10, sy + 40], b = [lerp(a[0], mx + 60, lick), lerp(a[1], my + 56, lick)];
    paint(() => { ctx.lineCap = 'round'; ctx.lineWidth = 26; ctx.strokeStyle = '#FF7A93'; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo((a[0] + b[0]) / 2, a[1] + 60, b[0], b[1]); ctx.stroke(); circle(ctx, b[0], b[1], 16, '#FF9FB2'); });
  }
  if (spit) { const d = t - c.yuck; paint(() => { for (let i = 0; i < 7; i++) { const a = -2.6 + i * 0.16, v = 380 + 60 * (i % 3); circle(ctx, sx - 30 + Math.cos(a) * v * d, sy + 40 + Math.sin(a) * v * d + 500 * d * d, 9 - i * 0.6, `rgba(170,220,120,${clamp(1.2 - d * 2)})`); } }); }
  ffBurst('YUCK!', 772, 640, 150, spit ? inv(c.yuck, c.yuck + 0.1, t) : ramp(t, c.awful + 0.1, c.awful + 0.24) * 0.0, '#B8F06A', '#1C3A12', 0.08, 6);
  const cut = 1 - ramp(lt, 0, 0.12);
  return { glow: 0.85, flash: 0.22 * cut, push: { k: 1 + 0.04 * lt / D, cx: 540, cy: 900 } };
};
// ---- ... and now the same spider tries her
SC.armour = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, S = leafState(t);
  const cam = { x: 640, y: 836, zoom: 1.0 + 0.03 * lt / D, rot: 0 };
  leafBack(t, cam);
  const aw = ramp(t, c.now - 0.05, c.now + 0.25);
  // what he tasted of, now on her: a sour green air about her
  if (aw > 0) { softDot(ctx, LEAF.X - 80, LEAF.Y + 30, 330, '#9CFF6A', 0.13 * aw); for (const sd of [-1, 1]) ffHeat(LEAF.X - 80 + sd * 250, LEAF.Y + 40, 1.9, aw, t, 2, '#9CFF6A'); }
  leafHer(t, S, { x: LEAF.X - 80, face: t > c.she2 ? 'smug' : 'evil', look: [1, 0.1] });
  const come = ramp(t, shot.start, c.so_does + 0.15, E.inOutSine), go = ramp(t, c.she2 - 0.02, c.she2 + 0.7, E.inCubic);
  const sx = lerp(1330, 904, come) + 480 * go, sy = 872;
  ffSpider(sx, sy, 1.3, t, { face: go > 0.02 ? 'scared' : t > c.so_does ? 'lick' : 'hungry', look: [-1, -0.1], step: t * (go > 0.02 ? 3.4 : 1.6) });
  screenSpace();
  pill(toScreen(cam, LEAF.X - 80, 0)[0], 512, 'TASTES AWFUL TOO', '#9CFF6A', ramp(t, c.now + 0.05, c.now + 0.3), 38);
  const P = toScreen(cam, 880, 610);
  ffBurst('NOPE', P[0], P[1], 120, inv(c.nope, c.nope + 0.1, t), '#FFD447', '#3A0A18', 0.1, 4);
  const cut = 1 - ramp(lt, 0, 0.1);
  return { glow: 0.9, flash: 0.14 * cut };
};

SC.button = (lt, t, shot) => {
  jarDraw(t - TLd.duration, t);
  return { glow: 0.85, capY: 1500, flash: 0.14 * (1 - ramp(lt, 0, 0.12)) };
};

// ---- the cover (cover.jpg: the YouTube thumbnail and the Instagram cover), rendered by cover.sh
SC.cover = (lt, t, shot) => {
  const c = cu(), tt = c.glows + 0.1, cam = { x: 540, y: JAR.HEADY + 440 / 2.5, zoom: 2.5, rot: 0 };
  jarDraw(tt, tt, { cam });
  screenSpace();
  bigWord('HOW DO FIREFLIES', 540, 1238, 80, '#FFFFFF', 1, -0.02);
  bigWord('GLOW?', 540, 1392, 180, FF.GLOW, 1, -0.02);
  softDot(gctx, 540, 1392, 240, FF.GLOW, 0.16);
  return { glow: 0.9, noCaptions: true, noSubscribe: true, grain: 0 };
};

function initScenes2() {
  initMeadow();
}
