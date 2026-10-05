// Three small worlds for voice-recording: the movie trailer in his head (a sunset, a cape, a golden title in
// letterbox), karaoke night (a little stage, a spotlight, a crowd with phone lights; what he hears vs what the room
// hears), and the listening test (three mystery voice cards with star ratings). Loaded after voicehead.js, before scenes.js.
'use strict';

// ---------------------------------------------------------------- the movie trailer
const TRAILER = { top: 440, bot: 1470 };
function trailerBg(t) {
  screenSpace();
  const g = ctx.createLinearGradient(0, TRAILER.top, 0, TRAILER.bot);
  g.addColorStop(0, '#2A0A1C'); g.addColorStop(0.4, '#9A2E1C'); g.addColorStop(0.72, '#F08A2A'); g.addColorStop(1, '#6A1C12');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  softDot(ctx, 540, 1040, 760, '#FFC060', 0.55);
  circle(ctx, 540, 1040, 318, '#FFE9B0'); circle(ctx, 540, 1040, 296, '#FFF4D2');
  softDot(gctx, 540, 1040, 420, '#FFB040', 0.5);
  // streaks of cloud across the sun
  for (let i = 0; i < 5; i++) { const y = 880 + i * 74, x = ((i * 310 + t * (18 + i * 6)) % 1500) - 200; ctx.fillStyle = `rgba(120,30,24,${0.34 - i * 0.03})`; ctx.beginPath(); ctx.ellipse(x, y, 330 - i * 30, 13, 0, 0, Math.PI * 2); ctx.fill(); }
  // far ridges
  ctx.fillStyle = '#3A0E14'; ctx.beginPath(); ctx.moveTo(0, 1470);
  for (let x = 0; x <= W; x += 60) ctx.lineTo(x, 1330 - 70 * Math.abs(Math.sin(x * 0.006 + 1)) - 26 * Math.sin(x * 0.021));
  ctx.lineTo(W, 1470); ctx.closePath(); ctx.fill();
  // embers on the wind
  for (let i = 0; i < 26; i++) {
    const p = ((t * (0.25 + 0.2 * hash(i)) + hash(i + 5)) % 1), x = ((hash(i + 9) * W + t * 180 * (0.5 + hash(i + 2))) % (W + 80)) - 40, y = 1440 - p * 900 + 30 * Math.sin(p * 9 + i);
    circle(ctx, x, y, 3 + 3 * hash(i + 3), `rgba(255,220,150,${0.8 * Math.sin(Math.PI * p)})`); softDot(gctx, x, y, 16, '#FFB040', 0.5 * Math.sin(Math.PI * p));
  }
}
// a cape behind him (world space: st = the hero's state), flapping to the right
function heroCape(c, st, t) {
  const sx = st.x, sy = st.y - 368 * st.s, s = st.s;
  c.beginPath(); c.moveTo(sx - 70 * s, sy); c.lineTo(sx + 70 * s, sy);
  const n = 8;
  for (let i = 0; i <= n; i++) { const u = i / n; c.lineTo(sx + (90 + 330 * u) * s + 16 * s * Math.sin(t * 9 - u * 5), sy + (20 + 250 * u) * s + 26 * s * u * Math.sin(t * 11 - u * 7)); }
  for (let i = n; i >= 0; i--) { const u = i / n; c.lineTo(sx + (-60 + 330 * u) * s + 12 * s * Math.sin(t * 8 - u * 4 + 1), sy + (150 + 250 * u) * s + 30 * s * u * Math.sin(t * 10 - u * 6 + 2)); }
  c.closePath();
  const g = c.createLinearGradient(sx, sy, sx + 420 * s, sy + 400 * s); g.addColorStop(0, '#C81E36'); g.addColorStop(1, '#6A0E22');
  c.fillStyle = g; c.fill();
}
function letterbox(k = 1) {
  screenSpace();
  ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, W, TRAILER.top * k); ctx.fillRect(0, H - (H - TRAILER.bot) * k, W, (H - TRAILER.bot) * k);
}
// a golden title (screen space), slammed in: k 0..1
function goldTitle(txt, x, y, size, k, t) {
  if (k <= 0.01) return;
  const s = lerp(2.3, 1, E.outCubic(clamp(k)));
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = clamp(k * 3);
  ctx.font = `400 ${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.fillStyle = 'rgba(30,6,6,0.6)'; ctx.fillText(txt, 0, size * 0.07);
  ctx.lineWidth = size * 0.12; ctx.strokeStyle = '#3A1206'; ctx.strokeText(txt, 0, 0);
  const g = ctx.createLinearGradient(0, -size * 0.5, 0, size * 0.5); g.addColorStop(0, '#FFF6C8'); g.addColorStop(0.45, '#FFD447'); g.addColorStop(0.55, '#E8A21C'); g.addColorStop(1, '#FFE08A');
  ctx.fillStyle = g; ctx.fillText(txt, 0, 0);
  // a glint that sweeps across
  const gx = lerp(-size * 3, size * 3, ((t * 0.9) % 1));
  ctx.save(); ctx.globalCompositeOperation = 'source-atop'; const gg = ctx.createLinearGradient(gx - 60, 0, gx + 60, 0); gg.addColorStop(0, 'rgba(255,255,255,0)'); gg.addColorStop(0.5, 'rgba(255,255,255,0.55)'); gg.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = gg; ctx.restore();
  ctx.restore();
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); softDot(gctx, x, y, size * 2.2, '#FFC040', 0.3 * clamp(k)); gctx.restore();
}

// ---------------------------------------------------------------- karaoke night
const KARA = { hx: 430, fy: 1236, hs: 1.06 };
const STAGEPAL = Object.assign({}, PAL, {           // his going-out shirt: wine red, sleeves rolled
  coat: '#C2334A', coatSh: '#8E1E34', coatHi: '#F06A80', coatDk: '#6A1426', strap: '#C2334A', strapSh: '#8E1E34',
  pants: '#23263A', pantsSh: '#14162A', shoe: '#F4F1EA', shoeSh: '#B8B2A0', sole: '#8A8576', shortSleeve: true, pj: true,
});
function karaokeBg(cam, t) {
  applyCam(cam);
  const c = ctx;
  const g = c.createLinearGradient(0, 300, 0, 1300); g.addColorStop(0, '#1A0B33'); g.addColorStop(1, '#3A1454');
  c.fillStyle = g; c.fillRect(-200, -200, W + 400, 1500);
  for (let x = -160; x < W + 200; x += 110) { c.fillStyle = 'rgba(255,255,255,0.025)'; c.fillRect(x, 0, 52, 1300); }
  // the velvet curtain at the back of the stage
  for (let i = 0; i < 9; i++) { const x = 40 + i * 118; const cg = c.createLinearGradient(x, 0, x + 118, 0); cg.addColorStop(0, '#5A1238'); cg.addColorStop(0.5, '#8A1E52'); cg.addColorStop(1, '#4A0E2E'); c.fillStyle = cg; c.fillRect(x, 560, 118, 660); }
  c.fillStyle = 'rgba(10,4,24,0.35)'; c.fillRect(40, 560, 1062, 660);
  // the sign
  for (const [cc, a] of [[gctx, 0.8], [ctx, 1]]) {
    cc.save(); cc.translate(706, 474); cc.rotate(0.05); cc.font = '400 96px Anton'; cc.textAlign = 'center'; cc.textBaseline = 'middle';
    const fl = 0.86 + 0.14 * Math.sin(t * 21) * (hash(Math.floor(t * 7)) > 0.7 ? 1 : 0.2);
    if (cc === ctx) { cc.lineWidth = 7; cc.strokeStyle = rgba('#FF4D8A', fl); cc.strokeText('KARAOKE', 0, 0); cc.fillStyle = rgba('#FFE3EE', fl); cc.fillText('KARAOKE', 0, 0); }
    else { cc.fillStyle = rgba('#FF4D8A', 0.7 * fl * a); cc.fillText('KARAOKE', 0, 0); }
    cc.restore();
  }
  // a string of bulbs
  for (let i = 0; i < 13; i++) { const x = 30 + i * 86, y = 590 + 26 * Math.sin((i / 12) * Math.PI); const on = 0.55 + 0.45 * Math.sin(t * 4 + i * 1.3); const col = ['#FFD447', '#7FE9FF', '#FF86A6', '#4DFFB4'][i % 4]; circle(c, x, y, 9, rgba(col, 0.5 + 0.5 * on)); softDot(gctx, x, y, 34, col, 0.5 * on); }
  // the stage
  const fg = c.createLinearGradient(0, 1200, 0, 1420); fg.addColorStop(0, '#5A3A22'); fg.addColorStop(1, '#2A1A12');
  c.fillStyle = fg; c.fillRect(-200, 1206, W + 400, 130);
  for (let i = 0; i < 12; i++) line(c, -100 + i * 110, 1206, -160 + i * 124, 1336, 2, 'rgba(0,0,0,0.25)');
  c.fillStyle = '#160C1E'; c.fillRect(-200, 1336, W + 400, 700);
  c.fillStyle = 'rgba(255,220,160,0.10)'; c.fillRect(-200, 1336, W + 400, 6);
  // the spotlight: a cone from the top left, a pool on the floor
  c.save(); c.globalCompositeOperation = 'lighter';
  const sp = c.createLinearGradient(250, 300, KARA.hx, KARA.fy); sp.addColorStop(0, 'rgba(255,240,200,0.30)'); sp.addColorStop(1, 'rgba(255,240,200,0.07)');
  c.fillStyle = sp; c.beginPath(); c.moveTo(206, 250); c.lineTo(286, 250); c.lineTo(KARA.hx + 250, KARA.fy + 14); c.lineTo(KARA.hx - 250, KARA.fy + 14); c.closePath(); c.fill();
  c.restore();
  ellipse(c, KARA.hx, KARA.fy + 12, 250, 34, 'rgba(255,236,190,0.30)');
  softDot(gctx, KARA.hx, KARA.fy - 200, 420, '#FFE6B0', 0.16);
  // a wedge monitor on the stage, right
  c.beginPath(); c.moveTo(770, 1226); c.lineTo(930, 1226); c.lineTo(906, 1118); c.lineTo(806, 1140); c.closePath(); c.fillStyle = '#17131F'; c.fill();
  circle(c, 852, 1180, 30, '#2A2434'); circle(c, 852, 1180, 13, '#0E0B14');
}
// the crowd from behind: heads and shoulders along the bottom, two with their phone lights up (world space)
function karaokeCrowd(t, o = {}) {
  const c = ctx;
  const P = [[110, 1500, 1.25, 0], [330, 1540, 1.4, 1], [590, 1510, 1.3, 0], [820, 1545, 1.42, 1], [1010, 1505, 1.2, 0]];
  P.forEach(([x, y, s, light], i) => {
    const sway = 9 * Math.sin(t * 2.6 + i * 1.7);
    c.save(); c.translate(x + sway, y); c.scale(s, s);
    c.fillStyle = '#0B0714';
    c.beginPath(); c.moveTo(-120, 260); c.quadraticCurveTo(-112, 60, -44, 44); c.lineTo(44, 44); c.quadraticCurveTo(112, 60, 120, 260); c.closePath(); c.fill();
    c.beginPath(); c.ellipse(0, -18, 56, 64, 0, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.ellipse(0, -18, 56, 64, 0, Math.PI * 1.15, Math.PI * 1.85); c.lineWidth = 4; c.strokeStyle = 'rgba(255,220,170,0.34)'; c.stroke();   // the stage light on their hair
    if (light) {                                                   // an arm up, a phone light
      const ax = (i % 2 ? -1 : 1) * 96, ay = -150 + 10 * Math.sin(t * 2.6 + i);
      line(c, ax * 0.9, 80, ax, ay + 40, 30, '#0B0714');
      rrect(c, ax - 17, ay - 34, 34, 62, 7); c.fillStyle = '#0B0714'; c.fill();
      rrect(c, ax - 12, ay - 28, 24, 50, 4); c.fillStyle = '#DCEBFF'; c.fill();
    }
    c.restore();
    if (light) { const ax = x + sway + (i % 2 ? -1 : 1) * 96 * s, ay = y + (-150 + 10 * Math.sin(t * 2.6 + i)) * s; softDot(gctx, ax, ay, 70, '#BFD8FF', 0.55); }
  });
}
// a hand mic at his wrist (rig space)
function handMic(c, wr, ang) {
  c.save(); c.translate(wr[0], wr[1]); c.rotate(ang);
  rrect(c, -8, -34, 16, 62, 6); c.fillStyle = '#20242F'; c.fill();
  rrect(c, -9, -40, 18, 9, 4); c.fillStyle = '#FF5A6E'; c.fill();
  circle(c, 0, -52, 16, '#3A4060'); circle(c, 0, -52, 14, '#C9D1E6'); circle(c, -4, -56, 5, '#FFFFFF');
  c.restore();
}
// a signal as a ribbon between two screen points. kind 'fat' = slow, tall, thick (what he hears) | 'thin' = quick, small, wiry (what the room hears)
function waveRibbon(a, b, t, kind, k, col) {
  if (k <= 0.01) return;
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
  for (const [cc, sc] of [[ctx, 1], [gctx, 0.5]]) {
    cc.save(); cc.setTransform(sc, 0, 0, sc, 0, 0); cc.beginPath();
    const n = Math.floor(L * clamp(k) / 4);
    for (let i = 0; i <= n; i++) {
      const d = i * 4, u = d / L, env = Math.sin(Math.PI * clamp(u * 1.05)) ** 0.5;
      const off = kind === 'fat' ? env * 44 * Math.sin(d * 0.03 - t * 7) : env * 20 * Math.sin(d * 0.13 - t * 30) * (0.6 + 0.4 * Math.sin(d * 0.05 + t * 9));
      const x = a[0] + ux * d + nx * off, y = a[1] + uy * d + ny * off;
      if (i === 0) cc.moveTo(x, y); else cc.lineTo(x, y);
    }
    cc.lineCap = 'round'; cc.lineJoin = 'round';
    if (cc === ctx) { cc.lineWidth = kind === 'fat' ? 24 : 13; cc.strokeStyle = 'rgba(8,8,26,0.7)'; cc.stroke(); cc.lineWidth = kind === 'fat' ? 16 : 7; cc.strokeStyle = col; cc.stroke(); }
    else { cc.lineWidth = kind === 'fat' ? 30 : 12; cc.strokeStyle = rgba(col, 0.4); cc.stroke(); }
    cc.restore();
  }
}

// ---------------------------------------------------------------- the listening test
// a voice card (screen space, centred on x, y). o: {k (pop-in), n (its number), active 0..1, stars (0..5, fractional fills the next),
//   flip 0..1 (the mystery face turns round: it's him), face, t, gold 0..1}
function voiceCard(x, y, w, h, o) {
  const k = o.k === undefined ? 1 : o.k;
  if (k <= 0.01) return;
  const c = ctx, s = E.outBack(clamp(k), 1.6), t = o.t, act = o.active || 0, flip = clamp(o.flip || 0), gold = o.gold || 0;
  const mine = flip > 0.5;
  const zs = o.sc || 1;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = o.alpha === undefined ? 1 : o.alpha; c.translate(x, y - 10 * act); c.scale(s * (1 + 0.04 * act) * zs, s * (1 + 0.04 * act) * zs); c.rotate(o.rot || 0);
  rrect(c, -w / 2 + 6, -h / 2 + 10, w, h, 30); c.fillStyle = 'rgba(0,0,10,0.4)'; c.fill();
  const g = c.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, '#1C2A66'); g.addColorStop(1, '#0E1540');
  rrect(c, -w / 2, -h / 2, w, h, 30); c.fillStyle = g; c.fill();
  const edge = gold > 0.01 ? mixHex('#7FE9FF', '#FFD447', clamp(gold)) : (act > 0.3 ? '#7FE9FF' : 'rgba(127,233,255,0.35)');
  c.lineWidth = 5 + 3 * act + 3 * gold; c.strokeStyle = edge; c.stroke();
  // header
  c.font = '900 38px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillStyle = mine ? '#FFD447' : 'rgba(210,222,255,0.92)'; c.fillText(mine ? 'YOU!' : `VOICE ${o.n}`, 0, -h / 2 + 46);
  // the face: a mystery bust ... or him
  const fx = Math.abs(Math.cos(Math.PI * flip));
  c.save(); c.translate(0, -h / 2 + 150); c.scale(Math.max(0.03, fx), 1);
  if (mine) avatarFace(c, 0, 0, 70, o.face || FACES.grin, t, '#FFD447');
  else {
    c.beginPath(); c.arc(0, 0, 70, 0, Math.PI * 2); c.fillStyle = '#2A3878'; c.fill();
    c.save(); c.clip(); circle(c, 0, -14, 30, '#5A6AB0'); c.beginPath(); c.ellipse(0, 78, 58, 54, 0, 0, Math.PI * 2); c.fillStyle = '#5A6AB0'; c.fill(); c.restore();
    c.font = '400 64px Anton'; c.fillStyle = '#DCE6FF'; c.fillText('?', 0, -8);
    c.beginPath(); c.arc(0, 0, 70, 0, Math.PI * 2); c.lineWidth = 5; c.strokeStyle = 'rgba(127,233,255,0.6)'; c.stroke();
  }
  c.restore();
  // its waveform
  for (let i = 0; i < 13; i++) {
    const bh = 10 + 46 * Math.abs(Math.sin(i * 1.9 + o.n * 2.1) * Math.cos(i * 0.7 + o.n)) * (1 + 0.7 * act * Math.sin(t * 22 + i * 1.7));
    rrect(c, -78 + i * 12.6, -h / 2 + 262 - Math.abs(bh) / 2, 7, Math.abs(bh), 3.5); c.fillStyle = act > 0.3 ? '#FFFFFF' : 'rgba(255,255,255,0.4)'; c.fill();
  }
  // its stars
  const st = o.stars || 0;
  for (let i = 0; i < 5; i++) {
    const f = clamp(st - i), sx = -84 + i * 42, sy = h / 2 - 48, pop = 1 + 0.5 * Math.sin(Math.PI * clamp(f)) * (f < 1 ? 1 : 0);
    c.save(); c.translate(sx, sy); c.scale(pop, pop); c.beginPath();
    for (let j = 0; j < 10; j++) { const a = -Math.PI / 2 + j * Math.PI / 5, r = j % 2 ? 8 : 19; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    c.closePath(); c.fillStyle = f > 0.5 ? '#FFD447' : 'rgba(255,255,255,0.14)'; c.fill(); c.lineWidth = 2; c.strokeStyle = f > 0.5 ? '#B8860B' : 'rgba(255,255,255,0.2)'; c.stroke();
    c.restore();
  }
  c.restore();
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0);
  if (act > 0.05) softDot(gctx, x, y, w * 0.9 * zs, '#7FE9FF', 0.14 * act);
  if (gold > 0.05) softDot(gctx, x, y + h * 0.3 * zs, w * 0.8 * zs, '#FFD447', 0.3 * gold);
  gctx.restore();
}
// the room for it: a dark booth, a desk edge
function boothBg(t) {
  darkBg('#1F2C66', '#060918');
  screenSpace();
  for (let i = 0; i < 6; i++) softDot(ctx, (i * 251 + 60) % W, 380 + ((i * 337) % 700), 260, i % 2 ? '#3550D8' : '#7A3CC8', 0.07);
  // acoustic foam squares on the wall
  for (let r = 0; r < 4; r++) for (let q = 0; q < 6; q++) { const x = q * 180 + (r % 2 ? 0 : 90) - 40, y = 380 + r * 170; ctx.fillStyle = 'rgba(255,255,255,0.018)'; ctx.fillRect(x, y, 150, 140); line(ctx, x + 8, y + 132, x + 142, y + 132, 3, 'rgba(0,0,0,0.25)'); }
  motes(t, 0.5);
}
function boothDesk(y = 1440) {
  screenSpace();
  const g = ctx.createLinearGradient(0, y, 0, y + 220); g.addColorStop(0, '#2A2F5A'); g.addColorStop(1, '#0C0F26');
  ctx.fillStyle = g; ctx.fillRect(0, y, W, H - y);
  ctx.fillStyle = 'rgba(160,190,255,0.22)'; ctx.fillRect(0, y, W, 5);
}
