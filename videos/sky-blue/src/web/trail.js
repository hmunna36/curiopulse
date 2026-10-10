// The mountain trail: a sky that can be blue, black (no air) or a sunset; ridges; the ledge he stands on; and the hiker
// with his water bottle (trHero, drawn from a description). World = 1080x1920 at zoom 1; he stands left of the middle,
// the sun is up on the right. Everything ambient runs on loopW(), so the last frame meets the first.
'use strict';

const TR = { hx: 470, hy: 1640, hs: 0.92, sun: [800, 700], sunLow: [846, 1318] };
const TR_HEAD = [TR.hx, TR.hy - 470 * TR.hs];              // the middle of his head when he stands still (world)
const SKY_DAY = [[0, '#0A3A9E'], [0.42, '#1767D4'], [0.76, '#3E97EC'], [1, '#93D0FB']];
const SKY_DUSK = [[0, '#101645'], [0.4, '#3B2A72'], [0.66, '#A3456E'], [0.86, '#F2733A'], [1, '#FFC860']];
const SKY_SPACE = [[0, '#01020A'], [1, '#090D21']];
const SKY_Y0 = -700, SKY_Y1 = 1560;
let TR_STARS = null, TR_RIDGES = null, TR_TUFTS = null;

function initTrail() {
  const rng = mulberry32(4711);
  TR_STARS = [...Array(190)].map(() => ({ x: -800 + rng() * 2700, y: -1300 + rng() * 2850, r: 1.3 + rng() * 2.8, a: 0.35 + rng() * 0.65, ph: rng() * 6.28, w: 0.8 + rng() * 1.6 }));
  TR_RIDGES = [[1440, 190, 230, 11, 0.5], [1505, 130, 180, 23, 0.3], [1580, 95, 150, 37, 0.2]].map(([y0, amp, step, seed, snow]) => {
    const r = mulberry32(seed), pts = [];
    for (let x = -1000; x <= 2100; x += step) {
      const px = x + (r() - 0.5) * step * 0.5;
      pts.push([px, y0 - amp * (0.2 + 0.8 * r())], [px + step * (0.4 + 0.2 * r()), y0 - amp * 0.18 * r()]);
    }
    return { y0, pts, snow, amp };
  });
  TR_TUFTS = [...Array(26)].map((_, i) => ({ x: -160 + i * 56 + (rng() - 0.5) * 30, h: 16 + rng() * 22, n: 3 + Math.floor(rng() * 3), ph: rng() * 6.28 }));
}

function mixH(h1, h2, t) {      // like mixHex, but returns '#rrggbb' (so it can be mixed again, or given to rgba())
  const a = parseInt(h1.slice(1), 16), b = parseInt(h2.slice(1), 16), f = (sh) => Math.round(lerp((a >> sh) & 255, (b >> sh) & 255, clamp(t)));
  return '#' + ((1 << 24) | (f(16) << 16) | (f(8) << 8) | f(0)).toString(16).slice(1);
}
function trGrad(c, stops) {
  const g = c.createLinearGradient(0, SKY_Y0, 0, SKY_Y1);
  for (const [u, col] of stops) g.addColorStop(u, col);
  return g;
}
// the colour of the day sky at world height y (for patches of blue and for glows)
function trSkyAt(y) {
  const u = clamp((y - SKY_Y0) / (SKY_Y1 - SKY_Y0));
  for (let i = 1; i < SKY_DAY.length; i++) if (u <= SKY_DAY[i][0]) {
    const a = SKY_DAY[i - 1], b = SKY_DAY[i];
    return mixH(a[1], b[1], (u - a[0]) / (b[0] - a[0]));
  }
  return SKY_DAY[SKY_DAY.length - 1][1];
}

// the sky. o: {blue 0..1 (how much air is doing its job), dusk 0..1, patches: [[x, y, r, a]] (blue where sunlight has
// crashed), clouds 0..1, sun: [x, y] | null, sunK (how hard its glare is), stars}
function trSky(cam, t, o = {}) {
  const c = ctx, blue = clamp(o.blue === undefined ? 1 : o.blue), dusk = clamp(o.dusk || 0);
  applyCam(cam);
  const X0 = -4000, Y0 = -4000, S = 9000;
  c.fillStyle = trGrad(c, SKY_SPACE); c.fillRect(X0, Y0, S, S);
  const sa = (o.stars === undefined ? 1 : o.stars) * (1 - blue) * (1 - dusk);
  if (sa > 0.01) paint(() => {
    for (const s of TR_STARS) {
      const tw = 0.72 + 0.28 * Math.sin(t * loopW(s.w) + s.ph);
      circle(c, s.x, s.y, s.r / Math.sqrt(cam.zoom), rgba('#DCE6FF', s.a * sa * tw));
    }
  });
  for (const p of o.patches || []) {
    if (p[3] <= 0.004 || p[2] <= 1) continue;
    const g = c.createRadialGradient(p[0], p[1], 0, p[0], p[1], p[2]), col = trSkyAt(p[1]);
    g.addColorStop(0, rgba(col, p[3])); g.addColorStop(0.55, rgba(col, p[3] * 0.72)); g.addColorStop(1, rgba(col, 0));
    c.fillStyle = g; c.beginPath(); c.arc(p[0], p[1], p[2], 0, 7); c.fill();
  }
  if (blue > 0.004) { c.globalAlpha = blue; c.fillStyle = trGrad(c, SKY_DAY); c.fillRect(X0, Y0, S, S); c.globalAlpha = 1; }
  if (dusk > 0.004) { c.globalAlpha = dusk; c.fillStyle = trGrad(c, SKY_DUSK); c.fillRect(X0, Y0, S, S); c.globalAlpha = 1; }
}

// the sun. In a black sky it is a hard white disc with spikes; in air it glows; low and red at sunset.
function trSun(cam, t, o = {}) {
  const blue = clamp(o.blue === undefined ? 1 : o.blue), dusk = clamp(o.dusk || 0), k = o.k === undefined ? 1 : o.k;
  if (k <= 0.01) return;
  const [x, y] = o.at || TR.sun, c = ctx;
  applyCam(cam);
  const r = (o.r || 44) * (1 + 0.3 * dusk), core = dusk > 0.5 ? '#FFD890' : '#FFFDF2';
  const halo = dusk > 0.5 ? '#FF8A3A' : blue > 0.5 ? '#FFF1B8' : '#FFFFFF', bare = (1 - blue) * (1 - dusk), gl = o.glow === undefined ? 1 : o.glow;
  // in air the light spreads into a soft halo; with no air there is only the disc and its spikes
  softDot(c, x, y, r * (2.6 + 1.5 * blue + 1.6 * dusk), halo, (0.1 + 0.26 * blue + 0.3 * dusk) * k * gl);
  softDot(gctx, x, y, r * (1.7 + 0.8 * blue + 1.2 * dusk), halo, (0.22 + 0.08 * (1 - bare)) * k * gl);
  paint(() => {
    // spikes: long and thin where there is no air
    const n = 8, L = r * (2.3 + 2.2 * (1 - blue) * (1 - dusk));
    c.save(); c.translate(x, y); c.rotate(0.2 + 0.05 * Math.sin(t * loopW(0.6)));
    for (let i = 0; i < n; i++) {
      c.rotate(Math.PI * 2 / n);
      const g = c.createLinearGradient(0, 0, L, 0); g.addColorStop(0, rgba(halo, 0.85 * k)); g.addColorStop(1, rgba(halo, 0));
      c.fillStyle = g; c.beginPath(); c.moveTo(r * 0.6, -r * 0.16); c.lineTo(L * (i % 2 ? 0.62 : 1), 0); c.lineTo(r * 0.6, r * 0.16); c.closePath(); c.fill();
    }
    c.restore();
    circle(c, x, y, r, rgba(core, k));
  });
  circle(gctx, x, y, r * 0.9, rgba(dusk > 0.5 ? '#FF9A3C' : '#FFF6D8', 0.7 * k * gl));
  if (o.rays !== 0) sunRays(x, y, (o.rays === undefined ? 0.8 : o.rays) * k);
}

// a cloud: a row of puffs on a flat base (it pops in with k)
function trCloud(c, x, y, s, k, col, shade) {
  if (k <= 0.01) return;
  const e = E.outBack(clamp(k), 1.6);
  c.save(); c.translate(x, y); c.scale(s * e, s * e);
  c.fillStyle = shade;
  c.beginPath(); c.ellipse(0, 12, 150, 30, 0, 0, 7); c.fill();
  c.fillStyle = col;
  for (const [px, py, r] of [[-96, 0, 44], [-44, -30, 58], [22, -40, 66], [84, -10, 50], [130, 6, 30], [-140, 8, 26]]) { c.beginPath(); c.arc(px, py, r, 0, 7); c.fill(); }
  c.beginPath(); c.rect(-140, -6, 270, 30); c.fill();
  c.restore();
}
const TR_CLOUDS = [[150, 770, 0.92, 0.0], [690, 1010, 0.6, 0.18], [1010, 830, 0.8, 0.3], [-120, 1150, 0.7, 0.1], [330, 330, 1.1, 0.24], [330, 1190, 0.5, 0.36]];
function trClouds(cam, t, o = {}) {
  const k = o.k === undefined ? 1 : o.k, dusk = clamp(o.dusk || 0);
  if (k <= 0.01) return;
  applyCam(cam);
  const col = mixH('#FFFFFF', '#FFB07A', dusk), shade = mixH('#D5E6FA', '#B4588A', dusk);
  TR_CLOUDS.forEach(([x, y, s, d], i) => {
    const dx = 26 * Math.sin(t * loopW(0.11) + i * 1.7);
    trCloud(ctx, x + dx, y, s, clamp((k - d) / (1 - d + 1e-6) * 1.6), col, shade);
  });
}

// ridges, far to near. blue 0 = lit like the Moon (no haze), 1 = hazy with distance; dusk = purple silhouettes
function trRidges(cam, t, o = {}) {
  const c = ctx, blue = clamp(o.blue === undefined ? 1 : o.blue), dusk = clamp(o.dusk || 0);
  applyCam(cam);
  const DAY = ['#7FA9DC', '#5682B4', '#3E6B58'], BARE = ['#77808F', '#59626F', '#3D4947'], EVE = ['#8A4C7C', '#58305F', '#2C1D3D'];
  TR_RIDGES.forEach((R, i) => {
    const col = mixH(mixH(BARE[i], DAY[i], blue), EVE[i], dusk);
    c.fillStyle = col;
    c.beginPath(); c.moveTo(-1200, 2400);
    for (const p of R.pts) c.lineTo(p[0], p[1]);
    c.lineTo(2300, 2400); c.closePath(); c.fill();
    if (R.snow > 0.25 && dusk < 0.6) paint(() => {       // snow on the highest peaks
      c.fillStyle = rgba('#F4F8FF', 0.9 * (1 - dusk));
      for (let j = 0; j < R.pts.length; j += 2) {
        const p = R.pts[j];
        if (R.y0 - p[1] < R.amp * 0.62) continue;
        const h = (R.y0 - p[1]) * R.snow * 0.5;
        c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(p[0] + h * 0.9, p[1] + h); c.lineTo(p[0] + h * 0.3, p[1] + h * 0.72); c.lineTo(p[0] - h * 0.1, p[1] + h * 1.05);
        c.lineTo(p[0] - h * 0.5, p[1] + h * 0.7); c.lineTo(p[0] - h * 0.85, p[1] + h * 0.95); c.closePath(); c.fill();
      }
    });
  });
}

// the ledge he stands on (drawn before him), and the grass in front of his boots (drawn after)
function trLedge(cam, t, o = {}) {
  const c = ctx, blue = clamp(o.blue === undefined ? 1 : o.blue), dusk = clamp(o.dusk || 0);
  applyCam(cam);
  const top = mixH(mixH('#8B8478', '#9A8468', blue), '#4A2E45', dusk), body = mixH(mixH('#5E5A55', '#6A5646', blue), '#2A1930', dusk);
  const Y = TR.hy + 22;
  c.fillStyle = body;
  c.beginPath(); c.moveTo(-900, Y + 18); c.lineTo(-300, Y + 6); c.lineTo(160, Y); c.lineTo(760, Y + 4); c.lineTo(1010, Y + 26); c.lineTo(1500, Y + 60); c.lineTo(2100, Y + 130);
  c.lineTo(2100, 2700); c.lineTo(-900, 2700); c.closePath(); c.fill();
  c.fillStyle = top;
  c.beginPath(); c.moveTo(-900, Y + 18); c.lineTo(-300, Y + 6); c.lineTo(160, Y); c.lineTo(760, Y + 4); c.lineTo(1010, Y + 26); c.lineTo(1500, Y + 60); c.lineTo(2100, Y + 130);
  c.lineTo(2100, Y + 170); c.lineTo(1480, Y + 96); c.lineTo(1000, Y + 60); c.lineTo(740, Y + 40); c.lineTo(160, Y + 34); c.lineTo(-300, Y + 44); c.lineTo(-900, Y + 60); c.closePath(); c.fill();
  paint(() => {                                                      // a worn path and loose stones
    c.fillStyle = rgba(mixH(mixH('#A59D90', '#C2A77E', blue), '#6A4560', dusk), 0.8);
    c.beginPath(); c.moveTo(250, Y + 6); c.lineTo(690, Y + 8); c.lineTo(900, Y + 150); c.lineTo(1300, Y + 520); c.lineTo(-100, Y + 520); c.lineTo(120, Y + 150); c.closePath(); c.fill();
    for (let i = 0; i < 26; i++) {
      const x = -260 + 1640 * hash(i * 2.3 + 1), y = Y + 26 + 430 * hash(i * 5.1 + 2), r = 6 + 16 * hash(i + 9);
      ellipse(c, x, y, r * 1.5, r * 0.7, rgba(mixH(mixH('#4A4743', '#55432F', blue), '#201428', dusk), 0.75));
    }
  });
  // a cairn on the right, a trail post on the left
  const st = mixH(mixH('#8E8A86', '#A39483', blue), '#3A2440', dusk), st2 = mixH(mixH('#6F6B69', '#857564', blue), '#2C1A33', dusk);
  [[792, Y - 12, 44, 17, st2], [788, Y - 40, 35, 14, st], [795, Y - 63, 26, 11, st2], [790, Y - 81, 16, 8, st]].forEach(([x, y, rx, ry, col]) => ellipse(c, x, y, rx, ry, col));
  const wood = mixH(mixH('#6B5E55', '#7B5B3C', blue), '#2A1730', dusk), wood2 = mixH(mixH('#8C8076', '#A67B4F', blue), '#3A2140', dusk);
  c.fillStyle = wood; c.fillRect(142, Y - 190, 14, 196);
  c.fillStyle = wood2; c.beginPath(); c.moveTo(96, Y - 182); c.lineTo(214, Y - 182); c.lineTo(236, Y - 160); c.lineTo(214, Y - 138); c.lineTo(96, Y - 138); c.closePath(); c.fill();
  paint(() => {
    c.font = '900 22px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = rgba('#2B1B12', 0.85);
    c.fillText('SUMMIT', 160, Y - 159);
  });
}
function trGrass(cam, t, o = {}) {
  const c = ctx, blue = clamp(o.blue === undefined ? 1 : o.blue), dusk = clamp(o.dusk || 0);
  applyCam(cam);
  const g1 = mixH(mixH('#55695A', '#4F9A4C', blue), '#2B2140', dusk), g2 = mixH(mixH('#6F8372', '#7CC25B', blue), '#3B2B52', dusk);
  const Y = TR.hy + 30;
  paint(() => {
    for (const tf of TR_TUFTS) {
      if (Math.abs(tf.x - TR.hx) < 62) continue;                   // not across his boots
      for (let i = 0; i < tf.n; i++) {
        const a = (i - (tf.n - 1) / 2) * 0.34 + 0.1 * Math.sin(t * loopW(1.4) + tf.ph + i);
        line(c, tf.x + i * 5, Y + 6, tf.x + i * 5 + Math.sin(a) * tf.h, Y + 6 - Math.cos(a) * tf.h, 5, i % 2 ? g1 : g2);
      }
    }
  });
}

// ---------------------------------------------------------------- the bottle
// rim-centre origin (the nozzle), the body runs toward +y; `rot` turns it; the water stays level whatever the tilt
const BTL = [[-23, 34], [23, 34], [24, 150], [18, 158], [-18, 158], [-24, 150]];
function btlClip(poly, g, cut) {          // the part of poly where p . g >= cut (the water lies on the low side)
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length], da = a[0] * g[0] + a[1] * g[1] - cut, db = b[0] * g[0] + b[1] * g[1] - cut;
    if (da >= 0) out.push(a);
    if ((da >= 0) !== (db >= 0)) { const u = da / (da - db); out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]); }
  }
  return out;
}
function wtrBottle(c, x, y, s, rot, t, o = {}) {
  const level = clamp(o.level === undefined ? 0.6 : o.level);
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  const ga = rot + (o.slosh || 0), g = [Math.sin(ga), Math.cos(ga)];
  const quad = () => { c.beginPath(); BTL.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.closePath(); };
  // the body (clear plastic, tinted), the water in it
  quad(); c.fillStyle = o.body || '#CDEBF4'; c.fill();
  const dots = BTL.map((p) => p[0] * g[0] + p[1] * g[1]), mx = Math.max(...dots), mn = Math.min(...dots), cut = mx - level * (mx - mn);
  const liq = level > 0.01 ? btlClip(BTL, g, cut) : [];
  if (liq.length > 2) paint(() => {
    c.beginPath(); liq.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.closePath();
    c.fillStyle = o.water || '#39A5E6'; c.fill();
    c.save(); c.clip();
    for (let i = 0; i < 9; i++) {                                   // bubbles rise against gravity (glug)
      const u = (hash(i * 1.7) + t * (0.7 + 0.8 * hash(i + 7))) % 1, v = -18 + 36 * hash(i * 3.1 + 1), d = mx - u * (mx - cut);
      circle(c, g[0] * d + g[1] * v, g[1] * d - g[0] * v, 2 + 2.6 * hash(i + 11), rgba('#E9F8FF', 0.8 * (o.fizz === undefined ? 1 : o.fizz)));
    }
    c.restore();
  });
  paint(() => { line(c, -15, 46, -16, 138, 5, 'rgba(255,255,255,0.75)'); });
  // the shoulder, the cap and the nozzle
  c.fillStyle = o.cap || '#1CB3A4';
  c.beginPath(); c.moveTo(-23, 36); c.lineTo(-17, 18); c.lineTo(17, 18); c.lineTo(23, 36); c.closePath(); c.fill();
  rrect(c, -19, 10, 38, 12, 4); c.fillStyle = o.capDk || '#117F74'; c.fill();
  rrect(c, -8, -4, 16, 16, 5); c.fillStyle = '#F4F7FB'; c.fill();
  rrect(c, -25, 118, 50, 14, 3); c.fillStyle = o.cap || '#1CB3A4'; c.fill();
  c.restore();
}
function trFist(c, x, y, pal, rot) {       // his fingers round the bottle
  circle(c, x, y, 23, pal.skin);
  paint(() => {
    c.save(); c.translate(x, y); c.rotate(rot);
    for (let i = -1; i <= 1; i++) line(c, -17, i * 10, 15, i * 10, 2.4, rgba(pal.skinSh, 0.85));
    c.restore();
  });
}

// ---------------------------------------------------------------- him
const SUITPAL = Object.assign({}, PAL, { coat: '#ECEFF6', coatSh: '#B7BED2', coatHi: '#FFFFFF', coatDk: '#8D95B0', strap: '#F0662E', strapSh: '#B8451A',
  pants: '#DDE1EC', pantsSh: '#A9B0C6', shoe: '#9AA2BC', shoeSh: '#6E7692', sole: '#4B526A' });
const TRFACE = {
  sip: { eyeOpen: 1, pupil: 1, lookX: 0.5, lookY: -0.6, browY: 0.5, browTilt: -0.1, mouth: 'flat', mouthOpen: 0, blink: 1, cross: 0 },
  huh: { eyeOpen: 1.42, pupil: 0.5, lookX: 0.25, lookY: -1, browY: 1.6, browTilt: 0.5, mouth: 'flat', mouthOpen: 0, blink: 0, cross: 0 },
  up: { eyeOpen: 1.25, pupil: 0.7, lookX: 0.35, lookY: -1, browY: 1.2, browTilt: 0.4, mouth: 'flat', mouthOpen: 0, blink: 0, cross: 0 },
  hold: { eyeOpen: 1.12, pupil: 0.85, lookX: 0, lookY: -0.1, browY: 0.9, browTilt: 0.6, mouth: 'flat', mouthOpen: 0, blink: 0, cross: 0 },
  us: { eyeOpen: 1.1, pupil: 0.9, lookX: 0, lookY: 0.1, browY: 0.6, browTilt: 0.3, mouth: 'flat', mouthOpen: 0, blink: 0, cross: 0 },
  ahh: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 0.7, browTilt: -0.2, mouth: 'grin', mouthOpen: 0.9, blink: 1, cross: 0 },
};
// the arm that always keeps its elbow out to its own side (no flip when the hand passes the shoulder line)
function trReach(pose, side, target) {
  const a = ikReach(pose, side, target, 1), b = ikReach(pose, side, target, -1), s = side === 'R' ? 1 : -1;
  return s * rig(a)['el' + side][0] >= s * rig(b)['el' + side][0] ? a : b;
}
// rig-local helpers for his head
function trHeadLocal(st, pose) { const r = rig(pose); return { hd: [r.head[0] + (st.headDX || 0), r.head[1] + (st.headDY || 0)], hr: pose.lean + (st.headRot || 0) }; }
function trHeadSpace(c, H, fn) { c.save(); c.translate(H.hd[0], H.hd[1]); c.rotate(H.hr); fn(c); c.restore(); }

// puffed cheeks and a shut mouth (head space): he is holding a mouthful
function trCheeks(c, k, pal, bob = 0, lips = 0) {
  if (k <= 0.02 && lips <= 0.02) return;
  paint(() => {
    if (k > 0.02) for (const s of [-1, 1]) {
      const x = s * (41 + 13 * k), y = 39 + 2 * bob, rx = 15 + 14 * k, ry = 14 + 10 * k;      // low on the face, under the ears: hamster cheeks
      const col = mixH(pal.skin, pal.skinSh, s < 0 ? 0.62 : 0.92);     // the head is a gradient, lighter on his right: match it
      ellipse(c, x, y, rx, ry, col);
      ellipse(c, x + s * 2, y + 5, rx * 0.66, ry * 0.62, rgba('#FF6E5E', 0.26 * k));
      c.beginPath(); c.ellipse(x, y, rx, ry, 0, s > 0 ? -1.15 : Math.PI - 1.35, s > 0 ? 1.35 : Math.PI + 1.15); c.lineWidth = 3.4; c.lineCap = 'round'; c.strokeStyle = rgba('#A9603F', 0.8 * k); c.stroke();
      ellipse(c, x - 5, y - 8, rx * 0.26, ry * 0.18, rgba('#FFFFFF', 0.3 * k), -0.4);
    }
    if (lips > 0.02) { ellipse(c, 0, 40, 13, 10, pal.mouth); return; }   // lips round the nozzle
    if (k > 0.3) {                                                       // the mouth, pressed shut on a mouthful
      ellipse(c, 0, 40, 17, 10, mixH(pal.skin, pal.skinSh, 0.6));
      c.beginPath(); c.moveTo(-10, 41); c.quadraticCurveTo(0, 36.5, 10, 41); c.lineWidth = 5; c.lineCap = 'round'; c.strokeStyle = pal.mouth; c.stroke();
    }
  });
}
// a space helmet (head space): a glass bubble and a collar
function trHelmet(c, k = 1) {
  if (k <= 0.02) return;
  rrect(c, -62, 62, 124, 26, 12); c.fillStyle = '#C3C9DA'; c.fill();
  rrect(c, -62, 62, 124, 9, 5); c.fillStyle = '#E9EDF6'; c.fill();
  paint(() => {
    c.beginPath(); c.arc(0, -8, 98, 0, 7); c.fillStyle = 'rgba(190,225,255,0.13)'; c.fill();
    c.lineWidth = 6; c.strokeStyle = 'rgba(235,245,255,0.9)'; c.stroke();
    c.beginPath(); c.arc(0, -8, 84, Math.PI * 1.08, Math.PI * 1.42); c.lineWidth = 9; c.lineCap = 'round'; c.strokeStyle = 'rgba(255,255,255,0.7)'; c.stroke();
    c.beginPath(); c.arc(0, -8, 84, Math.PI * 1.5, Math.PI * 1.56); c.stroke();
  });
}

// him, from a description. A: {x, y, s, face, headDX, headDY, headRot, lean, drink 0..1 (the bottle at his mouth), gulp
// (-1..1, the bottle and his head bob), cheeks 0..1, level (water in the bottle), hold: [x, y] + holdRot (where the bottle
// rests when he is not drinking), armL: [x, y] | null, suit (a spacesuit and a helmet), pal, noBottle, post: fn(lc, H)}
function trHero(cam, t, A = {}) {
  const pal = A.pal || (A.suit ? SUITPAL : PAL), GD = 98;
  const st = { x: A.x === undefined ? TR.hx : A.x, y: A.y === undefined ? TR.hy : A.y, s: A.s === undefined ? TR.hs : A.s, face: A.face || FACES.calm,
    headDX: A.headDX || 0, headDY: A.headDY || 0, headRot: A.headRot || 0 };
  let pose = JSON.parse(JSON.stringify(POSES.stand));
  pose.lean = A.lean || 0; pose.hipY += A.bob || 0;
  const H = trHeadLocal(st, pose), mouth = [H.hd[0] - 40 * Math.sin(H.hr), H.hd[1] + 40 * Math.cos(H.hr)];
  const e = A.drinkE !== undefined ? A.drinkE : E.inOutSine(clamp(A.drink || 0));
  const hold = A.hold || [132, -322], hrot = A.holdRot === undefined ? -0.3 : A.holdRot;
  const crot = -2.02 + 0.06 * (A.gulp || 0), crim = [mouth[0] + 1, mouth[1] + 1], cw = [crim[0] - GD * Math.sin(crot), crim[1] + GD * Math.cos(crot)];
  const rot = lerp(hrot, crot, e);
  const hrim = [hold[0] + GD * Math.sin(hrot), hold[1] - GD * Math.cos(hrot)];
  const rim = [lerp(hrim[0], crim[0], e) + 26 * Math.sin(Math.PI * e), lerp(hrim[1], crim[1], e)];
  const wrist = [rim[0] - GD * Math.sin(rot), rim[1] + GD * Math.cos(rot)];
  if (!A.noBottle) pose = trReach(pose, 'R', wrist);
  if (A.armL) pose = trReach(pose, 'L', A.armL);
  else pose.armL = { a: 0.2 + (A.flinch || 0) * 0.5, b: 0.14 + (A.flinch || 0) * 0.9 };
  const r = charLayer(cam, Object.assign({}, st, { pose }), t, { pal, ambient: A.ambient, post: (lc, rr) => {
    lc.save(); lc.translate(st.x, st.y); lc.scale(st.s, st.s);
    trHeadSpace(lc, H, (c) => { trCheeks(c, A.cheeks || 0, pal, A.gulp || 0, e > 0.86 ? 1 : 0); if (A.suit) trHelmet(c, 1); });
    if (!A.noBottle) {
      wtrBottle(lc, rim[0], rim[1], 1, rot, t, { level: A.level, slosh: A.slosh, fizz: A.fizz });
      trFist(lc, rr.wrR[0], rr.wrR[1], pal, rot);
    }
    if (A.post) A.post(lc, { H, mouth, rim, rot, rr });
    lc.restore();
  } });
  const wp = (p) => [st.x + p[0] * st.s, st.y + p[1] * st.s];
  return { st, r, pose, head: wp(H.hd), mouth: wp(mouth), rim: wp(rim), wrist: wp(wrist), rot, H };
}

// the nozzle's place (rig-local) when the bottle is e of the way from its rest to his mouth, for a man standing still
function trRimAt(e, hold = [132, -322], hrot = -0.3) {
  const GD = 98, crim = [1, -429], hrim = [hold[0] + GD * Math.sin(hrot), hold[1] - GD * Math.cos(hrot)];
  return [lerp(hrim[0], crim[0], e) + 26 * Math.sin(Math.PI * e), lerp(hrim[1], crim[1], e)];
}
// drops of water flying off a point (world coords under the current camera): no glow, so they never hide a face
function trDrops(c, x, y, t0, t, n = 9, seed = 1, dir = 0.5, v0 = 260) {
  const d = t - t0;
  if (d < 0 || d > 0.8) return;
  const rng = mulberry32(seed);
  paint(() => {
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + dir + (rng() - 0.5) * 1.5, v = v0 * (0.5 + rng());
      const px = x + Math.cos(a) * v * d, py = y + Math.sin(a) * v * d + 0.5 * 900 * d * d, r = 3 + 4.5 * rng(), al = clamp(1 - d / 0.75);
      circle(c, px, py, r, rgba('#7FD0FF', 0.95 * al)); circle(c, px - r * 0.3, py - r * 0.3, r * 0.36, rgba('#FFFFFF', al));
    }
  });
}

// the whole place. o: {cam, A, blue, dusk, patches, clouds, sun: {at, k, rays} | false, behind: fn, after: fn(Hero)}
function trailDraw(t, o) {
  const cam = o.cam, blue = o.blue === undefined ? 1 : o.blue, dusk = o.dusk || 0;
  trSky(cam, t, { blue, dusk, patches: o.patches, stars: o.stars });
  if (o.sun !== false) trSun(cam, t, Object.assign({ blue, dusk }, o.sun || {}));
  if (o.sky) { applyCam(cam); o.sky(); }
  trClouds(cam, t, { k: o.clouds === undefined ? blue : o.clouds, dusk });
  trRidges(cam, t, { blue, dusk });
  trLedge(cam, t, { blue, dusk });
  if (o.behind) { applyCam(cam); o.behind(); }
  const Hh = o.A === false ? null : trHero(cam, t, o.A || {});
  trGrass(cam, t, { blue, dusk });
  applyCam(cam);
  if (o.after) o.after(Hh);
  return Hh;
}
