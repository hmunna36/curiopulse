// His head in section, in profile facing right (tickle-yourself). The outline and brain come from sun-sneeze's
// sneezehead.js (brain-freeze's head). What it shows: the motor strip at the top of the brain sending an ORDER down the
// spinal cord to his arm; a COPY of that order branching back to the cerebellum (the little brain at the back,
// bottom); the cerebellum's forecast (a thought bubble with the touch it expects); the TOUCH signal coming back from his
// chin up to the brain, through a volume knob the forecast turns down. And a touch from outside, unforecast, that lights
// everything up. Section coords: head centre near (0, 0), about 700 units tall.
'use strict';

const BH = {
  outline: [[-250, -60], [-236, -220], [-130, -328], [40, -346], [182, -290], [250, -190], [268, -112], [258, -72],
    [296, -12], [346, 58], [302, 82], [314, 110], [298, 128], [314, 148], [298, 178], [292, 222], [240, 252], [120, 252],
    [64, 300], [62, 470], [-170, 470], [-172, 262], [-232, 120], [-250, -60]],
  brain: [[-222, -120], [-205, -235], [-110, -306], [40, -318], [150, -272], [196, -190], [178, -120], [122, -86],
    [30, -72], [-70, -68], [-150, -52], [-212, -78], [-222, -120]],
  stem: [[-94, -68], [-40, -66], [-27, 10], [-36, 200], [-46, 452], [-66, 452], [-72, 200], [-78, 10]],
  order: [[-6, -292], [-26, -220], [-50, -140], [-58, -70], [-54, 20], [-52, 160], [-56, 320], [-58, 470], [-40, 620], [60, 720]],
  copy: [[-56, -40], [-92, -38], [-128, -26], [-158, -12]],
  touch: [[262, 236], [190, 214], [110, 170], [40, 110], [-20, 40], [-38, -40], [-30, -140], [-40, -230]],
  cereb: [-160, -10], motor: [-6, -292], sense: [-40, -236], chin: [262, 238], knob: [-34, -150],
};
let BH_GYRI = null, BH_D = null;

function initBrainHead() {
  const rng = mulberry32(12);
  BH_GYRI = [...Array(22)].map(() => {
    const x = -180 + rng() * 320, y = -280 + rng() * 180, L = 30 + rng() * 56, a = rng() * 6.28;
    return [[x, y], [x + Math.cos(a) * L * 0.5 + 10, y + Math.sin(a) * L * 0.5 - 8], [x + Math.cos(a) * L, y + Math.sin(a) * L]];
  });
  BH_D = { order: bhDense(BH.order), copy: bhDense(BH.copy), touch: bhDense(BH.touch) };
}
// Catmull-Rom through the points, as a dense polyline
function bhDense(P) {
  const pts = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    for (let u = 0; u < 0.999; u += 0.1) {
      const u2 = u * u, u3 = u2 * u, f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
      pts.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  pts.push(P[P.length - 1]);
  return { pts, acc: polyLen(pts) };
}
function bhAt(D, u) { return polyAt(D.pts, D.acc, D.acc[D.acc.length - 1] * clamp(u)); }
function bhPart(D, u0, u1) {
  const L = D.acc[D.acc.length - 1], out = [];
  for (let s = L * clamp(u0); s <= L * clamp(u1) + 0.01; s += 5) { const q = polyAt(D.pts, D.acc, s); out.push([q[0], q[1]]); }
  return out;
}
// camera: keys [t, focusX, focusY, scale, screenX, screenY] -> {x, y, s} (section point (fx, fy) lands at (sx, sy))
function bhCam(t, keys) {
  let k = keys[0];
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1], b = keys[i];
    if (t >= b[0]) { k = b; continue; }
    if (t > a[0]) { const u = E.inOutCubic(inv(a[0], b[0], t)); k = [t, ...[1, 2, 3, 4, 5].map((j) => lerp(a[j], b[j], u))]; }
    break;
  }
  const [, fx, fy, sc, sx, sy] = k;
  return { x: sx - fx * sc, y: sy - fy * sc, s: sc };
}
function bhSet(c, cam, k) { c.setTransform(cam.s * k, 0, 0, cam.s * k, cam.x * k, cam.y * k); }
function bhScreen(cam, p) { return [cam.x + p[0] * cam.s, cam.y + p[1] * cam.s]; }
function bhPath(c, P) { smoothPath(c, P); c.closePath(); }
// a nerve cord, drawn on up to `show`, glowing with `hi`
function bhNerve(D, show, hi, col, w, u0 = 0) {
  if (show <= u0 + 0.001) return;
  const P = bhPart(D, u0, show);
  if (P.length < 2) return;
  poly(ctx, P, w + 5, 'rgba(20,6,16,0.7)'); poly(ctx, P, w, rgba(col, 0.45 + 0.55 * hi)); poly(ctx, P, w * 0.36, rgba('#FFFFFF', 0.2 + 0.5 * hi));
  poly(gctx, P, w + 10, rgba(col, 0.15 + 0.6 * hi));
}
// a signal bead with a tail at fraction u
function bhPulse(D, u, col, a = 1, r = 10) {
  if (a <= 0.01 || u < 0 || u > 1) return;
  const q = bhAt(D, u), tail = bhPart(D, Math.max(0, u - 0.1), u);
  if (tail.length > 1) { poly(ctx, tail, r * 0.9, rgba('#FFFFFF', 0.55 * a)); poly(gctx, tail, r * 2.4, rgba(col, 0.85 * a)); }
  circle(ctx, q[0], q[1], r, rgba('#FFFFFF', a)); softDot(gctx, q[0], q[1], r * 5, col, a);
}

// the forecast bubble (section coords; it hangs left of the head, over the back of the skull). k = pop-in.
// shows a little chin with a feather on it and a clock: the touch the cerebellum expects, and when.
function bhForecast(t, k, o = {}) {
  if (k <= 0) return;
  const c = ctx, s = E.outBack(clamp(k), 1.6);
  const bx = -560, by = -300;
  // the trail of small bubbles from the cerebellum
  for (const [px, py, r] of [[-215, -50, 16], [-270, -90, 26], [-330, -140, 36]]) { circle(c, px, py, r * s, '#F4F6FF'); }
  c.save(); c.translate(bx, by); c.scale(s * 1.45, s * 1.45);
  ellipse(c, 0, 0, 200, 150, '#F4F6FF');
  for (let i = 0; i < 9; i++) { const a = (i / 9) * 6.28; circle(c, Math.cos(a) * 178, Math.sin(a) * 124, 52, '#F4F6FF'); }
  // the expected touch: a chin (profile) with the feather on it
  c.save(); c.translate(-30, 20);
  c.beginPath(); c.moveTo(-120, -90); c.quadraticCurveTo(-40, -100, 10, -40); c.quadraticCurveTo(30, 0, 10, 30); c.quadraticCurveTo(-20, 70, -120, 70); c.closePath();
  c.fillStyle = PAL.skin; c.fill(); c.lineWidth = 5; c.strokeStyle = PAL.skinSh; c.stroke();
  feather(c, 120, 60, 130, Math.PI + 0.45 + 0.12 * Math.sin(t * 6), t, { flutter: 0.6 });
  c.restore();
  // a dashed "expected" frame + the clock
  c.setLineDash([12, 10]); c.lineWidth = 5; c.strokeStyle = 'rgba(60,70,120,0.6)'; c.strokeRect(-170, -110, 260, 210); c.setLineDash([]);
  circle(c, 140, -40, 40, '#1C2148'); circle(c, 140, -40, 33, '#FFFFFF');
  line(c, 140, -40, 140, -66, 5, '#1C2148'); line(c, 140, -40, 140 + 18 * Math.cos(t * 3), -40 + 18 * Math.sin(t * 3), 4, '#E2424B');
  c.font = '900 30px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#2A3060';
  c.fillText(o.label || 'EXPECTED', 140, 40);
  c.restore();
}

// the volume knob on the touch path (section coords): level 1 = full, 0 = muted
function bhKnob(t, k, level) {
  if (k <= 0) return;
  const c = ctx, [x, y] = BH.knob, s = E.outBack(clamp(k), 1.8);
  c.save(); c.translate(x + 120, y + 10); c.scale(s, s);
  rrect(c, -70, -60, 140, 120, 22); c.fillStyle = '#141838'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#7FE9FF'; c.stroke();
  circle(c, -12, 4, 34, '#2A3060'); circle(c, -12, 4, 28, '#454C88');
  const a = lerp(-2.4, 0.9, level);
  line(c, -12, 4, -12 + Math.cos(a) * 24, 4 + Math.sin(a) * 24, 7, '#FFD447');
  for (let i = 0; i < 4; i++) { const on = level > (i + 0.5) / 4; rrect(c, 34, 30 - i * 20, 22, 14, 4); c.fillStyle = on ? (i > 2 ? '#FF5A6E' : '#4DFFB4') : '#2A3060'; c.fill(); }
  c.restore();
  softDot(gctx, x + 120, y + 10, 90, '#7FE9FF', 0.25 * clamp(k));
}

// o: {order: 0..1 the order signal's run, copy: 0..1, touchRun: 0..1, touchHi: brightness of the arriving touch,
//  forecast: 0..1, knob: 0..1 (shown), level: 0..1, cerebHi, motorHi, senseHi: glow of the cortex when the touch lands,
//  hand: 0..1 hand + feather at the chin (or 'pip' for an outside hand), nerves: draw-on 0..1}
function brainHead(cam, t, o = {}) {
  const c = ctx;
  bhSet(c, cam, 1); bhSet(gctx, cam, 0.5);
  // skin silhouette + the inside
  bhPath(c, BH.outline);
  const sk = c.createLinearGradient(-250, 0, 350, 0); sk.addColorStop(0, '#26122E'); sk.addColorStop(1, '#3A1A3A');
  c.fillStyle = sk; c.fill();
  c.lineWidth = 16; c.strokeStyle = PAL.skin; c.stroke(); c.lineWidth = 5; c.strokeStyle = PAL.skinHi; c.stroke();
  bhPath(gctx, BH.outline); gctx.lineWidth = 14; gctx.strokeStyle = 'rgba(255,170,130,0.25)'; gctx.stroke();
  // hair, ear, brow, eye (it's him)
  c.beginPath(); c.moveTo(-252, -40); c.quadraticCurveTo(-280, -300, -60, -372); c.quadraticCurveTo(150, -392, 236, -230);
  c.quadraticCurveTo(170, -270, 90, -300); c.quadraticCurveTo(-60, -300, -150, -210); c.quadraticCurveTo(-210, -130, -222, -30); c.closePath();
  c.fillStyle = PAL.hair; c.fill(); line(c, -120, -318, 20, -352, 7, PAL.hairHi);
  ellipse(c, -150, 40, 30, 44, PAL.skinSh); ellipse(c, -150, 40, 16, 28, '#B8704F');
  line(c, 214, -112, 262, -106, 10, PAL.hair);
  circle(c, 228, -70, 26, '#F3F6FF'); circle(c, 238, -70, 12, PAL.pupil); circle(c, 234, -74, 4, '#FFFFFF');
  if (o.blinkShut) line(c, 202, -70, 254, -70, 9, PAL.skin);
  // mouth line
  c.beginPath(); c.moveTo(254, 150); c.quadraticCurveTo(280, 156, 300, 150); c.lineWidth = 6; c.strokeStyle = PAL.mouth; c.stroke();
  // brainstem, cerebellum, brain
  bhPath(c, BH.stem); c.fillStyle = '#7A4278'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#C890BC'; c.stroke();
  const ch = o.cerebHi || 0, [cx0, cy0] = BH.cereb;
  ellipse(c, cx0, cy0, 66, 44, mixHex('#9A4F8C', '#7FE9FF', 0.55 * ch), -0.2);
  for (let i = 0; i < 5; i++) { c.beginPath(); c.ellipse(cx0 + 6, cy0 - 6 + i * 7, 54 - i * 6, 26 - i * 3, -0.2, Math.PI * 0.05, Math.PI * 0.95); c.lineWidth = 3; c.strokeStyle = 'rgba(60,20,60,0.5)'; c.stroke(); }
  if (ch > 0) softDot(gctx, cx0, cy0, 120, '#7FE9FF', 0.65 * ch * (0.8 + 0.2 * Math.sin(t * 9)));
  bhPath(c, BH.brain);
  const bg = c.createRadialGradient(-20, -200, 20, -20, -180, 260);
  bg.addColorStop(0, '#D58AB4'); bg.addColorStop(1, '#74407C');
  c.fillStyle = bg; c.fill(); c.lineWidth = 5; c.strokeStyle = '#EDB4D6'; c.stroke();
  for (const g of BH_GYRI) poly(c, g, 5, 'rgba(90,30,80,0.5)');
  // the motor strip and the touch area (the cortex lights where they fire)
  const mh = o.motorHi || 0, sh = o.senseHi || 0;
  if (mh > 0) { softDot(c, BH.motor[0], BH.motor[1] + 20, 70, '#FFD447', 0.5 * mh); softDot(gctx, BH.motor[0], BH.motor[1] + 20, 110, '#FFD447', 0.7 * mh); }
  if (sh > 0) { softDot(c, BH.sense[0] - 30, BH.sense[1] + 30, 90, '#FF86A6', 0.6 * sh); softDot(gctx, BH.sense[0] - 30, BH.sense[1] + 30, 180, '#FF86A6', 0.9 * sh); }
  // the nerves: the order (yellow) down the cord, the copy (cyan) to the cerebellum, the touch (pink) back up
  const nv = o.nerves === undefined ? 1 : o.nerves;
  bhNerve(BH_D.order, nv, 0.25 + 0.5 * mh, '#FFD447', 11);
  bhNerve(BH_D.copy, o.copy > 0 ? Math.min(1, o.copy * 1.2) : 0, ch, '#7FE9FF', 9);
  bhNerve(BH_D.touch, nv, 0.2 + 0.6 * (o.touchHi || 0), '#FF86A6', 10);
  if (o.order > 0 && o.order < 1) bhPulse(BH_D.order, o.order, '#FFD447', 1, 12);
  if (o.copy > 0 && o.copy < 1) bhPulse(BH_D.copy, o.copy, '#7FE9FF', 1, 10);
  if (o.touchRun > 0 && o.touchRun < 1.05) {
    const a = o.touchA === undefined ? 1 : o.touchA;
    bhPulse(BH_D.touch, Math.min(1, o.touchRun), '#FF86A6', a, 8 + 8 * (o.touchHi || 0));
  }
  // his hand coming up from below, holding the feather to his chin (or someone else's hand: pink sleeve)
  const hd = o.hand || 0;
  if (hd > 0) {
    const pip = o.handWho === 'pip';
    const hx = lerp(520, 330, E.outCubic(clamp(hd))), hy = lerp(700, 330, E.outCubic(clamp(hd)));
    const sleeve = pip ? PIPPAL.coat : HOMEPAL.coat, sleeveSh = pip ? PIPPAL.coatSh : HOMEPAL.coatSh;
    line(c, hx + 160, hy + 420, hx + 20, hy + 30, pip ? 64 : 90, sleeveSh); line(c, hx + 150, hy + 420, hx + 14, hy + 30, pip ? 52 : 74, sleeve);
    circle(c, hx, hy, pip ? 34 : 44, PAL.skinSh); circle(c, hx - 3, hy - 3, pip ? 29 : 38, PAL.skin);
    const wig = o.wiggle === undefined ? 1 : o.wiggle;
    feather(c, hx - 10, hy - 20, 190, Math.PI * 1.14 + 0.18 * wig * Math.sin(t * 13), t, { flutter: 0.8 });
  }
  screenSpace();
}

// a label in screen space with a leader to a section point
function bhLabel(cam, txt, p, dx, dy, col, k, size = 56) {
  if (k <= 0) return;
  const [x, y] = bhScreen(cam, p), lx = x + dx, ly = y + dy;
  screenSpace();
  const a = clamp(k * 3);
  line(ctx, x, y, lx, ly, 5, rgba('#0B0B1A', 0.8 * a)); line(ctx, x, y, lx, ly, 3, rgba(col, a));
  circle(ctx, x, y, 8, rgba(col, a)); softDot(gctx, x, y, 26, col, 0.6 * a);
  pill(lx, ly, txt, col, E.outBack(clamp(k), 1.8), size);
}
