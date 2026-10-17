// Can You ROLL Your Tongue? Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;
// the strongest of a list of pulses at time t: each is on for `len` seconds, with soft edges
const pulseOf = (t, times, len = 0.16) => times.reduce((m, f) => Math.max(m, clamp((t - f) / 0.03) * clamp((f + len - t) / 0.05)), 0);
// a decaying bump after a moment
const bumpAt = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the bathroom in the morning: the window is on the left (the key), the room behind him is out of focus
const MORN_LIGHT = { ...flipLight(LIGHTS.day), pool: 0.44, halo: 0.1, dof: 0.9 };
const BOOK_LIGHT = { ...LIGHTS.candle, pool: 0.32, halo: 0 };
const PHOTO_LIGHT = { ...LIGHTS.diagram };
const MAIL_LIGHT = { ...LIGHTS.screen, pool: 0.2, halo: 0 };

// ---------------------------------------------------------------- his faces
const MF = {
  // cross-eyed, down at his own tongue: trying
  try: { eyeOpen: 1.08, pupil: 0.92, lookX: 0, lookY: 1, browY: 0.9, browTilt: 0.55, mouth: 'none', mouthOpen: 0, blink: 0, cross: 1 },
  // trying HARD
  strain: { eyeOpen: 0.9, pupil: 0.95, lookX: 0, lookY: 1, browY: 0.4, browTilt: 1.15, mouth: 'none', mouthOpen: 0, blink: 0.12, cross: 1 },
  // up at us: your turn
  us: { eyeOpen: 1.12, pupil: 0.95, lookX: 0, lookY: 0, browY: 1.25, browTilt: -0.25, mouth: 'none', mouthOpen: 0, blink: 0, cross: 0 },
  // can't: deflated
  flat: { eyeOpen: 0.85, pupil: 1, lookX: 0, lookY: 0.15, browY: -0.1, browTilt: 0.85, mouth: 'none', mouthOpen: 0, blink: 0.4, cross: 0 },
  // a side-eye at the photo of his parents (screen left)
  side: { eyeOpen: 0.88, pupil: 1, lookX: -1, lookY: -0.1, browY: -0.4, browTilt: -0.95, mouth: 'none', mouthOpen: 0, blink: 0.3, cross: 0 },
  // the twin who can: smug
  proud: { eyeOpen: 1, pupil: 1, lookX: 0.6, lookY: 0, browY: 1.0, browTilt: -0.35, mouth: 'none', mouthOpen: 0, blink: 0.55, cross: 0 },
  // the twin who can't: a sad look at his brother
  sad: { eyeOpen: 1.0, pupil: 0.9, lookX: -0.9, lookY: 0.1, browY: 0.5, browTilt: 1.1, mouth: 'none', mouthOpen: 0, blink: 0.15, cross: 0 },
};

// his tongue's tries: both edges try to come up, OUT OF STEP (never together), on a clock that goes round a whole
// number of times in the Short (the squelches in audio.py use the same clock)
const wobW = () => loopW(2 * Math.PI * (cu().wob_hz || 2.2));
function wobble(t, amp, base, lag = 2.6) {
  const w = wobW() * t;
  return { kL: clamp(base + amp * Math.sin(w)), kR: clamp(base + amp * Math.sin(w + lag)) };
}

// ---------------------------------------------------------------- him at the mirror with his tongue out
// A: mirHero's description plus T (tongueFront's description); returns mirHero's points plus hp (head units -> world)
function tgHero(cam, t, A) {
  const B = Object.assign({}, A, { nose: A.nose || { nostK: 0.55 } });
  let tg = null;
  B.post = (lc, rr, s2) => {
    if (A.T) mirInHead(lc, s2, (c) => { tg = tongueFront(c, A.T, t); });
    if (A.post) A.post(lc, rr, s2);
  };
  const out = mirHero(cam, t, B);
  out.tg = tg;
  out.hp = (q) => mirHeadPt(out.st, q[0], q[1]);
  return out;
}
function mirDraw(t, o) {
  mirRoom(o.cam, t, { night: o.night });
  if (o.under) { applyCam(o.cam); o.under(); }
  const Hh = tgHero(o.cam, t, o.A);
  applyCam(o.cam);
  if (o.after) o.after(Hh);
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
  ctx.fillStyle = ink; ctx.fillText(txt, 0, 2);
  ctx.restore();
}
function okTick(x, y, r, k) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  circle(ctx, 0, 0, r + 6, '#FFFFFF'); circle(ctx, 0, 0, r, '#12B25C');
  ctx.beginPath(); ctx.moveTo(-r * 0.45, 0); ctx.lineTo(-r * 0.1, r * 0.36); ctx.lineTo(r * 0.5, -r * 0.34); ctx.lineWidth = r * 0.24; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#FFFFFF'; ctx.stroke();
  ctx.restore();
  softDot(gctx, x, y, r * 2.4, '#4DFFB4', 0.5 * clamp(k));
}
function noCross(x, y, r, k) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  circle(ctx, 0, 0, r + 6, '#FFFFFF'); circle(ctx, 0, 0, r, '#E8344A');
  for (const sd of [-1, 1]) line(ctx, -r * 0.38, sd * r * 0.38, r * 0.38, -sd * r * 0.38, r * 0.24, '#FFFFFF');
  ctx.restore();
}
// a four-point sparkle (screen space)
function sparkle(x, y, r, k, col = '#FFF6C8') {
  if (k <= 0.01) return;
  for (const [cc, rr, cl] of [[ctx, r, col], [gctx, r * 1.6, rgba(col, 0.6)]]) {
    cc.save(); cc.translate(x, y); cc.scale(k, k);
    cc.beginPath(); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, R = i % 2 ? rr * 0.28 : rr; cc.lineTo(Math.cos(a) * R, Math.sin(a) * R); } cc.closePath(); cc.fillStyle = cl; cc.fill();
    cc.restore();
  }
}
// motion marks beside a wobbling thing (screen space)
function wobTicks(x, y, s, t, k) {
  if (k <= 0.01) return;
  screenSpace();
  const ph = Math.sin(wobW() * t);
  for (const sd of [-1, 1]) for (let i = 0; i < 2; i++) {
    const xx = x + sd * (120 + i * 34) * s, yy = y + (ph * sd * 18 - 20 + i * 44) * s;
    for (const [cc, w, cl] of [[ctx, 15, '#0B0B1A'], [ctx, 8, '#FFFFFF'], [gctx, 16, 'rgba(255,255,255,0.4)']]) line(cc, xx, yy, xx + sd * 40 * s, yy - 14 * s, w * k, cl);
  }
}
// an octopus arm that curls up at its tip as k goes 0 -> 1 (octo units, about 300 long; its root at 0, 0, pointing down)
function octCurlArm(c, k, t, flip = 1) {
  const pts = [], n = 7;
  let x = 0, y = 0, a = Math.PI / 2 + 0.25 * flip * Math.sin(t * 2);
  for (let i = 0; i <= n; i++) {
    pts.push([x, y]);
    const seg = 48 * (1 - 0.05 * i), bend = (0.12 + 0.9 * k * (i / n) * (i / n)) * flip;
    a -= bend * (i > 2 ? 1 : 0.3);
    x += Math.cos(a) * seg; y += Math.sin(a) * seg;
  }
  return octArm(c, pts, 46, 12);
}

// ================================================================ the mirror: frame 1 and round it
// tt = seconds since frame 1 (negative = the last frames of the Short, on their way here)
function hookA(tt) {
  const c = cu();
  const flop = ramp(tt, c.cant - 0.1, c.cant + 0.12, E.outCubic);
  const amp = lerp(0.3, 0.42, ramp(tt, c.roll1 - 0.1, c.roll1 + 0.3)) * (1 - flop);
  const base = 0.4 * (1 - flop);
  const w = wobble(tt, amp, base);
  let face = MF.try;
  face = lerpFace(face, MF.strain, ramp(tt, c.roll1 - 0.1, c.roll1 + 0.2) * (1 - ramp(tt, c.try1 - 0.15, c.try1 + 0.1)));
  face = lerpFace(face, MF.us, ramp(tt, c.try1 - 0.15, c.try1 + 0.12));
  face = lerpFace(face, MF.flat, ramp(tt, c.cant - 0.08, c.cant + 0.15));
  face = lerpFace(face, MF.side, ramp(tt, c.blame - 0.15, c.blame + 0.1));
  face = { ...face, blink: Math.max(face.blink || 0, pulseOf(tt, [c.now1_end + 0.1], 0.12)) };
  const shudder = bumpAt(tt, c.cant, 5) * Math.sin((tt - c.cant) * 34);
  const T = { out: 1, kL: w.kL, kR: w.kR, flop, sway: 1.4 * Math.sin(tt * 3.1) * (1 - flop) + 4 * shudder };
  const A = {
    face, T,
    headDY: 1.0 * Math.sin(tt * 2.3) + 3 * flop, bob: Math.sin(tt * 2.3) + 4 * flop,
    headRot: -0.05 * ramp(tt, c.blame - 0.15, c.blame + 0.1),
  };
  return { A, photo: ramp(tt, c.dont - 0.12, c.dont + 0.12), eyesAway: ramp(tt, c.parents1 - 0.1, c.parents1 + 0.1) };
}
function hookCam(tt) {
  const c = cu();
  const k = camKeys(tt, [[-0.4, 540, 1080, 4.6], [0, 540, 1080, 4.7], [0.45, 540, 1084, 5.15], [c.try1, 540, 1076, 4.95], [c.now1_end, 540, 1076, 4.9],
    [c.cant, 540, 1086, 5.2], [c.dont - 0.05, 540, 1084, 5.1], [c.blame + 0.25, 494, 1066, 3.6], [c.parents1_end + 0.2, 492, 1066, 3.55]], E.inOutCubic);
  if (tt >= 0 && tt < 0.45) { const u = E.outCubic(tt / 0.45); k.zoom = lerp(4.7, 5.15, u); k.y = lerp(1080, 1084, u); }   // the first push is quick off the mark
  return k;
}

SC.hook = (lt, t, shot) => {
  const c = cu(), S = hookA(t), cam = hookCam(t);
  const Hh = mirDraw(t, { cam, A: S.A });
  // the tries: motion marks round his tongue until it flops
  const TS = toScreen(cam, ...Hh.hp([0, 76]));
  wobTicks(TS[0], TS[1], cam.zoom / 5, t, (1 - ramp(t, c.cant - 0.1, c.cant + 0.05)) * ramp(t, 0.15, 0.35));
  // Mum and Dad, both rolling perfect tubes
  parentsPhoto(262, 790, 1.0, t, { k: S.photo, look: S.eyesAway > 0.5 ? [1, -1] : [0.3, 0], eyes: S.eyesAway > 0.5 ? 'open' : 'smug' });
  tagPill('MOM + DAD', 262, 1012, '#FFD447', popK(t, c.blame, shot.end + 1, 0.12, 0.1), 36);
  return { glow: 0.85, flash: 0.06 * bumpAt(t, c.cant, 8) };
};

// ================================================================ inside the tongue: no bones, all muscle, like an octopus arm
const TONGUE_W = [540, 1107];                                  // the middle of his stuck-out tongue (world)
function macroState(t) {
  const c = cu();
  const w = wobble(t, 0.08, 0.06);
  let face = lerpFace(MF.side, MF.try, ramp(t, c.tongue2 - 0.2, c.tongue2 + 0.2));
  return { face, T: { out: 1, kL: w.kL, kR: w.kR, sway: 0.8 * Math.sin(t * 2.6) }, headDY: 0.6 * Math.sin(t * 2.3), bob: 0.6 * Math.sin(t * 2.3) };
}
SC.bones = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0;
  const M = macroState(t);
  const xr = ramp(t, c.bones - 0.3, c.bones + 0.05);
  M.T.xray = xr;
  M.T.noBone = ramp(t, c.bones - 0.05, c.bones + 0.25, E.outBack) * (1 - ramp(t, c.its_all - 0.15, c.its_all + 0.1));
  M.T.fib = { L: ramp(t, c.muscle - 0.05, c.muscle + 0.2), X: ramp(t, c.muscle + 0.2, c.muscle + 0.4), V: ramp(t, c.muscle_end - 0.15, c.muscle_end + 0.05) };
  // the dive: from the end of the hook into his tongue
  const c0 = hookCam(T0);
  const cam = camKeys(lt, [[0, c0.x, c0.y, c0.zoom], [0.75, 540, 1086, 8.1], [c.octopus - T0, 546, 1086, 8.35], [D, 548, 1087, 8.5]], E.inOutCubic);
  mirDraw(t, { cam, A: M });
  // the photo of his parents pops away as we go in
  parentsPhoto(262, 790, 1.0, t, { k: 1 - ramp(lt, 0, 0.18), look: [1, -1], eyes: 'open' });
  // labels
  tagPill('0 BONES', 228, 850, '#BFF0FF', popK(t, c.bones - 0.02, c.muscle - 0.06, 0.12, 0.1), 50);
  tagPill('ALL MUSCLE', 236, 850, '#FF86A6', popK(t, c.muscle - 0.02, shot.end + 1, 0.12, 0.1), 46);
  // three directions of muscle: small keys beside the tongue
  const fk = ramp(t, c.muscle - 0.05, c.muscle + 0.2);
  if (fk > 0.01) {
    screenSpace();
    const keys = [['LENGTHWAYS', '#FF7FA0', c.muscle], ['ACROSS', '#FFD447', c.muscle + 0.2], ['UP-DOWN', '#7FE9FF', c.muscle_end - 0.15]];
    keys.forEach(([txt, col, t0], i) => tagPill(txt, 220, 960 + i * 90, col, popK(t, t0, c.octopus - 0.1, 0.12, 0.12), 36));
  }
  // the octopus pops in and curls an arm the same way
  const ok = popK(t, c.octopus - 0.08, shot.end + 1, 0.22, 0.1);
  if (ok > 0.01) {
    screenSpace();
    const s = 0.64 * E.outBack(ok, 1.7);
    ctx.save(); ctx.translate(812, 700); ctx.rotate(0.12);
    octopus(ctx, 0, 0, s, { t, look: [-0.9, 0.6], face: t > c.arm ? 'grin' : 'wow', sway: 0.6 });
    ctx.save(); ctx.scale(s, s); ctx.translate(-70, 120);
    actor(() => octCurlArm(ctx, ramp(t, c.arm - 0.2, c.arm + 0.35, E.outBack), t, -1));
    ctx.restore();
    ctx.restore();
  }
  return { glow: 0.85, zblur: 0.18 * Math.sin(Math.PI * ramp(lt, 0, 0.75)), zcx: 540, zcy: 1100, flash: 0.08 * bumpAt(t, c.bones, 9), capY: 1560 };
};

// ================================================================ rolling: both edges up at once
// a split screen: on top, a slice of tongue in a panel (how a roll works: flat -> U -> tube); below, his own tongue
// trying, its edges coming up in turns (a seesaw), never together; at ONCE it gives up and flops
SC.roll = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0;
  const M = macroState(t);
  const see = ramp(t, c.curling - 0.1, c.curling + 0.2) * (1 - ramp(t, c.once + 0.1, c.once + 0.3));
  const ws = wobble(t, 0.45, 0.48, Math.PI);
  M.T.kL = lerp(M.T.kL, ws.kL, see); M.T.kR = lerp(M.T.kR, ws.kR, see);
  M.T.flop = ramp(t, c.once + 0.1, c.once + 0.3) * 0.8;
  M.T.glowEdges = popK(t, c.both - 0.05, c.once + 0.1, 0.12, 0.15);
  M.T.xray = 1 - ramp(lt, 0, 0.3);
  M.T.fib = { L: 1 - ramp(lt, 0, 0.3), X: 1 - ramp(lt, 0, 0.3), V: 1 - ramp(lt, 0, 0.3) };
  M.face = lerpFace(MF.strain, MF.flat, ramp(t, c.once + 0.1, c.once + 0.3));
  // the camera drops so the tongue sits in the lower half
  const cam = camKeys(lt, [[0, 548, 1087, 8.5], [0.5, 540, 1066, 7.4], [D, 540, 1068, 7.2]], E.inOutCubic);
  mirDraw(t, { cam, A: M });
  // the panel
  const pk = ramp(t, c.rolling - 0.12, c.rolling + 0.1);
  if (pk > 0.01) {
    screenSpace();
    const s = E.outBack(pk, 1.4), PY = 742;
    ctx.save(); ctx.translate(540, PY); ctx.scale(s, s);
    rrect(ctx, -440, -270, 880, 540, 46); ctx.fillStyle = '#2B1233'; ctx.fill();
    paint(() => { rrect(ctx, -440, -270, 880, 540, 46); ctx.lineWidth = 8; ctx.strokeStyle = '#FFB3C6'; ctx.stroke(); });
    ctx.restore();
    gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); rrect(gctx, 540 - 440 * s, PY - 270 * s, 880 * s, 540 * s, 46); gctx.fillStyle = '#000000'; gctx.fill(); gctx.restore();
    const sk = Math.max(0.62 * ramp(t, c.curling - 0.05, c.up, E.inOutCubic), ramp(t, c.once - 0.04, c.once + 0.16, E.outBack));
    // a small tongue, the same curl, with a dashed cut across it and an arrow to the slice
    screenSpace();
    ctx.save(); ctx.translate(540 - 300 * s, PY - 20 * s); ctx.scale(3.0 * s, 3.0 * s); ctx.translate(0, -77);
    tongueFront(ctx, { out: 1, kL: sk, kR: sk }, t);
    paint(() => {
      ctx.setLineDash([5, 4]); line(ctx, -30, 86, 30, 86, 2.6, '#FFFFFF'); ctx.setLineDash([]);
      for (const [w, col] of [[7, '#0B0B1A'], [3.4, '#FFFFFF']]) { ctx.beginPath(); ctx.moveTo(34, 86); ctx.lineTo(62, 86); ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.strokeStyle = col; ctx.stroke(); ctx.beginPath(); ctx.moveTo(54, 79); ctx.lineTo(63, 86); ctx.lineTo(54, 93); ctx.lineJoin = 'round'; ctx.stroke(); }
    });
    ctx.restore();
    tongueSlice(540 + 110 * s, PY + 10 * s, 230 * s, sk, t, { pop: 1, bare: true, edges: popK(t, c.both - 0.05, shot.end + 1, 0.12, 0.1), arrows: popK(t, c.both, c.once + 0.05, 0.12, 0.1) });
    tagPill('A SLICE OF TONGUE', 540, PY - 212, '#FFB3C6', popK(t, c.rolling, shot.end + 1, 0.12, 0.12), 34);
    tagPill('TUBE!', 650, PY + 200, '#4DFFB4', popK(t, c.once + 0.04, shot.end + 1, 0.12, 0.1), 46);
    okTick(880, PY - 160, 40, popK(t, c.once + 0.05, shot.end + 1, 0.12, 0.1));
  }
  // his: not at once
  const TS = toScreen(cam, ...TONGUE_W);
  noCross(TS[0] + 250, TS[1] - 20, 46, popK(t, c.once + 0.15, shot.end + 1, 0.12, 0.1));
  wobTicks(TS[0], TS[1], cam.zoom / 9, t, see);
  return { glow: 0.85, flash: 0.1 * bumpAt(t, c.once, 8), capY: 1560 };
};

// ================================================================ the school book
SC.book = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0;
  darkBg('#4A2E1C', '#120A06');
  screenSpace();
  // a wooden desk out of focus, and warm specks of light
  for (let i = 0; i < 8; i++) { const rng = mulberry32(60 + i); softDot(ctx, rng() * W, 300 + rng() * 1400, 120 + 160 * rng(), '#FFB070', 0.06); }
  const drop = ramp(t, c.school - 0.25, c.school + 0.12, ((x) => x));
  const land = bumpAt(t, c.school + 0.12, 7);
  schoolBook(t, {
    drop: drop < 1 ? E.inCubic(drop) : 1, push: 1 + 0.06 * (lt / D) + 0.015 * land,
    tree: ramp(t, c.books - 0.05, c.books + 0.25), arrows: ramp(t, c.get, c.parents2_end, E.inOutCubic), stamp: ramp(t, c.parents2 - 0.04, c.parents2 + 0.1),
  });
  // dust when it lands
  if (land > 0.02) for (let i = 0; i < 10; i++) { const rng = mulberry32(90 + i), u = 1 - land; softDot(ctx, 540 + (rng() - 0.5) * 1000 * (0.4 + u), 1240 + (rng() - 0.3) * 120 - 120 * u, 50 + 60 * u, '#FFF0DA', 0.35 * land); }
  return { glow: 0.85, flash: 0.12 * land, push: { k: 1 + 0.06 * ramp(t, c.get - 0.2, c.parents2_end, E.inOutCubic), cx: 540, cy: 900 } };
};

// ================================================================ identical twins: one could, one couldn't
SC.twins = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0;
  const cam = camKeys(lt, [[0, 540, 1066, 2.4], [c.same - T0, 540, 1062, 2.15], [c.one1 - T0 - 0.05, 540, 1062, 2.15], [c.could - T0 + 0.15, 444, 1074, 3.4], [c.one2 - T0 - 0.05, 444, 1074, 3.4], [c.couldnt - T0 + 0.15, 636, 1074, 3.4], [D, 638, 1076, 3.5]], E.inOutCubic);
  const inA = ramp(t, c.but - 0.3, c.identical, E.outCubic);
  // A: the twin who can (screen left); B: our hero (screen right)
  const rollA = ramp(t, c.could - 0.12, c.could + 0.1, E.outBack);
  const wA = wobble(t, 0.12 * (1 - rollA), 0.1);
  const seeB = ramp(t, c.couldnt - 0.15, c.couldnt + 0.05) * (1 - ramp(t, c.couldnt_end - 0.05, c.couldnt_end + 0.15));
  const wB = wobble(t, 0.45 * seeB + 0.08, 0.1 + 0.4 * seeB, Math.PI);
  const flopB = ramp(t, c.couldnt_end - 0.05, c.couldnt_end + 0.15);
  let fA = lerpFace(MF.us, MF.try, ramp(t, c.could - 0.3, c.could - 0.1)); fA = lerpFace(fA, MF.proud, ramp(t, c.could + 0.05, c.could + 0.25));
  let fB = lerpFace(MF.us, MF.strain, ramp(t, c.couldnt - 0.25, c.couldnt - 0.05)); fB = lerpFace(fB, MF.sad, ramp(t, c.couldnt_end - 0.05, c.couldnt_end + 0.15));
  fA = lerpFace(fA, { ...MF.us, lookX: 0.9 }, ramp(t, c.identical - 0.1, c.identical + 0.1) * (1 - ramp(t, c.could - 0.3, c.could - 0.1)));
  fB = lerpFace(fB, { ...MF.us, lookX: -0.9 }, ramp(t, c.identical - 0.1, c.identical + 0.1) * (1 - ramp(t, c.couldnt - 0.3, c.couldnt - 0.1)));
  mirRoom({ ...cam, x: cam.x + 270 }, t);
  const dxA = lerp(-650, -146, inA);
  const HA = tgHero(cam, t, { dx: dxA, face: fA, T: { out: 1, kL: Math.max(wA.kL, rollA), kR: Math.max(wA.kR, rollA), sway: 0.8 * Math.sin(t * 2.7) }, headDY: Math.sin(t * 2.3 + 1), bob: Math.sin(t * 2.3 + 1) });
  const HB = tgHero(cam, t, { dx: 146, face: fB, T: { out: 1, kL: wB.kL * (1 - flopB), kR: wB.kR * (1 - flopB), flop: flopB, sway: 0.8 * Math.sin(t * 2.5) }, headDY: Math.sin(t * 2.3) + 3 * flopB, bob: Math.sin(t * 2.3) + 3 * flopB });
  applyCam(cam);
  // labels
  tagPill('1952 TWIN STUDY', 540, 520, '#FFFFFF', popK(t, c.identical - 0.05, c.one1 - 0.1, 0.12, 0.1), 38);
  tagPill('7 OF 33 PAIRS DIFFERED', 540, 520, '#FFD447', popK(t, c.couldnt_end - 0.05, shot.end + 1, 0.12, 0.1), 38);
  const sg = popK(t, c.same - 0.05, c.one1 - 0.05, 0.12, 0.12);
  if (sg > 0.01) {   // SAME GENES: a bracket over both heads
    screenSpace();
    const a = toScreen(cam, ...HA.hp([0, -96])), b = toScreen(cam, ...HB.hp([0, -96]));
    for (const [w, col] of [[16, '#0B0B1A'], [8, '#FFD447']]) { ctx.beginPath(); ctx.moveTo(a[0], a[1] + 10); ctx.lineTo(a[0], a[1] - 30 * sg); ctx.lineTo(b[0], b[1] - 30 * sg); ctx.lineTo(b[0], b[1] + 10); ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = col; ctx.stroke(); }
    tagPill('SAME GENES', 540, Math.min(a[1], b[1]) - 74, '#FFD447', sg, 44);
  }
  const PA = toScreen(cam, ...HA.hp([60, 92])), PB = toScreen(cam, ...HB.hp([-60, 92]));
  okTick(PA[0], PA[1], 44, popK(t, c.could + 0.05, shot.end + 1, 0.12, 0.1));
  sparkle(PA[0] - 10, PA[1] - 120, 34, popK(t, c.could + 0.05, c.could + 0.6, 0.1, 0.2));
  noCross(PB[0], PB[1], 44, popK(t, c.couldnt_end - 0.05, shot.end + 1, 0.12, 0.1));
  const TB = toScreen(cam, ...HB.hp([0, 70]));
  wobTicks(TB[0], TB[1], cam.zoom / 4, t, seeB);
  return { glow: 0.85, flash: 0.2 * (1 - ramp(lt, 0, 0.12)) };
};

// ================================================================ the scientist behind it: embarrassed
SC.prof = (lt, t, shot) => {
  const c = cu();
  darkBg('#3A3024', '#0E0A06');
  const red = ramp(t, c.embarrassed - 0.05, c.embarrassed + 0.25);
  const face = lerpFace({ ...FACES.calm, mouth: 'grin', mouthOpen: 0.5, lookX: 0.4, lookY: -0.1, browY: 0.6 }, { ...FACES.nervous, lookX: -0.6, lookY: 0.5 }, red);
  sciPhoto(t, { k: ramp(lt, 0, 0.3), red, hide: ramp(t, c.embarrassed + 0.1, c.embarrassed + 0.45), face });
  tagPill('1940', 790, 1182, '#E6D2A8', popK(t, c.sci1 + 0.1, shot.end + 1, 0.12, 0.1), 46);
  return { glow: 0.85, flash: 0.18 * (1 - ramp(lt, 0, 0.12)), push: { k: 1 + 0.05 * ramp(lt, 0, shot.end - shot.start), cx: 540, cy: 760 } };
};

// ================================================================ the emails: am I adopted?
SC.email = (lt, t, shot) => {
  const c = cu();
  darkBg('#162A4E', '#060B18');
  screenSpace();
  for (let i = 0; i < 7; i++) { const rng = mulberry32(140 + i); softDot(ctx, rng() * W, 200 + rng() * 1500, 140 + 140 * rng(), '#5A8CFF', 0.06); }
  const send = ramp(t, c.adopted_end - 0.05, c.adopted_end + 0.1);
  mailWindow(t, {
    k: ramp(lt, 0, 0.3),
    subj: ramp(t, c.kids, c.sci2 + 0.2, ((x) => x)), body: ramp(t, c.asking - 0.1, c.adopted - 0.05, ((x) => x)),
    send, fly: ramp(t, c.adopted_end + 0.15, shot.end + 0.05, E.inCubic),
  });
  // the kid who sent it, in a round window: a flat tongue, worried; ADOPTED makes his eyes go wide
  const kk = ramp(lt, 0.15, 0.4);
  if (kk > 0.01) {
    screenSpace();
    const x = 246, y = 1148, r = 108, s = E.outBack(kk, 1.6);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fillStyle = '#2A4A7A'; ctx.fill();
    paint(() => {
      ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r - 3, 0, 7); ctx.clip();
      ctx.fillStyle = '#3A6AA8'; ctx.fillRect(-r, -r, 2 * r, 2 * r);
      bust(ctx, 0, -6, 60, '#FF6B6B', { ...PH_KID, k: 0, eyes: 'open', look: t > c.adopted ? [0, 0] : [0.6, -0.6] });
      ctx.restore();
      ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.lineWidth = 8; ctx.strokeStyle = '#BFF0FF'; ctx.stroke();
    });
    ctx.restore();
    sweatDrop(ctx, x + 84, y - 70, 1.0, popK(t, c.adopted - 0.05, shot.end + 1, 0.1, 0.1));
  }
  return { glow: 0.85, flash: 0.16 * (1 - ramp(lt, 0, 0.12)) + 0.1 * bumpAt(t, c.adopted, 8) };
};

// ================================================================ they're not
SC.fam = (lt, t, shot) => {
  const c = cu();
  darkBg('#5A2A3A', '#1A0810');
  famPhoto(540, 800, 1.55, t, { k: ramp(lt, 0, 0.22), hug: ramp(lt, 0.1, 0.4) });
  okTick(840, 520, 52, ramp(t, c.not - 0.02, c.not + 0.15));
  tagPill('NOT ADOPTED', 540, 1150, '#4DFFB4', ramp(t, c.not, c.not + 0.15), 50);
  return { glow: 0.85, flash: 0.2 * (1 - ramp(lt, 0, 0.12)) };
};

// ================================================================ the button: try again (it runs into frame 1)
SC.button = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0, H0 = hookA(-0.4);
  const out = ramp(t, c.try2 - 0.05, c.try2 + 0.2, E.outBack);
  const w = wobble(t, 0.3 * out, 0.4 * out);
  let face = lerpFace({ ...MF.us, browTilt: -0.6, browY: 0.2 }, MF.try, ramp(t, c.again - 0.1, c.again + 0.25));
  if (out < 0.05) face = { ...face, mouth: 'flat', mouthOpen: -0.3 };
  const A = { face: lerpFace(face, H0.A.face, ramp(t, shot.end - 0.25, shot.end)), T: { out: Math.max(0.02, out), kL: w.kL, kR: w.kR, sway: 1.4 * Math.sin(t * 3.1) }, headDY: Math.sin(t * 2.3), bob: Math.sin(t * 2.3) };
  if (out < 0.05) A.T = null;
  const cam = camKeys(lt, [[0, 540, 1066, 3.3], [Math.max(0.2, D - 0.5), 540, 1074, 3.9], [D, 540, 1080, 4.6]], E.inOutCubic);
  mirDraw(t, { cam, A });
  return { glow: 0.85, flash: 0.2 * (1 - ramp(lt, 0, 0.12)) };
};

SC.loop = (lt, t, shot) => {
  const tt = t - TLd.duration, S = hookA(tt), cam = hookCam(tt);
  const Hh = mirDraw(t, { cam, A: S.A });
  const TS = toScreen(cam, ...Hh.hp([0, 76]));
  wobTicks(TS[0], TS[1], cam.zoom / 5, t, 1);
  return { glow: 0.85 };
};

// ================================================================ the cover (rendered by src/cover.sh from a one-shot timeline)
SC.cover = (lt, t) => {
  const cam = { x: 540, y: 1092, zoom: 4.5, rot: 0 };
  const A = { face: MF.strain, T: { out: 1, kL: 0.95, kR: 0.15, sway: -2 }, headDY: 0 };
  mirDraw(0.4, { cam, A });
  screenSpace();
  bigWord('CAN YOU', 540, 1250, 150, '#FFFFFF', 1, -0.04);
  bigWord('ROLL IT?', 540, 1415, 180, '#FFD447', 1, -0.03);
  return { glow: 0.85, noCaptions: true };
};

setLights({ hook: MORN_LIGHT, loop: MORN_LIGHT, cover: MORN_LIGHT, bones: MORN_LIGHT, roll: MORN_LIGHT, book: BOOK_LIGHT, twins: MORN_LIGHT, prof: PHOTO_LIGHT, email: MAIL_LIGHT, fam: PHOTO_LIGHT, button: MORN_LIGHT });

function initScenes2() {
  initMirror();
}
