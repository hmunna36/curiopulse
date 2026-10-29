// Does Your Finger Move When You Bend Your THUMB? 👍 Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds
// inside the shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
// The world: wrist-tendon's living room seen from the TV (wtroom.js), his hand from tfhand.js, the gorilla from gorilla.js.
'use strict';

const cu = () => TLd.cues;
const pulseOf = (t, times, len = 0.16) => times.reduce((m, f) => Math.max(m, clamp((t - f) / 0.03) * clamp((f + len - t) / 0.05)), 0);
const bumpAt = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);
const easeTo = (t, a, b, e = E.inOutSine) => ramp(t, a, b, e);

// ---------------------------------------------------------------- the light (reference/visual.md "The light")
// the living room at night: the TV in front of him is the key (cool, from the front, a little to the right), the warm
// floor lamp far left behind him is the rim (vulcan-salute's, wrist-tendon's)
const TV_LIGHT = (lt, t) => ({ ...LIGHTS.night, key: [0.30, -0.42, 0.85], keyTint: [0.92 + 0.04 * tvFlick(t), 0.98, 1.08 + 0.05 * tvFlick(t)],
  rimFrom: [-0.85, -0.35], rim: [1.0, 0.70, 0.42], rimAmt: 1.2, pool: 0.62, halo: 0.12, haloColor: [0.6, 0.75, 1.0], dof: 0.8 });
setLights({ hook: TV_LIGHT, sidekick: TV_LIGHT, glass: TV_LIGHT, pull: TV_LIGHT, solo: TV_LIGHT, gorilla: TV_LIGHT, ape: TV_LIGHT,
  button: TV_LIGHT, loop: TV_LIGHT, cover: TV_LIGHT });

// ---------------------------------------------------------------- his faces (eyes on the raised hand, screen right)
const VF = {
  focus: { eyeOpen: 1.05, pupil: 0.95, lookX: 0.85, lookY: -0.35, browY: 0.5, browTilt: 0.6, mouth: 'flat', mouthOpen: -0.2, blink: 0, cross: 0 },
  wow: { eyeOpen: 1.3, pupil: 0.65, lookX: 0.8, lookY: -0.3, browY: 1.45, browTilt: 0.3, mouth: 'o', mouthOpen: 0.55, blink: 0, cross: 0 },
  pleased: { eyeOpen: 1.05, pupil: 0.95, lookX: 0.8, lookY: -0.3, browY: 1.0, browTilt: -0.4, mouth: 'grin', mouthOpen: 0.45, blink: 0, cross: 0 },
  inspect: { eyeOpen: 1.12, pupil: 0.85, lookX: 0.75, lookY: -0.2, browY: 0.8, browTilt: 0.7, mouth: 'o', mouthOpen: 0.25, blink: 0, cross: 0 },
  huh: { eyeOpen: 1.2, pupil: 0.8, lookX: 0.8, lookY: -0.3, browY: 1.2, browTilt: 0.9, mouth: 'wavy', mouthOpen: 0.35, blink: 0, cross: 0 },
  // looking at the gorilla / his other hand (screen left)
  sideL: { eyeOpen: 1.0, pupil: 0.9, lookX: -0.9, lookY: -0.05, browY: 0.7, browTilt: 0.9, mouth: 'flat', mouthOpen: -0.1, blink: 0, cross: 0 },
  wowL: { eyeOpen: 1.3, pupil: 0.65, lookX: -0.85, lookY: -0.2, browY: 1.45, browTilt: 0.3, mouth: 'o', mouthOpen: 0.5, blink: 0, cross: 0 },
  grinL: { eyeOpen: 1.05, pupil: 0.95, lookX: -0.85, lookY: -0.1, browY: 1.1, browTilt: -0.4, mouth: 'grin', mouthOpen: 0.55, blink: 0, cross: 0 },
  shrugL: { eyeOpen: 1.05, pupil: 0.95, lookX: -0.7, lookY: 0, browY: 1.3, browTilt: -0.2, mouth: 'wavy', mouthOpen: 0.3, blink: 0, cross: 0 },
  lookUpL: { eyeOpen: 1.1, pupil: 0.9, lookX: -0.8, lookY: -0.45, browY: 1.0, browTilt: 0.5, mouth: 'flat', mouthOpen: 0.05, blink: 0, cross: 0 },
};

// ---------------------------------------------------------------- small graphics (screen space; vulcan-salute's)
function tagPill(txt, x, y, col, k, size = 40, ink = '#0B0B1A') {
  if (k <= 0.01) return;
  const q = E.outBack(clamp(k), 1.8);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(q, q);
  ctx.font = `900 ${size}px Montserrat`; const w = ctx.measureText(txt).width + size * 1.1, hh = size * 1.5;
  rrect(ctx, -w / 2, -hh / 2, w, hh, hh / 2); ctx.fillStyle = col; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(10,10,20,0.85)'; ctx.stroke();
  ctx.fillStyle = ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, size * 0.05);
  ctx.restore();
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); rrect(gctx, x - w / 2, y - hh / 2, w, hh, hh / 2); gctx.fillStyle = rgba(col, 0.35 * clamp(k)); gctx.fill(); gctx.restore();
}
function burstWord(txt, x, y, r, k, col = '#FFD447', ink = '#0B0B1A', rot = -0.08, seed = 3) {
  if (k <= 0.01) return;
  const q = E.outBack(clamp(k), 2.2), rng = mulberry32(seed);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(q, q);
  ctx.beginPath();
  for (let i = 0; i < 22; i++) { const a = (i / 22) * Math.PI * 2, rr = r * (i % 2 ? 0.74 + 0.08 * rng() : 1 + 0.06 * rng()); ctx.lineTo(Math.cos(a) * rr * 1.3, Math.sin(a) * rr); }
  ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(10,10,20,0.9)'; ctx.stroke();
  ctx.font = `400 ${r * 0.62}px Anton`; ctx.fillStyle = ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, r * 0.04);
  ctx.restore();
}
// a dashed ring round a screen point
function tfRing(P, k, t, col = '#7FE9FF', r0 = 60, rx = 1, ry = 1) {
  if (k <= 0.01) return;
  const r = r0 * E.outBack(clamp(k), 1.8);
  screenSpace();
  paint(() => {
    ctx.save(); ctx.translate(P[0], P[1]); ctx.rotate(t * 0.8);
    ctx.setLineDash([16, 12]); ctx.beginPath(); ctx.ellipse(0, 0, r * rx, r * ry, 0, 0, 7); ctx.lineWidth = 6; ctx.strokeStyle = col; ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
  });
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); gctx.beginPath(); gctx.ellipse(P[0], P[1], r * rx, r * ry, 0, 0, 7); gctx.lineWidth = 12; gctx.strokeStyle = rgba(col, 0.45 * clamp(k)); gctx.stroke(); gctx.restore();
}
// motion marks: a few short curved strokes beside a point (a finger that moved)
function tfMarks(P, k, ang, col = '#FFFFFF', n = 3, len = 34) {
  if (k <= 0.01 || k >= 1) return;
  screenSpace();
  paint(() => {
    for (let i = 0; i < n; i++) {
      const a = ang + (i - (n - 1) / 2) * 0.38, r0 = 30 + 18 * k, r1 = r0 + len * (1 - k * 0.6);
      line(ctx, P[0] + Math.cos(a) * r0, P[1] + Math.sin(a) * r0, P[0] + Math.cos(a) * r1, P[1] + Math.sin(a) * r1, 5, rgba(col, 0.95 * (1 - k)));
    }
  });
}
// a cone of light from above onto a screen point (the thumb's solo)
function tfSpot(P, k) {
  if (k <= 0.01) return;
  screenSpace();
  const top = [P[0] + 120, 380], w0 = 50, w1 = 150;
  const g = ctx.createLinearGradient(top[0], top[1], P[0], P[1]);
  g.addColorStop(0, rgba('#FFF6D8', 0.42 * k)); g.addColorStop(1, rgba('#FFF6D8', 0.08 * k));
  ctx.beginPath(); ctx.moveTo(top[0] - w0, top[1]); ctx.lineTo(top[0] + w0, top[1]); ctx.lineTo(P[0] + w1, P[1] + 40); ctx.lineTo(P[0] - w1, P[1] + 40); ctx.closePath();
  ctx.fillStyle = g; ctx.fill();
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0);
  gctx.beginPath(); gctx.moveTo(top[0] - w0, top[1]); gctx.lineTo(top[0] + w0, top[1]); gctx.lineTo(P[0] + w1, P[1] + 40); gctx.lineTo(P[0] - w1, P[1] + 40); gctx.closePath();
  gctx.fillStyle = rgba('#FFE9B0', 0.18 * k); gctx.fill(); gctx.restore();
  softDot(gctx, P[0], P[1] + 20, 170, '#FFE9B0', 0.22 * k);
}

// ================================================================ the test hand over the whole Short (his left, screen right)
// One state for every shot, valid at negative time (the loop: the last 0.4 s, on their way into frame 1).
function handState(t) {
  const c = cu(), D = TLd.duration;
  let tb, curl = null, face = 0, mood = 'happy', look = 0.6, glass = 0, strap = 0, ghost = 0, strapGlow = 0, pullI, wave = 0;
  if (t < 0) {                                                   // the loop
    tb = lerp(0.12, 0.55, ramp(t, -0.40, 0, E.inOutSine));
  } else {
    tb = lerp(0.55, 1, ramp(t, 0, 0.40, E.outCubic));             // frame 1: already bending, it lands
    tb = lerp(tb, 0.25, easeTo(t, c.thumb + 0.25, c.thumb + 0.6));                      // he lets go ("...thumb")
    tb = lerp(tb, 1, easeTo(t, c.across - 0.08, c.palm_end - 0.05, E.inOutCubic));      // "...all the way across your palm."
    tb = lerp(tb, 0.35, easeTo(t, c.moved_end + 0.30, c.moved_end + 0.70));             // the sidekick shows off: let go...
    tb = lerp(tb, 1, easeTo(t, c.clingy - 0.12, c.clingy + 0.35));                      // ...and bend: it comes along
    tb = lerp(tb, 0.30, easeTo(t, c.glass_in - 0.30, c.glass_in));                      // "Bend it again..."
    tb = lerp(tb, 1, easeTo(t, c.again + 0.05, c.again_end, E.inOutCubic));
    tb = lerp(tb, 0.15, easeTo(t, c.together_end - 0.10, c.pulls - 0.02));               // ready to pull
    tb = lerp(tb, 1, easeTo(t, c.tug, c.pulls_end - 0.15, E.inOutCubic));              // "Thumb pulls..."
    tb = lerp(tb, 0.12, easeTo(t, c.nostrap - 0.05, c.nostrap_end));                   // "No strap?"
    tb = lerp(tb, 1, easeTo(t, c.goes - 0.05, c.solo + 0.25, E.inOutCubic));            // "...goes solo."
    tb = lerp(tb, 0.25, easeTo(t, c.gorillas - 0.2, c.gorillas + 0.2));
    tb = lerp(tb, 1, easeTo(t, c.so - 0.05, c.strap3 + 0.1));                           // his strap hand again
    tb = lerp(tb, 0.2, easeTo(t, c.maybe - 0.1, c.maybe + 0.3));
    tb = lerp(tb, 1, easeTo(t, c.leftover - 0.05, c.leftover + 0.45, E.inOutCubic));   // both bend together
    tb = lerp(tb, 0.35, easeTo(t, c.now, c.now + 0.4));                                 // he puts up the other hand
    tb = lerp(tb, 0.12, easeTo(t, D - 0.85, D - 0.40));                                 // into the loop
  }
  // the pointer follows the thumb (the strap): its tip curls once the thumb is most of the way across
  const lagTb = tb;
  curl = clamp((lagTb - 0.55) / 0.38);
  if (t >= c.tug - 0.05 && t < c.nostrap) {                      // "Thumb pulls... pointer follows.": the strap takes up its slack first
    pullI = ramp(t, c.drag, c.drag + 0.35, E.outBack);
    curl = Math.min(curl, pullI);
  }
  if (t >= c.nostrap && t < c.gorillas - 0.2) curl = Math.min(curl, 1 - ramp(t, c.nostrap - 0.05, c.nostrap + 0.15));   // no strap: it stays
  if (t >= c.now - 0.1) curl *= 1 - ramp(t, c.now - 0.1, c.now + 0.3);   // the button: this hand rests
  // the sidekick's face
  if (t >= 0) {
    face = ramp(t, c.eyes, c.eyes + 0.25) * (1 - ramp(t, c.grin - 0.05, c.grin + 0.2));
    mood = t > c.clingy - 0.1 && t < c.heart + 0.5 ? 'love' : 'happy';
    if (t > c.whee - 0.1 && t < c.nostrap) mood = 'whee';
    if (t > c.nostrap + 0.1 && t < c.gorillas) mood = 'sad';
    if (t > c.leftover && t < c.now) mood = 'whee';
    look = t > c.nostrap ? 0.9 : 0.6;
    wave = t > c.solo && t < c.gorillas ? 1 : 0;
  }
  // the glass, the strap
  if (t >= c.glass_in - 0.05 && t < c.gorillas) glass = ramp(t, c.glass_in, c.glass_in + 0.8, E.inOutSine);
  if (t >= c.so - 0.1 && t < c.now - 0.05) glass = 1;
  strap = t >= c.strap_pop ? E.outBack(ramp(t, c.strap_pop, c.strap_pop + 0.3), 2) : 0;
  if (t >= c.nostrap && t < c.gorillas) ghost = ramp(t, c.ghost, c.ghost + 0.3);
  strapGlow = Math.max(pulseOf(t, [c.strap_pop + 0.05, c.together], 0.45), t >= c.so ? pulseOf(t, [c.glow3], 0.9) : 0);
  const pull = clamp((tb - 0.15) / 0.85);
  const HD = { view: 0, tb, curl, pull, glass, strap, ghost, strapGlow, face, mood, look, wave, link: 1 };
  if (pullI !== undefined) HD.pullI = pullI;
  if (t >= c.nostrap && t < c.gorillas) HD.pullI = 0;
  return HD;
}
// the other hand (his right, screen left) in the button: comes up, its thumb bends alone (no strap: "less ape")
function otherHand(t) {
  const c = cu();
  const up = ramp(t, c.raise, c.raise + 0.42, E.inOutCubic) * (1 - ramp(t, TLd.duration - 1.1, TLd.duration - 0.72, E.inOutSine));
  const tb = ramp(t, c.solo2, c.solo2 + 0.45, E.inOutCubic) * (1 - ramp(t, c.ape2_end, c.ape2_end + 0.35));
  return { up, HD: { view: 0, tb, curl: 0, face: 0 } };
}

// ================================================================ the room, him and the gorilla
// gorilla's place (world): its head's middle, scale; it stands behind him on his right (the screen's left)
const GOR_AT = { x: 336, y: 884, s: 1.0 };
function gorillaState(t) {
  const c = cu();
  const o = { look: 0.7, blink: pulseOf(t, [c.gorillas + 0.1, c.ptrs + 0.2, c.maybe, c.might], 0.13), brow: 0, grin: 0, huff: 0, nod: 0, arm: 0, drum: 0 };
  // in the gorilla shot: its right hand (screen left) up, palm to us, glass: one string that forks
  if (t >= c.gorillas - 0.3 && t < c.so) {
    o.arm = ramp(t, c.gorillas - 0.25, c.gorillas + 0.25, E.inOutCubic);
    const fork = 0.5 + 0.5 * ramp(t, c.fork, c.fork + 0.5, E.inOutSine);
    const tb = ramp(t, c.fold, c.fold + 0.4, E.inOutCubic);
    o.hand = { tb, curl: tb, glass: ramp(t, c.gorillas + 0.1, c.gorillas + 0.7), fork, pull: tb };
    o.look = -0.6; o.brow = 0.3 * ramp(t, c.branch, c.branch + 0.3);
    o.grin = 0.6 * ramp(t, c.fold + 0.2, c.fold + 0.45);
  }
  if (t >= c.so) {
    o.look = 0.9;                                                // it looks at his hand
    o.brow = 0.6 * ramp(t, c.leftover, c.leftover + 0.3);
    o.grin = ramp(t, c.ape1 - 0.1, c.ape1 + 0.15) * (1 - ramp(t, c.now + 0.2, c.now + 0.5));
    o.drum = ramp(t, c.drum - 0.12, c.drum + 0.02) * (1 - ramp(t, c.now - 0.05, c.now + 0.25));
    o.drumT = t - c.drum;
    o.nod = 0.06 * Math.sin((t - c.drum) * 20) * o.drum;
  }
  if (t >= c.now) {                                              // the button: it watches his other hand, then huffs
    o.look = 0.95;
    o.huff = ramp(t, c.less - 0.1, c.less + 0.2);
    o.brow = 0.5 * ramp(t, c.solo2, c.solo2 + 0.3) * (1 - o.huff);
  }
  return o;
}
function drawGorilla(lc, t, o) {
  let G = null;
  actor(() => { G = tfGorilla(lc, GOR_AT.x, GOR_AT.y, GOR_AT.s, t, Object.assign({ armSide: -1 }, o)); });
  return G;
}
// his whole state for a time (face, arms, the hands); `gor` = draw the gorilla behind him
function heroA(t, o = {}) {
  const c = cu();
  const HD = handState(t);
  const OH = otherHand(t);
  let face = VF.focus;
  if (t >= 0) {
    face = lerpFace(face, VF.wow, pulseOf(t, [c.curl0 - 0.1, c.ring], 0.55));
    face = lerpFace(face, VF.pleased, ramp(t, c.eyes, c.eyes + 0.3) * (1 - ramp(t, c.again - 0.2, c.again)));
    face = lerpFace(face, VF.inspect, ramp(t, c.see, c.see + 0.3) * (1 - ramp(t, c.nostrap, c.nostrap + 0.3)));
    face = lerpFace(face, VF.huh, ramp(t, c.nostrap, c.nostrap + 0.3));
    if (t >= c.gorillas - 0.2) face = lerpFace(VF.huh, VF.sideL, ramp(t, c.gorillas - 0.2, c.gorillas + 0.15));
    if (t >= c.so) face = lerpFace(VF.inspect, VF.sideL, ramp(t, c.maybe, c.maybe + 0.3));
    if (t >= c.ape1 - 0.1) face = lerpFace(face, VF.wowL, ramp(t, c.ape1 - 0.1, c.ape1 + 0.15));
    if (t >= c.now - 0.1) face = lerpFace(VF.lookUpL, VF.grinL, ramp(t, c.solo2 + 0.2, c.solo2 + 0.5));
    if (t >= c.grin) face = lerpFace(face, VF.focus, ramp(t, TLd.duration - 0.8, TLd.duration - 0.45));
  }
  face = { ...face, blink: Math.max(face.blink || 0, pulseOf(t, [c.palm_end + 0.2, c.sidekick_end + 0.2, c.strings_end + 0.15, c.solo_end + 0.1, c.hand_end + 0.1], 0.12)) };
  const armL = OH.up > 0.01 ? armMix(WT_ARM.restL, { e: [-152, -258], w: [-158, -386] }, OH.up) : WT_ARM.restL;
  const A = {
    face, HR: HD, armR: WT_ARM.up, armL,
    headDX: 3 * Math.sin(t * loopW(1.7)), headDY: 1.2 * Math.sin(t * loopW(2.3)), bob: 1.0 * Math.sin(t * loopW(2.3)),
    headRot: 0.04 * Math.sin(t * loopW(1.1)) - 0.06 * (t >= c.gorillas - 0.2 && t >= 0 ? 1 : 0),
    handRot: -0.04 + 0.02 * Math.sin(t * loopW(2.1)),
  };
  if (OH.up > 0.01) { A.HL = Object.assign({}, OH.HD); A.handRotL = 0.04; }
  if (o.gor) { const go = gorillaState(t); A.pre = (lc) => { o.G = drawGorilla(lc, t, go); }; }
  return { A, HD, OH };
}
function roomDraw(t, cam, A) {
  roomBack(cam, t);
  const Hh = wtHero(cam, t, A);
  applyCam(cam);
  return Hh;
}
// screen point of a hand-unit point of his test hand
const handScr = (cam, Hh, q) => { const p = Hh.hp(q); return toScreen(cam, p[0], p[1]); };
// the world point of a hand-unit point of his test hand at time t, without drawing (wtHero's mapping, for camera targets);
// key: 'tip' (the pointer's tip) | 'strap' (the strap's middle) | 'thumb' (the thumb's tip)
function heroHandPt(t, key) {
  const S = heroA(t, { gor: false }), A = S.A, st = wtSt(A), rr = rig(st.pose), F = wtHandFrame(rr, 'R', A, 1);
  const P = wtHandPts(A.HR, t);
  let q = P.tip.I;
  if (key === 'thumb') q = P.thumbTip;
  if (key === 'strap') { const Sg = tfStrings(P, F.fa), y = Sg.strapY; q = [(tfXAt(Sg.thumb, y) + tfXAt(Sg.point, y)) / 2, y]; }
  const qq = [-q[0], q[1]], a = F.ang;
  const wx = F.o[0] + (qq[0] * Math.cos(a) - qq[1] * Math.sin(a)) * F.s, wy = F.o[1] + (qq[0] * Math.sin(a) + qq[1] * Math.cos(a)) * F.s;
  return [st.x + wx * st.s, st.y + wy * st.s];
}
// a speech bubble with dark text and a tail toward (tx, ty) (screen space)
function tfSay(txt, x, y, tx, ty, k, size = 46) {
  if (k <= 0.01) return;
  const q = E.outBack(clamp(k), 2.0);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(q, q); ctx.rotate(-0.05);
  ctx.font = `900 ${size}px Montserrat`;
  const w = ctx.measureText(txt).width + size * 1.0, hh = size * 1.7;
  const lx = (tx - x) / q, ly = (ty - y) / q;
  ctx.beginPath(); ctx.moveTo(-w * 0.12, hh * 0.3); ctx.lineTo(lx * 0.55, ly * 0.55); ctx.lineTo(w * 0.08, hh * 0.3); ctx.closePath();
  ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(10,10,20,0.9)'; ctx.stroke();
  rrect(ctx, -w / 2, -hh / 2, w, hh, hh * 0.45); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-w * 0.12 + 3, hh * 0.3 - 2); ctx.lineTo(w * 0.08 - 3, hh * 0.3 - 2); ctx.lineWidth = 6; ctx.strokeStyle = '#FFFFFF'; ctx.stroke();
  ctx.fillStyle = '#16121E'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, size * 0.06);
  ctx.restore();
}

// ================================================================ shots
// frame 1 and round it: tight on his raised hand (his head at the left edge of the frame), the thumb already bending
function hookCam(tt) {
  const c = cu();
  const k = camKeys(tt, [[-0.4, 610, 1036, 3.05], [0, 612, 1032, 3.15], [0.5, 614, 1029, 3.25], [c.palm_end, 618, 1022, 3.38],
    [c.move, 622, 1000, 3.75], [c.moved, 624, 990, 3.95]], E.inOutCubic);
  const sh = shake(tt, 2.0 * bumpAt(tt, c.curl0, 10), 26, 3);
  k.sx = sh[0]; k.sy = sh[1];
  return k;
}
SC.hook = (lt, t, shot) => {
  const c = cu(), cam = hookCam(t), S = heroA(t, { gor: false });
  const Hh = roomDraw(t, cam, S.A);
  const tip = handScr(cam, Hh, Hh.P.tip.I);
  // "Did your pointer finger move?": a ring round the pointer's tip
  tfRing(tip, popK(t, c.ring, shot.end + 1, 0.14, 0.1), t, '#7FE9FF', 62, 0.9, 1.1);
  tfMarks(tip, ramp(t, c.curl0 - 0.12, c.curl0 + 0.30), -Math.PI * 0.75, '#FFFFFF');
  tfMarks(tip, ramp(t, c.palm_end - 0.25, c.palm_end + 0.15), -Math.PI * 0.75, '#FFFFFF');
  return { glow: 0.85, push: { k: 1 + 0.02 * ramp(t, 0, 4.8), cx: 540, cy: 900 } };
};
SC.loop = (lt, t, shot) => SC.hook(lt, t - TLd.duration, shot);

// the answer: closer on the pointer; it opens a face and goes after the thumb
SC.sidekick = (lt, t, shot) => {
  const c = cu();
  const P0 = heroHandPt(c.eyes + 0.3, 'tip');
  const cam = camKeys(t, [[shot.start, 624, 990, 3.95], [c.eyes, P0[0] + 14, P0[1] + 40, 5.0], [c.clingy, P0[0] + 18, P0[1] + 52, 4.4],
    [shot.end, P0[0] + 18, P0[1] + 56, 4.3]], E.inOutCubic);
  const S = heroA(t, { gor: false });
  const Hh = roomDraw(t, cam, S.A);
  const tip = handScr(cam, Hh, Hh.P.tip.I);
  tfRing(tip, popK(t, shot.start - 1, c.eyes + 0.05, 0.1, 0.12), t, '#7FE9FF', 62, 0.9, 1.1);
  // the sidekick talks: ME TOO! as it bends along with the thumb; a heart over it
  tfSay('ME TOO!', clamp(tip[0] + 150, 330, 760), clamp(tip[1] - 200, 470, 900), tip[0] + 20, tip[1] - 40, popK(t, c.clingy + 0.15, shot.end + 1, 0.12, 0.1), 50);
  heartIcon(tip[0] - 80, tip[1] - 70 - 30 * ramp(t, c.heart, c.heart + 0.6), 1.0, popK(t, c.heart, shot.end + 1, 0.12, 0.1));
  return { glow: 0.85 };
};

// he bends again: the hand and forearm turn to glass from the wrist: the two strings; then the strap at the wrist
SC.glass = (lt, t, shot) => {
  const c = cu();
  const SP = heroHandPt(c.strap_pop + 0.3, 'strap');
  const cam = camKeys(t, [[shot.start, 630, 1010, 3.4], [c.again_end, 655, 1062, 3.25], [c.strings_end, 656, 1078, 3.2],
    [c.strap1 - 0.15, SP[0], SP[1] - 10, 5.0], [shot.end, SP[0], SP[1] - 12, 5.3]], E.inOutCubic);
  const S = heroA(t, { gor: false });
  const Hh = roomDraw(t, cam, S.A);
  const G = Hh.P && Hh.P.glass;
  // "see those strings?": a tag on each
  if (G && G.thumbS && G.pointS) {
    const kl = popK(t, c.strings - 0.05, c.strap1 - 0.3, 0.14, 0.1);
    const th = handScr(cam, Hh, G.thumbS[1]), pt = handScr(cam, Hh, G.pointS[1]);
    tagPill('THUMB', th[0] - 150, th[1] + 40, '#FF9A3C', kl, 36);
    tagPill('POINTER', pt[0] + 160, pt[1] + 70, '#7FE9FF', kl, 36);
  }
  if (G && G.strapMid) {
    const sp = handScr(cam, Hh, G.strapMid), ks = popK(t, c.strap_pop + 0.05, shot.end + 1, 0.14, 0.1);
    tagPill('STRAP', sp[0] + 230, clamp(sp[1] - 150, 480, 1200), '#FFD447', ks, 50);
    if (ks > 0.01) thinLeader([sp[0] + 150, clamp(sp[1] - 120, 510, 1230)], [sp[0] + 40, sp[1] - 10], ks, '#FFD447');
  }
  return { glow: 0.9, flash: 0.04 * bumpAt(t, c.strap_pop, 8) };
};

// "Thumb pulls... pointer follows.": the whole glass hand, the strap dragging the pointer's string
SC.pull = (lt, t, shot) => {
  const c = cu();
  const cam = camKeys(t, [[shot.start, 652, 1030, 3.55], [c.drag, 648, 1018, 3.65], [shot.end, 646, 1016, 3.7]], E.inOutCubic);
  const S = heroA(t, { gor: false });
  const Hh = roomDraw(t, cam, S.A);
  const tip = handScr(cam, Hh, Hh.P.tip.I);
  tfMarks(tip, ramp(t, c.drag + 0.05, c.drag + 0.5), -Math.PI * 0.75, '#7FE9FF');
  return { glow: 0.9 };
};

// "No strap? Your thumb goes solo.": the strap is a ghost; the thumb bends alone under a spotlight
SC.solo = (lt, t, shot) => {
  const c = cu();
  const cam = camKeys(t, [[shot.start, 646, 1016, 3.6], [c.goes, 642, 1008, 3.6], [shot.end, 640, 1004, 3.65]], E.inOutCubic);
  const S = heroA(t, { gor: false });
  const Hh = roomDraw(t, cam, S.A);
  const th = handScr(cam, Hh, Hh.P.thumbTip);
  tfSpot(th, popK(t, c.spot, shot.end + 1, 0.12, 0.1));
  const G = Hh.P && Hh.P.glass;
  if (G && G.strapMid) {
    const sp = handScr(cam, Hh, G.strapMid);
    tagPill('NO STRAP', clamp(sp[0] + 60, 330, 660), clamp(sp[1] - 150, 480, 960), '#FF5A6E', popK(t, c.ghost + 0.05, c.goes - 0.1, 0.12, 0.1), 42, '#FFFFFF');
  }
  burstWord('SOLO!', clamp(th[0] - 40, 300, 760), th[1] - 230, 74, popK(t, c.solo + 0.05, shot.end + 1, 0.12, 0.1), '#4DFFB4');
  return { glow: 0.9 };
};

// the gorilla behind him: its hand up, glass: ONE string that forks to the pointer and the thumb
SC.gorilla = (lt, t, shot) => {
  const c = cu();
  const cam = camKeys(t, [[shot.start, 272, 838, 2.15], [c.their, 266, 832, 2.25], [c.branch, 234, 806, 2.55], [shot.end, 230, 804, 2.62]], E.inOutCubic);
  const o = {}, S = heroA(t, { gor: true });
  S.A.pre = (lc) => { o.G = drawGorilla(lc, t, gorillaState(t)); };
  const Hh = roomDraw(t, cam, S.A);
  void Hh;
  const kt = popK(t, c.gorillas + 0.1, c.their + 0.6, 0.12, 0.1);
  tagPill('GORILLA', 540, 1140, '#C8A8FF', kt, 44);
  return { glow: 0.9, flash: 0.05 * bumpAt(t, shot.start, 9) };
};

// "So that strap? Maybe a little leftover... ape.": his glass wrist; then the two of them; the gorilla drums its chest
SC.ape = (lt, t, shot) => {
  const c = cu();
  const cam = camKeys(t, [[shot.start, 650, 1060, 3.4], [c.strap3_end, 655, 1072, 3.6], [c.maybe + 0.1, 505, 1040, 2.05],
    [c.ape1, 500, 1046, 2.1], [shot.end, 497, 1060, 2.0]], E.inOutCubic);
  const S = heroA(t, { gor: true });
  const Hh = roomDraw(t, cam, S.A);
  const G = Hh.P && Hh.P.glass;
  if (G && G.strapMid) {
    const sp = handScr(cam, Hh, G.strapMid);
    tfRing(sp, popK(t, c.glow3, c.maybe, 0.14, 0.1), t, '#FFD447', 54, 1.2, 0.8);
  }
  const kb = popK(t, c.drum + 0.02, shot.end + 1, 0.1, 0.1), bp = toScreen(cam, 205, 1010);
  burstWord('THUMP!', clamp(bp[0], 250, 760), clamp(bp[1], 480, 1200), 62, kb * (0.85 + 0.15 * Math.abs(Math.sin((t - c.drum) * 26))), '#C8A8FF', '#0B0B1A', 0.1, 5);
  return { glow: 0.9, flash: 0.04 * bumpAt(t, c.drum, 10) };
};

// the button: his OTHER hand comes up; its thumb bends alone; his grin; the gorilla's huff; then into the loop
SC.button = (lt, t, shot) => {
  const c = cu(), D = TLd.duration;
  // the two-shot, then (the last 0.8 s) the hook's camera for the cut to frame 1
  let cam = camKeys(t, [[shot.start, 492, 1070, 1.9], [c.other, 494, 1084, 1.95], [c.grin, 498, 1088, 2.0]], E.inOutCubic);
  const hk = hookCam(-0.4), u = ramp(t, D - 0.95, D - 0.42, E.inOutCubic);
  cam = { x: lerp(cam.x, hk.x, u), y: lerp(cam.y, hk.y, u), zoom: lerp(cam.zoom, hk.zoom, u), rot: 0 };
  const S = heroA(t, { gor: true });
  const Hh = roomDraw(t, cam, S.A);
  if (Hh.FL && S.OH.up > 0.5) {
    const tipL = (() => { const p = Hh.hpL(Hh.PL.tip.I); return toScreen(cam, p[0], p[1]); })();
    tfRing(tipL, popK(t, c.solo2 + 0.1, c.ape2_end + 0.2, 0.14, 0.1), t, '#4DFFB4', 48, 0.9, 1.1);
  }
  return { glow: 0.85 };
};

// ---------------------------------------------------------------- the cover (cover.sh renders it)
SC.cover = (lt, t, shot) => {
  const c = cu();
  const tt = c.sidekick + 0.3;
  const cam = { x: 612, y: 960, zoom: 3.15, rot: 0 };
  const S = heroA(tt, { gor: false });
  S.A.face = VF.wow;
  S.A.HR = Object.assign({}, S.A.HR, { tb: 1, curl: 1, face: 0, glass: 0, strap: 0 });
  const Hh = roomDraw(tt, cam, S.A);
  const tip = handScr(cam, Hh, Hh.P.tip.I);
  tfRing(tip, 1, 0.4, '#7FE9FF', 74, 0.9, 1.1);
  tfMarks(tip, 0.35, -Math.PI * 0.75, '#FFFFFF');
  screenSpace();
  bigWord('DID IT', 540, 545, 150, '#FFFFFF', 1, -0.03);
  bigWord('MOVE?', 540, 705, 190, '#FFD447', 1, -0.03);
  return { glow: 0.85, noCaptions: true };
};

// ---------------------------------------------------------------- once, before frame 0
function initScenes2() { initRoom(); }
