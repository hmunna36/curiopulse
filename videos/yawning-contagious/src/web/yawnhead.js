// Yawning Short: the side-view head cutaway (his profile, facing right), adapted from the brain-freeze Short's head.js
// with a hinged jaw: the yawn drops the lower jaw, cool air streams in, blood rushes up the carotid to the brain and the
// brain cools from warm orange to cool blue. Section coords: head centre at (0, 0), ~800 units tall.
// Camera: sectionCam() (fx.js) keys [t, fx, fy, scale, screenY]; draw with yawnHead(cam, t, o).
'use strict';

const YH = {
  upper: [[-250, -60], [-236, -220], [-130, -328], [40, -346], [182, -290], [250, -190], [268, -112], [258, -72],
    [296, -12], [346, 58], [302, 82], [314, 110], [298, 128]],
  jaw: [[314, 148], [298, 178], [292, 222], [240, 252], [120, 252]],
  back: [[64, 300], [62, 470], [-170, 470], [-172, 262], [-232, 120], [-250, -60]],
  hinge: [10, 60],
  brain: [[-222, -120], [-205, -235], [-110, -306], [40, -318], [170, -262], [228, -168], [214, -64], [150, -26],
    [30, -18], [-70, -30], [-150, -18], [-212, -60], [-222, -120]],
  // carotid: up the neck, into the skull, along the front of the brain
  artery: [[34, 470], [36, 380], [30, 290], [14, 200], [-6, 110], [-10, 40], [20, 6], [90, -10], [160, -52], [204, -120],
    [206, -196], [168, -262], [92, -302]],
  palateY: 104,
};
let YH_GYRI = null;

function initYawnHead() {
  const rng = mulberry32(12);
  YH_GYRI = [...Array(26)].map(() => {
    const x = -190 + rng() * 380, y = -290 + rng() * 240, L = 30 + rng() * 60, a = rng() * 6.28;
    return [[x, y], [x + Math.cos(a) * L * 0.5 + 10, y + Math.sin(a) * L * 0.5 - 8], [x + Math.cos(a) * L, y + Math.sin(a) * L]];
  });
}

function yhRot(p, th, k = 1) {
  const [hx, hy] = YH.hinge, dx = p[0] - hx, dy = p[1] - hy, a = th * k;
  return [hx + dx * Math.cos(a) - dy * Math.sin(a), hy + dx * Math.sin(a) + dy * Math.cos(a)];
}
function yhPath(c, P, close = true) { smoothPath(c, P); if (close) c.closePath(); }
function yhAt(P, u) { const acc = polyLen(P); return polyAt(P, acc, acc[acc.length - 1] * clamp(u)); }
function yhPart(P, u0, u1) {
  const acc = polyLen(P), L = acc[acc.length - 1], out = [];
  for (let s = L * u0; s <= L * u1 + 0.01; s += 8) { const q = polyAt(P, acc, s); out.push([q[0], q[1]]); }
  return out;
}

// o: {jaw 0..1 (yawn opening), air 0..1 (cool air streaming in), rush 0..1 (blood racing up the artery),
//     warm 0..1 (brain temperature: 1 = hot orange, 0 = cool blue), eyeShut 0..1, brainLit}
function yawnHead(cam, t, o = {}) {
  const set = (c, k) => c.setTransform(cam.s * k, 0, 0, cam.s * k, cam.x * k, cam.y * k);
  set(ctx, 1); set(gctx, 0.5);
  const c = ctx, th = 0.42 * E.inOutSine(clamp(o.jaw || 0));
  const jaw = YH.jaw.map((p) => yhRot(p, th));
  const throat = yhRot(YH.back[0], th, 0.45);
  const outline = YH.upper.concat([[270, 132]], jaw, [throat], YH.back.slice(1));
  // skin silhouette + section interior
  yhPath(c, outline);
  const sk = c.createLinearGradient(-250, 0, 350, 0);
  sk.addColorStop(0, '#3A1826'); sk.addColorStop(1, '#4A2030');
  c.fillStyle = sk; c.fill();
  c.lineWidth = 16; c.strokeStyle = PAL.skin; c.stroke();
  c.lineWidth = 5; c.strokeStyle = PAL.skinHi; c.stroke();
  yhPath(gctx, outline); gctx.lineWidth = 14; gctx.strokeStyle = 'rgba(255,170,130,0.35)'; gctx.stroke();
  // hair cap (it's him)
  c.beginPath(); c.moveTo(-252, -40); c.quadraticCurveTo(-280, -300, -60, -372); c.quadraticCurveTo(150, -392, 236, -230);
  c.quadraticCurveTo(170, -270, 90, -300); c.quadraticCurveTo(-60, -300, -150, -210); c.quadraticCurveTo(-210, -130, -222, -30); c.closePath();
  c.fillStyle = PAL.hair; c.fill(); line(c, -120, -318, 20, -352, 7, PAL.hairHi);
  // ear
  ellipse(c, -40, -10, 30, 44, PAL.skinSh); ellipse(c, -40, -10, 16, 28, '#B8704F');
  // eye + brow on the profile (squeezed shut in the yawn, brow up)
  const es = clamp(o.eyeShut || 0);
  if (es < 0.6) { ellipse(c, 228, -70, 22, 13 * (1 - es), '#FFFFFF'); circle(c, 238, -70, 8 * (1 - es * 0.5), PAL.pupil); }
  else { c.beginPath(); c.moveTo(208, -72); c.quadraticCurveTo(228, -62, 248, -72); c.lineWidth = 6; c.strokeStyle = '#5A2E22'; c.lineCap = 'round'; c.stroke();
    for (let i = 0; i < 3; i++) line(c, 252, -78 + i * 8, 266, -84 + i * 12, 3, 'rgba(120,60,40,0.6)'); }
  line(c, 206, -104 - 14 * es, 256, -100 - 18 * es, 9, PAL.hair);
  // brain: warm (orange) -> cool (blue)
  const warm = o.warm === undefined ? 0.5 : o.warm, bl = o.brainLit || 0;
  yhPath(c, YH.brain);
  const bg = c.createRadialGradient(0, -170, 20, 0, -150, 280);
  bg.addColorStop(0, mixHex('#9AD0FF', '#FF9A62', warm)); bg.addColorStop(1, mixHex('#2E4E92', '#9A3A2A', warm));
  c.fillStyle = bg; c.fill(); c.lineWidth = 5; c.strokeStyle = mixHex('#BFE6FF', '#FFC9A0', warm); c.stroke();
  for (const g of YH_GYRI) poly(c, g, 5, warm > 0.5 ? 'rgba(110,40,30,0.5)' : 'rgba(20,40,90,0.5)');
  yhPath(gctx, YH.brain); gctx.fillStyle = warm > 0.5 ? `rgba(255,120,40,${0.10 + 0.22 * (warm - 0.5) * 2 + 0.12 * bl})` : `rgba(110,190,255,${0.10 + 0.25 * (0.5 - warm) * 2 + 0.12 * bl})`; gctx.fill();
  // heat shimmer over a hot brain
  if (warm > 0.55) for (let i = 0; i < 4; i++) {
    const ph = ((t * 0.8 + i * 0.25) % 1), x = -120 + i * 80, y = -330 - ph * 90;
    c.beginPath(); c.moveTo(x, y + 40); c.bezierCurveTo(x + 14, y + 26, x - 14, y + 14, x, y);
    c.lineWidth = 6; c.strokeStyle = `rgba(255,170,90,${0.7 * Math.sin(Math.PI * ph) * (warm - 0.55) * 2.2})`; c.stroke();
  }
  // nasal cavity above the palate
  rrect(c, 90, 22, 210, 76, 30); c.fillStyle = '#240C18'; c.fill();
  // airway: back of the mouth down the throat
  c.beginPath(); c.moveTo(40, 150); c.quadraticCurveTo(0, 230, 10, 470); c.lineTo(-40, 470); c.quadraticCurveTo(-46, 230, 0, 120); c.closePath();
  c.fillStyle = '#2A0C16'; c.fill();
  // mouth cavity: the palate is fixed, the floor (and tongue) drop with the jaw
  const fl0 = yhRot([300, 150], th), fl1 = yhRot([170, 214], th), fl2 = yhRot([40, 196], th, 0.5);
  c.beginPath(); c.moveTo(40, YH.palateY + 10); c.lineTo(304, YH.palateY + 14); c.lineTo(fl0[0], fl0[1]);
  c.quadraticCurveTo(fl1[0], fl1[1], fl2[0], fl2[1]); c.closePath();
  c.fillStyle = '#5A1522'; c.fill();
  // upper + lower teeth
  for (let i = 0; i < 5; i++) { rrect(c, 236 + i * 13, YH.palateY + 8, 11, 14, 4); c.fillStyle = '#FFFFFF'; c.fill(); }
  for (let i = 0; i < 5; i++) { const q = yhRot([236 + i * 13, 150], th); rrect(c, q[0], q[1] - 12, 11, 13, 4); c.fillStyle = '#F2EEE6'; c.fill(); }
  // tongue (rides on the jaw)
  const T0 = yhRot([34, 200], th, 0.6), T1 = yhRot([170, 158], th), T2 = yhRot([272, 164], th), T3 = yhRot([250, 204], th), T4 = yhRot([120, 214], th);
  c.beginPath(); c.moveTo(T0[0], T0[1]); c.quadraticCurveTo(lerp(T0[0], T1[0], 0.4), T1[1] - 8, T1[0], T1[1]);
  c.quadraticCurveTo(lerp(T1[0], T2[0], 0.7), T2[1] - 6, T2[0], T2[1]); c.quadraticCurveTo(T3[0], T3[1], T4[0], T4[1]); c.closePath();
  const tgr = c.createLinearGradient(0, T1[1], 0, T4[1]); tgr.addColorStop(0, '#FF8A9C'); tgr.addColorStop(1, '#C24460');
  c.fillStyle = tgr; c.fill();
  // the hard palate
  c.beginPath(); c.moveTo(40, YH.palateY - 4); c.quadraticCurveTo(170, YH.palateY - 16, 306, YH.palateY - 2);
  c.lineTo(306, YH.palateY + 12); c.quadraticCurveTo(170, YH.palateY + 2, 40, YH.palateY + 10); c.closePath();
  c.fillStyle = '#F1E6D8'; c.fill();
  // the artery (carotid up into the brain); rush = fresh blood racing up
  const ar = o.rush || 0;
  poly(c, YH.artery, 15 + 8 * ar, '#7A0F24'); poly(c, YH.artery, 9 + 7 * ar, mixHex('#C8263F', '#FF4D63', ar));
  poly(gctx, YH.artery, 18 + 18 * ar, `rgba(255,60,90,${0.2 + 0.6 * ar})`);
  if (ar > 0.02) {
    for (let k = 0; k < 18; k++) {
      const u = ((t * 1.4 + k / 18) % 1);
      const q = yhAt(YH.artery, u); circle(c, q[0], q[1], 4 + 3 * ar, rgba('#FFC2CD', ar)); softDot(gctx, q[0], q[1], 14, '#FF6A80', 0.6 * ar);
    }
  }
  // cool air streaming in through the open mouth: into the cavity, up the nose, down the throat
  const air = o.air || 0;
  if (air > 0.01) {
    const mouthIn = [[460, 150], [380, 148], [300, 150], [220, 152], [130, 150], [60, 150], [20, 200], [6, 300], [0, 420]];
    const noseIn = [[300, 150], [240, 120], [200, 80], [150, 60], [100, 50]];
    for (let k = 0; k < 26; k++) {
      const u = ((t * 0.9 + k / 26) % 1), P = k % 4 === 0 ? noseIn : mouthIn;
      const q = yhAt(P, u), wob = 10 * Math.sin(t * 9 + k * 2.1);
      const al = air * Math.sin(Math.PI * u);
      circle(c, q[0], q[1] + wob, 5 + 3 * Math.sin(k), rgba('#DFF8FF', 0.9 * al));
      softDot(gctx, q[0], q[1] + wob, 26, '#7FE9FF', 0.7 * al);
    }
    // the big stream outside the lips
    for (let k = 0; k < 4; k++) {
      const y = 130 + k * 12, ph = (t * 3 + k * 0.3) % 1;
      c.beginPath(); c.moveTo(560 - ph * 120, y); c.bezierCurveTo(480, y - 16, 420, y + 16, 330, y + 4);
      c.lineWidth = 6; c.strokeStyle = rgba('#BFF0FF', 0.6 * air); c.lineCap = 'round'; c.stroke();
      gctx.beginPath(); gctx.moveTo(560 - ph * 120, y); gctx.bezierCurveTo(480, y - 16, 420, y + 16, 330, y + 4);
      gctx.lineWidth = 14; gctx.strokeStyle = rgba('#7FE9FF', 0.4 * air); gctx.stroke();
    }
  }
  screenSpace();
}
// section point -> screen
function yhScreen(cam, x, y) { return [cam.x + x * cam.s, cam.y + y * cam.s]; }

// a thermometer (screen space): level 0..1, colour follows the level (hot red -> cool blue)
function thermoY(x, y0, y1, level, a = 1) {
  if (a <= 0.01) return;
  const c = ctx, col = mixHex('#7FE9FF', '#FF5A3C', level);
  c.save(); c.globalAlpha = a;
  rrect(c, x - 24, y0 - 10, 48, y1 - y0 + 20, 24); c.fillStyle = 'rgba(10,14,30,0.85)'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#E8EEFF'; c.stroke();
  circle(c, x, y1 + 26, 40, '#E8EEFF'); circle(c, x, y1 + 26, 32, col);
  const top = lerp(y1 - 6, y0 + 8, level);
  rrect(c, x - 11, top, 22, y1 + 20 - top, 11); c.fillStyle = col; c.fill();
  for (let i = 0; i < 6; i++) line(c, x + 26, lerp(y0 + 10, y1 - 10, i / 5), x + 40, lerp(y0 + 10, y1 - 10, i / 5), 4, 'rgba(232,238,255,0.8)');
  softDot(gctx, x, y1 + 26, 80, col, 0.7 * a);
  c.restore();
}
