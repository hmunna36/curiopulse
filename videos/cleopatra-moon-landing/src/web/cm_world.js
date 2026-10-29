// Was Cleopatra Closer to the Pyramids or the MOON Landing? 🚀 — the worlds.
// Space (a star tile and Earth, painted once: after sun-8-minutes' sv_space.js), the Moon at the landing site (the grey
// ground with craters and boot prints, the lunar module, the flag), Giza at dusk (the sky, a low sun on the right, the
// three pyramids, dunes and palms; the Great Pyramid can be half built), THE TIME ROPE (one world: the pyramid's tip at
// y 0, 0.6 world units a year up to the Moon landing at y -2717; a sky that turns from dusk to night to space with
// height, clouds at their own depth, the rope with a flag every 500 years, the Moon at the top), and Wrangel Island.
'use strict';

let CM_STARS = null, CM_EARTH = null, CM_EARTH_N = 0;

// ---------------------------------------------------------------- the time rope's scale: years -> world y
const CM_Y0 = -2559;                                   // 2560 BC (astronomical year numbering: 1 BC = 0)
const CM_PXY = 0.6;                                    // world units a year
function cmYearY(yr) { return -(yr - CM_Y0) * CM_PXY; }
const CM_CLEO_Y = cmYearY(-68);                        // 69 BC: -1494.6
const CM_TOP_Y = cmYearY(1969);                        // 1969: -2716.8
const CM_ROPE_X = 540;
const CM_MOON = { x: 560, y: CM_TOP_Y + 380, R: 380 }; // the Moon at the rope's top (its top at 1969)
const CM_PYR = { x: 540, tip: 0, hw: 1500, h: 1910 };  // the Great Pyramid under the rope (its tip at 2560 BC)

function initCmWorld() {
  // ---- stars and a faint nebula: a tile 1280 x 2400
  {
    const TW = 1280, TH = 2400, c = mkCanvas(TW, TH), x = c.getContext('2d');
    x.fillStyle = '#03040C'; x.fillRect(0, 0, TW, TH);
    for (const [nx, ny, nr, col, a] of [[220, 420, 520, '#2E2A7A', 0.4], [980, 980, 620, '#1E3C7A', 0.35], [420, 1700, 600, '#4A2468', 0.3],
      [1100, 2150, 420, '#2A2E6E', 0.3], [600, 2400, 500, '#2E2A7A', 0.4], [220, 0, 520, '#2E2A7A', 0.4]]) {
      const g = x.createRadialGradient(nx, ny, 0, nx, ny, nr); g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0));
      x.fillStyle = g; x.fillRect(0, 0, TW, TH);
    }
    const rng = mulberry32(509);
    for (let i = 0; i < 1500; i++) {
      const sx = rng() * TW, sy = rng() * TH, r = Math.pow(rng(), 3) * 2.4 + 0.4, tint = rng();
      x.fillStyle = tint < 0.15 ? `rgba(255,220,190,${0.4 + 0.6 * rng()})` : tint < 0.3 ? `rgba(190,215,255,${0.4 + 0.6 * rng()})` : `rgba(240,242,255,${0.3 + 0.6 * rng()})`;
      x.beginPath(); x.arc(sx, sy, r, 0, 7); x.fill();
      if (r > 2) { const g = x.createRadialGradient(sx, sy, 0, sx, sy, r * 5); g.addColorStop(0, 'rgba(220,230,255,0.35)'); g.addColorStop(1, 'rgba(220,230,255,0)'); x.fillStyle = g; x.fillRect(sx - r * 5, sy - r * 5, r * 10, r * 10); }
    }
    CM_STARS = c;
  }
  // ---- Earth: an orthographic disc painted once from 3D noise (Africa-ish land, oceans, ice, clouds)
  {
    const S = 420, R = S / 2 - 2;
    CM_EARTH = mkCanvas(S, S);
    const x = CM_EARTH.getContext('2d'), img = x.createImageData(S, S), d = img.data;
    const tilt = 0.32, cT = Math.cos(tilt), sT = Math.sin(tilt), lon0 = 0.6;
    for (let py = 0; py < S; py++) for (let px = 0; px < S; px++) {
      const nx = (px - S / 2 + 0.5) / R, ny = (py - S / 2 + 0.5) / R, rr = nx * nx + ny * ny;
      if (rr > 1) continue;
      const nz = Math.sqrt(1 - rr);
      const y1 = ny * cT - nz * sT, z1 = ny * sT + nz * cT;
      const lat = Math.asin(-y1), lon = Math.atan2(nx, z1) + lon0;
      const P = [Math.cos(lat) * Math.cos(lon), Math.cos(lat) * Math.sin(lon), Math.sin(lat)];
      const land = snFbm(P[0] * 1.5 + 3.1, P[1] * 1.5 - 1.7, P[2] * 1.5 + 0.4, 21, 5) + 0.06;
      const cloud = snFbm(P[0] * 2.6 - 4, P[1] * 2.6 + 2, P[2] * 3.4, 57, 4);
      const ice = Math.abs(lat) > 1.2 + 0.08 * snFbm(P[0] * 4, P[1] * 4, P[2] * 4, 9, 2);
      let r, g, b;
      if (ice) { r = 236; g = 244; b = 252; }
      else if (land > 0.1) {
        const dry = clamp((snFbm(P[0] * 3, P[1] * 3, P[2] * 3, 33, 3) + 0.15) * 2.2) * clamp(1 - Math.abs(lat) / 1.1);
        const hi = clamp((land - 0.1) * 3);
        r = lerp(lerp(70, 120, hi), 206, dry); g = lerp(lerp(140, 150, hi), 178, dry); b = lerp(lerp(72, 86, hi), 118, dry);
      } else {
        const deep = clamp(-land * 3.5);
        r = lerp(46, 18, deep); g = lerp(140, 70, deep); b = lerp(214, 168, deep);
      }
      const cl = clamp((cloud - 0.08) * 3.2) * 0.92;
      r = lerp(r, 252, cl); g = lerp(g, 252, cl); b = lerp(b, 255, cl);
      const limb = 0.55 + 0.45 * nz, k = (py * S + px) * 4;
      d[k] = r * limb; d[k + 1] = g * limb; d[k + 2] = b * limb; d[k + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    CM_EARTH_N = S;
  }
}

// ---------------------------------------------------------------- space: black with stars (screen space)
function cmSpaceBg(t, py = 0, px = 0, a = 1) {
  screenSpace();
  if (a >= 0.999) { ctx.fillStyle = '#03040C'; ctx.fillRect(0, 0, W, H); }
  const TH = CM_STARS.height, oy = ((-py * 0.08) % TH + TH) % TH, ox = -100 - px * 0.05 + 10 * Math.sin(t * loopW(0.1));
  ctx.save(); ctx.globalAlpha = a;
  ctx.drawImage(CM_STARS, ox, oy - TH); ctx.drawImage(CM_STARS, ox, oy);
  ctx.restore();
  const rng = mulberry32(12);
  paint(() => {
    for (let i = 0; i < 14; i++) {
      const sx = rng() * W, sy = rng() * H, ph = rng() * 6.28, k = (0.4 + 0.4 * Math.sin(loopW(0.7 + rng()) * t + ph)) * a;
      softDot(gctx, sx, sy, 8, '#DDE6FF', k); circle(ctx, sx, sy, 1.8, `rgba(245,248,255,${k})`);
    }
  });
}
// Earth at (x, y), radius R, lit from the left (the Sun is behind the camera's left shoulder)
function cmEarth(x, y, R, t, o = {}) {
  softDot(gctx, x, y, R * 1.6, '#4F9DFF', 0.38);
  softDot(ctx, x, y, R * 1.3, '#5FA8FF', 0.2);
  circle(ctx, x, y, R, '#1D4E9A');
  paint(() => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0.2); ctx.drawImage(CM_EARTH, -R, -R, 2 * R, 2 * R); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, R + 0.5, 0, 7); ctx.clip();           // the night side: a soft terminator
    const g = ctx.createLinearGradient(x - R, y - R * 0.3, x + R, y + R * 0.3);
    g.addColorStop(0, 'rgba(6,10,30,0)'); g.addColorStop(0.52, 'rgba(6,10,30,0)'); g.addColorStop(0.66, 'rgba(6,10,30,0.82)'); g.addColorStop(1, 'rgba(4,6,22,0.94)');
    ctx.fillStyle = g; ctx.fillRect(x - R - 2, y - R - 2, 2 * R + 4, 2 * R + 4); ctx.restore();
    ctx.beginPath(); ctx.arc(x, y, R + 2, Math.PI * 0.62, Math.PI * 1.45); ctx.lineWidth = Math.max(2, R * 0.05); ctx.strokeStyle = 'rgba(140,205,255,0.85)'; ctx.stroke();
  });
}

// ---------------------------------------------------------------- THE MOON at the landing site (the hook and the button)
// world: the hiker's feet at (430, 1500), hers at (660, 1500); the horizon at y ~1240 (a gentle curve)
const MN = { hx: 430, cx: 660, gy: 1500, hor: 1240 };
function cmHorY(x) { return MN.hor + (x - 540) * (x - 540) * 0.000035; }
const CM_CRATERS = (() => {
  const rng = mulberry32(4401), out = [];
  for (let i = 0; i < 46; i++) {
    const y = MN.hor + 14 + Math.pow(rng(), 1.6) * 760, near = clamp((y - MN.hor) / 700);
    out.push({ x: -700 + rng() * 2500, y, r: (14 + 70 * rng()) * (0.35 + 1.4 * near), seed: i });
  }
  return out.sort((a, b) => a.y - b.y);
})();
function cmCrater(c, x, y, r, seed) {
  const ry = r * 0.3;
  ellipse(c, x, y, r * 1.12, ry * 1.25, '#A4A19C');                       // the raised rim, lit
  ellipse(c, x, y + ry * 0.12, r, ry, '#6C6966');                          // the bowl
  c.save(); c.beginPath(); c.ellipse(x, y + ry * 0.12, r, ry, 0, 0, 7); c.clip();
  ellipse(c, x + r * 0.28, y + ry * 0.32, r * 0.86, ry * 0.8, '#8A8783');  // the far wall in the sun
  c.restore();
}
function cmBootPrint(c, x, y, s, rot) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s * 0.42);
  rrect(c, -15, -34, 30, 68, 13); c.fillStyle = '#6E6B67'; c.fill();
  for (let i = -26; i <= 26; i += 8) line(c, -12, i, 12, i, 3, '#55524F');
  c.restore();
}
function cmMoonGround(cam, t, o = {}) {
  applyCam(cam);
  const x0 = cam.x - 1100 / cam.zoom - 200, x1 = cam.x + 1100 / cam.zoom + 200;
  // the ground: one opaque shape from the horizon down, a gradient from the far (pale) to the near (darker)
  ctx.beginPath(); ctx.moveTo(x0, cmHorY(x0));
  for (let x = x0; x <= x1; x += 40) ctx.lineTo(x, cmHorY(x));
  ctx.lineTo(x1, 4000); ctx.lineTo(x0, 4000); ctx.closePath();
  const g = ctx.createLinearGradient(0, MN.hor, 0, 2000);
  g.addColorStop(0, '#B4B1AC'); g.addColorStop(0.25, '#9A9792'); g.addColorStop(1, '#6A6763');
  ctx.fillStyle = g; ctx.fill();
  // far hills on the horizon
  ctx.beginPath(); ctx.moveTo(x0, cmHorY(x0));
  for (let x = x0; x <= x1; x += 30) ctx.lineTo(x, cmHorY(x) - 10 - 14 * Math.max(0, Math.sin(x * 0.006 + 1.3)) - 8 * Math.max(0, Math.sin(x * 0.017)));
  ctx.lineTo(x1, cmHorY(x1)); ctx.closePath(); ctx.fillStyle = '#C2BFBA'; ctx.fill();
  for (const k of CM_CRATERS) if (k.x > x0 - 200 && k.x < x1 + 200) cmCrater(ctx, k.x, k.y, k.r, k.seed);
  // boot prints round the two of them (the famous tread)
  paint(() => {
    const rng = mulberry32(77);
    for (let i = 0; i < 22; i++) cmBootPrint(ctx, 150 + 800 * rng(), 1400 + 300 * rng(), 0.9 + 0.5 * rng(), -0.4 + 0.8 * rng());
  });
  // small rocks
  const rng = mulberry32(91);
  for (let i = 0; i < 30; i++) {
    const x = x0 + (x1 - x0) * rng(), y = MN.hor + 30 + 700 * Math.pow(rng(), 1.3), s = (4 + 16 * rng()) * (0.4 + clamp((y - MN.hor) / 500));
    ellipse(ctx, x, y, s * 1.3, s * 0.8, '#7E7B77'); ellipse(ctx, x - s * 0.3, y - s * 0.3, s * 0.7, s * 0.4, '#B8B5B0');
  }
}
// the lunar module (Apollo 11's Eagle): its descent stage wrapped in gold foil on four legs, the faceted ascent stage on top
function cmLM(c, x, base, s, t, o = {}) {
  c.save(); c.translate(x, base); c.scale(s, s);
  // legs: struts down and out to the round footpads (the back pair first)
  for (const [sx, back] of [[-1, 1], [1, 1], [-1, 0], [1, 0]]) {
    const fx = sx * (back ? 190 : 250), fy = back ? -18 : 0, hx = sx * 150, hy = -150;
    line(c, hx, hy, fx, fy - 10, 13, back ? '#8E8E92' : '#B9B9BE');
    line(c, sx * 90, -120, fx, fy - 10, 8, back ? '#7A7A80' : '#A4A4AA');
    ellipse(c, fx, fy, 34, 10, back ? '#8A8A90' : '#C4C4CA');
  }
  // the ladder on the front leg
  for (let i = 0; i < 6; i++) line(c, -26, -40 - i * 18, 26, -40 - i * 18, 4, '#9C9CA2');
  line(c, -28, -150, -24, -30, 5, '#A4A4AA'); line(c, 28, -150, 24, -30, 5, '#A4A4AA');
  // the descent stage: an octagonal box in gold foil
  c.beginPath(); c.moveTo(-170, -270); c.lineTo(170, -270); c.lineTo(196, -240); c.lineTo(196, -140); c.lineTo(170, -112); c.lineTo(-170, -112); c.lineTo(-196, -140); c.lineTo(-196, -240); c.closePath();
  const g = c.createLinearGradient(-196, 0, 196, 0);
  g.addColorStop(0, '#F6D46A'); g.addColorStop(0.35, '#E0A830'); g.addColorStop(0.6, '#C88A1E'); g.addColorStop(1, '#8E5A12');
  c.fillStyle = g; c.fill();
  paint(() => {                                                   // crinkles in the foil, and the black band
    const rng = mulberry32(19);
    for (let i = 0; i < 26; i++) { const ax = -180 + 360 * rng(), ay = -262 + 140 * rng(); line(c, ax, ay, ax + 30 * (rng() - 0.5), ay + 26 * (rng() - 0.3), 2, rng() < 0.5 ? 'rgba(255,240,180,0.7)' : 'rgba(120,70,10,0.5)'); }
    c.fillStyle = '#26262C'; c.fillRect(-196, -206, 392, 16);
  });
  // the ascent stage: faceted grey cabin
  c.beginPath(); c.moveTo(-150, -270); c.lineTo(-170, -360); c.lineTo(-110, -450); c.lineTo(40, -470); c.lineTo(150, -420); c.lineTo(170, -330); c.lineTo(150, -270); c.closePath();
  c.fillStyle = '#C9CDD5'; c.fill();
  c.beginPath(); c.moveTo(-170, -360); c.lineTo(-110, -450); c.lineTo(-40, -440); c.lineTo(-70, -350); c.closePath(); c.fillStyle = '#E2E6EE'; c.fill();
  c.beginPath(); c.moveTo(150, -420); c.lineTo(170, -330); c.lineTo(150, -270); c.lineTo(80, -290); c.lineTo(90, -400); c.closePath(); c.fillStyle = '#9EA3AE'; c.fill();
  c.fillStyle = '#2A2A30'; c.fillRect(-150, -290, 300, 20);
  paint(() => {
    // the two triangular windows and the hatch
    for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * 30, -400); c.lineTo(sx * 92, -392); c.lineTo(sx * 40, -350); c.closePath(); c.fillStyle = '#14161E'; c.fill(); line(c, sx * 38, -396, sx * 70, -392, 3, 'rgba(140,190,255,0.7)'); }
    rrect(c, -36, -340, 72, 62, 6); c.fillStyle = '#B2B7C2'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#7A808C'; c.stroke();
  });
  // RCS thruster quads and the antenna dish
  for (const sx of [-1, 1]) { c.fillStyle = '#7C818C'; c.fillRect(sx * 170 - 14, -400, 28, 22); line(c, sx * 170, -400, sx * 170, -420, 6, '#5E626C'); line(c, sx * 184, -389, sx * 200, -389, 6, '#5E626C'); }
  line(c, 60, -462, 92, -520, 5, '#9EA3AE');
  ellipse(c, 100, -532, 34, 12, '#DADDE4', -0.5); ellipse(c, 100, -532, 22, 7, '#B4B8C2', -0.5);
  c.restore();
}
// the flag: a pole and a top bar (no wind on the Moon: it stays crinkled, never waves)
function cmFlag(c, x, base, s) {
  c.save(); c.translate(x, base); c.scale(s, s);
  line(c, 0, 0, 0, -330, 7, '#D8DCE4');
  line(c, 0, -326, 168, -326, 5, '#D8DCE4');
  c.beginPath(); c.moveTo(0, -326); c.lineTo(168, -326); c.lineTo(168, -222); c.quadraticCurveTo(110, -214, 84, -226); c.quadraticCurveTo(40, -236, 0, -222); c.closePath();
  c.fillStyle = '#F2F0EC'; c.fill();
  paint(() => {
    c.save(); c.beginPath(); c.moveTo(0, -326); c.lineTo(168, -326); c.lineTo(168, -222); c.quadraticCurveTo(110, -214, 84, -226); c.quadraticCurveTo(40, -236, 0, -222); c.closePath(); c.clip();
    for (let i = 0; i < 7; i++) { const y = -326 + i * 15.4; c.fillStyle = '#C8283A'; c.fillRect(0, y, 170, 7.7); }
    c.fillStyle = '#26407E'; c.fillRect(0, -326, 74, 54);
    const rng = mulberry32(5);
    for (let i = 0; i < 18; i++) circle(c, 6 + (i % 6) * 12.4, -320 + Math.floor(i / 6) * 16 + 4 * rng(), 2.4, '#F4F4F8');
    for (let i = 0; i < 5; i++) line(c, 30 + i * 30, -326, 26 + i * 30 + 10 * Math.sin(i), -222, 2, 'rgba(60,40,40,0.25)');      // crinkles
    c.restore();
  });
  c.restore();
}
// the Moon world behind the two of them: stars, Earth, ground, the lander and the flag (o: {earth: [x, y, R], lm, flag})
function cmMoonBack(cam, t, o = {}) {
  cmSpaceBg(t, cam.y * 0.4, cam.x * 0.5);
  applyCam(cam);
  const E0 = o.earth || [790, 690, 62];
  // Earth sits far away: a little parallax of its own
  const ex = E0[0] + (cam.x - 545) * 0.55, ey = E0[1] + (cam.y - 1010) * 0.55;
  cmEarth(ex, ey, E0[2], t, { rot: 0.2 + 0.01 * Math.sin(t * loopW(0.2)) });
  cmMoonGround(cam, t);
  applyCam(cam);
  if (o.flag !== false) { const f = o.flag || [170, 1330, 0.62]; cmFlag(ctx, f[0], f[1], f[2]); }
  if (o.lm !== false) { const L = o.lm || [930, 1300, 0.62]; cmLM(ctx, L[0], L[1], L[2], t); }
}

// ---------------------------------------------------------------- GIZA at dusk
// sky colour from the top of the frame to the horizon; a low sun on the right; three pyramids on the plateau
function cmGizaSky(t, horY, sunX, sunY, o = {}) {
  screenSpace();
  const g = ctx.createLinearGradient(0, 0, 0, horY);
  g.addColorStop(0, o.top || '#3B2C6E'); g.addColorStop(0.45, '#9A4E86'); g.addColorStop(0.75, '#F07A58'); g.addColorStop(1, '#FFC27A');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, Math.max(0, horY) + 4);
  ctx.fillStyle = '#FFC27A'; ctx.fillRect(0, horY, W, H - horY);
  // the sun, low on the right, and its glow
  softDot(ctx, sunX, sunY, 420, '#FFB25A', 0.55);
  softDot(gctx, sunX, sunY, 300, '#FFC870', 0.9);
  circle(ctx, sunX, sunY, 74, '#FFF2C8'); softDot(gctx, sunX, sunY, 110, '#FFF4D0', 1);
  // long thin clouds lit from below
  paint(() => {
    for (const [cx, cy, w, h] of [[200, horY - 520, 360, 16], [760, horY - 640, 420, 14], [420, horY - 330, 300, 12], [900, horY - 420, 260, 12]]) {
      ellipse(ctx, cx, cy, w, h, 'rgba(255,170,140,0.55)'); ellipse(ctx, cx + 30, cy + 5, w * 0.7, h * 0.6, 'rgba(255,214,170,0.6)');
    }
  });
}
// a pyramid with its tip at (x, tip), half base hw, height h, lit from the right (sunset): the right face warm, the left in
// shade. o: {built 0..1 (how much of its height stands; the rest is a flat top with a ramp), courses: lines on the casing}
function cmPyramid(c, x, tip, hw, h, o = {}) {
  const base = tip + h, built = o.built === undefined ? 1 : o.built;
  const topY = base - h * built, k = (topY - tip) / h;               // where the faces stop (a flat top when not built)
  const wl = hw * k;                                                 // half width at that height
  const lit = o.lit || '#F2C27E', shade = o.shade || '#B06A52', front = o.front || 0.18;
  // left face (shade) and right face (lit): the near edge runs down the middle slightly right of centre
  const mx = x + hw * front;
  c.beginPath(); c.moveTo(x - wl, topY); c.lineTo(x - hw, base); c.lineTo(mx, base); c.lineTo(x + (mx - x) * k + 0 * wl, topY); c.closePath();
  c.fillStyle = shade; c.fill();
  c.beginPath(); c.moveTo(x + (mx - x) * k, topY); c.lineTo(mx, base); c.lineTo(x + hw, base); c.lineTo(x + wl, topY); c.closePath();
  c.fillStyle = lit; c.fill();
  if (built < 1) {                                                   // the flat working top
    c.beginPath(); c.moveTo(x - wl, topY); c.lineTo(x + (mx - x) * k, topY + 0.001); c.lineTo(x + wl, topY); c.lineTo(x + (mx - x) * k, topY - wl * 0.12); c.closePath();
    c.fillStyle = mixH(lit, '#FFFFFF', 0.15); c.fill();
  }
  if (o.courses) paint(() => {                                       // the courses of stone, faint
    const n = o.courses;
    for (let i = 1; i < n; i++) {
      const y = tip + h * i / n; if (y < topY) continue;
      const w2 = hw * (y - tip) / h, mm = x + (mx - x) * (y - tip) / h;
      line(c, x - w2, y, mm, y, Math.max(1, h / 900), 'rgba(90,40,30,0.18)');
      line(c, mm, y, x + w2, y, Math.max(1, h / 900), 'rgba(140,70,30,0.16)');
    }
  });
}
// the far plate: dunes, the two smaller pyramids, palms on the left (screen space, a parallax offset px)
function cmGizaFar(t, horY, px, o = {}) {
  screenSpace();
  // the two smaller pyramids, far off on the plateau (Khafre's and Menkaure's)
  cmPyramid(ctx, 250 + px * 0.3, horY - 210, 210, 214, { lit: '#E8A878', shade: '#A86A66', front: 0.2 });
  cmPyramid(ctx, 60 + px * 0.3, horY - 120, 120, 124, { lit: '#E0A07A', shade: '#A06868', front: 0.2 });
  // dunes, three bands
  for (const [dy, col, amp, f, ph] of [[0, '#E9A86E', 22, 0.006, 1], [40, '#D9925E', 30, 0.004, 2.2], [110, '#C47C52', 40, 0.003, 0.4]]) {
    ctx.beginPath(); ctx.moveTo(-10, H);
    for (let x = -10; x <= W + 10; x += 20) ctx.lineTo(x, horY + dy - amp * Math.sin((x + px * (0.4 + dy / 200)) * f + ph));
    ctx.lineTo(W + 10, H); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  }
  // palms by the Nile on the left
  if (o.palms !== false) for (const [x0, s] of [[-30, 1], [70, 0.8], [150, 0.65]]) cmPalm(ctx, x0 + px * 0.5, horY + 30, s, t);
}
function cmPalm(c, x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.moveTo(-8, 0); c.quadraticCurveTo(10, -120, 24, -230); c.lineTo(36, -230); c.quadraticCurveTo(20, -120, 10, 0); c.closePath();
  c.fillStyle = '#5A3A2C'; c.fill();
  const sw = 0.05 * Math.sin(t * loopW(1.3));
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI / 2 + (i - 3) * 0.48 + sw;
    c.beginPath(); c.moveTo(30, -232);
    c.quadraticCurveTo(30 + Math.cos(a) * 80, -232 + Math.sin(a) * 60 - 20, 30 + Math.cos(a) * 140, -232 + Math.sin(a) * 50 + 40);
    c.quadraticCurveTo(30 + Math.cos(a) * 70, -232 + Math.sin(a) * 40, 30, -224);
    c.fillStyle = i % 2 ? '#2E4A30' : '#3C5E3A'; c.fill();
  }
  c.restore();
}

// ---------------------------------------------------------------- THE TIME ROPE: the sky with height (world y)
const CM_SKY = [[900, '#FFC27A'], [0, '#F08A5A'], [-450, '#B4587A'], [-950, '#5A3A86'], [-1450, '#2A3070'], [-1950, '#121A44'], [-2350, '#070A1E'], [-2800, '#03040C']];
function cmSkyAt(y) {
  for (let i = 0; i < CM_SKY.length - 1; i++) {
    const [ya, ca] = CM_SKY[i], [yb, cb] = CM_SKY[i + 1];
    if (y <= ya && y >= yb) return mixH(ca, cb, (ya - y) / (ya - yb));
  }
  return y > CM_SKY[0][0] ? CM_SKY[0][1] : CM_SKY[CM_SKY.length - 1][1];
}
function cmRopeSky(cam, t) {
  screenSpace();
  const yTop = cam.y - 960 / cam.zoom, yBot = cam.y + 960 / cam.zoom;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  for (let i = 0; i <= 8; i++) { const u = i / 8; g.addColorStop(u, cmSkyAt(lerp(yTop, yBot, u))); }
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // the stars come out with height (fully over the top third of the climb)
  const sa = clamp(inv(-1500, -2300, cam.y));
  if (sa > 0.01) cmSpaceBg(t, cam.y * 0.5, 0, sa);
  // the sun's glow low on the right while we are near the ground
  const ga = clamp(inv(-900, 200, cam.y));
  if (ga > 0.01) { const sp = toScreen(cam, 1500, 700); softDot(ctx, sp[0], sp[1], 700 * cam.zoom + 260, '#FFB25A', 0.5 * ga); softDot(gctx, sp[0], sp[1], 500 * cam.zoom + 160, '#FFC870', 0.7 * ga); }
}
// clouds at their own depth (p < 1: farther, slower). World heights where they float.
const CM_CLOUDS = [[-260, 0.7, 260, 7], [-520, 0.55, -320, 3], [-760, 0.75, 820, 11], [-1050, 0.6, 160, 5], [-1320, 0.7, 900, 13], [-1700, 0.62, 300, 17]];
function cmClouds(cam, t, a = 1) {
  for (const [cy, p, cx, seed] of CM_CLOUDS) {
    const cm = { x: cam.x, y: cam.y * p + cy * (1 - p), zoom: cam.zoom * (0.75 + 0.25 * p), rot: 0 };
    const sp = toScreen(cm, cx + 30 * Math.sin(t * loopW(0.05) + seed), cy);
    if (sp[1] < -300 || sp[1] > H + 300) continue;
    const s = cm.zoom, hgt = -cy, tint = hgt < 900 ? '#FFC0A0' : hgt < 1500 ? '#C6A0D8' : '#8A92C8';
    const rng = mulberry32(seed * 31);
    paint(() => {
      for (let i = 0; i < 9; i++) {
        const ox = (rng() - 0.5) * 520 * s, oy = (rng() - 0.5) * 40 * s, rx = (90 + 120 * rng()) * s, ry = (26 + 26 * rng()) * s;
        ellipse(ctx, sp[0] + ox, sp[1] + oy + 8 * s, rx, ry, rgba(mixH(tint, '#3A2A5A', 0.5), 0.5 * a));
        ellipse(ctx, sp[0] + ox, sp[1] + oy, rx * 0.92, ry * 0.85, rgba(tint, 0.62 * a));
      }
    });
  }
}
// the Moon at the rope's top: a disc with maria and craters, lit from the upper left; things stand on its top
function cmMoonDisc(c, cx, cy, R, t) {
  softDot(gctx, cx, cy, R * 1.25, '#DCE4FF', 0.35);
  circle(c, cx, cy, R, '#C9C6C0');
  paint(() => {
    c.save(); c.beginPath(); c.arc(cx, cy, R, 0, 7); c.clip();
    for (const [mx, my, mr, col] of [[-0.3, -0.2, 0.36, '#9E9B96'], [0.25, 0.1, 0.28, '#A4A19C'], [-0.05, 0.42, 0.22, '#A8A5A0'], [0.42, -0.38, 0.18, '#ABA8A3']])
      ellipse(c, cx + mx * R, cy + my * R, mr * R * 1.2, mr * R, col, 0.3);
    const rng = mulberry32(808);
    for (let i = 0; i < 40; i++) {
      const a = rng() * 6.28, rr = Math.sqrt(rng()) * R * 0.95, x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr, r = R * (0.015 + 0.05 * Math.pow(rng(), 2));
      circle(c, x, y, r * 1.15, '#D8D5D0'); circle(c, x + r * 0.15, y + r * 0.15, r, '#8C8984');
    }
    const g = c.createRadialGradient(cx - R * 0.4, cy - R * 0.45, R * 0.2, cx, cy, R * 1.05);    // lit from the upper left
    g.addColorStop(0, 'rgba(255,255,250,0.18)'); g.addColorStop(0.7, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(10,12,30,0.45)');
    c.fillStyle = g; c.fillRect(cx - R, cy - R, 2 * R, 2 * R);
    c.restore();
  });
}
function cmMoonTopY(x) { const dx = x - CM_MOON.x; return CM_MOON.y - Math.sqrt(Math.max(0, CM_MOON.R * CM_MOON.R - dx * dx)); }
// the rope from the pyramid's tip (y 0, or the half-built top) to the flagpole on the Moon (y CM_TOP_Y); a knot every
// 100 years and a flag every 500 (the flags hang on the LEFT of the rope: the hero climbs on its right)
const CM_FLAGS = [[-2499, '2500 BC'], [-1999, '2000 BC'], [-1499, '1500 BC'], [-999, '1000 BC'], [-499, '500 BC'], [1, 'AD 1'],
  [500, 'AD 500'], [1000, 'AD 1000'], [1500, 'AD 1500']];
function cmRope(cam, t, o = {}) {
  applyCam(cam);
  const y0 = o.y0 === undefined ? 0 : o.y0, y1 = CM_TOP_Y + 40;
  const sway = (y) => 0;
  // the rope: two strands twisted (a dark core and a light twist)
  const vis0 = Math.min(y0, cam.y + 1100 / cam.zoom), vis1 = Math.max(y1, cam.y - 1100 / cam.zoom);
  line(ctx, CM_ROPE_X, vis0, CM_ROPE_X, vis1, 15, '#C98E4A');
  paint(() => {
    const step = 22, start = Math.floor(vis1 / step) * step;
    for (let y = start; y < vis0; y += step) line(ctx, CM_ROPE_X - 6, y, CM_ROPE_X + 6, y + 11, 3, 'rgba(110,64,26,0.6)');
  });
  // knots every 100 years
  for (let yr = -2500; yr <= 1900; yr += 100) {
    const y = cmYearY(yr); if (y > vis0 || y < vis1) continue;
    ellipse(ctx, CM_ROPE_X, y, 13, 9, '#B07A3C');
  }
  // the flags (left of the rope)
  for (const [yr, txt] of CM_FLAGS) {
    const y = cmYearY(yr); if (y > vis0 + 200 || y < vis1 - 200) continue;
    if (o.flags === false) continue;
    cmYearFlag(ctx, CM_ROPE_X, y, txt, t, o.flagK ? o.flagK(yr) : 1);
  }
}
function cmYearFlag(c, x, y, txt, t, k = 1) {
  if (k <= 0.01) return;
  c.save(); c.translate(x - 8, y); c.scale(k, k);
  const wv = 4 * Math.sin(t * loopW(2.2) + y * 0.01);
  c.beginPath(); c.moveTo(0, -8); c.lineTo(-210, -10 + wv); c.lineTo(-226, 22 + wv); c.lineTo(-210, 52 + wv); c.lineTo(0, 50); c.closePath();
  c.fillStyle = '#F4E4C0'; c.fill();
  paint(() => {
    c.font = '900 38px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#4A2A14';
    c.fillText(txt, -108, 22 + wv * 0.5);
  });
  c.restore();
}

// ---------------------------------------------------------------- WRANGEL ISLAND (its own panel; island world: the mammoth
// stands at (0, 0); the sea's horizon at y -260; the island is a long low hump from x -1500 to 1500)
function cmArcticSky(c, cam) {
  screenSpace();
  const hz = toScreen(cam, 0, -260)[1];
  const g = ctx.createLinearGradient(0, hz - 900, 0, hz);
  g.addColorStop(0, '#5E86B4'); g.addColorStop(0.6, '#A9C4DC'); g.addColorStop(1, '#E4EEF4');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, Math.max(0, hz) + 2);
  // a pale low sun and long clouds
  const sp = toScreen(cam, -900, -700);
  softDot(gctx, sp[0], sp[1], 180, '#FFF4DC', 0.6); circle(ctx, sp[0], sp[1], 40 * Math.max(0.4, cam.zoom), '#FFF8E6');
  paint(() => { for (const [x, y, w] of [[-400, -900, 500], [700, -1100, 700], [200, -650, 400]]) { const p = toScreen(cam, x, y); ellipse(ctx, p[0], p[1], w * cam.zoom, 22 * cam.zoom + 6, 'rgba(255,255,255,0.55)'); } });
  // the sea
  const sg = ctx.createLinearGradient(0, hz, 0, H);
  sg.addColorStop(0, '#5C7C96'); sg.addColorStop(1, '#2E4A62');
  ctx.fillStyle = sg; ctx.fillRect(0, hz, W, H - hz);
}
function cmIsland(cam, t, o = {}) {
  applyCam(cam);
  // ice floes on the sea
  const rng = mulberry32(333);
  for (let i = 0; i < 40; i++) {
    const x = -6000 + 12000 * rng(), y = -250 + Math.pow(rng(), 1.5) * 2600, w = (40 + 160 * rng()) * (0.4 + (y + 260) / 1200);
    ellipse(ctx, x, y, w, w * 0.18, '#E8F2F8'); ellipse(ctx, x, y + w * 0.06, w * 0.96, w * 0.12, '#B8CEDC');
  }
  // the island: a long low hump of tundra with snow patches and far snowy hills
  const L = o.L || 1500;
  ctx.beginPath(); ctx.moveTo(-L - 200, 120);
  for (let x = -L - 200; x <= L + 200; x += 40) {
    const u = x / L, hump = Math.max(0, 1 - u * u);
    ctx.lineTo(x, 120 - 260 * Math.pow(hump, 0.6) - 70 * Math.max(0, Math.sin(x * 0.004 + 1)) * hump);
  }
  ctx.lineTo(L + 200, 120); ctx.closePath();
  ctx.fillStyle = '#7E8A5A'; ctx.fill();
  // snowy hills on its back
  ctx.beginPath(); ctx.moveTo(-L * 0.7, -110);
  for (let x = -L * 0.7; x <= L * 0.6; x += 40) ctx.lineTo(x, -150 - 140 * Math.max(0, Math.sin(x * 0.0035 + 0.6)) * (1 - Math.abs(x) / L));
  ctx.lineTo(L * 0.6, -110); ctx.closePath(); ctx.fillStyle = '#E6EEF2'; ctx.fill();
  // the shore's foam
  paint(() => { line(ctx, -L - 200, 122, L + 200, 122, 10, 'rgba(240,248,252,0.8)'); });
  // tundra tufts and snow patches near the mammoth
  const r2 = mulberry32(57);
  for (let i = 0; i < 60; i++) {
    const x = -700 + 1400 * r2(), y = -40 + 150 * r2();
    if (r2() < 0.3) ellipse(ctx, x, y, 40 + 60 * r2(), 10 + 6 * r2(), '#EEF4F6');
    else { for (let k = -2; k <= 2; k++) line(ctx, x, y, x + k * 6, y - 18 - 12 * r2(), 3, r2() < 0.5 ? '#9AA25A' : '#6E7A44'); }
  }
}
