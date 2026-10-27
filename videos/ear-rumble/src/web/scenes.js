// Why Do Your Ears RUMBLE When You Yawn? 👂 Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds
// inside the shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
// The worlds: mosquito-bites' campsite (camp.js: the land, the fire, the hero by the fire, his friend in a camp chair),
// ears-pop's ear in section (ear.js), and this Short's props (rumble.js).
'use strict';

const cu = () => TLd.cues;
const erShot = (id) => TLd.shots.find((s) => s.id === id);
const erSince = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);
const erClone = (p) => JSON.parse(JSON.stringify(p));

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the campsite at night: the fire is low and to his right (screen right), so the key stays above him and the fire is
// the warm rim; inside the ear: the body light
const CAMP_LIGHT = { ...LIGHTS.lanterns, rimFrom: [0.85, 0.1], rimAmt: 1.2, pool: 0.45 };
const EAR_LIGHT = { ...LIGHTS.inside };
setLights({ hook: CAMP_LIGHT, flex: CAMP_LIGHT, retry: CAMP_LIGHT, half: CAMP_LIGHT, face: CAMP_LIGHT,
  drum: (lt) => (lt < 0.55 ? CAMP_LIGHT : EAR_LIGHT), payoff: CAMP_LIGHT, weird: CAMP_LIGHT, button: CAMP_LIGHT,
  loop: CAMP_LIGHT, cover: CAMP_LIGHT });

// ---------------------------------------------------------------- his faces
const EF = {
  wow: { eyeOpen: 1.35, pupil: 0.8, lookX: 0.1, lookY: 0, browY: 1.4, browTilt: 0.2, mouth: 'o', mouthOpen: 0.55, blink: 0, cross: 0 },
  smug: { eyeOpen: 0.78, pupil: 1, lookX: 0.35, lookY: 0.1, browY: 0.7, browTilt: -0.5, mouth: 'grin', mouthOpen: 0.45, blink: 0.28, cross: 0 },
  side: { eyeOpen: 1.2, pupil: 0.85, lookX: -1, lookY: 0.1, browY: 1.0, browTilt: 0.5, mouth: 'o', mouthOpen: 0.35, blink: 0, cross: 0 },
  proud: { eyeOpen: 1.0, pupil: 1, lookX: -0.7, lookY: 0, browY: 0.9, browTilt: -0.3, mouth: 'grin', mouthOpen: 0.8, blink: 0, cross: 0 },
  focus: { eyeOpen: 0.85, pupil: 1, lookX: -0.4, lookY: -0.9, browY: 0.5, browTilt: 1.15, mouth: 'flat', mouthOpen: 0, blink: 0.12, cross: 0 },
  munch: { eyeOpen: 0.7, pupil: 1, lookX: 0.2, lookY: 0.1, browY: 0.5, browTilt: -0.3, mouth: 'o', mouthOpen: 0.5, blink: 0.35, cross: 0 },
  chew: { eyeOpen: 0.75, pupil: 1, lookX: 0.35, lookY: 0, browY: 0.6, browTilt: -0.2, mouth: 'grin', mouthOpen: 0.35, blink: 0.3, cross: 0 },
  cosy: { eyeOpen: 0.7, pupil: 1, lookX: 0.5, lookY: -0.1, browY: 0.3, browTilt: -0.2, mouth: 'grin', mouthOpen: 0.25, blink: 0.4, cross: 0 },
  look: { eyeOpen: 1.05, pupil: 1, lookX: 0.8, lookY: -0.1, browY: 0.8, browTilt: 0.1, mouth: 'flat', mouthOpen: 0.15, blink: 0, cross: 0 },
  grin: { eyeOpen: 1.0, pupil: 1, lookX: 0.2, lookY: 0, browY: 0.9, browTilt: -0.3, mouth: 'grin', mouthOpen: 1, blink: 0, cross: 0 },
  // the friend
  watch: { eyeOpen: 1.05, pupil: 1, lookX: -1, lookY: 0.1, browY: 0.6, browTilt: 0.4, mouth: 'flat', mouthOpen: 0.2, blink: 0, cross: 0 },
  try: { eyeOpen: 1.1, pupil: 0.9, lookX: 0, lookY: -0.3, browY: 0.9, browTilt: 1.0, mouth: 'flat', mouthOpen: 0, blink: 0, cross: 0 },
  strain: { eyeOpen: 1.25, pupil: 0.75, lookX: 0, lookY: 0, browY: 1.1, browTilt: 1.3, mouth: 'grimace', mouthOpen: 0.6, blink: 0, cross: 1 },
};

// ---------------------------------------------------------------- the hero at camp, from a description
const ER_S = 0.95;
// A: {yawn 0..1 (jaw + squeezed eyes), stretch 0..1 (arms up), face, hips 0..1 (hands on hips), crisp: {hold 0..1,
//     bite 0..1 (the right hand at his mouth), bitten 0..1}, bag 0..1 (zipped into the sleeping bag; drawn when > 0.5),
//     bud 0..1 (the ear camera in his left ear), budLight, shake, headRot, headDX, headDY, redEar 0..1}
function erHeroSt(t, A) {
  let p = erClone(POSES.stand);
  const hip = p.hipY;
  const breathe = 2 * Math.sin(t * loopW(2.1));
  // arms: where each wrist wants to be (rig units), blended from the modes; IK once
  let L = [-108, hip + 6], R = [108, hip + 6];
  const st1 = clamp(A.stretch || 0), hp = clamp(A.hips || 0), cr = A.crisp ? clamp(A.crisp.hold || 0) : 0;
  const mixPt = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  if (hp > 0) { L = mixPt(L, [-86, hip - 18], hp); R = mixPt(R, [86, hip - 18], hp); }
  if (cr > 0) {
    const bite = clamp(A.crisp.bite || 0);
    L = mixPt(L, [-40, hip - 96], cr);
    R = mixPt(R, mixPt([64, hip - 104], [34, hip - 190], bite), cr);
  }
  if (st1 > 0) {   // the yawn's stretch: fists pushed out sideways, below his ears (so the ears stay clear)
    const tr = 6 * Math.sin(t * 23) * st1;
    L = mixPt(L, [-236, hip - 212 + tr], st1); R = mixPt(R, [236, hip - 212 - tr], st1);
  }
  if (hp > 0 || cr > 0 || st1 > 0) {
    const bend = A.stretchBend || (st1 > 0.01 ? -1 : 1);
    p = ikReach(p, 'L', L, bend);
    p = ikReach(p, 'R', R, bend);
  }
  p.hand = st1 > 0.15 ? 'fist' : 'open';
  p.lean = -0.01 * st1 + 0.005 * Math.sin(t * 1.3);
  let face = A.face || FACES.calm;
  if (A.yawn > 0.01) face = lerpFace(face, FACES.yawn, clamp(A.yawn));
  const sh = A.shake || 0;
  const st = { x: A.x || CAMP.HX, y: CAMP.GY, s: ER_S, pose: p, face,
    headDX: (A.headDX || 0) + sh * 3 * Math.sin(t * 61), headDY: (A.headDY || 0) + breathe * 0.5 - 6 * st1 + sh * 2 * Math.sin(t * 47),
    headRot: (A.headRot || 0) - 0.04 * st1, noArms: (A.bag || 0) > 0.5 };
  return st;
}
function erHero(cam, t, A) {
  const st = erHeroSt(t, A);
  const bag = (A.bag || 0) > 0.5;
  const r = campChar(cam, st, t, {
    ambient: 0.1, fire: A.fire,
    pre: (c) => erHeadSpace(c, st, (cc) => erBigEars(cc, CAMPPAL, A.redEar || 0)),
    post: (c, rr, s2) => {
      if (A.crisp && A.crisp.hold > 0.01) {
        rigSpace(c, s2, (cc) => {
          const wl = rr.wrL, wr = rr.wrR;
          erCrispBag(cc, wl[0] + 8, wl[1] + 30, 0.9);
          if ((A.crisp.bitten || 0) < 0.98) erCrisp(cc, wr[0] - 6, wr[1] - 22, 0.95, -0.5, A.crisp.bitten || 0);
          // his fingers over the bag's edge and round the crisp
          for (const [x, y] of [[wl[0] + 4, wl[1] + 4], [wl[0] + 18, wl[1] + 8]]) circle(cc, x, y, 11, CAMPPAL.skin);
          for (const [x, y] of [[wr[0] - 2, wr[1] - 10], [wr[0] + 10, wr[1] - 4]]) circle(cc, x, y, 10, CAMPPAL.skin);
        });
      }
      if (bag) erSleepBag(c, s2, rr);
      if ((A.bud || 0) > 0.01) headSpace(c, rr, s2, (cc) => erBud(cc, -1, A.budLight || 0));
      if ((A.muffs || 0) > 0.01) headSpace(c, rr, s2, (cc) => erEarmuffs(cc, A.muffs, t));
      if ((A.sweat || 0) > 0.01) headSpace(c, rr, s2, (cc) => { sweatDrop(cc, 50, -40, 1.2, clamp(A.sweat)); sweatDrop(cc, -56, -18, 0.8, clamp(A.sweat * 1.5 - 0.5)); });
    },
  });
  return { st, r, ear: (side) => headPt(st, r, [side * 70, 4]), mouth: headPt(st, r, [0, 40]), top: headPt(st, r, [0, -96]) };
}
// screen point of a world point
const erScr = (cam, p) => toScreen(cam, p[0], p[1]);

// ---------------------------------------------------------------- the hook, valid at negative time (the Short's last frames)
// tt = seconds since frame 1. Frame 1: mid-yawn, jaw dropping, arms going up; the yawn peaks on "RUMBLE" and closes on
// "right?", his eyes pop open (he heard it).
function hookA(tt) {
  const c = cu();
  const open = tt < 0 ? lerp(0.55, 0.78, smooth(inv(-0.45, 0, tt))) : lerp(0.78, 1, smooth(inv(0, 0.9, tt)));
  const close = smooth(inv(c.right - 0.45, c.right + 0.2, tt));
  const yawn = open * (1 - close);
  const stretch = (tt < 0 ? lerp(0.35, 0.7, smooth(inv(-0.45, 0, tt))) : lerp(0.7, 1, smooth(inv(0, 1.0, tt)))) * (1 - smooth(inv(c.right - 0.2, c.right + 0.12, tt)));
  let face = lerpFace(EF.wow, FACES.yawn, 1);
  face = lerpFace(EF.wow, Object.assign({}, EF.wow, { lookX: 0.15 }), 1);
  return { yawn, stretch, face, shake: erRumbleK(tt < 0 ? TL.duration + tt : tt) };
}
function hookCam(tt) {
  const k = camKeys(tt, [[-0.45, 362, 852, 2.84], [0, 362, 850, 2.9], [2.0, 361, 846, 3.02], [4.4, 360, 844, 3.1]]);
  const rk = erRumbleK(tt < 0 ? TL.duration + tt : tt), sh = shake(tt, 9 * rk, 26, 3);
  k.x += sh[0] / k.zoom; k.y += sh[1] / k.zoom;
  return k;
}
function hookDraw(tt, t) {
  const cam = hookCam(tt), A = hookA(tt);
  campBack(cam, t, { soft: 0.85 });
  const H = erHero(cam, t, A);
  const rk = A.shake;
  for (const sd of [-1, 1]) { const e = erScr(cam, H.ear(sd)); erRings(e[0] + sd * 14, e[1], sd, 230, rk, t); }
  return { cam, H };
}
SC.hook = (lt, t) => {
  hookDraw(lt, t);
  return { glow: 0.85, zblur: 0.035 * (1 - ramp(lt, 0, 0.25)) };
};
SC.loop = (lt, t) => {
  hookDraw(t - TL.duration, t);
  return { glow: 0.85 };
};

// ---------------------------------------------------------------- "Congrats. You just flexed your EAR."
SC.flex = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 360, 844, 3.1], [0.55, 340, 846, 3.15], [D, 336, 846, 3.22]]);
  campBack(cam, t, { soft: 0.88 });
  const flexK = ramp(t, c.flex_pose - 0.18, c.flex_pose + 0.1);
  let face = EF.side;
  face = lerpFace(face, EF.proud, ramp(t, c.flex_pose - 0.1, c.flex_pose + 0.15));
  const H = erHero(cam, t, { face, headRot: -0.06 * ramp(t, c.you - 0.2, c.you + 0.2), redEar: erRumbleK(t) });
  const ear = erScr(cam, H.ear(-1));
  erConfetti(ear[0] - 10, ear[1] - 10, c.confetti, t, 44, -1);
  // the window on his ear: the tiny muscle with its sweatband
  const wk = ramp(t, c.window_in, c.window_in + 0.3), WX = 322, WY = 700, WR = 205;
  if (wk > 0.01) {
    thinLeader([WX + WR * 0.62, WY + WR * 0.72], [ear[0] - 4, ear[1]], wk, '#FFFFFF');
    erWindow(WX, WY, WR, wk, (r) => {
      erInsideBg(WX, WY, r, t);
      erFlexMuscle(WX + 14, WY + 18, r / 92, t, flexK, erRumbleK(t), ramp(t, c.window_in + 0.1, c.window_in + 0.35));
      erRings(WX + 14, WY + 18, 1, r * 0.95, erRumbleK(t) * 0.8, t, ER_GOLD, 0.66);
      erRings(WX + 14, WY + 18, -1, r * 0.95, erRumbleK(t) * 0.8, t, ER_GOLD, 0.66);
    });
  }
  erRings(ear[0] - 12, ear[1], -1, 200, erRumbleK(t) * 0.9, t);
  return { glow: 0.85, push: { k: 1 + 0.02 * lt / D, cx: 540, cy: 900 } };
};

// ---------------------------------------------------------------- "Now do it WITHOUT the yawn."
SC.retry = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 362, 850, 2.9], [D, 362, 846, 3.02]]);
  campBack(cam, t, { soft: 0.85 });
  const got = ramp(t, c.rumbles[2][0], c.rumbles[2][0] + 0.25);
  let face = lerpFace(EF.look, EF.focus, ramp(t, c.without - 0.15, c.without + 0.2));
  face = lerpFace(face, EF.wow, got);
  const strain = ramp(t, c.without, c.without + 0.3) * (1 - got);
  const H = erHero(cam, t, { face, shake: 0.6 * strain + erRumbleK(t), headDY: 3 * strain, redEar: Math.max(erRumbleK(t), 0.5 * strain), sweat: ramp(t, c.without + 0.3, c.without + 0.6) * (1 - got) });
  for (const sd of [-1, 1]) { const e = erScr(cam, H.ear(sd)); erRings(e[0] + sd * 14, e[1], sd, 190, erRumbleK(t) * 0.75, t); }
  erNoYawn(805, 640, 100, popK(t, c.no_yawn, shot.end + 1));
  return { glow: 0.8 };
};

// ---------------------------------------------------------------- "Up to half of you can." / "The rest... just pulled a weird face."
const ER_TWO = { hx: 470, fx: 850 };   // in the two-shot he stands nearer the fire, his friend sits across it
function erTwoShot(cam, t, o = {}) {
  campBack(cam, t, { soft: o.soft || 0 });
  applyCam(cam);
  campFire(t, 1);
  const H = erHero(cam, t, { x: ER_TWO.hx, face: o.heroFace || EF.smug, hips: 1, redEar: erRumbleK(t) * 0.5 });
  const fr = campFriend(cam, t, { x: ER_TWO.fx, face: o.friendFace || EF.watch, sip: 0, headRot: o.fRot || 0,
    headDX: o.fShake ? 4 * o.fShake * Math.sin(t * 53) : 0,
    post: (c2, rr, st) => headSpace(c2, rr, st, (cc) => erWeirdFace(cc, o.weird || 0, t, o.tongue || 0)) });
  return { H, fr };
}
SC.half = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 668, 1034, 1.58], [D, 670, 1030, 1.64]]);
  const { H } = erTwoShot(cam, t);
  const rk = erRumbleK(t);
  for (const sd of [-1, 1]) { const e = erScr(cam, H.ear(sd)); erRings(e[0] + sd * 10, e[1], sd, 150, rk * 0.85, t); }
  const top = erScr(cam, H.top);
  erTag('CAN ✓', top[0], top[1] - 60, ER_GREEN, popK(t, c.can_tag - 0.05, shot.end + 1), 44);
  return { glow: 0.85 };
};
SC.face = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 670, 1030, 1.64], [0.42, 842, 990, 2.3], [D, 844, 984, 2.45]]);
  const k1 = ramp(t, c.strain - 0.1, c.strain + 0.3), k2 = ramp(t, c.weird_pop - 0.12, c.weird_pop + 0.08);
  let ff = lerpFace(EF.watch, EF.try, ramp(t, c.rest_end - 0.1, c.rest_end + 0.25));
  ff = lerpFace(ff, EF.strain, k1);
  erTwoShot(cam, t, { friendFace: ff, weird: 0.6 * k1 + 0.4 * k2, tongue: k2, fShake: k1, heroFace: EF.smug });
  return { glow: 0.8, push: { k: 1 + 0.03 * ramp(t, c.weird_pop, c.weird_pop + 0.4, E.outBack), cx: 540, cy: 900 } };
};

// ---------------------------------------------------------------- "That muscle pulls your eardrum tight... like a drum."
const ER_SEC = { x: 205, y: 50, zoom: 1.6 };
function erSecCam(t, dive, wx, wy) {
  const z = lerp(0.42, 1, dive), push = 0.06 * ramp(t, cu().muscle, erShot('drum').end);
  return { x: ER_SEC.x - 20 * ramp(t, cu().eardrum, cu().drum), y: ER_SEC.y, zoom: ER_SEC.zoom * z * (1 + push), rot: 0,
    sx: lerp(wx - 540, 0, dive), sy: lerp(wy - 960, -30, dive) };
}
function erEarState(t) {
  const c = cu(), rk = erRumbleK(t);
  const pull = ramp(t, c.pull - 0.05, c.pull + 0.4, E.outCubic) * (0.92 + 0.08 * Math.sin(t * 70) * rk);
  const tapV = erSince(t, c.tap, 7) * Math.sin((t - c.tap) * 55);
  const b = -0.6 * pull + (t > c.tap ? 0.12 * tapV : 0);
  return { pull, b, rk, tight: ramp(t, c.tight - 0.05, c.tight + 0.25) };
}
function erEarDraw(cam, t) {
  const S = erEarState(t);
  earSection(cam, t, { bulge: S.b, tube: 0, pull: 0, canal: 0.9, pocket: 0.9, jit: 0.6 * S.rk, hiDrum: S.tight, noTubeMuscle: true });
  applyCam(cam);
  const tt = erTT(ctx, S.b, S.pull, t, ramp(t, cu().muscle - 0.1, cu().muscle + 0.2) * (0.5 + 0.5 * S.rk));
  earBones(ctx, S.b);
  // the eardrum again over the hammer's handle (ear.js draws it before; the muscle's tendon sits between)
  const q = earDrumCtl(S.b);
  for (const [cc, w, col] of [[ctx, 17, '#C98A78'], [ctx, 11, '#FFE9DA'], [ctx, 3.5, '#FFFFFF']]) {
    cc.beginPath(); cc.moveTo(EAR.T[0], EAR.T[1]); cc.quadraticCurveTo(q[0], q[1], EAR.B[0], EAR.B[1]);
    cc.lineWidth = w; cc.lineCap = 'round'; cc.strokeStyle = col; cc.stroke();
  }
  erDrumTight(S.b, S.tight, t);
  const c = cu(), sk = ramp(t, c.drum - 0.35, c.drum - 0.05) * (1 - ramp(t, c.tap + 0.35, c.tap + 0.6));
  const hit = t < c.tap ? smooth(inv(c.tap - 0.22, c.tap, t)) : 1 - smooth(inv(c.tap + 0.05, c.tap + 0.3, t));
  erDrumstick(S.b, hit, sk);
  return { S, tt };
}
// his face in a round frame (screen space; paint, not lit)
function erPortrait(x, y, R, t, k, rk) {
  if (k <= 0.01) return;
  const r = R * E.outBack(clamp(k), 1.8), s = r / 84;
  screenSpace();
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = '#1B2A62'; ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
  paint(() => drawCharacter(ctx, { x, y: y + 470 * s + 14 * s, s, pose: POSES.stand, face: EF.smug, headDX: 2 * rk * Math.sin(t * 61) }, t, CAMPPAL));
  ctx.restore();
  paint(() => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.lineWidth = 7; ctx.strokeStyle = ER_GOLD; ctx.stroke(); });
  erRings(x - r * 0.78, y + 6 * s, -1, r * 0.75, rk, t); erRings(x + r * 0.78, y + 6 * s, 1, r * 0.75, rk, t);
}
SC.drum = (lt, t, shot) => {
  const c = cu();
  const dive = smooth(inv(0.12, 0.62, lt));
  // the camp, tight on his ear, with the window on it opening (the way in)
  const ccam = camKeys(lt, [[0, 312, 872, 3.3], [0.6, 300, 868, 4.4]]);
  if (dive < 0.999) {
    campBack(ccam, t, { soft: 0.9 });
    const H = erHero(ccam, t, { face: EF.smug, redEar: 1 });
    void H;
  }
  const ear = erScr(ccam, [CAMP.HX - 66 * ER_S, CAMP.GY - 470 * ER_S + 4 * ER_S]);
  const wx = lerp(ear[0], 540, dive), wy = lerp(ear[1], 960, dive), R = lerp(120, 1250, dive);
  const scam = erSecCam(t, dive, wx, wy);
  let tt;
  if (dive < 0.999) {
    erWindow(wx, wy, R, ramp(lt, 0, 0.12), () => { tt = erEarDraw(scam, t); screenSpace(); });
  } else {
    darkBg('#3A0E22', '#1A0612');
    tt = erEarDraw(scam, t);
  }
  screenSpace();
  if (tt && dive > 0.9) {
    const m = erScr(scam, tt.tt.mid), d = erScr(scam, earDrumMid(tt.S.b));
    erTag('TENSOR TYMPANI', clamp(m[0], 330, 720), m[1] - 120, '#FF86A6', popK(t, c.muscle + 0.1, shot.end + 1), 34);
    erTag('EARDRUM', clamp(d[0] - 40, 230, 700), d[1] - 230, ER_ORANGE, popK(t, c.eardrum - 0.05, shot.end + 1), 36);
    const tk = popK(t, c.tap, c.tap + 0.5);
    erBurst('TOK!', clamp(d[0] + 200, 200, 800), d[1] + 190, 78, ER_GOLD, tk, -0.12, 5);
    erPortrait(236, 1140, 100, t, ramp(t, c.muscle, c.muscle + 0.25), erRumbleK(t));
  }
  return { glow: 0.9, zblur: 0.22 * Math.sin(Math.PI * clamp(dive)), zcx: wx, zcy: wy };
};

// ---------------------------------------------------------------- "Sound went muffled? It's a volume knob, for your own chewing."
SC.payoff = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 368, 884, 2.62], [D, 368, 878, 2.74]]);
  campBack(cam, t, { soft: 0.85 });
  // two bites: a loud one as the shot opens, a quiet one on "chewing"
  const b1 = c.crunch1, b2 = c.crunch2;
  const biteAt = (t0) => smooth(inv(t0 - 0.3, t0 - 0.02, t)) * (1 - smooth(inv(t0 + 0.12, t0 + 0.45, t)));
  const bite = Math.max(biteAt(b1), biteAt(b2));
  const bitten = t < b1 - 0.02 ? 0 : (t < b1 + 0.5 ? 0.6 : (t < b2 - 0.35 ? 0 : (t < b2 - 0.02 ? 0 : 0.6)));
  const chewing = t > b1 && Math.sin((t - b1) * 13) > 0;
  let face = bite > 0.4 ? EF.munch : (chewing ? EF.chew : EF.look);
  const muffs = popK(t, c.muffled - 0.06, c.its + 0.02, 0.1, 0.12);
  if (muffs > 0.3) face = lerpFace(face, EF.wow, 0.7);
  const H = erHero(cam, t, { face, crisp: { hold: 1, bite, bitten }, muffs, redEar: ramp(t, c.knob, c.knob + 0.2) * 0.4 });
  const ear = erScr(cam, H.ear(1)), mouth = erScr(cam, H.mouth);
  // under the earmuffs the first crisp comes out a soft little "crnch"; the second one starts as a big CRUNCH! and the
  // knob turns it down while it sounds
  const turn = ramp(t, c.turn, c.turn + 0.28, E.inOutCubic);
  erBurst('crnch', Math.max(330, mouth[0] - 180), mouth[1] - 400, 58, '#9FD8FF', popK(t, b1, c.its - 0.05, 0.06, 0.12), 0.1, 9);
  erKnob(Math.min(770, ear[0] + 150), ear[1] - 40, 84, popK(t, c.knob_in, shot.end + 1), lerp(0.95, 0.18, turn), t);
  erBurst('CRUNCH!', Math.max(390, mouth[0] - 140), mouth[1] - 410, lerp(118, 54, turn), mixH('#FF9A3C', '#9FB8FF', turn), popK(t, b2, shot.end + 1, 0.05, 0.1), 0.1, 7);
  return { glow: 0.85 };
};

// ---------------------------------------------------------------- "Scientists are testing it so people who can barely move... can type with a rumble."
function erTyped(t) {
  const c = cu();
  return (t >= c.key_i ? 'HI' : (t >= c.key_h ? 'H' : ''));
}
function erScanLetter(t) {
  const c = cu(), order = 'ABCDEFGHIJKL';
  if (t < c.key_h) { const i = Math.floor(Math.max(0, t - (c.key_h - 7 * 0.16 - 0.08)) / 0.16); return order[Math.min(7, i)]; }
  if (t < c.key_h + 0.3) return 'H';
  return 'I';
}
SC.weird = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 470, 960, 1.92], [D, 466, 950, 2.05]]);
  campBack(cam, t, { soft: 0.3 });
  applyCam(cam); campFire(t, 1);
  const rk = erRumbleK(t), picked = Math.max(erSince(t, c.key_h, 6), erSince(t, c.key_i, 6));
  const happy = ramp(t, c.key_i + 0.1, c.key_i + 0.4);
  const H = erHero(cam, t, { face: lerpFace(EF.cosy, EF.grin, happy), bag: 1, bud: 1, budLight: ramp(t, c.cam_in, c.cam_in + 0.2), redEar: rk * 0.6 });
  const ear = erScr(cam, H.ear(-1));
  erRings(ear[0] - 10, ear[1], -1, 150, rk, t, ER_CYAN);
  erTag('EAR CAMERA', Math.max(236, ear[0] - 20), ear[1] + 150, ER_CYAN, popK(t, c.cam_in, shot.end + 1), 32);
  const vk = ramp(t, c.cam_in + 0.15, c.cam_in + 0.45);
  thinLeader([ear[0] - 30, ear[1] + 40], [226, 1010], vk, ER_CYAN);
  erCamView(222, 1112, 108, vk, rk, t);
  erTablet(762, 770, 372, 470, ramp(t, c.scientists + 0.15, c.scientists + 0.5), t,
    { typed: erTyped(t), hl: erScanLetter(t), flash: picked });
  return { glow: 0.85 };
};

// ---------------------------------------------------------------- "Go on. Rumble twice for yes."
SC.button = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 452, 880, 2.55], [D, 444, 872, 2.72]]);
  campBack(cam, t, { soft: 0.75 });
  const rk = erRumbleK(t), yes = ramp(t, c.yes_lit, c.yes_lit + 0.12);
  let face = lerpFace(EF.cosy, EF.look, ramp(t, c.go - 0.1, c.go + 0.2));
  face = lerpFace(face, EF.wow, 0.6 * Math.max(erSince(t, c.yes1, 5), erSince(t, c.yes2, 5)));
  face = lerpFace(face, EF.grin, yes);
  const H = erHero(cam, t, { face, bag: 1, bud: 1, budLight: 1, redEar: rk * 0.6, shake: rk * 0.5 });
  const ear = erScr(cam, H.ear(-1));
  erRings(ear[0] - 10, ear[1], -1, 190, rk, t, ER_CYAN);
  erTablet(772, 760, 372, 430, ramp(t, shot.start, shot.start + 0.3), t, { typed: 'HI', mode: 'yesno', yes, sel: 'yes' });
  return { glow: 0.85 };
};

// ---------------------------------------------------------------- the cover: mid-yawn, the ears rumbling
SC.cover = (lt, t) => {
  const tt = 3.0;
  const { cam } = hookDraw(tt, tt);
  void cam;
  screenSpace();
  bigWord('EARS', 540, 560, 210, ER_GOLD, 1, -0.05);
  bigWord('RUMBLE?!', 540, 1340, 190, '#FFFFFF', 1, 0.04);
  return { glow: 0.85, noCaptions: true };
};

function initScenes2() {
  initCamp();
  initEar();
}
