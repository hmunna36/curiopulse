// Why Can't Some People SNAP Their Fingers? 🫰 Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds
// inside the shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
// Worlds: camp.js (mosquito-bites' campsite at night), fist3d.js (one-finger's 3D hand), bwhand.js (bent-wrist-fist's forearm,
// glass and the puppeteer), snaphand.js (the snap: poses, the thumb, the string, the meter, the macro, the race, steel, cape).
// The whole Short is ONE state over time (`snS(t)`, valid at negative time for the loop): every shot draws from it, so the
// hand never jumps between shots.
'use strict';

const cu = () => TLd.cues;

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
const SN_LIGHT = { ...LIGHTS.lanterns, keyFrom: [-0.55, -0.85] };
const SN_VILLAIN = { ...LIGHTS.lanterns, keyFrom: [-0.55, -0.85], keyTint: [1.12, 0.80, 0.86], shadowTint: [0.58, 0.40, 0.86],
  rim: [1.0, 0.22, 0.30], rimAmt: 1.7, haloColor: [1.0, 0.28, 0.36] };
setLights({ hook: SN_LIGHT, glass: SN_LIGHT, load: SN_LIGHT, macro: LIGHTS.diagram, slam: SN_LIGHT, race: LIGHTS.diagram,
  villain: SN_VILLAIN, button: SN_LIGHT, loop: SN_LIGHT, cover: SN_LIGHT });

const SN_HS = 0.95;                       // his scale at the campsite
const SN_WR = [472, 872];                 // where his left wrist is in the world (beside his head, cheek high)
const SN_EL = [486, 1004];                // and his left elbow (out to his side, below it: the forearm stands upright)
const SN_PX = 24;                         // px per cm at the wrist when the 2D camera's zoom is 2.9 (the hand is held toward us)
const snClone = (p) => JSON.parse(JSON.stringify(p));

// ---------------------------------------------------------------- hand states and how they blend
// a state: {w: pose weights, tw: thumb-tip weights, press}
const SN_ST = {
  loaded: { w: { ready: 1 }, tw: { pad: 1 }, press: 0.72 },
  hard: { w: { ready: 1 }, tw: { pad: 1 }, press: 1 },
  barely: { w: { ready: 1 }, tw: { pad: 1 }, press: -0.25 },
  fired: { w: { fired: 1 }, tw: { side: 1 }, press: 0 },
  fizz: { w: { fizz: 1 }, tw: { pad: 0.35, side: 0.65 }, press: 0 },
  slowEnd: { w: { fizz: 0.8, ready: 0.2 }, tw: { pad: 0.5, side: 0.5 }, press: 0 },
};
function snMix(a, b, u) {
  if (u <= 0) return a;
  if (u >= 1) return b;
  const o = { w: {}, tw: {}, press: lerp(a.press, b.press, u) };
  for (const key of ['ready', 'fired', 'fizz', 'open']) { const v = lerp(a.w[key] || 0, b.w[key] || 0, u); if (v > 1e-4) o.w[key] = v; }
  for (const key of ['pad', 'side', 'rest']) { const v = lerp(a.tw[key] || 0, b.tw[key] || 0, u); if (v > 1e-4) o.tw[key] = v; }
  return o;
}

// ---------------------------------------------------------------- small graphics
function snTag(txt, x, y, k, col, to, size = 46) {
  if (k <= 0.01) return;
  screenSpace();
  const s = E.outBack(clamp(k), 2.2);
  ctx.save(); ctx.font = `900 ${size}px Montserrat`;
  const w = ctx.measureText(txt).width + size * 0.9, h = size * 1.45;
  ctx.restore();
  if (to) thinLeader([x, y + h * 0.5 * Math.sign(to[1] - y)], to, clamp(k * 1.5 - 0.3), col);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = '#141428'; ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = col; ctx.stroke();
  ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = col;
  ctx.fillText(txt, 0, size * 0.05);
  ctx.restore();
}
function snBurst(x, y, s, k, word, col = '#4DFFB4', rot = -0.12, size = 104) {
  if (k <= 0) return;
  const sc = E.outBack(clamp(k), 2.6) * s;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  ctx.beginPath();
  for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2, r = i % 2 ? 150 : 96 + 14 * (i % 3); ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r * 1.25, Math.sin(a) * r * 0.8); }
  ctx.closePath(); ctx.fillStyle = '#FFF6DC'; ctx.fill(); ctx.lineWidth = 9; ctx.lineJoin = 'round'; ctx.strokeStyle = '#1A1030'; ctx.stroke();
  ctx.font = `400 ${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = col;
  ctx.lineWidth = size * 0.1; ctx.strokeStyle = '#1A1030'; ctx.strokeText(word, 0, 6); ctx.fillText(word, 0, 6);
  ctx.restore();
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); softDot(gctx, x, y, 190 * sc, col, 0.25); gctx.restore();
}
function snShake(x, y, r, k, t) {
  if (k <= 0.01) return;
  paint(() => {
    for (const s of [-1, 1]) for (let i = 0; i < 2; i++) {
      const rr = r * (1 + 0.22 * i) + 6 * Math.sin(t * 40 + i);
      ctx.beginPath(); ctx.arc(x, y, rr, s > 0 ? -0.5 : Math.PI - 0.5, s > 0 ? 0.5 : Math.PI + 0.5);
      ctx.lineWidth = 6 - 2 * i; ctx.strokeStyle = rgba('#FFFFFF', 0.8 * k); ctx.lineCap = 'round'; ctx.stroke();
    }
  });
}
// a small word that floats up and fades (screen space): "tink."
function snSmallWord(txt, x, y, u, col = '#D8DEE8', size = 58) {
  if (u <= 0 || u >= 1) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = clamp((1 - u) * 2.2);
  ctx.font = `italic 800 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = 9; ctx.strokeStyle = '#141428'; ctx.strokeText(txt, x, y - 70 * E.outCubic(u));
  ctx.fillStyle = col; ctx.fillText(txt, x, y - 70 * E.outCubic(u));
  ctx.restore();
}

// ---------------------------------------------------------------- the state of everything at time tt
// tt = video seconds; negative = the Short's last frames (the loop), which run into frame 1
function snS(tt) {
  const c = cu(), S = {};
  const r = (a, b, e = E.inOutCubic) => ramp(tt, a, b, e);
  let P = SN_ST.loaded, trem = 0.12;
  if (tt >= 0) {
    // the hook: SNAP (a whip in two frames), then barely touching, then the limp slide
    P = snMix(P, SN_ST.fired, r(c.snap1, c.snap1 + 0.07, E.inQuad));
    P = snMix(P, SN_ST.barely, r(c.set2, c.touching_end - 0.05, E.inOutSine));
    P = snMix(P, SN_ST.fizz, r(c.fizz, c.fizz + 0.42, E.inOutSine));
    // the glass: the catapult set but not loaded (barely), then pressed hard while he hauls
    P = snMix(P, SN_ST.barely, r(c.glass_in, c.string_in + 0.2));
    P = snMix(P, SN_ST.hard, r(c.haul, c.full, E.inOutSine));
    // the macro's SLIP: the real one fires here
    P = snMix(P, SN_ST.fired, r(c.release, c.release + 0.07, E.inQuad));
    // the slam: a slow-motion replay of that whip, from loaded to the palm
    if (tt >= c.finger) P = snMix(SN_ST.hard, SN_ST.fired, r(c.whip, c.impact, (u) => u * u * u));
    // the villain: the steel glove set and pressed; the dramatic snap flops
    if (tt >= c.cape) {
      P = SN_ST.loaded;
      P = snMix(P, SN_ST.fizz, r(c.tink + 0.12, c.tink + 0.85, E.inOutSine));
    }
    // the button: loaded again, then the slow slide, then set again for the loop
    if (tt >= c.now3) {
      P = snMix(SN_ST.fizz, SN_ST.loaded, r(c.now3, c.now3 + 0.45));
      P = snMix(P, SN_ST.slowEnd, r(c.slowstart, c.snap3_end + 0.12, E.inOutSine));
      P = snMix(P, SN_ST.loaded, r(c.loop_in - 0.42, c.loop_in - 0.02, E.inOutCubic));
    }
    trem = 0.12 * (1 - r(c.snap1 - 0.05, c.snap1)) + 0.9 * r(c.haul, c.haul + 0.3) * (1 - r(c.release, c.release + 0.05))
      + 0.5 * r(c.pose, c.pose + 0.3) * (1 - r(c.tink, c.tink + 0.05)) + 0.35 * r(c.slowstart, c.slowstart + 0.3) * (1 - r(c.snap3_end, c.snap3_end + 0.2))
      + 0.12 * r(c.loop_in - 0.4, c.loop_in);
  }
  S.P = P; S.trem = trem;
  // the wrist: tipped back a little; a small kick on each snap
  const kick = tt >= 0 ? popK(tt, c.snap1, c.snap1 + 0.35, 0.03, 0.3) + popK(tt, c.release, c.release + 0.35, 0.03, 0.3) : 0;
  S.th = -0.22 + 0.16 * kick + (tt >= 0 ? 0.08 * r(c.fizz, c.fizz + 0.4) * (1 - r(c.glass_in, c.glass_in + 0.5)) : 0);
  // ---- the inside
  const gl = tt < 0 ? 0 : r(c.glass_in, c.glass_in + 0.35) * (1 - r(c.cape - 0.01, c.cape));
  S.glass = gl;
  S.str = tt < 0 ? 0 : r(c.string_in, c.string_in + 0.4) * (1 - r(c.cape - 0.01, c.cape));
  const relU = tt < 0 ? 0 : r(c.release, c.release + 0.06);
  const replay = tt >= c.finger && tt < c.cape;
  const loadU = tt < 0 ? 0 : r(c.haul, c.full, E.inOutSine);
  S.taut = replay ? 1 - r(c.whip + 0.05, c.whip + 0.4) : loadU * (1 - relU);
  S.slack = replay ? r(c.whip + 0.05, c.whip + 0.5) : (1 - r(c.haul, c.haul + 0.8)) + relU;
  S.slack = clamp(S.slack);
  S.barS = BWK.barRest + 4.2 * (replay ? 1 - r(c.whip, c.whip + 0.25) : loadU * (1 - relU));
  S.pup = gl;
  let mood = 'sleep', look = [0, -0.6];
  if (tt >= c.wake) { mood = 'shock'; look = [0, -1]; }
  if (tt >= c.haul + 0.15) { mood = 'strain'; }
  if (tt >= c.full) { mood = 'proud'; look = [0.4, 0.4]; }
  if (tt >= c.release) { mood = 'shock'; }
  if (tt >= c.finger) { mood = 'strain'; }
  if (tt >= c.whip + 0.1) { mood = 'shock'; look = [0, -1]; }
  S.mood = mood; S.look = look;
  S.cap = tt < 0 ? 0 : r(c.glass_in + 0.1, c.glass_in + 0.4) * (1 - r(c.wake, c.wake + 0.12));
  S.tilt = tt < 0 ? 0 : 1.35 * r(c.tumble, c.tumble + 0.35, E.outBack) * (tt < c.cape ? 1 : 0);
  S.meter = tt < 0 ? 0 : popK(tt, c.meter_in, c.macro_in, 0.15, 0.12);
  S.meterV = loadU * (1 - relU);
  S.meterFlash = tt < 0 ? 0 : popK(tt, c.full, c.full + 0.5, 0.05, 0.3);
  S.contact = tt < 0 ? 0.6 : clamp(P.press);
  // ---- moments
  S.flare = tt < 0 ? 0 : popK(tt, c.snap1, c.snap1 + 1.1, 0.04, 0.8);
  S.ring1 = tt < 0 ? -1 : inv(c.snap1 + 0.05, c.snap1 + 0.6, tt);
  S.puff = tt < 0 ? -1 : inv(c.fizz + 0.15, c.fizz + 1.1, tt);
  S.ringR = tt < 0 ? -1 : inv(c.release + 0.05, c.release + 0.5, tt);
  S.ringI = tt < 0 ? -1 : inv(c.impact, c.impact + 0.9, tt);
  S.burst = tt < 0 ? 0 : popK(tt, c.burst, c.snapw_end + 0.2, 0.06, 0.15);
  S.ms = tt < 0 ? 0 : popK(tt, c.impact + 0.08, c.burst - 0.04, 0.12, 0.12);
  S.tink = tt < 0 ? -1 : inv(c.tink, c.tink + 0.9, tt);
  S.cape = tt < 0 ? 0 : r(c.cape, c.cape + 0.4) * (tt < c.now3 ? 1 : 0);
  S.steel = tt >= c.cape && tt < c.now3;
  S.evil = tt < 0 ? 0 : r(c.cape, c.cape + 0.4) * (1 - r(c.tink + 0.05, c.tink + 0.45)) * (tt < c.now3 ? 1 : 0);
  // ---- his face and head
  const lookHand = { lookX: 0.9, lookY: 0.2 };
  let f = { ...FACES.calm, ...lookHand, mouth: 'flat', browY: 0.3 };
  if (tt >= 0) {
    f = lerpFace(f, { ...FACES.grin, lookX: 0.9, lookY: 0.15 }, r(c.snap1 + 0.04, c.snap1 + 0.22));
    f = lerpFace(f, { ...FACES.calm, ...lookHand, mouth: 'flat', browY: 0.6, eyeOpen: 1.05 }, r(c.set2, c.set2 + 0.3));
    f = lerpFace(f, { ...FACES.annoyed, lookX: 0.95, lookY: 0.3, mouth: 'flat' }, r(c.fizz + 0.2, c.fizz + 0.4));
    f = lerpFace(f, { ...FACES.confused, lookX: 0.85, lookY: 0.25 }, r(c.glass_in, c.glass_in + 0.3));
    f = lerpFace(f, { ...FACES.startled, lookX: 0.9, lookY: 0.1, mouth: 'o', mouthOpen: 0.5 }, r(c.catapult1, c.catapult1 + 0.2));
    f = lerpFace(f, { ...FACES.calm, lookX: 0.0, lookY: 0.0, mouth: 'flat', browY: 0.9, browTilt: 0.6 }, r(c.never - 0.1, c.never + 0.15));
    f = lerpFace(f, { ...FACES.annoyed, lookX: 0.9, lookY: 0.35, mouth: 'flat', blink: 0.3 }, r(c.loaded, c.loaded + 0.2));
    f = lerpFace(f, { ...FACES.nervous, ...lookHand, mouth: 'grimace', eyeOpen: 0.9, browTilt: 1.3 }, r(c.haul, c.haul + 0.3));
    f = lerpFace(f, { ...FACES.startled, lookX: 0.9, lookY: 0.15 }, r(c.release, c.release + 0.1));
    f = lerpFace(f, { ...FACES.grin, lookX: 0.9, lookY: 0.15 }, r(c.impact + 0.1, c.impact + 0.4));
    // the villain: a smug grin, then the flop: flat, then a slump
    f = lerpFace(f, { ...FACES.grin, lookX: 0.2, lookY: 0.1, browY: -0.4, browTilt: -0.9, mouthOpen: 0.6 }, r(c.cape, c.cape + 0.3));
    f = lerpFace(f, { ...FACES.out, lookX: 0.9, lookY: 0.3, mouth: 'flat', blink: 0.2, eyeOpen: 0.9 }, r(c.tink + 0.1, c.tink + 0.3));
    f = lerpFace(f, { ...FACES.annoyed, lookX: 0.0, lookY: 0.0, mouth: 'flat', blink: 0.45 }, r(c.slump, c.slump + 0.3));
    // the button: he squints at the slow slide
    f = lerpFace(f, { ...FACES.calm, ...lookHand, mouth: 'flat', browY: 0.5 }, r(c.now3, c.now3 + 0.3));
    f = lerpFace(f, { ...FACES.annoyed, lookX: 0.95, lookY: 0.25, mouth: 'wavy', blink: 0.35, browTilt: 0.6 }, r(c.slowstart + 0.1, c.slowstart + 0.4));
    f = lerpFace(f, { ...FACES.calm, ...lookHand, mouth: 'flat', browY: 0.3 }, r(c.loop_in - 0.4, c.loop_in));
  }
  f.blink = Math.max(f.blink || 0, snBlink(tt));
  S.face = f;
  S.hrot = tt < 0 ? 0.05 : 0.05 + 0.05 * popK(tt, c.snap1, c.snap1 + 0.5, 0.05, 0.3) - 0.06 * r(c.slump, c.slump + 0.3) * (1 - r(c.now3, c.now3 + 0.3))
    - 0.07 * popK(tt, c.never - 0.1, c.loaded + 0.1, 0.15, 0.2) + 0.06 * popK(tt, c.catapult1, c.catapult1_end + 0.2, 0.12, 0.2);
  S.hdx = trem * 1.6 * Math.sin(tt * 47);
  S.hdy = tt < 0 ? 0 : 10 * r(c.slump, c.slump + 0.3) * (1 - r(c.now3, c.now3 + 0.3));
  return S;
}
function snBlink(tt, w = 0.45) { const u = ((tt * loopW(w) / (Math.PI * 2) + 0.3) % 1 + 1) % 1; return u < 0.03 ? Math.sin(u / 0.03 * Math.PI) : 0; }

// ---------------------------------------------------------------- the cameras
// the 2D camera (him, the campsite) and the 3D view of the hand (its angles), from one key list
function snCam(tt) {
  const c = cu();
  const K = [
    [-1, 430, 880, 3.3, 0], [0, 430, 880, 3.3, 0],
    [c.fizzled, 434, 876, 3.4, 0], [c.glass_in + 0.6, 462, 905, 3.3, 0], [c.loaded_end, 464, 908, 3.35, 0],
    [c.full, 468, 900, 3.6, 0], [c.macro_in, 468, 900, 3.6, 0],
    [c.finger, 506, 842, 4.6, 0], [c.impact, 508, 844, 4.85, 0], [c.snapw_end, 508, 844, 4.95, 0],
  ];
  if (tt >= c.cape && tt < c.now3) {
    // the villain: lower and wider, a slow push
    const u = ramp(tt, c.cape, c.pose + 0.3, E.inOutSine), v = ramp(tt, c.pose, c.tink + 0.1, E.inOutCubic), w = ramp(tt, c.slump, c.now3, E.inOutSine);
    const sh = popK(tt, c.tink, c.tink + 0.3, 0.02, 0.2);
    return { x: lerp(418, 436, v), y: lerp(lerp(960, 945, u), 905, v) + 3 * sh * Math.sin(tt * 61), zoom: lerp(lerp(2.7, 2.85, u), 3.35, v) - 0.08 * w, rot: 0.04 * (1 - v) };
  }
  if (tt >= c.now3 || tt < 0) {
    // the button: back on him; the loop: the hook's camera
    const u = tt < 0 ? 1 : ramp(tt, c.snap3_end, c.loop_in, E.inOutCubic);
    const a = { x: 446, y: 862, zoom: 3.6 }, b = { x: 430, y: 880, zoom: 3.3 };
    const v = tt < 0 ? 1 : ramp(tt, c.now3, c.slowstart, E.inOutCubic);
    const a0 = { x: 432, y: 878, zoom: 3.35 };
    const m = { x: lerp(a0.x, a.x, v), y: lerp(a0.y, a.y, v), zoom: lerp(a0.zoom, a.zoom, v) };
    return { x: lerp(m.x, b.x, u), y: lerp(m.y, b.y, u), zoom: lerp(m.zoom, b.zoom, u), rot: 0 };
  }
  let k = K[0];
  for (let i = 1; i < K.length; i++) {
    const a = K[i - 1], b = K[i];
    if (tt >= b[0]) { k = b; continue; }
    if (tt > a[0]) { const u = E.inOutCubic(inv(a[0], b[0], tt)); k = a.map((v, j) => lerp(v, b[j], u)); }
    break;
  }
  const sh = popK(tt, c.snap1, c.snap1 + 0.3, 0.02, 0.2) + popK(tt, c.impact, c.impact + 0.4, 0.02, 0.3);
  return { x: k[1] + 4 * sh * Math.sin(tt * 60), y: k[2] + 3 * sh * Math.cos(tt * 53), zoom: k[3], rot: k[4] };
}
// the hand's view angles: [t, yaw offset, pitch]
function snAng(tt) {
  const c = cu();
  const K = [
    [-1, 0.4, 0.15], [0, 0.4, 0.15], [c.glass_in, 0.4, 0.15], [c.loaded_end, 0.45, 0.12],
    [c.finger, 0.3, 0.12], [c.impact, 0.34, 0.1], [c.snapw_end, 0.36, 0.1],
  ];
  let k = K[0];
  if (tt < 0 || tt >= c.now3) k = [0, 0.4, 0.15];
  else if (tt >= c.cape) k = [0, 0.36, 0.18];
  else for (let i = 1; i < K.length; i++) {
    const a = K[i - 1], b = K[i];
    if (tt >= b[0]) { k = b; continue; }
    if (tt > a[0]) { const u = E.inOutCubic(inv(a[0], b[0], tt)); k = a.map((v, j) => lerp(v, b[j], u)); }
    break;
  }
  return { yaw: -Math.PI / 2 + k[1], pitch: k[2] };
}
function snView(cam, ang) {
  const sc = toScreen(cam, SN_WR[0], SN_WR[1]), el = toScreen(cam, SN_EL[0], SN_EL[1]), D = 55;
  const dx = el[0] - sc[0], dy = el[1] - sc[1], l = Math.hypot(dx, dy) || 1;
  const roll = Math.atan2(-dx / l, dy / l);
  return { yaw: ang.yaw, pitch: ang.pitch, roll, tx: 0, ty: 0, tz: 0, D, cx: sc[0], cy: sc[1],
    f: SN_PX * D * cam.zoom / 2.9, mirror: true };
}

// ---------------------------------------------------------------- him at the campsite (his left arm is the 3D one)
function snHero(cam, t, S) {
  const p = snClone(POSES.stand);
  p.armL = { a: 0.16, b: 0.22 };
  p.lean = -0.01;
  const st = { x: CAMP.HX, y: CAMP.GY, s: SN_HS, pose: p, face: S.face, hideArm: 'R', headRot: S.hrot, headDX: S.hdx,
    headDY: 2 * Math.sin(t * loopW(1.6)) + (S.hdy || 0) };
  if (S.cape > 0.01) snCape(ctx, st, S.cape, t);
  const r = campChar(cam, st, t, {});
  return { r, st };
}
function snUpperArm(cam, hero, P2, steel) {
  const shW = toWorld(hero.st, hero.r.shR), sh = toScreen(cam, shW[0], shW[1]);
  const el = P2.pa([0, -BWK.L * 0.97, 0]);
  const w = 42 * hero.st.s * cam.zoom;
  const dx = el[0] - sh[0], dy = el[1] - sh[1], l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l;
  actor(() => {
    line(ctx, sh[0], sh[1], el[0] - ux * w * 0.2, el[1] - uy * w * 0.2, w, steel ? '#3A1450' : CAMPPAL.coat);
    line(ctx, el[0] - ux * w * 0.62, el[1] - uy * w * 0.62, el[0] - ux * w * 0.18, el[1] - uy * w * 0.18, w * 1.1, steel ? '#2A0E3A' : CAMPPAL.coatSh);
  });
}
// the fingertip's path for the streak: the middle fingertip at a few points between two states
function snArc(P2, a, b, u0, u1, t, n = 7) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const u = lerp(u0, u1, i / n), st = snMix(a, b, u);
    const G = snGeo({ fing: snPose(st.w), tw: st.tw, press: st.press, t });
    const q = P2.ph(fkTip(G, 'M', 0.1));
    out.push([q[0], q[1]]);
  }
  return out;
}

// the whole picture at time tt (t = the video time for clocks)
function snFrame(tt, t, o = {}) {
  const c = cu(), S = snS(tt), cam = o.cam || snCam(tt), ang = o.ang || snAng(tt);
  campBack(cam, t, { soft: 0.9 });
  applyCam(cam);
  campFire(t, S.steel ? 0.55 : 1 + 0.9 * S.flare);
  if (S.evil > 0.01) { softDot(ctx, CAMP.HX + 30, 820, 330, '#B81838', 0.32 * S.evil); softDot(gctx, CAMP.HX + 30, 800, 260, '#FF3050', 0.22 * S.evil); }
  const hero = snHero(cam, t, S);
  // the fire's flare on the good snap: light from below right and sparks rising
  screenSpace();
  if (S.flare > 0.01) {
    softDot(ctx, 900, 1900, 1000, '#FF8A2C', 0.35 * S.flare);
    softDot(gctx, 900, 1900, 800, '#FFB040', 0.55 * S.flare);
    for (let i = 0; i < 16; i++) {
      const u = clamp((tt - c.snap1) * (0.8 + 0.5 * hash(i * 3.1))), x = 640 + hash(i * 7.3) * 440 + 50 * Math.sin(u * 5 + i), y = 1950 - u * (1000 + 500 * hash(i * 1.9));
      circle(ctx, x, y, 5 * (1 - u) + 2, rgba('#FFD070', (1 - u) * S.flare)); softDot(gctx, x, y, 22, '#FFA040', 0.8 * (1 - u) * S.flare);
    }
  }
  // the hand
  const V = snView(cam, ang), P2 = bwProj(V, S.th);
  const G = snGeo({ fing: snPose(S.P.w), tw: S.P.tw, press: S.P.press, trem: S.trem, t });
  snUpperArm(cam, hero, P2, S.steel);
  const draw = () => actor(() => bwDraw(ctx, P2, G, { bulge: 0.4 * S.taut, armCol: S.steel ? '#8E96A6' : undefined }));
  if (S.steel) { snSteel(draw); snRivets(ctx, gctx, P2.ph, G, 1); } else draw();
  if (S.contact > 0.02 && S.glass < 0.5 && !S.steel) snContact(ctx, gctx, P2, G, S.contact * 0.8);
  // inside: glass, the string, the bar, the puppeteer
  if (S.glass > 0.01) {
    bwGlass(ctx, P2, G, S.glass * (tt >= c.finger ? 0.5 : 1), { bulge: 0.4 * S.taut });
    snString(ctx, gctx, P2, G, { k: S.str, slack: S.slack, taut: S.taut, barS: S.barS, t });
    bwPuppeteer(ctx, gctx, P2, { k: S.pup, barS: S.barS, pull: S.taut, mood: S.mood, look: S.look, cap: S.cap, t, tilt: S.tilt,
      bar: () => bwBar(ctx, P2, S.barS, S.pup) });
    snContact(ctx, gctx, P2, G, clamp(S.P.press) * S.glass, { glow: S.taut });
  }
  return { S, cam, V, P2, G, hero };
}

// ---------------------------------------------------------------- the overlays of each part
function snOverlays(R, tt, t) {
  const c = cu(), S = R.S, P2 = R.P2, G = R.G;
  screenSpace();
  // shaking with effort
  if (S.trem > 0.3) { const q = P2.ph([0, 9, 3]); snShake(q[0], q[1], q[2] * 8, clamp((S.trem - 0.3) * 2), t); }
  // the good snap: rings from the palm, a streak along the finger's path
  const hit = P2.ph([1.6, 4.4, 2.2]);
  if (S.ring1 > 0 && S.ring1 < 1) snRings(ctx, gctx, hit[0], hit[1], S.ring1, 0.75);
  if (tt >= c.snap1 && tt < c.snap1 + 0.25) snStreak(ctx, gctx, snArc(P2, SN_ST.loaded, SN_ST.fired, 0, 1, t), 1 - inv(c.snap1, c.snap1 + 0.25, tt));
  // the fizzle: a sad puff where the fingers slid
  if (S.puff > 0 && S.puff < 1) { const q = P2.ph(G.pad); snPuff(ctx, q[0] + 30, q[1] - 30, S.puff, 1); }
  // the sleeping puppeteer's zzz (until he wakes)
  if (S.cap > 0.3 && tt < c.wake) { const b = P2.pa([0, -(S.barS + 2.0), 0.35]); applyCam({ x: 540, y: 960, zoom: 1, rot: 0 }); zzz(b[0] + 70, b[1] - 40, t, c.glass_in + 0.4, S.cap, 1.0); screenSpace(); }
  // LOAD meter
  if (S.meter > 0.01) snMeter(540, 1572, 560, S.meterV, S.meter, S.meterFlash, t);
  // the macro's slip, seen once more in the hand: rings (when the macro has cut back)
  // the slam: the slow streak and the rings from the base of the thumb
  if (tt >= c.whip && tt < c.impact + 0.3) {
    const u = ramp(tt, c.whip, c.impact, (x) => x * x * x);
    if (u > 0.02) snStreak(ctx, gctx, snArc(P2, SN_ST.hard, SN_ST.fired, Math.max(0, u - 0.45), u, t), 0.9 * (1 - inv(c.impact, c.impact + 0.3, tt)));
  }
  if (S.ringI > 0 && S.ringI < 1) snRings(ctx, gctx, hit[0], hit[1], S.ringI, 1.25);
  if (S.ms > 0.01) snTag('0.007 SECONDS', 540, 470, S.ms, '#FFD447', null, 54);
  if (S.burst > 0.01) snBurst(Math.min(820, hit[0] + 250), Math.max(520, hit[1] - 330), 1.0, S.burst, 'SNAP!', '#FFD447', -0.12, 120);
  // the villain's steel snap: tink
  if (S.tink > 0 && S.tink < 1) {
    const q = P2.ph(G.pad);
    paint(() => { for (let i = 0; i < 4; i++) { const a = -1.2 + i * 0.5, d = 30 + 40 * S.tink; ctx.strokeStyle = rgba('#F2F6FF', 1 - S.tink); ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(q[0] + Math.cos(a) * d, q[1] + Math.sin(a) * d); ctx.lineTo(q[0] + Math.cos(a) * (d + 22), q[1] + Math.sin(a) * (d + 22)); ctx.stroke(); } });
    snSmallWord('tink.', q[0] - 40, q[1] + 150, S.tink);
  }
}

// ---------------------------------------------------------------- shots
function snShot(lt, t, shot) {
  const R = snFrame(t, t);
  snOverlays(R, t, t);
  const c = cu();
  return { glow: 0.85, zblur: 0.03 * popK(t, c.snap1, c.snap1 + 0.12, 0.02, 0.1) + 0.04 * popK(t, c.impact, c.impact + 0.15, 0.02, 0.12) };
}
SC.hook = snShot;
SC.glass = snShot;
SC.load = snShot;
SC.slam = snShot;
SC.villain = snShot;
SC.button = snShot;
SC.loop = (lt, t, shot) => {
  const tt = t - TLd.duration;
  const R = snFrame(tt, t);
  snOverlays(R, tt, t);
  return { glow: 0.85 };
};
// the macro: the two pads, grip... grip... SLIP!
SC.macro = (lt, t, shot) => {
  const c = cu();
  const press = ramp(t, c.macro_in, c.macro_in + 0.35, E.outCubic);
  const shear = 34 * ramp(t, c.creep1, c.creep1 + 0.22, E.outBack) + 46 * ramp(t, c.creep2, c.creep2 + 0.22, E.outBack)
    + 5 * Math.sin(t * 61) * ramp(t, c.creep1, c.release) * (1 - ramp(t, c.release, c.release + 0.02));
  const slip = ramp(t, c.release, c.release + 0.14, E.inQuad);
  const push = 1 + 0.06 * ramp(t, c.macro_in, c.release, E.inOutSine);
  snMacro({ press, shear, slip, sweat: ramp(t, c.grip1 - 0.2, c.grip1 + 0.2), arrows: ramp(t, c.macro_in + 0.1, c.macro_in + 0.5), t });
  screenSpace();
  if (slip > 0.01) { snRings(ctx, gctx, SN_MC[0], SN_MC[1], ramp(t, c.release, c.release + 0.5), 1.2); snBurst(560, 560, 0.95, popK(t, c.release, c.slip_end + 0.3, 0.05, 0.12), 'SLIP!', '#4DFFB4', -0.1, 120); }
  return { glow: 0.9, push: { k: push, cx: SN_MC[0], cy: SN_MC[1] }, zblur: 0.05 * popK(t, c.release, c.release + 0.12, 0.02, 0.1) };
};
// the race: SPEED-UP
SC.race = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  // the campsite far behind, dark and soft
  const cam = { x: 430 + 30 * lt / D, y: 900, zoom: 1.6 + 0.12 * lt / D, rot: 0 };
  campBack(cam, t, { soft: 1 });
  applyCam(cam); campFire(t, 1);
  screenSpace();
  ctx.fillStyle = 'rgba(10,6,22,0.55)'; ctx.fillRect(0, 0, W, H);
  const snap = 1.0 * ramp(t, c.bar1, c.bar1 + 0.55, (u) => E.outBack(u, 1.8));
  const arm = (1 / 2.6) * ramp(t, c.bar2, c.bar2 + 0.7, E.outCubic);
  snRace({ k: ramp(t, shot.start, shot.start + 0.25), head: ramp(t, shot.start, shot.start + 0.3), snap, arm, x26: ramp(t, c.x26, c.x26 + 0.35), t });
  // sparks off the top of the snap's bar as it arrives
  const sp = popK(t, c.bar1 + 0.3, c.bar1 + 1.2, 0.05, 0.6);
  if (sp > 0.01) snRings(ctx, gctx, 760, 700, inv(c.bar1 + 0.3, c.bar1 + 1.1, t), 0.6, "#4DFFB4");
  const push = 1 + 0.04 * lt / D;
  return { glow: 0.8, push: { k: push, cx: 540, cy: 960 } };
};

// the cover: the hand set to snap, his face, SNAP / CAN YOU?
SC.cover = (lt, t, shot) => {
  const c = cu(), tt = 0.6;
  const S = snS(tt);
  S.face = { ...FACES.grin, lookX: 0.2, lookY: 0.05, browY: 0.7, browTilt: -0.5, mouthOpen: 0.55 };
  const cam = { x: 420, y: 930, zoom: 3.4, rot: 0 };
  campBack(cam, t, { soft: 0.9 });
  applyCam(cam);
  campFire(t, 1.4);
  const hero = snHero(cam, t, S);
  const V = snView(cam, snAng(0)), P2 = bwProj(V, S.th);
  const G = snGeo({ fing: snPose(S.P.w), tw: S.P.tw, press: S.P.press, t });
  screenSpace();
  snUpperArm(cam, hero, P2, false);
  actor(() => bwDraw(ctx, P2, G, {}));
  snContact(ctx, gctx, P2, G, 0.8, { glow: 0.8 });
  bigWord('CAN YOU', 540, 1230, 175, '#FFFFFF', 1, -0.05);
  bigWord('SNAP?', 540, 1430, 250, '#FFD447', 1, -0.05);
  return { glow: 0.85, noCaptions: true };
};

function initScenes2() {
  initCamp();
}
