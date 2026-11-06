// Is Your Water Older Than the SUN? Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the
// shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
// Worlds: trail.js (sky-blue's mountain trail and the hiker with his bottle), cloud.js (the freezing dark cloud and props).
'use strict';

const cu = () => TLd.cues;
const shotOf = (id) => TLd.shots.find((s) => s.id === id);
const bumpAt = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);
const lerp2 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
const mixLight = (A, B, k) => { const o = { ...A }; for (const key of Object.keys(B)) { const a = A[key] === undefined ? LIGHT[key] : A[key], b = B[key]; o[key] = Array.isArray(b) ? b.map((v, i) => lerp(a[i], v, k)) : typeof b === 'number' ? lerp(a, b, k) : (k < 0.5 ? a : b); } return o; };
const wobble = (t, f, amp, rate = 8, hz = 34) => (t >= f ? amp * Math.exp(-(t - f) * rate) * Math.sin((t - f) * hz) : 0);

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
const DAY_LIGHT = { ...LIGHTS.day, pool: 0.22, halo: 0.05 };
// the cloud: no sun, a faint cold light from far stars up on the left, deep cold shadows
const CLOUD_LIGHT = { ...LIGHTS.night, key: [-0.45, -0.66, 0.6], rimFrom: [-0.8, -0.5], rim: [0.6, 0.84, 1.0], rimAmt: 1.35, pool: 0.5, poolTint: [0.24, 0.28, 0.55], halo: 0.05, shadowDeep: 1.35 };
// the scale: the same cloud, and once the baby Sun is born its warm light comes from the upper right
const BABY_LIGHT = { ...CLOUD_LIGHT, key: [0.5, -0.62, 0.6], rimFrom: [0.85, -0.45], rim: [1.0, 0.74, 0.4], rimAmt: 1.45, keyTint: [1.1, 1.0, 0.86] };

// ================================================================ the trail: frame 1 and round it
const SUN_AT = [770, 860];                                  // the Sun in the trail's sky (world), off his head in close shots
const CAM_A = { x: 522, y: 1260, zoom: 2.92 }, CAM_B = { x: 522, y: 1266, zoom: 3.2 };   // frame 0, and a third of a second later
const CAM_SUN = { x: 610, y: 1046, zoom: 1.78 };            // "the Sun": him low left, the Sun high right
const AWAY_HOLD = [196, -300], AWAY_ROT = 0.08;             // the bottle at arm's length after the spit (rig-local)
const BTN_HOLD = [150, -318], BTN_ROT = -0.22;              // where the bottle waits in the last shot

// the hiker on the trail as a function of tt = seconds since frame 1 (negative = the last frames of the Short, on their
// way here). Returns trHero's description.
function hookA(tt) {
  const c = cu();
  const up = tt < 0 ? ramp(tt, -0.55, -0.1, E.inOutCubic) : 1;            // (the end of the Short) the bottle comes up
  const off = ramp(tt, c.spit - 0.03, c.spit + 0.12, E.outCubic);          // the spit: the bottle comes off his lips
  const away = ramp(tt, c.spit + 0.05, c.spit + 0.5, E.inOutCubic);        // ... out to arm's length, upright
  const drink = up * (1 - off);
  let gl = 0;
  if (tt < c.freeze) for (const f of c.glugs) { const d = tt - f; if (d >= 0 && d < 0.42) gl = Math.max(gl, Math.sin(Math.PI * d / 0.42)); }
  // the face: sipping with his eyes shut; a glance up at the Sun; back to the bottle, cross-eyed; brows up on "WATER";
  // frozen mid-gulp; the spit (eyes squeezed, mouth open); then disgust at the bottle
  let face = { ...TRFACE.sip };
  const sunK = ramp(tt, c.sun1 - 0.25, c.sun1 + 0.05) * (1 - ramp(tt, c.water1 - 0.2, c.water1 + 0.05));
  face = lerpFace(face, { ...TRFACE.up, lookX: 0.9, lookY: -1, eyeOpen: 1.15 }, sunK);
  const atB = ramp(tt, c.water1 - 0.2, c.water1 + 0.05);
  face = lerpFace(face, { ...TRFACE.sip, blink: 0, lookX: 0, lookY: 0.35, cross: 0.55, eyeOpen: 1.0, browY: 0.7 }, atB);
  face = lerpFace(face, { ...face, browY: 1.55, eyeOpen: 1.25, pupil: 0.8 }, ramp(tt, c.water2 - 0.05, c.water2 + 0.1) * (1 - ramp(tt, c.youve, c.youve + 0.3)));
  face = lerpFace(face, { ...TRFACE.sip, blink: 0, lookX: 0, lookY: 0.4, cross: 1, eyeOpen: 1.38, pupil: 0.55, browY: 1.2, browTilt: 0.6 }, ramp(tt, c.freeze, c.freeze + 0.12));
  face = lerpFace(face, { ...FACES.shock, mouth: 'o', mouthOpen: 0.9, blink: 1, browY: 1.3 }, ramp(tt, c.spit - 0.03, c.spit + 0.05) * (1 - ramp(tt, c.spit + 0.3, c.spit + 0.45)));
  face = lerpFace(face, { eyeOpen: 0.85, pupil: 0.9, lookX: 0.9, lookY: 0.2, browY: -0.3, browTilt: -0.8, mouth: 'wavy', mouthOpen: 0.45, blink: 0, cross: 0 }, ramp(tt, c.spit + 0.3, c.spit + 0.45));
  if (tt < 0) face = TRFACE.sip;
  // a held mouthful at the freeze; empty after the spit
  const cheeks = tt < 0 ? 0.22 * up : clamp(lerp(0.22 + 0.3 * gl, 1, ramp(tt, c.freeze, c.freeze + 0.12)) * (1 - off));
  const jolt = bumpAt(tt, c.spit, 7);
  return {
    face, drink, gulp: gl, cheeks, level: 0.62, slosh: 0.12 * gl - 0.45 * jolt * Math.sin((tt - c.spit) * 30), fizz: 1 - off,
    headRot: -0.17 * drink + 0.08 * jolt * Math.sin((tt - c.spit) * 30), headDY: 3.2 * gl - 10 * jolt, headDX: 5 * drink - 6 * jolt,
    flinch: jolt * 0.6, bob: -6 * jolt,
    hold: tt < 0 ? BTN_HOLD : lerp2([132, -322], AWAY_HOLD, away), holdRot: tt < 0 ? BTN_ROT : lerp(-0.3, AWAY_ROT, away),
  };
}
function hookCam(tt) {
  const c = cu();
  if (tt < 0) return camKeys(tt, [[-0.9, 482, 1262, 1.9], [-0.3, 510, 1250, 2.55], [0, CAM_A.x, CAM_A.y, CAM_A.zoom]], E.inOutCubic);
  const k = camKeys(tt, [[0, CAM_A.x, CAM_A.y, CAM_A.zoom], [0.3, CAM_B.x, CAM_B.y, CAM_B.zoom], [c.sun1 - 0.32, 520, 1262, 3.05],
    [c.sun1 + 0.12, CAM_SUN.x, CAM_SUN.y, CAM_SUN.zoom], [c.water1 - 0.22, CAM_SUN.x - 6, CAM_SUN.y + 6, CAM_SUN.zoom * 1.03],
    [c.water1 + 0.18, 512, 1250, 2.95], [c.water2 - 0.05, 512, 1250, 2.95], [c.water2 + 0.18, 508, 1240, 3.25],
    [c.freeze, 508, 1246, 3.3], [c.spit - 0.03, 500, 1236, 3.55], [c.spit + 0.5, 592, 1262, 2.45], [c.before, 596, 1270, 2.3]], E.inOutCubic);
  if (tt >= 0 && tt < 0.3) { const u = E.outCubic(tt / 0.3); k.zoom = lerp(CAM_A.zoom, CAM_B.zoom, u); k.y = lerp(CAM_A.y, CAM_B.y, u); }
  const j = bumpAt(tt, c.spit, 10);
  k.x += 8 * j * Math.sin((tt - c.spit) * 60); k.y += 7 * j * Math.cos((tt - c.spit) * 52);
  return k;
}
// the note on the bottle (in the bottle's own frame: nozzle at 0, the body runs to +y)
function noteOnBottle(lc, rim, rot, k, t) {
  if (k <= 0.01) return;
  lc.save(); lc.translate(rim[0], rim[1]); lc.rotate(rot);
  clNote(lc, 4, 96, 104, -0.1, k, 'LEFTOVERS', t);
  lc.restore();
}
// the whole trail picture at tt. o: {cam, A (overrides), noteK, fill, stars, beard, after}
function trailAt(tt, t, o = {}) {
  const c = cu(), cam = o.cam || hookCam(tt);
  const A = Object.assign(hookA(tt), o.A || {});
  const noteK = o.noteK === undefined ? (tt < 0 ? 0 : ramp(tt, c.spit + 0.28, c.spit + 0.46)) : o.noteK;
  const userPost = A.post;
  A.post = (lc, P) => {
    if (o.fill > 0) heroWater(lc, P, o.fill, t, o.stars || 0, o.drain || 0);
    noteOnBottle(lc, P.rim, P.rot, noteK, t);
    if (o.beard > 0.01) trHeadSpace(lc, P.H, (hc) => clBeard(hc, o.beard, t, 0.6));
    if (userPost) userPost(lc, P);
  };
  const Hh = trailDraw(t, { cam, A, sun: { at: SUN_AT, k: 1, rays: 0.25 }, after: (Hr) => {
    if (tt >= 0) spitSpray(Hr, tt, t);
    if (o.after) o.after(Hr);
  } });
  return { cam, Hh };
}
// the spit-take: a spray of water out of his mouth, both ways, and a fine mist
function spitSpray(Hr, tt, t) {
  const c = cu(), d = tt - c.spit;
  if (d < 0 || d > 0.85) return;
  const [mx, my] = Hr.mouth;
  trDrops(ctx, mx - 6, my + 4, c.spit, tt, 14, 3, -1.05, 330);
  trDrops(ctx, mx + 6, my + 4, c.spit, tt, 14, 8, 1.05, 330);
  trDrops(ctx, mx, my + 6, c.spit + 0.02, tt, 8, 13, 0, 240);
  if (d < 0.35) paint(() => { const k = d / 0.35; for (let i = 0; i < 5; i++) softDot(ctx, mx + (i - 2) * 26 * (1 + 2 * k), my + 10 - 30 * k, 22 + 40 * k, '#CDEBFF', 0.5 * (1 - k)); });
}
// his body filled with water (in his own layer, rig-local; source-atop keeps it on him): level 0..1 of the way to his
// chest, stars (0..1) twinkle in it, drain (0..1) takes it away
function heroWater(lc, P, level, t, stars, drain) {
  const top = lerp(10, -338, clamp(level)) + 340 * clamp(drain);
  if (top > 6) return;
  lc.save();
  lc.globalCompositeOperation = 'source-atop';
  paint(() => {
    lc.beginPath(); lc.moveTo(-200, 40);
    for (let x = -200; x <= 200; x += 10) lc.lineTo(x, top + 7 * Math.sin(x * 0.045 + t * 7) + 4 * Math.sin(x * 0.09 - t * 5));
    lc.lineTo(200, 40); lc.closePath();
    lc.fillStyle = 'rgba(38,138,236,0.7)'; lc.fill();
    lc.beginPath();
    for (let x = -200; x <= 200; x += 10) { const y = top + 7 * Math.sin(x * 0.045 + t * 7) + 4 * Math.sin(x * 0.09 - t * 5); x === -200 ? lc.moveTo(x, y) : lc.lineTo(x, y); }
    lc.lineWidth = 5; lc.strokeStyle = 'rgba(210,240,255,0.85)'; lc.stroke();
    for (let i = 0; i < 9; i++) {                                  // bubbles rising
      const u = (hash(i * 2.3) + t * (0.35 + 0.3 * hash(i + 4))) % 1, x = -70 + 140 * hash(i * 5.7 + 1), y = lerp(-6, top + 12, u);
      if (y > top + 8) lc.beginPath(), lc.arc(x, y, 3 + 3 * hash(i + 9), 0, 7), lc.fillStyle = 'rgba(225,246,255,0.7)', lc.fill();
    }
    if (stars > 0.01) for (let i = 0; i < 16; i++) {                // the bits older than the Sun: little stars in him
      const x = -78 + 156 * hash(i * 3.9 + 2), y = lerp(-20, -320, hash(i * 1.7 + 5));
      if (y < top + 14) continue;
      const tw = 0.55 + 0.45 * Math.sin(t * (3 + 2 * hash(i)) + i), s = (8 + 9 * hash(i + 3)) * clamp(stars * 1.4 - 0.4 * hash(i * 7.1));
      if (s <= 0.3) continue;
      lc.fillStyle = rgba('#FFF6C8', 0.95 * tw);
      lc.beginPath(); lc.moveTo(x, y - s * 1.6); lc.lineTo(x + s * 0.35, y - s * 0.35); lc.lineTo(x + s * 1.6, y); lc.lineTo(x + s * 0.35, y + s * 0.35);
      lc.lineTo(x, y + s * 1.6); lc.lineTo(x - s * 0.35, y + s * 0.35); lc.lineTo(x - s * 1.6, y); lc.lineTo(x - s * 0.35, y - s * 0.35); lc.closePath(); lc.fill();
    }
  });
  lc.restore();
}

SC.hook = (lt, t, shot) => {
  const c = cu();
  trailAt(t, t);
  return { glow: 0.8, capY: 1450, flash: 0.22 * bumpAt(t, c.spit, 30) * (t >= c.spit ? 1 : 0) };
};

// ================================================================ the rewind: back to before the Sun
const fmtN = (n) => Math.round(n).toLocaleString('en-US');
SC.rewind = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const rw = ramp(t, c.before - 0.05, c.gone, E.inCubic);          // how far back we have gone (the Sun shrinks)
  const dis = ramp(t, c.sun2, c.gone + 0.25, E.inOutCubic);        // the mountain dissolves (no Earth yet)
  const blue = 1 - ramp(t, c.before + 0.1, c.born, E.inOutCubic);  // the sky goes out
  const clK = ramp(t, c.born - 0.1, shot.end, E.inOutCubic);       // the cloud comes in round him
  const suitK = t >= c.gone + 0.04 ? 1 : 0;
  const cam = camKeys(lt, [[0, 596, 1270, 2.3], [0.5, 570, 1240, 1.55], [c.gone - shot.start, 548, 1230, 1.1], [D, 540, 1230, 1.22]], E.inOutCubic);
  cam.x += 6 * Math.sin(t * 47) * (1 - clK); cam.y += 4 * Math.cos(t * 39) * (1 - clK);
  // the hero's state: the hook's last state, the bottle at arm's length; he floats up a little once the ground is gone
  const A = hookA(c.before - 0.01);
  A.face = lerpFace(A.face, { ...TRFACE.huh, lookX: 0.7, lookY: -1 }, ramp(t, c.sun2 - 0.1, c.sun2 + 0.15));
  A.face = lerpFace(A.face, { ...FACES.startled, lookX: 0, lookY: 0.8, mouth: 'o', mouthOpen: 0.6 }, ramp(t, c.gone - 0.05, c.gone + 0.1));
  A.level = 0.62 * (1 - ramp(t, c.before, c.born, E.inOutCubic));   // the water runs back UP out of the bottle
  A.fizz = 0;
  A.suit = suitK > 0;
  A.y = TR.hy - 40 * ramp(t, c.gone - 0.1, shot.end, E.outCubic) + 6 * Math.sin(t * 3);
  A.armL = suitK ? [-150, -290] : null;
  A.post = (lc, P) => noteOnBottle(lc, P.rim, P.rot, t < c.gone ? 1 : 0, t);
  // the sky (blue going black), the cloud fading in over it, the Sun shrinking to a spark and going out
  trSky(cam, t, { blue, stars: 1 });
  if (clK > 0.01) clBg(cam, t, { k: clK });
  const sunR = 44 * lerp(1, 0.08, rw);
  if (t < c.gone + 0.1) {
    const sk = t < c.gone ? 1 : 1 - (t - c.gone) / 0.1;
    trSun(cam, t, { at: SUN_AT, blue, k: sk, r: sunR, rays: 0, glow: 0.6 + 0.8 * rw });
    if (t > c.gone - 0.06) { applyCam(cam); softDot(gctx, SUN_AT[0], SUN_AT[1], 90 * sk, '#FFE9B0', 0.9 * sk); }
  }
  // the ground and the ridges break up and blow away (dust going back to where it came from)
  ctx.globalAlpha = clamp(1 - dis);
  if (dis < 0.99) { trClouds(cam, t, { k: blue }); trRidges(cam, t, { blue }); trLedge(cam, t, { blue }); }
  ctx.globalAlpha = 1;
  if (dis > 0.01 && dis < 1) {
    applyCam(cam);
    const rng = mulberry32(77);
    paint(() => {
      for (let i = 0; i < 120; i++) {
        const x0 = -300 + 1700 * rng(), y0 = 1300 + 700 * rng(), sp = 300 + 700 * rng(), a = -1.9 + 0.8 * rng();
        const d = Math.max(0, dis - 0.25 * rng());
        const x = x0 + Math.cos(a) * sp * d * 1.2, y = y0 + Math.sin(a) * sp * d * 1.2, r = (3 + 9 * rng()) * (1 - d * 0.6);
        if (d > 0) circle(ctx, x, y, r, rgba(['#8B8478', '#6A5646', '#4F9A4C', '#5682B4'][i % 4], 0.85 * (1 - d)));
      }
    });
  }
  const Hh = trHero(cam, t, A);
  // water flying UP out of the bottle, back where it came from (it is a rewind)
  if (t < c.born + 0.1) {
    applyCam(cam);
    paint(() => {
      for (let i = 0; i < 14; i++) {
        const ph = (hash(i * 1.3) + (t - c.before) * 1.6) % 1, x = Hh.rim[0] + (hash(i * 4.1) - 0.5) * 60 * ph, y = Hh.rim[1] - 20 - 380 * ph;
        if (t > c.before) circle(ctx, x, y, 5 + 4 * hash(i + 2), rgba('#7FD0FF', 0.9 * (1 - ph)));
      }
    });
  }
  if (suitK) { applyCam(cam); clPuff(ctx, Hh.head[0], Hh.head[1] + 60, t - c.gone - 0.04, 1.6); }
  if (clK > 0.3) clGrains(cam, t, 2, clK);
  // the rewind sign and the counter (screen space)
  screenSpace();
  const sk = popK(t, c.before - 0.02, shot.end + 1);
  if (sk > 0) paint(() => {
    ctx.save(); ctx.translate(540, 520); ctx.scale(E.outBack(sk, 2), E.outBack(sk, 2));
    ctx.font = '400 58px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillText('◀◀ REWIND', 3, 5);
    ctx.fillStyle = '#FFFFFF'; ctx.fillText('◀◀ REWIND', 0, 0);
    ctx.restore();
  });
  const n = 4.6e9 * Math.pow(ramp(t, c.before + 0.1, c.gone, E.inCubic), 3);
  const nk = popK(t, c.before + 0.08, shot.end + 1);
  if (nk > 0) {
    bigWord(fmtN(n), 540, 618, 96, '#FFD447', E.outBack(nk, 2));
    bigWord('YEARS AGO', 540, 706, 54, '#FFFFFF', E.outBack(popK(t, c.before + 0.18, shot.end + 1), 2));
  }
  return { glow: 0.85, capY: 1470, vhs: 0.55 * (1 - clK) + 0.1, flash: 0.35 * bumpAt(t, c.gone, 20) * (t >= c.gone ? 1 : 0) };
};
const REWIND_LIGHT = (lt, t) => mixLight(DAY_LIGHT, CLOUD_LIGHT, ramp(t, cu().born - 0.1, cu().gone + 0.4));

// ================================================================ the cloud: half of it was ice
const CL_HERO = { x: 540, y: 1520, s: 0.92 };
const CL_HOLD = [168, -330], CL_HOLDROT = 0.22;
function cloudA(t) {
  const c = cu();
  const shiver = ramp(t, c.freezing - 0.1, c.freezing + 0.3);
  const face = lerpFace({ ...TRFACE.us, lookX: 0.75, lookY: 0.35, eyeOpen: 1.15 },
    { ...FACES.nervous, lookX: 0.2, lookY: 0, mouth: 'grimace', mouthOpen: 0.7, eyeOpen: 1.2 }, shiver);
  face.lookX = lerp(face.lookX, 0.75, ramp(t, c.up - 0.2, c.half) * (1 - shiver));
  return {
    x: CL_HERO.x, y: CL_HERO.y + 10 * Math.sin(t * 2.2), s: CL_HERO.s, suit: true, face, noBottle: false,
    hold: CL_HOLD, holdRot: CL_HOLDROT, level: 0.5 * ramp(t, c.up, c.half + 0.45, E.inOutSine), fizz: 0,
    headDX: 3 * shiver * Math.sin(t * 61), headDY: 2 * shiver * Math.sin(t * 53), armL: [-150 + 6 * shiver * Math.sin(t * 57), -300],
    flinch: 0.15 * shiver,
  };
}
// the frost that grows on his helmet (head space), 0..1
function helmetFrost(c, k, t) {
  if (k <= 0.01) return;
  paint(() => {
    const rng = mulberry32(5);
    for (let i = 0; i < 26; i++) {
      const a = Math.PI * (0.08 + 0.84 * rng()) + Math.PI, r = 94 - 6 * rng();
      if (rng() > k) continue;
      const x = Math.cos(a) * r, y = -8 - Math.sin(a) * r * -1, s = (0.35 + 0.35 * rng()) * Math.min(1, k * 1.5);
      clCrystal(c, x, y, s, rng() * 6, 0.6, '#EAF8FF');
    }
    // a frosty fog at the bottom of the glass
    const g = c.createLinearGradient(0, 30, 0, 90);
    g.addColorStop(0, 'rgba(230,246,255,0)'); g.addColorStop(1, rgba('#E6F6FF', 0.55 * k));
    c.fillStyle = g; c.beginPath(); c.arc(0, -8, 92, 0.12 * Math.PI, 0.88 * Math.PI); c.closePath(); c.fill();
  });
}
// ice grains flying into the open bottle (world), one per clink
function grainsIn(cam, t, rim) {
  const c = cu();
  applyCam(cam);
  paint(() => {
    c.clinks.forEach((T, i) => {
      const u = inv(T - 0.45, T, t);
      if (u <= 0 || u >= 1) return;
      const a = -0.5 + i * 1.1, R = 260 * (1 - E.inCubic(u));
      const x = rim[0] + Math.cos(a) * R + 30 * Math.sin(u * 5), y = rim[1] - 12 + Math.sin(a) * R * 0.8 - 60 * (1 - u);
      clCrystal(ctx, x, y, 0.9, u * 5 + i, 0.8);
      softDot(gctx, x, y, 24, '#BFEFFF', 0.6);
    });
  });
}
// ice sparkles inside the bottle (world): it is ice now
function bottleIce(cam, t, Hh, k) {
  if (k <= 0.01) return;
  applyCam(cam);
  const s = CL_HERO.s;
  ctx.save(); ctx.translate(Hh.rim[0], Hh.rim[1]); ctx.rotate(Hh.rot); ctx.scale(s, s);
  paint(() => {
    for (let i = 0; i < 7; i++) {
      const x = -14 + 28 * hash(i * 2.1), y = 100 + 52 * hash(i * 3.3 + 1), tw = 0.5 + 0.5 * Math.sin(t * 6 + i * 2);
      clCrystal(ctx, x, y, 0.45 * k, i, tw);
    }
    ctx.fillStyle = rgba('#E8FAFF', 0.35 * k); ctx.fillRect(-22, 98, 44, 58);
  });
  ctx.restore();
}
SC.cloud = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(t, [[shot.start, 600, 1262, 2.15], [c.half + 0.2, 610, 1250, 2.35], [c.ice + 0.1, 600, 1250, 2.3],
    [c.freezing + 0.05, 560, 1320, 1.25], [c.dark, 548, 1300, 0.98], [shot.end, 545, 1290, 0.9]], E.inOutCubic);
  cam.rot = 0.03 * Math.sin(t * 0.9);
  clBg(cam, t, { k: 1 });
  const A = cloudA(t);
  const frost = ramp(t, c.ice - 0.2, c.dark, E.inOutSine);
  A.post = (lc, P) => trHeadSpace(lc, P.H, (hc) => helmetFrost(hc, frost, t));
  const Hh = trHero(cam, t, A);
  grainsIn(cam, t, Hh.rim);
  bottleIce(cam, t, Hh, ramp(t, c.ice - 0.05, c.ice + 0.25));
  // the near grains, in front of him (but never across his face)
  const hs = toScreen(cam, Hh.head[0], Hh.head[1]);
  clGrains(cam, t, 2, 1, t, (x, y, lc) => { const p = toScreen(lc, x, y); return Math.hypot(p[0] - hs[0], p[1] - hs[1]) < 150 * cam.zoom; });
  // labels: UP TO 1/2 by the bottle, the cold
  const B = toScreen(cam, Hh.rim[0], Hh.rim[1] + 100 * CL_HERO.s);
  const hk = popK(t, c.half - 0.04, c.freezing - 0.1);
  if (hk > 0) {
    const bx = Math.min(B[0] + 150, 840), by = B[1];
    const lx = clamp(B[0] + 40, 300, 820), ly = Math.max(560, B[1] - 300 * Math.min(1.3, cam.zoom / 2));
    paint(() => {
      screenSpace();
      const e = E.outBack(hk, 2);
      ctx.save(); ctx.translate(bx - 62, by); ctx.scale(e, e);
      ctx.lineWidth = 7; ctx.strokeStyle = '#FFD447'; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-14, -78); ctx.lineTo(0, -78); ctx.lineTo(0, 78); ctx.lineTo(-14, 78); ctx.stroke();
      ctx.restore();
    });
    bigWord('UP TO ½', lx, ly, 80, '#FFD447', E.outBack(hk, 2), -0.05);
  }
  clTag(560, 500, '−260 °C', popK(t, c.freezing - 0.02, shot.end + 1), '#BFF0FF', 52);
  return { glow: 0.9, capY: 1460, flash: 0.0, push: { k: 1 + 0.03 * lt / D, cx: 540, cy: 900 } };
};

// ================================================================ the scale: a teeny bit too heavy
const SCL = { x: 600, y: 1290, s: 1.0 }, MOL_R = 104, BABY = [880, 790, 112];
SC.heavy = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(t, [[shot.start, 560, 1190, 1.2], [c.know_end, 570, 1196, 1.3], [c.teeny, 578, 1196, 1.38],
    [c.heavy - 0.05, 572, 1215, 1.52], [c.heavy_end + 0.1, 574, 1215, 1.55], [c.baby + 0.15, 680, 1060, 1.12], [shot.end, 684, 1056, 1.16]], E.inOutCubic);
  cam.x += wobble(t, c.heavy, 9, 7, 40); cam.rot = 0.02 * Math.sin(t * 0.8);
  clBg(cam, t, { k: 1 });
  // the baby Sun, up on the right: pops in on "baby", shakes its head on "make"
  applyCam(cam);
  const bk = ramp(t, c.baby - 0.06, c.baby + 0.3);
  const shake = t > c.make - 0.05 ? 0.32 * Math.sin((t - c.make + 0.05) * 15) * Math.exp(-(t - c.make) * 1.6) : 0;
  actor(() => clBabySun(ctx, BABY[0], BABY[1], BABY[2], t, { k: bk, shake, face: t > c.make - 0.1 ? 'nope' : 'sleep' }));
  // the hero floats on the left and leans in to read the dial
  const face = lerpFace({ ...TRFACE.us, lookX: 0.8, lookY: 0.6 }, { ...FACES.startled, lookX: 0.8, lookY: 0.5, mouth: 'o', mouthOpen: 0.5 }, ramp(t, c.heavy, c.heavy + 0.1));
  face.lookX = lerp(face.lookX, 0.95, ramp(t, c.baby, c.baby + 0.2)); face.lookY = lerp(face.lookY, -0.9, ramp(t, c.baby, c.baby + 0.2));
  trHero(cam, t, { x: 372, y: 1500 + 8 * Math.sin(t * 2.1), s: 0.8, suit: true, face, noBottle: true, armL: [-140, -300], flinch: 0.4 * bumpAt(t, c.heavy, 6),
    post: (lc, P) => trHeadSpace(lc, P.H, (hc) => helmetFrost(hc, 0.6, t)) });
  // the scale, the molecule hopping on, the needle
  applyCam(cam);
  const hop = ramp(t, c.how - 0.05, c.know, E.linear);
  const land = t >= c.know ? 1 : 0;
  const press = land * (1 - 0.6 * Math.exp(-(t - c.know) * 6));
  clScale(ctx, SCL.x, SCL.y, SCL.s, 0, t, { press });
  let needle = 0;
  if (t > c.know) needle = 0.12 + 0.42 * ramp(t, c.teeny, c.too + 0.1, E.inOutSine);
  if (t > c.heavy) needle = lerp(needle, 0.93, E.outBack(ramp(t, c.heavy, c.heavy + 0.22), 2.4));
  const suck = ramp(t, c.heavy + 0.18, c.heavy + 0.38) * (1 - ramp(t, c.make + 0.2, c.make + 0.5));
  const mface = t < c.heavy ? 'proud' : t < c.heavy + 0.2 ? 'oops' : suck > 0.5 ? 'strain' : 'oops';
  const onY = SCL.y - MOL_R * 1.36;
  const mx = lerp(900, SCL.x, hop), my = lerp(onY - 60, onY, hop) - 230 * Math.sin(Math.PI * hop) * (land ? 0 : 1);
  actor(() => clMol(ctx, land ? SCL.x : mx, land ? onY + 6 * press : my, MOL_R, t, { suck, face: mface, heavy: 1, look: t > c.baby ? 1 : 0 }));
  // the dial: a big round window on the front of the scale
  applyCam(cam);
  clDial(ctx, SCL.x, SCL.y + 70, 74, needle, t);
  // the label on the heavy hydrogen (the extra ball)
  const lk = popK(t, c.heavy + 0.35, c.baby - 0.05);
  if (lk > 0) {
    const hx = SCL.x + MOL_R * 0.88 + MOL_R * 0.5 * 0.62, hy = onY - MOL_R * 0.76 - MOL_R * 0.5 * 0.62;
    const p = toScreen(cam, hx, hy);
    screenSpace();
    thinLeader([p[0] - 40, p[1] - 150], [p[0], p[1] - 20], lk, '#FFD447');
    clTag(clamp(p[0] - 60, 260, 820), p[1] - 186, 'HEAVY HYDROGEN', lk, '#FFD447', 40);
  }
  return { glow: 0.9, capY: 1480, push: { k: 1 + 0.02 * lt / D, cx: 540, cy: 1000 } };
};
const HEAVY_LIGHT = (lt, t) => mixLight(CLOUD_LIGHT, BABY_LIGHT, ramp(t, cu().baby, cu().baby + 0.4));

// ================================================================ the button: bits of you are older than the Sun
SC.button = (lt, t, shot) => {
  const c = cu(), Dv = TLd.duration;
  const tt = t - Dv;                                          // negative: the last frames are on their way to frame 1
  if (t >= c.loop) { trailAt(tt, t); return { glow: 0.8, capY: 1450 }; }
  const fill = ramp(t, c.and + 0.15, c.water3_end, E.inOutSine);
  const drain = ramp(t, c.sun4_end - 0.02, c.sun4_end + 0.25, E.inCubic);
  const stars = ramp(t, c.bits, c.you + 0.15) * (1 + 0.6 * bumpAt(t, c.you, 5));
  const beard = t < c.sun4_end ? ramp(t, c.beard, c.beard + 0.2) : 0;
  // the camera: medium on him (the fill), down to his belly on "So", in on the beard, then on its way to frame 1
  let cam = camKeys(t, [[shot.start, 490, 1310, 1.4], [c.water3, 486, 1300, 1.46], [c.so, 480, 1320, 1.56], [c.you, 476, 1300, 1.62],
    [c.older2, 478, 1250, 1.9], [c.sun4_end, 482, 1262, 1.9]], E.inOutCubic);
  if (tt > -0.9) cam = hookCam(tt);
  cam.x += wobble(t, c.beard, 6, 7, 40);
  // his state: standing with the bottle at his side; looks down at himself on "So"; strokes the beard; then the sip
  const A = hookA(Math.min(tt, -0.0001));
  A.face = lerpFace({ ...TRFACE.us, lookX: 0, lookY: 0.2 }, { ...TRFACE.us, lookX: 0.05, lookY: 1, eyeOpen: 1.2, browY: 1.1 }, ramp(t, c.so - 0.1, c.so + 0.2));
  A.face = lerpFace(A.face, { ...FACES.startled, lookY: 1, mouth: 'o', mouthOpen: 0.5 }, ramp(t, c.you - 0.05, c.you + 0.1) * (1 - ramp(t, c.older2, c.older2 + 0.2)));
  A.face = lerpFace(A.face, { eyeOpen: 0.8, pupil: 1, lookX: 0.8, lookY: -0.6, browY: 0.9, browTilt: -0.4, mouth: 'grin', mouthOpen: 0.4, blink: 0, cross: 0 }, ramp(t, c.older2, c.older2 + 0.2) * (1 - ramp(t, c.sun4_end, c.sun4_end + 0.15)));
  if (tt > -0.6) A.face = lerpFace(A.face, TRFACE.sip, ramp(tt, -0.6, -0.35));
  const stroke = ramp(t, c.beard + 0.15, c.beard + 0.4) * (1 - ramp(t, c.sun4_end - 0.1, c.sun4_end + 0.1));
  if (stroke > 0.01) A.armL = [lerp(-100, -16, stroke), lerp(-300, -360 + 14 * Math.sin(t * 9), stroke)];
  const { Hh } = trailAt(tt, t, { cam, A, fill, stars, drain, beard, noteK: 0, after: (Hr) => {
    clPuff(ctx, Hr.head[0], Hr.head[1] + 80, t - c.sun4_end, 1.1);
  } });
  // the 60 % tag beside him
  const tk = popK(t, c.water3 - 0.05, c.so + 0.1);
  if (tk > 0) clTag(760, 760, '≈60% WATER', tk, '#7FE9FF', 44);
  return { glow: 0.8, capY: 1460, push: { k: 1 + 0.02 * (t - shot.start), cx: 540, cy: 900 } };
};

// ================================================================ the cover (src/cover.sh)
SC.cover = (lt, t) => {
  const c = cu(), tt = c.spit + 0.62;
  const cam = { x: 548, y: 1220, zoom: 2.05 };
  trailAt(tt, tt, { cam });
  screenSpace();
  bigWord('OLDER THAN', 540, 640, 116, '#FFFFFF', 1, -0.04);
  bigWord('THE SUN?', 540, 770, 150, '#FFD447', 1, -0.04);
  return { glow: 0.8, noCaptions: true };
};

setLights({ hook: DAY_LIGHT, rewind: REWIND_LIGHT, cloud: CLOUD_LIGHT, heavy: HEAVY_LIGHT, button: DAY_LIGHT, cover: DAY_LIGHT });

function initScenes2() {
  initTrail();
  initCloud();
}
