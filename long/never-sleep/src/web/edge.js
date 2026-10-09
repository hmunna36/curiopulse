// What Happens If You NEVER Sleep? (long-form): the edge, past the record. Four little worlds:
//  1. the sleep lab of the 1980s: a rat on a round platform over a tray of water, a day counter on the cage;
//  2. the fruit fly, big, with its belly see-through: the gut fills with red sparks (the damage), blue drops mop it up;
//  3. the brain rinse: brain cells as soft blobs with channels between them; blue fluid washes brown gunk away;
//  4. the night sea floor: upside-down jellyfish lying on the sand, pulsing slowly, no brain at all.
'use strict';

// ---------------------------------------------------------------- 1. the rat lab
function ratLab(cam, t, o = {}) {
  darkBg('#0E2A30', '#03090C');
  applyCam(cam);
  const c = ctx;
  // back wall tiles, a bench
  for (let y = 0; y < 900; y += 90) for (let x = 0; x < W; x += 120) { rrect(c, x + 4, y + 4, 112, 82, 6); c.fillStyle = (x / 120 + y / 90) % 2 ? '#123A40' : '#10343A'; c.fill(); }
  rrect(c, 200, 760, 1520, 40, 8); c.fillStyle = '#2A4A50'; c.fill();
  c.fillStyle = '#16282C'; c.fillRect(200, 800, 1520, 300);
  // a lamp over the cage (it dims at the end)
  const lamp = o.lamp === undefined ? 1 : o.lamp;
  line(c, 960, -40, 960, 200, 6, '#2A3A40');
  c.beginPath(); c.moveTo(880, 240); c.lineTo(1040, 240); c.lineTo(1000, 196); c.lineTo(920, 196); c.closePath(); c.fillStyle = '#3A4A50'; c.fill();
  if (lamp > 0) { softDot(gctx, 960, 250, 360, '#DFF6FF', 0.45 * lamp); softDot(c, 960, 600, 520, '#BFEFFF', 0.12 * lamp); }
  // the cage: glass box, a tray of water, the round platform on a post
  const cx = 960, by = 760;
  rrect(c, cx - 360, by - 380, 720, 380, 14); c.fillStyle = 'rgba(160,230,255,0.08)'; c.fill(); c.lineWidth = 6; c.strokeStyle = 'rgba(190,240,255,0.5)'; c.stroke();
  rrect(c, cx - 340, by - 70, 680, 60, 10); c.fillStyle = '#2A7CA8'; c.fill();
  for (let i = 0; i < 8; i++) line(c, cx - 320 + i * 86 + 10 * Math.sin(t * 2 + i), by - 52, cx - 280 + i * 86 + 10 * Math.sin(t * 2 + i), by - 52, 3, 'rgba(255,255,255,0.35)');
  line(c, cx, by - 70, cx, by - 150, 18, '#5A6A70');
  const spin = o.spin || 0;
  ellipse(c, cx, by - 156, 250, 34, '#8A9AA0'); ellipse(c, cx, by - 162, 246, 30, '#B8C8CC');
  for (let i = 0; i < 6; i++) { const a = spin + i * 1.047; line(c, cx, by - 162, cx + Math.cos(a) * 230, by - 162 + Math.sin(a) * 26, 2, 'rgba(60,80,90,0.4)'); }
  return { cx, top: by - 170, lamp };
}

// ---------------------------------------------------------------- 2. the fruit fly
// (x, y) centre of the thorax; s ~ 1 = about 500 px wide; o.gut 0..1 (how much damage has piled up), o.mop 0..1
// (antioxidant drops mopping it up), o.xray 0..1, o.face ('calm' | 'tired' | 'ok'), o.wing (flap 0..1)
function fly(c, x, y, s, t, o = {}) {
  const xr = clamp(o.xray || 0), gut = clamp(o.gut || 0), mop = clamp(o.mop || 0);
  c.save(); c.translate(x, y); c.scale(s, s);
  // wings (behind)
  const flap = (o.wing || 0) * Math.sin(t * 60);
  for (const sd of [-1, 1]) {
    c.save(); c.translate(sd * 40, -40); c.rotate(sd * (-0.5 - 0.35 * flap));
    ellipse(c, sd * 110, -30, 150, 52, 'rgba(210,235,255,0.45)', sd * 0.25);
    c.lineWidth = 3; c.strokeStyle = 'rgba(160,190,220,0.7)'; c.beginPath(); c.ellipse(sd * 110, -30, 150, 52, sd * 0.25, 0, Math.PI * 2); c.stroke();
    for (let i = 0; i < 3; i++) line(c, sd * 20, -16, sd * (180 - i * 30), -40 + i * 26, 2, 'rgba(150,180,210,0.5)');
    c.restore();
  }
  // legs
  for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) {
    const a = sd * (0.5 + i * 0.45), L1 = 90, kx = sd * (60 + Math.sin(a) * L1 * 0.4), ky = 20 + i * 26;
    poly(c, [[sd * 30, 10 + i * 20], [kx + sd * 40, ky + 30], [kx + sd * 70, ky + 120]], 9, '#3A2418');
  }
  // abdomen: tan with dark stripes; see-through when xray
  c.save(); c.translate(0, 140);
  c.beginPath(); c.ellipse(0, 0, 92, 130, 0, 0, Math.PI * 2);
  c.fillStyle = mixHex('#D8A24A', '#2A3A5A', xr * 0.8); c.fill();
  if (xr < 0.95) for (let i = 0; i < 4; i++) { c.save(); c.beginPath(); c.ellipse(0, 0, 92, 130, 0, 0, Math.PI * 2); c.clip(); c.fillStyle = rgba('#5A3214', 0.9 * (1 - xr)); c.fillRect(-100, -40 + i * 46, 200, 18); c.restore(); }
  c.lineWidth = 5; c.strokeStyle = rgba('#7FE9FF', 0.8 * xr); c.stroke();
  if (xr > 0.05) {   // the gut: a looping tube; sparks of damage inside it; blue drops that mop them up
    const P = [[0, -120], [-30, -80], [30, -40], [-36, 0], [34, 40], [-20, 80], [10, 110]];
    smoothPath(c, P); c.lineWidth = 34; c.strokeStyle = rgba('#FF9AC0', 0.75 * xr); c.lineCap = 'round'; c.stroke();
    smoothPath(c, P); c.lineWidth = 18; c.strokeStyle = rgba('#C85A8A', 0.7 * xr); c.stroke();
    const rng = mulberry32(31), live = gut * (1 - mop);
    for (let i = 0; i < 40; i++) {
      const u = rng(), seg = Math.min(P.length - 2, Math.floor(u * (P.length - 1))), f = u * (P.length - 1) - seg;
      const px = lerp(P[seg][0], P[seg + 1][0], f) + (rng() - 0.5) * 20, py = lerp(P[seg][1], P[seg + 1][1], f) + (rng() - 0.5) * 20;
      if (rng() < live) {
        const tw = 0.6 + 0.4 * Math.sin(t * 12 + i);
        const r = 5 + 4 * tw;
        line(c, px - r, py, px + r, py, 3, rgba('#FF4D3A', xr)); line(c, px, py - r, px, py + r, 3, rgba('#FF4D3A', xr));
        softDot(gctx, px, py, 18, '#FF3A2A', 0.7 * xr * tw);
      } else if (mop > 0 && rng() < mop * 0.6) circle(c, px, py, 7, rgba('#7FE9FF', 0.85 * xr));
    }
  }
  c.restore();
  // thorax + head
  ellipse(c, 0, 0, 84, 74, '#B88A3A'); ellipse(c, -16, -18, 40, 26, 'rgba(255,230,170,0.35)');
  for (let i = 0; i < 9; i++) { const a = -2.6 + i * 0.25; line(c, Math.cos(a) * 70, Math.sin(a) * 60, Math.cos(a) * 82, Math.sin(a) * 74, 3, '#3A2418'); }
  c.save(); c.translate(0, -96);
  ellipse(c, 0, 0, 70, 56, '#C8963E');
  for (const sd of [-1, 1]) {   // the big red eyes, with a pupil so it can act
    const g = c.createRadialGradient(sd * 44 - 8, -14, 4, sd * 44, -4, 44);
    g.addColorStop(0, '#FF8A7A'); g.addColorStop(1, '#B0202A');
    c.beginPath(); c.ellipse(sd * 46, -6, 40, 46, sd * 0.2, 0, Math.PI * 2); c.fillStyle = g; c.fill();
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) circle(c, sd * 46 - 25 + i * 10, -30 + j * 10, 1.6, 'rgba(90,10,20,0.35)');
    const face = o.face || 'calm', lid = face === 'tired' ? 0.55 : 0;
    circle(c, sd * 40, -2, 12, '#FFFFFF'); circle(c, sd * 40 + 2, 0, 7, '#1A0A10');
    if (lid > 0) { c.fillStyle = '#B0202A'; c.fillRect(sd * 40 - 14, -16, 28, 28 * lid); }
  }
  // antennae + mouth
  for (const sd of [-1, 1]) poly(c, [[sd * 14, -46], [sd * 22, -80], [sd * 40, -96 + 4 * Math.sin(t * 4 + sd)]], 5, '#3A2418');
  const mood = o.face === 'ok' ? 1 : o.face === 'tired' ? -1 : 0;
  c.beginPath(); c.moveTo(-14, 30); c.quadraticCurveTo(0, 30 + 10 * mood, 14, 30); c.lineWidth = 5; c.strokeStyle = '#3A2418'; c.lineCap = 'round'; c.stroke();
  c.restore();
  c.restore();
}
// a lifespan bar: label, a bar that fills to v (0..1) over k, a little fly icon riding its end
function lifeBar(x, y, w, v, k, col, label) {
  if (k <= 0) return;
  const c = ctx;
  c.save(); c.globalAlpha = clamp(k * 3);
  c.font = '900 34px Montserrat'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = '#FFFFFF';
  c.lineWidth = 7; c.strokeStyle = '#0B0B1A'; c.lineJoin = 'round'; c.strokeText(label, x, y - 46); c.fillText(label, x, y - 46);
  rrect(c, x, y - 18, w, 36, 18); c.fillStyle = 'rgba(10,14,30,0.8)'; c.fill(); c.lineWidth = 3; c.strokeStyle = 'rgba(255,255,255,0.4)'; c.stroke();
  const fw = Math.max(36, w * v * E.outCubic(clamp(k)));
  rrect(c, x, y - 18, fw, 36, 18); c.fillStyle = col; c.fill();
  c.restore();
}

// ---------------------------------------------------------------- 3. the brain rinse (a section of brain tissue)
let RINSE = null;
function initRinse() {
  const rng = mulberry32(73), cells = [];
  for (let i = 0; i < 46; i++) cells.push({ x: rng() * 2200 - 140, y: 120 + rng() * 780, r: 70 + rng() * 60, s: rng() });
  const gunk = [...Array(120)].map(() => ({ x: rng(), y: rng(), s: rng(), v: 0.5 + rng() }));
  RINSE = { cells, gunk };
}
// shrink 0..1 (cells shrink, channels widen: asleep), flow 0..1 (the fluid moves), clean 0..1 (gunk washed out)
function rinseTissue(t, o = {}) {
  if (!RINSE) initRinse();
  const c = ctx, sh = clamp(o.shrink || 0), flow = o.flow || 0, clean = clamp(o.clean || 0);
  darkBg('#0A2440', '#020814');
  screenSpace();
  // the fluid between the cells: blue, streaming left to right
  const g = c.createLinearGradient(0, 0, W, 0); g.addColorStop(0, '#0E4A7A'); g.addColorStop(1, '#0A3560');
  c.fillStyle = g; c.fillRect(0, 60, W, 900);
  for (let i = 0; i < 60; i++) {
    const y = 80 + ((i * 97) % 860), x = ((i * 233 + t * 260 * flow) % (W + 200)) - 100;
    line(c, x, y, x + 60 + 40 * flow, y, 3, `rgba(127,233,255,${0.18 + 0.25 * flow})`);
  }
  // gunk: brown flecks drifting with the flow, fewer as the rinse goes on
  for (const q of RINSE.gunk) {
    if (q.s < clean) continue;
    const x = ((q.x * (W + 300) + t * 180 * flow * q.v) % (W + 300)) - 150, y = 80 + q.y * 860;
    ellipse(c, x, y, 9, 6, '#8A5A2A', q.s * 3); ellipse(c, x - 2, y - 2, 4, 3, '#B88A4A');
  }
  // the cells
  for (const cl of RINSE.cells) {
    const r = cl.r * (1 - 0.28 * sh), wob = 4 * Math.sin(t * 1.2 + cl.s * 9);
    const cg = c.createRadialGradient(cl.x - r * 0.3, cl.y - r * 0.3, r * 0.1, cl.x, cl.y, r);
    cg.addColorStop(0, '#FFC6DE'); cg.addColorStop(0.7, '#E07AA8'); cg.addColorStop(1, '#A04A7A');
    c.beginPath(); c.ellipse(cl.x, cl.y, r + wob, r - wob * 0.5, cl.s * 3, 0, Math.PI * 2); c.fillStyle = cg; c.fill();
    circle(c, cl.x + r * 0.15, cl.y + r * 0.1, r * 0.22, '#8A3A6A');
  }
}

// ---------------------------------------------------------------- 4. the night sea floor and its jellyfish
let SEA = null;
function initSea() {
  const rng = mulberry32(88);
  SEA = { motes: [...Array(90)].map(() => ({ x: rng(), y: rng(), r: 1 + rng() * 3, p: rng() })), weeds: [...Array(14)].map(() => ({ x: rng() * W, h: 120 + rng() * 260, p: rng() })) };
}
function seaFloor(cam, t, o = {}) {
  if (!SEA) initSea();
  const c = ctx;
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#04203A'); g.addColorStop(0.6, '#063250'); g.addColorStop(1, '#0A3A4A');
  screenSpace(); c.fillStyle = g; c.fillRect(0, 0, W, H);
  // moonlight shafts from the surface
  c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 5; i++) {
    const x = 300 + i * 360 + 40 * Math.sin(t * 0.3 + i);
    const sg = c.createLinearGradient(0, 0, 0, H); sg.addColorStop(0, 'rgba(140,200,255,0.12)'); sg.addColorStop(1, 'rgba(140,200,255,0)');
    c.fillStyle = sg; c.beginPath(); c.moveTo(x - 40, 0); c.lineTo(x + 40, 0); c.lineTo(x + 220, H); c.lineTo(x - 120, H); c.closePath(); c.fill();
  }
  c.restore();
  applyCam(cam);
  // sand
  c.beginPath(); c.moveTo(-400, 820); for (let x = -400; x <= W + 400; x += 40) c.lineTo(x, 820 + 14 * Math.sin(x * 0.006) + 8 * Math.sin(x * 0.017)); c.lineTo(W + 400, H + 400); c.lineTo(-400, H + 400); c.closePath();
  const sg2 = c.createLinearGradient(0, 800, 0, H); sg2.addColorStop(0, '#3A6A70'); sg2.addColorStop(1, '#16343C'); c.fillStyle = sg2; c.fill();
  for (const w of SEA.weeds) {   // sea grass swaying
    c.beginPath(); c.moveTo(w.x, 830);
    for (let k = 1; k <= 8; k++) { const u = k / 8; c.lineTo(w.x + 30 * u * Math.sin(t * 0.8 + w.p * 6 + u * 2), 830 - w.h * u); }
    c.lineWidth = 10; c.strokeStyle = '#1E5A4A'; c.lineCap = 'round'; c.stroke();
  }
  screenSpace();
  for (const m of SEA.motes) {   // drifting specks
    const x = (m.x * W + 20 * Math.sin(t * 0.5 + m.p * 9)) % W, y = ((m.y * H - t * 12 * (0.5 + m.p)) % H + H) % H;
    circle(c, x, y, m.r, `rgba(190,230,255,${0.25 + 0.3 * Math.sin(t + m.p * 20) ** 2})`);
  }
}
// an upside-down jellyfish (Cassiopea): its bell lies on the sand, the frilly arms point up. pulse(t) 0..1 squeezes
// the bell; o.glow, o.sleep (dims and slows), o.label
function upsideJelly(c, x, y, s, pulse, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const p = clamp(pulse), sq = 1 - 0.16 * p;
  // the bell, a flat dish on the sand (seen slightly from above)
  ellipse(c, 0, 10, 170 * sq, 34, 'rgba(0,0,0,0.3)');
  c.beginPath(); c.ellipse(0, 0, 160 * sq, 46 + 8 * p, 0, 0, Math.PI * 2);
  const g = c.createRadialGradient(0, -10, 10, 0, 0, 170); g.addColorStop(0, '#BFF0FF'); g.addColorStop(0.6, '#7FC8E8'); g.addColorStop(1, '#4A8AB8');
  c.fillStyle = g; c.globalAlpha = 0.9; c.fill(); c.globalAlpha = 1;
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; line(c, Math.cos(a) * 40, Math.sin(a) * 12, Math.cos(a) * 150 * sq, Math.sin(a) * 42, 3, 'rgba(255,255,255,0.35)'); }
  // the eight frilly arms, rising and swaying
  for (let i = 0; i < 8; i++) {
    const a = -Math.PI / 2 + (i - 3.5) * 0.26, L = 120 + 30 * Math.sin(i * 1.7);
    const sw = 0.12 * Math.sin(t * 0.9 + i) * (o.sleep ? 0.4 : 1);
    const ex = Math.cos(a + sw) * L, ey = -20 + Math.sin(a + sw) * L;
    c.beginPath(); c.moveTo(0, -10); c.quadraticCurveTo(ex * 0.4, ey * 0.6, ex, ey); c.lineWidth = 16; c.strokeStyle = '#6AB8C8'; c.lineCap = 'round'; c.stroke();
    for (let k = 0; k < 4; k++) { const u = 0.45 + k * 0.17; circle(c, ex * u, ey * u - 4, 18 - k * 2, ['#9FE0D8', '#C8A8FF', '#7FE9FF', '#FFD0E8'][(i + k) % 4]); }
    softDot(gctx, ex, ey, 40, '#7FE9FF', 0.5 * (o.glow === undefined ? 1 : o.glow) * (0.6 + 0.4 * p));
  }
  c.restore();
}
