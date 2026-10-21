// Why Do Some People Have NO Wrist Tendon? Short: the other places and props.
//   jungle: hypnic-jerk's moonlit jungle (borrowed: the moon, the canopy, the near tree and its branch) with a NEW
//     ancestor hanging from the branch by one arm, the little muscle glowing in its forearm (jgBack, jgAncestor)
//   gripMeter(x, y, s, val, t, o)   a hand grip meter (a dial on a handle) and the fist round its handle (screen space)
//   the ball park at night (initPark, parkBack), PITCHPAL, pitch poses (PITCH), the cap, the glove, the ball, and the
//     round window on his elbow with the new ligament in it (elbowWindow)
//   deleteDialog(x, y, k, o)        a computer's "Delete this muscle?" box with YES / LATER and a cursor (screen space)
//   tagPill, burstWord               small labels (vulcan-salute's)
'use strict';

// ---------------------------------------------------------------- small graphics (screen space)
function tagPill(txt, x, y, col, k, size = 40, ink = '#0B0B1A') {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + size * 0.9, h = size * 1.5;
  rrect(ctx, -w / 2 - 4, -h / 2 - 4, w + 8, h + 8, h / 2 + 4); ctx.fillStyle = '#0B0B1A'; ctx.fill();
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = col; ctx.fill();
  ctx.fillStyle = ink; ctx.fillText(txt, 0, 2);
  ctx.restore();
}
function burstWord(txt, x, y, r, k, col = '#FFD447', ink = '#0B0B1A', rot = -0.08, seed = 3) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const rng = mulberry32(seed), n = 14;
  ctx.beginPath();
  for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2, rr = i % 2 ? r * (0.72 + 0.08 * rng()) : r * (1.0 + 0.1 * rng()); ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr * 0.78); }
  ctx.closePath(); ctx.lineWidth = 10; ctx.strokeStyle = '#0B0B1A'; ctx.stroke(); ctx.fillStyle = col; ctx.fill();
  ctx.font = `400 ${r * 0.62}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = ink; ctx.fillText(txt, 0, 3);
  ctx.restore();
}

// ---------------------------------------------------------------- the jungle (hypnic-jerk's, borrowed) and the ancestor
let JG_LEAVES = null, JG_STARS = null;
function initJungle() {
  const rng = mulberry32(606);
  JG_LEAVES = [...Array(46)].map(() => ({ x: -200 + rng() * 1500, y: 450 + rng() * 700, r: 50 + rng() * 90, ph: rng() * 6, d: rng() }));
  const r2 = mulberry32(77);
  JG_STARS = [...Array(90)].map(() => ({ x: r2(), y: r2(), r: 0.8 + r2() * 1.8, ph: r2() * 6 }));
}
const JG_MOON = { x: 540, y: 700, r: 300 };
function jgLeaf(c, x, y, r, col, rot = 0) {
  c.fillStyle = col;
  for (let i = 0; i < 7; i++) {
    const a = rot + i * 0.9, lx = x + Math.cos(a) * r * 0.35, ly = y + Math.sin(a) * r * 0.25;
    c.save(); c.translate(lx, ly); c.rotate(a);
    c.beginPath(); c.moveTo(-r * 0.62, 0); c.quadraticCurveTo(0, -r * 0.3, r * 0.62, 0); c.quadraticCurveTo(0, r * 0.3, -r * 0.62, 0); c.fill();
    c.restore();
  }
}
// the branch's top edge at world x (the ancestor's hand holds it)
function jgBranchY(x, sway) { const u = clamp((x - 60) / 1240); return lerp(900 + sway, 870 + sway * 0.6, u); }
function jgBack(cam, t, o = {}) {
  screenSpace();
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#050820'); g.addColorStop(0.45, '#121A4E'); g.addColorStop(0.75, '#231C5A'); g.addColorStop(1, '#0A0A20');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const pm = parallax(cam, 0.3);
  camTransform(ctx, pm, 1); camTransform(gctx, pm, 0.5);
  for (const s of JG_STARS) circle(ctx, -300 + s.x * 1700, -200 + s.y * 1400, s.r, `rgba(220,230,255,${0.3 + 0.3 * Math.sin(t * 2 + s.ph)})`);
  const M = JG_MOON;
  const halo = ctx.createRadialGradient(M.x, M.y, M.r * 0.9, M.x, M.y, M.r * 2.1);
  halo.addColorStop(0, 'rgba(170,190,255,0.45)'); halo.addColorStop(1, 'rgba(120,140,255,0)');
  ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(M.x, M.y, M.r * 2.1, 0, 7); ctx.fill();
  const mg = ctx.createRadialGradient(M.x - 80, M.y - 90, 30, M.x, M.y, M.r);
  mg.addColorStop(0, '#F4F7FF'); mg.addColorStop(0.7, '#D9E3FF'); mg.addColorStop(1, '#B7C7F5');
  ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(M.x, M.y, M.r, 0, 7); ctx.fill();
  for (const [dx, dy, r] of [[-110, -60, 50], [90, 40, 70], [-20, 150, 40], [140, -130, 30], [-160, 100, 28]]) circle(ctx, M.x + dx, M.y + dy, r, 'rgba(150,165,215,0.3)');
  softDot(gctx, M.x, M.y, M.r * 1.4, '#BFD4FF', 0.32);
  const pf = parallax(cam, 0.55);
  camTransform(ctx, pf, 1);
  for (const L of JG_LEAVES) if (L.d < 0.5) jgLeaf(ctx, L.x, 1240 + L.y * 0.3 + 30 * Math.sin(L.ph), L.r * 1.4, '#171A4A', L.ph);
  ctx.fillStyle = '#12143F'; ctx.fillRect(-500, 1420, 2100, 1200);
  applyCam(cam);
  const sway = 6 * Math.sin(t * loopW(0.8)) + (o.bounce || 0);
  const tree = (c, col) => {
    c.beginPath(); c.moveTo(-260, 2300); c.bezierCurveTo(-120, 1500, -40, 1100, 60, 900 + sway);
    c.lineTo(1300, 870 + sway * 0.6); c.lineTo(1300, 935 + sway * 0.6); c.bezierCurveTo(700, 955 + sway, 300, 965 + sway, 140, 1005 + sway);
    c.bezierCurveTo(60, 1250, 20, 1600, 60, 2300); c.closePath(); c.fillStyle = col; c.fill();
    for (const L of JG_LEAVES) if (L.d > 0.62) jgLeaf(c, L.x, L.y - 260 + 8 * Math.sin(t * 1.1 + L.ph), L.r * 1.1, col, L.ph);
  };
  tree(ctx, '#06051A'); tree(gctx, '#000000');
  ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(190,205,255,0.45)';
  ctx.beginPath(); ctx.moveTo(60, 902 + sway); ctx.lineTo(1300, 872 + sway * 0.6); ctx.stroke();
  return sway;
}
// an ancestor hanging below the branch by its left arm: its hand at (x, y) on the branch, swinging by `swing` (rad).
// Front view, a silhouette lit by the moon behind it. o: {glow 0..1 (the little muscle in the hanging forearm lights up),
// squeeze 0..1 (it grips: the muscle fattens), look (-1..1), grin 0..1, blink 0..1, reach 0..1 (the free arm reaches up)}
// occ = a plain black occluder into the glow layer
function jgAncestor(c, x, y, s, t, o = {}, occ = false) {
  const dark = occ ? '#000000' : '#0B0819', rim = 'rgba(200,215,255,0.75)', sw = o.swing || 0;
  c.save(); c.translate(x, y); c.rotate(sw); c.scale(s, s);
  const lineD = (a, b, w) => line(c, a[0], a[1], b[0], b[1], w, dark);
  // the hanging arm: hand on the branch (origin), elbow, shoulder
  const hand = [0, 0], el = [6, 92], sh = [-4, 186];
  lineD(hand, el, 30); lineD(el, sh, 34);
  // the hand curled over the branch
  c.beginPath(); c.arc(0, -4, 21, Math.PI * 0.95, Math.PI * 2.25); c.lineWidth = 16; c.strokeStyle = dark; c.lineCap = 'round'; c.stroke();
  circle(c, 0, 4, 17, dark);
  // the body hangs under the shoulder, the head beside the arm
  c.save(); c.translate(-30, 290); c.rotate(-0.06);
  c.beginPath(); c.ellipse(0, 0, 62, 100, 0, 0, Math.PI * 2); c.fillStyle = dark; c.fill();
  c.restore();
  // the free arm, hanging or reaching up
  const rk = clamp(o.reach || 0), fsh = [-86, 214], fel = [lerp(-112, -104, rk), lerp(300, 136, rk)], fhd = [lerp(-104, -80, rk), lerp(388, 48, rk)];
  lineD(fsh, fel, 28); lineD(fel, fhd, 26); circle(c, fhd[0], fhd[1], 15, dark);
  // legs, knees bent, dangling, and the long tail that curls
  for (const [hx, kx, fx, ph] of [[-56, -76, -58, 0], [-4, 16, 2, 1.3]]) {
    const dk = 6 * Math.sin(t * loopW(2.4) + ph);
    lineD([hx, 368], [kx + dk, 452], 30); lineD([kx + dk, 452], [fx + dk, 540], 26); ellipse(c, fx + dk, 548, 18, 11, dark);
  }
  c.beginPath(); c.moveTo(-10, 380); c.bezierCurveTo(60, 470, 120, 520, 96, 600); c.bezierCurveTo(80, 650, 30, 640, 44, 606);
  c.lineWidth = 13; c.strokeStyle = dark; c.lineCap = 'round'; c.stroke();
  // the head
  const hx = -64, hy = 150;
  circle(c, hx, hy, 50, dark); ellipse(c, hx - 4, hy + 30, 30, 22, dark);
  for (const ex of [-1, 1]) circle(c, hx + ex * 50, hy - 4, 15, dark);
  if (!occ) {
    // the moon on its outline (top left)
    c.lineWidth = 5; c.strokeStyle = rim; c.lineCap = 'round';
    c.beginPath(); c.arc(hx, hy, 50, Math.PI * 1.05, Math.PI * 1.7); c.stroke();
    c.beginPath(); c.arc(0, -4, 21, Math.PI * 1.1, Math.PI * 1.7); c.stroke();
    c.beginPath(); c.moveTo(-15, 12); c.lineTo(-9, 90); c.stroke();
    c.save(); c.translate(-30, 290); c.rotate(-0.06); c.beginPath(); c.ellipse(0, 0, 62, 100, 0, Math.PI * 1.1, Math.PI * 1.55); c.stroke(); c.restore();
    // the face: a lighter mask, eyes, a mouth
    paint(() => {
      ellipse(c, hx, hy + 8, 32, 30, '#2E2648');
      const bl = clamp(o.blink || 0), look = o.look || 0;
      for (const ex of [-1, 1]) {
        if (bl > 0.9) line(c, hx + ex * 13 - 6, hy - 2, hx + ex * 13 + 6, hy - 2, 3, '#CFD8FF');
        else { circle(c, hx + ex * 13, hy - 2, 7.5, '#FFFFFF'); circle(c, hx + ex * 13 + 2.5 * look, hy - 1, 3.6, '#0C0A1C'); }
      }
      const gr = o.grin || 0;
      c.beginPath(); c.moveTo(hx - 14, hy + 22); c.quadraticCurveTo(hx, hy + 22 + 12 * gr, hx + 14, hy + 22); c.lineWidth = 3.5; c.strokeStyle = '#E8E0FF'; c.stroke();
    });
    // the little muscle in the hanging forearm, glowing: a spindle near the elbow, its cord up to the hand
    const gk = clamp(o.glow || 0), sq = clamp(o.squeeze || 0);
    if (gk > 0.01) paint(() => {
      c.save(); c.globalAlpha = gk;
      c.beginPath(); c.moveTo(3, 84); c.bezierCurveTo(-8 - 3 * sq, 66, -7 - 3 * sq, 44, 1, 30); c.bezierCurveTo(9 + 3 * sq, 44, 10 + 3 * sq, 66, 3, 84); c.closePath();
      c.fillStyle = '#FF8A5C'; c.fill();
      line(c, 1, 30, 0, 6, 4, '#FFE7A8');
      c.restore();
    });
  }
  c.restore();
  // the glow of that muscle (screen space through c's transform)
  if (!occ && (o.glow || 0) > 0.01) {
    const m = c.getTransform(), cs = Math.cos(sw), sn = Math.sin(sw), P = (px, py) => { const lx = x + (px * cs - py * sn) * s, ly = y + (px * sn + py * cs) * s; return [(m.a * lx + m.c * ly + m.e) * 0.5, (m.b * lx + m.d * ly + m.f) * 0.5]; };
    gctx.save(); gctx.setTransform(1, 0, 0, 1, 0, 0);
    const a = P(1, 70), b = P(0, 10), sc = Math.hypot(m.a, m.b) * s * 0.5;
    softDot(gctx, a[0], a[1], 40 * sc, '#FF8A5C', 0.65 * o.glow);
    poly(gctx, [a, b], 9 * sc, rgba('#FFD98A', 0.6 * o.glow));
    gctx.restore();
  }
}

// ---------------------------------------------------------------- the grip meter (screen space)
// a dial on a handle; val = the reading (0..60); o: {k pop-in, label, labelCol, tremble, fist 0..1 (his fingers round the
// handle), shake}
function gripMeter(x, y, s, val, t, o = {}) {
  const k = o.k === undefined ? 1 : clamp(o.k);
  if (k <= 0.01) return;
  const q = E.outBack(k, 1.7) * s, sh = (o.shake || 0) * 3;
  screenSpace();
  ctx.save(); ctx.translate(x + sh * Math.sin(t * 61), y + sh * Math.cos(t * 53)); ctx.scale(q, q);
  // the handle: a grey D, the fist round its lower bar
  ctx.lineCap = 'round';
  line(ctx, -46, 70, -46, 190, 20, '#1E2233'); line(ctx, -46, 70, -46, 190, 14, '#8C93A8');
  line(ctx, 30, 84, 30, 176, 22, '#1E2233'); line(ctx, 30, 84, 30, 176, 16, '#B8BED0');
  line(ctx, -46, 190, 30, 176, 16, '#1E2233'); line(ctx, -46, 72, 30, 84, 16, '#1E2233');
  // the dial
  circle(ctx, 0, 0, 86, '#1E2233'); circle(ctx, 0, 0, 78, '#F4F1E8');
  paint(() => {
    for (let i = 0; i <= 12; i++) {
      const a = Math.PI * (0.75 + 1.5 * i / 12), r0 = i % 3 ? 62 : 56;
      line(ctx, Math.cos(a) * r0, Math.sin(a) * r0, Math.cos(a) * 72, Math.sin(a) * 72, i % 3 ? 2.5 : 4, '#2A2E40');
    }
    ctx.font = '800 20px Montserrat'; ctx.fillStyle = '#2A2E40'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const [i, n] of [[4, '20'], [8, '40']]) { const a = Math.PI * (0.75 + 1.5 * i / 12); ctx.fillText(n, Math.cos(a) * 42, Math.sin(a) * 42); }
    const a = Math.PI * (0.75 + 1.5 * clamp(val / 60)) + 0.02 * (o.tremble || 0) * Math.sin(t * 47);
    line(ctx, -Math.cos(a) * 10, -Math.sin(a) * 10, Math.cos(a) * 64, Math.sin(a) * 64, 5, '#E8394B');
    circle(ctx, 0, 0, 9, '#2A2E40');
    rrect(ctx, -34, 22, 68, 32, 8); ctx.fillStyle = '#1E2233'; ctx.fill();
    ctx.font = '900 24px Montserrat'; ctx.fillStyle = '#7FE9FF'; ctx.fillText(String(Math.round(val)), 0, 39);
  });
  // his fingers round the handle's front bar
  const fk = clamp(o.fist === undefined ? 1 : o.fist);
  if (fk > 0.01) {
    for (let i = 0; i < 4; i++) { rrect(ctx, -70, 96 + i * 22, 112, 22, 11); ctx.fillStyle = ['#F2B892', '#EFB08A', '#F2B892', '#EDAA84'][i]; ctx.fill(); }
    paint(() => { for (let i = 0; i < 4; i++) { rrect(ctx, -70, 96 + i * 22, 112, 22, 11); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(150,76,50,0.7)'; ctx.stroke(); } });
  }
  ctx.restore();
  if (o.label) tagPill(o.label, x, y - 118 * q, o.labelCol || '#FFD447', k, 34);
}

// ---------------------------------------------------------------- the ball park at night
let PARK_C = null;
const PITCHPAL = Object.assign({}, PAL, {
  coat: '#F3F3F6', coatSh: '#C7CBD8', coatHi: '#FFFFFF', coatDk: '#D2343F', pants: '#E6E6EE', pantsSh: '#B6BAC8',
  shoe: '#24242C', shoeSh: '#14141A', sole: '#E8E8E8', pj: true,
});
function initPark() {
  const c0 = mkCanvas(1080, 1920), x = c0.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, 900); g.addColorStop(0, '#04071A'); g.addColorStop(1, '#16204A');
  x.fillStyle = g; x.fillRect(0, 0, 1080, 1920);
  // the stands: tiers of dark seats with a sprinkle of fans' lights
  for (let i = 0; i < 6; i++) {
    const y = 420 + i * 70;
    x.fillStyle = i % 2 ? '#141A36' : '#10152E'; x.fillRect(0, y, 1080, 70);
    const r = mulberry32(300 + i);
    for (let j = 0; j < 60; j++) circle(x, r() * 1080, y + 10 + r() * 50, 3 + r() * 3, r() < 0.5 ? 'rgba(120,140,200,0.35)' : 'rgba(200,170,150,0.3)');
  }
  // the outfield wall with its ads, then the grass in stripes
  x.fillStyle = '#0E3A2E'; x.fillRect(0, 840, 1080, 90);
  for (const [ax, col] of [[60, '#C8323C'], [420, '#2F5FB8'], [780, '#E8A93A']]) { rrect(x, ax, 858, 260, 54, 8); x.fillStyle = col; x.fill(); }
  x.fillStyle = 'rgba(255,255,255,0.85)'; x.font = '900 34px Montserrat'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText('CURIO', 190, 886); x.fillText('PULSE', 550, 886); x.fillText('ICE COLD', 910, 886);
  const gg = x.createLinearGradient(0, 930, 0, 1920); gg.addColorStop(0, '#1F6B3C'); gg.addColorStop(1, '#0E3A22');
  x.fillStyle = gg; x.fillRect(0, 930, 1080, 990);
  for (let i = 0; i < 9; i++) { x.fillStyle = 'rgba(255,255,255,0.035)'; x.beginPath(); x.moveTo(i * 140 - 40, 930); x.lineTo(i * 140 + 30, 930); x.lineTo(i * 260 - 600 + 70, 1920); x.lineTo(i * 260 - 600 - 60, 1920); x.closePath(); x.fill(); }
  PARK_C = mkCanvas(1080, 1920);
  const y = PARK_C.getContext('2d');
  y.filter = 'blur(5px)'; y.drawImage(c0, 0, 0); y.filter = 'none';
}
function parkBack(cam, t) {
  const bc = { x: 540 + (cam.x - 540) * 0.3, y: 960 + (cam.y - 1100) * 0.3, zoom: 1.1 + 0.05 * (cam.zoom - 1.6), rot: 0, sx: (cam.sx || 0) * 0.2, sy: (cam.sy || 0) * 0.2 };
  screenSpace(); ctx.fillStyle = '#04071A'; ctx.fillRect(0, 0, W, H);
  applyCam(bc);
  ctx.drawImage(PARK_C, 0, 0);
  // the floodlight banks, top left and right
  for (const [fx, fy] of [[150, 260], [930, 240]]) {
    rrect(ctx, fx - 90, fy - 40, 180, 80, 10); ctx.fillStyle = '#1A2040'; ctx.fill();
    for (let r = 0; r < 3; r++) for (let q = 0; q < 6; q++) { const lx = fx - 70 + q * 28, ly = fy - 22 + r * 22; circle(ctx, lx, ly, 8, '#FFFBEA'); }
    softDot(gctx, fx, fy, 150, '#FFF4D6', 0.6); softDot(gctx, fx, fy, 380, '#FFE8B0', 0.12);
  }
  // the mound under him (world)
  applyCam(cam);
  ellipse(ctx, 540, 1505, 330, 70, '#7A4A2C'); ellipse(ctx, 540, 1497, 300, 56, '#8C5A36');
  rrect(ctx, 490, 1488, 100, 14, 4); ctx.fillStyle = '#F2F2F2'; ctx.fill();
}
// the pitch, as two arm positions: {e, w} (rig-local) for the throwing arm (R) and the glove arm (L)
const PITCH = {
  set: { R: { e: [120, -300], w: [70, -316] }, L: { e: [-110, -300], w: [-62, -318] } },         // hands together at his chest
  cock: { R: { e: [186, -392], w: [196, -500] }, L: { e: [-150, -350], w: [-232, -410] } },      // the ball back by his ear, the glove out
  release: { R: { e: [120, -420], w: [40, -520] }, L: { e: [-120, -300], w: [-130, -230] } },    // over the top, toward us
  follow: { R: { e: [30, -280], w: [-90, -210] }, L: { e: [-130, -280], w: [-120, -200] } },     // across his body
};
const pitchMix = (a, b, k) => ({ R: armMix(a.R, b.R, k), L: armMix(a.L, b.L, k) });
// the cap on his head (head units), the brim to the screen's right
function pitchCap(c, k = 1) {
  if (k <= 0.01) return;
  c.save(); c.scale(k, k);
  c.beginPath(); c.moveTo(-66, -14); c.quadraticCurveTo(-70, -86, 0, -90); c.quadraticCurveTo(70, -86, 66, -14); c.closePath(); c.fillStyle = '#C8323C'; c.fill();
  c.beginPath(); c.moveTo(-60, -16); c.quadraticCurveTo(0, -30, 92, -8); c.quadraticCurveTo(80, 2, 52, 0); c.quadraticCurveTo(0, -12, -60, -10); c.closePath(); c.fillStyle = '#A0242C'; c.fill();
  paint(() => {
    c.font = '900 34px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#FFFFFF'; c.fillText('C', 0, -50);
    circle(c, 0, -89, 5, '#A0242C');
  });
  c.restore();
}
// the glove (a brown mitt) at a wrist, and the ball in a hand (rig units)
function pitchMitt(c, wr, ang) {
  c.save(); c.translate(wr[0], wr[1]); c.rotate(ang);
  c.beginPath(); c.ellipse(0, -22, 30, 38, 0, 0, Math.PI * 2); c.fillStyle = '#8A4E24'; c.fill();
  for (let i = 0; i < 4; i++) { rrect(c, -26 + i * 13, -66, 12, 34, 6); c.fillStyle = '#9C5C2C'; c.fill(); }
  paint(() => { c.beginPath(); c.ellipse(0, -18, 18, 22, 0, 0, Math.PI * 2); c.lineWidth = 2; c.strokeStyle = 'rgba(60,30,10,0.6)'; c.stroke(); });
  c.restore();
}
function baseball(c, x, y, r, rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot);
  circle(c, 0, 0, r, '#F2EEE4');
  paint(() => {
    c.lineWidth = Math.max(1.2, r * 0.09); c.strokeStyle = '#C8323C';
    c.beginPath(); c.arc(-r * 1.25, 0, r * 0.9, -0.75, 0.75); c.stroke();
    c.beginPath(); c.arc(r * 1.25, 0, r * 0.9, Math.PI - 0.75, Math.PI + 0.75); c.stroke();
  });
  c.restore();
}
// a round window on his elbow: the bones meeting, and the NEW ligament across the inside of the joint (screen space).
// o: {k (it opens), lig 0..1 (the ligament slides in and is stitched), glow 0..1, tag 0..1}
function elbowWindow(x, y, R, t, o = {}) {
  const k = clamp(o.k || 0);
  if (k <= 0.01) return;
  const r = R * E.outBack(k, 1.5);
  screenSpace();
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = '#2A1840'; ctx.fill();   // one opaque fill first (the light)
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.clip();
  paint(() => {
    const g = ctx.createRadialGradient(x, y - r * 0.3, r * 0.1, x, y, r); g.addColorStop(0, '#5A3A7E'); g.addColorStop(1, '#22123A');
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
    const u = r / 150;
    // the upper arm bone from the left, ending in the elbow's knob; the two forearm bones going up and right
    ctx.lineCap = 'round';
    line(ctx, x - 170 * u, y + 40 * u, x - 18 * u, y + 6 * u, 46 * u, '#F4E9D2');
    circle(ctx, x - 10 * u, y + 4 * u, 30 * u, '#F4E9D2');
    line(ctx, x + 22 * u, y - 4 * u, x + 120 * u, y - 140 * u, 30 * u, '#EADCC0');
    line(ctx, x + 30 * u, y + 20 * u, x + 150 * u, y - 100 * u, 24 * u, '#E2D2B4');
    // the new ligament: a yellow band across the joint's inner side, with little stitches
    const lg = clamp(o.lig || 0);
    if (lg > 0.01) {
      const a = [x - 50 * u, y + 34 * u], b = [x + 52 * u, y + 30 * u], m = [lerp(a[0], b[0], lg), lerp(a[1], b[1], lg)];
      line(ctx, a[0], a[1], m[0], m[1], 16 * u, '#5A3A10'); line(ctx, a[0], a[1], m[0], m[1], 11 * u, '#FFD447');
      for (let i = 0; i < 4; i++) { const f = (i + 0.5) / 4; if (f > lg) break; const p = [lerp(a[0], b[0], f), lerp(a[1], b[1], f)]; line(ctx, p[0] - 4 * u, p[1] - 12 * u, p[0] + 4 * u, p[1] + 12 * u, 2.4 * u, '#3A2010'); }
    }
  });
  ctx.restore();
  paint(() => { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.lineWidth = 6; ctx.strokeStyle = '#FFD447'; ctx.stroke(); });
  softDot(gctx, x, y + r * 0.2, r * 0.6, '#FFD447', 0.25 * clamp(o.glow || 0));
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); gctx.beginPath(); gctx.arc(x, y, r, 0, 7); gctx.lineWidth = 14; gctx.strokeStyle = rgba('#FFD447', 0.4 * k); gctx.stroke(); gctx.restore();
}

// ---------------------------------------------------------------- the computer's question (screen space)
// o: {hover: 'yes' | 'later' | null, click 0..1 (the button flashes), cursor: [x, y] or null, title, yesCol}
function deleteDialog(x, y, k, o = {}) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 1.8), w = 420, h = 230;
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -w / 2 + 8, -h / 2 + 12, w, h, 22); ctx.fillStyle = 'rgba(0,0,12,0.45)'; ctx.fill();
  rrect(ctx, -w / 2, -h / 2, w, h, 22); ctx.fillStyle = '#EEF1F8'; ctx.fill();
  paint(() => {
    ctx.save(); rrect(ctx, -w / 2, -h / 2, w, h, 22); ctx.clip();
    ctx.fillStyle = '#3B6FD8'; ctx.fillRect(-w / 2, -h / 2, w, 46);
    ctx.restore();
    ctx.font = '800 22px Montserrat'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFFFFF';
    ctx.fillText(o.title || 'BODY UPDATE', -w / 2 + 22, -h / 2 + 24);
    for (const [i, col] of [[0, '#FF6A6A'], [1, '#FFD447'], [2, '#4DE08A']]) circle(ctx, w / 2 - 26 - i * 26, -h / 2 + 23, 7, col);
    ctx.font = '900 34px Montserrat'; ctx.textAlign = 'center'; ctx.fillStyle = '#1A1E30';
    ctx.fillText(o.question || 'Delete this muscle?', 0, -22);
    const btn = (bx, txt, col, hov, clk) => {
      rrect(ctx, bx - 82, 30, 164, 58, 14); ctx.fillStyle = clk > 0.01 ? mixH(col, '#FFFFFF', 0.5 * clk) : col; ctx.fill();
      if (hov) { rrect(ctx, bx - 86, 26, 172, 66, 16); ctx.lineWidth = 4; ctx.strokeStyle = '#1A1E30'; ctx.stroke(); }
      ctx.font = '900 30px Montserrat'; ctx.fillStyle = '#FFFFFF'; ctx.fillText(txt, bx, 61);
    };
    btn(-96, 'YES', o.yesCol || '#E8394B', o.hover === 'yes', o.hover === 'yes' ? clamp(o.click || 0) : 0);
    btn(96, 'LATER', '#8A92A8', o.hover === 'later', o.hover === 'later' ? clamp(o.click || 0) : 0);
  });
  ctx.restore();
  if (o.cursor) {   // the arrow, on top
    const [cx, cy] = o.cursor;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(cx, cy); ctx.scale(1.5 - 0.15 * clamp(o.click || 0), 1.5 - 0.15 * clamp(o.click || 0));
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 34); ctx.lineTo(9, 26); ctx.lineTo(16, 40); ctx.lineTo(22, 37); ctx.lineTo(15, 23); ctx.lineTo(26, 23); ctx.closePath();
    ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.strokeStyle = '#0B0B1A'; ctx.stroke();
    ctx.restore();
  }
}
