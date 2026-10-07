// The doctor's office (the hero in a white coat: he plays the doctor who cracked the knuckles of one hand only),
// the years going by (his hair goes grey, a counter spins, calendar pages fly), and the lightbox with two x-rays.
'use strict';

const DOC = { hx: 540, hy: 1470, hs: 1.5, deskY: 1236 };
const DOCPAL0 = Object.assign({}, PAL, { coat: '#F1F4FA', coatSh: '#BFC8DA', coatHi: '#FFFFFF', coatDk: '#8E99B3', pj: true });
let DOC_WALL = null;
// '#rrggbb' between two hex colours (the rig needs hex strings)
function hexMix(a, b, k) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (sh) => Math.round(lerp((pa >> sh) & 255, (pb >> sh) & 255, clamp(k))).toString(16).padStart(2, '0');
  return '#' + ch(16) + ch(8) + ch(0);
}

function initClinic() {
  const M = 200;
  DOC_WALL = mkCanvas(W + 2 * M, H + 2 * M);
  const c = DOC_WALL.getContext('2d');
  c.translate(M, M);
  const g = c.createLinearGradient(0, 300, 0, 1300);
  g.addColorStop(0, '#12302F'); g.addColorStop(0.55, '#1C4A46'); g.addColorStop(1, '#143532');
  c.fillStyle = g; c.fillRect(-M, -M, W + 2 * M, H + 2 * M);
  for (let x = -M; x < W + M; x += 76) { c.fillStyle = 'rgba(160,255,230,0.03)'; c.fillRect(x, -M, 34, H + 2 * M); }
  // wood panelling below
  const wg = c.createLinearGradient(0, 1040, 0, 1500); wg.addColorStop(0, '#5A3A28'); wg.addColorStop(1, '#3A2418');
  c.fillStyle = wg; c.fillRect(-M, 1040, W + 2 * M, H);
  c.fillStyle = '#7A5238'; c.fillRect(-M, 1028, W + 2 * M, 16);
  for (let x = -M; x < W + M; x += 180) { c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(x, 1044, 6, 600); }
  // a diploma (left)
  c.save(); c.translate(316, 610); c.rotate(-0.03);
  rrect(c, -112, -86, 224, 172, 8); c.fillStyle = '#6B4630'; c.fill();
  rrect(c, -98, -72, 196, 144, 4); c.fillStyle = '#F4EBD6'; c.fill();
  c.fillStyle = '#8A7A5A'; for (let i = 0; i < 4; i++) c.fillRect(-70 + (i % 2) * 10, -44 + i * 22, 140 - (i % 2) * 20, 6);
  circle(c, 56, 42, 17, '#D8341A'); circle(c, 56, 42, 10, '#F06A4A');
  c.restore();
  // an eye chart (right)
  c.save(); c.translate(792, 600); c.rotate(0.025);
  rrect(c, -92, -128, 184, 256, 8); c.fillStyle = '#F7F4EC'; c.fill(); c.lineWidth = 6; c.strokeStyle = '#2A2A3A'; c.stroke();
  c.fillStyle = '#1A1C2C'; c.textAlign = 'center'; c.textBaseline = 'middle';
  const rows = [['E', 78], ['F P', 50], ['T O Z', 36], ['L P E D', 26], ['P E C F D', 19]];
  let yy = -84;
  for (const [txt, sz] of rows) { c.font = `900 ${sz}px Montserrat`; c.fillText(txt, 0, yy); yy += sz * 0.62 + 24; }
  c.restore();
}

function clinicBack(cam, t) {
  applyCam(cam);
  ctx.drawImage(DOC_WALL, -200, -200);
  // the lamp's warm pool on the wall
  softDot(ctx, 540, 760, 620, '#FFD9A0', 0.16);
}
// the desk in front of him
function clinicDesk(cam, t) {
  const c = ctx;
  applyCam(cam);
  const g = c.createLinearGradient(0, DOC.deskY, 0, DOC.deskY + 500); g.addColorStop(0, '#7A4E32'); g.addColorStop(0.06, '#5E3A24'); g.addColorStop(1, '#2E1A10');
  c.fillStyle = g; c.fillRect(-300, DOC.deskY, W + 600, 900);
  c.fillStyle = '#9A6A46'; c.fillRect(-300, DOC.deskY, W + 600, 9);
  // a jar of lollipops
  const jx = 268, jy = DOC.deskY - 6;
  rrect(c, jx - 46, jy - 96, 92, 100, 16); c.fillStyle = 'rgba(200,235,255,0.26)'; c.fill(); c.lineWidth = 4; c.strokeStyle = 'rgba(220,245,255,0.6)'; c.stroke();
  for (const [dx, col, a] of [[-20, '#EF4638', -0.3], [4, '#FFC23A', 0.05], [24, '#1CB3A4', 0.35]]) {
    c.save(); c.translate(jx + dx, jy - 30); c.rotate(a); line(c, 0, 0, 0, -84, 5, '#F4F0E6'); circle(c, 0, -96, 17, col); circle(c, -5, -101, 5, 'rgba(255,255,255,0.6)'); c.restore();
  }
}

// ---------------------------------------------------------------- the doctor
// o: {face, age 0..1, rise 0..1 (he comes up into the frame), left: {x, y} / right: targets (rig-local) for his hands,
//     fist 0..1 (his left hand is a fist: 1 = clenched), headDX, headDY, headRot, lean, hot 0..1}
// His LEFT hand is on the right of the picture (he faces us): the rig's 'R' arm.
function docHero(cam, t, o = {}) {
  const s = DOC.hs, age = clamp(o.age || 0), rise = o.rise === undefined ? 1 : o.rise;
  const pal = Object.assign({}, DOCPAL0, { hair: hexMix('#2A1B14', '#D4D8E2', age), hairHi: hexMix('#5A4030', '#FFFFFF', age) });
  const st = { x: DOC.hx, y: DOC.hy + (1 - rise) * 560, s, face: o.face || FACES.calm, headDX: o.headDX || 0, headDY: o.headDY || 0, headRot: o.headRot || 0, noLegs: true };
  let pose = JSON.parse(JSON.stringify(POSES.stand));
  pose.lean = o.lean || 0; pose.hand = 'spread';
  const L = o.right || [-158, -392], R = o.left || [158, -400];          // screen-left wrist (his right hand), screen-right wrist (his left)
  pose = ikReach(pose, 'L', L, -1); pose = ikReach(pose, 'R', R, -1);
  const fist = clamp(o.fist === undefined ? 0 : o.fist);
  lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.clearRect(0, 0, W, H);
  camTransform(lctx, cam, 1);
  const r = drawCharacter(lctx, Object.assign({}, st, { pose }), t, pal);
  lctx.save(); lctx.translate(st.x, st.y); lctx.scale(s, s);
  // stethoscope: a tube round his neck with the chest piece hanging on his right
  lctx.lineCap = 'round'; lctx.lineJoin = 'round'; lctx.lineWidth = 9; lctx.strokeStyle = '#26304A';
  const n = r.neck;
  lctx.beginPath(); lctx.moveTo(n[0] - 34, n[1] + 6); lctx.quadraticCurveTo(n[0] - 44, n[1] + 70, n[0] - 14, n[1] + 118); lctx.stroke();
  lctx.beginPath(); lctx.moveTo(n[0] + 34, n[1] + 6); lctx.quadraticCurveTo(n[0] + 46, n[1] + 76, n[0] - 12, n[1] + 120); lctx.stroke();
  line(lctx, n[0] - 13, n[1] + 118, n[0] - 13, n[1] + 150, 9, '#26304A');
  circle(lctx, n[0] - 13, n[1] + 160, 17, '#8E99B3'); circle(lctx, n[0] - 13, n[1] + 160, 11, '#D7DEEA');
  // his left hand (screen right): a fist that squeezes when it cracks, drawn over the rig's open hand
  const w = r.wrR, d = r.armDirR, hx = w[0] + d[0] * 14, hy = w[1] + d[1] * 14;
  if (fist > 0.02) {
    const q = 1 + 0.1 * (o.hot || 0);
    lctx.save(); lctx.translate(hx, hy); lctx.scale(q, q);
    circle(lctx, 0, 0, 40, pal.skin);                                    // hide the spread fingers
    ellipse(lctx, 0, 2, 31, 28, pal.skinSh); ellipse(lctx, -1.5, 0, 28, 25, pal.skin);
    for (let i = 0; i < 4; i++) {                                         // four knuckles along the top
      const kx = -19 + i * 12.6, ky = -22 - 3 * Math.sin((i / 3) * Math.PI);
      circle(lctx, kx, ky, 8.6, pal.skinSh); circle(lctx, kx - 0.6, ky - 0.8, 7.2, pal.skin);
      line(lctx, kx - 3, ky + 7, kx + 3, ky + 7, 1.8, 'rgba(150,86,62,0.6)');
      if ((o.hot || 0) > 0.02) { lctx.save(); lctx.globalAlpha = clamp(o.hot); circle(lctx, kx, ky, 6.5, '#FFFFFF'); lctx.restore(); }
    }
    line(lctx, -27, 6, 6, 16, 12, pal.skinSh); line(lctx, -27, 5, 6, 15, 9, pal.skin);     // the thumb across the front
    lctx.restore();
  }
  // the head's extras: glasses, a moustache that comes with the years, lines on his forehead
  const hd = [r.head[0] + st.headDX, r.head[1] + st.headDY], hr = pose.lean + st.headRot;
  lctx.save(); lctx.translate(hd[0], hd[1]); lctx.rotate(hr);
  if (age > 0.05) {
    lctx.lineCap = 'round'; lctx.lineWidth = 2.6; lctx.strokeStyle = `rgba(150,86,62,${0.55 * age})`;
    for (const yy of [-44, -36]) { lctx.beginPath(); lctx.moveTo(-22, yy); lctx.quadraticCurveTo(0, yy - 3, 22, yy); lctx.stroke(); }
    const m = age;                                                         // moustache
    for (const sd of [-1, 1]) {
      lctx.beginPath(); lctx.moveTo(0, 26); lctx.quadraticCurveTo(sd * 16 * m, 20, sd * 34 * m, 30 + 4 * m); lctx.quadraticCurveTo(sd * 18 * m, 40, 0, 33); lctx.closePath();
      lctx.fillStyle = hexMix('#8A7A70', '#F2F4F8', age); lctx.fill();
    }
  }
  lctx.lineWidth = 4.5; lctx.strokeStyle = '#C9A24A';
  for (const sd of [-1, 1]) { lctx.beginPath(); lctx.arc(sd * 24, -2, 20, 0, 7); lctx.stroke(); lctx.fillStyle = 'rgba(200,240,255,0.14)'; lctx.fill(); line(lctx, sd * 44, -4, sd * 62, -8, 4, '#C9A24A'); }
  line(lctx, -4, -3, 4, -3, 4, '#C9A24A');
  lctx.restore();
  lctx.restore();
  // warm lamp light from above, the desk's shade below
  lctx.setTransform(1, 0, 0, 1, 0, 0);
  lctx.globalCompositeOperation = 'source-atop';
  const y0 = H / 2 + (DOC.hy - 760 * s - cam.y) * cam.zoom, y1 = H / 2 + (DOC.deskY - cam.y) * cam.zoom;
  const g = lctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, 'rgba(255,214,150,0.14)'); g.addColorStop(0.6, 'rgba(255,200,140,0.02)'); g.addColorStop(1, 'rgba(30,20,40,0.34)');
  lctx.fillStyle = g; lctx.fillRect(0, 0, W, H);
  lctx.globalCompositeOperation = 'source-over';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(layerC, 0, 0);
  const wp = (p) => toWorld(st, p);
  return { st, r, head: wp(hd), left: wp([hx, hy]), right: wp([r.wrL[0] + r.armDirL[0] * 14, r.wrL[1] + r.armDirL[1] * 14]) };
}

// ---------------------------------------------------------------- the years (screen space)
// a panel with the year on it, and how many times he has cracked that hand
function yearPanel(x, y, k, year, cracks, t, spin = 0) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 1.8);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.rotate(-0.02 + 0.012 * Math.sin(t * 40) * spin); ctx.scale(s, s);
  rrect(ctx, -226, -92, 452, 184, 30); ctx.fillStyle = 'rgba(8,12,34,0.94)'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#FFD447'; ctx.stroke();
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ctx.font = '900 44px Montserrat'; ctx.fillStyle = '#DCE6FF'; ctx.fillText('YEAR', -194, -32);
  ctx.font = '400 116px Anton'; ctx.fillStyle = '#FFD447'; ctx.textAlign = 'right'; ctx.fillText(String(Math.round(year)), 194, -24);
  ctx.textAlign = 'center'; ctx.font = '900 38px Montserrat'; ctx.fillStyle = '#4DFFB4'; ctx.fillText(`${fmt(cracks)} CRACKS`, 0, 56);
  ctx.restore();
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); softDot(gctx, x, y, 300, '#FFD447', 0.16 * clamp(k)); gctx.restore();
}
// calendar pages that tear off and fly (screen space): from (x, y), between t0 and t1
function flyPages(x, y, t, t0, t1, n = 16) {
  const rng = mulberry32(88);
  for (let i = 0; i < n; i++) {
    const born = lerp(t0, t1, i / n), d = t - born, a = (i % 2 ? -0.5 : -2.64) + (rng() - 0.5) * 0.7, v = 520 + rng() * 420, sp = (rng() - 0.5) * 14;
    if (d < 0 || d > 0.9) continue;
    const px = x + (i % 2 ? 246 : -246) + Math.cos(a) * v * d, py = y + Math.sin(a) * v * d + 900 * d * d, al = clamp(1.6 - d * 1.8);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(px, py); ctx.rotate(sp * d); ctx.globalAlpha = al;
    rrect(ctx, -30, -36, 60, 72, 5); ctx.fillStyle = '#F7F4EC'; ctx.fill();
    ctx.fillStyle = '#EF4638'; ctx.fillRect(-30, -36, 60, 17);
    ctx.fillStyle = '#1A1C2C'; ctx.font = '900 30px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(1 + ((i * 7) % 28)), 0, 10);
    ctx.restore();
  }
}
// a tag under a hand (screen space)
function handTag(x, y, k, text, col) {
  if (k <= 0.01) return;
  pill(x, y, text, col, k, 42);
}

// ---------------------------------------------------------------- the lightbox (screen space)
// o: {on 0..1, scanX (the magnifying glass, 0..1 across both films, or null), tickL 0..1, tickR 0..1}
const LB = { x: 540, y: 800, w: 876, h: 716, fw: 382, fh: 552 };
function bigTick(x, y, k, s = 1) {
  if (k <= 0.01) return;
  const e = lerp(2.4, 1, E.outCubic(clamp(k * 1.5))) * s;
  for (const [cc, sc] of [[gctx, 0.5], [ctx, 1]]) {
    cc.save(); cc.setTransform(sc, 0, 0, sc, 0, 0); cc.translate(x, y); cc.rotate(-0.06); cc.scale(e, e); cc.globalAlpha = clamp(k * 4) * (cc === gctx ? 0.6 : 1);
    cc.lineCap = 'round'; cc.lineJoin = 'round';
    if (cc === ctx) { cc.lineWidth = 58; cc.strokeStyle = '#06261C'; cc.beginPath(); cc.moveTo(-76, 4); cc.lineTo(-22, 58); cc.lineTo(84, -66); cc.stroke(); }
    cc.lineWidth = 36; cc.strokeStyle = '#4DFFB4'; cc.beginPath(); cc.moveTo(-76, 4); cc.lineTo(-22, 58); cc.lineTo(84, -66); cc.stroke();
    cc.restore();
  }
}
function magnifier(x, y, r, a = 1) {
  if (a <= 0.01) return;
  const c = ctx;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = a; c.translate(x, y);
  line(c, r * 0.72, r * 0.72, r * 1.7, r * 1.7, r * 0.3, '#3A2418'); line(c, r * 0.72, r * 0.72, r * 1.66, r * 1.66, r * 0.16, '#7A4E32');
  c.beginPath(); c.arc(0, 0, r, 0, 7); c.fillStyle = 'rgba(190,235,255,0.2)'; c.fill(); c.lineWidth = r * 0.16; c.strokeStyle = '#E6ECF5'; c.stroke();
  c.lineWidth = r * 0.05; c.strokeStyle = '#8E99B3'; c.beginPath(); c.arc(0, 0, r * 1.08, 0, 7); c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.7)'; c.beginPath(); c.ellipse(-r * 0.4, -r * 0.44, r * 0.26, r * 0.12, -0.7, 0, 7); c.fill();
  c.restore();
}
function lightbox(t, o = {}) {
  const c = ctx, on = clamp(o.on === undefined ? 1 : o.on), { x, y, w, h, fw, fh } = LB;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  rrect(c, x - w / 2 - 16, y - h / 2 - 16, w + 32, h + 32, 30); c.fillStyle = '#1B2233'; c.fill();
  const flick = on * (0.94 + 0.06 * Math.sin(t * 47) * (t % 1.7 < 0.12 ? 1 : 0.2));
  rrect(c, x - w / 2, y - h / 2, w, h, 20); c.fillStyle = mixHex('#27324A', '#DDEBFF', flick); c.fill();
  const films = [[x - w / 4 + 6, true], [x + w / 4 - 6, false]];
  const out = [];
  for (const [fx, flip] of films) {
    c.save(); c.translate(fx, y + 22);
    rrect(c, -fw / 2, -fh / 2, fw, fh, 14); c.fillStyle = '#050B18'; c.fill();
    c.save(); rrect(c, -fw / 2, -fh / 2, fw, fh, 14); c.clip();
    const g = c.createRadialGradient(0, 0, 20, 0, 0, 340); g.addColorStop(0, '#12365C'); g.addColorStop(1, '#040D1C'); c.fillStyle = g; c.fillRect(-fw / 2, -fh / 2, fw, fh);
    const hnd = xrHand(c, null, flip ? -8 : 8, 196, 1.34, { flip, soft: 0.7 });
    c.restore();
    // clips at the top of the film
    for (const dx of [-110, 110]) { rrect(c, dx - 20, -fh / 2 - 12, 40, 26, 6); c.fillStyle = '#8E99B3'; c.fill(); }
    c.restore();
    out.push({ x: fx, y: y + 22, mcp: hnd.mcp.map((p) => [p[0] + fx, p[1] + y + 22]) });
  }
  c.restore();
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0);
  rrect(gctx, x - w / 2, y - h / 2, w, h, 20); gctx.fillStyle = `rgba(190,220,255,${0.2 * flick})`; gctx.fill();
  for (const f of out) { gctx.globalCompositeOperation = 'destination-out'; rrect(gctx, f.x - fw / 2, f.y - fh / 2, fw, fh, 14); gctx.fillStyle = '#000'; gctx.fill(); gctx.globalCompositeOperation = 'source-over'; }
  gctx.restore();
  return out;
}
