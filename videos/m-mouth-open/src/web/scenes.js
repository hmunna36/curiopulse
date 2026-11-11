// Why Can't You Say "M" With Your Mouth OPEN? 👄 Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds
// inside the shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;
const bumpAt = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);
const mmL2 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the dentist's room: the window on the right is the key, the dental lamp's warm glow on the left; the wall falls soft
const CLINIC_LIGHT = { ...LIGHTS.day, pool: 0.4, halo: 0.1, dof: 0.85 };
// inside: the glass head on a dark field
const SEC_LIGHT = { ...LIGHTS.diagram, rim: [0.6, 0.9, 1.0], rimAmt: 0.6 };
// the club: a spotlight from the top left is the key, the pink neon behind him is the rim
const STAGE_LIGHT = { ...LIGHTS.lanterns, key: [-0.45, -0.72, 0.55], keyTint: [1.08, 1.02, 0.94], rimFrom: [0.9, -0.3], rim: [1.0, 0.42, 0.78], rimAmt: 1.3, haloColor: [1.0, 0.6, 0.85], halo: 0.12, pool: 0.64 };
setLights({ hook: CLINIC_LIGHT, answer: CLINIC_LIGHT, buzz: CLINIC_LIGHT, spill: SEC_LIGHT, dentist: CLINIC_LIGHT, vent: STAGE_LIGHT,
  loop: CLINIC_LIGHT, cover: CLINIC_LIGHT });

// ---------------------------------------------------------------- his faces
const MF = {
  wide: { eyeOpen: 1.1, pupil: 0.9, lookX: 0.1, lookY: -0.3, browY: 0.8, browTilt: 0.3, mouth: 'yawn', mouthOpen: 1, blink: 0, cross: 0, jaw: 1, squeeze: 0, tear: 0 },
  think: { eyeOpen: 1.12, pupil: 0.9, lookX: -0.3, lookY: -0.9, browY: 1.0, browTilt: 0.1, mouth: 'yawn', mouthOpen: 1, blink: 0, cross: 0, jaw: 1, squeeze: 0, tear: 0 },
  strain: { eyeOpen: 0.95, pupil: 0.9, lookX: 0, lookY: 0.5, browY: 0.35, browTilt: 1.25, mouth: 'yawn', mouthOpen: 1, blink: 0.1, cross: 0.6, jaw: 1, squeeze: 0.3, tear: 0 },
  shock: { eyeOpen: 1.32, pupil: 0.62, lookX: 0, lookY: 0, browY: 1.45, browTilt: 0.3, mouth: 'yawn', mouthOpen: 1, blink: 0, cross: 0, jaw: 1, squeeze: 0, tear: 0 },
  hum: { eyeOpen: 1.05, pupil: 1, lookX: 0, lookY: 0.7, browY: 0.9, browTilt: 0.15, mouth: 'none', mouthOpen: 0, blink: 0, cross: 1, jaw: 0 },
  joy: { eyeOpen: 1.2, pupil: 0.82, lookX: 0, lookY: 0.4, browY: 1.3, browTilt: -0.25, mouth: 'none', mouthOpen: 0, blink: 0, cross: 1, jaw: 0 },
  feel: { eyeOpen: 1.15, pupil: 0.9, lookX: 0.2, lookY: 0.2, browY: 1.1, browTilt: -0.1, mouth: 'none', mouthOpen: 0, blink: 0, cross: 0, jaw: 0 },
  answer: { eyeOpen: 1.15, pupil: 0.9, lookX: 0.85, lookY: -0.2, browY: 1.2, browTilt: 0.5, mouth: 'yawn', mouthOpen: 1, blink: 0, cross: 0, jaw: 1, squeeze: 0, tear: 0 },
  grin: { eyeOpen: 1.05, pupil: 1, lookX: 0, lookY: 0, browY: 0.7, browTilt: -0.2, mouth: 'grimace', mouthOpen: 1, blink: 0, cross: 0, jaw: 0 },
  grinWorry: { eyeOpen: 1.25, pupil: 0.75, lookX: 0, lookY: 0, browY: 1.1, browTilt: 1.1, mouth: 'grimace', mouthOpen: 1, blink: 0, cross: 0, jaw: 0 },
  grinSmug: { eyeOpen: 0.9, pupil: 1, lookX: 0.6, lookY: 0, browY: 0.5, browTilt: -0.6, mouth: 'grimace', mouthOpen: 1, blink: 0.15, cross: 0, jaw: 0 },
  grinTry: { eyeOpen: 1.1, pupil: 0.9, lookX: 0.6, lookY: 0.1, browY: 0.9, browTilt: 0.8, mouth: 'grimace', mouthOpen: 1, blink: 0, cross: 0, jaw: 0 },
};

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
// a speech bubble with a tail toward (tx, ty) (screen space)
function mmBubble(txt, x, y, k, o = {}) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.3), size = o.size || 84;
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s);
  ctx.font = `400 ${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + size * 0.9, h = size * 1.42;
  const tx = ((o.tx === undefined ? x - 120 : o.tx) - x) / s, ty = ((o.ty === undefined ? y + 160 : o.ty) - y) / s;
  for (const pass of [0, 1]) {
    ctx.beginPath(); ctx.moveTo(-w * 0.14 + (tx > 0 ? w * 0.2 : 0), h / 2 - 8); ctx.lineTo(tx, ty); ctx.lineTo(w * 0.06 + (tx > 0 ? w * 0.2 : 0), h / 2 - 8); ctx.closePath();
    rrect(ctx, -w / 2, -h / 2, w, h, h / 2);
    if (pass === 0) { ctx.lineWidth = 14; ctx.lineJoin = 'round'; ctx.strokeStyle = '#0B0B1A'; ctx.stroke(); }
    else { ctx.fillStyle = o.bg || '#FFFFFF'; ctx.fill(); }
  }
  paint(() => {
    if (o.outline) { ctx.lineWidth = size * 0.12; ctx.lineJoin = 'round'; ctx.strokeStyle = '#0B0B1A'; ctx.strokeText(txt, 0, 4); }
    ctx.fillStyle = o.col || '#0B0B1A'; ctx.fillText(txt, 0, 4);
  });
  ctx.restore();
}
// letters flying out of a point on screen (deterministic; mmLetters in mm_section.js does the work)
function mmScreenLetters(ch, at, dir, k, t, o) {
  if (k <= 0.01) return;
  screenSpace();
  mmLetters(ctx, ch, at, dir, k, t, o);
}
// zigzag buzz marks round a point (screen space)
function mmBuzzMarks(P, R, k, t) {
  if (k <= 0.01) return;
  screenSpace();
  for (let i = 0; i < 6; i++) {
    const sd = i < 3 ? -1 : 1, a0 = [0.05, 0.35, 0.65][i % 3], a = (sd < 0 ? Math.PI - a0 : a0) + 0.05 * Math.sin(t * 40 + i), r0 = R, r1 = R + 120 * k;
    const pts = [];
    for (let j = 0; j <= 4; j++) { const rr = lerp(r0, r1, j / 4), off = (j % 2 ? 1 : -1) * 14 * k; pts.push([P[0] + Math.cos(a) * rr - Math.sin(a) * off, P[1] + Math.sin(a) * rr + Math.cos(a) * off]); }
    for (const [cc, w, col] of [[ctx, 20, '#0B0B1A'], [ctx, 11, '#FF9A3C'], [gctx, 18, 'rgba(255,170,80,0.5)']]) poly(cc, pts, w * k, col);
  }
}

// ---------------------------------------------------------------- the dentist's room, drawn round him
// o: {cam, A, lamp: [x, y] | null, dy (the wall's camera height), dentist: {...}, front}
function clinicDraw(t, o) {
  const cam = o.cam;
  mmWall(cam, t, { dy: o.dy || 0 });
  applyCam(cam);
  if (o.dentist) mmDentist(ctx, o.dentist.x, o.dentist.y, o.dentist.s, o.dentist);
  if (o.lamp !== null) mmLamp(cam, t, { at: o.lamp || [MMH.head[0] - 150, MMH.head[1] - 250] });
  mmChairBack(cam);
  applyCam(cam);
  const Hh = mmHero(cam, t, o.A);
  applyCam(cam);
  if (o.front) mmChairFront(cam);
  return Hh;
}

// ================================================================ the hook: frame 1 and round it (valid at negative time)
// tt = seconds since frame 1 (negative = the last frames of the Short, on their way here)
function hookA(tt) {
  const c = cu();
  let face = MF.wide;
  face = lerpFace(face, MF.think, ramp(tt, c.now1 - 0.1, c.now1 + 0.15) * (1 - ramp(tt, c.mmm - 0.12, c.mmm + 0.05)));
  face = lerpFace(face, MF.strain, ramp(tt, c.mmm - 0.1, c.mmm + 0.12));
  const insp = Math.sin(tt * 2.2);
  const A = { face, headDY: 0.8 * Math.sin(tt * 2.0), headRot: 0.012 * Math.sin(tt * 1.3) - 0.03 * ramp(tt, c.mmm, c.mmm + 0.4) * (1 - ramp(tt, c.mmm_end, c.mmm_end + 0.3)),
    mirror: { k: 1, x: -4 + 3 * insp, y: -12 + 2 * Math.sin(tt * 3.1), ang: -0.2 } };
  return { A, aah: popK(tt, c.mmm + 0.05, c.mmm_end + 0.35, 0.1, 0.25) };
}
function hookCam(tt) {
  const k = camKeys(tt, [[-1, 532, 1452, 4.5], [0, 532, 1452, 4.5], [3.9, 534, 1458, 4.72]], E.inOutSine);
  return k;
}
SC.hook = (lt, t, shot) => {
  const c = cu(), S = hookA(t), cam = hookCam(t);
  const Hh = clinicDraw(t, { cam, A: S.A, dy: 0 });
  // what comes out when he tries: AAAH, never an M
  const mo = toScreen(cam, ...Hh.hp([-26, 62]));
  mmScreenLetters('A', [mo[0] - 20, mo[1]], -2.75, S.aah, t, { rate: 4.4, size: 150, col: '#FFD447', dist: 250, rise: 60, spread: 0.2, life: 0.9 });
  sweatDrop(ctx, toScreen(cam, ...Hh.hp([58, -30]))[0], toScreen(cam, ...Hh.hp([58, -30]))[1], 1.6, popK(t, c.mmm + 0.3, shot.end + 1, 0.15, 0.1));
  return { glow: 0.85 };
};

// ================================================================ the answer: can't? M is a hum that comes out your NOSE
SC.answer = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const out = ramp(t, c.cant - 0.06, c.cant + 0.32, E.inCubic);            // the mirror leaves
  const close = ramp(t, c.m1 - 0.32, c.m1 - 0.02, E.inOutCubic);            // the jaw shuts for the M
  let face = lerpFace(MF.strain, MF.shock, ramp(t, c.cant - 0.1, c.cant + 0.1));
  face = Object.assign({}, face, { jaw: 1 - close, mouthOpen: 1 - 0.94 * close });
  const shut = close > 0.97;
  if (shut) {
    face = lerpFace(MF.hum, MF.joy, ramp(t, c.nose - 0.1, c.nose + 0.15));
  }
  const hum = ramp(t, c.hum1 - 0.08, c.hum1 + 0.2);
  const A = { face, lips: shut ? 'P' : null, puff: 0.6 * hum, headDY: 0.8 * Math.sin(t * 2.0), headRot: 0.02 * Math.sin(t * 1.4),
    mirror: { k: 1 - out, x: -4, y: -12, ang: -0.2 } };
  const cam = camKeys(lt, [[0, 548, 1458, 3.55], [c.nose - 0.15 - shot.start, 540, 1450, 3.75], [D, 538, 1448, 3.8]], E.inOutSine);
  const Hh = clinicDraw(t, { cam, A, dy: -40 });
  // the hum out of his nose: little m's out of each nostril, then a fan of big M's on NOSE
  const nL = toScreen(cam, ...Hh.hp([-6, 19])), nR = toScreen(cam, ...Hh.hp([6, 19])), nC = [(nL[0] + nR[0]) / 2, nL[1]];
  const flow = hum * (1 - ramp(t, c.nose - 0.05, c.nose + 0.05));
  softDot(gctx, nC[0], nC[1], 34, '#7FE9FF', 0.3 * hum);
  mmScreenLetters('m', [nL[0] - 30, nL[1] + 14], Math.PI - 0.06, flow, t, { rate: 3.2, size: 104, col: '#7FE9FF', dist: 440, rise: 90, spread: 0.08, life: 0.85 });
  mmScreenLetters('m', [nR[0] + 30, nR[1] + 14], 0.06, flow, t + 0.16, { rate: 3.2, size: 104, col: '#7FE9FF', dist: 440, rise: 90, spread: 0.08, life: 0.85 });
  const burst = ramp(t, c.nose - 0.02, c.m_pop, E.outBack);
  if (burst > 0.01) {
    screenSpace();
    const drift = 30 * Math.max(0, t - c.m_pop - 0.14);
    for (let i = 0; i < 6; i++) {
      const sd = i < 3 ? -1 : 1, j = i % 3, a = sd < 0 ? Math.PI + 0.25 - j * 0.42 : -0.25 + j * 0.42 - 0.0;
      const ax = sd < 0 ? Math.PI + 0.12 + (2 - j) * 0.0 : 0;
      const ang = sd < 0 ? Math.PI - 0.15 - j * 0.38 : 0.15 + j * 0.38 - 0.0;
      const dx = Math.cos(-ang) , dy = Math.sin(-ang);
      const R = lerp(170, 262 + 26 * j, burst) + drift;   // born at the edge of his face: never across his eyes
      const P = [nC[0] + dx * R * 0.98, nC[1] - 40 + dy * R * 0.8];
      ctx.save(); ctx.translate(P[0], P[1]); ctx.rotate(sd * (0.2 + 0.15 * j)); const sc = 0.6 + 0.4 * burst; ctx.scale(sc, sc);
      ctx.font = '400 120px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineWidth = 15; ctx.lineJoin = 'round'; ctx.strokeStyle = '#0B0B1A'; ctx.strokeText('M', 0, 0); ctx.fillStyle = (i + j) % 2 ? '#FFD447' : '#7FE9FF'; ctx.fillText('M', 0, 0);
      ctx.restore();
      softDot(gctx, P[0], P[1], 90, '#FFE7A0', 0.25 * burst);
    }
    shockLines(nC[0], nC[1], 90, popK(t, c.nose, c.nose + 0.4, 0.05, 0.15), 10, '#FFFFFF', 4);
  }
  tagPill('NOSE', nC[0] + 210, nC[1] + 150, '#7FE9FF', popK(t, c.nose + 0.05, shot.end + 1, 0.12, 0.1), 50);
  return { glow: 0.85, flash: 0.08 * bumpAt(t, c.nose, 8) };
};

// ================================================================ the buzz: shut your lips and hum; feel your nose buzz?
// near the end a round window opens on his cheek with the side view inside, and the camera dives through it
const SEC_F0 = [662, 1000], SEC_Z0 = 1.35;
function mmSecWindow(P, R, z, t, so) {
  if (R < 2) return;
  screenSpace();
  ctx.beginPath(); ctx.arc(P[0], P[1], R, 0, 7); ctx.fillStyle = '#0B1230'; ctx.fill();
  ctx.save(); gctx.save();
  ctx.beginPath(); ctx.arc(P[0], P[1], R, 0, 7); ctx.clip();
  gctx.beginPath(); gctx.arc(P[0], P[1], R, 0, 7); gctx.clip();
  const cam = { x: SEC_F0[0] - (P[0] - 540) / z, y: SEC_F0[1] - (P[1] - 960) / z, zoom: z };
  twSecBg(cam, t); applyCam(cam); mmSection(t, so);
  ctx.restore(); gctx.restore();
  screenSpace();
  paint(() => { ctx.beginPath(); ctx.arc(P[0], P[1], R, 0, 7); ctx.lineWidth = Math.max(5, R * 0.04); ctx.strokeStyle = 'rgba(159,230,255,0.95)'; ctx.stroke(); });
}
let BUZZ_WIN = null;
SC.buzz = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const hum = ramp(t, c.hum2 - 0.1, c.hum2 + 0.15);
  const fing = typeof snapRamp === 'function' ? snapRamp(t, c.feel - 0.12, c.feel + 0.3, { pre: 0.12, ant: 0.06, over: 0.08 }) : ramp(t, c.feel - 0.12, c.feel + 0.3, E.outBack);
  const bz = ramp(t, c.nose2 - 0.05, c.nose2 + 0.1);
  let face = lerpFace(MF.hum, MF.feel, ramp(t, c.feel - 0.1, c.feel + 0.15));
  face = lerpFace(face, MF.joy, ramp(t, c.buzz - 0.08, c.buzz + 0.12));
  const A = { face, lips: 'P', puff: 0.25 + 0.5 * hum, finger: clamp(fing), buzz: bz * (1 - ramp(t, c.win + 0.2, c.win + 0.5)), headDY: 0.6 * Math.sin(t * 2.0) };
  const cam0 = camKeys(lt, [[0, 520, 1436, 5.6], [D, 524, 1440, 6.1]], E.inOutSine);
  const win = ramp(t, c.win, c.win + 0.22, E.outBack), dive = ramp(t, c.win + 0.18, shot.end, E.inOutCubic);
  const cam = dive > 0.001 && BUZZ_WIN ? scaledCam(cam0, BUZZ_WIN, 1 + 4.5 * E.inCubic(dive)) : cam0;
  const Hh = clinicDraw(t, { cam, A, dy: 30, lamp: [MMH.head[0] - 120, MMH.head[1] - 170] });
  BUZZ_WIN = Hh.hp([-36, 30]);
  // the buzz round his nose, and a tag
  const ns = toScreen(cam, ...Hh.hp([0, 16]));
  mmBuzzMarks(ns, 104 * cam.zoom / 5.6, (0.55 * hum + 0.45 * bz) * (1 - win), t);
  if (win > 0.001) {
    const P0 = toScreen(cam, ...BUZZ_WIN), zf = dive > 0.001 ? 1 + 4.5 * E.inCubic(dive) : 1;
    const R = lerp(0, 24 * cam0.zoom, win) * zf + 1300 * E.inCubic(ramp(t, shot.end - 0.2, shot.end));
    const P = mmL2(P0, [540, 960], E.inOutCubic(ramp(t, c.win + 0.1, shot.end)));
    const z = lerp(0.62, SEC_Z0, E.inOutCubic(ramp(t, c.win, shot.end)));
    mmSecWindow(P, R, z, t, { lips: 1, open: 0, nose: 1, hums: 0.8, vbox: 1, eye: { lookX: 1, lookY: 0.3 } });
  }
  return { glow: 0.85, zblur: 0.16 * E.inCubic(dive), zcx: 540, zcy: 960 };
};

// ================================================================ the spill: open up, and the hum pours out of your MOUTH
SC.spill = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const op = ramp(t, c.up - 0.12, c.up_end + 0.08, E.inOutCubic);
  const toMouth = ramp(t, c.up_end - 0.05, c.hum3 + 0.1);
  const so = {
    lips: 1 - op, open: op, vbox: 1,
    nose: 1 - 0.85 * toMouth, mouth: toMouth,
    hums: 0.9 * (1 - 0.8 * toMouth), pour: ramp(t, c.spills - 0.1, c.spills + 0.15),
    eye: { lookX: 1, lookY: 0.2, brow: 0.6 * ramp(t, c.instead - 0.05, c.instead + 0.1), wide: ramp(t, c.instead - 0.05, c.instead + 0.12, E.outBack) },
  };
  const cam = camKeys(lt, [[0, SEC_F0[0], SEC_F0[1], SEC_Z0], [c.up - shot.start, 664, 990, 1.42], [c.mouth2 - shot.start, 676, 1004, 1.5], [D, 678, 1006, 1.54]], E.inOutSine);
  twSecBg(cam, t);
  applyCam(cam);
  const S = mmSection(t, so);
  // the labels: M = the road through the nose; then NO M
  const nsP = toScreen(cam, ...S.nostril), moP = toScreen(cam, ...S.mouth);
  tagPill('M', nsP[0] + 40, nsP[1] - 150, '#7FE9FF', popK(t, shot.start + 0.05, c.up + 0.05, 0.12, 0.12), 64);
  stampNoM(Math.min(moP[0] + 170, 760), moP[1] - 250, ramp(t, c.instead - 0.04, c.instead + 0.12));
  return { glow: 0.95, flash: 0.3 * (1 - ramp(lt, 0, 0.12)) };
};
function stampNoM(x, y, k) {
  if (k <= 0.01) return;
  screenSpace();
  stamp('NO M!', x, y, k, '#FF4D5E', -0.14, 120);
}

// ================================================================ the dentist: that's why you can't answer your dentist
SC.dentist = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const ask = popK(t, c.thats - 0.02, shot.end + 1, 0.14, 0.1);
  const reply = ramp(t, c.dentist_end - 0.04, c.aah_pop, E.outBack);
  const nod = Math.sin(t * 18) * ramp(t, c.dentist_end - 0.05, c.dentist_end + 0.05);
  const face = lerpFace(lerpFace(MF.wide, MF.think, ramp(t, c.thats + 0.1, c.thats + 0.3)), MF.answer, ramp(t, c.dentist_w - 0.1, c.dentist_w + 0.1));
  const A = { face, headDY: 2.2 * nod + 0.6 * Math.sin(t * 2), headRot: 0.02 * nod, mirror: { k: 1, x: -4, y: -12, ang: -0.2 }, gloveSleeve: false };
  const cam = camKeys(lt, [[0, 652, 1392, 2.12], [D, 648, 1396, 2.22]], E.inOutSine);
  const dEyes = t < c.dentist_w + 0.1 ? 'smile' : 'squint';
  const Hh = clinicDraw(t, { cam, A, dy: 60, lamp: [MMH.head[0] - 150, MMH.head[1] - 280], front: true,
    dentist: { x: 790, y: 1296, s: 1.12, eyes: dEyes, look: [-1, 0.3], lean: -0.12, brow: ramp(t, c.dentist_w + 0.1, c.dentist_w + 0.3) } });
  // the dentist's arm: from the shoulder to the glove at the mirror's handle
  const gl = Hh.hp([115.6 + 18, 24.2 + 10]), sh = [790 - 92 * 1.12, 1296 + 100 * 1.12], el = [790 - 40 * 1.12, 1296 + 230 * 1.12];
  applyCam(cam);
  actor(() => {
    for (const [w, col] of [[50, MMC.coatSh], [42, MMC.coat]]) { line(ctx, sh[0], sh[1], el[0], el[1], w, col); line(ctx, el[0], el[1], gl[0], gl[1], w - 4, col); }
    line(ctx, gl[0] + 6, gl[1] + 4, gl[0] + 22, gl[1] + 12, 34, MMC.gloveSh);
  });
  const hs = toScreen(cam, ...Hh.hp([0, 0])), ds = toScreen(cam, 790, 1296);
  mmBubble('FLOSSING?', Math.min(ds[0] - 90, 690), ds[1] - 200, ask, { tx: ds[0] - 10, ty: ds[1] - 120, size: 80, rot: 0.03 });
  mmBubble('AAH-AAH!', hs[0] + 30, hs[1] - 300, reply, { tx: hs[0] + 10, ty: hs[1] - 120, size: 96, col: '#FFD447', outline: true, rot: -0.06 });
  return { glow: 0.85, flash: 0.06 * bumpAt(t, c.aah_pop, 8), focus: [hs[0] + 40, hs[1] - 120] };
};

// ================================================================ the ventriloquist: they fake it with an N
SC.vent = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const talk = ramp(t, c.say3 - 0.2, c.say3) * (1 - ramp(t, c.either + 0.3, c.either + 0.45));
  const talk2 = ramp(t, c.n_w - 0.25, c.n_w - 0.1) * (1 - ramp(t, c.n_end + 0.1, c.n_end + 0.25));
  const jaw = Math.max(talk, talk2) * (0.5 + 0.5 * Math.sin(t * 24));
  const flip1 = ramp(t, c.fake - 0.02, c.fake + 0.2), flip2 = ramp(t, c.fake + 0.12, c.fake + 0.34);
  const worry = ramp(t, c.m3 - 0.1, c.m3 + 0.1) * (1 - ramp(t, c.fake - 0.05, c.fake + 0.15));
  let face = lerpFace(MF.grin, MF.grinWorry, worry);
  face = lerpFace(face, MF.grinSmug, ramp(t, c.fake + 0.2, c.fake + 0.4));
  const A = { face, jaw, dLook: worry > 0.5 ? [-0.9, 0.2] : [-0.6, 0], dTilt: 0.06 * Math.sin(t * 3) + 0.05 * jaw, sweat: worry,
    headDY: 0.6 * Math.sin(t * 2), wave: 0 };
  const cam = camKeys(lt, [[0, 562, 1176, 1.86], [D, 558, 1170, 1.96]], E.inOutSine);
  twStageBg(cam, t, { top: 'LIPS', bot: 'SEALED', neonY: 840 });
  applyCam(cam);
  const Hh = mmVentHero(cam, t, A);
  applyCam(cam);
  const camC = Object.assign({}, cam, { y: cam.y + 300 });   // the front row, nearer: lifted into the bottom of the frame
  applyCam(camC);
  twCrowd(t, { cheer: 0.25 * ramp(t, c.n_end, c.n_end + 0.2), noPhones: true });
  applyCam(cam);
  const dm = toScreen(cam, ...Hh.dmouth);
  mmFlipBubble(dm[0] + 20, dm[1] - 330, popK(t, c.say3 - 0.12, shot.end + 1, 0.14, 0.1), [flip1, flip2], { tx: dm[0] - 10, ty: dm[1] - 40, size: 104 });
  // the N's shine; HI! from Nana
  if (flip2 > 0.6) softDot(gctx, dm[0] + 20, dm[1] - 330, 260, '#FF9A3C', 0.25 * bumpAt(t, c.n_w, 5));
  return { glow: 0.9, flash: 0.08 * bumpAt(t, c.fake, 8) };
};

// ================================================================ the button: now say mama without moving your lips (runs into frame 1)
SC.loop = (lt, t, shot) => {
  const c = cu(), Dend = TLd.duration, tt = t - Dend;
  const H0 = hookA(tt), C0 = hookCam(tt);
  const blend = ramp(t, c.reopen, Dend - 0.06, E.inOutCubic);
  // the grin: lips that don't move; his eyes dart, a sweat drop, the cheeks tremble
  const tryK = ramp(t, c.without - 0.1, c.without + 0.2);
  let face = lerpFace(MF.grin, MF.grinTry, ramp(t, c.mama - 0.1, c.mama + 0.1));
  face = Object.assign({}, face, { lookX: Math.sin(t * 7) > 0 ? 0.7 : -0.5 });
  face = lerpFace(face, MF.grinWorry, tryK * (1 - ramp(t, c.reopen - 0.2, c.reopen)));
  const jit = tryK * (1 - blend);
  const A1 = { face, headDX: 1.2 * jit * Math.sin(t * 61), headDY: 0.6 * Math.sin(t * 2) + 0.8 * jit * Math.sin(t * 53), headRot: 0.01 * Math.sin(t * 1.4) };
  // the reopening: the jaw drops into the hook's wide mouth, the mirror comes back
  const A = blend > 0.001 ? {
    face: lerpFace(A1.face, H0.A.face, blend), headDX: lerp(A1.headDX, 0, blend), headDY: lerp(A1.headDY, H0.A.headDY, blend), headRot: lerp(A1.headRot, H0.A.headRot, blend),
    mirror: { k: E.outCubic(blend), x: H0.A.mirror.x, y: H0.A.mirror.y, ang: H0.A.mirror.ang },
  } : A1;
  const cam0 = camKeys(lt, [[0, 540, 1462, 3.75], [Math.max(0.3, c.reopen - shot.start), 536, 1458, 4.05]], E.inOutSine);
  const cam = { x: lerp(cam0.x, C0.x, blend), y: lerp(cam0.y, C0.y, blend), zoom: lerp(cam0.zoom, C0.zoom, blend), rot: 0 };
  const Hh = clinicDraw(t, { cam, A, dy: lerp(-20, 0, blend) });
  const mo = toScreen(cam, ...Hh.hp([30, 44]));
  mmBubble('NANA?', Math.min(mo[0] + 170, 770), mo[1] - 270, popK(t, c.mama_end - 0.05, c.reopen - 0.05, 0.12, 0.12), { tx: mo[0] + 40, ty: mo[1] - 30, size: 92, col: '#FF9A3C', outline: true, rot: 0.06 });
  const sw = toScreen(cam, ...Hh.hp([58, -30]));
  sweatDrop(ctx, sw[0], sw[1], 1.3, popK(t, c.without, c.reopen - 0.1, 0.15, 0.1));
  return { glow: 0.85 };
};

// ================================================================ the cover (rendered by src/cover.sh from a one-shot timeline)
SC.cover = (lt, t) => {
  const cam = { x: 532, y: 1500, zoom: 4.2, rot: 0 };
  const A = { face: { ...MF.strain, cross: 0.4, browTilt: 1.0, eyeOpen: 1.1 }, mirror: { k: 1, x: -4, y: -12, ang: -0.2 }, headDY: 0 };
  const Hh = clinicDraw(0.4, { cam, A, dy: 0 });
  const mo = toScreen(cam, ...Hh.hp([0, 60]));
  screenSpace();
  for (let i = 0; i < 3; i++) {
    const P = [mo[0] - 150 - i * 120, mo[1] - 120 - i * 130];
    ctx.save(); ctx.translate(P[0], P[1]); ctx.rotate(-0.3 + 0.2 * i);
    ctx.font = `400 ${130 + 20 * i}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 16; ctx.lineJoin = 'round'; ctx.strokeStyle = '#0B0B1A'; ctx.strokeText('A', 0, 0); ctx.fillStyle = '#FFD447'; ctx.fillText('A', 0, 0);
    ctx.restore();
  }
  bigWord('SAY "M"', 540, 1215, 170, '#FFFFFF', 1, -0.04);
  bigWord('MOUTH OPEN?', 540, 1385, 150, '#FFD447', 1, -0.03);
  return { glow: 0.85, noCaptions: true };
};

function initScenes2() {
  initClinic();
  initSection();
  initStage();
}
