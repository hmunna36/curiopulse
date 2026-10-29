// The brain at its desk: a pink brain with a face and two little arms, watching the foot's feed on an old TV.
// The screen has four programmes: the live feed, NO SIGNAL, the map with a question mark where the foot was, and
// pure static. Plus the control room behind them.
'use strict';

function brainRoom(t) {
  darkBg('#4A2460', '#0D0616');
  screenSpace();
  // a faint web of neurons on the back wall
  const rng = mulberry32(9);
  const pts = [...Array(16)].map(() => [rng() * W, 380 + rng() * 620]);
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
    const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]);
    if (d < 300) line(ctx, pts[i][0], pts[i][1], pts[j][0], pts[j][1], 2.5, `rgba(255,150,210,${0.10 + 0.05 * Math.sin(t * 2 + i + j)})`);
  }
  pts.forEach((p, i) => { circle(ctx, p[0], p[1], 6, 'rgba(255,170,220,0.22)'); softDot(gctx, p[0], p[1], 34, '#FF86C8', 0.16 + 0.12 * Math.sin(t * 3 + i * 1.7)); });
}
// the desk they sit behind: top edge at y, lights that blink
function brainDesk(y, t) {
  screenSpace();
  const g = ctx.createLinearGradient(0, y, 0, y + 420);
  g.addColorStop(0, '#3A2550'); g.addColorStop(1, '#170D24');
  ctx.fillStyle = g; ctx.fillRect(0, y, W, 1000);
  rrect(ctx, -20, y - 16, W + 40, 34, 10); ctx.fillStyle = '#5A3B78'; ctx.fill();
  rrect(ctx, -20, y - 16, W + 40, 10, 6); ctx.fillStyle = '#7C56A0'; ctx.fill();
  for (let i = 0; i < 9; i++) {
    const x = 150 + i * 92, on = Math.sin(t * (2 + (i % 3)) + i * 1.9) > 0.2, col = ['#4DFFB4', '#FFD447', '#FF5A6E'][i % 3];
    circle(ctx, x, y + 78, 13, on ? col : '#2A1B3A'); if (on) softDot(gctx, x, y + 78, 40, col, 0.6);
    rrect(ctx, x - 26, y + 112, 52, 12, 6); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill();
  }
}

// o: {look: [x, y] -1..1, mood: 'calm' | 'worried' | 'squint' | 'think' | 'shrug' | 'grin', lean: rad, armL/armR: [x, y] hand
// targets relative to the brain (default: at its sides), bob}
function brainGuy(x, y, s, t, o = {}) {
  const c = ctx, mood = o.mood || 'calm', look = o.look || [0, 0];
  const bob = 5 * Math.sin(t * 2.4) + (o.bob || 0);
  c.save(); c.translate(x, y + bob); c.scale(s, s); c.rotate(o.lean || 0);
  // arms behind the body
  const arm = (sd, target) => {
    const sx = sd * 138, sy = 30, tx = target ? target[0] : sd * 176, ty = target ? target[1] : 118;
    const mx = (sx + tx) / 2 + sd * 22, my = (sy + ty) / 2 + 30;
    c.beginPath(); c.moveTo(sx, sy); c.quadraticCurveTo(mx, my, tx, ty); c.lineWidth = 17; c.lineCap = 'round'; c.strokeStyle = '#B8486E'; c.stroke();
    c.lineWidth = 10; c.strokeStyle = '#F08AA8'; c.stroke();
    circle(c, tx, ty, 21, '#B8486E'); circle(c, tx - 1, ty - 2, 17, '#FFA9C0'); circle(c, tx + sd * 12, ty - 14, 8, '#FFA9C0');
    return [tx, ty];
  };
  arm(-1, o.armL); arm(1, o.armR);
  // brainstem
  rrect(c, -12, 96, 58, 74, 22); c.fillStyle = '#D9688A'; c.fill(); c.lineWidth = 6; c.strokeStyle = '#7E2748'; c.stroke();
  // the body: a lumpy outline
  const lumps = [[-150, 20, 62], [-126, -50, 66], [-64, -98, 70], [16, -112, 74], [92, -86, 68], [144, -26, 62], [150, 40, 56], [96, 84, 60], [10, 100, 66], [-84, 88, 62]];
  c.beginPath(); for (const [lx, ly, lr] of lumps) { c.moveTo(lx + lr, ly); c.arc(lx, ly, lr, 0, 7); } c.fillStyle = '#7E2748'; c.fill();
  c.beginPath(); for (const [lx, ly, lr] of lumps) { c.moveTo(lx + lr - 7, ly); c.arc(lx, ly, lr - 7, 0, 7); } c.ellipse(0, 0, 150, 96, 0, 0, 7);
  const g = c.createRadialGradient(-50, -70, 20, 0, 0, 230); g.addColorStop(0, '#FFC2D2'); g.addColorStop(0.5, '#FF93B0'); g.addColorStop(1, '#E0688E');
  c.fillStyle = g; c.fill();
  // folds
  c.lineWidth = 7; c.lineCap = 'round'; c.strokeStyle = 'rgba(160,52,96,0.6)';
  for (const [x0, y0, x1, y1, x2, y2] of [[-150, -24, -108, -66, -70, -26], [-56, -122, -20, -74, 22, -112], [40, -130, 84, -86, 128, -98], [-176, 44, -150, 78, -116, 60], [110, 96, 148, 76, 176, 30], [-30, 122, 6, 100, 44, 126]]) {
    c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x1, y1, x2, y2); c.stroke();
  }
  // face
  const lx = look[0] * 9, ly = look[1] * 7;
  const eye = (ex, sq) => {
    const ry = mood === 'squint' ? 13 : mood === 'worried' ? 34 : mood === 'grin' ? 24 : 28;
    ellipse(c, ex, 4, 25, ry, '#FFFFFF'); c.lineWidth = 4; c.strokeStyle = '#7E2748'; c.beginPath(); c.ellipse(ex, 4, 25, ry, 0, 0, 7); c.stroke();
    circle(c, ex + lx, 4 + ly * (ry / 28), mood === 'worried' ? 8 : 10.5, '#231028'); circle(c, ex + lx - 3, 1 + ly * (ry / 28), 3.4, '#FFFFFF');
  };
  eye(-44); eye(38);
  const bt = mood === 'worried' ? 1 : mood === 'squint' ? -0.8 : mood === 'think' ? 0.5 : 0, by = mood === 'worried' ? -46 : mood === 'squint' ? -24 : -38;
  line(c, -70, by + bt * 10, -24, by - bt * 8 + (mood === 'think' ? -10 : 0), 9, '#7E2748'); line(c, 16, by - bt * 8, 64, by + bt * 10, 9, '#7E2748');
  if (mood === 'worried') { ellipse(c, -2, 62, 15, 12, '#5A1522'); }
  else if (mood === 'grin' || mood === 'shrug') { c.beginPath(); c.moveTo(-28, 54); c.quadraticCurveTo(-2, 82, 24, 54); c.closePath(); c.fillStyle = '#5A1522'; c.fill(); }
  else if (mood === 'squint' || mood === 'think') { c.beginPath(); c.moveTo(-18, 62); c.quadraticCurveTo(0, 54, 18, 64); c.lineWidth = 6; c.strokeStyle = '#5A1522'; c.stroke(); }
  else { c.beginPath(); c.moveTo(-16, 58); c.quadraticCurveTo(0, 68, 16, 58); c.lineWidth = 6; c.strokeStyle = '#5A1522'; c.stroke(); }
  if (o.sweat > 0) sweatDrop(c, 118, -96, 1.5, o.sweat);
  c.restore();
}

// a little foot pictogram (sole toward us), for the screen. col = fill
function footIcon(c, x, y, s, col) {
  c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col;
  c.beginPath(); c.ellipse(0, 18, 30, 46, 0.08, 0, 7); c.fill();
  [[-24, -42, 13], [-5, -50, 11], [11, -48, 9.5], [24, -42, 8.5], [34, -32, 7.5]].forEach(([tx, ty, r]) => { c.beginPath(); c.arc(tx, ty, r, 0, 7); c.fill(); });
  c.restore();
}
// the old TV. mode: 'feed' | 'nosignal' | 'lost' | 'static'; glitch 0..1 jolts the picture
function tvSet(x, y, w, h, t, mode, o = {}) {
  const c = ctx;
  screenSpace();
  // aerial, body, feet
  line(c, x + w * 0.42, y + 6, x + w * 0.22, y - 110, 7, '#8A93AD'); line(c, x + w * 0.5, y + 6, x + w * 0.72, y - 96, 7, '#8A93AD');
  circle(c, x + w * 0.22, y - 110, 10, '#C8D0E6'); circle(c, x + w * 0.72, y - 96, 10, '#C8D0E6');
  for (const fx of [0.2, 0.8]) { rrect(c, x + w * fx - 16, y + h - 6, 32, 30, 6); c.fillStyle = '#1A1228'; c.fill(); }
  rrect(c, x, y, w, h, 38); const bg = c.createLinearGradient(x, y, x, y + h); bg.addColorStop(0, '#C76A3A'); bg.addColorStop(1, '#8A3E1E'); c.fillStyle = bg; c.fill();
  c.lineWidth = 7; c.strokeStyle = '#4A1E0C'; c.stroke();
  const sx = x + 26, sy = y + 26, sw = w - 118, sh = h - 52;
  for (let i = 0; i < 3; i++) { circle(c, x + w - 46, y + 62 + i * 62, 20, '#3A1A0C'); circle(c, x + w - 46, y + 62 + i * 62, 13, i === 0 ? '#FFD447' : '#E8D9C0'); }
  rrect(c, sx - 8, sy - 8, sw + 16, sh + 16, 30); c.fillStyle = '#2A120A'; c.fill();
  c.save(); rrect(c, sx, sy, sw, sh, 24); c.clip();
  const fr = Math.floor(t * FPS), gl = o.glitch || 0;
  if (gl > 0) c.translate((hash(fr * 1.3) - 0.5) * 30 * gl, (hash(fr * 2.1) - 0.5) * 12 * gl);
  let glow = '#7FE9FF';
  if (mode === 'feed') {
    c.fillStyle = '#0E3A44'; c.fillRect(sx, sy, sw, sh); glow = '#4DFFB4';
    footIcon(c, sx + sw * 0.36, sy + sh * 0.56, sh / 170, '#FFC9A8');
    for (let i = 0; i < 4; i++) { rrect(c, sx + sw * 0.66 + i * 26, sy + sh * 0.62 - i * 20, 18, 26 + i * 20, 4); c.fillStyle = '#4DFFB4'; c.fill(); }
    c.font = '900 30px Montserrat'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = '#4DFFB4'; c.fillText('FOOT', sx + 22, sy + 34);
    if (Math.sin(t * 7) > 0) circle(c, sx + sw - 34, sy + 34, 10, '#FF5A6E'); c.fillStyle = '#FFFFFF'; c.textAlign = 'right'; c.fillText('LIVE', sx + sw - 54, sy + 34);
  } else if (mode === 'nosignal') {
    c.fillStyle = '#14204E'; c.fillRect(sx, sy, sw, sh); glow = '#5B7FFF';
    footIcon(c, sx + sw * 0.5, sy + sh * 0.5, sh / 150, 'rgba(120,140,220,0.22)');
    c.font = '400 ' + Math.round(sh * 0.3) + 'px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = Math.sin(t * 9) > -0.4 ? '#FFFFFF' : 'rgba(255,255,255,0.35)';
    c.fillText('NO SIGNAL', sx + sw / 2, sy + sh * 0.5 + 6 * Math.sin(t * 2.2));
    for (let i = 0; i < 4; i++) { rrect(c, sx + sw * 0.7 + i * 22, sy + 58 - i * 9, 15, 12 + i * 9, 3); c.fillStyle = 'rgba(255,90,110,0.9)'; c.fill(); }
  } else if (mode === 'lost') {
    c.fillStyle = '#0C2A2E'; c.fillRect(sx, sy, sw, sh); glow = '#4DFFB4';
    const cx = sx + sw * 0.5, cy = sy + sh * 0.52, sc = sh / 300;
    // a radar sweep over a little body map
    c.save(); c.translate(cx, cy);
    for (const r of [0.34, 0.62, 0.9]) { c.beginPath(); c.arc(0, 0, sh * 0.5 * r, 0, 7); c.lineWidth = 2; c.strokeStyle = 'rgba(77,255,180,0.25)'; c.stroke(); }
    const sa = t * 3.2; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, sh * 0.46, sa - 0.7, sa); c.closePath(); c.fillStyle = 'rgba(77,255,180,0.22)'; c.fill();
    c.scale(sc, sc); c.strokeStyle = '#B8FFE2'; c.lineCap = 'round'; c.lineWidth = 12;
    circle(c, 0, -92, 26, '#B8FFE2'); c.beginPath(); c.moveTo(0, -62); c.lineTo(0, 26); c.moveTo(0, -40); c.lineTo(-50, 4); c.moveTo(0, -40); c.lineTo(50, 4); c.moveTo(0, 26); c.lineTo(-34, 104); c.moveTo(0, 26); c.lineTo(26, 70); c.stroke();
    circle(c, -38, 112, 11, '#B8FFE2');
    const bl = 0.5 + 0.5 * Math.sin(t * 12);
    c.font = '400 86px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = rgba('#FFD447', 0.5 + 0.5 * bl); c.fillText('?', 44, 108);
    c.restore();
    softDot(gctx, cx + 44 * sc, cy + 108 * sc, 60, '#FFD447', 0.5 * bl);
  } else {                                               // static: new noise every frame, scan lines
    c.fillStyle = '#8D95A8'; c.fillRect(sx, sy, sw, sh); glow = '#DDE6FF';
    const rng = mulberry32(fr * 7 + 3), cell = 14;
    for (let yy = 0; yy < sh; yy += cell) for (let xx = 0; xx < sw; xx += cell) { const v = Math.floor(rng() * 255); c.fillStyle = `rgb(${v},${v},${Math.min(255, v + 14)})`; c.fillRect(sx + xx, sy + yy, cell, cell); }
    const by = (t * 260) % (sh + 80) - 40; c.fillStyle = 'rgba(255,255,255,0.22)'; c.fillRect(sx, sy + by, sw, 34);
  }
  for (let yy = 0; yy < sh; yy += 6) { c.fillStyle = 'rgba(0,0,10,0.16)'; c.fillRect(sx, sy + yy, sw, 2); }
  c.restore();
  // glass shine + the screen's light
  c.save(); rrect(c, sx, sy, sw, sh, 24); c.clip(); c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + sw * 0.34, sy); c.lineTo(sx + sw * 0.12, sy + sh); c.lineTo(sx, sy + sh); c.closePath(); c.fillStyle = 'rgba(255,255,255,0.07)'; c.fill(); c.restore();
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); rrect(gctx, sx, sy, sw, sh, 24); gctx.fillStyle = rgba(glow, mode === 'static' ? 0.2 + 0.08 * hash(fr) : 0.2); gctx.fill(); gctx.restore();
  return { sx, sy, sw, sh };
}
