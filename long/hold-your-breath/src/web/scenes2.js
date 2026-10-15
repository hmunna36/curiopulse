// What If You Hold Your Breath TOO Long? (long-form): act 2 shots (the slow way, the cold cloth, the dive switch, the
// seal, the spleen, the kicks, 1960s London, his best, the cake).
'use strict';

// a flat hand seen from the front, palm on something (screen or chest units): its wrist at (x, y), fingers up-right
function flatHand(c, x, y, s, rot, col = '#F2B892') {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  rrect(c, -60, -10, 120, 120, 40); c.fillStyle = '#5B7FD6'; c.fill();                  // the hoodie's cuff
  ellipse(c, 0, -60, 70, 62, col);
  for (let i = 0; i < 4; i++) { rrect(c, -58 + i * 30, -190 + Math.abs(i - 1.5) * 14, 26, 110, 13); c.fillStyle = col; c.fill(); }
  rrect(c, 52, -110, 26, 80, 13); c.save(); c.translate(65, -70); c.rotate(0.6); c.translate(-65, 70); c.fillStyle = col; c.fill(); c.restore();
  c.restore();
}
// a knife switch on a panel (screen units): k 0 = OFF (down), 1 = ON (up); label over it
function knifeSwitch(x, y, s, k, label, t) {
  const c = ctx;
  c.save(); c.translate(x, y); c.scale(s, s);
  rrect(c, -170, -230, 340, 460, 26); c.fillStyle = '#2A2238'; c.fill(); c.lineWidth = 8; c.strokeStyle = '#5A4A70'; c.stroke();
  for (const [sx, sy] of [[-140, -200], [140, -200], [-140, 200], [140, 200]]) circle(c, sx, sy, 10, '#8A7AA0');
  c.font = '400 54px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = k > 0.5 ? '#4DFFB4' : '#8A7AA0';
  c.fillText(label, 0, -160);
  // contacts
  rrect(c, -70, 60, 40, 80, 8); c.fillStyle = '#C8A040'; c.fill(); rrect(c, 30, 60, 40, 80, 8); c.fill();
  rrect(c, -70, -80, 40, 50, 8); c.fillStyle = '#C8A040'; c.fill(); rrect(c, 30, -80, 40, 50, 8); c.fill();
  // the blade: hinged at the bottom contacts, swings up
  const a = lerp(0.9, -0.05, E.outBack(clamp(k), 2.2));
  c.save(); c.translate(0, 100); c.rotate(a);
  rrect(c, -62, -190, 22, 190, 6); c.fillStyle = '#D8DCE8'; c.fill(); rrect(c, 40, -190, 22, 190, 6); c.fill();
  rrect(c, -80, -230, 160, 46, 18); c.fillStyle = '#E2424B'; c.fill();
  c.restore();
  c.restore();
  if (k > 0.9) { softDot(gctx, x, y - 160 * s, 140 * s, '#4DFFB4', 0.5); }
}

// ================================================================= the slow way: a hand on the belly; the diaphragm
SC.belly = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  if (t < c.bellyIn - 0.1) {     // the kitchen: goggles off, a calm breath; Pip nods
    const cam = camOnHead('hero', 2.6, -40, 10);
    kitchenAt(cam, t, { hero: { goggles: 1 - ramp(t, c.belly + 0.2, c.belly + 0.9), face: lerpFace(FACES.proud, FACES.calmK, ramp(t, c.belly + 0.6, c.belly + 1.2)) } });
    return dayPost();
  }
  // the x-ray: a hand on the belly; breathing in pulls the dome down and pushes the belly out
  darkBg('#0A1A3A', '#02040C'); screenSpace();
  const inh = ramp(t, c.breathein - 0.1, c.pushout + 0.3, E.inOutSine) * (1 - ramp(t, c.remember - 0.6, c.remember + 0.6, E.inOutSine) * 0.5);
  const v = { x: 960, y: 520, s: 0.92 + 0.06 * ramp(t, c.diaph - 0.3, c.remember, E.inOutCubic) };
  chestX(v, t, { o2: 0.8, ex: 0.1, fill: 1 + 0.12 * inh, drop: inh, puff: 0, mood: t >= c.remember - 0.1 ? 'happy' : 'calm', diaGlow: ramp(t, c.diaph - 0.2, c.diaph + 0.3) });
  // the belly pushing out under his hand
  const [bx, by] = bxPt(v, 40, 190);
  const hk = ramp(t, c.bellyIn - 0.1, c.bellyIn + 0.35, E.outBack);
  flatHand(ctx, bx + 30 + 26 * inh, by + 120 + 300 * (1 - hk), 0.9, -0.15);
  for (const sd of [-1, 1]) {   // little arrows: the belly moving out
    const ax = bx + sd * (300 + 30 * inh), ay = by;
    if (inh > 0.05) { line(ctx, ax, ay, ax + sd * 60 * inh, ay, 8, rgba('#FFD447', inh)); ctx.beginPath(); ctx.moveTo(ax + sd * (60 * inh + 22), ay); ctx.lineTo(ax + sd * 60 * inh, ay - 16); ctx.lineTo(ax + sd * 60 * inh, ay + 16); ctx.closePath(); ctx.fillStyle = rgba('#FFD447', inh); ctx.fill(); }
  }
  pill(1400, 300, 'DIAPHRAGM', '#FF9A3C', ramp(t, c.diaph - 0.1, c.diaph + 0.25), 56);
  return bodyPost({ flash: 0.3 * (1 - ramp(t, c.bellyIn - 0.1, c.bellyIn + 0.2)) });
};

// ================================================================= his second try: sixty seconds; Pip's cold cloth
SC.sixty = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const k = ramp(t, c.clothUp - 0.4, c.clothUp + 0.4, E.inOutCubic);
  const cam = mixCam(Object.assign({}, TWO, { zoom: 1.5, x: 980 }), camOnHead('pip', 3.0, 80, 60), k);
  kitchenAt(cam, t);
  screenSpace();
  pill(960, 230, 'NEW RECORD!', '#FFD447', ramp(t, c.record, c.record + 0.3) * (1 - ramp(t, c.clothUp - 0.3, c.clothUp)), 58);
  return dayPost();
};
SC.splat = (lt, t, shot) => {
  const c = cu();
  const cam = camOnHead('hero', 3.2 * (1 + 0.05 * kickOf(t, c.splat, 7)), 0, 10);
  kitchenAt(cam, t);
  screenSpace();
  const s = ramp(t, c.splat, c.splat + 0.25, E.outBack) * (1 - ramp(t, c.splat + 0.55, c.splat + 0.75));
  bigWord('SPLAT!', 1380, 360, 220, '#7FE9FF', s, 0.1);
  if (t > c.splat) for (let i = 0; i < 18; i++) {   // drops flying off the cloth
    const a = -Math.PI / 2 + (hash(i) - 0.5) * 2.6, d = (t - c.splat) * (500 + 300 * hash(i + 3));
    circle(ctx, 960 + Math.cos(a) * d, 420 + Math.sin(a) * d + 900 * (t - c.splat) ** 2, 7, `rgba(150,220,255,${clamp(1 - (t - c.splat) * 1.5)})`);
  }
  return dayPost({ push: { k: 1 + 0.04 * kickOf(t, c.splat, 6), cx: 960, cy: 420 } });
};

// ================================================================= the dive reflex: an ancient switch; his heart slows
const BPM_DIVE = (t) => lerp(78, 70, ramp(t, TLd.cues.slows - 0.3, TLd.cues.slows + 2.0, E.inOutSine));
SC.dive = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#0E1630', '#030612'); screenSpace();
  // the camera travels from the switch (left) to the heart monitor (right)
  const k = ramp(t, c.slows - 0.6, c.slows + 0.4, E.inOutCubic);
  ctx.save(); ctx.translate(-380 * k, 0);
  knifeSwitch(620, 540, 1.05, ramp(t, c.switchw + 0.1, c.switchw + 0.45), 'DIVE MODE', t);
  if (t > c.switchw + 0.4 && t < c.switchw + 0.9) sparks(5, 620, 450, c.switchw + 0.4, t, 18);
  heartMon(1500, 520, 1.15, t, BPM_DIVE, c.dive);
  ctx.restore();
  pill(1180, 900 - 90, 'SAVING OXYGEN', '#7FE9FF', ramp(t, c.save, c.save + 0.3), 50);
  return bodyPost({ flash: 0.25 * kickOf(t, c.switchw + 0.35, 9), push: { k: 1 + 0.04 * lt / D, cx: 960, cy: 540 } });
};
// "...the same switch a seal flips on every dive." the seal going down in cold water, its heart slow and bright
SC.seal = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  screenSpace();
  seaBack(t, { depth: 0.25 + 0.25 * lt / D });
  const x = lerp(700, 1100, lt / D), y = lerp(330, 640, lt / D);
  seal(ctx, x, y, 1.25, t, { ang: 0.55, heart: beatAt(t, 24), bubbles: true, swim: 2.5 });
  knifeSwitch(1640, 280, 0.45, ramp(t, c.sealw - 0.1, c.sealw + 0.25), 'DIVE MODE', t);
  depthScale(t, Math.round(lerp(20, 80, lt / D)), 1);
  return { glow: 0.9, flash: 0.3 * (1 - ramp(lt, 0, 0.2)) };
};
// "And his spleen squeezes out spare red blood cells: oxygen carriers he didn't know he had."
SC.spleen = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#0A1A3A', '#02040C'); screenSpace();
  const sq = ramp(t, c.squeezes - 0.1, c.squeezes + 0.5) * (0.8 + 0.2 * Math.sin(t * 6));
  const v = { x: 960 - 262 * 1.6 * ramp(lt, 0, 1.2, E.inOutCubic) * 0.7, y: 260 - 150 * 1.6 * 0.7 * ramp(lt, 0, 1.2, E.inOutCubic) + 380, s: lerp(0.9, 1.6, ramp(lt, 0, 1.2, E.inOutCubic)) };
  chestX(v, t, { o2: 0.75, ex: 0.3, puff: 1, spleen: ramp(lt, 0.1, 0.6, E.outBack), squeeze: sq, cells: ramp(t, c.squeezes, c.squeezes + 0.8), bpm: 70 });
  const [sx, sy] = bxPt(v, BX.spleen[0], BX.spleen[1]);
  pill(sx + 260, sy - 170, 'SPLEEN', '#C8A8FF', ramp(lt, 0.5, 0.8), 54);
  pill(sx - 300, sy - 330, '+ SPARE RED CELLS', '#FF5A6E', ramp(t, c.carriers - 0.2, c.carriers + 0.2), 46);
  return bodyPost();
};

// ================================================================= ninety: the dome starts kicking
SC.ninety = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const kick = c.kicks.reduce((m, x) => Math.max(m, t >= x ? Math.exp(-(t - x) * 6) : 0), 0);
  if (t < c.dome2 - 0.1) {     // the kitchen: the cloth on his face, Pip's stopwatch; the camera creeps in
    const cam = camOnHead('hero', lerp(1.7, 2.9, ramp(t, c.ninety, c.dome2, E.inOutSine)), lerp(-200, -20, ramp(t, c.ninety, c.dome2)), -40);
    kitchenAt(cam, t);
    return dayPost();
  }
  darkBg('#1A0A20', '#05020A'); screenSpace();
  const v = { x: 960, y: 640 + 18 * kick, s: 1.0 + 0.05 * ramp(t, c.dome2, c.dome2 + 3) };
  chestX(v, t, { o2: 0.7, ex: 0.55, fill: 1 - 0.06 * kick, kick: 1.6 * kick, puff: 1, mood: t >= c.kicking - 0.1 ? 'angry' : 'sour', diaGlow: 0.3 + 0.7 * kick });
  const [dx, dy] = bxPt(v, 0, -10);
  if (kick > 0.3) shockLines(dx, dy, 300, 1 - kick, 12, '#FF5A6E', 7);
  if (kick > 0.5) bigWord('KICK!', dx + 430, dy - 120, 120, '#FF5A6E', kick, 0.12);
  return bodyPost({ push: { k: 1 + 0.04 * kick, cx: 960, cy: 600 }, blur: [0, 14 * kick] });
};
// "Why does it hurt so much?" his face under the cloth, jolting with each kick
SC.hurt = (lt, t, shot) => {
  const D = shot.end - shot.start;
  kitchenAt(camOnHead('hero', 3.0 + 0.3 * lt / D, 0, 0), t);
  return dayPost();
};

// ================================================================= London, the 1960s: the scientists who switched the kicking off
function labCast(cam, t, o = {}) {
  // the doctor (the anaesthetist) by the machine: a hand on it, or up to stop it
  const stop = o.stop || 0;
  const st = { x: 1250, y: 900, s: 0.8, pose: ikReach(ikReach(POSES.stand, 'R', stop > 0 ? [lerp(60, 150, stop), lerp(-150, -330, stop)] : [70, -150], 1), 'L', [-120, -260], -1),
    face: Object.assign({}, stop > 0.5 ? FACES.worried : FACES.calm, { lookX: -0.7, lookY: 0.2 }), seed: 2 };
  applyCam(cam);
  drawCharacter(ctx, st, t, LABDOC);
  ctx.save(); ctx.translate(st.x, st.y); ctx.scale(st.s, st.s); docKit2(ctx, rig(st.pose), st); ctx.restore();
}
// cameras on the lab: the window and its tower, the bed with the doctor, the drip bag, the machine, the clock
const LABCAM = { win: { x: 1570, y: 340, zoom: 2.2 }, room: { x: 960, y: 520, zoom: 1.05 }, drip: { x: 300, y: 330, zoom: 2.6 },
  pump: { x: 800, y: 330, zoom: 2.3 }, clock: { x: 1080, y: 210, zoom: 3.2 }, doc: { x: 1180, y: 560, zoom: 1.7 } };
const LC = (k) => Object.assign({ rot: 0 }, LABCAM[k]);
function labDraw(cam, t, o = {}) {
  lab60(cam, t, { clockMin: o.mins === undefined ? 2 : o.mins, clockSec: o.secs === undefined ? t * 3 : o.secs });
  applyCam(cam);
  lab60Pump(t, { rate: 14, on: o.pumpOff ? 0 : 1 });
  lab60Bed(t, {});
  applyCam(cam);
  ctx.save(); ctx.translate(300, 420);                                   // the drip bag of curare by the bed
  line(ctx, 0, -250, 0, 460, 6, '#8A8E92'); line(ctx, -30, -250, 30, -250, 6, '#8A8E92');
  rrect(ctx, -52, -244, 104, 150, 22); ctx.fillStyle = 'rgba(236,242,248,0.92)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#A8B0B8'; ctx.stroke();
  rrect(ctx, -46, -196, 92, 96, 18); ctx.fillStyle = '#E2B45C'; ctx.fill();                       // the drug
  rrect(ctx, -44, -186, 88, 46, 6); ctx.fillStyle = '#FFFFFF'; ctx.fill();                         // its label
  ctx.font = '900 21px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#5A2A1A'; ctx.fillText('CURARE', 0, -163);
  rrect(ctx, -12, -94, 24, 56, 8); ctx.fillStyle = 'rgba(220,235,245,0.85)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#A8B0B8'; ctx.stroke();
  const dp = (t * 1.3) % 1, dr = 4 + 5 * ramp(dp, 0, 0.6);                // a drop swells, then falls
  circle(ctx, 0, -84 + (dp < 0.6 ? 0 : 40 * ramp(dp, 0.6, 1, E.inCubic)), dr, 'rgba(226,180,92,0.95)');
  ctx.beginPath(); ctx.moveTo(0, -38); ctx.quadraticCurveTo(20, 120, 140, 250); ctx.lineWidth = 5; ctx.strokeStyle = '#C8D0D8'; ctx.stroke();
  ctx.restore();
  labCast(cam, t, { stop: o.stop || 0 });
  if (o.pumpOff) { applyCam(cam); rrect(ctx, 690, 120, 140, 60, 12); ctx.fillStyle = '#A0281E'; ctx.fill(); ctx.font = '400 44px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFF0D8'; ctx.fillText('OFF', 760, 152); }
  if (o.pumpOn > 0.01) {   // the doctor switches it back on
    applyCam(cam); ctx.save(); ctx.translate(760, 150); const s = E.outBack(clamp(o.pumpOn), 2.4); ctx.scale(s, s);
    rrect(ctx, -70, -30, 140, 60, 12); ctx.fillStyle = '#2E8A4E'; ctx.fill(); ctx.font = '400 44px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#F0FFF4'; ctx.fillText('ON', 0, 2);
    ctx.restore(); }
  sepia60(1); film60(t, 1);
}
SC.proof = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  // the window with the clock tower -> the room (two scientists) -> the drug -> the machine that breathed for them
  let cam;
  if (t < c.london - 0.1) cam = mixCam(LC('win'), LC('room'), ramp(t, c.proof + 0.2, c.london - 0.1, E.inOutCubic));
  else if (t < c.paralysed - 0.15) cam = Object.assign({}, LC('room'), { zoom: 1.05 + 0.08 * ramp(t, c.london, c.paralysed) });
  else if (t < c.machine - 0.15) cam = mixCam({ x: 450, y: 590, zoom: 2.5, rot: 0 }, Object.assign({}, LC('drip'), { y: 300, zoom: 2.7 }), ramp(t, c.drug - 0.7, c.drug + 0.15, E.inOutSine));
  else cam = Object.assign({}, LC('pump'), { zoom: 2.3 + 0.2 * ramp(t, c.machine, shot.end) });
  labDraw(cam, t);
  screenSpace();
  stamp('LONDON, 1960s', 1440, 230, ramp(t, c.sixties, c.sixties + 0.35) * (1 - ramp(t, c.paralysed - 0.3, c.paralysed - 0.1)), '#F2D7A0', -0.08, 70);
  return { glow: 0.45, grain: 0, flash: 0.35 * (1 - ramp(lt, 0, 0.2)) };
};
SC.proof2 = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const mins = lerp(2, 6, ramp(t, c.fourmin - 0.4, c.calm + 0.3, E.inOutSine));
  const off = t >= c.proof2 + 0.2 && t < c.doctor + 0.1;
  // the machine switched off -> the clock races four minutes (and his calm face) -> the doctor stops it -> argued
  let cam;
  if (t < c.fourmin - 0.3) cam = Object.assign({}, LC('pump'), { x: 850, zoom: 2.0 });
  else if (t < c.doctor - 0.4) cam = Object.assign({}, LC('clock'), { zoom: 3.2 + 0.4 * ramp(t, c.fourmin, c.doctor) });
  else if (t < c.argue - 0.4) cam = { x: 1000, y: 380, zoom: 1.5, rot: 0 };
  else cam = Object.assign({}, LC('room'), { zoom: 1.0 });
  labDraw(cam, t, { mins, secs: mins * 60, pumpOff: off, pumpOn: t < c.argue - 0.4 ? ramp(t, c.doctor + 0.1, c.doctor + 0.4) : 0, stop: env2(t, c.doctor - 0.1, c.doctor + 1.4, 0.2) });
  screenSpace();
  pill(960, 760, '4 MINUTES · NO KICKING', '#F2D7A0', ramp(t, c.fourmin, c.fourmin + 0.3) * (1 - ramp(t, c.doctor - 0.6, c.doctor - 0.4)), 50);
  // his calm face, in a round window, while the clock races
  const ci = env2(t, c.calm - 0.3, c.doctor - 0.45, 0.2);
  if (ci > 0.01) {
    const R = 170 * E.outBack(clamp(ci * 1.4), 1.8), x = 1450, y = 420;
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = '#C8C0A8'; ctx.fillRect(x - R, y - R, 2 * R, 2 * R);
    ctx.translate(x, y + 20); ctx.scale(R / 150 * 1.6, R / 150 * 1.6);
    ellipse(ctx, 0, 0, 64, 70, '#E8C0A0'); ellipse(ctx, 0, -40, 66, 40, '#4A3A2A');
    for (const sd of [-1, 1]) { ellipse(ctx, sd * 24, -2, 13, 13, '#FFFFFF'); circle(ctx, sd * 24, 0, 6, '#1A1A1A'); }
    rrect(ctx, -34, 22, 68, 46, 18); ctx.fillStyle = '#5A6A72'; ctx.fill();
    ctx.restore();
    ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.lineWidth = 8; ctx.strokeStyle = '#F2D7A0'; ctx.stroke();
    if (ci > 0.8) { ctx.font = '400 60px Anton'; ctx.textAlign = 'center'; ctx.fillStyle = '#F2D7A0'; ctx.fillText('CALM', x, y + R + 56); }
  }
  // the argument: two speech bubbles over the room
  const k = ramp(t, c.argue - 0.4, c.argue + 0.2, E.inOutCubic);
  if (k > 0.01) {
    stamp('STILL ARGUED', 960, 470, k, '#FF9A3C', -0.1, 110);
    speech('IT\'S THE MUSCLE!', 520, 230, ramp(t, c.argue + 0.4, c.argue + 0.7), '#2A2A30', 54, -0.06);
    speech('NOT SO FAST!', 1420, 260, ramp(t, c.argue + 0.9, c.argue + 1.2), '#2A2A30', 54, 0.06);
  }
  return { glow: 0.45, grain: 0, push: { k: 1 + 0.03 * kickOf(t, c.doctor, 4), cx: 960, cy: 540 } };
};

// ================================================================= his best: 1:52; Pip has started on the cake
SC.best = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const a = t - c.best;
  const cam = mixCam(camOnHead('hero', 2.4, -60, 40), camOnHead('hero', 2.0, 280, 60), ramp(t, c.nearly - 0.4, c.nearly + 0.4, E.inOutCubic));
  kitchenAt(cam, t, {
    after: (cm) => {   // the cloth flies off his face
      if (a > 0 && a < 1.2) { const [hx, hy] = kitHead('hero'); ctx.save(); ctx.translate(hx + 260 * a, hy - 300 * a + 400 * a * a); ctx.rotate(a * 5); ctx.scale(0.8, 0.8); kCloth(ctx, 1, t); ctx.restore(); }
    },
  });
  screenSpace();
  const [px, py] = toScreen(cam, ...kitHead('hero'));
  shockLines(px, py, 130, ramp(t, c.best, c.best + 0.45), 12, '#FFD447', 5);
  // the two tries side by side: 45 vs 112
  const bk = ramp(t, c.nearly - 0.2, c.nearly + 0.6, E.outCubic);
  if (bk > 0.01) {
    const x0 = 330, y0 = 780, sc = 3.4;
    for (const [i, v, lab, col] of [[0, 45, 'TRY 1', '#8FB8FF'], [1, 112 * clamp(bk * 1.2), 'TRY 2', '#FFD447']]) {
      const x = x0 + i * 230, h = v * sc;
      rrect(ctx, x - 70, y0 - h, 140, h, 14); ctx.fillStyle = col; ctx.fill();
      ctx.font = '400 60px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillStyle = '#FFFFFF'; ctx.lineWidth = 10; ctx.strokeStyle = '#0B0B1A'; ctx.lineJoin = 'round';
      const lbl = i ? (bk > 0.8 ? '1:52' : '') : '0:45';
      ctx.strokeText(lbl, x, y0 - h - 8); ctx.fillText(lbl, x, y0 - h - 8);
      ctx.font = '900 30px Montserrat'; ctx.textBaseline = 'top'; ctx.fillText(lab, x, y0 + 12);
    }
  }
  return dayPost({ push: { k: 1 + 0.04 * kickOf(t, c.best, 4), cx: 960, cy: 540 } });
};
SC.cake = (lt, t, shot) => {
  const D = shot.end - shot.start;
  kitchenAt(camOnHead('pip', 3.0 + 0.3 * lt / D, 40, 60), t);
  return dayPost();
};
