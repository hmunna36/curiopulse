// His room at night, seen from his monitor: the wall with an LED strip, a poster, a shelf with a clock, a door that
// Mom can throw open, his chair, the desk with a keyboard, and the hero in pyjamas with his fingers locked.
// World coords are screen coords at zoom 1 (1080x1920). Everything draws under the camera (applyCam) unless it says so.
'use strict';

const DEN = {
  hx: 540, hy: 1488, hs: 1.55,            // the hero (feet line, scale): his head is at y ≈ 760, his chest at ≈ 990
  deskY: 1128,                            // the far edge of the desk
  door: [778, 470, 232, 690],             // x, y, w, h of the doorway
  clasp: [0, -294],                       // where his locked hands sit (rig-local)
  restL: [-118, -236], restR: [118, -236],   // his hands at rest on the desk edge (rig-local)
};
// pyjamas: he is supposed to be asleep
const DENPAL = Object.assign({}, PAL, { coat: '#5468E8', coatSh: '#3443A8', coatHi: '#93A2FF', coatDk: '#27327E', pj: true });
let DEN_WALL = null, DEN_DESK = null;
// degrees after t seconds for something that goes round n times in the Short: ambient colour that loops with the picture
const denHue = (t, n) => (360 * n * t) / TLd.duration;

function initDen() {
  // ---- the wall (static): paint once at world scale 1 with a margin, so camera shakes never show an edge
  const M = 240;
  DEN_WALL = mkCanvas(W + 2 * M, H + 2 * M);
  const c = DEN_WALL.getContext('2d');
  c.translate(M, M);
  const g = c.createLinearGradient(0, 300, 0, 1300);
  g.addColorStop(0, '#141338'); g.addColorStop(0.5, '#1D1A4C'); g.addColorStop(1, '#151235');
  c.fillStyle = g; c.fillRect(-M, -M, W + 2 * M, H + 2 * M);
  // soft wallpaper stripes
  for (let x = -M; x < W + M; x += 90) { c.fillStyle = 'rgba(120,110,255,0.035)'; c.fillRect(x, -M, 44, H + 2 * M); }
  // the poster: a rocket leaving a planet
  c.save(); c.translate(214, 742); c.rotate(-0.035);
  rrect(c, -112, -170, 224, 340, 10); c.fillStyle = '#0D1030'; c.fill(); c.lineWidth = 8; c.strokeStyle = '#E9E3D2'; c.stroke();
  c.save(); rrect(c, -108, -166, 216, 332, 8); c.clip();
  const pg = c.createLinearGradient(0, -170, 0, 170); pg.addColorStop(0, '#1B1F5C'); pg.addColorStop(1, '#3B1B58'); c.fillStyle = pg; c.fillRect(-112, -170, 224, 340);
  const rng = mulberry32(5);
  for (let i = 0; i < 26; i++) circle(c, -104 + rng() * 208, -160 + rng() * 240, 1 + rng() * 2, 'rgba(255,255,255,0.7)');
  circle(c, 0, 250, 170, '#E86A5C'); circle(c, -40, 210, 150, '#F08A6C'); ellipse(c, 30, 140, 60, 16, 'rgba(120,40,60,0.35)', -0.2);
  c.save(); c.translate(26, -40); c.rotate(0.5);
  c.beginPath(); c.moveTo(0, -70); c.quadraticCurveTo(30, -30, 24, 30); c.lineTo(-24, 30); c.quadraticCurveTo(-30, -30, 0, -70); c.fillStyle = '#F4F0E6'; c.fill();
  c.beginPath(); c.moveTo(-24, 6); c.lineTo(-46, 40); c.lineTo(-24, 30); c.closePath(); c.moveTo(24, 6); c.lineTo(46, 40); c.lineTo(24, 30); c.closePath(); c.fillStyle = '#EF4638'; c.fill();
  circle(c, 0, -18, 11, '#7FE9FF');
  c.beginPath(); c.moveTo(-14, 30); c.quadraticCurveTo(0, 96, 14, 30); c.closePath(); c.fillStyle = '#FFC23A'; c.fill();
  c.restore();
  c.restore(); c.restore();
  // a shelf with books, a cactus and a trophy
  c.fillStyle = '#3A2B5E'; c.fillRect(70, 1002, 300, 18); c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(70, 1020, 300, 10);
  const books = [['#EF4638', 26, 96], ['#FFC23A', 20, 82], ['#1CB3A4', 30, 104], ['#C8A8FF', 18, 76], ['#F4F0E6', 24, 90]];
  let bx = 84;
  for (const [col, w, h] of books) { rrect(c, bx, 1002 - h, w, h, 3); c.fillStyle = col; c.fill(); c.fillStyle = 'rgba(0,0,0,0.22)'; c.fillRect(bx + w - 6, 1002 - h, 6, h); bx += w + 3; }
  // cactus
  rrect(c, 300, 962, 50, 40, 6); c.fillStyle = '#C96F4A'; c.fill();
  ellipse(c, 325, 934, 17, 36, '#2FA36B'); ellipse(c, 306, 946, 9, 18, '#2FA36B'); ellipse(c, 344, 940, 9, 20, '#2FA36B');
  // the doorway's frame
  const [dx, dy, dw, dh] = DEN.door;
  c.fillStyle = '#0C0B22'; c.fillRect(dx - 16, dy - 16, dw + 32, dh + 16);
  c.fillStyle = '#2B2760'; c.fillRect(dx - 16, dy - 16, dw + 32, 16); c.fillRect(dx - 16, dy - 16, 16, dh + 16); c.fillRect(dx + dw, dy - 16, 16, dh + 16);
  // skirting board
  c.fillStyle = '#0F0D2B'; c.fillRect(-M, 1150, W + 2 * M, H);

  // ---- the desk top (static part): wood seen from above, its far edge at DEN.deskY
  DEN_DESK = mkCanvas(W + 2 * M, 900 + M);
  const d = DEN_DESK.getContext('2d');
  d.translate(M, 0);
  const dg = d.createLinearGradient(0, 0, 0, 800);
  dg.addColorStop(0, '#4A2F55'); dg.addColorStop(0.12, '#3A2346'); dg.addColorStop(1, '#1C1028');
  d.fillStyle = dg; d.fillRect(-M, 0, W + 2 * M, 900 + M);
  d.fillStyle = '#6B4A78'; d.fillRect(-M, 0, W + 2 * M, 10);                       // the lit far edge
  const r2 = mulberry32(9);
  for (let i = 0; i < 40; i++) { const y = 20 + r2() * 760; d.fillStyle = `rgba(255,220,255,${0.02 + 0.03 * r2()})`; d.fillRect(-M + r2() * W, y, 200 + r2() * 500, 2); }
}

// ---------------------------------------------------------------- Mom
// She stands in the doorway, lit from behind. o: {shout 0..1, cross 0..1 (arms crossed), slump 0..1, tap, look}
function denMom(c, x, y, s, t, o = {}) {
  const sh = clamp(o.shout || 0), cr = clamp(o.cross || 0), sl = clamp(o.slump || 0);
  const bob = (o.tap ? 3 * Math.abs(Math.sin(t * 9)) : 0) + 10 * sl;
  const BODY = '#2B1838', BODY2 = '#3A2249', APRON = '#5A3C63', SKIN = '#9A6250', SKIN2 = '#7C4A3E', HAIR = '#140C1C', RIM = '#FFC98A';
  c.save(); c.translate(x, y + bob); c.scale(s, s);
  const lean = -0.1 * sh + 0.03 * Math.sin(t * 18) * sh;
  c.rotate(lean);
  // dress
  c.beginPath(); c.moveTo(-58, -300); c.quadraticCurveTo(-84, -290, -88, -240); c.lineTo(-104, 20); c.lineTo(104, 20); c.lineTo(88, -240); c.quadraticCurveTo(84, -290, 58, -300); c.closePath();
  c.fillStyle = BODY; c.fill();
  c.lineWidth = 5; c.strokeStyle = rgba(RIM, 0.75); c.stroke();
  // apron
  c.beginPath(); c.moveTo(-40, -250); c.lineTo(40, -250); c.lineTo(62, 10); c.lineTo(-62, 10); c.closePath(); c.fillStyle = APRON; c.fill();
  line(c, -40, -250, -30, -300, 6, APRON); line(c, 40, -250, 30, -300, 6, APRON);
  rrect(c, -22, -150, 44, 34, 6); c.fillStyle = BODY2; c.fill();
  // the far arm: on her hip, or folded
  const armCol = BODY2;
  const hipArm = (sd) => {
    c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = 30; c.strokeStyle = armCol;
    c.beginPath(); c.moveTo(sd * 70, -276); c.lineTo(sd * 124, -200); c.lineTo(sd * 78, -150); c.stroke();
    c.lineWidth = 4; c.strokeStyle = rgba(RIM, 0.6); c.beginPath(); c.moveTo(sd * 84, -286); c.lineTo(sd * 138, -204); c.stroke();
    circle(c, sd * 78, -150, 15, SKIN);
  };
  if (cr > 0.5) {                                   // arms folded
    c.lineCap = 'round'; c.lineWidth = 30; c.strokeStyle = armCol;
    c.beginPath(); c.moveTo(-70, -276); c.lineTo(-92, -206); c.lineTo(34, -196); c.stroke();
    c.beginPath(); c.moveTo(70, -276); c.lineTo(92, -210); c.lineTo(-34, -214); c.stroke();
    circle(c, 40, -196, 14, SKIN); circle(c, -40, -216, 14, SKIN);
    c.lineWidth = 4; c.strokeStyle = rgba(RIM, 0.5); c.beginPath(); c.moveTo(-84, -284); c.lineTo(-108, -210); c.stroke(); c.beginPath(); c.moveTo(84, -284); c.lineTo(108, -212); c.stroke();
  } else {
    hipArm(1);
    // the near arm shakes a wooden spoon at him (he is to her left on screen)
    const sw = 0.5 * Math.sin(t * 20) * sh, a = lerp(0.2, -1.35 + sw * 0.5, sh);     // 0 = down, negative = up and to the left
    const ex = -70 - 62 * Math.sin(-a * 0.7), ey = -276 + 70 * Math.cos(a * 0.7);
    const hxx = ex + 74 * Math.sin(a - 0.5), hyy = ey - 74 * Math.cos(a - 0.5) * (sh > 0.3 ? 1 : -0.2);
    if (sh > 0.25) {
      c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = 30; c.strokeStyle = armCol;
      c.beginPath(); c.moveTo(-70, -276); c.lineTo(ex, ey); c.lineTo(hxx, hyy); c.stroke();
      // the spoon
      const sa = a - 0.9 + sw;
      c.save(); c.translate(hxx, hyy); c.rotate(sa);
      line(c, 0, 10, 0, -96, 11, '#B98452'); ellipse(c, 0, -112, 19, 26, '#C9965F'); ellipse(c, -3, -116, 10, 15, '#DDB07A');
      c.restore();
      circle(c, hxx, hyy, 16, SKIN);
    } else hipArm(-1);
  }
  // neck + head
  rrect(c, -15, -330, 30, 40, 8); c.fillStyle = SKIN2; c.fill();
  c.save(); c.translate(0, -372 + 6 * sl); c.rotate(-0.06 * sh + (o.look || 0) * 0.08);
  circle(c, 0, -64, 30, HAIR);                                                   // the bun
  ellipse(c, 0, 0, 56, 62, SKIN);
  c.beginPath(); c.moveTo(-58, 6); c.quadraticCurveTo(-64, -66, 0, -66); c.quadraticCurveTo(64, -66, 58, 6); c.quadraticCurveTo(40, -34, 0, -38); c.quadraticCurveTo(-40, -34, -58, 6); c.closePath(); c.fillStyle = HAIR; c.fill();
  c.lineWidth = 4; c.strokeStyle = rgba(RIM, 0.7); c.beginPath(); c.arc(0, 0, 58, -0.5, 0.9); c.stroke(); c.beginPath(); c.arc(0, -64, 31, -1.2, 0.6); c.stroke();
  // glasses: two bright lenses, no eyes behind them
  const gl = 0.75 + 0.25 * Math.sin(t * 3.1);
  for (const sd of [-1, 1]) {
    circle(c, sd * 22 - 6, 0, 19, '#1A1024'); circle(c, sd * 22 - 6, 0, 15, rgba('#CFF3FF', 0.9 * gl));
    c.fillStyle = 'rgba(255,255,255,0.9)'; c.beginPath(); c.ellipse(sd * 22 - 11, -5, 5, 8, 0.5, 0, 7); c.fill();
  }
  line(c, -9, 0, -3, 0, 4, '#1A1024');
  // brows and mouth
  const bt = 0.9 * Math.max(sh, cr * 0.7);
  line(c, -46, -22 - 8 * bt, -12, -16 + 4 * bt, 6, HAIR); line(c, 2, -16 + 4 * bt, 36, -22 - 8 * bt, 6, HAIR);
  if (sh > 0.3) { ellipse(c, -6, 34, 15, 9 + 9 * Math.abs(Math.sin(t * 22)), '#3A0C18'); }
  else if (sl > 0.4) { c.beginPath(); c.moveTo(-20, 36); c.quadraticCurveTo(-6, 28, 8, 36); c.lineWidth = 4.5; c.strokeStyle = '#3A0C18'; c.lineCap = 'round'; c.stroke(); }
  else line(c, -20, 34, 8, 34, 4.5, '#3A0C18');
  c.restore();
  c.restore();
}

// a jagged shout bubble with two lines of text (screen space); (tx, ty) = where its tail points
function denShout(x, y, k, lines, tx, ty, o = {}) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.2) * (o.s || 1), wob = o.wob || 0;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.rotate((o.rot === undefined ? -0.05 : o.rot) + wob); ctx.scale(s, s);
  const rw = o.w || 214, rh = o.h || 112, n = 16;
  const path = () => {
    ctx.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const a = (i / (n * 2)) * Math.PI * 2, r = i % 2 ? 1 : 1.2 + 0.05 * Math.sin(i * 2.3);
      const px = Math.cos(a) * rw * r, py = Math.sin(a) * rh * r;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
  };
  // the tail
  const lx = (tx - x) / s, ly = (ty - y) / s, L = Math.hypot(lx, ly) || 1, ux = lx / L, uy = ly / L;
  ctx.beginPath(); ctx.moveTo(ux * rw * 0.5 - uy * 30, uy * rh * 0.5 + ux * 30); ctx.lineTo(ux * Math.min(L, rw * 1.5), uy * Math.min(L, rw * 1.5)); ctx.lineTo(ux * rw * 0.5 + uy * 30, uy * rh * 0.5 - ux * 30); ctx.closePath();
  ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.lineWidth = 9; ctx.strokeStyle = '#0B0B1A'; ctx.lineJoin = 'round'; ctx.stroke();
  path(); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.lineWidth = 9; ctx.strokeStyle = '#0B0B1A'; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(ux * rw * 0.5 - uy * 24, uy * rh * 0.5 + ux * 24); ctx.lineTo(ux * Math.min(L, rw * 1.5) * 0.9, uy * Math.min(L, rw * 1.5) * 0.9); ctx.lineTo(ux * rw * 0.5 + uy * 24, uy * rh * 0.5 - ux * 24); ctx.closePath(); ctx.fillStyle = '#FFFFFF'; ctx.fill();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const sz = o.size || 62;
  lines.forEach((ln, i) => {
    ctx.font = `400 ${ln[2] || sz}px Anton`; ctx.fillStyle = ln[1] || '#0B0B1A';
    ctx.fillText(ln[0], 0, (i - (lines.length - 1) / 2) * sz * 1.08 + 4);
  });
  ctx.restore();
}

// ---------------------------------------------------------------- the room
// o: {door 0..1 (how far it is open), mom: {...} | null, led (0..1 brightness)}
function denBack(cam, t, o = {}) {
  const c = ctx, M = 240;
  applyCam(cam);
  c.drawImage(DEN_WALL, -M, -M);
  // the LED strip along the top of the wall: slow colour drift
  const hue = denHue(t, 1) % 360, led = o.led === undefined ? 1 : o.led;
  for (let i = 0; i < 12; i++) {
    const x0 = -200 + i * 124, col = `hsl(${(hue + i * 16) % 360}, 95%, 62%)`;
    c.fillStyle = col; c.globalAlpha = 0.9 * led; c.fillRect(x0, 432, 124, 8);
    const gg = c.createLinearGradient(0, 440, 0, 700); gg.addColorStop(0, col); gg.addColorStop(1, 'rgba(0,0,0,0)');
    c.globalAlpha = 0.16 * led; c.fillStyle = gg; c.fillRect(x0, 440, 124, 260);
    gctx.fillStyle = col; gctx.globalAlpha = 0.5 * led; gctx.fillRect(x0, 430, 124, 12);
  }
  c.globalAlpha = 1; gctx.globalAlpha = 1;
  // the clock on the shelf
  rrect(c, 226, 958, 66, 44, 8); c.fillStyle = '#0C0B22'; c.fill();
  c.font = '900 24px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillStyle = '#FF5A6E'; c.fillText(Math.floor(t * 2) % 2 ? '23:58' : '23 58', 259, 981);
  gctx.fillStyle = 'rgba(255,90,110,0.5)'; gctx.fillRect(232, 968, 54, 26);
  // the doorway
  const [dx, dy, dw, dh] = DEN.door, d = clamp(o.door || 0);
  if (d > 0.01) {
    const ow = dw * E.outCubic(d);
    const hg = c.createLinearGradient(dx, 0, dx + dw, 0); hg.addColorStop(0, '#FFD9A0'); hg.addColorStop(1, '#F2A65A');
    c.fillStyle = hg; c.fillRect(dx, dy, ow, dh);
    c.fillStyle = 'rgba(190,110,60,0.5)'; c.fillRect(dx, dy + dh * 0.62, ow, 6);            // the hallway's dado line
    gctx.fillStyle = 'rgba(255,190,110,0.5)'; gctx.fillRect(dx, dy, ow, dh);
    if (o.mom) {
      for (const cc of [c, gctx]) {       // in the glow layer her own shape cuts the bloom out, or it washes through her
        cc.save(); cc.beginPath(); cc.rect(dx - 150, dy - 60, ow + 210, dh + 60); cc.clip();
        if (cc === gctx) cc.globalCompositeOperation = 'destination-out';
        denMom(cc, dx + dw * 0.5 + 4, dy + dh + 40, 1.12, t, o.mom);
        cc.restore();
      }
    }
    // the door leaf, swung against the right jamb
    const lw = dw * (1 - E.outCubic(d)) + 26 * d;
    c.fillStyle = '#232052'; c.beginPath(); c.moveTo(dx + dw, dy); c.lineTo(dx + dw - lw, dy + 14 * d); c.lineTo(dx + dw - lw, dy + dh); c.lineTo(dx + dw, dy + dh); c.closePath(); c.fill();
    // the light it throws across the wall and the floor
    const lg = c.createLinearGradient(dx, 0, dx - 520, 0); lg.addColorStop(0, `rgba(255,190,110,${0.2 * d})`); lg.addColorStop(1, 'rgba(255,190,110,0)');
    c.fillStyle = lg; c.fillRect(dx - 520, dy - 40, 520, dh + 60);
  } else {
    c.fillStyle = '#232052'; c.fillRect(dx, dy, dw, dh);
    c.fillStyle = '#2C2966'; rrect(c, dx + 22, dy + 26, dw - 44, 250, 8); c.fill(); rrect(c, dx + 22, dy + 306, dw - 44, 330, 8); c.fill();
    circle(c, dx + 30, dy + 370, 11, '#C9A24A');
    // a line of light under the door: someone is out there
    c.fillStyle = 'rgba(255,200,120,0.55)'; c.fillRect(dx + 4, dy + dh - 8, dw - 8, 6);
  }
  // his chair (behind him)
  const kx = DEN.hx;
  rrect(c, kx - 150, 660, 300, 560, 70); c.fillStyle = '#17142F'; c.fill();
  rrect(c, kx - 132, 676, 264, 520, 60); c.fillStyle = '#22204A'; c.fill();
  c.fillStyle = '#EF4638'; rrect(c, kx - 132, 700, 22, 440, 10); c.fill(); rrect(c, kx + 110, 700, 22, 440, 10); c.fill();
  rrect(c, kx - 86, 610, 172, 110, 44); c.fillStyle = '#22204A'; c.fill(); c.lineWidth = 6; c.strokeStyle = '#17142F'; c.stroke();
}

// the desk in front of him (drawn after the hero): keyboard, mug, mouse, and the monitor's light
function denDesk(cam, t, o = {}) {
  const c = ctx, M = 240;
  applyCam(cam);
  c.drawImage(DEN_DESK, -M, DEN.deskY);
  gctx.save(); gctx.globalCompositeOperation = 'destination-out'; gctx.fillStyle = '#000'; gctx.fillRect(-M, DEN.deskY, W + 2 * M, 1200); gctx.restore();
  const jump = o.jump || 0;                                  // things hop on the big crack
  // the monitor's light pooling on the desk
  softDot(c, 540, 1420, 620, '#6FD8FF', 0.2 + 0.03 * Math.sin(t * 7.3));
  // keyboard: rows of keys, a rainbow wave
  const kx0 = 250, ky0 = 1262 - 26 * jump, kw = 580, kh = 190;
  c.save(); c.translate(540, ky0 + kh / 2); c.rotate(-0.02 * jump); c.translate(-540, -(ky0 + kh / 2));
  rrect(c, kx0 - 16, ky0 - 14, kw + 32, kh + 28, 22); c.fillStyle = '#0E0C22'; c.fill();
  for (let r = 0; r < 4; r++) for (let i = 0; i < 13; i++) {
    const x = kx0 + 6 + i * 44 + (r % 2) * 10, y = ky0 + 4 + r * 46;
    if (x + 38 > kx0 + kw) continue;
    const hue = (i * 22 + r * 14 - denHue(t, 11) + 3960) % 360;
    rrect(c, x, y, 38, 38, 7); c.fillStyle = '#1B1838'; c.fill();
    c.fillStyle = `hsla(${hue}, 95%, 64%, 0.85)`; rrect(c, x + 5, y + 5, 28, 28, 5); c.fill();
    c.fillStyle = '#16132E'; rrect(c, x + 8, y + 7, 22, 20, 4); c.fill();
  }
  c.restore();
  gctx.fillStyle = `hsla(${(3960 - denHue(t, 11)) % 360}, 95%, 64%, 0.16)`; gctx.fillRect(kx0, ky0, kw, kh);
  // mug (left), with steam
  const mx = 128, my = 1262 - 40 * jump;
  ellipse(c, mx, my + 78, 62, 16, 'rgba(0,0,0,0.35)');
  rrect(c, mx - 50, my - 40, 100, 116, 18); c.fillStyle = '#F4F0E6'; c.fill();
  c.lineWidth = 14; c.strokeStyle = '#F4F0E6'; c.beginPath(); c.arc(mx - 56, my + 16, 26, 1.2, 5.0); c.stroke();
  ellipse(c, mx, my - 36, 44, 12, '#4A2B1C');
  c.fillStyle = '#EF4638'; c.beginPath(); c.arc(mx + 4, my + 22, 20, 0, 7); c.fill();
  for (let i = 0; i < 3; i++) {
    const p = ((t * 0.35 + i / 3) % 1);
    softDot(c, mx - 14 + i * 14 + 12 * Math.sin(p * 6 + i), my - 60 - p * 150, 26 + 30 * p, '#DCE6FF', 0.14 * Math.sin(Math.PI * p));
  }
  // mouse (right)
  const ox = 934, oy = 1330 - 30 * jump;
  ellipse(c, ox, oy + 6, 46, 62, 'rgba(0,0,0,0.35)');
  ellipse(c, ox, oy, 42, 58, '#17142F'); line(c, ox, oy - 54, ox, oy - 14, 3, '#3A3670');
  c.fillStyle = `hsla(${denHue(t, 8) % 360}, 95%, 64%, 0.9)`; rrect(c, ox - 5, oy - 40, 10, 18, 5); c.fill();
}

// ---------------------------------------------------------------- his locked hands
// Locked fingers seen from the front (rig-local units, centre 0,0): his forearms come in from the sides, so the two
// hands point at each other and their fingers lie across one another, stacked from top to bottom, turn about.
// k = how hard he pushes (0..1), wig = fingers still settling (0..1), hot = [0..7] glow per knuckle (a tick just
// fired there). Returns the knuckles' positions (local).
function denClasp(c, pal, t, o = {}) {
  const k = clamp(o.k || 0), wig = o.wig || 0, hot = o.hot || [];
  const sk = pal.skin, sh = pal.skinSh, hi = pal.skinHi, crease = 'rgba(150,86,62,0.62)';
  const sx = 1 - 0.07 * k, sy = 1 + 0.08 * k;
  c.save(); c.scale(sx, sy);
  // the backs of the two hands
  for (const sd of [-1, 1]) {
    c.save(); c.translate(sd * 38, 2); c.rotate(sd * 0.1);
    rrect(c, -30, -38, 60, 78, 26); c.fillStyle = sh; c.fill();
    rrect(c, -27 - sd * 1.5, -37, 55, 72, 24); c.fillStyle = sk; c.fill();
    c.restore();
  }
  // eight fingers, from the two hands turn about, each lying across the back of the other hand
  const kn = [];
  for (let i = 0; i < 8; i++) {
    const sd = i % 2 === 0 ? 1 : -1;                         // +1: a finger of the left-hand side, pointing right
    const y = -31 + i * 8.9 + wig * 3.2 * Math.sin(t * 30 + i * 1.7);
    const x0 = -sd * (13 + 3 * k), x1 = sd * (49 - (i === 0 || i === 7 ? 9 : i === 1 || i === 6 ? 3 : 0)), dy = 2.5 + 1.2 * k;
    const base = sd > 0 ? sk : mixHex(sk, sh, 0.3);
    line(c, x0, y, x1, y + dy, 11.6, sh);
    line(c, x0, y - 0.7, x1, y + dy - 0.7, 8.8, base);
    line(c, x0 + sd * 8, y - 2.6, x0 + sd * 26, y - 1.9 + dy * 0.4, 2.4, rgba(hi, 0.7));
    // the knuckle at the root of the finger, with its crease, and a nail at the tip
    c.beginPath(); c.moveTo(x0 + sd * 3, y - 4.6); c.quadraticCurveTo(x0 + sd * 6.4, y, x0 + sd * 3, y + 4.6); c.lineWidth = 1.9; c.strokeStyle = crease; c.lineCap = 'round'; c.stroke();
    ellipse(c, x1 - sd * 1.5, y + dy - 0.6, 4.2, 3.2, rgba(hi, 0.85));
    kn.push([x0 * sx, y * sy]);
    if (hot[i] > 0.01) { c.save(); c.globalAlpha = clamp(hot[i]); circle(c, x0, y, 7.5, '#FFFFFF'); c.restore(); }
  }
  // thumbs crossed on top
  for (const sd of [-1, 1]) {
    const a2 = [sd * 34, -36], b2 = [-sd * 7, -45 - (sd > 0 ? 5 : 0)];
    line(c, a2[0], a2[1], b2[0], b2[1], 15.5, sh); line(c, a2[0], a2[1] - 1, b2[0], b2[1] - 1, 12, sk);
    ellipse(c, b2[0] - sd * 1, b2[1] - 1.5, 4.4, 3.4, rgba(hi, 0.85));
  }
  c.restore();
  return kn;
}

// ---------------------------------------------------------------- the hero at his desk
function denReach(pose, side, target) {
  const a = ikReach(pose, side, target, 1), b = ikReach(pose, side, target, -1);
  return rig(a)['el' + side][1] >= rig(b)['el' + side][1] ? a : b;
}
// headphones round his neck (rig-local, drawn under the head)
function denPhones(c, r) {
  const n = r.neck;
  c.lineCap = 'round'; c.lineWidth = 15; c.strokeStyle = '#17142F';
  c.beginPath(); c.moveTo(n[0] - 62, n[1] + 18); c.quadraticCurveTo(n[0], n[1] + 56, n[0] + 62, n[1] + 18); c.stroke();
  for (const sd of [-1, 1]) { rrect(c, n[0] + sd * 62 - 19, n[1] - 12, 38, 54, 15); c.fillStyle = '#17142F'; c.fill(); rrect(c, n[0] + sd * 62 - 12, n[1] - 4, 24, 38, 10); c.fillStyle = '#EF4638'; c.fill(); }
}
// o: {face, headDX, headDY, headRot, lean, frizz, up 0..1 (hands locked in front of his chest, else on the desk),
//     flex 0..1, wig, hot[], lift (px, the locked hands rise), apart 0..1 (hands let go), scan: {k} (his right hand up
//     for the x-ray), warm 0..1 (the door's light on him), shrug 0..1}
function denHero(cam, t, o = {}) {
  const s = DEN.hs, pal = DENPAL;
  const st = { x: DEN.hx, y: DEN.hy - (o.jolt || 0) * 12 * s, s, face: o.face || FACES.calm, headDX: o.headDX || 0, headDY: o.headDY || 0, headRot: o.headRot || 0, frizz: o.frizz || 0, noLegs: true };
  let pose = JSON.parse(JSON.stringify(POSES.stand));
  pose.lean = o.lean || 0; pose.hand = 'open';
  const up = clamp(o.up === undefined ? 1 : o.up), flex = clamp(o.flex || 0), apart = clamp(o.apart || 0), shrug = clamp(o.shrug || 0);
  const cy = DEN.clasp[1] - (o.lift || 0) + 8 * flex, cxx = DEN.clasp[0];
  // wrists: at the clasp they sit just outside and below the knot of fingers; pushing flares the elbows
  const wl = [lerp(DEN.restL[0], cxx - 56 + 3 * flex, up), lerp(DEN.restL[1], cy + 8, up) - 26 * Math.sin(Math.PI * up) * (up < 1 ? 1 : 0)];
  const wr = [lerp(DEN.restR[0], cxx + 56 - 3 * flex, up), lerp(DEN.restR[1], cy + 8, up) - 26 * Math.sin(Math.PI * up) * (up < 1 ? 1 : 0)];
  if (apart > 0) { wl[0] -= 74 * apart; wr[0] += 74 * apart; wl[1] -= 30 * Math.sin(Math.PI * apart); wr[1] -= 30 * Math.sin(Math.PI * apart); }
  if (shrug > 0) { wl[0] = lerp(wl[0], -150, shrug); wl[1] = lerp(wl[1], -356, shrug); wr[0] = lerp(wr[0], 132, shrug); wr[1] = lerp(wr[1], -364, shrug); }
  const sc = o.scan ? clamp(o.scan.k) : 0;
  if (sc > 0) { wl[0] = lerp(wl[0], -176, sc); wl[1] = lerp(wl[1], -338, sc); }
  pose = denReach(pose, 'L', wl); pose = denReach(pose, 'R', wr);
  const together = up > 0.92 && apart < 0.05 && shrug < 0.05 && sc < 0.05;
  let knuckles = [];
  // the layer: him, lit by the monitor from the front and below, and by the door from the right
  lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.clearRect(0, 0, W, H);
  camTransform(lctx, cam, 1);
  const stp = Object.assign({}, st, { pose });
  // headphones first (under the head and the arms): draw the body, then the phones, then the head again is not
  // possible with one call, so the phones sit low on the collar where the head never covers them
  const r = drawCharacter(lctx, stp, t, pal);
  lctx.save(); lctx.translate(st.x, st.y); lctx.scale(s, s);
  denPhones(lctx, r);
  if (together) {
    // hide the rig's two round hands under the knot of fingers
    lctx.save(); lctx.translate(cxx, cy);
    knuckles = denClasp(lctx, pal, o.wt === undefined ? t : o.wt, { k: flex, wig: o.wig || 0, hot: o.hot || [] });
    lctx.restore();
  } else if (sc > 0.02) {
    // his raised right hand, fingers spread (the x-ray goes over it)
    const w = r.wrL, d = r.armDirL, hx = w[0] + d[0] * 14, hy = w[1] + d[1] * 14;
    for (let i = -2; i <= 2; i++) {
      const ang = -Math.PI / 2 + i * 0.3 - 0.1;
      line(lctx, hx, hy, hx + Math.cos(ang) * 40, hy + Math.sin(ang) * 40, 12, pal.skinSh);
      line(lctx, hx, hy, hx + Math.cos(ang) * 38, hy + Math.sin(ang) * 38, 8, pal.skin);
    }
    circle(lctx, hx, hy, 22, pal.skinSh); circle(lctx, hx - 2, hy - 2, 19, pal.skin);
  }
  lctx.restore();
  // light
  lctx.setTransform(1, 0, 0, 1, 0, 0);
  lctx.globalCompositeOperation = 'source-atop';
  const hy0 = H / 2 + (DEN.hy - 500 * s - cam.y) * cam.zoom, by0 = H / 2 + (DEN.deskY - cam.y) * cam.zoom;
  const g = lctx.createLinearGradient(0, hy0, 0, by0);
  g.addColorStop(0, 'rgba(26,20,80,0.34)'); g.addColorStop(0.55, 'rgba(40,60,140,0.06)'); g.addColorStop(1, `rgba(110,215,255,${0.2 + 0.03 * Math.sin(t * 7.3)})`);
  lctx.fillStyle = g; lctx.fillRect(0, 0, W, H);
  const warm = clamp(o.warm || 0);
  if (warm > 0.01) {
    const gx = lctx.createLinearGradient(W * 0.35, 0, W, 0); gx.addColorStop(0, 'rgba(255,170,90,0)'); gx.addColorStop(1, `rgba(255,170,90,${0.34 * warm})`);
    lctx.fillStyle = gx; lctx.fillRect(0, 0, W, H);
  }
  lctx.globalCompositeOperation = 'source-over';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(layerC, 0, 0);
  const wp = (p) => toWorld(st, p);
  const hd = [r.head[0] + st.headDX, r.head[1] + st.headDY];
  return { st, r, pose, head: wp(hd), clasp: wp([cxx, cy]), knuckles: knuckles.map((p) => wp([cxx + p[0], cy + p[1]])), handL: wp([r.wrL[0] + r.armDirL[0] * 14, r.wrL[1] + r.armDirL[1] * 14 - 20]), handR: wp(r.wrR), together };
}

// the whole room in drawing order; returns the hero's points
function denScene(cam, t, o = {}) {
  denBack(cam, t, o);
  const h = denHero(cam, t, o.hero || {});
  denDesk(cam, t, o);
  applyCam(cam);
  return h;
}

// a small "crk" beside a knuckle, and a four-point spark on it (screen space). age = seconds since the tick
function denTick(x, y, age, z, seed = 1, word = 'crk') {
  if (age < 0 || age > 0.5) return;
  const k = age / 0.5, r = (26 + 30 * E.outCubic(k)) * z / 2.2;
  for (const [cc, sc] of [[ctx, 1], [gctx, 0.5]]) {
    cc.save(); cc.setTransform(sc, 0, 0, sc, 0, 0); cc.translate(x, y); cc.rotate(0.4 + seed);
    cc.globalAlpha = (1 - k) * (cc === gctx ? 0.6 : 1);
    cc.fillStyle = '#FFF6B8'; cc.beginPath();
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, rr = i % 2 ? r * 0.26 : r; cc.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    cc.closePath(); cc.fill(); cc.restore();
  }
  const dir = seed % 2 ? 1 : -1, wx = x + dir * (50 + 26 * k) * z / 2.2, wy = y - (58 + 44 * E.outCubic(k)) * z / 2.2;
  ctx.save(); ctx.globalAlpha = clamp(2.2 * (1 - k));
  bigWord(word, wx, wy, 50 * z / 2.2, '#FFE680', springStep(age, 7, 0.45), dir * 0.14);
  ctx.restore();
}

// the big one: a jagged burst with CRACK! in it (screen space). age = seconds since the crack
function denCrackWord(x, y, age, size = 1) {
  if (age < 0) return;
  const k = springStep(age, 5.2, 0.38), out = 1 - ramp(age, 0.62, 0.86, E.inCubic);
  if (out <= 0.01) return;
  const s = k * out * size;
  for (const [cc, sc] of [[gctx, 0.5], [ctx, 1]]) {
    cc.save(); cc.setTransform(sc, 0, 0, sc, 0, 0); cc.translate(x, y); cc.rotate(-0.1 + 0.02 * Math.sin(age * 40)); cc.scale(s, s);
    cc.beginPath();
    const n = 14;
    for (let i = 0; i < n * 2; i++) {
      const a = (i / (n * 2)) * Math.PI * 2, r = i % 2 ? 1 : 1.42 + 0.12 * Math.sin(i * 3.1);
      const px = Math.cos(a) * 330 * r, py = Math.sin(a) * 170 * r;
      if (i === 0) cc.moveTo(px, py); else cc.lineTo(px, py);
    }
    cc.closePath();
    if (cc === gctx) { cc.fillStyle = 'rgba(255,214,71,0.5)'; cc.fill(); }
    else { cc.fillStyle = '#FFD447'; cc.fill(); cc.lineWidth = 12; cc.lineJoin = 'round'; cc.strokeStyle = '#0B0B1A'; cc.stroke(); }
    cc.restore();
  }
  bigWord('CRACK!', x, y + 6 * s, 196, '#FF4D3A', s, -0.1, '#0B0B1A');
}
