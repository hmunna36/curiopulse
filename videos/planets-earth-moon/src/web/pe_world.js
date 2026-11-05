// Could Every PLANET Fit Between You and the Moon? 🌕: the world (6 Nov 2026, a CURIOUS Short).
// The seven other planets stacked from Earth (bottom) up to the Moon (top) at TRUE scale: NASA's equatorial diameters
// at 0.004 world units a km, the Moon at its farthest (406,700 km centre to centre, 398,584 km surface to surface).
// The planets are painted once, pixel by pixel, from one Sun (saturn-bathtub's sb_space.js painters, plus a Neptune, a
// Uranus, a bare Saturn and the Moon painted here); faces are paint; the hero is jupiter-no-ground's spacesuit (jphero.js).
// Every position comes from the numbers below or a seeded generator: frames render identically every time.
'use strict';

// ---------------------------------------------------------------- the tower, true scale
const PE_K = 0.004;                                    // world units a km
const PE_X = 540;                                      // the tower's axis (world x)
const PE_DIAM = { earth: 12756, mercury: 4879, venus: 12104, mars: 6792, jupiter: 142984, saturn: 120536, uranus: 51118,
  neptune: 49528, moon: 3475 };                        // km, NASA's planetary fact sheets (equatorial)
const PE_ORDER = ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
const PE_R = {};
for (const k in PE_DIAM) PE_R[k] = PE_DIAM[k] * PE_K / 2;
const PE_Y = { earth: 0 };                             // centres (world y; up is negative)
(() => { let y = -PE_R.earth; for (const k of PE_ORDER) { PE_Y[k] = y - PE_R[k]; y -= 2 * PE_R[k]; } PE_Y.top = y; })();
const PE_SURF = -PE_R.earth;                           // Earth's top
const PE_GAP_FAR = 398584 * PE_K;                      // surface to surface, the Moon at its farthest
const PE_GAP_CLOSE = 348284 * PE_K;                    // ... at its closest (356,400 km centre to centre)
const peMoonY = (g) => PE_SURF - g - PE_R.moon;        // the Moon's centre for a gap g
const PE_MOON_FAR = peMoonY(PE_GAP_FAR), PE_MOON_CLOSE = peMoonY(PE_GAP_CLOSE);
const PE_RING_ROT = -0.5;                              // Saturn's ring plane, tilted so its rings run into Jupiter and Uranus
const PE_EL = 0.36;                                    // how far above the ring plane we look (rad)

// ---------------------------------------------------------------- painters (the Sun: SB_SUN, upper left, in front)
// Saturn's globe with or without the shadow of its rings (sbPaintSaturn, plus `shadow`)
function pePaintSaturn(R, el, shadow) {
  const OB = 0.9, S = 2 * R, c = mkCanvas(S, S), x = c.getContext('2d'), img = x.createImageData(S, S), d = img.data;
  const Pv = [0, -Math.cos(el), Math.sin(el)], Fv = [0, Math.sin(el), Math.cos(el)], L = SB_SUN;
  const lp = sbDot(L, Pv);
  for (let py = 0; py < S; py++) for (let px = 0; px < S; px++) {
    const o = (py * S + px) * 4;
    const nx = (px + 0.5 - R) / R, ny = (py + 0.5 - R) / (R * (OB + (1 - OB) * Math.sin(el) * 0.6));
    const rr = nx * nx + ny * ny;
    if (rr > 1) { d[o + 3] = 0; continue; }
    const nz = Math.sqrt(1 - rr), n = [nx, ny, nz];
    const lat0 = Math.asin(clamp(sbDot(n, Pv), -1, 1)) * 57.2958, lon = Math.atan2(nx, sbDot(n, Fv));
    const tw = SBN.fbm(lon * 2.6 + 40, lat0 * 0.18 + 11, 4) - 0.5;
    const col = sbBand(SB_SAT_BANDS, lat0 + 2.6 * tw);
    const fine = SBN.fbm(lon * 18 + 5, lat0 * 1.3 + 2, 3) - 0.5, streak = SBN.fbm(lon * 3 + 9, lat0 * 3.1 + 4, 2) - 0.5;
    const br = 1 + 0.07 * fine + 0.08 * streak;
    const lam = sbDot(n, L);
    let lit = clamp(0.24 + 0.92 * Math.pow(clamp(lam * 0.9 + 0.1), 0.8)) * (0.74 + 0.26 * Math.pow(nz, 0.35));
    if (shadow && lp !== 0) {
      const s = -sbDot(n, Pv) / lp;
      if (s > 0) { const h = [n[0] + s * L[0], n[1] + s * L[1], n[2] + s * L[2]]; lit *= 1 - 0.72 * sbRingAt(Math.hypot(h[0], h[1], h[2]))[0]; }
    }
    const m = (col[0] + col[1] + col[2]) / 3;
    for (let k = 0; k < 3; k++) d[o + k] = clamp((m + (col[k] - m) * 1.25) * br * lit / 255) * 255;
    d[o + 3] = 255 * clamp((1 - Math.sqrt(rr)) * R * 0.9);
  }
  x.putImageData(img, 0, 0);
  return c;
}
// an ice giant: Neptune (deep blue, dark spot, white streaks) or Uranus (pale cyan, a bright pole)
function pePaintIce(R, kind) {
  const S = 2 * R, c = mkCanvas(S, S), x = c.getContext('2d'), img = x.createImageData(S, S), d = img.data, L = SB_SUN;
  const nep = kind === 'neptune';
  const deep = sbRGB(nep ? '#2446B8' : '#86C9D2'), mid = sbRGB(nep ? '#3D6BDA' : '#A3DCE2'), pale = sbRGB(nep ? '#6E9BEA' : '#C4ECEE');
  const spot = sbRGB('#132A78'), cloud = [244, 248, 255];
  for (let py = 0; py < S; py++) for (let px = 0; px < S; px++) {
    const nx = (px + 0.5 - R) / R, ny = (py + 0.5 - R) / R, rr = nx * nx + ny * ny, o = (py * S + px) * 4;
    if (rr > 1) { d[o + 3] = 0; continue; }
    const nz = Math.sqrt(1 - rr), lat = -Math.asin(ny) * 57.2958, lon = Math.atan2(nx, nz);
    const tw = SBN.fbm(lon * 2.2 + (nep ? 61 : 23), lat * 0.09 + 4, 4) - 0.5;
    const b = Math.sin((lat + 9 * tw) * (nep ? 0.16 : 0.11));
    let col = b > 0.35 ? [lerp(mid[0], pale[0], (b - 0.35) * 1.4), lerp(mid[1], pale[1], (b - 0.35) * 1.4), lerp(mid[2], pale[2], (b - 0.35) * 1.4)]
      : [lerp(deep[0], mid[0], clamp(b + 0.8)), lerp(deep[1], mid[1], clamp(b + 0.8)), lerp(deep[2], mid[2], clamp(b + 0.8))];
    if (nep) {
      const gx = (lon + 0.32) / 0.34, gy = (lat + 21) / 9, gr = Math.hypot(gx, gy);          // the Great Dark Spot
      if (gr < 1) { const k = clamp((1 - gr) * 2.4); col = [lerp(col[0], spot[0], k), lerp(col[1], spot[1], k), lerp(col[2], spot[2], k)]; }
      const cs = [[(lon + 0.18) / 0.3, (lat + 31) / 2.2], [(lon - 0.45) / 0.5, (lat - 26) / 1.8], [(lon - 0.1) / 0.38, (lat + 47) / 1.6]];
      for (const [u, v] of cs) {                                                             // bright cirrus streaks
        const k = Math.exp(-(u * u + v * v)) * clamp(SBN.fbm(lon * 30, lat * 2, 2) * 1.6 - 0.2);
        col = [lerp(col[0], cloud[0], k), lerp(col[1], cloud[1], k), lerp(col[2], cloud[2], k)];
      }
    } else if (lat > 48) {                                                                   // Uranus's bright polar cap
      const k = clamp((lat - 48) / 22) * 0.55;
      col = [lerp(col[0], 226, k), lerp(col[1], 246, k), lerp(col[2], 246, k)];
    }
    const lam = nx * L[0] + ny * L[1] + nz * L[2];
    const lit = clamp(0.1 + 1.0 * Math.pow(clamp(lam * 0.9 + 0.1), 0.8)) * (0.66 + 0.34 * Math.pow(nz, 0.4));
    const fine = 1 + 0.05 * (SBN.fbm(lon * 14 + 3, lat * 0.6, 3) - 0.5);
    for (let k = 0; k < 3; k++) d[o + k] = clamp(col[k] * lit * fine / 255) * 255;
    d[o + 3] = 255 * clamp((1 - Math.sqrt(rr)) * R * 0.9);
  }
  x.putImageData(img, 0, 0);
  return c;
}
// the Moon: grey highlands, dark maria, craters with bright rims and rays
function pePaintMoon(R) {
  const S = 2 * R, c = mkCanvas(S, S), x = c.getContext('2d'), img = x.createImageData(S, S), d = img.data, L = SB_SUN;
  const rng = mulberry32(3475), cr = [];
  for (let i = 0; i < 26; i++) cr.push([rng() * 2 - 1, rng() * 2 - 1, 0.04 + 0.13 * Math.pow(rng(), 2)]);
  for (let py = 0; py < S; py++) for (let px = 0; px < S; px++) {
    const nx = (px + 0.5 - R) / R, ny = (py + 0.5 - R) / R, rr = nx * nx + ny * ny, o = (py * S + px) * 4;
    if (rr > 1) { d[o + 3] = 0; continue; }
    const nz = Math.sqrt(1 - rr);
    let v = 196 + 18 * (SBN.fbm(nx * 4 + 9, ny * 4 + 2, 4) - 0.5);
    const mare = SBN.fbm(nx * 1.6 + 30, ny * 1.6 + 7, 4);
    if (mare > 0.52) v -= 70 * clamp((mare - 0.52) * 6);
    for (const [cx, cy, r] of cr) {
      const dd = Math.hypot(nx - cx, ny - cy) / r;
      if (dd < 1) v -= 34 * (1 - dd * dd) * clamp((0.6 - (nx - cx) * 2 - (ny - cy) * 2) + 0.2);
      else if (dd < 1.25) v += 26 * (1.25 - dd) * 4;
    }
    const lam = nx * L[0] + ny * L[1] + nz * L[2];
    const lit = clamp(0.12 + 1.0 * Math.pow(clamp(lam * 0.9 + 0.1), 0.75));
    d[o] = clamp(v * lit * 1.02 / 255) * 255; d[o + 1] = clamp(v * lit / 255) * 255; d[o + 2] = clamp(v * lit * 0.97 / 255) * 255;
    d[o + 3] = 255 * clamp((1 - Math.sqrt(rr)) * R * 0.9);
  }
  x.putImageData(img, 0, 0);
  return c;
}
let PE_TEX = null;
function peInitWorld() {
  sbInitSpace();
  PE_TEX = {
    jupiter: sbPaintJupiter(330), saturn: pePaintSaturn(380, PE_EL, true), saturnBare: pePaintSaturn(380, PE_EL, false),
    rings: sbPaintRings(380, PE_EL), uranus: pePaintIce(220, 'uranus'), neptune: pePaintIce(440, 'neptune'),
    earth: sbPaintWorld(70, 'earth', 0.4), mercury: sbPaintWorld(46, 'mercury', 1.1), venus: sbPaintWorld(56, 'venus', 2.2),
    mars: sbPaintWorld(50, 'mars', 3.3), moon: pePaintMoon(70),
  };
}

// ---------------------------------------------------------------- space
// the backdrop (saturn-bathtub's star layers and Milky Way), with the Sun at a screen point drifting a little with the camera
function peSpace(cam, t, sun = [118, 560], sunR = 26) {
  sbSpaceBg(cam, t, { sun: false });
  const x = sun[0] - (cam.x - 540) * 0.02, y = sun[1] - (cam.y + 900) * 0.01;
  screenSpace();
  softDot(ctx, x, y, sunR * 9, '#FFB86A', 0.16);
  softDot(ctx, x, y, sunR * 3.2, '#FFE2A8', 0.5);
  circle(ctx, x, y, sunR, '#FFFBEE');
  softDot(gctx, x, y, sunR * 4.2, '#FFE2A8', 0.85);
  softDot(gctx, x, y, sunR * 1.6, '#FFFFFF', 0.9);
  ctx.save(); ctx.translate(x, y); ctx.rotate(0.3);
  for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); const g = ctx.createLinearGradient(0, 0, sunR * 7, 0); g.addColorStop(0, 'rgba(255,240,210,0.55)'); g.addColorStop(1, 'rgba(255,240,210,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -sunR * 0.18); ctx.lineTo(sunR * 7, 0); ctx.lineTo(0, sunR * 0.18); ctx.fill(); }
  ctx.restore();
}

// ---------------------------------------------------------------- drawing a body
// a painted globe at (x, y), radius R (world units); o: {sx, sy, rot}; its glow occluder keeps bloom behind it
function peGlobe(img, x, y, R, o = {}) {
  const S = img.width, k = R / (S / 2);
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(k * (o.sx || 1), k * (o.sy || 1));
  ctx.drawImage(img, -S / 2, -S / 2);
  ctx.restore();
  if (o.occ !== false) { gctx.save(); gctx.translate(x, y); gctx.rotate(o.rot || 0); gctx.scale(o.sx || 1, o.sy || 1); gctx.beginPath(); gctx.arc(0, 0, R * 0.98, 0, 7); gctx.fillStyle = '#000'; gctx.fill(); gctx.restore(); }
}
// Saturn's rings (or one half) about (x, y) for a globe of radius R; o: {rot, a, sx, sy}
function peRings(x, y, R, half, o = {}) {
  const T = PE_TEX.rings, k = R / T.Rs, sq = Math.sin(PE_EL);
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot === undefined ? PE_RING_ROT : o.rot); ctx.scale(k * (o.sx || 1), k * sq * (o.sy || 1));
  const S = T.c.width, C = T.C;
  if (half === 'back') ctx.drawImage(T.c, 0, 0, S, C, -C, -C, S, C);
  else if (half === 'front') ctx.drawImage(T.c, 0, C, S, S - C, -C, 0, S, S - C);
  else ctx.drawImage(T.c, -C, -C);
  ctx.restore();
}

// ---------------------------------------------------------------- faces (paint, in globe units: R = 1)
// mood: smug | happy | eek | worried | grumpy | sleep | squeeze | side | blush | proud; o: {look, blink, rot, blush, sweat}
function peFace(x, y, R, mood, o = {}) {
  if (R < 9) return;
  const look = o.look || [0, 0];
  paint(() => {
    ctx.save(); ctx.translate(x + (o.dx || 0) * R, y + (o.dy || 0) * R); ctx.rotate(o.rot || 0); ctx.scale(R * (o.k || 1), R * (o.k || 1));
    const ink = '#1A1430', ey = -0.2, ex = 0.3, er = mood === 'eek' ? 0.2 : 0.16;
    for (const s of [-1, 1]) {
      const cx = s * ex;
      if (mood === 'sleep' || mood === 'happy' || mood === 'squeeze' || (o.blink || 0) > 0.85) {
        ctx.beginPath(); ctx.lineWidth = 0.055; ctx.strokeStyle = ink; ctx.lineCap = 'round';
        if (mood === 'squeeze') { ctx.moveTo(cx - s * er, ey - er * 0.7); ctx.lineTo(cx + s * er * 0.6, ey); ctx.lineTo(cx - s * er, ey + er * 0.7); }
        else if (mood === 'sleep') ctx.arc(cx, ey - er * 0.2, er * 0.85, Math.PI * 0.15, Math.PI * 0.85);
        else ctx.arc(cx, ey + er * 0.4, er * 0.85, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
      } else {
        const lid = mood === 'smug' || mood === 'grumpy' || mood === 'side' ? 0.55 : mood === 'proud' ? 0.62 : 1;
        ctx.beginPath(); ctx.ellipse(cx, ey, er, er * 1.08, 0, 0, 7); ctx.fillStyle = '#FFFDF6'; ctx.fill();
        ctx.lineWidth = 0.04; ctx.strokeStyle = ink; ctx.stroke();
        const pr = mood === 'eek' ? 0.06 : 0.08, lx = mood === 'side' && !o.look ? 0.9 : look[0], ly = look[1];
        ctx.beginPath(); ctx.arc(cx + lx * er * 0.45, ey + ly * er * 0.4 + (lid < 1 ? er * 0.12 : 0), pr, 0, 7); ctx.fillStyle = ink; ctx.fill();
        circle(ctx, cx + lx * er * 0.45 - pr * 0.35, ey + ly * er * 0.4 - pr * 0.4 + (lid < 1 ? er * 0.12 : 0), pr * 0.3, '#FFFFFF');
        if (lid < 1) {                                         // a heavy upper lid
          ctx.beginPath(); ctx.ellipse(cx, ey, er * 1.04, er * 1.12, 0, Math.PI, 2 * Math.PI); ctx.lineTo(cx + er * 1.04, ey - er * 1.12 + 2 * er * 1.12 * (1 - lid) * 0.9);
          ctx.closePath();
          ctx.save(); ctx.beginPath(); ctx.ellipse(cx, ey, er * 1.06, er * 1.14, 0, 0, 7); ctx.clip();
          ctx.fillStyle = o.lidCol || 'rgba(40,40,80,0.55)'; ctx.fillRect(cx - er * 1.2, ey - er * 1.3, er * 2.4, er * 2.4 * (1 - lid) + er * 0.05);
          ctx.restore();
          ctx.beginPath(); ctx.moveTo(cx - er * 1.0, ey - er * 1.25 + er * 2.3 * (1 - lid)); ctx.lineTo(cx + er * 1.0, ey - er * 1.25 + er * 2.3 * (1 - lid));
          ctx.lineWidth = 0.045; ctx.strokeStyle = ink; ctx.stroke();
        }
      }
      // brows
      ctx.lineWidth = 0.05; ctx.strokeStyle = ink; ctx.lineCap = 'round'; ctx.beginPath();
      if (mood === 'grumpy' || mood === 'squeeze') { ctx.moveTo(cx + s * er * 1.1, ey - er * 1.75); ctx.lineTo(cx - s * er * 0.8, ey - er * 1.3); }
      else if (mood === 'worried' || mood === 'eek' || mood === 'blush') { ctx.moveTo(cx - s * er * 0.9, ey - er * 1.45); ctx.lineTo(cx + s * er * 0.7, ey - er * 1.85); }
      else if (mood === 'smug' || mood === 'proud') { ctx.moveTo(cx - er * 0.9, ey - er * 1.55); ctx.quadraticCurveTo(cx, ey - er * 1.95, cx + er * 0.9, ey - er * 1.6); }
      else if (mood === 'side') { ctx.moveTo(cx - er * 0.9, ey - er * 1.4 + s * 0.02); ctx.lineTo(cx + er * 0.9, ey - er * 1.55); }
      ctx.stroke();
    }
    const bl = o.blush !== undefined ? o.blush : mood === 'blush' ? 1 : 0;
    if (bl > 0.02) for (const s of [-1, 1]) { ctx.save(); ctx.globalAlpha = 0.5 * bl; ellipse(ctx, s * 0.42, 0.08, 0.13, 0.07, '#FF6F8E'); ctx.restore(); }
    // the mouth
    ctx.lineWidth = 0.055; ctx.strokeStyle = ink; ctx.lineCap = 'round'; ctx.beginPath();
    const my = 0.16;
    if (mood === 'smug' || mood === 'proud') { ctx.moveTo(-0.17, my - 0.01); ctx.quadraticCurveTo(0.02, my + 0.09, 0.21, my - 0.06); ctx.stroke(); }
    else if (mood === 'happy') { ctx.moveTo(-0.19, my - 0.03); ctx.quadraticCurveTo(0, my + 0.17, 0.19, my - 0.03); ctx.stroke(); }
    else if (mood === 'eek' || mood === 'blush') { ctx.ellipse(0, my + 0.03, 0.08, 0.11, 0, 0, 7); ctx.fillStyle = '#3A1020'; ctx.fill(); }
    else if (mood === 'worried' || mood === 'squeeze') { ctx.moveTo(-0.16, my + 0.04); ctx.quadraticCurveTo(-0.06, my - 0.04, 0.02, my + 0.03); ctx.quadraticCurveTo(0.1, my + 0.09, 0.17, my + 0.02); ctx.stroke(); }
    else if (mood === 'grumpy' || mood === 'side') { ctx.moveTo(-0.15, my + 0.05); ctx.quadraticCurveTo(0, my - 0.03, 0.15, my + 0.05); ctx.stroke(); }
    else if (mood === 'sleep') { ctx.moveTo(-0.08, my + 0.04); ctx.quadraticCurveTo(0, my - 0.01, 0.08, my + 0.04); ctx.stroke(); }
    if ((o.sweat || 0) > 0.02) sweatDrop(ctx, 0.56, -0.38, 0.0042, o.sweat);
    ctx.restore();
  });
}

// ---------------------------------------------------------------- props
// Neptune's nightcap on top of a globe at (x, y) radius R: a floppy striped cone with a pom-pom. k: 0..1 (popping on)
function peNightcap(x, y, R, k, t, o = {}) {
  if (k <= 0.01) return;
  const rot = (o.rot || 0) + 0.18, flop = 0.55 + 0.06 * Math.sin(t * 3.1);
  const sc = o.size || 0.78;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(R * k * sc, R * k * sc);
  ctx.translate(0, -0.86 / sc);
  // the cone, flopping over to the right
  const tip = [0.95 * flop + 0.28, -0.42 + 0.5 * flop];
  ctx.beginPath(); ctx.moveTo(-0.52, 0.12); ctx.quadraticCurveTo(-0.1, -0.95, tip[0], tip[1]); ctx.quadraticCurveTo(0.2, -0.38, 0.5, 0.1); ctx.closePath();
  ctx.fillStyle = '#3B4FB8'; ctx.fill();
  paint(() => {                                            // white stripes
    ctx.save(); ctx.clip();
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-0.7 + i * 0.32, 0.3); ctx.lineTo(-0.2 + i * 0.32, -1.0); ctx.lineWidth = 0.1; ctx.strokeStyle = '#E8EEFF'; ctx.stroke(); }
    ctx.restore();
  });
  // the brim
  ctx.beginPath(); ctx.ellipse(0, 0.1, 0.58, 0.15, 0, 0, 7); ctx.fillStyle = '#F2F5FF'; ctx.fill();
  circle(ctx, tip[0], tip[1], 0.15, '#FFFFFF');
  ctx.restore();
}
// a pillow (world units: centre, half-width w)
function pePillow(x, y, w, k) {
  if (k <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(w * k, w * k);
  ctx.beginPath(); ctx.moveTo(-1, -0.2); ctx.quadraticCurveTo(-1.08, -0.42, -0.85, -0.42); ctx.quadraticCurveTo(0, -0.3, 0.85, -0.42);
  ctx.quadraticCurveTo(1.08, -0.42, 1, -0.2); ctx.quadraticCurveTo(1.04, 0.28, 0.85, 0.3); ctx.quadraticCurveTo(0, 0.2, -0.85, 0.3);
  ctx.quadraticCurveTo(-1.04, 0.28, -1, -0.2); ctx.fillStyle = '#F4F0FF'; ctx.fill();
  paint(() => { ctx.beginPath(); ctx.moveTo(-0.7, -0.1); ctx.quadraticCurveTo(0, 0.02, 0.7, -0.12); ctx.lineWidth = 0.05; ctx.strokeStyle = '#C8C0E8'; ctx.stroke(); });
  ctx.restore();
}
// a label on a dark pill in screen space with an outBack pop (kit.js's pill, a little smaller and without the glow ring)
function peTag(x, y, txt, col, k, size = 42) {
  if (k <= 0.01) return;
  screenSpace();
  paint(() => {
    ctx.save(); ctx.translate(x, y); const s = E.outBack(clamp(k), 2); ctx.scale(s, s);
    ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const w = ctx.measureText(txt).width + size * 1.0, h = size * 1.5;
    rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = 'rgba(8,10,30,0.86)'; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = col; ctx.stroke();
    ctx.fillStyle = col; ctx.fillText(txt, 0, 2);
    ctx.restore();
  });
}
// a bracket in screen space from (x, y0) to (x, y1), its teeth pointing to side (-1 left, +1 right); k draws it on
function peBracket(x, y0, y1, side, col, k, w = 6) {
  if (k <= 0.01) return;
  screenSpace();
  const ym = (y0 + y1) / 2, h = (y1 - y0) / 2 * clamp(k);
  paint(() => {
    ctx.lineWidth = w; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(x + side * 22, ym - h); ctx.lineTo(x, ym - h); ctx.lineTo(x, ym + h); ctx.lineTo(x + side * 22, ym + h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, ym); ctx.lineTo(x - side * 16, ym); ctx.stroke();
  });
  softDot(gctx, x, ym, 30, col, 0.25 * clamp(k));
}
// the hero's tape measure: from the case at a (world) along to b; yellow with ticks every `tick` world units
function peTape(a, b, k, tick, zoom) {
  if (k <= 0.01) return;
  const e = [lerp(a[0], b[0], k), lerp(a[1], b[1], k)], L = Math.hypot(e[0] - a[0], e[1] - a[1]);
  const w = 15 / zoom;
  line(ctx, a[0], a[1], e[0], e[1], w, '#F2C230');
  paint(() => {
    const dx = (e[0] - a[0]) / (L || 1), dy = (e[1] - a[1]) / (L || 1);
    for (let s = tick; s < L; s += tick) { const p = [a[0] + dx * s, a[1] + dy * s]; line(ctx, p[0] - dy * w * 0.45, p[1] + dx * w * 0.45, p[0] + dy * w * 0.1, p[1] - dx * w * 0.1, 2.2 / zoom, '#3A2A10'); }
    line(ctx, e[0] - 12 / zoom, e[1], e[0] + 12 / zoom, e[1], 5 / zoom, '#C8CCD8');   // the hook at its end
  });
}
// the tape's case in his hand (rig-local, from his layer's post)
function peTapeCase(lc, p, s = 1) {
  rrect(lc, p[0] - 30 * s, p[1] - 28 * s, 60 * s, 56 * s, 14 * s); lc.fillStyle = '#E8B21E'; lc.fill();
  paint(() => { circle(lc, p[0], p[1], 15 * s, '#2A2A3A'); circle(lc, p[0], p[1], 6 * s, '#C8CCD8'); });
}
// the jetpack behind him (rig-local, drawn in his layer's pre): two tanks peeking out at his shoulders, flames below
function peJetpack(lc, rr, thrust, t) {
  for (const s of [-1, 1]) {
    const x = s * 70, y0 = -330, y1 = -190;
    rrect(lc, x - 26, y0, 52, y1 - y0, 22); lc.fillStyle = '#C9CFDC'; lc.fill();
    rrect(lc, x - 18, y1 - 6, 36, 22, 6); lc.fillStyle = '#5A6070'; lc.fill();
    if (thrust > 0.02) {
      const fl = thrust * (34 + 10 * Math.sin(t * 41 + s * 2) + 6 * Math.sin(t * 67));
      const g = lc.createLinearGradient(x, y1 + 14, x, y1 + 14 + fl * 2.2);
      g.addColorStop(0, 'rgba(255,240,190,0.95)'); g.addColorStop(0.4, 'rgba(255,170,60,0.85)'); g.addColorStop(1, 'rgba(255,90,40,0)');
      lc.fillStyle = g; lc.beginPath(); lc.moveTo(x - 13, y1 + 14); lc.quadraticCurveTo(x, y1 + 14 + fl * 2.6, x + 13, y1 + 14); lc.fill();
    }
  }
}
