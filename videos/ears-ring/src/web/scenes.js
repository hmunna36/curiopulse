// Why Do Your Ears RING After a Concert? Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside
// the shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;
const pulseOf = (t, times, len = 0.16) => times.reduce((m, f) => Math.max(m, clamp((t - f) / 0.03) * clamp((f + len - t) / 0.05)), 0);
const bumpAt = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);
// a screen-space view from keys [t, k, cx, cy, dx, dy] (absolute time)
function vKeys(t, keys, ease = E.inOutCubic) {
  let k = keys[0];
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1], b = keys[i];
    if (t >= b[0]) { k = b; continue; }
    if (t > a[0]) { const u = ease(inv(a[0], b[0], t)); k = a.map((v, j) => (j ? lerp(v, b[j], u) : t)); }
    break;
  }
  return { k: k[1], cx: k[2], cy: k[3], dx: k[4] || 0, dy: k[5] || 0 };
}

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the gig: the show's lamps are above and behind him (magenta and blue), a warm key from the upper left; after the last
// chord the house lights: colder and flatter
const SHOW_LIGHT = { ...LIGHTS.lanterns, key: [-0.32, -0.80, 0.52], keyTint: [1.08, 0.97, 1.06], shadowTint: [0.62, 0.56, 0.92], rim: [0.92, 0.45, 1.0], rimFrom: [0.85, -0.45], rimAmt: 1.45, pool: 0.66, halo: 0.12, haloColor: [0.95, 0.55, 1.0] };
const HOUSE_LIGHT = { ...LIGHTS.night, key: [-0.36, -0.78, 0.55], rim: [0.55, 0.72, 1.0], rimAmt: 1.15, pool: 0.6 };
const showLight = (lt, t) => (t < cu().stop + 0.05 || t > cu().so2 + 0.3 ? SHOW_LIGHT : HOUSE_LIGHT);
const INNER_LIGHT = { ...LIGHTS.inside, rim: [1.0, 0.62, 0.85], pool: 0.3, halo: 0 };
const ROOM_LIGHT = { ...LIGHTS.night, key: [-0.25, -0.85, 0.5], keyTint: [0.94, 1.0, 1.08], rim: [0.5, 0.85, 1.0], rimFrom: [0.0, -1.0], rimAmt: 1.1, pool: 0.75, poolTint: [0.4, 0.46, 0.78] };
const YARD_LIGHT = { ...LIGHTS.night, rim: [0.75, 0.82, 1.0], rimFrom: [0.85, -0.4], rimAmt: 1.3 };

// ---------------------------------------------------------------- his faces
const FF = {
  rock: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 1.0, browTilt: -0.35, mouth: 'grin', mouthOpen: 1.25, blink: 1, cross: 0 },
  blank: { eyeOpen: 1.12, pupil: 0.9, lookX: -0.35, lookY: -0.2, browY: 0.8, browTilt: 0.6, mouth: 'o', mouthOpen: 0.25, blink: 0, cross: 0 },   // huh? (puzzled, not deadpan: no held stare before 12 s)
  hear: { eyeOpen: 1.38, pupil: 0.55, lookX: -0.6, lookY: -0.4, browY: 1.45, browTilt: 0.5, mouth: 'o', mouthOpen: 0.7, blink: 0, cross: 0 },
  poke: { eyeOpen: 1.15, pupil: 0.8, lookX: -0.9, lookY: -0.2, browY: 0.9, browTilt: 0.9, mouth: 'wavy', mouthOpen: 0.35, blink: 0, cross: 0 },
  upward: { eyeOpen: 1.25, pupil: 0.75, lookX: 0.1, lookY: -1, browY: 1.3, browTilt: 0.4, mouth: 'o', mouthOpen: 0.45, blink: 0, cross: 0 },
  wince: { eyeOpen: 0.75, pupil: 0.9, lookX: 0, lookY: -0.8, browY: 0.9, browTilt: 1.2, mouth: 'grimace', mouthOpen: 0.8, blink: 0.3, cross: 0 },
  grin: { eyeOpen: 1, pupil: 1, lookX: 0.1, lookY: 0, browY: 0.6, browTilt: -0.3, mouth: 'grin', mouthOpen: 0.9, blink: 0, cross: 0 },
  smug: { eyeOpen: 0.9, pupil: 1, lookX: 0.6, lookY: 0, browY: 0.8, browTilt: -0.55, mouth: 'grin', mouthOpen: 0.5, blink: 0.45, cross: 0 },
};

// ================================================================ the band's beat, and his headbang on it
// u = where tt sits between two beats (0 = on a beat: his head at the bottom of a bang)
const beatU = (tt) => { const P = cu().beat_p; return (((tt / P) % 1) + 1) % 1; };
// how far down his head is (0 top .. 1 bottom): down fast on the beat, up slower, a short hold at the top
const bangDown = (u) => (u < 0.55 ? 1 - E.outCubic(u / 0.55) : u < 0.8 ? 0 : E.inCubic((u - 0.8) / 0.2));
// frame 1 as a function of tt = seconds since frame 1 (negative = the last frames of the Short, on their way here)
function hookA(tt) {
  const c = cu();
  const playing = tt < c.stop;
  const u = beatU(tt), d = bangDown(u);
  let A;
  if (playing) {
    A = {
      face: FF.rock, armL: CN_ARM.downL,
      armR: { e: CN_ARM.hornsR.e, w: [CN_ARM.hornsR.w[0], CN_ARM.hornsR.w[1] + 26 * d] },
      headDY: 32 * d, headRot: 0.05 * Math.sin(tt * Math.PI / c.beat_p), bob: 9 * d, lean: 0.02 * Math.sin(tt * Math.PI / c.beat_p),
      horns: 1, flyHair: u < 0.22 ? 1 - u / 0.22 : 0,
    };
  } else {
    const after = tt - c.stop;
    const rise = ramp(after, 0.22, 0.7, E.inOutSine);
    let face = lerpFace(FF.rock, FF.blank, ramp(after, 0.08, 0.26));
    face = lerpFace(face, FF.hear, ramp(tt, c.ringing - 0.06, c.ringing + 0.12));
    face = lerpFace(face, FF.poke, ramp(tt, c.poke + 0.15, c.poke + 0.45));
    face = lerpFace(face, FF.upward, ramp(tt, c.brain1 - 0.25, c.brain1 + 0.1));
    face = lerpFace(face, FF.wince, ramp(tt, c.eleven - 0.05, c.eleven + 0.1));
    const jolt = bumpAt(tt, c.ringing, 7);
    const toEar = ramp(tt, c.poke, c.poke + 0.3, E.outBack);
    A = {
      face,
      armL: { e: [lerp(CN_ARM.downL.e[0], CN_ARM.earL.e[0], toEar), lerp(CN_ARM.downL.e[1], CN_ARM.earL.e[1], toEar)], w: [lerp(CN_ARM.downL.w[0], CN_ARM.earL.w[0], toEar), lerp(CN_ARM.downL.w[1], CN_ARM.earL.w[1], toEar)] },
      armR: { e: CN_ARM.hornsR.e, w: [CN_ARM.hornsR.w[0], CN_ARM.hornsR.w[1] + 26 * (1 - rise) - 8 * jolt] },
      headDY: 32 * (1 - rise) - 10 * jolt, headRot: -0.03 * jolt + 0.02 * Math.sin(tt * 2.2), bob: 9 * (1 - rise) - 4 * jolt, lean: 0,
      horns: 1, finger: toEar, wiggle: ramp(tt, c.poke + 0.3, c.poke + 0.4) * (1 - ramp(tt, c.brain1 - 0.4, c.brain1)),
      frizz: 0.35 * jolt, flyHair: 0,
    };
  }
  // the window on his head, and the brain inside it
  const g = ramp(tt, c.brain1 - 0.1, c.brain1 + 0.3);
  const reach = ramp(tt, c.cranking - 0.1, c.cranking + 0.25, E.outBack);
  let knob = 4 + 6 * ramp(tt, c.cranking + 0.15, c.to, E.inOutSine);
  if (tt >= c.eleven) knob = 10 + E.outBack(ramp(tt, c.eleven, c.eleven + 0.18), 2.5);
  const brain = { mood: tt >= c.eleven ? 'wow' : tt >= c.cranking ? 'grin' : 'think', look: tt >= c.cranking ? [0.9, -0.2] : [0.6, -0.3], knob, level: knob / 11, wave: 0.3 + 0.45 * knob / 11, reach, ring: 0, noise: 0, shake: 1.2 * bumpAt(tt, c.eleven, 6) };
  const ringK = playing ? 0 : ramp(tt, c.ringing - 0.05, c.ringing + 0.15) * (0.75 + 0.25 * knob / 11) + 0.6 * bumpAt(tt, c.eleven, 3);
  return { A, playing, u, d, ringK, knob, win: g, brain };
}
// the speaker beside him: where it stands, and how hard the cone pumps (on the beat)
const SPK = { x: 300, y: 1360, s: 0.75 };
function hookCam(tt) {
  const c = cu(), HY = CN_HEADY;
  const k = camKeys(tt, [[-0.4, 562, HY + 2, 2.98], [0, 560, HY + 0, 3.0], [1.2, 552, HY + 4, 2.85], [c.stop, 540, HY + 6, 2.6], [c.stop + 0.6, 526, HY - 20, 2.2], [c.ringing, 530, HY - 4, 2.42],
    [c.poke + 0.3, 520, HY + 4, 2.6], [c.ears2, 506, HY + 6, 2.85], [c.brain1, 536, HY - 150, 2.5], [c.cranking + 0.2, 540, HY - 214, 2.95], [c.eleven, 542, HY - 220, 3.2], [c.dive + 0.3, 540, HY - 222, 3.3]], E.inOutCubic);
  const playing = tt < c.stop;
  const sh = (playing ? 3.2 * (0.5 + bangDown(beatU(tt))) : 0) + 10 * bumpAt(tt, c.eleven, 6) + 5 * bumpAt(tt, c.ringing, 8);
  k.x += sh * vnoise(tt * 31, 3) / Math.max(1, k.zoom / 2.6); k.y += sh * vnoise(tt * 27, 8) / Math.max(1, k.zoom / 2.6);
  return k;
}
function gigDraw(tt, t, o) {
  const S = o.S, cam = o.cam, lights = o.lights, playing = o.playing === undefined ? lights > 0.5 : o.playing;
  cnBack(cam, t, { lights, strobe: o.strobe || 0 });
  cnCrowd(cam, t, { crowd: playing ? 1 : 0, bob: playing ? bangDown(beatU(tt)) : 0 });
  cnSpeaker(cam, SPK.x, SPK.y, SPK.s, t, playing ? bangDown(beatU(tt)) : 0);
  cnBlast(cam, SPK.x + 96, SPK.y - 150, t, (playing ? 0.8 : 0) * (0.5 + 0.5 * bangDown(beatU(tt))), 1);
  if (o.before) o.before(cam);
  if (S.ringK > 0.02) {   // the ring: out of both ears, behind him
    const st0 = cnSt(S.A);
    ringLines(cam, cnHeadPt(st0, -62, 2), -1, t, S.ringK, 1.05);
    ringLines(cam, cnHeadPt(st0, 62, 2), 1, t, S.ringK, 1.05);
  }
  const H = cnHero(cam, t, S.A);
  cnOcclude(cam, H);
  if (o.after) o.after(cam, H);
  return H;
}

SC.hook = (lt, t, shot) => {
  const c = cu(), S = hookA(t), cam = hookCam(t);
  // the cut into his ear: a quick push on the window and a flash (the cells shot opens with a zoom blur)
  const dive = ramp(t, c.dive, shot.end, E.inCubic);
  const lights = S.playing ? 1 : 0;
  const H = gigDraw(t, t, { cam, S, lights, strobe: S.playing ? 0.6 * pulseOf(t, c.beats, 0.08) : 0 });
  // the window on his head: his brain at its amplifier
  if (S.win > 0.01) brainWindow(cam, H, t, S);
  // the last chord: lines off his head
  const hit = bumpAt(t, c.stop, 5);
  if (hit > 0.05 && t < c.ringing) { const P = toScreen(cam, H.head[0], H.head[1]); screenSpace(); shockLines(P[0], P[1], 330, 1 - hit, 12, '#FFFFFF', 4); }
  // EEEEE over his head, on "RINGING"
  screenSpace();
  const E1 = toScreen(cam, H.top[0], H.top[1] - 40);
  ringWord('EEEEEE', 540, clamp(E1[1], 540, 900), 72, popK(t, c.ringing, c.ears2 - 0.1, 0.1, 0.12), t);
  // his ear, crossed out: "isn't your ears"
  const Ep = toScreen(cam, H.earL[0] - 30, H.earL[1] - 70);
  earTag(Ep[0], Ep[1], popK(t, c.ears2 - 0.04, c.brain1 + 0.1, 0.1, 0.1), ramp(t, c.ears2 + 0.12, c.ears2 + 0.4));
  return { glow: 0.85, zblur: 0.14 * dive, zcx: 540, zcy: 900, flash: 0.22 * bumpAt(t, c.stop, 10) + 0.12 * bumpAt(t, c.eleven, 10) + 0.45 * ramp(t, shot.end - 0.07, shot.end) };
};
// a sound as shaking letters (screen)
function ringWord(txt, x, y, size, k, t) {
  if (k <= 0.01) return;
  const c = ctx, s = E.outBack(clamp(k), 2);
  c.save(); c.translate(x, y); c.scale(s, s); c.rotate(-0.08);
  c.font = `400 ${size}px Anton`; c.textAlign = 'center'; c.textBaseline = 'middle';
  let xx = -c.measureText(txt).width / 2;
  for (let i = 0; i < txt.length; i++) {
    const ch = txt[i], w = c.measureText(ch).width, jx = 3 * Math.sin(t * 70 + i * 2), jy = 3 * Math.sin(t * 63 + i * 3);
    c.lineWidth = 9; c.strokeStyle = '#1A1030'; c.strokeText(ch, xx + w / 2 + jx, jy); c.fillStyle = '#FFE27A'; c.fillText(ch, xx + w / 2 + jx, jy);
    xx += w * 0.92;
  }
  c.restore();
  softDot(gctx, x, y, 220, '#FFD447', 0.35 * k);
}
// a small pill with an ear icon and a red strike across it (screen)
function earTag(x, y, k, strike) {
  if (k <= 0.01) return;
  const c = ctx, s = E.outBack(clamp(k), 2);
  x = clamp(x, 200, 820); y = clamp(y, 520, 1000);
  c.save(); c.translate(x, y); c.scale(s, s);
  rrect(c, -140, -48, 280, 96, 48); c.fillStyle = '#0E0B1E'; c.fill(); c.lineWidth = 6; c.strokeStyle = '#FF86A6'; c.stroke();
  c.font = '900 52px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#FFFFFF'; c.fillText('EARS', 0, 3);
  if (strike > 0.01) line(c, -120, 26, -120 + 240 * strike, -26, 11, '#FF4D5E');
  c.restore();
}

// ================================================================ 2. inside his ear: the hair cells
// how bent the hairs are after the three slams (with a springy overshoot)
function slamBend(t) {
  const sl = cu().slams;
  let b = 0.05, tgt = [0.55, 0.82, 1.0];
  for (let i = 0; i < 3; i++) if (t >= sl[i]) { const u = t - sl[i]; b = tgt[i] + 0.22 * Math.exp(-u * 7) * Math.cos(u * 22); }
  return clamp(b, 0, 1.15);
}
function cellsWaves(t) {
  return cu().slams.map((s) => ({ u: (t - (s - 0.42)) / 0.42, k: 1 }));
}
SC.cells = (lt, t, shot) => {
  const c = cu();
  erCellsBg(t);
  const V = vKeys(t, [[shot.start, 1.5, 540, 980, 0, 60], [c.flattens - 0.1, 1.28, 540, 980, 0, 30], [c.haircells, 1.12, 540, 980, 0, -40], [c.less, 1.1, 540, 980, 0, -50], [c.through_end, 1.04, 540, 1000, 0, -110]]);
  const b = slamBend(t);
  const mood = t < c.slams[0] ? 'alert' : t < c.slams[2] + 0.25 ? 'panic' : 'dazed';
  const sig = 1 - 0.86 * ramp(t, c.less, c.through, E.inOutSine);
  erCells(t, { V, bend: ERC.xs.map((_, i) => b * (1 + 0.06 * (i - 2))), mood, waves: cellsWaves(t), signal: sig,
    label: popK(t, c.haircells - 0.05, c.less - 0.1, 0.1, 0.1), meter: popK(t, c.less - 0.1, shot.end + 1, 0.1, 0.1), meterLvl: sig });
  // a flash on each slam
  const fl = c.slams.reduce((m, s) => Math.max(m, bumpAt(t, s, 12)), 0);
  return { glow: 0.85, zblur: 0.22 * (1 - ramp(lt, 0, 0.35)), zcx: 540, zcy: 960, flash: 0.14 * fl };
};

// ================================================================ 3. the brain at its amplifier
const AMPP = { x: 690, y: 890, s: 1.12 }, BRP = { x: 300, y: 935, s: 0.95 };
function brainBg(t) {
  screenSpace();
  const c = ctx, g = c.createRadialGradient(540, 860, 80, 540, 900, 1200);
  g.addColorStop(0, '#3A1E5E'); g.addColorStop(0.6, '#1E0E36'); g.addColorStop(1, '#0C0618');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  // a mesh of nerve cells, faint, with sparks running along it
  const rng = mulberry32(5);
  const pts = []; for (let i = 0; i < 22; i++) pts.push([rng() * 1180 - 50, 380 + rng() * 1350]);
  paint(() => {
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]);
      if (d < 290) line(c, pts[i][0], pts[i][1], pts[j][0], pts[j][1], 3, 'rgba(200,140,255,0.13)');
    }
    for (const p of pts) circle(c, p[0], p[1], 7, 'rgba(220,170,255,0.25)');
  });
  for (let i = 0; i < 6; i++) { const p = pts[(i * 5 + Math.floor(t * 2)) % pts.length]; softDot(gctx, p[0], p[1], 40, '#C8A8FF', 0.35 * (0.5 + 0.5 * Math.sin(t * 3 + i))); }
}
function ampState(t) {
  const c = cu();
  let knob = 4;
  knob = lerp(knob, 10, ramp(t, c.cranks, c.knob_end, E.inOutSine));
  if (t >= c.knob_end) knob = 10 + E.outBack(ramp(t, c.knob_end, c.knob_end + 0.2), 2.5);
  const noise = ramp(t, c.static - 0.25, c.static + 0.1) * (1 - ramp(t, c.ring2 - 0.05, c.ring2 + 0.25));
  const ring = ramp(t, c.ring2 - 0.05, c.ring2 + 0.25);
  return { knob, level: t < c.cranks ? 0.12 : knob / 11, wave: t < c.cranks ? 0.08 : 0.08 + 0.3 * ramp(t, c.cranks, c.knob_end), noise, ring, shake: 0.6 * noise + 0.4 * ring + 1.2 * bumpAt(t, c.knob_end, 6) };
}
// the brain and its amp in "amp space" (the amp shot's own screen coordinates); the caller sets both transforms.
// A: {knob, level, wave, noise, ring, shake, mood, look, lean 0..1 (in toward the scope), tap 0..1, grab 0..1 (its hand
// on the knob), reach (the same, in the hook), bob}
function ampScene(t, A) {
  const scope = [AMPP.x - 68 * AMPP.s, AMPP.y - 64 * AMPP.s];
  ctx.save(); ctx.translate(AMPP.x, AMPP.y); erAmp(ctx, AMPP.s, t, A); ctx.restore();
  erAmpGlow(AMPP.x, AMPP.y, AMPP.s, t, A);
  const lean = A.lean || 0, tap = A.tap || 0, grab = Math.max(A.grab || 0, A.reach || 0);
  const toS = (p) => [(p[0] - BRP.x) / BRP.s, (p[1] - BRP.y) / BRP.s];
  const kp = erKnobPt(AMPP.x, AMPP.y, AMPP.s, A.knob, 0.75);
  let armR;
  if (grab > 0.01) armR = toS([lerp(BRP.x + 176 * BRP.s, kp[0], grab), lerp(BRP.y + 118 * BRP.s, kp[1], grab)]);
  else if (lean > 0.01) armR = toS([lerp(BRP.x + 176 * BRP.s, scope[0] - 60 + 20 * tap, lean), lerp(BRP.y + 118 * BRP.s, scope[1] + 10, lean)]);
  actor(() => erBrain(ctx, BRP.x + 40 * lean, BRP.y - 10 * lean, BRP.s, t, { mood: A.mood, look: A.look || [0.9, -0.2], armR, lean: 0.08 * lean, bob: A.bob || 0 }));
}
function ampXform(V) {
  for (const cc of [ctx, gctx]) { cc.save(); if (cc === ctx) cc.setTransform(1, 0, 0, 1, 0, 0); else cc.setTransform(0.5, 0, 0, 0.5, 0, 0); cc.translate(V.cx + V.dx, V.cy + V.dy); cc.scale(V.k, V.k); cc.translate(-V.cx, -V.cy); }
}
// the round window on his head (the hook): world centre over his head, the amp scene fitted inside it
const WIN = { lx: 6, ly: -238, r: 150 };
function brainWindow(cam, H, t, S) {
  const g = S.win, st = H.st, C = cnHeadPt(st, WIN.lx, WIN.ly), P = toScreen(cam, C[0], C[1]), R = WIN.r * cam.zoom * E.outBack(clamp(g), 1.6);
  const base = toScreen(cam, ...cnHeadPt(st, 0, -78));
  screenSpace();
  // the stem from his head to the window
  ctx.beginPath(); ctx.moveTo(base[0] - 26 * g, base[1]); ctx.lineTo(P[0] - 60 * g, P[1] + R * 0.9); ctx.lineTo(P[0] + 60 * g, P[1] + R * 0.9); ctx.lineTo(base[0] + 26 * g, base[1]); ctx.closePath();
  ctx.fillStyle = rgba('#BFE8FF', 0.9 * clamp(g * 2)); ctx.fill();
  for (const cc of [ctx, gctx]) { cc.save(); cc.setTransform(cc === ctx ? 1 : 0.5, 0, 0, cc === ctx ? 1 : 0.5, 0, 0); cc.beginPath(); cc.arc(P[0], P[1], Math.max(1, R), 0, Math.PI * 2); cc.clip(); }
  brainBg(t);
  const f = (2 * R) / 760;
  for (const cc of [ctx, gctx]) { cc.save(); cc.setTransform(cc === ctx ? 1 : 0.5, 0, 0, cc === ctx ? 1 : 0.5, 0, 0); cc.translate(P[0], P[1]); cc.scale(f, f); cc.translate(-600, -880); }
  ampScene(t, S.brain);
  ctx.restore(); gctx.restore();
  ctx.restore(); gctx.restore();
  screenSpace();
  ctx.beginPath(); ctx.arc(P[0], P[1], Math.max(1, R), 0, 7); ctx.lineWidth = 12; ctx.strokeStyle = '#BFE8FF'; ctx.stroke();
  gctx.beginPath(); gctx.arc(P[0], P[1], Math.max(1, R), 0, 7); gctx.lineWidth = 22; gctx.strokeStyle = rgba('#7FE9FF', 0.6 * g); gctx.stroke();
  // "11!" by the knob, once it is past 10
  if (S.brain.knob > 10.2) {
    const kp = [P[0] + (AMPP.x + ERK.x * AMPP.s - 600) * f, P[1] + (AMPP.y + ERK.y * AMPP.s - 880) * f];
    bigWord('11!', clamp(kp[0] + 90, 300, 790), clamp(kp[1] - 120, 520, 1000), 130, '#FF5A6E', E.outBack(clamp((S.brain.knob - 10.2) / 0.8)), 0.12);
    softDot(gctx, kp[0], kp[1], 200, '#FF4D5E', 0.6);
  }
}
SC.amp = (lt, t, shot) => {
  const c = cu(), A = ampState(t);
  brainBg(t);
  const knobP = [AMPP.x + ERK.x * AMPP.s, AMPP.y + ERK.y * AMPP.s];
  const V = vKeys(t, [[shot.start, 1.0, 540, 930], [c.goes_end, 1.06, 540, 930], [c.who, 1.32, 520, 880, -10, 0], [c.so, 1.3, 600, 860], [c.cranks + 0.2, 1.38, 700, 860, -40, 0],
    [c.hears, 1.18, 620, 880], [c.static, 1.24, 600, 860], [c.ring2, 1.06, 560, 900], [shot.end, 1.0, 560, 920]]);
  ampXform(V);
  // the brain: looks at the scope, leans in, taps it twice; then grabs the knob and cranks it
  A.lean = ramp(t, c.who - 0.1, c.who + 0.3) * (1 - ramp(t, c.so - 0.1, c.so + 0.2));
  A.tap = pulseOf(t, c.tap, 0.1);
  A.grab = ramp(t, c.so, c.cranks, E.outBack);
  A.mood = t < c.who ? 'think' : t < c.so ? 'worried' : t < c.static - 0.1 ? 'squint' : t < c.ring2 ? 'wow' : 'squint';
  A.look = t < c.so ? [0.9, -0.3] : [0.9, -0.2];
  A.bob = -6 * pulseOf(t, [c.knob_end], 0.2);
  ampScene(t, A);
  ctx.restore(); gctx.restore();
  screenSpace();
  // "?" over the brain on "who turned it DOWN?"
  const qk = popK(t, c.down - 0.05, c.so, 0.1, 0.1);
  if (qk > 0.01) bigWord('?', 300, 640, 170, '#FFD447', E.outBack(qk), 0.12);
  // the hiss, then EEEEE out of the speaker
  ringWord('EEEEEE', 660, 560, 78, popK(t, c.ring2 - 0.02, shot.end + 1, 0.1, 0.1), t);
  if (A.ring > 0.02) for (let i = 0; i < 3; i++) {   // the ring leaving the amp: thin bright arcs to the right and up
    const u = (t * 1.4 + i / 3) % 1, r = 120 + u * 380, P = [];
    for (let j = 0; j <= 24; j++) { const an = -1.9 + 1.2 * (j / 24); P.push([AMPP.x + Math.cos(an) * r, AMPP.y - 40 + Math.sin(an) * r + 5 * Math.sin(j * 2 + t * 50)]); }
    paint(() => poly(ctx, P, 5, rgba('#FFF3B0', 0.9 * A.ring * (1 - u))));
    poly(gctx, P, 12, rgba('#FFD447', 0.8 * A.ring * (1 - u)));
  }
  // the knob passing 10: a spark
  if (t > c.knob_end - 0.05) softDot(gctx, knobP[0], knobP[1], 220, '#FF4D5E', 0.7 * bumpAt(t, c.knob_end, 4));
  const tag = popK(t, c.static + 0.05, c.thats - 0.05, 0.1, 0.1);
  if (tag > 0.01) erTag('STATIC', 560, 1150, tag, '#C8A8FF');
  const tag2 = popK(t, c.ring2, shot.end + 1, 0.1, 0.1);
  if (tag2 > 0.01) erTag('THE RING', 540, 1150, tag2, '#FFD447');
  return { glow: 0.85, flash: 0.14 * bumpAt(t, c.knob_end, 10) };
};

// ================================================================ 4. the silent room
function roomFaces(t) {
  const c = cu(), r = c.rings;
  const heard = r.map((x) => ramp(t, x - 0.04, x + 0.16));
  return heard;
}
SC.proof = (lt, t, shot) => {
  const c = cu();
  const cam = camKeys(t, [[shot.start, 540, 1100, 1.5], [c.silent, 540, 1096, 1.56], [c.most, 540, 1092, 1.62], [shot.end, 540, 1090, 1.66]], E.inOutSine);
  rmRoom(cam, t, { sign: ramp(t, c.silent - 0.05, c.silent + 0.1) * (1 - popK(t, c.most, shot.end + 1, 0.05, 0.1)) + 0.0 });
  applyCam(cam);
  for (const x of RM.xs) rmStool(ctx, x);
  const hd = roomFaces(t);
  // gran on the left, the teen on the right (rings 2 and 3), him in the middle (ring 1)
  const sway = (i) => 0.02 * Math.sin(t * 1.3 + i);
  actor(() => rmPassenger(ctx, PASS.gran, { x: RM.xs[0], y: RM.seat, s: 1, tilt: sway(0) - 0.06 * hd[1], lookX: 0.6 * hd[1], lookY: -0.9 * hd[1], brow: 1.2 * hd[1], mouthO: 0.8 * hd[1], smile: 0.3 * (1 - hd[1]) }, t));
  actor(() => rmPassenger(ctx, PASS.teen, { x: RM.xs[2], y: RM.seat, s: 1, tilt: sway(2) + 0.06 * hd[2], lookX: -0.6 * hd[2], lookY: -0.9 * hd[2], brow: 1.2 * hd[2], mouthO: 0.8 * hd[2] }, t));
  const face = lerpFace(FF.blank, FF.upward, hd[0]);
  const Hh = rmHero(cam, t, { face, headRot: 0.04 * hd[0] * Math.sin(t * 3) });
  // rings over each of them, and a "?" each
  const heads = [[RM.xs[0], 998], [RM.xs[1], 1002], [RM.xs[2], 998]], order = [1, 0, 2];
  order.forEach((who, j) => {
    const k = hd[j];
    if (k < 0.02) return;
    const [hx, hy] = heads[who];
    ringLines(cam, [hx - 56, hy + 4], -1, t + j, k * 0.85, 0.78);
    ringLines(cam, [hx + 56, hy + 4], 1, t + j, k * 0.85, 0.78);
  });
  void Hh;
  // 94% of them heard sounds (Heller & Bergman, 1953)
  screenSpace();
  const sk = popK(t, c.most - 0.04, shot.end + 1, 0.1, 0.1);
  if (sk > 0.01) {
    bigWord('94%', 540, 548, 170, '#FFD447', E.outBack(sk), -0.04);
    erTag('HEARD SOUNDS · 1953', 540, 660, clamp(sk * 1.3 - 0.3), '#7FE9FF');
  }
  return { glow: 0.8, zblur: 0.12 * (1 - ramp(lt, 0, 0.25)) };
};

// ================================================================ 5. a day later: the hairs stand back up... one doesn't
SC.fades = (lt, t, shot) => {
  const c = cu();
  erCellsBg(t);
  const up = (i) => ramp(t, c.fades + 0.15 + i * 0.16, c.fades + 0.45 + i * 0.16, E.outBack);
  const order = [0, 4, 1, 3];   // the dead one (2) never gets up
  const bend = ERC.xs.map((_, i) => (i === 2 ? 1.05 : 1 - up(order.indexOf(i))));
  const gone = ramp(t, c.die - 0.05, c.die + 0.3);
  const popAway = ramp(t, c.grow, c.grow + 0.25, E.inCubic);
  const mood = ERC.xs.map((_, i) => (i === 2 ? (t < c.but ? 'dazed' : 'dazed') : up(order.indexOf(i)) > 0.6 ? (t > c.die ? 'sad' : 'happy') : 'dazed'));
  const V = vKeys(t, [[shot.start, 1.14, 540, 1000, 0, -70], [c.but, 1.18, 540, 1000, 0, -64], [c.die, 1.22, 540, 1000, 0, -60], [shot.end, 1.24, 540, 1000, 0, -58]]);
  erCells(t, { V, bend, mood, signal: 0.5 + 0.5 * ramp(t, c.fades, c.two), gone: { i: 2, k: gone }, regrow: { i: 2, k: 1 - popAway }, missing: [] });
  // the day counter
  screenSpace();
  const dk = popK(t, shot.start + 0.05, c.but, 0.1, 0.1);
  if (dk > 0.01) {
    const day = t < c.two ? 1 : 2, sp = ramp(t, c.fades, c.two_end) * Math.PI * 4;
    ctx.save(); ctx.translate(540, 520); const s = E.outBack(dk, 2); ctx.scale(s, s);
    rrect(ctx, -170, -54, 340, 108, 54); ctx.fillStyle = '#0E0B1E'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#4DFFB4'; ctx.stroke();
    paint(() => {
      ctx.save(); ctx.translate(-104, 0); ctx.rotate(sp); circle(ctx, 0, 0, 30, '#FFD447'); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; line(ctx, Math.cos(a) * 38, Math.sin(a) * 38, Math.cos(a) * 48, Math.sin(a) * 48, 6, '#FFD447'); } ctx.restore();
      ctx.font = '900 54px Montserrat'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFFFFF'; ctx.fillText('DAY ' + day, -50, 4);
    });
    ctx.restore();
    softDot(gctx, 436, 520, 90, '#FFD447', 0.5 * dk);
  }
  const gk = popK(t, c.never - 0.04, shot.end + 1, 0.1, 0.1);
  if (gk > 0.01) erTag('GONE FOR GOOD', 540, 540, gk, '#FF5A6E');
  return { glow: 0.85 };
};

// ================================================================ 6. the chicken: her hair cells grow back
function yardBg(t) {
  screenSpace();
  const c = ctx, g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#0B1030'); g.addColorStop(0.6, '#1B2456'); g.addColorStop(1, '#141A3A');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  circle(c, 250, 560, 46, '#F4F0DC'); softDot(gctx, 250, 560, 170, '#E8F0FF', 0.5);
  // a barn far left and a fence
  c.fillStyle = '#3A1420'; c.beginPath(); c.moveTo(40, 1180); c.lineTo(40, 900); c.lineTo(200, 790); c.lineTo(360, 900); c.lineTo(360, 1180); c.closePath(); c.fill();
  rrect(c, 150, 1010, 100, 170, 8); c.fillStyle = '#24101A'; c.fill();
  c.fillStyle = '#14192E'; c.fillRect(0, 1180, W, 800);
  for (let x = -20; x < 1100; x += 120) { rrect(c, x, 1080, 22, 130, 5); c.fillStyle = '#5A4A3A'; c.fill(); }
  line(c, -40, 1110, 1120, 1110, 14, '#5A4A3A'); line(c, -40, 1160, 1120, 1160, 14, '#5A4A3A');
}
const CHW = { x: 770, y: 760, r: 215 };   // the round window on her ear
SC.chicken = (lt, t, shot) => {
  const c = cu();
  yardBg(t);
  const regrow = ramp(t, c.regrow - 0.02, c.regrow + 0.3);
  const mood = t < c.regrow + 0.1 ? 'deadpan' : 'smug';
  const zoom = 1 + 0.05 * ramp(lt, 0, shot.end - shot.start);
  ctx.save(); gctx.save();
  screenSpace();
  for (const cc of [ctx, gctx]) { cc.translate(540, 1000); cc.scale(zoom, zoom); cc.translate(-540, -1000); }
  erChicken(ctx, gctx, 350, 1420, 1.62, t, { mood, look: [0.9, 0.1], blink: pulseOf(t, [c.theirs_end + 0.15], 0.14) });
  ctx.restore(); gctx.restore();
  screenSpace();
  // the window on her ear, with her hair cells: one missing, then a new one pops up in the gap
  const wk = ramp(t, shot.start, shot.start + 0.25, E.outBack);
  thinLeader([CHW.x - CHW.r * 0.82, CHW.y + CHW.r * 0.55], [520, 830], wk, '#8FB8FF');
  for (const cc of [ctx, gctx]) { cc.save(); cc.setTransform(cc === ctx ? 1 : 0.5, 0, 0, cc === ctx ? 1 : 0.5, 0, 0); cc.beginPath(); cc.arc(CHW.x, CHW.y, CHW.r * wk, 0, Math.PI * 2); cc.clip(); }
  erCellsBg(t, { hue: 'bird' });
  erCells(t, { V: { k: 0.5, cx: 540, cy: 1000, dx: CHW.x - 540, dy: CHW.y - 1000 + 10 }, hue: 'bird', bend: 0.05, mood: ERC.xs.map((_, i) => (i === 2 ? 'happy' : regrow > 0.5 ? 'happy' : 'calm')), signal: 1, regrow: { i: 2, k: regrow }, missing: regrow > 0.001 ? [] : [2] });
  ctx.restore(); gctx.restore();
  screenSpace();
  ctx.beginPath(); ctx.arc(CHW.x, CHW.y, CHW.r * wk, 0, 7); ctx.lineWidth = 9; ctx.strokeStyle = '#CFE0FF'; ctx.stroke();
  // sparkles where the new cell comes up
  if (regrow > 0.01 && regrow < 0.999 || t < c.regrow + 0.6) for (let i = 0; i < 6; i++) {
    const a = i * 1.05 + t * 2, r = 40 + 30 * regrow, k = popK(t, c.regrow + i * 0.04, c.regrow + 0.7 + i * 0.04, 0.05, 0.15);
    if (k > 0.01) { const px = CHW.x + Math.cos(a) * r, py = CHW.y + 10 + Math.sin(a) * r * 0.7; circle(ctx, px, py, 7 * k, '#FFFFFF'); softDot(gctx, px, py, 30, '#BFF0FF', 0.9 * k); }
  }
  const pk = popK(t, c.regrow + 0.05, shot.end + 1, 0.1, 0.1);
  if (pk > 0.01) bigWord('+1', CHW.x + 120, CHW.y - 170, 96, '#4DFFB4', E.outBack(pk), 0.1);
  return { glow: 0.85, zblur: 0.1 * (1 - ramp(lt, 0, 0.2)) };
};

// ================================================================ 7. the gig again: earplugs in, and the chicken joins him
const CHK = { x: 800, y: 1610, s: 0.72 };
function buttonA(t) {
  const c = cu();
  const plugUp = ramp(t, c.wear - 0.1, c.earplugs + 0.1, E.outBack) * (1 - ramp(t, c.earplugs_end + 0.1, c.earplugs_end + 0.45, E.inOutSine));
  const bang = t >= c.bang;
  const u = beatU(t - TLd.duration), d = bang ? bangDown(u) : 0;
  const face = bang ? FF.rock : t < c.wear ? FF.grin : t < c.or ? FF.smug : lerpFace(FF.smug, { ...FF.grin, lookX: 0.9 }, ramp(t, c.become, c.chicken2));
  const mix = (a, b, k) => ({ e: [lerp(a.e[0], b.e[0], k), lerp(a.e[1], b.e[1], k)], w: [lerp(a.w[0], b.w[0], k), lerp(a.w[1], b.w[1], k)] });
  const hornsK = ramp(t, c.bang - 0.12, c.bang + 0.05);
  const armR = hornsK > 0 ? mix(CN_ARM.downR, { e: CN_ARM.hornsR.e, w: [CN_ARM.hornsR.w[0], CN_ARM.hornsR.w[1] + 26 * d] }, hornsK) : mix(CN_ARM.downR, CN_ARM.plugR, plugUp);
  return {
    face, armL: mix(CN_ARM.downL, CN_ARM.plugL, plugUp), armR,
    headDY: 32 * d, bob: 9 * d, headRot: bang ? 0.05 * Math.sin((t - TLd.duration) * Math.PI / c.beat_p) : 0, horns: hornsK, plugHands: plugUp,
    plugs: ramp(t, c.earplugs + 0.05, c.earplugs + 0.25), flyHair: bang && u < 0.22 ? 1 - u / 0.22 : 0,
  };
}
SC.button = (lt, t, shot) => {
  const c = cu(), A = buttonA(t);
  const lights = t < c.so2 + 0.3 ? 0 : 1;
  const cam = camKeys(t, [[shot.start, 590, 1350, 1.8], [c.wear, 560, 1338, 2.0], [c.earplugs_end + 0.2, 570, 1345, 1.95], [c.or, 640, 1378, 1.76], [shot.end, 650, 1382, 1.74]], E.inOutCubic);
  const bang = t >= c.bang, u = beatU(t - TLd.duration);
  const hop = ramp(t, c.become - 0.1, c.chicken2 - 0.05, E.outCubic), hy = -140 * Math.sin(Math.PI * hop);
  const chx = lerp(1260, CHK.x, hop);
  gigDraw(t - TLd.duration, t, { cam, S: { A }, lights, playing: bang, strobe: bang ? 0.6 * pulseOf(t, c.beats_end, 0.08) : 0,
    after: (cm) => {
      applyCam(cm);
      // a road case to stand on, and the chicken (facing him), sunglasses on
      rrect(ctx, CHK.x - 120, CHK.y, 240, 300, 14); ctx.fillStyle = '#20202E'; ctx.fill();
      paint(() => { for (const yy of [CHK.y + 30, CHK.y + 150]) line(ctx, CHK.x - 120, yy, CHK.x + 120, yy, 8, '#9A9AB0'); });
      if (hop > 0.001) {
        ctx.save(); ctx.translate(chx, CHK.y + hy); ctx.scale(-1, 1);
        erChicken(ctx, gctx, 0, 0, CHK.s, t, { mood: bang ? 'rock' : 'deadpan', bang: bang ? bangDown(u) : 0, look: [0.6, 0.1], shades: ramp(t, c.chicken2 - 0.05, c.chicken2 + 0.15), wing: bang ? 0.6 * bangDown(u) : 0 });
        ctx.restore();
      }
    } });
  return { glow: 0.85, flash: 0.15 * bumpAt(t, c.so2 + 0.3, 10) + 0.12 * bumpAt(t, c.bang, 10) };
};

// ================================================================ the loop: frame 1 again (the hook at negative time)
SC.loop = (lt, t, shot) => {
  const tt = t - TLd.duration, S = hookA(tt), cam = hookCam(tt);
  gigDraw(tt, tt, { cam, S, lights: 1, strobe: 0.6 * pulseOf(tt, [-cu().beat_p, 0], 0.08) });   // the world on loop time: it joins frame 1
  return { glow: 0.85 };
};

// ================================================================ the cover (cover.sh renders it into cover.jpg)
SC.cover = (lt, t) => {
  const c = cu(), tt = c.eleven + 0.35, S = hookA(tt);
  const cam = { x: 545, y: CN_HEADY - 196, zoom: 1.9, rot: 0 };
  S.ringK = 1.1;
  const H = gigDraw(tt, tt, { cam, S, lights: 0.4 });
  brainWindow(cam, H, tt, S);
  screenSpace();
  bigWord('EARS RINGING?', 540, 522, 118, '#FFD447', 1, -0.03);
  return { glow: 0.85, noCaptions: true };
};

setLights({ hook: showLight, loop: SHOW_LIGHT, cover: HOUSE_LIGHT, button: showLight, cells: INNER_LIGHT, fades: INNER_LIGHT, amp: INNER_LIGHT, proof: ROOM_LIGHT, chicken: YARD_LIGHT });

function initScenes2() {
  initConcert();
  initRoom();
}
