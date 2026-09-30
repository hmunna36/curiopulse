// Onion-tears Short: inside the onion. The brick wall of onion cells (trap), one cell cut open with its two
// "rooms" (the vacuole holding the enzyme, the cytoplasm around it holding the sulfur stuff), the knife that
// smashes the wall, the two enzymes and the tear gas (rooms, mix), and the long-name card with its molecule (name).
// Science: alliinase sits in the vacuole, the sulfur precursors (sulfoxides) in the cytoplasm; cutting mixes them,
// alliinase makes a sulfenic acid (the "sulfur compound"), and lachrymatory-factor synthase (the second enzyme,
// Imai et al., Nature 2002) turns it into syn-propanethial-S-oxide, the tear gas.
'use strict';

let IN_CELLS = null, IN_MOL = null, IN_ENZ = null;
const CELL = { x0: 130, y0: 520, x1: 950, y1: 1180 };   // the cut-open cell (world coords)
const VAC = { x: 470, y: 850, rx: 250, ry: 220 };       // the vacuole: room 1

function initInside() {
  const rng = mulberry32(21);
  IN_CELLS = [];
  for (let row = -6; row < 16; row++) for (let col = -3; col < 6; col++) {
    const w = 250 + rng() * 60, h = 110;
    IN_CELLS.push({ x: col * 290 + (row & 1) * 145 + rng() * 14, y: row * 124, w, h, ph: rng() * 7, n: [rng(), rng()] });
  }
  IN_MOL = [...Array(22)].map((_, i) => {
    // sulfur stuff in the cytoplasm ring around the vacuole
    const a = rng() * 6.283, rr = 1.2 + rng() * 0.35;
    return { a, rr, ph: rng() * 7, sp: 0.2 + rng() * 0.4, k1: rng(), k2: rng() };
  });
  IN_ENZ = [...Array(7)].map(() => ({ x: (rng() - 0.5) * 0.9, y: (rng() - 0.5) * 0.8, ph: rng() * 7, sp: 0.3 + rng() * 0.3 }));
}

// ---------------------------------------------------------------- the brick wall of cells
function cellWall(t, hi, hiK, warn) {
  const c = ctx;
  const g = c.createLinearGradient(0, -800, 0, 2800);
  g.addColorStop(0, '#2A3A12'); g.addColorStop(1, '#141C08');
  c.fillStyle = g; c.fillRect(-1500, -1500, 4000, 5000);
  for (const [i, e] of IN_CELLS.entries()) {
    const breathe = 1 + 0.01 * Math.sin(t * 1.5 + e.ph);
    const x = e.x, y = e.y, w = e.w * breathe, h = e.h;
    rrect(c, x, y, w, h, 40);
    const cg = c.createLinearGradient(x, y, x, y + h);
    cg.addColorStop(0, '#F3F0C8'); cg.addColorStop(1, '#D8D49A');
    c.fillStyle = cg; c.fill();
    c.lineWidth = 9; c.strokeStyle = '#A9A660'; c.stroke();
    ellipse(c, x + w * (0.3 + 0.4 * e.n[0]), y + h * 0.5, 22, 16, 'rgba(160,150,90,0.55)'); // nucleus
    rrect(gctx, x, y, w, h, 40); gctx.lineWidth = 6; gctx.strokeStyle = 'rgba(255,250,190,0.22)'; gctx.stroke();
    if (warn > 0) { // every cell arms itself: a blinking red light
      const on = Math.sin(t * 9 + e.ph * 3) > 0 ? 1 : 0.35;
      circle(c, x + w - 34, y + 30, 11, rgba('#FF3A4A', warn * on));
      softDot(gctx, x + w - 34, y + 30, 40, '#FF3A4A', 0.8 * warn * on);
    }
    if (i === hi && hiK > 0) {
      rrect(c, x - 6, y - 6, w + 12, h + 12, 44); c.lineWidth = 10; c.strokeStyle = rgba('#FFD447', hiK); c.stroke();
      rrect(gctx, x - 6, y - 6, w + 12, h + 12, 44); gctx.lineWidth = 16; gctx.strokeStyle = rgba('#FFD447', 0.8 * hiK); gctx.stroke();
    }
  }
}
function wallCellIndexNear(x, y) {
  let best = 0, bd = 1e9;
  IN_CELLS.forEach((e, i) => { const d = Math.hypot(e.x + e.w / 2 - x, e.y + e.h / 2 - y); if (d < bd) { bd = d; best = i; } });
  return best;
}

// a cartoon trip-wire bomb (screen space), k = pop-in
function bombIcon(x, y, s, k, t) {
  if (k <= 0) return;
  const sc = E.outBack(clamp(k), 2) * s;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.scale(sc, sc);
  circle(ctx, 0, 0, 70, '#1D1F2C');
  circle(ctx, -22, -24, 18, 'rgba(255,255,255,0.25)');
  rrect(ctx, -18, -92, 36, 30, 6); ctx.fillStyle = '#3A3D52'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(0, -92); ctx.quadraticCurveTo(30, -130, 60, -118); ctx.lineWidth = 7; ctx.strokeStyle = '#C9A66B'; ctx.stroke();
  ctx.restore();
  const fx = x + 60 * sc, fy = y - 118 * sc, fl = 0.7 + 0.3 * Math.sin(t * 40);
  softDot(ctx, fx, fy, 30 * sc * fl, '#FFD447', 1); softDot(gctx, fx, fy, 60 * sc, '#FF9A3C', 0.9);
}

// ---------------------------------------------------------------- one cell, cut open
function cellInterior(t, o = {}) {
  const c = ctx;
  darkBgWorld('#1E2A10', '#0A0F04');
  // neighbours peeking in at the edges
  for (const [x, y] of [[-420, 400], [-420, 1250], [1180, 380], [1180, 1250], [380, -300], [380, 1500]]) {
    rrect(c, x, y, 700, 560, 120); c.fillStyle = 'rgba(220,215,150,0.18)'; c.fill(); c.lineWidth = 10; c.strokeStyle = 'rgba(170,165,90,0.4)'; c.stroke();
  }
  // the cell: wall + cytoplasm (room 2)
  const { x0, y0, x1, y1 } = CELL;
  rrect(c, x0, y0, x1 - x0, y1 - y0, 120);
  const cg = c.createRadialGradient(540, 850, 60, 540, 850, 600);
  cg.addColorStop(0, '#FFF6D6'); cg.addColorStop(1, '#E6DDA6');
  c.fillStyle = cg; c.fill();
  c.lineWidth = 22; c.strokeStyle = '#A5A15A'; c.stroke();
  rrect(gctx, x0, y0, x1 - x0, y1 - y0, 120); gctx.lineWidth = 20; gctx.strokeStyle = 'rgba(255,245,170,0.25)'; gctx.stroke();
  // the vacuole (room 1): a violet bubble; broken by the knife (o.broken 0..1)
  const br = o.broken || 0;
  if (br < 1) {
    c.save(); c.globalAlpha = 1 - br;
    const vg = c.createRadialGradient(VAC.x - 60, VAC.y - 60, 20, VAC.x, VAC.y, VAC.rx);
    vg.addColorStop(0, 'rgba(210,190,255,0.55)'); vg.addColorStop(1, 'rgba(150,110,240,0.4)');
    ellipse(c, VAC.x, VAC.y, VAC.rx, VAC.ry, vg);
    c.beginPath(); c.ellipse(VAC.x, VAC.y, VAC.rx, VAC.ry, 0, 0, 7);
    c.lineWidth = 12 + 6 * (o.wallGlow || 0); c.strokeStyle = mixHex('#8E6BE0', '#FFD447', o.wallGlow || 0); c.stroke();
    if (o.wallGlow) { gctx.beginPath(); gctx.ellipse(VAC.x, VAC.y, VAC.rx, VAC.ry, 0, 0, 7); gctx.lineWidth = 22; gctx.strokeStyle = rgba('#FFD447', 0.7 * o.wallGlow); gctx.stroke(); }
    c.restore();
  }
  if (br > 0 && br < 1) { // membrane shreds flying off
    const rng = mulberry32(5);
    for (let i = 0; i < 18; i++) {
      const a = rng() * 6.283, d = br * (120 + rng() * 260);
      const px = VAC.x + Math.cos(a) * (VAC.rx * 0.9 + d), py = VAC.y + Math.sin(a) * (VAC.ry * 0.9 + d);
      c.save(); c.translate(px, py); c.rotate(a + br * 4); c.globalAlpha = 1 - br;
      rrect(c, -26, -6, 52, 12, 6); c.fillStyle = '#8E6BE0'; c.fill(); c.restore();
    }
  }
}
function darkBgWorld(c1, c2) {
  const g = ctx.createRadialGradient(540, 850, 100, 540, 900, 1500);
  g.addColorStop(0, c1); g.addColorStop(1, c2);
  ctx.fillStyle = g; ctx.fillRect(-1500, -1500, 4000, 5000);
}

// a sulfur molecule: 'pre' violet dumbbell with a yellow S, 'acid' yellow blob, 'gas' green puff with a sad face
function molecule(x, y, kind, s, t, ph = 0, pop = 0) {
  const c = ctx, sc = s * (1 + 0.35 * Math.sin(Math.PI * clamp(pop)));
  if (kind === 'pre') {
    line(c, x - 22 * sc, y, x + 22 * sc, y, 8 * sc, '#6E4FB8');
    circle(c, x - 24 * sc, y, 16 * sc, '#A98BFF'); circle(c, x + 24 * sc, y, 13 * sc, '#8C6CF0');
    circle(c, x, y, 12 * sc, '#FFD447');
  } else if (kind === 'acid') {
    circle(c, x, y, 22 * sc, '#FFD447'); circle(c, x + 18 * sc, y - 10 * sc, 11 * sc, '#FFE58A'); circle(c, x - 16 * sc, y + 8 * sc, 10 * sc, '#F2B92E');
    softDot(gctx, x, y, 50 * sc, '#FFD447', 0.5);
  } else {
    for (const [dx, dy, r] of [[-14, 4, 20], [12, 2, 22], [0, -12, 20]]) circle(c, x + dx * sc, y + dy * sc, r * sc, '#8CFF9E');
    circle(c, x - 8 * sc, y - 2 * sc, 3.5 * sc, '#10331A'); circle(c, x + 8 * sc, y - 2 * sc, 3.5 * sc, '#10331A');
    c.beginPath(); c.arc(x, y + 10 * sc, 6 * sc, Math.PI * 1.15, Math.PI * 1.85); c.lineWidth = 3 * sc; c.strokeStyle = '#10331A'; c.stroke();
    softDot(gctx, x, y, 60 * sc, '#6CFF8A', 0.55);
  }
}
// an enzyme: a pac-man that chomps. col orange (#1) or green (#2), badge text
function enzyme(x, y, s, t, col, dir = 0, badge = '', chomp = null) {
  const c = ctx, m = chomp === null ? 0.35 + 0.3 * Math.abs(Math.sin(t * 7)) : chomp;
  c.save(); c.translate(x, y); c.rotate(dir); c.scale(s, s);
  c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 40, m, 6.283 - m); c.closePath();
  c.fillStyle = col; c.fill(); c.lineWidth = 5; c.strokeStyle = 'rgba(0,0,0,0.35)'; c.stroke();
  circle(c, 6, -20, 7, '#1A1206'); circle(c, 8, -22, 2.5, '#FFFFFF');
  c.restore();
  softDot(gctx, x, y, 70 * s, col, 0.45);
  if (badge) {
    ctx.save(); ctx.translate(x, y - 58 * s);
    circle(ctx, 0, 0, 24 * s, '#FFFFFF'); ctx.font = `900 ${26 * s}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#10331A'; ctx.fillText(badge, 0, 2 * s); ctx.restore();
  }
}
// molecule i's position in the cytoplasm (drifting) and, after the mix, anywhere in the cell
function molPos(m, t, mixed) {
  const a = m.a + t * m.sp * 0.3;
  const rx = VAC.rx * m.rr, ry = VAC.ry * m.rr * 0.95;
  const p0 = [VAC.x + 60 + Math.cos(a) * rx, VAC.y + Math.sin(a) * ry];
  p0[0] = clamp(p0[0], CELL.x0 + 60, CELL.x1 - 60); p0[1] = clamp(p0[1], CELL.y0 + 60, CELL.y1 - 60);
  if (mixed <= 0) return p0;
  const p1 = [lerp(CELL.x0 + 90, CELL.x1 - 90, m.k1) + 30 * Math.sin(t * 1.3 + m.ph), lerp(CELL.y0 + 90, CELL.y1 - 90, m.k2) + 30 * Math.cos(t * 1.1 + m.ph)];
  return [lerp(p0[0], p1[0], mixed), lerp(p0[1], p1[1], mixed)];
}
function enzPos(e, t, mixed) {
  const p0 = [VAC.x + e.x * VAC.rx * 1.2 + 20 * Math.sin(t * e.sp * 3 + e.ph), VAC.y + e.y * VAC.ry * 1.2 + 20 * Math.cos(t * e.sp * 2.4 + e.ph)];
  if (mixed <= 0) return p0;
  const p1 = [540 + e.x * 700 + 40 * Math.sin(t * 1.4 + e.ph), 850 + e.y * 650 + 40 * Math.cos(t * 1.2 + e.ph)];
  return [lerp(p0[0], p1[0], mixed), lerp(p0[1], p1[1], mixed)];
}

// ---------------------------------------------------------------- shots
SC.trap = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const dive = c.every - 0.15;
  if (t < dive) { // the onion's face, then the camera dives into it
    const cam = { x: KIT.onionX, y: KIT.onionY - 10, zoom: lerp(2.3, 7, E.inExpo(inv(c.thing_end || dive - 0.5, dive, t))), rot: 0 };
    applyCam(cam);
    kitchenBg(t); kitchenCounter(); cuttingBoard();
    onionBulb(ctx, KIT.onionX, KIT.onionY, KIT.onionR, t, { face: 'evil', faceK: 1, look: 0 });
    return { glow: 0.6, zblur: 0.4 * ramp(t, dive - 0.45, dive), flashTop: 0 };
  }
  const l2 = t - dive, hi = wallCellIndexNear(540, 900);
  const cam = { x: 540, y: 900, zoom: lerp(1.6, 1.0, E.outCubic(clamp(l2 / 1.2))) * (1 + 0.04 * l2), rot: 0.05 * (1 - ramp(l2, 0, 1.2)) };
  applyCam(cam);
  cellWall(t, hi, ramp(t, c.cell, c.cell + 0.3), ramp(t, c.booby - 0.1, c.booby + 0.2));
  screenSpace();
  bombIcon(540, 930, 1.5, pop(t, c.tiny, 0.35), t);
  bigWord('BOOBY TRAP', 540, 520, 140, '#FF5A6E', pop(t, c.booby, 0.3), -0.04);
  return { glow: 0.7, flash: 0.6 * (1 - ramp(l2, 0, 0.25)), zblur: 0.25 * (1 - ramp(l2, 0, 0.5)) };
};

SC.rooms = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(t, [[shot.start, 540, 850, 0.8], [c.chemicals + 0.3, 540, 860, 1.0], [c.separate, 520, 860, 1.05], [c.until, 540, 800, 0.95], [shot.end, 540, 850, 1.02]]);
  const smash = c.smashes + 0.12;
  const [sx, sy] = shake(t, t > smash ? 22 * (1 - ramp(t, smash, smash + 0.6)) : 0, 30);
  cam.sx = sx; cam.sy = sy;
  applyCam(cam);
  const broken = ramp(t, smash, smash + 0.9);
  cellInterior(t, { wallGlow: ramp(t, c.separate, c.separate + 0.3) * (1 - ramp(t, c.until, c.until + 0.4)), broken });
  const mixed = ramp(t, smash, smash + 1.6);
  for (const m of IN_MOL) { const [x, y] = molPos(m, t, mixed); molecule(x, y, 'pre', 1.1, t, m.ph); }
  for (const e of IN_ENZ) { const [x, y] = enzPos(e, t, mixed); enzyme(x, y, 1.0, t + e.ph, '#FF9A3C', Math.sin(t + e.ph)); }
  // the knife comes down through the wall
  const kIn = ramp(t, c.knife1 - 0.1, smash, E.inCubic);
  if (t > c.knife1 - 0.1 && t < smash + 0.7) {
    const ky = lerp(-700, 520, kIn) + (t > smash ? (t - smash) * 1400 : 0);
    ctx.save(); ctx.translate(560, ky); ctx.rotate(Math.PI / 2 - 0.1);
    knife(ctx, -420, 0, 0, 2.2, 'chef');
    ctx.restore();
  }
  screenSpace();
  // labels
  const k1 = pop(t, c.two + 0.2), k2 = pop(t, c.chemicals + 0.35);
  pill(540, 470, 'ENZYME', '#FF9A3C', k1 * (1 - ramp(t, smash, smash + 0.3)), 50);
  pill(540, 1260, 'SULFUR STUFF', '#C8A8FF', k2 * (1 - ramp(t, smash, smash + 0.3)), 50);
  if (t > c.separate) bigWord('ROOM 1', 330, 640, 64, '#FF9A3C', pop(t, c.separate, 0.3) * (1 - ramp(t, c.until, c.until + 0.3)), -0.1);
  if (t > c.separate + 0.25) bigWord('ROOM 2', 820, 1080, 64, '#C8A8FF', pop(t, c.separate + 0.25, 0.3) * (1 - ramp(t, c.until, c.until + 0.3)), 0.08);
  bigWord('SMASH!', 540, 560, 170, '#FF5A6E', pop(t, smash, 0.25) * (1 - ramp(t, smash + 1.0, smash + 1.3)), -0.08);
  return { glow: 0.75, flash: 0.7 * (1 - ramp(t, smash, smash + 0.2)) * (t > smash ? 1 : 0), capY: 1400 };
};

SC.mix = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(t, [[shot.start, 540, 850, 1.02], [c.enzyme1, 470, 830, 1.35], [c.compound + 0.3, 470, 830, 1.4], [c.second, 600, 860, 1.25], [c.turns, 560, 800, 1.1], [c.gas, 540, 700, 1.0], [shot.end, 540, 640, 1.05]]);
  applyCam(cam);
  cellInterior(t, { broken: 1 });
  // conversions: each molecule turns yellow (enzyme 1), then green gas (enzyme 2) that floats up and out
  const star = IN_MOL[3];
  IN_MOL.forEach((m, i) => {
    const t1 = (i === 3 ? c.sulfur : c.sulfur + 0.1 + i * 0.07), t2 = c.turns + 0.1 + (i % 11) * 0.09;
    let [x, y] = molPos(m, t, 1);
    if (m === star) { x = 470 + 90; y = 830; }
    let kind = 'pre', pp = 0;
    if (t >= t1) { kind = 'acid'; pp = inv(t1, t1 + 0.3, t); }
    if (t >= t2) { kind = 'gas'; pp = inv(t2, t2 + 0.3, t); const up = Math.max(0, t - t2); y -= up * up * 90 + up * 60; x += Math.sin(up * 2 + i) * 30; }
    molecule(x, y, kind, m === star ? 1.6 : 1.1, t, m.ph, pp);
  });
  IN_ENZ.forEach((e, i) => { const [x, y] = enzPos(e, t, 1); enzyme(x, y, 1.0, t + e.ph, '#FF9A3C', Math.sin(t + e.ph)); });
  // the featured enzyme #1 chomping the star molecule
  const ch1 = t > c.enzyme1 && t < c.compound + 0.2 ? 0.1 + 0.6 * Math.abs(Math.sin((t - c.enzyme1) * 9)) : null;
  enzyme(370, 830, 1.5, t, '#FF9A3C', 0, '1', ch1);
  // enzyme #2 arrives
  const k2 = ramp(t, c.second - 0.1, c.second + 0.35, E.outBack);
  if (k2 > 0) enzyme(lerp(1100, 700, k2), 900, 1.7, t, '#4DFFB4', Math.PI, '2', t > c.turns - 0.1 && t < c.into + 0.5 ? 0.1 + 0.6 * Math.abs(Math.sin(t * 10)) : null);
  screenSpace();
  pill(540, 470, 'SULFUR COMPOUND', '#FFD447', pop(t, c.sulfur + 0.1) * (1 - ramp(t, c.second - 0.2, c.second)), 46);
  pill(540, 470, 'ENZYME #2', '#4DFFB4', pop(t, c.second + 0.1) * (1 - ramp(t, c.tear - 0.2, c.tear)), 50);
  bigWord('TEAR GAS', 540, 520, 170, '#8CFF9E', pop(t, c.tear, 0.3), -0.05);
  return { glow: 0.8, flash: 0.35 * (1 - ramp(t, c.second, c.second + 0.2)) * (t > c.second ? 1 : 0) };
};

// the long-name card with the molecule: CH3-CH2-CH=S(+)-O(-)
SC.name = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#12361E', '#030C06');
  motes(t, 0.6);
  screenSpace();
  const k = pop(t, shot.start + 0.05, 0.4);
  // molecule, ball and stick, slowly turning
  const cx = 540, cy = 960, rot = 0.25 * Math.sin(t * 0.8);
  const atoms = [['C', -270, 30], ['C', -130, -40], ['C', 10, 30], ['S', 160, -40], ['O', 300, 30]];
  const P = atoms.map(([e, x, y]) => [cx + (x * Math.cos(rot) - y * Math.sin(rot)) * k, cy + (x * Math.sin(rot) + y * Math.cos(rot)) * k]);
  for (let i = 0; i < 4; i++) {
    line(ctx, P[i][0], P[i][1], P[i + 1][0], P[i + 1][1], 18, '#CFD6E0');
    if (i === 2) line(ctx, P[i][0] + 8, P[i][1] + 16, P[i + 1][0] + 8, P[i + 1][1] + 16, 10, '#CFD6E0');
  }
  atoms.forEach(([e], i) => {
    const col = e === 'C' ? '#4A5264' : e === 'S' ? '#FFD447' : '#FF5A6E', r = e === 'C' ? 46 : 54;
    const [x, y] = P[i];
    if (e === 'C') for (const a of [-2.2, -0.9, 2.2]) { const hx = x + Math.cos(a + i) * 80, hy = y + Math.sin(a + i) * 80; line(ctx, x, y, hx, hy, 10, '#CFD6E0'); circle(ctx, hx, hy, 24, '#F4F6FA'); }
    circle(ctx, x, y, r * k, col); circle(ctx, x - r * 0.3, y - r * 0.3, r * 0.3 * k, 'rgba(255,255,255,0.45)');
    ctx.font = `900 ${34 * k}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFFFFF'; ctx.fillText(e, x, y + 2);
    softDot(gctx, x, y, r * 2.2, col, 0.4);
  });
  applyCam(CAM0);
  for (let i = 0; i < 9; i++) { // tear-gas puffs drifting up off the molecule
    const ph = (t * 0.22 + i / 9) % 1;
    molecule(540 + Math.sin(i * 2.3 + t * 0.8) * 330, lerp(1150, 720, ph), 'gas', 0.9 + 0.3 * hash(i), t, i, 0);
  }
  screenSpace();
  // the name, typed out letter by letter while she says it
  const full = 'syn-PROPANETHIAL-S-OXIDE', n = Math.round(full.length * inv(c.prop - 0.1, c.soxide_end, t));
  const txt = full.slice(0, n);
  ctx.font = '900 70px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const [l1, l2] = [txt.slice(0, 17), txt.slice(17)];
  for (const [s, y] of [[l1, 560], [l2, 650]]) {
    if (!s) continue;
    ctx.lineWidth = 12; ctx.strokeStyle = '#06140A'; ctx.strokeText(s, 540, y);
    ctx.fillStyle = '#8CFF9E'; ctx.fillText(s, 540, y);
  }
  pill(540, 1200, 'THE TEAR GAS', '#8CFF9E', pop(t, c.name_w + 0.1) * (1 - ramp(t, c.prop - 0.2, c.prop)), 46);
  return { glow: 0.7, push: { k: 1 + 0.06 * lt / D, cx: 540, cy: 900 }, zblur: 0.15 * (1 - ramp(lt, 0, 0.35)) };
};
