// A camel and a horse in profile (they face LEFT; flip: true faces right), a rider seat for the hero, and the desert
// at dusk. Everything draws under the current camera (world coords).
'use strict';

const BEAST = {
  camel: { body: '#D9A45B', sh: '#A87332', hi: '#F2CD8E', dark: '#6B4418', seat: [8, -512] },
  horse: { body: '#9A6240', sh: '#6E3F26', hi: '#C48A62', dark: '#2A1810', seat: [-6, -404] },
};
let DS_DUNES = null;

function initBeasts() {
  const rng = mulberry32(915);
  DS_DUNES = [0, 1, 2].map((L) => [...Array(40)].map((_, i) => 0.5 + 0.5 * Math.sin(i * (0.5 + L * 0.23) + L * 2 + rng() * 0.6)));
}

// o: {walk: phase (radians; legs step when it moves), bob, chew 0..1, look: -1..1 (the eye toward the camera = 0.6),
//     lid 0..1 (heavy eyelid), flip, bib: text or null, medal, headDX, headDY, headRot, noBody (head + neck only), blanket}
function drawBeast(c, x, y, s, kind, t, o = {}) {
  const B = BEAST[kind], camel = kind === 'camel';
  const ph = o.walk || 0, bob = (o.bob === undefined ? 1 : o.bob) * 8 * Math.sin(ph * 2);
  c.save(); c.translate(x, y); c.scale(s * (o.flip ? -1 : 1), s);
  const leg = (lx, off, far) => {
    const sw = Math.sin(ph + off), up = Math.max(0, Math.cos(ph + off));
    const top = [lx, -262 + bob], kn = [lx - 30 * sw, -136 + bob * 0.5 - 22 * up], ft = [lx - 78 * sw, -6 - 44 * up];
    for (const [w, col] of [[far ? 30 : 34, far ? B.sh : B.body]]) {
      c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = w; c.strokeStyle = col;
      c.beginPath(); c.moveTo(top[0], top[1]); c.lineTo(kn[0], kn[1]); c.lineTo(ft[0], ft[1]); c.stroke();
    }
    circle(c, kn[0], kn[1], far ? 17 : 20, far ? B.sh : B.body);
    c.beginPath(); c.ellipse(ft[0] - 8, ft[1], 26, 13, 0, 0, 7); c.fillStyle = camel ? B.sh : B.dark; c.fill();
  };
  if (!o.noBody) {
    leg(-96, Math.PI, true); leg(150, 0.4, true);
    // tail
    c.lineCap = 'round'; c.lineWidth = camel ? 12 : 26; c.strokeStyle = camel ? B.sh : B.dark;
    c.beginPath(); c.moveTo(196, -340 + bob); c.quadraticCurveTo(262 + 10 * Math.sin(t * 5), -300 + bob, 246 + 16 * Math.sin(t * 5), camel ? -206 : -150); c.stroke();
    if (camel) circle(c, 246 + 16 * Math.sin(t * 5), -200, 15, B.dark);
    // body (+ the hump)
    const g = c.createLinearGradient(0, -430 + bob, 0, -210 + bob); g.addColorStop(0, B.hi); g.addColorStop(0.45, B.body); g.addColorStop(1, B.sh);
    c.fillStyle = g;
    c.beginPath(); c.ellipse(0, -318 + bob, 205, 100, 0, 0, 7); c.fill();
    if (camel) { c.beginPath(); c.moveTo(-128, -382 + bob); c.bezierCurveTo(-80, -520 + bob, 90, -560 + bob, 150, -380 + bob); c.closePath(); c.fill(); }
    if (o.blanket !== false) {   // a saddle blanket
      c.save(); c.translate(B.seat[0], B.seat[1] + bob + (camel ? 44 : 30));
      c.beginPath(); c.moveTo(-78, -14); c.quadraticCurveTo(0, -44, 78, -14); c.lineTo(70, 96); c.lineTo(-70, 96); c.closePath();
      c.fillStyle = '#C8324A'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#FFD447'; c.stroke();
      for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * 26, 96); c.lineTo(i * 26, 116); c.lineWidth = 6; c.strokeStyle = '#FFD447'; c.stroke(); }
      c.restore();
    }
    if (o.bib) {
      c.save(); c.translate(-20, -300 + bob); if (o.flip) c.scale(-1, 1);
      rrect(c, -56, -44, 112, 88, 8); c.fillStyle = '#FBF7EA'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#B9B4A8'; c.stroke();
      c.font = '400 64px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#1A1C2C'; c.fillText(o.bib, 0, 4); c.restore();
    }
    leg(-136, 0, false); leg(110, Math.PI + 0.4, false);
  }
  // neck + head
  const hb = bob * 0.6 + (o.headDY || 0), hx = (camel ? -338 : -300) + (o.headDX || 0), hy = (camel ? -610 : -596) + hb;
  c.lineCap = 'round';
  c.beginPath(); c.moveTo(-150, -330 + bob);
  if (camel) c.bezierCurveTo(-300, -292 + bob, -236, -520 + hb, hx + 30, hy + 22);
  else c.quadraticCurveTo(-250, -470 + bob, hx + 36, hy + 30);
  c.lineWidth = camel ? 70 : 96; c.strokeStyle = B.body; c.stroke();
  c.lineWidth = camel ? 22 : 30; c.strokeStyle = rgba(B.hi, 0.5); c.stroke();
  if (!camel) {   // the mane
    c.beginPath(); c.moveTo(-120, -402 + bob); c.quadraticCurveTo(-214, -520 + bob, hx + 62, hy - 12); c.lineWidth = 30; c.strokeStyle = B.dark; c.stroke();
  }
  c.save(); c.translate(hx, hy); c.rotate((camel ? 0.1 : 0.62) + (o.headRot || 0));
  // ears
  if (camel) { ellipse(c, 58, -34, 13, 20, B.sh, 0.5); }
  else { for (const dx of [40, 62]) { c.beginPath(); c.moveTo(dx - 12, -34); c.lineTo(dx + 2, -78); c.lineTo(dx + 16, -32); c.closePath(); c.fillStyle = dx > 50 ? B.sh : B.body; c.fill(); } }
  // skull + muzzle
  const L = camel ? 1 : 1.25;
  c.beginPath(); c.ellipse(0, 0, 80 * L, 48, 0, 0, 7); c.fillStyle = B.body; c.fill();
  c.beginPath(); c.ellipse(-66 * L, 12, 54, 41, 0, 0, 7); c.fillStyle = camel ? B.hi : B.sh; c.fill();
  // the chewing lower jaw
  const ch = (o.chew || 0);
  c.beginPath(); c.ellipse(-56 * L + 9 * ch * Math.sin(t * 9), 44 + 5 * ch * Math.abs(Math.cos(t * 9)), 40, 15, -0.05, 0, 7); c.fillStyle = B.sh; c.fill();
  // lip line + nostril
  c.lineWidth = 4; c.strokeStyle = B.dark; c.beginPath(); c.moveTo(-114 * L, 20); c.quadraticCurveTo(-84 * L, 34, -34 * L, 30); c.stroke();
  ellipse(c, -100 * L, -2, 8, 5, B.dark, -0.4);
  // the eye: big, bored
  const ex = 6, ey = -16;
  ellipse(c, ex, ey, 19, 17, '#FFFFFF'); circle(c, ex + 6 * (o.look === undefined ? -0.4 : o.look), ey + 2, 9, '#1A1020'); circle(c, ex + 6 * (o.look === undefined ? -0.4 : o.look) - 3, ey - 2, 3, '#FFFFFF');
  const lid = o.lid === undefined ? 0.45 : o.lid;
  c.save(); c.beginPath(); c.ellipse(ex, ey, 20, 18, 0, 0, 7); c.clip(); c.fillStyle = B.sh; c.fillRect(ex - 24, ey - 22, 48, 36 * lid + 4); c.restore();
  c.lineWidth = 4; c.strokeStyle = B.dark; c.beginPath(); c.moveTo(ex - 20, ey - 18 + 36 * lid); c.lineTo(ex + 20, ey - 18 + 36 * lid); c.stroke();
  for (let i = 0; i < 3; i++) line(c, ex - 12 + i * 12, ey - 18 + 36 * lid, ex - 16 + i * 13, ey - 27 + 36 * lid, 3, B.dark);
  if (!camel) { c.beginPath(); c.moveTo(30, -48); c.quadraticCurveTo(-10, -30, -18, 4); c.lineWidth = 16; c.strokeStyle = B.dark; c.stroke(); }
  c.restore();
  if (o.medal) {
    c.beginPath(); c.moveTo(hx + 36, hy + 60); c.lineTo(hx - 6, hy + 190); c.lineTo(hx + 76, hy + 70); c.lineWidth = 9; c.strokeStyle = '#4DA3FF'; c.stroke();
    circle(c, hx - 6, hy + 200, 30, '#FFD447'); circle(c, hx - 6, hy + 200, 20, '#F2A51E');
    c.save(); c.translate(hx - 6, hy + 202); if (o.flip) c.scale(-1, 1); c.font = '400 28px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#7A4A08'; c.fillText('1', 0, 0); c.restore();
  }
  c.restore();
  const f = o.flip ? -1 : 1;
  return { seat: [x + f * B.seat[0] * s, y + (B.seat[1] + bob) * s], head: [x + f * hx * s, y + hy * s], bob: bob * s };
}

// the hero sitting on a beast: frontal rig without legs, his near leg hanging down the flank. Returns his state.
function riderState(seat, s, t, o = {}) {
  let pose = JSON.parse(JSON.stringify(POSES.stand));
  pose.armL = { a: 0.3, b: 0.9 }; pose.armR = { a: 0.3, b: 0.9 };   // hands on the reins, low in front
  pose.lean = o.lean || 0;
  if (o.clutch) pose = clutchPose(pose, o.clutch, t);
  return { x: seat[0], y: seat[1] + 222 * s, s, pose, face: o.face || FACES.calm, noLegs: true, headDX: o.headDX || 0, headDY: o.headDY || 0, headRot: o.headRot || 0 };
}
function riderLeg(c, seat, s, pal, dx = -1) {
  const a = [seat[0] + dx * 30 * s, seat[1] + 10 * s], k = [seat[0] + dx * 52 * s, seat[1] + 96 * s], f = [seat[0] + dx * 44 * s, seat[1] + 190 * s];
  c.lineCap = 'round'; c.lineJoin = 'round';
  c.lineWidth = 48 * s; c.strokeStyle = pal.pantsSh; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(k[0], k[1]); c.lineTo(f[0], f[1]); c.stroke();
  c.lineWidth = 40 * s; c.strokeStyle = pal.pants; c.stroke();
  c.beginPath(); c.ellipse(f[0] + dx * 14 * s, f[1] + 16 * s, 34 * s, 17 * s, 0, 0, 7); c.fillStyle = pal.shoe; c.fill();
  c.beginPath(); c.ellipse(f[0] + dx * 14 * s, f[1] + 26 * s, 34 * s, 7 * s, 0, 0, 7); c.fillStyle = pal.sole; c.fill();
}

// the desert at dusk; dist scrolls it (the rider moves LEFT, so the land streams right)
function desertBack(cam, t, dist = 0) {
  screenSpace();
  const sky = ctx.createLinearGradient(0, 0, 0, 1300);
  sky.addColorStop(0, '#0A0B2A'); sky.addColorStop(0.42, '#2A1E5E'); sky.addColorStop(0.72, '#8A3A6E'); sky.addColorStop(1, '#FF8A4A');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 60; i++) { const x = hash(i * 2.3) * W, y = hash(i * 5.9) * 800, tw = 0.5 + 0.5 * Math.sin(t * 2 + i); circle(ctx, x, y, 1.4 + 1.8 * hash(i), rgba('#FFF2DC', (0.2 + 0.5 * tw) * (1 - y / 900))); }
  applyCam(cam);
  // a low sun
  both((c, g) => { softDot(c, 760, 1090, g ? 300 : 420, '#FFB05A', g ? 0.5 : 0.55); if (!g) circle(c, 760, 1090, 120, '#FFD98A'); else circle(c, 760, 1090, 120, 'rgba(255,200,120,0.5)'); });
  // pyramids far off
  for (const [px, pw, ph] of [[250, 300, 210], [470, 190, 130]]) {
    const x = ((px + dist * 30) % 1700 + 1700) % 1700 - 300;
    ctx.beginPath(); ctx.moveTo(x - pw / 2, 1150); ctx.lineTo(x, 1150 - ph); ctx.lineTo(x + pw / 2, 1150); ctx.closePath(); ctx.fillStyle = '#4A2A5E'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(x, 1150 - ph); ctx.lineTo(x + pw / 2, 1150); ctx.lineTo(x + pw * 0.12, 1150); ctx.closePath(); ctx.fillStyle = '#6A3A6E'; ctx.fill();
  }
  // dunes in three layers
  const cols = [['#5A2F62', '#4A2456'], ['#8A4A52', '#5E2E4A'], ['#C8743E', '#7A3E3A']];
  for (let L = 0; L < 3; L++) {
    const base = 1150 + L * 150, amp = 50 + L * 26, sp = (L + 1) * 70;
    ctx.beginPath(); ctx.moveTo(-400, 2100);
    for (let x = -400; x <= 1500; x += 40) {
      const u = (x - dist * sp) / 190, i = Math.floor(u), f = u - i, a = DS_DUNES[L][((i % 40) + 40) % 40], b = DS_DUNES[L][(((i + 1) % 40) + 40) % 40];
      ctx.lineTo(x, base - amp * lerp(a, b, smooth(f)));
    }
    ctx.lineTo(1500, 2100); ctx.closePath();
    const g = ctx.createLinearGradient(0, base - amp, 0, base + 420); g.addColorStop(0, cols[L][0]); g.addColorStop(1, cols[L][1]);
    ctx.fillStyle = g; ctx.fill();
  }
}
