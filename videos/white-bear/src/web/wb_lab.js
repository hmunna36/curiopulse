// Why Can't You NOT Think of a White Bear? Short: the 1987 study room (after Wegner, Schneider, Carter & White 1987:
// people talked out loud for five minutes while trying NOT to think of a white bear, and rang a bell each time it came back).
// The volunteers and the bench are lemon-mouth-water's (lm_lab.js: lmVol, lmBench); the room is new.
//   initWbLab()          paints the room once: a lilac wall, a window with blinds, a big wall clock, the WHITE BEAR poster
//   wbLabBg(cam, t)      the room plate, the clock's sweeping hand (drawn live), the floor
'use strict';

let WB_LAB_BG = null;
const WB_CLOCK = [770, 610, 84];   // the wall clock: centre and radius (world)

function initWbLab() {
  const c = mkCanvas(1500, 1500), g = c.getContext('2d');
  const wall = g.createLinearGradient(0, 0, 0, 1500);
  wall.addColorStop(0, '#D9D2F2'); wall.addColorStop(0.7, '#BFB4E6'); wall.addColorStop(1, '#A497D4');
  g.fillStyle = wall; g.fillRect(0, 0, 1500, 1500);
  for (let y = 900; y < 1500; y += 46) for (let x = (y / 46) % 2 ? -23 : 0; x < 1500; x += 46) { g.fillStyle = 'rgba(255,255,255,0.16)'; g.fillRect(x + 2, y + 2, 42, 42); }
  // a window with blinds, far left: daylight
  g.fillStyle = '#F4FBFF'; g.fillRect(40, 150, 300, 420);
  const sk = g.createLinearGradient(0, 170, 0, 550); sk.addColorStop(0, '#9FD3F2'); sk.addColorStop(1, '#D8F0FB');
  g.fillStyle = sk; g.fillRect(58, 168, 264, 384);
  for (let y = 176; y < 552; y += 26) { g.fillStyle = 'rgba(255,255,255,0.75)'; g.fillRect(58, y, 264, 13); }
  g.fillStyle = '#E2ECEF'; g.fillRect(40, 570, 300, 22);
  // the poster: a white bear with a red NO sign, THINK ALOUD
  const PX = 980, PY = 190;
  g.fillStyle = '#FFFFFF'; g.fillRect(PX, PY, 300, 400);
  g.fillStyle = '#5B3FA6'; g.fillRect(PX, PY, 300, 70);
  g.font = '900 38px Montserrat'; g.textAlign = 'center'; g.fillStyle = '#FFFFFF'; g.fillText('THINK ALOUD', PX + 150, PY + 50);
  g.fillStyle = '#B8CBF2'; g.beginPath(); g.arc(PX + 150, PY + 230, 112, 0, 7); g.fill();
  wbBear(g, PX + 150, PY + 228, 1.15, 0, { grin: 1 });
  g.lineWidth = 22; g.strokeStyle = '#E8343C'; g.beginPath(); g.arc(PX + 150, PY + 230, 112, 0, 7); g.stroke();
  g.beginPath(); g.moveTo(PX + 71, PY + 151); g.lineTo(PX + 229, PY + 309); g.stroke();
  g.fillStyle = '#5B3FA6'; g.font = '900 30px Montserrat'; g.fillText('5 MINUTES', PX + 150, PY + 385);
  // the clock's face (the hands are live)
  const [CX, CY, CR] = WB_CLOCK;
  g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(CX, CY, CR, 0, 7); g.fill();
  g.lineWidth = 12; g.strokeStyle = '#2A2F4A'; g.stroke();
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; g.fillStyle = '#2A2F4A'; g.fillRect(CX + Math.cos(a) * (CR - 20) - 4, CY + Math.sin(a) * (CR - 20) - 4, 8, 8); }
  // shelves with files on the right
  g.fillStyle = '#8E80C4'; g.fillRect(1300, 640, 200, 14);
  const rng = mulberry32(77);
  for (let x = 1310; x < 1490; x += 34) { const h = 80 + 40 * rng(); g.fillStyle = ['#FF9A3C', '#4DB8FF', '#FFD447', '#4DFFB4'][Math.floor(rng() * 4)]; g.fillRect(x, 640 - h, 26, h); }
  WB_LAB_BG = mkCanvas(1500, 1500);
  const b = WB_LAB_BG.getContext('2d'); b.filter = 'blur(2px)'; b.drawImage(c, 0, 0);
}

// the room; sweep = turns of the clock's long hand so far (it spins through the five minutes)
function wbLabBg(cam, t, sweep = 0) {
  applyCam(cam);
  ctx.drawImage(WB_LAB_BG, -210, 120);
  softDot(gctx, 40, 500, 360, '#E8F6FF', 0.22);
  const [CX, CY, CR] = WB_CLOCK, cx = CX - 210, cy = CY + 120;
  const a = -Math.PI / 2 + sweep * Math.PI * 2;
  paint(() => {
    line(ctx, cx, cy, cx + Math.cos(a / 12 - Math.PI * 0.4) * CR * 0.45, cy + Math.sin(a / 12 - Math.PI * 0.4) * CR * 0.45, 10, '#2A2F4A');
    line(ctx, cx, cy, cx + Math.cos(a) * CR * 0.74, cy + Math.sin(a) * CR * 0.74, 7, '#E8343C');
    circle(ctx, cx, cy, 9, '#2A2F4A');
  });
  const c = ctx, fg = c.createLinearGradient(0, 1290, 0, 1900); fg.addColorStop(0, '#6E6496'); fg.addColorStop(1, '#2E2A48');
  c.fillStyle = fg; c.fillRect(-300, 1290, 1700, 700);
}
