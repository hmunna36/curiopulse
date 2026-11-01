// Earth Has More TREES Than Our Galaxy Has STARS 🌲 — space: a star tile, Earth painted once (an orthographic disc from 3D noise,
// after cleopatra-moon-landing's cm_world.js, with its forests kept as a mask so they can green over), a satellite with a
// squinting lens, a balance with a pine on one pan and a star on the other, and the number cards.
'use strict';

let TVS_STARS = null, TVS_EARTH = null, TVS_GREEN = null;
const TVS_N = 900;

function initTvSpace() {
  {
    const TW = 1280, TH = 2200, c = mkCanvas(TW, TH), x = c.getContext('2d');
    x.fillStyle = '#03040C'; x.fillRect(0, 0, TW, TH);
    for (const [nx, ny, nr, col, a] of [[220, 420, 520, '#2E2A7A', 0.35], [980, 980, 620, '#1E3C7A', 0.3], [420, 1700, 600, '#4A2468', 0.25]]) {
      const g = x.createRadialGradient(nx, ny, 0, nx, ny, nr); g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0));
      x.fillStyle = g; x.fillRect(0, 0, TW, TH);
    }
    const rng = mulberry32(611);
    for (let i = 0; i < 1500; i++) {
      const sx = rng() * TW, sy = rng() * TH, r = Math.pow(rng(), 3) * 2.2 + 0.4, tint = rng();
      x.fillStyle = tint < 0.15 ? `rgba(255,220,190,${0.4 + 0.6 * rng()})` : tint < 0.3 ? `rgba(190,215,255,${0.4 + 0.6 * rng()})` : `rgba(240,242,255,${0.3 + 0.6 * rng()})`;
      x.beginPath(); x.arc(sx, sy, r, 0, 7); x.fill();
    }
    TVS_STARS = c;
  }
  // Earth: the disc as it is, and a second copy whose forests (and the land farms took) are a deep green: "before farming"
  {
    const S = TVS_N, R = S / 2 - 2;
    TVS_EARTH = mkCanvas(S, S); TVS_GREEN = mkCanvas(S, S);
    const x = TVS_EARTH.getContext('2d'), img = x.createImageData(S, S), d = img.data;
    const x2 = TVS_GREEN.getContext('2d'), img2 = x2.createImageData(S, S), d2 = img2.data;
    const tilt = 0.36, cT = Math.cos(tilt), sT = Math.sin(tilt), lon0 = 0.9;
    for (let py = 0; py < S; py++) for (let px = 0; px < S; px++) {
      const nx = (px - S / 2 + 0.5) / R, ny = (py - S / 2 + 0.5) / R, rr = nx * nx + ny * ny;
      if (rr > 1) continue;
      const nz = Math.sqrt(1 - rr);
      const y1 = ny * cT - nz * sT, z1 = ny * sT + nz * cT;
      const lat = Math.asin(-y1), lon = Math.atan2(nx, z1) + lon0;
      const P = [Math.cos(lat) * Math.cos(lon), Math.cos(lat) * Math.sin(lon), Math.sin(lat)];
      const land = snFbm(P[0] * 1.4 + 2.1, P[1] * 1.4 - 0.7, P[2] * 1.4 + 0.4, 23, 5) + 0.07;
      const cloud = snFbm(P[0] * 2.6 - 4, P[1] * 2.6 + 2, P[2] * 3.4, 57, 4);
      const ice = Math.abs(lat) > 1.18 + 0.08 * snFbm(P[0] * 4, P[1] * 4, P[2] * 4, 9, 2);
      let r, g, b, r2, g2, b2;
      if (ice) { r = 236; g = 244; b = 252; r2 = r; g2 = g; b2 = b; }
      else if (land > 0.1) {
        const dry = clamp((snFbm(P[0] * 3, P[1] * 3, P[2] * 3, 33, 3) + 0.12) * 2.2) * clamp(1 - Math.abs(lat) / 1.15);
        const wood = clamp((snFbm(P[0] * 5.5, P[1] * 5.5, P[2] * 5.5, 71, 3) + 0.05) * 3) * (1 - dry);
        const hi = clamp((land - 0.1) * 3);
        // today: forest (deep green) where `wood`, fields and scrub (light, yellowish) elsewhere, desert where dry
        const fr = lerp(lerp(196, 206, hi), 220, dry), fg = lerp(lerp(184, 176, hi), 186, dry), fb = lerp(lerp(104, 98, hi), 122, dry);
        r = lerp(fr, 34, wood); g = lerp(fg, 112, wood); b = lerp(fb, 58, wood);
        // before farming: the fields were forest too (the deserts stay deserts)
        const w2 = clamp(wood + 0.85 * (1 - dry));
        r2 = lerp(fr, 26, w2); g2 = lerp(fg, 104, w2); b2 = lerp(fb, 52, w2);
      } else {
        const deep = clamp(-land * 3.5);
        r = lerp(46, 18, deep); g = lerp(140, 70, deep); b = lerp(214, 168, deep); r2 = r; g2 = g; b2 = b;
      }
      const cl = clamp((cloud - 0.2) * 3.0) * 0.75;
      const limb = 0.55 + 0.45 * nz, k = (py * S + px) * 4;
      d[k] = lerp(r, 252, cl) * limb; d[k + 1] = lerp(g, 252, cl) * limb; d[k + 2] = lerp(b, 255, cl) * limb; d[k + 3] = 255;
      d2[k] = lerp(r2, 252, cl) * limb; d2[k + 1] = lerp(g2, 252, cl) * limb; d2[k + 2] = lerp(b2, 255, cl) * limb; d2[k + 3] = 255;
    }
    x.putImageData(img, 0, 0); x2.putImageData(img2, 0, 0);
  }
}
function tvsSpaceBg(t, px = 0, py = 0) {
  screenSpace();
  ctx.fillStyle = '#03040C'; ctx.fillRect(0, 0, W, H);
  const TH = TVS_STARS.height, oy = ((-py * 0.1) % TH + TH) % TH, ox = -100 - px * 0.06;
  ctx.drawImage(TVS_STARS, ox, oy - TH); ctx.drawImage(TVS_STARS, ox, oy);
  const rng = mulberry32(12);
  paint(() => {
    for (let i = 0; i < 16; i++) {
      const sx = rng() * W, sy = rng() * H, ph = rng() * 6.28, k = 0.4 + 0.4 * Math.sin(loopW(0.7 + rng()) * t + ph);
      softDot(gctx, sx, sy, 8, '#DDE6FF', k); circle(ctx, sx, sy, 1.8, `rgba(245,248,255,${k})`);
    }
  });
}
// Earth at (x, y), radius R, lit from the upper left; green 0..1 shows the "before farming" copy (wiped in from the lit side)
function tvsEarth(x, y, R, t, o = {}) {
  softDot(gctx, x, y, R * 1.5, '#4F9DFF', 0.32);
  softDot(ctx, x, y, R * 1.25, '#5FA8FF', 0.16);
  circle(ctx, x, y, R, '#1D4E9A');
  paint(() => {
    const rot = o.rot || 0;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.drawImage(TVS_EARTH, -R, -R, 2 * R, 2 * R); ctx.restore();
    const gk = o.green || 0;
    if (gk > 0.001) {
      ctx.save(); ctx.beginPath(); ctx.arc(x, y, R * 1.002, 0, 7); ctx.clip();
      ctx.beginPath(); ctx.arc(x - R * 1.2, y - R * 1.2, R * 3.3 * gk, 0, 7); ctx.clip();
      ctx.translate(x, y); ctx.rotate(rot); ctx.drawImage(TVS_GREEN, -R, -R, 2 * R, 2 * R); ctx.restore();
    }
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, R + 0.5, 0, 7); ctx.clip();          // the night side
    const g = ctx.createLinearGradient(x - R * 0.7, y - R * 0.7, x + R, y + R);
    g.addColorStop(0, 'rgba(6,10,30,0)'); g.addColorStop(0.6, 'rgba(6,10,30,0)'); g.addColorStop(0.8, 'rgba(6,10,30,0.7)'); g.addColorStop(1, 'rgba(4,6,22,0.9)');
    ctx.fillStyle = g; ctx.fillRect(x - R - 2, y - R - 2, 2 * R + 4, 2 * R + 4); ctx.restore();
    ctx.beginPath(); ctx.arc(x, y, R + 2, Math.PI * 0.85, Math.PI * 1.7); ctx.lineWidth = Math.max(2, R * 0.03); ctx.strokeStyle = 'rgba(140,205,255,0.8)'; ctx.stroke();
  });
}
// the satellite (screen units): centre (x, y), scale s, tilt rot; squint 0..1 (the lens racks out, the iris closes to a slit),
// beam 0..1 (a scan cone down to the planet), look -1..1 (where the lens points, sideways)
function tvsSatellite(x, y, s, t, o = {}) {
  const c = ctx, sq = o.squint || 0;
  c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.scale(s, s);
  // the scan cone (behind it)
  if (o.beam > 0.01) {
    const g = c.createLinearGradient(0, 60, 0, 900);
    g.addColorStop(0, `rgba(120,240,255,${0.32 * o.beam})`); g.addColorStop(1, 'rgba(120,240,255,0)');
    c.fillStyle = g; c.beginPath(); c.moveTo(-26, 90); c.lineTo(26, 90); c.lineTo(260, 900); c.lineTo(-260, 900); c.closePath(); c.fill();
  }
  // solar panels on booms
  c.fillStyle = '#8A93A3'; c.fillRect(-250, -8, 500, 12);
  for (const sd of [-1, 1]) {
    c.save(); c.translate(sd * 260, -2); c.rotate(sd * 0.04 * Math.sin(t * loopW(0.6)));
    c.fillStyle = '#1B2F6A'; rrect(c, sd > 0 ? 0 : -190, -70, 190, 140, 6); c.fill();
    paint(() => {
      c.strokeStyle = 'rgba(140,190,255,0.55)'; c.lineWidth = 3;
      for (let i = 1; i < 5; i++) { const gx = (sd > 0 ? 0 : -190) + i * 38; c.beginPath(); c.moveTo(gx, -66); c.lineTo(gx, 66); c.stroke(); }
      for (let j = 1; j < 4; j++) { const gy = -70 + j * 35; c.beginPath(); c.moveTo(sd > 0 ? 4 : -186, gy); c.lineTo(sd > 0 ? 186 : -4, gy); c.stroke(); }
    });
    c.restore();
  }
  // the body in gold foil
  c.fillStyle = '#C99A38'; rrect(c, -78, -92, 156, 150, 14); c.fill();
  paint(() => {
    c.strokeStyle = 'rgba(255,230,150,0.55)'; c.lineWidth = 3;
    for (const [a, b, e, f] of [[-60, -70, -10, -40], [10, -80, 60, -30], [-50, 0, 0, 40], [20, 10, 66, 44]]) { c.beginPath(); c.moveTo(a, b); c.lineTo(e, f); c.stroke(); }
  });
  // the dish and the antenna
  c.fillStyle = '#D7DCE4'; c.beginPath(); c.ellipse(-30, -112, 46, 18, -0.3, Math.PI, 0); c.fill();
  c.strokeStyle = '#9AA3B2'; c.lineWidth = 5; c.beginPath(); c.moveTo(40, -92); c.lineTo(66, -160); c.stroke();
  circle(c, 66, -164, 8, '#FF6A5A'); softDot(gctx, 66, -164, 14, '#FF6A5A', 0.5 + 0.5 * Math.sin(t * loopW(5)));
  // the lens: a tube under the body that racks out, with an iris (its "eye")
  const ext = 44 + 36 * sq, lk = (o.look || 0) * 10;
  c.fillStyle = '#3A4252'; rrect(c, -36, 50, 72, ext, 10); c.fill();
  c.fillStyle = '#20252F'; c.beginPath(); c.ellipse(lk, 50 + ext, 46, 22, 0, 0, 7); c.fill();
  paint(() => {
    const open = 1 - 0.82 * sq;
    c.fillStyle = '#0A0F18'; c.beginPath(); c.ellipse(lk, 50 + ext, 34, 15, 0, 0, 7); c.fill();
    c.fillStyle = '#5BE7FF'; c.beginPath(); c.ellipse(lk, 50 + ext, 18, 13 * open, 0, 0, 7); c.fill();
    circle(c, lk - 6, 50 + ext - 4 * open, 4 * open, '#E9FDFF');
    // squinting lids: two grey arcs closing over the lens
    if (sq > 0.05) {
      c.fillStyle = '#4A5366';
      c.beginPath(); c.ellipse(lk, 50 + ext - 22 + 12 * sq, 48, 12 * sq + 2, 0, 0, Math.PI, true); c.fill();
    }
  });
  softDot(gctx, lk, 50 + ext, 30, '#5BE7FF', 0.5 * (1 - 0.6 * sq));
  c.restore();
}
// a balance (screen units): pivot (x, y), s scale, tilt (radians, + = the right pan down), k pop
function tvsBalance(x, y, s, tilt, k, t, o = {}) {
  const BL = 250;
  if (k <= 0.01) return;
  const c = ctx;
  c.save(); c.translate(x, y); c.scale(s * k, s * k);
  // the stand
  c.fillStyle = '#B88A3A'; rrect(c, -14, 0, 28, 330, 8); c.fill();
  c.fillStyle = '#8E6A2C'; c.beginPath(); c.ellipse(0, 330, 120, 26, 0, 0, 7); c.fill();
  circle(c, 0, 0, 22, '#E0B858');
  // the beam
  c.save(); c.rotate(tilt);
  c.fillStyle = '#E0B858'; rrect(c, -BL - 10, -10, 2 * BL + 20, 20, 8); c.fill();
  c.restore();
  for (const sd of [-1, 1]) {
    const ex = sd * BL * Math.cos(tilt), ey = sd * BL * Math.sin(tilt);
    c.strokeStyle = '#C9A24A'; c.lineWidth = 4;
    c.beginPath(); c.moveTo(ex, ey); c.lineTo(ex - 90, ey + 150); c.moveTo(ex, ey); c.lineTo(ex + 90, ey + 150); c.stroke();
    c.fillStyle = '#E0B858'; c.beginPath(); c.ellipse(ex, ey + 154, 104, 22, 0, 0, Math.PI); c.fill();
    c.fillStyle = '#C9A24A'; c.fillRect(ex - 104, ey + 150, 208, 8);
    if (sd < 0) tvPine(c, ex, ey + 150, 150, { w: 0.5, col: ['#2C7A4E', '#35905A', '#256A44'], sway: 3 * Math.sin(t * 3), trunkK: 0.14 });
    else {
      const sy = ey + 150 - 62;
      softDot(gctx, ex, sy, 120, '#FFD86A', 0.8);
      paint(() => { tvStarPath(c, ex, sy, 64, 0.05 * Math.sin(t * 2.4)); c.fillStyle = '#FFD447'; c.fill(); tvStarPath(c, ex, sy - 4, 34); c.fillStyle = '#FFF4C2'; c.fill(); });
    }
    if (o.labels) {
      paint(() => {
        c.textAlign = 'center'; c.textBaseline = 'middle';
        c.lineWidth = 10; c.strokeStyle = '#0B0B1A'; c.lineJoin = 'round';
        const L = sd < 0 ? o.labels[0] : o.labels[1];
        c.font = '900 44px Montserrat'; c.strokeText(L[0], ex, ey + 222); c.fillStyle = sd < 0 ? '#7CFFB2' : '#FFD447'; c.fillText(L[0], ex, ey + 222);
        c.font = '800 34px Montserrat'; c.strokeText(L[1], ex, ey + 268); c.fillStyle = '#E8EEF8'; c.fillText(L[1], ex, ey + 268);
      });
    }
  }
  c.restore();
}
// a readout card (screen units): two lines, centred at (x, y); k pop
function tvsCard(x, y, k, l1, l2, col, rot = -0.04, size = 1) {
  if (k <= 0.01) return;
  const c = ctx;
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(size * E.outBack(clamp(k)), size * E.outBack(clamp(k)));
  c.font = '900 76px Montserrat';
  const w1 = c.measureText(l1).width; c.font = '800 40px Montserrat';
  const w2 = c.measureText(l2).width, bw = Math.max(w1, w2) + 70;
  c.fillStyle = '#0E1526'; rrect(c, -bw / 2, -82, bw, 164, 22); c.fill();
  paint(() => {
    c.lineWidth = 5; c.strokeStyle = col; rrect(c, -bw / 2 + 8, -74, bw - 16, 148, 16); c.stroke();
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = '900 76px Montserrat'; c.fillStyle = col; c.fillText(l1, 0, -18);
    c.font = '800 40px Montserrat'; c.fillStyle = '#E8EEF8'; c.fillText(l2, 0, 46);
  });
  c.restore();
}
