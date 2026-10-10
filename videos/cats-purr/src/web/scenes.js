// Why Do Cats PURR? Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;
const shotOf = (id) => TLd.shots.find((s) => s.id === id);
// the strongest of a list of pulses at time t: each is on for `len` seconds, with soft edges
const pulseOf = (t, times, len = 0.16) => times.reduce((m, f) => Math.max(m, clamp((t - f) / 0.03) * clamp((f + len - t) / 0.05)), 0);
// a decaying bump after a moment
const bumpAt = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);
const lerp2 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the evening: one warm lamp on the right (the key, from above), the moon in the window behind him on the left (the rim)
const EVE_LIGHT = { ...flipLight(LIGHTS.candle), pool: 0.6, halo: 0.12 };
// close on the two of them, the room goes soft; it sharpens as the camera lets go, and softens again on the way to her
const HOOK_LIGHT = (lt, t) => ({ ...EVE_LIGHT, dof: lerp(lerp(1.5, 0.35, ramp(t, 2.0, 3.4, E.inOutCubic)), 1.5, ramp(t, 5.4, 7.6, E.inOutCubic)) });
const LOOP_LIGHT = { ...EVE_LIGHT, dof: 1.5 };


// ================================================================ the couch in the evening: frame 1 and round it
const HEADY = LNG.seatY - 282 * LNG.hs;                    // the middle of his head (world y) when he sits still
const CATHEAD = [LNG.hx + LNG_LAP.x * LNG.hs, LNG.seatY + (LNG_LAP.y - 190 * LNG_LAP.s) * LNG.hs];   // the middle of hers, on his lap
const CAM_TIGHT0 = { x: 432, y: 1012, zoom: 2.52 }, CAM_TIGHT = { x: 432, y: 1014, zoom: 2.94 };
const HAND_CHIN = [36, -72], HAND_REST = [70, -36], HAND_SIDE = [66, -52];   // his right wrist: under her chin, where it comes from, on her side
const THROAT = [LNG_LAP.x, LNG_LAP.y - 116 * LNG_LAP.s];   // her throat, just under her chin (rig-local)
const THROAT_W = [LNG.hx + THROAT[0] * LNG.hs, LNG.seatY + THROAT[1] * LNG.hs];

// the opening, as a function of tt = seconds since frame 1 (negative = the last frames of the Short, on their way here)
function hookA(tt) {
  const c = cu();
  const reach = ramp(tt, -0.36, -0.04, E.inOutCubic);                         // his hand comes up to her chin
  const purr = ramp(tt, c.purrs - 0.04, c.purrs + 0.3) * (1 - ramp(tt, c.maybe - 0.04, c.maybe + 0.04)) + 0.8 * ramp(tt, c.but + 0.12, c.but + 0.5);
  const open1 = ramp(tt, c.maybe - 0.03, c.maybe + 0.09);                    // one eye opens
  const open2 = ramp(tt, c.sci - 0.05, c.sci + 0.15);                         // both, and she looks up at him
  const beg = ramp(tt, c.look - 0.06, c.look + 0.12);                         // ... and they go huge
  const bliss = ramp(tt, 0.0, 0.26, E.outBack);                               // the scratch lands: her chin comes up, her eyes close
  const pawK = ramp(tt, c.after - 0.02, c.me + 0.05, E.outBack);
  const away = ramp(tt, c.look + 0.05, c.after + 0.12, E.inOutCubic);         // his hand lets go of her chin (her throat is about to matter)
  const scratch = reach * (1 - 0.75 * ramp(tt, c.maybe, c.maybe + 0.12) * (1 - ramp(tt, c.but + 0.1, c.but + 0.4))) * (1 - away);
  const wr = lerp2(lerp2(HAND_REST, HAND_CHIN, reach), HAND_SIDE, away);
  const sw = scratch * Math.sin(tt * 21);
  const cat = {
    purr, chin: (0.25 + 0.65 * bliss) * (1 - 0.7 * open2), tilt: 0.05 * bliss * Math.sin(tt * 2.2) * (1 - open2) + 0.07 * beg, headDY: 5 * (1 - bliss) - 4 * bliss * (1 - open2) + 2 * sw,
    eyes: beg > 0.5 ? 'big' : open2 > 0.5 ? 'open' : open1 > 0.5 ? ['happy', 'half'] : tt < -0.02 ? 'open' : 'happy',
    look: beg > 0.5 ? [0.1, -0.7] : open2 > 0.5 ? [0.1, -1] : open1 > 0.5 ? [0.9, -0.2] : [0.7, 0.5], lid: open1 > 0.5 && open2 < 0.5 ? 0.42 : 0,
    ears: 0.3 - 0.5 * beg + 0.5 * open1 * (1 - open2) + 0.4 * bumpAt(tt, 0.02, 7), mouth: 'w', tail: 0.5 + 0.5 * purr + bumpAt(tt, 0, 3), tailSide: 1,
    paw: pawK, pawTo: [96, -170],
  };
  // ---- his face: down at her; up at us, proud; a doubt; and he melts
  let face = { ...LNGFACE.fond, blink: 0.18 + 0.82 * pulseOf(tt, [0.9], 0.12) };
  face = lerpFace(face, LNGFACE.proud, ramp(tt, c.happy - 0.16, c.happy + 0.02));
  face = lerpFace(face, { ...LNGFACE.proud, browY: 1.6, mouthOpen: 1 }, ramp(tt, c.right - 0.05, c.right + 0.08));
  face = lerpFace(face, LNGFACE.unsure, ramp(tt, c.maybe + 0.08, c.maybe + 0.28));
  face = lerpFace(face, LNGFACE.aww, ramp(tt, c.look, c.look + 0.25));
  const patchK = ramp(tt, c.me - 0.04, c.me + 0.12);
  const A = {
    face, cat, catMarks: purr, scratch, handR: [wr[0] + 1.6 * sw, wr[1] + 2.2 * sw], handL: [-62, -64 + 1.5 * Math.sin(tt * 2.6)],
    headDY: 1.5 * Math.sin(tt * 2.1) + 3 * bliss - 3 * ramp(tt, c.happy - 0.16, c.happy) * (1 - ramp(tt, c.maybe, c.maybe + 0.3)),
    headRot: 0.035 * ramp(tt, c.happy - 0.16, c.happy) * (1 - ramp(tt, c.maybe, c.maybe + 0.3)) - 0.03 * ramp(tt, c.look, c.look + 0.3),
    bob: 1.2 * Math.sin(tt * 2.1 + 1),
    post: (lc) => thrMini(lc, THROAT[0], THROAT[1], 31, tt, patchK),          // a window on her throat: the voice box, at work
  };
  return { A, purr, open1, beg };
}
function hookCam(tt) {
  const c = cu();
  const k = camKeys(tt, [[-0.4, CAM_TIGHT0.x, CAM_TIGHT0.y, CAM_TIGHT0.zoom - 0.02], [0, CAM_TIGHT0.x, CAM_TIGHT0.y, CAM_TIGHT0.zoom], [0.3, CAM_TIGHT.x, CAM_TIGHT.y, CAM_TIGHT.zoom], [2.1, 432, 1016, 3.0],
    [3.5, 436, 1004, 2.36], [c.but, 436, 1006, 2.4], [c.means, 434, 1040, 2.8], [c.me + 0.1, 432, CATHEAD[1] - 20, 3.5], [c.dive, 432, CATHEAD[1] - 16, 3.6]], E.inOutCubic);
  if (tt >= 0 && tt < 0.3) { const u = E.outCubic(tt / 0.3); k.zoom = lerp(CAM_TIGHT0.zoom, CAM_TIGHT.zoom, u); k.y = lerp(CAM_TIGHT0.y, CAM_TIGHT.y, u); }   // the first push is quick off the mark
  return k;
}

// the room, the couch, him and her. o: {cam, A, lamp, after: fn(H)}
function couchDraw(t, o) {
  const cam = o.cam;
  lngRoom(cam, t, { lamp: o.lamp });
  applyCam(cam);
  lngCouchBack();
  lngClutter();
  if (o.behind) o.behind();
  lngCouchFront();
  const H = lngHero(cam, t, o.A);
  applyCam(cam);
  if (o.after) o.after(H);
  return H;
}

// ================================================================ shots
SC.hook = (lt, t, shot) => {
  const c = cu(), S = hookA(t), cam = hookCam(t);
  const dive = ramp(t, c.dive, shot.end, E.inCubic);
  if (dive > 0) {   // into the window on her throat: it ends where the next shot's voice box is
    const P0 = toScreen(cam, THROAT_W[0], THROAT_W[1]);
    Object.assign(cam, scaledCam(cam, THROAT_W, 1 + 1.6 * dive));
    cam.sx = (THR.x - P0[0]) * dive; cam.sy = (THR.foldY - P0[1]) * dive;
  }
  const H = couchDraw(t, { cam, A: S.A });
  // the word of the purr, by her side
  const wk = ramp(t, c.purrs + 0.06, c.purrs + 0.22) * (1 - ramp(t, c.maybe - 0.05, c.maybe + 0.05)) + ramp(t, c.but + 0.14, c.but + 0.3) * (1 - ramp(t, c.look - 0.1, c.look));
  const P = toScreen(cam, CATHEAD[0] + 96, CATHEAD[1] + 4);
  purWord('PRRRR', clamp(P[0] + 60, 600, 800), P[1], 84, wk, t, { rot: -0.12 });
  // "look after me": a heart goes up from her
  const hk = ramp(t, c.me - 0.02, c.me + 0.16, E.outBack) * (1 - dive);
  if (hk > 0.01) { const Q = toScreen(cam, CATHEAD[0] - 92, CATHEAD[1] - 70 - 26 * ramp(t, c.me, c.me + 0.5)); heartIcon(clamp(Q[0], 150, 930), Q[1], 1.5 * hk, 1); }
  // "?": the purr stops dead
  const qk = ramp(t, c.maybe + 0.02, c.maybe + 0.14, E.outBack) * (1 - ramp(t, c.but + 0.05, c.but + 0.2));
  if (qk > 0.01) { const Q = toScreen(cam, H.head[0] + 92, H.head[1] - 60); bigWord('?', Q[0], Q[1], 120, '#FFD447', qk, 0.2); }
  return { glow: 0.85, capY: 1440, zblur: 0.3 * dive, zcx: lerp(540, THR.x, dive), zcy: lerp(1240, THR.foldY, dive) };
};

// ================================================================ inside her throat
function insideBg(t) {
  darkBg('#3E1646', '#0E0518');
  motes(t, 0.4);
}
SC.mech = (lt, t, shot) => {
  const c = cu(), T0 = shot.start;
  insideBg(t);
  // the air goes down until "AND", then comes back up; the folds never stop
  const tOut = c.out - 0.14, v = 300;
  const flow = t < tOut ? v * (t - T0) : v * (tOut - T0) - v * (t - tOut), dir = t < tOut ? 1 : -1;
  const lung = t < c.breathing ? 0.35 + 0.08 * Math.sin(lt * 2.4) : t < tOut ? lerp(0.4, 1, ramp(t, c.breathing, tOut, E.inOutSine)) : lerp(1, 0.1, ramp(t, tOut, shot.end, E.inOutSine));
  thrDraw(t, { flow, dir, lung, sound: ramp(lt, 0.15, 0.45) });
  thrChevrons(t, dir, ramp(t, c.breathing - 0.1, c.breathing + 0.15));
  // where we are, and what this is
  thrInset(216, 606, 98, t, ramp(lt, 0.1, 0.36));
  thrLabel('VOICE BOX', 812, 560, THR.x + 214, THR.foldY - 96, '#7FE9FF', ramp(t, c.voice - 0.05, c.voice + 0.2) * (1 - ramp(t, c.n25 - 0.16, c.n25 - 0.02)), 44);
  // 25 times a second (what we see is slowed down)
  const nk = ramp(t, c.n25 - 0.03, c.n25 + 0.16, E.outBack), punch = 1 + 0.12 * bumpAt(t, c.n25, 7);
  bigWord('25×', 842, 560, 180, '#FFD447', nk * punch, -0.04);
  sndTag('A SECOND', 842, 680, '#FFD447', ramp(t, c.second - 0.06, c.second + 0.14), 40);
  sndTag('SLOW MOTION', 842, 748, '#C8A8FF', ramp(t, c.second + 0.1, c.second + 0.3), 26);
  // in ... and out
  const inK = ramp(t, c.in - 0.08, c.in + 0.1), outK = ramp(t, c.out - 0.08, c.out + 0.1);
  sndTag('IN', 176, 796, dir > 0 ? '#7FE9FF' : '#3A6E8A', inK, 48);
  sndTag('OUT', 176, 884, dir < 0 ? '#FF9A3C' : '#7A5230', outK, 48);
  const arrive = ramp(lt, 0, 0.3);
  return { glow: 0.9, capY: 1350, push: { k: 1 + 0.035 * lt / (shot.end - T0), cx: THR.x, cy: THR.foldY }, zblur: 0.32 * (1 - arrive), zcx: THR.x, zcy: THR.foldY, flash: 0.3 * (1 - ramp(lt, 0, 0.16)) + 0.08 * bumpAt(t, c.n25, 9) };
};

// ================================================================ the basket: days old, eyes shut, purring
const NEST_LIGHT = { ...flipLight(LIGHTS.candle), pool: 0.5, halo: 0.1 };
const KITS = [[352, 1180, 0.7, 1], [474, 1192, 0.76, 0], [590, 1186, 0.66, 2]];
SC.kittens = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, T0 = shot.start;
  const cam = camKeys(lt, [[0, 530, 1076, 1.66], [c.days - T0 + 0.1, 524, 1080, 1.8], [c.eyes - T0 + 0.3, 470, 1102, 2.72], [D, 470, 1100, 2.84]]);
  nestBack(cam, t);
  applyCam(cam);
  const down = ramp(lt, 0.5, 0.9);
  actor(() => purCat(ctx, 668, 1152, 1.3, t, { loaf: 1, loafHeadX: -60, eyes: down > 0.5 ? 'happy' : 'open', look: [-0.9, 0.9], purr: 0.45, ears: 0.25, tail: 0.3, tilt: -0.1 * down, headDY: 5 * down, seed: 2 }));
  const mewK = pulseOf(t, [c.mew], 0.34);
  KITS.forEach(([x, y, s, pi], i) => {
    const o = { kitten: true, pal: KITPALS[pi], eyes: 'shut', purr: 0.9, mouth: i === 1 && mewK > 0.4 ? 'meow' : 'w', ears: 0.1, noTail: true, seed: i * 3 + 1,
      tilt: 0.09 * Math.sin(t * 2.3 + i * 2) + (i === 0 ? 0.14 : i === 2 ? -0.12 : 0), headDY: 3 * Math.sin(t * 4.2 + i * 1.7) - 5 * (i === 1 ? mewK : 0) };
    actor(() => purCat(ctx, x, y + 2 * Math.sin(t * 3 + i * 2), s, t, o));
    purMarks(ctx, x, y, s, t, 0.85, { cy: -150, r0: 96 });
  });
  nestFront(t);
  // the tag, and the smallest sound in the world
  pill(304, 596, '2 DAYS OLD', '#FF86A6', ramp(t, c.days - 0.04, c.days + 0.18) * (1 - ramp(t, c.eyes - 0.2, c.eyes)), 46);
  if (mewK > 0.02) { const P = toScreen(cam, KITS[1][0] + 70, KITS[1][1] - 200); purWord('mew!', P[0] + 40, P[1], 76, mewK, t, { rot: 0.1, col: '#FFFFFF' }); }
  return { glow: 0.85, flash: 0.22 * (1 - ramp(lt, 0, 0.12)) };
};

// ================================================================ the vet's: the same purr, in a cone
const VETCAT = { x: 540, y: 1250, s: 1.5 };
SC.hurt = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, V = VETCAT;
  const back = ramp(t, c.or - 0.16, c.hurt + 0.2, E.inOutCubic);
  const cam = { x: lerp(540, 548, back), y: lerp(V.y - 184 * V.s, 1046, back), zoom: lerp(3.9, 1.72, back) * (1 + 0.03 * lt / D), rot: 0 };
  vetBack(cam, t);
  applyCam(cam);
  vetTable();
  const o = { cone: true, eyes: 'happy', purr: 1, chin: 0.25, ears: 0.2, mouth: 'w', tail: 0.4, paw: 1, pawSide: -1, pawTo: [-112, -38], bandage: true, tilt: 0.04 * Math.sin(t * 2.2), seed: 1 };
  actor(() => purCat(ctx, V.x, V.y, V.s, t, o));
  purMarks(ctx, V.x, V.y, V.s, t, 0.9 * back, { cy: -186, r0: 154 });
  vetArm(V.x + 16, V.y - 74 * V.s, back, t, 1);
  const P = toScreen(cam, V.x + 150, V.y - 520);
  purWord('PRRRR', clamp(P[0], 640, 790), Math.max(480, P[1]), 100, ramp(t, c.hurt + 0.1, c.hurt + 0.26), t, { rot: -0.1 });
  return { glow: 0.7, flash: 0.22 * (1 - ramp(lt, 0, 0.12)) + 0.12 * bumpAt(t, c.hurt, 8) };
};

// ================================================================ five in the morning
const NIGHT_LIGHT = { ...LIGHTS.night, pool: 0.5, halo: 0.16 };
const BACKCAT = { x: 656, y: LNG.backY + 6, s: 0.8 };
// the purr on its way from her to his ear: arcs that travel along the line a -> b
function purrBeam(a, b, t, k) {
  if (k <= 0.02) return;
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  for (let i = 0; i < 4; i++) {
    const p = ((t * 1.8 + i / 4) % 1 + 1) % 1, x = lerp(a[0], b[0], p), y = lerp(a[1], b[1], p), al = k * Math.sin(Math.PI * p);
    for (const cc of [ctx, gctx]) { cc.beginPath(); cc.arc(x, y, 16 + 20 * p, ang - 0.9, ang + 0.9); cc.lineWidth = cc === ctx ? 6 : 10; cc.lineCap = 'round'; cc.strokeStyle = `rgba(255,214,140,${(cc === ctx ? 0.95 : 0.45) * al})`; cc.stroke(); }
  }
}
function nightCat(t, o) { actor(() => purCat(ctx, BACKCAT.x, BACKCAT.y, BACKCAT.s, t, o)); }
SC.weird = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, T0 = shot.start;
  const cam = camKeys(lt, [[0, 552, 1004, 1.62], [c.she2 - T0 + 0.2, 550, 992, 1.8], [D, 550, 988, 1.88]]);
  const leanK = ramp(t, c.hungry_end, c.she2 + 0.12, E.inOutCubic), woke = ramp(t, c.wah, c.wah + 0.07);
  const purr = ramp(t, c.she2 - 0.1, c.she2 + 0.2);
  const cat = { eyes: 'big', look: woke > 0.5 ? [-0.5, 0.2] : [-0.9, 0.7], purr, lean: -66 * leanK, headDY: 34 * leanK, tilt: -0.24 * leanK, ears: 0.5, tail: 1, tailSide: 1, mouth: woke > 0.5 ? 'meow' : 'w', seed: 3 };
  const face = woke > 0.5 ? LNGFACE.awake : { ...LNGFACE.asleep, mouthOpen: 0.45 + 0.2 * Math.sin(t * 2.4) };
  const A = { face, headRot: lerp(0.2, 0, woke), headDX: lerp(8, 0, woke), headDY: lerp(6 + 2 * Math.sin(t * 2.4), -6 * bumpAt(t, c.wah, 6), woke), bob: 1.5 * Math.sin(t * 2.4), handL: [-50, -30], handR: [52, -30], ambient: 0.16 };
  let H2 = null;
  couchDraw(t, { cam, A, lamp: 0, after: (H) => { H2 = H; nightCat(t, cat); } });
  applyCam(cam);
  const M = purPt(BACKCAT.x, BACKCAT.y, BACKCAT.s, cat, -6, 44);
  purrBeam(M, [H2.earR[0] + 6, H2.earR[1] - 4], t, purr * (1 - woke));
  if (woke < 0.5) { const Z = toScreen(cam, H2.head[0] - 70, H2.head[1] - 96); screenSpace(); zzz(Z[0], Z[1], t, T0 - 2, 1 - leanK * 0.4, 1); }
  pill(292, 536, '5:00 AM', '#8FB8FF', ramp(lt, 0.06, 0.3), 50);
  // the trace of her purr ... and what is in it
  const gone = 1 - ramp(t, c.wah + 0.02, c.wah + 0.2);
  sndStrip(132, 996, 736, 136, t, { k: ramp(t, c.she2 - 0.12, c.she2 + 0.2) * gone, scroll: t, cry: ramp(t, c.acry - 0.06, c.inside + 0.34, (x) => x), tag: '220-520 Hz', tagK: ramp(t, c.inside + 0.2, c.inside + 0.4),
    icon: (cc) => purCat(cc, 0, 76, 0.42, t, { eyes: 'big', noTail: true, purr: 1 }) });
  sndStrip(132, 1148, 736, 136, t, { k: ramp(t, c.pitched - 0.12, c.pitched + 0.2) * gone, from: 900, scroll: t, cryOnly: true, cry: ramp(t, c.pitched + 0.1, c.human + 0.1, (x) => x), tag: '300-600 Hz', tagK: ramp(t, c.babys - 0.02, c.babys + 0.18),
    iconBg: '#5A2A5E', icon: (cc) => { cc.scale(1.22, 1.22); babyFace(cc, t); } });
  return { glow: 0.85, capY: 1424, flash: 0.22 * (1 - ramp(lt, 0, 0.12)) + 0.3 * bumpAt(t, c.wah, 9) };
};

// ================================================================ the button: breakfast is served
SC.button = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, T0 = shot.start;
  const cam = camKeys(lt, [[0, 556, 966, 1.92], [D, 560, 946, 2.04]]);
  const serve = ramp(t, c.serve, c.serve + 0.34, E.outBack), staff = ramp(t, c.staff - 0.02, c.staff + 0.1), munch = ramp(t, c.munch, c.munch + 0.16);
  const cat = { eyes: munch > 0.5 ? 'happy' : 'half', lid: 0.4, look: serve > 0.5 ? [-0.5, 0.9] : [-0.2, 0.1], purr: 0.4 + 0.6 * munch, lean: -34 * munch, headDY: 30 * munch + 3 * munch * Math.sin(t * 13), tilt: -0.1 * munch,
    ears: 0.4 + 0.5 * bumpAt(t, c.cat3, 6), tail: 0.8, mouth: munch > 0.5 ? 'eat' : 'w', crown: ramp(t, c.staff + 0.04, c.staff + 0.2), seed: 3 };
  cat.headDY -= 5 * ramp(t, c.cat3, c.cat3 + 0.15) * (1 - munch); cat.tilt += 0.07 * ramp(t, c.cat3, c.cat3 + 0.15) * (1 - munch);
  let face = { ...LNGFACE.beaten, blink: 0.42 + 0.58 * pulseOf(t, [c.dont + 0.05], 0.13) };
  const glance = ramp(t, c.own - 0.04, c.own + 0.1) * (1 - ramp(t, c.cat3_end - 0.05, c.cat3_end + 0.1));
  face = lerpFace(face, { ...LNGFACE.beaten, lookX: 0.95, lookY: -0.6, browTilt: -0.5 }, glance);
  face = lerpFace(face, { ...LNGFACE.beaten, lookX: 0.9, lookY: -0.5, browTilt: -0.5 }, ramp(t, c.serve + 0.1, c.serve + 0.3) * (1 - staff));
  face = lerpFace(face, { ...LNGFACE.beaten, blink: 0.5, browY: -0.7, mouthOpen: -1.2 }, staff);
  const hr = lerp2([56, -34], [150, -268], serve);
  const A = { face, handL: [-50, -30], handR: hr, bendR: -1, bowl: serve > 0.02 ? { full: 1 - 0.3 * ramp(t, c.munch + 0.2, shot.end), dx: 0 } : null, tie: staff, headRot: 0.03 * staff, ambient: 0.14 };
  couchDraw(t, { cam, A, lamp: 0, behind: () => nightCat(t, cat) });
  const sp = bumpAt(t, c.staff + 0.06, 5);
  if (sp > 0.04 && t >= c.staff + 0.06) { const P = toScreen(cam, ...purPt(BACKCAT.x, BACKCAT.y, BACKCAT.s, cat, 0, -104)); screenSpace(); shockLines(P[0], P[1], 60, 1 - sp, 9, '#FFE99A', 4); softDot(gctx, P[0], P[1], 150, '#FFD447', 0.6 * sp); }
  return { glow: 0.85, flash: 0.2 * (1 - ramp(lt, 0, 0.1)) + 0.12 * bumpAt(t, c.staff + 0.05, 9) };
};

SC.loop = (lt, t, shot) => {
  const tt = t - TLd.duration, S = hookA(tt), cam = hookCam(tt);
  couchDraw(t, { cam, A: S.A });
  return { glow: 0.85, capY: 1440 };
};

// ================================================================ the cover (rendered by src/cover.sh from a one-shot timeline)
SC.cover = (lt, t) => {
  const cam = { x: 432, y: 1100, zoom: 2.62, rot: 0 };
  const cat = { purr: 0, chin: 0.2, eyes: 'big', look: [0.1, -0.5], ears: 0.3, mouth: 'w', tail: 0.5, paw: 1, pawTo: [96, -170] };
  const A = { face: { ...LNGFACE.aww, lookY: 1 }, cat, catMarks: 1, scratch: 0.4, handR: HAND_CHIN, handL: [-62, -64], headRot: -0.03 };
  couchDraw(0.4, { cam, A });
  purWord('PRRRR', 812, 878, 96, 1, 0.4, { rot: -0.12 });
  screenSpace();
  bigWord('WHY DO CATS', 540, 1240, 142, '#FFFFFF', 1, -0.03);
  bigWord('PURR?', 540, 1432, 236, '#FFD447', 1, -0.03);
  return { glow: 0.85, noCaptions: true };
};

setLights({ hook: HOOK_LIGHT, loop: LOOP_LIGHT, cover: { ...EVE_LIGHT, dof: 1.4 }, mech: LIGHTS.inside,
  kittens: (lt, t) => ({ ...NEST_LIGHT, dof: lerp(0.2, 1.1, ramp(lt, 2.2, 3.2, E.inOutCubic)) }), hurt: LIGHTS.day, weird: NIGHT_LIGHT, button: NIGHT_LIGHT });

function initScenes2() {
  initLounge();
  initPlaces();
}
