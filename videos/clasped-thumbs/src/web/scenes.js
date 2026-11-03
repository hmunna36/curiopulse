// Which THUMB Is On Top When You Clasp Your Hands? 🙏 Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds
// inside the shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
// Worlds: camp.js (mosquito-bites' campsite) under ct_world.js (the storm, the rain, the lantern, the sun's hole), ct_hands.js
// (the clasp with faces, him praying). The hook, the seats and the button are ONE picture over time (`ctFrame`): the camera
// pushes from his face into his hands and back, so nothing jumps; `ctS(tt)` is valid at negative time for the loop.
'use strict';

const cu = () => TLd.cues;

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// a wet night under a lantern on his left (screen left), the storm's cold light behind him on the right
const CT_LIGHT = { ...LIGHTS.lanterns, keyFrom: [-0.62, -0.78], rim: [0.62, 0.78, 1.0], rimFrom: [0.85, -0.35], rimAmt: 1.15 };
const CT_SUNLIT = (k) => ({ ...CT_LIGHT, rim: [lerp(0.62, 1.0, k), lerp(0.78, 0.82, k), lerp(1.0, 0.5, k)], rimAmt: 1.15 + 0.9 * k,
  rimFrom: [lerp(0.85, 0.55, k), lerp(-0.35, -0.85, k)] });
setLights({ hook: CT_LIGHT, seats: CT_LIGHT, coin: CT_LIGHT, twins: CT_LIGHT,
  button: (lt, t) => CT_SUNLIT(ctSunK(t)), cover: CT_LIGHT });

const CT_HX = 420;                         // where he stands
const CT_HS = 1.0;
const PRAY = Object.assign({}, FACES.calm, { blink: 1, browY: 0.7, browTilt: 0.8, mouth: 'flat', mouthOpen: 0.2 });
const PEEK = Object.assign({}, FACES.calm, { lookX: 0, lookY: 1, browY: 0.4, browTilt: 0.5 });
const CRINGE = Object.assign({}, FACES.nervous, { lookY: 1, lookX: 0 });
const SMUG = Object.assign({}, FACES.grin, { lookX: 0.3, lookY: -1, browY: 0.6 });
const GLARE = (dir) => Object.assign({}, FACES.annoyed, { lookX: dir, lookY: 0.2, blink: 0.35 });

// ---------------------------------------------------------------- the sun (the button) and the storm's flash
function ctSunK(t) {
  const c = cu();
  return ramp(t, c.sun, c.sun + 0.55, E.outCubic) * (1 - ramp(t, c.close, c.close + 0.45, E.inCubic));
}
function ctFlash(t) {
  const c = cu();
  return popK(t, c.bolt, c.bolt + 0.32, 0.02, 0.26) + 0.6 * popK(t, c.bolt + 0.38, c.bolt + 0.55, 0.02, 0.12);
}
function ctRainK(t) {
  const c = cu();
  return 1 - ramp(t, c.sun + 0.1, c.sun + 0.6) * (1 - ramp(t, c.close + 0.2, c.close + 0.5));
}

// ---------------------------------------------------------------- the state of his hands and face at time tt
// tt < 0: the Short's last frames (the loop), which run into frame 1
function ctS(tt) {
  const c = cu(), S = {};
  const r = (a, b, e = E.inOutCubic) => ramp(tt, a, b, e);
  // which thumb is on top (0 = his own way) through the Short; each swap passes through `pull`
  const swaps = tt < 0 ? [] : [[c.swap1, 1], [c.replay0, 0], [c.replay1, 1], [c.swapb, 0], [c.swapc, 1], [c.swapd, 0]];
  let sh = tt < 0 ? 0 : 0, pull = 0;
  for (const [t0, to] of swaps) {
    const d = t0 === c.replay0 ? 0.32 : t0 === c.replay1 ? 0.42 : 0.55;
    if (tt >= t0) {
      const u = ramp(tt, t0, t0 + d, E.inOutCubic);
      const from = sh;
      sh = lerp(from, to, ramp(u, 0.3, 0.7, E.inOutSine));
      pull = Math.max(pull, Math.sin(Math.PI * u) * (u < 1 ? 1 : 0));
    }
  }
  // in the button he starts the wrong way round (as the twins shot left him) until he swaps back to his own
  if (tt >= c.so2 && tt < c.swapd) sh = 1;
  // the twins shot: he is his own way, the twin the other
  if (tt >= c.twin_in && tt < c.so2) sh = 0;
  S.sh = sh; S.pull = pull;
  // hands: open on frame 1 and at the very end; down while he flicks the coin
  S.open = tt < 0 ? 0.36 * ramp(tt, -0.42, -0.02, E.inOutSine) : 0.36 * (1 - ramp(tt, 0, c.clasped, E.outCubic));
  S.down = tt < 0 ? 0 : r(c.letgo, c.letgo + 0.35) * (1 - r(c.twin_in - 0.01, c.twin_in));
  S.squeeze = tt < 0 ? 0 : 0.6 * popK(tt, c.think - 0.05, c.think + 0.45, 0.12, 0.25) + 0.7 * popK(tt, c.bliss, c.home_end + 0.2, 0.2, 0.3);
  S.wig = tt < 0 ? 0 : 0.9 * popK(tt, c.cringe, c.top_end + 0.1, 0.05, 0.25) + 0.7 * popK(tt, c.snapeye, c.snapeye + 0.5, 0.04, 0.3) + 0.8 * popK(tt, c.so2, c.swapd, 0.1, 0.1);
  // his face
  let face = PRAY, blink = 1;
  if (tt >= 0) {
    if (tt >= c.peek) { face = lerpFace(PRAY, PEEK, r(c.peek, c.peek + 0.2)); blink = 1 - r(c.peek, c.peek + 0.12); }
    if (tt >= c.cringe) face = lerpFace(PEEK, CRINGE, r(c.cringe, c.cringe + 0.15));
    if (tt >= c.bolt) face = lerpFace(CRINGE, FACES.startled, popK(tt, c.bolt, c.bolt + 0.6, 0.04, 0.3));
    if (tt >= c.swapb) face = lerpFace(CRINGE, FACES.calm, r(c.swapb + 0.3, c.swapb + 0.6));
    if (tt >= c.bliss) face = lerpFace(FACES.calm, Object.assign({}, FACES.grin, { blink: 1 }), r(c.bliss, c.bliss + 0.25));
    if (tt >= c.swapc) face = lerpFace(Object.assign({}, FACES.grin, { blink: 1 }), CRINGE, r(c.swapc + 0.2, c.swapc + 0.45));
    if (tt >= c.letgo) face = FACES.calm;
    if (tt >= c.shrug) face = lerpFace(FACES.calm, FACES.confused, r(c.shrug, c.shrug + 0.2));
    if (tt >= c.flick) face = lerpFace(FACES.confused, Object.assign({}, FACES.calm, { lookY: -1, lookX: 0.4 }), r(c.flick, c.flick + 0.2));
    if (tt >= c.land) face = lerpFace(Object.assign({}, FACES.calm, { lookY: -1, lookX: 0.4 }), Object.assign({}, FACES.dazed, { cross: 0, lookX: 0.6, lookY: 1 }), r(c.land, c.land + 0.25));
    if (tt >= c.twin_in) { face = PRAY; blink = 1; }
    if (tt >= c.rings) { face = lerpFace(PRAY, Object.assign({}, FACES.calm, { lookX: 0.8, lookY: 1 }), r(c.rings, c.rings + 0.2)); blink = 1 - r(c.rings, c.rings + 0.12); }
    if (tt >= c.glare) face = lerpFace(face, GLARE(1), r(c.glare, c.glare + 0.2));
    if (tt >= c.so2) { face = Object.assign({}, CRINGE, { browY: 1.1, browTilt: 1.3, blink: 1 }); blink = 1; }
    if (tt >= c.swapd) { face = PRAY; blink = 1; }
    if (tt >= c.wink) { face = lerpFace(PRAY, SMUG, r(c.wink, c.wink + 0.2)); blink = 1 - r(c.wink, c.wink + 0.15); }
    if (tt >= c.close) { face = lerpFace(SMUG, FACES.annoyed, r(c.close, c.close + 0.2)); blink = 0.4; }
    if (tt >= c.unclasp - 0.1) { face = lerpFace(FACES.annoyed, PRAY, r(c.unclasp - 0.1, c.unclasp + 0.25)); blink = r(c.unclasp - 0.1, c.unclasp + 0.25); }
  } else { face = PRAY; blink = 1; }
  S.face = face; S.blink = blink;
  S.hdy = 3 * Math.sin(tt * loopW(1.4)) + (tt >= 0 ? 10 * popK(tt, c.bolt, c.bolt + 0.4, 0.03, 0.3) : 0) + (tt < 0.6 && tt >= 0 ? 0 : 0);
  S.hrot = tt >= 0 ? -0.05 * popK(tt, c.shrug, c.shrug + 0.7, 0.15, 0.25) + 0.06 * r(c.glare, c.glare + 0.2) * (1 - r(c.grid, c.grid + 0.3)) : 0;
  // the finger faces
  S.faces = tt < 0 ? 0 : r(c.faces, c.faces + 0.2) * (1 - r(c.letgo - 0.1, c.letgo)) + (tt >= c.rings && tt < c.so2 ? r(c.rings, c.rings + 0.2) : 0);
  const rows = ctFingerRows(sh);
  // where each digit's neighbours are: look up or down the stack
  const nb = (id) => {
    if (id[1] === 't') return [id[0] === 'A' ? 1 : -1, 0.6];
    const rr = rows[id], ph = (+id[1] + (id[0] === 'B' ? 0.5 : 0)) % 2 < 1 ? -1 : 1;
    return [0, ph * 1];
  };
  let mood = 'awk', look = nb;
  if (tt >= c.faces && tt < c.replay0) { mood = 'shock'; look = () => [0, 0]; }
  if (tt >= c.replay0 && tt < c.sideeye) { mood = 'calm'; look = () => [0, 0]; }
  if (tt >= c.sideeye) { mood = 'side'; look = nb; }
  if (tt >= c.swapb) { mood = tt >= c.bliss ? 'bliss' : 'calm'; look = () => [0, 0]; }
  if (tt >= c.swapc) { mood = 'shock'; look = () => [0, 0]; }
  if (tt >= c.everyone) { mood = 'awk'; const k = r(c.turn, c.snapeye, E.inOutSine); look = (id) => { const v = nb(id); return [v[0] * k, v[1] * k * 0.6]; }; }
  if (tt >= c.snapeye) { mood = 'side'; look = nb; }
  if (tt >= c.rings) { mood = 'grump'; look = (id) => [id[0] === 'A' ? 1 : -1, 0]; }
  S.mood = mood; S.look = look;
  S.fblink = (id) => { const u = ((tt * 0.9 + hash(id.charCodeAt(0) * 3 + +id[1] || 7)) % 2.3); return u < 0.08 ? 1 : 0; };
  return S;
}

// ---------------------------------------------------------------- the camera of the one-picture part (hook, seats, button)
const CT_CLASP = [CT_HX, CAMP.GY + CT_AT[1] * CT_HS];    // the clasp's centre in the world
function ctCam(tt) {
  const c = cu();
  const hook = { x: CT_HX + 4, y: 927, zoom: 3.1 };
  const macro = { x: CT_CLASP[0] + 4, y: CT_CLASP[1] + 22, zoom: 6.5 };
  const macroIn = { x: CT_CLASP[0] + 3, y: CT_CLASP[1] + 18, zoom: 6.8 };
  if (tt < 0 || tt >= c.so2) {
    // the button: the hook's framing, a slow push while the sun comes, back for the loop
    const u = tt < 0 ? 0 : ramp(tt, c.so2, c.sun, E.inOutSine), v = tt < 0 ? 1 : ramp(tt, c.close, c.unclasp + 0.3, E.inOutCubic);
    const z = lerp(lerp(3.1, 2.75, u), 3.1, v), y = lerp(lerp(927, 905, u), 927, v);
    return { x: CT_HX + 4, y, zoom: z, rot: 0 };
  }
  const sh = 4 * popK(tt, c.bolt, c.bolt + 0.35, 0.02, 0.3);
  if (tt < c.push) return { x: hook.x + sh * Math.sin(tt * 60), y: hook.y + 0.6 * sh * Math.cos(tt * 51) - 4 * ramp(tt, 0, c.push), zoom: hook.zoom + 0.06 * ramp(tt, 0, c.push), rot: 0 };
  const u = ramp(tt, c.push, c.faces + 0.25, E.inOutCubic);
  let cam = { x: lerp(hook.x, macro.x, u), y: lerp(hook.y - 4, macro.y, u), zoom: Math.exp(lerp(Math.log(hook.zoom + 0.06), Math.log(macro.zoom), u)) };
  // "one seat over": a little closer; "strangers": closer still
  const v = ramp(tt, c.one - 0.2, c.over_end, E.inOutSine) * (1 - ramp(tt, c.swapb, c.swapb + 0.5, E.inOutSine));
  const w = ramp(tt, c.turn, c.strangers_end, E.inOutSine);
  cam = { x: lerp(cam.x, macroIn.x, Math.max(v, w)), y: lerp(cam.y, macroIn.y, Math.max(v, w)), zoom: Math.exp(lerp(Math.log(cam.zoom), Math.log(macroIn.zoom), Math.max(v, w))) };
  return { x: cam.x + sh * Math.sin(tt * 60), y: cam.y + 0.6 * sh * Math.cos(tt * 51), zoom: cam.zoom, rot: 0 };
}

// ---------------------------------------------------------------- small graphics
function ctTag(txt, x, y, k, col, size = 46, to) {
  if (k <= 0.01) return;
  screenSpace();
  const s = E.outBack(clamp(k), 2.2);
  ctx.save(); ctx.font = `900 ${size}px Montserrat`;
  const w = ctx.measureText(txt).width + size * 0.9, h = size * 1.45;
  ctx.restore();
  if (to) thinLeader([x, y + h * 0.5 * Math.sign(to[1] - y)], to, clamp(k * 1.5 - 0.3), col);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = '#141428'; ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = col; ctx.stroke();
  ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = col;
  ctx.fillText(txt, 0, size * 0.05);
  ctx.restore();
}
function ctRing(x, y, r, k, col) {
  if (k <= 0.01) return;
  paint(() => {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.beginPath(); ctx.arc(x, y, r * E.outBack(clamp(k), 2), 0, Math.PI * 2);
    ctx.lineWidth = 9; ctx.strokeStyle = col; ctx.setLineDash([22, 12]); ctx.lineDashOffset = -k * 40; ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
  });
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); softDot(gctx, x, y, r * 1.2, col, 0.18 * clamp(k)); gctx.restore();
}
// a heart that floats up (screen space)
function ctHeart(x, y, u, s = 1) {
  if (u <= 0 || u >= 1) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const k = E.outBack(clamp(u * 4), 2.4) * (1 - clamp((u - 0.75) * 4));
  ctx.translate(x + 10 * Math.sin(u * 9), y - 90 * u); ctx.scale(s * k, s * k);
  ctx.beginPath(); ctx.moveTo(0, 10); ctx.bezierCurveTo(-26, -8, -14, -30, 0, -16); ctx.bezierCurveTo(14, -30, 26, -8, 0, 10);
  ctx.fillStyle = '#FF5A7E'; ctx.fill(); ctx.lineWidth = 3.5; ctx.strokeStyle = '#3A0E1E'; ctx.stroke();
  ctx.restore();
}
// screen point of a clasp-unit point of his hands
function ctTipScreen(cam, p) { return toScreen(cam, CT_CLASP[0] + p[0] * CT_SC * CT_HS, CT_CLASP[1] + p[1] * CT_SC * CT_HS); }

// ghost outlines where the fingers sat before the move (clasp units, drawn over the clasp)
function ctGhosts(cam, shFrom, k) {
  if (k <= 0.01) return;
  const rows = ctFingerRows(shFrom);
  screenSpace();
  paint(() => {
    ctx.save(); ctx.setLineDash([14, 10]); ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (const id of Object.keys(rows)) {
      const sd = id[0] === 'A' ? 1 : -1, y = CT_Y0 + rows[id] * CT_ROW, i = +id[1];
      const a = ctTipScreen(cam, [sd * 10, y]), b = ctTipScreen(cam, [sd * (46 + CT_LEN[i] * 0.6), y]);
      ctx.strokeStyle = rgba(sd > 0 ? '#7FE9FF' : '#FFD447', 0.85 * k);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
    ctx.restore();
  });
}

// ---------------------------------------------------------------- the one picture: him praying in the rain
function ctFrame(tt, t, o = {}) {
  const c = cu(), S = ctS(tt), cam = o.cam || ctCam(tt);
  const flash = tt >= 0 ? ctFlash(tt) : 0, sun = tt >= 0 ? ctSunK(tt) : 0, rain = tt >= 0 ? ctRainK(tt) : 1;
  const sunAt = [830, 330];
  ctBack(cam, t, { soft: 0.92, flash, sun, sunAt });
  // the bolt, far off on the right
  if (flash > 0.02) { screenSpace(); drawBolt(CTW.bolt, 1, clamp(flash * 1.4), t, {}); }
  applyCam(cam);
  ctDeadFire(t);
  ctLantern(t, sun);
  ctRain(t, rain * 0.8, 0);
  const hero = ctHeroAt(cam, t, [CT_HX, CAMP.GY], CT_HS, S);
  ctSunShaft(cam, sun, [CT_HX, 800], sunAt);
  if (sun > 0.02) { applyCam(cam); sunRays(cam.x + (sunAt[0] - 540) / cam.zoom, cam.y + (sunAt[1] - 960) / cam.zoom, 1.0 * sun); }
  ctRain(t, rain, 1);
  return { S, cam, hero, flash, sun };
}

// ---------------------------------------------------------------- shots
function ctMain(lt, t, shot) {
  const c = cu(), R = ctFrame(t, t), cam = R.cam, S = R.S;
  // the move replayed: ghosts where they sat, arrows to where they are now
  const g = popK(t, c.replay1, c.over_end, 0.12, 0.25);
  if (g > 0.01) ctGhosts(cam, 0, g);
  // bliss: little hearts from three fingers
  if (t >= c.bliss && t < c.home_end + 1.2 && S.tips) {
    for (const [id, d] of [['A1', 0], ['B2', 0.25], ['At', 0.45], ['B0', 0.7]]) {
      const p = S.tips[id]; if (!p) continue;
      const q = ctTipScreen(cam, p);
      ctHeart(q[0], q[1] - 40, inv(c.bliss + d, c.bliss + d + 1.1, t), 1.2);
    }
  }
  // strangers: a sweat drop on two of them
  if (t >= c.snapeye && t < c.letgo && S.tips) {
    for (const id of ['A2', 'B1']) {
      const p = S.tips[id]; const q = ctTipScreen(cam, [p[0] + 5, p[1] - 6]);
      screenSpace(); sweatDrop(ctx, q[0], q[1], 1.3, clamp((t - c.snapeye) * 5));
    }
  }
  // the bolt's word: the sky disapproves
  return { glow: 0.85, flash: 0.55 * R.flash, zblur: 0.05 * popK(t, c.push, c.push + 0.4, 0.05, 0.3) };
}
SC.hook = ctMain;
SC.seats = ctMain;

// the coin: a medium shot in the rain, hands down; a shrug; the flick; the coin spins and lands on its edge
function ctCoinDraw(x, y, r, spin, stand) {
  // spin: radians about the horizontal axis; stand 0..1: upright on its edge (3/4 view)
  const cs = Math.cos(spin), face = cs >= 0 ? 'LEFT' : 'RIGHT';
  const rx = lerp(r, r * 0.55, stand), ry = lerp(r * Math.max(0.08, Math.abs(cs)), r, stand);
  actor(() => {
    // the edge (thickness)
    const th = lerp(r * 0.16 * Math.sign(cs || 1), r * 0.14, stand);
    ellipse(ctx, x + lerp(0, -th, stand), y + lerp(th, 0, stand), rx, ry, '#A8741C');
    ellipse(ctx, x, y, rx, ry, '#F2B83A');
    ellipse(ctx, x, y, rx * 0.84, ry * 0.84, '#FFD24A');
  });
  if (Math.abs(cs) > 0.35 || stand > 0.5) paint(() => {
    ctx.save(); ctx.translate(x, y); ctx.scale(rx / r, ry / r);
    ctx.font = `400 ${r * 0.52}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#B07A1A'; ctx.fillText(stand > 0.5 ? '?' : face, 0, r * 0.08);
    ctx.lineWidth = r * 0.05; ctx.strokeStyle = '#C8901E'; ctx.beginPath(); ctx.arc(0, 0, r * 0.74, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  });
  softDot(gctx, x, y, r * 1.6, '#FFC040', 0.25);
}
SC.coin = (lt, t, shot) => {
  const c = cu(), S = ctS(t), D = shot.end - shot.start;
  const land = c.land, flick = c.flick;
  // the camera: waist up, a little up with the coin, then down to the mud where it lands
  const u1 = ramp(t, flick, flick + 0.35, E.inOutSine), u2 = ramp(t, land - 0.3, land + 0.25, E.inOutCubic);
  const LANDW = [CT_HX + 175, CAMP.GY + 36];
  let cam = { x: lerp(CT_HX + 20, CT_HX + 40, u1), y: lerp(905, 880, u1), zoom: lerp(2.35, 2.2, u1) };
  cam = { x: lerp(cam.x, LANDW[0] - 10, u2), y: lerp(cam.y, LANDW[1] + 30, u2), zoom: lerp(cam.zoom, 3.4, u2), rot: 0 };
  ctBack(cam, t, { soft: 0.8 });
  applyCam(cam);
  ctDeadFire(t);
  ctLantern(t);
  ctRain(t, 0.8, 0);
  // his arms: still clasped (the wrong way) while he looks down; "Neither": a shrug; the flick with his screen-right hand; then down
  const kS = ramp(t, c.shrug - 0.05, c.shrug + 0.2, E.outBack), kF = ramp(t, flick - 0.35, flick - 0.12), kD = ramp(t, flick + 0.3, flick + 0.6);
  const SHRUG = { L: { e: [-150, -268], w: [-212, -338] }, R: { e: [150, -268], w: [212, -338] } };
  const FLK = { L: { e: [-104, -300], w: [-98, -232] }, R: CT_FLICK(t - flick) };
  const DOWN = { L: { e: [-104, -300], w: [-98, -232] }, R: { e: [104, -300], w: [98, -232] } };
  const mixA = (A, B, k) => ({ L: armMix(A.L, B.L, k), R: armMix(A.R, B.R, k) });
  const arms = mixA(mixA(SHRUG, FLK, kF), DOWN, kD), ak = kS;
  const sk = popK(t, c.shrug, flick - 0.25, 0.18, 0.2);
  const look = t < c.shrug ? PEEK : t < flick - 0.2 ? FACES.confused : t < land - 0.2 ? Object.assign({}, FACES.calm, { lookY: -1, lookX: 0.5 }) : Object.assign({}, FACES.startled, { lookY: 1, lookX: 0.6 });
  const hero = ctHeroAt(cam, t, [CT_HX, CAMP.GY], CT_HS, Object.assign({}, S, { down: 0, face: look, blink: 0, arms, armsK: ak, faces: 0, hrot: -0.05 * sk }));
  // the coin: from his thumb, up and spinning, down into the mud ON ITS EDGE (charLayer leaves the canvas in screen space)
  applyCam(cam);
  if (t >= flick - 0.02) {
    const P0 = ctFlickHand(hero.st);
    const air = clamp(inv(flick, land, t));
    const pk = [cam.x + (790 - 540) / cam.zoom, cam.y + (700 - 960) / cam.zoom];
    const lin = (u) => [lerp(P0[0] + 10, LANDW[0], u), lerp(P0[1] - 20, LANDW[1] - 14, u)];
    const m = lin(0.5), b4 = 4 * air * (1 - air);
    const x = lin(air)[0] + (pk[0] - m[0]) * b4, y = lin(air)[1] + (pk[1] - m[1]) * b4;
    const spin = (t - flick) * 24, stand = t >= land ? 1 : 0;
    const wob = t >= land ? 0.12 * Math.sin((t - land) * 26) * Math.exp(-(t - land) * 5) : 0;
    if (t >= land) { ctx.save(); ctx.translate(LANDW[0] + 8, LANDW[1] + 38); ctx.scale(1, 0.22); softDot(ctx, 0, 0, 90, '#05070F', 0.75); ctx.restore(); }
    ctx.save(); ctx.translate(x, y); if (t >= land) { ctx.translate(0, 50); ctx.rotate(wob); ctx.translate(0, -50); }
    ctCoinDraw(0, 0, 52, spin, stand); ctx.restore();
    if (t >= land && t < land + 0.45) { const k = inv(land, land + 0.45, t); for (let i = 0; i < 9; i++) { const a = -Math.PI * (0.1 + 0.8 * i / 8); circle(ctx, LANDW[0] + Math.cos(a) * 70 * k, LANDW[1] + 40 + Math.sin(a) * 60 * k + 50 * k * k, 6 * (1 - k) + 2, rgba('#9CB0E8', 1 - k)); } }
  }
  ctRain(t, 1, 1);
  // the two tags at the top of the flip; then 1 % on the edge
  const pk = popK(t, c.pct, land - 0.05, 0.1, 0.12);
  ctTag('55%  LEFT THUMB', 540, 500, pk, '#FFD447', 52);
  ctTag('44%  RIGHT THUMB', 540, 615, popK(t, c.pct + 0.18, land - 0.05, 0.1, 0.12), '#7FE9FF', 52);
  const ok = ramp(t, c.onepct, c.onepct + 0.22);
  if (ok > 0) { const q = toScreen(cam, LANDW[0], LANDW[1] - 66); ctTag('1%: NO FAVOURITE', 540, 520, ok, '#4DFFB4', 56, [q[0], q[1] - 40]); }
  return { glow: 0.85, push: { k: 1 + 0.02 * lt / D, cx: 540, cy: 900 } };
};
// the flicking forearm: up at his chest, the wrist snaps up on the flick (rig units; u = seconds after the flick)
function CT_FLICK(u) { const k = ramp(u, 0, 0.08); return { e: [128, -262], w: [96 - 6 * k, -330 - 30 * k] }; }
// where the coin leaves his hand (world): the wrist of that pose, a little above it
function ctFlickHand(st) {
  let p = JSON.parse(JSON.stringify(POSES.stand)); const A = CT_FLICK(0);
  p = armAt(p, 'R', A.e, A.w);
  return toWorld(st, [A.w[0] + 6, A.w[1] - 26]);
}

// the twins: two of him side by side, praying; SAME DNA; the two clasps; the glare; 4 IN 10
const CT_TW = 640;                    // the twin's x (he is at CT_HX)
function ctPairIcon(x, y, s, diff, k) {
  if (k <= 0.01) return;
  const sc = s * E.outBack(clamp(k), 2.2);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.scale(sc, sc);
  for (const dx of [-17, 17]) {
    rrect(ctx, dx - 14, 4, 28, 26, 9); ctx.fillStyle = '#F7C531'; ctx.fill();
    circle(ctx, dx, -10, 13, '#E8B48A'); ctx.beginPath(); ctx.arc(dx, -13, 13, Math.PI * 1.05, Math.PI * 1.95); ctx.fillStyle = '#1E1A24'; ctx.fill();
  }
  if (diff) { ctx.lineCap = 'round'; line(ctx, -12, -36, 12, -36, 5, '#FF5A6E'); line(ctx, -12, -45, 12, -45, 5, '#FF5A6E'); line(ctx, 8, -52, -8, -29, 5, '#FF5A6E'); }
  else { ctx.lineCap = 'round'; line(ctx, -12, -36, 12, -36, 5, '#4DFFB4'); line(ctx, -12, -45, 12, -45, 5, '#4DFFB4'); }
  ctx.restore();
}
SC.twins = (lt, t, shot) => {
  const c = cu(), S = ctS(t), D = shot.end - shot.start;
  const mid = (CT_HX + CT_TW) / 2;
  const d = ramp(t, c.down2, c.down2 + 0.55, E.inOutCubic) * (1 - ramp(t, c.grid - 0.1, c.grid + 0.4, E.inOutCubic) * 0.55);
  const cam = { x: mid + 6 * d, y: lerp(880, 1000, d), zoom: lerp(2.05, 2.35, d) * (1 + 0.02 * lt / D), rot: 0 };
  const tin = E.outBack(ramp(t, c.twin_in, c.twin_in + 0.3), 1.6);
  ctBack(cam, t, { soft: 0.85 });
  applyCam(cam);
  ctDeadFire(t);
  ctLantern(t);
  ctRain(t, 0.8, 0);
  // the twin: the same rig, the same coat, the other thumb on top; he slides in from the right
  const S2 = Object.assign({}, S, { sh: 1, face: t >= c.glare ? lerpFace(PRAY, GLARE(-1), ramp(t, c.glare, c.glare + 0.2)) : (t >= c.rings ? Object.assign({}, FACES.calm, { lookX: -0.8, lookY: 1 }) : PRAY),
    blink: t >= c.rings ? 1 - ramp(t, c.rings, c.rings + 0.12) : 1, hrot: -0.06 * ramp(t, c.glare, c.glare + 0.2) * (1 - ramp(t, c.grid, c.grid + 0.3)) });
  const tw = ctHeroAt(cam, t, [lerp(CT_TW + 420, CT_TW, tin), CAMP.GY], CT_HS, S2);
  const S1 = Object.assign({}, S, { sh: 0 });
  const me = ctHeroAt(cam, t, [CT_HX, CAMP.GY], CT_HS, S1);
  ctRain(t, 1, 1);
  // SAME DNA: a tag between their heads
  const hy = toScreen(cam, mid, CAMP.GY - 560);
  ctTag('SAME DNA', hy[0], Math.max(470, hy[1] - 10), popK(t, c.dnatag, c.down2 + 0.2, 0.1, 0.15), '#4DFFB4', 50);
  // rings round the two top thumbs: his (B, screen right of his hands) and the twin's (A, screen left of his)
  if (me.st && S.tips !== undefined) { /* tips are set per call: read them from the two states */ }
  const rk = popK(t, c.rings, c.grid + 0.25, 0.12, 0.15);
  if (rk > 0.01 && S1.tips && S2.tips) {
    const a = toScreen(cam, CT_HX + S1.tips.Bt[0] * CT_HS, CAMP.GY + CT_AT[1] * CT_HS + S1.tips.Bt[1] * CT_HS);
    const b = toScreen(cam, tw.st.x + S2.tips.At[0] * CT_HS, CAMP.GY + CT_AT[1] * CT_HS + S2.tips.At[1] * CT_HS);
    ctRing(a[0], a[1], 62, rk, '#FFD447');
    ctRing(b[0], b[1], 62, rk, '#7FE9FF');
  }
  // 4 IN 10: ten pairs of twins, four of them with different thumbs on top
  const gk = ramp(t, c.grid, c.grid + 0.3);
  if (gk > 0.01) {
    screenSpace();
    const k = E.outBack(clamp(gk), 1.8);
    ctx.save(); ctx.translate(540, 720); ctx.scale(k, k);
    rrect(ctx, -400, -215, 800, 505, 44); ctx.fillStyle = 'rgba(14,16,36,0.94)'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#FFD447'; ctx.stroke();
    ctx.font = '400 150px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFD447';
    ctx.fillText('4 IN 10', 0, -112);
    ctx.font = '800 36px Montserrat'; ctx.fillStyle = '#FFFFFF'; ctx.fillText('IDENTICAL TWIN PAIRS', 0, -22);
    ctx.restore();
    for (let i = 0; i < 10; i++) {
      const col = i % 5, row = Math.floor(i / 5);
      const x = 540 + (col - 2) * 136 * k, y = 720 + (102 + row * 124) * k;
      ctPairIcon(x, y, 1.45 * k, [1, 3, 5, 8].includes(i), ramp(t, c.grid + 0.12 + i * 0.045, c.grid + 0.3 + i * 0.045));
    }
  }
  return { glow: 0.85 };
};

SC.button = (lt, t, shot) => {
  const c = cu();
  const T2 = TL.duration;
  // the last 0.3 s: the hook's own drawing at negative time, so the cut to frame 1 is one move
  const tt = t > T2 - 0.3 ? t - T2 : t;
  const R = ctFrame(tt, t);
  return { glow: 0.85 };
};

// the cover: him praying, the clasp big, two faces side-eyeing, LEFT or RIGHT?
SC.cover = (lt, t, shot) => {
  const c = cu();
  const tt = (c.snapeye + c.letgo) / 2;
  const S = ctS(tt);
  const cam = { x: CT_HX + 4, y: 848, zoom: 3.3 };
  ctBack(cam, t, { soft: 0.92 });
  applyCam(cam);
  ctLantern(t);
  ctRain(t, 0.8, 0);
  ctHeroAt(cam, t, [CT_HX, CAMP.GY], CT_HS, Object.assign({}, S, { face: Object.assign({}, CRINGE, { lookY: 1, lookX: 0.2 }), blink: 0 }));
  ctRain(t, 0.8, 1);
  screenSpace();
  bigWord('WHICH', 540, 488, 120, '#FFFFFF', 1, -0.04);
  bigWord('THUMB?', 540, 600, 150, '#FFD447', 1, -0.04);
  return { glow: 0.85, noCaptions: true };
};

function initScenes2() {
  initCamp();
  initCtWorld();
  CTW.bolt = makeBolt(91, 860, -40, 760, 760, {});
}
