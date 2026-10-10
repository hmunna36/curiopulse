// Other skies: the Moon at noon (no air: black), Mars (dust: butterscotch by day, blue at sunset), and the long way
// through the air: the Earth's edge with its thin shell of air, drawn for the sunset.
'use strict';

// ================================================================ the Moon
const MOON = { earth: [292, 852], sun: [690, 872], groundY: TR.hy + 22 };
let MOON_CRATERS = null;
function initWorlds() {
  const rng = mulberry32(909);
  MOON_CRATERS = [...Array(15)].map(() => { const d = rng(); return { x: -500 + rng() * 2100, y: MOON.groundY + 60 + d * 520, rx: 40 + 120 * d + 40 * rng(), d }; });
  MARS_ROCKS = [...Array(22)].map(() => { const d = rng(); return { x: -500 + rng() * 2100, y: MARS.groundY + 30 + d * 560, r: 10 + 34 * d * (0.5 + rng()), d, k: rng() }; });
  MARS_DUST = [...Array(90)].map(() => ({ x: rng(), y: rng(), z: 0.3 + 0.7 * rng(), ph: rng() * 6.28 }));
}
// the Earth, small and far: a blue marble with its thin shining rim of air
function earthBall(c, x, y, r, t) {
  softDot(gctx, x, y, r * 1.9, '#4F9DFF', 0.5);
  paint(() => {
    softDot(c, x, y, r * 1.5, '#6FB8FF', 0.4);
    circle(c, x, y, r, '#1F62C8');
    c.save(); c.beginPath(); c.arc(x, y, r, 0, 7); c.clip();
    c.fillStyle = '#3FA35C';
    for (const [dx, dy, rx, ry, a] of [[-0.3, -0.25, 0.42, 0.3, 0.4], [0.35, 0.2, 0.36, 0.5, -0.3], [-0.5, 0.5, 0.3, 0.2, 0.2]]) { c.beginPath(); c.ellipse(x + dx * r, y + dy * r, rx * r, ry * r, a, 0, 7); c.fill(); }
    c.fillStyle = 'rgba(255,255,255,0.85)';
    for (const [dx, dy, rx, ry, a] of [[-0.1, -0.55, 0.5, 0.1, 0.2], [0.2, 0.05, 0.42, 0.09, -0.25], [-0.25, 0.42, 0.4, 0.08, 0.15]]) { c.beginPath(); c.ellipse(x + dx * r, y + dy * r, rx * r, ry * r, a, 0, 7); c.fill(); }
    const g = c.createLinearGradient(x - r, y - r, x + r, y + r); g.addColorStop(0, 'rgba(0,0,20,0.55)'); g.addColorStop(0.5, 'rgba(0,0,20,0)');
    c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r);
    c.restore();
    c.beginPath(); c.arc(x, y, r + 3, 0, 7); c.lineWidth = 5; c.strokeStyle = 'rgba(140,205,255,0.9)'; c.stroke();
  });
}
// the ground of the Moon, a flag, and the black sky with the sun in it. o: {behind: fn}
function moonBack(cam, t) {
  const c = ctx;
  trSky(cam, t, { blue: 0, stars: 0.75 });
  trSun(cam, t, { blue: 0, at: MOON.sun, r: 38, rays: 0.2 });
  applyCam(cam);
  earthBall(c, MOON.earth[0], MOON.earth[1], 54, t);
  // far hills, the plain
  c.fillStyle = '#8F939F';
  c.beginPath(); c.moveTo(-1200, 2600); c.lineTo(-1200, MOON.groundY - 40);
  c.bezierCurveTo(-500, MOON.groundY - 150, -200, MOON.groundY - 20, 200, MOON.groundY - 64); c.bezierCurveTo(600, MOON.groundY - 110, 900, MOON.groundY - 10, 1300, MOON.groundY - 90);
  c.bezierCurveTo(1700, MOON.groundY - 150, 2000, MOON.groundY - 40, 2400, MOON.groundY - 60); c.lineTo(2400, 2600); c.closePath(); c.fill();
  c.fillStyle = '#B9BDC8';
  c.beginPath(); c.moveTo(-1200, 2600); c.lineTo(-1200, MOON.groundY + 10); c.bezierCurveTo(-300, MOON.groundY - 12, 500, MOON.groundY + 4, 1100, MOON.groundY - 4); c.bezierCurveTo(1600, MOON.groundY - 10, 2000, MOON.groundY + 12, 2400, MOON.groundY); c.lineTo(2400, 2600); c.closePath(); c.fill();
  paint(() => {
    for (const k of MOON_CRATERS) {
      ellipse(c, k.x, k.y, k.rx, k.rx * 0.26, '#9A9FAD'); ellipse(c, k.x + k.rx * 0.06, k.y + k.rx * 0.045, k.rx * 0.86, k.rx * 0.19, '#7F8494');
      c.beginPath(); c.ellipse(k.x, k.y, k.rx, k.rx * 0.26, 0, Math.PI * 1.05, Math.PI * 1.95); c.lineWidth = 4; c.strokeStyle = 'rgba(236,240,250,0.8)'; c.stroke();
    }
  });
  // a flag on a stiff wire (there is no wind to hold it out)
  const fx = 800, fy = MOON.groundY + 6;
  c.fillStyle = '#D6DAE4'; c.fillRect(fx - 4, fy - 260, 8, 262); c.fillRect(fx, fy - 262, 128, 6);
  c.fillStyle = '#1CB3A4'; c.fillRect(fx + 4, fy - 256, 122, 78);
  paint(() => { c.fillStyle = '#FFD447'; c.beginPath(); c.moveTo(fx + 26, fy - 190); c.lineTo(fx + 54, fy - 236); c.lineTo(fx + 72, fy - 210); c.lineTo(fx + 88, fy - 230); c.lineTo(fx + 110, fy - 190); c.closePath(); c.fill(); });
}

// ================================================================ Mars
const MARS = { groundY: TR.hy + 22, sunDay: [742, 640], sunSet: [742, 1392] };
let MARS_ROCKS = null, MARS_DUST = null;
const MARS_DAY = [[0, '#A9783F'], [0.5, '#CF9A58'], [1, '#EBC088']], MARS_EVE = [[0, '#1E1C2A'], [0.55, '#4A434C'], [1, '#746058']];
// e = 0 the day, 1 the sunset
function marsBack(cam, t, e) {
  const c = ctx, mix = (a, b) => mixH(a, b, e);
  applyCam(cam);
  const g = c.createLinearGradient(0, -300, 0, MARS.groundY - 40);
  MARS_DAY.forEach(([u, col], i) => g.addColorStop(u, mix(col, MARS_EVE[i][1])));
  c.fillStyle = g; c.fillRect(-4000, -4000, 9000, 9000);
  // the sun: small and pale by day; at sunset it sits in a blue glow
  const S = lerp2(MARS.sunDay, MARS.sunSet, E.inOutCubic(e));
  paint(() => {
    if (e > 0.02) {
      softDot(c, S[0], S[1], 720, '#2F6FE0', 0.5 * e); softDot(c, S[0], S[1], 400, '#5E9BFF', 0.5 * e); softDot(c, S[0], S[1], 150, '#BBD9FF', 0.55 * e);
      softDot(gctx, S[0], S[1], 340, '#3F7FF0', 0.36 * e); softDot(gctx, S[0], S[1], 70, '#DCEBFF', 0.42 * e);
    }
    softDot(c, S[0], S[1], 150, '#FFF4DA', 0.42 * (1 - e)); softDot(gctx, S[0], S[1], 100, '#FFF0CC', 0.32 * (1 - e));
    circle(c, S[0], S[1], 27, mix('#FFFBEF', '#F2F8FF')); circle(gctx, S[0], S[1], 24, 'rgba(255,255,255,0.6)');
  });
  // mesas far off, dunes, the plain
  c.fillStyle = mix('#B9703F', '#2E2630');
  c.beginPath(); c.moveTo(-1200, 2600); c.lineTo(-1200, MARS.groundY - 90); c.lineTo(-700, MARS.groundY - 96); c.lineTo(-640, MARS.groundY - 190); c.lineTo(-330, MARS.groundY - 196); c.lineTo(-270, MARS.groundY - 80);
  c.lineTo(120, MARS.groundY - 70); c.lineTo(190, MARS.groundY - 150); c.lineTo(420, MARS.groundY - 154); c.lineTo(470, MARS.groundY - 60); c.lineTo(980, MARS.groundY - 66); c.lineTo(1040, MARS.groundY - 220); c.lineTo(1420, MARS.groundY - 226);
  c.lineTo(1480, MARS.groundY - 80); c.lineTo(2400, MARS.groundY - 70); c.lineTo(2400, 2600); c.closePath(); c.fill();
  c.fillStyle = mix('#A8562B', '#2A1F29');
  c.beginPath(); c.moveTo(-1200, 2600); c.lineTo(-1200, MARS.groundY - 30); c.bezierCurveTo(-500, MARS.groundY - 70, 0, MARS.groundY + 10, 500, MARS.groundY - 26); c.bezierCurveTo(1000, MARS.groundY - 60, 1500, MARS.groundY + 6, 2400, MARS.groundY - 40); c.lineTo(2400, 2600); c.closePath(); c.fill();
  c.fillStyle = mix('#C4673A', '#3A2831');
  c.beginPath(); c.moveTo(-1200, 2600); c.lineTo(-1200, MARS.groundY + 8); c.bezierCurveTo(-300, MARS.groundY - 8, 500, MARS.groundY + 6, 1100, MARS.groundY - 2); c.bezierCurveTo(1600, MARS.groundY - 8, 2000, MARS.groundY + 10, 2400, MARS.groundY); c.lineTo(2400, 2600); c.closePath(); c.fill();
  for (const k of MARS_ROCKS) { ellipse(c, k.x, k.y, k.r * 1.3, k.r * 0.8, mix(k.k > 0.5 ? '#8A3F20' : '#9C4A26', '#231821')); }
}
// dust in the air (screen space): it drifts, and near the low sun it catches the blue
function marsDust(cam, t, e, k = 1) {
  if (k <= 0.01) return;
  const S = toScreen(cam, ...lerp2(MARS.sunDay, MARS.sunSet, E.inOutCubic(e)));
  screenSpace();
  paint(() => {
    for (const m of MARS_DUST) {
      const x = (((m.x * 1280 + t * 60 * m.z + 30 * Math.sin(t * 0.7 + m.ph)) % 1280) + 1280) % 1280 - 100, y = 300 + m.y * 1250 + 26 * Math.sin(t * 0.9 + m.ph * 2);
      const d = Math.hypot(x - S[0], y - S[1]), near = clamp(1 - d / 520) * e;
      const col = near > 0.25 ? '#BFDDFF' : mixH('#F3D7A8', '#8A7A78', e);
      circle(ctx, x, y, (2.2 + 4.4 * m.z) * (1 + near), rgba(col, (0.3 + 0.5 * near) * k * m.z));
      if (near > 0.2) softDot(gctx, x, y, 22 * m.z, '#8FC2FF', 0.7 * near * k);
    }
  });
}
// a small rover with a head that looks about. o: {look: -1..1 (its head turns), nod, e}
function marsRover(c, x, y, s, t, o = {}) {
  const e = o.e || 0, mix = (a, b) => mixH(a, b, 0.6 * e);
  c.save(); c.translate(x, y); c.scale(s, s);
  for (const wx of [-78, 0, 78]) { circle(c, wx, -26, 30, mix('#3A3F52', '#1A1C28')); paint(() => { circle(c, wx, -26, 12, mix('#8D94AC', '#444A60')); for (let i = 0; i < 6; i++) { const a = i * 1.047 + t * 0.0; line(c, wx + Math.cos(a) * 14, -26 + Math.sin(a) * 14, wx + Math.cos(a) * 26, -26 + Math.sin(a) * 26, 3, 'rgba(15,16,26,0.6)'); } }); }
  rrect(c, -112, -112, 224, 62, 14); c.fillStyle = mix('#E9ECF4', '#7C8298'); c.fill();
  rrect(c, -112, -66, 224, 16, 6); c.fillStyle = mix('#B5BBCF', '#5A6078'); c.fill();
  c.fillStyle = mix('#28407E', '#16223F'); c.beginPath(); c.moveTo(-124, -124); c.lineTo(-10, -124); c.lineTo(-20, -112); c.lineTo(-112, -112); c.closePath(); c.fill();
  paint(() => { for (let i = 0; i < 4; i++) line(c, -110 + i * 26, -122, -106 + i * 26, -114, 2, 'rgba(140,180,255,0.7)'); });
  // the mast and the head
  c.fillStyle = mix('#C9CEDD', '#666C84'); c.fillRect(52, -206, 12, 96);
  const lk = o.look || 0;
  c.save(); c.translate(58, -214 + (o.nod || 0) * 6); c.rotate(-0.08 * lk + (o.tilt || 0));
  rrect(c, -44, -30, 88, 54, 12); c.fillStyle = mix('#F4F6FB', '#868CA4'); c.fill();
  paint(() => {
    for (const sd of [-1, 1]) { circle(c, sd * 19 + lk * 5, -4, 15, '#1B2038'); circle(c, sd * 19 + lk * 9, -4, 7.5, o.blue ? '#8FC2FF' : '#6FE0FF'); circle(c, sd * 19 + lk * 9 - 2.6, -7, 2.6, '#FFFFFF'); }
  });
  c.restore();
  c.restore();
}

// ================================================================ the long way through the air (screen space)
// The edge of the Earth with its shell of air, seen from the side, tilted so that the sunset's light comes in from the
// upper right. LW.o = where he stands; the tangent there points along LW.tan; "up" for him is LW.up.
const LW = (() => {
  const tilt = -0.5, o = [300, 1096], R = 1300, h = 260, he = 103;      // he = how high his eyes are (he is drawn at 0.22 of his size)
  const up = [Math.sin(tilt), -Math.cos(tilt)], tan = [Math.cos(tilt), Math.sin(tilt)];
  return { tilt, o, R, h, he, up, tan, c: [o[0] - up[0] * R, o[1] - up[1] * R], chord: Math.sqrt(2 * (R + he) * (h - he) + (h - he) * (h - he)) };
})();
// the direction the sunlight comes from when the sun stands at elevation el above his horizon (rad): a unit vector from him to the sun
const lwSunDir = (el) => [LW.tan[0] * Math.cos(el) + LW.up[0] * Math.sin(el), LW.tan[1] * Math.cos(el) + LW.up[1] * Math.sin(el)];
// how far the light travels inside the shell of air on its way to his eyes, for that elevation
function lwPath(el) {
  const s = Math.sin(el), R = LW.R + LW.he, h = LW.h - LW.he;
  return -R * s + Math.sqrt(R * R * s * s + 2 * R * h + h * h);
}
function longBack(t, k = 1) {
  const c = ctx;
  screenSpace();
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#02030B'); g.addColorStop(1, '#0A1026');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  paint(() => { for (const s of TR_STARS) { const x = (s.x + 800) * 0.42, y = (s.y + 1300) * 0.36 + 300; if (y < 1000) circle(c, x, y, s.r * 0.8, rgba('#DCE6FF', 0.5 * s.a)); } });
  // the shell of air: densest at the ground, gone at its top
  const [cx, cy] = LW.c, R = LW.R, h = LW.h;
  paint(() => {
    const ag = c.createRadialGradient(cx, cy, R, cx, cy, R + h * 1.16);
    ag.addColorStop(0, 'rgba(96,170,255,0.9)'); ag.addColorStop(0.5, 'rgba(70,140,250,0.6)'); ag.addColorStop(0.86, 'rgba(56,120,240,0.34)'); ag.addColorStop(1, 'rgba(56,120,240,0)');
    c.fillStyle = ag; c.beginPath(); c.arc(cx, cy, R + h * 1.16, 0, 7); c.fill();
    softDot(gctx, LW.o[0] + LW.up[0] * 60, LW.o[1] + LW.up[1] * 60, 560, '#2F7BFF', 0.2);
    c.beginPath(); c.arc(cx, cy, R + h, 0, 7); c.setLineDash([14, 12]); c.lineWidth = 3; c.strokeStyle = 'rgba(170,215,255,0.55)'; c.stroke(); c.setLineDash([]);
  });
  // the ground: sea and land
  circle(c, cx, cy, R, '#123E7A');
  paint(() => {
    c.save(); c.beginPath(); c.arc(cx, cy, R, 0, 7); c.clip();
    c.fillStyle = '#2E8B57';
    for (const [a, w, d] of [[-0.42, 0.1, 30], [-0.16, 0.2, 54], [0.14, 0.09, 26], [0.36, 0.16, 46]]) {
      const an = LW.tilt - Math.PI / 2 + a;
      c.beginPath(); c.ellipse(cx + Math.cos(an) * (R - d * 0.3), cy + Math.sin(an) * (R - d * 0.3), R * w, d, an + Math.PI / 2, 0, 7); c.fill();
    }
    c.restore();
    c.beginPath(); c.arc(cx, cy, R - 2, 0, 7); c.lineWidth = 5; c.strokeStyle = 'rgba(150,215,255,0.6)'; c.stroke();
  });
}
// the sunbeam for a sun at elevation el: from the sun to him. Inside the air it loses its blue on the way (lose 0..1):
// white where it comes in, red where it gets to him; blue leaves it sideways.
function longBeam(t, el, o = {}) {
  const c = ctx, d = lwSunDir(el), L = lwPath(el), E0 = [LW.o[0] + LW.up[0] * LW.he, LW.o[1] + LW.up[1] * LW.he];    // his eyes
  const inP = [E0[0] + d[0] * L, E0[1] + d[1] * L], far = o.far || 720, sunP = [E0[0] + d[0] * far, E0[1] + d[1] * far];
  const lose = clamp(o.lose || 0), a = o.a === undefined ? 1 : o.a;
  screenSpace();
  paint(() => {
    // outside the air: white
    for (const [cc, w, al] of [[gctx, 34, 0.5], [ctx, 19, 1]]) line(cc, sunP[0], sunP[1], inP[0], inP[1], w, rgba('#FFFFFF', al * a));
    // inside: the colour runs from white to what is left
    const end = mixH('#FFFFFF', mixH('#FFC24A', '#FF4530', clamp(L / LW.chord)), lose);
    const mid = mixH('#FFFFFF', mixH('#FFE9A0', '#FF9A3C', clamp(L / LW.chord)), lose);
    for (const [cc, w, al] of [[gctx, 40, 0.55], [ctx, 23, 1]]) {
      const g = cc.createLinearGradient(inP[0], inP[1], E0[0], E0[1]); g.addColorStop(0, rgba('#FFFFFF', al * a)); g.addColorStop(0.5, rgba(mid, al * a)); g.addColorStop(1, rgba(end, al * a));
      cc.lineCap = 'round'; cc.lineWidth = w; cc.strokeStyle = g; cc.beginPath(); cc.moveTo(inP[0], inP[1]); cc.lineTo(E0[0], E0[1]); cc.stroke();
    }
    // where it comes into the air: a tick
    circle(c, inP[0], inP[1], 10, rgba('#FFFFFF', a)); softDot(gctx, inP[0], inP[1], 50, '#BFE0FF', 0.8 * a);
    // blue leaving the beam, all along the way
    if (lose > 0.01) {
      const n = Math.max(3, Math.round(L / 46)), nx = -d[1], ny = d[0];
      for (let i = 0; i < n; i++) {
        const u = (i + 0.5) / n, ph = (t * 1.5 + hash(i * 3.3) * 1) % 1, side = i % 2 ? 1 : -1;
        if (1 - u > lose * 1.15) continue;                        // it starts where the beam comes in and works its way down to him
        const bx = inP[0] + (E0[0] - inP[0]) * u, by = inP[1] + (E0[1] - inP[1]) * u, r = 20 + 110 * ph;
        const px = bx + nx * side * r - d[0] * 22 * ph, py = by + ny * side * r - d[1] * 22 * ph, al = Math.sin(Math.PI * ph) * a;
        circle(c, px, py, 10 - 4 * ph, rgba('#4FA4FF', al)); softDot(gctx, px, py, 32, '#3F9BFF', 0.85 * al);
        line(c, px, py, px - nx * side * 20, py - ny * side * 20, 5, rgba('#4FA4FF', 0.6 * al));
      }
    }
  });
  return { inP, E0, sunP, L, d, end: mixH('#FFFFFF', mixH('#FFC24A', '#FF4530', clamp(L / LW.chord)), lose) };
}
function longSun(t, P, k = 1, low = 0) {
  const col = mixH('#FFFDF2', '#FFB25A', low);
  paint(() => {
    softDot(ctx, P[0], P[1], 150, col, 0.45 * k); softDot(gctx, P[0], P[1], 130, col, 0.55 * k);
    ctx.save(); ctx.translate(P[0], P[1]); ctx.rotate(t * 0.25);
    for (let i = 0; i < 10; i++) { ctx.rotate(0.6283); line(ctx, 54, 0, 54 + (i % 2 ? 16 : 28), 0, 6, rgba(col, 0.9 * k)); }
    ctx.restore();
    circle(ctx, P[0], P[1], 42, rgba(col, k)); circle(gctx, P[0], P[1], 40, rgba(col, 0.8 * k));
  });
}
