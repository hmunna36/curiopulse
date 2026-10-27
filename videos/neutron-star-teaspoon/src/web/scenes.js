// How Much Does a Teaspoon of NEUTRON Star Weigh? 🥄 Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds
// inside the shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
// THE CURIOUS KIND (story.md §6): the hero goes there. At his mountain campsite at dusk he lifts a heaped, glowing teaspoon out
// of a jar of NEUTRON STAR over his tea; it weighs as much as the mountain behind him, so it smashes through the table. Then:
// he scoops it off a spinning neutron star in space, the Sun caves in to a ball as wide as a night city, an atom is an empty
// stadium with a pea in the middle whose stands fold in, back at camp he cannot budge the spoon, the stuff swells and
// EXPLODES (it only holds together on its star), and, deadpan and sooty, he goes back for another spoonful: the loop.
'use strict';

const cu = () => TLd.cues;
// easings this Short needs beyond lib.js's set
E.inQuad = E.inQuad || ((x) => x * x);
E.outQuad = E.outQuad || ((x) => 1 - (1 - x) * (1 - x));
E.outSine = E.outSine || ((x) => Math.sin((x * Math.PI) / 2));
E.outBounce = E.outBounce || ((x) => { const n = 7.5625, d = 2.75; if (x < 1 / d) return n * x * x; if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75; if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375; return n * (x -= 2.625 / d) * x + 0.984375; });
const r2 = (t, a, b, e = E.inOutCubic) => ramp(t, a, b, e);
const bumpAt = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);

// ---------------------------------------------------------------- the light of each place
// camp: the lantern on the table (warm, from the left, above his head), the afterglow behind him on the right (a pink rim)
const L_CAMP = { ...LIGHTS.candle, key: [-0.55, -0.58, 0.6], rimFrom: [0.9, -0.2], rim: [1.0, 0.62, 0.58], rimAmt: 1.25,
  haloColor: [1.0, 0.7, 0.55], halo: 0.12, pool: 0.5, poolTint: [0.4, 0.38, 0.74], dof: 0.55 };
const L_SPACE = { ...LIGHTS.night, key: [-0.45, -0.62, 0.6], keyTint: [0.98, 1.0, 1.08], rimFrom: [0.6, 0.75], rim: [0.62, 0.86, 1.0],
  rimAmt: 1.5, pool: 0.3, halo: 0.08 };
const L_SUN = { ...LIGHTS.sunset, key: [0.6, -0.45, 0.6], rimFrom: [0.85, -0.1], rim: [1.0, 0.62, 0.25], rimAmt: 1.5, pool: 0.25 };
const L_CITY = { ...LIGHTS.night, key: [0.15, -0.85, 0.5], keyTint: [0.94, 1.02, 1.12], rimFrom: [0.3, -0.95], rim: [0.7, 0.88, 1.0],
  rimAmt: 1.4, pool: 0.45, poolTint: [0.3, 0.36, 0.7] };
const L_STADIUM = { ...LIGHTS.night, key: [-0.3, -0.8, 0.55], keyTint: [1.04, 1.04, 1.0], rimFrom: [0.8, -0.5], rim: [0.85, 0.92, 1.0],
  rimAmt: 1.1, pool: 0.35, poolTint: [0.3, 0.34, 0.6] };
setLights({
  hook: L_CAMP, crash: L_CAMP, payoff: L_CAMP, weird: L_CAMP, button: L_CAMP, cover: L_CAMP,
  blast: (lt, t) => ({ ...L_CAMP, rim: [0.75, 0.9, 1.0], rimAmt: 1.25 + 2.5 * bumpAt(t, cu().explode_end, 3) }),
  star: L_SPACE, sun: L_SUN, city: L_CITY, atoms: L_STADIUM, gone: L_STADIUM,
});

// ---------------------------------------------------------------- the hero at camp
const NH = { x: 455, y: NC.gy, s: NC.heroS };
const HF = {
  look: Object.assign({}, FACES.calm, { lookX: 1, lookY: -0.55, browY: 0.45, mouth: 'grin', mouthOpen: 0.3 }),
  wonder: Object.assign({}, FACES.calm, { lookX: 1, lookY: -0.6, browY: 1.0, browTilt: 0.25, mouth: 'o', mouthOpen: 0.35 }),
  weigh: Object.assign({}, FACES.calm, { lookX: 1, lookY: -0.5, blink: 0.38, browY: 0.2, browTilt: -0.35, mouth: 'flat', mouthOpen: 0.15 }),
  light: Object.assign({}, FACES.grin, { lookX: 1, lookY: -0.5, browY: 0.7, mouthOpen: 0.55 }),
  shock: Object.assign({}, FACES.startled, { lookX: 0.6, lookY: 0.9, mouth: 'o', mouthOpen: 0.95, eyeOpen: 1.45 }),
  down: Object.assign({}, FACES.startled, { lookX: 0.45, lookY: 1, mouth: 'o', mouthOpen: 0.55 }),
  strain: Object.assign({}, FACES.nervous, { lookX: 0.4, lookY: 1, blink: 0.75, browY: 1.1, browTilt: 1.0, mouth: 'grimace', mouthOpen: 1 }),
  pant: Object.assign({}, FACES.dazed, { cross: 0, lookX: 0.6, lookY: 0.5, mouth: 'o', mouthOpen: 0.7, blink: 0.3 }),
  curious: Object.assign({}, FACES.calm, { lookX: 0.7, lookY: 0.9, browY: 0.8, browTilt: 0.3, mouth: 'o', mouthOpen: 0.3 }),
  uhoh: Object.assign({}, FACES.nervous, { lookX: 0.8, lookY: 0.8, browY: 1.2, mouth: 'grimace', mouthOpen: 0.8 }),
  deadpan: Object.assign({}, FACES.calm, { lookX: 0, lookY: 0, blink: 0.45, browY: -0.1, browTilt: -0.15, mouth: 'flat', mouthOpen: 0 }),
  blinkOut: Object.assign({}, FACES.calm, { lookX: 0, lookY: 0, blink: 1, browY: -0.1, mouth: 'flat', mouthOpen: 0 }),
};
// A: {face, headRot, headDX, headDY, lean, dx, dy, armL/armR: {e, w} (world), handL/handR, soot, frizz, spoon: {a, heap,
// bulge, crack, s} drawn from the right hand, post(lc, r, st)}. Returns {st, r, hand: [x, y] world, bowl: [x, y] world}
function ncHero(cam, t, A) {
  const st = { x: NH.x + (A.dx || 0), y: NH.y + (A.dy || 0), s: NH.s, face: A.face || HF.look, headRot: A.headRot || 0,
    headDX: A.headDX || 0, headDY: A.headDY || 0, soot: A.soot || 0, frizz: A.frizz || 0, blink: 0, seed: 4 };
  let pose = JSON.parse(JSON.stringify(A.pose || POSES.stand));
  pose.lean = (pose.lean || 0) + (A.lean || 0);
  const loc = (p) => ikLocal(st, p[0], p[1]);
  if (A.armR) pose = armAt(pose, 'R', loc(A.armR.e), loc(A.armR.w));
  if (A.armL) pose = armAt(pose, 'L', loc(A.armL.e), loc(A.armL.w));
  pose.handR = A.handR || 'fist'; pose.handL = A.handL || 'open';
  st.pose = pose;
  const out = { st };
  out.r = charLayer(cam, st, t, { pal: PAL, post: (lc, rr, st2) => {
    const wr = rr.wrR, d = rr.armDirR;
    const hx = st2.x + (wr[0] + d[0] * 14) * st2.s, hy = st2.y + (wr[1] + d[1] * 14) * st2.s;
    out.hand = [hx, hy];
    if (A.spoon) {
      const S = A.spoon;
      lc.save(); lc.setTransform(1, 0, 0, 1, 0, 0); camTransform(lc, cam, 1);
      out.bowl = ncSpoonOn(lc, hx, hy, S.a, S.s || 1, t, S);
      // the fist again over the handle
      circle(lc, hx, hy, 23 * st2.s, PAL.skinSh); circle(lc, hx - 2, hy - 2, 20 * st2.s, PAL.skin);
      line(lc, hx - 12, hy - 6, hx + 8, hy - 10, 4, PAL.skinSh);
      lc.restore();
    }
    if (A.post) A.post(lc, rr, st2);
  } });
  return out;
}
// the spoon drawn on any context (ncSpoon draws on ctx-like c; the blob's glow goes to gctx in world coords)
function ncSpoonOn(c, gx, gy, a, s, t, o) { return ncSpoon(c, gx, gy, a, s, t, o); }

// ---------------------------------------------------------------- the hook as a function of time (valid at negative time:
// the button plays it from -3.5 s, so the last frame of the Short is frame 0)
const HOOK0 = { cam: { x: 528, y: 1212, zoom: 2.8 } };
const SPS = 0.62;   // the teaspoon's size next to him
function hookA(tt) {
  const c = cu();
  // the right hand: in the jar (dip), lifting out with the heap, then held up beside his face
  const JAR = [NC.jarX, NC.tableY - 170];
  const up = r2(tt, -0.25, 0.9, E.outCubic);                       // 0 at frame 0 = just out of the jar, rising
  const dip = tt < -0.25 ? r2(tt, -2.2, -1.4) * (1 - r2(tt, -0.9, -0.25, E.inOutSine)) : 0;
  let w = [lerp(598, 566, up), lerp(1232, 1214, up) + 60 * dip];
  let e = [lerp(590, 578, up), lerp(1338, 1332, up) + 26 * dip];
  let a = lerp(-0.7, -1.05, up) + 1.6 * dip;
  // weighing it: little bounces in the palm while "About as much as..."
  const wb = r2(tt, c.about - 0.1, c.about + 0.2) * (1 - r2(tt, c.mountain_end - 0.2, c.mountain_end));
  w[1] += wb * 14 * Math.sin((tt - c.about) * 11);
  a += wb * 0.05 * Math.sin((tt - c.about) * 11 - 0.6);
  // bring it closer to his eye on "About" (squint), back on "a MOUNTAIN"
  const close = r2(tt, c.about - 0.2, c.about + 0.4) * (1 - r2(tt, c.a_mtn - 0.1, c.a_mtn + 0.25));
  w = [w[0] - 14 * close, w[1] - 12 * close];
  // button pre-roll: from deadpan with an empty spoon (-3.5) to the dip
  const pre = tt < -1.4 ? 1 - r2(tt, -3.0, -2.2) : 0;
  if (pre > 0) { w = [lerp(w[0], 548, pre), lerp(w[1], 1296, pre)]; e = [lerp(e[0], 556, pre), lerp(e[1], 1380, pre)]; a = lerp(a, -0.3, pre); }
  let face = HF.look;
  if (tt < -0.4) face = lerpFace(HF.deadpan, HF.look, r2(tt, -1.6, -0.6));
  if (tt > c.weighs - 0.3) face = lerpFace(HF.look, HF.wonder, r2(tt, c.weighs - 0.3, c.weighs));
  if (tt > c.about - 0.2) face = lerpFace(HF.wonder, HF.weigh, r2(tt, c.about - 0.2, c.about + 0.2));
  if (tt > c.a_mtn - 0.15) face = lerpFace(HF.weigh, HF.light, r2(tt, c.a_mtn - 0.15, c.a_mtn + 0.1));
  const heap = tt < -0.8 ? 0 : 1;
  const strand = tt < 0.55 ? 1 - r2(tt, -0.2, 0.55) : 0;             // a glowing string from the jar, snapping
  return { w, e, a, face, heap, strand, JAR, headRot: 0.06 * Math.sin(tt * 1.3) + 0.07 * r2(tt, c.weighs - 0.4, c.weighs) - 0.05 * close,
    headDX: 6 * close, lean: -0.02 + 0.02 * close };
}
function hookCam(tt) {
  const c = cu();
  let cam = { x: HOOK0.cam.x + 6 * tt, y: HOOK0.cam.y - 4 * tt, zoom: HOOK0.cam.zoom + 0.05 * clamp(tt / 2.4, -1, 1) };
  if (tt < 0) {                                                     // the button: from a medium shot to frame 0
    const k = r2(tt, -3.4, 0, E.inOutSine);
    cam = { x: lerp(528, HOOK0.cam.x, k), y: lerp(1190, HOOK0.cam.y, k), zoom: Math.exp(lerp(Math.log(1.6), Math.log(HOOK0.cam.zoom), k)) };
  }
  if (tt > c.about - 0.3) {                                         // push in on the spoon while he weighs it
    const k = r2(tt, c.about - 0.3, c.a_mtn - 0.1, E.inOutSine);
    cam = { x: lerp(cam.x, 560, k), y: lerp(cam.y, 1170, k), zoom: lerp(cam.zoom, 3.25, k) };
  }
  if (tt > c.a_mtn - 0.12) {                                        // the whip: up and out to the mountain
    const k = r2(tt, c.a_mtn - 0.12, c.a_mtn + 0.26, E.inOutCubic);
    const W2 = { x: 610, y: 905 - 30 * r2(tt, c.a_mtn + 0.26, c.mountain_end + 0.2, E.outSine), zoom: 0.8 + 0.03 * r2(tt, c.a_mtn + 0.26, c.mountain_end, E.outSine) };
    cam = { x: lerp(cam.x, W2.x, k), y: lerp(cam.y, W2.y, k), zoom: Math.exp(lerp(Math.log(cam.zoom), Math.log(W2.zoom), k)) };
  }
  cam.rot = 0;
  return cam;
}
// the whole camp at a time and a camera. o: {table: {brk, hx}, mug: {x, y, rot, empty}, jar: {x, y, rot}, hero: A, under, over,
// lamp: {sw}, blown}
function campDraw(t, cam, o) {
  campBack(cam, t, { blown: o.blown });
  ncTent(cam, t);
  applyCam(cam);
  if (o.under) o.under(cam);
  const H = o.hero ? ncHero(cam, t, o.hero) : null;
  applyCam(cam);
  if (o.strand > 0.01 && H && H.bowl) {                             // the glowing string from the jar to the spoon
    const j = [o.jar && o.jar.x ? o.jar.x : NC.jarX, NC.tableY - 100];
    both((c, g) => {
      c.lineCap = 'round'; c.lineWidth = (g ? 6 : 3) * o.strand; c.strokeStyle = g ? 'rgba(180,235,255,0.7)' : '#E6FAFF';
      c.beginPath(); c.moveTo(j[0], j[1]); c.quadraticCurveTo((j[0] + H.bowl[0]) / 2 + 10, Math.max(j[1], H.bowl[1]) + 30 * o.strand, H.bowl[0], H.bowl[1]); c.stroke();
    });
  }
  ncTable(t, o.table || {});
  const lamp = o.lamp || {};
  ncLantern(NC.lampX, NC.tableY - 4 + (lamp.dy || 0), t, lamp.sw || 0, lamp.on === undefined ? 1 : lamp.on);
  const mg = o.mug || {};
  if (!mg.gone) ncMug(mg.x || NC.mugX, mg.y || NC.tableY - 4, t, mg);
  const jr = o.jar || {};
  if (!jr.gone) ncJar(jr.x || NC.jarX, jr.y || NC.tableY - 4, t, jr);
  if (o.over) { applyCam(cam); o.over(cam, H); }
  applyCam(cam);
  return H;
}

// ---------------------------------------------------------------- shots
SC.hook = (lt, t, shot) => {
  const c = cu(), tt = t;
  const cam = hookCam(tt), A = hookA(tt);
  campDraw(t, cam, {
    strand: A.strand,
    hero: { face: A.face, headRot: A.headRot, headDX: A.headDX, lean: A.lean, armR: { e: A.e, w: A.w },
      armL: { e: [372, 1336], w: [452, 1338] }, spoon: { a: A.a, heap: A.heap, s: SPS } },
  });
  ncFireflies(cam, t, 1);
  // the comparison: the weight in a pill under the peak, on "MOUNTAIN" (drawn after the light)
  const k = ramp(t, c.mountain - 0.05, c.mountain + 0.3, E.outBack);
  const whip = Math.max(0, 1 - Math.abs(t - (c.a_mtn + 0.07)) / 0.2);
  return { glow: 0.85, blur: [0, -150 * whip], push: { k: 1 + 0.012 * Math.sin(t * 0.9), cx: 540, cy: 900 },
    overlay: () => { if (k > 0.01) ncPillLabel('≈ 1,000,000,000 TONNES', 540, 640, k, '#FFD447'); } };
};
// a label in a dark pill (screen space)
function ncPillLabel(txt, x, y, k, col = '#FFFFFF', size = 54) {
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.rotate(-0.03 * (1 - k));
  ctx.font = `900 ${size}px Montserrat`;
  const w = ctx.measureText(txt).width + 64;
  rrect(ctx, -w / 2, -size * 0.85, w, size * 1.7, size * 0.85); ctx.fillStyle = 'rgba(10,12,34,0.82)'; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = rgba(col, 0.9); ctx.stroke();
  ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, 4);
  ctx.restore();
}

// ---------------------------------------------------------------- space: he scoops it off the star itself
// the hero in his spacesuit (jupiter-no-ground's jpHero), holding a teaspoon in his right hand; returns the bowl (screen)
function suitHero(cam, t, A) {
  const H = jpHero(cam, t, Object.assign({ pose: JP_POSE.float, face: JF.look }, A));
  const r = H.r, d = r.armDirR;
  const hand = H.wp([r.wrR[0] + d[0] * 14, r.wrR[1] + d[1] * 14]);
  applyCam(cam);
  const s = (A.s || 1) * SPS;
  const bowl = ncSpoon(ctx, hand[0], hand[1], A.spoonA === undefined ? 0.6 : A.spoonA, s, t, { heap: A.heap === undefined ? 1 : A.heap });
  circle(ctx, hand[0], hand[1], 21 * (A.s || 1), '#E9EDF6'); circle(ctx, hand[0] - 2, hand[1] - 2, 17 * (A.s || 1), '#FFFFFF');
  return { H, hand, bowl };
}
SC.star = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 540, y: 960, zoom: 1, rot: 0 };
  spaceBg(t, { dx: -30 * lt });
  screenSpace();
  const S = [660, 1180], R = 240;
  const st = nsStar(S[0], S[1], R, t, { spin: 1.7, tilt: 0.55 });
  // him above it, in the suit, scooping: the string of its stuff stretches up to his spoon and snaps
  const sc = r2(lt, 0.05, D * 0.6, E.inOutSine);
  const A = { x: 190 + 20 * sc, y: 1290 - 30 * sc, s: 0.7, pose: JP_POSE.float, face: JF.oh, rot: 0.12 - 0.08 * sc,
    armR: { e: [80, -320], w: [150, -250] }, spoonA: lerp(0.5, -0.1, sc), heap: 1 };
  applyCam(cam);
  const SH = suitHero(cam, t, A);
  screenSpace();
  const sk = 1 - r2(lt, D * 0.55, D * 0.75);
  if (sk > 0.01 && SH.bowl) {
    const top = [S[0] - R * 0.9, S[1] - R * 0.42];
    both((cx, g) => {
      cx.lineCap = 'round'; cx.lineWidth = (g ? 16 : 9) * sk; cx.strokeStyle = g ? 'rgba(170,230,255,0.75)' : '#EAFBFF';
      cx.beginPath(); cx.moveTo(top[0], top[1]); cx.quadraticCurveTo(top[0] - 10, (top[1] + SH.bowl[1]) / 2, SH.bowl[0], SH.bowl[1]); cx.stroke();
    });
  }
  const k = ramp(t, c.neutron - 0.05, c.neutron + 0.3, E.outBack);
  return { glow: 1.0, flash: 0.55 * bumpAt(lt, 0, 9) + 0.2 * st.flare, push: { k: 1 + 0.05 * lt / D, cx: 600, cy: 1200 },
    overlay: () => ncPillLabel('NEUTRON STAR', 540, 520, k, '#7FE9FF', 62) };
};
SC.sun = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 540, y: 960, zoom: 1, rot: 0 };
  spaceBg(t, { dx: -40 - 20 * lt });
  screenSpace();
  const wob = r2(t, c.sun_end, shot.end, E.inQuad);
  const R = 700 * (1 - 0.06 * wob) * (1 + 0.012 * Math.sin(t * 9) * wob);
  nsSun(560, 780, R, t, { k: 0.05 * wob });
  // him, tiny, floating in front of it with his glowing spoon
  applyCam(cam);
  suitHero(cam, t, { x: 230, y: 1250, s: 0.5, pose: JP_POSE.float, face: JF.up, armR: { e: [80, -300], w: [150, -250] }, spoonA: -0.5, heap: 1, rot: -0.08 + 0.03 * Math.sin(t) });
  screenSpace();
  const k = ramp(t, c.sun - 0.05, c.sun + 0.3, E.outBack);
  return { glow: 0.8, push: { k: 1 + 0.05 * lt / D, cx: 560, cy: 800 }, overlay: () => ncPillLabel('≈ 1.4 × THE SUN', 540, 520, k, '#FF9A3C', 56) };
};
SC.city = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const ck = r2(t, shot.start, c.size + 0.1, E.inOutCubic);         // the cave-in: radius 700 -> 220
  const R = lerp(665, 220, ck) * (1 + 0.04 * Math.sin(t * 30) * (1 - ck));
  const tilt = r2(t, shot.start + 0.15, c.city, E.inOutSine);        // the city comes up into view as the camera tilts down
  const by = lerp(2350, 1600, tilt), cy = lerp(780, 880, tilt);
  // the night sky over the city
  spaceBg(t, { dx: -60, dy: lerp(0, -120, tilt) });
  screenSpace();
  const g = ctx.createLinearGradient(0, by - 900, 0, by); g.addColorStop(0, 'rgba(20,30,80,0)'); g.addColorStop(1, 'rgba(40,60,130,0.8)');
  ctx.fillStyle = g; ctx.fillRect(0, by - 900, W, 900);
  if (ck < 0.82) nsSun(540, cy, R, t, { k: ck, prom: 1 - ck });
  const sk = r2(ck, 0.7, 0.95);
  if (sk > 0) { ctx.save(); ctx.globalAlpha = sk; nsStar(540, cy, R, t, { spin: 1.7, tilt: 0.55, beams: sk, field: sk * 0.6 }); ctx.restore(); }
  // the city: exactly as wide as the ball
  nsCity(540, by, 2 * 220 * 1.0, t, { lit: 0 });
  // him on a rooftop in front, looking up
  applyCam({ x: 540, y: 960, zoom: 1, rot: 0 });
  ctx.fillStyle = '#070912'; ctx.fillRect(40, by - 70, 330, 600);
  ctx.fillStyle = '#10142A'; ctx.fillRect(40, by - 84, 330, 16);
  ctx.fillStyle = '#0B0E1E'; ctx.fillRect(300, by - 190, 60, 110); ctx.beginPath(); ctx.moveTo(296, by - 190); ctx.lineTo(330, by - 222); ctx.lineTo(364, by - 190); ctx.fill();
  line(ctx, 306, by - 80, 306, by - 120, 5, '#0B0E1E'); line(ctx, 354, by - 80, 354, by - 120, 5, '#0B0E1E');
  jpHero({ x: 540, y: 960, zoom: 1, rot: 0 }, t, { x: 210, y: by - 70, s: 0.42, pose: POSES.stand, face: JF.up, headRot: -0.15 });
  screenSpace();
  // dashed guides from the ball's edges down to the city's edges, and the width (after the light)
  const gk = ramp(t, c.city - 0.1, c.city + 0.35);
  const fl = ck > 0.6 && ck < 1 ? 0.4 * Math.sin(Math.PI * clamp((ck - 0.6) / 0.4)) : 0;
  return { glow: 1.0, flash: fl, push: { k: 1 + 0.03 * lt / D, cx: 540, cy: 900 }, overlay: () => {
    if (gk <= 0.01) return;
    ctx.save(); ctx.setLineDash([14, 12]); ctx.lineWidth = 3; ctx.strokeStyle = `rgba(255,212,71,${0.85 * gk})`;
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(540 + s * 220, cy); ctx.lineTo(540 + s * 220, lerp(cy, by - 20, gk)); ctx.stroke(); }
    ctx.restore();
    nsSpan(320, 760, cy + 300, gk, '≈ 20 km', '#FFD447');
  } };
};
// ---------------------------------------------------------------- an atom: an empty stadium with a pea in the middle
const SCAM = { x: 540, y: 960, zoom: 1, rot: 0 };                   // screen = world for the hero in these shots
function nightSky(t) {
  screenSpace();
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#04061A'); g.addColorStop(0.5, '#0B1238'); g.addColorStop(1, '#141C48');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 0.6; ctx.drawImage(NS_STARS, -100, -100); ctx.globalAlpha = 1;
}
// the hero, tiny, by the pea: o = {s, look (face), lean, squash 0..1}
function sdHero(x, y, s, t, o = {}) {
  let pose = JSON.parse(JSON.stringify(POSES.stand));
  pose.lean = o.lean || 0; pose.hipY = -222 + (o.crouch || 0) * 60;
  pose = ikPlant(pose, 'L', [-44, -16], -1); pose = ikPlant(pose, 'R', [40, -16], -1);
  if (o.arms) { pose.armL = { a: 0.9, b: 0.6 }; pose.armR = { a: 0.9, b: 0.6 }; }
  pose.handL = 'open'; pose.handR = 'open';
  charLayer(SCAM, { x, y, s, pose, face: o.face || HF.curious, headRot: o.headRot || 0 }, t, { pal: PAL });
}
SC.atoms = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const k = r2(lt, 0, D, E.inOutSine);
  const V = { x: 540, y: lerp(1020, 1160, k), s: lerp(0.92, 1.75, k) };
  nightSky(t);
  sdDraw(V, t, { q: 0 });
  screenSpace();
  const P = sdPt(V, SD.cx, SD.cy);
  // the tumbleweed rolls across the empty pitch
  const tk = r2(t, c.mostly - 0.3, shot.end + 0.1, (x) => x);
  const tw = sdPt(V, lerp(240, 860, tk), SD.cy + 70 + 10 * Math.abs(Math.sin(tk * 18)));
  sdTumble(tw[0], tw[1] - 16 * V.s * Math.abs(Math.sin(tk * 9)), 16 * V.s, tk * 30);
  sdPea(P[0], P[1] - 5 * V.s, 5.5 * V.s, t);
  sdHero(P[0] + 30 * V.s, P[1] + 2 * V.s, 0.12 * V.s, t, { lean: -0.35, crouch: 0.4, face: HF.curious, headRot: -0.2 });
  return { glow: 0.9, push: { k: 1 + 0.02 * lt / D, cx: 540, cy: 1100 }, overlay: () => {
    const a = ramp(t, c.atoms - 0.05, c.atoms + 0.3, E.outBack);
    ncPillLabel('AN ATOM', 540, 520, a, '#C8A8FF', 60);
    const b = ramp(t, c.mostly, c.mostly + 0.3, E.outBack);
    if (b > 0.01) { thinLeader([P[0] + 150, P[1] - 210], [P[0] + 6, P[1] - 12], clamp(b), '#FFD447'); ncPillLabel('THE MIDDLE', P[0] + 170, P[1] - 250, b, '#FFD447', 36); }
    const e = ramp(t, c.empty1, c.empty1 + 0.3, E.outBack);
    if (e > 0.01) ncPillLabel('EMPTY', 300, 760, e, '#C8A8FF', 40);
  } };
};
SC.gone = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  // the squeeze: a lurch on "crush", the fold on "squeezes"
  const q = 0.1 * r2(t, c.crush2 + 0.25, c.crush2 + 0.5, E.outBack) + 0.9 * r2(t, c.squeezes - 0.1, c.empty2 + 0.3, E.inOutSine);
  const pull = r2(t, c.empty2 + 0.36, c.out_end + 0.2, E.inOutCubic);
  const V = { x: 540, y: 1175, s: lerp(1.75, 3.2, r2(t, shot.start, c.squeezes, E.inOutSine)) };
  nightSky(t);
  screenSpace();
  const P = sdPt(V, SD.cx, SD.cy);
  if (pull < 0.35) {
    const sh = shake(t, 10 * r2(t, c.squeezes, c.empty2) * (1 - r2(t, c.empty2, c.empty2 + 0.3)), 30, 4);
    ctx.save(); ctx.translate(sh[0], sh[1]);
    sdDraw(V, t, { q });
    ctx.restore();
    screenSpace();
    const hs = 0.12 * V.s * (1 - 0.6 * q);
    const sq = r2(q, 0.75, 0.95);
    ctx.save(); ctx.translate(P[0], P[1]); ctx.scale(1 + 0.6 * sq, 1 - 0.85 * sq); ctx.translate(-P[0], -P[1]);
    sdHero(P[0] + 30 * V.s * (1 - q), P[1] + 2 * V.s, hs, t, { face: q > 0.08 ? HF.uhoh : HF.curious, headRot: 0.25 * Math.sin(t * 8) * r2(q, 0.06, 0.3), arms: q > 0.08 });
    ctx.restore();
    sdPea(P[0], P[1] - 5 * V.s, 5.5 * V.s, t);
  }
  // pulling back: the whole crushed stadium is one pea among millions, packed solid: the stuff in the spoon
  if (pull > 0.2) {
    const a = r2(pull, 0.2, 0.4);
    const r = lerp(16, 7, E.inOutCubic(pull)), R = lerp(30, 330, E.inOutCubic(pull));
    const cy = lerp(P[1] - 5 * V.s, 960, pull);
    sdPacked(540, cy, R, r, t, a);
  }
  return { glow: 0.9, flash: 0.18 * bumpAt(t, c.empty2 + 0.12, 10) };
};
function initScenes2() {
  initCamp();
  initSpace();
}

// ---------------------------------------------------------------- the crash (in the pause after MOUNTAIN)
const tableTopY = (x, sag, hx) => NC.tableY + sag * Math.max(0, 1 - Math.abs(x - hx) / 330);
SC.crash = (lt, t, shot) => {
  const c = cu(), tc = lt;
  const slam = r2(tc, 0, 0.07, E.inCubic), let_go = tc > 0.075;
  const brk = r2(tc, 0.06, 0.2, E.outCubic);
  const sh = shake(t, 22 * bumpAt(tc, 0.07, 6), 26, 3);
  const push = r2(t, c.scoop - 0.2, shot.end, E.inCubic);
  const cam = { x: lerp(560, 640, push) + sh[0], y: lerp(1290, 1612, push) + sh[1], zoom: Math.exp(lerp(Math.log(1.35), Math.log(3.6), push)), rot: 0.01 * sh[0] / 22 };
  // the spoon: yanked down with his hand, then free, through the table and into the ground
  const fall = r2(tc, 0.07, 0.17, E.inQuad);
  const handW = [lerp(566, 612, slam), lerp(1214, 1345, slam)];
  // his arms: yanked down, then flung up in shock
  const up = r2(tc, 0.1, 0.32, E.outBack);
  const armR = let_go ? armMix({ e: [598, 1336], w: [622, 1350] }, { e: [585, 1180], w: [620, 1090] }, up) : { e: [lerp(578, 598, slam), lerp(1332, 1336, slam)], w: handW };
  const armL = armMix({ e: [372, 1336], w: [452, 1338] }, { e: [335, 1185], w: [300, 1095] }, up);
  const face = tc < 0.07 ? HF.light : (tc < 0.55 ? HF.shock : HF.down);
  // the mug flies, the jar hops off to the right, the lantern swings
  const mk = clamp((tc - 0.07) / 0.85);
  const mug = { x: lerp(NC.mugX, 370, mk), y: NC.tableY - 4 - 260 * Math.sin(Math.PI * Math.min(mk, 0.62) / 1.24) + (mk > 0.62 ? (mk - 0.62) / 0.38 * 560 : 0), rot: 9 * mk, empty: tc > 0.1, noSteam: true };
  if (mk >= 1) { mug.y = NC.gy - 4; mug.rot = 1.57; }
  const jk = clamp((tc - 0.08) / 0.5), jx = lerp(NC.jarX, 812, E.outQuad(jk));
  const jy = lerp(NC.tableY - 4, tableTopY(812, 150 * brk, 640) - 4, jk) - 120 * Math.sin(Math.PI * jk);
  const jar = { x: jx, y: jy, rot: jk < 1 ? 1.2 * Math.sin(Math.PI * jk) : Math.atan2(150 * brk, 330) * -0.0 + 0.0 };
  const H = campDraw(t, cam, {
    table: { brk, hx: 640 }, mug, jar, lamp: { sw: 0.45 * Math.sin(tc * 9) * bumpAt(tc, 0.07, 2.2) },
    hero: { face, headDY: 10 * bumpAt(tc, 0.07, 10), headRot: -0.06 * up, armR, armL, spoon: let_go ? null : { a: -1.05 - 0.4 * slam, heap: 1, s: SPS } },
    under: () => {
      // the crater under the table (seen through the V once it breaks)
      if (fall >= 1) ncCrater(t, { handle: -2.0 });
    },
    over: () => {
      if (let_go && fall < 1) {                                   // the spoon falling through
        const g = [lerp(612, 640, fall), lerp(1345, NC.gy - 60, fall)];
        ncSpoon(ctx, g[0], g[1], lerp(-1.45, -2.0, fall) + Math.PI, SPS, t, { heap: 1 });
      }
      ncDust(640, NC.gy - 10, (tc - 0.15) / 1.1, 1.3, 5);
      ncDust(640, NC.tableY + 10, (tc - 0.08) / 0.7, 0.8, 8);
      // tea in the air
      if (tc > 0.07 && tc < 1.0) {
        const rng = mulberry32(12), d = tc - 0.07;
        for (let i = 0; i < 16; i++) {
          const vx = (rng() - 0.6) * 500, vy = -300 - rng() * 500;
          const x = NC.mugX + vx * d, y = NC.tableY - 40 + vy * d + 1100 * d * d;
          if (y < NC.gy) circle(ctx, x, y, 5 + 4 * rng(), '#8A5530');
        }
      }
      applyCam(cam);
      shockLines(626, 1350, 90, (tc - 0.06) / 0.45, 12, '#FFFFFF', 4);
    },
  });
  void H;
  return { glow: 0.85, zblur: 0.12 * r2(t, shot.end - 0.25, shot.end), zcx: 540, zcy: 1100, flash: 0.35 * bumpAt(tc, 0.07, 14) };
};

// ---------------------------------------------------------------- back at camp: the spoon will not budge
const CAMP2 = { jar: { x: 300, y: NC.gy - 2 }, mug: { x: 860, y: NC.gy - 4, rot: 1.57, empty: true, noSteam: true } };
function wreckBehind(cam, t) { ncTableWreck(t); ncLantern(200, NC.gy - 30, t, 0.25, 1); }
SC.payoff = (lt, t, shot) => {
  const c = cu();
  const fallK = r2(t, c.mountain2_end - 0.05, c.mountain2_end + 0.3, E.outBounce);
  const heave = 0.5 + 0.5 * Math.sin((t - shot.start) * 7.5);
  const cam = { x: 590 + 10 * Math.sin(lt * 0.7), y: 1530, zoom: 1.4 + 0.05 * lt / 3.6 };
  const st = { x: 470, s: NC.heroS };
  const grip = [578, 1588];
  let pose = JSON.parse(JSON.stringify(POSES.stand));
  pose.hipY = -150 + 12 * heave; pose.lean = 0.42 - 0.18 * heave;
  pose = ikPlant(pose, 'L', [-72, -16], -1); pose = ikPlant(pose, 'R', [66, -16], -1);
  if (fallK > 0) {                                                  // he lets go and sits down hard
    const sit = JSON.parse(JSON.stringify(POSES.sit)); sit.lean = -0.12;
    pose = lerpPose(pose, sit, fallK);
  }
  campBack(cam, t, {});
  ncTent(cam, t);
  applyCam(cam);
  wreckBehind(cam, t);
  ncJar(CAMP2.jar.x, CAMP2.jar.y, t, { lid: 1 });
  ncMug(CAMP2.mug.x, CAMP2.mug.y, t, CAMP2.mug);
  // where the handle's top will be (the crater is drawn in front of him, after)
  const HA = -2.15, HL = 104 * SPS_W;
  const hd = [NC_HOLE.x - 10 + Math.cos(HA) * HL, NC_HOLE.y - 10 + Math.sin(HA) * HL];
  const loc = (p) => ikLocal({ x: st.x, y: NC.gy, s: st.s }, p[0], p[1]);
  const gp = hd || grip;
  if (fallK < 0.5) { pose = armAt(pose, 'R', loc([gp[0] - 10, gp[1] - 80]), loc([gp[0] + 4, gp[1] - 6])); pose = armAt(pose, 'L', loc([gp[0] - 56, gp[1] - 60]), loc([gp[0] - 8, gp[1] + 4])); }
  else { pose = armAt(pose, 'R', loc([600, 1580]), loc([640, 1540])); pose = armAt(pose, 'L', loc([440, 1580]), loc([400, 1560])); }
  pose.handR = 'fist'; pose.handL = 'fist';
  const face = fallK > 0.3 ? HF.pant : HF.strain;
  charLayer(cam, { x: st.x, y: NC.gy, s: st.s, pose, face, headRot: 0.05 * heave }, t, { pal: PAL });
  applyCam(cam);
  ncCrater(t, { handle: HA });
  if (fallK < 0.5) {                                                // his two fists round the top of the handle
    for (const [dx, dy] of [[-6, 4], [10, -14]]) { circle(ctx, gp[0] + dx, gp[1] + dy, 21, PAL.skinSh); circle(ctx, gp[0] + dx - 2, gp[1] + dy - 2, 18, PAL.skin); }
  }
  // sweat drops and effort lines while he heaves
  if (fallK < 0.3) {
    const hx = st.x + Math.sin(pose.lean) * 470 * st.s, hy = NC.gy + (pose.hipY - 248 * Math.cos(pose.lean)) * st.s;
    for (let i = 0; i < 3; i++) { const u = ((lt * 1.4 + i / 3) % 1); sweatDrop(ctx, hx - 70 + 140 * (i % 2) + 10 * u, hy - 60 + 70 * u, 0.9, 1 - u); }
  }
  ncDust(st.x, NC.gy - 4, (t - c.mountain2_end) / 0.8, 1.0, 21);
  ncFireflies(cam, t, 0.7);
  // the comparison again, under the peak
  const k = ramp(t, c.mountain2 - 0.1, c.mountain2 + 0.25, E.outBack);
  return { glow: 0.85, push: { k: 1 + 0.01 * heave, cx: 540, cy: 1200 }, overlay: () => { if (k > 0.01) ncPillLabel('1 TEASPOON ≈ 1 MOUNTAIN', 540, 1535, k, '#FFD447', 46); } };
};

// ---------------------------------------------------------------- the stuff swells: it only holds together on its star
SC.weird = (lt, t, shot) => {
  const c = cu();
  const swell = r2(t, c.earth - 0.2, c.spoon_w_end, E.inOutSine) * 1.2 + r2(t, c.would, c.explode_end, E.inQuad) * 1.6;
  const crack = r2(t, c.stay, c.explode, E.inQuad);
  const back = r2(t, c.stay - 0.1, c.spoon_w_end, E.inOutSine), hide = r2(t, c.would - 0.15, c.would + 0.35, E.outBack);
  const sh = shake(t, 3 + 9 * r2(t, c.explode, c.explode_end), 30, 7);
  const cam = { x: lerp(520, 480, hide) + sh[0], y: lerp(1508, 1500, hide) + sh[1], zoom: lerp(1.9, 1.62, r2(t, c.would, c.explode_end, E.inOutSine)) };
  campBack(cam, t, {});
  ncTent(cam, t);
  applyCam(cam);
  wreckBehind(cam, t);
  ncMug(CAMP2.mug.x, CAMP2.mug.y, t, CAMP2.mug);
  // the light of the swelling stuff floods the meadow (glow layer)
  softDot(gctx, NC_HOLE.x, NC_HOLE.y - 30, 220 + 200 * swell, '#9FE0FF', 0.08 + 0.1 * swell);
  ncCrater(t, { handle: -2.15, bulge: swell, crack, wobble: 0.4 + swell });
  // him: crouched, peering in; backing off; then ducking behind the (tiny) jar
  const x = lerp(lerp(540, 470, back), 330, hide);
  let pose = JSON.parse(JSON.stringify(POSES.stand));
  pose.hipY = lerp(-120, -100, hide); pose.lean = lerp(0.45, 0.05, back) - 0.1 * hide;
  pose = ikPlant(pose, 'L', [-70, -16], -1); pose = ikPlant(pose, 'R', [64, -16], -1);
  const st = { x, y: NC.gy, s: NC.heroS };
  const loc = (p) => ikLocal(st, p[0], p[1]);
  const kneeL = [x - 60, 1560], kneeR = [x + 60, 1560];
  const headY = NC.gy + (pose.hipY - 248) * NC.heroS + 40 * hide;
  if (hide > 0.3) {
    pose = armAt(pose, 'L', loc([x - 125, headY + 70]), loc([x - 64, headY + 4]));
    pose = armAt(pose, 'R', loc([x + 125, headY + 70]), loc([x + 64, headY + 4]));
  } else {
    pose = armAt(pose, 'L', loc([x - 70, 1500]), loc(kneeL));
    pose = armAt(pose, 'R', loc([x + 80, 1495]), loc(kneeR));
  }
  pose.handL = 'open'; pose.handR = 'open';
  const shut = Object.assign({}, FACES.nervous, { blink: 1, browY: 1.2, browTilt: 1.1, mouth: 'grimace', mouthOpen: 1 });
  const face = hide > 0.3 ? shut : (back > 0.3 ? HF.uhoh : HF.curious);
  charLayer(cam, { x, y: NC.gy, s: NC.heroS, pose, face, headRot: 0.08 * Math.sin(t * 2) * (1 - back), headDY: 40 * hide }, t, { pal: PAL });
  applyCam(cam);
  ncJar(lerp(400, 372, hide), NC.gy - 2, t, { lid: 1 });
  ncFireflies(cam, t, 1 - swell / 2.8);
  return { glow: 0.8 + 0.1 * swell / 2.8, push: { k: 1 + 0.02 * swell, cx: 560, cy: 1300 } };
};

// ---------------------------------------------------------------- BOOM, then him, sooty and deadpan
SC.blast = (lt, t, shot) => {
  const c = cu(), b = lt;
  if (b < 0.42) {
    const sh = shake(t, 34 * (1 - b / 0.42), 28, 9);
    const cam = { x: 600 + sh[0], y: 1180 + sh[1], zoom: 0.92 };
    campBack(cam, t, { blown: b > 0.08 });
    applyCam(cam);
    const R = 1500 * E.outCubic(clamp(b / 0.32));
    both((cx, g) => {
      const grd = cx.createRadialGradient(NC_HOLE.x, NC_HOLE.y, 0, NC_HOLE.x, NC_HOLE.y, Math.max(1, R));
      grd.addColorStop(0, g ? 'rgba(220,245,255,0.9)' : 'rgba(240,252,255,1)'); grd.addColorStop(0.6, g ? 'rgba(140,210,255,0.6)' : 'rgba(170,225,255,0.85)');
      grd.addColorStop(1, 'rgba(120,190,255,0)');
      cx.fillStyle = grd; cx.beginPath(); cx.arc(NC_HOLE.x, NC_HOLE.y, Math.max(1, R), Math.PI, 0); cx.fill();
    });
    // the ring of the shockwave on the ground and debris off the peak
    ctx.lineWidth = 18 * (1 - b / 0.42); ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath(); ctx.ellipse(NC_HOLE.x, NC_HOLE.y, R * 1.2, R * 0.18, 0, 0, 7); ctx.stroke();
    if (b > 0.08) {
      applyCam(parallax(cam, 0.25));
      const rng = mulberry32(31), d = b - 0.08;
      for (let i = 0; i < 26; i++) {
        const vx = (rng() - 0.5) * 900, vy = -400 - rng() * 800;
        const x = NC.peakX + vx * d, y = NC.peakY + 40 + vy * d + 900 * d * d;
        ctx.fillStyle = rng() > 0.5 ? '#FFE6D0' : '#4A4870'; ctx.beginPath(); ctx.arc(x, y, 6 + 10 * rng(), 0, 7); ctx.fill();
      }
      applyCam(cam);
    }
    return { glow: 1.0, flash: 1 - r2(b, 0, 0.3, E.outQuad) * 0.85 };
  }
  // after: smoke clearing, him standing in the meadow, black with soot, hair on end, a mug handle in his hand
  const a2 = b - 0.42;
  const cam = { x: 470, y: 1250, zoom: 2.3 };
  campBack(cam, t, { blown: true });
  applyCam(cam);
  const pose = armAt(armAt(JSON.parse(JSON.stringify(POSES.stand)), 'R', ikLocal({ x: 455, y: NC.gy, s: NC.heroS }, 540, 1330), ikLocal({ x: 455, y: NC.gy, s: NC.heroS }, 560, 1250)),
    'L', ikLocal({ x: 455, y: NC.gy, s: NC.heroS }, 372, 1336), ikLocal({ x: 455, y: NC.gy, s: NC.heroS }, 380, 1420));
  pose.handR = 'fist';
  const face = a2 > 0.28 && a2 < 0.4 ? HF.blinkOut : HF.deadpan;
  charLayer(cam, { x: 455, y: NC.gy, s: NC.heroS, pose, face, soot: 1, frizz: 1 }, t, { pal: PAL, post: (lc) => {
    // the mug's handle, all that is left of it
    lc.lineWidth = 7; lc.strokeStyle = '#E8ECF4'; lc.beginPath(); lc.arc(575, 1238, 14, -1.2, 1.2); lc.stroke();
  } });
  applyCam(cam);
  for (let i = 0; i < 4; i++) {                                    // smoke curling off him
    const u = ((a2 * 1.2 + i / 4) % 1);
    ctx.fillStyle = `rgba(60,60,70,${0.35 * (1 - u)})`; ctx.beginPath(); ctx.arc(420 + 40 * i + 10 * Math.sin(u * 6), 1060 - 160 * u, 18 + 20 * u, 0, 7); ctx.fill();
  }
  return { glow: 0.8, flash: 0.25 * bumpAt(a2, 0, 10) };
};

// ---------------------------------------------------------------- the button: the soot shaken off, another spoonful: frame 0
SC.button = (lt, t, shot) => {
  const tt = t - shot.end;                                          // -3.5 .. 0: the hook's pre-roll; tt = 0 is frame 0
  const cam = hookCam(tt), A = hookA(tt);
  const shk = r2(tt, -3.45, -2.85, E.inOutSine);                    // he shakes the soot off on "Anyway..."
  const soot = 1 - shk, wob = Math.sin(shk * Math.PI * 6) * (1 - shk);
  campDraw(t, cam, {
    strand: A.strand,
    hero: { face: A.face, headRot: A.headRot + 0.25 * wob, headDX: A.headDX + 14 * wob, lean: A.lean, armR: { e: A.e, w: A.w },
      armL: { e: [372, 1336], w: [452, 1338] }, spoon: { a: A.a, heap: A.heap, s: SPS }, soot, frizz: soot },
    over: () => { ncSootPuff(455, 1150, (tt + 3.4) / 0.7, 9); },
  });
  return { glow: 0.85 };
};

// ---------------------------------------------------------------- the cover: him wide-eyed with the glowing spoon; 1 TEASPOON = 1 MOUNTAIN
SC.cover = (lt, t) => {
  const cam = { x: 548, y: 1150, zoom: 2.35, rot: 0 };
  campDraw(1.2, cam, {
    hero: { face: Object.assign({}, HF.wonder, { lookX: 1, lookY: -0.7, mouthOpen: 0.7, browY: 1.3, eyeOpen: 1.25 }), headRot: 0.08,
      armR: { e: [578, 1300], w: [566, 1196] }, armL: { e: [372, 1336], w: [452, 1338] }, spoon: { a: -1.1, heap: 1.25, s: SPS * 1.15 } },
  });
  return { glow: 0.9, overlay: () => {
    screenSpace();
    bigWord('1 TEASPOON', 540, 1285, 124, '#FFFFFF', 1, -0.03);
    bigWord('= 1 MOUNTAIN', 540, 1435, 140, '#FFD447', 1, -0.03);
  } };
};
