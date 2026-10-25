// Why Is a Day on Venus LONGER Than Its Year? 🎂 Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds
// inside the shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
// THE CURIOUS KIND (story.md §6): the hero goes there. It is his first birthday on Venus: a silver heat suit, a glass
// helmet with a party hat on it, a cake whose candle is a bulb, and a desk calendar on a rock that still says MONDAY.
'use strict';

const cu = () => TLd.cues;
const bumpAt = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);
const vL2 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

// ---------------------------------------------------------------- the light of each place
// the surface: an overcast that glows orange from above, a warm rim from the brighter sky on the right
const SURF_LIGHT = { ...LIGHTS.day, key: [0.34, -0.6, 0.72], keyTint: [1.08, 0.98, 0.86], shadowTint: [0.9, 0.76, 0.74], shadowDeep: 1.1, cast: 0.4, toonAt: 0.3, form: 0.8,
  rimFrom: [0.8, -0.5], rim: [1.0, 0.74, 0.42], rimAmt: 1.0, pool: 0.22, poolTint: [0.66, 0.44, 0.42], halo: 0.1, haloColor: [1.0, 0.72, 0.42], dof: 0.8 };
// space: one light, the Sun; the key and the rim come from wherever it is from him (screen direction u)
const SPACE_LIGHT = { key: [0, -0.9, 0.6], keyTint: [1.1, 1.04, 0.94], shadowTint: [0.6, 0.62, 0.9], shadowDeep: 1.35, cast: 0.45, toonAt: 0.34, rimFrom: [0, -1],
  rim: [1.0, 0.86, 0.6], rimAmt: 1.2, pool: 0.12, poolTint: [0.3, 0.3, 0.6], halo: 0.06, haloColor: [1.0, 0.8, 0.5], form: 1.1 };
function sunLight(P) {
  const d = [SP.sun[0] - P[0], SP.sun[1] - P[1]], L = Math.hypot(d[0], d[1]) || 1, u = [d[0] / L, d[1] / L];
  return { ...SPACE_LIGHT, key: [u[0] * 0.75, u[1] * 0.75, 0.6], rimFrom: [u[0], u[1]] };
}

// ---------------------------------------------------------------- the place on the surface
const HERO = { x: 600, y: 1650 };
const CAL = { x: 262, y: 1500, s: 0.9, rock: [262, 1652, 250, 152] };
const CAKE_ROCK = [870, 1660, 230, 90];
function bunting(t) { vnBunting(ctx, t, 40, 960, 1150, 1010, 120); }
function calendarSet(t, cal) {
  vnRock(ctx, ...CAL.rock, 5);
  vnCalendar(ctx, CAL.x, CAL.y, CAL.s, t, cal);
}
// the whole surface scene. o: {cam, A (vnHero's description, or false), behind(P), after(P, Hh), soft, dawn, dawnX}
function surfDraw(t, o) {
  const cam = o.cam, P = vnPlane(cam), soft = o.soft === undefined ? clamp((cam.zoom - 1.25) / 0.9) : o.soft;
  vnSky(P, t, { soft, dawn: o.dawn, dawnX: o.dawnX });
  vnGround(P, t, { soft, dawn: o.dawn });
  vnShimmer(P, t, 1 - soft);
  applyCam(cam);
  if (o.behind) { o.behind(P); applyCam(cam); }
  const Hh = o.A === false ? null : vnHero(cam, t, o.A);
  applyCam(cam);
  if (o.after) o.after(P, Hh);
  vnForeground(P, t, clamp((cam.zoom - 1.7) / 0.5) * 0.45);
  vnMotes(t, 1, cam);
  return { P, Hh };
}

// ---------------------------------------------------------------- his faces
const VF = {
  blow: Object.assign({}, FACES.calm, { lookX: 0, lookY: 0.9, mouth: 'o', mouthOpen: 0.15, browY: 1.0, browTilt: 0.2, eyeOpen: 1.1 }),
  huh: Object.assign({}, FACES.confused, { lookX: 0, lookY: 0.9, browY: 0.9 }),
  side: Object.assign({}, FACES.calm, { lookX: -1, lookY: 0.15, browY: 0.5, browTilt: 0.2, mouth: 'flat', mouthOpen: 0 }),
  wide: Object.assign({}, FACES.startled, { lookX: -1, lookY: 0.15, mouthOpen: 0.45 }),
  fond: Object.assign({}, FACES.grin, { lookX: 0, lookY: 0, mouthOpen: 0.55, browY: 0.6, eyeOpen: 1.05 }),
  dead: Object.assign({}, FACES.annoyed, { lookX: 0, lookY: 0, blink: 0.38, browTilt: -0.25, browY: -0.35, mouth: 'flat', mouthOpen: 0 }),
  wow: Object.assign({}, FACES.startled, { lookX: 0.4, lookY: -0.6, mouth: 'o', mouthOpen: 0.5 }),
  down: Object.assign({}, FACES.calm, { lookX: 0, lookY: 1, browY: 0.7, mouth: 'flat', mouthOpen: 0.1 }),
  push: Object.assign({}, FACES.nervous, { lookX: 0.2, lookY: 0.4, browY: -0.2, browTilt: -0.5, mouth: 'grimace', mouthOpen: 0.9 }),
  pant: Object.assign({}, FACES.calm, { lookX: 0, lookY: 0.3, blink: 0.35, browY: 0.5, browTilt: 0.6, mouth: 'o', mouthOpen: 0.7 }),
  wait: Object.assign({}, FACES.annoyed, { lookX: 0.9, lookY: -0.6, blink: 0.25, browY: -0.1, browTilt: -0.4 }),
  yay: Object.assign({}, FACES.grin, { lookX: 0, lookY: -0.2, mouthOpen: 0.85, blink: 0.9, browY: 0.9 }),
  grin: Object.assign({}, FACES.grin, { lookX: 0.6, lookY: -0.7, mouthOpen: 0.8, browY: 0.8 }),
  stare: Object.assign({}, FACES.calm, { lookX: -1, lookY: 0.1, eyeOpen: 1.2, pupil: 0.7, browY: 0.2, browTilt: -0.1, mouth: 'flat', mouthOpen: 0 }),
  chill: Object.assign({}, FACES.calm, { lookX: 0, lookY: 0, blink: 0.3, browY: 0.2, mouth: 'flat', mouthOpen: 0.1 }),
  back: Object.assign({}, FACES.startled, { lookX: 1, lookY: -0.4, mouth: 'o', mouthOpen: 0.4 }),
};

// ================================================================ the hook and the button (one state, valid at negative time)
// tt = seconds since frame 1. Negative tt = the end of the Short: "Happy birthday. It's still... Monday." then he
// breathes in to blow, and frame 1 is him blowing.
const TIGHT = [612, 1268, 2.3], MED = [478, 1330, 1.32];
function hookA(tt) {
  const c = cu(), D = TLd.duration;
  const r = (a, b, e) => ramp(tt, a, b, e);
  const A = { x: HERO.x, y: HERO.y, s: 1, cake: { k: 1, at: [0, -250], lit: 1, dy: 0 }, hat: 1, headDY: 0 };
  const cal = { month: 0 };
  let face = VF.blow;
  if (tt < 0) {
    const tH = c.happy - D, tBe = c.birthday_end - D, tI = c.its - D, tM = c.monday - D, tMe = c.monday_end - D;
    const lift = Math.sin(Math.PI * clamp(inv(tH - 0.15, tBe + 0.35, tt)));
    A.cake.dy = -24 * lift;
    face = Object.assign({}, VF.fond);
    face = lerpFace(face, VF.side, r(tI - 0.1, tI + 0.12));
    face = lerpFace(face, VF.dead, r(tM - 0.08, tM + 0.1));
    const inhale = r(-0.62, -0.04, E.inOutSine);
    face = lerpFace(face, Object.assign({}, VF.blow, { mouthOpen: 0.3 }), inhale);
    A.cheeks = inhale;
    A.headDY = -6 * inhale + 3 * lift;
    A.hatHop = 30 * Math.sin(Math.PI * clamp(inv(tH, tH + 0.35, tt)));
    A.headRot = -0.05 * r(tI - 0.1, tI + 0.15) * (1 - r(tM - 0.1, tM + 0.1));
    cal.month = 0;
  } else {
    // he blows (twice), the glass fogs, the bulb does not care; then the calendar, and the year flipping by
    const puff = Math.max(1 - 0.35 * r(0.3, 0.5) + 0.35 * r(0.5, 0.62), 0) * (1 - r(c.venus_end - 0.05, c.venus_end + 0.15));
    A.cheeks = puff;
    A.fog = r(0.0, 0.75) * (1 - r(1.3, 2.9));
    A.headDY = 8 * puff + 4 * Math.sin(tt * 9) * puff;
    face = VF.blow;
    face = lerpFace(face, VF.huh, r(c.venus_end - 0.02, c.venus_end + 0.18));
    face = lerpFace(face, VF.side, r(c.lasts - 0.15, c.lasts + 0.15));
    face = lerpFace(face, VF.wide, r(c.whole - 0.05, c.whole + 0.12));
    A.headRot = -0.06 * r(c.lasts - 0.15, c.lasts + 0.2);
    cal.month = 12 * E.inOutSine(inv(c.whole - 0.06, c.year_end + 0.05, tt));
    A.hatHop = 22 * Math.sin(Math.PI * clamp(inv(c.year_end - 0.1, c.year_end + 0.25, tt)));
  }
  A.face = face;
  return { A, cal };
}
function hookCam(tt) {
  const c = cu(), D = TLd.duration;
  let k;
  if (tt < 0) {
    const tB = c.happy - D - 0.3, tI = c.its - D;
    k = camKeys(tt, [[tB, MED[0] + 10, MED[1], MED[2] - 0.04], [tI - 0.2, MED[0], MED[1], MED[2] + 0.02], [-0.2, ...TIGHT], [0, ...TIGHT]], E.inOutCubic);
  } else {
    k = camKeys(tt, [[0, ...TIGHT], [c.one - 0.1, TIGHT[0], TIGHT[1] + 4, TIGHT[2] + 0.05], [c.longer + 0.25, ...MED], [c.year_end + 0.2, 440, 1322, 1.44]], E.inOutCubic);
  }
  return k;
}
function hookDraw(tt, t, o = {}) {
  const S = hookA(tt), cam = o.cam || hookCam(tt);
  surfDraw(t, { cam, A: S.A, behind: () => bunting(t), after: () => { calendarSet(t, S.cal); if (o.after) o.after(S); } });
  return { S, cam };
}
SC.hook = (lt, t) => { hookDraw(t, t); return { glow: 0.85 }; };
SC.button = (lt, t) => { hookDraw(t - TLd.duration, t); return { glow: 0.85 }; };
SC.loop = (lt, t) => { hookDraw(t - TLd.duration, t); return { glow: 0.85 }; };

// ================================================================ the rise: up through the cloud lid, into space
function cloudWipe(t, k, seed = 3) {
  if (k <= 0.01) return;
  screenSpace();
  const rng = mulberry32(seed);
  ctx.fillStyle = rgba('#F7C98A', 0.85 * k); ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 26; i++) {
    const x = rng() * W, y = ((rng() * 2600 + t * 2600 * (0.6 + rng())) % 2600) - 340, r = 220 + 360 * rng();
    softDot(ctx, x, y, r, rng() < 0.5 ? '#FFE8C0' : '#D88A44', 0.55 * k);
  }
}
function spaceHero(cam, t, C, a, A0 = {}) {
  const F = spOnPlanet(C, a);
  return vnHero(cam, t, Object.assign({ x: F[0], y: F[1], s: SP.hs, rot: a + Math.PI / 2, cake: { k: 1, at: [0, -250], lit: 1 }, hat: 1 }, A0));
}
SC.rise = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, tSw = T0 + 0.42;
  if (t < tSw) {                                           // the surface, the camera shooting straight up into the cloud
    const u = E.inCubic(inv(T0, tSw, t)), last = hookCam(T0);
    const cam = { x: lerp(last.x, 560, u), y: lerp(last.y, -900, u), zoom: lerp(last.zoom, 1.0, u), rot: 0 };
    hookDraw(t, t, { cam });
    cloudWipe(t, ramp(t, T0 + 0.16, tSw));
    return { glow: 0.8, zblur: 0.25 * u, blur: [0, 26 * u] };
  }
  const cam = camKeys(t, [[tSw, 540, 1330, 1.42], [tSw + 1.15, 540, 1580, 1.0], [shot.end, 540, 1600, 0.97]], E.outCubic);
  spBack(cam, t); spSun(cam, t);
  const C = spPos(0);
  const walk = ramp(t, c.it1 - 0.12, c.it1 + 0.12) * (1 - ramp(t, c.spins_end - 0.25, c.spins_end + 0.05));
  const nudge = 0.06 * ramp(t, c.barely, c.spins_end + 0.1, E.inOutSine);   // all that walking: the planet turns a hair
  spPlanet(cam, t, C, nudge, { zzz: c.laziest - 0.1 });
  const a = -Math.PI / 2 + nudge;
  let face = VF.wow;
  face = lerpFace(face, VF.down, ramp(t, c.laziest - 0.1, c.laziest + 0.15));
  face = lerpFace(face, VF.push, walk);
  face = lerpFace(face, VF.pant, ramp(t, c.spins_end - 0.2, c.spins_end + 0.1));
  const Hh = spaceHero(cam, t, C, a, { face, walk: walk > 0.02 ? t * 15 : undefined, headDY: 4 * walk * Math.sin(t * 30) });
  applyCam(cam);
  const pant = ramp(t, c.spins_end - 0.1, c.spins_end + 0.2);
  if (pant > 0.01) { const hp = Hh.head; sweatDrop(ctx, hp[0] + 70, hp[1] - 20 + 30 * ((t * 1.6) % 1), 1.6, pant * (1 - ((t * 1.6) % 1))); }
  cloudWipe(t, 1 - ramp(t, tSw, tSw + 0.32));
  return { glow: 0.9, zblur: 0.22 * (1 - ramp(t, tSw, tSw + 0.4)) };
};
setLights({ rise: (lt, t) => (t < TLd.shots.find((s) => s.id === 'rise').start + 0.42 ? SURF_LIGHT : sunLight(spOnPlanet(spPos(0), -Math.PI / 2, 200))) });

// ================================================================ the lap: the one picture
const ORB_CAM = [540, 1046, 0.28];
function lapDays(t) { const c = cu(); return SP.year * E.inOutSine(inv(c.laps, c.days_end - 0.08, t)); }
SC.orbit = (lt, t, shot) => {
  const c = cu(), T0 = shot.start;
  const cam = camKeys(t, [[T0, 540, 1600, 0.97], [T0 + 0.8, ...ORB_CAM], [shot.end, ORB_CAM[0], ORB_CAM[1] - 10, ORB_CAM[2] * 1.02]], E.inOutCubic);
  const d = lapDays(t), C = spPos(d), a = spHeroAng(d);
  spBack(cam, t); spSun(cam, t);
  spOrbit(cam, t, { d1: d });
  spPlanet(cam, t, C, a + Math.PI / 2);
  const done = ramp(t, c.days_end - 0.08, c.days_end + 0.1);
  spaceHero(cam, t, C, a, { face: lerpFace(VF.wow, VF.yay, done), cake: { k: 1, at: [0, -250], lit: 1, dy: -40 * done } });
  spDial(cam, C, a, ramp(t, c.laps, c.laps + 0.3) * 0.9);
  // the year: the counter, then the tick when the lap closes
  spCounter(d, ramp(t, T0 + 0.62, T0 + 0.8));
  const P = toScreen(cam, C[0], C[1]);
  screenSpace(); vnConfetti(P[0], P[1] - 40, t - (c.days_end - 0.06), 4, 46, 1.4);
  spPill('1 YEAR', '225 DAYS', 250, 720, '#FFD447', ramp(t, c.days_end - 0.06, c.days_end + 0.1));
  return { glow: 0.95, zblur: 0.12 * (1 - ramp(t, T0, T0 + 0.5)) };
};
setLights({ orbit: (lt, t) => sunLight(spPos(lapDays(t))) });

// ================================================================ the turn: 18 more days to get round once
function spinDays(t) { const c = cu(); return SP.year + (SP.day - SP.year) * E.inOutSine(inv(c.two2 - 0.25, c.once - 0.02, t)); }
SC.spin = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, d = spinDays(t), C = spPos(d), a = spHeroAng(d);
  const k = E.inOutCubic(inv(T0, T0 + 0.85, t));
  const nz = 0.8, near = [C[0], C[1] - 170];
  const cam = { x: lerp(ORB_CAM[0], near[0], k), y: lerp(ORB_CAM[1], near[1], k), zoom: ORB_CAM[2] * Math.pow(nz / ORB_CAM[2], k), rot: 0 };
  spBack(cam, t); spSun(cam, t);
  spOrbit(cam, t, { d1: SP.year, trail: 1 - k, ring: 1 - k });
  spPlanet(cam, t, C, a + Math.PI / 2);
  spStart(cam, C, ramp(t, T0 + 0.55, T0 + 1.0));
  const done = ramp(t, c.once - 0.04, c.once + 0.12);
  spDial(cam, C, a, 1, done);
  // he waits for the line: taps his foot, glares at it, leans in; ONCE: he lifts the cake
  const tap = ramp(t, T0 + 0.5, T0 + 0.8) * (1 - ramp(t, c.turn - 0.2, c.turn));
  const pose = JSON.parse(JSON.stringify(POSES.stand)), tp = Math.max(0, Math.sin(t * 15)) * tap;
  pose.legR = { a: 0.12 + 0.14 * tp, b: -0.4 * tp };
  let face = VF.yay;
  face = lerpFace(face, VF.wait, ramp(t, T0 + 0.3, T0 + 0.7));
  face = lerpFace(face, VF.push, ramp(t, c.turn - 0.2, c.turn + 0.1));
  face = lerpFace(face, VF.yay, done);
  spaceHero(cam, t, C, a, { pose, face, lean: 0.12 * ramp(t, c.turn - 0.2, c.once) * (1 - done), cake: { k: 1, at: [0, -250], lit: 1, dy: -50 * done } });
  spCounter(d, 1);
  spPill('1 YEAR', '225 DAYS', 250, 720, '#FFD447', 1);
  spPill('1 DAY', '243 DAYS', 830, 720, '#7FE9FF', done);
  if (done > 0.01) { const P = toScreen(cam, ...spOnPlanet(C, a, 200)); screenSpace(); vnConfetti(P[0], P[1], t - c.once, 6, 30, 1.2); }
  return { glow: 0.95 };
};
setLights({ spin: (lt, t) => sunLight(spPos(spinDays(t))) });

// ================================================================ the payoff: a year older (POP)... not a day older (MONDAY)
function payA(t) {
  const c = cu();
  const A = { x: 500, y: HERO.y, s: 1, hat: 1, cake: null };
  const pop = c.older_end + 0.03;                // in the pause after "older..." (say it on the word, do it in the pause)
  // the popper up in his right hand; it kicks when it fires
  const kick = bumpAt(t, pop, 8);
  A.armR = [150 + 10 * kick, -360 - 30 * kick];
  A.popper = { at: [150 + 10 * kick, -380 - 30 * kick], rot: 0.35 + 0.25 * kick };
  A.handR = 'open';
  // his left hand goes to the calendar's page and rips it off
  const reach = ramp(t, c.before - 0.05, c.day2 + 0.05, E.inOutCubic), rip = ramp(t, c.older2_end + 0.02, c.older2_end + 0.6);
  const page = [CAL.x - 500 + 0, CAL.y - HERO.y - 160 * CAL.s];
  const rest = [-120, -200];
  let hand = vL2(rest, page, reach);
  if (rip > 0) hand = vL2(page, [page[0] - 110, page[1] - 120], rip);
  A.armL = hand; A.handL = 'open';
  A.lean = -0.12 * reach;
  let face = VF.fond;
  face = lerpFace(face, VF.grin, ramp(t, pop - 0.05, pop + 0.08));
  face = lerpFace(face, VF.side, ramp(t, c.before - 0.1, c.before + 0.15));
  face = lerpFace(face, VF.stare, ramp(t, c.older2_end + 0.25, c.older2_end + 0.4));
  A.face = face;
  A.hatHop = 40 * Math.sin(Math.PI * clamp(inv(pop, pop + 0.4, t)));
  A.headRot = -0.08 * reach;
  return { A, pop, rip };
}
SC.payoff = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, S = payA(t);
  const cam = camKeys(t, [[T0, 470, 1330, 1.3], [c.before - 0.1, 470, 1326, 1.33], [c.older2_end + 0.1, 400, 1340, 1.5], [shot.end, 395, 1342, 1.53]], E.inOutCubic);
  surfDraw(t, { cam, A: S.A, behind: () => bunting(t), after: (P, Hh) => {
    calendarSet(t, { month: 0, rip: S.rip });
    // the popper's confetti, out of its mouth and up
    const mouth = Hh.wp([150 + 10 * bumpAt(t, S.pop, 8) + 96 * Math.sin(0.35), -380 - 96 * Math.cos(0.35)]);
    vnConfetti(mouth[0], mouth[1], t - S.pop, 11, 60, 0.9, 0.25, 1.1);
  } });
  return { glow: 0.85 };
};
setLights({ payoff: SURF_LIGHT, hook: SURF_LIGHT, button: SURF_LIGHT, loop: SURF_LIGHT, cover: SURF_LIGHT });

// ================================================================ the weird fact: it spins backwards; the Sun comes up in the WEST
const CHAIR = [560, 1700];
function eastTag(txt, x, y, k, col, arrow) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.font = '400 70px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + 70, h = 96;
  rrect(ctx, -w / 2 - 5, -h / 2 - 5, w + 10, h + 10, 20); ctx.fillStyle = '#0B0B1A'; ctx.fill();
  rrect(ctx, -w / 2, -h / 2, w, h, 16); ctx.fillStyle = col; ctx.fill();
  ctx.fillStyle = '#0B0B1A'; ctx.fillText(txt, 0, 3);
  if (arrow) {                                                 // an arrow under it: this way
    ctx.save(); ctx.translate(0, arrow > 0 ? h / 2 + 46 : -h / 2 - 46); ctx.rotate(arrow > 0 ? 0 : Math.PI);
    ctx.beginPath(); ctx.moveTo(-16, -30); ctx.lineTo(16, -30); ctx.lineTo(16, 0); ctx.lineTo(34, 0); ctx.lineTo(0, 34); ctx.lineTo(-34, 0); ctx.lineTo(-16, 0); ctx.closePath();
    ctx.lineWidth = 8; ctx.strokeStyle = '#0B0B1A'; ctx.stroke(); ctx.fillStyle = col; ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}
function weirdA(t) {
  const c = cu(), T0 = c.oh_end - 0.3;
  const A = { x: CHAIR[0], y: CHAIR[1] - 70, s: 1, sit: true, hat: 1, cake: null, shades: 1 };
  // the mug: up to his "mouth" and CLINK on the glass, back down
  const clink = c.oh_end + 0.02;                 // in the pause after "Oh,"
  const up = ramp(t, T0, clink, E.inCubic) * (1 - ramp(t, clink + 0.12, clink + 0.6, E.inOutCubic));
  const bonk = bumpAt(t, clink, 14);
  const mugAt = vL2([110, -150], [26, -228 + 10 * bonk], up);
  A.armR = vL2([96, -110], [40, -200], up); A.handR = 'open';
  A.mug = { at: mugAt, rot: -0.2 - 0.5 * up + 0.3 * bonk };
  A.armL = [-120, -120];
  const dawn = ramp(t, c.so2 - 0.15, c.west + 0.3, E.inOutSine);
  const turn = ramp(t, c.comes - 0.1, c.up + 0.2, E.inOutCubic) * (1 - ramp(t, c.west_end + 0.25, c.west_end + 0.6));
  let face = VF.chill;
  face = lerpFace(face, VF.huh, ramp(t, clink, clink + 0.12) * (1 - ramp(t, clink + 0.6, clink + 0.8)));
  face = lerpFace(face, Object.assign({}, VF.chill, { lookX: 0.3, lookY: -0.7 }), ramp(t, c.spins2 - 0.1, c.spins2 + 0.15) * (1 - ramp(t, c.so2 - 0.1, c.so2 + 0.1)));
  face = lerpFace(face, VF.back, turn);
  face = lerpFace(face, VF.dead, ramp(t, c.west_end + 0.25, c.west_end + 0.5));
  A.face = face;
  A.headRot = 0.16 * turn;
  A.headDX = 10 * turn;
  A.shadesUp = ramp(t, c.west - 0.1, c.west + 0.15, E.outBack);
  A.headDY = -6 * bonk;
  return { A, dawn, turn, clink };
}
SC.weird = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, S = weirdA(t);
  const cam = camKeys(t, [[T0, 560, 1430, 1.48], [c.so2 - 0.2, 566, 1424, 1.5], [c.west + 0.3, 590, 1410, 1.56], [shot.end, 592, 1408, 1.58]], E.inOutCubic);
  const dawnX = 860;
  surfDraw(t, { cam, A: S.A, dawn: S.dawn, dawnX, behind: (P) => {
    vnChairBack(ctx, CHAIR[0], CHAIR[1], 1);
    // his shadow, thrown toward us by the dawn behind him
    if (S.dawn > 0.02) {
      ctx.save(); ctx.globalAlpha = 0.5 * S.dawn;
      ctx.beginPath(); ctx.moveTo(CHAIR[0] - 120, CHAIR[1] + 4); ctx.lineTo(CHAIR[0] + 120, CHAIR[1] + 4);
      ctx.lineTo(CHAIR[0] - 60 + 260 * S.dawn, CHAIR[1] + 520 * S.dawn); ctx.lineTo(CHAIR[0] - 520 + 160 * S.dawn, CHAIR[1] + 520 * S.dawn); ctx.closePath();
      ctx.fillStyle = '#1E0C04'; ctx.fill(); ctx.restore();
    }
  }, after: (P, Hh) => {
    vnChairFront(ctx, CHAIR[0], CHAIR[1], 1);
    // CLINK: a flash where the mug hits the glass
    const ck = popK(t, S.clink, S.clink + 0.22);
    if (ck > 0.01) {
      const hp = toScreen(cam, ...Hh.wp([30, -228]));
      shockLines(hp[0] + 20, hp[1] - 10, 60, ck, 8, '#FFFFFF', 3);
    }
  } });
  // EAST (where he looks) and then WEST (where it comes up)
  eastTag('EAST', 300, 1480, popK(t, T0 + 0.25, c.so2 + 0.1), '#7FE9FF', 1);
  const P = vnPlane(cam);
  eastTag('WEST', dawnX - 40, P.yH - 230, ramp(t, c.west - 0.06, c.west + 0.1), '#FF9A3C', 0);
  // the little Earth and the little Venus: they turn opposite ways
  const gk = popK(t, c.spins2 - 0.12, c.so2 + 0.05);
  spMiniGlobe(300, 600, 92, t, 1, '#3F86E0', 'EARTH', gk);
  spMiniGlobe(780, 600, 92, t, -1, '#E8C482', 'VENUS', popK(t, c.spins2 - 0.02, c.so2 + 0.05), ramp(t, c.backwards, c.backwards + 0.1));
  if (S.clink > 0) { const ck = popK(t, S.clink, S.clink + 0.45); if (ck > 0.01) burstWord('CLINK!', 790, 840, 66, '#FFFFFF', ck, 0.08); }
  return { glow: 0.85 };
};
setLights({ weird: (lt, t) => { const w = weirdA(t); return { ...SURF_LIGHT, rimFrom: [0.7, -0.55], rim: [1.0, 0.7, 0.32], rimAmt: 1.0 + 1.6 * w.dawn, halo: 0.1 + 0.3 * w.dawn, key: [0.34 + 0.25 * w.dawn, -0.6, 0.72 - 0.2 * w.dawn] }; } });

// a comic word in a jagged burst (screen space)
function burstWord(txt, x, y, size, col, k, rot = -0.08) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.font = `400 ${size}px Anton`; const w = ctx.measureText(txt).width;
  ctx.beginPath();
  for (let i = 0; i < 18; i++) { const a = (i / 18) * 6.283, R = (i % 2 ? 0.62 : 0.86) * (w * 0.62 + 30); ctx.lineTo(Math.cos(a) * R, Math.sin(a) * R * 0.62); }
  ctx.closePath(); ctx.fillStyle = '#FFF2C4'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#0B0B1A'; ctx.stroke();
  ctx.restore();
  bigWord(txt, x, y + 2, size, col, s, rot);
}

// ================================================================ the cover: his birthday, DAY > YEAR
SC.cover = (lt, t) => {
  const S = hookA(2.2);
  S.A.face = VF.wide; S.A.fog = 0;
  surfDraw(2.2, { cam: { x: 470, y: 1210, zoom: 1.32, rot: 0 }, A: S.A, behind: () => bunting(2.2), after: () => calendarSet(2.2, { month: 0 }) });
  screenSpace();
  bigWord('ON VENUS', 540, 470, 96, '#FFFFFF', 1, -0.04);
  bigWord('1 DAY > 1 YEAR', 540, 600, 132, '#FFD447', 1, -0.04);
  return { glow: 0.85, noCaptions: true };
};

function initScenes2() {
  initVenus();
  initSpace();
}
