// Why Can't You Say "M" With Your Mouth OPEN? 👄 Short: his head from the side as glass (after tongue-twister's tw_mouth.js,
// whose head outline, tongue and dark field it reuses), with the road to the NOSE added: the hum climbs the throat and
// leaves through the nose while the lips are shut (an M); open the lips and it pours out of the mouth instead.
// SECTION units: the origin between his lips, x forward, y down; placed in the world by TWSW (tw_mouth.js).
//   mmSection(t, o)  o: {lips 0..1 (shut), open 0..1 (the jaw drops), nose 0..1 (the hum on the nose road), mouth 0..1 (the
//                    hum on the mouth road), vbox 0..1 (the voice box lit), pour 0..1 (A letters pouring out of the mouth),
//                    hums 0..1 (m letters out of the nostril), eye: {lookX, lookY, brow, wide}}. Returns world points.
'use strict';

const MM_ROAD_UP = [[-246, 250], [-251, 150], [-254, 60], [-252, -10], [-246, -44]];
const MM_ROAD_NOSE = [[-246, -44], [-238, -84], [-210, -112], [-150, -128], [-80, -130], [-20, -124], [22, -114], [70, -104]];
const MM_ROAD_MOUTH = [[-246, -44], [-206, -46], [-150, -48], [-90, -46], [-36, -36], [4, -22], [60, -14], [120, -8]];
const mmRoad = (P) => { const acc = polyLen(P); return { P, acc, L: acc[acc.length - 1] }; };
let MM_R_UP = null, MM_R_NOSE = null, MM_R_MOUTH = null;
function initSection() { MM_R_UP = mmRoad(MM_ROAD_UP); MM_R_NOSE = mmRoad(MM_ROAD_NOSE); MM_R_MOUTH = mmRoad(MM_ROAD_MOUTH); }

// the nasal passage above the roof of the mouth: one closed shape (section units)
function mmNosePath(c) {
  c.beginPath();
  c.moveTo(-240, -40);
  c.bezierCurveTo(-246, -90, -232, -128, -190, -146);
  c.bezierCurveTo(-140, -164, -70, -166, -20, -150);
  c.bezierCurveTo(10, -140, 30, -126, 34, -114);
  c.bezierCurveTo(20, -104, 0, -100, -30, -98);
  c.bezierCurveTo(-90, -94, -150, -90, -196, -82);
  c.bezierCurveTo(-222, -74, -234, -60, -240, -40);
  c.closePath();
}

// a road lit by the hum: a glow, a bright core and beads that travel along it (section space on ctx; the glow in world)
function mmFlow(c, road, k, t, col, speed = 260) {
  if (k <= 0.01) return;
  const P = road.P;
  // the glow under it
  const Wp = P.map(twSW);
  gctx.save(); gctx.lineCap = 'round'; gctx.lineJoin = 'round';
  gctx.beginPath(); gctx.moveTo(Wp[0][0], Wp[0][1]); for (let i = 1; i < Wp.length; i++) gctx.lineTo(Wp[i][0], Wp[i][1]);
  gctx.lineWidth = 44 * TWSW.s; gctx.strokeStyle = rgba(col, 0.42 * k); gctx.stroke();
  gctx.restore();
  paint(() => {
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) c.lineTo(P[i][0], P[i][1]);
    c.lineWidth = 9; c.strokeStyle = rgba(col, 0.55 * k); c.stroke();
    c.restore();
    // beads: the hum's pulses running along the road
    const gap = 46, off = (t * speed) % gap;
    for (let s = off; s < road.L; s += gap) {
      const q = polyAt(P, road.acc, s), fade = clamp(s / 30) * clamp((road.L - s) / 40);
      circle(c, q[0], q[1], 7.5, rgba('#FFFFFF', 0.95 * k * fade));
      circle(c, q[0], q[1], 12, rgba(col, 0.35 * k * fade));
    }
  });
}

// letters leaving a point (section units): ch, a direction, a rate; deterministic on t
function mmLetters(c, ch, at, dir, k, t, o = {}) {
  if (k <= 0.01) return;
  const rate = o.rate || 3.2, life = o.life || 0.9, size = o.size || 34, col = o.col || '#FFD447', spread = o.spread || 0.35;
  const n0 = Math.floor((t - life) * rate), n1 = Math.floor(t * rate);
  for (let n = n0; n <= n1; n++) {
    const born = n / rate, age = t - born;
    if (age < 0 || age > life) continue;
    const u = age / life, a = dir + spread * (hash(n * 3.7 + 1) - 0.5) * 2, D = (o.dist || 150) * E.outCubic(u);
    const x = at[0] + Math.cos(a) * D, y = at[1] + Math.sin(a) * D - (o.rise || 20) * u;
    const sc = k * E.outBack(clamp(u * 4), 2.2) * (1 - 0.35 * u) * (1 - clamp((u - 0.8) / 0.2));
    if (sc <= 0.02) continue;
    paint(() => {
      c.save(); c.translate(x, y); c.rotate(0.25 * Math.sin(n * 2.1 + t * 6)); c.scale(sc, sc);
      c.font = `400 ${size}px Anton`; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.lineWidth = size * 0.16; c.lineJoin = 'round'; c.strokeStyle = '#0B0B1A'; c.strokeText(ch, 0, 0);
      c.fillStyle = col; c.fillText(ch, 0, 0);
      c.restore();
    });
  }
}

function mmSection(t, o = {}) {
  const c = ctx, lips = clamp(o.lips || 0), op = clamp(o.open || 0);
  const d = 34 * op * (1 - lips * 0.85), g = (1 - lips) * (6 + 22 * op);
  const nk = clamp(o.nose || 0), mk = clamp(o.mouth || 0), vb = clamp(o.vbox || 0);
  c.save(); c.translate(TWSW.o[0], TWSW.o[1]); c.scale(TWSW.s, TWSW.s);
  // ---- the glass head and neck
  twHeadPath(c, g, d); c.lineWidth = 6; c.strokeStyle = TWC.rim; c.stroke();
  twHeadPath(c, g, d); c.fillStyle = TWC.glass; c.fill();
  paint(() => {
    c.save(); twHeadPath(c, g, d); c.clip();
    c.fillStyle = TWC.hair;
    c.beginPath(); c.moveTo(-520, -150); c.bezierCurveTo(-540, -420, -380, -560, -230, -540); c.bezierCurveTo(-120, -526, -60, -470, -44, -400);
    c.bezierCurveTo(-100, -440, -170, -446, -230, -430); c.bezierCurveTo(-330, -410, -400, -330, -420, -200); c.closePath(); c.fill();
    c.fillStyle = PAL.coat; c.fillRect(-420, 560, 300, 160);
    line(c, -420, 560, -126, 548, 10, PAL.coatSh);
    c.restore();
    const ey = o.eye || {}, wide = ey.wide || 0;
    ellipse(c, -62, -238, 15 + 3 * wide, 19 + 5 * wide, '#FFFFFF');
    const lx = ey.lookX === undefined ? 1 : ey.lookX, ly = ey.lookY === undefined ? 0 : ey.lookY;
    circle(c, -56 + 4 * lx, -234 + 5 * ly, 8 - 1.5 * wide, '#15132A');
    circle(c, -54 + 4 * lx, -238 + 5 * ly, 2.6, '#FFFFFF');
    line(c, -84, -272 - 6 * (ey.brow || 0) - 8 * wide, -36, -276 - 6 * (ey.brow || 0) - 8 * wide, 6, TWC.hair);
    ellipse(c, -300, -190, 30, 48, 'rgba(242,184,146,0.42)');
    c.beginPath(); c.ellipse(-300, -190, 18, 32, 0, -1.2, 1.9); c.lineWidth = 4; c.strokeStyle = 'rgba(160,96,70,0.5)'; c.stroke();
  });
  // ---- the road to the nose: a passage above the roof of the mouth, out at the nostril
  paint(() => {
    mmNosePath(c); c.fillStyle = 'rgba(120,40,80,0.5)'; c.fill();
    mmNosePath(c); c.lineWidth = 3; c.strokeStyle = 'rgba(255,150,190,0.45)'; c.stroke();
    ellipse(c, 24, -112, 12, 5.5, 'rgba(70,20,32,0.85)', -0.25);           // the nostril
  });
  // ---- the roof of the mouth and the soft palate (hanging: the door to the nose stands open), the throat behind
  paint(() => {
    c.beginPath(); c.moveTo(-4, -38); c.bezierCurveTo(-40, -58, -110, -66, -150, -60);
    c.bezierCurveTo(-190, -56, -222, -46, -238, -26);
    c.lineTo(-246, -30); c.bezierCurveTo(-228, -62, -190, -76, -150, -78); c.bezierCurveTo(-100, -82, -40, -74, -4, -50); c.closePath();
    c.fillStyle = TWC.roof; c.fill();
    ellipse(c, -240, -18, 7, 14, TWC.velum);
    c.beginPath(); c.moveTo(-250, -30); c.bezierCurveTo(-262, 40, -256, 160, -246, 320); c.lineWidth = 16; c.strokeStyle = 'rgba(120,40,70,0.55)'; c.lineCap = 'round'; c.stroke();
  });
  // the voice box: where the hum starts
  if (vb > 0.01) {
    const p = twSW([-250, 160]);
    softDot(gctx, p[0], p[1], 80, '#FFB45A', 0.55 * vb);
    paint(() => { for (let i = 0; i < 2; i++) { const ph = ((t * 2.6 + i / 2) % 1); c.beginPath(); c.ellipse(-250, 160, 18 + 30 * ph, 10 + 16 * ph, 0, 0, 7); c.lineWidth = 3.5; c.strokeStyle = rgba('#FFD08A', vb * (1 - ph)); c.stroke(); } circle(c, -250, 160, 9, rgba('#FFE2A8', vb)); });
  }
  // ---- the teeth
  paint(() => {
    rrect(c, -16, -46, 15, 22, 5); c.fillStyle = '#FFFFFF'; c.fill();
    rrect(c, -18, -12 + d, 14, 18, 5); c.fillStyle = '#FFFFFF'; c.fill();
  });
  // ---- the tongue
  actor(() => { twTonguePath(c, 0, 0, d); c.fillStyle = TWC.tongue; c.fill(); });
  paint(() => {
    c.save(); twTonguePath(c, 0, 0, d); c.clip();
    for (let j = 1; j <= 3; j++) { const P = []; for (let x = -24; x >= -220; x -= 8) P.push([x, twTongueY(x, 0, 0, d) + j * 11]); poly(c, P, 2, rgba('#B23A55', 0.32)); }
    c.restore();
  });
  // ---- the hum on its roads: up the throat, then the nose or the mouth
  const up = Math.max(nk, mk);
  mmFlow(c, MM_R_UP, up, t, nk >= mk ? '#7FE9FF' : '#FFD447');
  mmFlow(c, MM_R_NOSE, nk, t, '#7FE9FF');
  mmFlow(c, MM_R_MOUTH, mk, t, '#FFD447');
  // ---- the lips
  paint(() => {
    const ul = -18 - g / 2, ll = -18 + g / 2 + d;
    c.beginPath(); c.moveTo(2, ul); c.bezierCurveTo(16, ul - 2, 22, -40, 16, -54); c.lineTo(4, -54); c.lineTo(2, ul); c.closePath();
    c.fillStyle = TWC.lip; c.fill();
    c.beginPath(); c.moveTo(2, ll); c.lineTo(8, ll); c.bezierCurveTo(20, ll + 2, 24, 4 + d, 16, 14 + d); c.lineTo(4, 14 + d); c.closePath();
    c.fillStyle = TWC.lip; c.fill();
    if (lips > 0.6) line(c, 2, -18, 12, -18, 2.4, rgba('#8E3440', lips));
  });
  // ---- what comes out: little m's from the nostril, big A's from the mouth
  mmLetters(c, 'm', [40, -112], -0.25, clamp(o.hums || 0), t, { rate: 3.4, size: 40, col: '#7FE9FF', dist: 170, rise: 30 });
  mmLetters(c, 'A', [40, -14 + d * 0.5], 0.0, clamp(o.pour || 0), t, { rate: 4.2, size: 92, col: '#FFD447', dist: 250, rise: 10, spread: 0.4 });
  c.restore();
  return { nostril: twSW([30, -112]), mouth: twSW([30, -16 + d * 0.5]), vbox: twSW([-250, 160]), velum: twSW([-238, -40]), lipsW: twSW([12, -18]) };
}
