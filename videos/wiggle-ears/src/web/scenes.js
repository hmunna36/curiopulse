// Why Can't Most People WIGGLE Their Ears? Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside
// the shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
// One world: a party at night (time-flies' room out of focus), him close in a gold headband with two springy stars, straining
// to wiggle his ears; his forehead opens on the brain's room (time-flies' brain), his ear turns to glass where he stands
// (ears.js), and back to frame 0. Sides are SCREEN sides: l = screen-left (his right ear), r = screen-right (his left).
'use strict';

const cu = () => TLd.cues;
const dur = () => (TLd.duration > 5 ? TLd.duration : cu().you_end + 1.6);   // the cover renders from a 2-frame timeline
const bumpAt = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);
// a tug: up in `up` s, held, let go
const tugK = (t, t0, hold = 0.3, up = 0.1, down = 0.25) => clamp((t - t0) / up) * (1 - clamp((t - t0 - up - hold) / down));

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the party: warm string lights above and to the left (the key), a cool night window behind him on the right (the rim)
const PARTY_L = { ...LIGHTS.candle, pool: 0.5, halo: 0.12, dof: 0.9 };
// the same room with his ear as glass: a touch darker round him, so the glass reads
const GLASS_L = { ...LIGHTS.candle, pool: 0.58, halo: 0.12, dof: 0.9 };
// the cover is a still seen small: a softer drawn shadow
const COVER_L = { ...PARTY_L, form: 0.45, cast: 0.45, ao: 0.1 };
setLights({ hook: PARTY_L, brain: LIGHTS.inside, brows: PARTY_L, muscles: GLASS_L, wires: GLASS_L, party: GLASS_L, button: GLASS_L, cover: COVER_L });

// ---------------------------------------------------------------- his eyes (the rig's face fields; brows and mouth are brows.js's)
const EF = {
  strain: { eyeOpen: 1.08, pupil: 0.85, lookX: 0, lookY: -0.15, browY: 0, browTilt: 0, mouth: 'none', mouthOpen: 0, blink: 0, cross: 0, shutR: 0, shutL: 0 },
  squeeze: { eyeOpen: 0.82, pupil: 0.8, lookX: 0, lookY: 0, browY: 0, browTilt: 0, mouth: 'none', mouthOpen: 0, blink: 0.42, cross: 0, shutR: 0, shutL: 0 },
  wide: { eyeOpen: 1.32, pupil: 0.62, lookX: 0, lookY: 0, browY: 0, browTilt: 0, mouth: 'none', mouthOpen: 0, blink: 0, cross: 0, shutR: 0, shutL: 0 },
  flat: { eyeOpen: 0.95, pupil: 1, lookX: 0, lookY: 0.1, browY: 0, browTilt: 0, mouth: 'none', mouthOpen: 0, blink: 0.38, cross: 0, shutR: 0, shutL: 0 },
  calm: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 0, browTilt: 0, mouth: 'none', mouthOpen: 0, blink: 0, cross: 0, shutR: 0, shutL: 0 },
  side: { eyeOpen: 1.1, pupil: 0.95, lookX: -1, lookY: 0.05, browY: 0, browTilt: 0, mouth: 'none', mouthOpen: 0, blink: 0, cross: 0, shutR: 0, shutL: 0 },
  squint: { eyeOpen: 0.9, pupil: 1, lookX: -0.9, lookY: 0, browY: 0, browTilt: 0, mouth: 'none', mouthOpen: 0, blink: 0.45, cross: 0, shutR: 0, shutL: 0 },
  sly: { eyeOpen: 1.05, pupil: 0.95, lookX: 0, lookY: 0, browY: 0, browTilt: 0, mouth: 'none', mouthOpen: 0, blink: 0, cross: 0, shutR: 0, shutL: 0.38 },
};
const efMix = (a, b, k) => lerpFace(a, b, clamp(k));

// ---------------------------------------------------------------- the state of everything, at any time
// The hook's state (frame 0 is tt = 0): straining to wiggle his ears; his brows bob up and down, his ears do not move, his eyes
// dart to the side to catch them at it. Valid for negative tt too (the last second of the Short runs into it).
const WG_BOBW = () => loopW(2 * Math.PI * 2.6);
function hookState(tt) {
  const c = cu();
  const st = 0.55 + 0.45 * ramp(tt, c.one, c.ears_end, E.inOutSine);   // how hard he strains
  const ph = tt * WG_BOBW();
  const lift = 0.52 + 0.48 * Math.sin(ph), lift2 = 0.52 + 0.48 * Math.sin(ph - 0.35);
  // his eyes: a hold on one ear, a flick to the other (a square-ish wave that starts on the screen-left ear)
  const sq = Math.sin(tt * loopW(2 * Math.PI * 0.55) + Math.PI / 2), look = -0.95 * Math.tanh(3.2 * sq);
  return {
    brows: { l: { lift, shake: 0.25 * st }, r: { lift: lift2, shake: 0.25 * st } },
    face: { ...EF.strain, lookX: look }, mouth: { grit: 0.75 + 0.15 * st },
    flush: 0.25 + 0.35 * st, sweat: ramp(tt, c.wiggle, c.ears_end), bop: 0.7, headDY: 1.2 * Math.sin(ph + 0.6),
    ears: { l: {}, r: {} }, glass: null,
  };
}
function lerpState(a, b, k) {
  const L = (x = 0, y = 0) => lerp(x, y, k), out = {};
  const BL = (p = {}, q = {}) => ({ lift: L(p.lift, q.lift), shake: L(p.shake, q.shake), arch: L(p.arch, q.arch), tilt: L(p.tilt, q.tilt), press: L(p.press, q.press) });
  out.brows = { l: BL(a.brows.l, b.brows.l), r: BL(a.brows.r, b.brows.r) };
  out.face = efMix(a.face, b.face, k);
  const ma = a.mouth || {}, mb = b.mouth || {};
  out.mouth = { l: L(ma.l, mb.l), r: L(ma.r, mb.r), twist: L(ma.twist, mb.twist), tongue: L(ma.tongue, mb.tongue), open: L(ma.open, mb.open), grit: L(ma.grit, mb.grit) };
  for (const f of ['flush', 'sweat', 'bop', 'headDY', 'headDX', 'headRot']) out[f] = L(a[f], b[f]);
  out.ears = { l: {}, r: {} };
  out.glass = a.glass && k < 0.5 ? a.glass : (b.glass || null);
  return out;
}

const GL0 = () => ({ k: 0, awake: 0, tug: {}, flex: {}, jolt: 0, wire: 0, badges: [0, 0, 0], zz: 0, clock: 0 });
function wgState(t) {
  const c = cu(), D = dur();
  const tLoop = c.you_end + 0.42;                       // he goes back to straining: frame 0 coming round again
  if (t > tLoop) {
    const a = wgState0(tLoop), b = hookState(t - D), k = E.inOutCubic(ramp(t, tLoop, tLoop + 0.35));
    const S = Object.assign({}, a, lerpState(a, b, k));
    S.glass = null;
    return S;
  }
  return wgState0(t);
}
function wgState0(t) {
  const c = cu();
  if (t < c.clamp) return hookState(t);
  const S = { brows: { l: { lift: 0 }, r: { lift: 0 } }, face: EF.calm, mouth: {}, flush: 0, sweat: 0, bop: 0.25, headDY: 0, headDX: 0, headRot: 0, ears: { l: {}, r: {} }, glass: null };
  // ---------- "No eyebrows!": the brows slam down and tremble; his ears still do not move
  if (t < c.deflate + 0.05) {
    const h = hookState(t), cl = ramp(t, c.clamp, c.clamp + 0.12, E.outCubic);
    const keep = 1 - ramp(t, c.nope - 0.05, c.deflate + 0.05, E.inOutSine);
    S.brows = { l: { lift: lerp(h.brows.l.lift, 0, cl), press: 0.75 * cl * keep, shake: 0.25 + 0.75 * cl }, r: { lift: lerp(h.brows.r.lift, 0, cl), press: 0.75 * cl * keep, shake: 0.25 + 0.75 * cl } };
    S.face = efMix(h.face, EF.squeeze, cl);
    S.mouth = { grit: lerp(h.mouth.grit, 1.0, cl) };
    S.flush = lerp(h.flush, 0.95, cl); S.sweat = 1; S.bop = 0.7 + 0.3 * cl;
    S.headDY = 1.5 * Math.sin(t * 40) * cl * keep;
    if (t > c.nope - 0.05) {   // "Nope?": he gives up
      const d = ramp(t, c.nope - 0.05, c.deflate + 0.05, E.inOutSine);
      S.face = efMix(S.face, EF.flat, d);
      S.mouth = d < 0.35 ? { grit: S.mouth.grit * (1 - d / 0.35) } : { l: -0.45 * d, r: -0.45 * d, twist: 0 };
      S.flush = lerp(S.flush, 0.3, d); S.bop = lerp(S.bop, 0.25, d); S.headDY = 3 * d;
      S.brows.l = { lift: 0.05, tilt: 0.55 * d, shake: 0.3 * (1 - d) }; S.brows.r = { lift: 0.05, tilt: 0.55 * d, shake: 0.3 * (1 - d) };
    }
    return S;
  }
  // ---------- the window on his forehead, the dive (after "Nope?": deflated, looking up at it)
  if (t < c.eb - 0.06) {
    S.face = efMix(EF.flat, { ...EF.calm, lookY: -1, eyeOpen: 1.12 }, ramp(t, c.win - 0.1, c.win + 0.2));
    S.mouth = { l: -0.45, r: -0.45 }; S.flush = 0.3; S.sweat = 1 - ramp(t, c.deflate, c.deflate + 0.6); S.headDY = 3;
    S.brows.l = { lift: 0.2, tilt: 0.55 }; S.brows.r = { lift: 0.2, tilt: 0.55 };
    return S;
  }
  // ---------- EYEBROWS!: both shoot up, on springs
  const boing = E.outBack(ramp(t, c.boing - 0.04, c.boing + 0.12), 2.6);
  const spring = t > c.boing ? 0.22 * Math.exp(-(t - c.boing) * 4) * Math.cos((t - c.boing) * 26) : 0;
  const settle = ramp(t, c.eb_end + 0.15, c.your_ear + 0.25, E.inOutSine);
  const bl = (1.25 * boing + spring) * (1 - 0.8 * settle);
  S.brows.l = { lift: bl, shake: 0.4 * bumpAt(t, c.boing, 4), arch: 0.4 * boing * (1 - settle) };
  S.brows.r = { lift: bl * 1.02, shake: 0.4 * bumpAt(t, c.boing, 4), arch: 0.4 * boing * (1 - settle) };
  S.face = efMix(EF.wide, EF.calm, settle);
  S.mouth = { open: 0.75 * boing * (1 - ramp(t, c.eb_end - 0.1, c.eb_end + 0.25)), l: 0, r: 0 };
  S.bop = 0.25 + 0.9 * bumpAt(t, c.boing, 2.5);
  S.headDY = -3 * boing * (1 - settle);
  // ---------- his ear turns to glass: three muscles, asleep
  if (t > c.glass - 0.02) {
    const G = GL0();
    G.k = ramp(t, c.glass, c.glass + 0.32);
    G.clock = t;
    G.zz = ramp(t, c.zzz, c.zzz + 0.3) * (1 - ramp(t, c.light + 0.2, c.light + 0.5));
    G.badges = [ramp(t, c.m1, c.m1 + 0.2), ramp(t, c.m2, c.m2 + 0.2), ramp(t, c.m3, c.m3 + 0.2)].map((k) => k * (1 - ramp(t, c.and_w - 0.1, c.and_w + 0.15)));
    // the wires light up; the muscles wake
    G.wire = ramp(t, c.light, c.light + 0.3) * (1 - ramp(t, c.noise + 0.3, c.noise + 0.8));
    G.awake = ramp(t, c.light + 0.35, c.light + 0.5);
    // the balloon pops: a jolt; the ear twitches at once (the reflex), and twice on "twitch"
    G.jolt = bumpAt(t, c.pop, 5);
    if (t > c.pop) G.awake = 1;
    const tw = 0.6 * tugK(t, c.pop + 0.08, 0.06, 0.06, 0.16) + tugK(t, c.tw1, 0.08, 0.06, 0.18) + 0.85 * tugK(t, c.tw2, 0.06, 0.06, 0.16);
    G.tug = { back: tw, top: 0.7 * tw, front: 0.25 * tw };
    S.ears.l = { tw };
    G.tw = tw;
    // the loud party: the top ones tense, then FLEX; "still trying": they keep pumping
    const ten = ramp(t, c.top - 0.1, c.top + 0.2), fl = ramp(t, c.flexk, c.flexk + 0.14, E.outBack);
    const pump = t > c.theyre ? 0.35 + 0.35 * Math.sin((t - c.theyre) * 18) : 0;
    G.flex = { top: clamp(Math.max(fl, t > c.theyre ? 0.75 + 0.25 * Math.sin((t - c.theyre) * 18) : 0)) };
    G.tug.top = Math.max(G.tug.top, 0.5 * ten, pump);
    G.tug.back = Math.max(G.tug.back, 0.4 * ten + 0.3 * fl, 0.5 * pump);
    // the glass goes after "Are you?"
    const off = ramp(t, c.shut, c.shut + 0.25);
    G.k *= 1 - off;
    S.glass = { l: G };
    if (t > c.noise - 0.1) {   // the other ear turns to glass for the party
      const G2 = Object.assign({}, G, { k: ramp(t, c.noise - 0.1, c.noise + 0.25) * (1 - off), badges: [0, 0, 0], zz: 0, wire: 0, jolt: 0 });
      G2.tug = { top: G.tug.top, back: G.tug.back, front: 0.2 * ten }; G2.flex = G.flex; G2.tw = 0;
      S.glass.r = G2;
    }
    // his face through it: curious at his own ear, a start at the pop, then straining to hear, then the challenge
    let f = efMix(EF.calm, EF.side, ramp(t, c.your_ear, c.muscles_end));
    f = efMix(f, EF.wide, 0.8 * bumpAt(t, c.pop, 3.5));
    if (t > c.noise - 0.1) f = efMix(f, EF.squint, ramp(t, c.noise, c.hear + 0.2));
    if (t > c.flexk - 0.1) f = efMix(f, { ...EF.squint, eyeOpen: 0.8, blink: 0.55 }, ramp(t, c.flexk - 0.1, c.flexk + 0.15));
    if (t > c.look) f = efMix(f, EF.sly, ramp(t, c.look, c.look + 0.25));
    S.face = f;
    if (t > c.noise - 0.1) {
      const lean = ramp(t, c.noise, c.hear + 0.3, E.inOutSine) * (1 - ramp(t, c.look - 0.1, c.look + 0.3, E.inOutSine));
      S.headRot = -0.09 * lean; S.headDX = -6 * lean;
      S.brows.l = { lift: 0.15 * lean, tilt: -0.35 * lean }; S.brows.r = { lift: 0.25 * lean, tilt: -0.25 * lean };
      S.mouth = { twist: 0.35 * lean, l: -0.1 * lean, r: 0.1 * lean, open: 0.1 * lean };
      S.sweat = ramp(t, c.flexk, c.flexk + 0.3) * (1 - ramp(t, c.look, c.look + 0.3));
      S.flush = 0.4 * ramp(t, c.flexk, c.flexk + 0.3) * (1 - ramp(t, c.look, c.look + 0.3));
    }
    if (t > c.look) {   // "Are you?": one brow up at us, a little smile
      const k = E.outBack(ramp(t, c.look, c.look + 0.22), 2);
      S.brows.r = { lift: 0.75 * k, arch: 0.6 * k, tilt: -0.2 * k }; S.brows.l = { lift: 0.05, tilt: -0.2 * k };
      S.mouth = { l: 0.1 * k, r: 0.6 * k, twist: 0 };
    }
  }
  return S;
}

// ---------------------------------------------------------------- the camera
function hookCamAt(tt) {
  const c = cu();
  const z = 4.8 + 0.14 * ramp(tt, 0, c.noeb_end, E.inOutSine);
  return { x: 540, y: 1018, zoom: z, rot: 0, sx: 0, sy: 0 };
}
// the window on his forehead (head units) and its size
const WIN = { lx: 0, ly: -47, R: 22 };
function wgCam(t, H) {
  const c = cu(), D = dur();
  const tLoop = c.you_end + 0.42;
  if (t > tLoop) {   // into frame 0
    const a = wgCam0(tLoop, H), b = hookCamAt(t - D), k = E.inOutCubic(ramp(t, tLoop, D - 0.05));
    return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), zoom: lerp(a.zoom, b.zoom, k), rot: 0, sx: 0, sy: 0 };
  }
  return wgCam0(t, H);
}
function wgCam0(t, Hst) {
  const c = cu();
  let cam;
  if (t < c.dive) {
    cam = t < c.clamp ? hookCamAt(t) : camKeys(t, [[c.clamp, 540, 1018, hookCamAt(c.clamp).zoom], [c.nope, 540, 1014, 4.95], [c.win, 540, 1008, 4.7], [c.dive, 540, 1004, 4.75]]);
    cam.sx = 6 * bumpAt(t, c.clamp, 10) * Math.sin(t * 70);
  } else if (t < c.eb - 0.06) {
    // the dive: centred on the window, zooming until it fills the frame (exponential, so it speeds up)
    const P = Hst ? mirHeadPt(Hst, WIN.lx, WIN.ly) : [540, 983];
    const u = E.inCubic(ramp(t, c.dive, c.dive_end));
    const z = 4.75 * Math.pow(54 / 4.75, u);
    const k = E.inOutCubic(ramp(t, c.dive, c.dive + 0.25));
    cam = { x: lerp(540, P[0], k), y: lerp(1004, P[1], k), zoom: z };
  } else if (t < c.your_ear - 0.05) {
    cam = camKeys(t, [[c.eb - 0.06, 540, 1016, 4.3], [c.boing + 0.12, 540, 1006, 4.1], [c.eb_end, 540, 1010, 4.2], [c.your_ear - 0.05, 540, 1012, 4.25]]);
    cam.sy = 9 * bumpAt(t, c.boing, 10) * Math.sin(t * 64);
  } else if (t < c.and_w) {
    // to his ear (screen left), which turns to glass
    cam = camKeys(t, [[c.your_ear - 0.05, 540, 1012, 4.25], [c.muscles_end, 486, 1012, 6.9], [c.three, 484, 1010, 7.2], [c.and_w, 484, 1010, 7.25]]);
  } else if (t < c.noise - 0.15) {
    // out a little to take in the balloon beside it, the pop, then in for the twitch
    cam = camKeys(t, [[c.and_w, 484, 1010, 7.25], [c.work_end - 0.05, 470, 1004, 5.7], [c.pop + 0.4, 470, 1004, 5.75], [c.makes, 482, 1010, 6.6], [c.twitch_end + 0.3, 484, 1010, 6.8], [c.noise - 0.15, 484, 1010, 6.8]]);
    cam.sx = 10 * bumpAt(t, c.pop, 11) * Math.sin(t * 75);
    cam.sy = 4 * bumpAt(t, c.tw1, 14) * Math.sin(t * 60);
  } else {
    // back out for the loud party (both ears as glass), then in again on "Are you?"
    cam = camKeys(t, [[c.noise - 0.15, 484, 1010, 6.8], [c.hear + 0.15, 540, 1004, 3.35], [c.top - 0.15, 540, 1004, 3.45], [c.flexk - 0.05, 490, 1000, 5.4], [c.theyre, 490, 1000, 5.6], [c.trying_end, 492, 1002, 5.7], [c.look + 0.05, 540, 1012, 4.3], [c.you_end + 0.42, 540, 1016, 4.7]]);
    cam.sx = 3 * bumpAt(t, c.flexk, 10) * Math.sin(t * 66);
  }
  cam.rot = 0; cam.sx = cam.sx || 0; cam.sy = cam.sy || 0;
  return cam;
}

// ---------------------------------------------------------------- the room behind him
function wgBack(cam, t) {
  screenSpace();
  ctx.fillStyle = '#1C0F33'; ctx.fillRect(0, 0, W, H);
  const k = 1.0 + (cam.zoom - 4.4) * 0.035, dx = -(cam.x - 540) * 0.55, dy = -(cam.y - 1020) * 0.55;
  const w = (W + 240) * k, h = (H + 240) * k, x0 = 540 - w / 2 + dx, y0 = 960 - h / 2 + dy;
  ctx.drawImage(PARTY_BG, x0, y0, w, h);
  for (let i = 0; i < 16; i++) {   // the string of lights twinkles (glow layer only)
    const u = i / 15, lx = x0 + (40 + u * 1240) * k, ly = y0 + (300 + 90 * Math.sin(Math.PI * u)) * k;
    softDot(gctx, lx, ly, 60, '#FFC27A', 0.2 + 0.1 * Math.sin(t * loopW(2.3) + i * 1.7));
  }
}
// the balloon beside his screen-left ear (world): where it is and how it sways
const BAL = { x: 432, y: 986, r: 22 };
function wgBalloonDraw(t) {
  const c = cu();
  if (t > c.pop + 0.01 && t < dur() - 1.0) return;   // gone after the pop (a new one floats back in for the loop)
  const back = t >= dur() - 1.0 ? E.outCubic(ramp(t, dur() - 1.0, dur() - 0.5)) : 1;
  const sw = 0.06 * Math.sin(t * loopW(1.3)), bob = 4 * Math.sin(t * loopW(1.9));
  wgBalloon(ctx, BAL.x - 60 * (1 - back), BAL.y + bob + 240 * (1 - back), BAL.r, t, { sway: sw });
}

// ---------------------------------------------------------------- him
function wgSt(t, S) {
  return mirSt({ face: S.face, bob: 1.4 * Math.sin(t * loopW(2.3)), headRot: (S.headRot || 0) + 0.01 * Math.sin(t * loopW(1.7)), headDX: S.headDX || 0, headDY: S.headDY || 0 });
}
function wgHero(cam, t, S, st0) {
  const pal = PARTYPAL;
  const st = st0 || wgSt(t, S);
  const H = { face: S.face, brows: S.brows, mouth: S.mouth, flush: S.flush, sweat: S.sweat, ears: S.ears, bop: S.bop, bopT: t };
  charLayer(cam, st, t, {
    pal, ambient: 0.04,
    post: (lc, rr, s2) => {
      lc.save(); lc.translate(s2.x, s2.y); lc.scale(s2.s, s2.s);
      mirInHead(lc, s2, (c) => {
        actor(() => wgHeadBase(c, pal, H, t));
        if (S.glass && S.glass.l) wgGlass(c, pal, -1, S.glass.l, t);
        if (S.glass && S.glass.r) wgGlass(c, pal, 1, S.glass.r, t);
        wgHeadFront(c, pal, H, t);
      });
      lc.restore();
    },
  });
  return { st, at: (lx, ly) => mirHeadPt(st, lx, ly) };
}

// ---------------------------------------------------------------- the brain's room (room units = screen px at 1:1)
const ROOM = { bx: 392, by: 940, bs: 1.05, px: 660, py: 496, kx: 612, ky: 958, ks: 1.0 };
const BROWS_BTN = () => [ROOM.kx + 92 * ROOM.ks, ROOM.ky + 19 * ROOM.ks];
function wgRoomState(t) {
  const c = cu(), R = { mood: 'worried', look: [0, 0], armL: null, armR: null, poster: 0, stamp: 0, remote: 0, press: 0 };
  R.look = [0.9 * Math.sin(t * 9), -0.2];
  if (t > c.poster - 0.1) { R.mood = 'sad'; R.look = [0.95, -0.75]; }
  R.poster = ramp(t, c.poster, c.poster + 0.22);
  R.stamp = ramp(t, c.stamp, c.stamp + 0.16);
  if (t > c.stamp && t < c.stamp + 0.55) R.mood = 'wow';
  if (t > c.shrug - 0.05 && t < c.grab) R.mood = 'shrug';
  if (t > c.grab) { R.mood = 'squint'; R.look = [0.9, 0.7]; }
  return R;
}
function wgRoomDraw(c, t, inWindow) {
  const C = cu(), R = wgRoomState(t);
  c.drawImage(MIND_BG, 0, 0);
  // the lamp (its glow only at full size)
  const lx = 540 + 16 * Math.sin(t * 0.9);
  line(c, 540, 0, lx, 330, 5, '#1A0E2C');
  c.beginPath(); c.moveTo(lx - 70, 380); c.quadraticCurveTo(lx, 290, lx + 70, 380); c.closePath(); c.fillStyle = '#2A1A44'; c.fill();
  ellipse(c, lx, 382, 46, 12, '#FFE7B0');
  if (!inWindow) softDot(gctx, lx, 390, 170, '#FFC98A', 0.45);
  wgPoster(c, ROOM.px, ROOM.py, 1, R.poster, R.stamp, t);
  // the brain, its arms to what it is doing
  const bx = ROOM.bx, by = ROOM.by, bs = ROOM.bs, bob = 5 * Math.sin(t * 2.4);
  const toB = (x, y) => [(x - bx) / bs, (y - by - bob) / bs];
  let armL = null, armR = null;
  if (t < C.poster) { armL = [-176 + 30 * Math.sin(t * 13), 100 + 20 * Math.cos(t * 13)]; armR = [176 + 30 * Math.sin(t * 11 + 1), 100 + 20 * Math.cos(t * 11)]; }   // patting itself down
  else if (t < C.shrug - 0.05) { armR = toB(ROOM.px - 18, ROOM.py + 214); }   // pointing at the poster (its edge: the text stays clear)
  else if (t < C.grab) { const k = E.outBack(ramp(t, C.shrug - 0.05, C.shrug + 0.2), 2); armL = [lerp(-176, -205, k), lerp(118, -40, k)]; armR = [lerp(176, 205, k), lerp(118, -40, k)]; }
  // the FACE controls: it mashes BROWS (a jab every 0.14 s)
  let press = 0;
  if (t > C.grab) {
    for (const j of C.jabs || []) press = Math.max(press, popK(t, j, j + 0.1, 0.035, 0.06));
    const btn = BROWS_BTN(), up = ramp(t, C.grab, C.grab + 0.2, E.outCubic);
    armR = toB(lerp(bx + 176 * bs, btn[0] + 6, up), lerp(by + 118 * bs, btn[1] - 46 * (1 - press) - 6, up));
  }
  wgConsole(c, ROOM.kx, ROOM.ky, ROOM.ks, { press, lit: press });
  actor(() => tfBrain(c, bx, by, bs, t, { mood: R.mood, look: R.look, armL, armR, lean: t > C.grab ? 0.06 : 0 }));
  return { press };
}
// the window on his forehead: an opaque disc first (it takes his head's place in the light's map), then the room in it
function wgWindow(cam, t, Hh, k) {
  if (k <= 0.01) return;
  const P = Hh.at(WIN.lx, WIN.ly), sp = toScreen(cam, P[0], P[1]);
  const r = WIN.R * cam.zoom * E.outBack(clamp(k), 1.8);
  screenSpace();
  ctx.beginPath(); ctx.arc(sp[0], sp[1], r + 7, 0, Math.PI * 2); ctx.fillStyle = '#C8A8FF'; ctx.fill();
  ctx.beginPath(); ctx.arc(sp[0], sp[1], r, 0, Math.PI * 2); ctx.fillStyle = '#2A1446'; ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(sp[0], sp[1], r, 0, Math.PI * 2); ctx.clip();
  const sc = Math.pow(clamp(r / 1144, 0.02, 1.2), 0.6);
  ctx.setTransform(sc, 0, 0, sc, sp[0] - 540 * sc, sp[1] - 960 * sc);
  wgRoomDraw(ctx, t, true);
  ctx.restore();
  screenSpace();
  paint(() => { ctx.beginPath(); ctx.arc(sp[0], sp[1], r + 3, 0, Math.PI * 2); ctx.lineWidth = 6; ctx.strokeStyle = '#E8DAFF'; ctx.stroke(); });
}

// ---------------------------------------------------------------- one frame of the party (every shot but the room draws this)
function wgFrame(t) {
  const S = wgState(t), st0 = wgSt(t, S);
  const cam = wgCam(t, st0);
  wgBack(cam, t);
  applyCam(cam);
  wgBalloonDraw(t);
  const Hh = wgHero(cam, t, S, st0);
  applyCam(cam);
  const c = cu();
  if (t > c.pop - 0.01) wgPop(BAL.x, BAL.y, BAL.r, t - c.pop);
  return { S, H: Hh, cam };
}

// ---------------------------------------------------------------- labels (screen space)
function wgTag(txt, x, y, col, k, size = 40, ink = '#0B0B1A', rot = 0) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + size * 0.9, h = size * 1.5;
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = col; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = '#0B0B1A'; ctx.stroke();
  ctx.fillStyle = ink; ctx.fillText(txt, 0, 2);
  ctx.restore();
}

// ---------------------------------------------------------------- shots
SC.hook = (lt, t, shot) => {
  const c = cu(), F = wgFrame(t), cam = F.cam;
  // 1 IN 5, beside his head while the line says it
  wgTag('1 IN 5', 860, 660, '#FFD447', popK(t, c.five - 0.04, c.nope - 0.1, 0.08, 0.12), 54, '#0B0B1A', 0.06);
  // the window opens on his forehead and the camera dives into it
  const wk = ramp(t, c.win, c.win + 0.22);
  wgWindow(cam, t, F.H, wk);
  const dv = ramp(t, c.dive, c.dive_end);
  return { glow: 0.85, zblur: 0.22 * Math.sin(Math.PI * dv), zcx: 540, zcy: 960, push: { k: 1, cx: 540, cy: 900 } };
};

SC.brain = (lt, t, shot) => {
  const c = cu();
  const cam = camKeys(t, [[c.dive_end, 540, 960, 1.0], [c.poster + 0.35, 610, 860, 1.12], [c.stamp - 0.1, 620, 860, 1.14], [c.stamp + 0.35, 790, 850, 1.5], [c.ago_end, 790, 852, 1.52], [c.shrug + 0.2, 560, 900, 1.12], [c.grab + 0.3, 604, 985, 1.34], [c.eb, 610, 985, 1.38]]);
  screenSpace(); ctx.fillStyle = '#120820'; ctx.fillRect(0, 0, W, H);
  applyCam(cam);
  wgRoomDraw(ctx, t, false);
  // the BROWS button lights on every jab (the glow, in the room's own units)
  const R = wgRoomState(t);
  let jab = 0;
  for (const j of c.jabs || []) jab = Math.max(jab, popK(t, j, j + 0.1, 0.035, 0.06));
  if (t > c.grab) { const bb = BROWS_BTN(); softDot(gctx, bb[0], bb[1], 110, '#FFE36A', 0.6 * jab); }
  return { glow: 0.85, zblur: 0.16 * (1 - ramp(t, c.dive_end, c.dive_end + 0.3)), zcx: 540, zcy: 960 };
};

SC.brows = (lt, t, shot) => {
  const c = cu(), F = wgFrame(t), cam = F.cam;
  const hd = toScreen(cam, ...F.H.at(0, -30));
  shockLines(hd[0], hd[1], 300, ramp(t, c.boing - 0.02, c.boing + 0.42), 12, '#FFFFFF', 3);
  return { glow: 0.85, zblur: 0.05 * bumpAt(t, c.boing, 10), push: { k: 1, cx: 540, cy: 900 } };
};

SC.muscles = (lt, t, shot) => {
  const c = cu(), F = wgFrame(t);
  return { glow: 0.85, push: { k: 1, cx: 540, cy: 960 }, capY: 1460 };
};

SC.wires = (lt, t, shot) => {
  const c = cu(), F = wgFrame(t), cam = F.cam;
  // POP! where the balloon was
  const bp = toScreen(cam, BAL.x, BAL.y);
  if (t > c.pop) bigWord('POP!', clamp(bp[0] + 40, 230, 560), bp[1] - 150, 120, '#FFD447', popK(t, c.pop, c.pop + 0.6, 0.06, 0.12), -0.12);
  // TWITCH! by the ear, on the word
  const ep = toScreen(cam, ...F.H.at(-74, -40));
  wgTag('TWITCH!', clamp(ep[0] + 30, 230, 700), ep[1] - 70, '#FFD447', popK(t, c.tw1, c.noise - 0.2, 0.07, 0.12), 46, '#0B0B1A', -0.08);
  return { glow: 0.85, push: { k: 1, cx: 540, cy: 960 }, capY: 1460 };
};

SC.party = (lt, t, shot) => {
  const c = cu(), F = wgFrame(t), cam = F.cam;
  // the top muscles glow while they flex
  const S = F.S, fl = S.glass && S.glass.l ? (S.glass.l.flex.top || 0) : 0;
  if (fl > 0.05) for (const s of [-1, 1]) { const p = F.H.at(s * 66, -36); applyCam(cam); softDot(gctx, p[0], p[1], 22, '#FF5A7A', 0.42 * fl); }
  // the noise round him
  const nk = ramp(t, c.noise, c.loud + 0.2) * (1 - ramp(t, c.theyre - 0.2, c.theyre + 0.25));
  wgChatter(t, nk, toScreen(cam, ...F.H.at(0, 0)));
  return { glow: 0.85, push: { k: 1, cx: 540, cy: 960 } };
};

SC.button = (lt, t, shot) => {
  const c = cu(), F = wgFrame(t), cam = F.cam;
  const S = F.S, fl = S.glass && S.glass.l ? (S.glass.l.flex.top || 0) * S.glass.l.k : 0;
  if (fl > 0.05) for (const s of [-1, 1]) { const p = F.H.at(s * 66, -36); applyCam(cam); softDot(gctx, p[0], p[1], 22, '#FF5A7A', 0.38 * fl); }
  const nk = ramp(t, c.noise, c.loud + 0.2) * (1 - ramp(t, c.theyre - 0.2, c.theyre + 0.25));
  wgChatter(t, nk, toScreen(cam, ...F.H.at(0, 0)));
  return { glow: 0.85, push: { k: 1, cx: 540, cy: 960 } };
};

// ---------------------------------------------------------------- the cover: brows up, ears still, the question
SC.cover = (lt, t) => {
  const c = cu(), tc = c.ear3 + 0.3, S = wgState(tc);
  S.brows.l = { lift: 1.0, arch: 0.3 }; S.brows.r = { lift: 1.04, arch: 0.3 };
  S.face = { ...EF.strain, lookX: -0.8 }; S.mouth = { grit: 0.85 }; S.flush = 0.5;
  S.glass.l.awake = 1; S.glass.l.badges = [0, 0, 0]; S.glass.l.zz = 0; S.glass.l.k = 1;
  const cam = { x: 530, y: 1040, zoom: 3.7, rot: 0, sx: 0, sy: 0 };
  wgBack(cam, tc);
  applyCam(cam);
  wgBalloonDraw(c.pop - 0.5);
  wgHero(cam, tc, S);
  screenSpace();
  bigWord('WIGGLE', 540, 1300, 170, '#FFD447', 1, -0.03);
  bigWord('YOUR EARS?', 540, 1450, 120, '#FFFFFF', 1, -0.03);
  return { glow: 0.85, noCaptions: true };
};

function initScenes2() {
  initParty();
  initMind();
}
