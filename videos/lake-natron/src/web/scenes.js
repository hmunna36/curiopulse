// Why Does This Lake Turn Animals to STONE? 🦩 Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds
// inside the shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
// THE CURIOUS KIND (story.md §6): the hero goes there. He sits in a canoe on Lake Natron at golden hour, nose to beak with a
// flamingo that the lake has turned into a chalk-white statue.
'use strict';

const cu = () => TLd.cues;
const bumpAt = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);
const pulseOf = (t, times, len = 0.16) => times.reduce((m, f) => Math.max(m, clamp((t - f) / 0.03) * clamp((f + len - t) / 0.05)), 0);
const lnL2 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
const lnSoft = (cam) => clamp((cam.zoom - 1.3) / 1.0);

// ---------------------------------------------------------------- the light (a low sun on the right, warm haze; the set
// softens behind him in close-ups)
const NAT_LIGHT = { ...LIGHTS.sunset, pool: 0.22, poolTint: [0.62, 0.42, 0.62], halo: 0.12, dof: 0.9, beams: 0.08, bloom: 0.1, halation: 0.12 };
const WIDE_LIGHT = { ...NAT_LIGHT, pool: 0.06, beams: 0.16, halo: 0 };
const WHY_LIGHT = { ...NAT_LIGHT, pool: 0.1, dof: 0 };

// ---------------------------------------------------------------- the statue: a flamingo the lake has coated in soda
const STATUE = { x: 905, y: 930, s: 1.15 };
const STATUE_O = { stone: true, crust: 1, seed: 7, head: [-150, -112], c1: [-74, -150], c2: [-112, -168], nod: 0.32, legs: { L: [-13, 104], R: [12, 104], upR: 1 } };
const BEAK = () => nbBeakTip(STATUE.x, STATUE.y, STATUE.s, STATUE_O);
const SHEAD = () => nbHeadAt(STATUE.x, STATUE.y, STATUE.s, STATUE_O);
function statueBranch(c) {
  // the bleached dead branch it stands on, rising out of the water at the canoe's stern
  const col = '#E7D8C4', sh = '#BCA790';
  c.beginPath(); c.moveTo(918, 1210); c.quadraticCurveTo(900, 1130, 900, 1052); c.lineTo(874, 1048); c.quadraticCurveTo(884, 1130, 888, 1210); c.closePath();
  c.fillStyle = col; c.fill();
  line(c, 884, 1052, 836, 1040, 12, col); line(c, 836, 1040, 812, 1018, 7, col);
  line(c, 900, 1080, 962, 1046, 10, col); line(c, 962, 1046, 984, 1050, 6, col);
  paint(() => { line(c, 902, 1190, 892, 1090, 3, rgba(sh, 0.8)); line(c, 908, 1160, 904, 1120, 2, rgba(sh, 0.7)); });
}

// ---------------------------------------------------------------- flocks crossing the sky (screen space, the video clock).
// None is on screen in the first 0.3 s or the last second, so the loop's join is clean.
const FLOCKS = [
  { t0: 0.3, t1: 10.5, x0: 1300, x1: -420, y0: 420, y1: 350, n: 7, s: 0.42, seed: 3 },
  { t0: 6.0, t1: 16, x0: -300, x1: 1450, y0: 610, y1: 545, n: 9, s: 0.34, seed: 4 },
  { t0: 17.5, t1: 30.5, x0: 1350, x1: -500, y0: 360, y1: 470, n: 11, s: 0.5, seed: 5 },
];

// ---------------------------------------------------------------- the canoe scene, whole: sky, water, life, him, the statue
// o: {cam, tilt, A (ntHero's description, or false), statue (false = none), soft, behind(P), after(P, Hh), flocks (the
// clock; false = none), motes}
function lakeDraw(t, o) {
  const cam = o.cam, P = ntPlane(cam, o.tilt || 0), soft = o.soft === undefined ? lnSoft(cam) : o.soft;
  const sun = ntSky(P, t, { soft });
  ntWater(P, t, { soft, rafts: o.rafts });
  ntLife(P, t, o.life || {});
  ntShimmer(P, t, 1 - soft);
  if (o.flocks !== false && soft < 0.45) for (const f of FLOCKS) nbFlock(o.flocks === undefined ? t : o.flocks, f);
  if (soft < 0.6) { screenSpace(); sunRays(sun[0], sun[1], 0.45); }
  if (o.behind) o.behind(P);
  applyCam(cam); cnWaterline(ctx, t);
  const Hh = o.A === false ? null : ntHero(cam, t, o.A);
  applyCam(cam);
  if (o.statue !== false) { statueBranch(ctx); actor(() => nbFlamingo(ctx, STATUE.x, STATUE.y, STATUE.s, t, STATUE_O)); }
  if (o.after) o.after(P, Hh);
  ntForeground(P, t, clamp((cam.zoom - 1.8) / 0.5) * 0.55);
  ntMotes(t, o.motes === undefined ? 1 : o.motes, cam);
  return { P, Hh };
}
// the boat's bob and roll: clocks that loop with the Short
const BOB = (t) => 4 * Math.sin(t * loopW(1.7)), ROLL = (t) => 0.012 * Math.sin(t * loopW(1.1) + 0.6);
// the paddle lying across the boat in front of him (rest), or in his hands
const PAD_REST = { g: [300, 1046], b: [760, 1066] };
const PAD_HELD = { g: [470, 800], b: [300, 978], crust: 1, over: true, hands: ['L', 'R'] };

// ---------------------------------------------------------------- small graphics
function tagPill(txt, x, y, col, k, size = 40, ink = '#0B0B1A') {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + size * 0.9, h = size * 1.5;
  rrect(ctx, -w / 2 - 4, -h / 2 - 4, w + 8, h + 8, h / 2 + 4); ctx.fillStyle = '#0B0B1A'; ctx.fill();
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = col; ctx.fill();
  ctx.fillStyle = ink; ctx.fillText(txt, 0, 2);
  ctx.restore();
}
function lnSparkle(c, x, y, r, k, col = '#FFF6C8') {
  if (k <= 0.01) return;
  c.save(); c.translate(x, y); c.scale(k, k);
  c.beginPath(); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, R = i % 2 ? r * 0.28 : r; c.lineTo(Math.cos(a) * R, Math.sin(a) * R); } c.closePath(); c.fillStyle = col; c.fill();
  c.restore();
}
// little hearts rising (world units)
function heartsUp(c, x, y, t, t0, n = 3, s = 1) {
  const d = t - t0;
  if (d < 0 || d > 1.4) return;
  for (let i = 0; i < n; i++) {
    const u = clamp((d - i * 0.18) / 1.0);
    if (u <= 0 || u >= 1) continue;
    const px = x + (i - 1) * 34 * s + 12 * s * Math.sin(u * 7 + i), py = y - u * 150 * s, k = Math.sin(Math.PI * u) * s;
    paint(() => {
      c.save(); c.translate(px, py); c.scale(k, k);
      c.beginPath(); c.moveTo(0, 12); c.bezierCurveTo(-22, -2, -14, -20, 0, -9); c.bezierCurveTo(14, -20, 22, -2, 0, 12); c.fillStyle = '#FF4D7A'; c.fill();
      c.restore();
    });
  }
}
// dust off the statue where a knuckle lands (world units)
function knockDust(c, x, y, t, t0, seed) {
  const d = t - t0;
  if (d < 0 || d > 0.5) return;
  const rng = mulberry32(seed), k = d / 0.5;
  paint(() => { for (let i = 0; i < 8; i++) { const a = -Math.PI * (0.15 + 0.7 * rng()), v = 60 + 80 * rng(); circle(c, x + Math.cos(a) * v * k, y + Math.sin(a) * v * k + 60 * k * k, (4 + 5 * rng()) * (1 - k), rgba('#F6EEE4', 0.95 * (1 - k))); } });
}
// a comic word in a jagged burst (screen space)
function burstWord(txt, x, y, size, col, k, rot = -0.08) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.font = `400 ${size}px Anton`; const w = ctx.measureText(txt).width;
  ctx.beginPath();
  for (let i = 0; i < 18; i++) { const a = (i / 18) * 6.283, R = (i % 2 ? 0.62 : 0.86) * (w * 0.62 + 30); ctx.lineTo(Math.cos(a) * R, Math.sin(a) * R * 0.62); }
  ctx.closePath(); ctx.fillStyle = '#FFF2C4'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#0B0B1A'; ctx.stroke();
  ctx.restore();
  bigWord(txt, x, y + 2, size, col, s, rot);
}

// ================================================================ the hook: you see that bird? (frame 1 and round it)
// tt = seconds since frame 1 (negative = the last frames of the Short, on their way here: he reaches out to poke it again)
function hookA(tt) {
  const c = cu(), beak = BEAK(), head = SHEAD();
  // where his fingertip is: on the beak; little pokes; reaching in from his lap at the very end of the Short
  const poke = 6 * pulseOf(tt, [0.38, 0.82], 0.14);
  const pd = [beak[0] - 540, beak[1] - 868], pl = Math.hypot(pd[0], pd[1]), pu = [pd[0] / pl, pd[1] / pl];
  let tip = [beak[0] + pu[0] * (poke - 3), beak[1] + pu[1] * (poke - 3)];
  const reach = tt < 0 ? E.inOutCubic(clamp((tt + 0.95) / 0.75)) : 1;
  tip = lnL2([600, 1010], tip, reach);
  // the knocks on STONE: the knuckle goes to the top of its head twice
  const kn1 = c.stone_end + 0.02, kn2 = c.stone_end + 0.24;
  const knockOn = tt > c.stone - 0.1 && tt < c.not + 0.1;
  const top = [head[0] + 8, head[1] - 24];
  const kk = Math.max(Math.sin(Math.PI * clamp((tt - (kn1 - 0.1)) / 0.2)), Math.sin(Math.PI * clamp((tt - (kn2 - 0.1)) / 0.2)));
  const kpos = [top[0] - 20 + 20 * kk, top[1] - 36 + 36 * kk + 18];
  // "Not stone, actually...": he scratches its neck with a fingernail; the crust flakes off; pink feathers underneath
  const neck = nbNeckAt(STATUE.x, STATUE.y, STATUE.s, STATUE_O, 0.8);
  const scr = ramp(tt, c.not - 0.05, c.not + 0.25, E.inOutCubic) * (1 - ramp(tt, c.mummy_end - 0.02, c.mummy_end + 0.1));
  const scrOn = tt > c.not - 0.05 && tt < c.mummy_end;
  const scrTip = [neck[0] - 14 + 9 * Math.sin(tt * 44) * popK(tt, c.stone2 - 0.02, c.its, 0.1, 0.15), neck[1] + 4 + 6 * Math.cos(tt * 44) * popK(tt, c.stone2 - 0.02, c.its, 0.1, 0.15)];
  // MUMMY: the hand leaves the statue fast, then wipes on his shirt
  const yank = ramp(tt, c.mummy_end - 0.02, c.mummy_end + 0.14, E.outCubic);
  const wipeOn = tt > c.mummy_end;
  const wipe = [606 + 10 * Math.sin((tt - c.mummy_end) * 34), 990 + 26 * Math.sin((tt - c.mummy_end) * 17)];
  let A = { dy: BOB(tt), roll: ROLL(tt), lean: 0.06, headRot: 0.05, paddle: PAD_REST, armL: [330, 1060] };
  if (wipeOn) A = Object.assign(A, { armR: lnL2(beak, wipe, yank), handR: 'open', lean: lerp(0.06, -0.04, yank), headRot: lerp(0.05, -0.08, yank) });
  else if (scrOn) A = Object.assign(A, { tipR: lnL2(kpos, scrTip, scr), handR: 'point', lean: 0.08, headRot: 0.07 });
  else if (knockOn) A = Object.assign(A, { armR: lnL2([tip[0] - 40, tip[1] + 30], kpos, ramp(tt, c.stone - 0.1, c.stone + 0.12)), handR: 'open' });
  else A = Object.assign(A, { tipR: tip, handR: 'point' });
  // his face: on the bird; a glance at us on "This lake"; impressed on the knocks; then us; MUMMY: eww
  let face = NF.poke;
  face = lerpFace(face, NF.us, ramp(tt, c.this1 - 0.12, c.this1 + 0.08) * (1 - ramp(tt, c.turned + 0.05, c.turned + 0.25)));
  face = lerpFace(face, NF.tok, ramp(tt, c.stone - 0.05, c.stone + 0.15) * (1 - ramp(tt, c.not - 0.15, c.not + 0.05)));
  face = lerpFace(face, { ...NF.poke, eyeOpen: 0.78, browY: 0.2, browTilt: 0.85, mouth: 'flat', mouthOpen: 0.2, lookX: 0.9, lookY: 0.2 }, ramp(tt, c.not - 0.1, c.not + 0.1));
  face = lerpFace(face, { ...NF.tok, lookX: 0.9 }, ramp(tt, c.actually + 0.15, c.actually + 0.35));
  face = lerpFace(face, NF.shock, ramp(tt, c.mummy - 0.05, c.mummy + 0.08));
  face = lerpFace(face, NF.eww, ramp(tt, c.mummy_end - 0.02, c.mummy_end + 0.12));
  if (tt < 0) face = lerpFace(NF.nope, NF.poke, reach);
  A.face = { ...face, blink: Math.max(face.blink || 0, pulseOf(tt, [1.9, 5.3], 0.12)) };
  return { A, kn1, kn2, top, neck, reveal: ramp(tt, c.stone2 + 0.1, c.actually_end, E.outCubic), scrub: popK(tt, c.stone2 - 0.02, c.its, 0.1, 0.15) };
}
const BEAT = {};
let BUTTON_CAM_END = { x: 540, y: 950, zoom: 1.12 };
function hookCam(tt) {
  const c = cu();
  if (tt < 0) {                                          // from the button's framing into frame 1's (the loop)
    const k = E.inOutCubic(clamp((tt + 0.95) / 0.95)), b = BUTTON_CAM_END;
    return { x: lerp(b.x, 700, k), y: lerp(b.y, 900, k), zoom: lerp(b.zoom, 2.25, k), rot: 0 };
  }
  const k = camKeys(tt, [[0, 700, 900, 2.25], [1.25, 704, 898, 2.42], [c.this1 + 0.2, 686, 902, 2.32], [c.stone - 0.05, 712, 872, 2.56],
    [c.not, 700, 890, 2.5], [c.not + 0.5, 690, 880, 2.3], [c.actually_end, 686, 872, 2.55], [c.mummy - 0.1, 660, 900, 2.2], [c.mummy + 0.25, 640, 900, 2.25], [c.mummy_end + 0.4, 650, 918, 2.1]], E.inOutCubic);
  const kn1 = c.stone_end + 0.02, kn2 = c.stone_end + 0.24;
  const sh = bumpAt(tt, kn1, 14) + bumpAt(tt, kn2, 14);
  k.y += 5 * sh * Math.sin(tt * 90); k.x += 3 * sh * Math.cos(tt * 70);
  return k;
}

// where the crust has come off the statue's neck: pink feathers, a ragged white edge (world units)
function featherPatch(c, P, k, t) {
  if (k <= 0.01) return;
  const r = 25 * k * STATUE.s;
  paint(() => {
    c.save(); c.translate(P[0] + 2, P[1] + 4);
    c.beginPath();
    for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283, rr = r * (0.82 + 0.3 * Math.sin(i * 2.7)); c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr * 0.9); }
    c.closePath(); c.fillStyle = '#FF8FB0'; c.fill();
    c.lineWidth = 2; c.strokeStyle = 'rgba(214,80,120,0.7)';
    for (let i = -1; i <= 1; i++) { c.beginPath(); c.arc(i * r * 0.4, -r * 0.1, r * 0.4, 0.3, Math.PI - 0.3); c.stroke(); }
    c.restore();
  });
}
// flakes of white crust falling from where he scratches (world units)
function crustFlakes(c, P, t, k) {
  if (k <= 0.01) return;
  const rng = mulberry32(5 + Math.floor(t * 20));
  paint(() => { for (let i = 0; i < 6; i++) { const u = rng(), px = P[0] - 10 + (rng() - 0.5) * 30, py = P[1] + 10 + u * 70; c.save(); c.translate(px, py); c.rotate(rng() * 6); c.fillStyle = rgba('#F6EEE4', 0.95 * k * (1 - u * 0.6)); c.fillRect(-5, -3, 9 + 6 * rng(), 6); c.restore(); } });
}
SC.hook = (lt, t, shot) => {
  const S = hookA(t), cam = hookCam(t);
  lakeDraw(t, { cam, A: S.A, after: () => { knockDust(ctx, S.top[0], S.top[1], t, S.kn1, 1); knockDust(ctx, S.top[0], S.top[1], t, S.kn2, 2); featherPatch(ctx, S.neck, S.reveal, t); crustFlakes(ctx, S.neck, t, S.scrub); } });
  return { glow: 0.8, flash: 0.05 * (bumpAt(t, S.kn1, 16) + bumpAt(t, S.kn2, 16)) };
};
SC.loop = (lt, t, shot) => {
  const tt = t - TLd.duration, S = hookA(tt), cam = hookCam(tt);
  lakeDraw(t, { cam, A: S.A, flocks: tt });
  return { glow: 0.8 };
};

// ================================================================ the soda: hot washing soda; it BURNS
function sodaA(t) {
  const c = cu(), T0 = c.water - 0.06;
  const wipe = clamp(1 - (t - c.mummy_end) / 0.75);                       // the wipe winds down
  const grab = ramp(t, T0 + 0.35, T0 + 0.9, E.inOutCubic);                  // he picks up the paddle
  const dip = ramp(t, c.it2 - 0.05, c.it2 + 0.3, E.inOutCubic) * (1 - ramp(t, c.burns + 0.14, c.burns + 0.36, E.outCubic));
  const up = ramp(t, c.burns + 0.14, c.burns + 0.36, E.outBack);
  const held = { g: [438, 846], b: [236, 1158] }, dipP = { g: [404, 900], b: [168, 1262] }, upP = { g: [470, 800], b: [300, 978] };
  let g = lnL2(lnL2(PAD_REST.g, held.g, grab), dipP.g, dip), b = lnL2(lnL2(PAD_REST.b, held.b, grab), dipP.b, dip);
  if (up > 0) { g = lnL2(g, upP.g, up); b = lnL2(b, upP.b, up); }
  const shaft = (k) => lnL2(g, b, k);
  const A = { dy: BOB(t), roll: ROLL(t), paddle: { g, b, crust: ramp(t, c.burns - 0.05, c.burns + 0.25), over: grab > 0.5, sub: 1186, hands: grab > 0.5 ? ['L', 'R'] : null } };
  if (grab > 0.02) { A.armL = lnL2([330, 1060], shaft(0.03), grab); A.armR = lnL2([606, 990], shaft(0.3), grab); A.handL = A.handR = 'open'; }
  else { A.armL = [330, 1060]; A.armR = [606 + 10 * Math.sin((t - c.mummy_end) * 34) * wipe, 990 + 26 * Math.sin((t - c.mummy_end) * 17) * wipe]; }
  let face = NF.eww;
  face = lerpFace(face, NF.down, ramp(t, T0 + 0.5, T0 + 0.8));
  face = lerpFace(face, { ...NF.down, lookX: -0.8 }, ramp(t, c.it2 - 0.2, c.it2));
  face = lerpFace(face, NF.burn, ramp(t, c.burns - 0.04, c.burns + 0.08));
  A.face = face; A.lean = -0.05 * dip; A.headRot = -0.06 * dip + 0.04 * bumpAt(t, c.burns, 10) * Math.sin(t * 60);
  return { A, g, b, dip, up };
}
SC.soda = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, S = sodaA(t);
  const cam = camKeys(t, [[T0, 650, 918, 2.1], [T0 + 0.95, 540, 960, 1.06], [c.it2 - 0.15, 520, 964, 1.1], [c.it2 + 0.35, 430, 1010, 1.34], [c.burns + 0.5, 450, 990, 1.28], [shot.end, 470, 980, 1.22]], E.inOutCubic);
  const sh = bumpAt(t, c.burns, 7);
  cam.x += 6 * sh * Math.sin(t * 80); cam.y += 6 * sh * Math.cos(t * 66);
  lakeDraw(t, {
    cam, A: S.A,
    behind: () => {
      // the water fizzes and steams round the canoe ("hot washing soda")
      applyCam(cam);
      const fz = ramp(t, c.hot - 0.1, c.hot + 0.3);
      if (fz > 0.01) snWisps({ x: 540, y: 1150, t, n: 26, seed: 61, col: '#FFE6DA', size: 90, rise: 420, spread: 700, life: 2.4, alpha: 0.2 * fz, glow: 0.3, sway: 120, t0: c.hot - 0.1 });
    },
    after: () => {
      applyCam(cam);
      // the dip: rings, a hiss of steam, bubbles at the blade
      const bp = [176, 1196];
      for (const d0 of [c.it2 + 0.12, c.it2 + 0.3, c.burns + 0.05]) {
        const k = (t - d0) / 0.9;
        if (k > 0 && k < 1) { ctx.save(); ctx.lineWidth = 6 * (1 - k); ctx.strokeStyle = rgba('#FFD6C4', 0.85 * (1 - k)); ctx.beginPath(); ctx.ellipse(bp[0], bp[1], 40 + 150 * E.outCubic(k), 10 + 30 * E.outCubic(k), 0, 0, 7); ctx.stroke(); ctx.restore(); }
      }
      const st = ramp(t, c.it2 + 0.1, c.burns) * (1 - ramp(t, c.burns + 0.8, shot.end));
      if (st > 0.01) snWisps({ x: bp[0], y: bp[1] - 10, t, n: 26, seed: 62, col: '#FFF1EA', size: 52, rise: 380, spread: 90, life: 1.0, alpha: 0.26 * st, glow: 0.12, sway: 80, t0: c.it2 + 0.1 });
      if (S.up > 0.3) snWisps({ x: S.b[0], y: S.b[1] - 10, t, n: 16, seed: 63, col: '#FFF1EA', size: 30, rise: 220, spread: 30, life: 0.8, alpha: 0.34, glow: 0.12, sway: 40, t0: c.burns + 0.2 });
      if (S.dip > 0.4) {
        const rng = mulberry32(64 + Math.floor(t * 15));
        paint(() => { for (let i = 0; i < 12; i++) { const r = 4 + 9 * rng(); ctx.beginPath(); ctx.arc(bp[0] + (rng() - 0.5) * 120, bp[1] + (rng() - 0.5) * 24, r, 0, 7); ctx.lineWidth = 2.5; ctx.strokeStyle = rgba('#FFE9DE', 0.85); ctx.stroke(); } });
      }
    },
  });
  burstWord('TSSSS!', 300, 760, 92, '#FF5A6E', popK(t, c.burns + 0.02, c.burns + 0.75, 0.08, 0.12), -0.1);
  return { glow: 0.85, flash: 0.08 * (1 - ramp(lt, 0, 0.12)) };
};

// ================================================================ the crust: whatever falls in gets dried out and crusted over
const SW_HIT = [400, 1192];                    // where the swallow lands in the water (world), in front of the canoe
function swallowAt(t) {
  const c = cu(), T0 = c.whatever - 0.06, hit = c.in1;
  if (t < hit) {                               // the swoop: in from the left high over the water, then down into its own reflection
    const u = clamp((t - T0) / (hit - T0)), e = E.inOutSine(u);
    const x = lerp(-80, SW_HIT[0], e), y = lerp(700, SW_HIT[1], Math.pow(u, 2.2)) - 120 * Math.sin(Math.PI * u * 0.8);
    return { x, y, tilt: lerp(-0.1, 0.8, Math.pow(u, 2)), fly: 1 - 0.6 * Math.pow(u, 4), s: 1.6, float: 0 };
  }
  const bob = 5 * Math.sin((t - hit) * 6) * Math.exp(-(t - hit) * 0.8);
  const hop = Math.sin(Math.PI * clamp((t - c.over_end) / 0.35)) * 26;
  return { x: SW_HIT[0], y: SW_HIT[1] + bob - hop, tilt: lerp(0.5, 0.0, ramp(t, hit, hit + 0.4)), fly: 0, s: 1.6, float: 1 };
}
SC.crust = (lt, t, shot) => {
  const c = cu(), T0 = shot.start;
  const cam = camKeys(t, [[T0, 470, 980, 1.22], [c.in1 - 0.25, 500, 1000, 1.1], [c.in1 + 0.4, 470, 1060, 1.6], [c.and1 - 0.1, 468, 1066, 1.66], [c.crusted + 0.1, 462, 1090, 1.95], [c.over_end + 0.1, 470, 1066, 1.7], [shot.end, 480, 1060, 1.6]], E.inOutCubic);
  const sh = bumpAt(t, c.in1, 9); cam.y += 4 * sh * Math.sin(t * 70);
  const sw = swallowAt(t), dry = ramp(t, c.gets - 0.05, c.out_end + 0.1, E.inOutSine), crust = ramp(t, c.and1 - 0.05, c.over + 0.2, E.inOutSine);
  const look = ramp(t, c.in1 + 0.05, c.in1 + 0.3);
  let face = lerpFace(NF.burn, NF.dead, ramp(t, T0, T0 + 0.5));
  face = lerpFace(face, { ...NF.down, lookX: -0.5 }, look);
  face = lerpFace(face, { ...NF.down, lookX: -0.5, eyeOpen: 1.38, pupil: 0.55, browY: 1.5, mouth: 'o', mouthOpen: 0.7 }, ramp(t, c.crusted, c.crusted + 0.2));
  face = lerpFace(face, NF.us, ramp(t, c.over_end + 0.1, c.over_end + 0.3));
  const peer = look * (1 - ramp(t, c.over_end + 0.15, c.over_end + 0.45, E.outBack));
  const A = { dy: BOB(t), roll: ROLL(t), face, headDY: 12 * peer, lean: 0.03 * peer,
    paddle: PAD_REST, armL: lnL2([330, 1060], [420, 1066], peer), armR: lnL2([606, 1000], [660, 1068], peer) };
  lakeDraw(t, {
    cam, A,
    after: () => {
      applyCam(cam);
      // the swallow: flying, then floating with the water up to its belly
      actor(() => nbSwallow(ctx, sw.x, sw.y, sw.s, t, { fly: sw.fly, tilt: sw.tilt, dry, crust }));
      if (sw.float) {
        nbWaterOver(ctx, SW_HIT[0], SW_HIT[1] + 12 * sw.s, 170 * sw.s, 60 * sw.s, 0.75);
        nbDrops(ctx, sw.x, sw.y, sw.s, t, ramp(t, c.gets, c.out_end + 0.25), 3);
        // sparkles as the crust closes over it
        const sp = popK(t, c.over - 0.05, c.over + 0.5, 0.08, 0.15);
        paint(() => { lnSparkle(ctx, sw.x - 60, sw.y - 40, 26, sp); lnSparkle(ctx, sw.x + 70, sw.y - 30, 18, popK(t, c.over + 0.05, c.over + 0.6, 0.08, 0.15)); });
        softDot(gctx, sw.x, sw.y - 20, 100, '#FFF6E0', 0.14 * sp);
      }
      // the splash where it hits
      const k = (t - c.in1) / 1.0;
      if (k > 0 && k < 1) {
        ctx.save(); ctx.lineWidth = 7 * (1 - k); ctx.strokeStyle = rgba('#FFD6C4', 0.9 * (1 - k));
        ctx.beginPath(); ctx.ellipse(SW_HIT[0], SW_HIT[1] + 16, 60 + 260 * E.outCubic(k), 10 + 46 * E.outCubic(k), 0, 0, 7); ctx.stroke(); ctx.restore();
      }
    },
  });
  if (t > c.in1 && t < c.in1 + 1.1) { const p = toScreen(cam, SW_HIT[0], SW_HIT[1]); splashDrops(p[0], p[1] - 10, c.in1, t, 26, 9, 0.7); }
  burstWord('PLIP!', 300, 720, 84, '#7FE9FF', popK(t, c.in1 + 0.02, c.in1 + 0.6, 0.08, 0.12), -0.08);
  return { glow: 0.85, flash: 0.05 * bumpAt(t, c.in1, 12) };
};

// ================================================================ the payoff: Egyptians made mummies with the same salt
function mummyState(t) {
  const c = cu();
  const pop = ramp(t, c.egyptians - 0.02, c.egyptians + 0.3) * (1 - ramp(t, c.and2 - 0.08, c.and2 + 0.12));
  const scoop = Math.sin(Math.PI * clamp((t - c.made) / (c.with - c.made + 0.1)));
  const raise = ramp(t, c.same - 0.12, c.same + 0.18, E.outBack);
  const jar = lnL2([396, 1004 + 130 * scoop], [404, 880], raise);
  return { pop, jar, thumb: ramp(t, c.salt - 0.08, c.salt + 0.12, E.outBack), turn: -0.08 * raise };
}
function inBoatMummy(t) {
  return (lc) => {
    const M = mummyState(t);
    if (M.pop <= 0.01) return;
    ntMummy(lc, 290, 1150, t, { s: 0.8, pop: M.pop, jar: M.jar, thumb: M.thumb, turn: M.turn });
    if (M.pop > 0.3) ntJar(lc, M.jar[0], M.jar[1] - 24, 0.92, 0.12 * M.thumb);
  };
}
SC.payoff = (lt, t, shot) => {
  const c = cu(), T0 = shot.start;
  const cam = camKeys(t, [[T0, 548, 1100, 1.4], [T0 + 0.5, 520, 960, 1.14], [c.same - 0.1, 470, 952, 1.26], [shot.end, 460, 950, 1.3]], E.inOutCubic);
  let face = lerpFace(NF.us, NF.side, ramp(t, c.egyptians + 0.1, c.egyptians + 0.3));
  face = lerpFace(face, NF.shock, ramp(t, c.mummies - 0.05, c.mummies + 0.1));
  face = lerpFace(face, { ...NF.dead, lookX: -0.7 }, ramp(t, c.salt_end - 0.1, c.salt_end + 0.15));
  const dt = bumpAt(t, c.mummies, 8);
  const A = { dy: BOB(t), roll: ROLL(t), face, headRot: -0.06 * ramp(t, c.egyptians + 0.1, c.egyptians + 0.3) + 0.06 * dt * Math.sin(t * 50), lean: 0.06 * ramp(t, c.mummies, c.mummies + 0.15),
    paddle: PAD_HELD, armL: [458, 822], armR: [400, 900], inBoat: inBoatMummy(t) };
  lakeDraw(t, {
    cam, A,
    after: () => {
      applyCam(cam);
      actor(() => nbSwallow(ctx, SW_HIT[0], SW_HIT[1] + 3 * Math.sin(t * 2), 1.6, t, { crust: 1, dry: 1 })); nbWaterOver(ctx, SW_HIT[0], SW_HIT[1] + 22, 270, 96, 0.7);   // the little statue, still afloat
      ntPoof(ctx, 290, 980, 1, (t - c.egyptians + 0.04) / 0.55, 4);
    },
  });
  return { glow: 0.85, flash: 0.08 * (1 - ramp(lt, 0, 0.12)) };
};

// ================================================================ flamingos LOVE it (one wades up and dunks its head in)
const FL_POS = [228, 1084];                    // the live flamingo, at the canoe's bow, in the water in front of it
function liveFlamingo(t, o = {}) {
  const c = cu();
  const walk = clamp((t - (c.and2 - 0.1)) / 0.85), e = E.outCubic(walk);
  const x = lerp(-200, FL_POS[0], e), step = Math.sin(walk * Math.PI * 4) * (1 - walk);
  const dunk = ramp(t, c.love - 0.05, c.love + 0.3, E.inOutCubic) * (1 - ramp(t, c.most - 0.2, c.most + 0.2));
  const wag = Math.sin(t * 22) * dunk;
  const head = lnL2([-112, -168], [-46, 128], dunk), c1 = lnL2([-60, -130], [-110, -60], dunk), c2 = lnL2([-120, -150], [-90, 60], dunk);
  return {
    x, y: FL_POS[1] - 6 * Math.abs(step), dunk,
    o: Object.assign({ head, c1, c2, nod: lerp(0.1, 2.9, dunk), tilt: -0.22 * dunk + 0.03 * wag, face: dunk > 0.5 ? 'shut' : 'chill', look: [0.8, 0],
      legs: { L: [-10 + 30 * step, 236], R: [16 - 30 * step, 236] }, wade: 118 }, o),
  };
}
SC.weird = (lt, t, shot) => {
  const c = cu(), T0 = shot.start;
  const cam = camKeys(t, [[T0, 460, 950, 1.3], [T0 + 0.5, 470, 960, 1.16], [c.love - 0.1, 430, 980, 1.24], [shot.end, 420, 985, 1.28]], E.inOutCubic);
  const F = liveFlamingo(t);
  let face = lerpFace({ ...NF.dead, lookX: -0.7 }, NF.side, ramp(t, c.flamingos - 0.1, c.flamingos + 0.1));
  face = lerpFace(face, NF.shock, ramp(t, c.love - 0.02, c.love + 0.1));
  face = lerpFace(face, { ...NF.us, mouth: 'flat', mouthOpen: 0, browY: 1.1, browTilt: 0.6 }, ramp(t, c.love_end - 0.05, c.love_end + 0.15));
  const A = { dy: BOB(t), roll: ROLL(t), face, headRot: -0.05 + 0.05 * ramp(t, c.love_end - 0.05, c.love_end + 0.15),
    paddle: PAD_HELD, armL: [458, 822], armR: [400, 900], inBoat: inBoatMummy(t) };
  lakeDraw(t, {
    cam, A,
    after: () => {
      applyCam(cam);
      actor(() => nbSwallow(ctx, SW_HIT[0], SW_HIT[1] + 3 * Math.sin(t * 2), 1.6, t, { crust: 1, dry: 1 })); nbWaterOver(ctx, SW_HIT[0], SW_HIT[1] + 22, 270, 96, 0.7);
      ntPoof(ctx, 290, 980, 1, (t - c.and2 + 0.08) / 0.5, 5);
      // the flamingo, its ripples, its happy hearts
      const wl = F.y + 118;
      nbReflect(ctx, F.x, F.y, 1.0, t, F.o, wl);
      actor(() => nbFlamingo(ctx, F.x, F.y, 1.0, t, F.o));
      nbWaterOver(ctx, F.x + 10, wl, 130, 140, 0.8);
      if (F.dunk > 0.5) {
        const hp = [F.x - 40, wl], rng = mulberry32(70 + Math.floor(t * 10));
        paint(() => { for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(hp[0] + (rng() - 0.5) * 70, hp[1] - 4 - rng() * 14, 3 + 6 * rng(), 0, 7); ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(255,233,222,0.85)'; ctx.stroke(); } });
      }
      heartsUp(ctx, F.x + 60, F.y - 80, t, c.love + 0.25, 3, 1.1);
    },
  });
  return { glow: 0.85, flash: 0.08 * (1 - ramp(lt, 0, 0.12)) };
};

// ================================================================ the wide: most of the world's lesser flamingos hatch here
const COLONIES = [                            // long pink bands along the shallows, far to near
  { wx: 500, u: 0.07, n: 360, spread: 5200, depth: 0.012, seed: 81 }, { wx: -300, u: 0.13, n: 300, spread: 3600, depth: 0.014, seed: 82 },
  { wx: 1500, u: 0.18, n: 260, spread: 3000, depth: 0.016, seed: 83 }, { wx: 200, u: 0.27, n: 220, spread: 2600, depth: 0.018, seed: 84 },
  { wx: -1100, u: 0.36, n: 120, spread: 1600, depth: 0.02, seed: 85 }, { wx: 1700, u: 0.4, n: 110, spread: 1500, depth: 0.02, seed: 86 },
  { wx: -500, u: 0.58, n: 60, spread: 1200, depth: 0.025, seed: 87 }, { wx: 1550, u: 0.72, n: 40, spread: 900, depth: 0.03, seed: 88 },
];
const ISLES = [{ wx: -420, u: 0.42, rx: 700, seed: 91, nests: 14 }, { wx: 1400, u: 0.47, rx: 620, seed: 92, nests: 12 }, { wx: 520, u: 0.66, rx: 520, seed: 93, nests: 9 }, { wx: -1300, u: 0.7, rx: 600, seed: 94, nests: 10 }];
function wideColony(P, g, t) {
  const rng = mulberry32(g.seed), birds = [];
  for (let i = 0; i < g.n; i++) birds.push({ dx: (rng() - 0.5) * g.spread, du: (rng() - 0.5) * g.depth * 2, ph: rng() * 6.28, f: rng() < 0.6, w: 0.5 + rng() });
  birds.sort((a, b) => a.du - b.du);
  for (const b of birds) {
    const feed = b.f && Math.sin(t * loopW(0.7 * b.w) + b.ph) > -0.3, flap = !b.f && Math.sin(t * loopW(0.5 * b.w) + b.ph * 3) > 0.9;
    nbSmall(P, g.wx + b.dx, g.u + b.du, 250, flap ? 'flap' : feed ? 'feed' : 'stand', t, { flip: b.ph > 3.14 });
  }
}
function wideIsles(P, t, hatch) {
  for (const I of ISLES) {
    ntIsland(P, I.wx, I.u, I.rx, I.seed);
    const rng = mulberry32(I.seed + 7);
    for (let i = 0; i < I.nests; i++) {
      const wx = I.wx + (rng() - 0.5) * I.rx * 1.3, du = (rng() - 0.5) * 0.03, adult = rng() < 0.55, flip = rng() < 0.5, dly = 0.12 * rng();
      const [nx, ny, ns] = ntAt(P, wx, I.u + du), w = 120 * ns;
      if (w < 3) continue;
      screenSpace(); ntNest(ctx, nx, ny, w);
      if (adult) nbSmall(P, wx, I.u + du - 0.004, 200, 'stand', t, { flip });
      else {                                            // a chick on the nest: it pops up at "hatch"
        const k = E.outBack(clamp((hatch - dly) * 3));
        if (k > 0.01) { ctx.save(); ctx.translate(nx, ny - w * 0.36); ctx.scale(ns * 0.5 * k, ns * 0.5 * k); ntChick(ctx, 0, 0, 1, t, { face: 'open' }); ctx.restore(); }
      }
    }
  }
}
function wideCam(t) {
  const c = cu(), T0 = c.most - 0.06;
  const k = E.inOutCubic(clamp((t - T0) / 1.9)), k2 = clamp((t - T0 - 1.9) / 2.2);
  return { cam: { x: lerp(430, 540, k), y: lerp(985, -560, k) - 40 * k2, zoom: lerp(1.28, 0.34, k) - 0.02 * k2, rot: 0 }, tilt: lerp(0, 520, k) + 30 * k2 };
}
SC.wide = (lt, t, shot) => {
  const c = cu(), W0 = wideCam(t), cam = W0.cam;
  const F = liveFlamingo(t, { face: 'chill' });
  const hatch = clamp((t - c.hatch) / 0.6);
  lakeDraw(t, {
    cam, tilt: W0.tilt, soft: 0, A: { dy: BOB(t), roll: ROLL(t), face: { ...NF.us, lookY: -0.6 }, paddle: PAD_HELD, armL: [458, 822], armR: [400, 900] },
    behind: (P) => {
      for (const g of COLONIES) wideColony(P, g, t);
      wideIsles(P, t, hatch);
    },
    after: () => { applyCam(cam); actor(() => nbFlamingo(ctx, F.x, F.y, 1.0, t, F.o)); nbWaterOver(ctx, F.x + 10, F.y + 118, 130, 140, 0.8); },
  });
  // a big flock crossing in front of the sun
  nbFlock(t, { t0: c.most - 0.4, t1: c.here_end + 1.6, x0: 1250, x1: -350, y0: 330, y1: 300, n: 15, s: 0.6, seed: 12 });
  tagPill('UP TO 3 IN 4', 540, 610, '#FF8FB0', popK(t, c.lesser - 0.05, shot.end + 1, 0.12, 0.1), 66);
  tagPill('OF ALL LESSER FLAMINGOS', 540, 712, '#FFFFFF', popK(t, c.flamingos2 - 0.05, shot.end + 1, 0.12, 0.1), 34);
  return { glow: 0.9, flash: 0.06 * (1 - ramp(lt, 0, 0.12)) };
};

// ================================================================ why: nothing dares wade in after them
function hyenaState(t) {
  const c = cu();
  const walkIn = clamp((t - (c.because - 0.1)) / (c.dares + 0.2 - c.because));
  const back = ramp(t, c.them_end + 0.02, c.them_end + 0.42, E.outCubic);
  const wx = lerp(lerp(1060, 700, E.outCubic(walkIn)), 900, back);
  const paw = ramp(t, c.wade - 0.1, c.wade + 0.15, E.outCubic) * (1 - ramp(t, c.them_end - 0.02, c.them_end + 0.1));
  const yelp = popK(t, c.them_end + 0.0, c.them_end + 0.5, 0.06, 0.2);
  return { wx, walk: (t * 9) * (walkIn < 1 ? 1 : 0) + back * 30, paw, yelp, back, face: yelp > 0.3 ? 'yelp' : back > 0.4 ? 'sulk' : 'sniff', steam: popK(t, c.wade + 0.05, c.them_end + 0.3, 0.05, 0.3) };
}
SC.why = (lt, t, shot) => {
  const c = cu(), T0 = shot.start;
  const cam = camKeys(t, [[T0, 548, 1112, 1.56], [shot.end, 566, 1122, 1.66]], E.inOutSine);
  const P = ntPlane(cam);
  ntSky(P, t, { soft: 0.3 });
  ntWater(P, t, { soft: 0.2 });
  ntLife(P, t, { snags: false });
  ntShimmer(P, t, 0.7);
  for (const f of FLOCKS) nbFlock(t, f);
  // the far bank: a white salt flat; the hyena on it
  const BK = 1.0;
  screenSpace();
  const [bx0, by0] = ntAt(P, 760, BK), [bx1] = ntAt(P, 2200, BK);
  ctx.beginPath(); ctx.moveTo(bx0 - 40, by0 + 8); ctx.quadraticCurveTo(bx0 + 30, by0 - 30, bx0 + 140, by0 - 34); ctx.lineTo(bx1 + 400, by0 - 40); ctx.lineTo(bx1 + 400, by0 + 60); ctx.lineTo(bx0 - 40, by0 + 60); ctx.closePath();
  ctx.fillStyle = '#E8B3A4'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(bx0 - 10, by0 - 6); ctx.quadraticCurveTo(bx0 + 40, by0 - 34, bx0 + 150, by0 - 38); ctx.lineTo(bx1 + 400, by0 - 44); ctx.lineTo(bx1 + 400, by0 - 14); ctx.lineTo(bx0 - 10, by0 - 6); ctx.closePath();
  ctx.fillStyle = '#FBEAE2'; ctx.fill();
  const Hy = hyenaState(t), [hx, hy, hs] = ntAt(P, Hy.wx, BK);
  actor(() => ntHyena(ctx, hx, hy - 30 * hs, 0.5 * hs, t, { walk: Hy.walk, paw: Hy.paw, yelp: Hy.yelp, face: Hy.face, steam: Hy.steam }));
  if (Hy.steam > 0.01) burstWord('TSSS!', clamp(hx - 120, 300, 800), hy - 300 * hs * 0.5, 74, '#FF5A6E', Hy.steam, 0.1);
  // the near island, the nest, the chick
  applyCam(cam);
  const IX = 380;
  ctx.beginPath(); ctx.ellipse(IX, 1276, 400, 66, 0, 0, 7); ctx.fillStyle = '#E9B4A6'; ctx.fill();
  ctx.beginPath(); ctx.ellipse(IX, 1266, 380, 52, 0, 0, 7); ctx.fillStyle = '#FBEDE6'; ctx.fill();
  paint(() => { const rng = mulberry32(31); for (let i = 0; i < 30; i++) circle(ctx, IX + (rng() - 0.5) * 680, 1266 + (rng() - 0.5) * 70, 2 + 3 * rng(), 'rgba(220,170,160,0.6)'); });
  ntNest(ctx, IX - 8, 1266, 220);
  const smug = ramp(t, c.after, c.after + 0.15);
  actor(() => ntChick(ctx, IX - 8, 1266 - 220 * 0.36 + 4, 1.05, t, { face: smug > 0.5 ? 'smug' : 'open', look: [0.8, 0], hop: Math.sin(Math.PI * clamp((t - c.them) / 0.3)) }));
  ntMotes(t, 0.8, cam);
  return { glow: 0.85, flash: 0.08 * (1 - ramp(lt, 0, 0.12)) };
};

// ================================================================ the button: if a flamingo says the water's lovely... don't
SC.button = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, dur = TLd.duration, tt = t - dur;
  const camB = camKeys(t, [[T0, 470, 960, 1.18], [T0 + 0.4, 500, 952, 1.12], [c.dont - 0.1, 520, 950, 1.12], [dur - 0.95, 540, 950, 1.12]], E.inOutCubic);
  const cam = tt > -0.95 ? hookCam(tt) : camB;
  const beck = ramp(t, c.so - 0.1, c.so + 0.25, E.outBack) * (1 - ramp(t, c.dont + 0.1, c.dont + 0.3));
  const F = { x: FL_POS[0], y: FL_POS[1], o: { head: [-104, -176], c1: [-60, -130], c2: [-110, -160], nod: 0.1, face: 'chill', look: [0.8, 0], shades: true,
    wing: beck, wingWave: Math.sin(t * 9), legs: { L: [-10, 236], R: [16, 236] }, wade: 118 } };
  let S;
  if (tt > -0.95) S = hookA(tt).A;
  else {
    let face = lerpFace({ ...NF.side, mouth: 'flat', mouthOpen: 0 }, NF.smile, ramp(t, c.says - 0.1, c.says + 0.15));
    face = lerpFace(face, NF.nope, ramp(t, c.dont - 0.08, c.dont + 0.06));
    const shake = Math.sin((t - c.dont) * 26) * popK(t, c.dont, c.dont_end + 0.25, 0.05, 0.1);
    S = { dy: BOB(t), roll: ROLL(t), face, headRot: -0.05 + 0.1 * shake, paddle: PAD_REST, armL: [330, 1060], armR: [606, 1000] };
  }
  lakeDraw(t, {
    cam, A: S,
    after: () => {
      applyCam(cam);
      const wl = F.y + 118;
      nbReflect(ctx, F.x, F.y, 1.0, t, F.o, wl);
      actor(() => nbFlamingo(ctx, F.x, F.y, 1.0, t, F.o));
      nbWaterOver(ctx, F.x + 10, wl, 130, 140, 0.8);
      heartsUp(ctx, F.x - 20, F.y - 220, t, c.lovely - 0.05, 3, 1.0);
    },
  });
  return { glow: 0.85, flash: 0.08 * (1 - ramp(lt, 0, 0.12)) };
};

// ================================================================ the cover (rendered by src/cover.sh from a one-shot timeline)
SC.cover = (lt, t) => {
  const S = hookA(0.3);
  lakeDraw(0.3, { cam: { x: 690, y: 900, zoom: 1.95, rot: 0 }, A: S.A, flocks: false });
  screenSpace();
  bigWord('TURNED INTO', 540, 1250, 132, '#FFFFFF', 1, -0.04);
  bigWord('STATUES?!', 540, 1410, 160, '#FFD447', 1, -0.04);
  return { glow: 0.85, noCaptions: true };
};

setLights({ hook: NAT_LIGHT, loop: NAT_LIGHT, soda: NAT_LIGHT, crust: NAT_LIGHT, payoff: NAT_LIGHT, weird: NAT_LIGHT, wide: WIDE_LIGHT, why: WHY_LIGHT, button: NAT_LIGHT, cover: NAT_LIGHT });

function initScenes2() {
  initNatron();
}
