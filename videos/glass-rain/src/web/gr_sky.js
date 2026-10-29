// The Planet Where It Rains GLASS Sideways ☔: the world (29 Oct 2026, the tenth CURIOUS Short).
// HD 189733b's sky seen from a balloon basket: a deep azure sky, its orange star hanging close and huge (the planet is
// about 13 times closer to it than Mercury is to the Sun), cloud decks of glass (silica) painted once and streaming
// sideways at their own parallax, the glass rain (bright beads with streak tails that fall at a slant, or go flat when the
// wind hits), rock steam rising out of the hot deep, the balloon (striped envelope, ropes, burner) and its wicker basket
// (the back wall behind him, the front wall over his legs). From space: the planet painted once (azure bands, a hot spot
// east of noon, a hazy limb, a night side with an ember glow) beside its star, over a star field.
// Every position comes from a seeded generator, so frames render identically every time.
'use strict';

// ---------------------------------------------------------------- value noise
const GRN = (() => {
  const N = 256, g = new Float32Array(N * N), rng = mulberry32(18973);
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
const grRGB = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const grMix3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
// fbm that repeats every Wt pixels along x (a strip that tiles)
function grFbmP(x, y, Wt, f, o = 4) { const u = x / Wt; return (1 - u) * GRN.fbm(x * f, y * f, o) + u * GRN.fbm((x - Wt) * f, y * f, o); }

// ---------------------------------------------------------------- painted once
let GR_STAR = null, GR_CLOUD = null, GR_PLANET = null, GR_SPACE = null;
const GR_CLOUD_W = 2160;
// the layers of cloud, far to near: strip height (world px), the colour of the lit tops / the shadowed base / the haze it
// fades into, the parallax factor, the wind speed (px/s at zoom 1), and the world y of the strip's top
const GR_DECKS = [
  { h: 240, top: '#CFE3FF', base: '#5D8BD6', haze: '#6FA5EC', p: 0.18, wind: 60, y: 1000, half: true, seed: 3 },
  { h: 320, top: '#E2EEFF', base: '#4673C6', haze: '#5C93E2', p: 0.34, wind: 120, y: 1160, half: true, seed: 11 },
  { h: 400, top: '#EEF6FF', base: '#3962B4', haze: '#4A7FD6', p: 0.55, wind: 210, y: 1330, half: false, seed: 23 },
  { h: 470, top: '#F6FAFF', base: '#2C519E', haze: '#3A6CC4', p: 0.8, wind: 330, y: 1520, half: false, seed: 41 },
];
function grInitSky() {
  // the star: an orange dwarf (HD 189733, a K star): limb darkening, granulation, a few dark spots (it is a spotty star)
  {
    const R = 360, S = 2 * R, c = mkCanvas(S, S), x = c.getContext('2d'), img = x.createImageData(S, S), d = img.data;
    const core = grRGB('#FFF6DC'), mid = grRGB('#FFC468'), limb = grRGB('#F2702A');
    const spots = [[0.28, -0.22, 0.10], [0.36, -0.12, 0.05], [-0.42, 0.30, 0.07], [-0.08, 0.46, 0.045]];
    for (let py = 0; py < S; py++) for (let px = 0; px < S; px++) {
      const nx = (px + 0.5 - R) / R, ny = (py + 0.5 - R) / R, rr = nx * nx + ny * ny, o = (py * S + px) * 4;
      if (rr > 1) { d[o + 3] = 0; continue; }
      const mu = Math.sqrt(1 - rr);
      const I = 1 - 0.68 * (1 - mu) - 0.18 * (1 - mu) * (1 - mu);
      const gr = GRN.fbm(px * 0.055 + 4, py * 0.055 + 9, 3) - 0.5, gr2 = GRN.n2(px * 0.16, py * 0.16) - 0.5;
      let br = I * (1 + 0.16 * gr + 0.07 * gr2);
      for (const [sx, sy, sr] of spots) {
        const ds = Math.hypot(nx - sx, ny - sy) / sr + 0.25 * (GRN.n2(px * 0.05 + sx * 40, py * 0.05) - 0.5);
        if (ds < 1.6) br *= ds < 0.75 ? 0.42 : lerp(0.42, 1, smooth(inv(0.75, 1.6, ds)) * 0.85 + 0.15 * smooth(inv(0.75, 1.6, ds)));
      }
      const k = clamp(br);
      const col = k > 0.62 ? grMix3(mid, core, inv(0.62, 1, k)) : grMix3(limb, mid, inv(0.2, 0.62, k));
      d[o] = col[0] * (0.75 + 0.25 * k); d[o + 1] = col[1] * (0.7 + 0.3 * k); d[o + 2] = col[2] * (0.65 + 0.35 * k);
      d[o + 3] = 255 * clamp((1 - Math.sqrt(rr)) * R * 0.8);
    }
    x.putImageData(img, 0, 0);
    GR_STAR = c;
  }
  // the cloud decks: strips that tile along x, built from puffs (cartoon cumulus): each puff a dome lit from the star's
  // side (upper right) and shaded blue underneath; the body fills in below; glitter (glass catching the light) on top
  GR_CLOUD = GR_DECKS.map((L) => {
    const sc = L.half ? 0.5 : 1, Wp = Math.round(GR_CLOUD_W * sc), Hp = Math.round((L.h + 140) * sc);
    const c = mkCanvas(Wp, Hp), x = c.getContext('2d'), rng = mulberry32(900 + L.seed);
    x.scale(sc, sc);
    const Wt = GR_CLOUD_W, base0 = 140 + L.h * 0.42;
    // the body under the puffs
    const gb = x.createLinearGradient(0, base0 - 20, 0, L.h + 140);
    gb.addColorStop(0, L.top); gb.addColorStop(0.35, mixH(L.top, L.base, 0.55)); gb.addColorStop(1, L.haze);
    x.fillStyle = gb; x.fillRect(0, base0, Wt, L.h + 140 - base0);
    // two rows of puffs: big ones along the top line, smaller ones on their shoulders
    const puffs = [];
    for (let row = 0; row < 2; row++) {
      let px = rng() * 40;
      while (px < Wt) {
        const r = L.h * (row ? 0.11 + 0.1 * rng() : 0.2 + 0.17 * rng());
        const cy = base0 - (row ? L.h * (0.08 + 0.2 * rng()) : L.h * (0.02 + 0.1 * rng()));
        puffs.push([px, cy, r, row]);
        px += r * (row ? 1.3 + 0.9 * rng() : 0.95 + 0.5 * rng());
      }
    }
    const tops = new Float32Array(Wp).fill(base0 * sc);
    const lit = mixH(L.top, '#FFE4C4', 0.5), mid = mixH(L.top, L.base, 0.42);
    // pass 1: the silhouette, all puffs in one colour (one fluffy mass, no rings between puffs)
    x.fillStyle = mid;
    for (const [px, cy, r] of puffs) for (const ox of [-Wt, 0, Wt]) {
      const X = px + ox;
      if (X + r < 0 || X - r > Wt) continue;
      x.beginPath(); x.arc(X, cy, r, 0, 7); x.fill();
      for (let q = Math.max(0, Math.floor((X - r) * sc)); q < Math.min(Wp, Math.ceil((X + r) * sc)); q++) {
        const dx = q / sc - X, hh = r * r - dx * dx;
        if (hh > 0) tops[q] = Math.min(tops[q], (cy - Math.sqrt(hh)) * sc);
      }
    }
    // pass 2: each puff's lit dome (upper right, toward the star), laid on inside the mass
    x.globalCompositeOperation = 'source-atop';
    for (const [px, cy, r] of puffs) for (const ox of [-Wt, 0, Wt]) {
      const X = px + ox;
      if (X + r * 1.2 < 0 || X - r > Wt) continue;
      const g = x.createRadialGradient(X + 0.3 * r, cy - 0.38 * r, r * 0.05, X + 0.1 * r, cy - 0.1 * r, r * 1.05);
      g.addColorStop(0, rgba(lit, 1)); g.addColorStop(0.5, rgba(L.top, 0.85)); g.addColorStop(1, rgba(L.top, 0));
      x.fillStyle = g; x.beginPath(); x.arc(X + 0.1 * r, cy - 0.1 * r, r * 1.05, 0, 7); x.fill();
    }
    x.globalCompositeOperation = 'source-over';
    // a soft blue shade on the underside of the puff line, and the haze at the bottom
    const gs = x.createLinearGradient(0, base0 - 10, 0, base0 + L.h * 0.45);
    gs.addColorStop(0, 'rgba(40,70,150,0)'); gs.addColorStop(1, rgba(L.base, 0.55));
    x.globalCompositeOperation = 'source-atop'; x.fillStyle = gs; x.fillRect(0, base0 - 10, Wt, L.h + 160);
    x.globalCompositeOperation = 'source-over';
    // glitter: glass beads in the cloud tops catching the star
    for (let i = 0; i < 220; i++) {
      const gx = rng() * Wt, q = Math.floor(gx * sc) % Wp, gy = tops[q] / sc + 6 + Math.pow(rng(), 1.5) * L.h * 0.5;
      x.fillStyle = `rgba(255,255,255,${0.4 + 0.5 * rng()})`;
      x.beginPath(); x.arc(gx, gy, 0.8 + 1.4 * rng(), 0, 7); x.fill();
    }
    return { c, sc, tops, Wp, Hp };
  });
  // the planet seen from space: an azure gas giant lit from the right (its star), bands, a hot spot east of noon,
  // the night side with an ember glow (it is still hundreds of degrees there)
  {
    const R = 400, S = 2 * R, c = mkCanvas(S, S), x = c.getContext('2d'), img = x.createImageData(S, S), d = img.data;
    const L = [0.86, -0.18, 0.47], n = Math.hypot(...L); L[0] /= n; L[1] /= n; L[2] /= n;
    const bands = ['#1B4BB0', '#2E6FD8', '#163C96', '#3B86EA', '#2259C4', '#4A94F0', '#1A47A8', '#2C66CF'].map(grRGB);
    const ember = grRGB('#A8341E'), night = grRGB('#0A1436');
    for (let py = 0; py < S; py++) for (let px = 0; px < S; px++) {
      const nx = (px + 0.5 - R) / R, ny = (py + 0.5 - R) / R, rr = nx * nx + ny * ny, o = (py * S + px) * 4;
      if (rr > 1) { d[o + 3] = 0; continue; }
      const nz = Math.sqrt(1 - rr), lat = -Math.asin(ny), lon = Math.atan2(nx, nz);
      const warp = GRN.fbm(lon * 2.4 + 5, lat * 3.1 + 2, 4) - 0.5, fine = GRN.fbm(lon * 9 + 1, lat * 16 + 7, 3) - 0.5;
      const bu = (lat * 2.6 + 1.1 * warp + 8) * 1.0, bi = Math.floor(bu), bf = bu - bi;
      const ca = bands[((bi % bands.length) + bands.length) % bands.length], cb = bands[(((bi + 1) % bands.length) + bands.length) % bands.length];
      let col = grMix3(ca, cb, smooth(clamp((bf - 0.7) / 0.3)));
      col = grMix3(col, [120, 180, 255], 0.18 * fine + 0.05);
      const lam = nx * L[0] + ny * L[1] + nz * L[2];
      // the hot spot: east of the point under the star (Spitzer, 2007): a little brighter and paler
      const hs = Math.exp(-(Math.pow(lon - 0.95, 2) / 0.12 + Math.pow(lat + 0.02, 2) / 0.08));
      col = grMix3(col, [170, 214, 255], 0.35 * hs);
      const day = clamp(lam * 1.1 + 0.08);
      const litc = [col[0] * (0.1 + 1.05 * Math.pow(day, 0.75)), col[1] * (0.1 + 1.05 * Math.pow(day, 0.75)), col[2] * (0.14 + 1.0 * Math.pow(day, 0.7))];
      const nightK = clamp(-lam * 1.4 + 0.1);
      let out = grMix3(litc, night, nightK * 0.75);
      out = grMix3(out, ember, nightK * 0.22 * (0.6 + 0.8 * (GRN.fbm(lon * 3 + 9, lat * 5, 3))));
      d[o] = clamp(out[0] / 255) * 255; d[o + 1] = clamp(out[1] / 255) * 255; d[o + 2] = clamp(out[2] / 255) * 255;
      d[o + 3] = 255 * clamp((1 - Math.sqrt(rr)) * R * 0.9);
    }
    x.putImageData(img, 0, 0);
    GR_PLANET = c;
  }
  // a star field for space (screen sized), with a faint violet haze
  {
    const c = mkCanvas(W, H), x = c.getContext('2d'), rng = mulberry32(4242);
    for (let i = 0; i < 1300; i++) {
      const px = rng() * W, py = rng() * H, big = rng() < 0.05;
      const r = big ? 1.6 + 1.4 * rng() : 0.5 + 0.9 * Math.pow(rng(), 2);
      const tint = rng() < 0.2 ? '255,214,170' : rng() < 0.4 ? '190,210,255' : '255,255,255';
      x.fillStyle = `rgba(${tint},${0.3 + 0.65 * rng()})`; x.beginPath(); x.arc(px, py, r, 0, 7); x.fill();
      if (big) { const g = x.createRadialGradient(px, py, 0, px, py, r * 6); g.addColorStop(0, `rgba(${tint},0.3)`); g.addColorStop(1, `rgba(${tint},0)`); x.fillStyle = g; x.beginPath(); x.arc(px, py, r * 6, 0, 7); x.fill(); }
    }
    GR_SPACE = c;
  }
}

// ---------------------------------------------------------------- the sky
// a camera for a far layer: the same framing, a parallax factor p (0 = fixed to the screen, 1 = the world)
function grLayerCam(cam, p) { return { x: 540 + (cam.x - 540) * p, y: 960 + (cam.y - 960) * p, zoom: 1 + (cam.zoom - 1) * p, rot: (cam.rot || 0) * p, sx: cam.sx, sy: cam.sy }; }
// where the star sits for a camera (world point of its own layer, parallax 0.1) -> screen [x, y, R]
function grStarAt(cam, o = {}) {
  const lc = grLayerCam(cam, 0.1), at = o.starAt || [860, 520];
  const [x, y] = toScreen(lc, at[0], at[1]);
  return [x, y, (o.starR || 300) * lc.zoom];
}
// the star with its corona (screen space): the disc, a warm halo, slow loops of flame at its edge, glow in the bloom layer
function grStarDraw(x, y, R, t, o = {}) {
  screenSpace();
  const a = o.a === undefined ? 1 : o.a;
  softDot(ctx, x, y, R * 2.3, '#FF9A3C', 0.2 * a);
  softDot(ctx, x, y, R * 1.3, '#FFC070', 0.3 * a);
  ctx.save(); ctx.globalAlpha = a;
  ctx.drawImage(GR_STAR, x - R, y - R, 2 * R, 2 * R);
  ctx.restore();
  softDot(gctx, x, y, R * 1.55, '#FF9A50', 0.34 * a * (o.glow === undefined ? 1 : o.glow));
  softDot(gctx, x, y, R * 0.8, '#FFD9A0', 0.14 * a * (o.glow === undefined ? 1 : o.glow));
}
// the sky behind everything (screen space): azure overhead, paler toward the haze; the star; the cloud decks streaming
// sideways. o: {starAt, starR, star: false, decks: [i...], wind (0..1 extra), haze, deep (0..1 the glowing deep)}
function grSkyBg(cam, t, o = {}) {
  screenSpace();
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#08215E'); g.addColorStop(0.32, '#1747A6'); g.addColorStop(0.62, '#2E72D2'); g.addColorStop(1, '#5A9AE6');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // the star's warm wash on its side of the sky
  const S = o.starScreen || grStarAt(cam, o);
  if (o.star !== false) {
    softDot(ctx, S[0], S[1], S[2] * 4.0, '#FFB067', 0.2);
    grStarDraw(S[0], S[1], S[2], t, { glow: o.starGlow });
  }
  const windT = o.windT === undefined ? t : o.windT;
  for (const i of (o.decks || [0, 1, 2, 3])) grDeck(cam, i, windT, o);
  if (o.deep > 0) {                                   // the hot deep under the decks: a red-orange glow from below
    screenSpace();
    const gd = ctx.createLinearGradient(0, H * 0.55, 0, H);
    gd.addColorStop(0, 'rgba(255,110,40,0)'); gd.addColorStop(1, `rgba(255,96,36,${0.55 * o.deep})`);
    ctx.fillStyle = gd; ctx.fillRect(0, H * 0.55, W, H * 0.45);
    const gg = gctx.createLinearGradient(0, H * 0.7, 0, H);
    gg.addColorStop(0, 'rgba(255,110,40,0)'); gg.addColorStop(1, `rgba(255,120,50,${0.35 * o.deep})`);
    gctx.fillStyle = gg; gctx.fillRect(0, H * 0.7, W, H * 0.3);
  }
  return S;
}
// one cloud deck: tiled across the screen at its parallax, scrolled by its wind (to the right)
function grDeck(cam, i, t, o = {}) {
  const L = GR_DECKS[i], T = GR_CLOUD[i], lc = grLayerCam(cam, L.p);
  const z = lc.zoom, span = GR_CLOUD_W * z;
  const shift = ((L.wind * (1 + 2.5 * (o.wind || 0)) * t) % GR_CLOUD_W) * z;
  const [x0, y0] = toScreen(lc, 0, L.y - 140);
  const h = (L.h + 140) * z;
  if (y0 > H || y0 + h < -40) return;
  screenSpace();
  const X0 = ((x0 + shift) % span + span) % span - span;
  for (let X = X0; X < W; X += span) ctx.drawImage(T.c, X, y0, span, h);
  // the deck's lower edge melts into a haze band so the next deck reads as nearer
  const gh = ctx.createLinearGradient(0, y0 + h * 0.55, 0, y0 + h + 60 * z);
  gh.addColorStop(0, rgba(L.haze, 0)); gh.addColorStop(1, rgba(L.haze, 0.9));
  ctx.fillStyle = gh; ctx.fillRect(0, y0 + h * 0.55, W, h * 0.45 + 60 * z);
  ctx.fillStyle = L.haze; ctx.fillRect(0, y0 + h + 59 * z, W, H);
  // glitter that twinkles (glass catching the star): in the glow layer, near decks only
  if (i >= 2) {
    const rng = mulberry32(77 + i * 19), n = 46;
    for (let k = 0; k < n; k++) {
      const u = rng(), dv = rng(), ph = rng() * 6.28, sp = 2 + 4 * rng();
      const tw = Math.pow(Math.max(0, Math.sin(t * loopW(sp) + ph)), 12);
      if (tw < 0.05) continue;
      const lx = u * GR_CLOUD_W, ti = T.tops[Math.floor(lx * T.sc) % T.Wp] / T.sc;   // strip-local x and its top edge
      for (let gx = X0 + lx * z; gx < W + 20; gx += span) {
        if (gx < -20) continue;
        const gy = y0 + (ti + 20 + dv * L.h * 0.35) * z;
        softDot(gctx, gx, gy, 10 * z, '#FFFFFF', 0.7 * tw);
        line(ctx, gx - 7 * z * tw, gy, gx + 7 * z * tw, gy, 1.6, `rgba(255,255,255,${0.9 * tw})`);
        line(ctx, gx, gy - 7 * z * tw, gx, gy + 7 * z * tw, 1.6, `rgba(255,255,255,${0.9 * tw})`);
      }
    }
  }
}

// ---------------------------------------------------------------- the glass rain (screen space)
// layers: far (thin and many), mid, near (beads that glow). ang: the fall angle below horizontal (0 = flat, sideways);
// k: how much rain; speed: a multiplier; off: [dx, dy] screen offset (follow the camera a little)
const GR_RAIN = [
  { n: 300, v: 1100, len: 26, w: 1.4, a: 0.5, bead: 0, seed: 5 },
  { n: 190, v: 1700, len: 56, w: 2.4, a: 0.8, bead: 2.8, seed: 9 },
  { n: 60, v: 2600, len: 120, w: 4.0, a: 0.95, bead: 5.6, seed: 13 },
  { n: 9, v: 3900, len: 300, w: 9, a: 0.55, bead: 10, seed: 17 },
];
function grRain(t, o = {}) {
  const ang = o.ang === undefined ? 0.55 : o.ang, k = o.k === undefined ? 1 : o.k, spd = o.speed || 1;
  if (k <= 0.01) return;
  screenSpace();
  const dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy, ny = dx;
  const span = (W + H) * 1.25, C = [540 + (o.off ? o.off[0] : 0), 960 + (o.off ? o.off[1] : 0)];
  const layers = o.layers || [0, 1, 2, 3];
  for (const li of layers) {
    const L = GR_RAIN[li], rng = mulberry32(300 + L.seed), n = Math.round(L.n * k * (o.dens || 1));
    for (let i = 0; i < L.n; i++) {
      const lane = (rng() - 0.5) * span, s0 = rng() * span, vv = L.v * spd * (0.8 + 0.4 * rng()), ph = rng() * 6.28, hue = rng();
      if (i >= n) continue;
      const s = ((s0 + vv * t) % span + span) % span - span / 2;
      const x = C[0] + nx * lane + dx * s, y = C[1] + ny * lane + dy * s;
      const len = L.len * spd * (o.lenK || 1) * (0.7 + 0.6 * ((i * 0.618) % 1));
      if (x < -len - 20 || x > W + 20 || y < -len - 20 || y > H + 20) continue;
      const tx = x - dx * len, ty = y - dy * len;
      const gr = ctx.createLinearGradient(tx, ty, x, y);
      gr.addColorStop(0, 'rgba(190,230,255,0)'); gr.addColorStop(1, `rgba(225,246,255,${L.a})`);
      ctx.strokeStyle = gr; ctx.lineWidth = L.w; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y); ctx.stroke();
      if (L.bead > 0) {
        if (li >= 2) {                                   // a faceted bead: a little crystal, its lit facet toward the star
          const b = L.bead * 1.25, ra = ang;
          ctx.save(); ctx.translate(x, y); ctx.rotate(ra);
          ctx.beginPath(); ctx.moveTo(b * 1.5, 0); ctx.lineTo(0, -b); ctx.lineTo(-b * 1.1, 0); ctx.lineTo(0, b); ctx.closePath();
          ctx.fillStyle = '#BFEFFF'; ctx.fill();
          ctx.beginPath(); ctx.moveTo(b * 1.5, 0); ctx.lineTo(0, -b); ctx.lineTo(0, 0); ctx.closePath(); ctx.fillStyle = '#FFFFFF'; ctx.fill();
          ctx.restore();
        } else circle(ctx, x, y, L.bead, '#F4FCFF');
        softDot(gctx, x, y, L.bead * 4, '#CFF2FF', 0.75);
        // now and then a bead catches the star: a little rainbow glint
        const fl = Math.pow(Math.max(0, Math.sin(t * 9 + ph)), 18);
        if (fl > 0.2 && li >= 2) {
          const col = hue < 0.33 ? '#FFB0E0' : hue < 0.66 ? '#B0FFE0' : '#FFE9A0';
          line(ctx, x - 12 * fl, y, x + 12 * fl, y, 2, col); line(ctx, x, y - 12 * fl, x, y + 12 * fl, 2, col);
          softDot(gctx, x, y, 22 * fl, col, 0.8);
        }
      }
    }
  }
}
// glass beads bouncing off something (an umbrella, a helmet): little bright sparks thrown back (screen space)
function grSparks(x, y, t, t0, n, seed, spread = 1) {
  const age = t - t0;
  if (age < 0 || age > 0.45) return;
  const rng = mulberry32(seed);
  for (let i = 0; i < n; i++) {
    const a = -Math.PI * (0.15 + 0.7 * rng()) * spread - 0.2, v = 300 + 500 * rng();
    const px = x + Math.cos(a) * v * age, py = y + Math.sin(a) * v * age + 900 * age * age;
    const k = 1 - age / 0.45;
    circle(ctx, px, py, 5 * k + 1, `rgba(240,252,255,${k})`);
    softDot(gctx, px, py, 18 * k, '#D8F6FF', 0.8 * k);
  }
}

// ---------------------------------------------------------------- rock steam: the deep boils rock into a glowing vapour that
// rises, cools and turns into glass beads (screen space). k: how much; y0: where it comes from (the bottom), y1: where it
// turns to glass
function grSteam(t, o = {}) {
  const k = o.k === undefined ? 1 : o.k;
  if (k <= 0.01) return;
  screenSpace();
  const rng = mulberry32(611), n = 9, y0 = o.y0 || H + 60, y1 = o.y1 || 520, x0 = o.x0 || 60, x1 = o.x1 || 1020;
  for (let i = 0; i < n; i++) {
    const bx = lerp(x0, x1, (i + 0.2 + 0.6 * rng()) / n), ph = rng(), sp = 0.28 + 0.12 * rng(), wob = 30 + 30 * rng();
    // the plume: blobs that ride up it; each grows and cools as it rises
    for (let j = 0; j < 14; j++) {
      const u = ((t * sp + ph + j / 14) % 1);
      const y = lerp(y0, y1, u), x = bx + wob * Math.sin(u * 6 + i * 1.7 + t * 0.9);
      const fade = Math.sin(Math.PI * clamp(u * 1.05)) * k;
      if (u < 0.9) {
        const col = u < 0.35 ? '#FF5A1E' : u < 0.65 ? '#FF8A3A' : '#FFC890';
        softDot(ctx, x, y, 60 + 70 * u, col, 0.3 * fade);
        if (u < 0.5) softDot(gctx, x, y, 50 + 40 * u, '#FF7A30', 0.2 * fade);
      }
    }
    // at the top of the plume the vapour turns into glass beads that fall back (two a plume at a time)
    for (let q = 0; q < 3; q++) {
      const u = ((t * 0.9 + ph * 3 + q / 3) % 1), x = bx + 40 * Math.sin(i + q * 2.1) + 120 * u, y = y1 - 30 + 420 * u * u;
      const kk = k * Math.sin(Math.PI * clamp(u * 1.3));
      if (kk <= 0.02) continue;
      line(ctx, x - 34 * u, y - 60 * u, x, y, 3, `rgba(225,246,255,${0.8 * kk})`);
      circle(ctx, x, y, 6.5, `rgba(244,252,255,${kk})`);
      softDot(gctx, x, y, 26, '#D8F6FF', 0.8 * kk);
      if (u < 0.12) softDot(gctx, x, y, 60 * (1 - u / 0.12), '#FFFFFF', 0.6 * kk);   // the pop as it forms
    }
  }
}

// ---------------------------------------------------------------- the balloon (world coordinates)
// the envelope: a striped teardrop above the basket. (x, y): the bottom of its mouth; s: scale; tilt (rad); o.holes
function grEnvelope(x, y, s, tilt, t) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); ctx.scale(s, s);
  const Hh = 640, Wd = 300;                               // half width at the widest
  const prof = (u) => {                                   // u 0 (mouth) .. 1 (crown): half width
    if (u < 0.12) return lerp(46, 70, u / 0.12);
    const v = (u - 0.12) / 0.88;
    return Wd * Math.sin(Math.PI * Math.pow(v, 0.62) * 0.98 + 0.06) * (v > 0.8 ? 1 - Math.pow((v - 0.8) / 0.2, 2) * 0.35 : 1);
  };
  const N = 10, cols = ['#E8433F', '#FFF1DC'];
  for (let g = 0; g < N; g++) {
    const a0 = -1 + 2 * g / N, a1 = -1 + 2 * (g + 1) / N;
    ctx.beginPath();
    for (let i = 0; i <= 24; i++) { const u = i / 24, w = prof(u); ctx.lineTo(a0 * w, -u * Hh); }
    for (let i = 24; i >= 0; i--) { const u = i / 24, w = prof(u); ctx.lineTo(a1 * w, -u * Hh); }
    ctx.closePath(); ctx.fillStyle = cols[g % 2]; ctx.fill();
  }
  // the crown cap and a band round the middle
  ctx.beginPath(); ctx.ellipse(0, -Hh + 12, 60, 16, 0, 0, 7); ctx.fillStyle = '#C8302E'; ctx.fill();
  ctx.restore();
}
// ropes from the envelope's mouth to the basket's corners; the burner with its flame (glow) in between
function grRigging(mouth, corners, s, t, flame = 0.5) {
  for (const c2 of corners) line(ctx, mouth[0] + Math.sign(c2[0] - mouth[0]) * 40 * s, mouth[1], c2[0], c2[1], 4 * s, '#6B4A2E');
  const bx = mouth[0], by = mouth[1] + 60 * s;
  rrect(ctx, bx - 34 * s, by - 10 * s, 68 * s, 26 * s, 6 * s); ctx.fillStyle = '#9AA3B5'; ctx.fill();
  line(ctx, bx - 30 * s, by + 16 * s, bx - 30 * s, mouth[1] + 4 * s, 5 * s, '#7A8396');
  line(ctx, bx + 30 * s, by + 16 * s, bx + 30 * s, mouth[1] + 4 * s, 5 * s, '#7A8396');
  if (flame > 0.01) {
    const fl = flame * (0.85 + 0.15 * Math.sin(t * 31) * Math.sin(t * 17));
    ctx.beginPath(); ctx.moveTo(bx - 14 * s, by - 8 * s);
    ctx.quadraticCurveTo(bx - 20 * s, by - 60 * s * fl, bx, by - 120 * s * fl);
    ctx.quadraticCurveTo(bx + 20 * s, by - 60 * s * fl, bx + 14 * s, by - 8 * s); ctx.closePath();
    ctx.fillStyle = '#FFB347'; ctx.fill();
    softDot(gctx, bx, by - 50 * s * fl, 70 * s * fl, '#FF9A3C', 0.9);
    softDot(gctx, bx, by - 30 * s * fl, 34 * s * fl, '#9FD8FF', 0.7);
  }
}
// the basket: wicker. (x, y): the middle of its top rim; s: scale. back: the inside of the far wall (behind him)
function grBasketBack(x, y, s) {
  rrect(ctx, x - 210 * s, y - 34 * s, 420 * s, 60 * s, 12 * s); ctx.fillStyle = '#5A3A22'; ctx.fill();
  rrect(ctx, x - 200 * s, y - 24 * s, 400 * s, 44 * s, 10 * s); ctx.fillStyle = '#7A5232'; ctx.fill();
}
function grBasketFront(x, y, s, o = {}) {
  const w = 440 * s, h = 330 * s, x0 = x - w / 2;
  rrect(ctx, x0, y, w, h, 18 * s); ctx.fillStyle = '#B98A52'; ctx.fill();
  // the weave: bands of short slanted strokes, alternate rows leaning the other way
  paint(() => {
    ctx.save(); rrect(ctx, x0, y, w, h, 18 * s); ctx.clip();
    for (let r = 0; r < 12; r++) {
      const yy = y + 26 * s + r * 26 * s, lean = r % 2 ? 1 : -1;
      ctx.fillStyle = r % 2 ? '#A87A44' : '#C9995E';
      ctx.fillRect(x0, yy - 13 * s, w, 26 * s);
      for (let c2 = 0; c2 < 30; c2++) {
        const xx = x0 + (c2 + (r % 2) * 0.5) * (w / 29);
        line(ctx, xx - 6 * s * lean, yy - 9 * s, xx + 6 * s * lean, yy + 9 * s, 3.2 * s, r % 2 ? '#8E6234' : '#A97B45');
      }
      line(ctx, x0, yy + 13 * s, x0 + w, yy + 13 * s, 2 * s, 'rgba(70,44,22,0.55)');
    }
    // the corner posts
    for (const px of [x0 + 26 * s, x0 + w - 26 * s]) { ctx.fillStyle = '#7A5232'; ctx.fillRect(px - 9 * s, y, 18 * s, h); }
    ctx.restore();
  });
  // the padded leather rim
  rrect(ctx, x0 - 10 * s, y - 22 * s, w + 20 * s, 40 * s, 20 * s); ctx.fillStyle = '#4E3020'; ctx.fill();
  rrect(ctx, x0 - 4 * s, y - 18 * s, w + 8 * s, 14 * s, 7 * s); ctx.fillStyle = '#6E4630'; ctx.fill();
  if (o.sign) {                                          // a little plate on the front: SKY TOURS
    paint(() => {
      rrect(ctx, x - 110 * s, y + 70 * s, 220 * s, 64 * s, 10 * s); ctx.fillStyle = '#20345E'; ctx.fill();
      ctx.lineWidth = 4 * s; ctx.strokeStyle = '#E9C46A'; ctx.stroke();
      ctx.font = `900 ${34 * s}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFE6A8';
      ctx.fillText(o.sign, x, y + 103 * s);
    });
  }
}

// ---------------------------------------------------------------- space
function grSpaceBg(t, o = {}) {
  screenSpace();
  ctx.fillStyle = '#03040C'; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W * 0.2, H * 0.8, 0, W * 0.2, H * 0.8, H * 0.8);
  g.addColorStop(0, 'rgba(70,40,120,0.35)'); g.addColorStop(1, 'rgba(20,10,40,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const dz = o.zoom || 1;
  ctx.save(); ctx.globalAlpha = o.a === undefined ? 1 : o.a;
  ctx.translate(540, 960); ctx.scale(dz, dz); ctx.translate(-540, -960);
  ctx.drawImage(GR_SPACE, 0, 0);
  ctx.restore();
}
// the planet (screen space) at (x, y), radius R; a hazy blue limb on its lit side, its own glow occluder
function grPlanet(x, y, R, t, o = {}) {
  screenSpace();
  gctx.beginPath(); gctx.arc(x, y, R * 0.995, 0, 7); gctx.fillStyle = '#000'; gctx.fill();
  ctx.drawImage(GR_PLANET, x - R, y - R, 2 * R, 2 * R);
  // the haze limb: blue light scattered round the edge, strongest toward the star (right), gone on the night side;
  // whole circles with a gradient (an arc's ends showed as a white block when the planet filled the frame)
  const lw = Math.min(R * 0.022, 26);
  for (let i = 0; i < 3; i++) {
    const g = ctx.createLinearGradient(x - R, y, x + R, y);
    g.addColorStop(0, 'rgba(150,205,255,0)'); g.addColorStop(0.45, 'rgba(150,205,255,0)');
    g.addColorStop(1, `rgba(150,205,255,${0.55 - 0.15 * i})`);
    ctx.beginPath(); ctx.arc(x, y, R * (1.0 + 0.012 * i) + i * 2, 0, 7);
    ctx.lineWidth = lw * (1 - 0.27 * i); ctx.strokeStyle = g; ctx.stroke();
  }
  const gg = gctx.createLinearGradient(x - R, y, x + R, y);
  gg.addColorStop(0, 'rgba(120,190,255,0)'); gg.addColorStop(0.4, 'rgba(120,190,255,0)'); gg.addColorStop(1, 'rgba(120,190,255,0.55)');
  gctx.save(); gctx.beginPath(); gctx.arc(x, y, R * 1.02 + 4, 0, 7); gctx.lineWidth = Math.min(R * 0.05, 60); gctx.strokeStyle = gg; gctx.stroke(); gctx.restore();
  return [x, y, R];
}
