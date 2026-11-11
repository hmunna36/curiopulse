// Your Phone's GPS Needs EINSTEIN: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js. Every beat comes from a cue (make_timeline.py).
'use strict';

const cu = () => TLd.cues;

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the lake: the afterglow of a sun just set on the RIGHT; orbit: the Sun high on the left, the Earth's blue glow from below
const GP_L_DUSK = Object.assign({}, LIGHTS.sunset, { keyTint: [1.08, 1.0, 0.92] });
const GP_L_SPACE = Object.assign({}, LIGHTS.day, { key: [-0.5, -0.6, 0.62], keyTint: [1.06, 1.03, 0.98], rimFrom: [0.35, 0.9],
  rim: [0.5, 0.78, 1.0], rimAmt: 1.1, pool: 0.4, poolTint: [0.42, 0.46, 0.8] });
setLights({
  hook: GP_L_DUSK, drag: GP_L_DUSK, payoff: GP_L_DUSK, loop: GP_L_DUSK, cover: GP_L_DUSK,
  answer: GP_L_SPACE, gravity: Object.assign({}, GP_L_SPACE, { pool: 0.25 }), gain: GP_L_SPACE, weird: GP_L_SPACE, button: GP_L_SPACE,
});

// ---------------------------------------------------------------- him (any place)
// o: {x, y, s, pose, face, pal, frizz, armR/armL: {e, w} (world points: elbow, wrist), hand, watch: {side, r, ang, o},
//     phone: {x, y, h, map: {...}, rot}, helmet, drops, drips, headDX, headRot, post}
function gpHero(cam, t, o) {
  const st = { x: o.x, y: o.y, s: o.s, frizz: o.frizz || 0, seed: 3, headDX: o.headDX || 0, headDY: o.headDY || 0, headRot: o.headRot || 0 };
  let pose = JSON.parse(JSON.stringify(o.pose || POSES.stand));
  if (o.lean != null) pose.lean = o.lean;
  if (o.armR) pose = armAt(pose, 'R', ikLocal(st, o.armR.e[0], o.armR.e[1]), ikLocal(st, o.armR.w[0], o.armR.w[1]));
  if (o.armL) pose = armAt(pose, 'L', ikLocal(st, o.armL.e[0], o.armL.e[1]), ikLocal(st, o.armL.w[0], o.armL.w[1]));
  if (o.hand) pose.hand = o.hand;
  if (o.handR) pose.handR = o.handR;
  if (o.handL) pose.handL = o.handL;
  st.pose = pose; st.face = o.face || FACES.calm;
  applyCam(cam);
  const r = charLayer(cam, st, t, { pal: o.pal || PAL, post: (lc, rr, s2) => {
    if (o.watch) {
      const wr = toWorld(s2, rr['wr' + o.watch.side]);
      gpWatch(lc, wr[0], wr[1], o.watch.r, o.watch.ang || 0, o.watch.o || {});
    }
    if (o.phone) {
      const p = o.phone;
      gpPhone(lc, p.x, p.y, p.h, t, p.map || {});
      gpGrip(lc, p.x, p.y, p.h, p.rot || 0);
    }
    if (o.helmet) gpHelmet(lc, s2, rr, t, { drops: o.drops });
    if (o.drips) gpDrips(lc, s2, rr, t, o.drips);
    if (o.post) o.post(lc, rr, s2);
  } });
  applyCam(cam);          // charLayer leaves the main canvas in screen space
  return { st, r };
}
// a hand gripping the phone's lower half (drawn after the phone): the thumb on the near edge, fingers round the far one
function gpGrip(c, x, y, h, rot) {
  const w = h * 0.49, s = h / 150;
  c.save(); c.translate(x, y); c.rotate(rot || 0);
  rrect(c, -w / 2 - 10 * s, h * 0.1, 22 * s, 42 * s, 10 * s); c.fillStyle = PAL.skin; c.fill();
  for (let i = 0; i < 3; i++) { rrect(c, w / 2 - 12 * s, h * 0.08 + i * 15 * s, 22 * s, 13 * s, 6 * s); c.fillStyle = PAL.skinSh; c.fill(); }
  c.restore();
}
// a floating pose (zero gravity): knees a little up, arms loose; bob by t
function gpFloatPose(t, ph = 0) {
  const p = lerpPose(POSES.stand, POSES.sit, 0.18);
  p.legL = { a: 0.45 + 0.06 * Math.sin(t * loopW(0.9) + ph), b: -0.85 };
  p.legR = { a: 0.25 + 0.06 * Math.sin(t * loopW(0.9) + ph + 1), b: -0.45 };
  p.armL = { a: 0.55 + 0.08 * Math.sin(t * loopW(0.7) + ph), b: 0.5 };
  p.hipY = -222;
  return p;
}

// ================================================================ HOOK: your phone's GPS needs EINSTEIN (CU, him left)
const GP_HOOK_CAM = { x: 520, y: 1450, zoom: 2.45 };
const GP_HST = { x: 430, y: 1900, s: 1 };            // his head centre lands at (430, 1430)
const GP_HPH = { x: 592, y: 1450, h: 172 };          // the phone beside his face, its screen to us
// the hook's picture as a function of tt = seconds since the video started (negative: the loop's lead-in, before any beat)
function gpHookDraw(tt) {
  const c = cu();
  const cam = Object.assign({}, GP_HOOK_CAM, { zoom: GP_HOOK_CAM.zoom + 0.05 * E.inOutSine(clamp(tt / 2.9)) });
  const ph = toScreen(cam, GP_HPH.x, GP_HPH.y - GP_HPH.h * 0.38);
  const beamK = ramp(tt, c.beam, c.beam + 0.55, E.inOutCubic);
  const flash = popK(tt, c.einstein - 0.02, c.einstein + 0.45, 0.06, 0.3);
  gpLakeBack(tt, { hz: 1265, dx: -60, ms: 1.3, satX: 930 + 6 * tt, satY: 520 - 3 * tt, satFlash: flash, beam: { x0: ph[0], y0: ph[1], k: beamK } });
  applyCam(cam);
  gpShore(ctx, -200, 1400, 1700, tt, {});
  // the Einstein poof: his hair goes white and wild on "EINSTEIN", and settles before the whip
  const poof = snapRamp(tt, c.poof, c.poof + 0.2, { over: 2.2 }) * (1 - ramp(tt, c.unpoof, c.unpoof + 0.16, E.inOutCubic));
  const white = poof > 0.04;
  const startled = popK(tt, c.poof, c.unpoof + 0.08, 0.05, 0.12);
  let face = Object.assign({}, FACES.grin, { lookX: 0.55, lookY: 0.15 });
  if (startled > 0) face = lerpFace(face, Object.assign({}, FACES.startled, { lookX: 0, lookY: -0.4, mouth: 'o', mouthOpen: 0.6 }), startled);
  const sway = 3 * Math.sin(tt * 2.1);
  const wr = [GP_HPH.x - 4, GP_HPH.y + GP_HPH.h * 0.36 + sway];
  gpHero(cam, tt, { x: GP_HST.x, y: GP_HST.y, s: 1, face,
    armR: { e: [650, 1668], w: wr }, handR: 'open', headRot: 0.04 * startled,
    post: white ? (lc, rr, s2) => gpEinsteinHair(lc, s2, rr, poof, tt) : null,
    phone: { x: GP_HPH.x, y: GP_HPH.y + sway, h: GP_HPH.h, map: { dot: [0.34, 0.52], pulse: tt, sat: tt > c.beam + 0.5 ? 1 : 0.35 } } });
  // two little puffs of smoke burst out at the sides as the hair poofs
  const pk = popK(tt, c.poof - 0.02, c.poof + 0.3, 0.04, 0.2);
  if (pk > 0.01) {
    const u = ramp(tt, c.poof, c.poof + 0.3);
    for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) circle(ctx, GP_HST.x + sd * (150 + 60 * u + i * 26), 1400 - 40 * u - i * 22, (16 - i * 3) * (0.6 + 0.6 * u), rgba('#FFFFFF', 0.75 * pk));
  }
  return cam;
}
SC.hook = (lt, t, shot) => {
  gpHookDraw(t);
  return { glow: 0.85 };
};
SC.loop = (lt, t, shot) => {
  gpHookDraw(lt - (shot.end - shot.start));
  return { glow: 0.85 };
};

// ================================================================ ANSWER: up in space... time runs FASTER (MEDIUM, low angle)
SC.answer = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 560, y: 980 + 30 * ramp(lt, 0, D, E.inOutSine), zoom: 1.12 + 0.05 * ramp(lt, 0, D, E.inOutSine) };
  gpStars(cam.x, cam.y - 400 * lt / D);
  applyCam(cam);
  gpEarth(ctx, 540, 3020, 1420, t, { rot: 0.012 * t, sunA: -2.2, night: 0.7, lights: 0.6 });
  // the satellite on the right, its clock whirling on "FASTER"
  const whirl = ramp(t, c.whirl - 0.05, c.whirl + 0.25) * (1 - 0.6 * ramp(t, shot.end - 0.5, shot.end));
  const sClock = 3600 * 2 + 40 * t + 900 * Math.max(0, t - c.whirl) * (1 + 3 * whirl);
  gpSat(ctx, 760, 820, 0.78, t, { time: sClock, whirl, tilt: -0.08 + 0.02 * Math.sin(t * 0.8) });
  if (whirl > 0.1) {
    const sp = toScreen(cam, 760, 809), bk = popK(t, c.whirl, c.faster_end + 0.32, 0.06, 0.2);
    shockLines(sp[0], sp[1], 150, inv(c.whirl, c.whirl + 0.55, t), 12, '#FFD447', 4);              // a burst as it spins up
    shockLines(sp[0], sp[1], 170, inv(c.faster_end - 0.02, c.faster_end + 0.45, t), 14, '#FFFFFF', 9);   // and on the hit
    // speed arcs whipping round the clock's rim (the hands are a blur)
    screenSpace();
    for (let i = 0; i < 3; i++) {
      const a0 = t * 14 + i * 2.1, rr = 92 + i * 16;
      ctx.save(); ctx.lineCap = 'round'; ctx.lineWidth = 11 - i * 2.5; ctx.strokeStyle = rgba('#FFFFFF', 0.85 * bk);
      ctx.beginPath(); ctx.arc(sp[0], sp[1], rr, a0, a0 + 1.3); ctx.stroke(); ctx.restore();
      gctx.save(); gctx.lineWidth = 10; gctx.strokeStyle = rgba('#FFE7A0', 0.5 * bk); gctx.beginPath(); gctx.arc(sp[0], sp[1], rr, a0, a0 + 1.3); gctx.stroke(); gctx.restore();
    }
  }
  applyCam(cam);
  // him floating at the left in a bubble helmet, his watch held up toward it; a double take on "FASTER"
  const bob = 12 * Math.sin(t * 1.4);
  const dbl = popK(t, c.double, c.double + 0.5, 0.05, 0.2);
  const x0 = 330, y0 = 1420 + bob, s = 0.9;
  let face = Object.assign({}, FACES.calm, { lookX: 0.7, lookY: -0.2 });
  if (t > c.whirl - 0.05) face = Object.assign({}, FACES.startled, { lookX: 0.8, lookY: -0.3, mouth: 'o', mouthOpen: 0.55 });
  gpHero(cam, t, { x: x0, y: y0, s, pose: gpFloatPose(t), face, headDX: 10 * Math.sin(t * 40) * dbl,
    armR: { e: [x0 + 120, y0 - 330 * s], w: [x0 + 175, y0 - 445 * s] }, handR: 'open',
    watch: { side: 'R', r: 30, ang: -0.6, o: { time: 3600 * 2 + 40 * t, rim: '#5A5F70' } }, helmet: true });
  return { glow: 0.9 };
};

// ================================================================ GRAVITY: gravity slows clocks down (WIDE, high angle)
SC.gravity = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 540, y: lerp(900, 1010, E.inOutSine(clamp(lt / D))), zoom: lerp(1.0, 1.07, clamp(lt / D)) };
  gpStars(0, cam.y * 2);
  applyCam(cam);
  const EX = 540, EY = 2210, R = 1060;
  gpGravRings(ctx, EX, EY, R, t, ramp(t, shot.start, shot.start + 0.35), { reach: 980 });
  gpEarth(ctx, EX, EY, R, t, { rot: 0.012 * t + 0.3, sunA: -2.0, night: 0.6, lights: 0.5 });
  // three clocks at three heights: low (slow, heavy), middle, high (the satellite: fast)
  const tSlow = 36000 + 4 * (t - shot.start), tMid = 36000 + 9 * (t - shot.start), tFast = 36000 + 22 * (t - shot.start);
  const low = [310, 1062], mid = [560, 800];
  gpClock(ctx, low[0], low[1], 62, { time: tSlow, droop: 0.35 * ramp(t, c.slows, c.slows + 0.4), sweat: popK(t, c.slows + 0.1, shot.end + 1, 0.2, 0.1) });
  gpClock(ctx, mid[0], mid[1], 58, { time: tMid });
  gpSat(ctx, 790, 540, 0.42, t, { time: tFast, whirl: 0.25 });
  // labels pop on the beat: SLOW by the low one, FAST by the high one
  gpTag('SLOW', ...toScreen(cam, low[0], low[1] - 115), '#FF5A6E', popK(t, c.slows - 0.05, shot.end + 1, 0.12, 0.1), 40, -0.05);
  gpTag('FAST', ...toScreen(cam, 790, 540 + 125), '#4DFFB4', popK(t, c.down - 0.05, shot.end + 1, 0.12, 0.1), 40, 0.05);
  return { glow: 0.9 };
};

// ================================================================ DRAG: yours, down here? Dragging. (ECU: his wrist)
SC.drag = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  gpLakeBack(t, { hz: 1000, dx: 120, ms: 0.9 });
  screenSpace();
  ctx.fillStyle = 'rgba(14,16,40,0.38)'; ctx.fillRect(0, 0, W, H);           // out of focus behind: darker, soft bokeh
  for (let i = 0; i < 9; i++) softDot(ctx, 120 + i * 120, 1500 + 80 * Math.sin(i * 2.3), 70 + 20 * (i % 3), i % 2 ? '#FFB060' : '#7FB8FF', 0.16);
  const cam = { x: 540, y: 960, zoom: 1 + 0.04 * clamp(lt / D) };
  applyCam(cam);
  // the forearm from the bottom left, the wrist at the watch, the fist beyond it
  const wx = 560, wy = 930;
  const ex = -120, ey = 1720;
  line(ctx, ex, ey, wx, wy, 210, PAL.coat);                                 // his sleeve
  line(ctx, ex + 380, ey - 470, wx - 30, wy + 40, 196, PAL.skin);          // the bare wrist out of the cuff
  line(ctx, 260 - 0.76 * 112, 1250 - 0.65 * 112, 260 + 0.76 * 112, 1250 + 0.65 * 112, 70, PAL.coatSh);   // the sleeve's cuff
  line(ctx, wx - 30, wy + 40, wx + 420, wy - 560, 186, PAL.skin);          // the forearm goes on up to the hand, out of frame
  // gravity: a heavy blue drizzle of light, thicker low down
  for (let i = 0; i < 40; i++) {
    const gx = (i * 137) % W, sp = 260 + (i % 5) * 60, yy = ((t * sp + i * 211) % 1500) + 300;
    const a = 0.12 + 0.25 * clamp((yy - 300) / 1300);
    line(ctx, gx, yy, gx, yy + 60, 4, rgba('#7FA8FF', a)); line(gctx, gx, yy, gx, yy + 60, 6, rgba('#4F7BFF', a));
  }
  // the watch: its second hand trudges, then every hand droops on "Dragging."
  const droop = snapRamp(t, c.droop, c.droop + 0.45, { over: 1.6 });
  const crawl = 36000 + 0.8 * (t - shot.start) + 0.6 * Math.sin(t * 3);
  gpWatch(ctx, wx, wy, 200, 0.68, { time: crawl, droop: Math.max(0, droop), sweat: popK(t, c.droop, shot.end + 1, 0.15, 0.1), strap: '#3B2A22' });
  // his other hand comes in from the right and taps the glass twice
  const tap = popK(t, c.tap - 0.1, c.tap + 0.55, 0.12, 0.15);
  if (tap > 0.01) {
    const bump = 18 * Math.max(0, Math.sin((t - c.tap) * 22)) * clamp((c.tap + 0.45 - t) / 0.45);
    const fx = lerp(1250, 760, E.outCubic(tap)) - bump, fy = 770;
    line(ctx, fx + 420, fy + 120, fx + 120, fy + 40, 150, PAL.coat);
    ellipse(ctx, fx + 90, fy + 30, 92, 70, PAL.skin);
    line(ctx, fx + 40, fy + 10, fx - 70, fy - 10, 40, PAL.skin);          // the pointing finger
    circle(ctx, fx - 72, fy - 10, 20, PAL.skin);
  }
  return { glow: 0.85, focus: [wx, wy] };
};

// ================================================================ GAIN: satellite clocks gain 38 millionths of a second a day
SC.gain = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 540, y: 980, zoom: 1.0 + 0.06 * clamp(lt / D) };
  gpStars(cam.x * 0.3, 0);
  applyCam(cam);
  // the days: from "every day" the sunlight swings round three times and the counter rolls
  const days = clamp((t - c.days) / (shot.end - 0.15 - c.days)) * 3;
  const sunA = -2.3 + days * Math.PI * 2;
  gpEarth(ctx, 540, 2780, 1280, t, { rot: 0.012 * t + 0.6 + days * 0.25, sunA, night: 0.8, lights: 0.7 });
  const sClock = 36000 + 12 * (t - shot.start);
  gpSat(ctx, 640, 930, 0.7, t, { time: sClock + days * 0.6, tilt: 0.05 * Math.sin(t * 0.7) });
  // him floating at the left with his watch up, squinting at the difference
  const bob = 10 * Math.sin(t * 1.3 + 1);
  const x0 = 210, y0 = 1480 + bob, s = 0.78;
  gpHero(cam, t, { x: x0, y: y0, s, pose: gpFloatPose(t, 1.3), face: Object.assign({}, FACES.confused, { lookX: 0.8, lookY: -0.5 }),
    armR: { e: [x0 + 110, y0 - 300 * s], w: [x0 + 160, y0 - 410 * s] }, handR: 'open',
    watch: { side: 'R', r: 28, ang: -0.6, o: { time: sClock } }, helmet: true });
  // the counter: +0.000038 s, then DAY 1, 2, 3
  const d = Math.min(3, Math.floor(days) + 1);
  const txt = t < c.days ? '+0.000038 s' : `+0.${String(38 * d).padStart(6, '0')} s`;
  gpCounter(540, 610, popK(t, c.count - 0.05, shot.end + 1, 0.14, 0.1), t < c.days ? 0 : d, txt);
  return { glow: 0.9 };
};

// ================================================================ PAYOFF: sounds tiny? 10 km of error. A DAY. -> splash
SC.payoff = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 540, y: 960, zoom: 1.0 + 0.03 * clamp(lt / D) };
  const flash = 0;
  gpLakeBack(t, { hz: 1330, dx: 40, ms: 1.0, satX: 850, satY: 300, satFlash: flash });
  applyCam(cam);
  gpShore(ctx, -300, 200, 1440, t, { sign: [96, 1452] });
  const JY = 1430, J0 = 150, J1 = 700;
  gpJetty(ctx, J0, J1, JY, t, { lanternX: J0 + 70 });
  // him: the shrug, then he walks the jetty following his phone, steps off the end and drops in
  const walkK = ramp(t, c.thats, c.step, (x) => x);
  const fallK = ramp(t, c.step, c.splash, E.inQuad);
  const under = t >= c.splash;
  let x = lerp(290, 650, walkK), y = JY - 16;
  const s = 0.85;
  if (t > c.step) { x = 650 + 80 * fallK; y = JY - 16 + 300 * fallK; }
  if (!under) {
    let pose, face;
    const shrug = popK(t, c.shrug, c.thats - 0.05, 0.18, 0.2);
    if (t < c.thats) {
      pose = lerpPose(POSES.stand, POSES.zap, 0.0);
      pose.armL = { a: lerp(0.2, 1.2, shrug), b: lerp(0.12, -1.6, shrug) };
      pose.armR = { a: lerp(0.2, 1.2, shrug), b: lerp(0.12, -1.6, shrug) };
      pose.hand = 'open';
      face = Object.assign({}, FACES.grin, { lookX: 0, lookY: 0 });
    } else if (t < c.step) {
      pose = walkPlanted(t * 1.15, { speed: 9 });
      face = Object.assign({}, FACES.grin, { lookX: 0.3, lookY: 0.85 });
    } else {
      pose = lerpPose(POSES.stand, POSES.fall, ramp(t, c.step, c.step + 0.2));
      face = FACES.shock;
    }
    const phoneOn = t >= c.thats - 0.1;
    const o = { x, y, s, pose, face, lean: t > c.step ? 0.35 * fallK : 0 };
    if (phoneOn && t < c.step) {
      o.armR = { e: [x + 95 * s, y - 300 * s], w: [x + 42 * s, y - 352 * s] };
      o.phone = { x: x + 34 * s, y: y - 395 * s, h: 72 * s, map: { dot: [0.34, 0.52], drift: ramp(t, c.drift, c.error_end, (u) => u), pulse: t } };
    }
    gpHero(cam, t, o);
    if (shrug > 0.3) bigWord('?', x + 120, y - 560 * s, 110, '#FFD447', shrug, 0.12);
  } else {
    // under: only his arm out of the water, the phone held high (the gag), rings spreading
    const u = t - c.splash, rise = ramp(u, 0.2, 0.42, E.outBack);
    const ax = 735, ay = JY + 150;
    for (let i = 0; i < 3; i++) {
      const rr = 40 + (u * 260 + i * 70) % 260;
      ctx.save(); ctx.lineWidth = 5; ctx.strokeStyle = rgba('#DDF2FF', 0.6 * (1 - rr / 300)); ctx.beginPath(); ctx.ellipse(ax, ay, rr, rr * 0.22, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    ellipse(ctx, ax, ay + 4, 60, 12, rgba('#2A2F66', 0.9));
  }
  // the splash
  if (t >= c.splash - 0.02) {
    const sp = toScreen(cam, 735, JY + 150);
    splashDrops(sp[0], sp[1], c.splash, t, 46, 7, 0.9);
    const k = popK(t, c.splash, c.splash + 0.7, 0.05, 0.4);
    if (k > 0.01) {
      applyCam(cam);
      const u = clamp((t - c.splash) / 0.7), hgt = 170 * Math.sin(Math.PI * Math.min(1, u * 1.9)), wd = 60 + 110 * u;
      ctx.beginPath(); ctx.moveTo(735 - wd, JY + 150);
      for (let i = 0; i <= 10; i++) {
        const xx = 735 - wd + (2 * wd * i) / 10, tip = i % 2 ? 1 : 0.55;
        ctx.lineTo(xx, JY + 150 - hgt * tip * (1 - 0.6 * Math.abs(i - 5) / 5));
      }
      ctx.lineTo(735 + wd, JY + 150); ctx.closePath(); ctx.fillStyle = rgba('#DFF4FF', 0.92 * k); ctx.fill();
      ellipse(ctx, 735, JY + 150, wd * 1.1, 22, rgba('#FFFFFF', 0.8 * k));
      softDot(gctx, 735, JY + 60, 120, '#BFE6FF', 0.25 * k * (1 - u));
    }
  }
  // his arm out of the water, the phone held high and dry (the gag): on top of the splash
  if (under) {
    applyCam(cam);
    const u = t - c.splash, rise = ramp(u, 0.2, 0.42, E.outBack), ax = 735, ay = JY + 150;
    if (rise > 0.01) {
      const top = ay - 250 * rise, wv = 0.06 * Math.sin(u * 9);
      line(ctx, ax, ay, ax + 6, top + 50, 60, PAL.coat);
      line(ctx, ax + 6, top + 60, ax + 8, top, 52, PAL.skin);
      gpPhone(ctx, ax + 12, top - 66, 130, t, { dot: [0.34, 0.52], drift: 1, err: 1, pulse: t, rot: wv });
      gpGrip(ctx, ax + 12, top - 66, 130, wv);
      ellipse(ctx, ax + 3, ay, 46, 10, rgba('#DDF2FF', 0.7));
    }
  }
  // the map, big: the blue dot slides off over the lake, 10 KM
  const mk = popK(t, c.map, c.step - 0.05, 0.16, 0.14);
  if (mk > 0.01) {
    screenSpace();
    ctx.save(); ctx.translate(540, 700); const sc = E.outBack(mk); ctx.scale(sc, sc); ctx.rotate(-0.03);
    rrect(ctx, -200, -220, 400, 440, 40); ctx.fillStyle = '#1C1F2B'; ctx.fill();
    paint(() => gpMapFace(ctx, -184, -204, 368, 408, t, { dot: [0.34, 0.6], drift: ramp(t, c.drift, c.error_end, (u) => u), err: ramp(t, c.km - 0.1, c.km + 0.3), pulse: t }));
    ctx.restore();
    gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); rrect(gctx, 320, 460, 440, 480, 50); gctx.fillStyle = '#000'; gctx.fill(); gctx.restore();
  }
  return { glow: 0.85 };
};

// ================================================================ WEIRD: 1977, the fix OFF, in case Einstein was wrong
const GP_OLD = { x: 640, y: 1020, s: 0.8 };
SC.weird = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const push = E.inOutCubic(ramp(t, c.fix - 0.2, c.off_end, (x) => x));
  const cam = { x: lerp(540, 600, push), y: lerp(980, 1010, push), zoom: lerp(1.0, 1.32, push) + 0.02 * clamp(lt / D) };
  gpStars(cam.x, cam.y);
  applyCam(cam);
  gpEarth(ctx, 540, 2560, 1820, t, { rot: 0.01 * t + 0.9, sunA: 1.45, night: 0.95, lights: 1 });
  gpOldSat(ctx, GP_OLD.x, GP_OLD.y, GP_OLD.s, t, { on: 0, lamp: 0, note: ramp(t, c.note, c.note + 0.3, (x) => x) });
  // the red lamp blinks on "OFF"
  const blink = popK(t, c.off - 0.02, c.off_end + 0.3, 0.04, 0.2) * (0.5 + 0.5 * Math.sin((t - c.off) * 18));
  softDot(gctx, GP_OLD.x - 40 * GP_OLD.s, GP_OLD.y + 30 * GP_OLD.s, 120 * blink, '#FF3B3B', 0.9 * blink);
  // him beside it, still dripping from the lake, drops floating in his helmet; one eyebrow up at "was wrong"
  const bob = 10 * Math.sin(t * 1.2);
  const x0 = 330, y0 = 1450 + bob, s = 0.72;
  const brow = ramp(t, c.brow, c.brow + 0.25);
  const face = Object.assign({}, FACES.annoyed, { lookX: 0.8, lookY: -0.3, browY: 0.2 + 0.9 * brow, browTilt: -0.4 - 0.5 * brow, blink: 0.2 });
  gpHero(cam, t, { x: x0, y: y0, s, pose: gpFloatPose(t, 2.2), face, pal: GPWET, helmet: true, drops: true, drips: 0.8 });
  gpTag('1977', 540, 560, '#FFD447', popK(t, c.tag77, shot.end + 1, 0.12, 0.1), 54, -0.04);
  return { glow: 0.9, vhs: 0.18 };
};

// ================================================================ BUTTON: He wasn't. (CU: he flips it ON)
SC.button = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 600, y: 1000, zoom: 1.9 + 0.04 * clamp(lt / D) };
  gpStars(cam.x * 2, cam.y);
  applyCam(cam);
  gpEarth(ctx, 540, 2560, 1820, t, { rot: 0.01 * t + 0.9, sunA: 1.45, night: 0.95, lights: 1 });
  const on = snapRamp(t, c.flip, c.flip + 0.16, { over: 1.4 });
  gpOldSat(ctx, GP_OLD.x, GP_OLD.y, GP_OLD.s, t, { on: clamp(on), lamp: on > 0.5 ? 1 : 0, note: 1 });
  if (on > 0.5) softDot(gctx, GP_OLD.x - 40 * GP_OLD.s, GP_OLD.y + 30 * GP_OLD.s, 150, '#3DFF8A', 0.8 * popK(t, c.flip + 0.1, shot.end + 1, 0.05, 0.1));
  // him, close, his finger on the lever: up it goes on "wasn't"; a smug grin
  const x0 = 450, y0 = 1330, s = 0.72;
  const lever = [GP_OLD.x + 40 * GP_OLD.s, GP_OLD.y + 8 * GP_OLD.s];
  const ang = lerp(0.95, -0.95, clamp(on));
  const tip = [lever[0] + Math.sin(ang) * 80 * GP_OLD.s, lever[1] - Math.cos(ang) * 80 * GP_OLD.s];
  const face = t > c.flip ? Object.assign({}, FACES.grin, { lookX: -0.2, lookY: 0.05, eyeOpen: 0.85 }) : Object.assign({}, FACES.calm, { lookX: 0.8, lookY: 0.2 });
  gpHero(cam, t, { x: x0, y: y0, s, pose: gpFloatPose(t, 2.2), face, pal: GPWET, helmet: true, drops: true,
    armR: { e: [x0 + 150, y0 - 250 * s], w: [tip[0] - 26, tip[1] + 30] }, handR: 'open' });
  return { glow: 0.9 };
};

// ================================================================ the cover (outside the timeline: src/cover.sh)
SC.cover = (lt, t, shot) => {
  const c = cu();
  // the hook's picture at the poof: white wild hair, the beam up to the satellite, the map phone; the words above
  const tt = c.poof + 0.3;
  gpHookDraw(tt);
  screenSpace();
  rrect(gctx, 520, 430, 560, 330, 40); gctx.fillStyle = 'rgba(0,0,0,1)'; gctx.fill();
  bigWord('NEEDS', 760, 520, 120, '#FFFFFF', 1, 0.04);
  bigWord('EINSTEIN?', 690, 660, 140, '#FFD447', 1, 0.04);
  return { glow: 0.85, noCaptions: true };
};

function initScenes2() {
  gpWorldInit();
}
