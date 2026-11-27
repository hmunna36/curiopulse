// Can Your Hands Tap Two DIFFERENT Beats? — the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the
// shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash, flashTop, grain: 0,
//    overlay: fn, noCaptions, capY, focus}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
// Worlds: tb_world.js (the dusk camp, the table, the pots, the kettle, the lantern, the mug, the fire, the tiny drummer and the
// window into his head, the beat lanes), tp_world.js (tpXf: a hand placed in the world; tpDrawHand; tpQuad; tpPovUpper),
// fp_world.js (the 3D camera fpCam / fpP / fpKeys, fpHandGeo, fp2D), fist3d.js / bwhand.js / s7_world.js (the hand, the
// forearm, every joint; s7Tag / s7Burst). The whole Short is ONE state over time (`tbS(tt)`, valid at negative time for the
// loop), drawn through a different camera per shot, so the hands never jump between cuts.
'use strict';

const cu = () => TLd.cues;

// ---------------------------------------------------------------- the light (reference/visual.md "The light")
const TB_DUSK = { ...LIGHTS.lanterns, pool: 0.45, rimAmt: 1.2 };
const TB_WARMLT = { ...LIGHTS.lanterns, keyTint: [1.14, 1.04, 0.9], rimAmt: 1.3, pool: 0.4 };
setLights({ hook: TB_DUSK, hookb: TB_DUSK, go: TB_DUSK, answer: TB_DUSK, drummer: TB_DUSK, easy: TB_DUSK, easyok: TB_DUSK,
  panic: TB_DUSK, faster: TB_DUSK, slump: TB_DUSK, easyb: TB_DUSK, cheat: TB_DUSK, glue: TB_WARMLT, trick: TB_WARMLT,
  tea: TB_WARMLT, button: TB_DUSK, button2: TB_DUSK, loop: TB_DUSK, cover: TB_DUSK });

// ---------------------------------------------------------------- the hands
const TB_PALM = 2.1;                         // the wrist sits this far above the pot's top when the palm is down on it
const TB_WR = { L: { x: -13, z: 22.5, head: 0.14, pitch: -0.05, roll: 0.0, sc: 1.22 }, R: { x: 12.6, z: 21.5, head: -0.14, pitch: -0.05, roll: 0.0, sc: 1.22 } };
// the height of a hand at time tt from its keys [[t, y, kind]] (h = a hit, r = resting, u = hovering)
function tbLift(tt, keys) {
  let i = -1;
  for (let j = 0; j < keys.length; j++) if (keys[j][0] <= tt) i = j;
  if (i < 0) return { y: keys[0][1], sq: 0, since: 99 };
  let lastHit = -99;
  for (let j = i; j >= 0; j--) if (keys[j][2] === 'h') { lastHit = keys[j][0]; break; }
  const a = keys[i], b = keys[i + 1], sq = clamp(1 - (tt - lastHit) / 0.12);
  if (!b) return { y: a[1], sq, since: tt - lastHit };
  const dt = b[0] - a[0], u = clamp((tt - a[0]) / dt);
  let y;
  if (b[2] === 'h') {
    if (a[1] <= 0.001) { const Hm = Math.min(7.5, 1.0 + 9 * dt); y = Hm * Math.pow(Math.sin(Math.PI * u), 0.75); }
    else y = a[1] * (1 - E.inQuad(u));
  } else if (b[2] === 'r') y = a[1] <= 0.001 ? 0 : a[1] * (1 - E.inOutSine(u));
  else y = a[1] <= 0.001 ? b[1] * E.outCubic(u) : lerp(a[1], b[1], E.inOutSine(u));
  return { y, sq, since: tt - lastHit };
}
// a flash 0..1 on the targets of a lane when a hit lands at its time (hits: the hand's hit times; at: the targets' times)
function tbLit(tt, hits, near = 0.09, life = 0.35) {
  let best = 0;
  for (const h of hits) { const d = tt - h; if (d >= -0.02 && d < life) best = Math.max(best, 1 - d / life); }
  return best;
}

// ---------------------------------------------------------------- the whole state at time tt
function tbS(tt) {
  const c = cu(), S = {};
  const t0 = tt < 0 ? tt + c.end : tt;
  const neg = tt < 0;
  const r = (a, b, e = E.inOutCubic) => (neg ? 0 : ramp(tt, a, b, e));
  const pk = (a, b, i = 0.1, o = 0.15) => (neg ? 0 : popK(tt, a, b, i, o));
  // the hands
  const lL = tbLift(tt, c.keysL), lR = tbLift(tt, c.keysR);
  S.lift = { L: lL, R: lR };
  S.wr = {};
  const flail = pk(c.he - 0.15, c.panics_end + 0.35, 0.08, 0.2), fast = pk(c.speed - 0.05, c.and + 0.1, 0.06, 0.15);
  const offer = neg ? 0 : snapRamp(tt, c.now + 0.02, c.now + 0.34, { over: 1.12 }) * (1 - ramp(tt, c.nice2 - 0.55, c.nice2 - 0.25, E.inOutCubic));
  for (const sd of ['L', 'R']) {
    const base = TB_WR[sd], pot = sd === 'L' ? TB.potL : TB.potR, lf = S.lift[sd], sg = sd === 'L' ? 1 : -1;
    const w = { ...base };
    w.y = pot.h + TB_PALM * base.sc + lf.y - 0.45 * lf.sq;
    if (flail > 0) {
      const ph = sd === 'L' ? 0 : 2.1;
      w.x += 2.6 * flail * Math.sin(t0 * 23 + ph); w.z += 2.0 * flail * Math.sin(t0 * 19 + ph);
      w.head += 0.3 * flail * Math.sin(t0 * 17 + ph); w.roll += 0.35 * flail * Math.sin(t0 * 13 + ph);
    }
    if (fast > 0) { w.x += 0.8 * fast * Math.sin(t0 * 41 + sg); }
    if (offer > 0) {
      // "Now you": both hands come up, palms out toward the camera (your turn)
      w.y += 14 * offer; w.z -= 6 * offer; w.pitch = lerp(base.pitch, 1.15, offer); w.x += sg * -3 * offer;
      w.head = lerp(base.head, sg * 0.35, offer);
    }
    S.wr[sd] = w;
  }
  // each pot flashes when its hand hits
  S.potHit = { L: lL.since < 0.25 ? 1 - lL.since / 0.25 : 0, R: lR.since < 0.25 ? 1 - lR.since / 0.25 : 0 };
  S.potSq = { L: lL.sq, R: lR.sq };
  // the lanes
  const Ls = { k: 0, u: null, litL: [0, 0], litR: [0, 0, 0], bad: [], merge: 0, litM: [0, 0, 0, 0], words: 0, y: 512 };
  const show = (a, b) => (neg ? 1 : (tt >= a && tt < b ? 1 : 0));
  if (neg || tt < c.your - 0.05) {
    Ls.k = 1;
    if (!neg) {
      if (tt >= c.two - 0.02 && tt < c.two + 1.1) Ls.u = (tt - c.two) / 1.12;
      if (tt >= c.three - 0.02 && tt < c.three + 1.15) Ls.u = (tt - c.three) / 1.2;
      const m0 = c.merged[0];
      if (tt >= m0 - 0.02) Ls.u = ((tt - m0) % 1.2) / 1.2;
      Ls.litL = [tbLit(tt, [c.two]), tbLit(tt, [c.two + 0.56])];
      Ls.litR = [tbLit(tt, [c.three]), tbLit(tt, [c.three + 0.4]), tbLit(tt, [c.three + 0.8])];
      // GO: both hands land together: the right row lights where it should, the left row gets red misses on 1/3 and 2/3
      const mh = c.merged.filter((h) => tt >= h - 0.02);
      for (let i = 0; i < mh.length; i++) {
        const slot = i % 3;
        Ls.litR[slot] = Math.max(Ls.litR[slot], tbLit(tt, [mh[i]]));
        if (slot === 0) Ls.litL[0] = Math.max(Ls.litL[0], tbLit(tt, [mh[i]]));
        else Ls.bad.push({ row: 'L', u: slot / 3, k: clamp((tt - mh[i]) / 0.08) });
      }
      Ls.x = r(c.same - 0.05, c.same + 0.15, E.outBack);
    }
  } else if (tt >= c.left2 - 0.05 && tt < c.two2 - 0.05) {
    // left once, right twice: rows of 1 and 2
    Ls.k = r(c.left2 - 0.05, c.left2 + 0.2, E.outBack); Ls.mode = 'easy';
    if (tt >= c.once - 0.02) Ls.u = ((tt - c.once) % 0.56) / 0.56;
    Ls.litL = [tbLit(tt, c.easyL)]; Ls.litR = [tbLit(tt, c.easyR.filter((_, i) => i % 2 === 0)), tbLit(tt, c.easyR.filter((_, i) => i % 2 === 1))];
    Ls.ok = r(c.easy1 - 0.02, c.easy1 + 0.18, E.outBack);
  } else if (tt >= c.easy2 - 0.1 && tt < c.so - 0.1) {
    // the easy beat: rows of 1 and 1, lazy
    Ls.k = r(c.easy2 - 0.1, c.easy2 + 0.15, E.outBack); Ls.mode = 'one';
    const z0 = c.lazy.filter((h) => h <= tt).pop();
    if (z0 !== undefined) Ls.u = (tt - z0) / 0.5;
    Ls.litL = [tbLit(tt, c.lazy)]; Ls.litR = [tbLit(tt, c.lazy)];
  } else if (tt >= c.they - 0.1) {
    // the glue: two rows (2 and 3) come back, the glue squeezes between them, they stick into ONE row
    Ls.k = r(c.they - 0.1, c.they + 0.15, E.outBack);
    Ls.glue = r(c.squeeze, c.stick, E.outCubic) * (1 - r(c.merge1 - 0.1, c.merge1 + 0.2));
    Ls.merge = r(c.stick, c.merge1 + 0.1, E.inOutCubic);
    Ls.words = r(c.nice1 - 0.25, c.nice1, E.outBack);
    const seq = [[c.nice1, c.cup1, c.of1, c.tea1], [c.nice2, c.cup2, c.of2, c.tea2]];
    Ls.litM = [0, 1, 2, 3].map((i) => Math.max(tbLit(tt, [seq[0][i]], 0.09, 0.6), tbLit(tt, [seq[1][i]], 0.09, 0.6)));
    // the playhead rides the syllables (0, 1/3, 1/2, 2/3), then runs out to the end of the bar
    for (const q of seq) {
      if (tt >= q[0] - 0.02 && tt < q[3] + 0.6) {
        const xs = [[q[0], 0], [q[1], 1 / 3], [q[2], 1 / 2], [q[3], 2 / 3], [q[3] + 0.55, 1.0]];
        let u = 0;
        for (let i = 0; i < xs.length - 1; i++) if (tt >= xs[i][0]) u = lerp(xs[i][1], xs[i + 1][1], clamp((tt - xs[i][0]) / (xs[i + 1][0] - xs[i][0])));
        Ls.u = u;
      }
    }
  }
  S.lanes = Ls;
  // the kettle (the running device): it taps NICE CUP OF TEA with its lid all along; boils over in the panic; whistles and
  // pours on TEA; back as on frame 1 for the loop
  const lidPat = (x) => { const ph = ((x % 1.2) + 1.2) % 1.2; let v = 0; for (const p of [0, 0.4, 0.6, 0.8]) { const d = ph - p; if (d >= 0 && d < 0.14) v = Math.max(v, Math.sin(Math.PI * d / 0.14)); } return v; };
  const K = { mood: 'watch', look: [-0.35, 0.6], lid: 0.45 * lidPat(t0 + 0.3), shake: 0, steam: 0.15, whistle: 0, pour: 0, blink: 0 };
  if (!neg) {
    const boil = pk(c.boil, c.boil_end, 0.15, 0.35);
    if (boil > 0) { K.mood = 'boil'; K.shake = boil; K.steam = boil; K.lid = Math.max(K.lid, boil * (0.5 + 0.5 * Math.abs(Math.sin(t0 * 31)))); K.look = [0.2 * Math.sin(t0 * 9), 0.3]; }
    if (tt >= c.easy1 && tt < c.two2) K.mood = 'happy';
    if (tt >= c.nice1 - 0.3 && tt < c.tea1) { K.mood = 'happy'; K.lid = 0.6 * Math.max(tbLit(tt, [c.nice1], 0.1, 0.2), tbLit(tt, [c.cup1], 0.1, 0.15), tbLit(tt, [c.of1], 0.1, 0.15)); }
    const wh = pk(c.whistle, c.whistle + 0.42, 0.03, 0.15);
    if (wh > 0) { K.mood = 'wow'; K.whistle = wh; K.lid = Math.max(K.lid, 0.8 * wh); }
    K.pour = pk(c.pour0, c.pour1, 0.25, 0.35);
    if (K.pour > 0.05) { K.mood = 'happy'; K.whistle = Math.max(K.whistle, 0); }
    if (tt >= c.pour1 && tt < c.settle + 0.6) K.mood = 'happy';
  }
  S.kettle = K;
  S.mug = neg ? 0 : r(c.pour0 + 0.15, c.pour1 - 0.1, E.inOutSine);
  // the tiny drummer
  const D = { mood: 'focus', aL: 0, aR: 0, tangle: 0, slump: 0, card: 0, sweat: 0, look: [0, 0.4], bob: 0 };
  // the arms follow the hands: raised when the hand is up
  D.aL = clamp(lL.y / 7.5); D.aR = clamp(lR.y / 7.5);
  if (!neg) {
    if (tt >= c.your - 0.1 && tt < c.left2) D.mood = 'focus';
    if (tt >= c.one1 - 0.25 && tt < c.slam + 0.4) { D.mood = 'focus'; }
    if (tt >= c.slam && tt < c.slam + 0.5) D.mood = 'happy';
    if (tt >= c.left2 && tt < c.two2) D.mood = 'happy';
    const tg = r(c.panic_on - 0.05, c.panic_on + 0.25, E.outBack) * (1 - r(c.flop - 0.1, c.flop + 0.1));
    if (tg > 0) { D.tangle = tg; D.mood = 'panic'; D.sweat = tg; }
    if (tt >= c.two2 && tt < c.panic_on) { D.mood = 'focus'; D.sweat = r(c.two2, c.panic_on); }
    const fl = r(c.flop - 0.05, c.flop + 0.35, E.outBack);
    if (fl > 0 && tt < c.so - 0.1) { D.slump = fl; D.mood = 'slump'; D.tangle = 0; D.sweat = 0; }
    if (tt >= c.so - 0.1) { D.mood = 'sly'; D.slump = 0; }
    D.card = r(c.card, c.card + 0.35, E.outCubic);
    if (tt >= c.they) D.mood = 'proud';
  }
  S.dr = D;
  S.win = neg ? 0 : r(c.win, c.win + 0.32, E.outBack);
  // his face (front views)
  const lookHands = { lookX: 0, lookY: 0.8 };
  let f = { ...FACES.calm, ...lookHands, mouth: 'flat', mouthOpen: 0.1, browY: 0.25, browTilt: 0.5 };
  if (!neg) {
    f = lerpFace(f, { ...FACES.nervous, ...lookHands, mouth: 'grimace', eyeOpen: 1.15 }, r(c.go, c.go + 0.12));
    f = lerpFace(f, { ...FACES.confused, lookX: -0.2, lookY: -0.9, mouth: 'o', mouthOpen: 0.4 }, r(c.your - 0.1, c.your + 0.15));
    f = lerpFace(f, { ...FACES.startled, lookX: 0, lookY: 0.7 }, r(c.slam, c.slam + 0.08));
    f = lerpFace(f, { ...FACES.grin, ...lookHands }, r(c.left2, c.left2 + 0.2));
    f = lerpFace(f, { ...FACES.nervous, ...lookHands, eyeOpen: 1.3 }, r(c.two2, c.two2 + 0.2));
    f = lerpFace(f, { ...FACES.shock, lookX: 0, lookY: 0.6 }, r(c.he, c.he + 0.12));
    f = lerpFace(f, { ...FACES.annoyed, lookX: 0, lookY: 0.75, blink: 0.35 }, r(c.falls, c.falls + 0.2));
    f = lerpFace(f, { ...FACES.calm, lookX: 0.5, lookY: -0.4, browY: 0.6, mouth: 'flat' }, r(c.so, c.so + 0.2));
    f = lerpFace(f, { ...FACES.calm, ...lookHands, mouth: 'flat', browY: 0.3, browTilt: 0.4 }, r(c.nice1 - 0.3, c.nice1));
    f = lerpFace(f, { ...FACES.grin, lookX: 0.4, lookY: 0.1 }, r(c.tea1 + 0.05, c.tea1 + 0.25));
    f = lerpFace(f, { ...FACES.grin, lookX: 0, lookY: 0, browY: 0.9 }, r(c.now - 0.05, c.now + 0.15));
    f = lerpFace(f, { ...FACES.calm, ...lookHands, mouth: 'flat', mouthOpen: 0.1, browY: 0.25, browTilt: 0.5 }, r(c.nice2 - 0.3, c.nice2));
  }
  S.face = f;
  S.hrot = neg ? 0 : 0.05 * pk(c.he, c.panics_end + 0.3, 0.06, 0.2) * Math.sin(t0 * 21) - 0.06 * pk(c.falls, c.so, 0.2, 0.2);
  S.hdy = neg ? 0 : 10 * pk(c.falls, c.so, 0.25, 0.2);
  S.sweat = neg ? 0 : Math.max(pk(c.two2 + 0.2, c.panics_end + 0.3, 0.1, 0.2), 0);
  return S;
}

// ---------------------------------------------------------------- the hands and him from a camera
function tbHandParts(V, S, t) {
  const out = {};
  for (const sd of ['L', 'R']) {
    const side = sd === 'R' ? 1 : -1;
    const G = fpHandGeo({ curl: 0.12, spread: 0.05, t });
    const X = tpXf(side, S.wr[sd]);
    out[sd] = { G, X, P2: tpProj(V, X) };
  }
  return out;
}
function tbHandsDraw(V, S, t, H2) {
  screenSpace();
  const order = tbDepth(V, H2.L.X.wrist) > tbDepth(V, H2.R.X.wrist) ? ['L', 'R'] : ['R', 'L'];
  for (const sd of order) actor(() => tpDrawHand(ctx, H2[sd].P2, H2[sd].G, {}));
  // the hands hide the glow behind them (a lamp, the tent, the bulbs): cut their shapes out of the glow layer
  gctx.save(); gctx.globalCompositeOperation = 'destination-out';
  for (const sd of order) tpDrawHand(gctx, H2[sd].P2, H2[sd].G, {});
  gctx.restore();
}
const TB_RU = 0.28;                          // cm per rig unit
function tbHero(V, t, S) {
  const pose = JSON.parse(JSON.stringify(POSES.sit)); pose.lean = 0.0;
  const oY = -24 - 34 * TB_RU;
  const q = fpP(V, [0, oY, TB.heroZ]), z = q[2] * TB_RU;
  const cam = fp2D(q[0], q[1], z);
  const st = { x: 0, y: 0, s: 1, pose, face: S.face, noArms: true, noLegs: true, headRot: S.hrot || 0, headDY: S.hdy || 0, headDX: 0 };
  const r = charLayer(cam, st, t, { pal: PAL, ambient: 0.03 });
  gctx.save(); gctx.setTransform(1, 0, 0, 1, 0, 0); gctx.globalCompositeOperation = 'destination-out'; gctx.drawImage(layerC, 0, 0, W / 2, H / 2); gctx.restore();
  screenSpace();
  const head = toScreen(cam, r.head[0] + (st.headDX || 0), r.head[1] + (st.headDY || 0));
  if (S.sweat > 0.02) sweatDrop(ctx, head[0] + 70 * z, head[1] - 40 * z, 1.4 * z * 3, S.sweat);
  return { r, st, cam, z, head, shR: toScreen(cam, r.shL[0], r.shL[1]), shL: toScreen(cam, r.shR[0], r.shR[1]) };
}
function tbUpperArms(V, hero, H2) {
  screenSpace();
  const w = 46 * hero.z;
  actor(() => {
    for (const [sh, Xs] of [[hero.shR, H2.R.X], [hero.shL, H2.L.X]]) {
      const el = fpP(V, Xs.elbow);
      line(ctx, sh[0], sh[1], el[0], el[1], w, PAL.coat);
      circle(ctx, el[0], el[1], w * 0.52, PAL.coatSh);
    }
  });
}
function tbKettleDraw(V, S, t) {
  const kq = fpP(V, [TB.kettle[0], 5.2, TB.kettle[2]]), mq = fpP(V, TB.mug);
  if (kq[3] < 6) return null;
  const dir = mq[0] > kq[0] ? -1 : 1;
  screenSpace();
  const out = tbKettle(ctx, kq[0], kq[1], kq[2], t, { ...S.kettle, dir });
  return { ...out, x: kq[0], y: kq[1], s: kq[2], dir };
}
// the tea from the spout into the mug
function tbPourDraw(K, M, S, t) {
  if (!K || !M || S.kettle.pour < 0.35) return;
  const a = K.spout, b = [M.x, M.y + 1.5 * M.s], k = clamp((S.kettle.pour - 0.35) / 0.3);
  screenSpace();
  const mid = [lerp(a[0], b[0], 0.5) + (b[0] > a[0] ? 6 : -6) * M.s, Math.min(a[1], b[1]) - 4 * M.s];
  paint(() => {
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(mid[0], mid[1], lerp(a[0], b[0], k), lerp(a[1], b[1], k));
    ctx.lineWidth = Math.max(7, 2.0 * M.s); ctx.strokeStyle = '#B8662A'; ctx.lineCap = 'round'; ctx.stroke();
    ctx.lineWidth = Math.max(2.5, 0.6 * M.s); ctx.strokeStyle = rgba('#FFD9A0', 0.75); ctx.stroke();
  });
}

// ---------------------------------------------------------------- the whole camp from a camera
// view: 'pov' (from his eyes), 'front' (him at the table, from the kettle's side)
function tbWorld(V, S, t, view) {
  tbBack(V, t, { soft: 1 });
  const R = { hero: null, kettle: null, mug: null };
  if (view === 'pov') tbFire(V, t);
  if (view === 'front') R.hero = tbHero(V, t, S);
  tbTable(V);
  const H2 = tbHandParts(V, S, t);
  R.H2 = H2;
  const items = [];
  items.push({ z: tbDepth(V, TB.lantern), fn: () => tbLantern(V, TB.lantern, t) });
  items.push({ z: tbDepth(V, TB.kettle), fn: () => { tbStove(V, TB.kettle, t); R.kettle = tbKettleDraw(V, S, t); } });
  items.push({ z: tbDepth(V, TB.mug) - 0.01, fn: () => { R.mug = tbMug(V, TB.mug, t, { fill: S.mug, steam: S.mug }); } });
  const zL = tbDepth(V, [TB.potL.x, 5, TB.potL.z]), zR = tbDepth(V, [TB.potR.x, 5, TB.potR.z]);
  items.push({ z: zL, fn: () => { R.potL = tbPot(V, TB.potL, t, { hit: S.potHit.L, squash: S.potSq.L }); } });
  items.push({ z: zR, fn: () => { R.potR = tbPot(V, TB.potR, t, { hit: S.potHit.R, squash: S.potSq.R }); } });
  const zH = Math.min(zL, zR, tbDepth(V, H2.L.X.wrist), tbDepth(V, H2.R.X.wrist)) - 0.5;
  items.push({ z: zH, fn: () => {
    if (R.hero) tbUpperArms(V, R.hero, H2);
    tbHandsDraw(V, S, t, H2);
    if (view === 'pov') tpPovUpper(V, { R: H2.R.X, L: H2.L.X }, false);
  } });
  items.sort((a, b) => b.z - a.z);
  for (const it of items) it.fn();
  tbPourDraw(R.kettle, R.mug, S, t);
  return R;
}
// the window on his head, the drummer in it, and the strings down to his wrists (front views)
function tbWindowOnHead(V, S, t, R, o = {}) {
  if (!R.hero || S.win <= 0.01) return null;
  const h = R.hero, wc = [h.head[0], h.head[1] - 34 * h.z], Rw = 100 * h.z * S.win * (o.big || 1);
  let heads = null;
  tbHeadWin(wc, Rw, t, () => {
    const s = (Rw * 1.32) / 300;
    heads = tbDrummer(ctx, wc[0], wc[1] + Rw * 0.78, s, t, S.dr);
  });
  if (heads && S.win > 0.5) {
    screenSpace();
    for (const sd of ['L', 'R']) {
      const a = heads[sd], b = fpP(V, R.H2[sd].X.wrist);
      const tg = S.dr.tangle, mid = [lerp(a[0], b[0], 0.5) + tg * 40 * Math.sin(t * 17 + (sd === 'L' ? 0 : 2)), lerp(a[1], b[1], 0.5)];
      paint(() => {
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(mid[0], mid[1], b[0], b[1]);
        ctx.lineWidth = 4; ctx.strokeStyle = rgba('#FFE9A8', 0.95); ctx.lineCap = 'round'; ctx.stroke();
      });
      gctx.save(); gctx.beginPath(); gctx.moveTo(a[0], a[1]); gctx.quadraticCurveTo(mid[0], mid[1], b[0], b[1]);
      gctx.lineWidth = 7; gctx.strokeStyle = rgba('#FFD447', 0.5); gctx.stroke(); gctx.restore();
    }
  }
  return { wc, R: Rw };
}

// ---------------------------------------------------------------- cameras ([t, eye xyz, look-at xyz, focal px, roll])
const TB_HOOKCAM = [0, 0, 58, 66, 0, 2, 3, 1250, 0];      // frame 0: from his eyes, both hands over the two pots
function tbCamOf(id, lt, D) {
  const K = (keys) => fpKeys(lt, keys.map((k) => k.slice()));
  switch (id) {
    case 'hook': return K([[0, ...TB_HOOKCAM.slice(1)], [D, 0, 57.4, 65.2, 0, 2, 3, 1290, 0]]);
    case 'hookb': return K([[0, -12, 20, -80, 4, 30, 45, 1150, 0.0], [D, -12, 20, -78, 4, 30, 45, 1190, 0.0]]);
    case 'go': return K([[0, -6, 54, 60, 1, 4, 0, 1200, 0.05], [D, -6, 53.5, 59, 1, 4, 0, 1250, 0.05]]);
    case 'answer': return K([[0, 0, 40, -92, 0, 40, 50, 1260, 0], [D, 0, 40, -90, 0, 40, 50, 1300, 0]]);
    case 'drummer': return K([[0, 0, 46, -62, 0, 41, 50, 1320, 0], [D, 0, 46, -60, 0, 41, 50, 1360, 0]]);
    case 'easy': return K([[0, 0, 66, 60, 0, 0, -10, 1060, 0], [D, 0, 65, 58, 0, 0, -10, 1100, 0]]);
    case 'easyok': return K([[0, 5, 50, 56, 0, 6, 6, 1400, -0.02], [D, 5, 49.5, 55, 0, 6, 6, 1440, -0.02]]);
    case 'panic': return K([[0, -6, 42, -56, 0, 39, 50, 1260, 0], [D, -6, 42, -54, 0, 39, 50, 1300, 0]]);
    case 'faster': return K([[0, 0, 50, 56, 0, 6, 6, 1460, -0.03], [D, 0, 49.5, 55, 0, 6, 6, 1520, -0.03]]);
    case 'slump': return K([[0, 0, 84, -84, 2, 30, 40, 1330, 0], [D, 0, 83, -82, 2, 30, 40, 1370, 0]]);
    case 'easyb': return K([[0, -4, 56, 62, 0, 3, 2, 1250, 0], [D, -4, 55.5, 61, 0, 3, 2, 1290, 0]]);
    case 'glue': return K([[0, 0, 56, 56, 0, 4, -12, 1060, 0], [D, 0, 56, 55, 0, 4, -12, 1090, 0]]);
    case 'trick': return K([[0, 0, 60, 68, 0, 2, 0, 1120, 0], [D, 0, 58, 65, 0, 2, 2, 1280, 0]]);
    case 'tea': return K([[0, -2, 34, -96, 18, 25, 12, 1060, 0], [D, -2, 34, -94, 18, 25, 12, 1090, 0]]);
    case 'button': return K([[0, 0, 44, -44, 0, 44, 55, 1240, 0], [D, 0, 44, -42, 0, 44, 55, 1280, 0]]);
    case 'button2': return K([[0, 0, 64, 70, 0, 2, -4, 1080, 0], [D, 0, 60, 67, 0, 2, 1, 1200, 0]]);
    default: return K([[0, ...TB_HOOKCAM.slice(1)]]);
  }
}

// ---------------------------------------------------------------- labels (screen space)
function tbLanesDraw(S, t, o = {}) {
  const Ls = { ...S.lanes };
  if (o.k !== undefined) Ls.k = Math.min(Ls.k, o.k);
  if (Ls.k <= 0.01) return;
  if (Ls.mode === 'easy' || Ls.mode === 'one') {
    // rows of 1 and 2 (left once, right twice) or 1 and 1 (the easy beat): the lanes drawn with other targets
    const keep = [TB_POS.L, TB_POS.R];
    TB_POS.L = [0]; TB_POS.R = Ls.mode === 'easy' ? [0, 0.5] : [0];
    tbLanesN(Ls, t, Ls.mode === 'easy' ? ['1', '2'] : ['1', '1']);
    TB_POS.L = keep[0]; TB_POS.R = keep[1];
  } else tbLanesN(Ls, t, ['2', '3']);
  // the red X (SAME BEAT) and the green tick (EASY)
  const xk = clamp(Ls.x || 0), ok = clamp(Ls.ok || 0);
  if (xk > 0.01) {
    // SAME BEAT: a big red X stamps over the end of the rows (a shake, a ring)
    const sh = 7 * Math.max(0, 1 - xk) * Math.sin(t * 70);
    screenSpace(); ctx.save(); ctx.translate(700 + sh, 564); ctx.rotate(-0.12); ctx.scale(E.outBack(xk, 2.4) * 1.45, E.outBack(xk, 2.4) * 1.45);
    circle(ctx, 0, 0, 58, '#FFFFFF'); circle(ctx, 0, 0, 52, '#FF5A6E'); ctx.lineWidth = 14; ctx.strokeStyle = '#FFFFFF'; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-21, -21); ctx.lineTo(21, 21); ctx.moveTo(21, -21); ctx.lineTo(-21, 21); ctx.stroke(); ctx.restore();
    softDot(gctx, 700, 564, 120, '#FF5A6E', 0.4 * clamp(2 - 2 * xk + 0.3));
  }
  if (ok > 0.01) {
    screenSpace(); ctx.save(); ctx.translate(712, 564); ctx.scale(E.outBack(ok, 2), E.outBack(ok, 2));
    circle(ctx, 0, 0, 52, '#4DFFB4'); ctx.lineWidth = 13; ctx.strokeStyle = '#141428'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(-22, 2); ctx.lineTo(-6, 18); ctx.lineTo(24, -16); ctx.stroke(); ctx.restore();
  }
}
// tbLanes with the counts on the pills
function tbLanesN(Ls, t, nums) {
  const keep = tbLanes.__nums;
  tbLanes.__nums = nums;
  tbLanes(Ls, t);
  tbLanes.__nums = keep;
}
// a squeeze bottle of glue (screen space): s scale, sq 0..1 (squeezed: sides pinch, a blob at the nozzle)
function tbGlueBottle(x, y, s, sq, rot) {
  if (s <= 0.01) return;
  screenSpace(); ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const pinch = 10 * sq;
  actor(() => {
    ctx.beginPath(); ctx.moveTo(-46, 60); ctx.quadraticCurveTo(-46 + pinch, 0, -40, -60); ctx.lineTo(40, -60); ctx.quadraticCurveTo(46 - pinch, 0, 46, 60); ctx.closePath();
    ctx.fillStyle = '#F7F8FF'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(-22, -60); ctx.lineTo(-10, -104); ctx.lineTo(10, -104); ctx.lineTo(22, -60); ctx.closePath(); ctx.fillStyle = '#FF8A2A'; ctx.fill();
  });
  paint(() => {
    rrect(ctx, -36, -20, 72, 50, 8); ctx.fillStyle = '#2F86E8'; ctx.fill();
    ctx.font = '900 26px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFFFFF'; ctx.fillText('GLUE', 0, 6);
    if (sq > 0.05) { ctx.beginPath(); ctx.ellipse(0, -112 - 10 * sq, 9 + 8 * sq, 7 + 9 * sq, 0, 0, Math.PI * 2); ctx.fillStyle = '#F4F6FF'; ctx.fill(); }
  });
  ctx.restore();
}

// ---------------------------------------------------------------- the shots
function tbShot(view, o = {}) {
  return (lt, t, shot) => {
    const D = shot.end - shot.start, V = tbCamOf(shot.id, lt, D), S = tbS(t);
    const R = tbWorld(V, S, t, view);
    const a = R.H2.R.P2.ph([0, 6, 0]), b = R.H2.L.P2.ph([0, 6, 0]);
    let focus = [clamp((a[0] + b[0]) / 2, 240, 840), clamp((a[1] + b[1]) / 2, 480, 1100)];
    if (R.hero) focus = [clamp(R.hero.head[0], 260, 820), clamp(R.hero.head[1], 480, 1080)];
    if (view === 'front' && o.win !== false) R.win = tbWindowOnHead(V, S, t, R, o);
    if (o.labels) o.labels(V, S, R, lt, t, shot);
    if (o.lanes !== false) tbLanesDraw(S, t);
    return { glow: 0.8, focus, capY: o.capY };
  };
}
// the inset: a little round window with the drummer in it (screen space, POV shots)
function tbInset(S, t, x, y, Rw) {
  tbHeadWin([x, y], Rw, t, () => { tbDrummer(ctx, x, y + Rw * 0.78, (Rw * 1.32) / 300, t, S.dr); });
}
SC.hook = tbShot('pov');
SC.hookb = tbShot('front', { win: false });
SC.go = tbShot('pov');
SC.answer = tbShot('front', { lanes: false });
SC.drummer = tbShot('front', { lanes: false, big: 1.25 });
SC.easy = tbShot('pov');
SC.easyok = tbShot('pov', { labels: (V, S, R, lt, t) => { const c = cu(); const k = ramp(t, c.easy1 - 0.05, c.easy1 + 0.2, E.outBack); if (k > 0.01) tbInset(S, t, 260, 830, 120 * k); } });
SC.panic = tbShot('front', { lanes: false, big: 1.15, labels: (V, S, R, lt, t) => {
  const c = cu(), k = popK(t, c.panics - 0.02, c.panics_end + 0.4, 0.06, 0.12);
  if (k > 0.01 && R.win) s7Burst(clamp(R.win.wc[0] + R.win.R * 0.8, 300, 760), clamp(R.win.wc[1] - R.win.R * 0.55, 620, 900), 0.8, k, 'PANIC!', '#FF5A6E', 0.1, 100);
} });
SC.faster = tbShot('pov', { labels: (V, S, R, lt, t) => {
  // speed arcs above both hands
  screenSpace();
  for (const sd of ['L', 'R']) {
    const q = R.H2[sd].P2.ph([0, 7, -3]);
    paint(() => { for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(q[0], q[1], 90 + i * 26, Math.PI * 1.15, Math.PI * 1.85); ctx.lineWidth = 6; ctx.strokeStyle = rgba('#FFFFFF', 0.55 - i * 0.15); ctx.lineCap = 'round'; ctx.stroke(); } });
  }
} });
SC.slump = tbShot('front', { lanes: false });
SC.easyb = tbShot('pov');
SC.cheat = (lt, t, shot) => {
  // inside the window: the drummer close, a sly wink, the CHEAT card out of his hat
  const S = tbS(t), D = shot.end - shot.start;
  darkBg('#2A1446', '#12081F');
  const zk = 1 + 0.05 * lt / D;
  tbHeadWin([540, 900], 470 * zk, t, () => { tbDrummer(ctx, 540, 900 + 470 * zk * 0.86, (470 * zk * 1.5) / 300, t, S.dr); });
  return { glow: 0.85, focus: [540, 700] };
};
SC.glue = tbShot('pov', { labels: (V, S, R, lt, t) => {
  const c = cu(), k = popK(t, c.squeeze - 0.25, c.merge1, 0.15, 0.2), sq = popK(t, c.squeeze, c.stick + 0.1, 0.12, 0.15);
  tbGlueBottle(860 - 40 * k, 600 - 20 * sq, 1.45 * k, sq, -1.25);
} });
SC.trick = tbShot('pov');
SC.tea = tbShot('front', { win: false, capY: 1560, labels: (V, S, R, lt, t) => {
  const c = cu(), k = popK(t, c.whistle, c.whistle + 0.45, 0.05, 0.1);
  if (k > 0.01 && R.kettle) s7Burst(clamp(R.kettle.top[0] + 40, 300, 760), clamp(R.kettle.top[1] - 90, 560, 980), 0.75, k, 'WHEEE!', '#FFFFFF', -0.1, 96);
} });
SC.button = tbShot('front', { win: false });
SC.button2 = tbShot('pov');
SC.loop = (lt, t, shot) => {
  // frame 1 again: the hook's state at negative time (t - end), through the hook's frame-0 camera
  const c = cu(), tt = t - c.end, V = fpKeys(0, [TB_HOOKCAM.slice()]), S = tbS(tt);
  const R = tbWorld(V, S, t, 'pov');
  tbLanesDraw(S, t);
  const a = R.H2.R.P2.ph([0, 6, 0]), b = R.H2.L.P2.ph([0, 6, 0]);
  return { glow: 0.8, focus: [clamp((a[0] + b[0]) / 2, 240, 840), clamp((a[1] + b[1]) / 2, 480, 1100)] };
};

// ---------------------------------------------------------------- the cover: his two hands over the pots, the lanes, the dare
SC.cover = (lt, t) => {
  const V = fpKeys(0, [TB_HOOKCAM.slice()]), S = tbS(0.6);
  const R = tbWorld(V, S, 0.6, 'pov');
  tbLanesDraw(S, 0.6);
  screenSpace();
  bigWord('TAP 2 & 3?', 540, 790, 150, '#FFFFFF', 1, -0.04);
  return { glow: 0.8, noCaptions: true };
};

function initScenes2() { initTb(); }
