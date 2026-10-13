// Two other places the stars turn up: a study in the 1660s (he is Isaac Newton: a wig, a cravat, a bodkin) and a
// sleeping corner in orbit (he floats in a sleeping bag with an eye mask on, the Earth in a porthole, cosmic rays).
// Both rooms are painted once and drawn far behind him (they move a little with the camera); the hero is desk.js's
// dkHero with another outfit and things drawn before and after him.
'use strict';

let ST_ROOM = null, OR_ROOM = null;
const NEWTPAL = Object.assign({}, PAL, { coat: '#8A3447', coatSh: '#5E1F2E', coatHi: '#B85A70', coatDk: '#3F141E', pj: true });
const ASTROPAL = Object.assign({}, PAL, { coat: '#D9DEEA', coatSh: '#A9B2C8', coatHi: '#FFFFFF', coatDk: '#7C88A6', pj: true });
const WIG = '#E6E1D4', WIG_SH = '#BDB6A6';

// ---------------------------------------------------------------- the study
function stPaintRoom() {
  const cv = mkCanvas(W, H), c = cv.getContext('2d');
  const g = c.createLinearGradient(0, 0, W * 0.4, H);
  g.addColorStop(0, '#4B2D1E'); g.addColorStop(0.6, '#34200F'); g.addColorStop(1, '#1D1108');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  // wood panels
  for (let x = -40; x < W + 200; x += 216) for (let y = 250; y < H; y += 420) {
    rrect(c, x + 14, y + 14, 188, 392, 8); c.fillStyle = 'rgba(255,190,120,0.035)'; c.fill();
    c.lineWidth = 5; c.strokeStyle = 'rgba(14,7,3,0.5)'; c.stroke();
  }
  // a leaded window on the left, night outside
  rrect(c, 36, 360, 264, 540, 130); c.fillStyle = '#2A1A10'; c.fill();
  const wg = c.createLinearGradient(0, 380, 0, 880); wg.addColorStop(0, '#22407E'); wg.addColorStop(1, '#101E48');
  rrect(c, 58, 382, 220, 496, 110); c.fillStyle = wg; c.fill();
  circle(c, 200, 500, 40, '#E6EEFF'); circle(c, 216, 488, 34, '#213D7A');
  c.save(); rrect(c, 58, 382, 220, 496, 110); c.clip();
  c.lineWidth = 5; c.strokeStyle = 'rgba(20,12,6,0.85)';
  for (let i = -6; i < 8; i++) { c.beginPath(); c.moveTo(58 + i * 60, 382); c.lineTo(58 + i * 60 + 300, 878); c.stroke(); c.beginPath(); c.moveTo(278 - i * 60, 382); c.lineTo(278 - i * 60 - 300, 878); c.stroke(); }
  c.restore();
  // shelves of books on the right
  for (const y of [520, 760]) { rrect(c, 770, y, 330, 22, 6); c.fillStyle = '#2A190D'; c.fill(); }
  const cols = ['#6E2F2A', '#2F4E3E', '#6A5522', '#3A3566', '#5A2F4A', '#7A4A22'];
  let bx = 790;
  for (let i = 0; i < 9; i++) { const w = 20 + (i * 7) % 14, h = 120 + (i * 41) % 70; rrect(c, bx, 520 - h, w, h, 3); c.fillStyle = cols[i % cols.length]; c.fill(); bx += w + 4; }
  bx = 800;
  for (let i = 0; i < 8; i++) { const w = 22 + (i * 5) % 14, h = 110 + (i * 29) % 80; rrect(c, bx, 760 - h, w, h, 3); c.fillStyle = cols[(i + 3) % cols.length]; c.fill(); bx += w + 5; }
  return cv;
}
// the room behind him. o: {glow}
function stRoom(cam, t, o = {}) {
  const bc = { x: 540 + (cam.x - 540) * 0.5, y: 960 + (cam.y - 1000) * 0.5, zoom: 1.1 + 0.03 * (cam.zoom - 3.2), rot: 0 };
  screenSpace(); ctx.fillStyle = '#1D1108'; ctx.fillRect(0, 0, W, H);
  applyCam(bc);
  ctx.drawImage(ST_ROOM, 0, 0);
  softDot(gctx, 200, 500, 110, '#9FB8FF', 0.3);
}
// his desk in front of him: papers, an apple, a prism throwing a small rainbow, a candle on the far right (camera applied)
function stDesk(t, o = {}) {
  const y = DK.hy - 176, c = ctx;
  c.fillStyle = '#3A2212'; c.fillRect(-300, y, 1700, 700);
  c.fillStyle = '#56341C'; c.fillRect(-300, y, 1700, 12);
  // the candle
  const fx = 836, fl = 1 + 0.08 * Math.sin(t * 13) + 0.05 * Math.sin(t * 29);
  rrect(c, fx - 30, y - 12, 60, 14, 6); c.fillStyle = '#B08A3A'; c.fill();
  rrect(c, fx - 13, y - 86, 26, 76, 6); c.fillStyle = '#F2E8CE'; c.fill();
  paint(() => { c.beginPath(); c.moveTo(fx, y - 138 * fl); c.quadraticCurveTo(fx + 15, y - 104, fx, y - 86); c.quadraticCurveTo(fx - 15, y - 104, fx, y - 138 * fl); c.fillStyle = '#FFD86A'; c.fill(); });
  softDot(gctx, fx, y - 108, 26, '#FFE6A0', 0.9); softDot(gctx, fx, y - 104, 120, '#FF9A3C', 0.42 * fl);
  // an apple
  circle(c, 300, y - 26, 28, '#C8352E'); circle(c, 322, y - 26, 26, '#C8352E');
  paint(() => { line(c, 311, y - 50, 316, y - 64, 4, '#4A2A14'); ellipse(c, 326, y - 62, 10, 5, '#3F8E4A', -0.5); });
  // papers and a quill
  c.save(); c.translate(640, y + 6); c.rotate(-0.06); rrect(c, -70, -8, 150, 18, 3); c.fillStyle = '#EDE3C8'; c.fill(); c.restore();
}

// Newton, from a description. A: dkHero's, plus {bodkin: {tip: [x, y] rig-local, in: 0..1 (how far its point has gone
// out of sight), drop: 0..1}, wig: false to leave it off}
function newtHero(cam, t, A = {}) {
  const B = A.bodkin;
  return dkHero(cam, t, Object.assign({ pal: NEWTPAL }, A, {
    pre: (lc, st) => dkInHead(lc, st, (c) => actor(() => {   // the wig, behind his head and down to his shoulders
      ellipse(c, 0, -10, 90, 92, WIG_SH);
      for (const sd of [-1, 1]) { ellipse(c, sd * 76, 44, 32, 62, WIG_SH); ellipse(c, sd * 82, 104, 30, 46, WIG_SH); ellipse(c, sd * 72, 150, 26, 34, WIG_SH); }
    })),
    post: (lc, rr, st) => {
      // the cravat
      actor(() => { ellipse(lc, rr.neck[0], rr.neck[1] + 18, 34, 17, '#F4F1EA'); ellipse(lc, rr.neck[0], rr.neck[1] + 44, 25, 24, '#F4F1EA'); });
      paint(() => { line(lc, rr.neck[0], rr.neck[1] + 28, rr.neck[0], rr.neck[1] + 62, 2.4, 'rgba(120,110,90,0.5)'); });
      // the wig over his own hair: a cap with a parting, and a row of curls down each side of his face
      dkInHead(lc, st, (c) => {
        actor(() => {
          c.beginPath(); c.moveTo(-70, 8); c.quadraticCurveTo(-86, -62, -40, -92); c.quadraticCurveTo(0, -112, 40, -92); c.quadraticCurveTo(86, -62, 70, 8);
          c.quadraticCurveTo(64, -26, 34, -40); c.quadraticCurveTo(10, -30, 0, -46); c.quadraticCurveTo(-10, -30, -34, -40); c.quadraticCurveTo(-64, -26, -70, 8); c.closePath();
          c.fillStyle = WIG; c.fill();
          for (const sd of [-1, 1]) for (let i = 0; i < 5; i++) circle(c, sd * (74 + (i % 2) * 7), -18 + i * 36, 22 - (i > 3 ? 3 : 0), WIG);
        });
        paint(() => {
          line(c, 0, -104, 0, -48, 2.6, 'rgba(120,110,90,0.55)');
          for (const sd of [-1, 1]) for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(sd * (74 + (i % 2) * 7), -18 + i * 36, 12, sd > 0 ? -0.6 : 2.2, sd > 0 ? 2.0 : 4.8); c.lineWidth = 2.6; c.strokeStyle = 'rgba(120,110,90,0.55)'; c.stroke(); }
        });
      });
      // the bodkin: a long blunt needle with an eye at its far end, held in his fist
      if (B && A.armL && !(B.drop >= 1)) {
        const F = A.armL.f, T = B.tip, dx = T[0] - F[0], dy = T[1] - F[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, hide = 9 * clamp(B.in || 0), dr = B.drop || 0;
        lc.save(); lc.translate(60 * dr, 420 * dr * dr); lc.rotate(1.6 * dr);
        line(lc, F[0] - ux * 44, F[1] - uy * 44, T[0] - ux * hide, T[1] - uy * hide, 8, '#4A556E');          // a dark edge: it crosses a white wig
        lc.beginPath(); lc.arc(F[0] - ux * 51, F[1] - uy * 51, 7, 0, 7); lc.lineWidth = 7; lc.strokeStyle = '#4A556E'; lc.stroke();
        line(lc, F[0] - ux * 44, F[1] - uy * 44, T[0] - ux * hide, T[1] - uy * hide, 4.6, '#E8EEF8');
        lc.beginPath(); lc.arc(F[0] - ux * 51, F[1] - uy * 51, 7, 0, 7); lc.lineWidth = 3.6; lc.strokeStyle = '#E8EEF8'; lc.stroke();
        lc.restore();
      }
      if (A.post2) A.post2(lc, rr, st);
    },
  }));
}

// what he saw: circles, one inside the other, in a dark round window (screen space). k = the window, n = how many rings are out
function ringVision(x, y, R, k, n, t) {
  if (k <= 0.01) return;
  const r = R * E.outBack(clamp(k), 1.7);
  screenSpace();
  circle(ctx, x, y, r, '#070A1E');
  for (const [cc, w, col] of [[ctx, 0.07 * R, '#EDE3C8'], [gctx, 0.12 * R, 'rgba(255,220,150,0.4)']]) { cc.beginPath(); cc.arc(x, y, r, 0, 7); cc.lineWidth = w; cc.strokeStyle = col; cc.stroke(); }
  const cols = ['#FFFFFF', '#3A2A6E', '#FF5A6E', '#FFD447', '#4DFFB4', '#7FB8FF'];
  paint(() => {
    for (let i = 0; i < cols.length; i++) {
      const kk = clamp(n - i); if (kk <= 0) continue;
      const rr = r * (0.13 + 0.135 * i) * (0.7 + 0.3 * E.outBack(kk, 2)) * (1 + 0.03 * Math.sin(t * 6 + i));
      ctx.beginPath(); ctx.arc(x, y, rr, 0, 7); ctx.lineWidth = r * 0.075; ctx.strokeStyle = rgba(cols[i], kk); ctx.stroke();
      if (i !== 1) { gctx.beginPath(); gctx.arc(x, y, rr, 0, 7); gctx.lineWidth = r * 0.1; gctx.strokeStyle = rgba(cols[i], 0.5 * kk); gctx.stroke(); }
    }
  });
}

// ---------------------------------------------------------------- in orbit
function orPaintRoom() {
  const cv = mkCanvas(W, H), c = cv.getContext('2d');
  const g = c.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#2B3A66'); g.addColorStop(0.55, '#1C2748'); g.addColorStop(1, '#10182E');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  // wall panels with rounded corners, a few with labels and switches
  const rng = mulberry32(31);
  for (let y = 240; y < H; y += 250) for (let x = -30; x < W; x += 280) {
    rrect(c, x + 10, y + 10, 260, 230, 26); c.fillStyle = `rgba(190,210,255,${0.035 + 0.05 * rng()})`; c.fill();
    c.lineWidth = 5; c.strokeStyle = 'rgba(6,10,26,0.55)'; c.stroke();
    if (rng() > 0.55) { rrect(c, x + 40, y + 46, 90, 16, 6); c.fillStyle = 'rgba(255,255,255,0.12)'; c.fill(); for (let i = 0; i < 3; i++) circle(c, x + 60 + i * 34, y + 110, 9, ['#4DFFB4', '#FFD447', '#FF5A6E'][i]); }
  }
  // handrails
  for (const [x, y, w] of [[620, 1310, 330], [80, 1560, 280]]) { rrect(c, x, y, w, 22, 11); c.fillStyle = '#E0B030'; c.fill(); for (const dx of [18, w - 30]) { rrect(c, x + dx, y - 4, 12, 44, 5); c.fillStyle = '#8A6A18'; c.fill(); } }
  // the porthole, upper left: space, and the Earth's edge
  circle(c, 214, 610, 178, '#5A6890'); circle(c, 214, 610, 150, '#03040C');
  c.save(); c.beginPath(); c.arc(214, 610, 150, 0, 7); c.clip();
  for (let i = 0; i < 26; i++) circle(c, 80 + rng() * 280, 470 + rng() * 150, 1.5 + 2 * rng(), 'rgba(255,255,255,0.9)');
  const eg = c.createRadialGradient(170, 1010, 250, 170, 1010, 380); eg.addColorStop(0, '#2B74D8'); eg.addColorStop(0.86, '#3F9BEA'); eg.addColorStop(0.95, '#9FD8FF'); eg.addColorStop(1, 'rgba(160,220,255,0)');
  circle(c, 170, 1010, 380, '#000'); c.fillStyle = eg; c.beginPath(); c.arc(170, 1010, 380, 0, 7); c.fill();
  for (const [x, y, rx, ry, r] of [[150, 700, 70, 16, -0.2], [260, 730, 50, 12, 0.3], [110, 742, 44, 10, 0.1]]) ellipse(c, x, y, rx, ry, 'rgba(255,255,255,0.7)', r);
  c.restore();
  for (let i = 0; i < 8; i++) { const a = (i / 8) * 6.283; circle(c, 214 + Math.cos(a) * 164, 610 + Math.sin(a) * 164, 7, '#2C3658'); }
  return cv;
}
function orRoom(cam, t) {
  const bc = { x: 540 + (cam.x - 540) * 0.5, y: 960 + (cam.y - 900) * 0.5, zoom: 1.08 + 0.035 * (cam.zoom - 2.4), rot: 0 };
  screenSpace(); ctx.fillStyle = '#10182E'; ctx.fillRect(0, 0, W, H);
  applyCam(bc);
  ctx.drawImage(OR_ROOM, 0, 0);
  softDot(gctx, 190, 700, 150, '#5FB0FF', 0.4); softDot(gctx, 214, 610, 300, '#3F8BEA', 0.12);
}
function initPlaces() { ST_ROOM = stPaintRoom(); OR_ROOM = orPaintRoom(); }

// the sleeper: he floats upright in a sleeping bag that is strapped to the wall, arms out in front of him as arms do up
// there, an eye mask on. A: dkHero's, plus {mask: 0..1, bag: false}
function astroHero(cam, t, A = {}) {
  return dkHero(cam, t, Object.assign({ pal: ASTROPAL }, A, {
    pre: (lc, st) => {   // the straps that hold the bag to the wall
      const r = rig(st.pose);
      lc.save(); lc.translate(r.P[0], r.P[1]); lc.rotate(st.pose.lean);
      for (const y of [-70, 110]) { rrect(lc, -230, y - 13, 460, 26, 8); lc.fillStyle = '#5B6686'; lc.fill(); }
      lc.restore();
    },
    post: (lc, rr, st) => {
      lc.save(); lc.translate(rr.P[0], rr.P[1]); lc.rotate(st.pose.lean);
      actor(() => {   // the bag, from his chest down
        lc.beginPath(); lc.moveTo(-104, -128); lc.quadraticCurveTo(0, -150, 104, -128); lc.lineTo(92, 190); lc.quadraticCurveTo(0, 250, -92, 190); lc.closePath();
        lc.fillStyle = '#3E62C8'; lc.fill();
      });
      paint(() => {
        for (const y of [-70, -10, 50, 110, 170]) { lc.beginPath(); lc.moveTo(-100 + (y > 100 ? 6 : 0), y); lc.quadraticCurveTo(0, y + 16, 100 - (y > 100 ? 6 : 0), y); lc.lineWidth = 4; lc.strokeStyle = 'rgba(20,34,96,0.5)'; lc.stroke(); }
        line(lc, 0, -140, 0, 210, 5, 'rgba(230,236,255,0.75)');
        circle(lc, 54, -96, 19, '#F4F1EA'); circle(lc, 54, -96, 14, '#1E2A66'); circle(lc, 54, -96, 5, '#FFD447');   // a mission patch
      });
      for (const y of [-70, 110]) { rrect(lc, -108, y - 13, 216, 26, 8); lc.fillStyle = '#7F8AAE'; lc.fill(); }   // the straps across it
      lc.restore();
      if ((A.mask === undefined ? 1 : A.mask) > 0.5) dkInHead(lc, st, (c) => {   // the eye mask
        line(c, -62, -6, 62, -6, 7, '#18204E');
        actor(() => { c.beginPath(); c.moveTo(-52, -20); c.quadraticCurveTo(-26, -27, 0, -16); c.quadraticCurveTo(26, -27, 52, -20); c.quadraticCurveTo(60, 2, 44, 14); c.quadraticCurveTo(22, 22, 0, 8); c.quadraticCurveTo(-22, 22, -44, 14); c.quadraticCurveTo(-60, 2, -52, -20); c.closePath(); c.fillStyle = '#2B3A8E'; c.fill(); });
        paint(() => { for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(sd * 24 - 11, -3); c.quadraticCurveTo(sd * 24, 5, sd * 24 + 11, -3); c.lineWidth = 3; c.lineCap = 'round'; c.strokeStyle = '#AFC0FF'; c.stroke(); } });
      });
      if (A.post2) A.post2(lc, rr, st);
    },
  }));
}
// a cosmic ray: a thin bright streak that crosses the frame through point P (screen space) at time t0. dir = its
// direction (unit), speed in px/s; it leaves a faint line that fades
function cosmicRay(t, t0, P, dir, col = '#BFF0FF', o = {}) {
  const d = t - t0, sp = o.speed || 5200, len = o.len || 620;
  if (d < -0.25 || d > 0.7) return;
  screenSpace();
  const head = d * sp, x = (s) => P[0] + dir[0] * s, y = (s) => P[1] + dir[1] * s;
  const a0 = clamp(1 - Math.abs(d) / 0.34);
  if (a0 > 0.01) for (const [cc, w, al] of [[ctx, 7, 1], [gctx, 20, 0.6]]) {
    const gr = cc.createLinearGradient(x(head - len), y(head - len), x(head), y(head));
    gr.addColorStop(0, rgba(col, 0)); gr.addColorStop(1, rgba(cc === ctx ? '#FFFFFF' : col, al * a0));
    cc.lineCap = 'round'; cc.lineWidth = w; cc.strokeStyle = gr; cc.beginPath(); cc.moveTo(x(head - len), y(head - len)); cc.lineTo(x(head), y(head)); cc.stroke();
  }
  if (d > 0) { const a1 = 0.3 * clamp(1 - d / 0.7); ctx.setLineDash([14, 16]); line(ctx, x(-1400), y(-1400), x(1400), y(1400), 3, rgba(col, a1)); ctx.setLineDash([]); }
}
