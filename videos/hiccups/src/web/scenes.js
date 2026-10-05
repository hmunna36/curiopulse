// Why Do We Get HICCUPS? Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;
// e^(-k (t - t0)) after t0, else 0
const decay = (t, t0, k) => (t >= t0 ? Math.exp(-(t - t0) * k) : 0);
// a hiccup's jolt: -1..1, ringing down after t0
const hicJ = (t, t0, k = 5, w = 17) => (t >= t0 ? Math.exp(-(t - t0) * k) * Math.cos((t - t0) * w) : 0);
function blinkAt(t, seed = 1, every = 3.1) { const p = ((t + seed * 1.37) % every) / every; return p > 0.955 ? 1 : 0; }
// the swallow's bob: a whole number of gulps fits the runtime, so the last frame meets the first
function gulpAt(t) { const D = TLd.duration; return Math.sin(2 * Math.PI * Math.round(3.6 * D) / D * t); }

const FACE_CHUG = Object.assign({}, FACES.calm, { blink: 1, browY: 1.1, browTilt: 0.5, mouth: 'flat', mouthOpen: 0.2 });
const FACE_AAH = Object.assign({}, FACES.grin, { blink: 1, browY: 0.9, browTilt: 0.3, mouthOpen: 0.75 });
const FACE_HIC = Object.assign({}, FACES.startled, { mouth: 'o', mouthOpen: 0.55, lookX: 0.5, lookY: 0.4, eyeOpen: 1.45 });
const FACE_DEAD = Object.assign({}, FACES.annoyed, { lookX: 0.95, lookY: 0.55, blink: 0.34, browY: 0.5, browTilt: 0.9, mouth: 'wavy', mouthOpen: 0.3, eyeOpen: 1.1 });
const FACE_SORRY = Object.assign({}, FACES.worried, { lookX: 0.9, lookY: 0.5, eyeOpen: 1.2, browY: 1.1, browTilt: 1.1 });
const FACE_SHEEP = Object.assign({}, FACES.grin, { lookX: 0.7, lookY: 0.35, browY: 0.9, browTilt: 0.8, mouthOpen: 0.55 });
const FACE_HUH = Object.assign({}, FACES.confused, { lookX: 0.95, lookY: 0.75, eyeOpen: 1.2, browY: 1.0, browTilt: 0.9 });
// where frame 1 is shot from: close on his face and the glass
const CAM_CHUG = [606, 848, 2.3];

// "GLUG" pops up beside his head on every swallow born between t0 and t1 (the same clock as gulpAt and audio.py's
// swallows, so the last frames meet the first). hs = his head on screen, z = the camera's zoom.
function glugWords(t, hs, z, t0, t1) {
  const P = TLd.duration / Math.round(3.6 * TLd.duration), k0 = Math.ceil(t0 / P - 1e-6);
  for (let k = k0 - 2; k * P <= t1 + 1e-6; k++) {
    if (k * P > t + 1e-6 || (k < k0 && t0 > 0)) continue;
    const age = t - k * P, u = age / 0.62;
    if (u >= 1) continue;
    const i = ((k % 2) + 2) % 2, sc = z / 2.3;                 // two columns, turn and turn about: they never overlap
    const x = hs[0] + (262 + 176 * i) * sc, y = hs[1] - (176 + 44 * i + 110 * u) * sc;
    ctx.save(); ctx.globalAlpha = (1 - u * u) * clamp(age / 0.04);
    bigWord('GLUG', x, y, 84 * sc, i ? '#FFD447' : '#FFFFFF', E.outBack(clamp(age / 0.13), 2.2), i ? 0.1 : -0.1);
    ctx.restore();
  }
}

// a puff of smoke (screen space): k 0..1 grows and fades
function poofCloud(x, y, k, seed = 1, col = '#F4FFE6', R = 230) {
  if (k <= 0 || k >= 1) return;
  const rng = mulberry32(seed);
  screenSpace();
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2 + rng() * 0.6, d = R * (0.25 + 0.75 * E.outCubic(k)) * (0.5 + 0.6 * rng()), r = (70 + 60 * rng()) * (1 - 0.45 * k);
    circle(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d * 0.8, r, rgba(col, 0.95 * (1 - k) * (1 - k * 0.3)));
  }
  circle(ctx, x, y, R * 0.7 * (1 - k * 0.5), rgba(col, 0.9 * (1 - k)));
  softDot(gctx, x, y, R * 1.3, col, 0.5 * (1 - k));
}

// ---------------------------------------------------------------- 1. hook: he chugs his soda across the table from his date ... HIC!
SC.hook = (lt, t, shot) => {
  const c = cu();
  const u = inv(0, c.lower, t);
  const chug = 1 - ramp(t, c.lower, c.lower + 0.34, E.inOutCubic);
  const j = hicJ(t, c.hic1), dj = decay(t, c.hic1, 4), hit = ramp(t, c.hic1, c.hic1 + 0.08);
  let face = lerpFace(FACE_CHUG, FACE_AAH, 1 - chug);
  face = lerpFace(face, FACE_HIC, hit);
  const [qx, qy] = shake(t, 16 * decay(t, c.hic1, 6), 30, 3);
  const cam = camKeys(t, [[0, ...CAM_CHUG], [0.5, 603, 850, 2.1], [c.soda_end - 0.1, 600, 852, 2.02], [c.date_end + 0.12, 552, 906, 1.16], [shot.end, 552, 900, 1.2]], E.inOutCubic);
  cam.sx = qx; cam.sy = qy;
  const out = t > c.hic1 + 0.1;                     // the candle is out
  const h = dnScene(cam, t, {
    warm: 1 - 0.3 * decay(t, c.hic1, 7),
    hero: {
      face, chug, u, level: lerp(0.88, 0.36, E.inOutSine(u)), gulp: gulpAt(t) * chug, headDY: 5 * gulpAt(t) * chug - 30 * j, headRot: -0.1 * chug + 0.04 * j,
      headDX: 4 * chug, jolt: j, frizz: 0.4 * dj, hold: [126, -196], glassRot: -0.1 + 0.3 * j, slosh: 0.5 * j, lean: -0.012 * chug,
    },
    candle: { lit: out ? 0 : 1, blow: ramp(t, c.hic1, c.hic1 + 0.1), smoke: out ? inv(c.hic1 + 0.1, c.hic1 + 2.6, t) : 0, jump: 16 * Math.abs(j) },
    vaseWob: 0.1 * hicJ(t, c.hic1 + 0.03, 3.5, 20), wineJump: 26 * Math.abs(hicJ(t, c.hic1 + 0.02, 6, 14)), wineTilt: 0.08 * j,
    date: { dy: -30 * decay(t, c.hic1, 7) * Math.abs(Math.cos((t - c.hic1) * 12)), rot: -0.06 * decay(t, c.hic1, 3) },
  });
  const hs = toScreen(cam, h.head[0], h.head[1]);
  screenSpace();
  glugWords(t, hs, cam.zoom, 0, c.lower - 0.2);
  if (t >= c.hic1) {
    if (h.rim) { const rs = toScreen(cam, h.rim[0], h.rim[1]); dnSplash(rs[0], rs[1], c.hic1, t, 18, 4, 640 * cam.zoom); }
    screenSpace();
    shockLines(hs[0], hs[1] + 30, 150 * cam.zoom, inv(c.hic1, c.hic1 + 0.45, t), 14, '#FFFFFF', 5);
    hicBurst('HIC!', Math.min(hs[0] + 262, 770), Math.max(hs[1] - 232, 560), springStep(t - c.hic1, 5.5, 0.42), t, 136);
  }
  return { glow: 0.85, flash: 0.13 * decay(t, c.hic1, 12), zblur: 0.05 * decay(t, 0.02, 7) + 0.05 * decay(t, c.hic1, 9), zcx: hs[0], zcy: hs[1] };
};

// ---------------------------------------------------------------- 2. smooth: his frozen face, the candle he just blew out
SC.smooth = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 512, y: 838, zoom: 1.84 + 0.1 * lt / D, rot: 0 };
  const toCam = ramp(t, c.smooth_end + 0.02, c.smooth_end + 0.2, E.inOutCubic);     // his eyes come round to us
  const face = Object.assign({}, FACE_DEAD, { lookX: lerp(0.95, 0, toCam), lookY: lerp(0.55, 0, toCam), blink: Math.max(0.34, blinkAt(t, 3, 1.9)) });
  const h = dnScene(cam, t, {
    hero: { face, hold: [126, -190], glassRot: -0.06, level: 0.3, headDX: -3 },
    candle: { lit: 0, smoke: inv(c.hic1 + 0.1, c.hic1 + 2.6, t) }, date: { rot: 0.05 * ramp(lt, 0.1, 0.7, E.inOutSine) },
  });
  // a drop of soda leaves his chin
  const drip = inv(shot.start + 0.2, shot.start + 0.85, t);
  applyCam(cam);
  if (drip > 0 && drip < 1) sweatDrop(ctx, h.mouth[0] + 4, h.mouth[1] + 44 + 150 * drip * drip, 0.62, 1 - drip * 0.3);
  sweatDrop(ctx, h.head[0] - 104, h.head[1] - 36 + 22 * ramp(lt, 0.1, 1.0), 0.8, ramp(lt, 0.05, 0.25));
  return { glow: 0.8, flash: 0.14 * (1 - ramp(lt, 0, 0.09)) };
};

// ---------------------------------------------------------------- 6. again: HIC! again. The subscribe aside plays over this shot
SC.again = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const j = hicJ(t, c.hic2), dj = decay(t, c.hic2, 4);
  const cover = ramp(t, c.hic2 + 0.28, c.hic2 + 0.52, E.outBack) * (1 - 0.55 * ramp(t, c.peek + 0.2, c.peek + 0.6));
  const pk = ramp(t, c.peek, c.peek + 0.3);                   // the tadpole comes up for a look
  const [qx, qy] = shake(t, 14 * decay(t, c.hic2, 6), 30, 11);
  const dive = ramp(t, shot.end - 0.3, shot.end, E.inCubic);
  const cam = camKeys(t, [[shot.start, 560, 906, 1.36], [c.sub_in, 566, 906, 1.4], [c.peek + 0.5, 622, 926, 1.74], [shot.end - 0.3, 630, 924, 1.8], [shot.end, 690, 826, 3.4]], E.inOutCubic);
  cam.sx = qx; cam.sy = qy;
  let face = lerpFace(FACE_HIC, FACE_SORRY, ramp(t, c.hic2 + 0.3, c.hic2 + 0.55));
  face = lerpFace(face, FACE_HUH, pk);
  face = Object.assign({}, face, { blink: Math.max(face.blink || 0, blinkAt(t, 4, 2.2) * (1 - pk)) });
  const tb = ((t - c.peek) % 1.3) > 1.2 ? 1 : 0;
  const h = dnScene(cam, t, {
    hero: {
      face, hold: [118, -206], glassRot: -0.08 + 0.22 * j, slosh: 0.4 * j, level: 0.62, jolt: j, frizz: 0.5 * dj, headDY: -28 * j, headRot: 0.04 * j + 0.05 * pk,
      headDX: 3 * pk, cover, tad: pk, tadLook: [-0.9, -0.5], tadBlink: tb && t > c.peek + 0.5,
    },
    candle: { lit: 0 }, vaseWob: 0.08 * hicJ(t, c.hic2 + 0.03, 3.5, 20), wineJump: 22 * Math.abs(hicJ(t, c.hic2 + 0.02, 6, 14)),
    date: { dy: -26 * decay(t, c.hic2, 7) * Math.abs(Math.cos((t - c.hic2) * 12)), rot: 0.05, shake: 0.6 * ramp(t, c.hic2 + 0.5, c.hic2 + 0.8) * (1 - ramp(t, c.peek - 0.4, c.peek)) },
  });
  const hs = toScreen(cam, h.head[0], h.head[1]), rs = toScreen(cam, h.rim[0], h.rim[1]);
  dnSplash(rs[0], rs[1], c.hic2, t, 14, 9, 560 * cam.zoom);
  if (t > c.peek) dnSplash(rs[0], rs[1] + 30, c.peek, t, 7, 12, 260 * cam.zoom);
  screenSpace();
  shockLines(hs[0], hs[1] + 30, 150 * cam.zoom, inv(c.hic2, c.hic2 + 0.45, t), 14, '#FFFFFF', 15);
  hicBurst('HIC!', Math.min(hs[0] + 250, 770), Math.max(hs[1] - 250, 548), springStep(t - c.hic2, 5.5, 0.42) * (1 - ramp(t, c.sub_in + 0.5, c.sub_in + 0.75)), t, 122);
  // "?" over his head when he sees who is in his drink
  const kq = ramp(t, c.peek + 0.25, c.peek + 0.45, E.outBack) * (1 - dive);
  if (kq > 0) bigWord('?', hs[0] - 150, hs[1] - 190, 150, '#FFD447', kq * (1 + 0.05 * Math.sin(t * 9)), -0.16);
  return { glow: 0.85, flash: 0.2 * decay(t, c.hic2, 12) + 0.25 * (1 - ramp(lt, 0, 0.08)), zblur: 0.06 * decay(t, c.hic2, 9) + 0.5 * dive, zcx: rs[0], zcy: rs[1] + 60 };
};

// ---------------------------------------------------------------- 9. button: not nervous ... part tadpole. HIC. The glass goes back up (loop)
SC.button = (lt, t, shot) => {
  const c = cu(), DUR = TLd.duration;
  const isTad = t >= c.poof && t < c.unpoof;
  const relax = ramp(t, c.nervous - 0.05, c.nervous + 0.3, E.inOutCubic);
  const back = ramp(t, c.unpoof + 0.04, c.loop, E.inOutCubic);            // the glass goes back to his mouth
  const j3 = hicJ(t, c.hic3, 6, 19);
  const [qx, qy] = shake(t, 10 * decay(t, c.hic3, 7) + 8 * decay(t, c.poof, 8), 30, 21);
  const cam = camKeys(t, [[shot.start, 548, 902, 1.28], [c.youre, 548, 898, 1.34], [c.poof, 550, 884, 1.46], [c.unpoof, 552, 880, 1.5], [c.loop, ...CAM_CHUG], [DUR, ...CAM_CHUG]], E.inOutCubic);
  cam.sx = qx; cam.sy = qy;
  let face = lerpFace(FACE_SORRY, FACE_SHEEP, relax);
  face = lerpFace(face, Object.assign({}, FACES.calm, { lookX: 0, lookY: 0, browY: 0.9, browTilt: -0.5, mouth: 'flat', mouthOpen: 0.4 }), ramp(t, c.youre - 0.05, c.youre + 0.25));
  face = lerpFace(face, FACE_HIC, ramp(t, c.unpoof, c.unpoof + 0.05) * (1 - back));
  face = lerpFace(face, FACE_CHUG, ramp(t, c.unpoof + 0.16, c.loop - 0.04));
  face = Object.assign({}, face, { blink: Math.max(face.blink || 0, blinkAt(t, 6, 2.4)) });
  const h = dnScene(cam, t, {
    hero: {
      face, cover: 1 - relax, shrug: 0.5 * Math.sin(Math.PI * ramp(t, c.nervous, c.nervous + 0.7)), hold: [126, -190], glassRot: -0.08, level: 0.88,
      chug: back, u: 0, gulp: gulpAt(t) * back, headDY: 5 * gulpAt(t) * back, headRot: -0.1 * back, headDX: 4 * back, lean: -0.012 * back,
      asTad: isTad ? 1 : 0, tadFace: { blink: blinkAt(t, 2, 0.9), lookX: 0.5, lookY: 0.2, mouthO: clamp(Math.abs(j3) * 1.5), hic: j3 },
      frizz: 0.4 * decay(t, c.unpoof, 9),
    },
    // the candle is alight again once it is out of frame: the last frames are the first frame
    candle: { lit: t >= c.loop - 0.06 ? 1 : 0 }, wineJump: 16 * Math.abs(hicJ(t, c.hic3 + 0.02, 6, 14)),
    date: { rot: 0.07 * ramp(t, c.poof + 0.1, c.poof + 0.5, E.inOutSine), shake: 0.7 * ramp(t, c.tadpole_end, c.tadpole_end + 0.2) * (1 - ramp(t, c.unpoof, c.unpoof + 0.2)) },
  });
  const hs = toScreen(cam, h.head[0], h.head[1]);
  applyCam(cam);
  for (const [dx, dy, ph] of [[-108, -30, 0], [96, -64, 0.5]]) {            // he sweats while he thinks he is the problem
    const p = ((t * 0.9 + ph) % 1);
    sweatDrop(ctx, h.head[0] + dx, h.head[1] + dy + 50 * p, 0.75, (1 - relax) * Math.sin(Math.PI * p));
  }
  // the glass on the table while he is a tadpole
  if (isTad) sodaGlass(ctx, DN.hx + 150, DN.tableY - 150, 1.3, 0, t, { level: 0.88 });
  screenSpace();
  poofCloud(hs[0], hs[1] + 80, inv(c.poof - 0.04, c.poof + 0.5, t), 3, '#E9FFD2', 250 * cam.zoom / 1.4);
  poofCloud(hs[0], hs[1] + 80, inv(c.unpoof - 0.03, c.unpoof + 0.4, t), 7, '#FFFFFF', 230 * cam.zoom / 1.4);
  if (isTad && t >= c.hic3) {                                               // the tadpole's hiccup: a bubble with a small word in it
    const d = t - c.hic3, bx = hs[0] + 150 + 30 * d, by = hs[1] + 20 - 300 * d;
    circle(ctx, bx, by, 26 + 60 * d, 'rgba(190,240,255,0.25)'); ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(220,250,255,0.9)'; ctx.beginPath(); ctx.arc(bx, by, 26 + 60 * d, 0, 7); ctx.stroke();
    hicBurst('hic', hs[0] + 240, hs[1] - 150, springStep(d, 6, 0.45), t, 84, '#4DFFB4', 0.12);
  }
  screenSpace();
  glugWords(t, hs, cam.zoom, c.loop - 0.3, DUR);
  const whip = ramp(t, c.unpoof + 0.1, c.loop - 0.04) * (1 - ramp(t, c.loop - 0.06, c.loop + 0.02));
  return { glow: 0.85, flash: 0.22 * decay(t, c.poof, 10) + 0.2 * decay(t, c.unpoof, 12), zblur: 0.1 * whip, zcx: hs[0], zcy: hs[1] };
};

// ---------------------------------------------------------------- the cover (rendered on its own, not in the timeline)
SC.cover = (lt, t, shot) => {
  const tt = 3.2, cam = { x: 560, y: 900, zoom: 1.5, rot: 0 };
  const h = dnScene(cam, tt, {
    hero: { face: Object.assign({}, FACE_HIC, { lookX: 0, lookY: 0, mouthOpen: 0.8 }), hold: [130, -200], glassRot: 0.16, slosh: 0.3, level: 0.78, jolt: 0.5, frizz: 0.6, headDY: -16 },
    candle: { lit: 1, blow: 0.7 }, date: false,
  });
  const hs = toScreen(cam, h.head[0], h.head[1]), rs = toScreen(cam, h.rim[0], h.rim[1]);
  dnSplash(rs[0], rs[1], 0, 0.16, 18, 4, 900);
  screenSpace();
  shockLines(hs[0], hs[1] + 20, 230, 0.35, 16, '#FFFFFF', 5);
  bigWord('WHY DO WE', 540, 468, 132, '#FFFFFF', 1, -0.03);
  hicBurst('HIC?!', 540, 1210, 1, 0.2, 190, '#FF5A6E', -0.05);
  return { glow: 0.85, noCaptions: true, noSubscribe: true, grain: 0 };
};

function initScenes2() {
  initDinner();
  if (typeof initChest === 'function') initChest();
  if (typeof initPond === 'function') initPond();
}
