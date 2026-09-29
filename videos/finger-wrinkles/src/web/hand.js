// Hands and fingertips: a stylized open hand (palm to camera) whose finger pads wrinkle,
// a macro fingertip with fingerprint ridges + a fixed wrinkle network, grape/raisin, sponge.
'use strict';

const SKIN = { base: '#F2B892', sh: '#CF8663', hi: '#FFDCC4', deep: '#A8604A', crease: '#B8704F' };
const FINGERS = [
  { x: -78, len: 165, w: 52, ang: -0.11 },
  { x: -25, len: 186, w: 55, ang: -0.03 },
  { x: 29, len: 172, w: 53, ang: 0.05 },
  { x: 80, len: 134, w: 46, ang: 0.14 },
];
let PADW = null, MACRO = null;

function initHands() {
  // wrinkle curves for each finger pad (pad-local: x across -1..1, y 0 (tip) .. 1 (pad base))
  PADW = [...Array(5)].map((_, f) => {
    const rng = mulberry32(300 + f * 17), lines = [];
    const n = 6;
    for (let i = 0; i < n; i++) {
      const y0 = 0.16 + (i / (n - 1)) * 0.74 + (rng() - 0.5) * 0.05;
      const P = [];
      for (let k = 0; k <= 8; k++) {
        const u = -0.92 + (k / 8) * 1.84;
        P.push([u, y0 + 0.05 * Math.sin(u * 3.2 + rng() * 6) + (rng() - 0.5) * 0.02 - 0.06 * (1 - u * u)]);
      }
      lines.push(P);
    }
    for (let i = 0; i < 5; i++) { // short connecting branches, drainage-like
      const u = -0.6 + rng() * 1.2, a = 0.2 + rng() * 0.6;
      lines.push([[u, a], [u + (rng() - 0.5) * 0.3, a + 0.1 + rng() * 0.08]]);
    }
    return lines;
  });
  // the macro fingertip's wrinkle network: soft, wavy folds across the pad (+ short merging arcs)
  const rng = mulberry32(777), prim = [];
  for (let i = 0; i < 9; i++) {
    const y0 = -330 + i * 80 + (rng() - 0.5) * 20, amp = 12 + rng() * 18, fq = 0.011 + rng() * 0.012, ph = rng() * 6;
    const P = [];
    for (let x = -330; x <= 330; x += 22) P.push([x, y0 + amp * Math.sin(x * fq + ph) + 9 * Math.sin(x * 0.031 + i * 1.7)]);
    prim.push(P);
  }
  const sec = [];
  for (let i = 0; i < 10; i++) {
    const a = 1 + Math.floor(rng() * (prim.length - 2)), k = 3 + Math.floor(rng() * (prim[a].length - 7));
    const [x, y] = prim[a][k], [x2, y2] = prim[a + 1][k + 2];
    sec.push([[x, y], [(x + x2) / 2 + (rng() - 0.5) * 30, (y + y2) / 2], [x2, y2]]);
  }
  MACRO = { prim, sec };
}

function smoothPath(c, P) {
  c.beginPath(); c.moveTo(P[0][0], P[0][1]);
  for (let i = 1; i < P.length - 1; i++) {
    const mx = (P[i][0] + P[i + 1][0]) / 2, my = (P[i][1] + P[i + 1][1]) / 2;
    c.quadraticCurveTo(P[i][0], P[i][1], mx, my);
  }
  c.lineTo(P[P.length - 1][0], P[P.length - 1][1]);
}
// one finger in its own frame: base at (0,0), tip at (0,-len). o.wr = wrinkle 0..1, o.treads 0..1
function drawFinger(c, len, w, o, fi) {
  const wr = o.dead === fi ? 0 : (o.wr || 0);
  const r = w / 2;
  const path = () => {
    c.beginPath();
    c.moveTo(-r, 0); c.lineTo(-r, -len + r);
    // pruney tip: the outline goes a little lumpy as the pad shrinks
    for (let k = 0; k <= 20; k++) {
      const a = Math.PI + (k / 20) * Math.PI;
      const bump = 1 + 0.035 * wr * Math.sin(k * 2.1 + fi);
      c.lineTo(Math.cos(a) * r * bump * (1 - 0.03 * wr), -len + r + Math.sin(a) * r * bump);
    }
    c.lineTo(r, 0); c.closePath();
  };
  path();
  const g = c.createLinearGradient(-r, 0, r, 0);
  g.addColorStop(0, SKIN.sh); g.addColorStop(0.28, SKIN.base); g.addColorStop(0.55, SKIN.hi); g.addColorStop(1, SKIN.sh);
  c.fillStyle = g; c.fill();
  c.lineWidth = 3; c.strokeStyle = rgba(SKIN.deep, 0.5); c.stroke();
  // joint creases
  for (const f of [0.34, 0.66]) {
    const y = -len * f;
    c.beginPath(); c.moveTo(-r * 0.7, y); c.quadraticCurveTo(0, y + 6, r * 0.7, y);
    c.lineWidth = 3; c.strokeStyle = rgba(SKIN.crease, 0.55); c.stroke();
  }
  // pad wrinkles (distal ~40 %)
  const padTop = -len + 6, padH = len * 0.38;
  if (wr > 0.01 && !o.treads) {
    c.save(); path(); c.clip();
    for (const P of PADW[fi]) {
      const Q = P.map(([u, v]) => [u * r * 0.95, padTop + v * padH]);
      c.lineCap = 'round';
      smoothPath(c, Q.map(([x, y]) => [x, y + 2])); c.lineWidth = 3.2; c.strokeStyle = rgba('#FFE7D6', 0.55 * wr); c.stroke();
      smoothPath(c, Q); c.lineWidth = 3.4; c.strokeStyle = rgba(SKIN.deep, 0.8 * wr); c.stroke();
    }
    // the pad reads slightly deflated: a soft inner shade
    c.fillStyle = rgba(SKIN.deep, 0.10 * wr); c.fillRect(-r, padTop, w, padH);
    c.restore();
  }
  if (o.treads > 0) { // snow-tire treads on the pad
    c.save(); path(); c.clip();
    c.fillStyle = rgba('#24242C', 0.95 * o.treads); c.fillRect(-r, padTop - 4, w, padH + 4);
    for (let k = 0; k < 6; k++) {
      const y = padTop + 4 + k * (padH / 6);
      for (const s of [-1, 1]) {
        c.beginPath(); c.moveTo(0, y); c.lineTo(s * r * 0.95, y + padH / 12); c.lineTo(s * r * 0.95, y + padH / 12 + 6); c.lineTo(0, y + 6); c.closePath();
        c.fillStyle = rgba('#5A5A66', o.treads); c.fill();
      }
    }
    c.restore();
  }
  if (o.dead === fi && o.shine) { // the finger that stays smooth: glossy
    ellipse(c, -r * 0.3, -len + r * 1.4, r * 0.25, r * 0.7, rgba('#FFFFFF', 0.55 * o.shine), 0);
  }
  if (o.wet) for (let k = 0; k < 2; k++) circle(c, (k ? 0.3 : -0.25) * r, -len * (0.5 + 0.25 * k), 4, rgba('#FFFFFF', 0.8 * o.wet));
}
// open hand, palm to camera, fingers up. (x, y) = centre of the palm top edge. o: wr, dead, shine, wet, treads, curl, glow
function openHand(x, y, s, rot, t, o = {}) {
  const c = ctx;
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  // wrist/forearm
  rrect(c, -80, 150, 160, 400, 60);
  const fg = c.createLinearGradient(-80, 0, 80, 0);
  fg.addColorStop(0, SKIN.sh); fg.addColorStop(0.5, SKIN.base); fg.addColorStop(1, SKIN.sh);
  c.fillStyle = fg; c.fill();
  // thumb (behind the palm edge)
  c.save(); c.translate(-100, 120); c.rotate(-0.95 + 0.25 * (o.curl || 0)); drawFinger(c, 130, 58, o, 4); c.restore();
  // palm
  c.beginPath();
  c.moveTo(-108, 10); c.quadraticCurveTo(-118, 150, -84, 200); c.quadraticCurveTo(0, 236, 84, 200);
  c.quadraticCurveTo(118, 150, 108, 10); c.quadraticCurveTo(0, -12, -108, 10); c.closePath();
  const pg = c.createRadialGradient(-10, 80, 20, 0, 90, 170);
  pg.addColorStop(0, SKIN.hi); pg.addColorStop(0.6, SKIN.base); pg.addColorStop(1, SKIN.sh);
  c.fillStyle = pg; c.fill(); c.lineWidth = 3; c.strokeStyle = rgba(SKIN.deep, 0.45); c.stroke();
  // palm lines
  c.lineCap = 'round'; c.strokeStyle = rgba(SKIN.crease, 0.6); c.lineWidth = 4;
  c.beginPath(); c.moveTo(-96, 60); c.quadraticCurveTo(-10, 40, 92, 70); c.stroke();
  c.beginPath(); c.moveTo(-90, 100); c.quadraticCurveTo(0, 90, 60, 120); c.stroke();
  c.beginPath(); c.moveTo(-60, 30); c.quadraticCurveTo(-90, 120, -40, 196); c.stroke();
  if ((o.wr || 0) > 0.05) { // palms prune a little too
    c.strokeStyle = rgba(SKIN.deep, 0.35 * o.wr); c.lineWidth = 2.5;
    for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(-70 + k * 30, 150); c.quadraticCurveTo(-60 + k * 30, 170, -76 + k * 30, 196); c.stroke(); }
  }
  // fingers
  FINGERS.forEach((f, i) => {
    c.save(); c.translate(f.x, 8); c.rotate(f.ang);
    const curl = o.curl || 0;
    c.scale(1, 1 - 0.45 * curl);
    drawFinger(c, f.len, f.w, o, i);
    c.restore();
  });
  c.restore();
  if (o.glow) { // nerve glow (proof shot)
    for (const i of o.glow.fingers) {
      const f = FINGERS[i];
      gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); gctx.translate(x, y); gctx.rotate(rot); gctx.scale(s, s);
      gctx.translate(f.x, 8); gctx.rotate(f.ang);
      line(gctx, 0, 60, 0, -f.len + 20, 10, rgba(o.glow.col, o.glow.a));
      gctx.restore();
    }
  }
}
// tip positions of each finger (for effects), world coords
function fingerTip(x, y, s, rot, i, frac = 1) {
  const f = FINGERS[i];
  const c = Math.cos(rot), sn = Math.sin(rot);
  const lx = f.x + Math.sin(f.ang) * f.len * frac, ly = 8 - Math.cos(f.ang) * f.len * frac;
  return [x + (lx * c - ly * sn) * s, y + (lx * sn + ly * c) * s];
}

// ---------------------------------------------------------------- macro fingertip (fills the frame)
// wr = wrinkle 0..1, ridges = fingerprint alpha, scan = {y, a} optional, drops = wet
function fingertipMacro(x, y, s, t, o = {}) {
  const c = ctx, wr = o.wr || 0;
  c.save(); c.translate(x, y); c.scale(s, s);
  const pad = (cc) => {
    cc.beginPath(); cc.moveTo(-330, 700);
    cc.lineTo(-330, -120); cc.bezierCurveTo(-330, -480, 330, -480, 330, -120);
    cc.lineTo(330, 700); cc.closePath();
  };
  pad(c);
  const g = c.createRadialGradient(-80, -220, 40, 0, -60, 520);
  g.addColorStop(0, '#FFE3CF'); g.addColorStop(0.5, SKIN.base); g.addColorStop(1, '#C27A58');
  c.fillStyle = g; c.fill();
  c.save(); pad(c); c.clip();
  // fingerprint whorl
  const ra = o.ridges === undefined ? 1 : o.ridges;
  for (let i = 0; i < 26; i++) {
    const rr = 18 + i * 16;
    c.beginPath(); c.ellipse(10, -80, rr * 1.15, rr * 0.9, 0.2, 0, Math.PI * 2);
    c.lineWidth = 4; c.strokeStyle = rgba('#B8704F', 0.22 * ra); c.stroke();
    c.beginPath(); c.ellipse(8, -83, rr * 1.15, rr * 0.9, 0.2, 0, Math.PI * 2);
    c.lineWidth = 2; c.strokeStyle = rgba('#FFE9DA', 0.22 * ra); c.stroke();
  }
  // wrinkle folds: dark valley + lit crest, growing in with wr
  if (wr > 0.01) {
    c.lineCap = 'round'; c.lineJoin = 'round';
    const draw = (P, w1) => { // a soft fold: lit crest above, broad shadowed valley, a thin crease
      const Q = P.map(([px, py]) => [px, py * (1 - 0.03 * wr)]);
      smoothPath(c, Q.map(([px, py]) => [px, py - 13])); c.lineWidth = w1 * 1.1; c.strokeStyle = rgba('#FFE9DA', 0.5 * wr); c.stroke();
      smoothPath(c, Q.map(([px, py]) => [px, py + 3])); c.lineWidth = w1 * 1.6; c.strokeStyle = rgba('#A85A40', 0.32 * wr); c.stroke();
      smoothPath(c, Q); c.lineWidth = w1 * 0.8; c.strokeStyle = rgba('#8A4632', 0.5 * wr); c.stroke();
      smoothPath(c, Q.map(([px, py]) => [px, py + 1])); c.lineWidth = w1 * 0.28; c.strokeStyle = rgba('#5E2A1E', 0.75 * wr); c.stroke();
    };
    for (const P of MACRO.prim) draw(P, 20 * Math.min(1, wr * 1.3));
    for (const P of MACRO.sec) draw(P, 13 * Math.min(1, wr * 1.3));
    c.fillStyle = rgba('#7A3E2C', 0.08 * wr); c.fillRect(-340, -500, 680, 1300);
  }
  // water droplets
  if (o.drops) {
    const rng = mulberry32(55);
    for (let i = 0; i < 16; i++) {
      const dx = -280 + rng() * 560, dy = -380 + rng() * 800, dr = 8 + rng() * 18;
      circle(c, dx, dy, dr, rgba('#DDF3FF', 0.35 * o.drops)); circle(c, dx - dr * 0.3, dy - dr * 0.35, dr * 0.3, rgba('#FFFFFF', 0.9 * o.drops));
    }
  }
  c.restore();
  pad(c); c.lineWidth = 6; c.strokeStyle = rgba('#8A4632', 0.6); c.stroke();
  // nail edge peeking over the top
  c.beginPath(); c.moveTo(-230, -330); c.quadraticCurveTo(0, -420, 230, -330); c.lineWidth = 16; c.strokeStyle = 'rgba(255,236,226,0.8)'; c.stroke();
  c.restore();
}
// the wrinkle network as outline strokes only (for the pattern-match overlay), same transform as above
function macroOutline(x, y, s, col, a, width = 7) {
  if (a <= 0.01) return;
  for (const [cc, k] of [[ctx, 1], [gctx, 1]]) {
    cc.save();
    if (cc === gctx) cc.setTransform(0.5, 0, 0, 0.5, 0, 0);
    cc.translate(x, y); cc.scale(s, s);
    for (const P of [...MACRO.prim, ...MACRO.sec]) {
      smoothPath(cc, P.map(([px, py]) => [px, py * 0.97]));
      cc.lineWidth = cc === gctx ? width * 2.5 : width; cc.strokeStyle = rgba(col, a); cc.lineCap = 'round'; cc.stroke();
    }
    cc.restore();
  }
}

// ---------------------------------------------------------------- grape -> raisin, sponge
function grapeRaisin(x, y, r, k, t) {
  const c = ctx;
  const rr = r * (1 - 0.38 * k);
  const col1 = mixHex('#B6E07A', '#7A4868', k), col2 = mixHex('#4E8F2E', '#3A1E30', k);
  c.save(); c.translate(x, y);
  c.beginPath();
  for (let i = 0; i <= 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    const b = 1 + k * (0.06 * Math.sin(a * 7 + 1) + 0.04 * Math.sin(a * 13));
    c.lineTo(Math.cos(a) * rr * b, Math.sin(a) * rr * b * 0.95);
  }
  c.closePath();
  const g = c.createRadialGradient(-rr * 0.35, -rr * 0.4, rr * 0.1, 0, 0, rr * 1.1);
  g.addColorStop(0, mixHex('#E9FFC8', '#B07A9A', k)); g.addColorStop(0.4, col1); g.addColorStop(1, col2);
  c.fillStyle = g; c.fill();
  if (k > 0.05) {
    c.save(); c.clip();
    const rng = mulberry32(31);
    for (let i = 0; i < 9; i++) {
      const a = rng() * 6.28, L = rr * (0.5 + rng() * 0.8), yy = (rng() - 0.5) * rr * 1.4;
      c.beginPath(); c.moveTo(-L * 0.6, yy); c.quadraticCurveTo(0, yy + (rng() - 0.5) * rr * 0.6, L * 0.6, yy + (rng() - 0.5) * rr * 0.3);
      c.lineWidth = rr * 0.07; c.strokeStyle = rgba('#1E0E18', 0.8 * k); c.stroke();
      c.lineWidth = rr * 0.03; c.strokeStyle = rgba('#C48AA8', 0.5 * k); c.stroke();
    }
    c.restore();
  }
  ellipse(c, -rr * 0.35, -rr * 0.42, rr * 0.22, rr * 0.13, rgba('#FFFFFF', 0.75 - 0.45 * k), -0.5);
  // stem
  line(c, 0, -rr * 0.95, rr * 0.1, -rr * 1.3, rr * 0.1, mixHex('#6B8F3A', '#5A3A2A', k));
  c.restore();
  softDot(gctx, x, y, rr * 1.6, k > 0.5 ? '#B07AFF' : '#B6E07A', 0.25);
}
function sponge(x, y, s, t, o = {}) {
  const c = ctx, sw = o.swell || 0, sq = o.squish || 0;
  c.save(); c.translate(x, y); c.scale(s * (1 + 0.12 * sw + 0.1 * sq), s * (1 + 0.1 * sw - 0.35 * sq));
  rrect(c, -170, -90, 340, 180, 40);
  const g = c.createLinearGradient(0, -90, 0, 90);
  g.addColorStop(0, '#FFE27A'); g.addColorStop(1, '#E6A93A');
  c.fillStyle = g; c.fill();
  rrect(c, -170, -120, 340, 50, 24); c.fillStyle = '#3FB27F'; c.fill();
  const rng = mulberry32(8);
  for (let i = 0; i < 34; i++) ellipse(c, -150 + rng() * 300, -60 + rng() * 140, 5 + rng() * 9, 4 + rng() * 6, 'rgba(160,100,20,0.45)');
  if (o.drip) for (let i = 0; i < 5; i++) {
    const k = ((t * 1.4 + i / 5) % 1);
    circle(c, -120 + i * 60, 90 + k * 160, 9 * (1 - k * 0.5), rgba('#9FD9F2', 0.9 * o.drip * (1 - k)));
  }
  c.restore();
}
