// Was Cleopatra Closer to the Pyramids or the MOON Landing? 🚀 Short: the shots. Each SC.<id>(lt, t, shot) draws one
// frame (lt = seconds inside the shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash, overlay: fn,
//    noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
// The worlds are in cm_world.js, the cast and the graphics in cm_cast.js; the hero is jupiter-no-ground's spacesuit
// (jphero.js) with his selfie stick.
'use strict';

const cu = () => TLd.cues;
const cmSince = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);
const cmSm = (x) => x * x * (3 - 2 * x);

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the Moon: a hard, low sun from the upper left (Apollo 11 landed in the lunar morning), black sky, a cool rim from Earth
const CM_MOONL = { ...LIGHTS.day, key: [-0.55, -0.6, 0.58], keyTint: [1.06, 1.04, 1.0], shadowTint: [0.56, 0.6, 0.86], shadowDeep: 1.45,
  rimFrom: [0.9, -0.3], rim: [0.55, 0.75, 1.0], rimAmt: 1.2, pool: 0.3, poolTint: [0.3, 0.32, 0.62], halo: 0.06 };
// Giza at dusk: the sun low on the right
const CM_GIZAL = { ...LIGHTS.sunset, rimAmt: 1.4, pool: 0.32 };
// the time rope: sunset low down, night in the middle, the Moon's light at the top
const CM_NIGHTL = { ...LIGHTS.night, rim: [0.9, 0.6, 1.0], rimAmt: 1.2, pool: 0.35 };
function cmRopeLight(camY) { return camY > -800 ? CM_GIZAL : camY > -2050 ? CM_NIGHTL : CM_MOONL; }
const CM_ARCL = { ...LIGHTS.day, key: [-0.4, -0.7, 0.6], keyTint: [0.98, 1.02, 1.08], rim: [0.8, 0.9, 1.0], rimAmt: 0.9 };
setLights({
  hook: CM_MOONL, button: CM_MOONL, loop: CM_MOONL, cover: CM_MOONL, giza: CM_GIZAL,
  climb: (lt, t) => cmRopeLight(climbCam(t).y),
  payoff: (lt, t) => (payCam(t).zoom > 0.5 ? CM_MOONL : { ...LIGHTS.diagram, pool: 0.15, halo: 0 }),
  past: (lt, t) => (t < cu().land - 0.2 ? cmRopeLight(pastCam(t).y) : CM_GIZAL),
});

// ---------------------------------------------------------------- the hero (jupiter-no-ground's spacesuit)
const CM_POSE = { hipY: -222, lean: 0, armL: { a: 0.3, b: 0.5 }, armR: { a: 0.3, b: 0.5 }, legL: { a: 0.06, b: -0.08 },
  legR: { a: 0.06, b: -0.08 }, hand: 'open', feetFront: 1 };
const HF = {
  grin: Object.assign({}, FACES.grin, { lookX: -0.7, lookY: -0.8, mouthOpen: 0.85, browY: 0.8 }),
  cheese: Object.assign({}, FACES.grin, { lookX: -0.6, lookY: -0.9, mouthOpen: 1, browY: 1.0, eyeOpen: 1.1 }),
  side: Object.assign({}, FACES.calm, { lookX: 1, lookY: -0.1, mouth: 'flat', mouthOpen: 0.2, browY: 0.7, browTilt: -0.3 }),
  come: Object.assign({}, FACES.grin, { lookX: 0, lookY: 0.1, mouthOpen: 0.6, browY: 0.9 }),
  push: Object.assign({}, FACES.nervous, { lookX: 0, lookY: -1, browY: 0.9, browTilt: 1, mouth: 'grimace', mouthOpen: 0.7 }),
  pant: Object.assign({}, FACES.nervous, { lookX: -0.9, lookY: 0, blink: 0.4, browY: 0.8, browTilt: 1, mouth: 'o', mouthOpen: 0.8 }),
  up: Object.assign({}, FACES.startled, { lookX: -0.2, lookY: -1, mouth: 'o', mouthOpen: 0.5 }),
  whee: Object.assign({}, FACES.grin, { lookX: 0, lookY: 0.5, mouthOpen: 1, browY: 1.2, eyeOpen: 1.2 }),
  shock: Object.assign({}, FACES.startled, { lookX: 1, lookY: 0, mouth: 'o', mouthOpen: 0.9, eyeOpen: 1.4 }),
  look: Object.assign({}, FACES.calm, { lookX: 1, lookY: 0, mouth: 'flat', mouthOpen: 0.2, browY: 0.5 }),
  meh: Object.assign({}, FACES.annoyed, { lookX: 0, lookY: 0.15, blink: 0.38, browTilt: -0.3, browY: -0.2, mouth: 'flat', mouthOpen: 0 }),
  ok: Object.assign({}, FACES.calm, { lookX: 0, lookY: 0.05, blink: 0.2, browY: 0.3, mouth: 'flat', mouthOpen: 0.1 }),
  wince: Object.assign({}, FACES.nervous, { lookX: 0.6, lookY: 0.2, blink: 0.5, browY: 0.8, browTilt: 1.0, mouth: 'grimace', mouthOpen: 0.9 }),
};
function cmHFaceAt(keys, t) {
  let f = keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t >= keys[i][0]) f = lerpFace(keys[i - 1][1], keys[i][1], clamp((t - keys[i][0]) / 0.12));
  return f;
}
// H: {x, y, s, face, pose, armL, armR, handL, handR, stick, lean, headRot, sweat, rot}
function cmHero(cam, t, H) {
  const pose = JSON.parse(JSON.stringify(H.pose || CM_POSE));
  pose.lean = (H.lean || 0) + (pose.lean || 0);
  return jpHero(cam, t, { x: H.x, y: H.y, s: H.s || 1, face: H.face || HF.ok, pose, armL: H.armL, armR: H.armR,
    handL: H.handL || 'open', handR: H.handR || 'open', stick: H.stick, headRot: H.headRot || 0, headDY: H.headDY || 0,
    sweat: H.sweat || 0, rot: H.rot || 0, scarf: H.scarf, scarfSide: 1, post: H.post });
}

// ---------------------------------------------------------------- THE HOOK: the selfie on the Moon (valid at negative time)
// tt = seconds since frame 1. Cleopatra (sunglasses, peace sign, duck face) leans in; he holds the stick up and grins.
// "Nope.": the FLASH, and the picture freezes in a white photo frame until the cut.
const CM_HOOKCAM = { x: 505, y: 1030, zoom: 2.0 };
function hookCam(tt) {
  const c = cu();
  if (tt < 0) {                                       // the loop: from the button's last framing into frame 1
    const u = E.inOutCubic(inv(-0.45, -0.04, tt)), b = btnCam(TLd.duration - 0.45);
    return { x: lerp(b.x, CM_HOOKCAM.x, u), y: lerp(b.y, CM_HOOKCAM.y, u), zoom: lerp(b.zoom, CM_HOOKCAM.zoom, u), rot: 0 };
  }
  const tf = Math.min(tt, c.flash), push = clamp(tf / 4.2);
  const sh = shake(tt, 5 * cmSince(tt, c.flash, 8), 20, 3);
  return { x: CM_HOOKCAM.x + 4 * push + sh[0] / 2, y: CM_HOOKCAM.y - 6 * push + sh[1] / 2, zoom: CM_HOOKCAM.zoom + 0.09 * E.inOutSine(push), rot: 0 };
}
// the two of them in the selfie (tt: the time to act at; frozen after the flash)
function selfieState(tt) {
  const c = cu();
  const a = Math.min(tt, c.flash);
  const wig = 0.06 * Math.sin(a * 9) * clamp(inv(c.cleo1, c.cleo1 + 0.2, a)) * (1 - clamp(inv(c.pyr1 - 0.2, c.pyr1, a)));
  const thumb = E.outBack(inv(c.moon1 - 0.05, c.moon1 + 0.25, a), 1.6);
  const bob = 6 * Math.sin(a * 3.1);
  return {
    hface: cmHFaceAt([[-1, HF.grin], [c.pyr1 + 0.05, HF.side], [c.moon1 - 0.05, HF.cheese]], a),
    cface: cmFaceAt([[-1, CF.duck], [c.cleo1, CF.smile], [c.pyr1 + 0.1, CF.sly], [c.moon1, CF.duck]], a),
    stick: [-104, -706 + bob], peace: wig, thumb,
  };
}
function moonScene(cam, t, S, o = {}) {
  cmMoonBack(cam, t, { earth: [742, 802, 52], lm: [905, 1272, 0.5], flag: [168, 1290, 0.55] });
  applyCam(cam);
  // they bob to the selfie groove (92 BPM; loopW keeps it seamless across the loop)
  const bw = loopW(Math.PI * 92 / 60), bobC = 0.022 * Math.sin(t * bw), bobH = 0.018 * Math.sin(t * bw + 1.9);
  // her first (she stands a step behind his right shoulder), then him
  cmCleo(ctx, MN.cx, MN.gy, 1, t, { face: S.cface, lean: -0.12 + bobC, headRot: -0.16 + (S.headRot || 0) + 0.6 * bobC, glasses: S.glasses === undefined ? 1 : S.glasses,
    glassesY: S.glassesY || 0, bubble: S.bubble || 0, pop: S.pop || 0,
    armR: S.armR || { w: [58 + 30 * S.peace, -548], bend: 1 }, handR: S.handR || 'peace',
    armL: S.armL || { w: [-80, -250], bend: 1 }, handL: S.handL || 'open' });
  const hr = cmHero(cam, t, { x: MN.hx, y: MN.gy, s: 1, face: S.hface, headRot: 0.08 + bobH, lean: bobH,
    armL: { e: [-150, -384], w: [-138, -560] }, handL: 'open', stick: S.stick,
    armR: S.thumb > 0.02 ? { e: [130, -300], w: [lerp(150, 96, S.thumb), lerp(-260, -430, S.thumb)] } : { e: [120, -290], w: [140, -200] },
    handR: S.thumb > 0.3 ? 'thumb' : 'open', post: o.heroPost });
  return hr;
}
function hookDraw(tt, t) {
  const c = cu(), cam = hookCam(tt), S = selfieState(tt);
  moonScene(cam, tt >= c.flash ? c.flash : t, S);
  const fl = tt >= 0 ? cmSince(tt, c.flash, 7) : 0;
  const frozen = tt >= c.flash + 0.06 ? clamp(inv(c.flash + 0.06, c.flash + 0.2, tt)) : 0;
  return { glow: 0.85, flash: 0.9 * fl, push: { k: 1 + 0.015 * clamp(tt / 4), cx: 540, cy: 900 },
    overlay: frozen > 0 ? () => { screenSpace(); const m = 34 * frozen; ctx.lineWidth = 2 * m; ctx.strokeStyle = '#FBF8F0'; ctx.strokeRect(0, 0, W, H); } : null };
}
SC.hook = (lt, t) => hookDraw(lt, t);
SC.loop = (lt, t) => hookDraw(t - TLd.duration, t);

// ---------------------------------------------------------------- THE ANSWER: Giza at dusk, 50 BC. She stands under the Great
// Pyramid, unimpressed: ALREADY ~2,500 YEARS OLD; "ancient history.": a huge yawn, and a tumbleweed rolls by
const GZ = { cx: 640, gy: 1720, hor: 1600, pyr: [420, 560, 900, 1040] };
function gizaCam(t) {
  const c = cu(), t0 = TLd.shots.find((s) => s.id === 'giza').start;
  const k1 = E.outCubic(inv(t0, t0 + 0.35, t));                                   // the whip in from the flash, on her face
  const k2 = E.inOutCubic(inv(c.pyr2 - 0.3, c.pyr2 + 0.7, t));                    // pull back: the pyramid towers behind her
  const k3 = E.inOutCubic(inv(c.ancient - 0.45, c.ancient + 0.2, t));             // back in for the yawn
  let x = 610, y = 1250, z = lerp(2.6, 2.0, k1);
  x = lerp(x, 560, k2); y = lerp(y, 1150, k2); z = lerp(z, 0.95, k2);
  x = lerp(x, 600, k3); y = lerp(y, 1290, k3); z = lerp(z, 1.55, k3);
  const sh = shake(t, 3 * cmSince(t, c.history, 6), 18, 2);
  return { x: x + sh[0] / z, y: y + sh[1] / z, zoom: z, rot: 0 };
}
function gizaScene(cam, t, o = {}) {
  const horS = toScreen(cam, 0, GZ.hor)[1];
  const sun = toScreen(cam, 1250, 1210);
  cmGizaSky(t, horS, sun[0], sun[1]);
  applyCam(cam);
  // the two smaller pyramids far off on the left, then the Great Pyramid (smooth white casing in her day, gold at dusk)
  cmPyramid(ctx, -230, 1120, 470, 480, { lit: '#E8AE82', shade: '#A86E6A', front: 0.22, courses: 0 });
  cmPyramid(ctx, -620, 1330, 270, 270, { lit: '#E2A47E', shade: '#A26A68', front: 0.22 });
  const P = GZ.pyr;
  cmPyramid(ctx, P[0], P[1], P[2], P[3], { lit: '#F4CD8C', shade: '#B4705A', front: 0.16, courses: 22 });
  // the desert: dunes in bands, then the sand she stands on
  for (const [dy, col, amp, f, ph] of [[0, '#E9A86E', 14, 0.004, 1], [50, '#DC9A62', 22, 0.003, 2.2]]) {
    ctx.beginPath(); ctx.moveTo(-2000, 2600);
    for (let x = -2000; x <= 2600; x += 40) ctx.lineTo(x, GZ.hor + dy - amp * Math.sin(x * f + ph));
    ctx.lineTo(2600, 2600); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  }
  ctx.beginPath(); ctx.moveTo(-2000, GZ.gy - 60); ctx.quadraticCurveTo(600, GZ.gy - 90, 2600, GZ.gy - 50); ctx.lineTo(2600, 3000); ctx.lineTo(-2000, 3000); ctx.closePath();
  const g = ctx.createLinearGradient(0, GZ.gy - 90, 0, GZ.gy + 400); g.addColorStop(0, '#E6A86C'); g.addColorStop(1, '#C07848');
  ctx.fillStyle = g; ctx.fill();
  paint(() => { const rng = mulberry32(42); for (let i = 0; i < 40; i++) { const x = -400 + 1800 * rng(), y = GZ.gy - 60 + 400 * rng(); line(ctx, x, y, x + 40 + 40 * rng(), y - 4, 3, 'rgba(255,220,170,0.4)'); } });
  for (const [x0, s] of [[-420, 1.3], [-250, 1.0], [1350, 1.2]]) cmPalm(ctx, x0, GZ.hor + 40, s, t);
  return { horS };
}
SC.giza = (lt, t, shot) => {
  const c = cu(), cam = gizaCam(t);
  gizaScene(cam, t);
  applyCam(cam);
  // her: looking up at it (bored), then at us, then the yawn with a hand over her mouth
  const yk = E.outCubic(inv(c.yawn, c.yawn + 0.35, t)) * (1 - E.inOutCubic(inv(c.yawn_end - 0.1, c.yawn_end + 0.25, t)));
  const face = cmFaceAt([[0, CF.up], [c.already, CF.bored], [c.yawn, CF.yawn], [c.yawn_end, CF.bored]], t);
  const lookUp = 1 - E.inOutCubic(inv(c.already + 0.2, c.already + 0.6, t));
  cmCleo(ctx, GZ.cx, GZ.gy, 1, t, { face: Object.assign({}, face, { lo: face.lips === 'yawn' ? yk : face.lo }), glasses: 0,
    headRot: -0.12 * lookUp + 0.05 * yk, headDY: -6 * lookUp, lean: -0.03,
    armR: { w: [lerp(70, 14, yk), lerp(-200, -432, yk)], bend: 1 }, handR: yk > 0.3 ? 'mouth' : 'open',
    armL: { w: [-60, -248], bend: 1 }, handL: 'open' });
  // the tumbleweed rolls across in front of her
  const wu = inv(c.weed, c.weed + 1.6, t);
  if (wu > 0 && wu < 1) {
    const wx = lerp(-150, 1450, wu), wy = GZ.gy + 40 - 40 * Math.abs(Math.sin(wu * Math.PI * 3));
    cmTumbleweed(ctx, wx, wy, 70, wu * 14);
  }
  // ALREADY ~2,500 YEARS OLD, on the pyramid
  const tk = popK(t, c.old_tag, shot.end + 1);
  return { glow: 0.85, zblur: 0.25 * (1 - ramp(lt, 0, 0.3)), zcx: 540, zcy: 820,
    overlay: () => cmTag('ALREADY ~2,500', 470, 560, tk, { size: 54, edge: '#FFB067', sub: 'YEARS OLD (TO HER)', subCol: '#FFD9AE', rot: -0.04 }) };
};

// ---------------------------------------------------------------- THE ONE PICTURE: the time rope. Climb 1 (to her, 2,500
// years), a pause beside her swing, climb 2 (to the Moon, 2,000 years), and onto the Moon.
const CM_HX = CM_ROPE_X + 84;                         // the hero hangs on the rope's right
function climbHeroY(t) {
  const c = cu();
  const yStart = 132, yCleo = CM_CLEO_Y + 70, yTop = cmMoonTopY(CM_HX + 30);
  if (t < c.up1) return yStart;
  if (t < c.reach1) { const u = inv(c.up1, c.reach1, t); return lerp(yStart, yCleo, u < 0.12 ? 0.5 * u * u / 0.12 : u > 0.88 ? 1 - 0.5 * (1 - u) * (1 - u) / 0.12 - 0.0 : (u - 0.06) / 0.88 * 1.0); }
  if (t < c.up2) return yCleo;
  if (t < c.reach2) { const u = inv(c.up2, c.reach2, t); return lerp(yCleo, yTop, E.inOutSine(u)); }
  return yTop;
}
function climbSpeed(t) { return (climbHeroY(t + 0.02) - climbHeroY(t - 0.02)) / 0.04; }
function climbCam(t) {
  const c = cu(), t0 = TLd.shots.find((s) => s.id === 'climb').start;
  const hy = climbHeroY(t);
  const k0 = E.inOutCubic(inv(t0, c.up1 + 0.3, t));                                // from the wide start to following him
  const yFollow = hy - 320, zF = 0.82;
  let cam = { x: lerp(600, 580, k0), y: lerp(-120, yFollow, k0), zoom: lerp(0.62, zF, k0), rot: 0 };
  // at the top: a little wider so the Moon's top and Neil are in
  const kt = E.inOutCubic(inv(c.reach2 - 0.6, c.reach2 + 0.3, t));
  cam = { x: lerp(cam.x, 600, kt), y: lerp(cam.y, CM_TOP_Y - 260, kt), zoom: lerp(cam.zoom, 0.78, kt), rot: 0 };
  return cam;
}
function climbPose(t, sp) {
  const ph = -climbHeroY(t) / 70;                                                    // the hands follow the rope's travel
  const p = JSON.parse(JSON.stringify(CM_POSE));
  p.legL = { a: 0.55 + 0.25 * Math.sin(ph * 2), b: -1.1 - 0.3 * Math.sin(ph * 2) };
  p.legR = { a: 0.2 + 0.1 * Math.cos(ph * 2), b: -0.4 };
  p.lean = -0.04;
  return { pose: p, armL: [-84, -600 + 60 * Math.sin(ph * 2)], armR: [-70, -330 - 40 * Math.sin(ph * 2)] };
}
// her swing on the rope's left at 69 BC (seat at CM_CLEO_Y)
function cleoSwing(t, o = {}) {
  const c = cu(), sx = CM_ROPE_X - 150, sy = CM_CLEO_Y;
  const sw = 0.04 * Math.sin(t * loopW(2.1));
  ctx.save(); ctx.translate(CM_ROPE_X, sy - 260); ctx.rotate(sw); ctx.translate(-CM_ROPE_X, -(sy - 260));
  line(ctx, CM_ROPE_X - 8, sy - 260, sx - 70, sy, 5, '#A8783A'); line(ctx, CM_ROPE_X - 8, sy - 260, sx + 70, sy, 5, '#A8783A');
  rrect(ctx, sx - 92, sy - 6, 184, 22, 6); ctx.fillStyle = '#8A5A2A'; ctx.fill();
  // the plaque under the seat
  rrect(ctx, sx - 96, sy + 30, 192, 52, 12); ctx.fillStyle = '#F4E4C0'; ctx.fill();
  paint(() => { ctx.font = '900 34px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#4A2A14'; ctx.fillText('69 BC', sx, sy + 57); });
  cmCleo(ctx, sx, sy + 108, 0.92, t, Object.assign({ sit: 1, face: CF.smile, glasses: 0, armL: { w: [-74, -180], bend: 1 }, armR: { w: [70, -190], bend: -1 } }, o));
  ctx.restore();
}
// the Moon at the top with what stands on it
function moonTop(t, o = {}) {
  cmMoonDisc(ctx, CM_MOON.x, CM_MOON.y, CM_MOON.R, t);
  const onTop = (x, fn) => {                                   // stand a thing on the little Moon's curve, turned to its normal
    const y = cmMoonTopY(x) + 5, a = Math.atan2(x - CM_MOON.x, CM_MOON.y - y);
    ctx.save(); ctx.translate(x, y); ctx.rotate(a); fn(); ctx.restore();
  };
  onTop(722, () => cmLM(ctx, 0, 0, 0.34, t));
  onTop(CM_ROPE_X, () => cmFlag(ctx, 0, 0, 0.5));
  onTop(452, () => cmNeil(0, 0, 0.42, t, { wave: o.wave || 0 }));
}
function ropeWorld(cam, t, o = {}) {
  cmRopeSky(cam, t);
  cmClouds(cam, t, 1);
  applyCam(cam);
  // the desert far below
  if (cam.y + 960 / cam.zoom > 1200) {
    ctx.fillStyle = '#D9925E'; ctx.fillRect(-4000, 1650, 9000, 3000);
    for (const [x, tip, hw, h] of [[-1500, 1030, 640, 640], [-2350, 1250, 420, 420], [2700, 1180, 520, 520]]) cmPyramid(ctx, x, tip, hw, h, { lit: '#E8A878', shade: '#A86A66', front: 0.2 });
  }
  if (cam.y - 960 / cam.zoom < CM_MOON.y + CM_MOON.R + 50) moonTop(t, o);
  cmPyramid(ctx, CM_PYR.x, CM_PYR.tip, CM_PYR.hw, CM_PYR.h, { lit: '#F4CD8C', shade: '#B4705A', front: 0.16, courses: 30, built: o.built });
  cmRope(cam, t, { y0: o.ropeY0, flags: o.flags });
  applyCam(cam);
  if (o.cleo !== false) cleoSwing(t, o.cleoO || {});
}
SC.climb = (lt, t, shot) => {
  const c = cu(), cam = climbCam(t);
  const hy = climbHeroY(t), sp = climbSpeed(t), fast = clamp(Math.abs(sp) / 500);
  const waveC = popK(t, c.reach1 - 0.3, c.up2 + 0.3, 0.15, 0.2);
  ropeWorld(cam, t, { cleoO: { face: waveC > 0.3 ? CF.wave : CF.smile, armL: waveC > 0.05 ? { w: [-110, lerp(-180, -560, waveC) + 30 * Math.sin(t * 16) * waveC], bend: 1 } : undefined, handL: waveC > 0.3 ? 'wave' : 'open' },
    wave: popK(t, c.reach2 - 0.2, shot.end + 1, 0.2, 0.2) });
  // him: standing on the pyramid's upper face, beckoning; then on the rope
  const onMoon = t >= c.reach2;
  let H;
  if (t < c.up1) {
    const bk = popK(t, c.beckon, c.up1, 0.15, 0.15);
    H = { x: CM_HX + 40, y: 150, s: 0.95, face: cmHFaceAt([[0, HF.ok], [c.beckon, HF.come]], t),
      armR: { e: [150, -330], w: [lerp(160, 190, bk), lerp(-240, -500 + 30 * Math.sin(t * 18), bk)] }, handR: bk > 0.3 ? 'spread' : 'open',
      armL: [-120, -520 + 120 * clamp(inv(c.me_end - 0.3, c.up1, t))], lean: -0.04 };
  } else if (!onMoon) {
    const cp = climbPose(t, sp);
    const panting = t > c.reach1 - 0.1 && t < c.up2;
    H = { x: CM_HX, y: hy, s: 0.95, pose: cp.pose, armL: cp.armL, armR: cp.armR, sweat: clamp(fast * 1.2) * 0.8 + (panting ? 0.8 : 0),
      face: panting ? HF.pant : fast > 0.4 ? HF.push : HF.up, lean: -0.04 };
  } else {
    const st = E.outCubic(inv(c.reach2, c.reach2 + 0.3, t));
    H = { x: CM_HX + 30 * st, y: cmMoonTopY(CM_HX + 30), s: 0.95, face: HF.whee, armR: { e: [150, -330], w: [170, -560] }, handR: 'spread', armL: [-110, -300] };
  }
  cmHero(cam, t, H);
  // speed lines while he flies up
  if (fast > 0.25) {
    screenSpace();
    const rng = mulberry32(77);
    paint(() => { for (let i = 0; i < 18; i++) { const x = 60 + 960 * rng(), y0 = ((rng() * 2200 + t * 2400 * (0.7 + 0.6 * rng())) % 2200) - 140; line(ctx, x, y0, x, y0 + 120 + 80 * rng(), 4, `rgba(255,255,255,${0.35 * fast})`); } });
  }
  // the counter: 0 -> 2,500 (to her), then 0 -> 2,000 (to the Moon)
  let ck = 0, txt = '', col = '#4DFFB4';
  const yS = climbHeroY(c.up1 - 0.01), yC2 = climbHeroY(c.reach1 + 0.01), yT = climbHeroY(c.reach2 + 0.01);
  if (t >= c.pyramid3 - 0.1 && t < c.up2) { ck = popK(t, c.pyramid3 - 0.1, c.up2, 0.15, 0.12); const v = 2500 * clamp((yS - hy) / (yS - yC2)); txt = v >= 2499 ? '2,500' : (Math.round(v / 10) * 10).toLocaleString('en-US'); }
  else if (t >= c.up2 - 0.05) { ck = popK(t, c.up2 - 0.05, shot.end + 0.2, 0.12, 0.2); const v = 2000 * clamp((yC2 - hy) / (yC2 - yT)); txt = v >= 1999 ? '2,000' : (Math.round(v / 10) * 10).toLocaleString('en-US'); col = '#7FE9FF'; }
  const ding1 = cmSince(t, c.ding1, 6), ding2 = cmSince(t, c.ding2, 6);
  return { glow: 0.85, blur: [0, -26 * fast],
    overlay: () => {
      cmCounter(ck * (1 + 0.12 * (ding1 + ding2)), txt, t < c.up2 ? 'YEARS · PYRAMID → CLEOPATRA' : 'YEARS · CLEOPATRA → MOON', col, t);
    } };
};

// ---------------------------------------------------------------- THE PAYOFF: the whole rope, the two spans, the extra 500
const CM_OVER = { x: 560, y: -731, zoom: 0.26 };
function payCam(t) {
  const c = cu(), a = climbCam(c.reach2 + 0.4);
  const u = E.inOutCubic(inv(c.pull, c.pull + 1.15, t));
  // the zoom eases in log space so the pull feels even
  const z = Math.exp(lerp(Math.log(a.zoom), Math.log(CM_OVER.zoom), u));
  return { x: lerp(a.x, CM_OVER.x, u), y: lerp(a.y, CM_OVER.y, u), zoom: z, rot: 0 };
}
SC.payoff = (lt, t, shot) => {
  const c = cu(), cam = payCam(t);
  ropeWorld(cam, t, { cleoO: { face: CF.wave, armL: { w: [-110, -540 + 30 * Math.sin(t * 12)], bend: 1 }, handL: 'wave' }, wave: 0.6 });
  cmHero(cam, t, { x: CM_HX + 30, y: cmMoonTopY(CM_HX + 30), s: 0.95, face: HF.whee, armR: { e: [150, -330], w: [170, -560] }, handR: 'spread', armL: [-110, -300] });
  // the screen points of the three moments
  const yP = toScreen(cam, 0, 0)[1], yC = toScreen(cam, 0, CM_CLEO_Y)[1], yM = toScreen(cam, 0, CM_TOP_Y)[1];
  const lab = (k0) => popK(t, k0, shot.end + 1);
  const bk = inv(c.brackets, c.brackets + 0.45, t);
  const sl = E.inOutCubic(inv(c.slide500, c.slide500 + 0.6, t));
  const gk = popK(t, c.glow500, shot.end + 1);
  return { glow: 0.85, overlay: () => {
    cmTag('MOON LANDING · 1969', 330, 520, lab(c.neil - 0.05), { size: 36, edge: '#8FB8FF', sub: 'NEIL ARMSTRONG', subCol: '#BFD6FF' });
    cmTag('CLEOPATRA · 69 BC', 300, yC - 30, lab(c.shes + 0.35), { size: 36, edge: '#FFD447' });
    cmTag('GREAT PYRAMID', 282, yP + 36, lab(c.shes + 0.6), { size: 36, edge: '#FFB067', sub: '~2560 BC', subCol: '#FFD9AE' });
    // the two spans, on the right: thick bars with their numbers
    cmBracket(800, yC + 6, yP - 6, bk, '#FFB067', '~2,500', { side: -1, dx: 150, ly: lerp(yC, yP, 0.36), size: 42, sub: 'YEARS' });
    cmBracket(800, yM + 6, yC - 6, bk, '#7FE9FF', '~2,000', { side: -1, dx: 150, ly: lerp(yM, yC, 0.5), size: 42, sub: 'YEARS' });
    // the 2,000 span slides down beside the 2,500 one; what is left over glows: about 500 years
    if (sl > 0.001) {
      const L = yC - yM, ya = lerp(yM, yC, sl), yb = ya + L;
      screenSpace();
      paint(() => { ctx.lineCap = 'butt'; line(ctx, 846, ya + 6, 846, yb - 6, 16, '#7FE9FF'); line(ctx, 830, ya + 6, 862, ya + 6, 6, '#E6FBFF'); line(ctx, 830, yb - 6, 862, yb - 6, 6, '#E6FBFF'); });
      softDot(gctx, 846, (ya + yb) / 2, 70, '#7FE9FF', 0.4 * sl);
      if (gk > 0.01) {
        const y0 = yC + L, y1 = yP;
        paint(() => { ctx.lineCap = 'butt'; line(ctx, 846, y0, 846, y1 - 6, 18, '#FFD447'); });
        softDot(gctx, 846, (y0 + y1) / 2, 110, '#FFD447', 0.9 * gk);
        cmTag('~500 YRS', 630, y0 - 58, gk, { size: 50, edge: '#FFD447', fg: '#FFD447', sub: 'CLOSER TO NEIL', subCol: '#FFE6A8' });
      }
    }
  } };
};

// ---------------------------------------------------------------- THE PAST: he slides down the rope to 2560 BC: the pyramid
// half built, the builders hauling a block; "woolly mammoths": a split screen, a mammoth on Wrangel Island; "On one
// island.": that half pulls back to the island in the Arctic sea; he shrugs
const CM_BUILT = 0.78, CM_PLAT = CM_PYR.h * (1 - CM_BUILT);   // the working top of the half-built pyramid (world y 420)
function cmSite(t) {
  const y = CM_PLAT, w = CM_PYR.hw * (y / CM_PYR.h);
  // the ramp of mud brick up the left face to the working top
  ctx.beginPath(); ctx.moveTo(CM_PYR.x - w - 40, y + 4); ctx.lineTo(CM_PYR.x - w + 60, y + 4); ctx.lineTo(CM_PYR.x - w - 520, y + 900); ctx.lineTo(CM_PYR.x - w - 700, y + 900); ctx.closePath();
  ctx.fillStyle = '#9A6A44'; ctx.fill();
  // an unfinished course of blocks along the back of the top, with gaps
  const rng = mulberry32(64);
  for (let i = 0; i < 9; i++) {
    if (i === 3 || i === 6) continue;
    const bx = CM_PYR.x - w + 70 + i * (2 * w - 140) / 8, bh = 56 + 10 * rng();
    rrect(ctx, bx - 40, y - bh, 80, bh, 4); ctx.fillStyle = i % 2 ? '#EAD7AE' : '#E0C99C'; ctx.fill();
  }
}
function pastHeroY(t) {
  const c = cu(), yTop = cmMoonTopY(CM_HX + 30), yLand = CM_PLAT;
  if (t < c.jump + 0.15) return yTop - 60 * Math.sin(Math.PI * clamp(inv(c.jump, c.jump + 0.15, t)));
  if (t < c.land) { const u = inv(c.jump + 0.15, c.land, t); return lerp(yTop, yLand, E.inCubic(u) * 0.35 + u * 0.65); }
  return yLand;
}
function pastCam(t) {
  const c = cu(), t0 = TLd.shots.find((s) => s.id === 'past').start;
  const hy = pastHeroY(t);
  const k0 = E.outCubic(inv(t0, t0 + 0.35, t));                                     // whip back in from the overview
  let cam = { x: lerp(CM_OVER.x, 610, k0), y: lerp(CM_OVER.y, hy - 330, k0), zoom: Math.exp(lerp(Math.log(CM_OVER.zoom), Math.log(0.85), k0)), rot: 0 };
  if (t >= t0 + 0.35) cam = { x: 610, y: hy - 330, zoom: 0.85, rot: 0 };
  // after the landing: closer on the building site; at the split he is framed in the left half
  const kl = E.inOutCubic(inv(c.land + 0.15, c.land + 0.7, t));
  cam = { x: lerp(cam.x, 560, kl), y: lerp(cam.y, CM_PLAT - 330, kl), zoom: lerp(cam.zoom, 1.0, kl), rot: 0 };
  const ks = E.inOutCubic(inv(c.split, c.split + 0.35, t));
  cam = { x: lerp(cam.x, CM_HX + 30 + 270, ks), y: cam.y, zoom: lerp(cam.zoom, 1.05, ks), rot: 0 };
  const sh = shake(t, 9 * cmSince(t, c.land, 6), 22, 7);
  cam.x += sh[0] / cam.zoom; cam.y += sh[1] / cam.zoom;
  return cam;
}
function arcticPanel(t, x0) {
  const c = cu();
  // the panel's camera: on the mammoth, then (On one island) back to the island in the sea
  const zo = E.inOutCubic(inv(c.zoomout, c.zoomout + 0.95, t));
  const z = Math.exp(lerp(Math.log(0.62), Math.log(0.105), zo));
  const pc = { x: lerp(-60, 0, zo), y: lerp(-330, -320, zo), zoom: z, rot: 0, sx: (x0 + 540) / 2 + (W - x0) / 2 - W / 2 - (540 - (W - x0) / 2) * 0 };
  pc.sx = (x0 + W) / 2 - W / 2;                                                      // centre the panel's world in its half
  // the panel: one opaque fill first (outside any clip), then its world inside the clip
  screenSpace(); ctx.fillStyle = '#A9C4DC'; ctx.fillRect(x0, 0, W - x0, H);
  ctx.save(); ctx.beginPath(); ctx.rect(x0, 0, W - x0, H); ctx.clip();
  cmArcticSky(ctx, pc);
  cmIsland(pc, t, { L: 1500 });
  applyCam(pc);
  const tr = E.outBack(inv(c.still, c.still + 0.35, t), 1.4) * (1 - inv(c.zoomout + 0.4, c.zoomout + 0.8, t));
  cmMammoth(ctx, 40, 0, 0.62, t, { chew: t * 7, trunk: tr, look: t > c.split + 0.6 ? [-0.9, -0.1] : [-0.5, 0.3], blink: (t % 2.7) < 0.12 ? 1 : 0, brow: tr });
  // two more, far off on the island (they show when the view pulls back)
  cmMammoth(ctx, -900, -60, 0.4, t + 1.3, { chew: t * 6 + 2, look: [-0.7, 0.2] });
  cmMammoth(ctx, 820, -40, 0.36, t + 0.6, { chew: t * 5 + 1, look: [-0.7, 0.2] });
  ctx.restore();
  // the seam
  paint(() => { line(ctx, x0, 0, x0, H, 10, '#FBF8F0'); line(ctx, x0 + 6, 0, x0 + 6, H, 3, 'rgba(0,0,0,0.25)'); });
}
SC.past = (lt, t, shot) => {
  const c = cu(), cam = pastCam(t);
  const landed = t >= c.land;
  ropeWorld(cam, t, { built: landed || t > c.land - 0.9 ? CM_BUILT : 1, ropeY0: landed || t > c.land - 0.9 ? CM_PLAT : 0, cleo: !landed, cleoO: { face: CF.wow }, flags: t < c.split });
  applyCam(cam);
  // the builders and their block on the working top (they look up at him once he lands)
  if (t > c.land - 0.9) {
    const look = clamp(inv(c.land + 0.1, c.land + 0.35, t));
    cmSite(t);
    cmBlock(ctx, 150, CM_PLAT + 2, 0.9);
    const hands = [];
    for (let i = 0; i < 4; i++) {
      const wx = 270 + i * 72, ln = lerp(0.32, 0.04, look);
      cmWorker(ctx, wx, CM_PLAT + 2, 0.92, t, { ph: (1 - look) * (t * 6 + i * 1.3), lean: ln, look });
      hands.push([wx + Math.sin(ln) * 150 * 0.92 - 52 * 0.92, CM_PLAT - 140 * 0.92]);
    }
    paint(() => { ctx.beginPath(); ctx.moveTo(150 + 100 * 0.9, CM_PLAT - 70); for (const h of hands) ctx.lineTo(h[0], h[1]); ctx.lineWidth = 5; ctx.strokeStyle = '#A8783A'; ctx.stroke(); });
  }
  // him: on the rope's right, sliding down (sparks off his gloves), then landing; at the split he looks over at the mammoth
  const hy = pastHeroY(t), sliding = t > c.jump + 0.15 && t < c.land;
  const face = cmHFaceAt([[0, HF.whee], [c.land, HF.wince], [c.land + 0.4, HF.ok], [c.split + 0.22, HF.look], [c.split + 0.55, Object.assign({}, HF.ok, { blink: 0.5 })],
    [c.split + 0.78, HF.shock], [c.shrug, HF.meh]], t);
  const shrug = E.outBack(inv(c.shrug, c.shrug + 0.3, t), 1.5);
  const H = landed
    ? { x: CM_HX + 30, y: hy, s: 0.95, face, headRot: (t > c.split + 0.22 && t < c.split + 0.55 ? 0.1 : 0) + (t > c.split + 0.78 ? 0.14 * cmSince(t, c.split + 0.78, 5) * Math.sin((t - c.split - 0.78) * 38) + 0.08 : 0),
      lean: t > c.split + 0.78 && t < c.shrug ? 0.05 : 0,
      armL: shrug > 0.02 ? { e: [-150, -300], w: [lerp(-120, -190, shrug), lerp(-240, -380, shrug)] } : [-110, -230],
      armR: shrug > 0.02 ? { e: [150, -300], w: [lerp(120, 190, shrug), lerp(-240, -380, shrug)] } : [110, -230], handL: shrug > 0.3 ? 'spread' : 'open', handR: shrug > 0.3 ? 'spread' : 'open' }
    : { x: CM_HX, y: hy, s: 0.95, face, pose: Object.assign(JSON.parse(JSON.stringify(CM_POSE)), { legL: { a: 0.5, b: -1.0 }, legR: { a: 0.25, b: -0.3 } }),
      armL: [-84, -560], armR: [-70, -420], sweat: 0 };
  cmHero(cam, t, H);
  if (sliding) {                                                    // sparks off his gloves on the rope
    screenSpace();
    const g = toScreen(cam, CM_ROPE_X, hy - 520 * 0.95);
    paint(() => { const rng = mulberry32(Math.floor(t * 30)); for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + (rng() - 0.5) * 1.6, L = 20 + 40 * rng(); line(ctx, g[0], g[1], g[0] + Math.cos(a) * L, g[1] - Math.sin(a) * L * -1, 3, '#FFE08A'); } softDot(gctx, g[0], g[1], 40, '#FFC870', 0.9); });
  }
  if (landed) {                                                     // the dust of the landing
    const dk = cmSince(t, c.land, 4) * clamp((t - c.land) * 8);
    if (dk > 0.02) { applyCam(cam); for (let i = -3; i <= 3; i++) softDot(ctx, CM_HX + 30 + i * 60 * (1 + (t - c.land) * 2), CM_PLAT - 10, 60 + 30 * (t - c.land) * 4, '#EAD2A8', 0.6 * dk); }
  }
  // the split screen: the Arctic half wipes in from the right
  const sw = E.outCubic(inv(c.split, c.split + 0.32, t));
  const fast = sliding ? clamp(Math.abs((pastHeroY(t + 0.02) - pastHeroY(t - 0.02)) / 0.04) / 800) : 0;
  // the year counter rewinding while he slides
  const yk = popK(t, c.jump + 0.1, c.land + 0.9, 0.12, 0.2);
  const yv = Math.round(lerp(1969, -2559, clamp(inv(c.jump + 0.15, c.land, t))));
  const ytxt = yv > 0 ? `AD ${yv}` : `${1 - yv} BC`;
  return { glow: 0.85, blur: [0, 30 * fast],
    overlay: () => {
      if (sw > 0.001) {
        arcticPanel(t, lerp(W, 540, sw));
        cmTag('MEANWHILE · 2560 BC', 810, 560, popK(t, c.split + 0.3, shot.end + 1), { size: 32, edge: '#7FE9FF', bg: '#0E2236' });
        cmTag('WRANGEL ISLAND', 775, 950, popK(t, c.island - 0.05, shot.end + 1), { size: 38, edge: '#7FE9FF', bg: '#0E2236', sub: 'IN THE ARCTIC', subCol: '#BFF0FF' });
        cmBurst('TOOT!', 760, 760, 110, popK(t, c.trumpet, c.trumpet + 0.55), { fg: '#FFD447', size: 58 });
      }
      cmCounter(yk, ytxt, 'BACK IN TIME', '#C8A8FF', t, 'back');
    } };
};

// ---------------------------------------------------------------- THE BUTTON: back on the Moon. "So Cleopatra?": she peers
// over her sunglasses; "Practically...": pushes them up; "modern.": a bubble-gum bubble... POP
function btnCam(t) {
  const c = cu(), t0 = TLd.shots.find((s) => s.id === 'button').start;
  const k = E.outCubic(inv(t0, t0 + 0.4, t));
  const hd = cmCleoHeadAt(MN.cx - 31, MN.gy, 1);
  return { x: lerp(560, hd[0] - 10, k), y: lerp(1100, hd[1] + 60, k), zoom: lerp(1.25, 2.15, k) + 0.08 * clamp((t - t0) / 4), rot: 0 };
}
SC.button = (lt, t, shot) => {
  const c = cu(), cam = btnCam(t);
  const peer = E.outCubic(inv(c.peer, c.peer + 0.3, t)) * (1 - E.inOutCubic(inv(c.shades_up, c.shades_up + 0.25, t)));
  const bub = clamp(inv(c.bubble, c.pop, t)), popped = t >= c.pop;
  const pk = popped ? clamp(1 - (t - c.pop) / 0.5) : 0;
  const S = selfieState(-1);
  S.cface = cmFaceAt([[0, CF.smile], [c.peer, CF.peer], [c.shades_up + 0.1, CF.sly], [c.bubble, CF.blow], [c.pop, CF.wow], [c.pop + 0.45, CF.duck]], t);
  S.glassesY = 16 * peer; S.headRot = 0.05 * peer;
  S.bubble = popped ? 0 : E.outCubic(bub); S.pop = pk;
  S.hface = cmHFaceAt([[0, HF.ok], [c.pop, HF.shock], [c.pop + 0.4, HF.grin]], t);
  S.armR = { w: [lerp(58, 34, peer), lerp(-548, -470, peer)], bend: 1 }; S.handR = peer > 0.3 ? 'glasses' : 'peace';
  moonScene(cam, t, S);
  const sh = shake(t, 4 * cmSince(t, c.pop, 7), 20, 5);
  return { glow: 0.85, push: { k: 1 + 0.02 * lt / 4, cx: 540, cy: 900 }, blur: [sh[0] * 0.3, sh[1] * 0.3],
    overlay: () => cmBurst('POP!', 790, 760, 100, popK(t, c.pop, c.pop + 0.5), { fg: '#FF86A6', size: 56 }) };
};

// ---------------------------------------------------------------- the cover: the selfie with the question
SC.cover = (lt, t) => {
  hookDraw(1.2, t);
  screenSpace();
  bigWord('CLOSER TO', 540, 1210, 118, '#FFFFFF', 1, -0.04);
  bigWord('THE MOON?!', 540, 1380, 168, '#FFD447', 1, -0.04);
  return { glow: 0.85, noCaptions: true };
};

function initScenes2() {
  initCmWorld();
}
