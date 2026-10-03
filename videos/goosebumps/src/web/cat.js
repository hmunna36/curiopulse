// The snowy yard at night (goosebumps): a ginger cat that fluffs its fur (warm air trapped in it), then puffs up HUGE
// when a dog's shadow looms; the dog thinks again. Loaded before scenes.js (see scene.html).
'use strict';

const CATC = { fur: '#F2923C', dark: '#C96A22', light: '#FFDDB0', ear: '#F7A8B0', line: '#7A3A12' };
let YARD_STATIC = null;

function initCat() {
  const cv = mkCanvas(W, H), c = cv.getContext('2d');
  const g = c.createLinearGradient(0, 0, 0, 1250); g.addColorStop(0, '#081233'); g.addColorStop(0.6, '#16306E'); g.addColorStop(1, '#3A62B0');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  const rs = mulberry32(61);
  for (let i = 0; i < 70; i++) circle(c, rs() * W, rs() * 900, 1 + rs() * 2, `rgba(225,235,255,${0.3 + rs() * 0.6})`);
  // far pines
  for (let i = 0; i < 9; i++) {
    const x = -40 + i * 140 + rs() * 50, h = 260 + rs() * 200, by = 1150;
    c.fillStyle = i % 2 ? '#0C1C48' : '#102456';
    for (let k = 0; k < 4; k++) { const w = (110 - k * 22) * (h / 380), y0 = by - h * (0.2 + k * 0.2); c.beginPath(); c.moveTo(x - w, y0); c.lineTo(x, y0 - h * 0.36); c.lineTo(x + w, y0); c.closePath(); c.fill(); }
    c.fillRect(x - 8, by - h * 0.22, 16, h * 0.24);
  }
  // snow ground with soft mounds
  const sg = c.createLinearGradient(0, 1120, 0, H); sg.addColorStop(0, '#DCE8FF'); sg.addColorStop(0.35, '#A9C0F0'); sg.addColorStop(1, '#5E78C0');
  c.fillStyle = sg; c.beginPath(); c.moveTo(0, H);
  for (let x = 0; x <= W; x += 20) c.lineTo(x, 1150 + 22 * Math.sin(x / 170 + 1) + 10 * Math.sin(x / 61));
  c.lineTo(W, H); c.closePath(); c.fill();
  for (let i = 0; i < 40; i++) circle(c, rs() * W, 1190 + rs() * 600, 2 + rs() * 3, 'rgba(255,255,255,0.5)');
  YARD_STATIC = cv;
}

function yardBg(cam, t) {
  applyCam(cam);
  ctx.drawImage(YARD_STATIC, -220, -160, W + 440, H + 320);
  softDot(gctx, 200, 470, 170, '#9FB8FF', 0.4); softDot(ctx, 200, 470, 150, '#DCE6FF', 0.5); circle(ctx, 200, 470, 46, '#F2F5FF');
}

// a ring of fur spikes around an ellipse (drawn before the shape itself, so only the tips show)
function furRing(c, cx, cy, rx, ry, n, len, col, t, seed, a0 = 0, a1 = Math.PI * 2) {
  if (len <= 1) return;
  c.fillStyle = col; c.beginPath();
  for (let i = 0; i < n; i++) {
    const a = a0 + (a1 - a0) * (i + 0.5) / n, da = (a1 - a0) / n * 0.72;
    const l = len * (0.62 + 0.6 * hash(i + seed * 13)) * (1 + 0.06 * Math.sin(t * 7 + i * 1.7));
    const ex = Math.cos(a), ey = Math.sin(a);
    c.moveTo(cx + Math.cos(a - da) * rx * 0.96, cy + Math.sin(a - da) * ry * 0.96);
    c.lineTo(cx + ex * (rx + l), cy + ey * (ry + l));
    c.lineTo(cx + Math.cos(a + da) * rx * 0.96, cy + Math.sin(a + da) * ry * 0.96);
  }
  c.fill();
}

// the cat, sitting, facing us. Base centre at (x, y), about 520 units tall at s = 1.
// o: {puff 0..2 (fur standing), happy 0..1 (eyes shut, content), scared 0..1 (wide eyes, ears back, hiss),
//  lookX -1..1, tailUp 0..1, shiver (px), warm 0..1 (the trapped warm air glows)}
function drawCat(c, x, y, s, t, o = {}) {
  const puff = o.puff || 0, happy = o.happy || 0, scared = o.scared || 0, lookX = o.lookX || 0, tailUp = o.tailUp || 0;
  const sx = (o.shiver || 0) * Math.sin(t * 46), F = CATC;
  const spike = 12 + 58 * puff, fat = 1 + 0.07 * Math.min(puff, 1.6);
  c.save(); c.translate(x + sx, y); c.scale(s, s);
  const bob = 3 * Math.sin(t * 2.4);
  // the warm air it traps: a glow that hugs the body, inside the fur
  const warm = o.warm || 0;
  if (warm > 0.01) {
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + t * 0.4, rr = 1 + 0.06 * Math.sin(t * 3 + i);
      softDot(c, Math.cos(a) * 200 * fat * rr, -210 + Math.sin(a) * 250 * rr, 110, '#FF8A2A', 0.2 * warm);
    }
  }
  // tail: curled round the feet, or straight up like a bottle brush
  const tw = 44 + 34 * Math.min(puff, 1.6);
  const tailPts = [];
  for (let i = 0; i <= 16; i++) {
    const u = i / 16;
    const cx1 = 120 + 150 * Math.sin(u * 2.2), cy1 = -30 - 150 * u * u - 30 * Math.sin(u * 3);       // the curl
    const cx2 = 150 + 30 * Math.sin(u * 3 + t * 6) * u, cy2 = -40 - 400 * u;                         // straight up
    tailPts.push([lerp(cx1, cx2, tailUp), lerp(cy1, cy2, tailUp)]);
  }
  if (puff > 0.05) for (let i = 2; i < tailPts.length; i += 1) furRing(c, tailPts[i][0], tailPts[i][1], tw * 0.42, tw * 0.42, 7, spike * 0.7, F.fur, t, i);
  poly(c, tailPts, tw, F.fur);
  for (let i = 4; i < tailPts.length - 1; i += 4) line(c, tailPts[i][0] - tw * 0.3, tailPts[i][1], tailPts[i][0] + tw * 0.3, tailPts[i][1] - 6, 9, F.dark);
  circle(c, tailPts[16][0], tailPts[16][1], tw * 0.5, F.dark);
  // body
  const bw = 152 * fat, bh = 178;
  furRing(c, 0, -168 + bob, bw, bh, 30, spike, F.fur, t, 1, -Math.PI * 1.02, Math.PI * 0.02);
  furRing(c, 0, -168 + bob, bw, bh, 12, spike * 0.5, F.fur, t, 2, 0.1, Math.PI - 0.1);
  const bg = c.createRadialGradient(-40, -230, 20, 0, -160, 240); bg.addColorStop(0, '#FFB25E'); bg.addColorStop(0.6, F.fur); bg.addColorStop(1, '#D97A28');
  c.beginPath(); c.ellipse(0, -168 + bob, bw, bh, 0, 0, Math.PI * 2); c.fillStyle = bg; c.fill();
  for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(sd * (bw - 4), -230 + i * 54 + bob); c.quadraticCurveTo(sd * (bw - 50), -214 + i * 54 + bob, sd * (bw - 78), -232 + i * 54 + bob); c.lineWidth = 13; c.lineCap = 'round'; c.strokeStyle = F.dark; c.stroke(); }
  ellipse(c, 0, -150 + bob, 84 * fat, 122, F.light);                                                 // the bib
  if (puff > 0.3) furRing(c, 0, -150 + bob, 84 * fat, 122, 14, 16 * Math.min(puff, 1.5), F.light, t, 5, -Math.PI * 0.95, -Math.PI * 0.05);
  // front legs + paws
  for (const sd of [-1, 1]) {
    rrect(c, sd * 46 - 27, -150, 54, 150, 26); c.fillStyle = F.fur; c.fill();
    ellipse(c, sd * 46, -8, 36, 22, F.light);
    for (const q of [-12, 0, 12]) line(c, sd * 46 + q, -6, sd * 46 + q, 8, 3, 'rgba(160,100,60,0.5)');
  }
  // head
  const hy = -398 + bob * 1.4, hw = 138 * (1 + 0.04 * Math.min(puff, 1.6)), hh = 114;
  // ears (they fold back when scared)
  for (const sd of [-1, 1]) {
    c.save(); c.translate(sd * 88, hy - 74); c.rotate(sd * (0.12 + 0.75 * scared));
    c.beginPath(); c.moveTo(-46, 30); c.lineTo(sd * 6, -78); c.lineTo(46, 30); c.closePath(); c.fillStyle = F.fur; c.fill();
    c.beginPath(); c.moveTo(-22, 22); c.lineTo(sd * 4, -44); c.lineTo(24, 22); c.closePath(); c.fillStyle = F.ear; c.fill();
    c.restore();
  }
  furRing(c, 0, hy, hw, hh, 26, spike * 0.8, F.fur, t, 3);
  const hg = c.createRadialGradient(-36, hy - 40, 16, 0, hy, 160); hg.addColorStop(0, '#FFB25E'); hg.addColorStop(0.65, F.fur); hg.addColorStop(1, '#DE8030');
  c.beginPath(); c.ellipse(0, hy, hw, hh, 0, 0, Math.PI * 2); c.fillStyle = hg; c.fill();
  for (const q of [-30, 0, 30]) line(c, q, hy - hh + 8, q * 0.8, hy - hh + 48 - Math.abs(q) * 0.4, 12, F.dark);    // forehead stripes
  for (const sd of [-1, 1]) for (let i = 0; i < 2; i++) line(c, sd * (hw - 6), hy - 6 + i * 30, sd * (hw - 44), hy + i * 30, 10, F.dark);
  ellipse(c, 0, hy + 44, 60, 40, F.light);                                                           // muzzle
  // eyes
  for (const sd of [-1, 1]) {
    const ex = sd * 54, ey = hy - 8, er = 31 * (1 + 0.28 * scared);
    if (happy > 0.6 && scared < 0.3) {                                                               // content: two smiling arcs
      c.beginPath(); c.moveTo(ex - 26, ey + 6); c.quadraticCurveTo(ex, ey - 22, ex + 26, ey + 6); c.lineWidth = 8; c.lineCap = 'round'; c.strokeStyle = F.line; c.stroke();
    } else {
      ellipse(c, ex, ey, er * 0.94, er, scared > 0.5 ? '#FFFFFF' : '#DDF07A');
      c.beginPath(); c.ellipse(ex, ey, er * 0.94, er, 0, 0, Math.PI * 2); c.lineWidth = 5; c.strokeStyle = F.line; c.stroke();
      if (scared > 0.5) ellipse(c, ex + lookX * 7, ey, er * 0.62, er * 0.66, '#C8E060');
      const prx = lerp(7, 15, scared), pry = lerp(23, 17, scared);
      ellipse(c, ex + lookX * 9, ey, prx, pry, '#15131F'); circle(c, ex + lookX * 9 - 5, ey - 9, 5, '#FFFFFF');
      const lidK = clamp(happy * 0.6 * (1 - scared));
      if (lidK > 0.02) { c.save(); c.beginPath(); c.ellipse(ex, ey, er, er + 1, 0, 0, Math.PI * 2); c.clip(); c.fillStyle = F.fur; c.fillRect(ex - er - 2, ey - er - 2, 2 * er + 4, 2 * er * lidK); c.restore(); }
    }
  }
  // nose + mouth
  c.beginPath(); c.moveTo(-13, hy + 26); c.lineTo(13, hy + 26); c.lineTo(0, hy + 40); c.closePath(); c.fillStyle = '#F07A90'; c.fill();
  if (scared > 0.4) {                                                                                  // the hiss
    const mo = scared;
    ellipse(c, 0, hy + 68, 30, 22 * mo, '#5A1522'); ellipse(c, 0, hy + 78, 16, 9 * mo, '#E0616C');
    for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(sd * 20, hy + 50); c.lineTo(sd * 14, hy + 74); c.lineTo(sd * 8, hy + 50); c.closePath(); c.fillStyle = '#FFFFFF'; c.fill(); }
  } else {
    c.beginPath(); c.moveTo(-24, hy + 52 - 6 * happy); c.quadraticCurveTo(-12, hy + 64, 0, hy + 48); c.quadraticCurveTo(12, hy + 64, 24, hy + 52 - 6 * happy);
    c.lineWidth = 5; c.lineCap = 'round'; c.strokeStyle = F.line; c.stroke();
  }
  // whiskers (they bristle forward when scared)
  for (const sd of [-1, 1]) for (let i = -1; i <= 1; i++) line(c, sd * 46, hy + 44 + i * 6, sd * (150 + 20 * scared), hy + 36 + i * (20 + 16 * scared) - 10 * scared, 3, 'rgba(255,255,255,0.85)');
  c.restore();
  if (warm > 0.01) for (let i = 0; i < 10; i++) {            // the bloom sits in the fur, not over the face
    const a = (i / 10) * Math.PI * 2 + t * 0.4;
    softDot(gctx, x + Math.cos(a) * 225 * s, y - 215 * s + Math.sin(a) * 275 * s, 84 * s, '#FF8A2A', 0.2 * warm * (0.8 + 0.2 * Math.sin(t * 4 + i)));
  }
}

// cold wind streaks that reach the cat and bend away (screen space under the current transform)
function coldWind(c, t, x, y, k, n = 6) {
  if (k <= 0) return;
  for (let i = 0; i < n; i++) {
    const p = ((t * 0.9 + i * 0.37) % 1), yy = y - 420 + i * 78 + 20 * Math.sin(i * 3);
    const x0 = lerp(-80, x - 300, p), a = Math.sin(Math.PI * p) * 0.75 * k;
    const up = i % 2 ? -1 : 1;
    c.beginPath(); c.moveTo(x0 - 150, yy); c.quadraticCurveTo(x0 - 40, yy, x0, yy + up * 46 * p);
    c.lineWidth = 6; c.lineCap = 'round'; c.strokeStyle = `rgba(190,230,255,${a})`; c.stroke();
  }
}

// a light bulb (screen space): "genius"
function bulbIcon(x, y, s, k, t) {
  if (k <= 0) return;
  const c = ctx, sc = E.outBack(clamp(k), 2.2) * s;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.translate(x, y); c.rotate(0.12); c.scale(sc, sc);
  for (let i = 0; i < 7; i++) { const a = -Math.PI + i * Math.PI / 6; line(c, Math.cos(a) * 70, -14 + Math.sin(a) * 70, Math.cos(a) * 96, -14 + Math.sin(a) * 96, 8, '#FFE680'); }
  circle(c, 0, -14, 52, '#FFD447'); circle(c, -14, -28, 16, 'rgba(255,255,255,0.7)');
  rrect(c, -24, 30, 48, 34, 8); c.fillStyle = '#9AA3C4'; c.fill(); line(c, -20, 42, 20, 42, 4, '#5A6288'); line(c, -20, 52, 20, 52, 4, '#5A6288');
  c.restore();
  softDot(gctx, x, y - 14 * sc, 130 * sc, '#FFD447', 0.85 * clamp(k));
}

// the dog: a big dark shape leaning in from the right, in profile, looking left. (x, y) = its eye.
// o: {snarl 0..1, fear 0..1, k: slide-in 0..1}
function dogShadow(c, x, y, s, t, o = {}) {
  const snarl = o.snarl || 0, fear = o.fear || 0, col = '#070A1C', rim = 'rgba(120,150,255,0.5)';
  c.save(); c.translate(x, y); c.scale(s, s); c.rotate(-0.06 + 0.1 * fear);
  const body = () => {
    c.beginPath();
    c.moveTo(-250, 60);                                          // nose tip
    c.quadraticCurveTo(-262, 20, -220, 6);                       // nose
    c.lineTo(-80, -40);                                          // the bridge
    c.quadraticCurveTo(-40, -110, 30, -120);                     // forehead
    c.lineTo(60, -250 + 60 * fear); c.lineTo(150, -110);         // the ear (it droops when afraid)
    c.quadraticCurveTo(330, -60, 420, 160);                      // the neck and back
    c.lineTo(520, 900); c.lineTo(-110, 900);                     // down out of frame
    c.quadraticCurveTo(-190, 520, -10, 262);                     // the chest, pushed forward
    c.quadraticCurveTo(-60, 200, -120, 190 + 40 * snarl);        // under the jaw
    c.lineTo(-236, 130 + 34 * snarl);                            // lower jaw to the chin
    c.quadraticCurveTo(-250, 116 + 30 * snarl, -200, 104 + 20 * snarl);
    c.lineTo(-90, 110);                                          // the mouth line back to the corner
    c.lineTo(-230, 92); c.closePath();
  };
  body(); c.fillStyle = col; c.fill(); c.lineWidth = 7; c.lineJoin = 'round'; c.strokeStyle = rim; c.stroke();
  // teeth
  if (snarl > 0.1) {
    c.fillStyle = `rgba(240,244,255,${snarl})`;
    for (let i = 0; i < 6; i++) { const tx = -224 + i * 24; c.beginPath(); c.moveTo(tx, 92 + i * 2.6); c.lineTo(tx + 9, 92 + i * 2.6 + 24 * snarl); c.lineTo(tx + 18, 94 + i * 2.6); c.closePath(); c.fill(); }
  }
  circle(c, -232, 30, 20, '#000000');                            // the nose
  // the eye: a mean slit, then a round worried dot
  if (fear < 0.5) {
    c.beginPath(); c.moveTo(-70, -30); c.lineTo(10, -52); c.lineTo(6, -14); c.closePath(); c.fillStyle = '#FFD447'; c.fill();
    circle(c, -22, -32, 9, '#1A1200');
  } else {
    circle(c, -30, -34, 30, '#FFFFFF'); circle(c, -42, -30, 10, '#0A0A14');
    line(c, -64, -84, -4, -74, 9, '#FFFFFF');
  }
  c.restore();
  if (fear < 0.5) softDot(gctx, x - 22 * s, y - 32 * s, 60 * s, '#FFD447', 0.9);
}
