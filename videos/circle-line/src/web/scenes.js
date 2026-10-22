// Why Can't You Draw a Circle and a Line at the SAME Time? Short: the shots. Each SC.<id>(lt, t, shot) draws one frame
// (lt = seconds inside the shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;
const pulseOf = (t, times, len = 0.16) => times.reduce((m, f) => Math.max(m, clamp((t - f) / 0.03) * clamp((f + len - t) / 0.05)), 0);
const bumpAt = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);
const shotOf = (id) => TLd.shots.find((s) => s.id === id);

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the office at night: the ceiling light up and to the left is the key; the back light is the cool city in the window
const OFFICE_LIGHT = { ...LIGHTS.room, rim: [0.55, 0.78, 1.0], rimFrom: [0.8, -0.45], rimAmt: 1.15, pool: 0.5, halo: 0.12 };
const COVER_LIGHT = { ...OFFICE_LIGHT, form: 0.5, cast: 0.5, ao: 0.1 };
const CL_ANG = 300 / OF_PW * Math.PI * 2;      // which part of the room is behind him: the big window on the city (the moon off to the right)

// ---------------------------------------------------------------- his faces
const FF = {
  // eyes on his hands, concentrating (the tip of his tongue out at the corner)
  focus: { eyeOpen: 0.95, pupil: 1, lookX: 0.7, lookY: -0.35, browY: 0.2, browTilt: 0.5, mouth: 'flat', mouthOpen: 0, blink: 0.1, cross: 0 },
  // at the line as it bends
  huh: { eyeOpen: 1.38, pupil: 0.55, lookX: 0.85, lookY: -0.3, browY: 1.45, browTilt: 0.35, mouth: 'o', mouthOpen: 0.7, blink: 0, cross: 0 },
  // up at us
  yep: { eyeOpen: 1.0, pupil: 1, lookX: 0, lookY: 0, browY: 0.9, browTilt: -0.2, mouth: 'flat', mouthOpen: 0.2, blink: 0.2, cross: 0 },
  // suspicious, from one hand to the other
  sus: { eyeOpen: 0.6, pupil: 1, lookX: 0.9, lookY: -0.2, browY: -0.35, browTilt: -0.7, mouth: 'flat', mouthOpen: 0, blink: 0.32, cross: 0 },
  // "better than YOU."
  offended: { eyeOpen: 0.95, pupil: 1, lookX: 0, lookY: 0, browY: -0.3, browTilt: -0.9, mouth: 'grimace', mouthOpen: 0.35, blink: 0.25, cross: 0 },
  // weirder? brows up at us
  weird: { eyeOpen: 1.1, pupil: 0.9, lookX: 0, lookY: 0, browY: 1.3, browTilt: 0.2, mouth: 'flat', mouthOpen: 0.15, blink: 0, cross: 0 },
  // at the ghost arm
  spooked: { eyeOpen: 1.42, pupil: 0.5, lookX: -0.9, lookY: -0.3, browY: 1.5, browTilt: 0.5, mouth: 'o', mouthOpen: 0.9, blink: 0, cross: 0 },
  // proud of his hands, then onto them
  proud: { eyeOpen: 0.95, pupil: 1, lookX: 0, lookY: 0, browY: 0.8, browTilt: -0.3, mouth: 'grin', mouthOpen: 0.55, blink: 0.1, cross: 0 },
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
// a dashed ring (the circle on its way across), screen space
function dashRing(x, y, r, k, col, t) {
  if (k <= 0.01) return;
  screenSpace();
  for (const [cc, w, cl] of [[ctx, 9, rgba('#0B0B1A', 0.6 * k)], [ctx, 5, rgba(col, k)], [gctx, 14, rgba(col, 0.5 * k)]]) {
    cc.save(); if (cc === gctx) cc.setTransform(0.5, 0, 0, 0.5, 0, 0);
    cc.setLineDash([16, 12]); cc.lineDashOffset = -t * 90;
    cc.beginPath(); cc.arc(x, y, r, 0, 7); cc.lineWidth = w; cc.strokeStyle = cl; cc.stroke(); cc.restore();
  }
}
// a puff of smoke (an arm going), screen space
function puff(x, y, s, k) {
  if (k <= 0.01 || k >= 0.999) return;
  const rng = mulberry32(17), u = E.outCubic(k);
  screenSpace();
  for (let i = 0; i < 9; i++) {
    const a = rng() * 7, d = (40 + 70 * rng()) * u * s, r = (26 + 22 * rng()) * s * (0.6 + 0.6 * u);
    circle(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d, r, rgba('#E9EEFF', 0.85 * (1 - u)));
  }
}

// ================================================================ the office: him in the chair, the city behind
function officeDraw(t, o) {
  ofRoom(o.cam, t, CL_ANG, 0, { lamp: o.lamp });
  applyCam(o.cam);
  ofChairBack(ctx);
  const H = fsHero(o.cam, t, o.A);
  applyCam(o.cam);
  ofOcclude(H);
  return H;
}
// the hero drawing both shapes: tips = clTips(...), o: {face, bob, headRot, post, hideArm, armL (overrides)}
function drawA(tips, o) {
  return {
    pal: CLPAL, noTie: true, face: o.face, tongue: o.tongue || 0,
    arms: { L: o.armL || clArmFor('L', tips.L), R: o.armR || clArmFor('R', tips.R) }, handL: 'point', handR: 'point', legUp: 0,
    bob: o.bob || 0, headRot: o.headRot || 0, headDX: o.headDX || 0, headDY: o.headDY || 0, post: o.post, hideArm: o.hideArm,
  };
}

// ================================================================ the hook: frame 1 and round it
// tt = seconds since frame 1 (negative = the last frames of the Short, on their way here)
function bHook(x) { const c = cu(); return x < 0 ? 0 : ramp(x, c.bend0, c.bend1, E.inOutSine); }
function hookA(tt) {
  const c = cu(), b = bHook(tt), T = clTips(tt, b);
  let face = FF.focus;
  face = lerpFace(face, FF.huh, ramp(tt, c.bent - 0.18, c.bent + 0.08));
  face = lerpFace(face, FF.yep, ramp(tt, c.right - 0.1, c.right + 0.15));
  const sus = ramp(tt, c.your1 - 0.1, c.your1 + 0.15);
  face = lerpFace(face, FF.sus, sus);
  if (sus > 0) face = { ...face, lookX: lerp(face.lookX, 0.9 * clamp(3 * Math.sin((tt - c.your1) * 4.4 + 1.3), -1, 1), sus) };
  face = { ...face, blink: Math.max(face.blink || 0, pulseOf(tt, [c.straight - 0.35, c.homework_end + 0.05], 0.12)) };
  const A = drawA(T, {
    face, tongue: 1 - ramp(tt, c.bend0 + 0.2, c.bent - 0.1), bob: 1.2 * Math.sin(tt * 2.2),
    headRot: 0.04 * Math.sin(tt * 1.3) + 0.06 * ramp(tt, c.bent - 0.2, c.bent + 0.1) * (1 - ramp(tt, c.right - 0.1, c.right + 0.2)),
  });
  return { A, T, b };
}
function hookCam(tt) {
  const c = cu();
  return camKeys(tt, [[-0.4, 540, 1331, 2.46], [0, 540, 1331, 2.48], [0.6, 540, 1331, 2.56], [c.bend1, 548, 1334, 2.62],
    [c.right, 540, 1338, 2.5], [c.copy, 540, 1342, 2.38], [c.each, 540, 1348, 2.3]], E.inOutCubic);
}
function hookDraw(tt, t, o) {
  const S = hookA(tt), cam = o.cam;
  const H = officeDraw(t, { cam, A: S.A });
  clTrail(H.S, tt, bHook, 'L', CL_CYAN, 1, { zoom: cam.zoom, w: 6.5 });
  clTrail(H.S, tt, bHook, 'R', CL_ORANGE, 1, { zoom: cam.zoom, w: 6.5 });
  return { H, S };
}
SC.hook = (lt, t, shot) => {
  const c = cu(), cam = hookCam(t);
  const { H } = hookDraw(t, t, { cam });
  // the straight line he meant, dashed, beside the bent one
  clGuide(H.S, popK(t, c.bent - 0.05, c.copy, 0.12, 0.2), cam.zoom);
  const top = H.S(CL_C.R[0], CL_C.R[1] - CL_A - 26);
  bigWord('?!', top[0] - 112, top[1] + 64, 80, '#FF5A6E', E.outBack(popK(t, c.bent, c.your1, 0.12, 0.12), 2), 0.12);
  // the copy: a dashed circle leaves the circle, swoops under his chin and lands on the line
  const fk = ramp(t, c.your1 - 0.05, c.copy + 0.08, E.inOutSine);
  if (fk > 0.001) {
    const A = H.S(...CL_C.L), B = H.S(...CL_C.R), Q = [540, 1010];
    const p = [(1 - fk) * (1 - fk) * A[0] + 2 * fk * (1 - fk) * Q[0] + fk * fk * B[0], (1 - fk) * (1 - fk) * A[1] + 2 * fk * (1 - fk) * Q[1] + fk * fk * B[1]];
    dashRing(p[0], p[1], CL_R * cam.zoom * lerp(0.9, 0.7, Math.sin(Math.PI * fk)), 1 - ramp(t, c.copy + 0.1, c.copy + 0.4), CL_CYAN, t);
  }
  fsBurst('COPIED!', 700, 925, 78, '#FF5A6E', popK(t, c.copy + 0.02, shot.end + 1, 0.14, 0.1), -0.1, 7);
  return { glow: 0.85 };
};

// ================================================================ each hand, its own half
// the same shot, wider: his head turns to glass, two halves; a cord from each half to the OTHER side's hand
function halvesCam(t, T0) {
  const c = cu(), h0 = hookCam(T0);
  return camKeys(t, [[T0, h0.x, h0.y, h0.zoom], [c.hand1, 540, 1350, 2.12], [c.half, 540, 1356, 1.95], [c.brain_end + 0.3, 540, 1356, 1.92]], E.inOutCubic);
}
function halvesG(t) {
  const c = cu(), lit = ramp(t, c.half - 0.2, c.half + 0.05, E.outBack);
  return { k: ramp(t, c.own - 0.2, c.own + 0.05), spread: 0, litL: lit, litR: lit, faceL: ramp(t, c.half + 0.1, c.half + 0.35), faceR: ramp(t, c.half + 0.15, c.half + 0.4),
    moodL: 'smile', moodR: 'smile', lookL: [0.3, 0.6], lookR: [-0.3, 0.6] };
}
SC.halves = (lt, t, shot) => {
  const c = cu(), cam = halvesCam(t, shot.start);
  const T = clTips(t, 1), G = halvesG(t);
  let face = lerpFace(FF.sus, FF.yep, ramp(t, shot.start, shot.start + 0.3));
  const A = drawA(T, { face, bob: 1.2 * Math.sin(t * 2.2), headRot: 0.03 * Math.sin(t * 1.3),
    post: (lc, rr, s2) => fsInHead(lc, s2, (cc) => clGlass(cc, t, G)) });
  const H = officeDraw(t, { cam, A });
  const one = () => 1;
  clTrail(H.S, t, one, 'L', CL_CYAN, 1, { zoom: cam.zoom, w: 6.5 });
  clTrail(H.S, t, one, 'R', CL_ORANGE, 1, { zoom: cam.zoom, w: 6.5 });
  // both hands light up as they are named
  const hp = pulseOf(t, [c.hand1 - 0.05], 0.4);
  if (hp > 0.01) for (const sd of ['L', 'R']) softDot(gctx, ...H.fingerS(sd), 120 * cam.zoom / 2, sd === 'L' ? CL_CYAN : CL_ORANGE, 0.6 * hp);
  // the cords: the right half to the left hand (cyan), the left half to the right hand (orange); they cross in his neck
  const ck = ramp(t, c.half, c.brain_end, E.inOutSine);
  cord(clCordPts(H, 'L', 0), CL_CYAN, ck, t, { w: 3.0 * cam.zoom, speed: 300 * cam.zoom });
  cord(clCordPts(H, 'R', 0), CL_ORANGE, ck, t, { w: 3.0 * cam.zoom, speed: 300 * cam.zoom });
  // the dive starts at the end of the shot
  const dive = ramp(t, shot.end - 0.25, shot.end, E.inCubic);
  return { glow: 0.85, zblur: 0.2 * dive, zcx: 540, zcy: H.HS(0, 0)[1], flash: 0.12 * dive };
};

// ================================================================ into the glass: the halves chat over a bridge, the circle leaks across
const WIN = { x: 540, y: 1168, w: 540, h: 214 };
function headCam(t, T0) {
  // the camera on his head: his head's middle at screen (540, 700), zoom 5
  return camKeys(t, [[T0, 540, 1356, 1.92], [T0 + 0.5, 540, 1239, 5.0], [cu().you, 540, 1232, 5.3]], E.inOutCubic);
}
function leakG(t, T0) {
  const c = cu();
  const r0 = c.circle2 - 0.12, r1 = c.across_end - 0.05;
  const roll = t >= r0 && t <= r1 + 0.2 ? clamp((t - r0) / (r1 - r0)) : -1;
  const bend = ramp(t, lerp(r0, r1, 0.85), r1 + 0.15);
  // the chat: they take turns between "chat" and the end of "bridge..."
  const ch0 = c.chat - 0.08, ch1 = c.bridge_end + 0.1, turn = Math.floor((t - ch0) / 0.42);
  const chatting = t > ch0 && t < ch1;
  const side = turn % 2 ? 'L' : 'R';
  const bk = chatting ? popK(t, ch0 + turn * 0.42, ch0 + (turn + 1) * 0.42 - 0.04, 0.1, 0.06) : 0;
  const kinds = ['circle', 'dots', 'line', 'dots', 'circle'];
  const landed = ramp(t, r1 - 0.05, r1 + 0.2);
  return { k: 1, spread: ramp(t, T0 + 0.15, T0 + 0.7, E.inOutCubic), litL: 1, litR: 1, faceL: 1, faceR: 1,
    plans: ramp(t, T0 + 0.45, T0 + 0.8), bend,
    moodL: landed > 0.5 ? 'wow' : (chatting && side === 'L' ? 'talk' : 'smile'), moodR: roll >= 0 && landed < 0.5 ? 'sneaky' : (chatting && side === 'R' ? 'talk' : 'smile'),
    lookL: [0.9, 0.2], lookR: roll >= 0 ? [-0.9, 0.6] : [-0.9, 0.2],
    talkL: chatting && side === 'L' ? 0.5 + 0.5 * Math.sin(t * 22) : 0, talkR: chatting && side === 'R' ? 0.5 + 0.5 * Math.sin(t * 22) : 0,
    bubble: { side, k: bk, kind: kinds[Math.max(0, turn) % kinds.length] },
    bridge: ramp(t, c.bridge - 0.12, c.bridge_end - 0.1, E.inOutSine), roll };
}
function glassShot(t, cam, G, o = {}) {
  const T = clTips(t, 1);
  // once the camera is inside his head his hands rest on the arms of the chair, out of the frame (the window shows
  // them drawing); during the dive they still draw
  const rest = (o.rest === undefined ? 1 : o.rest) > 0.5;
  const A = drawA(T, { face: FF.yep, armL: rest ? OF_ARM.gripL : undefined, armR: rest ? OF_ARM.gripR : undefined, bob: 0.3 * Math.sin(t * 2.2), post: (lc, rr, s2) => fsInHead(lc, s2, (cc) => clGlass(cc, t, G)) });
  return officeDraw(t, { cam, A });
}
SC.leak = (lt, t, shot) => {
  const c = cu(), cam = headCam(t, shot.start);
  const G = leakG(t, shot.start);
  const H = glassShot(t, cam, G, { rest: lt > 0.55 ? 1 : 0 });
  if (lt <= 0.55) { const one = () => 1; clTrail(H.S, t, one, 'L', CL_CYAN, 1, { zoom: cam.zoom, w: 6.5 }); clTrail(H.S, t, one, 'R', CL_ORANGE, 1, { zoom: cam.zoom, w: 6.5 }); }
  // the window on his hands: straight until the circle lands, then the line bends
  clWindow(WIN.x, WIN.y, WIN.w, WIN.h, ramp(t, shot.start + 0.5, shot.start + 0.8), { label: 'YOUR HANDS', b: G.bend, tt: t });
  const ent = 1 - ramp(lt, 0, 0.4);
  return { glow: 0.85, capY: 1420, zblur: 0.18 * ent, zcx: 540, zcy: 700, flash: 0.14 * ent + 0.06 * bumpAt(t, c.across_end, 8) };
};

// ================================================================ the proof: the bridge cut, both shapes clean
function payG(t, T0) {
  const c = cu();
  const scis = popK(t, c.two - 0.1, c.drew + 0.25, 0.14, 0.2), cut = ramp(t, c.cut_end, c.cut_end + 0.4);
  const clean = ramp(t, c.drew - 0.05, c.shapes);
  return { k: 1, spread: 1, litL: 1, litR: 1, faceL: 1, faceR: 1, plans: 1,
    bend: 1 - clean, bridge: 1, cut, scissors: scis, snip: ramp(t, c.cut - 0.02, c.cut_end),
    moodL: clean > 0.6 ? 'proud' : (scis > 0.2 ? 'wow' : 'smile'), moodR: clean > 0.6 ? 'proud' : (scis > 0.2 ? 'wow' : 'smile'),
    lookL: scis > 0.2 && cut < 0.5 ? [0.7, 0.9] : [0, 0], lookR: scis > 0.2 && cut < 0.5 ? [-0.7, 0.9] : [0, 0], roll: -1 };
}
SC.payoff = (lt, t, shot) => {
  const c = cu(), cam = headCam(t, shotOf('leak').start);
  const G = payG(t, shot.start);
  glassShot(t, cam, G);
  const clean = ramp(t, c.drew - 0.05, c.shapes);
  const theirs = t > c.two - 0.12;
  clWindow(WIN.x, WIN.y, WIN.w, WIN.h, 1, { label: theirs ? '2 PATIENTS, 1996' : 'YOUR HANDS', labelCol: theirs ? '#4DFFB4' : '#BFF6FF',
    b: 1, clean, ticks: ramp(t, c.shapes, c.shapes + 0.3), tt: t, col: theirs ? '#4DFFB4' : '#BFF6FF' });
  return { glow: 0.85, capY: 1420, flash: 0.1 * bumpAt(t, c.cut_end, 9) };
};

// ================================================================ "better than YOU.": back to him and his bent line
SC.you = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0;
  const cam = camKeys(lt, [[0, 540, 1338, 2.3], [c.you - T0, 546, 1336, 2.45], [D, 548, 1336, 2.5]], E.inOutCubic);
  const T = clTips(t, 1);
  const face = lerpFace(FF.yep, FF.offended, ramp(t, c.you - 0.12, c.you + 0.1));
  const A = drawA(T, { face, bob: 1.2 * Math.sin(t * 2.2), headRot: -0.05 * ramp(t, c.you - 0.1, c.you + 0.15) });
  const H = officeDraw(t, { cam, A });
  const one = () => 1;
  clTrail(H.S, t, one, 'L', CL_CYAN, 1, { zoom: cam.zoom, w: 6.5 });
  clTrail(H.S, t, one, 'R', CL_ORANGE, 1, { zoom: cam.zoom, w: 6.5 });
  const L = H.S(...CL_C.R);
  bigX(L[0], L[1], 0.36, ramp(t, c.you + 0.02, c.you + 0.2));
  return { glow: 0.85, flash: 0.08 * (1 - ramp(lt, 0, 0.2)) };
};

// ================================================================ the weirdest fact: a ghost arm still bends the line
function bWeird(x) { const c = cu(); return ramp(x, c.bend2 - 0.1, c.line2_end + 0.1, E.inOutSine); }
SC.weird = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0;
  const cam = camKeys(lt, [[0, 540, 1352, 2.1], [c.missing - T0, 540, 1356, 1.98], [c.ghost - T0, 528, 1350, 2.12], [D, 524, 1348, 2.18]], E.inOutCubic);
  const T = clTips(t, bWeird(t));
  const gone = t > c.missing + 0.05;                         // his left arm: gone in a puff on "missing"
  const stop = ramp(t, c.weirder_end - 0.1, c.missing, E.inOutSine);
  const armL = gone ? null : armMix(clArmFor('L', T.L), { e: [-150, -330], w: [-140, -420] }, stop);
  let face = lerpFace(FF.focus, FF.weird, ramp(t, T0, T0 + 0.25));
  face = lerpFace(face, { ...FF.huh, lookX: -0.8 }, ramp(t, c.missing, c.missing + 0.15) * (1 - ramp(t, c.bend2 - 0.2, c.bend2)));
  face = lerpFace(face, FF.huh, ramp(t, c.bend2 - 0.2, c.bend2));
  face = lerpFace(face, FF.spooked, ramp(t, c.ghost - 0.15, c.ghost + 0.05));
  const A = drawA(T, { face, armL: armL || undefined, hideArm: gone ? 'L' : undefined, bob: 1.2 * Math.sin(t * 2.2), headRot: 0.04 * Math.sin(t * 1.3) });
  const H = officeDraw(t, { cam, A });
  // the line: straight, then bending (the real right hand)
  clTrail(H.S, t, bWeird, 'R', CL_ORANGE, 1, { zoom: cam.zoom, w: 6.5 });
  // the real left hand's circle, fading as it stops
  clTrail(H.S, t, bWeird, 'L', CL_CYAN, 1 - stop, { zoom: cam.zoom, w: 6.5 });
  // the puff where his arm was
  const pk = ramp(t, c.missing + 0.02, c.missing + 0.5);
  const el = H.S(-150, -360);
  puff(el[0], el[1], cam.zoom / 2, pk);
  // the ghost arm, circling; brighter on "GHOST"
  const gk = ramp(t, c.arm - 0.05, c.arm_end + 0.2), bright = 1 + 0.6 * pulseOf(t, [c.ghost], 0.5);
  clGhostArm(H, T.L, gk, t);
  clTrail(H.S, t, bWeird, 'L', '#CFF4FF', gk * 0.85 * Math.min(1, bright), { zoom: cam.zoom, w: 6, dash: true });
  if (gk > 0.01 && bright > 1.01) softDot(gctx, ...H.S(...T.L), 140 * cam.zoom / 2, '#BFF6FF', 0.5 * (bright - 1));
  tagPill('PHANTOM ARM', 330, 520, '#CFF4FF', popK(t, c.ghost - 0.08, shot.end + 1, 0.12, 0.1), 38);
  return { glow: 0.85, flash: 0.1 * bumpAt(t, c.missing + 0.02, 10) };
};

// ================================================================ the button: not clumsy, cheating; back to frame 1
// its clock is the hook's at negative time (tt = t - duration), so the hands arrive where frame 1 has them
function bButton(x) { const c = cu(), D = TLd.duration; return 1 - ramp(x + D, c.cheating_end + 0.05, D - 0.45, E.inOutSine); }
SC.button = (lt, t, shot) => {
  const c = cu(), D = TLd.duration, tt = t - D, T0 = shot.start;
  const h0 = hookCam(-0.4);
  const cam = camKeys(lt, [[0, 540, 1345, 2.3], [c.clumsy - T0, 540, 1340, 2.4], [c.cheating - T0, 540, 1336, 2.44], [D - 0.4 - T0, h0.x, h0.y, h0.zoom]], E.inOutCubic);
  const b = bButton(tt), T = clTips(tt, b);
  let face = lerpFace(FF.yep, FF.proud, ramp(t, c.clumsy - 0.15, c.clumsy + 0.1));
  const sus = ramp(t, c.cheating - 0.12, c.cheating + 0.1) * (1 - ramp(t, D - 0.75, D - 0.4));
  face = lerpFace(face, FF.sus, sus);
  if (sus > 0) face = { ...face, lookX: lerp(face.lookX, 0.9 * clamp(3 * Math.sin((t - c.cheating) * 4.4 + 1.3), -1, 1), sus) };
  face = lerpFace(face, FF.focus, ramp(t, D - 0.75, D - 0.4));
  const A = drawA(T, { face, tongue: ramp(t, D - 0.7, D - 0.4), bob: 1.2 * Math.sin(tt * 2.2), headRot: 0.04 * Math.sin(tt * 1.3) });
  const H = officeDraw(t, { cam, A });
  clTrail(H.S, tt, bButton, 'L', CL_CYAN, 1, { zoom: cam.zoom, w: 6.5 });
  clTrail(H.S, tt, bButton, 'R', CL_ORANGE, 1, { zoom: cam.zoom, w: 6.5 });
  tagPill('NOT CLUMSY', 540, 1000, '#4DFFB4', popK(t, c.clumsy - 0.05, c.cheating - 0.1, 0.12, 0.1), 40);
  // PSST: the circle hand whispers to the line hand
  const pk = popK(t, c.cheating_end - 0.02, D - 0.55, 0.12, 0.1);
  const Lh = H.S(CL_C.L[0] + 40, CL_C.L[1] - 70);
  speech('PSST!', Lh[0] + 60, Lh[1] - 30, pk, '#1E96D8', 62, -0.1);
  return { glow: 0.85 };
};

// ================================================================ the cover: him mid-test, the bent line, DID IT BEND?
SC.cover = (lt, t) => {
  const c = cu(), tt = c.bend1 + 0.55, cam = { x: 540, y: 1300, zoom: 2.3, rot: 0 };
  const S = hookA(tt);
  S.A.face = FF.huh;
  S.A.tongue = 0;
  const H = officeDraw(tt, { cam, A: S.A });
  clTrail(H.S, tt, bHook, 'L', CL_CYAN, 1, { zoom: cam.zoom, w: 6.5 });
  clTrail(H.S, tt, bHook, 'R', CL_ORANGE, 1, { zoom: cam.zoom, w: 6.5 });
  clGuide(H.S, 1, cam.zoom);
  screenSpace();
  bigWord('DID IT', 540, 1040, 146, '#FFFFFF', 1, -0.04);
  bigWord('BEND?', 540, 1190, 172, '#FFD447', 1, -0.03);
  return { glow: 0.85, noCaptions: true };
};

// ================================================================ the loop: the last 0.4 s are the hook at negative time
SC.loop = (lt, t, shot) => {
  const tt = t - TLd.duration, cam = hookCam(tt);
  hookDraw(tt, t, { cam });
  return { glow: 0.85 };
};

setLights({ hook: OFFICE_LIGHT, halves: OFFICE_LIGHT, leak: OFFICE_LIGHT, payoff: OFFICE_LIGHT, you: OFFICE_LIGHT, weird: OFFICE_LIGHT,
  button: OFFICE_LIGHT, loop: OFFICE_LIGHT, cover: COVER_LIGHT });

function initScenes2() {
  initOffice();
}
