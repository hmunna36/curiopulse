// Why Do Your Ears RING After a Concert? Short: the chicken. A white hen in profile, facing right, at (x, y) = where her
// feet stand, s = size (1: about 330 units tall). Drawn at the current transform (world or screen).
//   erChicken(c, g, x, y, s, t, o)   o: {mood: 'deadpan' | 'smug' | 'rock' | 'wow', bang 0..1 (head thrown down),
//                                    look [x, y], blink, wing 0..1 (the wing lifts), shades 0..1 (sunglasses), beakOpen}
'use strict';

function erChicken(c, g, x, y, s, t, o = {}) {
  const mood = o.mood || 'deadpan', bang = clamp(o.bang || 0), wing = clamp(o.wing || 0);
  c.save(); c.translate(x, y); c.scale(s, s);
  actor(() => {
    // legs and toes
    for (const [lx, d] of [[-34, -1], [26, 1]]) {
      line(c, lx, -120, lx + d * 4, -12, 11, '#F09A2A');
      for (const a of [-0.5, 0, 0.5]) line(c, lx + d * 4, -10, lx + d * 4 + Math.sin(a + 0.4) * 34, -10 + Math.cos(a + 0.4) * 6, 8, '#F09A2A');
    }
    // the tail: a fan of feathers up and back
    for (let i = 0; i < 4; i++) {
      c.save(); c.translate(-118, -232); c.rotate(-0.9 - i * 0.24 + 0.04 * Math.sin(t * 3 + i));
      ellipse(c, 0, -46, 26, 62, i % 2 ? '#F2EEE6' : '#FFFFFF');
      c.restore();
    }
    // the body
    c.beginPath(); c.ellipse(0, -200, 142, 104, -0.12, 0, 7); c.fillStyle = '#FFFFFF'; c.fill();
  });
  // the wing (a separate shape on top of the body, a shade darker)
  actor(() => {
    c.save(); c.translate(-6, -196); c.rotate(-0.15 - 0.9 * wing);
    c.beginPath(); c.ellipse(-10, 0, 92, 54, 0.1, 0, 7); c.fillStyle = '#ECE6DA'; c.fill();
    c.restore();
  });
  paint(() => {
    c.save(); c.translate(-6, -196); c.rotate(-0.15 - 0.9 * wing);
    for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(-40 + i * 34, 10, 30, 0.2, 2.2); c.lineWidth = 4; c.strokeStyle = 'rgba(160,150,135,0.55)'; c.stroke(); }
    c.restore();
  });
  // the neck and head, thrown forward and down on a bang (about the base of the neck)
  c.save(); c.translate(86, -262); c.rotate(0.95 * bang);
  actor(() => {
    c.beginPath(); c.moveTo(-40, 30); c.quadraticCurveTo(-30, -60, 0, -90); c.lineTo(52, -70); c.quadraticCurveTo(50, 0, 40, 40); c.closePath(); c.fillStyle = '#FFFFFF'; c.fill();
    circle(c, 18, -112, 66, '#FFFFFF');
    // the comb: three red lobes
    for (const [cx, cy, r] of [[-14, -170, 22], [12, -184, 26], [40, -172, 21]]) circle(c, cx, cy, r, '#E8323C');
    // beak and wattle
    c.beginPath(); c.moveTo(74, -126); c.lineTo(122 + 6 * (o.beakOpen || 0), -110); c.lineTo(76, -96); c.closePath(); c.fillStyle = '#FFB830'; c.fill();
    if ((o.beakOpen || 0) > 0.05) { c.beginPath(); c.moveTo(76, -100); c.lineTo(114, -88 + 10 * o.beakOpen); c.lineTo(74, -88); c.closePath(); c.fillStyle = '#F09A2A'; c.fill(); }
    ellipse(c, 70, -70, 16, 24, '#E8323C');
  });
  paint(() => {
    // the eye: big, round, with a lid that sits low when she is not impressed
    const lid = mood === 'deadpan' ? 0.5 : mood === 'smug' ? 0.42 : mood === 'rock' ? 0.0 : 0, bl = clamp(o.blink || 0);
    const ex = 34, ey = -122, lk = o.look || [0.4, 0];
    circle(c, ex, ey, 22, '#FFFFFF'); c.beginPath(); c.arc(ex, ey, 22, 0, 7); c.lineWidth = 3.5; c.strokeStyle = '#2A1A14'; c.stroke();
    circle(c, ex + lk[0] * 8, ey + lk[1] * 8, mood === 'wow' ? 8 : 10, '#15132A'); circle(c, ex + lk[0] * 8 - 3, ey + lk[1] * 8 - 4, 3.2, '#FFFFFF');
    const L = Math.max(lid, bl);
    if (L > 0.02) { c.save(); c.beginPath(); c.arc(ex, ey, 23, 0, 7); c.clip(); c.fillStyle = '#F2EEE6'; c.fillRect(ex - 26, ey - 26, 52, 52 * L); c.restore(); line(c, ex - 22, ey - 23 + 46 * L, ex + 22, ey - 23 + 46 * L, 4, '#2A1A14'); }
    if (mood === 'smug' || mood === 'deadpan') line(c, ex - 22, ey - 34 + (mood === 'smug' ? -4 : 2), ex + 20, ey - 30 + (mood === 'smug' ? 4 : 0), 5, '#5A3A2A');
    if ((o.shades || 0) > 0.02) {
      const k = E.outBack(clamp(o.shades), 2);
      c.save(); c.translate(ex + 4, ey - 2); c.scale(k, k); rrect(c, -34, -16, 70, 32, 12); c.fillStyle = '#0B0B18'; c.fill(); line(c, -34, -8, -70, -14, 5, '#0B0B18');
      line(c, -16, -8, 4, -8, 4, 'rgba(255,255,255,0.35)'); c.restore();
    }
  });
  c.restore();
  c.restore();
  void g;
}
