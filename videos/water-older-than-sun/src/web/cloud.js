// The freezing dark cloud before the Sun (water-older-than-sun, 7 Nov 2026), and the props of this Short.
// World = 1080x1920 at zoom 1. The cloud is three painted layers of dust (far, mid, a dark lane) drawn with parallax,
// a few dim reddened stars, drifting ice grains at three depths (far glints, mid crystals, near out-of-focus crystals
// drawn after the hero), and a thin cold mist. Props: the baby Sun (a glowing ball with a bonnet and a dummy), a
// bathroom scale with a dial (OK / HEAVY), a water molecule as a character with ONE heavy hydrogen (an extra ball
// stuck on it), a sticky note, a long white beard (head space), the starry water that fills him, a cold tag.
'use strict';

let CL_FAR = null, CL_MID = null, CL_STARS = null, CL_GRAINS = null;
const CL_FAR_S = 0.5;                       // the painted layers are at half resolution
const CL_BOX = [-700, -900, 2480, 3720];   // the world area the painted layers cover: x0, y0, w, h

function clPaintDust(w, h, seed, n, cols, aMin, aMax, rMin, rMax, rim) {
  const cv = mkCanvas(Math.round(w * CL_FAR_S), Math.round(h * CL_FAR_S)), c = cv.getContext('2d');
  const rng = mulberry32(seed);
  c.scale(CL_FAR_S, CL_FAR_S);
  for (let i = 0; i < n; i++) {
    const x = rng() * w, y = rng() * h, r = rMin + (rMax - rMin) * rng() * rng();
    const col = cols[Math.floor(rng() * cols.length)];
    softDot(c, x, y, r, col, aMin + (aMax - aMin) * rng());
    if (rim && rng() < 0.35) {        // a lit edge: the faint light of far stars on the top of a billow
      const g = c.createRadialGradient(x - r * 0.25, y - r * 0.35, r * 0.55, x, y, r);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.82, rgba(rim, 0.07 + 0.08 * rng())); g.addColorStop(1, rgba(rim, 0));
      c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
    }
  }
  return cv;
}

// the dark walls of the cloud, painted from noise at a quarter of the size: dense dust is near-black, its edges that
// face the faint light (upper left) catch a cold silver rim, and a hollow round (hx, hy) stays clear for him
const CL_Q = 0.25;
function clPaintNebula(w, h, seed, hx, hy, hr) {
  const cw = Math.round(w * CL_Q), ch = Math.round(h * CL_Q), cv = mkCanvas(cw, ch), c = cv.getContext('2d');
  const img = c.createImageData(cw, ch), px = img.data;
  const [x0, y0] = CL_BOX;
  const dens = (x, y) => {
    const wx = 120 * snFbm(x / 900, y / 900, 0, seed + 7, 3);
    const n = snFbm((x + wx) / 560, (y - wx) / 560, 0, seed, 5) * 0.5 + 0.5;
    const d = Math.hypot((x - hx) / hr, (y - hy) / (hr * 1.25));
    const hollow = 0.55 * Math.exp(-d * d * 1.1);
    return clamp((n - 0.30 - hollow) * 2.6);
  };
  for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) {
    const x = x0 + i / CL_Q, y = y0 + j / CL_Q;
    const d = dens(x, y), dl = dens(x - 70, y - 90);
    const rim = clamp((d - dl) * 2.2) * (1 - 0.4 * d);
    const k = (j * cw + i) * 4;
    // dark dust over the glow, a silver rim on its lit side, a faint violet in the thin parts
    const a = clamp(d * 1.05);
    const r = lerp(16, 5, d) + 150 * rim, g = lerp(12, 4, d) + 185 * rim, bb = lerp(34, 12, d) + 250 * rim;
    px[k] = Math.min(255, r); px[k + 1] = Math.min(255, g); px[k + 2] = Math.min(255, bb);
    px[k + 3] = Math.round(255 * clamp(Math.max(a, rim * 0.85)));
  }
  c.putImageData(img, 0, 0);
  return cv;
}
function initCloud() {
  const [x0, y0, w, h] = CL_BOX;
  // the far glow: the cloud's own gas, faintly lit by stars outside it (blue, violet, a little teal), and far stars
  CL_FAR = mkCanvas(Math.round(w * CL_FAR_S), Math.round(h * CL_FAR_S));
  {
    const c = CL_FAR.getContext('2d'), rng = mulberry32(51);
    c.scale(CL_FAR_S, CL_FAR_S);
    for (let i = 0; i < 90; i++) {
      const x = rng() * w, y = rng() * h, r = 200 + 520 * rng();
      softDot(c, x, y, r, ['#2C3C8C', '#4B2C7E', '#1E5E86', '#3A3A9A', '#5A2E6E'][Math.floor(rng() * 5)], 0.18 + 0.22 * rng());
    }
    // a brighter hollow where he floats (world 300-800 x 600-1500 is the middle of the box at x0, y0)
    softDot(c, 540 - x0, 1000 - y0, 760, '#5A78D8', 0.42);
    softDot(c, 420 - x0, 860 - y0, 480, '#9DB2F0', 0.30);
    softDot(c, 700 - x0, 1180 - y0, 420, '#7A4FC0', 0.26);
    softDot(c, 300 - x0, 1250 - y0, 360, '#2F9DB0', 0.18);
    for (let i = 0; i < 700; i++) {
      const x = rng() * w, y = rng() * h, r = 0.8 + 2.2 * rng() * rng();
      c.fillStyle = rgba(['#FFFFFF', '#CFE0FF', '#FFE2C8'][i % 3], 0.35 + 0.5 * rng()); c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
    }
  }
  // the dark walls of the cloud round the hollow where he floats
  CL_MID = clPaintNebula(w, h, 77, 540, 1000, 430);
  const rng = mulberry32(919);
  CL_STARS = [...Array(150)].map(() => ({ x: -500 + rng() * 2100, y: -700 + rng() * 3300, r: 0.9 + rng() * 2.2, a: 0.25 + rng() * 0.6,
    col: ['#FFD9B8', '#FFC79E', '#E8EEFF', '#FFB38A'][Math.floor(rng() * 4)], ph: rng() * 6.28, w: 0.6 + rng() * 1.8 }));
  CL_GRAINS = [0, 1, 2].map((band) => [...Array([90, 46, 16][band])].map(() => ({
    x: -400 + rng() * 1900, y: -300 + rng() * 2600, s: [0.35, 0.7, 1.6][band] * (0.7 + 0.6 * rng()), rot: rng() * 6.28, spin: (rng() - 0.5) * 1.2,
    vx: (rng() - 0.5) * 22, vy: -8 - rng() * 22, ph: rng() * 6.28, tw: 1.5 + rng() * 3 })));
}

function clLayerCam(cam, p) { return parallax(cam, p); }
function clDrawPainted(cv, cam, p, dx = 0, dy = 0) {
  const lc = clLayerCam(cam, p);
  applyCam(lc);
  const [x0, y0, w, h] = CL_BOX;
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
  ctx.drawImage(cv, x0 + dx, y0 + dy, w, h);
}

// one ice grain: a little six-armed crystal with a glint (it catches a cold light from the upper left)
function clCrystal(c, x, y, s, rot, glint, col = '#D8F6FF') {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.fillStyle = col;
  c.beginPath();
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; c.lineTo(Math.cos(a) * 9, Math.sin(a) * 9); }
  c.closePath(); c.fill();
  c.lineCap = 'round'; c.strokeStyle = col; c.lineWidth = 3.2;
  for (let i = 0; i < 6; i++) {
    const a = i * Math.PI / 3 + Math.PI / 6;
    c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * 17, Math.sin(a) * 17); c.stroke();
    c.beginPath(); c.moveTo(Math.cos(a) * 10, Math.sin(a) * 10); c.lineTo(Math.cos(a + 0.5) * 14, Math.sin(a + 0.5) * 14); c.stroke();
  }
  if (glint > 0.02) { c.fillStyle = rgba('#FFFFFF', glint); c.beginPath(); c.arc(-3, -3, 3.4, 0, 7); c.fill(); }
  c.restore();
}

// the cloud. o: {k (how much of it shows, 0..1), drift (seconds of drift), near: false to skip the near grains here}
function clBg(cam, t, o = {}) {
  const k = o.k === undefined ? 1 : o.k;
  screenSpace();
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#06040F'); g.addColorStop(0.45, '#0D0A1E'); g.addColorStop(1, '#070C1A');
  ctx.globalAlpha = k; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
  if (k < 0.02) return;
  // far stars, reddened by the dust
  applyCam(clLayerCam(cam, 0.12));
  paint(() => {
    for (const s of CL_STARS) {
      const tw = 0.7 + 0.3 * Math.sin(t * loopW(s.w) + s.ph);
      circle(ctx, s.x, s.y, s.r, rgba(s.col, s.a * tw * k));
    }
  });
  const dr = o.drift === undefined ? t : o.drift;
  ctx.globalAlpha = k;
  clDrawPainted(CL_FAR, cam, 0.3, -4 * dr, -2 * dr);
  ctx.globalAlpha = k;
  clDrawPainted(CL_MID, cam, 0.6, 7 * dr, -4 * dr);
  ctx.globalAlpha = 1;
  // a faint cold glow far off (a star still outside the cloud), upper left
  applyCam(clLayerCam(cam, 0.3));
  softDot(ctx, 180, 220, 620, '#3E5BA8', 0.16 * k);
  softDot(gctx, 180, 220, 380, '#5C7FD8', 0.10 * k);
  // the far and mid grains
  clGrains(cam, t, 0, k, dr); clGrains(cam, t, 1, k, dr);
  // a thin cold mist
  applyCam(clLayerCam(cam, 0.7));
  for (let i = 0; i < 9; i++) {
    const x = (i * 263 + 40 * Math.sin(dr * 0.2 + i)) % 1400 - 100, y = 300 + ((i * 431) % 1500);
    softDot(ctx, x, y, 260 + 60 * (i % 3), '#7FA6D8', 0.05 * k);
  }
}
// grains of one depth band (0 far glints, 1 mid crystals, 2 near and big, drawn after the hero)
function clGrains(cam, t, band, k = 1, dr = t, skip = null) {
  const p = [0.5, 0.85, 1.45][band];
  const lc = clLayerCam(cam, p);
  applyCam(lc);
  paint(() => {
    for (const gr of CL_GRAINS[band]) {
      let x = gr.x + gr.vx * dr, y = gr.y + gr.vy * dr;
      x = ((x + 400) % 1900 + 1900) % 1900 - 400; y = ((y + 300) % 2600 + 2600) % 2600 - 300;
      if (skip && skip(x, y, lc)) continue;
      const tw = 0.5 + 0.5 * Math.sin(t * gr.tw + gr.ph);
      if (band === 0) { circle(ctx, x, y, 2.2 * gr.s * 3, rgba('#CFEFFF', 0.55 * k * (0.5 + 0.5 * tw))); continue; }
      const a = band === 2 ? 0.55 : 0.9;
      ctx.globalAlpha = a * k;
      clCrystal(ctx, x, y, gr.s, gr.rot + gr.spin * dr, tw * 0.9, band === 2 ? '#BFE6FF' : '#D8F6FF');
      ctx.globalAlpha = 1;
      if (tw > 0.85) softDot(gctx, x, y, 26 * gr.s, '#BFEFFF', 0.5 * k * (tw - 0.85) / 0.15);
    }
  });
}

// ---------------------------------------------------------------- the baby Sun
// o: {k (pop 0..1), shake (radians of head shake), face: 'sleep' | 'nope' | 'pout', bonnet: true, dummy: true}
function clBabySun(c, x, y, r, t, o = {}) {
  const k = o.k === undefined ? 1 : o.k;
  if (k <= 0.01) return;
  const e = E.outBack(clamp(k), 1.8);
  // glow first, so the ball sits in it
  softDot(gctx, x, y, r * 2.4 * e, '#FFB347', 0.32 * e);
  softDot(c, x, y, r * 2.2 * e, '#FF9A3C', 0.22 * e);
  // a dark disc in the glow layer where the face is, so the bloom rings it instead of washing it out
  circle(gctx, x, y, r * 0.86 * e, 'rgba(0,0,0,1)');
  c.save(); c.translate(x, y); c.rotate(o.shake || 0); c.scale(e, e);
  // flares round it (short soft flames)
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6 + 0.12 * Math.sin(t * 3 + i), L = r * (1.22 + 0.1 * Math.sin(t * 5 + i * 2));
    c.fillStyle = i % 2 ? '#FFB13B' : '#FFC94D';
    c.beginPath(); c.moveTo(Math.cos(a - 0.2) * r * 0.9, Math.sin(a - 0.2) * r * 0.9); c.lineTo(Math.cos(a) * L, Math.sin(a) * L);
    c.lineTo(Math.cos(a + 0.2) * r * 0.9, Math.sin(a + 0.2) * r * 0.9); c.closePath(); c.fill();
  }
  const g = c.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r);
  g.addColorStop(0, '#FFF6C8'); g.addColorStop(0.6, '#FFD15A'); g.addColorStop(1, '#FFA92E');
  c.fillStyle = g; c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill();
  paint(() => {
    const f = o.face || 'sleep';
    c.lineCap = 'round'; c.strokeStyle = '#8A3B12'; c.lineWidth = r * 0.07;
    if (f === 'sleep') {
      for (const s of [-1, 1]) { c.beginPath(); c.arc(s * r * 0.34, -r * 0.08, r * 0.15, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke(); }
    } else {
      for (const s of [-1, 1]) {
        ellipse(c, s * r * 0.34, -r * 0.12, r * 0.13, r * 0.16, '#3A1606');
        circle(c, s * r * 0.34 - r * 0.04, -r * 0.17, r * 0.05, '#FFFFFF');
        // brows: cross for 'nope', worried for 'pout'
        c.beginPath();
        if (f === 'nope') { c.moveTo(s * r * 0.52, -r * 0.42); c.lineTo(s * r * 0.18, -r * 0.33); }
        else { c.moveTo(s * r * 0.5, -r * 0.33); c.lineTo(s * r * 0.2, -r * 0.42); }
        c.stroke();
      }
    }
    ellipse(c, -r * 0.55, r * 0.14, r * 0.13, r * 0.09, rgba('#FF6E5E', 0.45));
    ellipse(c, r * 0.55, r * 0.14, r * 0.13, r * 0.09, rgba('#FF6E5E', 0.45));
    if (o.dummy !== false) {                    // a dummy: shield, nipple hidden, a ring
      ellipse(c, 0, r * 0.32, r * 0.26, r * 0.15, '#3FC7C0');
      circle(c, 0, r * 0.32, r * 0.08, '#E9FFFD');
      c.beginPath(); c.arc(0, r * 0.47, r * 0.13, 0, 7); c.lineWidth = r * 0.05; c.strokeStyle = '#FF8FB0'; c.stroke();
    }
  });
  if (o.bonnet !== false) {                    // a little bonnet
    c.fillStyle = '#F5F2FF';
    c.beginPath(); c.arc(0, -r * 0.05, r * 1.06, Math.PI * 1.1, Math.PI * 1.9); c.lineTo(r * 0.9, -r * 0.2); c.quadraticCurveTo(0, -r * 0.62, -r * 0.9, -r * 0.2); c.closePath(); c.fill();
    paint(() => {
      c.strokeStyle = '#C8B8F0'; c.lineWidth = r * 0.04;
      c.beginPath(); c.arc(0, -r * 0.05, r * 0.98, Math.PI * 1.14, Math.PI * 1.86); c.stroke();
      ellipse(c, r * 0.95, -r * 0.18, r * 0.12, r * 0.08, '#FF8FB0');
    });
  }
  c.restore();
}

// ---------------------------------------------------------------- the bathroom scale
// (x, y) = the middle of its top surface; needle 0 = rest, 1 = deep in HEAVY; press 0..1 (the plate dips)
function clScale(c, x, y, s, needle, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const dip = 6 * (o.press || 0);
  // body
  rrect(c, -230, 10, 460, 92, 34); c.fillStyle = '#C9D3E6'; c.fill();
  rrect(c, -236, -8 + dip, 472, 40, 26); c.fillStyle = '#F2F6FF'; c.fill();
  rrect(c, -200, 0 + dip, 400, 14, 7); c.fillStyle = '#DCE4F4'; c.fill();
  // feet
  for (const fx of [-170, 170]) { rrect(c, fx - 30, 96, 60, 14, 6); c.fillStyle = '#7E89A6'; c.fill(); }
  c.restore();
}
// the dial, drawn as a round window on the front of the scale (screen-sized, so it reads): (x, y) its middle
function clDial(c, x, y, R, needle, t) {
  c.save(); c.translate(x, y);
  circle(c, 0, 0, R + 16, '#2B3352');
  circle(c, 0, 0, R, '#FDFBF4');
  paint(() => {
    // zones: OK (green) then HEAVY (red)
    const a0 = Math.PI * 1.15, a1 = Math.PI * 1.85, am = lerp(a0, a1, 0.66);
    c.lineWidth = R * 0.16;
    c.beginPath(); c.arc(0, 0, R * 0.8, a0, am); c.strokeStyle = '#6FD39A'; c.stroke();
    c.beginPath(); c.arc(0, 0, R * 0.8, am, a1); c.strokeStyle = '#FF5A6E'; c.stroke();
    c.lineWidth = R * 0.03; c.strokeStyle = '#2B3352';
    for (let i = 0; i <= 12; i++) {
      const a = lerp(a0, a1, i / 12), r0 = R * (i % 3 ? 0.66 : 0.6);
      c.beginPath(); c.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); c.lineTo(Math.cos(a) * R * 0.71, Math.sin(a) * R * 0.71); c.stroke();
    }
    c.font = `900 ${Math.round(R * 0.17)}px Montserrat`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = '#2E9A5E'; c.fillText('OK', -R * 0.42, R * 0.36);
    c.fillStyle = '#E0384D'; c.fillText('HEAVY', R * 0.34, R * 0.36);
    // the needle
    const a = lerp(a0 + 0.08, a1 - 0.08, clamp(needle)) + 0.03 * Math.sin(t * 40) * (needle > 0.05 && needle < 0.98 ? 1 : 0);
    c.lineCap = 'round';
    line(c, -Math.cos(a) * R * 0.12, -Math.sin(a) * R * 0.12, Math.cos(a) * R * 0.78, Math.sin(a) * R * 0.78, R * 0.06, '#E0384D');
    circle(c, 0, 0, R * 0.09, '#2B3352');
  });
  c.restore();
}

// ---------------------------------------------------------------- the water molecule, as a character
// (x, y) = the middle of the oxygen ball; r its radius. o: {suck 0..1 (belly in), face: 'proud' | 'oops' | 'strain',
// heavy 0..1 (the extra ball on the right hydrogen), legs: true, look [-1..1], bob}
function clMol(c, x, y, r, t, o = {}) {
  const suck = clamp(o.suck || 0), hv = clamp(o.heavy === undefined ? 1 : o.heavy);
  c.save(); c.translate(x, y + (o.bob || 0));
  const sx = 1 - 0.16 * suck, sy = 1 + 0.08 * suck;
  // legs (stubby) and feet
  if (o.legs !== false) for (const s of [-1, 1]) {
    line(c, s * r * 0.34, r * 0.8, s * r * 0.38, r * 1.22, r * 0.17, '#C23848');
    ellipse(c, s * r * 0.46, r * 1.26, r * 0.22, r * 0.11, '#8E2333');
  }
  // the hydrogens: left (light), right (heavy: bigger, with an extra ball stuck on it)
  const hL = [-r * 0.86, -r * 0.74], hR = [r * 0.88, -r * 0.76];
  line(c, -r * 0.4, -r * 0.35, hL[0], hL[1], r * 0.16, '#B9C3DE');
  line(c, r * 0.4, -r * 0.35, hR[0], hR[1], r * 0.16, '#B9C3DE');
  circle(c, hL[0], hL[1], r * 0.4, '#F4F6FF');
  const rh = r * (0.4 + 0.1 * hv);
  circle(c, hR[0], hR[1], rh, '#F4F6FF');
  if (hv > 0.02) {                               // the extra ball (what makes it heavy), stuck on top
    const e = E.outBack(hv, 2);
    circle(c, hR[0] + rh * 0.62, hR[1] - rh * 0.62, r * 0.28 * e, '#9AA6C4');
  }
  // the oxygen: a red ball with a face
  c.save();
  c.scale(sx, sy);
  const g = c.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r);
  g.addColorStop(0, '#FF8D99'); g.addColorStop(0.7, '#FF5A6E'); g.addColorStop(1, '#E2425A');
  c.fillStyle = g; c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill();
  c.restore();
  paint(() => {
    const f = o.face || 'proud', lk = (o.look || 0) * r * 0.06;
    for (const s of [-1, 1]) {
      ellipse(c, s * r * 0.3 + lk, -r * 0.12, r * 0.15, r * (f === 'strain' ? 0.06 : 0.19), '#FFFFFF');
      if (f !== 'strain') circle(c, s * r * 0.3 + lk * 2, -r * 0.1, r * 0.08, '#24121A');
    }
    c.lineCap = 'round'; c.strokeStyle = '#7A1626'; c.lineWidth = r * 0.07;
    c.beginPath();
    if (f === 'oops') { c.ellipse(0, r * 0.36, r * 0.12, r * 0.1, 0, 0, 7); }
    else if (f === 'strain') { c.moveTo(-r * 0.22, r * 0.36); c.lineTo(r * 0.22, r * 0.36); }
    else { c.arc(0, r * 0.22, r * 0.24, 0.15 * Math.PI, 0.85 * Math.PI); }
    c.stroke();
    if (f === 'strain') {                         // puffed cheeks: holding the breath
      ellipse(c, -r * 0.5, r * 0.22, r * 0.14, r * 0.12, rgba('#FFB0BC', 0.9));
      ellipse(c, r * 0.5, r * 0.22, r * 0.14, r * 0.12, rgba('#FFB0BC', 0.9));
    }
  });
  c.restore();
  return { hR: [x + hR[0], y + hR[1] + (o.bob || 0)], top: [x, y - r + (o.bob || 0)] };
}

// ---------------------------------------------------------------- small props
// a yellow sticky note with marker text, (x, y) its middle, w its width; k pops it in (it slaps on with a bounce)
function clNote(c, x, y, w, rot, k, txt, t) {
  if (k <= 0.01) return;
  const e = E.outBack(clamp(k), 2.4), sq = 1 + 0.18 * Math.sin(Math.min(1, k) * Math.PI) * (1 - clamp(k));
  c.save(); c.translate(x, y); c.rotate(rot + 0.25 * (1 - clamp(k * 1.4))); c.scale(e * sq, e / sq);
  c.fillStyle = '#FFE45C'; c.fillRect(-w / 2, -w * 0.42, w, w * 0.84);
  c.fillStyle = '#E6C437';
  c.beginPath(); c.moveTo(w / 2, w * 0.42 - w * 0.2); c.lineTo(w / 2 - w * 0.2, w * 0.42); c.lineTo(w / 2, w * 0.42); c.closePath(); c.fill();
  paint(() => {
    c.font = `400 ${Math.round(w * 0.22)}px Anton`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = '#2B2A6E';
    c.save(); c.rotate(-0.06); c.fillText(txt, 0, 0); c.restore();
    line(c, -w * 0.36, w * 0.18, w * 0.3, w * 0.2, w * 0.025, '#2B2A6E');
  });
  c.restore();
}
// a long white beard and a moustache, in his head space (the chin is about y 60); k pops it, sway swings it
function clBeard(c, k, t, sway = 0) {
  if (k <= 0.01) return;
  const e = E.outBack(clamp(k), 2.2);
  c.save(); c.translate(0, 34); c.scale(e, e);
  const sw = 10 * Math.sin(t * 5) * sway;
  c.fillStyle = '#F2F4FA';
  c.beginPath();
  c.moveTo(-58, 0);
  c.bezierCurveTo(-70, 70, -48, 150, -20 + sw * 0.5, 220);
  c.quadraticCurveTo(0 + sw, 262, 18 + sw * 0.5, 218);
  c.bezierCurveTo(48, 150, 70, 70, 58, 0);
  c.quadraticCurveTo(30, 26, 0, 22); c.quadraticCurveTo(-30, 26, -58, 0); c.closePath(); c.fill();
  paint(() => {
    c.strokeStyle = 'rgba(160,170,200,0.75)'; c.lineWidth = 3; c.lineCap = 'round';
    for (const [x0, x1] of [[-30, -16], [-8, 2], [16, 22], [34, 26]]) {
      c.beginPath(); c.moveTo(x0, 40); c.quadraticCurveTo(x0 * 0.9 + sw * 0.3, 120, x1 + sw * 0.5, 190); c.stroke();
    }
    // the moustache, over the lip
    c.fillStyle = '#FFFFFF';
    for (const s of [-1, 1]) {
      c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(s * 30, -14, s * 58, 6); c.quadraticCurveTo(s * 34, 12, 0, 8); c.closePath(); c.fill();
    }
  });
  c.restore();
}
// a puff of white smoke (the beard leaving): world coords, d = seconds since
function clPuff(c, x, y, d, s = 1) {
  if (d < 0 || d > 0.5) return;
  const k = d / 0.5;
  paint(() => {
    for (let i = 0; i < 7; i++) {
      const a = i * 0.9, r = (16 + 22 * k) * s, rr = (20 + 90 * k) * s;
      circle(c, x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.7, r * (1 - k * 0.7), rgba('#FFFFFF', 0.9 * (1 - k)));
    }
  });
}
// a small pill tag (screen space): txt, colour of the dot
function clTag(x, y, txt, k, col = '#7FE9FF', size = 46) {
  if (k <= 0.01) return;
  const e = E.outBack(clamp(k), 2);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.scale(e, e);
  ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + size * 1.3, h = size * 1.5;
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = 'rgba(8,10,28,0.86)'; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = rgba(col, 0.9); ctx.stroke();
  ctx.fillStyle = '#FFFFFF'; ctx.fillText(txt, 0, size * 0.04);
  ctx.restore();
}
