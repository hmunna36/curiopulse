// Inside the fingertip: a cutaway with skin layers, sweat pores/ducts, a nerve, blood vessels and
// the anchoring strands that make the skin buckle when the tissue under it loses volume.
// Local coords: surface at y = 0 (down is +y), x -500..500; drawn at (x, y) with scale s.
'use strict';

const ANCH = [-450, -270, -90, 90, 270, 450];
const GLANDS = [-360, -180, 0, 180, 360];
let LOBES = null;
function initInside() {
  const rng = mulberry32(64);
  LOBES = [...Array(26)].map(() => ({ x: -500 + rng() * 1000, y: 360 + rng() * 260, r: 26 + rng() * 30 }));
}
// o: shrink 0..1 (volume loss), buckle 0..1, squeeze 0..1 (vasoconstriction), water 0..1 (seeping in),
//    sense 0..1 (signal out along the nerve), cmd 0..1 (signal back to the vessels), flow speed, labels{}
function surfY(xx, o) {
  const b = o.buckle || 0, base = 22 * (o.shrink || 0);
  let i = 0;
  while (i < ANCH.length - 2 && xx > ANCH[i + 1]) i++;
  const u = clamp((xx - ANCH[i]) / (ANCH[i + 1] - ANCH[i]));
  const ridge = 5 * Math.sin(xx * 0.13);
  return base + b * (30 - 50 * Math.sin(Math.PI * u)) + ridge * (1 - 0.5 * b);
}
function ductPath(gx, o) { // spiral duct from the gland (in the dermis) to its pore on the surface
  const P = [];
  const top = surfY(gx, o), bot = 290 - 40 * (o.shrink || 0);
  for (let k = 0; k <= 40; k++) {
    const u = k / 40;
    P.push([gx + 12 * Math.sin(u * 14), lerp(bot, top + 2, u)]);
  }
  return P;
}
function drawSection(x, y, s, t, o = {}) {
  const c = ctx, sh = o.shrink || 0, sq = o.squeeze || 0;
  const dermB = 330 - 55 * sh, fatB = 650;
  gctx.setTransform(0.5, 0, 0, 0.5, 0, 0);
  c.save(); c.translate(x, y); c.scale(s, s);
  // frame (a magnified cutaway)
  rrect(c, -520, -300, 1040, 1000, 60); c.save(); c.clip();
  // water above the skin
  const wg = c.createLinearGradient(0, -300, 0, 40);
  wg.addColorStop(0, '#1F5E8C'); wg.addColorStop(1, '#5FB0DA');
  c.fillStyle = wg; c.fillRect(-520, -300, 1040, 400);
  for (let i = 0; i < 7; i++) { // caustic ripples
    const yy = -260 + i * 40 + 8 * Math.sin(t * 2 + i);
    c.beginPath(); for (let xx = -520; xx <= 520; xx += 20) c.lineTo(xx, yy + 10 * Math.sin(xx / 60 + t * 3 + i)); c.lineWidth = 3; c.strokeStyle = 'rgba(255,255,255,0.10)'; c.stroke();
  }
  // bone
  c.fillStyle = '#F2EAD8'; c.fillRect(-520, fatB, 1040, 100);
  line(c, -520, fatB, 520, fatB, 6, '#D8C9A8');
  // fat
  c.beginPath(); c.moveTo(-520, fatB);
  for (let xx = -520; xx <= 520; xx += 20) c.lineTo(xx, dermB + 6 * Math.sin(xx / 70));
  c.lineTo(520, fatB); c.closePath();
  const fg = c.createLinearGradient(0, dermB, 0, fatB); fg.addColorStop(0, '#F8DE9A'); fg.addColorStop(1, '#EDC56E');
  c.fillStyle = fg; c.fill();
  for (const L of LOBES) {
    const ly = lerp(dermB + 20, fatB - 20, (L.y - 360) / 260);
    c.beginPath(); c.arc(L.x, ly, L.r * (1 - 0.15 * sh), 0, 7); c.lineWidth = 3; c.strokeStyle = 'rgba(200,150,60,0.45)'; c.stroke();
  }
  // dermis
  const epiB = (xx) => surfY(xx, o) + 72 + 10 * Math.sin(xx * 0.09);
  c.beginPath(); c.moveTo(-520, dermB);
  for (let xx = -520; xx <= 520; xx += 10) c.lineTo(xx, epiB(xx));
  c.lineTo(520, dermB); c.closePath();
  const dg = c.createLinearGradient(0, 60, 0, dermB); dg.addColorStop(0, '#F6B5AE'); dg.addColorStop(1, '#E2878C');
  c.fillStyle = dg; c.fill();
  // blood vessels: arteriole + capillary loops + venule, squeezing
  const ar = lerp(22, 7, sq), vr = lerp(18, 10, sq);
  const artY = dermB - 60, venY = dermB - 22;
  const capA = 1 - 0.7 * sq;
  for (let xx = -420; xx <= 420; xx += 150) {
    const top = epiB(xx) + 10;
    c.beginPath(); c.moveTo(xx - 10, artY); c.quadraticCurveTo(xx - 22, (artY + top) / 2, xx, top); c.quadraticCurveTo(xx + 22, (venY + top) / 2, xx + 12, venY);
    c.lineWidth = lerp(5, 2, sq); c.strokeStyle = rgba('#E0303F', 0.55 * capA); c.stroke();
  }
  line(c, -520, venY, 520, venY, vr * 2, '#7A4FB8'); line(c, -520, venY - vr * 0.4, 520, venY - vr * 0.4, vr * 0.5, 'rgba(210,190,255,0.45)');
  line(c, -520, artY, 520, artY, ar * 2, '#D92B3A'); line(c, -520, artY - ar * 0.4, 520, artY - ar * 0.4, ar * 0.5, 'rgba(255,200,200,0.55)');
  if (o.flow !== 0) { // red cells streaming (slower as the vessels squeeze)
    const sp = (o.flow || 1) * lerp(260, 60, sq);
    for (let i = 0; i < 18; i++) {
      const xx = ((i * 64 + t * sp) % 1100) - 550;
      ellipse(c, xx, artY + 3 * Math.sin(i), ar * 0.7, ar * 0.5, '#FF6A74');
      ellipse(c, 520 - ((i * 70 + t * sp * 0.8) % 1100), venY, vr * 0.6, vr * 0.45, '#A48AE0');
    }
  }
  // sweat glands + ducts
  for (const gx of GLANDS) {
    const P = ductPath(gx, o);
    poly(c, P, 9, '#E9F4FF'); poly(c, P, 4, '#9CC8E6');
    const gy = 290 - 40 * sh;
    for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(gx + 10 * Math.sin(k * 2.2), gy + 10 + 7 * Math.cos(k * 1.7), 13, 0, 7); c.lineWidth = 7; c.strokeStyle = '#CFE6F7'; c.stroke(); }
  }
  // the nerve: a trunk through the fat with twigs to the vessels and glands
  const nY = dermB + 70;
  line(c, -520, nY, 520, nY, 14, '#E8B820'); line(c, -520, nY - 3, 520, nY - 3, 5, '#FFE27A');
  for (const gx of GLANDS) {
    c.beginPath(); c.moveTo(gx + 40, nY); c.quadraticCurveTo(gx + 60, (nY + artY) / 2, gx + 30, artY + 4);
    c.lineWidth = 5; c.strokeStyle = '#E8B820'; c.stroke();
  }
  // epidermis
  c.beginPath(); c.moveTo(-520, epiB(-520));
  for (let xx = -520; xx <= 520; xx += 10) c.lineTo(xx, epiB(xx));
  for (let xx = 520; xx >= -520; xx -= 5) c.lineTo(xx, surfY(xx, o));
  c.closePath();
  const eg = c.createLinearGradient(0, -20, 0, 90); eg.addColorStop(0, '#FBD7BF'); eg.addColorStop(1, '#F1B58F');
  c.fillStyle = eg; c.fill();
  c.beginPath(); for (let xx = -520; xx <= 520; xx += 5) c.lineTo(xx, surfY(xx, o) + 6);
  c.lineWidth = 5; c.strokeStyle = 'rgba(190,110,80,0.5)'; c.stroke(); // tough outer layer
  c.beginPath(); for (let xx = -520; xx <= 520; xx += 5) c.lineTo(xx, surfY(xx, o));
  c.lineWidth = 4; c.strokeStyle = '#8A4632'; c.stroke();
  // anchors: strands tying the skin down to the deep tissue
  const aa = o.anchors === undefined ? 0.8 : o.anchors;
  for (const ax of ANCH) {
    const y0 = epiB(ax), y1 = fatB;
    c.beginPath(); c.moveTo(ax, y0); c.bezierCurveTo(ax - 8, y0 + 120, ax + 8, y1 - 150, ax, y1);
    c.lineWidth = 6; c.strokeStyle = rgba('#FFF3EE', 0.75 * aa); c.stroke();
    circle(c, ax, y0, 7, rgba('#FFFFFF', 0.9 * aa));
  }
  // pores + water seeping down the ducts
  for (const gx of GLANDS) {
    const sy = surfY(gx, o);
    ellipse(c, gx, sy - 2, 12, 6, '#5E2A1E');
    const w = o.water || 0;
    if (w > 0) {
      const P = [...ductPath(gx, o)].reverse(), acc = polyLen(P), Lp = acc[acc.length - 1];
      for (let i = 0; i < 5; i++) {
        const k = ((t * 0.5 + i / 5 + gx * 0.001) % 1);
        if (k > w * 1.2) continue;
        const [px, py] = polyAt(P, acc, k * Lp * Math.min(1, w * 1.5));
        circle(c, px, py, 7, '#3FA2FF'); softDot(gctx, x + px * s, y + py * s, 22 * s, '#3FA2FF', 0.9);
      }
      for (let i = 0; i < 3; i++) { // droplets gathering above the pore
        const k = ((t * 0.8 + i / 3) % 1);
        circle(c, gx + 20 * Math.sin(i * 2 + t), sy - 70 + 60 * k, 9, rgba('#BFE6FF', 0.9 * w * (1 - k)));
      }
    }
  }
  c.restore();
  // signals along the nerve: the sensing message runs out (left), the order comes back (right)
  const sense = o.sense || 0, cmd = o.cmd || 0;
  if (sense > 0 && sense < 1.3) {
    for (let i = 0; i < 4; i++) {
      const px = lerp(GLANDS[2], -560, clamp(sense * 1.1 - i * 0.07));
      circle(c, px, nY, 11, '#FFFFFF'); softDot(gctx, x + px * s, y + nY * s, 40 * s, '#FFD447', 1);
    }
  }
  if (cmd > 0) {
    for (let i = 0; i < 5; i++) {
      const px = lerp(-560, 480, clamp(cmd * 1.1 - i * 0.06));
      circle(c, px, nY, 11, '#FFF2E0'); softDot(gctx, x + px * s, y + nY * s, 40 * s, '#FF7A3C', 1);
    }
    if (cmd > 0.5) for (const gx of GLANDS) softDot(gctx, x + (gx + 30) * s, y + (artY + 4) * s, 60 * s, '#FF5A3C', (cmd - 0.5) * 2 * (1 - 0.5 * sq));
  }
  c.restore();
  // frame + labels (screen space)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -520, -300, 1040, 1000, 60); ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(232,238,255,0.9)'; ctx.stroke();
  ctx.restore();
  const L = o.labels || {};
  const P = (lx, ly) => [x + lx * s, y + ly * s];
  if (L.pore) pill(...P(GLANDS[3] + 20, -170), 'SWEAT PORE', '#7FE9FF', L.pore, 44);
  if (L.nerve) pill(...P(-230, nY + 80), 'NERVE', '#FFD447', L.nerve, 44);
  if (L.vessel) pill(...P(250, artY - 80), 'BLOOD VESSEL', '#FF7A86', L.vessel, 44);
  if (L.anchor) pill(...P(ANCH[3], fatB - 70), 'ANCHORS', '#FFF3EE', L.anchor, 40);
  return { nerveY: nY, artY, dermB };
}
