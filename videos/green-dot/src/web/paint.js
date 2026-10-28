// The brain paints the boring dots over (blind-spot's brain and screen, brainpaint.js, re-done for this test): the
// brain sits under its WHAT YOU SEE screen, which shows the viewer's own test (the twelve pink dots, the cross). Blurry
// things that never change bore it; it stamps them BORING, picks up a paint roller loaded with the screen's own grey and
// rolls each dot away, one after another, until only the cross is left. Screen space.
'use strict';

const PB = { X: 548, Y: 1450, S: 1.3, SCR: [175, 452, 730, 506], CX: 540, CY: 705, R: 178 };
// o: {painted: [12] 0..1 (each dot rolled over), roller: 0..1 (it holds the roller up at the screen), at: [x, y] the
// roller's spot on the screen, mood, look, yawn 0..1, stampK, t}
function pbScene(t, o = {}) {
  const c = ctx, g = gctx;
  screenSpace();
  // the dark room (the brain's office at the end of the cable)
  const bg = c.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#14183A'); bg.addColorStop(1, '#070915');
  c.fillStyle = bg; c.fillRect(0, 0, W, H);
  softDot(g, PB.CX, PB.CY, 620, '#8FA8FF', 0.12);
  // the cable coming in from the eye, bottom left
  const P0 = [-40, 1700], P1 = [140, 1690], P2 = [250, 1630], P3 = [330, 1560];
  for (const [w, col] of [[46, '#C9792F'], [32, '#F2A65A']]) {
    c.beginPath(); c.moveTo(P0[0], P0[1]); c.bezierCurveTo(P1[0], P1[1], P2[0], P2[1], P3[0], P3[1]); c.lineWidth = w; c.lineCap = 'round'; c.strokeStyle = col; c.stroke();
  }
  // the screen
  const [sx, sy, sw, sh] = PB.SCR;
  rrect(c, sx - 18, sy - 18, sw + 36, sh + 36, 28); c.fillStyle = '#2A3470'; c.fill();
  line(c, sx + sw / 2, sy + sh + 18, sx + sw / 2, sy + sh + 70, 20, '#2A3470');
  paint(() => {
    c.save(); rrect(c, sx, sy, sw, sh, 14); c.clip();
    c.fillStyle = GD_GREY; c.fillRect(sx, sy, sw, sh);
    // the dots that are left, then the grey paint over the rolled ones (a roller's stripe, slightly lighter, wet)
    const left = (o.painted || []).map((p) => 1 - clamp(p * 1.25));
    gdRing(c, PB.CX, PB.CY, PB.R, -1, { mult: left.length ? left : undefined });
    const r = PB.R * GD.DOTR;
    (o.painted || []).forEach((p, i) => {
      if (p <= 0.001) return;
      const x = PB.CX + Math.cos(gdAng(i)) * PB.R, y = PB.CY + Math.sin(gdAng(i)) * PB.R, k = clamp(p);
      const x0 = x - r * 1.35, x1 = lerp(x0, x + r * 1.35, k);
      rrect(c, x0, y - r * 1.1, x1 - x0, r * 2.2, r * 0.5); c.fillStyle = '#C9C9C9'; c.fill();
      if (k > 0.98) { c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(x - r * 1.2, y - r * 0.9, r * 2.4, 6); }
    });
    c.restore();
    c.font = '900 34px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(170,190,255,0.85)';
    c.fillText('WHAT YOU SEE', sx + sw / 2, sy - 52);
  });
  // the brain, and its roller
  const ro = clamp(o.roller || 0), X = PB.X, Y = PB.Y, S = PB.S;
  const at = o.at || [PB.CX, PB.CY];
  const rest = [176, 118];
  const up = [(at[0] + 40 - X) / S, (at[1] + 150 - Y) / S];
  const hand = [lerp(rest[0], up[0], ro), lerp(rest[1], up[1], ro)];
  const yawn = clamp(o.yawn || 0);
  actor(() => erBrain(c, X, Y, S, t, { mood: o.mood || 'calm', look: o.look || [0, -1], armL: [-176, 118], armR: hand, shut: 0.55 * yawn }));
  if (yawn > 0.02) paint(() => { ellipse(c, X - 2 * S, Y + 64 * S, 16 * S * yawn + 4, 22 * S * yawn + 3, '#5A1522'); });
  if (ro > 0.01) {
    // the roller: a thick handle from the hand up to a grey drum on the screen
    const hx = X + hand[0] * S, hy = Y + hand[1] * S, dx = at[0], dy = at[1] + 6;
    actor(() => {
      line(c, hx, hy, dx + 20, dy + 96, 18, '#C98A4A');
      line(c, dx + 20, dy + 96, dx + 20, dy + 46, 10, '#9AA0B0');
      line(c, dx - 70, dy + 46, dx + 20, dy + 46, 10, '#9AA0B0');
    });
    paint(() => {
      rrect(c, dx - 100, dy - 22, 200, 62, 28); c.fillStyle = '#CACACA'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#7E7E88'; c.stroke();
      for (let i = 0; i < 5; i++) line(c, dx - 80 + i * 40, dy - 14, dx - 80 + i * 40, dy + 32, 3, 'rgba(120,120,130,0.35)');
    });
  }
}
