// Brain-freeze Short: the side-view head cutaway (his profile, facing right). Section coords: head centre at
// (0, 0), ~700 units tall. The camera travels inside it with sectionCam(): keys [t, fx, fy, scale, screenY].
'use strict';

const HS = {
  outline: [[-250, -60], [-236, -220], [-130, -328], [40, -346], [182, -290], [250, -190], [268, -112], [258, -72],
    [296, -12], [346, 58], [302, 82], [314, 110], [298, 128], [314, 148], [298, 178], [292, 222], [240, 252], [120, 252],
    [64, 300], [62, 470], [-170, 470], [-172, 262], [-232, 120], [-250, -60]],
  brain: [[-222, -120], [-205, -235], [-110, -306], [40, -318], [170, -262], [228, -168], [214, -64], [150, -26],
    [30, -18], [-70, -30], [-150, -18], [-212, -60], [-222, -120]],
  // artery at the front of the brain (anterior cerebral artery), from below up along the front
  artery: [[10, 20], [90, -8], [160, -52], [204, -120], [206, -196], [168, -262], [92, -302]],
  // nerve: palate -> back to the ganglion -> brainstem; and the forehead branch
  nerve: [[210, 98], [150, 78], [70, 58], [-10, 30], [-58, 2]],
  nerveUp: [[-58, 2], [-96, -24], [-110, -70]],
  nerveFore: [[-58, 2], [30, -30], [150, -90], [228, -168], [250, -200]],
  palateY: 104,
};
let HS_GYRI = null;

function initHead() {
  const rng = mulberry32(12);
  HS_GYRI = [...Array(26)].map(() => {
    const x = -190 + rng() * 380, y = -290 + rng() * 240, L = 30 + rng() * 60, a = rng() * 6.28;
    return [[x, y], [x + Math.cos(a) * L * 0.5 + 10, y + Math.sin(a) * L * 0.5 - 8], [x + Math.cos(a) * L, y + Math.sin(a) * L]];
  });
}

function hsPath(c, P, close = true) { smoothPath(c, P); if (close) c.closePath(); }
// point + tangent at fraction u along a polyline
function hsAt(P, u) { const acc = polyLen(P); return polyAt(P, acc, acc[acc.length - 1] * clamp(u)); }
// partial polyline 0..u
function hsPart(P, u0, u1) {
  const acc = polyLen(P), L = acc[acc.length - 1], out = [];
  for (let s = L * u0; s <= L * u1 + 0.01; s += 8) { const q = polyAt(P, acc, s); out.push([q[0], q[1]]); }
  return out;
}

// o: {cold 0..1 (frost on the palate), shake 0..1 (the cold blob in the mouth), vessel: width factor (1 normal,
//  0.35 squeeze, 2 fling), panic 0..1, rush 0..1 (blood racing up the artery), warm 0..1 (warm glow), nerve 0..1
//  (signal travel), nerveFore 0..1, tongue 0..1 (pressed to the roof), brainLit, pressure (head bulge), fade}
function headSection(cam, t, o = {}) {
  const set = (c, k) => c.setTransform(cam.s * k, 0, 0, cam.s * k, cam.x * k, cam.y * k);
  set(ctx, 1); set(gctx, 0.5);
  const c = ctx, bul = 1 + 0.06 * (o.pressure || 0) * (0.7 + 0.3 * Math.sin(t * 30));
  c.save(); gctx.save();
  if (bul !== 1) { for (const cc of [c, gctx]) { cc.translate(0, -150); cc.scale(bul, bul); cc.translate(0, 150); } }
  // skin silhouette + section interior
  hsPath(c, HS.outline);
  const sk = c.createLinearGradient(-250, 0, 350, 0);
  sk.addColorStop(0, '#3A1826'); sk.addColorStop(1, '#4A2030');
  c.fillStyle = sk; c.fill();
  c.lineWidth = 16; c.strokeStyle = PAL.skin; c.stroke();
  c.lineWidth = 5; c.strokeStyle = PAL.skinHi; c.stroke();
  hsPath(gctx, HS.outline); gctx.lineWidth = 14; gctx.strokeStyle = 'rgba(255,170,130,0.35)'; gctx.stroke();
  // hair cap (it's him)
  c.beginPath(); c.moveTo(-252, -40); c.quadraticCurveTo(-280, -300, -60, -372); c.quadraticCurveTo(150, -392, 236, -230);
  c.quadraticCurveTo(170, -270, 90, -300); c.quadraticCurveTo(-60, -300, -150, -210); c.quadraticCurveTo(-210, -130, -222, -30); c.closePath();
  c.fillStyle = PAL.hair; c.fill(); line(c, -120, -318, 20, -352, 7, PAL.hairHi);
  // ear
  ellipse(c, -40, -10, 30, 44, PAL.skinSh); ellipse(c, -40, -10, 16, 28, '#B8704F');
  // eye + brow on the profile
  ellipse(c, 228, -70, 22, 13, '#FFFFFF'); circle(c, 238, -70, 8, PAL.pupil); circle(c, 235, -73, 3, '#FFFFFF');
  line(c, 206, -104, 256, -100, 9, PAL.hair);
  // brain
  const bl = o.brainLit || 0;
  hsPath(c, HS.brain);
  const bg = c.createRadialGradient(0, -170, 20, 0, -150, 280);
  bg.addColorStop(0, mixHex('#C97BA8', '#FFB08A', o.warm || 0)); bg.addColorStop(1, mixHex('#6E3C74', '#B0503A', o.warm || 0));
  c.fillStyle = bg; c.fill(); c.lineWidth = 5; c.strokeStyle = '#E7A9CF'; c.stroke();
  for (const g of HS_GYRI) poly(c, g, 5, 'rgba(90,30,80,0.55)');
  hsPath(gctx, HS.brain); gctx.fillStyle = `rgba(230,140,200,${0.14 + 0.5 * bl})`; gctx.fill();
  if (o.warm > 0) { hsPath(gctx, HS.brain); gctx.fillStyle = `rgba(255,150,60,${0.45 * o.warm})`; gctx.fill(); }
  // sinus / nasal cavity above the palate
  rrect(c, 90, 22, 210, 76, 30); c.fillStyle = '#240C18'; c.fill();
  // mouth cavity
  c.beginPath(); c.moveTo(40, HS.palateY + 10); c.lineTo(304, HS.palateY + 14); c.lineTo(300, 150); c.quadraticCurveTo(170, 214, 40, 196); c.closePath();
  c.fillStyle = '#5A1522'; c.fill();
  // blood vessels above the palate
  const vw = o.vessel === undefined ? 1 : o.vessel;
  for (let i = 0; i < 3; i++) {
    const y0 = 40 + i * 20, P = [];
    const jit = (o.panic || 0) * 4;
    for (let x = 96; x <= 292; x += 14) P.push([x + jit * vnoise(t * 30 + i, x), y0 + 6 * Math.sin(x / 26 + i * 2) + jit * vnoise(t * 27 + x, i)]);
    poly(c, P, 8 * vw + 3, '#7A0F24'); poly(c, P, 8 * vw, '#E8334F');
    poly(gctx, P, 10 * vw + 4, `rgba(255,60,90,${0.35 + 0.3 * clamp(vw - 1)})`);
    if (o.flow > 0) { // blood cells racing along
      for (let k = 0; k < 5; k++) {
        const u = ((t * 0.9 * o.flow + k / 5 + i * 0.13) % 1);
        const q = hsAt(P, u); circle(c, q[0], q[1], 3.5 * vw, '#FFB0BE');
      }
    }
  }
  // the artery up the front of the brain
  const ar = o.rush || 0;
  poly(c, HS.artery, 14 + 8 * ar, '#7A0F24'); poly(c, HS.artery, 9 + 7 * ar, mixHex('#C8263F', '#FF4D63', ar));
  poly(gctx, HS.artery, 18 + 16 * ar, `rgba(255,60,90,${0.25 + 0.6 * ar})`);
  if (ar > 0.02) {
    for (let k = 0; k < 16; k++) {
      const u = ((t * 1.6 + k / 16) % 1);
      const q = hsAt(HS.artery, u); circle(c, q[0], q[1], 4 + 3 * ar, rgba('#FFC2CD', ar)); softDot(gctx, q[0], q[1], 14, '#FF6A80', 0.6 * ar);
    }
  }
  // tongue (rises to the palate with o.tongue)
  const tg = o.tongue || 0, ty = lerp(148, HS.palateY + 16, tg);
  c.beginPath(); c.moveTo(34, 200); c.quadraticCurveTo(60, ty - 6, 170, ty); c.quadraticCurveTo(262, ty + 2, 280, lerp(160, 128, tg));
  c.quadraticCurveTo(250, 200, 120, 214); c.closePath();
  const tgr = c.createLinearGradient(0, ty, 0, 214); tgr.addColorStop(0, '#FF8A9C'); tgr.addColorStop(1, '#C24460');
  c.fillStyle = tgr; c.fill(); line(c, 90, ty + 18, 230, ty + 14, 3, 'rgba(160,40,70,0.5)');
  // the cold shake blob pressing on the palate
  const sh = o.shake || 0;
  if (sh > 0.01) {
    const bx = lerp(330, 200, E.outCubic(clamp(sh * 1.4)));
    ellipse(c, bx, 128, 90 * clamp(sh * 1.5), 22, '#FFC2DA'); ellipse(c, bx - 20, 122, 50 * clamp(sh * 1.5), 10, '#FFE3EE');
    softDot(gctx, bx, 124, 70, '#BFF0FF', 0.25 * sh);
  }
  // the hard palate (roof of the mouth)
  c.beginPath(); c.moveTo(40, HS.palateY - 4); c.quadraticCurveTo(170, HS.palateY - 16, 306, HS.palateY - 2);
  c.lineTo(306, HS.palateY + 12); c.quadraticCurveTo(170, HS.palateY + 2, 40, HS.palateY + 10); c.closePath();
  c.fillStyle = mixHex('#F1E6D8', '#BFF0FF', o.cold || 0); c.fill();
  // frost on the palate
  const cold = o.cold || 0;
  if (cold > 0.01) {
    const rng = mulberry32(5);
    for (let i = 0; i < 16; i++) {
      const x = 60 + rng() * 240, y = HS.palateY + (rng() - 0.5) * 16, L = (6 + rng() * 14) * cold;
      for (let a = 0; a < 3; a++) { const an = a * Math.PI / 3 + rng(); line(c, x - Math.cos(an) * L, y - Math.sin(an) * L, x + Math.cos(an) * L, y + Math.sin(an) * L, 2.5, 'rgba(255,255,255,0.9)'); }
    }
    c.save(); c.globalAlpha = cold; c.beginPath(); c.moveTo(40, HS.palateY); c.quadraticCurveTo(170, HS.palateY - 12, 306, HS.palateY);
    gctx.lineWidth = 16; gctx.strokeStyle = 'rgba(160,230,255,0.35)'; gctx.beginPath(); gctx.moveTo(40, HS.palateY); gctx.quadraticCurveTo(170, HS.palateY - 12, 306, HS.palateY); gctx.globalAlpha = cold; gctx.stroke(); gctx.globalAlpha = 1;
    c.restore();
  }
  // warm glow from the tongue
  if (o.tongueWarm > 0) softDot(gctx, 190, HS.palateY + 10, 160, '#FF9A3C', 0.9 * o.tongueWarm);
  // the nerve (trigeminal): dim until lit; a signal pulse travels palate -> ganglion -> brain
  const nv = o.nerve, nvShow = o.nerveShow || 0;
  if (nvShow > 0) {
    for (const P of [HS.nerve, HS.nerveUp]) { poly(c, P, 7, rgba('#FF9A3C', 0.35 + 0.5 * nvShow)); poly(gctx, P, 12, rgba('#FF9A3C', 0.4 * nvShow)); }
    circle(c, -58, 2, 14, rgba('#FFB25C', nvShow)); softDot(gctx, -58, 2, 40, '#FFB25C', 0.8 * nvShow);
    const fore = o.nerveFore || 0;
    poly(c, HS.nerveFore, 6, rgba('#FF9A3C', 0.25 + 0.6 * fore));
    if (fore > 0) { const part = hsPart(HS.nerveFore, 0, fore); poly(c, part, 9, '#FFD08A'); poly(gctx, part, 22, 'rgba(255,170,80,0.9)'); }
  }
  if (nv > 0 && nv < 1) { // the pulse
    const full = HS.nerve.concat(HS.nerveUp.slice(1));
    const q = hsAt(full, nv);
    circle(c, q[0], q[1], 13, '#FFF1C8'); softDot(gctx, q[0], q[1], 60, '#FFB25C', 1);
    const tr = hsPart(full, Math.max(0, nv - 0.25), nv); poly(c, tr, 9, '#FFD08A'); poly(gctx, tr, 20, 'rgba(255,170,80,0.8)');
  }
  c.restore(); gctx.restore();
  screenSpace();
}
// section point -> screen
function hsScreen(cam, x, y) { return [cam.x + x * cam.s, cam.y + y * cam.s]; }
