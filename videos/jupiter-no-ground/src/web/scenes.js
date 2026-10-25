// If You Fell Into JUPITER, You'd Never Hit the Ground 🪐: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt =
// seconds inside the shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
// THE CURIOUS KIND (story.md §6): the hero goes there. He skydives into Jupiter in a blue spacesuit, filming a selfie,
// and never lands: through three decks of cloud, into gas as thick as soup, then syrup, then a hot dark ocean.
'use strict';

const cu = () => TLd.cues;
const bumpAt = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);
const vL2 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
const lerpLog = (a, b, k) => Math.exp(lerp(Math.log(a), Math.log(b), k));

// ---------------------------------------------------------------- the light of each place
// space: the Sun upper right is the key; Jupiter's lit clouds below give a warm rim from underneath
const SPACE_LIGHT = { key: [0.4, -0.56, 0.73], keyTint: [1.08, 1.04, 0.96], shadowTint: [0.62, 0.64, 0.92], shadowDeep: 1.3, cast: 0.4, toonAt: 0.3, form: 0.3,
  rimFrom: [-0.2, 1.0], rim: [1.0, 0.74, 0.46], rimAmt: 1.15, pool: 0.0, halo: 0.08, haloColor: [1.0, 0.8, 0.55], dof: 0.6 };
// over the cloud tops: sunlight from high up, the white deck bouncing light from below
const TOPS_LIGHT = { ...LIGHTS.day, key: [0.4, -0.72, 0.56], keyTint: [1.06, 1.03, 0.98], shadowTint: [0.74, 0.76, 0.96], rimFrom: [0.0, 1.0], rim: [1.0, 0.95, 0.85],
  rimAmt: 0.9, pool: 0.15, poolTint: [0.8, 0.76, 0.7], halo: 0.06 };
// between the decks: a soft light from above, warmer and dimmer the deeper he goes (k 0..1)
function gasLight(k) {
  return { ...LIGHTS.day, key: [0.3, -0.8, 0.52], keyTint: [lerp(1.04, 1.1, k), lerp(1.0, 0.92, k), lerp(0.96, 0.78, k)], shadowTint: [lerp(0.76, 0.86, k), lerp(0.76, 0.66, k), lerp(0.92, 0.62, k)],
    rimFrom: [0.6, -0.8], rim: [1.0, lerp(0.92, 0.7, k), lerp(0.8, 0.45, k)], rimAmt: 0.9, pool: lerp(0.2, 0.45, k), poolTint: [0.6, 0.48, 0.4], halo: 0.08, haloColor: [1.0, 0.8, 0.55] };
}

// ================================================================ the hook: the selfie, the whole planet, the dive
// keyframes of the space view: the hero's scale and feet (screen), the planet's radius and centre (screen), the Sun
const SPK = {
  tight: { hs: 2.2, hx: 600, hy: 1880, R: 1750, px: 560, py: 1900, sun: [1015, 120, 22] },
  wide: { hs: 0.056, hx: 556, hy: 812, R: 640, px: 540, py: 1250, sun: [930, 470, 13] },
};
function hookTimes() {
  const c = cu();
  return { zo0: c.jupiter + 0.08, zo1: c.jupiter_end + 0.06, di0: c.youd + 0.16, di1: c.hit + 0.08, sw: c.hit + 0.1 };
}
// the hero over the space view at tt (valid at negative tt: the end of the Short lands on frame 1)
function spaceState(tt) {
  const T = hookTimes(), A = SPK.tight, B = SPK.wide;
  let u = 0;                                                // 0 = tight, 1 = the whole planet
  if (tt > T.zo0) u = E.inOutCubic(inv(T.zo0, T.zo1, tt));
  let dive = tt > T.di0 ? E.inCubic(inv(T.di0, T.di1, tt)) : 0;
  const S = {
    hs: lerpLog(A.hs, B.hs, u), hx: lerp(A.hx, B.hx, u), hy: lerp(A.hy, B.hy, u),
    R: lerpLog(A.R, B.R, u), px: lerp(A.px, B.px, u), py: lerp(A.py, B.py, u),
    sun: [lerp(A.sun[0], B.sun[0], u), lerp(A.sun[1], B.sun[1], u), lerp(A.sun[2], B.sun[2], u)], u, dive,
  };
  if (dive > 0) {                                           // the dive: everything grows about the point below his feet
    const g = Math.exp(4.6 * dive), Fx = S.hx, Fy = S.hy + 12;
    const tx = 540, ty = lerp(Fy, 1240, dive);            // and it drifts toward the frame's middle
    S.hs *= g; S.R *= g;
    S.hx = tx + (S.hx - Fx) * g; S.hy = ty + (S.hy - Fy) * g;
    S.px = tx + (S.px - Fx) * g; S.py = ty + (S.py - Fy) * g;
  }
  return S;
}
function hookA(tt) {
  const c = cu(), T = hookTimes(), D = TLd.duration;
  const r = (a, b, e) => ramp(tt, a, b, e);
  const A = { scarf: 0.75, face: JF.grin, pose: JP_POSE.dive };
  // the selfie: the phone up at the top left on its stick, a thumbs-up on the right
  const self = tt < 0 ? r(c.nod - D, c.nod - D + 0.25) : 1 - r(T.zo0 - 0.1, T.zo0 + 0.25);
  A.stick = self > 0.02 ? vL2([-150, -520], [-172, -582], self) : null;
  A.armL = vL2([-190, -560], [-150, -520], self);
  A.armR = self > 0.02 ? vL2([200, -560], [150, -560], self) : null;
  A.handR = self > 0.5 ? 'thumb' : 'spread';
  A.handL = 'open';
  A.headRot = -0.1 * self;
  A.face = self > 0.5 ? JF.grin : JF.whee;
  A.shake = 1;
  if (tt >= T.di0) { A.face = lerpFace(JF.whee, JF.ready, r(T.di1 - 0.1, T.di1 + 0.2)); }
  return A;
}
function hookSpace(tt, t) {
  const S = spaceState(tt), A = hookA(tt), c = cu(), T = hookTimes();
  // the background: space, the Sun, the planet (out of focus when we are close to him)
  const soft = clamp(1 - S.u * 3) * (1 - S.dive) * 0.7;
  jpSpaceBg(t, { sun: S.sun, dx: 40 * S.u, dy: -60 * S.u + 30 * tt });
  jpPlanet(S.px, S.py, S.R, { soft });
  // the hero, at his scale; a camera made from his feet
  const sh = shake(t, 5 * clamp(1 - S.u * 4) * (S.hs > 1 ? 1 : 0), 16, 3);
  const cam = { x: 0, y: 0, zoom: S.hs, rot: 0, sx: S.hx - W / 2 + sh[0], sy: S.hy - H / 2 + sh[1] };
  const Hh = jpHero(cam, t, Object.assign({ x: 0, y: 0, s: 1 }, A));
  // YOU, on the whole planet
  const yk = popK(tt, T.zo1 - 0.12, T.di0 + 0.2);
  if (yk > 0.01) {
    const hp = [S.hx, S.hy - 300 * S.hs];
    screenSpace();
    thinLeader([hp[0] + 70, hp[1] - 150], [hp[0] + 10, hp[1] - 24], yk, '#FFFFFF');
    jpPill('YOU', hp[0] + 110, hp[1] - 196, yk, '#FFD447', 56, -0.05);
  }
  return { S, Hh, cam };
}
// the deck world around him at a camera altitude (he stands on screen at FEET with scale HS, at Z = 6)
const FEET = [540, 1320], HS = 1.1, ZH = 6;
function deckCam(yFeet, yH = JP_YH) { return { x: 0, y: yFeet + (FEET[1] - yH) * ZH / JPF, yH }; }
function deckHero(cam, t, A, o = {}) {
  const sh = A.shake ? shake(t, 3, 14, 7) : [0, 0];
  const hc = { x: 0, y: 0, zoom: HS * (o.k || 1), rot: 0, sx: FEET[0] - W / 2 + (A.dx || 0) + sh[0], sy: FEET[1] - H / 2 + (A.dy || 0) + sh[1] };
  return jpHero(hc, t, Object.assign({ x: 0, y: 0, s: 1 }, A));
}
// the cloud whoosh between the space view and the deck world (k 0..1..0)
function cloudWhoosh(t, k, seed = 5) {
  if (k <= 0.01) return;
  screenSpace();
  ctx.fillStyle = rgba('#F7F0E2', 0.9 * clamp(k * 1.4 - 0.2)); ctx.fillRect(0, 0, W, H);
  const rng = mulberry32(seed), spr = DECK_SPR[0].top;
  for (let i = 0; i < 30; i++) {
    const x = rng() * W, sp = 2600 + 1800 * rng(), r = 180 + 320 * rng();
    const y = H + 400 - ((t * sp + rng() * 2400) % (H + 900));
    ctx.save(); ctx.globalAlpha = clamp(k * 1.3); ctx.drawImage(spr[i % 4][0], x - r, y - r * 0.7, 2 * r, 1.4 * r); ctx.restore();
  }
}
// his altitude (feet) and the camera's tilt over the deck world, from the end of the space view to below the last deck
function fallY(t) {
  const c = cu(), T = hookTimes();
  const keys = [[T.sw, 10.5], [c.ground_end, 1.7], [c.no - 0.07, 0.38], [c.poof1, -4.3], [c.poof1 + 0.38, -6.5], [c.poof2 - 0.4, -14.6],
    [c.poof2, -19.3], [c.poof2 + 0.38, -21.7], [c.poof3 - 0.4, -29.6], [c.poof3, -34.3], [c.poof3 + 0.4, -36.9]];
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) { const a = keys[i - 1], b = keys[i]; return lerp(a[1], b[1], (t - a[0]) / (b[0] - a[0])); }
  }
  const last = keys[keys.length - 1];                       // on down, slowing: the thick shot takes it from here
  return last[1] - 6 * (1 - Math.exp(-(t - last[0]) * 0.5)) - 1.2 * (t - last[0]);
}
function fallTilt(t) {                                    // look up (the hole in the deck above) after each POOF, down before the next
  const c = cu();
  let y = JP_YH;
  for (const p of [c.poof1, c.poof2, c.poof3]) y += 330 * ramp(t, p + 0.08, p + 0.3, E.outCubic) * (1 - ramp(t, p + 0.5, p + 0.8, E.inOutCubic));
  return y;
}
SC.hook = (lt, t) => {
  const T = hookTimes();
  if (t < T.sw + 0.04) {
    hookSpace(t, t);
    cloudWhoosh(t, ramp(t, T.sw - 0.3, T.sw));
    return { glow: 0.9, zblur: 0.18 * Math.sin(Math.PI * inv(T.zo0, T.zo1, t)) + 0.22 * ramp(t, T.di0, T.di1, E.inCubic), zcx: 540, zcy: 900 };
  }
  const cam = deckCam(fallY(t), fallTilt(t));
  const A = hookA(t);
  A.pose = lerpPose(JP_POSE.dive, JP_POSE.land, ramp(t, cu().ground - 0.25, cu().ground + 0.15));
  A.armL = null; A.armR = null; A.stick = null; A.handR = 'open';
  A.scarf = 0.9;
  jpDeckWorld(cam, t, { mid: () => deckHero(cam, t, A) });
  jpSpeedLines(t, 0.9 - 0.5 * ramp(t, cu().ground - 0.3, cu().ground_end), 3, '#FFFFFF', [540, 220]);
  cloudWhoosh(t, 1 - ramp(t, T.sw, T.sw + 0.3));
  return { glow: 0.85 };
};
setLights({ hook: (lt, t) => (t < hookTimes().sw ? SPACE_LIGHT : TOPS_LIGHT) });

// ================================================================ the answer: POOF, POOF, POOF
function answerA(t) {
  const c = cu();
  const r = (a, b, e) => ramp(t, a, b, e);
  const A = { scarf: 0.9, pose: JP_POSE.land, face: JF.ready, handR: 'open', handL: 'open' };
  // deck 0: he lands... and sinks (no floor): the arms fly up, the face drops
  const sink1 = r(c.no - 0.05, c.no + 0.15);
  A.face = lerpFace(JF.ready, JF.huh, sink1);
  A.face = lerpFace(A.face, JF.oh, r(c.floor - 0.1, c.floor + 0.1));
  A.pose = lerpPose(JP_POSE.land, JP_POSE.dive, r(c.floor - 0.15, c.floor + 0.2));
  // between 0 and 1: falling; "Just": he gets ready to land again (hopeful)
  const try2 = r(c.just - 0.1, c.just + 0.25) * (1 - r(c.sky1_end - 0.12, c.sky1_end + 0.1));
  A.pose = lerpPose(A.pose, JP_POSE.land, try2);
  A.face = lerpFace(A.face, JF.ready, try2);
  A.face = lerpFace(A.face, JF.oh, r(c.sky1_end - 0.12, c.sky1_end + 0.05) * (1 - r(c.and - 0.1, c.and + 0.1)));
  // "and more sky.": he does not even try: arms crossed, unimpressed, through the third
  const fold = r(c.and - 0.12, c.and + 0.2);
  if (fold > 0.01) {
    A.pose = lerpPose(A.pose, JP_POSE.float, fold);
    A.armL = vL2([-160, -300], [46, -330], fold); A.armR = vL2([160, -300], [-46, -318], fold);
  }
  A.face = lerpFace(A.face, JF.meh, fold);
  return A;
}
// the burst of cloud when his head goes under a deck's top (screen space, at the deck's front edge)
function poofBurst(x, y, d, s = 1, seed = 1) {
  if (d <= 0 || d > 0.7) return;
  screenSpace();
  const rng = mulberry32(seed), spr = DECK_SPR[0].top;
  for (let i = 0; i < 12; i++) {
    const a = -Math.PI * (0.08 + 0.84 * rng()), v = (380 + 420 * rng()) * s, r = (50 + 60 * rng()) * s * (1 + 1.6 * d);
    const px = x + Math.cos(a) * v * d * (1 - 0.6 * d), py = y + Math.sin(a) * v * d * 0.55 * (1 - 0.6 * d);
    ctx.save(); ctx.globalAlpha = clamp(1.3 - d * 1.9); ctx.drawImage(spr[i % 4][0], px - r, py - r * 0.75, 2 * r, 1.5 * r); ctx.restore();
  }
}
SC.answer = (lt, t) => {
  const c = cu(), cam = deckCam(fallY(t), fallTilt(t)), A = answerA(t);
  const holes = [];
  if (t > c.poof1) holes.push({ di: 0, side: 'bot', X: 0, Z: ZH + 0.2, k: ramp(t, c.poof1, c.poof1 + 0.2) });
  if (t > c.poof2) holes.push({ di: 1, side: 'bot', X: 0, Z: ZH + 0.2, k: ramp(t, c.poof2, c.poof2 + 0.2) });
  if (t > c.poof3) holes.push({ di: 2, side: 'bot', X: 0, Z: ZH + 0.2, k: ramp(t, c.poof3, c.poof3 + 0.2) });
  jpDeckWorld(cam, t, { holes, mid: () => deckHero(cam, t, A) });
  // POOF: where his head went under each deck's top
  for (const [p, di, sd] of [[c.poof1, 0, 1], [c.poof2, 1, 2], [c.poof3, 2, 3]]) {
    const y = cam.yH + (cam.y - DECKS[di].top) * JPF / JP_CUT;
    poofBurst(540, y, t - p, 1, sd);
  }
  // the speed of the fall, between the decks
  const fast = clamp(Math.abs(fallY(t + 0.05) - fallY(t - 0.05)) / 1.0);
  jpSpeedLines(t, fast, 4, '#FFFFFF', [540, 200]);
  return { glow: 0.85 };
};
setLights({ answer: (lt, t) => gasLight(clamp((cu().poof1 < t ? 0.3 : 0) + 0.25 * inv(cu().poof1, cu().poof3 + 0.3, t))) });

// ================================================================ the medium: things in it, round him in 3D
// rise = how far the medium has moved up past him (his sinking), m = the stage (0 gas, 1 soup, 2 syrup, 3 ocean).
// front: false = the things behind him (Z > 6), true = those in front.
function medBits(t, m, rise, front, o = {}) {
  screenSpace();
  const M = jpMedAt(m), zFog = o.zFog || lerp(40, 14, clamp(m / 3));
  const aGas = clamp(1 - m * 2.2), aSoup = clamp(1 - Math.abs(m - 1) * 2.4), aSyr = clamp(1 - Math.abs(m - 2) * 2.4), aOce = clamp((m - 2.35) * 2.2);
  for (let i = 0; i < MED_BITS.length; i++) {
    const b = MED_BITS[i], sc = ZH / b.Z;
    if ((sc > 1) !== front) continue;
    if (b.Z > zFog * 1.3) continue;
    const fogA = clamp(1.25 - b.Z / zFog);
    const span = 2600, x = 540 + b.X * 760 * Math.min(1.4, 0.55 + 0.45 * sc) + 30 * Math.sin(t * 0.7 * b.sp + b.ph);
    const y = ((b.Y * span - rise * 900 * sc * b.sp) % span + span) % span - (span - H) / 2;
    if (o.avoid && Math.hypot(x - o.avoid[0], y - o.avoid[1]) < o.avoid[2] * sc) continue;
    const rot = b.ph + t * 0.6 * (b.sp - 1);
    ctx.save(); ctx.globalAlpha = fogA;
    if (aGas > 0.01) { softDot(ctx, x, y, (6 + 10 * b.r) * sc, '#F2DCC0', 0.5 * aGas); }
    if (aSoup > 0.01) {
      ctx.globalAlpha = fogA * aSoup;
      const s2 = sc * (0.55 + 0.45 * b.s);
      if (b.k < 2) jpNoodle(ctx, x, y, s2 * 0.8, rot, t, b.ph); else if (b.k === 2) jpCarrot(ctx, x, y, s2, rot); else if (b.k === 3) jpPea(ctx, x, y, s2);
      else if (b.k === 4) jpLetter(ctx, x, y, s2, rot * 0.3, 'JUPITER'[i % 7]); else jpBubble(ctx, x, y, 16 * s2, 0.8);
    }
    if (aSyr > 0.01) {
      ctx.globalAlpha = fogA * aSyr;
      if (b.k % 2 === 0) jpBubble(ctx, x, y, (14 + 26 * b.r) * sc, 0.9);
      else { const g = ctx.createRadialGradient(x, y, 0, x, y, 30 * sc); g.addColorStop(0, 'rgba(255,214,120,0.45)'); g.addColorStop(1, 'rgba(255,214,120,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 30 * sc, 0, 7); ctx.fill(); }
    }
    if (aOce > 0.01) {
      ctx.globalAlpha = fogA * aOce;
      if (b.k < 4) { const r = (3 + 5 * b.r) * sc, tw = 0.6 + 0.4 * Math.sin(t * 7 + b.ph * 5); both((c, g) => softDot(c, x, y, r * (g ? 4 : 2.2), '#FF8A3A', (g ? 0.9 : 0.7) * tw * fogA * aOce)); }
      else jpBubble(ctx, x, y, (8 + 14 * b.r) * sc, 0.6);
    }
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}
// the fog of the medium between the far things and him
function medFog(m, a) { screenSpace(); ctx.fillStyle = rgba(jpMedAt(m).fog, a); ctx.fillRect(0, 0, W, H); }

// ================================================================ thicker: the gas closes in, his fall slows
function thickM(t) { const c = cu(); return 0.55 * ramp(t, c.thicker - 0.3, c.gets_end + 0.1, E.inOutSine); }
function gaugeU(t) {
  const c = cu();
  return 0.06 * ramp(t, c.thicker, c.gets_end) + (1 / 3 - 0.06) * ramp(t, c.like, c.soup + 0.1, E.inOutCubic)
    + (1 / 3) * ramp(t, c.then1, c.syrup + 0.15, E.inOutCubic) + (1 / 3) * ramp(t, c.then2, c.ocean + 0.1, E.inOutCubic);
}
const GAUGE_AT = [206, 560];
function heroShift(t) { const c = cu(); return 150 * ramp(t, c.thicker - 0.2, c.thicker + 0.4, E.inOutCubic); }
function lightningAt(t, times, dur = 0.16) {         // a flash: two quick pulses after each time
  let k = 0;
  for (const f of times) { const d = t - f; if (d >= 0 && d < dur * 2.2) k = Math.max(k, Math.exp(-d * 18) + 0.6 * Math.exp(-Math.max(0, d - dur) * 22) * (d > dur ? 1 : 0)); }
  return clamp(k);
}
function thickFlashes() { const c = cu(); return [c.the + 0.1, c.thicker + 0.35, c.gets + 0.2]; }
SC.thick = (lt, t, shot) => {
  const c = cu(), cam = deckCam(fallY(t), JP_YH), m = thickM(t), fl = lightningAt(t, thickFlashes());
  const A = { scarf: lerp(0.9, 0.35, ramp(t, c.thicker, c.gets_end)), pose: lerpPose(JP_POSE.dive, JP_POSE.float, ramp(t, c.fall, c.gets, E.inOutSine)),
    face: lerpFace(JF.look, JF.huh, ramp(t, c.thicker, c.thicker + 0.2)), handL: 'open', handR: 'open', dx: heroShift(t),
    headRot: 0.08 * Math.sin(t * 2.2) * (1 - ramp(t, c.thicker, c.thicker + 0.3)) };
  A.face = lerpFace(A.face, JF.slow, ramp(t, c.gets, c.gets_end));
  const holes = [{ di: 2, side: 'bot', X: 0, Z: ZH + 0.2, k: 1 }];
  jpDeckWorld(cam, t, { holes, fogZ: lerp(34, 12, m * 1.8), mid: () => {
    if (fl > 0.01) { screenSpace(); jpFlash(300, cam.yH - 300, 380, 0.6 * fl, 7); jpFlash(820, cam.yH - 200, 280, 0.4 * fl, 3); }
    medFog(m, 0.9 * clamp(m * 1.9));
    medBits(t, m, (t - c.the) * 0.6, false, { zFog: lerp(40, 20, m) });
    deckHero(cam, t, A);
  } });
  medBits(t, m, (t - c.the) * 0.6, true, { zFog: lerp(40, 20, m), avoid: [540 + A.dx, 960, 260] });
  jpSpeedLines(t, clamp(1 - ramp(t, c.the, c.gets)) * 0.8, 6, '#FFFFFF', [540 + A.dx, 230]);
  jpGauge(GAUGE_AT[0], GAUGE_AT[1], ramp(t, c.thicker - 0.08, c.thicker + 0.25), gaugeU(t), t);
  return { glow: 0.85, flash: 0.12 * fl };
};
setLights({ thick: (lt, t) => { const g = gasLight(0.6 + 0.4 * thickM(t)), fl = lightningAt(t, thickFlashes()); return { ...g, keyTint: [g.keyTint[0] + 0.3 * fl, g.keyTint[1] + 0.3 * fl, g.keyTint[2] + 0.45 * fl] }; } });

// ================================================================ soup, syrup, a hot dark ocean... still no splash
function ladderM(t) {
  const c = cu();
  return 0.55 + 0.45 * ramp(t, c.like - 0.1, c.soup + 0.1, E.inOutSine) + ramp(t, c.then1 - 0.05, c.syrup + 0.1, E.inOutSine) + ramp(t, c.then2, c.ocean + 0.15, E.inOutSine);
}
// his swim: brisk in soup, slow-motion in syrup, still in the ocean (a phase that keeps going smoothly)
function swimPh(t) {
  const c = cu(), a = c.like - 0.2, b = c.syrup, e = c.ocean_end;
  const r1 = 5.2, r2 = 1.0;
  if (t <= b) return r1 * (t - a);
  if (t <= e) return r1 * (b - a) + r2 * (t - b);
  return r1 * (b - a) + r2 * (e - b);
}
function ladderA(t) {
  const c = cu();
  const r = (a, b, e) => ramp(t, a, b, e);
  const brace = r(c.ocean_end - 0.02, c.ocean_end + 0.28, E.outBack);
  const swimK = clamp(r(c.like - 0.2, c.like + 0.2)) * (1 - r(c.ocean - 0.2, c.ocean_end));
  let pose = lerpPose(JP_POSE.float, jpSwim(swimPh(t), 1), swimK);
  pose = lerpPose(pose, JP_POSE.brace, brace);
  const A = { pose, scarf: 0.12, handL: 'open', handR: 'open', dx: 150 };
  // faces: slurp... the noodle, the pancakes, the heat, then braced, eyes shut... nothing. One eye opens.
  let face = JF.slow;
  face = lerpFace(face, JF.yuck, r(c.soup_end - 0.05, c.soup_end + 0.15) * (1 - r(c.then1 + 0.1, c.syrup)));
  face = lerpFace(face, Object.assign({}, JF.slow, { lookX: -0.9, lookY: 0.2, mouth: 'o', mouthOpen: 0.7 }), r(c.syrup, c.syrup + 0.4) * (1 - r(c.then2 - 0.2, c.then2 + 0.1)));
  face = lerpFace(face, JF.hot, r(c.hot - 0.1, c.hot + 0.2));
  face = lerpFace(face, JF.squint, brace);
  face = lerpFace(face, JF.peek, r(c.splash_end + 0.18, c.splash_end + 0.3));
  A.face = face;
  A.noodle = r(c.soup_end - 0.12, c.soup_end + 0.12, E.outBack) * (1 - r(c.syrup + 0.5, c.syrup + 0.75));
  A.noodleSlide = r(c.syrup - 0.1, c.syrup + 0.75, E.inCubic);
  A.heat = r(c.then2, c.ocean + 0.2);
  A.sweat = r(c.hot, c.dark + 0.2);
  A.pinch = brace;
  if (brace > 0.01) { A.armR = vL2([150, -330], [70, -392], brace); A.armL = vL2([-150, -330], [-120, -640], brace); }
  A.headDY = 6 * Math.sin(t * 2.4) * (1 - brace);
  return A;
}
SC.ladder = (lt, t, shot) => {
  const c = cu(), m = ladderM(t), rise = (t - c.the) * 0.6 + 0.4 * Math.max(0, t - c.like) - 0.3 * Math.max(0, t - c.syrup);
  const A = ladderA(t);
  jpMedBg(m, t);
  medFog(m, 0.0);
  medBits(t, m, rise, false);
  // the pancakes: a stack drifting past in front of him, slowly turning (syrup)
  const pk = ramp(t, c.then1 - 0.2, c.dark, E.linear);
  if (pk > 0 && pk < 1) jpPancakes(ctx, lerp(-180, 1240, pk) * 0 + lerp(-160, 1180, pk), 760 + 40 * Math.sin(pk * 3), 1.05, -0.25 + 0.4 * pk);
  const Hh = deckHero(deckCam(0), t, A);
  medBits(t, m, rise, true, { avoid: [690, 1000, 320] });
  // still no splash: a tiny bubble from under him... plip
  const pb = t - (c.splash_end + 0.06);
  if (pb > 0 && pb < 0.6) { const yb = 1220 - 420 * pb; jpBubble(ctx, 652 + 10 * Math.sin(pb * 20), yb, 14 * (1 - 0.3 * pb), clamp(1.2 - pb * 1.6)); }
  jpGauge(GAUGE_AT[0], GAUGE_AT[1], 1 - ramp(t, c.ocean_end + 0.2, c.ocean_end + 0.45), gaugeU(t), t);
  const brace = ramp(t, c.ocean_end - 0.02, c.ocean_end + 0.3);
  return { glow: 0.85 + 0.15 * clamp(m - 2), push: { k: 1 + 0.16 * brace, cx: 690, cy: 820 } };
};
setLights({ ladder: (lt, t) => {
  const m = ladderM(t), oc = clamp(m - 2.2);
  const base = gasLight(0.8);
  return { ...base, key: [0.3, -0.8, 0.52], keyTint: [lerp(1.1, 0.9, oc), lerp(0.94, 0.66, oc), lerp(0.8, 0.56, oc)], rimFrom: [lerp(0.6, 0.0, oc), lerp(-0.8, 1.0, oc)],
    rim: [1.0, lerp(0.72, 0.42, oc), lerp(0.42, 0.18, oc)], rimAmt: 1.0 + 0.8 * oc, pool: lerp(0.35, 0.6, oc), poolTint: [lerp(0.6, 0.5, oc), lerp(0.42, 0.18, oc), lerp(0.3, 0.12, oc)],
    halo: 0.1 + 0.15 * oc, haloColor: [1.0, 0.5, 0.25] };
} });

// ================================================================ the probe: NASA dropped one in; 58 minutes; CRUNCH
const PROBE_X = 286;
function probeY(t) {
  const c = cu();
  return lerp(-300, 930, ramp(t, c.nasa - 0.1, c.probe + 0.1, E.outCubic)) + 40 * ramp(t, c.probe, c.crunch, E.linear);
}
SC.probe = (lt, t, shot) => {
  const c = cu(), cam = deckCam(-26.7 - 0.25 * (t - shot.start), JP_YH), r = (a, b, e) => ramp(t, a, b, e);
  const crush = r(c.crunch - 0.02, c.crunch + 0.12, E.outCubic);
  const A = { scarf: 0.25, pose: JP_POSE.float, handL: 'open', handR: 'open', dx: 190, face: JF.look };
  // he waves at it, watches the clock, winces
  const wave = r(c.actually - 0.15, c.actually + 0.1) * (1 - r(c.probe_end, c.probe_end + 0.3));
  if (wave > 0.01) { A.armL = vL2([-160, -300], [-150 + 30 * Math.sin(t * 16), -600], wave); A.handL = 'open'; }
  A.face = lerpFace(JF.look, JF.wave, wave);
  A.face = lerpFace(A.face, Object.assign({}, JF.look, { lookX: -0.9, lookY: -0.1 }), r(c.probe_end, c.probe_end + 0.2));
  A.face = lerpFace(A.face, Object.assign({}, FACES.nervous, { lookX: -0.9, lookY: 0.1, mouth: 'grimace', mouthOpen: 0.5 }), r(c.minutes, c.minutes_end));
  A.face = lerpFace(A.face, JF.wince, r(c.crunch - 0.02, c.crunch + 0.08));
  A.headDX = -6 * r(c.crunch, c.crunch + 0.1);
  const py = probeY(t), sway = 0.05 * Math.sin(t * 1.8) * (1 - crush) + 0.12 * crush * Math.sin((t - c.crunch) * 9) * Math.exp(-(t - c.crunch) * 3) * (t > c.crunch ? 1 : 0);
  const squeeze = r(c.lasted, c.minutes_end + 0.3);
  const shk = squeeze > 0 ? shake(t, 4 * squeeze * (1 - crush), 30, 9) : [0, 0];
  jpDeckWorld(cam, t, { fogZ: 30, mid: () => {
    screenSpace();
    jpProbe(ctx, PROBE_X + shk[0], py + shk[1], 0.9, t, { crush, chute: 1, sway });
    deckHero(cam, t, A);
  } });
  // the squeeze: arrows pressing in on it, more and more
  if (squeeze > 0.01 && crush < 0.99) {
    screenSpace();
    for (const [dx, dy, a] of [[-150, 0, 0], [150, 0, Math.PI], [0, -125, Math.PI / 2], [0, 120, -Math.PI / 2]]) {
      const pul = 1 - 0.18 * Math.sin(t * 14), L = (36 + 26 * squeeze) * pul, x = PROBE_X + dx * (1 - 0.15 * squeeze), y = py + dy * (1 - 0.15 * squeeze);
      ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.globalAlpha = clamp(squeeze * 2) * (1 - crush);
      ctx.beginPath(); ctx.moveTo(-L, -14); ctx.lineTo(0, -14); ctx.lineTo(0, -30); ctx.lineTo(28, 0); ctx.lineTo(0, 30); ctx.lineTo(0, 14); ctx.lineTo(-L, 14); ctx.closePath();
      ctx.fillStyle = '#FF5A6E'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#0B0B1A'; ctx.stroke();
      ctx.restore();
    }
  }
  jpPill('NASA PROBE', 300, 462, popK(t, c.dropped - 0.05, c.crunch + 0.35), '#8FB8FF', 50, -0.04, '1995');
  const mins = Math.round(58 * r(c.lasted, c.minutes_end - 0.05, E.linear));
  jpPill(`${mins} MIN`, PROBE_X, 1150, popK(t, c.lasted - 0.1, c.crunch + 0.4), '#FFD447', 60, 0.03);
  if (crush > 0.01) {
    jpBurst('CRUNCH!', 455, 690, 78, '#FF5A6E', popK(t, c.crunch, c.oh - 0.05), -0.1);
    screenSpace();
    const d = t - c.crunch, rng = mulberry32(31);
    for (let i = 0; i < 9; i++) { const a = rng() * 6.28, v = 300 + 300 * rng(); if (d < 0.8) { ctx.save(); ctx.globalAlpha = clamp(1 - d * 1.3); ctx.fillStyle = i % 2 ? '#E8B85A' : '#B8BCC6'; ctx.translate(PROBE_X + Math.cos(a) * v * d, py + Math.sin(a) * v * d + 300 * d * d); ctx.rotate(d * 8 + i); ctx.fillRect(-7, -5, 14, 10); ctx.restore(); } }
  }
  const pk = 1 + 0.07 * ramp(t, shot.start, c.crunch, E.inOutSine) + 0.05 * crush;
  return { glow: 0.85, push: { k: pk, cx: lerp(540, PROBE_X + 120, ramp(t, c.lasted, c.crunch)), cy: lerp(880, py, ramp(t, c.lasted, c.crunch)) } };
};
setLights({ probe: gasLight(0.55) });

// ================================================================ deeper: lightning far above, and maybe... diamonds
let GEMS = null;
function initGems() {
  const rng = mulberry32(808);
  GEMS = [];
  for (let i = 0; i < 46; i++) GEMS.push({ x: 60 + rng() * 960, Z: 2.6 + 24 * Math.pow(rng(), 1.2), t0: rng(), sp: 0.7 + 0.6 * rng(), rot: rng() * 6.28, spin: (rng() - 0.5) * 4, ph: rng() * 6.28, early: rng() < 0.18 });
  GEMS.sort((a, b) => b.Z - a.Z);
}
function deepFlashes() { const c = cu(); return [c.oh_end + 0.05, c.scientists + 0.1, c.rain_end - 0.05, c.diamonds + 0.15, c.want + 0.05]; }
// the gems falling past (screen space), front: those nearer than him; rate: how many have started
function drawGems(t, front, k, o = {}) {
  if (!GEMS) initGems();
  const c = cu();
  for (const g of GEMS) {
    const sc = ZH / g.Z;
    if ((sc > 1) !== front) continue;
    const start = g.early ? c.rain - 0.4 + g.t0 * 0.6 : c.diamonds - 0.15 + g.t0 * 0.9;
    const d = t - start;
    if (d < 0) continue;
    const y = -120 + d * 900 * sc * g.sp, x = g.x + 40 * Math.sin(d * 1.3 + g.ph);
    if (y > H + 100) continue;
    if (o.avoid && Math.abs(x - o.avoid[0]) < o.avoid[2] * 0.5 && Math.abs(y - o.avoid[1]) < o.avoid[2]) continue;
    const s = 38 * sc, a = clamp(1.3 - g.Z / 30) * k;
    screenSpace(); ctx.save(); ctx.globalAlpha = a;
    jpGem(ctx, x, y, s, g.rot + g.spin * d, 1);
    ctx.restore();
    jpGlint(x + s * 0.3, y - s * 0.2, s * (0.8 + 0.6 * Math.max(0, Math.sin(t * 9 + g.ph * 3))), a * Math.max(0, Math.sin(t * 6 + g.ph * 2)));
  }
}
function deepState(t) {
  const c = cu(), r = (a, b, e) => ramp(t, a, b, e);
  const A = { scarf: 0.2, pose: JP_POSE.float, handL: 'open', handR: 'open', dx: 0, face: JF.look };
  A.face = lerpFace(JF.look, JF.up, r(c.deeper2 - 0.1, c.deeper2 + 0.15));
  // "Some scientists think...": his eyes follow the first specks falling past, left, then right
  const track = r(c.some - 0.1, c.some + 0.2) * (1 - r(c.rain, c.rain + 0.2));
  A.face = lerpFace(A.face, Object.assign({}, JF.up, { lookX: Math.sin((t - c.some) * 2.2) * 0.9, lookY: -0.4 + 0.5 * clamp((t - c.some) / 1.6) }), track);
  A.face = lerpFace(A.face, JF.oh, r(c.rain, c.rain + 0.2));
  A.headRot = 0.08 * Math.sin((t - c.some) * 2.2) * track;
  A.rot = 0.05 * Math.sin(t * 0.9);
  A.dy = 18 * Math.sin(t * 1.3);
  A.face = lerpFace(A.face, JF.rich, r(c.diamonds + 0.1, c.diamonds + 0.3));
  A.sparkle = r(c.diamonds + 0.15, c.diamonds + 0.4, E.outBack);
  A.heat = 0.35;
  // TINK: a diamond bonks his helmet; he catches one in his right hand
  const bonk = bumpAt(t, c.tink, 10);
  A.headDY = 10 * bonk; A.headRot = (A.headRot || 0) + 0.08 * bonk;
  const catchK = r(c.tink + 0.05, c.tink + 0.35, E.outBack);
  A.armR = vL2([170, -300], [150, -520], catchK);
  A.gem = { side: 'R', k: catchK, rot: 0.15 * Math.sin(t * 2) };
  return A;
}
// deep down: dark above (the decks far overhead, lit from inside by lightning), the heat glowing from far below
function jpDeepBg(t, fl) {
  screenSpace();
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#140B18'); g.addColorStop(0.42, '#2C110C'); g.addColorStop(1, '#7E2408');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  both((c, gl) => {
    const rg = c.createRadialGradient(540, H + 520, 120, 540, H + 520, 1500);
    rg.addColorStop(0, rgba('#FF7A2A', gl ? 0.55 : 0.38)); rg.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = rg; c.fillRect(0, 0, W, H);
  });
  // the decks far overhead: a dim ceiling of cloud that lights up from inside with every flash
  const spr = DECK_SPR[2].bot;
  ctx.save();
  for (let i = 0; i < 9; i++) {
    const x = ((i * 157 + t * 14) % 1300) - 110, y = 150 + 70 * Math.sin(i * 1.7), r = 250 + 70 * (i % 3);
    ctx.globalAlpha = 0.3 + 0.6 * fl; ctx.drawImage(spr[i % 4][5], x - r, y - r * 0.42, 2 * r, 0.84 * r);
  }
  ctx.restore();
  const gl2 = ctx.createLinearGradient(0, 0, 0, 760);
  gl2.addColorStop(0, rgba('#6E7CA0', 0.22 + 0.6 * fl)); gl2.addColorStop(1, 'rgba(110,124,160,0)');
  ctx.fillStyle = gl2; ctx.fillRect(0, 0, W, 760);
}
// each flash far above sheds soot that falls and sparkles into tiny diamonds (the 2013 idea, shown, never said)
function sootSpecks(t) {
  const fs = deepFlashes();
  screenSpace();
  fs.forEach((f, fi) => {
    const d0 = t - f;
    if (d0 <= 0 || d0 > 4.2) return;
    const bx = fi % 2 ? 870 : 250, by = fi % 2 ? 300 : 380, rng = mulberry32(700 + fi * 17);
    for (let i = 0; i < 7; i++) {
      const d = d0 - 0.05 * i, r1 = rng(), r2 = rng(), r3 = rng();
      if (d <= 0) continue;
      const x = bx + (r1 - 0.5) * 140 + (r2 - 0.5) * 70 * d, y = by + (230 + 150 * r3) * d + 34 * d * d;
      if (y > H + 40) continue;
      const k = clamp((d - 0.45) / 0.8), sz = 5 + 7 * k + 3 * r2;
      if (k < 0.98) { ctx.save(); ctx.globalAlpha = 0.9 * (1 - k); softDot(ctx, x, y, sz * 2.6, '#1C1A22', 0.85); circle(ctx, x, y, sz * 0.8, '#26232C'); ctx.restore(); }
      if (k > 0.02) { ctx.save(); ctx.globalAlpha = k; jpGem(ctx, x, y, sz * 1.1, d * 3 + i, 1); ctx.restore(); jpGlint(x + 2, y - 2, sz * 2.2, k * (0.5 + 0.5 * Math.sin(t * 11 + i * 2))); }
    }
  });
}
function deepWorld(t, A, o = {}) {
  const c = cu(), fl = lightningAt(t, deepFlashes());
  jpDeepBg(t, fl);
  if (fl > 0.01) { jpFlash(250, 330, 420, fl, 11); jpFlash(870, 250, 320, 0.7 * fl, 5); }
  sootSpecks(t);
  medBits(t, 2.62, (t - c.oh) * 0.25, false);
  drawGems(t, false, 1);
  const Hh = deckHero(deckCam(0), t, A);
  drawGems(t, true, 1, { avoid: [540, 900, 280] });
  // the bonk itself: one diamond hits the top of the helmet and bounces off
  const d = t - (c.tink - 0.22);
  if (d > 0 && d < 1.0) {
    const hp = Hh.head, hx = FEET[0] + hp[0] * HS + (A.dx || 0), hy = FEET[1] + hp[1] * HS + (A.dy || 0);
    let x, y;
    if (d < 0.22) { x = hx + 6; y = hy - 380 + (d / 0.22) * (380 - 95 * HS); }
    else { const e = d - 0.22; x = hx + 6 + 420 * e; y = hy - 95 * HS - 300 * e + 900 * e * e; }
    jpGem(ctx, x, y, 30, d * 9, 1);
    jpGlint(x + 8, y - 6, 34, 0.9);
  }
  medBits(t, 2.62, (t - c.oh) * 0.25, true, { avoid: [540, 1000, 320] });
  return { Hh, fl };
}
SC.weird = (lt, t, shot) => {
  const c = cu(), A = deepState(t);
  // "Oh, and deeper down?": the camera sinks with him, fast at first
  const dive = ramp(t, shot.start, c.down_end, E.outCubic);
  const { fl } = deepWorld(t, A);
  jpPill('DIAMOND RAIN?', 470, 505, popK(t, c.diamonds - 0.05, c.still2 - 0.05, 0.1, 0.12), '#BFF0FF', 64, -0.04);
  stamp('MAYBE', 830, 615, ramp(t, c.diamonds + 0.45, c.diamonds + 0.6) * (t < c.still2 - 0.05 ? 1 : 0), '#FF5A6E', -0.2, 70);
  jpBurst('TINK!', 790, 840, 56, '#7FE9FF', popK(t, c.tink, c.tink + 0.45), 0.1);
  return { glow: 0.95, flash: 0.1 * fl, blur: [0, -50 * (1 - dive)], zblur: 0.08 * (1 - dive), push: { k: 1 + 0.12 * ramp(t, c.down_end, c.diamonds, E.inOutSine), cx: 540, cy: 840 } };
};
function deepLight(t) {
  const fl = lightningAt(t, deepFlashes());
  return { key: [0.1, -0.86, 0.5], keyTint: [0.92 + 0.4 * fl, 0.8 + 0.4 * fl, 0.84 + 0.55 * fl], shadowTint: [0.62, 0.5, 0.62], shadowDeep: 1.4, cast: 0.5, form: 1.0,
    rimFrom: [0.0, 1.0], rim: [1.0, 0.46, 0.2], rimAmt: 1.4, pool: 0.55, poolTint: [0.4, 0.2, 0.16], halo: 0.18, haloColor: [0.9, 0.7, 1.0] };
}
setLights({ weird: (lt, t) => deepLight(t) });

// ================================================================ the button: the selfie with his diamond... then the whip back up
function buttonA(t) {
  const c = cu(), r = (a, b, e) => ramp(t, a, b, e), D = TLd.duration;
  const A = deepState(t);
  const self = r(c.still2 - 0.25, c.still2 + 0.1);
  A.stick = vL2([-160, -300], [-330, -800], self);
  A.armL = vL2([-160, -300], [-230, -650], self);
  A.armR = vL2([150, -520], [170, -600], self);
  A.face = lerpFace(A.face, JF.sly, r(c.still2 - 0.1, c.still2 + 0.15));
  A.face = lerpFace(A.face, JF.grin, r(c.jump_end - 0.1, c.jump_end + 0.1));
  A.sparkle = (1 - r(c.still2, c.still2 + 0.2)) * A.sparkle;
  const nod = Math.max(0, Math.sin(Math.PI * 2 * inv(c.nod, c.nod + 0.4, t))) * (t > c.nod && t < c.nod + 0.4 ? 1 : 0);
  A.headDY = 16 * nod; A.headRot = -0.1 * self;
  return A;
}
SC.button = (lt, t, shot) => {
  const c = cu(), D = TLd.duration;
  const sw = c.whip + 0.2;
  if (t < sw) {
    const { fl } = deepWorld(t, buttonA(t));
    jpPill('DIAMOND RAIN?', 470, 505, popK(t, c.diamonds - 0.05, c.still2 - 0.05, 0.1, 0.12), '#BFF0FF', 64, -0.04);
    const u = ramp(t, c.whip, sw, E.inCubic);
    return { glow: 0.95, flash: 0.1 * fl + 0.5 * u, blur: [0, 120 * u], zblur: 0.2 * u };
  }
  hookSpace(t - D, t);
  const u = 1 - ramp(t, sw, sw + 0.18);
  return { glow: 0.9, flash: 0.45 * u, blur: [0, 90 * u], zblur: 0.15 * u };
};
setLights({ button: (lt, t) => (t < cu().whip + 0.2 ? deepLight(t) : SPACE_LIGHT) });
SC.loop = (lt, t) => { hookSpace(t - TLd.duration, t); return { glow: 0.9 }; };

// ================================================================ the cover: him in front of Jupiter, NO GROUND
SC.cover = (lt, t) => {
  jpSpaceBg(0, { sun: [1010, 150, 18] });
  jpPlanet(420, 1010, 1150, { soft: 0.12 });
  const A = { scarf: 0.9, pose: JP_POSE.dive, face: Object.assign({}, JF.oh, { lookX: 0.1, lookY: -0.2 }), handL: 'spread', handR: 'spread' };
  jpHero({ x: 0, y: 0, zoom: 1.32, rot: 0, sx: 470 - W / 2, sy: 1690 - H / 2 }, 0.5, Object.assign({ x: 0, y: 0, s: 1 }, A));
  jpSpeedLines(0.37, 0.8, 6, '#FFFFFF', [470, 300]);
  bigWord('JUPITER HAS', 540, 478, 100, '#FFFFFF', 1, -0.04);
  bigWord('NO GROUND!', 540, 612, 150, '#FFD447', 1, -0.04);
  return { glow: 0.9, noCaptions: true };
};
setLights({ loop: SPACE_LIGHT, cover: SPACE_LIGHT });

function initScenes2() {
  initJupiter();
  initGems();
}
