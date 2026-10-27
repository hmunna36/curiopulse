// How Much Does a Teaspoon of NEUTRON Star Weigh? 🥄 — the campsite at dusk (world coords, 1080x1920 at zoom 1).
// A snow peak in alpenglow (a plate painted once at 1.5x: the camera whips up to it), far ridges with pines, near pines and
// his tent, a meadow; his camp table with a gingham cloth, a lantern, an enamel mug that steams and the jar of NEUTRON STAR
// whose stuff glows blue-white. Everything that catches the light (him, the table, the jar, the mug, the spoon) is drawn with
// shapes every frame; the sky, the mountain, the ridges and the meadow are cached plates drawn with parallax.
'use strict';

const NC = { gy: 1640, tableY: 1340, tx0: 318, tx1: 906, jarX: 625, mugX: 498, lampX: 352, heroX: 455, heroS: 1.05,
  peakX: 690, peakY: 370 };
const NC_MS = 1.5;                                   // the mountain plate's resolution
const NC_MR = { x: -420, y: 180, w: 1920, h: 1180 };  // the mountain plate's world rect
const NC_RR = { x: -700, y: 960, w: 2480, h: 560 };   // far ridges
const NC_GR = { x: -700, y: 1380, w: 2480, h: 900 };  // the meadow
let NC_SKY = null, NC_MTN = null, NC_MTN_BLOWN = null, NC_RIDGE = null, NC_PINES = null, NC_GROUND = null;
const NC_SOFT = new Map();   // plate -> its out-of-focus copy (close-ups: the set goes soft)
function ncSoft(img, px, dim = 0.82) {
  if (NC_SOFT.has(img)) return NC_SOFT.get(img);
  const c = mkCanvas(img.width, img.height), x = c.getContext('2d');
  x.filter = `blur(${px}px) brightness(${dim})`; x.drawImage(img, 0, 0); x.filter = 'none';
  NC_SOFT.set(img, c); return c;
}

function ncPlate(r, s) { const c = mkCanvas(Math.round(r.w * s), Math.round(r.h * s)); const x = c.getContext('2d'); x.scale(s, s); x.translate(-r.x, -r.y); return [c, x]; }

function initCamp() {
  // ---- the sky (screen space): night blue overhead, a warm band low where the sun went down behind the right-hand ridges
  {
    const c = mkCanvas(W, H), x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0.0, '#070B22'); g.addColorStop(0.22, '#141D4A'); g.addColorStop(0.42, '#33397A');
    g.addColorStop(0.55, '#7A5A98'); g.addColorStop(0.66, '#E0828A'); g.addColorStop(0.76, '#F7B07C'); g.addColorStop(1, '#FFD9A0');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    const gl = x.createRadialGradient(W * 0.92, H * 0.74, 20, W * 0.92, H * 0.74, H * 0.5);   // the afterglow, right
    gl.addColorStop(0, 'rgba(255,214,150,0.55)'); gl.addColorStop(1, 'rgba(255,170,120,0)');
    x.fillStyle = gl; x.fillRect(0, 0, W, H);
    const rng = mulberry32(71);
    for (let i = 0; i < 260; i++) {                       // first stars, high up
      const sx = rng() * W, sy = Math.pow(rng(), 1.7) * H * 0.5, r = 0.6 + rng() * 1.5;
      x.fillStyle = `rgba(235,240,255,${(0.25 + 0.6 * rng()) * (1 - sy / (H * 0.5))})`;
      x.beginPath(); x.arc(sx, sy, r, 0, 7); x.fill();
    }
    for (let i = 0; i < 7; i++) {                         // thin cloud streaks lit pink from below
      const cy = H * (0.47 + 0.035 * i) + rng() * 30, cx = rng() * W, len = 300 + rng() * 420;
      const cg = x.createLinearGradient(cx - len / 2, 0, cx + len / 2, 0);
      cg.addColorStop(0, 'rgba(255,170,170,0)'); cg.addColorStop(0.5, `rgba(255,${150 + i * 8},${150 + i * 4},${0.22 + 0.05 * i})`); cg.addColorStop(1, 'rgba(255,170,170,0)');
      x.fillStyle = cg; x.beginPath(); x.ellipse(cx, cy, len / 2, 7 + rng() * 6, 0, 0, 7); x.fill();
    }
    NC_SKY = c;
  }
  NC_MTN = ncPaintMountain(false);
  NC_MTN_BLOWN = ncPaintMountain(true);
  // ---- far ridges with pine teeth
  {
    const [c, x] = ncPlate(NC_RR, 1);
    const rng = mulberry32(5);
    const ridge = (y0, amp, col, seed, pines) => {
      x.beginPath(); x.moveTo(NC_RR.x, NC_RR.y + NC_RR.h);
      for (let px = NC_RR.x; px <= NC_RR.x + NC_RR.w; px += 8) {
        let y = y0 + amp * (0.6 * Math.sin(px / 260 + seed) + 0.4 * vnoise(px / 90, seed));
        if (pines && vnoise(px / 13, seed + 3) > 0.15) y -= 26 * Math.abs(Math.sin(px / 9 + seed)) * (0.4 + vnoise(px / 40, seed + 9));
        x.lineTo(px, y);
      }
      x.lineTo(NC_RR.x + NC_RR.w, NC_RR.y + NC_RR.h); x.closePath(); x.fillStyle = col; x.fill();
    };
    ridge(1120, 46, '#3A3F7E', 1.3, false);
    ridge(1215, 40, '#252A5C', 4.1, true);
    ridge(1300, 30, '#181C44', 7.7, true);
    // haze in the valley
    const hg = x.createLinearGradient(0, 1180, 0, 1330); hg.addColorStop(0, 'rgba(160,150,210,0)'); hg.addColorStop(1, 'rgba(150,140,210,0.25)');
    x.fillStyle = hg; x.fillRect(NC_RR.x, 1180, NC_RR.w, 150);
    void rng;
    NC_RIDGE = c;
  }
  // ---- near pines (left and right of the camp), dark, with a warm edge on the right where the afterglow catches them
  {
    const R = { x: -500, y: 700, w: 2080, h: 900 };
    const [c, x] = ncPlate(R, 1);
    const rng = mulberry32(23);
    const pine = (px, by, h, w) => {
      const tiers = 7;
      for (let k = 0; k < tiers; k++) {
        const u = k / tiers, yy = by - h * u, ww = w * (1 - u * 0.85);
        x.beginPath(); x.moveTo(px - ww / 2, yy); x.lineTo(px, yy - h / tiers * 1.9); x.lineTo(px + ww / 2, yy); x.closePath();
        x.fillStyle = '#0E1330'; x.fill();
        x.beginPath(); x.moveTo(px + ww * 0.18, yy - 4); x.lineTo(px, yy - h / tiers * 1.9); x.lineTo(px + ww / 2, yy); x.closePath();
        x.fillStyle = 'rgba(120,70,90,0.35)'; x.fill();
      }
      x.fillStyle = '#0A0D22'; x.fillRect(px - 6, by - 10, 12, 30);
    };
    for (let i = 0; i < 9; i++) pine(-420 + i * 70 + rng() * 40, 1520 + rng() * 40, 520 + rng() * 260, 170 + rng() * 60);
    for (let i = 0; i < 9; i++) pine(1010 + i * 62 + rng() * 40, 1500 + rng() * 40, 480 + rng() * 300, 160 + rng() * 60);
    NC_PINES = [c, R];
  }
  // ---- the meadow
  {
    const [c, x] = ncPlate(NC_GR, 1);
    const g = x.createLinearGradient(0, NC_GR.y, 0, NC_GR.y + NC_GR.h);
    g.addColorStop(0, '#2B3B57'); g.addColorStop(0.18, '#22374A'); g.addColorStop(0.5, '#172B33'); g.addColorStop(1, '#0D1A1E');
    x.fillStyle = g;
    x.beginPath(); x.moveTo(NC_GR.x, NC_GR.y + 40);
    for (let px = NC_GR.x; px <= NC_GR.x + NC_GR.w; px += 20) x.lineTo(px, NC_GR.y + 30 + 18 * Math.sin(px / 300) + 8 * vnoise(px / 60, 3));
    x.lineTo(NC_GR.x + NC_GR.w, NC_GR.y + NC_GR.h); x.lineTo(NC_GR.x, NC_GR.y + NC_GR.h); x.closePath(); x.fill();
    const rng = mulberry32(9);
    for (let i = 0; i < 900; i++) {                       // grass blades, denser and bigger toward us
      const u = Math.pow(rng(), 0.7), gx = NC_GR.x + rng() * NC_GR.w, gy2 = NC_GR.y + 60 + u * (NC_GR.h - 60), hh = 8 + u * 34;
      x.strokeStyle = `rgba(${40 + 30 * rng()},${70 + 40 * rng()},${70 + 30 * rng()},${0.5 + 0.4 * rng()})`; x.lineWidth = 1.5 + u * 2.5;
      x.beginPath(); x.moveTo(gx, gy2); x.quadraticCurveTo(gx + 4, gy2 - hh * 0.6, gx + (rng() - 0.5) * 14, gy2 - hh); x.stroke();
    }
    for (let i = 0; i < 26; i++) {                        // rocks
      const rx = NC_GR.x + rng() * NC_GR.w, ry = NC_GR.y + 90 + rng() * (NC_GR.h - 120), rs = 10 + rng() * 34;
      x.fillStyle = '#2E3550'; x.beginPath(); x.ellipse(rx, ry, rs * 1.4, rs * 0.7, 0, Math.PI, 0); x.fill();
      x.fillStyle = 'rgba(255,170,140,0.18)'; x.beginPath(); x.ellipse(rx + rs * 0.3, ry - rs * 0.25, rs * 0.7, rs * 0.3, 0, Math.PI, 0); x.fill();
    }
    NC_GROUND = c;
  }
}

// the peak: a jagged massif, snow above a ragged snow line, lit faces (the afterglow from the right) in pink-orange,
// shadow faces in blue-violet, couloirs, rock bands. blown = the snow cap blasted off the top (after the explosion).
function ncPaintMountain(blown) {
  const [c, x] = ncPlate(NC_MR, NC_MS);
  const rng = mulberry32(blown ? 404 : 404);
  const P = [NC.peakX, NC.peakY];
  const outline = [];
  const add = (pts) => { for (const p of pts) outline.push(p); };
  const jag = (a, b, d, dep, seed) => jagged(mulberry32(seed), a[0], a[1], b[0], b[1], d, dep);
  const K = [[-420, 1360], [-300, 980], [-60, 860], [140, 760], [300, 640], [420, 700], [520, 610], [P[0], P[1]], [800, 520],
    [930, 600], [1080, 700], [1260, 790], [1500, 900], [1500, 1360]];
  for (let i = 0; i < K.length - 1; i++) add(jag(K[i], K[i + 1], i === 0 || i === K.length - 2 ? 0 : 34, 5, 50 + i).slice(0, -1));
  add([K[K.length - 1]]);
  const path = () => { x.beginPath(); x.moveTo(outline[0][0], outline[0][1]); for (const p of outline) x.lineTo(p[0], p[1]); x.closePath(); };
  // rock base
  const g = x.createLinearGradient(0, 360, 0, 1360); g.addColorStop(0, '#4A4C8C'); g.addColorStop(0.5, '#2D3166'); g.addColorStop(1, '#1A1E46');
  path(); x.fillStyle = g; x.fill();
  x.save(); path(); x.clip();
  // faces: spines from each summit; right of a spine is lit by the afterglow, left of it in shadow
  const faces = [
    { top: P, spine: [[650, 600], [610, 820], [640, 1060], [600, 1360]], right: [[800, 520], [930, 600], [1080, 700], [1260, 790], [1500, 900], [1500, 1360]] },
    { top: [300, 640], spine: [[330, 820], [300, 1020], [330, 1360]], right: [[420, 700], [520, 610], [560, 760], [560, 1360]] },
    { top: [140, 760], spine: [[120, 940], [150, 1360]], right: [[300, 640], [260, 900], [240, 1360]] },
  ];
  for (const f of faces) {
    x.beginPath(); x.moveTo(f.top[0], f.top[1]);
    for (const p of f.spine) x.lineTo(p[0], p[1]);
    for (let i = f.right.length - 1; i >= 0; i--) x.lineTo(f.right[i][0], f.right[i][1]);
    x.closePath();
    const lg = x.createLinearGradient(f.top[0], f.top[1], f.top[0] + 300, f.top[1] + 700);
    lg.addColorStop(0, '#B07AA8'); lg.addColorStop(0.5, '#6E5A9A'); lg.addColorStop(1, '#2E3170');
    x.fillStyle = lg; x.fill();
  }
  // the snow: everything above a ragged snow line, then lit / shadow tints
  const snowLine = (px) => 690 + 90 * Math.sin(px / 210) + 40 * vnoise(px / 40, 12) + (px < 250 ? 120 : 0);
  x.beginPath(); x.moveTo(NC_MR.x, NC_MR.y);
  for (let px = NC_MR.x; px <= NC_MR.x + NC_MR.w; px += 6) x.lineTo(px, snowLine(px));
  x.lineTo(NC_MR.x + NC_MR.w, NC_MR.y); x.closePath();
  x.save(); x.clip();
  path(); x.fillStyle = '#C9C6EE'; x.fill();                       // snow in shadow: lavender
  for (const f of faces) {                                         // snow in the light: pink-gold alpenglow
    x.beginPath(); x.moveTo(f.top[0], f.top[1]);
    for (const p of f.spine) x.lineTo(p[0], p[1]);
    for (let i = f.right.length - 1; i >= 0; i--) x.lineTo(f.right[i][0], f.right[i][1]);
    x.closePath();
    const sg = x.createLinearGradient(f.top[0], f.top[1] - 40, f.top[0] + 200, f.top[1] + 420);
    sg.addColorStop(0, '#FFE6D0'); sg.addColorStop(0.35, '#FFC2A6'); sg.addColorStop(1, '#F08A8E');
    x.fillStyle = sg; x.fill();
  }
  x.restore();
  // couloirs and rock bands: streaks running down from the ridges, light rock in the snow, snow in the rock
  for (let i = 0; i < 70; i++) {
    const sx = -200 + rng() * 1600, sy = 420 + rng() * 520, len = 60 + rng() * 220, ang = Math.PI / 2 + (rng() - 0.5) * 0.9;
    const inSnow = sy < snowLine(sx);
    x.strokeStyle = inSnow ? `rgba(70,70,130,${0.25 + 0.3 * rng()})` : `rgba(220,215,250,${0.15 + 0.25 * rng()})`;
    x.lineWidth = 2 + rng() * 5; x.lineCap = 'round';
    x.beginPath(); x.moveTo(sx, sy);
    x.quadraticCurveTo(sx + Math.cos(ang) * len * 0.5 + (rng() - 0.5) * 30, sy + Math.sin(ang) * len * 0.5, sx + Math.cos(ang) * len, sy + Math.sin(ang) * len);
    x.stroke();
  }
  // a glacier tongue and the dark forest line at the foot
  x.fillStyle = 'rgba(200,210,250,0.5)';
  x.beginPath(); x.moveTo(600, 700); x.quadraticCurveTo(640, 860, 560, 990); x.quadraticCurveTo(700, 900, 700, 720); x.closePath(); x.fill();
  const fg = x.createLinearGradient(0, 1080, 0, 1360); fg.addColorStop(0, 'rgba(20,24,60,0)'); fg.addColorStop(1, 'rgba(14,18,46,0.95)');
  x.fillStyle = fg; x.fillRect(NC_MR.x, 1080, NC_MR.w, 280);
  x.restore();
  if (blown) {                                                     // the cap blown off: a flat, smoking, scorched top
    x.save(); path(); x.clip();
    x.fillStyle = '#2A2440';
    x.beginPath(); x.moveTo(520, 610); x.lineTo(560, 470); x.lineTo(620, 500); x.lineTo(660, 455); x.lineTo(720, 490); x.lineTo(770, 460);
    x.lineTo(830, 545); x.lineTo(800, 520); x.lineTo(P[0] + 120, 300); x.lineTo(P[0] - 200, 300); x.closePath(); x.fill();
    x.restore();
    // cut the summit away: paint the sky's colour back over the top (the plate is drawn over the sky)
    x.save(); x.globalCompositeOperation = 'destination-out';
    x.beginPath(); x.moveTo(500, 300); x.lineTo(P[0] + 200, 300); x.lineTo(820, 540); x.lineTo(770, 462); x.lineTo(720, 492);
    x.lineTo(660, 457); x.lineTo(620, 502); x.lineTo(560, 472); x.lineTo(520, 600); x.closePath(); x.fill();
    x.restore();
  }
  void P;
  return c;
}

// the backdrop for a camera: sky, mountain, ridges, near pines, meadow (all cached plates, with parallax). o: {blown, dim}
function campBack(cam, t, o = {}) {
  screenSpace();
  ctx.drawImage(NC_SKY, 0, 0);
  // a few stars that twinkle (they loop with the Short)
  const rng = mulberry32(88);
  for (let i = 0; i < 24; i++) {
    const sx = rng() * W, sy = rng() * H * 0.36, ph = rng() * 6.28, f = 0.5 + rng();
    const a = 0.35 + 0.35 * Math.sin(loopW(f) * t + ph);
    circle(ctx, sx, sy, 1.6, `rgba(240,244,255,${a})`);
    softDot(gctx, sx, sy, 5, '#DDE6FF', 0.4 * a);
  }
  const soft = clamp((cam.zoom - 1.15) / 1.2);                  // how out of focus the set is (a close-up's depth of field)
  const plate = (img, R, p, px) => {
    applyCam(parallax(cam, p));
    if (soft < 0.98) ctx.drawImage(img, R.x, R.y, R.w, R.h);
    if (soft > 0.02) { ctx.globalAlpha = soft; ctx.drawImage(ncSoft(img, px), R.x, R.y, R.w, R.h); ctx.globalAlpha = 1; }
  };
  plate(o.blown ? NC_MTN_BLOWN : NC_MTN, NC_MR, 0.25, 9);
  plate(NC_RIDGE, NC_RR, 0.45, 6);
  plate(NC_PINES[0], NC_PINES[1], 0.78, 5);
  plate(NC_GROUND, NC_GR, 1, 4);
  applyCam(cam);
}

// his tent, back left, lit from inside
function ncTent(cam, t) {
  applyCam(parallax(cam, 0.9));
  const x0 = 60, y0 = 1560;
  ctx.fillStyle = '#C8542E';
  ctx.beginPath(); ctx.moveTo(x0 - 150, y0); ctx.lineTo(x0 + 10, y0 - 210); ctx.lineTo(x0 + 170, y0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#8E3420';
  ctx.beginPath(); ctx.moveTo(x0 + 10, y0 - 210); ctx.lineTo(x0 + 170, y0); ctx.lineTo(x0 + 60, y0); ctx.closePath(); ctx.fill();
  const fl = 0.85 + 0.15 * Math.sin(loopW(2.3) * t) * Math.sin(loopW(3.7) * t + 1);
  ctx.fillStyle = mixH('#FFB45A', '#FFD38A', fl - 0.7);
  ctx.beginPath(); ctx.moveTo(x0 - 40, y0); ctx.lineTo(x0 + 10, y0 - 130); ctx.lineTo(x0 + 60, y0); ctx.closePath(); ctx.fill();
  softDot(gctx, x0 + 10, y0 - 50, 150, '#FFA850', 0.45 * fl);
  line(ctx, x0 + 10, y0 - 210, x0 + 10, y0 - 240, 5, '#3A2A2A');
  applyCam(cam);
}

// the lantern on the table (world), flame in the glow layer. sw = swing (radians)
function ncLantern(x, y, t, sw = 0, on = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(sw); ctx.scale(NC_LS, NC_LS);
  rrect(ctx, -34, -14, 68, 14, 5); ctx.fillStyle = '#2B2F3E'; ctx.fill();
  rrect(ctx, -28, -98, 56, 86, 12); ctx.fillStyle = on > 0.5 ? '#FFD58A' : '#6A6A7A'; ctx.fill();
  const fl = 0.8 + 0.2 * Math.sin(loopW(7) * t) * Math.sin(loopW(11) * t + 2);
  paint(() => { ctx.fillStyle = `rgba(255,250,220,${0.9 * on})`; ctx.beginPath(); ctx.ellipse(0, -52, 9, 18 * fl, 0, 0, 7); ctx.fill(); });
  line(ctx, -24, -98, -24, -12, 5, '#2B2F3E'); line(ctx, 24, -98, 24, -12, 5, '#2B2F3E');
  rrect(ctx, -32, -112, 64, 16, 6); ctx.fillStyle = '#2B2F3E'; ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = '#3A3F52'; ctx.beginPath(); ctx.arc(0, -112, 22, Math.PI, 0); ctx.stroke();
  ctx.restore();
  const wx = x + Math.sin(sw) * 40, wy = y - Math.cos(sw) * 40;
  if (on > 0.02) { softDot(gctx, wx, wy, 120, '#FFB060', 0.55 * on * fl); softDot(gctx, wx, wy, 40, '#FFF0C0', 0.8 * on); }
}

// the jar of NEUTRON STAR (world: centre-bottom at x, y). k = how full / bright, lid: 0 = on, 1 = off beside it; jump = lift
const NC_JS = 0.62, NC_MGS = 0.6, NC_LS = 0.75;               // the props' sizes next to him (a jar is half a head wide)
function ncJar(x, y, t, o = {}) {
  const k = o.k === undefined ? 1 : o.k, rot = o.rot || 0;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(NC_JS, NC_JS);
  // the stuff inside (bright, drawn first; the glass over it)
  const lvl = -18 - 70 * k;
  ctx.fillStyle = '#D8F4FF';
  ctx.beginPath(); ctx.moveTo(-50, -10); ctx.lineTo(50, -10);
  ctx.lineTo(50, lvl); for (let i = 0; i <= 10; i++) ctx.lineTo(50 - i * 10, lvl - 6 * Math.sin(i * 1.3 + t * 3)); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.ellipse(-8, lvl + 12, 30, 8, 0, 0, 7); ctx.fill();
  // glass body
  paint(() => {
    rrect(ctx, -58, -150, 116, 150, 22); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(210,235,255,0.85)'; ctx.stroke();
    ctx.fillStyle = 'rgba(190,225,255,0.12)'; ctx.fill();
    line(ctx, -40, -128, -40, -40, 7, 'rgba(255,255,255,0.55)');
    // the neck
    rrect(ctx, -46, -166, 92, 20, 8); ctx.fillStyle = 'rgba(200,228,255,0.5)'; ctx.fill();
    // the label
    rrect(ctx, -54, -112, 108, 54, 6); ctx.fillStyle = '#F4E7C8'; ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = '#B9A27A'; ctx.stroke();
    ctx.fillStyle = '#20253C'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '900 19px Montserrat'; ctx.fillText('NEUTRON', 0, -95);
    ctx.font = '900 19px Montserrat'; ctx.fillText('STAR', 0, -74);
    ctx.fillStyle = '#3B8BD8'; ncStarGlyph(ctx, -41, -85, 8); ncStarGlyph(ctx, 41, -85, 8);
  });
  if (o.lid === 0) { rrect(ctx, -52, -184, 104, 24, 8); ctx.fillStyle = '#B83A3A'; ctx.fill(); }
  ctx.restore();
  if (o.lid !== 0) {                                          // the lid lying beside it
    ctx.save(); ctx.translate(x + 62, y - 6); ctx.rotate(0.12); ctx.scale(NC_JS, NC_JS);
    rrect(ctx, -52, -12, 104, 22, 8); ctx.fillStyle = '#B83A3A'; ctx.fill();
    rrect(ctx, -52, -12, 104, 8, 4); ctx.fillStyle = '#D85A52'; ctx.fill();
    ctx.restore();
  }
  softDot(gctx, x, y - 28, 70, '#9FDCFF', 0.2 * k);
  softDot(gctx, x, y - 28, 26, '#E8FAFF', 0.28 * k);
  // sparkles rising out of it
  for (let i = 0; i < 5; i++) {
    const u = ((t * 0.5 + i * 0.21) % 1), sx = x - 18 + 36 * hash(i * 7.1), sy = y - 66 - 60 * u;
    const a = Math.sin(u * Math.PI) * k;
    circle(ctx, sx, sy, 2, `rgba(220,250,255,${a})`); softDot(gctx, sx, sy, 7, '#BFF0FF', 0.5 * a);
  }
}
function ncStarGlyph(c, x, y, r) {
  c.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  c.closePath(); c.fill();
}

// the enamel camp mug (world: centre-bottom), steam rising; spill: 0..1 tipped and empty
function ncMug(x, y, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(NC_MGS, NC_MGS);
  ctx.lineWidth = 12; ctx.strokeStyle = '#E8ECF4'; ctx.beginPath(); ctx.arc(46, -44, 22, -1.2, 1.2); ctx.stroke();
  ctx.lineWidth = 4; ctx.strokeStyle = '#2E5FA8'; ctx.beginPath(); ctx.arc(46, -44, 22, -1.2, 1.2); ctx.stroke();
  rrect(ctx, -44, -88, 88, 88, 10); ctx.fillStyle = '#E8ECF4'; ctx.fill();
  paint(() => {
    rrect(ctx, -46, -92, 92, 12, 6); ctx.fillStyle = '#2E5FA8'; ctx.fill();
    const rng = mulberry32(3);
    for (let i = 0; i < 9; i++) circle(ctx, -36 + rng() * 72, -70 + rng() * 60, 2 + rng() * 2, '#9AB2D6');
    if (!o.empty) { ctx.fillStyle = '#7A4A2A'; ctx.beginPath(); ctx.ellipse(0, -86, 38, 6, 0, 0, 7); ctx.fill(); }
  });
  ctx.restore();
  if (!o.empty && !o.noSteam) {                                // steam: three soft wisps, see-through (never lit)
    for (let i = 0; i < 3; i++) {
      const u = ((t * 0.35 + i / 3) % 1);
      ctx.save(); ctx.globalAlpha = 0.28 * Math.sin(u * Math.PI);
      ctx.strokeStyle = '#F4F2FF'; ctx.lineWidth = 9 - 5 * u; ctx.lineCap = 'round';
      ctx.beginPath();
      for (let j = 0; j <= 8; j++) { const v = j / 8; ctx.lineTo(x - 9 + i * 9 + 9 * Math.sin(v * 5 + t * 2 + i), y - 58 - 80 * u - v * 44); }
      ctx.stroke(); ctx.restore();
    }
  }
}

// the camp table with a gingham cloth (world). o: {brk: 0..1 the top broken into a V around the hole at hx, hole: [x, y] size}
function ncTable(t, o = {}) {
  const y = NC.tableY, x0 = NC.tx0, x1 = NC.tx1, brk = o.brk || 0, hx = o.hx || 640;
  const sag = 150 * brk;
  const topY = (x) => y + (brk > 0 ? sag * Math.max(0, 1 - Math.abs(x - hx) / 330) : 0);
  // the legs (folding, dark) from under the top to the grass
  for (const lx of [x0 + 46, x1 - 46]) {
    const ty = topY(lx);
    line(ctx, lx - 26, ty + 10, lx + 26, NC.gy - 2, 9, '#3A2C26'); line(ctx, lx + 26, ty + 10, lx - 26, NC.gy - 2, 9, '#2E231F');
  }
  // the cloth front: from the table's edge down past the top of the legs, checks, a scalloped hem
  const hemY = (px) => topY(px) + 128;
  ctx.save();
  ctx.beginPath(); ctx.moveTo(x0 - 14, topY(x0) + 6);
  for (let px = x0; px <= x1; px += 20) ctx.lineTo(px, topY(px) + 8);
  ctx.lineTo(x1 + 14, topY(x1) + 6);
  for (let px = x1 + 14; px >= x0 - 14; px -= 30) ctx.quadraticCurveTo(px - 15, hemY(px - 15) + 10, px - 30, hemY(px - 30));
  ctx.closePath();
  ctx.fillStyle = '#A9A2A8'; ctx.fill();
  ctx.save(); ctx.clip();
  paint(() => {
    ctx.fillStyle = 'rgba(150,34,52,0.6)';
    for (let px = x0 - 20; px < x1 + 20; px += 44) ctx.fillRect(px, y - 20, 22, 400);
    for (let py = y + 4; py < NC.gy + 20; py += 44) ctx.fillRect(x0 - 30, py, x1 - x0 + 60, 22);
    const sh = ctx.createLinearGradient(0, y + 30, 0, y + 140 + sag);
    sh.addColorStop(0, 'rgba(20,16,40,0)'); sh.addColorStop(1, 'rgba(20,16,40,0.45)');
    ctx.fillStyle = sh; ctx.fillRect(x0 - 40, y, x1 - x0 + 80, NC.gy - y + 40);
  });
  ctx.restore();
  ctx.restore();
  // the top's edge (a thin board)
  ctx.lineCap = 'round';
  if (brk <= 0.001) { line(ctx, x0 - 16, y + 2, x1 + 16, y + 2, 16, '#8A5A36'); }
  else {
    line(ctx, x0 - 16, topY(x0) + 2, hx - 40, topY(hx - 40) + 2, 16, '#8A5A36');
    line(ctx, hx + 40, topY(hx + 40) + 2, x1 + 16, topY(x1) + 2, 16, '#8A5A36');
    // splinters at the break
    for (let i = 0; i < 6; i++) {
      const s = i % 2 ? 1 : -1, bx = hx + s * 40, by = topY(hx) - 4 + i * 3;
      line(ctx, bx, by, bx - s * (10 + 8 * i), by - 18 - 6 * (i % 3), 5, '#C79A6A');
    }
  }
}

// the teaspoon: handle from the grip point (world) along angle a, bowl at the end with the glowing heap. o: {k glow, bulge,
// heap (0 = empty spoon), wobble, crack}
function ncSpoon(c, gx, gy, a, s, t, o = {}) {
  const heap = o.heap === undefined ? 1 : o.heap;
  c.save(); c.translate(gx, gy); c.rotate(a); c.scale(s, s);
  // the handle (along +x) and the bowl at x = 120
  c.lineCap = 'round';
  line(c, -38, 0, 92, 0, 11, '#B9C2D6');
  line(c, -38, -2, 92, -2, 4, '#EEF2FA');
  c.beginPath(); c.ellipse(124, 0, 36, 24, 0, 0, 7); c.fillStyle = '#C9D1E2'; c.fill();
  c.beginPath(); c.ellipse(124, -3, 30, 17, 0, 0, 7); c.fillStyle = '#E9EEF8'; c.fill();
  c.restore();
  if (heap > 0.01) {
    // the heap stays upright (it is stuck to the bowl): world-space blob over the bowl's centre
    const bx = gx + Math.cos(a) * 124 * s, by = gy + Math.sin(a) * 124 * s;
    ncBlob(c, bx, by - 14 * s, 30 * s * heap, t, o);
    return [bx, by];
  }
  return [gx + Math.cos(a) * 124 * s, gy + Math.sin(a) * 124 * s];
}
// the glowing stuff: a lumpy heap of blue-white, bright core, sparkles; o.bulge (0..3: it swells), o.crack (light cracks)
function ncBlob(c, x, y, r, t, o = {}) {
  const b = o.bulge || 0, R = r * (1 + 0.55 * b), wob = (o.wobble || 0) + 0.25 * b;
  c.save(); c.translate(x, y);
  c.beginPath();
  for (let i = 0; i <= 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    const rr = R * (1 + 0.08 * Math.sin(a * 3 + t * 4) + wob * 0.12 * Math.sin(a * 5 - t * 13) + wob * 0.08 * Math.sin(a * 7 + t * 21));
    c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr * 0.82 - (a > Math.PI ? 0 : 0));
  }
  c.closePath(); c.fillStyle = '#BCEBFF'; c.fill();
  c.beginPath(); c.ellipse(-R * 0.15, -R * 0.2, R * 0.62, R * 0.48, 0, 0, 7); c.fillStyle = '#EAFBFF'; c.fill();
  c.beginPath(); c.ellipse(-R * 0.25, -R * 0.32, R * 0.25, R * 0.16, -0.3, 0, 7); c.fillStyle = '#FFFFFF'; c.fill();
  if (o.crack > 0.01) {
    c.lineWidth = 3 + 3 * o.crack; c.strokeStyle = `rgba(255,255,255,${0.9 * o.crack})`; c.lineCap = 'round';
    const rng = mulberry32(17);
    for (let i = 0; i < 6; i++) {
      const a0 = rng() * 6.28; c.beginPath(); c.moveTo(0, 0);
      let px = 0, py = 0;
      for (let j = 1; j <= 4; j++) { px += Math.cos(a0 + (rng() - 0.5)) * R * 0.3; py += Math.sin(a0 + (rng() - 0.5)) * R * 0.25; c.lineTo(px, py); }
      c.stroke();
    }
  }
  c.restore();
  // its light (glow layer: it is a lamp)
  const k = o.k === undefined ? 1 : o.k;
  if (o.noGlow) return;
  softDot(gctx, x, y, R * 3.0, '#8FD8FF', 0.2 * k * (1 + b * 0.6));
  softDot(gctx, x, y, R * 1.15, '#F2FDFF', 0.38 * k * (1 + b * 0.4));
  // tiny sparkles orbiting it
  for (let i = 0; i < 6; i++) {
    const a = t * (1.6 + 0.3 * i) + i * 1.05, rx = R * (1.5 + 0.2 * Math.sin(i)), sx = x + Math.cos(a) * rx, sy = y + Math.sin(a) * rx * 0.45 - R * 0.1;
    circle(c, sx, sy, 1.6, '#F4FDFF'); softDot(gctx, sx, sy, 6, '#CFF4FF', 0.55);
  }
}

// ---- after the crash: the table in two halves, the cloth crumpled, the spoon's handle sticking out of a crater
const NC_HOLE = { x: 640, y: NC.gy + 6 };
// the crater with the glowing bowl buried in it (world). o: {k glow, bulge, crack, wobble, handle: angle, heap}
function ncCrater(t, o = {}) {
  const x = NC_HOLE.x, y = NC_HOLE.y;
  ctx.fillStyle = '#0B1416'; ctx.beginPath(); ctx.ellipse(x, y, 74, 20, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#3A2E2A';
  for (let i = 0; i < 9; i++) { const a = Math.PI + (i / 8) * Math.PI; ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * 80, y + Math.sin(a) * 18 + 6, 16, 9, 0, 0, 7); ctx.fill(); }
  const b = o.bulge || 0;
  ncBlob(ctx, x, y - 6 - 10 * b, 22 * (1 + 0.15 * b), t, { bulge: b, crack: o.crack || 0, wobble: o.wobble || 0, k: o.k === undefined ? 1 : o.k });
  if (o.handle !== undefined) {                                // the handle, from the bowl in the ground up and out
    const a = o.handle, L = 104 * SPS_W;
    const hx = x - 10 + Math.cos(a) * L, hy = y - 10 + Math.sin(a) * L;
    ctx.lineCap = 'round';
    line(ctx, x - 6, y - 8, hx, hy, 11 * SPS_W * 1.4, '#B9C2D6'); line(ctx, x - 6, y - 10, hx, hy - 2, 4, '#EEF2FA');
    return [hx, hy];
  }
  return null;
}
const SPS_W = 0.95;   // the spoon stuck in the ground, drawn a bit bigger so its handle reads
// the table broken: the two halves on the grass, legs up, cloth crumpled (drawn behind him in the later shots)
function ncTableWreck(t) {
  const half = (cx, rot, flip) => {
    ctx.save(); ctx.translate(cx, NC.gy - 40); ctx.rotate(rot); ctx.scale(flip, 1);
    rrect(ctx, -150, -14, 300, 22, 6); ctx.fillStyle = '#8A5A36'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(-160, 4); ctx.quadraticCurveTo(-60, 60, 30, 36); ctx.quadraticCurveTo(110, 70, 160, 10); ctx.lineTo(150, 30);
    ctx.quadraticCurveTo(60, 96, -40, 70); ctx.quadraticCurveTo(-120, 80, -170, 40); ctx.closePath(); ctx.fillStyle = '#A9A2A8'; ctx.fill();
    paint(() => { ctx.fillStyle = 'rgba(150,34,52,0.5)'; for (let i = -150; i < 150; i += 40) ctx.fillRect(i, 10, 18, 60); });
    line(ctx, -120, -10, -150, -70, 9, '#6A4428'); line(ctx, 120, -10, 140, -66, 9, '#6A4428');
    for (let i = 0; i < 4; i++) line(ctx, 150, -6 + i * 5, 170 + 6 * i, -20 - 4 * i, 4, '#C79A6A');
    ctx.restore();
  };
  half(400, -0.22, 1); half(880, 0.2, -1);
}
// dust: a puff of soil that rises and spreads (world), k 0..1 of its life
function ncDust(x, y, k, s = 1, seed = 3) {
  if (k <= 0 || k >= 1) return;
  const rng = mulberry32(seed);
  for (let i = 0; i < 14; i++) {
    const a = Math.PI + rng() * Math.PI, d = (40 + rng() * 120) * s * E.outCubic(k), r = (18 + rng() * 26) * s * (0.6 + k);
    ctx.fillStyle = `rgba(${110 + 40 * rng()},${96 + 30 * rng()},${92 + 20 * rng()},${0.55 * (1 - k)})`;
    ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.5 - 30 * k * s, r, 0, 7); ctx.fill();
  }
}
// soot flying off him (screen-ish world puff), k 0..1
function ncSootPuff(x, y, k, seed = 9) {
  if (k <= 0 || k >= 1) return;
  const rng = mulberry32(seed);
  for (let i = 0; i < 22; i++) {
    const a = rng() * 6.28, d = (30 + rng() * 150) * E.outCubic(k), r = (5 + rng() * 12) * (1 - 0.5 * k);
    ctx.fillStyle = `rgba(30,28,34,${0.85 * (1 - k)})`;
    ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.8, r, 0, 7); ctx.fill();
  }
}
// fireflies drifting at dusk, in front (parallax > 1): warm bokeh dots that loop with the Short
function ncFireflies(cam, t, a = 1) {
  applyCam(parallax(cam, 1.25));
  const rng = mulberry32(51);
  for (let i = 0; i < 9; i++) {
    const bx = 200 + rng() * 700, by = 1000 + rng() * 600, f = 0.3 + rng() * 0.5, ph = rng() * 6.28;
    const x = bx + 40 * Math.sin(loopW(f) * t + ph), y = by + 26 * Math.cos(loopW(f * 0.7) * t + ph);
    const tw = 0.5 + 0.5 * Math.sin(loopW(1.3 + rng()) * t + ph);
    softDot(gctx, x, y, 22, '#FFD27A', 0.5 * tw * a);
    circle(ctx, x, y, 3, `rgba(255,236,170,${0.8 * tw * a})`);
  }
  applyCam(cam);
}
