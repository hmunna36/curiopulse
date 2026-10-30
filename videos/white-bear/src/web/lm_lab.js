// Why Does Your Mouth Water When You Imagine a LEMON? 🍋 Short: the salivation lab (after Hagenmuller et al. 2014: people
// watched a video of a man eating a lemon with cotton rolls in their mouths). World space, the camera at zoom ~1.1-1.7.
//   initLmLab()               paints the room once: a mint wall, a window with blinds, a clock, a SALIVA STUDY poster
//   lmLabBg(cam, t)           the room plate and the bench (the bench is a shape: it takes the light)
//   lmVol(c, x, y, s, t, o)   a volunteer seated behind the bench (head centre at (x, y - 230 s)); o: {look, puff 0..1
//                             (cotton rolls in the cheeks), drip (0..1 a drop of drool running off the chin, looping),
//                             hair: 'bun' | 'curly' | 'bald' | 'pony', skin, skinSh, hairCol, top, wide 0..1, aww 0..1}
//   lmCup(c, x, y, s, level, n, t)  a beaker of drool on the bench with its number
//   lmTV(c, x, y, s, t, o)    a TV on a cart, playing him biting a lemon; o: {bite 0..1, squirt (seconds since), pucker}
//   lmHeart(x, y, r, k, t)    a heart over a head (world space, paint + glow)
'use strict';

const LMLAB = { bench: 1159, vols: [[538, 1159, 1.1], [679, 1159, 1.1], [820, 1159, 1.1]], tv: [400, 676, 1.0] };
const LMV = [
  { hair: 'curly', skin: '#C98B62', skinSh: '#A56A44', hairCol: '#2A1A12', top: '#FF8A5C', topSh: '#D9643A' },
  { hair: 'bun', skin: '#F2C8A8', skinSh: '#D49A78', hairCol: '#7A4A2A', top: '#7FD3B8', topSh: '#4FA88C' },
  { hair: 'bald', skin: '#E0A882', skinSh: '#B97E58', hairCol: '#3A2A20', top: '#C8A8FF', topSh: '#9B7AE0' },
];
let LM_LAB_BG = null;

function initLmLab() {
  const c = mkCanvas(1500, 1500), g = c.getContext('2d');
  const wall = g.createLinearGradient(0, 0, 0, 1500);
  wall.addColorStop(0, '#CFEDE0'); wall.addColorStop(0.7, '#A9D9C6'); wall.addColorStop(1, '#8CC4B0');
  g.fillStyle = wall; g.fillRect(0, 0, 1500, 1500);
  // tiles low on the wall
  for (let y = 900; y < 1500; y += 46) for (let x = (y / 46) % 2 ? -23 : 0; x < 1500; x += 46) { g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(x + 2, y + 2, 42, 42); }
  // a window with blinds, top right: daylight
  g.fillStyle = '#F4FBFF'; g.fillRect(1150, 140, 330, 440);
  const sk = g.createLinearGradient(0, 160, 0, 560); sk.addColorStop(0, '#9FD3F2'); sk.addColorStop(1, '#D8F0FB');
  g.fillStyle = sk; g.fillRect(1170, 160, 290, 400);
  for (let y = 170; y < 560; y += 26) { g.fillStyle = 'rgba(255,255,255,0.75)'; g.fillRect(1170, y, 290, 13); }
  g.fillStyle = '#E2ECEF'; g.fillRect(1150, 580, 330, 22);
  // a clock
  const CX = 690, CY = 250;
  g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(CX, CY, 62, 0, 7); g.fill();
  g.lineWidth = 9; g.strokeStyle = '#2A3A44'; g.stroke();
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; g.fillStyle = '#2A3A44'; g.fillRect(CX + Math.cos(a) * 48 - 3, CY + Math.sin(a) * 48 - 3, 6, 6); }
  g.strokeStyle = '#2A3A44'; g.lineWidth = 7; g.beginPath(); g.moveTo(CX, CY); g.lineTo(CX, CY - 40); g.moveTo(CX, CY); g.lineTo(CX + 30, CY + 10); g.stroke();
  // the poster: SALIVA STUDY with a lemon and a drop
  g.fillStyle = '#FFFFFF'; g.fillRect(830, 150, 270, 360);
  g.fillStyle = '#2E6FB8'; g.fillRect(830, 150, 270, 66);
  g.font = '900 40px Montserrat'; g.textAlign = 'center'; g.fillStyle = '#FFFFFF'; g.fillText('SALIVA', 965, 200);
  g.fillStyle = '#2E6FB8'; g.font = '900 40px Montserrat'; g.fillText('STUDY', 965, 488);
  g.fillStyle = '#F8D21C'; g.beginPath(); g.ellipse(945, 330, 70, 52, -0.2, 0, 7); g.fill();
  g.fillStyle = 'rgba(255,248,170,0.95)'; g.beginPath(); g.ellipse(925, 310, 24, 13, -0.2, 0, 7); g.fill();
  g.fillStyle = '#7FD8FF'; g.beginPath(); g.moveTo(1048, 296); g.bezierCurveTo(1072, 334, 1074, 364, 1048, 372); g.bezierCurveTo(1022, 364, 1024, 334, 1048, 296); g.fill();
  // shelves with jars on the left
  g.fillStyle = '#7FA898'; g.fillRect(0, 520, 420, 14); g.fillRect(0, 700, 420, 14);
  const rng = mulberry32(55);
  for (const sy of [520, 700]) for (let x = 30; x < 400; x += 70) {
    const h = 60 + 50 * rng(); g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillRect(x, sy - h, 46, h);
    g.fillStyle = ['rgba(248,210,28,0.7)', 'rgba(127,216,255,0.6)', 'rgba(255,138,92,0.5)'][Math.floor(rng() * 3)]; g.fillRect(x + 4, sy - h * 0.55, 38, h * 0.55 - 4);
  }
  LM_LAB_BG = mkCanvas(1500, 1500);
  const b = LM_LAB_BG.getContext('2d'); b.filter = 'blur(2px)'; b.drawImage(c, 0, 0);
}

function lmLabBg(cam, t) {
  applyCam(cam);
  ctx.drawImage(LM_LAB_BG, -210, 250);
  softDot(gctx, 1050, 560, 380, '#E8F6FF', 0.25);
  // the floor
  const c = ctx, fg = c.createLinearGradient(0, 1290, 0, 1900); fg.addColorStop(0, '#5E7A72'); fg.addColorStop(1, '#2C3C38');
  c.fillStyle = fg; c.fillRect(-300, 1290, 1700, 700);
}
// the bench in front of them (drawn after them, before the cups): a white counter
function lmBench(cam, t) {
  const c = ctx, y = LMLAB.bench;
  rrect(c, 420, y, 580, 30, 8); c.fillStyle = '#F2F5F4'; c.fill();
  c.fillStyle = '#C9D6D2'; c.fillRect(432, y + 30, 556, 260);
  paint(() => { line(c, 432, y + 32, 988, y + 32, 3, 'rgba(255,255,255,0.7)'); for (const x of [608, 750, 892]) line(c, x, y + 50, x, y + 280, 3, 'rgba(90,110,104,0.4)'); });
}

function lmVol(c, x, y, s, t, o = {}) {
  const L = o.L || LMV[0];
  const puff = clamp(o.puff || 0), look = o.look || [0, 0], wide = clamp(o.wide || 0), aww = clamp(o.aww || 0);
  c.save(); c.translate(x, y); c.scale(s, s);
  // the torso behind the bench
  c.beginPath(); c.moveTo(-86, 10); c.quadraticCurveTo(-90, -120, -60, -150); c.quadraticCurveTo(0, -168, 60, -150); c.quadraticCurveTo(90, -120, 86, 10); c.closePath();
  c.fillStyle = L.top; c.fill();
  paint(() => { c.beginPath(); c.moveTo(-26, -158); c.quadraticCurveTo(0, -130, 26, -158); c.lineWidth = 5; c.strokeStyle = L.topSh; c.stroke(); });
  rrect(c, -15, -186, 30, 34, 10); c.fillStyle = L.skinSh; c.fill();
  // the head
  const hy = -230 + 2 * Math.sin(t * 2 + x);
  c.save(); c.translate(0, hy); c.rotate(o.tilt || 0);
  if (L.hair === 'curly') for (let i = 0; i < 12; i++) { const a = Math.PI * (0.98 + i * 0.09); circle(c, Math.cos(a) * 52, -6 + Math.sin(a) * 56, 24, L.hairCol); }
  if (L.hair === 'pony') ellipse(c, 50, 6, 20, 44, L.hairCol, -0.4);
  for (const sd of [-1, 1]) ellipse(c, sd * 50, 6, 10, 15, L.skinSh);
  // the face shape: the cheeks bulge out with the cotton rolls
  c.beginPath(); c.ellipse(0, 0, 52, 58, 0, Math.PI, Math.PI * 2);
  c.bezierCurveTo(52 + 10 * puff, 20, 46 + 12 * puff, 52, 0, 62);
  c.bezierCurveTo(-46 - 12 * puff, 52, -52 - 10 * puff, 20, -52, 0); c.closePath();
  const hg = c.createRadialGradient(-18, -22, 6, 0, 8, 74); hg.addColorStop(0, mixHex(L.skin, '#FFFFFF', 0.22)); hg.addColorStop(0.55, L.skin); hg.addColorStop(1, L.skinSh);
  c.fillStyle = hg; c.fill();
  if (L.hair === 'bun') {
    c.beginPath(); c.moveTo(-54, 6); c.quadraticCurveTo(-60, -58, 0, -62); c.quadraticCurveTo(60, -58, 54, 6); c.quadraticCurveTo(38, -32, 0, -34); c.quadraticCurveTo(-38, -32, -54, 6); c.closePath();
    c.fillStyle = L.hairCol; c.fill(); circle(c, 0, -70, 24, L.hairCol);
  } else if (L.hair === 'bald') {
    for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(sd * 48, -6, 9, 24, 0, 0, Math.PI * 2); c.fillStyle = L.hairCol; c.fill(); }
  } else if (L.hair === 'curly') {
    for (let i = 0; i < 7; i++) circle(c, -40 + i * 13, -48 + 6 * Math.sin(i * 1.7), 18, L.hairCol);
  }
  paint(() => {
    if (L.hair === 'bald') ellipse(c, -14, -38, 16, 8, 'rgba(255,255,255,0.35)', -0.3);
    // eyes: on the TV (left and a little down), wider as it gets sour
    const ry = 12 + 6 * wide - 4 * aww;
    for (const sd of [-1, 1]) {
      const ex = sd * 21, ey = -4;
      if (aww > 0.6) { c.beginPath(); c.moveTo(ex - 11, ey + 2); c.quadraticCurveTo(ex, ey - 8, ex + 11, ey + 2); c.lineWidth = 4; c.strokeStyle = '#3A2026'; c.lineCap = 'round'; c.stroke(); continue; }
      ellipse(c, ex, ey, 11, ry, '#FFFFFF');
      circle(c, ex + look[0] * 4, ey + look[1] * 4, 5.8, '#1A1420'); circle(c, ex + look[0] * 4 - 1.8, ey + look[1] * 4 - 2, 1.9, '#FFFFFF');
      line(c, sd * 10, -26 - 4 * wide, sd * 32, -24 - 2 * wide + 3 * aww, 5, L.hairCol === '#3A2A20' ? '#3A2A20' : L.hairCol);
    }
    // the cheeks: round, pink, stuffed
    for (const sd of [-1, 1]) ellipse(c, sd * (34 + 6 * puff), 26, 12 + 4 * puff, 8 + 3 * puff, 'rgba(255,110,110,0.3)');
    // the mouth: lips shut round the rolls, the cotton poking out at both corners
    const mw = 12 + 6 * puff;
    c.beginPath(); c.moveTo(-mw, 36); c.quadraticCurveTo(0, 42 - 6 * aww, mw, 36); c.lineWidth = 4.5; c.strokeStyle = '#7A2A30'; c.lineCap = 'round'; c.stroke();
    if (puff > 0.05) for (const sd of [-1, 1]) {
      c.save(); c.translate(sd * (mw + 2), 36); c.rotate(sd * 0.25);
      rrect(c, -7 * puff, -5, 14 * puff, 10, 5); c.fillStyle = '#FAFAF6'; c.fill(); c.lineWidth = 1.5; c.strokeStyle = 'rgba(160,160,170,0.8)'; c.stroke();
      c.restore();
    }
  });
  c.restore();
  // a drop of drool off the chin, on a loop (drip: 0 none .. 1 it has fallen)
  const dp = o.drip || 0;
  if (dp > 0.01 && dp < 0.999) {
    const u = dp, yy = hy + 46 + (u < 0.5 ? 44 * u / 0.5 : 44 + 200 * Math.pow((u - 0.5) / 0.5, 2)), r = 6 + 4 * Math.min(1, u / 0.5);
    paint(() => {
      if (u < 0.55) { c.beginPath(); c.moveTo(8, hy + 38); c.quadraticCurveTo(12, (hy + 38 + yy) / 2, 8, yy - r); c.lineWidth = 4; c.strokeStyle = 'rgba(150,226,255,0.95)'; c.stroke(); }
      circle(c, 8, yy, r, 'rgba(150,226,255,0.98)'); circle(c, 5.5, yy - 2.5, r * 0.42, 'rgba(255,255,255,0.98)');
    });
  }
  c.restore();
}

function lmCup(c, x, y, s, level, n, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  // a beaker standing on the bench (y = its base)
  c.beginPath(); c.moveTo(-34, -96); c.lineTo(34, -96); c.lineTo(34, -6); c.quadraticCurveTo(34, 0, 28, 0); c.lineTo(-28, 0); c.quadraticCurveTo(-34, 0, -34, -6); c.closePath();
  c.fillStyle = 'rgba(236,248,255,0.82)'; c.fill();
  paint(() => {
    const lv = clamp(level), ly = -4 - 86 * lv;
    if (lv > 0.01) {
      c.beginPath(); c.moveTo(-32, ly); c.quadraticCurveTo(0, ly + 4 + 2 * Math.sin(t * 6 + x), 32, ly); c.lineTo(32, -6); c.lineTo(-32, -6); c.closePath();
      c.fillStyle = '#4FC3F2'; c.fill();
      ellipse(c, -10, ly + 6, 12, 3, 'rgba(255,255,255,0.8)');
    }
    c.beginPath(); c.moveTo(-34, -96); c.lineTo(-34, -6); c.quadraticCurveTo(-34, 0, -28, 0); c.lineTo(28, 0); c.quadraticCurveTo(34, 0, 34, -6); c.lineTo(34, -96);
    c.lineWidth = 4; c.strokeStyle = 'rgba(255,255,255,0.95)'; c.stroke();
    for (let i = 1; i <= 4; i++) line(c, -34, -4 - i * 18, -22, -4 - i * 18, 2.5, 'rgba(255,255,255,0.8)');
    circle(c, 0, 26, 17, '#2E6FB8'); c.font = '900 22px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#FFFFFF'; c.fillText(String(n), 0, 27);
  });
  c.restore();
}

// the TV on its cart, playing him biting a lemon (the hook, again); x, y = the screen's centre
function lmTV(c, x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  // the wall bracket, then the set
  rrect(c, -30, -40, 60, 80, 6); c.fillStyle = '#7A8A90'; c.fill();
  rrect(c, -150, -110, 300, 236, 16); c.fillStyle = '#20262E'; c.fill();
  c.restore();
  // the picture (screen space inside the frame: flat, a picture on a screen)
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); rrect(c, -136, -96, 272, 200, 8); c.clip();
  const bg = c.createLinearGradient(0, -96, 0, 104); bg.addColorStop(0, '#62A9E8'); bg.addColorStop(0.55, '#BFE6F7'); bg.addColorStop(0.56, '#2F7D3A'); bg.addColorStop(1, '#24602E');
  c.fillStyle = bg; c.fillRect(-140, -100, 280, 210);
  for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(248,210,28,0.8)'; c.beginPath(); c.ellipse(-120 + i * 48, 30 + 10 * Math.sin(i * 2), 7, 5, 0, 0, 7); c.fill(); }
  // him, head and shoulders
  c.save(); c.translate(-6, 30); c.scale(0.9, 0.9);
  c.beginPath(); c.moveTo(-110, 140); c.quadraticCurveTo(-100, 70, -40, 64); c.lineTo(40, 64); c.quadraticCurveTo(100, 70, 110, 140); c.closePath(); c.fillStyle = LMPAL.coat; c.fill();
  rrect(c, -16, 40, 32, 30, 8); c.fillStyle = LMPAL.skinSh; c.fill();
  const bite = clamp(o.bite || 0), pk = clamp(o.pucker || 0);
  const face = { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 0.4 + 0.9 * pk, browTilt: 0.9 * pk, mouth: 'none', mouthOpen: 0, blink: pk > 0.5 ? 1 : 0, cross: 0, squeeze: pk };
  drawHead(c, { head: [0, -30], lean: 0 }, face, { headDX: 2 * Math.sin(t * 40) * pk, headDY: 0, headRot: 0, frizz: 0, seed: 3 }, LMPAL, t);
  c.save(); c.translate(2 * Math.sin(t * 40) * pk, -30);
  twMouth(c, bite > 0.5 ? 'P' : 'A', { pal: LMPAL });
  c.save(); c.translate(64, 52); c.rotate(-0.1); lmWedge(c, { L: 44, R: 24, bite: bite > 0.5 ? 1 : 0 }); c.restore();
  if ((o.squirt || 0) > 0) lmJuice(c, [24, 40], o.squirt, { n: 12, seed: 4, s: 0.6, dir: -0.9, spread: 1.6, v: 380 });
  c.restore();
  c.restore();
  // scan lines and a sheen
  for (let yy = -96; yy < 104; yy += 6) { c.fillStyle = 'rgba(0,0,0,0.06)'; c.fillRect(-136, yy, 272, 2); }
  c.restore();
  c.save(); c.translate(x, y); c.scale(s, s);
  paint(() => { c.beginPath(); c.moveTo(-136, -96); c.lineTo(-40, -96); c.lineTo(-120, 104); c.lineTo(-136, 104); c.closePath(); c.fillStyle = 'rgba(255,255,255,0.07)'; c.fill(); circle(c, 128, 114, 4, '#FF4D4D'); });
  c.restore();
}

// a heart over a volunteer's head (world space); k pops it, r its size
function lmHeart(x, y, r, k, t, beat = 0) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.2) * (1 + 0.08 * Math.sin(t * 7) + 0.18 * beat);
  const c = ctx;
  paint(() => {
    c.save(); c.translate(x, y); c.scale(s, s);
    c.beginPath(); c.moveTo(0, r * 0.62);
    c.bezierCurveTo(-r * 1.05, -r * 0.05, -r * 0.72, -r * 0.92, 0, -r * 0.44);
    c.bezierCurveTo(r * 0.72, -r * 0.92, r * 1.05, -r * 0.05, 0, r * 0.62); c.closePath();
    c.lineWidth = Math.max(4, r * 0.12); c.strokeStyle = '#7A0F2A'; c.stroke();
    const g = c.createRadialGradient(-r * 0.3, -r * 0.4, 2, 0, 0, r * 1.1); g.addColorStop(0, '#FFB3C1'); g.addColorStop(0.5, '#FF4D6D'); g.addColorStop(1, '#C0163E');
    c.fillStyle = g; c.fill();
    ellipse(c, -r * 0.36, -r * 0.3, r * 0.2, r * 0.12, 'rgba(255,255,255,0.75)', -0.5);
    c.restore();
  });
  softDot(gctx, x, y, r * 2.2 * s, '#FF4D6D', 0.32 * clamp(k));
}
