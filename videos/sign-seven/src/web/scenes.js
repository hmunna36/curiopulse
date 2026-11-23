// Can You Make a 7 in SIGN Language? 🤟 — the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the
// shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash, flashTop, grain: 0,
//    overlay: fn, noCaptions, capY, focus}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
// Worlds: cafe.js (humanity-sugar-cube's trail cafe at dusk; PANCAKES on the chalkboard), fist3d.js (one-finger's 3D hand),
// bwhand.js (bent-wrist-fist's forearm, glass and puppeteer), s7_world.js (the hand with every joint set, the reins, the
// charioteer, the marmot cook, pancakes, scissors, the stage, the typewriter). The cafe part of the Short is ONE state
// over time (`s7S(tt)`, valid at negative time for the loop): every cafe shot draws from it, so the hand never jumps.
'use strict';

const cu = () => TLd.cues;

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
const S7_LIGHT = { ...LIGHTS.candle, rimAmt: 1.2, pool: 0.5, halo: 0.14 };
const S7_STAGE = { ...LIGHTS.lanterns, key: [-0.1, -0.88, 0.46], rim: [1.0, 0.78, 0.5], rimAmt: 1.25, pool: 0.78, halo: 0.12 };
const S7_DESK = { ...LIGHTS.candle, rimAmt: 1.0, pool: 0.55 };
setLights({ hook: S7_LIGHT, hookb: S7_LIGHT, hookc: S7_LIGHT, pinky: S7_LIGHT, marmot: S7_LIGHT, two: S7_LIGHT,
  slow: S7_LIGHT, feel: S7_LIGHT, inside: S7_LIGHT, reins: S7_LIGHT, violin: S7_STAGE, both: S7_STAGE, free: S7_STAGE,
  type: S7_DESK, button: S7_LIGHT, cover: S7_LIGHT });

// his left forearm stands on the table, elbow down, the hand up beside his face (world points); the marmot cook stands on
// the table at the left, the plate in front of him
const S7 = { PX: 38, WR: [690, 1236], EL: [706, 1468], MAR: [296, 1430], MARS: 0.82, PLATE: [404, 1456], PLATES: 0.62 };
const s7Clone = (p) => JSON.parse(JSON.stringify(p));
function s7Blink(tt, w = 0.45) { const u = ((tt * loopW(w) / (Math.PI * 2) + 0.3) % 1 + 1) % 1; return u < 0.03 ? Math.sin(u / 0.03 * Math.PI) : 0; }

// ---------------------------------------------------------------- the state of the cafe at time tt
// tt = video seconds; negative = the Short's last frames (the loop), which run into frame 1
const S7_F0 = { up: 0.88, ring7: 0.62, thumb: 0.68, sag: 0, fan: 0.8 };    // frame 0: on the way to a seven, the thumb crossing
function s7S(tt) {
  const c = cu(), S = {};
  const r = (a, b, e = E.inOutCubic) => (tt < 0 ? 0 : ramp(tt, a, b, e));
  const sn = (a, b, o) => (tt < 0 ? 0 : snapRamp(tt, a, b, o));
  let up = S7_F0.up, ring7 = S7_F0.ring7, thumb = S7_F0.thumb, sag = 0, fan = S7_F0.fan, midSag = 0, trem = 0;
  if (tt >= 0) {
    // A. the hook and the answer: the thumb lands on the ring fingertip ("ring finger..."), three fingers snap UP and fan
    // out, the pinky trembles and starts to sink on "UP.", sinks on "Pinky sinking?" and folds right down on "TWO." (a 2)
    const land = sn(c.ring1 - 0.32, c.ring1 + 0.12, { over: 1.2 });
    const upk = sn(c.three, c.fingers1 + 0.18, { over: 1.6 });
    const A = {
      thumb: lerp(S7_F0.thumb, 1, land), ring7: lerp(S7_F0.ring7, 1, land), up: lerp(S7_F0.up, 1, upk), fan: lerp(S7_F0.fan, 1, upk),
      sag: 0.34 * r(c.up - 0.12, c.pinky1 + 0.05, E.inOutSine) + 0.32 * r(c.pinky1 + 0.05, c.sinking_end, E.inOutSine)
        + 0.34 * r(c.signed, c.two + 0.02, E.inCubic),
      trem: popK(tt, c.fingers1 + 0.15, c.sinking_end + 0.3, 0.15, 0.25), midSag: 0,
    };
    // B. the slow try, the feel, the inside, the reins: an open hand (thumb out) whose ring finger bends slowly, and the
    // pinky (and a little the middle) follows; it bends again on "Feel", once more on "tied", and the charioteer yanks
    // on "REINS!"
    const bend = r(c.bend, c.slowly_end + 0.05, E.inOutSine);
    const again = r(c.feel - 0.05, c.feel + 0.3, E.inOutSine) * (1 - r(c.pinky2 - 0.05, c.follow_end, E.inOutSine));
    let rk = bend * (1 - 0.6 * again);
    const rel = r(c.inside - 0.05, c.inside + 0.4, E.inOutSine), tie = r(c.tied - 0.1, c.together_end, E.inOutSine);
    rk = lerp(rk, 0.25, rel) + 0.75 * tie * rel;
    const yank = r(c.reins - 0.08, c.reins + 0.18, E.outBack);
    const B = { thumb: 0, ring7: Math.min(1.08, rk + 0.12 * yank), up: 1, fan: 0.6, sag: 0.62 * rk + 0.28 * yank,
      midSag: 0.28 * rk + 0.42 * yank, trem: 0.25 * yank };
    // C. the button: sevens, FAST (a seven and back three times a second, the pinky worse each time), then frame 0's pose
    const ph = Math.max(0, tt - c.now2), cyc = 0.5 - 0.5 * Math.cos(ph * Math.PI * 2 * 3.2), sevenK = clamp(0.2 + 0.8 * cyc);
    const Cc = { thumb: sevenK, ring7: sevenK, up: lerp(0.85, 1, sevenK), fan: 1,
      sag: sevenK * lerp(0.35, 0.95, r(c.now2, c.fast2_end)), midSag: 0, trem: 0.5 };
    const toF0 = r(c.fast2_end + 0.05, c.end - 0.22, E.inOutSine);
    const F0 = { thumb: S7_F0.thumb, ring7: S7_F0.ring7, up: S7_F0.up, fan: S7_F0.fan, sag: 0, midSag: 0, trem: 0 };
    const kAB = r(c.now - 0.25, c.now + 0.12), kBC = r(c.now2 - 0.3, c.now2);
    const mix = (a, b, u) => { const o = {}; for (const key of Object.keys(a)) o[key] = lerp(a[key], b[key], u); return o; };
    let X = mix(A, B, kAB);
    X = mix(X, mix(Cc, F0, toF0), kBC);
    ({ up, ring7, thumb, sag, fan, midSag, trem } = X);
  }
  S.hand = { up, ring7, thumb, sag: clamp(sag), fan, midSag: clamp(midSag), trem };
  // ---- glass, reins, the charioteer
  S.glass = tt < 0 ? 0 : r(c.inside - 0.12, c.inside + 0.2) * (tt < c.one - 0.05 ? 1 : 0);
  S.reins = tt < 0 ? 0 : r(c.inside, c.cords + 0.4, E.inOutSine) * (tt < c.one - 0.05 ? 1 : 0);
  S.knot = tt < 0 ? 0 : r(c.tied - 0.08, c.tied + 0.2, E.outCubic) * (tt < c.one - 0.05 ? 1 : 0);
  S.pull = tt < 0 ? 0 : Math.max(0.7 * r(c.tied, c.together_end), r(c.reins - 0.08, c.reins + 0.15)) * (tt < c.one - 0.05 ? 1 : 0);
  S.char = tt < 0 ? 0 : r(c.like - 0.25, c.chariot, E.outCubic) * (tt < c.one - 0.05 ? 1 : 0);
  S.yank = tt < 0 ? 0 : r(c.reins - 0.08, c.reins + 0.2, E.outBack);
  S.hyah = tt < 0 ? 0 : popK(tt, c.reins - 0.02, c.one - 0.1, 0.1, 0.12);
  S.tiedTag = tt < 0 ? 0 : popK(tt, c.tied - 0.05, c.like - 0.05, 0.12, 0.1);
  // ---- the marmot cook and the pancakes (the running device)
  let mood = 'calm', paw = 'pan', flip = 0, mlook = [0.6, -0.8];
  let n = 0, land = 0, sweat = 0, hop = 0, lean = 0;
  if (tt >= 0) {
    if (tt >= c.congrats - 0.1) { mood = 'squint'; paw = 'chin'; lean = -0.08; }
    if (tt >= c.signed + 0.1) { mood = 'smug'; paw = 'pan'; lean = 0; }
    flip = popK(tt, c.two - 0.12, c.two + 0.25, 0.12, 0.25);
    if (tt >= c.slap1) { n = 2; mood = 'deadpan'; }
    land = popK(tt, c.slap1, c.slap1 + 0.25, 0.02, 0.2);
    // the second beat: it flings one more, onto his hat
    if (tt >= c.follow - 0.4) { flip = Math.max(flip, popK(tt, c.follow - 0.4, c.slap2 - 0.05, 0.1, 0.2)); mood = 'smug'; }
    if (tt >= c.slap2 + 0.3) mood = 'deadpan';
    // the third beat, the button: it loses control, flipping like a machine; the stack grows
    if (tt >= c.now2) {
      mood = 'panic'; sweat = r(c.now2, c.now2 + 0.3);
      const ph = tt - c.now2;
      flip = 0.5 + 0.5 * Math.sin(ph * Math.PI * 2 * 3.2);
      hop = 8 * Math.abs(Math.sin(ph * Math.PI * 3.2));
      n = 2 + Math.min(9, Math.floor(ph / 0.21));
      land = clamp(1 - ((ph % 0.21) / 0.12));
    }
  }
  S.mar = { mood, paw, flip, look: mlook, sweat, hop, lean, blink: s7Blink(tt + 0.7, 0.5) };
  S.n = n; S.land = land;
  // the two flying pancakes of "TWO", the one onto his hat, the machine-gun ones of the button
  S.fly = [];
  if (tt >= 0) {
    for (const [i, t0] of [[0, c.two + 0.02], [1, c.two + 0.12]]) { const u = (tt - t0) / (c.slap1 - t0); if (u >= 0 && u < 1) S.fly.push({ u, to: 'plate', i }); }
    { const t0 = c.slap2 - 0.42, u = (tt - t0) / 0.42; if (u >= 0 && u < 1) S.fly.push({ u, to: 'hat', i: 3 }); }
    if (tt >= c.now2) { for (let i = 0; i < 12; i++) { const t0 = c.now2 - 0.1 + i * 0.21, u = (tt - t0) / 0.24; if (u >= 0 && u < 1 && t0 + 0.24 < c.end - 0.6) S.fly.push({ u, to: 'plate', i: 10 + i }); } }
  }
  S.hat = tt < 0 ? 0 : (tt >= c.slap2 ? 1 : 0) * (1 - r(c.now2 + 0.05, c.now2 + 0.45, E.inCubic));
  S.hatFall = tt < 0 ? 0 : r(c.now2 + 0.05, c.now2 + 0.45, E.inCubic);
  // ---- labels
  S.ringK = tt < 0 ? 0 : popK(tt, c.pinky1 - 0.05, c.congrats - 0.05, 0.1, 0.1);
  S.two2 = tt < 0 ? 0 : popK(tt, c.two + 0.02, c.now - 0.12, 0.1, 0.1);
  S.followK = tt < 0 ? 0 : popK(tt, c.pinky2 - 0.05, c.inside - 0.05, 0.1, 0.1);
  // ---- his face
  const lookHand = { lookX: 0.85, lookY: -0.45 };
  let f = { ...FACES.calm, ...lookHand, mouth: 'flat', mouthOpen: 0.2, browY: 0.35, browTilt: 0.2 };
  if (tt >= 0) {
    f = lerpFace(f, { ...FACES.nervous, ...lookHand, mouth: 'grimace', eyeOpen: 0.9, mouthOpen: 0.6 }, r(c.three, c.three + 0.2));
    f = lerpFace(f, { ...FACES.confused, lookX: 0.85, lookY: -0.4 }, r(c.up, c.up + 0.2));
    f = lerpFace(f, { ...FACES.worried, lookX: 0.8, lookY: -0.35 }, r(c.pinky1, c.pinky1 + 0.2));
    f = lerpFace(f, { ...FACES.annoyed, lookX: -0.75, lookY: 0.35 }, r(c.congrats, c.congrats + 0.2));
    f = lerpFace(f, { ...FACES.shock, lookX: -0.7, lookY: 0.5, mouthOpen: 0.8 }, r(c.two, c.two + 0.12));
    f = lerpFace(f, { ...FACES.calm, ...lookHand, eyeOpen: 0.95, mouth: 'flat' }, r(c.now - 0.1, c.now + 0.25));
    f = lerpFace(f, { ...FACES.startled, ...lookHand, eyeOpen: 1.3, mouth: 'o', mouthOpen: 0.6 }, r(c.pinky2 - 0.1, c.pinky2 + 0.15));
    f = lerpFace(f, { ...FACES.annoyed, lookX: 0, lookY: -0.9, blink: 0.35 }, r(c.slap2, c.slap2 + 0.12));
    f = lerpFace(f, { ...FACES.calm, ...lookHand, eyeOpen: 1.15, mouth: 'o', mouthOpen: 0.4 }, r(c.inside - 0.1, c.inside + 0.2));
    f = lerpFace(f, { ...FACES.nervous, ...lookHand, mouth: 'grimace', eyeOpen: 1.2 }, r(c.now2 - 0.1, c.now2 + 0.12));
    f = lerpFace(f, { ...FACES.calm, ...lookHand, mouth: 'flat', mouthOpen: 0.2, browY: 0.35, browTilt: 0.2 }, r(c.fast2_end + 0.05, c.end - 0.25));
  }
  f.blink = Math.max(f.blink || 0, tt >= 0 && tt > c.slap2 && tt < c.slap2 + 0.2 ? 1 : 0);
  S.face = f;
  S.hrot = tt < 0 ? 0.02 : 0.02 - 0.06 * popK(tt, c.up, c.sinking_end + 0.2, 0.15, 0.2) + 0.08 * popK(tt, c.two, c.now - 0.1, 0.06, 0.2)
    - 0.1 * popK(tt, c.slap2, c.inside, 0.05, 0.2);
  S.hdy = tt < 0 ? 0 : 10 * popK(tt, c.slap2, c.slap2 + 0.35, 0.04, 0.25);
  S.hdx = (S.hand.trem || 0) * 1.2 * Math.sin(tt * 47);
  return S;
}

// ---------------------------------------------------------------- the cameras of the cafe
// 2D camera per shot (x, y, zoom, rot; bgdy: the camera's height for the far wall) and the hand's view angles
const S7_HOOKCAM = { x: 648, y: 1102, zoom: 2.85, rot: 0, bgdy: 0 };
function s7Cam(tt) {
  const c = cu(), sh = (id) => TLd.shots.find((s) => s.id === id);
  const u = (id) => ramp(tt, sh(id).start, sh(id).end, E.inOutSine);
  const L = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), zoom: lerp(a.zoom, b.zoom, k), rot: 0, bgdy: lerp(a.bgdy || 0, b.bgdy || 0, k) });
  if (tt < 0) return { ...S7_HOOKCAM };
  if (tt < sh('hookb').start) return L(S7_HOOKCAM, { x: 652, y: 1096, zoom: 2.95 }, u('hook'));
  if (tt < sh('hookc').start) return L({ x: 516, y: 1120, zoom: 1.45, bgdy: 110 }, { x: 524, y: 1112, zoom: 1.52, bgdy: 100 }, u('hookb'));
  if (tt < sh('pinky').start) return L({ x: 616, y: 1012, zoom: 2.35, bgdy: -60 }, { x: 622, y: 1016, zoom: 2.5, bgdy: -60 }, u('hookc'));
  if (tt < sh('marmot').start) return null;     // the pinky's extreme close-up is framed on the hand (s7PinkyCam)
  if (tt < sh('two').start) return L({ x: 488, y: 1150, zoom: 1.72, bgdy: 120 }, { x: 480, y: 1158, zoom: 1.8, bgdy: 120 }, u('marmot'));
  if (tt < sh('slow').start) return L({ x: 452, y: 1236, zoom: 1.6, bgdy: -40 }, { x: 454, y: 1232, zoom: 1.66, bgdy: -40 }, u('two'));
  if (tt < sh('feel').start) return L({ x: 652, y: 1130, zoom: 2.3, bgdy: -170 }, { x: 660, y: 1122, zoom: 2.42, bgdy: -170 }, u('slow'));
  if (tt < sh('inside').start) return L({ x: 612, y: 1066, zoom: 3.3, bgdy: 40 }, { x: 614, y: 1060, zoom: 3.45, bgdy: 40 }, u('feel'));
  if (tt < sh('reins').start) return L({ x: 686, y: 1128, zoom: 2.55, bgdy: 0 }, { x: 690, y: 1150, zoom: 2.68, bgdy: 0 }, u('inside'));
  if (tt < sh('violin').start) return L({ x: 694, y: 1330, zoom: 2.2, bgdy: -120 }, { x: 694, y: 1318, zoom: 2.3, bgdy: -120 }, u('reins'));
  // the button: from a medium shot of the chaos to frame 0's framing (the loop)
  const b = sh('button');
  const k = ramp(tt, b.start + 0.2, c.end - 0.45, E.inOutSine);
  return L({ x: 520, y: 1176, zoom: 1.72, bgdy: 120 }, S7_HOOKCAM, k);
}
function s7Ang(tt) {
  const c = cu(), sh = (id) => TLd.shots.find((s) => s.id === id);
  let yaw = 0.12, pitch = 0.06;
  const inS = (id) => tt >= 0 && tt >= sh(id).start && tt < sh(id).end;
  if (inS('hookb')) { yaw = 0.3; pitch = -0.1; }
  if (inS('hookc')) { yaw = 0.05; pitch = 0.1; }
  if (inS('marmot')) { yaw = 0.22; pitch = 0.0; }
  if (inS('two')) { yaw = 0.18; pitch = 0.04; }
  if (inS('slow')) { yaw = -0.34; pitch = 0.12; }
  if (inS('feel')) { yaw = 0.1; pitch = 0.05; }
  if (inS('inside')) { yaw = 0.04; pitch = 0.06; }
  if (inS('reins')) { yaw = 0.08; pitch = 0.22; }
  return { yaw, pitch };
}
// the 3D camera tied to the 2D one (bent-wrist-fist): the wrist lands where the 2D camera puts the world wrist, the size
// follows the zoom, the roll follows the forearm on screen
function s7View(cam, ang) {
  const sc = toScreen(cam, S7.WR[0], S7.WR[1]), el = toScreen(cam, S7.EL[0], S7.EL[1]), D = 55;
  const dx = el[0] - sc[0], dy = el[1] - sc[1], l = Math.hypot(dx, dy) || 1;
  const roll = Math.atan2(-dx / l, dy / l);
  return { yaw: ang.yaw, pitch: ang.pitch, roll, tx: 0, ty: 0, tz: 0, D, cx: sc[0], cy: sc[1], f: S7.PX * D * cam.zoom / 2.9, mirror: true };
}
// a hand point (hand frame, cm) in WORLD coordinates, under the hook's framing (for cameras that aim at a finger)
function s7World(G, p, ang) {
  const cam = S7_HOOKCAM, P2 = bwProj(s7View(cam, ang || { yaw: 0.12, pitch: 0.06 }), 0), q = P2.ph(p);
  return [cam.x + (q[0] - W / 2) / cam.zoom, cam.y + (q[1] - H / 2) / cam.zoom];
}
function s7PinkyCam(tt, G) {
  const sh = TLd.shots.find((s) => s.id === 'pinky');
  const pk = s7World(G, fkSegPt(G, 'L', 1, 0.5, 'front', 0.6), { yaw: 0.0, pitch: 0.1 });
  const u = ramp(tt, sh.start, sh.end, E.inOutSine);
  return { x: pk[0] - 22, y: pk[1] + 34 + 6 * u, zoom: lerp(4.3, 4.6, u), rot: 0, bgdy: -40 };
}

// ---------------------------------------------------------------- him at the cafe table (his left arm is the 3D one)
function s7Hero(cam, t, S) {
  const p = s7Clone(POSES.stand);
  p.lean = -0.01;
  const st = { x: CF.hx, y: CF.hy, s: CF.hs, pose: p, face: S.face, noArms: true, headRot: S.hrot, headDX: S.hdx,
    headDY: 2 * Math.sin(t * loopW(1.6)) + (S.hdy || 0), noLegs: true };
  const r = charLayer(cam, st, t, { pal: CFPAL, ambient: 0.06 });
  gctx.save(); gctx.setTransform(1, 0, 0, 1, 0, 0); gctx.globalCompositeOperation = 'destination-out';
  gctx.drawImage(layerC, 0, 0, W / 2, H / 2); gctx.restore();
  return { r, st, head: toWorld(st, r.head) };
}
function s7UpperArm(cam, hero, P2) {
  const shW = toWorld(hero.st, hero.r.shR), sh = toScreen(cam, shW[0], shW[1]);
  const el = P2.pa([0, -BWK.L * 0.97, 0]);
  const w = 42 * hero.st.s * cam.zoom;
  const dx = el[0] - sh[0], dy = el[1] - sh[1], l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l;
  actor(() => {
    line(ctx, sh[0], sh[1], el[0] - ux * w * 0.2, el[1] - uy * w * 0.2, w, CFPAL.coat);
    line(ctx, el[0] - ux * w * 0.62, el[1] - uy * w * 0.62, el[0] - ux * w * 0.18, el[1] - uy * w * 0.18, w * 1.1, CFPAL.coatSh);
  });
}
function s7RestArm(cam, hero) {
  const shW = toWorld(hero.st, hero.r.shL), sh = toScreen(cam, shW[0], shW[1]);
  const el = toScreen(cam, CF.hx - 112, CF.hy - 250), wr = toScreen(cam, CF.hx - 128, CF.hy - 190);
  const w = 42 * hero.st.s * cam.zoom;
  actor(() => {
    line(ctx, sh[0], sh[1], el[0], el[1], w, CFPAL.coat);
    line(ctx, el[0], el[1], wr[0], wr[1], w * 0.86, CFPAL.skin);
    circle(ctx, wr[0], wr[1] + w * 0.1, w * 0.55, CFPAL.skin);
  });
}
// a pancake in flight from the marmot's pan to the plate or onto his hat (world coords; drawn with the camera applied)
function s7FlyCake(F, from, hatPt, plateTop) {
  const to = F.to === 'hat' ? hatPt : plateTop;
  const u = F.u, x = lerp(from[0], to[0], u), y = lerp(from[1], to[1], u) - Math.sin(Math.PI * u) * (F.to === 'hat' ? 260 : 150);
  s7Pancake(ctx, x, y, 0.62, u * Math.PI * 3 + F.i);
}

// the whole cafe picture at time tt (t = the video time for clocks)
function s7Frame(tt, t, o = {}) {
  const S = s7S(tt), ang = o.ang || s7Ang(tt);
  const H7 = S.hand;
  const pose = s7Pose({ up: H7.up, ring7: H7.ring7, sag: H7.sag, fan: H7.fan, midSag: H7.midSag });
  const G = s7Geo({ b: pose.b, lean: pose.lean, thumb: H7.thumb, tgt: 'R', tremble: { L: H7.trem, R: H7.trem * 0.4 }, t });
  let cam = o.cam || s7Cam(tt);
  if (!cam) cam = s7PinkyCam(tt, G);
  CF_BGDY = cam.bgdy || 0;
  cfBack(cam, t);
  cfTable(cam);
  applyCam(cam);
  cfMug(ctx, 186, 1338, 1, t);
  const hero = s7Hero(cam, t, S);
  // the front of the table over his lower body, then the things on it
  cfTable(cam, { dy: 72, depth: (CF.tableFront - CF.tableY - 72) / (CF.tableFront - CF.tableY) });
  applyCam(cam);
  const plate = s7Plate(ctx, S7.PLATE[0], S7.PLATE[1], S7.PLATES, S.n, { land: S.land, wobble: S.n > 4 ? 1 : 0, t });
  const M = s7Marmot(ctx, S7.MAR[0], S7.MAR[1], S7.MARS, { ...S.mar, t, cake: S.fly.some((f) => f.to !== 'plate' || f.i < 3) ? 0 : 1 });
  const V = s7View(cam, ang), P2 = bwProj(V, 0);
  screenSpace();
  if (S.glass < 0.98) s7RestArm(cam, hero);
  s7UpperArm(cam, hero, P2);
  actor(() => bwDraw(ctx, P2, G, { bulge: 0.25 * S.pull }));
  if (S.glass > 0.01) bwGlass(ctx, P2, G, S.glass, { bulge: 0.25 * S.pull });
  let ch = null;
  if (S.char > 0.01) ch = s7Charioteer(ctx, gctx, P2, { k: S.char, barS: BWK.barRest + 2.4 * S.yank, pull: S.yank, mood: S.yank > 0.3 ? 'strain' : 'proud', look: [0.2, -0.7], t, lift: 0 });
  if (S.reins > 0.01) {
    s7Reins(ctx, gctx, P2, G, { k: S.reins, knot: S.knot, pull: S.pull, pullK: { I: 0, M: 1, R: 1, L: 1 }, slackI: 0.5 * S.pull,
      fists: ch ? [ch.barL, ch.barR] : null, t, glow: S.pull });
  }
  // the hat pancake (world, on his head), then the flying ones
  applyCam(cam);
  const hatPt = [hero.head[0] + 4, hero.head[1] - 84];
  if (S.hat > 0.01 || S.hatFall > 0.01) {
    const fy = S.hatFall * 520, fr = S.hatFall * 1.2;
    actor(() => { ctx.save(); ctx.translate(hatPt[0] - S.hatFall * 120, hatPt[1] + fy); ctx.rotate(-0.12 - fr); s7PanCake(ctx, 0, 0, 1.25); ctx.restore(); });
    paint(() => { if (S.hatFall < 0.05) { ctx.save(); ctx.translate(hatPt[0], hatPt[1]); line(ctx, 30, 6, 34, 28, 7, 'rgba(150,62,10,0.85)'); ctx.restore(); } });
  }
  for (const F of S.fly) s7FlyCake(F, M.pan, hatPt, [plate.top[0], plate.top[1] - 12]);
  return { S, cam, V, P2, G, hero, M, plate, ch };
}

// ---------------------------------------------------------------- the overlays of the cafe
function s7Overlays(R, tt, t) {
  const c = cu(), S = R.S, P2 = R.P2, G = R.G;
  screenSpace();
  // the trembling pinky: motion marks, and the red ring while it sinks
  if (S.hand.trem > 0.05) { const q = P2.ph(fkTip(G, 'L', 0.2)); s7Shake(q[0], q[1], q[2] * 2.4, S.hand.trem * 0.8, t); }
  if (S.ringK > 0.01) { const q = P2.ph(fkSegPt(G, 'L', 1, 0.6, 'front', 0.6)); s7Ring(q[0], q[1], q[2] * 3.1, S.ringK, '#FF5A6E', t); }
  // "TWO.": a big yellow 2 beside his hand
  if (S.two2 > 0.01) bigWord('2', 440, 600, 270, '#FFD447', E.outBack(clamp(S.two2), 2.4), -0.12);
  // "Feel the pinky follow?": a dotted trail from the ring fingertip to the pinky
  if (S.followK > 0.01) { const a = P2.ph(fkTip(G, 'R', 0.3)), b = P2.ph(fkTip(G, 'L', 0.3)); s7Follow(a, b, S.followK, t); }
  // TIED at the knot
  if (S.tiedTag > 0.01) { const q = P2.ph(S7_KNOT); s7Tag('TIED', clamp(q[0] - 250, 220, 700), clamp(q[1] + 60, 560, 1100), S.tiedTag, '#FFD447', [q[0], q[1]], 52); }
  // HYAH!
  if (S.hyah > 0.01 && R.ch) { const q = R.ch.head; s7Bubble('HYAH!', clamp(q[0] - 260, 260, 760), clamp(q[1] - 160, 560, 1000), S.hyah, q[0], q[1], '#C2232E', 82); }
}
// shake marks round a point (screen space)
function s7Shake(x, y, r, k, t) {
  if (k <= 0.01) return;
  paint(() => {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    for (const s of [-1, 1]) for (let i = 0; i < 2; i++) {
      const rr = r * (1 + 0.22 * i) + 6 * Math.sin(t * 40 + i);
      ctx.beginPath(); ctx.arc(x, y, rr, s > 0 ? -0.5 : Math.PI - 0.5, s > 0 ? 0.5 : Math.PI + 0.5);
      ctx.lineWidth = 6 - 2 * i; ctx.strokeStyle = rgba('#FFFFFF', 0.8 * k); ctx.lineCap = 'round'; ctx.stroke();
    }
    ctx.restore();
  });
}
// a dotted arc from a to b with an arrowhead (the pinky follows the ring finger)
function s7Follow(a, b, k, t) {
  paint(() => {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    const mx = (a[0] + b[0]) / 2, my = Math.min(a[1], b[1]) - 90, n = 9;
    for (let i = 0; i <= n * clamp(k * 1.4); i++) {
      const u = i / n, x = (1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * mx + u * u * b[0], y = (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * my + u * u * b[1];
      circle(ctx, x, y, 7, rgba('#7FE9FF', 0.95 * k));
    }
    ctx.restore();
  });
}

// ---------------------------------------------------------------- cafe shots
function s7Shot(lt, t, shot) {
  const R = s7Frame(t, t);
  s7Overlays(R, t, t);
  const hp = R.P2.ph([0.2, 8, 1]), hd = toScreen(R.cam, R.hero.head[0], R.hero.head[1]);
  // the punch on "TWO" centres on his face (the marmot and the 2-hand stay in the frame either side of it)
  if (shot.id === 'two') return { glow: 0.8, focus: [hd[0], hd[1]] };
  return { glow: 0.8, focus: [clamp((hp[0] + hd[0]) / 2, 260, 820), clamp((hp[1] + hd[1]) / 2, 480, 1080)] };
}
SC.hook = s7Shot; SC.hookb = s7Shot; SC.hookc = s7Shot; SC.pinky = s7Shot; SC.marmot = s7Shot; SC.two = s7Shot;
SC.slow = s7Shot; SC.feel = s7Shot; SC.inside = s7Shot; SC.reins = s7Shot; SC.button = s7Shot;

// ---------------------------------------------------------------- the violinist (a stage under one spotlight)
// his glass hand with the reins and the knot; the surgeon's scissors come in on "surgeon" and SNIP on "snip"; more snips
// on "every tie..."; then BOTH hands (left and right) with every rein loose; then the hand (skin) waving its free fingers
function s7VioState(tt) {
  const c = cu(), r = (a, b, e = E.inOutCubic) => ramp(tt, a, b, e);
  const cut = r(c.snipcut, c.snipcut + 0.45, E.outCubic);
  const free = r(c.snipcut + 0.05, c.snipcut + 0.5, E.outBack);
  return {
    cut, ring7: lerp(0.82, 0.05, free), sag: lerp(0.6, 0, free), midSag: lerp(0.3, 0, free),
    sc: r(c.surgeon - 0.1, c.snip - 0.05, E.outCubic), open: c.snip > tt ? 0.5 + 0.5 * Math.sin(tt * 14) : (tt < c.snipcut + 0.04 ? lerp(1, 0, inv(c.snip, c.snipcut, tt)) : 0.2 + 0.8 * popK(tt, c.every, c.tie_end, 0.1, 0.1) * (0.5 + 0.5 * Math.sin(tt * 26))),
    snipK: popK(tt, c.snipcut, c.every + 0.1, 0.05, 0.12), snip2: popK(tt, c.tie - 0.04, c.tie_end + 0.15, 0.05, 0.1),
    vtag: popK(tt, c.violinist - 0.05, c.both - 0.1, 0.12, 0.1),
  };
}
function s7VioView(o = {}) {
  return { yaw: o.yaw === undefined ? 0.1 : o.yaw, pitch: o.pitch === undefined ? 0.05 : o.pitch, roll: o.roll || 0, tx: 0, ty: o.ty === undefined ? 6 : o.ty, tz: 0, D: 55,
    f: (o.px || 32) * 55, cx: o.cx || 540, cy: o.cy || 900, mirror: o.mirror === undefined ? true : o.mirror };
}
function s7VioHand(P2, G, o = {}) {
  const items = s7SleeveItems(ctx, P2, { u0: 0.2 });
  actor(() => bwDraw(ctx, P2, G, { items }));
  if ((o.glass || 0) > 0.01) {
    bwGlass(ctx, P2, G, o.glass, {});
    // the sleeve again over the glass (it is cloth, not see-through)
    const it2 = s7SleeveItems(ctx, P2, { u0: 0.2 });
    actor(() => { for (const it of it2.sort((a, b) => b.z - a.z)) it.fn(); });
  }
}
SC.violin = (lt, t, shot) => {
  const c = cu(), V7 = s7VioState(t);
  s7Stage(t, { sx: 540, sy: 860 });
  const u = ramp(t, shot.start, shot.end, E.inOutSine);
  const V = s7VioView({ yaw: lerp(0.16, 0.06, u), pitch: 0.06, px: lerp(31, 34, u), cy: lerp(900, 880, u) });
  const P2 = bwProj(V, 0);
  const pose = s7Pose({ up: 1, ring7: V7.ring7, sag: V7.sag, midSag: V7.midSag, fan: 0.6 });
  const G = s7Geo({ b: pose.b, lean: pose.lean, thumb: 0, t });
  s7VioHand(P2, G, { glass: 1 });
  const K = s7Reins(ctx, gctx, P2, G, { k: 1, knot: 1, cut: V7.cut, pull: 0.5 * (1 - V7.cut), pullK: { I: 0, M: 1, R: 1, L: 1 }, t, startY: -4 });
  screenSpace();
  // the scissors come in from the right to the knot and snip
  if (V7.sc > 0.01 && K && K.knot) {
    const kq = K.knot, sx = lerp(1180, kq[0] + 150, V7.sc), sy = lerp(1300, kq[1] + 120, V7.sc);
    s7Scissors(ctx, sx, sy, 1.15, V7.open, Math.atan2(kq[1] - sy, kq[0] - sx));
    softDot(gctx, sx, sy, 60, '#E8F2FF', 0.25);
  }
  if (V7.snipK > 0.01 && K && K.knot) s7Burst(clamp(K.knot[0] - 170, 260, 760), clamp(K.knot[1] - 190, 560, 1000), 0.62, V7.snipK, 'SNIP!', '#FF5A6E', -0.1, 110);
  if (V7.snip2 > 0.01) s7Burst(700, 640, 0.42, V7.snip2, 'SNIP!', '#FF9A3C', 0.12, 100);
  if (V7.vtag > 0.01) s7Tag('VIOLINIST', 540, 470, V7.vtag, '#FFD447', null, 52, (c2, x, y, s) => s7Violin(c2, x, y, 0.42 * s, 0.5));
  return { glow: 0.85, focus: K && K.knot ? [K.knot[0], K.knot[1] - 120] : [540, 800] };
};
SC.both = (lt, t, shot) => {
  const c = cu();
  s7Stage(t, { sx: 540, sy: 880 });
  const u = ramp(t, shot.start, shot.end, E.inOutSine);
  const wave = (k) => 0.12 * Math.sin(t * 7 + k);
  for (const [mir, cx] of [[true, 340], [false, 742]]) {
    const V = s7VioView({ yaw: mir ? 0.22 : -0.22, pitch: 0.05, px: lerp(20, 21.5, u), cx, cy: 1000, mirror: mir });
    const P2 = bwProj(V, 0);
    const pose = s7Pose({ up: 1, ring7: 0.05 + wave(1) * 0.6, sag: 0, fan: 0.8 });
    const G = s7Geo({ b: pose.b, lean: pose.lean, thumb: 0, t });
    s7VioHand(P2, G, { glass: 1 });
    s7Reins(ctx, gctx, P2, G, { k: 1, knot: 1, cut: 1, pull: 0, t, startY: -4 });
  }
  screenSpace();
  s7Tag('BOTH HANDS', 540, 505, popK(t, c.both - 0.05, shot.end + 1, 0.12, 0.1), '#7FE9FF', null, 56);
  s7Tag('1979 - 1988', 540, 615, popK(t, c.hands - 0.05, shot.end + 1, 0.12, 0.1), '#FFD447', null, 50);
  return { glow: 0.85, focus: [540, 880] };
};
SC.free = (lt, t, shot) => {
  const c = cu();
  s7Stage(t, { sx: 540, sy: 880 });
  const u = ramp(t, shot.start, shot.end, E.inOutSine);
  const V = s7VioView({ yaw: lerp(0.0, 0.14, u), pitch: 0.04, px: lerp(36, 38, u), ty: 7, cy: 860 });
  const P2 = bwProj(V, 0);
  // each finger dips on its own, one after another (a wave along the hand, then back): free
  const ph = (t - c.free) * 5.2, w = (k) => Math.max(0, Math.sin(ph - k * 0.9)) * clamp((t - c.free + 0.1) * 4);
  const pose = s7Pose({ up: 1, fan: 0.75, waveI: w(0), waveM: w(1), waveR: w(2), waveL: w(3) });
  const G = s7Geo({ b: pose.b, lean: pose.lean, thumb: 0, t });
  s7VioHand(P2, G, { glass: 0 });
  // sparkles round the fingertips
  screenSpace();
  for (const k of FK_ORD) {
    const q = P2.ph(fkTip(G, k, 0.8)), tw = 0.5 + 0.5 * Math.sin(t * 12 + FK_F[k].x);
    s7Sparkle(q[0] + 30, q[1] - 40, 22 * tw, tw);
    softDot(gctx, q[0], q[1], 60, '#FFF0B0', 0.3 * tw);
  }
  return { glow: 0.9, focus: [540, 760] };
};
function s7Sparkle(x, y, r, a) {
  paint(() => {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.fillStyle = rgba('#FFF6C8', a);
    ctx.beginPath(); ctx.moveTo(0, -r); ctx.quadraticCurveTo(0, 0, r, 0); ctx.quadraticCurveTo(0, 0, 0, r); ctx.quadraticCurveTo(0, 0, -r, 0); ctx.quadraticCurveTo(0, 0, 0, -r); ctx.fill();
    ctx.restore();
  });
}

// ---------------------------------------------------------------- the typewriter
const S7_LETTERS = [];
for (let i = 0; i < 40; i++) S7_LETTERS.push(['ASDFJKLQWERTYUIOP'[i % 17], 0, 300 + i * 7]);
SC.type = (lt, t, shot) => {
  const c = cu();
  const k = clamp(0.25 + 0.75 * ramp(t, c.type - 0.1, c.type + 0.25));
  const letters = S7_LETTERS.map((L, i) => [L[0], c.type - 0.1 + i * 0.07, L[2]]).filter((L) => L[1] < c.fast_end);
  const ding = popK(t, c.fast_end - 0.05, shot.end + 0.5, 0.06, 0.1);
  s7Desk(t, { k: k * (1 - 0.7 * ding), line: clamp(inv(c.he, c.fast_end, t)), letters, sad: t > c.super - 0.1 });
  screenSpace();
  if (ding > 0.01) s7Burst(790, 540, 0.5, ding, 'DING!', '#FFD447', 0.1, 110);
  // the camera drifts in on the machine
  const u = ramp(t, shot.start, shot.end, E.inOutSine);
  return { glow: 0.85, push: { k: lerp(1.0, 1.06, u), cx: 540, cy: 1000 }, focus: [540, 900] };
};

// ---------------------------------------------------------------- the cover: his hand mid-seven, the pinky sinking
SC.cover = (lt, t, shot) => {
  const c = cu(), tt = c.sinking + 0.25;
  const R = s7Frame(tt, t, { cam: { x: 640, y: 1060, zoom: 2.55, rot: 0, bgdy: -40 }, ang: { yaw: 0.08, pitch: 0.08 } });
  screenSpace();
  const q = R.P2.ph(fkSegPt(R.G, 'L', 1, 0.6, 'front', 0.6));
  s7Ring(q[0], q[1], q[2] * 3.1, 1, '#FF5A6E', 0);
  bigWord('SIGN', 360, 500, 165, '#FFFFFF', 1, -0.06);
  bigWord('A 7?', 372, 668, 200, '#FFD447', 1, -0.06);
  return { glow: 0.8, noCaptions: true };
};

function initScenes2() { initCafe(); }
