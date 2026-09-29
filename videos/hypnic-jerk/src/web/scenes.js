// Hypnic-jerk Short, part 1: the bedroom. Drifting off, the jolt, "thanks, body", the title,
// the 70 % city and the dive into the head. Each SC.<id>(lt, t, shot) draws one frame
// (lt = time inside the shot) and returns post options for main.js.
'use strict';

const cu = () => TLd.cues;
const shotOf = (id) => TLd.shots.find((s) => s.id === id);

// a camera that draws everything scaled by k about world point P (things rise toward the lens)
function scaledCam(cam, P, k) {
  return Object.assign({}, cam, { zoom: cam.zoom * k, x: (cam.x + (k - 1) * P[0]) / k, y: (cam.y + (k - 1) * P[1]) / k });
}
// world point -> screen point for a camera (no rotation needed for our uses; rotation handled)
function toScreen(cam, x, y) {
  const c = Math.cos(cam.rot || 0), s = Math.sin(cam.rot || 0);
  const dx = (x - cam.x) * cam.zoom, dy = (y - cam.y) * cam.zoom;
  return [W / 2 + (cam.sx || 0) + dx * c - dy * s, H / 2 + (cam.sy || 0) + dx * s + dy * c];
}

let MOTES = null, STARS = null, CITY = null, FEATHERS = null;
function initScenes2() {
  initBrain();
  const rng = mulberry32(404);
  MOTES = [...Array(70)].map(() => ({ x: rng(), y: rng(), z: 0.3 + rng() * 0.7, ph: rng() * 10 }));
  STARS = [...Array(260)].map(() => ({ x: rng(), y: rng(), r: 0.6 + rng() * 2.2, ph: rng() * 10, z: rng() }));
  FEATHERS = [...Array(7)].map((_, i) => ({ a: -2.6 + i * 0.75 + rng() * 0.3, v: 180 + rng() * 160, spin: (rng() - 0.5) * 5, ph: rng() * 6, s: 0.8 + rng() * 0.5 }));
  CITY = makeCity();
  if (typeof initScenes3 === 'function') initScenes3();
  if (typeof initScenes4 === 'function') initScenes4();
}

// ---------------------------------------------------------------- small shared pieces
// "Z z z" drifting up from a sleeper (world coords under the current camera)
function zzz(x, y, t, t0, a = 1, s = 1) {
  if (t < t0 || a <= 0.01) return;
  const d = t - t0;
  for (const c of [ctx, gctx]) {
    c.save();
    c.textAlign = 'center'; c.textBaseline = 'middle';
    for (let i = 0; i < 3; i++) {
      if (d < i * 0.45) continue;
      const p = ((d - i * 0.45) * 0.42) % 1;
      const px = x + (40 + p * 120) * s + Math.sin(p * 7 + i) * 18 * s, py = y - p * 300 * s;
      const sz = (34 + p * 46 + i * 6) * s;
      const al = Math.sin(Math.PI * p) * a;
      c.font = `900 ${sz}px Montserrat`;
      c.save(); c.translate(px, py); c.rotate(-0.25 + 0.2 * Math.sin(p * 5 + i));
      if (c === ctx) {
        c.lineWidth = sz * 0.16; c.strokeStyle = `rgba(10,14,40,${0.7 * al})`; c.strokeText('Z', 0, 0);
        c.fillStyle = `rgba(200,220,255,${0.95 * al})`; c.fillText('Z', 0, 0);
      } else { c.fillStyle = `rgba(140,170,255,${0.6 * al})`; c.fillText('Z', 0, 0); }
      c.restore();
    }
    c.restore();
  }
}
// dust motes drifting through the moonlight (screen space)
function motes(t, a = 1) {
  screenSpace();
  for (const m of MOTES) {
    const x = ((m.x * W + t * 14 * m.z + 20 * Math.sin(t * 0.4 + m.ph)) % (W + 40)) - 20;
    const y = ((m.y * H - t * 9 * m.z + 30 * Math.sin(t * 0.3 + m.ph * 2)) % H + H) % H;
    const tw = 0.5 + 0.5 * Math.sin(t * 1.3 + m.ph * 3);
    softDot(ctx, x, y, 3 + 5 * m.z, '#CFE0FF', 0.22 * a * tw * m.z);
    softDot(gctx, x, y, 6 + 8 * m.z, '#AFC8FF', 0.25 * a * tw * m.z);
  }
}
// cartoon heart (screen space)
function heartIcon(x, y, s, a = 1) {
  if (a <= 0.01) return;
  const path = (c) => {
    c.beginPath();
    c.moveTo(x, y + 26 * s);
    c.bezierCurveTo(x - 44 * s, y - 2 * s, x - 30 * s, y - 38 * s, x, y - 18 * s);
    c.bezierCurveTo(x + 30 * s, y - 38 * s, x + 44 * s, y - 2 * s, x, y + 26 * s);
  };
  screenSpace();
  path(ctx);
  const g = ctx.createRadialGradient(x - 12 * s, y - 16 * s, 2, x, y, 44 * s);
  g.addColorStop(0, rgba('#FFB3C1', a)); g.addColorStop(0.5, rgba('#FF4D6D', a)); g.addColorStop(1, rgba('#B3123A', a));
  ctx.fillStyle = g; ctx.fill();
  ctx.lineWidth = 4 * s; ctx.strokeStyle = rgba('#3A0614', 0.8 * a); ctx.stroke();
  path(gctx); gctx.fillStyle = rgba('#FF3A60', 0.7 * a); gctx.fill();
}
function sweatDrop(c, x, y, s, a = 1) {
  if (a <= 0.01) return;
  c.beginPath(); c.moveTo(x, y - 22 * s);
  c.bezierCurveTo(x + 14 * s, y - 2 * s, x + 12 * s, y + 14 * s, x, y + 14 * s);
  c.bezierCurveTo(x - 12 * s, y + 14 * s, x - 14 * s, y - 2 * s, x, y - 22 * s);
  c.fillStyle = `rgba(150,215,255,${0.95 * a})`; c.fill();
  c.lineWidth = 2.5 * s; c.strokeStyle = `rgba(30,70,140,${0.8 * a})`; c.stroke();
  ellipse(c, x - 4 * s, y + 2 * s, 3 * s, 5 * s, `rgba(255,255,255,${0.9 * a})`);
}
// motion "shock" lines around a point (screen space), k = 0..1 life
function shockLines(x, y, r, k, n = 10, col = '#FFFFFF', seed = 1) {
  if (k <= 0 || k >= 1) return;
  const rng = mulberry32(seed);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rng() * 0.3;
    const r0 = r * (0.9 + 0.5 * E.outCubic(k)), r1 = r0 + (40 + rng() * 50) * (1 - k);
    const al = 1 - k;
    for (const [c, w] of [[ctx, 7], [gctx, 14]]) line(c, x + Math.cos(a) * r0, y + Math.sin(a) * r0, x + Math.cos(a) * r1, y + Math.sin(a) * r1, w, rgba(col, 0.9 * al));
  }
}
// big word stamped in screen space (Anton), with a hard outline
function bigWord(txt, x, y, size, col, k, rot = 0, stroke = '#0B0B1A') {
  if (k <= 0) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k);
  ctx.font = `400 ${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.fillStyle = 'rgba(0,0,12,0.55)'; ctx.fillText(txt, 0, size * 0.06);
  ctx.lineWidth = size * 0.14; ctx.strokeStyle = stroke; ctx.strokeText(txt, 0, 0);
  ctx.fillStyle = col; ctx.fillText(txt, 0, 0);
  ctx.restore();
}
// pose with a little twitch noise on every joint (seconds after a jolt)
function twitch(p, t, amt, seed = 5) {
  const q = JSON.parse(JSON.stringify(p));
  let i = 0;
  for (const k of ['armL', 'armR', 'legL', 'legR']) {
    q[k].a += amt * vnoise(t * 24, seed + i++); q[k].b += amt * vnoise(t * 21, seed + i++);
  }
  return q;
}

// ---------------------------------------------------------------- overhead bedroom
// o: pose, face, hop (body rises toward the lens), lift/kick (duvet), squish, ripple, lamp, headDY, frizz, clock
function bedTopScene(cam, t, o = {}) {
  applyCam(cam);
  drawFloorTop();
  bedTop(t, { squish: o.squish || 0 });
  nightstandTop(t, { lamp: o.lamp || 0, ripple: o.ripple || 0, clock: o.clock || '11:47' });
  const st = { x: LY.x, y: LY.y, s: LY.s, pose: o.pose || POSES.sleep, face: o.face || FACES.sleepy, frizz: o.frizz || 0,
    soot: 0, seed: 3, headDY: o.headDY || 0, headRot: o.headRot || 0 };
  const r = rig(st.pose);
  const hop = o.hop || 0;
  const hc = scaledCam(cam, [540, 880], 1 + 0.085 * hop);
  applyCam(cam);
  // contact shadow spreads and softens as the body leaves the mattress
  ellipse(ctx, 540 + 26 * Math.max(0, hop), 990 + 36 * Math.max(0, hop), 250 + 60 * Math.max(0, hop), 570, `rgba(8,8,28,${0.16 + 0.14 * Math.max(0, hop)})`);
  charLayer(hc, st, t, { ambient: o.ambient === undefined ? 0.1 : o.ambient, post: (lc, rr) => pajamaStars(lc, rr, st), pal: PJ });
  applyCam(hc);
  duvetTop(st, r, t, { lift: o.lift || 0, kick: o.kick || 0 });
  armsOnTop(ctx, st, r, tintPal(PJ, 0.1));
  applyCam(cam);
  moonlightTop((1 - 0.6 * (o.lamp || 0)) * (o.moon === undefined ? 1 : o.moon));
  if (o.lamp > 0) { screenSpace(); ctx.fillStyle = `rgba(255,190,110,${0.1 * o.lamp})`; ctx.fillRect(0, 0, W, H); applyCam(cam); }
  const head = toWorld(st, r.head);
  return { st, r, hc, head: [head[0], head[1] + (o.headDY || 0) * st.s] };
}

// ---------------------------------------------------------------- front view: sitting up in bed
const SITC = { x: 540, y: 1246, s: 1.35 };
// forearms + hands resting on the duvet (drawn after it)
function armsFront(st, r, pal, which = ['L', 'R']) {
  const c = ctx;
  c.save(); c.translate(st.x, st.y); c.scale(st.s, st.s);
  for (const k of which) {
    const s = k === 'L' ? -1 : 1;
    capsuleShaded(c, r['el' + k], r['wr' + k], 38, pal.coat, pal.coatSh, pal.coatHi, pal);
    const wr = r['wr' + k], d = r['armDir' + k];
    line(c, wr[0] - d[0] * 6, wr[1] - d[1] * 6, wr[0] + d[0] * 2, wr[1] + d[1] * 2, 42, pal.coatSh);
    drawHand(c, wr, d, st.pose.hand === 'spread' ? 'spread' : 'open', pal, s, 0);
  }
  c.restore();
}
// o: pose, face, lamp, frizz, headDX/DY/Rot, lift, kick, cover, armsOver, post(lc, r, st), bodyDY
function bedFrontScene(cam, t, o = {}) {
  const lamp = o.lamp === undefined ? 1 : o.lamp;
  bedroomFront(cam, t, { lamp, clock: o.clock || '11:47' });
  const st = { x: SITC.x + (o.dx || 0), y: SITC.y + (o.bodyDY || 0), s: SITC.s, pose: o.pose || POSES.sit, face: o.face || FACES.calm,
    frizz: o.frizz || 0, soot: 0, seed: 3, noLegs: true, headDX: o.headDX || 0, headDY: o.headDY || 0, headRot: o.headRot || 0 };
  const r = charLayer(cam, st, t, {
    ambient: 0.16 - 0.08 * lamp, pal: PJ,
    post: (lc, rr) => {
      pajamaStars(lc, rr, st);
      // warm key light from the lamp (screen right), cool moon fill from the window (left)
      lc.setTransform(1, 0, 0, 1, 0, 0);
      lc.globalCompositeOperation = 'source-atop';
      const [lx] = toScreen(cam, 980, 900);
      const g = lc.createLinearGradient(lx - 700, 0, lx, 0);
      g.addColorStop(0, 'rgba(120,150,255,0.10)'); g.addColorStop(0.55, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(255,190,110,${0.28 * lamp})`);
      lc.fillStyle = g; lc.fillRect(0, 0, W, H);
      lc.globalCompositeOperation = 'source-over';
      if (o.post) { camTransform(lc, cam, 1); o.post(lc, rr, st); }
    },
  });
  applyCam(cam);
  duvetFront(t, { lift: o.lift || 0, kick: o.kick || 0, cover: o.cover || 0 });
  // bed frame front board
  rrect(ctx, 120, 1330, 840, 120, 24); ctx.fillStyle = '#34263A'; ctx.fill();
  rrect(ctx, 140, 1344, 800, 16, 8); ctx.fillStyle = 'rgba(255,220,180,0.10)'; ctx.fill();
  if (o.armsOver !== false) armsFront(st, r, tintPal(PJ, 0.12 - 0.06 * lamp));
  return { st, r };
}
const POSE_GRIP = { hipY: -34, lean: 0, armL: { a: 0.28, b: -1.45 }, armR: { a: 0.28, b: -1.45 }, legL: { a: 2.25, b: -1.95 }, legR: { a: 2.25, b: -1.95 }, hand: 'open', feetFront: 1 };
const POSE_UPRIGHT = { hipY: -40, lean: 0, armL: { a: 0.5, b: -1.2 }, armR: { a: 0.5, b: -1.2 }, legL: { a: 2.25, b: -1.95 }, legR: { a: 2.25, b: -1.95 }, hand: 'spread', feetFront: 1 };

// ================================================================= 1. hook
SC.hook = (lt, t, shot) => {
  const c = cu(), g0 = c.gasp, j0 = c.jumps;
  const jk = inv(g0 - 0.02, g0 + 0.06, t);                   // the jerk itself
  // body rises off the mattress on the gasp, hangs, and slams back down on "JUMPS"
  let hop = 0;
  if (t >= g0) hop = E.outCubic(inv(g0, g0 + 0.22, t)) * (1 + 0.06 * Math.sin((t - g0) * 9));
  if (t >= j0 - 0.07) hop = lerp(hop, 0, E.inCubic(inv(j0 - 0.07, j0 + 0.02, t)));
  const land = t >= j0 + 0.02 ? t - (j0 + 0.02) : -1;
  if (land >= 0) hop = -0.35 * Math.exp(-land * 7) * Math.cos(land * 22);      // mattress bounce
  const settle = ramp(t, j0 + 0.25, j0 + 1.0, E.inOutSine);
  let pose = t < g0 ? POSES.sleep : lerpPose(POSES.sleep, POSES.jolt, clamp(E.outBack(jk, 1.4), 0, 1.1));
  if (t >= g0 && t < j0 + 0.3) pose = twitch(pose, t, 0.09 * (1 - inv(j0, j0 + 0.3, t)));
  if (land >= 0) pose = lerpPose(pose, lerpPose(POSES.sleep, POSES.jolt, 0.35), settle);
  // face: drowsy -> asleep -> STARTLED -> wide-eyed stare
  const closeK = E.inOutSine(inv(0.3, 1.7, t));
  let face = lerpFace(FACES.drowsy, FACES.sleepy, closeK);
  if (t >= g0) face = lerpFace(FACES.sleepy, FACES.startled, clamp(jk * 1.6));
  if (land >= 0) face = lerpFace(FACES.startled, Object.assign({}, FACES.startled, { mouth: 'flat', mouthOpen: 0.3, pupil: 0.45 }), settle);
  // breathing before the jolt
  const breathe = t < g0 ? 0.12 * (0.5 + 0.5 * Math.sin(t * 2.4)) : 0;
  const lift = t < g0 ? breathe : clamp(hop * 1.25 + 0.3 * Math.exp(-(t - g0) * 3));
  const kick = t >= g0 ? Math.exp(-(t - g0) * 3.2) + (land >= 0 ? 0.8 * Math.exp(-land * 4) : 0) : 0;
  const squish = land >= 0 ? Math.exp(-land * 6) * (0.8 + 0.2 * Math.cos(land * 25)) : 0;
  const ripple = t >= g0 ? (t - g0) * 0.9 : 0;
  // camera: close on the face, whips back to the whole bed on the gasp, shakes on the landing
  const pre = ramp(t, 0, g0, E.inOutSine);
  const pull = E.outCubic(inv(g0 + 0.02, g0 + 0.42, t));
  const push = ramp(t, j0 + 0.35, shot.end, E.inOutSine);
  let cam = {
    x: lerp(538, 572, pull), y: lerp(lerp(505, 478, pre), lerp(720, 600, push), pull),
    zoom: lerp(lerp(2.3, 2.72, pre), lerp(1.42, 1.75, push), pull) * (land >= 0 ? 1 + 0.05 * Math.exp(-land * 8) : 1),
    rot: lerp(lerp(-0.075, -0.035, pre), lerp(0.012, -0.02, push), pull),
  };
  let shk = [0, 0];
  if (t >= g0) { const a = 30 * Math.exp(-(t - g0) * 7); shk = shake(t, a, 26, 4); }
  if (land >= 0) { const s2 = shake(t, 42 * Math.exp(-land * 6), 28, 8); shk = [shk[0] + s2[0], shk[1] + s2[1]]; }
  cam.sx = shk[0]; cam.sy = shk[1];
  const headDY = t >= g0 && land < 0 ? -22 * clamp(jk) : (land >= 0 ? -22 * Math.exp(-land * 5) : 0);
  const o = bedTopScene(cam, t, { pose, face, hop, lift, kick, squish, ripple, headDY, lamp: 0 });
  applyCam(cam);
  // pillow feathers burst on the landing
  if (land >= 0 && land < 1.8) {
    for (const f of FEATHERS) {
      const k = land / 1.8;
      const px = 540 + Math.cos(f.a) * f.v * E.outCubic(Math.min(1, land * 1.4)) + 25 * Math.sin(land * 3 + f.ph);
      const py = 430 + Math.sin(f.a) * f.v * 0.6 * E.outCubic(Math.min(1, land * 1.4)) + 40 * land;
      ctx.save(); ctx.translate(px, py); ctx.rotate(f.ph + land * f.spin); ctx.scale(f.s * (1 + 0.3 * k), f.s * (1 + 0.3 * k));
      ctx.globalAlpha = 1 - k;
      ctx.beginPath(); ctx.moveTo(-26, 0); ctx.quadraticCurveTo(0, -12, 26, 0); ctx.quadraticCurveTo(0, 10, -26, 0);
      ctx.fillStyle = '#F4F6FF'; ctx.fill(); line(ctx, -26, 0, 22, 0, 2, 'rgba(150,160,200,0.8)');
      ctx.restore();
    }
  }
  // sleepy Zs until the jolt; they scatter on it
  if (t < g0 + 0.15) zzz(o.head[0] + 60, o.head[1] - 60, t, 0.5, clamp(1 - inv(g0, g0 + 0.15, t)) * ramp(t, 0.4, 0.9), 1.1);
  motes(t, 0.8);
  screenSpace();
  if (t >= g0 && t < g0 + 0.5) { const [hx, hy] = toScreen(cam, o.head[0], o.head[1]); shockLines(hx, hy, 190 * cam.zoom / 2.4, (t - g0) / 0.5, 12, '#FFFFFF', 3); }
  if (land >= 0 && land < 0.45) { const [bx, by] = toScreen(cam, 540, 980); shockLines(bx, by, 360 * cam.zoom, land / 0.45, 14, '#FFD447', 9); }
  const post = { zblur: t >= g0 ? -0.22 * (1 - pull) * (pull > 0 ? 1 : 0) : 0, zcx: 540, zcy: 700 };
  post.flash = t >= g0 ? 0.32 * Math.exp(-(t - g0) * 14) : 0;
  if (land >= 0) post.flash += 0.18 * Math.exp(-land * 16);
  if (land >= 0 && land < 0.12) post.blur = [0, 26 * (1 - land / 0.12)];
  post.grain = 1;
  return post;
};

// ================================================================= 2. stare: "Wow. Thanks, body."
SC.stare = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const wow = c.wow, th = c.thanks;
  const enter = 1 - E.outCubic(inv(0, 0.18, lt));
  const beat = (tt) => { // lub-dub pulses on the shared heartbeat schedule (same times as the audio)
    let v = 0;
    for (const hb of c.heartbeats) {
      const d = tt - hb;
      if (d >= 0 && d < 0.6) v = Math.max(v, Math.exp(-d * 14), d >= 0.16 ? 0.65 * Math.exp(-(d - 0.16) * 16) : 0);
    }
    return v;
  };
  const b = beat(t);
  const push = E.inOutSine(clamp(lt / D));
  const cam = { x: lerp(560, 540, push), y: lerp(965, 945, push), zoom: lerp(2.05, 2.35, push) * (1 + 0.006 * b), rot: lerp(0.012, -0.008, push) };
  const [sx, sy] = shake(t, 3 + 5 * b, 30, 2);
  cam.sx = sx; cam.sy = sy;
  // face: frozen wide eyes -> unimpressed -> glance down at the body -> deadpan at us
  const wide = Object.assign({}, FACES.startled, { mouth: 'flat', mouthOpen: 0.2, pupil: 0.42, browY: 1.6 });
  const meh = { eyeOpen: 0.78, pupil: 0.95, lookX: 0, lookY: 0, browY: -0.25, browTilt: -0.55, mouth: 'flat', mouthOpen: 0, blink: 0.38, cross: 0 };
  let face = wide;
  const kWow = E.inOutCubic(inv(wow - 0.05, wow + 0.3, t));
  face = lerpFace(wide, meh, kWow);
  const down = E.inOutSine(inv(th - 0.1, th + 0.15, t)) * (1 - E.inOutSine(inv(th + 0.62, th + 0.85, t)));
  face = Object.assign({}, face, { lookY: lerp(face.lookY, 1, down), lookX: lerp(face.lookX, 0.3, down) });
  // blink right after "Wow"
  const bl = Math.max(0, 1 - Math.abs(t - (wow + 0.62)) / 0.07);
  face.blink = Math.max(face.blink, bl);
  const pose = lerpPose(POSE_UPRIGHT, POSE_GRIP, E.inOutSine(inv(wow, wow + 0.5, t)));
  const o = bedFrontScene(cam, t, {
    pose, face, lamp: 0.85, frizz: lerp(0.32, 0.18, kWow), headRot: -0.04 * down, headDY: 10 * down,
    bodyDY: -4 * b, post: (lc, rr, st) => {
      // sweat drop slides down the temple
      const k = inv(shot.start + 0.1, wow + 0.8, t);
      const [hx, hy] = toWorld(st, rr.head);
      sweatDrop(lc, hx + 66 * st.s, hy - 30 * st.s + 50 * k * st.s, st.s * 0.9, 1 - inv(wow + 0.8, wow + 1.0, t));
    },
  });
  // pounding heart over the chest
  const [cx, cy] = toScreen(cam, ...toWorld(o.st, o.r.heart));
  const ha = 1 - E.inOutSine(inv(th + 0.3, th + 0.9, t));
  heartIcon(cx + 10, cy - 6, (1.5 + 0.55 * b) * ha, 0.95 * ha);
  if (b > 0.5 && ha > 0.2) { for (const s of [-1, 1]) { line(ctx, cx + 10 + s * 88, cy - 50, cx + 10 + s * 124, cy - 72, 8, rgba('#FF9AB0', 0.85 * ha)); line(ctx, cx + 10 + s * 96, cy - 6, cx + 10 + s * 136, cy - 6, 8, rgba('#FF9AB0', 0.85 * ha)); } }
  return { blur: enter > 0.02 ? [0, -120 * enter] : null, flash: 0.25 * enter, grain: 1 };
};

// ================================================================= 3. title: HYPNIC JERK
SC.title = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, jerkT = c.hypnic + 0.42;
  screenSpace();
  const bg = ctx.createRadialGradient(540, 820, 60, 540, 900, 1300);
  bg.addColorStop(0, '#1C2766'); bg.addColorStop(0.6, '#0A0F33'); bg.addColorStop(1, '#03040E');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  for (const s of STARS) {
    const tw = 0.5 + 0.5 * Math.sin(t * 2 + s.ph * 4);
    circle(ctx, s.x * W, s.y * H, s.r * 0.8, `rgba(200,215,255,${0.25 * tw})`);
  }
  // a muscle-activity trace (EMG) across the frame: flat, flat... then one huge spike on "jerk"
  const yL = 1020;
  const P = [];
  for (let x = -20; x <= W + 20; x += 5) {
    const n = 5 * vnoise(x * 0.08 + t * 6, 3);
    const d = x - 540;
    const spk = t >= jerkT ? Math.exp(-Math.pow(d / 40, 2)) * Math.sin(d * 0.35) * 330 * Math.exp(-(t - jerkT) * 2.2) : 0;
    P.push([x, yL + n + spk]);
  }
  poly(ctx, P, 6, '#7FE9FF'); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); poly(gctx, P, 14, 'rgba(127,233,255,0.8)');
  const k1 = E.outBack(inv(shot.start, shot.start + 0.22, t), 2.0);
  const k2 = E.outBack(inv(jerkT - 0.06, jerkT + 0.1, t), 2.6);
  const jump = t >= jerkT ? -120 * Math.exp(-(t - jerkT) * 9) * Math.cos((t - jerkT) * 30) : 0;
  const [jx, jy] = t >= jerkT ? shake(t, 16 * Math.exp(-(t - jerkT) * 5), 30, 6) : [0, 0];
  bigWord('HYPNIC', 540, 600, 250, '#FFFFFF', k1, -0.03);
  bigWord('JERK', 540 + jx, 885 + jy + jump, 300, '#FFD447', k2, 0.02);
  if (t >= jerkT) shockLines(540, 885 + jump, 260, (t - jerkT) / 0.5, 14, '#FFD447', 5);
  pill(540, 1210, 'ALSO CALLED A "SLEEP START"', '#8FB8FF', ramp(t, jerkT + 0.1, jerkT + 0.3) * 1.0, 40);
  const enter = 1 - E.outCubic(inv(0, 0.12, lt));
  const exitK = E.inCubic(inv(D - 0.16, D, lt));
  return { flash: enter * 0.5 + (t >= jerkT ? 0.25 * Math.exp(-(t - jerkT) * 18) : 0), zblur: exitK * 0.3 + enter * 0.15, zcx: 540, zcy: 900,
    noCaptions: true, grain: 1, push: { k: 1 + 0.06 * E.inOutSine(clamp(lt / D)), cx: 540, cy: 800 } };
};

// ================================================================= 4. up to 70 % of people: the city at night
function makeCity() {
  const rng = mulberry32(77);
  const win = [];
  const cols = 4, rows = 6, x0 = 540 - 1.5 * 190, y0 = 520;
  for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {
    win.push({ x: x0 + q * 190, y: y0 + r * 230, lit: rng() < 0.12, hair: ['#2A1B14', '#6A3A1E', '#1B1B1B', '#C98A3A', '#4A2A1A'][Math.floor(rng() * 5)],
      duv: ['#D9A640', '#5EC6A8', '#E07A8C', '#7F9BFF', '#C39BFF'][Math.floor(rng() * 5)], ph: rng() * 6, jolt: rng() });
  }
  // back skyline
  const sky = [];
  for (let i = 0; i < 16; i++) sky.push({ x: -700 + i * 170 + rng() * 60, w: 120 + rng() * 120, h: 500 + rng() * 700, lights: rng() });
  return { win, sky, ours: 9 };
}
function cityWorld(cam, t, o = {}) {
  screenSpace();
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#060A22'); g.addColorStop(0.55, '#141B4A'); g.addColorStop(1, '#1D1846');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // stars + moon (parallax 0.2)
  const pc = parallax(cam, 0.2);
  camTransform(ctx, pc, 1); camTransform(gctx, pc, 0.5);
  for (const s of STARS) circle(ctx, -400 + s.x * 1900, -300 + s.y * 1500, s.r, `rgba(220,230,255,${0.35 + 0.35 * Math.sin(t * 2 + s.ph)})`);
  circle(ctx, 820, 230, 90, '#DDE8FF'); circle(ctx, 848, 214, 80, '#EEF3FF');
  softDot(gctx, 820, 230, 320, '#BFD4FF', 0.8);
  // far skyline (parallax 0.5)
  const pf = parallax(cam, 0.5);
  camTransform(ctx, pf, 1); camTransform(gctx, pf, 0.5);
  for (const b of CITY.sky) {
    rrect(ctx, b.x, 1500 - b.h, b.w, b.h + 800, 6); ctx.fillStyle = '#0D1236'; ctx.fill();
    const rng = mulberry32(Math.floor(b.x * 7));
    for (let yy = 1500 - b.h + 30; yy < 1480; yy += 44) for (let xx = b.x + 16; xx < b.x + b.w - 16; xx += 30) {
      if (rng() < 0.12 * b.lights) { ctx.fillStyle = 'rgba(255,200,120,0.55)'; ctx.fillRect(xx, yy, 12, 18); }
    }
  }
  // our apartment block
  applyCam(cam);
  rrect(ctx, 150, 330, 780, 1700, 10);
  const fg = ctx.createLinearGradient(150, 0, 930, 0);
  fg.addColorStop(0, '#2B2A55'); fg.addColorStop(0.5, '#34336A'); fg.addColorStop(1, '#232248');
  ctx.fillStyle = fg; ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 2;
  for (let yy = 340; yy < 2030; yy += 26) { ctx.beginPath(); ctx.moveTo(150, yy); ctx.lineTo(930, yy); ctx.stroke(); }
  rrect(ctx, 130, 300, 820, 50, 8); ctx.fillStyle = '#1C1B3C'; ctx.fill();
  const jolts = o.jolts || [];
  CITY.win.forEach((w, i) => {
    const jt = jolts[i];
    const jk = jt !== undefined && t >= jt ? Math.exp(-(t - jt) * 5) : 0;
    const ours = i === CITY.ours;
    const lit = ours ? 1 : (w.lit ? 0.7 : 0) + 0.9 * jk;
    ctx.save(); ctx.translate(w.x, w.y);
    rrect(ctx, -70, -85, 140, 170, 8); ctx.fillStyle = '#15142E'; ctx.fill();
    ctx.save(); rrect(ctx, -62, -77, 124, 154, 5); ctx.clip();
    const wg = ctx.createLinearGradient(0, -77, 0, 77);
    wg.addColorStop(0, mixHex('#16204A', '#FFC878', lit)); wg.addColorStop(1, mixHex('#0E1433', '#E08A40', lit));
    ctx.fillStyle = wg; ctx.fillRect(-62, -77, 124, 154);
    // the sleeper: bed + head (seen from the side), hopping on a jolt
    const hy = -jk * 22 * Math.abs(Math.cos((t - (jt || 0)) * 18));
    rrect(ctx, -52, 30, 104, 34, 8); ctx.fillStyle = mixHex('#0B0F26', '#6A4630', lit); ctx.fill();
    if (ours && o.oursSitting) {
      rrect(ctx, -18, -20, 36, 56, 12); ctx.fillStyle = mixHex('#1C2450', '#5E7FDC', lit); ctx.fill();
      circle(ctx, 0, -38, 19, mixHex('#1A1830', '#F2B892', lit));
      ctx.beginPath(); ctx.arc(0, -40, 20, Math.PI * 1.05, Math.PI * 1.95); ctx.fillStyle = '#2A1B14'; ctx.fill();
    } else {
      ctx.save(); ctx.translate(0, hy);
      rrect(ctx, -50, 14, 100, 26, 10); ctx.fillStyle = mixHex('#1A2248', w.duv, 0.25 + 0.6 * lit); ctx.fill();
      circle(ctx, -36, 16, 15, mixHex('#1A1830', '#F2B892', 0.2 + 0.7 * lit));
      ctx.beginPath(); ctx.arc(-36, 14, 16, Math.PI, Math.PI * 2); ctx.fillStyle = w.hair; ctx.fill();
      ctx.restore();
    }
    // curtains
    ctx.fillStyle = 'rgba(40,30,80,0.85)'; ctx.fillRect(-62, -77, 20, 154); ctx.fillRect(42, -77, 20, 154);
    ctx.restore();
    line(ctx, -62, 0, 62, 0, 4, '#15142E'); // window bar
    rrect(ctx, -76, 82, 152, 12, 4); ctx.fillStyle = '#1C1B3C'; ctx.fill(); // sill
    ctx.restore();
    if (lit > 0.05) softDot(gctx, w.x, w.y, 150, '#FFB866', 0.55 * lit);
    if (jk > 0.02) {
      ctx.save(); ctx.translate(w.x + 58, w.y - 92); const ps = E.outBack(clamp((t - jt) / 0.18), 2.4) * (0.5 + 0.5 * jk);
      ctx.scale(ps, ps); circle(ctx, 0, 0, 26, '#FFD447');
      ctx.font = '900 38px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#1A1300'; ctx.fillText('!', 0, 2);
      ctx.restore();
      softDot(gctx, w.x + 58, w.y - 92, 60, '#FFD447', jk);
    }
  });
  return {};
}
SC.common = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const ours = CITY.win[CITY.ours];
  const pull = E.inOutCubic(inv(0, D * 0.8, lt));
  const cam = { x: lerp(ours.x, 540, pull), y: lerp(ours.y, 960, pull), zoom: lerp(5.2, 0.98, E.outCubic(inv(0, D * 0.75, lt))), rot: lerp(0.03, -0.01, pull) };
  // 7 of every 10 windows jolt, rippling out while the narrator says "seventy percent of people get them"
  const jolts = {};
  const order = CITY.win.map((w, i) => i).filter((i) => i !== CITY.ours).sort((a, b) => CITY.win[a].jolt - CITY.win[b].jolt);
  order.slice(0, c.window_jolts.length).forEach((i, k) => { jolts[i] = c.window_jolts[k]; });
  cityWorld(cam, t, { jolts, oursSitting: true });
  // UP TO 70 %
  const hk = E.outBack(inv(c.seventy - 0.15, c.seventy + 0.1, t), 2.2);
  const v = Math.round(70 * E.outCubic(inv(c.seventy - 0.1, c.seventy + 0.6, t)));
  if (hk > 0) {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.translate(540, 205); ctx.scale(hk, hk);
    ctx.font = '900 64px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    ctx.lineWidth = 14; ctx.strokeStyle = '#0B0B1A'; ctx.strokeText('UP TO', 0, 0); ctx.fillStyle = '#FFFFFF'; ctx.fillText('UP TO', 0, 0);
    ctx.restore();
    bigWord(v + '%', 540, 390, 250, '#FFD447', hk, -0.02);
  }
  const enter = 1 - E.outCubic(inv(0, 0.15, lt));
  return { flash: enter * 0.4, zblur: enter * 0.3, zcx: 540, zcy: 960, grain: 1, noCaptionsBefore: null };
};

// ================================================================= 5. dive: "So what's going on?"
SC.dive = (lt, t, shot) => {
  const D = shot.end - shot.start;
  const ours = CITY.win[CITY.ours];
  const a = 0.42, b = 0.8;                       // city -> through the skull -> brain
  if (lt < a) {
    const k = E.inCubic(lt / a);
    const cam = { x: lerp(540, ours.x, E.outCubic(lt / a)), y: lerp(960, ours.y - 30, E.outCubic(lt / a)), zoom: lerp(0.98, 9, k), rot: -0.01 + 0.08 * k };
    cityWorld(cam, t, { oursSitting: true });
    return { zblur: 0.25 * k, zcx: 540, zcy: 960, flash: k > 0.85 ? (k - 0.85) * 4 : 0, grain: 1 };
  }
  screenSpace();
  const bg = ctx.createRadialGradient(540, 900, 30, 540, 960, 1200);
  bg.addColorStop(0, '#1A1240'); bg.addColorStop(1, '#040312');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  if (lt < b) {
    // flying through the head outline into the glowing brain
    const k = inv(a, b, lt);
    const z = lerp(0.9, 3.4, E.inCubic(k));
    headProfile(540 - 60 * z, 960 - 90 * z, 1.25 * z, 1 - k * 0.6);
    drawBrain(540 + 20 * z, 900 + 20 * z, 0.55 * z, t, { act: 0.8, calm: 0.2 });
    return { zblur: 0.2 + 0.2 * k, zcx: 540, zcy: 900, flash: lt - a < 0.08 ? 0.8 * (1 - (lt - a) / 0.08) : 0, grain: 1 };
  }
  const k = E.outCubic(inv(b, D, lt));
  headProfile(540 - 60 * 1.1, 960 - 90, 1.25 * lerp(1.5, 1.1, k), 0.35 * k);
  drawBrain(540, lerp(840, 800, k), lerp(1.8, 1.25, k), t, { act: 0.9, calm: 0.15 });
  return { zblur: -0.12 * (1 - k), zcx: 540, zcy: 820, grain: 1 };
};
