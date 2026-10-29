// What If the Sun VANISHED Right Now? ☀️ — the beach at noon (and the same beach with the Sun gone).
// World units: the hero is ~560 tall standing (1 m ~ 320); his deck chair stands on the sand at SB.hero. The sea's
// horizon is at y = SB.hz; far things (the sky, the Sun, clouds, the headland) sit on it with a small parallax (svFar).
// Everything that catches the light (sand, umbrella, chair, props) is drawn with shapes every frame; the sky, the far
// headland and the sea's surface are flat paint. N = 0 day, 1 night (no Sun: navy sky, stars, black sea); the switch
// between them is a hard cut in the story, so nothing in between is drawn on purpose.
// Ambient motion (waves, foam, glints, clouds) runs on loopW() so the last frame matches the first.
'use strict';

// the horizon is at his eye level (a camera at the height of a man in a low chair), the sea a band below it
const SB = { hz: 1418, shore: 1500, hero: [560, 1712], sun: [900, 330] };
const SB_DAY = { top: '#2A78D2', mid: '#62A9EC', hz: '#CFEFFF', haze: '#EAF8FF', sea0: '#2D7FB9', sea1: '#2FA3C4',
  sea2: '#45C8CB', shallow: '#86E2D6', foam: '#FFFFFF', wet: '#CFAE7E', sand: '#F3D9A2', sand2: '#E9C88C', sandDk: '#D6AF72',
  head: '#6F9DB0', head2: '#8AB4C2', cloud: '#FFFFFF', cloudSh: '#C6DDF2' };
const SB_NIGHT = { top: '#03050F', mid: '#060B1E', hz: '#0E1A3A', haze: '#14244A', sea0: '#050A1C', sea1: '#071026',
  sea2: '#0A1530', shallow: '#0F1C3A', foam: '#4F5F86', wet: '#1E2440', sand: '#2E3452', sand2: '#283050', sandDk: '#20263F',
  head: '#0A1128', head2: '#0D1530', cloud: '#141C36', cloudSh: '#0C1228' };
const svPal = (N) => { const o = {}; for (const k of Object.keys(SB_DAY)) o[k] = mixH(SB_DAY[k], SB_NIGHT[k], N); return o; };

let SB_CLOUDS = [], SB_SPECK = [], SB_SHELLS = [], SB_GLINT = [], SB_STARS = [], SB_WAVES = [], SB_PRINTS = [];
function initBeach() {
  const r = mulberry32(8201);
  SB_CLOUDS = [[-320, 40, 300, 11], [180, 10, 210, 12], [700, 60, 340, 13], [1180, 25, 260, 14], [1620, 50, 300, 15]];
  SB_SPECK = [];
  for (let i = 0; i < 900; i++) {
    const y = lerp(SB.shore + 40, 2300, Math.pow(r(), 0.85));
    SB_SPECK.push([r() * 2600 - 760, y, 1.2 + 2.6 * r() * inv(SB.shore, 2300, y) * 1.6, r() < 0.5 ? 0 : 1]);
  }
  SB_SHELLS = [[150, 1830, 1], [985, 1780, 0], [700, 1905, 1], [-60, 1700, 0], [1260, 1650, 1], [420, 1600, 0]];
  SB_GLINT = [];
  for (let i = 0; i < 160; i++) SB_GLINT.push([r(), Math.pow(r(), 1.6), r() * 6.28, 0.6 + r() * 1.6]);
  SB_STARS = [];
  for (let i = 0; i < 420; i++) SB_STARS.push([r() * 1400 - 160, r() * 1700 - 200, 0.6 + 2.2 * Math.pow(r(), 3), r() * 6.28, 0.7 + r() * 1.5]);
  SB_WAVES = [];
  for (let i = 0; i < 70; i++) SB_WAVES.push([r() * 3000 - 900, Math.pow(r(), 1.5), 60 + r() * 220, r() * 6.28]);
  SB_PRINTS = [];
  for (let i = 0; i < 9; i++) { const u = i / 8; SB_PRINTS.push([lerp(1240, 760, u) + (i % 2 ? 18 : -18), lerp(1560, 1760, u * u), i % 2]); }
}

// a far point (x, h above the horizon) on screen for parallax p (0 = fixed to the screen, 1 = the main plane)
function svFar(cam, x, h, p) {
  const hz = toScreen(cam, cam.x, SB.hz)[1], zf = 1 + (cam.zoom - 1) * p * 0.55;
  return [540 + (x - 540 - (cam.x - 540) * p) * zf, hz - h * zf, zf];
}
// where the Sun is on screen for this camera (and how big)
function svSunScreen(cam) { const [x, y, zf] = svFar(cam, SB.sun[0], SB.sun[1], 0.06); return [x, y, 64 * Math.sqrt(zf)]; }

// ---------------------------------------------------------------- the sky, the Sun, clouds, the headland (flat paint)
function svSky(cam, t, N, o = {}) {
  const P = svPal(N);
  screenSpace();
  const hz = toScreen(cam, cam.x, SB.hz)[1];
  const g = ctx.createLinearGradient(0, hz - 1500, 0, hz + 2);
  g.addColorStop(0, P.top); g.addColorStop(0.55, P.mid); g.addColorStop(0.9, P.hz); g.addColorStop(1, P.haze);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, Math.max(0, hz + 4));
  if (N > 0.5) {                                                    // night: stars (they twinkle on loop clocks)
    paint(() => {
      for (const [sx, sy, rr, ph, w] of SB_STARS) {
        const x = 540 + (sx - 540 - (cam.x - 540) * 0.04), y = hz - 40 - (sy + 200) * Math.max(0.3, hz / 1500);
        if (y > hz - 6 || y < -10) continue;
        const a = 0.55 + 0.45 * Math.sin(t * loopW(w) + ph);
        circle(ctx, x, y, rr, `rgba(235,240,255,${0.35 + 0.6 * a})`);
        if (rr > 1.8) softDot(gctx, x, y, rr * 5, '#DDE6FF', 0.35 * a);
      }
    });
    const mw = ctx.createLinearGradient(0, hz - 900, W, hz - 300);    // a faint band of the Milky Way
    mw.addColorStop(0, 'rgba(120,130,200,0)'); mw.addColorStop(0.5, 'rgba(120,130,200,0.10)'); mw.addColorStop(1, 'rgba(120,130,200,0)');
    ctx.fillStyle = mw; ctx.fillRect(0, 0, W, Math.max(0, hz));
  }
  // the Sun (noon: high on the right); o.sun = 0 hides it
  const sunK = N > 0.5 ? 0 : (o.sun === undefined ? 1 : o.sun);
  if (sunK > 0.01) {
    const [sx, sy, R] = svSunScreen(cam);
    softDot(ctx, sx, sy, R * 4.2, '#FFF3CC', 0.32 * sunK);
    softDot(ctx, sx, sy, R * 1.8, '#FFFBEA', 0.55 * sunK);
    circle(ctx, sx, sy, R * sunK, '#FFFCEB');
    softDot(gctx, sx, sy, R * 1.9, '#FFE9A8', 0.42 * sunK);
    circle(gctx, sx, sy, R * 0.9 * sunK, '#FFF6D8');
    if (o.rays !== false) sunRays(sx, sy, 0.32 * sunK);
  }
  // gulls far off, gliding across (day only; they loop)
  if (N < 0.5) {
    paint(() => {
      for (const [x0, h, sc, ph] of [[-200, 360, 1.0, 0], [500, 300, 0.75, 2.1], [1300, 420, 0.9, 4.2]]) {
        const span = 1900, x = ((x0 + (t * loopW(0.05) / (Math.PI * 2)) * span) % span + span) % span - 400;
        const [gx, gy, z] = svFar(cam, x, h + 20 * Math.sin(t * 0.7 + ph), 0.1);
        const fl = Math.sin(t * loopW(5.5) + ph), s2 = 16 * sc * z;
        ctx.strokeStyle = 'rgba(40,50,80,0.75)'; ctx.lineWidth = 3.2 * sc; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(gx - s2 * 1.6, gy - s2 * 0.5 * fl); ctx.quadraticCurveTo(gx - s2 * 0.7, gy - s2 * (0.2 + 0.5 * fl), gx, gy + s2 * 0.15);
        ctx.quadraticCurveTo(gx + s2 * 0.7, gy - s2 * (0.2 + 0.5 * fl), gx + s2 * 1.6, gy - s2 * 0.5 * fl); ctx.stroke();
      }
    });
  }
  // clouds: soft cumulus heaps along the horizon, drifting right
  for (const [x0, h, w, seed] of SB_CLOUDS) {
    const drift = (t * loopW(0.012) / (Math.PI * 2)) * 2600;
    const xx = ((x0 + drift + 1200) % 2600 + 2600) % 2600 - 1200;
    const [cx, cy, z] = svFar(cam, xx, 60 + h, 0.12);
    svCloud(cx, cy, w * z, seed, P);
  }
  // the far headland on the left, with a little lighthouse
  {
    const pts = [];
    for (let i = 0; i <= 24; i++) {
      const u = i / 24, x = lerp(-700, 330, u), hh = 170 * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.15)), 0.7) + 14 * Math.sin(u * 19);
      pts.push(svFar(cam, x, Math.max(0, hh), 0.18));
    }
    ctx.fillStyle = P.head; ctx.beginPath(); ctx.moveTo(pts[0][0], hz + 2);
    for (const p of pts) ctx.lineTo(p[0], p[1]);
    ctx.lineTo(pts[pts.length - 1][0], hz + 2); ctx.closePath(); ctx.fill();
    const [lx, ly, lz] = svFar(cam, 60, 178, 0.18);
    paint(() => {
      ctx.fillStyle = mixH('#F4F6FA', P.head, 0.25 + 0.7 * N); ctx.fillRect(lx - 7 * lz, ly - 54 * lz, 14 * lz, 54 * lz);
      ctx.fillStyle = mixH('#E0484E', P.head, 0.3 + 0.6 * N); ctx.fillRect(lx - 7 * lz, ly - 40 * lz, 14 * lz, 9 * lz); ctx.fillRect(lx - 7 * lz, ly - 20 * lz, 14 * lz, 9 * lz);
      if (N > 0.5) { const bl = 0.5 + 0.5 * Math.sin(t * loopW(2.2)); softDot(gctx, lx, ly - 58 * lz, 30 * lz, '#FFE6A0', 0.8 * bl); circle(ctx, lx, ly - 58 * lz, 4 * lz, '#FFF1C0'); }
    });
  }
}
function svCloud(cx, cy, w, seed, P) {
  const r = mulberry32(seed);
  const puffs = [];
  for (let i = 0; i < 9; i++) { const u = i / 8; puffs.push([cx + (u - 0.5) * w, cy - Math.sin(Math.PI * u) * w * (0.18 + 0.12 * r()), w * (0.13 + 0.12 * Math.sin(Math.PI * u) + 0.05 * r())]); }
  ctx.fillStyle = P.cloudSh;
  for (const [x, y, rr] of puffs) { ctx.beginPath(); ctx.arc(x, y + rr * 0.25, rr, 0, 7); ctx.fill(); }
  ctx.fillStyle = P.cloud;
  for (const [x, y, rr] of puffs) { ctx.beginPath(); ctx.arc(x - rr * 0.1, y - rr * 0.08, rr * 0.92, 0, 7); ctx.fill(); }
  ctx.fillStyle = P.cloudSh; ctx.fillRect(cx - w * 0.55, cy + w * 0.02, w * 1.1, w * 0.06);
}

// ---------------------------------------------------------------- the sea: flat paint from the horizon to the shore
function svSea(cam, t, N) {
  const P = svPal(N);
  applyCam(cam);
  const hz = SB.hz, sh = SB.shore;
  const g = ctx.createLinearGradient(0, hz, 0, sh);
  g.addColorStop(0, P.sea0); g.addColorStop(0.45, P.sea1); g.addColorStop(0.82, P.sea2); g.addColorStop(1, P.shallow);
  ctx.fillStyle = g; ctx.fillRect(cam.x - 3000, hz, 6000, sh - hz + 40);
  paint(() => {
    // swell lines coming in (perspective: closer together near the horizon)
    for (const [x0, d0, len, ph] of SB_WAVES) {
      const d = (d0 + t * loopW(0.05) / (Math.PI * 2)) % 1;
      const y = hz + (sh - hz) * Math.pow(d, 1.7);
      const w = len * (0.3 + 1.2 * d);
      ctx.strokeStyle = rgba(N > 0.5 ? '#3A4A78' : '#D8F6FF', (0.18 + 0.3 * d) * (N > 0.5 ? 0.6 : 1));
      ctx.lineWidth = 1.5 + 3 * d; ctx.beginPath();
      for (let i = 0; i <= 8; i++) { const u = i / 8; ctx.lineTo(x0 + (u - 0.5) * w, y + 3 * d * Math.sin(u * 6 + ph)); }
      ctx.stroke();
    }
    // the Sun's glitter: a column of sparks under it (day only)
    if (N < 0.5) {
      const ssx = svSunScreen(cam)[0], wx = cam.x + (ssx - 540) / cam.zoom;
      for (const [u, v, ph, w] of SB_GLINT) {
        const y = hz + (sh - hz) * v * 0.9, sp = 30 + 260 * v;
        const x = wx + (u - 0.5) * sp * 2 * (0.4 + v);
        const a = Math.max(0, Math.sin(t * loopW(2 * w) + ph));
        if (a < 0.35) continue;
        const s = (1.5 + 5 * v) * a;
        ctx.fillStyle = `rgba(255,255,245,${0.85 * a})`; ctx.fillRect(x - s * 2, y - s * 0.3, s * 4, s * 0.6);
        softDot(gctx, x, y, s * 4, '#FFFFFF', 0.5 * a);
      }
    } else {                                                          // night: a few star glints on the black water
      for (const [u, v, ph, w] of SB_GLINT.slice(0, 50)) {
        const y = hz + (sh - hz) * v, x = cam.x + (u - 0.5) * 1800;
        const a = Math.max(0, Math.sin(t * loopW(w) + ph));
        if (a > 0.6) { ctx.fillStyle = `rgba(200,210,255,${0.35 * a})`; ctx.fillRect(x - 3, y - 0.6, 6, 1.2); }
      }
    }
  });
}
// the edge of the sea on the sand: the wash that breathes in and out, the foam line, wet sand
function svShore(cam, t, N) {
  const P = svPal(N);
  applyCam(cam);
  const sh = SB.shore, br = 0.5 + 0.5 * Math.sin(t * loopW(0.9));
  const edge = (x, k) => sh + 26 + 34 * k + 10 * Math.sin(x * 0.006 + t * loopW(0.5)) + 6 * Math.sin(x * 0.017 + 1.3);
  // wet sand
  ctx.fillStyle = P.wet;
  ctx.beginPath(); ctx.moveTo(cam.x - 3000, sh - 10);
  for (let x = cam.x - 3000; x <= cam.x + 3000; x += 40) ctx.lineTo(x, edge(x, 1) + 40);
  ctx.lineTo(cam.x + 3000, sh - 10); ctx.closePath(); ctx.fill();
  // the thin sheet of water running up the sand
  ctx.fillStyle = mixH(P.shallow, P.wet, 0.35);
  ctx.beginPath(); ctx.moveTo(cam.x - 3000, sh - 4);
  for (let x = cam.x - 3000; x <= cam.x + 3000; x += 40) ctx.lineTo(x, edge(x, br));
  ctx.lineTo(cam.x + 3000, sh - 4); ctx.closePath(); ctx.fill();
  paint(() => {
    // the foam line at its edge, and a broken line of foam further out
    for (const [yo, k, wd, a] of [[0, br, 7, 0.95], [-30, 0.4 + 0.6 * (1 - br), 5, 0.7]]) {
      ctx.strokeStyle = rgba(P.foam, a); ctx.lineWidth = wd; ctx.lineCap = 'round'; ctx.setLineDash(yo ? [60, 26, 18, 30] : []);
      ctx.beginPath();
      for (let x = cam.x - 3000; x <= cam.x + 3000; x += 30) ctx.lineTo(x, edge(x, k) + yo);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  });
}
// the dry sand, its speckles, shells and the footprints up to his chair
function svSand(cam, t, N) {
  const P = svPal(N);
  applyCam(cam);
  const top = SB.shore + 40;
  const g = ctx.createLinearGradient(0, top, 0, 2300);
  g.addColorStop(0, P.sand2); g.addColorStop(0.3, P.sand); g.addColorStop(1, P.sand2);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(cam.x - 3000, 2600);
  for (let x = cam.x - 3000; x <= cam.x + 3000; x += 60) ctx.lineTo(x, top + 30 + 12 * Math.sin(x * 0.004 + 0.7));
  ctx.lineTo(cam.x + 3000, 2600); ctx.closePath(); ctx.fill();
  paint(() => {
    for (const [x, y, rr, k] of SB_SPECK) {
      if (Math.abs(x - cam.x) > 640 / cam.zoom + 40) continue;
      ctx.fillStyle = k ? rgba(P.sandDk, 0.55) : rgba('#FFFFFF', N > 0.5 ? 0.06 : 0.45);
      ctx.fillRect(x, y, rr, rr * 0.6);
    }
    for (const [x, y, d] of SB_PRINTS) { ellipse(ctx, x, y, 13, 7, rgba(P.sandDk, 0.55), 0.2); ellipse(ctx, x + (d ? 8 : -8), y - 12, 7, 5, rgba(P.sandDk, 0.5)); }
    for (const [x, y, k] of SB_SHELLS) {
      if (k) { ctx.fillStyle = mixH('#FFE3D2', P.sand, N * 0.8); ctx.beginPath(); ctx.arc(x, y, 13, Math.PI, 0); ctx.closePath(); ctx.fill(); for (let i = -2; i <= 2; i++) line(ctx, x, y, x + i * 5, y - 11, 1.5, rgba('#D99A86', 0.8 * (1 - N))); }
      else { ellipse(ctx, x, y, 12, 6, mixH('#FFF4EC', P.sand, N * 0.8), 0.4); }
    }
  });
}

// ---------------------------------------------------------------- props on the sand (world units; they catch the light)
// the beach umbrella: pole foot at (x, y), canopy up top, red-and-white panels; its shadow on the sand
function svUmbrella(x, y, t, N) {
  ellipse(ctx, x + 150, y + 8, 250, 36, rgba(N > 0.5 ? '#000000' : '#9A7A48', 0.28));
  const top = [x - 20, y - 470];
  line(ctx, x, y, top[0], top[1], 11, mixH('#EDEDED', '#3A4058', N));
  const sway = 0.015 * Math.sin(t * loopW(0.8));
  ctx.save(); ctx.translate(top[0], top[1]); ctx.rotate(-0.12 + sway);
  const R = 290, Hd = 120, n = 8;
  // the canopy seen from the side and a little below: a dome, panels in turn, a scalloped hem
  for (let i = 0; i < n; i++) {
    const u0 = i / n, u1 = (i + 1) / n;
    const x0 = (u0 - 0.5) * 2 * R, x1 = (u1 - 0.5) * 2 * R;
    const yh = (u) => 18 + 10 * Math.sin(Math.PI * u);                 // the hem
    const yd = (xx) => -Hd * Math.sqrt(Math.max(0, 1 - (xx / R) * (xx / R))) + 20;   // the dome
    ctx.beginPath(); ctx.moveTo(0, -Hd + 6);
    for (let k = 0; k <= 6; k++) { const xx = lerp(x0, x1, k / 6); ctx.lineTo(xx, yd(xx)); }
    ctx.lineTo(x1, yh(u1)); ctx.quadraticCurveTo((x0 + x1) / 2, yh((u0 + u1) / 2) + 26, x0, yh(u0)); ctx.closePath();
    ctx.fillStyle = i % 2 ? mixH('#FFFFFF', '#2A3050', N) : mixH('#F0424C', '#3A1E2E', N);
    ctx.fill();
  }
  circle(ctx, 0, -Hd + 4, 10, mixH('#FFFFFF', '#3A4058', N));
  ctx.restore();
}
// the striped deck chair: the frame and the sling behind him (svChairBack), the front rail and legs (svChairFront)
function svChairBack(x, y, s, N) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const wood = mixH('#B9773E', '#2E2A36', N), wood2 = mixH('#8E5428', '#221F2A', N);
  for (const sd of [-1, 1]) line(ctx, sd * 150, 4, sd * 130, -408, 18, wood2);
  line(ctx, -148, -400, 148, -400, 16, wood);
  // the sling: wide stripes, a sag in the middle
  ctx.beginPath(); ctx.moveTo(-134, -394); ctx.lineTo(134, -394); ctx.quadraticCurveTo(152, -190, 136, -40); ctx.lineTo(-136, -40); ctx.quadraticCurveTo(-152, -190, -134, -394); ctx.closePath();
  ctx.fillStyle = mixH('#FFFFFF', '#2A2E46', N); ctx.fill();
  paint(() => {
    ctx.save(); ctx.clip();
    const cols = ['#1CB3A4', '#FFFFFF', '#FF7A4E', '#FFFFFF', '#FFC23A', '#FFFFFF', '#1CB3A4'];
    for (let i = 0; i < 7; i++) { ctx.fillStyle = mixH(cols[i], '#262A44', N * 0.9); ctx.fillRect(-160 + i * 46, -410, 46, 400); }
    ctx.restore();
  });
  ctx.restore();
}
function svChairFront(x, y, s, N) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const wood = mixH('#C4834A', '#2E2A36', N), wood2 = mixH('#9A5E2E', '#221F2A', N);
  for (const sd of [-1, 1]) { line(ctx, sd * 168, 30, sd * 150, -110, 18, wood2); line(ctx, sd * 172, -96, sd * 118, -104, 14, wood); }
  line(ctx, -170, -20, 170, -20, 14, wood);
  ctx.restore();
}
// a striped beach towel lying on the sand (flat, in perspective)
function svTowel(x, y, N) {
  ctx.save(); ctx.translate(x, y);
  const pts = [[-150, -30], [130, -40], [170, 40], [-120, 52]];
  ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
  ctx.fillStyle = mixH('#FFD447', '#2A3050', N); ctx.fill();
  paint(() => {
    ctx.save(); ctx.clip();
    for (let i = 0; i < 6; i++) { if (i % 2) continue; const a = lerp(-150, 130, i / 6), b = lerp(-150, 130, (i + 1) / 6); ctx.fillStyle = mixH('#2F7FD6', '#1A2240', N); ctx.beginPath(); ctx.moveTo(a, -60); ctx.lineTo(b, -60); ctx.lineTo(b + 50, 70); ctx.lineTo(a + 50, 70); ctx.closePath(); ctx.fill(); }
    ctx.restore();
  });
  ctx.restore();
}
// a cooler box with a lid; a beach ball; a sandcastle with a flag; a bucket and spade
function svCooler(x, y, s, N) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ellipse(ctx, 10, 6, 110, 18, rgba(N > 0.5 ? '#000000' : '#9A7A48', 0.3));
  rrect(ctx, -96, -120, 192, 124, 14); ctx.fillStyle = mixH('#2F7FD6', '#1A2240', N); ctx.fill();
  rrect(ctx, -104, -146, 208, 36, 12); ctx.fillStyle = mixH('#FFFFFF', '#2E3452', N); ctx.fill();
  rrect(ctx, -40, -164, 80, 20, 8); ctx.fillStyle = mixH('#E8ECF4', '#262C48', N); ctx.fill();
  ctx.restore();
}
function svBall(x, y, r, rot, N) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const cols = ['#F0424C', '#FFFFFF', '#FFC23A', '#FFFFFF', '#2F7FD6', '#FFFFFF'];
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, (i / 6) * 6.283, ((i + 1) / 6) * 6.283); ctx.closePath(); ctx.fillStyle = mixH(cols[i], '#2A3050', N * 0.85); ctx.fill(); }
  circle(ctx, 0, 0, r * 0.16, mixH('#FFFFFF', '#3A4058', N));
  ctx.restore();
}
function svCastle(x, y, s, t, N) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const sa = mixH('#E3BE80', '#2A3050', N), sa2 = mixH('#CFA764', '#222842', N);
  ctx.fillStyle = sa2; ctx.beginPath(); ctx.ellipse(0, 0, 120, 22, 0, 0, 7); ctx.fill();
  ctx.fillStyle = sa;
  ctx.fillRect(-90, -70, 180, 70);
  for (const tx of [-80, 80]) { ctx.fillRect(tx - 26, -130, 52, 130); for (let k = -1; k <= 1; k++) ctx.fillRect(tx + k * 18 - 7, -146, 14, 18); }
  ctx.fillRect(-34, -150, 68, 150); for (let k = -1; k <= 1; k++) ctx.fillRect(k * 22 - 8, -168, 16, 20);
  ctx.fillStyle = sa2; ctx.beginPath(); ctx.arc(0, -10, 18, Math.PI, 0); ctx.fill();
  line(ctx, 0, -168, 0, -240, 4, mixH('#F4F0E6', '#3A4058', N));
  const fl = Math.sin(t * loopW(5)) * 6;
  ctx.fillStyle = mixH('#F0424C', '#3A1E2E', N); ctx.beginPath(); ctx.moveTo(2, -240); ctx.lineTo(56, -228 + fl); ctx.lineTo(2, -212); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function svBucket(x, y, s, N) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = mixH('#FFC23A', '#2A3050', N); ctx.beginPath(); ctx.moveTo(-50, -90); ctx.lineTo(50, -90); ctx.lineTo(38, 0); ctx.lineTo(-38, 0); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, -90, 50, 12, 0, 0, 7); ctx.fillStyle = mixH('#E09A16', '#222842', N); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -90, 52, Math.PI * 1.05, Math.PI * 1.95); ctx.lineWidth = 5; ctx.strokeStyle = mixH('#3A3A48', '#151A2E', N); ctx.stroke();
  line(ctx, 70, -10, 120, -150, 9, mixH('#2F7FD6', '#1A2240', N));
  ctx.fillStyle = mixH('#2F7FD6', '#1A2240', N); ctx.beginPath(); ctx.ellipse(66, 2, 22, 30, 0.35, 0, 7); ctx.fill();
  ctx.restore();
}

// ---------------------------------------------------------------- the whole beach behind him (everything up to his chair)
// o: {N (night 0..1), sun (0..1), props}
function svBeachBack(cam, t, o = {}) {
  const N = o.N || 0;
  svSky(cam, t, N, o);
  svSea(cam, t, N);
  svShore(cam, t, N);
  svSand(cam, t, N);
  applyCam(cam);
  if (o.props !== false) {
    svCastle(850, 1548, 0.42, t, N);
    svUmbrella(282, 1640, t, N);
    svTowel(790, 1690, N);
    svBall(250, 1820, 44, 0.4, N);
  }
  svChairBack(SB.hero[0], SB.hero[1], 1.0, N);
}
// in front of him: the chair's front rail and legs, the cooler, a bucket and spade in the corner
function svBeachFront(cam, t, o = {}) {
  const N = o.N || 0;
  applyCam(cam);
  svChairFront(SB.hero[0], SB.hero[1], 1.0, N);
  if (o.props !== false) {
    svCooler(820, 1830, 0.9, N);
    svBucket(300, 1960, 0.85, N);
  }
}
