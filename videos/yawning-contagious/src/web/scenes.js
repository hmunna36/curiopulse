// Why Is Yawning CONTAGIOUS? Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;
// a yawn envelope: opens from t0 over `rise`, holds, closes over `fall`, done at t1
function yawnEnv(t, t0, t1, rise = 0.35, fall = 0.35) {
  return Math.min(ramp(t, t0, t0 + rise, E.outCubic), 1 - ramp(t, t1 - fall, t1, E.inOutSine));
}
// bus sway: the whole camera rocks a little (it's a moving bus)
function sway(cam, t, amt = 1) {
  const [sx, sy] = shake(t, 3 * amt, 1.6, 4);
  return Object.assign({}, cam, { rot: 0.0045 * amt * Math.sin(t * 1.25), sx: sx, sy: sy + 4 * amt * Math.sin(t * 7.3) * 0.3 });
}
// the bench line-up (world x): gran, commuter, teen (the "stranger"), the hero, the nurse
const SEAT = { gran: BUS.xs[0], suit: BUS.xs[1], teen: BUS.xs[2], hero: BUS.xs[3], nurse: BUS.xs[4] };

// the hook's yawns, shared with the react shot (the teen's yawn tails off there)
function hookYawns(t) {
  const c = cu();
  return {
    gran: yawnEnv(t, -0.25, c.yawn1_end + 0.25, 0.45, 0.4),
    suit: yawnEnv(t, c.next1 - 0.05, c.next1 + 1.15, 0.35, 0.35),
    teen: yawnEnv(t, c.next2 - 0.05, c.next2 + 1.2, 0.35, 0.4),
    hero: yawnEnv(t, c.yawning + 0.05, c.you_end - 0.05, 0.4, 0.3),
  };
}

// ---------------------------------------------------------------- 1. hook: the yawn hops along the bench
SC.hook = (lt, t, shot) => {
  const c = cu(), y = hookYawns(t), D = shot.end - shot.start;
  const cam0 = camKeys(t, [
    [0, SEAT.gran + 40, 1050, 1.6], [c.yawn1_end - 0.25, SEAT.gran + 60, 1050, 1.58],
    [c.next1 + 0.25, SEAT.suit + 30, 1050, 1.55], [c.next2 - 0.45, SEAT.suit + 70, 1050, 1.55],
    [c.next2 + 0.3, SEAT.teen + 40, 1050, 1.52], [c.andthen - 0.25, SEAT.teen + 120, 1050, 1.5],
    [c.andthen + 0.35, SEAT.hero, 1040, 1.6], [c.you, SEAT.hero, 1020, 1.78], [D, SEAT.hero, 1000, 2.05],
  ]);
  const cam = sway(cam0, t);
  busInterior(cam, t, { x0: cam0.x - 900 / cam0.zoom, x1: cam0.x + 900 / cam0.zoom });
  // passengers
  drawPassenger(ctx, PASS.gran, { x: SEAT.gran, y: BUS.seatY, s: 1, yawn: y.gran, stretch: 0.7 * y.gran, lookX: 0.4, blink: 0 }, t);
  const suitLook = t < c.next1 ? -1 : 0;
  drawPassenger(ctx, PASS.suit, { x: SEAT.suit, y: BUS.seatY, s: 1, yawn: y.suit, stretch: y.suit, lookX: suitLook, brow: ramp(t, c.next1 - 0.5, c.next1 - 0.2) * (1 - y.suit) }, t);
  drawPassenger(ctx, PASS.teen, { x: SEAT.teen, y: BUS.seatY, s: 1, yawn: y.teen, stretch: 0.85 * y.teen, lookX: t < c.next2 ? -1 : 0.6, tilt: -0.05 }, t);
  // the hero: watches the chain coming (dread), fights it, loses
  const fight = ramp(t, c.andthen - 0.2, c.andthen + 0.15) * (1 - ramp(t, c.yawning - 0.05, c.yawning + 0.15));
  let face = lerpFace(FACES.calm, FACES.nervous, ramp(t, c.next2 + 0.2, c.next2 + 0.6));
  face = lerpFace(face, Object.assign({}, FACES.drowsy, { blink: 0.55, mouth: 'flat', mouthOpen: 0.2 }), ramp(t, c.you_end - 0.35, c.you_end - 0.05));
  face.lookX = lerp(0.15, -1, ramp(t, c.next1, c.next1 + 0.4)) * (1 - fight);
  if (fight > 0) face = lerpFace(face, Object.assign({}, FACES.nervous, { mouth: 'flat', mouthOpen: 0, eyeOpen: 1.35, browY: 1.3, lookX: 0 }), fight);
  face = lerpFace(face, FACES.yawn, y.hero);
  face.tear = ramp(t, c.you_end - 0.3, c.you_end + 0.3);
  const heroSt = { x: SEAT.hero, y: BUS.seatY, s: 1, face, stretch: 0.9 * y.hero, headRot: -0.04 * y.hero + 0.03 * Math.sin(t * 9) * fight };
  heroOnBench(ctx, heroSt, t);
  drawPassenger(ctx, PASS.nurse, { x: SEAT.nurse, y: BUS.seatY, s: 1, sleep: 1, tilt: 0.1 }, t);
  // the wisp hops: gran -> commuter -> teen -> hero
  const gm = passMouth({ x: SEAT.gran, y: BUS.seatY, yawn: y.gran }), se = passEyes({ x: SEAT.suit, y: BUS.seatY });
  const sm = passMouth({ x: SEAT.suit, y: BUS.seatY, yawn: y.suit }), te = passEyes({ x: SEAT.teen, y: BUS.seatY });
  const tm = passMouth({ x: SEAT.teen, y: BUS.seatY, yawn: y.teen }), he = [SEAT.hero, BUS.seatY - 250];
  yawnWisp(gm, se, ramp(t, c.yawn1 + 0.2, c.next1 - 0.02, E.inOutSine), t, 1 - ramp(t, c.next1, c.next1 + 0.25));
  yawnWisp(sm, te, ramp(t, c.next1 + 0.55, c.next2 - 0.02, E.inOutSine), t, 1 - ramp(t, c.next2, c.next2 + 0.25));
  yawnWisp(tm, he, ramp(t, c.next2 + 0.55, c.andthen + 0.45, E.inOutSine), t, 1 - ramp(t, c.yawning - 0.1, c.yawning + 0.2), 160);
  // the wisp circles his head while he fights it
  if (t > c.andthen + 0.4 && t < c.yawning + 0.2) {
    const a = (t - c.andthen) * 7, r = 120, oy = he[1] - 70;
    const p = [he[0] + Math.cos(a) * r, oy + Math.sin(a) * r * 0.35];
    softDot(gctx, p[0], p[1], 34, '#B9A0FF', 0.6); circle(ctx, p[0], p[1], 9, '#FFFFFF');
    for (let i = 1; i < 10; i++) { const b = a - i * 0.18; circle(ctx, he[0] + Math.cos(b) * r, oy + Math.sin(b) * r * 0.35, 7 - i * 0.6, rgba('#D9C8FF', 0.8 - i * 0.08)); }
  }
  if (fight > 0.1) sweatDrop(ctx, SEAT.hero + 58, BUS.seatY - 300, 1.1, fight);
  // the big yawn: little shock lines on the stretch
  if (t > c.you) shockLines(...toScreen(cam, SEAT.hero, BUS.seatY - 250), 210, inv(c.you, c.you + 0.55, t), 12, '#E9DDFF', 3);
  busStraps(cam, t, cam0.x - 900 / cam0.zoom, cam0.x + 900 / cam0.zoom);
  busSweep(t, 1);
  motes(t, 0.5);
  return { glow: 0.85, zblur: 0.05 * (1 - ramp(t, c.you, c.you + 0.3)) * ramp(t, c.you - 0.1, c.you) };
};

// ---------------------------------------------------------------- 2. react: "Thanks, stranger."
SC.react = (lt, t, shot) => {
  const c = cu(), y = hookYawns(t);
  const cx = (SEAT.teen + SEAT.hero) / 2;
  const cam = sway({ x: cx + 15, y: 1060, zoom: 1.58 + 0.07 * ramp(lt, 0, 1.7, E.inOutSine), rot: 0 }, t, 0.6);
  busInterior(cam, t, { x0: cx - 600, x1: cx + 600 });
  // the stranger: still finishing his yawn, catches the stare, sheepish grin, looks away
  const caught = ramp(t, c.thanks - 0.1, c.thanks + 0.15);
  drawPassenger(ctx, PASS.teen, { x: SEAT.teen, y: BUS.seatY, s: 1, yawn: y.teen * 0.0, stretch: 0, lookX: lerp(1, -0.6, ramp(t, c.stranger + 0.2, c.stranger + 0.4)),
    lookY: lerp(0, -1, ramp(t, c.stranger + 0.2, c.stranger + 0.4)), smile: lerp(0.2, 0.9, caught), tilt: -0.08 * caught, brow: caught }, t);
  // the hero: dead stare, a yawn tear on his cheek
  const face = Object.assign({}, FACES.annoyed, { lookX: -1, lookY: 0, blink: 0.5, tear: 0.8 + 0.2 * ramp(lt, 0, 1.6) });
  heroOnBench(ctx, { x: SEAT.hero, y: BUS.seatY, s: 1, face, headRot: -0.06, stretch: 0 }, t);
  busStraps(cam, t, cx - 600, cx + 600);
  busSweep(t, 0.7);
  return { glow: 0.7 };
};

// ---------------------------------------------------------------- 3. name: CONTAGIOUS YAWNING, then "about half"
function nightStreet(t, camX = 540, k = 1) {
  screenSpace();
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#060A22'); g.addColorStop(0.5, '#141C46'); g.addColorStop(1, '#0A0C18');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // skyline (far, slow)
  const off = (t * 40 + camX * 0.2) % 1200;
  for (let i = -1; i < 3; i++) ctx.drawImage(BUS_SKY, 0, 0, 2400, 460, -off + i * 1200, 560, 1200, 560);
  // moon + stars
  softDot(ctx, 820, 470, 120, '#BFD8FF', 0.25); circle(ctx, 820, 470, 46, '#EAF2FF'); softDot(gctx, 820, 470, 120, '#BFD8FF', 0.6);
  // sidewalk + road
  ctx.fillStyle = '#1A1D2C'; ctx.fillRect(0, 1120, W, 60);
  const rd = ctx.createLinearGradient(0, 1180, 0, H); rd.addColorStop(0, '#202434'); rd.addColorStop(1, '#07080E');
  ctx.fillStyle = rd; ctx.fillRect(0, 1180, W, H - 1180);
  const lo = (t * 520) % 260;
  for (let x = -260; x < W + 260; x += 260) { rrect(ctx, x - lo, 1420, 140, 16, 8); ctx.fillStyle = 'rgba(255,212,71,0.55)'; ctx.fill(); }
  // street lamps (near, fast)
  for (let i = 0; i < 3; i++) {
    const lx = ((i * 420 - t * 380) % 1260 + 1260) % 1260 - 100;
    ctx.fillStyle = '#0A0C16'; ctx.fillRect(lx - 9, 620, 18, 520);
    line(ctx, lx, 630, lx + 60, 610, 10, '#0A0C16');
    ellipse(ctx, lx + 66, 616, 26, 11, '#FFE7B0'); softDot(gctx, lx + 66, 620, 160, '#FFC870', 0.8);
    const cone = ctx.createRadialGradient(lx + 66, 620, 10, lx + 66, 1100, 420);
    cone.addColorStop(0, 'rgba(255,200,120,0.18)'); cone.addColorStop(1, 'rgba(255,200,120,0)');
    ctx.fillStyle = cone; ctx.beginPath(); ctx.moveTo(lx + 66, 620); ctx.lineTo(lx - 140, 1180); ctx.lineTo(lx + 270, 1180); ctx.closePath(); ctx.fill();
  }
}
function miniFace(x, y, r, look, yk, t) {
  const c = ctx;
  circle(c, x, y + r * 0.05, r * 1.06, 'rgba(0,0,0,0.35)');
  const jd = r * 0.35 * yk;
  c.beginPath(); c.ellipse(x, y, r, r, 0, Math.PI, Math.PI * 2); c.ellipse(x, y, r, r + jd, 0, 0, Math.PI);
  const g = c.createRadialGradient(x - r * 0.3, y - r * 0.4, 2, x, y, r * 1.3);
  g.addColorStop(0, mixHex(look.skin, '#FFFFFF', 0.3)); g.addColorStop(1, look.skinSh);
  c.fillStyle = g; c.fill();
  c.beginPath(); c.ellipse(x, y - r * 0.45, r * 0.98, r * 0.6, 0, Math.PI, Math.PI * 2); c.fillStyle = look.hair; c.fill();
  for (const sd of [-1, 1]) {
    const ex = x + sd * r * 0.36, ey = y - r * 0.05;
    if (yk > 0.3) { c.beginPath(); c.moveTo(ex - sd * r * 0.16, ey - r * 0.1); c.lineTo(ex + sd * r * 0.1, ey); c.lineTo(ex - sd * r * 0.16, ey + r * 0.1); c.lineWidth = r * 0.07; c.strokeStyle = '#3A1E16'; c.lineCap = 'round'; c.stroke(); }
    else { ellipse(c, ex, ey, r * 0.15, r * 0.18, '#FFFFFF'); circle(c, ex, ey + r * 0.02, r * 0.09, '#15132A'); }
  }
  if (yk > 0.05) { ellipse(c, x, y + r * 0.42 + jd * 0.5, r * (0.18 + 0.14 * yk), r * (0.06 + 0.36 * yk), '#5A1522'); }
  else { c.beginPath(); c.moveTo(x - r * 0.22, y + r * 0.42); c.quadraticCurveTo(x, y + r * 0.52, x + r * 0.22, y + r * 0.42); c.lineWidth = r * 0.07; c.strokeStyle = '#5A1522'; c.stroke(); }
}
const GRID_LOOKS = [PASS.gran, PASS.suit, PASS.teen, PASS.nurse, PAL_FACE(), PASS.suit, PASS.nurse, PASS.gran, PAL_FACE(), PASS.teen];
function PAL_FACE() { return { skin: PAL.skin, skinSh: PAL.skinSh, hair: PAL.hair }; }
SC.name = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const panX = lerp(0, 60, lt / D);
  nightStreet(t, panX);
  // the bus rolls through, its windows yawning in a ripple (back to front)
  const bx = lerp(340, 700, E.inOutSine(clamp(lt / (D + 1.5))));
  const yk = [0, 1, 2, 3, 4].map((i) => yawnEnv(t, c.thats - 0.1 + i * 0.32, c.thats + 0.9 + i * 0.32, 0.25, 0.3));
  busExterior(bx, 1190 + 4 * Math.sin(t * 9), t, yk, 0.86);
  // the title, then the face grid
  const gridIn = ramp(t, c.about - 0.25, c.about + 0.05, E.outCubic);
  const tOut = 1 - gridIn;
  bigWord('CONTAGIOUS', 540, 560 - 80 * gridIn, 158, '#FFD447', E.outBack(ramp(t, c.contagious - 0.05, c.contagious + 0.25, (x) => x)) * tOut, -0.04);
  bigWord('YAWNING', 540, 730 - 80 * gridIn, 196, '#FFFFFF', E.outBack(ramp(t, c.yawning_w - 0.05, c.yawning_w + 0.25, (x) => x)) * tOut, 0.03);
  if (gridIn > 0.01) {
    screenSpace();
    ctx.fillStyle = `rgba(4,6,18,${0.84 * gridIn})`; ctx.fillRect(0, 0, W, H);
    const pk = E.outBack(ramp(t, c.half - 0.1, c.half + 0.25, (x) => x));
    bigWord('50%', 540, 500, 190, '#4DFFB4', pk, -0.03);
    for (let i = 0; i < 10; i++) {
      const col = i % 5, row = Math.floor(i / 5), x = 210 + col * 165, y = 715 + row * 190;
      const pop = E.outBack(ramp(t, c.about - 0.2 + i * 0.035, c.about + 0.15 + i * 0.035, (x) => x));
      if (pop <= 0.01) continue;
      const yawner = [0, 2, 3, 6, 9].includes(i);
      const order = [0, 2, 3, 6, 9].indexOf(i);
      const yk2 = yawner ? yawnEnv(t, c.half + 0.05 + order * 0.13, c.half + 2.6 + order * 0.13, 0.25, 0.4) : 0;
      ctx.save(); ctx.translate(x, y); ctx.scale(pop, pop); ctx.translate(-x, -y);
      if (yk2 > 0.3) { circle(ctx, x, y, 84, rgba('#4DFFB4', 0.22 * yk2)); softDot(gctx, x, y, 100, '#4DFFB4', 0.35 * yk2); }
      miniFace(x, y, 72, GRID_LOOKS[i], yk2, t);
      ctx.restore();
    }
  }
  motes(t, 0.4);
  return { glow: 0.8, noCaptions: t < c.about - 0.05, push: { k: 1 + 0.04 * lt / D, cx: 540, cy: 760 } };
};

// ---------------------------------------------------------------- 4. why: the sigh, the shrug, UNSOLVED
const POSE_SHRUG = Object.assign({}, POSES.stand, { armL: { a: 0.62, b: 1.55 }, armR: { a: 0.62, b: 1.55 }, hand: 'open' });
const POSE_SLUMP = Object.assign({}, POSES.stand, { armL: { a: 0.12, b: 0.05 }, armR: { a: 0.12, b: 0.05 }, hipY: -216 });
function stageBg(t, col1 = '#1B2A5A', col2 = '#05060F') {
  darkBg(col1, col2);
  screenSpace();
  // spotlight cone + pool
  const g = ctx.createRadialGradient(540, 1480, 20, 540, 1480, 420);
  g.addColorStop(0, 'rgba(255,240,200,0.28)'); g.addColorStop(1, 'rgba(255,240,200,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(540, 1500, 420, 90, 0, 0, Math.PI * 2); ctx.fill();
  const cone = ctx.createLinearGradient(0, 0, 0, 1500);
  cone.addColorStop(0, 'rgba(255,240,200,0.20)'); cone.addColorStop(1, 'rgba(255,240,200,0.03)');
  ctx.fillStyle = cone; ctx.beginPath(); ctx.moveTo(470, 0); ctx.lineTo(610, 0); ctx.lineTo(960, 1500); ctx.lineTo(120, 1500); ctx.closePath(); ctx.fill();
}
SC.why = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  stageBg(t);
  motes(t, 0.6);
  const cam = { x: 540, y: 1010, zoom: 1.22 + 0.1 * E.inOutSine(clamp(lt / D)), rot: 0 };
  applyCam(cam);
  const shrugK = ramp(t, c.honestly - 0.15, c.honestly + 0.2, E.outBack);
  const slump = ramp(t, c.sigh, c.sigh + 0.4) * (1 - ramp(t, c.why_w - 0.1, c.why_w + 0.1));
  let pose = lerpPose(POSES.stand, POSE_SLUMP, slump);
  pose = lerpPose(pose, POSE_SHRUG, clamp(shrugK));
  let face = lerpFace(FACES.calm, Object.assign({}, FACES.drowsy, { blink: 0.8 }), slump);
  face = lerpFace(face, FACES.confused, ramp(t, c.why_w - 0.1, c.why_w + 0.15));
  face = lerpFace(face, Object.assign({}, FACES.nervous, { mouth: 'grimace', lookX: 0, lookY: 0 }), ramp(t, c.nobody - 0.05, c.nobody + 0.2));
  const st = { x: 540, y: 1560, s: 1.18, pose, face, headRot: 0.1 * shrugK, headDY: 6 * slump };
  charLayer(cam, st, t, { ambient: 0.12 });
  // the sigh: a puff of breath
  const puff = ramp(t, c.sigh + 0.1, c.sigh + 0.8);
  if (puff > 0 && puff < 1) for (let i = 0; i < 4; i++) {
    const r = 18 + 30 * puff + i * 6;
    circle(ctx, 540 + 40 + 80 * puff + i * 18, 1560 - 545 * 1.18 + 50 + 30 * puff - i * 10, r, `rgba(220,235,255,${0.5 * (1 - puff)})`);
  }
  screenSpace();
  // ? marks
  bigWord('?', 540, 520, 260, '#FFD447', E.outBack(ramp(t, c.why_w - 0.05, c.why_w + 0.25, (x) => x)), 0.05 * Math.sin(t * 3));
  const qs = [[260, 700, -0.3], [830, 650, 0.25], [300, 960, 0.2]];
  qs.forEach(([x, y, r], i) => bigWord('?', x, y + 10 * Math.sin(t * 2 + i), 130, '#7FE9FF', E.outBack(ramp(t, c.honestly + 0.1 + i * 0.12, c.honestly + 0.35 + i * 0.12, (x) => x)) * 0.9, r));
  stamp('UNSOLVED', 540, 640, ramp(t, c.sure_end - 0.1, c.sure_end + 0.05), '#FF4D5E', -0.12, 118);
  return { glow: 0.7, flash: 0.25 * (1 - ramp(t, c.sure_end, c.sure_end + 0.15)) * ramp(t, c.sure_end - 0.05, c.sure_end) };
};

// ---------------------------------------------------------------- 5. cool: idea 1, the brain's air conditioner
function ideaTag(txt, k, col = '#7FE9FF', y = 450) {
  if (k <= 0.01) return;
  pill(540, y, txt, col, k, 46);
}
SC.cool = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#14204A', '#03050D');
  motes(t, 0.4);
  const s0 = shot.start;
  const cam = sectionCam(t, [[s0, 30, -60, 1.1, 880], [c.brain, 40, -110, 1.22, 900], [c.gulp - 0.1, 190, 110, 1.55, 830],
    [c.air + 0.3, 170, 100, 1.6, 840], [c.rush + 0.1, 60, -60, 1.22, 880], [c.blood_end + 0.4, 50, -90, 1.18, 880]]);
  const jaw = yawnEnv(t, c.gulp - 0.25, c.blood + 0.35, 0.45, 0.5);
  const warm = 1 - ramp(t, c.rush + 0.1, c.blood_end + 0.3, E.inOutSine);
  yawnHead(cam, t, { jaw, eyeShut: jaw, air: ramp(t, c.gulp - 0.05, c.gulp + 0.3) * (1 - ramp(t, c.blood, c.blood + 0.5)),
    rush: ramp(t, c.rush - 0.05, c.rush + 0.25) * (1 - ramp(t, c.blood_end + 0.3, c.blood_end + 0.6) * 0.5), warm, brainLit: ramp(t, c.brain - 0.1, c.brain + 0.2) * 0.6 });
  // labels
  if (t < c.cool - 0.05) ideaTag('IDEA #1', ramp(t, c.idea1 - 0.1, c.idea1 + 0.2), '#7FE9FF', 430);
  else ideaTag('IDEA #1: BRAIN COOLER?', ramp(t, c.cool - 0.05, c.cool + 0.2), '#7FE9FF', 430);
  const thermoA = ramp(t, c.yawns_cool - 0.1, c.yawns_cool + 0.2);
  thermoY(900, 560, 840, lerp(0.15, 0.92, warm), thermoA);
  if (t > c.gulp - 0.1 && t < c.rush) pill(540, 1150, 'COOL AIR IN', '#7FE9FF', ramp(t, c.gulp, c.gulp + 0.2), 44);
  if (t > c.rush - 0.1) pill(540, 1150, 'FRESH BLOOD UP', '#FF5A6E', ramp(t, c.rush, c.rush + 0.2), 44);
  if (t > c.blood_end) { snowflakes(t, 0.6 * ramp(t, c.blood_end, c.blood_end + 0.4)); }
  return { glow: 0.85, noCaptions: false };
};

// ---------------------------------------------------------------- 6. pack: the cold-pack study
function labBg(t) {
  darkBg('#173C5A', '#040C16');
  screenSpace();
  ctx.strokeStyle = 'rgba(127,233,255,0.06)'; ctx.lineWidth = 2;
  for (let x = 0; x <= W; x += 90) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y <= H; y += 90) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  ctx.fillStyle = '#0B1A28'; ctx.fillRect(0, 1420, W, H - 1420);
  line(ctx, 0, 1420, W, 1420, 6, 'rgba(127,233,255,0.25)');
}
function yawnLoop(t, per = 2.2) { const ph = (t % per) / per; return Math.min(ramp(ph, 0.05, 0.25), 1 - ramp(ph, 0.62, 0.8, E.inOutSine)); }
SC.pack = (lt, t, shot) => {
  const c = cu(), cut = c.caught - 0.1;
  if (t < cut) {
    labBg(t);
    const k = clamp((t - shot.start) / (cut - shot.start));
    const cam = { x: 575, y: 905, zoom: 1.32 + 0.1 * E.inOutSine(k), rot: 0 };
    applyCam(cam);
    labMonitor(196, 600, 300, 230, t, (cc, cx, cy, tt) => {
      const y = yawnLoop(tt - shot.start + 0.6);
      drawPassenger(cc, PASS.gran, { x: cx, y: cy + 150, s: 0.95, yawn: y, stretch: 0.5 * y }, tt);
    });
    // the hero: cold pack on, staring at the yawner ... and not catching it
    const strain = ramp(t, c.coldpack + 0.2, c.coldpack + 0.5) * (1 - ramp(t, c.forehead + 0.1, c.forehead + 0.4));
    let face = Object.assign({}, FACES.calm, { lookX: -1, lookY: 0 });
    face = lerpFace(face, Object.assign({}, FACES.nervous, { lookX: -1, mouth: 'flat', mouthOpen: 0, eyeOpen: 1.3 }), strain);
    face = lerpFace(face, Object.assign({}, FACES.grin, { lookX: -0.6 }), ramp(t, c.forehead + 0.15, c.forehead + 0.4));
    const st = { x: 735, y: 1420, s: 1.12, pose: POSES.stand, face, headRot: -0.05 };
    const r = charLayer(cam, st, t, { ambient: 0.05, post: (cc, rr, s2) => { cc.save(); cc.translate(s2.x, s2.y); cc.scale(s2.s, s2.s); coldPack(cc, rr, t, E.outBack(ramp(t, c.coldpack - 0.25, c.coldpack + 0.05, (x) => x))); cc.restore(); } });
    applyCam(cam);
    const hp = toWorld(st, [r.head[0], r.head[1] - 50]);
    coldMist(hp[0], hp[1], t, ramp(t, c.coldpack, c.coldpack + 0.3));
    screenSpace();
    const ph = toScreen(cam, hp[0], hp[1]);
    pill(ph[0] - 10, ph[1] - 200, 'COLD PACK', '#7FE9FF', ramp(t, c.coldpack - 0.05, c.coldpack + 0.2), 44);
    leader([ph[0] - 10, ph[1] - 160], [ph[0], ph[1] - 30], ramp(t, c.forehead - 0.1, c.forehead + 0.2), '#7FE9FF');
    if (strain > 0.2) sweatDrop(ctx, ph[0] + 80, ph[1] + 20, 1.1, strain);
    return { glow: 0.8 };
  }
  labBg(t);
  const k1 = ramp(t, c.caught - 0.05, c.caught + 0.55, E.outCubic), k2 = ramp(t, c.fewer - 0.05, c.fewer + 0.4, E.outCubic);
  packChart(t, k1, k2, ramp(t, cut, cut + 0.15));
  // a yawning face on the warm bar, a smug one on the cold bar
  screenSpace();
  const fy1 = 1040 - 0.41 * 960 * k1 + 100, fy2 = 1040 - 0.09 * 960 * k2 - 190;
  const CS = (x, y) => [540 + (x - 540) * 1.18, 760 + (y - 760) * 1.18];  // the chart is drawn scaled 1.18 about (540, 760)
  if (k1 > 0.4) { const p = CS(330, Math.min(940, fy1)); miniFace(p[0], p[1], 70 * E.outBack(ramp(t, c.caught + 0.3, c.caught + 0.55, (x) => x)), PAL_FACE(), yawnLoop(t, 1.6), t); }
  if (k2 > 0.5) { const ff = ramp(t, c.fewer + 0.3, c.fewer + 0.55, (x) => x), p = CS(750, fy2 - 150); miniFace(p[0], p[1], 70 * E.outBack(ff), PAL_FACE(), 0, t); }
  return { glow: 0.75, push: { k: 1 + 0.03 * ramp(t, cut, shot.end), cx: 540, cy: 800 }, flash: 0.35 * (1 - ramp(t, cut, cut + 0.12)) };
};

// ---------------------------------------------------------------- 7. social: we copy the faces around us
SC.social = (lt, t, shot) => {
  const c = cu();
  const cx = (SEAT.teen + SEAT.hero) / 2;
  const cam = sway({ x: cx + 15, y: 1050, zoom: 1.66 + 0.06 * ramp(lt, 0, shot.end - shot.start, E.inOutSine), rot: 0 }, t, 0.5);
  busInterior(cam, t, { x0: cx - 520, x1: cx + 520 });
  // the expressions, each one copied ~0.3 s later
  const beats = [c.social + 0.05, c.copy - 0.05, c.faces + 0.05, c.around + 0.15];
  const lag = 0.32;
  const ex = (tt) => { let i = -1; for (let k = 0; k < beats.length; k++) if (tt >= beats[k]) i = k; return i; };
  const ti = ex(t), hi = ex(t - lag);
  const teenSt = { x: SEAT.teen, y: BUS.seatY, s: 1, lookX: 1, tilt: 0.04 };
  if (ti === 0) Object.assign(teenSt, { smile: 1, brow: 0.6 });
  if (ti === 1) Object.assign(teenSt, { mouthO: 1, brow: 1.6 });
  if (ti === 2) Object.assign(teenSt, { smile: -1, brow: -0.6, tilt: -0.05 });
  if (ti === 3) Object.assign(teenSt, { yawn: yawnEnv(t, beats[3], beats[3] + 1.4, 0.3, 0.3), stretch: 0.5 * yawnEnv(t, beats[3], beats[3] + 1.4, 0.3, 0.3) });
  drawPassenger(ctx, PASS.teen, teenSt, t);
  let face = Object.assign({}, FACES.calm, { lookX: -1 });
  if (hi === 0) face = Object.assign({}, FACES.grin, { lookX: -1 });
  if (hi === 1) face = Object.assign({}, FACES.startled, { lookX: -1 });
  if (hi === 2) face = Object.assign({}, FACES.annoyed, { lookX: -1, lookY: 0, blink: 0.3, mouth: 'wavy' });
  let stretch = 0;
  if (hi === 3) { const yk = yawnEnv(t - lag, beats[3], beats[3] + 1.4, 0.3, 0.3); face = lerpFace(Object.assign({}, FACES.calm, { lookX: -1 }), FACES.yawn, yk); stretch = 0.6 * yk; }
  heroOnBench(ctx, { x: SEAT.hero, y: BUS.seatY, s: 1, face, headRot: -0.05, stretch }, t);
  busStraps(cam, t, cx - 520, cx + 520);
  // mirror beams: teen's face -> hero's face, flashing on every copy
  const A = [SEAT.teen + 40, BUS.seatY - 250], B = [SEAT.hero - 50, BUS.seatY - 250];
  for (let k = 0; k < beats.length; k++) {
    const f = ramp(t, beats[k] + 0.02, beats[k] + lag, E.inOutSine), fade = 1 - ramp(t, beats[k] + lag + 0.1, beats[k] + lag + 0.45);
    if (f <= 0 || fade <= 0) continue;
    for (let i = 0; i < 6; i++) {
      const u = clamp(f - i * 0.08); if (u <= 0) continue;
      const p = [lerp(A[0], B[0], u), lerp(A[1], B[1], u) - 40 * Math.sin(Math.PI * u)];
      circle(ctx, p[0], p[1], 7 - i * 0.8, rgba('#C8A8FF', 0.9 * fade)); softDot(gctx, p[0], p[1], 22, '#C8A8FF', 0.7 * fade);
    }
  }
  screenSpace();
  if (t < c.social - 0.05) ideaTag('IDEA #2', ramp(t, c.idea2 - 0.1, c.idea2 + 0.2), '#C8A8FF', 430);
  else ideaTag('IDEA #2: COPYCAT BRAINS?', ramp(t, c.social - 0.05, c.social + 0.2), '#C8A8FF', 430);
  busSweep(t, 0.6);
  return { glow: 0.75 };
};

// ---------------------------------------------------------------- 8. dogs: ... and some dogs even catch ours
SC.dogs = (lt, t, shot) => {
  const c = cu();
  const cam = sway({ x: 1640, y: 1215, zoom: 1.34 + 0.05 * ramp(lt, 0, 2.6, E.inOutSine), rot: 0 }, t, 0.5);
  busInterior(cam, t, { x0: 1100, x1: 2200 });
  drawPassenger(ctx, PASS.nurse, { x: SEAT.nurse, y: BUS.seatY, s: 1, sleep: 1, tilt: 0.12 }, t);
  const hy = yawnEnv(t, c.chuckle1 + 0.15, c.even + 0.75, 0.35, 0.35);
  let face = lerpFace(Object.assign({}, FACES.calm, { lookX: 1, lookY: 0.6 }), FACES.yawn, hy);
  face = lerpFace(face, Object.assign({}, FACES.startled, { lookX: 1, lookY: 0.7 }), ramp(t, c.ours + 0.2, c.ours + 0.4));
  heroOnBench(ctx, { x: SEAT.hero, y: BUS.seatY, s: 1, face, headRot: 0.08, stretch: 0.6 * hy }, t);
  const dy = yawnEnv(t, c.ours - 0.12, c.ours_end + 0.25, 0.3, 0.3);
  const dog = { x: 1790, y: BUS.floorY + 120, s: 1, yawn: dy, tilt: lerp(0, 0.28, ramp(t, c.dogs, c.dogs + 0.3)) * (1 - ramp(t, c.ours - 0.2, c.ours)) + 0.05 * dy,
    lookX: -1, wag: 1 - dy, blink: 0 };
  drawDog(ctx, dog, t);
  // the yawn hops to the dog
  const hm = [SEAT.hero, BUS.seatY - 200], dh = dogHead(dog);
  yawnWisp(hm, [dh[0], dh[1] - 20], ramp(t, c.even, c.ours - 0.1, E.inOutSine), t, 1 - ramp(t, c.ours - 0.1, c.ours + 0.15), 120);
  if (t > c.ours) shockLines(...toScreen(cam, dh[0], dh[1]), 230, inv(c.ours, c.ours + 0.5, t), 12, '#FFD447', 9);
  busStraps(cam, t, 1100, 2200);
  return { glow: 0.75 };
};

// ---------------------------------------------------------------- 9. weird: just reading about yawns starts one
function heroWithBook(cam, t, face, bookLift, coverK) {
  const st = { x: 540, y: BUS.seatY, s: 1, face, stretch: 0 };
  heroOnBench(ctx, st, t);
  // the book, held up in front of his chest (we see the cover)
  const by = BUS.seatY - 70 - 60 * bookLift;
  ctx.save(); ctx.translate(540, by); ctx.rotate(-0.04);
  rrect(ctx, -120, -84, 240, 168, 12); ctx.fillStyle = '#5A2E8A'; ctx.fill();
  rrect(ctx, -112, -76, 224, 152, 8); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,212,71,0.6)'; ctx.stroke();
  ctx.font = '400 66px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFD447'; ctx.fillText('YAWNS', 0, -8);
  ctx.font = '800 20px Montserrat'; ctx.fillStyle = 'rgba(255,240,200,0.8)'; ctx.fillText('A VERY LONG BOOK', 0, 46);
  ctx.restore();
  // hands on the book's sides
  for (const sd of [-1, 1]) { circle(ctx, 540 + sd * 122, by + 20, 20, PAL.skinSh); circle(ctx, 540 + sd * 120, by + 18, 17, PAL.skin); }
}
SC.weird = (lt, t, shot) => {
  const c = cu();
  const p2 = c.just - 0.18, p3 = c.canstart - 0.12;
  const dim = t >= p3 ? 0.18 : 0.42;
  if (t < p2 || t >= p3) {
    // on the night bus, lights low, reading
    const close = t >= p3;
    const cam = close ? { x: 540, y: 1000 - 10 * ramp(t, p3, shot.end), zoom: 2.0 + 0.12 * ramp(t, p3, shot.end), rot: 0 }
      : { x: 540, y: 1050, zoom: 1.45 + 0.12 * ramp(t, shot.start, p2, E.inOutSine), rot: 0 };
    busInterior(cam, t, { x0: 0, x1: 1080 });
    const yk = close ? yawnEnv(t, c.canstart - 0.05, shot.end + 0.6, 0.35, 0.4) : 0;
    let face = Object.assign({}, FACES.calm, { lookX: 0, lookY: 1, blink: 0.25 });
    face = lerpFace(face, FACES.yawn, yk);
    heroWithBook(cam, t, face, close ? -0.6 * yk : 0, 1);
    screenSpace();
    ctx.fillStyle = `rgba(2,4,14,${dim})`; ctx.fillRect(0, 0, W, H);
    // reading light pool
    const lp = toScreen(cam, 540, BUS.seatY - 200);
    const g = ctx.createRadialGradient(lp[0], lp[1], 20, lp[0], lp[1], 520);
    g.addColorStop(0, 'rgba(255,214,150,0.42)'); g.addColorStop(1, 'rgba(255,214,150,0)');
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over';
    if (close && yk > 0.3) shockLines(...toScreen(cam, 540, BUS.seatY - 250), 250, inv(c.canstart + 0.1, c.canstart + 0.6, t), 12, '#FFD447', 5);
    return { glow: 0.8 };
  }
  // insert: the open book, the yawn words light up as she says them
  darkBg('#2A1E14', '#060408');
  screenSpace();
  const k = clamp((t - p2) / (p3 - p2));
  const lit = [ramp(t, c.reading - 0.1, c.reading + 0.2), ramp(t, c.about_y - 0.1, c.about_y + 0.15), ramp(t, c.yawns_r - 0.1, c.yawns_r + 0.15),
    ramp(t, c.yawns_r + 0.25, c.yawns_r + 0.45), ramp(t, c.yawns_r + 0.45, c.yawns_r + 0.65), ramp(t, c.yawns_r + 0.6, c.yawns_r + 0.8)];
  const g = ctx.createRadialGradient(540, 760, 40, 540, 800, 700);
  g.addColorStop(0, 'rgba(255,214,150,0.35)'); g.addColorStop(1, 'rgba(255,214,150,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // the camera travels to each word as she says it (book-local word centres), then pulls back to the lit page
  const bk = camKeys(t, [[p2, 0, 0, 0.98], [c.reading - 0.2, 0, 0, 1.0], [c.reading + 0.1, -290, -102, 1.75], [c.about_y - 0.15, -290, -102, 1.8],
    [c.about_y + 0.15, 90, -157, 1.75], [c.yawns_r - 0.1, 90, -157, 1.78], [c.yawns_r + 0.6, 0, 10, 1.06], [p3, 0, 10, 1.1]]);
  yawnBook(540 - bk.x * bk.zoom, 800 - bk.y * bk.zoom, 780, t, 1, lit, bk.zoom);
  motes(t, 0.5);
  return { glow: 0.8, zblur: 0.06 * (1 - ramp(t, p2, p2 + 0.25)) };
};

// ---------------------------------------------------------------- 10. button: if you yawned... it's science
SC.button = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const lean = ramp(t, c.so - 0.1, c.yawned + 0.3, E.inOutSine);
  const cam = sway({ x: SEAT.hero, y: 1015 + 20 * lean, zoom: 2.0 + 0.45 * lean, rot: 0 }, t, 0.4);
  busInterior(cam, t, { x0: SEAT.hero - 400, x1: SEAT.hero + 400 });
  let face = Object.assign({}, FACES.annoyed, { lookX: 0, lookY: 0, blink: 0.45, browTilt: -0.4 });
  face = lerpFace(Object.assign({}, FACES.calm, { lookX: 0 }), face, ramp(t, c.so, c.so + 0.3));
  face = lerpFace(face, Object.assign({}, FACES.grin, { lookX: 0 }), ramp(t, c.chuckle2 - 0.1, c.chuckle2 + 0.15));
  const pk = ramp(t, c.you_b - 0.25, c.you_b + 0.1) * (1 - ramp(t, c.this_end2 - 0.1, c.this_end2 + 0.2));
  const r = heroOnBench(ctx, { x: SEAT.hero, y: BUS.seatY, s: 1, face, headRot: 0.04 * Math.sin(t * 2), point: pk }, t);
  screenSpace();
  if (pk > 0.05) { // the magnifying glass at his right eye: inspecting the viewer for yawns
    applyCam(cam);
    const st2 = { x: SEAT.hero, y: BUS.seatY + 34, s: 1 };
    const wr = toWorld(st2, r.wrR), hd = toWorld(st2, r.head);
    magnifier(ctx, wr, [hd[0] + 30, hd[1] - 4], 42, E.outBack(clamp(pk * 1.2)), t, 0.42);
    screenSpace();
  }
  // BORED? -> crossed out -> SCIENCE
  const bk = ramp(t, c.this_end2 + 0.0, c.this_end2 + 0.25, (x) => x) * (1 - ramp(t, c.science - 0.25, c.science - 0.05));
  bigWord('BORED?', 540, 540, 150, '#C9D4F2', E.outBack(bk), -0.05);
  bigX(540, 540, 0.75, ramp(t, c.boredom_end - 0.05, c.boredom_end + 0.12) * (1 - ramp(t, c.science - 0.25, c.science - 0.05)));
  const sk = ramp(t, c.science - 0.08, c.science + 0.15);
  neonWord('SCIENCE!', 540, 540, 170, '#7FE9FF', sk, t);
  if (sk > 0.5) for (let i = 0; i < 10; i++) {
    const a = i / 10 * Math.PI * 2 + t, r = 300 + 20 * Math.sin(t * 5 + i);
    const x = 540 + Math.cos(a) * r, y = 540 + Math.sin(a) * r * 0.35;
    circle(ctx, x, y, 5, '#E6FAFF'); softDot(gctx, x, y, 20, '#7FE9FF', 0.8);
  }
  return { glow: 0.85, flash: 0.2 * (1 - ramp(t, c.science, c.science + 0.15)) * ramp(t, c.science - 0.05, c.science) };
};

// ---------------------------------------------------------------- 11. sub: his stomach growls; everyone nods off
SC.sub = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const whip = ramp(t, c.awake + 0.55, shot.end, E.inCubic);
  const push = ramp(lt, 0.4, D - 0.7, E.inOutSine);   // a slow push toward him while everyone nods off
  const cam0 = { x: lerp(SEAT.hero, SEAT.gran + 30, whip), y: 1120 - 25 * push - 45 * whip, zoom: 1.12 + 0.3 * push + 0.2 * whip, rot: 0 };
  const cam = sway(cam0, t, 0.6);
  busInterior(cam, t, { x0: cam0.x - 560 / cam0.zoom - 200, x1: cam0.x + 560 / cam0.zoom + 200 });
  const growl = ramp(t, c.growls - 0.05, c.growls + 0.1) * (1 - ramp(t, c.growls_end + 0.1, c.growls_end + 0.4));
  const nod = ramp(t, c.still - 0.1, c.awake + 0.4, E.inOutSine);
  const look = ramp(t, c.growls + 0.1, c.growls + 0.35) * (1 - nod);
  drawPassenger(ctx, PASS.gran, { x: SEAT.gran, y: BUS.seatY, s: 1, yawn: yawnEnv(t, shot.end - 0.55, shot.end + 1.5, 0.45, 0.4), stretch: 0.7 * ramp(t, shot.end - 0.55, shot.end) }, t);
  drawPassenger(ctx, PASS.suit, { x: SEAT.suit, y: BUS.seatY, s: 1, sleep: 1 }, t);
  drawPassenger(ctx, PASS.teen, { x: SEAT.teen, y: BUS.seatY, s: 1, lookX: lerp(0.2, 1, look), lookY: 0.6 * look, brow: look, sleep: nod, mouthO: look * 0.8 }, t);
  let face = Object.assign({}, FACES.drowsy, { blink: 0.5 });
  face = lerpFace(face, Object.assign({}, FACES.startled, { lookX: 0, lookY: 1 }), ramp(t, c.growls - 0.05, c.growls + 0.15) * (1 - nod));
  face = lerpFace(face, Object.assign({}, FACES.sleepy), nod);
  heroOnBench(ctx, { x: SEAT.hero, y: BUS.seatY, s: 1, face, headRot: 0.12 * nod, headDY: 10 * nod }, t);
  drawPassenger(ctx, PASS.nurse, { x: SEAT.nurse, y: BUS.seatY, s: 1, sleep: lerp(1, 0.3, look), lookX: -1, tilt: 0.1 }, t);
  // the growl: rumble arcs at his belly + GRRR
  if (growl > 0.01) {
    const bp = [SEAT.hero, BUS.seatY - 90];
    for (let i = 0; i < 3; i++) {
      const r = 70 + i * 30 + 10 * Math.sin(t * 40 + i);
      ctx.beginPath(); ctx.arc(bp[0], bp[1], r, -0.5, 0.5); ctx.lineWidth = 7; ctx.strokeStyle = rgba('#FF9A3C', 0.8 * growl); ctx.stroke();
      ctx.beginPath(); ctx.arc(bp[0], bp[1], r, Math.PI - 0.5, Math.PI + 0.5); ctx.stroke();
    }
    const [gx, gy] = toScreen(cam, bp[0] + 150, bp[1] - 40);
    screenSpace(); bigWord('GRRR', gx, gy, 92, '#FF9A3C', E.outBack(growl), -0.15 + 0.05 * Math.sin(t * 30));
    applyCam(cam);
  }
  // zzz as they nod off
  if (nod > 0.3) { zzz(SEAT.hero + 40, BUS.seatY - 320, t, c.awake, nod, 0.8); zzz(SEAT.teen + 40, BUS.seatY - 320, t, c.awake + 0.2, nod, 0.7); }
  busStraps(cam, t, cam0.x - 900, cam0.x + 900);
  busSweep(t, 0.8);
  return { glow: 0.8, blur: [-90 * Math.sin(Math.PI * whip), 0] };
};

// ---------------------------------------------------------------- the cover (rendered from a one-shot timeline: cover.jpg)
SC.cover = (lt, t, shot) => {
  const cam = { x: SEAT.hero - 30, y: 1005, zoom: 1.95, rot: -0.02 };
  busInterior(cam, 1.3, { x0: SEAT.hero - 450, x1: SEAT.hero + 450 });
  const face = Object.assign({}, FACES.yawn, { tear: 0.35 });
  heroOnBench(ctx, { x: SEAT.hero, y: BUS.seatY, s: 1, face, stretch: 0.85, headRot: -0.05 }, 1.3);
  // the wisp curling around his head
  const he = [SEAT.hero, BUS.seatY - 250];
  yawnWisp([SEAT.teen, BUS.seatY - 210], [he[0] - 40, he[1] - 120], 0.92, 1.3, 1, 140);
  busStraps(cam, 1.3, SEAT.hero - 450, SEAT.hero + 450);
  busSweep(0.6, 0.8);
  screenSpace();
  shockLines(...toScreen(cam, he[0], he[1]), 230, 0.35, 12, '#E9DDFF', 3);
  bigWord('YAWNS ARE', 540, 515, 112, '#FFFFFF', 1, -0.03);
  bigWord('CONTAGIOUS?!', 540, 655, 158, '#FFD447', 1, -0.03);
  return { glow: 0.9, noCaptions: true, noSubscribe: true, grain: 0 };
};

// ---------------------------------------------------------------- placeholders (filled in below as they are built)
for (const id of ['name', 'why', 'cool', 'pack', 'social', 'dogs', 'weird', 'button', 'sub']) {
  if (!SC[id] || SC[id].kit) SC[id] = (lt, t, shot) => { darkBg(); bigWord(id.toUpperCase(), 540, 900, 160, '#FFD447', 1); return {}; };
}

function initScenes2() {
  initBus();
  initYawnHead();
}
