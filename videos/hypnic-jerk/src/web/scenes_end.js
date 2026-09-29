// Hypnic-jerk Short, part 3: the tree theory, triggers, the hiccup reveal, and goodnight.
'use strict';

let LEAVES = null, FALLLEAF = null;
function initScenes4() {
  const rng = mulberry32(606);
  LEAVES = [...Array(46)].map(() => ({ x: -200 + rng() * 1500, y: 450 + rng() * 700, r: 50 + rng() * 90, ph: rng() * 6, d: rng() }));
  FALLLEAF = [...Array(16)].map(() => ({ x: 250 + rng() * 600, y: 700 + rng() * 150, vx: (rng() - 0.5) * 260, vy: 60 + rng() * 120, spin: (rng() - 0.5) * 8, ph: rng() * 6 }));
}

// ---------------------------------------------------------------- moonlit jungle + the sleeping ancestor
const MOON = { x: 540, y: 700, r: 300 };
// a clump of pointed leaves; c = ctx or gctx (occluder), col = fill
function leafClump(c, x, y, r, col, rot = 0) {
  c.fillStyle = col;
  for (let i = 0; i < 7; i++) {
    const a = rot + i * 0.9, lx = x + Math.cos(a) * r * 0.35, ly = y + Math.sin(a) * r * 0.25;
    c.save(); c.translate(lx, ly); c.rotate(a);
    c.beginPath(); c.moveTo(-r * 0.62, 0); c.quadraticCurveTo(0, -r * 0.3, r * 0.62, 0); c.quadraticCurveTo(0, r * 0.3, -r * 0.62, 0); c.fill();
    c.restore();
  }
}
// side-view monkey lying along the branch, facing left. o: slip 0..1, grab 0..1, eyes 0 (shut) .. 1 (wide), grin
// occ = draw a plain black occluder into the glow layer instead
function ancestor(c, x, y, s, t, o = {}, occ = false) {
  const slip = o.slip || 0, grab = o.grab || 0, eyes = o.eyes || 0;
  const dark = occ ? '#000000' : '#0A0818', rim = 'rgba(200,215,255,0.7)';
  c.save(); c.translate(x, y); c.rotate(0.55 * slip * (1 - grab) + 0.05 * Math.sin(t * 1.3) * (1 - grab)); c.scale(s, s);
  const breathe = 1 + 0.03 * Math.sin(t * 2.2) * (1 - grab);
  c.beginPath(); c.moveTo(95, 10); c.bezierCurveTo(170, 40, 190, 150, 130, 175); c.bezierCurveTo(100, 188, 90, 160, 112, 150);
  c.lineWidth = 16; c.strokeStyle = dark; c.lineCap = 'round'; c.stroke();
  const hang = lerp(0.2, 1, slip) * (1 - grab);
  line(c, 60, 20, 95, 70 + 20 * hang, 30, dark);
  line(c, -40, 18, lerp(-70, -40, grab), lerp(90 + 70 * hang, 40, grab), 26, dark);
  c.save(); c.scale(1, breathe);
  c.beginPath(); c.ellipse(10, -12, 115, 58, -0.05, 0, Math.PI * 2); c.fillStyle = dark; c.fill();
  if (!occ) { c.lineWidth = 6; c.strokeStyle = rim; c.beginPath(); c.ellipse(10, -12, 115, 58, -0.05, Math.PI * 1.08, Math.PI * 1.92); c.stroke(); }
  c.restore();
  const hx = -118, hy = -34 - 14 * grab;
  circle(c, hx, hy, 50, dark); ellipse(c, hx - 42, hy + 16, 30, 24, dark); circle(c, hx + 22, hy - 30, 14, dark);
  if (!occ) {
    c.lineWidth = 6; c.strokeStyle = rim; c.beginPath(); c.arc(hx, hy, 50, Math.PI * 1.1, Math.PI * 1.75); c.stroke();
    ellipse(c, hx - 20, hy + 4, 28, 26, '#3A3050');
    if (eyes < 0.1) { c.beginPath(); c.moveTo(hx - 34, hy - 2); c.quadraticCurveTo(hx - 24, hy + 6, hx - 12, hy - 2); c.lineWidth = 4; c.strokeStyle = '#CFD8FF'; c.stroke(); }
    else { circle(c, hx - 24, hy - 2, 9 + 6 * eyes, '#FFFFFF'); circle(c, hx - 28, hy - 1, 4 + 2 * eyes, '#0C0A1C'); }
    if (o.grin > 0) { c.beginPath(); c.moveTo(hx - 56, hy + 22); c.quadraticCurveTo(hx - 40, hy + 22 + 14 * o.grin, hx - 22, hy + 22); c.lineWidth = 4; c.strokeStyle = '#E8E0FF'; c.stroke(); }
  } else if (eyes > 0.1) circle(c, hx - 24, hy - 2, 9 + 6 * eyes, 'rgba(255,255,255,0.7)');
  const ax = lerp(-70, -95, grab), ay = lerp(80 + 110 * hang, 40, grab);
  line(c, -60, 0, ax, ay, 30, dark); circle(c, ax, ay, 20, dark);
  line(c, 70, 10, lerp(40, 70, grab), lerp(80, 46, grab), 34, dark);
  c.restore();
}
function jungle(cam, t, o = {}) {
  screenSpace();
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#050820'); g.addColorStop(0.45, '#121A4E'); g.addColorStop(0.75, '#231C5A'); g.addColorStop(1, '#0A0A20');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const pm = parallax(cam, 0.3);
  camTransform(ctx, pm, 1); camTransform(gctx, pm, 0.5);
  for (const s of STARS) circle(ctx, -300 + s.x * 1700, -200 + s.y * 1400, s.r, `rgba(220,230,255,${0.3 + 0.3 * Math.sin(t * 2 + s.ph)})`);
  // the moon: halo in the scene, only a gentle bloom
  const halo = ctx.createRadialGradient(MOON.x, MOON.y, MOON.r * 0.9, MOON.x, MOON.y, MOON.r * 2.1);
  halo.addColorStop(0, 'rgba(170,190,255,0.45)'); halo.addColorStop(1, 'rgba(120,140,255,0)');
  ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(MOON.x, MOON.y, MOON.r * 2.1, 0, 7); ctx.fill();
  const mg = ctx.createRadialGradient(MOON.x - 80, MOON.y - 90, 30, MOON.x, MOON.y, MOON.r);
  mg.addColorStop(0, '#F4F7FF'); mg.addColorStop(0.7, '#D9E3FF'); mg.addColorStop(1, '#B7C7F5');
  ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(MOON.x, MOON.y, MOON.r, 0, 7); ctx.fill();
  for (const [dx, dy, r] of [[-110, -60, 50], [90, 40, 70], [-20, 150, 40], [140, -130, 30], [-160, 100, 28]]) circle(ctx, MOON.x + dx, MOON.y + dy, r, 'rgba(150,165,215,0.3)');
  softDot(gctx, MOON.x, MOON.y, MOON.r * 1.4, '#BFD4FF', 0.32);
  // far canopy (parallax 0.55)
  const pf = parallax(cam, 0.55);
  camTransform(ctx, pf, 1);
  for (const L of LEAVES) if (L.d < 0.5) leafClump(ctx, L.x, 1240 + L.y * 0.3 + 30 * Math.sin(L.ph), L.r * 1.4, '#171A4A', L.ph);
  ctx.fillStyle = '#12143F'; ctx.fillRect(-500, 1420, 2100, 1200);
  // the near tree: trunk from bottom-left, a thick branch across the moon (+ occluders in the glow layer)
  applyCam(cam);
  const sway = 6 * Math.sin(t * 0.8) + (o.bounce || 0);
  const tree = (c, col) => {
    c.beginPath(); c.moveTo(-260, 2300); c.bezierCurveTo(-120, 1500, -40, 1100, 60, 900 + sway);
    c.lineTo(1300, 870 + sway * 0.6); c.lineTo(1300, 935 + sway * 0.6); c.bezierCurveTo(700, 955 + sway, 300, 965 + sway, 140, 1005 + sway);
    c.bezierCurveTo(60, 1250, 20, 1600, 60, 2300); c.closePath(); c.fillStyle = col; c.fill();
    for (const [vx, len] of [[860, 420], [990, 560], [330, 300]]) {
      c.beginPath(); c.moveTo(vx, 885 + sway * 0.7); c.quadraticCurveTo(vx + 20 * Math.sin(t + vx), 885 + len / 2, vx - 10, 885 + len);
      c.lineWidth = 8; c.strokeStyle = col; c.stroke();
    }
    for (const L of LEAVES) if (L.d > 0.62) leafClump(c, L.x, L.y - 260 + 8 * Math.sin(t * 1.1 + L.ph) + (o.bounce || 0) * 0.5, L.r * 1.1, col, L.ph);
  };
  tree(ctx, '#06051A'); tree(gctx, '#000000');
  ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(190,205,255,0.45)';
  ctx.beginPath(); ctx.moveTo(60, 902 + sway); ctx.lineTo(1300, 872 + sway * 0.6); ctx.stroke();
  return sway;
}
function stamp(txt, x, y, k, col = '#FF4D5E', rot = -0.18, size = 120) {
  if (k <= 0) return;
  const s = lerp(2.2, 1, E.outCubic(clamp(k)));
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.globalAlpha = clamp(k * 3);
  ctx.font = `400 ${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + 70, h = size * 1.35;
  rrect(ctx, -w / 2, -h / 2, w, h, 18); ctx.lineWidth = 12; ctx.strokeStyle = col; ctx.stroke();
  rrect(ctx, -w / 2 + 14, -h / 2 + 14, w - 28, h - 28, 10); ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = col; ctx.fillText(txt, 0, 6);
  ctx.globalAlpha = 1; ctx.restore();
}
SC.trees = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const jt = c.tree;
  const push = E.inOutSine(clamp(lt / D));
  const hit = t >= jt ? t - jt : -1;
  const [shx, shy] = hit >= 0 ? shake(t, 22 * Math.exp(-hit * 5), 24, 8) : [0, 0];
  const cam = { x: lerp(560, 500, push), y: lerp(880, 840, push), zoom: lerp(1.0, 1.22, push) * (hit >= 0 ? 1 + 0.05 * Math.exp(-hit * 7) : 1), rot: lerp(-0.02, 0.015, push), sx: shx, sy: shy };
  const bounce = hit >= 0 ? 26 * Math.exp(-hit * 4) * Math.cos(hit * 16) : 0;
  const sway = jungle(cam, t, { bounce });
  applyCam(cam);
  const slip = E.inOutSine(inv(c.reflex - 0.2, jt, t));
  const grab = hit >= 0 ? E.outBack(clamp(hit / 0.12), 1.6) : 0;
  const eyes = hit >= 0 ? clamp(hit / 0.06) * (1 - 0.4 * ramp(hit, 0.8, 1.4)) : 0;
  const ao = { slip, grab: clamp(grab), eyes, grin: ramp(t, c.chuckle, c.chuckle + 0.3) };
  ancestor(gctx, 560, 850 + sway * 0.8, 1.45, t, ao, true);
  ancestor(ctx, 560, 850 + sway * 0.8, 1.45, t, ao);
  if (hit < 0) zzz(400, 700, t, shot.start + 0.2, 1 - slip, 1.0);
  // leaves shaken loose
  if (hit >= 0) for (const f of FALLLEAF) {
    const px = f.x + f.vx * hit + 30 * Math.sin(hit * 3 + f.ph), py = f.y + f.vy * hit + 180 * hit * hit;
    ctx.save(); ctx.translate(px, py); ctx.rotate(f.ph + hit * f.spin);
    ellipse(ctx, 0, 0, 22, 11, `rgba(12,10,30,${1 - clamp(hit / 2.5)})`); ctx.restore();
  }
  screenSpace();
  if (hit >= 0 && hit < 0.45) { const [ax, ay] = toScreen(cam, 390, 790); shockLines(ax, ay, 180, hit / 0.45, 12, '#FFFFFF', 13); }
  pill(300, 300, 'ONE THEORY', '#4DFFB4', ramp(t, c.reflex - 0.9, c.reflex - 0.6) * (1 - 0.0), 42);
  const sk = inv(c.unproven - 0.05, c.unproven + 0.12, t);
  stamp('UNPROVEN', 540, 420, sk, '#FF4D5E', -0.16, 140);
  const enter = 1 - E.outCubic(inv(0, 0.2, lt));
  return { grain: 1, flash: 0.3 * enter + (t >= c.unproven ? 0.12 * Math.exp(-(t - c.unproven) * 14) : 0), zblur: -0.15 * enter, zcx: 540, zcy: 800 };
};

// ---------------------------------------------------------------- triggers + harmless
function card(x, y, k, title, col, draw, t, alpha = 1, shrink = 1) { // a wide row: icon on the left, big label
  if (k <= 0) return;
  const s = E.outBack(clamp(k), 2) * shrink;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = alpha; ctx.translate(x + (1 - clamp(k)) * 300, y); ctx.scale(s, s);
  rrect(ctx, -420, -105, 840, 210, 48); ctx.fillStyle = 'rgba(10,14,40,0.94)'; ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = col; ctx.stroke();
  ctx.save(); ctx.translate(-300, 0); ctx.scale(0.95, 0.95); draw(t); ctx.restore();
  ctx.font = '900 64px Montserrat'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillStyle = col; ctx.fillText(title, -170, 4);
  ctx.restore();
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); gctx.translate(x + (1 - clamp(k)) * 300, y); gctx.scale(s, s);
  rrect(gctx, -420, -105, 840, 210, 48); gctx.lineWidth = 16; gctx.strokeStyle = rgba(col, 0.6 * alpha); gctx.stroke(); gctx.restore();
}
function iconStress(t) {
  const j = shake(t, 3, 30, 2);
  ctx.translate(j[0], j[1]);
  circle(ctx, 0, 0, 80, '#FFC43D');
  ellipse(ctx, -28, -12, 14, 18, '#FFFFFF'); ellipse(ctx, 28, -12, 14, 18, '#FFFFFF');
  circle(ctx, -28, -10, 6, '#1A1300'); circle(ctx, 28, -10, 6, '#1A1300');
  line(ctx, -46, -44, -14, -32, 7, '#5A3A00'); line(ctx, 46, -44, 14, -32, 7, '#5A3A00');
  ctx.beginPath(); ctx.moveTo(-34, 36); for (let i = 1; i <= 6; i++) ctx.lineTo(-34 + i * 11.3, 36 + (i % 2 ? -10 : 0));
  ctx.lineWidth = 6; ctx.strokeStyle = '#5A1522'; ctx.stroke();
  sweatDrop(ctx, 70, -40, 1.3, 1);
  for (const [a, r] of [[-2.4, 108], [-0.7, 108]]) { ctx.save(); ctx.translate(Math.cos(a) * r, Math.sin(a) * r); ctx.rotate(a + 1.6); line(ctx, -14, 0, 14, 0, 7, '#FF5A6E'); ctx.restore(); }
}
function iconCoffee(t) {
  for (let i = 0; i < 3; i++) {
    const ph = (t * 0.8 + i / 3) % 1;
    ctx.beginPath(); ctx.moveTo(-30 + i * 30, -60 - ph * 50);
    ctx.bezierCurveTo(-45 + i * 30, -80 - ph * 50, -15 + i * 30, -95 - ph * 50, -30 + i * 30, -115 - ph * 50);
    ctx.lineWidth = 7; ctx.strokeStyle = `rgba(255,255,255,${0.6 * Math.sin(Math.PI * ph)})`; ctx.stroke();
  }
  rrect(ctx, -70, -50, 140, 130, 26); ctx.fillStyle = '#F4F0E6'; ctx.fill();
  ctx.beginPath(); ctx.arc(76, 14, 30, -1.2, 1.2); ctx.lineWidth = 16; ctx.strokeStyle = '#F4F0E6'; ctx.stroke();
  ellipse(ctx, 0, -48, 66, 14, '#5A3218'); ellipse(ctx, -10, -50, 30, 5, 'rgba(255,220,180,0.4)');
  rrect(ctx, -70, 10, 140, 18, 6); ctx.fillStyle = '#FF9A3C'; ctx.fill();
}
function iconClock(t) {
  circle(ctx, 0, 0, 84, '#DDE6FF'); circle(ctx, 0, 0, 70, '#0E1433');
  for (const s of [-1, 1]) { circle(ctx, s * 58, -76, 22, '#DDE6FF'); line(ctx, s * 40, 70, s * 56, 94, 10, '#DDE6FF'); }
  ctx.font = '400 50px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FF5A6E';
  ctx.fillText('3:00', 0, 2);
  rrect(ctx, -34, 34, 60, 22, 5); ctx.lineWidth = 4; ctx.strokeStyle = '#FF5A6E'; ctx.stroke();
  rrect(ctx, 28, 40, 6, 10, 2); ctx.fillStyle = '#FF5A6E'; ctx.fill();
  rrect(ctx, -30, 38, 12 + 3 * Math.sin(t * 8), 14, 3); ctx.fill();
}
function shield(x, y, s, k, t) {
  if (k <= 0) return;
  const sc = s * E.outBack(clamp(k), 2);
  const path = (c) => {
    c.beginPath(); c.moveTo(0, -150); c.bezierCurveTo(70, -110, 110, -110, 130, -110);
    c.bezierCurveTo(130, 20, 90, 110, 0, 160); c.bezierCurveTo(-90, 110, -130, 20, -130, -110);
    c.bezierCurveTo(-110, -110, -70, -110, 0, -150); c.closePath();
  };
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.scale(sc, sc);
  path(ctx);
  const g = ctx.createLinearGradient(-130, -150, 130, 160);
  g.addColorStop(0, '#6BFFC4'); g.addColorStop(1, '#0F9E6A');
  ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = '#E8FFF6'; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-55, 5); ctx.lineTo(-12, 50); ctx.lineTo(62, -44);
  ctx.lineWidth = 26; ctx.strokeStyle = '#FFFFFF'; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.save(); path(ctx); ctx.clip();
  const sx = -260 + ((t * 420) % 620);
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.moveTo(sx, -160); ctx.lineTo(sx + 50, -160); ctx.lineTo(sx - 60, 170); ctx.lineTo(sx - 110, 170); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.restore();
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); gctx.translate(x, y); gctx.scale(sc, sc); path(gctx); gctx.fillStyle = 'rgba(77,255,180,0.5)'; gctx.fill(); gctx.restore();
}
SC.triggers = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#191848', '#05050F');
  for (const b of BOKEH) softDot(ctx, (b.x + t * 12) % (W + 100) - 50, b.y + 10 * Math.sin(t + b.ph), b.r, '#8F7BFF', b.a * 0.8);
  const calm = E.inOutSine(inv(c.harmless - 0.25, c.harmless + 0.3, t));
  const fade = 1 - 0.55 * calm;
  ctx.globalAlpha = 1;
  const cs = 1 - 0.12 * calm;
  card(540, 500, ramp(t, c.stress - 0.08, c.stress + 0.15), 'STRESS', '#FF5A6E', iconStress, t, fade, cs);
  card(540, 750, ramp(t, c.caffeine - 0.08, c.caffeine + 0.15), 'CAFFEINE', '#FF9A3C', iconCoffee, t, fade, cs);
  card(540, 1000, ramp(t, c.short - 0.08, c.short + 0.15), 'SHORT SLEEP', '#8FB8FF', iconClock, t, fade, cs);
  // the odds meter
  const mk = ramp(t, c.likely - 0.5, c.likely - 0.25);
  if (mk > 0) {
    screenSpace();
    ctx.globalAlpha = mk * fade;
    const x0 = 160, x1 = 920, yy = 270;
    ctx.font = '900 40px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFFFFF';
    ctx.fillText('JOLT ODDS', 540, yy - 70);
    rrect(ctx, x0, yy - 26, x1 - x0, 52, 26); ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fill();
    const v = lerp(0.22, 0.88, E.outCubic(inv(c.likely - 0.3, c.likely + 0.5, t)));
    const g = ctx.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, '#FFD447'); g.addColorStop(0.6, '#FF9A3C'); g.addColorStop(1, '#FF3A4A');
    rrect(ctx, x0 + 6, yy - 20, (x1 - x0 - 12) * v, 40, 20); ctx.fillStyle = g; ctx.fill();
    softDot(gctx, x0 + (x1 - x0) * v, yy, 90, '#FF7A3C', mk);
    ctx.globalAlpha = 1;
  }
  shield(540, 750 + 10 * Math.sin(t * 3), 1.6 * (1 + 0.02 * Math.sin(t * 5)), calm, t);
  const enter = 1 - E.outCubic(inv(0, 0.18, lt));
  return { grain: 1, flash: 0.3 * enter, zblur: 0.15 * enter, zcx: 540, zcy: 600, push: { k: 1 + 0.06 * E.inOutSine(clamp(lt / D)), cx: 540, cy: 700 } };
};

// ---------------------------------------------------------------- the hiccup reveal
function chestInset(x, y, R, t, hic, k) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 1.6);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  circle(ctx, 0, 0, R + 10, '#E8EEFF');
  ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.clip();
  const g = ctx.createRadialGradient(0, -40, 20, 0, 0, R);
  g.addColorStop(0, '#1C2A6A'); g.addColorStop(1, '#070B26');
  ctx.fillStyle = g; ctx.fillRect(-R, -R, 2 * R, 2 * R);
  // ribs
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(0, -110 + i * 34, 170, 40, 0, Math.PI * 0.05, Math.PI * 0.95); ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(200,220,255,0.18)'; ctx.stroke(); }
  // lungs, gulping air on the hiccup
  const gasp = 1 + 0.08 * hic;
  for (const sd of [-1, 1]) {
    ctx.save(); ctx.translate(sd * 70, -30); ctx.scale(gasp, gasp);
    ctx.beginPath(); ctx.ellipse(0, 0, 62, 105, sd * -0.12, 0, Math.PI * 2);
    const lg = ctx.createRadialGradient(-10, -30, 10, 0, 0, 110);
    lg.addColorStop(0, '#FFB9C8'); lg.addColorStop(1, '#C75A7A'); ctx.fillStyle = lg; ctx.fill();
    ctx.restore();
  }
  // the diaphragm: a dome under the lungs that snaps DOWN when it twitches
  const dy = 95 + 34 * hic;
  const dcol = mixHex('#E48AA6', '#FF2A40', clamp(hic * 1.4));
  ctx.beginPath(); ctx.moveTo(-190, dy + 60); ctx.quadraticCurveTo(0, dy - 70 + 40 * hic, 190, dy + 60);
  ctx.lineWidth = 30; ctx.strokeStyle = dcol; ctx.lineCap = 'round'; ctx.stroke();
  ctx.restore();
  // label + glow
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); gctx.translate(x, y); gctx.scale(s, s);
  gctx.beginPath(); gctx.moveTo(-190, dy + 60); gctx.quadraticCurveTo(0, dy - 70 + 40 * hic, 190, dy + 60);
  gctx.lineWidth = 50; gctx.strokeStyle = rgba('#FF2A40', 0.9 * hic); gctx.stroke(); gctx.restore();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.font = '900 30px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.lineWidth = 8; ctx.strokeStyle = '#0B0B1A'; ctx.strokeText('DIAPHRAGM', 0, dy + 104); ctx.fillStyle = '#FFB9C8'; ctx.fillText('DIAPHRAGM', 0, dy + 104);
  ctx.restore();
}
function speech(txt, x, y, k, col = '#FFFFFF', size = 90, rot = -0.08) {
  if (k <= 0) return;
  const s = E.outBack(clamp(k), 2.4);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.font = `400 ${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + 60, h = size * 1.3;
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = '#FFFFFF'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(-w * 0.2, h / 2 - 6); ctx.lineTo(-w * 0.34, h / 2 + 40); ctx.lineTo(-w * 0.02, h / 2 - 6); ctx.fill();
  ctx.lineWidth = 7; ctx.strokeStyle = '#0B0B1A'; rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.stroke();
  ctx.fillStyle = col; ctx.fillText(txt, 0, 4);
  ctx.restore();
}
SC.hiccups = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const h1 = c.hiccups + 0.1, h2 = c.hiccups + 0.72;
  const hicAt = (tt) => Math.max(tt >= h1 ? Math.exp(-(tt - h1) * 7) : 0, tt >= h2 ? 0.8 * Math.exp(-(tt - h2) * 7) : 0);
  const hic = hicAt(t);
  const pre = E.inOutSine(inv(c.twitch - 0.3, c.as + 0.4, t));
  const cam = { x: lerp(540, 520, pre), y: lerp(930, 900, pre), zoom: lerp(1.7, 1.95, pre) * (1 + 0.04 * hic), rot: 0 };
  const [sx, sy] = shake(t, 2 + 18 * hic, 26, 5);
  cam.sx = sx; cam.sy = sy;
  const curious = { eyeOpen: 1.15, pupil: 0.9, lookX: 0.4, lookY: -0.6, browY: 0.8, browTilt: 0.6, mouth: 'o', mouthOpen: 0.3, blink: 0, cross: 0 };
  let face = lerpFace(FACES.calm, curious, ramp(t, c.oh - 0.1, c.oh + 0.2));
  if (hic > 0.05) face = lerpFace(face, Object.assign({}, FACES.startled, { mouth: 'o', mouthOpen: 0.9 }), clamp(hic * 1.5));
  const o = bedFrontScene(cam, t, { pose: POSE_GRIP, face, lamp: 1, bodyDY: -26 * hic, headDY: -8 * hic });
  // lightbulb "fun fact"
  const lb = ramp(t, c.fact - 0.15, c.fact + 0.1) * (1 - ramp(t, c.twitch, c.twitch + 0.3));
  if (lb > 0) {
    const [hx, hy] = toScreen(cam, ...toWorld(o.st, o.r.head));
    const s = E.outBack(clamp(lb), 2.2);
    screenSpace(); ctx.save(); ctx.translate(hx + 150, hy - 200); ctx.scale(s, s);
    softDot(ctx, 0, 0, 120, '#FFE27A', 0.5); circle(ctx, 0, 0, 48, '#FFE27A');
    rrect(ctx, -22, 40, 44, 34, 8); ctx.fillStyle = '#9AA3C4'; ctx.fill();
    line(ctx, -14, -10, 0, 12, 5, '#B8860B'); line(ctx, 14, -10, 0, 12, 5, '#B8860B');
    ctx.restore(); softDot(gctx, hx + 150, hy - 200, 150, '#FFE27A', lb);
  }
  pill(540, 250, 'FUN FACT', '#FFD447', ramp(t, c.oh, c.oh + 0.25) * (1 - ramp(t, h1 + 0.15, h1 + 0.3)), 46);
  const ik = ramp(t, c.twitch - 0.1, c.twitch + 0.25);
  if (ik > 0) { const [chx, chy] = toScreen(cam, ...toWorld(o.st, o.r.chest)); screenSpace(); ctx.setLineDash([12, 10]); line(ctx, chx + 40, chy - 10, lerp(chx, 820, ik), lerp(chy, 560, ik), 5, 'rgba(232,238,255,0.8)'); ctx.setLineDash([]); circle(ctx, chx + 40, chy - 10, 10, '#E8EEFF'); }
  chestInset(830, 520, 175, t, hic, ik);
  speech('HIC!', 300, 640, t >= h1 ? clamp((t - h1) / 0.12) : 0, '#FF4D7A', 100);
  if (t >= h2) speech('HIC!', 250, 470, clamp((t - h2) / 0.12) * 0.75, '#FF4D7A', 80, 0.1);
  const mk = ramp(t, h1 + 0.25, h1 + 0.45);
  if (mk > 0) {
    pill(540, 250, 'BOTH = MYOCLONUS', '#FF86A6', mk, 48);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = mk;
    ctx.font = '800 34px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    ctx.lineWidth = 9; ctx.strokeStyle = '#0B0B1A'; ctx.strokeText('quick, involuntary muscle twitches', 540, 335);
    ctx.fillStyle = '#FFD6E0'; ctx.fillText('quick, involuntary muscle twitches', 540, 335);
    ctx.restore();
  }
  const enter = 1 - E.outCubic(inv(0, 0.18, lt));
  return { grain: 1, flash: 0.3 * enter + 0.25 * hic * (hic > 0.7 ? 1 : 0), blur: enter > 0.02 ? [140 * enter, 0] : null };
};

// ---------------------------------------------------------------- goodnight ... probably
const POSE_STRETCH = { hipY: -34, lean: 0, armL: { a: 2.75, b: 0.25 }, armR: { a: 2.75, b: 0.25 }, legL: { a: 2.25, b: -1.95 }, legR: { a: 2.25, b: -1.95 }, hand: 'open', feetFront: 1 };
const POSE_REACH = { hipY: -222, lean: 0, armL: { a: 0.3, b: 0.1 }, armR: { a: 1.35, b: 0.15 }, legL: { a: 0.05, b: 0 }, legR: { a: 0.08, b: -0.02 }, hand: 'open', feetFront: 1 };
SC.night = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const lieT = c.goodnight - 0.55;
  if (t < lieT) {
    // the yawn + stretch, sitting up
    const y = E.inOutSine(inv(shot.start + 0.1, c.anyway + 0.5, t)) * (1 - E.inOutSine(inv(lieT - 0.35, lieT, t)));
    const yawn = { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 0.4, browTilt: -0.3, mouth: 'o', mouthOpen: 1.5, blink: 1, cross: 0 };
    const face = lerpFace(FACES.calm, yawn, y);
    const pose = lerpPose(POSE_GRIP, POSE_STRETCH, y);
    const cam = { x: 540, y: lerp(930, 900, lt / 2), zoom: 1.6, rot: 0.01 * Math.sin(t) };
    bedFrontScene(cam, t, { pose, face, lamp: 1, armsOver: y < 0.3, headRot: 0.08 * y * Math.sin(t * 2), bodyDY: 8 * y });
    const enter = 1 - E.outCubic(inv(0, 0.18, lt));
    return { grain: 1, flash: 0.25 * enter + 0.3 * inv(lieT - 0.12, lieT, t), zblur: 0.2 * inv(lieT - 0.25, lieT, t), zcx: 540, zcy: 800 };
  }
  // lying down: reach for the lamp, click, dark, one suspicious eye, stillness ... JOLT, black
  if (t >= c.black) { screenSpace(); ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, W, H); return { noCaptions: true, glow: 0, grain: 0 }; }
  const off = c.goodnight + 0.3;
  const lamp = t < off ? 1 : 0;
  const reach = E.inOutSine(inv(lieT + 0.1, off - 0.05, t)) * (1 - E.inOutSine(inv(off + 0.1, off + 0.6, t)));
  const fj = c.final_jolt;
  const hit = t >= fj ? t - fj : -1;
  let pose = lerpPose(POSES.sleep, POSE_REACH, reach);
  if (hit >= 0) pose = lerpPose(POSES.sleep, POSES.jolt, clamp(E.outBack(clamp(hit / 0.06), 1.4), 0, 1.1));
  const sus = E.inOutSine(inv(c.probably - 0.1, c.probably + 0.2, t)) * (1 - E.inOutSine(inv(c.probably_end + 0.1, c.probably_end + 0.4, t)));
  let face = lerpFace(FACES.drowsy, FACES.sleepy, ramp(t, off, off + 0.4));
  if (sus > 0) face = Object.assign({}, face, { blink: lerp(face.blink, 0.55, sus), lookX: 0.8 * sus, browTilt: 0.6 * sus });
  if (hit >= 0) face = lerpFace(FACES.sleepy, FACES.startled, clamp(hit / 0.06));
  const settle = E.inOutSine(inv(lieT, lieT + 0.6, t));
  const push = E.inOutSine(inv(off + 0.3, fj, t));
  const [shx, shy] = hit >= 0 ? shake(t, 40 * Math.exp(-hit * 5), 28, 9) : [0, 0];
  const cam = { x: lerp(700, 560, push), y: lerp(560, 500, push), zoom: lerp(1.55, 2.3, push) * (hit >= 0 ? 1.06 : 1), rot: lerp(0.03, -0.03, push), sx: shx, sy: shy };
  const breathe = 0.12 * (0.5 + 0.5 * Math.sin(t * 2.2));
  const o = bedTopScene(cam, t, { pose, face, lamp, moon: 1, lift: hit >= 0 ? 0.8 : breathe, kick: hit >= 0 ? 1 : 0, hop: hit >= 0 ? 0.8 : 0, clock: '11:52', headDY: hit >= 0 ? -20 : 0 });
  applyCam(cam);
  if (t > off + 0.6 && hit < 0) zzz(o.head[0] + 50, o.head[1] - 50, t, off + 0.6, 1, 1.0);
  screenSpace();
  if (t < off + 0.25 && t >= off) { ctx.fillStyle = `rgba(0,0,0,${0.35 * (1 - (t - off) / 0.25)})`; ctx.fillRect(0, 0, W, H); }
  if (hit >= 0) { const [hx, hy] = toScreen(cam, o.head[0], o.head[1]); shockLines(hx, hy, 220, hit / 0.3, 14, '#FFFFFF', 31); }
  const enter = 1 - E.outCubic(inv(lieT, lieT + 0.2, t));
  return { grain: 1, flash: 0.35 * enter + (hit >= 0 ? 0.7 * Math.exp(-hit * 10) : 0), noCaptions: t > c.probably_end + 0.3 };
};
