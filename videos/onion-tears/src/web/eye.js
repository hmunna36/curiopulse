// Onion-tears Short: the eye. The gas drifts up from the board to his face (eyes), lands on the big macro eye and
// pings the nerve endings in its surface (eyes), the signal reaches the brain, which sounds the DANGER alarm, and
// the tear gland floods the eye to wash the gas away (brain).
// Science: syn-propanethial-S-oxide reaches the eye's surface and stimulates the corneal sensory nerve endings;
// the reflex drives the lacrimal (tear) gland to flush the irritant.
'use strict';

const EYE = { x: 540, y: 960, r: 330 };
let EYE_SPECKS = null, EYE_NERVES = null;

function initEye() {
  const rng = mulberry32(44);
  EYE_SPECKS = [...Array(26)].map(() => ({ a: rng() * 6.283, d: Math.sqrt(rng()) * 0.8, t0: rng(), ph: rng() * 7 }));
  EYE_NERVES = [...Array(9)].map((_, i) => {
    const a = -2.6 + i * 0.62 + rng() * 0.2, pts = [];
    let x = EYE.x + Math.cos(a) * EYE.r * 1.05, y = EYE.y + Math.sin(a) * EYE.r * 0.7;
    let ang = a + Math.PI;
    for (let k = 0; k < 7; k++) { pts.push([x, y]); ang += (rng() - 0.5) * 0.7; x += Math.cos(ang) * 55; y += Math.sin(ang) * 40; }
    return pts;
  });
}

// the big macro eye (world coords). o: {look, specks 0..1 landed, ping 0..1, flood 0..1, wash 0..1, red 0..1}
function macroEye(t, o = {}) {
  const c = ctx, { x, y, r } = EYE;
  // skin around it
  const sk = c.createRadialGradient(x, y, r * 0.8, x, y, r * 2.4);
  sk.addColorStop(0, '#E9A67F'); sk.addColorStop(1, '#8E4E36');
  c.fillStyle = sk; c.fillRect(-1500, -1500, 4000, 5000);
  // almond opening
  const open = 0.72 - 0.1 * (o.squint || 0);
  const almond = (cc) => {
    cc.beginPath(); cc.moveTo(x - r * 1.35, y);
    cc.quadraticCurveTo(x, y - r * 1.25 * open * 1.6, x + r * 1.35, y);
    cc.quadraticCurveTo(x, y + r * 1.1 * open * 1.5, x - r * 1.35, y); cc.closePath();
  };
  c.save(); almond(c); c.clip();
  const sc = c.createRadialGradient(x, y, r * 0.3, x, y, r * 1.4);
  sc.addColorStop(0, '#FFFFFF'); sc.addColorStop(1, mixHex('#E8DCD6', '#F2A0A0', o.red || 0));
  c.fillStyle = sc; c.fillRect(x - r * 1.5, y - r, r * 3, r * 2);
  // red veins (irritated)
  if ((o.red || 0) > 0) {
    const rng = mulberry32(3);
    for (let i = 0; i < 12; i++) {
      const a = rng() * 6.283; let px = x + Math.cos(a) * r * 1.3, py = y + Math.sin(a) * r * 0.6;
      c.beginPath(); c.moveTo(px, py);
      for (let k = 0; k < 4; k++) { px += (x - px) * 0.18 + (rng() - 0.5) * 30; py += (y - py) * 0.18 + (rng() - 0.5) * 20; c.lineTo(px, py); }
      c.lineWidth = 3; c.strokeStyle = rgba('#D8323E', 0.7 * o.red); c.stroke();
    }
  }
  // the nerve endings in the surface (orange, light up on the ping)
  const pg = o.ping || 0;
  for (const [i, P] of EYE_NERVES.entries()) {
    const on = pg > 0 ? clamp(pg * 1.4 - i * 0.05) : 0;
    poly(c, P, 5, rgba('#FF9A3C', 0.35 + 0.6 * on));
    if (on > 0) { gctx.save(); poly(gctx, P, 10, rgba('#FF9A3C', 0.8 * on)); gctx.restore(); }
    // a spark travelling outward along the nerve
    if (pg > 0 && pg < 1) {
      const acc = polyLen(P.slice().reverse()), [sx, sy] = polyAt(P.slice().reverse(), acc, acc[acc.length - 1] * ((pg * 1.6 + i * 0.13) % 1));
      softDot(ctx, sx, sy, 22, '#FFE0A0', 0.9); softDot(gctx, sx, sy, 50, '#FF9A3C', 0.9);
    }
  }
  // iris + pupil
  const lx = x + (o.look || 0) * 60;
  const ig = c.createRadialGradient(lx, y, 20, lx, y, r * 0.52);
  ig.addColorStop(0, '#3A2414'); ig.addColorStop(0.45, '#6E4524'); ig.addColorStop(1, '#2B190C');
  circle(c, lx, y, r * 0.52, ig);
  for (let i = 0; i < 40; i++) { const a = i / 40 * 6.283; line(c, lx + Math.cos(a) * r * 0.2, y + Math.sin(a) * r * 0.2, lx + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.5, 2, 'rgba(160,110,60,0.35)'); }
  circle(c, lx, y, r * 0.22 * (1 - 0.2 * pg), '#070504');
  // highlight
  ellipse(c, lx - r * 0.2, y - r * 0.2, r * 0.13, r * 0.09, 'rgba(255,255,255,0.9)', -0.5);
  // gas specks landing on the surface
  const land = o.specks || 0, wash = o.wash || 0;
  for (const s of EYE_SPECKS) {
    const lk = clamp(land * 1.5 - s.t0 * 0.5);
    if (lk <= 0) continue;
    const px = x + Math.cos(s.a) * s.d * r * 1.2, py0 = y + Math.sin(s.a) * s.d * r * 0.55;
    const py = py0 + wash * wash * 700 * (0.5 + s.t0), al = (1 - wash);
    if (lk < 1) { softDot(c, px, py - (1 - lk) * 300, 26, '#8CFF9E', 0.8 * al); continue; }
    circle(c, px, py, 10, rgba('#6CFF8A', 0.85 * al)); softDot(gctx, px, py, 34, '#6CFF8A', 0.6 * al);
    if (pg > 0 && pg < 0.6) { c.beginPath(); c.arc(px, py, 12 + pg * 120, 0, 7); c.lineWidth = 3; c.strokeStyle = rgba('#FFD447', 0.7 * (1 - pg / 0.6)); c.stroke(); }
  }
  // the flood: a sheet of tears rolling over the eye
  const fl = o.flood || 0;
  if (fl > 0) {
    const top = y - r * 1.2 + fl * r * 2.8;
    const wg = c.createLinearGradient(0, top - 300, 0, top);
    wg.addColorStop(0, 'rgba(140,215,255,0.0)'); wg.addColorStop(1, 'rgba(140,215,255,0.5)');
    c.fillStyle = wg; c.fillRect(x - r * 1.5, top - 300, r * 3, 300);
    c.fillStyle = 'rgba(160,225,255,0.18)'; c.fillRect(x - r * 1.5, y - r, r * 3, top - (y - r));
    for (let i = 0; i < 10; i++) { const px = x - r * 1.2 + i * r * 0.27; line(c, px, top - 260 + 40 * hash(i), px, top - 60, 6, 'rgba(255,255,255,0.45)'); }
  }
  c.restore();
  // lids + lashes
  almond(c); c.lineWidth = 26; c.strokeStyle = '#6B3522'; c.stroke();
  c.beginPath(); c.moveTo(x - r * 1.35, y); c.quadraticCurveTo(x, y - r * 1.25 * open * 1.6, x + r * 1.35, y);
  c.lineWidth = 14; c.strokeStyle = '#2A1408'; c.stroke();
  for (let i = 1; i < 12; i++) {
    const u = i / 12, px = lerp(x - r * 1.35, x + r * 1.35, u), py = y - Math.sin(Math.PI * u) * r * 0.62 * open * 1.6 / 1.25;
    line(c, px, py, px + (u - 0.5) * 60, py - 60, 8, '#2A1408');
  }
  // the tear gland (upper outer corner, screen right)
  const gx = x + r * 1.05, gy = y - r * 0.95, gk = o.gland || 0;
  if (gk > 0) {
    const sq = 1 + 0.12 * Math.sin(t * 16) * (o.flood > 0 ? 1 : 0);
    ellipse(c, gx, gy, 110 * gk * sq, 60 * gk / sq, '#7FC8FF', -0.4);
    ellipse(c, gx - 20, gy - 12, 40 * gk, 18 * gk, 'rgba(255,255,255,0.5)', -0.4);
    softDot(gctx, gx, gy, 180 * gk, '#7FD8FF', 0.6);
  }
}

function brainIcon(x, y, s, k, t, alarm) {
  if (k <= 0) return;
  const sc = E.outBack(clamp(k), 1.8) * s;
  const shake = alarm > 0 ? Math.sin(t * 60) * 6 * alarm : 0;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x + shake, y); ctx.scale(sc, sc);
  const col = mixHex('#FF9EC0', '#FF5A6E', alarm);
  for (const [dx, dy, r] of [[-70, -10, 70], [0, -45, 78], [70, -10, 70], [-40, 40, 60], [40, 40, 60]]) circle(ctx, dx, dy, r, col);
  ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(120,20,50,0.5)';
  for (const [a, b, cx, cy] of [[-100, -10, -60, -60], [-20, -80, 20, 0], [40, -60, 100, -20], [-50, 50, 0, 20], [30, 60, 80, 20]]) { ctx.beginPath(); ctx.moveTo(a, b); ctx.quadraticCurveTo(cx, cy, a + 60, b + 30); ctx.stroke(); }
  line(ctx, 0, -110, 0, 80, 6, 'rgba(120,20,50,0.5)');
  // siren on top
  if (alarm > 0) {
    rrect(ctx, -34, -170, 68, 60, 20); ctx.fillStyle = Math.sin(t * 20) > 0 ? '#FF2A3A' : '#FF8A5A'; ctx.fill();
    rrect(ctx, -50, -116, 100, 16, 6); ctx.fillStyle = '#3A3D52'; ctx.fill();
  }
  ctx.restore();
  if (alarm > 0) {
    const on = Math.sin(t * 20) > 0 ? 1 : 0.4;
    softDot(gctx, x, y - 140 * sc, 220 * sc, '#FF2A3A', 0.9 * alarm * on);
    for (let i = 0; i < 2; i++) { // rotating beams
      const a = t * 6 + i * Math.PI;
      ctx.save(); ctx.globalAlpha = 0.25 * alarm; ctx.fillStyle = '#FF3A4A';
      ctx.beginPath(); ctx.moveTo(x, y - 140 * sc); ctx.lineTo(x + Math.cos(a - 0.15) * 700, y - 140 * sc + Math.sin(a - 0.15) * 700); ctx.lineTo(x + Math.cos(a + 0.15) * 700, y - 140 * sc + Math.sin(a + 0.15) * 700); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  }
}

// ---------------------------------------------------------------- shots
SC.eyes = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const macro = c.lands + 0.35;
  if (t < macro) { // the gas floats up from the board to his eyes: the camera follows it up
    const cam = camKeys(t, [[shot.start, 560, 1210, 2.0], [c.lands - 0.1, 520, 1010, 2.4], [macro, 505, 995, 4.5]]);
    applyCam(cam);
    kitchenBg(t);
    const r = heroChopping(cam, t, { chop: 0.05, face: lerpFace(FACE_WEEPY, FACES.nervous, ramp(t, c.lands - 0.3, c.lands)), wet: 0.6, hat: 1, pal: PAL_CHEF, onion: 'halves', split: 1, slices: 12, knife: false });
    // a thick gas column right to his eyes
    const [ex, ey] = r.eyes[0];
    gasWisps(KIT.onionX, KIT.onionY - 30, ex + 36, ey + 40, t, 0.5, 10, 13);
    for (let i = 0; i < 6; i++) {
      const ph = (lt * 0.55 + i / 6) % 1, tx = r.eyes[i % 2][0] + (i % 2 ? 40 : -40);
      molecule(lerp(KIT.onionX + 20 * Math.sin(i), tx, E.inOutSine(ph)), lerp(KIT.onionY - 40, ey + 10, ph), 'gas', 0.6, t, i, 0);
    }
    return { glow: 0.55, zblur: 0.18 * ramp(t, macro - 0.3, macro) };
  }
  const l2 = t - macro;
  const cam = { x: 540, y: 960, zoom: 1.12 - 0.08 * E.outCubic(clamp(l2 / 2.5)), rot: 0 };
  applyCam(cam);
  macroEye(t, { look: 0.1 * Math.sin(t * 2), specks: ramp(t, macro, macro + 0.9), ping: t > c.pings ? inv(c.pings, c.pings + 1.2, t) : 0, red: ramp(t, c.pings, c.pings + 1.2) * 0.6, squint: ramp(t, c.pings, c.pings + 0.4) });
  screenSpace();
  pill(540, 470, 'NERVE ENDINGS', '#FF9A3C', pop(t, c.nerves) , 50);
  return { glow: 0.75, zblur: 0.15 * (1 - ramp(l2, 0, 0.3)) };
};

SC.brain = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(t, [[shot.start, 540, 960, 1.04], [c.floods - 0.2, 560, 900, 0.9], [shot.end, 580, 880, 0.95]]);
  applyCam(cam);
  const fl = ramp(t, c.floods, c.wash + 0.6, E.inOutSine);
  macroEye(t, { specks: 1, ping: 1, red: 0.6 * (1 - fl), squint: 0.4, gland: ramp(t, c.floods - 0.35, c.floods, E.outBack), flood: fl, wash: ramp(t, c.wash - 0.2, c.wash + 1.0, E.inCubic) });
  screenSpace();
  // the brain up top, wired to the eye
  const bk = pop(t, shot.start + 0.02, 0.35), al = ramp(t, c.yells, c.yells + 0.2);
  brainIcon(330, 560, 1.0, bk, t, al * (1 - ramp(t, c.floods + 0.4, c.floods + 0.9)));
  speech('DANGER!', 690, 470, pop(t, c.danger, 0.3) * (1 - ramp(t, c.floods + 0.3, c.floods + 0.6)), '#FF3A4A', 100, 0.06);
  pill(760, 700, 'TEAR GLAND', '#7FD8FF', pop(t, c.floods + 0.15) , 44);
  return { glow: 0.8, tint: '#FF2A3A', tintA: 0.12 * al * (Math.sin(t * 20) > 0 ? 1 : 0) * (1 - ramp(t, c.floods, c.floods + 0.4)) };
};
