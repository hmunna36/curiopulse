// What If You Went to Space WITHOUT a Suit? (long-form): inside him.
// - an air sac of the lung up close, with a blood vessel along it: red cells carry cyan oxygen beads; with no air in the
//   sac the beads leave the cells, cross into the empty sac and stream away (the oxygen pouring OUT, the wrong way);
// - his head and neck as an x-ray in profile: a vessel from the chest up the neck to the brain (never-sleep's city of
//   lights); the oxygen-poor blood climbs it as a dark front, and when it arrives the lights go out, patch by patch;
// - his gut as an x-ray balloon that swells; a heart that slows.
// Screen space throughout.
'use strict';

// ---------------------------------------------------------------- the air sac and its blood vessel
// o: {out 0..1 (how much the oxygen is leaving), empty 0..1 (the sac goes dark: no air), z (zoom about the middle), label k}
function alveolus(t, o = {}) {
  const c = ctx, out = o.out || 0, empty = o.empty || 0;
  const bg = c.createRadialGradient(960, 500, 50, 960, 540, 1200); bg.addColorStop(0, '#2A0C2C'); bg.addColorStop(1, '#08020E');
  c.fillStyle = bg; c.fillRect(0, 0, W, H);
  const z = o.z || 1;
  c.save(); c.translate(960, 540); c.scale(z, z); c.translate(-960, -540);
  // the sac: a big round bubble of thin pink tissue (upper half); inside: air (pale) or nothing (dark)
  const sx = 960, sy = 330, sr = 360;
  const sg = c.createRadialGradient(sx - 80, sy - 120, 30, sx, sy, sr);
  sg.addColorStop(0, mixHex('#CFE8FF', '#0A0818', empty)); sg.addColorStop(1, mixHex('#8EB8E8', '#05040C', empty));
  c.fillStyle = sg; c.beginPath(); c.arc(sx, sy, sr, 0, 7); c.fill();
  c.lineWidth = 26; c.strokeStyle = '#E888A8'; c.stroke(); c.lineWidth = 8; c.strokeStyle = '#FFB8CC'; c.stroke();
  if (empty > 0.3) { c.font = '400 72px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = rgba('#8A90B8', clamp((empty - 0.3) / 0.4)); c.fillText('NO AIR', sx, sy - 140); }
  // a few air molecules while there is air (they drift out as it empties)
  for (let i = 0; i < 18; i++) { const a = hash(i * 3) * 6.283, d = sr * 0.8 * Math.sqrt(hash(i * 5)), x = sx + Math.cos(a + t * 0.3) * d + empty * 700 * hash(i), y = sy + Math.sin(a + t * 0.3) * d * 0.8; if (empty < 0.98) circle(c, x, y, 9, rgba('#FFFFFF', 0.6 * (1 - empty))); }
  // the vessel along the bottom of the sac
  const vy = 760, vh = 220;
  const pl = c.createLinearGradient(0, vy - vh / 2, 0, vy + vh / 2); pl.addColorStop(0, '#6A1430'); pl.addColorStop(1, '#3A0818');
  c.fillStyle = pl; c.fillRect(-100, vy - vh / 2, W + 200, vh);
  line(c, -100, vy - vh / 2, W + 100, vy - vh / 2, 14, '#E888A8'); line(c, -100, vy + vh / 2, W + 100, vy + vh / 2, 14, '#C85A7A');
  // red cells flowing right, each with its oxygen beads; the beads lift off toward the sac as `out` grows
  for (let i = 0; i < 14; i++) {
    const sp = 90 + 40 * hash(i * 2.2), x = ((hash(i * 7.3 + 3) * (W + 300) + t * sp) % (W + 300)) - 150, y = vy + (hash(i * 4.1) - 0.5) * 110;
    const tilt = 0.5 + 0.4 * Math.abs(Math.sin(t * 0.7 + i));
    c.save(); c.translate(x, y); ellipse(c, 0, 0, 52, 52 * tilt, '#D82A44'); ellipse(c, 0, 0, 28, 28 * tilt, '#B01A34'); c.restore();
    for (let k = 0; k < 4; k++) {
      const leave = clamp(out * 1.6 - hash(i * 4 + k) * 0.6);
      const a = k * Math.PI / 2 + t * 0.8 + i, bx0 = x + Math.cos(a) * 38, by0 = y + Math.sin(a) * 24 * tilt;
      if (leave <= 0.001) { circle(c, bx0, by0, 10, O2C); circle(c, bx0 - 3, by0 - 3, 3.5, '#FFFFFF'); softDot(gctx, bx0, by0, 24, O2C, 0.4); continue; }
      // a bead on its way: up through the wall into the sac, then out to the right
      const ph = ((t * 0.5 + hash(i * 9 + k)) % 1) * leave;
      const bx = bx0 + ph * 900, by = by0 - Math.sin(Math.min(1, ph * 2) * Math.PI / 2) * 420 * leave;
      const al = 1 - clamp((ph - 0.6) / 0.4);
      circle(c, bx, by, 10, rgba(O2C, al)); softDot(gctx, bx, by, 28, O2C, 0.45 * al);
      if (ph < 0.25) line(c, bx0, by0, bx, by, 2, rgba(O2C, 0.3 * (1 - ph * 4)));
    }
  }
  c.restore();
  if (out > 0.2) { const k = clamp((out - 0.2) / 0.3); bigWord('OXYGEN: OUT', 1500, 230, 74, '#7FE9FF', E.outBack(k, 2)); }
}

// ---------------------------------------------------------------- his head and neck in profile, as an x-ray, with the brain city
// o: {front 0..1 (the oxygen-poor blood climbing from the chest to the brain), dark 0..1 (the lights going out), x, y, s}
function headXray(t, o = {}) {
  const c = ctx, s = o.s || 1, x0 = o.x || 960, y0 = o.y || 520;
  const bg = c.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#0A1A3A'); bg.addColorStop(1, '#02040C');
  c.fillStyle = bg; c.fillRect(0, 0, W, H);
  c.save(); c.translate(x0, y0); c.scale(s, s);
  // the profile (facing right): skull, face, neck, shoulders
  c.beginPath();
  c.moveTo(-250, 760); c.lineTo(-180, 420); c.quadraticCurveTo(-170, 300, -230, 200); c.quadraticCurveTo(-330, 20, -280, -160);
  c.quadraticCurveTo(-200, -400, 40, -400); c.quadraticCurveTo(250, -390, 300, -180); c.quadraticCurveTo(320, -100, 300, -40);
  c.lineTo(350, 40); c.lineTo(305, 70); c.quadraticCurveTo(320, 120, 300, 150); c.quadraticCurveTo(310, 200, 260, 240);
  c.quadraticCurveTo(200, 280, 130, 270); c.quadraticCurveTo(110, 360, 140, 420); c.lineTo(420, 560); c.lineTo(500, 760); c.closePath();
  c.fillStyle = 'rgba(34,78,160,0.30)'; c.fill(); c.lineWidth = 6; c.strokeStyle = 'rgba(127,233,255,0.75)'; c.stroke();
  c.restore();
  // the brain city inside the skull
  const bx = x0 + 10 * s, by = y0 - 170 * s, bs = 250 * s, dk = o.dark || 0;
  brainCity(c, bx, by, bs, t, (x, y, p) => clamp(dk * 1.6 - (1 - (x + 1) / 2) * 0.6 - p * 0.3));
  // the vessel: from the chest up the neck into the brain
  const P = [[x0 + 120 * s, y0 + 740 * s], [x0 + 60 * s, y0 + 470 * s], [x0 - 10 * s, y0 + 250 * s], [x0 - 30 * s, y0 + 60 * s], [x0 - 10 * s, y0 - 90 * s], [x0 + 30 * s, y0 - 160 * s]];
  const acc = polyLen(P), Ltot = acc[acc.length - 1];
  for (let i = 0; i <= 60; i++) {
    const u = i / 60, p = polyAt(P, acc, u * Ltot), dark = clamp(((o.front || 0) * 1.15 - u) * 6);
    circle(c, p[0], p[1], 16 * s, mixHex('#E8364E', '#5A3A8A', dark));
    if (dark < 0.5) softDot(gctx, p[0], p[1], 30 * s, '#FF4A5E', 0.3 * (1 - dark));
  }
  // the front itself: a dark blob with a sad face moving up
  const f = o.front || 0;
  if (f > 0.02 && f < 1.02) {
    const p = polyAt(P, acc, clamp(f) * Ltot);
    circle(c, p[0], p[1], 34 * s, '#4A3080'); c.lineWidth = 4; c.strokeStyle = '#A88CFF'; c.stroke();
    organFace(c, p[0], p[1], 0.8 * s, 'sour', t);
  }
}

// ---------------------------------------------------------------- his gut as an x-ray balloon (screen space)
// k 0..1 swells it; o: {x, y, s}
function gutBalloon(t, k, o = {}) {
  const c = ctx, x = o.x || 960, y = o.y || 520, s = (o.s || 1) * (1 + 0.55 * k);
  softDot(gctx, x, y, 260 * s, '#FFD447', 0.25 * k);
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.moveTo(-40, -150); c.quadraticCurveTo(-170, -120, -170, 10); c.quadraticCurveTo(-160, 150, 0, 150); c.quadraticCurveTo(170, 140, 160, 0); c.quadraticCurveTo(150, -120, 40, -120); c.quadraticCurveTo(20, -170, -40, -150); c.closePath();
  c.fillStyle = 'rgba(255,200,120,0.25)'; c.fill(); c.lineWidth = 6 / s; c.strokeStyle = '#FFD447'; c.stroke();
  for (let i = 0; i < 9; i++) { const a = i * 0.7 + t * 0.5, r = 40 + 60 * hash(i); circle(c, Math.cos(a) * r, 20 + Math.sin(a) * r * 0.7, 10 + 8 * hash(i * 3) * (1 + k), 'rgba(255,240,200,0.7)'); }
  organFace(c, 0, 10, 2.0, k > 0.6 ? 'shock' : 'calm', t);
  c.restore();
}
