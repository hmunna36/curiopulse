// One Night on URANUS Lasts 42 Years: the world (17 Nov 2026, a CURIOUS Short).
// Uranus's south pole seen from a hot-air balloon basket: a cyan cloud sea in tiled decks with parallax (glass-rain's
// puff painter in Uranus's colours), a deep teal-to-navy sky with stars, the far small Sun, the thin rings low over the
// horizon, a moon; the balloon (striped envelope, ropes, a burner, a wicker basket with a lantern), a SOUTH POLE signpost
// poking out of the clouds; the hero in purple pyjamas and his golden nightcap, a beard that grows; a twin-bell alarm
// clock whose face is a split-flap display; a desk year calendar. In space: saturn-bathtub's star layers and Sun, Uranus
// painted once (flat light, bands, a pale polar cap), drawn at any tilt with its rings, a day/night shadow from any
// direction, a sleepy face and a pillow (planets-earth-moon's peFace / pePillow), his mini balloon at the pole; the orbit
// diagram round the Sun with a day half and a night half.
// Every position comes from the numbers below or a seeded generator: frames render identically every time.
'use strict';

// ---------------------------------------------------------------- palettes
const UNP = {
  skyTop: '#0A1E52', skyMid: '#14558F', skyLow: '#2FA3B8', skyHz: '#7FE0DA',
  nightTop: '#050C2E', nightMid: '#0C2560', nightLow: '#16477F', nightHz: '#2A6E9C',
  dawnHz: '#FFD9A0', dawnLow: '#5CC8C8',
  red: '#E5383B', redDk: '#B3202A', face: '#FFF6DF', brass: '#F4C24B', brassDk: '#C79320', steel: '#8A93AD',
  steelDk: '#5E6680', ink: '#1E1838', flapBg: '#1B1E33', flapInk: '#FFE9A8',
  cap: '#FFC23A', capDk: '#DE8C16', wool: '#FFF7E6',
  beard: '#F7F5F0', beardSh: '#B9C3D6', beardHi: '#FFFFFF',
  lamp: '#FFB347',
};
// his pyjamas (the same rig, only the outfit changes): purple, so he reads against the cyan sky
const UN_PJ = Object.assign({}, PAL, {
  coat: '#8A63E0', coatSh: '#6544B8', coatHi: '#B49BF2', coatDk: '#4E3496',
  strap: '#8A63E0', strapSh: '#7652CC', pants: '#7A55D4', pantsSh: '#5A3CAE', sock: '#F2B892', pj: true,
});
// forty-two years later: grey hair
const UN_PJ_OLD = Object.assign({}, UN_PJ, { hair: '#CFCFDA', hairHi: '#F4F4FA' });

// ---------------------------------------------------------------- painted once
const UN_DECK_W = 2160;
// the cloud decks of the pole, far to near (glass-rain's GR_DECKS shape): pale cyan tops, teal bases
const UN_DECKS = [
  { h: 220, top: '#C8F4F0', base: '#3E9DB0', haze: '#62BCC6', p: 0.16, wind: 40, y: 1040, half: true, seed: 5 },
  { h: 300, top: '#D6F8F4', base: '#2F8AA2', haze: '#4FAFBE', p: 0.32, wind: 80, y: 1190, half: true, seed: 13 },
  { h: 380, top: '#E4FBF8', base: '#257894', haze: '#3E9FB4', p: 0.55, wind: 140, y: 1360, half: false, seed: 29 },
  { h: 460, top: '#F0FDFB', base: '#1B6A88', haze: '#2F8DA8', p: 0.82, wind: 220, y: 1560, half: false, seed: 47 },
];
let UN_CLOUD = null, UN_URANUS = null, UN_TRAILS = null;
function unRGB(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
function unInit() {
  sbInitSpace();
  // the cloud decks: strips that tile along x, built from cartoon puffs, each puff lit from the upper left (the Sun)
  UN_CLOUD = UN_DECKS.map((L) => {
    const sc = L.half ? 0.5 : 1, Wp = Math.round(UN_DECK_W * sc), Hp = Math.round((L.h + 140) * sc);
    const c = mkCanvas(Wp, Hp), x = c.getContext('2d'), rng = mulberry32(700 + L.seed);
    x.scale(sc, sc);
    const Wt = UN_DECK_W, base0 = 140 + L.h * 0.42;
    const gb = x.createLinearGradient(0, base0 - 20, 0, L.h + 140);
    gb.addColorStop(0, L.top); gb.addColorStop(0.35, mixH(L.top, L.base, 0.55)); gb.addColorStop(1, L.haze);
    x.fillStyle = gb; x.fillRect(0, base0, Wt, L.h + 140 - base0);
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
    const lit = mixH(L.top, '#FFFFFF', 0.55), mid = mixH(L.top, L.base, 0.42);
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
    x.globalCompositeOperation = 'source-atop';
    for (const [px, cy, r] of puffs) for (const ox of [-Wt, 0, Wt]) {
      const X = px + ox;
      if (X + r * 1.2 < 0 || X - r > Wt) continue;
      const g = x.createRadialGradient(X - 0.3 * r, cy - 0.38 * r, r * 0.05, X - 0.1 * r, cy - 0.1 * r, r * 1.05);
      g.addColorStop(0, rgba(lit, 1)); g.addColorStop(0.5, rgba(L.top, 0.85)); g.addColorStop(1, rgba(L.top, 0));
      x.fillStyle = g; x.beginPath(); x.arc(X - 0.1 * r, cy - 0.1 * r, r * 1.05, 0, 7); x.fill();
    }
    const gs = x.createLinearGradient(0, base0 - 10, 0, base0 + L.h * 0.45);
    gs.addColorStop(0, 'rgba(30,90,130,0)'); gs.addColorStop(1, rgba(L.base, 0.55));
    x.fillStyle = gs; x.fillRect(0, base0 - 10, Wt, L.h + 160);
    x.globalCompositeOperation = 'source-over';
    return { c, sc, tops, Wp, Hp };
  });
  // Uranus, painted once with a flat front light (the day/night shadow is laid on per frame): pale cyan with faint
  // bands, a brighter cap round the top pole, limb darkening
  {
    const R = 360, S = 2 * R, c = mkCanvas(S, S), x = c.getContext('2d'), img = x.createImageData(S, S), d = img.data;
    const deep = unRGB('#6FC3CF'), mid = unRGB('#93DCE0'), pale = unRGB('#C2F0EE'), cap = unRGB('#E6FBF8');
    for (let py = 0; py < S; py++) for (let px = 0; px < S; px++) {
      const nx = (px + 0.5 - R) / R, ny = (py + 0.5 - R) / R, rr = nx * nx + ny * ny, o = (py * S + px) * 4;
      if (rr > 1) { d[o + 3] = 0; continue; }
      const nz = Math.sqrt(1 - rr), lat = -Math.asin(ny) * 57.2958, lon = Math.atan2(nx, nz);
      const tw = SBN.fbm(lon * 2.0 + 23, lat * 0.08 + 4, 4) - 0.5;
      const b = Math.sin((lat + 10 * tw) * 0.12);
      let col = b > 0.3 ? [lerp(mid[0], pale[0], (b - 0.3) * 1.4), lerp(mid[1], pale[1], (b - 0.3) * 1.4), lerp(mid[2], pale[2], (b - 0.3) * 1.4)]
        : [lerp(deep[0], mid[0], clamp(b + 0.8)), lerp(deep[1], mid[1], clamp(b + 0.8)), lerp(deep[2], mid[2], clamp(b + 0.8))];
      if (lat > 45) { const k = clamp((lat - 45) / 25) * 0.7; col = [lerp(col[0], cap[0], k), lerp(col[1], cap[1], k), lerp(col[2], cap[2], k)]; }
      const limb = 0.72 + 0.28 * Math.pow(nz, 0.5);
      const fine = 1 + 0.04 * (SBN.fbm(lon * 12 + 3, lat * 0.5, 3) - 0.5);
      for (let k = 0; k < 3; k++) d[o + k] = clamp(col[k] * limb * fine / 255) * 255;
      d[o + 3] = 255 * clamp((1 - Math.sqrt(rr)) * R * 0.9);
    }
    x.putImageData(img, 0, 0);
    UN_URANUS = c;
  }
}

// ---------------------------------------------------------------- the pole: sky, Sun, rings, moon, cloud decks
function unLayerCam(cam, p, dy = 0) { return { x: 540 + (cam.x - 540) * p, y: 960 + (cam.y - 960) * p, zoom: 1 + (cam.zoom - 1) * p, rot: (cam.rot || 0) * p, sx: cam.sx, sy: (cam.sy || 0) + dy * (1 - p) }; }
// o: {night 0..1 (0 = the sunset sky, 1 = the 42-year night), dawn 0..1 (the sunrise of 2049), sun: [world x, world y]
//     of its layer (p 0.1), sunR, sunUp 0..1 (how much of it is above the cloud edge), hzY (world y of the far cloud edge,
//     the far deck's top), stars 0..1, trails 0..1 (the stars wheel round the pole), moon}
function unSky(cam, t, o = {}) {
  screenSpace();
  const night = o.night || 0, dawn = o.dawn || 0;
  const dy = o.dy || 0, lc = unLayerCam(cam, 0.12, dy);
  const hz = toScreen(unLayerCam(cam, UN_DECKS[0].p, dy), 0, UN_DECKS[0].y + 60)[1];
  const mix = (a, b) => mixH(a, b, night);
  let top = mix(UNP.skyTop, UNP.nightTop), midc = mix(UNP.skyMid, UNP.nightMid), low = mix(UNP.skyLow, UNP.nightLow), hzc = mix(UNP.skyHz, UNP.nightHz);
  if (dawn > 0) { low = mixH(low, UNP.dawnLow, dawn); hzc = mixH(hzc, UNP.dawnHz, dawn); midc = mixH(midc, UNP.skyMid, dawn * 0.6); }
  const g = ctx.createLinearGradient(0, hz - 1500, 0, hz + 40);
  g.addColorStop(0, top); g.addColorStop(0.45, midc); g.addColorStop(0.8, low); g.addColorStop(1, hzc);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // stars: saturn-bathtub's layers, stronger at night; or the wheeling trails of the time-lapse
  const sk = o.stars === undefined ? 0.25 + 0.75 * night : o.stars;
  if (sk > 0.01) {
    ctx.save(); ctx.globalAlpha = sk;
    sbTile(SB_STAR[0], sbLayerCam(cam, 0.05), W, H, 0.9);
    sbTile(SB_STAR[1], sbLayerCam(cam, 0.09), W, H, 0.9);
    sbTile(SB_STAR[2], sbLayerCam(cam, 0.13), W, H, 1);
    ctx.restore();
    // keep the stars off the bright band over the horizon
    const gh = ctx.createLinearGradient(0, hz - 380, 0, hz);
    gh.addColorStop(0, rgba(hzc, 0)); gh.addColorStop(1, rgba(hzc, 0.9 - 0.5 * night));
    ctx.fillStyle = gh; ctx.fillRect(0, hz - 380, W, 400);
  }
  if ((o.trails || 0) > 0.01) unTrails(cam, t, o.trails, o.trailCx, o.trailCy, dy);
  // the rings: Uranus's thin rings lie in its equator, so from the pole they hug the horizon: three thin arcs
  const rk = o.rings === undefined ? 1 : o.rings;
  if (rk > 0.01) {
    const rl = unLayerCam(cam, 0.08, dy), [cx, cy] = toScreen(rl, 540, UN_DECKS[0].y + 2250);
    for (const [rad, w, a] of [[2700, 3.2, 0.55], [2740, 1.6, 0.4], [2800, 5.5, 0.7]]) {
      ctx.beginPath(); ctx.arc(cx, cy, rad * rl.zoom, Math.PI * 1.18, Math.PI * 1.82);
      ctx.lineWidth = w * Math.max(1, rl.zoom); ctx.strokeStyle = `rgba(214,240,255,${a * rk * (1 - 0.35 * night)})`; ctx.stroke();
    }
  }
  // a moon low over the far clouds (Uranus's moons orbit in its equator too: from the pole they sit on the horizon)
  if (o.moon !== false) {
    const [mx, my] = toScreen(lc, o.moonAt ? o.moonAt[0] : 880, o.moonAt ? o.moonAt[1] : UN_DECKS[0].y - 40);
    const mr = 34 * lc.zoom;
    circle(ctx, mx, my, mr, '#C9C3BC');
    ctx.save(); ctx.beginPath(); ctx.arc(mx, my, mr, 0, 7); ctx.clip();
    circle(ctx, mx + mr * 0.45, my - mr * 0.1, mr * 0.95, 'rgba(40,50,90,0.45)');
    for (const [dx, dy, rr] of [[-0.3, -0.25, 0.22], [0.1, 0.3, 0.16], [-0.45, 0.35, 0.12]]) circle(ctx, mx + dx * mr, my + dy * mr, rr * mr, 'rgba(120,110,105,0.6)');
    ctx.restore();
    softDot(gctx, mx, my, mr * 1.8, '#BFD8FF', 0.2 * (0.4 + night));
  }
  // the Sun: small and white-gold (Uranus is 19 times farther out than we are), sitting on the far cloud edge
  const su = o.sunUp === undefined ? 1 : o.sunUp;
  let S = null;
  if (o.sun) {
    const [sx, sy0] = toScreen(lc, o.sun[0], o.sun[1]);
    const R = (o.sunR || 22) * lc.zoom;
    const sy = sy0 + (1 - su) * R * 2.4;
    const glow = clamp(su * 1.4);
    softDot(ctx, sx, Math.min(sy, hz), R * 16, '#FFC88A', 0.22 * glow);
    softDot(ctx, sx, Math.min(sy, hz), R * 6, '#FFE7B8', 0.5 * glow);
    if (su > 0.01) {
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, hz + 4); ctx.clip();
      circle(ctx, sx, sy, R, '#FFFBEE');
      ctx.restore();
      softDot(gctx, sx, Math.min(sy, hz), R * 5, '#FFE2A8', 0.9 * glow);
      softDot(gctx, sx, Math.min(sy, hz), R * 1.8, '#FFFFFF', 0.9 * glow);
    }
    S = [sx, sy, R, hz];
  }
  return S;
}
// the time-lapse's star trails: arcs round the sky's pole (it is straight up over the pole: off the top of the frame)
function unTrails(cam, t, k, cxW = 540, cyW = -1400, dy = 0) {
  if (!UN_TRAILS) {
    const rng = mulberry32(4949); UN_TRAILS = [];
    for (let i = 0; i < 260; i++) UN_TRAILS.push([700 + 2600 * Math.sqrt(rng()), rng() * Math.PI * 2, 0.6 + 1.8 * Math.pow(rng(), 3), 0.3 + 0.7 * rng(), rng() < 0.2 ? '255,226,190' : rng() < 0.4 ? '196,214,255' : '255,255,255']);
  }
  const lc = unLayerCam(cam, 0.1, dy), [cx, cy] = toScreen(lc, cxW, cyW);
  const sweep = 2.6 * k;                                   // radians of arc swept so far
  ctx.save(); ctx.lineCap = 'round';
  for (const [r, a0, w, al, col] of UN_TRAILS) {
    const R = r * lc.zoom;
    if (cy + R < -50) continue;
    ctx.beginPath(); ctx.arc(cx, cy, R, a0, a0 + sweep);
    ctx.lineWidth = w * 1.4; ctx.strokeStyle = `rgba(${col},${al * 0.75})`; ctx.stroke();
    const ex = cx + Math.cos(a0 + sweep) * R, ey = cy + Math.sin(a0 + sweep) * R;
    if (ey > -10 && ey < H) { ctx.beginPath(); ctx.arc(ex, ey, w * 1.3, 0, 7); ctx.fillStyle = `rgba(${col},${al})`; ctx.fill(); }
  }
  ctx.restore();
}
// one cloud deck, tiled at its parallax and drifting with the wind; o.night darkens it to deep blue, o.dawn warms its tops
function unDeck(cam, i, t, o = {}) {
  const L = UN_DECKS[i], T = UN_CLOUD[i], lc = unLayerCam(cam, L.p, o.dy || 0);
  const z = lc.zoom, span = UN_DECK_W * z;
  const shift = ((L.wind * t) % UN_DECK_W) * z;
  const [x0, y0] = toScreen(lc, 0, L.y - 140);
  const h = (L.h + 140) * z;
  if (y0 > H || y0 + h < -40) return;
  screenSpace();
  const X0 = ((x0 + shift) % span + span) % span - span;
  for (let X = X0; X < W; X += span) ctx.drawImage(T.c, X, y0, span, h);
  const night = o.night || 0, dawn = o.dawn || 0;
  if (night > 0.01) {                       // night: the clouds go a deep saturated blue (multiply), never grey
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = mixH('#FFFFFF', '#3A5FB8', night);
    ctx.fillRect(0, y0, W, H - y0); ctx.restore();
  }
  if (dawn > 0.01) {                        // the first light: a warm wash on the tops
    ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = `rgba(255,190,110,${0.6 * dawn})`;
    ctx.fillRect(0, y0, W, h * 0.6); ctx.restore();
  }
  const gh = ctx.createLinearGradient(0, y0 + h * 0.55, 0, y0 + h + 60 * z);
  const hazeC = mixH(mixH(L.haze, '#24407E', night), '#7FD6D0', dawn * 0.3);
  gh.addColorStop(0, rgba(hazeC, 0)); gh.addColorStop(1, rgba(hazeC, 0.9));
  ctx.fillStyle = gh; ctx.fillRect(0, y0 + h * 0.55, W, h * 0.45 + 60 * z);
  ctx.fillStyle = hazeC; ctx.fillRect(0, y0 + h + 59 * z, W, H);
}
function unDecks(cam, t, o = {}) { for (const i of (o.decks || [0, 1, 2, 3])) { if (i === 3 && o.mid) o.mid(); unDeck(cam, i, t, o); } }

// ---------------------------------------------------------------- the balloon (world coordinates)
// the envelope: a striped teardrop. (x, y): the bottom of its mouth; s: scale
function unEnvelope(c, x, y, s, tilt) {
  c.save(); c.translate(x, y); c.rotate(tilt || 0); c.scale(s, s);
  const Hh = 640, Wd = 300;
  const prof = (u) => {
    if (u < 0.12) return lerp(46, 70, u / 0.12);
    const v = (u - 0.12) / 0.88;
    return Wd * Math.sin(Math.PI * Math.pow(v, 0.62) * 0.98 + 0.06) * (v > 0.8 ? 1 - Math.pow((v - 0.8) / 0.2, 2) * 0.35 : 1);
  };
  const N = 10, cols = ['#E8433F', '#FFF1DC'];
  for (let g = 0; g < N; g++) {
    const a0 = -1 + 2 * g / N, a1 = -1 + 2 * (g + 1) / N;
    c.beginPath();
    for (let i = 0; i <= 24; i++) { const u = i / 24, w = prof(u); c.lineTo(a0 * w, -u * Hh); }
    for (let i = 24; i >= 0; i--) { const u = i / 24, w = prof(u); c.lineTo(a1 * w, -u * Hh); }
    c.closePath(); c.fillStyle = cols[g % 2]; c.fill();
  }
  c.beginPath(); c.ellipse(0, -Hh + 12, 60, 16, 0, 0, 7); c.fillStyle = '#C8302E'; c.fill();
  c.restore();
}
// ropes from the envelope's mouth to the basket; the burner (off: it's bedtime) with a pilot light
function unRigging(c, mouth, corners, s) {
  for (const k2 of corners) line(c, mouth[0] + Math.sign(k2[0] - mouth[0]) * 40 * s, mouth[1], k2[0], k2[1], 4 * s, '#6B4A2E');
  const bx = mouth[0], by = mouth[1] + 60 * s;
  rrect(c, bx - 34 * s, by - 10 * s, 68 * s, 26 * s, 6 * s); c.fillStyle = '#9AA3B5'; c.fill();
  softDot(gctx, bx, by - 12 * s, 16 * s, '#7FC8FF', 0.6);
}
function unBasketBack(c, x, y, s) {
  rrect(c, x - 210 * s, y - 34 * s, 420 * s, 60 * s, 12 * s); c.fillStyle = '#5A3A22'; c.fill();
  rrect(c, x - 200 * s, y - 24 * s, 400 * s, 44 * s, 10 * s); c.fillStyle = '#7A5232'; c.fill();
}
// the front wall of wicker; o: {sign, frost 0..1 (white on the rim and the weave: the long night)}
function unBasketFront(c, x, y, s, o = {}) {
  const w = 440 * s, h = 330 * s, x0 = x - w / 2;
  rrect(c, x0, y, w, h, 18 * s); c.fillStyle = '#B98A52'; c.fill();
  paint(() => {
    c.save(); rrect(c, x0, y, w, h, 18 * s); c.clip();
    for (let r = 0; r < 12; r++) {
      const yy = y + 26 * s + r * 26 * s, lean = r % 2 ? 1 : -1;
      c.fillStyle = r % 2 ? '#A87A44' : '#C9995E';
      c.fillRect(x0, yy - 13 * s, w, 26 * s);
      for (let c2 = 0; c2 < 30; c2++) {
        const xx = x0 + (c2 + (r % 2) * 0.5) * (w / 29);
        line(c, xx - 6 * s * lean, yy - 9 * s, xx + 6 * s * lean, yy + 9 * s, 3.2 * s, r % 2 ? '#8E6234' : '#A97B45');
      }
      line(c, x0, yy + 13 * s, x0 + w, yy + 13 * s, 2 * s, 'rgba(70,44,22,0.55)');
    }
    for (const px of [x0 + 26 * s, x0 + w - 26 * s]) { c.fillStyle = '#7A5232'; c.fillRect(px - 9 * s, y, 18 * s, h); }
    if ((o.frost || 0) > 0.01) {
      const rng = mulberry32(313);
      c.fillStyle = `rgba(236,248,255,${0.75 * o.frost})`;
      for (let i = 0; i < 70; i++) { const fx = x0 + rng() * w, fy = y + Math.pow(rng(), 2) * h * 0.7; c.beginPath(); c.arc(fx, fy, (4 + 10 * rng()) * s * o.frost, 0, 7); c.fill(); }
    }
    c.restore();
  });
  rrect(c, x0 - 10 * s, y - 22 * s, w + 20 * s, 40 * s, 20 * s); c.fillStyle = '#4E3020'; c.fill();
  rrect(c, x0 - 4 * s, y - 18 * s, w + 8 * s, 14 * s, 7 * s); c.fillStyle = '#6E4630'; c.fill();
  if ((o.frost || 0) > 0.01) {             // snow piled on the rim
    c.beginPath(); c.moveTo(x0 - 10 * s, y - 16 * s);
    for (let i = 0; i <= 16; i++) { const u = i / 16; c.lineTo(x0 - 10 * s + u * (w + 20 * s), y - 16 * s - (10 + 9 * Math.sin(u * 17)) * s * o.frost); }
    c.lineTo(x0 + w + 10 * s, y - 4 * s); c.lineTo(x0 - 10 * s, y - 4 * s); c.closePath(); c.fillStyle = '#EEF8FF'; c.fill();
  }
  if (o.sign) {
    paint(() => {
      rrect(c, x - 130 * s, y + 70 * s, 260 * s, 70 * s, 12 * s); c.fillStyle = '#20345E'; c.fill();
      c.lineWidth = 5 * s; c.strokeStyle = '#E9C46A'; c.stroke();
      c.font = `900 ${36 * s}px Montserrat`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#FFE6A8';
      c.fillText(o.sign, x, y + 106 * s);
    });
  }
}
// a lantern hanging on the rope at the basket's corner: k 0..1 lit
function unLantern(c, x, y, s, k, t) {
  line(c, x, y - 40 * s, x, y - 14 * s, 3 * s, '#3A2A1E');
  rrect(c, x - 16 * s, y - 14 * s, 32 * s, 40 * s, 6 * s); c.fillStyle = '#2C3448'; c.fill();
  rrect(c, x - 11 * s, y - 8 * s, 22 * s, 28 * s, 4 * s); c.fillStyle = k > 0.05 ? mixH('#6A6F84', '#FFE6A0', k) : '#6A6F84'; c.fill();
  if (k > 0.02) {
    const fl = 0.9 + 0.1 * Math.sin(t * loopW(9.7)) * Math.sin(t * loopW(5.3));
    softDot(gctx, x, y + 6 * s, 120 * s * fl, '#FFB347', 0.85 * k);
    softDot(gctx, x, y + 6 * s, 34 * s, '#FFF2C8', 0.95 * k);
  }
}

// ---------------------------------------------------------------- the alarm clock: twin bells over a split-flap face
// stands on (x, y), about 190 tall at s = 1. o: {txt (the display), from (the text it flips from), flip 0..1, ring 0..1,
// frost 0..1, web 0..1, glow}
function unClock(c, x, y, s, t, o = {}) {
  const ring = o.ring || 0;
  c.save(); c.translate(x + 4.5 * s * Math.sin(t * 96) * ring, y); c.rotate(0.05 * Math.sin(t * 83) * ring); c.scale(s, s);
  line(c, -48, -16, -60, 0, 11, UNP.steelDk); line(c, 48, -16, 60, 0, 11, UNP.steelDk);
  c.beginPath(); c.arc(0, -142, 36, Math.PI * 1.08, Math.PI * 1.92); c.lineWidth = 8; c.lineCap = 'round'; c.strokeStyle = UNP.steel; c.stroke();
  for (const sd of [-1, 1]) {
    line(c, sd * 34, -128, sd * 42, -146, 8, UNP.steelDk);
    c.save(); c.translate(sd * 44, -150 + 2.5 * Math.sin(t * 110 + sd) * ring); c.rotate(sd * 0.42);
    c.beginPath(); c.ellipse(0, 0, 30, 23, 0, Math.PI, Math.PI * 2); c.closePath(); c.fillStyle = UNP.brass; c.fill();
    rrect(c, -32, -3, 64, 9, 4); c.fillStyle = UNP.brassDk; c.fill();
    c.restore();
  }
  const hx = 14 * Math.sin(t * 118) * ring;
  line(c, 0, -130, hx, -158, 6, UNP.steelDk); circle(c, hx, -160, 8, UNP.steel);
  // the body: a rounded red box
  rrect(c, -74, -134, 148, 122, 30); c.fillStyle = UNP.redDk; c.fill();
  rrect(c, -68, -130, 136, 112, 26); c.fillStyle = UNP.red; c.fill();
  // the split-flap window
  rrect(c, -58, -116, 116, 84, 12); c.fillStyle = UNP.flapBg; c.fill();
  paint(() => {
    const fk = clamp(o.flip === undefined ? 1 : o.flip);
    const newT = o.txt || '', oldT = o.from || newT;
    const lines2 = (txt) => txt.split('/');
    const drawTxt = (txt, clipTop, clipBot, squash = 1, dy = 0) => {
      c.save(); c.beginPath(); c.rect(-56, clipTop, 112, clipBot - clipTop); c.clip();
      c.translate(0, -74 + dy); c.scale(1, squash); c.translate(0, 74);
      c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = UNP.flapInk;
      const L = lines2(txt);
      if (L.length === 1) { c.font = '400 54px Anton'; c.fillText(L[0], 0, -73); }
      else { c.font = '400 46px Anton'; c.fillText(L[0], 0, -92); c.font = '400 25px Anton'; c.fillText(L[1], 0, -52); }
      c.restore();
    };
    // the static halves: the top shows the new text once the flap has fallen past half way; the bottom the old until it lands
    drawTxt(fk > 0.5 ? newT : newT, -116, -74);
    drawTxt(fk >= 1 ? newT : oldT, -74, -32);
    if (fk > 0 && fk < 1) {                  // the falling flap: the old top half folding down, then the new bottom half
      if (fk < 0.5) { const sq = Math.cos(fk * Math.PI); drawTxt(oldT, -116, -74, sq, 0); }
      else { const sq = -Math.cos(fk * Math.PI); drawTxt(newT, -74, -32, sq, 0); }
    }
    line(c, -58, -74, 58, -74, 3, '#0B0C18');
    // the display's own glow
    softDot(gctx, x / s * 0 + 0, 0, 0, '#000', 0);
  });
  // a knob on top (he winds it)
  rrect(c, 54, -150, 14, 22, 4); c.fillStyle = UNP.steel; c.fill();
  if ((o.frost || 0) > 0.01) {             // frost on top and on the bells, icicles under the body
    const f = o.frost;
    paint(() => {
      c.fillStyle = `rgba(240,250,255,${0.9 * f})`;
      c.beginPath(); c.moveTo(-70, -132); c.quadraticCurveTo(0, -150 - 8 * f, 70, -132); c.lineTo(70, -124); c.quadraticCurveTo(0, -136, -70, -124); c.closePath(); c.fill();
      for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(sd * 44, -168, 24 * f, 8 * f, sd * 0.42, 0, 7); c.fill(); }
      for (let i = 0; i < 6; i++) { const ix = -56 + i * 22; c.beginPath(); c.moveTo(ix - 5, -12); c.lineTo(ix + 5, -12); c.lineTo(ix, -12 + (14 + 10 * (i % 2)) * f); c.closePath(); c.fill(); }
    });
  }
  if ((o.web || 0) > 0.01) {               // a cobweb between the bells
    paint(() => {
      c.save(); c.globalAlpha = 0.8 * o.web; c.strokeStyle = '#F4F8FF'; c.lineWidth = 1.6;
      const ox = 0, oy = -150;
      for (let i = 0; i < 7; i++) { const a = Math.PI + (i / 6) * Math.PI; c.beginPath(); c.moveTo(ox, oy + 30); c.lineTo(ox + Math.cos(a) * 62, oy + 30 + Math.sin(a) * 42); c.stroke(); }
      for (let r = 1; r <= 3; r++) { c.beginPath(); for (let i = 0; i <= 6; i++) { const a = Math.PI + (i / 6) * Math.PI; const px = ox + Math.cos(a) * 20 * r, py = oy + 30 + Math.sin(a) * 14 * r; if (i) c.lineTo(px, py); else c.moveTo(px, py); } c.stroke(); }
      c.restore();
    });
  }
  c.restore();
}
// the ringing: arcs of sound off both bells. (x, y): where the clock stands; k 0..1 = how loud
function unRingArcs(x, y, s, t, k) {
  if (k <= 0.02) return;
  paint(() => {
    for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) {
      const u = ((t * 3.4 + i / 3) % 1), r = (34 + 80 * u) * s, a0 = sd > 0 ? -0.95 : Math.PI - 0.35;
      for (const [cc, w, al] of [[ctx, 7 * s, 0.95], [gctx, 14 * s, 0.55]]) {
        cc.beginPath(); cc.arc(x + sd * 44 * s, y - 152 * s, r, a0, a0 + 1.3);
        cc.lineWidth = w * (1 - 0.5 * u); cc.lineCap = 'round'; cc.strokeStyle = `rgba(255,226,120,${al * k * (1 - u)})`; cc.stroke();
      }
    }
  });
}
// the year card: a little desk calendar on the basket's rim. (x, y): where it stands; o: {year, from, flip}
function unYearCard(c, x, y, s, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.moveTo(-70, 0); c.lineTo(-58, -96); c.lineTo(58, -96); c.lineTo(70, 0); c.closePath(); c.fillStyle = '#2B3350'; c.fill();
  rrect(c, -56, -92, 112, 86, 8); c.fillStyle = '#FBF8F0'; c.fill();
  rrect(c, -56, -92, 112, 22, 8); c.fillStyle = '#E5383B'; c.fill();
  paint(() => {
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#FFFFFF'; c.font = '900 15px Montserrat'; c.fillText('YEAR', 0, -81);
    c.fillStyle = '#1E1838'; c.font = '400 46px Anton'; c.fillText(String(o.year || 2007), 0, -38);
    for (const rx of [-30, 30]) { c.beginPath(); c.arc(rx, -94, 6, 0, 7); c.fillStyle = '#9AA3B5'; c.fill(); }
  });
  if ((o.frost || 0) > 0.01) { c.fillStyle = `rgba(240,250,255,${0.85 * o.frost})`; c.beginPath(); c.ellipse(0, -96, 64, 9 * o.frost, 0, 0, 7); c.fill(); }
  c.restore();
}

// ---------------------------------------------------------------- him: pyjamas, the golden nightcap, a beard
// the nightcap in head space (the head's centre is (0, 0)); sw = how far the tip swings
function unCap(c, sw = 0) {
  c.beginPath();
  c.moveTo(-66, -40); c.bezierCurveTo(-56, -122, 14, -168, 72, -134);
  c.bezierCurveTo(108, -112, 122 + sw * 0.5, -74, 112 + sw, -34);
  c.lineTo(94 + sw, -36); c.bezierCurveTo(98 + sw * 0.4, -78, 84, -98, 62, -100);
  c.bezierCurveTo(66, -78, 68, -58, 68, -40); c.closePath();
  c.fillStyle = UNP.cap; c.fill();
  paint(() => {
    c.save(); c.clip();
    c.lineWidth = 15; c.strokeStyle = UNP.capDk; c.lineCap = 'butt';
    for (const [x0, y0, x1, y1] of [[-80, -74, 96, -64], [-70, -114, 110, -98], [-30, -158, 124, -128]]) { c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 - 14, x1, y1); c.stroke(); }
    c.restore();
  });
  c.beginPath(); c.moveTo(-72, -22); c.quadraticCurveTo(0, -58, 72, -22); c.lineTo(72, -48); c.quadraticCurveTo(0, -86, -72, -48); c.closePath();
  c.fillStyle = UNP.wool; c.fill();
  circle(c, 104 + sw, -24, 19, UNP.wool);
}
// the beard in world coordinates from the head's centre (hx, hy) at scale s: L = its length below the chin (world units at
// s = 1), sway (rad). It starts at the jaw (the eyes, brows and nose stay clear), widest just under the chin, then tapers
// in soft waves; a moustache under the nose. Drawn after the basket's front wall so it hangs over it.
function unBeard(c, hx, hy, s, L, t, sway = 0) {
  if (L <= 2) return;
  c.save(); c.translate(hx, hy); c.scale(s, s);
  const top = 26, tip = 66 + L;
  const half = (u) => (u < 0.08 ? lerp(58, 70, u / 0.08) : 70 * Math.pow(1 - (u - 0.08) / 0.92, 0.85) + 10);
  const wob = (u, k) => 6 * Math.sin(u * 22 + k + t * loopW(2.1)) * Math.min(1, u * 4);
  const sx = (u) => Math.sin(sway) * u * L * 0.4;
  const Y = (u) => lerp(top, tip, u);
  // the back layer (a shade), then the front mass
  for (const [col, ins] of [[UNP.beardSh, 0], [UNP.beard, 7]]) {
    c.beginPath();
    c.moveTo(-58 + ins, top - 4); c.quadraticCurveTo(0, top + 26, 58 - ins, top - 4);
    const N = 26;
    for (let i = 0; i <= N; i++) { const u = i / N; c.lineTo(half(u) - ins + wob(u, 0) + sx(u), Y(u) - (i === N ? ins : 0)); }
    for (let i = N; i >= 0; i--) { const u = i / N; c.lineTo(-half(u) + ins + wob(u, 2) + sx(u), Y(u)); }
    c.closePath(); c.fillStyle = col; c.fill();
  }
  paint(() => {                             // strands: wavy lines down the beard
    c.save(); c.lineCap = 'round';
    for (let k = -3; k <= 3; k++) {
      c.beginPath();
      for (let i = 0; i <= 20; i++) { const u = 0.05 + 0.9 * i / 20, x = k * half(u) * 0.24 + 5 * Math.sin(u * 18 + k) + sx(u), y = Y(u); if (i) c.lineTo(x, y); else c.moveTo(x, y); }
      c.lineWidth = 3.2; c.strokeStyle = 'rgba(160,170,190,0.55)'; c.stroke();
    }
    c.restore();
  });
  // the moustache: two curls under the nose
  for (const sd of [-1, 1]) {
    c.beginPath(); c.moveTo(sd * 4, 22); c.quadraticCurveTo(sd * 26, 12, sd * 50, 30); c.quadraticCurveTo(sd * 56, 38, sd * 44, 36);
    c.quadraticCurveTo(sd * 24, 30, sd * 4, 34); c.closePath(); c.fillStyle = UNP.beardHi; c.fill();
  }
  c.restore();
}
// head space helper (why-we-dream): draw fn with the head's centre at (0, 0)
function unHeadSpace(c, r, st, fn) {
  c.save(); c.translate(st.x, st.y); c.scale(st.s, st.s);
  c.translate(r.head[0] + (st.headDX || 0), r.head[1] + (st.headDY || 0)); c.rotate(r.lean + (st.headRot || 0));
  fn(c); c.restore();
}
// where his head's centre is in world coordinates for a rig r and state st
function unHeadAt(r, st) { return [st.x + (r.head[0] + (st.headDX || 0)) * st.s, st.y + (r.head[1] + (st.headDY || 0)) * st.s]; }
// him on his layer. o: {x, y, s, pose, face, armR/armL: {e, w} world points, handR, handL, headRot, capSw, old (grey hair),
//                      post(lc, rr, st)}
function unHero(cam, t, o) {
  const st = { x: o.x, y: o.y, s: o.s || 1, seed: 3, headDX: o.headDX || 0, headDY: o.headDY || 0, headRot: o.headRot || 0, noLegs: true };
  let pose = JSON.parse(JSON.stringify(o.pose || POSES.stand));
  if (o.lean != null) pose.lean = o.lean;
  if (o.armR) pose = armAt(pose, 'R', ikLocal(st, o.armR.e[0], o.armR.e[1]), ikLocal(st, o.armR.w[0], o.armR.w[1]));
  if (o.armL) pose = armAt(pose, 'L', ikLocal(st, o.armL.e[0], o.armL.e[1]), ikLocal(st, o.armL.w[0], o.armL.w[1]));
  if (o.handR) pose.handR = o.handR;
  if (o.handL) pose.handL = o.handL;
  st.pose = pose; st.face = o.face || FACES.calm;
  applyCam(cam);
  const pal = o.old ? UN_PJ_OLD : UN_PJ;
  const r = charLayer(cam, st, t, { pal, ambient: o.ambient || 0, post: (lc, rr, s2) => {
    actor(() => unHeadSpace(lc, rr, s2, (hc) => unCap(hc, o.capSw || 0)));
    if (o.post) o.post(lc, rr, s2);
  } });
  applyCam(cam);
  return { st, r, head: unHeadAt(r, st) };
}

// ---------------------------------------------------------------- the planet in space
// Uranus at (x, y) radius R: o: {tilt (rad: 0 = its pole straight up, pi/2 = lying on its side, the pole to the right),
// light (screen angle of the direction TO the Sun; null = lit all over), night (how dark the far side is, 0..1), rings,
// face: mood | null, faceO, balloon (0..1 the mini balloon at the top pole), lamp (0..1)}
function unPlanet(x, y, R, t, o = {}) {
  const tilt = o.tilt || 0, ringK = o.rings === undefined ? 1 : o.rings;
  // the rings: thin ellipses in the equator plane, seen a little from above; split back / front round the globe
  const ringPass = (front) => {
    if (ringK <= 0.01) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(tilt);
    for (const [rr, w, a] of [[1.62, 0.012, 0.55], [1.7, 0.008, 0.4], [1.86, 0.02, 0.8]]) {
      ctx.beginPath(); ctx.ellipse(0, 0, rr * R, rr * R * 0.22, 0, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2);
      ctx.lineWidth = Math.max(2, w * R); ctx.strokeStyle = `rgba(220,240,255,${a * ringK})`; ctx.stroke();
    }
    ctx.restore();
  };
  ringPass(false);
  ctx.save(); ctx.translate(x, y); ctx.rotate(tilt);
  const S = UN_URANUS.width;
  ctx.drawImage(UN_URANUS, -R, -R, 2 * R, 2 * R);
  ctx.restore();
  gctx.save(); gctx.beginPath(); gctx.arc(x, y, R * 0.98, 0, 7); gctx.fillStyle = '#000'; gctx.fill(); gctx.restore();
  // a soft cyan atmosphere at the limb
  softDot(gctx, x, y, R * 1.25, '#8FE8F0', 0.12);
  // the night side: everything facing away from the Sun, with a soft edge
  if (o.light != null && (o.night === undefined || o.night > 0)) {
    const a = o.light, nk = o.night === undefined ? 0.82 : o.night;
    paint(() => {
      ctx.save(); ctx.beginPath(); ctx.arc(x, y, R + 1, 0, 7); ctx.clip();
      ctx.translate(x, y); ctx.rotate(a);
      const g = ctx.createLinearGradient(R * 0.12, 0, -R * 0.2, 0);
      g.addColorStop(0, 'rgba(6,12,46,0)'); g.addColorStop(1, `rgba(6,12,46,${nk})`);
      ctx.fillStyle = g; ctx.fillRect(-R - 2, -R - 2, 2 * R + 4, 2 * R + 4);
      ctx.restore();
    });
  }
  if (o.face) peFace(x, y, R * 0.62, o.face, Object.assign({ rot: tilt }, o.faceO || {}));
  // his mini balloon at the top pole (it turns with the planet)
  if ((o.balloon || 0) > 0.01) {
    const px = x + Math.sin(tilt) * R * 0.99, py = y - Math.cos(tilt) * R * 0.99;
    const poleDir = tilt - Math.PI / 2;                     // from the centre to the top pole
    const dim = o.light == null ? 0 : clamp(-Math.cos(o.light - poleDir) * 2.2 + 0.1);
    unMiniBalloon(px, py, (o.balloonS || 0.12) * o.balloon, tilt, t, o.lamp || 0, dim);
  }
  ringPass(true);
}
// a tiny balloon (envelope + basket + his head + a lantern) whose basket stands on (x, y), pointing away from the planet's
// centre along its tilt; about 840 tall at s = 1. lamp 0..1
function unMiniBalloon(x, y, s, tilt, t, lamp, dim = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(tilt);
  if (dim > 0.01) ctx.filter = `brightness(${(1 - 0.6 * dim).toFixed(3)}) saturate(${(1 - 0.3 * dim).toFixed(3)})`;
  ctx.translate(0, 8 * s * Math.sin(t * loopW(1.7)));
  ctx.scale(s, s);
  unEnvelope(ctx, 0, -250, 0.9, 0);
  for (const sx2 of [-1, 1]) line(ctx, sx2 * 40, -250, sx2 * 120, -150, 8, '#6B4A2E');
  circle(ctx, -10, -168, 44, '#F2B892');                    // his head over the rim, in the golden cap
  ctx.beginPath(); ctx.moveTo(-58, -178); ctx.quadraticCurveTo(-20, -262, 44, -214); ctx.lineTo(58, -168); ctx.closePath(); ctx.fillStyle = UNP.cap; ctx.fill();
  rrect(ctx, -140, -150, 280, 150, 20); ctx.fillStyle = '#B98A52'; ctx.fill();
  rrect(ctx, -148, -160, 296, 28, 12); ctx.fillStyle = '#4E3020'; ctx.fill();
  rrect(ctx, 150, -150, 34, 46, 8); ctx.fillStyle = lamp > 0.05 ? '#FFE6A0' : '#6A6F84'; ctx.fill();   // the lantern
  ctx.restore();
  if (lamp > 0.02) {
    const ca = Math.cos(tilt), sa = Math.sin(tilt);
    const lx = x + ca * 167 * s + sa * 127 * s, ly = y + sa * 167 * s - ca * 127 * s;
    softDot(gctx, lx, ly, 460 * s, '#FFB347', 0.95 * lamp);
    softDot(gctx, lx, ly, 120 * s, '#FFF2C8', 0.95 * lamp);
  }
}

// ---------------------------------------------------------------- the orbit diagram (world coordinates)
const UN_SUN = [540, 860];
// a point on the orbit at angle phi (0 = right of the Sun, pi/2 = in front of it, toward us), for radii rx, ry
function unOrbitAt(phi, rx, ry) { return [UN_SUN[0] + rx * Math.cos(phi), UN_SUN[1] + ry * Math.sin(phi)]; }
// o: {rx, ry, phi (where the planet is), R (its radius), dash, day 0..1 (the day half painted gold), nightArc 0..1 (how much
// of the night half is painted navy, from the top of the lap round the right), you 0..1 (the YOU tag), sunR, face}
function unOrbit(cam, t, o = {}) {
  const rx = o.rx || 400, ry = o.ry || 170, R = o.R || 70;
  applyCam(cam);
  // the Sun
  const sr = o.sunR || 70;
  softDot(ctx, UN_SUN[0], UN_SUN[1], sr * 3.0, '#FFB86A', 0.2);
  softDot(ctx, UN_SUN[0], UN_SUN[1], sr * 1.6, '#FFE2A8', 0.55);
  circle(ctx, UN_SUN[0], UN_SUN[1], sr, '#FFF6DA');
  softDot(gctx, UN_SUN[0], UN_SUN[1], sr * 1.9, '#FFD28A', 0.7);
  softDot(gctx, UN_SUN[0], UN_SUN[1], sr * 0.9, '#FFFFFF', 0.6);
  // the orbit path, and its two halves when asked: the day half (the planet left of the Sun: its right pole faces the Sun)
  // in gold, the night half (right of the Sun) in navy
  ctx.save();
  ctx.lineWidth = 6 / cam.zoom * 1.2; ctx.setLineDash([18, 16]); ctx.strokeStyle = 'rgba(200,220,255,0.55)';
  ctx.beginPath(); ctx.ellipse(UN_SUN[0], UN_SUN[1], rx, ry, 0, 0, 7); ctx.stroke();
  ctx.setLineDash([]);
  if ((o.day || 0) > 0.01) {
    ctx.lineWidth = 26; ctx.lineCap = 'round'; ctx.strokeStyle = `rgba(255,205,90,${0.9 * o.day})`;
    ctx.beginPath(); ctx.ellipse(UN_SUN[0], UN_SUN[1], rx, ry, 0, Math.PI / 2, Math.PI / 2 + Math.PI * clamp(o.day)); ctx.stroke();
  }
  if ((o.nightArc || 0) > 0.01) {
    ctx.lineWidth = 26; ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(70,100,230,0.95)';
    ctx.beginPath(); ctx.ellipse(UN_SUN[0], UN_SUN[1], rx, ry, 0, -Math.PI / 2, -Math.PI / 2 + Math.PI * clamp(o.nightArc)); ctx.stroke();
    softDot(gctx, UN_SUN[0] + rx, UN_SUN[1], 160, '#3A5CFF', 0.35 * clamp(o.nightArc));
  }
  ctx.restore();
  // the planet, on its side (its pole to the right, fixed in space), lit from the Sun
  const [px, py] = unOrbitAt(o.phi, rx, ry);
  const la = Math.atan2(UN_SUN[1] - py, UN_SUN[0] - px);
  const behind = Math.sin(o.phi) < -0.15 && Math.abs(Math.cos(o.phi)) < 0.6;
  const sz = R * (1 + 0.12 * Math.sin(o.phi));               // a little bigger in front, smaller behind (perspective)
  unPlanet(px, py, sz, t, { tilt: Math.PI / 2, light: la, night: 0.85, face: o.face, faceO: o.faceO, balloon: o.balloon === undefined ? 1 : o.balloon,
    balloonS: o.balloonS || 0.06, lamp: o.lamp || 0, rings: 0.9 });
  void behind;
  return [px, py, sz];
}
// a label on a dark pill in screen space (planets-earth-moon's peTag)
function unTag(x, y, txt, col, k, size = 44) { peTag(x, y, txt, col, k, size); }
