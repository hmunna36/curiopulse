// Sun-sneeze Short: his head in section, in profile, facing right. Section coords: head centre near (0, 0), about
// 700 units tall (the outline is brain-freeze's head). What it shows: the eyeball, the eye's nerve (yellow) running
// back under the brain, the nose's nerve (orange: the trigeminal, with its branch to the lining of the nose) running
// right beside it, the brainstem, and the brain itself (which gets a face, an arm and a big red button).
// The camera travels inside it with sectionCam(): keys [t, focusX, focusY, scale, screenY].
'use strict';

const SH = {
  outline: [[-250, -60], [-236, -220], [-130, -328], [40, -346], [182, -290], [250, -190], [268, -112], [258, -72],
    [296, -12], [346, 58], [302, 82], [314, 110], [298, 128], [314, 148], [298, 178], [292, 222], [240, 252], [120, 252],
    [64, 300], [62, 470], [-170, 470], [-172, 262], [-232, 120], [-250, -60]],
  brain: [[-222, -120], [-205, -235], [-110, -306], [40, -318], [150, -272], [196, -190], [178, -120], [122, -86],
    [30, -72], [-70, -68], [-150, -52], [-212, -78], [-222, -120]],
  stem: [[-94, -68], [-40, -66], [-27, 10], [-36, 200], [-46, 452], [-66, 452], [-72, 200], [-78, 10]],
  optic: [[196, -66], [150, -57], [100, -49], [50, -46], [0, -56], [-50, -80], [-116, -116], [-186, -150]],
  tri: [[-44, 34], [10, 18], [60, -8], [110, -25], [160, -33], [206, -28]],        // root -> ganglion -> the branch that runs under the eye's nerve
  triNose: [[60, -8], [120, 24], [190, 46], [262, 58], [308, 62]],                 // ... and the branch to the nose
  triJaw: [[10, 18], [40, 84], [92, 142], [150, 168]],
  close: [132, -41], eye: [224, -70], nose: [312, 64], button: [-60, 66],
};
let SH_GYRI = null, SH_D = null;

// Catmull-Rom through the points, as a dense polyline
function shDense(P) {
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
function shAt(D, u) { return polyAt(D.pts, D.acc, D.acc[D.acc.length - 1] * clamp(u)); }
function shPart(D, u0, u1) {
  const L = D.acc[D.acc.length - 1], out = [];
  for (let s = L * clamp(u0); s <= L * clamp(u1) + 0.01; s += 5) { const q = polyAt(D.pts, D.acc, s); out.push([q[0], q[1]]); }
  return out;
}
function initSneezeHead() {
  const rng = mulberry32(12);
  SH_GYRI = [...Array(22)].map(() => {
    const x = -180 + rng() * 320, y = -280 + rng() * 180, L = 30 + rng() * 56, a = rng() * 6.28;
    return [[x, y], [x + Math.cos(a) * L * 0.5 + 10, y + Math.sin(a) * L * 0.5 - 8], [x + Math.cos(a) * L, y + Math.sin(a) * L]];
  });
  SH_D = { optic: shDense(SH.optic), tri: shDense(SH.tri), triNose: shDense(SH.triNose), triJaw: shDense(SH.triJaw) };
}
function shPath(c, P) { smoothPath(c, P); c.closePath(); }
function shSet(c, cam, k, rot) {
  c.setTransform(cam.s * k, 0, 0, cam.s * k, cam.x * k, cam.y * k);
  if (rot) { c.translate(-60, 380); c.rotate(rot); c.translate(60, -380); }
}
function shScreen(cam, x, y) { return [cam.x + x * cam.s, cam.y + y * cam.s]; }
// a nerve: a dim cord, drawn on up to `show`, glowing with `hi`
function shNerve(D, show, hi, col, w) {
  if (show <= 0.001) return;
  const P = shPart(D, 0, show);
  if (P.length < 2) return;
  poly(ctx, P, w + 5, 'rgba(20,6,16,0.7)'); poly(ctx, P, w, rgba(col, 0.5 + 0.5 * hi)); poly(ctx, P, w * 0.36, rgba('#FFFFFF', 0.25 + 0.5 * hi));
  poly(gctx, P, w + 10, rgba(col, 0.18 + 0.6 * hi));
}
// a signal: a bright bead with a short tail at fraction u, running toward +u (dir = 1) or back (-1)
function shPulse(D, u, col, a = 1, r = 9, dir = 1) {
  if (a <= 0.01 || u < 0 || u > 1) return;
  const q = shAt(D, u), tail = shPart(D, dir > 0 ? Math.max(0, u - 0.12) : u, dir > 0 ? u : Math.min(1, u + 0.12));
  if (tail.length > 1) { poly(ctx, tail, r * 0.9, rgba('#FFFFFF', 0.55 * a)); poly(gctx, tail, r * 2.2, rgba(col, 0.8 * a)); }
  circle(ctx, q[0], q[1], r, rgba('#FFFFFF', a)); softDot(gctx, q[0], q[1], r * 5, col, a);
}

// o: {optic, tri: draw-on 0..1 · opticHi, triHi, noseHi, closeHi: highlights 0..1 · beam: light flooding into the eye ·
//  fire: the eye's nerve firing 0..1 · spill: sparks jumping across where the two run close · triRun: signals racing
//  back along the nose's nerve · alarm: the nose branch crying wolf (red) · face, panic: the brain's face · button, arm,
//  press: the big red button on the brainstem · shield: 0..1 at the nose · stemHi · rot: the whole head tips back}
function headCut(cam, t, o = {}) {
  const c = ctx, rot = o.rot || 0;
  shSet(c, cam, 1, rot); shSet(gctx, cam, 0.5, rot);
  // skin silhouette + the inside
  shPath(c, SH.outline);
  const sk = c.createLinearGradient(-250, 0, 350, 0); sk.addColorStop(0, '#34152A'); sk.addColorStop(1, '#4A2036');
  c.fillStyle = sk; c.fill();
  c.lineWidth = 16; c.strokeStyle = PAL.skin; c.stroke(); c.lineWidth = 5; c.strokeStyle = PAL.skinHi; c.stroke();
  shPath(gctx, SH.outline); gctx.lineWidth = 14; gctx.strokeStyle = 'rgba(255,170,130,0.3)'; gctx.stroke();
  // hair, ear, brow (it's him)
  c.beginPath(); c.moveTo(-252, -40); c.quadraticCurveTo(-280, -300, -60, -372); c.quadraticCurveTo(150, -392, 236, -230);
  c.quadraticCurveTo(170, -270, 90, -300); c.quadraticCurveTo(-60, -300, -150, -210); c.quadraticCurveTo(-210, -130, -222, -30); c.closePath();
  c.fillStyle = PAL.hair; c.fill(); line(c, -120, -318, 20, -352, 7, PAL.hairHi);
  ellipse(c, -150, 30, 30, 44, PAL.skinSh); ellipse(c, -150, 30, 16, 28, '#B8704F');
  line(c, 214, -112, 262, -106, 10, PAL.hair);
  // the nose's lining and the mouth
  rrect(c, 120, 26, 184, 62, 28); c.fillStyle = '#220A18'; c.fill();
  const al = o.alarm || 0;
  if (al > 0) { const f = 0.55 + 0.45 * Math.sin(t * 26); rrect(c, 120, 26, 184, 62, 28); c.fillStyle = `rgba(255,60,80,${0.5 * al * f})`; c.fill(); softDot(gctx, 250, 58, 150, '#FF3A50', 0.85 * al * f); }
  c.beginPath(); c.moveTo(70, 112); c.lineTo(300, 118); c.lineTo(296, 146); c.quadraticCurveTo(180, 206, 70, 190); c.closePath(); c.fillStyle = '#4E1220'; c.fill();
  c.beginPath(); c.moveTo(66, 196); c.quadraticCurveTo(90, 150, 180, 150); c.quadraticCurveTo(262, 152, 280, 160); c.quadraticCurveTo(250, 198, 130, 208); c.closePath();
  c.fillStyle = '#E0616C'; c.fill();
  // brainstem, brain
  shPath(c, SH.stem); c.fillStyle = mixHex('#8A4A80', '#F0A070', 0.8 * (o.stemHi || 0)); c.fill(); c.lineWidth = 3; c.strokeStyle = '#C890BC'; c.stroke();
  if (o.stemHi > 0) softDot(gctx, -56, 30, 90, '#FF9A3C', 0.6 * o.stemHi);
  shPath(c, SH.brain);
  const pn = o.panic || 0, bg = c.createRadialGradient(-20, -200, 20, -20, -180, 260);
  bg.addColorStop(0, mixHex('#D58AB4', '#FF8F9C', pn)); bg.addColorStop(1, mixHex('#74407C', '#A8324A', pn));
  c.fillStyle = bg; c.fill(); c.lineWidth = 5; c.strokeStyle = '#EDB4D6'; c.stroke();
  for (const g of SH_GYRI) poly(c, g, 5, 'rgba(90,30,80,0.5)');
  shPath(gctx, SH.brain); gctx.fillStyle = `rgba(230,140,200,${0.12 + 0.3 * pn * (0.6 + 0.4 * Math.sin(t * 22))})`; gctx.fill();
  // the eyeball, in section: the lens at the front, the light-sensing layer round the back
  const [ex, ey] = SH.eye, bm = o.beam || 0;
  circle(c, ex, ey, 34, '#2A1020'); circle(c, ex, ey, 30, '#F3F6FF'); circle(c, ex, ey, 24, mixHex('#C9D4F2', '#FFF6CC', bm));
  c.beginPath(); c.arc(ex, ey, 27, Math.PI * 0.62, Math.PI * 1.38); c.lineWidth = 6; c.strokeStyle = mixHex('#C08A4A', '#FFE27A', bm); c.stroke();
  if (bm > 0) { gctx.beginPath(); gctx.arc(ex, ey, 27, Math.PI * 0.62, Math.PI * 1.38); gctx.lineWidth = 12; gctx.strokeStyle = `rgba(255,220,110,${0.9 * bm})`; gctx.stroke(); }
  ellipse(c, ex + 23, ey, 5, 15, '#6A3B22'); ellipse(c, ex + 17, ey, 6, 11, 'rgba(160,210,255,0.9)');
  c.beginPath(); c.arc(ex + 22, ey, 14, -1.05, 1.05); c.lineWidth = 3; c.strokeStyle = 'rgba(255,255,255,0.8)'; c.stroke();
  line(c, ex + 18, ey - 30, ex + 40, ey - 20, 8, PAL.skin); line(c, ex + 18, ey + 30, ex + 38, ey + 22, 8, PAL.skin);   // lids
  // the nerves
  const D = SH_D, ts = o.tri === undefined ? 1 : o.tri, os = o.optic === undefined ? 1 : o.optic;
  shNerve(D.triJaw, ts, 0, '#B8703A', 6);
  shNerve(D.triNose, clamp(ts * 2 - 1), Math.max(o.noseHi || 0, 0), al > 0 ? '#FF4D63' : '#FF9A3C', 9);
  shNerve(D.tri, clamp(ts * 2), o.triHi || 0, '#FF9A3C', 10);
  if (ts > 0.4) { circle(c, 10, 18, 13, rgba('#FFB25C', 0.6 + 0.4 * (o.triHi || 0))); softDot(gctx, 10, 18, 34, '#FFB25C', 0.3 + 0.5 * (o.triHi || 0)); }
  shNerve(D.optic, os, o.opticHi || 0, '#FFD447', 13);
  // where the two run close: a ring
  const ch = o.closeHi || 0;
  if (ch > 0) for (const [cc, w, a] of [[c, 4, 1], [gctx, 10, 0.7]]) {
    cc.save(); cc.translate(SH.close[0], SH.close[1]); cc.rotate(t * 1.4); cc.setLineDash([14, 9]); cc.lineWidth = w; cc.strokeStyle = `rgba(255,90,110,${a * ch})`;
    cc.beginPath(); cc.ellipse(0, 0, 44 * (0.9 + 0.1 * Math.sin(t * 6)), 34 * (0.9 + 0.1 * Math.sin(t * 6)), -0.12, 0, 7); cc.stroke(); cc.setLineDash([]); cc.restore();
  }
  // light flooding in through the pupil
  if (bm > 0) {
    c.save(); c.globalCompositeOperation = 'lighter';
    const g = c.createLinearGradient(700, 0, ex + 20, 0); g.addColorStop(0, `rgba(255,230,150,${0.0})`); g.addColorStop(0.25, `rgba(255,230,150,${0.42 * bm})`); g.addColorStop(1, `rgba(255,244,200,${0.7 * bm})`);
    c.fillStyle = g; c.beginPath(); c.moveTo(760, -300); c.lineTo(760, 130); c.lineTo(ex + 24, ey + 9); c.lineTo(ex + 24, ey - 9); c.closePath(); c.fill();
    c.fillStyle = `rgba(255,244,200,${0.42 * bm})`; c.beginPath(); c.moveTo(ex + 18, ey - 7); c.lineTo(ex + 18, ey + 7); c.lineTo(ex - 26, ey + 20); c.lineTo(ex - 26, ey - 20); c.closePath(); c.fill();
    c.restore();
    gctx.fillStyle = `rgba(255,220,130,${0.3 * bm})`; gctx.beginPath(); gctx.moveTo(760, -300); gctx.lineTo(760, 130); gctx.lineTo(ex + 24, ey + 9); gctx.lineTo(ex + 24, ey - 9); gctx.closePath(); gctx.fill();
    for (let i = 0; i < 9; i++) { const u = (t * 1.5 + i / 9) % 1, y0 = -260 + 380 * hash(i + 3); const px = lerp(740, ex + 26, u), py = lerp(y0, ey, u); line(c, px, py, px + 26, py + (y0 - ey) * 0.045, 3, `rgba(255,250,220,${0.75 * bm * Math.sin(Math.PI * u)})`); }
  }
  // signals
  const fr = o.fire || 0;
  if (fr > 0) for (let k = 0; k < 5; k++) shPulse(D.optic, (t * 1.5 + k / 5) % 1, '#FFD447', fr, 9, 1);
  const sp = o.spill || 0;
  if (sp > 0) {   // sparks jump the gap
    const rng = mulberry32(900 + Math.floor(t * 30));
    for (let i = 0; i < 4; i++) {
      const u = 0.24 + 0.2 * rng(), a = shAt(D.optic, u), b = shAt(D.tri, 0.62 + 0.3 * rng());
      const pts = jagged(rng, a[0], a[1] + 5, b[0], b[1] - 4, 12, 3);
      poly(c, pts, 3, `rgba(255,250,235,${0.95 * sp})`); poly(gctx, pts, 9, `rgba(255,120,90,${0.9 * sp})`);
    }
    softDot(gctx, SH.close[0], SH.close[1], 70, '#FF7A5A', 0.7 * sp);
  }
  const tr = o.triRun || 0;
  if (tr > 0) for (let k = 0; k < 4; k++) shPulse(D.tri, 0.78 * (1 - ((t * 1.7 + k / 4) % 1)), '#FF9A3C', tr, 8, -1);
  if (al > 0) for (let k = 0; k < 4; k++) shPulse(D.triNose, 1 - ((t * 1.9 + k / 4) % 1), '#FF4D63', al, 8, -1);
  // the guard at the nose
  const shd = o.shield || 0;
  if (shd > 0) {
    const s = E.outBack(clamp(shd), 2.2) * 0.62;
    c.save(); c.translate(SH.nose[0] - 8, SH.nose[1] - 4); c.scale(s, s);
    c.beginPath(); c.moveTo(0, -46); c.quadraticCurveTo(24, -34, 42, -36); c.quadraticCurveTo(44, 14, 0, 46); c.quadraticCurveTo(-44, 14, -42, -36); c.quadraticCurveTo(-24, -34, 0, -46); c.closePath();
    c.fillStyle = '#17B978'; c.fill(); c.lineWidth = 7; c.lineJoin = 'round'; c.strokeStyle = '#0B0B1A'; c.stroke();
    c.beginPath(); c.moveTo(-18, 0); c.lineTo(-4, 15); c.lineTo(20, -14); c.lineWidth = 9; c.lineCap = 'round'; c.strokeStyle = '#FFFFFF'; c.stroke();
    c.restore(); softDot(gctx, SH.nose[0] - 8, SH.nose[1] - 4, 60, '#4DFFB4', 0.5 * clamp(shd));
  }
  // the brain's big red button, on the brainstem
  const bt = o.button || 0;
  if (bt > 0) {
    const [bx, by] = SH.button, pr = o.press || 0, s = E.outBack(clamp(bt), 2);
    c.save(); c.translate(bx, by); c.scale(s, s);
    rrect(c, -52, 8, 104, 30, 9); c.fillStyle = '#1A1228'; c.fill();
    for (let i = 0; i < 5; i++) { c.fillStyle = i % 2 ? '#1A1228' : '#FFD447'; c.beginPath(); c.moveTo(-50 + i * 20, 10); c.lineTo(-38 + i * 20, 10); c.lineTo(-46 + i * 20, 22); c.lineTo(-58 + i * 20, 22); c.closePath(); c.fill(); }
    c.font = '900 15px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#FFFFFF'; c.fillText('SNEEZE', 0, 30);
    ellipse(c, 0, 8 - 0, 36, 10, '#5A0C18');
    c.beginPath(); c.ellipse(0, 6, 31, 26 * (1 - 0.62 * pr), 0, Math.PI, 0); c.closePath();
    const g = c.createRadialGradient(-10, -10 + 12 * pr, 2, 0, 0, 34); g.addColorStop(0, '#FF9AA6'); g.addColorStop(0.5, '#FF2E48'); g.addColorStop(1, '#A80C24');
    c.fillStyle = g; c.fill();
    c.restore();
    softDot(gctx, bx, by, 60 + 60 * pr, '#FF2E48', 0.5 + 0.5 * pr);
  }
  // the brain's face: looking toward the nose; and its arm
  const fc = o.face || 0;
  if (fc > 0) {
    const s = clamp(fc), ey2 = -200, wide = 1 + 0.5 * pn;
    for (const [fx, r] of [[62, 24], [126, 21]]) {
      ellipse(c, fx, ey2, r * s, r * 1.15 * s * wide, '#FFFFFF');
      circle(c, fx + (7 + 3 * pn) * s, ey2 + 7 * s * (1 - pn), r * (0.42 - 0.14 * pn) * s, '#2A1030');
      line(c, fx - r, ey2 - r * 1.5 * wide - 4 * pn, fx + r, ey2 - r * 1.5 * wide - 12 * pn * (fx < 100 ? -1 : 1) + 6 * pn, 7 * s, '#5A2A5E');
    }
    if (pn > 0.3) ellipse(c, 100, -134, 20 * s, (12 + 16 * pn) * s, '#3A0E24'); else { c.beginPath(); c.moveTo(80, -138); c.quadraticCurveTo(100, -128, 120, -138); c.lineWidth = 6 * s; c.lineCap = 'round'; c.strokeStyle = '#3A0E24'; c.stroke(); }
    if (pn > 0.2) for (let i = 0; i < 2; i++) sweatDrop(c, 170 + i * 26, -250 + i * 34 + 12 * Math.sin(t * 9 + i), 0.8, pn);
  }
  const arm = o.arm;
  if (arm !== undefined && arm !== null) {   // 0 = fist raised, 1 = down on the button
    const [bx, by] = SH.button, fx = lerp(-150, bx, arm), fy = lerp(-110, by - 22 + 14 * (o.press || 0), arm), sx = -112, sy = -58;
    const mx = (sx + fx) / 2 - 46 * (1 - arm), my = (sy + fy) / 2 - 10;
    c.beginPath(); c.moveTo(sx, sy); c.quadraticCurveTo(mx, my, fx, fy); c.lineWidth = 20; c.lineCap = 'round'; c.strokeStyle = '#7A3A70'; c.stroke();
    c.lineWidth = 13; c.strokeStyle = '#D58AB4'; c.stroke();
    circle(c, fx, fy, 19, '#7A3A70'); circle(c, fx - 1, fy - 1, 15, '#F0B6D6');
  }
  screenSpace();
}
