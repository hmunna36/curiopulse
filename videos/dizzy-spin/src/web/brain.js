// The brain as a character (time-flies' tfBrain, copied as dzBrain with a 'dizzy' face: spiral eyes, a wobbly mouth),
// a megaphone, and two small characters who shout into it: a hair cell from the ear (a pink ball with a tuft of hairs)
// and an eyeball. All in their own units at (x, y, s) on the context given (world or screen, as the caller set it).
'use strict';

// o: {look: [x, y] -1..1, mood: 'calm' | 'worried' | 'squint' | 'think' | 'grin' | 'wow' | 'dizzy' | 'smug', lean, bob,
//  armL / armR: hand targets in the brain's own units, noArms, spin: 0..1 how dizzy (the spiral turns), still}
function dzBrain(c, x, y, s, t, o = {}) {
  const mood = o.mood || 'calm', look = o.look || [0, 0];
  const bob = (o.still ? 0 : 5 * Math.sin(t * loopW(2.4))) + (o.bob || 0);
  c.save(); c.translate(x, y + bob); c.scale(s, s); c.rotate(o.lean || 0);
  const arm = (sd, target) => {
    const sx = sd * 138, sy = 30, tx = target ? target[0] : sd * 176, ty = target ? target[1] : 118;
    const mx = (sx + tx) / 2 + sd * 22, my = (sy + ty) / 2 + 30;
    c.beginPath(); c.moveTo(sx, sy); c.quadraticCurveTo(mx, my, tx, ty); c.lineWidth = 17; c.lineCap = 'round'; c.strokeStyle = '#E0688E'; c.stroke();
    circle(c, tx, ty, 21, '#FFA9C0'); circle(c, tx + sd * 12, ty - 14, 9, '#FFA9C0');
  };
  if (!o.noArms) { arm(-1, o.armL); arm(1, o.armR); }
  rrect(c, -12, 96, 58, 74, 22); c.fillStyle = '#D9688A'; c.fill();
  const lumps = [[-150, 20, 62], [-126, -50, 66], [-64, -98, 70], [16, -112, 74], [92, -86, 68], [144, -26, 62], [150, 40, 56], [96, 84, 60], [10, 100, 66], [-84, 88, 62]];
  c.beginPath(); for (const [lx, ly, lr] of lumps) { c.moveTo(lx + lr, ly); c.arc(lx, ly, lr, 0, 7); } c.ellipse(0, 0, 150, 96, 0, 0, 7);
  c.fillStyle = '#FF93B0'; c.fill();
  paint(() => {
    c.lineWidth = 7; c.lineCap = 'round'; c.strokeStyle = 'rgba(176,60,104,0.55)';
    for (const [x0, y0, x1, y1, x2, y2] of [[-150, -24, -108, -66, -70, -26], [-56, -122, -20, -74, 22, -112], [40, -130, 84, -86, 128, -98], [-176, 44, -150, 78, -116, 60], [110, 96, 148, 76, 176, 30], [-30, 122, 6, 100, 44, 126]]) {
      c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x1, y1, x2, y2); c.stroke();
    }
    const lx = look[0] * 9, ly = look[1] * 7;
    for (const ex of [-44, 38]) {
      if (mood === 'dizzy') {   // a spiral in each eye, turning
        ellipse(c, ex, 4, 27, 30, '#FFFFFF'); c.lineWidth = 4; c.strokeStyle = '#7E2748'; c.beginPath(); c.ellipse(ex, 4, 27, 30, 0, 0, 7); c.stroke();
        c.beginPath();
        for (let i = 0; i <= 40; i++) { const a = i * 0.42 + t * 9 * (o.spin === undefined ? 1 : o.spin) * (ex < 0 ? 1 : -1), r = 1 + i * 0.52; c[i ? 'lineTo' : 'moveTo'](ex + Math.cos(a) * r, 4 + Math.sin(a) * r * 1.1); }
        c.lineWidth = 4.2; c.strokeStyle = '#231028'; c.stroke();
        continue;
      }
      const ry = mood === 'squint' || mood === 'smug' ? 14 : mood === 'worried' || mood === 'wow' ? 34 : mood === 'grin' ? 24 : 28;
      ellipse(c, ex, 4, 25, ry, '#FFFFFF'); c.lineWidth = 4; c.strokeStyle = '#7E2748'; c.beginPath(); c.ellipse(ex, 4, 25, ry, 0, 0, 7); c.stroke();
      circle(c, ex + lx, 4 + ly * (ry / 28), mood === 'worried' || mood === 'wow' ? 8 : 10.5, '#231028'); circle(c, ex + lx - 3, 1 + ly * (ry / 28), 3.4, '#FFFFFF');
      if (mood === 'smug') { c.fillStyle = '#FF93B0'; c.fillRect(ex - 27, -12, 54, 12); line(c, ex - 25, -2, ex + 25, -2, 4, '#7E2748'); }
    }
    const bt = mood === 'worried' || mood === 'dizzy' ? 1 : mood === 'squint' ? -0.8 : mood === 'think' ? 0.5 : mood === 'smug' ? -0.4 : 0;
    const by = mood === 'worried' || mood === 'wow' || mood === 'dizzy' ? -46 : mood === 'squint' ? -24 : -38;
    line(c, -70, by + bt * 10, -24, by - bt * 8 + (mood === 'think' ? -10 : 0), 9, '#7E2748'); line(c, 16, by - bt * 8, 64, by + bt * 10, 9, '#7E2748');
    if (mood === 'worried' || mood === 'wow') ellipse(c, -2, 64, mood === 'wow' ? 19 : 15, mood === 'wow' ? 17 : 12, '#5A1522');
    else if (mood === 'dizzy') { c.beginPath(); c.moveTo(-26, 62); c.bezierCurveTo(-14, 50, -8, 74, 0, 62); c.bezierCurveTo(8, 50, 14, 74, 26, 62); c.lineWidth = 6; c.strokeStyle = '#5A1522'; c.stroke(); }
    else if (mood === 'grin' || mood === 'smug') { c.beginPath(); c.moveTo(-28, 54); c.quadraticCurveTo(-2, mood === 'smug' ? 74 : 84, 24, 54); c.closePath(); c.fillStyle = '#5A1522'; c.fill(); }
    else if (mood === 'squint' || mood === 'think') { c.beginPath(); c.moveTo(-18, 62); c.quadraticCurveTo(0, 54, 18, 64); c.lineWidth = 6; c.strokeStyle = '#5A1522'; c.stroke(); }
    else { c.beginPath(); c.moveTo(-16, 58); c.quadraticCurveTo(0, 68, 16, 58); c.lineWidth = 6; c.strokeStyle = '#5A1522'; c.stroke(); }
  });
  c.restore();
}
// little stars going round a head (screen or world; k = how many are out)
function dzStars(c, g, x, y, rx, ry, t, k, n = 5) {
  if (k <= 0.01) return;
  for (let i = 0; i < n; i++) {
    const a = t * 4.2 + (i / n) * Math.PI * 2, px = x + Math.cos(a) * rx, py = y + Math.sin(a) * ry, front = Math.sin(a) > 0;
    const r = (front ? 15 : 10) * clamp(k * n - i);
    if (r <= 0.5) continue;
    c.save(); c.translate(px, py); c.rotate(t * 3 + i);
    c.beginPath(); for (let j = 0; j < 10; j++) { const aa = (j / 10) * Math.PI * 2 - Math.PI / 2, rr = j % 2 ? r * 0.45 : r; c[j ? 'lineTo' : 'moveTo'](Math.cos(aa) * rr, Math.sin(aa) * rr); }
    c.closePath(); c.fillStyle = '#FFE066'; c.fill();
    c.restore();
    softDot(g, px, py, r * 2.4, '#FFD447', 0.5);
  }
}
// a megaphone (its mouthpiece at the origin, pointing along +x); k = pop
function dzMegaphone(c, s, k = 1) {
  if (k <= 0.01) return;
  c.save(); c.scale(s * k, s * k);
  rrect(c, -8, -9, 22, 18, 6); c.fillStyle = '#2A2A3A'; c.fill();
  c.beginPath(); c.moveTo(12, -12); c.lineTo(78, -40); c.lineTo(78, 40); c.lineTo(12, 12); c.closePath(); c.fillStyle = '#FF5A3C'; c.fill();
  ellipse(c, 78, 0, 9, 40, '#C93A22');
  paint(() => { line(c, 30, -12, 64, -28, 4, 'rgba(255,255,255,0.55)'); });
  rrect(c, 8, 10, 12, 26, 5); c.fillStyle = '#2A2A3A'; c.fill();
  c.restore();
}
// a hair cell from the ear: a pink ball with a tuft of hairs, a face, little arms; it holds a megaphone at angle ang.
// o: {mood: 'shout' | 'calm' | 'panic', ang, mega 0..1, bend (the tuft)}
function dzCellGuy(c, x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const mood = o.mood || 'calm', jig = mood === 'shout' ? 2.5 * Math.sin(t * 46) : 0;
  c.translate(jig, 0);
  // the tuft
  paint(() => {
    for (let j = -3; j <= 3; j++) {
      const lean = (o.bend || 0.6) * 26 + 3 * Math.sin(t * 9 + j);
      c.beginPath(); c.moveTo(j * 6, -40); c.quadraticCurveTo(j * 6 + lean * 0.3, -70, j * 7 + lean, -96 + Math.abs(j) * 8);
      c.lineWidth = 5; c.lineCap = 'round'; c.strokeStyle = '#3E7C6E'; c.stroke();
    }
  });
  circle(c, 0, 0, 44, '#FFD3E2');
  paint(() => {
    for (const ex of [-15, 15]) {
      const ry = mood === 'panic' ? 13 : 11;
      ellipse(c, ex, -8, 10, ry, '#FFFFFF'); circle(c, ex + 2, -7, 5, '#1A0E24');
    }
    line(c, -26, -26, -6, mood === 'shout' ? -20 : -24, 5, '#7E2748'); line(c, 6, mood === 'shout' ? -20 : -24, 26, -26, 5, '#7E2748');
    if (mood === 'shout' || mood === 'panic') { ellipse(c, 0, 18, 12, 13, '#5A1522'); ellipse(c, 0, 24, 7, 4, '#E0616C'); }
    else { c.beginPath(); c.moveTo(-10, 16); c.quadraticCurveTo(0, 23, 10, 16); c.lineWidth = 4; c.strokeStyle = '#5A1522'; c.stroke(); }
  });
  // arms and the megaphone
  const a = o.ang === undefined ? -0.6 : o.ang, mk = E.outBack(clamp(o.mega === undefined ? 1 : o.mega), 2);
  line(c, 30, 20, 40, 30, 8, '#FFB8CF');
  c.save(); c.translate(30, 16); c.rotate(a); if (Math.cos(a) < 0) c.scale(1, -1); dzMegaphone(c, 0.9, mk); c.restore();
  c.restore();
}
// an eyeball with little legs and arms: o: {mood: 'nope' | 'calm' | 'side', ang, mega 0..1, look}
function dzEyeGuy(c, x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const mood = o.mood || 'calm', jig = mood === 'nope' ? 2 * Math.sin(t * 40) : 0;
  c.translate(jig, 0);
  line(c, -16, 40, -20, 74, 8, '#E8E2F0'); line(c, 16, 40, 20, 74, 8, '#E8E2F0');
  ellipse(c, -24, 76, 14, 7, '#3A3550'); ellipse(c, 24, 76, 14, 7, '#3A3550');
  circle(c, 0, 0, 48, '#F7F4FF');
  paint(() => {
    for (let i = 0; i < 4; i++) { const a = -2.4 + i * 0.5; line(c, Math.cos(a) * 30, Math.sin(a) * 30, Math.cos(a) * 46, Math.sin(a) * 46, 2, 'rgba(220,60,80,0.45)'); }
    const lk = o.look || [0.3, -0.1];
    circle(c, lk[0] * 10, lk[1] * 10, 22, '#3F9E6A'); circle(c, lk[0] * 10, lk[1] * 10, 11, '#0E1430'); circle(c, lk[0] * 10 - 6, lk[1] * 10 - 7, 4.5, '#FFFFFF');
    if (mood === 'nope') { c.fillStyle = '#E9E2F6'; c.beginPath(); c.ellipse(0, 0, 49, 49, 0, Math.PI * 1.06, Math.PI * 1.94); c.fill(); line(c, -44, -16, 44, -16, 5, '#7E7090'); }
  });
  const a = o.ang === undefined ? -2.5 : o.ang, mk = E.outBack(clamp(o.mega === undefined ? 1 : o.mega), 2);
  line(c, -34, 22, -44, 32, 8, '#E8E2F0');
  c.save(); c.translate(-36, 16); c.rotate(a); if (Math.cos(a) < 0) c.scale(1, -1); dzMegaphone(c, 0.9, mk); c.restore();
  c.restore();
}
