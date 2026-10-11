// Why Do Nails on a CHALKBOARD Make You Cringe? Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
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

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the classroom after hours: a low sun from a window on the left (the key), the room cooler behind him
const CLASS_LIGHT = { ...LIGHTS.room, keyTint: [1.1, 1.02, 0.9], pool: 0.4, halo: 0.12 };
// inside his ear, inside his head
const IN_LIGHT = { ...LIGHTS.inside, pool: 0.3, halo: 0 };
// the sound booth: a desk lamp on the left, the sign's violet behind him
const LAB_LIGHT = { ...LIGHTS.candle, rim: [0.78, 0.6, 1.0], rimAmt: 1.2, pool: 0.5, halo: 0.14, haloColor: [0.7, 0.55, 1.0] };

// ---------------------------------------------------------------- his faces
const CF = {
  // eyes on his own hand: why am I doing this
  drag: { eyeOpen: 1.08, pupil: 0.85, lookX: 0.95, lookY: -0.55, browY: 1.0, browTilt: 1.2, mouth: 'grimace', mouthOpen: 1, blink: 0.1, cross: 0 },
  strain: { eyeOpen: 0.86, pupil: 0.8, lookX: 0.9, lookY: -0.2, browY: 0.7, browTilt: 1.7, mouth: 'grimace', mouthOpen: 1, blink: 0.22, cross: 0, squeeze: 0.25 },
  // everything shut
  cringe: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: -0.6, browTilt: -1.1, mouth: 'grimace', mouthOpen: 1, blink: 1, cross: 0, squeeze: 1 },
  // a look at his own ear: you did this?
  side: { eyeOpen: 1.05, pupil: 0.85, lookX: 1, lookY: 0.1, browY: 0.2, browTilt: -0.7, mouth: 'wavy', mouthOpen: 0.3, blink: 0.15, cross: 0 },
  ow: { eyeOpen: 1.36, pupil: 0.55, lookX: 0.9, lookY: 0, browY: 1.4, browTilt: 0.5, mouth: 'o', mouthOpen: 0.75, blink: 0, cross: 0 },
  // the board is drawing by itself
  study: { eyeOpen: 1.1, pupil: 0.9, lookX: 0.75, lookY: -1, browY: 1.0, browTilt: 0.2, mouth: 'flat', mouthOpen: 0.4, blink: 0, cross: 0 },
  peek: { eyeOpen: 1.0, pupil: 0.9, lookX: 0.9, lookY: -0.3, browY: 1.1, browTilt: 0.8, mouth: 'flat', mouthOpen: -0.3, blink: 0.45, cross: 0 },
  meh: { eyeOpen: 1, pupil: 1, lookX: 0.1, lookY: -0.1, browY: 1.0, browTilt: 0.1, mouth: 'flat', mouthOpen: 1.4, blink: 0.12, cross: 0 },
  ask: { eyeOpen: 1.12, pupil: 0.85, lookX: 0.8, lookY: -0.9, browY: 0.9, browTilt: 1.0, mouth: 'wavy', mouthOpen: 0.3, blink: 0, cross: 0 },
  eek: { eyeOpen: 1.4, pupil: 0.5, lookX: 0.8, lookY: -0.8, browY: 1.5, browTilt: 0.4, mouth: 'o', mouthOpen: 0.85, blink: 0, cross: 0 },
  // the listening test
  hate: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: -0.5, browTilt: -1.0, mouth: 'grimace', mouthOpen: 1, blink: 1, cross: 0, squeeze: 0.9 },
  snob: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 1.5, browTilt: 0.25, mouth: 'flat', mouthOpen: 2.4, blink: 1, cross: 0 },
  glance: { eyeOpen: 0.95, pupil: 0.85, lookX: -1, lookY: 0.9, browY: 1.2, browTilt: 0.9, mouth: 'flat', mouthOpen: 1.2, blink: 0.25, cross: 0 },
  caught: { eyeOpen: 1.3, pupil: 0.6, lookX: -1, lookY: 0.7, browY: 1.3, browTilt: 1.2, mouth: 'grimace', mouthOpen: 1, blink: 0, cross: 0 },
};

// ---------------------------------------------------------------- small things
function insideBg(t, c1 = '#5A1E4E', c2 = '#170718') { darkBg(c1, c2); motes(t, 0.35); }
// a small filled tag (screen space)
function tagPill(txt, x, y, col, k, size = 40, ink = '#0B0B1A') {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + size * 0.9, h = size * 1.5;
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = col; ctx.fill();
  paint(() => { ctx.fillStyle = ink; ctx.fillText(txt, 0, 2); });
  ctx.restore();
}
// a loudspeaker in a dark badge, with bars that fill as it gets louder (screen space). lv 0..1
function volBadge(x, y, k, lv, t) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2) * (1 + 0.05 * lv * Math.sin(t * 26));
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -124, -56, 248, 112, 30); ctx.fillStyle = '#0B0F2A'; ctx.fill();
  paint(() => {
    rrect(ctx, -124, -56, 248, 112, 30); ctx.lineWidth = 5; ctx.strokeStyle = mixH('#FFD447', '#FF4D5E', lv); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-96, -14); ctx.lineTo(-76, -14); ctx.lineTo(-52, -34); ctx.lineTo(-52, 34); ctx.lineTo(-76, 14); ctx.lineTo(-96, 14); ctx.closePath(); ctx.fillStyle = '#FFFFFF'; ctx.fill();
    for (let i = 0; i < 5; i++) { const on = clamp(lv * 5.4 - i), h = 20 + i * 13; rrect(ctx, -30 + i * 28, 30 - h, 19, h, 6); ctx.fillStyle = on > 0.5 ? mixH('#FFD447', '#FF4D5E', i / 4) : '#27305C'; ctx.fill(); }
  });
  ctx.restore();
  gctx.save(); gctx.translate(x, y); gctx.scale(s, s); rrect(gctx, -124, -56, 248, 112, 30); gctx.fillStyle = '#000000'; gctx.fill(); gctx.lineWidth = 9; gctx.strokeStyle = rgba('#FF4D5E', 0.5 * lv); gctx.stroke(); gctx.restore();
}
// the screech as a word (screen space): letters that shake and grow from P0 to P1. k = how much of it is there;
// o: {s0, s1: the first and last letter's size, col0, col1, shake}
function screechWord(txt, P0, P1, t, k, o = {}) {
  if (k <= 0.01) return;
  const n = txt.length, s0 = o.s0 || 64, s1 = o.s1 || 128, col0 = o.col0 || '#FFFFFF', col1 = o.col1 || '#FFD447', sh = o.shake === undefined ? 1 : o.shake;
  const sz = [...txt].map((ch, i) => lerp(s0, s1, Math.pow(n > 1 ? i / (n - 1) : 0, 1.5))), wd = sz.map((z, i) => z * (txt[i] === '!' ? 0.34 : 0.5)), tot = wd.reduce((a, b) => a + b, 0);
  screenSpace();
  let acc = 0;
  for (let i = 0; i < n; i++) {
    const u = (acc + wd[i] / 2) / tot, on = clamp(k * (n + 2) - i);
    acc += wd[i];
    if (on <= 0.01) continue;
    const size = sz[i] * E.outBack(on, 2.2), x = lerp(P0[0], P1[0], u) + sh * 4 * vnoise(t * 27 + i * 3.1, 2), y = lerp(P0[1], P1[1], u) + sh * 7 * vnoise(t * 31 + i * 1.7, 5) - 16 * Math.sin(Math.PI * u);
    ctx.save(); ctx.translate(x, y); ctx.rotate(-0.08 + 0.07 * sh * vnoise(t * 23 + i, 9));
    ctx.font = `400 ${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    ctx.lineWidth = size * 0.16; ctx.strokeStyle = '#0B0B1A'; ctx.strokeText(txt[i], 0, 0);
    ctx.fillStyle = mixH(col0, col1, u); ctx.fillText(txt[i], 0, 0);
    ctx.restore();
  }
}
// SKREEEEE! above the scrape, where the nails landed: it holds its place on screen while the hand goes down, clear of
// the top band and of the watermark's corner
function skreee(cam, t, k) {
  screechWord('SKREEEEE!', [300, 556], [752, 628], t, k, { s0: 62, s1: 132 });
}
// a loudspeaker struck out (world units, camera applied): this band is off
function muteIcon(x, y, s, k) {
  if (k <= 0.01) return;
  const q = E.outBack(clamp(k), 2.2) * s;
  ctx.save(); ctx.translate(x, y); ctx.scale(q, q);
  circle(ctx, 0, 0, 30, '#F6F8FF');
  paint(() => {
    ctx.beginPath(); ctx.moveTo(-17, -6); ctx.lineTo(-8, -6); ctx.lineTo(4, -16); ctx.lineTo(4, 16); ctx.lineTo(-8, 6); ctx.lineTo(-17, 6); ctx.closePath(); ctx.fillStyle = '#1A1C2C'; ctx.fill();
    line(ctx, -19, 19, 19, -19, 6.5, '#E2283C');
    ctx.beginPath(); ctx.arc(0, 0, 30, 0, 7); ctx.lineWidth = 5; ctx.strokeStyle = '#E2283C'; ctx.stroke();
  });
  ctx.restore();
}
// a scream, looking out (world units, camera applied): a small head, eyes shut, hands on its cheeks, a huge mouth
function screamHead(x, y, r, t, k) {
  if (k <= 0.01) return;
  const q = E.outBack(clamp(k), 2.6), sh = 1.5 * Math.sin(t * 58);
  const rng = mulberry32(70 + Math.floor(t * 15));
  for (let i = 0; i < 9; i++) {   // the noise it makes
    const an = -2.9 + i * 0.52 + (rng() - 0.5) * 0.2, r0 = r * 1.3, r1 = r0 + r * (0.5 + rng() * 0.7) * q;
    const J = jagged(rng, x + Math.cos(an) * r0, y + Math.sin(an) * r0, x + Math.cos(an) * r1, y + Math.sin(an) * r1, r * 0.3, 2);
    poly(ctx, J, r * 0.09, rgba('#FFF3B0', 0.95 * k)); poly(gctx, J, r * 0.2, rgba('#FF4D5E', 0.55 * k));
  }
  ctx.save(); ctx.translate(x + sh, y); ctx.scale(q * r / 40, q * r / 40);
  actor(() => {
    ellipse(ctx, 0, 0, 36, 42, '#FFD9A8');
    ctx.beginPath(); ctx.moveTo(-36, -8); ctx.quadraticCurveTo(-30, -52, 4, -46); ctx.quadraticCurveTo(34, -50, 36, -8); ctx.quadraticCurveTo(20, -28, -4, -26); ctx.quadraticCurveTo(-24, -28, -36, -8); ctx.closePath(); ctx.fillStyle = '#5A3A2A'; ctx.fill();
    for (const s of [-1, 1]) { ellipse(ctx, s * 33, 12, 10, 15, '#FFC98E'); }
  });
  paint(() => {
    for (const s of [-1, 1]) { line(ctx, s * 22, -12, s * 9, -6, 4.5, '#3A1420'); line(ctx, s * 22, -2, s * 9, -6, 4.5, '#3A1420'); }
    ellipse(ctx, 0, 20, 13, 17, '#5A1522'); ellipse(ctx, 0, 30, 8, 6, '#E0616C');
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-9, 4, 18, 5);
  });
  ctx.restore();
}

// ================================================================ the classroom: frame 1 and round it
const CANV = { x: 550, y: 830, s: 1.15 };                       // where the ear canal's section sits in the next shot
const CAN_MINI = 330;                                        // how big the window on his ear has grown when the cut comes
// how far down the board his nails are (0..1), tt = seconds since frame 1: they land a moment before it
function dragU(tt) {
  const c = cu(), u = clamp((tt + 0.4) / (c.chalk_end + 0.22 + 0.4));
  return clamp(Math.pow(u, 0.92) + (u > 0.02 && u < 0.97 ? 0.011 * Math.sin(tt * 107) : 0));
}
// the opening, as a function of tt = seconds since frame 1 (negative = the last frames of the Short, on their way here)
function hookA(tt) {
  const c = cu(), u = dragU(tt);
  const reach = 1 - ramp(tt, c.cringe - 0.03, c.cringe + 0.15, E.inCubic);   // the cut to the last shot lands with his nails already on the board
  const claw = 1 - ramp(tt, c.cringe + 0.02, c.cringe + 0.14);
  const cr0 = ramp(tt, c.cringe - 0.05, c.cringe + 0.13, E.outBack);
  const cringe = cr0 * (1 - 0.7 * ramp(tt, c.own - 0.1, c.ear + 0.25, E.inOutCubic)) * (1 - 0.7 * ramp(tt, c.nasty - 0.2, c.nasty + 0.45, E.inOutCubic));
  const flinch = cr0 * (1 - ramp(tt, c.own - 0.1, c.making, E.inOutCubic));
  const shiver = bumpAt(tt, c.cringe, 2.4);
  const strain = ramp(tt, 0.15, c.chalk_end);
  const heard = ramp(tt, c.own - 0.1, c.ear + 0.1), loud = ramp(tt, c.louder - 0.06, c.louder + 0.22);
  const study = ramp(tt, c.nasty - 0.15, c.nasty + 0.3);
  let face = lerpFace(CF.drag, CF.strain, strain);
  face = lerpFace(face, CF.cringe, ramp(tt, c.cringe - 0.05, c.cringe + 0.08));
  face = lerpFace(face, CF.side, ramp(tt, c.own + 0.12, c.ear + 0.05));
  face = lerpFace(face, CF.ow, ramp(tt, c.louder - 0.02, c.louder + 0.1));
  face = lerpFace(face, CF.side, ramp(tt, c.louder_end, c.louder_end + 0.22));
  face = lerpFace(face, CF.study, study);
  face = { ...face, blink: Math.max(face.blink || 0, pulseOf(tt, [c.sits + 0.12, c.band + 0.34], 0.12)) };
  const fade = 1 - ramp(tt, c.nasty - 0.1, c.nasty + 0.4);
  const point = ramp(tt, c.one - 0.14, c.one + 0.18, E.outBack) * (1 - ramp(tt, c.window - 0.3, c.window - 0.05, E.inOutCubic));   // that one: he points at the band
  const A = {
    face, palm: point > 0.001 ? [614 + 5 * Math.sin(tt * 3.1), 992 - 8 * point] : clsPalm(u), reach: Math.max(reach, clamp(point)), claw, cringe, flinch,
    point: clamp(point), pointAt: [rulBand().x, RUL.y - 40],
    frizz: 0.5 * cr0 * (1 - 0.75 * ramp(tt, c.own, c.nasty)) * (1 - ramp(tt, c.nasty, c.sits)),
    dx: 3 * shiver * Math.sin(tt * 66),
    headDX: 1.4 * shiver * Math.sin(tt * 71), headDY: 0.8 * strain * (1 - cr0) * Math.sin(tt * 47) - 2 * study,
    headRot: 0.085 * (1 - cr0) - 0.03 * cr0 * (1 - heard) + 0.05 * heard * fade,
    bob: 1.4 * Math.sin(tt * 2.4),
    ear: { throb: fade * Math.max(loud * (0.55 + 0.45 * Math.sin(tt * 25)), 0.35 * heard * Math.abs(Math.sin(tt * 9))), red: loud * fade },
    win: ramp(tt, c.window, c.window + 0.24, E.outBack),
  };
  return { A, u, cr0, shiver, heard, loud, study, fade };
}
function hookCam(tt) {
  const c = cu();
  const k = camKeys(tt, [[-0.4, 548, 1046, 2.1], [0, 548, 1046, 2.12], [0.3, 552, 1052, 2.42], [c.chalk_end, 556, 1084, 2.5], [c.cringe + 0.34, 500, 1190, 1.5], [c.own - 0.05, 500, 1192, 1.48],
    [c.ear + 0.3, 478, 1056, 2.7], [c.louder_end, 486, 1056, 2.95], [c.nasty + 0.6, 600, 942, 1.5], [c.window, 597, 946, 1.55], [c.dive, 536, 1026, 2.4]], E.inOutCubic);
  if (tt >= 0 && tt < 0.3) { const u = E.outCubic(tt / 0.3); k.zoom = lerp(2.12, 2.42, u); k.x = lerp(548, 552, u); k.y = lerp(1046, 1052, u); }   // the first push is quick off the mark
  const sq = clamp((tt + 0.1) / 0.05) * (1 - clamp((tt - c.cringe - 0.25) / 0.2));   // the squeal rattles the frame
  k.x += 2.4 * sq * vnoise(tt * 31, 3); k.y += 2.4 * sq * vnoise(tt * 29, 8);
  return k;
}
// the room, the chalk on the board, him. o: {cam, S: a state from hookA (or one like it), ruler, scratch2: {u, x}, after: fn(H)}
function classDraw(t, o) {
  clsRoom(o.cam, t);
  if (o.under) o.under();
  if (o.ruler) clsRuler(t, o.ruler);
  clsScratch(o.S.u, CLS.x, 1);
  if (o.scratch2) clsScratch(o.scratch2.u, o.scratch2.x, 1);
  if (o.behind) o.behind();
  const H = clsHero(o.cam, t, o.S.A);
  applyCam(o.cam);
  if (o.after) o.after(H);
  return H;
}
const tipsMid = (u, x) => { const T = clsTips(clsPalm(u, x)); return [(T[1][0] + T[2][0]) / 2, T[1][1] + 4]; };

// ================================================================ shots
SC.hook = (lt, t, shot) => {
  const c = cu(), S = hookA(t), cam = hookCam(t);
  const dive = ramp(t, c.dive, shot.end, E.inCubic);
  if (dive > 0) {   // into the window on his ear: it ends where the next shot's canal is
    const NW = clsHeadPt(clsSt(S.A), CLS_EAR[0], CLS_EAR[1] + 2), P0 = toScreen(cam, NW[0], NW[1]);
    Object.assign(cam, scaledCam(cam, NW, 1 + (CAN_MINI / (CLS_WIN * CLS.hs * cam.zoom) - 1) * dive));
    cam.sx = (CANV.x - P0[0]) * dive; cam.sy = (CANV.y - P0[1]) * dive;
  }
  const ruler = { line: ramp(t, c.nasty + 0.2, c.sits + 0.3, E.inOutSine), band: ramp(t, c.one - 0.04, c.one + 0.2), label: ramp(t, c.narrow - 0.04, c.narrow + 0.2), pulse: bumpAt(t, c.band, 5) + 0.5 * Math.abs(Math.sin(t * 7)) * ramp(t, c.narrow, c.band) };
  const dragging = S.A.claw * (S.u < 0.985 ? 1 : 0);
  const H = classDraw(t, { cam, S, ruler, after: (Hh) => {
    clsDust(t, S.u, CLS.x, dragging);
    clsSqueal(tipsMid(S.u, CLS.x), Math.floor(t * 30), dragging, 1);
    // the screech goes to his ear, and the ear turns it up
    const rk = ramp(t, c.own - 0.2, c.own + 0.15) * S.fade;
    clsRings(t, [CLS.x, 1050], Hh.ear, { k: rk, loud: S.loud, speed: 1.6, n: 6 });
    if (S.loud > 0.02) { softDot(gctx, Hh.ear[0], Hh.ear[1], 70, '#FF3A50', 0.7 * S.loud * S.fade); }
  } });
  const Es = toScreen(cam, H.ear[0], H.ear[1]);
  volBadge(clamp(Es[0] + 150, 240, 800), Es[1] - 250, ramp(t, c.making - 0.05, c.making + 0.16) * (1 - ramp(t, c.nasty - 0.12, c.nasty + 0.05)), 0.24 + 0.76 * ramp(t, c.louder - 0.08, c.louder + 0.3), t);
  skreee(cam, t, 1 - ramp(t, c.chalk_end - 0.12, c.chalk_end + 0.1));
  const hit = bumpAt(t, c.cringe, 6);
  if (hit > 0.05) { const B = toScreen(cam, H.head[0], H.head[1] + 60); shockLines(B[0], B[1], 250, 1 - hit, 12, '#FFFFFF', 5); }
  return { glow: 0.85, zblur: 0.34 * dive, zcx: lerp(540, CANV.x, dive), zcy: lerp(900, CANV.y, dive), flash: 0.1 * hit + 0.08 * bumpAt(t, c.louder, 8) };
};

// ================================================================ the ear canal: a tiny tube that boosts that band
SC.canal = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0;
  insideBg(t);
  const bot = ramp(t, c.bottle - 0.55, c.bottle - 0.1, E.inOutCubic);          // the section makes room for the bottle
  const V = { x: lerp(CANV.x, 530, bot), y: lerp(CANV.y, 668, bot), s: lerp(CANV.s, 0.9, bot) * (1 + 0.025 * lt / D) * (1 + 0.1 * (1 - ramp(lt, 0, 0.5, E.outCubic))) };
  const boost = ramp(t, c.boosts - 0.1, c.band2 + 0.05, E.inOutSine);
  const front = ramp(lt, -0.15, 0.7, E.outCubic), tap = bumpAt(lt, 0.66, 7);          // the wave comes down the tube as we arrive, and taps the drum
  canalDraw(V, t, { wave: 0.42 + 0.58 * front, gain: 1 + 2.5 * boost + 0.18 * boost * Math.sin(t * 9), red: 0.85, tube: bumpAt(t, c.tiny, 1.6) * ramp(t, c.tiny - 0.05, c.tiny + 0.1), hit: Math.max(0.5 * tap, boost * (0.6 + 0.4 * Math.abs(Math.sin(t * 8)))), bars: ramp(t, c.boosts - 0.05, c.band2 + 0.1), glow: boost, nerve: boost });
  // what it is, and what goes in
  const lk = ramp(t, c.canal - 0.1, c.canal + 0.14) * (1 - ramp(t, c.boosts - 0.35, c.boosts - 0.15));
  const T1 = canalPt(V, -60, -CAN.r);
  leader([520, 524], [T1[0], T1[1]], lk >= 0.99 ? 1 : lk, '#FF9A3C'); pill(520, 490, 'EAR CANAL', '#FF9A3C', lk, 42);
  tagPill('2,000 – 4,000 Hz', 300, 1160, '#FF5A6E', ramp(lt, 0.25, 0.5) * (1 - bot), 36, '#FFFFFF');
  const dk = ramp(t, c.exactly - 0.05, c.exactly + 0.16) * (1 - bot);
  const T2 = canalPt(V, CAN.x1, CAN.r + 4);
  leader([768, 1126], [T2[0], T2[1]], dk >= 0.99 ? 1 : dk, '#FFE6DC'); pill(768, 1160, 'EARDRUM', '#FFE6DC', dk, 36);
  // a tube: open at one end, closed at the other
  const tk = (1 - ramp(t, c.boosts - 0.3, c.boosts - 0.1));
  const O1 = canalPt(V, -252, -112), O2 = canalPt(V, 196, -112);
  tagPill('OPEN', O1[0], O1[1], '#7FE9FF', ramp(t, c.tiny - 0.02, c.tiny + 0.14) * tk, 28);
  tagPill('CLOSED', O2[0], O2[1], '#7FE9FF', ramp(t, c.tube - 0.02, c.tube + 0.14) * tk, 28);
  // ... like a bottle you blow across
  const ring = ramp(t, c.blow + 0.02, c.across + 0.1);
  tagPill('OPEN', 246, 968, '#7FE9FF', ramp(t, c.bottle + 0.12, c.bottle + 0.26), 28);
  tagPill('CLOSED', 800, 968, '#7FE9FF', ramp(t, c.bottle + 0.24, c.bottle + 0.38), 28);
  canBottle(548, 1088, 1.2, t, { k: ramp(t, c.bottle - 0.36, c.bottle - 0.06), blow: ramp(t, c.blow - 0.12, c.blow + 0.12), ring });
  canNote(150, 900 - 26 * ramp(t, c.toot, c.toot + 0.5), 1.25, pulseOf(t, [c.across + 0.1], shot.end - c.across) * ring);
  const arrive = ramp(lt, 0, 0.3);
  return { glow: 0.9, zblur: 0.3 * (1 - arrive), zcx: CANV.x, zcy: CANV.y, flash: 0.26 * (1 - ramp(lt, 0, 0.16)) + 0.05 * bumpAt(t, c.toot, 8) };
};

// ================================================================ the brain: the alarm centre grabs the volume knob
SC.alarm = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0;
  insideBg(t, '#43205C', '#0F0718');
  const alarm = ramp(t, c.alarm - 0.06, c.alarm + 0.1), reach = ramp(t, c.grabs - 0.05, c.grabs + 0.24);
  const crank = ramp(t, c.cranks - 0.02, c.up + 0.1, E.inOutCubic), up = bumpAt(t, c.up, 3.5);
  const knob = lerp(-1.3, 2.45, crank) + 0.06 * Math.sin(t * 38) * Math.sin(Math.PI * crank);
  const mood = t < c.alarm - 0.06 ? 'doze' : t < c.grabs - 0.08 ? 'alert' : 'mad';
  const BV = { k: 1.2, cx: 540, cy: 850 }, bp = (x, y) => [BV.cx + (x - BV.cx) * BV.k, BV.cy + (y - BV.cy) * BV.k];
  brnDraw(t, { V: BV, signal: ramp(lt, 0.0, 0.35), level: 0.26 + 0.74 * crank, knob, alarm, reach, grip: reach, shake: clamp((crank - 0.45) * 2) * (0.5 + 0.5 * up), mood });
  const hk = ramp(t, c.brains - 0.1, c.brains + 0.12), HA = bp(BRN.amp[0], BRN.amp[1] - 116), HL = bp(400, 560), AL = bp(640, 1086), KN = bp(BRN.knob[0], BRN.knob[1]);
  leader([HL[0], HL[1] + 36], HA, hk >= 0.99 ? 1 : hk, '#9FB4FF'); pill(HL[0], HL[1], 'HEARING AREA', '#9FB4FF', hk, 42);
  pill(AL[0], AL[1], 'ALARM CENTRE', '#FF5A6E', ramp(t, c.alarm - 0.03, c.alarm + 0.18), 44);
  tagPill('BRAIN SCANS, 2012', 268, 1136, '#C8A8FF', ramp(t, c.volume - 0.05, c.volume + 0.16), 30);
  if (up > 0.05) shockLines(KN[0], KN[1], 140, 1 - up, 12, '#FFE08A', 9);
  return { glow: 0.9, push: { k: 1 + 0.03 * lt / D + 0.04 * crank, cx: 480, cy: 830 }, zblur: 0.22 * (1 - ramp(lt, 0, 0.26)), zcx: 200, zcy: 1000,
    flash: 0.22 * (1 - ramp(lt, 0, 0.12)) + 0.12 * bumpAt(t, c.up, 8) };
};

// ================================================================ the classroom again: mute the band, scrape again
const X2 = 606;                                              // where the second scrape goes
function proofA(t) {
  const c = cu();
  const u2 = ramp(t, c.scrape2 - 0.04, c.people + 0.2, E.inOutSine);
  const reach = ramp(t, c.mute + 0.05, c.scrape2 - 0.1, E.inOutCubic) * (1 - ramp(t, c.barely - 0.12, c.barely + 0.16, E.inOutCubic));
  const claw = ramp(t, c.band3 - 0.1, c.scrape2 - 0.08) * (1 - ramp(t, c.barely - 0.1, c.barely + 0.05));
  const brace = ramp(t, c.band3 - 0.1, c.band3 + 0.12) * (1 - ramp(t, c.people - 0.04, c.people + 0.1));
  const shrug = ramp(t, c.barely, c.mind + 0.05, E.outBack) * (1 - ramp(t, c.mind_end + 0.1, c.why, E.inOutCubic)) + ramp(t, c.nobodys - 0.02, c.sure, E.outBack) * (1 - ramp(t, c.sure_end + 0.05, c.but + 0.1, E.inOutCubic));
  const eek = ramp(t, c.screams - 0.02, c.screams + 0.1);
  let face = lerpFace(CF.study, CF.cringe, brace);
  face = lerpFace(face, CF.peek, ramp(t, c.people - 0.02, c.people + 0.1));
  face = lerpFace(face, CF.meh, ramp(t, c.barely - 0.05, c.barely + 0.12));
  face = lerpFace(face, CF.study, ramp(t, c.why - 0.1, c.why + 0.1));
  face = lerpFace(face, CF.ask, ramp(t, c.nobodys - 0.05, c.nobodys + 0.1));
  face = lerpFace(face, CF.eek, eek);
  face = { ...face, blink: Math.max(face.blink || 0, pulseOf(t, [c.why_end + 0.1], 0.12)) };
  const A = {
    face, palm: clsPalm(u2, X2), reach, claw, cringe: 0.3 * brace + 0.5 * eek * bumpAt(t, c.screams, 1.6), flinch: 0.55 * eek, shrug: clamp(shrug),
    frizz: 0.45 * eek * bumpAt(t, c.screams, 1.2), headRot: 0.07 * reach - 0.05 * clamp(shrug), headDY: -3 * clamp(shrug) - 5 * eek * bumpAt(t, c.screams, 6), bob: 1.4 * Math.sin(t * 2.4),
    dx: 2.5 * bumpAt(t, c.screams, 4) * Math.sin(t * 64),
  };
  return { A, u: 1, u2, brace, eek };
}
SC.proof = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0, S = proofA(t);
  const cam = camKeys(lt, [[0, 628, 946, 1.47], [c.band3 - T0, 638, 956, 1.54], [c.mind_end - T0, 640, 958, 1.56], [c.why - T0 + 0.4, 642, 944, 1.58], [D, 644, 940, 1.62]]);
  const mute = ramp(t, c.mute - 0.02, c.mute + 0.22) * (1 - ramp(t, c.why - 0.28, c.why - 0.08));
  const B = rulBand();
  const ruler = { line: 1, band: 1, label: 1 - 0.0, mute, q: ramp(t, c.why_end - 0.2, c.why_end + 0.05) * (1 - ramp(t, c.but - 0.05, c.but + 0.12)), pulse: bumpAt(t, c.why, 4) + 0.5 * ramp(t, c.but, c.screams) * Math.abs(Math.sin(t * 10)) };
  const scraping = S.A.claw * (S.u2 > 0.01 && S.u2 < 0.985 ? 1 : 0);
  const sk = ramp(t, c.screams - 0.03, c.screams + 0.16) * (1 - ramp(t, shot.end - 0.12, shot.end));
  classDraw(t, { cam, S, ruler, scratch2: { u: S.u2, x: X2 }, under: () => {
    if (sk <= 0.01) return;   // a scream comes up out of the band, like a jack-in-the-box
    ctx.save(); ctx.beginPath(); ctx.rect(B.x - 400, B.top - 400, 800, 400 + 6); ctx.clip();
    screamHead(B.x, B.top + 44 - 90 * E.outBack(clamp(sk), 2), 50, t, sk);
    ctx.restore();
  }, behind: () => {
    muteIcon(B.x, B.top - 44, 1.25, pulseOf(t, [c.mute + 0.06], c.why - 0.3 - c.mute));
  }, after: () => {
    clsDust(t, S.u2, X2, scraping);
    if (scraping > 0.01) { const P = tipsMid(S.u2, X2); for (let i = 0; i < 4; i++) { const p = (t * 3 + i / 4) % 1; line(ctx, P[0] + 30 + 40 * p, P[1] - 20 + i * 12, P[0] + 52 + 40 * p, P[1] - 20 + i * 12, 3.5, rgba('#DDE6E0', 0.7 * (1 - p))); } }
  } });
  if (scraping > 0.01) screechWord('shhhf', toScreen(cam, 742, 1016), toScreen(cam, 842, 1030), t, scraping, { s0: 50, s1: 62, col0: '#C9D2CE', col1: '#C9D2CE', shake: 0.25 });   // on the board, right of the scrapes, clear of the band's label
  // the verdicts
  tagPill('MUCH LESS AWFUL', 300, 506, '#4DFFB4', ramp(t, c.barely - 0.02, c.barely + 0.16) * (1 - ramp(t, c.why - 0.25, c.why - 0.08)), 31);
  tagPill('NOBODY KNOWS WHY', 300, 506, '#C8A8FF', ramp(t, c.nobodys - 0.02, c.nobodys + 0.16) * (1 - ramp(t, shot.end - 0.14, shot.end)), 32);
  return { glow: 0.85, flash: 0.22 * (1 - ramp(lt, 0, 0.12)) + 0.1 * bumpAt(t, c.screams, 8) };
};

// ================================================================ the listening test: "it's modern music"
function labDraw(t, o) {
  labRoom(o.cam, t);
  labSign(t, o.sign || {});
  const H = labHero(o.cam, t, o.A);
  applyCam(o.cam);
  labDesk(t);
  labWire(H.clip);
  labMeter(t, o.meter || {});
  labSound(t, H, o.zig || 0, o.notes || 0);
  if (o.after) o.after(H);
  return H;
}
// sweat leaving his temples (world units, camera applied)
function labSweat(t, H, k) {
  if (k <= 0.01) return;
  for (let i = 0; i < 7; i++) {
    const p = (t * 1.3 + i / 7) % 1, sd = i % 2 ? 1 : -1, x = H.head[0] + sd * (92 + 70 * p) + 8 * Math.sin(i * 3), y = H.head[1] - 60 + 150 * p * p - 30 * p;
    sweatDrop(ctx, x, y, 0.85 + 0.3 * hash(i), k * Math.sin(Math.PI * clamp(p * 1.2)));
  }
}
SC.music = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0;
  const cam = camKeys(lt, [[0, 490, 846, 1.27], [c.modern - T0, 490, 842, 1.31], [c.less_end - T0, 492, 840, 1.34], [c.skin - T0 + 0.35, 424, 1000, 1.58], [D, 416, 1004, 1.68]]);
  const flip = ramp(t, c.modern - 0.14, c.modern + 0.12, E.inOutCubic), pad = ramp(t, c.hated - 0.02, c.hated + 0.3, E.inOutCubic);
  const less = ramp(t, c.hated - 0.1, c.hated + 0.2), still = ramp(t, c.their - 0.1, c.skin + 0.1), slam = ramp(t, c.sweated - 0.04, c.sweated + 0.08);
  let face = lerpFace(CF.hate, { ...CF.hate, blink: 0.4, lookY: -1, lookX: 0, squeeze: 0.3, browY: 0.6, browTilt: 0.8 }, ramp(t, c.modern - 0.05, c.modern + 0.12));   // he reads the sign
  face = lerpFace(face, CF.snob, less);
  face = lerpFace(face, CF.glance, ramp(t, c.still - 0.05, c.still + 0.12));
  const A = {
    face, padUp: ramp(lt, 0.0, 0.3, E.outBack), paddle: { flip: pad },
    headDX: 2.2 * (1 - flip) * Math.sin(t * 52), headDY: 2.5 * less * Math.sin(t * 5.2) + 1.2 * Math.sin(t * 2.3), headRot: 0.06 * less * (1 - still) - 0.03 * still, bob: 1.2 * Math.sin(t * 2.3),
  };
  const level = lerp(0.84, 0.8, less) + 0.2 * slam;
  labDraw(t, { cam, A, sign: { k: ramp(lt, -0.2, 0.2), flip }, zig: 1 - flip, notes: flip, meter: { level, tremble: 1 + 2 * slam, lamp: slam },
    after: (H) => labSweat(t, H, ramp(t, c.still - 0.1, c.sweated)) });
  tagPill('ONE STUDY, 2011', 726, 1330, '#C8A8FF', ramp(t, c.told - 0.05, c.told + 0.16) * (1 - ramp(t, c.their - 0.3, c.their - 0.1)), 30);
  return { glow: 0.9, capY: 1500, flash: 0.22 * (1 - ramp(lt, 0, 0.12)) + 0.1 * bumpAt(t, c.modern, 9) + 0.1 * bumpAt(t, c.sweated, 8) };
};

// ================================================================ the button: the brain bought it, the skin did not
SC.button = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0;
  const cam = camKeys(lt, [[0, 416, 1004, 1.68], [0.5, 470, 950, 1.32], [c.skin2 - T0, 474, 952, 1.28], [D, 478, 952, 1.32]]);
  const pop = ramp(t, c.sproing - 0.02, c.sproing + 0.2), caught = ramp(t, c.not - 0.04, c.not + 0.1);
  let face = lerpFace(CF.glance, CF.snob, ramp(t, c.brain - 0.1, c.brain + 0.1));
  face = lerpFace(face, CF.glance, ramp(t, c.skin2 - 0.05, c.skin2 + 0.12));
  face = lerpFace(face, CF.caught, caught);
  const A = { face, padUp: 1, paddle: { flip: 1 }, frizz: 0.42 * pop, headDY: 1.2 * Math.sin(t * 2.3) - 4 * bumpAt(t, c.sproing, 5), headRot: 0.05 * (1 - caught) * ramp(t, c.brain, c.bought) * (1 - ramp(t, c.skin2 - 0.1, c.skin2 + 0.1)), bob: 1.2 * Math.sin(t * 2.3),
    headDX: 2 * bumpAt(t, c.sproing, 4) * Math.sin(t * 60) };
  const wild = ramp(t, c.skin2 - 0.05, c.skin2 + 0.2);
  let Hh = null;
  labDraw(t, { cam, A, sign: { k: 1, flip: 1 }, notes: 1 - caught, meter: { level: 1, tremble: 3 + 4 * wild, lamp: 1, pop, popT: Math.max(0, t - c.sproing) },
    after: (H) => { Hh = H; labSweat(t, H, 1); } });
  const Hs = toScreen(cam, Hh.top[0], Hh.top[1]);
  labBrain(268, 700, 0.9, t, ramp(t, c.brain - 0.1, c.brain + 0.12), [Hs[0] - 70, Hs[1] + 40]);
  tagPill('BRAVO!', 268, 574, '#FFD447', ramp(t, c.bought - 0.04, c.bought + 0.14), 42);
  const bang = bumpAt(t, c.sproing, 5);
  if (bang > 0.05) { const M = toScreen(cam, LAB.meter[0], LAB.meter[1] - 30); shockLines(M[0], M[1], 170, 1 - bang, 12, '#FFFFFF', 4); }
  return { glow: 0.9, capY: 1150, flash: 0.14 * bumpAt(t, c.sproing, 8) };
};

SC.loop = (lt, t, shot) => {
  const tt = t - TLd.duration, S = hookA(tt), cam = hookCam(tt);
  classDraw(t, { cam, S, after: () => { clsDust(tt, S.u, CLS.x, 1); clsSqueal(tipsMid(S.u, CLS.x), Math.floor(tt * 30), 1, 1); } });
  skreee(cam, tt, 1);
  return { glow: 0.85, flash: 0.2 * (1 - ramp(lt, 0, 0.1)) };
};

// ================================================================ the cover (rendered by src/cover.sh from a one-shot timeline)
SC.cover = (lt, t) => {
  const cam = { x: 560, y: 1150, zoom: 1.78, rot: 0 }, u = 0.62;
  const A = { face: CF.cringe, palm: clsPalm(u), reach: 1, claw: 1, cringe: 0.75, flinch: 0.8, frizz: 0.6, headRot: -0.04 };
  classDraw(0.5, { cam, S: { A, u }, after: () => { clsSqueal(tipsMid(u, CLS.x), 11, 1, 1.5); clsDust(0.5, u, CLS.x, 1); } });
  screenSpace();
  bigWord('WHY IS THIS SOUND', 540, 1262, 112, '#FFFFFF', 1, -0.03);
  bigWord('SO AWFUL?', 540, 1432, 218, '#FFD447', 1, -0.03);
  return { glow: 0.85, noCaptions: true };
};

setLights({ hook: CLASS_LIGHT, loop: CLASS_LIGHT, cover: CLASS_LIGHT, proof: CLASS_LIGHT, canal: IN_LIGHT, alarm: IN_LIGHT, music: LAB_LIGHT, button: LAB_LIGHT });

function initScenes2() {
  initClass();
  initLab();
}
