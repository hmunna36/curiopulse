// Why Do Your Ears RUMBLE When You Yawn? Short: the props. The rumble (rings shaking out of an ear), his big ears, the
// tiny muscle with a sweatband that flexes in the window on his ear, the eardrum's own muscle in the ear section
// (ear.js: it shortens, tugs the hammer bone and pulls the drum in tight), a drumstick, a volume knob, a crisp bag
// and crisps, a mummy sleeping bag, the ear camera (an earbud with a lens), the camera's view of the eardrum, a tablet
// whose keyboard picks a letter on every rumble, YES / NO, confetti, the no-yawn badge, the friend's weird face.
// Everything is drawn from the state scenes.js passes in; nothing here is timed. Loaded after camp.js and ear.js.
'use strict';

const ER_GOLD = '#FFD447', ER_ORANGE = '#FF9A3C', ER_CYAN = '#7FE9FF', ER_GREEN = '#4DFFB4', ER_RED = '#FF5A6E';

// ---------------------------------------------------------------- the rumble
// how hard he is rumbling at time t: 0..1 from the cue list of [start, end] spans (both picture and sound read it)
function erRumbleK(t) {
  let k = 0;
  for (const [a, b] of (TLd.cues.rumbles || [])) k = Math.max(k, Math.min(clamp((t - a) / 0.08), clamp((b + 0.16 - t) / 0.16)));
  return k;
}
// rings shaking out of an ear (screen space): (x, y) the ear, dir -1 = they open to the left, +1 to the right,
// R = how far the outer ring goes, k = 0..1 strength
function erRings(x, y, dir, R, k, t, col = ER_GOLD, r0 = 0.28) {
  if (k <= 0.02) return;
  screenSpace();
  for (let i = 0; i < 3; i++) {
    const u = ((t * 2.6 + i / 3) % 1 + 1) % 1, r = R * (r0 + (1 - r0) * u), a = k * (1 - u) * (0.6 + 0.4 * (1 - u));
    if (a <= 0.02) continue;
    const pts = [];
    for (let j = 0; j <= 28; j++) {
      const th = (dir < 0 ? Math.PI : 0) + lerp(-0.95, 0.95, j / 28);
      const wob = 1 + 0.045 * Math.sin(j * 1.9 + t * 41 + i * 2) * (0.5 + k);
      pts.push([x + Math.cos(th) * r * wob, y + Math.sin(th) * r * wob * 1.05]);
    }
    paint(() => poly(ctx, pts, Math.max(3, 0.05 * R * (1 - 0.4 * u)), rgba(col, 0.95 * a)));
    poly(gctx, pts, Math.max(6, 0.11 * R), rgba(col, 0.55 * a));
  }
  // short shake ticks right by the ear
  for (let i = 0; i < 3 && r0 < 0.4; i++) {
    const th = (dir < 0 ? Math.PI : 0) + (i - 1) * 0.55, j = 6 * Math.sin(t * 57 + i * 3);
    const q0 = R * 0.15, q1 = R * 0.24;
    paint(() => line(ctx, x + Math.cos(th) * q0 + j, y + Math.sin(th) * q0, x + Math.cos(th) * q1 + j, y + Math.sin(th) * q1, Math.max(3, R * 0.035), rgba('#FFFFFF', 0.9 * k)));
  }
}

// his ears, bigger than the rig's (head space; drawn on his layer BEFORE the rig, so they sit behind the head)
function erBigEars(c, pal = CAMPPAL, red = 0) {
  for (const s of [-1, 1]) {
    c.save(); c.translate(s * 63, 4); c.rotate(s * 0.08);
    ellipse(c, 0, 0, 20, 30, pal.skinSh);
    ellipse(c, s * 1, -1, 16, 26, red > 0.01 ? mixH(pal.skin, '#FF8A8A', 0.5 * red) : pal.skin);
    ellipse(c, s * 3, 2, 8, 15, '#B8704F');
    c.restore();
  }
}
// into the rig's head space without a rig in hand (for his layer's `pre`)
function erHeadSpace(c, st, fn) { headSpace(c, rig(st.pose), st, fn); }

// ---------------------------------------------------------------- the window on his ear, and the tiny muscle inside
// a round window (screen space) with an opaque disc first, so the light stage does not shade it as his head
function erWindow(x, y, R, k, inside, ring = '#FFFFFF') {
  if (k <= 0.01) return;
  const r = R * E.outBack(clamp(k), 1.6);
  screenSpace();
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = '#3A0E22'; ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
  inside(r);
  ctx.restore();
  screenSpace();
  paint(() => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.lineWidth = Math.max(6, r * 0.05); ctx.strokeStyle = ring; ctx.stroke(); });
  softDot(gctx, x, y, r * 1.15, '#FFB0C8', 0.16 * clamp(k));
}
// pink tissue, the edge of the eardrum on the left (screen space, inside a window of radius r at (x, y))
function erInsideBg(x, y, r, t) {
  const g = ctx.createRadialGradient(x + r * 0.2, y - r * 0.3, r * 0.1, x, y, r * 1.2);
  g.addColorStop(0, '#E06A86'); g.addColorStop(0.6, '#B0405E'); g.addColorStop(1, '#6E2040');
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  for (let i = 0; i < 9; i++) softDot(ctx, x + (hash(i * 3.1) - 0.5) * 1.8 * r, y + (hash(i * 7.3) - 0.5) * 1.8 * r, r * (0.2 + 0.3 * hash(i)), i % 2 ? '#F08AA0' : '#7A2244', 0.22);
  // the eardrum: a pearly curve on the left
  ctx.beginPath(); ctx.moveTo(x - r * 0.72, y - r); ctx.quadraticCurveTo(x - r * 0.5, y, x - r * 0.72, y + r);
  ctx.lineWidth = r * 0.07; ctx.strokeStyle = '#FFE9DA'; ctx.stroke();
}
// the tiny muscle as a character: a red bean with a face and a sweatband; flex 0..1 lifts its little arm into a curl,
// pump 0..1 swells the biceps. (x, y) its middle, s its scale (1 = 100 px long), screen space
function erFlexMuscle(x, y, s, t, flex = 0, pump = 0, k = 1) {
  if (k <= 0.01) return;
  const e = E.outBack(clamp(k), 2.2) * s, sh = 3 * Math.sin(t * 47) * clamp(pump + 0.3 * flex);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x + sh, y); ctx.scale(e, e); ctx.rotate(-0.12);
  // the tendons at both ends, to the bone and to the hammer
  line(ctx, -92, 6, -56, 2, 12, '#F4E6CC'); line(ctx, 56, -2, 96, -10, 12, '#F4E6CC');
  // the body: a bean that bulges as it flexes
  const bul = 1 + 0.16 * flex + 0.1 * pump;
  ctx.beginPath(); ctx.ellipse(0, 0, 62 / Math.sqrt(bul), 38 * bul, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#E8415C'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#7A0E26'; ctx.stroke();
  ctx.save(); ctx.clip();
  for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(-70, i * 11); ctx.quadraticCurveTo(0, i * 15 * bul, 70, i * 11); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(122,14,38,0.4)'; ctx.stroke(); }
  ellipse(ctx, -14, -18 * bul, 22, 9, 'rgba(255,190,200,0.55)', -0.2);
  ctx.restore();
  // the sweatband
  rrect(ctx, -40, -34 * bul - 4, 80, 16, 8); ctx.fillStyle = '#FFFFFF'; ctx.fill();
  rrect(ctx, -40, -34 * bul + 1, 80, 5, 2); ctx.fillStyle = '#3FA8FF'; ctx.fill();
  // the face (determined, then proud)
  const blinkk = (t * 0.7 % 1) > 0.96 ? 0.15 : 1;
  for (const sx of [-15, 15]) { ellipse(ctx, sx, -6, 7, 9 * blinkk, '#FFFFFF'); circle(ctx, sx + 1.5, -5, 4, '#1A1030'); }
  ctx.lineCap = 'round'; ctx.lineWidth = 4; ctx.strokeStyle = '#4A0716';
  ctx.beginPath(); ctx.moveTo(-24, -20 + 4 * flex); ctx.lineTo(-8, -16); ctx.moveTo(24, -20 + 4 * flex); ctx.lineTo(8, -16); ctx.stroke();
  ctx.beginPath();
  if (flex > 0.5) { ctx.moveTo(-12, 10); ctx.quadraticCurveTo(0, 22, 12, 10); } else { ctx.moveTo(-10, 12); ctx.lineTo(10, 12); }
  ctx.stroke();
  // a little arm: down at rest, up in a curl when it flexes (the bump of a biceps on it)
  const up = E.outBack(clamp(flex), 2);
  for (const sd of [-1, 1]) {
    const sx = sd * 44, sy = 4, ex = sx + sd * lerp(22, 30, up), ey = sy + lerp(26, -14, up), hx = ex + sd * lerp(4, -6, up), hy = ey + lerp(22, -26, up);
    line(ctx, sx, sy, ex, ey, 11, '#C8304C'); line(ctx, ex, ey, hx, hy, 10, '#C8304C');
    if (up > 0.3) ellipse(ctx, lerp(sx, ex, 0.55), lerp(sy, ey, 0.55) - 6 * up, 9 * up, 6 * up, '#E8415C');
    circle(ctx, hx, hy, 8, '#C8304C');
  }
  ctx.restore();
}

// ---------------------------------------------------------------- the eardrum's muscle in the section (ear.js world coords)
// The tensor tympani: its belly lies in the wall above the eustachian tube, its tendon turns round a little hook of bone
// and pulls the hammer's handle (and the eardrum with it) inward. pull 0..1; b = the eardrum's bulge (ear.js).
const ER_TT = { o: [478, 130], hook: [240, 36] };
function erHammerNeck(b) { const m = earDrumMid(b); return [m[0] * 0.55 + 30, m[1] * 0.55 - 46]; }
function erTT(c, b, pull, t, hi = 0) {
  const O = ER_TT.o, Hk = ER_TT.hook, N = erHammerNeck(b);
  // the bony canal it lies in
  c.lineCap = 'round';
  line(c, O[0] + 40, O[1] + 30, Hk[0] + 10, Hk[1] + 8, 92, '#CDAA7C'); line(c, O[0] + 40, O[1] + 30, Hk[0] + 10, Hk[1] + 8, 74, '#7A2845');
  // the belly: it shortens toward its origin and thickens as it pulls
  const end = [lerp(Hk[0] + 44, Hk[0] + 96, pull), lerp(Hk[1] + 18, Hk[1] + 34, pull)];
  const dx = end[0] - O[0], dy = end[1] - O[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, px = -uy, py = ux;
  const th = 26 + 16 * pull + 3 * Math.sin(t * 50) * pull;
  const shape = () => {
    c.beginPath(); c.moveTo(O[0], O[1]);
    c.quadraticCurveTo(O[0] + dx * 0.5 + px * th * 1.6, O[1] + dy * 0.5 + py * th * 1.6, end[0], end[1]);
    c.quadraticCurveTo(O[0] + dx * 0.5 - px * th * 1.6, O[1] + dy * 0.5 - py * th * 1.6, O[0], O[1]);
    c.closePath();
  };
  shape(); c.fillStyle = mixH('#D9384F', '#FF6A7E', 0.6 * pull); c.fill();
  c.lineWidth = 5; c.strokeStyle = '#6E0E24'; c.stroke();
  for (let i = -2; i <= 2; i++) {
    c.beginPath(); c.moveTo(O[0], O[1]);
    c.quadraticCurveTo(O[0] + dx * 0.5 + px * th * 0.55 * i, O[1] + dy * 0.5 + py * th * 0.55 * i, end[0], end[1]);
    c.lineWidth = 2.5; c.strokeStyle = 'rgba(110,14,36,0.45)'; c.stroke();
  }
  // the tendon: to the hook, then round it to the hammer's neck (taut when it pulls)
  const sag = 16 * (1 - pull);
  c.beginPath(); c.moveTo(end[0], end[1]); c.lineTo(Hk[0], Hk[1]);
  c.quadraticCurveTo((Hk[0] + N[0]) / 2, (Hk[1] + N[1]) / 2 + sag, N[0], N[1]);
  c.lineWidth = 11; c.strokeStyle = '#B9A37E'; c.stroke(); c.lineWidth = 7; c.strokeStyle = '#F7EBD2'; c.stroke();
  ellipse(c, Hk[0], Hk[1] + 10, 18, 12, '#E6CFA2');                       // the little hook of bone
  if (hi > 0.01) {
    gctx.save(); shape(); gctx.fillStyle = rgba('#FF5A78', 0.45 * hi); gctx.fill(); gctx.restore();
    softDot(gctx, (O[0] + end[0]) / 2, (O[1] + end[1]) / 2, 160, '#FF5A78', 0.35 * hi);
  }
  return { mid: [(O[0] + end[0]) / 2, (O[1] + end[1]) / 2], neck: N };
}
// "tight": short ticks across the eardrum, like a drumskin pulled tight (world coords of the section)
function erDrumTight(b, k, t) {
  if (k <= 0.02) return;
  const q = earDrumCtl(b);
  for (let i = 1; i < 6; i++) {
    const u = i / 6, p0 = [lerp(lerp(EAR.T[0], q[0], u), lerp(q[0], EAR.B[0], u), u), lerp(lerp(EAR.T[1], q[1], u), lerp(q[1], EAR.B[1], u), u)];
    const nx = EAR.nrm[0], ny = EAR.nrm[1], w = 18 * k;
    paint(() => line(ctx, p0[0] - nx * w, p0[1] - ny * w, p0[0] + nx * w, p0[1] + ny * w, 4, rgba(ER_GOLD, 0.9 * k)));
    line(gctx, p0[0] - nx * w, p0[1] - ny * w, p0[0] + nx * w, p0[1] + ny * w, 10, rgba(ER_GOLD, 0.5 * k));
  }
}
// a drumstick coming in down the ear canal; hit 0..1 (1 = its tip on the eardrum), world coords of the section
function erDrumstick(b, hit, k) {
  if (k <= 0.01) return;
  const m = earDrumMid(b), tip = [m[0] - 22 - (1 - hit) * 150, m[1] + 6 + (1 - hit) * 40], L = 520;
  const bx = tip[0] - Math.cos(0.32) * L, by = tip[1] + Math.sin(0.32) * L * 0.6;
  ctx.lineCap = 'round';
  line(ctx, bx, by, tip[0], tip[1], 26, '#8A5A2E'); line(ctx, bx, by, tip[0], tip[1], 18, '#D9A066');
  line(ctx, bx + (tip[0] - bx) * 0.1, by + (tip[1] - by) * 0.1, tip[0] - 12, tip[1] - 4, 5, 'rgba(255,230,180,0.6)');
  circle(ctx, tip[0], tip[1], 17, '#F2C48C'); circle(ctx, tip[0] - 4, tip[1] - 5, 6, '#FFE6C0');
}

// ---------------------------------------------------------------- a volume knob (screen space). val 0..1 (where it points), k = pop
function erKnob(x, y, R, k, val, t, label = 'VOL') {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.scale(s, s);
  circle(ctx, 0, 0, R * 1.32, 'rgba(8,10,30,0.88)');
  ctx.beginPath(); ctx.arc(0, 0, R * 1.32, 0, Math.PI * 2); ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.stroke();
  const a0 = Math.PI * 0.75, a1 = Math.PI * 2.25, av = lerp(a0, a1, val);
  for (let i = 0; i <= 10; i++) {
    const a = lerp(a0, a1, i / 10), on = i / 10 <= val + 1e-3, col = on ? (i > 7 ? ER_RED : ER_GOLD) : 'rgba(255,255,255,0.25)';
    line(ctx, Math.cos(a) * R * 1.06, Math.sin(a) * R * 1.06, Math.cos(a) * R * 1.22, Math.sin(a) * R * 1.22, i % 5 ? 5 : 8, col);
  }
  const g = ctx.createRadialGradient(-R * 0.3, -R * 0.35, R * 0.1, 0, 0, R);
  g.addColorStop(0, '#9AA3C0'); g.addColorStop(1, '#3A4260');
  circle(ctx, 0, 0, R * 0.92, '#20263F'); circle(ctx, 0, 0, R * 0.84, g);
  for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2 + av; line(ctx, Math.cos(a) * R * 0.78, Math.sin(a) * R * 0.78, Math.cos(a) * R * 0.9, Math.sin(a) * R * 0.9, 3, 'rgba(10,12,30,0.5)'); }
  line(ctx, Math.cos(av) * R * 0.2, Math.sin(av) * R * 0.2, Math.cos(av) * R * 0.72, Math.sin(av) * R * 0.72, 9, '#FFFFFF');
  ctx.font = `900 ${Math.round(R * 0.42)}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#FFFFFF'; ctx.fillText(label, 0, -R * 1.62);
  ctx.restore();
  softDot(gctx, x, y, R * 1.8 * s, val > 0.7 ? ER_RED : ER_GOLD, 0.25 * clamp(k));
}

// ---------------------------------------------------------------- crisps
function erCrisp(c, x, y, s, rot, bite = 0) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.beginPath();
  for (let i = 0; i <= 24; i++) {
    const a = i / 24 * Math.PI * 2, r = 1 + 0.08 * Math.sin(a * 5 + 1) + 0.05 * Math.sin(a * 9);
    let px = Math.cos(a) * 34 * r, py = Math.sin(a) * 24 * r;
    if (bite > 0 && px > 34 * (1 - 0.9 * bite) - 16) px = Math.min(px, 34 * (1 - 0.9 * bite) - 16 + 6 * Math.sin(i * 2.7));
    if (i) c.lineTo(px, py); else c.moveTo(px, py);
  }
  c.closePath(); c.fillStyle = '#F2C24A'; c.fill();
  c.lineWidth = 3; c.strokeStyle = '#C8902A'; c.stroke();
  for (const [dx, dy] of [[-12, -6], [8, 6], [-2, 10], [14, -8]]) circle(c, dx, dy, 2.6, '#D9962A');
  c.restore();
}
// a crisp bag held at its bottom edge; (x, y) = where the hand holds it, rig or world units
function erCrispBag(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.moveTo(-60, -150); c.lineTo(60, -150); c.quadraticCurveTo(72, -60, 56, 10); c.lineTo(-56, 10); c.quadraticCurveTo(-72, -60, -60, -150); c.closePath();
  c.fillStyle = '#6A3FD0'; c.fill();
  c.fillStyle = '#FFD447'; c.beginPath(); c.ellipse(0, -66, 40, 30, -0.2, 0, Math.PI * 2); c.fill();
  erCrisp(c, -4, -66, 0.8, -0.3);
  rrect(c, -64, -160, 128, 16, 4); c.fillStyle = '#C8B8FF'; c.fill();
  for (let i = -6; i <= 6; i++) line(c, i * 9.5, -160, i * 9.5, -144, 2, 'rgba(60,30,120,0.5)');
  c.restore();
  paint(() => {
    c.save(); c.translate(x, y); c.scale(s, s);
    c.font = '400 30px Anton'; c.textAlign = 'center'; c.fillStyle = '#FFFFFF'; c.fillText('CRISPS', 0, -112);
    c.restore();
  });
}

// ---------------------------------------------------------------- the sleeping bag (rig space; over his body, his arms inside)
function erSleepBag(c, st, r) {
  rigSpace(c, st, (cc) => {
    const hx = r.head[0] + (st.headDX || 0), hy = r.head[1] + (st.headDY || 0);
    cc.beginPath();
    cc.moveTo(hx - 96, hy + 78); cc.quadraticCurveTo(hx - 150, hy + 190, -138, -150);
    cc.quadraticCurveTo(-132, -20, -84, 6); cc.lineTo(84, 6); cc.quadraticCurveTo(132, -20, 138, -150);
    cc.quadraticCurveTo(hx + 150, hy + 190, hx + 96, hy + 78); cc.quadraticCurveTo(hx, hy + 104, hx - 96, hy + 78); cc.closePath();
    cc.fillStyle = '#2A9D8F'; cc.fill();
    cc.save(); cc.clip();
    for (let i = 0; i < 7; i++) { const y = hy + 110 + i * 62; cc.beginPath(); cc.moveTo(-160, y); cc.quadraticCurveTo(0, y + 18, 160, y); cc.lineWidth = 6; cc.strokeStyle = '#1F7A70'; cc.stroke(); }
    line(cc, 24, hy + 80, 30, -10, 6, '#E8E2D0');
    cc.restore();
  });
  // the hood round his face
  headSpace(c, r, st, (cc) => {
    cc.beginPath(); cc.ellipse(0, 4, 100, 110, 0, 0, Math.PI * 2); cc.ellipse(0, 10, 78, 92, 0, 0, Math.PI * 2, true);
    cc.fillStyle = '#2A9D8F'; cc.fill('evenodd');
    cc.beginPath(); cc.ellipse(0, 10, 81, 95, 0, 0, Math.PI * 2); cc.lineWidth = 9; cc.strokeStyle = '#1F7A70'; cc.stroke();
    // the drawstring toggles
    for (const sx of [-30, 30]) { line(cc, sx, 100, sx * 1.3, 132, 4, '#E8E2D0'); ellipse(cc, sx * 1.3, 138, 7, 10, '#FF9A3C'); }
  });
}
// fluffy earmuffs on his ears (head space): "Sound went muffled?". k = pop 0..1
function erEarmuffs(c, k, t) {
  if (k <= 0.01) return;
  const p = E.outBack(clamp(k), 2.4);
  c.save(); c.scale(p, p);
  c.beginPath(); c.moveTo(-70, 0); c.bezierCurveTo(-74, -120, 74, -120, 70, 0);
  c.lineWidth = 14; c.strokeStyle = '#C8A8FF'; c.lineCap = 'round'; c.stroke();
  for (const s of [-1, 1]) {
    const wob = 1 + 0.04 * Math.sin(t * 9 + s);
    for (let i = 0; i < 9; i++) {
      const a = i / 9 * Math.PI * 2;
      circle(c, s * 72 + Math.cos(a) * 22 * wob, 6 + Math.sin(a) * 30 * wob, 15, i % 2 ? '#FF9EC4' : '#FFB8D4');
    }
    ellipse(c, s * 72, 6, 24, 32, '#FFC8DC');
  }
  c.restore();
}
// the ear camera: a white earbud with a lens and a small light, in his ear (head space; side -1 / +1)
function erBud(c, side, light) {
  c.save(); c.translate(side * 66, 6);
  ellipse(c, side * 8, 0, 20, 17, '#DADDE8'); ellipse(c, side * 6, -2, 16, 13, '#F6F7FB');
  line(c, side * 14, 10, side * 22, 58, 9, '#E8EAF2');
  circle(c, side * 4, -2, 5.5, '#1A2040');
  c.restore();
  if (light > 0.01) paint(() => { c.save(); c.translate(side * 66, 6); circle(c, side * 4, -2, 3.5, rgba('#7FE9FF', light)); c.restore(); });
}

// ---------------------------------------------------------------- the camera's view of the eardrum (screen space)
function erCamView(x, y, R, k, twitch, t) {
  if (k <= 0.01) return;
  paint(() => erCamViewDraw(x, y, R, k, twitch, t));
}
function erCamViewDraw(x, y, R, k, twitch, t) {
  const s = E.outBack(clamp(k), 1.8);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.scale(s, s);
  circle(ctx, 0, 0, R, '#14081A');
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, R * 0.96, 0, Math.PI * 2); ctx.clip();
  const g = ctx.createRadialGradient(-R * 0.1, -R * 0.1, R * 0.1, 0, 0, R);
  g.addColorStop(0, '#C9706E'); g.addColorStop(0.65, '#8A3444'); g.addColorStop(1, '#2A0A16');
  ctx.fillStyle = g; ctx.fillRect(-R, -R, 2 * R, 2 * R);
  // the drum: a grey, see-through disc that sinks in a little when it twitches
  const sq = 1 - 0.12 * twitch;
  ellipse(ctx, 4 * twitch, 0, R * 0.64 * sq, R * 0.72 * sq, '#9C8C98');
  ellipse(ctx, 4 * twitch, 0, R * 0.56 * sq, R * 0.64 * sq, '#C7B9C2');
  ellipse(ctx, 4 * twitch - R * 0.12, -R * 0.12, R * 0.26, R * 0.3, 'rgba(255,255,255,0.18)');
  line(ctx, 4 * twitch, 0, 4 * twitch + R * 0.08, -R * 0.52 * sq, R * 0.08, '#F2E4D2');                    // the hammer's handle
  ctx.beginPath(); ctx.moveTo(4 * twitch, 4); ctx.lineTo(R * 0.14 + 4 * twitch, R * 0.5 * sq); ctx.lineTo(-R * 0.05 + 4 * twitch, R * 0.52 * sq); ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.fill();                                                       // the cone of light
  ctx.restore();
  ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.lineWidth = 7; ctx.strokeStyle = ER_CYAN; ctx.stroke();
  circle(ctx, R * 0.72, -R * 0.72, R * 0.1, twitch > 0.3 ? ER_RED : '#5A2030');                                // REC
  ctx.restore();
}

// ---------------------------------------------------------------- the tablet (screen space)
const ER_KEYS = ['ABCDEF', 'GHIJKL', 'MNOPQR', 'STUVWX', 'YZ.!? '];
// o: {typed: 'HI', hl: letter under the scan highlight, flash 0..1 (the picked key lights), mode: 'keys' | 'yesno',
//     yes 0..1 (YES lights green), sel: 'yes' | 'no' (the highlight)}
function erTablet(x, y, w, h, k, t, o = {}) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 1.7);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -w / 2 - 14, -h / 2 - 14, w + 28, h + 28, 34); ctx.fillStyle = '#1A1E30'; ctx.fill();
  rrect(ctx, -w / 2, -h / 2, w, h, 22); ctx.fillStyle = '#0B1024'; ctx.fill();
  // the text field
  rrect(ctx, -w / 2 + 18, -h / 2 + 18, w - 36, 96, 16); ctx.fillStyle = '#F4F6FF'; ctx.fill();
  ctx.font = '900 64px Montserrat'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#121830';
  const typed = o.typed || '';
  ctx.fillText(typed, -w / 2 + 40, -h / 2 + 68);
  const tw = ctx.measureText(typed).width;
  if ((t * 2) % 1 < 0.6) { ctx.fillStyle = '#3F7CFF'; ctx.fillRect(-w / 2 + 44 + tw, -h / 2 + 40, 6, 56); }
  if (o.mode === 'yesno') {
    for (const [lab, cx, col] of [['YES', -w / 4, ER_GREEN], ['NO', w / 4, ER_RED]]) {
      const on = lab === 'YES' ? clamp(o.yes || 0) : 0, sel = (o.sel || 'yes') === lab.toLowerCase();
      const bw = w / 2 - 34, bh = h - 190, by = -h / 2 + 140;
      rrect(ctx, cx - bw / 2, by, bw, bh, 22); ctx.fillStyle = on > 0.01 ? mixH('#1E2640', col, on) : '#1E2640'; ctx.fill();
      if (sel) { rrect(ctx, cx - bw / 2 - 7, by - 7, bw + 14, bh + 14, 26); ctx.lineWidth = 9; ctx.strokeStyle = '#FFD447'; ctx.stroke(); }
      ctx.font = '400 88px Anton'; ctx.textAlign = 'center'; ctx.fillStyle = on > 0.5 ? '#0B1024' : '#FFFFFF';
      ctx.fillText(lab, cx, by + bh / 2 + 4);
    }
  } else {
    const cw = (w - 36) / 6, chh = (h - 150) / 5;
    ER_KEYS.forEach((row, ri) => {
      [...row].forEach((ch, ci) => {
        const kx = -w / 2 + 18 + ci * cw, ky = -h / 2 + 132 + ri * chh, isHl = ch === o.hl;
        rrect(ctx, kx + 4, ky + 4, cw - 8, chh - 8, 10);
        ctx.fillStyle = isHl ? mixH('#3F4A78', '#FFD447', 0.5 + 0.5 * (o.flash || 0)) : '#262E4C'; ctx.fill();
        ctx.font = `900 ${Math.round(chh * 0.46)}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = isHl ? '#0B1024' : '#C8D0F0'; ctx.fillText(ch === ' ' ? '␣' : ch, kx + cw / 2, ky + chh / 2 + 2);
      });
    });
  }
  ctx.restore();
  softDot(gctx, x, y, Math.max(w, h) * 0.7 * s, '#5A7CFF', 0.14 * clamp(k));
}

// ---------------------------------------------------------------- small graphics (screen space)
function erTag(txt, x, y, col, k, size = 44, ink = '#0B0B1A', rot = 0) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + size * 0.9, h = size * 1.5;
  rrect(ctx, -w / 2 - 4, -h / 2 - 4, w + 8, h + 8, h / 2 + 4); ctx.fillStyle = '#0B0B1A'; ctx.fill();
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = col; ctx.fill();
  ctx.fillStyle = ink; ctx.fillText(txt, 0, 2);
  ctx.restore();
}
// a word in a jagged comic burst (screen space)
function erBurst(txt, x, y, size, col, k, rot = -0.1, seed = 3) {
  if (k <= 0.01) return;
  const e = E.outBack(clamp(k), 2.4), rng = mulberry32(seed);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(e, e);
  ctx.font = `400 ${size}px Anton`; const w = ctx.measureText(txt).width;
  ctx.beginPath();
  for (let i = 0; i < 22; i++) { const a = i / 22 * Math.PI * 2, rr = (i % 2 ? 1 : 0.72 + 0.12 * rng()); ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * (w * 0.68 + 30) * rr, Math.sin(a) * (size * 0.95) * rr); }
  ctx.closePath(); ctx.fillStyle = '#FFF6DC'; ctx.fill(); ctx.lineWidth = 8; ctx.lineJoin = 'round'; ctx.strokeStyle = '#1A1030'; ctx.stroke();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = col; ctx.lineWidth = 6; ctx.strokeStyle = '#1A1030';
  ctx.strokeText(txt, 0, 4); ctx.fillText(txt, 0, 4);
  ctx.restore();
  softDot(gctx, x, y, (w + 120) * 0.8 * e, col, 0.25 * clamp(k));
}
// confetti out of a point, from t0 (screen space)
function erConfetti(x, y, t0, t, n = 26, dir = -1) {
  const u = t - t0;
  if (u < 0 || u > 1.6) return;
  screenSpace();
  for (let i = 0; i < n; i++) {
    const a = (dir < 0 ? -2.1 : -1.05) + (hash(i * 1.7) - 0.5) * 1.6, v = 520 + 520 * hash(i * 3.1);
    const px = x + Math.cos(a) * v * u * (1 - 0.35 * u), py = y + Math.sin(a) * v * u + 700 * u * u - 260 * u;
    const col = [ER_GOLD, ER_CYAN, '#FF86A6', ER_GREEN, '#C8A8FF'][i % 5], al = clamp(1.4 - u);
    ctx.save(); ctx.translate(px, py); ctx.rotate(u * 9 + i); ctx.scale(1, Math.cos(u * 14 + i)); ctx.fillStyle = rgba(col, al); ctx.fillRect(-15, -8, 30, 16); ctx.restore();
  }
}
// the no-yawn badge: a yawning mouth, struck through (screen space)
function erNoYawn(x, y, R, k) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.2);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.scale(s, s);
  circle(ctx, 0, 0, R, '#FFF6DC'); ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.lineWidth = 10; ctx.strokeStyle = '#1A1030'; ctx.stroke();
  ellipse(ctx, 0, R * 0.12, R * 0.34, R * 0.46, '#5A1626'); ellipse(ctx, 0, R * 0.36, R * 0.22, R * 0.14, '#FF7A8A');
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * R * 0.5, -R * 0.36); ctx.quadraticCurveTo(sx * R * 0.32, -R * 0.5, sx * R * 0.14, -R * 0.36); ctx.lineWidth = 7; ctx.strokeStyle = '#1A1030'; ctx.lineCap = 'round'; ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-R * 0.72, -R * 0.72); ctx.lineTo(R * 0.72, R * 0.72); ctx.lineWidth = 18; ctx.strokeStyle = ER_RED; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, R * 0.98, 0, Math.PI * 2); ctx.lineWidth = 14; ctx.stroke();
  ctx.restore();
}
// his friend's weird face, in his head space: puffed cheeks, a tongue out, a sweat drop (k 0..1)
function erWeirdFace(c, k, t, tongue = k) {
  if (k <= 0.01) return;
  const p = E.outBack(clamp(k), 2);
  for (const sx of [-1, 1]) {
    circle(c, sx * 44, 26, 21 * p, FRPAL.skin);
    ellipse(c, sx * 46, 32, 13 * p, 8 * p, 'rgba(255,90,110,0.55)');
  }
  if (tongue <= 0.01) return;
  const tl = 30 * E.outBack(clamp(tongue), 2.4);
  c.beginPath(); c.ellipse(-6, 54 + tl * 0.5, 15, tl * 0.75 + 4, 0.15, 0, Math.PI * 2); c.fillStyle = '#FF6A86'; c.fill();
  line(c, -6, 50, -4, 54 + tl, 2.5, 'rgba(160,30,60,0.6)');
  if (k > 0.6) sweatDrop(c, 58, -48, 0.9, clamp((k - 0.6) / 0.4));
}
// the beanie and round glasses of his friend (mosquito-bites' mlab.js)
function friendHat(cc) {
  circle(cc, 4, -98, 20, '#FFE9B8'); circle(cc, 0, -102, 12, '#FFFFFF');
  cc.beginPath(); cc.moveTo(-70, -22); cc.quadraticCurveTo(-78, -92, 0, -96); cc.quadraticCurveTo(78, -92, 70, -22); cc.closePath(); cc.fillStyle = '#FF8A3C'; cc.fill();
  rrect(cc, -74, -40, 148, 30, 12); cc.fillStyle = '#FFB86A'; cc.fill();
  cc.strokeStyle = 'rgba(160,70,10,0.5)'; cc.lineWidth = 3; for (let i = -3; i <= 3; i++) { cc.beginPath(); cc.moveTo(i * 20, -38); cc.lineTo(i * 20, -12); cc.stroke(); }
  for (const sx of [-24, 24]) { cc.beginPath(); cc.arc(sx, -2, 21, 0, 7); cc.fillStyle = 'rgba(190,225,255,0.16)'; cc.fill(); cc.lineWidth = 4.5; cc.strokeStyle = '#1A1C2C'; cc.stroke(); }
  cc.lineWidth = 4.5; cc.beginPath(); cc.moveTo(-4, -4); cc.quadraticCurveTo(0, -8, 4, -4); cc.moveTo(-45, -4); cc.lineTo(-62, -8); cc.moveTo(45, -4); cc.lineTo(62, -8); cc.stroke();
}
