// Why Is the Vulcan Salute So HARD? 🖖 Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside
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
// the living room at night: the TV in front of him is the key (cool, from the front, a little to the right), the warm
// floor lamp far left behind him is the rim
const TV_LIGHT = (lt, t) => ({ ...LIGHTS.night, key: [0.30, -0.42, 0.85], keyTint: [0.9 + 0.04 * tvFlick(t), 0.98, 1.1 + 0.05 * tvFlick(t)],
  rimFrom: [-0.85, -0.35], rim: [1.0, 0.70, 0.42], rimAmt: 1.2, pool: 0.62, halo: 0.12, haloColor: [0.6, 0.75, 1.0], dof: 0.8 });

// ---------------------------------------------------------------- his faces
const VF = {
  // eyes on his raised hand (screen right), a little cross: concentrating
  focus: { eyeOpen: 1.05, pupil: 0.95, lookX: 0.85, lookY: -0.35, browY: 0.5, browTilt: 0.6, mouth: 'flat', mouthOpen: -0.2, blink: 0, cross: 0 },
  strain: { eyeOpen: 0.78, pupil: 1, lookX: 0.85, lookY: -0.4, browY: -0.3, browTilt: 1.1, mouth: 'grimace', mouthOpen: 0.75, blink: 0.25, cross: 0, squeeze: 0.35 },
  huh: { eyeOpen: 1.2, pupil: 0.8, lookX: 0.8, lookY: -0.3, browY: 1.2, browTilt: 0.9, mouth: 'wavy', mouthOpen: 0.35, blink: 0, cross: 0 },
  inspect: { eyeOpen: 1.12, pupil: 0.85, lookX: 0.75, lookY: -0.2, browY: 0.8, browTilt: 0.7, mouth: 'o', mouthOpen: 0.25, blink: 0, cross: 0 },
  aww: { eyeOpen: 1.05, pupil: 0.95, lookX: 0.8, lookY: -0.3, browY: 1.0, browTilt: -0.4, mouth: 'grin', mouthOpen: 0.4, blink: 0, cross: 0 },
  wow: { eyeOpen: 1.3, pupil: 0.65, lookX: 0.75, lookY: -0.25, browY: 1.45, browTilt: 0.3, mouth: 'o', mouthOpen: 0.55, blink: 0, cross: 0 },
  // caught: wide eyes, straight at us
  caught: { eyeOpen: 1.35, pupil: 0.62, lookX: 0, lookY: 0, browY: 1.4, browTilt: 0.5, mouth: 'grimace', mouthOpen: 0.6, blink: 0, cross: 0 },
  sheepish: { eyeOpen: 0.95, pupil: 0.95, lookX: -0.25, lookY: 0.15, browY: 0.9, browTilt: 0.9, mouth: 'grin', mouthOpen: 0.45, blink: 0.12, cross: 0 },
};

// ================================================================ the living room: frame 1 and round it
// tt = seconds since frame 1 (negative = the last frames of the Short, on their way here)
function hookA(tt) {
  const c = cu();
  // the hand state
  const jazz = ramp(tt, c.split - 0.05, c.split + 0.22, E.outBack) * (1 - ramp(tt, c.two1 - 0.12, c.two1 + 0.05));
  const wrong = ramp(tt, c.two1 - 0.08, c.two1 + 0.12, E.outBack) * (1 - ramp(tt, c.and1 - 0.1, c.and1 + 0.12));
  const strain = ramp(tt, c.and1 - 0.12, c.and1 + 0.15);
  const giveUp = ramp(tt, c.two2_end + 0.06, c.two2_end + 0.2, E.outBack);   // the fingers give up in the pause after TWO (bonk)
  const split = 0.95 * strain * (1 - giveUp);
  const flipK = ramp(tt, c.cant_end, c.cant_end + 0.42, E.inOutCubic);   // he turns it round in the pause after "Can't?" (whoosh)
  const tremble = (0.35 + 0.65 * strain) * (1 - giveUp) * (tt >= -0.05 ? 1 : 0.3) + 0.25 * ramp(tt, c.tied - 0.1, c.tied + 0.2) * (1 - ramp(tt, c.strap_end - 0.1, c.strap_end + 0.2));
  const spread = { L: -0.20 * jazz, R: -0.07 * jazz, M: 0.06 * jazz, I: 0.17 * jazz };
  const faces = ramp(tt, c.holding - 0.05, c.holding + 0.15, E.outBack) * (1 - ramp(tt, c.under + 0.15, c.under + 0.45));
  const love = ramp(tt, c.hands - 0.1, c.hands + 0.25);
  const glass = ramp(tt, c.under - 0.05, c.skin + 0.15, E.inOutSine);
  // the cords shot: he tries again, the strap drags the ring finger along
  const again = ramp(tt, c.tied - 0.05, c.together + 0.15, E.inOutCubic) * (1 - ramp(tt, c.strap_end + 0.05, c.strap_end + 0.35));
  const H = {
    view: flipK, spread, wrong, stuck: Math.max(strain, again), split: Math.max(split, 0.6 * again), tremble,
    faces, love, lean: love * (1 - glass * 0.6), glass,
    glowM: ramp(tt, c.middle - 0.05, c.middle + 0.12) * (1 - ramp(tt, c.under, c.under + 0.3)),
    glowR: ramp(tt, c.ring1 - 0.05, c.ring1 + 0.12) * (1 - ramp(tt, c.under, c.under + 0.3)),
    strapPull: again,
  };
  // the arm: up beside his face, turned toward him to look
  const armR = armMix(VS_ARM.up, VS_ARM.look, flipK);
  // his face
  let face = lerpFace(VF.focus, VF.strain, Math.max(0.5 * jazz, strain * (1 - giveUp)));
  face = lerpFace(face, VF.huh, ramp(tt, c.cant - 0.05, c.cant + 0.15));
  face = lerpFace(face, VF.inspect, ramp(tt, c.cant + 0.5, c.cant + 0.8));
  face = lerpFace(face, VF.aww, ramp(tt, c.hands - 0.1, c.hands + 0.2));
  face = lerpFace(face, VF.wow, ramp(tt, c.under, c.under + 0.2));
  face = lerpFace(face, VF.strain, again * 0.8);
  face = { ...face, blink: Math.max(face.blink || 0, pulseOf(tt, [c.cant + 0.75, c.their + 0.3], 0.12)) };
  const A = {
    face, H, armR,
    tongue: 0.9 * (1 - Math.max(jazz, ramp(tt, c.and1 - 0.15, c.and1))) * (1 - giveUp) * ramp(tt, -0.36, -0.08),
    sweat: ramp(tt, c.two2 - 0.1, c.two2 + 0.2) * (1 - ramp(tt, c.cant + 0.2, c.cant + 0.5)),
    headDX: 3 * Math.sin(tt * 1.7), headDY: 1.2 * Math.sin(tt * 2.3) - 4 * bumpAt(tt, c.cant, 7), bob: 1.0 * Math.sin(tt * 2.3),
    headRot: 0.05 * ramp(tt, c.cant + 0.3, c.cant + 0.8) - 0.04 * strain * (1 - giveUp),
    handRot: -0.05 * flipK + 0.02 * Math.sin(tt * 2.1),
  };
  return { A, jazz, wrong, strain, giveUp, flipK, faces, love, glass, again };
}
function hookCam(tt) {
  const c = cu();
  const k = camKeys(tt, [[-0.4, 624, 1040, 2.82], [0, 624, 1040, 2.82], [0.6, 628, 1032, 3.0], [c.split, 630, 1028, 3.0], [c.two2_end, 632, 1024, 3.08],
    [c.cant + 0.2, 626, 1036, 2.9], [c.your_mid, 646, 1012, 3.15], [c.holding, 656, 996, 3.45], [c.under, 662, 994, 3.6], [c.skin_end, 668, 1000, 4.0],
    [c.their + 0.3, 668, 1010, 4.4], [c.tied, 664, 1020, 4.9], [c.strap, 658, 1030, 5.3], [c.strap_end + 0.15, 652, 1030, 5.4]], E.inOutCubic);
  if (tt >= 0 && tt < 0.6) { const u = E.outCubic(tt / 0.6); k.zoom = lerp(2.82, 3.0, u); k.x = lerp(624, 628, u); k.y = lerp(1040, 1032, u); }   // the first push is quick off the mark
  const sh = shake(tt, 2.6 * pulseOf(tt, [c.two2, c.cant], 0.25), 26, 3);
  k.sx = sh[0]; k.sy = sh[1];
  return k;
}
function roomDraw(t, o) {
  roomBack(o.cam, t);
  const Hh = vsHero(o.cam, t, o.A);
  applyCam(o.cam);
  if (o.after) o.after(Hh);
  return Hh;
}

// ---------------------------------------------------------------- small graphics (screen space)
// a small filled tag
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

// ================================================================ shots
SC.hook = (lt, t, shot) => {
  const c = cu(), S = hookA(t), cam = hookCam(t);
  const Hh = roomDraw(t, { cam, A: S.A });
  // the heart between the middle and ring tips (they are holding hands)
  const hk = popK(t, c.hands - 0.05, c.their - 0.05, 0.14, 0.12);
  if (hk > 0.01 && Hh.P) {
    const tm = Hh.P.tip.M, tr = Hh.P.tip.R, p = Hh.hp([(tm[0] + tr[0]) / 2, Math.min(tm[1], tr[1]) - 22 - 30 * ramp(t, c.under, c.their, E.inOutSine)]);
    const P = toScreen(cam, p[0], p[1]);
    heartIcon(P[0], P[1] - 6 * Math.sin(t * 6), 1.35 * E.outBack(hk, 2), 1);
  }
  // NOPE marks on the wrong splits
  burstWord('NOPE', 840, 600, 92, popK(t, c.two1 + 0.08, c.and1 - 0.02, 0.1, 0.1), '#FF5A6E', '#FFFFFF', 0.12, 5);
  return { glow: 0.85, flash: 0.06 * bumpAt(t, c.cant, 8) };
};
SC.cords = (lt, t, shot) => {
  const c = cu(), S = hookA(t), cam = hookCam(t);
  const Hh = roomDraw(t, { cam, A: S.A });
  // STRAP: a tag with a leader to the clasped hands
  const k = popK(t, c.little - 0.05, c.strap_end + 0.25, 0.12, 0.12);
  if (k > 0.01 && Hh.P) {
    const p = Hh.hp(Hh.P.strap), P = toScreen(cam, p[0], p[1]);
    thinLeader([P[0] - 190, P[1] + 170], [P[0], P[1] + 8], k, '#C8A8FF');
    tagPill('STRAP', P[0] - 190, P[1] + 200, '#C8A8FF', k, 48);
  }
  return { glow: 0.9 };
};

// placeholder shots (built next)
// ================================================================ the brain: the window on his forehead, the room inside
// the brain's room: lit by its screen
const ROOM_LIGHT = { ...LIGHTS.screen, pool: 0.3, halo: 0, rim: [1.0, 0.55, 0.85] };
const WIN = { y: -52, r: 30 };                                 // head units
const ROOM_F = [540, 1000];                                    // the room point at the middle of the window
const LV = { y: 1352, xs: [300, 450, 630, 780], ord: ['I', 'M', 'R', 'L'], names: ['INDEX', 'MIDDLE', 'RING', 'PINKY'], len: 122 };
const SCR2 = [190, 455, 700, 545];                             // the brain's screen (room space)
const BRN2 = { x: 540, y: 1112, s: 0.66 };                     // the brain, behind the levers
// four levers on the desk, one per finger; MIDDLE and RING taped together. o: {ang: {I, M, R, L} (rad, + = pulled toward
// us), tape 0..1, team 0..1 (the word on the tape), glow}
function leverPanel(t, o = {}) {
  const c = ctx, ang = o.ang || {};
  // the panel
  rrect(c, 200, LV.y - 30, 680, 150, 24); c.fillStyle = '#2A1A3E'; c.fill();
  rrect(c, 200, LV.y - 30, 680, 16, 8); c.fillStyle = '#4A3266'; c.fill();
  const tops = {};
  LV.ord.forEach((k, i) => {
    const x = LV.xs[i], a = ang[k] || 0, L = LV.len;
    // pulled toward us: the stick tips forward, so it looks shorter and its knob comes down and grows
    const top = [x, LV.y + 30 - Math.cos(a) * L + 26 * Math.sin(a)];
    tops[k] = top;
    rrect(c, x - 26, LV.y + 18, 52, 26, 10); c.fillStyle = '#140C20'; c.fill();             // the slot
    line(c, x, LV.y + 30, top[0], top[1], 15, '#B9BED6');                                  // the stick
    const col = k === 'M' ? '#FF9A3C' : k === 'R' ? '#FFD447' : '#7FE9FF';
    circle(c, top[0], top[1], 27 + 8 * Math.sin(a), col);                                    // the knob
    paint(() => {
      circle(c, top[0] - 8, top[1] - 9, 7, 'rgba(255,255,255,0.55)');
      c.font = '900 25px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(220,210,255,0.92)';
      c.fillText(LV.names[i], x, LV.y + 82);
    });
    softDot(gctx, top[0], top[1], 38, col, 0.14 + 0.3 * (o.glow || 0) * (k === 'M' || k === 'R' ? 1 : 0));
  });
  // the tape round the middle and ring sticks
  const tk = clamp(o.tape === undefined ? 1 : o.tape);
  if (tk > 0.01) {
    const a = tops.M, b = tops.R, ya = lerp(LV.y + 30, a[1], 0.55), yb = lerp(LV.y + 30, b[1], 0.55);
    const xa = lerp(LV.xs[1], a[0], 0.55), xb = lerp(LV.xs[2], b[0], 0.55);
    c.save(); c.lineCap = 'butt';
    line(c, xa - 14, ya, lerp(xa - 14, xb + 14, tk), lerp(ya, yb, tk), 34, '#9A78E0');
    c.restore();
    paint(() => {
      for (let i = 1; i < 6; i++) { const u = i / 6 * tk; line(c, lerp(xa, xb, u) - 3, lerp(ya, yb, u) - 14, lerp(xa, xb, u) + 3, lerp(ya, yb, u) + 14, 2, 'rgba(60,30,110,0.45)'); }
      const tm = clamp(o.team || 0);
      if (tm > 0.01) {
        c.save(); c.translate((xa + xb) / 2, (ya + yb) / 2); const s = E.outBack(tm, 2.4); c.scale(s, s);
        c.font = '400 40px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 7; c.strokeStyle = '#1C0F33'; c.strokeText('TEAM', 0, 2);
        c.fillStyle = '#FFFFFF'; c.fillText('TEAM', 0, 2); c.restore();
      }
    });
  }
  return tops;
}
// his hand on the brain's screen: the back of it, the middle and ring fingers moving as one
function handScreen(t, o = {}) {
  const c = ctx, [sx, sy, sw, sh] = SCR2;
  rrect(c, sx + sw / 2 - 26, sy - 90, 52, 100, 8); c.fillStyle = '#1A1228'; c.fill();
  rrect(c, sx - 20, sy - 20, sw + 40, sh + 40, 30); c.fillStyle = '#211830'; c.fill();
  rrect(c, sx - 20, sy - 20, sw + 40, 12, 6); c.fillStyle = '#3A2C52'; c.fill();
  rrect(c, sx, sy, sw, sh, 16); c.fillStyle = '#121C44'; c.fill();
  paint(() => {
    c.save(); rrect(c, sx, sy, sw, sh, 16); c.clip();
    for (let x = sx + 40; x < sx + sw; x += 80) line(c, x, sy, x, sy + sh, 2, 'rgba(120,150,255,0.07)');
    for (let y = sy + 40; y < sy + sh; y += 80) line(c, sx, y, sx + sw, y, 2, 'rgba(120,150,255,0.07)');
    c.save(); c.translate(540, sy + sh - 34); c.scale(2.6, 2.6);
    vsHand(c, VSPAL, { view: 1, spread: o.spread || {}, glowM: o.glow || 0, glowR: o.glow || 0, tremble: o.tremble || 0 }, t);
    c.restore();
    c.restore();
    c.font = '900 34px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(170,190,255,0.9)';
    c.fillText('YOUR HAND', sx + sw / 2, sy - 50);
  });
  softDot(gctx, sx + sw / 2, sy + sh / 2, 520, '#5A78FF', 0.14);
}
// the brain's room (room space; call fmView first)
function leverRoom(t, o = {}) {
  fmRoom(t);
  handScreen(t, o.screen || {});
  fmDesk(1470, t);
  actor(() => erBrain(ctx, BRN2.x, BRN2.y, BRN2.s, t, o.brain || {}));
  return leverPanel(t, o.levers || {});
}
// draw the room inside a round window at screen point P, radius R (screen px); s = the room's scale inside it
function roomWindow(P, R, s, t, o) {
  if (R < 1) return;
  screenSpace();
  // an opaque disc first, outside any clip: the light engine then knows this is a new thing in front of his head
  ctx.beginPath(); ctx.arc(P[0], P[1], R, 0, 7); ctx.fillStyle = '#2B1440'; ctx.fill();
  ctx.save(); gctx.save();
  ctx.beginPath(); ctx.arc(P[0], P[1], R, 0, 7); ctx.clip();
  gctx.beginPath(); gctx.arc(P[0], P[1], R, 0, 7); gctx.clip();
  fmView({ s, x: P[0] - ROOM_F[0] * s, y: P[1] - ROOM_F[1] * s });
  leverRoom(t, o);
  ctx.restore(); gctx.restore();
  screenSpace();
  paint(() => { ctx.beginPath(); ctx.arc(P[0], P[1], R, 0, 7); ctx.lineWidth = Math.max(4, R * 0.05); ctx.strokeStyle = 'rgba(255,170,220,0.95)'; ctx.stroke(); });
}
// the room's state at video time t
function leverState(t) {
  const c = cu();
  const pull = ramp(t, c.usually - 0.05, c.moves + 0.1, E.inOutCubic);                 // the brain pulls MIDDLE: RING comes too
  const wag = ramp(t, c.team - 0.1, c.team + 0.1) * Math.sin((t - c.team) * 11) * 0.5;  // and again, as a team
  const a = 1.0 * pull * (1 - 0.5 * ramp(t, c.team - 0.1, c.team + 0.1)) + 0.5 * wag;
  const brain = {
    mood: t < c.usually ? 'calm' : t < c.team ? 'think' : 'grin', look: t < c.usually ? [0, 0.4] : [0.3, 0.9],
    armL: [lerp(-176, (LV.xs[1] - BRN2.x) / BRN2.s, pull), lerp(118, (LV.y + 30 - Math.cos(a) * LV.len + 26 * Math.sin(a) - BRN2.y) / BRN2.s, pull)],
    armR: [lerp(176, (LV.xs[2] - BRN2.x) / BRN2.s, pull), lerp(118, (LV.y + 30 - Math.cos(a) * LV.len + 26 * Math.sin(a) - BRN2.y) / BRN2.s, pull)],
  };
  return {
    brain,
    levers: { ang: { I: 0, M: a, R: a, L: 0 }, tape: 1, team: ramp(t, c.team - 0.05, c.team + 0.2), glow: ramp(t, c.moves - 0.1, c.moves + 0.2) },
    screen: { spread: { M: -0.22 * a, R: -0.22 * a }, glow: ramp(t, c.moves - 0.1, c.moves + 0.2) },
  };
}
SC.brain = (lt, t, shot) => {
  const c = cu(), DIVE = 0.6, ro = leverState(t);
  if (lt < DIVE) {
    // the dive: from the hand to the window on his forehead, and through it
    const u = lt / DIVE, S = hookA(t), cam0 = hookCam(t);
    const st0 = vsSt(S.A), FH = vsHeadPt(st0, 0, WIN.y);
    const camA = { x: lerp(cam0.x, FH[0] + 30, E.inOutCubic(clamp(u * 1.6))), y: lerp(cam0.y, FH[1] + 30, E.inOutCubic(clamp(u * 1.6))), zoom: lerp(cam0.zoom, 3.6, E.inOutCubic(clamp(u * 1.6))), rot: 0 };
    const k = 1 + 6 * E.inCubic(clamp((u - 0.35) / 0.65));
    const cam = scaledCam(camA, FH, k);
    roomDraw(t, { cam, A: S.A });
    const P0 = toScreen(cam, FH[0], FH[1]);
    const open = ramp(u, 0.1, 0.4, E.outBack);
    const R = WIN.r * cam.zoom * open;
    const s = lerp((2 * WIN.r * camA.zoom) / 1040 * k, 1, E.inOutCubic(clamp((u - 0.35) / 0.65)));
    const P = [lerp(P0[0], ROOM_F[0], E.inOutCubic(clamp((u - 0.35) / 0.65))), lerp(P0[1], ROOM_F[1], E.inOutCubic(clamp((u - 0.35) / 0.65)))];
    roomWindow(P, Math.max(R, 1), s, t, ro);
    return { glow: 0.85, zblur: 0.22 * E.inCubic(clamp((u - 0.4) / 0.6)), zcx: P[0], zcy: P[1], capY: lerp(1330, 1580, ramp(u, 0.6, 1)) };
  }
  const D = shot.end - shot.start;
  const z = 1.0 + 0.05 * (lt - DIVE) / D, F = [540, 1000];
  fmView({ s: z, x: 540 - F[0] * z, y: 1000 - F[1] * z });
  leverRoom(t, ro);
  return { glow: 0.85, flash: 0.2 * (1 - clamp((lt - DIVE) / 0.2)), capY: 1580 };
};
// ================================================================ the lab: the study's glove, the ranking
const LAB_LIGHT = { ...LIGHTS.screen, key: [-0.2, -0.5, 0.84], pool: 0.35, halo: 0, rim: [0.5, 0.85, 1.0], rimAmt: 0.7 };
const LAB_MON = [96, 470, 888, 830];                           // the monitor's screen (x, y, w, h), screen space
// a little tombstone, RIP (screen space): dead last
function tombstone(x, y, s, k) {
  const q = E.outBack(clamp(k), 2.4) * s;
  ctx.save(); ctx.translate(x, y + 30 * (1 - clamp(k))); ctx.scale(q, q); ctx.rotate(0.06);
  ctx.beginPath(); ctx.moveTo(-28, 34); ctx.lineTo(-28, -8); ctx.arc(0, -8, 28, Math.PI, 0); ctx.lineTo(28, 34); ctx.closePath();
  ctx.lineWidth = 6; ctx.strokeStyle = '#1A1426'; ctx.stroke(); ctx.fillStyle = '#A9B0C4'; ctx.fill();
  paint(() => { ctx.font = '900 19px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#3A3F55'; ctx.fillText('RIP', 0, 6);
    ellipse(ctx, 0, 36, 40, 7, '#4A7A3A'); });
  ctx.restore();
}
// a medal on a ribbon (screen space)
function medal(x, y, r, col, num, k) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.2);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sd * 4, -r * 0.6); ctx.lineTo(sd * r * 0.7, -r * 2.0); ctx.lineTo(sd * r * 0.15, -r * 2.0); ctx.closePath(); ctx.fillStyle = sd < 0 ? '#3D6BFF' : '#FF4D6D'; ctx.fill(); }
  circle(ctx, 0, 0, r + 3, '#1A1426'); circle(ctx, 0, 0, r, col);
  paint(() => { circle(ctx, 0, 0, r * 0.72, 'rgba(255,255,255,0.22)'); ctx.font = `900 ${r * 1.1}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#2A1A08'; ctx.fillText(num, 0, 2); });
  ctx.restore();
}
function labRoom(t) {
  const c = ctx;
  screenSpace();
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0A1428'); g.addColorStop(0.6, '#0E1E38'); g.addColorStop(1, '#060B16');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  // shelves with glassware, dim, out of focus
  c.save(); c.filter = 'blur(3px)';
  for (const y of [300, 1360]) { c.fillStyle = '#132440'; c.fillRect(0, y, W, 14); }
  for (let i = 0; i < 9; i++) { const x = 60 + i * 120; rrect(c, x, 1240 + (i % 2) * 30, 40, 120 - (i % 2) * 30, 10); c.fillStyle = ['#1E4A66', '#2C2F5A', '#1D5A52'][i % 3]; c.fill(); }
  c.restore();
  for (let i = 0; i < 9; i++) softDot(gctx, 80 + i * 120, 1300 + (i % 2) * 30, 30, ['#4DFFB4', '#7FE9FF', '#C8A8FF'][i % 3], 0.18);
  // the desk in front
  c.fillStyle = '#121A2C'; c.fillRect(0, 1450, W, 470);
  rrect(c, -20, 1440, W + 40, 22, 8); c.fillStyle = '#2A3656'; c.fill();
}
// the monitor: his gloved hand live on the left, the ranking on the right. o: {wig (the ring finger wiggling), along,
// rank 0..1 (rows pop in), worst 0..1 (MIDDLE and RING go red), ringQ 0..1 (RING is picked out), last 0..1 (the stamp)}
function labMonitor(t, o = {}) {
  const c = ctx, [x, y, w, h] = LAB_MON;
  screenSpace();
  rrect(c, x - 18, y - 18, w + 36, h + 36, 26); c.fillStyle = '#1B2236'; c.fill();
  rrect(c, x, y, w, h, 14); c.fillStyle = '#0D1734'; c.fill();
  const P = { ring: null };
  paint(() => {
    c.save(); rrect(c, x, y, w, h, 14); c.clip();
    for (let gx = x + 40; gx < x + w; gx += 80) line(c, gx, y, gx, y + h, 2, 'rgba(120,180,255,0.06)');
    for (let gy = y + 40; gy < y + h; gy += 80) line(c, x, gy, x + w, gy, 2, 'rgba(120,180,255,0.06)');
    c.font = '900 36px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#7FE9FF';
    c.fillText('MOVE ONE FINGER ALONE', x + w / 2, y + 56);
    c.font = '700 21px Montserrat'; c.fillStyle = 'rgba(170,200,255,0.72)';
    c.fillText('Häger-Ross & Schieber, J Neurosci 2000', x + w / 2, y + 96);
    // his gloved hand, live: the ring finger wiggles and drags the middle and the pinky with it
    const wg = o.wig || 0, al = o.along === undefined ? 0.6 : o.along;
    const H = { view: 1, glove: 1, spread: { R: wg, M: wg * al, L: wg * al * 0.9, I: wg * 0.08 }, deadR: o.sad || 0, love: 0 };
    c.save(); c.translate(x + 250, y + h - 110); c.scale(2.6, 2.6);
    const HP = vsHand(c, VSPAL, H, t);
    c.restore();
    // which fingers moved: small red arcs beside the middle and the pinky while the ring finger wiggles
    const mv = Math.abs(wg) > 0.02 ? 1 : 0;
    if (mv) for (const k of ['M', 'L']) {
      const tp = HP.tip[k], X = x + 250 + tp[0] * 2.6, Y = y + h - 110 + tp[1] * 2.6;
      for (const sd of [-1, 1]) { c.beginPath(); c.arc(X + sd * 34, Y + 14, 19, sd < 0 ? Math.PI * 0.6 : -Math.PI * 0.4, sd < 0 ? Math.PI * 1.4 : Math.PI * 0.4); c.lineWidth = 6; c.lineCap = 'round'; c.strokeStyle = '#FF5A6E'; c.stroke(); }
    }
    const tr = HP.tip.R; P.ring = [x + 250 + tr[0] * 2.6, y + h - 110 + tr[1] * 2.6];
    // the ranking
    const rows = [['1', 'THUMB', '#FFD447'], ['2', 'INDEX', '#D8DEEA'], ['3', 'PINKY', '#E09A5A'], ['4', 'MIDDLE', null], ['5', 'RING', null]];
    rows.forEach(([n, name, col], i) => {
      const k = clamp((o.rank || 0) * 5 - i * 0.7);
      if (k <= 0.01) return;
      const ry = y + 178 + i * 124, cx = x + 600, s = E.outBack(k, 2);   // rows x 531-861: clear of the buttons' column
      const red = (i >= 3 ? o.worst || 0 : 0), pick = i === 4 ? o.ringQ || 0 : 0;
      c.save(); c.translate(cx, ry); c.scale(s * (1 + 0.08 * pick), s * (1 + 0.08 * pick));
      rrect(c, -165, -46, 330, 92, 22); c.fillStyle = red > 0.5 ? '#5A1424' : '#16244A'; c.fill();
      c.lineWidth = 4; c.strokeStyle = red > 0.5 ? '#FF5A6E' : 'rgba(127,233,255,0.5)'; c.stroke();
      c.font = '900 41px Montserrat'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = red > 0.5 ? '#FF8A98' : '#FFFFFF';
      c.fillText(n, -140, 3);
      c.fillText(name, -96, 3);
      c.restore();
      if (col) medal(cx + 128 * s, ry, 26, col, n, k);
      if (i === 4 && (o.last || 0) > 0.01) tombstone(cx + 122, ry - 4, 0.85, o.last);
    });
    c.restore();
  });
  softDot(gctx, x + w / 2, y + h / 2, 560, '#4A7CFF', 0.12);
  return P;
}
SC.lab = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  labRoom(t);
  // the ring finger wiggles on a clock (and the neighbours come along)
  const wigOn = ramp(t, c.in_lab + 0.1, c.in_lab + 0.4) * (1 - ramp(t, c.dead - 0.1, c.dead + 0.1) * 0.85);
  const wig = 0.16 * wigOn * Math.sin((t - c.in_lab) * 13);
  labMonitor(t, {
    wig, along: 0.62,
    rank: ramp(t, c.theyre - 0.15, c.worst - 0.05),
    worst: ramp(t, c.worst - 0.02, c.worst + 0.15),
    ringQ: ramp(t, c.ringq - 0.05, c.ringq + 0.2, E.outBack),
    last: ramp(t, c.dead, c.dead + 0.25),
    sad: ramp(t, c.dead - 0.05, c.dead + 0.2, E.outBack),
  });
  // the camera: in from the whole monitor to the ranking on "the ring finger?"
  const pk = ramp(t, c.the_ring - 0.1, c.ringq_end, E.inOutCubic);
  return { glow: 0.85, flash: 0.15 * bumpAt(t, shot.start, 9), push: { k: lerp(1.0 + 0.03 * lt / D, 1.08, pk), cx: lerp(540, 760, pk), cy: lerp(900, 1010, pk) } };
};
// ================================================================ the 1960s TV studio: set the fingers by hand, off camera
// a silver costume tunic (no badge from any real show): only the clothes change
const STPAL = Object.assign({}, PAL, { coat: '#AFC0D2', coatSh: '#7F92A8', coatHi: '#E4EEF8', coatDk: '#4E5E72', strap: '#AFC0D2', strapSh: '#8C9EB4', pants: '#2A2F44', pantsSh: '#1C2030' });
const STUDIO_LIGHT = { ...LIGHTS.lanterns, key: [-0.25, -0.8, 0.55], keyTint: [1.08, 1.03, 0.94], rimFrom: [0.9, -0.5], rim: [0.6, 0.8, 1.0], rimAmt: 1.2, pool: 0.75, halo: 0.14 };
let STUDIO_C = null;
function initStudio() {
  const c0 = mkCanvas(1080, 1920), x = c0.getContext('2d');
  x.fillStyle = '#07070C'; x.fillRect(0, 0, 1080, 1920);
  // the set: a painted night sky with a planet, framed by flats
  x.save(); rrect(x, 150, 540, 780, 760, 30); x.clip();
  const g = x.createLinearGradient(0, 540, 0, 1300); g.addColorStop(0, '#1A0F3A'); g.addColorStop(1, '#3A1A4A');
  x.fillStyle = g; x.fillRect(150, 540, 780, 760);
  for (let i = 0; i < 70; i++) { const r = mulberry32(300 + i); circle(x, 150 + r() * 780, 540 + r() * 760, 1.5 + r() * 2.5, `rgba(255,255,255,${0.4 + 0.5 * r()})`); }
  ellipse(x, 800, 690, 70, 70, '#3FA88A'); ellipse(x, 786, 676, 46, 44, '#62C9A6');
  x.restore();
  for (const fx of [110, 930]) { rrect(x, fx - 40, 500, 80, 840, 10); x.fillStyle = '#2A2434'; x.fill(); }
  // a console along the bottom of the set, with lamps (they blink in the glow layer)
  rrect(x, 130, 1240, 820, 150, 26); x.fillStyle = '#3B3550'; x.fill();
  rrect(x, 130, 1240, 820, 26, 13); x.fillStyle = '#5A5274'; x.fill();
  // the studio floor
  x.fillStyle = '#121019'; x.fillRect(0, 1390, 1080, 530);
  STUDIO_C = mkCanvas(1080, 1920);
  const y = STUDIO_C.getContext('2d'); y.filter = 'blur(4px)'; y.drawImage(c0, 0, 0); y.filter = 'none';
}
function studioBack(cam, t) {
  const bc = { x: 540 + (cam.x - 540) * 0.4, y: 960 + (cam.y - 1100) * 0.4, zoom: 1.0 + 0.12 * (cam.zoom - 1.7), rot: 0 };
  screenSpace(); ctx.fillStyle = '#07070C'; ctx.fillRect(0, 0, W, H);
  applyCam(bc);
  ctx.drawImage(STUDIO_C, 0, 0);
  for (let i = 0; i < 10; i++) { const on = Math.sin(t * loopW(3 + (i % 3)) + i * 1.7) > 0.1; softDot(gctx, 190 + i * 78, 1310, 26, ['#FF5A6E', '#4DFFB4', '#FFD447'][i % 3], on ? 0.7 : 0.1); }
  softDot(gctx, 800, 690, 140, '#62C9A6', 0.12);
  // the studio's lamps: cones of light from above
  screenSpace();
  for (const [lx, ang] of [[150, 0.35], [930, -0.35]]) {
    gctx.save(); gctx.translate(lx * 0.5, 0); gctx.rotate(ang);
    const gg = gctx.createLinearGradient(0, 0, 0, 900); gg.addColorStop(0, 'rgba(255,236,200,0.22)'); gg.addColorStop(1, 'rgba(255,236,200,0)');
    gctx.fillStyle = gg; gctx.beginPath(); gctx.moveTo(-20, 0); gctx.lineTo(20, 0); gctx.lineTo(180, 900); gctx.lineTo(-180, 900); gctx.closePath(); gctx.fill(); gctx.restore();
  }
}
// an old studio camera on its pedestal, in the foreground (world units, about 520 tall at s = 1, facing right)
function tvCamera(x, y, s, t, tally) {
  const c = ctx;
  c.save(); c.translate(x, y); c.scale(s, s);
  actor(() => {
    rrect(c, -40, 120, 80, 420, 14); c.fillStyle = '#1C1D26'; c.fill();                  // the pedestal
    rrect(c, -170, -120, 300, 230, 26); c.fillStyle = '#4A4E5E'; c.fill();                // the body
    rrect(c, -170, -120, 300, 40, 20); c.fillStyle = '#5E6376'; c.fill();
    rrect(c, 130, -96, 70, 190, 18); c.fillStyle = '#2E313E'; c.fill();                    // the lens turret
    for (const [ly, r] of [[-50, 34], [10, 28], [62, 22]]) { rrect(c, 196, ly - r * 0.7, 80, r * 1.4, 10); c.fillStyle = '#20222C'; c.fill(); circle(c, 276, ly, r * 0.62, '#0E0F16'); }
    rrect(c, -250, -40, 90, 26, 12); c.fillStyle = '#2A2C38'; c.fill();                    // the handle
  });
  paint(() => {
    c.font = '900 34px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#C9CEDF'; c.fillText('TV-1', -20, 10);
    circle(c, 276 - 6, -56, 7, 'rgba(160,200,255,0.5)');
    circle(c, 60, -136, 14, tally > 0.5 ? '#FF3B4E' : '#5A1A22');
  });
  c.restore();
  if (tally > 0.5) softDot(gctx, x + 60 * s, y - 136 * s, 60 * s, '#FF3B4E', 0.8);
}
// the camera's frame: a dashed box with corner marks (world units); below its bottom edge is "off camera"
function camFrame(x0, y0, x1, y1, k, rec) {
  if (k <= 0.01) return;
  const c = ctx;
  paint(() => {
    c.save(); c.globalAlpha = 1;
    c.setLineDash([22, 16]); c.lineWidth = 6; c.strokeStyle = 'rgba(255,255,255,0.85)';
    c.strokeRect(lerp((x0 + x1) / 2, x0, k), lerp((y0 + y1) / 2, y0, k), (x1 - x0) * k, (y1 - y0) * k);
    c.setLineDash([]);
    for (const [cx, cy, sx, sy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) {
      if (k < 0.99) break;
      c.beginPath(); c.moveTo(cx, cy + sy * 46); c.lineTo(cx, cy); c.lineTo(cx + sx * 46, cy); c.lineWidth = 10; c.strokeStyle = '#FFFFFF'; c.stroke();
    }
    if (rec > 0.01 && k >= 0.99) {
      circle(c, x0 + 40, y0 + 42, 12, '#FF3B4E');
      c.font = '900 30px Montserrat'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = '#FFFFFF'; c.fillText('REC', x0 + 62, y0 + 43);
    }
    c.restore();
  });
}
// a clapperboard that snaps shut (screen space): TAKE 27
function clapper(x, y, s, k, shut) {
  if (k <= 0.01) return;
  const c = ctx;
  screenSpace();
  c.save(); c.translate(x, y); c.scale(s * E.outBack(clamp(k), 1.8), s * E.outBack(clamp(k), 1.8)); c.rotate(-0.06);
  rrect(c, -150, -10, 300, 190, 12); c.fillStyle = '#16161C'; c.fill();
  paint(() => {
    c.font = '900 40px Montserrat'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = '#F4F4F4';
    c.fillText('TAKE 27', -126, 60); c.font = '700 26px Montserrat'; c.fillText('SCENE 4  ·  SALUTE', -126, 118);
    line(c, -136, 88, 136, 88, 3, 'rgba(255,255,255,0.6)');
  });
  c.save(); c.translate(-150, -10); c.rotate(-0.55 * (1 - clamp(shut)));
  rrect(c, 0, -46, 300, 46, 8); c.fillStyle = '#F4F4F4'; c.fill();
  for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(14 + i * 50, -46); c.lineTo(40 + i * 50, -46); c.lineTo(22 + i * 50, 0); c.lineTo(-4 + i * 50, 0); c.closePath(); c.fillStyle = '#16161C'; c.fill(); }
  c.restore();
  c.restore();
}
function studioA(t) {
  const c = cu();
  const help = ramp(t, c.set - 0.25, c.set + 0.2, E.outCubic);               // the other hand comes up from below
  const pull = ramp(t, c.fingers3 - 0.1, c.hand1 + 0.1, E.inOutCubic);       // and pulls the two fingers over: the V
  const drop = ramp(t, c.off - 0.1, c.off + 0.3, E.inCubic);                 // then ducks out of the camera's frame
  const creep = ramp(t, c.camera_end + 0.25, c.camera_end + 0.6, E.inCubic); // and the V creeps shut again
  const early = 1 - ramp(t, c.set - 0.3, c.set);
  let face = lerpFace(VF.strain, VF.focus, ramp(t, c.set - 0.2, c.set + 0.1));
  face = lerpFace(face, VF.aww, ramp(t, c.off + 0.1, c.off + 0.35));
  face = lerpFace(face, VF.huh, creep);
  const H = { view: 0, split: Math.max(0.4 * early * ramp(t, c.even, c.even + 0.3), pull * (1 - creep)), stuck: early, tremble: 0.6 * early + 0.25 * creep, wrong: 0 };
  return { A: { face, H, help: drop < 0.98 && help > 0.01 ? { at: [22, -122], k: pull, drop } : null, pal: STPAL, tv: 0, ambient: 0.02,
    bob: Math.sin(t * 2.3), headDY: 1.5 * Math.sin(t * 2.3), headRot: 0.04 * ramp(t, c.off + 0.1, c.off + 0.4) },
    help, pull, drop, creep };
}
SC.studio = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, S = studioA(t);
  const out = ramp(t, c.actors - 0.2, c.reportedly + 0.3, E.inOutCubic);
  const cam = { x: lerp(624, 610, out), y: lerp(1030, 1070, out), zoom: lerp(2.7, 1.9, out) + 0.05 * (lt / D), rot: 0 };
  studioBack(cam, t);
  const Hh = vsHero(cam, t, S.A);
  applyCam(cam);
  // the camera's frame: his head and the raised hand; his chest and the helping hand are below it, off camera
  camFrame(440, 815, 805, 1090, ramp(t, c.reportedly - 0.1, c.set - 0.1, E.outCubic), 1);
  // the old camera in the foreground, its red light on
  tvCamera(lerp(250, 340, out), 1470, 0.75, t, Math.sin(t * 6) > -0.6 ? 1 : 0);
  // TAKE 27
  clapper(560, 1140, 1.4, popK(t, shot.start - 0.1, c.star + 0.25, 0.08, 0.14), ramp(t, shot.start + 0.12, shot.start + 0.2));
  // a sparkle on the perfect V while it is on camera
  const pk = popK(t, c.off + 0.25, c.camera_end + 0.3, 0.1, 0.1);
  if (pk > 0.01 && Hh.P) {
    const tm = Hh.P.tip.M, tr = Hh.P.tip.R, p = Hh.hp([(tm[0] + tr[0]) / 2, (tm[1] + tr[1]) / 2 + 30]), P = toScreen(cam, p[0], p[1]);
    screenSpace();
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.3; for (const cc of [ctx, gctx]) line(cc, P[0] + Math.cos(a) * 30, P[1] + Math.sin(a) * 30, P[0] + Math.cos(a) * (30 + 34 * pk), P[1] + Math.sin(a) * (30 + 34 * pk), 7, '#FFF2A8'); }
  }
  return { glow: 0.85, flash: 0.25 * bumpAt(t, shot.start + 0.16, 10) };
};
// ================================================================ the button: caught, with his other hand
function buttonA(t) {
  const c = cu(), tt = t - TL.duration, S = hookA(tt);
  const letGo = ramp(t, c.you_end + 0.12, c.you_end + 0.45, E.inCubic);           // he lets go: the hand drops away
  const snap = ramp(t, c.you_end + 0.3, c.you_end + 0.48, E.outBack);             // and the fingers spring back together
  const H = Object.assign({}, S.A.H, { view: 0, split: 1 - snap, stuck: 0, wrong: 0, tremble: 0.2 * (1 - snap), glass: 0, faces: 0, love: 0, lean: 0, glowM: 0, glowR: 0, strapPull: 0 });
  let face = lerpFace(VF.focus, VF.caught, ramp(t, c.using - 0.05, c.using + 0.12));
  face = lerpFace(face, VF.sheepish, ramp(t, c.arent - 0.1, c.arent + 0.2));
  face = lerpFace(face, VF.focus, ramp(t, c.you_end + 0.35, TL.duration - 0.45));
  const A = Object.assign({}, S.A, { face, H, armR: VS_ARM.up, tongue: 0, sweat: ramp(t, c.using, c.using + 0.25) * (1 - letGo),
    help: letGo < 0.98 ? { at: [22, -122], k: 1, drop: letGo } : null,
    headDY: S.A.headDY - 5 * bumpAt(t, c.using, 8), headRot: 0.05 * ramp(t, c.arent - 0.1, c.arent + 0.2) * (1 - letGo) });
  return { A, letGo, snap };
}
SC.button = (lt, t, shot) => {
  const c = cu(), B = buttonA(t), tt = t - TL.duration;
  const cam = hookCam(tt);
  const zin = ramp(t, c.using - 0.05, c.using + 0.25, E.outCubic) * (1 - ramp(t, c.you_end, c.you_end + 0.5, E.inOutCubic));
  cam.zoom *= 1 + 0.06 * zin; cam.x = lerp(cam.x, 600, 0.6 * zin);
  roomDraw(t, { cam, A: B.A });
  return { glow: 0.85, flash: 0.08 * bumpAt(t, c.using, 9) };
};
// the last 0.4 s: the hook at negative time, so the cut to frame 1 is one move
SC.loop = (lt, t, shot) => { const tt = t - TL.duration, S = hookA(tt), cam = hookCam(tt); roomDraw(t, { cam, A: S.A }); return { glow: 0.85 }; };

// ================================================================ the cover (src/cover.sh): the V, his strain, CAN YOU?
SC.cover = (lt, t) => {
  const face = { ...lerpFace(VF.strain, VF.wow, 0.35), lookX: 0.8, lookY: -0.35 };
  const A = { face, H: { view: 0, split: 1, tremble: 0 }, armR: VS_ARM.up, sweat: 1, tongue: 0, headRot: -0.03 };
  const cam = { x: 640, y: 1010, zoom: 3.05, rot: 0 };
  const Hh = roomDraw(1.0, { cam, A });
  // the gap, marked: a yellow arrow into the V
  if (Hh.P) {
    const a = vsAlong(Hh.P, 'M', 0.62), b = vsAlong(Hh.P, 'R', 0.62), p = Hh.hp([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]), P = toScreen(cam, p[0], p[1]);
    screenSpace();
    ctx.save(); ctx.translate(P[0], P[1] - 80); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const [w, col] of [[26, '#0B0B1A'], [14, '#FFD447']]) { ctx.beginPath(); ctx.moveTo(0, -70); ctx.lineTo(0, 40); ctx.moveTo(-34, 6); ctx.lineTo(0, 44); ctx.lineTo(34, 6); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.stroke(); }
    ctx.restore();
  }
  bigWord('CAN YOU?', 540, 1330, 190, '#FFD447', 1, -0.04);
  return { glow: 0.85, noCaptions: true };
};

setLights({ hook: TV_LIGHT, cords: TV_LIGHT, brain: (lt, t) => (lt < 0.5 ? TV_LIGHT(lt, t) : ROOM_LIGHT), lab: LAB_LIGHT, studio: STUDIO_LIGHT, button: TV_LIGHT, loop: TV_LIGHT, cover: TV_LIGHT });

function initScenes2() {
  initRoom();
  initStudio();
}
