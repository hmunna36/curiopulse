// Why Do You Get DIZZY When You Spin? Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside
// the shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;
const pulseOf = (t, times, len = 0.16) => times.reduce((m, f) => Math.max(m, clamp((t - f) / 0.03) * clamp((f + len - t) / 0.05)), 0);
const bumpAt = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the office at night: a ceiling light up and to the left; the back light is the monitor and the window, and while the
// chair turns it goes round him with the room
const OFFICE_LIGHT = { ...LIGHTS.room, rim: [0.55, 0.78, 1.0], rimFrom: [0.8, -0.45], rimAmt: 1.2, pool: 0.5, halo: 0.12 };
const INNER_LIGHT = { ...LIGHTS.inside, rim: [0.6, 0.85, 1.0], pool: 0.3, halo: 0 };
const STAGE_LIGHT = { ...LIGHTS.lanterns, key: [-0.12, -0.86, 0.5], keyTint: [1.12, 1.03, 0.92], rim: [1.0, 0.5, 0.72], rimFrom: [0.85, -0.45], rimAmt: 1.3, pool: 0.75, halo: 0.12, haloColor: [1.0, 0.8, 0.6] };

// ---------------------------------------------------------------- his faces
const FF = {
  whee: { eyeOpen: 1.3, pupil: 0.72, lookX: 0, lookY: -0.35, browY: 1.5, browTilt: -0.2, mouth: 'grin', mouthOpen: 1.35, blink: 0, cross: 0 },
  jolt: { eyeOpen: 1.42, pupil: 0.55, lookX: 0, lookY: 0, browY: 1.5, browTilt: 0.4, mouth: 'o', mouthOpen: 0.85, blink: 0, cross: 0 },
  woozy: { eyeOpen: 1.18, pupil: 0.82, lookX: 0, lookY: 0, browY: 0.9, browTilt: 1.1, mouth: 'wavy', mouthOpen: 0.3, blink: 0.1, cross: 0 },
  side: { eyeOpen: 1.2, pupil: 0.8, lookX: 1, lookY: -0.15, browY: 1.0, browTilt: 0.8, mouth: 'o', mouthOpen: 0.4, blink: 0.05, cross: 0 },
  deadpan: { eyeOpen: 0.92, pupil: 1, lookX: 0, lookY: 0.9, browY: -0.25, browTilt: -0.35, mouth: 'flat', mouthOpen: 0, blink: 0.36, cross: 0 },
  watch: { eyeOpen: 1.1, pupil: 0.9, lookX: 1, lookY: -0.1, browY: 0.7, browTilt: 0.3, mouth: 'o', mouthOpen: 0.3, blink: 0, cross: 0 },
  mischief: { eyeOpen: 1, pupil: 1, lookX: 0.2, lookY: -0.1, browY: 0.7, browTilt: -0.9, mouth: 'grin', mouthOpen: 0.75, blink: 0.28, cross: 0 },
  spot: { eyeOpen: 1.05, pupil: 1, lookX: 0, lookY: 0, browY: 0.6, browTilt: -0.2, mouth: 'grin', mouthOpen: 0.6, blink: 0, cross: 0 },
  smug: { eyeOpen: 0.9, pupil: 1, lookX: 0, lookY: 0, browY: 0.8, browTilt: -0.55, mouth: 'grin', mouthOpen: 0.5, blink: 0.48, cross: 0 },
};
// the eyes after a spin: a slow drift one way, a snap back (nystagmus); amplitude dies away
function nys(u) {
  if (u <= 0) return 0;
  const P = 0.42, ph = (u % P) / P, saw = ph < 0.85 ? lerp(-0.7, 0.8, ph / 0.85) : lerp(0.8, -0.7, (ph - 0.85) / 0.15);
  return saw * Math.exp(-u / 5);
}

// ================================================================ the chair: how fast it turns, and what his ears say
const W0 = 7.4;                       // rad/s while he spins
function spinW(tt) {
  const c = cu();
  if (tt < 0) return W0 * (0.2 + 0.8 * E.inOutSine(clamp((tt + 0.4) / 0.4)));   // he pushes off (the last 0.4 s of the Short)
  if (tt < c.stop) return W0 * (1 + 0.04 * Math.sin(tt * 5));
  return 0;                                                                    // the chair stops dead
}
// after the stop the room seems to turn the other way, slowing (what his ears tell him)
function ghostW(tt) {
  const c = cu();
  if (tt < c.stop) return 0;
  const u = tt - c.stop;
  return -0.42 * W0 * Math.exp(-u / 2.4) * (1 - Math.exp(-u / 0.12)) * (1 + 0.22 * Math.sin(u * 6));
}
function roomAng(tt) {
  let a = 0;
  for (let x = -0.4; x < tt; x += 1 / 240) a += (spinW(x) + ghostW(x)) / 240;
  return a;
}

// ================================================================ the hook: frame 1 and round it
const NW = [OF.hx + 135, OF_HEADY - 10];           // the window beside his right ear (world)
const WIN_R = 66, WIN_S = 0.19;                     // its radius (world) and its scale (world units per organ unit)
const CANAL0 = { F: [-60, 20], s: 3.2, P: [540, 860] };   // how the canal shot opens: organ point F at P, s px per unit
// the opening as a function of tt = seconds since frame 1 (negative = the last frames of the Short, on their way here)
function hookA(tt) {
  const c = cu();
  const spinning = tt < c.stop, after = tt - c.stop;
  const jolt = spinning ? 0 : bumpAt(tt, c.stop, 4.5);
  let face = FF.whee;
  if (!spinning) {
    face = lerpFace(FF.jolt, FF.woozy, ramp(tt, c.stop + 0.3, c.room + 0.25));
    face = lerpFace(face, FF.side, ramp(tt, c.window - 0.15, c.window + 0.2));
    face = { ...face, lookX: face.lookX + 0.9 * nys(after - 0.25) * (1 - 0.5 * ramp(tt, c.window, c.window + 0.3)), blink: Math.max(face.blink, pulseOf(tt, [c.doesnt_end + 0.1], 0.12)) };
  }
  const tie = spinning ? 0.6 + 0.06 * Math.sin(tt * 21) : 0.6 * Math.exp(-after * 2.4) * Math.cos(after * 9.5) + 0.05 * Math.sin(tt * 2.3);
  const A = {
    face, tie,
    armL: OF_ARM.gripL, armR: OF_ARM.gripR,
    bob: spinning ? 2.4 * Math.sin(tt * 31) : -7 * jolt,
    lean: spinning ? (tt < 0 ? -0.03 * Math.sin(Math.PI * clamp(-tt / 0.4)) : 0) : 0.075 * jolt * Math.cos(after * 7) + 0.03 * Math.sin(tt * 2.6) * (1 - jolt),
    headRot: spinning ? -0.07 : 0.06 * Math.sin(tt * 2.2) * (1 - jolt) - 0.04 * jolt,
    headDX: spinning ? -6 : 3 * Math.sin(tt * 1.7),
    headDY: 9 * jolt,
  };
  return { A, w: spinW(tt) + ghostW(tt), ang: roomAng(tt), jolt, spinning };
}
function hookCam(tt) {
  const c = cu(), HY = OF_HEADY;
  const k = camKeys(tt, [[-0.4, 540, HY + 84, 2.62], [0, 540, HY + 70, 2.8], [c.stop, 540, HY + 72, 2.86], [c.room, 540, HY + 96, 2.58], [c.doesnt_end, 546, HY + 96, 2.55],
    [c.head + 0.3, 580, HY + 46, 2.78], [c.window, 600, HY + 30, 2.9], [c.dive, 604, HY + 26, 2.95]], E.inOutCubic);
  const sh = (tt < c.stop ? 2.6 : 0) + 13 * (tt >= c.stop ? bumpAt(tt, c.stop, 7) : 0);
  k.x += sh * vnoise(tt * 33, 3); k.y += sh * vnoise(tt * 29, 8);
  if (tt > c.stop) k.rot = 0.05 * Math.sin((tt - c.stop) * 2.4) * ramp(tt, c.stop + 0.15, c.room + 0.4) * (1 - 0.6 * ramp(tt, c.head, c.window));
  return k;
}
function hookDraw(tt, t, o) {
  const c = cu(), S = o.S, cam = o.cam;
  ofRoom(cam, t, S.ang, S.w, {});
  applyCam(cam);
  const sw = clamp(Math.abs(S.w) / W0) * (S.spinning ? 1 : 0);
  ofSwoosh(ctx, gctx, 'back', sw, S.ang);
  ofChairBack(ctx);
  const H = ofHero(cam, t, S.A);
  applyCam(cam);
  ofOcclude(H);
  ofSwoosh(ctx, gctx, 'front', sw, S.ang);
  // dizzy stars round his head once the room has kept going
  const sk = tt > c.stop ? ramp(tt, c.room + 0.3, c.doesnt + 0.2) * (1 - ramp(tt, c.window - 0.2, c.window + 0.1)) : 0;
  if (sk > 0.01) dzStars(ctx, gctx, H.top[0], H.top[1] - 26, 112, 24, t, sk, 5);
  // the jolt of the stop: lines off the chair
  const hit = tt >= c.stop ? bumpAt(tt, c.stop, 6) : 0;
  if (hit > 0.05) { const B = toScreen(cam, OF.hx, OF.floor - 262); shockLines(B[0], B[1], 320, 1 - hit, 12, '#FFFFFF', 4); }
  if (o.win > 0) vbWindow(cam, NW, WIN_R, WIN_S, o.win, t, { ear: H.earR, glowA: 0.75, flow: [360 * t, 330 * t, 390 * t], lit: [0.4, 0.4, 0.4 + 0.6 * bumpAt(t, c.didnt, 3)], bend: [0.6, 0.6, 0.7], snail: 0.4,
    drop: { canal: 2, s: 560 * t, k: ramp(t, c.liquid - 0.1, c.liquid + 0.15), mood: 'whee', size: 1.15 } });
  return H;
}

SC.hook = (lt, t, shot) => {
  const c = cu(), S = hookA(t), cam = hookCam(t);
  const win = ramp(t, c.window, c.window + 0.3), dive = ramp(t, c.dive, shot.end, E.inCubic);
  if (dive > 0) {   // through the window: it ends where the canal shot opens, at its size
    const Q = [NW[0] + CANAL0.F[0] * WIN_S, NW[1] + CANAL0.F[1] * WIN_S], P0 = toScreen(cam, Q[0], Q[1]);
    const K = CANAL0.s / (WIN_S * cam.zoom);
    Object.assign(cam, scaledCam(cam, Q, 1 + (K - 1) * dive));
    cam.sx = (CANAL0.P[0] - P0[0]) * dive; cam.sy = (CANAL0.P[1] - P0[1]) * dive;
    cam.rot = (cam.rot || 0) * (1 - dive);
  }
  hookDraw(t, t, { cam, S, win });
  // WHEEE! by the window as the liquid laps: on "DIDN'T!"
  const P = toScreen(cam, NW[0] + 10, NW[1] - WIN_R - 18);
  dzBurst('WHEEE!', P[0], P[1] - 30, 54, popK(t, c.didnt - 0.02, c.dive - 0.02, 0.1, 0.08), '#7FE9FF', -0.08, 3);
  return { glow: 0.85, zblur: 0.3 * dive, zcx: CANAL0.P[0], zcy: CANAL0.P[1], flash: 0.18 * bumpAt(t, c.stop, 9) };
};

// ================================================================ inside: the three loops, then the bulge up close
// an organ-unit camera from keys [t, fx, fy, s, px, py] (absolute time): organ point (fx, fy) lands at (px, py)
function organKeys(t, keys, ease = E.inOutCubic) {
  let k = keys[0];
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1], b = keys[i];
    if (t >= b[0]) { k = b; continue; }
    if (t > a[0]) { const u = ease(inv(a[0], b[0], t)); k = [t, ...[1, 2, 3, 4, 5].map((j) => lerp(a[j], b[j], u))]; }
    break;
  }
  return { x: k[4] - k[1] * k[3], y: k[5] - k[2] * k[3], s: k[3] };
}
const vbPt = (V, x, y) => [V.x + x * V.s, V.y + y * V.s];
// how far the liquid in the bulge has gone (amp units): to the right while the head turns, then it sloshes back the
// other way after "Stop," (the walls stop, the liquid does not)
function ampSpeed(t) {
  const c = cu();
  if (t < c.stop2) return 280;
  return lerp(280, -320, E.inOutSine(clamp((t - c.stop2) / 0.55)));
}
function ampFlow(t) { const c = cu(), t0 = c.bending - 0.06; let x = 0; for (let u = t0; u < t; u += 1 / 120) x += ampSpeed(u) / 120; return x; }
function ampBend(t) {
  const c = cu();
  const b1 = 0.85 * ramp(t, c.bending - 0.05, c.hairs + 0.15, E.outCubic);
  const sw = ramp(t, c.stop2 + 0.12, c.keeps + 0.1, E.inOutCubic);
  return lerp(b1, -0.9, sw) + 0.12 * Math.sin(t * 13) * bumpAt(t, c.stop2, 3);
}
SC.canal = (lt, t, shot) => {
  const c = cu(), swap = c.bending - 0.06;
  vbBg(t);
  if (t < swap) {
    const V = organKeys(t, [[shot.start, CANAL0.F[0], CANAL0.F[1], CANAL0.s, CANAL0.P[0], CANAL0.P[1]], [c.round + 0.25, -10, -10, 1.15, 540, 900], [swap - 0.32, -10, -10, 1.22, 540, 900],
      [swap, -150, -2, 4.4, 540, 880]], E.inOutCubic);
    const lit = [c.three, c.tiny, c.loops].map((f, i) => 0.25 + 0.75 * Math.max(bumpAt(t, f, 2.2), 0.3 * ramp(t, c.loops_end, c.loops_end + 0.3)));
    vbOn(V, () => vbDraw(t, { flow: [360 * t, 330 * t, 390 * t], lit: [lit[0], lit[2], lit[1]], bend: [0.6, 0.6, 0.7], snail: 0.45, nerve: 0,
      drop: { canal: 2, s: 560 * t, k: 1 - ramp(t, c.round, c.round + 0.2), mood: 'whee', size: 1 } }));
    // what each loop feels: NOD, SHAKE, TILT (inside the loops), on "three tiny loops"
    const tags = [[c.three, 20, -175, 'NOD', '#FFD447'], [c.tiny, -255, 60, 'SHAKE', '#7FE9FF'], [c.loops, 222, 70, 'TILT', '#4DFFB4']];
    for (const [f, x, y, txt, col] of tags) { const p = vbPt(V, x, y); pill(p[0], p[1], txt, col, ramp(t, f - 0.04, f + 0.16) * (1 - ramp(t, swap - 0.3, swap - 0.12)), 34); }
    const z = ramp(t, swap - 0.3, swap, E.inCubic);
    return { glow: 0.9, zblur: 0.35 * (1 - ramp(lt, 0, 0.3)) + 0.32 * z, zcx: 540, zcy: 880, flash: 0.22 * (1 - ramp(lt, 0, 0.14)) };
  }
  // the bulge up close
  const V = organKeys(t, [[swap, 0, 30, 1.75, 540, 880], [c.hairs + 0.1, 0, 90, 2.45, 540, 900], [c.brain, 0, 100, 2.1, 540, 880], [c.turning + 0.3, 0, 60, 1.75, 540, 880],
    [c.stop2, 0, 60, 1.75, 540, 880], [c.sloshing_end, 0, 50, 1.9, 540, 880]], E.inOutCubic);
  const jolt = bumpAt(t, c.stop2, 6);
  V.x += 16 * jolt * vnoise(t * 40, 2); V.y += 12 * jolt * vnoise(t * 37, 5);
  const bend = ampBend(t);
  let mood = 'calm';
  if (t >= c.bending + 0.1) mood = 'alert';
  if (t >= c.turning - 0.03 && t < c.stop2) mood = 'shout';
  if (t >= c.stop2) mood = t < c.stop2 + 0.35 ? 'strain' : 'panic';
  ampOn(V, () => ampDraw(t, { flow: ampFlow(t), bend, mood, signal: ramp(t, c.tell - 0.1, c.brain) * (t < c.stop2 ? 1 : 0.8), sweat: ramp(t, c.keeps, c.sloshing) }));
  // TURNING! from the hairs
  dzBurst('TURNING!', 540, 540, 104, popK(t, c.turning - 0.02, c.stop2 - 0.06, 0.1, 0.1), '#FF9A3C', -0.06, 7);
  // the head has stopped; the liquid has not
  pill(540, 486, 'HEAD: STOPPED', '#FF5A6E', ramp(t, c.stop2 - 0.03, c.stop2 + 0.15), 40);
  pill(540, 590, 'LIQUID: STILL GOING', '#7FE9FF', ramp(t, c.keeps - 0.05, c.keeps + 0.15), 40);
  // where the signal goes
  const nb = vbPt(V, 0, AMP.floor + 330);
  pill(Math.min(nb[0] + 170, 740), Math.min(nb[1], 1180), 'TO BRAIN', '#FFC24A', ramp(t, c.brain - 0.1, c.brain + 0.1) * (1 - ramp(t, c.stop2 - 0.2, c.stop2)), 34);
  return { glow: 0.9, flash: 0.24 * (1 - ramp(t, swap, swap + 0.12)) + 0.12 * bumpAt(t, c.stop2, 9), zblur: 0.22 * (1 - ramp(t, swap, swap + 0.25)), zcx: 540, zcy: 880 };
};

// ================================================================ the shouting match: ears vs eyes, the brain in between
function earsCam(t) {
  const c = cu();
  const k = camKeys(t, [[c.ears2 - 0.4, 540, OF_HEADY - 10, 1.9], [c.nope_end + 0.3, 540, OF_HEADY - 18, 1.98]], E.inOutSine);
  k.rot = 0.03 * Math.sin(t * 2.1);
  return k;
}
SC.ears = (lt, t, shot) => {
  const c = cu(), cam = earsCam(t);
  ofRoom(cam, t, 2.2 + 0.22 * Math.sin(t * 0.9), 0.4, {});
  applyCam(cam);
  ofChairBack(ctx);
  let face = FF.woozy;
  face = { ...face, lookX: 0.85 * nys(t - shot.start + 1.2) / Math.exp(-(t - shot.start + 1.2) / 5) * 0.5, blink: Math.max(face.blink, pulseOf(t, [c.nope_end + 0.1], 0.12)) };
  const H = ofHero(cam, t, { face, tie: 0.04 * Math.sin(t * 2.3), armL: OF_ARM.gripL, armR: OF_ARM.gripR, bob: 0, lean: 0.03 * Math.sin(t * 2.5), headRot: 0.06 * Math.sin(t * 2.2), headDX: 3 * Math.sin(t * 1.7) });
  // the brain in a thought bubble above his head
  screenSpace();
  const hs = toScreen(cam, H.top[0], H.top[1]);
  const bk = ramp(t, shot.start - 0.02, shot.start + 0.22);
  thoughtBubble(540, 600, 400, 300, bk, hs[0], hs[1] - 20);
  const lookEar = ramp(t, c.ears2 - 0.1, c.ears2 + 0.15) * (1 - ramp(t, c.eyes - 0.15, c.eyes + 0.1));
  const lookEye = ramp(t, c.eyes - 0.15, c.eyes + 0.1);
  const giddy = ramp(t, c.nope + 0.25, c.nope_end + 0.1);
  const mood = giddy > 0.5 ? 'dizzy' : t > c.ears2 ? 'worried' : 'calm';
  const spin = giddy > 0.5 ? (t - c.nope - 0.25) * 9 * giddy : 0;
  if (bk > 0.01) {
    const q = E.outBack(clamp(bk), 1.6);
    actor(() => dzBrain(ctx, 540, 604, 0.66 * q, t, { mood, look: [lookEye - lookEar, 0.2], lean: Math.sin(spin) * 0.25 * giddy, noArms: false, armL: [-176, 90 - 40 * lookEar], armR: [176, 90 - 40 * lookEye], spin: 1 }));
    dzStars(ctx, gctx, 540, 500, 160, 28, t, giddy, 5);
  }
  // the ear's hair cell, with a megaphone, at his left; the eyeball at his right
  const ek = ramp(t, c.ears2 - 0.1, c.ears2 + 0.15), yk = ramp(t, c.eyes - 0.12, c.eyes + 0.12);
  const earS = toScreen(cam, H.earL[0], H.earL[1]), eyeS = toScreen(cam, H.earR[0], H.earR[1]);
  if (ek > 0.01) actor(() => dzCellGuy(ctx, lerp(earS[0], 220, E.outBack(ek, 1.6)), lerp(earS[1], 880, E.outBack(ek, 1.6)), 1.75 * clamp(ek * 1.2), t, { mood: t > c.spinning - 0.05 ? 'shout' : 'calm', ang: -0.75, mega: ramp(t, c.yell1 - 0.1, c.yell1 + 0.1), bend: 0.9 }));
  if (yk > 0.01) actor(() => dzEyeGuy(ctx, lerp(eyeS[0], 860, E.outBack(yk, 1.6)), lerp(eyeS[1], 860, E.outBack(yk, 1.6)), 1.6 * clamp(yk * 1.2), t, { mood: t > c.nope - 0.05 ? 'nope' : 'calm', ang: -2.35, mega: ramp(t, c.yell2 - 0.1, c.yell2 + 0.1), look: [-0.6, -0.5] }));
  dzBurst('SPINNING!', 350, 655, 74, popK(t, c.spinning - 0.02, c.nope - 0.1, 0.1, 0.1), '#FF9A3C', -0.12, 11);
  dzBurst('NOPE!', 800, 660, 92, popK(t, c.nope - 0.02, shot.end + 1, 0.1, 0.1), '#FF5A6E', 0.1, 13);
  return { glow: 0.85, flash: 0.2 * (1 - ramp(lt, 0, 0.12)) };
};

// ================================================================ the ballet stage: dancers' brains turn it down
function stageTurn(t) {   // the pirouette: whole turns, a crisp stop facing us on "may"
  const c = cu(), t0 = c.ballet - 0.3, t1 = c.may - 0.12, N = Math.max(2, Math.round((t1 - t0) * 1.9));
  if (t >= t1) return { turn: 0, spin: 0, done: t - t1 };
  const u = clamp((t - t0) / (t1 - t0));
  return { turn: Math.PI * 2 * N * (u < 0.85 ? u / 0.85 * 0.93 : 0.93 + 0.07 * E.outCubic((u - 0.85) / 0.15)), spin: 1, done: -1 };
}
SC.stage = (lt, t, shot) => {
  const c = cu();
  const cam = camKeys(lt, [[0, 540, 1150, 1.1], [shot.end - shot.start, 540, 1120, 1.16]], E.inOutSine);
  stBack(cam, t);
  applyCam(cam);
  stCurtains(ctx, t, 1);
  stSpot(cam, ST.hx, 1);
  applyCam(cam);
  const P = stageTurn(t), done = P.done >= 0, settle = done ? bumpAt(P.done, 0, 6) : 0;
  const A = done
    ? { turn: 0, spin: 0, face: lerpFace(FF.spot, FF.smug, ramp(P.done, 0.1, 0.35)), armL: armMix(ST_ARM.upL, ST_ARM.tadaL, ramp(P.done, 0, 0.22, E.outBack)), armR: armMix(ST_ARM.upR, ST_ARM.tadaR, ramp(P.done, 0, 0.22, E.outBack)), bob: -6 * settle }
    : { turn: P.turn, spin: 1, face: FF.spot, armL: ST_ARM.upL, armR: ST_ARM.upR, legR: { a: 1.3, b: -2.4 }, bob: 0 };
  const H = stHero(cam, t, A);
  // the brain and its dial, in a thought bubble
  screenSpace();
  const hs = toScreen(cam, H.head[0], H.head[1] - 110);
  const bk = ramp(t, c.brains - 0.12, c.brains + 0.12);
  thoughtBubble(540, 640, 660, 400, bk, hs[0], hs[1]);
  const reach = ramp(t, c.turn - 0.25, c.turn + 0.1), down = ramp(t, c.down - 0.12, c.down + 0.22, E.outBack);
  if (bk > 0.01) {
    const q = E.outBack(clamp(bk), 1.6);
    stDial(690, 640, 1.18 * q, lerp(0.93, 0.1, clamp(down)) + 0.04 * Math.sin(t * 24) * (1 - down), bk, t);
    actor(() => dzBrain(ctx, 372, 650, 0.62 * q, t, { mood: down > 0.6 ? 'smug' : reach > 0.5 ? 'think' : 'calm', look: [0.9 * reach, 0], armR: [lerp(176, 420, reach), lerp(118, 20, reach)], armL: [-176, 118] }));
  }
  pill(540, 1540, 'BALLET DANCERS · SCANS, 2013', '#C8A8FF', ramp(t, c.dancers - 0.05, c.dancers + 0.15), 30);
  return { glow: 0.85, flash: 0.2 * (1 - ramp(lt, 0, 0.12)) + 0.1 * bumpAt(t, c.down, 8) };
};

// ================================================================ the button: sit down, and let the lap finish
const BTN_WIN = { R: 84, S: 0.44, focus: [-214, 30] };
function buttonA(t) {
  const c = cu();
  let face = lerpFace(FF.woozy, FF.deadpan, ramp(t, c.so - 0.2, c.sit + 0.1));
  face = lerpFace(face, FF.watch, ramp(t, c.and_let - 0.1, c.and_let + 0.2));
  face = lerpFace(face, FF.mischief, ramp(t, c.lap_end - 0.05, c.lap_end + 0.25));
  face = { ...face, blink: Math.max(face.blink, pulseOf(t, [c.sitdown + 0.3], 0.12)) };
  const lean = 0.06 * ramp(t, c.lap_end + 0.3, c.loop, E.inOutSine);
  return { face, tie: 0.03 * Math.sin(t * 2.3), armL: OF_ARM.gripL, armR: OF_ARM.gripR, bob: -3 * ramp(t, c.sitdown, c.sitdown + 0.2) * (1 - ramp(t, c.sitdown + 0.2, c.sitdown + 0.5)), lean, headRot: 0.025 * Math.sin(t * 1.9) - 0.05 * ramp(t, c.lap_end, c.lap_end + 0.3), headDX: 0 };
}
SC.button = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 596, OF_HEADY + 120, 2.08], [D, 600, OF_HEADY + 112, 2.2]], E.inOutSine);
  ofRoom(cam, t, 2.05 + 0.03 * Math.sin(t * 0.7), 0, {});
  applyCam(cam);
  ofChairBack(ctx);
  const H = ofHero(cam, t, buttonA(t));
  // the window on his ear: the droplet on its last lap crosses the line on "lap"
  const C = [OF.hx + 152, OF_HEADY - 22], k = ramp(t, c.and_let - 0.1, c.and_let + 0.25);
  const L2 = VB.canals[2].L, sF = 0.27 * L2, v = 420;
  const sD = t < c.lap ? sF + v * (t - c.lap) : sF + v * 0.55 * (1 - Math.exp(-(t - c.lap) * 2.2)) / 0.55 * 0.42;
  const crossed = t >= c.lap;
  vbWindow(cam, C, BTN_WIN.R, BTN_WIN.S, k, t, { ear: H.earR, focus: BTN_WIN.focus, glowA: 0.5, flow: [300 * t, 280 * t, 330 * t * (crossed ? 0.6 : 1)], lit: [0.2, 0.2, 0.5], bend: [0.3, 0.3, 0.4], snail: 0.3,
    finish: { canal: 2, s: sF, k: ramp(t, c.and_let, c.and_let + 0.3), flag: crossed ? 1 : 0, size: 1.5 }, drop: { canal: 2, s: sD, k: 1, mood: crossed ? 'proud' : 'whee', size: 1.6 } });
  // confetti in the window when it crosses
  if (crossed) {
    const Cs = toScreen(cam, C[0], C[1]), rng = mulberry32(9), u = t - c.lap;
    screenSpace();
    for (let i = 0; i < 18; i++) {
      const a = rng() * Math.PI * 2, sp = 120 + rng() * 160, x = Cs[0] + Math.cos(a) * sp * u * 1.2, y = Cs[1] + Math.sin(a) * sp * u * 1.2 + 260 * u * u;
      if (Math.hypot(x - Cs[0], y - Cs[1]) > BTN_WIN.R * cam.zoom - 8 || u > 1.4) continue;
      ctx.save(); ctx.translate(x, y); ctx.rotate(u * 9 + i); ctx.fillStyle = ['#FFD447', '#FF86A6', '#7FE9FF', '#4DFFB4'][i % 4]; ctx.fillRect(-7, -4, 14, 8); ctx.restore();
    }
  }
  return { glow: 0.85, flash: 0.2 * (1 - ramp(lt, 0, 0.12)) };
};

// the last 0.4 s: the hook at negative time (he grabs the armrests and pushes off), so the Short loops into frame 1
SC.loop = (lt, t, shot) => {
  const tt = t - TLd.duration, S = hookA(tt), cam = hookCam(tt);
  hookDraw(tt, t, { cam, S, win: 0 });
  return { glow: 0.85, flash: 0.16 * (1 - ramp(lt, 0, 0.1)) };
};

// ================================================================ the cover (rendered by src/cover.sh from a one-shot timeline)
SC.cover = (lt, t) => {
  const tt = 0.7, S = hookA(tt), cam = { x: 540, y: OF_HEADY + 120, zoom: 2.45, rot: -0.04 };
  S.A.face = { ...FF.woozy, lookX: 0.8, mouth: 'wavy' };
  S.ang += 1.2;   // the swooshes round him fall at his sides, not across his chin
  hookDraw(tt, 0.7, { cam, S, win: 0 });
  applyCam(cam);
  const H = { top: [OF.hx, OF_HEADY - 84] };
  dzStars(ctx, gctx, H.top[0], H.top[1] - 30, 112, 24, 0.9, 1, 5);
  screenSpace();
  bigWord('STILL', 540, 1210, 150, '#FFFFFF', 1, -0.04);
  bigWord('SPINNING?', 540, 1380, 170, '#FFD447', 1, -0.04);
  return { glow: 0.85, noCaptions: true };
};

setLights({
  hook: (lt, t) => { const a = roomAng(t); return { ...OFFICE_LIGHT, rimFrom: [0.85 * Math.cos(a * 0.5), -0.45] }; },
  loop: (lt, t) => { const a = roomAng(t - TLd.duration); return { ...OFFICE_LIGHT, rimFrom: [0.85 * Math.cos(a * 0.5), -0.45] }; },
  cover: OFFICE_LIGHT, ears: OFFICE_LIGHT, button: OFFICE_LIGHT,
  canal: INNER_LIGHT, stage: STAGE_LIGHT,
});

function initScenes2() {
  initOffice();
  initVestib();
  initStage();
}
