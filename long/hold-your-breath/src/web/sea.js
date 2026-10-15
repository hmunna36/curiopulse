// What If You Hold Your Breath TOO Long? (long-form): the water. The open sea from the sunlit surface down into the dark
// (light shafts, marine snow, a depth scale), a harbour seal that dives (its heart slows), a Cuvier's beaked whale going
// down into the dark, and the record pool: an indoor pool at night, a freediver floating face down with a safety diver
// at his side and a big timer on the wall. World coords = screen coords at zoom 1 unless a function says otherwise.
'use strict';

let SEA_SNOW = null;
function initSea2() {
  const rng = mulberry32(404);
  SEA_SNOW = [...Array(160)].map(() => ({ x: rng(), y: rng(), r: 1 + rng() * 2.6, v: 0.2 + rng() * 0.6, ph: rng() * 6.28 }));
}
// the sea behind everything (screen space). o: {depth 0..1 (0 = just under the surface, 1 = the dark abyss), t, shafts,
// glow (bioluminescent specks in the dark)}
function seaBack(t, o = {}) {
  const c = ctx, d = clamp(o.depth || 0);
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, mixHex('#2FA8D8', '#04101E', d)); g.addColorStop(0.5, mixHex('#126A9E', '#020812', d)); g.addColorStop(1, mixHex('#0A3A66', '#010308', d));
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  // light shafts from the surface
  const sh = (o.shafts === undefined ? 1 : o.shafts) * (1 - d);
  if (sh > 0.02) {
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 7; i++) {
      const x = 160 + i * 280 + 60 * Math.sin(t * 0.3 + i), w = 70 + 50 * hash(i);
      const gg = c.createLinearGradient(0, 0, 0, H); gg.addColorStop(0, `rgba(170,230,255,${0.16 * sh})`); gg.addColorStop(1, 'rgba(170,230,255,0)');
      c.fillStyle = gg; c.beginPath(); c.moveTo(x - w / 2, -10); c.lineTo(x + w / 2, -10); c.lineTo(x + w * 1.6 + 200, H); c.lineTo(x - w * 0.4 + 200, H); c.closePath(); c.fill();
    }
    c.restore();
  }
  // marine snow drifting
  for (const p of SEA_SNOW) {
    const x = (p.x * W + 20 * Math.sin(t * 0.4 + p.ph)) % W, y = ((p.y * H - t * 18 * p.v) % H + H) % H;
    circle(c, x, y, p.r, `rgba(220,240,255,${0.18 + 0.25 * d})`);
  }
  // bioluminescence in the deep
  const gl = (o.glow || 0) * d;
  if (gl > 0.02) for (let i = 0; i < 26; i++) {
    const x = hash(i * 3.1) * W, y = hash(i * 7.3 + 1) * H, a = gl * (0.4 + 0.6 * Math.max(0, Math.sin(t * (0.8 + hash(i) * 2) + i * 4)));
    circle(c, x, y, 2.5, rgba('#7FFFE0', a)); softDot(gctx, x, y, 24, '#5FFFD8', 0.6 * a);
  }
}
// a depth scale on the right edge (screen space): metres, with the current depth marked
function depthScale(t, m, k = 1) {
  if (k <= 0.01) return;
  const c = ctx, x = W - 150, y0 = 170, y1 = 820;
  c.save(); c.globalAlpha = clamp(k);
  line(c, x, y0, x, y1, 4, 'rgba(200,235,255,0.5)');
  for (let i = 0; i <= 6; i++) line(c, x - 14, lerp(y0, y1, i / 6), x, lerp(y0, y1, i / 6), 3, 'rgba(200,235,255,0.5)');
  c.font = '400 52px Anton'; c.textAlign = 'right'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  const txt = `${fmt(m)} M`; c.lineWidth = 10; c.strokeStyle = '#06101E'; c.strokeText(txt, x - 30, y1 + 70); c.fillStyle = '#BFF0FF'; c.fillText(txt, x - 30, y1 + 70);
  c.restore();
}

// ---------------------------------------------------------------- a harbour seal (local: nose at +x, length about 2*L)
// o: {ang (rad, + = nose down), swim (tail beat phase speed), eyes ('open'|'shut'), heart (draw its heart glowing in it, beat 0..1)}
function seal(c, x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.rotate(o.ang || 0); c.scale(s, s);
  const wv = Math.sin(t * (o.swim || 3)) * 0.18;
  // rear flippers
  c.save(); c.translate(-210, 0); c.rotate(wv);
  c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-60, -50, -110, -46); c.quadraticCurveTo(-80, -6, -112, 34); c.quadraticCurveTo(-60, 44, 0, 8); c.closePath();
  c.fillStyle = '#5A6878'; c.fill();
  c.restore();
  // body
  c.beginPath(); c.moveTo(-220, 0);
  c.bezierCurveTo(-180, -64, -40, -96, 70, -80); c.bezierCurveTo(160, -70, 220, -40, 236, -6); c.bezierCurveTo(240, 24, 200, 58, 120, 66);
  c.bezierCurveTo(10, 80, -150, 60, -220, 0); c.closePath();
  const g = c.createLinearGradient(0, -90, 0, 80); g.addColorStop(0, '#8A98A8'); g.addColorStop(0.6, '#B8C4CE'); g.addColorStop(1, '#D8E0E6');
  c.fillStyle = g; c.fill();
  // spots
  for (let i = 0; i < 16; i++) ellipse(c, -170 + 330 * hash(i * 2.3), -50 + 70 * hash(i * 5.1) * (hash(i) > 0.5 ? 0.6 : 1), 6 + 6 * hash(i * 1.1), 4 + 4 * hash(i * 3.7), 'rgba(60,70,84,0.45)');
  // front flipper
  c.save(); c.translate(60, 40); c.rotate(0.6 + 0.25 * Math.sin(t * (o.swim || 3) + 1));
  c.beginPath(); c.ellipse(26, 0, 46, 16, 0, 0, Math.PI * 2); c.fillStyle = '#6A7888'; c.fill(); c.restore();
  // head details: eye, nose, whiskers
  const ex = 176, ey = -34;
  if (o.eyes === 'shut') line(c, ex - 12, ey, ex + 12, ey + 2, 4, '#1A2028');
  else { ellipse(c, ex, ey, 15, 17, '#10161E'); circle(c, ex + 4, ey - 6, 4, '#FFFFFF'); }
  ellipse(c, 232, -6, 8, 6, '#2A3038');
  for (let i = -1; i <= 1; i++) line(c, 214, 12 + i * 6, 262, 6 + i * 16, 2, 'rgba(240,244,248,0.8)');
  // its heart, glowing through
  if (o.heart !== undefined) {
    c.save(); c.translate(40, 6); heartShape(c, 26, o.heart); c.fillStyle = 'rgba(255,74,94,0.85)'; c.fill(); c.restore();
  }
  c.restore();
  if (o.heart !== undefined) softDot(gctx, x + Math.cos(o.ang || 0) * 40 * s, y + Math.sin(o.ang || 0) * 40 * s, 60 * s, '#FF4A5E', 0.3 + 0.5 * o.heart);
  // bubbles from its nose (it breathed out before the dive)
  if (o.bubbles) for (let i = 0; i < 6; i++) { const ph = (t * 0.8 + i / 6) % 1, a = o.ang || 0; circle(c, x + Math.cos(a) * 230 * s + 20 * Math.sin(i + t), y + Math.sin(a) * 230 * s - 160 * ph, (5 + 4 * hash(i)) * s * 1.5, `rgba(220,245,255,${0.6 * (1 - ph)})`); }
}

// ---------------------------------------------------------------- a Cuvier's beaked whale (local: beak at +x, length about 2*L)
function beakedWhale(c, x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.rotate(o.ang || 0); c.scale(s, s);
  const wv = Math.sin(t * 1.4) * 0.12;
  // flukes
  c.save(); c.translate(-330, 0); c.rotate(wv);
  c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-60, -20, -120, -70); c.quadraticCurveTo(-90, -10, -110, 0); c.quadraticCurveTo(-90, 10, -120, 70); c.quadraticCurveTo(-60, 20, 0, 0); c.closePath();
  c.fillStyle = '#5A5048'; c.fill(); c.restore();
  // body: long and spindle-shaped, a small dorsal fin far back
  c.beginPath(); c.moveTo(-340, 0);
  c.bezierCurveTo(-260, -40, -60, -86, 120, -76); c.bezierCurveTo(240, -68, 300, -46, 330, -18); c.lineTo(392, -6); c.quadraticCurveTo(400, 2, 390, 8); c.lineTo(330, 16);
  c.bezierCurveTo(300, 50, 220, 70, 100, 72); c.bezierCurveTo(-60, 76, -260, 40, -340, 0); c.closePath();
  const g = c.createLinearGradient(0, -80, 0, 80); g.addColorStop(0, '#6E6258'); g.addColorStop(0.55, '#8A7E72'); g.addColorStop(1, '#B0A496');
  c.fillStyle = g; c.fill();
  // the pale head
  c.save(); c.clip();
  const hg = c.createLinearGradient(160, 0, 340, 0); hg.addColorStop(0, 'rgba(240,236,226,0)'); hg.addColorStop(1, 'rgba(240,236,226,0.9)');
  c.fillStyle = hg; c.fillRect(140, -100, 280, 200);
  // scars
  for (let i = 0; i < 9; i++) { const sx = -220 + 420 * hash(i * 4.4), sy = -40 + 60 * hash(i * 2.9); line(c, sx, sy, sx + 40 + 30 * hash(i), sy + 6 - 12 * hash(i * 9), 3, 'rgba(250,246,238,0.7)'); }
  c.restore();
  c.beginPath(); c.moveTo(-170, -50); c.quadraticCurveTo(-140, -96, -112, -104); c.quadraticCurveTo(-118, -70, -100, -58); c.closePath(); c.fillStyle = '#5A5048'; c.fill();
  // flipper, eye, mouth line
  c.save(); c.translate(160, 44); c.rotate(0.5); ellipse(c, 0, 0, 40, 12, '#6E6258'); c.restore();
  ellipse(c, 270, -20, 9, 8, '#141010'); circle(c, 272, -23, 3, '#FFFFFF');
  c.beginPath(); c.moveTo(392, 2); c.quadraticCurveTo(340, 10, 300, 6); c.lineWidth = 3; c.strokeStyle = 'rgba(60,40,30,0.6)'; c.stroke();
  c.restore();
}

// ---------------------------------------------------------------- the record pool (world coords, at zoom 1 it fills the frame)
// An indoor pool at night seen from the side, cut away below the surface: the freediver floats face down at the surface,
// the safety diver stands in the water beside him with a hand on his back; a big timer on the wall. o: {secs (the timer),
// label (under the timer), tank 0..1 (an oxygen cylinder by the pool: the second record), crowd}
const POOL = { surf: 560, bottom: 1010, x0: -200, x1: 2120, diverX: 980 };
const DIVERPAL = Object.assign({}, PAL, { coat: '#1A1E2A', coatSh: '#0E1018', coatHi: '#3A4258', coatDk: '#06080E', strap: '#1A1E2A', strapSh: '#0E1018', pants: '#1A1E2A', pantsSh: '#0E1018', shoe: '#1A1E2A', shoeSh: '#0E1018', sole: '#1A1E2A', pj: true });
const SAFEPAL = Object.assign({}, PAL, { coat: '#E2424B', coatSh: '#B02A34', coatHi: '#FF7A82', coatDk: '#8A1E26', strap: '#E2424B', strapSh: '#B02A34', pants: '#2A2F48', pantsSh: '#1A1E30', pj: true });
function poolScene(cam, t, o = {}) {
  const c = ctx;
  applyCam(cam);
  // the hall: dark walls, two big lamps, a scoreboard
  const wg = c.createLinearGradient(0, -200, 0, POOL.surf); wg.addColorStop(0, '#0A1428'); wg.addColorStop(1, '#16284A');
  c.fillStyle = wg; c.fillRect(-400, -300, W + 800, POOL.surf + 300);
  for (const lx of [300, 1620]) { softDot(gctx, lx, 40, 260, '#BFE6FF', 0.5); circle(c, lx, 40, 26, '#E8F6FF'); }
  // the timer
  if (o.label !== '' || o.secs) {
  rrect(c, 700, 70, 520, 220, 22); c.fillStyle = '#04070E'; c.fill(); c.lineWidth = 6; c.strokeStyle = '#2A3A5A'; c.stroke();
  const sec = Math.max(0, o.secs || 0), mm = Math.floor(sec / 60), ss = Math.floor(sec % 60);
  const txt = `${mm}:${String(ss).padStart(2, '0')}`;
  c.font = '400 150px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle';
  for (const g2 of [c]) { g2.fillStyle = o.timerCol || '#FF5A4A'; g2.fillText(txt, 960, 176); }
  gctx.save(); gctx.font = '400 150px Anton'; gctx.textAlign = 'center'; gctx.textBaseline = 'middle'; gctx.fillStyle = rgba(o.timerCol || '#FF5A4A', 0.8); gctx.fillText(txt, 960, 176); gctx.restore();
  if (o.label) { c.font = '900 30px Montserrat'; c.fillStyle = '#9FB8E0'; c.fillText(o.label, 960, 262); }
  }
  // a ring buoy on the wall (the empty pool at night)
  if (o.night) { c.save(); c.translate(1560, 380); c.lineWidth = 34; c.strokeStyle = '#E2424B'; c.beginPath(); c.arc(0, 0, 70, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = '#FFFFFF'; for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(0, 0, 70, i * Math.PI / 2 - 0.25, i * Math.PI / 2 + 0.25); c.stroke(); } c.restore(); }
  // the deck and the edge
  c.fillStyle = '#C8D4E2'; c.fillRect(-400, POOL.surf - 30, 520, 30); c.fillRect(1800, POOL.surf - 30, 520, 30);
  // the oxygen cylinder by the pool (the second record)
  if ((o.tank || 0) > 0.01) {
    c.save(); c.translate(1690, POOL.surf - 30); c.scale(o.tank, o.tank);
    rrect(c, -40, -260, 80, 260, 30); c.fillStyle = '#E8ECF2'; c.fill(); rrect(c, -40, -260, 80, 70, 30); c.fillStyle = '#4DB8A0'; c.fill();
    rrect(c, -14, -290, 28, 34, 6); c.fillStyle = '#8A94A8'; c.fill();
    c.font = '400 48px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#1A2A3A'; c.fillText('O₂', 0, -110);
    c.restore();
  }
  // the water: a surface band, then the cutaway under it
  const wt = c.createLinearGradient(0, POOL.surf, 0, POOL.bottom); wt.addColorStop(0, o.night ? '#0E3A5A' : '#3AC8E8'); wt.addColorStop(1, o.night ? '#02101E' : '#0A5A8A');
  c.fillStyle = wt; c.fillRect(120, POOL.surf, 1680, POOL.bottom - POOL.surf + 200);
  // tiles and lane line on the bottom
  for (let x = 120; x < 1800; x += 60) line(c, x, POOL.surf + 20, x, POOL.bottom + 200, 2, 'rgba(255,255,255,0.08)');
  for (let y = POOL.surf + 40; y < POOL.bottom + 200; y += 60) line(c, 120, y, 1800, y, 2, 'rgba(255,255,255,0.08)');
  // caustics
  c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 40; i++) { const x = 140 + 1640 * hash(i * 3.3), y = POOL.surf + 60 + 380 * hash(i * 5.7); ellipse(c, x + 14 * Math.sin(t + i), y, 40 + 20 * Math.sin(t * 1.3 + i), 6, 'rgba(160,240,255,0.08)'); }
  c.restore();
  c.fillStyle = '#1A2A44'; c.fillRect(120 - 20, POOL.surf - 10, 20, POOL.bottom); c.fillRect(1800, POOL.surf - 10, 20, POOL.bottom);
  // the freediver: face down at the surface (on air), or lying on the pool's floor (the oxygen record); none at night
  if (!o.empty) {
    if (o.floor) {   // a shallower floor for this shot, so he lies above the captions
      const fy = 860;
      c.fillStyle = '#2A8AB8'; c.fillRect(120, fy, 1680, 400);
      for (let x = 120; x < 1800; x += 60) line(c, x, fy, x, fy + 400, 2, 'rgba(255,255,255,0.12)');
      line(c, 120, fy, 1800, fy, 5, 'rgba(200,240,255,0.5)');
      floorDiver(c, POOL.diverX, fy - 4, 1, t);
    }
    else floatDiver(c, POOL.diverX, POOL.surf + 6 + 4 * Math.sin(t * 0.9), 1, t);
  }
  // the safety diver beside him: standing in the water up to his chest, a hand on the diver's back
  if (!o.empty && !o.floor) {
  c.save();
  const sx = POOL.diverX + 330;
  drawCharacter(c, { x: sx, y: POOL.surf + 330, s: 0.7, pose: ikReach(Object.assign({}, POSES.stand, { armL: { a: 0.4, b: 0.6 } }), 'L', [-300, -330], 1), face: Object.assign({}, FACES.calm, { lookX: -0.8, lookY: 0.5 }), seed: 6 }, t, SAFEPAL);
  c.restore();
  }
  // the water's surface on top of them (a translucent band so the parts below look wet)
  c.save(); c.beginPath(); c.moveTo(120, POOL.surf);
  for (let x = 120; x <= 1800; x += 20) c.lineTo(x, POOL.surf + 5 * Math.sin(x * 0.02 + t * 2));
  c.lineTo(1800, POOL.bottom + 200); c.lineTo(120, POOL.bottom + 200); c.closePath();
  c.fillStyle = 'rgba(40,170,220,0.38)'; c.fill(); c.restore();
  line(c, 120, POOL.surf + 2, 1800, POOL.surf + 2, 4, 'rgba(220,250,255,0.7)');
}

// a freediver floating face down, from the side (local: his head at -x, feet at +x; y = the water line). Wetsuit black.
function floatDiver(c, x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const suit = '#151924', hi = '#2E3648';
  // legs and fins, trailing slightly down
  c.beginPath(); c.moveTo(60, -6); c.lineTo(250, 6); c.lineTo(254, 30); c.lineTo(60, 26); c.closePath(); c.fillStyle = suit; c.fill();
  c.beginPath(); c.moveTo(250, 6); c.lineTo(360, 0 + 6 * Math.sin(t * 0.7)); c.lineTo(366, 34); c.lineTo(254, 30); c.closePath(); c.fillStyle = '#2A5ADA'; c.fill();
  // torso (its back just breaks the surface)
  c.beginPath(); c.moveTo(-150, 4); c.quadraticCurveTo(-60, -22, 70, -10); c.lineTo(80, 30); c.quadraticCurveTo(-40, 44, -150, 36); c.closePath(); c.fillStyle = suit; c.fill();
  line(c, -120, -2, 40, -12, 6, hi);
  // an arm along his side
  c.beginPath(); c.moveTo(-110, 26); c.quadraticCurveTo(0, 46, 70, 40); c.lineWidth = 22; c.lineCap = 'round'; c.strokeStyle = '#0E1018'; c.stroke();
  // the head, face down: the back of the head with hair at the surface, a nose clip and a mask under the water
  c.save(); c.translate(-188, 26); c.rotate(-0.25);
  ellipse(c, 0, 0, 46, 40, '#E8A880'); ellipse(c, 6, -14, 46, 30, PAL.hair);
  rrect(c, -40, 14, 40, 18, 6); c.fillStyle = '#3FA7FF'; c.fill();
  c.restore();
  c.restore();
}

// the oxygen record: lying on the pool's floor, face down, from the side (local: head at -x; y = the floor)
function floorDiver(c, x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const suit = '#151924';
  c.beginPath(); c.moveTo(-150, -40); c.quadraticCurveTo(-40, -58, 80, -42); c.lineTo(250, -34); c.lineTo(254, -6); c.lineTo(80, -4); c.quadraticCurveTo(-40, 4, -150, 0); c.closePath(); c.fillStyle = suit; c.fill();
  c.beginPath(); c.moveTo(250, -34); c.lineTo(360, -30); c.lineTo(364, -4); c.lineTo(254, -6); c.closePath(); c.fillStyle = '#2A5ADA'; c.fill();
  c.save(); c.translate(-188, -26); ellipse(c, 0, 0, 46, 40, '#E8A880'); ellipse(c, 4, -14, 46, 30, PAL.hair); rrect(c, -40, 10, 40, 18, 6); c.fillStyle = '#3FA7FF'; c.fill(); c.restore();
  for (let i = 0; i < 3; i++) { const ph = (t * 0.25 + i / 3) % 1; circle(c, -200 + 10 * Math.sin(t + i), -60 - 300 * ph, 6 + 3 * i, `rgba(220,245,255,${0.4 * (1 - ph)})`); }
  c.restore();
}
