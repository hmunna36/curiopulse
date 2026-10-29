// What If the Sun VANISHED Right Now? ☀️ — space. Stars and a nebula (painted once, tiled), the Sun (granulation,
// limb darkening, prominences; after neutron-star-teaspoon's nsSun), the light switch beside it, the POP when it goes,
// the chalk outline it leaves (SUN WAS HERE), the road of sunshine down to Earth with its envelopes and its dark end,
// Earth (painted once from noise: oceans, land, ice, clouds; a day side, a night side with city lights), the orbit seen
// from above with the rope of its PULL, the dark ring of the news spreading from the outline, and a tumbleweed.
'use strict';

let SV_STARS = null, SV_GRAN = null, SV_EARTH = null, SV_LIGHTS = null, SV_EARTH_N = 0;

function initSpace() {
  // ---- stars and a nebula: a tile 1280 x 2400 that repeats vertically (the road shot travels a long way)
  {
    const TW = 1280, TH = 2400, c = mkCanvas(TW, TH), x = c.getContext('2d');
    x.fillStyle = '#03040C'; x.fillRect(0, 0, TW, TH);
    const neb = [[220, 420, 520, '#2E2A7A', 0.5], [980, 980, 620, '#1E3C7A', 0.45], [420, 1700, 600, '#4A2468', 0.4], [1100, 2150, 420, '#2A2E6E', 0.4], [600, 2400, 500, '#2E2A7A', 0.5], [220, 0, 520, '#2E2A7A', 0.5]];
    for (const [nx, ny, nr, col, a] of neb) {
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
    SV_STARS = c;
  }
  // ---- the Sun's granulation
  {
    const S = 700, c = mkCanvas(S, S), x = c.getContext('2d');
    x.fillStyle = '#F07A1E'; x.fillRect(0, 0, S, S);
    const rng = mulberry32(77);
    for (let i = 0; i < 2600; i++) {
      const cx = rng() * S, cy = rng() * S, r = 5 + rng() * 11;
      const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, `rgba(255,${170 + 50 * rng()},${70 + 50 * rng()},0.8)`); g.addColorStop(1, 'rgba(255,130,30,0)');
      x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill();
    }
    for (let i = 0; i < 7; i++) {
      const cx = rng() * S, cy = 150 + rng() * 400, r = 6 + rng() * 10;
      x.fillStyle = 'rgba(120,40,10,0.85)'; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill();
      x.fillStyle = 'rgba(200,90,30,0.6)'; x.beginPath(); x.arc(cx, cy, r * 1.8, 0, 7); x.fill();
    }
    SV_GRAN = c;
  }
  // ---- Earth: an orthographic disc painted once from 3D noise (no seams), and its city lights on a layer of their own
  {
    const S = 520, R = S / 2 - 2;
    SV_EARTH = mkCanvas(S, S); SV_LIGHTS = mkCanvas(S, S);
    const x = SV_EARTH.getContext('2d'), xl = SV_LIGHTS.getContext('2d');
    const img = x.createImageData(S, S), li = xl.createImageData(S, S), d = img.data, dl = li.data;
    const tilt = 0.38, cT = Math.cos(tilt), sT = Math.sin(tilt), lon0 = 1.9;
    const rng = mulberry32(3301);
    for (let py = 0; py < S; py++) for (let px = 0; px < S; px++) {
      const nx = (px - S / 2 + 0.5) / R, ny = (py - S / 2 + 0.5) / R, rr = nx * nx + ny * ny;
      if (rr > 1) continue;
      const nz = Math.sqrt(1 - rr);
      // tilt the globe a little (north toward us), then a point on the unit sphere
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
        if (rng() < 0.012 + 0.05 * clamp(1 - (land - 0.1) * 6)) {          // a city (more of them near the coasts)
          const k = (py * S + px) * 4, a = 140 + 115 * rng();
          dl[k] = 255; dl[k + 1] = 200 + 40 * rng(); dl[k + 2] = 120; dl[k + 3] = a;
        }
      } else {
        const deep = clamp(-land * 3.5);
        r = lerp(46, 18, deep); g = lerp(140, 70, deep); b = lerp(214, 168, deep);
      }
      const cl = clamp((cloud - 0.08) * 3.2) * 0.92;
      r = lerp(r, 252, cl); g = lerp(g, 252, cl); b = lerp(b, 255, cl);
      const limb = 0.55 + 0.45 * nz;
      const k = (py * S + px) * 4;
      d[k] = r * limb; d[k + 1] = g * limb; d[k + 2] = b * limb; d[k + 3] = 255;
      if (cl > 0.3 && dl[k + 3]) dl[k + 3] *= 1 - cl;              // clouds hide cities
    }
    x.putImageData(img, 0, 0); xl.putImageData(li, 0, 0);
    SV_EARTH_N = S;
  }
}

// ---------------------------------------------------------------- the black with stars (screen space; py = how far the
// camera has travelled, for a slow vertical parallax)
function svSpaceBg(t, py = 0, px = 0) {
  screenSpace();
  ctx.fillStyle = '#03040C'; ctx.fillRect(0, 0, W, H);
  const TH = SV_STARS.height, oy = ((-py * 0.08) % TH + TH) % TH, ox = -100 - px * 0.05 + 14 * Math.sin(t * loopW(0.1));
  ctx.drawImage(SV_STARS, ox, oy - TH);
  ctx.drawImage(SV_STARS, ox, oy);
  const rng = mulberry32(12);
  paint(() => {
    for (let i = 0; i < 16; i++) {                                     // a few twinkling stars (they loop)
      const sx = rng() * W, sy = rng() * H, ph = rng() * 6.28, a = 0.4 + 0.4 * Math.sin(loopW(0.7 + rng()) * t + ph);
      softDot(gctx, sx, sy, 8, '#DDE6FF', a); circle(ctx, sx, sy, 1.8, `rgba(245,248,255,${a})`);
    }
  });
}

// ---------------------------------------------------------------- the Sun at (x, y), radius R (any canvas under the camera)
function svSun(x, y, R, t, k = 1) {
  if (k <= 0.005) return;
  softDot(gctx, x, y, R * 2.6, '#FFB050', 0.4 * k);
  softDot(ctx, x, y, R * 1.8, '#FF8A30', 0.3 * k);
  for (let i = 0; i < 4; i++) {                                       // prominences at the limb
    const a = -2.4 + i * 1.5 + 0.1 * Math.sin(t + i), h = R * (0.14 + 0.06 * Math.sin(t * 0.8 + i * 2));
    for (const [c, w, col] of [[ctx, R * 0.035, 'rgba(255,110,60,0.85)'], [gctx, R * 0.07, 'rgba(255,140,70,0.6)']]) {
      c.lineWidth = w * k; c.strokeStyle = col; c.lineCap = 'round'; c.beginPath();
      for (let j = 0; j <= 16; j++) { const u = j / 16, aa = a + (u - 0.5) * 0.22, rr = R + h * Math.sin(Math.PI * u) * k; c.lineTo(x + Math.cos(aa) * rr, y + Math.sin(aa) * rr); }
      c.stroke();
    }
  }
  const RR = R * k;
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, RR, 0, 7); ctx.clip();
  ctx.translate(x, y); ctx.rotate(t * 0.05);
  const s = (RR * 2.2) / SV_GRAN.width;
  ctx.drawImage(SV_GRAN, -SV_GRAN.width * s / 2, -SV_GRAN.height * s / 2, SV_GRAN.width * s, SV_GRAN.height * s);
  ctx.rotate(-t * 0.05); ctx.translate(-x, -y);
  const lg = ctx.createRadialGradient(x, y, RR * 0.55, x, y, RR);
  lg.addColorStop(0, 'rgba(120,30,0,0)'); lg.addColorStop(0.7, 'rgba(120,30,0,0.18)'); lg.addColorStop(1, 'rgba(110,20,0,0.7)');
  ctx.fillStyle = lg; ctx.fillRect(x - RR, y - RR, 2 * RR, 2 * RR);
  ctx.restore();
  softDot(gctx, x, y, RR * 1.02, '#FFC070', 0.2);
}

// ---------------------------------------------------------------- the light switch (a wall plate floating in space)
// off 0..1 (the toggle flips down), s scale (1 = 150 tall)
function svSwitch(c, x, y, s, off, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  rrect(c, -50, -76, 100, 152, 16); c.fillStyle = '#F2EEE2'; c.fill();
  paint(() => {
    rrect(c, -50, -76, 100, 152, 16); c.lineWidth = 4; c.strokeStyle = '#C9C2AE'; c.stroke();
    for (const sy of [-60, 60]) { circle(c, 0, sy, 6, '#B9B2A0'); line(c, -4, sy, 4, sy, 2, '#8E8878'); }
    rrect(c, -22, -40, 44, 80, 10); c.fillStyle = '#D9D3C2'; c.fill();
    // the toggle: up (ON) -> down (OFF)
    const a = lerp(-1, 1, clamp(off));
    rrect(c, -16, -6 + a * 18 - 14, 32, 40, 9); c.fillStyle = '#FFFFFF'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#B9B2A0'; c.stroke();
    c.font = '900 17px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = off > 0.5 ? '#E8293C' : '#2A9D5A'; c.fillText(off > 0.5 ? 'OFF' : 'ON', 0, off > 0.5 ? -54 : 54);
    c.fillStyle = '#3A3A48'; c.font = '900 22px Montserrat'; c.fillText('SUN', 0, -100);
    rrect(c, -34, -116, 68, 32, 8); c.lineWidth = 3; c.strokeStyle = '#F2EEE2'; c.stroke();
  });
  c.restore();
}

// ---------------------------------------------------------------- the POP: k = seconds since it went (any canvas)
function svPop(x, y, R, k) {
  if (k < 0 || k > 0.9) return;
  const u = k / 0.9;
  const fl = 1 - clamp(k / 0.18);
  if (fl > 0) { softDot(gctx, x, y, R * (1.6 + 1.6 * (1 - fl)), '#FFFFFF', fl); circle(ctx, x, y, R * 0.5 * fl, '#FFFFFF'); }
  paint(() => {
    ctx.beginPath(); ctx.arc(x, y, R * (0.6 + 1.8 * E.outCubic(u)), 0, 7); ctx.lineWidth = R * 0.1 * (1 - u); ctx.strokeStyle = `rgba(255,236,170,${1 - u})`; ctx.stroke();
    const rng = mulberry32(31);
    for (let i = 0; i < 12; i++) {                                    // sparkles flying out
      const a = rng() * 6.28, d = R * (0.8 + 1.6 * E.outCubic(u) * (0.6 + 0.6 * rng())), sz = R * 0.09 * (1 - u);
      const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d;
      ctx.fillStyle = `rgba(255,224,130,${1 - u})`;
      ctx.beginPath(); ctx.moveTo(px, py - sz * 2); ctx.lineTo(px + sz * 0.6, py); ctx.lineTo(px, py + sz * 2); ctx.lineTo(px - sz * 0.6, py); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(px - sz * 2, py); ctx.lineTo(px, py + sz * 0.6); ctx.lineTo(px + sz * 2, py); ctx.lineTo(px, py - sz * 0.6); ctx.closePath(); ctx.fill();
    }
    for (let i = 0; i < 7; i++) {                                     // a little puff of smoke
      const a = i * 0.9 + 0.3, d = R * (0.2 + 0.7 * E.outCubic(u));
      circle(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d - R * 0.3 * u, R * (0.22 + 0.2 * u) * (1 - u * 0.8), `rgba(220,220,235,${0.55 * (1 - u)})`);
    }
  });
}

// ---------------------------------------------------------------- the chalk outline of the Sun: k draws it on; scrawl 0..1
function svOutline(x, y, R, k, t, o = {}) {
  if (k <= 0.01) return;
  paint(() => {
    ctx.save(); ctx.lineCap = 'round';
    const rng = mulberry32(o.seed || 5);
    for (let pass = 0; pass < 3; pass++) {                            // chalk: three rough strokes, dashed
      ctx.setLineDash([R * 0.16, R * 0.09]); ctx.lineDashOffset = pass * 7;
      ctx.beginPath();
      const n = 64, j = (rng() - 0.5) * 0.03;
      for (let i = 0; i <= n * k; i++) {
        const a = -Math.PI / 2 + (i / n) * Math.PI * 2 + j, rr = R * (1 + 0.025 * Math.sin(i * 1.7 + pass * 2));
        ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
      }
      ctx.lineWidth = R * (0.05 - pass * 0.012); ctx.strokeStyle = `rgba(245,246,255,${0.85 - pass * 0.22})`; ctx.stroke();
    }
    ctx.setLineDash([]);
    const sk = clamp(o.scrawl || 0);
    if (sk > 0.01) {
      ctx.translate(x + R * (o.sx === undefined ? 0 : o.sx), y + R * (o.sy === undefined ? 1.45 : o.sy)); ctx.rotate(-0.08);
      ctx.font = `italic 800 ${R * (o.fs || 0.3)}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const txt = 'SUN WAS HERE', n = Math.round(txt.length * sk);
      ctx.fillStyle = 'rgba(245,246,255,0.92)'; ctx.fillText(txt.slice(0, n), 0, 0);
    }
    ctx.restore();
  });
}

// ---------------------------------------------------------------- Earth at (x, y), radius R. o: {sun: angle (radians) of
// the direction toward the Sun on screen, lit 0..1 (0 = the Sun is gone: all night), rot (the disc's turn), lights 0..1}
function svEarth(x, y, R, t, o = {}) {
  const lit = o.lit === undefined ? 1 : o.lit, sa = o.sun === undefined ? -Math.PI / 2 : o.sun;
  softDot(gctx, x, y, R * 1.5, '#4F9DFF', 0.32 * lit + 0.06);
  softDot(ctx, x, y, R * 1.25, '#5FA8FF', 0.22 * lit + 0.05);
  circle(ctx, x, y, R, '#1D4E9A');                                     // opaque first (the light map knows its shape)
  paint(() => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0);
    const S = SV_EARTH_N;
    ctx.drawImage(SV_EARTH, -R, -R, 2 * R, 2 * R);
    ctx.restore();
    // the night side: away from the Sun (a soft terminator); with the Sun gone, all of it
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, R + 0.5, 0, 7); ctx.clip();
    const ux = Math.cos(sa), uy = Math.sin(sa);
    const nightA = lerp(1, 0, lit);
    if (lit > 0.001) {
      const g = ctx.createLinearGradient(x + ux * R, y + uy * R, x - ux * R, y - uy * R);
      g.addColorStop(0, 'rgba(6,10,30,0)'); g.addColorStop(0.44, 'rgba(6,10,30,0)'); g.addColorStop(0.56, `rgba(6,10,30,${0.86 * lit})`); g.addColorStop(1, `rgba(4,6,22,${0.92 * lit})`);
      ctx.fillStyle = g; ctx.fillRect(x - R - 2, y - R - 2, 2 * R + 4, 2 * R + 4);
    }
    if (nightA > 0.001) { ctx.fillStyle = `rgba(6,10,34,${0.74 * nightA})`; ctx.fillRect(x - R - 2, y - R - 2, 2 * R + 4, 2 * R + 4); }
    // city lights where it is dark
    const lk = o.lights === undefined ? 1 : o.lights;
    if (lk > 0.01) {
      ctx.save();
      if (lit > 0.001) {                                               // only on the night side
        ctx.beginPath(); const a0 = sa + Math.PI / 2 + 0.12, a1 = sa + Math.PI * 1.5 - 0.12;
        ctx.moveTo(x + Math.cos(a0) * R, y + Math.sin(a0) * R); ctx.arc(x, y, R + 1, a0, a1); ctx.closePath();
        ctx.lineTo(x + Math.cos(a1) * R, y + Math.sin(a1) * R); ctx.clip();
      }
      ctx.translate(x, y); ctx.rotate(o.rot || 0);
      ctx.globalAlpha = lk * (lit > 0.001 ? 0.9 : 1);
      ctx.drawImage(SV_LIGHTS, -R, -R, 2 * R, 2 * R);
      ctx.globalAlpha = 1;
      ctx.restore();
    }
    ctx.restore();
    // the thin blue rim of the air on the lit side
    if (lit > 0.01) { ctx.beginPath(); ctx.arc(x, y, R + 2, sa - 1.4, sa + 1.4); ctx.lineWidth = Math.max(2, R * 0.04); ctx.strokeStyle = `rgba(140,205,255,${0.85 * lit})`; ctx.stroke(); }
    else { ctx.beginPath(); ctx.arc(x, y, R + 1.5, 0, 7); ctx.lineWidth = Math.max(2.5, R * 0.05); ctx.strokeStyle = 'rgba(130,170,255,0.8)'; ctx.stroke(); }
  });
  if (svLkGlow(o) > 0.01) {                                             // the cities glow a little in the glow layer
    softDot(gctx, x, y, R * 1.35, '#5A7CFF', 0.3 * svLkGlow(o));
    gctx.save(); gctx.globalAlpha = 0.9 * svLkGlow(o); gctx.translate(x, y); gctx.rotate(o.rot || 0);
    gctx.drawImage(SV_LIGHTS, -R, -R, 2 * R, 2 * R); gctx.restore();
  }
}
function svLkGlow(o) { return (o.lit === undefined ? 1 : o.lit) < 0.5 ? (o.lights === undefined ? 1 : o.lights) : 0; }

// ---------------------------------------------------------------- the road of sunshine (world units under the camera)
// path: [[x, y], ...] from the Sun (index 0) to Earth; tail = 0..1 how far the dark end has come; t video time; v = the
// envelopes' speed (world units per second); o: {lastTag 0..1, landing: fn(i) for those that reach the end}
function svRoad(path, tail, t, v, o = {}) {
  const acc = polyLen(path), L = acc[acc.length - 1], tl = clamp(tail) * L;
  const side = (s, off) => { const p = polyAt(path, acc, s), n = [-Math.sin(p[2]), Math.cos(p[2])]; return [p[0] + n[0] * off, p[1] + n[1] * off]; };
  const strip = (s0, s1, w, col, c = ctx) => {
    if (s1 - s0 < 1) return;
    c.beginPath();
    for (let s = s0; s <= s1; s += 20) { const p = side(s, -w); c.lineTo(p[0], p[1]); }
    for (let s = s1; s >= s0; s -= 20) { const p = side(s, w); c.lineTo(p[0], p[1]); }
    c.closePath(); c.fillStyle = col; c.fill();
  };
  // the road bed: dark where the light has gone, lit (warm) where it still carries sunshine
  strip(0, L, 74, '#141A30');
  strip(tl, L, 74, '#3A2E1E');
  paint(() => {
    // the edges: glowing lines where lit, grey where dark
    for (const sd of [-1, 1]) {
      ctx.beginPath(); for (let s = 0; s <= tl; s += 20) { const p = side(s, sd * 70); ctx.lineTo(p[0], p[1]); } ctx.lineWidth = 6; ctx.strokeStyle = '#3A4260'; ctx.stroke();
      ctx.beginPath(); for (let s = tl; s <= L; s += 20) { const p = side(s, sd * 70); ctx.lineTo(p[0], p[1]); } ctx.lineWidth = 8; ctx.strokeStyle = '#FFD86A'; ctx.stroke();
    }
    // the centre line: dashes that run with the traffic where lit
    ctx.setLineDash([46, 40]); ctx.lineDashOffset = -(t * v) % 86;
    ctx.beginPath(); for (let s = tl; s <= L; s += 20) { const p = polyAt(path, acc, s); ctx.lineTo(p[0], p[1]); } ctx.lineWidth = 9; ctx.strokeStyle = '#FFF1B0'; ctx.stroke();
    ctx.lineDashOffset = 0; ctx.beginPath(); for (let s = 0; s <= tl; s += 20) { const p = polyAt(path, acc, s); ctx.lineTo(p[0], p[1]); } ctx.lineWidth = 7; ctx.strokeStyle = '#2A3048'; ctx.stroke();
    ctx.setLineDash([]);
  });
  // the glow of the lit stretch
  gctx.save(); gctx.lineCap = 'round'; gctx.beginPath(); for (let s = tl; s <= L; s += 30) { const p = polyAt(path, acc, s); gctx.lineTo(p[0], p[1]); }
  gctx.lineWidth = 150; gctx.strokeStyle = 'rgba(255,200,110,0.22)'; gctx.stroke(); gctx.restore();
  // the envelopes: one every 230 units, riding the road at the speed of light (this world's); none behind the tail
  const gap = 230, ph = (t * v) % gap;
  let last = null;
  for (let s = ph - gap; s <= L + gap; s += gap) {
    if (s < tl - 1 || s > L) continue;
    const p = polyAt(path, acc, s);
    const bob = 6 * Math.sin(s * 0.03 + t * 3);
    svEnvelope(ctx, p[0], p[1] + bob, 0.95, p[2] - Math.PI / 2 + 0.05 * Math.sin(s * 0.02), { trail: [0, -120] });
    svEnvelopeGlow(p[0], p[1] + bob, 0.95, 0.8);
    if (!last) last = [p[0], p[1] + bob, s];
  }
  // the tail: the last envelope, with a red flag LAST ONE
  if (o.lastTag > 0.01 && last) {
    const [lx, ly] = last;
    paint(() => {
      ctx.save(); ctx.translate(lx - 50, ly - 30); ctx.scale(2.1 * o.lastTag, 2.1 * o.lastTag);
      line(ctx, 0, 0, 0, -90, 5, '#E8E8F0');
      const f = 6 * Math.sin(t * 9);
      ctx.fillStyle = '#E8293C'; ctx.beginPath(); ctx.moveTo(2, -90); ctx.lineTo(118, -78 + f); ctx.lineTo(2, -50); ctx.closePath(); ctx.fill();
      ctx.font = '900 22px Montserrat'; ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText('LAST', 10, -75 + f / 2);
      ctx.restore();
    });
  }
  return { L, tl, last, acc };
}

// ---------------------------------------------------------------- a green road sign (world units)
function svSign(x, y, s, lines) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  line(ctx, -60, 0, -60, 160, 10, '#9AA0B0'); line(ctx, 60, 0, 60, 160, 10, '#9AA0B0');
  rrect(ctx, -170, -120, 340, 150, 14); ctx.fillStyle = '#16794A'; ctx.fill();
  paint(() => {
    rrect(ctx, -160, -110, 320, 130, 10); ctx.lineWidth = 4; ctx.strokeStyle = '#FFFFFF'; ctx.stroke();
    ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '900 40px Montserrat'; ctx.fillText(lines[0], 0, -78);
    ctx.font = '900 30px Montserrat'; ctx.fillText(lines[1], 0, -26);
  });
  ctx.restore();
}
