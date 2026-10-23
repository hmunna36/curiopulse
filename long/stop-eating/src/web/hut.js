// What Happens If You Stop Eating? (Day by Day) (long-form, 1920x1080): the mountain hut where he waits out the storm.
// The hero (the hiker rig in his yellow coat) sits behind a rough table on the left; on the table, from left to right:
// the plate with the lemon, Pip's chocolate bar (the motif), the candle (it burns down day by day), the emergency
// radio (Pip's voice comes out of it), a tin mug. The stove glows on the far left; the window on the right shows the
// blizzard, and the fox that stole his food bag sits on the sill outside. Tally marks by the window count the days.
// Light: the stove and the candle are warm (left and middle), the window is cold blue; the warm part shrinks as the
// days go on (o.cold 0..1); on day 7 the sun comes through the window (o.sun 0..1). World coords = screen coords at
// zoom 1.
'use strict';

const HUT = { floorY: 905, tableY: 760, frontY: 800, heroX: 690, heroY: 812, hs: 0.82,
  winX: 1300, winY: 150, winW: 440, winH: 420, stoveX: 215, plateX: 520, chocX: 860, candleX: 1035, radioX: 1210, mugX: 1420 };
// the paint/actor marks of the Shorts' cinematic look do nothing in this engine (it has no light stage)
const paint = (fn) => fn();
const actor = (fn) => fn();

// faces for this film (the rig's FACES, plus these)
FACES.sour = { eyeOpen: 0.5, pupil: 1, lookX: 0, lookY: 0, browY: 1.1, browTilt: 1.2, mouth: 'o', mouthOpen: 0.05, blink: 0.85, cross: 0, squeeze: 1 };
FACES.smug = { eyeOpen: 1, pupil: 1, lookX: 0.6, lookY: 0, browY: 0.2, browTilt: -0.6, mouth: 'flat', mouthOpen: 0.2, blink: 0.4, cross: 0 };
FACES.deadpan = { eyeOpen: 1, pupil: 1.05, lookX: 0, lookY: 0.1, browY: -0.15, browTilt: -0.25, mouth: 'flat', mouthOpen: 0, blink: 0.48, cross: 0 };
FACES.hungry = { eyeOpen: 1.2, pupil: 1.25, lookX: 0.7, lookY: 0.5, browY: 0.7, browTilt: 0.9, mouth: 'o', mouthOpen: 0.25, blink: 0, cross: 0 };
FACES.longing = { eyeOpen: 1.05, pupil: 1.3, lookX: 0.6, lookY: 0.7, browY: 0.8, browTilt: 1.1, mouth: 'flat', mouthOpen: 0.1, blink: 0.1, cross: 0 };
FACES.grumpy = { eyeOpen: 0.85, pupil: 0.9, lookX: 0.9, lookY: 0, browY: -0.5, browTilt: -1.2, mouth: 'flat', mouthOpen: 0, blink: 0.3, cross: 0 };
FACES.shout = { eyeOpen: 1.1, pupil: 0.8, lookX: 0.9, lookY: 0, browY: -0.3, browTilt: -1.3, mouth: 'scream', mouthOpen: 0.6, blink: 0, cross: 0 };
FACES.tired = { eyeOpen: 0.85, pupil: 1, lookX: 0.3, lookY: 0.3, browY: 0.2, browTilt: 0.6, mouth: 'flat', mouthOpen: 0.1, blink: 0.5, cross: 0 };
FACES.wonder = { eyeOpen: 1.25, pupil: 1.15, lookX: 0, lookY: -0.6, browY: 1.1, browTilt: 0.4, mouth: 'o', mouthOpen: 0.4, blink: 0, cross: 0 };
FACES.happy = { eyeOpen: 1, pupil: 1.05, lookX: 0.3, lookY: 0, browY: 0.6, browTilt: -0.2, mouth: 'grin', mouthOpen: 0.6, blink: 0.2, cross: 0 };
FACES.soft = { eyeOpen: 1, pupil: 1.12, lookX: 0.5, lookY: -0.2, browY: 0.6, browTilt: 0.5, mouth: 'grin', mouthOpen: 0.25, blink: 0.15, cross: 0 };
FACES.count = { eyeOpen: 0.95, pupil: 1, lookX: -0.2, lookY: -0.7, browY: 0.5, browTilt: 0.3, mouth: 'flat', mouthOpen: 0.15, blink: 0.1, cross: 0 };
FACES.proud = { eyeOpen: 1.05, pupil: 0.95, lookX: 0.4, lookY: -0.3, browY: 0.5, browTilt: -0.5, mouth: 'grin', mouthOpen: 0.45, blink: 0.25, cross: 0 };
FACES.sniff = { eyeOpen: 0.7, pupil: 1, lookX: -0.4, lookY: 0.6, browY: 0.4, browTilt: 0.2, mouth: 'flat', mouthOpen: 0, blink: 0.6, cross: 0 };
FACES.yuck = { eyeOpen: 0.6, pupil: 1, lookX: -0.6, lookY: 0.3, browY: 0.9, browTilt: 1.1, mouth: 'wavy', mouthOpen: 0.3, blink: 0.5, cross: 0 };

// the face, plus what the days do to it: f.bags 0..1 (dark rings under the eyes), f.hollow 0..1 (shadowed cheeks),
// f.stubble 0..1, f.drool 0..1 (a drop from the corner of the mouth), f.blue 0..1 (cold lips and nose)
const HUT_FACE0 = drawFace;
drawFace = function (c, f, pal) {
  const hol = f.hollow || 0, st = f.stubble || 0;
  if (hol > 0.02) for (const s of [-1, 1]) ellipse(c, s * 40, 30, 13, 20, `rgba(150,80,60,${0.22 * hol})`, s * 0.3);
  if (st > 0.02) {
    const rng = mulberry32(77);
    for (let i = 0; i < 70; i++) {
      const a = Math.PI * (0.12 + 0.76 * rng()), rr = 46 + 20 * rng();
      const x = Math.cos(a) * rr * 0.95, y = Math.sin(a) * rr * 0.8 + 12;
      if (y < 30 || Math.abs(x) < 18 && y < 52) continue;
      circle(c, x, y, 1.6, `rgba(60,36,28,${0.5 * st})`);
    }
  }
  const bg = f.bags || 0;
  if (bg > 0.02) for (const s of [-1, 1]) {
    c.beginPath(); c.ellipse(s * 24, 13, 15, 6, 0, 0.1, Math.PI - 0.1); c.lineWidth = 4; c.strokeStyle = `rgba(110,70,120,${0.5 * bg})`; c.stroke();
  }
  HUT_FACE0(c, f, pal);
  const bl = f.blue || 0;
  if (bl > 0.02) { ellipse(c, 0, 16, 9, 7, `rgba(120,150,230,${0.35 * bl})`); }
  const dr = f.drool || 0;
  if (dr > 0.02) {
    const L = 8 + 26 * dr;
    c.beginPath(); c.moveTo(12, 44); c.quadraticCurveTo(15, 44 + L * 0.6, 14, 44 + L);
    c.lineWidth = 4; c.strokeStyle = 'rgba(200,235,255,0.85)'; c.lineCap = 'round'; c.stroke();
    circle(c, 14, 46 + L, 3 + 3 * dr, 'rgba(210,240,255,0.95)');
    circle(c, 13, 44 + L, 1.4, '#FFFFFF');
  }
};

let HUT_WALL = null;

// ---------------------------------------------------------------- the room, painted once (2x, for close-ups)
function hutStatic(c) {
  // log wall: horizontal logs with dark chinking between them
  for (let y = -200, i = 0; y < HUT.floorY; y += 64, i++) {
    const g = c.createLinearGradient(0, y, 0, y + 64);
    g.addColorStop(0, '#8A5A36'); g.addColorStop(0.45, '#A8703F'); g.addColorStop(1, '#5E3A22');
    c.fillStyle = g; c.fillRect(-400, y, W + 800, 64);
    line(c, -400, y + 62, W + 400, y + 62, 6, '#3A2414');
    const rng = mulberry32(31 + i);
    for (let k = 0; k < 9; k++) {   // grain and knots
      const x = -380 + rng() * (W + 760);
      line(c, x, y + 18 + rng() * 26, x + 60 + rng() * 140, y + 18 + rng() * 26, 2, 'rgba(70,40,20,0.35)');
      if (rng() < 0.35) { ellipse(c, x + 30, y + 32, 9, 6, '#6A4026'); ellipse(c, x + 30, y + 32, 4, 3, '#4A2A16'); }
    }
  }
  // the log ends at the corner on the far left (a notched stack)
  for (let y = -200; y < HUT.floorY; y += 64) { ellipse(c, -330, y + 32, 40, 30, '#7A4C2C'); ellipse(c, -330, y + 32, 26, 19, '#9A6A40'); }
  // floor planks
  const fl = c.createLinearGradient(0, HUT.floorY, 0, HUT.floorY + 300);
  fl.addColorStop(0, '#5A3A24'); fl.addColorStop(1, '#2E1C10');
  c.fillStyle = fl; c.fillRect(-400, HUT.floorY, W + 800, 400);
  for (let x = -380; x < W + 400; x += 110) line(c, x, HUT.floorY, x - 70, HUT.floorY + 300, 3, 'rgba(20,10,4,0.4)');
  // a trail map pinned to the wall (centre left), with a red X near the top
  c.save(); c.translate(445, 330); c.rotate(-0.03);
  c.fillStyle = '#E8DCBA'; c.fillRect(-120, -95, 240, 190);
  c.lineWidth = 3; c.strokeStyle = 'rgba(90,70,40,0.5)';
  for (let k = 0; k < 5; k++) { c.beginPath(); c.ellipse(10, 10, 30 + k * 18, 20 + k * 13, 0.3, 0, 7); c.stroke(); }
  c.setLineDash([8, 8]); line(c, -100, 80, -20, 20, 4, '#B04030'); line(c, -20, 20, 40, -40, 4, '#B04030'); c.setLineDash([]);
  line(c, 30, -52, 52, -30, 6, '#D02A2A'); line(c, 52, -52, 30, -30, 6, '#D02A2A');
  circle(c, 0, -92, 7, '#C83A3A');
  c.restore();
  // a hanging snowshoe and a coil of rope (right of the map)
  c.save(); c.translate(1130, 300); c.rotate(0.12);
  c.beginPath(); c.ellipse(0, 0, 44, 96, 0, 0, 7); c.lineWidth = 9; c.strokeStyle = '#6A4426'; c.stroke();
  c.lineWidth = 2; c.strokeStyle = 'rgba(230,210,170,0.6)';
  for (let k = -3; k <= 3; k++) { line(c, -40, k * 24, 40, k * 24, 2, 'rgba(230,210,170,0.6)'); line(c, k * 12, -88, k * 12, 88, 2, 'rgba(230,210,170,0.5)'); }
  c.restore();
  circle(c, 1130, 196, 6, '#2A1A10');
  for (let k = 0; k < 4; k++) { c.beginPath(); c.ellipse(960, 300 + k * 4, 46 - k * 3, 38 - k * 3, 0, 0, 7); c.lineWidth = 7; c.strokeStyle = k % 2 ? '#C8A060' : '#B08848'; c.stroke(); }
  circle(c, 960, 258, 6, '#2A1A10');
  // the window frame (the outside is drawn per frame, through the hole)
  const { winX: wx, winY: wy, winW: ww, winH: wh } = HUT;
  rrect(c, wx - 34, wy - 34, ww + 68, wh + 68, 10); c.fillStyle = '#4A2E1A'; c.fill();
  rrect(c, wx - 22, wy - 22, ww + 44, wh + 44, 8); c.fillStyle = '#6A4426'; c.fill();
  c.clearRect(wx, wy, ww, wh);
  // the sill
  rrect(c, wx - 50, wy + wh + 20, ww + 100, 30, 6); c.fillStyle = '#7A4E2C'; c.fill();
  // the stovepipe up the wall on the left
  c.fillStyle = '#1A1A20'; c.fillRect(HUT.stoveX - 26, -200, 52, 560);
  for (let y = -150; y < 360; y += 130) { c.fillStyle = '#2A2A32'; c.fillRect(HUT.stoveX - 30, y, 60, 14); }
}

function initHut() {
  const cv = mkCanvas(W * 2 + 800, H * 2 + 1040), c = cv.getContext('2d');
  c.setTransform(2, 0, 0, 2, 400, 200);
  hutStatic(c);
  HUT_WALL = cv;
}

// the view through the window. o: {storm 0..1, sun 0..1 (day 7), dark 0..1}
function hutOutside(t, o = {}) {
  const { winX: wx, winY: wy, winW: ww, winH: wh } = HUT, c = ctx, sun = clamp(o.sun || 0), storm = o.storm === undefined ? 1 : o.storm;
  const g = c.createLinearGradient(0, wy, 0, wy + wh);
  g.addColorStop(0, mixHex('#1C2A4E', '#6FB8FF', sun)); g.addColorStop(1, mixHex('#4A5E86', '#DDF2FF', sun));
  c.fillStyle = g; c.fillRect(wx - 6, wy - 6, ww + 12, wh + 12);
  // far peaks (faint in the storm)
  c.save(); c.beginPath(); c.rect(wx, wy, ww, wh); c.clip();
  c.globalAlpha = lerp(0.35, 1, sun) * (1 - 0.5 * storm * (1 - sun));
  c.beginPath(); c.moveTo(wx - 10, wy + wh * 0.75);
  const pk = [[0, 0.75], [0.18, 0.42], [0.32, 0.6], [0.5, 0.3], [0.68, 0.55], [0.82, 0.38], [1, 0.62]];
  for (const [u, v] of pk) c.lineTo(wx + u * ww, wy + v * wh);
  c.lineTo(wx + ww + 10, wy + wh + 10); c.lineTo(wx - 10, wy + wh + 10); c.closePath();
  c.fillStyle = mixHex('#6A7AA6', '#F4FAFF', sun); c.fill();
  c.beginPath(); c.moveTo(wx - 10, wy + wh * 0.88); c.quadraticCurveTo(wx + ww * 0.5, wy + wh * 0.78, wx + ww + 10, wy + wh * 0.9);
  c.lineTo(wx + ww + 10, wy + wh + 10); c.lineTo(wx - 10, wy + wh + 10); c.closePath(); c.fillStyle = mixHex('#8A9AC6', '#FFFFFF', sun); c.fill();
  c.globalAlpha = 1;
  if (sun > 0.01) { circle(c, wx + ww * 0.78, wy + wh * 0.22, 34, `rgba(255,250,220,${sun})`); softDot(gctx, wx + ww * 0.78, wy + wh * 0.22, 220, '#FFF6D0', 0.7 * sun); }
  // the snow: three layers of streaks driven by the wind, gusts
  const gust = 0.7 + 0.3 * Math.sin(t * 0.9) + 0.15 * Math.sin(t * 2.3);
  for (let L = 0; L < 3; L++) {
    const n = Math.round((60 + 40 * L) * storm), sp = (260 + 220 * L) * gust, rng = mulberry32(400 + L);
    for (let i = 0; i < n; i++) {
      const x0 = rng() * (ww + 400), y0 = rng() * (wh + 200), v = 0.7 + 0.6 * rng();
      const x = wx - 200 + ((x0 + t * sp * v) % (ww + 400)), y = wy - 100 + ((y0 + t * sp * 0.45 * v) % (wh + 200));
      const len = (6 + 10 * L) * gust, a = (0.35 + 0.25 * L) * (1 - 0.7 * sun);
      line(c, x, y, x - len, y - len * 0.45, 1.5 + L * 1.4, `rgba(240,246,255,${a})`);
    }
  }
  c.restore();
  softDot(gctx, wx + ww / 2, wy + wh / 2, 380, sun > 0.5 ? '#FFF2C8' : '#9EC4FF', lerp(0.22, 0.6, sun));
}
// the glass over the outside: frost creeping in from the corners (frost 0..1), the window bars, a faint reflection
function hutGlass(t, frost = 0.2, sun = 0) {
  const { winX: wx, winY: wy, winW: ww, winH: wh } = HUT, c = ctx;
  c.save(); c.beginPath(); c.rect(wx, wy, ww, wh); c.clip();
  if (frost > 0.01) {
    const rng = mulberry32(88);
    for (let i = 0; i < 140; i++) {
      const corner = i % 4, cx = corner % 2 ? wx + ww : wx, cy = corner > 1 ? wy + wh : wy;
      const r = (40 + 160 * rng()) * frost * (1 - 0.6 * sun), a = rng() * 1.57 + [0, 1.57, 4.71, 3.14][corner];
      const x = cx + Math.cos(a) * r * rng(), y = cy + Math.sin(a) * r * rng();
      circle(c, x, y, 3 + 10 * rng() * frost, `rgba(230,240,255,${0.18 * (1 - 0.5 * sun)})`);
    }
    const g = c.createRadialGradient(wx + ww / 2, wy + wh / 2, ww * 0.25, wx + ww / 2, wy + wh / 2, ww * 0.75);
    g.addColorStop(0, 'rgba(230,240,255,0)'); g.addColorStop(1, `rgba(230,240,255,${0.45 * frost * (1 - 0.6 * sun)})`);
    c.fillStyle = g; c.fillRect(wx, wy, ww, wh);
  }
  c.beginPath(); c.moveTo(wx + ww * 0.15, wy + wh); c.lineTo(wx + ww * 0.55, wy); c.lineTo(wx + ww * 0.68, wy); c.lineTo(wx + ww * 0.28, wy + wh); c.closePath();
  c.fillStyle = 'rgba(255,255,255,0.05)'; c.fill();
  c.restore();
  c.fillStyle = '#5A3820'; c.fillRect(wx + ww / 2 - 9, wy, 18, wh); c.fillRect(wx, wy + wh / 2 - 9, ww, 18);
}

// the stove, far left: a black iron box on legs, a glass door with the fire, a kettle on top. fire 0..1
function hutStove(t, fire = 1) {
  const c = ctx, x = HUT.stoveX, y = HUT.floorY;
  for (const s of [-1, 1]) { c.fillStyle = '#121218'; c.fillRect(x + s * 90 - 8, y - 70, 16, 70); }
  rrect(c, x - 120, y - 330, 240, 270, 18); c.fillStyle = '#1E1E26'; c.fill();
  rrect(c, x - 130, y - 344, 260, 28, 8); c.fillStyle = '#2A2A34'; c.fill();
  rrect(c, x - 82, y - 270, 164, 150, 14); c.fillStyle = '#0A0606'; c.fill();
  const fl = fire * (0.85 + 0.15 * Math.sin(t * 9) * Math.sin(t * 5.3));
  if (fl > 0.02) {
    c.save(); rrect(c, -0 + x - 76, y - 264, 152, 138, 12); c.clip();
    for (let i = 0; i < 7; i++) {
      const fx = x - 60 + i * 20, h = (50 + 50 * fl) * (0.6 + 0.4 * Math.sin(t * (6 + i) + i * 2));
      c.beginPath(); c.moveTo(fx - 16, y - 126); c.quadraticCurveTo(fx - 12, y - 126 - h * 0.6, fx + 2 * Math.sin(t * 7 + i), y - 126 - h); c.quadraticCurveTo(fx + 12, y - 126 - h * 0.6, fx + 16, y - 126); c.closePath();
      c.fillStyle = i % 2 ? `rgba(255,150,40,${0.9 * fl})` : `rgba(255,220,90,${0.85 * fl})`; c.fill();
    }
    ellipse(c, x, y - 128, 70, 14, `rgba(255,120,40,${fl})`);
    c.restore();
    softDot(gctx, x, y - 190, 260, '#FF9A3C', 0.75 * fl);
    softDot(gctx, x, y - 190, 90, '#FFD890', 0.6 * fl);
  }
  line(c, x - 82, y - 196, x + 82, y - 196, 4, '#2E2E38');
  line(c, x, y - 270, x, y - 120, 4, '#2E2E38');
  // the kettle
  ellipse(c, x + 30, y - 360, 64, 46, '#5A6A80'); ellipse(c, x + 30, y - 372, 54, 30, '#7A8AA0');
  c.beginPath(); c.arc(x + 30, y - 404, 34, Math.PI, 0); c.lineWidth = 7; c.strokeStyle = '#3A4458'; c.stroke();
  line(c, x + 86, y - 368, x + 122, y - 392, 12, '#5A6A80');
  for (let i = 0; i < 3; i++) {   // steam
    const k = ((t * 0.4 + i / 3) % 1);
    softDot(ctx, x + 126 + 30 * k, y - 400 - 120 * k, 14 + 20 * k, '#FFFFFF', 0.12 * (1 - k) * fire);
  }
}

// the candle on the table; h 0..1 is how much of it is left; lit 0..1
function hutCandle(x, y, t, h = 1, lit = 1) {
  const c = ctx, ch = 30 + 110 * h;
  ellipse(c, x, y + 4, 46, 12, '#8A8A96'); ellipse(c, x, y, 42, 10, '#B8B8C4');
  rrect(c, x - 18, y - ch, 36, ch, 6); c.fillStyle = '#F4ECD8'; c.fill();
  c.fillStyle = 'rgba(200,180,150,0.45)'; c.fillRect(x + 6, y - ch, 10, ch);
  for (let i = 0; i < 3; i++) { rrect(c, x - 18 + i * 13, y - ch, 9, 14 + 20 * hash(i + h * 9), 4); c.fillStyle = '#FFF8E6'; c.fill(); }
  line(c, x, y - ch, x, y - ch - 12, 3, '#2A1A10');
  if (lit > 0.02) {
    const fy = y - ch - 14, fl = 1 + 0.08 * Math.sin(t * 11) + 0.05 * Math.sin(t * 23);
    c.beginPath(); c.moveTo(x, fy - 34 * fl * lit); c.quadraticCurveTo(x + 13, fy - 6, x, fy + 6); c.quadraticCurveTo(x - 13, fy - 6, x, fy - 34 * fl * lit); c.closePath();
    c.fillStyle = `rgba(255,200,90,${lit})`; c.fill();
    ellipse(c, x, fy - 4, 5, 9 * lit, `rgba(255,250,220,${lit})`);
    softDot(gctx, x, fy - 10, 150, '#FFC060', 0.5 * lit);
    softDot(gctx, x, fy - 10, 44, '#FFF0C0', 0.65 * lit);
  }
  return [x, y - ch - 30];
}

// Pip's chocolate bar: the famous one from the summit shop. Flat on the table at (x, y), s scale.
// o: {open 0..1 (the wrapper peels back from the left, the foil and the squares show), rot, glow 0..1, lift (px up), half: 0..1 (broken in two)}
function chocBar(c, x, y, s, t, o = {}) {
  const open = clamp(o.open || 0), glow = o.glow || 0;
  c.save(); c.translate(x, y - (o.lift || 0)); c.rotate(o.rot || 0); c.scale(s, s);
  const w = 300, h = 110;
  // the squares (seen where the wrapper is open)
  rrect(c, -w / 2, -h / 2, w, h, 10); c.fillStyle = '#5A3218'; c.fill();
  for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) {
    rrect(c, -w / 2 + 8 + i * ((w - 16) / 6), -h / 2 + 8 + j * ((h - 16) / 2), (w - 16) / 6 - 6, (h - 16) / 2 - 6, 6);
    c.fillStyle = '#7A4626'; c.fill();
    rrect(c, -w / 2 + 12 + i * ((w - 16) / 6), -h / 2 + 12 + j * ((h - 16) / 2), (w - 16) / 6 - 18, 8, 3); c.fillStyle = 'rgba(255,220,180,0.25)'; c.fill();
  }
  // the gold foil under the paper
  const fx = -w / 2 + w * open;
  c.save(); c.beginPath(); c.rect(fx - 28 * open, -h / 2 - 8, w + 60, h + 16); c.clip();
  rrect(c, -w / 2 - 6, -h / 2 - 6, w + 12, h + 12, 12); c.fillStyle = '#E8C060'; c.fill();
  for (let i = 0; i < 9; i++) line(c, -w / 2 + i * 38, -h / 2 - 6, -w / 2 + 20 + i * 38, h / 2 + 6, 3, 'rgba(255,250,220,0.35)');
  c.restore();
  // the paper sleeve: purple with a white mountain and PEAK in gold
  c.save(); c.beginPath(); c.rect(fx, -h / 2 - 10, w + 60, h + 20); c.clip();
  rrect(c, -w / 2 - 8, -h / 2 - 8, w + 16, h + 16, 12); c.fillStyle = '#6A2A9A'; c.fill();
  c.fillStyle = '#4E1C78'; c.fillRect(-w / 2 - 8, h / 2 - 22, w + 16, 30);
  c.beginPath(); c.moveTo(-110, 34); c.lineTo(-62, -30); c.lineTo(-40, -6); c.lineTo(-18, -38); c.lineTo(34, 34); c.closePath(); c.fillStyle = '#FFFFFF'; c.fill();
  c.beginPath(); c.moveTo(-62, -30); c.lineTo(-52, -16); c.lineTo(-70, -18); c.closePath(); c.fillStyle = '#C8D8FF'; c.fill();
  c.font = '400 54px Anton'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = '#FFD447'; c.fillText('PEAK', 18, -2);
  c.font = '900 15px Montserrat'; c.fillStyle = '#FFFFFF'; c.fillText('MOUNTAIN CHOCOLATE', 20, 30);
  c.restore();
  if (open > 0.02 && open < 0.98) {   // the peeled edge of the paper, curled
    c.beginPath(); c.moveTo(fx, -h / 2 - 8); c.quadraticCurveTo(fx - 30 * open, 0, fx, h / 2 + 8); c.lineTo(fx + 14, h / 2 + 8); c.quadraticCurveTo(fx - 10 * open, 0, fx + 14, -h / 2 - 8); c.closePath();
    c.fillStyle = '#8A4AC0'; c.fill();
  }
  c.restore();
  if (glow > 0.01) { softDot(gctx, x, y - (o.lift || 0), 230 * s, '#FFD447', 0.55 * glow); }
}
// one half of the bar after it is broken (side -1 left half, +1 right half), drawn in its own frame
function chocHalf(c, x, y, s, side, rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  const w = 150, h = 110;
  c.beginPath(); c.moveTo(-w / 2, -h / 2);
  if (side < 0) { c.lineTo(w / 2, -h / 2); for (let k = 0; k <= 6; k++) c.lineTo(w / 2 + (k % 2 ? 8 : -6), -h / 2 + k * h / 6); c.lineTo(-w / 2, h / 2); }
  else { for (let k = 0; k <= 6; k++) c.lineTo(-w / 2 + (k % 2 ? 8 : -6), -h / 2 + k * h / 6); c.lineTo(w / 2, h / 2); c.lineTo(w / 2, -h / 2); }
  c.closePath(); c.fillStyle = '#5A3218'; c.fill();
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { rrect(c, -w / 2 + 10 + i * 46, -h / 2 + 8 + j * 47, 38, 40, 6); c.fillStyle = '#7A4626'; c.fill(); }
  // the gold foil wrapped round the outer end
  const ex = side < 0 ? -w / 2 - 6 : w / 2 - 34;
  rrect(c, ex, -h / 2 - 6, 40, h + 12, 8); c.fillStyle = '#E8C060'; c.fill();
  c.restore();
}

// the lemon: a half with its cut face toward us. bite 0..1 takes a bite out of the top; rind 1 = only the squeezed rind is left
function lemonHalf(c, x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.scale(s, s);
  const rind = clamp(o.rind || 0);
  c.save();
  if ((o.bite || 0) > 0.02) {   // an even-odd bite out of the top right
    c.beginPath(); c.rect(-80, -80, 160, 160);
    for (let k = 0; k < 3; k++) c.arc(28 - k * 22, -40 + k * 6, 22 * o.bite, 0, 7, true);
    c.clip('evenodd');
  }
  ellipse(c, 0, 0, 52 * (1 - 0.3 * rind), 44 * (1 - 0.45 * rind), '#F2C230', 0);
  ellipse(c, 0, 0, 44 * (1 - 0.3 * rind), 36 * (1 - 0.45 * rind), rind > 0.5 ? '#F6E6A0' : '#FFF6B0');
  if (rind < 0.5) for (let i = 0; i < 9; i++) {
    c.save(); c.rotate(i * 0.698); c.beginPath(); c.moveTo(0, -3); c.lineTo(-10, -32); c.quadraticCurveTo(0, -38, 10, -32); c.closePath();
    c.fillStyle = 'rgba(255,226,90,0.85)'; c.fill(); c.restore();
  }
  circle(c, 0, 0, 5, '#FFFBE0');
  c.restore();
  c.restore();
}
// juice drops flying off the lemon (k 0..1 through the spray)
function lemonSpray(x, y, s, k, seed = 1) {
  if (k <= 0.01 || k >= 1) return;
  const rng = mulberry32(seed);
  for (let i = 0; i < 14; i++) {
    const a = -Math.PI * (0.15 + 0.7 * rng()), v = (60 + 140 * rng()) * s, px = x + Math.cos(a) * v * k, py = y + Math.sin(a) * v * k + 160 * s * k * k;
    circle(ctx, px, py, (3 + 4 * rng()) * s * (1 - 0.5 * k), `rgba(255,240,140,${1 - k})`);
    circle(gctx, px, py, (6 + 6 * rng()) * s, `rgba(255,240,140,${0.6 * (1 - k)})`);
  }
}

// the emergency radio: orange, with a speaker grille, a dial and a telescopic aerial. talk 0..1 = Pip's voice: the
// speaker throbs and the LED glows; o.static (crackle marks)
function radioSet(c, x, y, s, t, o = {}) {
  const talk = o.talk || 0;
  c.save(); c.translate(x, y); c.scale(s, s);
  line(c, -70, -100, -150, -250, 5, '#C8CCD8'); circle(c, -150, -252, 7, '#E8ECF4');
  rrect(c, -100, -110, 200, 120, 18); c.fillStyle = '#E86A2A'; c.fill();
  rrect(c, -100, -110, 200, 22, 12); c.fillStyle = '#FF8A44'; c.fill();
  const th = 1 + 0.06 * talk * Math.abs(Math.sin(t * 22));
  c.save(); c.translate(-38, -48); c.scale(th, th);
  circle(c, 0, 0, 42, '#3A2418');
  for (let i = -3; i <= 3; i++) line(c, -34, i * 10, 34, i * 10, 3, '#5A3A28');
  c.restore();
  rrect(c, 22, -86, 64, 30, 6); c.fillStyle = '#FFF0C0'; c.fill();
  line(c, 34 + 40 * ((t * 0.05) % 1), -84, 34 + 40 * ((t * 0.05) % 1), -58, 3, '#E2424B');
  circle(c, 54, -30, 16, '#3A2418'); circle(c, 54, -30, 8, '#6A4A38');
  circle(c, 84, -100, 6, talk > 0.05 ? '#4DFFB4' : '#2A6A4A');
  c.restore();
  if (talk > 0.05) softDot(gctx, x + 84 * s, y - 100 * s, 30 * s, '#4DFFB4', 0.8 * talk);
}
// little arcs of sound leaving the radio's speaker
function radioWaves(x, y, s, t, k) {
  if (k <= 0.01) return;
  for (let i = 0; i < 3; i++) {
    const u = ((t * 1.6 + i / 3) % 1);
    ctx.beginPath(); ctx.arc(x, y, (40 + 90 * u) * s, -0.6, 0.6);
    ctx.lineWidth = 5 * s; ctx.strokeStyle = `rgba(255,214,120,${0.7 * k * (1 - u)})`; ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, (40 + 90 * u) * s, Math.PI - 0.6, Math.PI + 0.6); ctx.stroke();
  }
}

// a tin mug of hot water (melted snow), steam
function tinMug(c, x, y, s, t, steam = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  rrect(c, -40, -90, 80, 90, 10); c.fillStyle = '#C8D0DC'; c.fill();
  c.fillStyle = 'rgba(90,100,120,0.35)'; c.fillRect(14, -90, 18, 90);
  ellipse(c, 0, -90, 40, 10, '#9AA4B4'); ellipse(c, 0, -88, 34, 7, '#6A90B0');
  c.beginPath(); c.arc(46, -48, 22, -1.4, 1.4); c.lineWidth = 9; c.strokeStyle = '#B0B8C6'; c.stroke();
  c.restore();
  for (let i = 0; i < 3; i++) { const k = ((t * 0.35 + i / 3) % 1); softDot(ctx, x + 10 * Math.sin(t + i) * s, y - (100 + 140 * k) * s, (12 + 18 * k) * s, '#FFFFFF', 0.13 * (1 - k) * steam); }
}

// the tally marks he scratches by the window, one a day (n marks; the newest one draws on with k)
function hutTally(n, k = 1) {
  const x0 = 1180, y0 = 470, c = ctx;
  for (let i = 0; i < n; i++) {
    const g = Math.floor(i / 5), j = i % 5, kk = i === n - 1 ? clamp(k) : 1;
    if (j < 4) { const x = x0 + g * 70 + j * 14; line(c, x, y0, x + 3, y0 + 60 * kk, 5, 'rgba(255,240,215,0.75)'); }
    else { const x = x0 + g * 70; line(c, x - 8, y0 + 50, x - 8 + 66 * kk, y0 + 50 - 46 * kk, 5, 'rgba(255,240,215,0.75)'); }
  }
}

// the table: a rough plank top and its front edge
function hutTable() {
  const c = ctx, x0 = 280, x1 = 1660;
  c.beginPath(); c.moveTo(x0 + 40, HUT.tableY); c.lineTo(x1 - 40, HUT.tableY); c.lineTo(x1, HUT.frontY); c.lineTo(x0, HUT.frontY); c.closePath();
  const g = c.createLinearGradient(0, HUT.tableY, 0, HUT.frontY);
  g.addColorStop(0, '#9A6A40'); g.addColorStop(1, '#7A4E2C');
  c.fillStyle = g; c.fill();
  for (let i = 1; i < 4; i++) line(c, x0 + 30, HUT.tableY + i * 10, x1 - 30, HUT.tableY + i * 10, 2, 'rgba(60,36,18,0.35)');
  c.fillStyle = '#5A3820'; c.fillRect(x0, HUT.frontY, x1 - x0, 40);
  line(c, x0, HUT.frontY, x1, HUT.frontY, 4, '#B07A48');
  for (const x of [x0 + 40, x1 - 60]) { c.fillStyle = '#4A2E1A'; c.fillRect(x, HUT.frontY + 40, 26, HUT.floorY - HUT.frontY + 60); }
}
// the plate in front of him (the lemon sits on it)
function hutPlate(x, y) { ellipse(ctx, x, y + 6, 110, 22, '#8A8A9A'); ellipse(ctx, x, y + 2, 104, 19, '#E8EAF2'); ellipse(ctx, x, y + 2, 70, 12, '#D8DAE4'); }

// ---------------------------------------------------------------- the fox
// The fox that stole his food bag, outside the window: its head and front paws over the sill. (x, y) = its chin,
// s = scale (1 = a head ~150 px wide). o: {face: 'smug'|'curious'|'shock'|'chew'|'sly'|'faint', look (-1..1), bag 0..1
// (his food bag in its mouth), lick 0..1, fat 0..1 (rounder cheeks), ears 0..1 (perked), sway, tilt}
function foxHead(c, x, y, s, t, o = {}) {
  const face = o.face || 'sly', fat = o.fat || 0, ears = o.ears === undefined ? 0.6 : o.ears, look = o.look || 0;
  c.save(); c.translate(x, y); c.rotate((o.tilt || 0) + 0.04 * Math.sin(t * 1.3)); c.scale(s, s);
  const OR = '#E8732C', ORD = '#B8501A', WH = '#FFF4E8', DK = '#2A1A14';
  // front paws on the sill
  if (!o.noPaws) for (const sd of [-1, 1]) { ellipse(c, sd * 48, 34, 26, 18, ORD); ellipse(c, sd * 48, 38, 22, 12, DK); }
  // ears (behind the head)
  for (const sd of [-1, 1]) {
    c.save(); c.translate(sd * 44, -70); c.rotate(sd * (0.35 - 0.25 * ears));
    c.beginPath(); c.moveTo(-22, 16); c.lineTo(0, -46 - 10 * ears); c.lineTo(22, 16); c.closePath(); c.fillStyle = OR; c.fill();
    c.beginPath(); c.moveTo(-12, 10); c.lineTo(0, -30 - 8 * ears); c.lineTo(12, 10); c.closePath(); c.fillStyle = '#FFD8C0'; c.fill();
    c.beginPath(); c.moveTo(-8, -26); c.lineTo(0, -46 - 10 * ears); c.lineTo(8, -26); c.closePath(); c.fillStyle = DK; c.fill();
    c.restore();
  }
  // head: wide cheeks tapering to a snout pointing at us
  const cw = 78 + 22 * fat;
  c.beginPath(); c.moveTo(-cw, -10); c.quadraticCurveTo(-cw + 6, -86, 0, -92); c.quadraticCurveTo(cw - 6, -86, cw, -10);
  c.quadraticCurveTo(cw * 0.7, 30, 0, 44); c.quadraticCurveTo(-cw * 0.7, 30, -cw, -10); c.closePath();
  c.fillStyle = OR; c.fill();
  // white cheeks and muzzle
  c.beginPath(); c.moveTo(-cw, -8); c.quadraticCurveTo(-30, 0, -14, 30); c.quadraticCurveTo(0, 46, 14, 30); c.quadraticCurveTo(30, 0, cw, -8);
  c.quadraticCurveTo(cw * 0.7, 32, 0, 46); c.quadraticCurveTo(-cw * 0.7, 32, -cw, -8); c.closePath(); c.fillStyle = WH; c.fill();
  ellipse(c, 0, 4, 30, 32, WH);
  // eyes
  const shut = face === 'faint' ? 1 : face === 'smug' || face === 'sly' ? 0.45 : face === 'chew' ? 0.3 : 0;
  for (const sd of [-1, 1]) {
    const ex = sd * 34, ey = -36;
    if (face === 'faint') { line(c, ex - 12, ey - 8, ex + 12, ey + 8, 5, DK); line(c, ex - 12, ey + 8, ex + 12, ey - 8, 5, DK); continue; }
    const big = face === 'shock' ? 1.35 : 1;
    ellipse(c, ex, ey, 15 * big, 13 * big, '#FFE6A0');
    circle(c, ex + look * 5, ey + 1, 7 * (face === 'shock' ? 0.6 : 1), DK);
    circle(c, ex + look * 5 - 2, ey - 2, 2.4, '#FFFFFF');
    if (shut > 0) { c.save(); c.beginPath(); c.ellipse(ex, ey, 16 * big, 14 * big, 0, 0, 7); c.clip(); c.fillStyle = OR; c.fillRect(ex - 18, ey - 16, 36, 30 * shut); line(c, ex - 16, ey - 14 + 28 * shut, ex + 16, ey - 14 + 28 * shut, 3, ORD); c.restore(); }
    // brows (a fox's mood)
    const bt = face === 'smug' || face === 'sly' ? -0.5 : face === 'shock' ? 0.8 : face === 'curious' ? 0.5 : 0;
    line(c, ex - sd * 12, ey - 22 - bt * 6, ex + sd * 12, ey - 20 + bt * 6, 4, ORD);
  }
  // nose and mouth
  ellipse(c, 0, 12, 13, 9, DK); ellipse(c, -3, 9, 4, 2.5, '#6A5A5A');
  if (face === 'shock') { ellipse(c, 0, 32, 10, 12, '#5A1522'); }
  else if (face === 'chew') { const m = 0.5 + 0.5 * Math.sin(t * 16); c.beginPath(); c.moveTo(-14, 26); c.quadraticCurveTo(0, 30 + 6 * m, 14, 26); c.lineWidth = 4; c.strokeStyle = DK; c.stroke(); }
  else { c.beginPath(); c.moveTo(-18, 26); c.quadraticCurveTo(-6, 34, 0, 24); c.quadraticCurveTo(6, 34, 18 + (face === 'smug' || face === 'sly' ? 6 : 0), 22 - (face === 'smug' || face === 'sly' ? 6 : 0)); c.lineWidth = 4; c.strokeStyle = DK; c.lineCap = 'round'; c.stroke(); }
  if ((o.lick || 0) > 0.02) ellipse(c, 10, 30 + 8 * o.lick, 8, 6 + 6 * o.lick, '#E0616C');
  // whiskers
  for (const sd of [-1, 1]) for (let k = 0; k < 2; k++) line(c, sd * 22, 20 + k * 8, sd * 64, 14 + k * 16, 2, 'rgba(40,30,30,0.6)');
  // his food bag in its mouth: a green stuff sack, hanging
  if ((o.bag || 0) > 0.02) {
    c.globalAlpha = clamp(o.bag * 3);
    line(c, 6, 30, 30, 60, 5, '#3A3A2A');
    c.beginPath(); c.moveTo(20, 56); c.quadraticCurveTo(70, 50, 74, 110); c.quadraticCurveTo(46, 150, 6, 120); c.quadraticCurveTo(-4, 80, 20, 56); c.closePath();
    c.fillStyle = '#3E8A4A'; c.fill(); line(c, 16, 70, 66, 64, 5, '#2E6A38');
    c.font = '900 20px Montserrat'; c.textAlign = 'center'; c.fillStyle = '#FFFFFF'; c.fillText('FOOD', 40, 104);
    c.globalAlpha = 1;
  }
  c.restore();
}

// ---------------------------------------------------------------- the hero at the table
// h: {face, L, R (hand targets, rig-local), lean, headDX, headDY, headRot, beanie 0..1, blanket 0..1, shiver 0..1,
// lemon: {k (at his mouth 0..1), bite, rind, sour}, choc: {k, open, glow} (held in both hands), fist 0..1 (his right
// fist raised and squeezed), pulse 0..1 (two fingers on his neck), sniff 0..1 (his palm in front of his mouth),
// breath 0..1 (a frosty breath cloud), pre(lc, r, st), post(lc, r, st), dx, dy}
function hutSeatPose(h = {}) {
  const base = { hipY: -34, lean: h.lean || 0, armL: { a: 0.3, b: 0.2 }, armR: { a: 0.3, b: 0.2 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, hand: h.hand || 'open', feetFront: 1 };
  let p = ikReach(base, 'L', h.L || [-80, -40], -1);
  p = ikReach(p, 'R', h.R || [80, -40], 1);
  if (h.tremble) p = twitch(p, h.t || 0, h.tremble, 11);
  return p;
}
const HUTPAL = Object.assign({}, PAL);
// rig-local -> world
function hutPt(p, h = {}) { return [HUT.heroX + (h.dx || 0) + p[0] * HUT.hs * (h.sMul || 1), HUT.heroY + (h.dy || 0) + p[1] * HUT.hs * (h.sMul || 1)]; }
// where his head centre is (world)
function hutHead(h = {}) { return hutPt([(h.headDX || 0), -282 + (h.headDY || 0)], h); }
// the hand targets for what he does with his hands (rig-local); blend two with hutMixArms
const HUT_ARMS = {
  rest: { L: [-80, -40], R: [80, -40] },
  lemon: { L: [-80, -40], R: [36, -205] },                      // the lemon at his mouth
  choc: { L: [-40, -100], R: [40, -100] },                      // the bar held up in both hands
  table: { L: [-60, -20], R: [130, -14] },                      // reaching toward the bar / the radio
  fist: { L: [-80, -40], R: [96, -230] },                       // his right fist up beside his face
  pulse: { L: [-80, -40], R: [52, -196] },                      // two fingers on the side of his neck
  sniff: { L: [-80, -40], R: [10, -200] },                      // his palm in front of his mouth
  hug: { L: [30, -110], R: [-30, -110] },                       // arms wrapped round himself (cold)
  shout: { L: [-80, -40], R: [150, -210] },                     // pointing at the fox
  wrap: { L: [-30, -60], R: [50, -60] },                        // hands on the bar on the table
};
function hutMixArms(a, b, k) { return { L: [lerp(a.L[0], b.L[0], k), lerp(a.L[1], b.L[1], k)], R: [lerp(a.R[0], b.R[0], k), lerp(a.R[1], b.R[1], k)] }; }

function hutHero(cam, t, h = {}) {
  const shiv = h.shiver || 0;
  const st = { x: HUT.heroX + (h.dx || 0) + shiv * 3 * Math.sin(t * 47), y: HUT.heroY + (h.dy || 0), s: HUT.hs * (h.sMul || 1),
    face: Object.assign({}, h.face || FACES.calm, { bags: h.bags || 0, hollow: h.hollow || 0, stubble: h.stubble || 0, drool: h.drool || 0, blue: h.blue || 0 }),
    pose: h.pose || hutSeatPose(Object.assign({ t }, h)), noLegs: true, seed: 4,
    headDX: (h.headDX || 0) + shiv * 2 * Math.sin(t * 53), headDY: h.headDY || 0, headRot: (h.headRot || 0) };
  lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.clearRect(0, 0, W, H);
  camTransform(lctx, cam, 1);
  lctx.save(); lctx.translate(st.x, st.y); lctx.scale(st.s, st.s);
  if (h.pre) h.pre(lctx, st);
  lctx.restore();
  const r = drawCharacter(lctx, st, t, HUTPAL);
  // head-space extras (beanie, breath)
  lctx.save(); lctx.translate(st.x, st.y); lctx.scale(st.s, st.s);
  lctx.translate(r.head[0] + (st.headDX || 0), r.head[1] + (st.headDY || 0)); lctx.rotate(r.lean + (st.headRot || 0));
  if ((h.beanie || 0) > 0.01) hutBeanie(lctx, h.beanie, t);
  lctx.restore();
  lctx.save(); lctx.translate(st.x, st.y); lctx.scale(st.s, st.s);
  if ((h.blanket || 0) > 0.01) hutBlanket(lctx, r, h.blanket, t);
  const wr = r.wrR, d = r.armDirR;
  if (h.lemon && h.lemon.k > 0.01) {   // the hand with the lemon in front of his mouth
    const L = h.lemon, hx = wr[0] + d[0] * 16, hy = wr[1] + d[1] * 16;
    lemonHalf(lctx, hx - 6, hy - 22, 0.62, t, { bite: L.bite || 0, rind: L.rind || 0, rot: -0.5 });
    hutFist(lctx, hx, hy, 1.0, -0.4);
  }
  if ((h.fist || 0) > 0.01) {          // his right fist, squeezing (it shakes a little and the knuckles whiten)
    const sq = h.fist, hx = wr[0] + d[0] * 18, hy = wr[1] + d[1] * 18;
    hutFist(lctx, hx + sq * 1.5 * Math.sin(t * 40), hy, 1.5, -1.5, sq);
  }
  if ((h.pulse || 0) > 0.01) {         // two fingers pressed on his neck
    const hx = wr[0] + d[0] * 6, hy = wr[1] + d[1] * 6, k = clamp(h.pulse);
    circle(lctx, hx + 6, hy + 8, 19, HUTPAL.skinSh); circle(lctx, hx + 4, hy + 6, 16, HUTPAL.skin);
    for (const [ox, oy] of [[0, 0], [10, 6]]) { line(lctx, hx + ox, hy + oy, hx + ox - 26 * k, hy + oy - 26 * k, 13, HUTPAL.skinSh); line(lctx, hx + ox, hy + oy, hx + ox - 26 * k, hy + oy - 26 * k, 9, HUTPAL.skin); }
  }
  if ((h.sniff || 0) > 0.01) {         // his palm cupped in front of his mouth, fingers up
    const hx = wr[0] + d[0] * 8, hy = wr[1] + d[1] * 8;
    lctx.save(); lctx.translate(hx, hy - 6); lctx.rotate(-0.25);
    rrect(lctx, -26, -40, 46, 58, 20); lctx.fillStyle = HUTPAL.skinSh; lctx.fill();
    rrect(lctx, -22, -36, 38, 50, 18); lctx.fillStyle = HUTPAL.skin; lctx.fill();
    for (let i = 0; i < 3; i++) line(lctx, -14 + i * 12, -38, -14 + i * 12, -58, 10, HUTPAL.skin);
    lctx.restore();
  }
  if (h.choc && h.choc.k > 0.01) {     // the bar held up in both hands, in front of his chest
    const m = [(r.wrL[0] + r.wrR[0]) / 2, (r.wrL[1] + r.wrR[1]) / 2 - 10];
    chocBar(lctx, m[0], m[1], 0.62, t, { open: h.choc.open || 0, rot: h.choc.rot || 0 });
    for (const w of [r.wrL, r.wrR]) { circle(lctx, w[0], w[1] - 4, 19, HUTPAL.skinSh); circle(lctx, w[0] - 1, w[1] - 6, 16, HUTPAL.skin); }
  }
  if (h.post) h.post(lctx, r, st);
  lctx.restore();
  // light: the warm stove and candle on the left and front, the cold window on the right
  lctx.setTransform(1, 0, 0, 1, 0, 0);
  lctx.globalCompositeOperation = 'source-atop';
  const cold = clamp(h.cold || 0), sun = clamp(h.sun || 0);
  lctx.fillStyle = `rgba(20,24,60,${(0.16 + 0.22 * cold) * (1 - sun)})`; lctx.fillRect(0, 0, W, H);
  const [kx] = toScreen(cam, HUT.stoveX, 0);
  const g = lctx.createLinearGradient(kx, 0, kx + 1300 * cam.zoom, 0);
  g.addColorStop(0, `rgba(255,150,70,${0.34 * (1 - 0.6 * cold) * (1 - sun)})`); g.addColorStop(1, 'rgba(255,150,70,0)');
  lctx.fillStyle = g; lctx.fillRect(0, 0, W, H);
  const [wx] = toScreen(cam, HUT.winX + HUT.winW / 2, 0);
  const g2 = lctx.createLinearGradient(wx, 0, wx - 1100 * cam.zoom, 0);
  g2.addColorStop(0, sun > 0.01 ? `rgba(255,240,200,${0.4 * sun})` : `rgba(140,180,255,${0.22 + 0.12 * cold})`); g2.addColorStop(1, 'rgba(140,180,255,0)');
  lctx.fillStyle = g2; lctx.fillRect(0, 0, W, H);
  lctx.globalCompositeOperation = 'source-over';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(layerC, 0, 0);
  // a breath cloud in the cold (screen space from his mouth)
  if ((h.breath || 0) > 0.01) {
    const hp = hutHead(h), mp = toScreen(cam, hp[0] + 30 * HUT.hs, hp[1] + 44 * HUT.hs);
    for (let i = 0; i < 3; i++) { const k = ((t * 0.55 + i / 3) % 1); softDot(ctx, mp[0] + 70 * k * cam.zoom, mp[1] - 20 * k * cam.zoom, (10 + 26 * k) * cam.zoom, '#E8F2FF', 0.35 * (1 - k) * h.breath); }
  }
  return { st, r };
}
// a fist (rig units): k squeezes it (whiter knuckles), rot turns it
function hutFist(c, x, y, s, rot = 0, k = 0) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  rrect(c, -22, -20, 44, 40, 14); c.fillStyle = HUTPAL.skinSh; c.fill();
  rrect(c, -20, -18, 40, 36, 12); c.fillStyle = HUTPAL.skin; c.fill();
  for (let i = 0; i < 4; i++) { line(c, -14 + i * 9.5, -16, -14 + i * 9.5, -2, 2, 'rgba(160,90,60,0.5)'); circle(c, -14 + i * 9.5, -14, 3, `rgba(255,240,230,${0.25 + 0.6 * k})`); }
  rrect(c, -24, -2, 16, 20, 7); c.fillStyle = HUTPAL.skin; c.fill();
  c.restore();
}
// a knitted beanie (head units), k pops it on
function hutBeanie(c, k, t) {
  c.save(); c.translate(0, -44 - 30 * (1 - E.outBack(clamp(k), 2)));
  c.beginPath(); c.moveTo(-68, 4); c.quadraticCurveTo(-70, -66, 0, -72); c.quadraticCurveTo(70, -66, 68, 4); c.closePath(); c.fillStyle = '#C83A4A'; c.fill();
  for (let i = -3; i <= 3; i++) line(c, i * 18, -60 + Math.abs(i) * 4, i * 19, 0, 4, 'rgba(120,20,30,0.45)');
  rrect(c, -72, -12, 144, 30, 12); c.fillStyle = '#E8E2D8'; c.fill();
  for (let i = -3; i <= 3; i++) line(c, i * 19, -10, i * 19, 16, 3, 'rgba(160,150,140,0.5)');
  circle(c, 0, -78, 20, '#E8E2D8'); circle(c, -5, -82, 8, '#FFFFFF');
  c.restore();
}
// a wool blanket round his shoulders (rig units), k wraps it on: a drape over each shoulder and down his sides,
// open in front so the coat shows in a V
function hutBlanket(c, r, k, t) {
  const kk = E.outCubic(clamp(k)), drop = 50 * (1 - kk);
  c.save(); c.globalAlpha = clamp(k * 3);
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(s * 10, -214 + drop); c.quadraticCurveTo(s * 70, -232 + drop, s * 112, -196 + drop);
    c.quadraticCurveTo(s * 130, -120, s * 118, -20);
    c.quadraticCurveTo(s * 80, -6, s * 44, -16);
    c.quadraticCurveTo(s * 34, -110, s * 10, -214 + drop);
    c.closePath();
    c.fillStyle = '#4A6A9A'; c.fill();
    c.save(); c.clip();
    for (let y = -240; y < 0; y += 40) { c.fillStyle = 'rgba(30,40,80,0.35)'; c.fillRect(-140, y, 280, 14); }
    for (let x = -140; x < 140; x += 40) { c.fillStyle = 'rgba(200,210,240,0.12)'; c.fillRect(x, -250, 12, 260); }
    c.restore();
    c.beginPath(); c.moveTo(s * 44, -16); c.quadraticCurveTo(s * 34, -110, s * 10, -214 + drop); c.lineWidth = 8; c.strokeStyle = '#6A8ABA'; c.stroke();
  }
  c.restore();
}

// ---------------------------------------------------------------- the whole hut with him in it
// o: {hero: h, day (tally marks), tallyK, candle (left 0..1), candleLit, fire, storm, sun, frost, cold, choc: {...} (on
// the table) or null, lemon: {...} (on the plate) or null, radio: {talk}, fox: {...} or null (in the window), mug, before(cam), after(cam, H)}
function hutScene(cam, t, o = {}) {
  applyCam(cam);
  hutOutside(t, { storm: o.storm === undefined ? 1 : o.storm, sun: o.sun || 0 });
  if (o.fox) { const f = o.fox; foxHead(ctx, (f.x || HUT.winX + HUT.winW * 0.66), (f.y || HUT.winY + HUT.winH - 10) + (f.dy || 0), f.s || 1.05, t, f); }
  hutGlass(t, o.frost === undefined ? 0.25 : o.frost, o.sun || 0);
  ctx.drawImage(HUT_WALL, -200, -100, W + 400, H + 520);
  hutTally(o.day || 0, o.tallyK === undefined ? 1 : o.tallyK);
  hutStove(t, o.fire === undefined ? 1 : o.fire);
  if (o.before) { o.before(cam); applyCam(cam); }
  const Hh = hutHero(cam, t, Object.assign({ cold: o.cold || 0, sun: o.sun || 0 }, o.hero || {}));
  applyCam(cam);
  hutTable();
  hutPlate(HUT.plateX, HUT.tableY + 14);
  if (o.lemon) lemonHalf(ctx, HUT.plateX + (o.lemon.dx || 0), HUT.tableY - 6, 0.7, t, o.lemon);
  if (o.choc) chocBar(ctx, HUT.chocX + (o.choc.dx || 0), HUT.tableY + 18, 0.78, t, o.choc);
  hutCandle(HUT.candleX, HUT.tableY + 10, t, o.candle === undefined ? 1 : o.candle, o.candleLit === undefined ? 1 : o.candleLit);
  radioSet(ctx, HUT.radioX, HUT.tableY + 18, 0.9, t, o.radio || {});
  if (o.mug !== false) tinMug(ctx, HUT.mugX, HUT.tableY + 20, 0.8, t, 1);
  // the room's light: a warm pool round the candle, a dimmer room as the cold sets in, the sun on day 7
  const cold = clamp(o.cold || 0), sun = clamp(o.sun || 0);
  softDot(gctx, HUT.candleX, HUT.tableY - 100, 520, '#FFB050', 0.18 * (o.candleLit === undefined ? 1 : o.candleLit));
  if (cold > 0.01 && sun < 1) {
    screenSpace();
    ctx.fillStyle = `rgba(10,16,48,${0.32 * cold * (1 - sun)})`; ctx.fillRect(0, 0, W, H);
    applyCam(cam);
  }
  if (sun > 0.01) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(HUT.winX, 0, HUT.winX - 1000, 0);
    g.addColorStop(0, `rgba(255,236,190,${0.35 * sun})`); g.addColorStop(1, 'rgba(255,236,190,0)');
    ctx.fillStyle = g; ctx.beginPath();
    ctx.moveTo(HUT.winX, HUT.winY); ctx.lineTo(HUT.winX, HUT.winY + HUT.winH); ctx.lineTo(HUT.winX - 600, HUT.floorY + 100); ctx.lineTo(HUT.winX - 1150, HUT.floorY + 100); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  if (o.after) o.after(cam, Hh);
  return Hh;
}
