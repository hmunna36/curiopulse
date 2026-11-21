// Why Does the WRONG Finger Move? — the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash, flashTop, grain: 0,
//    overlay: fn, noCaptions, capY, focus}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
// Worlds: camp.js (mosquito-bites' night campsite), wf_world.js (the picnic table, the raccoon, his twisted hands).
// Two pictures of ONE state over time (`wfS(tt)`, valid at negative time for the loop):
//   the POV (`wfPovFrame`): his own view down at his hands across the table, the raccoon pointing (the viewer copies him);
//   the FRONT (`wfFrontFrame`): him seen from the front with the knot under his chin, the raccoon on the table.
'use strict';

const cu = () => TLd.cues;

// ---------------------------------------------------------------- the light: a night campsite under a lantern (on the right)
const WF_LIGHT = { ...LIGHTS.lanterns, keyFrom: [0.55, -0.83], rim: [1.0, 0.7, 0.4], rimFrom: [0.8, -0.4], rimAmt: 1.1 };
const WF_FRONT_LIGHT = { ...LIGHTS.lanterns, keyFrom: [-0.5, -0.86], rim: [1.0, 0.66, 0.36], rimFrom: [0.85, -0.3], rimAmt: 1.2 };
setLights({ hook: WF_LIGHT, dare: WF_LIGHT, answer: WF_FRONT_LIGHT, other: WF_LIGHT, again: WF_LIGHT, mech: WF_LIGHT,
  crossed: WF_LIGHT, touch: WF_LIGHT, miss: WF_LIGHT, sting: WF_LIGHT, button: WF_FRONT_LIGHT, cover: WF_LIGHT });

const KC = [540, 1290], KS = 3.2;          // the knot's centre and scale in the POV (px per knot unit)
const RACP = [540, 1072], RACS = 1.45;     // the raccoon's seat and scale in the POV
const FR = { hx: 620, hy: 1300, hs: 1.0, table: 1108, rx: 372, ry: 1112, rs: 0.8 };   // the front view

// ---------------------------------------------------------------- the state of everything at time tt
function wfS(tt) {
  const c = cu(), S = {};
  const neg = tt < 0;
  const r = (a, b, e = E.inOutCubic) => (neg ? 0 : ramp(tt, a, b, e));
  const pk = (a, b, i = 0.1, o = 0.12) => (neg ? 0 : popK(tt, a, b, i, o));
  // the hands: open and crossed at the wrists -> clasped -> rolled in
  S.clasp = neg ? 0 : r(c.clasp - 0.05, c.clack + 0.08, E.inOutCubic);
  const ru = neg ? 0 : ramp(tt, c.roll - 0.02, c.rolled, E.inOutSine);
  S.roll = ru;
  S.up = neg ? 0 : (ru >= 0.5 ? 1 : 0);
  // which finger is pointed at, and which one moves
  S.lift = {}; S.wig = {}; S.faces = {}; S.faceK = {}; S.look = {};
  const up = (id, a, b, i = 0.08, o = 0.14) => { const k = pk(a, b, i, o); S.lift[id] = Math.max(S.lift[id] || 0, k); S.wig[id] = Math.max(S.wig[id] || 0, k); return k; };
  // the dare: A1 is pointed at, its twin B1 pops (and stays up through the answer)
  const kB1 = up('B1', c.pop1, c.try3 - 0.1, 0.07, 0.15);
  // again: A2 -> twin B2, then A0 -> twin B0
  up('B2', c.pop3, c.and3 + 0.25, 0.07, 0.12);
  up('B0', c.pop3b, c.its - 0.05, 0.07, 0.15);
  // the mechanism: the call reaches the blue hand -> B1 again
  up('B1', c.pop6, c.shot_touch - 0.02, 0.07, 0.12);
  // the payoff: the RIGHT one, A1, pops under the touch and stays up (proud)
  const kA1 = neg ? 0 : r(c.popright - 0.03, c.popright + 0.12, E.outBack);
  if (!neg && tt >= c.popright - 0.03 && tt < c.now9) { S.lift.A1 = kA1; S.wig.A1 = 0.6 * (1 - ramp(tt, c.popright + 0.8, c.popright + 1.4)); }
  // the button: back to rest
  // faces: the twin says "me?", the pointed one is miffed; A1 is proud after the touch
  if (!neg && tt >= c.pop1 && tt < c.try3) { S.faces.B1 = 'me'; S.faceK.B1 = pk(c.pop1, c.try3, 0.12, 0.1); S.faces.A1 = 'shock'; S.faceK.A1 = pk(c.pop1 + 0.15, c.try3, 0.12, 0.1); S.look.A1 = [0.8, -0.6]; S.look.B1 = [-0.6, -0.8]; }
  if (!neg && tt >= c.pop3 && tt < c.its) { S.faces.B2 = 'happy'; S.faceK.B2 = pk(c.pop3, c.and3 + 0.3, 0.08, 0.1); S.faces.B0 = 'me'; S.faceK.B0 = pk(c.pop3b, c.its, 0.08, 0.1); }
  if (!neg && tt >= c.pop6 && tt < c.shot_touch) { S.faces.B1 = 'me'; S.faceK.B1 = pk(c.pop6, c.shot_touch, 0.08, 0.08); }
  if (!neg && tt >= c.creep && tt < c.now9) {
    S.faces.A1 = tt < c.popright ? 'focus' : 'proud'; S.faceK.A1 = pk(c.creep + 0.4, c.now9, 0.15, 0.1); S.look.A1 = [0, -1];
  }
  // the target ring
  S.ring = null;
  const ringOn = (id, a, b, wrongAt) => {
    if (neg || tt < a || tt >= b) return;
    S.ring = { id, k: pk(a, b, 0.12, 0.1), col: wrongAt !== undefined && tt >= wrongAt ? '#FF5A6E' : '#FFE14A' };
  };
  ringOn('A1', c.point1 - 0.05, c.shot_answer + 0.05, c.pop1);
  ringOn('A2', c.point3 - 0.05, c.and3 - 0.02, c.pop3);
  ringOn('A0', c.point3b - 0.05, c.laugh + 0.4, c.pop3b);
  ringOn('A1', c.glowA, c.pop6 + 0.5, c.pop6);
  ringOn('A1', c.creep + 0.2, c.popright + 0.6, undefined);
  if (S.ring && tt >= c.popright - 0.03 && tt < c.popright + 0.6) S.ring.col = '#4DFFB4';
  // the x-ray: his right hand (A) orange from "It's on your LEFT", both hands through the call and the cross
  S.xray = neg ? 0 : r(c.glowA - 0.05, c.glowA + 0.25) * (1 - r(c.shot_touch - 0.1, c.shot_touch + 0.05));
  S.xrayB = neg ? 0 : Math.max(r(c.glowB - 0.05, c.glowB + 0.18) * (1 - r(c.try3 - 0.2, c.try3)), S.xray);
  S.spark = neg ? 0 : (tt >= c.call && tt < c.pop6 + 0.2 ? clamp(inv(c.call, c.pop6, tt)) : 0);
  // the raccoon
  const R = { mood: 'curious', look: [0, 0.8], rock: 0, point: { k: 0 }, headRot: 0, blink: 0 };
  if (!neg) {
    if (tt < c.now1 - 0.2) R.look = [0.1 * Math.sin(tt * 3), 0.9];
    if (tt >= c.now1 - 0.25 && tt < c.try3 - 0.3) {
      R.mood = 'focus'; R.look = [0, 1];
      R.point = { k: snapRamp(tt, c.now1 - 0.25, c.point1, { pre: 0.12, ant: 0.06, over: 1.4 }) * (1 - r(c.pop1 + 0.3, c.pop1 + 0.7)), id: 'A1' };
    }
    if (tt >= c.pop1 && tt < c.try3 - 0.3) { R.mood = 'smirk'; R.look = [0.6, 0.4]; R.rock = 0.15 * popK(tt, c.pop1 + 0.1, c.try3, 0.1, 0.2) * (0.5 + 0.5 * Math.sin(tt * 30)); }
    if (tt >= c.try3 - 0.3 && tt < c.and3 - 0.05) { R.mood = 'focus'; R.look = [0, 1]; R.point = { k: snapRamp(tt, c.try3 - 0.3, c.point3, { pre: 0.08, ant: 0.05, over: 1.4 }), id: 'A2' }; }
    if (tt >= c.and3 - 0.05 && tt < c.laugh) { R.mood = 'smirk'; R.look = [0, 1]; R.point = { k: 1, id: tt < c.point3b ? 'A2' : 'A0', blend: r(c.and3 - 0.05, c.point3b) }; }
    if (tt >= c.laugh && tt < c.its) { R.mood = 'laugh'; R.rock = r(c.laugh, c.laugh + 0.3, E.outBack) * (0.85 + 0.15 * Math.sin(tt * 26)); R.point = { k: 1 - r(c.laugh, c.laugh + 0.25), id: 'A0' }; }
    if (tt >= c.its && tt < c.shot_touch) {
      // it points at A1 again while the call goes round ("It's on your LEFT"), then pulls back to watch
      R.mood = 'curious'; R.look = [0.3 * Math.sin(tt * 2), 1]; R.rock = 0.4 * (1 - r(c.its, c.its + 0.5));
      R.point = { k: r(c.its + 0.1, c.glowA + 0.45, E.outCubic) * (1 - r(c.pop6 + 0.2, c.pop6 + 0.55)), id: 'A1' };
    }
    if (tt >= c.shot_touch && tt < c.popright) { R.mood = 'focus'; R.look = [0, 1]; R.point = { k: r(c.creep, c.contact, E.inOutSine), id: 'A1', touch: true }; }
    if (tt >= c.popright && tt < c.skin) {
      R.mood = tt < c.jaw ? 'curious' : 'shock'; R.look = [0, tt < c.jaw ? 1 : 0]; R.point = { k: 1 - r(c.popright + 0.1, c.popright + 0.5), id: 'A1', touch: true };
    }
    if (tt >= c.skin && tt < c.now9) { R.mood = 'deadpan'; R.look = [0.7, 0.2]; }
    if (tt >= c.now9) { R.mood = tt < c.pop9 ? 'focus' : 'deadpan'; R.look = tt < c.pop9 ? [0, 1] : [0, 0]; R.knot = true; }
  }
  S.R = R;
  // his face (the front view)
  const down = { lookX: 0, lookY: 1 };
  let f = { ...FACES.calm, ...down, mouth: 'flat', mouthOpen: 0.25, browY: 0.3 };
  if (!neg) {
    f = lerpFace(f, { ...FACES.startled, lookX: -0.3, lookY: 1, mouthOpen: 0.6 }, r(c.wrong - 0.1, c.wrong + 0.15));
    f = lerpFace(f, { ...FACES.confused, lookX: -0.4, lookY: 1 }, r(c.one1_end, c.one1_end + 0.25));
    f = lerpFace(f, { ...FACES.annoyed, lookX: -0.9, lookY: 0.2 }, r(c.other - 0.05, c.other + 0.2));
    f = lerpFace(f, { ...FACES.nervous, lookX: 0.4, lookY: 0.2 }, r(c.eyes - 0.1, c.eyes + 0.1));
    f = lerpFace(f, { ...FACES.grin, lookX: -0.9, lookY: 0.4 }, r(c.now9 - 0.1, c.try9));
    f = lerpFace(f, { ...FACES.grin, lookX: -0.2, lookY: 0.0, mouthOpen: 0.8 }, r(c.pop9 + 0.15, c.pop9 + 0.35));
  }
  S.face = f;
  S.point = neg ? 0 : r(c.now9 - 0.05, c.point9 + 0.1, E.outBack);
  // his eyes dart in the "eyes just guess" ECU
  S.dart = neg ? 0 : (tt >= c.eyes && tt < c.now9 ? Math.sign(Math.sin((tt - c.eyes) * 9)) : 0);
  return S;
}

// ---------------------------------------------------------------- the POV picture
// the knot's transform in the POV: the roll dips it toward his chest and turns it edge-on and back
function wfKnotXf(S) {
  const u = S.roll;
  const dip = Math.sin(Math.PI * u);
  return { x: KC[0], y: KC[1] + 90 * dip, s: KS * (1 + 0.1 * dip), sy: Math.max(0.06, Math.abs(Math.cos(Math.PI * u))) };
}
function wfKnotPt(X, p) { return [X.x + p[0] * X.s, X.y + p[1] * X.s * X.sy]; }

function wfPovFrame(tt, t, cam) {
  const S = wfS(tt), c = cu();
  wfPovBack(cam, t);
  applyCam(cam);
  // the raccoon behind the table (its body), then the table over its lower half
  const R = S.R;
  const racO = { t, mood: R.mood, look: R.look, rock: R.rock, headRot: R.headRot, part: 'body', blink: wfRacBlink(t) };
  wfRaccoonAt(RACP[0], RACP[1], RACS, racO);
  wfTable(t, { y0: 1062, lamp: [880, 1090] });
  wfLantern(880, 1086, 1.0, t);
  wfMarsh(205, 1098, 0.9, t);
  wfMug(985, 1175, 0.85, t);
  // his arms and hands
  const X = wfKnotXf(S);
  let kn, arms;
  ctx.save(); ctx.translate(X.x, X.y); ctx.scale(X.s, X.s * X.sy);
  arms = wfArmsPov(ctx, { clasp: S.clasp, xray: Math.max(S.xray, 0) });
  kn = wfKnot(ctx, { clasp: S.clasp, up: S.up, lift: S.lift, wig: S.wig, t, xray: 0, faces: S.faces, faceK: S.faceK, look: S.look, ring: S.ring });
  ctx.restore();
  // the x-ray tints, per hand, over the drawn hands (A from the mechanism; B for "OTHER hand" and the mechanism)
  if (S.xray > 0.01 || S.xrayB > 0.01) {
    ctx.save(); ctx.translate(X.x, X.y); ctx.scale(X.s, X.s * X.sy);
    wfHandTint(ctx, kn, 'A', S.xray); wfHandTint(ctx, kn, 'B', S.xrayB);
    ctx.restore();
  }
  // the raccoon's pointing (or touching) paw, over the table and the hands
  if (R.point && R.point.k > 0.01) {
    const aim = (id) => { const f = kn.fingers[id]; if (!f) return [0, 0]; const p = wfKnotPt(X, f.mid); return [p[0] + 6, p[1] - (R.point.touch ? 10 : 34)]; };
    let tw = aim(R.point.id);
    if (R.point.blend !== undefined) { const a0 = aim('A2'), a1 = aim('A0'); tw = [lerp(a0[0], a1[0], R.point.blend), lerp(a0[1], a1[1], R.point.blend)]; }
    const to = [(tw[0] - RACP[0]) / RACS, (tw[1] - RACP[1]) / RACS];
    wfRaccoonAt(RACP[0], RACP[1], RACS, Object.assign({}, racO, { part: 'arm', point: { k: R.point.k, to, touch: R.point.touch } }));
  }
  return { S, cam, X, kn, arms };
}
function wfRacBlink(t) { const c = cu(); if (t >= c.jaw - 0.3 && t < c.skin) return 0; const ph = (t % 3.1) / 3.1; return ph > 0.95 ? 1 : 0; }

// a hand's x-ray tint: its back and its four fingers, drawn again translucent in its colour (knot units)
function wfHandTint(c, kn, h, k) {
  if (k <= 0.01) return;
  const col = h === 'A' ? WF_A : WF_B, b = kn.back[h];
  paint(() => {
    c.save(); c.globalAlpha = 0.68 * k;
    rrect(c, b[0] - 32, b[1] - 41, 64, 83, 25); c.fillStyle = col; c.fill();
    for (const id of [h + '0', h + '1', h + '2', h + '3']) { const f = kn.fingers[id]; if (f) line(c, f.root[0], f.root[1], f.tip[0], f.tip[1], 10, col); }
    c.restore();
    c.save(); c.globalAlpha = k; c.strokeStyle = h === 'A' ? '#FFE2C8' : '#D6F2FF'; c.lineWidth = 1.6;
    rrect(c, b[0] - 32, b[1] - 41, 64, 83, 25); c.stroke(); c.restore();
  });
}

// ---------------------------------------------------------------- the FRONT picture
function wfFrontBack(cam, t) {
  campBack(cam, t, { soft: 0.85, fire: 1, lights: 1 });
  applyCam(cam);
  // the fire behind him, out of focus
  const fl = 0.86 + 0.1 * Math.sin(t * 11) + 0.06 * Math.sin(t * 23.7);
  softDot(ctx, CAMP.FX + 120, CAMP.GY - 30, 150, '#FF8A3C', 0.5 * fl);
  softDot(gctx, CAMP.FX + 120, CAMP.GY - 40, 200, '#FF7A2C', 0.45 * fl);
}
function wfFrontTable(t) {
  const c = ctx, y = FR.table;
  // the table top seen from the front, a little from above: its top face, its front edge, the shadow under it
  c.beginPath(); c.moveTo(-300, y - 40); c.lineTo(1400, y - 40); c.lineTo(1400, y + 8); c.lineTo(-300, y + 8); c.closePath(); c.fillStyle = '#A3632F'; c.fill();
  c.save(); c.clip(); c.globalAlpha = 0.5; for (let i = 0; i < 4; i++) c.drawImage(WF.plank, -300 + i * 600, y - 40, 600, 48); c.restore();
  c.fillStyle = '#6B3A1A'; c.fillRect(-300, y + 8, 1700, 44);
  c.fillStyle = '#B97A42'; c.fillRect(-300, y + 6, 1700, 6);
  c.fillStyle = '#2A160C'; c.fillRect(-300, y + 52, 1700, 600);
  for (const lx of [80, 1000]) { c.fillStyle = '#5A3016'; c.fillRect(lx, y + 52, 40, 400); }
}
function wfFrontFrame(tt, t, cam) {
  const S = wfS(tt), c = cu();
  wfFrontBack(cam, t);
  applyCam(cam);
  const knot = { lift: S.lift, wig: S.wig, faces: S.faces, faceK: S.faceK, look: S.look };
  const hero = wfHero(cam, t, [FR.hx, FR.hy], FR.hs, { face: S.face, knot, point: S.point, hdy: 2 * Math.sin(t * 1.7) });
  applyCam(cam);
  wfFrontTable(t);
  wfLantern(FR.hx + 330, FR.table - 30, 0.9, t);
  wfMug(FR.hx + 160, FR.table - 24, 0.7, t);
  // the raccoon on the table, turned to him
  const R = S.R;
  let rk = null;
  const kno = R.knot ? { simple: true, k: tt >= c.pop9 ? clamp(E.outBack(clamp((tt - c.pop9) / 0.12), 2.2)) : 0, ring: tt >= c.point9 ? 1 : 0 } : null;
  rk = wfRaccoonAt(FR.rx, FR.ry, FR.rs, { t, mood: R.mood === 'laugh' ? 'laugh' : R.mood, look: R.knot ? R.look : [0.9, -0.2], rock: R.rock * 0.6,
    headRot: R.knot ? 0 : 0.12, part: 'all', knot: kno, blink: wfRacBlink(t + 0.7), tailLeft: !!R.knot });
  return { S, cam, hero, rk };
}

// ---------------------------------------------------------------- overlays (screen space)
function wfTag(txt, x, y, k, col, size = 64, rot = -0.06) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.2);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.font = `400 ${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + size * 0.7, h = size * 1.25;
  rrect(ctx, -w / 2, -h / 2, w, h, h * 0.3); ctx.fillStyle = '#14112A'; ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = col; ctx.stroke();
  ctx.fillStyle = col; ctx.fillText(txt, 0, 3);
  ctx.restore();
}
function wfCheck(x, y, s, k, col = '#4DFFB4') {
  if (k <= 0.01) return;
  const q = E.outBack(clamp(k), 2.4);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.scale(s * q, s * q);
  circle(ctx, 0, 0, 46, '#14112A'); ctx.lineWidth = 6; ctx.strokeStyle = col; ctx.beginPath(); ctx.arc(0, 0, 46, 0, 7); ctx.stroke();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(-20, 2); ctx.lineTo(-5, 18); ctx.lineTo(22, -16); ctx.stroke();
  ctx.restore();
  softDot(gctx, x, y, 90 * s, col, 0.5 * clamp(k));
}
// the roll: a curved arrow round the knot
function wfRollArrow(cx, cy, r, k, t) {
  if (k <= 0.01) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = clamp(k);
  const a0 = -0.6 * Math.PI, a1 = a0 + 1.5 * Math.PI * clamp(k * 1.2);
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#14112A'; ctx.lineWidth = 22; ctx.beginPath(); ctx.ellipse(cx, cy, r, r * 0.55, 0, a0, a1); ctx.stroke();
  ctx.strokeStyle = '#FFD447'; ctx.lineWidth = 13; ctx.beginPath(); ctx.ellipse(cx, cy, r, r * 0.55, 0, a0, a1); ctx.stroke();
  const ex = cx + r * Math.cos(a1), ey = cy + r * 0.55 * Math.sin(a1), an = Math.atan2(r * 0.55 * Math.cos(a1), -r * Math.sin(a1));
  ctx.fillStyle = '#FFD447'; ctx.beginPath(); ctx.moveTo(ex + Math.cos(an) * 30, ey + Math.sin(an) * 30);
  ctx.lineTo(ex + Math.cos(an + 2.5) * 30, ey + Math.sin(an + 2.5) * 30); ctx.lineTo(ex + Math.cos(an - 2.5) * 30, ey + Math.sin(an - 2.5) * 30); ctx.closePath(); ctx.fill();
  ctx.restore();
}
// the call running up his left arm: a glowing dot with ring arcs and a trail, along a world path
function wfSpark(cam, P, k, t) {
  if (k <= 0.001 || k >= 0.999) return;
  const acc = polyLen(P), L = acc[acc.length - 1];
  screenSpace();
  for (let i = 10; i >= 0; i--) {
    const s = clamp(k - i * 0.022) * L, p = polyAt(P, acc, s), q = toScreen(cam, p[0], p[1]);
    circle(ctx, q[0], q[1], 16 - i * 1.1, rgba('#BFF0FF', 1 - i * 0.08));
    softDot(gctx, q[0], q[1], 40 - i * 2, '#3DB2FF', 0.8 - i * 0.06);
  }
  const p = polyAt(P, acc, k * L), q = toScreen(cam, p[0], p[1]);
  ctx.save(); ctx.lineWidth = 5; ctx.strokeStyle = '#FFFFFF'; ctx.lineCap = 'round';
  for (const rr of [34, 54]) { const ph = (t * 4 + rr / 40) % 1; ctx.globalAlpha = 1 - ph; ctx.beginPath(); ctx.arc(q[0], q[1], rr * (0.7 + 0.5 * ph), -0.9, 0.9); ctx.stroke(); ctx.beginPath(); ctx.arc(q[0], q[1], rr * (0.7 + 0.5 * ph), Math.PI - 0.9, Math.PI + 0.9); ctx.stroke(); }
  ctx.restore();
}

function wfPovOverlays(F, tt, t) {
  const S = F.S, cam = F.cam, X = F.X, kn = F.kn, c = cu();
  screenSpace();
  const sc = (p) => { const w = wfKnotPt(X, p); return toScreen(cam, w[0], w[1]); };
  // the roll arrow
  const ra = tt < 0 ? 0 : popK(tt, c.roll - 0.05, c.rolled + 0.15, 0.1, 0.12);
  if (ra > 0.01) { const q = toScreen(cam, X.x, X.y); wfRollArrow(q[0], q[1], 330 * cam.zoom, ra, t); }
  // OTHER HAND
  const kOther = tt < 0 ? 0 : popK(tt, c.slam2 - 0.06, c.try3 - 0.05, 0.08, 0.1);
  if (kOther > 0.01) { const b = sc([kn.back.B[0], kn.back.B[1] - 50]); wfTag('OTHER HAND', clamp(b[0], 320, 760), clamp(b[1] - 120, 520, 1040), kOther, '#7FE9FF', 82, 0.05); }
  // LEFT ... his right hand
  const kLeft = tt < 0 ? 0 : popK(tt, c.left4 - 0.05, c.so + 0.1, 0.1, 0.1);
  if (kLeft > 0.01) { const b = sc([kn.back.A[0], kn.back.A[1] - 50]); wfTag('LEFT', clamp(b[0] - 40, 250, 820), clamp(b[1] - 130, 520, 1040), kLeft, '#FF9A3C', 96, -0.08); }
  const kRight = tt < 0 ? 0 : popK(tt, c.left4 + 0.35, c.so + 0.1, 0.1, 0.1);
  if (kRight > 0.01) { const b = sc([kn.back.A[0], kn.back.A[1] + 40]); wfTag('= RIGHT HAND', clamp(b[0] + 60, 300, 780), clamp(b[1] + 120, 560, 1120), kRight, '#FF9A3C', 54, -0.04); }
  // the call up his left arm
  if (S.spark > 0.001 && S.spark < 0.999) {
    const P = wfSparkPath(F.arms, kn, 'B1').map((p) => wfKnotPt(X, p));
    wfSpark(cam, P, S.spark, t);
  }
  const kCall = tt < 0 ? 0 : popK(tt, c.calls - 0.05, c.you6, 0.1, 0.1);
  if (kCall > 0.01) wfTag('LEFT HAND?', 300, 1060, kCall, '#7FE9FF', 66, 0.06);
  // the red X on the crossed wrists
  const kx = tt < 0 ? 0 : popK(tt, c.xslam - 0.04, c.shot_touch - 0.02, 0.06, 0.1);
  if (kx > 0.01) { const w = sc([0, 120]); bigX(w[0], clamp(w[1], 560, 1150), 1.6, kx); }
  // the green tick on the right finger
  const kt = tt < 0 ? 0 : popK(tt, c.popright + 0.05, c.cut_never, 0.1, 0.08);
  if (kt > 0.01 && kn.fingers.A1) { const f = sc(kn.fingers.A1.tip); wfCheck(clamp(f[0] + 120, 200, 880), clamp(f[1] - 150, 520, 1100), 1.3, kt); }
  // the miss: wrong marks when a twin pops
  for (const [cue, id] of [[c.pop1, 'B1'], [c.pop3, 'B2'], [c.pop3b, 'B0'], [c.pop6, 'B1']]) {
    const k = tt < 0 ? 0 : popK(tt, cue, cue + 0.55, 0.05, 0.2);
    if (k > 0.01 && kn.fingers[id]) { const f = sc(kn.fingers[id].tip); shockLines(f[0], f[1], 90 * cam.zoom, k, 9, '#FFFFFF', 3); }
  }
}

// ---------------------------------------------------------------- the cameras
const CAM_POV = { x: 540, y: 1090, zoom: 1.08, rot: 0 };
function wfCam(tt) {
  const c = cu();
  const ids = ['hook', 'dare', 'answer', 'other', 'again', 'mech', 'crossed', 'touch', 'miss', 'sting', 'button'];
  const next = (id) => { const i = ids.indexOf(id); return i < ids.length - 1 ? c['shot_' + ids[i + 1]] : c.end; };
  const mv = (t0, t1, a, b, e = E.inOutSine) => { const u = ramp(tt, t0, t1, e); return { x: lerp(a[0], b[0], u), y: lerp(a[1], b[1], u), zoom: lerp(a[2], b[2], u), rot: 0 }; };
  if (tt < 0) return { ...CAM_POV };
  if (tt < c.cut_roll) return mv(0, c.cut_roll, [540, 1090, 1.08], [540, 1110, 1.13]);
  if (tt < c.shot_dare) return mv(c.cut_roll, c.shot_dare, [540, 1215, 1.42], [540, 1225, 1.5]);
  if (tt < c.shot_answer) return mv(c.shot_dare, c.shot_answer, [575, 1130, 1.16], [580, 1150, 1.24]);
  if (tt < c.cut_twin) return mv(c.shot_answer, c.cut_twin, [505, 935, 2.3], [510, 938, 2.4]);       // FRONT
  if (tt < c.shot_other) return mv(c.cut_twin, c.shot_other, [618, 992, 3.3], [620, 988, 3.5]);        // FRONT
  if (tt < c.shot_again) return mv(c.shot_other, c.shot_again, [655, 1250, 1.62], [660, 1245, 1.7]);
  if (tt < c.cut_this) return mv(c.shot_again, c.cut_this, [520, 1100, 1.1], [522, 1110, 1.16]);
  if (tt < c.shot_mech) return mv(c.cut_this, c.shot_mech, [470, 1180, 1.5], [474, 1186, 1.58]);
  if (tt < c.cut_calls) return mv(c.shot_mech, c.cut_calls, [540, 1330, 1.0], [540, 1320, 1.06]);
  if (tt < c.shot_crossed) return mv(c.cut_calls, c.shot_crossed, [600, 1470, 1.3], [640, 1380, 1.4]);
  if (tt < c.shot_touch) return mv(c.shot_crossed, c.shot_touch, [540, 1480, 2.1], [540, 1470, 2.25]);
  if (tt < c.shot_miss) return mv(c.shot_touch, c.shot_miss, [520, 1180, 1.5], [525, 1200, 1.72]);
  if (tt < c.cut_never) return mv(c.shot_miss, c.cut_never, [540, 1080, 1.1], [540, 1075, 1.14]);
  if (tt < c.shot_sting) return mv(c.cut_never, c.shot_sting, [540, 860, 2.0], [540, 862, 2.1]);
  if (tt < c.cut_eyes) return null;                // the sting's ECU: set in SC.sting from the finger
  if (tt < c.shot_button) return mv(c.cut_eyes, c.shot_button, [612, 846, 5.0], [612, 846, 5.3]);   // FRONT
  if (tt < c.loopcut) return mv(c.shot_button, c.loopcut, [495, 960, 1.95], [500, 955, 2.05]);   // FRONT
  return { ...CAM_POV };
}
const wfFront = (tt) => { const c = cu(); return tt >= 0 && ((tt >= c.shot_answer && tt < c.shot_other) || (tt >= c.cut_eyes && tt < c.loopcut)); };

// ---------------------------------------------------------------- shots
function wfShot(lt, t, shot) {
  const c = cu();
  const cam = wfCam(t);
  if (wfFront(t)) {
    const F = wfFrontFrame(t, t, cam);
    screenSpace();
    // question marks in his eyes ("your eyes just guess")
    if (t >= c.cut_eyes && t < c.shot_button) {
      const k = popK(t, c.q1, c.shot_button, 0.12, 0.08);
      const hd = toScreen(cam, ...toWorld(F.hero.st, F.hero.r.head));
      bigWord('?', clamp(hd[0] - 300, 150, 930), clamp(hd[1] - 200, 500, 1050), 210, '#FF9A3C', k, -0.15);
      bigWord('?', clamp(hd[0] + 300, 150, 930), clamp(hd[1] - 230, 500, 1050), 210, '#FF9A3C', clamp(k * 1.3 - 0.3), 0.15);
    }
    const hd = toScreen(cam, ...toWorld(F.hero.st, F.hero.r.head));
    if (t >= c.pop9) {
      // the raccoon's popped stub: (9, -112 - 20 - 40) in its units
      const q = toScreen(cam, FR.rx + 40 * 1.35 * FR.rs, FR.ry + (-68 - 1.35 * 52) * FR.rs);
      shockLines(q[0], q[1], 70, popK(t, c.pop9, c.pop9 + 0.5, 0.05, 0.2), 9, '#FFFFFF', 3);
    }
    return { glow: 0.85, focus: [clamp(hd[0], 260, 820), clamp(hd[1] + 60, 480, 1080)] };
  }
  const F = wfPovFrame(t, t, cam);
  wfPovOverlays(F, t, t);
  const kc = toScreen(cam, F.X.x, F.X.y - 40);
  return { glow: 0.85, focus: [clamp(kc[0], 260, 820), clamp(kc[1], 480, 1080)] };
}
for (const id of ['hook', 'dare', 'answer', 'other', 'again', 'mech', 'crossed', 'touch', 'miss', 'button']) SC[id] = wfShot;

// the sting: an ECU on the touched finger (its skin lit, proud), then (cut_eyes) his eyes from the front
SC.sting = (lt, t, shot) => {
  const c = cu();
  if (t >= c.cut_eyes) return wfShot(lt, t, shot);
  // aim at A1, lifted (its middle sits about (18, -22) knot units from the knot's centre)
  const S0 = wfS(t), X = wfKnotXf(S0), w = wfKnotPt(X, [16, -20]);
  const u = ramp(t, c.shot_sting, c.cut_eyes, E.inOutSine);
  const cam = { x: w[0] + 10, y: w[1] + 120, zoom: lerp(2.0, 2.15, u), rot: 0 };
  const F = wfPovFrame(t, t, cam);
  wfPovOverlays(F, t, t);
  // the skin's glow along the finger: it KNOWS
  const kg = popK(t, c.glow8, c.cut_eyes, 0.15, 0.1);
  if (kg > 0.01 && F.kn.fingers.A1) {
    const a = toScreen(cam, ...wfKnotPt(F.X, F.kn.fingers.A1.root)), b = toScreen(cam, ...wfKnotPt(F.X, F.kn.fingers.A1.tip));
    screenSpace();
    for (let i = 0; i <= 8; i++) { const q = [lerp(a[0], b[0], i / 8), lerp(a[1], b[1], i / 8)]; softDot(gctx, q[0], q[1], 70, '#4DFFB4', 0.35 * kg); }
    wfTag('SKIN: KNOWS', clamp((a[0] + b[0]) / 2, 300, 780), clamp(Math.min(a[1], b[1]) - 170, 520, 1000), kg, '#4DFFB4', 76, -0.05);
  }
  return { glow: 0.85, focus: [540, 900] };
};

// the button's last beat: the loop cut back to frame 1's picture (the hook at negative time)
SC.button = (lt, t, shot) => {
  const c = cu();
  if (t >= c.loopcut) { const tt = t - TLd.duration; const F = wfPovFrame(tt, t, wfCam(tt)); wfPovOverlays(F, tt, t); return { glow: 0.85 }; }
  return wfShot(lt, t, shot);
};

// the cover: the raccoon points at one finger and its twin pops; WIGGLE THIS ONE?
SC.cover = (lt, t, shot) => {
  const c = cu();
  const tt = c.pop1 + 0.35;
  const cam = { x: 550, y: 1060, zoom: 1.1, rot: 0 };
  const F = wfPovFrame(tt, t, cam);
  wfPovOverlays(F, tt, t);
  screenSpace();
  bigWord('WIGGLE', 540, 1470, 170, '#FFFFFF', 1, -0.04);
  bigWord('THIS ONE?', 540, 1635, 160, '#FFD447', 1, -0.04);
  return { glow: 0.85, noCaptions: true };
};

function initScenes2() { initCamp(); initWf(); }
