// Why Can't You Breathe and SWALLOW at the Same Time? Short: the shots. Each SC.<id>(lt, t, shot) draws one frame
// (lt = seconds inside the shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time. Worlds: sky-blue's summit trail
// (trail.js) and his throat from the side (throat.js).
'use strict';

const cu = () => TLd.cues;
const bsShot = (id) => TLd.shots.find((s) => s.id === id);
const pulseOf = (t, times, len = 0.16) => times.reduce((m, f) => Math.max(m, clamp((t - f) / 0.03) * clamp((f + len - t) / 0.05)), 0);
const bumpAt = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);
const lerp2 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
const LIN = (x) => x;

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
const DAY_LIGHT = { ...LIGHTS.day, pool: 0.22, halo: 0.05 };
const IN_LIGHT = { ...LIGHTS.diagram, rim: [0.6, 0.9, 1.0], rimAmt: 0.6 };
const mixLight = (A, B, k) => { const o = { ...A }; for (const key of Object.keys(B)) { const a = A[key] === undefined ? LIGHT[key] : A[key], b = B[key]; o[key] = Array.isArray(b) ? b.map((v, i) => lerp(a[i], v, k)) : typeof b === 'number' ? lerp(a, b, k) : (k < 0.5 ? a : b); } return o; };

// ---------------------------------------------------------------- him (trail.js's trHero, plus his throat and his hand on it)
const BSFACE = {
  strain: { eyeOpen: 0.78, pupil: 1, lookX: 0.1, lookY: 0.5, browY: 0.95, browTilt: 0.7, mouth: 'flat', mouthOpen: 0, blink: 0.25, cross: 0 },
  huh: { eyeOpen: 1.42, pupil: 0.55, lookX: 0.05, lookY: 0.95, browY: 1.55, browTilt: 0.5, mouth: 'flat', mouthOpen: 0, blink: 0, cross: 0 },
  us: { eyeOpen: 1.15, pupil: 0.9, lookX: 0, lookY: 0.05, browY: 1.15, browTilt: 0.35, mouth: 'flat', mouthOpen: 0, blink: 0, cross: 0 },
  sip: { eyeOpen: 1, pupil: 1, lookX: 0.5, lookY: -0.6, browY: 0.5, browTilt: -0.1, mouth: 'flat', mouthOpen: 0, blink: 1, cross: 0 },
  cough: { eyeOpen: 0.6, pupil: 1, lookX: 0, lookY: 0, browY: 1.1, browTilt: 1.0, mouth: 'o', mouthOpen: 0.95, blink: 0.9, cross: 0, squeeze: 1 },
  chill: { eyeOpen: 0.95, pupil: 1, lookX: 0.6, lookY: -0.5, browY: 0.35, browTilt: -0.1, mouth: 'o', mouthOpen: 0.18, blink: 0.45, cross: 0 },
  freeze: { eyeOpen: 1.38, pupil: 0.5, lookX: 0, lookY: 0.95, browY: 1.45, browTilt: 0.9, mouth: 'grimace', mouthOpen: 0.45, blink: 0, cross: 0 },
  deadpan: { eyeOpen: 0.9, pupil: 1, lookX: 0, lookY: 0.05, browY: 0.15, browTilt: -0.25, mouth: 'flat', mouthOpen: 0, blink: 0.4, cross: 0 },
};
// a head-space point (head units) -> world, for a hero returned by trHero
function bsHP(Hh, q) {
  const H = Hh.H, c = Math.cos(H.hr), s = Math.sin(H.hr);
  const lx = H.hd[0] + q[0] * c - q[1] * s, ly = H.hd[1] + q[0] * s + q[1] * c;
  return [Hh.st.x + lx * Hh.st.s, Hh.st.y + ly * Hh.st.s];
}
// the bump on his throat: it rides up with a swallow (gulp 0..1), a ring of little marks when it moves
function bsThroat(c, pal, g, mark) {
  paint(() => {
    const y = 84 - 11 * g;
    ellipse(c, 2, y + 2, 9.5, 6.5, mixH(pal.skinSh, '#7A3E2A', 0.35));
    ellipse(c, 2, y, 8.5, 5.5, mixH(pal.skin, pal.skinSh, 0.35));
    ellipse(c, 0, y - 2, 3.4, 1.8, rgba('#FFFFFF', 0.45));
    if (mark > 0.02) for (const sd of [-1, 1]) {
      c.beginPath(); c.moveTo(sd * 14, y + 6); c.lineTo(sd * 20, y); c.lineTo(sd * 14, y - 6);
      c.lineWidth = 2.4; c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = rgba('#FFFFFF', 0.9 * mark); c.stroke();
    }
  });
}
// his left hand on his throat (rig-local; drawn in the layer's post over the arm): the forearm again from the elbow,
// a palm, four fingers lying along the side of his neck with their tips on the bump
function bsHandOnThroat(lc, rr, H, pal, k) {
  if (k <= 0.01) return;
  const hp = (q) => { const c = Math.cos(H.hr), s = Math.sin(H.hr); return [H.hd[0] + q[0] * c - q[1] * s, H.hd[1] + q[0] * s + q[1] * c]; };
  const el = rr.elL, wr = rr.wrL;
  capsuleShaded(lc, el, wr, 38, pal.coat, pal.coatSh, pal.coatHi, pal);
  line(lc, lerp(el[0], wr[0], 0.82), lerp(el[1], wr[1], 0.82), wr[0], wr[1], 42, pal.coatSh);
  const palm = lerp2(wr, hp([-24, 96]), 0.55);
  circle(lc, palm[0], palm[1], 17, pal.skin);
  const tips = [[-4, 74], [-2, 80], [-3, 86], [-6, 92]].map(hp);
  tips.forEach((tp, i) => {
    const b = [palm[0] + 2, palm[1] - 9 + i * 5.5];
    line(lc, b[0], b[1], lerp(b[0], tp[0], k), lerp(b[1], tp[1], k), 8.6, pal.skin);
  });
  const th = hp([-14, 104]);
  line(lc, palm[0], palm[1] + 6, th[0], th[1], 9, pal.skin);
  paint(() => { tips.forEach((tp) => ellipse(lc, tp[0] - 2, tp[1], 3.2, 2.6, 'rgba(255,226,214,0.85)')); });
}
const HK_REST = { e: [-104, -270], w: [-112, -180] }, HK_AT = { e: [-118, -300], w: [-46, -374] };
// him, from a description: trHero's A, plus throat {g, mark} (the bump), handL 0..1 (the hand to his throat), flare
function bsHero(cam, t, A = {}) {
  const pal = A.pal || PAL;
  const hk = clamp(A.handL || 0);
  const B = Object.assign({}, A);
  if (hk > 0.01) {
    // the elbow stays down by his side, the wrist comes up under his chin (armAt: the bones take the lengths they need)
    const e = HK_REST.e, kk = E.inOutCubic(hk);
    B.armLew = { e: lerp2(HK_REST.e, HK_AT.e, kk), w: lerp2(HK_REST.w, [HK_AT.w[0], HK_AT.w[1] + (A.headDY || 0) * 0.4], kk) };
    void e;
  }
  B.post = (lc, P) => {
    trHeadSpace(lc, P.H, (c) => {
      bsThroat(c, pal, A.throat ? A.throat.g || 0 : 0, A.throat ? A.throat.mark || 0 : 0);
      if (A.flare > 0.02) paint(() => { for (const sd of [-1, 1]) ellipse(c, sd * 8.5, 31, 3.4 + 1.8 * A.flare, 2.4 + 1.2 * A.flare, rgba('#8A3A30', 0.55 + 0.4 * A.flare)); });
    });
    if (hk > 0.01) bsHandOnThroat(lc, P.rr, P.H, pal, hk);
    if (A.post2) A.post2(lc, P);
  };
  return trHero(cam, t, B);
}
// two puffs of air flying at his nostrils (k 0..1), then bonking off them (b 0..1): world units under the current camera
function bsAirBounce(Hh, k, b, t) {
  if (k <= 0.01 || b >= 0.99) return;
  const s = Hh.st.s;
  applyCam(CAM_NOW);
  for (const sd of [-1, 1]) {
    const N = bsHP(Hh, [sd * 30, 32]), P0 = bsHP(Hh, [sd * 190, -6]), hit = bsHP(Hh, [sd * 11, 31]);
    let x, y, mood = 'calm', rot = 0, sc = 0.62 * s * Math.min(1, 3.3 / CAM_NOW.zoom) * (k > 0.5 && b < 0.01 && CAM_NOW.zoom > 3.45 ? 0.8 : 1);
    if (b < 0.01) {
      const u = E.inCubic(clamp(k));
      x = lerp(P0[0], N[0], u); y = lerp(P0[1], N[1], u) - 50 * s * Math.sin(Math.PI * u);
    } else {
      const u = E.outCubic(b);
      x = N[0] + sd * 150 * s * u; y = N[1] - 110 * s * u + 160 * s * u * u;
      mood = 'oof'; rot = sd * 2.5 * u; sc *= 1 - 0.35 * u;
      // the bonk: stars where it hit
      if (b < 0.5) paint(() => { for (let i = 0; i < 4; i++) { const a = -Math.PI / 2 + (i - 1.5) * 0.6 + (sd > 0 ? 0.4 : -0.4), r = (10 + 40 * b) * s; const px = hit[0] + Math.cos(a) * r, py = hit[1] + Math.sin(a) * r; ctx.save(); ctx.translate(px, py); ctx.rotate(t * 6 + i); ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); for (let j = 0; j < 8; j++) { const rr = j % 2 ? 2.2 * s : 6 * s, aa = j * Math.PI / 4; ctx.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr); } ctx.closePath(); ctx.fill(); ctx.restore(); } });
    }
    actor(() => swPuff(ctx, x, y, sc, t, mood, { rot, ph: sd }));
  }
}
let CAM_NOW = { x: 540, y: 960, zoom: 1 };

// ================================================================ frame 1 and round it (valid at negative time: the end)
const CAM_A = { x: 480, y: 1240, zoom: 3.3 }, CAM_B = { x: 480, y: 1244, zoom: 3.5 };
const GULPS0 = [-0.25];                                       // the swallow already under way on frame 0
function gulpG(tt, starts, len = 0.62) {
  let g = 0;
  for (const f of starts) { const d = tt - f; if (d >= 0 && d < len) g = Math.max(g, Math.sin(Math.PI * d / len)); }
  return g;
}
function hookA(tt) {
  const c = cu();
  const starts = [...GULPS0, c.gulp2 - 0.06];
  const g = gulpG(tt, starts);
  const br1 = ramp(tt, c.breathe - 0.05, c.bounce1, LIN), bo1 = ramp(tt, c.bounce1, c.bounce1 + 0.42);
  const br2 = ramp(tt, c.gulp2 + 0.05, c.gulp2 + 0.42, LIN), bo2 = ramp(tt, c.gulp2 + 0.42, c.gulp2 + 0.84);
  let face = { ...BSFACE.strain };
  face = lerpFace(face, BSFACE.huh, ramp(tt, c.bounce1 - 0.02, c.bounce1 + 0.08) * (1 - ramp(tt, c.bounce1 + 0.42, c.bounce1 + 0.6)));
  face = lerpFace(face, BSFACE.us, ramp(tt, c.same - 0.05, c.same + 0.18) * (1 - ramp(tt, c.try_end - 0.05, c.try_end + 0.12)));
  face = lerpFace(face, BSFACE.huh, ramp(tt, c.gulp2 + 0.4, c.gulp2 + 0.5) * (1 - ramp(tt, c.right_end, c.right_end + 0.2)));
  face.blink = Math.max(face.blink || 0, pulseOf(tt, [c.same + 0.5], 0.1));
  const flare = Math.max(br1 * (1 - bo1), br2 * (1 - bo2));
  return {
    face, noBottle: true, handL: 1, throat: { g, mark: g > 0.15 ? clamp(g * 1.3) : 0 }, flare,
    cheeks: 0.18 + 0.28 * flare, headDY: -16 - 2.5 * g, headRot: 0.02 * Math.sin(tt * 2.1), headDX: 0,
    bob: -3 * flare, br1, bo1, br2, bo2, g,
  };
}
function hookCam(tt) {
  const c = cu();
  const k = camKeys(tt, [[-0.45, CAM_A.x - 10, CAM_A.y + 30, 2.5], [0, CAM_A.x, CAM_A.y, CAM_A.zoom], [0.3, CAM_B.x, CAM_B.y, CAM_B.zoom],
    [c.same, 484, 1240, 3.4], [c.try_end, 482, 1246, 3.55], [c.cant, 482, 1250, 3.6]], E.inOutCubic);
  if (tt >= 0 && tt < 0.3) { const u = E.outCubic(tt / 0.3); k.zoom = lerp(CAM_A.zoom, CAM_B.zoom, u); k.y = lerp(CAM_A.y, CAM_B.y, u); }
  const j = bumpAt(tt, c.bounce1, 10);
  k.x += 5 * j * Math.sin((tt - c.bounce1) * 50);
  return k;
}
// GULP by his throat (reads with the sound off)
function gulpWord(Hh, cam, tt, starts, col = '#C8A8FF') {
  for (const f of starts) {
    const d = tt - f;
    if (d < -0.05 || d > 0.62) continue;
    const P = toScreen(cam, ...bsHP(Hh, [20, 82]));
    const k = E.outBack(clamp((d + 0.25) / 0.16), 2.2) * (1 - ramp(d, 0.42, 0.6));
    bigWord('GULP', clamp(P[0] + 190, 260, 820), P[1] - 10 - 30 * clamp(d), 96, col, k, -0.1);
  }
}
// the trail by day, with him in it
function dayTrail(t, cam, A, o = {}) {
  CAM_NOW = cam;
  return trailDraw(t, Object.assign({ cam, A, blue: 1, clouds: 1, sun: { k: 1, rays: 0.3 } }, o));
}
function bsHeroOnTrail(t, cam, A, o = {}) {
  CAM_NOW = cam;
  const blue = o.blue === undefined ? 1 : o.blue, dusk = o.dusk || 0;
  trSky(cam, t, { blue, dusk, stars: o.stars });
  if (o.sun !== false) trSun(cam, t, Object.assign({ blue, dusk }, o.sun || { k: 1, rays: 0.3 }));
  if (o.sky) { applyCam(cam); o.sky(); }
  trClouds(cam, t, { k: o.clouds === undefined ? blue : o.clouds, dusk });
  trRidges(cam, t, { blue, dusk });
  trLedge(cam, t, { blue, dusk });
  const Hh = bsHero(cam, t, A);
  trGrass(cam, t, { blue, dusk });
  applyCam(cam);
  return Hh;
}

// the window on his throat into the cutaway: the section drawn inside a round window at screen point P (radius R),
// with section point F at its middle and z screen px per section unit
const SEC_F = [600, 960], SEC_Z0 = 1.35;
function secWindow(P, R, z, t, so) {
  if (R < 2) return;
  screenSpace();
  ctx.beginPath(); ctx.arc(P[0], P[1], R, 0, 7); ctx.fillStyle = '#0B1230'; ctx.fill();
  ctx.save(); gctx.save();
  ctx.beginPath(); ctx.arc(P[0], P[1], R, 0, 7); ctx.clip();
  gctx.beginPath(); gctx.arc(P[0] / 2, P[1] / 2, R / 2, 0, 7); gctx.clip();
  const cam = { x: SEC_F[0] - (P[0] - 540) / z, y: SEC_F[1] - (P[1] - 960) / z, zoom: z };
  secBg(cam, t); applyCam(cam); swSection(t, so);
  ctx.restore(); gctx.restore();
  screenSpace();
  paint(() => { ctx.beginPath(); ctx.arc(P[0], P[1], R, 0, 7); ctx.lineWidth = Math.max(5, R * 0.04); ctx.strokeStyle = 'rgba(159,230,255,0.95)'; ctx.stroke(); });
}
function secBg(cam, t) {
  screenSpace();
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#0A1030'); g.addColorStop(1, '#03050F');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  applyCam(cam);
  paint(() => { for (let i = 0; i < 30; i++) { const x = -200 + 1500 * hash(i * 3.1), y = -100 + 2300 * hash(i * 7.7 + 1); circle(ctx, x, y, 2 + 3 * hash(i + 5), rgba('#6FA8FF', 0.15 + 0.2 * hash(i * 1.3))); } });
}

// the queue and the spit, as states of the cutaway (shared by the window in the hook and the inside shot)
function secState(t) {
  const c = cu();
  // the air puffs: queued in the nose road, creeping to the tunnel door; frozen on PAUSE; rushing down after
  const go = ramp(t, c.reopen + 0.05, c.reopen + 0.4, E.inOutCubic);
  const frz = ramp(t, c.pause + 0.05, c.pause + 0.12) * (1 - ramp(t, c.reopen - 0.02, c.reopen + 0.05));
  const stopped = t > c.cut - 0.1;
  const creep = stopped ? 0 : 0.012 * Math.sin(t * 3);
  const jolt = bumpAt(t, c.cut + 0.08, 8);
  const baseU = [0.235, 0.185, 0.135];
  const puffs = baseU.map((u, i) => ({
    u: u + creep - 0.012 * jolt * (3 - i) + go * (0.62 + 0.06 * i), ph: i * 1.7, s: 1.18,
    mood: frz > 0.5 ? 'frozen' : go > 0.02 ? 'happy' : (i === 0 && t > c.hey - 0.05 && t < c.one + 0.3) ? 'hey' : t > c.cut ? 'wait' : 'calm',
  }));
  // the spit: out of the mouth on "spit", into the tunnel ahead of them on "cut", waits smugly, slides over the shut
  // lid into the food pipe on "SHUT", gone
  const u1 = ramp(t, c.spit - 0.05, c.cut + 0.05, E.inOutCubic) * 0.40;
  const slide = ramp(t, c.slam + 0.05, c.shut_end - 0.05, E.inCubic) * 0.42;
  const spitU = u1 + slide;
  const spitAt = t > c.shut_end + 0.5 ? null : { u: spitU, mood: slide > 0.02 ? 'whee' : t > c.cut + 0.1 ? 'smug' : 'grin', s: 1.4, squash: 0.4 * bumpAt(t, c.cut + 0.05, 10) };
  return { puffs, spitAt, frz, go };
}
// the lid, the voice box, the palate over time (the inside shot's mechanism)
function mechState(t) {
  const c = cu();
  const lift = ramp(t, c.hopping - 0.05, c.hopping + 0.35, E.outBack) * (1 - ramp(t, c.reopen, c.reopen + 0.4, E.inOutCubic));
  let lid = ramp(t, c.slams - 0.02, c.slam, E.inCubic);
  lid = lid * (1 - ramp(t, c.reopen, c.reopen + 0.35, E.inOutCubic));
  const palate = ramp(t, c.lid2 - 0.1, c.slams + 0.1, E.inOutCubic) * (1 - ramp(t, c.reopen, c.reopen + 0.4));
  return { lift, lid, palate };
}

// ================================================================ the hook: the test
SC.hook = (lt, t, shot) => {
  const c = cu(), A = hookA(t), cam = hookCam(t);
  const dive = ramp(t, c.win_open, shot.end, E.inOutCubic);
  // his throat in the world (from the hero of this frame)
  let Hh = null;
  const draw = (cm) => { Hh = bsHeroOnTrail(t, cm, A); };
  const camD = dive > 0.001 && Hh0 ? scaledCam(cam, bsHP(Hh0, [2, 90]), 1 + 5.5 * E.inCubic(dive)) : cam;
  draw(camD);
  Hh0 = Hh;
  bsAirBounce(Hh, A.br1, A.bo1, t);
  bsAirBounce(Hh, A.br2, A.bo2, t);
  gulpWord(Hh, camD, t, [...GULPS0, c.gulp2 - 0.06]);
  // the window on his throat: the queue inside, then the dive through it
  if (t > c.win_open) {
    const P0 = toScreen(camD, ...bsHP(Hh, [2, 92]));
    const k = ramp(t, c.win_open, c.win_open + 0.28, E.outBack);
    const zf = dive > 0.001 ? 1 + 5.5 * E.inCubic(dive) : 1;     // the window grows with the push, so it stays on his throat
    const R = lerp(0, 112, k) * zf + 1200 * E.inCubic(ramp(t, c.right_end - 0.05, shot.end));
    const P = lerp2(P0, [540, 960], E.inOutCubic(ramp(t, c.right_end - 0.1, shot.end)));
    const z = lerp(0.42, SEC_Z0, E.inOutCubic(ramp(t, c.win_open, shot.end)));
    const S = secState(t), M = mechState(t);
    secWindow(P, R, z, t, Object.assign({ puffs: S.puffs, spitAt: S.spitAt }, M));
  }
  return { glow: 0.8, capY: 1440, zblur: 0.16 * E.inCubic(dive), zcx: 540, zcy: 960 };
};
let Hh0 = null;
const HOOK_LIGHT = (lt, t) => ({ ...DAY_LIGHT, dof: 0.85 });

// ================================================================ inside: the queue, ONE tunnel, the voice box, PAUSE, SLAM
function tagPill(txt, x, y, col, k, size = 44, sub = null) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + size * 1.1, h = size * 1.5;
  paint(() => {
    rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = 'rgba(8,10,26,0.92)'; ctx.fill();
    ctx.lineWidth = 5; ctx.strokeStyle = col; ctx.stroke();
    ctx.fillStyle = col; ctx.fillText(txt, 0, 2);
    if (sub) { ctx.font = `800 ${Math.round(size * 0.55)}px Montserrat`; ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillText(sub, 0, h * 0.85); }
  });
  ctx.restore();
}
function burstWord(txt, x, y, size, col, k, rot = 0, seed = 3) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.4);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const rng = mulberry32(seed), n = 14, R0 = size * 1.25;
  paint(() => {
    ctx.beginPath();
    for (let i = 0; i <= n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2, r = i % 2 ? R0 * (0.62 + 0.1 * rng()) : R0 * (1 + 0.12 * rng()); const px = Math.cos(a) * r * 1.35, py = Math.sin(a) * r * 0.8; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.closePath(); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#0B0B1A'; ctx.stroke();
  });
  ctx.restore();
  bigWord(txt, x, y, size, col, s, rot);
}
// a pause sign (two bars in a disc), screen space
function pauseSign(x, y, r, k) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  paint(() => {
    circle(ctx, 0, 0, r, 'rgba(8,10,26,0.9)');
    ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.lineWidth = 8; ctx.strokeStyle = '#FF5A6E'; ctx.stroke();
    for (const sd of [-1, 1]) { rrect(ctx, sd * r * 0.22 - r * 0.11, -r * 0.42, r * 0.22, r * 0.84, 6); ctx.fillStyle = '#FF5A6E'; ctx.fill(); }
  });
  ctx.restore();
  softDot(gctx, x / 2 * 2, y, r * 1.6, '#FF5A6E', 0.4 * s);
}
// him in a round window (screen space): the viewer's test stays in sight while we are inside
function heroDisc(x, y, r, t, k, A) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 1.8);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  paint(() => {
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.clip();
    const g = ctx.createLinearGradient(0, -r, 0, r); g.addColorStop(0, '#1767D4'); g.addColorStop(1, '#93D0FB');
    ctx.fillStyle = g; ctx.fillRect(-r, -r, 2 * r, 2 * r);
    const q = r / 82;
    ctx.scale(q, q);
    // his rig, head in the middle of the disc, chin up, the hand on the throat
    let pose = JSON.parse(JSON.stringify(POSES.stand));
    const st = { x: 0, y: 452, s: 1, pose, face: A.face, headDY: -16 - 2.5 * (A.g || 0) };
    pose = armAt(pose, 'L', HK_AT.e, [HK_AT.w[0], HK_AT.w[1] - 6]);
    st.pose = pose;
    const rr = drawCharacterRig(ctx, st, t, PAL);
    ctx.save(); ctx.translate(st.x, st.y);
    const Hl = trHeadLocal(st, pose);
    trHeadSpace(ctx, Hl, (cc) => bsThroat(cc, PAL, A.g || 0, (A.g || 0) > 0.15 ? 1 : 0));
    if (rr) bsHandOnThroat(ctx, rr, Hl, PAL, 1);
    ctx.restore();
    ctx.restore();
    ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.lineWidth = 8; ctx.strokeStyle = '#BFF0FF'; ctx.stroke();
  });
  ctx.restore();
}

SC.inside = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0;
  const S = secState(t), M = mechState(t);
  const cam = camKeys(t, [[T0, SEC_F[0], SEC_F[1], SEC_Z0], [c.cut + 0.2, 600, 960, 1.42], [c.one - 0.1, 610, 990, 1.36], [c.tunnel_end, 640, 1010, 1.06],
    [c.feel + 0.2, 640, 1040, 1.12], [c.voice - 0.1, 640, 1150, 1.5], [c.lid1_end, 636, 1110, 1.55], [c.brain + 0.15, 600, 760, 1.08],
    [c.breathing1 + 0.2, 600, 760, 1.12], [c.lid2, 620, 1100, 1.5], [c.slam, 616, 1110, 1.62], [c.shut_end, 610, 1120, 1.55], [shot.end, 610, 1180, 1.45]], E.inOutCubic);
  const sh = bumpAt(t, c.slam, 9);
  cam.x += 9 * sh * Math.sin((t - c.slam) * 70); cam.y += 7 * sh * Math.cos((t - c.slam) * 63);
  CAM_NOW = cam;
  secBg(cam, t);
  applyCam(cam);
  const air = ramp(t, c.one - 0.05, c.one + 0.3) * (1 - ramp(t, c.feel, c.feel + 0.3));
  const tun = ramp(t, c.tunnel - 0.05, c.tunnel + 0.25) * (1 - ramp(t, c.feel + 0.1, c.feel + 0.4));
  const split = ramp(t, c.tunnel_end, c.tunnel_end + 0.3) * (1 - ramp(t, c.voice - 0.2, c.voice + 0.1));
  const R = swSection(t, Object.assign({}, M, {
    puffs: S.puffs, spitAt: S.spitAt, air, spit: air, tunnel: tun, split,
    vbGlow: ramp(t, c.voice - 0.05, c.voice + 0.2) * (1 - ramp(t, c.lid1, c.lid1 + 0.3)),
    lidGlow: ramp(t, c.lid1 - 0.05, c.lid1 + 0.2) * (1 - ramp(t, c.brain, c.brain + 0.3)) + pulseOf(t, [c.slam], 0.3),
    lidFace: t > c.slam - 0.05 && t < c.reopen ? 'proud' : 'calm',
    food: S.spitAt && S.spitAt.u > 0.5 ? 1 : 0,
    brain: { mood: t > c.pause - 0.1 && t < c.reopen ? 'press' : 'calm', press: ramp(t, c.brain + 0.1, c.pause, E.inOutCubic) * (1 - ramp(t, c.reopen, c.reopen + 0.3)), lit: ramp(t, c.pause - 0.02, c.pause + 0.05) * (1 - ramp(t, c.reopen, c.reopen + 0.1)) },
  }));
  // labels, in screen space
  const tp = (p) => toScreen(cam, p[0], p[1]);
  if (t > c.hey - 0.05 && t < c.one + 0.3) {
    const A0 = swAt(SW_AIR, S.puffs[0].u), P = tp(A0);
    speech('HEY!', clamp(P[0] + 120, 220, 860), P[1] - 120, popK(t, c.hey, c.one + 0.25, 0.1, 0.12), '#FF5A6E', 78, 0.08);
  }
  { const P = tp([700, 960]); bigWord('ONE TUNNEL', clamp(P[0] + 120, 330, 760), P[1] - 10, 104, '#FFD447', popK(t, c.tunnel - 0.02, c.feel + 0.2, 0.1, 0.12), -0.06); }
  { const k = popK(t, c.tunnel_end, c.voice - 0.1, 0.1, 0.12); const Pw = tp([690, 1330]), Pf = tp([470, 1330]);
    tagPill('AIR', clamp(Pw[0] + 40, 200, 860), Pw[1], '#7FE9FF', k, 40); tagPill('FOOD', clamp(Pf[0] - 40, 200, 860), Pf[1], '#C8A8FF', k, 40); }
  { const P = tp([R.vbox[0] + 70, R.vbox[1]]); tagPill('VOICE BOX', clamp(P[0] + 150, 260, 820), P[1], '#FF9A3C', popK(t, c.voice - 0.02, c.lid1 + 0.2, 0.1, 0.12), 42); }
  { const P = tp([SW.hinge[0] + 20, SW.hinge[1] - 110]); tagPill('LID', clamp(P[0] + 190, 200, 820), P[1] - 10, '#FF86A6', popK(t, c.lid1 - 0.02, c.brain + 0.1, 0.1, 0.12), 46, 'epiglottis'); }
  // the hop: the bump on his neck rides up with the voice box (an arrow by it)
  { const k = popK(t, c.hopping - 0.05, c.lid1 + 0.2, 0.1, 0.1); if (k > 0.01) { const P = tp([R.apple[0] + 40, R.apple[1] + 10]); paint(() => { screenSpace(); ctx.save(); ctx.translate(P[0], P[1]); ctx.scale(k, k); ctx.beginPath(); ctx.moveTo(0, 40); ctx.lineTo(0, -30); ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.strokeStyle = '#FFD447'; ctx.stroke(); ctx.beginPath(); ctx.moveTo(-18, -12); ctx.lineTo(0, -34); ctx.lineTo(18, -12); ctx.stroke(); ctx.restore(); }); } }
  // PAUSE over the frozen air
  { const A0 = swAt(SW_AIR, 0.2), P = tp(A0); pauseSign(clamp(P[0] + 40, 240, 840), P[1] - 150, 70, popK(t, c.pause, c.reopen, 0.1, 0.12)); }
  burstWord('SLAM!', 790, tp([600, 1120])[1] - 330, 92, '#FF5A6E', popK(t, c.slam, c.slam + 0.55, 0.06, 0.12), -0.1, 7);
  if (t > c.reopen + 0.1) bigWord('WHOOSH', 760, tp([640, 1300])[1], 84, '#7FE9FF', popK(t, c.reopen + 0.1, shot.end + 0.1, 0.08, 0.1), 0.08);
  // him, in a corner window, doing the test (the viewer's test stays in sight)
  const dk = popK(t, c.feel - 0.05, c.lid1_end + 0.15, 0.14, 0.14);
  const dg = gulpG(t, [c.jump - 0.15, c.hopping - 0.1], 0.62);
  heroDisc(262, 650, 172, t, dk, { face: t > c.jump - 0.1 && t < c.jump + 0.6 ? BSFACE.huh : BSFACE.strain, g: dg });
  return { glow: 0.9, capY: 1560, flash: 0.18 * bumpAt(t, c.slam, 18) * (t >= c.slam ? 1 : 0), push: { k: 1 + 0.02 * lt / D, cx: 540, cy: 960 } };
};

// ================================================================ the drink: water down the wrong pipe
SC.drink = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0;
  const up = ramp(t, T0 - 0.2, c.water + 0.35, E.inOutCubic);
  const cf = ramp(t, c.cough - 0.02, c.cough + 0.06);
  const off = ramp(t, c.cough, c.cough + 0.25, E.outCubic);
  let gl = 0; for (const f of [c.water + 0.4, c.water + 0.85]) { const d = t - f; if (d >= 0 && d < 0.4 && t < c.cough) gl = Math.max(gl, Math.sin(Math.PI * d / 0.4)); }
  let face = lerpFace(BSFACE.us, BSFACE.sip, ramp(t, T0, c.water + 0.2));
  face = lerpFace(face, BSFACE.cough, cf);
  const jolt = bumpAt(t, c.cough, 6);
  const A = { face, drink: up * (1 - 0.6 * off), gulp: gl, cheeks: 0.25 * gl + 0.6 * cf * (1 - ramp(t, c.cough + 0.1, c.cough + 0.3)), level: 0.55,
    headRot: -0.15 * up * (1 - off) + 0.08 * jolt * Math.sin((t - c.cough) * 40), headDY: 4 * gl - 12 * jolt, headDX: 4 * up * (1 - off),
    flinch: 0.7 * jolt, bob: -6 * jolt, slosh: -0.6 * jolt * Math.sin((t - c.cough) * 30) };
  const cam = camKeys(t, [[T0, 500, 1226, 2.7], [c.water + 0.3, 506, 1214, 2.95], [c.cough, 506, 1210, 3.05], [shot.end, 500, 1214, 2.95]]);
  const j = bumpAt(t, c.cough, 10); cam.x += 8 * j * Math.sin((t - c.cough) * 61); cam.y += 6 * j * Math.cos((t - c.cough) * 55);
  CAM_NOW = cam;
  const Hh = bsHeroOnTrail(t, cam, A);
  applyCam(cam);
  trDrops(ctx, Hh.mouth[0] + 30, Hh.mouth[1] + 6, c.cough + 0.01, t, 12, 9, 1.0, 330);
  trDrops(ctx, Hh.mouth[0] - 20, Hh.mouth[1] + 6, c.cough + 0.03, t, 8, 13, -0.9, 260);
  const M = toScreen(cam, Hh.mouth[0], Hh.mouth[1]);
  burstWord('KOFF!', clamp(M[0] + 250, 300, 800), M[1] - 260, 96, '#FF5A6E', popK(t, c.cough, shot.end + 0.2, 0.06, 0.1), 0.1, 11);
  return { glow: 0.8, capY: 1440, push: { k: 1 + 0.03 * lt / D, cx: 540, cy: 900 } };
};

// ================================================================ the late lid: a drop already in the windpipe, the cough
SC.late = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0;
  const lid = 0.55 * ramp(t, T0, c.late + 0.2, E.inOutSine) + 0.45 * ramp(t, c.late + 0.2, c.late_end, E.inOutCubic);
  const blast = ramp(t, c.blast, c.blast + 0.35, E.inCubic);
  const dropU = lerp(0.12 + 0.16 * ramp(t, T0, c.late, E.outCubic), -0.5, blast);
  const al = (t > c.late - 0.05 ? 0.6 + 0.4 * Math.sin(t * 30) : 0) * (1 - ramp(t, c.blast + 0.2, c.blast + 0.4));
  const cam = camKeys(t, [[T0, 610, 1150, 1.5], [c.late, 616, 1160, 1.62], [c.blast, 612, 1140, 1.55], [shot.end, 600, 1100, 1.4]]);
  const j = bumpAt(t, c.blast, 9); cam.x += 9 * j * Math.sin((t - c.blast) * 61); cam.y += 8 * j * Math.cos((t - c.blast) * 57);
  CAM_NOW = cam;
  secBg(cam, t); applyCam(cam);
  swSection(t, { lift: 0.6, lid, palate: 0.6, lidFace: t > c.late - 0.05 ? 'shock' : 'sleepy', alarm: al, wind: blast > 0 && blast < 1 ? 1 : 0,
    dropAt: dropU > -0.05 ? { u: dropU, path: SW_WIND, mood: t > c.late ? 'oops' : 'sneak', s: 1.35 } : null, doors: 0.3 });
  const tp = (p) => toScreen(cam, p[0], p[1]);
  // a little alarm clock by the lid: LATE
  { const k = popK(t, c.late - 0.04, shot.end + 0.2, 0.08, 0.1); if (k > 0.01) { const P = tp([SW.hinge[0] + 150, SW.hinge[1] - 150]); clockIcon(P[0], P[1], 62, k, t); } }
  burstWord('KOFF!', 300, tp([600, 1000])[1] - 260, 84, '#FF5A6E', popK(t, c.blast, shot.end + 0.2, 0.06, 0.1), -0.1, 17);
  return { glow: 0.9, capY: 1560, push: { k: 1 + 0.02 * lt / D, cx: 540, cy: 960 } };
};
// an alarm clock that rings (screen space)
function clockIcon(x, y, r, k, t) {
  const s = E.outBack(clamp(k), 2), sh = Math.sin(t * 60) * 0.12;
  screenSpace(); ctx.save(); ctx.translate(x, y); ctx.rotate(sh); ctx.scale(s, s);
  paint(() => {
    for (const sd of [-1, 1]) { circle(ctx, sd * r * 0.62, -r * 0.82, r * 0.32, '#FFD447'); }
    line(ctx, -r * 0.55, r * 0.9, -r * 0.75, r * 1.15, 8, '#FFD447'); line(ctx, r * 0.55, r * 0.9, r * 0.75, r * 1.15, 8, '#FFD447');
    circle(ctx, 0, 0, r, '#FF5A6E'); circle(ctx, 0, 0, r * 0.8, '#FFFFFF');
    line(ctx, 0, 0, 0, -r * 0.6, 7, '#0B0B1A'); line(ctx, 0, 0, r * 0.42, r * 0.1, 7, '#0B0B1A');
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(0, 0, r * (1.25 + 0.2 * i), -2.6 + 0.1 * i, -2.0); ctx.lineWidth = 5; ctx.strokeStyle = '#FFD447'; ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, r * (1.25 + 0.2 * i), -1.14, -0.54 - 0.1 * i); ctx.stroke(); }
  });
  ctx.restore();
}

// ================================================================ one whole day: the swallow counter
function dayPhase(t) {             // 0 morning .. 1 next morning
  const s = bsShot('day');
  return clamp((t - s.start) / (s.end - s.start));
}
function dayLook(u) {              // sky and light through a day: day -> dusk -> night -> dawn -> day
  const dusk = Math.max(0, 1 - Math.abs(u - 0.32) / 0.14) + Math.max(0, 1 - Math.abs(u - 0.78) / 0.12) * 0.8;
  const night = clamp(1 - Math.abs(u - 0.55) / 0.17);
  const blue = clamp(1 - night - 0.4 * dusk);
  return { blue, dusk: clamp(dusk) * (1 - night), night };
}
SC.day = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0, u = dayPhase(t), L = dayLook(u);
  const n = c.ticks.filter((x) => x <= t).length, last = c.ticks.filter((x) => x <= t).pop();
  const total = Math.round(600 * Math.pow(n / c.ticks.length, 1.0));
  const g = last !== undefined ? gulpG(t, [last], 0.22) : 0;
  const face = t > c.without - 0.1 ? BSFACE.chill : lerpFace(BSFACE.us, BSFACE.chill, ramp(t, c.hundreds_end, c.without));
  const A = { face, noBottle: true, throat: { g, mark: 0 }, headDY: -6, headRot: 0.04 * Math.sin(t * 1.7), bob: Math.sin(t * 2.2) * 1.5 };
  const cam = camKeys(t, [[T0, 500, 1190, 2.2], [c.hundreds, 506, 1170, 1.95], [shot.end, 502, 1180, 2.05]]);
  // the sun crosses the sky; the moon after it
  const sunA = lerp(-0.2, 3.4, clamp(u / 0.5)), sun = [520 + 520 * Math.cos(Math.PI - sunA * 0.9), 1300 - 680 * Math.sin(Math.min(Math.PI, sunA * 0.9))];
  const Hh = bsHeroOnTrail(t, cam, A, { blue: L.blue, dusk: L.dusk, stars: 1, clouds: L.blue, sun: u < 0.47 || u > 0.9 ? { at: u > 0.9 ? [lerp(-60, 300, (u - 0.9) / 0.1), lerp(1300, 900, (u - 0.9) / 0.1)] : sun, k: 1, rays: 0.2 } : false,
    sky: () => { if (L.night > 0.05) { const m = [lerp(980, 160, (u - 0.38) / 0.4), 640 - 200 * Math.sin(Math.PI * clamp((u - 0.38) / 0.4))]; paint(() => { circle(ctx, m[0], m[1], 40, rgba('#F4F1E0', L.night)); circle(ctx, m[0] + 14, m[1] - 8, 34, rgba('#0A1030', L.night * 0.9)); }); softDot(gctx, m[0], m[1], 120, '#DDE6FF', 0.4 * L.night); } } });
  // each swallow: a little ripple at his throat and a pause mark
  if (g > 0.05) { const P = toScreen(cam, ...bsHP(Hh, [2, 82])); paint(() => { screenSpace(); ctx.beginPath(); ctx.arc(P[0], P[1], 20 + 40 * (1 - g), 0, 7); ctx.lineWidth = 4; ctx.strokeStyle = rgba('#C8A8FF', g); ctx.stroke(); }); }
  // the counter
  counterPill(540, 560, total, popK(t, T0 + 0.05, shot.end + 0.3, 0.12, 0.1), pulseOf(t, [last || -9], 0.08));
  tagPill('ONE STUDY: ~600 A DAY', 540, 700, '#FFFFFF', popK(t, c.day_end - 0.3, shot.end + 0.2, 0.12, 0.1), 36);
  if (t > c.without) { const P = toScreen(cam, ...bsHP(Hh, [10, 40])); noteFloat(P[0] + 70, P[1] - 60, t - c.without); }
  return { glow: 0.8, capY: 1440 };
};
const DAY_FN = (lt, t) => { const L = dayLook(dayPhase(t)); return mixLight(mixLight(DAY_LIGHT, LIGHTS.sunset, L.dusk), LIGHTS.night, L.night); };
function counterPill(x, y, n, k, pulse) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2) * (1 + 0.08 * pulse);
  screenSpace(); ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  paint(() => {
    rrect(ctx, -300, -78, 600, 156, 40); ctx.fillStyle = 'rgba(8,10,26,0.9)'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#C8A8FF'; ctx.stroke();
    ctx.font = '900 30px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#C8A8FF';
    ctx.fillText('SWALLOWS TODAY', 0, -40);
    ctx.font = '400 96px Anton'; ctx.fillStyle = '#FFFFFF'; ctx.fillText(String(n), -40, 26);
    for (const sd of [-1, 1]) { rrect(ctx, 150 + sd * 16 - 8, -2, 16, 52, 4); ctx.fillStyle = '#FF5A6E'; ctx.fill(); }
  });
  ctx.restore();
}
function noteFloat(x, y, d) {
  screenSpace();
  for (let i = 0; i < 3; i++) {
    const u = (d * 0.9 + i * 0.33) % 1, px = x + 40 * u + 10 * Math.sin(u * 9 + i), py = y - 120 * u;
    paint(() => {
      ctx.save(); ctx.translate(px, py); ctx.rotate(-0.2);
      ctx.fillStyle = rgba('#FFFFFF', 1 - u); ctx.beginPath(); ctx.ellipse(0, 0, 11, 8, -0.4, 0, 7); ctx.fill();
      line(ctx, 9, -2, 9, -40, 4, rgba('#FFFFFF', 1 - u)); line(ctx, 9, -40, 24, -30, 4, rgba('#FFFFFF', 1 - u));
      ctx.restore();
    });
  }
}

// ================================================================ the button: now you're thinking about it
SC.button = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0, tt = t - TLd.duration;      // tt: negative, reaching 0 at the loop
  const frz = ramp(t, c.thinking2 - 0.1, c.thinking2 + 0.1);
  const hand = ramp(t, c.gulp_b - 0.35, c.gulp_b - 0.05, E.inOutCubic);
  const gb = gulpG(t, [c.gulp_b], 0.7);
  const home = ramp(t, c.home, TLd.duration, E.inOutCubic);
  let face = lerpFace(BSFACE.chill, BSFACE.freeze, frz);
  face = lerpFace(face, BSFACE.strain, ramp(t, c.gulp_b - 0.05, c.gulp_b + 0.1) * (1 - ramp(t, c.sorry - 0.15, c.sorry)));
  face = lerpFace(face, BSFACE.deadpan, ramp(t, c.sorry - 0.15, c.sorry));
  // the last frames become frame 0 exactly (hookA at negative time: the hand on the throat, the swallow under way)
  const H0 = hookA(tt);
  face = lerpFace(face, H0.face, home);
  const A = { face, noBottle: true, handL: Math.max(hand, home), throat: { g: Math.max(gb, home * H0.throat.g), mark: Math.max(gb > 0.15 ? 1 : 0, home * H0.throat.mark) },
    cheeks: lerp(0.3 * gb, H0.cheeks, home), headDY: lerp(-10 - 6 * hand, H0.headDY, home), headRot: lerp(0.03 * Math.sin(t * 2), H0.headRot, home), bob: lerp(-2 * frz * Math.sin(t * 30) * (1 - hand), 0, home) };
  const cam0 = camKeys(t, [[T0, 500, 1200, 2.2], [c.thinking2, 492, 1240, 2.55], [c.gulp_b, 486, 1256, 2.85], [c.sorry, 484, 1262, 2.9]]);
  const cam = home > 0 ? camKeys(tt, [[c.home - TLd.duration, cam0.x, cam0.y, cam0.zoom], [0, CAM_A.x, CAM_A.y, CAM_A.zoom]]) : cam0;
  CAM_NOW = cam;
  const Hh = bsHeroOnTrail(t, cam, A);
  // AUTO -> MANUAL: the switch flips while he realises
  const sw = ramp(t, c.thinking2 + 0.05, c.thinking2 + 0.3, E.outBack);
  togglePill(540, 520, sw, popK(t, c.now, c.home - 0.05, 0.12, 0.12));
  gulpWord(Hh, cam, t, [c.gulp_b - 0.15], '#FF9A3C');
  if (home > 0) gulpWord(Hh, cam, tt, GULPS0);
  // a sweat drop as it dawns on him
  if (frz > 0.5 && t < c.home) { const P = toScreen(cam, ...bsHP(Hh, [52, -40])); screenSpace(); paint(() => sweatDrop(ctx, P[0], P[1] + 30 * ramp(t, c.thinking2, c.thinking2 + 1.2), 1.4)); }
  return { glow: 0.8, capY: 1440 };
};
function togglePill(x, y, on, k) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2);
  screenSpace(); ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  paint(() => {
    rrect(ctx, -300, -62, 600, 124, 62); ctx.fillStyle = 'rgba(8,10,26,0.9)'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#FFFFFF'; ctx.stroke();
    ctx.font = '900 40px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = rgba('#4DFFB4', 1 - 0.7 * on); ctx.fillText('AUTO', -190, 2);
    ctx.fillStyle = rgba('#FF9A3C', 0.3 + 0.7 * on); ctx.fillText('MANUAL', 172, 2);
    rrect(ctx, -60, -30, 120, 60, 30); ctx.fillStyle = on > 0.5 ? '#FF9A3C' : '#4DFFB4'; ctx.fill();
    circle(ctx, lerp(-30, 30, clamp(on)), 0, 24, '#FFFFFF');
  });
  ctx.restore();
}

// ================================================================ the cover
SC.cover = (lt, t, shot) => {
  const c = cu(), A = hookA(c.bounce1 + 0.15);
  A.face = { ...BSFACE.huh, lookY: 0.2, lookX: 0 }; A.flare = 0.3;
  const cam = { x: 478, y: 1212, zoom: 3.6 };
  const Hh = bsHeroOnTrail(t, cam, A);
  bsAirBounce(Hh, 1, 0.3, t);
  bigWord('SWALLOW', 540, 490, 160, '#C8A8FF', 1, -0.05);
  bigWord('+ BREATHE?', 540, 1360, 150, '#7FE9FF', 1, -0.05);
  return { glow: 0.8, noCaptions: true };
};

setLights({ hook: HOOK_LIGHT, inside: IN_LIGHT, drink: DAY_LIGHT, late: IN_LIGHT, day: DAY_FN, button: DAY_LIGHT, cover: DAY_LIGHT });

function initScenes2() {
  initTrail();
}
