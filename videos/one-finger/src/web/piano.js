// piano.js — the 1830s. A keyboard and Schumann's finger gadget in 3D (world centimetres, projected with fist3d's camera:
// the hand is drawn with rotX = PI/2, palm down, fingers along +z), a grand piano in three-quarter view whose lid can
// slam, and the museum: the gadget under a glass dome on a plinth, two marble historians that argue.
'use strict';

const PN = { white: '#F1E9D6', whiteDk: '#C9BFA8', gap: '#3A2C22', black: '#151010', blackHi: '#3A302A', wood: '#5A3418',
  woodDk: '#3A200E', woodHi: '#7A4C28', brass: '#C9A050', brassDk: '#8A6A2A', cord: '#EADFC6' };

// a quad in world space (4 points), projected
function pnQuad(c, pr, P, col) { const Q = P.map(pr); c.fillStyle = col; c.beginPath(); Q.forEach((q, i) => c[i ? 'lineTo' : 'moveTo'](q[0], q[1])); c.closePath(); c.fill(); }

// the keyboard under his hand. K: {y: the key tops (world y), z0: the white keys' front edge (world z), x0, x1: the
// span, pressed: {index: depth}}. Seen from his eyes: the front edge nearest, the black keys and the fallboard beyond.
function pnKeyboard(c, pr, K) {
  const ww = 2.35, len = 15, bl = 9.2, bw = 1.35, bh = 1.05;
  const n0 = Math.floor(K.x0 / ww), n1 = Math.ceil(K.x1 / ww);
  // the case below the keys (its front), and the fallboard + its lip beyond them
  pnQuad(c, pr, [[K.x0 - 4, K.y - 1.6, K.z0 - 0.4], [K.x1 + 4, K.y - 1.6, K.z0 - 0.4], [K.x1 + 4, K.y - 9, K.z0 - 0.4], [K.x0 - 4, K.y - 9, K.z0 - 0.4]], PN.woodDk);
  pnQuad(c, pr, [[K.x0 - 4, K.y + 0.2, K.z0 + len], [K.x1 + 4, K.y + 0.2, K.z0 + len], [K.x1 + 4, K.y + 7, K.z0 + len + 0.6], [K.x0 - 4, K.y + 7, K.z0 + len + 0.6]], PN.wood);
  pnQuad(c, pr, [[K.x0 - 4, K.y + 7, K.z0 + len + 0.6], [K.x1 + 4, K.y + 7, K.z0 + len + 0.6], [K.x1 + 4, K.y + 7.6, K.z0 + len + 3], [K.x0 - 4, K.y + 7.6, K.z0 + len + 3]], PN.woodHi);
  // white keys: the top and the front lip
  for (let i = n0; i <= n1; i++) {
    const x = i * ww, d = (K.pressed && K.pressed[i]) || 0, y = K.y - 0.45 * d;
    pnQuad(c, pr, [[x + 0.05, y, K.z0], [x + ww - 0.05, y, K.z0], [x + ww - 0.05, y, K.z0 + len], [x + 0.05, y, K.z0 + len]], PN.white);
    pnQuad(c, pr, [[x + 0.05, y, K.z0], [x + ww - 0.05, y, K.z0], [x + ww - 0.05, y - 1.4, K.z0], [x + 0.05, y - 1.4, K.z0]], PN.whiteDk);
    const a = pr([x, y + 0.01, K.z0]), b = pr([x, y + 0.01, K.z0 + len]);
    paint(() => line(c, a[0], a[1], b[0], b[1], Math.max(1.5, a[2] * 0.07), PN.gap));
  }
  // black keys (none after the 3rd and 7th white key of each octave)
  for (let i = n0; i <= n1; i++) {
    const m = ((i % 7) + 7) % 7;
    if (m === 2 || m === 6) continue;
    const x = (i + 1) * ww - bw / 2, z1 = K.z0 + len - bl, z2 = K.z0 + len, y = K.y + bh;
    pnQuad(c, pr, [[x, K.y, z1], [x + bw, K.y, z1], [x + bw, y, z1], [x, y, z1]], PN.blackHi);
    pnQuad(c, pr, [[x, y, z1], [x + bw, y, z1], [x + bw, y, z2], [x, y, z2]], PN.black);
  }
}

// the finger gadget: a post on the fallboard, an arm out over his hand (it tips up to yank), a brass pulley at its tip,
// a cord down to a loop on his middle finger. g: {post: [x, z] (world), y: the key tops, top: post height, tip: [x, z] the
// arm's end over the finger, lift: 0..1 (the arm tips up), loop: world point on the finger, snap: 0..1 (the cord broken,
// its end swinging), t}
function pnGadget(c, pr, g) {
  const base = [g.post[0], g.y + 7.5, g.post[1]], top = [g.post[0], g.y + 7.5 + g.top, g.post[1]];
  const tipY = top[1] - 1.0 + 2.6 * (g.lift || 0), tip = [g.tip[0], tipY, g.tip[1]];
  const P = (p) => pr(p);
  const b0 = P(base), t0 = P(top), tp = P(tip);
  // the post and its foot
  fkCap(c, P([base[0] - 1.6, base[1], base[2]]), P([base[0] + 1.6, base[1], base[2]]), 0.9 * b0[2], 0.9 * b0[2], PN.woodDk);
  fkCap(c, b0, t0, 0.62 * b0[2], 0.55 * t0[2], PN.wood);
  // a crank wheel on the post's side
  const wh = P([top[0] + 0.9, top[1] - 4, top[2]]);
  circle(c, wh[0], wh[1], 2.2 * wh[2], PN.brassDk); circle(c, wh[0], wh[1], 1.7 * wh[2], PN.brass);
  paint(() => { for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + (g.t || 0) * 2 * (g.lift || 0); line(c, wh[0], wh[1], wh[0] + Math.cos(a) * 1.6 * wh[2], wh[1] + Math.sin(a) * 1.6 * wh[2], Math.max(2, 0.18 * wh[2]), PN.brassDk); } });
  // the arm
  fkCap(c, t0, tp, 0.5 * t0[2], 0.42 * tp[2], PN.woodHi);
  circle(c, t0[0], t0[1], 0.7 * t0[2], PN.brassDk);
  // the pulley
  circle(c, tp[0], tp[1], 0.95 * tp[2], PN.brassDk); circle(c, tp[0], tp[1], 0.65 * tp[2], PN.brass);
  return { tip: tp, top: t0 };
}

// the gadget's cord from the pulley down to the loop on his finger (drawn after the hand), or snapped and swinging
function pnGadgetCord(c, pr, g) {
  const top = [g.post[0], g.y + 7.5 + g.top, g.post[1]], tipY = top[1] - 1.0 + 2.6 * (g.lift || 0);
  const tp = pr([g.tip[0], tipY, g.tip[1]]), lp = pr(g.loop), sn = clamp(g.snap || 0);
  if (sn < 0.5) {
    line(c, tp[0], tp[1] + 0.6 * tp[2], lp[0], lp[1], Math.max(2.5, 0.16 * lp[2]), PN.cord);
    paint(() => { c.lineWidth = Math.max(3, 0.22 * lp[2]); c.strokeStyle = PN.cord; c.beginPath(); c.ellipse(lp[0], lp[1], 1.15 * lp[2], 0.5 * lp[2], 0, 0, 7); c.stroke(); });
  } else {
    const dt = (g.t || 0) - (g.snapT || 0), sw = Math.sin(dt * 9) * Math.exp(-dt * 2.2);
    const L = Math.hypot(lp[0] - tp[0], lp[1] - tp[1]) * 0.55, a = Math.PI / 2 + 0.6 * sw;
    line(c, tp[0], tp[1], tp[0] + Math.cos(a) * L, tp[1] + Math.sin(a) * L, Math.max(2.5, 0.16 * lp[2]), PN.cord);
  }
  return { tip: tp, loop: lp };
}

// the parlour again without its piano (the lid shot draws its own): wallpaper, wainscot, a window, a portrait, a poster
let PN_ROOM = null;
function initPianoRoom() {
  const c0 = mkCanvas(W, H), x = c0.getContext('2d');
  let g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#5A2E2A'); g.addColorStop(1, '#2E1614');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  for (let i = 0; i < 12; i++) { x.fillStyle = i % 2 ? 'rgba(255,220,180,0.05)' : 'rgba(0,0,0,0.06)'; x.fillRect(i * 90, 0, 90, 1180); }
  for (let yy = 60; yy < 1180; yy += 120) for (let xx = 45; xx < W; xx += 180) { x.fillStyle = 'rgba(255,215,160,0.07)'; x.beginPath(); x.ellipse(xx, yy, 18, 30, 0, 0, 7); x.fill(); }
  x.fillStyle = '#2A1810'; x.fillRect(0, 1180, W, 740); x.fillStyle = '#4A2C1A'; x.fillRect(0, 1170, W, 18);
  g = x.createLinearGradient(0, 200, 0, 1000); g.addColorStop(0, '#2A3A5A'); g.addColorStop(1, '#1A2238');
  x.fillStyle = g; x.fillRect(760, 260, 240, 700);
  x.fillStyle = '#6A1A1E'; x.beginPath(); x.moveTo(720, 200); x.quadraticCurveTo(800, 600, 760, 1080); x.lineTo(720, 1080); x.closePath(); x.fill();
  x.beginPath(); x.moveTo(1080, 200); x.quadraticCurveTo(990, 600, 1020, 1080); x.lineTo(1080, 1080); x.closePath(); x.fill();
  x.fillStyle = '#9A7A3A'; x.fillRect(150, 300, 200, 250); x.fillStyle = '#3A2A20'; x.fillRect(168, 318, 164, 214);
  x.fillStyle = '#7A5A40'; x.beginPath(); x.ellipse(250, 410, 40, 50, 0, 0, 7); x.fill(); x.fillRect(205, 455, 90, 77);
  const c1 = mkCanvas(W, H), y = c1.getContext('2d');
  y.filter = 'blur(5px)'; y.drawImage(c0, 0, 0); y.filter = 'none';
  PN_ROOM = c1;
}

// ---------------------------------------------------------------- the grand piano (side view, 2D)
// the keyboard end on the left at (ox, oy) = the case's top-left corner; s = px per unit (the case is 330 long);
// lid 0 shut .. 1 propped open (it hinges near the keyboard end and opens at the tail)
function pnGrand(c, ox, oy, s, lid, t) {
  const X = (x) => ox + x * s, Y = (y) => oy + y * s;
  // legs with castors, the pedal lyre
  for (const lx of [40, 300]) { fkCap(c, [X(lx), Y(56)], [X(lx + 4), Y(150)], 8 * s, 6 * s, '#2A0F07'); circle(c, X(lx + 4), Y(152), 6 * s, '#B8963E'); }
  fkCap(c, [X(70), Y(60)], [X(72), Y(132)], 4 * s, 4 * s, '#2A0F07');
  c.fillStyle = '#B8963E'; c.fillRect(X(60), Y(132), 24 * s, 6 * s);
  // the case: a long body whose tail end curves round
  c.fillStyle = '#4E1D10';
  c.beginPath(); c.moveTo(X(30), Y(0)); c.lineTo(X(270), Y(0)); c.quadraticCurveTo(X(338), Y(0), X(338), Y(30)); c.quadraticCurveTo(X(338), Y(60), X(290), Y(60));
  c.lineTo(X(30), Y(60)); c.closePath(); c.fill();
  paint(() => { c.fillStyle = 'rgba(255,230,190,0.10)'; c.fillRect(X(34), Y(8), 290 * s, 5 * s); });
  // the keyboard sticking out at the left, the music desk
  c.fillStyle = '#2A0F07'; c.fillRect(X(0), Y(14), 34 * s, 22 * s);
  c.fillStyle = '#EDE3CC'; c.fillRect(X(-2), Y(10), 36 * s, 7 * s);
  paint(() => { for (let i = 0; i < 5; i++) { c.fillStyle = '#151010'; c.fillRect(X(2 + i * 6.5), Y(10), 3.2 * s, 4 * s); } });
  c.fillStyle = '#3A160B'; c.beginPath(); c.moveTo(X(34), Y(0)); c.lineTo(X(50), Y(-34)); c.lineTo(X(58), Y(-32)); c.lineTo(X(44), Y(0)); c.closePath(); c.fill();
  // the lid: hinged at x 46 on the top, propped at its far end
  const ang = 0.42 * lid, hx = X(46), hy = Y(0);
  if (lid > 0.04) { const st0 = [X(250), Y(0)], L = (250 - 46) * s, st1 = [hx + Math.cos(-ang) * L, hy + Math.sin(-ang) * L]; line(c, st0[0], st0[1], st1[0], st1[1], Math.max(3, 3.5 * s), '#7A4C28'); }
  c.save(); c.translate(hx, hy); c.rotate(-ang);
  c.fillStyle = '#5E2414'; c.beginPath(); c.moveTo(0, -9 * s); c.lineTo(224 * s, -9 * s); c.quadraticCurveTo(294 * s, -9 * s, 294 * s, 0); c.lineTo(0, 0); c.closePath(); c.fill();
  paint(() => { c.fillStyle = 'rgba(255,230,190,0.16)'; c.fillRect(0, -6 * s, 250 * s, 1.6 * s); });
  c.restore();
  // the gold frame inside, seen while the lid is up
  if (lid > 0.05) paint(() => { c.fillStyle = rgba('#B8913E', 0.8 * clamp(lid * 3)); c.fillRect(X(60), Y(-2), 230 * s, 3 * s); });
  return { X, Y };
}

// a warm rim of lamplight along the piano's top edges (so the black case reads against the dark room)
function pnGrandRim(c, ox, oy, s, lid) {
  const X = (x) => ox + x * s, Y = (y) => oy + y * s, ang = 0.42 * lid, hx = X(46), hy = Y(0);
  paint(() => {
    c.save(); c.lineCap = 'round';
    c.strokeStyle = 'rgba(255,196,128,0.75)'; c.lineWidth = Math.max(3, 2.2 * s);
    c.beginPath(); c.moveTo(X(30), Y(0)); c.lineTo(X(270), Y(0)); c.quadraticCurveTo(X(338), Y(0), X(338), Y(30)); c.stroke();
    c.translate(hx, hy); c.rotate(-ang);
    c.beginPath(); c.moveTo(0, -6 * s); c.lineTo(224 * s, -6 * s); c.quadraticCurveTo(294 * s, -6 * s, 294 * s, 0); c.stroke();
    c.restore();
  });
}

// ---------------------------------------------------------------- the museum
function pnMuseumBg(t, cam) {
  screenSpace();
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0C1018'); g.addColorStop(0.62, '#141A26'); g.addColorStop(1, '#0A0C12');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  applyCam(cam);
  // wall panels and a floor
  paint(() => {
    for (let i = -2; i < 8; i++) { ctx.strokeStyle = 'rgba(120,140,170,0.07)'; ctx.lineWidth = 4; ctx.strokeRect(i * 260 - 80, 360, 220, 800); }
    ctx.fillStyle = '#10141C'; ctx.fillRect(-1000, 1320, 3000, 1200);
    for (let i = 0; i < 14; i++) line(ctx, -600 + i * 180, 1320, -1400 + i * 340, 2300, 3, 'rgba(120,140,170,0.06)');
  });
}
// a spotlight cone from the ceiling to a point (glow layer + a pool on the floor)
function pnSpot(x, y, w, k) {
  if (k <= 0.01) return;
  const g = gctx.createLinearGradient(0, -200, 0, y);
  g.addColorStop(0, rgba('#FFF2D0', 0.0)); g.addColorStop(1, rgba('#FFF2D0', 0.22 * k));
  gctx.fillStyle = g; gctx.beginPath(); gctx.moveTo(x - 40, -200); gctx.lineTo(x + 40, -200); gctx.lineTo(x + w, y); gctx.lineTo(x - w, y); gctx.closePath(); gctx.fill();
  const g2 = ctx.createLinearGradient(0, -200, 0, y);
  g2.addColorStop(0, 'rgba(255,240,205,0)'); g2.addColorStop(1, `rgba(255,240,205,${0.12 * k})`);
  paint(() => { ctx.fillStyle = g2; ctx.beginPath(); ctx.moveTo(x - 40, -200); ctx.lineTo(x + 40, -200); ctx.lineTo(x + w, y); ctx.lineTo(x - w, y); ctx.closePath(); ctx.fill(); });
}
// a white marble plinth (world), its top at (x, y)
function pnPlinth(x, y, w, h) {
  ctx.fillStyle = '#D9D4CA'; ctx.fillRect(x - w / 2, y, w, h);
  ctx.fillStyle = '#ECE8E0'; ctx.fillRect(x - w / 2 - 14, y - 16, w + 28, 22);
  ctx.fillStyle = '#C6C0B4'; ctx.fillRect(x - w / 2 - 10, y + h - 16, w + 20, 20);
}
// the gadget as a small model (2D, world units: s = px per cm)
function pnGadgetModel(x, y, s, t, wob = 0) {
  const c = ctx;
  fkCap(c, [x - 5 * s, y], [x + 5 * s, y], 1.2 * s, 1.2 * s, PN.woodDk);       // the foot
  const top = [x - 2 * s, y - 14 * s], tip = [x + 7.5 * s, y - 13 * s + Math.sin(t * 3) * 0.6 * s * wob];
  fkCap(c, [x - 2 * s, y], top, 0.8 * s, 0.7 * s, PN.wood);
  fkCap(c, top, tip, 0.6 * s, 0.5 * s, PN.woodHi);
  circle(c, top[0] + 1.2 * s, top[1] + 4 * s, 2 * s, PN.brassDk); circle(c, top[0] + 1.2 * s, top[1] + 4 * s, 1.5 * s, PN.brass);
  circle(c, tip[0], tip[1], 1.1 * s, PN.brassDk); circle(c, tip[0], tip[1], 0.75 * s, PN.brass);
  line(c, tip[0], tip[1] + s, tip[0] + 0.5 * s, y - 4 * s, Math.max(2, 0.2 * s), PN.cord);
  paint(() => { c.lineWidth = Math.max(2, 0.25 * s); c.strokeStyle = PN.cord; c.beginPath(); c.ellipse(tip[0] + 0.5 * s, y - 3.4 * s, 1.3 * s, 0.6 * s, 0, 0, 7); c.stroke(); });
}
// a glass dome over a point (world): drawn after what is under it
function pnDome(x, y, rw, rh, k = 1) {
  paint(() => {
    ctx.save();
    ctx.beginPath(); ctx.moveTo(x - rw, y); ctx.lineTo(x - rw, y - rh * 0.55); ctx.quadraticCurveTo(x - rw, y - rh, x, y - rh); ctx.quadraticCurveTo(x + rw, y - rh, x + rw, y - rh * 0.55); ctx.lineTo(x + rw, y);
    ctx.fillStyle = `rgba(190,220,255,${0.08 * k})`; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = `rgba(210,235,255,${0.45 * k})`; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - rw * 0.7, y - rh * 0.3); ctx.quadraticCurveTo(x - rw * 0.72, y - rh * 0.82, x - rw * 0.25, y - rh * 0.9);
    ctx.lineWidth = 10; ctx.strokeStyle = `rgba(255,255,255,${0.28 * k})`; ctx.lineCap = 'round'; ctx.stroke();
    ctx.restore();
  });
}
// a marble bust (world): on a plinth top at (x, y), size s (head radius in px); o: {talk 0..1 (the mouth opens), angry,
// look: -1..1 (eyes to the side), shake, rot}
function pnBust(x, y, s, o = {}) {
  const c = ctx, M = '#E6E1D8', Ms = '#B9B2A6', Mh = '#F6F3EE';
  c.save(); c.translate(x, y); c.rotate(o.rot || 0);
  actor(() => {
    // a socle, the shoulders, the neck, the head
    c.fillStyle = Ms; rrect(c, -s * 0.55, -s * 0.5, s * 1.1, s * 0.5, s * 0.08); c.fill();
    c.fillStyle = M; c.beginPath(); c.moveTo(-s * 1.55, -s * 0.5); c.quadraticCurveTo(-s * 1.5, -s * 1.35, -s * 0.55, -s * 1.5); c.lineTo(s * 0.55, -s * 1.5); c.quadraticCurveTo(s * 1.5, -s * 1.35, s * 1.55, -s * 0.5); c.closePath(); c.fill();
    c.fillStyle = M; rrect(c, -s * 0.33, -s * 1.9, s * 0.66, s * 0.6, s * 0.2); c.fill();
    c.fillStyle = Mh; c.beginPath(); c.ellipse(0, -s * 2.55, s * 0.78, s * 0.92, 0, 0, 7); c.fill();
  });
  paint(() => {
    // a curly wig of marble
    c.fillStyle = M;
    for (let i = 0; i < 9; i++) { const a = Math.PI * (0.95 + 1.1 * i / 8); c.beginPath(); c.arc(Math.cos(a) * s * 0.78, -s * 2.55 + Math.sin(a) * s * 0.88, s * 0.3, 0, 7); c.fill(); }
    for (const sx of [-1, 1]) for (let j = 0; j < 3; j++) { c.beginPath(); c.arc(sx * s * 0.86, -s * 2.3 + j * s * 0.32, s * 0.24, 0, 7); c.fill(); }
    // a toga fold
    c.strokeStyle = rgba(Ms, 0.9); c.lineWidth = s * 0.07; c.beginPath(); c.moveTo(-s * 1.2, -s * 0.7); c.quadraticCurveTo(-s * 0.2, -s * 1.1, s * 0.8, -s * 1.42); c.stroke();
    // blank marble eyes, brows, nose, mouth
    const lk = (o.look || 0) * s * 0.06;
    for (const sx of [-1, 1]) {
      c.fillStyle = '#D2CCC1'; c.beginPath(); c.ellipse(sx * s * 0.3 + lk, -s * 2.62, s * 0.15, s * 0.1, 0, 0, 7); c.fill();
      c.strokeStyle = '#8E877B'; c.lineWidth = s * 0.07; c.lineCap = 'round';
      const ang = (o.angry || 0) * 0.45 * sx;
      c.beginPath(); c.moveTo(sx * s * 0.12, -s * 2.86 + Math.sin(ang) * s * 0.1 * sx); c.lineTo(sx * s * 0.48, -s * 2.86 - Math.sin(ang) * s * 0.1 * sx); c.stroke();
    }
    c.strokeStyle = '#A8A194'; c.lineWidth = s * 0.06; c.beginPath(); c.moveTo(0, -s * 2.6); c.lineTo(-s * 0.08, -s * 2.36); c.lineTo(s * 0.06, -s * 2.34); c.stroke();
    // a beard, then the mouth over it (it opens when he talks)
    c.fillStyle = M; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(-s * 0.4 + i * s * 0.2, -s * 1.86 - (i % 2) * s * 0.05, s * 0.17, 0, 7); c.fill(); }
    const tk = clamp(o.talk || 0);
    c.fillStyle = '#5E564C'; c.beginPath(); c.ellipse(0, -s * 2.12, s * 0.2, s * 0.04 + s * 0.13 * tk, 0, 0, 7); c.fill();
  });
  c.restore();
}
