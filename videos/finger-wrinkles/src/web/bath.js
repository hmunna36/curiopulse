// Bathroom at night: tiled wall, clawfoot tub, water + foam, rubber duck, soap bar, steam —
// and the hiker (bare shoulders) soaking in it. Front view, world coords = screen at zoom 1.
'use strict';

const BARE = Object.assign({}, PAL, { coat: PAL.skin, coatSh: PAL.skinSh, coatHi: PAL.skinHi, coatDk: '#B8704F', bare: true });
const TUB = { x0: 60, x1: 1020, rim: 1185, water: 1150, bottom: 1690 };
const TUBC = { x: 540, y: 1330, s: 1.35 };          // the soaker's placement (feet origin; pelvis under water)
let TILEC = null, FOAM = null, STEAMP = null;

function initBath() {
  // tile wall, pre-rendered: world (-300..1380) x (-700..1400)
  TILEC = mkCanvas(1680, 2100);
  const x = TILEC.getContext('2d'), rng = mulberry32(12);
  const g = x.createLinearGradient(0, 0, 0, 2100);
  g.addColorStop(0, '#173F57'); g.addColorStop(0.6, '#24607D'); g.addColorStop(1, '#1B4A63');
  x.fillStyle = '#0E2A3B'; x.fillRect(0, 0, 1680, 2100);
  const T = 112;
  for (let r = 0; r < 2100 / T; r++) for (let q = 0; q < 1680 / T; q++) {
    const tx = q * T + 4, ty = r * T + 4, v = (rng() - 0.5) * 0.08;
    x.fillStyle = g; x.fillRect(tx, ty, T - 8, T - 8);
    x.fillStyle = v > 0 ? `rgba(255,255,255,${v})` : `rgba(0,0,0,${-v})`; x.fillRect(tx, ty, T - 8, T - 8);
    const hg = x.createLinearGradient(tx, ty, tx + T, ty + T);
    hg.addColorStop(0, 'rgba(255,255,255,0.10)'); hg.addColorStop(0.35, 'rgba(255,255,255,0)'); hg.addColorStop(1, 'rgba(0,0,0,0.10)');
    x.fillStyle = hg; x.fillRect(tx, ty, T - 8, T - 8);
  }
  // a decorative border row of darker tiles at the tub line
  x.fillStyle = 'rgba(8,24,36,0.55)'; x.fillRect(0, 700 + 1180 - 170, 1680, 60);
  FOAM = [];
  for (let i = 0; i < 90; i++) {
    const a = rng();
    FOAM.push({ x: 120 + rng() * 840, y: TUB.water + (rng() - 0.6) * 26, r: 10 + Math.pow(rng(), 2) * 34, ph: rng() * 6, a });
  }
  FOAM.sort((p, q) => p.y - q.y);
  STEAMP = [...Array(14)].map(() => ({ x: 150 + rng() * 780, ph: rng(), sp: 0.12 + rng() * 0.08, r: 90 + rng() * 120, sw: rng() * 6 }));
}

function bathWall(cam, t, o = {}) {
  applyCam(cam);
  ctx.drawImage(TILEC, -300, -700);
  // warm vanity light (top-left) + cool night window (top-right)
  softDot(ctx, 160, 120, 900, '#FFB870', 0.16);
  softDot(gctx, 160, 60, 260, '#FFC888', 0.8);
  rrect(ctx, 90, 20, 140, 60, 26); ctx.fillStyle = '#FFE6B8'; ctx.fill();
  rrect(ctx, 80, 70, 160, 18, 8); ctx.fillStyle = '#B08A5A'; ctx.fill();
  // frosted window
  rrect(ctx, 720, 150, 250, 320, 20); ctx.fillStyle = '#10223A'; ctx.fill();
  ctx.save(); rrect(ctx, 734, 164, 222, 292, 12); ctx.clip();
  const wg = ctx.createRadialGradient(880, 250, 10, 860, 300, 260);
  wg.addColorStop(0, '#DCE8FF'); wg.addColorStop(0.3, '#7F9CD8'); wg.addColorStop(1, '#1D3260');
  ctx.fillStyle = wg; ctx.fillRect(734, 164, 222, 292);
  ctx.restore();
  line(ctx, 845, 164, 845, 456, 8, '#10223A'); line(ctx, 734, 310, 956, 310, 8, '#10223A');
  softDot(gctx, 880, 250, 160, '#BFD4FF', 0.5);
  // shelf with bottles
  rrect(ctx, 700, 610, 300, 18, 6); ctx.fillStyle = '#D9D2C4'; ctx.fill();
  const bottles = [[730, 70, '#FF7A9A'], [790, 96, '#7FD4C8'], [850, 60, '#FFD166'], [905, 84, '#B39DFF']];
  for (const [bx, bh, col] of bottles) {
    rrect(ctx, bx, 610 - bh, 44, bh, 10); ctx.fillStyle = col; ctx.fill();
    rrect(ctx, bx + 12, 610 - bh - 16, 20, 18, 4); ctx.fillStyle = '#F4F0E6'; ctx.fill();
    rrect(ctx, bx + 6, 610 - bh + 10, 8, bh - 20, 4); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fill();
  }
  // towel on a rail
  line(ctx, 60, 520, 300, 520, 10, '#C9C2B6');
  ctx.beginPath(); ctx.moveTo(90, 520); ctx.lineTo(270, 520); ctx.lineTo(262, 800); ctx.quadraticCurveTo(180, 820, 98, 800); ctx.closePath();
  ctx.fillStyle = '#E86A5A'; ctx.fill();
  for (let yy = 560; yy < 790; yy += 60) line(ctx, 96, yy, 266, yy, 6, 'rgba(255,255,255,0.35)');
}

// the far half of the tub (behind the soaker) + the water surface
function tubBack(t) {
  ctx.beginPath(); ctx.ellipse(540, TUB.water, 470, 58, 0, Math.PI, 0); ctx.fillStyle = '#E9EEF4'; ctx.fill();
  ctx.beginPath(); ctx.ellipse(540, TUB.water + 2, 440, 40, 0, 0, Math.PI * 2);
  const wg = ctx.createLinearGradient(0, TUB.water - 40, 0, TUB.water + 40);
  wg.addColorStop(0, '#9FD9F2'); wg.addColorStop(1, '#58A9D0');
  ctx.fillStyle = wg; ctx.fill();
}
// water band over the soaker's body at the waterline, ripples, foam
function tubWater(t, o = {}) {
  const ripple = o.ripple || 0;
  ctx.save();
  ctx.beginPath(); ctx.ellipse(540, TUB.water + 2, 440, 40, 0, 0, Math.PI * 2); ctx.clip();
  const wg = ctx.createLinearGradient(0, TUB.water - 40, 0, TUB.water + 40);
  wg.addColorStop(0, 'rgba(160,220,245,0.92)'); wg.addColorStop(1, 'rgba(80,165,210,0.96)');
  ctx.fillStyle = wg; ctx.fillRect(80, TUB.water - 45, 920, 90);
  for (let i = 0; i < 6; i++) {
    const ph = (t * 0.6 + i / 6) % 1;
    ctx.beginPath(); ctx.ellipse(o.rx || 540, TUB.water + 2, 60 + ph * 400, 6 + ph * 36, 0, 0, Math.PI * 2);
    ctx.lineWidth = 3; ctx.strokeStyle = `rgba(255,255,255,${(0.25 + 0.5 * ripple) * (1 - ph)})`; ctx.stroke();
  }
  ctx.restore();
  // foam
  for (const f of FOAM) {
    if (o.foamA !== undefined && f.a > o.foamA) continue;
    const bob = 3 * Math.sin(t * 1.6 + f.ph);
    const r = f.r * (1 + 0.04 * Math.sin(t * 2 + f.ph));
    const gg = ctx.createRadialGradient(f.x - r * 0.35, f.y + bob - r * 0.4, r * 0.1, f.x, f.y + bob, r);
    gg.addColorStop(0, '#FFFFFF'); gg.addColorStop(0.7, '#EAF4FF'); gg.addColorStop(1, '#BFD6EA');
    ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(f.x, f.y + bob, r, 0, 7); ctx.fill();
  }
}
// the tub front: enamel body, rolled rim, clawed feet, faucet
function tubFront(t) {
  ctx.beginPath();
  ctx.moveTo(TUB.x0, TUB.rim);
  ctx.lineTo(TUB.x1, TUB.rim);
  ctx.bezierCurveTo(TUB.x1 + 10, 1460, 920, TUB.bottom, 760, TUB.bottom);
  ctx.lineTo(320, TUB.bottom);
  ctx.bezierCurveTo(160, TUB.bottom, TUB.x0 - 10, 1460, TUB.x0, TUB.rim);
  ctx.closePath();
  const g = ctx.createLinearGradient(TUB.x0, 0, TUB.x1, 0);
  g.addColorStop(0, '#AEB9C8'); g.addColorStop(0.18, '#F4F7FB'); g.addColorStop(0.45, '#FFFFFF'); g.addColorStop(0.8, '#DDE4EE'); g.addColorStop(1, '#A3AEBF');
  ctx.fillStyle = g; ctx.fill();
  const g2 = ctx.createLinearGradient(0, TUB.rim, 0, TUB.bottom);
  g2.addColorStop(0, 'rgba(0,0,0,0)'); g2.addColorStop(1, 'rgba(20,40,70,0.25)');
  ctx.fillStyle = g2; ctx.fill();
  // specular stripe
  ctx.beginPath(); ctx.moveTo(210, TUB.rim + 40); ctx.bezierCurveTo(190, 1420, 260, 1600, 330, 1650);
  ctx.lineWidth = 16; ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineCap = 'round'; ctx.stroke();
  // rolled rim
  rrect(ctx, TUB.x0 - 22, TUB.rim - 24, TUB.x1 - TUB.x0 + 44, 50, 25);
  const rg = ctx.createLinearGradient(0, TUB.rim - 24, 0, TUB.rim + 26);
  rg.addColorStop(0, '#FFFFFF'); rg.addColorStop(0.5, '#E8EEF5'); rg.addColorStop(1, '#B9C4D2');
  ctx.fillStyle = rg; ctx.fill();
  // clawed feet
  for (const fx of [230, 850]) {
    ctx.beginPath(); ctx.moveTo(fx - 50, TUB.bottom - 30); ctx.quadraticCurveTo(fx - 70, TUB.bottom + 70, fx - 20, TUB.bottom + 90);
    ctx.lineTo(fx + 20, TUB.bottom + 90); ctx.quadraticCurveTo(fx + 70, TUB.bottom + 70, fx + 50, TUB.bottom - 30); ctx.closePath();
    ctx.fillStyle = '#C9A24A'; ctx.fill();
    for (const k of [-24, 0, 24]) circle(ctx, fx + k, TUB.bottom + 88, 13, '#B38A34');
  }
  // faucet on the left rim
  rrect(ctx, 96, TUB.rim - 150, 34, 130, 14); ctx.fillStyle = '#C7CFDA'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(113, TUB.rim - 150); ctx.quadraticCurveTo(113, TUB.rim - 210, 190, TUB.rim - 200); ctx.lineTo(190, TUB.rim - 176);
  ctx.quadraticCurveTo(140, TUB.rim - 180, 130, TUB.rim - 140); ctx.closePath(); ctx.fillStyle = '#DCE3EC'; ctx.fill();
  rrect(ctx, 180, TUB.rim - 204, 22, 34, 8); ctx.fillStyle = '#AEB8C6'; ctx.fill();
  line(ctx, 104, TUB.rim - 140, 104, TUB.rim - 40, 5, 'rgba(255,255,255,0.8)');
  // floor
  const fg = ctx.createLinearGradient(0, TUB.bottom + 60, 0, TUB.bottom + 700);
  fg.addColorStop(0, '#3A3040'); fg.addColorStop(1, '#1C1622');
  ctx.fillStyle = fg; ctx.fillRect(-400, TUB.bottom + 90, 1900, 900);
}
function duck(x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y + 5 * Math.sin(t * 2.2)); ctx.rotate(0.06 * Math.sin(t * 1.7) + (o.rot || 0)); ctx.scale(s * (o.flip ? -1 : 1), s);
  ellipse(ctx, 0, -10, 70, 44, '#FFD23F');
  ellipse(ctx, 18, -2, 46, 26, '#F5B82E');
  circle(ctx, -40, -62, 38, '#FFD23F');
  ctx.beginPath(); ctx.moveTo(-74, -58); ctx.quadraticCurveTo(-104, -54, -100, -44); ctx.quadraticCurveTo(-86, -40, -70, -46); ctx.closePath();
  ctx.fillStyle = '#FF8A1F'; ctx.fill();
  const bonk = o.bonk || 0;
  if (bonk > 0.05) { // dizzy x-eyes
    line(ctx, -54, -76, -40, -62, 5, '#1A1300'); line(ctx, -54, -62, -40, -76, 5, '#1A1300');
  } else { circle(ctx, -48, -70, 7, '#1A1300'); circle(ctx, -50, -72, 2.5, '#FFFFFF'); }
  ellipse(ctx, -20, -86, 16, 8, 'rgba(255,255,255,0.6)', -0.4);
  ctx.restore();
}
function soapBar(x, y, s, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  rrect(ctx, -70, -30, 140, 60, 26); ctx.fillStyle = '#FFB3C8'; ctx.fill();
  rrect(ctx, -60, -26, 120, 22, 12); ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fill();
  for (const [bx, by, br] of [[-40, -38, 10], [30, -42, 14], [60, -30, 8]]) {
    ctx.beginPath(); ctx.arc(bx, by, br, 0, 7); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.stroke();
  }
  ctx.restore();
}
function steam(t, a = 1) {
  for (const p of STEAMP) {
    const k = ((t * p.sp + p.ph) % 1);
    const y = TUB.water - k * 900, x = p.x + 60 * Math.sin(t * 0.5 + p.sw + k * 3);
    softDot(ctx, x, y, p.r * (0.6 + k), '#FFFFFF', 0.10 * a * Math.sin(Math.PI * k));
  }
}
// arms from the elbow down, drawn over the rim so the hands rest on it
function armsOver(st, r, pal, which = ['L', 'R'], handKind = 'open') {
  const c = ctx;
  c.save(); c.translate(st.x, st.y); c.scale(st.s, st.s);
  for (const k of which) {
    const s = k === 'L' ? -1 : 1;
    capsuleShaded(c, r['el' + k], r['wr' + k], 38, pal.coat, pal.coatSh, pal.coatHi, pal);
    const wr = r['wr' + k], d = r['armDir' + k];
    drawHand(c, wr, d, handKind, pal, s, 0);
  }
  c.restore();
}
const POSE_TUB = { hipY: -34, lean: 0, armL: { a: 1.0, b: -0.12 }, armR: { a: 1.0, b: -0.12 }, legL: { a: 2.25, b: -1.95 }, legR: { a: 2.25, b: -1.95 }, hand: 'open', feetFront: 1 };
// the whole bathroom with the soaker. o: pose, face, frizz, headDX/DY/Rot, armsOver ('LR' | 'L' | 'R' | ''), duck, soap, ripple, bodyDY
function bathScene(cam, t, o = {}) {
  screenSpace(); ctx.fillStyle = '#0E2A3B'; ctx.fillRect(0, 0, W, H);
  bathWall(cam, t, o);
  applyCam(cam);
  tubBack(t);
  const st = { x: TUBC.x + (o.dx || 0), y: TUBC.y + (o.bodyDY || 0), s: TUBC.s, pose: o.pose || POSE_TUB, face: o.face || FACES.calm,
    frizz: o.frizz || 0, soot: 0, seed: 3, noLegs: true, headDX: o.headDX || 0, headDY: o.headDY || 0, headRot: o.headRot || 0 };
  const r = charLayer(cam, st, t, {
    ambient: 0.06, pal: BARE,
    post: (lc, rr) => {
      lc.setTransform(1, 0, 0, 1, 0, 0); lc.globalCompositeOperation = 'source-atop';
      const [lx] = toScreen(cam, 160, 100);
      const g = lc.createLinearGradient(lx, 0, lx + 900, 0);
      g.addColorStop(0, 'rgba(255,190,120,0.20)'); g.addColorStop(1, 'rgba(90,140,220,0.12)');
      lc.fillStyle = g; lc.fillRect(0, 0, W, H); lc.globalCompositeOperation = 'source-over';
      if (o.post) { camTransform(lc, cam, 1); o.post(lc, rr, st); }
    },
  });
  applyCam(cam);
  tubWater(t, { ripple: o.ripple || 0, rx: o.rx });
  if (o.duck !== false) duck(o.duckX || 830, TUB.water - 10 + (o.duckDY || 0), 0.9, t, { bonk: o.bonk || 0, rot: o.duckRot || 0 });
  tubFront(t);
  if (o.soap !== false && !o.soapPos) soapBar(930, TUB.rim - 44, 0.8, 0.05);
  if (o.soapPos) soapBar(o.soapPos[0], o.soapPos[1], 0.8, o.soapPos[2] || 0);
  const which = o.armsOver === undefined ? ['L', 'R'] : o.armsOver.split('');
  if (which.length) armsOver(st, r, BARE, which, o.handKind || 'open');
  steam(t, o.steam === undefined ? 1 : o.steam);
  return { st, r };
}
