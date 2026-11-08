// Lightning Is 5x HOTTER Than the Sun's Surface: props and the desert. Thermometers that stand on the summit, the Sun
// as a character (proud, shocked, offended, cold with a scarf), his thumbs-up beside the bolt, labels, and the dune where a
// strike melts sand into a glass root (a fulgurite).
'use strict';

// ---------------------------------------------------------------- a label pill (screen space): dark text on colour
function lsTag(txt, x, y, col, k, size = 40, rot = 0) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2);
  screenSpace();
  ctx.font = `900 ${size}px Montserrat`;
  const bw = (ctx.measureText(txt).width + size * 1.1) * s, bh = size * 1.55 * s;
  gctx.save(); gctx.translate(x, y); gctx.rotate(rot);     // a dark patch in the glow layer: the bolt's bloom stays off the label
  rrect(gctx, -bw / 2 - 12, -bh / 2 - 12, bw + 24, bh + 24, bh / 2); gctx.fillStyle = 'rgba(0,0,0,1)'; gctx.fill(); gctx.restore();
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  paint(() => {
    ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const w = ctx.measureText(txt).width + size * 1.1, h = size * 1.55;
    rrect(ctx, -w / 2 - 5, -h / 2 - 5, w + 10, h + 10, h / 2 + 5); ctx.fillStyle = '#0B0B1A'; ctx.fill();
    rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = col; ctx.fill();
    ctx.fillStyle = '#0B0B1A'; ctx.fillText(txt, 0, size * 0.04);
  });
  ctx.restore();
}

// ---------------------------------------------------------------- a thermometer standing on the ground (world)
// x: its middle; base: the ground under the bulb; len: the tube's inside length; level: the column (world units);
// cols: [bottom, top] of the liquid; glow: its glow colour
function lsThermo(x, base, len, level, cols, glow, t, o = {}) {
  const bw = 96, cw = 50, bulbY = base - 84, br = 78, bot = bulbY - br * 0.6, top = bot - len;
  // the glass tube (a dark backing so it reads against the sky, then the glass)
  rrect(ctx, x - bw / 2, top - 40, bw, bot - top + 60, bw / 2); ctx.fillStyle = 'rgba(12,16,44,0.82)'; ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(214,226,255,0.55)'; ctx.stroke();
  // ticks
  const step = o.step || 100;
  for (let y = bot, i = 0; y > top - 1; y -= step, i++) line(ctx, x + bw / 2 + 6, y, x + bw / 2 + (i % 5 ? 22 : 38), y, 4, 'rgba(210,222,255,0.5)');
  // the column
  const ly = bot - level;
  const g = ctx.createLinearGradient(0, bot, 0, Math.min(ly, bot - 1));
  g.addColorStop(0, cols[0]); g.addColorStop(1, cols[1]);
  rrect(ctx, x - cw / 2, ly, cw, bot - ly + 50, cw / 2); ctx.fillStyle = g; ctx.fill();
  rrect(gctx, x - cw / 2, ly, cw, bot - ly + 50, cw / 2); gctx.fillStyle = glow; gctx.fill();
  softDot(gctx, x, ly, 80, '#FFFFFF', 0.45);
  // a shine down the glass
  line(ctx, x - bw / 2 + 14, top - 10, x - bw / 2 + 14, bot + 10, 6, 'rgba(255,255,255,0.18)');
  // the bulb
  circle(ctx, x, bulbY, br + 9, 'rgba(214,226,255,0.55)');
  circle(ctx, x, bulbY, br, cols[0]);
  circle(gctx, x, bulbY, br * 0.9, glow);
  circle(ctx, x - br * 0.35, bulbY - br * 0.35, br * 0.22, 'rgba(255,255,255,0.45)');
  // a stand of rocks round its foot
  for (const dx of [-90, -40, 40, 95]) ellipse(ctx, x + dx, base - 6, 44, 20, '#1E2656');
  return ly;
}

// ---------------------------------------------------------------- the Sun as a character (any canvas, world units)
// o: {face: 'proud' | 'shock' | 'pout' | 'cold', scarf 0..1 (pops on), shiver 0..1, look: [-1..1, -1..1]}
function lsSun(c, x, y, r, t, o = {}) {
  const face = o.face || 'proud', sh = o.shiver || 0;
  const jx = sh * 4 * Math.sin(t * 70), jy = sh * 2 * Math.sin(t * 53);
  x += jx; y += jy;
  softDot(gctx, x, y, r * 2.3, '#FFB347', 0.42);
  softDot(c, x, y, r * 2.1, '#FF9A3C', 0.20);
  circle(gctx, x, y, r * 0.86, 'rgba(0,0,0,1)');   // a dark disc under the face so the bloom rings it, not washes it out
  actor(() => {
    c.save(); c.translate(x, y);
    for (let i = 0; i < 14; i++) {
      const a = i * Math.PI / 7 + 0.1 * Math.sin(t * 3 + i), L = r * (1.24 + 0.1 * Math.sin(t * 5 + i * 2));
      c.fillStyle = i % 2 ? '#FFB13B' : '#FFC94D';
      c.beginPath(); c.moveTo(Math.cos(a - 0.2) * r * 0.9, Math.sin(a - 0.2) * r * 0.9); c.lineTo(Math.cos(a) * L, Math.sin(a) * L);
      c.lineTo(Math.cos(a + 0.2) * r * 0.9, Math.sin(a + 0.2) * r * 0.9); c.closePath(); c.fill();
    }
    const g = c.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r);
    g.addColorStop(0, '#FFF6C8'); g.addColorStop(0.6, '#FFD15A'); g.addColorStop(1, '#FFA92E');
    c.fillStyle = g; c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill();
    c.restore();
  });
  c.save(); c.translate(x, y);
  paint(() => {
    const lx = (o.look ? o.look[0] : 0) * r * 0.06, ly = (o.look ? o.look[1] : 0) * r * 0.06;
    c.lineCap = 'round'; c.strokeStyle = '#7A2E0C'; c.lineWidth = r * 0.075;
    if (face === 'proud') {         // smug: eyes shut in a smile, chin up
      for (const s of [-1, 1]) { c.beginPath(); c.arc(s * r * 0.34, -r * 0.06, r * 0.15, 1.15 * Math.PI, 1.85 * Math.PI); c.stroke(); }
      c.beginPath(); c.arc(0, r * 0.2, r * 0.3, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke();
    } else {
      const eo = face === 'shock' ? 1.25 : face === 'cold' ? 0.8 : 1;
      for (const s of [-1, 1]) {
        ellipse(c, s * r * 0.34 + lx, -r * 0.1 + ly, r * 0.12, r * 0.15 * eo, '#2A1006');
        circle(c, s * r * 0.34 - r * 0.04 + lx, -r * 0.16 + ly, r * 0.045, '#FFFFFF');
        c.beginPath();
        if (face === 'pout') { c.moveTo(s * r * 0.54, -r * 0.4); c.lineTo(s * r * 0.17, -r * 0.31); }          // cross
        else if (face === 'cold') { c.moveTo(s * r * 0.52, -r * 0.33); c.lineTo(s * r * 0.18, -r * 0.42); }   // worried
        else { c.moveTo(s * r * 0.52, -r * 0.46); c.quadraticCurveTo(s * r * 0.34, -r * 0.56, s * r * 0.16, -r * 0.46); }
        c.stroke();
      }
      if (face === 'shock') { ellipse(c, 0, r * 0.32, r * 0.14, r * 0.18, '#5A1A08'); }
      else if (face === 'pout') { c.beginPath(); c.arc(0, r * 0.44, r * 0.2, 1.15 * Math.PI, 1.85 * Math.PI); c.stroke(); }
      else {                         // chattering teeth
        rrect(c, -r * 0.26, r * 0.22, r * 0.52, r * 0.2, r * 0.06); c.fillStyle = '#5A1A08'; c.fill();
        const chat = 0.5 + 0.5 * Math.sin(t * 60);
        rrect(c, -r * 0.24, r * 0.23, r * 0.48, r * 0.08 * (0.6 + 0.4 * chat), r * 0.03); c.fillStyle = '#FFFFFF'; c.fill();
        rrect(c, -r * 0.24, r * 0.34 - r * 0.03 * chat, r * 0.48, r * 0.07, r * 0.03); c.fillStyle = '#FFFFFF'; c.fill();
      }
    }
    ellipse(c, -r * 0.56, r * 0.16, r * 0.13, r * 0.09, rgba(face === 'cold' ? '#7FB8FF' : '#FF6E5E', 0.45));
    ellipse(c, r * 0.56, r * 0.16, r * 0.13, r * 0.09, rgba(face === 'cold' ? '#7FB8FF' : '#FF6E5E', 0.45));
  });
  const sk = o.scarf || 0;
  if (sk > 0.01) {                  // a knitted scarf, red with white stripes, wrapped under the chin, one tail hanging
    const e = E.outBack(clamp(sk), 2.2);
    c.save(); c.scale(e, e);
    rrect(c, -r * 0.92, r * 0.52, r * 1.84, r * 0.34, r * 0.17); c.fillStyle = '#E8383D'; c.fill();
    c.beginPath(); c.moveTo(r * 0.3, r * 0.7); c.lineTo(r * 0.62, r * 1.5); c.lineTo(r * 0.32, r * 1.56); c.lineTo(r * 0.06, r * 0.8); c.closePath();
    c.fillStyle = '#D02A30'; c.fill();
    paint(() => {
      for (let i = -3; i <= 3; i++) line(c, i * r * 0.24, r * 0.55, i * r * 0.24 + r * 0.06, r * 0.83, r * 0.06, 'rgba(255,255,255,0.85)');
      for (let i = 0; i < 4; i++) line(c, r * (0.34 + i * 0.07), r * (0.95 + i * 0.16), r * (0.5 + i * 0.07), r * (0.93 + i * 0.16), r * 0.05, '#FFFFFF');
    });
    c.restore();
  }
  c.restore();
}
// "brr" puffs of breath for the cold Sun (world)
function lsBrr(x, y, s, t, t0, k) {
  if (k <= 0.01) return;
  for (let i = 0; i < 3; i++) {
    const u = ((t - t0) * 1.4 + i / 3) % 1;
    softDot(ctx, x + u * 70 * s, y - u * 40 * s, (18 + u * 26) * s, '#E8F2FF', 0.5 * (1 - u) * k);
  }
}

// ---------------------------------------------------------------- his thumbs-up, big enough for the macro (any canvas)
// (x, y): the fist's middle; s: scale (1 = a fist 48 units across, the rig's hand size); side: 1 = his right hand
function lsThumbHand(c, x, y, s, pal = PAL) {
  c.save(); c.translate(x, y); c.scale(s, s);
  // sleeve cuff
  rrect(c, -30, 22, 60, 40, 14); c.fillStyle = pal.coatSh; c.fill();
  // the fist
  rrect(c, -26, -20, 52, 48, 16); c.fillStyle = pal.skin; c.fill();
  // the thumb, straight up
  rrect(c, -9, -64, 18, 52, 9); c.fillStyle = pal.skin; c.fill();
  paint(() => {
    ellipse(c, 0, -56, 6, 5, '#F7D2BC');                     // the nail
    for (const dy of [-6, 6, 18]) line(c, -20, dy, 20, dy, 2.2, pal.skinSh);   // the curled fingers
    line(c, -9, -16, -1, -12, 2, pal.skinSh);                 // the thumb's crease
  });
  c.restore();
}

// ---------------------------------------------------------------- the desert at storm dusk (world; the dune shot)
let LS_DUNE_GRAIN = null;
function lsDuneInit() {
  const c = mkCanvas(512, 512), x = c.getContext('2d'), rng = mulberry32(73);
  for (let i = 0; i < 2600; i++) {
    x.fillStyle = rng() < 0.5 ? 'rgba(255,214,150,0.25)' : 'rgba(120,64,40,0.22)';
    x.fillRect(rng() * 512, rng() * 512, 2 + rng() * 2, 2 + rng() * 2);
  }
  LS_DUNE_GRAIN = c;
}
const LS_DUNE_Y = 1310;          // the near dune's crest under the strike (world)
function lsDuneY(x, layer = 0) {
  if (layer === 0) return LS_DUNE_Y + 70 * Math.sin((x - 640) / 520) * Math.sin((x - 640) / 520) + 30 * Math.sin(x / 210);
  if (layer === 1) return 1180 + 60 * Math.sin(x / 300 + 1.2) + 20 * Math.sin(x / 120);
  return 1100 + 50 * Math.sin(x / 420 + 0.4);
}
// o: {flash, bgdy, cut (0..1: the cutaway opens under the strike), t}
function lsDune(cam, t, o = {}) {
  const f = o.flash || 0;
  lsSky(cam, t, { flash: f * 0.8, bgdy: o.bgdy, dusk: 1 });
  // the low sun's glow on the horizon, far left
  const pc = parallax(cam, 0.4); pc.y += (o.bgdy || 0) * 0.4;
  camTransform(ctx, pc, 1); camTransform(gctx, pc, 0.5);
  softDot(ctx, 120, 1090, 520, '#FF8A3C', 0.35);
  softDot(gctx, 120, 1090, 260, '#FFB15A', 0.35);
  // far dunes
  for (const [layer, p, col, colLit] of [[2, 0.55, '#8C3E46', '#B25A6A'], [1, 0.75, '#B4583C', '#D07A5A']]) {
    const q = parallax(cam, p); q.y += (o.bgdy || 0) * p;
    camTransform(ctx, q, 1);
    ctx.fillStyle = mixH(col, colLit, f * 0.4);
    ctx.beginPath(); ctx.moveTo(-1200, 3600);
    for (let x = -1200; x <= 2400; x += 24) ctx.lineTo(x, lsDuneY(x, layer));
    ctx.lineTo(2400, 3600); ctx.closePath(); ctx.fill();
  }
  // the near dune (sharp, with grain and a lit crest)
  applyCam(cam);
  const x0 = cam.x - W / 2 / cam.zoom - 100, x1 = cam.x + W / 2 / cam.zoom + 100;
  const g = ctx.createLinearGradient(0, LS_DUNE_Y - 80, 0, LS_DUNE_Y + 900);
  g.addColorStop(0, mixH('#E59A55', '#FFD39A', f * 0.35)); g.addColorStop(0.25, '#C46A3C'); g.addColorStop(1, '#6A2E2A');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(x0, 4000);
  for (let x = x0; x <= x1; x += 12) ctx.lineTo(x, lsDuneY(x, 0));
  ctx.lineTo(x1, 4000); ctx.closePath(); ctx.fill();
  // ripples on the sand
  for (let i = 0; i < 9; i++) {
    const yy = LS_DUNE_Y + 70 + i * 60;
    ctx.beginPath();
    for (let x = x0; x <= x1; x += 20) { const y = yy + 10 * Math.sin(x / 70 + i) + 40 * Math.sin((x - 640) / 520) ** 2; x === x0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,214,160,0.16)'; ctx.stroke();
  }
  ctx.beginPath();
  for (let x = x0; x <= x1; x += 12) (x === x0 ? ctx.moveTo(x, lsDuneY(x, 0)) : ctx.lineTo(x, lsDuneY(x, 0)));
  ctx.lineWidth = 5; ctx.strokeStyle = rgba('#FFE2B0', 0.45 + 0.4 * f); ctx.stroke();
  // a few desert things that belong here: a dry bush, a cactus, a half-buried skull... no: a bleached signpost
  lsCactus(ctx, 1010, lsDuneY(1010) + 10, 1.0);
  lsBush(ctx, 180, lsDuneY(180) + 8, 1.0, t);
  lsSign(ctx, 900, lsDuneY(900) + 6, t);
}
function lsCactus(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  rrect(c, -22, -230, 44, 236, 22); c.fillStyle = '#2E7A4A'; c.fill();
  rrect(c, -70, -160, 30, 90, 15); c.fillStyle = '#2E7A4A'; c.fill(); rrect(c, -70, -86, 70, 26, 13); c.fill();
  rrect(c, 40, -190, 30, 80, 15); c.fill(); rrect(c, 0, -126, 70, 26, 13); c.fill();
  paint(() => { for (let i = 0; i < 5; i++) line(c, -8 + i * 4, -220, -8 + i * 4, -10, 2, 'rgba(160,230,180,0.35)'); });
  c.restore();
}
function lsBush(c, x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI / 2 + (i - 4) * 0.28 + 0.05 * Math.sin(t * loopW(4) + i);
    line(c, 0, 0, Math.cos(a) * 90, Math.sin(a) * 80, 5, '#6A4A2E');
  }
  c.restore();
}
function lsSign(c, x, y, t) {
  rrect(c, x - 7, y - 170, 14, 176, 4); c.fillStyle = '#8A6A4A'; c.fill();
  c.save(); c.translate(x, y - 150); c.rotate(-0.08);
  rrect(c, -10, -26, 150, 52, 6); c.fillStyle = '#C9A06A'; c.fill();
  paint(() => { c.font = '900 26px Montserrat'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = '#5A3A1E'; c.fillText('DUNES', 8, 2); });
  c.restore();
}

// the glass root under the strike (world): a branching tube that grows down from (x, y); k grows it (0..1),
// heat 1 = white-orange molten, 0 = cooled dark glass; rise lifts the whole thing (pulled out); sparkle 0..1
let LS_FULG = null;
function lsFulgInit() {
  const rng = mulberry32(57);
  const branch = (x, y, ang, len, depth, out) => {
    const pts = [[x, y]];
    let a = ang, px = x, py = y;
    const n = 7;
    for (let i = 1; i <= n; i++) {
      a += (rng() - 0.5) * 0.5;
      px += Math.sin(a) * len / n; py += Math.cos(a) * len / n;
      pts.push([px, py]);
    }
    out.push({ pts, w: 26 - depth * 7, d: depth });
    if (depth < 2) {
      const nb = depth === 0 ? 4 : 2;
      for (let j = 0; j < nb; j++) {
        const at = pts[1 + Math.floor(rng() * (n - 2))];
        branch(at[0], at[1], ang + (rng() < 0.5 ? -1 : 1) * (0.5 + rng() * 0.6), len * (0.35 + rng() * 0.25), depth + 1, out);
      }
    }
  };
  LS_FULG = [];
  branch(0, 0, 0.05, 430, 0, LS_FULG);
}
function lsFulgurite(c, x, y, k, heat, t, o = {}) {
  if (k <= 0.01) return;
  const rise = o.rise || 0, rot = o.rot || 0, sc = o.s || 1;
  c.save(); c.translate(x, y - rise); c.rotate(rot); c.scale(sc, sc);
  const hot = mixH('#FFF3D0', '#FF8A2A', 1 - heat);
  const glass = '#58B49C';
  for (const seg of LS_FULG) {
    const kk = clamp(k * 1.6 - seg.d * 0.3);
    if (kk <= 0) continue;
    const m = Math.max(2, Math.floor(kk * seg.pts.length));
    const P = seg.pts.slice(0, m);
    const col = heat > 0.02 ? mixH(glass, hot, heat) : glass;
    poly(c, P, seg.w + 9, mixH('#9A6A44', '#FF7A2A', 0.6 * heat));   // the crust of fused sand on the outside
    poly(c, P, seg.w, col);
    poly(c, P, seg.w * 0.55, mixH(col, '#1F4A44', 0.45 * (1 - heat)));  // the dark hollow inside the tube
    poly(c, P, seg.w * 0.2, rgba('#E8FFF8', 0.45 + 0.35 * (1 - heat)));   // the glassy shine
    if (heat > 0.05) { poly(gctx, P, seg.w * 2.6, rgba('#FF9A3A', 0.85 * heat)); poly(gctx, P, seg.w * 0.9, rgba('#FFF2C8', heat)); }
    else if (c === ctx) poly(gctx, P, seg.w * 0.4, rgba('#9FFFE0', 0.25));
  }
  c.restore();
  if ((o.sparkle || 0) > 0.01) {
    for (let i = 0; i < 6; i++) {
      const seg = LS_FULG[i % LS_FULG.length], p = seg.pts[3 + (i % 3)];
      const tw = Math.max(0, Math.sin(t * 9 + i * 2.3));
      const sx = x + (p[0] * Math.cos(rot) - p[1] * Math.sin(rot)) * sc, sy = y - rise + (p[0] * Math.sin(rot) + p[1] * Math.cos(rot)) * sc;
      softDot(gctx, sx, sy, 26 * tw, '#FFFFFF', 0.9 * o.sparkle);
      line(ctx, sx - 16 * tw, sy, sx + 16 * tw, sy, 3, rgba('#FFFFFF', 0.9 * o.sparkle * tw));
      line(ctx, sx, sy - 16 * tw, sx, sy + 16 * tw, 3, rgba('#FFFFFF', 0.9 * o.sparkle * tw));
    }
  }
}
