// Can You Do Fist, EDGE, Palm? — the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash, flashTop, grain: 0,
//    overlay: fn, noCaptions, capY, focus}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
// Worlds: fp_world.js (the meadow, the picnic table, the hand on the planks, the STOP sign, the ninja, the goat), fist3d.js
// (one-finger's 3D hand), bwhand.js (bent-wrist-fist's forearm), s7_world.js (sign-seven's s7Geo and labels). The whole
// Short is ONE state over time (`fpS(tt)`, valid at negative time for the loop), drawn through a different camera per
// shot, so the hand never jumps between cuts.
'use strict';

const cu = () => TLd.cues;

// ---------------------------------------------------------------- the light (reference/visual.md "The light")
const FP_DAY = { ...LIGHTS.day, rimAmt: 1.05, pool: 0.32, halo: 0.1 };
const FP_CLINIC = { ...LIGHTS.day, keyTint: [1.12, 1.03, 0.9], rimAmt: 1.2, pool: 0.45, halo: 0.14 };
setLights({ hook: FP_DAY, side: FP_DAY, fast: FP_DAY, jam: FP_DAY, brakes: FP_DAY, again: FP_DAY, stop: FP_DAY,
  sneak: FP_DAY, fistfist: FP_DAY, doctor: FP_CLINIC, relax: FP_DAY, smart: FP_CLINIC, smartb: FP_CLINIC, button: FP_DAY,
  cover: FP_DAY });

const FP_RU = 0.28;                    // cm per rig unit (the hiker)
const FP_HAND = { x: 8, z: 2, head: -0.22 };   // the wrist on the table plan; the forearm points ahead and a little left
const FP_GOAT = [0, -18, -54];           // the goat's chest where it meets the table top (world)

// ---------------------------------------------------------------- the taps (one list for the whole Short)
let FP_TAPS = null;
function fpTapList() {
  if (FP_TAPS) return FP_TAPS;
  const c = cu();
  const n = c.now1;
  FP_TAPS = [
    [0, 'F'], [0.36, 'E'], [0.72, 'P'],
    [c.fist1, 'F'], [c.edge1, 'E'], [c.palm1, 'P'],
    [n + 0.04, 'F'], [n + 0.24, 'E'], [n + 0.44, 'P'], [n + 0.64, 'F'],
    [c.jam, 'F', { hold: 0.42 }],                   // the mix-up: a fist where the edge should be, and it sticks
    [c.go + 0.02, 'F'], [c.again + 0.22, 'E', { hold: 0.5 }],
    [c.stop1 + 0.02, 'P', { hold: 0.55 }],           // "STOP": the palm lands as the sign flashes
    [c.starts + 0.02, 'F', { hold: 99 }],            // "starts": the fist (then the sneak takes over: fpSneak)
    [c.fist2 + 0.02, 'F'], [c.bonk3, 'F'],           // Fist... FIST!
    [c.doctors + 0.25, 'P', { hold: 0.38, h: 3 }],   // he lays the hand flat and waits
    [c.backwards + 0.04, 'P'], [c.backwards + 0.8, 'E'], [c.end, 'F'],   // BACKWARDS: palm, edge... and the fist on the loop
  ];
  return FP_TAPS;
}
// the hand at time tt (negative = the Short's last frames: the loop)
function fpHandAt(tt) {
  const c = cu();
  if (tt < 0) tt += c.end;
  const taps = fpTapList();
  // hold: the hand stays down until `hold` seconds before the next tap
  let i = -1;
  for (let j = 0; j < taps.length; j++) if (taps[j][0] <= tt) i = j;
  let S;
  if (i >= 0 && taps[i][2] && taps[i][2].hold && taps[i + 1]) {
    const a = taps[i], b = taps[i + 1], rise = Math.min(a[2].hold, b[0] - a[0]);
    if (tt < b[0] - rise) S = fpTaps(tt, [a]);
    else S = fpTaps(tt, [[b[0] - rise, a[1], a[2].h ? { h: a[2].h } : {}], b]);
    S.since = tt - a[0]; S.cur = a[1];
  } else S = fpTaps(tt, taps);
  S.slide = [0, 0];
  // the jam: the fist skids forward 3.5 cm
  const sk = tt >= c.jam - 0.02 && tt < c.go ? E.outCubic(clamp((tt - c.jam + 0.02) / 0.22)) : 0;
  if (sk > 0) S.slide = [Math.sin(FP_HAND.head) * 3.5 * sk, -Math.cos(FP_HAND.head) * 3.5 * sk];
  // the sneak: after "starts" the hand rises to make the edge, opens halfway, hangs (the STOP sign sputters), then the
  // ninja slips in and it snaps back to a fist for "Fist..."
  if (tt >= c.starts + 0.02 && tt < c.fist2 + 0.02) {
    const up = E.inOutSine(clamp((tt - c.miss + 0.1) / 0.5)), back = clamp((tt - (c.in_end - 0.15)) / 0.3);
    const down = E.inCubic(clamp((tt - (c.fist2 - 0.2)) / 0.22));
    S.lift = 4.5 * up * (1 - down) + 0.5 * Math.sin(tt * 7) * up * (1 - back);
    S.curl = lerp(1, lerp(0.45, 1, E.outBack(back, 2)), up);
    S.rot = 1;
    S.cur = 'F';
  }
  return S;
}

// ---------------------------------------------------------------- the whole state at time tt
function fpS(tt) {
  const c = cu(), S = {};
  const r = (a, b, e = E.inOutCubic) => (tt < 0 ? 0 : ramp(tt, a, b, e));
  S.hand = fpHandAt(tt);
  const t0 = tt < 0 ? tt + c.end : tt;
  // ---- the STOP sign on his wrist: up on "BRAKES", flashing at each landing of the slow run, sputtering out on "stop,"
  const inStop = t0 >= c.slam - 0.05 && t0 < c.doctors;
  S.stop = { k: inStop ? E.outBack(clamp((t0 - c.slam + 0.05) / 0.25), 2) * (1 - clamp((t0 - c.doctors + 0.25) / 0.2)) : 0, flash: 0, off: 0 };
  if (inStop) {
    for (const f of [c.slam, c.again + 0.22, c.stop1 + 0.02, c.starts + 0.02]) S.stop.flash = Math.max(S.stop.flash, popK(t0, f - 0.02, f + 0.45, 0.04, 0.35));
    if (t0 > c.stop2 - 0.08) {
      const sp = t0 - (c.stop2 - 0.08);
      S.stop.off = sp < 0.55 ? (Math.sin(sp * 60) > 0.2 ? 1 : 0.2) : 1;   // it sputters, then goes dark
    }
  }
  // ---- the ghost of the shape just stopped (the slow run): it stays where it was and fades
  S.ghost = null;
  for (const [ta, from] of [[c.again + 0.22, 'F'], [c.stop1 + 0.02, 'E'], [c.starts + 0.02, 'P']]) {
    const g = t0 >= ta ? clamp(1 - (t0 - ta) / 0.6) : 0;
    if (g > 0.01) S.ghost = { shape: from, k: g };
  }
  // ---- the ninja: a ghost fist in a mask tiptoes up the forearm from the elbow into the hand
  S.ninja = t0 >= c.old - 0.15 && t0 < c.in_end + 0.2 ? { u: E.inOutSine(clamp((t0 - c.old + 0.15) / (c.in_end - c.old + 0.05))), k: popK(t0, c.old - 0.15, c.in_end + 0.2, 0.15, 0.15) } : null;
  S.poof = popK(t0, c.in_end, c.in_end + 0.45, 0.04, 0.35);
  // ---- skid marks and smoke at the jam
  S.skid = t0 >= c.jam - 0.02 && t0 < c.go ? clamp((t0 - c.jam + 0.02) / 0.22) * (1 - clamp((t0 - (c.go - 0.4)) / 0.4)) : 0;
  S.smoke = t0 >= c.jam && t0 < c.jam + 1.2 ? (t0 - c.jam) / 1.2 : 0;
  S.smoke2 = t0 >= c.slam && t0 < c.slam + 1.0 ? (t0 - c.slam) / 1.0 : 0;
  // ---- impacts: one at each landing, bigger at the jam and the second FIST
  S.impact = 0; S.impactBig = 0;
  for (const tp of fpTapList()) {
    if (tp[0] <= 0.01) continue;
    const big = Math.abs(tp[0] - c.jam) < 0.01 || Math.abs(tp[0] - c.bonk3) < 0.01;
    const k = t0 >= tp[0] ? clamp(1 - (t0 - tp[0]) / 0.22) : 0;
    if (big) S.impactBig = Math.max(S.impactBig, k); else S.impact = Math.max(S.impact, k);
  }
  if (t0 < 0.22) S.impact = Math.max(S.impact, 1 - t0 / 0.22);   // frame 0's bonk
  // ---- the goat
  let mood = 'chew', daisy = 1, mirror = 0, board = 0, glasses = 0, sweat = 0, tap = { shape: 'P', lift: 0 }, look = [0, 0.6], tilt = 0;
  if (tt >= 0) {
    if (t0 >= c.jam) { mood = 'stop'; look = [0.3, 0.8]; tilt = -0.06; }
    if (t0 >= c.go) { mood = 'focus'; tilt = 0; }
    if (t0 >= c.old) { mood = 'smug'; }
    if (t0 >= c.fist3) { mood = 'stop'; tilt = 0.07; }
    if (t0 >= c.doctors - 0.1) { mood = 'smug'; daisy = 0; look = [0, 0.4]; tilt = 0; }
    mirror = r(c.doctors - 0.1, c.doctors + 0.25) * (1 - r(c.now2 - 0.1, c.now2 + 0.15));
    board = r(c.use - 0.05, c.use + 0.3) * (1 - r(c.in2 - 0.15, c.in2 + 0.2));
    // its perfect run: fist, edge, palm on "exact test"
    const cl = [[c.clop, 'F'], [c.clop + 0.24, 'E'], [c.clop + 0.48, 'P']];
    for (let i = 0; i < cl.length; i++) { const d = t0 - cl[i][0] + 0.12; if (d >= 0 && d < 0.24) { tap = { shape: i === 0 ? 'F' : cl[i - 1][1], lift: Math.sin(Math.PI * d / 0.24) * 0.9 }; if (d >= 0.12) tap.shape = cl[i][1]; } }
    if (t0 >= c.relax) { mood = 'chew'; daisy = 0; }
    glasses = r(c.in2 - 0.1, c.in2 + 0.25) * (1 - r(c.now2 - 0.05, c.now2 + 0.3));
    if (t0 >= c.in2) { mood = 'focus'; }
    // its own fast run on "being smart": fist, edge, palm, fist... FIST (the mix-up on "didn't")
    const sm = [[c.being - 0.05, 'F'], [c.being + 0.15, 'E'], [c.being + 0.35, 'P'], [c.being + 0.55, 'F'], [c.clonk, 'F']];
    for (let i = 0; i < sm.length; i++) { const d = t0 - sm[i][0] + 0.09; if (d >= 0 && d < 0.18) { tap = { shape: i === 0 ? 'F' : sm[i - 1][1], lift: Math.sin(Math.PI * d / 0.18) * 0.8 }; if (d >= 0.09) tap.shape = sm[i][1]; } }
    if (t0 >= c.clonk) { mood = 'cross'; sweat = r(c.clonk, c.clonk + 0.3); tap = { shape: 'F', lift: 0 }; }
    if (t0 >= c.now2) { mood = 'chew'; daisy = r(c.now2 + 0.4, c.now2 + 0.9); sweat = 0; tap = { shape: 'P', lift: 0 }; look = [0, 0.6]; }
  }
  S.goat = { mood, daisy, mirror, board, glasses, sweat, tap, look, tilt, blink: fpBlink(t0 + 0.4, 0.55), chew: t0 };
  // ---- his face
  const lookHand = { lookX: -0.25, lookY: 0.85 };
  let f = { ...FACES.calm, ...lookHand, mouth: 'flat', mouthOpen: 0.15, browY: 0.3 };
  if (tt >= 0) {
    f = lerpFace(f, { ...FACES.nervous, ...lookHand, mouth: 'grimace', eyeOpen: 1.05 }, r(c.now1, c.fast1));
    f = lerpFace(f, { ...FACES.shock, lookX: -0.3, lookY: 0.8, mouthOpen: 0.7 }, r(c.jam, c.jam + 0.12));
    f = lerpFace(f, { ...FACES.confused, ...lookHand }, r(c.hands, c.hands + 0.2));
    f = lerpFace(f, { ...FACES.calm, ...lookHand, eyeOpen: 1.0, mouth: 'flat' }, r(c.go - 0.1, c.go + 0.2));
    f = lerpFace(f, { ...FACES.startled, ...lookHand, eyeOpen: 1.3, mouth: 'o', mouthOpen: 0.5 }, r(c.in_end - 0.1, c.in_end + 0.1));
    f = lerpFace(f, { ...FACES.shock, lookX: 0, lookY: 0.9, mouthOpen: 0.8, eyeOpen: 1.35 }, r(c.fist3, c.fist3 + 0.1));
    f = lerpFace(f, { ...FACES.worried, lookX: 0.1, lookY: -0.2 }, r(c.doctors, c.doctors + 0.2));
    f = lerpFace(f, { ...FACES.grin, lookX: 0.1, lookY: -0.1, eyeOpen: 0.75 }, r(c.relax + 0.1, c.relax_end));
    f = lerpFace(f, { ...FACES.calm, ...lookHand, eyeOpen: 1.1, mouth: 'flat', browY: 0.5 }, r(c.now2 - 0.1, c.now2 + 0.2));
    f = lerpFace(f, { ...FACES.nervous, ...lookHand, mouth: 'grimace', eyeOpen: 1.0 }, r(c.backwards, c.backwards + 0.2));
    f = lerpFace(f, { ...FACES.calm, ...lookHand, mouth: 'flat', mouthOpen: 0.15, browY: 0.3 }, r(c.end - 0.5, c.end - 0.15));
  }
  S.face = f;
  S.hrot = tt < 0 ? 0 : 0.06 * popK(t0, c.jam, c.go, 0.06, 0.3) - 0.05 * popK(t0, c.fist3, c.doctors, 0.05, 0.3) + 0.04 * popK(t0, c.relax, c.relax_end + 0.3, 0.1, 0.2);
  S.hdy = tt < 0 ? 0 : -12 * popK(t0, c.fist3, c.fist3 + 0.35, 0.03, 0.25) + 10 * popK(t0, c.relax + 0.05, c.relax_end + 0.2, 0.15, 0.3);
  return S;
}
function fpBlink(tt, w = 0.45) { const u = ((tt * loopW(w) / (Math.PI * 2) + 0.3) % 1 + 1) % 1; return u < 0.03 ? Math.sin(u / 0.03 * Math.PI) : 0; }

// ---------------------------------------------------------------- cameras ([t, eye xyz, look-at xyz, focal px, roll])
const FP_HOOKCAM = [0, 6, 28, 30, 6, 12, -16, 1330, 0];    // frame 0: POV, his fist on the planks, the goat across
function fpCamOf(id, lt, D) {
  const K = (keys) => fpKeys(lt, keys.map((k) => k.slice()));
  switch (id) {
    case 'hook': return K([[0, ...FP_HOOKCAM.slice(1)], [D, 6, 27.5, 29, 6, 12, -16, 1390, 0]]);
    case 'side': return K([[0, 50, 10, 8, 6, 5, -6, 1700, 0.02], [D, 47, 10, 7, 6, 5, -6, 1760, 0.02]]);
    case 'fast': return K([[0, 7, 28, -32, 4, 9.5, 25, 1250, 0], [D, 7, 27, -30, 4, 9.5, 25, 1300, 0]]);
    case 'jam': return K([[0, 5, 33, 36, 5, 14, -16, 1300, 0], [D, 5, 32, 34, 5, 14, -16, 1360, 0]]);
    case 'brakes': return K([[0, 30, 14, -40, 6, 8.5, -4, 1450, 0.04], [D, 29, 14, -38, 6, 8.5, -4, 1530, 0.04]]);
    case 'again': return K([[0, 4, 31, 34, 5, 12, -16, 1240, 0], [D, 4, 30.5, 33, 5, 12, -16, 1300, 0]]);
    case 'stop': {
      const cut = cu().cut_next - TLd.shots.find((s) => s.id === 'stop').start;
      if (lt < cut) return K([[0, -26, 34, -22, 7, 4, 4, 1450, 0], [cut, -25, 33, -21, 7, 4, 4, 1500, 0]]);
      return K([[cut, 46, 9, 4, 7, 7, -3, 1500, -0.02], [D, 44, 9, 4, 7, 7, -3, 1550, -0.02]]);
    }
    case 'sneak': {
      const cut = cu().cut_sneaks - TLd.shots.find((s) => s.id === 'sneak').start;
      if (lt < cut) return K([[0, 44, 14, 24, 8, 8.5, 2, 1350, 0], [cut, 43, 14, 23, 8, 8.5, 2, 1400, 0]]);
      return K([[cut, 40, 18, 22, 7, 7, -2, 1500, 0], [D, 39, 18, 21, 7, 7, -2, 1560, 0]]);
    }
    case 'fistfist': return K([[0, 2, 30, -36, 6, 12, 24, 1420, 0], [D, 2, 29, -34, 6, 12, 24, 1500, 0]]);
    case 'doctor': return K([[0, 3, 40, 50, 3, 22, -52, 1600, 0], [D, 3, 40, 48, 3, 22, -52, 1680, 0]]);
    case 'relax': return K([[0, 0, 38, 4, 0, 34, 66, 1500, 0], [D, 0, 38, 6, 0, 34, 66, 1560, 0]]);
    case 'smart': return K([[0, 3, 40, 50, 0, 24, -52, 1350, 0], [D, 3, 40, 48, 0, 24, -52, 1400, 0]]);
    case 'smartb': return K([[0, 1, 34, 6, 0, 22, -52, 1380, 0], [D, 1, 34, 4, 0, 22, -52, 1440, 0]]);
    case 'button': return K([[0, 2, 38, 44, 4, 14, -16, 1170, 0], [Math.max(0.3, D - 1.3), 5.4, 30, 32, 5.8, 12.4, -16, 1300, 0],
      [D, ...FP_HOOKCAM.slice(1)]]);
    default: return K([[0, ...FP_HOOKCAM.slice(1)]]);
  }
}

// ---------------------------------------------------------------- drawing the hand state through a camera
function fpHandParts(V, H, t) {
  const G = fpHandGeo({ curl: H.curl, t });
  const X = fpXf({ x: FP_HAND.x, z: FP_HAND.z, head: FP_HAND.head, rot: H.rot, lift: H.lift, slide: H.slide }, G);
  return { G, X, P2: fpProj(V, X) };
}
// the hiker seated behind the table, seen from the front (his right hand is the 3D one, on screen left)
function fpHero(V, t, S) {
  const pose = JSON.parse(JSON.stringify(POSES.sit)); pose.lean = 0.02;
  const rr = rig(pose);
  const oY = -28 - 34 * FP_RU;                                   // the rig's origin: hips 28 cm under the table top
  const q = fpP(V, [0, oY, FP.heroZ]), z = q[2] * FP_RU;
  const cam = fp2D(q[0], q[1], z);
  const st = { x: 0, y: 0, s: 1, pose, face: S.face, noArms: true, noLegs: true, headRot: S.hrot, headDY: S.hdy || 0,
    headDX: 0 };
  const r = charLayer(cam, st, t, { pal: PAL, ambient: 0.03 });
  gctx.save(); gctx.setTransform(1, 0, 0, 1, 0, 0); gctx.globalCompositeOperation = 'destination-out'; gctx.drawImage(layerC, 0, 0, W / 2, H / 2); gctx.restore();
  return { r, st, cam, z, head: toScreen(cam, r.head[0], r.head[1]) };
}
// his upper arm from the shoulder (screen) to the 3D elbow, and his other arm resting on the table
function fpArms(V, hero, X) {
  const shR = toScreen(hero.cam, hero.r.shL[0], hero.r.shL[1]);   // the rig's screen-left shoulder: his right
  const shL = toScreen(hero.cam, hero.r.shR[0], hero.r.shR[1]);
  const el = fpP(V, X.elbow), w = 46 * hero.z;
  screenSpace();
  actor(() => {
    line(ctx, shR[0], shR[1], el[0], el[1], w, PAL.coat);
    circle(ctx, el[0], el[1], w * 0.52, PAL.coatSh);
    // his left arm: down to the table, the forearm lying across it, the hand flat
    const eL = fpP(V, [-30, 4, 46]), wL = fpP(V, [-18, 2.5, 26]), hL = fpP(V, [-13, 1.5, 19]);
    line(ctx, shL[0], shL[1], eL[0], eL[1], w, PAL.coat);
    line(ctx, eL[0], eL[1], wL[0], wL[1], w * 0.9, PAL.coat);
    line(ctx, wL[0], wL[1], hL[0], hL[1], w * 0.62, PAL.skin);
    ellipse(ctx, hL[0], hL[1], w * 0.52, w * 0.36, PAL.skin, -0.2);
  });
}
// the forearm from the POV: the sleeve runs on from the elbow out of the bottom of the frame
function fpPovUpper(V, X) {
  const el = fpP(V, X.elbow), below = fpP(V, fv.add(X.elbow, [3, -8, 22]));
  screenSpace();
  actor(() => line(ctx, el[0], el[1], below[0], below[1], 8.5 * el[2], PAL.coat));
}
function fpHandDraw(V, S, t, o = {}) {
  const parts = fpHandParts(V, S.hand, t);
  screenSpace();
  // the ghost of the shape just stopped, where the hand was (behind the hand)
  if (S.ghost) {
    const sh = FP_SHAPES[S.ghost.shape];
    const Gg = fpHandGeo({ curl: sh.curl, t }), Xg = fpXf({ x: FP_HAND.x, z: FP_HAND.z, head: FP_HAND.head, rot: sh.rot, lift: 0.6 }, Gg);
    fpGhost(ctx, fpProj(V, Xg), Gg, S.ghost.k, '#FFFFFF');
  }
  actor(() => fpDrawHand(ctx, parts.P2, parts.G, {}));
  return parts;
}
// the overlays on the hand: STOP sign, ninja, impacts, smoke (screen space)
function fpHandOver(V, S, parts, t, o = {}) {
  const c = cu(), X = parts.X, P2 = parts.P2;
  screenSpace();
  // where the hand meets the table (its lowest point, roughly under the knuckles)
  const contact = fpP(V, [X.wrist[0] + X.basis.fwd[0] * 7, 0, X.wrist[2] + X.basis.fwd[2] * 7]);
  const sz = contact[2] / 34;
  fpImpact(contact[0], contact[1], sz, S.impact * 0.8);
  fpImpact(contact[0], contact[1], sz * 1.6, S.impactBig, '#FFE7A0');
  if (S.smoke > 0) fpSmoke(contact[0] - 40 * sz, contact[1] - 20 * sz, sz * 1.2, S.smoke, 3);
  if (S.smoke2 > 0) fpSmoke(contact[0], contact[1] - 30 * sz, sz * 1.0, S.smoke2, 7);
  // the STOP sign planted on top of the wrist
  if (S.stop.k > 0.01 && !o.noStop) {
    const foot = fpP(V, fv.add(X.wrist, fv.add(fv.mul(X.basis.fwd, -2.5), [0, 3.4 + (X.a > 0.8 ? 1.2 : 0), 0])));
    fpStop([foot[0], foot[1]], foot[2], S.stop);
  }
  // the ninja on the forearm
  if (S.ninja) {
    const a = P2.pa([0, -BWK.L * lerp(0.82, 0.05, S.ninja.u), 0]), b = P2.pa([0, -BWK.L * lerp(0.82, 0.05, S.ninja.u) + 2, 0]);
    const dir = b[0] >= a[0] ? 1 : -1;
    fpNinja(a[0], a[1] - a[2] * 5.4, a[2] / 15, dir, S.ninja.k, t, { look: 3 * dir });
  }
  if (S.poof > 0.01) {
    const q = fpP(V, X.toW([0, 6, -1]));
    paint(() => { for (let i = 0; i < 8; i++) { const an = (i / 8) * Math.PI * 2, d = q[2] * (3 + 5 * (1 - S.poof)); circle(ctx, q[0] + Math.cos(an) * d, q[1] + Math.sin(an) * d * 0.7, q[2] * 1.2 * S.poof, rgba('#E8F4FF', 0.8 * S.poof)); } });
  }
}

// ---------------------------------------------------------------- the table world from a camera
// view: 'pov' (the goat across the table), 'front' (him behind the table), 'side' / 'top' (the hand and the table)
function fpWorld(V, S, t, view, o = {}) {
  const c = cu();
  fpBack(V, { soft: 1 });
  let hero = null;
  if (view === 'front') hero = fpHero(V, t, S);
  // the goat's body behind the table (POV only)
  const gq = fpP(V, FP_GOAT), gs = gq[2] * 0.1;
  if (view === 'pov') { screenSpace(); fpGoatPart(V, gq, gs, S, t, 'back'); }
  fpTable(V);
  // props on the planks
  if (view !== 'top') { fpMap(V, 30, -24, 0.25); fpMug(V, [-36, 0, -10], t); }
  if (view === 'pov') { screenSpace(); fpGoatPart(V, gq, gs, S, t, 'front'); }
  // skid marks under the jammed fist
  if (S.skid > 0.01) fpSkid(V, [FP_HAND.x + Math.sin(FP_HAND.head) * 8, 0, FP_HAND.z - Math.cos(FP_HAND.head) * 8], [Math.sin(FP_HAND.head), -Math.cos(FP_HAND.head)], 16, S.skid);
  let parts;
  if (view === 'front') {
    parts = fpHandParts(V, S.hand, t);
    fpArms(V, hero, parts.X);
    parts = fpHandDraw(V, S, t);
  } else {
    parts = fpHandDraw(V, S, t);
    if (view === 'pov') fpPovUpper(V, parts.X);
  }
  fpHandOver(V, S, parts, t, o);
  return { hero, parts, gq, gs };
}
function fpGoatPart(V, gq, gs, S, t, part) {
  // the goat in two passes: its body behind the table (clipped above the table's far edge), then its legs, hooves and
  // clipboard over the planks (the hooves land on the table a little in front of the far edge)
  const e0 = fpP(V, [FP.tx[0], 0, FP.tz[0]]), e1 = fpP(V, [FP.tx[1], 0, FP.tz[0]]);
  const hoof = fpP(V, [FP_GOAT[0], 0, FP.tz[0] + 7]);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (part === 'back') {
    ctx.beginPath(); ctx.moveTo(e0[0] - 2000 * (e1[0] - e0[0]), e0[1] - 2000 * (e1[1] - e0[1]));
    ctx.lineTo(e1[0] + 2000 * (e1[0] - e0[0]), e1[1] + 2000 * (e1[1] - e0[1])); ctx.lineTo(W * 3, -H * 3); ctx.lineTo(-W * 3, -H * 3); ctx.closePath();
    ctx.clip();
  }
  fpGoat(ctx, gq[0], gq[1], gs, { ...S.goat, t, part, hoofY: (hoof[1] - gq[1]) / gs });
  ctx.restore();
}

// ---------------------------------------------------------------- the shots
function fpShot(view, o = {}) {
  return (lt, t, shot) => {
    const D = shot.end - shot.start, V = fpCamOf(shot.id, lt, D), S = fpS(t);
    const R = fpWorld(V, S, t, view, o);
    const hand = R.parts.P2.ph([0, 6, 0]);
    let focus = [clamp(hand[0], 240, 840), clamp(hand[1], 480, 1100)];
    if (R.hero) focus = [clamp((hand[0] + R.hero.head[0]) / 2, 260, 820), clamp((hand[1] + R.hero.head[1]) / 2, 480, 1080)];
    if (view === 'pov' && o.goatFocus) focus = [clamp(R.gq[0], 260, 820), clamp(R.gq[1] - 480 * R.gs, 480, 1000)];
    if (o.labels) o.labels(V, S, R, lt, t, shot);
    return { glow: 0.8, focus, capY: o.capY || (o.goatFocus ? 1560 : (view === 'pov' ? 1010 : undefined)) };
  };
}
SC.hook = fpShot('pov');
SC.side = fpShot('side', { labels: fpHookLabels });
SC.fast = fpShot('front', { labels: (V, S, R, lt, t) => { fpHookLabels(V, S, R, lt, t); fpJamLabels(V, S, R, lt, t); } });
SC.jam = fpShot('pov', { labels: fpJamLabels });
SC.brakes = fpShot('top', { labels: fpBrakeLabels, capY: 1560 });
SC.again = fpShot('pov', { capY: 1560 });
SC.stop = fpShot('top');
SC.sneak = fpShot('side', { labels: fpSneakLabels });
SC.fistfist = fpShot('front', { labels: fpFistLabels });
SC.doctor = fpShot('pov', { goatFocus: true });
SC.relax = fpShot('front');
SC.smart = fpShot('pov', { goatFocus: true });
SC.smartb = fpShot('pov', { goatFocus: true, labels: fpClonkLabels });
SC.button = fpShot('pov');

// ---------------------------------------------------------------- labels (screen space)
// the shape's name pops by the hand as it lands (FIST / EDGE / PALM in their colours) in the hook
function fpHookLabels(V, S, R, lt, t) {
  const c = cu(), H2 = S.hand;
  if (t > c.jam - 0.05) return;
  const nm = { F: 'FIST', E: 'EDGE', P: 'PALM' }[H2.cur], k = H2.since < 0.5 ? popK(H2.since, 0, 0.5, 0.05, 0.12) : 0;
  if (k > 0.01 && t > 0.3) {
    const q = R.parts.P2.ph([0, 8, 0]);
    s7Tag(nm, clamp(q[0] + 220, 260, 820), clamp(q[1] - 170, 520, 1100), k, FP_COL[H2.cur], null, 52);
  }
}
function fpJamLabels(V, S, R, lt, t) {
  const c = cu();
  const ks = popK(t, c.jam, c.jam + 0.55, 0.05, 0.15);
  if (ks > 0.01) s7Burst(300, 1180, 0.7, ks, 'SKRRT!', '#FF5A6E', -0.12, 96);
  const k = popK(t, c.jam + 0.02, c.go - 0.2, 0.08, 0.15);
  if (k > 0.01) {
    const q = R.parts.P2.ph([0, 6, 0]);
    s7Ring(q[0], q[1], q[2] * 7.5, k, '#FF5A6E', t);
    bigWord('FIST?!', clamp(q[0] + 190, 300, 640), clamp(q[1] + 70, 1150, 1450), 120, '#FF9A3C', E.outBack(clamp(k), 2.2), -0.1);
  }
}
function fpBrakeLabels(V, S, R, lt, t) {}
function fpSneakLabels(V, S, R, lt, t) {
  const c = cu(), k = popK(t, c.stop2 - 0.05, c.old - 0.1, 0.08, 0.12);
  if (k > 0.01 && S.stop.k > 0.01) s7Tag('MISSED', 300, 660, k, '#FF5A6E', null, 52);
}
function fpFistLabels(V, S, R, lt, t) {
  const c = cu();
  const k1 = popK(t, c.fist2 + 0.02, c.fist3 - 0.05, 0.06, 0.1), k2 = popK(t, c.bonk3, c.doctors - 0.1, 0.06, 0.12);
  if (k1 > 0.01) bigWord('FIST', 790, 1060, 130, '#FF9A3C', E.outBack(clamp(k1), 2.2), 0.08);
  if (k2 > 0.01) s7Burst(760, 1050, 0.85, k2, 'FIST!', '#FF9A3C', 0.08, 120);
}
function fpClonkLabels(V, S, R, lt, t) {
  const c = cu(), k = popK(t, c.clonk + 0.02, c.now2 - 0.1, 0.06, 0.12);
  if (k > 0.01) s7Burst(330, 1240, 0.72, k, 'CLONK', '#C8A8FF', -0.1, 100);
}

// ---------------------------------------------------------------- the cover: his fist on the planks mid-bonk, the goat staring
SC.cover = (lt, t) => {
  const V = fpKeys(0, [FP_HOOKCAM.slice()]), S = fpS(0.02);
  S.goat.mood = 'stop'; S.goat.daisy = 1;
  fpWorld(V, S, 0.02, 'pov');
  screenSpace();
  bigWord('FIST', 330, 840, 170, '#FF9A3C', 1, -0.07);
  bigWord('EDGE', 750, 840, 170, '#FFD447', 1, 0.05);
  bigWord('PALM', 540, 1010, 170, '#7FE9FF', 1, -0.02);
  return { glow: 0.8, noCaptions: true };
};

function initScenes2() { initFp(); }
