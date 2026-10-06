// Why Does Spicy Food BURN? Short: the shots at the chilli stall. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds
// inside the shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
// The shots inside his mouth and his brain are in scenes_in.js, the garden in scenes_out.js.
'use strict';

const cu = () => TLd.cues;
// e^(-k (t - t0)) after t0, else 0
const decay = (t, t0, k) => (t >= t0 ? Math.exp(-(t - t0) * k) : 0);
function blinkAt(t, seed = 1, every = 3.1) { const p = ((t + seed * 1.37) % every) / every; return p > 0.955 ? 1 : 0; }

const FACE_EAGER = Object.assign({}, FACES.calm, { mouth: 'none', lookX: 0.55, lookY: 0.5, browY: 1.0, browTilt: -0.25, eyeOpen: 1.08, blink: 0.18 });
const FACE_MMM = Object.assign({}, FACES.calm, { mouth: 'none', blink: 1, browY: 1.15, browTilt: -0.35 });
const FACE_UHOH = Object.assign({}, FACES.startled, { mouth: 'o', mouthOpen: 0.3, eyeOpen: 1.5, pupil: 0.48, lookX: 0, lookY: 0.15, browY: 1.5, browTilt: 0.55 });
const FACE_BURN = Object.assign({}, FACES.shock, { mouthOpen: 1, eyeOpen: 1.5, pupil: 0.4, browY: 1.65, browTilt: 0.95, tear: 0.7 });
const FACE_THERMO = Object.assign({}, FACES.annoyed, { mouth: 'flat', mouthOpen: 0, lookX: 0.55, lookY: 0.95, blink: 0.2, browY: 0.4, browTilt: 0.95, eyeOpen: 1.1, cross: 0 });
const FACE_SOAK = Object.assign({}, FACES.annoyed, { mouth: 'flat', mouthOpen: 0, lookX: 0, lookY: -0.9, blink: 0.3, browY: -0.1, browTilt: -0.2, eyeOpen: 1.0 });
const FACE_GLARE = Object.assign({}, FACES.annoyed, { mouth: 'wavy', mouthOpen: 0.3, lookX: 0.95, lookY: -0.15, blink: 0.36, browY: -0.3, browTilt: -0.9 });
const FACE_TARGET = Object.assign({}, FACES.nervous, { lookX: 0, lookY: -1, eyeOpen: 1.3, pupil: 0.6, cross: 1 });
const FACE_WANT = Object.assign({}, FACES.grin, { lookX: 0.9, lookY: 0.55, browY: 1.1, browTilt: -0.3, mouthOpen: 0.9 });

// where frame 1 is shot from: close on his mouth and the chilli between his teeth
const CAM_BITE = [530, 846, 2.9];
// where his hand picks a chilli off the heap (rig-local), and where it rests with one
const ST_PICK = [226, -196], ST_HOLD = [150, -168], ST_LAP_L = [-143, -5], ST_LAP_R = [143, -5];

// His state around the bite, as a function of tt = seconds since the teeth closed (negative = the chilli is on its way
// up: the last frames of the Short are tt < 0, so the picture loops). Returns stHero options (+ fire levels).
function biteState(tt, t) {
  const c = cu();
  const open = tt <= 0 ? ramp(tt, -0.36, -0.1, E.outCubic) : 1 - ramp(tt, 0, 0.085, E.inCubic);
  const up = tt <= 0 ? ramp(tt, -0.44, -0.05, E.inOutSine) : 1 - ramp(tt, 0.2, 0.62, E.inOutSine);   // the chilli is at his mouth
  const burnt = ramp(tt, c.flush, c.flush + 0.1);                       // he notices
  const fl = ramp(tt, 0.42, c.lick + 0.7, E.inOutSine);                  // the red climbs (it starts while he is still chewing, eyes shut)
  const lick = ramp(tt, c.lick, c.fire - 0.15, E.inCubic);               // flames at his lips
  const blast = ramp(tt, c.fire, c.fire + 0.1, E.outCubic) * (1 - 0.72 * ramp(tt, c.fire_end, c.fire_end + 0.36, E.inOutSine));
  const chew = tt > 0.085 ? Math.sin(tt * 26) * (1 - burnt) : 0;
  let face = tt <= 0.02 ? FACE_EAGER : lerpFace(FACE_EAGER, FACE_MMM, ramp(tt, 0.02, 0.14));
  if (burnt > 0) face = lerpFace(FACE_UHOH, FACE_BURN, Math.max(ramp(tt, c.lick + 0.1, c.lick + 0.5) * 0.55, blast));
  const pan = burnt * (1 - blast);                                        // he fans his mouth with his left hand
  const hero = {
    face, chew, flush: fl,
    chilli: { bitten: tt > 0.05 ? 1 : 0, rot: -1.9 + 0.5 * blast + 0.1 * Math.sin(tt * 30) * burnt }, atMouth: up,
    right: tt <= 0 ? [lerp(ST_PICK[0], ST_HOLD[0], 0.2), ST_PICK[1]] : [ST_HOLD[0] + 26 * blast, ST_HOLD[1] - 34 * blast + 5 * Math.sin(tt * 31) * burnt],
    left: pan > 0.01 ? [lerp(ST_LAP_L[0], -92 + 26 * Math.sin(tt * 34), pan), lerp(ST_LAP_L[1], -236 + 16 * Math.cos(tt * 34), E.outCubic(pan))] : null,
    headDY: (tt > 0 ? 5 * Math.abs(chew) * (1 - burnt) : 0) - 16 * blast + 4 * Math.sin(tt * 38) * burnt * (1 - blast),
    headDX: 3 * Math.sin(tt * 43) * burnt * (1 - blast) - 12 * blast,
    headRot: -0.05 * up * (1 - burnt) - 0.2 * blast, lean: -0.05 * blast,
    frizz: 0.9 * blast + 0.3 * lick, jolt: 0.6 * decay(tt, c.flush, 5) * Math.cos((tt - c.flush) * 20) + blast * 0.5,
    fireLight: Math.max(0.35 * lick, blast),
  };
  if (!burnt) hero.jaw = open;
  return { hero, open, up, burnt, fl, lick, blast };
}

// "CRUNCH!" beside the bite, and the bits that fly off it (screen space). ps = the mouth on screen, z = the zoom
function crunchBurst(tt, ps, z) {
  if (tt < 0.03 || tt > 0.95) return;
  const d = tt - 0.03, sc = z / 2.5;
  ctx.save(); ctx.globalAlpha = 1 - ramp(d, 0.55, 0.9);
  bigWord('CRUNCH!', Math.min(ps[0] + 226 * sc, 778), ps[1] - 372 * sc, 104 * sc, '#FFD447', springStep(d, 6, 0.42), 0.09);
  ctx.restore();
  screenSpace();
  const rng = mulberry32(17);
  for (let i = 0; i < 9; i++) {
    const a = -0.9 + rng() * 2.2, v = (300 + rng() * 520) * sc, px = ps[0] + 26 * sc + Math.cos(a) * v * d, py = ps[1] + Math.sin(a) * v * d * 0.7 - 160 * sc * d + 0.5 * 2200 * sc * d * d;
    ctx.save(); ctx.translate(px, py); ctx.rotate(rng() * 6 + d * 9); ctx.globalAlpha = clamp(1.2 - d * 1.6);
    ctx.fillStyle = i % 3 ? '#E3182B' : '#FFB59A'; ctx.beginPath(); ctx.moveTo(-9 * sc, -6 * sc); ctx.lineTo(10 * sc, -2 * sc); ctx.lineTo(-3 * sc, 9 * sc); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  shockLines(ps[0] + 30 * sc, ps[1], 70 * sc, inv(0.03, 0.4, tt), 9, '#FFFFFF', 3);
}
// sweat beads that pop out on his forehead and temples (under the camera)
function burnSweat(h, t, k, n = 4) {
  if (k <= 0.01) return;
  const spots = [[-92, -44, 0], [88, -62, 0.45], [-70, -98, 0.7], [104, -6, 0.2], [-104, 10, 0.85]];
  for (let i = 0; i < n; i++) {
    const [dx, dy, ph] = spots[i], p = ((t * 0.95 + ph) % 1);
    sweatDrop(ctx, h.head[0] + dx, h.head[1] + dy + 62 * p, 0.8, k * Math.sin(Math.PI * p));
  }
}

// ---------------------------------------------------------------- 1. hook: he bites one chilli ... and breathes fire
SC.hook = (lt, t, shot) => {
  const c = cu(), S = biteState(t, t);
  const [qx, qy] = shake(t, 5 * S.burnt * (1 - S.blast) + 20 * S.blast * (0.4 + 0.6 * decay(t, c.fire, 3)), 30, 3);
  const cam = camKeys(t, [[0, ...CAM_BITE], [0.7, 540, 846, 2.62], [c.lick + 0.4, 556, 850, 2.05], [c.fire - 0.04, 566, 850, 1.84], [c.fire + 0.16, 640, 834, 1.27], [shot.end, 648, 830, 1.22]], E.inOutCubic);
  cam.sx = qx; cam.sy = qy;
  const h = stallScene(cam, t, { warm: 1 - 0.35 * S.blast, fire: S.blast, hero: S.hero });
  const ms = toScreen(cam, h.mouth[0], h.mouth[1]);
  // steam out of his ears, then the flames
  const st = ramp(t, c.lick + 0.1, c.lick + 0.5), jet = ramp(t, c.fire - 0.5, c.fire);
  earSteam(h.earL[0], h.earL[1], -1, t, st, jet, 1); earSteam(h.earR[0], h.earR[1], 1, t, st * (1 - 0.6 * S.blast), jet, 2);
  if (h.cap) for (const [sd, t0] of [[1, 0.28], [2, 0.6]]) smokeCurl(h.cap[0] - 40, h.cap[1] - 20, inv(t0, t0 + 1.3, t), t, sd, '#E9E4F0');
  burnSweat(h, t, S.burnt * (1 - S.blast));
  const ang = -0.44 + h.hr + 0.05 * Math.sin(t * 13);
  if (S.blast > 0.01) fireJet(h.mouth[0] + 8, h.mouth[1] - 4, ang, 560, 132, t, S.blast, 3);
  else if (S.lick > 0.01) for (const [dx, dy, a, m, sd] of [[-24, -2, -2.78, 1, 5], [24, -2, -0.36, 1, 6], [0, 6, 1.5, 0.5, 7]]) fireJet(h.mouth[0] + dx, h.mouth[1] + dy, a + 0.16 * Math.sin(t * 17 + sd), (56 + 120 * S.lick) * m, (16 + 20 * S.lick) * m, t, 0.35 + 0.65 * S.lick, sd);
  screenSpace();
  crunchBurst(t, ms, cam.zoom);
  const hit = decay(t, c.fire, 9);
  return { glow: 0.9, flash: 0.2 * hit, zblur: 0.06 * decay(t, 0.02, 8) + 0.16 * hit, zcx: ms[0], zcy: ms[1] };
};

// a temperature tag with a green tick (screen space), and a dotted leader to what it reads
function tempTag(x, y, k, to) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2);
  if (to && k > 0.4) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.setLineDash([9, 10]); line(ctx, x - 40, y + 50, to[0], to[1], 4, rgba('#4DFFB4', 0.85)); ctx.setLineDash([]); ctx.restore(); }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.rotate(-0.05); ctx.scale(s, s);
  rrect(ctx, -176, -56, 352, 112, 56); ctx.fillStyle = 'rgba(6,26,22,0.92)'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#4DFFB4'; ctx.stroke();
  ctx.font = '900 66px Montserrat'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#4DFFB4'; ctx.fillText('37°C', -146, 3);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 13; ctx.beginPath(); ctx.moveTo(76, 2); ctx.lineTo(100, 26); ctx.lineTo(142, -24); ctx.stroke();
  ctx.restore();
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); softDot(gctx, x, y, 240, '#4DFFB4', 0.3 * clamp(k)); gctx.restore();
}

// ---------------------------------------------------------------- 2. calm: no flames. A thermometer in his mouth says 37
SC.calm = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 590, y: 896, zoom: 1.8 + 0.07 * lt / D, rot: 0 };
  const look = ramp(t, c.tick - 0.1, c.tick + 0.12, E.inOutCubic);      // his eyes go from the thermometer to us
  const face = Object.assign({}, FACE_THERMO, { lookX: lerp(0.55, 0, look), lookY: lerp(0.95, 0, look), blink: Math.max(0.2, blinkAt(t, 2, 1.7)) });
  const h = stallScene(cam, t, { hero: { face, flush: 1, thermo: springStep(lt + 0.02, 5, 0.5), frizz: 0.5 } });
  for (const [dx, sd] of [[-40, 1], [30, 2], [84, 3]]) smokeCurl(h.top[0] + dx, h.top[1] + 26, inv(shot.start - 0.1, shot.start + 1.5 + 0.2 * sd, t), t, sd);
  burnSweat(h, t, 1, 3);
  const tip = toScreen(cam, h.mouth[0] + 214, h.mouth[1] + 96);
  tempTag(766, 548, springStep(t - c.nothing - 0.12, 4.2, 0.5), tip);
  return { glow: 0.82, flash: 0.26 * (1 - ramp(lt, 0, 0.09)) };
};

// a little four-point sparkle (screen space)
function tinkle(x, y, r, k, col = '#FFFFFF') {
  if (k <= 0 || k >= 1) return;
  const s = Math.sin(Math.PI * k) * r;
  for (const [cc, sc] of [[ctx, 1], [gctx, 0.5]]) {
    cc.save(); cc.setTransform(sc, 0, 0, sc, 0, 0); cc.translate(x, y); cc.rotate(k * 1.2);
    cc.fillStyle = col; cc.beginPath();
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, rr = i % 2 ? s * 0.22 : s; cc.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    cc.closePath(); cc.fill(); cc.restore();
  }
}

// ---------------------------------------------------------------- 7. sweat: the sprinkler on his head. The subscribe aside plays over this shot
SC.sweat = (lt, t, shot) => {
  const c = cu();
  const cam = camKeys(t, [[shot.start, 548, 836, 1.66], [c.sub_in, 572, 832, 1.5], [shot.end, 580, 830, 1.56]], E.inOutCubic);
  const pop = springStep(t - c.sprinkler + 0.05, 5, 0.42);
  const up = ramp(t, c.sub_in - 0.15, c.sub_in + 0.3, E.outBack);         // he holds the chilli up and looks at it
  const wink = t >= c.meant && t < c.meant_end + 0.5;
  let face = lerpFace(FACE_SOAK, FACE_GLARE, ramp(t, c.sub_in, c.sub_in + 0.25));
  face = Object.assign({}, face, { lookY: lerp(face.lookY, -0.15, ramp(t, c.sub_in, c.sub_in + 0.2)), blink: Math.max(face.blink, blinkAt(t, 5, 2.3)) });
  const h = stallScene(cam, t, {
    hero: {
      face, flush: 1, sprinkler: pop, frizz: 0.2,
      chilli: up > 0.02 ? { guy: { mood: wink ? 'wink' : t > c.meant_end + 0.5 ? 'evil' : 'smug', look: wink ? [0, 0] : [-0.9, 0.1], lean: 0.05 * Math.sin(t * 5), s: 0.66 } } : null,
      right: up > 0.02 ? [lerp(ST_LAP_R[0], 152, up), lerp(ST_LAP_R[1], -266, up)] : null, headRot: 0.05 * up, headDY: 5 * decay(t, c.sprinkler, 6) * Math.cos((t - c.sprinkler) * 22),
    },
  });
  const spr = clamp(pop) * (0.4 + 0.6 * (1 - ramp(t, c.sub_in - 0.2, c.sub_in + 0.4)));
  sprinklerSpray(h.top[0], h.top[1] - 58, t, spr, 1);
  burnSweat(h, t, 0.9, 5);
  const ts = toScreen(cam, h.top[0], h.top[1] - 60);
  screenSpace();
  const lk = springStep(t - c.sprinkler - 0.28, 4.5, 0.5) * (1 - ramp(t, c.the_chilli - 0.1, c.the_chilli + 0.1));
  if (lk > 0.01) { leader([760, 556], [ts[0] + 44, ts[1] - 6], clamp(lk * 1.5), '#7FE9FF'); pill(800, 520, 'SWEAT', '#7FE9FF', lk, 58); }
  if (h.cap) { const cs = toScreen(cam, h.cap[0], h.cap[1]); tinkle(cs[0] + 30, cs[1] - 112 * cam.zoom / 1.5, 54, inv(c.meant + 0.02, c.meant + 0.5, t), '#FFF6B8'); }
  return { glow: 0.82, flash: 0.22 * (1 - ramp(lt, 0, 0.08)) };
};

// the vendor's arm that pushes the heap in from the right (under the camera): x = where the hand is
function vendorArm(x, y, k) {
  if (k <= 0.01) return;
  const c = ctx;
  line(c, x + 30, y, x + 620, y + 26, 74, '#F3EDE2'); line(c, x + 40, y + 16, x + 620, y + 42, 30, 'rgba(120,110,130,0.35)');
  line(c, x + 2, y, x + 40, y + 2, 78, '#D9D2C4');
  ellipse(c, x - 14, y, 44, 36, '#B9744F'); ellipse(c, x - 16, y - 3, 40, 31, '#D99A72');
  for (let i = 0; i < 3; i++) line(c, x - 44, y - 16 + i * 14, x - 20, y - 18 + i * 14, 3, 'rgba(120,60,40,0.5)');
}

// ---------------------------------------------------------------- 9. button: the crosshair is on him; the heap arrives; he bites one (the loop)
SC.button = (lt, t, shot) => {
  const c = cu(), DUR = TLd.duration, tt = t - DUR;
  const S = biteState(tt, t);
  const back = ramp(t, c.loop - 0.12, DUR - 0.04, E.inOutCubic);          // the camera goes back to frame 1
  const cam = camKeys(t, [[shot.start, 748, 966, 1.18], [c.ordered, 758, 970, 1.21], [c.loop - 0.12, 762, 970, 1.23], [DUR - 0.04, ...CAM_BITE], [DUR, ...CAM_BITE]], E.inOutCubic);
  const slide = springStep(t - c.ordered + 0.1, 3.4, 0.55);              // the heap slides in
  const [qx, qy] = shake(t, 9 * decay(t, c.ordered + 0.06, 7), 30, 9);
  cam.sx = qx; cam.sy = qy;
  const see = ramp(t, c.ordered - 0.05, c.ordered + 0.18, E.inOutCubic), want = ramp(t, c.extra, c.extra + 0.2);
  const reach = ramp(t, c.extra_end - 0.1, c.loop - 0.02, E.inOutCubic);
  let hero;
  if (tt > -0.46) hero = S.hero;
  else {
    let face = lerpFace(FACE_TARGET, Object.assign({}, FACES.startled, { lookX: 0.95, lookY: 0.6, mouthOpen: 0.5 }), see);
    face = lerpFace(face, FACE_WANT, want);
    face = lerpFace(face, FACE_EAGER, ramp(t, c.loop - 0.2, c.loop));
    hero = {
      face: Object.assign({}, face, { blink: Math.max(face.blink || 0, blinkAt(t, 6, 2.1) * (1 - see)) }),
      flush: 1 - ramp(t, c.ordered, c.extra_end, E.inOutSine), headRot: 0.05 * see - 0.02 * want, headDX: 4 * see,
      right: reach > 0.01 ? [lerp(ST_LAP_R[0], lerp(ST_PICK[0], ST_HOLD[0], 0.2), reach), lerp(ST_LAP_R[1], ST_PICK[1], reach) - 30 * Math.sin(Math.PI * reach)] : null,
      left: want * (1 - reach) > 0.01 ? [lerp(ST_LAP_L[0], -128, want * (1 - reach)), lerp(ST_LAP_L[1], -150 - 14 * Math.sin(t * 16), want * (1 - reach))] : null,
    };
    if (ramp(t, c.loop - 0.2, c.loop) > 0.5) hero.jaw = 0;
  }
  const h = stallScene(cam, t, { hero, plate: false, heap: { x: 640 * (1 - slide), flag: springStep(t - c.extra, 4.2, 0.4), wob: 0.05 * decay(t, c.ordered + 0.1, 5) * Math.sin((t - c.ordered) * 26) } });
  applyCam(cam);
  const push = 1 - ramp(t, c.ordered + 0.34, c.ordered + 0.9, E.inCubic);
  vendorArm(ST.heap[0] + 196 + 640 * (1 - slide) + 700 * (1 - push), ST.heap[1] - 72, t > c.ordered - 0.3 ? 1 : 0);
  burnSweat(h, t, 1 - see, 3);
  // the crosshair from the garden finds him
  const hs = toScreen(cam, h.head[0], h.head[1] - 20);
  const rk = 1 - ramp(t, c.ordered - 0.12, c.ordered + 0.06), arrive = ramp(t, shot.start, c.you - 0.04, E.outCubic);
  screenSpace();
  reticle(lerp(-140, hs[0], arrive), lerp(hs[1] - 240, hs[1], arrive), 132, rk, t, ramp(t, c.you - 0.04, c.you + 0.1), 'MAMMAL');
  const ms = toScreen(cam, h.mouth[0], h.mouth[1]);
  return { glow: 0.85, flash: 0.2 * (1 - ramp(lt, 0, 0.08)) + 0.1 * decay(t, c.ordered + 0.06, 12), zblur: 0.1 * back * (1 - ramp(t, DUR - 0.08, DUR)), zcx: ms[0], zcy: ms[1] };
};

// ---------------------------------------------------------------- the cover (rendered on its own, not in the timeline)
SC.cover = (lt, t, shot) => {
  const c = cu(), tt = c.fire + 0.5, cam = { x: 648, y: 846, zoom: 1.78, rot: 0 };
  const S = biteState(tt, tt);
  S.hero.face = Object.assign({}, FACE_BURN, { tear: 0.4 });
  const h = stallScene(cam, tt, { warm: 0.7, fire: 1, hero: S.hero, plate: false });
  earSteam(h.earL[0], h.earL[1], -1, tt, 1, 1, 1);
  fireJet(h.mouth[0] + 8, h.mouth[1] - 4, -0.5 + h.hr, 600, 150, tt, 1, 3);
  screenSpace();
  bigWord('WHY DOES', 330, 520, 122, '#FFFFFF', 1, -0.04);
  bigWord('SPICY FOOD', 540, 1218, 156, '#FFD447', 1, -0.03);
  bigWord('BURN?', 610, 1392, 216, '#FF5A3C', 1, 0.03);
  return { glow: 0.9, noCaptions: true, noSubscribe: true, grain: 0 };
};

function initScenes2() {
  initStall();
  if (typeof initMouth === 'function') initMouth();
  if (typeof initGarden === 'function') initGarden();
  for (const id of ['alarm', 'sensor', 'key', 'brain', 'garden']) if (!SC[id]) SC[id] = SC.calm;   // (while the worlds are being built)
}
