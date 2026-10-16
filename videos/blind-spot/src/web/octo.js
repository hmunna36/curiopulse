// Under the sea: a teal water background painted once (light from above, shafts, a sandy floor with rocks and weed),
// bubbles, and an octopus as a character (octo units: the middle of its head is the origin, about 300 units wide):
// a big head, two big eyes with the bar-shaped pupils octopuses have, eight tentacles that curl, suckers, a phone held
// in one tentacle, another tentacle over one eye, sunglasses. Also a phone seen from the front showing the test card.
'use strict';

let SEA_BG = null;
function seaPaint() {
  const cv = mkCanvas(W, H), c = cv.getContext('2d');
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#1C7FA6'); g.addColorStop(0.35, '#145E8A'); g.addColorStop(0.75, '#0C3A62'); g.addColorStop(1, '#0A2C4C');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  // light shafts from the surface
  for (const [x0, w, a] of [[120, 160, 0.10], [430, 110, 0.08], [700, 190, 0.09], [960, 120, 0.07]]) {
    const sg = c.createLinearGradient(0, 0, 0, 1300); sg.addColorStop(0, `rgba(190,240,255,${a})`); sg.addColorStop(1, 'rgba(190,240,255,0)');
    c.fillStyle = sg; c.beginPath(); c.moveTo(x0, 0); c.lineTo(x0 + w, 0); c.lineTo(x0 + w * 1.9 - 140, 1300); c.lineTo(x0 - 140, 1300); c.closePath(); c.fill();
  }
  // the sandy floor, rocks, weed
  c.fillStyle = '#C9A46A'; c.beginPath(); c.moveTo(0, 1620); c.quadraticCurveTo(300, 1560, 560, 1600); c.quadraticCurveTo(820, 1640, 1080, 1580); c.lineTo(1080, H); c.lineTo(0, H); c.closePath(); c.fill();
  c.fillStyle = '#A9874E'; for (let i = 0; i < 40; i++) { const rng = mulberry32(100 + i); circle(c, rng() * W, 1640 + rng() * 260, 3 + rng() * 5, '#A9874E'); }
  for (const [x, y, r, col] of [[90, 1640, 90, '#3B4E6A'], [200, 1670, 60, '#4A5F7E'], [960, 1610, 110, '#33465F'], [850, 1660, 54, '#4A5F7E']]) { ellipse(c, x, y, r, r * 0.62, col); }
  for (const [x, h, col] of [[40, 380, '#2E8A5E'], [150, 300, '#3BA36E'], [1010, 420, '#2E8A5E'], [920, 260, '#3BA36E']]) {
    c.beginPath(); c.moveTo(x - 14, 1660); c.bezierCurveTo(x - 40, 1660 - h * 0.4, x + 40, 1660 - h * 0.7, x, 1660 - h); c.bezierCurveTo(x + 50, 1660 - h * 0.7, x - 10, 1660 - h * 0.4, x + 16, 1660); c.closePath(); c.fillStyle = col; c.fill();
  }
  return cv;
}
function initSea() { SEA_BG = seaPaint(); }
function seaBack(cam, t, o = {}) {
  screenSpace(); ctx.fillStyle = '#0A2C4C'; ctx.fillRect(0, 0, W, H);
  const bc = { x: 540 + ((cam && cam.x) || 540) * 0 + ((cam ? cam.x - 540 : 0) * 0.3), y: 960 + (cam ? (cam.y - 960) * 0.3 : 0), zoom: 1 + (cam ? (cam.zoom - 1) * 0.25 : 0), rot: 0 };
  applyCam(bc);
  ctx.drawImage(SEA_BG, 0, 0);
  screenSpace();
  // bubbles rising on clocks that fit the Short
  for (let i = 0; i < 16; i++) {
    const rng = mulberry32(400 + i), x = 60 + rng() * 960, sp = 0.05 + 0.05 * rng(), ph = rng();
    const u = (t * sp * (loopW(1) / 1) + ph) % 1, y = 1700 - u * 1800, r = 5 + 9 * rng();
    const wob = 10 * Math.sin(t * 2 + i);
    paint(() => { ctx.beginPath(); ctx.arc(x + wob, y, r, 0, 7); ctx.lineWidth = 2.4; ctx.strokeStyle = 'rgba(210,245,255,0.55)'; ctx.stroke(); circle(ctx, x + wob - r * 0.35, y - r * 0.35, r * 0.25, 'rgba(240,255,255,0.7)'); });
  }
  // a caustic shimmer near the top
  for (let i = 0; i < 5; i++) softDot(gctx, 140 + i * 210 + 30 * Math.sin(t * 0.8 + i), 220 + 40 * Math.cos(t * 0.6 + i * 2), 160, '#9EEBFF', 0.07);
  void o;
}

// ---------------------------------------------------------------- the octopus
const OCT = { col: '#FF7F6E', sh: '#E25C55', spot: '#D9554F', sucker: '#FFD2C2', under: '#FFB4A0' };
// a tentacle as a tapered tube along a curve: pts = control points (octo units), w0 at the root, w1 at the tip
function octArm(c, pts, w0, w1, suckers = true, col = OCT.col) {
  // sample a Catmull-Rom curve through the points
  const S = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let j = 0; j < 10; j++) {
      const u = j / 10, u2 = u * u, u3 = u2 * u;
      S.push([0, 1].map((k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * u + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * u3)));
    }
  }
  S.push(pts[pts.length - 1]);
  const L = [], R = [];
  for (let i = 0; i < S.length; i++) {
    const a = S[Math.max(0, i - 1)], b = S[Math.min(S.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy) || 1;
    const w = lerp(w0, w1, i / (S.length - 1)) / 2, nx = -dy / n, ny = dx / n;
    L.push([S[i][0] + nx * w, S[i][1] + ny * w]); R.push([S[i][0] - nx * w, S[i][1] - ny * w]);
  }
  c.beginPath(); L.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])));
  for (let i = R.length - 1; i >= 0; i--) c.lineTo(R[i][0], R[i][1]);
  c.closePath(); c.fillStyle = col; c.fill();
  circle(c, S[S.length - 1][0], S[S.length - 1][1], w1 / 2, col);
  if (suckers) paint(() => {
    for (let i = 4; i < S.length - 3; i += 4) {
      const w = lerp(w0, w1, i / (S.length - 1)), p = R[i], q = S[i];
      circle(c, lerp(q[0], p[0], 0.72), lerp(q[1], p[1], 0.72), Math.max(2.5, w * 0.17), OCT.sucker);
    }
  });
  return S;
}
// o: {t, look: [x, y], face: smile | smug | wow | grin, coverEye: 0..1 (a tentacle over its right eye, screen right),
// phone: 0..1 (a phone held up in a tentacle, screen left), phoneDot: 0..1, shades: 0..1, wave: 0..1 (a flourish),
// wink: 0..1, sway}
function octopus(c, x, y, s, o = {}) {
  const t = o.t || 0, sway = o.sway === undefined ? 1 : o.sway, wave = clamp(o.wave || 0);
  c.save(); c.translate(x, y + 6 * Math.sin(t * 1.6) * sway); c.scale(s, s);
  const out = {};
  actor(() => {
    // the tentacles behind the head first: six of them fan out below
    const roots = [[-96, 96], [-62, 112], [-24, 120], [24, 120], [62, 112], [96, 96]];
    roots.forEach(([rx, ry], i) => {
      const sd = rx < 0 ? -1 : 1, ph = t * 2.2 + i * 1.1, sp = 1 + 0.6 * wave * Math.sin(t * 9 + i);
      const reach = 150 + 30 * Math.abs(i - 2.5);
      const pts = [[rx, ry - 20], [rx + sd * 30, ry + 60], [rx + sd * (60 + 20 * Math.sin(ph)) * sp, ry + reach * 0.6], [rx + sd * (110 + 30 * Math.sin(ph + 1)) * sp, ry + reach * 0.9 + 20 * Math.cos(ph)], [rx + sd * (150 + 20 * Math.sin(ph + 2)) * sp, ry + reach * 0.8 - 40 * Math.sin(ph + 0.5)]];
      octArm(c, pts, 44, 10);
    });
    // the head (mantle) and its face area
    c.beginPath(); c.ellipse(0, -40, 138, 160, 0, 0, 7); c.fillStyle = OCT.col; c.fill();
    c.beginPath(); c.ellipse(0, 70, 120, 74, 0, 0, 7); c.fillStyle = OCT.col; c.fill();
  });
  paint(() => {
    for (const [sx, sy, r] of [[-60, -120, 14], [40, -150, 10], [80, -80, 12], [-90, -40, 9], [10, -90, 7], [-30, -170, 8]]) circle(c, sx, sy, r, OCT.spot);
    // cheeks
    ellipse(c, -84, 96, 18, 10, 'rgba(255,90,110,0.35)'); ellipse(c, 84, 96, 18, 10, 'rgba(255,90,110,0.35)');
  });
  // the eyes: big whites, bar-shaped pupils
  const look = o.look || [0, 0], wink = clamp(o.wink || 0);
  for (const sd of [-1, 1]) {
    const ex = sd * 56, ey = 40, shut = sd > 0 ? Math.max(wink, 0) : 0;
    paint(() => {
      if (shut > 0.6) { c.beginPath(); c.moveTo(ex - 26, ey + 2); c.quadraticCurveTo(ex, ey + 18, ex + 26, ey + 2); c.lineWidth = 6; c.strokeStyle = '#5A1A22'; c.lineCap = 'round'; c.stroke(); return; }
      ellipse(c, ex, ey, 34, 38, '#FFFFFF');
      c.beginPath(); c.ellipse(ex, ey, 34, 38, 0, 0, 7); c.lineWidth = 4; c.strokeStyle = '#9A3A3A'; c.stroke();
      rrect(c, ex - 17 + look[0] * 9, ey - 7 + look[1] * 10, 34, 14, 6); c.fillStyle = '#1A0E14'; c.fill();
      circle(c, ex - 10 + look[0] * 9, ey - 12 + look[1] * 10, 5, '#FFFFFF');
      // lids: a smug half-lid
      if (o.face === 'smug') { c.save(); c.beginPath(); c.ellipse(ex, ey, 35, 39, 0, 0, 7); c.clip(); c.fillStyle = OCT.sh; c.fillRect(ex - 40, ey - 44, 80, 34); line(c, ex - 36, ey - 10, ex + 36, ey - 10, 4, '#7A2A2A'); c.restore(); }
    });
    out['eye' + (sd < 0 ? 'L' : 'R')] = [ex, ey];
  }
  // the mouth
  paint(() => {
    const f = o.face || 'smile';
    if (f === 'wow') { ellipse(c, 0, 112, 14, 16, '#5A1A22'); }
    else if (f === 'grin' || f === 'smug') { c.beginPath(); c.moveTo(-30, 102); c.quadraticCurveTo(0, f === 'grin' ? 136 : 122, 30, 102); c.closePath(); c.fillStyle = '#5A1A22'; c.fill(); if (f === 'smug') line(c, 30, 102, 40, 96, 4, '#5A1A22'); }
    else { c.beginPath(); c.moveTo(-22, 104); c.quadraticCurveTo(0, 122, 22, 104); c.lineWidth = 6; c.strokeStyle = '#5A1A22'; c.lineCap = 'round'; c.stroke(); }
  });
  // sunglasses (pushed down onto the eyes as they arrive)
  const sh = clamp(o.shades || 0);
  if (sh > 0.01) {
    const yy = lerp(-120, 34, E.outBack(sh, 1.6));
    actor(() => {
      for (const sd of [-1, 1]) { rrect(c, sd * 56 - 42, yy - 26, 84, 54, 18); c.fillStyle = '#121225'; c.fill(); }
      line(c, -14, yy - 10, 14, yy - 10, 10, '#121225');
    });
    paint(() => { for (const sd of [-1, 1]) line(c, sd * 56 - 26, yy - 14, sd * 56 - 6, yy - 18, 5, 'rgba(160,200,255,0.7)'); });
  }
  // the two front tentacles: one over its right eye (screen right), one holding the phone (screen left)
  const ce = clamp(o.coverEye || 0), ph = clamp(o.phone || 0);
  actor(() => {
    // over the eye: from below the head on the right, out, up, and back across the eye like a hand over it
    const ex = 56, ey = 40;
    octArm(c, [[100, 104], [lerp(170, 178, ce), lerp(200, 92, ce)], [lerp(200, 150, ce), lerp(250, 30, ce)], [lerp(190, 98, ce), lerp(270, 18, ce)], [lerp(170, ex - 30, ce), lerp(280, ey + 4, ce)]], 46, 34, false);
    // the phone arm: from the left side up to the phone
    const P = [lerp(-150, -250, ph), lerp(260, -40, ph)];
    out.phoneAt = P;
    octArm(c, [[-110, 110], [-170, 160], [lerp(-190, -250, ph), lerp(250, 120, ph)], [P[0] + 30, P[1] + 70], [P[0] + 10, P[1] + 30]], 46, 20, false);
  });
  if (ph > 0.01) octPhone(c, out.phoneAt[0], out.phoneAt[1], 1, o.phoneDot === undefined ? 1 : o.phoneDot, -0.12);
  // the tip that curls round the phone's edge
  if (ph > 0.01) actor(() => { const P = out.phoneAt; c.beginPath(); c.arc(P[0] - 52, P[1] + 104, 17, 0, 7); c.fillStyle = OCT.col; c.fill(); });
  c.restore();
  return out;
}
// a phone held up, its screen toward us, showing the test card: an X and a red dot (octo units)
function octPhone(c, x, y, s, dot = 1, rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  actor(() => { rrect(c, -62, -112, 124, 224, 22); c.fillStyle = '#1B1E2E'; c.fill(); });
  paint(() => {
    rrect(c, -54, -100, 108, 200, 14); c.fillStyle = '#1B2552'; c.fill();
    for (const [w, col] of [[11, '#0B0B1A'], [6, '#FFFFFF']]) { line(c, -38, -12, -18, 8, w, col); line(c, -18, -12, -38, 8, w, col); }
    if (dot > 0.01) { circle(c, 30, 0, 12 * dot + 2, '#0B0B1A'); circle(c, 30, 0, 12 * dot, '#FF3B4E'); }
  });
  c.restore();
}
