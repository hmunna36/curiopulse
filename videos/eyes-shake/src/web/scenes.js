// Can You Make Your Eyes SHAKE on Purpose? 👀 Short: the shots at the campsite at night (camp.js, borrowed from
// mosquito-bites) with the eyes, the brake and the buzz (eyes.js). Each SC.<id>(lt, t, shot) draws one frame (lt =
// seconds inside the shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;
const shotOf = (id) => TLd.shots.find((s) => s.id === id);
const esClone = (p) => JSON.parse(JSON.stringify(p));
const HERO_S = 0.95;
const heroAt = (o = {}) => Object.assign({ x: CAMP.HX, y: CAMP.GY, s: HERO_S }, o);
const HERO_HEAD = [CAMP.HX, CAMP.GY - 470 * HERO_S];                 // his head's middle (world), standing still
const HERO_EYE = [CAMP.HX - 24 * HERO_S, CAMP.GY - 472 * HERO_S];    // his right eye (screen-left), world

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// The campfire is on his left (screen right of him) and on his friend's right: warm key from above, the fire as the rim.
const LT_HERO = { ...LIGHTS.lanterns, rimFrom: [0.92, -0.18], rimAmt: 1.4 };
const LT_FRIEND = flipLight({ ...LIGHTS.lanterns, rimFrom: [0.92, -0.18], rimAmt: 1.4 });
setLights({ hook: LT_HERO, macro: LT_HERO, copy: LT_HERO, button: LT_HERO, loop: LT_HERO, cover: LT_FRIEND,
  friend: LT_FRIEND, buzz: LT_FRIEND, family: LT_FRIEND, safe: LIGHTS.lanterns });

// ---------------------------------------------------------------- his eyes over time
// hops: the times of his slow jumps (left, right, left...): {lx, smear} at time tt. from: where he looks before the first.
function hopLX(tt, hops, from = -0.9, amp = 0.9, dur = 0.075) {
  let pos = from, smear = null;
  for (let i = 0; i < hops.length; i++) {
    const h = hops[i], to = (i % 2 === 0 ? 1 : -1) * Math.sign(-from || -1) * amp;
    if (tt < h) break;
    if (tt < h + dur) { smear = { x0: pos, x1: to, k: 1 - 0.4 * ((tt - h) / dur), at: (tt - h) / dur }; pos = lerp(pos, to, (tt - h) / dur); break; }
    pos = to;
  }
  return { lx: pos, smear };
}
// a yank: the iris pulls one way, the clamp snaps it back (u = 0..1 over the tug)
function tugOff(tt, tugs) {
  let off = 0;
  tugs.forEach((g, i) => {
    const u = (tt - g) / 0.22;
    if (u > 0 && u < 1) off += (i % 2 ? -1 : 1) * 0.34 * (u < 0.3 ? E.outCubic(u / 0.3) : Math.exp(-(u - 0.3) * 9) * Math.cos((u - 0.3) * 22));
  });
  return off;
}
// the brows that wiggle while he tries (the gag: they move, the eyes don't)
const browWig = (tt, amt) => amt * (0.55 * Math.sin(tt * 2 * Math.PI * 5.2) + 0.2 * Math.sin(tt * 2 * Math.PI * 9.1 + 1));

// ---- frame 1 and round it, as one function of tt = seconds since frame 1 (negative = the Short's last frames: the loop)
function hookA(tt) {
  const c = cu();
  const p = esClone(POSES.stand);
  p.armL = { a: 0.16, b: 0.1 }; p.armR = { a: 0.16, b: 0.1 };
  const trying = 1 - ramp(tt, c.cant - 0.12, c.cant + 0.05);                            // until "Can't?"
  const retry = ramp(tt, c.and1 - 0.1, c.and1 + 0.05) * (1 - ramp(tt, c.again_end + 0.05, c.again_end + 0.25));
  const brake = tt < c.brake ? 0 : E.outBack(clamp((tt - c.brake) / 0.16), 2.6);       // the calipers clamp on "BRAKE"
  const cross = ramp(tt, c.cross + 0.05, c.little_end, E.inOutCubic);
  // the eyes: hops while he tries, the middle after "Can't?", crossed on the retry, yanked back on each tug
  const h = hopLX(tt, c.hops, -0.9);
  let lx = lerp(0, h.lx, trying), smear = trying > 0.5 ? h.smear : null, ly = -0.05;
  const down = ramp(tt, c.your2 - 0.05, c.your2 + 0.12) * (1 - ramp(tt, c.parking - 0.12, c.parking));      // tries to see his own eyes
  const atLever = ramp(tt, c.parking - 0.08, c.parking + 0.06) * (1 - ramp(tt, c.brake - 0.04, c.brake + 0.04));
  lx = lerp(lx, 0, down); ly = lerp(ly, 0.85, down);
  lx = lerp(lx, 0.95, atLever); ly = lerp(ly, 0.55, atLever);
  lx += tugOff(tt, c.tugs);
  const wide = ramp(tt, c.brake - 0.02, c.brake + 0.12) * (1 - ramp(tt, c.brake + 0.7, c.cross));
  const eyes = { lx, smear, ly, cross, brake, squint: Math.max(0.28 * Math.max(trying, retry), 0.25 * down), open: 1.04 + 0.2 * wide, iris: ES_IRIS.hero };
  // the face around them
  const effort = Math.max(trying, retry);
  let face = Object.assign({}, FACES.nervous, { eyeOpen: 0.9, lookX: 0, lookY: 0, mouth: 'grimace', mouthOpen: 1, browTilt: 0.55, browY: 0.15 + browWig(tt, 0.72) });
  const dead = Object.assign({}, FACES.annoyed, { eyeOpen: 0.9, lookX: 0, lookY: 0, blink: 0, mouth: 'flat', mouthOpen: 0, browY: -0.1, browTilt: -0.4 });
  face = lerpFace(dead, face, effort);
  if (wide > 0) face = lerpFace(face, Object.assign({}, FACES.startled, { eyeOpen: 0.9, lookX: 0, lookY: 0, mouth: 'o', mouthOpen: 0.6 }), wide);
  face.browY += browWig(tt, retry) * 0.7;
  const tremble = effort * 0.012 * Math.sin(tt * 47);
  const nope = tt > c.cant && tt < c.cant + 0.45 ? 0.07 * Math.sin((tt - c.cant) / 0.45 * Math.PI * 3) * (1 - (tt - c.cant) / 0.45) : 0;
  const st = heroAt({ pose: p, face, headRot: tremble - 0.02 * (1 - effort) + nope, headDX: 1.2 * effort * Math.sin(tt * 39), headDY: 1.5 * Math.sin(tt * 2.1) });
  const lamp = ramp(tt, c.brake_end - 0.04, c.brake_end + 0.12);
  const sweat = ramp(tt, c.cant + 0.15, c.cant + 0.4) * (1 - ramp(tt, c.brake - 0.1, c.brake + 0.1));
  // the handbrake lever: slides in on "parking", ratchets up in four clicks, is all the way up on "BRAKE", slides out on "Cross"
  const lever = ramp(tt, c.parking - 0.2, c.parking + 0.05) * (1 - ramp(tt, c.brake + 0.06, c.brake + 0.22));
  const clicks = [c.parking + 0.06, c.parking + 0.22, c.parking + 0.38, c.brake - 0.02];
  const leverUp = clicks.reduce((a, g) => a + (tt > g ? E.outBack(clamp((tt - g) / 0.07), 2) : 0), 0) / clicks.length;
  return { st, eyes, lamp, brake, cross, sweat, effort, retry, lever, leverUp };
}
function hookCam(tt) {
  const c = cu(), E2 = HERO_EYE;
  const k = camKeys(tt, [[-0.5, 360, 897, 5.3], [0, 360, 897, 5.3], [0.36, 360, 892, 6.0], [c.cant - 0.2, 360, 892, 6.05],
    [c.cant + 0.25, 360, 900, 5.4], [c.parking - 0.5, 362, 900, 5.3], [c.parking - 0.04, 399, 905, 3.8], [c.brake - 0.05, 401, 903, 3.86], [c.brake + 0.12, 357, 888, 6.35], [c.cross - 0.1, 357, 889, 6.2],
    [c.and1, 352, 884, 6.6], [c.again_end + 0.08, 346, 876, 7.6], [shotOf('macro').start, E2[0] + 2, E2[1] + 4, 10.5]]);
  const kick = tt > c.brake ? Math.exp(-(tt - c.brake) * 8) : 0;
  const tug = c.tugs.reduce((a, g) => a + (tt > g ? Math.exp(-(tt - g) * 14) * (tt - g < 0.6 ? 1 : 0) : 0), 0);
  const sh = shake(tt, 12 * kick + 5 * tug, 30, 7);
  k.x += sh[0] / k.zoom; k.y += sh[1] / k.zoom;
  return k;
}
function heroDraw(cam, t, A, o = {}) {
  const r = campChar(cam, A.st, t, { post: (cc, rr, s2) => {
    headSpace(cc, rr, s2, (hc) => {
      esEyes(hc, CAMPPAL, A.eyes, t);
      esLamp(hc, A.lamp || 0, t);
      if (A.sweat > 0.01) sweatDrop(hc, 58, -40 + 26 * A.sweat, 0.5, A.sweat);
    });
    if (o.post) o.post(cc, rr, s2);
  } });
  applyCam(cam);
  if ((A.lamp || 0) > 0.01) { const q = headPt(A.st, r, [0, -50]); softDot(gctx, q[0], q[1], 34, '#FF3B4E', 0.55 * A.lamp); }
  return r;
}
// embers off the fire (it is on his left, screen right), rising behind him: driven by hook time, so the loop matches
function esEmbers(tt, k = 1) {
  screenSpace();
  for (let i = 0; i < 9; i++) {
    const sp = 0.22 + 0.16 * hash(i * 4.1), u = (((tt * sp + hash(i * 7.3)) % 1) + 1) % 1;
    const x = 760 + 300 * hash(i * 2.9) + 40 * Math.sin(u * 7 + i), y = 1500 - 1300 * u, r = 5 + 9 * hash(i * 1.3);
    const a = k * Math.sin(Math.PI * u) * (0.55 + 0.45 * Math.sin(tt * 9 + i));
    softDot(ctx, x, y, r * 3.2, '#FF9A3C', 0.35 * a); softDot(gctx, x, y, r * 4, '#FF8A2C', 0.45 * a); circle(ctx, x, y, r * 0.5, rgba('#FFD070', 0.8 * a));
  }
  // the fire's light, flickering at the right edge
  const fl = 0.85 + 0.1 * Math.sin(tt * 11) + 0.05 * Math.sin(tt * 23.7);
  softDot(ctx, 1180, 1250, 820, '#FF7A2C', 0.16 * k * fl);
}
function hookDraw(tt, t) {
  const cam = hookCam(tt), A = hookA(tt);
  campBack(cam, t, { soft: 0.9 });
  esEmbers(tt);
  applyCam(cam);
  const r = heroDraw(cam, t, A);
  screenSpace();
  const c = cu();
  // effort marks by his temples while he strains
  const ek = A.effort * (0.6 + 0.4 * Math.sin(tt * 18));
  if (ek > 0.05 && tt < c.cant) for (const sd of [-1, 1]) {
    const q = toScreen(cam, ...headPt(A.st, r, [sd * 74, -34]));
    for (let i = 0; i < 3; i++) line(ctx, q[0] + sd * (8 + i * 4), q[1] - 30 + i * 30, q[0] + sd * (34 + i * 6), q[1] - 40 + i * 34, 7, rgba('#FFFFFF', 0.75 * ek));
  }
  esLever(905, 1005, 1.55, A.leverUp, A.lever);
  tagPill('STOP IF DIZZY', 540, 1196, '#FFD447', popK(tt, c.cross + 0.25, c.again_end + 0.2), 38);
  return { cam, A, r };
}

// ---------------------------------------------------------------- shots
SC.hook = (lt, t, shot) => {
  const c = cu();
  hookDraw(t, t);
  const z = ramp(t, shotOf('macro').start - 0.35, shotOf('macro').start);
  return { glow: 0.8, zblur: 0.16 * z, zcx: 540, zcy: 940, flash: 0.16 * (t > c.brake ? Math.exp(-(t - c.brake) * 12) : 0) };
};

// ---- his eye up close: the jump, then the brake
function macroA(t) {
  const c = cu(), A = hookA(c.again_end + 0.3);              // his face as the hook leaves it: brake on, crossed a little
  const M = c.mhops;
  let open = 0, clampK = 1, lx = 0.15, smear = null;
  const pos = [0.15, -0.85, 0.85, -0.85];
  for (let i = 0; i < M.length; i++) {
    const h = M[i];
    open = Math.max(open, ramp(t, h - 0.16, h - 0.04) * (1 - ramp(t, h + 0.08, h + 0.16)));
    if (t >= h && t < h + 0.08) { smear = { x0: pos[i], x1: pos[i + 1], k: 0.9, at: (t - h) / 0.08 }; lx = lerp(pos[i], pos[i + 1], (t - h) / 0.08); }
    else if (t >= h + 0.08) lx = pos[i + 1];
  }
  clampK = 1 - open;
  A.eyes = Object.assign({}, A.eyes, { lx, smear, cross: 0.35, brake: clampK, brakeOpen: open, squint: 0.18, open: 1.05 });
  A.st.face.browY = 0.9 + browWig(t, 0.6);
  return A;
}
SC.macro = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, E1 = HERO_EYE;
  const A = macroA(t), E2 = headPt(A.st, rig(A.st.pose), [-24, -2]);
  const cam = camKeys(lt, [[0, E1[0] + 2, E1[1] + 4, 10.5], [0.45, E2[0], E2[1] + 7, 15.0], [D, E2[0], E2[1] + 7, 16.0]]);
  campBack(cam, t, { soft: 1 });
  applyCam(cam);
  heroDraw(cam, t, A);
  screenSpace();
  // the labels: JUMP! at each hop, BRAKE ON while it holds
  c.mhops.forEach((h, i) => tagPill('JUMP!', i % 2 ? 310 : 750, 1100, '#FFD447', popK(t, h - 0.02, h + 0.42), 56));
  tagPill('(P) BRAKE ON', 540, 520, '#FF5A6E', popK(t, c.brake2 - 0.03, shot.end + 1) * (1 - 0.0), 46, '#FFFFFF');
  const flashK = c.mhops.reduce((a, h) => a + (t > h + 0.1 ? Math.exp(-(t - h - 0.1) * 10) : 0), 0);
  return { glow: 0.8, zblur: 0.14 * (1 - ramp(lt, 0, 0.45)), zcx: 540, zcy: 940, flash: 0.08 * flashK };
};

// ---- across the fire: his friend, who can let go
const ROW_HL = 8;                                            // which of the twelve is the shaker
function shakerRow(t, k, hl) {
  if (k <= 0.01) return;
  screenSpace();
  for (let i = 0; i < 12; i++) {
    const u = clamp(k * 12 - i), x = 290 + (i % 6) * 100, y = 500 + Math.floor(i / 6) * 100, s = 1.75 * E.outBack(clamp(u), 2.2);
    if (s <= 0.01) continue;
    const me = i === ROW_HL;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (me && hl > 0.01) { softDot(gctx, x, y, 60, '#4DFFB4', 0.6 * hl); circle(ctx, 0, 0, 27, rgba('#4DFFB4', hl)); }
    circle(ctx, 0, 0, 23, '#0B0B1A'); circle(ctx, 0, 0, 20, i % 3 === 0 ? '#C98F63' : i % 3 === 1 ? '#F2B892' : '#8A5A3A');
    ctx.beginPath(); ctx.arc(0, -4, 20, Math.PI * 1.05, Math.PI * 1.95); ctx.lineWidth = 9; ctx.strokeStyle = ['#2A1B14', '#4A2A1A', '#1A1410', '#7A4A2A'][i % 4]; ctx.stroke();
    const bz = me && hl > 0.5 ? 2.6 * esBuzz(t) : 0;
    for (const sd of [-1, 1]) {
      circle(ctx, sd * 7, 2, 5.2, '#FFFFFF'); circle(ctx, sd * 7 + bz, 2, 2.6, '#15132A');
      if (!me || hl < 0.5) { line(ctx, sd * 7 - 4, -4.5, sd * 7 + 4, -4.5, 2.6, ES_RED); line(ctx, sd * 7 - 4, 8.5, sd * 7 + 4, 8.5, 2.6, ES_RED); }
    }
    ctx.restore();
  }
}
function friendCamAt(lt, keys) { return camKeys(lt, keys); }
SC.friend = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = friendCamAt(lt, [[0, 900, 948, 2.35], [c.let - shot.start - 0.25, 896, 946, 2.5], [c.go - shot.start + 0.12, 882, 990, 4.6], [D, 880, 990, 4.85]]);
  campBack(cam, t, { soft: 0.8 });
  applyCam(cam);
  campFire(t);
  const sip = ramp(t, shot.start + 0.05, shot.start + 0.4, E.inOutCubic) * (1 - ramp(t, c.twelve, c.twelve + 0.35, E.inOutCubic));
  const off = ramp(t, c.go_end - 0.06, c.go_end + 0.45);
  const buzz = ramp(t, c.buzz_on, c.buzz_on + 0.06);
  const smug = ramp(t, c.let - 0.1, c.let + 0.15);
  let face = Object.assign({}, FACES.calm, { eyeOpen: 0.9, lookX: 0, lookY: 0, blink: 0, mouth: 'flat', browY: 0.1 });
  face = lerpFace(face, Object.assign({}, FACES.grin, { eyeOpen: 0.9, lookX: 0, lookY: 0, mouthOpen: 0.5, browY: 0.7, browTilt: -0.3 }), smug);
  const fr = campFriend(cam, t, { sip, face, eyes: { lx: -0.35, brake: 1, off, buzz, iris: ES_IRIS.friend, open: 1.02 },
    headPost: (hc) => esLamp(hc, 1 - ramp(t, c.go_end - 0.06, c.go_end + 0.04), t, 0, -60, 10) });
  applyCam(cam);
  const lampK = 1 - ramp(t, c.go_end - 0.06, c.go_end + 0.04);
  if (lampK > 0.01) { const q = headPt(fr.st, fr.r, [0, -60]); softDot(gctx, q[0], q[1], 30, '#FF3B4E', 0.5 * lampK); }
  screenSpace();
  shakerRow(t, ramp(t, c.about, c.twelve + 0.3) * (1 - ramp(t, c.let - 0.3, c.let - 0.1)), ramp(t, c.twelve + 0.1, c.twelve + 0.3));
  comicBurst(800, 600, 0.62, popK(t, c.go_end - 0.03, c.buzz_on + 0.2), 'SPROING!', '#FFD447', 0.12, 92);
  comicBurst(300, 640, 0.6, popK(t, c.buzz_on + 0.02, shot.end + 1), 'BZZZZ', '#4DFFB4', -0.1, 104);
  // the buzz: shake lines round his glasses
  if (buzz > 0.01) {
    const q = toScreen(cam, ...headPt(fr.st, fr.r, [0, -2]));
    const zq = cam.zoom / 2.75;
    for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) { const j = esBuzz(t + i) * 6; line(ctx, q[0] + sd * (175 + i * 26) * zq + j, q[1] + (-40 + i * 40) * zq, q[0] + sd * (205 + i * 26) * zq + j, q[1] + (-40 + i * 40) * zq, 9, rgba('#FFFFFF', 0.8 * buzz)); }
  }
  return { glow: 0.8, blur: [0, 0] };
};

// ---- he tries to copy: one slow hop per word, CLANK
SC.copy = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 360, 892, 6.0], [D, 358, 888, 6.3]]);
  campBack(cam, t, { soft: 0.9 });
  applyCam(cam);
  const A = hookA(c.again_end + 0.3);
  const h = hopLX(t, c.chops, -0.85, 0.85, 0.09);
  let open = 0;
  for (const g of c.chops) open = Math.max(open, ramp(t, g - 0.12, g - 0.02) * (1 - ramp(t, g + 0.09, g + 0.17)));
  A.eyes = Object.assign({}, A.eyes, { lx: h.lx, smear: h.smear, cross: 0, brake: 1 - open, brakeOpen: open, squint: 0.3 });
  A.st.face = Object.assign({}, A.st.face, { mouth: 'grimace', mouthOpen: 1, browY: 1.0 + browWig(t, 1), browTilt: 0.7 });
  A.lamp = 1;
  heroDraw(cam, t, A);
  return { glow: 0.8 };
};

// ---- the friend's eyes, close, buzzing; a hummingbird stops to stare
SC.buzz = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 878, 948, 5.4], [D, 872, 944, 6.2]]);
  campBack(cam, t, { soft: 1 });
  applyCam(cam);
  const sipK = ramp(t, c.second - 0.1, c.second + 0.35, E.inOutCubic);
  const face = Object.assign({}, FACES.calm, { eyeOpen: 0.9, lookX: 0, lookY: 0, mouth: 'flat', mouthOpen: 0.2, browY: 0.2 });
  const fr = campFriend(cam, t, { sip: 0.45 * sipK, face, eyes: { lx: -0.2, buzz: 1, iris: ES_IRIS.friend, open: 1.02 } });
  applyCam(cam);
  // the hummingbird: flies in on "fifteen", hovers beside his glasses, stares, raises a brow on "second"
  const hd = headPt(fr.st, fr.r, [-56, -64]);
  const inn = ramp(t, c.fifteen - 0.25, c.fifteen + 0.3, E.outCubic);
  if (inn > 0.001) {
    const bx = lerp(hd[0] - 260, hd[0], inn) + 3 * Math.sin(t * 9), by = lerp(hd[1] - 140, hd[1], inn) + 4 * Math.sin(t * 7.3);
    esHummer(ctx, bx, by, 0.62, t, { tilt: lerp(-0.2, 0.38, inn), brow: ramp(t, c.second - 0.05, c.second + 0.15) });
  }
  screenSpace();
  const q = toScreen(cam, ...headPt(fr.st, fr.r, [0, -2]));
  for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) { const j = esBuzz(t + i) * 7; line(ctx, q[0] + sd * (330 + i * 34) + j, q[1] - 60 + i * 60, q[0] + sd * (372 + i * 34) + j, q[1] - 60 + i * 60, 10, rgba('#FFFFFF', 0.75)); }
  tagPill('15 A SECOND', 540, 482, '#FFD447', popK(t, c.fifteen, shot.end + 1), 46);
  return { glow: 0.8 };
};

// ---- both by the fire: harmless; unless... a doctor
function clapPose(t, k, hip) {
  let p = esClone(POSES.stand);
  if (k <= 0.01) return p;
  const apart = 0.5 + 0.5 * Math.cos(t * 2 * Math.PI * 3.2);
  const q = ikReach(ikReach(esClone(p), 'R', [22 + 30 * apart, hip - 168], -1), 'L', [-22 - 30 * apart, hip - 168], -1);
  return lerpPose(p, q, k);
}
SC.safe = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 614, 950, 1.85], [D, 612, 944, 1.95]]);
  campBack(cam, t, { soft: 0.25 });
  applyCam(cam);
  const trick = ramp(t, c.harmless - 0.05, c.harmless + 0.05) * (1 - ramp(t, c.unless - 0.1, c.unless));
  const ffaceK = ramp(t, c.harmless, c.harmless + 0.2) * (1 - ramp(t, c.unless - 0.05, c.unless + 0.15));
  let fface = lerpFace(Object.assign({}, FACES.calm, { eyeOpen: 0.9, lookX: 0, lookY: 0 }), Object.assign({}, FACES.grin, { eyeOpen: 0.9, lookX: 0, lookY: 0, mouthOpen: 0.7 }), ffaceK);
  if (t > c.unless) fface = lerpFace(fface, Object.assign({}, FACES.worried, { eyeOpen: 0.9, lookX: -0.6, lookY: 0, mouth: 'o', mouthOpen: 0.3 }), ramp(t, c.unless, c.unless + 0.2));
  const fr = campFriend(cam, t, { x: 790, sip: 0, face: fface, eyes: { lx: -0.5, buzz: trick, iris: ES_IRIS.friend, open: 1.02 } });
  applyCam(cam);
  campFire(t);
  // the hero claps for the trick, then worries, then the doctor
  const clap = ramp(t, c.harmless + 0.1, c.harmless + 0.25) * (1 - ramp(t, c.unless - 0.15, c.unless + 0.05));
  const p = clapPose(t, clap, POSES.stand.hipY);
  const doc = ramp(t, c.doctor - 0.04, c.doctor + 0.2);
  let face = lerpFace(Object.assign({}, FACES.grin, { eyeOpen: 0.9, lookX: 0.8, lookY: 0.2, mouthOpen: 0.8 }), Object.assign({}, FACES.worried, { eyeOpen: 0.9, lookX: 0.4, lookY: 0.2 }), ramp(t, c.unless, c.unless + 0.25));
  face = lerpFace(face, Object.assign({}, FACES.calm, { eyeOpen: 0.9, lookX: 0, lookY: 0, mouth: 'flat', mouthOpen: 0.1, browY: 0.4, browTilt: 0.5 }), ramp(t, c.then - 0.05, c.then + 0.2));
  const A = { st: heroAt({ x: 445, pose: p, face, headRot: 0.04 * doc * Math.sin(Math.min(1, (t - c.doctor) * 2) * Math.PI * 2), headDY: 1.5 * Math.sin(t * 2.1) }),
    eyes: { lx: lerp(0.8, 0, ramp(t, c.then - 0.05, c.then + 0.2)), ly: 0.1, brake: 1, iris: ES_IRIS.hero }, lamp: 1, sweat: 0 };
  heroDraw(cam, t, A, { post: (cc, rr, s2) => rigSpace(cc, s2, (hc) => esScope(hc, rr, doc)) });
  screenSpace();
  tagPill('JUST A PARTY TRICK', 520, 520, '#4DFFB4', popK(t, c.harmless - 0.02, c.unless - 0.05), 44);
  okTick(836, 520, 32, popK(t, c.harmless + 0.08, c.unless - 0.05));
  tagPill('ON THEIR OWN?', 540, 520, '#FF9A3C', popK(t, c.own - 0.05, c.doctor - 0.1), 50);
  tagPill('SEE A DOCTOR', 540, 520, '#FF5A6E', popK(t, c.doctor - 0.02, shot.end + 1), 52, '#FFFFFF');
  return { glow: 0.8 };
};

// ---- the friend's family photo: they all buzz
const FPHOTO = { at: [-200, -262, 190], w: 190, h: 145 };
SC.family = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const s0 = shot.start;
  const cam = camKeys(lt, [[0, 790, 952, 2.2], [c.often - s0 - 0.25, 782, 950, 2.34], [c.often - s0 + 0.3, 712, 946, 3.5], [D, 708, 944, 3.75]]);
  campBack(cam, t, { soft: 0.8 });
  applyCam(cam);
  campFire(t);
  const up = ramp(t, c.canyou + 0.02, c.ask + 0.05, E.outBack);
  const face = Object.assign({}, FACES.grin, { eyeOpen: 0.9, lookX: 0, lookY: 0, mouthOpen: 0.6, browY: 0.6 });
  const photo = { k: up, at: FPHOTO.at, drawAt: (cc, rr) => {
    const hp = POSES.stand.hipY, [fx, fy] = FPHOTO.at, k = E.outBack(clamp(up), 1.6);
    cc.save(); cc.translate(fx, hp + fy + 60 * (1 - k)); cc.rotate(-0.05 * (1 - k) + 0.02 * Math.sin(t * 2)); cc.scale(0.6 + 0.4 * k, 0.6 + 0.4 * k);
    esPhoto(cc, FPHOTO.w, FPHOTO.h, 'shakers', t);
    cc.restore();
    // his hands on the frame's sides, in front of it
    drawHand(cc, rr.wrR, rr.armDirR, 'open', FRPAL, 1, t); drawHand(cc, rr.wrL, rr.armDirL, 'open', FRPAL, 1, t);
  } };
  const fr = campFriend(cam, t, { sip: 0, face, photo, eyes: { lx: 0, buzz: 1, iris: ES_IRIS.friend, open: 1.02 } });
  applyCam(cam);
  screenSpace();
  tagPill('RUNS IN FAMILIES', 540, 520, '#C8A8FF', popK(t, c.often - 0.05, shot.end + 1), 46);
  for (let i = 0; i < 4; i++) { const u = ((t * 0.9 + i / 4) % 1); sparkle(300 + i * 160 + 30 * Math.sin(i * 2.1), 640 + 40 * Math.sin(u * 6 + i), 16 * (1 - u), ramp(t, c.ask, c.ask + 0.2) * (1 - u)); }
  return { glow: 0.8 };
};

// ---- the button: his own family photo, both parents braked
const HPHOTO = { x: 160, y: -476, w: 170, h: 128 };              // rig units (feet at 0, 0)
SC.button = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const pW = [CAMP.HX + HPHOTO.x * HERO_S, CAMP.GY + HPHOTO.y * HERO_S];      // the photo's middle, world
  const cam = camKeys(lt, [[0, 452, 884, 2.8], [c.blame - shot.start, 456, 880, 2.95], [c.parents - shot.start + 0.05, pW[0], pW[1] + 6, 5.6], [D, pW[0], pW[1] + 6, 5.9]]);
  campBack(cam, t, { soft: 0.9 });
  applyCam(cam);
  const up = ramp(t, c.still - 0.04, c.cant2 + 0.1, E.outBack);
  const glare = ramp(t, c.blame - 0.1, c.blame + 0.12);
  let p = esClone(POSES.stand);
  const hp = p.hipY;
  const q = ikReach(esClone(p), 'R', [HPHOTO.x - HPHOTO.w * 0.4, HPHOTO.y + HPHOTO.h * 0.45 + 80 * (1 - up)], 1);
  p = lerpPose(p, q, clamp(up)); p.hand = 'open';
  let face = Object.assign({}, FACES.annoyed, { eyeOpen: 0.9, lookX: 0, lookY: 0, blink: 0, mouth: 'flat', mouthOpen: 0, browY: 0.0, browTilt: -0.2 });
  face = lerpFace(face, Object.assign({}, FACES.annoyed, { eyeOpen: 0.9, lookX: 0, lookY: 0, blink: 0.2, browY: -0.4, browTilt: -1.0, mouth: 'flat', mouthOpen: 0 }), glare);
  const A = { st: heroAt({ pose: p, face, headRot: 0.05 * glare, headDY: 1.5 * Math.sin(t * 2.1) }),
    eyes: { lx: lerp(0, 1.0, glare), ly: -0.1, brake: 1, iris: ES_IRIS.hero, squint: 0.3 * glare }, lamp: 1, sweat: 0 };
  heroDraw(cam, t, A, { post: (cc, rr, s2) => rigSpace(cc, s2, (hc) => {
    if (up <= 0.01) return;
    const k = clamp(up);
    hc.save(); hc.translate(HPHOTO.x, HPHOTO.y + 80 * (1 - k)); hc.rotate(0.06 * (1 - k)); hc.scale(0.7 + 0.3 * k, 0.7 + 0.3 * k);
    esPhoto(hc, HPHOTO.w, HPHOTO.h, 'parents', t);
    hc.restore();
    drawHand(hc, rr.wrR, rr.armDirR, 'open', CAMPPAL, 1, t);
  }) });
  // the parents' lamps glow in the photo
  return { glow: 0.8 };
};

// ---- the loop: the hook at negative time
SC.loop = (lt, t, shot) => {
  hookDraw(t - TLd.duration, t);
  return { glow: 0.8 };
};

// ---- the cover (cover.sh renders it): his friend's eyes buzzing, close; a hummingbird stares; the question
SC.cover = (lt, t, shot) => {
  const T0 = 2.0, cam = { x: 880, y: 974, zoom: 8.6, rot: 0 };
  campBack(cam, T0, { soft: 1 });
  applyCam(cam);
  const face = Object.assign({}, FACES.grin, { eyeOpen: 0.9, lookX: 0, lookY: 0, mouthOpen: 0.7, browY: 0.8, browTilt: -0.2 });
  const fr = campFriend(cam, T0, { sip: 0, face, eyes: { lx: 0, buzz: 1.2, ghost: 0.42, iris: ES_IRIS.friend, open: 1.1 } });
  applyCam(cam);
  const hd = headPt(fr.st, fr.r, [-58, -66]);
  esHummer(ctx, hd[0] + 6, hd[1] + 10, 0.32, T0, { tilt: 0.42, brow: 1 });
  screenSpace();
  const q = toScreen(cam, ...headPt(fr.st, fr.r, [0, -2]));
  for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) line(ctx, q[0] + sd * (420 + i * 22), q[1] - 90 + i * 90, q[0] + sd * (470 + i * 22), q[1] - 90 + i * 90, 14, '#FFFFFF');
  bigWord('CAN YOU', 540, 1240, 150, '#FFFFFF', 1, -0.04);
  bigWord('DO THIS?', 540, 1410, 170, '#FFD447', 1, -0.04);
  return { glow: 0.8, noCaptions: true, noSubscribe: true };
};

function initScenes2() {
  initCamp();
}
