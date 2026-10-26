// Sharks Are Older Than TREES 🦈 Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
// THE CURIOUS KIND (story.md §6): the hero goes there. He hugs a big tree at the edge of the sea while a shark watches him
// from the water; then the whole shore rewinds to 450 million years ago (no trees, moss to his ankle, sharks already in
// the sea), the first trees burst up, a dinosaur comes and goes, and back in today the shark pops up beside him again.
'use strict';

const cu = () => TLd.cues;
const bumpAt = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);
const r2 = (t, a, b, e = E.inOutCubic) => ramp(t, a, b, e);

// ---------------------------------------------------------------- the light of each place
// a low sun over the sea on the right (LIGHTS.sunset), coloured by the age
const L_TODAY = { ...LIGHTS.sunset, key: [0.55, -0.5, 0.64], halo: 0.1, pool: 0.32, dof: 0.5 };
const L_ORDO = { ...LIGHTS.sunset, key: [0.5, -0.56, 0.64], keyTint: [1.04, 0.95, 1.02], shadowTint: [0.78, 0.66, 0.92], rim: [0.98, 0.58, 0.78], poolTint: [0.4, 0.32, 0.66], pool: 0.4 };
const L_DEVO = { ...LIGHTS.sunset, keyTint: [1.06, 1.02, 0.9], rim: [1.0, 0.72, 0.42], pool: 0.36 };
const L_MESO = { ...LIGHTS.sunset, rim: [1.0, 0.55, 0.3], pool: 0.36 };
function mixLight(a, b, k) {
  const o = Object.assign({}, a);
  for (const key of Object.keys(b)) {
    const x = a[key] === undefined ? LIGHT[key] : a[key], y = b[key];
    if (Array.isArray(y)) o[key] = y.map((v, i) => lerp(x[i], v, k));
    else if (typeof y === 'number') o[key] = lerp(x, y, k);
    else o[key] = k < 0.5 ? x : y;
  }
  return o;
}
setLights({
  hook: L_TODAY, answer: L_TODAY, button: L_TODAY, loop: L_TODAY, cover: L_TODAY,
  rewind: (lt, t) => mixLight(L_TODAY, L_ORDO, rewindK(t)),
  ankle: L_ORDO, sea: L_ORDO,
  payoff: (lt, t) => mixLight(L_ORDO, L_DEVO, r2(t, cu().trees4, cu().later_end)),
  watched: L_DEVO, dinos: L_MESO, five: L_MESO,
});

// ---------------------------------------------------------------- the ages of the shore
const TODAY = () => ({ pal: shPal('today'), modern: 1, grass: 1, rocks: 0.12, moss: 0, devo: 0, sunX: 940, sunH: 150 });
function rewindK(t) { const c = cu(); return r2(t, c.rewind + 0.15, c.years1, E.inOutSine); }
function rewindS(t) {
  const c = cu(), k = rewindK(t);
  return { pal: shPal('today', 'ordo', k), modern: 1 - r2(t, c.rewind + 0.05, c.half + 0.2, E.inOutSine),
    grass: 1 - r2(t, c.almost, c.billion), rocks: lerp(0.12, 1, r2(t, c.half, c.years1)), moss: r2(t, c.billion, c.years1_end),
    devo: 0, sunX: 940 - 120 * k, sunH: 150 + 140 * Math.sin(Math.PI * k), clouds: -2600 * E.inOutSine(k) };
}
const ORDO = (t) => ({ pal: shPal('ordo'), modern: 0, grass: 0, rocks: 1, moss: 1, devo: 0, sunX: 820, sunH: 150, clouds: -2600 + 9 * t });

// the whole shore. o: {cam, S, big: the big tree's growth (crown in the set), behind(cam), hero(cam), after(cam), sharks: []}
function shoreDraw(t, o) {
  const cam = o.cam, S = o.S;
  const sky = shSky(cam, t, S);
  shSea(cam, t, S, sky.sun);
  shLand(cam, t, S);
  shForest(cam, t, S);
  shFirstForest(cam, t, S, false);
  applyCam(cam);
  if (o.big > 0) bigCrown(ctx, o.big, t, S.pal);
  if (o.behind) { applyCam(cam); o.behind(cam, sky); }
  let Hr = null;
  if (o.hero) { applyCam(cam); Hr = o.hero(cam, sky); }
  applyCam(cam);
  if (o.after) { o.after(cam, sky); applyCam(cam); }
  shFirstForest(cam, t, S, true);
  return { sky, Hr };
}

// ---------------------------------------------------------------- the hero
const HERO = { x: 520, y: SH.gy, s: 1 };
// the hug: elbows and wrists round the big trunk (world), the way an arm wraps round something in front of him
const HUG = { eL: [408, 1302], wL: [534, 1268], eR: [648, 1334], wR: [598, 1304] };
const HF = {
  bliss: Object.assign({}, FACES.grin, { blink: 1, mouthOpen: 0.22, browY: 0.35, browTilt: -0.15 }),
  peek: Object.assign({}, FACES.calm, { blink: 0, lookX: 1, lookY: -0.2, browY: 0.6, browTilt: 0.3, mouth: 'flat', mouthOpen: 0.1 }),
  huh: Object.assign({}, FACES.confused, { lookX: 1, lookY: -0.4, browY: 0.9 }),
  startled: Object.assign({}, FACES.startled, { lookX: 0, lookY: 0.6 }),
  empty: Object.assign({}, FACES.startled, { lookX: 0.2, lookY: 1, mouth: 'o', mouthOpen: 0.5 }),
  dazed: Object.assign({}, FACES.dazed),
  look: Object.assign({}, FACES.calm, { lookX: -1, lookY: -0.1, browY: 0.7, mouth: 'flat', mouthOpen: 0 }),
  lookR: Object.assign({}, FACES.calm, { lookX: 1, lookY: -0.1, browY: 0.7, mouth: 'flat', mouthOpen: 0 }),
  down: Object.assign({}, FACES.calm, { lookX: 0.4, lookY: 1, browY: 0.5, mouth: 'o', mouthOpen: 0.3 }),
  wow: Object.assign({}, FACES.startled, { lookX: 0.15, lookY: -1, mouth: 'o', mouthOpen: 0.75, browY: 1.3 }),
  side: Object.assign({}, FACES.calm, { lookX: 1, lookY: -0.5, browY: 0.2, browTilt: -0.3, mouth: 'flat', mouthOpen: 0, blink: 0.2 }),
};
// A = {x, y, s, hug 0..1 (arms round the trunk), face, headRot, headDX, headDY, tree: the big trunk's growth (0 = none),
//      topple (radians, about his feet), pose (when not hugging), squat 0..1, arm overrides armL/armR {e, w}}
function heroDraw(cam, t, A) {
  const st = { x: A.x, y: A.y, s: A.s || 1, face: A.face, headRot: A.headRot || 0, headDX: A.headDX || 0, headDY: A.headDY || 0, blink: 0 };
  let pose = A.pose || JSON.parse(JSON.stringify(POSES.stand));
  const loc = (p) => ikLocal(st, p[0], p[1]);
  if (A.hug > 0) {
    const base = A.pose || POSES.stand;
    const restL = { e: [-96, -300], w: [-104, -210] }, restR = { e: [96, -300], w: [104, -210] };
    const hl = armMix(restL, { e: loc(HUG.eL), w: loc(HUG.wL) }, A.hug), hr = armMix(restR, { e: loc(HUG.eR), w: loc(HUG.wR) }, A.hug);
    pose = armAt(armAt(base, 'L', hl.e, hl.w), 'R', hr.e, hr.w);
  }
  if (A.armL) pose = armAt(pose, 'L', A.armL.e, A.armL.w);
  if (A.armR) pose = armAt(pose, 'R', A.armR.e, A.armR.w);
  st.pose = pose;
  const tree = A.tree || 0;
  const r = charLayer(cam, st, t, {
    pal: PAL,
    pre: (lc) => {
      if (A.topple) { lc.translate(A.x + (A.toppleX || 0), A.y); lc.rotate(A.topple); lc.translate(-A.x - (A.toppleX || 0), -A.y); }
    },
    post: (lc, r, st2) => {
      if (A.postBefore) A.postBefore(lc, r, st2);
      if (tree > 0.005) {
        bigTrunk(lc, tree, t, null);
        if (A.sticker > 0) newKid(lc, BIG.x + 20 + (A.stickerDX || 0), 982 + (A.stickerDY || 0), 0.95, 0.07 + (A.stickerRot || 0), A.sticker);
        // his forearms and hands wrap round the FRONT of the trunk, and his cheek is on it: drawn again over it
        actor(() => {
          lc.save(); lc.translate(st2.x, st2.y); lc.scale(st2.s, st2.s);
          for (const k of ['L', 'R']) {
            const el = r['el' + k], wr = r['wr' + k], d = r['armDir' + k];
            capsuleShaded(lc, el, wr, 38, PAL.coat, PAL.coatSh, PAL.coatHi, PAL);
            line(lc, wr[0] - d[0] * 6, wr[1] - d[1] * 6, wr[0] + d[0] * 2, wr[1] + d[1] * 2, 42, PAL.coatSh);
            drawHand(lc, wr, d, 'open', PAL, k === 'L' ? -1 : 1, t);
          }
          drawHead(lc, r, st2.face, st2, PAL, t);
          lc.restore();
        });
      }
      if (A.postAfter) A.postAfter(lc, r, st2);
    },
  });
  // cut him (and the trunk on his layer) out of the glow layer: no glint or sun shines through him
  gctx.save(); gctx.setTransform(1, 0, 0, 1, 0, 0); gctx.globalCompositeOperation = 'destination-out';
  gctx.drawImage(layerC, 0, 0, W / 2, H / 2); gctx.restore();
  return r;
}
// the rig's head centre in world units (for hearts, tags)
function heroHeadW(A) { return [A.x + (A.headDX || 0), A.y - 470 * (A.s || 1) + (A.headDY || 0)]; }

// ================================================================ today: the hook, the answer, the button (one state)
// tt = seconds since frame 1. Negative tt = the end of the Short (the button): the state blends into frame 1's.
const TIGHT = [565, 1231, 2.7], MED = [590, 1215, 1.95];
const SHARK0 = { x: 779, y: 1310, s: 0.85, flip: -1, rot: -0.95 };
const SHARK_YW = 1490;
function presentA(tt) {
  const c = cu(), D = TLd.duration;
  const A = { x: HERO.x, y: HERO.y, s: 1, hug: 1, tree: 1, face: HF.bliss, headRot: 0.18, headDX: -45, headDY: 8, sticker: 0 };
  const K = { rise: 1, look: [-0.9, -0.15], blink: 0, brow: 0, browL: 0, grin: 0.3, smirk: 0.2, fin: 0.55, tilt: 0, dy: 0, dx: 0 };
  let heart = 0, squeeze = 0, splash = -1, stickerOff = 0;
  if (tt >= 0) {
    // the hook: he hugs, eyes shut; the shark stares. "sharks,": it tilts its head; "or TREES?": he squeezes (a heart)
    const lean = r2(tt, c.older - 0.1, c.older + 0.25) * (1 - r2(tt, c.sharks1 - 0.1, c.sharks1 + 0.15));
    const me = r2(tt, c.sharks1 - 0.08, c.sharks1 + 0.12, E.outBack) * (1 - r2(tt, c.or - 0.05, c.or + 0.15));
    const roll = r2(tt, c.trees1 + 0.05, c.trees1 + 0.3) * (1 - r2(tt, c.sharks2 - 0.25, c.sharks2 - 0.05));
    K.tilt = 0.05 * lean + 0.1 * me;
    K.dx = -16 * lean;
    K.blink = 0.42 * lean;
    K.fin = 0.55;
    K.brow = me * (0.75 + 0.55 * Math.sin((tt - c.sharks1) * 22)) - 0.5 * roll + 0.3 * lean;   // "sharks,": a proud eyebrow waggle
    K.browL = -0.3 * roll;
    K.look = [lerp(-0.9, 0.15, roll), lerp(-0.15, -1, roll)];
    K.grin = lerp(0.3, 0.95, me);
    squeeze = Math.sin(Math.PI * clamp(inv(c.trees1 - 0.05, c.heart + 0.35, tt)));
    heart = popK(tt, c.heart, c.sharks2 + 0.6);
    // the answer: "Sharks.": it rises a little, grins, one brow up; "Trees are the new kids.": the sticker slaps on, he opens
    // his eyes onto it, then a look at the shark
    const up = r2(tt, c.sharks2 - 0.15, c.sharks2 + 0.25, E.outBack);
    K.dy = -18 * up; K.grin = lerp(K.grin, 1, up) * (1 - 0.6 * r2(tt, c.trees2 - 0.1, c.trees2 + 0.2)); K.smirk = 0.2 + 0.8 * r2(tt, c.trees2 - 0.1, c.trees2 + 0.2);
    K.brow = lerp(K.brow, 0.9, up); K.look = [lerp(K.look[0], -0.2, up), lerp(K.look[1], 0.25, up)];
    A.sticker = clamp(inv(c.slap, c.slap + 0.22, tt));
    let f = HF.bliss;
    f = lerpFace(f, HF.peek, r2(tt, c.slap + 0.08, c.slap + 0.24));
    f = lerpFace(f, HF.side, r2(tt, c.slap + 0.42, c.slap + 0.6) * (1 - r2(tt, c.rewind - 0.1, c.rewind + 0.1)));
    A.face = f;
    A.headDX += -8 * r2(tt, c.slap + 0.08, c.slap + 0.24); A.headRot -= 0.1 * r2(tt, c.slap + 0.08, c.slap + 0.24);
  } else {
    // the button (tt from about -4.1): he hugs his tree again, the NEW KID sticker still on it; "the new kid.": one eye on it;
    // the shark pops back up beside him with a splash that knocks the sticker off; then he shuts his eyes: frame 1
    const tS = c.so - D, tH = c.hugging - D, tN = c.new2 - D, tP = c.pop - D;
    K.rise = r2(tt, tP - 0.05, tP + 0.3, E.outBack);
    K.blink = r2(tt, tP + 0.3, tP + 0.36) * (1 - r2(tt, tP + 0.4, tP + 0.46));
    squeeze = Math.sin(Math.PI * clamp(inv(tS + 0.3, c.tree5_end - D + 0.35, tt)));
    A.sticker = 1;
    stickerOff = clamp(inv(tP + 0.1, tP + 0.42, tt));
    splash = tt - tP;
    let f = HF.bliss;
    f = lerpFace(f, Object.assign({}, HF.peek, { blink: 0.25, lookX: 0.6, lookY: -1 }), r2(tt, tN - 0.25, tN) * (1 - r2(tt, tP + 0.05, tP + 0.25)));
    f = lerpFace(f, Object.assign({}, HF.startled, { lookX: 1, lookY: -0.2 }), popK(tt, tP + 0.05, tP + 0.45, 0.08, 0.15));
    A.face = f;
  }
  A.headDY += 4 * squeeze; A.headRot += 0.04 * squeeze;
  return { A, K, heart, squeeze, splash, stickerOff };
}
function presentCam(tt) {
  const c = cu(), D = TLd.duration;
  let k;
  if (tt >= 0) {
    k = camKeys(tt, [[0, ...TIGHT], [c.sharks1, TIGHT[0] + 14, TIGHT[1] - 6, TIGHT[2] + 0.06], [c.heart + 0.1, TIGHT[0] + 6, TIGHT[1], TIGHT[2] + 0.1],
      [c.sharks2 + 0.5, ...MED], [c.kids_end, MED[0] - 6, MED[1] - 30, MED[2] + 0.12], [7.5, MED[0] - 10, MED[1] - 36, MED[2] + 0.16]]);
  } else {
    k = camKeys(tt, [[c.so - D - 0.2, 600, 1220, 1.5], [c.hugging - D, MED[0], MED[1], MED[2] + 0.1], [c.pop - D + 0.12, MED[0] - 4, MED[1] + 4, MED[2] + 0.16], [-0.25, ...TIGHT], [0, ...TIGHT]]);
  }
  return k;
}
function presentDraw(tt, t, o = {}) {
  const st = presentA(tt), cam = o.cam || presentCam(tt), S = Object.assign(TODAY(), { clouds: 9 * t });
  const { A, K } = st;
  const sk = Object.assign({}, SHARK0);
  const shk = { flip: sk.flip, rot: sk.rot + K.tilt, look: K.look, blink: K.blink, brow: K.brow, browL: K.browL, grin: K.grin, smirk: K.smirk, fin: K.fin };
  const sy = sk.y + K.dy + (1 - K.rise) * 420;
  const out = shoreDraw(t, {
    cam, S, big: 1,
    after: (cam2, sky) => {   // the shark is beside him, never over him: drawn after him, so it is sharp
      if (K.rise > 0.02) skShark(ctx, sk.x + K.dx, sy, sk.s, t, shk);
      skWaterFront(cam2, t, S, sky.sun, sk.x - 40, SHARK_YW, 170, { deep: 380, ring: 100 * K.rise + 30, x0: BIG.x + 150 });
      if (st.splash >= 0) skSplash(ctx, sk.x - 90, SHARK_YW, clamp(st.splash / 0.7), 0.9, S.pal.foam, 11);
    },
    hero: (cam2) => heroDraw(cam2, t, Object.assign({}, A, {
      sticker: A.sticker * (1 - (st.stickerOff >= 1 ? 1 : 0)),
      stickerDX: 260 * E.inCubic(st.stickerOff), stickerDY: -160 * Math.sin(Math.PI * st.stickerOff) + 380 * E.inCubic(st.stickerOff),
      stickerRot: 3 * st.stickerOff,
    })),
  });
  // the heart (screen space) by his head
  if (st.heart > 0) { const hp = toScreen(cam, ...heroHeadW(A)); heartIcon(hp[0] + 150, hp[1] - 190 - 30 * st.heart, 1.1 * E.outBack(st.heart), 1); }
  return { cam, out, st };
}

SC.hook = (lt, t) => {
  const { cam } = presentDraw(t, t);
  return { glow: 0.8, push: { k: 1, cx: 540, cy: 900 } };
};
SC.answer = (lt, t) => {
  presentDraw(t, t);
  return { glow: 0.8 };
};
SC.button = (lt, t) => {
  presentDraw(t - TLd.duration, t);
  return { glow: 0.8 };
};
SC.loop = (lt, t) => {
  presentDraw(t - TLd.duration, t);
  return { glow: 0.8 };
};

// ================================================================ the rewind: today drains back to 450 million years ago
SC.rewind = (lt, t) => {
  const c = cu(), S = rewindS(t);
  const big = 1 - r2(t, c.billion - 0.06, c.billion_end + 0.02, E.inCubic);
  // him: still hugging (eyes shut) while the tree un-grows out of his arms; "years.": his eyes open on empty arms, a wobble...
  // and he tips over into the space where the tree was: FLOMP (in the gap)
  const A = { x: HERO.x, y: HERO.y, s: 1, hug: 1, tree: big, face: HF.bliss, headRot: 0.18, headDX: -53, headDY: 8 };
  let f = lerpFace(HF.bliss, HF.empty, r2(t, c.years1 - 0.05, c.years1 + 0.12));
  f = lerpFace(f, HF.startled, r2(t, c.flomp - 0.3, c.flomp - 0.15));
  A.face = f;
  const wob = Math.sin((t - c.years1) * 16) * 0.05 * r2(t, c.years1 + 0.15, c.years1 + 0.3) * (1 - r2(t, c.flomp - 0.28, c.flomp - 0.2));
  A.topple = wob - 1.45 * E.inCubic(clamp(inv(c.flomp - 0.28, c.flomp, t)));   // he faints backward, onto the bare rock
  A.headRot = lerp(0.08, -0.1, r2(t, c.years1, c.years1 + 0.2));
  A.headDX = lerp(-53, 0, r2(t, c.years1, c.years1 + 0.2));
  const cam = camKeys(t, [[c.rewind - 0.1, MED[0] - 10, MED[1] - 36, MED[2] + 0.16], [c.almost + 0.3, 610, 1010, 0.92], [c.billion - 0.3, 600, 1040, 0.95],
    [c.years1, 520, 1230, 1.28], [c.flomp - 0.05, 420, 1300, 1.2], [c.flomp + 0.3, 400, 1320, 1.22]]);
  const sk = SHARK0;
  shoreDraw(t, {
    cam, S, big,
    hero: (cam2) => heroDraw(cam2, t, A),
    after: (cam2, sky) => {
      skShark(ctx, sk.x, sk.y - 29, sk.s, t, { flip: -1, rot: sk.rot, look: [-0.6, -0.9 + 1.2 * r2(t, c.billion, c.years1)], smirk: 1, brow: 0.6, grin: 0.3, fin: 0.55 });
      skWaterFront(cam2, t, S, sky.sun, sk.x - 40, SHARK_YW, 170, { deep: 380, ring: 130, x0: BIG.x + 150 });
      applyCam(cam2);
      shDust(ctx, HERO.x - 280, HERO.y - 10, clamp((t - c.flomp) / 0.45), 1.2, S.pal.rock, 5);
    },
  });
  // the counter spins up to 450,000,000 (drawn over the effects: crisp)
  const val = 450e6 * E.inOutSine(r2(t, c.rewind + 0.05, c.years1 - 0.1, E.inOutSine));
  const vhsK = 0.06 * (1 - r2(t, c.years1 - 0.3, c.years1));
  return { glow: 0.85, vhs: vhsK, blur: [-60 * vhsK, 0], overlay: () => yearsHud(ramp(t, c.rewind - 0.05, c.rewind + 0.2), val, 'rw', t) };
};

// ================================================================ 450 million years ago: no trees anywhere; moss to his ankle
const TUFT = [622, 1570];
function tuftDraw(c, x, y, s, t) {
  // a mat of moss with a few tiny forked stalks: the tallest life on land
  shMossPatch(c, x - 4, y + 2, 34 * s, 31);
  const r = mulberry32(5);
  for (let i = 0; i < 5; i++) {
    const bx = x - 18 * s + i * 9 * s, hh = (18 + 9 * r()) * s, sw = 1.4 * Math.sin(t * 2 + i);
    line(c, bx, y - 4 * s, bx + sw, y - hh, 2.4 * s, '#5C8E3A');
    line(c, bx + sw, y - hh, bx + sw - 4 * s, y - hh - 6 * s, 2 * s, '#5C8E3A');
    line(c, bx + sw, y - hh, bx + sw + 4 * s, y - hh - 6 * s, 2 * s, '#5C8E3A');
    circle(c, bx + sw - 4 * s, y - hh - 7 * s, 2.6 * s, '#C49A4A'); circle(c, bx + sw + 4 * s, y - hh - 7 * s, 2.6 * s, '#C49A4A');
  }
}
SC.ankle = (lt, t) => {
  const c = cu(), S = ORDO(t);
  // he lies flat where he fell, pops up, looks round (a hand shading his eyes); then the camera drops to his boot: the tuft
  const up = r2(t, c.no - 0.12, c.no + 0.25, E.outBack);
  const A = { x: HERO.x, y: HERO.y, s: 1, face: HF.dazed, topple: -1.45 * (1 - up), headRot: 0, headDX: 0 };
  A.pose = lerpPose(POSES.fall, POSES.stand, up);
  let f = lerpFace(HF.dazed, HF.look, r2(t, c.no + 0.1, c.trees3));
  f = lerpFace(f, HF.lookR, r2(t, c.anywhere + 0.1, c.anywhere + 0.4));
  f = lerpFace(f, HF.down, r2(t, c.the_tallest - 0.1, c.tallest));
  A.face = f;
  const sq = 0;
  const shade = r2(t, c.no + 0.2, c.no + 0.45) * (1 - r2(t, c.the_tallest - 0.2, c.the_tallest + 0.1));
  if (shade > 0) A.armR = armMix({ e: [96, -300], w: [104, -210] }, { e: [96, -440], w: [30, -505] }, shade);
  if (sq > 0) {
    const P = JSON.parse(JSON.stringify(A.pose));
    P.hipY = lerp(-222, -98, sq); P.lean = 0.12 * sq;
    P.legL = { a: lerp(0.07, 1.25, sq), b: lerp(0, -2.35, sq) }; P.legR = { a: lerp(0.07, 1.25, sq), b: lerp(0, -2.35, sq) };
    A.pose = P;
    const tl = ikLocal({ x: A.x, y: A.y, s: 1 }, TUFT[0] - 40, TUFT[1] - 30), tr = ikLocal({ x: A.x, y: A.y, s: 1 }, TUFT[0] + 30, TUFT[1] - 26);
    A.armL = armMix({ e: [-96, -300], w: [-104, -210] }, { e: [-60, -150], w: [tl[0] - 10, tl[1]] }, sq);
    A.armR = armMix({ e: [96, -300], w: [104, -210] }, { e: [150, -130], w: [tr[0] + 10, tr[1]] }, sq);
    A.headRot = 0.5 * sq; A.headDX = 40 * sq;
  }
  const cam = camKeys(t, [[c.no - 0.15, 400, 1320, 1.22], [c.no + 0.4, 500, 1150, 1.0], [c.anywhere_end, 480, 1140, 0.98], [c.plant, 560, 1470, 2.5],
    [c.came1 + 0.2, 592, 1520, 3.9], [c.ankle_end + 0.3, 594, 1522, 4.1]]);
  shoreDraw(t, {
    cam, S, big: 0,
    hero: (cam2) => heroDraw(cam2, t, A),
    after: () => { applyCam(cam); tuftDraw(ctx, TUFT[0], TUFT[1], 1, t); },   // the subject of the beat: after him, sharp
  });
  // the TALLEST PLANT tag, with a dashed line from the moss's top to his ankle
  const kT = r2(t, c.tag1, c.tag1 + 0.25, E.outBack), kN = r2(t, c.tagT, c.tagT + 0.25, E.outBack);
  return { glow: 0.8, overlay: () => {
    if (kN > 0) {
      const a = toScreen(cam, HERO.x + 36, 1543), b = toScreen(cam, TUFT[0] + 30, 1543);
      screenSpace(); if (kT > 0) { ctx.setLineDash([12, 9]); line(ctx, a[0], a[1], lerp(a[0], b[0], clamp(kT)), b[1], 5, rgba('#FFD447', 0.95)); ctx.setLineDash([]); }
      shTag('TALLEST PLANT', 540, a[1] - 420, kN, '#4DFFB4', 'ON LAND', [toScreen(cam, TUFT[0], 1548)[0], a[1] - 30]);
    }
    yearsHud(1 - r2(t, c.no + 0.3, c.no + 0.6), 450e6, 'rw', t);
    shTag('450 MILLION', 540, 560, popK(t, c.no + 0.45, c.the_tallest - 0.1), '#C8A8FF', 'YEARS AGO');
  } };
};

// ================================================================ the sea already had sharks
SC.sea = (lt, t, shot) => {
  const c = cu(), S = ORDO(t);
  const cam = camKeys(t, [[shot.start, 640, 1230, 1.05], [shot.start + 0.35, 1080, 1250, 1.3], [c.wave + 0.3, 1100, 1262, 1.38]], E.outCubic);
  const whip = 1 - r2(t, shot.start, shot.start + 0.38);
  const surf = r2(t, c.already - 0.1, c.already + 0.3, E.outBack);
  const fin = 0.9 * Math.sin(Math.PI * clamp(inv(c.wave - 0.05, c.wave + 0.55, t)) * 2) * r2(t, c.wave - 0.05, c.wave + 0.05);
  const K = { x: 1060, y: 1418 + (1 - surf) * 380, flip: -1, rot: -0.75 };
  shoreDraw(t, {
    cam, S, big: 0,
    behind: (cam2, sky) => {
      // fins circling further out
      for (let i = 0; i < 3; i++) {
        const ph = t * 1.4 + i * 2.1, fx = 1200 + 300 * Math.cos(ph) - i * 60, fy = 1250 + 40 * Math.sin(ph) + i * 22;
        skFin(ctx, fx, fy, 0.55 + 0.1 * i, t, -Math.sin(ph) >= 0 ? 1 : -1, SK_PAL, S.pal.foam);
      }
      skShark(ctx, K.x, K.y, 1, t, { flip: K.flip, rot: K.rot, look: [-0.8, 0.15], grin: 0.15 * surf, smirk: 0.8, brow: 0.5, fin: fin + 0.1, blink: bumpAt(t, c.wave + 0.6, 12) > 0.4 ? 1 : 0 });
      skWaterFront(cam2, t, S, sky.sun, K.x - 60, 1530, 200, { deep: 380, ring: 160 });
      skSplash(ctx, K.x - 80, 1530, clamp((t - c.already + 0.05) / 0.7), 1, S.pal.foam, 4);
    },
  });
  return { glow: 0.8, blur: [70 * whip, 0], overlay: () => shTag('EARLY SHARKS', 540, 620, popK(t, c.sharks3 + 0.05, shot.end + 1), '#8FB8FF', '~450 MILLION YEARS AGO') };
};

// ================================================================ about sixty million years later: the first trees
SC.payoff = (lt, t, shot) => {
  const c = cu(), kD = r2(t, c.trees4, c.later_end);
  const S = { pal: shPal('ordo', 'devo', kD), modern: 0, grass: 0, rocks: 1, moss: 1, sunX: 820, sunH: 150 + 30 * kD, clouds: -2600 + 9 * t,
    devo: r2(t, c.trees4 - 0.15, c.later + 0.1, E.inOutSine) };
  const A = { x: HERO.x, y: HERO.y, s: 1, face: lerpFace(HF.down, HF.wow, r2(t, c.trees4, c.trees4 + 0.3)), pose: lerpPose(POSES.stand, POSES.flinch, 0.25 * r2(t, c.trees4, c.trees4 + 0.3)) };
  A.headDY = -6;
  const cam = camKeys(t, [[shot.start, 480, 1290, 1.3], [c.showed, 470, 1150, 1.1], [c.million, 330, -40, 0.74], [c.later_end + 0.15, 320, -120, 0.74]], E.inOutSine);
  shoreDraw(t, { cam, S, big: 0, hero: (cam2) => heroDraw(cam2, t, A), after: () => {
    const g0 = S.devo;
    SH_DEVO.forEach(([x, by, h, seed, delay], i) => {
      const t0 = c.trees4 - 0.15 + (delay * 0.45) * (c.later + 0.25 - c.trees4);
      shDust(ctx, x, by, clamp((t - t0) / 0.6), 1.6, '#9C8E80', 20 + i);
    });
  } });
  const val = lerp(450e6, 390e6, r2(t, c.trees4 - 0.05, c.later_end, E.inOutSine));
  return { glow: 0.8, zblur: 0.05 * popK(t, c.trees4 - 0.05, c.sixty, 0.1, 0.3), overlay: () => {
    yearsHud(r2(t, shot.start, shot.start + 0.2), val, 'ff', t);
    shTag('FIRST TREES', 540, 840, popK(t, c.million + 0.05, shot.end + 1), '#4DFFB4', '~390 MILLION YEARS AGO');
  } };
};

// ================================================================ and the sharks watched
const WATCHERS = [[700, 1436, 0.98, -1.05], [930, 1462, 1.06, -1.1], [1150, 1446, 0.96, -1.0]];
SC.watched = (lt, t, shot) => {
  const c = cu(), S = { pal: shPal('devo'), modern: 0, grass: 0.15, rocks: 0.9, moss: 1, devo: 1, sunX: 900, sunH: 170, clouds: -2400 + 9 * t };
  const cam = camKeys(t, [[shot.start, 770, 1150, 0.98], [shot.end, 830, 1220, 1.24]], E.inOutSine);
  const turn = r2(t, c.turn - 0.05, c.turn + 0.4, E.inOutSine), up = r2(t, shot.start, c.watched, E.inOutSine);
  shoreDraw(t, {
    cam, S, big: 0,
    behind: (cam2, sky) => {
      WATCHERS.forEach(([x, yw, s, rot], i) => {
        const bob = 6 * Math.sin(t * 2 + i);
        const lk = [lerp(-0.85, -0.1, turn), lerp(lerp(-0.35, -1, up), 0.15, turn)];
        skShark(ctx, x, yw - 150 * s + bob, s, t, { flip: -1, rot: lerp(rot - 0.14 * up, rot + 0.25, turn), look: lk, smirk: 0.3, brow: lerp(0.8, -0.2, turn), fin: 0.5,
          blink: bumpAt(t, c.turn + 0.2 + i * 0.05, 12) > 0.4 ? 1 : 0 });
        skWaterFront(cam2, t, S, sky.sun, x - 40 * s, yw + 18, 200 * s, { deep: 520, ring: 110 * s, dx: -10 * s });
      });
    },
  });
  return { glow: 0.8 };
};

// ================================================================ dinosaurs came... and went
SC.dinos = (lt, t, shot) => {
  const c = cu(), boomed = t >= c.boom;
  const S = { pal: shPal('meso'), modern: 0.0, grass: 0.5, rocks: 0.6, moss: 0.7, devo: 1, sunX: 940, sunH: 180, clouds: -2000 + 9 * t };
  const cam = camKeys(t, [[shot.start, 600, 1120, 0.95], [c.boom, 640, 1150, 1.0], [shot.end, 650, 1160, 1.04]], E.inOutSine);
  const walkK = r2(t, shot.start, c.came2_end, E.outCubic);
  const D0 = { x: lerp(-760, 300, walkK), y: SH.gy - 60, s: 0.66 };
  const bend = r2(t, c.came2 - 0.1, c.came2_end + 0.35, E.inOutSine);
  const SK = { x: 1010, y: 1390, flip: -1, rot: -0.85 };
  shoreDraw(t, {
    cam, S, big: 0,
    behind: (cam2, sky) => {
      skShark(ctx, SK.x, SK.y, 0.9, t, { flip: SK.flip, rot: SK.rot, look: boomed ? [0, 0.1] : [-0.95, -0.4 + 0.5 * bend], smirk: 0.6, brow: boomed ? 0.9 : 0.3,
        blink: bumpAt(t, c.boom + 0.32, 10) > 0.4 ? 1 : 0 });
      skWaterFront(cam2, t, S, sky.sun, SK.x - 60, 1488, 180, { deep: 380, ring: 140 });
      if (!boomed) {
        const o = { walk: t * 6 * (1 - walkK * 0.85), bend, look: [1, 0.3 * bend], blink: bumpAt(t, c.and2 - 0.05, 10) > 0.4 ? 1 : 0 };
        dnSauropod(ctx, D0.x, D0.y, D0.s, t, o);
      } else {
        dnFootprint(ctx, D0.x + 40, D0.y + 10, 0.9, 1, t);
        shDust(ctx, D0.x + 60, D0.y - 60, clamp((t - c.boom) / 0.7), 2.4, '#8E8A86', 9);
      }
    },
  });
  // the fireball: across the sky into the far horizon behind the hills, on "and went."; the flash on the boom
  const fk = clamp(inv(c.and2 - 0.15, c.boom, t));
  skFireball(960, 420, 230, toScreen(cam, 600, SH.hz)[1] - 30, fk, 0.5);
  const fl = t >= c.boom ? Math.exp(-(t - c.boom) * 5) : 0;
  return { glow: 0.85, flash: 0.85 * fl, shake: fl };
};

// ================================================================ five mass extinctions. Still swimming.
SC.five = (lt, t, shot) => {
  const c = cu();
  const S = { pal: shPal('meso', 'today', 0.4), modern: 0.0, grass: 0.4, rocks: 0.6, moss: 0.6, devo: 1, sunX: 940, sunH: 170, clouds: -1800 + 9 * t };
  const cam = camKeys(t, [[shot.start, 700, 1300, 1.42], [c.still, 690, 1300, 1.48], [shot.end, 900, 1320, 1.42]], E.inOutSine);
  const n = c.tally.reduce((acc, ti) => acc + clamp((t - ti) / 0.18), 0);
  const swim = r2(t, c.shades + 0.36, shot.end + 0.3, E.inOutSine);
  const flipK = r2(t, c.shades + 0.3, c.shades + 0.52, E.inOutSine);
  const SK = { x: 920 + 300 * swim, y: 1420 + 40 * swim, rot: lerp(-0.62, -0.06, r2(t, c.still - 0.2, c.still + 0.3)), flip: Math.cos(Math.PI * flipK) * -1 };
  shoreDraw(t, {
    cam, S, big: 0,
    behind: (cam2, sky) => {
      tallyRock(ctx, 455, 1552, 0.74, n, S.pal);
      skShark(ctx, SK.x, SK.y, 1, t, { flip: Math.abs(SK.flip) < 0.04 ? 0.04 * Math.sign(SK.flip || 1) : SK.flip, rot: SK.rot, look: t < c.five ? [0.1, 0.2] : [-0.9 * Math.sign(SK.flip || -1) * -1, 0.2], smirk: 0.9, brow: 0.4,
        blink: bumpAt(t, c.sharks5 + 0.2, 10) > 0.4 ? 1 : 0, shades: r2(t, c.shades, c.shades + 0.3), tail: 0.25 * Math.sin(t * 5) * swim, fin: 0.15 * Math.sin(t * 3) });
      skWaterFront(cam2, t, S, sky.sun, SK.x - 40, 1500, 230, { deep: 380, ring: 170, x0: 700 });
    },
  });
  return { glow: 0.8, overlay: () => shTag('MASS EXTINCTIONS', 540, 700, popK(t, c.five - 0.1, shot.end + 1), '#FF5A6E', 'SURVIVED') };
};

// ================================================================ the cover: the hug, the shark, the claim
SC.cover = (lt, t) => {
  const c = cu();
  presentDraw(c.sharks2 + 0.78, t, { cam: { x: 596, y: 1090, zoom: 1.62, rot: 0 } });   // the shark's grin, his bliss (the heart gone)
  screenSpace();
  bigWord('OLDER THAN', 540, 545, 118, '#FFFFFF', 1, -0.04);
  bigWord('TREES?!', 540, 715, 210, '#4DFFB4', 1, -0.04);
  return { glow: 0.8, noCaptions: true };
};

function initScenes2() {
  initShore();
}
