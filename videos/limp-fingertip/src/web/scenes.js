// Hook Your Finger. Can You Straighten the TIP? 👆 — the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds
// inside the shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash, flashTop, grain: 0,
//    overlay: fn, noCaptions, capY, focus}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
// Worlds: lf_world.js (the lakeside porch at sunset, the ladybug, the poking finger, the three strings), ft_world.js
// (finger-tip-bend's hand pointing up, its joints one by one), fist3d.js (one-finger's 3D hand), bwhand.js (bent-wrist-fist's
// forearm and glass). The whole Short is ONE state over time (`lfS(tt)`, valid at negative time for the loop): every shot
// draws from it, so the hand never jumps between cuts.
'use strict';

const cu = () => TLd.cues;

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the porch at sunset: the low sun on the right, behind him over the lake (a warm rim), the lantern and the string lights
const LF_LIGHT = { ...LIGHTS.sunset, rimAmt: 1.35, halo: 0.12 };
const LF_GLASS = { ...LIGHTS.sunset, form: 0.8, cast: 0.6, rimAmt: 1.1 };
setLights({ hook: LF_LIGHT, answer: LF_LIGHT, offline: LF_LIGHT, poke: LF_LIGHT, strings: LF_GLASS, slack: LF_GLASS,
  doctors: LF_LIGHT, jammed: LF_LIGHT, stiff: LF_GLASS, torn: LF_GLASS, button: LF_LIGHT, fine: LF_LIGHT, loop: LF_LIGHT,
  cover: LF_LIGHT });

// his left forearm stands on the table, elbow down, the hand up beside his face (world points)
const LFT = { PX: 38 };
const LF_WR = [676, 1240];
const LF_EL = [694, 1470];
const LF_HOOK = { mcp: 0.08, pip: 1.5, dip: 0.74 };   // the hook (rad): the middle joint at about 90 degrees, the tip hanging
const lfClone = (p) => JSON.parse(JSON.stringify(p));

// a damped wobble after a push (u = seconds since the release)
function lfWob(u, amp, w = 19, d = 5.5) { return u < 0 ? 0 : amp * Math.exp(-d * u) * Math.cos(w * u); }

// ---------------------------------------------------------------- the state of everything at time tt
// tt = video seconds; negative = the Short's last frames (the loop), which run into frame 1
function lfS(tt) {
  const c = cu(), S = {};
  const r = (a, b, e = E.inOutCubic) => (tt < 0 ? 0 : ramp(tt, a, b, e));
  // ---- the index finger: frame 0 is the hook, a little open; it settles on "hook"
  const settle = r(c.hook_w - 0.12, c.hook_end + 0.1, E.outBack);
  let pip = lerp(1.32, LF_HOOK.pip, settle), dip = lerp(0.66, LF_HOOK.dip, settle), trem = 0;
  if (tt >= 0) {
    // "now straighten just the TIP": it strains (a twitch, a tremble) and stays curled
    const st = popK(tt, c.strain1, c.tip1_end + 0.3, 0.25, 0.3);
    dip -= 0.07 * st * (0.6 + 0.4 * Math.sin(tt * 23));
    trem = Math.max(trem, st);
    // "Can't?": it gives up and droops a little lower
    dip += 0.08 * r(c.cant - 0.05, c.cant_end + 0.2);
    // the pokes: pushed out (the tip swings up), then a floppy wobble
    for (const p of [c.poke1, c.poke2, c.poke3]) {
      const push = popK(tt, p - 0.1, p + 0.06, 0.1, 0.03);
      dip -= 0.5 * push;
      dip += lfWob(tt - (p + 0.09), -0.42);
    }
    // her taps with the reflex hammer: a small wobble each
    for (const p of [c.tap1, c.tap2]) dip += lfWob(tt - p, 0.26, 21, 6.0);
    // the snap: the middle string breaks and the tip goes STIFF (straight, a touch past), rigid until the whip back
    const sn = tt >= c.back ? 0 : snapRamp(tt, c.snap, c.snap + 0.12, { pre: 0.05, ant: 0.04, over: 2.2 });
    dip = lerp(dip, -0.14, clamp(sn));
    // the loop: back to frame 0's hook for the last frames
    const L = r(c.fine_end + 0.02, c.end - 0.12, E.inOutSine);
    pip = lerp(pip, 1.32, L); dip = lerp(dip, 0.66, L);
  }
  S.pip = pip; S.dip = dip; S.mcp = LF_HOOK.mcp; S.tremble = trem;
  // ---- the poking finger (his other hand)
  S.poker = tt < 0 ? 0 : Math.max(popK(tt, c.poke - 0.2, c.poke2 + 0.55, 0.2, 0.3), popK(tt, c.still - 0.05, c.poke3 + 0.5, 0.18, 0.3));
  S.pokeIn = 0;
  if (tt >= 0) for (const p of [c.poke1, c.poke2, c.poke3]) S.pokeIn = Math.max(S.pokeIn, popK(tt, p - 0.12, p + 0.07, 0.11, 0.08));
  // ---- the inside: glass and the three strings, from the whip into "strings" to the whip back
  const inside = tt >= 0 && tt >= c.glass && tt < c.back;
  S.glass = inside ? ramp(tt, c.glass, c.glass + 0.3) : 0;
  S.str = inside ? ramp(tt, c.glass + 0.1, c.tighten + 0.2, E.inOutSine) : 0;
  S.hotMid = inside ? popK(tt, c.tighten - 0.05, c.sag + 0.2, 0.12, 0.2) : 0;
  S.ringMid = inside ? popK(tt, c.middle1 - 0.05, c.tight_end + 0.25, 0.12, 0.15) : 0;
  S.ringTip = inside ? popK(tt, c.tips - 0.05, c.slack_end + 0.3, 0.12, 0.2) : 0;
  S.sag = inside ? r(c.sag - 0.02, c.slack + 0.25, E.outBack) * (1 - r(c.snap, c.snap + 0.06)) : 0;
  S.torn = inside ? r(c.snap, c.snap + 0.35) : 0;
  S.hotTip = inside ? Math.max(0.5 * S.ringTip, r(c.snap, c.snap + 0.1)) : 0;
  // ---- the ladybug: on the tip / bouncing / in the hammock / flung / floating back down
  let mode = 'tip';
  if (tt >= 0) {
    if (tt >= c.climb) mode = 'hammock';
    if (tt >= c.snap) mode = 'fling';
    if (tt >= c.back) mode = 'gone';
    if (tt >= c.chute) mode = 'chute';
    if (tt >= c.land) mode = 'tip';
  }
  S.bugMode = mode;
  S.bugHop = 0;
  if (tt >= 0) for (const p of [c.poke1, c.poke2]) { const u = tt - (p + 0.06); if (u > 0 && u < 0.5) S.bugHop = Math.max(S.bugHop, Math.sin(Math.PI * u / 0.5)); }
  S.bugEyes = 'open';
  if (tt >= 0) {
    if (tt >= c.offline - 0.1 && tt < c.poke) S.bugEyes = 'half';
    if (S.bugHop > 0.05) S.bugEyes = 'wide';
    if (tt >= c.nap - 0.1 && tt < c.mirror) S.bugEyes = 'shut';
    if (tt >= c.snap - 0.05 && tt < c.back) S.bugEyes = 'wide';
    if (tt >= c.land - 0.1 && tt < c.land + 0.5) S.bugEyes = 'shut';
  }
  S.bugBack = mode === 'hammock' ? r(c.nap - 0.25, c.nap + 0.2) * (1 - r(c.mirror - 0.1, c.mirror + 0.25)) : 0;
  S.bugMirror = tt < 0 ? 0 : r(c.mirror, c.mirror + 0.3) * (tt < c.snap ? 1 : 0);
  S.bugHammer = tt < 0 ? 0 : r(c.tap1 - 0.45, c.tap1 - 0.2) * (tt < c.snap ? 1 : 0);
  S.bugTap = 0;
  if (tt >= 0) for (const p of [c.tap1, c.tap2]) S.bugTap = Math.max(S.bugTap, popK(tt, p - 0.14, p + 0.05, 0.12, 0.08));
  S.bugClimb = mode === 'hammock' ? r(c.climb, c.nap, E.inOutSine) : 0;
  // ---- labels and props
  S.spin = tt < 0 ? 0 : popK(tt, c.went - 0.05, c.offline - 0.02, 0.1, 0.06);
  S.wifi = tt < 0 ? 0 : popK(tt, c.icon, c.poke - 0.05, 0.12, 0.1);
  S.slash = tt < 0 ? 0 : r(c.icon + 0.02, c.icon + 0.14);
  S.offTag = tt < 0 ? 0 : popK(tt, c.offline + 0.05, c.poke - 0.05, 0.12, 0.1);
  S.floppyTag = tt < 0 ? 0 : popK(tt, c.floppy1 - 0.02, c.glass - 0.05, 0.12, 0.08);
  S.tightTag = tt < 0 ? 0 : popK(tt, c.tight - 0.05, c.sag + 0.6, 0.12, 0.12);
  S.slackTag = tt < 0 ? 0 : popK(tt, c.slack - 0.05, c.doctors - 0.1, 0.12, 0.1);
  S.stamp = tt < 0 ? 0 : popK(tt, c.stamp, c.on - 0.1, 0.12, 0.1);
  S.jamTag = tt < 0 ? 0 : popK(tt, c.jammed - 0.05, c.hush, 0.12, 0.12);
  S.stiffK = tt < 0 ? 0 : popK(tt, c.snap, c.middle2 - 0.05, 0.1, 0.1);
  S.tornTag = tt < 0 ? 0 : popK(tt, c.torn_tag, c.back - 0.05, 0.12, 0.08);
  S.fineK = tt < 0 ? 0 : popK(tt, c.fine - 0.03, c.fine_end + 0.35, 0.12, 0.2);
  // ---- his face and head
  const lookHand = { lookX: 0.8, lookY: -0.55 };
  let f = { ...FACES.calm, ...lookHand, mouth: 'grin', mouthOpen: 0.12 };
  if (tt >= 0) {
    f = lerpFace(f, { ...FACES.nervous, ...lookHand, mouth: 'grimace', eyeOpen: 0.85, browTilt: 1.2, browY: 0.5 }, r(c.strain1, c.strain1 + 0.3));
    f = lerpFace(f, { ...FACES.confused, lookX: 0.75, lookY: -0.5 }, r(c.tip1_end - 0.1, c.tip1_end + 0.15));
    f = lerpFace(f, { ...FACES.annoyed, lookX: 0.85, lookY: -0.35, eyeOpen: 0.75 }, r(c.cant - 0.05, c.cant + 0.2));
    f = lerpFace(f, { ...FACES.annoyed, ...lookHand, eyeOpen: 0.7 }, r(c.offline, c.offline + 0.2));
    f = lerpFace(f, { ...FACES.calm, ...lookHand, eyeOpen: 1.1, mouth: 'o', mouthOpen: 0.35 }, r(c.poke1 - 0.05, c.poke1 + 0.15));
    f = lerpFace(f, { ...FACES.grin, ...lookHand, eyeOpen: 1.2, mouthOpen: 0.4 }, r(c.floppy1, c.floppy1 + 0.2));
    f = lerpFace(f, { ...FACES.calm, ...lookHand, eyeOpen: 1.15, mouth: 'o' }, r(c.glass, c.glass + 0.2));
    f = lerpFace(f, { ...FACES.worried, ...lookHand, eyeOpen: 1.1 }, r(c.sag, c.sag + 0.2));
    f = lerpFace(f, { ...FACES.grin, lookX: 0.15, lookY: 0.05, eyeOpen: 1.1, mouthOpen: 0.35 }, r(c.doctors, c.doctors + 0.25));
    f = lerpFace(f, { ...FACES.calm, ...lookHand, eyeOpen: 1.05, mouthOpen: 0.1 }, r(c.tap1 - 0.3, c.tap1));
    f = lerpFace(f, { ...FACES.worried, ...lookHand, eyeOpen: 1.0 }, r(c.hush, c.hush + 0.3));
    f = lerpFace(f, { ...FACES.shock, ...lookHand }, r(c.snap, c.snap + 0.1));
    f = lerpFace(f, { ...FACES.worried, ...lookHand, eyeOpen: 1.2 }, r(c.torn_tag - 0.2, c.torn_tag + 0.2));
    f = lerpFace(f, { ...FACES.calm, ...lookHand, eyeOpen: 1.0, mouth: 'o', mouthOpen: 0.2 }, r(c.back, c.back + 0.3));
    f = lerpFace(f, { ...FACES.grin, ...lookHand, eyeOpen: 1.15, mouthOpen: 0.45 }, r(c.congrats, c.congrats + 0.2));
    f = lerpFace(f, { ...FACES.calm, ...lookHand, mouth: 'grin', mouthOpen: 0.12 }, r(c.fine_end + 0.02, c.end - 0.15));
  }
  S.face = f;
  S.hrot = tt < 0 ? 0.03 : 0.03 - 0.06 * r(c.tip1_end - 0.1, c.tip1_end + 0.15) * (1 - r(c.cant, c.cant + 0.3))
    + 0.05 * r(c.doctors, c.doctors + 0.25) * (1 - r(c.tap1 - 0.3, c.tap1)) - 0.07 * popK(tt, c.snap, c.torn_tag + 0.3, 0.08, 0.3);
  S.hdx = trem * 1.6 * Math.sin(tt * 47);
  return S;
}

// ---------------------------------------------------------------- the cameras
// the 2D camera (x, y, zoom, rot; bgdy: the camera's height for the far view) at time tt, and the hand's view angles
function lfCam(tt) {
  const c = cu();
  const at = (a, b) => (tt < 0 ? 1 : ramp(tt, a, b, E.inOutSine));
  const HOOK = { x: 660, y: 1070, zoom: 3.4, rot: 0, bgdy: 40 };
  if (tt < 0 || tt >= c.youre - 0.1) {
    // the last shot settles exactly on frame 0's framing
    const u = tt < 0 ? 1 : ramp(tt, c.youre - 0.1, c.fine_end + 0.1, E.inOutSine);
    return { ...HOOK, zoom: lerp(3.6, HOOK.zoom, u), y: lerp(1064, HOOK.y, u), x: lerp(668, HOOK.x, u) };
  }
  if (tt < c.cut_now) { const u = at(0, c.cut_now); return { ...HOOK, zoom: lerp(3.4, 3.52, u), y: lerp(1070, 1066, u) }; }
  if (tt < c.cant - 0.12) { const u = at(c.cut_now, c.cant); return { x: lerp(700, 704, u), y: lerp(1062, 1058, u), zoom: lerp(4.3, 4.5, u), rot: 0, bgdy: 170 }; }
  if (tt < c.cut_went) {   // a high two-shot: he glances down at his limp tip
    const u = at(c.cant - 0.12, c.cut_went); return { x: lerp(648, 652, u), y: lerp(1046, 1040, u), zoom: lerp(3.9, 4.05, u), rot: 0, bgdy: -150 };
  }
  if (tt < c.offline - 0.08) { const u = at(c.cut_went, c.offline); return { x: lerp(620, 626, u), y: lerp(1100, 1094, u), zoom: lerp(2.4, 2.5, u), rot: 0, bgdy: 220 }; }
  if (tt < c.poke - 0.06) { const u = at(c.offline, c.poke); return { x: lerp(712, 716, u), y: lerp(1074, 1070, u), zoom: lerp(4.6, 4.75, u), rot: 0, bgdy: 0 }; }
  if (tt < c.cut_floppy) { const u = at(c.poke, c.cut_floppy); return { x: lerp(684, 688, u), y: lerp(1096, 1090, u), zoom: lerp(3.0, 3.1, u), rot: 0, bgdy: -120 }; }
  if (tt < c.glass) { const u = at(c.cut_floppy, c.glass); return { x: lerp(716, 720, u), y: lerp(1082, 1076, u), zoom: lerp(4.8, 4.95, u), rot: 0, bgdy: 80 }; }
  if (tt < c.cut_tight) { const u = at(c.glass, c.cut_tight); return { x: lerp(656, 662, u), y: lerp(1080, 1072, u), zoom: lerp(2.9, 3.1, u), rot: 0, bgdy: -160 }; }
  if (tt < c.tips - 0.1) { const u = at(c.cut_tight, c.tips); return { x: lerp(678, 680, u), y: lerp(1052, 1048, u), zoom: lerp(4.5, 4.7, u), rot: 0, bgdy: 60 }; }
  if (tt < c.cut_slack) { const u = at(c.tips, c.cut_slack); return { x: lerp(698, 700, u), y: lerp(1064, 1060, u), zoom: lerp(5.9, 6.1, u), rot: 0, bgdy: -220 }; }
  if (tt < c.doctors - 0.1) { const u = at(c.cut_slack, c.doctors); return { x: lerp(698, 700, u), y: lerp(1098, 1094, u), zoom: lerp(4.3, 4.45, u), rot: 0, bgdy: 240 }; }
  if (tt < c.test - 0.08) { const u = at(c.doctors, c.test); return { x: lerp(698, 700, u), y: lerp(1084, 1080, u), zoom: lerp(6.0, 6.3, u), rot: 0, bgdy: 40 }; }
  if (tt < c.if - 0.55) {   // the held shot: a slow push from him and his hand onto her tapping the tip
    const u = at(c.test, c.if - 0.55); return { x: lerp(672, 700, u), y: lerp(1094, 1074, u), zoom: lerp(3.3, 4.8, u), rot: 0, bgdy: 100 };
  }
  if (tt < c.middle2 - 0.08) { const u = at(c.if - 0.55, c.middle2); return { x: lerp(690, 694, u), y: lerp(1068, 1062, u), zoom: lerp(4.5, 4.7, u), rot: 0, bgdy: 140 }; }
  if (tt < c.back) { const u = at(c.middle2, c.back); return { x: lerp(652, 648, u), y: lerp(1112, 1118, u), zoom: lerp(2.7, 2.6, u), rot: 0, bgdy: -140 }; }
  const u = at(c.back, c.youre); return { x: lerp(644, 652, u), y: lerp(1110, 1096, u), zoom: lerp(2.5, 2.75, u), rot: 0, bgdy: 160 };
}
function lfAng(tt) {
  const c = cu(), side = (typeof LF_SIDE === 'number') ? LF_SIDE : -Math.PI / 2;
  let yaw = (typeof LF_YAW0 === 'number') ? LF_YAW0 : -0.18, pitch = 0.08;
  if (tt >= 0) {
    if (tt >= c.cut_now && tt < c.cant - 0.12) { yaw = -0.1; pitch = -0.12; }
    if (tt >= c.cant - 0.12 && tt < c.cut_went) { yaw = -0.3; pitch = 0.22; }
    if (tt >= c.cut_went && tt < c.poke - 0.06) { yaw = -0.28; pitch = 0.0; }
    if (tt >= c.poke - 0.06 && tt < c.glass) { yaw = -0.12; pitch = 0.1; }
    if (tt >= c.glass && tt < c.back) { yaw = -0.45; pitch = 0.14; }   // more from the back: the strings show
    if (tt >= c.tips - 0.1 && tt < c.cut_slack) { yaw = -0.45; pitch = 0.32; }
    if (tt >= c.cut_slack && tt < c.doctors - 0.1) { yaw = -0.42; pitch = -0.12; }
    if (tt >= c.back && tt < c.youre - 0.1) { yaw = -0.24; pitch = 0.05; }
  }
  return { yaw: side + yaw, pitch };
}
// the 3D camera tied to the 2D one (bent-wrist-fist): the wrist lands where the 2D camera puts the world wrist
function lfView(cam, ang) {
  const sc = toScreen(cam, LF_WR[0], LF_WR[1]), el = toScreen(cam, LF_EL[0], LF_EL[1]), D = 55;
  const dx = el[0] - sc[0], dy = el[1] - sc[1], l = Math.hypot(dx, dy) || 1;
  const roll = Math.atan2(-dx / l, dy / l);
  return { yaw: ang.yaw, pitch: ang.pitch, roll, tx: 0, ty: 0, tz: 0, D, cx: sc[0], cy: sc[1], f: LFT.PX * D * cam.zoom / 2.9, mirror: true };
}

// ---------------------------------------------------------------- him at the porch table (his left arm is the 3D one)
function lfHero(cam, t, S) {
  const p = lfClone(POSES.stand);
  p.lean = -0.01;
  const st = { x: LF.hx, y: LF.hy, s: LF.hs, pose: p, face: S.face, noArms: true, headRot: S.hrot, headDX: S.hdx,
    headDY: 2 * Math.sin(t * loopW(1.6)), noLegs: true };
  const r = charLayer(cam, st, t, { pal: LFPAL, ambient: 0.06 });
  gctx.save(); gctx.setTransform(1, 0, 0, 1, 0, 0); gctx.globalCompositeOperation = 'destination-out';
  gctx.drawImage(layerC, 0, 0, W / 2, H / 2); gctx.restore();
  return { r, st };
}
function lfUpperArm(cam, hero, P2) {
  const shW = toWorld(hero.st, hero.r.shR), sh = toScreen(cam, shW[0], shW[1]);
  const el = P2.pa([0, -BWK.L * 0.97, 0]);
  const w = 42 * hero.st.s * cam.zoom;
  const dx = el[0] - sh[0], dy = el[1] - sh[1], l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l;
  actor(() => {
    line(ctx, sh[0], sh[1], el[0] - ux * w * 0.2, el[1] - uy * w * 0.2, w, LFPAL.coat);
    line(ctx, el[0] - ux * w * 0.62, el[1] - uy * w * 0.62, el[0] - ux * w * 0.18, el[1] - uy * w * 0.18, w * 1.1, LFPAL.coatSh);
  });
}
function lfRestArm(cam, hero) {
  const shW = toWorld(hero.st, hero.r.shL), sh = toScreen(cam, shW[0], shW[1]);
  const el = toScreen(cam, LF.hx - 112, LF.hy - 250), wr = toScreen(cam, LF.hx - 150, LF.hy - 196);
  const w = 42 * hero.st.s * cam.zoom;
  actor(() => { line(ctx, sh[0], sh[1], el[0], el[1], w, LFPAL.coat); line(ctx, el[0], el[1], wr[0], wr[1], w * 0.86, LFPAL.skin); circle(ctx, wr[0], wr[1] + w * 0.1, w * 0.55, LFPAL.skin); });
}

// ---------------------------------------------------------------- the ladybug's pose on screen for this frame
function lfBugPose(S, R, tt, t) {
  const c = cu(), P2 = R.P2, G = R.G, f = G.f.I;
  const q0 = P2.ph(fkLerp(f.pts[2], f.pts[3], 0.5)), q1 = P2.ph(fkSegPt(G, 'I', 2, 0.5, 'back', 1.0));
  let nx = q1[0] - q0[0], ny = q1[1] - q0[1]; const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
  const a0 = P2.ph(f.pts[2]), a1 = P2.ph(f.pts[3]);
  const s = 2.1 * q1[2];
  const rotTip = Math.atan2(ny, nx) + Math.PI / 2;
  const flipTip = ((a1[0] - a0[0]) * Math.cos(rotTip) + (a1[1] - a0[1]) * Math.sin(rotTip)) < 0;
  const hop = S.bugHop * s * 1.4;
  const tipPose = { x: q1[0] + nx * (s * 0.45 + hop), y: q1[1] + ny * (s * 0.45 + hop), s, rot: rotTip + 0.25 * S.bugHop * Math.sin(t * 20), flip: flipTip };
  const base = { eyes: S.bugEyes, look: [0.4, 0.2], t, mirror: S.bugMirror, hammer: S.bugHammer, hammerA: -1.1 * S.bugTap };
  const m = S.bugMode;
  if (m === 'tip') return { ...tipPose, o: { ...base, legs: 0 } };
  if (m === 'hammock' && R.str && R.str.low) {
    const lw = R.str.low, hp = { x: lw[0], y: lw[1] - s * 0.32, s, rot: 0.08 * Math.sin(t * loopW(1.8)), flip: false };
    const u = S.bugClimb;   // from the tip down into the hammock
    const p = u < 1 ? { x: lerp(tipPose.x, hp.x, E.inOutSine(u)), y: lerp(tipPose.y, hp.y, E.inOutSine(u)) - Math.sin(Math.PI * u) * s * 1.2, s, rot: lerp(tipPose.rot, hp.rot, u), flip: u < 0.5 ? tipPose.flip : false } : hp;
    return { ...p, o: { ...base, back: S.bugBack, legs: u < 1 ? tt * 3 : 0, look: [0.6, 0.4] } };
  }
  if (m === 'fling') {
    const st = R.flingFrom || [tipPose.x, tipPose.y], u = tt - c.snap;
    const x = st[0] + 1100 * u, y = st[1] - 2300 * u + 0.5 * 3000 * u * u;
    return { x, y, s: s * (1 + 0.5 * u), rot: 13 * u, flip: false, o: { ...base, wings: 0.8, eyes: 'wide' } };
  }
  if (m === 'chute') {
    const u = clamp((tt - c.chute) / (c.land - c.chute)), e = E.inOutSine(u);
    const x = lerp(tipPose.x + 160, tipPose.x, e) + 50 * Math.sin(u * Math.PI * 3) * (1 - u), y = lerp(-120, tipPose.y, e);
    return { x, y, s, rot: lerp(-0.4, tipPose.rot, e) + 0.25 * Math.sin(u * 14) * (1 - u), flip: tipPose.flip, o: { ...base, wings: 1 - clamp((u - 0.85) / 0.15), eyes: 'happy' === base.eyes ? 'open' : base.eyes } };
  }
  return null;
}

// the whole picture at time tt (t = the video time for clocks)
function lfFrame(tt, t, o = {}) {
  const c = cu(), S = lfS(tt), cam = o.cam || lfCam(tt), ang = o.ang || lfAng(tt);
  const G = ftGeo({ mcp: S.mcp, pip: S.pip, dip: S.dip, tremble: S.tremble, t });
  LF_BGDY = cam.bgdy || 0;
  const soft = clamp((cam.zoom - 2.2) / 2.0);
  lfFar(cam, t, { soft });
  lfPorch(cam, t, { soft: soft * 0.8 });
  lfTable(cam, t);
  const hero = lfHero(cam, t, S);
  const V = lfView(cam, ang), P2 = bwProj(V, 0);
  screenSpace();
  if (S.poker < 0.02) lfRestArm(cam, hero);
  lfUpperArm(cam, hero, P2);
  actor(() => bwDraw(ctx, P2, G, { bulge: 0.2 }));
  let str = null;
  if (S.glass > 0.01) bwGlass(ctx, P2, G, S.glass, { bulge: 0.2 });
  if (S.str > 0.01) str = lfStrings(ctx, gctx, P2, G, { k: S.str, sag: S.sag, torn: S.torn, hotMid: S.hotMid, hotTip: S.hotTip, ringMid: S.ringMid, ringTip: S.ringTip, t });
  const R = { S, cam, V, P2, G, hero, str };
  // where the hammock was when the string snapped (she flies from there)
  if (S.bugMode === 'fling') {
    const S0 = lfS(c.snap - 0.02), G0 = ftGeo({ mcp: S0.mcp, pip: S0.pip, dip: S0.dip, t: c.snap }), str0 = lfStringPts(P2, G0, {});
    const yA = lfSag(str0.sideA.map((q) => [q[0], q[1]]), S0.sag, c.snap, 0), yB = lfSag(str0.sideB.map((q) => [q[0], q[1]]), S0.sag * 0.9, c.snap, 1.3);
    const near = str0.sideB[2][2] < str0.sideA[2][2] ? yB : yA;
    let low = near[0]; for (const q of near) if (q[1] > low[1]) low = q;
    R.flingFrom = [low[0], low[1] - 0.4 * str0.k];
  }
  // the poking finger (his other hand) from below, at the end of the tip
  if (S.poker > 0.01) {
    const endP = P2.ph(fkTip(G, 'I', 0.05)), dir = [-0.55, -0.83];
    const away = (1 - S.pokeIn) * endP[2] * 1.3 - endP[2] * 0.2;
    lfPoker([endP[0] - dir[0] * away, endP[1] - dir[1] * away + endP[2] * 0.6], dir, endP[2] * 0.95, S.poker);
  }
  // the ladybug
  const bp = lfBugPose(S, R, tt, t);
  if (bp) lfBug(bp.x, bp.y, bp.s, bp.rot, { ...bp.o, flip: bp.flip });
  R.bug = bp;
  return R;
}

// ---------------------------------------------------------------- the overlays of each part
function lfOverlays(R, tt, t) {
  const c = cu(), S = R.S, P2 = R.P2, G = R.G;
  screenSpace();
  const tipP = P2.ph(fkTip(G, 'I', 0.5)), mid = P2.ph(G.f.I.pts[1]);
  const cx = (v) => clamp(v, 220, 860), cy = (v) => clamp(v, 470, 1120);
  // the try: motion marks round the tip
  if (S.tremble > 0.05) { const q = P2.ph(G.f.I.pts[2]); ftShake(q[0], q[1], q[2] * 2.4, S.tremble * 0.8, t); }
  // "went...": the tip thinking; OFFLINE: the Wi-Fi sign, crossed out, and the tag
  if (S.spin > 0.01) lfSpinner(clamp(tipP[0] + 110, 220, 820), cy(tipP[1] - 230), 1.2, S.spin, t);
  if (S.wifi > 0.01) lfWifi(clamp(tipP[0] + 110, 220, 820), cy(tipP[1] - 260), 1.2, S.wifi, S.slash, t);
  if (S.floppyTag > 0.01) ftBurst(cx(tipP[0] + 40), cy(tipP[1] + 260), 0.7, S.floppyTag, 'FLOPPY!', '#4DFFB4', -0.08, 100);
  if (S.tightTag > 0.01) ftTag('TIGHT', cx(mid[0] - 160), cy(mid[1] - 210), S.tightTag, '#7FE9FF', [mid[0], mid[1]], 60);
  if (S.slackTag > 0.01) ftTag('SLACK', cx(tipP[0] + 120), cy(tipP[1] + 230), S.slackTag, '#FFD447', null, 66);
  if (S.stamp > 0.01) stamp("DOCTOR'S TEST", 540, 560, E.outBack(clamp(S.stamp), 2), '#4DFFB4', -0.06, 78);
  if (S.jamTag > 0.01) ftTag('JAMMED FINGER?', 540, 560, S.jamTag, '#FF9A3C', null, 62);
  if (S.stiffK > 0.01) ftBurst(clamp(tipP[0] - 60, 300, 760), cy(tipP[1] - 260), 0.78, S.stiffK, 'STIFF!', '#FF5A6E', -0.1, 110);
  if (S.tornTag > 0.01 && R.str && R.str.ends) { const e = R.str.ends[0]; ftTag('TORN', cx(e[0] - 170), cy(e[1] - 170), S.tornTag, '#FF5A6E', [e[0], e[1]], 66); }
  if (S.fineK > 0.01) ftTag('FINE ✓', cx(tipP[0] - 230), cy(tipP[1] - 120), S.fineK, '#4DFFB4', null, 64);
  // the ladybug's flight: whoosh arcs behind her
  if (S.bugMode === 'fling' && R.bug) {
    const u = tt - c.snap, pts = [];
    for (let i = 0; i <= 6; i++) { const uu = Math.max(0, u - i * 0.04); const st = R.flingFrom; pts.push([st[0] + 1100 * uu, st[1] - 2300 * uu + 1500 * uu * uu]); }
    lfWhoosh(pts, clamp(1 - u * 1.2));
  }
}

// ---------------------------------------------------------------- shots
function lfShot(lt, t, shot) {
  const R = lfFrame(t, t);
  lfOverlays(R, t, t);
  const hp = R.P2.ph([0.2, 9, 1]), hd = toScreen(R.cam, ...toWorld(R.hero.st, R.hero.r.head));
  return { glow: 0.85, focus: [clamp((hp[0] + hd[0]) / 2, 260, 820), clamp((hp[1] + hd[1]) / 2, 480, 1080)] };
}
SC.hook = lfShot;
SC.answer = lfShot;
SC.offline = lfShot;
SC.poke = lfShot;
SC.strings = lfShot;
SC.slack = lfShot;
SC.doctors = lfShot;
SC.jammed = lfShot;
SC.stiff = lfShot;
SC.torn = lfShot;
SC.button = lfShot;
SC.fine = lfShot;
SC.loop = (lt, t, shot) => { const tt = t - TLd.duration; lfFrame(tt, t); return { glow: 0.85 }; };

// the cover: the hooked finger with the ladybug, the crossed-out Wi-Fi sign, STRAIGHTEN THE TIP?
SC.cover = (lt, t, shot) => {
  const c = cu(), tt = c.strain1 + 0.4;
  lfFrame(tt, t, { cam: { x: 640, y: 1090, zoom: 3.0, rot: 0, bgdy: 60 }, ang: lfAng(0) });
  screenSpace();
  bigWord('STRAIGHTEN', 540, 1290, 120, '#FFFFFF', 1, -0.05);
  bigWord('THE TIP?', 540, 1440, 190, '#FFD447', 1, -0.05);
  return { glow: 0.85, noCaptions: true };
};

function initScenes2() { initLake(); }
