// Your HONEY Could Outlive You: the kitchen (hook, lid, aging, loop) and the breakfast on its counter.
// World units under the camera. The hero stands behind the counter: st {x 600, y 1600}, head centre (600, 1130),
// hips at 1378 under the counter's top (y 1340-1392). The jar stands at x 790, the plate at 560, the banana at 380.
'use strict';

const HN = {
  wall: '#F2DFBC', wallSh: '#E2C79C', tile: '#BFE4DC', tileSh: '#9CCFC5', grout: '#E9F6F2',
  wood: '#D9A066', woodSh: '#B97C42', woodHi: '#F0C089', cab: '#3E8C86', cabSh: '#2C6A65', cabHi: '#5FB0A8',
  honey: '#F5A623', honeyDk: '#C2650C', honeyLt: '#FFD36B', honeyHi: '#FFF4C8',
  glass: '#EAF6FA',
};
const HN_TOP = 1340, HN_EDGE = 1392, HN_ITEM_Y = 1374;   // the counter: top face from 1340 to its front edge at 1392
const HN_JAR = { x: 790, y: HN_ITEM_Y, s: 1 };
const HN_PLATE = { x: 560, y: HN_ITEM_Y + 4 };
const HN_BAN = { x: 382, y: HN_ITEM_Y - 4 };
const HN_HERO = { x: 600, y: 1600, s: 1 };

// ---------------------------------------------------------------- the room behind him
// o: {night 0..1 (the window's sky), season 0..1 (the tree outside: green, orange, bare + snow, blossom), web 0..1 (cobwebs),
//     page (float: calendar flips so far), lamp 0..1 (the pendant on), dust 0..1}
function hnKitchenBack(cam, t, o = {}) {
  applyCam(cam);
  // wall
  ctx.fillStyle = HN.wall; ctx.fillRect(-900, -600, 2900, 1800);
  ctx.fillStyle = HN.wallSh; ctx.fillRect(-900, -600, 2900, 120);
  // the backsplash tiles
  ctx.fillStyle = HN.tile; ctx.fillRect(-900, 1150, 2900, HN_TOP - 1150 + 4);
  paint(() => {
    for (let y = 1150; y < HN_TOP; y += 46) line(ctx, -900, y, 2000, y, 3, HN.grout);
    for (let r = 0, y = 1150; y < HN_TOP; y += 46, r++) for (let x = -900 + (r % 2) * 46; x < 2000; x += 92) line(ctx, x, y, x, Math.min(HN_TOP, y + 46), 3, HN.grout);
  });
  hnWindow(ctx, t, o);
  hnShelf(ctx, t, o);
  hnCalendar(ctx, 1062, 960, 1, t, o.page || 0);
  hnLamp(ctx, t, o.lamp == null ? 1 : o.lamp);
  if ((o.web || 0) > 0.01) { hnWeb(ctx, 1180, 560, 1.4, o.web, 1); hnWeb(ctx, -40, 470, 1.2, o.web * 0.9, -1); }
}
// the window on the left (x 40-420, y 500-1000): sky by day or night, a tree that turns with the seasons, curtains, a pot
function hnWindow(c, t, o) {
  const X0 = 40, X1 = 420, Y0 = 500, Y1 = 1000, n = clamp(o.night || 0), se = o.season || 0;
  // frame
  rrect(c, X0 - 26, Y0 - 26, X1 - X0 + 52, Y1 - Y0 + 52, 8); c.fillStyle = '#F7F2E8'; c.fill();
  // sky (lit from inside the glow layer a little: it is the room's daylight)
  const g = c.createLinearGradient(0, Y0, 0, Y1);
  g.addColorStop(0, mixH('#7CC6F2', '#0F1840', n)); g.addColorStop(1, mixH('#D6F0FF', '#26386E', n));
  c.fillStyle = g; c.fillRect(X0, Y0, X1 - X0, Y1 - Y0);
  if (n > 0.5) paint(() => { for (let i = 0; i < 14; i++) circle(c, X0 + 20 + (i * 73) % 340, Y0 + 20 + (i * 41) % 260, 2.5, rgba('#FFFFFF', (n - 0.5) * 1.6)); circle(c, 330, 590, 26, rgba('#FFF4D6', (n - 0.5) * 2)); });
  // hills and the tree outside
  c.fillStyle = mixH('#7FBF6A', '#2A4A3A', n); c.beginPath(); c.moveTo(X0, 900); c.quadraticCurveTo(200, 840, X1, 880); c.lineTo(X1, Y1); c.lineTo(X0, Y1); c.closePath(); c.fill();
  const leaf = se < 0.25 ? mixH('#4FA84A', '#E08A2E', se * 4) : se < 0.5 ? mixH('#E08A2E', '#8A6A50', (se - 0.25) * 4) : se < 0.75 ? '#8A6A50' : mixH('#8A6A50', '#F4B6CC', (se - 0.75) * 4);
  line(c, 150, 1000, 160, 760, 16, mixH('#6A4630', '#2E2030', n));
  line(c, 158, 820, 210, 740, 9, mixH('#6A4630', '#2E2030', n));
  if (!(se > 0.5 && se < 0.75)) for (const [x, y, rr] of [[160, 720, 70], [110, 760, 50], [220, 750, 56], [170, 790, 48]]) circle(c, x, y, rr, mixH(leaf, '#1E2A3A', n * 0.7));
  if (se > 0.5 && se < 0.8) { c.fillStyle = 'rgba(255,255,255,0.9)'; c.fillRect(X0, 960, X1 - X0, 40); }   // snow on the ground
  // daylight into the room (glow layer)
  gctx.save(); gctx.globalAlpha = 0.35 * (1 - n); gctx.fillStyle = '#FFF6E0'; gctx.fillRect(X0, Y0, X1 - X0, Y1 - Y0); gctx.restore();
  // the bars
  line(c, (X0 + X1) / 2, Y0, (X0 + X1) / 2, Y1, 14, '#F7F2E8');
  line(c, X0, (Y0 + Y1) / 2, X1, (Y0 + Y1) / 2, 14, '#F7F2E8');
  // the sill and a pot of basil
  rrect(c, X0 - 40, Y1 + 18, X1 - X0 + 80, 26, 6); c.fillStyle = '#EDE5D5'; c.fill();
  c.beginPath(); c.moveTo(316, 1018); c.lineTo(392, 1018); c.lineTo(382, 960); c.lineTo(326, 960); c.closePath(); c.fillStyle = '#D0693A'; c.fill();
  rrect(c, 318, 950, 72, 16, 5); c.fillStyle = '#E07A48'; c.fill();
  for (let i = 0; i < 7; i++) { const a = -1.2 + i * 0.4; ellipse(c, 354 + Math.cos(a) * 26, 930 + Math.sin(a) * 18 - 14, 15, 9, i % 2 ? '#3E9E46' : '#58B85A', a); }
  // gingham curtains on both sides
  for (const s of [-1, 1]) {
    const cx = s < 0 ? X0 - 40 : X1 + 40;
    c.beginPath(); c.moveTo(cx - 46, Y0 - 50); c.lineTo(cx + 46, Y0 - 50); c.quadraticCurveTo(cx + 20 * -s, (Y0 + Y1) / 2, cx + 40 * -s, Y1 + 20);
    c.lineTo(cx - 30 * -s, Y1 + 20); c.quadraticCurveTo(cx - 50 * -s, (Y0 + Y1) / 2, cx - 46, Y0 - 50); c.closePath();
    c.fillStyle = '#E2524E'; c.fill();
    paint(() => { for (let y = Y0 - 40; y < Y1 + 10; y += 34) line(c, cx - 40, y, cx + 40, y + 8 * s, 6, 'rgba(255,255,255,0.55)'); });
  }
  rrect(c, X0 - 110, Y0 - 66, X1 - X0 + 220, 16, 8); c.fillStyle = '#8A5A34'; c.fill();
}
// the shelf on the right: spice jars, cookbooks, a little teapot
function hnShelf(c, t, o) {
  rrect(c, 760, 780, 470, 22, 4); c.fillStyle = '#9A6038'; c.fill();
  for (const [x, h, col, lid] of [[790, 74, '#C0392B', '#2B2B2B'], [840, 90, '#E1B12C', '#2B2B2B'], [890, 64, '#6AB04C', '#2B2B2B']]) {
    rrect(c, x - 20, 780 - h, 40, h, 8); c.fillStyle = HN.glass; c.fill();
    rrect(c, x - 16, 780 - h * 0.75, 32, h * 0.72, 6); c.fillStyle = col; c.fill();
    rrect(c, x - 21, 780 - h - 12, 42, 14, 4); c.fillStyle = lid; c.fill();
  }
  // books
  for (const [x, w, h, col] of [[960, 34, 140, '#3B5BA5'], [996, 30, 126, '#E2524E'], [1028, 38, 150, '#F2C14E']]) {
    rrect(c, x, 780 - h, w, h, 4); c.fillStyle = col; c.fill(); line(c, x + 6, 780 - h + 20, x + w - 6, 780 - h + 20, 4, 'rgba(255,255,255,0.6)');
  }
  // a teapot
  ellipse(c, 1140, 742, 50, 38, '#5FB0A8');
  ellipse(c, 1140, 700, 22, 8, '#4A968F');
  line(c, 1186, 730, 1214, 708, 10, '#5FB0A8');
  c.beginPath(); c.arc(1094, 738, 20, Math.PI * 0.5, Math.PI * 1.5); c.lineWidth = 9; c.strokeStyle = '#4A968F'; c.stroke();
}
// a wall calendar (centre x, y): a red band, the month; `page` counts flips (the fractional part peels the top page off)
const HN_MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
function hnCalendar(c, x, y, s, t, page) {
  const n = Math.floor(page), f = page - n;
  const W2 = 130 * s, H2 = 170 * s;
  const sheet = (m, dx, dy, rot, sc) => {
    c.save(); c.translate(x + dx, y + dy); c.rotate(rot); c.scale(sc, sc);
    rrect(c, -W2 / 2, -H2 / 2, W2, H2, 8); c.fillStyle = '#FFFFFF'; c.fill();
    rrect(c, -W2 / 2, -H2 / 2, W2, 46 * s, 8); c.fillStyle = '#E2524E'; c.fill();
    paint(() => {
      c.fillStyle = '#FFFFFF'; c.font = `900 ${30 * s}px Montserrat`; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(HN_MONTHS[((m % 12) + 12) % 12], 0, -H2 / 2 + 24 * s);
      c.fillStyle = '#3A3A48';
      for (let r = 0; r < 4; r++) for (let q = 0; q < 5; q++) circle(c, -48 * s + q * 24 * s, -20 * s + r * 26 * s, 4 * s, (r + q + m) % 7 === 0 ? '#E2524E' : '#9A9AAE');
    });
    c.restore();
  };
  circle(c, x, y - H2 / 2 - 14, 6, '#555');
  sheet(n + 1, 0, 0, 0, 1);
  if (f > 0.02) sheet(n, 120 * f * f, -140 * f + 260 * f * f, 1.2 * f, 1 - 0.3 * f);   // the page peels away
  else sheet(n, 0, 0, 0, 1);
}
// the pendant lamp over the counter (x 900): its bulb is in the glow layer
function hnLamp(c, t, on) {
  line(c, 900, -600, 900, 470, 5, '#3A3A3A');
  c.beginPath(); c.moveTo(830, 540); c.quadraticCurveTo(900, 420, 970, 540); c.closePath(); c.fillStyle = '#2F6B5A'; c.fill();
  c.beginPath(); c.ellipse(900, 540, 72, 12, 0, 0, Math.PI * 2); c.fillStyle = '#245446'; c.fill();
  circle(c, 900, 548, 18, on > 0.5 ? '#FFF2C4' : '#BDB7A0');
  if (on > 0.01) { softDot(gctx, 900, 552, 70, '#FFE2A0', 0.85 * on); softDot(gctx, 900, 640, 260, '#FFCF7A', 0.18 * on); }
}
// a corner cobweb (k 0..1 grows it); dir 1 = hanging from the right of x
function hnWeb(c, x, y, s, k, dir) {
  paint(() => {
    c.save(); c.translate(x, y); c.scale(s * dir, s);
    const R = 150 * k;   // from the corner (0, 0): spokes from pointing left (a 0) to pointing down (a pi/2)
    for (let i = 0; i < 6; i++) { const a = i * (Math.PI / 2) / 5; line(c, 0, 0, -Math.cos(a) * R, Math.sin(a) * R, 2, 'rgba(240,240,250,0.75)'); }
    for (let j = 1; j <= 4; j++) {
      c.beginPath();
      for (let i = 0; i <= 5; i++) { const a = i * (Math.PI / 2) / 5, rr = R * j / 4.2 * (1 + 0.06 * Math.sin(i * 3 + j)); c.lineTo(-Math.cos(a) * rr, Math.sin(a) * rr); }
      c.lineWidth = 1.8; c.strokeStyle = 'rgba(240,240,250,0.65)'; c.stroke();
    }
    c.restore();
  });
}

// ---------------------------------------------------------------- the counter in front of him
// o: {dust 0..1}
function hnCounter(cam, t, o = {}) {
  applyCam(cam);
  // the top face (butcher block)
  ctx.fillStyle = HN.wood; ctx.fillRect(-900, HN_TOP, 2900, HN_EDGE - HN_TOP);
  paint(() => { for (let x = -900; x < 2000; x += 70) line(ctx, x, HN_TOP + 2, x + 30, HN_EDGE - 2, 3, rgba(HN.woodSh, 0.35)); });
  // the front edge and the cabinets
  ctx.fillStyle = HN.woodSh; ctx.fillRect(-900, HN_EDGE, 2900, 22);
  ctx.fillStyle = HN.cab; ctx.fillRect(-900, HN_EDGE + 22, 2900, 1200);
  for (let x = -880; x < 2000; x += 260) {
    rrect(ctx, x, HN_EDGE + 40, 236, 560, 10); ctx.fillStyle = HN.cabHi; ctx.fill();
    rrect(ctx, x + 14, HN_EDGE + 54, 208, 532, 8); ctx.fillStyle = HN.cab; ctx.fill();
    rrect(ctx, x + 100, HN_EDGE + 80, 36, 12, 6); ctx.fillStyle = '#D9D4C7'; ctx.fill();
  }
  if ((o.dust || 0) > 0.01) paint(() => { ctx.fillStyle = `rgba(200,190,170,${0.45 * o.dust})`; ctx.fillRect(-900, HN_TOP, 2900, HN_EDGE - HN_TOP); });
}
// a red kettle on the counter (x, base y)
function hnKettle(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.moveTo(-70, 0); c.quadraticCurveTo(-80, -110, 0, -120); c.quadraticCurveTo(80, -110, 70, 0); c.closePath(); c.fillStyle = '#D9443B'; c.fill();
  ellipse(c, 0, -122, 30, 9, '#B8352E');
  circle(c, 0, -134, 10, '#2B2B2B');
  c.beginPath(); c.arc(0, -120, 54, Math.PI * 1.1, Math.PI * 1.9); c.lineWidth = 10; c.strokeStyle = '#2B2B2B'; c.stroke();
  line(c, 64, -50, 104, -84, 16, '#D9443B');
  ellipse(c, -30, -70, 12, 26, 'rgba(255,255,255,0.45)', 0.3);
  c.restore();
}

// ---------------------------------------------------------------- the breakfast
// the honey jar (base centre x, y; scale s). o: {lid 0..1 (0 = off: an open mouth with a honey surface), turn (the lid's
// thread phase), drop (y offset of the lid while it lands), glint 0..1, label = true}
function hnJar(c, x, y, s, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const Wd = 150, Hh = 176, lid = o.lid == null ? 0 : o.lid;
  // the glass body
  rrect(c, -Wd / 2, -Hh, Wd, Hh, 34); c.fillStyle = HN.glass; c.fill();
  // the honey inside
  const g = c.createLinearGradient(-Wd / 2, 0, Wd / 2, 0);
  g.addColorStop(0, HN.honeyLt); g.addColorStop(0.35, HN.honey); g.addColorStop(1, HN.honeyDk);
  rrect(c, -Wd / 2 + 7, -Hh + 30, Wd - 14, Hh - 37, 28); c.fillStyle = g; c.fill();
  // the neck and rim
  rrect(c, -Wd / 2 + 16, -Hh - 14, Wd - 32, 24, 8); c.fillStyle = '#DCEBEF'; c.fill();
  // glass highlights (paint: they sit on the glass), under the label so its lettering stays whole
  paint(() => {
    rrect(c, -Wd / 2 + 14, -Hh + 22, 12, Hh - 50, 6); c.fillStyle = 'rgba(255,255,255,0.65)'; c.fill();
    rrect(c, Wd / 2 - 28, -Hh + 40, 8, 40, 4); c.fillStyle = 'rgba(255,255,255,0.45)'; c.fill();
  });
  // the label (paper with HONEY and a bee)
  rrect(c, -Wd / 2 + 10, -Hh + 66, Wd - 20, 74, 10); c.fillStyle = '#FBF1D8'; c.fill();
  paint(() => {
    c.fillStyle = '#7A3E0A'; c.font = '900 30px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('HONEY', 0, -Hh + 92);
    // a little bee
    ellipse(c, 0, -Hh + 122, 12, 9, '#F2B705'); line(c, -4, -Hh + 114, -4, -Hh + 130, 3, '#2B2014'); line(c, 4, -Hh + 114, 4, -Hh + 130, 3, '#2B2014');
    ellipse(c, -8, -Hh + 112, 7, 5, 'rgba(220,240,255,0.95)', -0.5); ellipse(c, 8, -Hh + 112, 7, 5, 'rgba(220,240,255,0.95)', 0.5);
  });
  // the honey glows a little (it is the hero of the Short)
  softDot(gctx, 0, -Hh / 2 + 10, 120, '#FFB547', 0.22 + 0.5 * (o.glint || 0));
  // the lid: a gold metal cap with a ridged side
  if (lid > 0.01) {
    const ly = -Hh - 20 - (o.drop || 0);
    rrect(c, -Wd / 2 + 8, ly - 26, Wd - 16, 34, 9); c.fillStyle = '#D9A82E'; c.fill();
    rrect(c, -Wd / 2 + 8, ly - 26, Wd - 16, 10, 6); c.fillStyle = '#F2CC5A'; c.fill();
    paint(() => {
      const ph = ((o.turn || 0) % 1 + 1) % 1;
      for (let i = 0; i < 12; i++) { const u = (i + ph) / 12; const xx = -Wd / 2 + 14 + u * (Wd - 28); line(c, xx, ly - 12, xx, ly + 4, 3, 'rgba(140,96,20,0.6)'); }
    });
  } else {
    ellipse(c, 0, -Hh - 8, Wd / 2 - 18, 9, HN.honeyDk);   // the open mouth: honey inside
    ellipse(c, -6, -Hh - 10, Wd / 2 - 34, 5, HN.honey);
  }
  c.restore();
}
// a slice of toast (centre x, y; scale s; rot). o: {flat (0..1 lies on the plate), honey 0..1, mould 0..1, fur 0..1}
function hnToast(c, x, y, s, rot, o = {}) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s * (1 - 0.62 * (o.flat || 0)));
  const shape = (r) => {
    c.beginPath();
    c.moveTo(-62 * r, 70 * r); c.lineTo(-64 * r, -20 * r);
    c.bezierCurveTo(-96 * r, -40 * r, -78 * r, -96 * r, -30 * r, -88 * r);
    c.bezierCurveTo(-10 * r, -112 * r, 30 * r, -110 * r, 40 * r, -86 * r);
    c.bezierCurveTo(84 * r, -92 * r, 96 * r, -40 * r, 64 * r, -20 * r);
    c.lineTo(62 * r, 70 * r); c.quadraticCurveTo(0, 78 * r, -62 * r, 70 * r); c.closePath();
  };
  const m = clamp(o.mould || 0), fur = clamp(o.fur || 0);
  shape(1); c.fillStyle = mixH('#B5652A', '#4E5A44', m); c.fill();
  shape(0.84); c.fillStyle = mixH('#EDBB6A', '#7F8F68', m); c.fill();
  // toasted marks
  paint(() => { for (const [px, py] of [[-20, -30], [18, 0], [-10, 30], [24, -50]]) ellipse(c, px, py, 14, 9, rgba('#C8873E', 0.45 * (1 - m))); });
  // the honey drizzle: a glossy zigzag
  const hk = clamp(o.honey || 0);
  if (hk > 0.01) {
    c.beginPath();
    const pts = [[-44, -52], [40, -40], [-40, -14], [42, 0], [-38, 24], [36, 40]];
    const n = 1 + Math.floor(hk * (pts.length - 1));
    c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i <= Math.min(n, pts.length - 1); i++) c.lineTo(pts[i][0], pts[i][1]);
    c.lineWidth = 14; c.lineJoin = 'round'; c.lineCap = 'round'; c.strokeStyle = mixH(HN.honey, '#6A6A3A', m); c.stroke();
    c.lineWidth = 4; c.strokeStyle = rgba(HN.honeyHi, 0.8 * (1 - m)); c.stroke();
  }
  // mould: green spots that spread, then grey fur
  if (m > 0.01) for (let i = 0; i < 9; i++) {
    const px = -44 + (i * 37) % 90, py = -70 + (i * 53) % 120, rr = (6 + (i % 3) * 5) * clamp(m * 1.6 - i * 0.05);
    if (rr > 0.5) { ellipse(c, px, py, rr * 1.4, rr, '#5E8C3A'); ellipse(c, px - 2, py - 2, rr * 0.8, rr * 0.55, '#8FC25A'); }
  }
  if (fur > 0.01) paint(() => {
    for (let i = 0; i < 40; i++) { const px = -56 + (i * 29) % 112, py = -80 + (i * 47) % 140, L = 8 + 18 * fur; line(c, px, py, px + (i % 2 ? 4 : -4), py - L, 3, rgba('#D9DCD0', 0.85 * fur)); }
  });
  c.restore();
}
// a banana lying on the counter (centre x, base y); rot 0..1: yellow, spotted, brown, black and flat; flies when rotten
function hnBanana(c, x, y, s, t, rot = 0) {
  c.save(); c.translate(x, y); c.scale(s, s * (1 - 0.45 * clamp((rot - 0.6) / 0.4)));
  const col = rot < 0.35 ? mixH('#F8D838', '#E3B93A', rot / 0.35) : rot < 0.7 ? mixH('#E3B93A', '#6B4520', (rot - 0.35) / 0.35) : mixH('#6B4520', '#2E2016', (rot - 0.7) / 0.3);
  c.beginPath(); c.moveTo(-104, -40); c.quadraticCurveTo(0, 26, 104, -44); c.quadraticCurveTo(110, -38, 100, -28);
  c.quadraticCurveTo(0, 46, -98, -26); c.quadraticCurveTo(-112, -34, -104, -40); c.closePath();
  c.fillStyle = col; c.fill();
  line(c, -104, -40, -122, -54, 10, '#5A3A1A'); circle(c, 102, -38, 7, '#3A2614');
  paint(() => {
    c.beginPath(); c.moveTo(-90, -30); c.quadraticCurveTo(0, 22, 92, -34); c.lineWidth = 4; c.strokeStyle = rgba('#FFF2A0', 0.6 * (1 - rot)); c.stroke();
    if (rot > 0.15) for (let i = 0; i < 11; i++) ellipse(c, -80 + i * 16, -14 + 10 * Math.sin(i * 1.3), 4 + 3 * clamp(rot * 2 - 0.3), 3 + 2 * clamp(rot * 2 - 0.3), rgba('#4A2E14', clamp((rot - 0.15) * 3)));
  });
  c.restore();
  if (rot > 0.6) paint(() => {   // fruit flies
    for (let i = 0; i < 3; i++) { const a = t * (5 + i) + i * 2.1; circle(c, x + Math.cos(a) * (50 + 10 * i), y - 70 - 20 * i + Math.sin(a * 1.7) * 18, 4, '#20202A'); }
  });
}
// a white plate under the toast (centre x, y)
function hnPlate(c, x, y) {
  ellipse(c, x, y, 120, 20, '#E6E9F0');
  ellipse(c, x, y - 3, 96, 13, '#FFFFFF');
}
// the wooden honey dipper: the hand end at (x, y), pointing along rot (0 = down); the grooved head at the far end
function hnDipper(c, x, y, s, rot) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  rrect(c, -7, -30, 14, 120, 7); c.fillStyle = '#D9A86A'; c.fill();
  line(c, -2, -24, -2, 84, 3, 'rgba(255,240,210,0.7)');
  // the head, coated in honey
  ellipse(c, 0, 110, 26, 34, HN.honey);
  paint(() => { for (let i = -2; i <= 2; i++) line(c, -24, 110 + i * 12, 24, 110 + i * 12, 4, rgba(HN.honeyDk, 0.7)); });
  ellipse(c, -8, 100, 6, 14, rgba(HN.honeyHi, 0.85));
  c.restore();
  // where honey drips from: the head's bottom (world)
  return [x - Math.sin(rot) * 140 * s, y + Math.cos(rot) * 140 * s];
}
// the honey ribbon from a point down to a target (world), wavy and glossy; k 0..1 how far it reaches; ph its wobble clock
function hnRibbon(c, x0, y0, x1, y1, ph, k = 1) {
  if (k <= 0.01) return;
  const n = 18, pts = [];
  for (let i = 0; i <= n; i++) {
    const u = (i / n) * k;
    pts.push([lerp(x0, x1, u) + 7 * Math.sin(u * 9 + ph * 6) * u, lerp(y0, y1, u)]);
  }
  c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])));
  c.lineWidth = 11; c.lineCap = 'round'; c.strokeStyle = HN.honey; c.stroke();
  paint(() => { c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0] - 2, p[1]) : c.moveTo(p[0] - 2, p[1]))); c.lineWidth = 3; c.strokeStyle = rgba(HN.honeyHi, 0.9); c.stroke(); });
  if (k > 0.98) { ellipse(c, x1, y1 + 2, 18, 7, HN.honey); ellipse(c, x1 - 4, y1, 8, 3, rgba(HN.honeyHi, 0.8)); }
  softDot(gctx, x0, y0, 30, '#FFC060', 0.18);
}
