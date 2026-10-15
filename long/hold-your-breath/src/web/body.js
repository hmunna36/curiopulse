// What If You Hold Your Breath TOO Long? (long-form): inside him. His chest as an x-ray from the front (the hiccups
// Short's chest, without the soda: lungs that fill, the windpipe, a heart that beats, the dome of the diaphragm with a
// face, the stomach and, beside it, the spleen as a little purple bean), the blood up close (red cells carrying
// oxygen beads; the violet "exhaust" piling up between them), the sensor at the base of his brain (a little alarm
// with a tongue that tastes the blood), the two gauges (OXYGEN tank, EXHAUST alarm) and a heart monitor.
// Chest coordinates: x = 0 on his midline, y = 0 where the diaphragm's dome ends; v = {x, y, s} maps them to the world.
'use strict';

const BX = { larynx: [0, -560], half: 34, mouth: [0, -728], carina: [0, -360], stom: [150, 240], heart: [-40, -200], spleen: [262, 150] };
const O2C = '#7FE9FF', EXC = '#B48CFF', BLOODC = '#E8364E';

// the diaphragm's centre line at x. o: {drop 0..1 (0 = relaxed dome, 1 = pulled flat), kick (a jerk upward, 0..1)}
function bxDiaY(x, o = {}) {
  const h = lerp(104, 12, o.drop || 0) + 46 * (o.kick || 0);
  const s = Math.pow(Math.max(0, Math.cos(Math.PI * x / 568)), 0.7) - 0.15 * Math.exp(-Math.pow(x / 62, 2));
  return 52 - h * s;
}
function bxSmooth(c, P, close = true) {
  const n = P.length;
  c.beginPath();
  if (close) {
    c.moveTo((P[n - 1][0] + P[0][0]) / 2, (P[n - 1][1] + P[0][1]) / 2);
    for (let i = 0; i < n; i++) { const a = P[i], b = P[(i + 1) % n]; c.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); }
    c.closePath();
  } else {
    c.moveTo(P[0][0], P[0][1]);
    for (let i = 1; i < n - 1; i++) c.quadraticCurveTo(P[i][0], P[i][1], (P[i][0] + P[i + 1][0]) / 2, (P[i][1] + P[i + 1][1]) / 2);
    c.lineTo(P[n - 1][0], P[n - 1][1]);
  }
}
function bxLungPts(sd, o, fill = 1) {
  const w = 1 + 0.035 * (o.drop || 0) + 0.05 * (fill - 1), m = (x) => sd * x, by = (x) => bxDiaY(sd * x, o) - 30;
  const P = [[m(92), -338], [m(150 * w), -326], [m(214 * w), -276], [m(256 * w), -190], [m(266 * w), -90], [m(262 * w), by(262) - 30], [m(256 * w), by(256)]];
  for (let x = 220; x >= 60; x -= 40) P.push([m(x), by(x)]);
  P.push([m(40), by(40)], [m(34), by(34) - 40], [m(30), -160], [m(42), -256], [m(64), -318]);
  return P;
}
function bxStomPath(c) {
  const ox = BX.stom[0], oy = BX.stom[1];
  const pts = [[96, 78], [112, 46], [196, 40], [236, 86], [262, 150], [240, 214], [170, 244], [96, 236], [56, 224], [34, 212], [34, 184], [70, 190], [112, 178], [134, 146], [124, 104]].map((p) => [ox + (p[0] - 150), oy + (p[1] - 240)]);
  bxSmooth(c, pts);
}
// a heart (local units, centre at 0,0, about 2r wide), beat 0..1 squeezes it
function heartShape(c, r, beat = 0) {
  const k = 1 - 0.12 * beat;
  c.save(); c.scale(k, k);
  c.beginPath(); c.moveTo(0, r * 0.95);
  c.bezierCurveTo(-r * 1.25, r * 0.15, -r * 1.05, -r * 0.95, -r * 0.4, -r * 0.82);
  c.bezierCurveTo(-r * 0.12, -r * 0.76, 0, -r * 0.55, 0, -r * 0.42);
  c.bezierCurveTo(0, -r * 0.55, r * 0.12, -r * 0.76, r * 0.4, -r * 0.82);
  c.bezierCurveTo(r * 1.05, -r * 0.95, r * 1.25, r * 0.15, 0, r * 0.95);
  c.closePath(); c.restore();
}
// the beat of a heart at bpm since t0 (a sharp squeeze that relaxes)
function beatAt(t, bpm, t0 = 0) { const ph = ((t - t0) * bpm / 60) % 1; return Math.exp(-ph * 9) * (ph >= 0 ? 1 : 0); }
// the heart's beat when its rate changes over time: bpmAt(t) -> a phase integrated in steps of 1/30 s from t0
function beatVar(t, bpmFn, t0) {
  let ph = 0;
  for (let u = t0; u < t; u += 1 / 30) ph += bpmFn(u) / 60 / 30;
  const f = ph % 1;
  return Math.exp(-f * 9);
}

// a little face on an organ (screen or local units), mood: 'calm' 'sour' 'angry' 'shock' 'happy' 'squeeze' 'sleep'
function organFace(c, x, y, s, mood, t, look = [0, 0]) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const shut = mood === 'squeeze' || mood === 'sleep' || mood === 'happy';
  for (const sd of [-1, 1]) {
    const ex = sd * 18;
    if (shut) { c.beginPath(); if (mood === 'happy') c.arc(ex, 2, 8, Math.PI * 1.1, Math.PI * 1.9); else { c.moveTo(ex - 9, sd * 0 - (mood === 'squeeze' ? sd * 4 : 0)); c.lineTo(ex + 9, mood === 'squeeze' ? sd * 4 : 0); } c.lineWidth = 4; c.strokeStyle = '#2A0A18'; c.lineCap = 'round'; c.stroke(); continue; }
    const open = mood === 'shock' ? 1.35 : 1;
    ellipse(c, ex, 0, 9, 10 * open, '#FFFFFF');
    circle(c, ex + look[0] * 3, look[1] * 3 + (mood === 'shock' ? 0 : 1), mood === 'shock' ? 3.4 : 4.8, '#2A0A18');
    if (mood === 'angry') line(c, ex - sd * 10, -16, ex + sd * 8, -9, 4, '#2A0A18');
    if (mood === 'sour') line(c, ex - sd * 10, -12, ex + sd * 8, -16, 3.5, '#2A0A18');
  }
  c.lineCap = 'round'; c.lineWidth = 4; c.strokeStyle = '#2A0A18'; c.beginPath();
  if (mood === 'shock') { c.fillStyle = '#2A0A18'; c.ellipse(0, 18, 6, 9, 0, 0, 7); c.fill(); }
  else if (mood === 'sour') { c.moveTo(-9, 18); c.quadraticCurveTo(-4, 13, 0, 18); c.quadraticCurveTo(4, 23, 9, 18); c.stroke(); }
  else if (mood === 'angry') { c.moveTo(-9, 19); c.quadraticCurveTo(0, 12, 9, 19); c.stroke(); }
  else if (mood === 'happy' || mood === 'calm') { c.moveTo(-8, 14); c.quadraticCurveTo(0, 21, 8, 14); c.stroke(); }
  else if (mood === 'squeeze') { c.moveTo(-8, 18); c.lineTo(8, 18); c.stroke(); }
  else { c.moveTo(-6, 16); c.lineTo(6, 16); c.stroke(); }
  c.restore();
}

// ---------------------------------------------------------------- the chest, from the front
// v = {x, y, s}. o: {drop, kick, fill (lungs 0..1.1), o2 (cyan glow in the lungs 0..1), ex (violet exhaust 0..1), bpm, beat,
//   heartGlow, spleen (0..1 shown), squeeze (0..1), cells (red cells leaving the spleen 0..1), mood ('calm'|'angry'|...),
//   air (air streaming in or out 0..1), airDir (+1 in, -1 out), diaGlow, label fns...}
function chestX(v, t, o = {}) {
  const c = ctx, dO = { drop: o.drop || 0, kick: o.kick || 0 }, fill = o.fill === undefined ? 1 : o.fill;
  const G = (fn) => { gctx.save(); gctx.setTransform(0.5 * v.s, 0, 0, 0.5 * v.s, 0.5 * v.x, 0.5 * v.y); fn(gctx); gctx.restore(); };
  c.save(); c.translate(v.x, v.y); c.scale(v.s, v.s);
  // the body's outline and head
  c.beginPath(); c.moveTo(-64, -690); c.lineTo(-64, -588); c.quadraticCurveTo(-96, -548, -262, -524); c.quadraticCurveTo(-338, -506, -330, -400);
  c.lineTo(-284, 70); c.quadraticCurveTo(-300, 240, -290, 420); c.lineTo(-300, 1300); c.lineTo(300, 1300); c.lineTo(290, 420); c.quadraticCurveTo(300, 240, 284, 70); c.lineTo(330, -400);
  c.quadraticCurveTo(338, -506, 262, -524); c.quadraticCurveTo(96, -548, 64, -588); c.lineTo(64, -690); c.closePath();
  c.fillStyle = 'rgba(34,78,160,0.32)'; c.fill(); c.lineWidth = 5; c.strokeStyle = 'rgba(127,233,255,0.7)'; c.stroke();
  G((g) => { g.lineWidth = 12; g.strokeStyle = 'rgba(80,180,255,0.3)'; g.beginPath(); g.moveTo(-262, -524); g.quadraticCurveTo(-338, -506, -330, -400); g.lineTo(-284, 70); g.moveTo(262, -524); g.quadraticCurveTo(338, -506, 330, -400); g.lineTo(284, 70); g.stroke(); });
  c.beginPath(); c.ellipse(0, -812, 150, 164, 0, 0, Math.PI * 2); c.fillStyle = 'rgba(40,90,176,0.5)'; c.fill(); c.lineWidth = 5; c.strokeStyle = 'rgba(127,233,255,0.7)'; c.stroke();
  c.save(); c.translate(0, -818); c.scale(2.34, 2.34);
  c.beginPath(); c.moveTo(-66, 10); c.quadraticCurveTo(-74, -54, -30, -70); c.quadraticCurveTo(12, -88, 48, -64); c.quadraticCurveTo(76, -44, 66, 10);
  c.quadraticCurveTo(60, -22, 32, -36); c.quadraticCurveTo(2, -26, -20, -42); c.quadraticCurveTo(-52, -30, -66, 10); c.closePath();
  c.fillStyle = 'rgba(14,26,84,0.78)'; c.fill();
  for (const sd of [-1, 1]) { ellipse(c, sd * 24, -2, 13, 16, 'rgba(235,246,255,0.92)'); circle(c, sd * 24, 4, 6.5, '#0C1A4A'); line(c, sd * 11, -34, sd * 37, -30, 7, 'rgba(14,26,84,0.85)'); }
  // puffed cheeks (he is holding it)
  if ((o.puff || 0) > 0.02) for (const sd of [-1, 1]) ellipse(c, sd * 48, 30, 16 + 12 * o.puff, 14 + 10 * o.puff, 'rgba(60,110,200,0.55)');
  c.restore();
  // faint ribs
  for (let i = 0; i < 6; i++) for (const sd of [-1, 1]) {
    const y = -470 + i * 62;
    c.beginPath(); c.moveTo(sd * 22, y); c.quadraticCurveTo(sd * 250, y - 34 + i * 7, sd * (296 - i * 5), y + 78);
    c.lineWidth = 9; c.strokeStyle = 'rgba(200,230,255,0.10)'; c.stroke();
  }
  // ---- the lungs
  for (const sd of [-1, 1]) {
    const P = bxLungPts(sd, dO, fill);
    bxSmooth(c, P);
    const lg = c.createRadialGradient(sd * 120, -250, 20, sd * 150, -170, 300); lg.addColorStop(0, '#FFC1CE'); lg.addColorStop(0.6, '#F0889F'); lg.addColorStop(1, '#C85C7C');
    c.fillStyle = lg; c.fill(); c.lineWidth = 6; c.strokeStyle = '#8A2F52'; c.stroke();
    c.save(); bxSmooth(c, P); c.clip();
    const br = [[sd * 58, -296], [sd * 110, -262], [sd * 150, -210]], yb = bxDiaY(sd * 150, dO);
    c.lineCap = 'round'; c.strokeStyle = 'rgba(232,248,255,0.85)';
    c.lineWidth = 13; bxSmooth(c, [[sd * 20, -340], ...br], false); c.stroke();
    for (const [a, bx2, by2, w2] of [[1, 196, -292, 8], [1, 226, -200, 8], [2, 208, -120, 7], [2, 150, -100, 8], [2, 96, -110, 7], [1, 96, -200, 6]]) {
      c.lineWidth = w2; c.beginPath(); c.moveTo(br[a][0], br[a][1]); c.quadraticCurveTo((br[a][0] + sd * bx2) / 2 + sd * 10, (br[a][1] + by2) / 2 - 12, sd * bx2, by2); c.stroke();
    }
    // the air in them: oxygen (cyan) and exhaust (violet) as soft dots that drift
    const o2 = o.o2 === undefined ? 0.7 : o.o2, ex = o.ex || 0;
    for (let i = 0; i < 44; i++) {
      const px = sd * (60 + 190 * hash(i * 3.1 + sd)), py = -320 + 300 * hash(i * 7.7 + 2) + 6 * Math.sin(t * 1.4 + i);
      if (py > yb - 20) continue;
      const isEx = hash(i * 1.3 + 9) < ex;
      const col = isEx ? EXC : O2C, a = isEx ? 0.95 : 0.9 * o2;
      if (a < 0.05) continue;
      circle(c, px, py, isEx ? 9 : 7, rgba(col, a));
      G((g) => softDot(g, px, py, 20, col, 0.35 * a));
    }
    c.restore();
  }
  // ---- the windpipe and the mouth (closed when he holds it)
  line(c, -72, -326, -18, -356, 30, '#E7B6C6'); line(c, 72, -326, 18, -356, 30, '#E7B6C6');
  line(c, -72, -326, -18, -356, 16, '#0B1F3F'); line(c, 72, -326, 18, -356, 16, '#0B1F3F');
  c.beginPath(); c.moveTo(-30, -700); c.lineTo(30, -700); c.lineTo(30, -352); c.quadraticCurveTo(0, -330, -30, -352); c.closePath(); c.fillStyle = '#E7B6C6'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#A8627E'; c.stroke();
  c.beginPath(); c.moveTo(-20, -700); c.lineTo(20, -700); c.lineTo(20, -356); c.quadraticCurveTo(0, -342, -20, -356); c.closePath(); c.fillStyle = '#0B1F3F'; c.fill();
  for (let y = -680; y < -366; y += 26) for (const sd of [-1, 1]) line(c, sd * 21, y, sd * 30, y, 9, '#C98AA4');
  // air streaming down (in) or up (out)
  if ((o.air || 0) > 0.01) {
    for (let i = 0; i < 26; i++) {
      const u = (hash(i * 2.7 + 1) + t * (o.airDir || 1) * (0.9 + 0.5 * hash(i + 31))) % 1, uu = u < 0 ? u + 1 : u;
      const y = lerp(-760, -380, uu), x = (hash(i * 5.3 + 2) - 0.5) * 30;
      line(c, x, y - 18 * (o.airDir || 1), x, y, 4.5, `rgba(150,236,255,${0.9 * o.air})`);
    }
  }
  // ---- the heart (between the lungs, a little to his left = our right)
  const hb = o.beat === undefined ? beatAt(t, o.bpm || 72) : o.beat;
  c.save(); c.translate(BX.heart[0] + 60, BX.heart[1] + 10); c.rotate(-0.35);
  heartShape(c, 74, hb); const hg = c.createRadialGradient(-20, -20, 10, 0, 0, 90); hg.addColorStop(0, '#FF7A8A'); hg.addColorStop(1, '#B81E3A'); c.fillStyle = hg; c.fill();
  c.lineWidth = 5; c.strokeStyle = '#6A0A1E'; c.stroke();
  c.restore();
  G((g) => softDot(g, BX.heart[0] + 60, BX.heart[1] + 10, 120, '#FF4060', (0.25 + 0.4 * hb) * (o.heartGlow === undefined ? 0.6 : o.heartGlow)));
  // ---- the stomach and the spleen (under the diaphragm's left half = our right)
  bxStomPath(c); c.fillStyle = 'rgba(230,140,170,0.55)'; c.fill(); c.lineWidth = 5; c.strokeStyle = 'rgba(140,40,80,0.7)'; c.stroke();
  const sp = o.spleen || 0;
  if (sp > 0.01) {
    const sq = o.squeeze || 0, [sx, sy] = BX.spleen;
    c.save(); c.translate(sx, sy); c.rotate(0.5); c.scale(sp * (1 - 0.22 * sq), sp * (1 + 0.1 * sq));
    c.beginPath(); c.ellipse(0, 0, 70, 44, 0, 0, Math.PI * 2);
    const sg = c.createRadialGradient(-20, -14, 6, 0, 0, 80); sg.addColorStop(0, '#C890FF'); sg.addColorStop(1, '#6A2AB0');
    c.fillStyle = sg; c.fill(); c.lineWidth = 5; c.strokeStyle = '#3A0A6A'; c.stroke();
    c.restore();
    organFace(c, sx, sy, 1.1 * sp, sq > 0.3 ? 'squeeze' : 'calm', t);
    // red cells squeezed out of it, streaming up toward the heart
    const cl = o.cells || 0;
    for (let i = 0; i < 14 * cl; i++) {
      const u = (hash(i * 3.3) + t * 0.6) % 1, px = lerp(sx - 40, BX.heart[0] + 60, u) + 30 * Math.sin(u * 6 + i), py = lerp(sy - 30, BX.heart[1] + 40, u);
      c.save(); c.translate(px, py); c.rotate(i); ellipse(c, 0, 0, 16, 11, BLOODC); ellipse(c, 0, 0, 8, 5, '#B01E36'); c.restore();
    }
  }
  // ---- the diaphragm: a domed sheet of muscle, with a face
  const band = (hw) => {
    c.beginPath();
    for (let x = -286; x <= 286; x += 11) { const y = bxDiaY(x, dO) - hw * (0.55 + 0.45 * Math.cos(Math.PI * x / 600)); x === -286 ? c.moveTo(x, y) : c.lineTo(x, y); }
    for (let x = 286; x >= -286; x -= 11) c.lineTo(x, bxDiaY(x, dO) + hw * (0.55 + 0.45 * Math.cos(Math.PI * x / 600)));
    c.closePath();
  };
  band(26); c.fillStyle = '#8E2238'; c.fill();
  band(21);
  const mg = c.createLinearGradient(0, -70, 0, 80); mg.addColorStop(0, '#FF8A84'); mg.addColorStop(1, '#D8444E');
  c.fillStyle = mg; c.fill();
  c.save(); band(21); c.clip();
  for (let x = -280; x <= 280; x += 17) { const y = bxDiaY(x, dO); line(c, x - 5, y - 20, x + 5, y + 20, 3, 'rgba(255,206,196,0.4)'); }
  ellipse(c, 0, bxDiaY(0, dO), 54, 14, 'rgba(255,236,226,0.85)');
  c.restore();
  if ((o.diaGlow || 0) > 0.01) G((g) => { g.lineWidth = 30; g.strokeStyle = `rgba(255,120,110,${0.6 * o.diaGlow})`; g.beginPath(); for (let x = -280; x <= 280; x += 20) { const y = bxDiaY(x, dO); x === -280 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); });
  const fx = -112, fy = bxDiaY(fx, dO) - 1;
  organFace(c, fx, fy, 1.05, o.mood || 'calm', t, [0.6, -0.4]);
  c.restore();
}
function bxPt(v, x, y) { return [v.x + x * v.s, v.y + y * v.s]; }

// ---------------------------------------------------------------- the blood up close (screen space)
// A vessel across the frame, cut open: red cells (discs) tumble along it carrying cyan oxygen beads (o.o2 = the share of
// cells that are full), and violet exhaust bubbles crowd the gaps between them (o.ex 0..1). o.y = the vessel's centre,
// o.h = its height; o.flow = speed; o.pulse (each heartbeat pushes the flow).
function bloodTube(t, o = {}) {
  const c = ctx, y0 = o.y || 520, hh = o.h || 520, top = y0 - hh / 2, bot = y0 + hh / 2, flow = o.flow === undefined ? 1 : o.flow;
  // the dark inside of the body behind
  const bg = c.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#1A0614'); bg.addColorStop(1, '#0A0210');
  c.fillStyle = bg; c.fillRect(0, 0, W, H);
  // the vessel wall (top and bottom bands) and the plasma
  const pl = c.createLinearGradient(0, top, 0, bot); pl.addColorStop(0, '#5A1028'); pl.addColorStop(0.5, '#7A1A34'); pl.addColorStop(1, '#4A0C22');
  c.fillStyle = pl; c.fillRect(-20, top, W + 40, hh);
  for (const [yy, d] of [[top, -1], [bot, 1]]) {
    c.beginPath(); c.moveTo(-20, yy);
    for (let x = -20; x <= W + 20; x += 30) c.lineTo(x, yy + d * (6 * Math.sin(x * 0.01 + t * 0.8) + 4));
    c.lineTo(W + 20, yy + d * 90); c.lineTo(-20, yy + d * 90); c.closePath();
    c.fillStyle = '#C8506A'; c.fill();
    c.beginPath(); c.moveTo(-20, yy + d * 2); for (let x = -20; x <= W + 20; x += 30) c.lineTo(x, yy + d * (6 * Math.sin(x * 0.01 + t * 0.8) + 4)); c.lineWidth = 8; c.strokeStyle = '#FF8AA0'; c.stroke();
  }
  // the exhaust: violet bubbles between the cells (they accumulate: more of them, bigger)
  const ex = o.ex || 0;
  for (let i = 0; i < 90; i++) {
    if (hash(i * 9.1 + 4) > ex) continue;
    const sp = 40 + 60 * hash(i + 2), x = ((hash(i * 3.7) * (W + 200) + t * sp * flow) % (W + 200)) - 100, y = top + 30 + (hh - 60) * hash(i * 5.9 + 1) + 10 * Math.sin(t * 2 + i);
    const r = 7 + 9 * hash(i * 1.7) * (0.6 + 0.6 * ex);
    circle(c, x, y, r, rgba(EXC, 0.85)); circle(c, x - r * 0.3, y - r * 0.3, r * 0.3, 'rgba(255,255,255,0.5)');
    softDot(gctx, x, y, r * 2.4, EXC, 0.3);
  }
  // the red cells, each with four oxygen beads when it is full
  const o2 = o.o2 === undefined ? 1 : o.o2;
  for (let i = 0; i < 26; i++) {
    const sp = 70 + 50 * hash(i * 2.2), x = ((hash(i * 7.3 + 3) * (W + 300) + t * sp * flow) % (W + 300)) - 150, y = top + 70 + (hh - 140) * hash(i * 4.1 + 2) + 18 * Math.sin(t * 1.3 + i * 2);
    const rot = t * (0.6 + hash(i)) + i, tilt = 0.45 + 0.5 * Math.abs(Math.sin(t * 0.7 + i));
    c.save(); c.translate(x, y); c.rotate(rot * 0.3);
    ellipse(c, 0, 0, 62, 62 * tilt, '#D82A44'); ellipse(c, 0, 0, 34, 34 * tilt, '#B01A34'); ellipse(c, -10, -12 * tilt, 22, 9 * tilt, 'rgba(255,170,180,0.4)');
    c.restore();
    const full = hash(i * 6.6 + 1) < o2;
    if (full) for (let k = 0; k < 4; k++) {
      const a = k * Math.PI / 2 + t * 0.8 + i, bx = x + Math.cos(a) * 46, by = y + Math.sin(a) * 30 * tilt;
      circle(c, bx, by, 11, O2C); circle(c, bx - 3, by - 3, 4, '#FFFFFF');
      softDot(gctx, bx, by, 26, O2C, 0.4);
    }
  }
}

// ---------------------------------------------------------------- the alarm at the base of the brain (screen space)
// His head in profile, see-through (facing right), the brain, and at its base the brainstem with the sensor: a round
// white alarm with a face, a little red light on top and a tongue that dips into a vessel to taste the blood.
// o: {x, y, s (scale of the head), sour 0..1 (its face), ring 0..1 (the alarm going: the light flashes, the bell shakes,
// rays), whistle 0..1 (it puts a lifeguard's whistle in its mouth), lick (tongue out 0..1), view 0..1 (zoom toward the sensor)}
function alarmHead(t, o = {}) {
  const c = ctx, s = o.s || 1, x0 = o.x || 960, y0 = o.y || 540;
  c.save(); c.translate(x0, y0); c.scale(s, s);
  // the head in profile (x-ray blue)
  c.beginPath();
  c.moveTo(-210, 260); c.quadraticCurveTo(-300, 40, -240, -170); c.quadraticCurveTo(-170, -330, 20, -330); c.quadraticCurveTo(200, -320, 250, -170);
  c.quadraticCurveTo(270, -90, 262, -20); c.lineTo(310, 40); c.quadraticCurveTo(318, 58, 292, 66); c.lineTo(282, 100); c.quadraticCurveTo(300, 120, 280, 150);
  c.quadraticCurveTo(270, 190, 230, 200); c.quadraticCurveTo(150, 214, 120, 250); c.lineTo(110, 420); c.lineTo(-120, 420); c.lineTo(-130, 290); c.closePath();
  c.fillStyle = 'rgba(40,90,176,0.45)'; c.fill(); c.lineWidth = 6; c.strokeStyle = 'rgba(127,233,255,0.75)'; c.stroke();
  // the eye
  ellipse(c, 196, -40, 22, 18, 'rgba(230,246,255,0.9)'); circle(c, 208, -38, 9, '#0C1A4A');
  // the brain
  c.beginPath(); c.moveTo(-200, -60); c.quadraticCurveTo(-230, -250, -40, -290); c.quadraticCurveTo(150, -310, 210, -150); c.quadraticCurveTo(230, -60, 150, -40);
  c.quadraticCurveTo(60, -20, 0, -10); c.quadraticCurveTo(-80, 10, -150, 20); c.quadraticCurveTo(-210, 20, -200, -60); c.closePath();
  const bg = c.createRadialGradient(0, -170, 30, 0, -150, 260); bg.addColorStop(0, '#FFC8D8'); bg.addColorStop(1, '#E07A9E'); c.fillStyle = bg; c.fill();
  c.lineWidth = 5; c.strokeStyle = '#9A3A62'; c.stroke();
  c.save(); c.clip();
  for (let i = 0; i < 9; i++) { c.beginPath(); const yy = -260 + i * 30; c.moveTo(-220, yy); for (let x = -220; x < 240; x += 30) c.quadraticCurveTo(x + 15, yy + 18 * Math.sin(i + x * 0.05), x + 30, yy); c.lineWidth = 4; c.strokeStyle = 'rgba(160,50,100,0.35)'; c.stroke(); }
  c.restore();
  // the cerebellum and the brainstem going down into the neck
  ellipse(c, -150, 30, 70, 46, '#D8709A');
  c.beginPath(); c.moveTo(-60, 0); c.quadraticCurveTo(-40, 120, -70, 300); c.lineTo(10, 300); c.quadraticCurveTo(10, 120, 30, 0); c.closePath();
  c.fillStyle = '#E890B0'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#9A3A62'; c.stroke();
  // a vessel running past it, with blood (red) and exhaust (violet) beads flowing up
  c.beginPath(); c.moveTo(60, 420); c.quadraticCurveTo(70, 200, 40, 90); c.lineWidth = 26; c.strokeStyle = '#8A1A34'; c.stroke();
  for (let i = 0; i < 9; i++) {
    const u = (i / 9 + t * 0.35) % 1, py = lerp(420, 90, u), px = lerp(60, 40, u) + 8 * Math.sin(u * 3);
    const isEx = hash(i * 2.1) < (o.sour || 0) * 0.9;
    circle(c, px, py, 8, isEx ? EXC : BLOODC);
  }
  c.restore();
  // the sensor (drawn in screen space at its spot so it can be big in a close view)
  const sx = x0 + (-10) * s, sy = y0 + 120 * s, ss = s * (o.sensorS || 1);
  const ring = o.ring || 0, sour = o.sour || 0;
  c.save(); c.translate(sx, sy); c.scale(ss, ss);
  if (ring > 0.01) c.rotate(0.12 * ring * Math.sin(t * 48));
  // the tongue down to the vessel
  const lk = o.lick === undefined ? 1 : o.lick;
  if (lk > 0.01) { c.beginPath(); c.moveTo(30, 30); c.quadraticCurveTo(60, 50 + 10 * Math.sin(t * 5), 70 * lk + 10, 40 + 10 * lk); c.lineWidth = 14; c.strokeStyle = '#FF6A8A'; c.lineCap = 'round'; c.stroke(); }
  circle(c, 0, 0, 60, '#F4F6FA'); circle(c, 0, 0, 48, '#FFFFFF');
  c.lineWidth = 4; c.strokeStyle = '#B8C0D0'; c.beginPath(); c.arc(0, 0, 60, 0, Math.PI * 2); c.stroke();
  for (let i = 0; i < 6; i++) { const a = i * 1.047 + 0.5; line(c, Math.cos(a) * 52, Math.sin(a) * 52, Math.cos(a) * 57, Math.sin(a) * 57, 3, '#C8D0DC'); }
  const fm = ring > 0.5 ? 'shock' : (sour > 0.66 ? 'angry' : (sour > 0.3 ? 'sour' : 'calm'));
  organFace(c, 0, 4, 1.15, fm, t, [0.5, 0.3]);
  // the light on top: off, then flashing red
  const fl = ring > 0.01 ? (Math.sin(t * 22) > 0 ? 1 : 0.25) * ring : 0;
  rrect(c, -16, -78, 32, 20, 8); c.fillStyle = fl > 0.5 ? '#FF3A4A' : '#8A2A34'; c.fill();
  c.restore();
  if (fl > 0) { softDot(gctx, sx, sy - 68 * ss, 140 * ss, '#FF3A4A', 0.8 * fl); softDot(ctx, sx, sy - 68 * ss, 220 * ss, '#FF3A4A', 0.18 * fl); }
  if (ring > 0.01) for (let i = 0; i < 3; i++) {   // ringing arcs
    const ph = (t * 3 + i / 3) % 1;
    c.beginPath(); c.arc(sx, sy, (80 + 80 * ph) * ss, -2.6, -0.5); c.lineWidth = 6 * ss; c.strokeStyle = `rgba(255,90,110,${ring * (1 - ph)})`; c.stroke();
  }
  // the lifeguard's whistle (act 3)
  const wh = o.whistle || 0;
  if (wh > 0.01) {
    c.save(); c.translate(sx + 30 * ss, sy + 22 * ss); c.scale(ss * wh, ss * wh); c.rotate(-0.2);
    rrect(c, -4, -12, 44, 24, 10); c.fillStyle = '#FFD447'; c.fill(); rrect(c, 34, -8, 22, 12, 4); c.fillStyle = '#E8B820'; c.fill();
    c.restore();
  }
  return [sx, sy];
}

// ---------------------------------------------------------------- the dashboard (screen space): OXYGEN tank + EXHAUST alarm
// o: {o2 0..1 (tank level), ex 0..1 (the alarm's needle), blackout (a dashed line on the tank, 0..1 shown), alarmAt 0.72,
// ringT (time the bell started) , dim 0..1 (lights out), x, y, s}
function gauges(t, o = {}) {
  const c = ctx, s = o.s || 1, x0 = o.x || 960, y0 = o.y || 520;
  c.save(); c.translate(x0, y0); c.scale(s, s);
  // ---- the oxygen tank (left)
  const tx = -330, tw = 220, th = 520, ty = -th / 2;
  rrect(c, tx - tw / 2 - 14, ty - 30, tw + 28, th + 60, 40); c.fillStyle = '#1A2440'; c.fill();
  rrect(c, tx - tw / 2, ty, tw, th, 30); c.fillStyle = '#0C1428'; c.fill();
  const lv = clamp(o.o2 === undefined ? 1 : o.o2), sy = ty + th * (1 - lv);
  c.save(); rrect(c, tx - tw / 2, ty, tw, th, 30); c.clip();
  const lg = c.createLinearGradient(0, sy, 0, ty + th); lg.addColorStop(0, '#9FF4FF'); lg.addColorStop(1, '#2A9AD8');
  c.fillStyle = lg; c.beginPath(); c.moveTo(tx - tw, ty + th + 10);
  for (let x = -tw; x <= tw; x += 10) c.lineTo(tx + x, sy + 5 * Math.sin(x * 0.05 + t * 4));
  c.lineTo(tx + tw, ty + th + 10); c.closePath(); c.fill();
  for (let i = 0; i < 12; i++) { const u = (hash(i) + t * 0.3) % 1, bx = tx - tw / 2 + 20 + (tw - 40) * hash(i * 3.3), by = lerp(ty + th, sy, u); if (by > sy) circle(c, bx, by, 4 + 4 * hash(i + 1), 'rgba(255,255,255,0.5)'); }
  c.restore();
  softDot(gctx, tx, sy + 40, 160, O2C, 0.4 * lv);
  // the blackout line
  const bl = o.blackout || 0;
  if (bl > 0.01) {
    const by = ty + th * (1 - 0.5);
    c.save(); c.setLineDash([18, 12]); line(c, tx - tw / 2 - 30, by, tx - tw / 2 - 30 + (tw + 60) * clamp(bl * 1.5), by, 7, '#FF5A6E'); c.restore();
    if (bl > 0.6) { c.font = '900 30px Montserrat'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = '#FF5A6E'; c.globalAlpha = clamp((bl - 0.6) * 3); c.fillText('BLACKOUT', tx + tw / 2 + 40, by); c.globalAlpha = 1; }
  }
  c.font = '400 54px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  c.lineWidth = 10; c.strokeStyle = '#0B0B1A'; c.strokeText('OXYGEN', tx, ty - 74); c.fillStyle = O2C; c.fillText('OXYGEN', tx, ty - 74);
  const pct = `${Math.round(lerp(o.pctLo === undefined ? 0 : o.pctLo, 100, lv))}%`;
  c.font = '400 72px Anton'; c.strokeText(pct, tx, ty + th + 80); c.fillStyle = '#FFFFFF'; c.fillText(pct, tx, ty + th + 80);
  // ---- the exhaust alarm (right): a dial with a needle and a red zone, a bell on top
  const ax = 300, ay = 40, R = 230;
  circle(c, ax, ay, R + 26, '#1A2440'); circle(c, ax, ay, R, '#0C1428');
  const a0 = Math.PI * 0.8, a1 = Math.PI * 2.2, aA = lerp(a0, a1, o.alarmAt || 0.72);
  c.beginPath(); c.arc(ax, ay, R - 30, a0, aA); c.lineWidth = 34; c.strokeStyle = '#3A3A6A'; c.stroke();
  c.beginPath(); c.arc(ax, ay, R - 30, aA, a1); c.lineWidth = 34; c.strokeStyle = '#FF3A4A'; c.stroke();
  for (let i = 0; i <= 10; i++) { const a = lerp(a0, a1, i / 10); line(c, ax + Math.cos(a) * (R - 64), ay + Math.sin(a) * (R - 64), ax + Math.cos(a) * (R - 84), ay + Math.sin(a) * (R - 84), 5, 'rgba(255,255,255,0.5)'); }
  const ex = clamp(o.ex || 0), an = lerp(a0, a1, ex) + 0.03 * Math.sin(t * 30) * ex;
  line(c, ax, ay, ax + Math.cos(an) * (R - 50), ay + Math.sin(an) * (R - 50), 12, '#FFFFFF'); circle(c, ax, ay, 22, '#FFFFFF'); circle(c, ax, ay, 10, '#1A2440');
  c.font = '400 54px Anton'; c.lineWidth = 10; c.strokeStyle = '#0B0B1A'; c.strokeText('EXHAUST', ax, ay + R + 64); c.fillStyle = EXC; c.fillText('EXHAUST', ax, ay + R + 64);
  // the bell
  const ringing = ex >= (o.alarmAt || 0.72) - 0.005 ? 1 : 0;
  c.save(); c.translate(ax, ay - R - 60); if (ringing) c.rotate(0.3 * Math.sin(t * 40));
  c.beginPath(); c.moveTo(-50, 30); c.quadraticCurveTo(-50, -40, 0, -46); c.quadraticCurveTo(50, -40, 50, 30); c.closePath(); c.fillStyle = ringing ? '#FFD447' : '#6A6A8A'; c.fill();
  rrect(c, -60, 26, 120, 14, 6); c.fill(); circle(c, 0, 44, 12, ringing ? '#FFD447' : '#6A6A8A');
  c.restore();
  if (ringing) { softDot(gctx, ax, ay - R - 60, 200, '#FFD447', 0.6); for (let i = 0; i < 3; i++) { const ph = (t * 3 + i / 3) % 1; c.beginPath(); c.arc(ax, ay - R - 60, 70 + 70 * ph, -2.8, -0.35); c.lineWidth = 6; c.strokeStyle = `rgba(255,212,71,${1 - ph})`; c.stroke(); } }
  c.restore();
  // lights out
  if ((o.dim || 0) > 0.001) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = `rgba(0,0,0,${clamp(o.dim)})`; ctx.fillRect(0, 0, W, H); }
}

// ---------------------------------------------------------------- a heart monitor: a heart, a trace and the beats per minute
// (x, y) = the panel's centre (screen); bpmFn(t) gives the rate at time t; t0 = when the trace starts
function heartMon(x, y, s, t, bpmFn, t0, o = {}) {
  const c = ctx, w = 640 * s, h = 280 * s;
  rrect(c, x - w / 2, y - h / 2, w, h, 28 * s); c.fillStyle = 'rgba(6,16,26,0.9)'; c.fill(); c.lineWidth = 4 * s; c.strokeStyle = '#4DFFB4'; c.stroke();
  // grid
  c.save(); rrect(c, x - w / 2, y - h / 2, w, h, 28 * s); c.clip();
  for (let gx = x - w / 2; gx < x + w / 2; gx += 40 * s) line(c, gx, y - h / 2, gx, y + h / 2, 1.5, 'rgba(77,255,180,0.12)');
  for (let gy = y - h / 2; gy < y + h / 2; gy += 40 * s) line(c, x - w / 2, gy, x + w / 2, gy, 1.5, 'rgba(77,255,180,0.12)');
  // the trace: the last 3 seconds, newest on the right
  const span = 3, P = [];
  for (let i = 0; i <= 180; i++) {
    const tt = t - span + span * i / 180; if (tt < t0 - 1) continue;
    // a beat shape at each beat time: integrate phase
    let ph = 0; for (let u = t0 - 1; u < tt; u += 1 / 60) ph += bpmFn(u) / 60 / 60;
    const f = ph % 1, spike = f < 0.06 ? Math.sin(f / 0.06 * Math.PI) * (f < 0.03 ? 1 : -0.4) : (f > 0.25 && f < 0.4 ? 0.18 * Math.sin((f - 0.25) / 0.15 * Math.PI) : 0);
    P.push([x - w / 2 + 30 * s + (w * 0.62) * i / 180, y + 30 * s - spike * 110 * s]);
  }
  if (P.length > 1) { poly(c, P, 5 * s, '#4DFFB4'); const L = P[P.length - 1]; circle(c, L[0], L[1], 8 * s, '#FFFFFF'); softDot(gctx, L[0], L[1], 40 * s, '#4DFFB4', 0.7); }
  c.restore();
  // the heart and the number
  const bpm = bpmFn(t), b = beatVar(t, bpmFn, t0 - 1);
  c.save(); c.translate(x + w * 0.33, y - 40 * s); heartShape(c, 34 * s, b); c.fillStyle = '#FF4A5E'; c.fill(); c.restore();
  softDot(gctx, x + w * 0.33, y - 40 * s, 70 * s, '#FF4A5E', 0.5 * b);
  c.font = `400 ${92 * s}px Anton`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#FFFFFF';
  c.fillText(`${Math.round(bpm)}`, x + w * 0.33, y + 52 * s);
  c.font = `800 ${24 * s}px Montserrat`; c.fillStyle = '#4DFFB4'; c.fillText('BEATS / MIN', x + w * 0.33, y + 106 * s);
}
