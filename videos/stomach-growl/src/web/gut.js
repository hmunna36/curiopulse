// Stomach-growl Short: the gut. (1) an x-ray torso with the stomach, the small-intestine coils and the colon frame,
// and the "housekeeping" squeeze wave travelling along the whole path; (2) the tube in section: muscle walls that
// pinch as the ring passes, with crumbs + bacteria swept ahead of it, or gas bubbles + juice squeezed through the
// pinch (sound rings), or packed food that muffles the rings; (3) the stomach as a tartan bagpipe; (4) a tiny
// vacuum for the button. Everything is drawn in its own local coordinates; the shots place it (scenes.js).
'use strict';

let GUT_PATH = null, GUT_ACC = null, GUT_STOM_END = 0, GUT_COIL = null, TARTAN = null;

// the stomach outline in gut-local coords (origin = belly centre, the patient's left is screen right)
function stomachPath(c, s = 1) {
  c.beginPath();
  c.moveTo(10 * s, -330 * s);                                                   // oesophagus joins (cardia)
  c.bezierCurveTo(0 * s, -400 * s, 150 * s, -440 * s, 200 * s, -350 * s);       // fundus dome
  c.bezierCurveTo(250 * s, -280 * s, 252 * s, -150 * s, 200 * s, -80 * s);      // greater curve down
  c.bezierCurveTo(150 * s, -10 * s, 40 * s, 0 * s, -40 * s, -20 * s);           // the bottom, sweeping left
  c.bezierCurveTo(-80 * s, -30 * s, -100 * s, -45 * s, -112 * s, -60 * s);      // antrum to the pylorus
  c.lineTo(-112 * s, -102 * s);
  c.bezierCurveTo(-70 * s, -92 * s, 0 * s, -82 * s, 50 * s, -122 * s);          // lesser curve back up
  c.bezierCurveTo(92 * s, -156 * s, 92 * s, -252 * s, 62 * s, -300 * s);
  c.bezierCurveTo(48 * s, -322 * s, 26 * s, -330 * s, 10 * s, -330 * s);
  c.closePath();
}
const STOM_C = [70, -215];   // the stomach's centre (local), for framing

function initGut() {
  // centreline: stomach (fundus -> pylorus), duodenum C, then the coils, ending at the colon junction
  const P = [[120, -345], [172, -268], [182, -175], [146, -95], [70, -52], [-20, -48], [-70, -62], [-112, -82],
    [-150, -66], [-172, -26], [-150, 14], [-100, 26], [-60, 22]];
  GUT_STOM_END = 7;
  // serpentine coils: rows across the lower belly
  const rows = [44, 84, 124, 164, 204, 244];
  let dir = 1;
  for (const y of rows) {
    const xs = dir > 0 ? [-30, 50, 120, 158] : [120, 40, -50, -130, -160];
    xs.forEach((x, i) => P.push([x, y + (dir > 0 ? -6 : 6) * Math.sin(i * 1.7)]));
    dir = -dir;
  }
  P.push([-185, 280], [-205, 270]);
  // smooth it (Catmull-Rom resample)
  const out = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    for (let k = 0; k < 8; k++) {
      const u = k / 8, u2 = u * u, u3 = u2 * u;
      out.push([0, 1].map((j) => 0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * u + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * u2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * u3)));
    }
  }
  out.push(P[P.length - 1]);
  GUT_PATH = out;
  GUT_ACC = [0];
  for (let i = 1; i < out.length; i++) GUT_ACC.push(GUT_ACC[i - 1] + Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]));
  GUT_STOM_END = GUT_ACC[GUT_STOM_END * 8] / GUT_ACC[GUT_ACC.length - 1];
  GUT_COIL = out.slice(7 * 8);
  // tartan tile for the bagpipe
  TARTAN = mkCanvas(120, 120);
  const x = TARTAN.getContext('2d');
  x.fillStyle = '#1F5A3A'; x.fillRect(0, 0, 120, 120);
  for (const [o, w, col] of [[0, 40, 'rgba(178,34,52,0.85)'], [60, 14, 'rgba(20,30,70,0.8)'], [96, 6, 'rgba(255,214,90,0.8)']]) {
    x.fillStyle = col; x.fillRect(o, 0, w, 120); x.fillRect(0, o, 120, w);
  }
  x.fillStyle = 'rgba(0,0,0,0.12)'; for (let i = 0; i < 120; i += 4) x.fillRect(i, 0, 1, 120);
}

// point + direction at fraction u (0..1) of the gut path
function gutAt(u) {
  const L = GUT_ACC[GUT_ACC.length - 1], s = clamp(u) * L;
  let i = 1;
  while (i < GUT_ACC.length - 1 && GUT_ACC[i] < s) i++;
  const a = GUT_PATH[i - 1], b = GUT_PATH[i], k = (s - GUT_ACC[i - 1]) / ((GUT_ACC[i] - GUT_ACC[i - 1]) || 1);
  const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
  return { x: lerp(a[0], b[0], k), y: lerp(a[1], b[1], k), nx: -dy / d, ny: dx / d, tx: dx / d, ty: dy / d };
}

// ---------------------------------------------------------------- (1) the x-ray torso
// v = {x, y, s} (sectionCam): local -> world. o: {glow 0..1 (cleaning mode), ring u (squeeze position, <0 = none),
// food 0..1 (food left in the stomach), clean 0..1 (green tint), crumbs (show debris), outline alpha}
function gutXray(v, t, o = {}) {
  const c = ctx;
  c.save(); c.translate(v.x, v.y); c.scale(v.s, v.s);
  const a = o.alpha === undefined ? 1 : o.alpha;
  // torso silhouette
  c.beginPath();
  c.moveTo(-70, -620); c.lineTo(-70, -540); c.quadraticCurveTo(-120, -500, -300, -470);
  c.quadraticCurveTo(-340, -440, -320, -300); c.lineTo(-250, 100); c.quadraticCurveTo(-290, 260, -270, 420);
  c.lineTo(270, 420); c.quadraticCurveTo(290, 260, 250, 100); c.lineTo(320, -300);
  c.quadraticCurveTo(340, -440, 300, -470); c.quadraticCurveTo(120, -500, 70, -540); c.lineTo(70, -620);
  c.closePath();
  c.fillStyle = `rgba(30,70,150,${0.30 * a})`; c.fill();
  c.lineWidth = 6; c.strokeStyle = `rgba(127,233,255,${0.75 * a})`; c.stroke();
  gctx.save(); gctx.setTransform(0.5 * v.s, 0, 0, 0.5 * v.s, 0.5 * v.x, 0.5 * v.y);
  gctx.lineWidth = 14; gctx.strokeStyle = `rgba(80,180,255,${0.35 * a})`;
  gctx.beginPath(); gctx.moveTo(-300, -470); gctx.quadraticCurveTo(-340, -440, -320, -300); gctx.lineTo(-250, 100); gctx.quadraticCurveTo(-290, 260, -270, 420);
  gctx.moveTo(300, -470); gctx.quadraticCurveTo(340, -440, 320, -300); gctx.lineTo(250, 100); gctx.quadraticCurveTo(290, 260, 270, 420); gctx.stroke();
  gctx.restore();
  // ribs + spine (faint)
  for (let i = 0; i < 6; i++) {
    const y = -440 + i * 52;
    for (const sd of [-1, 1]) {
      c.beginPath(); c.moveTo(sd * 20, y); c.quadraticCurveTo(sd * 250, y - 30 + i * 6, sd * (270 - i * 6), y + 70);
      c.lineWidth = 9; c.strokeStyle = `rgba(200,230,255,${0.16 * a})`; c.stroke();
    }
  }
  for (let y = -600; y < 380; y += 34) { rrect(c, -16, y, 32, 26, 8); c.fillStyle = `rgba(200,230,255,${0.10 * a})`; c.fill(); }
  // colon frame (behind the coils)
  c.beginPath(); c.moveTo(-205, 250); c.lineTo(-215, -40); c.quadraticCurveTo(-200, -110, -120, -110);
  c.lineTo(150, -20); c.quadraticCurveTo(225, -10, 220, 60); c.lineTo(215, 300); c.quadraticCurveTo(150, 360, 30, 330);
  c.lineWidth = 46; c.strokeStyle = `rgba(150,96,70,${0.75 * a})`; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke();
  c.setLineDash([4, 26]); c.lineWidth = 46; c.strokeStyle = `rgba(90,50,36,${0.5 * a})`; c.stroke(); c.setLineDash([]);
  // the small intestine (the tube), drawn as a thick shaded path
  const cl = o.clean || 0;
  const tubeCol = mixHex('#E58A8E', '#8FE8B8', 0.18 * cl);
  smoothPathL(c, GUT_COIL, 30, '#8E3F4E', a);
  smoothPathL(c, GUT_COIL, 22, tubeCol, a);
  smoothPathL(c, GUT_COIL, 6, 'rgba(255,220,225,0.5)', a);
  // the stomach
  stomachPath(c);
  const sg = c.createRadialGradient(130, -250, 10, 80, -160, 260);
  sg.addColorStop(0, mixHex('#F59AA6', '#B8FFD6', 0.35 * cl)); sg.addColorStop(1, mixHex('#C24E62', '#3FAF7E', 0.3 * cl));
  c.fillStyle = sg; c.globalAlpha = a; c.fill();
  c.lineWidth = 7; c.strokeStyle = '#7A2A3C'; c.stroke();
  // rugae (stomach folds)
  c.save(); stomachPath(c); c.clip();
  for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(200 - i * 22, -330 + i * 40); c.quadraticCurveTo(150 - i * 20, -200 + i * 20, 60 - i * 30, -70 + i * 4); c.lineWidth = 5; c.strokeStyle = 'rgba(120,30,50,0.32)'; c.stroke(); }
  // food left in the stomach (dissolving)
  const fd = o.food || 0;
  if (fd > 0.01) {
    const rng = mulberry32(5);
    for (let i = 0; i < 22; i++) {
      const fx = 110 + rng() * 110, fy = -300 + rng() * 230, r = (9 + rng() * 15) * fd;
      ellipse(c, fx, fy, r, r * 0.8, ['#E8B04A', '#9ACD4A', '#D8763A', '#F4E3B0'][i % 4], rng() * 3);
    }
  }
  c.restore();
  c.globalAlpha = 1;
  // oesophagus
  line(c, 12, -620, 12, -334, 26, '#B65A6A'); line(c, 12, -620, 12, -334, 8, 'rgba(255,210,215,0.4)');
  // cleaning-mode glow
  const gw = o.glow || 0;
  if (gw > 0.01) {
    gctx.save(); gctx.setTransform(0.5 * v.s, 0, 0, 0.5 * v.s, 0.5 * v.x, 0.5 * v.y);
    gctx.globalAlpha = gw;
    stomachPath(gctx); gctx.lineWidth = 22; gctx.strokeStyle = 'rgba(120,255,190,0.4)'; gctx.stroke();
    smoothPathL(gctx, GUT_COIL, 30, 'rgba(120,255,190,0.22)', 1);
    gctx.restore();
  }
  // debris along the coils (crumbs + bacteria), pushed ahead of the ring
  if (o.debris) {
    for (let i = 0; i < 16; i++) {
      let u = GUT_STOM_END + 0.04 + i * 0.055;
      if (o.ring !== undefined && o.ring > 0 && u < o.ring + 0.03) u = o.ring + 0.03 + 0.004 * i; // swept along
      if (u > 0.995) continue;
      const p = gutAt(u);
      if (i % 3 === 0) bacterium(c, p.x, p.y, 7, t, i, 1);
      else ellipse(c, p.x, p.y, 6, 4.5, i % 2 ? '#C98A3A' : '#E8C46A', i);
    }
  }
  // the squeeze wave
  if (o.ring !== undefined && o.ring >= 0 && o.ring <= 1) squeezeBand(c, o.ring, t, a, v);
  c.restore();
}

function smoothPathL(c, P, w, col, a = 1) {
  c.save(); c.globalAlpha = a;
  c.beginPath(); c.moveTo(P[0][0], P[0][1]);
  for (let i = 1; i < P.length; i++) c.lineTo(P[i][0], P[i][1]);
  c.lineWidth = w; c.strokeStyle = col; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke();
  c.restore();
}

// the squeeze: a bright band across the gut at path fraction u (wider in the stomach)
function squeezeBand(c, u, t, a, v) {
  const p = gutAt(u), inStom = u < GUT_STOM_END;
  const half = inStom ? 95 * (1 - 0.45 * u / GUT_STOM_END) : 22;
  const x0 = p.x - p.nx * half, y0 = p.y - p.ny * half, x1 = p.x + p.nx * half, y1 = p.y + p.ny * half;
  line(c, x0, y0, x1, y1, inStom ? 20 : 14, '#FFD447');
  line(c, x0, y0, x1, y1, inStom ? 6 : 5, '#FFFFFF');
  // squeeze chevrons on both sides, pointing in
  if (inStom) for (const sd of [-1, 1]) {
    const ex = p.x + sd * p.nx * (half + 34), ey = p.y + sd * p.ny * (half + 34), ix = -sd * p.nx, iy = -sd * p.ny, tx = p.tx, ty = p.ty;
    const pul = 6 * Math.sin(t * 14);
    c.beginPath(); c.moveTo(ex + tx * 20 - ix * pul, ey + ty * 20 - iy * pul); c.lineTo(ex + ix * 22 - ix * pul, ey + iy * 22 - iy * pul); c.lineTo(ex - tx * 20 - ix * pul, ey - ty * 20 - iy * pul);
    c.lineWidth = 9; c.strokeStyle = rgba('#FFD447', a); c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke();
  }
  // a trail behind it (the wave just passed)
  for (let k = 1; k < 6; k++) {
    const q = gutAt(u - k * 0.012);
    const hh = (q && u - k * 0.012 < GUT_STOM_END) ? 95 * (1 - 0.45 * (u - k * 0.012) / GUT_STOM_END) : 22;
    line(c, q.x - q.nx * hh, q.y - q.ny * hh, q.x + q.nx * hh, q.y + q.ny * hh, 10, rgba('#FFD447', 0.35 * (1 - k / 6) * a));
  }
  gctx.save(); gctx.setTransform(0.5 * v.s, 0, 0, 0.5 * v.s, 0.5 * v.x, 0.5 * v.y);
  softDot(gctx, p.x, p.y, inStom ? 110 : 70, '#FFD447', 0.55 * a);
  gctx.restore();
}

// ---------------------------------------------------------------- bacteria + crumbs
function bacterium(c, x, y, r, t, seed, a = 1, col = '#4DFFB4') {
  c.save(); c.translate(x, y); c.rotate(0.4 * Math.sin(t * 3 + seed));
  // flagella
  c.lineWidth = r * 0.22; c.strokeStyle = rgba(mixHex(col, '#0A3A2A', 0.3), a); c.lineCap = 'round';
  c.beginPath(); c.moveTo(-r * 1.3, 0);
  for (let i = 1; i <= 8; i++) c.lineTo(-r * 1.3 - i * r * 0.32, Math.sin(t * 14 + i + seed) * r * 0.35);
  c.stroke();
  // body (a capsule)
  rrect(c, -r * 1.4, -r * 0.8, r * 2.8, r * 1.6, r * 0.8); c.fillStyle = rgba(col, 0.92 * a); c.fill();
  c.lineWidth = r * 0.16; c.strokeStyle = rgba(mixHex(col, '#0A3A2A', 0.5), a); c.stroke();
  // eyes (they look worried: they're being evicted)
  for (const sd of [-1, 1]) { circle(c, r * 0.4 + sd * r * 0.36, -r * 0.12, r * 0.3, rgba('#FFFFFF', a)); circle(c, r * 0.48 + sd * r * 0.36, -r * 0.1, r * 0.15, rgba('#10202A', a)); }
  c.beginPath(); c.arc(r * 0.45, r * 0.4, r * 0.22, Math.PI * 1.1, Math.PI * 1.9); c.lineWidth = r * 0.12; c.strokeStyle = rgba('#10202A', a); c.stroke();
  c.restore();
}
function crumb(c, x, y, r, rot, col) {
  c.save(); c.translate(x, y); c.rotate(rot);
  c.beginPath();
  for (let i = 0; i < 7; i++) { const an = i / 7 * Math.PI * 2, rr = r * (0.75 + 0.35 * hash(i * 5 + r)); i ? c.lineTo(Math.cos(an) * rr, Math.sin(an) * rr) : c.moveTo(Math.cos(an) * rr, Math.sin(an) * rr); }
  c.closePath(); c.fillStyle = col; c.fill(); c.lineWidth = 3; c.strokeStyle = 'rgba(60,30,10,0.6)'; c.stroke();
  ellipse(c, -r * 0.3, -r * 0.3, r * 0.3, r * 0.18, 'rgba(255,255,255,0.35)', -0.5);
  c.restore();
}

// ---------------------------------------------------------------- (2) the tube in section
// world space under the current camera: the tube runs along y = cy, x from x0 to x1, inner radius R.
// o: {ring (world x of the squeeze, or null), pinch 0..1, contents: 'sweep' | 'empty' | 'full', t0 (shot time base), push}
function tubeRadius(x, o) {
  if (o.ring === null || o.ring === undefined) return o.R;
  const d = (x - o.ring) / (o.width || 120);
  return o.R * (1 - (o.pinch === undefined ? 0.78 : o.pinch) * Math.exp(-d * d));
}
function tubeSection(cy, x0, x1, t, o) {
  const c = ctx, R = o.R, wall = o.wall || 70;
  // the lumen (inside): dark, warm
  const lum = c.createLinearGradient(0, cy - R, 0, cy + R);
  lum.addColorStop(0, '#3A0E18'); lum.addColorStop(0.5, '#5A1826'); lum.addColorStop(1, '#2A0810');
  c.beginPath();
  for (let x = x0; x <= x1; x += 8) c.lineTo(x, cy - tubeRadius(x, o));
  for (let x = x1; x >= x0; x -= 8) c.lineTo(x, cy + tubeRadius(x, o));
  c.closePath(); c.fillStyle = lum; c.fill();
  // walls (top + bottom): mucosa with villi, then the muscle layer with striations
  for (const sd of [-1, 1]) {
    c.beginPath();
    for (let x = x0; x <= x1; x += 8) c.lineTo(x, cy + sd * tubeRadius(x, o));
    for (let x = x1; x >= x0; x -= 8) c.lineTo(x, cy + sd * (tubeRadius(x, o) + wall));
    c.closePath();
    const g = c.createLinearGradient(0, cy + sd * R * 0.4, 0, cy + sd * (R + wall));
    g.addColorStop(0, '#F08A98'); g.addColorStop(0.5, '#C94A62'); g.addColorStop(1, '#7A1E34');
    c.fillStyle = g; c.fill();
    // muscle striations (rings across the wall)
    c.save(); c.clip();
    for (let x = Math.floor(x0 / 26) * 26; x < x1; x += 26) {
      const r0 = tubeRadius(x, o);
      line(c, x, cy + sd * (r0 + wall * 0.35), x + 6, cy + sd * (r0 + wall), 4, 'rgba(90,10,30,0.35)');
    }
    c.restore();
    // villi: little fingers along the inner surface
    for (let x = Math.floor(x0 / 22) * 22; x < x1; x += 22) {
      const r0 = tubeRadius(x, o), wob = 3 * Math.sin(t * 4 + x * 0.05);
      ellipse(c, x + wob, cy + sd * (r0 - 8), 7, 13, '#FFB2BC');
    }
    line(c, x0, cy + sd * (R + wall), x1, cy + sd * (R + wall), 5, '#4A0E1E');
  }
  // the squeeze: the contracting muscle glows
  if (o.ring !== null && o.ring !== undefined) {
    const rx = o.ring, r0 = tubeRadius(rx, o);
    for (const sd of [-1, 1]) {
      ellipse(c, rx, cy + sd * (r0 + wall * 0.5), 46, wall * 0.62, rgba('#FFD447', 0.55));
      softDot(gctx, rx, cy + sd * (r0 + wall * 0.5), 120, '#FFD447', 0.7 * (o.glowA === undefined ? 1 : o.glowA));
    }
    // motion streaks behind the ring
    for (let k = 1; k < 4; k++) for (const sd of [-1, 1]) line(c, rx - 70 - k * 40, cy + sd * (R + wall + 20), rx - 40 - k * 40, cy + sd * (R + wall + 20), 6, rgba('#FFD447', 0.5 - k * 0.12));
  }
}
// the juice: a liquid pool along the bottom of the tube, piling up ahead of the ring
function tubeJuice(cy, x0, x1, t, o, level = 0.35) {
  const c = ctx;
  c.save();
  c.beginPath();
  for (let x = x0; x <= x1; x += 8) c.lineTo(x, cy - tubeRadius(x, o));
  for (let x = x1; x >= x0; x -= 8) c.lineTo(x, cy + tubeRadius(x, o));
  c.closePath(); c.clip();
  c.beginPath();
  for (let x = x0; x <= x1; x += 8) {
    let lv = o.R * (1 - 2 * level);
    if (o.ring !== null && o.ring !== undefined) { const d = (x - o.ring - 120) / 140; lv -= 50 * Math.exp(-d * d); }   // piled up ahead of the pinch
    c.lineTo(x, cy + lv + 6 * Math.sin(t * 5 + x * 0.03));
  }
  c.lineTo(x1, cy + o.R + 20); c.lineTo(x0, cy + o.R + 20); c.closePath();
  const g = c.createLinearGradient(0, cy, 0, cy + o.R);
  g.addColorStop(0, 'rgba(214,236,90,0.75)'); g.addColorStop(1, 'rgba(150,190,40,0.85)');
  c.fillStyle = g; c.fill();
  c.restore();
}
function bubble(c, x, y, r, a = 1, sx = 1, sy = 1) {
  c.save(); c.translate(x, y); c.scale(sx, sy);
  const g = c.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r);
  g.addColorStop(0, `rgba(230,250,255,${0.55 * a})`); g.addColorStop(0.7, `rgba(150,220,255,${0.18 * a})`); g.addColorStop(1, `rgba(190,240,255,${0.6 * a})`);
  c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fillStyle = g; c.fill();
  c.lineWidth = 3; c.strokeStyle = `rgba(220,250,255,${0.8 * a})`; c.stroke();
  ellipse(c, -r * 0.35, -r * 0.4, r * 0.25, r * 0.14, `rgba(255,255,255,${0.9 * a})`, -0.6);
  c.restore();
}

// ---------------------------------------------------------------- (3) the bagpipe stomach
// screen space: the stomach at (x, y) = its centre, scale s; sq 0..1 = squeeze; tart 0..1 = tartan over the pink; k = pop
function bagpipe(x, y, s, sq, t, k = 1, tart = 1) {
  const c = ctx;
  if (k <= 0) return [];
  const sc = s * E.outBack(clamp(k), 1.6);
  const P = (lx, ly) => [x + (lx - STOM_C[0]) * sc, y + (ly - STOM_C[1]) * sc * (1 - 0.06 * sq)];
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  // drones out of the dome, up and to the left, with ivory mounts; a red cord between them
  const base = [[120, -420], [160, -410], [196, -380]], ang = [-0.62, -0.38, -0.14], len = [300, 360, 280];
  const tips = [];
  base.forEach(([lx, ly], i) => {
    const [bx, by] = P(lx, ly), a = ang[i], L = len[i] * sc / 1.3, ww = 26 * sc / 1.3;
    const ex = bx + Math.sin(a) * L, ey = by - Math.cos(a) * L;
    tips.push([ex, ey]);
    c.save(); c.translate(bx, by); c.rotate(a);
    rrect(c, -ww / 2, -L, ww, L, ww / 2.5); c.fillStyle = '#2A1A10'; c.fill();
    for (const f of [0.18, 0.55, 0.9]) { rrect(c, -ww * 0.75, -L * f - ww * 0.4, ww * 1.5, ww * 0.8, ww * 0.25); c.fillStyle = '#EDE3C8'; c.fill(); }
    rrect(c, -ww, -L - ww * 1.3, ww * 2, ww * 1.6, ww * 0.5); c.fillStyle = '#EDE3C8'; c.fill();
    c.restore();
  });
  c.beginPath(); c.moveTo(tips[0][0] + 20 * sc, tips[0][1] + 120 * sc); c.quadraticCurveTo(tips[1][0], tips[1][1] + 200 * sc, tips[2][0] - 10 * sc, tips[2][1] + 110 * sc);
  c.lineWidth = 9 * sc; c.strokeStyle = '#C0392B'; c.stroke();
  // the blowpipe (out of the oesophagus) and the chanter (out of the pylorus)
  const [ox, oy] = P(10, -334), [px, py] = P(-112, -80);
  line(c, ox, oy, ox - 120 * sc, oy - 230 * sc, 20 * sc, '#2A1A10'); rrect(c, ox - 140 * sc, oy - 262 * sc, 40 * sc, 36 * sc, 10 * sc); c.fillStyle = '#EDE3C8'; c.fill();
  c.save(); c.translate(px, py); c.rotate(0.3);
  rrect(c, -14 * sc, 0, 28 * sc, 270 * sc, 10 * sc); c.fillStyle = '#2A1A10'; c.fill();
  for (let i = 0; i < 6; i++) circle(c, 0, (50 + i * 34) * sc, 6 * sc, '#EDE3C8');
  rrect(c, -22 * sc, 250 * sc, 44 * sc, 34 * sc, 10 * sc); c.fillStyle = '#EDE3C8'; c.fill();
  c.restore();
  // the bag = the stomach: pink, then tartan wipes over it
  c.save(); c.translate(x - STOM_C[0] * sc, y - STOM_C[1] * sc * (1 - 0.06 * sq)); c.scale(sc, sc * (1 - 0.06 * sq));
  stomachPath(c);
  const sg = c.createRadialGradient(130, -280, 10, 80, -180, 300); sg.addColorStop(0, '#F59AA6'); sg.addColorStop(1, '#C24E62');
  c.fillStyle = sg; c.fill();
  c.save(); stomachPath(c); c.clip();
  c.globalAlpha = clamp(tart);
  c.fillStyle = c.createPattern(TARTAN, 'repeat'); c.fillRect(-300, -500, 700, 600);
  c.globalAlpha = 1;
  const sh = c.createRadialGradient(150, -300, 20, 80, -180, 300); sh.addColorStop(0, 'rgba(255,255,255,0.22)'); sh.addColorStop(1, 'rgba(0,0,0,0.42)');
  c.fillStyle = sh; c.fillRect(-300, -500, 700, 600);
  c.restore();
  stomachPath(c); c.lineWidth = 8; c.strokeStyle = '#140C08'; c.stroke();
  c.restore();
  // the tam o' shanter on the dome
  const [hx, hy] = P(140, -428);
  c.save(); c.translate(hx, hy); c.rotate(0.18); c.scale(sc / 1.3, sc / 1.3);
  ellipse(c, 0, 0, 110, 34, '#24305E'); ellipse(c, 0, -8, 96, 26, '#3A4A8A');
  rrect(c, -84, 6, 168, 18, 7); c.fillStyle = '#C0392B'; c.fill();
  circle(c, 0, -36, 24, '#E0473A'); circle(c, -6, -42, 8, '#FF8A7A');
  c.restore();
  c.restore();
  return tips;
}
// music notes drifting out of the drones (screen space)
function notes(x, y, t, t0, a = 1, s = 1, col = '#FFD447') {
  if (t < t0) return;
  const d = t - t0;
  for (let i = 0; i < 5; i++) {
    const p = ((d * 0.9 + i * 0.21) % 1);
    if (d < i * 0.12) continue;
    const px = x - 80 * s * i * 0.3 - p * 160 * s + 20 * Math.sin(p * 9 + i), py = y - p * 260 * s;
    const al = Math.sin(Math.PI * p) * a;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(px, py); ctx.rotate(-0.2 + 0.2 * Math.sin(p * 6));
    ctx.font = `900 ${Math.round(70 * s)}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 8 * s; ctx.strokeStyle = `rgba(20,10,10,${al})`; ctx.strokeText(i % 2 ? '♪' : '♫', 0, 0);
    ctx.fillStyle = rgba(col, al); ctx.fillText(i % 2 ? '♪' : '♫', 0, 0);
    ctx.restore();
  }
}

// ---------------------------------------------------------------- (4) the vacuum (button)
// world/screen under the current transform: an upright vacuum at (x, y) facing right, scale s; sucking k 0..1
function vacuum(c, x, y, s, t, k = 1) {
  c.save(); c.translate(x, y); c.scale(s, s); c.rotate(0.05 * Math.sin(t * 18));
  // suction lines into the nozzle
  for (let i = 0; i < 4; i++) {
    const p = ((t * 2.5 + i * 0.25) % 1);
    line(c, 70 + 60 * (1 - p), -6 + (i - 1.5) * 10 * (1 - p), 70 + 60 * (1 - p) + 20, -6 + (i - 1.5) * 10 * (1 - p), 4, `rgba(255,255,255,${0.7 * k * p})`);
  }
  rrect(c, -50, -10, 120, 26, 10); c.fillStyle = '#2A2A33'; c.fill();                 // nozzle head
  rrect(c, -40, -78, 64, 76, 18); c.fillStyle = '#E8453C'; c.fill();                   // body
  rrect(c, -30, -66, 22, 50, 8); c.fillStyle = 'rgba(255,255,255,0.35)'; c.fill();
  line(c, -8, -78, -30, -170, 9, '#3A3A44'); rrect(c, -48, -186, 36, 18, 8); c.fillStyle = '#2A2A33'; c.fill();   // handle
  circle(c, -34, 20, 10, '#15151C'); circle(c, 50, 20, 10, '#15151C');
  c.restore();
}
