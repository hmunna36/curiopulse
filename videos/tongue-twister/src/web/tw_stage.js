// Can You Say MIT's HARDEST Tongue Twister? 👅 Short: TWISTER NIGHT, a small club stage at night (after voice-recording's
// karaoke stage). World space (1080x1920 at zoom 1): the hero stands centre stage, feet at TWS.fy.
//   twStageBg(cam, t, o)   the back wall, curtains, the TONGUE TWISTERS neon, string lights, the spotlight, the floor;
//                          o: {soft (the far wall out of focus 0..1), flick (neon flicker 0..1), score: {n, cols, k}}
//   twCrowd(t, o)          the audience from behind, heads and shoulders along the bottom (phone lights up)
//   twMic(c, wr, ang)      a hand mic at his wrist (rig space)
//   twScore(x, y, s, n, cols, t)  the SAY IT 5X FAST board: five lamps
//   TWPAL                  his stage shirt
'use strict';

const TWS = { hx: 540, fy: 1500, hs: 1.0 };       // head centre at (540, 1030)
const TWPAL = Object.assign({}, PAL, {               // a teal bowling shirt, sleeves rolled
  coat: '#1E9C9A', coatSh: '#137270', coatHi: '#5ED6CC', coatDk: '#0E5655', strap: '#1E9C9A', strapSh: '#137270',
  pants: '#23263A', pantsSh: '#14162A', shoe: '#F4F1EA', shoeSh: '#B8B2A0', sole: '#8A8576', shortSleeve: true, pj: true,
});
const TW_NEON = { pink: '#FF4D9A', cyan: '#6FF0FF', gold: '#FFD447' };
let TW_WALL = null;                                  // the back wall, painted once

function initStage() {
  const c = mkCanvas(1400, 1300), g = c.getContext('2d');
  // the wall: deep plum, a little lighter at the middle
  const bg = g.createLinearGradient(0, 0, 0, 1300); bg.addColorStop(0, '#120A2A'); bg.addColorStop(0.55, '#2A1046'); bg.addColorStop(1, '#1A0A2C');
  g.fillStyle = bg; g.fillRect(0, 0, 1400, 1300);
  // brick courses, faint
  const rng = mulberry32(91);
  for (let y = 0; y < 1300; y += 34) for (let x = (y / 34) % 2 ? -40 : 0; x < 1400; x += 92) {
    g.fillStyle = `rgba(255,255,255,${0.012 + 0.02 * rng()})`; g.fillRect(x + 3, y + 3, 86, 28);
  }
  // velvet curtains at both sides (folds)
  for (const side of [0, 1]) for (let i = 0; i < 4; i++) {
    const x = side ? 1400 - 90 - i * 70 : i * 70, cg = g.createLinearGradient(x, 0, x + 90, 0);
    cg.addColorStop(0, '#3A0820'); cg.addColorStop(0.5, '#8E1844'); cg.addColorStop(1, '#3A0820');
    g.fillStyle = cg; g.fillRect(x, 0, 90, 1300);
  }
  // a valance across the top
  g.fillStyle = '#5E0E2E'; g.fillRect(0, 0, 1400, 70);
  for (let x = 0; x < 1400; x += 70) { g.beginPath(); g.arc(x + 35, 70, 35, 0, Math.PI); g.fill(); }
  g.fillStyle = 'rgba(255,214,120,0.35)'; for (let x = 0; x < 1400; x += 70) { g.beginPath(); g.arc(x + 35, 98, 5, 0, 7); g.fill(); }
  TW_WALL = c;
}

function twStageBg(cam, t, o = {}) {
  const c = ctx;
  applyCam(cam);
  // the wall plate: x -160..1240, y 300..1600 (drawn as an image: flat, never lit)
  c.drawImage(TW_WALL, -160, 300, 1400, 1300);
  // the neon sign over the stage: TONGUE / TWISTERS, with a small lightning bolt (both layers: it glows)
  const fl = 0.9 + 0.1 * Math.sin(t * 23) * (hash(Math.floor(t * 6)) > 0.75 ? 1 : 0.15) - 0.35 * (o.flick || 0) * (hash(Math.floor(t * 18)) > 0.5 ? 1 : 0);
  for (const [cc, a] of [[gctx, 0.75], [ctx, 1]]) {
    cc.save(); cc.translate(540, 560); cc.rotate(-0.035);
    cc.font = '400 86px Anton'; cc.textAlign = 'center'; cc.textBaseline = 'middle';
    if (cc === ctx) {
      cc.lineWidth = 8; cc.strokeStyle = rgba(TW_NEON.pink, fl); cc.strokeText('TONGUE', -6, -54); cc.fillStyle = rgba('#FFE1EF', fl); cc.fillText('TONGUE', -6, -54);
      cc.font = '400 104px Anton';
      cc.strokeStyle = rgba(TW_NEON.cyan, fl); cc.strokeText('TWISTERS', 0, 46); cc.fillStyle = rgba('#E6FDFF', fl); cc.fillText('TWISTERS', 0, 46);
    } else {
      cc.fillStyle = rgba(TW_NEON.pink, 0.6 * fl * a); cc.fillText('TONGUE', -6, -54);
      cc.font = '400 104px Anton'; cc.fillStyle = rgba(TW_NEON.cyan, 0.6 * fl * a); cc.fillText('TWISTERS', 0, 46);
    }
    cc.restore();
  }
  // a string of bulbs across the wall (it dips at the sides, clear of his head)
  for (let i = 0; i < 15; i++) {
    const u = i / 14, x = -100 + u * 1280, y = 760 - 120 * Math.sin(u * Math.PI) + 40;
    const on = 0.6 + 0.4 * Math.sin(loopW(3.1) * t + i * 1.7), col = [TW_NEON.gold, TW_NEON.cyan, TW_NEON.pink, '#4DFFB4'][i % 4];
    circle(c, x, y, 9, rgba(col, 0.55 + 0.45 * on)); softDot(gctx, x, y, 34, col, 0.45 * on);
  }
  // out-of-focus lights on the far wall round where his head is (never behind it): set, no glow
  for (const [x, y, r, col] of [[420, 868, 34, TW_NEON.pink], [640, 910, 28, TW_NEON.gold], [402, 1236, 40, TW_NEON.cyan], [652, 1262, 30, TW_NEON.pink], [300, 1020, 46, TW_NEON.gold], [790, 1080, 44, TW_NEON.cyan]])
    softDot(c, x, y, r * (1 + 0.06 * Math.sin(loopW(2.2) * t + x)), col, 0.22);
  // the scoreboard on its stand, stage right
  if (o.score) twScore(860, 1150, 1, o.score.n, o.score.cols, t, o.score.k);
  // the stage floor
  const fg = c.createLinearGradient(0, 1480, 0, 1640); fg.addColorStop(0, '#5E3A22'); fg.addColorStop(1, '#25160E');
  c.fillStyle = fg; c.fillRect(-300, 1480, 1700, 170);
  for (let i = 0; i < 14; i++) line(c, -200 + i * 110, 1480, -280 + i * 128, 1650, 2, 'rgba(0,0,0,0.25)');
  c.fillStyle = 'rgba(255,220,160,0.14)'; c.fillRect(-300, 1480, 1700, 5);
  c.fillStyle = '#120A16'; c.fillRect(-300, 1650, 1700, 900);
  // the spotlight: a cone from the top left, a pool on the floor (light, not a shape)
  c.save(); c.globalCompositeOperation = 'lighter';
  const sp = c.createLinearGradient(260, 260, 540, 1500); sp.addColorStop(0, 'rgba(255,240,205,0.26)'); sp.addColorStop(1, 'rgba(255,240,205,0.05)');
  c.fillStyle = sp; c.beginPath(); c.moveTo(196, 230); c.lineTo(300, 230); c.lineTo(820, 1500); c.lineTo(300, 1500); c.closePath(); c.fill();
  c.restore();
  ellipse(c, 540, 1505, 260, 36, 'rgba(255,236,190,0.24)');
  softDot(gctx, 540, 1100, 380, '#FFE6B0', 0.1);
  // two wedge monitors at the stage's lip
  for (const x of [250, 830]) {
    c.beginPath(); c.moveTo(x - 80, 1530); c.lineTo(x + 80, 1530); c.lineTo(x + 62, 1440); c.lineTo(x - 50, 1458); c.closePath(); c.fillStyle = '#17131F'; c.fill();
    circle(c, x + 6, 1490, 26, '#2A2434'); circle(c, x + 6, 1490, 11, '#0E0B14');
  }
}

// the SAY IT 5X FAST board (world space): n lamps lit, cols = their colours
function twScore(x, y, s, n, cols, t, k = 1) {
  const c = ctx;
  if (k <= 0.01) return;
  c.save(); c.translate(x, y); c.scale(s * k, s * k);
  line(c, -50, 120, -70, 330, 10, '#2A2030'); line(c, 50, 120, 70, 330, 10, '#2A2030');   // the easel legs
  rrect(c, -118, -110, 236, 240, 22); c.fillStyle = '#16101E'; c.fill();
  paint(() => {
    rrect(c, -118, -110, 236, 240, 22); c.lineWidth = 6; c.strokeStyle = '#FFD447'; c.stroke();
    c.font = '900 34px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#FFFFFF';
    c.fillText('SAY IT', 0, -66); c.fillStyle = '#FFD447'; c.font = '400 58px Anton'; c.fillText('5X FAST', 0, -14);
    for (let i = 0; i < 5; i++) {
      const lx = -84 + i * 42, on = i < n;
      circle(c, lx, 66, 15, on ? cols[i] : '#3A3046');
      circle(c, lx - 4, 61, 4, on ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.12)');
    }
  });
  c.restore();
  for (let i = 0; i < n; i++) softDot(gctx, x + (-84 + i * 42) * s * k, y + 66 * s * k, 30 * s * k, cols[i], 0.6);
}

// the audience from behind: heads and shoulders along the bottom (world space)
function twCrowd(t, o = {}) {
  const c = ctx, cheer = o.cheer || 0;
  const P = [[90, 1700, 1.25, 0], [300, 1745, 1.4, 1], [560, 1712, 1.3, 0], [800, 1748, 1.42, 1], [1010, 1705, 1.2, 0]];
  P.forEach(([x, y, s, light], i) => {
    const bob = 9 * Math.sin(loopW(2.6) * t + i * 1.7) - 26 * cheer * Math.abs(Math.sin(t * 9 + i));
    c.save(); c.translate(x, y + bob); c.scale(s, s);
    c.fillStyle = '#0B0714';
    c.beginPath(); c.moveTo(-120, 260); c.quadraticCurveTo(-112, 60, -44, 44); c.lineTo(44, 44); c.quadraticCurveTo(112, 60, 120, 260); c.closePath(); c.fill();
    c.beginPath(); c.ellipse(0, -18, 56, 64, 0, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.ellipse(0, -18, 56, 64, 0, Math.PI * 1.15, Math.PI * 1.85); c.lineWidth = 4; c.strokeStyle = 'rgba(255,220,170,0.3)'; c.stroke();
    if (light || cheer > 0.3) {                      // an arm up: a phone light, or a fist when they cheer
      const ax = (i % 2 ? -1 : 1) * 96, ay = -150 + 10 * Math.sin(t * 2.6 + i) - 30 * cheer;
      line(c, ax * 0.9, 80, ax, ay + 40, 30, '#0B0714');
      if (light) { rrect(c, ax - 17, ay - 34, 34, 62, 7); c.fillStyle = '#0B0714'; c.fill(); rrect(c, ax - 12, ay - 28, 24, 50, 4); c.fillStyle = '#DCEBFF'; c.fill(); }
      else circle(c, ax, ay + 20, 26, '#0B0714');
    }
    c.restore();
    if (light) { const ax = x + (i % 2 ? -1 : 1) * 96 * s, ay = y + bob + (-150 + 10 * Math.sin(t * 2.6 + i) - 30 * cheer) * s; softDot(gctx, ax, ay, 70, '#BFD8FF', 0.5); }
  });
}

// a hand mic at his wrist, rig space: the grille points along ang (0 = up)
function twMic(c, wr, ang) {
  c.save(); c.translate(wr[0], wr[1]); c.rotate(ang);
  rrect(c, -9, -30, 18, 70, 7); c.fillStyle = '#1C2030'; c.fill();
  rrect(c, -10, -38, 20, 10, 4); c.fillStyle = '#C9CFE0'; c.fill();
  paint(() => { line(c, -6, 8, -6, 34, 3, 'rgba(255,255,255,0.18)'); circle(c, 0, -2, 3, '#FF4D6A'); });
  circle(c, 0, -56, 21, '#2E3450');
  circle(c, 0, -56, 18.5, '#AEB7CF');
  paint(() => {
    c.save(); c.beginPath(); c.arc(0, -56, 18, 0, 7); c.clip();
    for (let i = -18; i <= 18; i += 6) { line(c, i, -76, i, -36, 1.6, 'rgba(40,46,70,0.55)'); line(c, -20, -56 + i, 20, -56 + i, 1.6, 'rgba(40,46,70,0.55)'); }
    c.restore();
    circle(c, -6, -63, 5, 'rgba(255,255,255,0.75)');
  });
  c.restore();
}
