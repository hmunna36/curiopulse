// Why Is the Sky BLUE? Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;
const shotOf = (id) => TLd.shots.find((s) => s.id === id);
// the strongest of a list of pulses at time t: each is on for `len` seconds, with soft edges
const pulseOf = (t, times, len = 0.16) => times.reduce((m, f) => Math.max(m, clamp((t - f) / 0.03) * clamp((f + len - t) / 0.05)), 0);
// a decaying bump after a moment
const bumpAt = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);
const lerp2 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the trail by day: the sun is up on the right (the key), the sky is the rim from the left
const DAY_LIGHT = { ...LIGHTS.day, pool: 0.22, halo: 0.05 };
// no air: the same sun, harder; nothing fills the shadows, and the rim is the sun's own white
const BARE_LIGHT = { ...LIGHTS.day, shadowTint: [0.5, 0.52, 0.7], shadowDeep: 1.6, rim: [1.0, 0.98, 0.9], rimFrom: [0.85, -0.4], rimAmt: 1.2, pool: 0.5, poolTint: [0.3, 0.32, 0.5], halo: 0.03 };
const mixLight = (A, B, k) => { const o = { ...A }; for (const key of Object.keys(B)) { const a = A[key] === undefined ? LIGHT[key] : A[key], b = B[key]; o[key] = Array.isArray(b) ? b.map((v, i) => lerp(a[i], v, k)) : typeof b === 'number' ? lerp(a, b, k) : (k < 0.5 ? a : b); } return o; };

// ================================================================ the trail: frame 1 and round it
const CAM_A = { x: 522, y: 1260, zoom: 2.92 }, CAM_B = { x: 522, y: 1266, zoom: 3.2 };   // frame 0, and a third of a second later
const CAM_WIDE = { x: 540, y: 1060, zoom: 1.0 };
const BTN_HOLD = [158, -430], BTN_ROT = -0.5;        // where the bottle waits by his cheek in the last shot (and comes up from)
// where the sunlight crashes (world), in the order it does
const CRASH = [[590, 860], [330, 720], [770, 1040], [215, 990], [600, 600], [452, 930], [920, 900]];

// how much of the sky is lit by air at time tt (1 = day; it goes out on "black" like a bulb that dies)
function airOn(tt) {
  const c = cu(), d = tt - c.black;
  if (d < 0) return 1;
  if (d < 0.05) return 0.25;
  if (d < 0.11) return 0.7;
  return d < 0.17 ? 0.12 : 0;
}
// the opening, as a function of tt = seconds since frame 1 (negative = the last frames of the Short, on their way here)
function gulpA(tt) {
  const c = cu();
  const up = tt < 0 ? ramp(tt, -0.52, -0.08, E.inOutCubic) : 1;                 // (the end of the Short) the bottle comes up to his mouth
  const off = ramp(tt, c.black + 0.02, c.black + 0.24, E.outCubic);             // the sky goes out: the bottle comes off his lips
  const down = ramp(tt, c.black + 0.4, c.its + 0.7, E.inOutCubic);              // ... and sinks while he looks up
  const drink = up * (1 - 0.3 * off) * (1 - down);
  let gl = 0;
  for (const f of c.glugs) { const d = tt - f; if (d >= 0 && d < 0.42) gl = Math.max(gl, Math.sin(Math.PI * d / 0.42)); }
  gl *= 1 - off;
  let face = { ...TRFACE.sip };
  face = lerpFace(face, TRFACE.huh, ramp(tt, c.black, c.black + 0.07));
  face = lerpFace(face, { ...TRFACE.up, lookX: 0.75 }, ramp(tt, c.its - 0.1, c.its + 0.5));
  face = lerpFace(face, { ...TRFACE.up, lookX: 0.2, lookY: -0.9 }, ramp(tt, c.crashing, c.crashing + 0.4));
  face.blink = Math.max(face.blink, pulseOf(tt, [c.its + 0.25], 0.12));
  const jolt = bumpAt(tt, c.black, 7);
  return {
    face, drink, gulp: gl, cheeks: lerp(0.22 + 0.3 * gl, 1, off) * (tt < 0 ? up : 1), level: 0.62, slosh: 0.12 * gl - 0.5 * jolt * Math.sin((tt - c.black) * 30),
    headRot: -0.17 * up * (1 - off) + 0.05 * jolt * Math.sin((tt - c.black) * 34), headDY: 3.2 * gl - 9 * jolt, headDX: 5 * up * (1 - off),
    flinch: jolt, bob: -5 * jolt, fizz: 1 - off, hold: tt < 0 ? BTN_HOLD : [132, -322], holdRot: tt < 0 ? BTN_ROT : -0.3,
  };
}
function gulpCam(tt) {
  const c = cu();
  const k = camKeys(tt, [[-0.62, 522, 1228, 2.02], [0, CAM_A.x, CAM_A.y, CAM_A.zoom], [0.3, CAM_B.x, CAM_B.y, CAM_B.zoom], [c.black - 0.1, 522, 1268, 3.3],
    [c.black + 0.26, 524, 1248, 2.74], [c.sunlight - 0.32, CAM_WIDE.x, CAM_WIDE.y, CAM_WIDE.zoom], [c.dive, 540, 1050, 1.04]], E.inOutCubic);
  if (tt >= 0 && tt < 0.3) { const u = E.outCubic(tt / 0.3); k.zoom = lerp(CAM_A.zoom, CAM_B.zoom, u); k.y = lerp(CAM_A.y, CAM_B.y, u); }   // the first push is quick off the mark
  if (tt > c.black) { const j = bumpAt(tt, c.black, 9); k.x += 7 * j * Math.sin((tt - c.black) * 60); k.y += 6 * j * Math.cos((tt - c.black) * 52); }
  return k;
}
// GLUG, GLUG: a word per swallow by the bottle (it reads with the sound off)
function glugWords(cam, Hh, tt) {
  const c = cu();
  c.glugs.forEach((f, i) => {
    const d = tt - f;
    if (d < 0 || d > 0.5 || tt > c.black) return;
    const R = toScreen(cam, Hh.rim[0], Hh.rim[1]);
    const k = E.outBack(clamp(d / 0.12), 2.2) * (1 - ramp(d, 0.36, 0.5));
    bigWord('GLUG', clamp(R[0] + 236 + 150 * (i % 2), 200, 880), R[1] - 318 - 54 * (i % 2) - 40 * d, 92, '#BFF0FF', k, i % 2 ? 0.13 : -0.1);
  });
}
// a packet of sunlight flying from the sun to where it crashes, and what the crash leaves: a ring, sparks, blue
function crashFx(cam, t, i) {
  const c = cu(), T = c.crashes[i], P = CRASH[i % CRASH.length], S = TR.sun;
  if (T === undefined) return;
  const u = inv(T - 0.3, T, t);
  if (u > 0 && u < 1) {
    const h = lerp2(S, P, E.inCubic(u)), tl = lerp2(S, P, Math.max(0, E.inCubic(u) - 0.2));
    for (const [cc, w, a] of [[ctx, 13, 0.95], [gctx, 26, 0.8]]) line(cc, tl[0], tl[1], h[0], h[1], w, rgba('#FFFFFF', a));
    circle(ctx, h[0], h[1], 11, '#FFFFFF'); softDot(gctx, h[0], h[1], 60, '#FFFFFF', 0.9);
  }
  const d = t - T;
  if (d >= 0 && d < 0.9) {
    const k = d / 0.9, col = trSkyAt(P[1] - 500);
    softDot(gctx, P[0], P[1], 110 * (1 + k), '#9FCBFF', 0.6 * (1 - k) * (1 - k));
    for (const [cc, w, a] of [[ctx, 9 * (1 - k), 0.9], [gctx, 18 * (1 - k), 0.7]]) { cc.beginPath(); cc.arc(P[0], P[1], 26 + 250 * E.outCubic(k), 0, 7); cc.lineWidth = w; cc.strokeStyle = rgba('#8FC4FF', a * (1 - k)); cc.stroke(); }
    const rng = mulberry32(31 + i * 7);
    for (let j = 0; j < 9; j++) {
      const a = (j / 9) * 6.283 + rng() * 0.5, r0 = 30 + 190 * E.outCubic(k) * (0.6 + 0.6 * rng()), r1 = r0 + 46 * (1 - k);
      for (const [cc, w] of [[ctx, 7], [gctx, 14]]) line(cc, P[0] + Math.cos(a) * r0, P[1] + Math.sin(a) * r0, P[0] + Math.cos(a) * r1, P[1] + Math.sin(a) * r1, w * (1 - k), rgba('#5FA8FF', 0.95 * (1 - k)));
    }
    if (d < 0.14) { ctx.save(); const s = 1 + 3 * d; ctx.translate(P[0], P[1]); ctx.scale(s, s); for (let j = 0; j < 4; j++) { ctx.rotate(Math.PI / 4); line(ctx, -30, 0, 30, 0, 9, rgba('#FFFFFF', 1 - d / 0.14)); } ctx.restore(); }
  }
}
function crashPatches(t) {
  const c = cu();
  return c.crashes.map((T, i) => { const P = CRASH[i % CRASH.length]; return [P[0], P[1], 90 + 620 * ramp(t, T, T + 1.7, E.outCubic), 0.92 * ramp(t, T, T + 0.22)]; });
}

SC.hook = (lt, t, shot) => {
  const c = cu(), A = gulpA(t), cam = gulpCam(t);
  const dive = ramp(t, c.dive, shot.end, E.inCubic);
  if (dive > 0) Object.assign(cam, scaledCam(cam, CRASH[0], 1 + 2.4 * dive));
  const air = airOn(t), back = 0.34 * ramp(t, c.crashes[1], shot.end);
  const blue = Math.max(air, back);
  const Hh = trailDraw(t, { cam, A, blue, clouds: air > 0.5 ? 1 : 0, patches: air < 0.5 ? crashPatches(t) : null, sun: { k: 1, rays: 0.3 },
    sky: () => { for (let i = 0; i < c.crashes.length; i++) crashFx(cam, t, i); },
    after: (Hr) => trDrops(ctx, Hr.rim[0] + 16, Hr.rim[1] + 8, c.black + 0.03, t, 9, 5, 0.9, 200) });   // the mouthful he nearly loses
  glugWords(cam, Hh, t);
  return { glow: 0.8, capY: 1440, flash: 0.32 * bumpAt(t, c.black, 26) * (t >= c.black ? 1 : 0), zblur: 0.34 * dive, zcx: 540 + (CRASH[0][0] - 540), zcy: 960 + (CRASH[0][1] - 1052) };
};
const HOOK_LIGHT = (lt, t) => { const a = airOn(t), back = ramp(t, cu().crashes[1], cu().dive + 0.4); return { ...mixLight(BARE_LIGHT, DAY_LIGHT, Math.max(a, 0.45 * back)), dof: lerp(0.9, 0.0, ramp(t, cu().black + 0.3, cu().sunlight - 0.4)) }; };


// ================================================================ inside the beam: every colour at once, and red's long lazy wave
const AIR_LIGHT = { ...LIGHTS.night, pool: 0.22, halo: 0, rim: [0.5, 0.72, 1.0], rimAmt: 1.0, shadowDeep: 1.25 };
const COLS = ['R', 'O', 'Y', 'G', 'B', 'V'], COLX = [190, 330, 470, 610, 750, 890], S0 = 3000;
// how far the pack of ribbons has come: quick, then red's lazy pace once it is alone (tR)
function packS(lt, tR) {
  const v1 = 560, v2 = 300, d = 0.6;
  if (lt <= tR) return v1 * lt;
  const u = Math.min(lt - tR, d);
  return v1 * tR + v1 * u - 0.5 * ((v1 - v2) / d) * u * u + v2 * Math.max(0, lt - tR - d);
}
// molecules out at the sides of a column of air (world y from y0 to y1), looking at a point
function sideMols(t, y0, y1, at, o = {}) {
  const G = 250;
  for (let j = Math.floor(y0 / G); j <= Math.ceil(y1 / G); j++) for (const sd of [-1, 1]) {
    if (o.side && o.side !== sd) continue;
    const h = hash(j * 3.7 + sd * 11.3);
    if (h < 0.28) continue;
    const x = 540 + sd * (270 + 150 * hash(j * 1.3 + sd)), y = j * G + 190 * hash(j * 2.1 + sd * 5);
    if (y < (o.from === undefined ? -1e9 : o.from) || y > (o.to === undefined ? 1e9 : o.to)) continue;
    const dx = at[0] - x, dy = at[1] - y, L = Math.hypot(dx, dy) || 1;
    airMol(x, y + 7 * Math.sin(t * 1.3 + j), 0.5 + 0.2 * h, t + j, { rot: 6.28 * hash(j + sd * 7) + 0.25 * Math.sin(t * 0.6 + j), look: [dx / L, dy / L], blink: pulseOf((t + j * 0.37) % 3.1, [1.2], 0.12) });
  }
}
SC.colours = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, tS = c.every - 0.2 - T0, tR = c.red - 0.16 - T0;
  const sH = S0 + packS(lt, tR);
  const solo = ramp(lt, tR + 0.22, tR + 0.95, E.inOutCubic);     // the others are gone; red has the air to itself
  const zoom = lerp(1, 1.26, solo) + 0.14 * ramp(lt, tR + 1, shot.end - T0), cam = { x: 540, y: sH + lerp(110, 70, solo) / zoom, zoom, rot: 0 };
  airBg(cam, t);
  applyCam(cam);
  const lamR = WAVES.R[0], rx = lerp(COLX[0], 540, solo);
  const redPath = downPath(rx), ampR = WAVES.R[1] * lerp(0.6, 1, solo) * ramp(lt, tS + 0.1, tS + 0.6);
  const Hr = ribbonAt(redPath, sH, lamR, ampR);
  // the air, close: a column of molecules that red's long wave goes round, and others out at the sides
  const sA = S0 + packS(tR + 0.5, tR) + 520;
  for (let k = Math.ceil((sA - lamR / 4) / (lamR / 2)); k <= Math.floor((sH + 1300 - lamR / 4) / (lamR / 2)); k++) {
    const s = lamR / 4 + k * (lamR / 2), right = k % 2 === 0, mx = 540 + (right ? 42 : -42), gone = sH - s;
    const dx = Hr[0] - mx, dy = Hr[1] - s, L = Math.hypot(dx, dy) || 1;
    airMol(mx, s, 0.6, t + k, { rot: right ? 0.5 : -0.5, look: gone > 170 ? [0, 0.2] : [dx / L, dy / L], shrug: gone > 170 ? 1 : 0, blink: gone > 215 && gone < 250 ? 1 : 0 });
  }
  sideMols(t, sH - 1100, sH + 1300, Hr, { from: sA - 380 });
  // the light: one white beam, then every colour side by side; then the others run on and red is alone
  if (lt < tS) lightRibbon(downPath(540), sH, { col: HUE.W, lam: 300, amp: 0, len: 1500, w: 52, face: 'dot', t });
  else COLS.forEach((key, i) => {
    const kS = ramp(lt, tS, tS + 0.42, (x) => E.outBack(x, 1.4)), kc = ramp(lt, tS, tS + 0.3), isR = i === 0;
    const gone = isR ? 0 : ramp(lt, tR + 0.03 * i, tR + 0.46 + 0.03 * i, E.inCubic);
    if (gone >= 1) return;
    const [lam, amp0] = WAVES[key];
    if (isR) lightRibbon(redPath, sH, { col: mixH('#FFFFFF', HUE.R, kc), lam, amp: ampR, len: lerp(640, 800, solo), w: lerp(46, lerp(24, 33, solo), kS), face: 'lazy', t, glow: 0.7, core: 0.22,
      blink: pulseOf(lt, [tR + 2.6], 0.3) });
    else lightRibbon(downPath(lerp(540, COLX[i], kS)), sH + 1800 * gone, { col: mixH('#FFFFFF', HUE[key], kc), lam, amp: amp0 * ramp(lt, tS + 0.1, tS + 0.6), len: 640, w: lerp(46, 24, kS),
      face: key === 'B' ? 'twitchy' : 'dot', t, twitch: key === 'B' || key === 'V' ? 0.8 : 0, a: 1 - gone });
  });
  if (lt >= tS) { const P = toScreen(cam, 540, sH); scatterBurst(P[0], P[1], T0 + tS, t, 3, 0.9); }
  // "the air": the molecule it has just gone round gets a label, and wonders what that was
  const kA = Math.floor((sH - 150 - lamR / 4) / (lamR / 2)), sAir = lamR / 4 + kA * (lamR / 2), PA = toScreen(cam, 540 + (kA % 2 === 0 ? 42 : -42), sAir);
  const ak = ramp(t, c.slips - 0.12, c.slips + 0.06);
  if (ak > 0 && sAir > sA - 10) {
    const side = kA % 2 === 0 ? 1 : -1;
    tagPill('AIR', clamp(PA[0] + side * 250, 190, 880), clamp(PA[1] - 20, 470, 1180), ak, '#BFF0FF', [PA[0] + side * 46, PA[1]], 46);
    bigWord('?', PA[0] - side * 30, PA[1] - 74, 78, '#FFD447', ak * (0.9 + 0.1 * Math.sin(t * 9)), side * 0.14);
  }
  return { glow: 0.9, flash: 0.5 * (1 - ramp(lt, 0, 0.18)), zblur: 0.2 * (1 - ramp(lt, 0, 0.22)) };
};

// ================================================================ blue's short twitchy wave: it smacks into the air and bounces everywhere
const PIN = [[540, 880], [250, 650], [800, 560], [330, 1080], [800, 1010], [560, 470], [170, 900], [860, 780]];
const PIN_PATH = polyPath([[540, 880 - 2600], ...PIN, [1380, 420]]);
function blueS(t) {
  const b = cu().bonks, acc = PIN_PATH.acc;
  if (t <= b[0]) return acc[1] - 940 * (b[0] - t);
  for (let i = 0; i < b.length - 1; i++) if (t < b[i + 1]) { const u = inv(b[i], b[i + 1], t); return lerp(acc[i + 1], acc[i + 2], i === 0 ? E.inOutCubic(u) : Math.pow(u, 0.85)); }
  return acc[b.length] + 1500 * (t - b[b.length - 1]);
}
SC.blue = (lt, t, shot) => {
  const c = cu(), b = c.bonks, T0 = shot.start;
  const sB = blueS(t), Hb = PIN_PATH(sB);
  const shk = b.reduce((m, f) => m + bumpAt(t, f, 13), 0);
  const cam = t < b[0] ? { x: 540, y: Hb[1] + 270 - 190 * ramp(t, b[0] - 0.45, b[0], E.inOutCubic), zoom: 1, rot: 0 }
    : { x: 540 + 7 * shk * Math.sin(t * 70), y: 960 + 6 * shk * Math.cos(t * 61), zoom: lerp(1, 0.95, ramp(t, b[1], b[7])), rot: 0 };
  airBg(cam, t);
  applyCam(cam);
  // the trail it leaves: blue, wherever it has been
  paint(() => {
    for (let i = 0; i < b.length - 1; i++) {
      if (t < b[i]) break;
      const P = PIN[i], Q = t >= b[i + 1] ? PIN[i + 1] : [Hb[0], Hb[1]], al = 0.24 + 0.4 * Math.exp(-(t - b[i]) * 0.8);
      line(gctx, P[0], P[1], Q[0], Q[1], 26, rgba('#3F9BFF', al)); line(ctx, P[0], P[1], Q[0], Q[1], 7, rgba('#6FB4FF', al * 0.9));
    }
  });
  // red, the long lazy one, being overtaken on the way in
  const yR = PIN[0][1] - 940 * (b[0] - T0) + 420 + 300 * lt;
  if (t < b[0]) lightRibbon(downPath(215), yR, { col: HUE.R, lam: WAVES.R[0], amp: WAVES.R[1], len: 800, w: 33, face: 'lazy', t, look: [0.9, 0.3], glow: 0.7, core: 0.22 });
  if (t < b[0]) sideMols(t, cam.y - 1100, Math.min(cam.y + 1100, 150), Hb, { side: 1, to: 120 });
  // the molecules it will meet
  PIN.forEach((P, i) => {
    const dx = Hb[0] - P[0], dy = Hb[1] - P[1], L = Math.hypot(dx, dy) || 1, h = t >= b[i] ? clamp(1 - (t - b[i]) / 0.55) : 0, kn = bumpAt(t, b[i], 10);
    const dir = i < PIN.length ? [P[0] - (i ? PIN[i - 1][0] : 540), P[1] - (i ? PIN[i - 1][1] : 0)] : [0, 1], dl = Math.hypot(dir[0], dir[1]) || 1;
    airMol(P[0] + 22 * kn * dir[0] / dl, P[1] + 22 * kn * dir[1] / dl + 5 * Math.sin(t * 1.4 + i), 0.86, t + i, { rot: i % 2 ? 0.42 : -0.42, look: [dx / L, dy / L], hit: h,
      glow: t >= b[i] ? 0.55 + 0.45 * bumpAt(t, b[i], 2.4) : 0, blink: pulseOf((t + i * 0.53) % 2.9, [1.1], 0.12) });
  });
  // sparks of blue flying off every later smack, in every direction
  for (let i = 2; i < b.length; i++) {
    const d = t - b[i];
    if (d < 0 || d > 1.0) continue;
    for (let j = 0; j < 4; j++) {
      const a = 6.283 * hash(i * 7.1 + j * 3.3) + j * 1.57, P = PIN[i];
      lightRibbon(polyPath([P, [P[0] + Math.cos(a) * 900, P[1] + Math.sin(a) * 900]]), 70 + 760 * d, { col: HUE.B, lam: 58, amp: 10, len: 120, w: 13, face: null, t, a: 1 - d, glow: 0.8 });
    }
  }
  const dazed = t >= b[0] && t < b[0] + 0.62, ow = b.some((f) => t >= f && t < f + 0.13);
  lightRibbon(PIN_PATH, sB, { col: HUE.B, lam: 104, amp: 25, len: 360, w: 29, face: dazed || ow ? 'ouch' : 'twitchy', t, twitch: dazed ? 0.2 : 1, look: [Math.cos(Hb[2]), Math.sin(Hb[2])] });
  b.forEach((f, i) => scatterBurst(PIN[i][0], PIN[i][1], f, t, i + 1, i === 0 ? 1.3 : 1));
  screenSpace();
  const wk = t >= b[0] ? E.outBack(clamp((t - b[0]) / 0.12), 2.4) * (1 - ramp(t, b[0] + 0.5, b[0] + 0.72)) : 0;
  bigWord('BONK!', 742, 730, 124, '#FFD447', wk, 0.12);
  const lk = ramp(t, c.molecules - 0.06, c.molecules + 0.12) * (1 - ramp(t, c.bounces + 0.26, c.bounces + 0.4));
  tagPill('AIR MOLECULE', 372, 520, lk, '#BFF0FF', [272, 606], 38);
  return { glow: 0.9, flash: 0.3 * (1 - ramp(lt, 0, 0.12)) + 0.2 * bumpAt(t, b[0], 12) * (t >= b[0] ? 1 : 0) + 0.8 * ramp(t, b[7] + 0.02, shot.end, E.inCubic) };
};

// ================================================================ the trail: blue from every direction, and the sky is back
const SKYPTS = [[150, 700], [760, 760], [420, 560], [930, 980], [80, 1010], [610, 930], [300, 880], [880, 520], [520, 720], [220, 480], [700, 600], [1000, 700], [360, 1040], [640, 1090], [820, 1150], [140, 860]];
const skyT = (i) => { const c = cu(); return lerp(c.hits - 0.2, c.direction + 0.3, i / (SKYPTS.length - 1)); };
const skyBlue = (t) => ramp(t, cu().direction + 0.05, cu().thats + 0.1, E.inOutCubic);
SC.sky = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 540, 1060, 1.0], [D, 528, 1088, 1.13]]);
  const blue = skyBlue(t), eye = [TR_HEAD[0], TR_HEAD[1] - 4];
  const patches = SKYPTS.map((P, i) => [P[0], P[1], 70 + 460 * ramp(t, skyT(i), skyT(i) + 1.3, E.outCubic), 0.9 * ramp(t, skyT(i) - 0.08, skyT(i) + 0.16)]);
  let last = 0;
  SKYPTS.forEach((P, i) => { if (t >= skyT(i)) last = i; });
  const P = SKYPTS[last], dx = P[0] - eye[0], dy = P[1] - eye[1], L = Math.hypot(dx, dy);
  let face = { ...TRFACE.up, lookX: clamp(dx / 320, -1, 1), lookY: clamp(dy / L, -1, 0.2) };
  face = lerpFace(face, TRFACE.us, ramp(t, c.thats + 0.1, c.thats + 0.3));
  face.blink = Math.max(face.blink, pulseOf(t, [c.thats + 0.42], 0.13));
  const A = { face, cheeks: 1, headRot: 0.05 * clamp(dx / 400, -1, 1) * (1 - ramp(t, c.thats, c.thats + 0.25)), hold: [132, -322], holdRot: -0.3, flinch: 0.25 * (1 - blue) };
  trailDraw(t, { cam, A, blue, patches, clouds: ramp(t, c.thats - 0.1, c.thats + 0.45), sun: { rays: 0.25 },
    after: (Hh) => {
      // blue arriving at his eyes from all over the sky
      SKYPTS.forEach((Q, i) => {
        const u = inv(skyT(i), skyT(i) + 0.5, t);
        if (u <= 0 || u >= 1) return;
        const path = polyPath([Q, eye]), Lq = path.len;
        lightRibbon(path, Lq * E.inCubic(u) * 0.97, { col: HUE.B, lam: 48, amp: 9, len: Math.min(170, Lq * 0.6), w: 13, face: null, t, glow: 0.9 });
      });
      // two birds, once there is a sky to fly in
      const bk = ramp(t, c.thats + 0.1, c.thats + 0.4);
      if (bk > 0) paint(() => { for (const [bx, by, sp] of [[250, 640, 1], [330, 690, 0.8]]) { const x = bx + 60 * (t - c.thats) * sp, fp = Math.sin(t * 11 + bx); ctx.beginPath(); ctx.moveTo(x - 17, by - 7 * fp); ctx.quadraticCurveTo(x - 7, by - 9 - 4 * fp, x, by); ctx.quadraticCurveTo(x + 7, by - 9 - 4 * fp, x + 17, by - 7 * fp); ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.strokeStyle = rgba('#20315A', 0.85 * bk); ctx.stroke(); } });
    } });
  return { glow: 0.82, capY: 1440, flash: 0.45 * (1 - ramp(lt, 0, 0.16)) };
};

// ================================================================ the Moon at noon
const MOON_HOLD = [150, -246], MOON_ROT = -0.14;
let MOON_TOUCH = 0.5;
SC.moon = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0;
  const cam = camKeys(lt, [[0, 506, 1232, 2.1], [c.onmoon - T0 - 0.15, 510, 1216, 1.82], [c.black2 - T0, 540, 1150, 1.35], [D, 532, 1162, 1.46]]);
  const hopU = clamp(lt / 0.95), hop = 58 * (1 - hopU * hopU), land = bumpAt(lt, 0.95, 7) * (lt >= 0.95 ? 1 : 0);
  const tink = c.tink, tryK = ramp(t, c.noon - 0.3, tink, E.inCubic), back = bumpAt(t, tink, 5) * (t >= tink ? 1 : 0);
  let face = { ...TRFACE.hold, lookX: 0.5 * Math.sin(lt * 2.2), lookY: -0.3 };
  face = lerpFace(face, { ...TRFACE.up, lookX: -0.5 }, ramp(t, c.onmoon - 0.1, c.onmoon + 0.2));
  face = lerpFace(face, { ...TRFACE.hold, lookX: 0.6, lookY: 0.1, browTilt: -0.2 }, ramp(t, c.noon - 0.3, c.noon));
  face = lerpFace(face, { ...FACES.annoyed, mouth: 'flat', mouthOpen: 0, lookX: 0, lookY: 0.1, blink: 0.35 }, ramp(t, tink + 0.05, tink + 0.18));
  const A = { suit: true, face, cheeks: 1, drinkE: MOON_TOUCH * tryK * (1 - 0.16 * back), hold: MOON_HOLD, holdRot: MOON_ROT, headDX: -3 * back, headRot: -0.03 * back, level: 0.62,
    y: TR.hy - hop, bob: 9 * land, flinch: 0.5 * (1 - hopU) };
  moonBack(cam, t);
  if (lt >= 0.95 && lt < 1.9) paint(() => { const k = (lt - 0.95) / 0.95; for (const sd of [-1, 1]) for (let j = 0; j < 3; j++) softDot(ctx, TR.hx + sd * (60 + 90 * k + 26 * j), MOON.groundY + 8 - 30 * k * (1 + 0.4 * j), 22 + 30 * k, '#D5D9E4', 0.5 * (1 - k)); });
  const Hh = trHero(cam, t, A);
  applyCam(cam);
  // the nozzle meets the glass
  const d = t - tink;
  if (d >= 0 && d < 0.4) paint(() => {
    const k = d / 0.4, x = Hh.rim[0] - 8, y = Hh.rim[1] - 6;
    for (let j = 0; j < 7; j++) { const a = -2.6 + j * 0.42; line(ctx, x + Math.cos(a) * (14 + 40 * k), y + Math.sin(a) * (14 + 40 * k), x + Math.cos(a) * (26 + 56 * k), y + Math.sin(a) * (26 + 56 * k), 5 * (1 - k), rgba('#FFFFFF', 1 - k)); }
    softDot(gctx, x, y, 60, '#FFFFFF', 0.7 * (1 - k));
  });
  screenSpace();
  const S = toScreen(cam, MOON.sun[0], MOON.sun[1]);
  tagPill('12:00 NOON', clamp(S[0] - 96, 300, 720), S[1] + 150, ramp(t, c.noon - 0.12, c.noon + 0.06), '#FFD447', [S[0] - 40, S[1] + 52], 42);
  if (d >= 0 && d < 0.4) { const Pt = toScreen(cam, Hh.rim[0] + 150, Hh.rim[1] - 84); bigWord('TINK', Pt[0], Pt[1] - 30 * d, 78, '#BFF0FF', E.outBack(clamp(d / 0.1), 2.2) * (1 - ramp(d, 0.28, 0.4)), -0.12); }
  return { glow: 0.82, capY: 1440, flash: 0.35 * (1 - ramp(lt, 0, 0.12)) };
};

// ================================================================ the long way through the air
SC.long = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, EL0 = 1.3;
  const sink = ramp(t, c.crosses - 0.3, c.forty - 0.08, E.inOutCubic), el = EL0 * (1 - sink);
  const lose = ramp(t, c.blues - 0.12, c.away_end + 0.08);
  longBack(t);
  const B = longBeam(t, el, { lose, far: lerp(760, 480, el / EL0) });
  longSun(t, B.sunP, 1, sink);
  // him, small, on the curve of the Earth
  let face = { ...TRFACE.up, lookX: lerp(0, 0.9, sink), lookY: lerp(-1, -0.2, sink) };
  const cam2 = { x: 0, y: 0, zoom: 0.22, rot: LW.tilt, sx: LW.o[0] - 540, sy: LW.o[1] - 960 };
  trHero(cam2, t, { x: 0, y: 0, s: 1, face, cheeks: 1, hold: [132, -322], holdRot: -0.3 });
  screenSpace();
  // what is left gets to him: his face in that light
  const warm = lose * sink;
  if (warm > 0.02) softDot(gctx, B.E0[0], B.E0[1], 60, B.end, 0.5 * warm);
  // how much air the light crosses: a ruler along the part that is in the air, and the count
  const L0 = lwPath(EL0), L1 = lwPath(0), n = Math.round(lerp(1, 38, Math.pow(clamp((B.L - L0) / (L1 - L0)), 1.5)));
  const nx = -B.d[1], ny = B.d[0], off = el > 0.6 ? 56 : -62;
  const a0 = [B.E0[0] + nx * off, B.E0[1] + ny * off], a1 = [B.inP[0] + nx * off, B.inP[1] + ny * off], rk = ramp(lt, 0.25, 0.6) * (1 - 0.75 * lose);
  if (rk > 0.01) paint(() => {
    ctx.globalAlpha = rk;
    line(ctx, a0[0], a0[1], a1[0], a1[1], 5, '#FFD447');
    for (const p of [a0, a1]) line(ctx, p[0] - B.d[0] * 0 - nx * 12, p[1] - ny * 12, p[0] + nx * 12, p[1] + ny * 12, 5, '#FFD447');
    ctx.globalAlpha = 1;
  });
  const mid = [(a0[0] + a1[0]) / 2 + nx * (off > 0 ? 150 : -74), (a0[1] + a1[1]) / 2 + ny * (off > 0 ? 150 : -74)];
  const punch = 1 + 0.35 * bumpAt(t, c.forty, 7) * (t >= c.forty ? 1 : 0);
  pill(clamp(mid[0], 300, 760), clamp(mid[1], 500, 980), `${n}× THE AIR`, '#FFD447', rk * punch, 54);
  tagPill('AIR', 770, 1030, ramp(lt, 0.15, 0.35) * (1 - ramp(t, c.blues, c.blues + 0.2)), '#8FC8FF', [700, 902], 44);
  tagPill('NOON', B.sunP[0] + 170, B.sunP[1] + 6, ramp(lt, 0.2, 0.4) * (1 - ramp(t, c.crosses - 0.3, c.crosses - 0.15)), '#FFFFFF', null, 44);
  tagPill('SUNSET', B.sunP[0] - 70, B.sunP[1] - 112, ramp(t, c.forty - 0.1, c.forty + 0.1), '#FF9A3C', null, 46);
  return { glow: 0.85, flash: 0.3 * (1 - ramp(lt, 0, 0.12)), push: { k: 1 + 0.05 * lt / D, cx: 500, cy: 900 } };
};

// ================================================================ and you get the leftovers
const DUSK_SUN = [745, 1296];
SC.dusk = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 572, 1252, 1.56], [D, 562, 1244, 1.68]]);
  const A = { face: { ...TRFACE.hold, lookX: 0.95, lookY: 0.1, browY: 1.2, blink: pulseOf(t, [c.leftovers + 0.5], 0.12) }, cheeks: 1, hold: [132, -322], holdRot: -0.3, headRot: 0.03 };
  trailDraw(t, { cam, A, blue: 0, dusk: 1, clouds: 0.9, stars: 0, sun: { at: DUSK_SUN, r: 56, k: 1, rays: 0.22, glow: 0.55 },
    after: (Hh) => {
      // what is left of the light gets to him: red in front, lazy as ever, orange and yellow behind it
      const end = [Hh.head[0] + 172, Hh.head[1] - 66];
      [['O', 0.2, 34, -52], ['R', 0, 0, 0]].forEach(([key, dl, ox, oy], i) => {
        const path = polyPath([[DUSK_SUN[0] + ox, DUSK_SUN[1] + oy * 0.2], [806 + ox, 1196 + oy * 0.6], [744 + ox, 1124 + oy], [end[0] + ox * 1.6, end[1] + oy]]);
        const u = ramp(lt, 0.02 + dl, 0.85 + dl, E.outCubic);
        lightRibbon(path, path.len * u, { col: key === 'R' ? '#FF2F3F' : '#FF7A1E', lam: 96, amp: 14 - 3 * i, len: 230, w: key === 'R' ? 27 : 19, face: key === 'R' ? 'lazy' : 'dot', t, look: [-0.9, 0.2],
          glow: 0.25, core: 0.1, edge: key === 'R' ? '#6A0C22' : '#7A2A0C', blink: key === 'R' ? pulseOf(t, [c.leftovers + 0.28], 0.22) : 0 });
      });
    } });
  return { glow: 0.85, capY: 1440, flash: 0.3 * (1 - ramp(lt, 0, 0.12)) };
};

// ================================================================ Mars: it is the other way round
const MARS_DAYL = { ...LIGHTS.day, keyTint: [1.1, 1.0, 0.88], shadowTint: [0.82, 0.66, 0.6], rim: [1.0, 0.86, 0.6], pool: 0.22, poolTint: [0.6, 0.45, 0.4], halo: 0.04 };
const MARS_EVEL = { ...LIGHTS.day, keyTint: [0.86, 0.95, 1.12], shadowTint: [0.5, 0.52, 0.8], shadowDeep: 1.5, rim: [0.55, 0.78, 1.0], rimFrom: [0.9, 0.1], rimAmt: 1.6, pool: 0.6, poolTint: [0.3, 0.3, 0.5], halo: 0.03 };
const marsE = (t) => ramp(t, cu().msky_end - 0.12, cu().bsun + 0.5, E.inOutCubic);
SC.mars = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0, e = marsE(t);
  const cam = camKeys(lt, [[0, 512, 1236, 1.9], [c.backwards - T0, 516, 1226, 1.82], [c.butter - T0 + 0.25, 560, 1016, 1.0], [c.msky_end - T0, 562, 1010, 1.0], [c.bsun - T0 + 0.5, 596, 1120, 1.12], [D, 604, 1128, 1.17]]);
  marsBack(cam, t, e);
  applyCam(cam);
  const rl = ramp(t, c.backwards - 0.05, c.backwards + 0.15) * (1 - ramp(t, c.butter, c.butter + 0.3)) + ramp(t, c.dust - 0.05, c.dust + 0.1);
  const shake = bumpAt(t, c.dust + 0.12, 5) * (t >= c.dust + 0.12 ? 1 : 0);
  actor(() => marsRover(ctx, 250, MARS.groundY + 4, 0.66, t, { e, look: lerp(-0.6, 1, clamp(rl)) * (1 - e) + 1 * e * (1 - shake), blue: e > 0.5, tilt: 0.16 * shake * Math.sin(t * 40), nod: Math.sin(t * 2.2) * (1 - e) }));
  let face = { ...TRFACE.hold, lookX: 0.6 * Math.sin(lt * 2.4), lookY: -0.2 };
  face = lerpFace(face, { ...TRFACE.up, lookX: 0.3 }, ramp(t, c.butter - 0.1, c.butter + 0.2));
  face = lerpFace(face, { ...TRFACE.huh, lookX: 0.95, lookY: 0.15 }, ramp(t, c.bsun - 0.1, c.bsun + 0.3));
  face.blink = Math.max(face.blink, pulseOf(t, [c.backwards + 0.3, c.blame + 0.2], 0.12));
  trHero(cam, t, { suit: true, face, cheeks: 1, hold: [132, -322], holdRot: -0.3, ambient: 0.28 * e, headRot: 0.04 * ramp(t, c.bsun, c.bsun + 0.3) });
  marsDust(cam, t, e, 0.35 + 0.65 * ramp(t, c.blame - 0.2, c.blame + 0.3));
  screenSpace();
  const flip = ramp(t, c.bsun - 0.02, c.bsun + 0.12);
  pill(540, 520, flip < 0.5 ? 'MARS, NOON' : 'MARS, SUNSET', flip < 0.5 ? '#FFB870' : '#8FC2FF', ramp(lt, 0.12, 0.3) * (0.82 + 0.18 * Math.abs(2 * flip - 1)), 42);
  const S = toScreen(cam, MARS.sunSet[0], MARS.sunSet[1]);
  tagPill('FINE DUST', 330, 880, ramp(t, c.blame - 0.06, c.blame + 0.1), '#FFC98A', [S[0] - 190, S[1] - 150], 40);
  return { glow: 0.85, capY: 1470, flash: 0.45 * (1 - ramp(lt, 0, 0.14)) };
};

// ================================================================ the button: he can swallow now (and the bottle goes back up: frame 1)
function buttonA(t) {
  const c = cu();
  const sw = ramp(t, c.gulp, c.gulp + 0.13), dip = pulseOf(t, [c.gulp - 0.02], 0.22), ahh = ramp(t, c.ahh - 0.05, c.ahh + 0.12);
  let face = { ...TRFACE.up, lookX: 0.2 + 0.25 * Math.sin(t * 1.9) };
  face = lerpFace(face, TRFACE.us, ramp(t, c.you2 - 0.12, c.you2 + 0.08));
  face = lerpFace(face, { ...TRFACE.us, blink: 1, browY: 1.5, browTilt: 0.2 }, ramp(t, c.gulp - 0.06, c.gulp + 0.02));
  face = lerpFace(face, TRFACE.ahh, ahh);
  face.blink = Math.max(face.blink, pulseOf(t, [c.you2 + 0.5], 0.12));
  return { face, drink: 0, gulp: 0, cheeks: 1 - sw, level: 0.62, slosh: 0, headRot: 0.02 * Math.sin(t * 1.7) - 0.05 * ahh, headDY: 9 * dip - 4 * ahh, headDX: 0, flinch: 0, bob: 4 * dip, fizz: 0,
    hold: BTN_HOLD, holdRot: BTN_ROT };
}
function mixA(a, b, k) {
  const o = {};
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[key], y = b[key];
    o[key] = key === 'face' ? lerpFace(x, y, k) : Array.isArray(x) ? x.map((v, i) => lerp(v, y[i], k)) : typeof x === 'number' ? lerp(x, y === undefined ? x : y, k) : (k < 0.5 ? x : y);
  }
  return o;
}
SC.button = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, tt = t - TLd.duration;
  const cam = tt >= -0.62 ? gulpCam(tt) : camKeys(lt, [[0, 508, 1244, 1.9], [D - 0.62, 522, 1228, 2.02]]);
  const A = mixA(buttonA(t), gulpA(tt), ramp(tt, -0.6, -0.46, E.inOutCubic));
  trailDraw(t, { cam, A, blue: 1, clouds: 1, sun: { rays: 0.3 } });
  screenSpace();
  const d = t - c.gulp;
  if (d >= 0 && d < 0.55) bigWord('GULP', 208, 850 - 30 * d, 96, '#BFF0FF', E.outBack(clamp(d / 0.12), 2.2) * (1 - ramp(d, 0.4, 0.55)), -0.12);
  return { glow: 0.8, capY: 1440, flash: 0.5 * (1 - ramp(lt, 0, 0.14)) };
};
const BUTTON_LIGHT = (lt, t) => ({ ...DAY_LIGHT, dof: 0.9 });

// ================================================================ the cover (rendered by src/cover.sh from a one-shot timeline)
SC.cover = (lt, t) => {
  const cam = { x: 520, y: 1290, zoom: 2.5, rot: 0 };
  const A = { face: { ...TRFACE.huh, lookX: 0.5, lookY: -1 }, cheeks: 1, drinkE: 0.74, hold: [132, -322], holdRot: -0.3, headRot: -0.06, level: 0.62, flinch: 0.4 };
  trailDraw(0.4, { cam, A, blue: 1, clouds: 0, sun: false,
    sky: () => {      // half the sky as it would be without air
      trClouds(cam, 0.4, { k: 1 });
      applyCam(cam);
      ctx.save(); ctx.beginPath(); ctx.moveTo(452, 500); ctx.lineTo(1500, 500); ctx.lineTo(1500, 1900); ctx.lineTo(640, 1900); ctx.closePath(); ctx.clip();
      ctx.fillStyle = trGrad(ctx, SKY_SPACE); ctx.fillRect(-2000, -2000, 6000, 6000);
      for (const s of TR_STARS) circle(ctx, s.x * 0.5 + 420, s.y * 0.5 + 760, s.r * 0.9, rgba('#DCE6FF', s.a));
      ctx.restore();
      line(ctx, 452, 500, 640, 1900, 6, 'rgba(255,255,255,0.92)');
    } });
  screenSpace();
  bigWord('WHY IS THE SKY', 540, 1196, 138, '#FFFFFF', 1, -0.03);
  bigWord('BLUE?', 540, 1380, 236, '#58B4FF', 1, -0.03);
  return { glow: 0.8, noCaptions: true };
};

setLights({ hook: HOOK_LIGHT, colours: AIR_LIGHT, blue: AIR_LIGHT, sky: (lt, t) => mixLight(BARE_LIGHT, DAY_LIGHT, skyBlue(t)), moon: BARE_LIGHT, long: LIGHTS.diagram,
  dusk: { ...LIGHTS.sunset, pool: 0.3 }, mars: (lt, t) => mixLight(MARS_DAYL, MARS_EVEL, marsE(t)), button: BUTTON_LIGHT, cover: { ...DAY_LIGHT, dof: 0.8 } });

function initScenes2() {
  initTrail();
  initWorlds();
  // where the nozzle meets the helmet's glass, on its way to a mouth it will not reach
  let lo = 0, hi = 1;
  for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2, p = trRimAt(m, MOON_HOLD, MOON_ROT); if (Math.hypot(p[0], p[1] + 478) > 108) lo = m; else hi = m; }
  MOON_TOUCH = lo;
}
