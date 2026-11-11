// Why Can't You Lick Your ELBOW? 💪 Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;
const pulseOf = (t, times, len = 0.16) => times.reduce((m, f) => Math.max(m, clamp((t - f) / 0.03) * clamp((f + len - t) / 0.05)), 0);
const bumpAt = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);
const elL2 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

// ---------------------------------------------------------------- the light (reference/visual.md "The light")
// a hot clear day: the sun high on the left is the key, the blue sky the rim from the right; the diagram beats keep it
const DAY_LIGHT = { ...flipLight(LIGHTS.day), rimAmt: 0.95, pool: 0.32, dof: 0.6, halo: 0.08 };
setLights({ hook: DAY_LIGHT, answer: DAY_LIGHT, feel: DAY_LIGHT, swing: DAY_LIGHT, payoff: DAY_LIGHT, weird: DAY_LIGHT,
  button: DAY_LIGHT, loop: DAY_LIGHT, cover: DAY_LIGHT });

// ---------------------------------------------------------------- his faces (mouth 'none': elbow.js draws the open corner)
const EF = {
  strain: (s) => ({ eyeOpen: 0.82, pupil: 1, lookX: 0.95 * s, lookY: -0.75, browY: 0.2, browTilt: 1.15, mouth: 'none', mouthOpen: 0, blink: 0.15, cross: 0, squeeze: 0.25 }),
  push: (s) => ({ eyeOpen: 0.62, pupil: 1, lookX: 0.95 * s, lookY: -0.8, browY: -0.3, browTilt: 1.3, mouth: 'none', mouthOpen: 0, blink: 0.3, cross: 0, squeeze: 0.55 }),
  gasp: { eyeOpen: 1.15, pupil: 0.85, lookX: 0, lookY: 0, browY: 0.9, browTilt: 0.8, mouth: 'o', mouthOpen: 0.75, blink: 0, cross: 0 },
  show: { eyeOpen: 1.1, pupil: 0.9, lookX: 0, lookY: 0.6, browY: 1.1, browTilt: 0.2, mouth: 'none', mouthOpen: 0, blink: 0, cross: 0 },
  look: (s) => ({ eyeOpen: 1.12, pupil: 0.85, lookX: 0.9 * s, lookY: -0.1, browY: 0.9, browTilt: 0.6, mouth: 'o', mouthOpen: 0.2, blink: 0, cross: 0 }),
  wow: (s) => ({ eyeOpen: 1.3, pupil: 0.6, lookX: 0.8 * s, lookY: -0.2, browY: 1.45, browTilt: 0.3, mouth: 'o', mouthOpen: 0.5, blink: 0, cross: 0 }),
  chase: (lx, ly) => ({ eyeOpen: 1.05, pupil: 0.9, lookX: lx, lookY: ly, browY: 0.7, browTilt: 0.8, mouth: 'none', mouthOpen: 0, blink: 0, cross: 0 }),
  dizzy: { eyeOpen: 0.9, pupil: 0.9, lookX: 0, lookY: 0, browY: 0.3, browTilt: 0.5, mouth: 'none', mouthOpen: 0, blink: 0, cross: 1 },
  bliss: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 1.0, browTilt: -0.4, mouth: 'none', mouthOpen: 0, blink: 1, cross: 0 },
  hope: { eyeOpen: 1.2, pupil: 0.75, lookX: 0, lookY: -0.6, browY: 1.3, browTilt: 0.9, mouth: 'o', mouthOpen: 0.3, blink: 0, cross: 0 },
  flat: { eyeOpen: 0.85, pupil: 1, lookX: 0, lookY: 0, browY: 0, browTilt: -0.1, mouth: 'flat', mouthOpen: 0.05, blink: 0.25, cross: 0 },
};

// ---------------------------------------------------------------- arms (rig-local; s = the raised arm's side)
const EL_A_HOOK = 0.50;                        // the raised elbow's angle on its circle in the hook: out at his eye level
const EL_F_HOOK = -1.15;                       // its forearm folded back over his head (the cone above his hair)
const elUpAt = (s, a, f = -0.12, R = EL_LU) => { const e = elOnCircle(s, a, R); return { e, w: elFore(s, e, f) }; };
const elHang = (q) => ({ e: [q * 100, -236], w: [q * 110, -146] });     // an arm hanging at his side (q = its side)

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
function sparkle(x, y, r, k, col = '#FFF6C8') {
  if (k <= 0.01) return;
  for (const [cc, rr, cl] of [[ctx, r, col], [gctx, r * 1.6, rgba(col, 0.6)]]) {
    cc.save(); cc.translate(x, y); cc.scale(k, k);
    cc.beginPath(); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, R = i % 2 ? rr * 0.28 : rr; cc.lineTo(Math.cos(a) * R, Math.sin(a) * R); } cc.closePath(); cc.fillStyle = cl; cc.fill();
    cc.restore();
  }
}
// a gap marker between two screen points (the tongue tip and the drip)
function gapMark(a, b, k) {
  if (k <= 0.01) return;
  screenSpace();
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
  if (L < 10) return;
  const ux = dx / L, uy = dy / L, nx = -uy * 14, ny = ux * 14;
  ctx.save(); ctx.globalAlpha = clamp(k);
  for (const [w, col] of [[9, '#0B0B1A'], [4, '#FFD447']]) {
    line(ctx, a[0], a[1], b[0], b[1], w, col);
    line(ctx, a[0] - nx, a[1] - ny, a[0] + nx, a[1] + ny, w, col); line(ctx, b[0] - nx, b[1] - ny, b[0] + nx, b[1] + ny, w, col);
  }
  ctx.restore();
  softDot(gctx, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 40, '#FFD447', 0.3 * k);
}
// a tape measure from screen point a toward b (k 0..1 how far it has run), ticks every 18 px, the case at a
function elTape(a, b, k, col = '#FFD447') {
  if (k <= 0.01) return;
  screenSpace();
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) * k, ux = dx / Math.hypot(dx, dy), uy = dy / Math.hypot(dx, dy);
  const nx = -uy, ny = ux, e = [a[0] + ux * L, a[1] + uy * L];
  ctx.save();
  line(ctx, a[0], a[1], e[0], e[1], 30, '#0B0B1A'); line(ctx, a[0], a[1], e[0], e[1], 24, col);
  for (let d = 10; d < L - 4; d += 18) { const big = Math.round(d / 18) % 5 === 0; line(ctx, a[0] + ux * d + nx * 12, a[1] + uy * d + ny * 12, a[0] + ux * d + nx * (big ? 0 : 5), a[1] + uy * d + ny * (big ? 0 : 5), 2.4, '#3A2A00'); }
  line(ctx, e[0] - nx * 15, e[1] - ny * 15, e[0] + nx * 15, e[1] + ny * 15, 6, '#B8860B');   // the hook at its end
  // the case
  ctx.translate(a[0], a[1]); ctx.rotate(Math.atan2(uy, ux));
  rrect(ctx, -44, -36, 70, 72, 18); ctx.fillStyle = '#0B0B1A'; ctx.fill();
  rrect(ctx, -40, -32, 62, 64, 15); ctx.fillStyle = '#E8463C'; ctx.fill();
  circle(ctx, -9, 0, 15, '#FFD447'); circle(ctx, -9, 0, 6, '#B8860B');
  ctx.restore();
}

// ================================================================ the hook: frame 1 and round it
// tt = seconds since frame 1 (negative = the last frames of the Short, on their way here). s = +1: the right arm (screen right)
function hookA(tt, s = 1) {
  const c = cu();
  const go = ramp(tt, c.go - 0.1, c.on_end, E.inOutSine), gen = ramp(tt, c.gently - 0.1, c.gently_end, E.inOutSine);
  const push = Math.max(go * 0.7, gen);
  const shk = (0.55 + 0.45 * push) * (0.6 * Math.sin(tt * 31) + 0.4 * Math.sin(tt * 47 + 1));
  const up = elUpAt(s, EL_A_HOOK - 0.05 * push + 0.008 * shk, EL_F_HOOK - 0.04 * push);
  const face = lerpFace(EF.strain(s), EF.push(s), push);
  face.blink = Math.max(face.blink, pulseOf(tt, [c.elbow1_end + 0.05], 0.12));
  // the tongue: out and curling up toward the drip, a little longer with every push
  const len = 70 + 7 * go + 8 * gen + 1.5 * Math.sin(tt * 5.3);
  const headRot = s * (0.08 + 0.06 * push), headDX = s * (3 + 6 * push), headDY = -2 * push;
  // aim it at the drop under the elbow (head units: the head's middle is at rig-local (0, -470), the corner at (s*10, 45))
  const drop = [up.e[0] + s * 2, up.e[1] + 6], hv = [drop[0] - headDX - s * 10, drop[1] + 470 - headDY - 45];
  const ang = Math.atan2(hv[1], hv[0]) - headRot;
  const A = {
    side: s, up, low: elHang(-s), face, headRot, headDX, headDY, bob: 0.6 * Math.sin(tt * 3.1),
    tongue: { k: 1, len, ang: ang + 0.1 * s, bend: 0.32, quiver: 0.35 + 0.5 * push }, cone: 'up', coneRot: 0.06 * shk, melt: 0.7,
    drip: 1, dripLow: 1, sweat: 0.35 + 0.65 * push,
  };
  return { A, push };
}
function hookCam(tt, s = 1) {
  const c = cu(), k = ramp(tt, 0, c.gently_end, E.inOutSine);
  return { x: 540 + s * (62 + 6 * k), y: 968 - 4 * k, zoom: 2.78 + 0.12 * k, rot: 0 };
}
function elDraw(t, o) {
  elBack(o.cam, t);
  if (o.under) { applyCam(o.cam); o.under(); }
  const Hh = elHero(o.cam, t, o.A);
  applyCam(o.cam);
  if (o.after) o.after(Hh);
  return Hh;
}
// the drip's drop under the raised elbow, in world coords (where the tongue is trying to get)
function elDropAt(Hh, s) {
  const el = Hh.el, wr = Hh.wr, fx = el[0] - wr[0], fy = el[1] - wr[1], fl = Math.hypot(fx, fy) || 1;
  return [el[0] + (-fy / fl * s) * 8, el[1] + 20];
}
SC.hook = (lt, t, shot) => {
  const c = cu(), S = hookA(t, 1), cam = hookCam(t, 1);
  const Hh = elDraw(t, { cam, A: S.A });
  // the gap: a yellow measure from the tongue's tip to the drip, on "gently."
  if (Hh.tip) gapMark(toScreen(cam, ...Hh.tip), toScreen(cam, ...elDropAt(Hh, 1)), popK(t, c.gently - 0.05, c.cant - 0.02, 0.12, 0.06));
  return { glow: 0.85 };
};

// ================================================================ the answer: Can't? Your tongue's fine... your ARM's too long.
SC.answer = (lt, t, shot) => {
  const c = cu(), s = -1;
  const gasp = ramp(t, c.cant - 0.02, c.cant + 0.12) * (1 - ramp(t, c.tongue - 0.12, c.tongue + 0.05));
  const show = ramp(t, c.tongue - 0.1, c.tongue + 0.18, E.outBack);
  const tape = snapRamp(t, c.arms - 0.08, c.long + 0.05, { ant: 0.05, over: 1.3 });     // snap: a wind-up, then it zips past and settles
  // the left elbow now (he switched), straining like the hook for a beat, then the gasp
  const S0 = hookA(c.gently_end - 0.2, s);
  const strain = 1 - ramp(t, c.cant - 0.04, c.cant + 0.1);
  const look = ramp(t, c.your_a - 0.1, c.arms + 0.1, E.inOutSine);
  let face = lerpFace(S0.A.face, EF.gasp, gasp);
  if (show > 0.01) face = lerpFace(face, EF.show, show);
  if (look > 0.01) face = lerpFace(face, EF.look(s), look);
  const tongue = strain > 0.01 ? { ...S0.A.tongue, k: strain } : (show > 0.01 && look < 0.6 ? { k: show * (1 - look), len: 34, ang: Math.PI / 2 - 0.25, bend: 0, quiver: 0, w: 1.1 } : null);
  const A = { ...S0.A, face, tongue, headRot: s * 0.1 * (1 - gasp) * (1 - show), headDX: s * 6 * strain, headDY: -6 * gasp, sweat: 0.8 * strain + 0.4 * (1 - strain),
    bob: 0.6 * Math.sin(t * 3.1) - 3 * gasp };
  const cam = camKeys(t - c.cant + 0.07, [[0, 540 - 58, 930, 3.45], [c.tongue - c.cant, 540 - 40, 975, 2.95], [c.your_a - c.cant, 540 - 44, 985, 2.7], [c.long - c.cant, 540 - 72, 985, 2.4], [D_(shot) + 1, 540 - 76, 985, 2.36]], E.inOutCubic);
  EL_BGDY = -lerp(60, 300, ramp(t, c.tongue - 0.2, c.long, E.inOutSine));       // the camera sinks: a low angle on "too long"
  const Hh = elDraw(t, { cam, A });
  EL_BGDY = 0;
  // the tick on the tongue
  if (Hh.tip && show > 0.01) { const P = toScreen(cam, ...Hh.tip); okTick(P[0] + 90, P[1] - 60, 30, popK(t, c.tongue + 0.05, c.your_a - 0.05)); tagPill('TONGUE', P[0] + 90, P[1] - 140, '#4DFFB4', popK(t, c.tongue + 0.1, c.your_a - 0.05), 30); }
  // the tape: from the shoulder along the upper arm, out past the elbow
  if (tape > 0.01) {
    const a = toScreen(cam, ...Hh.sh), b0 = toScreen(cam, ...Hh.el), b = [a[0] + (b0[0] - a[0]) * 1.12, a[1] + (b0[1] - a[1]) * 1.12];
    elTape(a, b, tape);
    screenSpace(); if (t > c.long - 0.05) stamp('TOO LONG', 540, 520, ramp(t, c.long - 0.05, c.long + 0.15), '#FF4D5E', -0.12, 104);
  }
  return { glow: 0.85, push: { k: 1 + 0.05 * bumpAt(t, c.long, 7), cx: 540, cy: 700 } };
};
function D_(shot) { return shot.end - shot.start; }

// ================================================================ feel your upper arm: one stiff bone, pinned at your shoulder
// the left arm straight out to the side, its forearm up with the cone; the right hand comes across and squeezes it
function feelA(t) {
  const c = cu(), s = -1;
  const out = snapRamp(t, c.feel - 0.3, c.feel + 0.25);
  const grab = snapRamp(t, c.upper - 0.15, c.arm_f + 0.05, { ant: 0.05 });
  const sq = grab * (0.6 + 0.4 * pulseOf(t, [c.arm_f, c.arm_f + 0.3], 0.18));
  const S0 = hookA(c.gently_end - 0.2, s);
  const upH = elUpAt(s, Math.PI / 2 - 0.12, -0.05);
  const up = armMix(S0.A.up, upH, out);
  // the right hand on the middle of the left upper arm (rig-local), its elbow down by his chest
  const mid = elL2(EL_SH(s), up.e, 0.55);
  const low = armMix(elHang(1), { e: [52, -262], w: [mid[0] + 20, mid[1] + 10] }, grab);
  const face = lerpFace(EF.look(s), EF.wow(s), ramp(t, c.bone - 0.05, c.bone + 0.15));
  return { side: s, up, low, face, headRot: s * 0.04, headDX: s * 2, bob: 0.5 * Math.sin(t * 3.1), tongue: null, cone: 'up', coneRot: 0, melt: 0.7, drip: 1, sweat: 0.4,
    lowOnTop: true, squash: sq };
}
SC.feel = (lt, t, shot) => {
  const c = cu(), A = feelA(t);
  A.xray = ramp(t, c.one - 0.1, c.stiff + 0.1, E.inOutSine);
  const pin = snapRamp(t, c.pinned - 0.06, c.pinned + 0.16, { pre: 0.1, ant: 0.1, over: 2.0 });   // the pin winds up, THUNKs a hair too deep, settles
  const cam = camKeys(lt, [[0, 432, 1010, 2.12], [c.one - shot.start, 440, 1020, 2.02], [D_(shot), 442, 1022, 1.98]], E.inOutCubic);
  EL_BGDY = 240;                                                                   // a high angle: more of the pass behind him
  const Hh = elDraw(t, { cam, A, after: (H) => {
    if (pin > 0.01) actor(() => elPin(ctx, H.sh[0], H.sh[1] - 4, 1.1, pin, -1));
  } });
  EL_BGDY = 0;
  // tok tok on the bone: two little stars where the knuckles land
  const P = toScreen(cam, ...elL2(Hh.sh, Hh.el, 0.5));
  for (const [f, i] of [[c.stiff, 0], [c.bone, 1]]) sparkle(P[0] + (i ? 30 : -30), P[1] - 46, 22, popK(t, f - 0.02, f + 0.22, 0.05, 0.1));
  if (pin > 0.01) { const Q = toScreen(cam, ...Hh.sh); screenSpace(); shockLines(Q[0], Q[1], 80 * cam.zoom / 2, inv(c.pinned + 0.1, c.pinned + 0.5, t), 10, '#FFFFFF', 3); tagPill('PINNED', Q[0], Q[1] + 120, '#FFD447', popK(t, c.shoulder - 0.05, D_(shot) + shot.start), 30); }
  if (A.xray > 0.3) tagPill('ONE BONE', P[0], P[1] + 92, '#7FE9FF', popK(t, c.bone - 0.05, c.pinned - 0.1), 30);
  return { glow: 0.85, push: { k: 1 + 0.04 * bumpAt(t, c.pinned + 0.1, 8), cx: 540, cy: 900 }, capY: 1500 };
};

// ================================================================ the swing: the arm goes round the pin like a compass
// the elbow's angle on its circle (from straight up; + = out to his side, - = across his face), over the swing shot
function swingAng(t) {
  const c = cu();
  const a0 = Math.PI / 2 - 0.12;                                                 // out to the side (the feel pose)
  const aT = 0.04;                                                               // hovering by his temple: so close
  const a1 = ramp(t, c.swing - 0.1, c.mouth1_end, E.inOutSine);                  // up toward his mouth
  const a2 = snapRamp(t, c.right - 0.12, c.past + 0.1, { ant: 0.06, over: 1.6 });  // and PAST it, quick, across his face (a wind-up, an overshoot)
  return a0 - (a0 - aT) * a1 - (aT + 1.55) * a2;    // ends level across his chest (-1.55): his face clear again
}
function swingA(t, ang) {
  const c = cu(), s = -1;
  const e = elOnCircle(s, ang);
  // the forearm points away from his head and up, so the cone never covers his face
  const hx = e[0] - 0, hy = e[1] + 470, hl = Math.hypot(hx, hy) || 1;
  const fdx = hx / hl + 0.15, fdy = hy / hl - 1.1, f = Math.atan2(s * fdx, -fdy);
  const up = { e, w: elFore(s, e, f) };
  // he chases it with his eyes, and on "PAST" snaps at it with the tongue
  const hd = headLocal0(), dx = e[0] - hd[0], dy = e[1] - hd[1], L = Math.hypot(dx, dy) || 1;
  const snap = ramp(t, c.past - 0.25, c.past - 0.05, E.outBack) * (1 - ramp(t, c.past + 0.15, c.past_end + 0.1));
  const tongue = { k: Math.max(ramp(t, c.mouth1 - 0.1, c.mouth1 + 0.15) * (1 - ramp(t, c.past + 0.3, c.past_end)), snap), len: 16 + 6 * snap, ang: Math.atan2(dy, dx) * 0.6 - Math.PI / 2 * 0.4, bend: 0, quiver: 0.4, side: dx > 0 ? 1 : -1 };
  return { side: s, up, low: elHang(1), face: EF.chase(clamp(dx / L * 1.3, -1, 1), clamp(dy / L * 1.3, -1, 1)), headRot: clamp(dx / 400, -0.12, 0.12), bob: 0.5 * Math.sin(t * 3.1),
    tongue, cone: 'up', coneRot: 0, melt: 0.8, drip: 1, sweat: 0.4, xray: 0 };
}
function headLocal0() { return [0, -470]; }
const EL_PIN_K = 1;
SC.swing = (lt, t, shot) => {
  const c = cu(), ang = swingAng(t), A = swingA(t, ang);
  const cam = camKeys(lt, [[0, 486, 1000, 2.42], [c.to_m - shot.start, 490, 990, 2.38], [D_(shot), 484, 992, 2.28]], E.inOutCubic);
  EL_BGDY = -150;
  const Hh = elDraw(t, { cam, A, under: () => {}, after: (H) => {
    // the compass: the dashed gold trail the elbow has drawn so far (screen angles: 0 = right, clockwise +)
    const C = H.sh, R = EL_LU, toScr = (a) => -Math.PI / 2 - a;          // left arm: + = out (to the screen's left)
    elArc(C, R, toScr(Math.PI / 2 - 0.12), toScr(ang), 7, 1);
    actor(() => elPin(ctx, C[0], C[1] - 4, 1.1, EL_PIN_K, -1));
  } });
  EL_BGDY = 0;
  // CHOMP on "PAST"
  const cp = popK(t, c.past + 0.02, c.past + 0.42, 0.05, 0.12);
  if (cp > 0.01) { const M = toScreen(cam, ...Hh.mouth); screenSpace(); bigWord('CHOMP!', M[0] + 150, M[1] - 210, 84, '#FFFFFF', cp, 0.12); shockLines(M[0], M[1] - 30, 120, inv(c.past + 0.02, c.past + 0.35, t), 9, '#FFFFFF', 7); }
  return { glow: 0.85, blur: [-8 * ramp(t, c.past - 0.15, c.past) * (1 - ramp(t, c.past + 0.05, c.past + 0.25)), 0], capY: 1500 };
};

// ================================================================ the payoff: your mouth sits INSIDE its circle
SC.payoff = (lt, t, shot) => {
  const c = cu(), s = -1;
  // the elbow rests across his face (where the swing left it), then windmills round from "only"
  const a2 = swingAng(c.past_end + 0.5);
  const back = ramp(t, c.your_m - 0.1, c.mouth2 + 0.3, E.inOutCubic);
  const aRest = lerp(a2, Math.PI / 2 - 0.12, back);
  const orb = ramp(t, c.orbit_0, c.orbit_1, E.inOutSine);
  const ang = aRest - orb * Math.PI * 3;
  const A = swingA(t, ang);
  A.tongue = orb > 0.02 ? { k: 1, len: 26, ang: -Math.PI / 2 + 0.6 * Math.sin(-ang), bend: 0, quiver: 0.3, side: Math.sin(-ang) > 0 ? 1 : -1 } : null;
  A.face = orb > 0.02 ? lerpFace(A.face, EF.dizzy, ramp(t, c.round, c.round_end)) : lerpFace(EF.look(1), EF.wow(1), ramp(t, c.inside - 0.1, c.inside + 0.2));
  A.headRot = orb > 0.02 ? 0.1 * Math.sin(-ang) : 0;
  const cam = camKeys(lt, [[0, 484, 992, 2.26], [c.mouth2 - shot.start, 482, 1040, 2.06], [D_(shot), 482, 1044, 2.0]], E.inOutCubic);
  const full = ramp(t, c.your_m - 0.05, c.inside + 0.1, E.inOutCubic);
  const Hh = elDraw(t, { cam, A, after: (H) => {
    const C = H.sh, R = EL_LU, toScr = (a) => -Math.PI / 2 - a;
    // the whole circle, drawn on from where the trail ended
    elArc(C, R, toScr(Math.PI / 2 - 0.12), toScr(Math.PI / 2 - 0.12) + Math.PI * 2 * Math.max(0.42, full), 7, 1);
    actor(() => elPin(ctx, C[0], C[1] - 4, 1.1, 1, -1));
    elTarget(H.mouth, 26, ramp(t, c.mouth2 - 0.05, c.mouth2 + 0.2), null, t);
  } });
  const M = toScreen(cam, ...Hh.mouth);
  tagPill('MOUTH', M[0] + 6, M[1] + 92, '#FF4D5E', popK(t, c.mouth2, c.orbit_0 + 0.3), 30, '#FFFFFF');
  tagPill('INSIDE', M[0], M[1] - 380, '#4DFFB4', popK(t, c.inside - 0.03, c.orbit_0 + 0.1), 46);
  return { glow: 0.85 };
};

// ================================================================ the rare few: long tongues... short arms.
SC.weird = (lt, t, shot) => {
  const c = cu(), s = -1;
  const hope = ramp(t, c.rare_the - 0.1, c.rare + 0.2);
  const poof = popK(t, c.can2_end - 0.05, c.can2_end + 0.35, 0.06, 0.25);
  const longT = ramp(t, c.long_t - 0.05, c.tongues_end - 0.2, E.outElastic || E.outBack);
  const shortA = ramp(t, c.short - 0.05, c.arms2_end - 0.02, E.outBack);
  const slurp = ramp(t, c.arms2_end - 0.02, c.arms2_end + 0.18);
  // the arm, out to his side, shrinks: the elbow comes in on a smaller circle and lands at his tongue's tip
  const R = lerp(EL_LU, 102, shortA);
  const aOut = Math.PI / 2 - 0.12, aLick = 0.42;
  const ang = lerp(aOut, aLick, shortA);
  const e = elOnCircle(s, ang, R), up = { e, w: elFore(s, e, lerp(-0.05, -0.35, shortA)) };
  const tl = lerp(22, 74, longT);
  const face = slurp > 0.02 ? lerpFace(EF.chase(-0.9, -0.5), EF.bliss, slurp) : lerpFace(EF.hope, EF.chase(-0.9, -0.5), longT);
  const A = { side: s, up, low: elHang(1), face, headRot: -0.05 * shortA, bob: 0.5 * Math.sin(t * 3.1) - 4 * hope * (1 - longT),
    tongue: longT > 0.01 ? { k: 1, len: tl, ang: Math.PI + 0.62, bend: 0.3, quiver: 0.25 * (1 - slurp), side: -1 } : null,
    cone: 'up', coneRot: 0, melt: 0.8, drip: 1 - 0.9 * slurp, sweat: 0 };
  const cam = camKeys(lt, [[0, 482, 1044, 2.0], [c.long_t - shot.start, 476, 990, 2.4], [D_(shot), 478, 984, 2.5]], E.inOutCubic);
  const Hh = elDraw(t, { cam, A, after: (H) => {
    // the smaller circle, and the old one fading as a ghost
    const toScr = (a) => -Math.PI / 2 - a;
    if (shortA > 0.01) { elArc(H.sh, EL_LU, 0, Math.PI * 2, 4, 0.35 * (1 - shortA)); elArc(H.sh, R, 0, Math.PI * 2, 6, shortA, '#4DFFB4'); }
  } });
  if (poof > 0.01) { const P = toScreen(cam, ...Hh.head); screenSpace(); for (let i = 0; i < 9; i++) { const a = i * 0.7, d = 150 + 80 * poof; softDot(ctx, P[0] + Math.cos(a) * d, P[1] + Math.sin(a) * d, 50 * poof, '#FFFFFF', 0.8 * poof); } }
  const T = Hh.tip ? toScreen(cam, ...Hh.tip) : [540, 800];
  tagPill('LONG TONGUE', 540, 470, '#FF7FB0', popK(t, c.tongues - 0.05, D_(shot) + shot.start), 52);
  tagPill('SHORT ARMS', 540, 600, '#4DFFB4', popK(t, c.short - 0.03, D_(shot) + shot.start), 52);
  for (let i = 0; i < 4; i++) sparkle(T[0] + 60 * Math.cos(i * 1.6 + t), T[1] - 40 + 50 * Math.sin(i * 1.6 + t), 20, slurp * (0.6 + 0.4 * Math.sin(t * 12 + i)));
  if (slurp > 0.01) { screenSpace(); bigWord('SLURP!', T[0] - 40, T[1] - 170, 80, '#FFFFFF', popK(t, c.arms2_end, c.now_b - 0.02, 0.05, 0.08), -0.1); }
  return { glow: 0.85 };
};

// ================================================================ the button: now try the OTHER elbow (and the loop)
SC.button = (lt, t, shot) => {
  const c = cu();
  // POOF back to normal (the weird pose), then he tosses the cone over his head to the right fist; the left arm drops,
  // the right arm comes up: the picture of frame 1 (hookA at -0.4)
  const S1 = hookA(-0.4, 1);
  const wk = ramp(t, c.now_b - 0.05, c.now_b + 0.2, E.outBack);
  const swap = ramp(t, c.toss_0, c.toss_1, E.inOutCubic);
  const tossK = ramp(t, c.toss_0, c.toss_1);
  const eL = elOnCircle(-1, Math.PI / 2 - 0.12), upL = { e: eL, w: elFore(-1, eL, -0.05) };
  // the left arm: from out-to-the-side down to hanging; the right arm: from hanging up to the hook pose
  const armLeft = armMix(upL, elHang(-1), swap), armRight = armMix(elHang(1), S1.A.up, swap);
  const face = lerpFace(EF.look(-1), S1.A.face, ramp(t, c.other, c.toss_1, E.inOutSine));
  const tongueK = ramp(t, c.toss_1 - 0.3, c.loop_in - 0.05);
  const A = { ...S1.A, side: 1, up: armRight, low: armLeft, face, cone: tossK <= 0 ? 'low' : tossK >= 1 ? 'up' : null,
    toss: { k: tossK, from: [-210, -560], to: [S1.A.up.w[0], S1.A.up.w[1] - 30], h: 260 }, drip: 1, dripLow: 1,
    tongue: tongueK > 0.01 ? { ...S1.A.tongue, k: tongueK } : null, headRot: S1.A.headRot * swap, headDX: S1.A.headDX * swap, headDY: 0, sweat: S1.A.sweat * swap };
  const k0 = hookCam(-0.4, 1), cam = camKeys(lt, [[0, 478, 984, 2.5], [c.other - shot.start, 530, 976, 2.6], [D_(shot), k0.x, k0.y, k0.zoom]], E.inOutCubic);
  elDraw(t, { cam, A });
  tagPill('OTHER ONE!', 540, 470, '#7FE9FF', popK(t, c.other - 0.05, c.loop_in - 0.2, 0.1, 0.1), 38);
  return { glow: 0.85 };
};
SC.loop = (lt, t, shot) => {
  const tt = t - TLd.duration;
  const S = hookA(tt, 1);
  elDraw(t, { cam: hookCam(tt, 1), A: S.A });
  return { glow: 0.85 };
};

// ================================================================ the cover (cover.sh renders it into cover.jpg)
SC.cover = (lt, t, shot) => {
  const S = hookA(cu().gently, 1);
  const cam = { x: 600, y: 1000, zoom: 2.5, rot: 0 };
  const Hh = elDraw(t, { cam, A: { ...S.A, bob: 0 } });
  if (Hh.tip) gapMark(toScreen(cam, ...Hh.tip), toScreen(cam, ...elDropAt(Hh, 1)), 1);
  screenSpace();
  bigWord('CAN YOU?', 540, 470, 150, '#FFD447', 1, -0.04);
  return { glow: 0.85, noCaptions: true };
};

function initScenes2() {
  initTrail();
}
