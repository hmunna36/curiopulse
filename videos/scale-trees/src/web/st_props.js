// Props for "The Tree That Wore SNAKESKIN": the burial (a cutaway of the swamp floor sinking under new layers and squashing
// into a coal seam), a steam engine at dusk with its cab and tender, a coal mine in one-point perspective whose roof is
// dotted with the bottoms of fossil stumps (kettlebottoms), the stump itself, his hard hat with a lamp, a counting hand,
// lumps of coal (some still printed with diamonds) and the stars of a bonk.
'use strict';

// ---------------------------------------------------------------- a lump of coal (world units); dia: a diamond print on it
function stLump(c, x, y, s, seed, dia = false, rot = 0) {
  const r = mulberry32(seed);
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.beginPath();
  const n = 7;
  for (let i = 0; i < n; i++) { const a = (i / n) * 6.283, rr = 20 * (0.75 + 0.4 * r()); c.lineTo(Math.cos(a) * rr * 1.2, Math.sin(a) * rr); }
  c.closePath(); c.fillStyle = '#17161C'; c.fill();
  paint(() => {
    line(c, -10, -8, 4, -14, 4, 'rgba(150,160,190,0.55)');
    if (dia) {
      c.lineWidth = 1.6; c.strokeStyle = 'rgba(160,150,110,0.75)';
      for (const [dx, dy] of [[-8, 2], [6, 2], [-1, -8], [-1, 12]]) { c.beginPath(); c.moveTo(dx, dy - 6); c.lineTo(dx + 4, dy); c.lineTo(dx, dy + 6); c.lineTo(dx - 4, dy); c.closePath(); c.stroke(); }
    }
  });
  c.restore();
}

// ================================================================ the burial (screen space): the cutaway
// S: {surf: the surface line (y), peatTop, peatH (its thickness), black 0..1 (peat -> coal), gloss 0..1, layers: [[top, h, col]...],
//     logs flatten with the peat; pour: 0..1 the newest layer still pouring in}
function stCutaway(t, S) {
  screenSpace();
  // the sky over the swamp, a thin band
  const sg = ctx.createLinearGradient(0, 0, 0, S.surf);
  sg.addColorStop(0, '#7FA79A'); sg.addColorStop(1, '#C9D6A0');
  ctx.fillStyle = sg; ctx.fillRect(0, 0, W, S.surf);
  // what is left of the forest on the surface: broken stumps and fallen trunks, half sunk
  for (let i = 0; i < 7; i++) {
    const x = 40 + i * 160 + 40 * Math.sin(i * 3.1), hh = 50 + 80 * hash(i), w = 34 + 26 * hash(i + 9);
    ctx.beginPath(); ctx.moveTo(x - w / 2, S.surf + 4);
    ctx.lineTo(x - w / 2 + 3, S.surf - hh); ctx.lineTo(x - w / 6, S.surf - hh + 14); ctx.lineTo(x + w / 8, S.surf - hh - 10); ctx.lineTo(x + w / 2 - 2, S.surf - hh + 8);
    ctx.lineTo(x + w / 2, S.surf + 4); ctx.closePath(); ctx.fillStyle = i % 2 ? '#4A4A30' : '#3E4028'; ctx.fill();
  }
  for (const [x, w, rot] of [[230, 300, -0.05], [700, 360, 0.04]]) {
    ctx.save(); ctx.translate(x, S.surf + 2); ctx.rotate(rot); rrect(ctx, -w / 2, -22, w, 34, 17); ctx.fillStyle = '#4E4A2E'; ctx.fill(); ctx.restore();
  }
  // the ground in section, bottom up: old rock, the peat (or the coal), then the new layers on top
  const rockTop = S.peatTop + S.peatH;
  const rg = ctx.createLinearGradient(0, rockTop, 0, H);
  rg.addColorStop(0, '#6A5E52'); rg.addColorStop(1, '#3C342E');
  ctx.fillStyle = rg; ctx.fillRect(0, rockTop, W, H - rockTop);
  paint(() => {   // faint bedding lines in the old rock
    for (let k = 0; k < 8; k++) { const y = rockTop + 40 + k * 90; ctx.fillStyle = 'rgba(40,32,26,0.35)'; ctx.fillRect(0, y, W, 6); }
  });
  // the peat: dark brown, with the fallen trunks lying in it; it turns black and glossy as it becomes coal
  const pc = mixH('#4A3220', '#0E0D12', S.black);
  ctx.fillStyle = pc; ctx.fillRect(0, S.peatTop, W, S.peatH);
  paint(() => {
    const sy = S.peatH / 260;
    for (const [lx, ly, len, rot] of [[150, 0.3, 420, 0.04], [560, 0.62, 520, -0.03], [300, 0.82, 380, 0.02], [820, 0.36, 300, -0.05]]) {
      const cy = S.peatTop + S.peatH * ly;
      ctx.save(); ctx.translate(lx + len / 2, cy); ctx.rotate(rot); ctx.scale(1, Math.max(0.12, sy));
      rrect(ctx, -len / 2, -34, len, 68, 34);
      ctx.fillStyle = mixH('#6E5A34', '#1A1820', S.black); ctx.fill();
      // its diamonds, squashed with it
      for (let i = 0; i < len / 26; i++) for (let j = -1; j <= 1; j++) {
        const dx = -len / 2 + 18 + i * 26 + (j % 2 ? 13 : 0), dy = j * 20;
        ctx.beginPath(); ctx.moveTo(dx, dy - 10); ctx.lineTo(dx + 8, dy); ctx.lineTo(dx, dy + 10); ctx.lineTo(dx - 8, dy); ctx.closePath();
        ctx.fillStyle = rgba(mixH('#9A8E5A', '#3A3A48', S.black), 0.85); ctx.fill();
      }
      ctx.restore();
    }
    if (S.gloss > 0) {   // the coal's shine: a highlight sweeping along the seam
      const gx = lerp(-300, W + 300, S.gloss);
      const gg = ctx.createLinearGradient(gx - 160, 0, gx + 160, 0);
      gg.addColorStop(0, 'rgba(180,200,255,0)'); gg.addColorStop(0.5, 'rgba(200,215,255,0.55)'); gg.addColorStop(1, 'rgba(180,200,255,0)');
      ctx.fillStyle = gg; ctx.fillRect(0, S.peatTop, W, S.peatH);
      ctx.fillStyle = 'rgba(160,180,230,0.25)'; ctx.fillRect(0, S.peatTop + 3, W, 3);
    }
  });
  // the new layers (mud, sand, more swamp) stacked between the surface and the peat
  for (const [top, h, col] of S.layers) {
    if (h <= 0) continue;
    ctx.fillStyle = col; ctx.fillRect(0, top, W, h + 1);
    paint(() => { ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(0, top, W, 4); ctx.fillStyle = 'rgba(0,0,0,0.14)'; ctx.fillRect(0, top + h - 5, W, 5); });
  }
  // the water on top: a thin dark band with a bright line
  ctx.fillStyle = '#2C3A2C'; ctx.fillRect(0, S.surf, W, 26);
  paint(() => { ctx.fillStyle = 'rgba(220,235,200,0.55)'; ctx.fillRect(0, S.surf, W, 3); });
  // the edge of the slab: a thin dark frame line where the cut meets the air
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(0, S.surf + 26, W, 3);
}
// big chevrons pushing the layers down (screen space)
function stPushArrows(k, t) {
  if (k <= 0) return;
  screenSpace();
  for (const x of [130, 950]) {
    for (let i = 0; i < 3; i++) {
      const y = 760 + i * 70 + 26 * ((t * 3 + i * 0.33) % 1);
      ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = rgba('#FFFFFF', 0.85 * k * (1 - i * 0.22));
      ctx.beginPath(); ctx.moveTo(x - 40, y - 22); ctx.lineTo(x, y + 18); ctx.lineTo(x + 40, y - 22); ctx.stroke();
    }
  }
}

// ================================================================ the steam engine (world units; the hero stands in its cab)
// a 19th-century engine facing left: boiler, chimney, dome, big driving wheels with rods, the cab (floor y 1500), the tender with
// its heap of coal behind him. o: {wheel: the wheels' turn (radians), fire: 0..1 the firebox flaring, heap: 0..1 how far the
// heap has slid down onto the footplate}
const LOCO = { floor: 1500, cabX0: 230, cabX1: 760, roof: 900, boilerY: 1210, boilerR: 170 };
function stLocoBack(cam, t, o = {}) {
  screenSpace();
  // dusk sky, hills, and the world rushing past (the engine runs left: the scenery runs right)
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#2E3A6A'); g.addColorStop(0.45, '#C8705A'); g.addColorStop(0.62, '#F2B46A'); g.addColorStop(1, '#3A2E2A');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const run = t * 1400;
  const hz = toScreen(cam, cam.x, 1460)[1];
  for (const [p, col, hMax, seed] of [[0.06, '#6A4A6A', 260, 1], [0.15, '#4A3450', 170, 2]]) {
    ctx.beginPath(); ctx.moveTo(0, H);
    for (let i = 0; i <= 40; i++) {
      const xx = i * 30, u = (xx + run * p) * 0.004 + seed * 5;
      ctx.lineTo(xx, hz - hMax * (0.4 + 0.3 * Math.sin(u) + 0.2 * Math.sin(u * 2.7 + 1)) * (0.6 + 0.4 * cam.zoom));
    }
    ctx.lineTo(W, H); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  }
  // telegraph poles flicking past (blurred)
  for (let i = 0; i < 4; i++) {
    const x = ((i * 420 + run * 0.9) % 1700) - 300;
    ctx.fillStyle = 'rgba(40,24,30,0.7)'; ctx.fillRect(x, hz - 520 * cam.zoom, 26, 520 * cam.zoom + 300);
    ctx.fillRect(x - 60, hz - 500 * cam.zoom, 146, 12);
  }
  // the ground under the track, streaking
  applyCam(cam);
  ctx.fillStyle = '#3A2C26'; ctx.fillRect(-3000, 1700, 7000, 900);
  paint(() => { for (let i = 0; i < 26; i++) { const x = ((i * 337 + run * 1.0) % 5200) - 2600; ctx.fillStyle = 'rgba(120,90,70,0.5)'; ctx.fillRect(x, 1720 + (i % 5) * 40, 260, 8); } });
  ctx.fillStyle = '#5A4A42'; ctx.fillRect(-3000, 1690, 7000, 22);   // the rail
}
function stLoco(cam, t, o = {}) {
  applyCam(cam);
  const wr = o.wheel || 0;
  const L = LOCO;
  // the boiler (a long black cylinder with brass bands), the smokebox in front, the chimney, the dome
  rrect(ctx, -1100, L.boilerY - L.boilerR, 1340, L.boilerR * 2, L.boilerR); ctx.fillStyle = '#20222C'; ctx.fill();
  paint(() => {
    for (const x of [-860, -560, -260, 40]) { ctx.fillStyle = '#C8A04A'; ctx.fillRect(x, L.boilerY - L.boilerR + 4, 22, L.boilerR * 2 - 8); }
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(-1080, L.boilerY - L.boilerR + 34, 1300, 18);
  });
  rrect(ctx, -1180, L.boilerY - L.boilerR - 10, 140, L.boilerR * 2 + 20, 30); ctx.fillStyle = '#16171E'; ctx.fill();
  // chimney (tall, flared at the top)
  ctx.beginPath(); ctx.moveTo(-1000, L.boilerY - L.boilerR + 10); ctx.lineTo(-990, 700); ctx.lineTo(-1040, 640); ctx.lineTo(-880, 640); ctx.lineTo(-930, 700); ctx.lineTo(-920, L.boilerY - L.boilerR + 10); ctx.closePath();
  ctx.fillStyle = '#1A1B22'; ctx.fill();
  // the dome (brass)
  ctx.beginPath(); ctx.ellipse(-380, L.boilerY - L.boilerR, 70, 90, 0, Math.PI, 0); ctx.fillStyle = '#B88A3A'; ctx.fill();
  // the frame and the red buffer beam
  ctx.fillStyle = '#3A1E1E'; ctx.fillRect(-1240, L.floor - 40, 2050, 60);
  ctx.fillStyle = '#C23A2E'; ctx.fillRect(-1260, L.floor - 70, 90, 90);
  // the wheels: two big drivers with spokes and a coupling rod, a small leading wheel
  const wheels = [[-820, 120], [-380, 200], [60, 200]];
  for (const [wx, R] of wheels) {
    const wy = 1690 - R;
    circle(ctx, wx, wy, R, '#1A1A20');
    paint(() => {
      circle(ctx, wx, wy, R - 18, '#8A2A26');
      for (let k = 0; k < 10; k++) { const a = wr + k * Math.PI / 5; line(ctx, wx, wy, wx + Math.cos(a) * (R - 20), wy + Math.sin(a) * (R - 20), 10, '#5E1E1C'); }
      circle(ctx, wx, wy, 26, '#C8A04A');
    });
  }
  // the coupling rod between the two drivers, going round with the cranks
  const ca = [Math.cos(wr) * 70, Math.sin(wr) * 70];
  line(ctx, -380 + ca[0], 1490 + ca[1], 60 + ca[0], 1490 + ca[1], 26, '#9AA0AA');
  // the cab: a wall to the front (with the firebox door), a roof on posts, the side open (we look in)
  ctx.fillStyle = '#2A2C36'; ctx.fillRect(L.cabX0 - 30, L.roof, 60, L.floor - L.roof);                      // front wall edge
  rrect(ctx, L.cabX0 - 60, L.roof - 40, L.cabX1 - L.cabX0 + 120, 56, 20); ctx.fillStyle = '#1E2028'; ctx.fill();   // the roof
  ctx.fillStyle = '#2A2C36'; ctx.fillRect(L.cabX1 - 10, L.roof, 34, L.floor - L.roof);                      // the back post
  ctx.fillStyle = '#3A2A22'; ctx.fillRect(L.cabX0 - 40, L.floor, L.cabX1 - L.cabX0 + 80, 40);               // the footplate
  // the firebox door on the front wall, glowing (light: also the glow layer)
  const fire = o.fire || 0;
  const fx = L.cabX0 + 40, fy = L.floor - 330;
  rrect(ctx, fx - 10, fy - 10, 130, 120, 14); ctx.fillStyle = '#30262A'; ctx.fill();
  const flick = 0.85 + 0.15 * Math.sin(t * 23) * Math.sin(t * 7.1);
  rrect(ctx, fx + 8, fy + 8, 94, 84, 10); ctx.fillStyle = mixH('#FF8A2A', '#FFE08A', 0.4 * fire); ctx.fill();
  softDot(gctx, fx + 55, fy + 50, 150 + 160 * fire, '#FF9A3C', 0.75 * flick + 0.3 * fire);
  softDot(gctx, fx + 55, fy + 50, 60 + 40 * fire, '#FFE6A8', 0.9);
  if (fire > 0.02) {   // a burst of flame out of the door
    paint(() => {
      for (let i = 0; i < 6; i++) {
        const a = -0.9 + i * 0.35, rr = (60 + 90 * hash(i + Math.floor(t * 20))) * fire;
        softDot(ctx, fx + 110 + Math.cos(a) * rr * 0.6, fy + 40 + Math.sin(a) * rr * 0.5, 40 * fire + 10, '#FFB04A', 0.8);
      }
    });
    softDot(gctx, fx + 140, fy + 40, 220 * fire, '#FFB04A', 0.9 * fire);
  }
  // pipes and gauges on the front wall
  paint(() => {
    line(ctx, L.cabX0 + 10, L.roof + 60, L.cabX0 + 10, fy - 30, 10, '#B88A3A');
    circle(ctx, L.cabX0 + 70, L.roof + 120, 30, '#E8E0C8'); circle(ctx, L.cabX0 + 70, L.roof + 120, 24, '#F6F0DC');
    line(ctx, L.cabX0 + 70, L.roof + 120, L.cabX0 + 70 + 18 * Math.cos(-2 + 0.3 * Math.sin(t * 3)), L.roof + 120 + 18 * Math.sin(-2 + 0.3 * Math.sin(t * 3)), 4, '#2A2A2A');
  });
}
// the tender behind the cab, its heap of coal (drawn before the hero) and the heap that slides onto him (drawn after him)
function stTender(cam, t, o = {}) {
  applyCam(cam);
  const L = LOCO;
  rrect(ctx, L.cabX1 + 40, 1150, 760, L.floor - 1150 + 30, 20); ctx.fillStyle = '#23252E'; ctx.fill();
  paint(() => { ctx.fillStyle = '#C8A04A'; ctx.fillRect(L.cabX1 + 40, 1180, 760, 10); });
  for (const wx of [L.cabX1 + 200, L.cabX1 + 620]) {
    circle(ctx, wx, 1600, 90, '#1A1A20');
    paint(() => { circle(ctx, wx, 1600, 72, '#8A2A26'); circle(ctx, wx, 1600, 18, '#C8A04A'); });
  }
  // the heap, above the tender's rim
  const r = mulberry32(88);
  ctx.beginPath(); ctx.moveTo(L.cabX1 + 40, 1160);
  for (let i = 0; i <= 12; i++) ctx.lineTo(L.cabX1 + 40 + i * 63, 1160 - 140 * Math.sin(Math.PI * (i / 12)) * (1 - 0.6 * (o.heap || 0)) - 20 * r());
  ctx.lineTo(L.cabX1 + 800, 1160); ctx.closePath(); ctx.fillStyle = '#15141A'; ctx.fill();
  paint(() => { const rr = mulberry32(9); for (let i = 0; i < 40; i++) circle(ctx, L.cabX1 + 70 + 700 * rr(), 1150 - 100 * rr() * (1 - 0.6 * (o.heap || 0)), 6 + 8 * rr(), i % 4 ? 'rgba(90,96,120,0.5)' : 'rgba(170,180,210,0.5)'); });
}
// the avalanche: lumps pouring off the tender onto him (k 0..1), and the heap he ends up in (to his neck)
function stAvalanche(cam, t, k, heroX) {
  if (k <= 0) return;
  applyCam(cam);
  const r = mulberry32(31);
  for (let i = 0; i < 46; i++) {
    const d = r() * 0.5, kk = clamp((k - d) / 0.5);
    if (kk <= 0) continue;
    const x0 = LOCO.cabX1 + 60 + 300 * r(), y0 = 1060 - 60 * r();
    const x1 = heroX - 180 + 360 * r(), y1 = LOCO.floor - 30 - 380 * Math.pow(r(), 0.7);
    const x = lerp(x0, x1, kk), y = lerp(y0, y1, kk) - 160 * Math.sin(Math.PI * kk);
    stLump(ctx, x, y, 1.3 + r(), 100 + i, i % 9 === 0, kk * 4);
  }
  // the heap settles (a mound to his neck)
  const hk = clamp((k - 0.55) / 0.45);
  if (hk > 0) {
    ctx.beginPath(); ctx.moveTo(heroX - 330, LOCO.floor + 10);
    ctx.quadraticCurveTo(heroX - 200, LOCO.floor - 330 * hk, heroX, LOCO.floor - 400 * hk);
    ctx.quadraticCurveTo(heroX + 230, LOCO.floor - 360 * hk, heroX + 340, LOCO.floor + 10); ctx.closePath();
    ctx.fillStyle = '#141318'; ctx.fill();
    paint(() => { const rr = mulberry32(12); for (let i = 0; i < 30; i++) circle(ctx, heroX - 260 + 520 * rr(), LOCO.floor - 340 * hk * rr(), 7 + 9 * rr(), i % 3 ? 'rgba(90,96,120,0.55)' : 'rgba(170,180,210,0.5)'); });
  }
}
// smoke from the chimney, trailing back (world units)
function stSmoke(cam, t) {
  applyCam(cam);
  for (let i = 0; i < 14; i++) {
    const age = ((t * 1.6 + i / 14) % 1), x = -960 + age * 1800, y = 620 - age * 520 - 60 * Math.sin(i);
    softDot(ctx, x, y, 90 + 260 * age, '#D8D0D8', 0.55 * (1 - age));
  }
}

// ================================================================ the coal mine (one-point perspective)
// Tunnel units: X across (-560..560), Y up from the floor (0..720), Z into the tunnel (0 = where he stands). The camera sits behind him;
// MC: {cy: the screen y of eye level (tilting up moves it down), f}
const MINE = { w: 560, h: 720, eye: 330, z0: 900, f: 1040 };
function minePt(X, Y, Z, MC) {
  const d = Math.max(60, Z + MINE.z0);
  return [540 + (MC.cx || 0) + MINE.f * X / d, MC.cy - MINE.f * (Y - MINE.eye) / d];
}
// the stumps in the roof: [X, Z, R]
const MINE_STUMPS = [[-150, 60, 120], [260, 520, 130], [-280, 1100, 140], [180, 1700, 130], [-120, 2500, 150], [300, 3300, 140], [-260, 4200, 150]];
function stMine(t, MC, o = {}) {
  screenSpace();
  ctx.fillStyle = '#2E2E36'; ctx.fillRect(0, 0, W, H);
  const far = 6200;
  const P = (X, Y, Z) => minePt(X, Y, Z, MC);
  const quad = (a, b, c2, d, col) => { ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.lineTo(...c2); ctx.lineTo(...d); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); };
  const zn = -860;
  // the roof (grey shale), the walls (black coal with a glossy seam), the floor
  quad(P(-MINE.w, MINE.h, zn), P(MINE.w, MINE.h, zn), P(MINE.w, MINE.h, far), P(-MINE.w, MINE.h, far), '#3A3A40');
  quad(P(-MINE.w, 0, zn), P(-MINE.w, MINE.h, zn), P(-MINE.w, MINE.h, far), P(-MINE.w, 0, far), '#121218');
  quad(P(MINE.w, 0, zn), P(MINE.w, MINE.h, zn), P(MINE.w, MINE.h, far), P(MINE.w, 0, far), '#101016');
  quad(P(-MINE.w, 0, zn), P(MINE.w, 0, zn), P(MINE.w, 0, far), P(-MINE.w, 0, far), '#2A2622');
  // the far end: darkness
  quad(P(-MINE.w, 0, far), P(MINE.w, 0, far), P(MINE.w, MINE.h, far), P(-MINE.w, MINE.h, far), '#050507');
  paint(() => {
    // the coal's shine on the walls: streaks along the tunnel
    for (const [X, Y] of [[-MINE.w, 420], [-MINE.w, 250], [MINE.w, 380], [MINE.w, 200]]) {
      const a = P(X, Y, zn), b = P(X, Y, far);
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(120,140,200,0.28)'; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke();
    }
    // the roof's bedding lines across
    for (let Z = -600; Z < far; Z += 380) { const a = P(-MINE.w, MINE.h, Z), b = P(MINE.w, MINE.h, Z); line(ctx, a[0], a[1], b[0], b[1], 2, 'rgba(20,20,26,0.5)'); }
    // the rails on the floor
    for (const X of [-200, 200]) { const a = P(X, 0, zn), b = P(X, 0, far); line(ctx, a[0], a[1], b[0], b[1], 6, 'rgba(140,130,120,0.6)'); }
  });
  // timber props: a post each side and a cap across, every 900 units
  for (let Z = 4800; Z >= -400; Z -= 900) {
    const dk = clamp(1 - Z / 5200);
    const col = mixH('#0A0806', '#6A4A2E', dk * 0.9);
    const a = P(-MINE.w + 30, 0, Z), b = P(-MINE.w + 30, MINE.h, Z), c2 = P(MINE.w - 30, 0, Z), d = P(MINE.w - 30, MINE.h, Z);
    const wpx = Math.max(4, 60 * MINE.f / (Z + MINE.z0));
    line(ctx, a[0], a[1], b[0], b[1], wpx, col); line(ctx, c2[0], c2[1], d[0], d[1], wpx, col);
    const e1 = P(-MINE.w, MINE.h - 20, Z), e2 = P(MINE.w, MINE.h - 20, Z);
    line(ctx, e1[0], e1[1], e2[0], e2[1], wpx * 0.9, col);
  }
  // the stumps in the roof: round bottoms (ellipses: discs seen from below) ringed with bark, roots spreading
  MINE_STUMPS.forEach(([X, Z, R], i) => {
    if (o.skip === i) return;
    stRoofStump(X, Z, R, MC, i, o.lit ? o.lit(i) : 0, o.wiggle && o.wiggle.i === i ? o.wiggle.k : 0);
  });
}
function stRoofStump(X, Z, R, MC, i, lit, wig) {
  const c0 = minePt(X, MINE.h, Z, MC), cx1 = minePt(X + R, MINE.h, Z, MC), cz1 = minePt(X, MINE.h, Z + R, MC), cz0 = minePt(X, MINE.h, Z - R, MC);
  const rx = Math.abs(cx1[0] - c0[0]), ry = Math.abs(cz0[1] - cz1[1]) / 2, cy = (cz0[1] + cz1[1]) / 2;
  const jx = wig ? 3 * Math.sin(wig * 60) : 0;
  // the roots, spreading over the roof
  paint(() => {
    for (let k = 0; k < 7; k++) {
      const a = k / 7 * 6.283 + i;
      const p0 = minePt(X + Math.cos(a) * R, MINE.h, Z + Math.sin(a) * R, MC), p1 = minePt(X + Math.cos(a) * R * 2.6, MINE.h, Z + Math.sin(a) * R * 2.6, MC);
      line(ctx, p0[0] + jx, p0[1], p1[0] + jx, p1[1], Math.max(1.5, rx * 0.12), 'rgba(28,26,22,0.8)');
    }
  });
  // the stump's bottom: a darker sandstone disc with a bark rim printed with diamonds
  ellipse(ctx, c0[0] + jx, cy, rx * 1.08, ry * 1.08, '#4A4236');
  ellipse(ctx, c0[0] + jx, cy, rx * 0.86, ry * 0.86, mixH('#6E6452', '#E8D49A', 0.55 * lit));
  paint(() => {
    for (let k = 0; k < 18; k++) {
      const a = k / 18 * 6.283, px = c0[0] + jx + Math.cos(a) * rx * 0.97, py = cy + Math.sin(a) * ry * 0.97, s2 = Math.max(1.5, rx * 0.07);
      ctx.beginPath(); ctx.moveTo(px, py - s2 * 1.4 * (ry / rx)); ctx.lineTo(px + s2, py); ctx.lineTo(px, py + s2 * 1.4 * (ry / rx)); ctx.lineTo(px - s2, py); ctx.closePath();
      ctx.fillStyle = 'rgba(150,140,100,0.8)'; ctx.fill();
    }
    ellipse(ctx, c0[0] + jx - rx * 0.2, cy - ry * 0.25, rx * 0.35, ry * 0.25, 'rgba(255,255,255,0.08)');
  });
  if (lit > 0) softDot(gctx, c0[0] + jx, cy, rx * 1.6, '#FFD890', 0.5 * lit);
}
// the falling stump (screen units): a bell-shaped rock column printed with bark diamonds; x, y = its bottom centre; s = px per unit
function stFallingStump(c, x, y, s, rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  const h = 280, r0 = 120, r1 = 96;
  c.beginPath(); c.moveTo(-r0, 0); c.quadraticCurveTo(-r0 * 1.06, -h * 0.4, -r1, -h); c.lineTo(r1, -h); c.quadraticCurveTo(r0 * 1.06, -h * 0.4, r0, 0);
  c.ellipse(0, 0, r0, 26, 0, 0, Math.PI); c.closePath();
  c.fillStyle = '#5E564A'; c.fill();
  paint(() => {
    for (let row = 1; row < 9; row++) {
      const y = -row * 30, rr = lerp(r0, r1, row / 9);
      for (let k = -3; k <= 3; k++) {
        const a = (k + (row % 2) * 0.5) * 0.42, cs = Math.cos(a);
        if (cs < 0.2) continue;
        const cx = Math.sin(a) * rr;
        c.beginPath(); c.moveTo(cx, y - 15); c.lineTo(cx + 11 * cs, y); c.lineTo(cx, y + 15); c.lineTo(cx - 11 * cs, y); c.closePath();
        c.fillStyle = 'rgba(150,140,104,0.85)'; c.fill();
        c.beginPath(); c.moveTo(cx, y - 7); c.lineTo(cx + 4 * cs, y - 3); c.lineTo(cx, y + 1); c.lineTo(cx - 4 * cs, y - 3); c.closePath();
        c.fillStyle = 'rgba(60,54,40,0.85)'; c.fill();
      }
    }
    // shade toward its edges (a round column)
    const g = c.createLinearGradient(-r0, 0, r0, 0);
    g.addColorStop(0, 'rgba(10,10,12,0.5)'); g.addColorStop(0.3, 'rgba(10,10,12,0)'); g.addColorStop(0.75, 'rgba(10,10,12,0)'); g.addColorStop(1, 'rgba(10,10,12,0.55)');
    c.fillStyle = g; c.fillRect(-r0 * 1.1, -h, r0 * 2.2, h + 26);
    ellipse(c, 0, -h, r1, 18, 'rgba(40,36,30,0.9)');   // the broken top
  });
  c.restore();
}
// dust trickling from the roof (screen units)
function stDust(x, y, k, t) {
  if (k <= 0) return;
  screenSpace();
  for (let i = 0; i < 14; i++) {
    const ph = (t * 1.7 + i / 14) % 1;
    circle(ctx, x + 60 * (hash(i) - 0.5) + 6 * Math.sin(t * 9 + i), y + ph * 260, 3 + 2 * hash(i + 3), rgba('#B8AC94', 0.8 * k * (1 - ph)));
  }
}

// ---------------------------------------------------------------- his hard hat with a lamp (in his layer's post: head units)
function stHardHat(lc, rr, st, A) {
  const [hx, hy] = rr.head;
  lc.save(); lc.translate(hx + (st.headDX || 0), hy + (st.headDY || 0)); lc.rotate(rr.lean + (st.headRot || 0) + (A.hatTilt || 0));
  const dent = A.dent || 0;
  // the shell and the brim
  lc.beginPath(); lc.moveTo(-70, -30); lc.quadraticCurveTo(-72, -104 + dent * 26, 0, -112 + dent * 30); lc.quadraticCurveTo(72, -104 + dent * 10, 70, -30); lc.closePath();
  lc.fillStyle = '#F2C230'; lc.fill();
  rrect(lc, -86, -38, 172, 20, 10); lc.fillStyle = '#D8A420'; lc.fill();
  paint(() => { line(lc, 0, -108 + dent * 28, 0, -40, 8, 'rgba(200,150,20,0.8)'); });
  // the lamp on the front
  rrect(lc, -22, -84, 44, 34, 10); lc.fillStyle = '#3A3A44'; lc.fill();
  paint(() => { circle(lc, 0, -67, 13, '#FFF2C0'); });
  lc.restore();
}
// the lamp's beam (glow layer, screen space): from p toward angle a
function stBeam(p, a, len, k) {
  if (k <= 0) return;
  screenSpace();
  for (const [w, al] of [[0.34, 0.07], [0.2, 0.1], [0.1, 0.14]]) {
    gctx.beginPath(); gctx.moveTo(p[0], p[1]);
    gctx.lineTo(p[0] + Math.cos(a - w) * len, p[1] + Math.sin(a - w) * len); gctx.lineTo(p[0] + Math.cos(a + w) * len, p[1] + Math.sin(a + w) * len); gctx.closePath();
    gctx.fillStyle = rgba('#FFE6A0', al * k); gctx.fill();
    ctx.beginPath(); ctx.moveTo(p[0], p[1]);
    ctx.lineTo(p[0] + Math.cos(a - w) * len, p[1] + Math.sin(a - w) * len); ctx.lineTo(p[0] + Math.cos(a + w) * len, p[1] + Math.sin(a + w) * len); ctx.closePath();
    ctx.fillStyle = rgba('#FFE6A0', al * 0.3 * k); ctx.fill();
  }
  softDot(gctx, p[0], p[1], 40, '#FFF6D0', 0.9 * k);
}
// stars round a bonked head (screen units)
function stStars(x, y, k, t, s = 1) {
  if (k <= 0) return;
  screenSpace();
  for (let i = 0; i < 4; i++) {
    const a = t * 5 + i * Math.PI / 2, px = x + Math.cos(a) * 120 * s, py = y + Math.sin(a) * 34 * s;
    ctx.save(); ctx.translate(px, py); ctx.scale(k * s, k * s);
    ctx.beginPath();
    for (let j = 0; j < 10; j++) { const rr = j % 2 ? 9 : 22, b = j * Math.PI / 5 - Math.PI / 2; ctx.lineTo(Math.cos(b) * rr, Math.sin(b) * rr); }
    ctx.closePath(); ctx.fillStyle = '#FFD447'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#7A4A0A'; ctx.stroke();
    ctx.restore();
  }
}
// a comic burst with a word (screen units)
function stBurst(word, x, y, k, col = '#FFD447', size = 92) {
  if (k <= 0) return;
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.12); const s = lerp(0.5, 1, E.outBack(clamp(k))); ctx.scale(s, s);
  ctx.beginPath();
  for (let j = 0; j < 24; j++) { const rr = j % 2 ? 0.62 : 1, b = j * Math.PI / 12; ctx.lineTo(Math.cos(b) * rr * size * 2.1, Math.sin(b) * rr * size * 1.3); }
  ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = '#0B0B1A'; ctx.stroke();
  ctx.font = `400 ${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = 10; ctx.strokeStyle = '#0B0B1A'; ctx.strokeText(word, 0, 6); ctx.fillStyle = '#FFFFFF'; ctx.fillText(word, 0, 6);
  ctx.restore();
}
// a hand counting on its fingers (head units, at a wrist): n raised fingers (1..4), d = the forearm's direction
function stCountHand(c, wr, d, n, pal) {
  const hx = wr[0] + d[0] * 12, hy = wr[1] + d[1] * 12;
  const up = Math.atan2(d[1], d[0]);
  for (let i = 0; i < n; i++) {
    const a = up + (i - (n - 1) / 2) * 0.26;
    line(c, hx, hy, hx + Math.cos(a) * 46, hy + Math.sin(a) * 46, 13, pal.skinSh);
    line(c, hx, hy, hx + Math.cos(a) * 44, hy + Math.sin(a) * 44, 9, pal.skin);
  }
  circle(c, hx, hy, 22, pal.skin);
  paint(() => { line(c, hx - 12, hy + 8, hx + 12, hy + 8, 2.5, pal.skinSh); });
}
