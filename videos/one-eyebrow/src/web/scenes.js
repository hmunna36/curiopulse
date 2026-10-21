// Why Can't You Raise Just ONE Eyebrow? Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
// One world all the way: blocked-nostril's bathroom seen from its mirror (mirror.js), him in a pink spa headband straining for
// one brow, puppet strings on his brows, his forehead turning to glass where he stands (brows.js), and back to frame 0.
// Brow and mouth-corner states are by SCREEN side: l = screen-left (his right), r = screen-right (his left).
'use strict';

const cu = () => TLd.cues;
const dur = () => (TLd.duration > 5 ? TLd.duration : cu().know_end + 1.2);   // the cover renders from a 2-frame timeline
const bumpAt = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);
// a tug: up in 0.12 s, held, let go
const tugK = (t, t0, hold = 0.45, up = 0.12, down = 0.28) => clamp((t - t0) / up) * (1 - clamp((t - t0 - up - hold) / down));

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the bathroom in the morning: the frosted window is on the left (the key), the room behind him out of focus
const MORN_LIGHT = { ...flipLight(LIGHTS.day), pool: 0.44, halo: 0.1, dof: 0.9 };
// the same room with the glass forehead on: a touch darker round him, so the glass reads
const GLASS_LIGHT = { ...flipLight(LIGHTS.day), pool: 0.56, halo: 0.12, dof: 0.9 };
// the cover is a still seen small: a softer drawn shadow, so his far cheek does not read as a smudge
const COVER_LIGHT = { ...MORN_LIGHT, form: 0.45, cast: 0.45, ao: 0.1 };
setLights({ hook: MORN_LIGHT, glass: GLASS_LIGHT, stroke: GLASS_LIGHT, button: MORN_LIGHT, cover: COVER_LIGHT });

// ---------------------------------------------------------------- his eyes (the rig's face fields; brows and mouth are brows.js's)
const EF = {
  strain: { eyeOpen: 1.05, pupil: 0.9, lookX: 0, lookY: -0.1, browY: 0, browTilt: 0, mouth: 'none', mouthOpen: 0, blink: 0, cross: 0, shutR: 0.55, shutL: 0 },
  wide: { eyeOpen: 1.32, pupil: 0.62, lookX: 0, lookY: 0, browY: 0, browTilt: 0, mouth: 'none', mouthOpen: 0, blink: 0, cross: 0, shutR: 0, shutL: 0 },
  flat: { eyeOpen: 0.95, pupil: 1, lookX: 0, lookY: 0.05, browY: 0, browTilt: 0, mouth: 'none', mouthOpen: 0, blink: 0.3, cross: 0, shutR: 0, shutL: 0 },
  up: { eyeOpen: 1.12, pupil: 0.85, lookX: 0.1, lookY: -1, browY: 0, browTilt: 0, mouth: 'none', mouthOpen: 0, blink: 0, cross: 0, shutR: 0, shutL: 0 },
  calm: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 0, browTilt: 0, mouth: 'none', mouthOpen: 0, blink: 0, cross: 0, shutR: 0, shutL: 0 },
  sly: { eyeOpen: 1.05, pupil: 0.95, lookX: 0, lookY: 0, browY: 0, browTilt: 0, mouth: 'none', mouthOpen: 0, blink: 0, cross: 0, shutR: 0, shutL: 0.42 },
};
const efMix = (a, b, k) => lerpFace(a, b, clamp(k));

// ---------------------------------------------------------------- the state of everything, at any time
// The hook's state (frame 0 is tt = 0): him straining for the screen-right brow, his finger pointing at it.
function hookState(tt) {
  const c = cu();
  const st = 0.5 + 0.5 * ramp(tt, c.one, c.eyebrows_end, E.inOutSine);   // how hard he strains
  return {
    brows: { l: { lift: 0.02 + 0.04 * Math.sin(tt * 9), shake: 0.5 * st, tilt: -0.2 }, r: { lift: 0.42 + 0.22 * st + 0.05 * Math.sin(tt * 13), shake: 0.9 * st, arch: 0.45 } },
    face: EF.strain, mouth: { twist: 0.55, tongue: 0.75, l: -0.1, r: 0.15 }, flush: 0.25 + 0.4 * st, sweat: ramp(tt, c.eyebrows - 0.1, c.eyebrows_end),
    finger: { on: 1, press: 0, tap: popK(tt, c.one - 0.04, c.one + 0.22, 0.06, 0.12) },
  };
}
function lerpState(a, b, k) {
  const L = (x = 0, y = 0) => lerp(x, y, k), out = {};
  const BL = (p = {}, q = {}) => ({ lift: L(p.lift, q.lift), shake: L(p.shake, q.shake), arch: L(p.arch, q.arch), tilt: L(p.tilt, q.tilt), press: L(p.press, q.press) });
  out.brows = { l: BL(a.brows.l, b.brows.l), r: BL(a.brows.r, b.brows.r) };
  out.face = efMix(a.face, b.face, k);
  const ma = a.mouth || {}, mb = b.mouth || {};
  out.mouth = { l: L(ma.l, mb.l), r: L(ma.r, mb.r), twist: L(ma.twist, mb.twist), tongue: L(ma.tongue, mb.tongue), open: L(ma.open, mb.open) };
  out.flush = L(a.flush, b.flush); out.sweat = L(a.sweat, b.sweat);
  const fa = a.finger || { on: 0, press: 0 }, fb = b.finger || { on: 0, press: 0 };
  out.finger = { on: L(fa.on, fb.on), press: L(fa.press, fb.press), tap: L(fa.tap, fb.tap) };
  return out;
}

function ebState(t) {
  const c = cu(), D = dur();
  const tt = t > D - 0.4 ? t - D : t;                 // the last frames are frame 0 coming round again
  if (tt < 0) {
    const a = ebState0(D - 0.4), b = hookState(0), k = E.inOutCubic(ramp(tt, -0.4, -0.05));
    const S = Object.assign({}, a, lerpState(a, b, k));
    S.tt = tt; S.dome = null;
    return S;
  }
  const S = ebState0(t); S.tt = tt;
  return S;
}
function ebState0(t) {
  const c = cu();
  let S;
  if (t < c.pop - 0.04) S = hookState(t);
  else {
    S = { brows: { l: { lift: 0 }, r: { lift: 0 } }, face: EF.calm, mouth: {}, flush: 0, sweat: 0, finger: null, dome: null, handle: null };
    // ---------- both brows shoot up (the viewer's result), and again
    const pop = E.outBack(ramp(t, c.pop - 0.04, c.pop + 0.13), 2.6);
    const settle = ramp(t, c.up, c.right_end, E.inOutSine);
    const pop2 = E.outBack(ramp(t, c.pop2 - 0.04, c.pop2 + 0.12), 2.4);
    let lift = 1.05 * pop * (1 - 0.65 * settle) + 0.55 * pop2;
    // ---------- the answer: the strings drop onto his brows, the handle yanks them
    const yank = tugK(t, c.yank, 0.22, 0.08, 0.3);
    if (t > c.relax) lift = lerp(lift, 0.35, ramp(t, c.relax, c.drop + 0.2, E.inOutSine)) + 0.75 * yank;
    if (t >= c.each - 0.05) lift = 0.35 * (1 - ramp(t, c.each - 0.05, c.each + 0.3, E.inOutSine));
    const finger = t < c.pop + 0.25 ? { on: 1 - ramp(t, c.pop, c.pop + 0.25, E.inCubic), press: 0, tap: 0 } : null;
    S.finger = finger;
    S.brows.l.lift = lift; S.brows.r.lift = lift * 1.02;
    S.brows.l.shake = 0.25 * bumpAt(t, c.pop, 5) + 0.3 * bumpAt(t, c.yank, 6); S.brows.r.shake = S.brows.l.shake;
    // ---------- his eyes and mouth through the hook and the answer
    let face = efMix(EF.wide, EF.flat, ramp(t, c.up - 0.1, c.right_end - 0.1));
    if (t > c.right_end - 0.15) face = efMix(EF.strain, EF.wide, ramp(t, c.pop2 - 0.05, c.pop2 + 0.08));
    if (t > c.relax - 0.05) face = efMix(EF.wide, EF.up, ramp(t, c.drop - 0.1, c.drop + 0.15) * (1 - ramp(t, c.drop + 0.75, c.drop + 1.05)));
    if (t > c.drop + 1.05) face = efMix(EF.calm, EF.wide, yank + bumpAt(t, c.yank + 0.3, 3) * 0.6);
    S.face = face;
    S.mouth = { open: 0.7 * pop * (1 - ramp(t, c.up, c.up + 0.3)) + 0.5 * pop2 * (1 - ramp(t, c.pop2 + 0.2, c.pop2 + 0.5)) + 0.45 * yank, twist: t < c.pop2 ? 0 : 0.3 * (1 - ramp(t, c.pop2, c.pop2 + 0.2)), l: 0, r: 0 };
    if (t > c.right_end - 0.15 && t < c.pop2 + 0.05) { S.mouth.twist = 0.55; S.mouth.tongue = 0.6; S.brows.r.shake = 0.8; S.brows.r.lift = Math.max(S.brows.r.lift, 0.3); }
    S.flush = 0.6 * (1 - ramp(t, c.pop, c.pop + 0.5)) + 0.4 * (t > c.right_end - 0.15 && t < c.pop2 + 0.3 ? 1 : 0);
    S.sweat = 1 - ramp(t, c.pop + 0.2, c.pop + 0.6);
    // ---------- the handle: down from above on "Relax", the yank, up and away as the glass comes
    if (t > c.drop - 0.05 && t < c.each + 0.3) {
      S.handle = { k: E.outBack(ramp(t, c.drop - 0.05, c.drop + 0.3), 1.5), yank, away: ramp(t, c.each - 0.12, c.each + 0.22, E.inCubic), swing: Math.sin((t - c.drop) * 5) * Math.exp(-(t - c.drop) * 1.6) };
    }
    // ---------- the glass forehead, the halves and their strings
    if (t > c.each - 0.08 && t < c.still + 0.35) {
      const Dm = { k: ramp(t, c.each - 0.08, c.each + 0.22) * (1 - ramp(t, c.still - 0.02, c.still + 0.2)), halves: ramp(t, c.each - 0.02, c.brain + 0.1), browStr: ramp(t, c.holds - 0.1, c.brows_end - 0.6, E.inOutSine), pull: { l: 0, r: 0 }, mouthPull: { l: 0, r: 0 }, dim: { l: 0, r: 0 }, mouthStr: 0 };
      // tied to BOTH brows: each half tugs, both brows rise
      Dm.pull.l = tugK(t, c.both2 - 0.08, 0.4); Dm.pull.r = tugK(t, c.brows_end + 0.02, 0.35);
      // the half smile: two more strings, crossed; the screen-left half lifts the screen-right corner
      Dm.mouthStr = ramp(t, c.now, c.smile + 0.05, E.inOutSine);
      Dm.mouthPull.l = tugK(t, c.smirk - 0.1, c.right2_end - c.smirk + 0.15, 0.14, 0.25) + tugK(t, c.per - 0.06, 0.45);
      Dm.mouthPull.r = tugK(t, c.oneside - 0.06, 0.4);
      // the stroke: the screen-left half goes dark; the other still lifts both brows
      Dm.dim.l = ramp(t, c.dim, c.dim + 0.35) * (1 - ramp(t, c.still - 0.05, c.still + 0.2));
      if (t > c.thats - 0.2) { Dm.mouthPull.l = 0; Dm.mouthPull.r = 0; }
      Dm.pull.r += tugK(t, c.lifts - 0.12, c.sides_end - c.lifts + 0.35, 0.16, 0.3);
      Dm.ticks = [ramp(t, c.lifts + 0.1, c.lifts + 0.45), ramp(t, c.bothsides - 0.05, c.bothsides + 0.3)].map((k) => k * (1 - ramp(t, c.still - 0.1, c.still + 0.1)));
      S.dome = Dm;
      const bl = 0.68 * Math.max(Dm.pull.l, Dm.pull.r);
      S.brows.l.lift = Math.max(S.brows.l.lift, bl); S.brows.r.lift = Math.max(S.brows.r.lift, bl);
      S.brows.l.shake = 0.3 * (bumpAt(t, c.both2, 6) + bumpAt(t, c.brows_end + 0.1, 6)); S.brows.r.shake = S.brows.l.shake;
      S.mouth = { l: 0.85 * Dm.mouthPull.r, r: 0.85 * Dm.mouthPull.l - 0.75 * Dm.dim.l, twist: 0 };
      // his eyes: up at the halves as they pop on, sly for the half smile, worried for the stroke, then back
      let f = EF.calm;
      if (t < c.holds) f = efMix(EF.calm, EF.up, ramp(t, c.each + 0.1, c.each + 0.35) * (1 - ramp(t, c.brain + 0.3, c.holds)));
      else if (t > c.smirk - 0.15 && t < c.mouth) f = efMix(EF.calm, EF.sly, ramp(t, c.smirk - 0.15, c.smirk + 0.1));
      else if (t > c.thats) f = efMix(EF.calm, { ...EF.calm, lookX: -0.7, eyeOpen: 1.1 }, ramp(t, c.doctors - 0.1, c.doctors + 0.2) * (1 - ramp(t, c.lifts - 0.2, c.lifts)));
      if (bl > 0.3) f = efMix(f, EF.wide, bl * 0.6);
      S.face = f;
    }
    // ---------- the button: the glass goes, his finger holds the screen-right brow down, the other rises alone
    if (t > c.still - 0.1) {
      const on = ramp(t, c.cant_end - 0.15, c.hold + 0.25, E.inOutCubic), pr = ramp(t, c.press, c.press + 0.16, E.inOutCubic);
      S.finger = { on, press: pr, tap: 0 };
      const sly = E.outBack(ramp(t, c.sly - 0.04, c.sly + 0.18), 2.2);
      S.brows.r = { lift: 0.2 * (1 - pr), press: pr, shake: 0 };
      S.brows.l = { lift: 1.05 * sly, arch: 0.9 * sly, tilt: -0.35 * sly, shake: 0.2 * bumpAt(t, c.sly, 7) };
      S.mouth = { l: 0.8 * sly, r: -0.05 * sly, twist: 0 };
      const dart = t > c.nobody - 0.05 && t < c.wink ? Math.sin((t - c.nobody + 0.05) / (c.wink - c.nobody + 0.05) * Math.PI * 2) * 0.9 : 0;
      let f = efMix(EF.calm, { ...EF.sly, shutL: 0.25 + 0.3 * pr }, pr);
      f = { ...f, lookX: dart };
      f.shutL = Math.max(f.shutL || 0, popK(t, c.wink, c.wink + 0.38, 0.06, 0.1));
      S.face = f;
    }
  }
  return S;
}

// ---------------------------------------------------------------- the camera
function hookCamAt(tt) {
  const c = cu();
  const z = 4.42 + 0.16 * ramp(tt, 0, c.eyebrows_end, E.inOutSine);
  return { x: 540, y: 1022, zoom: z, rot: 0, sx: 0, sy: 0 };
}
function ebCam(t) {
  const c = cu(), D = dur();
  if (t > D - 0.4) {   // into frame 0
    const a = ebCam0(D - 0.4), b = hookCamAt(0), k = E.inOutCubic(ramp(t - D, -0.4, -0.05));
    return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), zoom: lerp(a.zoom, b.zoom, k), rot: 0, sx: 0, sy: 0 };
  }
  return ebCam0(t);
}
function ebCam0(t) {
  const c = cu();
  let cam;
  if (t < c.pop - 0.04) cam = hookCamAt(t);
  else if (t < c.each - 0.1) {
    const z0 = hookCamAt(c.pop - 0.04).zoom;
    cam = camKeys(t, [[c.pop - 0.04, 540, 1022, z0], [c.pop + 0.12, 540, 1010, z0 - 0.3], [c.right_end, 540, 1016, 4.3], [c.relax, 540, 1012, 4.25],
      [c.drop + 0.35, 540, 1000, 4.0], [c.yank, 540, 1000, 4.02], [c.each - 0.1, 540, 1000, 4.05]]);
    cam.sx = 7 * bumpAt(t, c.pop, 12) * Math.sin(t * 80) + 5 * bumpAt(t, c.yank, 12) * Math.sin(t * 70);
    cam.sy = 3 * bumpAt(t, c.pop2, 14) * Math.sin(t * 66);
  } else if (t < c.thats - 0.1) {
    cam = camKeys(t, [[c.each - 0.1, 540, 1000, 4.05], [c.each + 0.35, 540, 996, 4.9], [c.brain + 0.2, 540, 994, 5.8], [c.both2, 540, 994, 6.0],
      [c.brows_end + 0.2, 540, 996, 5.9], [c.now, 540, 1010, 5.0], [c.smile, 540, 1036, 4.55], [c.easy, 540, 1040, 4.6], [c.mouth, 540, 1040, 4.55],
      [c.side_end, 540, 1038, 4.5], [c.thats - 0.1, 540, 1036, 4.45]]);
    cam.sy = 3 * bumpAt(t, c.both2, 12) * Math.sin(t * 60);
  } else if (t < c.still - 0.1) {
    cam = camKeys(t, [[c.thats - 0.1, 540, 1036, 4.45], [c.dim + 0.4, 540, 1034, 4.5], [c.doctors, 540, 1030, 4.42], [c.lifts, 540, 1028, 4.48], [c.still - 0.1, 540, 1028, 4.4]]);
  } else {
    cam = camKeys(t, [[c.still - 0.1, 540, 1030, 4.4], [c.hold, 540, 1022, 4.3], [c.sly, 540, 1020, 4.32], [c.know_end, 540, 1022, 4.4], [c.know_end + 1.2, 540, 1022, 4.42]]);
    cam.sx = 4 * bumpAt(t, c.sly, 12) * Math.sin(t * 70);
  }
  cam.rot = 0; cam.sx = cam.sx || 0; cam.sy = cam.sy || 0;
  return cam;
}

// ---------------------------------------------------------------- him
function ebHero(cam, t, S) {
  const pal = MIRPAL;
  const A = { face: S.face, bob: 1.6 * Math.sin(t * loopW(2.3)), headRot: 0.012 * Math.sin(t * loopW(1.7)) };
  if (S.finger && S.finger.on > 0.01) {   // the right arm up to his temple (a finger at the brow), or hanging
    const on = clamp(S.finger.on), pr = clamp(S.finger.press || 0);
    const up = { e: [lerp(132, 124, pr), lerp(-318, -330, pr)], w: [lerp(86, 82, pr), lerp(-446, -458, pr)] };
    A.armR = mirArmMix(MIR_ARM.rest, up, E.inOutCubic(on));
  }
  const st = mirSt(A), D = S.dome, glass = D ? clamp(D.k) : 0;
  const H = { face: S.face, brows: S.brows, mouth: S.mouth, flush: S.flush, sweat: S.sweat };
  const out = {};
  const r = charLayer(cam, st, t, {
    pal, ambient: 0.04,
    post: (lc, rr, s2) => {
      lc.save(); lc.translate(s2.x, s2.y); lc.scale(s2.s, s2.s);
      mirInHead(lc, s2, (c) => {
        actor(() => ebHeadBase(c, pal, H, t));
        const DD = D ? { ...D, brows: S.brows, mouth: S.mouth } : null;
        // the brain scales with the glass as it pops on and off (they leave together); its strings only once the glass is whole
        const gsc = E.outBack(glass, 1.4), inGlass = (fn) => { c.save(); c.translate(0, -44); c.scale(gsc, gsc); c.translate(0, 44); fn(); c.restore(); };
        if (DD && glass > 0.01) { ebDome(c, t, DD); inGlass(() => paint(() => ebBrainBody(c, t, DD))); }
        ebHeadFront(c, pal, H, t, glass);
        if (DD && glass > 0.97) paint(() => { ebHalfStrings(c, t, DD); ebTicks(c, (DD.ticks || [0, 0])[0], (DD.ticks || [0, 0])[1]); });
      });
      if (S.finger && S.finger.on > 0.01) out.finger = actor(() => ebFinger(lc, s2, rr, pal, { ...S.finger, B: S.brows.r }));
      lc.restore();
    },
  });
  const P = (lx, ly) => mirHeadPt(st, lx, ly);
  return Object.assign(out, { st, r, head: P(0, 0), at: P });
}

// the strings of the answer, in the world: from the handle's two ends down to the brows
function ebHandleDraw(cam, t, S, Hh) {
  const h = S.handle;
  if (!h || h.k <= 0.01) return;
  const brow = (s) => Hh.at(...EB_BROW_PT(s, S.brows[s < 0 ? 'l' : 'r']));
  const top = Hh.at(0, -88);
  const hx = 540, hy = lerp(top[1] - 220, top[1] - 62, h.k) - 16 * h.yank - 260 * h.away * h.away;
  applyCam(cam);
  const rot = 0.12 * h.swing;
  const ends = [-1, 1].map((e) => [hx + e * 54 * 0.62 * Math.cos(rot), hy + 2 * 0.62 + e * 54 * 0.62 * Math.sin(rot)]);
  // the string up out of the frame, the two strings down to his brows
  ebString(ctx, [hx, hy - 30 * 0.62], [hx, hy - 400], { w: 1.5 });
  for (const [i, s] of [[0, -1], [1, 1]]) ebString(ctx, ends[i], brow(s), { w: 1.5, slack: 3 * (1 - h.yank) * (1 - h.k * 0.5) });
  ebHandle(ctx, hx, hy, 0.62, { rot });
}

// ---------------------------------------------------------------- one frame of the world (every shot draws this)
function ebFrame(t) {
  const S = ebState(t), cam = ebCam(t);
  mirRoom(cam, t, { night: false });
  applyCam(cam);
  const H = ebHero(cam, t, S);
  applyCam(cam);
  ebHandleDraw(cam, t, S, H);
  return { S, H, cam };
}

// ---------------------------------------------------------------- labels (screen space)
function ebTag(txt, x, y, col, k, size = 40, ink = '#0B0B1A') {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + size * 0.9, h = size * 1.5;
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = col; ctx.fill();
  ctx.fillStyle = ink; ctx.fillText(txt, 0, 2);
  ctx.restore();
}
// world point -> screen point under a camera
const ebScr = (cam, p) => [W / 2 + (cam.sx || 0) + (p[0] - cam.x) * cam.zoom, H / 2 + (cam.sy || 0) + (p[1] - cam.y) * cam.zoom];

// ---------------------------------------------------------------- shots
SC.hook = (lt, t, shot) => {
  const c = cu(), F = ebFrame(t), cam = F.cam;
  // the pop: shock lines round his head
  const hd = ebScr(cam, F.H.at(0, -30));
  shockLines(hd[0], hd[1], 250, ramp(t, c.pop - 0.02, c.pop + 0.4), 12, '#FFFFFF', 3);
  shockLines(hd[0], hd[1], 240, ramp(t, c.pop2 - 0.02, c.pop2 + 0.35), 10, '#FFFFFF', 5);
  // BOTH! as they jump
  ebTag('BOTH!', 540, 545, '#FF5A6E', popK(t, c.pop + 0.02, c.up + 0.25, 0.08, 0.12), 86, '#FFFFFF');
  return { glow: 0.85, zblur: 0.05 * bumpAt(t, c.pop, 10), push: { k: 1, cx: 540, cy: 900 } };
};

SC.glass = (lt, t, shot) => {
  const c = cu(), F = ebFrame(t);
  return { glow: 0.85, push: { k: 1, cx: 540, cy: 960 } };
};

SC.stroke = (lt, t, shot) => {
  const c = cu(), F = ebFrame(t);
  ebTag("DOCTOR'S CHECK", 540, 508, '#8FB8FF', popK(t, c.doctors - 0.05, c.check - 0.02, 0.08, 0.06), 40);
  ebTag('BOTH ✓', 540, 508, '#4DFFB4', popK(t, c.check, c.still - 0.05, 0.08, 0.1), 50);
  return { glow: 0.85, push: { k: 1, cx: 540, cy: 960 } };
};

SC.button = (lt, t, shot) => {
  const c = cu(), F = ebFrame(t), cam = F.cam;
  // the lone brow goes up: a little sparkle by it
  const b = ebScr(cam, F.H.at(-26, -44));
  if (t > c.sly) { const k = ramp(t, c.sly, c.sly + 0.45); if (k < 1) for (const e of [0, 1, 2]) { const a = -2.3 + e * 0.5, r = 34 + 50 * k; paint(() => { screenSpace(); line(ctx, b[0] + Math.cos(a) * r, b[1] + Math.sin(a) * r, b[0] + Math.cos(a) * (r + 26 * (1 - k)), b[1] + Math.sin(a) * (r + 26 * (1 - k)), 6, rgba('#FFE38A', 1 - k)); }); } }
  return { glow: 0.85, push: { k: 1, cx: 540, cy: 960 } };
};

// ---------------------------------------------------------------- the cover: both brows up, the strings, the question
SC.cover = (lt, t) => {
  const c = cu(), tc = c.yank + 0.05, S = ebState(tc);
  S.brows.l.lift = S.brows.r.lift = 1.0;
  S.face = EF.wide; S.mouth = { open: 0.6 };
  const cam = { x: 540, y: 1035, zoom: 3.65, rot: 0, sx: 0, sy: 0 };
  mirRoom(cam, tc, { night: false });
  applyCam(cam);
  const Hh = ebHero(cam, tc, S);
  S.handle = { k: 1, yank: 1, away: 0, swing: 0 };
  ebHandleDraw(cam, tc, S, Hh);
  screenSpace();
  bigWord('RAISE JUST', 540, 1262, 128, '#FFFFFF', 1, -0.03);
  bigWord('ONE?', 540, 1410, 180, '#FFD447', 1, -0.03);
  return { glow: 0.85, noCaptions: true };
};

function initScenes2() {
  initMirror();
}
