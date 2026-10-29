// Why Do Wombats Poop CUBES? 🟫 — the Tasmanian bush at golden hour (world coords, 1080x1920 at zoom 1).
// A low sun on the right; far blue mountains with a twin-peaked crag, forested ridges, tall gum trees with pale peeling
// trunks, golden buttongrass; the big mossy log he sits in front of (hook, button); a flat-topped sandstone boulder over a
// creek (the payoff). The sky, the mountains, the ridges, the gums and the meadow are cached plates drawn with parallax
// (and out-of-focus copies for close-ups); the log, the rock, the creek's surface, the tussocks in front and everything
// he or the wombat touches are drawn with shapes every frame, so the light stage lights them.
'use strict';

const WBB = { gy: 1490, logY: 1395, logR: 95, logX0: 60, logX1: 1240, heroX: 470, heroY: 1560, sunX: 930, sunY: 600,
  rockX: 690, rockTop: 1150, rockW: 540, rockBot: 1560, creekY: 1600 };
const WBB_FAR = { x: -600, y: 520, w: 2280, h: 900 };      // mountains + ridges plate
const WBB_GUM = { x: -700, y: 120, w: 2480, h: 1500 };     // the gum trees plate
const WBB_MDW = { x: -700, y: 1320, w: 2480, h: 700 };     // the meadow plate
let WBB_SKY = null, WBB_FARC = null, WBB_GUMC = null, WBB_MDWC = null;
const WBB_SOFT = new Map();
function wbSoft(img, px, dim = 0.9) {
  const key = img;
  if (WBB_SOFT.has(key) && WBB_SOFT.get(key).px === px) return WBB_SOFT.get(key).c;
  const c = mkCanvas(img.width, img.height), x = c.getContext('2d');
  x.filter = `blur(${px}px) brightness(${dim})`; x.drawImage(img, 0, 0); x.filter = 'none';
  WBB_SOFT.set(key, { c, px }); return c;
}
function wbPlate(r, s = 1) {
  const c = mkCanvas(Math.round(r.w * s), Math.round(r.h * s)), x = c.getContext('2d');
  x.scale(s, s); x.translate(-r.x, -r.y); return [c, x];
}

function initBush() {
  // ---- the sky (screen space): warm gold low on the right where the sun sits, soft blue-violet overhead
  {
    const c = mkCanvas(W, H), x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0.0, '#4B5C9C'); g.addColorStop(0.2, '#7C7FB6'); g.addColorStop(0.38, '#C59AAE');
    g.addColorStop(0.5, '#F2B98E'); g.addColorStop(0.62, '#FFD49A'); g.addColorStop(1, '#FFE3B0');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    const gl = x.createRadialGradient(W * 0.86, H * 0.31, 10, W * 0.86, H * 0.31, H * 0.55);
    gl.addColorStop(0, 'rgba(255,236,180,0.85)'); gl.addColorStop(0.35, 'rgba(255,200,140,0.35)'); gl.addColorStop(1, 'rgba(255,170,120,0)');
    x.fillStyle = gl; x.fillRect(0, 0, W, H);
    const rng = mulberry32(31);
    for (let i = 0; i < 9; i++) {                       // long soft clouds lit gold from below
      const cy = H * (0.12 + 0.035 * i) + rng() * 40, cx = rng() * W, len = 260 + rng() * 480;
      const cg = x.createLinearGradient(cx - len / 2, 0, cx + len / 2, 0);
      cg.addColorStop(0, 'rgba(255,210,180,0)'); cg.addColorStop(0.5, `rgba(255,${196 + i * 5},${168 + i * 4},${0.18 + 0.04 * i})`); cg.addColorStop(1, 'rgba(255,210,180,0)');
      x.fillStyle = cg; x.beginPath(); x.ellipse(cx, cy, len / 2, 9 + rng() * 10, 0, 0, 7); x.fill();
    }
    WBB_SKY = c;
  }
  // ---- far mountains (a twin-peaked crag, dolerite columns) and two forested ridges, hazy blue-violet
  {
    const [c, x] = wbPlate(WBB_FAR, 1);
    const R = WBB_FAR;
    const crag = [[-600, 1180], [-420, 1010], [-240, 960], [-60, 900], [80, 820], [150, 760], [205, 700], [240, 655], [262, 690],
      [300, 640], [330, 610], [356, 655], [380, 700], [430, 760], [520, 840], [640, 900], [760, 870], [860, 820], [960, 860],
      [1100, 930], [1300, 980], [1500, 1040], [1680, 1100], [1680, 1420], [-600, 1420]];
    x.beginPath(); x.moveTo(crag[0][0], crag[0][1]); for (const p of crag) x.lineTo(p[0], p[1]); x.closePath();
    const mg = x.createLinearGradient(0, 600, 0, 1300); mg.addColorStop(0, '#8E86B4'); mg.addColorStop(1, '#A795B2');
    x.fillStyle = mg; x.fill();
    // lit faces (right of each spine) warmed by the low sun, the columns as faint vertical streaks
    x.save(); x.beginPath(); x.moveTo(crag[0][0], crag[0][1]); for (const p of crag) x.lineTo(p[0], p[1]); x.closePath(); x.clip();
    for (const [px, py, w] of [[240, 655, 160], [330, 610, 190], [760, 870, 220]]) {
      const lg = x.createLinearGradient(px, py, px + w, py + 300);
      lg.addColorStop(0, 'rgba(255,196,160,0.55)'); lg.addColorStop(1, 'rgba(255,196,160,0)');
      x.fillStyle = lg; x.beginPath(); x.moveTo(px, py); x.lineTo(px + w, py + 340); x.lineTo(px + 10, py + 420); x.closePath(); x.fill();
    }
    const rng = mulberry32(12);
    for (let i = 0; i < 90; i++) {
      const sx = 150 + rng() * 300, sy = 640 + rng() * 160;
      x.strokeStyle = `rgba(90,80,130,${0.15 + 0.2 * rng()})`; x.lineWidth = 2 + rng() * 2;
      x.beginPath(); x.moveTo(sx, sy); x.lineTo(sx + (rng() - 0.5) * 6, sy + 60 + rng() * 120); x.stroke();
    }
    x.restore();
    // forested ridges: bumpy eucalypt crowns along the edge
    const ridge = (y0, amp, col, seed, bump) => {
      x.beginPath(); x.moveTo(R.x, R.y + R.h);
      for (let px = R.x; px <= R.x + R.w; px += 6) {
        let y = y0 + amp * (0.6 * Math.sin(px / 310 + seed) + 0.4 * vnoise(px / 110, seed));
        y -= bump * Math.abs(Math.sin(px / 17 + seed)) * (0.5 + 0.5 * vnoise(px / 37, seed + 4));
        x.lineTo(px, y);
      }
      x.lineTo(R.x + R.w, R.y + R.h); x.closePath(); x.fillStyle = col; x.fill();
    };
    ridge(1150, 50, '#7E7AA4', 1.2, 8);
    const hz = x.createLinearGradient(0, 1080, 0, 1260); hz.addColorStop(0, 'rgba(255,210,180,0)'); hz.addColorStop(1, 'rgba(255,214,186,0.35)');
    x.fillStyle = hz; x.fillRect(R.x, 1080, R.w, 180);
    ridge(1250, 40, '#5E6A88', 3.4, 14);
    ridge(1330, 34, '#46546E', 6.1, 18);
    WBB_FARC = c;
  }
  // ---- gum trees: tall pale trunks with peeling bark, sparse olive crowns, behind the clearing
  {
    const [c, x] = wbPlate(WBB_GUM, 1);
    const rng = mulberry32(77);
    const gum = (bx, by, h, w, lean) => {
      // trunk: a tapering, slightly kinked column, pale cream-grey with pink and ochre streaks, darker on the left
      const pts = [];
      for (let k = 0; k <= 12; k++) { const u = k / 12; pts.push([bx + lean * u * h * 0.25 + 10 * Math.sin(u * 7 + bx), by - h * u, w * (1 - 0.7 * u)]); }
      x.beginPath();
      for (const p of pts) x.lineTo(p[0] - p[2] / 2, p[1]);
      for (let k = pts.length - 1; k >= 0; k--) x.lineTo(pts[k][0] + pts[k][2] / 2, pts[k][1]);
      x.closePath();
      const tg = x.createLinearGradient(bx - w / 2, 0, bx + w / 2, 0);
      tg.addColorStop(0, '#A89A9A'); tg.addColorStop(0.45, '#E2D6C8'); tg.addColorStop(1, '#F6E6CF');
      x.fillStyle = tg; x.fill();
      for (let s = 0; s < 14; s++) {                    // bark streaks, a ribbon of peeling bark
        const u = rng(), p = pts[Math.floor(u * 11)];
        x.strokeStyle = rng() < 0.5 ? 'rgba(196,120,96,0.45)' : 'rgba(150,140,120,0.45)'; x.lineWidth = 2 + rng() * 4;
        x.beginPath(); x.moveTo(p[0] + (rng() - 0.5) * p[2] * 0.6, p[1]); x.lineTo(p[0] + (rng() - 0.5) * p[2] * 0.6, p[1] - 40 - rng() * 120); x.stroke();
      }
      // branches and crowns: clumps of olive leaves, lit gold on the right
      for (let b = 0; b < 4; b++) {
        const u = 0.55 + 0.12 * b, p = pts[Math.round(u * 12)], dir = b % 2 ? 1 : -1;
        const ex = p[0] + dir * (60 + rng() * 90), ey = p[1] - 70 - rng() * 80;
        x.strokeStyle = '#B9AA9C'; x.lineWidth = p[2] * 0.35; x.lineCap = 'round';
        x.beginPath(); x.moveTo(p[0], p[1]); x.quadraticCurveTo(p[0] + dir * 30, p[1] - 50, ex, ey); x.stroke();
        for (let k = 0; k < 7; k++) {
          const cx = ex + (rng() - 0.5) * 120, cy = ey + (rng() - 0.6) * 70, r = 28 + rng() * 34;
          x.fillStyle = ['#5C7243', '#6E8550', '#7F9658'][k % 3]; x.beginPath(); x.ellipse(cx, cy, r * 1.3, r * 0.8, 0, 0, 7); x.fill();
          x.fillStyle = 'rgba(255,214,140,0.35)'; x.beginPath(); x.ellipse(cx + r * 0.4, cy - r * 0.2, r * 0.7, r * 0.4, 0, 0, 7); x.fill();
        }
      }
    };
    const trees = [[-560, 1460, 1150, 52, 0.1], [-300, 1440, 1300, 64, -0.05], [-60, 1420, 980, 40, 0.15], [120, 1410, 1240, 46, -0.1],
      [860, 1420, 1250, 50, 0.08], [1060, 1450, 1180, 58, -0.12], [1300, 1440, 1320, 62, 0.06], [1560, 1470, 1100, 48, -0.04]];
    for (const tr of trees) gum(...tr);
    WBB_GUMC = c;
  }
  // ---- the meadow: golden buttongrass tussocks to the horizon, bigger toward us
  {
    const [c, x] = wbPlate(WBB_MDW, 1);
    const R = WBB_MDW;
    const g = x.createLinearGradient(0, R.y, 0, R.y + R.h);
    g.addColorStop(0, '#B79A63'); g.addColorStop(0.2, '#A3834E'); g.addColorStop(0.6, '#7C6038'); g.addColorStop(1, '#5A4428');
    x.fillStyle = g;
    x.beginPath(); x.moveTo(R.x, R.y + 30);
    for (let px = R.x; px <= R.x + R.w; px += 20) x.lineTo(px, R.y + 26 + 10 * Math.sin(px / 260) + 6 * vnoise(px / 50, 3));
    x.lineTo(R.x + R.w, R.y + R.h); x.lineTo(R.x, R.y + R.h); x.closePath(); x.fill();
    const rng = mulberry32(19);
    for (let i = 0; i < 520; i++) {
      const u = Math.pow(rng(), 0.8), gx = R.x + rng() * R.w, gy = R.y + 40 + u * (R.h - 60), hh = 10 + u * 60, ww = 8 + u * 40;
      const tone = 0.5 + 0.5 * rng();
      for (let k = 0; k < 7; k++) {
        const a = -Math.PI / 2 + (k - 3) * 0.22 + (rng() - 0.5) * 0.2;
        x.strokeStyle = `rgba(${200 + 40 * tone},${160 + 40 * tone},${80 + 30 * tone},${0.55 + 0.35 * rng()})`; x.lineWidth = 1 + u * 2.2;
        x.beginPath(); x.moveTo(gx + (k - 3) * ww * 0.08, gy);
        x.quadraticCurveTo(gx + Math.cos(a) * hh * 0.5, gy + Math.sin(a) * hh * 0.6, gx + Math.cos(a) * hh * 0.9 + (k - 3) * 3, gy + Math.sin(a) * hh); x.stroke();
      }
    }
    WBB_MDWC = c;
  }
}

// the backdrop for a camera: sky (fixed), the sun, far mountains (p 0.2), gum trees (p 0.45), the meadow (p 0.8).
// o: {soft 0..1 (close-ups: the set goes out of focus), sun 0..1}
function wbBushBack(cam, t, o = {}) {
  const soft = clamp(o.soft || 0);
  screenSpace();
  ctx.drawImage(WBB_SKY, 0, 0);
  // the sun: a soft warm disc, its glow in the glow layer (kept off the hero: upper right)
  const sp = parallax(cam, 0.12), sxy0 = toScreen(sp, WBB.sunX, WBB.sunY), sxy = [sxy0[0] + (o.sunDX || 0), sxy0[1] + (o.sunDY || 0)];
  const sr = 46 * (1 + 0.12 * (cam.zoom - 1));
  softDot(ctx, sxy[0], sxy[1], sr * 3.2, '#FFE2A8', 0.55);
  circle(ctx, sxy[0], sxy[1], sr, '#FFF3D6');
  softDot(gctx, sxy[0], sxy[1], sr * 2.4, '#FFD58A', 0.75 * (o.sun == null ? 1 : o.sun));
  const plate = (img, r, p, blurPx) => {
    camTransform(ctx, parallax(cam, p), 1);
    if (soft > 0.02) {
      const s = wbSoft(img, blurPx, 0.92);
      ctx.globalAlpha = 1; ctx.drawImage(img, r.x, r.y, r.w, r.h);
      ctx.globalAlpha = soft; ctx.drawImage(s, r.x, r.y, r.w, r.h); ctx.globalAlpha = 1;
    } else ctx.drawImage(img, r.x, r.y, r.w, r.h);
  };
  plate(WBB_FARC, WBB_FAR, 0.2, 7);
  plate(WBB_GUMC, WBB_GUM, 0.45, 10);
  plate(WBB_MDWC, WBB_MDW, 0.8, 9);
  // golden haze low in the valley, then the light shafts through the gums
  screenSpace();
  const hz = ctx.createLinearGradient(0, H * 0.45, 0, H * 0.8);
  hz.addColorStop(0, 'rgba(255,214,160,0)'); hz.addColorStop(1, 'rgba(255,214,160,0.16)');
  ctx.fillStyle = hz; ctx.fillRect(0, H * 0.45, W, H * 0.35);
}

// pollen and dust motes drifting in the low sun (screen space, loop-safe)
function wbMotes(t, a = 1, seed = 3) {
  if (a <= 0.01) return;
  screenSpace();
  const rng = mulberry32(seed), w = loopW(0.35);
  for (let i = 0; i < 38; i++) {
    const x0 = rng() * W, y0 = rng() * H, ph = rng() * 6.283, r = 1.5 + rng() * 3.5;
    const x = (x0 + 30 * Math.sin(t * w + ph)) % W, y = (y0 + 20 * Math.cos(t * w * 0.7 + ph * 1.3)) % H;
    const tw = 0.5 + 0.5 * Math.sin(t * loopW(1.7) + ph);
    softDot(ctx, x, y, r * 3, '#FFE6B0', 0.22 * a * tw);
    softDot(gctx, x, y, r * 2, '#FFD48A', 0.35 * a * tw);
  }
}

// the big mossy fallen log he sits in front of: a horizontal trunk with a cut end on the left (rings), bark ridges,
// moss cushions on top, a few fungi; lit as a prop. (world coords; drawn under the camera)
function wbLog(t) {
  const y = WBB.logY, r = WBB.logR, x0 = WBB.logX0, x1 = WBB.logX1;
  const rng = mulberry32(41);
  const topY = (x) => y - r + 5 * Math.sin(x / 47) + 4 * vnoise(x / 23, 3);
  ctx.save();
  ctx.beginPath(); ctx.moveTo(x0, topY(x0));
  for (let x = x0; x <= x1; x += 12) ctx.lineTo(x, topY(x));
  ctx.lineTo(x1, y + r + 6); ctx.lineTo(x0, y + r); ctx.closePath();
  const bg = ctx.createLinearGradient(0, y - r, 0, y + r);
  bg.addColorStop(0, '#A07A52'); bg.addColorStop(0.18, '#8A6644'); bg.addColorStop(0.55, '#5E4430'); bg.addColorStop(1, '#30221A');
  ctx.fillStyle = bg; ctx.fill();
  paint(() => {
    for (let i = 0; i < 60; i++) {   // bark: long ridges along the trunk, short cracks across
      const bx = x0 + 20 + rng() * (x1 - x0 - 30), by = y - r * 0.75 + rng() * r * 1.6, len = 50 + rng() * 140;
      line(ctx, bx, by, bx + len, by + (rng() - 0.5) * 5, 2.5 + rng() * 3, rgba('#2A1C12', 0.45));
      if (rng() < 0.3) line(ctx, bx, by - 8, bx + 4, by + 14, 2, rgba('#2A1C12', 0.4));
    }
    const hl = ctx.createLinearGradient(0, y - r, 0, y - r + 34);   // the low sun along its top
    hl.addColorStop(0, 'rgba(255,214,150,0.45)'); hl.addColorStop(1, 'rgba(255,214,150,0)');
    ctx.fillStyle = hl; ctx.fillRect(x0, y - r - 6, x1 - x0, 40);
  });
  // the cut end: an ellipse with rings
  ellipse(ctx, x0, y, r * 0.42, r, '#C9A777');
  paint(() => {
    for (let k = 1; k < 6; k++) { ctx.beginPath(); ctx.ellipse(x0, y, r * 0.42 * k / 6, r * k / 6, 0, 0, 7); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(120,84,50,0.55)'; ctx.stroke(); }
  });
  // moss cushions along the top: dark green, a little lit on top
  for (let i = 0; i < 26; i++) {
    const mx = x0 + 40 + i * ((x1 - x0) / 26) + (rng() - 0.5) * 30, mw = 22 + rng() * 34, my = topY(mx) + 6;
    ellipse(ctx, mx, my, mw, 11 + rng() * 6, i % 3 ? '#4E6B2E' : '#5E7E36');
    paint(() => { for (let k = 0; k < 4; k++) circle(ctx, mx - mw * 0.6 + rng() * mw * 1.2, my - 4 - rng() * 5, 2 + rng() * 2, 'rgba(190,214,110,0.7)'); });
  }
  for (const [fx, fy] of [[x0 + 210, y + 30], [x0 + 236, y + 48]]) {
    ctx.beginPath(); ctx.ellipse(fx, fy, 16, 7, 0, Math.PI, 0); ctx.fillStyle = '#E58A3A'; ctx.fill();
  }
  ctx.restore();
  return topY;
}

// a band of buttongrass tussocks in front of everything (it hides his waist in the seated shots)
function wbGrassBand(t, y, x0, x1, s, seed = 1) {
  const rng = mulberry32(seed);
  for (let x = x0; x < x1; x += 46 * s) {
    const k = rng();
    wbTussock(x + rng() * 20 * s, y + rng() * 18 * s, s * (0.85 + 0.35 * k), t, seed * 31 + Math.round(x),
      k < 0.33 ? ['#C9A04E', '#B88C3C', '#DDBA66'] : (k < 0.66 ? ['#D9B25E', '#C79A45', '#E8C877'] : ['#A88A40', '#C6A250', '#D8BC70']));
  }
}

// tussocks in front of everything (they hide his legs and frame the shot); sway on loop-safe clocks. (world coords)
function wbTussock(x, y, s, t, seed = 1, col = ['#D9B25E', '#C79A45', '#E8C877']) {
  const rng = mulberry32(seed), sw = 0.05 * Math.sin(t * loopW(1.3) + seed);
  for (let k = 0; k < 15; k++) {
    const a = -Math.PI / 2 + (k - 7) * 0.13 + (rng() - 0.5) * 0.15 + sw, hh = (70 + rng() * 60) * s;
    ctx.strokeStyle = col[k % 3]; ctx.lineWidth = (4 + rng() * 3) * s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x + (k - 7) * 3 * s, y);
    ctx.quadraticCurveTo(x + Math.cos(a) * hh * 0.5, y + Math.sin(a) * hh * 0.6, x + Math.cos(a + sw) * hh, y + Math.sin(a) * hh);
    ctx.stroke();
  }
}

// the sandstone boulder over the creek (payoff): a flat-topped block, rounded, with layered bands, lichen, a ledge on the
// right; lit as a prop. Returns its top line for things set on it. (world coords)
function wbRock(t) {
  const X = WBB.rockX, T = WBB.rockTop, w = WBB.rockW, B = WBB.rockBot;
  const xl = X - w / 2, xr = X + w / 2;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(xl - 20, B); ctx.quadraticCurveTo(xl - 40, T + 120, xl + 40, T + 10); ctx.quadraticCurveTo(X, T - 14, xr - 50, T + 6);
  ctx.quadraticCurveTo(xr + 10, T + 30, xr + 6, T + 150); ctx.lineTo(xr + 60, T + 200);    // the ledge
  ctx.quadraticCurveTo(xr + 80, T + 230, xr + 40, T + 260); ctx.quadraticCurveTo(xr + 30, B - 60, xr + 10, B); ctx.closePath();
  const g = ctx.createLinearGradient(0, T, 0, B);
  g.addColorStop(0, '#E2B27A'); g.addColorStop(0.4, '#C98E58'); g.addColorStop(1, '#8E5E38');
  ctx.fillStyle = g; ctx.fill();
  paint(() => {   // the bands of sandstone and lichen
    ctx.save(); ctx.clip();
    for (let k = 0; k < 7; k++) {
      const by = T + 50 + k * 52;
      ctx.beginPath(); ctx.moveTo(xl - 50, by);
      for (let px = xl - 50; px <= xr + 90; px += 20) ctx.lineTo(px, by + 8 * Math.sin(px / 60 + k) + 4 * vnoise(px / 30, k));
      ctx.lineWidth = 6 + (k % 3) * 3; ctx.strokeStyle = k % 2 ? 'rgba(150,90,50,0.35)' : 'rgba(255,214,160,0.25)'; ctx.stroke();
    }
    const rng = mulberry32(8);
    for (let i = 0; i < 22; i++) {
      const lx = xl + rng() * w, ly = T + 20 + rng() * (B - T - 60);
      ctx.fillStyle = rng() < 0.5 ? 'rgba(220,226,170,0.45)' : 'rgba(170,190,140,0.4)';
      ctx.beginPath(); ctx.ellipse(lx, ly, 10 + rng() * 22, 6 + rng() * 10, rng(), 0, 7); ctx.fill();
    }
    ctx.restore();
  });
  ctx.restore();
  return { y: (x) => T + 8 * Math.pow((x - X) / (w / 2), 4), x0: xl + 40, x1: xr - 40, ledge: [xr + 50, T + 205] };
}

// the creek below the rock, at the bottom right: dark water with gold glints, ripple rings from a splash (world coords)
function wbCreek(t, splashT, o = {}) {
  const y = WBB.creekY;
  ctx.save();
  ctx.beginPath(); ctx.moveTo(360, y + 40); ctx.quadraticCurveTo(700, y - 10, 1400, y - 30); ctx.lineTo(1400, 2200); ctx.lineTo(360, 2200); ctx.closePath();
  const g = ctx.createLinearGradient(0, y - 30, 0, y + 420);
  g.addColorStop(0, '#E9B98C'); g.addColorStop(0.12, '#B79AA6'); g.addColorStop(0.4, '#5E6C8E'); g.addColorStop(1, '#22304A');
  ctx.fillStyle = g; ctx.fill();
  paint(() => {
    // the rock's reflection: a dark band under it
    const rx = WBB.rockX, rw = WBB.rockW;
    const rg = ctx.createLinearGradient(0, y, 0, y + 260); rg.addColorStop(0, 'rgba(90,50,30,0.55)'); rg.addColorStop(1, 'rgba(90,50,30,0)');
    ctx.fillStyle = rg; ctx.fillRect(rx - rw / 2, y, rw + 60, 260);
    // ripples: gold glints that drift and breathe (loop-safe)
    const rng = mulberry32(17), w = loopW(1.1);
    for (let i = 0; i < 46; i++) {
      const gx = 380 + rng() * 1000, gy = y + 14 + Math.pow(rng(), 1.4) * 360, len = 16 + rng() * 70 * (gy - y + 40) / 400;
      const a = 0.25 + 0.4 * (0.5 + 0.5 * Math.sin(t * w + i * 1.7));
      line(ctx, gx + 6 * Math.sin(t * w + i), gy, gx + len + 6 * Math.sin(t * w + i), gy, 2 + (gy - y) / 120, i % 3 ? `rgba(255,224,170,${a})` : `rgba(210,220,255,${a * 0.7})`);
    }
    // foam where the water meets the rock
    for (let i = 0; i < 9; i++) ellipse(ctx, WBB.rockX - 180 + i * 50, y + 8 + 4 * Math.sin(t * w + i), 22, 5, 'rgba(255,255,255,0.35)');
    if (splashT != null && t > splashT) {
      const u = t - splashT;
      for (let k = 0; k < 3; k++) {
        const r = 30 + 170 * (u - k * 0.12), al = clamp(1 - (u - k * 0.12) / 0.9);
        if (r > 0 && al > 0) { ctx.beginPath(); ctx.ellipse(o.sx || 1000, o.sy || y + 60, r, r * 0.28, 0, 0, 7); ctx.lineWidth = 5; ctx.strokeStyle = `rgba(240,246,255,${0.75 * al})`; ctx.stroke(); }
      }
    }
  });
  ctx.restore();
}
