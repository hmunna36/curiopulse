// If You Fell Into JUPITER, You'd Never Hit the Ground 🪐: the world (26 Oct 2026, the third CURIOUS Short).
// Jupiter from space (a disc painted once, pixel by pixel: belts and zones with turbulent edges, the Great Red Spot,
// white ovals, the Sun's light and the limb), and the fall INTO it: a camera that falls with the hero through three
// decks of cloud (ammonia ice, ammonium hydrosulfide, water: NASA's three layers), drawn in perspective as fields of
// puffs (tops seen from above, undersides from below), with zonal winds sliding each deck its own way; then the gas
// thickening below them: soup, syrup, a hot dark ocean (the medium, `jpMedium`), with things drifting in it.
// Every position comes from a seeded generator: frames render identically every time.
'use strict';

// ---------------------------------------------------------------- tiny fast noise (for the painted planet)
const JPN = (() => {
  const N = 256, g = new Float32Array(N * N), rng = mulberry32(9071);
  for (let i = 0; i < N * N; i++) g[i] = rng();
  const at = (x, y) => g[((y & 255) << 8) | (x & 255)];
  function n2(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
    const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    const a = at(xi, yi), b = at(xi + 1, yi), c = at(xi, yi + 1), d = at(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;           // 0..1
  }
  function fbm(x, y, o = 4) { let s = 0, a = 0.5, n = 0; for (let i = 0; i < o; i++) { s += a * n2(x, y); n += a; x = x * 2.03 + 17.1; y = y * 2.03 + 9.7; a *= 0.5; } return s / n; }
  return { n2, fbm };
})();
const hexRGB = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

// ---------------------------------------------------------------- the planet, painted once
// Belts and zones from north (+90) to south (-90): [the latitude where this band starts going south, colour].
const JP_BANDS = [
  [90, '#8C8A86'], [58, '#9A8C7C'], [48, '#C9B596'], [41, '#A27E62'], [35, '#D3BFA0'], [27, '#9B7356'], [22, '#D9C6A6'],
  [17, '#8A5638'], [8, '#E6D3B2'], [-6, '#EADCC2'], [-8, '#9C6A48'], [-19, '#E2CFAE'], [-27, '#B08A68'], [-33, '#D6C2A2'],
  [-39, '#A98566'], [-46, '#C8B497'], [-57, '#958676'], [-90, '#8A8884'],
];
const JP_GRS = { lon: 0.42, lat: -22.5, a: 0.30, b: 7.2 };   // the Great Red Spot: longitude (rad), latitude (deg), half-width (rad), half-height (deg)
let JP_DISC = null, JP_STARS = null, JP_SUNSPR = null;
function jpBandColor(lat) {
  for (let i = 0; i < JP_BANDS.length - 1; i++) {
    const [a, ca] = JP_BANDS[i], [b, cb] = JP_BANDS[i + 1];
    if (lat <= a && lat > b) {
      const e = 1.8;                                               // soft edges (a few degrees) between a band and the next
      const k = clamp((a - lat) < e ? 0.5 - 0.5 * (a - lat) / e : (lat - b) < e ? 0.5 + 0.5 * (1 - (lat - b) / e) : 0);
      const prev = i > 0 ? JP_BANDS[i - 1][1] : ca;
      const ra = hexRGB(ca), rb = hexRGB((a - lat) < e ? prev : cb);
      return [lerp(ra[0], rb[0], k), lerp(ra[1], rb[1], k), lerp(ra[2], rb[2], k)];
    }
  }
  return hexRGB(JP_BANDS[JP_BANDS.length - 1][1]);
}
function jpPaintDisc(R) {
  const S = 2 * R, c = mkCanvas(S, S), x = c.getContext('2d'), img = x.createImageData(S, S), d = img.data;
  const L = [0.62, -0.34, 0.71];                                  // the Sun: right, a little above, in front
  const Ln = Math.hypot(...L); L[0] /= Ln; L[1] /= Ln; L[2] /= Ln;
  const grs = hexRGB('#C25E3A'), grs2 = hexRGB('#DE9A70'), collar = hexRGB('#EFE3CE'), oval = hexRGB('#F6F0E6'), haze = hexRGB('#C9D2E6');
  const fest = hexRGB('#4E5E86');
  for (let py = 0; py < S; py++) {
    const ny = (py + 0.5 - R) / R;
    for (let px = 0; px < S; px++) {
      const nx = (px + 0.5 - R) / R, rr = nx * nx + ny * ny, o = (py * S + px) * 4;
      if (rr > 1) { d[o + 3] = 0; continue; }
      const nz = Math.sqrt(1 - rr), lat0 = -Math.asin(ny) * 57.2958, lon = Math.atan2(nx, nz);
      // turbulence: band edges ripple along the longitude, features stretched east-west by the winds
      const tw = JPN.fbm(lon * 3.2 + 40, lat0 * 0.21 + 11, 4) - 0.5, tf = JPN.fbm(lon * 9 + 3, lat0 * 0.55 + 70, 3) - 0.5;
      const lat = lat0 + 5.2 * tw + 1.6 * tf;
      let col = jpBandColor(lat);
      const fine = JPN.fbm(lon * 22 + 5, lat0 * 1.4 + 2, 3) - 0.5, streak = JPN.fbm(lon * 4 + 9, lat0 * 2.6 + 4, 2) - 0.5;
      let br = 1 + 0.16 * fine + 0.14 * streak;
      // festoons: blue-grey plumes trailing along the north edge of the equatorial zone
      const fz = Math.exp(-Math.pow((lat0 - 6.2 + 1.6 * tw) / 1.6, 2)) * Math.max(0, Math.sin(lon * 7.5 + 2.4 * tw) - 0.35);
      if (fz > 0) col = [lerp(col[0], fest[0], 0.5 * fz), lerp(col[1], fest[1], 0.5 * fz), lerp(col[2], fest[2], 0.5 * fz)];
      // the Great Red Spot, with a pale collar and swirls
      const gx = (lon - JP_GRS.lon) / JP_GRS.a, gy = (lat0 - JP_GRS.lat) / JP_GRS.b, gr = Math.hypot(gx, gy);
      if (gr < 1.45) {
        const ang = Math.atan2(gy, gx), sw = Math.sin(gr * 15 - ang * 2 + 6 * (JPN.n2(gx * 3 + 50, gy * 3 + 50) - 0.5));
        if (gr < 1) {
          const k = clamp(1 - gr * gr), cc = [lerp(grs2[0], grs[0], k), lerp(grs2[1], grs[1], k), lerp(grs2[2], grs[2], k)];
          col = cc; br = 1 + 0.08 * sw - 0.06 * k;
        } else {
          const k = Math.exp(-Math.pow((gr - 1.15) / 0.17, 2));
          col = [lerp(col[0], collar[0], 0.8 * k), lerp(col[1], collar[1], 0.8 * k), lerp(col[2], collar[2], 0.8 * k)];
          br += 0.05 * sw * k;
        }
      }
      // a string of white ovals in the south
      for (let j = 0; j < 5; j++) {
        const ox = (lon - (-0.9 + j * 0.42)) / 0.07, oy = (lat0 - (-40.5 + (j % 2) * 1.2)) / 2.3, og = ox * ox + oy * oy;
        if (og < 1) { const k = clamp(1.3 * (1 - og)); col = [lerp(col[0], oval[0], k), lerp(col[1], oval[1], k), lerp(col[2], oval[2], k)]; }
      }
      // the light: the Sun on the right, a soft terminator on the left, the limb darkening of a gas giant
      const lam = nx * L[0] + ny * L[1] + nz * L[2];
      const lit = clamp(0.06 + 1.02 * Math.pow(clamp(lam * 0.92 + 0.08), 0.78)) * (0.62 + 0.38 * Math.pow(nz, 0.35));
      const lh = Math.pow(1 - nz, 3) * clamp(lam * 2 + 0.3) * 0.55;  // a thin bluish haze at the lit limb
      for (let k = 0; k < 3; k++) d[o + k] = clamp((col[k] * br * lit * (1 - lh) + haze[k] * lh) / 255) * 255;
      d[o + 3] = 255 * clamp((1 - Math.sqrt(rr)) * R * 0.9);          // an anti-aliased edge
    }
  }
  x.putImageData(img, 0, 0);
  return c;
}

function initJupiter() {
  JP_DISC = jpPaintDisc(1200);
  // stars: painted once, the screen's size, a few brighter ones with a cross
  JP_STARS = mkCanvas(W, H);
  const sx = JP_STARS.getContext('2d'), rng = mulberry32(77);
  for (let i = 0; i < 900; i++) {
    const x = rng() * W, y = rng() * H, r = 0.5 + 1.6 * Math.pow(rng(), 6), a = 0.25 + 0.75 * rng();
    sx.fillStyle = `rgba(${rng() < 0.2 ? '255,226,190' : rng() < 0.4 ? '200,214,255' : '255,255,255'},${a})`;
    sx.beginPath(); sx.arc(x, y, r, 0, 7); sx.fill();
    if (r > 1.7) { sx.fillStyle = `rgba(255,255,255,${0.3 * a})`; sx.fillRect(x - 7, y - 0.5, 14, 1); sx.fillRect(x - 0.5, y - 7, 1, 14); }
  }
  initDecks();
  initMedium();
}

// space: black, the stars, the Sun (into the glow layer) at P (screen)
function jpSpaceBg(t, o = {}) {
  screenSpace();
  ctx.fillStyle = '#020309'; ctx.fillRect(0, 0, W, H);
  const dx = o.dx || 0, dy = o.dy || 0;
  ctx.save(); ctx.globalAlpha = o.stars === undefined ? 1 : o.stars;
  for (const [ox, oy] of [[0, 0], [W, 0], [0, H], [W, H], [-W, 0], [0, -H], [-W, -H], [W, -H], [-W, H]]) {
    const X = ((dx % W) + W) % W - W + ox, Y = ((dy % H) + H) % H - H + oy;
    if (X > -W && X < W && Y > -H && Y < H) ctx.drawImage(JP_STARS, X, Y);
  }
  ctx.restore();
  if (o.sun) {
    const [x, y, r] = o.sun;
    both((c, g) => { softDot(c, x, y, r * 7, '#FFE2A8', g ? 0.55 : 0.25); softDot(c, x, y, r * 2.2, '#FFF4DC', g ? 0.9 : 0.6); circle(c, x, y, r, '#FFFDF4'); });
  }
}
// the planet, centred at (cx, cy) on screen with radius R (px); a = 1 opaque; o.soft = a blurred look (out of focus)
function jpPlanet(cx, cy, R, o = {}) {
  screenSpace();
  ctx.save();
  if (o.soft > 0.01) ctx.filter = `blur(${(o.soft * 10).toFixed(1)}px)`;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(JP_DISC, cx - R, cy - R, 2 * R, 2 * R);
  ctx.restore();
  // the glow of its lit side, and a black occluder in the glow layer so the Sun's bloom does not shine through it
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0);
  gctx.beginPath(); gctx.arc(cx, cy, R * 0.995, 0, 7); gctx.fillStyle = '#000'; gctx.fill();
  gctx.restore();
  if (o.rim !== 0) {
    ctx.save();
    const g = ctx.createRadialGradient(cx, cy, R * 0.985, cx, cy, R * 1.06);
    g.addColorStop(0, 'rgba(255,214,170,0.0)'); g.addColorStop(0.25, 'rgba(255,214,170,0.20)'); g.addColorStop(1, 'rgba(255,214,170,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 1.06, 0, 7); ctx.fill();
    ctx.restore();
  }
}

// ---------------------------------------------------------------- the cloud decks, in perspective
// A camera that falls with the hero. World: X right, Y up (altitude, deck units), Z away from the camera. Screen:
// x = 540 + F (X - cx) / Z, y = yH + F (Ycam - Y) / Z (a camera pitched a little down: the horizon sits at yH).
const JPF = 900, JP_YH = 690;
// The three decks (NASA: ammonia ice on top, ammonium hydrosulfide in the middle, water ice and vapour below), each
// with its top, its bottom, the colours of its tops and undersides, the colour of the gas around it and its wind.
const DECKS = [
  { top: 0, bot: -2.2, topCol: ['#FFFDF6', '#E9DDC8', '#B9A58A'], botCol: ['#D8C8AE', '#B79F80', '#8E7660'], wind: 0.9, seed: 11 },
  { top: -15, bot: -17.4, topCol: ['#F4D9B0', '#D7AE7E', '#9E7650'], botCol: ['#B58B62', '#946B48', '#6E4E34'], wind: -1.3, seed: 23 },
  { top: -30, bot: -32.6, topCol: ['#D9E2EA', '#A9B6C4', '#6E7C8E'], botCol: ['#7E8A98', '#5E6876', '#3E4652'], wind: 1.1, seed: 37 },
];
// the colour of the gas (fog) at altitude y: the sky above the tops, then deeper and darker
const JP_FOG = [[12, '#2A3F66'], [4, '#9DB0C8'], [0.5, '#E4DCCB'], [-2, '#F2E7D2'], [-6, '#DCC4A0'], [-14, '#C49A6C'], [-17, '#9E7450'],
  [-22, '#8E7258'], [-29, '#6E7486'], [-33, '#4C5262'], [-40, '#5A3E2C'], [-52, '#6A3018'], [-64, '#4A1A0C'], [-80, '#1A0805']];
function jpFogAt(y) {
  if (y >= JP_FOG[0][0]) return JP_FOG[0][1];
  for (let i = 0; i < JP_FOG.length - 1; i++) {
    const [a, ca] = JP_FOG[i], [b, cb] = JP_FOG[i + 1];
    if (y <= a && y >= b) return mixH(ca, cb, (a - y) / (a - b));
  }
  return JP_FOG[JP_FOG.length - 1][1];
}
const JP_FOGLV = 7;
let DECK_SPR = null, DECK_PUFFS = null, DECK_WALL = null;
const JP_CUT = 5.4;   // the decks are cut open at this distance: the camera looks at their cross-section and never goes in
// one puff sprite: a cumulus of overlapping round heads, lit from above (tops) or a flatter, darker underside
function jpPuffSprite(cols, seed, under, fog, fogK) {
  const S = 220, c = mkCanvas(S, S), x = c.getContext('2d'), rng = mulberry32(seed);
  x.filter = 'blur(3px)';
  const heads = [];
  for (let i = 0; i < 7; i++) heads.push([S / 2 + (rng() - 0.5) * 120, S / 2 + (under ? -1 : 1) * (rng() * 22) + (under ? 10 : -6), 34 + rng() * 34]);
  if (under) heads.forEach((h) => { h[1] = S / 2 + (h[1] - S / 2) * 0.45; h[2] *= 0.85; });
  // body
  for (const [hx, hy, r] of heads) {
    const g = x.createLinearGradient(0, hy - r, 0, hy + r);
    if (!under) { g.addColorStop(0, cols[0]); g.addColorStop(0.55, cols[1]); g.addColorStop(1, cols[2]); }
    else { g.addColorStop(0, cols[1]); g.addColorStop(0.6, cols[1]); g.addColorStop(1, cols[2]); }
    x.fillStyle = g; x.beginPath(); x.arc(hx, hy, r, 0, 7); x.fill();
  }
  // a lit rim on the tops (the Sun above), a darker skirt underneath
  if (!under) for (const [hx, hy, r] of heads) { x.fillStyle = rgba(cols[0], 0.5); x.beginPath(); x.arc(hx - r * 0.15, hy - r * 0.3, r * 0.62, 0, 7); x.fill(); }
  x.filter = 'none';
  if (fogK > 0) { x.globalCompositeOperation = 'source-atop'; x.fillStyle = rgba(fog, fogK); x.fillRect(0, 0, S, S); x.globalCompositeOperation = 'source-over'; }
  return c;
}
function initDecks() {
  DECK_SPR = DECKS.map((D, di) => {
    const out = { top: [], bot: [] };
    for (const side of ['top', 'bot']) {
      const fog = jpFogAt(side === 'top' ? D.top + 3 : D.bot - 3);
      for (let v = 0; v < 4; v++) {
        const lv = [];
        for (let f = 0; f < JP_FOGLV; f++) lv.push(jpPuffSprite(side === 'top' ? D.topCol : D.botCol, D.seed * 7 + v * 13, side === 'bot', fog, Math.pow(f / (JP_FOGLV - 1), 1.1) * 0.94));
        out[side].push(lv);
      }
    }
    return out;
  });
  // the cut face of each deck (the cake-slice view): rows of puffs across X at Z = JP_CUT, from its top to its bottom
  DECK_WALL = DECKS.map((D) => {
    const rng = mulberry32(D.seed * 31 + 9), P = [];
    for (let row = 0; row < 4; row++) {
      const Y = lerp(D.top - 0.25, D.bot + 0.3, row / 3);
      for (let X = -16; X < 16; X += 0.62) P.push({ X: X + (rng() - 0.5) * 0.4, Y: Y + (rng() - 0.5) * 0.3, r: 0.62 + 0.4 * rng(), v: Math.floor(rng() * 4), row });
    }
    return P;
  });
  // the puffs of each deck on a jittered grid whose cell grows with the distance (an even texture on screen)
  DECK_PUFFS = DECKS.map((D, di) => {
    const rng = mulberry32(D.seed * 101 + 5), P = [];
    for (let Z = 1.1; Z < 70; Z *= 1.055) {
      const r = 0.55 + 0.032 * Z, half = 0.75 * Z + 6 + 3 * r, cell = r * 1.05;
      for (let X = -half; X < half; X += cell) {
        P.push({ X: X + (rng() - 0.5) * cell, Z: Z * (1 + (rng() - 0.5) * 0.05), r: r * (0.75 + 0.6 * rng()), v: Math.floor(rng() * 4), dy: (rng() - 0.5) * 0.35 * r, half });
      }
    }
    P.sort((a, b) => b.Z - a.Z);
    return P;
  });
}
// project a world point for a camera {x, y (altitude), yH}
function jpProj(cam, X, Y, Z) { return [540 + JPF * (X - cam.x) / Z, cam.yH + JPF * (cam.y - Y) / Z, JPF / Z]; }
// draw one deck's tops (seen from above) or undersides (from below), only puffs with Z in [z0, z1)
function jpDeck(cam, t, di, side, z0 = 0, z1 = 1e9, o = {}) {
  z0 = Math.max(z0, o.cut || 0);
  const D = DECKS[di], spr = DECK_SPR[di][side], P = DECK_PUFFS[di];
  const Y = side === 'top' ? D.top : D.bot, h = cam.y - Y;
  if (side === 'top' && h < -0.4) return;            // under its top: it is a ceiling now (drawn as 'bot')
  if (side === 'bot' && h > 0.4) return;
  const drift = D.wind * t, a = o.alpha === undefined ? 1 : o.alpha;
  screenSpace();
  ctx.save(); ctx.globalAlpha = a;
  const zf = o.fogZ || 34;                            // the distance at which a puff has gone into the haze
  for (const p of P) {
    if (p.Z < z0 || p.Z >= z1) continue;
    const span = 2 * p.half;
    let X = p.X + drift * (0.6 + 0.4 * Math.min(1, 12 / p.Z));
    X = ((X + p.half) % span + span) % span - p.half;
    const s = JPF / p.Z, x = 540 + (X - cam.x) * s, y = cam.yH + (h - (side === 'top' ? p.dy : -p.dy)) * s;
    const R = p.r * s * 1.25;
    if (x < -R || x > W + R || y < -R || y > H + R) continue;
    const f = Math.min(JP_FOGLV - 1, Math.floor(clamp(Math.pow(p.Z / zf, 0.85)) * (JP_FOGLV - 1) + 0.5));
    const sq = side === 'top' ? clamp(0.42 + 0.6 * Math.abs(h) / p.Z * 3, 0.42, 1) : clamp(0.38 + 0.6 * Math.abs(h) / p.Z * 3, 0.38, 1);
    ctx.drawImage(spr[p.v][f], x - R, y - R * sq, 2 * R, 2 * R * sq);
  }
  ctx.restore();
}
// the far cloud sea toward the horizon (behind the puffs): a band of haze that ends at the horizon line
function jpHorizonSea(cam, di, side, a = 1) {
  const D = DECKS[di], Y = side === 'top' ? D.top : D.bot, h = cam.y - Y;
  if ((side === 'top' && h < 0) || (side === 'bot' && h > 0)) return;
  screenSpace();
  const yFar = cam.yH + JPF * h / 70, fog = jpFogAt(side === 'top' ? D.top + 3 : D.bot - 3);
  const col = side === 'top' ? D.topCol[1] : D.botCol[1];
  const g = ctx.createLinearGradient(0, cam.yH, 0, yFar + (yFar - cam.yH) * 2);
  g.addColorStop(0, rgba(fog, a)); g.addColorStop(0.35, rgba(mixH(fog, col, 0.5), a)); g.addColorStop(1, rgba(col, a));
  ctx.fillStyle = g;
  if (side === 'top') ctx.fillRect(0, cam.yH - 2, W, H - cam.yH + 2);
  else ctx.fillRect(0, 0, W, cam.yH + 2);
}
// the gas between decks: a vertical gradient from the colour above to the colour below, through the horizon
let JP_TOWERS = null;
function jpTowerSprite(seed) {
  const Wd = 460, Ht = 780, c = mkCanvas(Wd, Ht), x = c.getContext('2d'), rng = mulberry32(seed);
  x.filter = 'blur(5px)';
  const puff = (px, py, r, lit) => {                     // a cauliflower head, lit from the right (the Sun)
    const g = x.createRadialGradient(px + r * 0.35, py - r * 0.3, r * 0.1, px, py, r);
    g.addColorStop(0, lit ? '#FFFBF2' : '#F4EAD6'); g.addColorStop(0.7, lit ? '#EADFC8' : '#D9CAAE'); g.addColorStop(1, '#C2AE8E');
    x.fillStyle = g; x.beginPath(); x.arc(px, py, r, 0, 7); x.fill();
  };
  // the column: heads stacked up, swelling at the base and just under the anvil
  for (let i = 0; i < 70; i++) {
    const u = Math.pow(rng(), 0.9), y = Ht - 30 - u * (Ht - 230), half = 55 + 40 * Math.sin(u * 2.8 + 0.4) + 30 * (1 - u);
    const xx = Wd / 2 + (rng() - 0.5) * 2 * half + 25 * u, r = 30 + 26 * rng() + 18 * (1 - u);
    puff(xx, y, r, xx > Wd / 2);
  }
  // the anvil: a flat sheet sheared downwind, thin at its tip
  for (let i = 0; i < 46; i++) {
    const u = rng(), xx = 70 + u * 360, y = 190 + (rng() - 0.5) * (46 - 30 * u) + 18 * (1 - u), r = 20 + 22 * (1 - u * 0.6) * rng() + 8;
    puff(xx, y, r, rng() < 0.6);
  }
  x.filter = 'none';
  // haze: the far air between us and it
  x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(176,192,214,0.38)'; x.fillRect(0, 0, Wd, Ht);
  const g = x.createLinearGradient(0, Ht * 0.55, 0, Ht); g.addColorStop(0, 'rgba(214,214,214,0)'); g.addColorStop(1, 'rgba(232,226,212,0.75)');
  x.fillStyle = g; x.fillRect(0, 0, Wd, Ht);
  return c;
}
// over the top deck: a small hard Sun, thin streaks of high haze, and far storm towers standing on the horizon
function jpSkyDecor(cam, t, a = 1) {
  if (a <= 0.01) return;
  if (!JP_TOWERS) JP_TOWERS = [jpTowerSprite(3), jpTowerSprite(8), jpTowerSprite(13)];
  screenSpace();
  ctx.save(); ctx.globalAlpha = a;
  for (let i = 0; i < 7; i++) {                           // cirrus streaks
    const y = cam.yH - 60 - i * 70 - 12 * Math.sin(i * 1.7), x0 = ((i * 397 + t * 18 * (i % 2 ? 1 : -1)) % 1600) - 300;
    const g = ctx.createLinearGradient(x0, 0, x0 + 700, 0);
    g.addColorStop(0, 'rgba(230,236,246,0)'); g.addColorStop(0.5, `rgba(230,236,246,${0.10 + 0.05 * (i % 3)})`); g.addColorStop(1, 'rgba(230,236,246,0)');
    ctx.fillStyle = g; ctx.fillRect(x0, y - 5 - 2 * (i % 2), 700, 10 + 4 * (i % 2));
  }
  for (const [i, x, s] of [[0, 150, 0.62], [1, 900, 0.8], [2, 520, 0.36]]) {   // the towers, far off in the haze
    const sp = JP_TOWERS[i], w = 460 * s, h = 780 * s, xx = x + 6 * Math.sin(t * 0.2 + i);
    ctx.globalAlpha = a * 0.8;
    ctx.drawImage(sp, xx - w / 2, cam.yH - h + 30 * s, w, h);
  }
  ctx.restore();
  // the Sun: high on the right, into the glow layer
  const sx = 840, sy = cam.yH - 470;
  both((c, g) => { softDot(c, sx, sy, 210, '#FFF0C8', g ? 0.5 : 0.22 * a); softDot(c, sx, sy, 60, '#FFFAEE', g ? 0.9 : 0.6 * a); circle(c, sx, sy, 22, '#FFFFFF'); });
}
function jpGasBg(cam, o = {}) {
  screenSpace();
  const up = jpFogAt(cam.y + 5), mid = jpFogAt(cam.y), dn = jpFogAt(cam.y - 5);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, up); g.addColorStop(cam.yH / H, mid); g.addColorStop(1, dn);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (o.sky) {                                        // above the top deck: the sky darkens toward space
    const s = ctx.createLinearGradient(0, 0, 0, cam.yH);
    s.addColorStop(0, rgba('#0A1430', o.sky)); s.addColorStop(0.7, rgba('#3B5A8A', 0.5 * o.sky)); s.addColorStop(1, rgba('#3B5A8A', 0));
    ctx.fillStyle = s; ctx.fillRect(0, 0, W, cam.yH);
  }
}
// the whole deck world for the falling camera: gas, then each deck far to near (its far sea, its puffs behind the hero,
// the holes he left), then `mid` (the hero), then the puffs between the cut and him, then the cut faces in front.
// o: {zh (the hero's distance, 6), cut, holes: [{di, side, X, Z, k}], mid(), sun(), fogZ}
function jpDeckWorld(cam, t, o = {}) {
  jpGasBg(cam, { sky: clamp((cam.y - 1) / 6) });
  jpSkyDecor(cam, t, clamp((cam.y - DECKS[0].top - 0.3) / 1.5));
  if (o.sun) o.sun();
  const zh = o.zh || 6, cut = o.cut === undefined ? JP_CUT : o.cut, order = [];
  for (let di = 0; di < DECKS.length; di++) {
    const D = DECKS[di];
    if (cam.y > D.top) order.push([di, 'top', cam.y - D.top]);
    else if (cam.y < D.bot) order.push([di, 'bot', D.bot - cam.y]);
  }
  order.sort((a, b) => b[2] - a[2]);                      // the farther (vertically) first: nearer decks cover them
  for (const [di, side, dist] of order) {
    if (dist > 26) continue;
    const a = clamp(1.4 - dist / 22);
    jpHorizonSea(cam, di, side, clamp(1.4 - dist / 20));
    jpDeck(cam, t, di, side, zh, 1e9, { alpha: a, fogZ: o.fogZ });
    for (const hl of o.holes || []) if (hl.di === di && hl.side === side) jpHole(cam, di, side, hl.X, hl.Z, hl.k * a, t);
  }
  if (o.mid) o.mid();
  for (const [di, side, dist] of order) { if (dist <= 26) jpDeck(cam, t, di, side, cut, zh, { alpha: clamp(1.4 - dist / 22), fogZ: o.fogZ }); }
  for (let di = 0; di < DECKS.length; di++) jpDeckWall(cam, t, di);
}

// ---------------------------------------------------------------- the thickening: soup, syrup, a hot dark ocean
// m = 0 the gas under the clouds, 1 soup, 2 syrup, 3 the hot dark ocean (metallic, glowing from below)
const JP_MED = [
  { top: '#6A5040', mid: '#8E6040', bot: '#5A3A28', fog: '#7A5236' },
  { top: '#A4502A', mid: '#C86A30', bot: '#7A3218', fog: '#B85A2A' },
  { top: '#9A5A10', mid: '#C88418', bot: '#6A3A06', fog: '#B87414' },
  { top: '#120608', mid: '#2A0A08', bot: '#C2380E', fog: '#3A0E08' },
];
function jpMedAt(m) {
  const i = Math.min(2, Math.floor(clamp(m, 0, 2.999))), k = clamp(m - i);
  const a = JP_MED[i], b = JP_MED[i + 1], o = {};
  for (const key of ['top', 'mid', 'bot', 'fog']) o[key] = mixH(a[key], b[key], k);
  return o;
}
let MED_BITS = null;
function initMedium() {
  // things drifting in the medium, placed in 3D round the hero (Z 2..40), each with a kind per stage
  const rng = mulberry32(4401);
  MED_BITS = [];
  for (let i = 0; i < 260; i++) {
    MED_BITS.push({ X: (rng() - 0.5) * 2, Y: rng(), Z: 2 + 38 * Math.pow(rng(), 1.3), r: rng(), s: rng(), k: Math.floor(rng() * 6), sp: 0.6 + 0.8 * rng(), ph: rng() * 6.28 });
  }
  MED_BITS.sort((a, b) => b.Z - a.Z);
}
// the medium's backdrop; glow = the heat from below (0..1)
function jpMedBg(m, t, o = {}) {
  screenSpace();
  const M = jpMedAt(m), g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, M.top); g.addColorStop(0.55, M.mid); g.addColorStop(1, M.bot);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const heat = clamp(m - 2.2);
  if (heat > 0.01) {                                   // the ocean: a glow from far below, into the glow layer
    both((c, gl) => {
      const rg = c.createRadialGradient(540, H + 380, 80, 540, H + 380, 1500);
      rg.addColorStop(0, rgba('#FF8A2A', (gl ? 0.75 : 0.55) * heat)); rg.addColorStop(0.45, rgba('#C8300C', (gl ? 0.3 : 0.35) * heat)); rg.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = rg; c.fillRect(0, 0, W, H);
    });
    // slow silvery ripples: the liquid metal
    ctx.save(); ctx.globalAlpha = 0.16 * heat;
    for (let i = 0; i < 9; i++) {
      const y = ((i * 230 + t * 60) % 2100) - 90, a = 0.5 + 0.5 * Math.sin(i * 2.1 + t * 1.3);
      ctx.strokeStyle = `rgba(255,214,190,${0.45 * a})`; ctx.lineWidth = 3;
      ctx.beginPath();
      for (let x = -20; x <= W + 20; x += 30) ctx.lineTo(x, y + 18 * Math.sin(x * 0.011 + t * 1.7 + i));
      ctx.stroke();
    }
    ctx.restore();
  }
}

// the deck's cut face at Z = JP_CUT: a wall of puffs (lit from above, darker toward the bottom)
function jpDeckWall(cam, t, di, o = {}) {
  const D = DECKS[di], P = DECK_WALL[di], Z = JP_CUT, sc = JPF / Z, drift = D.wind * t * 1.0;
  const ytop = cam.yH + (cam.y - D.top) * sc, ybot = cam.yH + (cam.y - D.bot) * sc;
  if (ybot < -200 || ytop > H + 200) return;
  screenSpace();
  ctx.save(); ctx.globalAlpha = o.alpha === undefined ? 1 : o.alpha;
  // a solid core first, so the wall has no holes between its puffs
  const g = ctx.createLinearGradient(0, ytop, 0, ybot);
  g.addColorStop(0, D.topCol[1]); g.addColorStop(1, D.botCol[2]);
  ctx.fillStyle = g; ctx.fillRect(-10, ytop + 0.45 * sc * 0.6, W + 20, Math.max(0, ybot - ytop - 0.9 * sc * 0.6));
  const spr = DECK_SPR[di];
  for (const p of P) {
    let X = p.X + drift; X = ((X + 16) % 32 + 32) % 32 - 16;
    const x = 540 + (X - cam.x) * sc, y = cam.yH + (cam.y - p.Y) * sc, R = p.r * sc * 1.25;
    if (x < -R || x > W + R || y < -R || y > H + R) continue;
    const img = p.row < 2 ? spr.top[p.v][1] : spr.bot[p.v][1];
    ctx.drawImage(img, x - R, y - R * 0.8, 2 * R, 1.6 * R);
  }
  ctx.restore();
}
// the hole he leaves: on the deck's top (dark, the gas below shows through) or its underside (bright, sunlight
// pouring through, with shafts down into the glow layer). X, Z = where he went through; k = 0..1
function jpHole(cam, di, side, X, Z, k = 1, t = 0) {
  if (k <= 0.01) return;
  const D = DECKS[di], Y = side === 'top' ? D.top : D.bot, h = cam.y - Y;
  if ((side === 'top' && h < 0.05) || (side === 'bot' && h > -0.05)) return;
  if (side === 'bot') k *= clamp((-h - 0.6) / 1.6);          // fades in as the camera drops away from the underside (no flash over him)
  if (k <= 0.01) return;
  const sc = JPF / Z, x = 540 + (X - cam.x) * sc, y = cam.yH + h * sc;
  const sq = clamp(Math.abs(h) / Z * 1.1, 0.4, 0.9), s = (typeof HS === 'number' ? HS : 1) * 6 / Z;
  screenSpace();
  ctx.save();
  if (side === 'top') {
    ctx.globalAlpha = k;
    jpManPath(ctx, x, y, s, sq); ctx.fillStyle = mixH(jpFogAt(D.bot - 2), '#3A2A1E', 0.35); ctx.fill('nonzero');
    ctx.lineWidth = 10 * s; ctx.strokeStyle = rgba(D.topCol[2], 0.7); ctx.stroke();
  } else {
    ctx.globalAlpha = k;
    // a soft shaft of the light above, down from it (dim: it must not wash him out)
    const gr = ctx.createLinearGradient(0, y, 0, y + 800);
    gr.addColorStop(0, 'rgba(255,244,214,0.30)'); gr.addColorStop(1, 'rgba(255,244,214,0)');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(x - 120 * s, y); ctx.lineTo(x + 120 * s, y); ctx.lineTo(x + 240 * s, y + 800); ctx.lineTo(x - 240 * s, y + 800); ctx.closePath(); ctx.fill();
    jpManPath(ctx, x, y, s, sq); ctx.lineWidth = 16 * s; ctx.lineJoin = 'round'; ctx.strokeStyle = rgba(D.botCol[2], 0.9); ctx.stroke();
    ctx.fillStyle = mixH(jpFogAt(D.top + 3), '#FFF6E0', 0.35); ctx.fill('nonzero');
    gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); gctx.globalAlpha = 0.22 * k;
    jpManPath(gctx, x, y, s, sq); gctx.fillStyle = '#FFF2D6'; gctx.fill('nonzero');
    gctx.restore();
  }
  ctx.restore();
}
