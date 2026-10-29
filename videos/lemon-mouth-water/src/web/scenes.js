// Why Does Your Mouth Water When You Imagine a LEMON? 🍋 Short: the shots. Each SC.<id>(lt, t, shot) draws one frame
// (lt = seconds inside the shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;
const bumpAt = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);
const pulseOf = (t, times, len = 0.16) => times.reduce((m, f) => Math.max(m, clamp((t - f) / 0.03) * clamp((f + len - t) / 0.05)), 0);
const lmL2 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the grove at noon: the sun upper right is the key, the sky's blue is the rim from the left
const GROVE_LIGHT = { ...LIGHTS.day, keyTint: [1.07, 1.04, 0.96], rimAmt: 0.95, halo: 0.08, pool: 0.26 };
// inside: the glass head on a dark field
const SEC_LIGHT = { ...LIGHTS.diagram, rim: [0.6, 0.9, 1.0], rimAmt: 0.6 };
// the lab: the window's daylight from the upper right, a cool rim
const LAB_LIGHT = { ...LIGHTS.day, keyTint: [1.0, 1.04, 1.04], rim: [0.75, 0.95, 1.0], rimAmt: 0.7, pool: 0.34 };
setLights({ hook: GROVE_LIGHT, button: GROVE_LIGHT, loop: GROVE_LIGHT, cover: GROVE_LIGHT, section: SEC_LIGHT, acid: SEC_LIGHT, lab: LAB_LIGHT, caring: LAB_LIGHT });

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
function burstWord(txt, x, y, r, col, k, rot = -0.08, size = 110) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.4);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const star = (R, fill) => { ctx.beginPath(); for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2, rr = i % 2 ? R * 0.72 : R; ctx.lineTo(Math.cos(a) * rr * 1.25, Math.sin(a) * rr); } ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); };
  star(r + 10, '#0B0B1A'); star(r, col);
  ctx.font = `400 ${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = 10; ctx.strokeStyle = '#0B0B1A'; ctx.strokeText(txt, 0, 6); ctx.fillStyle = '#FFFFFF'; ctx.fillText(txt, 0, 6);
  ctx.restore();
  softDot(gctx, x, y, r * 1.6, col, 0.35 * clamp(k));
}
function okTick(x, y, r, k) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  circle(ctx, 0, 0, r + 6, '#FFFFFF'); circle(ctx, 0, 0, r, '#12B25C');
  ctx.lineWidth = r * 0.24; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#FFFFFF'; ctx.beginPath();
  ctx.moveTo(-r * 0.45, 0); ctx.lineTo(-r * 0.1, r * 0.36); ctx.lineTo(r * 0.5, -r * 0.34); ctx.stroke(); ctx.restore();
}
// sparkles where the ghost lemon popped (screen space)
function popSparks(x, y, k, z = 1) {
  if (k <= 0.01 || k >= 0.99) return;
  screenSpace();
  for (let i = 0; i < 10; i++) {
    const a = i / 10 * Math.PI * 2 + 0.3, d = (30 + 120 * E.outCubic(k)) * z * (0.7 + 0.5 * hash(i * 3.3)), r = (9 - 7 * k) * z;
    const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d;
    paint(() => { line(ctx, px - r, py, px + r, py, 3 * z, rgba('#FFFFFF', 1 - k)); line(ctx, px, py - r, px, py + r, 3 * z, rgba('#FFFFFF', 1 - k)); });
    softDot(gctx, px, py, 26 * z, '#BFF4FF', 0.6 * (1 - k));
  }
  paint(() => {
    ctx.beginPath(); ctx.arc(x, y, (20 + 90 * E.outCubic(k)) * z, 0, 7); ctx.lineWidth = 6 * z * (1 - k); ctx.strokeStyle = rgba('#FFFFFF', 0.9 * (1 - k)); ctx.stroke();
    // a puff of smoke where it was
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.4, d = (12 + 46 * E.outCubic(k)) * z; circle(ctx, x + 18 * z + Math.cos(a) * d, y + 10 * z + Math.sin(a) * d * 0.8, (13 + 9 * hash(i * 2.7)) * z * (1 - 0.7 * k), rgba('#F4F8FF', 0.8 * (1 - k))); }
  });
}
// the NICE rosette (screen space): a gold disc with ribbons; k pops it, sq squashes it on impact
function rosette(x, y, R, k, rot, sq = 0) {
  if (k <= 0.01) return;
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k * (1 + 0.25 * sq), k * (1 - 0.2 * sq));
  // the ribbons
  for (const [sd, col] of [[-1, '#2E6FB8'], [1, '#2457A0']]) {
    ctx.beginPath(); ctx.moveTo(sd * R * 0.2, R * 0.4); ctx.lineTo(sd * R * 0.62, R * 1.55); ctx.lineTo(sd * R * 0.4, R * 1.4); ctx.lineTo(sd * R * 0.22, R * 1.62); ctx.lineTo(sd * R * -0.12, R * 0.5); ctx.closePath();
    ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#0B0B1A'; ctx.stroke();
  }
  // the frilled edge and the disc
  ctx.beginPath(); for (let i = 0; i < 36; i++) { const a = i / 36 * Math.PI * 2, rr = i % 2 ? R * 0.9 : R; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath();
  ctx.fillStyle = '#F2A81E'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#0B0B1A'; ctx.stroke();
  const g = ctx.createRadialGradient(-R * 0.25, -R * 0.3, 4, 0, 0, R * 0.8); g.addColorStop(0, '#FFF3A0'); g.addColorStop(1, '#F8C21C');
  circle(ctx, 0, 0, R * 0.74, '#0B0B1A'); circle(ctx, 0, 0, R * 0.69, '#FFE066');
  ctx.beginPath(); ctx.arc(0, 0, R * 0.62, 0, 7); ctx.fillStyle = g; ctx.fill();
  ctx.font = `400 ${Math.round(R * 0.52)}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = R * 0.08; ctx.strokeStyle = '#7A4A08'; ctx.strokeText('NICE', 0, R * 0.04); ctx.fillStyle = '#FFFFFF'; ctx.fillText('NICE', 0, R * 0.04);
  ellipse(ctx, -R * 0.3, -R * 0.38, R * 0.18, R * 0.08, 'rgba(255,255,255,0.8)', -0.5);
  ctx.restore();
  softDot(gctx, x, y, R * 1.7, '#FFD447', 0.3 * k);
}

// ================================================================ him in the grove
// the arms as elbow + wrist (rig-local): his right hand (screen right) with the wedge at his lips; lower; the other at rest
const ARM_BITE = { e: [142, -296], w: [96, -388] };
const ARM_HOLD = { e: [150, -318], w: [96, -428] };        // the wedge away from his mouth, up beside his jaw
const ARM_LOOK = { e: [146, -322], w: [88, -436] };        // the empty hand beside his jaw, where the wedge was
const ARM_LOW_R = { e: [104, -280], w: [96, -206] };
const ARM_REST_L = { e: [-98, -282], w: [-86, -196] };
const ARM_UP_L = { e: [-150, -330], w: [-112, -440] };     // the rosette held up beside his face
// head units -> world
function lmHeadPt(st, r, q) {
  const a = r.lean + (st.headRot || 0), cs = Math.cos(a), sn = Math.sin(a);
  return [st.x + st.s * (r.head[0] + (st.headDX || 0) + q[0] * cs - q[1] * sn), st.y + st.s * (r.head[1] + (st.headDY || 0) + q[0] * sn + q[1] * cs)];
}
// head units -> rig-local (inside the layer's post, where the rig transform is on)
function lmHeadRig(st, r, q) {
  const a = r.lean + (st.headRot || 0), cs = Math.cos(a), sn = Math.sin(a);
  return [r.head[0] + (st.headDX || 0) + q[0] * cs - q[1] * sn, r.head[1] + (st.headDY || 0) + q[0] * sn + q[1] * cs];
}
// his mouth over the rig's, in head units (the mouth at 0, 40): the sour shapes
function lmMouth(c, v, o = {}) {
  if (v === 'pucker' || v === 'water') {
    paint(() => {
      c.save(); c.translate(0, 40);
      // cheeks sucked in: two hollows
      for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 38, -10); c.quadraticCurveTo(s * 31, 2, s * 36, 12); c.lineWidth = 3; c.strokeStyle = 'rgba(176,96,72,0.35)'; c.lineCap = 'round'; c.stroke(); }
      // the lips pushed into a tight knot, wrinkles round them
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; line(c, Math.cos(a) * 14, Math.sin(a) * 12, Math.cos(a) * 21, Math.sin(a) * 18, 2.6, 'rgba(142,52,64,0.6)'); }
      ellipse(c, 0, 0, 13, 11, TWM.lip); ellipse(c, 0, 1, 5.5, 4.5, TWM.in);
      ellipse(c, -4, -5, 4, 2, 'rgba(255,255,255,0.55)');
      if (v === 'water') { c.beginPath(); c.moveTo(-9, 9); c.quadraticCurveTo(0, 13, 10, 8); c.lineWidth = 3; c.strokeStyle = 'rgba(190,240,255,0.95)'; c.stroke(); circle(c, 9, 8, 2.4, '#FFFFFF'); }
      c.restore();
    });
  } else twMouth(c, v, { pal: LMPAL });
}
// the wedge between his mouth M and his hand Hd (rig-local), or held in the hand; bite 0..1, ghost 0..1
function lmHandWedge(c, M, Hd, inMouth, o) {
  const a1 = Math.atan2(Hd[1] - M[1], Hd[0] - M[0]), L1 = Math.hypot(Hd[0] - M[0], Hd[1] - M[1]) / 2 + 6;
  const C1 = [(M[0] + Hd[0]) / 2 + 3, (M[1] + Hd[1]) / 2];
  const a2 = -0.55, L2 = 40, C2 = [Hd[0] - Math.cos(a2) * 34, Hd[1] - Math.sin(a2) * 34];
  const k = clamp(inMouth), ang = lerp(a2, a1, k), L = lerp(L2, Math.max(40, Math.min(52, L1)), k), C = lmL2(C2, C1, k);
  c.save(); c.translate(C[0], C[1]); c.rotate(ang);                     // the pulp face up, the rind toward his chin
  lmWedge(c, { L, R: 27, bite: o.bite || 0, ghost: o.ghost || 0, t: o.t || 0 });
  c.restore();
  return { tip: [C[0] - Math.cos(ang) * L, C[1] - Math.sin(ang) * L], C, ang, L };
}
// his fingers round whatever he holds at the wrist (rig-local); empty = the pinch with nothing in it
function lmGrip(c, wr, ang, pal, empty) {
  c.save(); c.translate(wr[0] - 4, wr[1] - 10); c.rotate(ang);
  rrect(c, -16, -10, 34, 30, 12); c.fillStyle = pal.skinSh; c.fill();
  rrect(c, -15, -9, 31, 27, 11); c.fillStyle = pal.skin; c.fill();
  // the thumb over the top, the finger under: a pinch
  c.save(); c.translate(-12, -12); c.rotate(-0.5 - (empty ? 0.25 : 0));
  rrect(c, -22, -6, 26, 12, 6); c.fillStyle = pal.skinSh; c.fill(); rrect(c, -21, -5, 24, 10, 5); c.fillStyle = pal.skin; c.fill();
  c.restore();
  c.save(); c.translate(-12, 8); c.rotate(0.35 + (empty ? 0.2 : 0));
  rrect(c, -24, -6, 28, 12, 6); c.fillStyle = pal.skinSh; c.fill(); rrect(c, -23, -5, 26, 10, 5); c.fillStyle = pal.skin; c.fill();
  c.restore();
  paint(() => { for (let i = 0; i < 2; i++) line(c, -2 + i * 9, -6, -2 + i * 9, 12, 2, rgba(pal.skinSh, 0.8)); });
  c.restore();
}

// A: {arm: {e, w} R side, armL, mouth (lmMouth shape), face, wedge: {inMouth, bite, ghost, gone}, empty, juice: [{t: seconds since,
//     seed, dir, n, v}], drool 0..1 (the drop's run), headDX, headDY, headRot, hipDY (shoulders), throat 0..1 (a gulp), rosetteHold}
function lmHero(cam, t, A) {
  let pose = { ...POSES.stand, hand: 'open', handL: 'open', handR: 'none' };
  pose.hipY += A.hipDY || 0;
  const aR = A.arm || ARM_LOW_R, aL = A.armL || ARM_REST_L;
  pose = armAt(pose, 'R', aR.e, aR.w); pose = armAt(pose, 'L', aL.e, aL.w);
  const st = { x: LMS.hx, y: LMS.fy, s: LMS.hs, pose, face: { ...A.face, mouth: 'none' }, headRot: A.headRot || 0, headDX: A.headDX || 0, headDY: A.headDY || 0, seed: 3 };
  let wedgeOut = null;
  const r = charLayer(cam, st, t, { pal: LMPAL, post: (lc, rr, s2) => {
    lc.save(); lc.translate(s2.x, s2.y); lc.scale(s2.s, s2.s);
    twHead(lc, s2, rr, (c) => {
      lmMouth(c, A.mouth || 'flat');
      // a drop of drool from the corner of his mouth (head units)
      const dr = A.drool || 0;
      if (dr > 0.01 && dr < 0.999) paint(() => {
        const y = 46 + (dr < 0.5 ? 16 * dr / 0.5 : 16 + 60 * Math.pow((dr - 0.5) / 0.5, 2)), rr2 = 4 + 2.5 * Math.min(1, dr * 2);
        c.beginPath(); c.moveTo(12, 44); c.lineTo(13, y - rr2); c.lineWidth = 2.6 * (1 - 0.5 * dr); c.strokeStyle = 'rgba(190,240,255,0.95)'; c.stroke();
        circle(c, 13, y, rr2, 'rgba(190,240,255,0.95)'); circle(c, 12, y - 1.5, rr2 * 0.4, '#FFFFFF');
      });
      // the gulp: a bump that rides down the throat
      if ((A.throat || 0) > 0.01 && (A.throat || 0) < 0.99) paint(() => ellipse(c, 0, 84 + 30 * A.throat, 14, 7, rgba('#CF8663', 0.55 * Math.sin(A.throat * Math.PI))));
    });
    const W = A.wedge;
    const wr = rr.wrR;
    if (W && !W.gone) {
      const M = lmHeadRig(s2, rr, [10, 41]);
      const Hd = [wr[0] - 10, wr[1] - 16];
      wedgeOut = lmHandWedge(lc, M, Hd, W.inMouth, { bite: W.bite, ghost: W.ghost, t });
      // the top teeth over the pulp while he bites
      if (W.inMouth > 0.5 && (A.mouth === 'A' || A.mouth === 'bite')) twHead(lc, s2, rr, (c) => paint(() => { c.save(); c.translate(0, 40); c.fillStyle = '#FFFFFF'; rrect(c, -14, -13, 28, 7, 3); c.fill(); c.restore(); }));
    }
    lmGrip(lc, wr, -0.35, LMPAL, !W || W.gone || (W.ghost || 0) > 0.6);
    // the juice: from his mouth's corner, in head units
    twHead(lc, s2, rr, (c) => { for (const J of (A.juice || [])) lmJuice(c, [26, 44], J.t, { n: J.n || 16, seed: J.seed || 1, s: 1, dir: J.dir === undefined ? -0.3 : J.dir, spread: J.spread || 0.9, v: J.v || 300 }); });
    lc.restore();
  } });
  return { st, r, hp: (q) => lmHeadPt(st, r, q), wedge: wedgeOut };
}
// where a head-unit point of his would be for these actions (no drawing): the window's spot, the hand's
function lmHeroPt(A, q) {
  let pose = { ...POSES.stand };
  pose.hipY += A.hipDY || 0;
  const aR = A.arm || ARM_LOW_R, aL = A.armL || ARM_REST_L;
  pose = armAt(pose, 'R', aR.e, aR.w); pose = armAt(pose, 'L', aL.e, aL.w);
  const st = { x: LMS.hx, y: LMS.fy, s: LMS.hs, headRot: A.headRot || 0, headDX: A.headDX || 0, headDY: A.headDY || 0 };
  const r = rig(pose);
  return { head: lmHeadPt(st, r, q), wrR: [st.x + r.wrR[0] * st.s, st.y + r.wrR[1] * st.s] };
}
function groveDraw(cam, t, A, o = {}) {
  groveBg(cam, t, o);
  applyCam(cam);
  const Hh = lmHero(cam, t, A);
  if (o.front !== false) groveFront(cam, t, o);
  applyCam(cam);
  return Hh;
}

// ---------------------------------------------------------------- his faces
const LF = {
  bite: { eyeOpen: 0.95, pupil: 1, lookX: 0.3, lookY: 0.5, browY: 0.9, browTilt: 0.5, mouth: 'none', mouthOpen: 0, blink: 0.35, cross: 0, squeeze: 0 },
  sour: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 1.5, browTilt: 1.15, mouth: 'none', mouthOpen: 0, blink: 1, cross: 0, squeeze: 0.5 },
  drool: { eyeOpen: 0.9, pupil: 1, lookX: 0, lookY: 0.1, browY: 1.1, browTilt: 0.95, mouth: 'none', mouthOpen: 0, blink: 0.5, cross: 0, squeeze: 0.15 },
  gulp: { eyeOpen: 1.2, pupil: 0.8, lookX: 0, lookY: 0, browY: 1.2, browTilt: 0.4, mouth: 'none', mouthOpen: 0, blink: 0, cross: 0 },
  hand: { eyeOpen: 1.18, pupil: 0.85, lookX: 0.55, lookY: 1, browY: 1.0, browTilt: 0.7, mouth: 'none', mouthOpen: 0, blink: 0, cross: 0 },
  up: { eyeOpen: 1.2, pupil: 0.8, lookX: -0.75, lookY: -1, browY: 1.3, browTilt: 0.3, mouth: 'none', mouthOpen: 0, blink: 0, cross: 0 },
  smug: { eyeOpen: 0.86, pupil: 1, lookX: 0.1, lookY: 0, browY: 0.7, browTilt: -0.55, mouth: 'none', mouthOpen: 0, blink: 0.15, cross: 0, browL: 0.6 },
  proud: { eyeOpen: 0.95, pupil: 1, lookX: 0, lookY: 0, browY: 0.9, browTilt: -0.2, mouth: 'none', mouthOpen: 0, blink: 0, cross: 0 },
  sus: { eyeOpen: 0.62, pupil: 1.05, lookX: 0.15, lookY: 0, browY: 0.05, browTilt: -0.75, mouth: 'none', mouthOpen: 0, blink: 0.3, cross: 0 },
  game: { eyeOpen: 0.95, pupil: 1, lookX: 0.4, lookY: 0.55, browY: 0.5, browTilt: -0.4, mouth: 'none', mouthOpen: 0, blink: 0, cross: 0 },
};

// ================================================================ the hook: frame 1 and round it (valid at negative time)
// the juice bursts: seconds after each squirt
function hookJuice(tt) {
  const c = cu(), out = [];
  for (const [f, seed, n, v, dir] of [[-0.2, 3, 10, 240, -0.25], [c.chomp, 7, 18, 330, -0.35], [c.squirt, 11, 22, 390, -0.42], [c.lemon + 0.05, 13, 12, 260, -0.2]]) {
    if (tt >= f && tt - f < 1.1) out.push({ t: tt - f, seed, n, v, dir });
  }
  return out;
}
function hookA(tt) {
  const c = cu();
  // the wedge: at his lips from before frame 1 (the loop's last frames lift it there), out of his mouth on "Your mouth's"
  const lift = ramp(tt, -0.45, -0.12, E.outCubic);
  const away = ramp(tt, c.your_mouth - 0.12, c.your_mouth + 0.25, E.inOutCubic);
  const inMouth = tt < 0 ? lift : 1 - away;
  const ghost = ramp(tt, c.no - 0.02, c.no + 0.14);
  const gone = tt >= c.poof;
  // the arm: up at his lips, down a little with the wedge, up beside his face for the look at his empty hand, then low
  let arm = armMix(ARM_HOLD, ARM_BITE, inMouth);
  arm = armMix(arm, ARM_LOOK, ramp(tt, c.poof - 0.1, c.poof + 0.2, E.inOutCubic));
  arm = armMix(arm, ARM_LOW_R, ramp(tt, c.win - 0.05, c.win + 0.4, E.inOutCubic));
  // the mouth
  let mouth = 'A';
  if (tt >= c.chomp - 0.04) mouth = 'P';
  if (tt >= c.your_mouth + 0.05) mouth = 'pucker';
  if (tt >= c.watering) mouth = 'water';
  if (tt >= c.gulp - 0.02) mouth = 'P';
  if (tt >= c.gulp + 0.3) mouth = 'flat';
  if (tt >= c.no - 0.05) mouth = 'ooh';
  if (tt >= c.win + 0.2) mouth = 'O';
  // the face
  let face = LF.bite;
  face = lerpFace(face, LF.sour, ramp(tt, c.chomp + 0.05, c.squirt + 0.1));
  face = lerpFace(face, LF.drool, ramp(tt, c.watering - 0.1, c.watering + 0.25));
  face = lerpFace(face, LF.gulp, ramp(tt, c.gulp - 0.05, c.gulp + 0.1));
  face = lerpFace(face, LF.hand, ramp(tt, c.poof - 0.05, c.poof + 0.12));
  face = lerpFace(face, LF.up, ramp(tt, c.win - 0.05, c.win + 0.2));
  face = { ...face, blink: Math.max(face.blink || 0, pulseOf(tt, [c.gulp + 0.18], 0.1)) };
  const shiver = popK(tt, c.squirt, c.lemon_end + 0.25, 0.05, 0.2);
  return {
    arm, mouth, face, wedge: { inMouth, bite: tt >= c.chomp ? 1 : 0, ghost, gone },
    juice: hookJuice(tt), drool: ramp(tt, c.drool, c.drool + 1.6, (x) => x),
    throat: ramp(tt, c.gulp, c.gulp + 0.35, (x) => x),
    headDX: 3.2 * shiver * Math.sin(tt * 62), headDY: -3 * bumpAt(tt, c.chomp, 8) + 4 * bumpAt(tt, c.gulp, 9),
    headRot: 0.03 * Math.sin(tt * 3) * (1 - shiver) - 0.04 * bumpAt(tt, c.squirt, 7) + 0.05 * ramp(tt, c.poof, c.poof + 0.2) * (1 - ramp(tt, c.win, c.win + 0.3)),
    hipDY: -6 * shiver,
  };
}
const HOOK_CAM0 = [546, 1050, 4.0];
function hookCam(tt) {
  const c = cu();
  const k = camKeys(tt, [[-0.45, 544, 1052, 3.86], [0, ...HOOK_CAM0], [c.squirt, 550, 1048, 4.18], [c.lemon_end, 552, 1046, 4.3],
    [c.your_mouth, 552, 1044, 4.22], [c.gulp, 554, 1042, 4.15], [c.poof, 562, 1040, 3.95], [c.win + 0.2, 546, 1020, 3.7], [c.practice, 540, 1012, 3.85]], E.inOutCubic);
  if (tt >= 0 && tt < 0.4) { const u = E.outCubic(tt / 0.4); k.zoom = lerp(4.0, 4.07, u); }
  const sh = bumpAt(tt, c.chomp, 10) + 0.7 * bumpAt(tt, c.squirt, 9);
  k.y += 6 * sh * Math.sin(tt * 57); k.x += 4 * sh * Math.sin(tt * 43);
  return k;
}

// the window on his forehead into the glass head (the brain): the section shot starts where the dive ends
const SEC_F0 = twSW(LM_BRAIN_P), SEC_Z0 = 1.85;
const WIN_HP = [-16, -56];
function brainState(t) {
  const c = cu();
  const chomp = ramp(t, c.brain_chomp - 0.08, c.brain_chomp + 0.04, E.inCubic);
  let mood = 'chomp';
  if (t > c.brain_chomp + 0.18) mood = 'pucker';
  if (t > c.taps + 0.5) mood = 'calm';
  return {
    mood, chomp, bib: 1, look: [0.2, 0.4],
    armL: [-92, 112], armR: [92, 112],
    held: (cc) => {
      cc.save(); cc.translate(-4, 112); cc.rotate(0.06 * Math.sin(t * 3));
      lmWedge(cc, { L: 92, R: 52, bite: t >= c.brain_chomp ? 1 : 0, ghost: 0, t });
      lmWedge(cc, { L: 92, R: 52, bite: t >= c.brain_chomp ? 1 : 0, ghost: 1, t });
      cc.restore();
    },
  };
}
function secWindow(P, R, z, t, inside) {
  if (R < 2) return;
  screenSpace();
  ctx.beginPath(); ctx.arc(P[0], P[1], R, 0, 7); ctx.fillStyle = '#0B1230'; ctx.fill();
  ctx.save(); gctx.save();
  ctx.beginPath(); ctx.arc(P[0], P[1], R, 0, 7); ctx.clip();
  gctx.beginPath(); gctx.arc(P[0], P[1], R, 0, 7); gctx.clip();
  const cam = { x: SEC_F0[0] - (P[0] - 540) / z, y: SEC_F0[1] - (P[1] - 960) / z, zoom: z };
  twSecBg(cam, t); applyCam(cam); twSection(t, { lips: 1, open: 0 }); lmInside(t, inside);
  ctx.restore(); gctx.restore();
  screenSpace();
  paint(() => { ctx.beginPath(); ctx.arc(P[0], P[1], R, 0, 7); ctx.lineWidth = Math.max(5, R * 0.035); ctx.strokeStyle = 'rgba(159,230,255,0.95)'; ctx.stroke(); });
}

SC.hook = (lt, t, shot) => {
  const c = cu(), A = hookA(t), cam0 = hookCam(t);
  const win = ramp(t, c.win, c.win + 0.25, E.outBack);
  const dive = ramp(t, c.bite_end - 0.1, shot.end, E.inOutCubic);
  const HP = lmHeroPt(A, WIN_HP), HOOK_WIN = HP.head;
  const cam = dive > 0.001 ? scaledCam(cam0, HOOK_WIN, 1 + 4.0 * E.inCubic(dive)) : cam0;
  groveDraw(cam, t, A, {});
  // the ghost wedge pops: sparkles where his fingers held it
  const pk = ramp(t, c.poof, c.poof + 0.45, (x) => x), gs = toScreen(cam, HP.wrR[0] - 40, HP.wrR[1]);   // the wedge's middle
  screenSpace();
  if (A.wedge.ghost > 0.05 && !A.wedge.gone) softDot(gctx, gs[0], gs[1], 110 * cam.zoom / 4, '#BFF4FF', 0.3 * A.wedge.ghost);
  if (pk > 0 && pk < 1) popSparks(gs[0], gs[1], pk, cam.zoom / 4);
  // the window on his forehead: his brain in a bib takes a practice bite of a ghost lemon
  if (win > 0.001) {
    const P0 = toScreen(cam, ...HOOK_WIN), zf = dive > 0.001 ? 1 + 4.0 * E.inCubic(dive) : 1;
    const R = lerp(0, 66 * cam0.zoom, win) * zf + 1400 * E.inCubic(ramp(t, shot.end - 0.22, shot.end));
    const P = lmL2(P0, [540, 960], E.inOutCubic(ramp(t, c.bite_end - 0.1, shot.end)));
    const z = lerp(1.45, SEC_Z0, E.inOutCubic(ramp(t, c.bite_end - 0.1, shot.end)));
    secWindow(P, R, z, t, { brain: brainState(t) });
    // PRACTICE, stamped across the window's lower edge
    stamp('PRACTICE', clamp(P[0] + R * 0.62, 330, 760), clamp(P[1] + R * 0.95, 560, 1180), popK(t, c.practice - 0.04, c.bite_end + 0.05, 0.1, 0.12), '#FF4D6D', -0.14, 88);
  }
  return { glow: 0.85, flash: 0.08 * bumpAt(t, c.chomp, 10) + 0.1 * bumpAt(t, c.poof, 9), zblur: 0.16 * E.inCubic(dive), zcx: 540, zcy: 960 };
};

// ================================================================ the glass head: the flood under the tongue, the lick
function insideState(t) {
  const c = cu();
  const lick = Math.max(0.42 * ramp(t, c.licking - 0.1, c.licking + 0.4, E.inOutCubic), lerp(0.42, 1, ramp(t, c.slowly, c.slowly_end + 0.1, E.inOutSine)) * (t >= c.slowly ? 1 : 0));
  const lickOut = lick * (1 - ramp(t, c.lemon3 - 0.1, c.lemon3 + 0.35, E.inOutCubic));
  // the acid drops: three, leaving the ghost after "acid", landing after the teeth are wet
  const drops = [];
  const land = [c.down - 0.05, c.early + 0.08, c.early_end + 0.05];
  for (let i = 0; i < 3; i++) {
    const t0 = c.acid_end - 0.1 + i * 0.4, u = ramp(t, t0, land[i], (x) => x);
    drops.push({ u, fizz: ramp(t, land[i], land[i] + 0.35, (x) => x), dx: [-6, 4, 10][i] });
  }
  let brain = brainState(t);
  if (t >= c.taps + 0.3) brain = { mood: 'calm', look: [0.6, 0.8], bib: 0 };
  if (t >= c.acid - 0.05) brain = { mood: 'alarm', look: [1, 0.3], bib: 0, armR: [176, -60 + 16 * Math.sin(t * 14)] };
  if (t >= c.so - 0.05) brain = { mood: 'smug', look: [1, 0.7], bib: 0, armR: lmL2([176, -60], [224, 104], ramp(t, c.so - 0.05, c.so + 0.18, E.inCubic)) };
  return {
    open: 0.12 + 0.45 * Math.max(lickOut, 0.6 * ramp(t, c.acid, c.acid + 0.3)) , lips: 0, brain,
    glands: ramp(t, c.taps - 0.05, c.taps + 0.3), nerve: ramp(t, c.feel, c.feel + 0.25),
    pulse: t < c.so ? (t < c.taps + 0.12 ? ramp(t, c.feel + 0.05, c.taps + 0.1, (x) => x) : -1) : (t < c.so + 0.6 ? ramp(t, c.so, c.so + 0.55, (x) => x) : -1),
    flow: ramp(t, c.taps + 0.1, c.taps + 0.4), blast: Math.max(ramp(t, c.slowly, c.slowly + 0.4), ramp(t, c.hoses - 0.1, c.hoses + 0.3)),
    hose: ramp(t, c.hoses - 0.1, c.hoses + 0.35, E.inOutCubic),
    coat: Math.max(lerp(0, 0.6, ramp(t, c.taps + 0.2, c.tongue_end, E.inOutSine)), lerp(0.6, 1, ramp(t, c.slowly, c.slowly_end))),
    spill: ramp(t, c.slowly + 0.3, c.slowly_end + 0.5, (x) => x) * (t < c.lemon3 + 0.4 ? 1 : 0),
    lick: lickOut, squint: Math.max(ramp(t, c.licking, c.licking + 0.2), 0) * (1 - ramp(t, c.lemon3, c.lemon3 + 0.3)),
    ghost: { k: ramp(t, c.now - 0.1, c.now + 0.2), bite: 0, stamp: 'ACID', stampK: ramp(t, c.acid - 0.05, c.acid + 0.15), stampCol: '#FF5A3C' },
    drops, shine: ramp(t, c.teeth - 0.1, c.teeth + 0.25),
    btn: popK(t, c.acid + 0.1, c.so + 0.75, 0.25, 0.15), press: ramp(t, c.so + 0.1, c.so + 0.18) * (1 - ramp(t, c.so + 0.5, c.so + 0.7)),
  };
}
SC.section = (lt, t, shot) => {
  const c = cu(), T0 = shot.start;
  const MO = twSW([-104, 10]), LP = twSW([4, -6]), LP2 = twSW([22, -8]);
  const cam = camKeys(t, [[T0, SEC_F0[0], SEC_F0[1], SEC_Z0], [c.taps + 0.05, SEC_F0[0] + 6, SEC_F0[1] + 26, 1.8], [c.under - 0.15, MO[0], MO[1], 2.22],
    [c.tongue_end, MO[0] + 6, MO[1] + 2, 2.36], [c.now + 0.15, LP[0], LP[1], 2.3], [c.licking + 0.3, LP[0] + 8, LP[1], 2.4], [c.slowly_end, LP2[0], LP2[1], 2.75], [shot.end, LP2[0] + 2, LP2[1], 2.78]], E.inOutCubic);
  twSecBg(cam, t); applyCam(cam);
  const S = insideState(t);
  twSection(t, { lips: 0, open: S.open, eye: { lookX: 1, lookY: 0.2 } });
  const R = lmInside(t, S);
  const tp = (p) => toScreen(cam, p[0], p[1]);
  // SPIT TAPS: a pill between the two taps
  const T1 = tp(R.cheekTap), T2 = tp(R.tongueTap);
  const lx = clamp((T1[0] + T2[0]) / 2 + 40, 300, 760), ly = clamp(Math.min(T1[1], T2[1]) - 300, 520, 900);
  const kTaps = popK(t, c.under - 0.08, c.now - 0.1, 0.1, 0.12);
  thinLeader([lx + 60, ly + 34], [T2[0] + 6, T2[1] - 50], kTaps, '#9FE6FF');
  thinLeader([lx - 60, ly + 34], [T1[0] - 30, T1[1] - 60], kTaps, '#9FE6FF');
  tagPill('SPIT TAPS', lx, ly, '#9FE6FF', kTaps, 50);
  return { glow: 0.9, flash: 0.12 * (1 - ramp(lt, 0, 0.12)) };
};
SC.acid = (lt, t, shot) => {
  const c = cu(), T0 = shot.start;
  const LP2 = twSW([22, -24]), WH = twSW([-110, -150]), MT = twSW([-30, -22]), TE = twSW([-2, -24]);
  const cam = camKeys(t, [[T0, LP2[0] + 2, LP2[1], 2.78], [c.means, WH[0], WH[1], 1.32], [c.acid_end, WH[0] + 6, WH[1], 1.36], [c.so + 0.3, WH[0] + 20, WH[1] + 30, 1.42],
    [c.hoses + 0.1, MT[0], MT[1], 2.2], [c.teeth, TE[0], TE[1], 2.65], [shot.end, TE[0] + 4, TE[1], 2.8]], E.inOutCubic);
  twSecBg(cam, t); applyCam(cam);
  const S = insideState(t);
  twSection(t, { lips: 0, open: S.open, eye: { lookX: 1, lookY: 0.4 } });
  const R = lmInside(t, S);
  const tp = (p) => toScreen(cam, p[0], p[1]);
  // ACID! at the ghost lemon; a tick once the first drop fizzles on wet teeth
  const Gs = tp(R.ghost), Te = tp(R.teeth);
  burstWord('ACID!', clamp(Gs[0] + 20, 300, 760), clamp(Gs[1] - 190, 560, 1000), 120, '#FF5A3C', popK(t, c.acid - 0.03, c.so - 0.05, 0.08, 0.12), -0.1, 92);
  okTick(clamp(Te[0] - 150, 200, 860), clamp(Te[1] + 170, 700, 1200), 44, popK(t, c.down + 0.15, shot.end + 1, 0.1, 0.1));
  return { glow: 0.9, flash: 0.1 * bumpAt(t, c.hoses, 9) };
};

// ================================================================ the lab: people drooled just watching a man eat a lemon
const LM_LEVELS = [0.3, 0.6, 0.95];
function labState(t) {
  const c = cu();
  const bites = [c.in_lab + 0.25, c.drooled + 0.2, c.eat + 0.02];
  const lastBite = bites.reduce((m, f) => (f <= t && f > m ? f : m), -99);
  const fill = (i) => LM_LEVELS[i] * ramp(t, c.drooled + 0.1 + 0.2 * i, c.lemon4_end + 0.2, E.inOutSine);
  return { bites, lastBite, fill };
}
function labDraw(cam, t, o = {}) {
  const c = cu(), L = labState(t);
  lmLabBg(cam, t);
  applyCam(cam);
  // the volunteers (actors), the bench, their cups
  LMLAB.vols.forEach(([x, y, s], i) => {
    const drips = c.drips.filter((_, j) => j % 3 === i);
    const lastD = drips.reduce((m, f) => (f <= t && f > m ? f : m), -99);
    const wide = bumpAt(t, L.lastBite, 3) * (t > L.lastBite ? 1 : 0);
    actor(() => lmVol(ctx, x, y, s, t, { L: LMV[i], puff: 1, look: o.look || [-1, -0.55], wide: Math.max(wide, o.wide || 0), drip: t - lastD < 0.9 ? (t - lastD) / 0.9 : 0, aww: (o.aww || [0, 0, 0])[i], tilt: (o.tilt || [0, 0, 0])[i] }));
  });
  lmBench(cam, t);
  LMLAB.vols.forEach(([x, y, s], i) => lmCup(ctx, x + 6, y + 8, 1.05, o.levels ? o.levels[i] : L.fill(i), i + 1, t));
  // the TV in front, playing him biting a lemon
  const sinceBite = t - L.lastBite;
  lmTV(ctx, LMLAB.tv[0], LMLAB.tv[1], LMLAB.tv[2], t, { bite: sinceBite >= 0 && sinceBite < 0.9 ? 1 : 0, squirt: sinceBite >= 0 && sinceBite < 1.1 ? sinceBite : 0, pucker: sinceBite > 0.15 && sinceBite < 1.3 ? 1 : 0 });
  return L;
}
SC.lab = (lt, t, shot) => {
  const c = cu(), T0 = shot.start;
  const cam = camKeys(t, [[T0, 610, 960, 1.3], [c.people, 690, 940, 1.62], [c.just, 610, 900, 1.36], [c.eat - 0.15, 450, 735, 1.85], [c.lemon4_end, 446, 730, 1.9], [shot.end, 520, 800, 1.6]], E.inOutCubic);
  labDraw(cam, t, { wide: popK(t, c.watching, c.lemon4_end, 0.1, 0.3) * 0.6 });
  // COTTON ROLLS: a tag at the first cheek, early
  const V0 = toScreen(cam, LMLAB.vols[0][0] + 44, LMLAB.vols[0][1] - 230 * 1.1 + 40);
  const kC = popK(t, c.lab, c.drooled + 0.6, 0.1, 0.12);
  thinLeader([clamp(V0[0] + 60, 300, 820), clamp(V0[1] + 150, 700, 1220) - 30], V0, kC, '#FFFFFF');
  tagPill('COTTON IN CHEEKS', clamp(V0[0] + 60, 300, 820), clamp(V0[1] + 150, 700, 1220), '#FFFFFF', kC, 40);
  return { glow: 0.8, flash: 0.1 * (1 - ramp(lt, 0, 0.12)), capY: 1560 };
};
// the caring: a heart over each volunteer, sized by the cup
SC.caring = (lt, t, shot) => {
  const c = cu(), T0 = shot.start;
  const cam = camKeys(t, [[T0, 700, 960, 1.55], [c.drooled2_end, 704, 945, 1.6], [c.more2, 704, 880, 1.5], [shot.end, 712, 862, 1.62]], E.inOutCubic);
  const aww = [0, 0, ramp(t, c.others, c.others + 0.2)];
  labDraw(cam, t, { levels: LM_LEVELS, look: lmL2([-1, 0.45], [0, -0.6], ramp(t, c.cared - 0.2, c.cared + 0.2)), aww, tilt: [0, 0, -0.12 * aww[2]] });
  applyCam(cam);
  // the cups glow in turn on "drooled", the hearts pop on "cared", smallest to biggest
  LMLAB.vols.forEach(([x, y, s], i) => {
    const k = ramp(t, c.hearts[i], c.hearts[i] + 0.25);
    lmHeart(x, y - 230 * s - 150, 26 + 52 * LM_LEVELS[i], k, t, bumpAt(t, c.hearts[3], 6) * (i === 2 ? 1 : 0));
    const cupK = pulseOf(t, [c.drooled2 + 0.15 * i], 0.35);
    if (cupK > 0) softDot(gctx, x + 6, y - 30, 70, '#8CDCFF', 0.35 * cupK);
  });
  const P = LMLAB.vols.map(([x, y], i) => toScreen(cam, x + 6, y));
  tagPill('MORE CARING', clamp(P[1][0], 300, 780), 560, '#FF86A6', popK(t, c.cared, shot.end + 1, 0.1, 0.1), 44);
  return { glow: 0.85, flash: 0.1 * (1 - ramp(lt, 0, 0.12)), capY: 1560 };
};

// ================================================================ the button: drooling? congrats, you're nice. Not drooling? watch him again
const ROS_SPOT = [318, 640];
SC.button = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = TLd.duration;
  const start = ramp(t, D - 0.62, D - 0.45, E.inOutCubic);   // the last frames become the hook's
  const HA = hookA(t - D);
  let face = lerpFace(LF.proud, LF.smug, ramp(t, c.drooling - 0.05, c.drooling + 0.15));
  face = lerpFace(face, LF.proud, ramp(t, c.congrats, c.congrats + 0.2));
  face = lerpFace(face, LF.sus, ramp(t, c.not - 0.05, c.not + 0.15));
  face = lerpFace(face, LF.game, ramp(t, c.watch - 0.05, c.watch + 0.2));
  face = lerpFace(face, HA.face, start);
  let mouth = 'smirk';
  if (t >= c.congrats) mouth = 'grin';
  if (t >= c.not - 0.05) mouth = 'flat';
  if (t >= c.watch) mouth = 'smirk';
  if (t >= c.pick - 0.1) mouth = 'A';
  if (start > 0.5) mouth = HA.mouth;
  // the wedge: low in his hand, up to his lips on "again"
  const up = ramp(t, c.watch, c.again_end + 0.1, E.inOutCubic);
  let arm = armMix(ARM_HOLD, ARM_BITE, ramp(t, c.again_end - 0.1, D - 0.45, E.inOutCubic));
  arm = armMix(armMix(ARM_LOW_R, ARM_HOLD, up), arm, ramp(t, c.again_end - 0.1, c.again_end + 0.1));
  if (start > 0) arm = armMix(arm, HA.arm, start);
  const slap = ramp(t, c.congrats + 0.1, c.rosette - 0.1, E.inOutCubic) * (1 - ramp(t, c.rosette - 0.1, c.rosette + 0.1));
  const A = {
    arm, armL: armMix(ARM_REST_L, ARM_UP_L, slap), mouth, face,
    wedge: { inMouth: start > 0 ? HA.wedge.inMouth * start : 0, bite: 0, ghost: 0, gone: false },
    juice: start > 0 ? HA.juice : [], drool: ramp(t, c.drooling - 0.1, c.drooling + 1.5, (x) => x),
    headDX: 0, headDY: lerp(-4 * bumpAt(t, c.rosette, 8), HA.headDY, start),
    headRot: lerp(0.06 * popK(t, c.drooling, c.congrats + 0.2, 0.15, 0.2) - 0.05 * popK(t, c.not, c.watch, 0.15, 0.2), HA.headRot, start),
  };
  const c0 = hookCam(-0.45);
  const cam = camKeys(t, [[T0, 532, 1060, 3.2], [c.congrats, 530, 1050, 3.3], [c.nice_end, 534, 1048, 3.35], [c.not, 538, 1046, 3.55], [c.watch, 532, 1050, 3.75], [D - 0.45, c0.x, c0.y, c0.zoom]], E.inOutCubic);
  const sh = bumpAt(t, c.rosette, 9);
  cam.x += 4 * sh * Math.sin(t * 61); cam.y += 5 * sh * Math.sin(t * 47);
  const Hh = groveDraw(cam, t, A, {});
  // the rosette: from his raised hand onto the lens, stuck, then it peels off and falls
  const hand = toScreen(cam, ...Hh.hp([-120, 30]));
  const fly = ramp(t, c.rosette - 0.16, c.rosette, E.inCubic);
  const fall = ramp(t, c.not + 0.05, c.drooling2_end + 0.2, E.inCubic);
  if (t >= c.congrats + 0.05 && fall < 1) {
    const P = lmL2(hand, ROS_SPOT, fly), y = P[1] + 1500 * fall * fall;
    const R = lerp(70, 185, fly), sq = bumpAt(t, c.rosette, 10);
    rosette(P[0], y, R, ramp(t, c.congrats + 0.05, c.congrats + 0.2, E.outBack), -0.12 + 0.05 * Math.sin(t * 5) * (fly >= 1 ? 1 : 0) + 1.2 * fall, sq);
  }
  return { glow: 0.85, flash: 0.12 * (1 - ramp(lt, 0, 0.1)) + 0.06 * bumpAt(t, c.rosette, 9) };
};
SC.loop = (lt, t, shot) => {
  const tt = t - TLd.duration, A = hookA(tt), cam = hookCam(tt);
  groveDraw(cam, t, A, {});
  return { glow: 0.85 };
};

// ================================================================ the cover (rendered by src/cover.sh from a one-shot timeline)
SC.cover = (lt, t) => {
  const c = cu(), T0 = c.squirt + 0.25, A0 = hookA(T0);
  const A = { ...A0, mouth: 'A', face: { ...LF.sour, squeeze: 0.6 }, wedge: { inMouth: 1, bite: 0, ghost: 0, gone: false }, arm: ARM_BITE,
    juice: [{ t: 0.22, seed: 11, n: 24, v: 400, dir: -0.45 }, { t: 0.42, seed: 7, n: 16, v: 330, dir: -0.3 }], drool: 0, throat: 0, headDX: 0, headDY: 0, headRot: -0.03 };
  const cam = { x: 556, y: 1000, zoom: 4.4, rot: 0 };
  const Hh = groveDraw(cam, T0, A, {});
  screenSpace();
  const hc = toScreen(cam, ...Hh.hp([0, -6]));
  shockLines(hc[0], hc[1], 360, 0.55, 12, '#FFFFFF', 3);
  bigWord('DROOLING', 540, 470, 150, '#FFD447', 1, -0.03);
  bigWord('YET?', 540, 612, 150, '#FFFFFF', 1, -0.03);
  return { glow: 0.85, noCaptions: true };
};

function initScenes2() {
  initGrove();
  initLmLab();
}
