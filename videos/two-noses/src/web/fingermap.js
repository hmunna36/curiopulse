// Why Do You Feel TWO Noses? Short: inside his head. The brain's room (dominant-eye's purple room with its web of
// neurons, and time-flies' brain via blind-spot's erBrain), in ROOM space (a 1080x1920 frame) under a view V = {s, x, y}
// (screen = V.x + room * V.s), so it can sit small in a round window on his forehead and then fill the frame.
//   fmView(V)              point ctx/gctx at room space
//   fmRoom(t)              the wall: a dark purple with a faint web of neurons (lights on clocks that loop)
//   fmDesk(y, t)           the desk with its blinking lamps
//   fmScreen(t, o)         the screen on the wall: YOUR FINGERS, the hand as the brain believes it is (see below)
//   erBrain(c, x, y, s, t, o)  the brain with a face and two arms (o: mood, look, armL, armR, shut, bob, lean, still)
// fmScreen o: {cross 0..1 (the drawing of the fingers crosses: the brain has learned), edges 0..1, balls 0..1 (two
//   marbles touch the two outside edges), noses 0..1 (two noses instead of marbles), count 0..1 (2 THINGS), on 0..1,
//   flash, badges 0..1, dim}
'use strict';

const FM = { SCR: [110, 470, 860, 640], BX: 540, BY: 1288, BS: 1.0 };   // the screen (x, y, w, h) and the brain, room space
// the drawing on the screen: two fingers rising from a palm, side by side (middle left, index right, as on his hand)
const FMH = { cx: 540, base: 980, len: 300, w: 92, gap: 112 };

function fmView(V) {
  ctx.setTransform(V.s, 0, 0, V.s, V.x, V.y);
  gctx.setTransform(V.s * 0.5, 0, 0, V.s * 0.5, V.x * 0.5, V.y * 0.5);
}

function fmRoom(t) {
  const g = ctx.createLinearGradient(0, 0, 0, 1920);
  g.addColorStop(0, '#2B1440'); g.addColorStop(0.55, '#3E1F58'); g.addColorStop(1, '#0D0616');
  ctx.fillStyle = g; ctx.fillRect(-300, -300, 1680, 2520);
  const rng = mulberry32(9);
  const pts = [...Array(18)].map(() => [rng() * 1080, 120 + rng() * 1200]);
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
    const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]);
    if (d < 300) line(ctx, pts[i][0], pts[i][1], pts[j][0], pts[j][1], 2.5, `rgba(255,150,210,${0.10 + 0.05 * Math.sin(t * loopW(2) + i + j)})`);
  }
  pts.forEach((p, i) => { circle(ctx, p[0], p[1], 6, 'rgba(255,170,220,0.22)'); softDot(gctx, p[0], p[1], 34, '#FF86C8', 0.16 + 0.12 * Math.sin(t * loopW(3) + i * 1.7)); });
}
function fmDesk(y, t) {
  const g = ctx.createLinearGradient(0, y, 0, y + 420);
  g.addColorStop(0, '#3A2550'); g.addColorStop(1, '#170D24');
  ctx.fillStyle = g; ctx.fillRect(-300, y, 1680, 1200);
  rrect(ctx, -40, y - 16, 1160, 34, 10); ctx.fillStyle = '#5A3B78'; ctx.fill();
  rrect(ctx, -40, y - 16, 1160, 10, 6); ctx.fillStyle = '#7C56A0'; ctx.fill();
  for (let i = 0; i < 9; i++) {
    const x = 150 + i * 92, on = Math.sin(t * loopW(2 + (i % 3)) + i * 1.9) > 0.2, col = ['#4DFFB4', '#FFD447', '#FF5A6E'][i % 3];
    circle(ctx, x, y + 78, 13, on ? col : '#2A1B3A'); if (on) softDot(gctx, x, y + 78, 40, col, 0.6);
  }
}

// one finger of the screen's drawing: a capsule from base to tip, with a nail (screen-room units)
function fmFinger(c, a, b, w, col, edgeSide, ek, t) {
  const ux = b[0] - a[0], uy = b[1] - a[1], L = Math.hypot(ux, uy) || 1, nx = -uy / L, ny = ux / L;
  c.beginPath();
  c.moveTo(a[0] + nx * w / 2, a[1] + ny * w / 2); c.lineTo(b[0] + nx * w / 2, b[1] + ny * w / 2);
  c.arc(b[0], b[1], w / 2, Math.atan2(ny, nx), Math.atan2(ny, nx) + Math.PI, true);
  c.lineTo(a[0] - nx * w / 2, a[1] - ny * w / 2); c.closePath();
  c.fillStyle = col; c.fill(); c.lineWidth = 6; c.strokeStyle = '#8A4A3A'; c.stroke();
  const tx = b[0] - (ux / L) * w * 0.42, ty = b[1] - (uy / L) * w * 0.42;
  ellipse(c, tx, ty, w * 0.26, w * 0.36, '#FBE0D8', Math.atan2(uy, ux) + Math.PI / 2);
  for (const f of [0.38, 0.66]) { const px = a[0] + ux * f, py = a[1] + uy * f; line(c, px + nx * w * 0.28, py + ny * w * 0.28, px - nx * w * 0.28, py - ny * w * 0.28, 4, 'rgba(138,74,58,0.55)'); }
  // the outside edge glowing: from the tip back along the finger's outer side
  if (ek > 0.01) {
    const sx = edgeSide * nx, sy = edgeSide * ny;
    const p0 = [b[0] + sx * w / 2, b[1] + sy * w / 2], p1 = [b[0] + sx * w / 2 - (ux / L) * 190 * ek, b[1] + sy * w / 2 - (uy / L) * 190 * ek];
    line(c, p0[0], p0[1], p1[0], p1[1], 16, '#1A1030'); line(c, p0[0], p0[1], p1[0], p1[1], 10, '#FFD447');
    line(gctx, p0[0], p0[1], p1[0], p1[1], 26, rgba('#FFD447', 0.55 * ek));
    return p0;
  }
  return [b[0] + edgeSide * nx * w / 2, b[1] + edgeSide * ny * w / 2];
}
// a marble (screen-room units)
function fmMarble(c, x, y, r, col) {
  circle(c, x, y, r + 5, '#1A1030'); circle(c, x, y, r, col);
  ellipse(c, x - r * 0.32, y - r * 0.36, r * 0.32, r * 0.22, 'rgba(255,255,255,0.75)', -0.5);
}
// a nose tip seen from the front, as a drawing (screen-room units)
function fmNose(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (const sd of [-1, 1]) ellipse(c, sd * 15, 6, 9, 8.5, '#E58E6C');
  ellipse(c, 0, 0, 15, 13.2, '#F2A47E');
  for (const sd of [-1, 1]) ellipse(c, sd * 8.5, 10, 4.4, 3, '#5A1E2A', sd * 0.24);
  ellipse(c, -4.4, -5, 4, 2.6, 'rgba(255,246,236,0.8)');
  c.lineWidth = 1.6; c.strokeStyle = '#8A4A3A'; c.beginPath(); c.ellipse(0, 0, 15, 13.2, 0, 0, 7); c.stroke();
  c.restore();
}

// the screen and what is on it. Returns the room-space points of the two fingertips' outside edges.
function fmScreen(t, o = {}) {
  const c = ctx, [sx, sy, sw, sh] = FM.SCR, on = o.on === undefined ? 1 : clamp(o.on);
  // bracket and case
  rrect(c, sx + sw / 2 - 26, sy - 90, 52, 100, 8); c.fillStyle = '#1A1228'; c.fill();
  rrect(c, sx - 20, sy - 20, sw + 40, sh + 40, 30); c.fillStyle = '#211830'; c.fill();
  rrect(c, sx - 20, sy - 20, sw + 40, 12, 6); c.fillStyle = '#3A2C52'; c.fill();
  let out = null;
  paint(() => {
    c.save(); rrect(c, sx, sy, sw, sh, 16); c.clip();
    const g = c.createLinearGradient(0, sy, 0, sy + sh); g.addColorStop(0, '#16224E'); g.addColorStop(1, '#0E1638');
    c.fillStyle = g; c.fillRect(sx, sy, sw, sh);
    // a faint grid: a screen, not a wall
    for (let x = sx + 40; x < sx + sw; x += 80) line(c, x, sy, x, sy + sh, 2, 'rgba(120,150,255,0.07)');
    for (let y = sy + 40; y < sy + sh; y += 80) line(c, sx, y, sx + sw, y, 2, 'rgba(120,150,255,0.07)');
    if (on > 0.02) {
      c.save(); c.globalAlpha = on;
      // the drawing: a palm and two fingers. cross: the index's tip goes left behind the middle's, the middle's right
      const k = E.inOutSine(clamp(o.cross || 0)), H0 = FMH;
      const bM = [H0.cx - H0.gap / 2, H0.base], bI = [H0.cx + H0.gap / 2, H0.base];
      const tM = [lerp(bM[0], bI[0] - 4, k), H0.base - H0.len + 6 * k], tI = [lerp(bI[0], bM[0] + 4, k), H0.base - H0.len + 14 * k];
      rrect(c, H0.cx - 150, H0.base - 40, 300, 150, 60); c.fillStyle = '#F2B48C'; c.fill(); c.lineWidth = 6; c.strokeStyle = '#8A4A3A'; c.stroke();
      for (const x of [H0.cx - 150 + 8, H0.cx + 150 - 50]) { rrect(c, x, H0.base - 10, 42, 70, 21); c.fillStyle = '#E8A57E'; c.fill(); }
      const ek = o.edges || 0;
      // the outside edges: the index's thumb side (its right) and the middle's ring side (its left); crossing the
      // fingers does not move them on the finger, it only turns them to face each other
      const eI = fmFinger(c, bI, tI, H0.w, '#F2B48C', 1, ek, t);
      const eM = fmFinger(c, bM, tM, H0.w, '#F6BE98', -1, ek, t);
      out = { eI, eM, tI, tM };
      // the badges over the tips (the brain's seating plan)
      const bk = o.badges === undefined ? 1 : o.badges;
      if (bk > 0.01) {
        for (const [txt, tip, col, up] of [['MIDDLE', tM, '#C8A8FF', 70], ['INDEX', tI, '#7FE9FF', 136]]) {   // at two heights: they never overlap
          c.save(); c.translate(tip[0], tip[1] - up); const s = E.outBack(clamp(bk), 2); c.scale(s, s);
          line(c, 0, 20, 0, up - 52, 4, col);
          c.font = '900 34px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle';
          const w = c.measureText(txt).width + 34; rrect(c, -w / 2, -26, w, 52, 26); c.fillStyle = col; c.fill();
          c.fillStyle = '#0B0B1A'; c.fillText(txt, 0, 2); c.restore();
        }
      }
      // two marbles (or two noses) against the two outside edges, at once
      const mk = o.balls || 0, nk = o.noses || 0;
      for (const [e, sd] of [[eM, -1], [eI, 1]]) {
        if (mk > 0.01) { const r = 44, d = lerp(220, 0, E.outBack(clamp(mk), 1.4)); fmMarble(c, e[0] + sd * (r + d), e[1] + 12, r, sd < 0 ? '#FF6A88' : '#4DD8FF'); }
        if (nk > 0.01) { const s = 2.7 * E.outBack(clamp(nk), 1.8); fmNose(c, e[0] + sd * 15 * s, e[1] + 10, s); }
      }
      // 2 THINGS
      const ck = o.count || 0;
      if (ck > 0.01) {
        c.save(); c.translate(H0.cx, sy + 98); const s = E.outBack(clamp(ck), 2.2); c.scale(s, s); c.rotate(-0.05);
        c.font = '900 76px Anton, Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle';
        const txt = o.countTxt || '2 THINGS', w = c.measureText(txt).width + 60;
        rrect(c, -w / 2, -52, w, 104, 22); c.fillStyle = o.countCol || '#FF5A6E'; c.fill();
        c.fillStyle = '#FFFFFF'; c.fillText(txt, 0, 4); c.restore();
      }
      c.restore();
    }
    if (o.dim > 0.01) { c.fillStyle = `rgba(6,8,20,${0.6 * o.dim})`; c.fillRect(sx, sy, sw, sh); }
    c.restore();
    c.font = '900 34px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(170,190,255,0.9)';
    c.fillText(o.title || 'YOUR FINGERS', sx + sw / 2, sy - 50);
  });
  // the screen's own light
  softDot(gctx, sx + sw / 2, sy + sh / 2, 520, '#5A78FF', 0.14 * on + 0.12 * (o.flash || 0));
  return out;
}

// the brain (time-flies' brain, via eye-rub-stars and blind-spot). o: {mood: calm | worried | squint | think | grin |
// sad | wow | shrug, look: [x, y], armL, armR: hand targets (brain units), noArms, still, bob, lean, shut, thumbR, finger}
function erBrain(c, x, y, s, t, o = {}) {
  const mood = o.mood || 'calm', look = o.look || [0, 0];
  const bob = (o.still ? 0 : 5 * Math.sin(t * loopW(2.4))) + (o.bob || 0);
  c.save(); c.translate(x, y + bob); c.scale(s, s); c.rotate(o.lean || 0);
  const arm = (sd, target) => {
    const sx = sd * 138, sy = 30, tx = target ? target[0] : sd * 176, ty = target ? target[1] : 118;
    const mx = (sx + tx) / 2 + sd * 22, my = (sy + ty) / 2 + 30;
    c.beginPath(); c.moveTo(sx, sy); c.quadraticCurveTo(mx, my, tx, ty); c.lineWidth = 17; c.lineCap = 'round'; c.strokeStyle = '#E0688E'; c.stroke();
    circle(c, tx, ty, 21, '#FFA9C0');
    if (sd > 0 && o.thumbR) { rrect(c, tx - 7, ty - 46, 15, 34, 7); c.fillStyle = '#FFA9C0'; c.fill(); }
    else if (sd < 0 && o.pointL) { const a = Math.atan2(o.pointL[1], o.pointL[0]); line(c, tx, ty, tx + Math.cos(a) * 40, ty + Math.sin(a) * 40, 15, '#FFA9C0'); }
    else circle(c, tx + sd * 12, ty - 14, 9, '#FFA9C0');
  };
  if (!o.noArms) { arm(-1, o.armL); arm(1, o.armR); }
  rrect(c, -12, 96, 58, 74, 22); c.fillStyle = '#D9688A'; c.fill();                      // the stem
  const lumps = [[-150, 20, 62], [-126, -50, 66], [-64, -98, 70], [16, -112, 74], [92, -86, 68], [144, -26, 62], [150, 40, 56], [96, 84, 60], [10, 100, 66], [-84, 88, 62]];
  c.beginPath(); for (const [lx, ly, lr] of lumps) { c.moveTo(lx + lr, ly); c.arc(lx, ly, lr, 0, 7); } c.ellipse(0, 0, 150, 96, 0, 0, 7);
  c.fillStyle = '#FF93B0'; c.fill();
  paint(() => {
    c.lineWidth = 7; c.lineCap = 'round'; c.strokeStyle = 'rgba(176,60,104,0.55)';
    for (const [x0, y0, x1, y1, x2, y2] of [[-150, -24, -108, -66, -70, -26], [-56, -122, -20, -74, 22, -112], [40, -130, 84, -86, 128, -98], [-176, 44, -150, 78, -116, 60], [110, 96, 148, 76, 176, 30], [-30, 122, 6, 100, 44, 126]]) {
      c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x1, y1, x2, y2); c.stroke();
    }
    const lx = look[0] * 9, ly = look[1] * 7, shut = o.shut || 0;
    const ry = mood === 'squint' ? 13 : mood === 'worried' || mood === 'wow' ? 34 : mood === 'grin' ? 24 : mood === 'sad' ? 25 : 28;
    for (const ex of [-44, 38]) {
      if (shut > 0.6) { c.beginPath(); c.moveTo(ex - 22, 2); c.quadraticCurveTo(ex, 18, ex + 22, 2); c.lineWidth = 6; c.strokeStyle = '#7E2748'; c.stroke(); continue; }
      ellipse(c, ex, 4, 25, ry * (1 - 0.5 * shut), '#FFFFFF'); c.lineWidth = 4; c.strokeStyle = '#7E2748'; c.beginPath(); c.ellipse(ex, 4, 25, ry * (1 - 0.5 * shut), 0, 0, 7); c.stroke();
      circle(c, ex + lx, 4 + ly * (ry / 28), mood === 'worried' || mood === 'wow' ? 8 : 10.5, '#231028'); circle(c, ex + lx - 3, 1 + ly * (ry / 28), 3.4, '#FFFFFF');
    }
    const bt = mood === 'worried' || mood === 'sad' ? 1 : mood === 'squint' ? -0.8 : mood === 'think' || mood === 'shrug' ? 0.5 : 0, by = mood === 'worried' || mood === 'wow' ? -46 : mood === 'squint' ? -24 : -38;
    line(c, -70, by + bt * 10, -24, by - bt * 8 + (mood === 'think' ? -10 : 0), 9, '#7E2748'); line(c, 16, by - bt * 8, 64, by + bt * 10, 9, '#7E2748');
    if (mood === 'worried' || mood === 'wow') ellipse(c, -2, 64, mood === 'wow' ? 19 : 15, mood === 'wow' ? 17 : 12, '#5A1522');
    else if (mood === 'grin') { c.beginPath(); c.moveTo(-28, 54); c.quadraticCurveTo(-2, 84, 24, 54); c.closePath(); c.fillStyle = '#5A1522'; c.fill(); }
    else if (mood === 'sad') { c.beginPath(); c.moveTo(-18, 68); c.quadraticCurveTo(0, 54, 18, 68); c.lineWidth = 6; c.strokeStyle = '#5A1522'; c.stroke(); }
    else if (mood === 'squint' || mood === 'think' || mood === 'shrug') { c.beginPath(); c.moveTo(-18, 62); c.quadraticCurveTo(0, 54, 18, 64); c.lineWidth = 6; c.strokeStyle = '#5A1522'; c.stroke(); }
    else { c.beginPath(); c.moveTo(-16, 58); c.quadraticCurveTo(0, 68, 16, 58); c.lineWidth = 6; c.strokeStyle = '#5A1522'; c.stroke(); }
  });
  c.restore();
}

// a light bulb over the brain (room units): k pops it in, lit 0..1
function fmBulb(x, y, s, k, lit, t) {
  if (k <= 0.01) return;
  const q = E.outBack(clamp(k), 2) * s;
  ctx.save(); ctx.translate(x, y); ctx.scale(q, q);
  actor(() => { rrect(ctx, -22, 40, 44, 34, 8); ctx.fillStyle = '#9AA0B8'; ctx.fill(); });
  paint(() => {
    circle(ctx, 0, 0, 52, lit > 0.5 ? '#FFF2A8' : '#D8DCEA');
    for (const yy of [48, 58, 68]) line(ctx, -21, yy, 21, yy, 3, 'rgba(60,60,90,0.5)');
    line(ctx, -10, 26, -6, -8, 4, 'rgba(160,110,20,0.8)'); line(ctx, 10, 26, 6, -8, 4, 'rgba(160,110,20,0.8)');
  });
  ctx.restore();
  if (lit > 0.01) {
    softDot(gctx, x, y, 170 * s, '#FFE27A', 0.85 * lit);
    for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283 + 0.2, r0 = 70 * s, r1 = (96 + 10 * Math.sin(t * 9 + i)) * s; for (const cc of [ctx, gctx]) line(cc, x + Math.cos(a) * r0, y + Math.sin(a) * r0, x + Math.cos(a) * r1, y + Math.sin(a) * r1, cc === ctx ? 7 : 12, rgba('#FFE27A', lit)); }
  }
}
// "z z z" rising from a point (room units)
function fmZzz(x, y, t, a = 1) {
  if (a <= 0.01) return;
  for (const cc of [ctx, gctx]) {
    cc.save(); cc.textAlign = 'center'; cc.textBaseline = 'middle';
    for (let i = 0; i < 3; i++) {
      const p = ((t * 0.7 + i / 3) % 1), px = x + p * 70 + Math.sin(p * 6 + i) * 10, py = y - p * 150, sz = 34 + p * 30, al = Math.sin(Math.PI * p) * a;
      cc.font = `900 ${sz}px Montserrat`;
      if (cc === ctx) { cc.lineWidth = sz * 0.16; cc.strokeStyle = `rgba(10,8,30,${0.8 * al})`; cc.strokeText('z', px, py); cc.fillStyle = `rgba(230,220,255,${al})`; cc.fillText('z', px, py); }
      else { cc.fillStyle = `rgba(200,170,255,${0.45 * al})`; cc.fillText('z', px, py); }
    }
    cc.restore();
  }
}
