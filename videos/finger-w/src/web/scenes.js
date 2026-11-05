// Can You Make a W With Your FINGERS? 🖐️ Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside
// the shot, t = seconds in the video) and returns post options for main.js:
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
// golden hour on the summit: the low sun far left is the key (warm), the orange sky behind him the rim (from the right)
const SUN_LIGHT = { ...flipLight(LIGHTS.sunset), rimAmt: 1.15, pool: 0.5, dof: 0.7 };
setLights({ hook: SUN_LIGHT, chat: SUN_LIGHT, own: { ...LIGHTS.diagram }, brain: SUN_LIGHT, nerve: SUN_LIGHT, sting: SUN_LIGHT,
  button: SUN_LIGHT, loop: SUN_LIGHT, cover: SUN_LIGHT });

// ---------------------------------------------------------------- his faces
const VF = {
  // eyes on his raised hand (screen right), a little cross: concentrating
  focus: { eyeOpen: 1.05, pupil: 0.95, lookX: 0.85, lookY: -0.35, browY: 0.5, browTilt: 0.6, mouth: 'flat', mouthOpen: -0.2, blink: 0, cross: 0 },
  strain: { eyeOpen: 0.78, pupil: 1, lookX: 0.85, lookY: -0.4, browY: -0.3, browTilt: 1.1, mouth: 'grimace', mouthOpen: 0.75, blink: 0.25, cross: 0, squeeze: 0.35 },
  huh: { eyeOpen: 1.2, pupil: 0.8, lookX: 0.8, lookY: -0.3, browY: 1.2, browTilt: 0.9, mouth: 'wavy', mouthOpen: 0.35, blink: 0, cross: 0 },
  inspect: { eyeOpen: 1.12, pupil: 0.85, lookX: 0.75, lookY: -0.2, browY: 0.8, browTilt: 0.7, mouth: 'o', mouthOpen: 0.25, blink: 0, cross: 0 },
  wow: { eyeOpen: 1.3, pupil: 0.65, lookX: 0.75, lookY: -0.25, browY: 1.45, browTilt: 0.3, mouth: 'o', mouthOpen: 0.55, blink: 0, cross: 0 },
  read: { eyeOpen: 1.1, pupil: 0.9, lookX: -0.2, lookY: -0.9, browY: 0.9, browTilt: 0.5, mouth: 'o', mouthOpen: 0.2, blink: 0, cross: 0 },
  betrayed: { eyeOpen: 1.25, pupil: 0.7, lookX: 0.85, lookY: -0.4, browY: 1.2, browTilt: 1.1, mouth: 'grimace', mouthOpen: 0.5, blink: 0, cross: 0 },
  flat: { eyeOpen: 0.82, pupil: 1, lookX: 0, lookY: 0, browY: -0.1, browTilt: -0.2, mouth: 'flat', mouthOpen: 0.05, blink: 0.3, cross: 0 },
  grin: { eyeOpen: 1.0, pupil: 0.95, lookX: 0.6, lookY: -0.3, browY: 0.8, browTilt: -0.3, mouth: 'grin', mouthOpen: 0.5, blink: 0, cross: 0 },
};

// ---------------------------------------------------------------- the W hand states (hand.js angles; + = toward the thumb)
// the hand at rest is together; the W is pointer out (+), middle and ring together, pinky out (-)
function fwSpread(o) {
  const I = o.I || 0, L = o.L || 0, R = o.R || 0, M = o.M || 0;
  return { I: 0.24 * I, M: 0.02 * I * 0 + M, R: -0.22 * R, L: -0.27 * L };
}

// ================================================================ the summit: frame 1 and round it
// tt = seconds since frame 1 (negative = the last frames of the Short, on their way here)
function hookA(tt) {
  const c = cu();
  // the test, finger by finger
  const iOut = ramp(tt, c.one1 - 0.04, c.one1 + 0.2, E.outBack);
  const two = ramp(tt, c.two - 0.05, c.two + 0.2);
  const lOut = ramp(tt, c.one2 - 0.04, c.one2 + 0.22, E.outBack);
  const rFollow = ramp(tt, c.one2 + 0.06, c.one2 + 0.3, E.outBack);        // the ring finger goes with the pinky: 1-1-2
  const relax = ramp(tt, c.relax, c.relax_end + 0.2, E.inOutSine) * 0.25;
  const strain = Math.max(0.35, two) * (tt >= -0.05 ? 1 : 0.6);
  const tremble = (0.55 + 0.45 * two) * (1 - 0.6 * ramp(tt, c.stuck, c.stuck + 0.3)) * (1 - relax);
  // "Relax...": he shakes the hand out (loose, floppy), then it goes back into the 1-1-2
  const shk = ramp(tt, c.relax - 0.05, c.relax + 0.12) * (1 - ramp(tt, c.relax_end - 0.05, c.relax_end + 0.18));
  const H = {
    view: 0, spread: { I: 0.33 * iOut - 0.12 * shk * Math.sin(tt * 31), M: 0.06 * shk * Math.sin(tt * 29 + 1), R: -0.30 * rFollow + 0.1 * shk * Math.sin(tt * 33 + 2), L: -0.37 * lOut + 0.14 * shk * Math.sin(tt * 27 + 3) }, tremble,
    glowM: two * (1 - ramp(tt, c.one2, c.one2 + 0.2)) * 0.9, glowR: two * (1 - ramp(tt, c.one2 + 0.4, c.stuck + 0.2)),
  };
  // his face
  let face = lerpFace(VF.focus, VF.strain, two * (1 - ramp(tt, c.one2 + 0.3, c.one2 + 0.5)));
  face = lerpFace(face, VF.betrayed, ramp(tt, c.one2 + 0.2, c.one2 + 0.4) * (1 - ramp(tt, c.stuck - 0.1, c.stuck + 0.1)));
  face = lerpFace(face, VF.huh, ramp(tt, c.stuck - 0.1, c.stuck + 0.1));
  face = lerpFace(face, VF.inspect, ramp(tt, c.relax_end, c.relax_end + 0.3));
  face = lerpFace(face, VF.read, ramp(tt, c.group - 0.2, c.group + 0.15));
  face = { ...face, blink: Math.max(face.blink || 0, pulseOf(tt, [c.relax + 0.1, c.chat_end + 0.15], 0.12)) };
  const A = {
    face, H,
    tongue: 0.9 * (1 - ramp(tt, c.one2 + 0.15, c.one2 + 0.3)) * ramp(tt, -0.36, -0.08),
    sweat: ramp(tt, c.two + 0.1, c.two + 0.4) * (1 - ramp(tt, c.relax, c.relax + 0.3)),
    headDX: 3 * Math.sin(tt * 1.7), headDY: 1.2 * Math.sin(tt * 2.3) - 4 * bumpAt(tt, c.stuck, 7), bob: 1.0 * Math.sin(tt * 2.3),
    headRot: 0.05 * ramp(tt, c.stuck + 0.2, c.stuck + 0.6) - 0.03 * strain,
    handRot: 0.02 * Math.sin(tt * 2.1) + 0.22 * shk * Math.sin(tt * 26),
    armR: armMix(armMix(VS_ARM.up, VS_ARM.look, 0.5 * ramp(tt, c.stuck, c.stuck + 0.4, E.inOutCubic)), VS_ARM.low, 0.55 * shk),
    // where the ring finger SHOULD have stayed: a dashed ghost beside the middle one
    inHand: (lc, P) => fwGhostRing(lc, P, (1 - ramp(tt, c.stuck + 0.5, c.stuck + 0.7)) * ramp(tt, c.one2 + 0.32, c.one2 + 0.5), tt),
  };
  return { A, iOut, two, lOut, rFollow, shk };
}
function hookCam(tt) {
  const c = cu();
  const k = camKeys(tt, [[-0.4, 640, 1030, 2.86], [0, 640, 1030, 2.86], [0.6, 646, 1022, 3.02], [c.one1, 650, 1016, 3.02], [c.one2, 660, 1004, 3.1],
    [c.stuck + 0.2, 650, 1016, 2.95], [c.relax_end, 652, 1010, 2.9], [c.group, 628, 980, 2.55], [c.chat_end + 0.25, 622, 976, 2.5]], E.inOutCubic);
  if (tt >= 0 && tt < 0.6) { const u = E.outCubic(tt / 0.6); k.zoom = lerp(2.86, 3.02, u); k.x = lerp(640, 646, u); k.y = lerp(1030, 1022, u); }   // the first push is quick off the mark
  const sh = shake(tt, 2.4 * pulseOf(tt, [c.one2 + 0.1, c.stuck], 0.25), 26, 3);
  k.sx = sh[0]; k.sy = sh[1];
  return k;
}
function summitDraw(t, o) {
  summitBack(o.cam, t);
  const Hh = vsHero(o.cam, t, o.A);
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
// a round number badge over a fingertip (screen space)
function numBadge(txt, x, y, col, k, r = 34) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.4);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  circle(ctx, 0, 0, r + 5, '#0B0B1A'); circle(ctx, 0, 0, r, col);
  ctx.font = `400 ${r * 1.25}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#0B0B1A'; ctx.fillText(txt, 0, 3);
  ctx.restore();
}
// a comic burst with a word in it (screen space)
function burstWord(txt, x, y, r, k, col = '#FFD447', ink = '#0B0B1A', rot = -0.08, seed = 3) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const rng = mulberry32(seed), n = 14;
  ctx.beginPath();
  for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2, rr = i % 2 ? r * (0.72 + 0.08 * rng()) : r * (1.0 + 0.1 * rng()); ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr * 0.78); }
  ctx.closePath(); ctx.lineWidth = 10; ctx.strokeStyle = '#0B0B1A'; ctx.stroke(); ctx.fillStyle = col; ctx.fill();
  ctx.font = `400 ${r * 0.62}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = ink; ctx.fillText(txt, 0, 3);
  ctx.restore();
}
// a fingertip's screen point
function tipScr(Hh, cam, k, lift = 0) {
  const tp = Hh.P.tip[k], p = Hh.hp([tp[0], tp[1] - lift]);
  return toScreen(cam, p[0], p[1]);
}

// ================================================================ shots
SC.hook = (lt, t, shot) => {
  const c = cu(), S = hookA(t), cam = hookCam(t);
  const Hh = summitDraw(t, { cam, A: S.A });
  if (Hh.P) {
    // the count over the fingertips: 1 . 2 . 1 -- and what he got instead: 1 . 1 . 2
    const pI = tipScr(Hh, cam, 'I', 30), pM = tipScr(Hh, cam, 'M', 30), pR = tipScr(Hh, cam, 'R', 30), pL = tipScr(Hh, cam, 'L', 30);
    const off = 1 - ramp(t, c.stuck + 0.4, c.stuck + 0.6);
    numBadge('1', pI[0], pI[1] - 30, '#7FE9FF', popK(t, c.one1, 99) * off);
    numBadge('2', (pM[0] + pR[0]) / 2, Math.min(pM[1], pR[1]) - 34, '#FF9A3C', popK(t, c.two, 99) * off * (1 - ramp(t, c.one2 + 0.12, c.one2 + 0.2)));
    // the failure: the middle stands alone (1), ring and pinky go off together (2)
    numBadge('1', pM[0], pM[1] - 34, '#FF9A3C', ramp(t, c.one2 + 0.14, c.one2 + 0.3) * off);
    numBadge('2', (pR[0] + pL[0]) / 2, Math.min(pR[1], pL[1]) - 34, '#FF5A6E', ramp(t, c.one2 + 0.14, c.one2 + 0.3) * off);
  }
  if (S.shk > 0.05 && Hh.P) { const p = tipScr(Hh, cam, 'M', -60); screenSpace(); shockLines(p[0], p[1] + 40, 240, (t * 3.3) % 1, 9, '#FFFFFF', 1 + Math.floor(t * 3.3)); }
  burstWord('BZZT', 250, 560, 88, popK(t, c.one2 + 0.3, c.stuck + 0.3, 0.1, 0.1), '#FF5A6E', '#FFFFFF', -0.12, 5);
  // the group chat pops up over the sky, beside his hand
  fwChatCard(110, 452, 860, { k: ramp(t, c.group - 0.1, c.group + 0.25), members: ramp(t, c.group, c.chat_end + 0.4), msgArea: 112 }, t);
  return { glow: 0.85, flash: 0.55 * bumpAt(t, c.one2_end + 0.02, 10) };
};

// the chat shot: closer on the hand and the card
function chatA(tt) {
  const c = cu(), A0 = hookA(c.chat_end + 0.3).A;
  const out = ramp(tt, c.out - 0.04, c.out + 0.2, E.outBack);
  const reads = ramp(tt, c.reads - 0.04, c.reads + 0.24, E.outBack);
  // the hand starts together again (he tries again as the message lands), then the pinky goes out ... and the ring follows
  const reset = ramp(tt, c.your_b, c.your_b + 0.35, E.inOutCubic);
  const iOut = 1;
  const H = { view: 0, spread: { I: 0.33 * iOut, M: 0.0, R: -0.30 * (1 - reset) - 0.30 * reads * reset, L: -0.37 * (1 - reset) - 0.37 * out * reset }, tremble: 0.5,
    glowR: ramp(tt, c.ring - 0.05, c.ring + 0.15), glowM: 0 };
  let face = lerpFace(VF.read, VF.focus, ramp(tt, c.texts, c.texts + 0.3));
  face = lerpFace(face, VF.wow, ramp(tt, c.out, c.out + 0.2));
  face = lerpFace(face, VF.betrayed, ramp(tt, c.reads, c.reads + 0.2));
  return { ...A0, face, H, tongue: 0, sweat: 0, headDX: 3 * Math.sin(tt * 1.7), headDY: 1.2 * Math.sin(tt * 2.3), bob: Math.sin(tt * 2.3), headRot: 0.04 };
}
SC.chat = (lt, t, shot) => {
  const c = cu(), A = chatA(t), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 622, 976, 2.5], [D, 628, 968, 2.62]], E.inOutSine);
  const Hh = summitDraw(t, { cam, A });
  const card = fwChatCard(110, 452, 860, {
    k: 1, members: 1, msgArea: 112, brainIn: ramp(t, c.your_b - 0.05, c.your_b + 0.2), typing: ramp(t, c.brain1, c.brain1 + 0.1),
    msg: ramp(t, c.texts + 0.05, c.texts + 0.3), out: ramp(t, c.out, c.out + 0.1), seenL: ramp(t, c.out_end, c.out_end + 0.2),
    seenR: ramp(t, c.reads - 0.05, c.reads + 0.2), eyesR: ramp(t, c.ring, c.ring + 0.12),
  }, t);
  void card;
  if (Hh.P) {
    const pL = tipScr(Hh, cam, 'L', 26), pR = tipScr(Hh, cam, 'R', 26);
    numBadge('!', pL[0], pL[1] - 30, '#4DFFB4', popK(t, c.out, 99) * 0.9);
    numBadge('?!', pR[0], pR[1] - 30, '#FFD447', popK(t, c.reads, 99), 30);
  }
  return { glow: 0.85 };
};

// ---------------------------------------------------------------- drawing inside the hand (hand units, canonical layout)
// hand.js draws the palm view mirrored (view 0): do the same flip, so canonical points land where vsHand put them
function fwInCanon(lc, H, fn) { lc.save(); lc.rotate((H && H.rot) || 0); const hs = (H && H.s) || 1; lc.scale(-hs, hs); fn(lc); lc.restore(); }
// a dashed ghost of the ring finger where it should be: beside the middle one
function fwGhostRing(lc, P, k, tt) {
  if (k <= 0.01 || !P) return;
  fwInCanon(lc, { rot: 0, s: 1 }, (c) => {
    const a = P.a.M - 0.035, kn = VH.k.R, L = VH.len.R, tip = [kn[0] + Math.sin(a) * L, kn[1] - Math.cos(a) * L];
    paint(() => {
      c.save(); c.globalAlpha = 1;
      c.beginPath(); vsFingerPath(c, kn, tip, VH.w.R * E.outBack(clamp(k), 2));
      c.setLineDash([7, 6]); c.lineDashOffset = -tt * 30; c.lineWidth = 3.2; c.strokeStyle = '#FFFFFF'; c.stroke();
      c.setLineDash([]);
      c.restore();
    });
  });
}
// a coil spring from a to b (n turns, half-width w)
function fwCoil(c, a, b, n, w, col, lw = 3.2) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
  c.beginPath(); c.moveTo(a[0], a[1]);
  const m = n * 2;
  for (let i = 1; i < m; i++) { const u = i / m, sd = i % 2 ? 1 : -1; c.lineTo(a[0] + dx * u + nx * w * sd, a[1] + dy * u + ny * w * sd); }
  c.lineTo(b[0], b[1]);
  c.lineCap = 'round'; c.lineJoin = 'round';
  c.lineWidth = lw + 2.4; c.strokeStyle = 'rgba(8,16,30,0.85)'; c.stroke();
  c.lineWidth = lw; c.strokeStyle = col; c.stroke();
  circle(c, a[0], a[1], lw * 1.2, col); circle(c, b[0], b[1], lw * 1.2, col);
}
// each finger's own little spreading spring: [finger, the side it pulls toward (+ = the thumb's side)]
const FW_SPRINGS = [['I', 1], ['M', 1], ['R', 1], ['L', -1]];
function fwSpringPts(P, k, side) {
  const w = VH.w[k], base = vsAlong(P, k, 0.1, side * w * 0.46), kn = VH.k[k];
  const palm = [kn[0] * 0.62 + side * 9, -30];
  return { a: palm, b: base };
}
// the scan: the hand turns into a cool see-through blueprint; springs pop in (pops[k] 0..1), stretch with the fingers
function fwScan(lc, P, S, t) {
  const k = clamp(S.k || 0);
  if (k <= 0.01 || !P) return;
  fwInCanon(lc, { rot: 0, s: 1 }, (c) => {
    const R = lerp(0, 240, E.inOutSine(k)), full = k >= 0.999;
    const body = (cc) => { cc.beginPath(); vsPalmPath(cc, P); for (const f of VH_ORD) vsFingerPath(cc, P.kn[f], P.tip[f], VH.w[f]); vsThumbPath(cc, P); };
    c.save();
    if (!full) { c.beginPath(); c.arc(0, -80, R, 0, 7); c.clip(); }
    c.fillStyle = '#163B5C'; body(c); c.fill('nonzero');
    paint(() => {
      const g = c.createRadialGradient(0, -70, 10, 0, -70, 170);
      g.addColorStop(0, 'rgba(120,220,255,0.30)'); g.addColorStop(1, 'rgba(20,60,110,0.15)');
      body(c); c.fillStyle = g; c.fill('nonzero');
      // a scan grid
      c.save(); body(c); c.clip();
      for (let y = -200; y <= 20; y += 14) line(c, -80, y, 80, y, 0.9, 'rgba(127,233,255,0.13)');
      // the sweep line
      const sy = -190 + ((t * 120) % 220);
      line(c, -80, sy, 80, sy, 2.2, 'rgba(160,240,255,0.45)');
      c.restore();
      // the bones, faint
      for (const f of VH_ORD) {
        const a = vsAlong(P, f, -0.75), b = vsAlong(P, f, 0.02), d = vsAlong(P, f, 0.33), e = vsAlong(P, f, 0.62), ff = vsAlong(P, f, 0.9);
        for (const [p, q, w] of [[a, b, 7.5], [b, d, 6.5], [d, e, 5.5], [e, ff, 4.6]]) line(c, p[0], p[1], q[0], q[1], w, 'rgba(225,245,255,0.22)');
      }
      // the outline glows cyan
      body(c); c.lineWidth = 2.6; c.strokeStyle = 'rgba(127,233,255,0.9)'; c.stroke();
      // the springs, one per finger, none touching another
      for (const [f, side] of FW_SPRINGS) {
        const pk = clamp((S.pops && S.pops[f]) || 0);
        if (pk <= 0.01) continue;
        const sp = fwSpringPts(P, f, side), e2 = E.outBack(pk, 2.4);
        const mid = [(sp.a[0] + sp.b[0]) / 2, (sp.a[1] + sp.b[1]) / 2];
        const a2 = [lerp(mid[0], sp.a[0], e2), lerp(mid[1], sp.a[1], e2)], b2 = [lerp(mid[0], sp.b[0], e2), lerp(mid[1], sp.b[1], e2)];
        fwCoil(c, a2, b2, 4, 6.2 + 1.4 * Math.sin(t * 9 + side), FW_COL[f], 3.6);
      }
    });
    c.restore();
    // the edge where the skin is turning to the scan: a bright ring that sweeps out
    if (!full && R > 2) paint(() => {
      c.save(); body(c); c.clip();
      c.beginPath(); c.arc(0, -80, R, 0, 7); c.lineWidth = 4; c.strokeStyle = 'rgba(160,240,255,0.95)'; c.stroke();
      c.restore();
    });
  });
}

// ================================================================ the own springs
SC.own = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const scan = ramp(t, c.weird - 0.1, c.part_end + 0.15, E.inOutSine);
  const pops = {};
  ['I', 'M', 'R', 'L'].forEach((f, i) => { const t0 = lerp(c.each, c.has, i / 3); pops[f] = ramp(t, t0 - 0.03, t0 + 0.2); });
  const spread = ramp(t, c.spreading - 0.05, c.spreading + 0.35, E.outBack);
  const H = { view: 0, spread: { I: 0.33 - 0.33 * ramp(t, c.weird - 0.2, c.weird + 0.2) + 0.34 * spread, M: 0.1 * spread, R: -0.30 + 0.30 * ramp(t, c.weird - 0.2, c.weird + 0.2) - 0.16 * spread, L: -0.37 + 0.37 * ramp(t, c.weird - 0.2, c.weird + 0.2) - 0.36 * spread }, tremble: 0.15 };
  const A = { face: lerpFace(VF.inspect, VF.wow, ramp(t, c.own, c.own + 0.2)), H, armR: armMix(VS_ARM.up, VS_ARM.look, 0.5), headDX: 2 * Math.sin(t * 1.7), bob: Math.sin(t * 2.3), headRot: 0.04,
    inHand: (lc, P) => fwScan(lc, P, { k: scan, pops }, t) };
  const cam = camKeys(lt, [[0, 660, 990, 2.7], [c.part_end - shot.start, 700, 990, 3.25], [D, 706, 984, 3.4]], E.inOutCubic);
  const Hh = summitDraw(t, { cam, A });
  // MINE! from every fingertip, one after the other
  if (Hh.P) ['I', 'M', 'R', 'L'].forEach((f, i) => {
    const p = tipScr(Hh, cam, f, 26), t0 = c.own - 0.06 + i * 0.09;
    tagPill('MINE', p[0], p[1] - 40 - 26 * (i % 2), FW_COL[f], popK(t, t0, c.muscles_end + 0.3, 0.1, 0.12), 30);
  });
  return { glow: 0.85, desat: 0.25 * scan, push: { k: 1 + 0.02 * lt / D, cx: 700, cy: 900 } };
};

// ================================================================ the brain: oversharing
function fwThought(x, y, r, k, t) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 1.8), c = ctx;
  screenSpace();
  // the little trail of puffs down to his head
  for (const [dx, dy, rr, d] of [[r * 0.55, r * 1.25, r * 0.16, 0.1], [r * 0.82, r * 1.62, r * 0.1, 0.2]]) {
    const kk = clamp(k * 1.4 - d);
    if (kk > 0.01) { circle(c, x + dx, y + dy, rr * E.outBack(kk) + 5, '#0B0B1A'); circle(c, x + dx, y + dy, rr * E.outBack(kk), '#F4F1FF'); }
  }
  c.save(); c.translate(x, y); c.scale(s, s);
  const puffs = [];
  for (let i = 0; i < 11; i++) { const a = (i / 11) * Math.PI * 2; puffs.push([Math.cos(a) * r * 0.86, Math.sin(a) * r * 0.74, r * (0.3 + 0.05 * Math.sin(i * 2.1))]); }
  c.fillStyle = '#0B0B1A';
  for (const [px, py, pr] of puffs) { c.beginPath(); c.arc(px, py, pr + 6, 0, 7); c.fill(); }
  c.beginPath(); c.ellipse(0, 0, r * 0.9 + 6, r * 0.78 + 6, 0, 0, 7); c.fill();
  c.fillStyle = '#2A2350';
  for (const [px, py, pr] of puffs) { c.beginPath(); c.arc(px, py, pr, 0, 7); c.fill(); }
  c.beginPath(); c.ellipse(0, 0, r * 0.9, r * 0.78, 0, 0, 7); c.fill();
  c.restore();
}
// the brain with a phone in its hands and the big SEND TO ALL button (screen space, about x, y; r = the brain's size)
function fwBrainPhone(x, y, r, S, t) {
  const c = ctx;
  screenSpace();
  c.save(); c.translate(x, y);
  actor(() => {
    // the brain
    c.save(); c.translate(0, -r * 0.1);
    fwBrainIcon(c, r, t);
    c.restore();
  });
  // a phone in its two little hands
  const ty = r * 0.5, typ = S.typing ? Math.sin(t * 30) : 0;
  actor(() => {
    rrect(c, -r * 0.36, ty - r * 0.1, r * 0.72, r * 0.5, r * 0.08); c.fillStyle = '#1B1F33'; c.fill();
    rrect(c, -r * 0.31, ty - r * 0.05, r * 0.62, r * 0.4, r * 0.05); c.fillStyle = '#7FB6FF'; c.fill();
    for (const sd of [-1, 1]) { line(c, sd * r * 0.42, -r * 0.05, sd * r * 0.3, ty + r * 0.1 + (sd > 0 ? typ * 2 : -typ * 2), r * 0.08, '#FF9DB9'); circle(c, sd * r * 0.3, ty + r * 0.1 + (sd > 0 ? typ * 2 : -typ * 2), r * 0.07, '#FF9DB9'); }
  });
  paint(() => {
    c.font = `900 ${r * 0.13}px Montserrat`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#0B0B1A';
    c.fillText('go OUT', 0, ty + r * 0.12);
  });
  softDot(gctx, x, y + ty + r * 0.15, r * 0.5, '#7FB6FF', 0.25);
  c.restore();
}
function fwSendAll(x, y, w, k, press, t) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2), c = ctx;
  screenSpace();
  c.save(); c.translate(x, y); c.scale(s, s);
  const sq = 1 - 0.2 * press;
  rrect(c, -w / 2 - 5, -5, w + 10, 64 + 10, 22); c.fillStyle = '#0B0B1A'; c.fill();
  rrect(c, -w / 2, 22 * (1 - sq) * 2, w, 64 * sq, 18); c.fillStyle = '#E8384F'; c.fill();
  paint(() => { c.font = '900 30px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#FFFFFF'; c.fillText('SEND TO ALL', 0, 32 + 22 * (1 - sq)); });
  c.restore();
  if (press > 0.05) softDot(gctx, x, y + 30, w * 0.6, '#FF5A6E', 0.35 * press);
}
// a small message flying along an arc from a to b (u 0..1)
function fwFlyMsg(a, b, u, col) {
  if (u <= 0 || u >= 1) return;
  const e = E.inOutCubic(u), mx = (a[0] + b[0]) / 2 + 60, my = Math.min(a[1], b[1]) - 120;
  const x = (1 - e) * (1 - e) * a[0] + 2 * (1 - e) * e * mx + e * e * b[0], y = (1 - e) * (1 - e) * a[1] + 2 * (1 - e) * e * my + e * e * b[1];
  screenSpace();
  const c = ctx;
  c.save(); c.translate(x, y); c.rotate(0.2 * Math.sin(u * 9));
  rrect(c, -36, -22, 72, 44, 14); c.fillStyle = '#0B0B1A'; c.fill();
  rrect(c, -32, -18, 64, 36, 11); c.fillStyle = col; c.fill();
  c.fillStyle = '#0B0B1A'; c.font = '900 17px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('OUT!', 0, 1);
  c.restore();
  softDot(gctx, x, y, 34, col, 0.4);
}
SC.brain = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const send = ramp(t, c.over - 0.05, c.over + 0.1);
  // SEND lands on the word; the four messages fly in the pause after it (say it on the word, do it in the pause)
  const fly0 = (i) => c.over_end - 0.16 + 0.05 * i, FLY = 0.24;
  const arrive = ['I', 'M', 'R', 'L'].map((f, i) => fly0(i) + FLY);
  const jolt = ['I', 'M', 'R', 'L'].map((f, i) => ramp(t, arrive[i] - 0.04, arrive[i] + 0.1, E.outBack) * (1 - ramp(t, arrive[i] + 0.3, arrive[i] + 0.6)));
  const H = { view: 0, spread: { I: 0.16 * jolt[0], M: 0.06 * jolt[1], R: -0.14 * jolt[2], L: -0.2 * jolt[3] }, tremble: 0.3 };
  const A = { face: lerpFace(VF.focus, VF.betrayed, ramp(t, arrive[0], arrive[0] + 0.2)), H, armR: VS_ARM.up, headDX: 2 * Math.sin(t * 1.7), bob: Math.sin(t * 2.3), headRot: -0.03 };
  const cam = camKeys(lt, [[0, 650, 1000, 2.6], [D, 654, 996, 2.7]], E.inOutSine);
  cam.sx = shake(t, 3 * pulseOf(t, [c.over], 0.2), 26, 3)[0];
  const Hh = summitDraw(t, { cam, A });
  // the thought: his brain thumbing a phone, then SEND TO ALL
  const bk = ramp(t, c.its - 0.12, c.its + 0.15);
  fwThought(345, 660, 262, bk, t);
  if (bk > 0.3) {
    fwBrainPhone(345, 600, 185 * E.outBack(clamp((bk - 0.3) / 0.7), 2), { typing: t < c.over }, t);
    fwSendAll(345, 742, 270, ramp(t, c.brain2_end - 0.1, c.brain2_end + 0.12), send * (1 - ramp(t, c.over + 0.25, c.over + 0.45)), t);
  }
  // four messages fly down to all four fingers
  if (Hh.P) ['I', 'M', 'R', 'L'].forEach((f, i) => {
    const p = tipScr(Hh, cam, f, 10), u = (t - fly0(i)) / FLY;
    fwFlyMsg([345, 790], p, u, FW_COL[f]);
    numBadge('!', p[0], p[1] - 34, FW_COL[f], popK(t, arrive[i], 99), 26);
  });
  return { glow: 0.85, flash: 0.12 * bumpAt(t, c.over, 10) };
};

// ================================================================ the nerve: they all run on one nerve... your funny bone
// the nerve's path (world), from the springs in the palm, down the forearm on the pinky's side, round the elbow, up the arm
function fwNervePath(Hh) {
  const r = Hh.r, P = Hh.P;
  const pts = {};
  for (const [f, side] of FW_SPRINGS) { const sp = fwSpringPts(P, f, side); pts[f] = Hh.hp(sp.a); }
  const wr = Hh.rp(Hh.r.wrR || [160, -392]);
  return { pts, wr };
}
// the FUNNY BONE marquee (screen space): k pops it in; lit 0..1; out 0..1 (the bulbs fizzle one by one)
function fwMarquee(x, y, k, lit, out, t) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.2), c = ctx, w = 250, h = 122;
  screenSpace();
  c.save(); c.translate(x, y); c.rotate(-0.05); c.scale(s, s);
  rrect(c, -w / 2 - 6, -h / 2 - 6, w + 12, h + 12, 20); c.fillStyle = '#0B0B1A'; c.fill();
  rrect(c, -w / 2, -h / 2, w, h, 16); c.fillStyle = '#7A1E3A'; c.fill();
  paint(() => {
    c.font = '400 46px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = '#FFD447'; c.fillText('FUNNY', 0, -20); c.fillText('BONE', 0, 28);
  });
  // the bulbs round the edge
  const n = 18, bulbs = [];
  for (let i = 0; i < n; i++) {
    const u = i / n, per = 2 * (w + h), d = u * per;
    let bx, by;
    if (d < w) { bx = -w / 2 + d; by = -h / 2; } else if (d < w + h) { bx = w / 2; by = -h / 2 + (d - w); } else if (d < 2 * w + h) { bx = w / 2 - (d - w - h); by = h / 2; } else { bx = -w / 2; by = h / 2 - (d - 2 * w - h); }
    bulbs.push([bx, by]);
  }
  bulbs.forEach(([bx, by], i) => {
    const gone = out > (i / n) ? 1 : 0, on = lit * (1 - gone) * (0.6 + 0.4 * (Math.sin(t * 14 + i * 1.3) > 0 ? 1 : 0));
    circle(c, bx, by, 9, on > 0.3 ? '#FFF1B8' : '#5A4A40');
    if (on > 0.3) { const m = c.getTransform(); softDot(gctx, m.a * bx + m.c * by + m.e, m.b * bx + m.d * by + m.f, 16, '#FFD447', 0.5 * on); }
  });
  c.restore();
}
// the jester on the nerve at the elbow (screen space): a bump with a face and a three-point hat with bells; laugh 0..1
function fwJester(x, y, r, k, laugh, t) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.4), c = ctx, bob = laugh * 4 * Math.sin(t * 28);
  screenSpace();
  c.save(); c.translate(x, y + bob); c.scale(s, s);
  actor(() => { circle(c, 0, 0, r + 4, '#0B0B1A'); circle(c, 0, 0, r, '#FFD447'); });
  // the hat
  actor(() => {
    const cols = ['#E8384F', '#7FE9FF', '#4DFFB4'];
    for (let i = 0; i < 3; i++) {
      const a = -0.9 + i * 0.9, tipx = Math.sin(a) * r * 1.6, tipy = -r * 0.6 - Math.cos(a) * r * 1.2 + 6 * Math.sin(t * 9 + i);
      c.beginPath(); c.moveTo(-r * 0.75 + i * r * 0.5, -r * 0.55); c.quadraticCurveTo(tipx * 0.6, tipy * 0.8, tipx, tipy); c.lineTo(-r * 0.25 + i * r * 0.5, -r * 0.55); c.closePath();
      c.fillStyle = cols[i]; c.fill(); c.lineWidth = 3; c.strokeStyle = '#0B0B1A'; c.stroke();
      circle(c, tipx, tipy, r * 0.13, '#FFE36B');
    }
    rrect(c, -r * 0.82, -r * 0.68, r * 1.64, r * 0.26, r * 0.1); c.fillStyle = '#5A1E7A'; c.fill();
  });
  paint(() => {
    // the face: laughing eyes and a big open mouth when it laughs
    for (const sd of [-1, 1]) {
      if (laugh > 0.4) { c.beginPath(); c.arc(sd * r * 0.32, -r * 0.05, r * 0.14, Math.PI * 1.1, Math.PI * 1.9); c.lineWidth = 3.4; c.strokeStyle = '#15132A'; c.stroke(); }
      else { ellipse(c, sd * r * 0.32, -r * 0.08, r * 0.13, r * 0.17, '#FFFFFF'); circle(c, sd * r * 0.32, -r * 0.05, r * 0.07, '#15132A'); }
    }
    c.beginPath(); c.ellipse(0, r * 0.32, r * (0.24 + 0.12 * laugh), r * (0.1 + 0.2 * laugh), 0, 0, Math.PI); c.fillStyle = '#5A1522'; c.fill();
  });
  c.restore();
  if (laugh > 0.3) {
    const hk = Math.sin(t * 9) > 0 ? 1 : 0;
    tagPill('HA', x - r * 1.7, y - r * 1.0 - 10 * hk, '#FFD447', laugh, 30);
    tagPill('HA', x - r * 0.6, y - r * 2.1 + 10 * hk, '#FFD447', laugh * clamp((t * 3) % 1 * 2), 26);
  }
}
function nerveDraw(t, cam, A, o) {
  const c = cu();
  const Hh = summitDraw(t, { cam, A });
  if (!Hh.P) return Hh;
  const r = Hh.r, rr = r || {};
  // world points of the arm
  const W2 = (p) => Hh.rp(p);
  const st = Hh.st, rig0 = rig(st.pose);
  const wr = W2(rig0.wrR), el = W2(rig0.elR), sh = W2(rig0.shR);
  const P = Hh.P, NS = {};
  for (const [f, side] of FW_SPRINGS) NS[f] = Hh.hp(fwSpringPts(P, f, side).a);
  applyCam(cam);
  const cx = ctx;
  // the glass strip down the sleeve, so the nerve shows through
  const gk = o.glass;
  if (gk > 0.01) {
    const a = [wr[0] + 8, wr[1] + 4], b = [el[0] + 10, el[1] - 4];
    cx.save(); cx.lineCap = 'round';
    line(cx, a[0], a[1], lerp(a[0], b[0], gk), lerp(a[1], b[1], gk), 34, '#C8A8FF');
    line(cx, a[0], a[1], lerp(a[0], b[0], gk), lerp(a[1], b[1], gk), 28, '#5B4A9E');
    paint(() => line(cx, a[0] - 6, a[1], lerp(a[0], b[0], gk) - 6, lerp(a[1], b[1], gk), 4, 'rgba(255,255,255,0.35)'));
    cx.restore();
  }
  // four coloured threads from the springs to the wrist, then ONE nerve to the elbow and on up the arm
  const join = [wr[0] + 10, wr[1] - 6], elb = [el[0] + 12, el[1] + 2], up = [lerp(el[0], sh[0], 0.45), lerp(el[1], sh[1], 0.45) + 8];
  paint(() => {
    ['I', 'M', 'R', 'L'].forEach((f, i) => {
      const k = clamp((o.threads - i * 0.08) / 0.7);
      if (k <= 0.01) return;
      const a = NS[f], m = [lerp(a[0], join[0], 0.55) + (i - 1.5) * 4, lerp(a[1], join[1], 0.55)];
      const pts = [a, m, join], q = pts.map((p) => p);
      cx.beginPath(); cx.moveTo(q[0][0], q[0][1]);
      const e = [lerp(q[0][0], q[1][0], clamp(k * 2)), lerp(q[0][1], q[1][1], clamp(k * 2))];
      cx.lineTo(e[0], e[1]);
      if (k > 0.5) cx.lineTo(lerp(q[1][0], q[2][0], clamp(k * 2 - 1)), lerp(q[1][1], q[2][1], clamp(k * 2 - 1)));
      cx.lineCap = 'round'; cx.lineJoin = 'round';
      cx.lineWidth = 7; cx.strokeStyle = 'rgba(8,10,24,0.8)'; cx.stroke();
      cx.lineWidth = 4.2; cx.strokeStyle = FW_COL[f]; cx.stroke();
    });
    const nk = o.nerve;
    if (nk > 0.01) {
      const p1 = [lerp(join[0], elb[0], clamp(nk * 1.6)), lerp(join[1], elb[1], clamp(nk * 1.6))];
      cx.beginPath(); cx.moveTo(join[0], join[1]); cx.lineTo(p1[0], p1[1]);
      if (nk > 0.62) cx.lineTo(lerp(elb[0], up[0], clamp((nk - 0.62) / 0.38)), lerp(elb[1], up[1], clamp((nk - 0.62) / 0.38)));
      cx.lineCap = 'round'; cx.lineJoin = 'round';
      cx.lineWidth = 12; cx.strokeStyle = 'rgba(8,10,24,0.85)'; cx.stroke();
      cx.lineWidth = 8; cx.strokeStyle = '#FFD447'; cx.stroke();
      // beads of signal running down to the hand
      for (let i = 0; i < 4; i++) {
        const u = 1 - ((t * 1.2 + i / 4) % 1), pa = u < 0.5 ? [lerp(up[0], elb[0], u * 2), lerp(up[1], elb[1], u * 2)] : [lerp(elb[0], join[0], u * 2 - 1), lerp(elb[1], join[1], u * 2 - 1)];
        if (nk > 0.95) { circle(cx, pa[0], pa[1], 6, '#FFFFFF'); }
      }
    }
  });
  if (o.nerve > 0.01) { softDot(gctx, (join[0] + elb[0]) / 2, (join[1] + elb[1]) / 2, 90, '#FFD447', 0.22 * o.nerve); }
  return { Hh, wr, el, elb, join };
}
function nerveA(t, face) {
  const H = { view: 0, spread: { I: 0.0, M: 0, R: 0, L: 0 }, tremble: 0.12 };
  return { face, H, armR: VS_ARM.up, headDX: 2 * Math.sin(t * 1.7), bob: Math.sin(t * 2.3), headRot: 0.02 };
}
SC.nerve = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const face = lerpFace(VF.read, VF.wow, ramp(t, c.funny, c.funny + 0.2));
  const cam = camKeys(lt, [[0, 650, 1090, 2.5], [c.nerve - shot.start, 646, 1138, 2.04], [D, 640, 1146, 2.0]], E.inOutCubic);
  const o = { glass: ramp(t, c.and_they - 0.1, c.all + 0.2, E.inOutSine), threads: ramp(t, c.all - 0.05, c.run + 0.3), nerve: ramp(t, c.one_n - 0.1, c.nerve_end, E.inOutSine) };
  const N = nerveDraw(t, cam, nerveA(t, { ...face, lookX: 0.6, lookY: 0.6 }), o);
  if (N.elb) {
    const pe = toScreen(cam, N.elb[0], N.elb[1]);
    fwJester(pe[0], pe[1], 42, ramp(t, c.funny - 0.05, c.funny + 0.2), ramp(t, c.bone_end, c.bone_end + 0.15), t);
    fwMarquee(pe[0] - 226, pe[1] - 24, ramp(t, c.your_fb - 0.05, c.your_fb + 0.2), ramp(t, c.funny, c.funny + 0.1), 0, t);
  }
  return { glow: 0.9, capY: 1470 };
};

// ================================================================ the sting: Hilarious.
SC.sting = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 604, 1116, 2.26], [D, 600, 1112, 2.34]], E.inOutSine);
  const face = { ...VF.flat, blink: Math.max(VF.flat.blink, pulseOf(t, [c.hil_end + 0.25], 0.12)) };
  const N = nerveDraw(t, cam, nerveA(t, face), { glass: 1, threads: 1, nerve: 1 });
  if (N.elb) {
    const pe = toScreen(cam, N.elb[0], N.elb[1]);
    const laugh = 1 - ramp(t, c.hil_end + 0.25, c.hil_end + 0.5);
    fwJester(pe[0], pe[1], 42, 1, laugh, t);
    fwMarquee(pe[0] - 226, pe[1] - 24, 1, 1, ramp(t, c.hil_end + 0.05, c.hil_end + 0.65), t);
  }
  return { glow: 0.9, capY: 1470 };
};

// ================================================================ the button: now try it SLOWER (and the loop)
SC.button = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const iOut = ramp(t, c.try, c.slower, E.inOutSine);                     // slowly...
  const lOut = ramp(t, c.slower + 0.05, c.slower_end + 0.1, E.inOutSine);   // slowly...
  const back = ramp(t, c.loop_in - 0.28, c.loop_in - 0.02, E.outBack);    // ...and it all springs back: frame 1
  const H = { view: 0, spread: { I: 0.33 * iOut * (1 - back), M: 0, R: -0.06 * lOut * Math.sin(t * 7) * (1 - back), L: -0.37 * lOut * (1 - back) }, tremble: 0.35 + 0.4 * lOut };
  const S0 = hookA(-0.4);
  const A = { ...S0.A, H, face: lerpFace(VF.focus, VF.strain, 0.6 * lOut * (1 - back)), tongue: 0.9, sweat: 0.6 * lOut * (1 - back) };
  // the camera eases back to frame 1's
  const k0 = hookCam(-0.4), cam = camKeys(lt, [[0, 650, 1010, 2.95], [D, k0.x, k0.y, k0.zoom]], E.inOutCubic);
  summitDraw(t, { cam, A });
  tagPill('SLOW MO', 540, 520, '#7FE9FF', popK(t, c.slower - 0.05, c.loop_in - 0.25, 0.1, 0.1), 34);
  return { glow: 0.85 };
};
SC.loop = (lt, t, shot) => {
  const tt = t - TLd.duration;
  const S = hookA(tt);
  summitDraw(t, { cam: hookCam(tt), A: S.A });
  return { glow: 0.85 };
};

// ================================================================ the cover (cover.sh renders it into cover.jpg)
SC.cover = (lt, t, shot) => {
  const S = hookA(-0.4);
  const H = { view: 0, spread: { I: 0.36, M: 0.0, R: 0.0, L: -0.40 }, tremble: 0, glowM: 1, glowR: 1 };
  const A = { ...S.A, H, face: { ...VF.strain, lookX: 0.7, lookY: -0.45 }, tongue: 0, sweat: 1, headDX: 0, headDY: 0, bob: 0, inHand: null };
  const cam = { x: 652, y: 968, zoom: 2.55, rot: 0 };
  const Hh = summitDraw(t, { cam, A });
  if (Hh.P) {
    const pI = tipScr(Hh, cam, 'I', 30), pM = tipScr(Hh, cam, 'M', 30), pR = tipScr(Hh, cam, 'R', 30), pL = tipScr(Hh, cam, 'L', 30);
    numBadge('1', pI[0], pI[1] - 30, '#7FE9FF', 1, 42);
    numBadge('2', (pM[0] + pR[0]) / 2, Math.min(pM[1], pR[1]) - 38, '#FF9A3C', 1, 42);
    numBadge('1', pL[0], pL[1] - 30, '#4DFFB4', 1, 42);
  }
  screenSpace();
  bigWord('CAN YOU?', 540, 540, 150, '#FFD447', 1, -0.04);
  return { glow: 0.85, noCaptions: true };
};

function initScenes2() {
  initSummit();
}
