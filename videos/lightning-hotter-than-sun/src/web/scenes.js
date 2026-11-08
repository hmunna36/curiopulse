// Lightning Is 5x HOTTER Than the Sun's Surface: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds
// inside the shot, t = seconds in the video) and returns post options for main.js. Every beat comes from a cue.
'use strict';

const cu = () => TLd.cues;

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the bolt is the key: cold white-blue from the upper right (site A), a blue rim on the bolt's side, the tent's lamp far left
const LS_LA = Object.assign({}, LIGHTS.night, { key: [0.55, -0.62, 0.58], keyTint: [0.98, 1.03, 1.14], rimFrom: [0.92, -0.32],
  rim: [0.72, 0.86, 1.0], rimAmt: 1.65, pool: 0.5, poolTint: [0.36, 0.40, 0.78] });
const LS_LT = Object.assign({}, LIGHTS.night, { key: [-0.35, -0.7, 0.6], rimFrom: [0.9, -0.3], rim: [1.0, 0.72, 0.42], rimAmt: 1.2, pool: 0.35 });
setLights({ hook: LS_LA, reveal: LS_LA, thermo: LS_LT, thumb: LS_LA, boom: flipLight(LS_LA), thunder: flipLight(LS_LA),
  dune: flipLight(LIGHTS.sunset), button: LS_LA, cover: LS_LA });

// ---------------------------------------------------------------- shared
const LS_HOOK_CAM = { x: 500, y: 1000, zoom: 2.4 };      // frame 0 and the last frame (the loop)
const LS_MM_Y = 862;                                      // the marshmallow's height beside the channel (site A)
function lsMallowAt(bolt, side) { return [lsChannelX(bolt, LS_MM_Y) + side * 44, LS_MM_Y]; }
const LS_HAND_A = [585, 1040];                            // his right wrist while he roasts (site A)

// everything on the summit behind the hero. o: {flash, bgdy, surge, glowSleeve, blast, noBolt, boltWidth}
function lsSummitBack(cam, site, bolt, t, o = {}) {
  const f = o.flash || 0;
  lsSky(cam, t, { flash: f, bgdy: o.bgdy });
  lsRidges(cam, t, { flash: f, bgdy: o.bgdy, ridgeY: o.ridgeY || 1380 });
  drawRain(t, 0.55, 0);
  applyCam(cam);
  lsTent(site, t, f);
  lsGround(cam, site, t, { flash: f });
  applyCam(cam);
  lsFlags(site, t, f, o.blast || 0);
  lsFire(site, t, f);
  lsBag(ctx, site.bagX, lsCrestY(site, site.bagX) + 8, 1, t);
  if (!o.noBolt) {
    if (o.glowSleeve > 0) lsAirGlow(bolt, o.glowSleeve, t);
    drawBolt(bolt, 1, lsBoltI(t, o.surge || 0), t, { width: o.boltWidth || 1.15 });
  }
  lsRod(site, t, f);
}
// the air round the channel heating up: 0..1 orange -> 1..2 white-hot
function lsAirGlow(bolt, k, t) {
  const pts = bolt.main;
  const w = 40 + 70 * Math.min(1, k) + 60 * Math.max(0, k - 1);
  const col = k < 1 ? mixH('#FF5A1E', '#FF9A3C', k) : mixH('#FF9A3C', '#FFF0C8', k - 1);
  poly(ctx, pts, w, rgba(col, 0.28 * Math.min(1, k)));
  poly(gctx, pts, w * 1.3, rgba(col, 0.55 * Math.min(1, k)));
  for (let i = 0; i < 10; i++) {               // heat shimmer: short wavy strokes beside the channel
    const p = pts[Math.floor((i / 10) * (pts.length - 1))];
    const dx = (i % 2 ? 1 : -1) * (w * 0.6 + 8 * Math.sin(t * 12 + i));
    line(ctx, p[0] + dx, p[1] - 14, p[0] + dx + 6 * Math.sin(t * 20 + i), p[1] + 14, 3, rgba('#FFC27A', 0.35 * Math.min(1, k)));
  }
}

// the hero on site A or B, roasting. o: {face, toast, puff, fire, frizz, soot, blink, lean, dx, stickOff (the stick flew), crumble}
function lsHeroRoast(cam, site, bolt, t, o = {}) {
  const side = site.mirror ? 1 : -1;           // the marshmallow sits on the hero's side of the channel
  const st = { x: site.heroX + (o.dx || 0), y: site.crest, s: 1, frizz: o.frizz || 0, soot: o.soot || 0, blink: o.blink || 0 };
  const mm = o.mm || lsMallowAt(bolt, side);
  const hand = site.mirror ? [site.heroX - (LS_HAND_A[0] - LS_SITE_A.heroX) + (o.dx || 0), LS_HAND_A[1]] : [LS_HAND_A[0] + (o.dx || 0), LS_HAND_A[1]];
  let pose = JSON.parse(JSON.stringify(POSES.stand));
  pose.lean = o.lean || 0;
  if (!o.stickOff) pose = ikReach(pose, site.mirror ? 'L' : 'R', ikLocal(st, hand[0], hand[1]), -1);
  else pose = lerpPose(pose, POSES.flinch, 0.8);
  if (site.mirror) pose.armR = o.armFree || { a: 0.3, b: 0.4 }; else pose.armL = o.armFree || { a: 0.3, b: 0.4 };
  if (o.pose) pose = o.pose(pose, st);
  st.pose = pose;
  st.face = o.face || FACES.grin;
  applyCam(cam);
  const r = charLayer(cam, st, t, {});
  applyCam(cam);
  if (!o.stickOff) {
    const k = site.mirror ? 'L' : 'R';
    const wr = toWorld(st, r['wr' + k]), d = r['armDir' + k];
    const hc = [wr[0] + d[0] * 14, wr[1] + d[1] * 14];
    lsStick(ctx, hc, mm, o.burnt || 0);
    // his fingers wrap the stick: a small skin patch over it
    circle(ctx, hc[0] + 4 * side, hc[1] + 2, 12, PAL.skin);
    lsMallow(ctx, mm[0], mm[1], 1, Math.atan2(mm[1] - hc[1], mm[0] - hc[0]) + Math.PI / 2,
      { toast: o.toast || 0, puff: o.puff || 1, fire: o.fire || 0, crumble: o.crumble || 0 }, t);
  }
  return { st, r, mm };
}

// ================================================================ HOOK: roasting a marshmallow IN a lightning bolt
SC.hook = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = Object.assign({}, LS_HOOK_CAM, { zoom: LS_HOOK_CAM.zoom + 0.14 * E.inOutSine(clamp(lt / D)) });
  const f = lsSkyFlash(t, [c.hotter]);
  lsSummitBack(cam, LS_SITE_A, LS_BOLT_A, t, { flash: f, surge: 0.35 * Math.exp(-Math.max(0, t - c.hotter) * 6) * (t > c.hotter ? 1 : 0) });
  const toast = 0.08 + 0.42 * ramp(t, 0.3, c.surface, E.inOutSine);
  const puff = 1 + 0.22 * ramp(t, c.mm, c.mm + 0.6, E.outBack);
  const fire = ramp(t, c.hotter - 0.05, c.hotter + 0.25, E.outBack) * (0.7 + 0.3 * ramp(t, c.surface, c.surface + 0.4));
  // his face: delighted, a startled flick when it catches, then thrilled
  const startle = popK(t, c.hotter, c.hotter + 0.45, 0.06, 0.2);
  let face = lerpFace(FACES.grin, FACES.startled, startle);
  face = Object.assign({}, face, { lookX: 0.85, lookY: -0.75 });
  lsHeroRoast(cam, LS_SITE_A, LS_BOLT_A, t, { face, toast, puff, fire, blink: popK(t, 2.6, 2.75, 0.04, 0.04) * 0.95,
    pose: (p) => { p.lean = -0.02 * startle; return p; } });
  return { glow: 0.95 };
};

// ================================================================ REVEAL: the scale of it (wide, low angle)
SC.reveal = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 590, y: 1000 - 30 * lt, zoom: 0.56 + 0.03 * clamp(lt / D) };
  const f = clamp(lsSkyFlash(t, []) + 0.85 * Math.exp(-Math.max(0, t - c.lightning) * 2.2), 0, 1.15);
  lsSummitBack(cam, LS_SITE_A, LS_BOLT_A, t, { flash: f, bgdy: -260, surge: 0.6 * Math.exp(-(t - c.lightning) * 3), ridgeY: 1520, boltWidth: 2.6 });
  lsHeroRoast(cam, LS_SITE_A, LS_BOLT_A, t, { face: Object.assign({}, FACES.grin, { lookX: 0.85, lookY: -0.75 }), toast: 0.55, puff: 1.22, fire: 1 });
  return { glow: 1.0 };
};

// ================================================================ THERMO: the Sun's surface vs lightning, 5x
const LS_TH = { base: 1650, sx: 300, bx: 650, lenS: 330, lenB: 330 * 27700 / 5500, sunR: 74 };
SC.thermo = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const k0 = c.five - shot.start, k1 = c.hotter2_end - shot.start, k2 = c.sun2 - shot.start;
  const cam = camKeys(lt, [[0, 540, 1230, 0.95], [k0 - 0.05, 540, 1200, 0.95], [k1 + 0.05, 600, 300, 0.9], [k2 - 0.1, 600, 300, 0.9],
    [k2 + 0.55, 300, 1050, 1.75], [D, 300, 1060, 1.82]]);
  const f = lsSkyFlash(t, [c.hotter2]);
  lsSky(cam, t, { flash: f * 0.8, bgdy: -120 });
  lsRidges(cam, t, { flash: f, ridgeY: 1500 });
  // the bolt, far off on the right, still standing between the cloud and the summit
  const far = parallax(cam, 0.55); camTransform(ctx, far, 1); camTransform(gctx, far, 0.5);
  ctx.save(); ctx.translate(1180, 380); ctx.scale(0.55, 0.55); gctx.save(); gctx.translate(1180, 380); gctx.scale(0.55, 0.55);
  drawBolt(LS_BOLT_A, 1, lsBoltI(t) * 0.8, t, { width: 1.4 }); ctx.restore(); gctx.restore();
  drawRain(t, 0.5, 0);
  applyCam(cam);
  // the ledge they stand on
  const gg = ctx.createLinearGradient(0, LS_TH.base - 40, 0, LS_TH.base + 600);
  gg.addColorStop(0, '#26305F'); gg.addColorStop(1, '#080B20');
  ctx.fillStyle = gg; ctx.beginPath(); ctx.moveTo(-800, 3200);
  for (let x = -800; x <= 1900; x += 20) ctx.lineTo(x, LS_TH.base + 18 * vnoise(x / 80, 5) + 0.00012 * (x - 540) * (x - 540));
  ctx.lineTo(1900, 3200); ctx.closePath(); ctx.fill();
  // the columns
  const sunL = LS_TH.lenS * E.outCubic(ramp(t, c.upto, c.upto + 0.55, (x) => x));
  const bu = ramp(t, c.five - 0.08, c.hotter2_end - 0.05, E.inOutCubic);
  const boltL = LS_TH.lenB * bu + (t > c.hotter2_end ? 6 * Math.sin(t * 40) : 0);
  lsThermo(LS_TH.sx, LS_TH.base, LS_TH.lenS + 50, sunL, ['#FF5A1F', '#FFC247'], 'rgba(255,130,40,0.85)', t);
  const bly = lsThermo(LS_TH.bx, LS_TH.base, LS_TH.lenB + 60, boltL, ['#3F8CFF', '#F0FBFF'], 'rgba(130,210,255,1)', t, { step: 110 });
  // the bolt column's top bursts out of the glass in sparks
  if (t > c.hotter2 - 0.05) {
    sparks(71, LS_TH.bx, bly, c.hotter2 - 0.05, t, 46, { speed: 1000, life: 0.6, dir: -Math.PI / 2, spread: 1.1 });
    softDot(gctx, LS_TH.bx, bly, 190, '#BFEFFF', 0.85 * Math.exp(-(t - c.hotter2) * 3));
  }
  // the hiker in the foreground between the two bulbs, head and shoulders: he looks up as lightning's column climbs
  {
    const st = { x: 470, y: 2409, s: 1.3, blink: popK(t, c.upto + 0.3, c.upto + 0.42, 0.04, 0.04) * 0.95 };
    st.pose = JSON.parse(JSON.stringify(POSES.stand));
    const awe = ramp(t, c.five - 0.1, c.five + 0.25, E.inOutSine);
    st.face = Object.assign({}, lerpFace(FACES.calm, FACES.shock, awe), { lookX: lerp(-0.3, 0.55, awe), lookY: -1 });
    st.headRot = lerp(-0.04, 0.08, awe);
    charLayer(cam, st, t, {});
    applyCam(cam);
  }
  // the Sun, perched on its own short thermometer
  const sunTop = LS_TH.base - 84 - 78 * 0.6 - LS_TH.lenS - 50 - 40;
  const sunY = sunTop - LS_TH.sunR + 6;
  const shock = t > c.five + 0.2 && t < c.sun2 + 0.15;
  const face = t >= c.luke - 0.04 ? 'cold' : t >= c.sun2 + 0.15 ? 'pout' : shock ? 'shock' : 'proud';
  const scarf = ramp(t, c.luke - 0.02, c.luke + 0.22, (x) => x);
  const look = shock ? [0.9, -1] : [0.4, 0.2];
  lsSun(ctx, LS_TH.sx, sunY - (face === 'shock' ? 10 * Math.sin(Math.min(1, (t - c.five) * 3) * Math.PI) : 0), LS_TH.sunR, t,
    { face, scarf, shiver: ramp(t, c.luke + 0.1, c.luke + 0.3), look });
  lsBrr(LS_TH.sx + 60, sunY + 10, 1, t, c.luke, ramp(t, c.luke + 0.15, c.luke + 0.3));
  // the scoreboard (screen space): the Sun's number on the left, lightning's on the right, the 5x stamp between them
  const kS = popK(t, c.upto + 0.08, c.sun2 + 0.05, 0.12, 0.12), kB = popK(t, c.five - 0.02, c.sun2 + 0.05, 0.12, 0.12);
  screenSpace();
  ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.lineJoin = 'round';
  const board = (x, k, tag, col, num) => {
    if (k <= 0.01) return;
    lsTag(tag, x, 540, col, k, 28);
    ctx.save(); ctx.translate(x, 625); ctx.scale(E.outBack(clamp(k), 2), E.outBack(clamp(k), 2));
    ctx.font = '400 84px Anton'; ctx.lineWidth = 12; ctx.strokeStyle = '#0B0B1A'; ctx.fillStyle = col;
    paint(() => { ctx.strokeText(num, 0, 0); ctx.fillText(num, 0, 0); });
    ctx.restore();
  };
  board(275, kS, "SUN'S SURFACE", '#FFB070', `${fmt(Math.round(5500 * sunL / LS_TH.lenS / 100) * 100)}°C`);
  board(805, kB, 'LIGHTNING · UP TO', '#9FE8FF', `${fmt(Math.round(27700 * bu / 100) * 100)}°C`);
  const sunNow = toScreen(cam, LS_TH.sx, sunY);
  const kS2 = ramp(t, c.sun2 + 0.35, c.sun2 + 0.55);
  if (kS2 > 0.01) lsTag('5,500°C', sunNow[0] + 230, sunNow[1] - 40, '#FFB070', kS2, 40, 0.05);
  // the 5x stamp
  const ks = ramp(t, c.hotter2, c.hotter2 + 0.18, (x) => E.outBack(x, 2.2));
  if (ks > 0 && t < c.sun2 + 0.2) {
    const sc = lerp(2.2, 1, ks), tr = t - c.hotter2;
    ring(330, 820, 110 + tr * 900, 110 + tr * 900, 8 * clamp(1 - tr * 3), '#FFD447', clamp(1 - tr * 3));
    circle(gctx, 330, 820, 112 * sc, 'rgba(0,0,0,1)');      // the column's bloom stays off the stamp
    ctx.save(); ctx.translate(330, 820); ctx.rotate(-0.12 * ks); ctx.scale(sc, sc);
    paint(() => {
      circle(ctx, 0, 0, 96, '#FFD447');
      ctx.lineWidth = 8; ctx.strokeStyle = '#0B0B1A'; ctx.beginPath(); ctx.arc(0, 0, 96, 0, 7); ctx.stroke();
      ctx.fillStyle = '#0B0B1A'; ctx.font = '400 116px Anton'; ctx.textAlign = 'center'; ctx.fillText('5×', 4, 8);
    });
    ctx.restore();
    ring(330, 820, 104 * sc, 104 * sc, 10, '#FFD447', 0.5 * clamp(ks));
  }
  const sp = toScreen(cam, LS_TH.sx, sunY);
  return { glow: 0.95, focus: [sp[0], sp[1]] };
};

// ================================================================ THUMB: kilometres long, thumb thin
SC.thumb = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const a1 = c.crams - shot.start, a2 = c.thin - shot.start, a3 = c.thumb - shot.start;
  const site = Object.assign({}, LS_SITE_A, { rodX: 746, rodTip: 1210, heroX: 500, crest: 1500 });
  const cam = camKeys(lt, [[0, 420, -2050, 0.42], [a1, 450, -700, 0.42], [a2, 600, 900, 0.95], [a3 - 0.12, 718, 962, 4.1], [D, 718, 964, 4.4]]);
  const f = lsSkyFlash(t, [c.giant]);
  lsSky(cam, t, { flash: f, bgdy: 0 });
  // the cloud the bolt comes out of (world)
  applyCam(cam);
  for (let i = 0; i < 18; i++) {
    const x = 640 + (hash(i * 3.3) - 0.5) * 2400, y = -3300 + (hash(i * 7.1) - 0.5) * 500;
    softDot(ctx, x, y, 420 + hash(i) * 380, i % 3 ? '#1A2154' : '#2B3478', 0.9);
  }
  softDot(ctx, 640, -3250, 900, '#8FA4FF', 0.25 + 0.3 * f);
  softDot(gctx, 640, -3250, 600, '#AFC4FF', 0.25 + 0.3 * f);
  lsRidges(cam, t, { flash: f, ridgeY: 1450 });
  drawRain(t, 0.45, 0);
  applyCam(cam);
  lsGround(cam, site, t, { flash: f });
  applyCam(cam);
  drawBolt(LS_BOLT_TALL, 1, lsBoltI(t, 0.25), t, { width: lerp(2.2, 1.0, ramp(lt, a2 - 0.3, a3 - 0.2, E.inOutSine)) });
  lsRod(site, t, f);
  // the hero, thumb up beside the channel
  const st = { x: site.heroX, y: site.crest, s: 1, blink: 0 };
  let pose = JSON.parse(JSON.stringify(POSES.stand));
  pose = ikReach(pose, 'R', ikLocal(st, 690, 990), -1);
  pose.armL = { a: 0.3, b: 0.4 };
  st.pose = pose;
  st.face = Object.assign({}, FACES.grin, { lookX: 0.9, lookY: -0.6 });
  const r = charLayer(cam, st, t, {});
  applyCam(cam);
  const wr = toWorld(st, r.wrR);
  lsThumbHand(ctx, wr[0] + 4, wr[1] - 8, 1.05);
  // labels
  lsTag('KILOMETRES LONG', 330, 1040, '#9FE8FF', popK(t, c.giant + 0.05, c.thin - 0.2, 0.12, 0.12), 42, -0.04);
  lsTag('THUMB-THIN', 540, 560, '#FFD447', ramp(t, c.thumb - 0.02, c.thumb + 0.18), 52, -0.05);
  return { glow: 0.95 };
};

// ================================================================ BOOM: the air cooks, then it bursts (from the other side)
SC.boom = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const ex = c.explodes;
  const bl = ramp(t, ex, ex + 0.35, E.outCubic);               // the blast's push
  const cam = { x: 560 + 30 * bl, y: 1170, zoom: 1.24 - 0.06 * bl };
  const f = lsSkyFlash(t, [ex]) * (t < ex ? 1 : 1);
  const sleeve = ramp(t, c.cooks - 0.05, c.fast, E.inOutSine) + ramp(t, c.fast, ex, E.inCubic);
  lsSummitBack(cam, LS_SITE_B, LS_BOLT_B, t, { flash: f, surge: t > ex ? 0.9 * Math.exp(-(t - ex) * 4) : 0, glowSleeve: t < ex + 0.25 ? sleeve * (1 - ramp(t, ex, ex + 0.25)) : 0, blast: bl * (1 - ramp(t, ex + 0.6, ex + 1.6)) });
  // the shock rings, centred on the channel at his height
  applyCam(cam);
  const cx = lsChannelX(LS_BOLT_B, 1060), cy = 1060;
  for (let i = 0; i < 3; i++) {
    const tr = t - ex - i * 0.09;
    if (tr > 0 && tr < 0.9) ring(cx, cy, 60 + tr * 1500, 30 + tr * 900, 16 * (1 - tr / 0.9), i ? '#FFD9A0' : '#FFFFFF', 0.85 * (1 - tr / 0.9));
  }
  // rain thrown outward
  if (t > ex && t < ex + 0.8) {
    const tr = t - ex;
    for (let i = 0; i < 40; i++) {
      const a = hash(i * 1.7) * Math.PI * 2, v = 900 + hash(i * 2.9) * 900;
      const px = cx + Math.cos(a) * v * tr, py = cy + Math.sin(a) * v * tr * 0.7;
      line(ctx, px, py, px - Math.cos(a) * 40, py - Math.sin(a) * 28, 3, rgba('#D8E6FF', 0.7 * (1 - tr / 0.8)));
    }
  }
  // the hero: before, eyes on the glowing air; then blown back, the stick flying off
  const before = t < ex;
  const face = before ? Object.assign({}, lerpFace(FACES.grin, FACES.worried, ramp(t, c.fast - 0.2, c.fast + 0.2)), { lookX: -0.85, lookY: -0.6 })
    : lerpFace(FACES.shock, FACES.dazed, ramp(t, ex + 0.7, c.that - 0.1));
  const sootK = ramp(t, ex, ex + 0.2);
  lsHeroRoast(cam, LS_SITE_B, LS_BOLT_B, t, {
    face, toast: 0.7 + 0.3 * ramp(t, c.cooks, ex), puff: 1.25, fire: before ? 1 : 0, stickOff: !before,
    frizz: sootK, soot: sootK * 0.8, lean: 0.28 * bl * (1 - 0.6 * ramp(t, ex + 0.5, ex + 1.2)), dx: 60 * bl,
    blink: popK(t, ex - 0.02, ex + 0.12, 0.02, 0.05) });
  // the stick and its marshmallow cartwheel away
  if (!before) {
    const tr = t - ex;
    const sx = 620 + 420 * tr, sy = 880 - 900 * tr + 700 * tr * tr;
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(tr * 11);
    lsStick(ctx, [-110, 0], [110, 0], 0.5);
    ctx.restore();
    lsFlame(sx + Math.cos(tr * 11) * 110, sy + Math.sin(tr * 11) * 110, 0.7, t, clamp(1 - tr * 1.5));
    smoke(91, cx, cy - 40, ex, t, { rate: 18, life: 1.4, rise: 160, size: 40, alpha: 0.32, wind: 120, col: '#B8C2E6' });
  }
  // BOOM in the gap (the thunder is heard there)
  const kb = popK(t, c.explodes_end + 0.02, shot.end + 0.2, 0.1, 0.1);
  if (kb > 0) { screenSpace(); bigWord('BOOM!', 540 + 8 * Math.sin(t * 60), 640 + 6 * Math.sin(t * 47), 230, '#FF5A3C', kb, -0.08); }
  return { glow: 1.0, flash: t > ex ? 0.55 * Math.exp(-(t - ex) * 9) : 0 };
};

// ================================================================ THUNDER: his blasted face (close, from above)
SC.thunder = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const site = Object.assign({}, LS_SITE_B, { crest: 1500 });
  const cam = { x: 770, y: 1010 - 20 * lt / D, zoom: 2.15 + 0.08 * lt / D };
  const f = lsSkyFlash(t, [c.boomw]);
  // high angle: the rocky ground rises behind him (a site whose crest sits above his head)
  const back = Object.assign({}, site, { crest: 760, heroX: 700, rodX: 330 });
  lsSky(cam, t, { flash: f, bgdy: 260 });
  lsGround(cam, back, t, { flash: f });
  applyCam(cam);
  for (let i = 0; i < 6; i++) lsRock(ctx, 420 + i * 120, 820 + 40 * Math.sin(i * 2.1), 60 + 20 * Math.sin(i * 1.3), 0.6, 300 + i, 0, f);
  drawRain(t, 0.4, 0);
  applyCam(cam);
  smoke(97, 760, 900, shot.start - 1, t, { rate: 8, life: 1.8, rise: 200, size: 30, alpha: 0.22, wind: 40, col: '#B8C2E6' });
  const st = { x: 790, y: 1500, s: 1, frizz: 1, soot: 0.85, blink: 0, pose: lerpPose(POSES.stand, POSES.flinch, 0.35) };
  const shock = ramp(t, c.thunder - 0.05, c.thunder + 0.1);
  st.face = Object.assign({}, lerpFace(FACES.dazed, FACES.shock, shock), { lookX: 0, lookY: 0 });
  st.headRot = 0.05 * Math.sin(t * 9) * (1 - shock);
  charLayer(cam, st, t, {});
  // ears ringing
  applyCam(cam);
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const ph = ((t * 2.2 + i / 3) % 1);
      ctx.beginPath(); ctx.arc(790 + s * 66, 1030, 14 + ph * 40, s < 0 ? Math.PI * 0.75 : -Math.PI * 0.25, s < 0 ? Math.PI * 1.25 : Math.PI * 0.25);
      ctx.lineWidth = 4; ctx.strokeStyle = rgba('#FFFFFF', 0.7 * (1 - ph)); ctx.stroke();
    }
  }
  return { glow: 0.9 };
};

// ================================================================ DUNE: it hits sand and makes glass
SC.dune = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const hit = c.hits, sx = 640, sy = lsDuneY(640);
  const k0 = c.sand - shot.start, k1 = c.melt - shot.start, k2 = c.glass - shot.start, k3 = c.glass_end - shot.start;
  const cam = camKeys(lt, [[0, 520, 1000, 0.62], [k0 - 0.05, 540, 1050, 0.66], [k0 + 0.45, 560, 1310, 0.9], [k2 + 0.15, 560, 1320, 0.94],
    [k3 + 0.05, 440, 1040, 1.0], [D, 440, 1030, 1.04]]);
  const f = t > hit ? 1.1 * Math.exp(-(t - hit) * 5) : 0;
  lsDune(cam, t, { flash: f, bgdy: -160 });
  applyCam(cam);
  // the strike
  const lead = ramp(t, hit - 0.22, hit, (x) => x);
  const I = t < hit ? 0.8 : 1.6 * Math.exp(-(t - hit) * 3.2) + 0.08;
  if (t < hit + 1.2) drawBolt(LS_BOLT_DUNE, lead, I, t, { width: 1.3 });
  if (t > hit) sparks(66, sx, sy, hit, t, 50, { speed: 800, life: 0.8, dir: -Math.PI / 2, spread: 1.3, cols: ['#FFE2B0', '#FFB66A', '#FFFFFF'] });
  // the cutaway window under the strike
  const win = ramp(t, c.sand - 0.05, c.sand + 0.3, E.outBack);
  const pulled = ramp(t, c.glass_end - 0.75, c.glass_end - 0.15, E.inOutCubic);
  if (win > 0.01) {                            // a slice through the dune: wavy strata, darker with depth, a lit cut edge
    const w = 470 * win, h = 600 * win, wx = sx, top = sy + 18;
    const edge = (u) => top + 10 * Math.sin(u * 9 + 1) * win;
    ctx.beginPath(); ctx.moveTo(wx - w / 2, edge(0));
    for (let i = 1; i <= 20; i++) ctx.lineTo(wx - w / 2 + (w * i) / 20, edge(i / 20));
    ctx.lineTo(wx + w / 2, top + h * 0.8); ctx.quadraticCurveTo(wx + w / 2, top + h, wx + w / 2 - 60 * win, top + h);
    ctx.lineTo(wx - w / 2 + 60 * win, top + h); ctx.quadraticCurveTo(wx - w / 2, top + h, wx - w / 2, top + h * 0.8); ctx.closePath();
    const sg = ctx.createLinearGradient(0, top, 0, top + h);
    sg.addColorStop(0, '#C77440'); sg.addColorStop(0.5, '#93492E'); sg.addColorStop(1, '#4E2420');
    ctx.fillStyle = sg; ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = rgba('#FFD9A0', 0.75); ctx.stroke();
    for (let i = 1; i < 8; i++) {               // strata
      const yy = top + (i * h) / 8;
      ctx.beginPath();
      for (let j = 0; j <= 16; j++) { const xx = wx - w / 2 + 20 + ((w - 40) * j) / 16; const y2 = yy + 8 * Math.sin(j * 0.9 + i * 1.7); j ? ctx.lineTo(xx, y2) : ctx.moveTo(xx, y2); }
      ctx.lineWidth = 4; ctx.strokeStyle = rgba(i % 2 ? '#E8A06A' : '#5A2A20', 0.35); ctx.stroke();
    }
    const tp = toScreen(cam, wx + w / 2 - 40, top + 60);
    lsTag('UNDER THE SAND', clamp(tp[0], 300, 760), tp[1], '#FFC27A', popK(t, c.sand + 0.15, c.glass - 0.1, 0.12, 0.1), 30, 0.04);
    applyCam(cam);
  }
  const heat = 1 - ramp(t, c.glass - 0.1, c.glass + 0.45, E.inOutSine);
  const grow = ramp(t, c.melt - 0.3, c.melt + 0.6, E.outCubic);
  if (win > 0.6 && pulled < 0.01) lsFulgurite(ctx, sx, sy + 40, grow, heat, t, { sparkle: ramp(t, c.glass + 0.1, c.glass + 0.3) });
  // the hero: watching, flinching at the strike, then holding the glass root up like a trophy
  const st = { x: 380, y: lsDuneY(380) + 4, s: 0.86, blink: 0 };
  const flinch = popK(t, hit, hit + 0.8, 0.05, 0.3);
  let pose = lerpPose(POSES.stand, POSES.flinch, flinch);
  const hold = ramp(t, c.glass_end - 0.35, c.glass_end + 0.1, E.outBack);
  const top0 = [st.x + 10, st.y - 560 * st.s - 30];
  const trophy = [lerp(sx, top0[0], pulled), lerp(sy + 40, top0[1], pulled)];
  if (hold > 0.01) {
    pose = ikReach(pose, 'R', ikLocal(st, top0[0] + 16, top0[1] + 40), -1);
    pose = ikReach(pose, 'L', ikLocal(st, top0[0] - 16, top0[1] + 40), -1);
  }
  st.pose = pose;
  st.face = hold > 0.5 ? FACES.grin : Object.assign({}, lerpFace(FACES.calm, FACES.startled, flinch), { lookX: 0.9, lookY: 0.3 });
  applyCam(cam);
  charLayer(cam, st, t, {});
  applyCam(cam);
  if (pulled > 0.01) lsFulgurite(ctx, trophy[0], trophy[1], 1, 0, t, { rot: Math.PI * pulled, s: lerp(1, 0.9, pulled), sparkle: 1 });
  if (pulled > 0.01 && pulled < 1) sparks(68, sx, sy, c.glass_end - 0.75, t, 30, { speed: 600, life: 0.6, cols: ['#FFE2B0', '#E8B07A'] });
  lsTag('MELTED SAND = GLASS', 540, 520, '#7DFFB8', popK(t, c.glass + 0.05, shot.end + 1, 0.12, 0.1), 40, -0.04);
  return { glow: 0.95, flash: t > hit ? 0.45 * Math.exp(-(t - hit) * 10) : 0 };
};

// ================================================================ BUTTON: thunder, glass, one crispy marshmallow -> frame 1
SC.button = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const a1 = c.b_one - shot.start, a2 = c.b_mm_end - shot.start;
  const cam = camKeys(lt, [[0, 560, 1150, 1.25], [a1, 540, 1110, 1.45], [a2, LS_HOOK_CAM.x, LS_HOOK_CAM.y, LS_HOOK_CAM.zoom], [D, LS_HOOK_CAM.x, LS_HOOK_CAM.y, LS_HOOK_CAM.zoom]]);
  const f = lsSkyFlash(t, [c.b_thunder]);
  lsSummitBack(cam, LS_SITE_A, LS_BOLT_A, t, { flash: f, surge: 0.6 * Math.exp(-Math.max(0, t - c.b_thunder) * 4) });
  // the glass root as a trophy on a rock
  applyCam(cam);
  const gx = 165, gy = lsCrestY(LS_SITE_A, 165) - 20;
  lsRock(ctx, gx, gy + 40, 70, 0.6, 501, 0, f);
  lsFulgurite(ctx, gx, gy - 230, 1, 0, t, { rot: Math.PI, s: 0.5, sparkle: popK(t, c.b_glass, c.b_one, 0.08, 0.3) });
  // the marshmallow: charcoal, smoking; it crumbles on "crispy"; a fresh one pops on for the loop
  const fresh = t >= c.loop_pop;
  const crumble = ramp(t, c.crispy + 0.1, c.b_mm_end, E.inCubic);
  const deadpan = ramp(t, c.b_one - 0.2, c.b_one + 0.1) * (1 - ramp(t, c.loop_pop, c.loop_pop + 0.3));
  let face = lerpFace(FACES.grin, FACES.annoyed, deadpan);
  if (t > c.b_glass - 0.1 && t < c.b_one - 0.2) face = Object.assign({}, FACES.grin, { lookX: -0.9, lookY: 0.4 });   // a proud glance at his glass
  else face = Object.assign({}, face, { lookX: lerp(0.85, 0.6, deadpan), lookY: lerp(-0.75, -0.5, deadpan) });
  const flinch = popK(t, c.b_thunder, c.b_thunder + 0.5, 0.05, 0.3);
  const res = lsHeroRoast(cam, LS_SITE_A, LS_BOLT_A, t, {
    face, toast: fresh ? 0.08 : 1, puff: fresh ? 1 : 1.1, fire: 0, crumble: fresh ? 0 : crumble * 0.6, burnt: fresh ? 0 : 0.4,
    blink: popK(t, c.b_mm - 0.1, c.b_mm + 0.05, 0.04, 0.04) * 0.95, pose: (p) => { p.lean = -0.03 * flinch; return p; } });
  if (!fresh) smoke(77, res.mm[0], res.mm[1] - 20, shot.start, t, { rate: 10, life: 1.2, rise: 140, size: 14, alpha: 0.35, wind: 20, col: '#9AA0B8' });
  if (fresh) {                                       // the pop: a white puff where the new one lands
    const tr = t - c.loop_pop;
    if (tr < 0.35) for (let i = 0; i < 6; i++) softDot(ctx, res.mm[0] + Math.cos(i) * 40 * (0.5 + tr * 3), res.mm[1] + Math.sin(i) * 30 * (0.5 + tr * 3), 18, '#FFFFFF', 0.7 * (1 - tr / 0.35));
  }
  return { glow: 0.95 };
};

// ================================================================ the cover (outside the timeline: src/cover.sh)
SC.cover = (lt, t, shot) => {
  const cam = { x: 520, y: 1060, zoom: 2.25 };
  lsSummitBack(cam, LS_SITE_A, LS_BOLT_A, 1.0, { flash: 0.55, surge: 0.3, boltWidth: 1.2 });
  lsHeroRoast(cam, LS_SITE_A, LS_BOLT_A, 1.0, { face: Object.assign({}, FACES.grin, { lookX: 0.85, lookY: -0.75, eyeOpen: 1.25 }),
    toast: 0.5, puff: 1.22, fire: 0.85 });
  screenSpace();
  // a dark patch in the glow layer under the words: the bolt's bloom stays off them
  rrect(gctx, 60, 380, 760, 330, 40); gctx.fillStyle = 'rgba(0,0,0,1)'; gctx.fill();
  bigWord('5× HOTTER', 420, 480, 150, '#FFD447', 1, -0.05);
  bigWord("THAN THE SUN'S", 410, 610, 80, '#FFFFFF', 1, -0.05);
  bigWord('SURFACE', 410, 690, 80, '#FFFFFF', 1, -0.05);
  return { glow: 1.0, noCaptions: true };
};

function initScenes2() {
  lsInit();
  lsDuneInit();
  lsFulgInit();
}
