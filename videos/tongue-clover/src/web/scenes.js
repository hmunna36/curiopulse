// Can You Make a Tongue CLOVER? ☘️ Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;
const pulseOf = (t, times, len = 0.16) => times.reduce((m, f) => Math.max(m, clamp((t - f) / 0.03) * clamp((f + len - t) / 0.05)), 0);
const bumpAt = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the bathroom in the morning: the window is on the left (the key), the room behind him is out of focus
const MORN_LIGHT = { ...flipLight(LIGHTS.day), pool: 0.44, halo: 0.1, dof: 0.9 };
const STAGE_LIGHT = { ...LIGHTS.lanterns, pool: 0.5 };
const BOARD_LIGHT = { ...LIGHTS.diagram };
setLights({ hook: MORN_LIGHT, answer: MORN_LIGHT, crowd: STAGE_LIGHT, again: MORN_LIGHT, wiring: BOARD_LIGHT, gym: STAGE_LIGHT,
  tricks: STAGE_LIGHT, sting: MORN_LIGHT, loop: MORN_LIGHT, cover: MORN_LIGHT });

// ---------------------------------------------------------------- his faces (the tongue is out: mouth 'none')
const MF = {
  try: { eyeOpen: 1.08, pupil: 0.92, lookX: 0, lookY: 1, browY: 0.9, browTilt: 0.55, mouth: 'none', mouthOpen: 0, blink: 0, cross: 1 },
  strain: { eyeOpen: 0.9, pupil: 0.95, lookX: 0, lookY: 1, browY: 0.4, browTilt: 1.15, mouth: 'none', mouthOpen: 0, blink: 0.12, cross: 1 },
  us: { eyeOpen: 1.12, pupil: 0.95, lookX: 0, lookY: 0, browY: 1.25, browTilt: -0.25, mouth: 'none', mouthOpen: 0, blink: 0, cross: 0 },
  flat: { eyeOpen: 0.85, pupil: 1, lookX: 0, lookY: 0.15, browY: -0.1, browTilt: 0.85, mouth: 'none', mouthOpen: 0, blink: 0.4, cross: 0 },
  card: { eyeOpen: 1.05, pupil: 1, lookX: 1, lookY: -0.35, browY: 0.9, browTilt: -0.3, mouth: 'none', mouthOpen: 0, blink: 0, cross: 0 },
  proud: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 1.0, browTilt: -0.35, mouth: 'none', mouthOpen: 0, blink: 0.5, cross: 0 },
  deadpan: { eyeOpen: 0.95, pupil: 1, lookX: -0.15, lookY: 0, browY: -0.35, browTilt: -0.6, mouth: 'none', mouthOpen: 0, blink: 0.52, cross: 0 },
};

// the tongue's wobble clock: a whole number of turns in the Short (the squelches in audio.py use the same clock)
const wobW = () => loopW(2 * Math.PI * (cu().wob_hz || 2.2));
function wobble(t, amp, base, lag = 2.6) {
  const w = wobW() * t;
  return { kL: clamp(base + amp * Math.sin(w)), kR: clamp(base + amp * Math.sin(w + lag)) };
}

// ---------------------------------------------------------------- him at the mirror with his tongue out
function tcHero(cam, t, A) {
  const B = Object.assign({ pal: TCPAL, noseK: 0.85 }, A, { nose: A.nose || { nostK: 0.55 } });
  let tg = null;
  B.post = (lc, rr, s2) => {
    if (A.T) mirInHead(lc, s2, (c) => { tg = tcTongue(c, A.T, t); });
    if (A.post) A.post(lc, rr, s2);
  };
  const out = mirHero(cam, t, B);
  out.tg = tg;
  out.hp = (q) => mirHeadPt(out.st, q[0], q[1]);
  return out;
}
function tcDraw(t, o) {
  tcRoom(o.cam, t);
  const Hh = tcHero(o.cam, t, o.A);
  applyCam(o.cam);
  return Hh;
}

// ---------------------------------------------------------------- small graphics (screen space)
function tagPill(txt, x, y, col, k, size = 40, ink = '#0B0B1A') {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + size * 0.9, h = size * 1.5;
  rrect(ctx, -w / 2 - 4, -h / 2 - 4, w + 8, h + 8, h / 2 + 4); ctx.fillStyle = '#0B0B1A'; ctx.fill();
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = col; ctx.fill();
  paint(() => { ctx.fillStyle = ink; ctx.fillText(txt, 0, 2); });
  ctx.restore();
}
function okTick(x, y, r, k) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  circle(ctx, 0, 0, r + 6, '#FFFFFF'); circle(ctx, 0, 0, r, '#12B25C');
  paint(() => { ctx.beginPath(); ctx.moveTo(-r * 0.45, 0); ctx.lineTo(-r * 0.1, r * 0.36); ctx.lineTo(r * 0.5, -r * 0.34); ctx.lineWidth = r * 0.24; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#FFFFFF'; ctx.stroke(); });
  ctx.restore();
  softDot(gctx, x, y, r * 2.4, '#4DFFB4', 0.5 * clamp(k));
}
function sparkle(x, y, r, k, col = '#FFF6C8') {
  if (k <= 0.01) return;
  for (const [cc, rr, cl] of [[ctx, r, col], [gctx, r * 1.6, rgba(col, 0.6)]]) {
    cc.save(); cc.translate(x, y); cc.scale(k, k);
    cc.beginPath(); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, R = i % 2 ? rr * 0.28 : rr; cc.lineTo(Math.cos(a) * R, Math.sin(a) * R); } cc.closePath(); cc.fillStyle = cl; cc.fill();
    cc.restore();
  }
}
// motion marks beside a straining thing (screen space)
function wobTicks(x, y, s, t, k) {
  if (k <= 0.01) return;
  screenSpace();
  const ph = Math.sin(wobW() * t);
  for (const sd of [-1, 1]) for (let i = 0; i < 2; i++) {
    const xx = x + sd * (120 + i * 34) * s, yy = y + (ph * sd * 18 - 20 + i * 44) * s;
    for (const [cc, w, cl] of [[ctx, 15, '#0B0B1A'], [ctx, 8, '#FFFFFF'], [gctx, 16, 'rgba(255,255,255,0.4)']]) line(cc, xx, yy, xx + sd * 40 * s, yy - 14 * s, w * k, cl);
  }
}
// a fat arrow (screen space): from (x, y) pointing at angle a, length L
function tcArrow(x, y, a, L, col, k) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s);
  for (const [w, cl] of [[24, '#0B0B1A'], [13, col]]) {
    ctx.beginPath(); ctx.moveTo(-L / 2, 0); ctx.lineTo(L / 2 - 10, 0); ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.strokeStyle = cl; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(L / 2 - 30, -24); ctx.lineTo(L / 2 + 4, 0); ctx.lineTo(L / 2 - 30, 24); ctx.lineJoin = 'round'; ctx.stroke();
  }
  ctx.restore();
}
// a little three-leaf clover icon (any context)
function cloverIcon(c, x, y, r, k = 1, col = '#3FCF5A') {
  if (k <= 0.01) return;
  c.save(); c.translate(x, y); c.scale(k, k);
  line(c, 0, r * 0.3, r * 0.35, r * 1.3, r * 0.18, '#2E8A3A');
  for (let i = 0; i < 3; i++) {
    const a = -Math.PI / 2 + i * (Math.PI * 2 / 3);
    c.save(); c.rotate(a + Math.PI / 2); c.translate(0, -r * 0.5);
    c.beginPath(); c.moveTo(0, r * 0.5); c.bezierCurveTo(-r * 0.95, -r * 0.1, -r * 0.45, -r * 0.85, 0, -r * 0.35);
    c.bezierCurveTo(r * 0.45, -r * 0.85, r * 0.95, -r * 0.1, 0, r * 0.5); c.fillStyle = col; c.fill();
    c.restore();
  }
  c.restore();
}

// ================================================================ the mirror: frame 1 and round it
// tt = seconds since frame 1 (negative = the last frames of the Short, on their way here)
function hookA(tt) {
  const c = cu();
  // rolled, the tip straining to flick up (small); "Roll it": the roll firms up; "flip the tip UP": the tip flips and the
  // sides let go (it won't do both); then the roll comes back and the tip drops: a taco again by the answer
  const firm = ramp(tt, c.roll1 - 0.05, c.roll1 + 0.22, E.outBack);
  const flip = ramp(tt, c.flip1 - 0.05, c.up1 + 0.05, E.inOutCubic) * (1 - ramp(tt, c.up1_end + 0.25, c.up1_end + 0.75, E.inOutCubic));
  const strain = 0.16 + 0.12 * Math.sin(wobW() * tt * 0.5);
  const w = wobble(tt, 0.06, 0.72 + 0.12 * firm);
  const sides = 1 - 0.85 * flip;
  let face = MF.try;
  face = lerpFace(face, MF.us, ramp(tt, c.clover1 - 0.1, c.clover1 + 0.1) * (1 - ramp(tt, c.roll1 - 0.12, c.roll1 + 0.05)));
  face = lerpFace(face, MF.strain, ramp(tt, c.flip1 - 0.1, c.flip1 + 0.1));
  face = lerpFace(face, MF.flat, ramp(tt, c.up1_end + 0.15, c.up1_end + 0.4));
  face = lerpFace(face, MF.us, ramp(tt, c.taco - 0.35, c.taco - 0.1));
  const T = { out: 1, kL: w.kL * sides, kR: w.kR * sides, fold: Math.max(strain * (1 - flip), 0.88 * flip), sway: 1.2 * Math.sin(tt * 3.1) };
  return { A: { face, T, headDY: 1.0 * Math.sin(tt * 2.3), bob: Math.sin(tt * 2.3) }, strainK: 1 - flip };
}
function hookCam(tt) {
  const c = cu();
  const k = camKeys(tt, [[-0.6, 540, 1086, 4.72], [0, 540, 1088, 4.78], [0.45, 540, 1090, 5.1], [c.clover1_end, 540, 1090, 5.12],
    [c.roll1, 540, 1094, 5.05], [c.up1, 540, 1098, 5.35], [c.taco - 0.1, 540, 1096, 5.3]], E.inOutCubic);
  if (tt >= 0 && tt < 0.45) { const u = E.outCubic(tt / 0.45); k.zoom = lerp(4.78, 5.1, u); k.y = lerp(1088, 1090, u); }
  return k;
}
SC.hook = (lt, t, shot) => {
  const c = cu(), S = hookA(t), cam = hookCam(t);
  const Hh = tcDraw(t, { cam, A: S.A });
  const TS = toScreen(cam, ...Hh.hp([0, 74]));
  wobTicks(TS[0], TS[1], cam.zoom / 5, t, S.strainK * (1 - ramp(t, c.up1_end + 0.5, c.taco - 0.2)));   // on from frame 0: the loop ends with them
  return { glow: 0.85, flash: 0.05 * bumpAt(t, c.up1, 8) };
};

// ================================================================ the answer: taco? join the club
SC.answer = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const w = wobble(t, 0.05, 0.86);
  let face = lerpFace(MF.us, MF.card, ramp(t, c.join - 0.1, c.join + 0.12));
  face = lerpFace(face, MF.proud, ramp(t, c.club - 0.08, c.club + 0.1));
  const A = { face, T: { out: 1, kL: w.kL, kR: w.kR, top: ramp(t, c.taco - 0.05, c.taco + 0.7), sway: 1.0 * Math.sin(t * 3.1) },
    headDY: Math.sin(t * 2.3), bob: Math.sin(t * 2.3), headRot: 0.04 * ramp(t, c.club - 0.1, c.club + 0.1) };
  const cam = camKeys(lt, [[0, 600, 1080, 3.3], [D, 598, 1082, 3.42]], E.inOutSine);
  tcDraw(t, { cam, A });
  tcCard(830, 700, 0.6, ramp(t, c.join - 0.06, c.join + 0.2), t, { rot: 0.08 });
  return { glow: 0.85 };
};

// ================================================================ the line-up: only one in seven can
let TC_CURTAIN = null;
function tcPaintCurtain() {
  const cv = mkCanvas(W, H), c = cv.getContext('2d');
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#5A0E22'); g.addColorStop(1, '#2A0612');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  for (let x = -40; x < W + 80; x += 90) {
    const gg = c.createLinearGradient(x, 0, x + 90, 0); gg.addColorStop(0, 'rgba(0,0,0,0.28)'); gg.addColorStop(0.5, 'rgba(255,120,140,0.16)'); gg.addColorStop(1, 'rgba(0,0,0,0.28)');
    c.fillStyle = gg; c.fillRect(x, 0, 90, H);
  }
  // the valance and the stage floor
  for (let x = -60; x < W + 120; x += 120) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 120, 0); c.lineTo(x + 120, 120); c.quadraticCurveTo(x + 60, 190, x, 120); c.closePath(); c.fillStyle = '#8A1430'; c.fill(); }
  rrect(c, -20, 1290, W + 40, 700, 0); c.fillStyle = '#6A3A22'; c.fill();
  for (let i = 0; i < 9; i++) line(c, 0, 1300 + i * 70, W, 1300 + i * 70, 3, 'rgba(0,0,0,0.25)');
  line(c, 0, 1292, W, 1292, 8, '#C9905A');
  return cv;
}
const TC_LINE = [[190, 860], [420, 860], [660, 860], [890, 860], [300, 1110], [540, 1110], [780, 1110]];
const TC_WIN = 2;   // the one who can: the third face
SC.crowd = (lt, t, shot) => {
  const c = cu();
  screenSpace(); ctx.drawImage(TC_CURTAIN, 0, 0);
  const ws = TC_LINE[TC_WIN];
  // a spotlight on the one who can
  const spot = ramp(t, c.one - 0.05, c.one + 0.15);
  softDot(gctx, ws[0], ws[1], 260, '#FFF2C8', 0.45 * spot); softDot(gctx, ws[0], ws[1] - 300, 420, '#FFE2A0', 0.18 * spot);
  const droop = ramp(t, c.can1 - 0.05, c.can1 + 0.3, E.outCubic);
  const looks = [[0.6, 0.3], [0.4, 0.2], [0, 0], [-0.5, 0.2], [0.3, -0.5], [0.1, -0.6], [-0.4, -0.5]];
  TC_LINE.forEach(([x, y], i) => {
    const k = ramp(lt, 0.02 + 0.045 * i, 0.2 + 0.045 * i);
    if (k <= 0.01) return;
    const win = i === TC_WIN, s = (win ? 104 : 88) * E.outBack(k, 1.8);
    const hair = ['cap', 'bun', 'cap', 'none', 'bun', 'cap', 'bun'][i], hc = ['#2A1B14', '#C45A2A', '#1A1A2A', '#5A3A2A', '#E8C060', '#7A4A2A', '#2A1B14'][i];
    const skin = ['#F2B892', '#E8A87C', '#C98A62', '#F6CBA8', '#8A5A3A', '#F2C49A', '#B07A52'][i];
    const lk = spot > 0.5 && !win ? [(ws[0] - x) / 300, (ws[1] - y) / 300] : looks[i];
    const wob = wobble(t + i * 0.13, 0.05, 0.8);
    const T = win ? { clover: 1, pop: ramp(t, c.one - 0.05, c.one + 0.2), sway: 0 } : { kL: wob.kL * (1 - 0.6 * droop), kR: wob.kR * (1 - 0.6 * droop), flop: 0.7 * droop, sway: 0.8 * Math.sin(t * 3 + i) };
    tcMini(ctx, x, y, s, { hair, hairCol: hc, skin, look: lk, eyes: win && spot > 0.5 ? 'smug' : 'open', glasses: i === 5 ? '#2A2A3A' : null, T, t });
    if (!win) sweatDrop(ctx, x + 70, y - 60, 0.9, popK(t, c.can1 + 0.05, shot.end + 1, 0.1, 0.1));
  });
  // a crown and sparkles on the one who can
  const cr = ramp(t, c.one, c.one + 0.25, E.outBack);
  if (cr > 0.01) {
    screenSpace();
    ctx.save(); ctx.translate(ws[0], ws[1] - 124); ctx.scale(cr, cr); ctx.rotate(0.12);
    ctx.beginPath(); ctx.moveTo(-44, 20); ctx.lineTo(-48, -22); ctx.lineTo(-22, 0); ctx.lineTo(0, -32); ctx.lineTo(22, 0); ctx.lineTo(48, -22); ctx.lineTo(44, 20); ctx.closePath();
    ctx.fillStyle = '#FFD447'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#8A5A00'; ctx.stroke();
    ctx.restore();
    softDot(gctx, ws[0], ws[1] - 124, 60, '#FFD447', 0.5 * cr);
    for (let i = 0; i < 4; i++) { const a = t * 1.5 + i * 1.57; sparkle(ws[0] + Math.cos(a) * 120, ws[1] + Math.sin(a) * 110, 18, cr * (0.6 + 0.4 * Math.sin(t * 9 + i))); }
  }
  // 1 in 7
  const bk = ramp(t, c.seven - 0.06, c.seven + 0.16);
  screenSpace();
  bigWord('1 IN 7', 540, 540, 170, '#4DFFB4', bk, -0.03);
  tagPill('374 ADULTS · 2020 STUDY', 540, 668, '#FFFFFF', bk, 30);
  cloverIcon(ctx, 868, 500, 44, bk * E.outBack(clamp(bk), 2));
  return { glow: 0.85, flash: 0.14 * (1 - ramp(lt, 0, 0.12)) };
};

// ================================================================ try again: tip up... sides flop?
SC.again = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const roll = ramp(t, c.try - 0.05, c.try + 0.3, E.outBack);
  const up = ramp(t, c.tip2 - 0.05, c.up2_end + 0.05, E.inOutCubic);
  const fall = ramp(t, c.sides - 0.05, c.sides + 0.45, E.outBounce);
  const w = wobble(t, 0.07, 0.8);
  const kk = roll * (1 - 0.94 * fall);
  let face = lerpFace(MF.us, MF.try, ramp(t, c.try + 0.1, c.try + 0.3));
  face = lerpFace(face, MF.strain, ramp(t, c.tip2 - 0.1, c.tip2 + 0.15));
  face = lerpFace(face, MF.flat, ramp(t, c.sides + 0.05, c.sides + 0.3));
  face = lerpFace(face, { ...MF.flat, lookY: 0, lookX: 0, blink: 0.3 }, ramp(t, c.flop - 0.05, c.flop + 0.15));
  const A = { face, T: { out: 1, kL: w.kL * kk, kR: w.kR * kk, fold: 0.9 * up, flop: 0.55 * fall, sway: 1.1 * Math.sin(t * 3.4) },
    headDY: Math.sin(t * 2.3) + 2 * fall, bob: Math.sin(t * 2.3) + 2 * fall };
  const cam = camKeys(lt, [[0, 512, 1072, 4.15], [c.tip2 - shot.start, 516, 1080, 4.35], [D, 520, 1088, 4.6]], E.inOutSine);
  const Hh = tcDraw(t, { cam, A });
  // the sides drop: two red arrows down beside the tongue
  const ak = popK(t, c.sides - 0.02, shot.end + 1, 0.12, 0.1);
  if (ak > 0.01) for (const sd of [-1, 1]) {
    const p = toScreen(cam, ...Hh.hp([sd * 34, 80]));
    tcArrow(p[0] + sd * 30, p[1] - 20, Math.PI / 2 + sd * 0.25, 130, '#FF5A6E', ak);
  }
  // the tip goes up: a yellow arrow over it
  const tk = popK(t, c.tip2 + 0.1, c.sides + 0.2, 0.12, 0.12);
  if (tk > 0.01) { const p = toScreen(cam, ...Hh.hp([0, 82])); tcArrow(p[0] + 150, p[1] - 30, -Math.PI / 2, 120, '#FFD447', tk); }
  return { glow: 0.85, flash: 0.12 * (1 - ramp(lt, 0, 0.1)) };
};

// ================================================================ the wiring: the same muscles, different wiring
// a board: YOU (a taco) and the CLOVER CHAMP side by side; both tongues turn see-through (the same three ways of muscle);
// then the nerves light: a tangle in yours, three neat wires in hers
const TC_YOU = [360, 720], TC_CH = [720, 720], TC_FS = 165;
SC.wiring = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, DIVE = Math.max(0.5, c.same - 0.13 - shot.start);
  if (lt < DIVE) {
    // the first look inside grows out of the scene: his own tongue turns see-through where it is, and the camera dives in
    const w = wobble(t, 0.06, 0.8);
    const A = { face: MF.try, headDY: Math.sin(t * 2.3), bob: Math.sin(t * 2.3),
      T: { out: 1, kL: w.kL, kR: w.kR, sway: 0.8 * Math.sin(t * 3), xray: ramp(lt, 0.04, 0.3),
        fib: { L: ramp(t, c.every - 0.05, c.every + 0.15), X: ramp(t, c.tongue3 - 0.05, c.tongue3 + 0.15), V: ramp(t, c.tongue3 + 0.15, c.tongue3 + 0.35) } } };
    const cam = camKeys(lt, [[0, 532, 1092, 4.9], [DIVE, 540, 1108, 7.8]], E.inCubic);
    tcDraw(t, { cam, A });
    return { glow: 0.85, zblur: 0.22 * ramp(lt, DIVE - 0.35, DIVE), zcx: 540, zcy: 1120, flash: 0.1 * (1 - ramp(lt, 0, 0.1)) + 0.4 * ramp(lt, DIVE - 0.08, DIVE) };
  }
  darkBg('#3A1240', '#0E0414');
  screenSpace();
  for (let i = 0; i < 6; i++) { const r = mulberry32(60 + i); softDot(ctx, r() * W, 300 + r() * 1300, 160 + 120 * r(), i % 2 ? '#FF7FA0' : '#7F9CFF', 0.07); }
  const cam = camKeys(lt, [[DIVE, 540, 868, 1.24], [c.same - shot.start + 0.4, 540, 884, 1.34], [c.wiring - shot.start, 540, 930, 1.72], [D, 540, 936, 1.78]], E.inOutCubic);
  applyCam(cam);
  const xr = ramp(t, c.every - 0.05, c.every + 0.35);
  const fib = ramp(t, c.same - 0.05, c.muscles + 0.1) * (1 - 0.75 * ramp(t, c.wiring - 0.1, c.wiring + 0.3));
  const wk = ramp(t, c.wiring - 0.08, c.wiring + 0.5);
  const w1 = wobble(t, 0.05, 0.8);
  tcMini(ctx, TC_YOU[0], TC_YOU[1], TC_FS, { hair: 'cap', hairCol: PAL.hair, skin: PAL.skin, look: wk > 0.3 ? [0, 1] : [0.7, 0.2], eyes: 'open',
    T: { kL: w1.kL, kR: w1.kR, xray: xr, fib: { L: fib, X: fib, V: fib }, wires: { tangle: wk }, sway: 0.6 * Math.sin(t * 3) }, t });
  tcMini(ctx, TC_CH[0], TC_CH[1], TC_FS, { hair: 'bun', hairCol: '#C45A2A', skin: '#E8A87C', look: [-0.5, 0.2], eyes: wk > 0.3 ? 'smug' : 'open', glasses: '#2A2A3A',
    T: { clover: 1, xray: xr, wires: { neat: wk } }, t });
  // labels
  screenSpace();
  const yk = ramp(lt, DIVE + 0.02, DIVE + 0.2) * (1 - ramp(t, c.the4 - 0.1, c.the4 + 0.05));
  const py = Math.max(430, toScreen(cam, 0, TC_YOU[1] - TC_FS - 60)[1]);
  tagPill('YOU', toScreen(cam, TC_YOU[0], 0)[0], py, '#FFD447', yk, 40);
  tagPill('CLOVER CHAMP', toScreen(cam, TC_CH[0], 0)[0], py, '#4DFFB4', yk, 34);
  tagPill('SAME MUSCLES', 540, 1095, '#7FE9FF', popK(t, c.same - 0.04, c.the4 - 0.08, 0.12, 0.1), 50);
  bigWord('=', 540, toScreen(cam, 540, 900)[1], 110 * cam.zoom / 1.2, '#FFFFFF', popK(t, c.same, c.the4 - 0.1, 0.12, 0.1));
  tagPill('DIFFERENT WIRING', 540, 1095, '#FF9A3C', ramp(t, c.wiring - 0.04, c.wiring + 0.1), 50);
  // a red buzz round the tangle, a tick for the neat wires
  const tp = toScreen(cam, TC_YOU[0], TC_YOU[1] + (TG_Y0 + 13) * TC_FS / 70);
  shockLines(tp[0], tp[1], 90, popK(t, c.wiring + 0.15, c.different_end + 0.2, 0.1, 0.1) * 0.999, 10, '#FF5A6E', 3);
  const hp = toScreen(cam, TC_CH[0] + 120, TC_CH[1] + 40);
  okTick(hp[0], hp[1], 34, ramp(t, c.different - 0.05, c.different + 0.15));
  return { glow: 0.9, flash: 0.35 * (1 - ramp(lt, DIVE, DIVE + 0.14)) + 0.06 * bumpAt(t, c.wiring, 8) };
};

// ================================================================ the gymnast: scientists suspect that's what makes a tongue a gymnast
SC.gym = (lt, t, shot) => {
  const c = cu();
  tcArena(t, { flash: t > c.gymnast, beamY: 1080 });
  const beam = 1080, s = 3.0;
  const crouch = ramp(t, c.thats - 0.05, c.makes + 0.1) * (1 - ramp(t, c.tongue4 - 0.12, c.tongue4 - 0.02));
  const jump = ramp(t, c.tongue4 - 0.1, c.gymnast + 0.02);
  const air = jump > 0 && jump < 1;
  const land = ramp(t, c.gymnast - 0.02, c.gymnast + 0.15);
  const hy = air ? -300 * Math.sin(Math.PI * jump) : 0;
  const rot = air ? -Math.PI * 2 * E.inOutSine(jump) : 0;
  const pose = air ? 'tuck' : crouch > 0.5 ? 'crouch' : 'stand';
  const by = beam - 14 - 52 * s * (pose === 'crouch' ? 0.82 : 1);
  // its shadow on the beam
  screenSpace(); ellipse(ctx, 540, beam - 10, 70 * (1 - 0.4 * Math.sin(Math.PI * clamp(jump))), 9, 'rgba(0,0,0,0.3)');
  tcGym(ctx, 540, by + hy + (air ? -40 : 0), s, { t, pose, rot, clover: land, arms: air ? 0.8 : land > 0.5 ? 1 : lerp(0.25, 0.9, popK(lt, 0, c.suspect - shot.start + 0.4, 0.15, 0.2)),
    look: land > 0.5 ? [0, 0] : [0.3, -0.2], smile: land, brow: crouch, wink: land > 0.5 && t > c.gymnast + 0.4 });
  for (let i = 0; i < 5; i++) { const a = t * 2 + i * 1.26; sparkle(540 + Math.cos(a) * 230, 800 + Math.sin(a) * 170, 26, land * (0.6 + 0.4 * Math.sin(t * 8 + i))); }
    tagPill('SCIENTISTS SUSPECT…', 540, 470, '#C8A8FF', ramp(lt, 0.05, 0.22), 42);
  for (const [i, x] of [[0, 300], [1, 540], [2, 780]]) tcScore(x, 1560, 0.9, ramp(t, c.gymnast + 0.2 + 0.12 * i, c.gymnast + 0.4 + 0.12 * i), '10');
  return { glow: 0.95, flash: 0.1 * (1 - ramp(lt, 0, 0.1)) + 0.12 * bumpAt(t, c.gymnast, 7) };
};

// ================================================================ the champ's tricks: roll, fold, twist, twist... clover
SC.tricks = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#3A2408', '#120802');
  screenSpace();
  for (let i = 0; i < 7; i++) { const r = mulberry32(90 + i); softDot(ctx, r() * W, 200 + r() * 1400, 140 + 140 * r(), '#FFB45A', 0.09); }
  softDot(gctx, 540, 760, 420, '#FFE2A0', 0.22);
  const beats = [c.people, c.most, c.tongue5, c.tricks, c.too];
  const on = (i) => ramp(t, beats[i] - 0.06, beats[i] + 0.12, E.outBack);
  const stage = beats.reduce((n, b) => (t >= b - 0.06 ? n + 1 : n), 0);
  const T = { out: 1, kL: 0, kR: 0, sway: 0 };
  if (stage === 1) { T.kL = T.kR = 0.9 * on(0); }
  if (stage === 2) { T.fold = 0.95 * on(1); }
  if (stage === 3) { T.kL = T.kR = 0.2; T.twist = on(2); }
  if (stage === 4) { T.kL = T.kR = 0.2; T.twist = -on(3); }
  if (stage >= 5) { T.clover = 1; T.pop = ramp(t, c.too - 0.06, c.too + 0.2); }
  const cam = camKeys(lt, [[0, 540, 940, 1.22], [D, 540, 948, 1.3]], E.inOutSine);
  applyCam(cam);
  tcMini(ctx, 540, 800, 236, { hair: 'bun', hairCol: '#C45A2A', skin: '#E8A87C', look: [0, -0.1], eyes: stage >= 5 ? 'smug' : 'open', glasses: '#2A2A3A', T, t });
  // the tick row
  screenSpace();
  const names = ['ROLL', 'FOLD', 'TWIST', 'TWIST'];
  names.forEach((nm, i) => {
    const y = 560 + i * 92, k = on(i);
    tagPill(nm, 150, y, '#FFFFFF', k, 30);
    okTick(258, y, 20, ramp(t, beats[i] + 0.05, beats[i] + 0.2));
  });
  const ck = ramp(t, c.too - 0.05, c.too + 0.2);
  for (let i = 0; i < 6; i++) { const a = i * 1.05 + t; sparkle(540 + Math.cos(a) * 330, 1060 + Math.sin(a) * 150, 26, ck * (0.7 + 0.3 * Math.sin(t * 9 + i))); }
  cloverIcon(ctx, 850, 960, 54, ck);
  return { glow: 0.9, flash: 0.08 * bumpAt(t, c.too, 8), capY: 1500 };
};

// ================================================================ the sting: show-offs
SC.sting = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const w = wobble(t, 0.05, 0.8);
  const flop = ramp(t, c.show - 0.05, c.show + 0.4, E.outCubic);
  const A = { face: lerpFace(MF.flat, MF.deadpan, ramp(lt, 0, 0.2)), T: { out: 1, kL: w.kL * (1 - 0.5 * flop), kR: w.kR * (1 - 0.5 * flop), flop: 0.45 * flop, sway: 0.6 * Math.sin(t * 2.6) },
    headDY: Math.sin(t * 2.3), bob: Math.sin(t * 2.3) };
  const cam = camKeys(lt, [[0, 566, 1052, 3.55], [D, 562, 1056, 3.7]], E.inOutSine);
  tcDraw(t, { cam, A });
  return { glow: 0.85, flash: 0.12 * (1 - ramp(lt, 0, 0.1)) };
};

// ================================================================ the button: now flip the tip FIRST (it runs into frame 1)
SC.loop = (lt, t, shot) => {
  const c = cu(), Dend = TLd.duration, tt = t - Dend;
  const H0 = hookA(tt), C0 = hookCam(tt);
  const blend = ramp(t, Dend - 0.95, Dend - 0.3, E.inOutCubic);
  // tip first: up it goes with the sides flat; then the sides try to come up and the tip slips back down
  const tipUp = ramp(t, c.flip3 - 0.05, c.tip3 + 0.2, E.outBack) * (1 - 0.75 * ramp(t, c.first + 0.1, c.first + 0.5, E.inOutCubic));
  const sidesUp = ramp(t, c.first - 0.05, c.first + 0.45, E.inOutCubic);
  const w = wobble(t, 0.06, 0.74 * sidesUp);
  let face = lerpFace(MF.us, MF.try, ramp(t, c.flip3 - 0.1, c.flip3 + 0.1));
  face = lerpFace(face, MF.strain, ramp(t, c.first - 0.1, c.first + 0.15));
  const A1 = { face, T: { out: 1, kL: w.kL, kR: w.kR, fold: 0.88 * tipUp + 0.16 * (1 - tipUp) * sidesUp, sway: 1.2 * Math.sin(t * 3.1) }, headDY: Math.sin(t * 2.3), bob: Math.sin(t * 2.3) };
  const A = {
    face: lerpFace(A1.face, H0.A.face, blend),
    T: { out: 1, kL: lerp(A1.T.kL, H0.A.T.kL, blend), kR: lerp(A1.T.kR, H0.A.T.kR, blend), fold: lerp(A1.T.fold, H0.A.T.fold, blend), sway: lerp(A1.T.sway, H0.A.T.sway, blend) },
    headDY: lerp(A1.headDY, H0.A.headDY, blend), bob: lerp(A1.bob, H0.A.bob, blend),
  };
  const cam0 = camKeys(lt, [[0, 548, 1076, 4.1], [Math.max(0.3, Dend - shot.start - 0.95), 544, 1084, 4.5]], E.inOutSine);
  const cam = { x: lerp(cam0.x, C0.x, blend), y: lerp(cam0.y, C0.y, blend), zoom: lerp(cam0.zoom, C0.zoom, blend), rot: 0 };
  const Hh = tcDraw(t, { cam, A });
  const TS = toScreen(cam, ...Hh.hp([0, 74]));
  wobTicks(TS[0], TS[1], cam.zoom / 5, t, H0.strainK * blend);
  return { glow: 0.85, flash: 0.1 * (1 - ramp(lt, 0, 0.1)) };
};

// ================================================================ the cover (rendered by src/cover.sh from a one-shot timeline)
SC.cover = (lt, t) => {
  const cam = { x: 540, y: 1084, zoom: 6.0, rot: 0 };
  const A = { face: { ...MF.us, browY: 1.5, eyeOpen: 1.2 }, T: { out: 1, clover: 1, pop: 1 }, headDY: 0 };
  const Hh = tcDraw(0.4, { cam, A });
  screenSpace();
  const p = toScreen(cam, ...Hh.hp([0, 80]));
  for (let i = 0; i < 5; i++) { const a = i * 1.26 + 0.4; sparkle(p[0] + Math.cos(a) * 330, p[1] + Math.sin(a) * 200, 30, 1); }
  bigWord('CAN YOU', 540, 1420, 150, '#FFFFFF', 1, -0.04);
  bigWord('DO THIS?', 540, 1590, 180, '#4DFFB4', 1, -0.03);
  return { glow: 0.85, noCaptions: true };
};

function initScenes2() {
  initTc();
  TC_CURTAIN = tcPaintCurtain();
  TC_HALL = tcPaintHall();
}
