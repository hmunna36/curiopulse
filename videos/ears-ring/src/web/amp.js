// Why Do Your Ears RING After a Concert? Short: the brain as a character (dizzy-spin's dzBrain, copied as erBrain) and
// its amplifier: a scope that shows what comes up from the ears, a row of level lamps, a big VOLUME knob that goes to 11,
// and a speaker that hisses when the knob is all the way up. Drawn at the current transform (the amp's middle at the
// origin, s = units per amp unit), so it works in the world (inside his glass head) and in screen space.
//   erAmp(c, s, t, o)          o: {knob 0..11, level 0..1, wave 0..1 (what arrives), noise 0..1 (static), ring 0..1
//                              (one thin line), shake, small (skip the fine detail), tapK (a tap on the glass)}
//   erKnobPt(x, y, s, val, f)  where the knob's pointer is (f = 0..1 of the knob's radius), with the amp at (x, y)
'use strict';

const ERK = { x: 100, y: -70, R: 42 };          // the knob, in amp units
const erKnobAng = (val) => 2.356 + clamp(val, 0, 11.4) * 0.4712;   // 0 at seven o'clock, 10 at five, 11 past it
function erKnobPt(x, y, s, val, f = 0.6) { const a = erKnobAng(val); return [x + (ERK.x + Math.cos(a) * ERK.R * f) * s, y + (ERK.y + Math.sin(a) * ERK.R * f) * s]; }
function erAmp(c, s, t, o = {}) {
  const lvl = clamp(o.level || 0), nz = clamp(o.noise || 0), rg = clamp(o.ring || 0), wv = clamp(o.wave === undefined ? 0.5 : o.wave);
  const sh = o.shake || 0, jx = sh * 4 * Math.sin(t * 71), jy = sh * 3 * Math.sin(t * 59 + 1);
  c.save(); c.scale(s, s); c.translate(jx, jy);
  rrect(c, -190, -150, 380, 300, 28); c.fillStyle = '#1E1A34'; c.fill();
  rrect(c, -180, -140, 360, 280, 22); c.fillStyle = '#2E2A54'; c.fill();
  // the scope
  rrect(c, -166, -128, 196, 128, 14); c.fillStyle = '#071219'; c.fill();
  paint(() => {
    c.save(); rrect(c, -166, -128, 196, 128, 14); c.clip();
    if (!o.small) for (let i = 1; i < 6; i++) { line(c, -166 + i * 33, -128, -166 + i * 33, 0, 1.5, 'rgba(90,200,180,0.18)'); line(c, -166, -128 + i * 21, 30, -128 + i * 21, 1.5, 'rgba(90,200,180,0.18)'); }
    const P = [], yc = -64;
    for (let i = 0; i <= 60; i++) {
      const u = i / 60, x = -160 + u * 184;
      let y = yc + wv * 44 * Math.sin(u * 14 - t * 9) * (0.6 + 0.4 * Math.sin(u * 5 + t * 2));
      if (nz > 0.01) y = lerp(y, yc + (hash(i * 7.3 + Math.floor(t * 30) * 13.1) - 0.5) * 110, nz);
      if (rg > 0.01) y = lerp(y, yc + 22 * Math.sin(u * 62 - t * 40), rg);
      P.push([x, clamp(y, -124, -4)]);
    }
    const col = rg > 0.5 ? '#FFE27A' : nz > 0.5 ? '#E6E6FF' : '#5CFFC8';
    poly(c, P, o.small ? 7 : 5, col);
    c.restore();
  });
  // the level lamps under the scope
  paint(() => { for (let i = 0; i < 8; i++) { const on = lvl * 8.2 > i; rrect(c, -164 + i * 24.5, 12, 18, 22, 5); c.fillStyle = on ? mixH('#4DFFB4', '#FF4D5E', i / 7) : '#141833'; c.fill(); } });
  // the knob and its scale
  paint(() => {
    for (let i = 0; i <= 11; i++) {
      const a = erKnobAng(i), red = i >= 10, r0 = ERK.R + 8, r1 = ERK.R + (i % 5 === 0 || i === 11 ? 20 : 14);
      line(c, ERK.x + Math.cos(a) * r0, ERK.y + Math.sin(a) * r0, ERK.x + Math.cos(a) * r1, ERK.y + Math.sin(a) * r1, i === 11 ? 6 : 4, i === 11 ? '#FF4D5E' : red ? '#FF9AA6' : '#C9D4FF');
    }
    if (!o.small) {
      c.font = '900 17px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle';
      for (const [v, txt] of [[0, '0'], [5, '5'], [10, '10']]) { const a = erKnobAng(v); c.fillStyle = '#C9D4FF'; c.fillText(txt, ERK.x + Math.cos(a) * (ERK.R + 34), ERK.y + Math.sin(a) * (ERK.R + 34)); }
    }
    const a11 = erKnobAng(11); c.font = '900 ' + (o.small ? 30 : 26) + 'px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#FF4D5E';
    c.fillText('11', ERK.x + Math.cos(a11) * (ERK.R + 38), ERK.y + Math.sin(a11) * (ERK.R + 38));
  });
  const ka = erKnobAng(o.knob === undefined ? 4 : o.knob);
  circle(c, ERK.x, ERK.y, ERK.R + 4, '#10132A'); circle(c, ERK.x, ERK.y, ERK.R, '#E7EBF8');
  paint(() => {
    circle(c, ERK.x, ERK.y, ERK.R * 0.66, '#C6CDE6');
    for (let i = 0; i < 12; i++) { const a = ka + i * 0.5236; line(c, ERK.x + Math.cos(a) * ERK.R * 0.86, ERK.y + Math.sin(a) * ERK.R * 0.86, ERK.x + Math.cos(a) * ERK.R * 0.98, ERK.y + Math.sin(a) * ERK.R * 0.98, 3, '#AEB6D4'); }
    line(c, ERK.x + Math.cos(ka) * 10, ERK.y + Math.sin(ka) * 10, ERK.x + Math.cos(ka) * ERK.R * 0.9, ERK.y + Math.sin(ka) * ERK.R * 0.9, 8, '#FF4D5E');
    if (!o.small) { c.font = '900 15px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#9FB4FF'; c.fillText('VOLUME', ERK.x, ERK.y + ERK.R + 50); }
  });
  // the speaker grille
  rrect(c, -176, 46, 352, 88, 14); c.fillStyle = '#151126'; c.fill();
  paint(() => {
    if (!o.small) for (let x = -170; x < 176; x += 9) line(c, x, 50, x, 130, 2, 'rgba(255,255,255,0.04)');
    const buzz = nz * 3 * Math.sin(t * 90) + lvl * 1.5 * Math.sin(t * 40);
    circle(c, 0, 90, 34 + buzz, '#262040'); circle(c, 0, 90, 12 + buzz * 0.5, '#3A3260');
  });
  c.restore();
}
// the glow of the amp's screen and its speaker, drawn into the glow layer at (x, y) with scale s (same space as ctx)
function erAmpGlow(x, y, s, t, o = {}) {
  const nz = clamp(o.noise || 0), rg = clamp(o.ring || 0), lvl = clamp(o.level || 0);
  softDot(gctx, x + (-68) * s, y + (-64) * s, 120 * s, rg > 0.5 ? '#FFD447' : '#3CFFC0', 0.35 + 0.35 * Math.max(nz, rg));
  for (let i = 0; i < 8; i++) if (lvl * 8.2 > i) softDot(gctx, x + (-155 + i * 24.5) * s, y + 23 * s, 22 * s, mixH('#4DFFB4', '#FF4D5E', i / 7), 0.6);
  if (nz > 0.02) {   // fizz off the grille
    for (let i = 0; i < 18; i++) {
      const u = (t * 1.3 + hash(i * 3.7)) % 1, ax = (hash(i * 9.1) - 0.5) * 300, px = x + ax * s * (1 + u * 0.6), py = y + (90 - u * 200) * s;
      softDot(gctx, px, py, 10 * s, '#E6E6FF', 0.8 * nz * (1 - u));
      circle(ctx, px, py, 3.2 * s, rgba('#FFFFFF', 0.85 * nz * (1 - u)));
    }
  }
}

function erBrain(c, x, y, s, t, o = {}) {
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
