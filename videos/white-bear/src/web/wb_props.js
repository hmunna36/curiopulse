// Why Can't You NOT Think of a White Bear? Short: the props and the second cast. World or screen space as each says.
//   wbBear(c, x, y, s, t, o)      the white bear, head and shoulders, front view (head centre at x, y; s = 1: head 60 wide)
//                                 o: {wave 0..1 (the right paw up, waving), look [x, y], grin 0..1, blink, drive (paws on a wheel)}
//   wbBubble(x, y, w, h, k, tail, inner)  his thought bubble (screen space): a dark edge, a pale blue inside; inner(cx, cy, s)
//                                 draws what he is thinking, clipped to it (flat: a picture in a bubble)
//   RANGER, wbHat(c)              the guard's outfit and his ranger hat (head units)
//   wbTower(c, base, s, up)       the lookout that grows out of his hair: a post and a cabin with a BEAR WATCH sign
//   wbPoster(c, w, h, k)          the WANTED poster (centred at 0, 0; k unfolds it)
//   wbBinos(c)                    binoculars at the guard's eyes (head units)
//   wbTimer(x, y, r, v, k, fail)  the five-second countdown ring (screen space)
//   wbDeskBell(c, x, y, s, hit)   a service bell on the bench (world); hit 0..1 pushes the plunger
//   wbCar(c, x, y, s, t, o)       the red car, side view (o: {door 0..1, honk 0..1, bear 0..1 (the bear in the driver's seat)})
//   wbClock(c, x, y, s, t, on)    a camping alarm clock reading 2:00 (world)
//   wbBag(c, st, r, t, o)         the sleeping bag over him to the chin (rig space)
'use strict';

const WB_INK = '#141A36';
const BEARC = { fur: '#F8FAFF', sh: '#C8D2EA', muz: '#FFFFFF', nose: '#141A36', ear: '#D9CFE6' };

// ---------------------------------------------------------------- the bear
function wbBear(c, x, y, s, t, o = {}) {
  const wave = clamp(o.wave || 0), look = o.look || [0, 0], grin = clamp(o.grin === undefined ? 1 : o.grin), bl = o.blink || 0;
  c.save(); c.translate(x, y); c.scale(s, s);
  c.lineJoin = 'round'; c.lineCap = 'round';
  // shoulders and chest
  if (!o.noBody) {
    c.beginPath(); c.moveTo(-58, 112); c.quadraticCurveTo(-64, 46, -30, 40); c.lineTo(30, 40); c.quadraticCurveTo(64, 46, 58, 112); c.closePath();
    c.fillStyle = BEARC.fur; c.fill(); c.lineWidth = 6; c.strokeStyle = WB_INK; c.stroke();
    c.beginPath(); c.moveTo(-26, 60); c.quadraticCurveTo(0, 76, 26, 60); c.lineWidth = 4; c.strokeStyle = BEARC.sh; c.stroke();
  }
  // the waving paw (his left, screen right): from the shoulder, up and rocking
  if (wave > 0.01) {
    const a = lerp(0.2, -2.3, E.outBack(wave, 1.4)) + 0.32 * wave * Math.sin(t * 13);
    c.save(); c.translate(44, 64); c.rotate(a);
    rrect(c, -15, -4, 30, 62, 15); c.fillStyle = BEARC.fur; c.fill(); c.lineWidth = 6; c.strokeStyle = WB_INK; c.stroke();
    circle(c, 0, 56, 17, BEARC.fur); c.beginPath(); c.arc(0, 56, 17, 0, 7); c.lineWidth = 6; c.stroke();
    for (const dx of [-8, 0, 8]) circle(c, dx, 66, 3.6, BEARC.sh);
    c.restore();
  }
  // ears
  for (const sd of [-1, 1]) {
    circle(c, sd * 40, -40, 17, BEARC.fur); c.beginPath(); c.arc(sd * 40, -40, 17, 0, 7); c.lineWidth = 6; c.strokeStyle = WB_INK; c.stroke();
    circle(c, sd * 40, -39, 8, BEARC.ear);
  }
  // head
  c.beginPath(); c.ellipse(0, 0, 60, 54, 0, 0, 7);
  const g = c.createRadialGradient(-18, -20, 6, 0, 4, 66); g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.7, BEARC.fur); g.addColorStop(1, BEARC.sh);
  c.fillStyle = g; c.fill(); c.lineWidth = 6; c.strokeStyle = WB_INK; c.stroke();
  // muzzle, nose, mouth
  ellipse(c, 0, 20, 27, 20, BEARC.muz);
  c.beginPath(); c.ellipse(0, 20, 27, 20, 0, 0, 7); c.lineWidth = 3; c.strokeStyle = BEARC.sh; c.stroke();
  ellipse(c, 0, 10, 11, 8, BEARC.nose); ellipse(c, -3, 7, 4, 2.4, 'rgba(255,255,255,0.7)');
  c.beginPath(); c.moveTo(0, 18); c.lineTo(0, 24); c.lineWidth = 3.5; c.strokeStyle = WB_INK; c.stroke();
  c.beginPath(); c.moveTo(-14, 24); c.quadraticCurveTo(-7, 24 + 12 * grin, 0, 24); c.quadraticCurveTo(7, 24 + 12 * grin, 14, 24); c.stroke();
  if (grin > 0.6) { c.beginPath(); c.moveTo(-6, 27); c.quadraticCurveTo(0, 38, 6, 27); c.fillStyle = '#E86A7A'; c.fill(); }
  // eyes (and their shine), cheeks
  for (const sd of [-1, 1]) {
    const ex = sd * 22 + look[0] * 3, ey = -10 + look[1] * 3;
    if (bl > 0.5) { c.beginPath(); c.moveTo(ex - 7, ey); c.quadraticCurveTo(ex, ey - 6, ex + 7, ey); c.lineWidth = 4; c.strokeStyle = WB_INK; c.stroke(); }
    else { circle(c, ex, ey, 7.5, WB_INK); circle(c, ex - 2.4, ey - 2.6, 2.6, '#FFFFFF'); }
    ellipse(c, sd * 38, 14, 9, 6, 'rgba(255,140,160,0.45)');
  }
  // paws on a steering wheel
  if (o.drive) for (const sd of [-1, 1]) { circle(c, sd * 30, 92, 16, BEARC.fur); c.beginPath(); c.arc(sd * 30, 92, 16, 0, 7); c.lineWidth = 5; c.strokeStyle = WB_INK; c.stroke(); }
  c.restore();
}

// ---------------------------------------------------------------- his thought bubble (screen space)
// tail = [x, y] where the little puffs lead to (his head); inner(cx, cy, s) draws inside it, clipped
function wbBubbleShape(c, x, y, w, h, s, grow) {
  const n = 13;
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath();
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + 0.2; c.moveTo(Math.cos(a) * w * 0.43 + Math.min(w, h) * 0.2 + grow, Math.sin(a) * h * 0.4); c.arc(Math.cos(a) * w * 0.43, Math.sin(a) * h * 0.4, Math.min(w, h) * 0.2 + grow, 0, Math.PI * 2); }
  c.moveTo(w * 0.47 + grow, 0); c.ellipse(0, 0, w * 0.47 + grow, h * 0.45 + grow, 0, 0, Math.PI * 2);
  c.restore();
}
function wbBubble(x, y, w, h, k, tail, inner, o = {}) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 1.7) * (1 + 0.04 * (o.bump || 0));
  screenSpace();
  // the three little puffs toward his head
  for (const [grow, col] of [[7, WB_INK], [0, '#E8F0FF']]) {
    for (let i = 0; i < 3; i++) { const f = 0.34 + i * 0.24, px = lerp(x - w * 0.18, tail[0], f), py = lerp(y + h * 0.36, tail[1], f); circle(ctx, px, py, (20 - i * 5.5) * s + grow, col); }
  }
  // the cloud: one dark shape a little bigger, then the pale inside
  wbBubbleShape(ctx, x, y, w, h, s, 8); ctx.fillStyle = WB_INK; ctx.fill('nonzero');
  wbBubbleShape(ctx, x, y, w, h, s, 0);
  const g = ctx.createRadialGradient(x - w * 0.15, y - h * 0.2, 10, x, y, w * 0.6 * s);
  g.addColorStop(0, '#F2F7FF'); g.addColorStop(0.55, '#D2E2FF'); g.addColorStop(1, '#B4CBF6');
  ctx.fillStyle = g; ctx.fill('nonzero');
  gctx.save(); gctx.beginPath(); gctx.ellipse(x, y, w * 0.56 * s, h * 0.56 * s, 0, 0, 7); gctx.fillStyle = '#000000'; gctx.fill(); gctx.restore();   // no bloom through it
  if (inner) {
    ctx.save(); wbBubbleShape(ctx, x, y, w, h, s, -2); ctx.clip('nonzero');
    inner(x, y, s);
    ctx.restore();
    screenSpace();
  }
}

// ---------------------------------------------------------------- the guard
const RANGER = Object.assign({}, PAL, {
  coat: '#7E9A46', coatSh: '#5B7530', coatHi: '#A9C46E', coatDk: '#435A22',
  strap: '#C9A55E', strapSh: '#9A7B3A', pants: '#6B5636', pantsSh: '#4A3A22',
});
// the ranger hat in head units: a flat brim and a pinched crown with a band
function wbHat(c) {
  c.save(); c.translate(0, -58);
  ellipse(c, 0, 6, 104, 22, '#8C6B34');
  ellipse(c, 0, 2, 100, 19, '#C8A160');
  c.beginPath(); c.moveTo(-56, 0); c.quadraticCurveTo(-60, -52, -22, -66); c.lineTo(0, -54); c.lineTo(22, -66); c.quadraticCurveTo(60, -52, 56, 0); c.closePath();
  c.fillStyle = '#C8A160'; c.fill();
  paint(() => {
    c.beginPath(); c.moveTo(-56, -6); c.lineTo(56, -6); c.lineTo(55, -20); c.lineTo(-55, -20); c.closePath(); c.fillStyle = '#5A3A1E'; c.fill();
    line(c, -10, -58, 0, -36, 4, 'rgba(120,88,40,0.7)'); line(c, 10, -58, 0, -36, 4, 'rgba(120,88,40,0.7)');
  });
  c.restore();
}
function wbBinos(c) {
  for (const sd of [-1, 1]) {
    rrect(c, sd * 24 - 15, -18, 30, 40, 9); c.fillStyle = '#20263A'; c.fill();
    circle(c, sd * 24, -16, 14, '#2E3650');
    paint(() => { circle(c, sd * 24, -16, 9, '#7FD8FF'); circle(c, sd * 24 - 3, -19, 3, '#FFFFFF'); });
  }
  rrect(c, -10, -6, 20, 14, 4); c.fillStyle = '#20263A'; c.fill();
}
// the WANTED poster, centred at 0, 0 (w x h); k 0..1 unfolds it (folded = a small square)
function wbPoster(c, w, h, k, t) {
  const u = E.outBack(clamp(k), 1.4), ww = lerp(w * 0.35, w, u), hh = lerp(h * 0.3, h, u);
  c.save(); c.rotate(0.04 * Math.sin(t * 3));
  rrect(c, -ww / 2, -hh / 2, ww, hh, 6); c.fillStyle = '#F3E2B8'; c.fill();
  if (u > 0.5) paint(() => {
    c.save(); c.globalAlpha = clamp((u - 0.5) * 3);
    c.lineWidth = 4; c.strokeStyle = '#6B4A22'; rrect(c, -ww / 2 + 6, -hh / 2 + 6, ww - 12, hh - 12, 4); c.stroke();
    c.font = `400 ${Math.round(hh * 0.15)}px Anton`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#7A2A1A';
    c.fillText('WANTED', 0, -hh * 0.36);
    rrect(c, -ww * 0.36, -hh * 0.24, ww * 0.72, hh * 0.5, 4); c.fillStyle = '#9EC1EE'; c.fill();
    c.save(); c.beginPath(); rrect(c, -ww * 0.36, -hh * 0.24, ww * 0.72, hh * 0.5, 4); c.clip();
    wbBear(c, 0, hh * 0.0, ww * 0.0052, t, { wave: 0, grin: 1 });
    c.restore();
    c.font = `800 ${Math.round(hh * 0.075)}px Montserrat`; c.fillStyle = '#4A2E14'; c.fillText('ONE WHITE BEAR', 0, hh * 0.36);
    c.restore();
  });
  // the fold lines while it opens
  if (u < 0.98) paint(() => { line(c, 0, -hh / 2, 0, hh / 2, 3, 'rgba(120,90,40,0.5)'); line(c, -ww / 2, 0, ww / 2, 0, 3, 'rgba(120,90,40,0.5)'); });
  c.restore();
}
// the lookout: a post out of his hair and a cabin; base = world point on his crown, s = scale (hero units), up 0..1 grows it
// returns where the guard's feet go (world) and the cabin's size; front(c) draws the cabin's front wall over the guard
const WB_TOWER = { post: 46, cabW: 112, cabH: 42 };
function wbTowerGeo(base, s, up) {
  const u = clamp(up), post = WB_TOWER.post * s * u, top = base[1] - post;
  return { foot: [base[0], top - 4 * s], top, post, w: WB_TOWER.cabW * s, h: WB_TOWER.cabH * s, s, u };
}
function wbTowerBack(c, G, t) {
  if (G.u <= 0.01) return;
  const [x] = G.foot, s = G.s;
  // the post: two legs and a cross brace
  for (const sd of [-1, 1]) line(c, x + sd * 10 * s, G.top + G.post + 6 * s, x + sd * 22 * s, G.top, 9 * s, '#7A5230');
  line(c, x - 14 * s, G.top + G.post * 0.6, x + 18 * s, G.top + G.post * 0.25, 6 * s, '#5E3E22');
  // the cabin's back wall and roof
  rrect(c, x - G.w / 2, G.top - G.h * 2.1, G.w, G.h * 2.1, 6 * s); c.fillStyle = '#3E2A1C'; c.fill();
  c.beginPath(); c.moveTo(x - G.w * 0.62, G.top - G.h * 2.05); c.lineTo(x, G.top - G.h * 2.75); c.lineTo(x + G.w * 0.62, G.top - G.h * 2.05); c.closePath();
  c.fillStyle = '#B5443A'; c.fill();
  c.beginPath(); c.moveTo(x - G.w * 0.62, G.top - G.h * 2.05); c.lineTo(x + G.w * 0.62, G.top - G.h * 2.05); c.lineTo(x + G.w * 0.56, G.top - G.h * 1.92); c.lineTo(x - G.w * 0.56, G.top - G.h * 1.92); c.closePath();
  c.fillStyle = '#8A2E28'; c.fill();
  // the two corner posts that hold the roof
  for (const sd of [-1, 1]) line(c, x + sd * G.w * 0.46, G.top - G.h * 0.4, x + sd * G.w * 0.46, G.top - G.h * 2.0, 6 * s, '#6A4628');
}
function wbTowerFront(c, G, t) {
  if (G.u <= 0.01) return;
  const [x] = G.foot, s = G.s;
  rrect(c, x - G.w / 2 - 3 * s, G.top - G.h, G.w + 6 * s, G.h, 4 * s); c.fillStyle = '#8A5A34'; c.fill();
  paint(() => {
    for (let i = 1; i < 3; i++) line(c, x - G.w / 2, G.top - G.h + i * G.h / 3, x + G.w / 2, G.top - G.h + i * G.h / 3, 2 * s, 'rgba(60,34,18,0.55)');
    rrect(c, x - G.w * 0.4, G.top - G.h * 0.84, G.w * 0.8, G.h * 0.6, 3 * s); c.fillStyle = '#F4E3B5'; c.fill();
    c.font = `900 ${Math.round(G.h * 0.3)}px Montserrat`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#2E5A2A';
    const fit = Math.min(1, (G.w * 0.74) / c.measureText('BEAR WATCH').width);
    c.save(); c.translate(x, G.top - G.h * 0.53); c.scale(fit, fit); c.fillText('BEAR WATCH', 0, 0); c.restore();
  });
}

// ---------------------------------------------------------------- the countdown (screen space)
function wbTimer(x, y, r, v, k, fail = 0) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 1.8);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  circle(ctx, 0, 0, r + 10, WB_INK); circle(ctx, 0, 0, r, '#1E2752');
  const frac = clamp(v / 5), col = fail > 0.5 ? '#FF5A6E' : '#4DFFB4';
  ctx.beginPath(); ctx.arc(0, 0, r - 12, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac); ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.strokeStyle = col; ctx.stroke();
  ctx.font = `400 ${Math.round(r * 0.9)}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFFFFF';
  ctx.fillText(v >= 4.95 ? '5' : v.toFixed(1), 0, 4);
  ctx.restore();
  softDot(gctx, x, y, r * 1.6, col, 0.28 * clamp(k));
}

// ---------------------------------------------------------------- a desk bell (world): hit 0..1 the plunger down
function wbDeskBell(c, x, y, s, hit = 0) {
  c.save(); c.translate(x, y); c.scale(s, s);
  ellipse(c, 0, 0, 40, 11, '#3A2A22'); rrect(c, -40, -8, 80, 10, 5); c.fillStyle = '#5A4232'; c.fill();
  c.beginPath(); c.moveTo(-32, -8); c.bezierCurveTo(-32, -44, 32, -44, 32, -8); c.closePath();
  const g = c.createLinearGradient(-32, 0, 32, 0); g.addColorStop(0, '#FFE9A0'); g.addColorStop(0.45, '#F2C14A'); g.addColorStop(1, '#B88418');
  c.fillStyle = g; c.fill();
  const py = -44 + 6 * hit;
  line(c, 0, -36, 0, py, 6, '#8C8C9A'); ellipse(c, 0, py, 9, 4, '#B8BCC8');
  paint(() => ellipse(c, -12, -26, 7, 4, 'rgba(255,255,255,0.65)', -0.4));
  c.restore();
}

// ---------------------------------------------------------------- the red car (a side view, facing left), o: {door, honk, bear, lean}
function wbCar(c, x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s); c.rotate(o.lean || 0);
  c.lineJoin = 'round';
  // the bear, up through the sunroof (behind the body, so the roof hides his middle)
  const bk = clamp(o.bear || 0);
  if (bk > 0.01) wbBear(c, -2, -84 - 74 * E.outBack(bk, 2.2), 0.95, t, { wave: bk > 0.4 ? 1 : 0, grin: 1, look: [-0.6, 0] });
  // body
  c.beginPath(); c.moveTo(-120, 10); c.lineTo(-118, -22); c.quadraticCurveTo(-112, -36, -86, -38); c.lineTo(-58, -40);
  c.quadraticCurveTo(-40, -82, 10, -84); c.quadraticCurveTo(52, -84, 70, -44); c.lineTo(106, -38); c.quadraticCurveTo(124, -34, 124, -14); c.lineTo(122, 10); c.closePath();
  c.fillStyle = '#E8343C'; c.fill(); c.lineWidth = 6; c.strokeStyle = WB_INK; c.stroke();
  // windows
  c.beginPath(); c.moveTo(-44, -42); c.quadraticCurveTo(-30, -74, 4, -76); c.lineTo(4, -42); c.closePath(); c.fillStyle = '#BFE6FF'; c.fill(); c.lineWidth = 4; c.stroke();
  c.beginPath(); c.moveTo(14, -42); c.lineTo(14, -76); c.quadraticCurveTo(48, -74, 60, -44); c.closePath(); c.fillStyle = '#BFE6FF'; c.fill(); c.stroke();
  // details: a door line, a handle, a headlight, a bumper
  line(c, 8, -38, 8, 6, 3, '#9E1E26'); rrect(c, 22, -30, 18, 6, 3); c.fillStyle = '#9E1E26'; c.fill();
  ellipse(c, -114, -18, 7, 9, '#FFF2A8'); rrect(c, -126, -2, 30, 10, 5); c.fillStyle = '#C9CED8'; c.fill();
  // wheels
  for (const wx of [-74, 76]) {
    const sp = (o.spin || 0);
    circle(c, wx, 12, 27, WB_INK); circle(c, wx, 12, 14, '#C9CED8');
    c.save(); c.translate(wx, 12); c.rotate(sp); line(c, -12, 0, 12, 0, 4, '#6A7080'); line(c, 0, -12, 0, 12, 4, '#6A7080'); c.restore();
  }
  c.restore();
  // the honk: two arcs in front of the bonnet
  const hk = clamp(o.honk || 0);
  if (hk > 0.01) {
    c.save(); c.translate(x - 136 * s, y - 20 * s); c.scale(s, s);
    for (let i = 0; i < 2; i++) { c.beginPath(); c.arc(0, 0, 18 + i * 16 + 10 * hk, Math.PI * 0.75, Math.PI * 1.25); c.lineWidth = 6; c.strokeStyle = rgba('#FFD447', hk); c.lineCap = 'round'; c.stroke(); }
    c.restore();
  }
}

// ---------------------------------------------------------------- the camping clock (world): 2:00, glowing
function wbClock(c, x, y, s, t, on = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (const sd of [-1, 1]) { circle(c, sd * 34, -66, 16, '#C9CED8'); line(c, sd * 34, -54, sd * 26, -44, 6, '#8C93A6'); }
  rrect(c, -64, -50, 128, 92, 22); c.fillStyle = '#2B3350'; c.fill();
  rrect(c, -50, -36, 100, 54, 8); c.fillStyle = '#0B0F1E'; c.fill();
  for (const sd of [-1, 1]) line(c, sd * 40, 42, sd * 50, 56, 8, '#2B3350');
  c.restore();
  paint(() => {
    c.save(); c.translate(x, y); c.scale(s, s);
    c.font = '400 42px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = rgba('#FF5A6E', 0.95 * on); c.fillText('2:00', 0, -9);
    c.font = '800 13px Montserrat'; c.fillStyle = rgba('#FF9AA6', 0.9 * on); c.fillText('AM', 38, 10);
    c.restore();
  });
  softDot(gctx, x, y - 9 * s, 70 * s, '#FF5A6E', 0.45 * on);
}

// ---------------------------------------------------------------- the sleeping bag (rig space): from his chin down, with a hood
function wbBag(c, st, r, t, o = {}) {
  const [hx, hy] = r.head, breathe = 3 * Math.sin(t * 2.2);
  c.save();
  // the hood's rim round his face (the hood itself is drawn behind his head: wbHood)
  c.beginPath(); c.ellipse(hx, hy + 8, 84, 92, 0, Math.PI * 0.86, Math.PI * 2.14); c.lineWidth = 16; c.strokeStyle = '#5B7FD6'; c.stroke();
  // the cocoon
  c.beginPath(); c.moveTo(hx - 104, hy + 64); c.quadraticCurveTo(hx - 150, hy + 230, hx - 128, hy + 420 + breathe);
  c.lineTo(hx + 128, hy + 420 + breathe); c.quadraticCurveTo(hx + 150, hy + 230, hx + 104, hy + 64); c.quadraticCurveTo(hx, hy + 92, hx - 104, hy + 64); c.closePath();
  c.fillStyle = '#3A5BB0'; c.fill();
  paint(() => {
    for (let i = 1; i < 5; i++) { c.beginPath(); c.moveTo(hx - 140, hy + 70 + i * 74); c.quadraticCurveTo(hx, hy + 90 + i * 74 + breathe, hx + 140, hy + 70 + i * 74); c.lineWidth = 5; c.strokeStyle = 'rgba(20,34,90,0.45)'; c.stroke(); }
    line(c, hx + 60, hy + 80, hx + 80, hy + 400, 4, 'rgba(200,214,255,0.55)');
    rrect(c, hx + 52, hy + 92, 16, 26, 5); c.fillStyle = '#C9CED8'; c.fill();
  });
  c.restore();
}

// the hood behind his head (rig space; draw it in the layer's pre, before the rig)
function wbHood(c, r) {
  const [hx, hy] = r.head;
  c.beginPath(); c.ellipse(hx, hy + 6, 104, 112, 0, 0, Math.PI * 2); c.fillStyle = '#3A5BB0'; c.fill();
  c.beginPath(); c.ellipse(hx, hy + 14, 84, 92, 0, 0, Math.PI * 2); c.fillStyle = '#22356E'; c.fill();
}
