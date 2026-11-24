// Can You SWAP Your Thumb and Pinky? — the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the
// shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash, flashTop, grain: 0,
//    overlay: fn, noCaptions, capY, focus}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
// Worlds: tp_world.js (the lake, the dock, the two hands, the twin's strings, him seated), purrcat.js (cats-purr's cat,
// here with both paws), fp_world.js (fist-edge-palm's 3D camera), fist3d.js / bwhand.js / s7_world.js (the hand, the
// forearm, every joint; tags, bursts, rings). The whole Short is ONE state over time (`tpS(tt)`, valid at negative time
// for the loop), drawn through a different camera per shot, so the hands never jump between cuts.
'use strict';

const cu = () => TLd.cues;

// ---------------------------------------------------------------- the light (reference/visual.md "The light")
const TP_DAY = { ...LIGHTS.day, rimAmt: 1.05, pool: 0.3, halo: 0.1 };
const TP_WARM = { ...LIGHTS.day, keyTint: [1.12, 1.03, 0.9], rimAmt: 1.2, pool: 0.4, halo: 0.14 };
setLights({ hook: TP_DAY, fast: TP_DAY, two: TP_DAY, copycat: TP_DAY, twin: TP_DAY, want: TP_DAY,
  kids: TP_DAY, kidsb: TP_DAY, gene: TP_WARM, life: TP_DAY, button: TP_DAY, cover: TP_DAY });

// the wrists: palms down in front of his chest, the forearms a little in toward each other
const TP_WR = { R: { x: 9, y: 30, z: 4, head: -0.12, pitch: 0.1, roll: 0.4 }, L: { x: -9, y: 30, z: 4, head: 0.12, pitch: 0.1, roll: 0.4 } };

// ---------------------------------------------------------------- the swaps (one list for the whole Short)
// a key: [time, R, L] with 'T' (thumb out), 'P' (little finger out), 'F' (both in), 'W' (open: the wave)
let TP_KEYS = null;
function tpKeyList() {
  if (TP_KEYS) return TP_KEYS;
  const c = cu();
  const K = [[-9, 'T', 'P'],
    [c.swap1, 'P', 'T'],                                                   // SWAP: right pinky, left thumb (right!)
    [c.faster + 0.02, 'T', 'P'], [c.faster + 0.26, 'P', 'T'],             // Faster!: back... and again...
    [c.fail, 'T', 'T'],                                                    // ...TWO THUMBS (the mix-up)
    [c.keep + 0.05, 'T', 'P'], [c.keep + 0.45, 'P', 'T'],                 // Keep swapping.
    [c.every + 0.05, 'T', 'P'],
    [c.twin_w - 0.12, 'S', 'S'],                                           // TWIN: both hands hang loose, the strings pop
    [c.move - 0.3, 'F', 'F'],
    [c.move + 0.02, 'T', 'F'],                                             // "Move one..." the right thumb goes out
    [c.yank, 'T', 'T'],                                                    // ...and its twin is yanked out too
    [c.pinks1, 'P', 'F'], [c.pinks2, 'P', 'P'],                            // the little fingers do it too
    [c.kids + 0.05, 'T', 'T'], [c.kids + 0.45, 'P', 'P'], [c.kids + 0.85, 'T', 'T'], [c.kids + 1.25, 'P', 'P'],
    [c.way + 0.1, 'T', 'T'], [c.way + 0.5, 'P', 'P'],                     // a kid's hands: copy, copy, copy
    [c.fades, 'F', 'F'],
    [c.wave0, 'W', 'W'],                                                   // the other hand copies: the wave
    [c.wave1, 'F', 'F'],
    [c.now + 0.05, 'T', 'P'],                                              // Now...
    [c.swap2 + 0.08, 'P', 'T'],                                            // ...swap them...
    [c.slow1, 'T', 'P'],                                                   // ...SLOWLY, and back: frame 0's picture
  ];
  TP_KEYS = K.sort((a, b) => a[0] - b[0]);
  return TP_KEYS;
}
const tpVal = (code) => ({ thumb: code === 'T' || code === 'S' ? 1 : 0, pinky: code === 'P' || code === 'S' ? 1 : 0, open: code === 'W' ? 1 : 0 });
function tpHandsAt(tt) {
  const c = cu();
  if (tt < 0) tt += c.end;
  const K = tpKeyList();
  let i = 0;
  for (let j = 0; j < K.length; j++) if (K[j][0] <= tt) i = j;
  const out = {};
  for (const [sd, col] of [['R', 1], ['L', 2]]) {
    const a = tpVal(i > 0 ? K[i - 1][col] : K[0][col]), b = tpVal(K[i][col]);
    const dur = K[i][col] === 'W' || (i > 0 && K[i - 1][col] === 'W') ? 0.3 : (tt > c.now ? 0.28 : 0.11);
    const u = clamp((tt - K[i][0]) / dur), e = E.outBack(u, 1.6);
    out[sd] = { thumb: lerp(a.thumb, b.thumb, e), pinky: lerp(a.pinky, b.pinky, e), open: lerp(a.open, b.open, E.inOutSine(u)), since: tt - K[i][0] };
  }
  return out;
}

// ---------------------------------------------------------------- the whole state at time tt
function tpS(tt) {
  const c = cu(), S = {};
  const r = (a, b, e = E.inOutCubic) => (tt < 0 ? 0 : ramp(tt, a, b, e));
  const t0 = tt < 0 ? tt + c.end : tt;
  S.h = tpHandsAt(tt);
  // where the wrists are: a strain shake in the fast swaps, the wave
  S.wr = { R: { ...TP_WR.R }, L: { ...TP_WR.L } };
  if (tt >= 0) {
    const sh = popK(t0, c.faster, c.two + 0.3, 0.1, 0.2);
    for (const sd of ['R', 'L']) S.wr[sd].y += 0.6 * sh * Math.sin(t0 * 47 + (sd === 'R' ? 0 : 2));
    // the wave: both hands rise and swing together (the copy)
    const wv = snapRamp(t0, c.wave0 - 0.05, c.wave0 + 0.25) * (1 - snapRamp(t0, c.wave1 - 0.05, c.wave1 + 0.25, { over: 1.2 }));   // a snap up, a snap down
    if (wv > 0) {
      const sw = Math.sin((t0 - c.wave0) * 11) * wv;
      for (const sd of ['R', 'L']) {
        const sg = sd === 'R' ? 1 : -1;
        S.wr[sd].y += 16 * wv; S.wr[sd].z += 4 * wv; S.wr[sd].pitch = lerp(TP_WR[sd].pitch, 1.05, wv);
        S.wr[sd].head = TP_WR[sd].head + sg * 0.32 * sw; S.wr[sd].x += sg * 3 * wv;
        S.wr[sd].roll = lerp(TP_WR[sd].roll, -0.15, wv);
      }
    }
  }
  S.wave = tt < 0 ? 0 : popK(t0, c.wave0 - 0.1, c.wave1 + 0.3, 0.25, 0.3);
  // a kid's hands (AGE 4): smaller, in a red jumper; they grow back on "it fades as you grow"
  S.kid = tt < 0 ? 0 : r(c.kids - 0.12, c.kids + 0.2, E.outBack) * (1 - r(c.fades + 0.1, c.grow_end));
  for (const sd of ['R', 'L']) S.wr[sd].sc = lerp(1, 0.7, clamp(S.kid));
  // the twin's strings: on from "TWIN" to the gene, taut and yanking on the copies
  S.ties = tt < 0 ? 0 : r(c.twin_w - 0.05, c.twin_w + 0.3, E.outCubic) * (1 - r(c.now - 0.2, c.now + 0.1));
  S.yankT = tt < 0 ? 0 : popK(t0, c.yank - 0.25, c.yank + 0.35, 0.12, 0.25);
  S.yankP = tt < 0 ? 0 : popK(t0, c.pinks2 - 0.2, c.pinks2 + 0.35, 0.1, 0.25);
  // the strings' thickness: a kid's are ropes (AGE 4), a grown-up's thin threads (AGE 30); the gene's a steel chain
  S.tieW = 1;
  if (tt >= 0) {
    S.tieW = lerp(1, 1.9, r(c.kids - 0.1, c.kids + 0.25, E.outBack));
    S.tieW = lerp(S.tieW, 0.5, r(c.fades - 0.05, c.fades + 0.5));
  }
  S.chain = tt < 0 ? 0 : r(c.gene_w - 0.1, c.gene_w + 0.25, E.outBack);
  S.age = tt < 0 ? null : (t0 >= c.kids - 0.05 && t0 < c.fades - 0.05 ? 4 : (t0 >= c.fades - 0.05 && t0 < c.gene_go ? 30 : null));
  // a bead of light running from the right thumb to the left one ("...wants to move too")
  S.beadT = t0 >= c.move + 0.08 && t0 < c.yank + 0.05 ? clamp((t0 - c.move - 0.08) / (c.yank - c.move - 0.08)) : null;
  S.beadP = t0 >= c.pinks1 && t0 < c.pinks2 + 0.05 ? clamp((t0 - c.pinks1) / (c.pinks2 - c.pinks1)) : null;
  // the cat: watching; at COPYCATS both paws up like his two thumbs (hitstop); waving both paws with him; and on SLOWLY she
  // swaps her own paws, one up, one down, perfectly
  let paws = [0, 0], eyes = 'open', look = [0, 0.55], mouth = 'w', tail = 0.25, tilt = 0, ears = 0.3;
  if (tt >= 0) {
    if (t0 >= c.fail) { look = [0, 0.7]; ears = 0.8; tilt = 0.05; }
    const cp = r(c.copycats - 0.04, c.copycats + 0.12, E.outBack) * (1 - r(c.keep - 0.1, c.keep + 0.2));
    if (cp > 0) { paws = [cp, cp]; mouth = 'open'; eyes = 'big'; }
    if (t0 >= c.keep) { eyes = 'open'; mouth = 'w'; tilt = 0; }
    if (t0 >= c.yank && t0 < c.kids) { tilt = -0.08; }
    if (t0 >= c.kids && t0 < c.gene_go) { eyes = 'half'; tilt = 0.06; }
    const wv = Math.max(S.wave, tt < 0 ? 0 : popK(t0, c.wave1 + 0.05, c.it2_end + 0.2, 0.15, 0.25));
    if (wv > 0) { const sw = 0.5 + 0.5 * Math.sin((t0 - c.wave0) * 11); paws = [wv * (0.7 + 0.3 * sw), wv * (0.7 + 0.3 * (1 - sw))]; eyes = 'happy'; mouth = 'open'; }
    if (t0 >= c.everything && t0 < c.now) { eyes = 'big'; mouth = 'w'; }
    // her perfect slow swap
    const sl = r(c.now + 0.1, c.now + 0.3) * (1 - r(c.end - 0.75, c.end - 0.35));
    if (sl > 0) {
      const ph = Math.sin((t0 - c.now) * Math.PI / Math.max(0.6, (c.slow1 - c.now))) ;
      paws = [sl * clamp(0.5 + 0.9 * ph), sl * clamp(0.5 - 0.9 * ph)]; eyes = ['open', 'half']; mouth = 'w'; tilt = -0.05;
    }
  }
  S.cat = { paws, eyes, look, mouth, tail, tilt, ears };
  // his face
  const lookHands = { lookX: 0, lookY: 0.75 };
  let f = { ...FACES.calm, ...lookHands, mouth: 'flat', mouthOpen: 0.1, browY: 0.3 };
  if (tt >= 0) {
    f = lerpFace(f, { ...FACES.nervous, ...lookHands, mouth: 'grimace', eyeOpen: 1.1 }, r(c.faster, c.faster + 0.12));
    f = lerpFace(f, { ...FACES.shock, lookX: 0, lookY: 0.8, mouthOpen: 0.7, eyeOpen: 1.3 }, r(c.fail, c.fail + 0.1));
    f = lerpFace(f, { ...FACES.confused, lookX: 0.4, lookY: 0.2 }, r(c.copycats, c.copycats + 0.2));
    f = lerpFace(f, { ...FACES.calm, ...lookHands, eyeOpen: 1.05 }, r(c.keep, c.keep + 0.2));
    f = lerpFace(f, { ...FACES.startled, ...lookHands, eyeOpen: 1.3, mouth: 'o', mouthOpen: 0.5 }, r(c.yank, c.yank + 0.1));
    f = lerpFace(f, { ...FACES.confused, ...lookHands }, r(c.kids, c.kids + 0.2));
    f = lerpFace(f, { ...FACES.calm, ...lookHands, eyeOpen: 1.0 }, r(c.fades, c.fades + 0.2));
    f = lerpFace(f, { ...FACES.worried, lookX: 0.1, lookY: 0.6 }, r(c.gene_w, c.gene_w + 0.15));
    f = lerpFace(f, { ...FACES.grin, lookX: 0.3, lookY: -0.1, eyeOpen: 0.95 }, r(c.wave0, c.wave0 + 0.2));
    f = lerpFace(f, { ...FACES.dazed, lookX: -0.2, lookY: 0.5 }, r(c.everything, c.everything + 0.2));
    f = lerpFace(f, { ...FACES.calm, ...lookHands, eyeOpen: 1.1, browY: 0.5 }, r(c.now - 0.1, c.now + 0.2));
    f = lerpFace(f, { ...FACES.calm, ...lookHands, mouth: 'flat', mouthOpen: 0.1, browY: 0.3 }, r(c.end - 0.5, c.end - 0.15));
  }
  S.face = f;
  S.hrot = tt < 0 ? 0 : 0.06 * popK(t0, c.fail, c.keep, 0.06, 0.3) - 0.05 * popK(t0, c.everything, c.now, 0.05, 0.3);
  S.hdy = tt < 0 ? 0 : -10 * popK(t0, c.yank, c.yank + 0.35, 0.03, 0.25);
  return S;
}

// ---------------------------------------------------------------- the two hands from a camera
function tpHandParts(V, S, t) {
  const out = {};
  for (const sd of ['L', 'R']) {
    const h = S.h[sd], side = sd === 'R' ? 1 : -1;
    const G = tpHandGeo({ thumb: h.thumb, pinky: h.pinky, open: h.open, t, tr: 0 });
    const X = tpXf(side, S.wr[sd]);
    out[sd] = { G, X, P2: tpProj(V, X) };
  }
  return out;
}
function tpHandsDraw(V, S, t, H2) {
  screenSpace();
  // the farther hand first
  const order = fv.dot(fv.sub(H2.L.X.wrist, V.C), V.F) > fv.dot(fv.sub(H2.R.X.wrist, V.C), V.F) ? ['L', 'R'] : ['R', 'L'];
  for (const sd of order) actor(() => tpDrawHand(ctx, H2[sd].P2, H2[sd].G, { kid: S.kid > 0.5 }));
}
// the strings between the twins, with their yank and their beads
function tpTiesDraw(V, S, t, H2) {
  if (S.ties <= 0.01) return;
  const tR = tpTip(H2.R.G, H2.R.X, 'T'), tL = tpTip(H2.L.G, H2.L.X, 'T');
  const pR = tpTip(H2.R.G, H2.R.X, 'L'), pL = tpTip(H2.L.G, H2.L.X, 'L');
  tpTie(V, pR, pL, { k: S.ties, t, col: TP_COL.pinky, slack: 0.55 * (1 - S.yankP), taut: S.yankP, w: S.tieW, chain: S.chain, beads: S.beadP === null ? [] : [{ u: S.beadP }] });
  tpTie(V, tR, tL, { k: S.ties, t, col: TP_COL.thumb, slack: 0.4 * (1 - S.yankT), taut: S.yankT, w: S.tieW, chain: S.chain, beads: S.beadT === null ? [] : [{ u: S.beadT }] });
}
function tpCatDraw(V, S, t, o = {}) {
  const cq = fpP(V, [0, 0, TP.catZ]);
  if (cq[3] < 6) return null;
  const cs = cq[2] * 32 / 280;
  screenSpace();
  actor(() => purCat(ctx, cq[0], cq[1], cs, t, { ...S.cat, seed: 3 }));
  return { x: cq[0], y: cq[1], s: cs, head: purPt(cq[0], cq[1], cs, S.cat, 0, 0) };
}

// ---------------------------------------------------------------- cameras ([t, eye xyz, look-at xyz, focal px, roll])
const TP_HOOKCAM = [0, 0, 60, 34, 2.2, 26, -12, 1340, 0];     // frame 0: from his eyes, the two fists, the cat across the planks
function tpCamOf(id, lt, D) {
  const K = (keys) => fpKeys(lt, keys.map((k) => k.slice()));
  const cutAt = (name) => cu()[name] - TLd.shots.find((s) => s.id === id).start;
  switch (id) {
    case 'hook': {
      const cut = cutAt('cut_can');
      if (lt < cut) return K([[0, ...TP_HOOKCAM.slice(1)], [cut, 0, 59.6, 33.6, 2.2, 26, -12, 1380, 0]]);
      return K([[cut, 0, 78, 26, 0, 28, -6, 1250, 0], [D, 0, 77, 25, 0, 28, -6, 1300, 0]]);
    }
    case 'fast': return K([[0, 9, 66, -54, 0, 47, 22, 1080, 0.02], [D, 8, 65, -50, 0, 47, 22, 1130, 0.02]]);
    case 'two': return K([[0, 0, 56, 26, 0, 29, -6, 1750, 0], [D, 0, 55, 25, 0, 29, -6, 1840, 0]]);
    case 'copycat': return K([[0, 3, 22, -30, 0, 19, -74, 1150, -0.03], [D, 3, 22, -32, 0, 19, -74, 1200, -0.03]]);
    case 'twin': {
      const cut = cutAt('cut_every');
      if (lt < cut) return K([[0, -2, 58, 30, 0, 28, -10, 1300, 0], [cut, -2, 57.5, 29.5, 0, 28, -10, 1330, 0]]);
      return K([[cut, 18, 46, -50, 0, 44, 30, 1100, 0.02], [D, 17, 46, -48, 0, 44, 30, 1140, 0.02]]);
    }
    case 'want': {
      const cut = cutAt('cut_pinks');
      if (lt < cut) return K([[0, -24, 40, -56, 0, 43, 8, 1180, -0.03], [cut, -23, 40, -54, 0, 43, 8, 1210, -0.03]]);
      return K([[cut, -4, 56, 26, 0, 27, -12, 1330, 0], [D, -4, 55.5, 25, 0, 27, -12, 1370, 0]]);
    }
    case 'kids': {
      const cut = cutAt('cut_way');
      if (lt < cut) return K([[0, 0, 56, 26, 1, 27, -10, 1260, 0], [cut, 0, 55.5, 25.5, 1, 27, -10, 1290, 0]]);
      return K([[cut, 0, 72, 52, 1.5, 27, -14, 1080, 0], [D, 0, 71, 50, 1.5, 27, -14, 1120, 0]]);
    }
    case 'kidsb': return K([[0, -14, 58, -34, -9, 53, 22, 1080, -0.02], [D, -13, 58, -32, -9, 53, 22, 1120, -0.02]]);
    case 'gene': return K([[0, 8, 66, -96, 0, 54, 30, 1000, 0], [D, 8, 66, -90, 0, 54, 30, 1040, 0]]);
    case 'life': return K([[0, 0, 56, 30, 0, 27, -14, 1420, 0], [D, 0, 55, 28, 0, 27, -14, 1480, 0]]);
    case 'button': {
      const cut = cutAt('cut_slowly');
      if (lt < cut) return K([[0, 8, 62, -32, 0, 60, 30, 1150, 0.02], [cut, 7, 62, -30, 0, 60, 30, 1190, 0.02]]);
      return K([[cut, 2, 66, 44, 2.2, 26, -12, 1220, 0], [Math.max(cut + 0.3, D - 0.9), 0.3, 60.3, 34.3, 2.2, 26, -12, 1360, 0],
        [D, ...TP_HOOKCAM.slice(1)]]);
    }
    default: return K([[0, ...TP_HOOKCAM.slice(1)]]);
  }
}

// ---------------------------------------------------------------- the dock world from a camera
// view: 'pov' (from his eyes), 'front' (him seated, from the cat's side), 'cat' (the cat close)
function tpWorld(V, S, t, view, o = {}) {
  tpBack(V, t, { soft: 1 });
  tpDock(V, t);
  for (const [x, z] of [[-66, -150], [66, -150], [-66, -282], [66, -282], [-66, 96], [66, 96]]) tpPost(V, x, z);
  tpBucket(V, [-38, 0, -170]); tpCoil(V, [40, 0, -128]); tpTackle(V, [-44, 0, -28]);
  const cat = tpCatDraw(V, S, t);
  const H2 = tpHandParts(V, S, t);
  let hero = null;
  if (view === 'front') hero = tpHero(V, t, S, { R: H2.R.X, L: H2.L.X });
  if (view !== 'cat') {
    tpHandsDraw(V, S, t, H2);
    if (view === 'pov') tpPovUpper(V, { R: H2.R.X, L: H2.L.X }, S.kid > 0.5);
    tpTiesDraw(V, S, t, H2);
  }
  return { hero, H2, cat };
}

// ---------------------------------------------------------------- the shots
function tpShot(view, o = {}) {
  return (lt, t, shot) => {
    const D = shot.end - shot.start, V = tpCamOf(shot.id, lt, D), S = tpS(t);
    const R = tpWorld(V, S, t, view, o);
    const a = R.H2.R.P2.ph([0, 6, 0]), b = R.H2.L.P2.ph([0, 6, 0]);
    let focus = [clamp((a[0] + b[0]) / 2, 240, 840), clamp((a[1] + b[1]) / 2, 480, 1100)];
    if (R.hero) focus = [clamp(R.hero.head[0], 260, 820), clamp(R.hero.head[1], 480, 1080)];
    if (o.catFocus && R.cat) focus = [clamp(R.cat.head[0], 260, 820), clamp(R.cat.head[1], 480, 1000)];
    if (o.labels) o.labels(V, S, R, lt, t, shot);
    return { glow: 0.8, focus, capY: o.capY };
  };
}
// a shot whose view changes at its cut: the first part from in front (him drawn), the rest from his eyes
function tpShot2(cutName, viewA, viewB, o = {}) {
  const A = tpShot(viewA, o), B = tpShot(viewB, o);
  return (lt, t, shot) => (t < cu()[cutName] ? A(lt, t, shot) : B(lt, t, shot));
}
SC.hook = tpShot('pov', { labels: tpHookLabels });
SC.fast = tpShot('front', { labels: tpFailLabels, capY: 1560 });
SC.two = tpShot('pov', { labels: tpFailLabels, capY: 1560 });
SC.copycat = tpShot('cat', { catFocus: true, labels: tpCopyLabels, capY: 1480 });
SC.twin = tpShot2('cut_every', 'pov', 'front', { labels: tpTwinLabels });
SC.want = tpShot2('cut_pinks', 'front', 'pov', { labels: tpLeakLabels, capY: 1560 });
SC.kids = tpShot('pov', { labels: tpAgeLabels });
SC.kidsb = tpShot('front', { labels: tpAgeLabels, capY: 1560 });
SC.gene = tpShot('front', { labels: tpGeneLabels });
SC.life = tpShot('pov', { labels: tpLifeLabels, capY: 1560 });
SC.button = tpShot2('cut_slowly', 'front', 'pov', { capY: 1560 });

// ---------------------------------------------------------------- labels (screen space)
// the hook: THUMB / PINKY tags by the fingers that are out (in their colours)
function tpHookLabels(V, S, R, lt, t) {
  const c = cu();
  const kT = popK(t, c.thumb1 - 0.05, c.faster - 0.1, 0.1, 0.12), kP = popK(t, c.pinky1 - 0.05, c.faster - 0.1, 0.1, 0.12);
  for (const sd of ['R', 'L']) {
    const h = S.h[sd], P = R.H2[sd];
    if (h.thumb > 0.6 && kT > 0.01) { const q = fpP(V, tpTip(P.G, P.X, 'T')); s7Tag('THUMB', clamp(q[0], 230, 850), clamp(q[1] - 120, 520, 1100), kT, TP_COL.thumb, null, 50); }
    if (h.pinky > 0.6 && kP > 0.01) { const q = fpP(V, tpTip(P.G, P.X, 'L')); s7Tag('PINKY', clamp(q[0], 230, 850), clamp(q[1] - 110, 520, 1100), kP, TP_COL.pinky, null, 50); }
  }
}
function tpFailLabels(V, S, R, lt, t) {
  const c = cu(), k = popK(t, c.fail + 0.02, c.copycats - 0.1, 0.08, 0.12);
  if (k <= 0.01) return;
  for (const sd of ['R', 'L']) { const P = R.H2[sd], q = fpP(V, tpTip(P.G, P.X, 'T')); s7Ring(q[0], q[1], Math.max(46, q[2] * 3.2), k, '#FF5A6E', t); }
  const qa = fpP(V, tpTip(R.H2.R.G, R.H2.R.X, 'T')), qb = fpP(V, tpTip(R.H2.L.G, R.H2.L.X, 'T'));
  bigWord('2 THUMBS?!', clamp((qa[0] + qb[0]) / 2, 330, 750), clamp(Math.min(qa[1], qb[1]) - 150, 560, 1120), 108, '#FFD447', E.outBack(clamp(k), 2.2), -0.06);
}
function tpCopyLabels(V, S, R, lt, t) {
  const c = cu(), k = popK(t, c.copycats + 0.02, c.keep - 0.1, 0.06, 0.12);
  if (k > 0.01 && R.cat) s7Burst(clamp(R.cat.x + 10, 300, 780), clamp(R.cat.head[1] - 330 * R.cat.s * 0.9, 540, 900), 0.8, k, 'COPYCAT', '#FF9A3C', -0.08, 104);
}
function tpTwinLabels(V, S, R, lt, t) {
  const c = cu(), k = popK(t, c.twin_w + 0.05, c.move - 0.1, 0.08, 0.12);
  if (k <= 0.01) return;
  const P = R.H2, mT = fpP(V, fv.lerp(tpTip(P.R.G, P.R.X, 'T'), tpTip(P.L.G, P.L.X, 'T'), 0.5));
  const mP = fpP(V, fv.lerp(tpTip(P.R.G, P.R.X, 'L'), tpTip(P.L.G, P.L.X, 'L'), 0.5));
  s7Tag('TWINS', clamp(mT[0], 260, 820), clamp(mT[1] + 120, 600, 1180), k, TP_COL.thumb, null, 46);
  s7Tag('TWINS', clamp(mP[0], 260, 820), clamp(mP[1] - 140, 520, 1100), k, TP_COL.pinky, null, 46);
}
function tpLeakLabels(V, S, R, lt, t) {
  const c = cu(), k = popK(t, c.yank, c.yank + 0.6, 0.05, 0.15);
  if (k > 0.01) { const q = fpP(V, tpTip(R.H2.L.G, R.H2.L.X, 'T')); s7Burst(clamp(q[0] - 40, 280, 800), clamp(q[1] - 160, 560, 1100), 0.7, k, 'BOING!', '#FFD447', -0.1, 96); }
}
function tpAgeLabels(V, S, R, lt, t) {
  const c = cu();
  const k4 = popK(t, c.kids - 0.02, c.fades - 0.08, 0.08, 0.1), k30 = popK(t, c.fades - 0.02, c.gene_go - 0.08, 0.08, 0.1);
  const front = !!R.hero, ax = front ? 800 : 540, ay = front ? 760 : (R.cat ? clamp(R.cat.head[1] - 270, 470, 830) : 830);
  if (k4 > 0.01) bigWord('AGE 4', ax, ay, 150, '#4DFFB4', E.outBack(clamp(k4), 2.2), -0.05);
  if (k30 > 0.01) bigWord('AGE 30', ax, ay, front ? 120 : 150, '#8FB8FF', E.outBack(clamp(k30), 2.2), 0.04);
}
function tpLifeLabels(V, S, R, lt, t) {
  const c = cu(), P = R.H2;
  const m = fpP(V, fv.lerp(tpTip(P.R.G, P.R.X, 'T'), tpTip(P.L.G, P.L.X, 'T'), 0.5));
  const k = clamp((t - (c.keeps - 0.1)) / 0.25), shut = clamp((t - c.lock) / 0.08);
  if (k > 0.01) tpPadlock(m[0], m[1] + 60, 1.45 * E.outBack(clamp(k), 2), shut, t);
  const k2 = popK(t, c.lock + 0.02, c.end, 0.06, 0.12);
  if (k2 > 0.01 && t < cu().now) s7Burst(clamp(m[0], 300, 780), clamp(m[1] - 200, 560, 1000), 0.8, k2, 'FOR LIFE', '#FF5A6E', -0.06, 104);
}
function tpGeneLabels(V, S, R, lt, t) {
  const c = cu(), k = popK(t, c.gene_w - 0.05, c.now - 0.1, 0.08, 0.15);
  if (k > 0.01) bigWord('1 GENE', 300, 760, 110, '#4DFFB4', E.outBack(clamp(k), 2.2), -0.08);
}

// ---------------------------------------------------------------- the cover: two thumbs out, ringed, the cat copying
SC.cover = (lt, t) => {
  const V = fpKeys(0, [TP_HOOKCAM.slice()]), S = tpS(0.02);
  S.h = { R: { thumb: 1, pinky: 0, open: 0 }, L: { thumb: 0, pinky: 1, open: 0 } };
  S.cat.look = [0, 0.8]; S.cat.eyes = 'big'; S.cat.ears = 0.9;
  const R = tpWorld(V, S, 0.02, 'pov');
  screenSpace();
  const qT = fpP(V, tpTip(R.H2.R.G, R.H2.R.X, 'T')), qP = fpP(V, tpTip(R.H2.L.G, R.H2.L.X, 'L'));
  s7Tag('THUMB', clamp(qT[0], 260, 820), clamp(qT[1] - 115, 520, 1300), 1, TP_COL.thumb, null, 64);
  s7Tag('PINKY', clamp(qP[0] + 70, 260, 820), clamp(qP[1] + 330, 520, 1400), 1, TP_COL.pinky, null, 64);
  bigWord('SWAP?', 560, 745, 215, '#FFFFFF', 1, -0.04);
  return { glow: 0.8, noCaptions: true };
};

function initScenes2() { initTp(); }
