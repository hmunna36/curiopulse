// The other end of the cable: the brain in its dark room (time-flies' brain, via eye-rub-stars), under a screen marked
// WHAT YOU SEE that shows the viewer's own test (the wall, the X, and a black hole where the dot was). The brain dabs
// its brush on the wall beside the hole and paints the hole over with it. Screen space.
'use strict';

// the brain. o: {mood: calm | worried | squint | think | grin | sad | wow | shrug, look: [x, y], armL, armR: targets,
// noArms, still, bob, lean, shut}
function erBrain(c, x, y, s, t, o = {}) {
  const mood = o.mood || 'calm', look = o.look || [0, 0];
  const bob = (o.still ? 0 : 5 * Math.sin(t * 2.4)) + (o.bob || 0);
  c.save(); c.translate(x, y + bob); c.scale(s, s); c.rotate(o.lean || 0);
  const arm = (sd, target) => {
    const sx = sd * 138, sy = 30, tx = target ? target[0] : sd * 176, ty = target ? target[1] : 118;
    const mx = (sx + tx) / 2 + sd * 22, my = (sy + ty) / 2 + 30;
    c.beginPath(); c.moveTo(sx, sy); c.quadraticCurveTo(mx, my, tx, ty); c.lineWidth = 17; c.lineCap = 'round'; c.strokeStyle = '#E0688E'; c.stroke();
    circle(c, tx, ty, 21, '#FFA9C0'); circle(c, tx + sd * 12, ty - 14, 9, '#FFA9C0');
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

// the screen, and the brain under it. o: {fill: 0..1 (how much of the hole is painted), dab: 0..1 (the brush on the
// wall beside the hole), brush: 0..1 (its arm up at the screen), stroke: a phase for the brushing, mood, look,
// hole: 0..1 (the hole shows), V: {k, cx, cy} a push on the whole room, cable pulses: [[u, a]], tag: 0..1}
const BP = { X: 548, Y: 1200, S: 1.32, SCR: [120, 474, 840, 486] };
// where things are on the screen: the X and the hole, in screen pixels (the test card's layout, scaled into the screen)
const BP_X = [BP.SCR[0] + BP.SCR[2] * (185 / 1080), BP.SCR[1] + BP.SCR[3] * 0.42];
const BP_H = [BP.SCR[0] + BP.SCR[2] * (905 / 1080), BP.SCR[1] + BP.SCR[3] * 0.47];
function brainPaint(t, o = {}) {
  const c = ctx, g = gctx;
  screenSpace();
  // the cable coming in from the eye, bottom left
  const P0 = [-40, 1520], P1 = [120, 1500], P2 = [220, 1420], P3 = [300, 1330];
  c.beginPath(); c.moveTo(P0[0], P0[1]); c.bezierCurveTo(P1[0], P1[1], P2[0], P2[1], P3[0], P3[1]); c.lineWidth = 46; c.lineCap = 'round'; c.strokeStyle = '#C9792F'; c.stroke();
  c.beginPath(); c.moveTo(P0[0], P0[1]); c.bezierCurveTo(P1[0], P1[1], P2[0], P2[1], P3[0], P3[1]); c.lineWidth = 32; c.strokeStyle = '#F2A65A'; c.stroke();
  const bz = (u) => { const v = 1 - u; return [v * v * v * P0[0] + 3 * v * v * u * P1[0] + 3 * v * u * u * P2[0] + u * u * u * P3[0], v * v * v * P0[1] + 3 * v * v * u * P1[1] + 3 * v * u * u * P2[1] + u * u * u * P3[1]]; };
  for (const [u, a] of o.pulses || []) if (a > 0.01 && u > 0 && u < 1) { const p = bz(u); circle(c, p[0], p[1], 12, rgba('#FFFDF0', a)); softDot(g, p[0], p[1], 50, '#FFC24A', 0.85 * a); }
  // the screen: what you see
  const [sx, sy, sw, sh] = BP.SCR;
  rrect(c, sx - 18, sy - 18, sw + 36, sh + 36, 28); c.fillStyle = '#2A3470'; c.fill();
  line(c, sx + sw / 2, sy + sh + 18, sx + sw / 2, sy + sh + 70, 20, '#2A3470');
  paint(() => {
    // the picture: his wall at night, the X, and the hole where the dot was
    c.save(); rrect(c, sx, sy, sw, sh, 14); c.clip();
    const wg = c.createLinearGradient(0, sy, 0, sy + sh); wg.addColorStop(0, '#18214C'); wg.addColorStop(1, '#1D2858');
    c.fillStyle = wg; c.fillRect(sx, sy, sw, sh);
    const q = sw / 1080;
    for (const [w, col] of [[30 * q, '#0B0B1A'], [18 * q, '#FFFFFF']]) {
      const r = 41 * q * 1.6;
      line(c, BP_X[0] - r, BP_X[1] - r, BP_X[0] + r, BP_X[1] + r, w * 1.6, col); line(c, BP_X[0] + r, BP_X[1] - r, BP_X[0] - r, BP_X[1] + r, w * 1.6, col);
    }
    // the hole: black, ragged, shrinking as the paint goes on (in strokes)
    const hole = clamp(o.hole === undefined ? 1 : o.hole), fill = clamp(o.fill || 0);
    if (hole > 0.01 && fill < 0.999) {
      const R0 = 92 * E.outBack(hole, 1.8), rng = mulberry32(7);
      c.beginPath();
      for (let i = 0; i < 22; i++) { const a = (i / 22) * 6.2832, rr = R0 * (0.84 + 0.22 * rng()); c[i ? 'lineTo' : 'moveTo'](BP_H[0] + Math.cos(a) * rr, BP_H[1] + Math.sin(a) * rr); }
      c.closePath(); c.fillStyle = '#000000'; c.fill();
      // painted strokes over it, left to right, in the wall's own colour
      const n = 7, done = fill * n;
      for (let i = 0; i < n; i++) {
        const k = clamp(done - i);
        if (k <= 0) break;
        const yy = BP_H[1] - R0 * 1.05 + (i + 0.5) * (2.1 * R0 / n), x0 = BP_H[0] - R0 * 1.2, x1 = lerp(x0, BP_H[0] + R0 * 1.2, k);
        c.lineWidth = 2.1 * R0 / n + 8; c.lineCap = 'round'; c.strokeStyle = i % 2 ? '#1B2554' : '#1A2452';
        c.beginPath(); c.moveTo(x0, yy); c.lineTo(x1, yy + 4 * Math.sin(i)); c.stroke();
      }
    }
    c.restore();
    c.font = '900 34px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(170,190,255,0.85)';
    c.fillText('WHAT YOU SEE', sx + sw / 2, sy - 52);
  });
  // the brain, and its brush
  const br = clamp(o.brush || 0), dab = clamp(o.dab || 0), fill = clamp(o.fill || 0);
  const X = BP.X, Y = BP.Y, S = BP.S;
  // where the brush tip is: resting low, then up to the wall beside the hole (the dab), then across the hole
  const rest = [176, 118];
  const side = [(BP_H[0] - 150 - X) / S, (BP_H[1] + 40 - Y) / S];
  const sweep = [(BP_H[0] - 60 + 120 * Math.sin(o.stroke || 0) * 0.9 - X) / S, (BP_H[1] - 70 + 140 * fill - Y) / S];
  let hand = [lerp(rest[0], side[0], br), lerp(rest[1], side[1], br)];
  if (dab > 0) hand = [lerp(hand[0], sweep[0], dab), lerp(hand[1], sweep[1], dab)];
  actor(() => erBrain(c, X, Y, S, t, { mood: o.mood || 'calm', look: o.look || [0, -1], armL: [-176, 118], armR: [hand[0], hand[1] + 70 / S] }));
  // the brush: handle down to the hand, bristles up at the tip (the bristles take the wall's colour once dabbed)
  const bx = X + hand[0] * S, by = Y + hand[1] * S + 5 * Math.sin(t * 2.4) * (1 - br);
  c.save(); c.translate(bx, by + 70); c.rotate(-0.25 + 0.3 * Math.sin((o.stroke || 0) * 1.0) * dab); c.scale(1.9, 1.9); c.translate(0, 30);
  actor(() => { line(c, 0, 40, 0, -60, 13, '#C98A4A'); rrect(c, -15, -70, 30, 22, 6); c.fillStyle = '#B8B8C8'; c.fill(); });
  const tipCol = mixH('#FFD447', '#1B2554', clamp(o.loaded || 0));
  paint(() => { c.beginPath(); c.moveTo(-15, -70); c.quadraticCurveTo(-18, -100, 0, -118); c.quadraticCurveTo(18, -100, 15, -70); c.closePath(); c.fillStyle = tipCol; c.fill(); });
  c.restore();
  return { brushTip: [bx, by - 48] };
}
