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
  ibBody(V, t, { flex: 1, liver: { fill: 0.04 + 0.3 * fl, glow: 1 }, arm: { flow: fl }, muscle: { lit: 0.4 * fl, shrink: 0.4 * ramp(t, c.makes, shot.end + 4) }, straw: { flow: 0.3 + 0.7 * fl }, brain: { mood: fl > 0.5 ? 'sip' : 'worry' } });
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
// "Day three: the big switch. The liver starts turning fat into a new fuel... and the brain starts running on it." the
// diagram: the fat bubbles stream to the liver, the liver's little still drips green, the straw turns green, the brain
// lights up green and grins: NEW FUEL
SC.switch = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#061A22', '#010608'); screenSpace();
  const k1 = ramp(t, c.fatW - 0.3, c.fatW + 0.5, E.inOutCubic), k2 = ramp(t, c.running - 0.5, c.running + 0.3, E.inOutCubic);
  const V = ibMix(ibMix(ibView([0, -60], [960, 540], 1.05), ibView([-50, 60], [960, 480], 1.7), k1), ibView([0, -330], [960, 470], 1.6), k2);
  const gr = ramp(t, c.running - 0.2, c.running + 0.4);
  ibBody(V, t, { flex: 0, fat: { glow: 0.5 * k1, flow: k1, shrink: 0.2 * k1 }, liver: { fill: 0.02, cook: k1, glow: 1 }, straw: { flow: 1, green: gr }, brain: { mood: gr > 0.5 ? 'happy' : 'calm', green: gr, lit: 1 } });
  screenSpace();
  stampWord('SWITCH!', 960, 190, 130, '#4DFFB4', pk(t, c.bigSwitch) * (1 - ramp(t, c.fatW - 0.2, c.fatW)), -0.06);
  tagPill('FAT → NEW FUEL', 1420, 240, pk(t, c.newFuel - 0.1) * (1 - ramp(t, c.running - 0.4, c.running - 0.1)), '#4DFFB4', 52);
  tagPill('KETONES', 1420, 330, pk(t, c.newFuel + 0.3) * (1 - ramp(t, c.running - 0.4, c.running - 0.1)), '#7FE9FF', 40);
  return bodyPost({ flash: 0.25 * kick(t, c.running + 0.1, 7) });
};
// "Turns out, your body packed a lunch: weeks of it, as fat. That chocolate bar? About a tenth of one day." the fat
// bubbles each show a little lunchbox: WEEKS OF FUEL; then a ruler of days where the bar is a sliver
SC.lunch = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  if (t < c.chocBarW - 0.15) {
    darkBg('#061A22', '#010608'); screenSpace();
    const V = ibView([0, 120], [960, 470], 1.9 + 0.15 * ramp(lt, 0, 3));
    ibBody(V, t, { flex: 0, fat: { glow: 1, lunch: ramp(t, c.packed, c.packed + 1.0) }, liver: { fill: 0.02, cook: 0.6 }, straw: { flow: 1, green: 1 }, brain: { mood: 'happy', green: 1 } });
    screenSpace();
    tagPill('WEEKS OF FUEL', 960, 160, pk(t, c.weeks), '#FFD447', 64);
    return bodyPost();
  }
  // the ruler of days: one day's fuel as a long bar; the chocolate bar's share is a tenth of it
  darkBg('#1A1030', '#05030C'); screenSpace();
  const k = ramp(t, c.chocBarW - 0.1, c.chocBarW + 0.5, E.inOutCubic), tk = ramp(t, c.tenth - 0.2, c.tenth + 0.5, E.inOutCubic);
  const x0 = 360, x1 = 1560, y = 560;
  rrect(ctx, x0, y - 40, (x1 - x0) * k, 80, 20); ctx.fillStyle = '#3A3058'; ctx.fill();
  ctx.font = '900 46px Montserrat'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = `rgba(255,255,255,${k})`; ctx.fillText('ONE DAY OF FUEL', x0, y - 90);
  rrect(ctx, x0, y - 40, (x1 - x0) * 0.1 * tk, 80, 20); ctx.fillStyle = '#6A2A9A'; ctx.fill();
  chocBar(ctx, x0 + 60, y + 160, 0.6 + 0.1 * kick(t, c.tenth, 5), t, { rot: -0.1, glow: tk });
  if (tk > 0.01) { ctx.setLineDash([10, 10]); line(ctx, x0 + 60, y + 110, x0 + 60, y + 45, 4, `rgba(255,212,71,${tk})`); ctx.setLineDash([]); }
  tagPill('1/10', x0 + 260, y + 170, pk(t, c.tenth + 0.2), '#FFD447', 70);
  return bodyPost({ push: { k: 1 + 0.04 * lt / D, cx: 960, cy: 540 } });
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
  const wh = ramp(t, c.hisBreath + 0.1, c.hisBreath + 0.4), drop = ramp(t, c.hisBreath + 0.9, c.hisBreath + 1.4, E.inCubic);
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
  tagPill('QUIETER', 960, 860, pk(t, c.quieter + 0.1), '#7FE9FF', 60);
  return bodyPost({ push: { k: 1 + 0.05 * lt / D, cx: 960, cy: 480 } });
};
// "In 1944, thirty-six volunteers in Minnesota ate half their usual food for six months, so doctors could learn to feed a
// starving Europe." old film: the dining hall, the camera tracking along the table; the calendar's months flip; their
// plates are small; a scale needle sinks; TO FEED EUROPE
SC.minnesota = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = mixCam({ x: 760, y: 500, zoom: 1.35, rot: 0 }, { x: 1180, y: 520, zoom: 1.2, rot: 0 }, ramp(lt, 0, D, E.inOutSine));
  applyCam(cam);
  const months = ['NOVEMBER', 'DECEMBER', 'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY'];
  const mi = Math.min(6, Math.floor(6 * ramp(t, c.sixMonths - 0.3, c.sixMonths + 1.6)));
  mnRoom(t, { month: months[mi], crossed: 4 + mi * 2 });
  for (let i = 0; i < 4; i++) hsPerson(t, HS_PALS[i % 3], { x: 300 + i * 420, y: MN.tableY + 60, s: 0.7, noLegs: true, seed: 3 + i, pose: hsSeat([-60, -30], [60, -30]), face: lerpFace(FACES.calm, FACES.tired, ramp(t, c.sixMonths, shot.end)) });
  mnTable(); for (let i = 0; i < 4; i++) mnPlate(300 + i * 420, MN.tableY + 18, 1);
  hsSepia(0.8); hsFilm(t);
  screenSpace();
  stampWord('1944', 300, 200, 150, '#FFE6B0', pk(t, c.y1944), -0.08);
  tagPill('36 VOLUNTEERS', 960, 150, pk(t, c.thirtysix) * (1 - ramp(t, c.halfFood - 0.2, c.halfFood)), '#FFE6B0', 52);
  tagPill('HALF THE FOOD', 960, 150, pk(t, c.halfFood) * (1 - ramp(t, c.sixMonths - 0.2, c.sixMonths)), '#FFE6B0', 52);
  tagPill('6 MONTHS', 960, 150, pk(t, c.sixMonths), '#FFE6B0', 58);
  stampWord('TO FEED EUROPE', 1300, 330, 90, '#FF9A3C', pk(t, c.europe) * (1 - ramp(t, shot.end - 0.2, shot.end)), 0.06);
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
  pipCall(1400, 280, pk(t, c.chocOK2 - 0.3), t, 'IS MY CHOCOLATE OK?', { face: FACES.worried });
  return hutPost();
};
