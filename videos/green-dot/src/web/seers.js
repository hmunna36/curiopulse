// Inside his eye, the way the mechanism is told: eye-rub-stars' eyeball cut in half (eyeball.js), turned so that its
// front looks UP at the test card, and on its floor (the back wall) a team of little colour-seers standing in a row:
// PINK seers (magenta caps) and GREEN seers (green caps). A beam from the card comes down through the lens onto them.
// Pink light: the pink team works until it is sick of pink (droops, then sleeps). Grey light (the dot is off): the pink
// team sleeps through it and only the green team answers: "GREEN!". Screen space.
'use strict';

const SE = { X: 520, Y: 1060, S: 1.9, ANG: [-0.62, -0.37, -0.12, 0.12, 0.37, 0.62], TEAM: ['P', 'G', 'P', 'G', 'P', 'G'] };
const SE_CAP = { P: '#FF4FD8', G: '#34D67A' };
const SE_CAPSH = { P: '#C42FA5', G: '#1F9C55' };
// the eye drawn with its front up: eye units turned a quarter (local -x = up on screen)
function seEyeOn(V, fn) {
  for (const c of [ctx, gctx]) { c.save(); c.translate(V.x, V.y); c.rotate(Math.PI / 2); c.scale(V.s, V.s); }
  try { return fn(); } finally { ctx.restore(); gctx.restore(); }
}
// eye point (local) -> screen, for a view V
const seAt = (V, lx, ly) => [V.x - ly * V.s, V.y + lx * V.s];
// where seer i stands (screen): its foot on the floor and the way "up" from it (toward the middle of the ball)
function seSpot(V, i) {
  const a = SE.ANG[i], r = EYB.R - 34;
  const [x, y] = seAt(V, Math.cos(a) * r, Math.sin(a) * r);
  const up = Math.atan2(V.y - y, V.x - x);
  return { x, y, up };
}
// one seer, standing (screen space). S: {team 'P'|'G', mood: work | tired | zzz | idle | ready | shout | proud,
// k: pop 0..1, glow 0..1, jit, look: [x, y], sweat 0..1}
function seSeer(c, g, P, S, t, i, sc) {
  const k = clamp(S.k === undefined ? 1 : S.k);
  if (k <= 0.01) return;
  const mood = S.mood || 'idle', shout = mood === 'shout' ? 1 : 0, droop = mood === 'tired' ? 1 : mood === 'zzz' ? 1.25 : 0;
  const jx = (S.jit || 0) * Math.sin(t * 61 + i * 2.1), jy = (S.jit || 0) * Math.cos(t * 53 + i);
  const bob = (mood === 'zzz' ? 3 * Math.sin(t * 2.2 + i) : mood === 'idle' ? 2 * Math.sin(t * 3 + i * 1.7) : 0);
  c.save(); c.translate(P.x + jx, P.y + jy); c.rotate(P.up + Math.PI / 2); c.scale(sc * E.outBack(k, 2), sc * E.outBack(k, 2));
  // local: +y down to the floor, the body stands up from (0, 0)
  const hgt = 96 * (1 - 0.12 * droop) * (1 + 0.12 * shout), wid = 58 * (1 + 0.06 * droop);
  const lean = 0.16 * droop * (i % 2 ? 1 : -1);
  c.rotate(lean);
  actor(() => {
    rrect(c, -wid / 2, -hgt + bob, wid, hgt - bob, wid * 0.46); c.fillStyle = mixH('#FFB36B', '#FFE38A', clamp(S.glow || 0)); c.fill();
    rrect(c, -wid * 0.36, -12, wid * 0.72, 20, 8); c.fillStyle = '#D9702A'; c.fill();                // its foot, in the wall
    // the team cap (a beanie with a bobble)
    const cy = -hgt + bob + 6;
    c.beginPath(); c.ellipse(0, cy + 8, wid * 0.52, 22, 0, Math.PI, 0); c.closePath(); c.fillStyle = SE_CAP[S.team]; c.fill();
    rrect(c, -wid * 0.53, cy + 2, wid * 1.06, 13, 6); c.fillStyle = SE_CAPSH[S.team]; c.fill();
    circle(c, 0, cy - 15, 9, SE_CAP[S.team]);
  });
  paint(() => {
    const fy = -hgt * 0.5 + bob, ex = 11, ey = fy - 6, look = S.look || [0, 0];
    if (mood === 'zzz') {
      for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(sd * ex - 7, ey + 1); c.quadraticCurveTo(sd * ex, ey + 6, sd * ex + 7, ey + 1); c.lineWidth = 3.4; c.strokeStyle = '#3A1A10'; c.lineCap = 'round'; c.stroke(); }
      ellipse(c, 0, fy + 13, 5, 4, '#5A1522');
    } else if (mood === 'shout') {
      for (const sd of [-1, 1]) { line(c, sd * (ex - 5), ey - 6, sd * (ex + 5), ey, 3.6, '#3A1A10'); line(c, sd * (ex + 5), ey, sd * (ex - 5), ey + 6, 3.6, '#3A1A10'); }
      ellipse(c, 0, fy + 15, 11, 13, '#5A1522'); ellipse(c, 0, fy + 21, 6.5, 4.5, '#E0616C');
    } else if (mood === 'tired') {
      for (const sd of [-1, 1]) {
        circle(c, sd * ex, ey, 7.5, '#FFFFFF'); circle(c, sd * ex + look[0] * 2.5, ey + 2, 4, '#2A1208');
        c.save(); c.beginPath(); c.arc(sd * ex, ey, 8, 0, 7); c.clip(); c.fillStyle = '#E8935A'; c.fillRect(sd * ex - 9, ey - 9, 18, 10); c.restore();   // heavy lids
        line(c, sd * ex - 8, ey + 1, sd * ex + 8, ey + 1, 2.6, '#6A3526');
      }
      c.beginPath(); c.moveTo(-8, fy + 14); c.quadraticCurveTo(0, fy + 9, 8, fy + 14); c.lineWidth = 3.2; c.strokeStyle = '#5A1522'; c.lineCap = 'round'; c.stroke();
      if ((S.sweat || 0) > 0.05) sweatDrop(c, wid * 0.42, fy - 20, 0.8, S.sweat);
    } else {
      const er = mood === 'ready' ? 9 : 7.5;
      for (const sd of [-1, 1]) { circle(c, sd * ex, ey, er, '#FFFFFF'); circle(c, sd * ex + look[0] * 2.8, ey + look[1] * 2.4, er * 0.55, '#2A1208'); }
      if (mood === 'ready') ellipse(c, 0, fy + 14, 5, 6, '#5A1522');
      else if (mood === 'proud' || mood === 'work') { c.beginPath(); c.moveTo(-9, fy + 11); c.quadraticCurveTo(0, fy + 20, 9, fy + 11); c.lineWidth = 3.4; c.strokeStyle = '#5A1522'; c.lineCap = 'round'; c.stroke(); }
      else { line(c, -7, fy + 13, 7, fy + 13, 3.2, '#5A1522'); }
    }
  });
  c.restore();
  const gl = clamp(S.glow || 0);
  if (gl > 0.02) softDot(g, P.x + Math.cos(P.up) * 60 * sc, P.y + Math.sin(P.up) * 60 * sc, 80 * sc, S.team === 'G' ? '#4DFFB4' : '#FF6AE0', 0.5 * gl);
}
// the beam from the card down into the eye and onto the seers (the lens sits under the card). col: the light's colour,
// a: strength, top: [x, y, half width] where it leaves the card, V: the eye's view, t
function seBeam(V, top, col, a, t) {
  if (a <= 0.01) return;
  const [tx, ty, hw] = top;
  const floor = seAt(V, EYB.R - 92, 0), fw = 190 * V.s / 1.9;
  const band = (c, al) => {
    c.save(); c.beginPath();
    c.moveTo(tx - hw, ty); c.lineTo(tx + hw, ty); c.lineTo(floor[0] + fw, floor[1]); c.lineTo(floor[0] - fw, floor[1]); c.closePath();
    const g = c.createLinearGradient(0, ty, 0, floor[1]);
    g.addColorStop(0, rgba(col, al * a)); g.addColorStop(1, rgba(col, al * a * 0.55));
    c.fillStyle = g; c.fill(); c.restore();
  };
  screenSpace();
  band(ctx, 0.36); band(gctx, 0.14);
  // beads of light riding down it
  for (let i = 0; i < 8; i++) {
    const u = (t * 1.1 + i / 8) % 1, y = lerp(ty + 10, floor[1] - 30, u), w = lerp(hw, fw, u);
    const x = lerp(tx, floor[0], u) + ((i % 3) - 1) * w * 0.5;
    circle(ctx, x, y, 9, rgba('#FFFFFF', 0.9 * a)); softDot(gctx, x, y, 28, col, 0.5 * a);
  }
}
// the whole inside: V the eye's view, o: {seers: [6 states], beam: {col, a}, card: [x, y, hw], label: 0..1, t}
function seInside(t, V, o = {}) {
  screenSpace();
  // the dark room round the ball (we are inside his head)
  const bg = ctx.createRadialGradient(V.x, V.y, 100, V.x, V.y, 1300);
  bg.addColorStop(0, '#3A1730'); bg.addColorStop(1, '#12060F');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  seEyeOn(V, () => eyeDraw(t, { noSkin: true, noNerve: true, beam: 0, dark: 0.15 }));
  if (o.beam) seBeam(V, o.card || [540, 790, 70], o.beam.col, o.beam.a, t);
  screenSpace();
  (o.seers || []).forEach((S, i) => seSeer(ctx, gctx, seSpot(V, i), S, t, i, V.s));
}
