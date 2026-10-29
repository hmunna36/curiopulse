// Why Does Your Mouth Water When You Imagine a LEMON? 🍋 Short: his brain as a character (after time-flies' tfBrain in
// mind.js: the same pink brain with arms and a face), with a bib, a chomp and a pucker.
//   lmBrain(c, x, y, s, t, o)   o: {look: [x, y] -1..1, mood: 'calm' | 'chomp' | 'pucker' | 'alarm' | 'smug' | 'grin',
//                               chomp 0..1 (how far its jaws are shut on the 'chomp' mood), bob, lean, armL / armR (hand
//                               targets in its own units), bib 0..1, held: fn(c) drawn between its hands (its own units),
//                               after its body and before its hands, so the hands hold it}
//   The brain's own units: its middle at (0, 0), about 420 wide and 330 tall; the stem below at y 96..170.
'use strict';

function lmBrain(c, x, y, s, t, o = {}) {
  const mood = o.mood || 'calm', look = o.look || [0, 0];
  const bob = (o.still ? 0 : 5 * Math.sin(t * 2.4)) + (o.bob || 0);
  c.save(); c.translate(x, y + bob); c.scale(s, s); c.rotate(o.lean || 0);
  const armPath = (sd, target) => {
    const sx = sd * 138, sy = 30, tx = target ? target[0] : sd * 176, ty = target ? target[1] : 118;
    const mx = (sx + tx) / 2 + sd * 22, my = (sy + ty) / 2 + 30;
    c.beginPath(); c.moveTo(sx, sy); c.quadraticCurveTo(mx, my, tx, ty); c.lineWidth = 17; c.lineCap = 'round'; c.strokeStyle = '#E0688E'; c.stroke();
    return [tx, ty];
  };
  const hand = (sd, P) => { circle(c, P[0], P[1], 21, '#FFA9C0'); circle(c, P[0] + sd * 12, P[1] - 14, 9, '#FFA9C0'); };
  rrect(c, -12, 96, 58, 74, 22); c.fillStyle = '#D9688A'; c.fill();                      // the stem
  const lumps = [[-150, 20, 62], [-126, -50, 66], [-64, -98, 70], [16, -112, 74], [92, -86, 68], [144, -26, 62], [150, 40, 56], [96, 84, 60], [10, 100, 66], [-84, 88, 62]];
  c.beginPath(); for (const [lx, ly, lr] of lumps) { c.moveTo(lx + lr, ly); c.arc(lx, ly, lr, 0, 7); } c.ellipse(0, 0, 150, 96, 0, 0, 7);
  c.fillStyle = '#FF93B0'; c.fill();
  // the bib: a white napkin tied under its face, a lemon on it
  const bk = clamp(o.bib || 0);
  if (bk > 0.02) {
    c.save(); c.translate(0, 70 + 30 * (1 - bk)); c.scale(1, bk);
    c.beginPath(); c.moveTo(-76, 0); c.lineTo(76, 0); c.quadraticCurveTo(82, 70, 0, 92); c.quadraticCurveTo(-82, 70, -76, 0); c.closePath();
    c.fillStyle = '#F6F4EE'; c.fill();
    paint(() => {
      c.beginPath(); c.moveTo(-76, 0); c.lineTo(76, 0); c.quadraticCurveTo(82, 70, 0, 92); c.quadraticCurveTo(-82, 70, -76, 0); c.closePath();
      c.lineWidth = 5; c.strokeStyle = '#7FB8E8'; c.setLineDash([10, 7]); c.stroke(); c.setLineDash([]);
      ellipse(c, 0, 44, 22, 16, '#F8D21C'); ellipse(c, -6, 39, 8, 5, 'rgba(255,248,170,0.95)');
      for (const sd of [-1, 1]) line(c, sd * 72, 2, sd * 104, -18, 6, '#F6F4EE');
    });
    c.restore();
  }
  paint(() => {
    c.lineWidth = 7; c.lineCap = 'round'; c.strokeStyle = 'rgba(176,60,104,0.55)';
    for (const [x0, y0, x1, y1, x2, y2] of [[-150, -24, -108, -66, -70, -26], [-56, -122, -20, -74, 22, -112], [40, -130, 84, -86, 128, -98], [-176, 44, -150, 78, -116, 60], [110, 96, 148, 76, 176, 30]]) {
      c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x1, y1, x2, y2); c.stroke();
    }
    // the face
    const lx = look[0] * 9, ly = look[1] * 7;
    const squeezed = mood === 'pucker' || (mood === 'chomp' && (o.chomp || 0) > 0.6);
    const ry = mood === 'alarm' ? 34 : mood === 'smug' ? 16 : 28;
    for (const ex of [-44, 38]) {
      if (squeezed) {                                      // eyes screwed shut: two chevrons
        const sd = ex < 0 ? -1 : 1;
        c.beginPath(); c.moveTo(ex - sd * 20, -10); c.lineTo(ex + sd * 14, 4); c.lineTo(ex - sd * 20, 18);
        c.lineWidth = 7; c.strokeStyle = '#7E2748'; c.lineJoin = 'round'; c.stroke();
        continue;
      }
      ellipse(c, ex, 4, 25, ry, '#FFFFFF'); c.lineWidth = 4; c.strokeStyle = '#7E2748'; c.beginPath(); c.ellipse(ex, 4, 25, ry, 0, 0, 7); c.stroke();
      circle(c, ex + lx, 4 + ly * (ry / 28), mood === 'alarm' ? 8 : 10.5, '#231028'); circle(c, ex + lx - 3, 1 + ly * (ry / 28), 3.4, '#FFFFFF');
    }
    // brows
    const bt = mood === 'alarm' ? 0.8 : mood === 'pucker' ? 1 : mood === 'smug' ? -0.7 : 0;
    const by = mood === 'alarm' ? -48 : mood === 'pucker' ? -44 : -38;
    line(c, -70, by + bt * 10, -24, by - bt * 8, 9, '#7E2748'); line(c, 16, by - bt * 8, 64, by + bt * 10, 9, '#7E2748');
    // the mouth
    if (mood === 'chomp') {
      const k = clamp(o.chomp || 0), h = lerp(46, 8, k);
      c.beginPath(); c.ellipse(-2, 62, 34, h / 2 + 4, 0, 0, 7); c.fillStyle = '#5A1522'; c.fill();
      c.save(); c.beginPath(); c.ellipse(-2, 62, 34, h / 2 + 4, 0, 0, 7); c.clip();
      c.fillStyle = '#FFFFFF'; for (let i = -3; i <= 3; i++) { c.fillRect(-2 + i * 9.6 - 4, 62 - h / 2 - 6, 8, 10); c.fillRect(-2 + i * 9.6 - 4, 62 + h / 2 - 4, 8, 10); }
      c.restore();
    } else if (mood === 'pucker') {
      ellipse(c, -2, 64, 11, 9, '#5A1522');
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; line(c, -2 + Math.cos(a) * 15, 64 + Math.sin(a) * 13, -2 + Math.cos(a) * 22, 64 + Math.sin(a) * 19, 3, 'rgba(126,39,72,0.6)'); }
    } else if (mood === 'alarm') {
      ellipse(c, -2, 66, 19, 17, '#5A1522');
    } else if (mood === 'grin' || mood === 'smug') {
      c.beginPath(); c.moveTo(-28, 54); c.quadraticCurveTo(-2, mood === 'smug' ? 74 : 84, 24, 54); c.closePath(); c.fillStyle = '#5A1522'; c.fill();
    } else { c.beginPath(); c.moveTo(-16, 58); c.quadraticCurveTo(0, 68, 16, 58); c.lineWidth = 6; c.strokeStyle = '#5A1522'; c.stroke(); }
  });
  // the arms, what it holds, then the hands over it
  const PL = armPath(-1, o.armL), PR = armPath(1, o.armR);
  if (o.held) o.held(c);
  hand(-1, PL); hand(1, PR);
  c.restore();
}
