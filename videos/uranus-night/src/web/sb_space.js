// Would SATURN Float in Your Bathtub? 🪐: space and the planets (29 Oct 2026, the ninth CURIOUS Short).
// Space as three tiled star layers at their own parallax, the Milky Way and a nebula painted once, and the Sun low on the
// left (the key light of every front shot). The planets are painted once, pixel by pixel: Saturn (soft butterscotch
// bands, a bluish north, the shadow its rings throw on it, an oblate globe; a face-on ring texture with the C, B and A
// rings, the Cassini division, the Encke gap and the F ring, and the planet's own shadow across the rings, all from the
// same Sun), Jupiter (jupiter-no-ground's jpPaintDisc, renamed), Earth, and the small ones. Every position comes from a
// seeded generator: frames render identically every time.
'use strict';

// ---------------------------------------------------------------- tiny value noise (jupiter-no-ground's JPN)
const SBN = (() => {
  const N = 256, g = new Float32Array(N * N), rng = mulberry32(4471);
  for (let i = 0; i < N * N; i++) g[i] = rng();
  const at = (x, y) => g[((y & 255) << 8) | (x & 255)];
  function n2(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
    const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    const a = at(xi, yi), b = at(xi + 1, yi), c = at(xi, yi + 1), d = at(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  function fbm(x, y, o = 4) { let s = 0, a = 0.5, n = 0; for (let i = 0; i < o; i++) { s += a * n2(x, y); n += a; x = x * 2.03 + 17.1; y = y * 2.03 + 9.7; a *= 0.5; } return s / n; }
  return { n2, fbm };
})();
const sbRGB = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const sbNorm = (v) => { const n = Math.hypot(v[0], v[1], v[2]); return [v[0] / n, v[1] / n, v[2] / n]; };
const sbDot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
// the Sun, for every painted planet: left, a little above, in front (screen terms: x right, y down, z to the viewer)
const SB_SUN = sbNorm([-0.62, -0.42, 0.66]);

// ---------------------------------------------------------------- space, painted once
let SB_STAR = null, SB_MW = null;
function sbInitSpace() {
  SB_STAR = [0, 1, 2].map((layer) => {
    const c = mkCanvas(W, H), x = c.getContext('2d'), rng = mulberry32(911 + layer * 31);
    const n = [1500, 300, 46][layer];
    for (let i = 0; i < n; i++) {
      const px = rng() * W, py = rng() * H;
      const r = layer === 0 ? 0.5 + 0.9 * Math.pow(rng(), 3) : layer === 1 ? 1.0 + 1.3 * Math.pow(rng(), 2) : 1.8 + 1.6 * rng();
      const a = layer === 0 ? 0.2 + 0.6 * rng() : 0.55 + 0.45 * rng();
      const tint = rng() < 0.18 ? '255,222,186' : rng() < 0.36 ? '196,214,255' : '255,255,255';
      x.fillStyle = `rgba(${tint},${a})`; x.beginPath(); x.arc(px, py, r, 0, 7); x.fill();
      if (layer === 2) {
        const g = x.createRadialGradient(px, py, 0, px, py, r * 7);
        g.addColorStop(0, `rgba(${tint},${0.35 * a})`); g.addColorStop(1, `rgba(${tint},0)`);
        x.fillStyle = g; x.beginPath(); x.arc(px, py, r * 7, 0, 7); x.fill();
        x.fillStyle = `rgba(255,255,255,${0.35 * a})`; x.fillRect(px - r * 6, py - 0.6, r * 12, 1.2); x.fillRect(px - 0.6, py - r * 6, 1.2, r * 12);
      }
    }
    return c;
  });
  // the Milky Way: a soft diagonal band with dark dust lanes, and a violet-and-teal nebula low on the right (half size)
  const w = W / 2, h = H / 2;
  SB_MW = mkCanvas(w, h);
  const x = SB_MW.getContext('2d'), img = x.createImageData(w, h), d = img.data;
  const core = sbRGB('#E8D2B8'), edge = sbRGB('#6E7FB8'), neb1 = sbRGB('#7A3E9C'), neb2 = sbRGB('#1F7C8E');
  for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) {
    const u = px / w, v = py / h, o = (py * w + px) * 4;
    // distance from the band's axis (from upper right to lower left)
    const ax = (u - 0.95) * 0.82 + (v - 0.0) * 0.57, dist = (u - 0.95) * -0.57 + (v - 0.0) * 0.82 - 0.0;
    const across = (u * 0.57 + v * 0.82 - 0.62);
    const wob = 0.06 * (SBN.fbm(ax * 4 + 3, 7, 3) - 0.5);
    const band = Math.exp(-Math.pow((across + wob) / 0.13, 2));
    const cl = SBN.fbm(u * 9 + 1, v * 9 + 4, 5);
    const dust = clamp((SBN.fbm(u * 14 + 9, v * 14 + 2, 4) - 0.52) * 4) * Math.exp(-Math.pow((across + wob + 0.01) / 0.05, 2));
    let a = band * (0.18 + 0.55 * cl) * (1 - 0.85 * dust);
    const kk = clamp(band * 1.2);
    let col = [lerp(edge[0], core[0], kk), lerp(edge[1], core[1], kk), lerp(edge[2], core[2], kk)];
    // the nebula
    const nb = Math.exp(-((u - 0.82) ** 2 / 0.05 + (v - 0.74) ** 2 / 0.03)) * clamp(SBN.fbm(u * 6 + 30, v * 6 + 11, 5) * 1.6 - 0.45);
    if (nb > 0.01) {
      const m = SBN.n2(u * 7 + 3, v * 7 + 8);
      const nc = [lerp(neb1[0], neb2[0], m), lerp(neb1[1], neb2[1], m), lerp(neb1[2], neb2[2], m)];
      const tot = a + nb * 0.8;
      col = [(col[0] * a + nc[0] * nb * 0.8) / tot, (col[1] * a + nc[1] * nb * 0.8) / tot, (col[2] * a + nc[2] * nb * 0.8) / tot];
      a = tot;
    }
    d[o] = col[0]; d[o + 1] = col[1]; d[o + 2] = col[2]; d[o + 3] = 255 * clamp(a * 0.85);
    void dist;
  }
  x.putImageData(img, 0, 0);
}
// a camera for a far layer: the same framing, a parallax factor p (0 = fixed to the screen, 1 = the world)
function sbLayerCam(cam, p) { return { x: 540 + (cam.x - 540) * p, y: 960 + (cam.y - 960) * p, zoom: 1 + (cam.zoom - 1) * p, rot: (cam.rot || 0) * p, sx: cam.sx, sy: cam.sy }; }
// a tile drawn wrapped across the screen for a layer camera (the tile is world-sized at zoom 1)
function sbTile(img, lc, tw, th, alpha = 1) {
  const z = lc.zoom, ox = 540 - lc.x * z, oy = 960 - lc.y * z;
  const w = tw * z, h = th * z;
  const i0 = Math.floor(-ox / w) - 1, j0 = Math.floor(-oy / h) - 1;
  ctx.save(); ctx.globalAlpha = alpha;
  for (let i = i0; i < i0 + Math.ceil(W / w) + 3; i++) for (let j = j0; j < j0 + Math.ceil(H / h) + 3; j++) {
    const X = ox + i * w, Y = oy + j * h;
    if (X > W || Y > H || X + w < 0 || Y + h < 0) continue;
    ctx.drawImage(img, X, Y, w, h);
  }
  ctx.restore();
}
// the backdrop: black space, the Milky Way, three star layers; the Sun low on the left (o.sun: false to hide it)
function sbSpaceBg(cam, t, o = {}) {
  screenSpace();
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#04050F'); g.addColorStop(0.55, '#070A1C'); g.addColorStop(1, '#0B0C22');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const mw = sbLayerCam(cam, 0.04);
  sbTile(SB_MW, mw, W, H, o.mw === undefined ? 1 : o.mw);
  const tw = 0.5 + 0.5 * Math.sin(t * loopW(1.3));
  sbTile(SB_STAR[0], sbLayerCam(cam, 0.07), W, H, 0.9);
  sbTile(SB_STAR[1], sbLayerCam(cam, 0.14), W, H, 0.85 + 0.15 * tw);
  sbTile(SB_STAR[2], sbLayerCam(cam, 0.24), W, H, 1);
  if (o.sun !== false) sbSun(cam, t, o.sunAt || [154, 695], o.sunR || 30);
}
// the Sun at a point of its own layer (parallax 0.12): a white disc in a warm halo, bloom in the glow layer
function sbSun(cam, t, at, r) {
  const lc = sbLayerCam(cam, 0.12);
  const [x, y] = toScreen(lc, at[0], at[1]);
  const R = r * lc.zoom;
  screenSpace();
  softDot(ctx, x, y, R * 9, '#FFB86A', 0.16);
  softDot(ctx, x, y, R * 3.2, '#FFE2A8', 0.5);
  circle(ctx, x, y, R, '#FFFBEE');
  softDot(gctx, x, y, R * 4.2, '#FFE2A8', 0.85);
  softDot(gctx, x, y, R * 1.6, '#FFFFFF', 0.9);
  // four soft spikes
  ctx.save(); ctx.translate(x, y); ctx.rotate(0.3);
  for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); const gg = ctx.createLinearGradient(0, 0, R * 7, 0); gg.addColorStop(0, 'rgba(255,240,210,0.55)'); gg.addColorStop(1, 'rgba(255,240,210,0)'); ctx.fillStyle = gg; ctx.beginPath(); ctx.moveTo(0, -R * 0.18); ctx.lineTo(R * 7, 0); ctx.lineTo(0, R * 0.18); ctx.fill(); }
  ctx.restore();
  return [x, y];
}

// ---------------------------------------------------------------- Saturn, painted once
// latitude bands, north (+90) to south: [start latitude, colour] (Cassini's natural-colour Saturn: a cream-gold equator,
// tan belts, golden mid-latitudes, a grey-blue north)
const SB_SAT_BANDS = [[90, '#8FA2AE'], [74, '#9AA8A6'], [62, '#B4AE90'], [52, '#C9B486'], [44, '#D8BF88'], [36, '#C6A570'],
  [29, '#DCC48E'], [21, '#CBA86E'], [14, '#E2CC97'], [8, '#EEDDAE'], [-8, '#E6D2A0'], [-14, '#C9A66C'], [-21, '#DABF8A'],
  [-30, '#C8A774'], [-40, '#D4BC8A'], [-52, '#BFAE88'], [-66, '#ABA48E'], [-90, '#A09C90']];
function sbBand(bands, lat) {
  for (let i = 0; i < bands.length - 1; i++) {
    const [a, ca] = bands[i], [b, cb] = bands[i + 1];
    if (lat <= a && lat > b) {
      const e = 2.2, k = (a - lat) < e ? 0.5 - 0.5 * (a - lat) / e : 0;
      const prev = i > 0 ? bands[i - 1][1] : ca, ra = sbRGB(ca), rb = sbRGB(prev);
      return [lerp(ra[0], rb[0], k), lerp(ra[1], rb[1], k), lerp(ra[2], rb[2], k)];
    }
  }
  return sbRGB(bands[bands.length - 1][1]);
}
// ring radii in Saturn radii and how solid each part is (C faint, B dense, the Cassini division nearly empty, A medium)
const SB_RING = { inner: 1.239, outer: 2.33 };
function sbRingAt(r) {
  // returns [opacity 0..1, brightness 0..1, warmth 0..1]: a cartoon's crisp, solid rings (the shape map counts an image as
  // solid only when most of it is over 90 % opaque: see-through rings let the light stage draw his body's shading over them)
  const fine = SBN.n2(r * 160, 3.3) - 0.5, fine2 = SBN.n2(r * 420, 9.1) - 0.5;
  if (r < 1.239 || r > 2.335) return [0, 0, 0];
  if (r < 1.527) return [0.94, 0.5 + 0.08 * fine2 + 0.06 * fine, 0.2];                          // C ring: darker, greyer
  if (r < 1.951) { const k = (r - 1.527) / 0.424; return [0.98, 0.9 + 0.1 * fine2 + 0.05 * Math.sin(k * 9), 0.7]; }   // B ring
  if (r < 2.027) return [0.94, 0.16, 0.2];                                                         // the Cassini division
  if (r < 2.269) { const enc = Math.abs(r - 2.214) < 0.007; return [0.96, enc ? 0.2 : 0.8 + 0.1 * fine2, 0.5]; }   // A ring (+ the Encke gap)
  if (Math.abs(r - 2.326) < 0.005) return [0.7, 0.95, 0.4];                                       // the F ring
  return [0, 0, 0];
}
// the globe: an oblate disc of radius R (px) seen from el (rad) above its ring plane; face: light from SB_SUN
function sbPaintSaturn(R, el) {
  const OB = 0.9, S = 2 * R, c = mkCanvas(S, S), x = c.getContext('2d'), img = x.createImageData(S, S), d = img.data;
  const Pv = [0, -Math.cos(el), Math.sin(el)], Fv = [0, Math.sin(el), Math.cos(el)], L = SB_SUN;
  const lp = sbDot(L, Pv);
  for (let py = 0; py < S; py++) {
    for (let px = 0; px < S; px++) {
      const o = (py * S + px) * 4;
      const nx = (px + 0.5 - R) / R, ny = (py + 0.5 - R) / (R * (OB + (1 - OB) * Math.sin(el) * 0.6));
      const rr = nx * nx + ny * ny;
      if (rr > 1) { d[o + 3] = 0; continue; }
      const nz = Math.sqrt(1 - rr), n = [nx, ny, nz];
      const lat0 = Math.asin(clamp(sbDot(n, Pv), -1, 1)) * 57.2958, lon = Math.atan2(nx, sbDot(n, Fv));
      const tw = SBN.fbm(lon * 2.6 + 40, lat0 * 0.18 + 11, 4) - 0.5;
      const lat = lat0 + 2.6 * tw;
      let col = sbBand(SB_SAT_BANDS, lat);
      const fine = SBN.fbm(lon * 18 + 5, lat0 * 1.3 + 2, 3) - 0.5, streak = SBN.fbm(lon * 3 + 9, lat0 * 3.1 + 4, 2) - 0.5;
      let br = 1 + 0.07 * fine + 0.08 * streak;
      // the hexagon round the north pole: a darker six-sided band near 78 degrees
      if (lat0 > 70) {
        const ang = Math.atan2(sbDot(n, [1, 0, 0]), sbDot(n, Fv)), hx = Math.cos(Math.PI / 6) / Math.cos(((ang % (Math.PI / 3)) + Math.PI / 3) % (Math.PI / 3) - Math.PI / 6);
        const colat = (90 - lat0) / (12 * hx);
        if (Math.abs(colat - 1) < 0.16) { br *= 0.86; col = [col[0] * 0.92, col[1] * 0.97, col[2] * 1.04]; }
      }
      // the light: the Sun on the left; a gas giant's limb darkening
      const lam = sbDot(n, L);
      let lit = clamp(0.24 + 0.92 * Math.pow(clamp(lam * 0.9 + 0.1), 0.8)) * (0.74 + 0.26 * Math.pow(nz, 0.35));
      // the shadow of the rings on the globe: the ray from this point to the Sun crosses the ring plane inside the rings
      const pp = sbDot(n, Pv);
      if (lp !== 0) {
        const s = -pp / lp;
        if (s > 0) {
          const h = [n[0] + s * L[0], n[1] + s * L[1], n[2] + s * L[2]];
          const [op] = sbRingAt(Math.hypot(h[0], h[1], h[2]));
          lit *= 1 - 0.72 * op;
        }
      }
      const m = (col[0] + col[1] + col[2]) / 3;
      for (let k = 0; k < 3; k++) d[o + k] = clamp((m + (col[k] - m) * 1.25) * br * lit / 255) * 255;
      d[o + 3] = 255 * clamp((1 - Math.sqrt(rr)) * R * 0.9);
    }
  }
  x.putImageData(img, 0, 0);
  return c;
}
// the rings, face on (Saturn radius Rs px in the texture), with the planet's shadow for a view from el
function sbPaintRings(Rs, el) {
  const RO = SB_RING.outer * Rs, S = Math.ceil(2 * RO + 4), c = mkCanvas(S, S), x = c.getContext('2d'), img = x.createImageData(S, S), d = img.data;
  const C = S / 2, L = SB_SUN, Fv = [0, Math.sin(el), Math.cos(el)], Ev = [1, 0, 0];
  const warm = sbRGB('#F2DDA8'), cool = sbRGB('#CDBF9E'), dark = sbRGB('#9A8A6C');
  for (let py = 0; py < S; py++) for (let px = 0; px < S; px++) {
    const u = (px + 0.5 - C) / Rs, v = (py + 0.5 - C) / Rs, r = Math.hypot(u, v), o = (py * S + px) * 4;
    const [op, bri, wa] = sbRingAt(r);
    if (op <= 0) { d[o + 3] = 0; continue; }
    // the planet's shadow: does the ray from this ring point toward the Sun pass through the globe?
    const h = [u * Ev[0] + v * Fv[0], u * Ev[1] + v * Fv[1], u * Ev[2] + v * Fv[2]];
    const hl = sbDot(h, L), dd = hl * hl - (sbDot(h, h) - 1);
    let sh = 1;
    if (dd > 0 && -hl - Math.sqrt(dd) > 0) sh = 0.35;
    const col = [lerp(cool[0], warm[0], wa), lerp(cool[1], warm[1], wa), lerp(cool[2], warm[2], wa)];
    for (let k = 0; k < 3; k++) d[o + k] = clamp((lerp(dark[k], col[k], bri)) * (0.35 + 0.65 * sh) * 1.04 / 255) * 255;
    d[o + 3] = 255 * clamp(op);
  }
  x.putImageData(img, 0, 0);
  return { c, Rs, C };
}

// ---------------------------------------------------------------- Jupiter (jupiter-no-ground's jpPaintDisc, renamed)
const SB_JP_BANDS = [
  [90, '#8C8A86'], [58, '#9A8C7C'], [48, '#C9B596'], [41, '#A27E62'], [35, '#D3BFA0'], [27, '#9B7356'], [22, '#D9C6A6'],
  [17, '#8A5638'], [8, '#E6D3B2'], [-6, '#EADCC2'], [-8, '#9C6A48'], [-19, '#E2CFAE'], [-27, '#B08A68'], [-33, '#D6C2A2'],
  [-39, '#A98566'], [-46, '#C8B497'], [-57, '#958676'], [-90, '#8A8884'],
];
function sbPaintJupiter(R) {
  const S = 2 * R, c = mkCanvas(S, S), x = c.getContext('2d'), img = x.createImageData(S, S), d = img.data, L = SB_SUN;
  const grs = sbRGB('#C25E3A'), grs2 = sbRGB('#DE9A70'), collar = sbRGB('#EFE3CE');
  for (let py = 0; py < S; py++) {
    const ny = (py + 0.5 - R) / R;
    for (let px = 0; px < S; px++) {
      const nx = (px + 0.5 - R) / R, rr = nx * nx + ny * ny, o = (py * S + px) * 4;
      if (rr > 1) { d[o + 3] = 0; continue; }
      const nz = Math.sqrt(1 - rr), lat0 = -Math.asin(ny) * 57.2958, lon = Math.atan2(nx, nz);
      const tw = SBN.fbm(lon * 3.2 + 40, lat0 * 0.21 + 11, 4) - 0.5, tf = SBN.fbm(lon * 9 + 3, lat0 * 0.55 + 70, 3) - 0.5;
      let col = sbBand(SB_JP_BANDS, lat0 + 5.2 * tw + 1.6 * tf);
      const fine = SBN.fbm(lon * 22 + 5, lat0 * 1.4 + 2, 3) - 0.5;
      let br = 1 + 0.16 * fine;
      const gx = (lon - 0.35) / 0.3, gy = (lat0 + 22.5) / 7.2, gr = Math.hypot(gx, gy);
      if (gr < 1) { const k = clamp(1 - gr * gr); col = [lerp(grs2[0], grs[0], k), lerp(grs2[1], grs[1], k), lerp(grs2[2], grs[2], k)]; }
      else if (gr < 1.45) { const k = Math.exp(-Math.pow((gr - 1.15) / 0.17, 2)); col = [lerp(col[0], collar[0], 0.8 * k), lerp(col[1], collar[1], 0.8 * k), lerp(col[2], collar[2], 0.8 * k)]; }
      const lam = nx * L[0] + ny * L[1] + nz * L[2];
      const lit = clamp(0.06 + 1.02 * Math.pow(clamp(lam * 0.92 + 0.08), 0.78)) * (0.62 + 0.38 * Math.pow(nz, 0.35));
      for (let k = 0; k < 3; k++) d[o + k] = clamp(col[k] * br * lit / 255) * 255;
      d[o + 3] = 255 * clamp((1 - Math.sqrt(rr)) * R * 0.9);
    }
  }
  x.putImageData(img, 0, 0);
  return c;
}
// a small world: kind 'earth' | 'mercury' | 'venus' | 'mars' | 'uranus' | 'neptune' (R px)
function sbPaintWorld(R, kind, seed) {
  const S = 2 * R, c = mkCanvas(S, S), x = c.getContext('2d'), img = x.createImageData(S, S), d = img.data, L = SB_SUN;
  const P = {
    earth: ['#2F6FD0', '#3E8E4E', '#B79A62'], mercury: ['#8E8A86', '#B4AFA8', '#6E6A66'], venus: ['#E8D6A2', '#D9C08A', '#F2E6C4'],
    mars: ['#C0623A', '#9A4A2C', '#D98A5A'], uranus: ['#A8DCE0', '#94CCD4', '#BCE8EA'], neptune: ['#3A64C8', '#2E50A8', '#5C86E0'],
  }[kind];
  const c0 = sbRGB(P[0]), c1 = sbRGB(P[1]), c2 = sbRGB(P[2]);
  for (let py = 0; py < S; py++) for (let px = 0; px < S; px++) {
    const nx = (px + 0.5 - R) / R, ny = (py + 0.5 - R) / R, rr = nx * nx + ny * ny, o = (py * S + px) * 4;
    if (rr > 1) { d[o + 3] = 0; continue; }
    const nz = Math.sqrt(1 - rr), lat = -Math.asin(ny), lon = Math.atan2(nx, nz) + seed;
    let col = c0;
    if (kind === 'earth') {
      const land = SBN.fbm(lon * 2.2 + 7, lat * 2.6 + 3, 5);
      if (land > 0.56) col = land > 0.66 ? c2 : c1;
      if (Math.abs(lat) > 1.25) col = [236, 242, 248];
      const cl = SBN.fbm(lon * 3.6 + 40, lat * 5 + 9, 4);
      if (cl > 0.58) { const k = clamp((cl - 0.58) * 5); col = [lerp(col[0], 250, k), lerp(col[1], 252, k), lerp(col[2], 255, k)]; }
    } else if (kind === 'mercury' || kind === 'mars') {
      const m = SBN.fbm(lon * 3 + seed * 9, lat * 3 + 5, 5);
      col = m > 0.55 ? c1 : m < 0.42 ? c2 : c0;
      if (kind === 'mars' && Math.abs(lat) > 1.3) col = [240, 236, 230];
    } else {
      const b = Math.sin(lat * (kind === 'venus' ? 5 : 9) + 2 * (SBN.fbm(lon * 2 + 3, lat * 4, 3) - 0.5));
      col = b > 0.3 ? c1 : b < -0.5 ? c2 : c0;
    }
    const lam = nx * L[0] + ny * L[1] + nz * L[2];
    const lit = clamp(0.08 + 1.0 * Math.pow(clamp(lam * 0.9 + 0.1), 0.8)) * (0.7 + 0.3 * Math.pow(nz, 0.4));
    for (let k = 0; k < 3; k++) d[o + k] = clamp(col[k] * lit / 255) * 255;
    d[o + 3] = 255 * clamp((1 - Math.sqrt(rr)) * R * 0.9);
  }
  x.putImageData(img, 0, 0);
  return c;
}

// ---------------------------------------------------------------- the painted planets, ready to draw
let SB_SAT = null, SB_SAT_SIDE = null, SB_RINGS = null, SB_RINGS_SIDE = null, SB_JUP = null, SB_WORLDS = null;
const SB_EL = 0.40, SB_EL_SIDE = 0.12;              // the front shots look down 23 degrees; the split-level shot 7
function sbInitPlanets() {
  SB_SAT = sbPaintSaturn(300, SB_EL);
  SB_SAT_SIDE = sbPaintSaturn(260, SB_EL_SIDE);
  SB_RINGS = sbPaintRings(300, SB_EL);
  SB_RINGS_SIDE = sbPaintRings(260, SB_EL_SIDE);
  SB_JUP = sbPaintJupiter(240);
  SB_WORLDS = {};
  for (const [k, s] of [['earth', 0.4], ['mercury', 1.1], ['venus', 2.2], ['mars', 3.3], ['uranus', 4.4], ['neptune', 5.5]]) SB_WORLDS[k] = sbPaintWorld(90, k, s);
}
// the widths of the planets against Saturn's (equatorial diameters, NASA's fact sheet: Saturn 120,536 km)
const SB_SIZE = { saturn: 1, jupiter: 142984 / 120536, earth: 12756 / 120536, venus: 12104 / 120536, mars: 6792 / 120536,
  mercury: 4879 / 120536, uranus: 51118 / 120536, neptune: 49528 / 120536 };

// Saturn's rings (or one half of them) centred at (x, y) for a planet of radius R (world units), squashed by sin(el);
// half: 'back' (behind the globe, top of the ellipse), 'front', or 'all'; rot tilts the whole thing; a = opacity
function sbRingsDraw(x, y, R, half, o = {}) {
  const T = o.side ? SB_RINGS_SIDE : SB_RINGS, el = o.side ? SB_EL_SIDE : SB_EL, k = R / T.Rs, sq = Math.sin(el) * (o.squash || 1);
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(k * (o.sx || 1), k * sq * (o.sy || 1));
  ctx.globalAlpha = o.a === undefined ? 1 : o.a;
  const S = T.c.width, C = T.C;
  if (half === 'back') ctx.drawImage(T.c, 0, 0, S, C, -C, -C, S, C);
  else if (half === 'front') ctx.drawImage(T.c, 0, C, S, S - C, -C, 0, S, S - C);
  else ctx.drawImage(T.c, -C, -C);
  ctx.restore();
}
// the globe at (x, y), equatorial radius R (world units); its own glow occluder so a bright thing behind it stays behind
function sbGlobeDraw(x, y, R, o = {}) {
  const img = o.side ? SB_SAT_SIDE : SB_SAT, S = img.width;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale((R / (S / 2)) * (o.sx || 1), (R / (S / 2)) * (o.sy || 1));
  ctx.globalAlpha = o.a === undefined ? 1 : o.a;
  ctx.drawImage(img, -S / 2, -S / 2);
  ctx.restore();
  gctx.save(); gctx.translate(x, y); gctx.rotate(o.rot || 0); gctx.scale(o.sx || 1, (o.sy || 1) * 0.92);
  gctx.beginPath(); gctx.arc(0, 0, R * 0.99, 0, 7); gctx.fillStyle = '#000'; gctx.fill(); gctx.restore();
}
// another planet at (x, y), radius R (world units)
function sbWorldDraw(kind, x, y, R, o = {}) {
  const img = kind === 'jupiter' ? SB_JUP : SB_WORLDS[kind], S = img.width;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(R / (S / 2), R / (S / 2));
  ctx.globalAlpha = o.a === undefined ? 1 : o.a;
  ctx.drawImage(img, -S / 2, -S / 2);
  ctx.restore();
}
// Saturn's face (paint, on the globe, in globe units: R = 1): mood 'smug' | 'eek' | 'happy' | 'worried' | 'dizzy'; look [x, y]
function sbSatFace(x, y, R, mood, o = {}) {
  const look = o.look || [0, 0], blink = o.blink || 0;
  paint(() => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(R, R);
    const ey = -0.28, ex = 0.27, er = mood === 'eek' ? 0.19 : 0.15;
    for (const s of [-1, 1]) {
      const cx = s * ex, open = mood === 'happy' ? 0 : clamp(1 - blink);
      if (open < 0.15) {   // closed: a happy arc
        ctx.beginPath(); ctx.arc(cx, ey + 0.04, er * 0.85, Math.PI * 1.1, Math.PI * 1.9); ctx.lineWidth = 0.05; ctx.strokeStyle = '#3A2A18'; ctx.lineCap = 'round'; ctx.stroke();
        continue;
      }
      ctx.beginPath(); ctx.ellipse(cx, ey, er, er * (mood === 'smug' ? 0.62 : 1.05) * open, 0, 0, 7); ctx.fillStyle = '#FFFDF6'; ctx.fill();
      ctx.lineWidth = 0.035; ctx.strokeStyle = '#3A2A18'; ctx.stroke();
      const pr = mood === 'eek' ? 0.055 : 0.075;
      ctx.beginPath(); ctx.arc(cx + look[0] * er * 0.45, ey + look[1] * er * 0.35 + (mood === 'smug' ? 0.02 : 0), pr, 0, 7); ctx.fillStyle = '#1A1208'; ctx.fill();
      circle(ctx, cx + look[0] * er * 0.45 - pr * 0.35, ey + look[1] * er * 0.35 - pr * 0.4, pr * 0.32, '#FFFFFF');
      if (mood === 'smug') { ctx.beginPath(); ctx.moveTo(cx - er * 1.05, ey - er * 0.15); ctx.lineTo(cx + er * 1.05, ey - er * 0.15 + s * 0.02); ctx.lineWidth = 0.05; ctx.strokeStyle = '#B98F55'; ctx.stroke(); }
      if (mood === 'worried' || mood === 'eek') { ctx.beginPath(); ctx.moveTo(cx - s * er * 0.9, ey - er * 1.35); ctx.lineTo(cx + s * er * 0.6, ey - er * 1.75); ctx.lineWidth = 0.045; ctx.strokeStyle = '#5A4226'; ctx.stroke(); }
    }
    // the mouth
    ctx.lineWidth = 0.05; ctx.strokeStyle = '#4A3018'; ctx.lineCap = 'round'; ctx.beginPath();
    if (mood === 'smug') { ctx.moveTo(-0.16, 0.0); ctx.quadraticCurveTo(0.02, 0.08, 0.2, -0.04); ctx.stroke(); }
    else if (mood === 'happy') { ctx.moveTo(-0.18, -0.02); ctx.quadraticCurveTo(0, 0.16, 0.18, -0.02); ctx.stroke(); }
    else if (mood === 'eek') { ctx.ellipse(0, 0.03, 0.08, 0.1, 0, 0, 7); ctx.fillStyle = '#3A1A10'; ctx.fill(); }
    else if (mood === 'worried') { ctx.moveTo(-0.15, 0.06); ctx.quadraticCurveTo(-0.05, -0.02, 0.03, 0.05); ctx.quadraticCurveTo(0.1, 0.11, 0.17, 0.04); ctx.stroke(); }
    else if (mood === 'dizzy') { ctx.moveTo(-0.14, 0.03); ctx.lineTo(0.14, 0.03); ctx.stroke(); }
    ctx.restore();
  });
}
