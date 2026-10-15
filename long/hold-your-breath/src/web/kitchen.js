// What If You Hold Your Breath TOO Long? (long-form, 1920x1080): the kitchen on Pip's seventh birthday.
// The hero (the hiker rig in his blue home hoodie, a party hat) sits behind the table on the left, Pip (his niece:
// the rig in pink at about half his size, pigtails, a party hat, her presents round her neck: a whistle and a
// stopwatch) on the right, the cake with seven candles between them. The candles are the referee: whoever breathes
// makes them flicker. Light: a low sun through the window over the sink (right), a warm pendant over the table;
// at the end (DUSK) the window is pink and the candles light the faces. World coords = screen coords at zoom 1.
'use strict';

const KIT = { floorY: 905, tableY: 748, frontY: 790, heroX: 640, heroY: 802, hs: 0.8, pipX: 1290, pipY: 812, ps: 0.5,
  cakeX: 965, cakeY: 640, winX: 1440, winY: 196, winW: 350, winH: 330 };
// the paint/actor marks of the Shorts' cinematic look do nothing in this engine (it has no light stage)
const paint = (fn) => fn();
const actor = (fn) => fn();

const KPAL = Object.assign({}, PAL, {                     // his home hoodie (tickle-yourself, never-sleep)
  coat: '#5B7FD6', coatSh: '#3C59A8', coatHi: '#8FB0FF', coatDk: '#2C4488',
  strap: '#5B7FD6', strapSh: '#3C59A8', pants: '#3A3F58', pantsSh: '#262A40',
  shoe: '#E8E4D8', shoeSh: '#B8B2A0', sole: '#8A8576', pj: false, home: true,
});
const KPIP = Object.assign({}, PAL, {                     // Pip (tickle-yourself's PIPPAL)
  coat: '#FF6FA0', coatSh: '#D84B7E', coatHi: '#FFB0CB', coatDk: '#B03A66',
  strap: '#FFD447', strapSh: '#D8A92A', pants: '#6B4FD8', pantsSh: '#4A35A8',
  shoe: '#FFD447', shoeSh: '#D8A92A', sole: '#FFF6D8', pj: true,
});
// the faces of a breath-holding contest
FACES.smug = { eyeOpen: 1, pupil: 1, lookX: 0.6, lookY: 0, browY: 0.2, browTilt: -0.6, mouth: 'flat', mouthOpen: 0.2, blink: 0.4, cross: 0 };
FACES.hold = { eyeOpen: 1.12, pupil: 0.9, lookX: 0.5, lookY: 0, browY: 0.5, browTilt: -0.4, mouth: 'flat', mouthOpen: 0, blink: 0, cross: 0 };
FACES.strain = { eyeOpen: 1.38, pupil: 0.55, lookX: 0.2, lookY: -0.2, browY: 1.2, browTilt: 1.0, mouth: 'flat', mouthOpen: 0, blink: 0, cross: 0 };
FACES.bulge = { eyeOpen: 1.55, pupil: 0.45, lookX: 0, lookY: 0, browY: 1.5, browTilt: 0.6, mouth: 'flat', mouthOpen: 0, blink: 0, cross: 0 };
FACES.gasp = { eyeOpen: 1.3, pupil: 0.7, lookX: 0, lookY: -0.4, browY: 1.2, browTilt: 0.8, mouth: 'scream', mouthOpen: 0.85, blink: 0, cross: 0 };
FACES.blow = { eyeOpen: 0.7, pupil: 1, lookX: 0.4, lookY: 0.3, browY: 0.6, browTilt: 0.4, mouth: 'o', mouthOpen: 0.75, blink: 0.5, cross: 0 };
FACES.pant = { eyeOpen: 1.2, pupil: 0.8, lookX: 0, lookY: 0, browY: 0.9, browTilt: 0.2, mouth: 'scream', mouthOpen: 0.5, blink: 0, cross: 0 };
FACES.calmK = { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 0.1, browTilt: 0, mouth: 'flat', mouthOpen: 0, blink: 1, cross: 0 };
FACES.proud = { eyeOpen: 1.05, pupil: 0.95, lookX: 0.4, lookY: -0.3, browY: 0.5, browTilt: -0.5, mouth: 'grin', mouthOpen: 0.45, blink: 0.25, cross: 0 };
FACES.deadpan = { eyeOpen: 1, pupil: 1.05, lookX: 0, lookY: 0.1, browY: -0.15, browTilt: -0.25, mouth: 'flat', mouthOpen: 0, blink: 0.48, cross: 0 };
FACES.laugh = { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 1.1, browTilt: 0.5, mouth: 'grin', mouthOpen: 1, blink: 1, cross: 0, squeeze: 1, tear: 0 };
FACES.soft = { eyeOpen: 1, pupil: 1.12, lookX: 0.5, lookY: -0.2, browY: 0.6, browTilt: 0.5, mouth: 'grin', mouthOpen: 0.25, blink: 0.15, cross: 0 };
FACES.glee = { eyeOpen: 1.15, pupil: 1.1, lookX: -0.4, lookY: 0, browY: 0.9, browTilt: -0.2, mouth: 'grin', mouthOpen: 0.9, blink: 0, cross: 0 };
FACES.chew = { eyeOpen: 1, pupil: 1, lookX: -0.5, lookY: 0.1, browY: 0.1, browTilt: -0.1, mouth: 'flat', mouthOpen: 0.4, blink: 0.3, cross: 0 };
FACES.suspicious = { eyeOpen: 0.75, pupil: 0.8, lookX: 0.9, lookY: 0, browY: -0.4, browTilt: -0.9, mouth: 'flat', mouthOpen: 0, blink: 0.45, cross: 0 };
FACES.worriedK = { eyeOpen: 1.2, pupil: 0.8, lookX: -0.6, lookY: -0.2, browY: 0.9, browTilt: 1.2, mouth: 'o', mouthOpen: 0.3, blink: 0, cross: 0 };

// the face, plus what a held breath does to it: f.flush 0..1 (red, then purple with f.purple), drawn on the skin and
// under the eyes, brows and mouth (never-sleep's way of extending drawFace)
const KFACE0 = drawFace;
drawFace = function (c, f, pal) {
  const k = f.flush || 0;
  if (k > 0.02) {
    const col = (f.purple || 0) > 0.5 ? '150,60,175' : '232,58,72';
    c.save(); c.beginPath(); c.ellipse(0, 8, 60, 62, 0, 0, Math.PI * 2); c.clip();
    const g = c.createRadialGradient(0, 26, 8, 0, 12, 74); g.addColorStop(0, `rgba(${col},${0.6 * k})`); g.addColorStop(1, `rgba(${col},${0.22 * k})`);
    c.fillStyle = g; c.fillRect(-70, -60, 140, 140);
    c.restore();
  }
  KFACE0(c, f, pal);
};

let KIT_DAY = null, KIT_DUSK = null;

// ---------------------------------------------------------------- the room, painted once per light (2x, for close-ups)
function kitStatic(c, dusk) {
  const wall = c.createLinearGradient(0, -200, 0, KIT.floorY);
  if (!dusk) { wall.addColorStop(0, '#F4D8A6'); wall.addColorStop(1, '#D9A86C'); }
  else { wall.addColorStop(0, '#5A3E66'); wall.addColorStop(1, '#2C1F3E'); }
  c.fillStyle = wall; c.fillRect(-400, -200, W + 800, KIT.floorY + 400);
  // a faint wallpaper of little leaves
  const rng = mulberry32(17);
  for (let i = 0; i < 260; i++) {
    const x = -380 + rng() * (W + 760), y = -180 + rng() * (KIT.floorY + 160);
    c.save(); c.translate(x, y); c.rotate(rng() * 6.28);
    ellipse(c, 0, 0, 9, 4, dusk ? 'rgba(255,220,255,0.035)' : 'rgba(150,90,40,0.07)');
    c.restore();
  }
  // floor
  const fl = c.createLinearGradient(0, KIT.floorY, 0, KIT.floorY + 300);
  fl.addColorStop(0, dusk ? '#3A2A3A' : '#B07A4A'); fl.addColorStop(1, dusk ? '#1E1424' : '#7A4E2C');
  c.fillStyle = fl; c.fillRect(-400, KIT.floorY, W + 800, 400);
  for (let x = -380; x < W + 400; x += 120) line(c, x, KIT.floorY, x - 60, KIT.floorY + 300, 3, dusk ? 'rgba(0,0,0,0.25)' : 'rgba(90,50,20,0.25)');
  // skirting
  c.fillStyle = dusk ? '#3A2C48' : '#F6E8CC'; c.fillRect(-400, KIT.floorY - 26, W + 800, 26);
  // ---- the fridge (left), Pip's drawings on it
  const fx = 40, fy = 250, fw = 290, fh = KIT.floorY - 250;
  rrect(c, fx, fy, fw, fh, 26); c.fillStyle = dusk ? '#4E6E78' : '#A8E2D2'; c.fill();
  rrect(c, fx + fw - 40, fy + 10, 30, fh - 20, 14); c.fillStyle = dusk ? '#3E5A64' : '#86C8B8'; c.fill();
  line(c, fx + 8, fy + 230, fx + fw - 8, fy + 230, 6, dusk ? '#3A5560' : '#7DBFAE');
  rrect(c, fx + fw - 64, fy + 120, 14, 90, 7); c.fillStyle = dusk ? '#9AA8B0' : '#E8F4F0'; c.fill();
  rrect(c, fx + fw - 64, fy + 270, 14, 130, 7); c.fill();
  const drawing = (x, y, w, h, rot, kind) => {
    c.save(); c.translate(x, y); c.rotate(rot);
    c.fillStyle = dusk ? '#C8C0D8' : '#FFFDF4'; c.fillRect(-w / 2, -h / 2, w, h);
    circle(c, 0, -h / 2 + 4, 9, kind ? '#FF5A6E' : '#3FA7FF');
    c.lineCap = 'round';
    if (kind === 0) {          // two stick figures holding hands under a sun
      circle(c, w * 0.28, -h * 0.28, 14, '#FFC23A');
      for (const [sx, sz, col] of [[-w * 0.2, 1, '#3C59A8'], [w * 0.12, 0.7, '#FF6FA0']]) {
        circle(c, sx, -h * 0.05 + (1 - sz) * 20, 11 * sz, '#E8A070');
        line(c, sx, h * 0.05 + (1 - sz) * 20, sx, h * 0.28, 4, col);
        line(c, sx - 14 * sz, h * 0.42, sx, h * 0.28, 3, col); line(c, sx + 14 * sz, h * 0.42, sx, h * 0.28, 3, col);
      }
      line(c, -w * 0.2, h * 0.12, w * 0.12, h * 0.16, 3, '#2A1B14');
    } else if (kind === 1) {   // a big 7 in crayon
      c.font = '400 76px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#FF5A6E'; c.fillText('7', 0, 6);
      for (let i = 0; i < 5; i++) { c.save(); c.rotate(i * 1.26); line(c, 34, 0, 46, 0, 4, '#FFD447'); c.restore(); }
    } else {                    // a fish
      ellipse(c, -6, 4, 34, 18, '#4DB8FF'); c.beginPath(); c.moveTo(24, 4); c.lineTo(44, -12); c.lineTo(44, 20); c.closePath(); c.fillStyle = '#4DB8FF'; c.fill();
      circle(c, -24, 0, 4, '#15132A');
      for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(-46 - i * 6, -18 - i * 16, 5 + i * 2, 0, 7); c.lineWidth = 2; c.strokeStyle = '#4DB8FF'; c.stroke(); }
    }
    c.restore();
  };
  drawing(fx + 90, fy + 120, 120, 110, -0.08, 0);
  drawing(fx + 190, fy + 330, 100, 120, 0.06, 1);
  drawing(fx + 92, fy + 360, 116, 92, -0.04, 2);
  // ---- an open shelf with jars, middle back
  rrect(c, 520, 300, 360, 16, 4); c.fillStyle = dusk ? '#4A3450' : '#A06A3E'; c.fill();
  const jar = (x, w, h, col, lid) => { rrect(c, x - w / 2, 300 - h, w, h, 10); c.fillStyle = dusk ? 'rgba(160,140,190,0.5)' : 'rgba(255,255,255,0.55)'; c.fill(); rrect(c, x - w / 2 + 6, 300 - h * 0.62, w - 12, h * 0.58, 8); c.fillStyle = col; c.fill(); rrect(c, x - w / 2 - 3, 300 - h - 12, w + 6, 16, 5); c.fillStyle = lid; c.fill(); };
  jar(570, 62, 92, dusk ? '#8A6A40' : '#E8B860', '#E2424B');
  jar(650, 70, 120, dusk ? '#6A5A70' : '#F6F0E2', '#3FA7FF');
  jar(735, 58, 80, dusk ? '#7A4040' : '#D8603A', '#FFC23A');
  jar(820, 66, 104, dusk ? '#5A6A40' : '#9CC860', '#4DB8A0');
  // a little potted plant on the shelf's end
  rrect(c, 850, 250, 40, 50, 6); c.fillStyle = dusk ? '#7A4A40' : '#D8724A'; c.fill();
  for (let i = 0; i < 6; i++) { c.save(); c.translate(870, 252); c.rotate(-1.2 + i * 0.48); ellipse(c, 0, -26, 9, 24, dusk ? '#3E6A50' : '#5FB36A'); c.restore(); }
  // ---- the counter, the sink and the window (right)
  const cx0 = 1330;
  c.fillStyle = dusk ? '#33405A' : '#5AA8B8';                         // the tile splashback
  c.fillRect(cx0, 540, W - cx0 + 400, 120);
  for (let x = cx0; x < W + 400; x += 44) for (let y = 540; y < 660; y += 44) { c.strokeStyle = dusk ? 'rgba(10,10,30,0.35)' : 'rgba(255,255,255,0.35)'; c.lineWidth = 3; c.strokeRect(x, y, 44, 44); }
  // window frame + sky (the sky is drawn per frame: it moves with the sun)
  const { winX: wx, winY: wy, winW: ww, winH: wh } = KIT;
  rrect(c, wx - 20, wy - 20, ww + 40, wh + 40, 12); c.fillStyle = dusk ? '#4A3A5A' : '#FFF6E6'; c.fill();
  c.clearRect(wx, wy, ww, wh);                                          // a hole: the sky shows through
  // counter top + cupboards under it
  rrect(c, cx0 - 10, 652, W - cx0 + 420, 30, 8); c.fillStyle = dusk ? '#5A5068' : '#EDE4D4'; c.fill();
  c.fillStyle = dusk ? '#2E3A52' : '#4A8EA0'; c.fillRect(cx0, 682, W - cx0 + 400, KIT.floorY - 682 - 26);
  for (let x = cx0 + 20; x < W + 380; x += 200) { rrect(c, x, 700, 180, 170, 10); c.fillStyle = dusk ? '#36445E' : '#5AA0B2'; c.fill(); rrect(c, x + 80, 712, 20, 8, 4); c.fillStyle = '#E8E4D8'; c.fill(); }
  // the sink (a dip in the counter) and the tap
  rrect(c, 1500, 646, 230, 20, 8); c.fillStyle = dusk ? '#40384E' : '#C8D2DA'; c.fill();
  c.beginPath(); c.moveTo(1612, 652); c.lineTo(1612, 590); c.quadraticCurveTo(1612, 566, 1640, 566); c.lineTo(1672, 566);
  c.lineWidth = 12; c.strokeStyle = dusk ? '#8A8AA0' : '#D8E0E8'; c.lineCap = 'round'; c.stroke();
  rrect(c, 1592, 640, 40, 14, 5); c.fillStyle = dusk ? '#8A8AA0' : '#D8E0E8'; c.fill();
  // a stack of plates and a dish rack by the sink
  for (let i = 0; i < 4; i++) { ellipse(c, 1820, 640 - i * 9, 60, 9, dusk ? '#9A92B0' : '#FFFFFF'); ellipse(c, 1820, 642 - i * 9, 60, 6, dusk ? '#7A7290' : '#DDE4EA'); }
  // the ceiling cord of the pendant lamp
  line(c, 965, -200, 965, 250, 4, dusk ? '#20182C' : '#5A3A2A');
}

function initKitchen() {
  for (const dusk of [false, true]) {
    const cv = mkCanvas(W * 2 + 800, H * 2 + 1040), c = cv.getContext('2d');
    c.setTransform(2, 0, 0, 2, 400, 200);
    kitStatic(c, dusk);
    if (dusk) KIT_DUSK = cv; else KIT_DAY = cv;
  }
}

// the sky in the window: a low sun (o.sun 0..1 = how far it has sunk), garden, fence, a tree. Drawn under the room.
function kitSky(t, dusk) {
  const { winX: wx, winY: wy, winW: ww, winH: wh } = KIT, c = ctx;
  const g = c.createLinearGradient(0, wy, 0, wy + wh);
  g.addColorStop(0, mixHex('#8FC8FF', '#5A4A9A', dusk)); g.addColorStop(0.65, mixHex('#FFE2A8', '#FF8A7A', dusk)); g.addColorStop(1, mixHex('#FFC878', '#FFB070', dusk));
  c.fillStyle = g; c.fillRect(wx - 4, wy - 4, ww + 8, wh + 8);
  // the sun, low on the right
  const sx = wx + ww * 0.78, sy = wy + wh * lerp(0.56, 0.92, dusk);
  circle(c, sx, sy, 38, mixHex('#FFF4C8', '#FFB070', dusk));
  softDot(gctx, sx, sy, 260, '#FFD890', lerp(0.6, 0.35, dusk));
  // far hills, a fence, a tree with a swing
  c.beginPath(); c.moveTo(wx - 4, wy + wh * 0.72);
  for (let x = 0; x <= ww + 8; x += 20) c.lineTo(wx - 4 + x, wy + wh * 0.72 - 18 * Math.sin(x * 0.012 + 1) - 10 * Math.sin(x * 0.031));
  c.lineTo(wx + ww + 4, wy + wh + 4); c.lineTo(wx - 4, wy + wh + 4); c.closePath(); c.fillStyle = mixHex('#7CC070', '#3E5A50', dusk); c.fill();
  for (let x = wx + 6; x < wx + ww; x += 26) { rrect(c, x, wy + wh * 0.8, 14, 60, 4); c.fillStyle = mixHex('#FFF4E0', '#8A7A9A', dusk); c.fill(); }
  c.fillStyle = mixHex('#FFF4E0', '#8A7A9A', dusk); c.fillRect(wx, wy + wh * 0.84, ww, 7);
  line(c, wx + 70, wy + wh, wx + 74, wy + wh * 0.44, 18, mixHex('#7A5030', '#3A2830', dusk));
  for (const [x, y, r] of [[60, 0.36, 60], [110, 0.30, 52], [30, 0.24, 46], [90, 0.18, 44]]) circle(c, wx + x, wy + wh * y, r, mixHex('#4E9E50', '#2E4A40', dusk));
  // the swing (it sways a little)
  const sw = 0.08 * Math.sin(t * 1.3);
  const px = wx + 110, py = wy + wh * 0.44;
  line(c, px, py, px + 200 * Math.sin(sw) - 10, py + 120, 2, mixHex('#5A3A20', '#2A1E28', dusk));
  line(c, px + 40, py, px + 40 + 200 * Math.sin(sw) - 10, py + 120, 2, mixHex('#5A3A20', '#2A1E28', dusk));
  c.fillStyle = mixHex('#E2424B', '#6A2A40', dusk); c.fillRect(px - 16 + 200 * Math.sin(sw), py + 118, 52, 8);
}

// the bunting across the top: HAPPY BIRTHDAY PIP (per frame: it sways a little)
function kitBunting(t, dusk) {
  const c = ctx, txt = 'HAPPY BIRTHDAY PIP!', n = txt.length, cols = ['#FF5A6E', '#FFD447', '#4DB8A0', '#3FA7FF', '#C8A8FF', '#FF9A3C'];
  const x0 = 560, x1 = 1600, y0 = 96, sag = 70;
  ctx.beginPath(); for (let i = 0; i <= 40; i++) { const u = i / 40; ctx.lineTo(lerp(x0 - 60, x1 + 60, u), y0 + sag * Math.sin(Math.PI * u) - 6); }
  ctx.lineWidth = 3; ctx.strokeStyle = dusk ? 'rgba(220,200,240,0.7)' : 'rgba(120,70,40,0.8)'; ctx.stroke();
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n, x = lerp(x0, x1, u), y = y0 + sag * Math.sin(Math.PI * u);
    const sw = 0.06 * Math.sin(t * 1.7 + i * 0.6);
    c.save(); c.translate(x, y); c.rotate(sw);
    c.beginPath(); c.moveTo(-30, -8); c.lineTo(30, -8); c.lineTo(0, 62); c.closePath();
    c.fillStyle = dusk ? mixHex(cols[i % cols.length], '#3A2A50', 0.45) : cols[i % cols.length]; c.fill();
    if (txt[i] !== ' ') { c.font = '900 30px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = dusk ? 'rgba(255,255,255,0.75)' : '#FFFFFF'; c.fillText(txt[i], 0, 14); }
    c.restore();
  }
}

// a balloon on a string tied at (ax, ay); the balloon floats up and bobs
function kitBalloon(ax, ay, len, r, col, t, seed, dusk) {
  const bx = ax + 26 * Math.sin(t * 0.9 + seed) + (hash(seed) - 0.5) * 50, by = ay - len + 10 * Math.sin(t * 1.3 + seed * 2);
  ctx.beginPath(); ctx.moveTo(ax, ay); ctx.quadraticCurveTo((ax + bx) / 2 + 20 * Math.sin(t + seed), (ay + by) / 2, bx, by + r);
  ctx.lineWidth = 2.5; ctx.strokeStyle = dusk ? 'rgba(220,210,240,0.6)' : 'rgba(255,255,255,0.8)'; ctx.stroke();
  const cc = dusk ? mixHex(col, '#2A1E40', 0.35) : col;
  ellipse(ctx, bx, by, r * 0.86, r, cc);
  ctx.beginPath(); ctx.moveTo(bx - 8, by + r + 10); ctx.lineTo(bx + 8, by + r + 10); ctx.lineTo(bx, by + r - 2); ctx.closePath(); ctx.fillStyle = cc; ctx.fill();
  ellipse(ctx, bx - r * 0.3, by - r * 0.38, r * 0.16, r * 0.28, 'rgba(255,255,255,0.45)', -0.5);
}

// the pendant lamp over the table (its pool of warm light), o.on 0..1
function kitLamp(t, on = 1, dusk = 0) {
  const c = ctx, x = 965;
  c.beginPath(); c.moveTo(x - 120, 330); c.quadraticCurveTo(x - 110, 254, x, 250); c.quadraticCurveTo(x + 110, 254, x + 120, 330); c.closePath();
  c.fillStyle = mixHex('#E2424B', '#8A2A40', dusk); c.fill();
  ellipse(c, x, 330, 120, 16, mixHex('#FFE2A0', '#FFC070', on));
  if (on > 0) {
    softDot(gctx, x, 340, 260, '#FFC878', 0.5 * on);
    c.save(); c.globalCompositeOperation = 'lighter';
    const g = c.createLinearGradient(0, 330, 0, KIT.tableY + 60); g.addColorStop(0, `rgba(255,200,120,${0.13 * on})`); g.addColorStop(1, 'rgba(255,200,120,0)');
    c.fillStyle = g; c.beginPath(); c.moveTo(x - 118, 332); c.lineTo(x + 118, 332); c.lineTo(x + 520, KIT.tableY + 60); c.lineTo(x - 520, KIT.tableY + 60); c.closePath(); c.fill();
    c.restore();
  }
}

// the room behind everything. o: {dusk 0..1}
function kitBack(cam, t, o = {}) {
  applyCam(cam);
  const dusk = clamp(o.dusk || 0);
  kitSky(t, dusk);
  if (dusk < 1) ctx.drawImage(KIT_DAY, -200, -100, W + 400, H + 520);
  if (dusk > 0) { ctx.globalAlpha = dusk; ctx.drawImage(KIT_DUSK, -200, -100, W + 400, H + 520); ctx.globalAlpha = 1; }
  // the window's light: a warm shaft across the wall toward the table
  const sun = 1 - 0.6 * dusk;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createLinearGradient(KIT.winX, 0, KIT.winX - 900, 0);
  g.addColorStop(0, `rgba(255,214,150,${0.20 * sun})`); g.addColorStop(1, 'rgba(255,214,150,0)');
  ctx.fillStyle = g; ctx.beginPath();
  ctx.moveTo(KIT.winX, KIT.winY); ctx.lineTo(KIT.winX, KIT.winY + KIT.winH); ctx.lineTo(KIT.winX - 760, KIT.floorY); ctx.lineTo(KIT.winX - 1100, KIT.floorY); ctx.closePath(); ctx.fill();
  ctx.restore();
  softDot(gctx, KIT.winX + KIT.winW / 2, KIT.winY + KIT.winH / 2, 300, dusk > 0.5 ? '#FF9A7A' : '#FFE6B0', 0.38 * sun);
  kitBunting(t, dusk);
  kitLamp(t, o.lamp === undefined ? 1 : o.lamp, dusk);
}

// ---------------------------------------------------------------- the chairs (behind the people) and the table (in front)
function kitChairs(t, dusk) {
  const c = ctx, wood = mixHex('#8A5230', '#3A2430', dusk), woodHi = mixHex('#A86A40', '#4A3040', dusk);
  // his chair: a tall back with two posts and slats, behind him
  for (const [x, w, top] of [[KIT.heroX, 250, 618], [KIT.pipX, 200, 672]]) {
    for (const s of [-1, 1]) { rrect(c, x + s * w / 2 - 12, top, 24, KIT.tableY - top + 40, 8); c.fillStyle = wood; c.fill(); }
    for (let k = 0; k < 2; k++) { rrect(c, x - w / 2, top + 10 + k * 46, w, 22, 8); c.fillStyle = k ? wood : woodHi; c.fill(); }
  }
  // Pip's booster cushion (she kneels on it)
  rrect(c, KIT.pipX - 110, KIT.pipY - 30, 220, 50, 20); c.fillStyle = mixHex('#FFD447', '#8A7040', dusk); c.fill();
  // balloons tied to the chair backs
  kitBalloon(KIT.heroX - 125, 628, 380, 54, '#FF5A6E', t, 1, dusk);
  kitBalloon(KIT.heroX - 100, 626, 300, 46, '#FFD447', t, 2, dusk);
  kitBalloon(KIT.pipX + 100, 682, 420, 52, '#4DB8A0', t, 3, dusk);
  kitBalloon(KIT.pipX + 80, 684, 340, 44, '#C8A8FF', t, 4, dusk);
}
// the table top (seen just above its front edge) and the cloth hanging from it
function kitTable(t, dusk) {
  const c = ctx, x0 = 250, x1 = 1680;
  // the top surface
  c.beginPath(); c.moveTo(x0 + 40, KIT.tableY); c.lineTo(x1 - 40, KIT.tableY); c.lineTo(x1, KIT.frontY); c.lineTo(x0, KIT.frontY); c.closePath();
  const g = c.createLinearGradient(0, KIT.tableY, 0, KIT.frontY);
  g.addColorStop(0, mixHex('#FFF6EA', '#8A7A9A', dusk)); g.addColorStop(1, mixHex('#F2E2CC', '#6A5A7A', dusk));
  c.fillStyle = g; c.fill();
  // the cloth's front, with scallops and dots
  c.beginPath(); c.moveTo(x0, KIT.frontY);
  c.lineTo(x1, KIT.frontY); c.lineTo(x1, KIT.floorY + 20);
  for (let x = x1; x >= x0; x -= 60) c.quadraticCurveTo(x - 30, KIT.floorY + 52, x - 60, KIT.floorY + 20);
  c.closePath();
  const g2 = c.createLinearGradient(0, KIT.frontY, 0, KIT.floorY + 50);
  g2.addColorStop(0, mixHex('#F8EBD8', '#7A6A8A', dusk)); g2.addColorStop(1, mixHex('#E0C8A8', '#4A3A5A', dusk));
  c.fillStyle = g2; c.fill();
  const rng = mulberry32(5), cols = ['#FF5A6E', '#FFD447', '#4DB8A0', '#3FA7FF'];
  for (let i = 0; i < 46; i++) { const x = x0 + 20 + rng() * (x1 - x0 - 40), y = KIT.frontY + 14 + rng() * (KIT.floorY - KIT.frontY); circle(c, x, y, 6, rgba(cols[i % 4], dusk ? 0.35 : 0.7)); }
  line(c, x0, KIT.frontY, x1, KIT.frontY, 4, mixHex('#E8D2B4', '#5A4A6A', dusk));
}

// ---------------------------------------------------------------- the cake and its seven candles
// (x, y) = the centre of the cake's top. o: {lit: 0..1 (all), litEach: [..7], lean: rad or [..7], out: seconds since they went
// out (smoke) or -1, slice: 0..1 (a slice cut out of its front right, eaten), dusk}
const CANDLE_COL = ['#FF5A6E', '#FFD447', '#4DB8A0', '#3FA7FF', '#C8A8FF', '#FF9A3C', '#4DFFB4'];
function candleTips(x, y) { return [...Array(7)].map((_, i) => [x + (i - 3) * 30 + (i % 2 ? 0 : 0), y - 8 - 62 + (i % 2 ? 6 : 0)]); }
function kitCake(x, y, t, o = {}) {
  const c = ctx, dusk = o.dusk || 0, rx = 170, ry = 30, h = 120;
  c.save(); c.translate(x, y);
  // the plate
  ellipse(c, 0, h + 12, rx + 44, ry + 10, mixHex('#C8C2E0', '#6A6080', dusk)); ellipse(c, 0, h + 6, rx + 40, ry + 8, mixHex('#F2F0FF', '#9A90B0', dusk));
  // two tiers: the lower one wide, the upper narrower
  const tier = (yy, rr, hh, side, top, drip) => {
    c.beginPath(); c.moveTo(-rr, yy); c.lineTo(-rr, yy + hh); c.ellipse(0, yy + hh, rr, ry * rr / rx, 0, Math.PI, 0, true); c.lineTo(rr, yy); c.closePath();
    const g = c.createLinearGradient(-rr, 0, rr, 0); g.addColorStop(0, mixHex(side, '#FFFFFF', 0.35)); g.addColorStop(0.55, side); g.addColorStop(1, mixHex(side, '#A04060', 0.18));
    c.fillStyle = g; c.fill();
    c.beginPath(); c.moveTo(-rr, yy);
    for (let i = 0; i <= 14; i++) { const u = -1 + (2 * i) / 14, dx = u * rr, dy = yy + (ry * rr / rx) * Math.sqrt(Math.max(0, 1 - u * u)) + (i % 2 ? 22 : 8) * (0.8 + 0.4 * hash(i + rr)); c.lineTo(dx, dy); }
    c.lineTo(rr, yy); c.ellipse(0, yy, rr, ry * rr / rx, 0, 0, Math.PI, true); c.closePath(); c.fillStyle = drip; c.fill();
    ellipse(c, 0, yy, rr, ry * rr / rx, top);
  };
  const dk = (h2) => mixHex(h2, '#3A2A50', dusk * 0.55);
  tier(60, rx, 60, dk('#FF9EC0'), dk('#FFF0F6'), dk('#FFF0F6'));
  tier(0, rx * 0.66, 58, dk('#FFB0CB'), dk('#FFFFFF'), dk('#FFFFFF'));
  // sprinkles
  const rng = mulberry32(31), sc = ['#FF5A6E', '#FFD447', '#4DB8A0', '#3FA7FF', '#C8A8FF'];
  for (let i = 0; i < 40; i++) { const a = rng() * 6.28, r = Math.sqrt(rng()), sx = Math.cos(a) * r * rx * 0.6, sy = Math.sin(a) * r * ry * 0.55; c.save(); c.translate(sx, sy); c.rotate(rng() * 3); c.fillStyle = sc[i % 5]; c.fillRect(-5, -1.5, 10, 3); c.restore(); }
  // a slice cut from the front right (eaten): the dark wedge of the inside
  const sl = o.slice || 0;
  if (sl > 0.01) {
    c.beginPath(); c.moveTo(18, 4); c.lineTo(18 + 70 * sl, 34); c.lineTo(18 + 70 * sl, 118); c.lineTo(18, 88); c.closePath();
    c.fillStyle = dk('#8A3A50'); c.fill();
    for (let k = 0; k < 3; k++) line(c, 20, 30 + k * 26, 18 + 68 * sl, 58 + k * 26, 5, dk('#FFF0F6'));
  }
  c.restore();
  // the candles: striped sticks with a wick, a flame each
  const tips = candleTips(x, y), lit = o.lit === undefined ? 1 : o.lit, out = o.out === undefined ? -1 : o.out;
  tips.forEach(([tx, ty], i) => {
    const base = ty + 62, col = CANDLE_COL[i];
    rrect(c, tx - 7, ty + 4, 14, base - ty - 4, 4); c.fillStyle = dusk ? mixHex(col, '#2A1E40', 0.3) : col; c.fill();
    c.save(); rrect(c, tx - 7, ty + 4, 14, base - ty - 4, 4); c.clip();
    for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(tx - 8, ty + 6 + k * 14); c.lineTo(tx + 8, ty - 2 + k * 14); c.lineWidth = 4; c.strokeStyle = 'rgba(255,255,255,0.6)'; c.stroke(); }
    c.restore();
    line(c, tx, ty + 4, tx, ty - 4, 2.5, '#2A1030');
    const li = (o.litEach ? o.litEach[i] : 1) * lit, le = Array.isArray(o.lean) ? o.lean[i] : (o.lean || 0);
    kitFlame(tx, ty - 3, 1, t, le * (0.85 + 0.3 * hash(i)), li, i);
    if (out >= 0) kitSmoke(tx, ty - 4, 1, out - 0.04 * i, i);
  });
  return tips;
}
// a candle flame (world units): lean = rad from upright (a breath pushes it over and stretches it), k = size 0..1
function kitFlame(x, y, s, t, lean = 0, k = 1, seed = 0) {
  if (k <= 0.02) return;
  const fl = 1 + 0.12 * Math.sin(t * 31 + seed * 2.1) + 0.08 * Math.sin(t * 47 + seed);
  const h = 34 * s * k * fl * (1 + 0.5 * Math.min(1, Math.abs(lean))), w = 10 * s * (0.7 + 0.3 * k);
  for (const c of [ctx, gctx]) {
    c.save(); c.translate(x, y); c.rotate(lean + 0.05 * Math.sin(t * 23 + seed));
    c.beginPath(); c.moveTo(0, 2); c.bezierCurveTo(w * 1.25, -h * 0.2, w * 0.6, -h * 0.74, 0, -h); c.bezierCurveTo(-w * 0.6, -h * 0.74, -w * 1.25, -h * 0.2, 0, 2);
    c.fillStyle = c === ctx ? '#FF8A1E' : 'rgba(255,140,40,0.6)'; c.fill();
    c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(w * 0.7, -h * 0.16, w * 0.34, -h * 0.5, 0, -h * 0.66); c.bezierCurveTo(-w * 0.34, -h * 0.5, -w * 0.7, -h * 0.16, 0, 0);
    c.fillStyle = c === ctx ? '#FFF1A8' : 'rgba(255,236,150,0.55)'; c.fill();
    c.restore();
  }
  softDot(gctx, x, y - h * 0.5, 30 * s * k, '#FFB050', 0.25 * k);
}
// a wisp of smoke from a wick that has gone out (d = seconds since)
function kitSmoke(x, y, s, d, seed = 0) {
  if (d <= 0 || d > 2.4) return;
  const a = clamp(d * 8) * clamp((2.4 - d) / 1.2);
  ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = `rgba(230,222,240,${0.55 * a})`; ctx.lineWidth = (3 + 5 * d) * s;
  ctx.beginPath(); ctx.moveTo(x, y);
  for (let i = 1; i <= 10; i++) { const u = i / 10, yy = y - u * (30 + 120 * d) * s; ctx.lineTo(x + Math.sin(u * 5 + d * 4 + seed) * (4 + 20 * u * d) * s, yy); }
  ctx.stroke(); ctx.restore();
}

// ---------------------------------------------------------------- props in head space and rig space
// a party hat (head space; the brim sits on the hair)
function kHat(c, col, k = 1, tilt = 0, hop = 0) {
  if (k <= 0) return;
  c.save(); c.translate(8, -60 - hop); c.rotate(0.12 + tilt); c.scale(k, k);
  c.beginPath(); c.moveTo(-40, 0); c.lineTo(40, 0); c.lineTo(3, -98); c.closePath(); c.fillStyle = col[0]; c.fill();
  c.save(); c.beginPath(); c.moveTo(-40, 0); c.lineTo(40, 0); c.lineTo(3, -98); c.closePath(); c.clip();
  for (let i = 0; i < 5; i++) { c.fillStyle = i % 2 ? col[1] : col[2]; c.beginPath(); c.moveTo(-60, -14 - i * 22); c.lineTo(60, -34 - i * 22); c.lineTo(60, -44 - i * 22); c.lineTo(-60, -24 - i * 22); c.closePath(); c.fill(); }
  c.restore();
  rrect(c, -44, -8, 88, 14, 7); c.fillStyle = '#FFFFFF'; c.fill();
  circle(c, 3, -102, 13, col[1]);
  c.restore();
}
// cheeks puffed with a held breath (head space), k 0..1; wob = a wobble (the strain)
function kCheeks(c, k, pal, wob = 0, t = 0) {
  if (k <= 0.03) return;
  const w = 1 + 0.06 * wob * Math.sin(t * 26);
  for (const s of [-1, 1]) ellipse(c, s * 50, 30, (15 + 14 * k) * w, (13 + 12 * k) / w, pal.skin);
  for (const s of [-1, 1]) ellipse(c, s * 53, 30, 9 + 6 * k, 6 + 4 * k, 'rgba(255,110,110,0.34)');
  // lips pressed into a little knot
  c.beginPath(); c.moveTo(-9, 40); c.quadraticCurveTo(0, 46, 9, 40); c.lineWidth = 5; c.strokeStyle = pal.mouth; c.lineCap = 'round'; c.stroke();
}
// the face going red, then purple (head space; under the eyes so they stay clean): k 0..1
function kFlush(c, k, purple = 0) {
  if (k <= 0.02) return;
  c.save(); c.beginPath(); c.ellipse(0, 4, 62, 66, 0, 0, Math.PI * 2); c.clip();
  const col = purple > 0.5 ? '160,60,170' : '235,60,70';
  const g = c.createRadialGradient(0, 24, 10, 0, 10, 76); g.addColorStop(0, `rgba(${col},${0.62 * k})`); g.addColorStop(1, `rgba(${col},${0.26 * k})`);
  c.fillStyle = g; c.fillRect(-70, -60, 140, 140);
  c.restore();
}
// a cold wet cloth over his forehead and eyes (head space), k 0..1 (it slaps on), drip = time for the drips
function kCloth(c, k, t) {
  if (k <= 0.01) return;
  c.save(); c.translate(0, -18 - 40 * (1 - k)); c.rotate(-0.06); c.scale(1, lerp(0.4, 1, k));
  c.beginPath(); c.moveTo(-74, -30); c.quadraticCurveTo(0, -46, 76, -28); c.lineTo(80, 16);
  for (let x = 80; x >= -78; x -= 22) c.quadraticCurveTo(x - 11, 30 + 6 * Math.sin(x), x - 22, 16);
  c.closePath();
  const g = c.createLinearGradient(0, -40, 0, 30); g.addColorStop(0, '#9FE0FF'); g.addColorStop(1, '#4AA8E0');
  c.fillStyle = g; c.fill();
  for (let i = 0; i < 4; i++) line(c, -60 + i * 38, -26, -54 + i * 38, 14, 3, 'rgba(255,255,255,0.35)');
  c.restore();
  // drips
  for (let i = 0; i < 3; i++) {
    const ph = (t * 0.9 + i * 0.37) % 1, x = -50 + i * 50;
    circle(c, x, 30 + 70 * ph * ph, 5 * (1 - ph * 0.5), `rgba(140,210,255,${0.9 * (1 - ph)})`);
  }
}
// a whistle on a lanyard (rig space; o.at = 'chest' or a world-free point in rig units for "at her mouth")
function kWhistle(c, r, blowK, t) {
  const neck = r.neck, chest = [r.chest[0] + 10, r.chest[1] - 6];
  const at = blowK > 0 ? [lerp(chest[0], r.head[0] + 6, blowK), lerp(chest[1], r.head[1] + 40, blowK)] : chest;
  c.beginPath(); c.moveTo(neck[0] - 30, neck[1] + 6); c.quadraticCurveTo(at[0] - 20, at[1] - 10, at[0], at[1]); c.moveTo(neck[0] + 30, neck[1] + 6); c.quadraticCurveTo(at[0] + 20, at[1] - 10, at[0], at[1]);
  c.lineWidth = 5; c.strokeStyle = '#E2424B'; c.stroke();
  c.save(); c.translate(at[0], at[1]); c.rotate(-0.3 + 0.2 * blowK);
  rrect(c, -22, -12, 44, 24, 10); c.fillStyle = '#FFD447'; c.fill();
  rrect(c, 14, -8, 22, 12, 4); c.fillStyle = '#E8B820'; c.fill();
  circle(c, -6, 0, 6, '#B08010');
  c.restore();
}
// her stopwatch (rig space, in her left hand when she holds it up): k 0..1 shows it, secs on its face
function kStopwatch(c, x, y, s, secs, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  rrect(c, -8, -62, 16, 14, 4); c.fillStyle = '#B8BCC8'; c.fill();
  circle(c, 0, 0, 50, '#C8CCD8'); circle(c, 0, 0, 42, '#FFFFFF');
  for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; line(c, Math.sin(a) * 34, -Math.cos(a) * 34, Math.sin(a) * 40, -Math.cos(a) * 40, 3, '#2A2A3A'); }
  const a = (secs % 60) / 60 * 6.283;
  line(c, 0, 0, Math.sin(a) * 34, -Math.cos(a) * 34, 4, '#E2424B');
  circle(c, 0, 0, 5, '#2A2A3A');
  c.restore();
}

// ---------------------------------------------------------------- the people
// the seated rig at the table: pelvis hidden by the table; IK hands. h: {face, L, R (rig-local IK targets), lean, headDX, headDY,
// headRot, dx, dy, shake, tremble, puff, wob, flush, purple, hat [k, tilt, hop], cloth, blowArm, sweat, post(lc, r, st)}
function kitSeatPose(h = {}) {
  const base = { hipY: -34, lean: h.lean || 0, armL: { a: 0.3, b: 0.2 }, armR: { a: 0.3, b: 0.2 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, hand: h.hand || 'open', feetFront: 1 };
  let p = ikReach(base, 'L', h.L || [-70, -60], -1);
  p = ikReach(p, 'R', h.R || [70, -60], 1);
  if (h.up > 0) p = lerpPose(p, Object.assign({}, p, { armL: { a: 2.35, b: 0.45 }, armR: { a: 2.2, b: 0.6 }, hand: 'spread' }), clamp(h.up));
  if (h.tremble) p = twitch(p, h.t || 0, h.tremble, 11);
  return p;
}
function kitPerson(cam, t, who, h = {}) {
  const pip = who === 'pip', X = pip ? KIT.pipX : KIT.heroX, Y = pip ? KIT.pipY : KIT.heroY, S = pip ? KIT.ps : KIT.hs;
  const shk = h.shake || 0;
  const st = { x: X + (h.dx || 0) + shk * 6 * Math.sin(t * 40), y: Y + (h.dy || 0) + shk * 4 * Math.abs(Math.sin(t * 23)), s: S * (h.sMul || 1),
    face: Object.assign({}, h.face || FACES.calm, { flush: h.flush || 0, purple: h.purple || 0 }), pose: h.pose || kitSeatPose(Object.assign({ t }, h)), noLegs: true, seed: pip ? 9 : 4,
    headDX: (h.headDX || 0) + shk * 5 * Math.sin(t * 31), headDY: h.headDY || 0, headRot: (h.headRot || 0) + shk * 0.06 * Math.sin(t * 17) };
  const pal = pip ? KPIP : KPAL;
  lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.clearRect(0, 0, W, H);
  camTransform(lctx, cam, 1);
  const r = drawCharacter(lctx, st, t, pal);
  lctx.save(); lctx.translate(st.x, st.y); lctx.scale(st.s, st.s);
  if (pip) { pigtails2(lctx, r, st, t); }
  lctx.restore();
  // head-space extras
  lctx.save(); lctx.translate(st.x, st.y); lctx.scale(st.s, st.s);
  lctx.translate(r.head[0] + (st.headDX || 0), r.head[1] + (st.headDY || 0)); lctx.rotate(r.lean + (st.headRot || 0));
  kCheeks(lctx, h.puff || 0, pal, h.wob || 0, t);
  if (h.sweat > 0) for (const s of [-1, 1]) sweatDrop(lctx, s * 68, -44 + 30 * ((t * 0.7 + (s > 0 ? 0.5 : 0)) % 1), 0.8, h.sweat);
  if (h.cloth) kCloth(lctx, h.cloth, t);
  if (h.goggles > 0.01) kGoggles(lctx, h.goggles);
  if (h.nose > 0.01) kNose(lctx, h.nose, t);
  const hat = h.hat === undefined ? [1, 0, 0] : h.hat;
  if (hat && hat[0] > 0) kHat(lctx, pip ? ['#FFD447', '#FF5A6E', '#4DB8A0'] : ['#3FA7FF', '#FFD447', '#FF5A6E'], hat[0], hat[1] || 0, hat[2] || 0);
  if (h.headPost) h.headPost(lctx, r, st);
  lctx.restore();
  lctx.save(); lctx.translate(st.x, st.y); lctx.scale(st.s, st.s);
  if (pip && h.whistle !== false) kWhistle(lctx, r, h.whistleBlow || 0, t);
  if (h.stopwatch > 0.01) { const w = r.wrR, d = r.armDirR; kStopwatch(lctx, w[0] + d[0] * 30, w[1] + d[1] * 30 - 10, 0.9 * popK2(h.stopwatch), 0, t); }
  if (h.clothUp > 0.01) { const w = r.wrL; lctx.save(); lctx.translate(w[0], w[1] - 20); lctx.rotate(-0.2); lctx.scale(0.9, 0.9); kCloth(lctx, 1, t); lctx.restore(); }
  if (h.eat) { const w = r.wrR; lctx.save(); lctx.translate(w[0], w[1]); lctx.rotate(-2.2); line(lctx, 0, 0, 0, -70, 6, '#C8CCD8'); for (let i = -1; i <= 1; i++) line(lctx, i * 6, -66, i * 6, -90, 3, '#C8CCD8'); circle(lctx, 0, -84, 9, '#FFB0CB'); lctx.restore(); }
  if (h.match > 0.01) { const w = r.wrL, d = r.armDirL; const tip = [w[0] + d[0] * 120, w[1] + d[1] * 120]; line(lctx, w[0], w[1], tip[0], tip[1], 6, '#E8C890'); circle(lctx, tip[0], tip[1], 7, '#C83A2A'); kitFlameL(lctx, tip[0], tip[1] - 4, 1.4, t); }
  if (h.post) h.post(lctx, r, st);
  lctx.restore();
  // light: a warm key from the window side (right), cooler fill on the left; at dusk the candles light them from below-front
  lctx.setTransform(1, 0, 0, 1, 0, 0);
  lctx.globalCompositeOperation = 'source-atop';
  const dusk = h.dusk || 0;
  lctx.fillStyle = `rgba(30,20,60,${0.10 + 0.25 * dusk})`; lctx.fillRect(0, 0, W, H);
  const [kx] = toScreen(cam, KIT.winX + 100, 0);
  const g = lctx.createLinearGradient(kx, 0, kx - 1400 * cam.zoom, 0);
  g.addColorStop(0, `rgba(255,196,120,${0.30 * (1 - dusk)})`); g.addColorStop(1, 'rgba(255,196,120,0)');
  lctx.fillStyle = g; lctx.fillRect(0, 0, W, H);
  if (h.candle > 0) {
    const [cx, cy] = toScreen(cam, KIT.cakeX, KIT.cakeY - 60);
    const g2 = lctx.createRadialGradient(cx, cy, 10, cx, cy, 700 * cam.zoom);
    g2.addColorStop(0, `rgba(255,170,80,${0.4 * h.candle})`); g2.addColorStop(1, 'rgba(255,170,80,0)');
    lctx.fillStyle = g2; lctx.fillRect(0, 0, W, H);
  }
  lctx.globalCompositeOperation = 'source-over';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(layerC, 0, 0);
  return { st, r };
}
// Pip's pigtails and fringe (rig space; tickle-yourself's pigtails with yellow bobbles)
function pigtails2(c, r, st, t) {
  const [hx, hy] = r.head;
  c.save(); c.translate(hx + (st.headDX || 0), hy + (st.headDY || 0)); c.rotate(r.lean + (st.headRot || 0));
  for (const s of [-1, 1]) {
    const sw = 0.12 * Math.sin(t * 7 + s);
    c.save(); c.translate(s * 60, -36); c.rotate(s * (0.5 + sw));
    ellipse(c, s * 34, 6, 40, 26, PAL.hair, s * 0.2); ellipse(c, s * 52, 14, 22, 16, PAL.hair, s * 0.4);
    line(c, s * 22, -6, s * 54, 0, 4, PAL.hairHi);
    circle(c, s * 2, 2, 13, '#FFD447'); circle(c, s * 0 - 3, -2, 5, '#FFF6C8');
    c.restore();
  }
  c.beginPath(); c.moveTo(-60, -20); c.quadraticCurveTo(-40, -2, -20, -24); c.quadraticCurveTo(0, -4, 20, -26); c.quadraticCurveTo(42, -4, 60, -20);
  c.lineTo(56, -52); c.lineTo(-56, -52); c.closePath(); c.fillStyle = PAL.hair; c.fill();
  c.restore();
}
// rig-local -> world for either person
function kitPt(who, p, h = {}) {
  const pip = who === 'pip', X = pip ? KIT.pipX : KIT.heroX, Y = pip ? KIT.pipY : KIT.heroY, S = (pip ? KIT.ps : KIT.hs) * (h.sMul || 1);
  return [X + (h.dx || 0) + p[0] * S, Y + (h.dy || 0) + p[1] * S];
}
// where a seated person's head centre is (world)
function kitHead(who, h = {}) { return kitPt(who, [0 + (h.headDX || 0), -282 + (h.headDY || 0)], h); }

// ---------------------------------------------------------------- the whole kitchen with both of them
// o: {dusk, lamp, hero: h, pip: h, cake: {...}, noCake, before(cam), between(cam) (after the people, before the table), after(cam)}
function kitScene(cam, t, o = {}) {
  const dusk = clamp(o.dusk || 0);
  kitBack(cam, t, { dusk, lamp: o.lamp });
  applyCam(cam);
  kitChairs(t, dusk);
  if (o.before) { o.before(cam); applyCam(cam); }
  const H1 = kitPerson(cam, t, 'hero', Object.assign({ dusk }, o.hero || {}));
  const H2 = kitPerson(cam, t, 'pip', Object.assign({ dusk }, o.pip || {}));
  applyCam(cam);
  if (o.between) { o.between(cam, H1, H2); applyCam(cam); }
  kitTable(t, dusk);
  let tips = null;
  if (!o.noCake) tips = kitCake(KIT.cakeX, KIT.cakeY, t, Object.assign({ dusk }, o.cake || {}));
  if (o.pip && o.pip.eat) {   // her plate with a slice on it, in front of her
    const px = KIT.pipX - 20, py = KIT.tableY + 20;
    ellipse(ctx, px, py + 6, 90, 18, mixHex('#C8C2E0', '#6A6080', dusk)); ellipse(ctx, px, py + 2, 86, 16, mixHex('#FFFFFF', '#9A90B0', dusk));
    ctx.beginPath(); ctx.moveTo(px - 50, py - 4); ctx.lineTo(px + 40, py - 18); ctx.lineTo(px + 44, py - 50); ctx.lineTo(px - 46, py - 36); ctx.closePath(); ctx.fillStyle = mixHex('#FF9EC0', '#6A4060', dusk); ctx.fill();
    ctx.beginPath(); ctx.moveTo(px - 46, py - 36); ctx.lineTo(px + 44, py - 50); ctx.lineTo(px + 40, py - 60); ctx.lineTo(px - 50, py - 44); ctx.closePath(); ctx.fillStyle = mixHex('#FFF0F6', '#8A7090', dusk); ctx.fill();
    for (let i = 0; i < 5; i++) circle(ctx, px - 60 + 30 * hash(i * 3.3) * 4, py + 10 + 6 * hash(i), 3, '#FFB0CB');
  }
  applyCam(cam);
  if (o.after) o.after(cam, H1, H2, tips);
  return { H1, H2, tips };
}

const popK2 = (k) => E.outBack(clamp(k), 2);
// swimming goggles (head space): two lenses over the eyes and a strap round the head
function kGoggles(c, k) {
  c.save(); c.translate(0, -2 - 40 * (1 - k)); c.globalAlpha = clamp(k * 2);
  c.beginPath(); c.ellipse(0, 0, 66, 12, 0, 0, Math.PI * 2); c.lineWidth = 8; c.strokeStyle = '#2A2A3A'; c.stroke();
  for (const s of [-1, 1]) {
    ellipse(c, s * 24, -2, 21, 18, '#1A1E2A');
    ellipse(c, s * 24, -2, 16, 13, 'rgba(120,220,255,0.55)');
    ellipse(c, s * 24 - 6, -7, 5, 3, 'rgba(255,255,255,0.8)');
  }
  line(c, -4, -2, 4, -2, 6, '#1A1E2A');
  c.restore();
}
// the nose breathing (head space): nostrils that flare and a thin whistle of air (Pip's cheat)
function kNose(c, k, t) {
  for (const s of [-1, 1]) ellipse(c, s * 7, 19, 4 + 3 * k, 2.5 + 2 * k, 'rgba(90,30,30,0.85)');
  for (let i = 0; i < 3; i++) {
    const ph = (t * 1.8 + i / 3) % 1;
    c.beginPath(); c.moveTo(-14 - 30 * ph, 26 + 10 * ph); c.quadraticCurveTo(-22 - 40 * ph, 30 + 16 * ph + 4 * Math.sin(t * 20 + i), -30 - 50 * ph, 30 + 22 * ph);
    c.lineWidth = 3; c.strokeStyle = `rgba(200,240,255,${0.8 * k * (1 - ph)})`; c.lineCap = 'round'; c.stroke();
  }
}
// a small flame on any context (the match), plus its glow
function kitFlameL(c, x, y, s, t) {
  const h = 22 * s * (1 + 0.12 * Math.sin(t * 31)), w = 7 * s;
  c.save(); c.translate(x, y);
  c.beginPath(); c.moveTo(0, 2); c.bezierCurveTo(w * 1.25, -h * 0.2, w * 0.6, -h * 0.74, 0, -h); c.bezierCurveTo(-w * 0.6, -h * 0.74, -w * 1.25, -h * 0.2, 0, 2);
  c.fillStyle = '#FF8A1E'; c.fill();
  c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(w * 0.7, -h * 0.16, w * 0.34, -h * 0.5, 0, -h * 0.66); c.bezierCurveTo(-w * 0.34, -h * 0.5, -w * 0.7, -h * 0.16, 0, 0);
  c.fillStyle = '#FFF1A8'; c.fill();
  c.restore();
}
