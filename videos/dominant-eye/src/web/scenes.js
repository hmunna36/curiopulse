// Which EYE is your boss? Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js.
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;
// easings this Short needs that lib.js's E does not have
E.linear = E.linear || ((x) => x);
E.inBack = E.inBack || ((x, s = 1.7) => (s + 1) * x * x * x - s * x * x);
E.outBounce = E.outBounce || ((x) => {
  const n = 7.5625, d = 2.75;
  if (x < 1 / d) return n * x * x;
  if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75;
  if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375;
  return n * (x -= 2.625 / d) * x + 0.984375;
});

// ---------------------------------------------------------------- the light of each place
// the hill: the moon is upper left (the key, cool), a campfire off-screen lower right gives the warm rim
const HILL_LIGHT = { ...LIGHTS.night, rimFrom: [0.9, 0.3], rim: [1.0, 0.64, 0.34], rimAmt: 1.15 };
const POV_LIGHT = { ...LIGHTS.night, rimFrom: [-0.3, -0.95], rim: [0.75, 0.85, 1.0] };
const ROOM_LIGHT = { ...LIGHTS.screen, rim: [1.0, 0.55, 0.85] };
setLights({
  hook: HILL_LIGHT, pov: POV_LIGHT, boss: HILL_LIGHT, inside: (lt) => (lt < 0.55 ? HILL_LIGHT : ROOM_LIGHT),
  payoff: (lt, t) => (t >= cu().picture_end ? POV_LIGHT : ROOM_LIGHT), stats: HILL_LIGHT, button: HILL_LIGHT, loop: HILL_LIGHT, cover: HILL_LIGHT,
});

// ---------------------------------------------------------------- his faces
const DF = {
  focus: { eyeOpen: 1.05, pupil: 1, lookX: -0.7, lookY: -0.75, browY: 0.3, browTilt: 0.6, mouth: 'flat', mouthOpen: 0.15, blink: 0, cross: 0, shutL: 0, shutR: 0 },
  squintL: { eyeOpen: 1.05, pupil: 1, lookX: -0.7, lookY: -0.75, browY: 0.15, browTilt: 0.9, mouth: 'flat', mouthOpen: 0.45, blink: 0, cross: 0, shutL: 1, shutR: 0 },
  startled: { eyeOpen: 1.4, pupil: 0.5, lookX: -0.4, lookY: -0.5, browY: 1.5, browTilt: 0.4, mouth: 'o', mouthOpen: 0.8, blink: 0, cross: 0, shutL: 0, shutR: 0 },
  calm: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 0.2, browTilt: 0.1, mouth: 'flat', mouthOpen: 0.3, blink: 0, cross: 0, shutL: 0, shutR: 0 },
  proud: { eyeOpen: 1, pupil: 1, lookX: -0.5, lookY: -1, browY: 0.7, browTilt: -0.3, mouth: 'grin', mouthOpen: 0.8, blink: 0.1, cross: 0, shutL: 0, shutR: 0 },
  sheep: { eyeOpen: 1.1, pupil: 0.9, lookX: 0.8, lookY: -0.2, browY: 0.9, browTilt: 1.1, mouth: 'wavy', mouthOpen: 0.3, blink: 0, cross: 0, shutL: 0, shutR: 0 },
  badge: { eyeOpen: 1.05, pupil: 1, lookX: 0.75, lookY: 0.3, browY: 0.6, browTilt: -0.2, mouth: 'grin', mouthOpen: 0.6, blink: 0, cross: 0, shutL: 0, shutR: 0 },
  wink: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 0.6, browTilt: -0.3, mouth: 'grin', mouthOpen: 1, blink: 0, cross: 0, shutL: 1, shutR: 0 },
};
function faceSeq(t, seq) {
  let f = seq[0][1];
  for (let i = 1; i < seq.length; i++) {
    const [t1, g] = seq[i];
    if (t >= t1 + 0.12) f = g;
    else if (t > t1) f = lerpFace(f, g, (t - t1) / 0.12);
  }
  return f;
}

// ---------------------------------------------------------------- his arm (rig-local elbow e, wrist w; his right arm is 'L')
const ARM_POINT = { e: [-103.3, -449.7], w: [-119.3, -520] };   // the finger at the moon, a little short of it
const ARM_REST = { e: [-104, -272], w: [-114, -184] };
// a raise that bends the elbow out halfway (no T-pose)
function armRaise(k) {
  const m = armMix(ARM_REST, ARM_POINT, E.inOutSine(clamp(k)));
  const bend = Math.sin(Math.PI * clamp(k));
  m.e = [m.e[0] - 38 * bend, m.e[1] + 10 * bend];
  return m;
}

// ---------------------------------------------------------------- the front shot as a function of time
// S = {cam, arm (rig-local), hand, face, crown, glint, badge, flip, swing, badgeT, tink, tags...}
// the hook (valid at negative time: the last frames of the Short raise the arm into frame 0)
function hookS(tt) {
  const c = cu();
  // the arm arrives just before frame 0 and settles with a small overshoot
  let arm = ARM_POINT, settle = 0;
  if (tt < 0) arm = armRaise(ramp(tt, -0.75, -0.04, E.outCubic));
  else settle = Math.sin(tt * 18) * Math.exp(-tt * 9) * 0.6;
  arm = { e: arm.e, w: [arm.w[0] - 6 * settle, arm.w[1] - 10 * settle] };
  const face = tt < 0 ? DF.focus : faceSeq(tt, [[-1, DF.focus], [c.shut1 - 0.06, DF.squintL]]);
  const push = tt < 0 ? 0 : ramp(tt, 0, 2.5, E.inOutSine);
  const sh = tt >= 0 ? shake(tt, 7 * Math.max(0, 1 - tt / 0.22), 24, 2) : [0, 0];
  return {
    cam: { x: 540 + 20 * push + sh[0], y: 960 + 10 * push + sh[1], zoom: 1 + 0.07 * push, rot: 0 },
    arm, hand: 'point', face,
    tink: tt < 0 ? 0 : popK(tt, c.something, c.something + 0.5, 0.06, 0.3),
  };
}
const BOSS_CAM = { x: 600, y: 1010, zoom: 1.3, rot: 0 };
function bossS(t) {
  const c = cu(), lt = t - c.relax + 0.06;
  const down = ramp(t, c.relax - 0.08, c.relax + 0.45, E.inOutSine);
  const arm = armMix(ARM_POINT, ARM_REST, down);
  arm.e = [arm.e[0] - 30 * Math.sin(Math.PI * down), arm.e[1]];
  const face = faceSeq(t, [[-1, DF.startled], [c.relax, DF.calm], [c.boss1 - 0.1, DF.proud], [c.intern1 - 0.05, DF.sheep], [c.intern1_end + 0.15, DF.badge]]);
  const cin = E.outCubic(clamp((t - shotOf('boss').start) / 0.35));
  const cam = { x: lerp(560, BOSS_CAM.x, cin), y: lerp(975, BOSS_CAM.y, cin), zoom: lerp(1.07, BOSS_CAM.zoom, cin) + 0.03 * ramp(t, c.relax, c.intern1_end, E.inOutSine), rot: 0 };
  void lt;
  return {
    cam, arm, hand: down > 0.5 ? 'open' : 'point', face,
    crown: ramp(t, c.boss1 - 0.08, c.boss1 + 0.3, E.linear), glint: popK(t, c.boss1 + 0.3, c.boss1_end + 0.4, 0.1, 0.25),
    badge: ramp(t, c.intern1 - 0.08, c.intern1 + 0.3, E.linear), badgeT: c.intern1,
    tagBoss: popK(t, c.boss1 + 0.05, c.intern1 - 0.1, 0.25, 0.15), tagIntern: popK(t, c.intern1 + 0.1, shotOf('boss').end - 0.12, 0.25, 0.15),
  };
}
function buttonS(t) {
  const c = cu();
  const raise = ramp(t, c.winking_end - 0.05, c.loop_in + 0.02, E.linear);
  const arm = raise > 0 ? armRaise(raise * 0.94) : ARM_REST;
  const face = faceSeq(t, [[-1, DF.badge], [c.still - 0.05, DF.badge], [c.winking - 0.1, DF.wink], [c.winking_end - 0.15, DF.calm], [c.winking_end + 0.25, DF.focus]]);
  const back = ramp(t, c.winking_end, c.loop_in, E.inOutSine);
  const cam = { x: lerp(BOSS_CAM.x, 540, back), y: lerp(BOSS_CAM.y, 960, back), zoom: lerp(BOSS_CAM.zoom + 0.02, 1, back), rot: 0 };
  const off = ramp(t, c.winking_end - 0.05, c.winking_end + 0.3, E.inBack);
  return {
    cam, arm, hand: raise > 0.45 ? 'point' : 'open', face,
    crown: 1 - off, badge: 1 - off, flip: ramp(t, c.still - 0.05, c.still + 0.3, E.inOutSine), badgeT: c.intern3 - 0.3, swing: 0.3,
    tagDepth: popK(t, c.depth - 0.05, c.and_wink - 0.05, 0.25, 0.15), sparkle: popK(t, c.winking, c.winking_end, 0.08, 0.2),
  };
}
// a big orange 'not equal' sign (screen space), k = its pop
function neqSign(x, y, k) {
  if (k <= 0.01) return;
  const q = E.outBack(clamp(k), 2.4);
  ctx.save(); ctx.translate(x, y); ctx.scale(q, q);
  for (const [w, col] of [[30, '#0B0B1A'], [16, '#FF9A3C']]) {
    line(ctx, -50, -20, 50, -20, w, col); line(ctx, -50, 22, 50, 22, w, col); line(ctx, 26, -62, -26, 64, w, col);
  }
  ctx.restore();
}
function shotOf(id) { return TLd.shots.find((s) => s.id === id); }

// the front frame: sky, moon, him, the props; returns the hero's points (world) and the camera
function frontDraw(t, S) {
  const cam = S.cam;
  const m = hlSet(cam, t);
  applyCam(cam);
  const A = {
    face: S.face, armL: S.arm, handL: S.hand, crown: S.crown || 0, crownGlint: S.glint || 0, badge: S.badge || 0, flip: S.flip || 0,
    badgeT: S.badgeT || 0, swing: S.swing, badgeBack: ['DEPTH'],
  };
  const H = hlHero(cam, t, A);
  // the finger meets the moon: a little twinkle at the tip
  if ((S.tink || 0) > 0.01) {
    const p = toScreen(cam, H.tipL[0], H.tipL[1]);
    screenSpace();
    twinkle(p[0], p[1], 34 + 30 * S.tink, S.tink, t);
  }
  if ((S.sparkle || 0) > 0.01) {   // the wink's sparkle at his left eye (screen-right)
    const p = toScreen(cam, H.eyeL[0] + 70, H.eyeL[1] - 50);
    screenSpace();
    twinkle(p[0], p[1], 46, S.sparkle, t);
  }
  return { H, cam, moon: m };
}
// a four-point sparkle (screen space), into both layers
function twinkle(x, y, r, k, t) {
  if (k <= 0.01) return;
  const q = E.outBack(clamp(k), 2), rr = r * q;
  const star = (c, a) => {
    c.save(); c.translate(x, y); c.rotate(0.3 * Math.sin(t * 3));
    c.beginPath();
    for (let i = 0; i < 8; i++) { const an = (i / 8) * Math.PI * 2 - Math.PI / 2, ra = i % 2 ? rr * 0.22 : rr; c.lineTo(Math.cos(an) * ra, Math.sin(an) * ra); }
    c.closePath(); c.fillStyle = `rgba(255,252,230,${a})`; c.fill(); c.restore();
  };
  paint(() => star(ctx, clamp(k)));
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); star(gctx, 0.8 * clamp(k)); gctx.restore();
}
// the labels for the boss and the intern (screen space)
function frontTags(S, H, cam) {
  if ((S.tagBoss || 0) > 0.01) { const p = toScreen(cam, H.crownAt[0], H.crownAt[1]); hlTag('BOSS', 330, 690, '#FFD447', S.tagBoss, [p[0], p[1] - 20]); }
  if ((S.tagIntern || 0) > 0.01) { const p = toScreen(cam, H.badgeAt[0], H.badgeAt[1]); hlTag('INTERN', 800, 640, '#C8A8FF', S.tagIntern, [p[0], p[1] - 40]); }
  if ((S.tagDepth || 0) > 0.01) { const p = toScreen(cam, H.badgeAt[0], H.badgeAt[1]); hlTag('DEPTH', 800, 640, '#7FE9FF', S.tagDepth, [p[0], p[1] - 40]); }
}

// ================================================================ the hook: the test
SC.hook = (lt, t) => {
  const S = hookS(t);
  frontDraw(t, S);
  return { glow: 0.85 };
};
// the last 0.4 s: the hook at negative time, so the cut to frame 1 is one move
SC.loop = (lt, t) => {
  const S = hookS(t - TLd.duration);
  frontDraw(t, S);
  return { glow: 0.85 };
};

// ================================================================ what he sees: the finger jumps
// which eye is open: 'R' (the boss's picture: the finger on the moon) or 'L' (the intern's: it jumps), with the blinks
function povEyes(t) {
  const c = cu();
  const swaps = [c.now + 0.16, c.jumped_end - 0.42, c.jumped_end + 0.02];   // R -> L, L -> R, R -> L
  let open = 'R', blink = 0, since = 9;
  swaps.forEach((s, i) => {
    blink = Math.max(blink, popK(t, s - 0.09, s + 0.08, 0.07, 0.08));
    if (t >= s) { open = i % 2 === 0 ? 'L' : 'R'; since = t - s; }
  });
  return { open, blink, since, first: swaps[0] };
}
SC.pov = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, P = povEyes(t);
  const target = P.open === 'L' ? 1 : 0;
  const prev = 1 - target;
  const shift = lerp(prev, target, E.outBack(clamp(P.since / 0.12), 2.2));
  const z = 1 + 0.05 * lt / D;
  povSet(povAt([540, 960], [540, 960], z));
  povView(t, {
    shift: P.since < 9 ? shift : 0, ghost: t > P.first ? 0.9 * (1 - ramp(t, c.jumped_end - 0.5, c.jumped_end - 0.42)) : 0,
    streak: P.open === 'L' ? 1 - clamp(P.since / 0.3) : 0,
  });
  povLids(P.blink);
  povHUD(540, 560, 1.3, P.open === 'L' ? 1 : 0, P.open === 'R' ? 1 : 0, ramp(t, shot.start, shot.start + 0.2));
  jumpBurst('JUMP!', 820, 640, 0.85, popK(t, c.jumped - 0.05, c.jumped_end - 0.25, 0.1, 0.15), 0.12);
  return { glow: 0.9, zblur: 0.06 * (1 - ramp(lt, 0, 0.2)) };
};

// ================================================================ the answer: one eye is the boss, the other's the intern
SC.boss = (lt, t) => {
  const S = bossS(t);
  const { H, cam } = frontDraw(t, S);
  frontTags(S, H, cam);
  return { glow: 0.85 };
};

// ================================================================ inside: two pictures, the brain aims with one
const ROOM_F = [540, 900];
const ROOM_CAP = 1560;      // the captions sit under the brain in the room   // the room point at the middle of the window
function roomDraw(t, o = {}) {
  const c = cu();
  brRoom(t);
  const mb = BR_MON.boss, mi = BR_MON.intern;
  const B = brMonitor(mb[0], mb[1], mb[2], mb[3], t, { who: 'boss', shift: 0, on: o.onB === undefined ? 1 : o.onB, lock: o.lockB || 0, shut: o.shut || 0, shutT: o.shutT || 0 });
  const I = brMonitor(mi[0], mi[1], mi[2], mi[3], t, { who: 'intern', shift: 1, on: o.onI === undefined ? 1 : o.onI, dim: o.dimI || 0, lock: o.lockI || 0 });
  brDesk(1420, t);
  brainGuy2(540, 1250 + (o.brainDY || 0), 1.05, t, o.brain || {});
  // the two fingertips ringed, and the sign between them
  if ((o.ring || 0) > 0.01) {
    for (const [M, sh] of [[B, 0], [I, 1]]) {
      const p = M.tip(sh), k = clamp(o.ring);
      paint(() => { ctx.beginPath(); ctx.arc(p[0], p[1] + 30 * M.s, 52 * k, 0, 7); ctx.lineWidth = 9; ctx.strokeStyle = '#FF9A3C'; ctx.stroke(); });
    }
  }
  if ((o.neq || 0) > 0.01) neqSign(540, 720, o.neq);
  void c;
  return { B, I };
}
SC.inside = (lt, t, shot) => {
  const c = cu();
  const DIVE = 0.85;
  const brain = {
    look: t < c.so ? [0, -0.4] : t < c.just ? [-0.9, -0.9] : [-0.8, -0.6],
    mood: t < c.aims ? 'calm' : t < c.boss2 ? 'squint' : 'grin',
    armL: t > c.aims - 0.1 ? [lerp(-176, -230, ramp(t, c.aims - 0.1, c.aims + 0.2)), lerp(118, -150, ramp(t, c.aims - 0.1, c.aims + 0.2, E.outBack))] : null,
    thumbR: t > c.boss2 - 0.05, armR: t > c.boss2 - 0.05 ? [200, lerp(118, -40, ramp(t, c.boss2 - 0.05, c.boss2 + 0.2, E.outBack))] : null,
  };
  const ro = {
    onB: ramp(t, c.sees - 0.15, c.sees + 0.1), onI: ramp(t, c.sees + 0.05, c.sees + 0.3), brain,
    ring: popK(t, c.finger2 - 0.05, c.so, 0.15, 0.2), neq: popK(t, c.different - 0.05, c.so + 0.1, 0.15, 0.15),
    lockB: ramp(t, c.aims - 0.05, c.aims + 0.35), dimI: ramp(t, c.just - 0.05, c.one2 + 0.1),
  };
  if (lt < DIVE) {
    // the dive: his face from the boss shot, the camera pushes into a round window on his forehead
    const u = lt / DIVE, S = bossS(t);
    const P = toScreen(S.cam, 620, 875);                         // his forehead (world -> screen)
    const k = 1 + 9 * E.inCubic(u);
    S.cam = scaledCam(S.cam, [620, 875], k);
    frontDraw(t, S);
    const R = lerp(0, 120, E.outBack(clamp(u / 0.3), 2)) * k;
    const Pw = [lerp(P[0], 540, E.inOutCubic(u)), lerp(P[1], 900, E.inOutCubic(u))];
    screenSpace();
    ctx.save(); gctx.save();
    ctx.beginPath(); ctx.arc(Pw[0], Pw[1], R, 0, 7); ctx.clip();
    gctx.beginPath(); gctx.arc(Pw[0] , Pw[1], R, 0, 7); gctx.clip();
    const s = lerp(0.16, 1, E.inCubic(u));
    povSet({ s, x: Pw[0] - ROOM_F[0] * s, y: Pw[1] - ROOM_F[1] * s });
    roomDraw(t, ro);
    ctx.restore(); gctx.restore();
    screenSpace();
    paint(() => { ctx.beginPath(); ctx.arc(Pw[0], Pw[1], R, 0, 7); ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(255,170,220,0.9)'; ctx.stroke(); });
    return { glow: 0.85, zblur: 0.25 * E.inCubic(u), zcx: Pw[0], zcy: Pw[1], capY: lerp(1330, ROOM_CAP, ramp(u, 0.6, 1)) };
  }
  const D = shot.end - shot.start;
  const z = 1 + 0.05 * (lt - DIVE) / (D - DIVE);
  povSet({ s: z, x: 540 - 540 * z, y: 900 - 900 * z });
  roomDraw(t, ro);
  return { glow: 0.85, flash: 0.25 * (1 - clamp((lt - DIVE) / 0.2)), capY: ROOM_CAP };
};

// ================================================================ the payoff: shut the boss, the intern's picture, jump
SC.payoff = (lt, t, shot) => {
  const c = cu();
  if (t < c.picture_end) {
    const brain = {
      look: t < c.and_get ? [-0.8, -0.6] : [0.9, -0.8], mood: t < c.boss3 - 0.1 ? 'grin' : t < c.interns ? 'worried' : 'think',
      sweat: ramp(t, c.boss3, c.boss3 + 0.3) * (1 - ramp(t, c.interns, c.interns + 0.3)),
      armR: t > c.and_get ? [lerp(176, 236, ramp(t, c.and_get, c.and_get + 0.25)), lerp(118, -150, ramp(t, c.and_get, c.and_get + 0.3, E.outBack))] : null,
    };
    const shut = ramp(t, c.shut2 - 0.02, c.shut2 + 0.22, E.outBounce);
    const ro = { brain, shut, shutT: Math.max(0, t - c.shut2 - 0.2), lockB: 1 - ramp(t, c.shut2, c.shut2 + 0.1), dimI: 0.85 * (1 - ramp(t, c.and_get, c.and_get + 0.3)), lockI: ramp(t, c.interns - 0.05, c.interns + 0.3) , brainDY: 700 * ramp(t, c.interns + 0.1, c.picture_end - 0.15, E.inCubic) };
    // the push into the intern's screen
    // it ends where the intern's picture sits at the full-screen POV's scale, so the cut is a match cut
    const mi = BR_MON.intern, ms = mi[2] / 620, Z1 = 1.05 / ms;
    const F1 = [mi[0] + (540 - 250) * ms, mi[1] + (960 - 600) * ms];   // pov (540, 960) in room space
    const u = ramp(t, c.interns, c.picture_end, E.inOutCubic);
    const V0 = { s: 1.05, x: 540 - 540 * 1.05, y: 900 - 900 * 1.05 }, V1 = { s: Z1, x: 540 - F1[0] * Z1, y: 960 - F1[1] * Z1 };
    povSet({ s: lerp(V0.s, V1.s, u), x: lerp(V0.x, V1.x, u), y: lerp(V0.y, V1.y, u) });
    roomDraw(t, ro);
    jumpBurst('SLAM!', 215, 1150, 0.6, popK(t, c.shut2 + 0.15, c.boss3_end, 0.08, 0.15), -0.14, '#FF5A6E');
    return { glow: 0.85, zblur: 0.12 * u * u, zcx: 540, zcy: 960, capY: lerp(ROOM_CAP, 1330, u) };
  }
  // the intern's picture, full screen: the finger is off the moon; on "jump" it is shown leaving the boss's spot
  const z = 1.05 - 0.04 * ramp(t, c.picture_end, shot.end);
  povSet(povAt([540, 960], [540, 960], z));
  const bounce = t > c.jump - 0.04 ? 0.12 * Math.sin((t - c.jump + 0.04) * 26) * Math.exp(-(t - c.jump) * 7) : 0;
  povView(t, { shift: 1 + bounce, ghost: ramp(t, c.picture_end + 0.1, c.picture_end + 0.3), streak: t > c.jump - 0.04 ? 1 - clamp((t - c.jump) / 0.4) : 0 });
  povHUD(540, 560, 1.3, 1, 0, 1);
  jumpBurst('JUMP!', 820, 640, 0.85, popK(t, c.jump + 0.02, shot.end, 0.1, 0.15), 0.12);
  return { glow: 0.9, flash: 0.2 * (1 - clamp((t - c.picture_end) / 0.12)), zblur: 0.12 * (1 - clamp((t - c.picture_end) / 0.2)) };
};

// ================================================================ two in three: a line-up of three of us
const CLONE_PALS = [PAL, Object.assign({}, PAL, { coat: '#3FC9B8', coatSh: '#279A8C', coatHi: '#7FE3D6', coatDk: '#1E7A70' }),
  Object.assign({}, PAL, { coat: '#FF6F7F', coatSh: '#D24A5C', coatHi: '#FF9EAA', coatDk: '#A8364A' })];
const CLONES = [{ x: 272, boss: 'R', hand: 'R' }, { x: 540, boss: 'R', hand: 'L' }, { x: 808, boss: 'L', hand: 'L' }];
SC.stats = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 540, y: 960, zoom: 1 + 0.04 * lt / D, rot: 0 };
  hlSet(cam, t, { moon: [850, 560, 46], fire: 0.6 });
  applyCam(cam);
  const pops = [c.two - 0.05, c.two + 0.12, c.three];
  const crowns = [c.right - 0.05, c.right + 0.15, c.boss4 - 0.05];
  const pens = [c.match - 0.1, c.match + 0.1, c.match + 0.3];
  const marks = [c.writing, c.writing + 0.2, c.hand];
  const H3 = [];
  CLONES.forEach((cl, i) => {
    const s = 1.42, k = E.outBack(clamp((t - pops[i]) / 0.3), 2);
    if (k <= 0.01) { H3.push(null); return; }
    const pen = ramp(t, pens[i], pens[i] + 0.3, E.outBack);
    const side = cl.hand === 'R' ? 'L' : 'R';   // his right hand is the rig's L
    const up = { e: [side === 'L' ? -140 : 140, -330], w: [side === 'L' ? -108 : 108, -478] };
    const restS = side === 'L' ? ARM_REST : { e: [104, -272], w: [114, -184] };
    const arm = armMix(restS, up, E.inOutSine(pen));
    const crownK = ramp(t, crowns[i], crowns[i] + 0.3, E.linear);
    const mismatch = cl.boss !== cl.hand;
    const face = mismatch && t > marks[i] ? { ...FACES.confused, lookX: side === 'R' ? 0.9 : -0.9, lookY: -0.6 } : faceSeq(t, [[-1, DF.calm], [crowns[i], { ...DF.proud, lookX: 0, lookY: -0.8 }]]);
    const A = { x: cl.x, y: 1530 + 120 * (1 - k), s: s * (0.9 + 0.1 * k), face, pal: CLONE_PALS[i] };
    if (side === 'L') { A.armL = arm; A.handL = pen > 0.3 ? 'open' : 'open'; } else { A.armR = arm; A.handR = 'open'; }
    // the crown on the boss eye: his right eye sits at head x -24 (screen-left), his left at +24
    A.post = (lc, rr, st) => {
      if (crownK > 0.01) {
        lc.save(); lc.translate(st.x, st.y); lc.scale(st.s, st.s);
        lc.translate(rr.head[0] + (cl.boss === 'R' ? -26 : 26), rr.head[1] - 40 + (1 - clamp(crownK * 1.3)) * -40);
        crownIcon(lc, 0, 0, E.outBack(clamp(crownK), 2.4), cl.boss === 'R' ? -0.16 : 0.16);
        lc.restore();
      }
      if (pen > 0.01) {   // the pencil in the raised hand
        const wr = rr['wr' + side];
        lc.save(); lc.translate(st.x, st.y); lc.scale(st.s, st.s); lc.translate(wr[0], wr[1] - 14); lc.rotate(side === 'L' ? -0.35 : 0.35); lc.scale(pen, pen);
        rrect(lc, -7, -78, 14, 70, 3); lc.fillStyle = '#FFC531'; lc.fill();
        lc.beginPath(); lc.moveTo(-7, -78); lc.lineTo(0, -98); lc.lineTo(7, -78); lc.closePath(); lc.fillStyle = '#F4D7A8'; lc.fill();
        lc.beginPath(); lc.moveTo(-2.4, -91); lc.lineTo(0, -98); lc.lineTo(2.4, -91); lc.closePath(); lc.fillStyle = '#2A2A3A'; lc.fill();
        rrect(lc, -7, -12, 14, 12, 2); lc.fillStyle = '#FF86A6'; lc.fill();
        lc.restore();
      }
    };
    const st = { x: A.x, y: A.y, s: A.s };
    let pose = Object.assign({}, POSES.stand, { hand: 'open' });
    const aL = A.armL || ARM_REST, aR = A.armR || { e: [104, -272], w: [114, -184] };
    pose = armAt(pose, 'L', aL.e, aL.w); pose = armAt(pose, 'R', aR.e, aR.w);
    Object.assign(st, { pose, face, noLegs: true });
    charLayer(cam, st, t, { pal: A.pal, post: A.post });
    H3.push({ st, head: [st.x, st.y - 470 * st.s] });
  });
  screenSpace();
  // 2 in 3: a bracket over the first two crowns
  const bk = ramp(t, c.boss4 + 0.1, c.boss4 + 0.4, E.outBack);
  if (bk > 0.01 && H3[0] && H3[1]) {
    const y = toScreen(cam, 0, H3[0].head[1] - 1.5 * 150)[1];
    const x0 = toScreen(cam, H3[0].head[0], 0)[0], x1 = toScreen(cam, H3[1].head[0], 0)[0];
    paint(() => {
      ctx.lineWidth = 7; ctx.strokeStyle = `rgba(255,212,71,${clamp(bk)})`; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x0, y + 26); ctx.lineTo(x0, y); ctx.lineTo(x1, y); ctx.lineTo(x1, y + 26); ctx.stroke();
    });
    hlTag('RIGHT EYE: 2 IN 3', (x0 + x1) / 2 + 60, y - 80, '#FFD447', bk, null, 50);
  }
  // the ticks and the cross under the writing hands
  CLONES.forEach((cl, i) => {
    const k = ramp(t, marks[i], marks[i] + 0.25, E.outBack);
    if (k <= 0.01 || !H3[i]) return;
    const ok = cl.boss === cl.hand, p = toScreen(cam, H3[i].head[0], H3[i].head[1]);
    const x = p[0], y = p[1] + 300;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    circle(ctx, 0, 0, 46, ok ? '#4DFFB4' : '#FF5A6E');
    paint(() => {
      ctx.lineWidth = 12; ctx.strokeStyle = '#0B0B1A'; ctx.lineCap = 'round'; ctx.beginPath();
      if (ok) { ctx.moveTo(-20, 2); ctx.lineTo(-5, 18); ctx.lineTo(22, -16); } else { ctx.moveTo(-16, -16); ctx.lineTo(16, 16); ctx.moveTo(16, -16); ctx.lineTo(-16, 16); }
      ctx.stroke();
    });
    ctx.restore();
  });
  return { glow: 0.85 };
};

// ================================================================ the button: the intern does depth... and winking
SC.button = (lt, t) => {
  const S = buttonS(t);
  const { H, cam } = frontDraw(t, S);
  frontTags(S, H, cam);
  return { glow: 0.85 };
};

// ================================================================ the cover: the boss eye
SC.cover = (lt, t) => {
  const S = { cam: { x: 600, y: 1040, zoom: 1.18, rot: 0 }, arm: ARM_POINT, hand: 'point', face: { ...DF.squintL }, crown: 1, glint: 0.8 };
  frontDraw(t, S);
  screenSpace();
  bigWord('WHICH EYE', 540, 1250, 150, '#FFFFFF', 1, -0.03);
  bigWord('IS BOSS?', 540, 1395, 150, '#FFD447', 1, -0.03);
  return { glow: 0.85, noCaptions: true };
};

function initScenes2() {
  initHill();
  initPov();
}
