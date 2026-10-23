// What Happens If You Stop Eating? (Day by Day) — the shots of act 2 (day 2 to day 5): the body borrows from muscle,
// the switch to fat, the packed lunch, the viewer's breath, the hunger going quiet, the Minnesota men, the wrapper read
// to the fox, Pip's question again.
'use strict';

// "Day two. The brain still needs sugar, so the body makes some... from protein." the hut colder (the tally's second
// mark, the beanie pops on); then the diagram: beads leave the muscle for the liver
SC.borrow = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  if (t < c.stillNeeds - 0.1) {
    const cam = driftCam(mixCam({ x: 1150, y: 430, zoom: 1.7, rot: 0 }, hutHeadCam(1.9, 760, 460), ramp(lt, 0, c.stillNeeds - 0.1 - shot.start, E.inOutSine)), lt);
    hutNow(cam, t, { hero: { face: FACES.tired, L: HUT_ARMS.hug.L, R: HUT_ARMS.hug.R, shiver: 0.5 } });
    return hutPost();
  }
  darkBg('#0A1A3A', '#02040C'); screenSpace();
  const k = ramp(t, c.makes - 0.3, c.makes + 0.6, E.inOutCubic);
  const V = ibMix(ibView([0, -380], [960, 470], 1.9), ibView([-170, -150], [960, 520], 1.7), k);
  const fl = ramp(t, c.makes, c.makes + 0.5);
  ibBody(V, t, { flex: 1, liver: { fill: 0.08 + 0.25 * fl, glow: 1 }, arm: { flow: fl }, muscle: { lit: 0.4 * fl, shrink: 0.4 * ramp(t, c.makes, shot.end + 4) }, straw: { flow: 0.3 + 0.7 * fl }, brain: { mood: fl > 0.5 ? 'sip' : 'worry' } });
  screenSpace();
  tagPill('STILL NEEDS SUGAR', 1380, 220, pk(t, c.stillNeeds) * (1 - ramp(t, c.makes - 0.2, c.makes)), '#FF86A6', 48);
  tagPill('PROTEIN → SUGAR', 1380, 220, pk(t, c.protein - 0.1), '#FF8A9A', 52);
  return bodyPost();
};
// "Remember your fist? It's borrowing from muscle." his fist again, close, a little thinner; a BORROWED stamp
SC.borrow2 = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = driftCam(hutHeadCam(2.2, 780, 520), lt);
  hutNow(cam, t, { hero: { face: lerpFace(FACES.worried, FACES.nervous, ramp(t, c.borrowing, c.borrowing + 0.3)), fist: 0.8, L: HUT_ARMS.hug.L, R: HUT_ARMS.fist.R, shiver: 0.3 } });
  screenSpace();
  stampWord('BORROWED', 1380, 420, 120, '#FF5A6E', pk(t, c.borrowing + 0.2), 0.12);
  return hutPost();
};
// "Day three: the big switch." a big lever on a panel, SUGAR on the left (gold, its lamp going out) and FAT on the right
// (green); on "switch" it slams across with sparks and a clunk; SWITCH!
SC.lever = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#102028', '#020608'); screenSpace();
  const fl = ramp(t, c.bigSwitch + 0.05, c.bigSwitch + 0.3, E.outBack);
  const x = 960, y = 600, kk = kick(t, c.bigSwitch + 0.3, 7);
  ctx.save(); ctx.translate(x + shake(t, 10 * kk)[0], y + shake(t, 10 * kk)[1]);
  rrect(ctx, -520, -300, 1040, 520, 40); ctx.fillStyle = '#2A3440'; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = '#4A5868'; ctx.stroke();
  for (const [sx, lab, col, on] of [[-300, 'SUGAR', '#FFD447', 1 - fl], [300, 'FAT', '#4DFFB4', fl]]) {
    rrect(ctx, sx - 170, -250, 340, 120, 24); ctx.fillStyle = '#121820'; ctx.fill();
    ctx.font = '400 92px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = mixHex('#3A4450', col, clamp(on)); ctx.fillText(lab, sx, -188);
    circle(ctx, sx, -40, 46, '#121820'); circle(ctx, sx, -40, 36, mixHex('#3A4450', col, clamp(on)));
    if (on > 0.05) softDot(gctx, sx, -40, 120, col, 0.6 * on);
  }
  // the lever: a pivot at the bottom middle, the arm swings from left to right
  const ang = lerp(-0.75, 0.75, clamp(fl));
  ctx.save(); ctx.translate(0, 150); ctx.rotate(ang);
  rrect(ctx, -22, -330, 44, 330, 20); ctx.fillStyle = '#C8CCD8'; ctx.fill();
  circle(ctx, 0, -340, 56, '#E8343E'); circle(ctx, -14, -356, 16, 'rgba(255,255,255,0.5)');
  ctx.restore();
  circle(ctx, 0, 150, 60, '#1A2028'); circle(ctx, 0, 150, 30, '#4A5868');
  ctx.restore();
  sparks(31, x + 120, y - 160, c.bigSwitch + 0.3, t, 18);
  stampWord('SWITCH!', 960, 200, 140, '#4DFFB4', pk(t, c.bigSwitch + 0.3), -0.06);
  return bodyPost({ flash: 0.2 * kick(t, c.bigSwitch + 0.3, 9), push: { k: 1 + 0.05 * lt / D, cx: 960, cy: 560 } });
};
// "The liver starts turning fat into a new fuel... and the brain starts running on it." the diagram: the fat bubbles
// stream to the liver, the liver's little still drips green, the straw carries both fuels, the brain lights up half
// green and smiles: NEW FUEL
SC.switch = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#061A22', '#010608'); screenSpace();
  const k1 = ramp(t, c.fatW - 0.3, c.fatW + 0.5, E.inOutCubic), k2 = ramp(t, c.running - 0.5, c.running + 0.3, E.inOutCubic);
  const V = ibMix(ibMix(ibView([0, -60], [960, 540], 1.05), ibView([-50, 60], [960, 480], 1.7), k1), ibView([0, -330], [960, 470], 1.6), k2);
  const gr = ramp(t, c.running - 0.2, c.running + 0.4);
  ibBody(V, t, { flex: 0, fat: { glow: 0.5 * k1, flow: k1, shrink: 0.2 * k1 }, liver: { fill: 0.06, cook: k1, glow: 1 }, straw: { flow: 1, green: 0.55 * gr }, brain: { mood: gr > 0.5 ? 'happy' : 'calm', green: 0.6 * gr, lit: 1 } });
  screenSpace();
  tagPill('FAT → NEW FUEL', 1420, 240, pk(t, c.newFuel - 0.1) * (1 - ramp(t, c.running - 0.4, c.running - 0.1)), '#4DFFB4', 52);
  tagPill('KETONES', 1420, 330, pk(t, c.newFuel + 0.3) * (1 - ramp(t, c.running - 0.4, c.running - 0.1)), '#7FE9FF', 40);
  return bodyPost({ flash: 0.25 * kick(t, c.running + 0.1, 7) });
};
// "Turns out, your body packed a lunch: weeks of it, as fat." the hut: him, his hands on his belly; a round window opens
// on it and inside, the fat as a stack of lunchboxes, glowing; WEEKS OF FUEL
SC.lunch = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = driftCam(mixCam(hutHeadCam(1.9, 760, 380), hutHeadCam(2.1, 760, 360), ramp(lt, 0, D, E.inOutSine)), lt);
  hutNow(cam, t, { hero: { face: lerpFace(FACES.calm, FACES.wonder, ramp(t, c.packed, c.packed + 0.4)), L: [-40, -60], R: [40, -60] } });
  const bp = toScreen(cam, ...hutPt([0, -90]));
  const wk = pk(t, c.packed - 0.1, 0.35);
  if (wk > 0.01) {
    const x = 1300, y = 480, R = 260 * wk;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.setLineDash([12, 12]); line(ctx, bp[0] + 60, bp[1], x - R * 0.85, y + R * 0.3, 4, 'rgba(255,255,255,0.7)'); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.fillStyle = '#2A1A10'; ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.clip();
    const n = Math.min(14, Math.floor(ramp(t, c.packed, c.weeks + 0.4, (q) => q) * 14 + 0.999));
    for (let i = 0; i < n; i++) {
      const row = Math.floor(i / 4), col = i % 4, bx = x - 210 + col * 110 + (row % 2) * 40, by = y + 150 - row * 80;
      const pop = E.outBack(clamp((t - (c.packed + i * 0.08)) / 0.2), 2);
      ctx.save(); ctx.translate(bx, by); ctx.scale(pop, pop);
      rrect(ctx, -46, -30, 92, 60, 10); ctx.fillStyle = ['#3FA7FF', '#FFD447', '#FF86A6', '#4DFFB4'][i % 4]; ctx.fill();
      rrect(ctx, -46, -30, 92, 16, 8); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fill();
      line(ctx, -16, -38, 16, -38, 6, '#2A2A3A');
      ctx.restore();
    }
    ctx.restore();
    ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.lineWidth = 8; ctx.strokeStyle = '#FFFFFF'; ctx.stroke();
    softDot(gctx, x, y, R * 1.1, '#FFD447', 0.25 * wk);
    ctx.restore();
  }
  screenSpace();
  tagPill('WEEKS OF FUEL', 1300, 820, pk(t, c.weeks), '#FFD447', 58);
  return hutPost();
};
// "That chocolate bar? About a tenth of one day." the ruler of one day's fuel: the bar's share is a tenth of it
SC.ruler = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#1A1030', '#05030C'); screenSpace();
  const k = E.outBack(clamp(pk(t, c.chocBarW - 0.25, 0.35)), 1.6), tk = ramp(t, c.tenth - 0.15, c.tenth + 0.35, E.inOutCubic);
  const x0 = 330, x1 = 1530, y = 470, h = 230;
  // one day of fuel as a battery: ten faint cells; the bar flies in and fills one of them
  ctx.save(); ctx.translate(930, y); ctx.scale(k, k); ctx.translate(-930, -y);
  rrect(ctx, x0, y - h / 2, x1 - x0, h, 40); ctx.fillStyle = 'rgba(58,48,88,0.55)'; ctx.fill(); ctx.lineWidth = 14; ctx.strokeStyle = '#E8E4FF'; ctx.stroke();
  rrect(ctx, x1 + 8, y - 55, 50, 110, 14); ctx.fillStyle = '#E8E4FF'; ctx.fill();
  for (let i = 1; i < 10; i++) line(ctx, x0 + i * (x1 - x0) / 10, y - h / 2 + 22, x0 + i * (x1 - x0) / 10, y + h / 2 - 22, 4, 'rgba(232,228,255,0.18)');
  ctx.font = '400 84px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFFFFF'; ctx.fillText('ONE DAY OF FUEL', 930, y - h / 2 - 80);
  if (tk > 0.01) {
    rrect(ctx, x0 + 14, y - h / 2 + 14, ((x1 - x0) / 10 - 14) * tk, h - 28, 28); ctx.fillStyle = '#FFC24A'; ctx.fill();
    softDot(gctx, x0 + 70, y, 220, '#FFD447', 0.5 * tk * (0.6 + 0.4 * kick(t, c.tenth + 0.2, 5)));
  }
  ctx.restore();
  // the bar: up from the bottom, then a hop into the first cell
  const fly = ramp(t, c.tenth - 0.45, c.tenth, E.inOutCubic);
  const bx = lerp(930, x0 + 64, fly), by = lerp(y + 330, y, fly) - 160 * Math.sin(Math.PI * fly) + 300 * (1 - pk(t, shot.start, 0.45));
  if (tk < 0.95) chocBar(ctx, bx, by, lerp(0.75, 0.32, fly), t, { rot: lerp(-0.1, 0, fly), glow: 0.4 });
  sparks(5, x0 + 70, y, c.tenth, t, 22, { cols: ['#FFD447', '#FFFFFF', '#FFC24A'] });
  stampWord('1/10', x0 + 110, y + 230, 120, '#FFD447', pk(t, c.tenth + 0.25), -0.08);
  tagPill('THE REST: EMPTY', 1080, y + 230, pk(t, c.tenth + 0.7) * 0.95, '#C8B8FF', 46);
  return bodyPost({ push: { k: 1 + 0.05 * lt / D, cx: 600, cy: 520 } });
};
// "Breathe on your hand. Smell it. Nail polish remover? No? By day three... his breath is." him, close, breathing into
// his cupped hand, sniffing; a bottle of nail polish remover pops; then the window: the fox gets a whiff, its eyes go
// wide and it drops off the sill (the wordless beat)
SC.breath = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const sn = ramp(t, c.smell - 0.2, c.smell + 0.2);
  if (t < c.hisBreath - 0.1) {
    const cam = driftCam(hutHeadCam(2.4, 780, 500), lt);
    hutNow(cam, t, { hero: { face: lerpFace(FACES.calm, FACES.sniff, sn), sniff: ramp(t, c.breatheHand - 0.1, c.breatheHand + 0.3), L: HUT_ARMS.rest.L, R: HUT_ARMS.sniff.R } });
    screenSpace();
    testBadge(['TRY IT', 'BREATHE ON', 'YOUR HAND'], ramp(t, c.breatheHand - 0.1, c.breatheHand + 0.3) * (1 - ramp(t, c.polish - 0.2, c.polish)));
    const pkk = pk(t, c.polish - 0.05, 0.3) * (1 - ramp(t, c.noQ + 0.3, c.noQ + 0.5));
    if (pkk > 0.01) {   // a bottle of nail polish remover with a big ?
      ctx.save(); ctx.translate(1400, 420); ctx.rotate(0.1); ctx.scale(pkk, pkk);
      rrect(ctx, -70, -110, 140, 200, 24); ctx.fillStyle = 'rgba(255,170,210,0.85)'; ctx.fill(); rrect(ctx, -30, -160, 60, 56, 10); ctx.fillStyle = '#FFFFFF'; ctx.fill();
      rrect(ctx, -56, -40, 112, 70, 8); ctx.fillStyle = '#FFFFFF'; ctx.fill();
      ctx.font = '900 22px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#C8346A'; ctx.fillText('NAIL POLISH', 0, -16); ctx.fillText('REMOVER', 0, 12);
      ctx.restore();
      stampWord('?', 1560, 300, 160, '#FFD447', pkk, 0.2);
    }
    return hutPost();
  }
  // the fox gets a whiff
  const cam = driftCam(ptCam([HUT.winX + HUT.winW * 0.55, HUT.winY + HUT.winH * 0.62], 2.1, 1060, 560), lt);
  const wh = ramp(t, c.hisBreath + 0.1, c.hisBreath + 0.35), drop = ramp(t, c.hisBreath + 0.65, c.hisBreath + 1.05, E.inCubic);
  hutNow(cam, t, { fox: { face: drop > 0.3 ? 'faint' : wh > 0.3 ? 'shock' : 'sly', dy: 260 * drop, tilt: 0.6 * drop, ears: 1 }, hero: { face: FACES.sniff, sniff: 1, L: HUT_ARMS.rest.L, R: HUT_ARMS.sniff.R } });
  // a green whiff drifting to the window
  const hp = toScreen(cam, ...hutHead({}));
  for (let i = 0; i < 4; i++) { const u = clamp((t - c.hisBreath + i * 0.1) * 0.9); softDot(ctx, lerp(hp[0] + 60, 1100, u), lerp(hp[1] + 40, 560, u) + 20 * Math.sin(i + t * 4), 40 + 30 * u, '#9AE870', 0.25 * (1 - u * 0.6)); }
  return hutPost();
};
// "And the weirdest part? For a lot of people, the hunger... gets quieter." the stomach's alarm clock again: a volume
// knob turns down, its ringing fades; him, calmer, surprised
SC.quiet = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#061A22', '#010608'); screenSpace();
  const q = ramp(t, c.quieter - 0.4, c.quieter + 0.6, E.inOutCubic);
  ibAlarm(t, 760, 470, 2.3, { ring: 0.9 * (1 - q), hour: 12, sleep: q });
  // a volume knob
  const kx = 1320, ky = 480;
  circle(ctx, kx, ky, 150, '#20263A'); circle(ctx, kx, ky, 120, '#3A4460');
  const a = lerp(0.8, -2.2, q); line(ctx, kx, ky, kx + Math.sin(a) * 100, ky - Math.cos(a) * 100, 14, '#FFD447');
  for (let i = 0; i <= 8; i++) { const b = -2.4 + 4.8 * i / 8; line(ctx, kx + Math.sin(b) * 160, ky - Math.cos(b) * 160, kx + Math.sin(b) * 180, ky - Math.cos(b) * 180, 6, i / 8 < (1 - q) * 0.66 + 0.34 * 0 ? '#FFD447' : '#3A4460'); }
  ctx.font = '900 40px Montserrat'; ctx.textAlign = 'center'; ctx.fillStyle = '#FFFFFF'; ctx.fillText('HUNGER', kx, ky + 230);
  return bodyPost({ push: { k: 1 + 0.05 * lt / D, cx: 960, cy: 480 } });
};
// "...the hunger... gets quieter." the hut: his face, close; his hand on his belly; his eyes half close, a small,
// surprised calm; a tiny alarm clock beside him dozes off (z z z)
SC.quiet2 = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = driftCam(hutHeadCam(2.5 + 0.2 * ramp(lt, 0, D), 820, 470), lt);
  hutNow(cam, t, { hero: { face: lerpFace(FACES.tired, FACES.soft, ramp(t, c.quieter - 0.1, c.quieter + 0.5)), L: [-30, -70], R: [40, -70] } });
  screenSpace();
  ibAlarm(t, 1430, 420, 1.2 * pk(t, shot.start, 0.3), { ring: 0.3 * (1 - ramp(t, shot.start, c.quieter + 0.3)), hour: 12, sleep: ramp(t, c.quieter, c.quieter + 0.5) });
  tagPill('QUIETER', 1430, 660, pk(t, c.quieter + 0.1), '#7FE9FF', 56);
  return hutPost();
};
// "In 1944, thirty-six volunteers in Minnesota ate half their usual food for six months, so doctors could learn to feed a
// starving Europe." old film: the dining hall, the camera tracking along the table; the calendar's months flip; their
// plates are small; a scale needle sinks; TO FEED EUROPE
SC.minnesota = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  if (t >= c.halfFood - 0.07 && t < c.sixMonths - 0.07) {   // close: a plate, and a hand sliding half of it away
    applyCam(driftCam({ x: 960, y: 560, zoom: 2.6, rot: 0 }, lt));
    mnRoom(t, { month: 'NOVEMBER', crossed: 4 });
    ctx.fillStyle = '#E8DCC0'; ctx.fillRect(500, 560, 920, 400);
    const sl = ramp(t, c.halfFood + 0.1, c.halfFood + 0.7, E.inOutCubic);
    ellipse(ctx, 960, 640, 230, 52, '#A8A090'); ellipse(ctx, 960, 632, 220, 48, '#F8F4EA');
    ellipse(ctx, 900, 616, 60, 34, '#D8B870'); ellipse(ctx, 990, 622, 46, 18, '#7A8A4A');
    ctx.save(); ctx.translate(-260 * sl, 0); ellipse(ctx, 1040, 614, 56, 32, '#D8B870'); ellipse(ctx, 1080, 626, 40, 14, '#7A8A4A'); ctx.restore();
    line(ctx, 1500 - 300 * sl, 600, 1180 - 260 * sl, 620, 40, '#8A9A7A'); circle(ctx, 1170 - 260 * sl, 622, 26, '#F2B892');
    hsSepia(0.8); hsFilm(t);
    screenSpace();
    tagPill('HALF THE FOOD', 960, 230, pk(t, c.halfFood + 0.1), '#FFE6B0', 58);
    return hutPost({ glow: 0.5 });
  }
  if (t >= c.sixMonths - 0.07) {   // close on the calendar, its months flipping
    applyCam(driftCam({ x: 960, y: 300, zoom: 2.4, rot: 0 }, lt));
    const months = ['NOVEMBER', 'DECEMBER', 'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY'];
    const mi = Math.min(6, Math.floor(7 * ramp(t, c.sixMonths, shot.end - 0.2, (x) => x)));
    mnRoom(t, { month: months[mi], crossed: (mi * 3) % 20 });
    hsSepia(0.8); hsFilm(t);
    screenSpace();
    tagPill('6 MONTHS', 960, 820, pk(t, c.sixMonths + 0.1), '#FFE6B0', 64);
    return hutPost({ glow: 0.5, flash: 0.12 * kick(t, c.sixMonths, 9) });
  }
  const cam = mixCam({ x: 760, y: 500, zoom: 1.35, rot: 0 }, { x: 1180, y: 520, zoom: 1.2, rot: 0 }, ramp(lt, 0, D, E.inOutSine));
  applyCam(cam);
  const months = ['NOVEMBER', 'DECEMBER', 'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY'];
  const mi = Math.min(6, Math.floor(6 * ramp(t, c.sixMonths - 0.3, c.sixMonths + 1.6)));
  mnRoom(t, { month: months[mi], crossed: 4 + mi * 2 });
  for (let i = 0; i < 4; i++) hsPerson(t, HS_PALS[i % 3], { x: 300 + i * 420, y: MN.tableY + 60, s: 0.7, noLegs: true, seed: 3 + i, pose: hsSeat([-60, -30], [60, -30]), face: lerpFace(FACES.calm, FACES.tired, ramp(t, c.sixMonths, shot.end)) });
  mnTable(); for (let i = 0; i < 4; i++) mnPlate(300 + i * 420, MN.tableY + 18, 1);
  hsSepia(0.8); hsFilm(t);
  screenSpace();
  stampWord('1944', 330, 330, 150, '#FFE6B0', pk(t, c.y1944), -0.08);
  tagPill('36 VOLUNTEERS', 1350, 250, pk(t, c.thirtysix) * (1 - ramp(t, c.halfFood - 0.2, c.halfFood)), '#FFE6B0', 52);
  tagPill('HALF THE FOOD', 960, 150, pk(t, c.halfFood) * (1 - ramp(t, c.sixMonths - 0.2, c.sixMonths)), '#FFE6B0', 52);
  tagPill('6 MONTHS', 960, 150, pk(t, c.sixMonths), '#FFE6B0', 58);
  return hutPost({ glow: 0.5 });
};
// "...so doctors could learn to feed a starving Europe." closer: the scale under one of them, its needle sinking a
// quarter of the way down; TO FEED EUROPE stamps across
SC.minnesota2 = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  applyCam(driftCam({ x: 1240, y: 540, zoom: 1.8 + 0.1 * ramp(lt, 0, D), rot: 0 }, lt));
  mnRoom(t, { month: 'MAY', crossed: 20 });
  hsPerson(t, HS_PALS[1], { x: 1120, y: 860, s: 0.72, pose: POSES.stand, face: FACES.tired, seed: 4 });
  hsScale(1380, 880, 0.8, lerp(70, 52, ramp(lt, 0, D, E.inOutSine)), t, { lo: 0, hi: 100 });
  hsSepia(0.8); hsFilm(t);
  screenSpace();
  tagPill('−25%', 1450, 330, pk(t, shot.start + 0.6), '#FF9A3C', 64);
  stampWord('TO FEED EUROPE', 640, 420, 100, '#FF9A3C', pk(t, c.europe), 0.06);
  return hutPost({ glow: 0.5 });
};
// "Their minds changed most. They read cookbooks like novels, dreamed about food... and chewed gum by the pack." close
// on the volunteers: one reads a cookbook like a thriller, one dreams of a pie, gum packs pile up in front of the third
SC.obsessed = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const k1 = ramp(t, c.dreamed - 0.3, c.dreamed + 0.4, E.inOutCubic), k2 = ramp(t, c.gum - 0.3, c.gum + 0.4, E.inOutCubic);
  const cam = mixCam(mixCam({ x: 720, y: 520, zoom: 2.0, rot: 0 }, { x: 1140, y: 470, zoom: 1.9, rot: 0 }, k1), { x: 1560, y: 560, zoom: 2.0, rot: 0 }, k2);
  applyCam(driftCam(cam, lt));
  mnRoom(t, { month: 'MAY', crossed: 20 });
  const P = [[720, 0], [1140, 1], [1560, 2]];
  for (const [x, i] of P) hsPerson(t, HS_PALS[i], { x, y: MN.tableY + 60, s: 0.7, noLegs: true, seed: 3 + i, face: i === 0 ? FACES.wonder : i === 1 ? FACES.longing : FACES.calm,
    pose: i === 0 ? hsSeat([-40, -170], [40, -170]) : hsSeat([-60, -30], [60, -30]), headRot: i === 1 ? -0.1 : 0,
    post: i === 0 ? (cc) => mnBook(cc, 0, -170, 1.0 + 0.04 * Math.sin(t * 3)) : i === 2 ? (cc) => { const ch = 0.5 + 0.5 * Math.sin(t * 14); ellipse(cc, 14, -240 + 2 * ch, 10, 5 + 3 * ch, '#E86A8A'); } : null });
  mnTable(); for (const [x] of P) mnPlate(x, MN.tableY + 18, 0.4);
  mnDream(1240, 230, pk(t, c.dreamed + 0.1), 'pie', t);
  mnDream(1000, 160, pk(t, c.dreamed + 0.5), 'steak', t);
  mnGum(1600, MN.tableY - 4, Math.min(12, Math.max(1, Math.floor((t - c.gum + 0.3) * 10))), (((t - c.gum) * 10) % 1));
  hsSepia(0.8); hsFilm(t);
  screenSpace();
  tagPill('COOKBOOKS', 420, 200, pk(t, c.cookbooks) * (1 - k1), '#FFE6B0', 50);
  return hutPost({ glow: 0.5 });
};
// "Day five. He's read the chocolate wrapper eleven times. Now he reads it... to the fox." the hut, colder (the blanket),
// he holds the bar up and reads its back; 11× ; then the window: the fox, chin on its paws, listening
SC.day5 = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const fx = ramp(t, c.toFox - 0.5, c.toFox + 0.2, E.inOutCubic);
  const cam = driftCam(mixCam(hutHeadCam(1.8, 820, 500), { x: 1130, y: 470, zoom: 1.5, rot: 0 }, fx), lt);
  hutNow(cam, t, { choc: null, fox: { face: fx > 0.5 ? 'curious' : 'sly', ears: 0.7 + 0.3 * fx, look: -1, tilt: 0.15 * fx },
    hero: { face: lerpFace(FACES.count, FACES.calm, fx), choc: { k: 1, rot: -0.05 }, L: [-50, -150], R: [50, -150], headDY: 6, headRot: 0.12 * fx } });
  screenSpace();
  stampWord('11×', 1450, 260, 150, '#FFD447', pk(t, c.eleven) * (1 - fx), 0.08);
  if (fx > 0.5) { const hp = toScreen(cam, ...hutHead({})); speech('"MILK... SUGAR..."', hp[0] + 250, hp[1] - 170, pk(t, c.toFox - 0.2), '#6A2A9A', 52, -0.05); }
  return hutPost();
};
// "Pip, on the radio: 'Is my chocolate okay?'" the radio, close; Pip pops up again; he holds the bar up to the radio
// with a thumbs-up face
SC.pip2 = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = driftCam(ptCam([HUT.radioX - 160, HUT.tableY - 200], 1.7, 960, 560), lt);
  hutNow(cam, t, { radio: { talk: ramp(t, c.pip2, c.pip2 + 0.2) }, choc: null,
    hero: { face: lerpFace(FACES.tired, FACES.proud, ramp(t, c.chocOK2 + 0.6, c.chocOK2 + 1.0)), choc: { k: 1 }, L: [-30, -200], R: [70, -200], headRot: 0.1 } });
  const rp = toScreen(cam, HUT.radioX - 34, HUT.tableY - 30);
  radioWaves(rp[0], rp[1], cam.zoom * 0.9, t, ramp(t, c.pip2, c.pip2 + 0.2));
  screenSpace();
  pipCall(1560, 280, pk(t, c.chocOK2 - 0.3), t, 'IS MY CHOCOLATE OK?', { face: FACES.worried, left: true });
  return hutPost();
};
