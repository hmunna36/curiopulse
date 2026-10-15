// Why Can't You Lift Your RING FINGER? 💍 Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds
// inside the shot, t = seconds in the video) and returns post options for main.js.
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;

// ---------------------------------------------------------------- the light of each place
const CAFE_LIGHT = { ...LIGHTS.candle, key: [-0.42, -0.70, 0.58], rimFrom: [0.88, -0.35], rim: [0.55, 0.72, 1.0], rimAmt: 1.2, pool: 0.6 };
const INSIDE_LIGHT = { ...CAFE_LIGHT, pool: 0.75, halo: 0.05 };
const PAST_LIGHT = { ...LIGHTS.candle, key: [0.45, -0.66, 0.60], rimFrom: [-0.85, -0.35], rim: [1.0, 0.72, 0.42], pool: 0.55 };
setLights({ hook: CAFE_LIGHT, inside: INSIDE_LIGHT, past: PAST_LIGHT, button: CAFE_LIGHT, loop: CAFE_LIGHT, cover: CAFE_LIGHT });

// ---------------------------------------------------------------- his faces
const RF = {
  focus: { eyeOpen: 1.05, pupil: 1, lookX: -0.25, lookY: 1, browY: 0.35, browTilt: 0.7, mouth: 'flat', mouthOpen: 0.1, blink: 0.12, cross: 0 },
  strain: { eyeOpen: 0.92, pupil: 0.9, lookX: -0.3, lookY: 1, browY: 0.95, browTilt: 1.35, mouth: 'grimace', mouthOpen: 1, blink: 0.25, cross: 0 },
  stuck: { eyeOpen: 1.22, pupil: 0.85, lookX: 0, lookY: 0, browY: 1.0, browTilt: 1.15, mouth: 'wavy', mouthOpen: 0.45, blink: 0, cross: 0 },
  deflate: { eyeOpen: 0.92, pupil: 1, lookX: 0, lookY: 0, browY: -0.1, browTilt: -0.25, mouth: 'flat', mouthOpen: 0.2, blink: 0.5, cross: 0 },
  peer: { eyeOpen: 1.32, pupil: 0.66, lookX: -0.35, lookY: 1, browY: 1.35, browTilt: 0.4, mouth: 'o', mouthOpen: 0.6, blink: 0, cross: 0 },
  glare: { eyeOpen: 1.0, pupil: 0.9, lookX: 0.15, lookY: 1, browY: -0.3, browTilt: -0.95, mouth: 'flat', mouthOpen: 0, blink: 0.38, cross: 0 },
  yank: { eyeOpen: 1.42, pupil: 0.5, lookX: -0.3, lookY: 1, browY: 1.5, browTilt: 0.4, mouth: 'o', mouthOpen: 0.9, blink: 0, cross: 0 },
  proud: { eyeOpen: 1, pupil: 1, lookX: 0.2, lookY: 0, browY: 0.6, browTilt: -0.3, mouth: 'grin', mouthOpen: 1, blink: 0.1, cross: 0 },
};
// a sequence of faces on cues: [[t, face], ...] → the face at time t (each change takes 0.12 s)
function faceSeq(t, seq) {
  let f = seq[0][1];
  for (let i = 1; i < seq.length; i++) {
    const [t1, g] = seq[i];
    if (t >= t1 + 0.12) f = g;
    else if (t > t1) f = lerpFace(f, g, (t - t1) / 0.12);
  }
  return f;
}

// ---------------------------------------------------------------- the hook as a function of time (valid at negative time)
// tt = seconds from frame 0; negative tt = the last frames of the Short, which run into frame 0: the hand lifts and
// slaps flat on the table, and the slap lands on frame 0
function hookA(tt) {
  const c = cu(), A = { lift: {}, fold: 0, tremble: 0, hop: 0, t: tt };
  if (tt < 0) {   // the end of the Short: he gives up, unfolds the middle finger, lifts the hand, slaps it down again
    const u = tt;   // -0.4 .. 0 (the loop shot) and the button before it
    A.fold = 1 - ramp(u, -0.62, -0.32, E.inOutSine);
    A.tremble = 1 - ramp(u, -0.75, -0.55);
    A.hop = 3.2 * Math.sin(Math.PI * clamp((u + 0.42) / 0.42)) * (u > -0.42 ? 1 : 0);
    A.squash = 0;
    return A;
  }
  A.hop = 0;
  A.squash = Math.max(0, 1 - tt / 0.16);                         // the slap: the hand flattens a little on contact
  A.fold = ramp(tt, c.fold - 0.05, c.under_end - 0.1, E.inOutSine);
  // the ring finger strains from "RING": a tremble, tiny lifts that fail
  const strain = ramp(tt, c.ring - 0.1, c.ring + 0.3) * (1 - 0.75 * ramp(tt, c.relax, c.relax + 0.4)) + 0.9 * ramp(tt, c.held - 0.2, c.held + 0.2) * (1 - ramp(tt, c.by_middle + 0.75, c.by_middle + 0.95));
  A.tremble = clamp(strain);
  A.lift.R = 0.05 * strain * (0.5 + 0.5 * Math.sin(tt * 9)) + 0.13 * ramp(tt, c.answer_end - 0.45, c.answer_end - 0.02) * (1 - ramp(tt, c.answer_end + 0.02, c.answer_end + 0.12, E.inCubic));
  return A;
}
// the café camera: tight on his hand with his face above it; it settles in from a small push on the slap
function hookV(tt) {
  const settle = tt >= 0 ? E.outCubic(clamp(tt / 0.5)) : 1;
  return { phi: 0.6, tx: 1.2, ty: 2.0, tz: -0.4, D: 96 - 6 * (1 - settle), f: HV_F, cx: 470, cy: 1080 };
}
// the whole café frame. o: {V, A, face, leash: {k, tie, taut}, kface, sweat, headDY, dim, shift, glass}
function cafeDraw(tt, t, o) {
  const V = o.V, pr = hvCam(V), A = o.A;
  cafeRoom(o.shift || 0, o.dim || 0, t);
  // the 2D camera: a shake on the slap and the yank
  const sh = shake(t, 9 * (o.shake || 0), 26, 3);
  const cam = { x: 540 - sh[0], y: 960 - sh[1], zoom: o.zoom || 1, rot: 0 };
  applyCam(cam);
  // him, behind the table (he slides up out of frame as the camera rises)
  const rise = (o.shift || 0) * 1500;
  const H = o.noHero ? null : cafeHero(cam, t, { x: 610, y: 1381 - rise, s: 2.7, face: o.face, headRot: o.headRot || 0, headDY: (o.headDY || 0) / 2.7, lean: o.lean || 0 });
  cafeTable(pr);
  cafeCup(pr, 14, -11.5, t);
  // the hand (a character: it gets his rim light)
  const G = hdGeo(A);
  actor(() => hdDraw(ctx, pr, G, {
    sleeve: CAFEPAL.coat, sleeveDk: CAFEPAL.coatSh, armTo: H ? H.shL : null, armW: 42 * 2.7, noArm: !H && !o.arm3d,
    shadow: 1 - clamp((A.hop || 0) / 4) * 0.6, hop: A.hop || 0,
  }));
  // the slap: lines off the hand on contact
  if ((A.squash || 0) > 0.02) {
    const q = pr([1.0, 1.0, 2.5]);
    shockLines(q[0], q[1] + 40, 330, 0.12 + 0.88 * (1 - A.squash), 12, '#FFFFFF', 4);
  }
  if (o.foldArrow > 0.01) rfFoldArrow(pr, G, o.foldArrow, tt);
  if (o.leash) hdLeash(ctx, gctx, pr, G, Object.assign({ t }, o.leash));
  if (o.kface) hdKnuckleFace(ctx, pr, G, o.kface, t, o.kmood);
  if (o.sweat > 0.01 && H) {   // a sweat drop slides down his temple
    const hx = H.head[0] + 52 * H.s, hy = H.head[1] - 20 * H.s + 40 * ((t * 0.8) % 1) * H.s;
    sweatDrop(ctx, hx, hy, 1.4, o.sweat);
    sweatDrop(ctx, H.head[0] - 58 * H.s, H.head[1] - 34 * H.s + 30 * ((t * 0.65 + 0.4) % 1) * H.s, 1.1, o.sweat * 0.8);
  }
  return { pr, G, H, cam };
}
// ================================================================ the hook: the test, the leash
SC.hook = (lt, t) => {
  const c = cu(), A = hookA(t);
  const face = faceSeq(t, [[-1, RF.focus], [c.ring - 0.25, RF.strain], [c.stuck, RF.stuck], [c.relax + 0.1, RF.deflate],
    [c.leash - 0.15, RF.peer], [c.held, RF.glare], [c.answer_end + 0.05, RF.yank], [c.answer_end + 0.4, RF.glare]]);
  const leashK = ramp(t, c.leash - 0.12, c.leash + 0.12);
  const tie = ramp(t, c.leash + 0.1, c.held + 0.2, E.inOutCubic);
  const taut = ramp(t, c.answer_end - 0.12, c.answer_end + 0.06);
  const V = hookV(t);
  V.D -= 5 * ramp(t, c.stuck - 0.1, c.leash - 0.4, E.inOutSine);   // a slow creep in while he complains
  const push = ramp(t, c.leash - 0.45, c.held + 0.1, E.inOutSine);   // in on the two fingers for the leash
  V.D = lerp(V.D, 58, push); V.tx = lerp(V.tx, -0.2, push); V.tz = lerp(V.tz, 3.2, push); V.ty = lerp(V.ty, 1.4, push); V.cy = lerp(V.cy, 1000, push); V.cx = lerp(V.cx, 520, push);
  const yank = popK(t, c.answer_end + 0.05, c.answer_end + 0.4, 0.02, 0.3);
  cafeDraw(t, t, {
    V, A, face, leash: { k: leashK, tie, taut }, foldArrow: popK(t, c.fold - 0.1, c.under_end + 0.25, 0.15, 0.2), kface: ramp(t, c.by_middle - 0.1, c.by_middle + 0.15), kmood: 'smug',
    sweat: ramp(t, c.ring + 0.5, c.ring + 0.9) * (1 - ramp(t, c.relax, c.relax + 0.3)) + ramp(t, c.held, c.held + 0.3),
    shake: Math.max(Math.max(0, 1 - t / 0.25) * 0.8, yank),
    headRot: 0.09 * Math.sin((t - c.stuck) * 16) * popK(t, c.stuck, c.stuck_end + 0.25, 0.08, 0.2),
    headDY: 26 * E.inOutSine(popK(t, c.relax, c.leash - 0.3, 0.3, 0.3)),
  });
  // "STUCK?" is in the captions; a little burst on the yank
  return { glow: 0.85, capY: 1520 };
};

// ================================================================ inside the hand: cords, lifters, the strap
SC.inside = (lt, t, shot) => {
  const c = cu();
  // the camera rises over his hand, then pulls back along the forearm, then comes back to the knuckles
  const V = hvKeys(t, [
    [shot.start, 0.6, -0.2, 1.4, 3.2, 58, 520, 1000],
    [c.cords + 0.2, 1.0, 0.8, 3.0, -2.8, 70, 520, 920],
    [c.pointer - 0.15, 1.0, 0.8, 3.0, -2.8, 70, 520, 920],
    [c.spare - 0.1, 1.2, -1.4, 3.6, -13, 104, 560, 860],
    [c.nope_end, 1.2, -1.4, 3.6, -13, 101, 560, 860],
    [c.ties - 0.1, 0.84, -0.1, 2.4, -1.2, 66, 520, 950],
    [shot.end, 0.84, -0.1, 2.4, -1.0, 62, 520, 950],
  ]);
  const shift = clamp((V.phi - 0.37) / 0.6);
  const A = { lift: {}, fold: 0, tremble: 0, t };
  // the lifts that show the cords working
  const up = (t0, t1, a) => a * popK(t, t0, t1, 0.2, 0.25);
  A.lift.I = up(c.they_lift - 0.05, c.fingers + 0.35, 0.42) + up(c.pointer, c.pinky + 0.3, 0.36);
  A.lift.L = up(c.fingers - 0.05, c.fingers_end + 0.35, 0.38) + up(c.pinky, c.spare + 0.3, 0.34);
  const shared = popK(t, c.ringq + 0.05, c.nope + 0.05, 0.25, 0.2);   // "Ring finger?": the shared muscle lifts all four together
  for (const k of ['L', 'R', 'M', 'I']) A.lift[k] = (A.lift[k] || 0) + 0.2 * shared;
  // the middle finger folds under again, and the ring finger is dragged down with it
  A.fold = ramp(t, c.mdown - 0.05, c.mdown_end + 0.05, E.inOutSine);
  A.lift.R += 0.2 * ramp(t, c.ties - 0.1, c.ties + 0.25) * (1 - ramp(t, c.rdown + 0.02, c.rdown + 0.14, E.inCubic));
  A.tremble = 0.6 * ramp(t, c.rdown + 0.1, c.rdown + 0.25);
  const pr = hvCam(V);
  cafeRoom(shift, 0.25 + 0.55 * ramp(t, c.cords - 0.2, c.cords + 0.3), t);
  applyCam({ x: 540, y: 960, zoom: 1, rot: 0 });
  cafeTable(pr);
  cafeCup(pr, 14, -11.5, t);
  screenSpace(); ctx.fillStyle = `rgba(3,5,14,${0.55 * ramp(t, c.cords - 0.2, c.cords + 0.3)})`; ctx.fillRect(0, 0, W, H);   // the table goes dim
  applyCam({ x: 540, y: 960, zoom: 1, rot: 0 });
  const G = hdGeo(A);
  actor(() => hdDraw(ctx, pr, G, { sleeve: CAFEPAL.coat, sleeveDk: CAFEPAL.coatSh, cuffZ: -19 }));
  const k = ramp(t, c.see, c.cords + 0.15);
  hdGlass(ctx, pr, G, k, { cuffZ: -19 });
  const fa = popK(t, c.mdown - 0.1, c.rdown, 0.12, 0.15);
  if (fa > 0.01) rfFoldArrow(pr, G, fa, t);
  const glow = { I: popK(t, c.they_lift - 0.05, c.fingers + 0.35) + popK(t, c.pointer, c.pinky + 0.3),
    L: popK(t, c.fingers - 0.05, c.fingers_end + 0.35) + popK(t, c.pinky, c.spare + 0.3), M: 0.6 * shared, R: shared };
  hdInside(pr, G, {
    k, t, cords: ramp(t, c.cords - 0.05, c.cords + 0.3), glow,
    slide: { I: -glow.I, L: -glow.L, R: -shared, M: -shared + 1.2 * popK(t, c.mdown, c.rdown_end + 0.3) },
    muscles: ramp(t, c.pointer - 0.3, c.pointer + 0.2) * (1 - 0.6 * ramp(t, c.strap - 0.2, c.strap + 0.3)),
    pump: { spareI: popK(t, c.pointer, c.pinky + 0.3), spareL: popK(t, c.pinky, c.spare + 0.3), shared },
    ghost: ramp(t, c.ringq - 0.05, c.ringq + 0.2) * (1 - ramp(t, c.strap - 0.2, c.strap + 0.2)), ghostCol: t > c.nope ? '#FF5A6E' : '#C8A8FF',
    strap: ramp(t, c.strap - 0.05, c.strap + 0.2), pull: ramp(t, c.mdown, c.mdown_end, E.inOutSine),
    strapGlow: 0.6 + 0.4 * Math.sin(t * 8),
  });
  // labels
  screenSpace();
  if (t > c.pointer - 0.2 && t < c.strap) {
    const qi = pr(hmPt(G, lerpP(HM.spareI.a, HM.spareI.b, 0.5))), ql = pr(hmPt(G, lerpP(HM.spareL.a, HM.spareL.b, 0.5)));
    rfTag('SPARE', clamp(qi[0] + 190, 230, 830), qi[1] + 20, '#4DFFB4', popK(t, c.spare - 0.1, c.strap - 0.2), qi);
    rfTag('SPARE', clamp(ql[0] - 190, 230, 830), ql[1] + 60, '#4DFFB4', popK(t, c.spare + 0.15, c.strap - 0.2), ql);
    const qg = pr(hmPt(G, lerpP(HM.ghostR.a, HM.ghostR.b, 0.62)));
    rfTag(t > c.nope ? 'RING: NONE' : 'RING?', clamp(qg[0] + 40, 260, 820), Math.max(520, qg[1] - 190), t > c.nope ? '#FF5A6E' : '#C8A8FF', popK(t, c.ringq + 0.1, c.strap - 0.2), qg);
  }
  if (t > c.strap - 0.1) {
    const q = hdStrapPt(pr, G, ramp(t, c.mdown, c.mdown_end, E.inOutSine));
    rfTag('STRAP', q[0] - 40, q[1] - 190, '#C8A8FF', popK(t, c.strap + 0.05, shot.end + 1), q);
    rfSmall('juncturae tendinum', q[0] - 40, q[1] - 125, popK(t, c.ties + 0.2, shot.end + 1));
  }
  if (t > c.rdown - 0.05) {   // the ring finger is locked: a red tick of a lock
    const R = G.f.R, q = pr(hdTop(R.pts[1], R.P[0], R.rad[1], 2.2));
    rfLock(q[0], q[1] - 40, popK(t, c.rdown, shot.end + 1));
  }
  return { glow: 0.9, capY: 1520 };
};

// a curved arrow that tucks under the middle finger while it folds (world coordinates)
function rfFoldArrow(pr, G, k, tt) {
  const M = G.f.M, a = pr(hdTop(M.pts[0], M.P[0], M.rad[0], 2.4)), b = pr([HF.M.x, 0.4, M.pts[1][2] + 2.6]);
  const s = E.outBack(clamp(k), 2), cx = a[0] + 120, cy = (a[1] + b[1]) / 2;
  paint(() => {
    ctx.save(); ctx.globalAlpha = clamp(k * 1.5);
    ctx.beginPath(); ctx.moveTo(a[0] + 30, a[1] - 20); ctx.quadraticCurveTo(cx + 60 * s, cy, b[0] + 30, b[1]);
    ctx.lineWidth = 16; ctx.strokeStyle = 'rgba(10,10,30,0.6)'; ctx.lineCap = 'round'; ctx.stroke();
    ctx.lineWidth = 10; ctx.strokeStyle = '#FFFFFF'; ctx.stroke();
    const an = Math.atan2(b[1] - cy, b[0] + 30 - (cx + 60 * s));
    ctx.translate(b[0] + 30, b[1]); ctx.rotate(an);
    ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-18, -16); ctx.lineTo(-18, 16); ctx.closePath(); ctx.fillStyle = '#FFFFFF'; ctx.fill();
    ctx.restore();
  });
}
// a tag on a dashed leader (screen space): k 0..1
function rfTag(txt, x, y, col, k, to) {
  if (k <= 0.01) return;
  if (to) thinLeader([x, y], [to[0], to[1]], k, col);
  const s = E.outBack(clamp(k), 2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.font = '900 46px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + 44, h = 70;
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = 'rgba(8,10,28,0.92)'; ctx.fill();
  paint(() => { ctx.lineWidth = 5; ctx.strokeStyle = col; ctx.stroke(); ctx.fillStyle = col; ctx.fillText(txt, 0, 3); });
  ctx.restore();
}
function rfSmall(txt, x, y, k) {
  if (k <= 0.01) return;
  screenSpace();
  paint(() => {
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    ctx.font = 'italic 700 34px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(6,8,20,0.85)'; ctx.strokeText(txt, 0, 0);
    ctx.fillStyle = '#E6DAFF'; ctx.fillText(txt, 0, 0);
    ctx.restore();
  });
}
// a small padlock (screen space)
function rfLock(x, y, k) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.4) * 1.5;
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.arc(0, -26, 22, Math.PI, 0); ctx.lineWidth = 11; ctx.strokeStyle = '#C9CED8'; ctx.stroke();
  rrect(ctx, -32, -26, 64, 52, 10); ctx.fillStyle = '#FF5A6E'; ctx.fill();
  paint(() => { circle(ctx, 0, -4, 7, '#3A0A14'); ctx.fillStyle = '#3A0A14'; ctx.fillRect(-3, -2, 6, 16); });
  ctx.restore();
}

// ================================================================ the 1880s (filled in by parlour.js)
SC.past = (lt, t, shot) => pastDraw(lt, t, shot);

// ================================================================ the button: still trying
SC.button = (lt, t, shot) => {
  const c = cu(), D = TLd.duration, tt = t - D;
  const A = hookA(tt < -0.62 ? 3.9 : tt);
  if (tt < -0.62) { A.fold = 1; A.tremble = 1; A.lift = { R: 0.04 * (0.5 + 0.5 * Math.sin(t * 9)) }; A.hop = 0; A.squash = 0; A.t = t; }
  const face = faceSeq(t, [[-1, RF.strain], [c.arent, RF.stuck], [D - 0.75, RF.deflate], [D - 0.3, RF.focus]]);
  const V = hookV(1);
  V.D += 1.5 * ramp(t, shot.start, D, E.inOutSine) - 1.5 * ramp(t, D - 0.5, D, E.inOutSine);
  cafeDraw(tt, t, { V, A, face, sweat: 1 - ramp(t, D - 0.7, D - 0.4) });
  return { glow: 0.85, capY: 1520 };
};
SC.loop = (lt, t) => {
  const tt = t - TLd.duration, A = hookA(tt);
  A.t = t;
  cafeDraw(tt, t, { V: hookV(tt), A, face: RF.focus });
  return { glow: 0.85, capY: 1520 };
};

// the cover: him straining over his hand, the ring finger on its leash to the smug middle knuckle
SC.cover = (lt, t) => {
  const c = cu(), A = hookA(c.by_middle + 0.4);
  A.tremble = 1; A.t = 3.3;
  const V = hookV(1); V.D = 88; V.cy = 1020;
  cafeDraw(c.by_middle + 0.4, 3.3, { V, A, face: RF.strain, leash: { k: 1, tie: 1, taut: 0.15 }, kface: 1, kmood: 'smug', sweat: 1 });
  screenSpace();
  bigWord('CAN YOU', 540, 1400, 110, '#FFFFFF', 1, -0.04);
  bigWord('LIFT IT?', 540, 1545, 170, '#FFD447', 1, -0.04);
  return { glow: 0.85, noCaptions: true };
};
setLights({ cover: CAFE_LIGHT });

function initScenes2() {
  initCafe();
  if (typeof initParlour === 'function') initParlour();
}
