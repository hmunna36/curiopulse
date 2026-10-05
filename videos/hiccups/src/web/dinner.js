// Hiccups Short: the restaurant. A candlelit table for two, seen over the date's shoulder: a plum wall with an arched
// night window, a pendant lamp, a wine-red tablecloth, a candle, a rose, her glass; the hero across the table in a
// white shirt and a red bow tie (same face, hair and proportions as ever) with a tall glass of orange soda; his date
// in the foreground with her back to us (a silhouette with a bun: she reacts with her head and shoulders).
// World coords: 1080x1920 at zoom 1. Every time comes from a cue (scenes.js); nothing here is timed.
'use strict';

const DN = {
  hx: 548, seatY: 1135, hs: 1.3,        // the hero's rig origin and scale (his head centre lands at y = 768)
  tableY: 1000, tableFront: 1196,       // the table top: back edge and front edge
  candle: [300, 1066], vase: [800, 1044], wine: [915, 1150],
  date: [944, 1424],                    // her head (foreground, bottom right, back to us)
  lamp: [548, 232],
};
// the date-night outfit: a white shirt (the pj flag draws the placket and the collar) and, in dnHero's post, a bow tie
const DATEPAL = Object.assign({}, PAL, { coat: '#EFECE4', coatSh: '#B7B1C6', coatHi: '#FFFFFF', coatDk: '#948DA8' });
DATEPAL.pj = true;
const DN_GLASS = [[-40, 0], [40, 0], [31, 122], [-31, 122]];   // the soda glass: rim-centre origin, rim up
const DN_SODA = ['#FFB23E', '#FF8A1E', '#E0620C'];
let DN_WALL = null, DN_CITY = null;

function initDinner() {
  // the wall (static): wallpaper, wainscot, the arched window with a night skyline, drapes, two frames
  DN_WALL = mkCanvas(1500, 1300);
  const x = DN_WALL.getContext('2d'), rng = mulberry32(41);
  x.translate(210, 180);
  const g = x.createLinearGradient(0, -180, 0, 1120);
  g.addColorStop(0, '#150A24'); g.addColorStop(0.5, '#2B1332'); g.addColorStop(1, '#3A1935');
  x.fillStyle = g; x.fillRect(-210, -180, 1500, 1300);
  for (let i = 0; i < 420; i++) {          // wallpaper: a faint diamond pattern
    const px = -200 + (i % 28) * 54 + ((Math.floor(i / 28) % 2) * 27), py = -160 + Math.floor(i / 28) * 62;
    x.save(); x.translate(px, py); x.rotate(Math.PI / 4); x.fillStyle = `rgba(255,170,140,${0.022 + 0.014 * rng()})`; x.fillRect(-7, -7, 14, 14); x.restore();
  }
  // wainscot
  const wg = x.createLinearGradient(0, 820, 0, 1120); wg.addColorStop(0, '#2A1420'); wg.addColorStop(1, '#170A12');
  x.fillStyle = wg; x.fillRect(-210, 820, 1500, 300);
  for (let px = -190; px < 1290; px += 172) { rrect(x, px, 850, 148, 220, 8); x.lineWidth = 4; x.strokeStyle = 'rgba(255,200,160,0.07)'; x.stroke(); }
  line(x, -210, 820, 1290, 820, 9, '#4A2634');
  // the window
  const wx = 742, wy = 150, ww = 316, wh = 650;
  const arch = () => { x.beginPath(); x.moveTo(wx, wy + wh); x.lineTo(wx, wy + ww / 2); x.arc(wx + ww / 2, wy + ww / 2, ww / 2, Math.PI, 0); x.lineTo(wx + ww, wy + wh); x.closePath(); };
  x.save(); arch();
  const sg = x.createLinearGradient(0, wy, 0, wy + wh); sg.addColorStop(0, '#0B1640'); sg.addColorStop(0.7, '#1E2F74'); sg.addColorStop(1, '#3A3F8A');
  x.fillStyle = sg; x.fill(); x.clip();
  for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(255,255,255,${0.25 + 0.5 * rng()})`; x.beginPath(); x.arc(wx + rng() * ww, wy + rng() * wh * 0.5, 0.8 + rng() * 1.6, 0, 7); x.fill(); }
  DN_CITY = [];
  for (let bx = wx - 10; bx < wx + ww; ) {      // the skyline
    const bw = 34 + rng() * 44, bh = 150 + rng() * 260;
    x.fillStyle = '#0A0F2C'; x.fillRect(bx, wy + wh - bh, bw, bh);
    for (let yy = wy + wh - bh + 14; yy < wy + wh - 16; yy += 22) for (let xx = bx + 7; xx < bx + bw - 8; xx += 13) {
      if (rng() < 0.42) { x.fillStyle = rng() < 0.7 ? 'rgba(255,214,130,0.85)' : 'rgba(170,215,255,0.8)'; x.fillRect(xx, yy, 6, 9); if (rng() < 0.12) DN_CITY.push([xx + 3, yy + 4, rng()]); }
    }
    bx += bw + 3;
  }
  x.restore();
  x.lineWidth = 12; x.strokeStyle = '#1B0D1C';
  x.beginPath(); x.moveTo(wx + ww / 2, wy); x.lineTo(wx + ww / 2, wy + wh); x.moveTo(wx, wy + wh * 0.4); x.lineTo(wx + ww, wy + wh * 0.4); x.moveTo(wx, wy + wh * 0.72); x.lineTo(wx + ww, wy + wh * 0.72); x.stroke();
  arch(); x.lineWidth = 20; x.strokeStyle = '#2A1424'; x.stroke();
  rrect(x, wx - 24, wy + wh - 6, ww + 48, 26, 6); x.fillStyle = '#371B2C'; x.fill();
  // drapes
  for (const sd of [-1, 1]) {
    const ex = sd < 0 ? wx - 34 : wx + ww + 34, inn = sd < 0 ? 1 : -1;
    x.beginPath(); x.moveTo(ex - inn * 26, wy - 60); x.lineTo(ex + inn * 120, wy - 60);
    x.quadraticCurveTo(ex + inn * 130, wy + 230, ex + inn * 18, wy + 430); x.quadraticCurveTo(ex + inn * 60, wy + 560, ex + inn * 50, wy + wh + 40);
    x.lineTo(ex - inn * 30, wy + wh + 40); x.closePath();
    const dg = x.createLinearGradient(ex - inn * 30, 0, ex + inn * 120, 0); dg.addColorStop(0, '#5A1226'); dg.addColorStop(0.5, '#8C1F3A'); dg.addColorStop(1, '#4A0E20');
    x.fillStyle = dg; x.fill();
    for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(ex + inn * (8 + i * 26), wy - 50); x.quadraticCurveTo(ex + inn * (20 + i * 24), wy + 220, ex + inn * (6 + i * 5), wy + 425); x.lineWidth = 5; x.strokeStyle = 'rgba(30,4,14,0.4)'; x.stroke(); }
    rrect(x, ex - inn * 4 - 16, wy + 414, 62, 22, 9); x.fillStyle = '#D9A441'; x.fill();
  }
  rrect(x, wx - 80, wy - 84, ww + 160, 30, 10); x.fillStyle = '#2A1424'; x.fill();
  // frames on the left wall
  for (const [fx, fy, fw, fh, col] of [[70, 330, 170, 210, '#3D5E8C'], [258, 470, 128, 150, '#8C5A3D']]) {
    rrect(x, fx - 10, fy - 10, fw + 20, fh + 20, 6); x.fillStyle = '#C79A4B'; x.fill();
    rrect(x, fx, fy, fw, fh, 3); x.fillStyle = col; x.fill();
    x.save(); rrect(x, fx, fy, fw, fh, 3); x.clip();
    x.fillStyle = 'rgba(255,230,190,0.5)'; x.beginPath(); x.arc(fx + fw * 0.66, fy + fh * 0.32, fw * 0.16, 0, 7); x.fill();
    x.fillStyle = 'rgba(20,30,50,0.55)'; x.beginPath(); x.moveTo(fx, fy + fh); x.lineTo(fx + fw * 0.35, fy + fh * 0.5); x.lineTo(fx + fw * 0.6, fy + fh * 0.78); x.lineTo(fx + fw * 0.8, fy + fh * 0.6); x.lineTo(fx + fw, fy + fh); x.closePath(); x.fill();
    x.restore();
  }
}

// ---------------------------------------------------------------- the room behind him
// o: {warm 0..1 (the lamp and the candles; a hiccup makes them flinch)}
function dnBack(cam, t, o = {}) {
  applyCam(cam);
  const c = ctx, warm = o.warm === undefined ? 1 : o.warm;
  c.drawImage(DN_WALL, -210, -180);
  // the city twinkles
  for (const [px, py, ph] of DN_CITY) { const a = 0.35 + 0.35 * Math.sin(t * (1.2 + ph * 2) + ph * 20); softDot(gctx, px, py, 16, '#FFD27A', a); }
  softDot(gctx, 900, 430, 250, '#3F58C8', 0.22);
  // fairy lights along the top of the wall
  for (let i = 0; i < 15; i++) {
    const u = i / 14, px = -60 + u * 1200, py = 96 + 54 * Math.sin(Math.PI * ((u * 3) % 1)) + 10 * Math.sin(u * 9);
    const tw = 0.7 + 0.3 * Math.sin(t * 2.3 + i * 1.9);
    circle(c, px, py, 6, rgba('#FFE2A6', 0.9)); softDot(gctx, px, py, 34, '#FFC56A', 0.7 * tw * warm); softDot(c, px, py, 60, '#FFB65A', 0.10 * tw * warm);
  }
  // other tables' candles, far back
  for (const [px, py, sd] of [[86, 906, 1], [178, 938, 2], [1004, 924, 3]]) {
    const fl = 0.75 + 0.25 * vnoise(t * 7, sd);
    softDot(c, px, py, 70, '#FFB050', 0.22 * fl); softDot(gctx, px, py, 26, '#FFC870', 0.8 * fl); circle(c, px, py, 4, '#FFF0C0');
  }
  // the pendant lamp over the table, and its cone of light
  const [lx, ly] = DN.lamp;
  line(c, lx, -200, lx, ly - 60, 5, '#0D0714');
  c.save(); c.globalCompositeOperation = 'lighter';
  const cg = c.createLinearGradient(0, ly, 0, ly + 980); cg.addColorStop(0, rgba('#FFC078', 0.20 * warm)); cg.addColorStop(1, rgba('#FFC078', 0));
  c.fillStyle = cg; c.beginPath(); c.moveTo(lx - 90, ly); c.lineTo(lx + 90, ly); c.lineTo(lx + 520, ly + 980); c.lineTo(lx - 520, ly + 980); c.closePath(); c.fill();
  c.restore();
  c.beginPath(); c.moveTo(lx - 118, ly + 6); c.quadraticCurveTo(lx - 96, ly - 74, lx, ly - 82); c.quadraticCurveTo(lx + 96, ly - 74, lx + 118, ly + 6); c.closePath();
  const lg = c.createLinearGradient(lx - 118, 0, lx + 118, 0); lg.addColorStop(0, '#E0A84A'); lg.addColorStop(0.5, '#B77A24'); lg.addColorStop(1, '#6E4310');
  c.fillStyle = lg; c.fill();
  ellipse(c, lx, ly + 6, 118, 15, '#FFE9B8'); softDot(gctx, lx, ly + 14, 150, '#FFD08A', 0.85 * warm);
}

// ---------------------------------------------------------------- the table and what stands on it
function dnTable(c, t) {
  const y0 = DN.tableY, y1 = DN.tableFront;
  // the top
  c.beginPath(); c.moveTo(-70, y0 + 6); c.quadraticCurveTo(540, y0 - 16, 1150, y0 + 6); c.lineTo(1230, y1); c.quadraticCurveTo(540, y1 + 44, -150, y1); c.closePath();
  const tg = c.createLinearGradient(0, y0, 0, y1 + 30); tg.addColorStop(0, '#701A30'); tg.addColorStop(1, '#93243E');
  c.fillStyle = tg; c.fill();
  // the drop of the cloth
  c.beginPath(); c.moveTo(-150, y1); c.quadraticCurveTo(540, y1 + 44, 1230, y1); c.lineTo(1300, 2100); c.lineTo(-220, 2100); c.closePath();
  const dg = c.createLinearGradient(0, y1, 0, 1920); dg.addColorStop(0, '#6A1730'); dg.addColorStop(0.5, '#3C0C1E'); dg.addColorStop(1, '#1C050F');
  c.fillStyle = dg; c.fill();
  for (let i = 0; i < 9; i++) {           // folds
    const fx = -90 + i * 150 + 30 * Math.sin(i * 2.3), top = y1 + 22 - 20 * Math.pow((fx - 540) / 700, 2);
    const fg = c.createLinearGradient(fx - 46, 0, fx + 46, 0); fg.addColorStop(0, 'rgba(10,0,6,0)'); fg.addColorStop(0.5, 'rgba(10,0,6,0.34)'); fg.addColorStop(1, 'rgba(10,0,6,0)');
    c.fillStyle = fg; c.beginPath(); c.moveTo(fx - 30, top); c.lineTo(fx + 30, top); c.lineTo(fx + 62 + 10 * Math.sin(i), 2000); c.lineTo(fx - 62, 2000); c.closePath(); c.fill();
  }
  c.beginPath(); c.moveTo(-150, y1); c.quadraticCurveTo(540, y1 + 44, 1230, y1); c.lineWidth = 5; c.strokeStyle = 'rgba(255,170,160,0.28)'; c.stroke();
}

// a candle in a brass holder. (x, y) = the foot. o: {lit 0..1, blow -1..1 (the flame leans), smoke 0..1 (age of the wisp), jump}
function dnCandle(c, x, y, s, t, o = {}) {
  const lit = o.lit === undefined ? 1 : o.lit, blow = o.blow || 0;
  c.save(); c.translate(x, y - (o.jump || 0)); c.scale(s, s);
  ellipse(c, 0, 4, 52, 13, 'rgba(0,0,0,0.3)');
  ellipse(c, 0, 0, 46, 12, '#B98632'); ellipse(c, 0, -4, 40, 9, '#E3B458');
  rrect(c, -11, -30, 22, 28, 5); c.fillStyle = '#C8963C'; c.fill();
  const wg = c.createLinearGradient(-15, 0, 15, 0); wg.addColorStop(0, '#FFF6E2'); wg.addColorStop(0.6, '#F1E2C4'); wg.addColorStop(1, '#CDB893');
  rrect(c, -15, -168, 30, 142, 8); c.fillStyle = wg; c.fill();
  c.beginPath(); c.moveTo(-15, -150); c.quadraticCurveTo(-21, -128, -14, -112); c.lineTo(-15, -150); c.fillStyle = '#FFF6E2'; c.fill();   // a drip
  line(c, 0, -168, 2 * blow, -180, 3, '#2A1A14');
  if (lit > 0.02) {
    const fl = (0.9 + 0.14 * vnoise(t * 11, 3)) * lit, lean = blow * 26 + 3 * vnoise(t * 6, 5);
    c.save(); c.translate(0, -178); c.transform(1, 0, lean / 60, 1, 0, 0); c.scale(1 - 0.35 * Math.abs(blow), fl);
    c.beginPath(); c.moveTo(0, -62); c.bezierCurveTo(22, -30, 20, -2, 0, 4); c.bezierCurveTo(-20, -2, -22, -30, 0, -62);
    const fg = c.createRadialGradient(0, -12, 2, 0, -22, 44); fg.addColorStop(0, '#FFFBE0'); fg.addColorStop(0.4, '#FFD35A'); fg.addColorStop(1, '#FF7A1E');
    c.fillStyle = fg; c.fill();
    ellipse(c, 0, -6, 6, 10, 'rgba(120,170,255,0.55)');
    c.restore();
  }
  const sm = o.smoke || 0;
  if (sm > 0 && sm < 1) {                  // a wisp of smoke after it is blown out
    c.beginPath();
    for (let i = 0; i <= 26; i++) { const u = i / 26, py = -184 - u * 330 * Math.min(1, sm * 2.2), px = 30 * u * Math.sin(u * 7 + t * 2.4) + 40 * u * u; i ? c.lineTo(px, py) : c.moveTo(px, py); }
    c.lineWidth = 9; c.lineCap = 'round'; c.strokeStyle = `rgba(215,215,235,${0.42 * (1 - sm) * Math.min(1, sm * 8)})`; c.stroke();
    circle(c, 0, -180, 4, `rgba(255,120,40,${0.9 * (1 - Math.min(1, sm * 5))})`);
  }
  c.restore();
  if (lit > 0.02) {
    const fl = 0.85 + 0.15 * vnoise(t * 11, 3);
    softDot(gctx, x + blow * 20 * s, y - 200 * s, 120 * s, '#FFB24A', 0.9 * lit * fl);
    c.save(); c.globalCompositeOperation = 'lighter'; softDot(c, x, y - 190 * s, 520 * s, '#FF9A3C', 0.13 * lit * fl); c.restore();
  }
}

// a bud vase with a rose. (x, y) = the foot, wob = tilt
function dnVase(c, x, y, s, t, wob = 0) {
  c.save(); c.translate(x, y); c.rotate(wob); c.scale(s, s);
  ellipse(c, 0, 3, 34, 9, 'rgba(0,0,0,0.3)');
  line(c, 2, -70, -4, -196, 6, '#2E7D46');
  c.beginPath(); c.moveTo(-2, -128); c.quadraticCurveTo(-44, -150, -52, -120); c.quadraticCurveTo(-30, -112, -2, -128); c.fillStyle = '#3C9A58'; c.fill();
  c.beginPath(); c.moveTo(0, -30); c.bezierCurveTo(-30, -24, -30, -4, -22, 0); c.lineTo(22, 0); c.bezierCurveTo(30, -4, 30, -24, 0, -30);
  c.moveTo(-10, -30); c.lineTo(-8, -92); c.lineTo(12, -92); c.lineTo(10, -30); c.closePath();
  c.fillStyle = 'rgba(170,215,255,0.38)'; c.fill(); c.lineWidth = 3; c.strokeStyle = 'rgba(225,242,255,0.7)'; c.stroke();
  line(c, -15, -18, -15, -6, 3, 'rgba(255,255,255,0.6)');
  for (const [px, py, r, col] of [[-4, -214, 34, '#B8173A'], [-14, -222, 22, '#D62A50'], [8, -220, 20, '#E23C62'], [-3, -212, 12, '#8E0F2C']]) circle(c, px, py, r, col);
  c.beginPath(); c.arc(-3, -214, 20, 0.6, 4.2); c.lineWidth = 3; c.strokeStyle = 'rgba(90,6,26,0.55)'; c.stroke();
  c.restore();
  softDot(gctx, x - 4 * s, y - 214 * s, 60 * s, '#FF3A60', 0.25);
}

// her glass (rosé). (x, y) = the foot; jump lifts it, tilt rocks it
function dnWine(c, x, y, s, t, jump = 0, tilt = 0) {
  c.save(); c.translate(x, y - jump); c.rotate(tilt); c.scale(s, s);
  ellipse(c, 0, 2, 30, 8, 'rgba(0,0,0,0.28)');
  ellipse(c, 0, 0, 26, 6, 'rgba(210,235,255,0.55)'); line(c, 0, 0, 0, -62, 5, 'rgba(210,235,255,0.6)');
  c.beginPath(); c.moveTo(-34, -150); c.bezierCurveTo(-40, -92, -16, -64, 0, -62); c.bezierCurveTo(16, -64, 40, -92, 34, -150); c.closePath();
  c.fillStyle = 'rgba(190,225,255,0.16)'; c.fill();
  c.save(); c.clip(); c.fillStyle = 'rgba(255,128,150,0.8)'; c.fillRect(-44, -112 + 4 * Math.sin(t * 9) * Math.min(1, jump / 8), 88, 60); c.restore();
  c.lineWidth = 3; c.strokeStyle = 'rgba(230,245,255,0.7)'; c.stroke();
  line(c, -24, -140, -27, -104, 3, 'rgba(255,255,255,0.55)');
  c.restore();
}

// keep the part of a convex polygon where p . g >= cut
function dnClip(poly, g, cut) {
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const da = a[0] * g[0] + a[1] * g[1] - cut, db = b[0] * g[0] + b[1] * g[1] - cut;
    if (da >= 0) out.push(a);
    if ((da >= 0) !== (db >= 0)) { const u = da / (da - db); out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]); }
  }
  return out;
}
// The soda glass. (x, y) = the rim's centre, rot = its tilt, s = scale; the soda stays level whatever the tilt.
// o: {level 0..1, fizz 0..1, tad 0..1 (a tadpole looks out of it), tadLook, slosh (radians the surface is off level)}
function sodaGlass(c, x, y, s, rot, t, o = {}) {
  const level = clamp(o.level === undefined ? 0.8 : o.level), fizz = o.fizz === undefined ? 1 : o.fizz;
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  const ga = rot + (o.slosh || 0), g = [Math.sin(ga), Math.cos(ga)], pr = [g[1], -g[0]];
  const dots = DN_GLASS.map((p) => p[0] * g[0] + p[1] * g[1]), mx = Math.max(...dots), mn = Math.min(...dots);
  const cut = mx - level * (mx - mn);
  const quad = () => { c.beginPath(); DN_GLASS.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.closePath(); };
  quad(); c.fillStyle = 'rgba(190,225,255,0.14)'; c.fill();
  const liq = level > 0.01 ? dnClip(DN_GLASS, g, cut) : [];
  if (liq.length > 2) {
    c.save();
    c.beginPath(); liq.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.closePath();
    const lg = c.createLinearGradient(-40, 0, 40, 0); lg.addColorStop(0, DN_SODA[0]); lg.addColorStop(0.55, DN_SODA[1]); lg.addColorStop(1, DN_SODA[2]);
    c.fillStyle = lg; c.fill(); c.clip();
    // the tadpole, just under the surface
    const tad = o.tad || 0;
    if (tad > 0.01) {
      const d = cut + 30 - 34 * E.outBack(clamp(tad), 1.6), v = 4;
      const hx = g[0] * d + pr[0] * v, hy = g[1] * d + pr[1] * v;
      c.save(); c.translate(hx, hy); c.rotate(-rot);
      const wag = Math.sin(t * 9);
      c.beginPath(); c.moveTo(8, 14); c.quadraticCurveTo(26 + 10 * wag, 40, 10 + 16 * wag, 74); c.lineWidth = 9; c.lineCap = 'round'; c.strokeStyle = '#2F4A1C'; c.stroke();
      ellipse(c, 0, 4, 24, 21, '#3F5F24'); ellipse(c, -2, 0, 21, 17, '#5E8434');
      c.restore();
    }
    // bubbles rise against gravity
    for (let i = 0; i < 18; i++) {
      const v = -44 + 88 * hash(i * 3.1 + 1), sp = 0.5 + 0.9 * hash(i + 7), u = (hash(i * 1.7) + t * sp) % 1;
      const d = mx - u * (mx - cut), r = (1.6 + 2.6 * hash(i + 11)) * (0.6 + 0.4 * fizz);
      circle(c, g[0] * d + pr[0] * v + 2 * Math.sin(t * 9 + i), g[1] * d + pr[1] * v, r, `rgba(255,246,214,${0.75 * fizz})`);
    }
    c.restore();
    // the foam line on the surface
    const sf = liq.filter((p) => Math.abs(p[0] * g[0] + p[1] * g[1] - cut) < 0.01);
    if (sf.length >= 2) { line(c, sf[0][0], sf[0][1], sf[1][0], sf[1][1], 8, 'rgba(255,238,205,0.95)'); line(c, sf[0][0], sf[0][1], sf[1][0], sf[1][1], 3, '#FFFFFF'); }
    // ... and the tadpole's eyes above it
    const tad2 = o.tad || 0;
    if (tad2 > 0.3) {
      const d = cut + 30 - 34 * E.outBack(clamp(tad2), 1.6), k = clamp((tad2 - 0.3) * 3);
      const hx = g[0] * d + pr[0] * 4, hy = g[1] * d + pr[1] * 4, lk = o.tadLook || [0, 0];
      c.save(); c.translate(hx, hy); c.rotate(-rot); c.globalAlpha = k;
      c.beginPath(); c.arc(-2, 0, 21, Math.PI, 0); c.fillStyle = '#5E8434'; c.fill();
      for (const sd of [-1, 1]) {
        const bl = o.tadBlink ? 0.15 : 1;
        ellipse(c, sd * 10 - 2, -9, 8.5, 9.5 * bl, '#FFFFFF'); if (bl > 0.5) { circle(c, sd * 10 - 2 + lk[0] * 3, -9 + lk[1] * 3, 4.6, '#15132A'); circle(c, sd * 10 - 3.5 + lk[0] * 3, -11 + lk[1] * 3, 1.6, '#FFFFFF'); }
      }
      c.restore();
    }
  }
  quad(); c.lineWidth = 4; c.strokeStyle = 'rgba(232,246,255,0.8)'; c.lineJoin = 'round'; c.stroke();
  c.fillStyle = 'rgba(225,242,255,0.5)'; c.beginPath(); c.moveTo(-31, 122); c.lineTo(31, 122); c.lineTo(31.6, 113); c.lineTo(-31.6, 113); c.closePath(); c.fill();
  line(c, -30, 12, -25, 96, 5, 'rgba(255,255,255,0.5)');
  line(c, 26, 16, 23, 60, 3, 'rgba(255,255,255,0.3)');
  c.restore();
}

// drops of soda thrown up by a hiccup (screen space): from (x, y), started at t0
function dnSplash(x, y, t0, t, n = 16, seed = 1, v0 = 620) {
  const d = t - t0;
  if (d < 0 || d > 1.1) return;
  const rng = mulberry32(seed);
  screenSpace();
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (rng() - 0.5) * 1.9, v = v0 * (0.45 + rng() * 0.75);
    const px = x + Math.cos(a) * v * d, py = y + Math.sin(a) * v * d + 0.5 * 2500 * d * d, r = 4 + rng() * 9, al = clamp(1 - d / 1.0);
    circle(ctx, px, py, r, rgba(DN_SODA[1], 0.95 * al)); circle(ctx, px - r * 0.3, py - r * 0.3, r * 0.35, rgba('#FFE9B8', al));
    softDot(gctx, px, py, r * 3, '#FF9A3C', 0.5 * al);
  }
}

// ---------------------------------------------------------------- the date (foreground, her back to us)
// o: {rot (head tilt), dy (a flinch), shake (a laugh), k (opacity)}
function dnDate(cam, t, o = {}) {
  const z = cam.zoom, pk = 1.22;      // nearer than the table: she slides a little more than the room does when the camera moves
  const fx = W / 2 + (DN.date[0] - 540 - (cam.x - 540) * pk) * z + (cam.sx || 0) * 1.3;
  const fy = H / 2 + (DN.date[1] - 960 - (cam.y - 960) * pk) * z + (cam.sy || 0) * 1.3 + (o.dy || 0);
  if (fx - 260 * z > W + 40 || fy - 420 * z > H + 40) return;
  const c = ctx, lau = (o.shake || 0) * Math.sin(t * 26);
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = o.k === undefined ? 1 : o.k;
  c.translate(fx, fy + 5 * lau); c.scale(z, z);
  // shoulders and the dress
  c.beginPath(); c.moveTo(-330, 520); c.quadraticCurveTo(-320, 250, -150, 196 + 4 * lau); c.quadraticCurveTo(-60, 170, -52, 120); c.lineTo(62, 120);
  c.quadraticCurveTo(70, 172, 170, 200 + 4 * lau); c.quadraticCurveTo(330, 250, 340, 520); c.closePath();
  const bg = c.createLinearGradient(-330, 0, 340, 0); bg.addColorStop(0, '#6A3A2E'); bg.addColorStop(0.12, '#3A1E1E'); bg.addColorStop(1, '#170B10');
  c.fillStyle = bg; c.fill();
  c.beginPath(); c.moveTo(-330, 520); c.quadraticCurveTo(-300, 300, -130, 262); c.quadraticCurveTo(10, 300, 150, 262); c.quadraticCurveTo(320, 300, 340, 520); c.closePath();
  const dg = c.createLinearGradient(-330, 0, 340, 0); dg.addColorStop(0, '#B02A4A'); dg.addColorStop(0.2, '#6E1630'); dg.addColorStop(1, '#2A0814');
  c.fillStyle = dg; c.fill();
  for (const sx of [-112, 118]) line(c, sx, 268, sx + (sx < 0 ? 26 : -22), 186, 16, sx < 0 ? '#8E2040' : '#3E0C1C');
  // the head, all hair from here
  c.translate(0, 0); c.rotate(o.rot || 0);
  const hg = c.createRadialGradient(-70, -60, 20, 0, 0, 230); hg.addColorStop(0, '#4A2A22'); hg.addColorStop(0.5, '#2A1512'); hg.addColorStop(1, '#120808');
  c.beginPath(); c.ellipse(0, 0, 150, 172, 0, 0, Math.PI * 2); c.fillStyle = hg; c.fill();
  circle(c, 34, -178, 78, '#241210'); circle(c, 20, -196, 48, '#3A1F1A');                 // the bun
  line(c, -52, -232, 122, -138, 8, '#D9A441'); circle(c, -56, -234, 9, '#F2C866');         // a hair pin
  for (let i = 0; i < 7; i++) { c.beginPath(); c.arc(0, 0, 150 - i * 3, Math.PI * (1.02 + i * 0.012), Math.PI * (1.34 - i * 0.02)); c.lineWidth = 5; c.strokeStyle = `rgba(255,170,100,${0.22 - i * 0.025})`; c.stroke(); }
  for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(-120 + i * 44, -110); c.quadraticCurveTo(-90 + i * 40, 20, -100 + i * 42, 150); c.lineWidth = 4; c.strokeStyle = 'rgba(0,0,0,0.28)'; c.stroke(); }
  ellipse(c, -150, 18, 20, 34, '#7A4A3A'); ellipse(c, -147, 20, 10, 20, '#4A2A22');        // an ear, and its earring
  circle(c, -152, 66, 9, '#F2C866');
  c.restore();
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); softDot(gctx, fx - 152 * z, fy + 66 * z, 26 * z, '#FFD27A', 0.8 * (o.k === undefined ? 1 : o.k)); gctx.restore();
}

// ---------------------------------------------------------------- the hero at the table
function dnLayer(cam, st, t, pal, draw) {
  lctx.setTransform(1, 0, 0, 1, 0, 0);
  lctx.clearRect(0, 0, W, H);
  camTransform(lctx, cam, 1);
  const r = draw(lctx);
  lctx.setTransform(1, 0, 0, 1, 0, 0);
  lctx.globalCompositeOperation = 'source-atop';
  // the lamp from above, the candle from the lower left, shadow toward the table
  const hy = H / 2 + (st.y - 370 * st.s - cam.y) * cam.zoom, ty = H / 2 + (DN.tableY - cam.y) * cam.zoom;
  const g = lctx.createLinearGradient(0, hy - 120 * cam.zoom, 0, ty + 40);
  g.addColorStop(0, 'rgba(255,196,128,0.16)'); g.addColorStop(0.45, 'rgba(255,170,110,0.04)'); g.addColorStop(1, 'rgba(46,10,44,0.42)');
  lctx.fillStyle = g; lctx.fillRect(0, 0, W, H);
  lctx.globalCompositeOperation = 'source-over';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(layerC, 0, 0);
  return r;
}
function dnBowTie(c, x, y, s = 1, rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  for (const sd of [-1, 1]) {
    c.beginPath(); c.moveTo(0, 0); c.lineTo(sd * 36, -17); c.quadraticCurveTo(sd * 42, 0, sd * 36, 17); c.closePath();
    c.fillStyle = sd < 0 ? '#E23A54' : '#C22843'; c.fill();
    line(c, sd * 12, 0, sd * 30, 0, 2.5, 'rgba(90,10,26,0.5)');
  }
  rrect(c, -8, -9, 16, 18, 5); c.fillStyle = '#A31C36'; c.fill();
  c.restore();
}
// his hand as a fist round something (rig units), drawn on top of the head when the rig would hide it
function dnFist(c, x, y, pal, rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot);
  ellipse(c, 0, 0, 24, 21, pal.skinSh); ellipse(c, -1, -2, 21, 18, pal.skin);
  for (let i = 0; i < 3; i++) line(c, -14, -8 + i * 8, 13, -9 + i * 8, 2.2, 'rgba(160,96,70,0.55)');
  c.restore();
}
// reach with the elbow hanging down (of the two-bone IK's two answers, the one whose elbow is lower)
function dnReach(pose, side, target) {
  const a = ikReach(pose, side, target, 1), b = ikReach(pose, side, target, -1);
  return rig(a)['el' + side][1] >= rig(b)['el' + side][1] ? a : b;
}
// o: {face, mode: 'glass' | 'none', chug 0..1 (the glass is at his mouth), u (0..1 through the chug), level, tad, tadLook, tadBlink, hold: [x, y] (rig-local wrist),
//     glassRot, slosh, left: [x, y], cover 0..1 (left hand over his mouth), headDX, headDY, headRot, lean, jolt (-1..1), frizz, shrug 0..1,
//     gulp (0..1: the bob of each swallow), asTad 0..1 (he is a tadpole), tadFace: {...}}
function dnHero(cam, t, o = {}) {
  const s = DN.hs, jolt = o.jolt || 0, pal = DATEPAL;
  const st = { x: DN.hx, y: DN.seatY - 15 * jolt * s, s, face: o.face || FACES.calm, headDX: o.headDX || 0, headDY: (o.headDY || 0) - 7 * jolt, headRot: o.headRot || 0, frizz: o.frizz || 0, noLegs: true };
  let pose = JSON.parse(JSON.stringify(POSES.sit));
  pose.lean = o.lean || 0;
  const sh = (o.shrug || 0) + 0.5 * Math.max(0, jolt);
  pose.armL = { a: 0.42 + 0.2 * sh, b: -0.1 }; pose.armR = { a: 0.42, b: -0.1 };   // at rest his hands are in his lap, under the table
  const rest = rig(pose).wrL;
  let left = o.left || null;
  const cover = clamp(o.cover || 0);
  const r0 = rig(pose), hd = [r0.head[0] + st.headDX, r0.head[1] + st.headDY], hr = pose.lean + st.headRot;
  const mouth = [hd[0] - 40 * Math.sin(hr), hd[1] + 40 * Math.cos(hr)];
  if (cover > 0) { const e = E.inOutSine(cover), from = left || rest; left = [lerp(from[0], mouth[0] - 12, e) - 46 * Math.sin(Math.PI * e), lerp(from[1], mouth[1] + 6, e)]; }
  if (left) pose = dnReach(pose, 'L', left);
  // the glass: `chug` 0..1 blends from holding it (o.hold, o.glassRot) to drinking from it (the rim at his mouth)
  const mode = o.mode || 'glass', GD = 92, chug = clamp(o.chug || 0);
  let rot = 0, rim = null, wrist = null;
  if (mode === 'glass') {
    const hold = o.hold || [126, -196], hrot = o.glassRot === undefined ? -0.1 : o.glassRot;
    const crot = lerp(-1.98, -2.3, clamp(o.u || 0)) + 0.03 * (o.gulp || 0);
    const crim = [mouth[0] + 3, mouth[1] - 5], cw = [crim[0] - GD * Math.sin(crot), crim[1] + GD * Math.cos(crot)];
    const e = E.inOutSine(chug);
    rot = lerp(hrot, crot, e);
    wrist = [lerp(hold[0], cw[0], e), lerp(hold[1] - 12 * sh, cw[1], e) - 26 * Math.sin(Math.PI * e)];
    rim = [wrist[0] + GD * Math.sin(rot), wrist[1] - GD * Math.cos(rot)];
  } else wrist = o.right || [92, -116 - 12 * sh];
  pose = dnReach(pose, 'R', wrist);
  const asTad = clamp(o.asTad || 0);
  const r = dnLayer(cam, st, t, pal, (lc) => {
    if (asTad > 0.5) { dnTadHero(lc, st, t, o); return rig(pose); }
    const rr = drawCharacter(lc, Object.assign({}, st, { pose }), t, pal);
    lc.save(); lc.translate(st.x, st.y); lc.scale(st.s, st.s);
    dnBowTie(lc, rr.neck[0] + st.headDX * 0.3, rr.neck[1] + 12, 1, pose.lean);
    if (rim) {
      sodaGlass(lc, rim[0], rim[1], 1, rot, t, { level: o.level, fizz: o.fizz, tad: o.tad, tadLook: o.tadLook, tadBlink: o.tadBlink, slosh: o.slosh });
      dnFist(lc, rr.wrR[0], rr.wrR[1], pal, rot);
    }
    if (cover > 0.5) {                     // the hand over his mouth is drawn again, on top of the head
      lc.globalAlpha = clamp((cover - 0.5) * 4);
      ellipse(lc, mouth[0] - 2, mouth[1] + 4, 34, 26, pal.skinSh, -0.12); ellipse(lc, mouth[0] - 3, mouth[1] + 2, 31, 23, pal.skin, -0.12);
      for (let i = 0; i < 4; i++) line(lc, mouth[0] - 22 + i * 12, mouth[1] - 12, mouth[0] - 19 + i * 12, mouth[1] + 14, 2.2, 'rgba(160,96,70,0.55)');
      lc.globalAlpha = 1;
    }
    lc.restore();
    return rr;
  });
  const wp = (p) => toWorld(st, p);
  return { st, r, pose, mouth: wp(mouth), head: wp(hd), rim: rim ? wp(rim) : null, wrist: wp(r.wrR), rot, neck: wp(r.neck) };
}

// ---------------------------------------------------------------- he is ... part tadpole (the button)
// drawn where he sits: a big tadpole with his hair, his eyes and his bow tie. o.tadFace: {blink, lookX, lookY, mouthO, hic (-1..1)}
function dnTadHero(c, st, t, o = {}) {
  const f = o.tadFace || {}, hic = f.hic || 0;
  c.save(); c.translate(st.x, st.y); c.scale(st.s, st.s);
  const cy = -236 - 16 * hic, wag = Math.sin(t * 7.5);
  // the tail, curling up behind him to the left
  c.beginPath(); c.moveTo(-60, cy + 60);
  c.bezierCurveTo(-190, cy + 110, -250 - 16 * wag, cy - 10, -214 + 22 * wag, cy - 112);
  c.bezierCurveTo(-200 + 24 * wag, cy - 30, -150, cy + 40, -40, cy + 16); c.closePath();
  c.fillStyle = '#4F7030'; c.fill();
  c.beginPath(); c.moveTo(-70, cy + 54); c.bezierCurveTo(-180, cy + 90, -232 - 16 * wag, cy - 6, -212 + 22 * wag, cy - 100); c.lineWidth = 6; c.strokeStyle = 'rgba(200,230,150,0.35)'; c.stroke();
  // gills: three pink fronds on each cheek
  for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) {
    const a = (-0.5 + i * 0.5) + 0.12 * Math.sin(t * 6 + i + sd), bx = sd * 104, by = cy + 26 + i * 4;
    c.beginPath(); c.moveTo(bx, by); c.quadraticCurveTo(bx + sd * 30 * Math.cos(a), by + 30 * Math.sin(a) - 8, bx + sd * 52 * Math.cos(a), by + 52 * Math.sin(a));
    c.lineWidth = 12; c.lineCap = 'round'; c.strokeStyle = '#E86A8A'; c.stroke(); c.lineWidth = 5; c.strokeStyle = '#FFB0C4'; c.stroke();
  }
  // the body
  c.beginPath(); c.ellipse(0, cy, 116, 122 + 5 * hic, 0, 0, Math.PI * 2);
  const g = c.createRadialGradient(-34, cy - 44, 12, 0, cy, 150); g.addColorStop(0, '#9CBF5C'); g.addColorStop(0.55, '#6B8E3A'); g.addColorStop(1, '#3F5A22');
  c.fillStyle = g; c.fill();
  c.save(); c.clip();
  ellipse(c, 0, cy + 92, 86, 60, 'rgba(226,236,180,0.85)');
  for (let i = 0; i < 12; i++) circle(c, -90 + hash(i * 3) * 180, cy - 90 + hash(i * 5 + 1) * 110, 4 + 5 * hash(i + 9), 'rgba(50,78,28,0.4)');
  c.restore();
  // his hair
  c.save(); c.translate(0, cy - 52); c.scale(1.5, 1.34);
  c.beginPath(); c.moveTo(-66, 10); c.quadraticCurveTo(-74, -54, -30, -70); c.quadraticCurveTo(12, -88, 48, -64); c.quadraticCurveTo(76, -44, 66, 10);
  c.quadraticCurveTo(60, -22, 32, -36); c.quadraticCurveTo(2, -26, -20, -42); c.quadraticCurveTo(-52, -30, -66, 10); c.closePath();
  c.fillStyle = PAL.hair; c.fill(); line(c, -26, -58, 6, -68, 5, rgba(PAL.hairHi, 0.9));
  c.restore();
  // his eyes (bigger and wider apart), brows, a small mouth
  const bl = f.blink || 0, lx = f.lookX || 0, ly = f.lookY || 0;
  for (const sd of [-1, 1]) {
    const ex = sd * 50, ey = cy - 14;
    if (bl > 0.9) { c.beginPath(); c.moveTo(ex - 20, ey); c.quadraticCurveTo(ex, ey + 12, ex + 20, ey); c.lineWidth = 5; c.strokeStyle = '#2A3A14'; c.stroke(); }
    else {
      ellipse(c, ex, ey, 25, 28 * (1 + 0.2 * Math.abs(hic)), '#FFFFFF'); circle(c, ex + lx * 8, ey + ly * 8, 12.5, PAL.pupil); circle(c, ex + lx * 8 - 4, ey + ly * 8 - 5, 4.2, '#FFFFFF');
    }
    line(c, sd * 28, cy - 58 - 8 * Math.abs(hic), sd * 74, cy - 54 - 12 * Math.abs(hic), 8, PAL.hair);
  }
  const mo = f.mouthO || 0;
  if (mo > 0.05) ellipse(c, 0, cy + 44, 10 + 8 * mo, 8 + 14 * mo, '#3A1420');
  else { c.beginPath(); c.moveTo(-22, cy + 42); c.quadraticCurveTo(0, cy + 56, 22, cy + 42); c.lineWidth = 6; c.lineCap = 'round'; c.strokeStyle = '#2A3A14'; c.stroke(); }
  ellipse(c, -74, cy + 28, 15, 9, 'rgba(255,110,130,0.3)'); ellipse(c, 74, cy + 28, 15, 9, 'rgba(255,110,130,0.3)');
  // the collar and the bow tie
  c.beginPath(); c.moveTo(-70, cy + 102); c.quadraticCurveTo(0, cy + 138, 70, cy + 102); c.lineTo(78, cy + 132); c.quadraticCurveTo(0, cy + 166, -78, cy + 132); c.closePath(); c.fillStyle = DATEPAL.coat; c.fill();
  dnBowTie(c, 0, cy + 124, 1.15, 0.03 * wag);
  c.restore();
}

// a comic burst with a word in it (screen space). k = pop 0..1+
function hicBurst(txt, x, y, k, t, size = 150, col = '#FF5A6E', rot = 0.1) {
  if (k <= 0.01) return;
  const c = ctx, R = size * 1.25;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.translate(x, y); c.rotate(rot + 0.03 * Math.sin(t * 31)); c.scale(k, k);
  const star = (r1, r2) => { c.beginPath(); for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2, rr = (i % 2 ? r2 : r1) * (1 + 0.05 * Math.sin(i * 2.7)); c.lineTo(Math.cos(a) * rr * 1.18, Math.sin(a) * rr * 0.84); } c.closePath(); };
  star(R + 10, R * 0.74 + 10); c.fillStyle = '#0B0B1A'; c.fill();
  star(R, R * 0.74); c.fillStyle = col; c.fill();
  star(R * 0.82, R * 0.6); c.fillStyle = '#FFFFFF'; c.fill();
  c.font = `400 ${size}px Anton`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  c.lineWidth = size * 0.1; c.strokeStyle = '#0B0B1A'; c.strokeText(txt, 0, size * 0.04); c.fillStyle = col; c.fillText(txt, 0, size * 0.04);
  c.restore();
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); softDot(gctx, x, y, R * 1.5 * k, col, 0.35); gctx.restore();
}

// the whole restaurant, in order. o: {warm, hero: {...}, candle: {...}, vaseWob, wineJump, wineTilt, date: {...} | false}
function dnScene(cam, t, o = {}) {
  dnBack(cam, t, o);
  const h = dnHero(cam, t, o.hero || {});
  applyCam(cam);
  dnTable(ctx, t);
  dnVase(ctx, DN.vase[0], DN.vase[1], 1, t, o.vaseWob || 0);
  dnCandle(ctx, DN.candle[0], DN.candle[1], 1, t, o.candle || {});
  dnWine(ctx, DN.wine[0], DN.wine[1], 1, t, o.wineJump || 0, o.wineTilt || 0);
  if (h.rim) { applyCam(cam); softDot(gctx, h.rim[0], h.rim[1] + 20, 120, '#FF8A1E', 0.4 * (o.hero && o.hero.level !== undefined ? 0.4 + 0.6 * o.hero.level : 1)); }
  if (o.date !== false) dnDate(cam, t, o.date || {});
  return h;
}
