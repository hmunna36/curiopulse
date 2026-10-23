// What Happens If You Stop Eating? (Day by Day) — the shots of act 3 and the ending: the edge (the viewer's pulse, the
// heart, a month or two), Angus Barbieri's 382 days, midnight on day six, the rescue, the soup, Pip, the bigger half.
'use strict';

// "So how long could he last? Nobody's allowed to find out. Here's why." the dark: the days stack up into the dark like
// a ladder; DO NOT TRY THIS stamps across it
SC.edge = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#14081A', '#030105'); screenSpace();
  const up = ramp(lt, 0, D, E.inOutSine);
  for (let i = 0; i < 9; i++) {
    const d = [7, 10, 14, 21, 30, 40, 50, 60, 70][i], y = 760 - i * 120 + 400 * up, a = clamp(1 - i * 0.1) * pk(t, shot.start + i * 0.12);
    if (y < -60 || y > 1140) continue;
    ctx.save(); ctx.globalAlpha = a;
    rrect(ctx, 760, y - 44, 400, 88, 20); ctx.fillStyle = i < 1 ? '#2A3A6A' : i < 5 ? '#4A2A4A' : '#6A1A2A'; ctx.fill();
    ctx.font = '400 64px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFFFFF'; ctx.fillText('DAY ' + d, 960, y + 4);
    ctx.restore();
  }
  stampWord('?', 1300, 300, 220, '#FFD447', pk(t, c.howLong + 0.3) * (1 - ramp(t, c.nobody - 0.2, c.nobody)), 0.15);
  stampWord('DO NOT TRY THIS', 960, 520, 130, '#FF5A6E', pk(t, c.nobody + 0.3), -0.1);
  return bodyPost();
};
// "Find your pulse, on your neck or wrist. Count the beats for six seconds... go." him, close, two fingers on his neck
// (the badge); on "go" a big ring sweeps down from 6 to 0 while the viewer counts (the silence), his lips counting
SC.pulse = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cnt = ramp(t, c.go, c.go + 6.0, (x) => x);
  const cam = driftCam(mixCam(hutHeadCam(2.4, 760, 500), hutHeadCam(2.0, 600, 520), ramp(t, c.go - 0.2, c.go + 0.6, E.inOutCubic)), lt);
  const mouthMove = t > c.go && t < c.go + 6 ? 0.25 * Math.abs(Math.sin(t * 7)) : 0;
  hutNow(cam, t, { hero: { face: Object.assign({}, FACES.count, { mouth: 'o', mouthOpen: mouthMove }), pulse: ramp(t, c.findPulse, c.findPulse + 0.4), L: HUT_ARMS.hug.L, R: HUT_ARMS.pulse.R } });
  screenSpace();
  testBadge(['TRY IT', 'FIND YOUR PULSE', 'NECK OR WRIST'], ramp(t, c.findPulse - 0.1, c.findPulse + 0.3) * (1 - ramp(t, c.go - 0.3, c.go)));
  const pc = pk(t, c.findPulse + 0.9, 0.35) * (1 - ramp(t, c.go - 0.4, c.go - 0.1));
  if (pc > 0.01) pulseCard(1350, 560, pc, t);
  if (t >= c.go - 0.2) {   // the six-second ring (it sweeps; the number counts down; COUNT!)
    const x = 1360, y = 440, R = 230, k = pk(t, c.go - 0.2, 0.3) * (1 - ramp(t, c.go + 6.1, c.go + 6.4));
    if (k > 0.01) {
      ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
      circle(ctx, 0, 0, R + 20, 'rgba(8,12,34,0.85)');
      ctx.beginPath(); ctx.arc(0, 0, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - cnt)); ctx.lineWidth = 34; ctx.strokeStyle = '#FF5A6E'; ctx.lineCap = 'round'; ctx.stroke();
      const n = Math.max(0, Math.ceil(6 * (1 - cnt) - 1e-6));
      const fr = (6 * (1 - cnt)) % 1, pop = 1 + 0.08 * Math.exp(-(1 - fr) * 12);
      ctx.scale(pop, pop); ctx.font = '400 230px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFFFFF'; ctx.fillText(String(n), 0, 14);
      ctx.restore();
      tagPill('COUNT!', x, y + 320, k, '#FF5A6E', 60);
      softDot(gctx, x, y, 300, '#FF5A6E', 0.2 * k);
    }
  }
  return hutPost();
};
// where to find a pulse: two little drawings side by side, a neck in profile and a wrist, each with two fingertips on
// a red dot that beats (screen space, k pops it)
function pulseCard(x, y, k, t) {
  const kk = E.outBack(clamp(k), 2), b = Math.exp(-((t * 1.2) % 1) * 8);
  ctx.save(); ctx.translate(x, y); ctx.scale(kk, kk);
  rrect(ctx, -330, -170, 660, 340, 36); ctx.fillStyle = 'rgba(8,12,34,0.88)'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#FF5A6E'; ctx.stroke();
  // a neck in profile (facing right) with fingers under the jaw
  ctx.beginPath(); ctx.moveTo(-250, 140); ctx.quadraticCurveTo(-240, 20, -200, -40); ctx.quadraticCurveTo(-170, -120, -110, -120); ctx.quadraticCurveTo(-70, -110, -70, -60);
  ctx.lineTo(-60, -40); ctx.lineTo(-80, -30); ctx.quadraticCurveTo(-90, 20, -120, 40); ctx.quadraticCurveTo(-130, 90, -120, 140); ctx.closePath(); ctx.fillStyle = '#F2B892'; ctx.fill();
  circle(ctx, -128, 10, 10 + 5 * b, '#FF3A4E'); softDot(gctx, -128, 10, 30, '#FF5A6E', 0.6 * b);
  line(ctx, -40, 60, -112, 16, 18, '#E8A07A'); line(ctx, -36, 76, -108, 30, 18, '#F2B892');
  ctx.font = '900 40px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFFFFF'; ctx.fillText('NECK', -165, 132);
  // a wrist, palm up, with two fingertips on the thumb side
  rrect(ctx, 60, -40, 250, 90, 40); ctx.fillStyle = '#F2B892'; ctx.fill();
  line(ctx, 90, -20, 280, -20, 3, 'rgba(160,90,60,0.4)');
  circle(ctx, 130, 0, 10 + 5 * b, '#FF3A4E'); softDot(gctx, 130, 0, 30, '#FF5A6E', 0.6 * b);
  line(ctx, 230, -110, 140, -10, 18, '#E8A07A'); line(ctx, 250, -96, 156, 4, 18, '#F2B892');
  ctx.fillStyle = '#FFFFFF'; ctx.fillText('WRIST', 185, 132);
  ctx.font = '400 60px Anton'; ctx.fillStyle = '#FF5A6E'; ctx.fillText('OR', 0, 0);
  ctx.restore();
}
// "Add a zero. That's your heart rate: most people get sixty to a hundred." × 10 → a band from 60 to 100, green, with
// YOU somewhere on it (a marker that slides in), a heart beating at a calm 70
SC.zero = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#1A0A14', '#050104'); screenSpace();
  ecgLine(470, 150, t, 70, 0.22, '#FF5A6E');
  stampWord('×10', 960, 300, 200, '#FFD447', pk(t, c.addZero), -0.06);
  const bk = ramp(t, c.range - 0.4, c.range + 0.3, E.inOutCubic), x0 = 360, x1 = 1560, y = 680;
  const X = (bpm) => lerp(x0, x1, (bpm - 20) / 100);
  rrect(ctx, x0, y - 28, (x1 - x0), 56, 28); ctx.fillStyle = '#2A2A40'; ctx.fill();
  rrect(ctx, X(60), y - 34, (X(100) - X(60)) * bk, 68, 34); ctx.fillStyle = '#4DFFB4'; ctx.fill();
  if (bk > 0.01) softDot(gctx, (X(60) + X(100)) / 2, y, 260, '#4DFFB4', 0.35 * bk);
  ctx.font = '400 64px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const v of [20, 40, 60, 80, 100, 120]) { ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillText(String(v), X(v), y + 80); }
  tagPill('MOST PEOPLE', (X(60) + X(100)) / 2, y - 205, pk(t, c.range + 0.1), '#4DFFB4', 50);
  // YOU: a marker that slides along the band and settles near the middle (the viewer's own number lives there)
  const yk = pk(t, c.heartRate, 0.4);
  if (yk > 0.01) { const yx = X(lerp(40, 74, ramp(t, c.heartRate, c.heartRate + 1.2, E.outBack))); ctx.save(); ctx.translate(yx, y - 40); ctx.scale(yk, yk); ctx.beginPath(); ctx.moveTo(0, 20); ctx.lineTo(-22, -16); ctx.lineTo(22, -16); ctx.closePath(); ctx.fillStyle = '#FFD447'; ctx.fill(); ctx.restore(); tagPill('YOU?', yx, y - 118, yk, '#FFD447', 44); }
  const hb = Math.exp(-((t * 70 / 60) % 1) * 9);
  heartIcon(1560, 330, 2.6 * (1 + 0.12 * hb));
  softDot(gctx, 1560, 330, 180, '#FF5A6E', 0.3 + 0.4 * hb);
  return bodyPost();
};
// a faint heart trace scrolling right to left behind a graphic (screen space): bpm beats a second, 330 px a beat
function ecgLine(y0, amp, t, bpm, a, col) {
  const per = 330, off = (t * bpm / 60 * per) % per;
  const f = (u) => {   // one beat, u in 0..1: P bump, QRS spike, T bump
    if (u > 0.1 && u < 0.2) return -0.12 * Math.sin((u - 0.1) / 0.1 * Math.PI);
    if (u > 0.3 && u < 0.34) return 0.25 * (u - 0.3) / 0.04;
    if (u > 0.34 && u < 0.38) return 0.25 - 1.25 * (u - 0.34) / 0.04;
    if (u > 0.38 && u < 0.42) return -1 + 1.0 * (u - 0.38) / 0.04;
    if (u > 0.55 && u < 0.72) return -0.2 * Math.sin((u - 0.55) / 0.17 * Math.PI);
    return 0;
  };
  for (const [cc, w, m] of [[ctx, 4, 1], [gctx, 10, 0.7]]) {
    cc.beginPath();
    for (let x = 0; x <= W; x += 5) { const u = (((x + off) % per) + per) % per / per; const yy = y0 + amp * f(u); x ? cc.lineTo(x, yy) : cc.moveTo(x, yy); }
    cc.lineWidth = w; cc.strokeStyle = rgba(col, a * m); cc.lineJoin = 'round'; cc.stroke();
  }
}
// "The Minnesota men, by the end? About thirty-five." old film: a 1940s heart trace, slow, 35 ON THE MONITOR, against the
// viewer's band; "A heart is a muscle... and a starving body eats muscle." the diagram: the heart shrinks
SC.heart = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  if (t < c.isMuscle - 0.1) {
    darkBg('#2A2014', '#0A0804'); screenSpace();
    // a paper strip with a slow trace (35 a minute)
    const x0 = 260, x1 = 1660, y = 520;
    ctx.fillStyle = '#F4EAD0'; ctx.fillRect(x0, y - 170, x1 - x0, 340);
    for (let x = x0; x < x1; x += 40) line(ctx, x, y - 170, x, y + 170, 1, 'rgba(200,120,100,0.35)');
    for (let yy = y - 160; yy < y + 170; yy += 40) line(ctx, x0, yy, x1, yy, 1, 'rgba(200,120,100,0.35)');
    const drawn = ramp(t, shot.start, c.isMuscle, (x) => x);
    ctx.beginPath();
    for (let x = x0; x <= x0 + (x1 - x0) * drawn; x += 4) {
      const ph = ((x - x0) / 400) % 1;   // one slow beat every 400 px (37 a minute)
      const v = ph < 0.05 ? -150 * Math.sin(ph / 0.05 * Math.PI) : ph < 0.09 ? 60 * Math.sin((ph - 0.05) / 0.04 * Math.PI) : 6 * Math.sin(ph * 20);
      if (x === x0) ctx.moveTo(x, y + v); else ctx.lineTo(x, y + v);
    }
    ctx.lineWidth = 6; ctx.strokeStyle = '#3A2A1A'; ctx.stroke();
    hsSepia(0.6); hsFilm(t, 0.8);
    screenSpace();
    stampWord('37', 1420, 230, 200, '#FF5A6E', pk(t, c.t35), -0.08);
    tagPill('BEATS A MINUTE', 1420, 400, pk(t, c.t35 + 0.2), '#FFE6B0', 46);
    return hutPost({ glow: 0.5 });
  }
  darkBg('#14081A', '#030105'); screenSpace();
  const V = ibView(IB.heart, [960, 500], 3.6 + 0.3 * ramp(t, c.isMuscle, shot.end));
  const shr = ramp(t, c.eatsMuscle - 0.2, c.eatsMuscle + 0.8);
  ibBody(V, t, { flex: 0, heart: { beat: Math.exp(-((t * 40 / 60) % 1) * 7), shrink: shr }, liver: { fill: 0 }, brain: { mood: 'worry' } });
  screenSpace();
  tagPill('A MUSCLE', 1400, 300, pk(t, c.isMuscle + 0.2), '#FF5A6E', 54);
  return bodyPost();
};
// "With water, most healthy people would last one to two months. After the fat runs out, the body eats its own
// protein... and in the end, the heart." a ruler of days to 70: a gold fuel bar burns down to DAY 30-60; red after it;
// a heart icon at the end that cracks
SC.limit = (lt, t, shot) => limitDraw(lt, t, shot, 1 + 0.03 * (t - SHOT_START('limit')) / 10, 960, 520);
// "After the fat runs out, the body eats its own protein... and in the end, the heart." the same ruler, closer on its end
SC.limit2 = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#14081A', '#030105'); screenSpace();
  const fg = ramp(t, c.fatRuns, c.fatRuns + 1.0, E.inOutCubic), pr = ramp(t, c.ownProtein - 0.1, c.ownProtein + 0.6), hk = ramp(t, c.theHeart, c.theHeart + 0.4);
  const V = ibMix(ibView([0, 60], [960, 500], 1.3), ibView(IB.heart, [960, 470], 2.6), ramp(t, c.theHeart - 0.5, c.theHeart + 0.3, E.inOutCubic));
  ibBody(V, t, { flex: 1, fat: { shrink: 0.2 + 0.75 * fg, glow: 0.4 * (1 - fg) }, muscle: { lit: pr, shrink: 0.3 + 0.4 * pr }, liver: { fill: 0 }, straw: { flow: 0.3, green: 1 },
    heart: { beat: Math.exp(-((t * 40 / 60) % 1) * 7), shrink: 0.3 * pr, glow: 1 + hk }, brain: { mood: 'worry', green: 0.8 } });
  if (hk > 0.01) {   // the crack across the heart
    const P = ibPt(V, IB.heart), sc = V.s;
    poly(ctx, [[P[0] - 6 * sc, P[1] - 28 * sc], [P[0] + 8 * sc, P[1] - 8 * sc], [P[0] - 6 * sc, P[1] + 6 * sc], [P[0] + 6 * sc, P[1] + 24 * sc]].slice(0, 1 + Math.round(3 * hk)), 5 * sc, '#14081A');
  }
  screenSpace();
  tagPill('FAT: GONE', 560, 260, pk(t, c.fatRuns + 0.6) * (1 - ramp(t, c.theHeart - 0.6, c.theHeart - 0.3)), '#FFD447', 52);
  tagPill('PROTEIN', 1400, 260, pk(t, c.ownProtein + 0.1) * (1 - ramp(t, c.theHeart - 0.6, c.theHeart - 0.3)), '#FF5A6E', 52);
  tagPill('THE HEART', 1400, 260, pk(t, c.theHeart + 0.2), '#FF5A6E', 56);
  return bodyPost({ flash: 0.25 * kick(t, c.theHeart + 0.4, 8) });
};
const SHOT_START = (id) => TLd.shots.find((s) => s.id === id).start;
function limitDraw(lt, t, shot, pushK, pcx, pcy) {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#14081A', '#030105'); screenSpace();
  const x0 = 260, x1 = 1660, y = 520, X = (d) => lerp(x0, x1, d / 70);
  const rk = ramp(t, SHOT_START('limit'), SHOT_START('limit') + 0.6, E.inOutCubic);
  const wk = pk(t, c.withWater - 0.05, 0.35) * (1 - ramp(t, c.fatRuns - 0.3, c.fatRuns));
  if (wk > 0.01) {   // a glass of water over day 0: WITH WATER
    ctx.save(); ctx.translate(x0 + 300, y - 190); ctx.scale(wk, wk);
    ctx.beginPath(); ctx.moveTo(-60, -90); ctx.lineTo(60, -90); ctx.lineTo(46, 90); ctx.lineTo(-46, 90); ctx.closePath(); ctx.fillStyle = 'rgba(200,230,255,0.25)'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#BFF0FF'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-54, -30 + 4 * Math.sin(t * 3)); ctx.lineTo(54, -30 - 4 * Math.sin(t * 3)); ctx.lineTo(46, 90); ctx.lineTo(-46, 90); ctx.closePath(); ctx.fillStyle = 'rgba(127,233,255,0.6)'; ctx.fill();
    ctx.restore();
    tagPill('WITH WATER', x0 + 300, y - 330, wk, '#7FE9FF', 46);
  }
  rrect(ctx, x0, y - 30, (x1 - x0) * rk, 60, 20); ctx.fillStyle = '#2A2A40'; ctx.fill();
  ctx.font = '400 48px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const d of [0, 10, 20, 30, 40, 50, 60, 70]) { ctx.fillStyle = `rgba(255,255,255,${0.7 * rk})`; ctx.fillText(String(d), X(d), y + 80); }
  ctx.font = '900 36px Montserrat'; ctx.fillStyle = `rgba(255,255,255,${0.8 * rk})`; ctx.fillText('DAYS', X(35), y + 140);
  // the band 30-60: one to two months
  const mk = ramp(t, c.months - 0.2, c.months + 0.5, E.inOutCubic);
  rrect(ctx, X(30), y - 38, (X(60) - X(30)) * mk, 76, 24); ctx.fillStyle = 'rgba(255,212,71,0.85)'; ctx.fill();
  tagPill('1–2 MONTHS', (X(30) + X(60)) / 2, y - 110, pk(t, c.months + 0.2), '#FFD447', 56);
  // the fuel order: fat (gold) then protein (red)
  const fk = ramp(t, c.fatRuns - 0.1, c.fatRuns + 0.6), pr = ramp(t, c.ownProtein - 0.1, c.ownProtein + 0.6);
  if (fk > 0.01) { tagPill('FAT', X(15), y - 220, pk(t, c.fatRuns), '#FFD447', 50); }
  if (pr > 0.01) { tagPill('PROTEIN', X(50), y - 220, pk(t, c.ownProtein), '#FF5A6E', 50); }
  const hk = pk(t, c.theHeart - 0.1);
  if (hk > 0.01) {
    heartIcon(X(66), y - 230, 1.4 * hk);
    const cr = ramp(t, c.theHeart + 0.3, c.theHeart + 0.6);
    if (cr > 0.01) poly(ctx, [[X(66) - 10, y - 290], [X(66) + 12, y - 250], [X(66) - 8, y - 225], [X(66) + 10, y - 190]].slice(0, 1 + Math.round(3 * cr)), 8, '#14081A');
  }
  return bodyPost({ push: { k: pushK, cx: pcx, cy: pcy } });
}
// "Except one man. In 1965, Angus Barbieri weighed over two hundred kilos. With doctors watching, he lived on water and
// vitamins... for three hundred and eighty-two days." old film, the hospital room in Dundee: a big man on the scale
// (207 KG); a doctor's clipboard; his vitamins; the big calendar flips its days faster and faster to 382
SC.barbieri = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  // the room; a snap zoom onto his face on his name; a smash zoom onto the scale's dial on "two hundred kilos"
  const z1 = ramp(t, c.angus - 0.1, c.angus + 0.15, E.outCubic) * (1 - ramp(t, c.kilos200 - 0.15, c.kilos200, E.inCubic));
  const z2 = ramp(t, c.kilos200 - 0.15, c.kilos200 + 0.08, E.outCubic);
  const base = mixCam({ x: 860, y: 520, zoom: 1.3, rot: 0 }, { x: 800, y: 540, zoom: 1.45, rot: 0 }, ramp(lt, 0, D, E.inOutSine));
  const cam = mixCam(mixCam(base, { x: 790, y: 600, zoom: 2.0 + 0.1 * ramp(t, c.angus, c.kilos200), rot: 0 }, z1), { x: 650, y: 650, zoom: 2.2 + 0.15 * ramp(t, c.kilos200, shot.end), rot: 0 }, z2);
  applyCam(shakeCam(driftCam(cam, lt), t, 9 * kick(t, c.kilos200 + 0.05, 6)));
  bbRoom(t);
  hsPerson(t, HS_PALS[2], { x: 760, y: 880, s: 0.8, sx: 1.5, belly: 1, pose: POSES.stand, face: z1 > 0.5 ? FACES.smug : FACES.calm, seed: 8 });
  const kg = 207 * E.outBack(ramp(t, c.kilos200 - 0.05, c.kilos200 + 0.6), 1.4);
  hsScale(560, 900, 0.85, Math.max(0, kg), t, { lo: 0, hi: 220 });
  bbVitamins(ctx, 980, 700, 1.2);
  bbCalendar(1250, 340, 0.85, 1, 0, t, {});
  hsSepia(0.45); hsFilm(t, 0.7);
  screenSpace();
  stampWord('1965', 330, 330, 150, '#FFE6B0', pk(t, c.y1965), -0.08);
  tagPill('ANGUS BARBIERI', 960, 160, pk(t, c.angus) * (1 - ramp(t, c.kilos200 - 0.2, c.kilos200)), '#FFE6B0', 50);
  const [gx, gy] = toScreen(cam, 566, 760);
  tagPill('207 KG', gx, gy, pk(t, c.kilos200 + 0.3), '#FFE6B0', 66);
  return hutPost({ glow: 0.5, flash: 0.3 * kick(t, c.y1965 + 0.05, 8) + 0.22 * kick(t, c.kilos200 + 0.08, 8) });
};
// "With doctors watching, he lived on water and vitamins... for three hundred and eighty-two days." closer on the wall:
// a doctor's clipboard, the vitamin bottle, and the big calendar flipping its pages faster and faster to 382
SC.barbieri2 = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const k1 = ramp(t, c.d382 - 0.4, c.d382end, E.inOutCubic);
  const cam2 = driftCam(mixCam({ x: 1180, y: 470, zoom: 1.35, rot: 0 }, { x: 1250, y: 420, zoom: 1.75, rot: 0 }, k1), lt);
  applyCam(cam2);
  bbRoom(t);
  hsPerson(t, HS_PALS[2], { x: 760, y: 880, s: 0.8, sx: 1.4, belly: 0.9, pose: POSES.stand, face: FACES.calm, seed: 8 });
  bbVitamins(ctx, 980, 700, 1.2 + 0.15 * kick(t, c.vitamins + 0.3, 5));
  // a doctor's clipboard held in from the left
  const dk = ramp(t, c.doctors - 0.1, c.doctors + 0.3, E.outBack);
  if (dk > 0.01) { ctx.save(); ctx.translate(lerp(520, 700, dk), 430); ctx.rotate(-0.12); rrect(ctx, -70, -100, 140, 190, 10); ctx.fillStyle = '#B8865A'; ctx.fill(); rrect(ctx, -58, -80, 116, 160, 6); ctx.fillStyle = '#FFFFFF'; ctx.fill(); for (let i = 0; i < 5; i++) line(ctx, -44, -50 + i * 28, 44, -50 + i * 28, 4, 'rgba(60,60,80,0.5)'); line(ctx, -200, 60, -70, 40, 50, '#F4F0E8'); ctx.restore(); }
  const n = Math.max(1, Math.round(382 * Math.pow(ramp(t, c.vitamins - 0.2, c.d382end, (x) => x), 2.2)));
  bbCalendar(1250, 340, 0.85, n, n < 382 ? ((t * 9) % 1) : 0, t, {});
  hsSepia(0.45); hsFilm(t, 0.7);
  screenSpace();
  tagPill('WITH DOCTORS', 960, 160, pk(t, c.doctors) * (1 - ramp(t, c.vitamins - 0.2, c.vitamins)), '#7FE9FF', 50);
  tagPill('WATER + VITAMINS', 960, 160, pk(t, c.vitamins), '#7FE9FF', 50);
  stampWord('382 DAYS', 1250, 780, 130, '#FFD447', pk(t, c.d382end + 0.25), -0.06);
  // a vitamin pill hops out of the bottle and spins
  const pu = ramp(t, c.vitamins + 0.3, c.vitamins + 1.0, (x) => x);
  if (pu > 0 && pu < 1) {
    const [qx, qy] = toScreen(cam2, 990 + 160 * pu, 610 - 260 * pu + 330 * pu * pu);
    ctx.save(); ctx.translate(qx, qy); ctx.rotate(9 * pu); rrect(ctx, -26, -12, 52, 24, 12); ctx.fillStyle = '#FFFFFF'; ctx.fill(); rrect(ctx, 0, -12, 26, 24, 12); ctx.fillStyle = '#FF9A3C'; ctx.fill(); ctx.restore();
  }
  // "with doctors watching": an old press camera's flash bulb
  return hutPost({ glow: 0.5, flash: 0.2 * kick(t, c.d382end + 0.25, 8) + 0.5 * kick(t, c.flashBulb, 9) + 0.15 * kick(t, c.vitamins + 0.3, 8) });
};
// "He lost a hundred and twenty-five kilos. And he went to the toilet... about once every forty days." the scale's
// needle swings down, he slims to 82 KG; the calendar shows DAY 40 with a toilet in its corner: ONCE EVERY 40 DAYS
SC.toilet = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const sl = ramp(t, c.lost, c.lost + 1.4, E.inOutCubic), tk = ramp(t, c.toiletW - 0.3, c.toiletW + 0.4, E.inOutCubic);
  const cam = mixCam({ x: 760, y: 560, zoom: 1.3, rot: 0 }, { x: 1120, y: 470, zoom: 1.42, rot: 0 }, tk);
  applyCam(driftCam(cam, lt));
  bbRoom(t);
  // he steps off the scale and over to the calendar; on "forty days" he holds up a toilet roll, very pleased
  const wk = ramp(t, c.toiletW - 0.2, c.toiletW + 0.8, E.inOutSine), roll = E.outBack(ramp(t, c.forty - 0.25, c.forty + 0.15), 2);
  let pose = (wk > 0.02 && wk < 0.98) ? walkPose(t, 9) : JSON.parse(JSON.stringify(POSES.stand));
  if (roll > 0.01) pose = ikReach(pose, 'R', [lerp(40, 140, roll), lerp(-110, -440, roll)], 1);
  hsPerson(t, HS_PALS[2], { x: lerp(760, 905, wk), y: 880, s: 0.8, sx: lerp(1.5, 1.0, sl), belly: 1 - sl, pose,
    face: roll > 0.5 ? FACES.proud : lerpFace(FACES.calm, FACES.proud, sl), seed: 8,
    post: roll > 0.01 ? (lc, r) => { toiletRoll(lc, r.wrR[0] + 4, r.wrR[1] - 40, 1.1 * roll, t); } : null });
  hsScale(560, 900, 0.85, lerp(lerp(207, 82, sl), 0, wk), t, { lo: 0, hi: 220 });
  bbCalendar(1250, 340, 0.85, 40, 0, t, { icon: 'toilet', top: 'DAY' });
  hsSepia(0.45); hsFilm(t, 0.7);
  screenSpace();
  tagPill('−125 KG', 560, 690, pk(t, c.lost + 1.0) * (1 - tk), '#4DFFB4', 60);
  const [bx, by] = toScreen(cam, 1250, 600);
  tagPill('BY THE END', bx, by, pk(t, c.byEnd) * (1 - ramp(t, c.forty + 0.1, c.forty + 0.3)), '#FFE6B0', 46);
  stampWord('ONCE EVERY 40 DAYS!', 1320, 700, 92, '#FFD447', pk(t, c.forty + 0.3), -0.05);
  return hutPost({ glow: 0.5 });
};
// a toilet roll (rig-local), a little sparkle on it
function toiletRoll(c, x, y, s, t) {
  c.save(); c.translate(x, y); c.rotate(-0.15); c.scale(s, s);
  rrect(c, -34, -40, 68, 80, 10); c.fillStyle = '#F4F2EA'; c.fill();
  c.beginPath(); c.ellipse(0, -40, 34, 12, 0, 0, Math.PI * 2); c.fillStyle = '#FFFFFF'; c.fill();
  c.beginPath(); c.ellipse(0, -40, 11, 5, 0, 0, Math.PI * 2); c.fillStyle = '#B8A888'; c.fill();
  for (let i = 0; i < 3; i++) line(c, -34, -20 + i * 22, 34, -16 + i * 22, 2, 'rgba(180,170,150,0.6)');
  c.restore();
}
// "His first meal? One boiled egg." the egg in its cup pops onto the table with a little crown and sparkles; his grin
SC.egg = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  applyCam(driftCam({ x: 900, y: 520, zoom: 1.6 + 0.15 * ramp(lt, 0, D), rot: 0 }, lt));
  bbRoom(t);
  hsPerson(t, HS_PALS[2], { x: 720, y: 880, s: 0.8, sx: 1.0, pose: POSES.stand, face: lerpFace(FACES.calm, FACES.happy, ramp(t, c.eggW, c.eggW + 0.3)), seed: 8 });
  rrect(ctx, 880, 700, 360, 30, 8); ctx.fillStyle = '#C8C0A8'; ctx.fill();
  bbEgg(1060, 640, 1.1, pk(t, c.eggW - 0.05, 0.35), t);
  hsSepia(0.35); hsFilm(t, 0.6);
  screenSpace();
  stampWord('1 EGG', 1450, 230, 150, '#FFD447', pk(t, c.eggW + 0.3), 0.08);
  const nk = pk(t, c.papers - 0.1, 0.35);
  if (nk > 0.01) {   // the newspaper: FAST ENDS
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(1450, 520); ctx.rotate(0.06); ctx.scale(nk, nk);
    ctx.fillStyle = '#F4EEDC'; ctx.fillRect(-230, -170, 460, 340);
    ctx.fillStyle = '#2A2A2A'; ctx.font = '400 30px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('THE MORNING PAPER · 1966', 0, -140);
    line(ctx, -210, -118, 210, -118, 3, '#2A2A2A');
    ctx.font = '400 74px Anton'; ctx.fillText('FAST ENDS', 0, -66);
    ctx.font = '900 30px Montserrat'; ctx.fillText('382 DAYS. FIRST MEAL:', 0, -6);
    ctx.font = '400 50px Anton'; ctx.fillText('A BOILED EGG', 0, 44);
    for (let i = 0; i < 4; i++) line(ctx, -200, 90 + i * 20, 200, 90 + i * 20, 5, 'rgba(60,60,60,0.35)');
    ctx.restore();
  }
  return hutPost({ glow: 0.6 });
};

// ================================================================= DAY SIX: MIDNIGHT
// "Day six. Midnight. The worst of the storm. He unwraps the chocolate..." the darkest hut: the stove nearly out, the
// candle a stub, the storm battering the window; he lifts the bar and peels the wrapper (the gold foil catches the
// candle); the wordless beat: he stares at it... and wraps it back up; sets it down and pats it
SC.day6 = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  if (t >= c.midnight - 0.07 && t < c.worst - 0.07) {   // the candle, a stub, close; its flame shivers
    const cam = driftCam(ptCam([HUT.candleX, HUT.tableY - 60], 3.4, 960, 560), lt, 0.5);
    hutNow(cam, t, { choc: null, hero: { face: FACES.tired, blanket: 1, L: HUT_ARMS.hug.L, R: HUT_ARMS.hug.R, shiver: 0.5 } });
    return hutPost({ glow: 0.9 });
  }
  if (t >= c.worst - 0.07 && t < c.unwraps - 0.07) {   // the window, the storm battering it, frost thick on the glass
    const cam = driftCam(ptCam([HUT.winX + HUT.winW / 2, HUT.winY + HUT.winH / 2], 2.1, 960, 520), lt, 0.5);
    hutNow(shakeCam(cam, t, 4), t, { choc: null, fox: null, hero: { face: FACES.tired, blanket: 1, L: HUT_ARMS.hug.L, R: HUT_ARMS.hug.R } });
    return hutPost({ glow: 0.85 });
  }
  const un = ramp(t, c.unwraps, c.unwraps + 2.2, E.inOutSine), re = 0;
  const open = 0.75 * un;
  const cl = ramp(t, c.unwraps - 0.3, c.unwraps + 1.2, E.inOutCubic);
  const cam = driftCam(mixCam({ x: 1000, y: 470, zoom: 1.25, rot: 0 }, hutHeadCam(2.1, 900, 470), cl), lt, 0.6);
  hutNow(shakeCam(cam, t, 2), t, { choc: null, hero: { face: lerpFace(lerpFace(FACES.tired, FACES.longing, un), FACES.soft, re), choc: { k: 1, open, rot: -0.04 }, L: [-50, -120], R: [50, -120], blanket: 1, shiver: 0.4 * (1 - re) } });
  // the foil's glow on his face
  if (open > 0.05) { const hp = toScreen(cam, ...hutHead({})); softDot(gctx, hp[0], hp[1] + 120 * cam.zoom * 0.3, 260, '#FFD447', 0.4 * open); }
  return hutPost({ glow: 0.9 });
};
// "...and wraps it back up." a cut to his hands, close: the paper folds back over the foil; he sets the bar down on the
// table, pats it twice, and his face softens (a small smile in the candlelight)
SC.wrap = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const re = ramp(t, c.wrapsBack - 0.2, c.wrapsBack + 0.9, E.inOutSine), down = ramp(t, c.wrapsBack + 0.9, c.wrapsBack + 1.5, E.inOutCubic);
  const cam = driftCam(mixCam(ptCam(hutPt([0, -110]), 2.8, 960, 560), hutHeadCam(2.2, 900, 470), ramp(t, c.wrapsBack + 1.2, shot.end, E.inOutCubic)), lt, 0.5);
  const pat = down > 0.9 ? Math.abs(Math.sin((t - c.wrapsBack - 1.5) * 9)) * (1 - ramp(t, c.wrapsBack + 2.0, c.wrapsBack + 2.2)) : 0;
  hutNow(cam, t, { choc: down > 0.95 ? { glow: 0.3 } : null, hero: { face: lerpFace(FACES.longing, FACES.soft, re), choc: down > 0.95 ? null : { k: 1, open: 0.75 * (1 - re), rot: -0.04 }, L: [-50, lerp(-120, -40, down)], R: [50, lerp(-120, -40 - 20 * pat, down)], blanket: 1 } });
  return hutPost({ glow: 0.9 });
};

// ================================================================= DAY SEVEN: THE RESCUE
// "Day seven." white light floods the window, the snow outside has stopped; he looks up. "The storm breaks." outside:
// a clear blue morning, the helicopter comes in over the ridge and settles, its downwash blowing the snow
SC.rescue = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  if (t < c.breaks - 0.1) {
    const cam = driftCam(mixCam(hutHeadCam(1.9, 760, 470), { x: 1150, y: 470, zoom: 1.4, rot: 0 }, ramp(t, c.sunUp, c.sunUp + 0.9, E.inOutCubic)), lt);
    hutNow(cam, t, { choc: { glow: 0.2 }, hero: { face: lerpFace(FACES.tired, FACES.wonder, ramp(t, c.sunUp, c.sunUp + 0.5)), L: HUT_ARMS.hug.L, R: HUT_ARMS.hug.R, blanket: 1, headRot: 0.15 * ramp(t, c.sunUp, c.sunUp + 0.5) } });
    return hutPost({ flash: 0.35 * kick(t, c.sunUp, 4) });
  }
  const k = ramp(t, c.breaks - 0.1, shot.end, E.inOutSine);
  const cam = mixCam({ x: 1100, y: 470, zoom: 1.15, rot: 0 }, { x: 1150, y: 560, zoom: 1.3, rot: 0 }, k);
  mtScene(cam, t, { day: 1, storm: 0, hut: { lit: 0 }, after: () => {
    const hx = lerp(500, 820, k), hy = lerp(220, MT.snowY - 210, E.outCubic(k));
    for (let i = 0; i < 12; i++) { const u = ((t * 1.3 + i / 12) % 1); softDot(ctx, hx + (i % 2 ? 1 : -1) * 300 * u, MT.snowY - 10 - 40 * u, 30 + 40 * u, '#FFFFFF', 0.5 * (1 - u) * k); }
    heli(ctx, hx, hy, 0.95, t, { light: 0 });
  } });
  screenSpace();
  stampWord('RESCUE!', 1500, 260, 130, '#4DFFB4', pk(t, c.breaks + 0.6), -0.06);
  return hutPost({ glow: 0.75 });
};
// "The rescuers hand him a cup of soup. Your mouth just watered again, didn't it? So did his." the hut in daylight, the
// door open on the snow: a rescuer's red glove hands him a steaming mug; the window of the mouth's taps opens again;
// his drool, his grin
SC.soup = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = driftCam(mixCam({ x: 900, y: 480, zoom: 1.7, rot: 0 }, hutHeadCam(2.4, 760, 480), ramp(t, c.wateredAgain - 0.4, c.wateredAgain + 0.4, E.inOutCubic)), lt);
  const give = ramp(t, c.soupW - 0.6, c.soupW + 0.2, E.outCubic);
  const S = hutNow(cam, t, { choc: { glow: 0 }, hero: { face: lerpFace(FACES.tired, FACES.hungry, ramp(t, c.soupW, c.soupW + 0.3)), drool: ramp(t, c.soDid, c.soDid + 0.6), L: [-20, -110], R: [70, -110], blanket: 1 },
    before: () => { rescuer(t, give); } });
  const wk = pk(t, c.wateredAgain - 0.1, 0.35);
  if (wk > 0.01) { const hp = toScreen(cam, ...hutHead({})); mouthTaps(1350, 400, 180 * wk, t, ramp(t, c.wateredAgain + 0.2, c.wateredAgain + 0.7), hp); }
  return hutPost();
};
// the rescuer: the rig in a red jacket and a white helmet, standing behind the table to his right; his arm reaches out
// with a steaming mug (give 0..1)
const RESCPAL = Object.assign({}, PAL, { coat: '#E8343E', coatSh: '#B8202A', coatHi: '#FF6A60', coatDk: '#8A1A20', strap: '#FFD447', strapSh: '#D8A92A', hair: '#3A2A20', hairHi: '#5A4030', pants: '#2A2A34', pantsSh: '#1A1A24' });
function rescuer(t, give) {
  const st = { x: HUT.heroX + 420, y: HUT.heroY + 30, s: 0.84, face: FACES.soft, seed: 12, noLegs: true,
    pose: ikReach(ikReach({ hipY: -222, lean: -0.08, armL: { a: 0.3, b: 0.2 }, armR: { a: 0.2, b: 0.1 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, hand: 'open', feetFront: 1 }, 'L', [lerp(-60, -250, give), lerp(-140, -170, give)], -1), 'R', [60, -60], 1) };
  const r = drawCharacter(ctx, st, t, RESCPAL);
  ctx.save(); ctx.translate(st.x, st.y); ctx.scale(st.s, st.s);
  ctx.translate(r.head[0], r.head[1] - 46); ctx.beginPath(); ctx.ellipse(0, -10, 74, 62, 0, Math.PI, 0); ctx.fillStyle = '#F4F4F8'; ctx.fill();
  rrect(ctx, -78, -14, 156, 16, 8); ctx.fillStyle = '#D8D8E0'; ctx.fill(); ctx.restore();
  const w = toWorld(st, r.wrL);
  tinMug(ctx, w[0] - 10, w[1] + 30, 0.8, t, 1.4);
}
// "Just a cup: after days without food, the first meals start small." a feast with a red X (too much, too fast), then
// three steps that grow: a cup, a bowl, a plate
SC.slow = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#0E2030', '#03070C'); screenSpace();
  const fk = pk(t, shot.start, 0.3) * (1 - ramp(t, c.startSmall - 0.4, c.startSmall - 0.1));
  if (fk > 0.01) {   // a feast: a roast, a cake, a pile of bread
    ctx.save(); ctx.translate(960, 480); ctx.scale(fk, fk);
    ellipse(ctx, 0, 90, 420, 60, '#C8C0D0'); ellipse(ctx, -150, 30, 120, 70, '#B85A2A'); ellipse(ctx, -150, 10, 100, 50, '#D8783A');
    rrect(ctx, 40, -60, 200, 140, 20); ctx.fillStyle = '#F4C8D8'; ctx.fill(); rrect(ctx, 40, -76, 200, 30, 14); ctx.fillStyle = '#FFFFFF'; ctx.fill();
    for (let i = 0; i < 4; i++) ellipse(ctx, 290 + 30 * (i % 2), 40 - 34 * i, 60, 28, '#E8B060');
    ctx.restore();
    bigX(960, 470, 0.85 * fk, ramp(t, c.justCup + 0.5, c.justCup + 0.8));
  }
  const sk = ramp(t, c.startSmall - 0.3, c.startSmall + 0.2);
  if (sk > 0.01) {
    [[600, 0.6], [960, 0.85], [1320, 1.15]].forEach(([x, s], i) => {
      const k = pk(t, c.startSmall - 0.3 + i * 0.3, 0.3);
      if (k <= 0.01) return;
      ctx.save(); ctx.translate(x, 560); ctx.scale(s * k, s * k);
      if (i === 0) tinMug(ctx, 0, 60, 1, t, 1);
      else if (i === 1) { ellipse(ctx, 0, 30, 110, 40, '#E8EAF2'); ctx.beginPath(); ctx.ellipse(0, 20, 100, 70, 0, 0, Math.PI); ctx.fillStyle = '#E8EAF2'; ctx.fill(); ellipse(ctx, 0, 22, 92, 26, '#E8B060'); }
      else { ellipse(ctx, 0, 40, 150, 34, '#E8EAF2'); ellipse(ctx, -40, 22, 50, 30, '#D8783A'); ellipse(ctx, 40, 26, 40, 18, '#7AB84A'); }
      ctx.restore();
      if (i < 2) { line(ctx, x + 110, 560, x + 230, 560, 8, `rgba(255,212,71,${k})`); line(ctx, x + 210, 540, x + 232, 560, 8, `rgba(255,212,71,${k})`); line(ctx, x + 210, 580, x + 232, 560, 8, `rgba(255,212,71,${k})`); }
    });
    tagPill('CUP → BOWL → PLATE', 960, 300, pk(t, c.startSmall + 0.4), '#4DFFB4', 56);
  }
  return bodyPost({ push: { k: 1 + 0.04 * lt / D, cx: 960, cy: 520 } });
};

// ================================================================= HOME
// the bar's place in the kitchen shots: in his hand (from), over the table, in hers (to)
function kitBar(t, k, o = {}) {
  const a = kitPt('hero', [140, -150]), b = kitPt('pip', [-20, -100]);
  const x = lerp(a[0], b[0], E.inOutCubic(k)), y = lerp(a[1], b[1], E.inOutCubic(k)) - 50 * Math.sin(Math.PI * k);
  chocBar(ctx, x, y, 0.62, t, { rot: -0.1 + 0.2 * k, glow: o.glow || 0 });
  return [x, y];
}
// "At home, he hands Pip her chocolate. Not one bite missing." Pip's kitchen in the afternoon sun: he holds the bar out
// across the table, she takes it with both hands, her eyes wide; a tick: NOT ONE BITE MISSING
SC.home = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = driftCam(mixCam({ x: 950, y: 590, zoom: 1.45, rot: 0 }, { x: 990, y: 600, zoom: 1.65, rot: 0 }, ramp(lt, 0, D, E.inOutSine)), lt);
  const hand = ramp(t, c.hands - 0.2, c.hands + 0.8);
  kitScene(cam, t, { party: false, noCake: true, lamp: 0.7,
    hero: { hat: null, face: FACES.soft, R: hand < 0.6 ? [150, -160] : [110, -60], L: [-70, -60] },
    pip: { hat: null, face: lerpFace(FACES.happy, FACES.wonder, ramp(t, c.notOne - 0.2, c.notOne + 0.2)), L: [-90, -170], R: [10, -170], whistle: false },
    after: () => { kitBar(t, hand, { glow: ramp(t, c.notOne, c.notOne + 0.4) }); } });
  screenSpace();
  tagPill('NOT ONE BITE MISSING', 960, 180, pk(t, c.notOne + 0.2), '#4DFFB4', 54);
  return hutPost({ glow: 0.75 });
};
// "Every night, she'd asked about the chocolate. Because if the chocolate was okay... so was he." close on Pip; a
// memory in a soft window: Pip in her pyjamas at night by the radio, holding the microphone; on "so was he" she looks up
// at him and the window fades
SC.reveal = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const pp = kitHead('pip', {});
  const cam = driftCam(mixCam(ptCam(pp, 3.0, 640, 520), ptCam(pp, 3.5, 680, 500), ramp(lt, 0, D, E.inOutSine)), lt);
  kitScene(cam, t, { party: false, noCake: true, lamp: 0.7, hero: { hat: null, face: FACES.soft }, pip: { hat: null, whistle: false, face: lerpFace(FACES.soft, FACES.happy, ramp(t, c.soWas, c.soWas + 0.4)), L: [-60, -120], R: [60, -120], headRot: -0.12 * ramp(t, c.soWas, c.soWas + 0.4) },
    after: () => { const bp = kitPt('pip', [0, -120]); chocBar(ctx, bp[0], bp[1], 0.5, t, {}); } });
  screenSpace();
  // the memory: Pip at night by the radio
  const mk = pk(t, c.everyNight - 0.1, 0.4) * (1 - ramp(t, c.soWas - 0.3, c.soWas + 0.3));
  if (mk > 0.01) {
    const x = 1360, y = 420, R = 250;
    ctx.save(); ctx.globalAlpha = clamp(mk * 1.4);
    ctx.beginPath(); ctx.arc(x, y, R * mk, 0, 7); ctx.fillStyle = '#141A3A'; ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, R * mk, 0, 7); ctx.clip();
    softDot(ctx, x + 60, y + 40, 200, '#FFB050', 0.35);
    radioSet(ctx, x + 70, y + 150, 0.8, t, { talk: 0.6 });
    pipDisc(x - 60, y - 10, 110, t, FACES.worried, '#141A3A');
    for (let i = 0; i < 10; i++) circle(ctx, x - 200 + 400 * hash(i), y - 200 + 200 * hash(i + 5), 3, 'rgba(255,255,255,0.7)');
    ctx.restore();
    ctx.beginPath(); ctx.arc(x, y, R * mk, 0, 7); ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.stroke();
    ctx.restore();
    tagPill('EVERY NIGHT', x, y + R + 50, mk, '#C8A8FF', 46);
  }
  return hutPost({ glow: 0.8 });
};
// the wordless beat and "She gives him the bigger half." Pip snaps the bar in two (a crack, crumbs), weighs the halves,
// and holds out the bigger one to him; his face
SC.half = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const snap = ramp(t, c.snap - 0.05, c.snap + 0.1), give = ramp(t, c.snap + 0.9, c.snap + 1.7, E.inOutCubic);
  const cam = driftCam(mixCam(ptCam(kitPt('pip', [0, -170]), 2.5, 1000, 520), { x: 950, y: 590, zoom: 1.5, rot: 0 }, give), lt);
  kitScene(shakeCam(cam, t, 6 * kick(t, c.snap, 8)), t, { party: false, noCake: true, lamp: 0.7, hero: { hat: null, face: lerpFace(FACES.soft, FACES.wonder, give), R: give > 0.5 ? [150, -150] : [110, -60], L: [-70, -60] },
    pip: { hat: null, whistle: false, face: give > 0.3 ? FACES.happy : snap > 0.5 ? FACES.wonder : FACES.calm, L: [-70, -120], R: [lerp(60, -150, give), lerp(-120, -150, give)] },
    after: () => {
      const pc = kitPt('pip', [0, -120]), px = pc[0], py = pc[1];
      if (snap < 0.5) chocBar(ctx, px, py, 0.5, t, {});
      else {
        const sep = 40 * snap;
        const big = [lerp(px - sep - 30, kitPt('hero', [150, -150])[0] + 60, give), lerp(py, kitPt('hero', [150, -150])[1], give) - 50 * Math.sin(Math.PI * give)];
        chocHalf(ctx, big[0], big[1], 0.62, -1, -0.1);
        chocHalf(ctx, px + sep + 34, py + 6, 0.42, 1, 0.1);
        if (snap < 1) for (let i = 0; i < 8; i++) circle(ctx, px + 10 * (hash(i) - 0.5) * 6, py + 20 + 60 * snap * hash(i + 2), 4, '#5A3218');
      }
    } });
  screenSpace();
  stampWord('SNAP!', 1500, 300, 120, '#FFD447', pk(t, c.snap) * (1 - ramp(t, c.snap + 0.7, c.snap + 0.9)), 0.1);
  return hutPost({ glow: 0.8 });
};
// the final image: the kitchen, wide, warm: the two of them with their halves; the window shows the mountain, clear, and
// the fox sitting in the snow with the empty food bag; the camera drifts back; the theme resolves
SC.final = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = mixCam({ x: 1000, y: 600, zoom: 1.7, rot: 0 }, { x: 1150, y: 560, zoom: 1.4, rot: 0 }, ramp(lt, 0, Math.min(D, 4), E.inOutSine));
  kitScene(cam, t, { party: false, noCake: true, lamp: 0.6, dusk: 0.25 * ramp(lt, 0, D),
    hero: { hat: null, face: FACES.happy, R: [150, -190], L: [-70, -60], post: (lc, r) => { chocHalf(lc, r.wrR[0] + 6, r.wrR[1] - 30, 0.8, -1, -0.5); } },
    pip: { hat: null, whistle: false, face: FACES.happy, L: [-60, -60], R: [80, -170], post: (lc, r) => { chocHalf(lc, r.wrR[0], r.wrR[1] - 30, 0.8, 1, 0.5); } },
    after: () => { kitWindowFox(t); } });
  return hutPost({ glow: 0.85 });
};
// the fox in the kitchen window: a small fox sitting in the snow outside, with the empty food bag (world coords)
function kitWindowFox(t) {
  const { winX: wx, winY: wy, winW: ww, winH: wh } = KIT;
  ctx.save(); ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip();
  // snow on the garden and the mountain behind
  ctx.beginPath(); ctx.moveTo(wx, wy + wh * 0.62); ctx.lineTo(wx + ww * 0.4, wy + wh * 0.18); ctx.lineTo(wx + ww * 0.75, wy + wh * 0.5); ctx.lineTo(wx + ww, wy + wh * 0.35); ctx.lineTo(wx + ww, wy + wh); ctx.lineTo(wx, wy + wh); ctx.closePath(); ctx.fillStyle = 'rgba(240,246,255,0.75)'; ctx.fill();
  foxHead(ctx, wx + ww * 0.62, wy + wh * 0.86, 0.42, t, { face: 'sly', noPaws: true, look: -1 });
  ctx.save(); ctx.translate(wx + ww * 0.42, wy + wh * 0.93); ctx.rotate(0.4); ctx.beginPath(); ctx.moveTo(-20, 0); ctx.quadraticCurveTo(-26, -40, 0, -44); ctx.quadraticCurveTo(26, -40, 20, 0); ctx.closePath(); ctx.fillStyle = '#3E8A4A'; ctx.fill(); ctx.restore();
  ctx.restore();
}
// "Next week: what happens if you stop brushing your teeth. Subscribe... and go eat something." The final image holds:
// the camera keeps drifting back, a small NEXT WEEK card (a tooth with a worried face) pops in at the top, the subscribe
// pill below (subscribe.js); on "go eat something" they both take a bite of their halves
SC.sub = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = mixCam({ x: 1150, y: 560, zoom: 1.4, rot: 0 }, { x: 1110, y: 545, zoom: 1.27, rot: 0 }, ramp(lt, 0, D, E.inOutSine));
  const bH = ramp(t, c.eatW, c.eatW + 0.12), bP = ramp(t, c.eatW + 0.35, c.eatW + 0.47);
  // each lifts the half to the mouth, bites, and lowers it again chewing
  const uH = ramp(t, c.eatW - 0.3, c.eatW, E.inOutSine) * (1 - ramp(t, c.eatW + 0.25, c.eatW + 0.6, E.inOutSine));
  const uP = ramp(t, c.eatW + 0.05, c.eatW + 0.35, E.inOutSine) * (1 - ramp(t, c.eatW + 0.6, c.eatW + 0.95, E.inOutSine));
  kitScene(cam, t, { party: false, noCake: true, lamp: 0.6, dusk: 0.25,
    hero: { hat: null, face: bH > 0.5 ? FACES.yum : FACES.happy, R: [lerp(150, 100, uH), lerp(-190, -232, uH)], L: [-70, -60], post: (lc, r) => { chocHalf(lc, r.wrR[0] + 6, r.wrR[1] - 30, 0.8, -1, lerp(-0.5, -1.2, uH), bH); } },
    pip: { hat: null, whistle: false, face: bP > 0.5 ? FACES.yum : FACES.happy, L: [-60, -60], R: [lerp(80, -10, uP), lerp(-170, -232, uP)], post: (lc, r) => { chocHalf(lc, r.wrR[0], r.wrR[1] - 30, 0.8, 1, lerp(0.5, 1.0, uP), bP); } },
    after: () => { kitWindowFox(t); } });
  screenSpace();
  ctx.fillStyle = `rgba(5,6,15,${0.12 * ramp(lt, 0, 0.4)})`; ctx.fillRect(0, 0, W, H);
  const k = pk(t, c.sub - 0.1, 0.4) * (1 - ramp(t, c.sub_in - 0.3, c.sub_in + 0.1, E.inCubic) * 0);
  if (k > 0.01) {
    ctx.save(); ctx.translate(800, 215); ctx.scale(0.5 * k, 0.5 * k); ctx.rotate(-0.03);
    rrect(ctx, -330, -230, 660, 400, 40); ctx.fillStyle = 'rgba(10,14,40,0.92)'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = '#FFD447'; ctx.stroke();
    ctx.font = '400 64px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFD447'; ctx.fillText('NEXT WEEK', 0, -170);
    // a tooth with a worried face and a crossed-out toothbrush
    ctx.beginPath(); ctx.moveTo(-90, -100); ctx.quadraticCurveTo(-100, -130, -60, -130); ctx.quadraticCurveTo(0, -110, 60, -130); ctx.quadraticCurveTo(100, -130, 90, -100);
    ctx.quadraticCurveTo(90, 0, 60, 110); ctx.quadraticCurveTo(40, 120, 30, 60); ctx.quadraticCurveTo(0, 30, -30, 60); ctx.quadraticCurveTo(-40, 120, -60, 110); ctx.quadraticCurveTo(-90, 0, -90, -100); ctx.closePath();
    ctx.fillStyle = '#FFFDF0'; ctx.fill();
    const plaque = ramp(lt, 0.3, D, (x) => x);
    ctx.save(); ctx.clip(); ctx.fillStyle = `rgba(220,200,90,${0.5 * plaque})`; ctx.fillRect(-100, -10, 200, 140); ctx.restore();
    const wob = 4 * Math.sin(t * 9);
    for (const s of [-1, 1]) { ellipse(ctx, s * 28, -60, 10, 13, '#2A1A1A'); line(ctx, s * 16, -86 + wob * s * 0.3, s * 40, -80, 5, '#2A1A1A'); }
    ctx.beginPath(); ctx.moveTo(-18, -18); ctx.quadraticCurveTo(0, -32, 18, -18); ctx.lineWidth = 5; ctx.strokeStyle = '#2A1A1A'; ctx.stroke();
    ctx.save(); ctx.translate(200, 10); ctx.rotate(0.6); rrect(ctx, -12, -110, 24, 200, 10); ctx.fillStyle = '#3FA7FF'; ctx.fill(); rrect(ctx, -18, -140, 36, 50, 8); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.restore();
    const xk = ramp(t, c.teeth, c.teeth + 0.3);
    if (xk > 0.01) { ctx.save(); ctx.translate(200, 10); ctx.globalAlpha = xk; ctx.lineCap = 'round'; ctx.lineWidth = 22; ctx.strokeStyle = '#FF3A4A'; ctx.beginPath(); ctx.moveTo(-80, -80); ctx.lineTo(80, 80); ctx.moveTo(80, -80); ctx.lineTo(-80, 80); ctx.stroke(); ctx.restore(); }
    ctx.restore();
  }
  // the crumbs of the two bites
  for (const [b, who, t0] of [[bH, 'hero', c.eatW], [bP, 'pip', c.eatW + 0.35]]) {
    const u = ramp(t, t0, t0 + 0.9, (x) => x);
    if (b < 0.5 || u >= 1) continue;
    const p = toScreen(cam, ...kitPt(who, who === 'hero' ? [100, -270] : [-10, -270]));
    for (let i = 0; i < 7; i++) circle(ctx, p[0] + 70 * (hash(i + 11) - 0.5) * (0.4 + u), p[1] + 160 * u * u + 30 * hash(i + 3) * u, 5 * (1 - u * 0.5), '#5A3218');
  }
  return hutPost({ glow: 0.8 });
};

// ================================================================= THE THUMBNAIL (make_cover.js; not in the timeline)
// Three candidates (cues.coverVariant), each one face on a saturated field, one object, one glow, 1-2 fat words (the
// bottom-right corner kept clear for the duration badge): 1 day six: his tired, hungry face (beanie, stubble) over the
// peeled chocolate bar glowing gold under his chin, on deep violet: 382 DAYS; 2 the same face on cold blue: DAY 6;
// 3 his face mid-bite into the lemon, puckering, on hot yellow: 382 DAYS
function coverBg(c1, c2, cx = 1300, cy = 520) {
  screenSpace();
  const g = ctx.createRadialGradient(cx, cy, 60, cx, cy, 1300);
  g.addColorStop(0, c1); g.addColorStop(1, c2);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
SC.cover = (lt, t, shot) => {
  const v = TLd.cues.coverVariant || 1;
  const hungry = { face: Object.assign({}, FACES.hungry, { lookX: 0.1, lookY: 1.0, pupil: 1.35, eyeOpen: 1.3, mouth: 'o', mouthOpen: 0.5 }), choc: { k: 1, open: 0.65 }, L: [-80, -128], R: [80, -128], beanie: 1, stubble: 0.75, bags: 0.6, hollow: 0.5, drool: 1, cold: 0, sun: 0.0 };
  if (v === 1 || v === 2) {
    coverBg(v === 1 ? '#5A2A9A' : '#2A6AD8', v === 1 ? '#12051E' : '#06142E');
    const cam = hutHeadCam(3.9, 1290, 360);
    const bp = toScreen(cam, ...hutPt([0, -140]));
    softDot(ctx, bp[0], bp[1], 520, '#FFC24A', 0.55);
    hutHero(cam, 1.2, hungry);
    softDot(gctx, bp[0], bp[1], 260, '#FFD447', 0.55);
    screenSpace();
    if (v === 1) { bigWord('382', 470, 330, 330, '#FFD447', 1, -0.05); bigWord('DAYS', 470, 610, 210, '#FFFFFF', 1, -0.05); }
    else { bigWord('DAY 6', 480, 380, 300, '#FFD447', 1, -0.05); bigWord('NO FOOD', 480, 620, 130, '#FFFFFF', 1, -0.05); }
  } else {
    coverBg('#FFE45A', '#E87A10');
    const cam = hutHeadCam(4.4, 1300, 470);
    hutHero(cam, 1.2, { face: FACES.sour, L: HUT_ARMS.rest.L, R: HUT_ARMS.lemon.R, lemon: { k: 1, bite: 0.5 }, cold: 0, sun: 0 });
    screenSpace();
    lemonSpray(1300 + 190, 470 + 140, 2.2, 0.3, 3);
    bigWord('382', 460, 330, 330, '#FFFFFF', 1, -0.05); bigWord('DAYS', 460, 610, 210, '#2A1A0A', 1, -0.05);
  }
  return { glow: 0.8, noCaptions: true, noSubscribe: true, noHud: true, grain: 0 };
};

function initScenes2() { KIT.ps = 0.64; KIT.pipX = 1250; KIT.pipY = 806; initHut(); initOutside(); initKitchen(); }
