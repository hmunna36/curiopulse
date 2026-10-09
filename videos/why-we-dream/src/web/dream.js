// Why-we-dream Short: the things of the dream and of the night. A twin-bell alarm clock (it stands on an exam desk in
// the dream and on his nightstand in real life), a nightcap, a dream bubble with a picture inside, the exam paper as a
// monster, a penguin that sits the exam too, padlocks for his wrists and ankles, and the brain's control room (a big
// screen of fears, a FIRE DRILL sign with a beacon, the LOGIC switch, a megaphone).
// World coords: 1080x1920 at zoom 1. Every time comes from a cue (scenes.js); nothing here is timed.
'use strict';

const DM = { red: '#E5383B', redDk: '#B3202A', face: '#FFF6DF', brass: '#F4C24B', brassDk: '#C79320', steel: '#8A93AD', steelDk: '#5E6680',
  cap: '#5E7FDC', capDk: '#3F5CB8', wool: '#F4F6FF', paper: '#FBF8F0', ink: '#2A2140' };

// ---------------------------------------------------------------- the alarm clock (it stands on (x, y); about 150 s tall)
// o: {ring 0..1 (it shakes, the hammer flies), squash 0..1 (a hand has just landed on it), hour, min}
function dmClock(c, x, y, s, t, o = {}) {
  const ring = o.ring || 0, q = o.squash || 0;
  c.save(); c.translate(x + 4.5 * s * Math.sin(t * 96) * ring, y); c.rotate(0.05 * Math.sin(t * 83) * ring); c.scale(s * (1 + 0.14 * q), s * (1 - 0.2 * q));
  // feet
  line(c, -24, -22, -36, 0, 10, DM.steelDk); line(c, 24, -22, 36, 0, 10, DM.steelDk);
  // the handle over the top, then the bells on their stems
  c.beginPath(); c.arc(0, -108, 34, Math.PI * 1.08, Math.PI * 1.92); c.lineWidth = 7; c.lineCap = 'round'; c.strokeStyle = DM.steel; c.stroke();
  for (const sd of [-1, 1]) {
    line(c, sd * 24, -98, sd * 30, -112, 7, DM.steelDk);
    c.save(); c.translate(sd * 31, -116 + 2.5 * Math.sin(t * 110 + sd) * ring); c.rotate(sd * 0.42);
    c.beginPath(); c.ellipse(0, 0, 25, 19, 0, Math.PI, Math.PI * 2); c.closePath(); c.fillStyle = DM.brass; c.fill();
    rrect(c, -27, -3, 54, 8, 4); c.fillStyle = DM.brassDk; c.fill();
    c.restore();
  }
  // the hammer between them
  const hx = 13 * Math.sin(t * 118) * ring;
  line(c, 0, -100, hx, -124, 5, DM.steelDk); circle(c, hx, -126, 7, DM.steel);
  // the body and the dial
  circle(c, 0, -58, 50, DM.redDk); circle(c, 0, -58, 46, DM.red); circle(c, 0, -58, 37, DM.face);
  paint(() => {
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; line(c, Math.sin(a) * 28, -58 - Math.cos(a) * 28, Math.sin(a) * 33, -58 - Math.cos(a) * 33, i % 3 ? 2.5 : 4.5, DM.ink); }
    const hA = ((o.hour === undefined ? 7 : o.hour) / 12) * Math.PI * 2, mA = ((o.min || 0) / 60) * Math.PI * 2;
    line(c, 0, -58, Math.sin(hA) * 17, -58 - Math.cos(hA) * 17, 6, DM.ink);
    line(c, 0, -58, Math.sin(mA) * 26, -58 - Math.cos(mA) * 26, 4.5, DM.ink);
    circle(c, 0, -58, 4.5, DM.red);
    ellipse(c, -16, -76, 9, 5, 'rgba(255,255,255,0.75)', -0.6);
  });
  c.restore();
}
// the ringing itself: arcs of sound off both bells (the clock's own place and scale). k 0..1 = how loud
function dmRingArcs(x, y, s, t, k) {
  if (k <= 0.02) return;
  paint(() => {
    for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) {
      const u = ((t * 3.4 + i / 3) % 1), r = (26 + 54 * u) * s, a0 = sd > 0 ? -0.95 : Math.PI - 0.35;
      for (const [cc, w, al] of [[ctx, 6 * s, 0.9], [gctx, 12 * s, 0.5]]) {
        cc.beginPath(); cc.arc(x + sd * 34 * s, y - 118 * s, r, a0, a0 + 1.3);
        cc.lineWidth = w * (1 - 0.5 * u); cc.lineCap = 'round'; cc.strokeStyle = `rgba(255,226,120,${al * k * (1 - u)})`; cc.stroke();
      }
    }
  });
}
// a comic burst where the hand lands: k 0..1 runs once
function dmSlapBurst(x, y, k, s = 1) {
  if (k <= 0 || k >= 1) return;
  paint(() => {
    const n = 9, a = 1 - k;
    for (const [cc, w, col] of [[ctx, 9 * s, `rgba(255,255,255,${0.95 * a})`], [gctx, 16 * s, `rgba(255,220,120,${0.6 * a})`]]) {
      for (let i = 0; i < n; i++) {
        const an = Math.PI + (i / (n - 1)) * Math.PI, r0 = (34 + 70 * E.outCubic(k)) * s, r1 = r0 + (26 + 20 * (i % 2)) * s * a;
        line(cc, x + Math.cos(an) * r0, y + Math.sin(an) * r0 * 0.8, x + Math.cos(an) * r1, y + Math.sin(an) * r1 * 0.8, w, col);
      }
    }
  });
}

// ---------------------------------------------------------------- the nightcap (head space: the head's centre is (0, 0))
// sw = how far the tip swings (units), the pompom follows it
function dmCap(c, sw = 0) {
  c.beginPath();
  c.moveTo(-66, -40); c.bezierCurveTo(-56, -122, 14, -168, 72, -134);
  c.bezierCurveTo(108, -112, 122 + sw * 0.5, -74, 112 + sw, -34);
  c.lineTo(94 + sw, -36); c.bezierCurveTo(98 + sw * 0.4, -78, 84, -98, 62, -100);
  c.bezierCurveTo(66, -78, 68, -58, 68, -40); c.closePath();
  c.fillStyle = DM.cap; c.fill();
  paint(() => {
    c.save(); c.clip();
    c.lineWidth = 15; c.strokeStyle = DM.capDk; c.lineCap = 'butt';
    for (const [x0, y0, x1, y1] of [[-80, -74, 96, -64], [-70, -114, 110, -98], [-30, -158, 124, -128]]) { c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 - 14, x1, y1); c.stroke(); }
    c.restore();
  });
  // the woolly band and the pompom
  c.beginPath(); c.moveTo(-72, -22); c.quadraticCurveTo(0, -58, 72, -22); c.lineTo(72, -48); c.quadraticCurveTo(0, -86, -72, -48); c.closePath();
  c.fillStyle = DM.wool; c.fill();
  circle(c, 104 + sw, -24, 19, DM.wool);
}

// ---------------------------------------------------------------- the dream bubble
// A cloud at (x, y) with radius r (screen or world, whatever the transform is), k pops it in, a trail of little puffs
// toward `tail`. `inside(c)` draws its picture in a frame whose origin is the bubble's centre and where the window's
// radius is 200 units; it is clipped to the window (and so stays unlit: a picture in a picture).
function dmBubble(x, y, r, k, tail, inside, o = {}) {
  if (k <= 0) return;
  const s = E.outBack(clamp(k), 1.5), R = r * s, t = o.t || 0;
  const puff = (c, col, grow = 0) => {
    c.fillStyle = col;
    const n = 11;
    c.beginPath();
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + 0.2, pr = R * (0.30 + 0.035 * Math.sin(i * 2.4 + t * 1.3)) + grow; c.moveTo(x + Math.cos(a) * R * 0.80 + pr, y + Math.sin(a) * R * 0.80); c.arc(x + Math.cos(a) * R * 0.80, y + Math.sin(a) * R * 0.80, pr, 0, 7); }
    c.moveTo(x + R * 0.9 + grow, y); c.arc(x, y, R * 0.9 + grow, 0, 7);
    c.fill();
  };
  if (tail) for (let i = 0; i < 3; i++) {
    const f = 0.42 + i * 0.22, px = lerp(x, tail[0], f), py = lerp(y, tail[1], f) + 6 * Math.sin(t * 2 + i);
    circle(ctx, px, py, R * (0.15 - i * 0.04), o.col || '#EEF2FF');
  }
  puff(ctx, o.col || '#EEF2FF');
  gctx.save(); gctx.globalAlpha = 0.16 * clamp(k); puff(gctx, '#BFD0FF', 8); gctx.restore();
  // the window
  const wr = R * 0.83;
  for (const c of [ctx, gctx]) { c.save(); c.beginPath(); c.arc(x, y, wr, 0, 7); c.clip(); }
  const g = ctx.createRadialGradient(x, y - wr * 0.3, wr * 0.1, x, y, wr * 1.1);
  g.addColorStop(0, o.bg0 || '#4B3A8C'); g.addColorStop(1, o.bg1 || '#1C1440');
  ctx.fillStyle = g; ctx.fillRect(x - wr, y - wr, wr * 2, wr * 2);
  if (inside) { ctx.save(); ctx.translate(x, y); ctx.scale(wr / 200, wr / 200); inside(ctx, wr); ctx.restore(); }
  for (const c of [ctx, gctx]) c.restore();
  paint(() => { ctx.beginPath(); ctx.arc(x, y, wr, 0, 7); ctx.lineWidth = Math.max(3, R * 0.03); ctx.strokeStyle = 'rgba(160,176,235,0.9)'; ctx.stroke(); });
}

// ---------------------------------------------------------------- the exam paper as a monster (it stands on (x, y), about 300 s tall)
// o: {run: phase of its legs, chomp 0..1, look: -1..1}
function dmMonster(c, x, y, s, t, o = {}) {
  const ph = o.run === undefined ? t * 11 : o.run, bob = 8 * Math.abs(Math.sin(ph));
  c.save(); c.translate(x, y - bob * s); c.scale(s, s); c.rotate(0.05 * Math.sin(ph));
  // legs and arms
  for (const sd of [-1, 1]) {
    const k = Math.sin(ph + (sd > 0 ? 0 : Math.PI));
    line(c, sd * 44, -44, sd * 50 + 16 * k, -8 + 8 * Math.max(0, k), 13, DM.ink);
    ellipse(c, sd * 54 + 18 * k, -4 + 8 * Math.max(0, k), 20, 10, DM.ink);
    const ax = sd * 118, ay = -196 + 16 * Math.sin(ph * 0.9 + sd);
    line(c, sd * 84, -170, ax, ay, 12, DM.ink);
    for (let i = -1; i <= 1; i++) line(c, ax, ay, ax + sd * 18 + i * 4, ay - 16 + i * 12, 6, DM.ink);
  }
  // the sheet
  c.beginPath(); c.moveTo(-92, -40); c.lineTo(-98, -280); c.quadraticCurveTo(0, -296, 98, -280); c.lineTo(92, -40); c.quadraticCurveTo(0, -28, -92, -40); c.closePath();
  c.fillStyle = DM.paper; c.fill();
  paint(() => {
    for (let i = 0; i < 4; i++) { rrect(c, -68, -118 + i * 20, 136 - (i % 2) * 34, 7, 3); c.fillStyle = '#C9C6D8'; c.fill(); }
    // a big red F in a ring, top right
    c.beginPath(); c.arc(48, -236, 32, 0, 7); c.lineWidth = 7; c.strokeStyle = '#E5383B'; c.stroke();
    c.font = '400 50px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#E5383B'; c.fillText('F', 48, -233);
    // the face: slanted brows, mean eyes, a mouth full of teeth
    const lk = (o.look || 0) * 5;
    for (const sd of [-1, 1]) {
      ellipse(c, sd * 34 - 22, -188, 17, 21, '#FFFFFF'); c.beginPath(); c.ellipse(sd * 34 - 22, -188, 17, 21, 0, 0, 7); c.lineWidth = 4; c.strokeStyle = DM.ink; c.stroke();
      circle(c, sd * 34 - 22 + lk, -183, 8, DM.ink);
      line(c, sd * 54 - 22, -224, sd * 12 - 22, -208, 9, DM.ink);
    }
    const mo = 14 + 22 * (o.chomp === undefined ? 0.5 + 0.5 * Math.sin(ph * 0.8) : o.chomp);
    c.beginPath(); c.moveTo(-70, -150); c.quadraticCurveTo(-10, -150 + mo * 2.2, 50, -150); c.closePath(); c.fillStyle = '#5A1522'; c.fill();
    c.fillStyle = '#FFFFFF'; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-60 + i * 22, -150); c.lineTo(-49 + i * 22, -150 + Math.min(16, mo)); c.lineTo(-38 + i * 22, -150); c.closePath(); c.fill(); }
  });
  c.restore();
}

// ---------------------------------------------------------------- a penguin at a desk (it sits at (x, y) like a classmate; s = the row's scale)
// o: {write 0..1, nod 0..1, look -1..1, blink}
function dmPenguin(c, x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const nod = (o.nod || 0) * 10;
  // body, belly, flippers on the desk
  c.beginPath(); c.ellipse(0, -110, 88, 122, 0, 0, 7); c.fillStyle = '#23263A'; c.fill();
  c.beginPath(); c.ellipse(0, -88, 58, 92, 0, 0, 7); c.fillStyle = '#F4F6FF'; c.fill();
  const wr = [34 + 6 * Math.sin(t * 23) * (o.write || 0), -16 + 3 * Math.sin(t * 31) * (o.write || 0)];
  line(c, 78, -150, wr[0] + 22, wr[1] - 6, 30, '#23263A'); line(c, -78, -150, -48, -14, 30, '#23263A');
  if ((o.write || 0) > 0.05) pencil(c, wr[0] + 16, wr[1] - 10, 54, -0.5, 1);
  // head
  c.save(); c.translate(0, -236 + nod);
  circle(c, 0, 0, 62, '#23263A');
  c.beginPath(); c.ellipse(-22, 8, 26, 30, 0, 0, 7); c.ellipse(22, 8, 26, 30, 0, 0, 7); c.fillStyle = '#F4F6FF'; c.fill();
  paint(() => {
    const lk = (o.look || 0) * 5, bl = o.blink || 0;
    for (const sd of [-1, 1]) {
      if (bl > 0.9) line(c, sd * 22 - 8, 2, sd * 22 + 8, 2, 4, '#23263A');
      else { circle(c, sd * 22 + lk, 2, 7.5, '#15132A'); circle(c, sd * 22 + lk - 2, 0, 2.4, '#FFFFFF'); }
    }
    c.beginPath(); c.moveTo(-15, 20); c.lineTo(15, 20); c.lineTo(0, 44); c.closePath(); c.fillStyle = '#FF9A3C'; c.fill();
    // little round glasses: it takes this exam seriously
    for (const sd of [-1, 1]) { c.beginPath(); c.arc(sd * 22, 2, 17, 0, 7); c.lineWidth = 3.5; c.strokeStyle = '#C9D4F2'; c.stroke(); }
    line(c, -5, 2, 5, 2, 3, '#C9D4F2');
  });
  c.restore();
  c.restore();
}

// ---------------------------------------------------------------- a padlock on a cuff (at (x, y), the cuff's centre; s = scale)
// o: {k: pops on 0..1, open 0..1 (the shackle swings up), rot, cuffW}
function dmLock(c, x, y, s, o = {}) {
  const k = o.k === undefined ? 1 : o.k;
  if (k <= 0) return;
  const sc = s * E.outBack(clamp(k), 2.6), open = o.open || 0;
  c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.scale(sc, sc);
  if (o.cuff !== false) { rrect(c, -(o.cuffW || 46), -13, (o.cuffW || 46) * 2, 26, 12); c.fillStyle = DM.steelDk; c.fill(); }
  // the shackle (it swings open about its left leg), then the body
  c.save(); c.translate(-17, 16); c.rotate(-1.05 * open); c.translate(17, -16 - 12 * open);
  c.beginPath(); c.moveTo(-17, 22); c.lineTo(-17, 2); c.arc(0, 2, 17, Math.PI, 0); c.lineTo(17, 22 - 14 * 0); c.lineWidth = 10; c.lineCap = 'round'; c.strokeStyle = '#C9D0E4'; c.stroke();
  c.restore();
  rrect(c, -30, 16, 60, 50, 11); c.fillStyle = DM.brass; c.fill();
  rrect(c, -30, 50, 60, 16, 8); c.fillStyle = DM.brassDk; c.fill();
  paint(() => { circle(c, 0, 36, 7, DM.ink); c.beginPath(); c.moveTo(-4, 38); c.lineTo(4, 38); c.lineTo(2.5, 52); c.lineTo(-2.5, 52); c.closePath(); c.fillStyle = DM.ink; c.fill(); });
  c.restore();
}

// ---------------------------------------------------------------- the brain's control room
let CTRL_BG = null;
const CTRL = { SCR: [176, 516, 728, 348], SIGN: [540, 428], PANEL: [250, 1176], BRAIN: [640, 1172, 0.94] };
function initCtrl() {
  CTRL_BG = mkCanvas(W, H);
  const x = CTRL_BG.getContext('2d'), rng = mulberry32(905);
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0C1230'); g.addColorStop(0.55, '#1A1F4E'); g.addColorStop(1, '#0A0C22');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  // wall panels, rivets, a few dials out of focus
  x.filter = 'blur(3px)';
  for (let px = -20; px < W; px += 180) { x.fillStyle = 'rgba(120,140,230,0.05)'; x.fillRect(px, 380, 168, 880); }
  for (let i = 0; i < 26; i++) {
    const cx = 60 + rng() * 960, cy = 420 + rng() * 760, r = 14 + rng() * 22;
    x.fillStyle = `rgba(${rng() < 0.5 ? '120,220,255' : '255,160,200'},${0.05 + 0.09 * rng()})`; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill();
  }
  x.filter = 'none';
  // the floor and the console along the bottom
  const f = x.createLinearGradient(0, 1280, 0, H); f.addColorStop(0, '#141A40'); f.addColorStop(1, '#070818');
  x.fillStyle = f; x.fillRect(0, 1280, W, H - 1280);
  x.fillStyle = 'rgba(140,170,255,0.14)'; x.fillRect(0, 1280, W, 6);
}
function ctrlRoom(t) { ctx.drawImage(CTRL_BG, 0, 0); }
// the big screen: a bezel, then `inside(c, w, h)` clipped to the glass (origin = the glass's top left)
function ctrlScreen(t, inside, o = {}) {
  const [x, y, w, h] = CTRL.SCR;
  rrect(ctx, x - 22, y - 22, w + 44, h + 44, 30); ctx.fillStyle = '#0A0C1E'; ctx.fill();
  rrect(ctx, x - 12, y - 12, w + 24, h + 24, 22); ctx.fillStyle = '#2C3566'; ctx.fill();
  for (const c of [ctx, gctx]) { c.save(); rrect(c, x, y, w, h, 14); c.clip(); }
  ctx.fillStyle = o.bg || '#151B45'; ctx.fillRect(x, y, w, h);
  ctx.save(); ctx.translate(x, y); if (inside) inside(ctx, w, h); ctx.restore();
  // scan lines and a soft sheen
  ctx.fillStyle = 'rgba(255,255,255,0.035)'; for (let yy = y + ((t * 40) % 8); yy < y + h; yy += 8) ctx.fillRect(x, yy, w, 3);
  for (const c of [ctx, gctx]) c.restore();
  gctx.save(); gctx.globalAlpha = 0.20; rrect(gctx, x, y, w, h, 14); gctx.fillStyle = o.glow || '#7FA0FF'; gctx.fill(); gctx.restore();
  // its stand
  rrect(ctx, x + w / 2 - 34, y + h + 22, 68, 60, 8); ctx.fillStyle = '#0A0C1E'; ctx.fill();
}
// a fear on the screen: 'exam' | 'fall' | 'chase' | 'teeth' in a w x h frame, with its word along the bottom
function fearCard(c, kind, w, h, t) {
  const cx = w / 2, cy = h * 0.42;
  const bg = { exam: ['#3A2F7A', '#1B1640'], fall: ['#1F4C8A', '#0E1C44'], chase: ['#5A1F4A', '#200A22'], teeth: ['#22586A', '#0B2230'] }[kind];
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, bg[0]); g.addColorStop(1, bg[1]); c.fillStyle = g; c.fillRect(0, 0, w, h);
  if (kind === 'exam') {
    c.save(); c.translate(cx - 150, cy + 150); dmMonster(c, 0, 0, 0.92, t, {}); c.restore();
    // a wall clock that runs far too fast
    c.save(); c.translate(cx + 170, cy - 20); circle(c, 0, 0, 78, '#F4EFE2'); c.beginPath(); c.arc(0, 0, 78, 0, 7); c.lineWidth = 10; c.strokeStyle = '#2B2B33'; c.stroke();
    const a = t * 7; line(c, 0, 0, Math.sin(a) * 56, -Math.cos(a) * 56, 7, '#2B2B33'); line(c, 0, 0, Math.sin(a / 12) * 36, -Math.cos(a / 12) * 36, 10, '#2B2B33'); circle(c, 0, 0, 8, '#D0342C'); c.restore();
  } else if (kind === 'fall') {
    for (let i = 0; i < 5; i++) { const yy = ((i * 97 - t * 520) % (h + 120) + h + 120) % (h + 120) - 60; ellipse(c, 90 + ((i * 263) % (w - 160)), yy, 90, 26, 'rgba(255,255,255,0.20)'); }
    c.save(); c.translate(cx, cy + 6 * Math.sin(t * 9)); c.rotate(0.25 * Math.sin(t * 5)); c.scale(5.6, 5.6); tfIcon(c, 'fall', 1); c.restore();
  } else if (kind === 'chase') {
    // a huge shadow with eyes and teeth, and something small running from it
    c.beginPath(); c.moveTo(w * 0.34, h); c.quadraticCurveTo(w * 0.30, h * 0.10, w * 0.62, h * 0.08); c.quadraticCurveTo(w * 0.96, h * 0.10, w * 0.94, h); c.closePath(); c.fillStyle = '#12061A'; c.fill();
    for (const sd of [-1, 1]) { ellipse(c, w * 0.63 + sd * 62, h * 0.30, 30, 20 + 4 * Math.sin(t * 6), '#FFE14A'); circle(c, w * 0.63 + sd * 62 - 8, h * 0.31, 9, '#12061A'); }
    c.fillStyle = '#FFFFFF'; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(w * 0.50 + i * 34, h * 0.50); c.lineTo(w * 0.50 + i * 34 + 17, h * 0.50 + 34); c.lineTo(w * 0.50 + i * 34 + 34, h * 0.50); c.closePath(); c.fill(); }
    const rb = 10 * Math.abs(Math.sin(t * 13));
    c.save(); c.translate(w * 0.17, h * 0.70 - rb); c.strokeStyle = '#FFD447'; c.lineWidth = 12; c.lineCap = 'round';
    const k = Math.sin(t * 13);
    c.beginPath(); c.moveTo(0, -46); c.lineTo(0, 6); c.moveTo(0, -30); c.lineTo(-30 * k, -6); c.moveTo(0, -30); c.lineTo(30 * k, -6); c.moveTo(0, 6); c.lineTo(-28 * k, 44); c.moveTo(0, 6); c.lineTo(28 * k, 44); c.stroke();
    circle(c, 0, -66, 19, '#FFDCC4'); c.restore();
  } else if (kind === 'teeth') {
    // a tooth takes its leave
    c.save(); c.translate(cx, cy - 4 + 10 * Math.sin(t * 6)); c.rotate(0.18 * Math.sin(t * 4));
    c.beginPath(); c.moveTo(-70, -84); c.quadraticCurveTo(0, -116, 70, -84); c.quadraticCurveTo(92, -10, 56, 86); c.quadraticCurveTo(38, 110, 26, 40); c.quadraticCurveTo(0, 12, -26, 40); c.quadraticCurveTo(-38, 110, -56, 86); c.quadraticCurveTo(-92, -10, -70, -84); c.closePath();
    c.fillStyle = '#FBF8F0'; c.fill();
    for (const sd of [-1, 1]) { circle(c, sd * 26, -38, 9, DM.ink); }
    c.beginPath(); c.arc(0, -4, 16, 0, Math.PI); c.lineWidth = 6; c.strokeStyle = DM.ink; c.stroke();
    c.restore();
    for (let i = 0; i < 3; i++) { const u = ((t * 1.3 + i / 3) % 1); c.save(); c.translate(cx - 210 + i * 210, h * 0.12 + u * h * 0.6); c.rotate(u * 5 + i); c.scale(0.24, 0.24);
      c.beginPath(); c.moveTo(-70, -84); c.quadraticCurveTo(0, -116, 70, -84); c.quadraticCurveTo(92, -10, 56, 86); c.quadraticCurveTo(38, 110, 26, 40); c.quadraticCurveTo(0, 12, -26, 40); c.quadraticCurveTo(-38, 110, -56, 86); c.quadraticCurveTo(-92, -10, -70, -84); c.closePath(); c.fillStyle = `rgba(251,248,240,${0.8 * Math.sin(Math.PI * u)})`; c.fill(); c.restore(); }
  }
  const word = { exam: 'EXAM', fall: 'FALLING', chase: 'CHASED', teeth: 'TEETH' }[kind];
  c.font = '400 76px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = 12; c.strokeStyle = '#0B0B1A';
  c.strokeText(word, cx, h - 52); c.fillStyle = '#FFFFFF'; c.fillText(word, cx, h - 52);
}
// the FIRE DRILL lightbox, with a beacon on its left end. k = lit 0..1
function fireSign(t, k) {
  const [x, y] = CTRL.SIGN, w = 560, h = 104;
  rrect(ctx, x - w / 2 - 12, y - h / 2 - 12, w + 24, h + 24, 22); ctx.fillStyle = '#0A0C1E'; ctx.fill();
  rrect(ctx, x - w / 2, y - h / 2, w, h, 14); ctx.fillStyle = mixHex('#3A1420', '#B3202A', clamp(k)); ctx.fill();
  const fl = k >= 1 ? 0.9 + 0.1 * Math.sin(t * 22) : k > 0 ? (Math.sin(t * 70) > 0 ? 1 : 0.25) * k : 0;
  paint(() => {
    ctx.font = '400 80px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = mixHex('#7A3A46', '#FFF1D6', clamp(fl)); ctx.fillText('FIRE DRILL', x + 34, y + 5);
  });
  if (fl > 0.02) { gctx.save(); gctx.globalAlpha = 0.55 * fl; gctx.font = '400 80px Anton'; gctx.textAlign = 'center'; gctx.textBaseline = 'middle'; gctx.fillStyle = '#FF6A4A'; gctx.fillText('FIRE DRILL', x + 34, y + 5); gctx.restore(); }
  // the beacon: a red dome on the box's left end with a lamp that goes round
  const bx = x - w / 2 + 44, by = y - 4;
  rrect(ctx, bx - 30, by + 22, 60, 16, 5); ctx.fillStyle = '#2C3566'; ctx.fill();
  ctx.beginPath(); ctx.arc(bx, by + 22, 28, Math.PI, 0); ctx.closePath(); ctx.fillStyle = mixHex('#6A1A24', '#FF3A3A', clamp(k)); ctx.fill();
  if (k > 0.02) {
    const a = t * 9, on = 0.5 + 0.5 * Math.cos(a);
    paint(() => circle(ctx, bx + 12 * Math.sin(a), by + 8, 8, `rgba(255,240,200,${0.9 * k * on})`));
    softDot(gctx, bx, by + 6, 120 + 60 * on, '#FF4A3A', 0.5 * k * (0.4 + 0.6 * on));
  }
}
// the LOGIC switch: a wall box with a big lever, ON at the top, OFF at the bottom. p = the lever 0 (ON) .. 1 (OFF)
// Returns the knob (where a hand goes).
function logicPanel(t, p) {
  const [x, y] = CTRL.PANEL;
  rrect(ctx, x - 118, y - 196, 236, 392, 22); ctx.fillStyle = '#0A0C1E'; ctx.fill();
  rrect(ctx, x - 106, y - 184, 212, 368, 16); ctx.fillStyle = '#39427C'; ctx.fill();
  rrect(ctx, x - 22, y - 96, 44, 208, 20); ctx.fillStyle = '#12163A'; ctx.fill();                // the slot
  const on = 1 - clamp(p);
  paint(() => {
    ctx.font = '400 58px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#EAF0FF'; ctx.fillText('LOGIC', x, y - 142);
    ctx.font = '900 30px Montserrat';
    ctx.fillStyle = mixHex('#5A648F', '#4DFFB4', on); ctx.fillText('ON', x - 70, y - 70);
    ctx.fillStyle = mixHex('#5A648F', '#FF5A6E', 1 - on); ctx.fillText('OFF', x - 66, y + 84);
  });
  // the lamp
  circle(ctx, x + 70, y - 70, 20, '#12163A'); circle(ctx, x + 70, y - 70, 14, mixHex('#3A1420', '#4DFFB4', on));
  if (on > 0.05) softDot(gctx, x + 70, y - 70, 70, '#4DFFB4', 0.7 * on);
  circle(ctx, x + 70, y + 84, 20, '#12163A'); circle(ctx, x + 70, y + 84, 14, mixHex('#3A1420', '#FF4A4A', 1 - on));
  if (on < 0.95) softDot(gctx, x + 70, y + 84, 70, '#FF4A4A', 0.7 * (1 - on));
  // the lever
  const ky = lerp(y - 78, y + 92, clamp(p));
  line(ctx, x, y + 8, x, ky, 16, '#C9D0E4');
  circle(ctx, x, ky, 30, '#E5383B');
  paint(() => ellipse(ctx, x - 9, ky - 10, 9, 6, 'rgba(255,255,255,0.6)', -0.6));
  return [x, ky];
}
// a whistle in its mouth at (x, y); blow 0..1 = the blast (a pea-whistle's trill of arcs)
function ctrlWhistle(x, y, s, blow, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -6, -9, 40, 18, 7); ctx.fillStyle = '#E9EDF7'; ctx.fill();
  circle(ctx, 36, -2, 15, '#E9EDF7'); circle(ctx, 36, -2, 6, '#5E6680');
  ctx.restore();
  if (blow > 0.02) paint(() => { for (let i = 0; i < 3; i++) { for (const [cc, w, al] of [[ctx, 7, 0.95], [gctx, 13, 0.5]]) { cc.beginPath(); cc.arc(x + 54 * s, y - 4 * s, (22 + i * 20 + 10 * blow) * s, -0.75, 0.75); cc.lineWidth = (w - i * 1.5) * s; cc.lineCap = 'round'; cc.strokeStyle = `rgba(255,226,120,${al * blow * (1 - i * 0.25)})`; cc.stroke(); } } });
}
