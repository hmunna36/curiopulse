// Mosquitoes, and what draws them: the mosquito as a character (`mozzie`) and as one of a swarm (`mozMini`,
// `mozSwarm`), the smell coming off skin (`scentRibbon`, `acidMol`, `acidPlume`), the forearm up close (`macroArm`,
// adapted from goosebumps' arm.js: pores that bead with oil, bite bumps), small comic props (`biteBump`, `mozHeart`).
// Everything draws under the current camera (world coords) unless it says screen space. Loaded before scenes.js.
'use strict';

const MOZ = { body: '#9A88D8', bodySh: '#5E4E9C', bodyHi: '#C9BCF5', band: '#F1ECFF', line: '#1D1736', wing: '#CFEBFF', blood: '#E8405C', bloodHi: '#FF9AA8' };

// ---------------------------------------------------------------- the mosquito, as a character
// (x, y) = the thorax; s = scale (about 230 units from the tail to the tip of the proboscis at s = 1); it faces right
// unless o.flip. o: {fly 0..1 (wings beating, legs trailing; 0 = landed, wings folded, legs planted `leg` below the thorax),
// prob: angle of the proboscis below "straight ahead" (rad), probLen, fill 0..1 (a belly full of blood), face: 'calm' |
// 'happy' | 'love' | 'meh' | 'lock' | 'shock', look: [dx, dy] (-1..1), lid 0..1, bib, cutlery 0..1, halo, rot, alpha,
// sniff 0..1 (antennae quiver), leg (how far below the thorax the feet stand), glow (wing glow amount)}
function mozzie(c, x, y, s, t, o = {}) {
  const fly = o.fly === undefined ? 1 : o.fly, fill = o.fill || 0, face = o.face || 'calm';
  const look = o.look || [0.4, 0.2], lid = o.lid || 0, legY = o.leg === undefined ? 74 : o.leg;
  const a = o.alpha === undefined ? 1 : o.alpha;
  if (a <= 0.01 || s <= 0.001) return;
  c.save(); c.globalAlpha *= a;
  c.translate(x, y); c.rotate(o.rot || 0); c.scale(o.flip ? -s : s, s);
  c.lineCap = 'round'; c.lineJoin = 'round';
  const bob = fly * 5 * Math.sin(t * 13 + (o.seed || 0));
  c.translate(0, bob);
  // far legs (darker), then the abdomen, thorax, near legs
  const legs = (near) => {
    for (let i = 0; i < 3; i++) {
      const hx = -12 + i * 13, hy = 16;
      let kx, ky, fx, fy;
      if (fly > 0.5) { // trailing: knees back, feet hanging
        const sw = 6 * Math.sin(t * 9 + i * 1.7 + (near ? 0 : 1.3));
        kx = hx - 22 - i * 4 + (near ? 0 : 8); ky = hy + 30 + sw * 0.4; fx = kx - 26 + sw; fy = ky + 34 - i * 4;
      } else { // planted: knees arch high, feet wide
        kx = -64 + i * 52 + (near ? 0 : 14); ky = -22 - 8 * (i === 1 ? 1 : 0); fx = -96 + i * 82 + (near ? 0 : 20); fy = legY;
      }
      if (i === 2 && o.cutlery > 0.01 && near) continue;   // the front legs hold the knife and fork instead
      c.strokeStyle = near ? MOZ.bodySh : '#3B3168'; c.lineWidth = near ? 5 : 4.5;
      c.beginPath(); c.moveTo(hx, hy); c.lineTo(kx, ky); c.lineTo(fx, fy); c.stroke();
      if (near) { c.strokeStyle = MOZ.band; c.lineWidth = 5; c.beginPath(); c.moveTo(lerp(kx, fx, 0.42), lerp(ky, fy, 0.42)); c.lineTo(lerp(kx, fx, 0.56), lerp(ky, fy, 0.56)); c.stroke(); }
    }
  };
  legs(false);
  // wings (behind the body): a blur of ghosts when flying, one folded blade when landed
  const wingAt = (ang, al) => {
    c.save(); c.translate(-6, -22); c.rotate(ang);
    c.beginPath(); c.ellipse(-58, 0, 64, 17, 0, 0, 7);
    c.fillStyle = rgba(MOZ.wing, al); c.fill();
    c.lineWidth = 2; c.strokeStyle = rgba('#FFFFFF', al * 0.9); c.stroke();
    c.beginPath(); c.moveTo(0, 0); c.lineTo(-112, 2); c.lineWidth = 1.5; c.strokeStyle = rgba('#7FA8D8', al * 0.8); c.stroke();
    c.restore();
  };
  if (fly > 0.5) { const ph = t * 91 + (o.seed || 0) * 3; for (let i = 0; i < 4; i++) wingAt(0.75 * Math.sin(ph + i * 1.4) + 0.2, 0.26); }
  else wingAt(-0.2 + 0.03 * Math.sin(t * 5), 0.5);
  // abdomen: striped, swelling red as it fills
  const ab = 1 + 0.55 * fill;
  c.save(); c.translate(-22, 10); c.rotate(0.2 + 0.1 * fill);
  const abCol = fill > 0.02 ? mixHex(MOZ.body, MOZ.blood, clamp(fill * 1.3)) : MOZ.body;
  c.beginPath(); c.ellipse(-58, 0, 66, 19 * ab, 0, 0, 7); c.fillStyle = abCol; c.fill();
  c.save(); c.clip();
  for (let i = 0; i < 5; i++) { c.fillStyle = fill > 0.5 ? rgba(MOZ.bloodHi, 0.5) : MOZ.band; c.fillRect(-112 + i * 24, -40, 8, 80); }
  c.fillStyle = 'rgba(30,20,70,0.28)'; c.fillRect(-130, 6 * ab, 150, 40);
  ellipse(c, -66, -9 * ab, 34, 5, 'rgba(255,255,255,0.35)');
  c.restore();
  c.beginPath(); c.ellipse(-58, 0, 66, 19 * ab, 0, 0, 7); c.lineWidth = 3.5; c.strokeStyle = MOZ.line; c.stroke();
  c.restore();
  // thorax
  c.beginPath(); c.ellipse(0, 0, 36, 30, 0, 0, 7);
  const tg = c.createRadialGradient(-10, -12, 4, 0, 0, 40); tg.addColorStop(0, MOZ.bodyHi); tg.addColorStop(0.55, MOZ.body); tg.addColorStop(1, MOZ.bodySh);
  c.fillStyle = tg; c.fill(); c.lineWidth = 3.5; c.strokeStyle = MOZ.line; c.stroke();
  legs(true);
  // the bib (a napkin tucked under the chin)
  if (o.bib) {
    c.beginPath(); c.moveTo(14, -6); c.lineTo(52, 2); c.lineTo(40, 46); c.lineTo(20, 34); c.lineTo(6, 44); c.closePath();
    c.fillStyle = '#FFFFFF'; c.fill(); c.lineWidth = 3; c.strokeStyle = MOZ.line; c.stroke();
    c.strokeStyle = '#FF5A6E'; c.lineWidth = 3; c.beginPath(); c.moveTo(18, 12); c.lineTo(42, 16); c.moveTo(16, 24); c.lineTo(38, 28); c.stroke();
  }
  // proboscis (behind the head)
  const pa = o.prob === undefined ? 0.35 : o.prob, pl = o.probLen === undefined ? 84 : o.probLen;
  const px = 58 + Math.cos(pa) * pl, py = -6 + Math.sin(pa) * pl;
  c.strokeStyle = MOZ.line; c.lineWidth = 8; c.beginPath(); c.moveTo(56, -6); c.lineTo(px, py); c.stroke();
  c.strokeStyle = '#D9B26A'; c.lineWidth = 4; c.beginPath(); c.moveTo(56, -6); c.lineTo(px, py); c.stroke();
  // head
  const hx = 44, hy = -16;
  // antennae: two feathery curves that quiver when it sniffs
  for (let i = 0; i < 2; i++) {
    const q = (o.sniff || 0) * 0.35 * Math.sin(t * 34 + i * 2) + 0.06 * Math.sin(t * 7 + i);
    c.save(); c.translate(hx + 8 + i * 6, hy - 20); c.rotate(-0.9 + i * 0.36 + q);
    c.strokeStyle = MOZ.line; c.lineWidth = 4; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(24, -8, 46, 4); c.stroke();
    c.lineWidth = 2; for (let k = 1; k <= 5; k++) { const u = k / 5, bx = 46 * u, by = -8 * 4 * u * (1 - u) + 4 * u * u; c.beginPath(); c.moveTo(bx, by - 7); c.lineTo(bx, by + 7); c.stroke(); }
    c.restore();
  }
  circle(c, hx, hy, 27, MOZ.line); circle(c, hx, hy, 23.5, MOZ.body); ellipse(c, hx - 6, hy - 9, 12, 8, rgba(MOZ.bodyHi, 0.7), -0.5);
  // eyes: two big whites on the near side
  const eyes = [[hx - 5, hy - 6, 13], [hx + 15, hy - 4, 14.5]];
  for (const [ex, ey, er] of eyes) {
    circle(c, ex, ey, er + 2.5, MOZ.line);
    if (face === 'love') {   // heart eyes
      circle(c, ex, ey, er, '#FFFFFF');
      c.save(); c.translate(ex, ey + 1); const hs = er / 15 * (1 + 0.12 * Math.sin(t * 12));
      c.beginPath(); c.moveTo(0, 9 * hs); c.bezierCurveTo(-15 * hs, -1 * hs, -10 * hs, -13 * hs, 0, -6 * hs); c.bezierCurveTo(10 * hs, -13 * hs, 15 * hs, -1 * hs, 0, 9 * hs);
      c.fillStyle = '#FF3F6E'; c.fill(); c.restore();
    } else if (face === 'lock') {   // a targeting reticle
      circle(c, ex, ey, er, '#2A0A14'); c.lineWidth = 2.5; c.strokeStyle = '#FF4A5E';
      c.beginPath(); c.arc(ex, ey, er * 0.55, 0, 7); c.moveTo(ex - er, ey); c.lineTo(ex + er, ey); c.moveTo(ex, ey - er); c.lineTo(ex, ey + er); c.stroke();
      circle(c, ex, ey, 2.5, '#FF4A5E');
    } else {
      circle(c, ex, ey, er, '#FFFFFF');
      const pr = face === 'shock' ? er * 0.3 : er * 0.48;
      circle(c, ex + look[0] * (er - pr - 1), ey + look[1] * (er - pr - 1), pr, '#17122B');
      circle(c, ex + look[0] * (er - pr - 1) - pr * 0.3, ey + look[1] * (er - pr - 1) - pr * 0.35, pr * 0.32, '#FFFFFF');
      const ld = face === 'meh' ? Math.max(lid, 0.5) : face === 'happy' ? Math.max(lid, 0.12) : lid;
      if (ld > 0.01) { c.save(); c.beginPath(); c.arc(ex, ey, er, 0, 7); c.clip(); c.fillStyle = MOZ.bodySh; c.fillRect(ex - er, ey - er, 2 * er, 2 * er * ld); c.fillStyle = MOZ.line; c.fillRect(ex - er, ey - er + 2 * er * ld - 1.5, 2 * er, 3); c.restore(); }
      if (face === 'happy') { c.save(); c.beginPath(); c.arc(ex, ey, er, 0, 7); c.clip(); c.fillStyle = MOZ.body; c.beginPath(); c.ellipse(ex, ey + er * 1.25, er * 1.2, er * 0.75, 0, 0, 7); c.fill(); c.restore(); }
    }
  }
  // brow / mouth give it an attitude
  c.strokeStyle = MOZ.line; c.lineWidth = 4;
  if (face === 'meh') { c.beginPath(); c.moveTo(hx - 16, hy - 24); c.lineTo(hx + 28, hy - 22); c.stroke(); }
  if (face === 'lock') { c.beginPath(); c.moveTo(hx - 16, hy - 26); c.lineTo(hx + 4, hy - 20); c.moveTo(hx + 8, hy - 20); c.lineTo(hx + 30, hy - 27); c.stroke(); }
  if (face === 'happy' || face === 'love') { c.beginPath(); c.arc(hx + 10, hy + 9, 8, 0.2, Math.PI - 0.2); c.lineWidth = 3; c.stroke(); }
  // the knife and fork, held up by the front legs
  if (o.cutlery > 0.01) {
    const k = clamp(o.cutlery), wob = 0.08 * Math.sin(t * 6);
    for (const [sx, kind] of [[4, 'fork'], [36, 'knife']]) {
      c.strokeStyle = MOZ.bodySh; c.lineWidth = 5; c.beginPath(); c.moveTo(14, 16); c.lineTo(sx + 16, 34); c.lineTo(sx + 28, 22 - 14 * k); c.stroke();
      c.save(); c.translate(sx + 28, 22 - 14 * k); c.rotate((kind === 'fork' ? -0.25 : 0.3) + wob);
      c.strokeStyle = '#E8EEF8'; c.lineWidth = 4.5; c.beginPath(); c.moveTo(0, 12); c.lineTo(0, -34 * k); c.stroke();
      if (kind === 'fork') { c.lineWidth = 3; for (const dx of [-6, 0, 6]) { c.beginPath(); c.moveTo(dx, -34 * k); c.lineTo(dx, -50 * k); c.stroke(); } c.beginPath(); c.moveTo(-6, -34 * k); c.lineTo(6, -34 * k); c.stroke(); }
      else { c.beginPath(); c.moveTo(-2, -32 * k); c.quadraticCurveTo(12, -44 * k, 0, -58 * k); c.lineTo(-2, -32 * k); c.fillStyle = '#E8EEF8'; c.fill(); }
      c.restore();
    }
  }
  if (o.halo) {
    c.beginPath(); c.ellipse(hx + 2, hy - 44, 24, 7, 0, 0, 7); c.lineWidth = 5; c.strokeStyle = '#FFE46B'; c.stroke();
  }
  c.restore();
  // wing glow (so a dark mosquito reads against a night sky)
  const gl = o.glow === undefined ? 0.5 : o.glow;
  if (gl > 0.01 && c === ctx) softDot(gctx, x - (o.flip ? -1 : 1) * 30 * s, y - 30 * s + bob * s, 70 * s, '#9FD0FF', 0.3 * gl * a * (0.4 + 0.6 * fly));
}

// one of a swarm: a few strokes that still read as a mosquito at 30-70 px
function mozMini(c, x, y, s, t, seed = 0, flip = false, a = 1) {
  if (a <= 0.01) return;
  c.save(); c.globalAlpha *= a; c.translate(x, y); c.scale(flip ? -s : s, s); c.lineCap = 'round';
  const ph = t * 88 + seed * 5;
  for (let i = 0; i < 3; i++) { c.save(); c.translate(-2, -5); c.rotate(0.8 * Math.sin(ph + i * 1.6) + 0.1); c.beginPath(); c.ellipse(-15, 0, 17, 5.5, 0, 0, 7); c.fillStyle = 'rgba(207,235,255,0.32)'; c.fill(); c.restore(); }
  c.strokeStyle = '#3B3168'; c.lineWidth = 1.8;
  for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-4 + i * 4, 4); c.lineTo(-10 + i * 3, 12); c.lineTo(-16 + i * 3 + 2 * Math.sin(t * 9 + i + seed), 20); c.stroke(); }
  c.beginPath(); c.ellipse(-12, 3, 15, 5.2, 0.18, 0, 7); c.fillStyle = MOZ.body; c.fill(); c.lineWidth = 1.6; c.strokeStyle = MOZ.line; c.stroke();
  c.fillStyle = MOZ.band; for (let i = 0; i < 3; i++) c.fillRect(-22 + i * 6, 0, 2, 7);
  circle(c, 0, 0, 8.5, MOZ.line); circle(c, 0, 0, 7, MOZ.body);
  circle(c, 9, -3, 6.6, MOZ.line); circle(c, 9, -3, 5.2, '#FFFFFF'); circle(c, 10.6, -2.4, 2.5, '#17122B');
  c.strokeStyle = MOZ.line; c.lineWidth = 2.6; c.beginPath(); c.moveTo(13, 2); c.lineTo(27, 9); c.stroke();
  c.strokeStyle = '#D9B26A'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(13, 2); c.lineTo(27, 9); c.stroke();
  c.restore();
}

// a cloud of them round a point: each on its own wobbling orbit. o: {n, rx, ry, s, seed, k (0..1 how many have arrived),
// from: [x, y] (where they come in from), front: draw only those in front (true) / behind (false) / all (undefined)}
function mozSwarm(c, x, y, t, o = {}) {
  const n = o.n || 12, rx = o.rx || 200, ry = o.ry || 160, s0 = o.s || 1, seed = o.seed || 0, k = o.k === undefined ? 1 : o.k;
  for (let i = 0; i < n; i++) {
    const h1 = hash(i * 7.31 + seed), h2 = hash(i * 3.17 + seed + 4), h3 = hash(i * 5.71 + seed + 9);
    const inFront = h3 > 0.5;
    if (o.front !== undefined && o.front !== inFront) continue;
    const u = clamp(k * n - i * 0.999);                       // they arrive one after another
    if (u <= 0) continue;
    const sp = 1.6 + 2.2 * h1, ph = h2 * 6.283;
    const ox = Math.cos(t * sp + ph) * rx * (0.45 + 0.55 * h2) + 26 * Math.sin(t * 5.3 + i);
    const oy = Math.sin(t * sp * 1.31 + ph * 2) * ry * (0.4 + 0.6 * h1) + 18 * Math.sin(t * 6.1 + i * 2);
    const from = o.from || [x + 900, y - 500];
    const e = E.outCubic(u);
    const px = lerp(from[0] + 200 * (h1 - 0.5), x + ox, e), py = lerp(from[1] + 200 * (h2 - 0.5), y + oy, e);
    const vx = -Math.sin(t * sp + ph) * sp;
    mozMini(c, px, py, s0 * (0.75 + 0.5 * h3), t, i + seed, u < 1 ? from[0] > x : vx < 0, (o.alpha === undefined ? 1 : o.alpha));
  }
}

// ---------------------------------------------------------------- smell
// a wavy ribbon of scent rising from (x, y): h = its height, k = 0..1 how far it has grown, col its colour
function scentRibbon(x, y, h, t, col, k = 1, seed = 0, w = 7, sway = 34) {
  if (k <= 0.01) return;
  const P = [], n = 22;
  for (let i = 0; i <= n; i++) {
    const u = i / n, yy = y - h * u * clamp(k);
    P.push([x + sway * u * Math.sin(u * 5.2 - t * 2.6 + seed * 1.9) + 10 * Math.sin(t * 1.3 + seed), yy]);
  }
  both((c, g) => {
    for (let i = 1; i <= n; i++) {
      const u = i / n, al = Math.sin(Math.PI * Math.min(1, u * 1.15)) * (g ? 0.4 : 0.7) * clamp(k * 2);
      c.beginPath(); c.moveTo(P[i - 1][0], P[i - 1][1]); c.lineTo(P[i][0], P[i][1]);
      c.lineWidth = (g ? w * 2.4 : w) * (0.5 + 0.9 * u); c.lineCap = 'round'; c.strokeStyle = rgba(col, al); c.stroke();
    }
  });
}

// one "oily acid" molecule: a zig-zag chain with a two-oxygen head. (x, y) = the head, s = scale, rot, a = alpha
function acidMol(c, x, y, s, rot = 0, a = 1, col = '#FFE066') {
  if (a <= 0.01) return;
  c.save(); c.globalAlpha *= a; c.translate(x, y); c.rotate(rot); c.scale(s, s); c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(0, 0);
  for (let i = 1; i <= 5; i++) c.lineTo(-i * 13, i % 2 ? -8 : 0);
  c.lineWidth = 9; c.strokeStyle = '#3A2A06'; c.stroke(); c.lineWidth = 5; c.strokeStyle = col; c.stroke();
  for (let i = 1; i <= 5; i++) circle(c, -i * 13, i % 2 ? -8 : 0, 4.2, '#FFF6C8');
  circle(c, 0, 0, 10, '#3A2A06'); circle(c, 0, 0, 7.5, '#4A4A5A');
  for (const [ox, oy] of [[11, -9], [12, 8]]) { circle(c, ox, oy, 8.5, '#3A0A10'); circle(c, ox, oy, 6.2, '#FF5A6E'); circle(c, ox - 2, oy - 2, 2, '#FFC2CA'); }
  c.restore();
}

// molecules streaming up from a base line: n of them, rising `h`, born along x0..x1 at y. rate = cycles per second,
// k = 0..1 strength (how many are out), spread = how far they fan sideways at the top
function acidPlume(x0, x1, y, h, t, o = {}) {
  const n = o.n || 14, k = o.k === undefined ? 1 : o.k, rate = o.rate || 0.5, s = o.s || 1, seed = o.seed || 0, spread = o.spread || 60;
  for (let i = 0; i < n; i++) {
    if (i >= Math.ceil(n * clamp(k))) break;
    const h1 = hash(i * 9.1 + seed), h2 = hash(i * 4.7 + seed + 3);
    const u = (((t * rate * (0.7 + 0.6 * h2) + h1) % 1) + 1) % 1;
    const bx = lerp(x0, x1, h1), px = bx + spread * (h2 - 0.5) * 2 * u + 16 * Math.sin(t * 2.2 + i * 1.7) * u, py = y - h * E.outCubic(u) * (0.75 + 0.5 * h2);
    const al = Math.min(1, u * 6) * (1 - Math.pow(u, 3)) * clamp(k * 1.5);
    acidMol(ctx, px, py, s * (0.75 + 0.5 * h1), -1.57 + 0.7 * Math.sin(t * 1.9 + i), al, o.col);
    softDot(gctx, px, py, 34 * s, o.glow || '#FFD447', 0.4 * al);
  }
}

// a little heart that floats up (a mosquito in love)
function mozHeart(x, y, s, a = 1) {
  if (a <= 0.01) return;
  both((c, g) => {
    c.save(); c.globalAlpha *= a * (g ? 0.5 : 1); c.translate(x, y); c.scale(s, s);
    c.beginPath(); c.moveTo(0, 14); c.bezierCurveTo(-24, -2, -16, -22, 0, -10); c.bezierCurveTo(16, -22, 24, -2, 0, 14);
    c.fillStyle = '#FF4A78'; c.fill(); if (!g) { c.lineWidth = 3; c.strokeStyle = '#5A0A22'; c.stroke(); }
    c.restore();
  });
}

// ---------------------------------------------------------------- the forearm, up close
const MARM = { hairs: null, pores: null, tilt: 0.5 };
const MARM_TONES = {
  you: ['#FFD9BF', '#F6C29E', '#EDB08A', '#CF8663', '#A9634A', '#472A1A'],
  friend: ['#E9B58E', '#D69C72', '#C4875C', '#9C6440', '#774A2E', '#2A1A12'],
};
function marmHW(u) { return 236 - 46 * (u + 800) / 1600 + 16 * Math.exp(-(((u + 380) / 320) ** 2)); }   // half-width along the forearm

function initMozzie() {
  const rng = mulberry32(31);
  MARM.hairs = []; MARM.pores = [];
  let row = 0;
  for (let v = -0.8; v <= 0.84; v += 0.2, row++) {
    for (let u = -960 + (row % 2) * 52; u <= 960; u += 104) {
      const p = { u: u + (rng() - 0.5) * 44, v: v + (rng() - 0.5) * 0.09, j: rng(), r: 0.8 + rng() * 0.4 };
      MARM.pores.push(p);
      if (rng() < 0.62) MARM.hairs.push({ u: p.u, v: p.v, len: 50 + rng() * 30, bend: (rng() - 0.5) * 0.7, j: p.j, lay: 0.16 + rng() * 0.16 });
    }
  }
  MARM.hairs.sort((a, b) => a.v - b.v);
}

// the forearm in its own frame (axis along x, elbow to the left, wrist to the right; about 470 thick at s = 1).
// o: {x, y, rot, s, t, tone: 'you' | 'friend', warm 0..1 (firelight from below), cool 0..1 (moonlight on top),
// oil: (u, j) => 0..1 (a bead of oil on that pore), bites: [[u, v, k]], hairs: false to leave them out}
function macroArm(o) {
  const c = ctx, t = o.t || 0, tau = MARM.tilt, T = MARM_TONES[o.tone || 'you'];
  c.save(); c.translate(o.x, o.y); c.rotate(o.rot || 0); c.scale(o.s || 1, o.s || 1);
  const path = () => {
    c.beginPath();
    for (let u = -1000; u <= 1000; u += 40) c.lineTo(u, -marmHW(u));
    for (let u = 1000; u >= -1000; u -= 40) c.lineTo(u, marmHW(u));
    c.closePath();
  };
  path();
  const g = c.createLinearGradient(0, -240, 0, 240);
  g.addColorStop(0, T[0]); g.addColorStop(0.16, T[1]); g.addColorStop(0.55, T[2]); g.addColorStop(0.86, T[3]); g.addColorStop(1, T[4]);
  c.fillStyle = g; c.fill();
  c.save(); path(); c.clip();
  softDot(c, -260, -70, 520, '#FFE3CC', 0.2);
  const cool = o.cool === undefined ? 0.6 : o.cool, warm = o.warm === undefined ? 0.6 : o.warm;
  const rim = c.createLinearGradient(0, -250, 0, -110); rim.addColorStop(0, `rgba(150,185,255,${clamp(0.34 * cool)})`); rim.addColorStop(1, 'rgba(150,185,255,0)');
  c.fillStyle = rim; c.fillRect(-1000, -260, 2000, 160);
  const wr = c.createLinearGradient(0, 250, 0, 60); wr.addColorStop(0, `rgba(255,150,60,${clamp(0.5 * warm)})`); wr.addColorStop(1, 'rgba(255,150,60,0)');
  c.fillStyle = wr; c.fillRect(-1000, 40, 2000, 230);
  for (let i = 0; i < 9; i++) { const u = -820 + i * 205; c.beginPath(); c.moveTo(u, -marmHW(u)); c.quadraticCurveTo(u + 26, 0, u + 6, marmHW(u)); c.lineWidth = 2; c.strokeStyle = 'rgba(120,60,40,0.10)'; c.stroke(); }
  // pores: small dimples; a bead of oil swells out of each when asked
  const beads = [];
  for (const p of MARM.pores) {
    const hw = marmHW(p.u), x = p.u, y = p.v * hw, fy = 0.45 + 0.55 * Math.sqrt(Math.max(0, 1 - p.v * p.v));
    ellipse(c, x, y, 5.5 * p.r, 4 * p.r * fy, 'rgba(96,44,28,0.5)');
    ellipse(c, x - 1.5, y - 1.5 * fy, 2.2 * p.r, 1.5 * p.r * fy, 'rgba(255,235,220,0.35)');
    const k = o.oil ? o.oil(p.u, p.j, p) : 0;
    if (k > 0.02) beads.push([x, y, 15 * p.r * Math.min(1.2, k), fy, k]);
  }
  for (const [u, v, k] of (o.bites || [])) biteBump(c, u, v * marmHW(u), 30, k);
  c.restore();
  // fine hairs lying along the arm
  if (o.hairs !== false) for (const h of MARM.hairs) {
    const hw = marmHW(h.u), x = h.u, y = h.v * hw;
    const ny = h.v * Math.cos(tau) - Math.sqrt(Math.max(0, 1 - h.v * h.v)) * Math.sin(tau);
    const a = h.lay + 0.03 * Math.sin(t * 3 + h.j * 20), dx = Math.cos(a), dy = ny * Math.sin(a), L = h.len;
    const tx = x + dx * L, ty = y + dy * L, mx = x + dx * L * 0.5 + h.bend * 14, my = y + dy * L * 0.5 - 10 * (ny < 0 ? 1 : -1);
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(mx, my, tx, ty); c.lineWidth = 2.2; c.lineCap = 'round'; c.strokeStyle = rgba(T[5], 0.55); c.stroke();
  }
  // the beads of oil, on top: amber, glossy
  for (const [x, y, r, fy, k] of beads) {
    c.beginPath(); c.ellipse(x, y - r * 0.3, r, r * (0.55 + 0.45 * fy), 0, 0, 7);
    const bg = c.createRadialGradient(x - r * 0.35, y - r * 0.75, 1, x, y - r * 0.3, r * 1.1); bg.addColorStop(0, '#FFF6C4'); bg.addColorStop(0.45, '#FFC83D'); bg.addColorStop(1, '#C97A0A');
    c.fillStyle = bg; c.fill(); c.lineWidth = 2; c.strokeStyle = 'rgba(120,60,0,0.6)'; c.stroke();
    ellipse(c, x - r * 0.35, y - r * 0.7, r * 0.26, r * 0.16, 'rgba(255,255,255,0.9)', -0.5);
  }
  c.restore();
  // their glow, in the same frame
  if (beads.length) {
    gctx.save(); gctx.translate(o.x, o.y); gctx.rotate(o.rot || 0); gctx.scale(o.s || 1, o.s || 1);
    for (const [x, y, r, , k] of beads) softDot(gctx, x, y - r * 0.3, r * 2.0, '#FFC83D', 0.15 * clamp(k));
    gctx.restore();
  }
}
// a point on the arm's surface, in world coords (u along the arm, v across it -1..1)
function marmPt(o, u, v = 0) {
  const s = o.s || 1, r = o.rot || 0, x = u * s, y = v * marmHW(u) * s;
  return [o.x + x * Math.cos(r) - y * Math.sin(r), o.y + x * Math.sin(r) + y * Math.cos(r)];
}

// a mosquito bite: a pink welt with a darker dot. k = 0..1 how swollen
function biteBump(c, x, y, r, k = 1) {
  if (k <= 0.02) return;
  const kk = clamp(k);
  const g = c.createRadialGradient(x - r * 0.2, y - r * 0.25, 1, x, y, r * (0.7 + 0.3 * kk));
  g.addColorStop(0, `rgba(255,170,160,${0.95 * kk})`); g.addColorStop(0.55, `rgba(240,96,110,${0.75 * kk})`); g.addColorStop(1, 'rgba(240,96,110,0)');
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
  circle(c, x, y, r * 0.12, `rgba(150,30,50,${0.8 * kk})`);
}
