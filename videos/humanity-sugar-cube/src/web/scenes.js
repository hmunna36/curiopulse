// All of HUMANITY Fits in a Sugar Cube ☕ Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the
// shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;
const hsShot = (id) => TLd.shots.find((s) => s.id === id);
const bumpAt = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);
const hsMixP = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

// ---------------------------------------------------------------- the light (reference/visual.md "The light")
// the hut cafe at dusk: the pendant lamp and the string lights upper left are the key, the dusk window on the right the
// cool rim; the money shot is night with the planet's glow
const CAFE_LIGHT = { ...LIGHTS.candle, rimAmt: 1.2, pool: 0.55, halo: 0.14 };
const SPACE_LIGHT = { ...LIGHTS.night, rimAmt: 1.0, pool: 0.3 };
setLights({ hook: CAFE_LIGHT, answer: CAFE_LIGHT, atom: CAFE_LIGHT, squash: CAFE_LIGHT, world: SPACE_LIGHT, cube: CAFE_LIGHT,
  weird: CAFE_LIGHT, button: CAFE_LIGHT, loop: CAFE_LIGHT, cover: CAFE_LIGHT });

// ---------------------------------------------------------------- his faces
const HF = {
  sly: { eyeOpen: 0.95, pupil: 1, lookX: -0.6, lookY: 0.6, browY: 0.45, browTilt: 0.6, mouth: 'flat', mouthOpen: 0.2, blink: 0, cross: 0 },
  peer: { eyeOpen: 0.75, pupil: 1.05, lookX: -0.8, lookY: 0.1, browY: 0.2, browTilt: 0.9, mouth: 'o', mouthOpen: 0.25, blink: 0, cross: 0.3 },
  yikes: { eyeOpen: 1.4, pupil: 0.55, lookX: -0.7, lookY: 0, browY: 1.5, browTilt: 0.35, mouth: 'o', mouthOpen: 0.85, blink: 0, cross: 0 },
  down: { eyeOpen: 1.05, pupil: 0.9, lookX: 0.1, lookY: 1, browY: 0.8, browTilt: 0.9, mouth: 'wavy', mouthOpen: 0.3, blink: 0, cross: 0 },
  offended: { eyeOpen: 0.85, pupil: 1, lookX: 0, lookY: 0, browY: -0.25, browTilt: -0.8, mouth: 'flat', mouthOpen: 0, blink: 0.25, cross: 0 },
  wonder: { eyeOpen: 1.2, pupil: 0.85, lookX: -0.6, lookY: 0.8, browY: 1.0, browTilt: 0.3, mouth: 'o', mouthOpen: 0.5, blink: 0, cross: 0 },
  effort: { eyeOpen: 0.5, pupil: 1, lookX: 0, lookY: 0.8, browY: -0.3, browTilt: 1.1, mouth: 'grimace', mouthOpen: 1, blink: 0.6, cross: 0 },
  gulp: { eyeOpen: 1.25, pupil: 0.7, lookX: 0, lookY: 0, browY: 1.2, browTilt: 1.1, mouth: 'wavy', mouthOpen: 0.4, blink: 0, cross: 0 },
  wince: { eyeOpen: 0.6, pupil: 1, lookX: 0.7, lookY: 0.7, browY: 0.9, browTilt: 1.2, mouth: 'grimace', mouthOpen: 1, blink: 0.5, cross: 0 },
};

// ---------------------------------------------------------------- frame 1 and round it (tt = seconds since frame 1;
// negative = the Short's last frames, the button and the loop, so the last frame IS frame 1's picture)
const HS_HOLD = [430, 1168];                      // the cube over the mug on frame 0
const HS_SAUCER_CUBE = [262, 1284];               // the cube sitting on the saucer (it lands there in the cube shot)
function hookA(tt) {
  const c = cu();
  let cube, open = 0, face, headRot = 0.03 * Math.sin(tt * 1.4), headDX = 0;
  if (tt >= 0) {
    // he lowers it toward the coffee... stops on "how many people"... and lifts it up to his eye to inspect it
    const low = ramp(tt, 0, c.how, E.outSine) * (1 - ramp(tt, c.how, c.how + 0.25, E.inOutSine));
    const lift = ramp(tt, c.fit1 - 0.05, c.cube1_end, E.inOutCubic);
    cube = hsMixP([HS_HOLD[0], HS_HOLD[1] + 22 * low], [478, 1050], lift);
    face = lerpFace(HF.sly, HF.peer, ramp(tt, c.people - 0.1, c.people + 0.25));
    headRot += -0.06 * lift; headDX = -4 * lift;
  } else {
    // the button: the cube on the saucer; he picks it up with the tongs ("Still want..."), eyes it ("sugar?"), and holds it
    // over the mug again: frame 1's picture by tt = -0.3
    const grab = ramp(tt, -1.78, -1.42, E.inOutSine);
    const lift = ramp(tt, -1.32, -0.42, E.inOutCubic);
    const above = [HS_SAUCER_CUBE[0], HS_SAUCER_CUBE[1] - 4];
    cube = lift > 0 ? hsMixP(above, HS_HOLD, lift) : above;
    open = 1 - ramp(tt, -1.5, -1.36);
    if (lift <= 0) cube = above;
    face = lerpFace(HF.peer, HF.sly, ramp(tt, -0.75, -0.35));
    face = lerpFace(face, HF.gulp, popK(tt, -1.2, -0.8, 0.12, 0.2) * 0.8);
    headRot += 0.05 * popK(tt, -0.95, -0.6, 0.1, 0.15);       // a tiny shrug of the head on "sugar?"
    if (grab < 1) cube = above;
  }
  const hand = [cube[0] + 8, cube[1] - 96];
  return { cube, open, hand, face, headRot, headDX };
}
// his left (screen-left) arm to a hand point: two equal bones, the elbow always bends OUT to his side (an IK elbow went up
// by his cheek when the hand was near his shoulder; fixed joints made a long forearm)
const HS_SHOULDER_L = [CF.hx - 74 * CF.hs, CF.hy - 370 * CF.hs], HS_BONE = 96;
function hsElbowL(w) {
  const S = HS_SHOULDER_L, dx = w[0] - S[0], dy = w[1] - S[1], d = Math.hypot(dx, dy) || 1;
  if (d >= 2 * HS_BONE - 1) return [S[0] + dx / 2, S[1] + dy / 2];
  const h = Math.sqrt(HS_BONE * HS_BONE - (d / 2) * (d / 2));
  let nx = -dy / d, ny = dx / d;
  if (nx > 0 || (Math.abs(nx) < 0.15 && ny < 0)) { nx = -nx; ny = -ny; }
  return [S[0] + dx / 2 + nx * h, S[1] + dy / 2 + ny * h];
}
function hookCam(tt) {
  return camKeys(tt, [[-1.8, 440, 1206, 2.1], [-0.35, 500, 1130, 2.8], [0, 500, 1130, 2.8], [3.1, 503, 1122, 2.95]]);
}
function hookDraw(tt, t) {
  CF_BGDY = 0;
  const cam = hookCam(tt), A = hookA(tt);
  cfBack(cam, t);
  const tb = cfTable(cam);
  applyCam(cam);
  cfSaucer(ctx, 262, 1310, 1);
  cfMug(ctx, CF.mug[0], CF.mug[1], 1, t);
  const face = cfLook(A.face, [CF.hx, 1030], A.cube, 0.9);
  const r = cfHero(cam, t, { face: Object.assign({}, A.face, { lookX: face.lookX, lookY: face.lookY }), headRot: A.headRot, headDX: A.headDX,
    armL: { e: hsElbowL(A.hand), w: A.hand }, handR: [650, 1300], kindR: 'open', tongs: { p: A.cube, open: A.open }, cube: { p: A.cube } });
  return { cam, A, r };
}
SC.hook = (lt, t, shot) => { hookDraw(t, t); return { glow: 0.75 }; };
SC.button = (lt, t, shot) => { hookDraw(t - TLd.duration, t); return { glow: 0.75 }; };
SC.loop = (lt, t, shot) => { hookDraw(t - TLd.duration, t); return { glow: 0.75 }; };

// ---------------------------------------------------------------- the answer: "All of them, because you're mostly... nothing."
SC.answer = (lt, t, shot) => {
  const c = cu();
  CF_BGDY = 220;                                   // low: the wall slides down, the lights and the ceiling behind him
  const cam = camKeys(t, [[shot.start, 612, 1094, 2.0], [shot.end, 606, 1086, 2.12]]);
  cfBack(cam, t);
  cfTable(cam, { depth: 0.55 });
  applyCam(cam);
  cfSaucer(ctx, 262, 1310, 1);
  cfMug(ctx, CF.mug[0], CF.mug[1], 1, t);
  // "All of them,": he yanks the cube away at arm's length; "mostly...": he looks down at himself; "nothing.": he pats his
  // chest and fluff poofs out of his coat
  const yank = ramp(t, c.all1 - 0.06, c.all1 + 0.16, E.outBack);
  const cube = hsMixP([478, 1050], [418, 1046], yank);
  const down = ramp(t, c.mostly - 0.2, c.mostly + 0.1) * (1 - ramp(t, c.nothing + 0.18, c.nothing + 0.35));
  const pat = bumpAt(t, c.poof, 14) * (t >= c.poof ? 1 : 0);
  const reach = ramp(t, c.because - 0.1, c.mostly + 0.1, E.inOutSine);
  const handR = hsMixP([660, 1300], [604, 1192 - 26 * pat], reach);
  let face = lerpFace(HF.peer, HF.yikes, yank);
  face = lerpFace(face, HF.down, down);
  face = lerpFace(face, HF.offended, ramp(t, c.nothing + 0.12, c.nothing + 0.3));
  const lean = -0.08 * yank * (1 - 0.6 * down);
  const r = cfHero(cam, t, { face, headRot: lean - 0.05 * down, headDX: -6 * yank, handL: [cube[0] + 8, cube[1] - 96], handR, kindR: 'open',
    tongs: { p: cube, open: 0 }, cube: { p: cube },
    after: (lc) => { const k = (t - c.poof) / 0.75; if (k > 0 && k < 1) actor(() => cfPoof(lc, 606, 1196, k, 1.15, 9, 0.45, 1.5, 0)); } });
  return { glow: 0.75 };
};

// ---------------------------------------------------------------- the atom: cotton candy, all fluff, one tiny speck
const HS_BALL = [420, 1172];
SC.atom = (lt, t, shot) => {
  const c = cu();
  CF_BGDY = -200;                                  // high: the wall slides up, more table under him
  const cam = camKeys(t, [[shot.start, 500, 1150, 2.3], [c.one1 - 0.25, 494, 1154, 2.42], [c.speck1 + 0.05, HS_BALL[0], HS_BALL[1], 6.2],
    [shot.end, HS_BALL[0], HS_BALL[1], 6.6]]);
  cfBack(cam, t);
  cfTable(cam, { depth: 1.5 });
  applyCam(cam);
  cfMug(ctx, CF.mug[0] - 70, CF.mug[1] + 60, 1, t);
  cfSaucer(ctx, 702, 1430, 1);
  const grow = ramp(t, c.atom - 0.1, c.candy_end, E.outBack);
  const R = lerp(16, 70, grow);
  const poke = ramp(t, c.poke - 0.1, c.poke + 0.06, E.outCubic) * (1 - ramp(t, c.poke + 0.3, c.poke + 0.6));
  const wob = bumpAt(t, c.poke + 0.32, 6) * (t > c.poke + 0.32 ? 1 : 0);
  const tipX = lerp(HS_BALL[0] + R + 70, HS_BALL[0] + R * 0.45, poke), tipY = HS_BALL[1] - 6;
  let face = lerpFace(HF.wonder, HF.peer, ramp(t, c.all2 - 0.1, c.all2 + 0.2));
  face = Object.assign({}, face, { lookX: -0.75, lookY: 0.85 });
  cfHero(cam, t, { face, headRot: -0.04, handL: [HS_BALL[0] + 6, HS_BALL[1] + R + 60], kindL: 'open',
    armR: { e: [lerp(660, 600, poke), 1262], w: [tipX + 34, tipY + 6] }, kindR: 'point',
    after: (lc) => actor(() => cfFluff(lc, HS_BALL[0], HS_BALL[1], R, t, { poke: [tipX, tipY, poke], wob, speck: ramp(t, c.one1, c.tiny + 0.1) })) });
  // the labels (screen space): 1 ATOM, then the speck: ALL THE WEIGHT (really 100,000x smaller)
  screenSpace();
  const b = toScreen(cam, HS_BALL[0], HS_BALL[1] - R - 24);
  pill(clamp(b[0], 300, 780), Math.max(470, b[1] - 40), '1 ATOM OF YOU', '#8FB8FF', popK(t, c.atom, c.one1 - 0.3));
  const fl = toScreen(cam, HS_BALL[0] - R * 0.7, HS_BALL[1] - R * 0.2);
  pill(clamp(fl[0], 260, 760), clamp(fl[1] - 90, 480, 1060), 'FLUFF', '#FF86A6', popK(t, c.fluff1, c.one1 - 0.2));
  const sp = toScreen(cam, HS_BALL[0], HS_BALL[1]);
  const lk = ramp(t, c.speck1 - 0.05, c.speck1 + 0.15);
  if (lk > 0) {
    thinLeader([sp[0] + 18, sp[1] - 18], [sp[0] + 120, sp[1] - 230], lk, '#FFD447');
    pill(sp[0] + 90, sp[1] - 280, 'ALL THE WEIGHT', '#FFD447', lk);
    pill(sp[0] + 40, sp[1] + 200, 'REALLY 100,000× SMALLER', '#FFFFFF', ramp(t, c.speck1_end - 0.05, c.speck1_end + 0.2), 30);
  }
  return { glow: 0.85 };
};

// ---------------------------------------------------------------- the squash: CLAP, the fluff goes... to a bead
SC.squash = (lt, t, shot) => {
  const c = cu();
  CF_BGDY = 0;
  const cam = camKeys(t, [[shot.start, 560, 1150, 2.4], [shot.end, 560, 1152, 2.55]]);
  cfBack(cam, t);
  cfTable(cam);
  applyCam(cam);
  cfMug(ctx, CF.mug[0], CF.mug[1], 1, t);
  const B = [560, 1242];
  const clap = ramp(t, c.clap - 0.12, c.clap, E.inCubic);
  const open = ramp(t, c.bead - 0.05, c.bead + 0.2, E.outBack);
  const gap = lerp(lerp(118, 22, clap), 74, open);
  const shiver = clap * (1 - open) * 3 * Math.sin(t * 60);
  let face = lerpFace(HF.wonder, HF.effort, clap);
  face = lerpFace(face, HF.yikes, open);
  face = Object.assign({}, face, { lookX: 0, lookY: 0.9 });
  cfHero(cam, t, { face, headRot: 0.02 * shiver, handL: [B[0] - gap - 12, B[1] + 10 + shiver], handR: [B[0] + gap + 12, B[1] + 10 - shiver], kindL: 'open', kindR: 'open',
    front: (lc) => {
      const sq = clamp(clap * 1.05) * (1 - 0.0 * open);
      if (open < 0.5) actor(() => cfFluff(lc, B[0], B[1], 72, t, { sq, wob: 0.3 * clap }));
      const k = (t - c.clap) / 0.6; if (k > 0 && k < 1) { actor(() => { cfPoof(lc, B[0] - 30, B[1] + 10, k, 0.8, 21, Math.PI, 1.0, 0); cfPoof(lc, B[0] + 30, B[1] + 10, k, 0.8, 33, 0, 1.0, 0); }); }
      if (open > 0.02) {   // the bead: what is left of the fluff (it glows)
        circle(lc, B[0], B[1], 6 * open, '#FFF3C4');
        softDot(gctx, B[0], B[1], 40 * open, '#FFD447', 0.9 * open);
      }
    } });
  return { glow: 0.85, zblur: 0.05 * bumpAt(t, c.clap, 10) };
};

// ---------------------------------------------------------------- the world: all eight billion of us... squeezed into one cube
SC.world = (lt, t, shot) => {
  const c = cu();
  const count = ramp(t, c.eight - 0.05, c.billion + 0.35, E.outCubic);
  const tongs = ramp(t, c.tongs_in, c.pinch, E.outCubic);
  const pinch = ramp(t, c.pinch, c.formed - 0.05, E.inOutCubic);
  const sq = ramp(t, c.pinch + 0.04, c.formed, E.inCubic);
  const formed = ramp(t, c.formed - 0.06, c.formed + 0.16);
  const shake = bumpAt(t, c.formed, 8) * (t > c.formed ? 1 : 0);
  wdDraw(t, { push: 1 + 0.05 * lt / (shot.end - shot.start), tongs, pinch, sq, formed, dx: 10 * shake * Math.sin(t * 70), dy: 8 * shake * Math.cos(t * 63) });
  screenSpace();
  // the counter: 8,000,000,000 PEOPLE (it pops out as the squeeze starts)
  const ck = popK(t, c.eight - 0.08, c.pinch + 0.1, 0.1, 0.12);
  if (ck > 0) {
    const n = Math.round(8e9 * count / 1e6) * 1e6;
    bigWord(fmt(n), 540, 600, 120, '#FFD447', ck);
    pill(540, 720, 'EVERYONE ON EARTH', '#7FE9FF', ck, 40);
  }
  return { glow: 1.0 };
};

// ---------------------------------------------------------------- the cube: it lands on his saucer (CLINK)
SC.cube = (lt, t, shot) => {
  const c = cu();
  CF_BGDY = 240;                                   // low, at the table: the wall slides down behind
  const camY = lerp(1060, 1430, ramp(t, shot.start, c.clink, (u) => u * u));
  const cam = { x: 300, y: camY, zoom: 2.5 + 0.1 * ramp(t, c.clink, shot.end), rot: 0 };
  cfBack(cam, t, { noLamp: true });
  cfTable(cam, { depth: 0.5 });
  applyCam(cam);
  cfMug(ctx, CF.mug[0], CF.mug[1], 1, t);
  cfSaucer(ctx, 262, 1310, 1);
  // it whistles down from the top and lands in the gap after "cube."
  const fall = ramp(t, c.in_one, c.clink, (u) => u * u);
  const land = t >= c.clink;
  const bounce = land ? 14 * bumpAt(t, c.clink, 9) * Math.abs(Math.sin((t - c.clink) * 22)) : 0;
  const y = land ? HS_SAUCER_CUBE[1] - bounce : lerp(1000, HS_SAUCER_CUBE[1], fall);
  if (!land) {   // a falling streak
    for (let i = 1; i <= 4; i++) softDot(ctx, HS_SAUCER_CUBE[0], y - i * 22, 16 - i * 3, '#FFFFFF', 0.18);
  }
  // its shadow on the saucer grows as it comes
  ellipse(ctx, HS_SAUCER_CUBE[0], 1312, 28 * (0.4 + 0.6 * fall), 6 * (0.4 + 0.6 * fall), `rgba(40,30,30,${0.25 + 0.3 * fall})`);
  actor(() => cfCube(ctx, HS_SAUCER_CUBE[0], y, 1, { glow: 1, rot: land ? 0.03 * bumpAt(t, c.clink, 6) : 0.4 * (1 - fall) }));
  if (land) {   // a little puff of sugar dust and a ring
    const k = (t - c.clink) / 0.5;
    if (k < 1) for (let i = 0; i < 8; i++) { const a = Math.PI + (i / 7) * Math.PI, d = 30 + 40 * k; circle(ctx, HS_SAUCER_CUBE[0] + Math.cos(a) * d * 1.4, 1306 + Math.sin(a) * d * 0.3, 4 * (1 - k), '#FFFFFF'); }
  }
  screenSpace();
  const s = toScreen(cam, HS_SAUCER_CUBE[0], HS_SAUCER_CUBE[1] - 70);
  pill(clamp(s[0], 300, 760), Math.max(480, s[1] - 60), 'ALL OF US', '#FFD447', ramp(t, c.clink, c.clink + 0.15));
  return { glow: 0.8 };
};

// ---------------------------------------------------------------- the weird fact: just you? a speck... that weighs as much as you
const HS_SCALE = [740, 1300];
SC.weird = (lt, t, shot) => {
  const c = cu();
  CF_BGDY = -160;                                  // high: more table, the scale in front of him
  const cam = camKeys(t, [[shot.start, 640, 1214, 1.96], [c.glass, 648, 1218, 2.02], [shot.end, 650, 1214, 2.1]]);
  cfBack(cam, t);
  cfTable(cam, { depth: 1.35 });
  applyCam(cam);
  cfMug(ctx, CF.mug[0] - 40, CF.mug[1] + 20, 1, t);
  // the scale: counts up on "weighs", then the plate CRUNCHES on "you."
  const kg = 62 * ramp(t, c.count, c.you2, (u) => 1 - Math.pow(1 - u, 3));
  const dent = ramp(t, c.crunch, c.crunch + 0.08);
  const crack = ramp(t, c.crunch, c.crunch + 0.2, E.outCubic);
  cfScale(ctx, HS_SCALE[0], HS_SCALE[1] + 6 * dent, 1, { kg, dent, crack });
  // "Just you?": he points at himself; "A speck...": the magnifier comes over the scale; "you.": he winces
  const point = ramp(t, c.point - 0.1, c.point + 0.1) * (1 - ramp(t, c.glass - 0.2, c.glass + 0.1));
  const gl = ramp(t, c.glass - 0.1, c.speck2 + 0.05, E.outBack);
  const lens = [HS_SCALE[0] + lerp(240, 0, gl), HS_SCALE[1] - 150 + 4 * Math.sin(t * 2.3)];
  let face = lerpFace(HF.gulp, HF.peer, ramp(t, c.glass, c.speck2));
  face = Object.assign({}, face, { lookX: lerp(0, 0.85, ramp(t, c.glass - 0.1, c.glass + 0.2)), lookY: lerp(0, 0.7, ramp(t, c.glass - 0.1, c.glass + 0.2)) });
  face = lerpFace(face, HF.wince, ramp(t, c.crunch - 0.02, c.crunch + 0.1));
  const jolt = bumpAt(t, c.crunch, 10) * (t > c.crunch ? 1 : 0);
  cfHero(cam, t, { face, headRot: -0.06 * jolt + 0.02 * Math.sin(t * 1.3), headDY: -6 * jolt,
    handL: hsMixP([470, 1300], [548, 1196], point), kindL: point > 0.5 ? 'point' : 'open', bendL: -1,
    handR: hsMixP([652, 1296], [lens[0] + 92, lens[1] + 92], gl), kindR: 'open',
    after: (lc) => {
      if (gl > 0.02) actor(() => cfMagnifier(lc, lens[0], lens[1], 70, Math.PI / 4, (cc) => {
        cc.fillStyle = '#E4E9F0'; cc.fillRect(lens[0] - 80, lens[1] - 80, 160, 160);
        cc.fillStyle = '#CDD5DF'; cc.fillRect(lens[0] - 80, lens[1] + 30, 160, 60);
        circle(cc, lens[0], lens[1] + 36, 5.5, '#3A2E2A'); circle(cc, lens[0] - 1.5, lens[1] + 34.5, 1.8, '#9A8A80');
      }));
    } });
  screenSpace();
  const sp = toScreen(cam, lens[0], lens[1] + 36);
  const yk = ramp(t, c.speck2, c.speck2 + 0.15) * (1 - ramp(t, c.crunch + 0.6, c.crunch + 0.75));
  if (yk > 0) { thinLeader([sp[0] - 8, sp[1] - 10], [sp[0] - 120, sp[1] - 200], yk, '#FF9A3C'); pill(sp[0] - 150, sp[1] - 240, 'YOU', '#FF9A3C', yk, 48); }
  // the live reading, big, above the lens (the LCD is small): it climbs on "weighs" and lands on 62 kg
  const rk = ramp(t, c.count - 0.05, c.count + 0.1);
  if (rk > 0) { const lp = toScreen(cam, lens[0], lens[1]); pill(clamp(lp[0] + 40, 330, 770), Math.max(500, lp[1] - 250), `${kg.toFixed(1)} KG`, kg > 61.9 ? '#FF5A6E' : '#FFFFFF', rk, 54); }
  return { glow: 0.8 };
};

// ---------------------------------------------------------------- the cover: the cube held up in the tongs, "8 BILLION / IN HERE?"
SC.cover = (lt, t, shot) => {
  CF_BGDY = 0;
  const cam = { x: 520, y: 1086, zoom: 2.1, rot: 0 };
  cfBack(cam, 0.5, { noLamp: true });
  cfTable(cam);
  applyCam(cam);
  cfSaucer(ctx, 262, 1310, 1);
  cfMug(ctx, CF.mug[0], CF.mug[1], 1, 0.5);
  const cube = [470, 1060];
  cfHero(cam, 0.5, { face: Object.assign({}, HF.peer, { lookX: -0.8, lookY: 0.2 }), headRot: -0.06, armL: { e: hsElbowL([cube[0] + 8, cube[1] - 96]), w: [cube[0] + 8, cube[1] - 96] }, handR: [650, 1300],
    kindR: 'open', tongs: { p: cube, open: 0 }, cube: { p: cube } });
  softDot(gctx, ...toScreen(cam, ...cube), 120, '#BFF0FF', 0.5);
  screenSpace();
  bigWord('8 BILLION', 540, 560, 150, '#FFD447', 1, -0.03);
  bigWord('IN HERE?', 470, 1290, 120, '#FFFFFF', 1, 0.02);
  const cs = toScreen(cam, ...cube);
  thinLeader([470, 1200], [cs[0] - 10, cs[1] + 60], 1, '#FFFFFF');
  return { glow: 0.75, noCaptions: true };
};

function initScenes2() {
  initCafe();
  initWorld();
}
