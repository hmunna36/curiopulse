// This Whole Forest Is ONE Tree: the mountainside from the air (Pando as one patch of aspen crowns among other clones and
// dark firs, Fish Lake below), which turns to autumn patch by patch; and the meadow with a giant balance: the whole
// forest against forty blue whales. Prefix pd / PD.
'use strict';

// ---------------------------------------------------------------- the mountainside
const PDL = { patches: [], crowns: [], firs: [], lake: { x: 760, y: 1540, rx: 760, ry: 150 } };
// a patch: {id, cx, cy, rx, ry, col (green index shift), turn: cue name or null, to: autumn colour}
function pdInitLand() {
  const R = mulberry32(777);
  PDL.patches = [
    { id: 'pando', cx: 540, cy: 1150, rx: 400, ry: 175, seed: 11 },
    { id: 'a', cx: 120, cy: 905, rx: 230, ry: 90, seed: 22, to: '#FFD23A' },
    { id: 'b', cx: 940, cy: 925, rx: 240, ry: 95, seed: 33, to: '#FF8A2A' },
    { id: 'c', cx: 1010, cy: 1300, rx: 180, ry: 70, seed: 44, to: null },
    { id: 'd', cx: 60, cy: 1320, rx: 200, ry: 80, seed: 55, to: null },
  ];
  const tint = { pando: 0, a: 0.25, b: -0.15, c: 0.35, d: 0.1 };
  for (const P of PDL.patches) {
    const n = Math.round(P.rx * P.ry / 300);
    for (let i = 0; i < n; i++) {
      const a = R() * Math.PI * 2, d = Math.sqrt(R());
      const wob = 1 + 0.12 * Math.sin(a * 3 + P.seed) + 0.08 * Math.sin(a * 5 + P.seed * 2);
      const x = P.cx + Math.cos(a) * P.rx * d * wob, y = P.cy + Math.sin(a) * P.ry * d * wob;
      PDL.crowns.push({ p: P.id, x, y, r: 20 + 8 * R(), seed: Math.floor(R() * 1e6), tint: tint[P.id], delay: R(), edge: d * wob > 0.82 && Math.sin(a) > 0.2 });
    }
  }
  PDL.crowns.sort((u, v) => u.y - v.y);
  // dark firs on the slope between the patches
  for (let i = 0; i < 260; i++) {
    const x = -500 + R() * 2100, y = 820 + R() * 620;
    const inPatch = PDL.patches.some((P) => ((x - P.cx) / (P.rx * 1.05)) ** 2 + ((y - P.cy) / (P.ry * 1.1)) ** 2 < 1);
    const yTop = pdSlopeY(x);
    if (inPatch || y < yTop + 30) continue;
    PDL.firs.push({ x, y, h: 46 + 26 * R(), seed: i });
  }
  PDL.firs.sort((u, v) => u.y - v.y);
}
// the top edge of the slope (where the sky ends), world y at x
function pdSlopeY(x) { return 760 + 0.12 * (x - 540) + 40 * Math.sin(x * 0.006); }

// the season of a crown at time t: 0 green .. 1 autumn
function pdCrownSeason(cr, t, o) {
  if (cr.p === 'pando') return o.pandoGold !== undefined ? o.pandoGold(cr) : 0;
  const P = PDL.patches.find((q) => q.id === cr.p);
  if (!P.to || !o.turn || !o.turn[cr.p]) return 0;
  const spread = cr.p === 'a' ? 3.4 : 5.6;                 // other clones turn slowly, crown by crown
  const t0 = o.turn[cr.p] + spread * cr.delay;
  return clamp((t - t0) / 0.3);
}
function pdCrownCol(cr, i, k) {
  const base = PD_PAL.leafG[Math.max(0, Math.min(2, i))];
  const g = cr.tint > 0 ? mixH(base, '#9BD45A', cr.tint * 0.6) : mixH(base, '#2E7D3A', -cr.tint);
  if (cr.p === 'pando') return mixH(g, PD_PAL.leafY[i], k);
  const P = PDL.patches.find((q) => q.id === cr.p);
  return P.to ? mixH(g, i === 2 ? mixH(P.to, '#FFFFFF', 0.35) : i === 0 ? mixH(P.to, '#B85A10', 0.3) : P.to, k) : g;
}
function pdLandCrown(c, cr, t, k, lod) {
  const R = mulberry32(cr.seed);
  const n = lod ? 4 : 7;
  for (let j = 0; j < n; j++) {
    const a = R() * Math.PI * 2, d = Math.sqrt(R()) * cr.r * 0.6, ci = Math.floor(R() * 3);
    const bx = cr.x + Math.cos(a) * d, by = cr.y + Math.sin(a) * d * 0.8, br = cr.r * (0.42 + 0.2 * R());
    ellipse(c, bx, by, br, br * 0.85, pdCrownCol(cr, Math.min(2, ci + (by < cr.y ? 1 : 0)), k));
  }
  if (!lod) {
    const w = loopW(9);
    for (let j = 0; j < 4; j++) {
      const a = R() * Math.PI * 2, fl = Math.sin(t * w + R() * 6);
      ellipse(c, cr.x + Math.cos(a) * cr.r * 0.85, cr.y + Math.sin(a) * cr.r * 0.6, cr.r * 0.12, cr.r * 0.12 * (0.3 + 0.7 * Math.abs(fl)), fl > 0 ? pdCrownCol(cr, 2, k) : mixH('#E4EFD0', '#FFF4C0', k), a);
    }
  }
}
function pdFir(c, f, s = 1) {
  c.fillStyle = '#27593F';
  c.beginPath(); c.moveTo(f.x - 16 * s, f.y); c.lineTo(f.x, f.y - f.h * s); c.lineTo(f.x + 16 * s, f.y); c.closePath(); c.fill();
  c.fillStyle = '#336E4E';
  c.beginPath(); c.moveTo(f.x - 2 * s, f.y - f.h * 0.9 * s); c.lineTo(f.x + 12 * s, f.y - 4); c.lineTo(f.x + 2 * s, f.y - 4); c.closePath(); c.fill();
}

// o: {dy, season (the warm light), turn: {a: t0, b: t0}, pandoGold(cr) -> 0..1, outline: 0..1 (the lasso), outlineCol,
//     hero: {x, y, s, k} (him, tiny, hugging at the patch's edge), numbers: n (crowns numbered so far), lod}
function pdLand(cam, t, o = {}) {
  const lo = { hz: 820, dy: o.dy || 0 };
  // the sky
  screenSpace();
  const warm = o.season || 0;
  const g = ctx.createLinearGradient(0, 0, 0, H * 0.55);
  g.addColorStop(0, mixH(PD_PAL.sky1, '#5C90D8', warm * 0.4)); g.addColorStop(1, mixH(PD_PAL.sky3, '#FFE2B0', warm * 0.6));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  wkLayers(cam, lo, [
    [0.08, () => {   // the sun, low on the left in autumn light
      const sx = 120, sy = 380 + 60 * warm;
      softDot(ctx, sx, sy, 260, mixH('#FFF4C8', '#FFD08A', warm), 0.6);
      circle(ctx, sx, sy, 60, mixH('#FFFBE6', '#FFE2A8', warm));
      softDot(gctx, sx, sy, 200, '#FFE9A8', 0.9);
    }],
    [0.12, () => {
      // clouds
      const w = loopW(0.03);
      for (let i = 0; i < 4; i++) {
        const x = ((i * 430 + 50 * Math.sin(t * w + i * 2)) % 1700) - 300, y = 260 + i * 95;
        for (let j = 0; j < 5; j++) ellipse(ctx, x + j * 66 - 130, y - (j % 2) * 22, 84 - Math.abs(j - 2) * 12, 40, 'rgba(255,255,255,0.93)');
      }
    }],
    [0.2, () => {    // the far ranges
      for (const [col, amp, off, f, b] of [['#9AB0E0', 230, 0, 0.0022, 740], ['#7690CF', 150, 700, 0.0035, 790]]) {
        ctx.fillStyle = mixH(col, '#C8A2C6', 0.18 * warm);
        ctx.beginPath(); ctx.moveTo(-1600, b + 300);
        for (let x = -1600; x <= 2700; x += 40) ctx.lineTo(x, b - amp * (0.55 + 0.45 * Math.sin(x * f + off)) - 30 * Math.sin(x * f * 3.3 + off));
        ctx.lineTo(2700, b + 300); ctx.closePath(); ctx.fill();
      }
      // snow caps on the far range
      ctx.fillStyle = '#F4F8FF';
      for (let x = -1500; x <= 2600; x += 520) { const y = 740 - 230 * (0.55 + 0.45 * Math.sin(x * 0.0022)) - 30 * Math.sin(x * 0.0022 * 3.3); ellipse(ctx, x, y + 14, 46, 14, '#F4F8FF'); }
    }],
  ]);
  applyCam(cam);
  // the slope: meadow green, warming with the season
  ctx.fillStyle = mixH('#7DBA55', '#B8B455', 0.45 * warm);
  ctx.beginPath(); ctx.moveTo(-1600, 3000);
  for (let x = -1600; x <= 2700; x += 50) ctx.lineTo(x, pdSlopeY(x));
  ctx.lineTo(2700, 3000); ctx.closePath(); ctx.fill();
  // meadow texture: lighter stripes
  for (let i = 0; i < 40; i++) ellipse(ctx, -500 + hash(i * 1.3) * 2100, 900 + hash(i * 2.9) * 700, 80 + 60 * hash(i), 10, rgba('#9AD068', 0.5));
  // the firs behind, the crowns (back to front), the firs in front
  const lod = !!o.lod;
  for (const f of PDL.firs) if (f.y < 1000) pdFir(ctx, f);
  for (const cr of PDL.crowns) {
    const k = pdCrownSeason(cr, t, o);
    if (cr.edge && cr.p === 'pando') {   // white trunks showing under the crowns at the patch's lower edge
      ctx.fillStyle = PD_PAL.bark; ctx.fillRect(cr.x - 3.5, cr.y, 7, 34);
      ctx.fillStyle = PD_PAL.base; ctx.fillRect(cr.x - 3.5, cr.y + 28, 7, 6);
    }
    pdLandCrown(ctx, cr, t, k, lod);
  }
  for (const f of PDL.firs) if (f.y >= 1000) pdFir(ctx, f);
  // him, tiny, hugging a trunk at the front edge of the clone
  if (o.hero && o.hero.k > 0) {
    const h = o.hero;
    ctx.fillStyle = PD_PAL.bark; ctx.fillRect(h.x + 4 * h.s / 0.12, h.y - 150 * h.s / 0.12, 10 * h.s / 0.12, 150 * h.s / 0.12);
    drawCharacter(ctx, { x: h.x, y: h.y, s: h.s, pose: lerpPose(POSES.stand, POSES.flinch, 0.4), face: Object.assign({}, FACES.grin, { blink: 1 }) }, t);
  }
  // the lake below (Fish Lake), with the slope in its mirror
  pdLake(cam, t, warm);
  // the outline round the whole clone
  if (o.outline > 0) pdLasso(cam, t, o.outline, o.outlineCol || '#FFE36A');
  // birds
  screenSpace();
  wkFlock(t, { t0: -1.4, t1: 6, x0: 1250, y0: 520, x1: -300, y1: 430, n: 5, s: 0.7, loop: true });
  applyCam(cam);
}
const PD_SHORE = 1452;
function pdLake(cam, t, warm) {
  applyCam(cam);
  // the shore: a sandy bank with reeds
  ctx.fillStyle = mixH('#D9C48E', '#E0B070', warm * 0.3); ctx.fillRect(-1600, PD_SHORE - 16, 4300, 26);
  const g = ctx.createLinearGradient(0, PD_SHORE, 0, PD_SHORE + 700);
  g.addColorStop(0, mixH('#5AA8E6', '#6A9CD8', warm * 0.3)); g.addColorStop(1, mixH('#2E6FBE', '#3A62B0', warm * 0.3));
  ctx.fillStyle = g; ctx.fillRect(-1600, PD_SHORE, 4300, 2000);
  // the slope above the shore, mirrored in the water
  const ys = wkWaterY(cam, PD_SHORE);
  wkReflectScreen(cam, PD_SHORE, t, { h: 420, a: 0.32, tint: '#3E8FD8', tintA: 0.3, amp: 6 });
  applyCam(cam);
  // ripples: short pale dashes drifting on loop-safe clocks
  const w = loopW(0.25);
  for (let i = 0; i < 34; i++) {
    const x = -500 + hash(i * 2.3) * 2100 + 30 * Math.sin(t * w + i), y = PD_SHORE + 30 + Math.pow(hash(i * 5.1), 1.4) * 520;
    line(ctx, x - 26 - 10 * hash(i), y, x + 26 + 10 * hash(i), y, 4, rgba('#D8F0FF', 0.55));
  }
  // reeds on the bank
  for (let i = 0; i < 30; i++) {
    const x = -700 + i * 80 + 30 * hash(i * 7.1), h = 40 + 30 * hash(i * 3.3), sw = 4 * Math.sin(t * loopW(2) + i);
    line(ctx, x, PD_SHORE + 4, x + sw, PD_SHORE + 4 - h, 5, '#4F8A3A');
    if (i % 3 === 0) ellipse(ctx, x + sw, PD_SHORE + 4 - h, 5, 12, '#7A4E2A');
  }
  // a rowboat with a fisherman on the lake
  const bx = 820 + 18 * Math.sin(t * loopW(0.3)), by = PD_SHORE + 170 + 4 * Math.sin(t * loopW(1.2));
  ctx.fillStyle = '#B5653A'; ctx.beginPath(); ctx.moveTo(bx - 70, by - 10); ctx.lineTo(bx + 70, by - 10); ctx.lineTo(bx + 52, by + 14); ctx.lineTo(bx - 52, by + 14); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#E85A3A'; rrect(ctx, bx - 12, by - 52, 24, 42, 8); ctx.fill();
  circle(ctx, bx, by - 64, 13, '#F2B892'); ctx.fillStyle = '#2E5A8E'; ctx.fillRect(bx - 15, by - 80, 30, 9);
  line(ctx, bx + 8, by - 40, bx + 120, by - 120, 3, '#5A3A1E'); line(ctx, bx + 120, by - 120, bx + 128, by + 10, 1.5, '#FFFFFF');
  line(ctx, bx - 70, by + 18, bx + 70, by + 18, 3, rgba('#D8F0FF', 0.7));
  // the sun's glitter
  screenSpace();
  const sun = toScreen(wkLayerCam(cam, 0.08, { hz: 820, dy: 0 }), 120, 380);
  wkGlitter(t, { x: sun[0] + 120, y0: Math.max(0, ys), y1: H, n: 30, spread: 340 });
  applyCam(cam);
}
// the glowing outline round Pando, drawn up to fraction k
function pdLasso(cam, t, k, col) {
  const P = PDL.patches[0], n = 90, m = Math.max(2, Math.floor(n * clamp(k)));
  const pts = [];
  for (let i = 0; i <= m; i++) {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2, wob = 1.08 + 0.06 * Math.sin(a * 3 + P.seed) + 0.05 * Math.sin(a * 5 + P.seed * 2);
    pts.push([P.cx + Math.cos(a) * P.rx * wob, P.cy + Math.sin(a) * P.ry * wob * 1.12]);
  }
  ctx.setLineDash([26, 16]); poly(ctx, pts, 9, col); ctx.setLineDash([]);
  poly(gctx, pts, 22, rgba('#FFE36A', 0.6));
  const e = pts[pts.length - 1]; circle(ctx, e[0], e[1], 12, '#FFFFFF'); softDot(gctx, e[0], e[1], 50, '#FFF2A0', 1);
}

// ---------------------------------------------------------------- a tag on screen (screen space): big Anton text in a pill
function pdTag(txt, x, y, k, col = '#FFD447', size = 84, rot = -0.04, sub = null) {
  if (k <= 0.001) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(x, y); ctx.rotate(rot); const s = E.outBack(clamp(k), 1.8); ctx.scale(s, s);
  ctx.font = `400 ${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + size * 0.8, h = size * 1.32 + (sub ? size * 0.5 : 0);
  rrect(ctx, -w / 2, -h / 2, w, h, size * 0.3); ctx.fillStyle = 'rgba(10,14,36,0.9)'; ctx.fill();
  ctx.lineWidth = 7; ctx.strokeStyle = col; ctx.stroke();
  ctx.fillStyle = col; ctx.fillText(txt, 0, sub ? -size * 0.2 : size * 0.04);
  if (sub) { ctx.font = `900 ${Math.round(size * 0.36)}px Montserrat`; ctx.fillStyle = '#FFFFFF'; ctx.fillText(sub, 0, size * 0.5); }
  ctx.restore();
}
// a counter on screen: a big number and a word under it
function pdCounter(n, word, x, y, k, col = '#FFD447', size = 150, pre = '') {
  if (k <= 0.001) return;
  pdTag(pre + Math.round(n).toLocaleString('en-US'), x, y, k, col, size, -0.03, word);
}

// ---------------------------------------------------------------- the balance in a meadow
// o: {th (beam angle, + = right side down), forestK (the forest clump on the left pan), whales: n (0..40, may be
//     fractional: the next one falling), hero: {x, y, s, face, look}, bark (0..1 the top whale's bark)}
const PDB = { px: 540, py: 760, arm: 430, chain: 360, pan: 300 };
function pdBalanceWorld(cam, t, o = {}) {
  screenSpace();
  const g = ctx.createLinearGradient(0, 0, 0, H * 0.6);
  g.addColorStop(0, PD_PAL.sky1); g.addColorStop(1, PD_PAL.sky3);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  wkLayers(cam, { hz: 1250, dy: o.dy || 0 }, [
    [0.12, () => {
      const w = loopW(0.03);
      for (let i = 0; i < 4; i++) {
        const x = ((i * 430 + 50 * Math.sin(t * w + i * 2)) % 1700) - 300, y = 330 + i * 110;
        for (let j = 0; j < 5; j++) ellipse(ctx, x + j * 66 - 130, y - (j % 2) * 22, 84 - Math.abs(j - 2) * 12, 40, 'rgba(255,255,255,0.93)');
      }
    }],
    [0.25, () => {
      for (const [col, amp, off, f, b] of [['#9AB0E0', 260, 0, 0.0022, 1180], ['#7690CF', 160, 700, 0.0035, 1230]]) {
        ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-1600, b + 300);
        for (let x = -1600; x <= 2700; x += 40) ctx.lineTo(x, b - amp * (0.55 + 0.45 * Math.sin(x * f + off)) - 30 * Math.sin(x * f * 3.3 + off));
        ctx.lineTo(2700, b + 300); ctx.closePath(); ctx.fill();
      }
      ctx.fillStyle = PD_PAL.fir;
      for (let x = -1600; x <= 2700; x += 30) { const h = 46 + 26 * hash(x * 0.41); ctx.beginPath(); ctx.moveTo(x - 18, 1262); ctx.lineTo(x, 1262 - h); ctx.lineTo(x + 18, 1262); ctx.closePath(); ctx.fill(); }
    }],
    [0.5, () => {   // the far aspen edge of the meadow
      ctx.fillStyle = PD_PAL.grassFar; ctx.fillRect(-1600, 1255, 4300, 2000);
      for (let x = -1500; x < 2600; x += 70) pdCrown(ctx, x, 1180 + 20 * Math.sin(x), 70, 900 + Math.floor(x), t, 0, { n: 6, leaves: 3 });
      for (let x = -1500; x < 2600; x += 70) { ctx.fillStyle = PD_PAL.bark; ctx.fillRect(x - 5, 1215, 10, 46); }
    }],
  ]);
  applyCam(cam);
  ctx.fillStyle = PD_PAL.grass; ctx.fillRect(-1600, 1640, 4300, 2000);
  ctx.fillStyle = PD_PAL.grassMid; ctx.fillRect(-1600, 1640, 4300, 14);
  for (let i = 0; i < 50; i++) { const x = -600 + hash(i * 1.7) * 2300, y = 1660 + hash(i * 3.3) * 300; line(ctx, x, y, x + 4, y - 26, 5, PD_PAL.grassDk); }
  const th = o.th || 0, P = [PDB.px, PDB.py];
  // the post and its base
  ctx.fillStyle = '#7A4E2A'; ctx.beginPath(); ctx.moveTo(PDB.px - 120, 1660); ctx.lineTo(PDB.px - 40, PDB.py + 30); ctx.lineTo(PDB.px + 40, PDB.py + 30); ctx.lineTo(PDB.px + 120, 1660); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#5E3A1E'; rrect(ctx, PDB.px - 200, 1630, 400, 50, 14); ctx.fill();
  // the beam
  const c = Math.cos(th), s = Math.sin(th);
  const ends = [[-1, 0], [1, 0]].map(([sd]) => [P[0] + sd * PDB.arm * c, P[1] + sd * PDB.arm * s]);
  line(ctx, ends[0][0], ends[0][1], ends[1][0], ends[1][1], 34, '#8A5A30');
  line(ctx, ends[0][0], ends[0][1], ends[1][0], ends[1][1], 14, '#B07A44');
  circle(ctx, P[0], P[1], 34, '#D9A441'); circle(ctx, P[0], P[1], 14, '#7A4E2A');
  paint(() => {   // a needle on the pivot that shows the tilt
    line(ctx, P[0], P[1], P[0] + Math.sin(th) * 120, P[1] - Math.cos(th) * 120, 8, '#E8443A');
  });
  // the pans hang straight down from the beam ends
  const pans = ends.map((e) => [e[0], e[1] + PDB.chain]);
  for (let i = 0; i < 2; i++) {
    const e = ends[i], p = pans[i];
    for (const dx of [-PDB.pan * 0.92, PDB.pan * 0.92]) line(ctx, e[0], e[1], p[0] + dx, p[1], 5, '#5A5A66');
  }
  // the left pan: the forest clump (ground disc, roots dangling, trunks and crowns)
  const lp = pans[0];
  if ((o.forestK || 0) > 0) pdClump(lp[0], lp[1], t, o.forestK);
  pdPan(lp[0], lp[1]);
  // the right pan: whales
  const rp = pans[1];
  pdPan(rp[0], rp[1]);
  pdWhalePile(rp[0], rp[1], t, o);
  if (o.hero) {
    const h = o.hero;
    drawCharacter(ctx, { x: h.x, y: h.y, s: h.s, pose: h.pose || POSES.stand, face: h.face || FACES.calm, headRot: h.headRot || 0 }, t);
  }
  return { pans, ends };
}
function pdPan(x, y) {
  ctx.fillStyle = '#C9CED8';
  ctx.beginPath(); ctx.moveTo(x - PDB.pan, y); ctx.quadraticCurveTo(x, y + 90, x + PDB.pan, y); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#9AA1B0'; ctx.fillRect(x - PDB.pan, y - 6, PDB.pan * 2, 12);
}
// the forest on the left pan: a mound of soil with roots hanging over the rim, a stand of trunks and crowns
function pdClump(x, y, t, k) {
  const s = 0.32;
  // roots dangling over the pan's rim
  for (let i = 0; i < 9; i++) {
    const rx = x - PDB.pan * 0.95 + i * PDB.pan * 0.24, len = 60 + 50 * hash(i * 3.3);
    poly(ctx, [[rx, y + 10], [rx + 10 * Math.sin(i), y + 10 + len * 0.5], [rx - 6, y + 10 + len]], 9, PD_PAL.root);
  }
  ctx.fillStyle = PD_PAL.soil1; ctx.beginPath(); ctx.ellipse(x, y - 4, PDB.pan * 1.05, 70, 0, Math.PI, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = PD_PAL.grass; ctx.beginPath(); ctx.ellipse(x, y - 30, PDB.pan * 1.0, 46, 0, Math.PI, 0); ctx.closePath(); ctx.fill();
  // a dome of trunks and crowns: the middle ones tallest
  const xs = [-230, -170, -110, -50, 10, 70, 130, 190, 240];
  const top = (dx) => y - 520 + 230 * Math.pow(Math.abs(dx) / 260, 2);
  for (let i = 0; i < xs.length; i++) pdTrunk(ctx, { x: x + xs[i], w: 1, seed: 600 + i * 3, eye: 0.1, lean: xs[i] * 0.0006 }, y - 40, s, t, { top: top(xs[i]) + 40, eyes: 0 });
  const cr = [-250, -200, -140, -80, -20, 40, 100, 160, 220, 260, -170, -60, 50, 150, -110, 0, 100];
  for (let i = 0; i < cr.length; i++) pdCrown(ctx, x + cr[i], top(cr[i]) - (i >= 10 ? 70 : 0) - 30 * hash(i * 2.2), i >= 10 ? 85 : 78, 300 + i, t, 0, { n: 10, leaves: 5 });
}
// blue whales: side view facing left. o: {bark 0..1: white aspen bark with eye scars and a tuft of leaves, eyes, look}
function pdWhale(c, x, y, s, rot, t, o = {}) {
  const bk = clamp(o.bark || 0);
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  const body = mixH('#4C78A8', PD_PAL.bark, bk), belly = mixH('#A9C4DC', '#FFFFFF', bk);
  // flukes
  c.fillStyle = body;
  c.beginPath(); c.moveTo(250, -6); c.quadraticCurveTo(300, -60, 330, -64); c.quadraticCurveTo(306, -14, 312, 0); c.quadraticCurveTo(306, 14, 330, 60); c.quadraticCurveTo(300, 56, 250, 6); c.closePath(); c.fill();
  // body
  c.beginPath(); c.moveTo(-250, 4);
  c.bezierCurveTo(-250, -46, -150, -58, -40, -54); c.bezierCurveTo(90, -48, 200, -22, 262, -6);
  c.lineTo(262, 6); c.bezierCurveTo(200, 24, 80, 50, -40, 50); c.bezierCurveTo(-170, 50, -250, 40, -250, 4); c.closePath(); c.fill();
  // belly and throat pleats
  c.fillStyle = belly;
  c.beginPath(); c.moveTo(-246, 14); c.bezierCurveTo(-200, 44, -80, 50, 20, 44); c.bezierCurveTo(-60, 30, -180, 26, -246, 14); c.closePath(); c.fill();
  if (bk < 0.5) { for (let i = 0; i < 5; i++) line(c, -220 + i * 8, 20 + i * 4, -40 + i * 6, 32 + i * 2, 2.5, rgba('#6F93B8', 0.9)); }
  // dorsal fin and flipper
  c.fillStyle = body;
  c.beginPath(); c.moveTo(150, -30); c.lineTo(176, -52); c.lineTo(190, -24); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(-120, 30); c.quadraticCurveTo(-100, 80, -60, 92); c.quadraticCurveTo(-80, 50, -84, 30); c.closePath(); c.fill();
  // mottles (whale) or lenticels and the dark base (bark)
  if (bk < 0.5) for (let i = 0; i < 9; i++) ellipse(c, -160 + i * 42, -26 + 10 * Math.sin(i * 2.1), 10, 5, rgba('#8DB0D2', 0.9));
  else {
    for (let i = 0; i < 14; i++) line(c, -200 + i * 30, -30 + 18 * Math.sin(i * 1.7), -184 + i * 30, -30 + 18 * Math.sin(i * 1.7), 4, PD_PAL.lent);
    c.fillStyle = PD_PAL.base; c.beginPath(); c.moveTo(214, -20); c.lineTo(236, -34); c.lineTo(250, -8); c.lineTo(262, 6); c.lineTo(240, 30); c.lineTo(214, 22); c.closePath(); c.fill();
  }
  // the eye: a whale eye, or an aspen eye scar that opens
  if (bk >= 0.5) pdEye(c, -178, -12, 34, t, { eyes: o.eyes || 0, look: o.look || [0, 0], mood: o.mood });
  else paint(() => { circle(c, -192, 4, 6, '#1B1A26'); circle(c, -194, 2, 2, '#FFFFFF'); });
  // a tuft of aspen leaves from the blowhole
  if (bk > 0.05) { line(c, -120, -50, -120, -50 - 46 * clamp(bk * 1.3), 8, '#5A4A30'); pdCrown(c, -120, -50 - 80 * clamp(bk * 1.3), 70 * clamp(bk * 1.4), 77, t, 0, { n: 12, leaves: 8 }); }
  c.restore();
}
const PD_ROWS = [6, 6, 5, 5, 5, 4, 4, 3, 2];
function pdWhalePos(x, y, r, j) { return [x + (j - (PD_ROWS[r] - 1) / 2) * 92 + (r % 2) * 12, y - 12 - r * 33]; }
// the pile on the right pan: rows of whales (40 in all), the last ones still falling in
function pdWhalePile(x, y, t, o) {
  const n = o.whales || 0;
  if (n <= 0) return;
  let idx = 0;
  const s = 0.2;
  for (let r = 0; r < PD_ROWS.length; r++) {
    for (let j = 0; j < PD_ROWS[r]; j++) {
      const k = clamp((n - idx) / 4);   // 0: not yet, 0..1: falling (over four whales' time), 1: landed
      if (k > 0) {
        const [px, py] = pdWhalePos(x, y, r, j);
        const fall = 1 - E.outBounce(k);
        pdWhale(ctx, px, py - 900 * fall, s, (hash(idx * 1.9) - 0.5) * 0.3 + fall * 0.8, t, idx === 39 && o.whaleO ? o.whaleO : {});
      }
      idx++;
    }
  }
}
