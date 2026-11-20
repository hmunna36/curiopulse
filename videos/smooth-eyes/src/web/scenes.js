// Can You Move Your Eyes SMOOTHLY? 👀 Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
// The world is one-eye's hot mountain meadow (oneeye.js + trail.js + eyes.js); se_world.js adds the jumping eyes, the
// foreground finger, the viewfinder, the tow lines and the dark.
'use strict';

const cu = () => TLd.cues;
const bumpAt = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);

// ---------------------------------------------------------------- the light (reference/visual.md "The light")
// a hot clear day in the meadow: the sun high on the left is the key, the blue sky the rim from the right; in the dark,
// moonless navy (the scene draws it), no pool
const DAY_LIGHT = { ...flipLight(LIGHTS.day), rimAmt: 0.95, pool: 0.32, dof: 0.6, halo: 0.08 };
const DARK_LIGHT = { ...LIGHTS.night, pool: 0.25, halo: 0, rimAmt: 0.5 };
setLights({ hook: DAY_LIGHT, pov: DAY_LIGHT, answer_a: DAY_LIGHT, answer_b: DAY_LIGHT, chase: DAY_LIGHT, finger_a: DAY_LIGHT,
  finger_b: DAY_LIGHT, ride: DAY_LIGHT, dark_a: DARK_LIGHT, dark_b: DARK_LIGHT, feel: DARK_LIGHT, button: DAY_LIGHT,
  loop: DAY_LIGHT, cover: DAY_LIGHT });

// ---------------------------------------------------------------- his faces
const SF = {
  focus: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 0.32, browTilt: 0.75, mouth: 'flat', mouthOpen: 0.1, blink: 0, cross: 0 },
  annoyed: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: -0.3, browTilt: -0.75, mouth: 'flat', mouthOpen: 0, blink: 0, cross: 0 },
  strain: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 0.15, browTilt: 1.0, mouth: 'grimace', mouthOpen: 0.85, blink: 0, cross: 0 },
  wow: { eyeOpen: 1.15, pupil: 0.85, lookX: 0, lookY: 0, browY: 1.3, browTilt: 0.3, mouth: 'o', mouthOpen: 0.7, blink: 0, cross: 0 },
  grin: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 0.6, browTilt: -0.2, mouth: 'grin', mouthOpen: 1, blink: 0, cross: 0 },
  happy: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 0.45, browTilt: 0.1, mouth: 'grin', mouthOpen: 0.55, blink: 0, cross: 0 },
  sad: { eyeOpen: 0.95, pupil: 1, lookX: 0, lookY: 0, browY: 0.5, browTilt: 1.1, mouth: 'wavy', mouthOpen: 0.25, blink: 0, cross: 0 },
};
const browWig = (tt, amt) => amt * (0.55 * Math.sin(tt * 2 * Math.PI * 5.2) + 0.2 * Math.sin(tt * 2 * Math.PI * 9.1 + 1));
// a camera on his head whose eyes land at screen height eyeY (his eyes are at world y 1028)
const seCam = (z, eyeY = 650, x = 540) => ({ x, y: 1028 + (960 - eyeY) / z, zoom: z, rot: 0 });
// the tip of his tongue in the corner of his mouth (head units): concentration
function seTongue(c, k) {
  if (k <= 0.01) return;
  paint(() => { ellipse(c, 13, 43, 5.2 * k, 4.2 * k, '#E0616C'); ellipse(c, 12, 42, 2, 1.4, 'rgba(255,200,205,0.8)'); });
}
// the iris points on screen
function seIrisScreen(cam, r) {
  return (r.iris || []).map((p) => toScreen(cam, ...r.rp(oeHeadLocal(r.st, p[0], p[1]))));
}
const BUT_A = { col: ['#FF8A1E', '#3A1A0A', '#FFFFFF'] };

// ---------------------------------------------------------------- the finger's journey (shared by finger_b, ride, button)
// p 0..1: from "Move it" to the end of "ride on it."; the eyes follow it (lx -0.95 .. 0.95)
function seFingerP(t) { const c = cu(); return ramp(t, c.finger_go, c.it3_end + 0.1, E.inOutSine); }
const seTipX = (p) => lerp(190, 820, p);

// ---------------------------------------------------------------- frame 1 and round it (tt = seconds since frame 1;
// negative = the button and the loop, so the last frame IS frame 1's picture)
function hookStops() {
  const c = cu(), D = TLd.duration;
  return { tryT: c.try - D - 0.03, hops: [c.try - D - 0.03, -0.30].concat(c.hops), stops: [0.0, -1.5, -0.5, 0.5, 1.5, -1.5, -0.5] };
}
function hookA(tt) {
  const c = cu(), D = TLd.duration, S = hookStops();
  const H = seHop(tt, S.hops, S.stops);
  const loseT = c.lose - D;
  let lx = H.lx, ly = -0.06, cross = 0, smear = H.smear, face;
  const work = tt >= S.tryT ? 1 : 0;
  if (!work) {
    // the button: cross-eyed at the butterfly on his nose; it takes off and he watches it go, up and away
    const takeT = c.finger3 - D - 0.1;
    const go = ramp(tt, takeT, takeT + 0.35);
    cross = 0.85 * (1 - go); lx = lerp(0.0, 0.95, go); ly = lerp(0.55, -0.75, go); smear = null;
    face = lerpFace(lerpFace(SF.sad, SF.wow, 0.45), SF.sad, go);
  } else {
    face = lerpFace(SF.focus, SF.strain, 0.25 + 0.2 * Math.abs(Math.sin(tt * 3)));
    face = Object.assign({}, face, { browY: face.browY + browWig(tt, 0.12) });
  }
  const tongue = ramp(tt, S.tryT + 0.05, S.tryT + 0.3);
  return { face, H: work ? H : null, tongue,
    eyes: { lx, ly, smear, cross, squint: 0.22 * work, iris: ES_IRIS.hero, wide: 1.6 }, headRot: work * 0.006 * Math.sin(tt * 41), headDY: 1.2 * Math.sin(tt * 2.1) };
}
function hookCam(tt) {
  const k = camKeys(tt, [[-3.3, 540, 1104, 3.1], [-1.4, 540, 1076, 4.3], [-0.45, 540, 1064, 5.6], [0, 540, 1064, 5.6], [2.1, 540, 1064, 5.85]]);
  return k;
}
function hookDraw(tt, t) {
  const c = cu(), D = TLd.duration;
  OE_BGDY = 0;
  const cam = hookCam(tt), A = hookA(tt);
  oeBack(cam, t);
  applyCam(cam);
  const r = oeHero(cam, t, { face: A.face, eyes: A.eyes, headRot: A.headRot, headDY: A.headDY,
    head: (hc) => { seHopMarks(hc, A.eyes, A.H, t, { tt, dot: 2.1 }); seTongue(hc, A.tongue); } });
  if (tt < 0) {
    const loseT = c.lose - D;
    // the hand (where the ride left it) drops away on "lose the finger"
    const dk = ramp(tt, loseT - 0.05, c.finger3_end - D + 0.1, E.inCubic);
    if (dk < 0.999) seHand(seTipX(1) - 50, 1080, 0.95, { drop: dk });
    // the butterfly: on his nose (it flew into it in the dark), off and away when the hand goes
    const ir = seIrisScreen(cam, r), nose = ir.length === 2 ? [(ir[0][0] + ir[1][0]) / 2, (ir[0][1] + ir[1][1]) / 2 + 0.55 * Math.abs(ir[1][0] - ir[0][0])] : [540, 900];
    const fk = ramp(tt, c.finger3 - D - 0.1, c.finger3 - D + 0.8);
    if (fk < 0.999) {
      screenSpace();
      const bx = nose[0] + 520 * fk * fk + 26 * Math.sin(fk * 9), by = nose[1] - 780 * fk + 40 * Math.sin(fk * 7);
      oeButterfly(ctx, bx, by, 1.5 * cam.zoom / 4, t, Object.assign({ rot: -0.2 + 0.3 * fk }, BUT_A));
    }
  }
  return { cam, A, r };
}

SC.hook = (lt, t, shot) => { hookDraw(t, t); return { glow: 0.8 }; };
SC.button = (lt, t, shot) => { hookDraw(t - TLd.duration, t); return { glow: 0.8 }; };
SC.loop = (lt, t, shot) => { hookDraw(t - TLd.duration, t); return { glow: 0.8 }; };

// ---------------------------------------------------------------- what he sees: the viewfinder jumps across the valley
const POV_STOPS = [300, 470, 640, 800, 920];
function povX(t) {
  const hops = cu().pov_hops, dur = 0.07;
  let i = 0;
  while (i < hops.length && t >= hops[i] + dur) i++;
  if (i < hops.length && t >= hops[i]) { const u = (t - hops[i]) / dur; return { x: lerp(POV_STOPS[i], POV_STOPS[i + 1], E.inOutSine(u)), i, moving: POV_STOPS[i + 1] - POV_STOPS[i] }; }
  return { x: POV_STOPS[i], i, moving: 0 };
}
SC.pov = (lt, t, shot) => {
  const P = povX(t), Z = 1.32;
  const bc = { x: P.x, y: 1120, zoom: Z, rot: 0, sx: 0, sy: 0 };
  screenSpace(); ctx.fillStyle = '#1767D4'; ctx.fillRect(0, 0, W, H);
  trSky(bc, t, { blue: 1 });
  trSun(bc, t, { blue: 1, at: [230, 500], r: 50, rays: 0.55, glow: 0.9 });
  trClouds(bc, t, { k: 1 });
  trRidges(bc, t, { blue: 1 });
  oeFlags(bc, t);
  oeMeadow(bc, t);
  // where his eyes landed: a dot per stop, joined by straight jumps (they stay on the view as it jumps on)
  const pts = [];
  for (let j = 0; j <= Math.min(P.i + (P.moving ? 1 : 0), POV_STOPS.length - 1); j++) pts.push([540 + (POV_STOPS[j] - P.x) * Z * 0.82, 742 - (j % 2 ? 46 : 0)]);
  seScanpath(pts, ramp(t, shot.start + 0.05, shot.start + 0.2), t);
  seViewfinder(t, { y0: 300, y1: 1160 });
  return { glow: 0.8, blur: P.moving ? [P.moving * 0.42, 0] : undefined };
};

// ---------------------------------------------------------------- the verdict: jumpy, right?
const HOPS2_STOPS = [-0.5, -1.5, -0.5, 0.5, 1.5, -1.5, -0.5, 0.5];
SC.answer_a = (lt, t, shot) => {
  const c = cu();
  OE_BGDY = -300;                                                                // low: the horizon drops, sky behind him
  const cam = camKeys(t, [[shot.start, 540, 1132, 3.0], [shot.end, 540, 1126, 3.15]]);
  oeBack(cam, t);
  applyCam(cam);
  const H = seHop(t, c.hops2, HOPS2_STOPS);
  const sc = ramp(t, c.jumpy - 0.1, c.jumpy + 0.15);
  const face = lerpFace(SF.focus, SF.annoyed, sc);
  const F = { lx: H.lx, ly: -0.05, smear: H.smear, iris: ES_IRIS.hero, squint: 0.3 * sc, wide: 1.6 };
  oeHero(cam, t, { face, eyes: F, headRot: -0.03 * sc, head: (hc) => seHopMarks(hc, F, H, t, { tt: t, dot: 2.0 }) });
  return { glow: 0.8 };
};
SC.answer_b = (lt, t, shot) => {
  const c = cu();
  const tight = t >= c.cut_tight;
  OE_BGDY = 120;
  const cam = tight ? camKeys(t, [[c.cut_tight, 540, 1082, 5.6], [shot.end, 540, 1080, 5.85]])
    : camKeys(t, [[shot.start, 610, 1124, 3.15], [c.cut_tight, 602, 1118, 3.35]]);
  oeBack(cam, t);
  applyCam(cam);
  const H = seHop(t, c.hops2, HOPS2_STOPS);
  const str = ramp(t, c.cant - 0.1, c.glide + 0.2) * (1 - 0.3 * ramp(t, c.without, c.something));
  let face = lerpFace(SF.annoyed, SF.strain, str);
  face = Object.assign({}, face, { browY: face.browY + browWig(t, 0.15 * str) });
  // "to...": he goes still, eyes wide; something is coming
  const wait = ramp(t, c.to - 0.05, c.to + 0.15);
  face = lerpFace(face, SF.wow, 0.55 * wait);
  const F = { lx: H.lx, ly: -0.05, smear: H.smear, iris: ES_IRIS.hero, squint: 0.35 * str * (1 - wait), open: 1 + 0.12 * wait, wide: 1.6 };
  oeHero(cam, t, { face, eyes: F, headRot: 0.008 * str * Math.sin(t * 37),
    head: (hc) => { seHopMarks(hc, F, H, t, { tt: t, dot: tight ? 1.1 : 1.6 }); if (str > 0.3) paint(() => sweatDrop(hc, 58, -40 + 22 * str, 0.5, str)); } });
  // anticipation: a wing tip flutters at the left edge on "to..."
  if (tight && wait > 0.01) {
    screenSpace();
    oeButterfly(ctx, -30 + 60 * wait + 14 * Math.sin(t * 20), 1020, 2.6, t, Object.assign({ rot: 0.5 }, BUT_A));
  }
  return { glow: 0.8 };
};

// ---------------------------------------------------------------- CHASE: the butterfly zips past, his eyes glide after it
function butterChase(t) {
  const c = cu(), u = clamp((t - c.fly_in) / (2 * (c.fly_pass - c.fly_in)));
  return { x: lerp(-140, 1220, E.inOutSine(u)), y: 800 - 30 * Math.sin(u * Math.PI * 2.2), u };
}
SC.chase = (lt, t, shot) => {
  const c = cu();
  OE_BGDY = 0;
  const cam = camKeys(t, [[shot.start, 566, 1138, 2.45], [shot.end, 520, 1132, 2.6]]);
  oeBack(cam, t);
  applyCam(cam);
  const B = butterChase(t);
  const head = toScreen(cam, OE_HEAD[0], OE_HEAD[1]);
  const lxT = clamp((B.x - head[0]) / 420, -1.1, 1.1);
  const lx = t < c.fly_in ? 0.5 : lxT;
  const x0 = clamp((butterChase(c.fly_in).x - head[0]) / 420, -1.1, 1.1);
  const joy = ramp(t, c.fly_pass, c.fly_pass + 0.3);
  const face = lerpFace(SF.wow, SF.grin, joy);
  const F = { lx, ly: 0.36, iris: ES_IRIS.hero, open: 1.1, cross: 0.12 * Math.max(0, 1 - Math.abs(lxT) * 1.5) };
  oeHero(cam, t, { face, eyes: F, headRot: 0.07 * lxT, headDX: 4 * lxT,
    head: (hc) => seGlideTrail(hc, F, x0, lx, ramp(t, c.fly_in + 0.1, c.fly_in + 0.3)) });
  screenSpace();
  oeButterfly(ctx, B.x, B.y, 2.7, t, Object.assign({ rot: 0.25 * Math.sin(t * 9) }, BUT_A));
  return { glow: 0.85 };
};

// ---------------------------------------------------------------- hold up a finger
SC.finger_a = (lt, t, shot) => {
  const c = cu();
  OE_BGDY = 200;                                                                 // high: more meadow behind him
  const cam = camKeys(t, [[shot.start, 470, 1132, 2.7], [shot.end, 476, 1126, 2.84]]);
  oeBack(cam, t);
  applyCam(cam);
  const up = ramp(t, c.finger_up, c.finger1_end, E.outCubic);
  const tip = [lerp(300, seTipX(seFingerP(t)) - 40, ramp(t, c.finger_go - 0.2, c.finger_go + 0.4)), 1040];
  const head = toScreen(cam, OE_HEAD[0], OE_HEAD[1]);
  const look = ramp(t, c.finger_up + 0.15, c.finger_up + 0.4);
  const F = { lx: lerp(0.3, clamp((tip[0] - head[0]) / 420, -1.05, 1.05), look), ly: lerp(-0.2, 0.45, look), iris: ES_IRIS.hero, cross: 0.08 * look };
  const face = lerpFace(SF.grin, SF.focus, 0.5 * look);
  oeHero(cam, t, { face, eyes: F });
  seHand(tip[0], tip[1], 0.78, { k: up });
  screenSpace();
  oeButterfly(ctx, 860 + 30 * Math.sin(t * 2.7), 470 + 26 * Math.sin(t * 3.9), 1.1, t, Object.assign({ rot: 0.2 * Math.sin(t * 5) }, BUT_A));
  return { glow: 0.8 };
};

// ---------------------------------------------------------------- the glide, macro: his eyes ride the finger
function fingerEyes(t) {
  const p = seFingerP(t);
  return { lx: lerp(-0.95, 0.95, p), p };
}
function butterOnTip(t, tip) {
  const c = cu(), k = ramp(t, c.fly_land - 0.9, c.fly_land, E.inOutSine);
  return [lerp(1180, tip[0] + 6, k) + (1 - k) * 30 * Math.sin(t * 6), lerp(1060, tip[1] - 64, k) - 90 * Math.sin(k * Math.PI) + (1 - k) * 18 * Math.sin(t * 8.3), k];
}
SC.finger_b = (lt, t, shot) => {
  const c = cu();
  OE_BGDY = 60;
  const cam = Object.assign(seCam(5.1, 610), { zoom: 5.1 + 0.25 * (lt / (shot.end - shot.start)) });
  oeBack(cam, t);
  applyCam(cam);
  const fe = fingerEyes(t), tip = [seTipX(fe.p), 1010];
  const F = { lx: fe.lx, ly: 0.45, iris: ES_IRIS.hero, cross: 0.1, open: 1.05 };
  const face = lerpFace(SF.focus, SF.happy, ramp(t, c.chase2, c.chase2 + 0.3));
  oeHero(cam, t, { face, eyes: F, head: (hc) => seGlideTrail(hc, F, -0.95, fe.lx, ramp(t, c.finger_go, c.finger_go + 0.3)) });
  seHand(tip[0], tip[1], 1.0, {});
  const b = butterOnTip(t, tip);
  screenSpace();
  oeButterfly(ctx, b[0], b[1], 1.6, t, Object.assign({ rot: -0.15 * (1 - b[2]) }, BUT_A));
  return { glow: 0.8 };
};
SC.ride = (lt, t, shot) => {
  const c = cu();
  const tight = t >= c.cut_rope;
  OE_BGDY = -80;
  const cam = tight ? seCam(4.6 + 0.2 * ramp(t, c.cut_rope, shot.end), 640) : seCam(3.15, 650, 548);
  oeBack(cam, t);
  applyCam(cam);
  const fe = fingerEyes(t), tip = [seTipX(fe.p), tight ? 1030 : 1060];
  const F = { lx: fe.lx, ly: 0.45, iris: ES_IRIS.hero, cross: 0.1, open: 1.05 };
  const face = lerpFace(SF.happy, SF.grin, ramp(t, c.smooth - 0.05, c.smooth + 0.12));
  const r = oeHero(cam, t, { face, eyes: F, head: (hc) => seGlideTrail(hc, F, -0.95, fe.lx, 1) });
  seHand(tip[0], tip[1], tight ? 0.95 : 0.8, {});
  screenSpace();
  oeButterfly(ctx, tip[0] + 6, tip[1] - 62 * (tight ? 0.95 : 0.8), tight ? 1.5 : 1.3, t, BUT_A);
  if (tight) seTow(seIrisScreen(cam, r), tip, ramp(t, c.hitch - 0.12, c.ride1 + 0.05), t, { taut: 0.85 });
  return { glow: 0.8 };
};

// ---------------------------------------------------------------- the dark: only his eyes (and the butterfly's)
const SE_DARKPAL = Object.assign({}, OEPAL, { skin: '#0E2260', skinSh: '#0A1A50', skinHi: '#12286C' });
// his eyes alone, through the scene's camera, with a faint glow of their whites
function seEyesDark(cam, t, F, o = {}) {
  applyCam(cam);
  const hx = OE_HEAD[0] + (o.dx || 0), hy = OE_HEAD[1];
  for (const s of [-1, 1]) softDot(gctx, hx + s * OE_EYE.x, hy + OE_EYE.y, 28, '#BFD8FF', 0.35 * (o.glow === undefined ? 1 : o.glow));
  ctx.save(); ctx.translate(hx, hy);
  const iris = oeEyes(ctx, SE_DARKPAL, F, t);                                   // lids the colour of the dark (a blink)
  if (o.head) o.head(ctx);
  ctx.restore();
  return iris.map((p) => toScreen(cam, hx + p[0], hy + p[1]));
}
// the ghost finger's journey in the dark (screen x of the tip), and the eyes' wobbly glide after it (catch-up jumps)
function ghostTipX(t) { const c = cu(); return lerp(210, 800, ramp(t, c.ghost_in + 0.25, c.feels_end + 0.2, (u) => u)); }
function ghostEyes(t) {
  const c = cu(), t0 = c.ghost_in + 0.25, step = 0.42;
  const target = (tt) => clamp((ghostTipX(tt) - 540) / 380, -1.0, 1.0);
  if (t < t0) return { lx: target(t0), smear: null };
  const k = Math.floor((t - t0) / step), tk = t0 + k * step, u = (t - tk) / step;
  const lag = target(tk) + 0.62 * (target(t) - target(tk));                   // they glide, but slower than the finger
  const jump = u < 0.12 ? 0 : 0;
  // the catch-up jump at the start of each step: from the lagging spot to the target
  const prevLag = k > 0 ? target(tk - step) + 0.62 * (target(tk) - target(tk - step)) : target(tk);
  if (u * step < 0.05 && k > 0) { const v = (u * step) / 0.05; return { lx: lerp(prevLag, target(tk), v) + jump, smear: { x0: prevLag, x1: target(tk), k: 0.7, at: v } }; }
  return { lx: lag, smear: null };
}
SC.dark_a = (lt, t, shot) => {
  const c = cu();
  seDarkBg(t);
  const cam = camKeys(t, [[shot.start, 540, 1028 + 200 / 5.0, 5.0], [shot.end, 540, 1028 + 200 / 5.3, 5.3]]);
  // in the dark, with nothing to follow, his eyes dart about in jumps; a startled blink on the click
  const hops = [c.click + 0.35, c.click + 0.72, c.pitch + 0.05, c.dark_end + 0.08], stops = [0.0, 0.7, -0.6, 0.25, -0.75];
  const H = seHop(t, hops, stops, 0.06);
  const bl = bumpAt(t, c.click + 0.02, 10) * (t > c.click ? 1 : 0);
  const F = { lx: H.lx, ly: -0.1, smear: H.smear, iris: ES_IRIS.hero, open: 1.1 - 0.9 * clamp(bl * 1.6) };
  seEyesDark(cam, t, F);
  // the butterfly's two tiny eyes, top right, blinking and looking about
  const bb = Math.floor(t * 1.7) % 3 === 0 ? clamp(1 - Math.abs((t * 1.7 % 1) - 0.5) * 6) : 0;
  seButterEyes(820 + 16 * Math.sin(t * 3.1), 500 + 10 * Math.sin(t * 4.3), 1.6, t, { blink: bb, look: [Math.sin(t * 2.3), 0.3] });
  return { glow: 0.85, noFlash: true };
};
SC.dark_b = (lt, t, shot) => {
  const c = cu();
  seDarkBg(t);
  const cam = camKeys(t, [[shot.start, 540, 1028 + 160 / 3.1, 3.1], [shot.end, 540, 1028 + 160 / 3.25, 3.25]]);
  const gk = ramp(t, c.ghost_in, c.ghost_in + 0.45);
  const tip = [ghostTipX(t), 1070];
  const G = ghostEyes(t);
  const F = { lx: G.lx, ly: 0.45, smear: G.smear, iris: ES_IRIS.hero, cross: 0.08 };
  const bk = ramp(t, c.brain - 0.05, c.brain + 0.3);
  seEyesDark(cam, t, F);
  seHand(tip[0], tip[1], 0.95, { ghost: gk, t });
  // the brain fades in, dim, above his eyes on "brain"
  if (bk > 0.01) seBrainDark(cam, t, 0.35 * bk, 'think');
  seButterEyes(820 + 18 * Math.sin(t * 3.1), 560 + 12 * Math.sin(t * 4.3), 1.6, t, { look: [-0.6 + 0.4 * Math.sin(t * 1.7), 0.4] });
  seStamp('SORT OF', 300, 880, ramp(t, c.finger2_end + 0.28, c.finger2_end + 0.42) * (1 - ramp(t, c.brain_end, c.brain_end + 0.15)), SEC.cyan, -0.12, 64);
  return { glow: 0.85 };
};
// the brain above his eyes in the dark, glowing (k 0..1)
function seBrainDark(cam, t, k, mood) {
  applyCam(cam);
  const x = OE_HEAD[0], y = OE_HEAD[1] - 92;
  softDot(gctx, x, y, 80, '#FF93B0', 0.42 * k);
  ctx.save(); ctx.globalAlpha = clamp(0.25 + 0.75 * k);
  oeBrain(ctx, x, y, 0.21, t, { mood, look: [0, 0.6], noArms: true });
  ctx.restore();
}
SC.feel = (lt, t, shot) => {
  const c = cu();
  seDarkBg(t);
  const cam = camKeys(t, [[shot.start, 540, 1028 + 80 / 3.25, 3.25], [shot.end, 540, 1028 + 80 / 3.4, 3.4]]);
  const tip = [ghostTipX(t), 1070];
  const G = ghostEyes(t);
  // the bonk: the butterfly's eyes fly into his nose; his eyes cross onto it
  const bApp = ramp(t, c.bonk - 0.32, c.bonk, E.inCubic);
  const crossK = ramp(t, c.bonk - 0.15, c.bonk + 0.05);
  const F = { lx: lerp(G.lx, 0, crossK), ly: lerp(0.45, 0.6, crossK), smear: crossK > 0 ? null : G.smear, iris: ES_IRIS.hero,
    cross: lerp(0.08, 0.95, crossK), open: 1 + 0.15 * bumpAt(t, c.bonk, 6) };
  const irisS = seEyesDark(cam, t, F);
  seHand(tip[0], tip[1], 0.95, { ghost: 1 - 0.6 * ramp(t, c.bonk - 0.2, c.bonk + 0.3), t });
  // the feeling: beads race from the fingertip down his arm and up to the brain, which lights up
  const head = toScreen(cam, OE_HEAD[0], OE_HEAD[1] - 92);
  const path = [[tip[0], tip[1] + 30], [tip[0] - 10, 1560], [620, 1700], [130, 1580], [96, 1000], [140, 560], [head[0] - 150, head[1] + 10], [head[0] - 60, head[1]]];
  const nk = ramp(t, c.feels - 0.25, c.feels);
  const beads = [0, 0.1, 0.2].map((d) => (t - c.feels - d * 0.6) / 0.62);
  seNerve(path, nk * (1 - 0.7 * ramp(t, c.move3_end, c.bonk)), beads, t);
  const lit = ramp(t, c.feels + 0.5, c.feels + 0.7);
  seBrainDark(cam, t, 0.35 + 0.65 * lit, lit > 0.5 ? 'wow' : 'think');
  if (lit > 0.01) { screenSpace(); softDot(gctx, head[0], head[1], 200 * lit, '#FF93B0', 0.28 * lit * bumpAt(t, c.feels + 0.5, 3)); }
  // the butterfly's eyes: from the top right, into his nose; a star on the bonk
  const nose = toScreen(cam, OE_HEAD[0], OE_HEAD[1] + 14);
  const bx = lerp(820 + 18 * Math.sin(t * 3.1), nose[0], bApp), by = lerp(560 + 12 * Math.sin(t * 4.3), nose[1], bApp);
  seButterEyes(bx, by, 1.6, t, { look: bApp > 0.5 ? [0, 0] : [-0.6, 0.4], blink: t > c.bonk ? clamp(bumpAt(t, c.bonk, 4) * 1.5) : 0 });
  const sk = popK(t, c.bonk, c.bonk + 0.42, 0.04, 0.12);
  if (sk > 0.01) { sparkle(nose[0] + 34, nose[1] - 30, 30, sk, '#FFF6C8'); sparkle(nose[0] - 30, nose[1] - 44, 20, sk * 0.8, '#FFF6C8'); }
  const bk2 = popK(t, c.bonk, c.bonk + 0.5, 0.05, 0.12);
  if (bk2 > 0.01) comicBurst(nose[0] + 190, nose[1] - 150, 0.36, bk2, 'BOOP!', '#FF5A6E', -0.12, 96);
  return { glow: 0.9, focus: [540, (head[1] + nose[1]) / 2 + 40] };
};

// ---------------------------------------------------------------- the cover: his eyes mid-jump, the hop arcs
SC.cover = (lt, t, shot) => {
  OE_BGDY = 0;
  const cam = { x: 540, y: 1028 + (960 - 1000) / 4.2, zoom: 4.2, rot: 0 };
  oeBack(cam, 1.0);
  applyCam(cam);
  const H = { lx: 0.5, smear: null, from: -0.5, to: 0.5, u: 1, last: 0.86, i: 3 };
  const F = { lx: 0.5, ly: -0.06, iris: ES_IRIS.hero, squint: 0.2 };
  oeHero(cam, 1.0, { face: SF.focus, eyes: Object.assign({ wide: 1.6 }, F), head: (hc) => { seHopMarks(hc, F, H, 1.0, { tt: 0.9, dot: 2.0 }); seTongue(hc, 1); } });
  screenSpace();
  bigWord('SLIDE YOUR', 540, 340, 132, '#FFFFFF', 1, -0.03);
  bigWord('EYES SMOOTHLY', 540, 486, 118, '#FFD447', 1, 0.02);
  return { glow: 0.8, noCaptions: true };
};

function initScenes2() {
  initOneEye();
}
