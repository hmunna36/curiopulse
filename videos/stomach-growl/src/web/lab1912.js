// Stomach-growl Short: the 1912 physiology lab (Cannon & Washburn's hunger experiment), shot like old film.
// The hero plays the student in a 1912 waistcoat: a rubber tube runs from his mouth to a balloon in his stomach (an
// x-ray window shows it) and on to a tambour whose lever writes on a turning smoked drum (the kymograph); the
// professor watches. In `match` the drum's trace (squeezes) and the student's key marks (hunger pangs) line up.
// World coords 1080x1920 at zoom 1; sepia + flicker come from the shot's post (grade + oldFilm overlay).
'use strict';

const LAB = { hero: { x: 330, y: 1240, s: 1.0 }, drum: { x: 800, y: 960, r: 150, h: 380 }, tamb: [610, 1110] };
const PROF = { skin: '#E9BFA0', skinSh: '#C69274', hair: '#9A9AA4', hairSh: '#6E6E78', style: 'bald', top: '#ECE6D6', topSh: '#BDB5A0',
  extra: 'tie', tie: '#5A2A2A', mouth: '#4A1018' };
// the student's 1912 outfit: brown waistcoat (button placket) over a white shirt; bow tie drawn on top
const PAL1912 = Object.assign({}, PAL, { coat: '#7A5A3A', coatSh: '#553C24', coatHi: '#9C7A55', coatDk: '#3E2A18' });
PAL1912.pj = true;

function labRoom(cam, t) {
  const c = ctx;
  applyCam(cam);
  // panelled wall
  const g = c.createLinearGradient(0, -300, 0, 1500);
  g.addColorStop(0, '#5A3E26'); g.addColorStop(0.6, '#8A6440'); g.addColorStop(1, '#4A3220');
  c.fillStyle = g; c.fillRect(-300, -400, 1700, 1900);
  // a warm key light on the experiment
  softDot(c, 520, 1000, 640, '#FFD9A0', 0.35);
  for (let x = -300; x < 1400; x += 180) { line(c, x, -400, x, 1500, 6, 'rgba(0,0,0,0.25)'); line(c, x + 4, -400, x + 4, 1500, 2, 'rgba(255,220,170,0.06)'); }
  // chalkboard with "HUNGER?" and a squiggle
  rrect(c, 90, 330, 620, 360, 10); c.fillStyle = '#4A3A26'; c.fill();
  rrect(c, 110, 350, 580, 320, 6); c.fillStyle = '#20302A'; c.fill();
  c.font = '700 64px Montserrat'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(235,235,225,0.75)';
  c.fillText('HUNGER = ?', 150, 430);
  c.beginPath(); c.moveTo(150, 560);
  for (let x = 150; x < 640; x += 6) c.lineTo(x, 560 - 40 * Math.max(0, Math.sin((x - 150) / 40)) * (0.5 + 0.5 * Math.sin(x / 90)));
  c.lineWidth = 4; c.strokeStyle = 'rgba(235,235,225,0.6)'; c.stroke();
  // shelf with flasks
  rrect(c, 760, 380, 300, 18, 4); c.fillStyle = '#5A3E26'; c.fill();
  for (const [fx, fh, col] of [[800, 90, '#8FC6B0'], [870, 120, '#C6A86A'], [950, 70, '#B0B8D8'], [1010, 100, '#8FC6B0']]) {
    c.beginPath(); c.moveTo(fx - 8, 380 - fh); c.lineTo(fx + 8, 380 - fh); c.lineTo(fx + 8, 380 - fh * 0.5); c.lineTo(fx + 26, 380); c.lineTo(fx - 26, 380); c.lineTo(fx - 8, 380 - fh * 0.5); c.closePath();
    c.fillStyle = rgba(col, 0.55); c.fill(); c.lineWidth = 3; c.strokeStyle = 'rgba(255,255,255,0.35)'; c.stroke();
  }
  // gas lamp glow
  softDot(c, 960, 250, 220, '#FFC870', 0.16); softDot(gctx, 960, 250, 160, '#FFC870', 0.6);
  ellipse(c, 960, 250, 22, 30, '#FFE7B0');
  // the bench (table) and floor
  c.fillStyle = '#3A2614'; c.fillRect(-300, 1290, 1700, 700);
  rrect(c, 520, 1150, 620, 40, 6); c.fillStyle = '#6A4A2E'; c.fill();
  c.fillStyle = '#4A321E'; c.fillRect(540, 1190, 24, 300); c.fillRect(1090, 1190, 24, 300);
}

// the kymograph: a turning smoked drum on a stand. scroll = paper offset (px); trace(fx) gives the stylus height
// history: [{x, y}] trace points already drawn (drum-surface coords); marks: key marks [{x}]
function kymograph(x, y, r, h, scroll, t, o = {}) {
  const c = ctx;
  // stand
  rrect(c, x - 26, y + h / 2, 52, 190, 8); c.fillStyle = '#3A2A1E'; c.fill();
  rrect(c, x - 120, y + h / 2 + 170, 240, 36, 8); c.fillStyle = '#2A1E14'; c.fill();
  // drum body (smoked paper: black with a sheen)
  c.save();
  rrect(c, x - r, y - h / 2, 2 * r, h, 14); c.clip();
  const g = c.createLinearGradient(x - r, 0, x + r, 0);
  g.addColorStop(0, '#0A0A0C'); g.addColorStop(0.35, '#2A2A30'); g.addColorStop(0.55, '#16161A'); g.addColorStop(1, '#050506');
  c.fillStyle = g; c.fillRect(x - r, y - h / 2, 2 * r, h);
  // the white trace scrolling around the drum (projected: x on the drum = r*sin)
  const pts = o.trace || [];
  c.beginPath();
  let first = true;
  for (const p of pts) {
    const th = (p.x - scroll) / r;
    if (th < -1.45 || th > 1.45) { first = true; continue; }
    const px = x + Math.sin(th) * r, py = y + p.y;
    if (first) { c.moveTo(px, py); first = false; } else c.lineTo(px, py);
  }
  c.lineWidth = 4; c.strokeStyle = 'rgba(245,240,225,0.9)'; c.stroke();
  for (const m of (o.marks || [])) {
    const th = (m.x - scroll) / r;
    if (th < -1.45 || th > 1.45) continue;
    const px = x + Math.sin(th) * r;
    line(c, px, y + h * 0.36, px, y + h * 0.44, 5, 'rgba(245,240,225,0.9)');
  }
  // vertical seam lines moving (shows the turn)
  for (let k = 0; k < 6; k++) {
    const th = ((k * 1.05 - scroll / r) % 6.3 + 6.3) % 6.3 - 3.15;
    if (Math.abs(th) < 1.5) line(c, x + Math.sin(th) * r, y - h / 2, x + Math.sin(th) * r, y + h / 2, 2, `rgba(255,255,255,${0.06 * Math.cos(th)})`);
  }
  c.restore();
  // top + bottom caps
  ellipse(c, x, y - h / 2, r, 18, '#4A3A2A'); ellipse(c, x, y + h / 2, r, 18, '#2A1E14');
  ellipse(c, x, y - h / 2, r * 0.25, 6, '#8A7A5A');
}

// the student's x-ray window: a round window on his belly showing the stomach with the balloon (inflate 0..1)
function xrayWindow(cx, cy, R, t, o = {}) {
  const c = ctx, k = o.k === undefined ? 1 : o.k;
  if (k <= 0.01) return;
  c.save();
  c.beginPath(); c.arc(cx, cy, R * k, 0, Math.PI * 2); c.clip();
  c.fillStyle = 'rgba(8,20,48,0.94)'; c.fillRect(cx - R, cy - R, 2 * R, 2 * R);
  // grid
  for (let i = -4; i <= 4; i++) { line(c, cx + i * R / 4, cy - R, cx + i * R / 4, cy + R, 1.5, 'rgba(127,233,255,0.12)'); line(c, cx - R, cy + i * R / 4, cx + R, cy + i * R / 4, 1.5, 'rgba(127,233,255,0.12)'); }
  // the stomach (cyan outline) — local coords scaled to fit
  const s = R / 300;
  c.save(); c.translate(cx - STOM_C[0] * s, cy - STOM_C[1] * s); c.scale(s, s);
  stomachPath(c); c.fillStyle = 'rgba(230,110,130,0.35)'; c.fill(); c.lineWidth = 8; c.strokeStyle = 'rgba(127,233,255,0.9)'; c.stroke();
  // the squeeze (o.squeeze 0..1: a band of the wall tightens)
  if (o.squeeze) {
    const sq = o.squeeze;
    line(c, 70, -150, 225, -205, 26 * sq, rgba('#FFD447', 0.9 * sq)); line(c, 10, -95, 170, -45, 26 * sq, rgba('#FFD447', 0.7 * sq));
  }
  // the tube down the oesophagus into the stomach, the balloon at its end
  const inf = o.balloon || 0;
  c.beginPath(); c.moveTo(12, -720); c.lineTo(12, -334); c.quadraticCurveTo(60, -280, 140, -240);
  c.lineWidth = 14; c.strokeStyle = 'rgba(240,200,150,0.95)'; c.lineCap = 'round'; c.stroke();
  if (inf > 0.01) {
    const br = 24 + 66 * E.outBack(clamp(inf)) * (1 - 0.14 * (o.squeeze || 0));
    ellipse(c, 150, -225, br, br * 0.9, '#E8453C');
    ellipse(c, 150 - br * 0.3, -225 - br * 0.35, br * 0.25, br * 0.15, 'rgba(255,255,255,0.6)', -0.5);
  }
  c.restore();
  c.restore();
  // rim
  c.beginPath(); c.arc(cx, cy, R * k, 0, Math.PI * 2); c.lineWidth = 8; c.strokeStyle = 'rgba(127,233,255,0.9)'; c.stroke();
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); gctx.beginPath(); gctx.arc(cx, cy, R * k, 0, Math.PI * 2); gctx.lineWidth = 20; gctx.strokeStyle = 'rgba(127,233,255,0.4)'; gctx.stroke(); gctx.restore();
}

// a bow tie at the hero's neck (rig-local -> world through st)
function bowTie(c, st, r, col = '#7A1E2A') {
  const [nx, ny] = toWorld(st, [r.neck[0], r.neck[1] + 14]);
  const s = st.s;
  c.save(); c.translate(nx, ny); c.scale(s, s);
  c.beginPath(); c.moveTo(0, 0); c.lineTo(-30, -14); c.lineTo(-30, 14); c.closePath(); c.moveTo(0, 0); c.lineTo(30, -14); c.lineTo(30, 14); c.closePath();
  c.fillStyle = col; c.fill(); circle(c, 0, 0, 7, mixHex(col, '#000000', 0.3));
  c.restore();
}

// sepia that keeps the exposure: a 'color' blend (hue + saturation from the sepia, luminance from the frame)
function sepia(a = 0.8) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'color'; ctx.fillStyle = `rgba(170,128,76,${a})`; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';
}
// old film: scratches, dust, flicker, a gate weave. Drawn as post.overlay (screen space, after the vignette)
function oldFilm(t, a = 1) {
  const f = Math.floor(t * 30), rng = mulberry32(f * 7 + 3);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  // flicker
  const fl = 0.06 * rng() * a;
  ctx.fillStyle = `rgba(20,12,4,${fl})`; ctx.fillRect(0, 0, W, H);
  // vertical scratches
  for (let i = 0; i < 2; i++) if (rng() < 0.6) {
    const x = rng() * W;
    line(ctx, x, 0, x + (rng() - 0.5) * 20, H, 1 + rng() * 2, `rgba(255,245,220,${0.18 * a})`);
  }
  // dust specks
  for (let i = 0; i < 9; i++) circle(ctx, rng() * W, rng() * H, 1 + rng() * 4, `rgba(${rng() < 0.5 ? '20,14,8' : '255,245,225'},${0.45 * a})`);
  // a hair in the gate now and then
  if (rng() < 0.15) { ctx.beginPath(); const hx = rng() * W, hy = rng() * H; ctx.moveTo(hx, hy); ctx.bezierCurveTo(hx + 40, hy - 30, hx + 60, hy + 40, hx + 110, hy + 10); ctx.lineWidth = 2; ctx.strokeStyle = `rgba(20,14,8,${0.5 * a})`; ctx.stroke(); }
  // round-cornered gate mask
  ctx.save(); ctx.fillStyle = `rgba(10,6,2,${0.85 * a})`;
  ctx.beginPath(); ctx.rect(0, 0, W, H);
  const gx = 22, gy = 22, gw = W - 44, gh = H - 44, gr = 60;   // the gate's rounded corners (sub-path, so no rrect: it begins a new path)
  ctx.moveTo(gx + gr, gy); ctx.arcTo(gx + gw, gy, gx + gw, gy + gh, gr); ctx.arcTo(gx + gw, gy + gh, gx, gy + gh, gr);
  ctx.arcTo(gx, gy + gh, gx, gy, gr); ctx.arcTo(gx, gy, gx + gw, gy, gr); ctx.closePath();
  ctx.fill('evenodd'); ctx.restore();
}
