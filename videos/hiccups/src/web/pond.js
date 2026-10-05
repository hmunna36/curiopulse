// Hiccups Short: the pond. Underwater at dusk (light shafts from the surface, reeds, silt, bubbles), a tadpole in profile
// (olive, speckled, big eyes, feathery pink gills, a tail that waves), a school of small ones, and the tadpole in
// section: mouth, mouth cavity with a floor that pumps, the gill channel out past the gills, and the tube to its lung
// sac, guarded by the very same pair of doors as the hero's throat (bxDoorPair in chest.js). Nothing here is timed.
'use strict';

const PD_GREEN = ['#9CBF5C', '#6B8E3A', '#3F5A22'];
let PD_REEDS = null;

function initPond() {
  const rng = mulberry32(73);
  PD_REEDS = [...Array(13)].map((_, i) => ({ x: -60 + i * 98 + rng() * 60, h: 420 + rng() * 620, w: 14 + rng() * 22, ph: rng() * 6, z: 0.35 + rng() * 0.65 }));
}

// the water. o: {sink (px the camera has sunk: the surface light slides up), soda 0..1 (still orange: we came in through his glass),
//   dx (sideways drift), dim 0..1}
function pdBack(t, o = {}) {
  const c = ctx, sink = o.sink || 0, dx = o.dx || 0;
  screenSpace();
  const g = c.createLinearGradient(0, -sink * 0.5, 0, H);
  g.addColorStop(0, '#49B394'); g.addColorStop(0.3, '#1B7A66'); g.addColorStop(0.7, '#0B4A47'); g.addColorStop(1, '#052A2C');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  // light shafts
  c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 5; i++) {
    const x0 = 80 + i * 240 + 40 * Math.sin(t * 0.3 + i * 2) - dx * 0.3, wv = 60 + 40 * Math.sin(i * 1.7), a = 0.10 + 0.04 * Math.sin(t * 0.9 + i * 3);
    const sg = c.createLinearGradient(0, -sink * 0.5, 0, 1500); sg.addColorStop(0, `rgba(200,255,220,${a})`); sg.addColorStop(1, 'rgba(200,255,220,0)');
    c.fillStyle = sg; c.beginPath(); c.moveTo(x0 - wv, -sink * 0.5 - 40); c.lineTo(x0 + wv, -sink * 0.5 - 40); c.lineTo(x0 + wv * 2.4 - 260, 1500); c.lineTo(x0 - wv * 2.4 - 260, 1500); c.closePath(); c.fill();
  }
  c.restore();
  softDot(gctx, 540 - dx * 0.3, -sink * 0.5 - 60, 700, '#9CFFD0', 0.22);
  // reeds, far to near
  for (const r of PD_REEDS) {
    const bx = r.x - dx * r.z, top = H + 60 - r.h * (0.6 + 0.4 * r.z), sw = 44 * r.z * Math.sin(t * 0.8 + r.ph);
    c.beginPath(); c.moveTo(bx - r.w / 2, H + 40); c.quadraticCurveTo(bx - r.w / 2 + sw * 0.4, (H + top) / 2, bx + sw, top);
    c.quadraticCurveTo(bx + r.w / 2 + sw * 0.4, (H + top) / 2, bx + r.w / 2, H + 40); c.closePath();
    c.fillStyle = `rgba(${Math.round(8 + 22 * r.z)},${Math.round(46 + 50 * r.z)},${Math.round(40 + 26 * r.z)},${0.5 + 0.4 * r.z})`; c.fill();
  }
  // silt
  const fg = c.createLinearGradient(0, H - 260, 0, H); fg.addColorStop(0, 'rgba(4,26,26,0)'); fg.addColorStop(1, 'rgba(4,22,22,0.92)');
  c.fillStyle = fg; c.fillRect(0, H - 260, W, 260);
  // drifting specks and rising bubbles
  for (let i = 0; i < 46; i++) {
    const z = 0.3 + 0.7 * hash(i * 2.3), x = (((hash(i * 5.1) * W + t * 10 * z - dx * z) % W) + W) % W, y = ((hash(i * 9.7) * H + 30 * Math.sin(t * 0.5 + i) - sink * z * 0.6) % H + H) % H;
    softDot(c, x, y, 3 + 6 * z, '#D8FFE8', 0.16 * z);
  }
  for (let i = 0; i < 14; i++) {
    const sp = 0.10 + 0.14 * hash(i + 3), u = (hash(i * 3.3) + t * sp) % 1, x = 60 + hash(i * 7.9) * 960 + 14 * Math.sin(t * 2 + i) - dx * 0.5, y = H + 40 - u * (H + 200), r = 5 + 11 * hash(i + 5);
    c.beginPath(); c.arc(x, y, r, 0, 7); c.fillStyle = 'rgba(210,255,240,0.10)'; c.fill(); c.lineWidth = 2.5; c.strokeStyle = 'rgba(220,255,245,0.5)'; c.stroke();
    circle(c, x - r * 0.35, y - r * 0.35, r * 0.22, 'rgba(255,255,255,0.7)');
  }
  const soda = o.soda || 0;
  if (soda > 0.01) {
    const sg2 = c.createLinearGradient(0, 0, 0, H); sg2.addColorStop(0, rgba('#FFB23E', soda)); sg2.addColorStop(1, rgba('#E0620C', soda));
    c.fillStyle = sg2; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 40; i++) { const u = (hash(i * 3.3) + t * (0.5 + hash(i))) % 1; circle(c, hash(i * 7.9) * W, H - u * H, 6 + 16 * hash(i + 5), `rgba(255,246,214,${0.7 * soda})`); }
  }
  if ((o.dim || 0) > 0.01) { c.fillStyle = `rgba(2,16,22,${o.dim})`; c.fillRect(0, 0, W, H); }
}

// feathery gills at (x, y): n fronds fanning toward angle a0 (canvas radians)
function pdGills(c, x, y, s, t, a0, flare = 0, n = 3) {
  for (let i = 0; i < n; i++) {
    const a = a0 + (i - (n - 1) / 2) * (0.42 + 0.2 * flare) + 0.1 * Math.sin(t * 6 + i * 1.7), L = (58 + 10 * (i % 2)) * s * (1 + 0.25 * flare);
    const ex = x + Math.cos(a) * L, ey = y + Math.sin(a) * L, mx = x + Math.cos(a - 0.25) * L * 0.55, my = y + Math.sin(a - 0.25) * L * 0.55;
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(mx, my, ex, ey); c.lineCap = 'round';
    c.lineWidth = 15 * s; c.strokeStyle = '#B83A62'; c.stroke(); c.lineWidth = 10 * s; c.strokeStyle = '#F0789A'; c.stroke(); c.lineWidth = 4 * s; c.strokeStyle = '#FFC2D2'; c.stroke();
    for (let j = 1; j <= 3; j++) {            // the feathering
      const u = j / 4, px = lerp(x, ex, u), py = lerp(y, ey, u);
      for (const sd of [-1, 1]) line(c, px, py, px + Math.cos(a + sd * 1.1) * 14 * s, py + Math.sin(a + sd * 1.1) * 14 * s, 4 * s, '#F0789A');
    }
  }
}

// A tadpole in profile, facing right (dir = -1 faces left). (x, y) = its body's centre, s = scale (the body is 300 wide at s = 1).
// o: {dir, wag (tail amplitude 0..1), ph (tail phase), mouth 0..1, look: [x, y], blink 0..1, flare, smile 0..1, tilt}
function pdTadpole(c, x, y, s, t, o = {}) {
  const dir = o.dir || 1, wag = o.wag === undefined ? 1 : o.wag, ph = (o.ph || 0) + t * 9;
  c.save(); c.translate(x, y); c.rotate((o.tilt || 0) * dir); c.scale(dir * s, s);
  // the tail: a tapering spine with a fin above and below
  const N = 16, sp = [], up = [], lo = [], fu = [], fl = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N, px = -118 - 372 * u, py = 44 * wag * Math.pow(u, 1.25) * Math.sin(ph - u * 3.6), w = 42 * Math.pow(1 - u, 1.1) + 3, fw = 88 * Math.sin(Math.PI * Math.pow(u, 0.6)) * (1 - 0.35 * u);
    sp.push([px, py]); up.push([px, py - w]); lo.push([px, py + w]); fu.push([px, py - w - fw * 0.55]); fl.push([px, py + w + fw * 0.45]);
  }
  c.beginPath(); fu.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); for (let i = N; i >= 0; i--) c.lineTo(fl[i][0], fl[i][1]); c.closePath();
  c.fillStyle = 'rgba(150,200,110,0.42)'; c.fill(); c.lineWidth = 3; c.strokeStyle = 'rgba(200,240,160,0.4)'; c.stroke();
  c.beginPath(); up.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); for (let i = N; i >= 0; i--) c.lineTo(lo[i][0], lo[i][1]); c.closePath();
  const tg = c.createLinearGradient(-118, 0, -490, 0); tg.addColorStop(0, PD_GREEN[1]); tg.addColorStop(1, PD_GREEN[2]);
  c.fillStyle = tg; c.fill();
  // the body
  c.beginPath(); c.ellipse(0, 0, 152, 108, 0, 0, Math.PI * 2);
  const bg = c.createRadialGradient(34, -46, 12, 0, 0, 170); bg.addColorStop(0, PD_GREEN[0]); bg.addColorStop(0.55, PD_GREEN[1]); bg.addColorStop(1, PD_GREEN[2]);
  c.fillStyle = bg; c.fill();
  c.save(); c.clip();
  ellipse(c, 10, 96, 132, 62, 'rgba(226,236,180,0.85)');
  for (let i = 0; i < 12; i++) circle(c, -120 + hash(i * 3 + 2) * 200, -92 + hash(i * 5 + 1) * 86, 4 + 6 * hash(i + 9), 'rgba(50,78,28,0.4)');
  // the coiled gut showing through the belly
  c.beginPath(); for (let a = 0; a < 15; a += 0.3) { const r = 5 + a * 2.5, px = -18 + Math.cos(a) * r, py = 64 + Math.sin(a) * r * 0.62; a ? c.lineTo(px, py) : c.moveTo(px, py); }
  c.lineWidth = 4; c.strokeStyle = 'rgba(120,100,50,0.35)'; c.stroke();
  c.restore();
  // gills at the back of the head, fanning back over the tail
  pdGills(c, -112, 14, 1.05, t, Math.PI + 0.12, o.flare || 0);
  // the eye
  const lk = o.look || [0.4, 0], bl = o.blink || 0;
  if (bl > 0.9) { c.beginPath(); c.moveTo(56, -30); c.quadraticCurveTo(84, -14, 112, -30); c.lineWidth = 6; c.lineCap = 'round'; c.strokeStyle = '#263A12'; c.stroke(); }
  else { ellipse(c, 84, -32, 31, 34, '#FFFFFF'); circle(c, 84 + lk[0] * 11, -32 + lk[1] * 11, 15, '#15132A'); circle(c, 79 + lk[0] * 11, -38 + lk[1] * 11, 5, '#FFFFFF'); }
  ellipse(c, 60, 22, 18, 10, 'rgba(255,110,130,0.3)');
  circle(c, 136, -6, 3, '#263A12');
  // the mouth
  const mo = o.mouth || 0, sm = o.smile || 0;
  if (mo > 0.06) ellipse(c, 146, 22, 5 + 10 * mo, 5 + 15 * mo, '#2A1420');
  else { c.beginPath(); c.moveTo(126, 24); c.quadraticCurveTo(140, 26 + 12 * sm, 151, 16 - 4 * sm); c.lineWidth = 5; c.lineCap = 'round'; c.strokeStyle = '#263A12'; c.stroke(); }
  c.restore();
}

// ---------------------------------------------------------------- the tadpole in section, facing left
// local coords: mouth at x = -306, body centre near (-60, 0), tail off to +x. v = {x, y, s}.
const PD_IN = [[-520, 34], [-400, 30], [-312, 24], [-220, 22], [-120, 26]];
const PD_OUT = [[-120, 26], [-70, 70], [-30, 126], [10, 180], [60, 232], [128, 268]];
function pdAlong(P, u) {
  const acc = polyLen(P), p = polyAt(P, acc, clamp(u) * acc[acc.length - 1]);
  return p;
}
// o: {mouth 0..1 (open), floor 0..1 (the mouth's floor is down: the cavity is full), flow (phase of the water running through), inK 0..1 and
//   outK 0..1 (how much water is drawn coming in / going out over the gills), door 0..1 (the doors: 1 = shut), knock 0..1 (water bumping on them),
//   doorHit, look: [x, y], blink, hic (-1..1 jolt), lungAir 0..1}
function pdTadCut(v, t, o = {}) {
  const c = ctx, hic = o.hic || 0;
  const G = (fn) => { gctx.save(); gctx.setTransform(0.5 * v.s, 0, 0, 0.5 * v.s, 0.5 * v.x, 0.5 * v.y); fn(gctx); gctx.restore(); };
  c.save(); c.translate(v.x, v.y - 14 * hic * v.s); c.scale(v.s, v.s);
  // the tail
  const N = 16, up = [], lo = [], fu = [], fl = [], ph = t * 5;
  for (let i = 0; i <= N; i++) {
    const u = i / N, px = 150 + 520 * u, py = -6 + 50 * Math.pow(u, 1.25) * Math.sin(ph - u * 3.4), w = 70 * Math.pow(1 - u, 1.1) + 4, fw = 130 * Math.sin(Math.PI * Math.pow(u, 0.6)) * (1 - 0.35 * u);
    up.push([px, py - w]); lo.push([px, py + w]); fu.push([px, py - w - fw * 0.55]); fl.push([px, py + w + fw * 0.45]);
  }
  c.beginPath(); fu.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); for (let i = N; i >= 0; i--) c.lineTo(fl[i][0], fl[i][1]); c.closePath();
  c.fillStyle = 'rgba(150,200,110,0.30)'; c.fill(); c.lineWidth = 3; c.strokeStyle = 'rgba(200,240,160,0.4)'; c.stroke();
  c.beginPath(); up.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); for (let i = N; i >= 0; i--) c.lineTo(lo[i][0], lo[i][1]); c.closePath();
  c.fillStyle = 'rgba(96,134,58,0.78)'; c.fill();
  // the gills, outside, under the body
  pdGills(c, 6, 168, 1.5, t, 1.25, 0.4 + 0.6 * (o.outK || 0), 4);
  // the body: see-through
  const mo = o.mouth || 0;
  c.beginPath(); c.ellipse(-60, 0, 256, 176, 0, 0, Math.PI * 2);
  c.fillStyle = 'rgba(84,124,58,0.62)'; c.fill(); c.lineWidth = 7; c.strokeStyle = '#B9E08A'; c.stroke();
  G((g) => { g.beginPath(); g.ellipse(-60, 0, 256, 176, 0, 0, Math.PI * 2); g.lineWidth = 14; g.strokeStyle = 'rgba(150,255,170,0.25)'; g.stroke(); });
  c.save(); c.beginPath(); c.ellipse(-60, 0, 250, 170, 0, 0, Math.PI * 2); c.clip();
  ellipse(c, -40, 150, 220, 70, 'rgba(226,236,180,0.35)');
  // the coiled gut
  c.beginPath(); for (let a = 0; a < 17; a += 0.25) { const r = 6 + a * 3.4, px = 96 + Math.cos(a) * r, py = 92 + Math.sin(a) * r * 0.6; a ? c.lineTo(px, py) : c.moveTo(px, py); }
  c.lineWidth = 9; c.lineCap = 'round'; c.strokeStyle = 'rgba(150,120,60,0.55)'; c.stroke();
  c.restore();
  // the lung: a small pink sac of air, up at the back
  c.beginPath(); c.ellipse(118, -56, 84, 44, -0.08, 0, Math.PI * 2);
  const lg = c.createRadialGradient(100, -72, 8, 118, -56, 90); lg.addColorStop(0, '#FFC6D2'); lg.addColorStop(1, '#E77F9C');
  c.fillStyle = lg; c.fill(); c.lineWidth = 5; c.strokeStyle = '#8A2F52'; c.stroke();
  for (let i = 0; i < 5; i++) circle(c, 76 + i * 20 + 3 * Math.sin(t * 3 + i), -58 + 10 * Math.sin(i * 2.1), 6 + 2 * (i % 2), 'rgba(235,250,255,0.75)');
  // the tube from the mouth cavity to the lung (the doors stand across it): centre line A -> B, lumen 46 wide
  const TA = [-98, -12], TB = [48, -50], tn = [0.252, 0.967];
  const tube = (h) => { c.beginPath(); c.moveTo(TA[0] - tn[0] * h, TA[1] - tn[1] * h); c.lineTo(TB[0] - tn[0] * h, TB[1] - tn[1] * h); c.lineTo(TB[0] + tn[0] * h, TB[1] + tn[1] * h); c.lineTo(TA[0] + tn[0] * h, TA[1] + tn[1] * h); c.closePath(); };
  tube(31); c.fillStyle = '#E7B6C6'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#A8627E'; c.stroke();
  tube(23); c.fillStyle = '#0B1F3F'; c.fill();
  // the gill channel: down and back, out through the slit under the body
  const fl2 = o.floor || 0;
  c.beginPath(); c.moveTo(-150, 30); c.quadraticCurveTo(-90, 60, -50, 110); c.quadraticCurveTo(-24, 150, -8, 178); c.lineTo(40, 168); c.quadraticCurveTo(10, 120, -20, 70); c.quadraticCurveTo(-50, 20, -100, 4); c.closePath();
  c.fillStyle = '#0A2E46'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#7FC6B0'; c.stroke();
  // the mouth cavity: a chamber whose floor pumps down (it fills) and up (it empties)
  const fy = 56 + 44 * fl2;
  c.beginPath(); c.moveTo(-300, 4 - 10 * mo); c.quadraticCurveTo(-200, -62, -100, -34); c.lineTo(-92, 10); c.quadraticCurveTo(-110, fy, -200, fy + 6); c.quadraticCurveTo(-270, fy - 4, -300, 30 + 10 * mo); c.closePath();
  c.fillStyle = '#0A2E46'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#7FC6B0'; c.stroke();
  // the lips
  for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(-304, 17 + sd * (10 + 12 * mo), 16, 9, sd * 0.3, 0, Math.PI * 2); c.fillStyle = '#C9E79A'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#3F5A22'; c.stroke(); }
  // ---- water: cyan dashes coming in at the mouth and going out over the gills
  const flow = o.flow || 0, dash = (p, a, len = 20) => {
    if (a <= 0.01) return;
    line(c, p[0] - Math.cos(p[2]) * len, p[1] - Math.sin(p[2]) * len, p[0], p[1], 9, `rgba(150,236,255,${0.92 * a})`);
    G((g) => softDot(g, p[0], p[1], 22, '#7FE9FF', 0.5 * a));
  };
  for (let i = 0; i < 30; i++) {
    const u = (hash(i * 2.9 + 1) + flow) % 1, off = (hash(i * 6.1) - 0.5) * 34;
    if (u < 0.46) { const p = pdAlong(PD_IN, u / 0.46); dash([p[0], p[1] + off * (0.5 + u), p[2]], (o.inK || 0) * Math.min(1, u * 9)); }
    else { const p = pdAlong(PD_OUT, (u - 0.46) / 0.54), w = 1 - 0.4 * Math.abs((u - 0.46) / 0.54 - 0.4); dash([p[0] + off * 0.3 * w, p[1] + off * 0.2, p[2]], (o.outK || 0) * (1 - Math.pow((u - 0.46) / 0.54, 4))); }
  }
  // ... and the few that try the other way, and bounce off the doors
  const kn = o.knock || 0;
  if (kn > 0.01) for (let i = 0; i < 4; i++) {
    const u = Math.abs(Math.sin(t * 7 + i * 1.3)), px = lerp(-150, -62, u), py = lerp(2, -22, u) + (i - 1.5) * 8;
    dash([px, py, -0.25 + (Math.cos(t * 7 + i * 1.3) < 0 ? Math.PI : 0)], kn, 14);
  }
  // ---- the same doors as in his throat, across the tube to the lung
  c.save(); c.translate(-38, -27.6); c.rotate(-1.826);
  for (const sd of [-1, 1]) { rrect(c, sd * 23 - (sd > 0 ? 0 : 6), -8, 6, 16, 2); c.fillStyle = '#5B6B86'; c.fill(); }
  bxDoorPair(c, 0, 0, 23, o.door === undefined ? 1 : o.door, o.doorHit || 0);
  c.restore();
  if ((o.doorHit || 0) > 0.01) G((g) => softDot(g, -38, -28, 60, '#FFE9A6', 0.4 * Math.min(1, o.doorHit)));
  // the eye and a cheek
  const lk = o.look || [-0.5, 0.2], bl = o.blink || 0;
  if (bl > 0.9) { c.beginPath(); c.moveTo(-250, -92); c.quadraticCurveTo(-212, -70, -174, -92); c.lineWidth = 8; c.lineCap = 'round'; c.strokeStyle = '#263A12'; c.stroke(); }
  else { ellipse(c, -212, -96, 42, 46 * (1 + 0.15 * Math.abs(hic)), '#FFFFFF'); circle(c, -212 + lk[0] * 15, -96 + lk[1] * 15, 20, '#15132A'); circle(c, -220 + lk[0] * 15, -105 + lk[1] * 15, 7, '#FFFFFF'); }
  ellipse(c, -236, -30, 22, 12, 'rgba(255,110,130,0.3)');
  for (let i = 0; i < 9; i++) circle(c, -150 + hash(i * 3 + 2) * 330, -150 + hash(i * 5 + 1) * 60, 6 + 8 * hash(i + 9), 'rgba(40,66,24,0.4)');
  c.restore();
}
function pdPt(v, x, y) { return [v.x + x * v.s, v.y + y * v.s]; }

// the hero's face in a round frame (screen space): where the idea says the hiccup ended up. k = pop, hic -1..1
function pdPortrait(x, y, r, k, t, hic = 0) {
  if (k <= 0.01) return;
  const c = ctx, s = r / 100;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.translate(x, y - 12 * hic); c.scale(k, k);
  c.beginPath(); c.arc(0, 0, r + 12, 0, 7); c.fillStyle = '#FFD447'; c.fill();
  c.beginPath(); c.arc(0, 0, r, 0, 7); c.fillStyle = '#3A1935'; c.fill();
  c.save(); c.clip();
  const face = Math.abs(hic) > 0.15 ? FACE_HIC : Object.assign({}, FACES.calm, { lookX: 0.6, lookY: 0.7, browY: 0.8, browTilt: 0.7 });
  drawCharacter(c, { x: 0, y: 296 * s + 10, s, pose: POSES.sit, face, noLegs: true, headDY: -8 * hic, frizz: 0.3 * Math.abs(hic) }, t, DATEPAL);
  dnBowTie(c, 0, (296 - 34 - 164) * s + 10, s);
  c.restore();
  c.restore();
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); softDot(gctx, x, y, r * 1.5 * k, '#FFD447', 0.25); gctx.restore();
}
