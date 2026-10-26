// Why Can't You Pat Your Head and Rub Your TUMMY? 🤚 Short: the shots. Each SC.<id>(lt, t, shot) draws one frame
// (lt = seconds inside the shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;
const phPulse = (t, times, len = 0.16) => times.reduce((m, f) => Math.max(m, clamp((t - f) / 0.03) * clamp((f + len - t) / 0.05)), 0);
const phSince = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);
const phShot = (id) => TLd.shots.find((s) => s.id === id);
const phLin = (x) => x, phInQuad = (x) => x * x;

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the office at night: the ceiling light up and to the left is the key; the back light is the cool city in the window
const OFFICE_LIGHT = { ...LIGHTS.room, rim: [0.55, 0.78, 1.0], rimFrom: [0.8, -0.45], rimAmt: 1.15, pool: 0.5, halo: 0.12 };
const COVER_LIGHT = { ...OFFICE_LIGHT, form: 0.5, cast: 0.5, ao: 0.1 };
// the kitchen by day: the window and the sun are up to the right
const KITCHEN_LIGHT = { ...LIGHTS.day, pool: 0.25 };
setLights({ hook: OFFICE_LIGHT, mail: OFFICE_LIGHT, again: OFFICE_LIGHT, shred: OFFICE_LIGHT, payoff: OFFICE_LIGHT,
  overtime: OFFICE_LIGHT, kids: KITCHEN_LIGHT, button: OFFICE_LIGHT, loop: OFFICE_LIGHT, cover: COVER_LIGHT });
const PH_ROOM_ANG = 300 / OF_PW * Math.PI * 2;   // which part of the office is behind him: the big window on the city

// ---------------------------------------------------------------- his faces
const FF = {
  focus: { eyeOpen: 0.95, pupil: 1, lookX: 0.35, lookY: -0.6, browY: 0.2, browTilt: 0.5, mouth: 'flat', mouthOpen: 0, blink: 0.1, cross: 0 },
  swap: { eyeOpen: 1.38, pupil: 0.55, lookX: 0, lookY: -0.4, browY: 1.45, browTilt: 0.35, mouth: 'o', mouthOpen: 0.7, blink: 0, cross: 0 },
  lost: { eyeOpen: 1.1, pupil: 0.8, lookX: -0.7, lookY: 0.6, browY: 0.9, browTilt: 1.0, mouth: 'wavy', mouthOpen: 0.35, blink: 0, cross: 0 },
  yep: { eyeOpen: 1.0, pupil: 1, lookX: 0, lookY: 0, browY: 0.9, browTilt: -0.2, mouth: 'grimace', mouthOpen: 0.45, blink: 0.15, cross: 0 },
  slow: { eyeOpen: 0.75, pupil: 1, lookX: 0.2, lookY: -0.3, browY: 0.1, browTilt: 0.3, mouth: 'flat', mouthOpen: 0.1, blink: 0.25, cross: 0 },
  down: { eyeOpen: 1.1, pupil: 0.9, lookX: -0.5, lookY: 1.0, browY: 0.8, browTilt: 0.5, mouth: 'o', mouthOpen: 0.4, blink: 0, cross: 0 },
  strain: { eyeOpen: 0.7, pupil: 1, lookX: 0, lookY: -0.2, browY: -0.4, browTilt: 1.1, mouth: 'grimace', mouthOpen: 0.9, blink: 0.2, cross: 0 },
  frantic: { eyeOpen: 1.35, pupil: 0.55, lookX: 0, lookY: -0.1, browY: 1.4, browTilt: 1.2, mouth: 'grimace', mouthOpen: 1, blink: 0, cross: 0 },
  // the toddler
  babble: { eyeOpen: 1.1, pupil: 1.1, lookX: 0.3, lookY: 0.4, browY: 0.6, browTilt: -0.2, mouth: 'grin', mouthOpen: 0.7, blink: 0, cross: 0 },
  splat: { eyeOpen: 0.25, pupil: 1, lookX: 0, lookY: 0, browY: 1.2, browTilt: 0.6, mouth: 'o', mouthOpen: 0.9, blink: 0.9, cross: 0 },
  giggle: { eyeOpen: 0.4, pupil: 1, lookX: 0, lookY: 0, browY: 0.9, browTilt: -0.3, mouth: 'grin', mouthOpen: 1, blink: 0.85, cross: 0 },
  wow: { eyeOpen: 1.3, pupil: 1.15, lookX: 0, lookY: 0.7, browY: 1.3, browTilt: 0, mouth: 'o', mouthOpen: 1, blink: 0, cross: 0 },
};

// ---------------------------------------------------------------- small graphics (screen space)
function phTag(txt, x, y, col, k, size = 40, ink = '#0B0B1A', rot = 0) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + size * 0.9, h = size * 1.5;
  rrect(ctx, -w / 2 - 4, -h / 2 - 4, w + 8, h + 8, h / 2 + 4); ctx.fillStyle = '#0B0B1A'; ctx.fill();
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = col; ctx.fill();
  ctx.fillStyle = ink; ctx.fillText(txt, 0, 2);
  ctx.restore();
}
// a word in a comic burst (screen space)
function phBurst(txt, x, y, size, col, k, rot = -0.1, seed = 3) {
  if (k <= 0.01) return;
  const e = E.outBack(clamp(k), 2.4), rng = mulberry32(seed);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(e, e);
  ctx.font = `400 ${size}px Anton`; const w = ctx.measureText(txt).width;
  const R = w * 0.62 + size * 0.35, n = 14;
  ctx.beginPath();
  for (let i = 0; i <= n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2, r = (i % 2 ? 0.78 : 1.05 + 0.1 * rng()) * R; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r * 0.62); }
  ctx.closePath(); ctx.fillStyle = '#0B0B1A'; ctx.fill(); ctx.save(); ctx.scale(0.9, 0.88); ctx.fillStyle = col; ctx.fill(); ctx.restore();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.lineWidth = size * 0.14; ctx.strokeStyle = '#0B0B1A'; ctx.strokeText(txt, 0, size * 0.04);
  ctx.fillStyle = '#FFFFFF'; ctx.fillText(txt, 0, size * 0.04);
  ctx.restore();
}
// speed arcs round a point (screen), k = how fast
function phSpeedArcs(x, y, r, k, t, col = '#FFFFFF') {
  if (k <= 0.02) return;
  screenSpace();
  for (let i = 0; i < 3; i++) {
    const a0 = t * 14 + i * 2.1;
    ctx.beginPath(); ctx.arc(x, y, r * (1 + 0.12 * i), a0, a0 + 1.1);
    ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.strokeStyle = rgba(col, 0.75 * k); ctx.stroke();
  }
}

// ================================================================ the office: him in the chair, the city behind
// A: {face, tongue, arms {L, R} ({e, w} rig units), hands {L, R} (phHand inputs), bob, headRot, headDX, headDY,
//     mail (fn(c, r) in head units: the glass head), handO {L, R} (phHand options), trailFn}
function phHero(cam, t, A) {
  const pal = PHPAL, st = fsSt({ arms: A.arms, bob: A.bob, headRot: A.headRot, headDX: A.headDX, headDY: A.headDY, face: A.face });
  st.noArms = true;
  const r = charLayer(cam, st, t, {
    pal, ambient: 0.04,
    post: (lc, rr, s2) => {
      lc.save(); lc.translate(s2.x, s2.y); lc.scale(s2.s, s2.s);
      fsLegs(lc, pal, { t, legUp: 0 });
      if ((A.tongue || 0) > 0.01) fsInHead(lc, s2, (c) => paint(() => { ellipse(c, 15, 44, 7 * A.tongue, 5 * A.tongue, '#E0616C'); line(c, 15, 41, 15, 46, 1.6, 'rgba(150,40,60,0.6)'); }));
      if (A.sweat > 0.01) fsInHead(lc, s2, (c) => paint(() => { sweatDrop(c, 58, -40 + 26 * ((t * 1.3) % 1), 0.55, A.sweat); sweatDrop(c, -60, -20 + 26 * ((t * 1.1 + 0.5) % 1), 0.45, A.sweat); }));
      if (A.mail) fsInHead(lc, s2, (c, r2) => A.mail(c, r2));
      // his arms and hands: the rubbing arm, then the patting arm (in front of his head)
      for (const side of ['L', 'R']) {
        const aw = A.arms[side], sh = rr['sh' + side];
        lc.lineCap = 'round';
        line(lc, sh[0], sh[1], aw.e[0], aw.e[1], 41, pal.coatSh); line(lc, sh[0], sh[1], aw.e[0], aw.e[1], 37, pal.coat);
        line(lc, aw.e[0], aw.e[1], aw.w[0], aw.w[1], 39, pal.coatSh); line(lc, aw.e[0], aw.e[1], aw.w[0], aw.w[1], 35, pal.coat);
        const L = Math.hypot(aw.w[0] - aw.e[0], aw.w[1] - aw.e[1]) || 1, ux = (aw.w[0] - aw.e[0]) / L, uy = (aw.w[1] - aw.e[1]) / L;
        line(lc, aw.w[0] - ux * 10, aw.w[1] - uy * 10, aw.w[0] - ux * 1, aw.w[1] - uy * 1, 42, pal.coatDk);
        phHand(lc, A.hands[side], Object.assign({ pal, thumb: side === 'L' ? -1 : 1 }, (A.handO && A.handO[side]) || {}));
      }
      if (A.post) A.post(lc, rr, s2);
      lc.restore();
    },
  });
  const P = (lx, ly) => [st.x + lx * st.s, st.y + ly * st.s];
  const HP = (lx, ly) => ofHeadPt(st, lx, ly);
  const S = (lx, ly) => toScreen(cam, ...P(lx, ly)), HS = (lx, ly) => toScreen(cam, ...HP(lx, ly));
  return { st, r, P, HP, S, HS, cam, head: HP(0, 0) };
}
function officeDraw(t, cam, A, o = {}) {
  ofRoom(cam, t, PH_ROOM_ANG + (o.ang || 0), o.w || 0, { lamp: o.lamp });
  applyCam(cam);
  ofChairBack(ctx);
  const H = phHero(cam, t, A);
  applyCam(cam);
  ofOcclude(H);
  return H;
}
// the arms and hands for two hand states (rig units)
function phArms(Lh, Rh) { return { L: phArm('L', Lh), R: phArm('R', Rh) }; }

// ================================================================ the hook (valid at negative time: the loop)
const PH_TH0 = 0.6;   // where the rub starts on frame 1
function rubTh(tt) { return PH_TH0 + 2 * Math.PI * cu().rub_hz * tt; }
// the two hands and his face at hook time tt
function hookState(tt) {
  const c = cu();
  let Lh, Rh, patH = 0, sq = 0, face = FF.focus, mode = 'test';
  if (tt < c.swap) {
    const b = phHookPat(tt); patH = b.h; sq = b.sq;
    Rh = phPatHand(b.h); Lh = phRubHand(rubTh(tt));
  } else {
    // SWAP: both hands come off and hesitate, then both pat, in unison (the tangle)
    const hes = ramp(tt, c.swap, c.swap + 0.22, E.outCubic) * (1 - ramp(tt, c.swap + 0.22, c.tangle_pats[0], E.inCubic));
    const b = phPatAt(tt, c.tangle_pats), go = ramp(tt, c.swap + 0.1, c.tangle_pats[0]);
    patH = lerp(0.85, b.h, go); sq = go * b.sq;
    const thR = 2 * Math.PI * 1.7 * (tt - c.swap);
    const Rp = phHeadRubHand(thR, patH), Rq = phPatHand(0.85);
    Rh = { P: [lerp(Rq.P[0], Rp.P[0], go), lerp(Rq.P[1], Rp.P[1], go) - 10 * hes], ang: lerp(Rq.ang, Rp.ang, go), sy: lerp(Rq.sy, Rp.sy, go), s: 1 };
    const Lr = phRubHand(rubTh(c.swap)), Lp = phTumPatHand(lerp(0.7, b.h, go));
    const k = ramp(tt, c.swap, c.swap + 0.25);
    Lh = { P: [lerp(Lr.P[0], Lp.P[0], k), lerp(Lr.P[1], Lp.P[1], k)], ang: lerp(Lr.ang, Lp.ang, k), sy: 1, s: lerp(1, Lp.s, k) };
    mode = 'tangle';
    face = lerpFace(FF.focus, FF.swap, ramp(tt, c.swap - 0.05, c.swap + 0.12));
    face = lerpFace(face, FF.lost, ramp(tt, c.swap + 0.45, c.tangled + 0.1));
    face = lerpFace(face, FF.yep, ramp(tt, c.right - 0.12, c.right + 0.12));
  }
  face = { ...face, blink: Math.max(face.blink || 0, phPulse(tt, [c.head - 0.05, c.tummy + 0.4], 0.12)) };
  const tongue = tt < c.swap ? 1 - ramp(tt, c.swap - 0.2, c.swap) : 0;
  return { Lh, Rh, patH, sq, face, mode, tongue, headDY: 5 * sq + 1.2 * Math.sin(tt * 2.1), headRot: 0.03 * Math.sin(tt * 1.3) + (mode === 'tangle' ? 0.05 * Math.sin(tt * 9) * ramp(tt, c.swap, c.swap + 0.4) : 0) };
}
function hookCam(tt) {
  const c = cu();
  return camKeys(tt, [[-0.4, 540, 1282, 2.32], [0, 540, 1282, 2.32], [1.5, 540, 1279, 2.38], [c.swap, 540, 1278, 2.42],
    [c.swap + 0.25, 540, 1284, 2.3], [c.right, 540, 1286, 2.26], [c.your, 540, 1284, 2.28]], E.inOutCubic);
}
// the pat ticks, the rub trail, the tangle scribble: what each hand has drawn lately (screen)
function hookTrails(H, tt, S) {
  const c = cu(), z = H.cam.zoom;
  const pts = [], n = 30, span = 0.8;
  for (let i = 0; i <= n; i++) { const x = tt - span * (1 - i / n), q = hookState(x); pts.push(H.S(...q.Lh.P)); }
  const rubK = tt < c.swap ? 1 : 1 - ramp(tt, c.swap, c.swap + 0.5);
  phTrail(pts, PH_CYAN, rubK, 3.2 * z);
  if (tt > c.swap) {   // the head hand's scribble and the tummy hand's pats leave a gold mess
    const p2 = [];
    for (let i = 0; i <= n; i++) { const x = Math.max(c.swap, tt - 1.1 * (1 - i / n)); const q = hookState(x).Rh; p2.push(H.S(q.P[0] - 18, q.P[1] - 12)); }
    phTrail(p2, PH_GOLD, ramp(tt, c.swap + 0.15, c.swap + 0.5), 3.4 * z, { noComet: true });
  }
  // pat ticks on his crown (and on his tummy in the tangle)
  if (S.sq > 0.05) {
    const top = H.S(S.Rh.P[0] - 10, S.Rh.P[1] - 14);
    phPatTicks(top[0], top[1], z / 2.2, S.sq);
    if (S.mode === 'tangle') { const tp = H.S(S.Lh.P[0] + 30, S.Lh.P[1] - 6); phPatTicks(tp[0], tp[1], z / 2.2, S.sq, '#FFE38A'); }
  }
}
function hookDraw(tt, t, cam) {
  const S = hookState(tt);
  const H = officeDraw(t, cam, { face: S.face, tongue: S.tongue, arms: phArms(S.Lh, S.Rh), hands: { L: S.Lh, R: S.Rh }, headDY: S.headDY, headRot: S.headRot, bob: 1.2 * Math.sin(tt * 2.2) });
  hookTrails(H, tt, S);
  return { H, S };
}
SC.hook = (lt, t, shot) => {
  const c = cu(), cam = hookCam(t);
  const { H } = hookDraw(t, t, cam);
  // SWAP: the two arrows chasing round, beside his head; then the "?!"
  const hd = H.HS(0, 0);
  phSwapIcon(hd[0] + 250, hd[1] - 40, 70, popK(t, c.swap - 0.04, c.swap + 0.75, 0.1, 0.15), -(t - c.swap) * 5);
  bigWord('?!', hd[0] - 250, hd[1] - 70, 110, '#FF5A6E', E.outBack(popK(t, c.swap + 0.5, c.right + 0.1, 0.12, 0.12), 2), -0.14);
  return { push: { k: 1 + 0.03 * ramp(t, c.swap, c.swap + 0.12) * (1 - ramp(t, c.swap + 0.12, c.swap + 0.6)), cx: 540, cy: 900 },
    flash: 0.18 * phSince(t, c.swap, 12) };
};

// ================================================================ the mail room (in his glass head)
// the state of the room at time t: which cards are where. cyc = one stamp cycle {stamp, copy, card (A's drop), flick
// (the copy's hop: into the shredder or the left funnel), land (A reaches the hand), shred (the copy is eaten, or null)}
function mrCycles() {
  const c = cu(), L = [];
  // the mail shot: one cycle, slow, the copy goes down the left tube too
  L.push({ stamp: c.stamp1, copy: c.copy1, drop: c.drop1, flick: c.drop1, landA: c.arrive1, landB: c.arrive1, shred: null, slow: 1 });
  // again: the copy that reaches his tummy hand (and the cards for each slow pat)
  for (const p of c.slow_pats) {
    const isCopy = Math.abs(p - c.card2_at) < 0.05;
    L.push({ stamp: p - 1.0, copy: isCopy ? p - 0.9 : null, drop: p - 0.8, flick: p - 0.8, landA: p, landB: isCopy ? p : null, shred: null });
  }
  // the shredder: every copy eaten (the first one before the shredder arrives still goes down the left tube)
  for (const p of c.shred_pats) {
    const shredOn = p - 0.12 > c.shredder_in - 0.02;
    L.push({ stamp: p - 0.36, copy: p - 0.27, drop: p - 0.18, flick: p - 0.14, landA: p, landB: shredOn ? null : p, shred: shredOn ? p - 0.02 : null });
  }
  for (const p of c.strain_pats) L.push({ stamp: p - 0.36, copy: p - 0.27, drop: p - 0.18, flick: p - 0.14, landA: p, landB: null, shred: p - 0.02 });
  for (const p of c.over_chomps) L.push({ stamp: p - 0.3, copy: p - 0.22, drop: p - 0.14, flick: p - 0.12, landA: p + 0.1, landB: null, shred: p });
  return L;
}
let MR_CYC = null;
// draw the room's contents for time t (head units; c is in head space). o: {shredK, mood, sweat, steam, clock, pile}
function mrContents(c, t, o = {}) {
  if (!MR_CYC) MR_CYC = mrCycles();
  const cc = cu();
  // the stamp's swing: down on each stamp time
  let sy = 0, mood = o.brainMood || 'calm', glowL = 0, glowR = 0;
  for (const y of MR_CYC) {
    const d = t - y.stamp;
    if (d > -0.14 && d < 0.2) sy = Math.max(sy, d < 0 ? E.inCubic(clamp((d + 0.14) / 0.14)) : 1 - E.outCubic(clamp(d / 0.2)));
    if (d > -0.14 && d < 0.3) mood = o.brainMood || 'stamp';
  }
  mrTubes(c, 1, t, { glowL, glowR });
  mrCounter(c);
  // the shredder (it stands on the counter's left end)
  const sk = o.shredK || 0;
  let chomp = 0;
  for (const y of MR_CYC) if (y.shred !== null) { const d = t - y.shred; if (d > -0.06 && d < 0.3) chomp = Math.max(chomp, Math.sin(clamp((d + 0.06) / 0.36) * Math.PI)); }
  if (o.chompFast) chomp = Math.max(chomp, 0.5 + 0.5 * Math.sin(t * 34));
  const shredTimes = MR_CYC.filter((y) => y.shred !== null && y.shred < t).map((y) => y.shred);
  if (sk > 0.01) {
    mrPile(c, o.pile || 0);
    const ss = 0.95 * (o.shredS || 1);
    mrShredder(c, MR.shred[0], MR.counterY - 11 * ss, ss, t, { k: sk, chomp, mood: o.mood || (chomp > 0.2 ? 'eat' : 'calm'), sweat: o.sweat, steam: o.steam, shake: o.shake || chomp * 0.6, hat: o.hat });
    mrStrips(c, t, shredTimes);
  }
  // the cards of each cycle
  for (const y of MR_CYC) {
    if (t < y.stamp - 0.5 || t > Math.max(y.landA, y.landB || 0, (y.shred || 0) + 0.1) + 0.1) continue;
    const slow = y.slow ? 1 : 0;
    const [cx, cy] = MR.card;
    // card A: printed on the stamp, then to the right funnel, down the tube
    const ink = clamp((t - y.stamp + 0.02) / 0.06);
    const da = ramp(t, y.drop, y.drop + (slow ? 0.32 : 0.12), phInQuad);
    if (t < y.drop + (slow ? 0.36 : 0.14)) {
      const x = lerp(cx, MR.fun.R[0], da), yy = lerp(cy, MR.fun.R[1] - 6, Math.pow(da, 1.6));
      mrCard(c, x, yy, { ink, rot: 0.6 * da, s: 1 - 0.25 * da });
    } else if (t < y.drop + (slow ? 0.6 : 0.3)) {
      const u = ramp(t, y.drop + (slow ? 0.36 : 0.14), y.drop + (slow ? 0.6 : 0.3), phLin);
      const p = mrTubeAt('R', u); mrCard(c, p[0], p[1], { ink: 1, rot: Math.PI / 2, s: 0.55 });
      glowR = 1;
    }
    // the copy: it slides out from under A, then down the left funnel or into the shredder
    if (y.copy !== null && t >= y.copy - 0.02) {
      const out = ramp(t, y.copy, y.copy + (slow ? 0.3 : 0.08), E.outBack);
      const fk = ramp(t, y.flick, y.flick + (slow ? 0.32 : 0.12), phInQuad);
      if (y.shred !== null && sk > 0.5) {
        // a hop up and into the slot on the shredder's top
        const sx = MR.shred[0], sTop = MR.counterY - 24 * 0.95 * (o.shredS || 1);
        if (t < y.shred + 0.08) {
          const x = lerp(cx - 15 * out, sx, fk), yy = lerp(cy, sTop - 2, fk) - 22 * Math.sin(Math.PI * fk);
          const into = ramp(t, y.shred - 0.06, y.shred + 0.06);
          mrCard(c, x, yy + 6 * into, { ink, copy: true, rot: -0.5 * fk + 1.6 * fk * fk, s: 1 - 0.3 * fk, squash: into });
        }
      } else if (t < y.flick + (slow ? 0.36 : 0.14)) {
        const x = lerp(cx - 15 * out, MR.fun.L[0], fk), yy = lerp(cy, MR.fun.L[1] - 6, Math.pow(fk, 1.6));
        mrCard(c, x, yy, { ink, copy: true, rot: -0.6 * fk, s: 1 - 0.25 * fk });
      } else if (t < y.flick + (slow ? 0.6 : 0.3)) {
        const u = ramp(t, y.flick + (slow ? 0.36 : 0.14), y.flick + (slow ? 0.6 : 0.3), phLin);
        const p = mrTubeAt('L', u); mrCard(c, p[0], p[1], { ink: 1, rot: -Math.PI / 2, s: 0.55, copy: true });
        glowL = 1;
      }
    }
    // a blank card waiting on the counter before the stamp
    if (t < y.stamp) mrCard(c, cx, cy, { ink: 0, s: ramp(t, y.stamp - 0.45, y.stamp - 0.3, E.outBack) });
  }
  if (o.clock > 0.01) mrClock(c, -48, -1, 7, t, o.clock, o.clockSpin || 2);
  mrBrain(c, t, { mood, stampY: sy, sweat: o.brainSweat || 0, look: o.look || 0 });
}
// the arm tubes and the cards on them (screen), for the cycles whose cards are outside his head now
function mrOutside(H, t, k, o = {}) {
  if (k <= 0.01) return;
  if (!MR_CYC) MR_CYC = mrCycles();
  const z = H.cam.zoom, w = Math.min(6.2 * z, 15);
  const PL = mrArmPts(H, 'L'), PR = mrArmPts(H, 'R');
  mrArmTube(PL, k, w, { flow: o.flow || 0, t });
  mrArmTube(PR, k, w, {});
  if (k < 0.98) return;
  for (const y of MR_CYC) {
    const slow = y.slow ? 1 : 0;
    const tA = y.drop + (slow ? 0.6 : 0.3);           // A leaves his head
    if (t > tA && t < y.landA) mrTubeCard(PR, inv(tA, y.landA, t), 11 * z, { rot: 0.2 });
    if (y.landB) {
      const tB = y.flick + (slow ? 0.6 : 0.3);
      if (t > tB && t < y.landB) mrTubeCard(PL, inv(tB, y.landB, t), 11 * z, { rot: -0.2 });
    }
  }
}

// ---------------------------------------------------------------- the mail shot: in, stamp, copy, out, both hands
function mailHands(t) {
  const c = cu();
  // the hands wait (the orders are on their way), then both pat when the cards land
  const wait = 1 - ramp(t, c.arrive1 - 0.05, c.arrive1 + 0.05);
  const b = phPatAt(t, c.both_pats);
  const hR = lerp(0.55 + 0.04 * Math.sin(t * 3), b.h, 1 - wait), hL = lerp(0.45 + 0.04 * Math.sin(t * 3.3), b.h, 1 - wait);
  return { Rh: phPatHand(hR), Lh: phTumPatHand(hL), sq: (1 - wait) * b.sq };
}
function mailCam(t) {
  const c = cu(), s0 = phShot('mail').start;
  return camKeys(t, [[s0, 540, 1284, 2.28], [c.your + 0.05, 540, 1262, 2.6], [c.brain + 0.35, 540, 1173, 5.4], [c.pull1, 540, 1175, 5.7],
    [c.pull1 + 0.55, 540, 1288, 1.9], [c.hands_end, 540, 1292, 1.82], [phShot('mail').end, 540, 1292, 1.8]], E.inOutCubic);
}
SC.mail = (lt, t, shot) => {
  const c = cu(), cam = mailCam(t), M = mailHands(t);
  const gk = ramp(t, c.your - 0.04, c.your + 0.16);
  const H = officeDraw(t, cam, {
    face: FF.lost, arms: phArms(M.Lh, M.Rh), hands: { L: M.Lh, R: M.Rh }, headDY: 4 * M.sq,
    mail: (cc) => { mrGlass(cc, gk); if (gk > 0.3) { cc.save(); cc.globalAlpha = clamp((gk - 0.3) / 0.6); mrContents(cc, t, {}); cc.restore(); } mrRim(cc, gk); },
  });
  mrOutside(H, t, ramp(t, c.your + 0.1, c.brain + 0.2));
  // the cards land: a flash at each hand
  const land = phSince(t, c.arrive1, 7) * (t > c.arrive1 ? 1 : 0);
  if (land > 0.02) for (const side of ['L', 'R']) { const w = H.S(...H.r['wr' + side]); softDot(gctx, w[0], w[1], 90 * land, '#FFD447', 0.7 * land); }
  if (M.sq > 0.05) { const top = H.S(M.Rh.P[0] - 10, M.Rh.P[1] - 14); phPatTicks(top[0], top[1], cam.zoom / 2.2, M.sq); const tp = H.S(M.Lh.P[0] + 30, M.Lh.P[1] - 6); phPatTicks(tp[0], tp[1], cam.zoom / 2.2, M.sq, '#FFE38A'); }
  // labels on the two tubes once we are out
  const lk = popK(t, c.both - 0.05, shot.end + 1, 0.12);
  if (lk > 0.01) { const a = H.S(...H.r.wrL), b = H.S(...H.r.wrR); phTag('PAT!', a[0] - 30, a[1] + 92, '#FFD447', lk, 34); phTag('PAT!', b[0] + 40, b[1] - 120, '#FFD447', lk, 34); }
  const dive = ramp(t, c.your + 0.05, c.brain + 0.35) * (1 - ramp(t, c.brain + 0.3, c.brain + 0.45));
  const pull = ramp(t, c.pull1, c.pull1 + 0.2) * (1 - ramp(t, c.pull1 + 0.3, c.pull1 + 0.55));
  return { zblur: 0.05 * dive + 0.05 * pull, zcx: 540, zcy: 900, flash: 0.14 * phSince(t, c.your, 9) };
};

// ---------------------------------------------------------------- again: slowly, the copy reaches his tummy hand
function againHands(t) {
  const c = cu();
  const b = phPatAt(t, c.slow_pats);
  const settle = ramp(t, c.go, c.slowly + 0.2);
  const th = PH_TH0 + 2 * Math.PI * 0.5 * (t - c.go) * settle;
  // the copy lands: the rubbing hand jerks into a pat
  const bump = Math.exp(-Math.pow((t - c.card2_at - 0.05) / 0.09, 2));
  let Lh = phRubHand(th, { r: lerp(0.4, 1, settle) });
  if (bump > 0.01) { const Lp = phTumPatHand(1); Lh = { P: [lerp(Lh.P[0], Lp.P[0], bump), lerp(Lh.P[1], Lp.P[1], bump)], ang: lerp(Lh.ang, Lp.ang, bump), sy: 1, s: lerp(1, Lp.s, bump) }; }
  return { Rh: phPatHand(lerp(0.5, b.h, settle)), Lh, sq: b.sq * settle, bump, th };
}
function againCam(t) {
  const c = cu(), s = phShot('again');
  return camKeys(t, [[s.start, 540, 1296, 1.9], [c.slowly, 540, 1290, 2.0], [c.feel, 540, 1290, 2.04], [c.hand2, 506, 1352, 3.2],
    [c.card2_at, 504, 1356, 3.3], [s.end, 506, 1352, 3.45]], E.inOutCubic);
}
SC.again = (lt, t, shot) => {
  const c = cu(), cam = againCam(t), M = againHands(t);
  const H = officeDraw(t, cam, {
    face: FF.slow, arms: phArms(M.Lh, M.Rh), hands: { L: M.Lh, R: M.Rh }, headDY: 4 * M.sq,
    mail: (cc) => { mrGlass(cc, 1); mrContents(cc, t, {}); mrRim(cc, 1); },
  });
  mrOutside(H, t, 1, { flow: 1 });
  // the rub's trail (slow)
  const pts = [];
  for (let i = 0; i <= 30; i++) { const x = t - 1.6 * (1 - i / 30); pts.push(H.S(...againHands(x).Lh.P)); }
  phTrail(pts, PH_CYAN, ramp(t, c.go + 0.3, c.slowly + 0.3), 3.2 * cam.zoom);
  if (M.sq > 0.05) { const top = H.S(M.Rh.P[0] - 10, M.Rh.P[1] - 14); phPatTicks(top[0], top[1], cam.zoom / 2.2, M.sq); }
  // the bump on his tummy: ticks and a PAT! tag
  if (M.bump > 0.05) { const tp = H.S(M.Lh.P[0] + 30, M.Lh.P[1] - 6); phPatTicks(tp[0], tp[1], cam.zoom / 2.6, M.bump, '#FFE38A'); }
  const w = H.S(...H.r.wrL);
  phBurst('PAT!', w[0] + 150, w[1] - 170, 70, '#FFD447', popK(t, c.card2_at, c.too_end + 0.3, 0.1, 0.12), -0.12, 5);
  // slow motion: a tag
  phTag('SLOW-MO', 540, 470, '#7FE9FF', popK(t, c.slowly - 0.05, c.feel + 0.1, 0.12, 0.12), 38);
  return { push: { k: 1 + 0.02 * ramp(t, c.card2_at, c.card2_at + 0.1) * (1 - ramp(t, c.card2_at + 0.1, c.card2_at + 0.4)), cx: 540, cy: 1000 } };
};

// ---------------------------------------------------------------- the shredder arrives: every copy eaten
function shredHands(t) {
  const c = cu(), b = phPatAt(t, c.shred_pats);
  return { Rh: phPatHand(b.h), Lh: phRubHand(rubTh(t)), sq: b.sq };
}
function shredCam(t) {
  const c = cu(), s = phShot('shred');
  return camKeys(t, [[s.start, 520, 1230, 3.0], [c.so + 0.35, 530, 1170, 5.5], [c.shreds, 524, 1167, 5.7], [c.every3, 522, 1168, 5.9], [s.end, 522, 1170, 6.1]], E.inOutCubic);
}
SC.shred = (lt, t, shot) => {
  const c = cu(), cam = shredCam(t), M = shredHands(t);
  const sk = ramp(t, c.shredder_in, c.shredder_in + 0.25);
  const H = officeDraw(t, cam, {
    face: FF.slow, arms: phArms(M.Lh, M.Rh), hands: { L: M.Lh, R: M.Rh }, headDY: 4 * M.sq,
    mail: (cc) => { mrGlass(cc, 1); mrContents(cc, t, { shredK: sk, pile: 0.25 * ramp(t, c.shreds, shot.end) }); mrRim(cc, 1); },
  });
  mrOutside(H, t, 1, { flow: 1 });
  if (M.sq > 0.05) { const top = H.S(M.Rh.P[0] - 10, M.Rh.P[1] - 14); phPatTicks(top[0], top[1], cam.zoom / 2.2, M.sq); }
  // a SHRED! on each copy it eats on "every single pat"
  const sp = H.HS(MR.shred[0], MR.shred[1] - 22);
  for (const [i, p] of c.shred_pats.entries()) if (p > c.every3 - 0.1 && p - 0.02 < shot.end) phBurst('SHRED!', sp[0] - 10 + (i % 2 ? 40 : -20), sp[1] - 60, 56, '#FF5A6E', popK(t, p - 0.02, p + 0.36, 0.06, 0.1), i % 2 ? 0.1 : -0.12, 9 + i);
  const dive = ramp(t, shot.start, c.so + 0.35) * (1 - ramp(t, c.so + 0.3, c.so + 0.4));
  return { zblur: 0.04 * dive, zcx: 540, zcy: 960 };
};

// ---------------------------------------------------------------- the strain: him, gritted teeth
function strainHands(t) { const c = cu(), b = phPatAt(t, c.strain_pats); return { Rh: phPatHand(b.h), Lh: phRubHand(rubTh(t)), sq: b.sq }; }
SC.payoff = (lt, t, shot) => {
  const c = cu(), M = strainHands(t);
  const cam = camKeys(t, [[shot.start, 540, 1262, 2.55], [c.strain, 540, 1255, 2.65], [shot.end, 540, 1250, 2.75]], E.inOutCubic);
  const shk = ramp(t, c.strain - 0.1, c.strain + 0.2);
  const H = officeDraw(t, cam, {
    face: lerpFace(FF.slow, FF.strain, shk), arms: phArms(M.Lh, M.Rh), hands: { L: M.Lh, R: M.Rh },
    headDY: 4 * M.sq, headRot: 0.025 * shk * Math.sin(t * 40), sweat: ramp(t, c.strain, c.feel4),
  });
  const pts = [];
  for (let i = 0; i <= 30; i++) { const x = t - 0.8 * (1 - i / 30); pts.push(H.S(...strainHands(x).Lh.P)); }
  phTrail(pts, PH_CYAN, 1, 3.2 * cam.zoom);
  if (M.sq > 0.05) { const top = H.S(M.Rh.P[0] - 10, M.Rh.P[1] - 14); phPatTicks(top[0], top[1], cam.zoom / 2.2, M.sq); }
  // strain marks by his temples
  const hd = H.HS(0, 0);
  if (shk > 0.05) for (const s of [-1, 1]) for (let i = -1; i <= 1; i++) {
    const a = (s > 0 ? 0 : Math.PI) + i * 0.32, r0 = 190, r1 = 230 + 8 * Math.sin(t * 30 + i);
    line(ctx, hd[0] + Math.cos(a) * r0, hd[1] - 60 + Math.sin(a) * r0 * 0.6, hd[0] + Math.cos(a) * r1, hd[1] - 60 + Math.sin(a) * r1 * 0.6, 6, rgba('#FFFFFF', 0.85 * shk));
  }
  return { push: { k: 1 + 0.02 * lt / (shot.end - shot.start), cx: 540, cy: 900 } };
};

// ---------------------------------------------------------------- overtime: close on the shredder in his head
SC.overtime = (lt, t, shot) => {
  const c = cu(), M = strainHands(t);
  // the camera inside his head: head point (-26, -24) in the middle of the frame (world = head units, the head at s 1)
  const hd = ofHeadPt(fsSt({ arms: phArms(M.Lh, M.Rh) }), 0, 0);
  const fx = hd[0] - 40, fy = hd[1] - 16;
  const cam = camKeys(t, [[shot.start, fx + 12, fy - 8, 7.6], [c.shredder, fx, fy, 9.6], [c.working, fx, fy + 1, 10.1], [shot.end, fx, fy + 1, 10.6]], E.inOutCubic);
  const ot = ramp(t, c.working - 0.1, c.overtime + 0.2);
  const H = officeDraw(t, cam, {
    face: FF.strain, arms: phArms(M.Lh, M.Rh), hands: { L: M.Lh, R: M.Rh }, headDY: 0,
    mail: (cc) => { mrGlass(cc, 1); mrContents(cc, t, { shredK: 1, shredS: 1.15, mood: 'strain', sweat: 1, steam: 0.4 + 0.6 * ot, shake: 0.4 + 0.8 * ot, chompFast: ot > 0.5, pile: 0.35 + 0.65 * ramp(t, shot.start, shot.end), clock: ramp(t, c.tiny, c.tiny + 0.3), clockSpin: 2 + 10 * ot, brainSweat: 1, brainMood: 'strain' }); mrRim(cc, 1); },
  });
  return { push: { k: 1 + 0.015 * Math.sin(t * 50) * ot, cx: 540, cy: 900 } };
};

// ================================================================ the kitchen: little him
function kidsCam(t) {
  const c = cu(), s = phShot('kids');
  return camKeys(t, [[s.start, 606, 1404, 1.92], [c.kids, 604, 1408, 2.0], [c.squeeze, 630, 1418, 2.12], [c.other, 576, 1404, 2.08],
    [c.till, 600, 1412, 2.0], [s.end, 600, 1416, 2.05]], E.inOutCubic);
}
SC.kids = (lt, t, shot) => {
  const c = cu(), cam = kidsCam(t);
  kcRoom(cam, t);
  applyCam(cam);
  kcChairBack(ctx);
  // squeezes
  const dq = Math.sin(Math.PI * clamp((t - c.duck) / 0.3));
  const jq = ramp(t, c.juice, c.juice + 0.3) * (1 - ramp(t, c.splat + 0.1, c.splat + 0.4));
  const splat = ramp(t, c.splat, c.splat + 0.15), drip = ramp(t, c.splat + 0.3, c.till + 0.5);
  let face = FF.babble;
  face = lerpFace(face, FF.wow, popK(t, c.duck - 0.05, c.duck + 0.5, 0.1, 0.2));
  face = lerpFace(face, FF.splat, popK(t, c.splat - 0.04, c.splat + 0.5, 0.05, 0.2));
  face = lerpFace(face, FF.giggle, ramp(t, c.splat + 0.4, c.splat + 0.6) * (1 - ramp(t, c.till - 0.1, c.till + 0.1)));
  face = lerpFace(face, FF.wow, ramp(t, c.till - 0.1, c.till + 0.15));
  face = lerpFace(face, FF.babble, ramp(t, c.ten, c.ten + 0.2));
  face = { ...face, blink: Math.max(face.blink || 0, phPulse(t, [c.kids + 0.3, c.age], 0.12)) };
  const bob = 3 * Math.sin(t * 6) * (1 - jq);
  const K = kcHero(cam, t, {
    face, bob, headRot: 0.05 * Math.sin(t * 3.4) + 0.12 * popK(t, c.splat - 0.02, c.splat + 0.3, 0.04, 0.2), splat, drip,
    armL: { e: [-122, -306], w: [-86 + 4 * jq, -268] }, armR: { e: [122, -306], w: [86 - 4 * dq, -268 + 3 * dq] },
    post: (lc) => {
      // the props in his hands, then his hands round them
      kcJuice(lc, -112, -300, 0.62, jq);
      kcDuckShape(lc, 116, -296, 0.62, dq, dq);
      for (const [side, x, sq] of [['L', -92, jq], ['R', 92, dq]]) {
        const s = side === 'L' ? -1 : 1;
        phHand(lc, { P: [x + s * 22, -262], ang: s > 0 ? -0.6 : Math.PI + 0.6, sy: 1, s: 0.72 }, { pal: KIDPAL2, thumb: s, curl: 0.55 + 0.35 * sq });
      }
    },
  });
  applyCam(cam);
  kcTray(ctx);
  // the cake slides onto the tray
  const ck = ramp(t, c.cake, c.cake + 0.35, E.outBack);
  if (ck > 0.01) { const p = K.P(0, -270); kcCake(ctx, lerp(p[0] + 500, p[0] + 34, ck), p[1] - 4, 0.8 * KC.s, ck, ramp(t, c.ten - 0.05, c.ten + 0.1), t); }
  // the juice jet from the straw to his face
  const straw = K.S(-112 + 26 * 0.62, -300 - (44 + 38) * 0.62), face0 = K.HS(-26, 22);
  kcJet(straw, face0, ramp(t, c.jet0, c.splat, E.inOutSine), ramp(t, c.splat + 0.05, c.splat + 0.3));
  // SQUEAK! and SPLAT!
  const dk = K.S(150, -360);
  phBurst('SQUEAK!', dk[0] + 90, dk[1] + 10, 62, '#FFD447', popK(t, c.duck, c.duck + 0.6, 0.06, 0.12), 0.12, 21);
  phBurst('SPLAT!', face0[0] - 170, face0[1] - 40, 64, '#FF9A3C', popK(t, c.splat, c.splat + 0.6, 0.06, 0.12), -0.14, 22);
  // the window on his head: the baby shredder with a pacifier, which grows up at TEN
  const top = K.HS(30, -96), wk = popK(t, c.kids - 0.1, shot.end + 1, 0.2);
  const grow = ramp(t, c.ten - 0.05, c.ten + 0.3, E.outBack);
  kcWindow(806, 640, 162, top, wk, (cx) => {
    cx.save();
    const g = cx.createRadialGradient(0, -40, 10, 0, 0, 200); g.addColorStop(0, '#2C3C78'); g.addColorStop(1, '#0C1436');
    cx.fillStyle = g; cx.fillRect(-200, -200, 400, 400);
    cx.translate(0, 26); cx.scale(6.6, 6.6);
    // a card that zips past the baby (it can't eat with that pacifier in)
    const zk = ramp(t, c.other - 0.1, c.squeezes + 0.1, E.inOutSine);
    if (zk > 0.01 && zk < 0.99) mrCard(cx, lerp(34, -36, zk), -18 + 8 * Math.sin(zk * 9), { ink: 1, txt: 'SQUEEZE', size: 5.2, rot: -0.3 + 0.6 * zk, s: 0.9 });
    const eat = Math.sin(Math.PI * clamp((t - c.ten - 0.25) / 0.3));
    mrShredder(cx, 0, 4, 0.95 + 0.4 * grow, t, { k: 1, mood: grow > 0.5 ? (eat > 0.2 ? 'eat' : 'calm') : 'baby', chomp: eat, pacifier: 1 - grow, hat: grow, shake: 0 });
    if (grow > 0.5 && t < c.ten + 0.35) mrCard(cx, 0, -14 + 18 * ramp(t, c.ten + 0.05, c.ten + 0.35), { ink: 1, txt: 'SQUEEZE', size: 5.2, s: 0.9, squash: ramp(t, c.ten + 0.2, c.ten + 0.35) });
    cx.restore();
  });
  phTag('AGE 10', 806, 852, '#FFD447', popK(t, c.ten, shot.end + 1, 0.12), 38);
  return { push: { k: 1 + 0.015 * ramp(t, c.juice + 0.3, c.splat + 0.1) * (1 - ramp(t, c.splat + 0.1, c.splat + 0.4)), cx: 540, cy: 900 } };
};

// ================================================================ FASTER, then the loop
function buttonHands(t) {
  const c = cu(), b = phPatAt(t, c.fast_pats);
  const sp = ramp(t, c.now6, c.faster + 0.2);
  const th = PH_TH0 + 2 * Math.PI * (1.1 * (t - c.now6) + 1.3 * Math.max(0, t - c.now6) * sp);
  return { Rh: phPatHand(b.h, { amp: 0.8 }), Lh: phRubHand(th), sq: b.sq, sp };
}
SC.button = (lt, t, shot) => {
  const c = cu(), M = buttonHands(t);
  const cam = camKeys(t, [[shot.start, 540, 1318, 1.78], [c.faster, 540, 1330, 1.72], [shot.end, 540, 1336, 1.7]], E.inOutCubic);
  const fast = ramp(t, c.faster - 0.1, c.faster + 0.3);
  const spinW = 2.2 * fast, ang = 1.4 * Math.pow(Math.max(0, t - c.faster + 0.1), 2) * fast;
  const H = officeDraw(t, cam, {
    face: lerpFace(FF.focus, FF.frantic, ramp(t, c.try, c.faster + 0.1)), arms: phArms(M.Lh, M.Rh), hands: { L: M.Lh, R: M.Rh },
    headDY: 4 * M.sq, headRot: 0.03 * Math.sin(t * 31) * fast, sweat: fast,
  }, { ang, w: spinW });
  const pts = [];
  for (let i = 0; i <= 30; i++) { const x = t - 0.45 * (1 - i / 30); pts.push(H.S(...buttonHands(x).Lh.P)); }
  phTrail(pts, PH_CYAN, 1, 3.4 * cam.zoom);
  if (M.sq > 0.05) { const top = H.S(M.Rh.P[0] - 10, M.Rh.P[1] - 14); phPatTicks(top[0], top[1], cam.zoom / 2.2, M.sq); }
  const hp = H.S(...M.Rh.P), tp = H.S(...M.Lh.P);
  phSpeedArcs(hp[0], hp[1] - 20, 70, M.sp, t); phSpeedArcs(tp[0], tp[1], 90, M.sp, t + 1, '#BFF6FF');
  return { push: { k: 1 + 0.03 * fast, cx: 540, cy: 860 } };
};
// the last 0.45 s: the hook at negative time, so the last frame runs straight into frame 1
SC.loop = (lt, t, shot) => {
  const tt = t - TLd.duration, cam = hookCam(tt);
  hookDraw(tt, t, cam);
  return {};
};

// ================================================================ the cover (src/cover.sh renders SC.cover)
SC.cover = (lt, t, shot) => {
  const c = cu(), tt = c.hook_pats[3] + 0.012, cam = { x: 540, y: 1288, zoom: 2.55, rot: 0 };
  const S = hookState(tt);
  const H = officeDraw(t, cam, { face: FF.strain, arms: phArms(S.Lh, S.Rh), hands: { L: S.Lh, R: S.Rh }, headDY: 0, sweat: 1 });
  hookTrails(H, tt, S);
  bigWord('NOW SWAP!', 540, 1418, 150, '#FFD447', 1, -0.04);
  return { noCaptions: true, noSubscribe: true };
};

function initScenes2() {
  initOffice();
  initKitchen();
  MR_CYC = null;
}
