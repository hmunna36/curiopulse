// head-shake-reading (29 Oct 2026): 1948, a hospital ward. The hiker as the doctor who lost his balance organs to an
// antibiotic (J.C., "Living without a balancing mechanism", 1952): in an iron bed, his head jammed between two bars of
// the headboard so it cannot move, reading. Then his own view of the page, which jumps on every heartbeat.
//   initWard()                      paints the wall once
//   wdRoom(cam, t)                  the ward behind him (wall, tall window, far bed, clock), camera applied after
//   wdBedBack(t), wdBedFront(sq)    the iron headboard behind him, and the two bars that clamp his head (in front)
//   wdHero(cam, t, A)               him in the bed in a hospital gown with a doctor's head mirror (bed.js's rig)
//   wdPage(t, jump, o)              his view of the book (screen space): a page with HOLD STILL that jumps
//   wdOldFilm(t, a)                 scratches, dust, flicker and the gate, as post.overlay
// World units = the frame at zoom 1; the rig sits where bed.js puts it (his head's middle near (540, 1030)).
'use strict';

let WD_WALL = null;
const WDPAL = Object.assign({}, PAL, { coat: '#E9E4D4', coatSh: '#BDB6A0', coatHi: '#FFFDF2', coatDk: '#8E8770', pj: true });
const WD_IRON = '#1E1C22', WD_IRON_HI = '#4A4652', WD_BRASS = '#C9A247';

function wdPaintWall() {
  const cv = mkCanvas(W, H), c = cv.getContext('2d');
  // the upper wall cream, the lower wall a glossy green-grey (a 1940s ward), a dado rail between
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#E8DCC0'); g.addColorStop(0.55, '#E2D4B4'); g.addColorStop(0.551, '#7C8F7E'); g.addColorStop(1, '#5E6F60');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.fillStyle = '#4E5A4C'; c.fillRect(0, H * 0.55 - 8, W, 16);
  // the tall window on the left: daylight, panes, a blind half down
  const WX = 40, WY = 300, WW = 300, WH = 760;
  c.fillStyle = '#F7F0DE'; c.fillRect(WX - 18, WY - 18, WW + 36, WH + 36);
  const sky = c.createLinearGradient(0, WY, 0, WY + WH); sky.addColorStop(0, '#FFF6DE'); sky.addColorStop(1, '#F4E6C0');
  c.fillStyle = sky; c.fillRect(WX, WY, WW, WH);
  c.fillStyle = 'rgba(200,170,120,0.55)'; c.fillRect(WX, WY, WW, WH * 0.32);   // the blind
  c.strokeStyle = '#D9CCAE'; c.lineWidth = 12;
  for (const x of [WX + WW / 2]) { c.beginPath(); c.moveTo(x, WY); c.lineTo(x, WY + WH); c.stroke(); }
  for (const y of [WY + WH * 0.32, WY + WH * 0.66]) { c.beginPath(); c.moveTo(WX, y); c.lineTo(WX + WW, y); c.stroke(); }
  // the light from the window across the wall
  const lg = c.createRadialGradient(WX + WW, WY + WH * 0.5, 40, WX + WW, WY + WH * 0.5, 900);
  lg.addColorStop(0, 'rgba(255,240,200,0.45)'); lg.addColorStop(1, 'rgba(255,240,200,0)');
  c.fillStyle = lg; c.fillRect(0, 0, W, H);
  // a far bed on the right, a patient asleep under a grey blanket (soft: it is far)
  c.fillStyle = '#2A2830'; c.fillRect(800, 900, 10, 260); c.fillRect(1060, 900, 10, 260); c.fillRect(800, 900, 270, 10);
  c.fillStyle = '#F1ECDC'; rrect(c, 790, 1000, 300, 70, 16); c.fill();
  c.fillStyle = '#9A9C94'; rrect(c, 790, 1040, 300, 120, 20); c.fill();
  c.fillStyle = '#D9B898'; c.beginPath(); c.ellipse(860, 1004, 34, 28, 0, 0, 7); c.fill();
  c.filter = 'none';
  return cv;
}
function initWard() { WD_WALL = wdPaintWall(); }
function wdWallCam(cam) {
  return { x: 540 + (cam.x - 540) * 0.35, y: 960 + (cam.y - 1000) * 0.35, zoom: 1 + 0.06 * (cam.zoom - 2), rot: 0, sx: (cam.sx || 0) * 0.2, sy: (cam.sy || 0) * 0.2 };
}
function wdRoom(cam, t) {
  screenSpace(); ctx.fillStyle = '#5E6F60'; ctx.fillRect(0, 0, W, H);
  applyCam(wdWallCam(cam)); ctx.drawImage(WD_WALL, 0, 0);
  softDot(gctx, 190, 680, 260, '#FFF0C8', 0.35);   // the window's glow
  // the wall clock (it says ten past ten)
  applyCam(wdWallCam(cam));
  circle(ctx, 880, 560, 64, '#2A2622'); circle(ctx, 880, 560, 56, '#F6F0E0');
  paint(() => {
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; line(ctx, 880 + Math.cos(a) * 44, 560 + Math.sin(a) * 44, 880 + Math.cos(a) * 52, 560 + Math.sin(a) * 52, 4, '#2A2622'); }
    line(ctx, 880, 560, 880 + Math.cos(-0.5) * 34, 560 + Math.sin(-0.5) * 34, 5, '#2A2622');
    line(ctx, 880, 560, 880 + Math.cos(-2.65) * 26, 560 + Math.sin(-2.65) * 26, 6, '#2A2622');
  });
  applyCam(cam);
}
// the iron headboard behind him: a top rail with brass knobs on the posts, vertical bars
const WD_HB = { x0: 330, x1: 750, y0: 820, y1: 1250, posts: [312, 768] };
function wdBedBack(t) {
  const H0 = WD_HB;
  for (const px of H0.posts) { rrect(ctx, px - 13, H0.y0 - 40, 26, H0.y1 - H0.y0 + 300, 10); ctx.fillStyle = WD_IRON; ctx.fill(); circle(ctx, px, H0.y0 - 50, 22, WD_BRASS); }
  rrect(ctx, H0.posts[0], H0.y0 - 18, H0.posts[1] - H0.posts[0], 22, 10); ctx.fillStyle = WD_IRON; ctx.fill();
  rrect(ctx, H0.posts[0], H0.y1 - 30, H0.posts[1] - H0.posts[0], 18, 8); ctx.fillStyle = WD_IRON; ctx.fill();
  for (let x = 380; x <= 700; x += 64) { if (Math.abs(x - 540) < 80) continue; rrect(ctx, x - 6, H0.y0, 12, H0.y1 - H0.y0, 6); ctx.fillStyle = WD_IRON; ctx.fill(); }
  // the pillow
  rrect(ctx, 380, 1090, 320, 120, 50); ctx.fillStyle = '#F4F0E4'; ctx.fill();
}
// the two bars that clamp his head: in front of his temples. sq = 0..1 how hard they press; head = his head's world point
function wdClampBars(head, sq, t) {
  const hw = 64 * (1 - 0.13 * sq) + 6;
  for (const s of [-1, 1]) {
    const x = head[0] + s * hw;
    const yb = head[1] + 46;   // the bars run down past his ears and stop behind his shoulders
    rrect(ctx, x - 7, WD_HB.y0 - 4, 14, yb - WD_HB.y0 + 4, 7); ctx.fillStyle = WD_IRON; ctx.fill();
    paint(() => line(ctx, x - 2, WD_HB.y0 + 10, x - 2, yb - 8, 3, WD_IRON_HI));
  }
  // squish marks at his cheeks when they press
  if (sq > 0.3) paint(() => { for (const s of [-1, 1]) for (const dy of [-12, 6, 24]) line(ctx, head[0] + s * (hw + 12), head[1] + dy, head[0] + s * (hw + 26), head[1] + dy - 4, 3.5, `rgba(30,24,20,${0.6 * clamp((sq - 0.3) / 0.4)})`); });
}
function wdBlanket() {
  ctx.beginPath(); ctx.moveTo(250, 1260); ctx.quadraticCurveTo(540, 1220, 830, 1260); ctx.lineTo(860, 1720); ctx.lineTo(220, 1720); ctx.closePath();
  ctx.fillStyle = '#8F9488'; ctx.fill();
  rrect(ctx, 240, 1238, 600, 48, 20); ctx.fillStyle = '#F4F0E4'; ctx.fill();   // the turned-down sheet
}
// the book held up in front of his chest (we see its back): world units
function wdBook(x, y, rot, jolt) {
  ctx.save(); ctx.translate(x, y - 14 * jolt); ctx.rotate(rot);
  rrect(ctx, -110, -78, 220, 150, 10); ctx.fillStyle = '#6E2A22'; ctx.fill();
  rrect(ctx, -104, -72, 208, 138, 8); ctx.fillStyle = '#8A382E'; ctx.fill();
  paint(() => {
    ctx.font = '800 26px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#E9C97A';
    ctx.fillText('MEDICINE', 0, -26); line(ctx, -60, -2, 60, -2, 3, '#E9C97A'); ctx.font = '700 18px Montserrat'; ctx.fillText('VOL. II', 0, 22);
  });
  ctx.restore();
}
// him in the bed: A = bed.js's description plus turn (squash), mirror 0..1, book {x, y, rot}, jolt
function wdHero(cam, t, A = {}) {
  const pal = WDPAL, st = bdSt(A);
  const r = charLayer(cam, st, t, {
    pal, ambient: 0.02,
    post: (lc, rr, s2) => {
      // the doctor's head mirror on a band round his forehead
      const T = s2.turn || {}, sq = T.squash || 0;
      const hp = bdHeadLocal(s2, 0, 0);
      lc.save(); lc.translate(s2.x, s2.y); lc.scale(s2.s, s2.s); lc.translate(hp[0], hp[1]); lc.rotate(rr.lean + (s2.headRot || 0)); lc.scale(1 - 0.13 * sq, 1 + 0.05 * sq);
      lc.beginPath(); lc.ellipse(0, -44, 66, 14, 0, Math.PI * 1.02, Math.PI * 1.98); lc.lineWidth = 9; lc.strokeStyle = '#2E2A30'; lc.stroke();
      circle(lc, 0, -60, 24, '#3A3640'); circle(lc, 0, -60, 20, '#D7DEE6');
      paint(() => { circle(lc, 0, -60, 5, '#3A3640'); lc.beginPath(); lc.arc(0, -60, 15, -2.6, -1.6); lc.lineWidth = 3; lc.strokeStyle = 'rgba(255,255,255,0.8)'; lc.stroke(); });
      lc.restore();
    },
  });
  return { st, r, head: bdHeadPt(st, 0, 0) };
}
// his view of the page (screen space): cream paper, a heading, HOLD STILL, his thumbs at the edges. jump = 0..1 (a beat)
function wdPage(t, jump, o = {}) {
  screenSpace();
  const dy = -34 * jump, dx = 10 * jump * Math.sin(t * 50);
  ctx.fillStyle = '#2A2016'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.translate(dx, dy);
  // the open book: two pages, a gutter
  rrect(ctx, 30, 380, 1020, 1260, 24); ctx.fillStyle = '#EFE4C8'; ctx.fill();
  const gg = ctx.createLinearGradient(500, 0, 580, 0); gg.addColorStop(0, 'rgba(120,90,50,0)'); gg.addColorStop(0.5, 'rgba(120,90,50,0.35)'); gg.addColorStop(1, 'rgba(120,90,50,0)');
  ctx.fillStyle = gg; ctx.fillRect(500, 380, 80, 1260);
  paint(() => {
    // small lines of print (grey bars) top and bottom, the big words in the middle
    const rng = mulberry32(11);
    for (const [y0, n] of [[470, 4], [1160, 3]]) for (let i = 0; i < n; i++) for (const [x0, x1] of [[100, 470], [610, 980]]) {
      let x = x0; while (x < x1 - 20) { const w = 30 + rng() * 70; line(ctx, x, y0 + i * 34, Math.min(x1, x + w), y0 + i * 34, 12, 'rgba(70,52,34,0.55)'); x += w + 16; }
    }
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#3A2A1A';
    ctx.font = '800 54px Montserrat'; ctx.fillText('CHAPTER 3', 540, 650);
    ctx.font = '900 150px Montserrat'; ctx.fillText('HOLD', 540, 830); ctx.fillText('STILL.', 540, 990);
  });
  ctx.restore();
  // a ghost of the page a beat behind (the jump smears)
  if (jump > 0.05) {
    ctx.save(); ctx.globalAlpha = 0.3 * jump; ctx.translate(-dx * 0.5, -dy * 1.6);
    ctx.font = '900 150px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#3A2A1A';
    ctx.fillText('HOLD', 540, 830); ctx.fillText('STILL.', 540, 990);
    ctx.restore();
  }
  // his thumbs holding the page down at the bottom corners
  for (const s of [-1, 1]) {
    const x = 540 + s * 430, y = 1500 + dy * 0.6;
    ctx.save(); ctx.translate(x, y); ctx.rotate(s * 0.25);
    rrect(ctx, -40, -30, 80, 220, 38); ctx.fillStyle = '#E3A58A'; ctx.fill();
    paint(() => { rrect(ctx, -26, -18, 52, 50, 20); ctx.fillStyle = 'rgba(255,225,210,0.85)'; ctx.fill(); });
    ctx.restore();
  }
}
// old film over the frame (post.overlay, screen space, after the vignette)
function wdOldFilm(t, a = 1) {
  const f = Math.floor(t * 30), rng = mulberry32(f * 7 + 3);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = `rgba(20,12,4,${0.06 * rng() * a})`; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 2; i++) if (rng() < 0.6) { const x = rng() * W; line(ctx, x, 0, x + (rng() - 0.5) * 20, H, 1 + rng() * 2, `rgba(255,245,220,${0.18 * a})`); }
  for (let i = 0; i < 9; i++) circle(ctx, rng() * W, rng() * H, 1 + rng() * 4, `rgba(${rng() < 0.5 ? '20,14,8' : '255,245,225'},${0.45 * a})`);
  ctx.save(); ctx.fillStyle = `rgba(10,6,2,${0.85 * a})`;
  ctx.beginPath(); ctx.rect(0, 0, W, H);
  const gx = 22, gy = 22, gw = W - 44, gh = H - 44, gr = 60;
  ctx.moveTo(gx + gr, gy); ctx.arcTo(gx + gw, gy, gx + gw, gy + gh, gr); ctx.arcTo(gx + gw, gy + gh, gx, gy + gh, gr);
  ctx.arcTo(gx, gy + gh, gx, gy, gr); ctx.arcTo(gx, gy, gx + gw, gy, gr); ctx.closePath();
  ctx.fill('evenodd'); ctx.restore();
}
