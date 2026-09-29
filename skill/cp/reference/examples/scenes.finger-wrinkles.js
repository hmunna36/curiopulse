// Finger-wrinkles Short: the 13 shots. Each SC.<id>(lt, t, shot) draws one frame
// (lt = time inside the shot) and returns post options for main.js.
'use strict';

const cu = () => TLd.cues;

// ---------------------------------------------------------------- shared helpers
function toScreen(cam, x, y) {
  const c = Math.cos(cam.rot || 0), s = Math.sin(cam.rot || 0);
  const dx = (x - cam.x) * cam.zoom, dy = (y - cam.y) * cam.zoom;
  return [W / 2 + (cam.sx || 0) + dx * c - dy * s, H / 2 + (cam.sy || 0) + dx * s + dy * c];
}
function shockLines(x, y, r, k, n = 10, col = '#FFFFFF', seed = 1) {
  if (k <= 0 || k >= 1) return;
  const rng = mulberry32(seed);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rng() * 0.3;
    const r0 = r * (0.9 + 0.5 * E.outCubic(k)), r1 = r0 + (40 + rng() * 50) * (1 - k);
    for (const [c, w] of [[ctx, 7], [gctx, 14]]) {
      c.save(); c.setTransform(c === gctx ? 0.5 : 1, 0, 0, c === gctx ? 0.5 : 1, 0, 0);
      line(c, x + Math.cos(a) * r0, y + Math.sin(a) * r0, x + Math.cos(a) * r1, y + Math.sin(a) * r1, w, rgba(col, 0.9 * (1 - k)));
      c.restore();
    }
  }
}
function bigWord(txt, x, y, size, col, k, rot = 0, stroke = '#0B0B1A') {
  if (k <= 0) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k);
  ctx.font = `400 ${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.fillStyle = 'rgba(0,0,12,0.55)'; ctx.fillText(txt, 0, size * 0.06);
  ctx.lineWidth = size * 0.14; ctx.strokeStyle = stroke; ctx.strokeText(txt, 0, 0);
  ctx.fillStyle = col; ctx.fillText(txt, 0, 0);
  ctx.restore();
}
function sweatDrop(c, x, y, s, a = 1) {
  if (a <= 0.01) return;
  c.beginPath(); c.moveTo(x, y - 22 * s);
  c.bezierCurveTo(x + 14 * s, y - 2 * s, x + 12 * s, y + 14 * s, x, y + 14 * s);
  c.bezierCurveTo(x - 12 * s, y + 14 * s, x - 14 * s, y - 2 * s, x, y - 22 * s);
  c.fillStyle = `rgba(150,215,255,${0.95 * a})`; c.fill();
  c.lineWidth = 2.5 * s; c.strokeStyle = `rgba(30,70,140,${0.8 * a})`; c.stroke();
}
function darkBg(c1 = '#123A52', c2 = '#04101A') {
  screenSpace();
  const bg = ctx.createRadialGradient(540, 760, 60, 540, 900, 1300);
  bg.addColorStop(0, c1); bg.addColorStop(1, c2);
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
}
// rising bubbles in screen space
function bubbles(t, a = 1, speed = 1, seed = 0) {
  if (a <= 0.01) return;
  screenSpace();
  for (let i = 0; i < 36; i++) {
    const k = hash(i + seed * 50), x = k * W + 20 * Math.sin(t * 2 + i), sp = 90 + 140 * hash(i + 7);
    const y = H - ((t * sp * speed + hash(i + 3) * H) % (H + 100));
    const r = 4 + 10 * hash(i + 11);
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.lineWidth = 2.5; ctx.strokeStyle = rgba('#DDF3FF', 0.6 * a); ctx.stroke();
    circle(ctx, x - r * 0.35, y - r * 0.35, r * 0.25, rgba('#FFFFFF', 0.8 * a));
  }
}
// the underwater world (screen space), waterline at y = wl (above it: warm blurred bathroom)
function waterWorld(t, wl, o = {}) {
  screenSpace();
  const top = ctx.createLinearGradient(0, 0, 0, Math.max(10, wl));
  top.addColorStop(0, '#3A2A2A'); top.addColorStop(1, '#7A5A48');
  ctx.fillStyle = top; ctx.fillRect(0, 0, W, Math.max(0, wl));
  for (let i = 0; i < 9; i++) softDot(ctx, (i * 173) % W, wl - 200 - (i * 97) % 500, 140, i % 2 ? '#FFB870' : '#6FB6D8', 0.12); // bokeh bathroom
  const g = ctx.createLinearGradient(0, wl, 0, H);
  g.addColorStop(0, '#6CC3E0'); g.addColorStop(0.4, '#2D86AE'); g.addColorStop(1, '#0E3D5C');
  ctx.fillStyle = g; ctx.fillRect(0, wl, W, H - wl);
  // caustics
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 12; i++) {
    const yy = wl + 60 + i * 140 + 20 * Math.sin(t * (o.fast ? 9 : 1.5) + i);
    ctx.beginPath(); for (let xx = -20; xx <= W + 20; xx += 24) ctx.lineTo(xx, yy + 16 * Math.sin(xx / 70 + t * (o.fast ? 12 : 2) + i * 1.7));
    ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(200,245,255,0.10)'; ctx.stroke();
  }
  ctx.restore();
  // the surface line
  ctx.beginPath(); for (let xx = -20; xx <= W + 20; xx += 12) ctx.lineTo(xx, wl + 6 * Math.sin(xx / 50 + t * 4));
  ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(230,250,255,0.85)'; ctx.stroke();
}
function splashDrops(x, y, t0, t, n = 40, seed = 1, spread = 1) {
  const d = t - t0;
  if (d < 0 || d > 1.2) return;
  const rng = mulberry32(seed);
  screenSpace();
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (rng() - 0.5) * 2.4 * spread, v = 500 + rng() * 900;
    const px = x + Math.cos(a) * v * d, py = y + Math.sin(a) * v * d + 0.5 * 2600 * d * d;
    const r = 5 + rng() * 12, al = clamp(1 - d / 1.1);
    circle(ctx, px, py, r, rgba('#E6F8FF', 0.9 * al)); circle(ctx, px - r * 0.3, py - r * 0.3, r * 0.35, rgba('#FFFFFF', al));
    softDot(gctx, px, py, r * 3, '#BFE6FF', 0.5 * al);
  }
}

// his hands held up beside his face (anchored to the rig's head on screen), forearms out of the water
const POSE_SOAK = { hipY: -34, lean: 0, armL: { a: 1.0, b: -0.12 }, armR: { a: 0.2, b: 0.05 }, legL: { a: 2.25, b: -1.95 }, legR: { a: 2.25, b: -1.95 }, hand: 'open', feetFront: 1 };
const POSE_SOAK2 = { hipY: -34, lean: 0, armL: { a: 0.2, b: 0.05 }, armR: { a: 0.2, b: 0.05 }, legL: { a: 2.25, b: -1.95 }, legR: { a: 2.25, b: -1.95 }, hand: 'open', feetFront: 1 };
function heldHands(cam, st, r, t, sides, hopt = {}, o = {}) {
  const [hx, hy] = toScreen(cam, ...toWorld(st, r.head));
  const z = cam.zoom / 1.8, wl = toScreen(cam, 540, TUB.water)[1];
  const out = {};
  for (const side of sides) {
    const sg = side === 'L' ? -1 : 1;
    const hs = 0.6 * z * (o.scale || 1);
    const x = hx + sg * (o.dx || 255) * z, y = hy + (o.dy || 10) * z + (o.bob ? 6 * z * Math.sin(t * 2 + sg) : 0);
    const rot = sg * (o.rot === undefined ? 0.16 : o.rot);
    const bx = x + Math.sin(rot) * -300 * hs, by = y + Math.cos(rot) * 300 * hs;
    screenSpace();
    const ex = x - sg * 30 * z, ey = wl + 30;
    const g = ctx.createLinearGradient(bx - 80 * hs, 0, bx + 80 * hs, 0);
    g.addColorStop(0, SKIN.sh); g.addColorStop(0.5, SKIN.base); g.addColorStop(1, SKIN.sh);
    line(ctx, bx, by, ex, ey, 150 * hs, SKIN.sh); line(ctx, bx - 6 * hs, by, ex - 6 * hs, ey, 110 * hs, SKIN.base);
    openHand(x, y, hs, rot, t, Object.assign({ wr: 1, wet: 1 }, hopt));
    for (let i = 0; i < 5; i++) { // foam around the forearm where it leaves the water
      const fx = ex + (i - 2) * 26 * z, fr = (18 + 8 * Math.sin(i * 2.3)) * z;
      const gg = ctx.createRadialGradient(fx - fr * 0.3, ey - 14 * z - fr * 0.3, 1, fx, ey - 14 * z, fr);
      gg.addColorStop(0, '#FFFFFF'); gg.addColorStop(1, '#C9DDF0'); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(fx, ey - 14 * z, fr, 0, 7); ctx.fill();
    }
    out[side] = { x, y, s: hs, rot };
  }
  return out;
}

// ================================================================= 1. hook: splash, time-lapse, the hand rises
SC.hook = (lt, t, shot) => {
  const c = cu();
  const A = 0.55, B = 2.15;
  if (t < A) { // the hand plunges in
    const wl = 820;
    waterWorld(t, wl);
    const k = E.inCubic(clamp(t / 0.28));
    const hy = lerp(-200, 1180, k) + (t > 0.28 ? 60 * E.outCubic(inv(0.28, A, t)) : 0);
    openHand(540, hy, 1.9, Math.PI, t, { wr: 0 });
    // water over the submerged part: re-tint below the waterline
    screenSpace(); ctx.fillStyle = 'rgba(40,140,190,0.35)'; ctx.fillRect(0, wl, W, H - wl);
    splashDrops(540, wl, 0.26, t, 46, 3);
    const rk = inv(0.26, A + 0.4, t);
    if (rk > 0) for (let i = 0; i < 3; i++) ring(540, wl, 60 + (rk * 700 + i * 120) % 700, 16 + (rk * 90 + i * 20) % 90, 6, '#E6F8FF', 0.6 * (1 - rk));
    bubbles(t, 0.8, 2.5, 1);
    const [sx, sy] = shake(t, t > 0.26 ? 20 * Math.exp(-(t - 0.26) * 8) : 0, 26, 2);
    return { grain: 1, blur: t < 0.28 ? [0, 120 * k] : null, flash: t > 0.26 ? 0.25 * Math.exp(-(t - 0.26) * 14) : 0, push: { k: 1.02 + 0.02 * t, cx: 540 + sx, cy: 820 + sy } };
  }
  if (t < B) { // time-lapse underwater: the clock races, the pads prune
    const k = inv(A, B, t);
    waterWorld(t * 6, -200, { fast: true });
    const wr = E.inOutSine(inv(A + 0.35, B, t));
    openHand(540, 640, 2.6, Math.PI, t, { wr });
    bubbles(t * 4, 0.9, 1.5, 2);
    stopwatch(830, 300, 1.05, 10 * E.inOutSine(k), t);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.font = '900 48px Montserrat'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillStyle = Math.floor(t * 4) % 2 ? '#FFFFFF' : 'rgba(255,255,255,0.6)'; ctx.fillText('▶▶ 10 MIN', 80, 240); ctx.restore();
    return { grain: 1, push: { k: 1 + 0.06 * k, cx: 540, cy: 1000 } };
  }
  // the hand rises out of the water, palm to camera: look at those fingertips...
  const k = E.outCubic(inv(B, B + 0.7, t));
  const push = E.inOutSine(inv(B + 0.4, shot.end, t));
  screenSpace();
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#2A4C63'); bg.addColorStop(1, '#10283A');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  softDot(ctx, 200, 300, 700, '#FFB870', 0.18); softDot(ctx, 900, 500, 600, '#7FB4FF', 0.12);
  for (let i = 0; i < 10; i++) softDot(ctx, (i * 211) % W, (i * 337) % 1400, 90 + (i % 3) * 40, i % 2 ? '#FFD9A0' : '#9FD9F2', 0.10);
  const hs = lerp(2.0, 3.1, push);
  const hy = lerp(1850, 1120, k) + lerp(0, 380, push);
  openHand(540, hy, hs, 0, t, { wr: 1, wet: 1 });
  // drips off the fingertips
  for (let i = 0; i < 4; i++) {
    const [fx, fy] = fingerTip(540, hy, hs, 0, i, 0.98);
    const dk = ((t * 1.3 + i * 0.27) % 1);
    circle(ctx, fx, fy + 30 + dk * 400, 9, rgba('#DDF3FF', 0.9 * (1 - dk)));
  }
  // water surface at the bottom, the hand breaking through
  screenSpace();
  const wl = 1760;
  ctx.fillStyle = 'rgba(80,170,215,0.9)'; ctx.fillRect(0, wl, W, H - wl);
  line(ctx, 0, wl, W, wl, 6, 'rgba(230,250,255,0.8)');
  splashDrops(540, wl, B + 0.05, t, 30, 7, 0.6);
  return { grain: 1, blur: t < B + 0.25 ? [0, -140 * (1 - inv(B, B + 0.25, t))] : null, flash: t < B + 0.1 ? 0.3 : 0 };
};

// ================================================================= 2. "...raisins."
const POSE_LOOK = { hipY: -34, lean: 0.02, armL: { a: 1.0, b: -0.12 }, armR: { a: 0.42, b: 2.25 }, legL: { a: 2.25, b: -1.95 }, legR: { a: 2.25, b: -1.95 }, hand: 'open', feetFront: 1 };
SC.raisins = (lt, t, shot) => {
  const c = cu(), rz = c.raisins;
  const push = E.inOutSine(clamp(lt / (shot.end - shot.start)));
  const drop = t >= rz - 0.25 ? t - (rz - 0.25) : -1;
  const [shx, shy] = drop >= 0.25 ? shake(t, 16 * Math.exp(-(drop - 0.25) * 7), 26, 3) : [0, 0];
  const cam = { x: 580, y: lerp(1030, 1015, push), zoom: lerp(1.8, 1.95, push), rot: 0.01, sx: shx, sy: shy };
  const puzzled = { eyeOpen: 1.2, pupil: 0.85, lookX: 0.8, lookY: -0.2, browY: 0.9, browTilt: 0.8, mouth: 'wavy', mouthOpen: 0.3, blink: 0, cross: 0 };
  const deadpan = { eyeOpen: 0.75, pupil: 1, lookX: 0, lookY: 0, browY: -0.3, browTilt: -0.4, mouth: 'flat', mouthOpen: 0, blink: 0.42, cross: 0 };
  const face = lerpFace(puzzled, deadpan, E.inOutSine(inv(rz + 0.15, rz + 0.45, t)));
  const o = bathScene(cam, t, { pose: POSE_SOAK, face, armsOver: 'L', headRot: 0.05, duckX: 870 });
  const H_ = heldHands(cam, o.st, o.r, t, ['R'], {}, { dx: 250, dy: 30 }).R;
  // the raisin drops in beside the hand
  if (drop >= 0) {
    const fall = E.inCubic(clamp(drop / 0.25));
    const bounce = drop > 0.25 ? -60 * Math.exp(-(drop - 0.25) * 6) * Math.abs(Math.cos((drop - 0.25) * 14)) : 0;
    const tx = H_.x + 150, ty = H_.y - 250 * H_.s / 0.6;
    grapeRaisin(tx, lerp(-200, ty, fall) + bounce, 125, 1, t);
    if (drop > 0.25 && drop < 0.7) shockLines(tx, ty, 140, (drop - 0.25) / 0.45, 12, '#C8A8FF', 5);
    if (drop > 0.35) bigWord('=', H_.x - 10, ty + 20, 90, '#FFFFFF', E.outBack(clamp((drop - 0.35) / 0.2), 2) * 0);
  }
  return { grain: 1, flash: drop >= 0.25 ? 0.15 * Math.exp(-(drop - 0.25) * 12) : 0, blur: lt < 0.12 ? [0, 120 * (1 - lt / 0.12)] : null };
};

// ================================================================= 3. the myth: skin soaks up water, like a sponge
SC.myth = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const sp = c.sponge - 0.2;
  darkBg('#1B4A63', '#061420');
  bubbles(t, 0.4, 0.6, 3);
  if (t < sp) {
    const push = E.inOutSine(clamp(lt / (sp - shot.start)));
    const swell = E.inOutSine(inv(c.soaks, c.water1 + 0.6, t));
    fingertipMacro(540, 1060, 1.05 * (1 + 0.06 * swell) * lerp(1, 1.04, push), t, { wr: 0, drops: 0.6 });
    // water arrows sinking into the skin
    const a = ramp(t, c.soaks - 0.2, c.soaks + 0.1);
    for (let i = 0; i < 6; i++) {
      const k = ((t * 0.9 + i / 6) % 1), x = 260 + i * 110, y = 300 + k * 330;
      screenSpace();
      ctx.globalAlpha = a * Math.sin(Math.PI * k);
      line(ctx, x, y, x, y + 70, 12, '#7FE9FF');
      ctx.beginPath(); ctx.moveTo(x - 22, y + 58); ctx.lineTo(x, y + 90); ctx.lineTo(x + 22, y + 58); ctx.closePath(); ctx.fillStyle = '#7FE9FF'; ctx.fill();
      ctx.globalAlpha = 1;
    }
    pill(540, 240, 'THE OLD IDEA', '#FFD447', ramp(lt, 0.05, 0.3), 44);
    return { grain: 1, blur: lt < 0.14 ? [0, 120 * (1 - lt / 0.14)] : null, flash: lt < 0.1 ? 0.3 : 0 };
  }
  const k = inv(sp, sp + 0.3, t);
  sponge(540 + 500 * (1 - E.outBack(k, 1.4)), 860, 1.9, t, { swell: E.inOutSine(inv(sp + 0.2, shot.end, t)), drip: 1 });
  pill(540, 240, 'THE OLD IDEA', '#FFD447', 1, 44);
  return { grain: 1, blur: k < 1 ? [-160 * (1 - k), 0] : null };
};

// ================================================================= 4. "[chuckles] Nope."
SC.nope = (lt, t, shot) => {
  const c = cu(), nt = c.nope;
  darkBg('#1B4A63', '#061420');
  const wob = t < nt ? 0.12 * Math.sin(t * 22) * inv(shot.start, shot.start + 0.3, t) : 0;
  const hit = t >= nt - 0.04 ? t - (nt - 0.04) : -1;
  const sq = hit >= 0 ? E.outBack(clamp(hit / 0.2), 2) : 0;
  const [sx, sy] = hit >= 0 ? shake(t, 30 * Math.exp(-hit * 6), 28, 5) : [0, 0];
  ctx.save();
  sponge(540 + sx, 860 + sy + 40 * sq, 1.9, t, { swell: 1 - sq, squish: 0.6 * sq + wob, drip: 1 - sq });
  ctx.restore();
  bigX(540 + sx, 860 + sy, 1.2, hit >= 0 ? hit / 0.18 : 0);
  pill(540, 240, 'THE OLD IDEA', '#FFD447', 1 - ramp(t, nt, nt + 0.3), 44);
  return { grain: 1, flash: hit >= 0 ? 0.3 * Math.exp(-hit * 12) : 0, tint: '#FF2A3A', tintA: hit >= 0 ? 0.12 * Math.exp(-hit * 3) : 0 };
};

// ================================================================= 5. "Your body does it... on purpose."
SC.purpose = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const push = E.inOutSine(clamp(lt / D));
  const cam = { x: lerp(600, 610, push), y: lerp(985, 975, push), zoom: lerp(2.1, 2.45, push), rot: -0.01 };
  const sus = { eyeOpen: 0.85, pupil: 0.9, lookX: 0.7, lookY: 0.2, browY: 0.2, browTilt: 0.9, mouth: 'flat', mouthOpen: 0.1, blink: 0.35, cross: 0 };
  const wide = { eyeOpen: 1.3, pupil: 0.6, lookX: 0.2, lookY: 0, browY: 1.3, browTilt: 0.3, mouth: 'o', mouthOpen: 0.5, blink: 0, cross: 0 };
  const face = lerpFace(sus, wide, E.outBack(inv(c.purpose - 0.05, c.purpose + 0.2, t), 1.4));
  const o = bathScene(cam, t, { pose: POSE_SOAK, face, armsOver: 'L', steam: 0.6 });
  heldHands(cam, o.st, o.r, t, ['R'], { glow: { fingers: [0, 1, 2, 3], col: '#FFD447', a: 0.9 * ramp(t, c.purpose - 0.1, c.purpose + 0.25) } }, { dx: 245, dy: 60 });
  neonWord('ON PURPOSE', 540, 330, 150, '#FFD447', ramp(t, c.purpose - 0.05, c.purpose + 0.35), t);
  return { grain: 1, blur: lt < 0.12 ? [140 * (1 - lt / 0.12), 0] : null };
};

// camera inside the cutaway: keyframes [t, focusX, focusY, scale] in section-local coords -> drawSection(x, y, s)
// keys: [t, focusX, focusY, scale, screenY] — the focus point lands at (540, screenY)
function sectionCam(t, keys) {
  let k = keys[0];
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1], b = keys[i];
    if (t >= b[0]) { k = b; continue; }
    if (t > a[0]) { const u = E.inOutCubic(inv(a[0], b[0], t)); k = [t, ...[1, 2, 3, 4].map((j) => lerp(a[j], b[j], u))]; }
    break;
  }
  const [, fx, fy, sc, sy] = k;
  return { x: 540 - fx * sc, y: sy - fy * sc, s: sc };
}

// ================================================================= 6. inside the fingertip: pores, nerves, vessels
SC.pores = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#0E2638', '#03080E');
  const enter = E.outCubic(clamp(lt / 0.45));
  const V = sectionCam(t, [[shot.start, 0, 200, 1.6, 800], [shot.start + 0.45, 0, 200, 0.98, 800], [c.sweat - 0.3, 0, 200, 0.98, 800],
    [c.pores + 0.1, 40, 40, 1.4, 700], [c.nerves - 0.2, 40, 40, 1.4, 700], [c.nerves + 0.45, -140, 400, 1.25, 1000],
    [c.vessels - 0.35, -140, 400, 1.25, 1000], [c.vessels + 0.3, 100, 260, 1.45, 900], [c.squeeze + 0.3, 110, 260, 1.55, 900]]);
  const o = {
    water: ramp(t, c.seeps - 0.1, c.pores + 0.2),
    sense: inv(c.nerves - 0.05, c.notice + 0.7, t),
    cmd: inv(c.tell - 0.05, c.fingertips + 0.3, t),
    squeeze: E.inOutSine(inv(c.squeeze - 0.1, c.squeeze + 0.6, t)),
    labels: { pore: ramp(t, c.sweat - 0.1, c.sweat + 0.15), nerve: ramp(t, c.nerves - 0.1, c.nerves + 0.15), vessel: ramp(t, c.vessels - 0.1, c.vessels + 0.15) },
  };
  drawSection(V.x, V.y, V.s, t, o);
  // where the nerve leads: off to the spinal cord and back
  const arrowA = ramp(t, c.nerves, c.nerves + 0.3) * (1 - ramp(t, c.squeeze, c.squeeze + 0.4));
  if (arrowA > 0) {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = arrowA;
    ctx.font = '800 30px Montserrat'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFE27A';
    ctx.fillText('to spinal cord & back', 60, 1180); ctx.restore();
  }
  if (o.squeeze > 0.05) pill(540, 190, 'SQUEEZE!', '#FF7A86', o.squeeze, 50);
  return { grain: 1, zblur: -0.25 * (1 - enter), zcx: 540, zcy: 700, flash: lt < 0.12 ? 0.35 * (1 - lt / 0.12) : 0 };
};

// ================================================================= 7. less volume -> the skin buckles
SC.buckle = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#0E2638', '#03080E');
  const push = E.inOutSine(clamp(lt / D));
  const shrink = E.inOutSine(inv(c.less - 0.1, c.volume + 0.6, t));
  const buckle = E.inOutSine(inv(c.skin2 - 0.2, c.buckles + 0.5, t));
  const V = sectionCam(t, [[shot.start, 110, 260, 1.55, 900], [shot.start + 0.6, 0, 230, 1.0, 800], [c.skin2 - 0.3, 0, 230, 1.0, 800], [c.buckles + 0.1, 0, 60, 1.35, 720]]);
  drawSection(V.x, V.y, V.s, t, {
    water: 1, squeeze: 1, shrink, buckle, flow: 0.4, anchors: 0.5 + 0.5 * ramp(t, c.skin2 - 0.2, c.skin2 + 0.2),
    labels: { anchor: ramp(t, c.skin2 - 0.1, c.skin2 + 0.2) },
  });
  // volume gauge
  const gv = 1 - 0.35 * shrink;
  screenSpace();
  rrect(ctx, 290, 150, 500, 70, 24); ctx.fillStyle = 'rgba(6,14,30,0.9)'; ctx.fill();
  rrect(ctx, 480, 166, 290 * gv, 38, 16); ctx.fillStyle = mixHex('#FF7A86', '#8FB8FF', shrink); ctx.fill();
  ctx.font = '900 34px Montserrat'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFFFFF'; ctx.fillText('VOLUME', 312, 186);
  if (buckle > 0.5) pill(540, 1135, 'BUCKLE!', '#FFD447', (buckle - 0.5) * 2, 50);
  return { grain: 1 };
};

// ================================================================= 8. grape -> raisin
SC.grape = (lt, t, shot) => {
  const c = cu();
  darkBg('#2A1E46', '#07040F');
  screenSpace(); softDot(ctx, 540, 820, 600, '#FFE6B8', 0.12);
  const k = E.inOutCubic(inv(c.raisin2 - 0.05, c.raisin2 + 0.35, t));
  const pop = E.outBack(clamp(lt / 0.2), 2);
  ctx.save(); ctx.translate(540, 820); ctx.rotate(0.07 * Math.sin(t * 2.4) * k); ctx.translate(-540, -820);
  grapeRaisin(540, 820 + 10 * Math.sin(t * 3.1), 260 * pop * (1 + 0.03 * Math.sin(t * 5) * k), k, t);
  ctx.restore();
  ellipse(ctx, 540, 1110 - 60 * k, 220 * (1 - 0.35 * k), 34, 'rgba(0,0,0,0.35)');
  if (k > 0.02 && k < 0.99) shockLines(540, 820, 230, k, 14, '#C8A8FF', 7);
  return { grain: 1, flash: lt < 0.1 ? 0.3 : 0, push: { k: 1 + 0.05 * (lt / (shot.end - shot.start)), cx: 540, cy: 820 } };
};

// ================================================================= 9. proof: damaged nerve, no wrinkles (+ the nerve test)
SC.proof = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  waterWorld(t, -200);
  bubbles(t, 0.5, 0.8, 5);
  const slide = E.inOutCubic(inv(c.doctors - 0.2, c.doctors + 0.3, t));
  const hx = lerp(540, 330, slide), hs = lerp(2.2, 1.55, slide), hy = lerp(1050, 1120, slide);
  const glowA = ramp(t, c.damaged - 0.1, c.damaged + 0.3);
  const wr = E.inOutSine(inv(c.dont - 0.3, c.dont + 0.6, t));
  openHand(hx, hy, hs, 0, t, { wr, dead: 0, shine: ramp(t, c.dont, c.dont + 0.4), glow: { fingers: [1, 2, 3], col: '#FFD447', a: 0.9 * glowA } });
  // the damaged nerve: a broken, dim line with a red cut
  if (glowA > 0) {
    const [ax, ay] = fingerTip(hx, hy, hs, 0, 0, 0.1), [bx, by] = fingerTip(hx, hy, hs, 0, 0, 0.9);
    screenSpace(); ctx.setLineDash([14, 14]); line(ctx, ax, ay, bx, by, 6, rgba('#8A8FA8', glowA)); ctx.setLineDash([]);
    const mx = (ax + bx) / 2, my = (ay + by) / 2;
    line(ctx, mx - 22, my - 22, mx + 22, my + 22, 9, rgba('#FF3A4A', glowA)); line(ctx, mx - 22, my + 22, mx + 22, my - 22, 9, rgba('#FF3A4A', glowA));
    pill(hx - 20 * hs, 380, 'DAMAGED NERVE', '#FF5A6E', glowA * (1 - slide), 40);
  }
  if (wr > 0.5 && slide < 0.5) {
    const [px, py] = fingerTip(hx, hy, hs, 0, 0, 1.08);
    pill(px, py - 60, 'SMOOTH!', '#7FE9FF', (wr - 0.5) * 2 * (1 - slide * 2), 38);
  }
  // "how do we know?" magnifier
  const mk = ramp(t, c.know - 0.4, c.know - 0.1) * (1 - ramp(t, c.damaged - 0.2, c.damaged));
  if (mk > 0) {
    screenSpace(); ctx.globalAlpha = mk;
    const mx = 540 + 160 * Math.sin(t * 2.5), my = 700 + 60 * Math.cos(t * 3);
    ctx.beginPath(); ctx.arc(mx, my, 110, 0, 7); ctx.lineWidth = 18; ctx.strokeStyle = '#E8EEF5'; ctx.stroke();
    ctx.fillStyle = 'rgba(200,240,255,0.15)'; ctx.fill();
    line(ctx, mx + 78, my + 78, mx + 180, my + 180, 26, '#8A5A3A');
    ctx.globalAlpha = 1;
  }
  clipboard(790, 820, ramp(t, c.doctors - 0.1, c.doctors + 0.2), t,
    [['INDEX', false, c.doctors + 0.35], ['MIDDLE', true, c.doctors + 0.55], ['RING', true, c.doctors + 0.75], ['PINKY', true, c.doctors + 0.95]]);
  return { grain: 1, flash: lt < 0.1 ? 0.3 : 0, push: { k: 1 + 0.04 * (lt / D), cx: 540, cy: 900 } };
};

// ================================================================= 10. why? grip — tire treads, water pushed out
SC.grip = (lt, t, shot) => {
  const c = cu();
  const tA = c.idea - 0.15, tB = c.wrinkles - 0.1;
  if (t < tA) { // "So why bother?" — a shrug in the tub
    const shrug = E.inOutSine(inv(c.bother - 0.3, c.bother + 0.2, t));
    const cam = { x: 540, y: 900, zoom: 1.65, rot: 0 };
    const face = lerpFace(FACES.calm, { eyeOpen: 1, pupil: 1, lookX: 0, lookY: -0.4, browY: 1.1, browTilt: -0.3, mouth: 'flat', mouthOpen: 0.2, blink: 0, cross: 0 }, shrug);
    const pose = lerpPose(POSE_TUB, { hipY: -30, lean: 0, armL: { a: 1.3, b: 1.2 }, armR: { a: 1.3, b: 1.2 }, legL: { a: 2.25, b: -1.95 }, legR: { a: 2.25, b: -1.95 }, hand: 'open', feetFront: 1 }, shrug);
    bathScene(cam, t, { pose, face, armsOver: shrug > 0.3 ? '' : 'LR', bodyDY: -12 * shrug });
    bigWord('?', 820, 560, 200, '#7FE9FF', E.outBack(inv(c.bother, c.bother + 0.25, t), 2), 0.15);
    return { grain: 1, blur: lt < 0.12 ? [0, 120 * (1 - lt / 0.12)] : null };
  }
  if (t < tB) { // tires on a wet road: slick hydroplanes, treads grip
    screenSpace();
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0B1426'); g.addColorStop(1, '#1C2A44');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 90; i++) { // rain
      const x = (hash(i) * W + t * 60) % W, y = (hash(i + 5) * H + t * 1800) % H;
      line(ctx, x, y, x - 6, y + 40, 2, 'rgba(180,210,255,0.35)');
    }
    for (const [yy, kind, lab, col] of [[560, 'slick', 'SMOOTH', '#FF7A86'], [1150, 'tread', 'TREADS', '#4DFFB4']]) {
      rrect(ctx, -20, yy + 215, W + 40, 60, 0); ctx.fillStyle = '#2A2E3A'; ctx.fill();
      line(ctx, 0, yy + 217, W, yy + 217, 4, 'rgba(160,200,255,0.5)');
      const slideX = kind === 'slick' ? 70 * Math.sin(t * 3) : 0;
      tire(540 + slideX, yy, 215, kind, t, -t * 8);
      pill(540, yy - 290, lab, col, ramp(t, tA + (kind === 'tread' ? 0.4 : 0.1), tA + (kind === 'tread' ? 0.6 : 0.3)), 44);
      if (kind === 'slick') bigWord('WHOA', 880, yy - 150, 80, '#FF7A86', ramp(t, tA + 0.3, tA + 0.5) * (0.9 + 0.1 * Math.sin(t * 20)), 0.2);
    }
    return { grain: 1, flash: t - tA < 0.1 ? 0.3 : 0 };
  }
  // the fingertip pressed on wet glass: water drains along the wrinkle valleys
  const k = inv(tB, shot.end, t);
  screenSpace();
  ctx.fillStyle = '#10283A'; ctx.fillRect(0, 0, W, H);
  fingertipMacro(540, 1080, 1.1 * lerp(1, 1.05, k), t, { wr: 1, ridges: 0.7 });
  screenSpace();
  ctx.fillStyle = 'rgba(160,220,255,0.10)'; ctx.fillRect(0, 0, W, H); // the glass
  const flowA = ramp(t, c.pushing - 0.3, c.pushing);
  for (const P of MACRO.prim) {
    const Q = P.map(([px, py]) => [540 + px * 1.1, 1080 + py * 0.97 * 1.1]);
    const acc = polyLen(Q), L = acc[acc.length - 1];
    for (let i = 0; i < 5; i++) {
      const sdist = ((t * 320 + i * L / 5) % L);
      const dir = Q[0][0] < 540 ? 1 : 1;
      const [px, py] = polyAt(Q, acc, sdist * dir);
      circle(ctx, px, py, 9, rgba('#7FE9FF', flowA)); softDot(gctx, px, py, 30, '#3FA2FF', flowA);
    }
  }
  for (const side of [-1, 1]) { // squeezed out at the edges
    for (let i = 0; i < 6; i++) {
      const kk = ((t * 1.2 + i / 6) % 1);
      circle(ctx, 540 + side * (380 + kk * 180), 700 + i * 90 + 20 * Math.sin(t * 3 + i), 10 * (1 - kk), rgba('#BFE6FF', flowA * (1 - kk)));
    }
  }
  pill(540, 240, 'WATER OUT, GRIP IN', '#7FE9FF', flowA, 44);
  return { grain: 1, flash: t - tB < 0.1 ? 0.3 : 0 };
};

// ================================================================= 11. "Some studies say it helps... another says, meh. Science."
SC.meh = (lt, t, shot) => {
  const c = cu();
  const tS = c.sigh - 0.25;
  if (t < tS) {
    darkBg('#2A3450', '#070A14');
    card(300, 760, ramp(t, c.helps - 0.35, c.helps - 0.1), ['STUDY A', 'wet marbles, 2013'], 'HELPS', '#18A56B', t, -0.06, 1.25);
    card(785, 820, ramp(t, c.another - 0.1, c.another + 0.15), ['STUDY B', 'wet objects, 2014'], 'MEH', '#E07A1F', t, 0.07, 1.25);
    if (t > c.meh) shockLines(810, 1030, 230, (t - c.meh) / 0.4, 10, '#FF9A3C', 9);
    return { grain: 1, flash: lt < 0.1 ? 0.3 : 0, push: { k: 1 + 0.05 * inv(shot.start, tS, t), cx: 540, cy: 840 } };
  }
  // the soap shoots out of his wrinkly hand and bonks the duck
  const k = t - tS;
  const cam = { x: 600, y: 960, zoom: 1.45, rot: 0 };
  const shoot = inv(0.25, 0.85, k);
  const bonkT = 0.85;
  const sx = lerp(330, 820, E.inOutSine(shoot)), sy = lerp(1060, 1060, shoot) - 380 * Math.sin(Math.PI * shoot);
  const bonk = k > bonkT ? Math.exp(-(k - bonkT) * 1.2) : 0;
  const face = k < bonkT ? lerpFace(FACES.calm, FACES.shock, clamp((k - 0.25) / 0.1)) : lerpFace(FACES.shock, { eyeOpen: 0.8, pupil: 1, lookX: 0.8, lookY: 0, browY: 0.2, browTilt: -0.5, mouth: 'flat', mouthOpen: 0, blink: 0.4, cross: 0 }, clamp((k - bonkT) / 0.3));
  bathScene(cam, t, { face, armsOver: 'LR', soap: false, soapPos: k < 0.25 ? [330, 1080, 0] : [sx, sy, k * 12], bonk, duckRot: bonk > 0 ? 0.3 * Math.sin((k - bonkT) * 20) * bonk : 0 });
  if (k > bonkT && k < bonkT + 0.5) shockLines(...toScreen(cam, 820, 1080), 120, (k - bonkT) / 0.5, 10, '#FFD447', 3);
  if (bonk > 0) { // orbiting stars over the dizzy duck
    const [dx, dy] = toScreen(cam, 790, 1020);
    for (let i = 0; i < 3; i++) {
      const a = t * 6 + i * 2.1;
      bigWord('✦', dx + Math.cos(a) * 60, dy - 110 + Math.sin(a) * 18, 40, '#FFD447', bonk);
    }
  }
  return { grain: 1, flash: k < 0.1 ? 0.25 : 0 };
};

// ================================================================= 12. the same pattern, every time
SC.pattern = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  screenSpace(); ctx.fillStyle = '#081624'; ctx.fillRect(0, 0, W, H);
  // soak cycles: #1 (captured), dry, #2 (match), then quick repeats
  const cap = c.found, dry0 = c.back - 0.25, wet2 = c.back + 0.15, match = c.exact;
  let wr = 1;
  if (t > dry0) wr = 1 - E.inOutSine(inv(dry0, dry0 + 0.35, t));
  if (t > wet2) wr = E.inOutSine(inv(wet2, wet2 + 0.45, t));
  const rep = [c.every - 0.1, c.every + 0.25, c.time + 0.2, c.time + 0.55];
  let soakN = t < wet2 ? 1 : 2;
  rep.forEach((rt, i) => { if (t > rt) { soakN = 3 + i; wr = 0.2 + 0.8 * E.outCubic(inv(rt, rt + 0.2, t)); } });
  const s = 1.05 * lerp(1, 1.04, lt / D);
  fingertipMacro(540, 1120, s, t, { wr, ridges: 0.8 });
  // scanner sweep while capturing / matching
  const scanA = ramp(t, cap - 0.3, cap) * (1 - ramp(t, cap + 0.9, cap + 1.1)) + ramp(t, match - 0.4, match - 0.1) * (1 - ramp(t, match + 1.0, match + 1.2));
  if (scanA > 0) {
    screenSpace();
    const sy = 500 + ((t * 700) % 1100);
    line(ctx, 60, sy, W - 60, sy, 6, rgba('#4DFFB4', 0.9 * scanA)); softDot(gctx, 540, sy, 300, '#4DFFB4', 0.5 * scanA);
    ctx.fillStyle = rgba('#4DFFB4', 0.08 * scanA); ctx.fillRect(60, sy - 120, W - 120, 120);
  }
  // the stored soak-#1 trace, overlaid on the new wrinkles when they return
  const traceA = ramp(t, match - 0.1, match + 0.3);
  macroOutline(540, 1120, s, '#4DFFB4', 0.85 * traceA * (0.8 + 0.2 * Math.sin(t * 8)), 5);
  // thumbnail of soak #1 in the corner once captured
  const thA = ramp(t, cap + 0.3, cap + 0.6);
  if (thA > 0) {
    screenSpace(); ctx.globalAlpha = thA;
    rrect(ctx, 64, 250, 200, 250, 20); ctx.fillStyle = 'rgba(6,14,30,0.92)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#4DFFB4'; ctx.stroke();
    ctx.save(); ctx.beginPath(); rrect(ctx, 64, 250, 200, 250, 20); ctx.clip();
    for (const P of [...MACRO.prim, ...MACRO.sec]) { smoothPath(ctx, P.map(([px, py]) => [164 + px * 0.28, 440 + py * 0.28])); ctx.lineWidth = 3; ctx.strokeStyle = '#4DFFB4'; ctx.stroke(); }
    ctx.restore();
    ctx.font = '900 26px Montserrat'; ctx.textAlign = 'center'; ctx.fillStyle = '#4DFFB4'; ctx.fillText('SOAK #1', 164, 285);
    ctx.globalAlpha = 1;
  }
  // soak counter
  pill(830, 300, `SOAK #${soakN}`, '#7FE9FF', ramp(lt, 0.1, 0.35), 40);
  scanReadout(540, 520, ramp(t, match + 0.3, match + 0.5), 'PATTERN MATCH', `${Math.round(100 * ramp(t, match + 0.3, match + 0.9))}%`, '#4DFFB4');
  if (t > c.every) for (let i = 0; i < Math.min(4, rep.filter((rt) => t > rt).length); i++) bigWord('✓', 340 + i * 130, 700, 90, '#4DFFB4', E.outBack(clamp((t - rep[i]) / 0.2), 2));
  return { grain: 1, flash: lt < 0.1 ? 0.3 : 0 };
};

// ================================================================= 13. snow tires (and back into the water)
const POSE_HANDSUP = { hipY: -34, lean: 0, armL: { a: 0.42, b: 2.25 }, armR: { a: 0.42, b: 2.25 }, legL: { a: 2.25, b: -1.95 }, legR: { a: 2.25, b: -1.95 }, hand: 'open', feetFront: 1 };
SC.final = (lt, t, shot) => {
  const c = cu();
  const dive = c.dive_back;
  if (t >= dive - 0.35) { // the hand dives back in -> loops to the opening splash
    const k = inv(dive - 0.35, shot.end, t);
    const wl = 820;
    waterWorld(t, wl);
    const hy = lerp(-300, 1300, E.inCubic(clamp(k * 1.6)));
    openHand(540, hy, 1.9, Math.PI, t, { wr: 1 });
    screenSpace(); ctx.fillStyle = 'rgba(40,140,190,0.35)'; ctx.fillRect(0, wl, W, H - wl);
    splashDrops(540, wl, dive + 0.02, t, 46, 11);
    return { grain: 1, noCaptions: t > c.tires_end + 0.2, blur: [0, 120], flash: t > dive ? 0.25 * Math.exp(-(t - dive) * 12) : 0 };
  }
  const push = E.inOutSine(inv(c.thats - 0.2, c.snow + 0.3, t));
  const snowK = E.inOutSine(inv(c.snow - 0.3, c.snow + 0.4, t));
  const cam = { x: lerp(540, 690, snowK), y: lerp(lerp(1020, 990, push), 930, snowK), zoom: lerp(1.75, 2.05, push) * lerp(1, 1.3, snowK), rot: 0 };
  const grin = ramp(t, c.chuckle2, c.chuckle2 + 0.3);
  const face = lerpFace({ eyeOpen: 1.1, pupil: 1, lookX: 0, lookY: -0.2, browY: 0.8, browTilt: 0.4, mouth: 'wavy', mouthOpen: 0.3, blink: 0, cross: 0 }, FACES.grin, grin);
  const o = bathScene(cam, t, { pose: POSE_SOAK2, face, armsOver: '', steam: 0.8 });
  const treads = E.outBack(inv(c.snow - 0.1, c.snow + 0.25, t), 1.6);
  const HH = heldHands(cam, o.st, o.r, t, ['L', 'R'], { treads: clamp(treads) }, { dx: 250, dy: 40, bob: true });
  for (const k of ['L', 'R']) {
    const h = HH[k];
    if (t > c.raisin3 - 0.1 && t < c.thats + 0.1) grapeRaisin(h.x, h.y - 430 * h.s / 0.6 - 16 * Math.sin(t * 5), 72 * E.outBack(inv(c.raisin3 - 0.1, c.raisin3 + 0.15, t), 2) * (1 - ramp(t, c.thats - 0.1, c.thats + 0.1)), 1, t);
  }
  if (treads > 0) snowflakes(t, clamp(treads));
  return { grain: 1, flash: t > c.snow ? 0.18 * Math.exp(-(t - c.snow) * 10) : 0 };
};

function initScenes2() {
  initBath(); initHands(); initInside();
}
