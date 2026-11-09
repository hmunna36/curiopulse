// The EIFFEL TOWER Gets Taller in Summer: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js. Every beat comes from a cue (make_timeline.py).
'use strict';

const cu = () => TLd.cues;

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the terrace looks at the tower with the Sun high on the LEFT; the other places have it high on the right
const EF_L_TER = flipLight(LIGHTS.day);
const EF_L_DAY = Object.assign({}, LIGHTS.day, { keyTint: [1.08, 1.03, 0.94] });
setLights({
  hook: EF_L_TER, grow: EF_L_TER, button: EF_L_TER, cover: EF_L_TER,
  answer: EF_L_DAY, cat: EF_L_DAY, pieces: EF_L_DAY, stack: EF_L_DAY, lean: EF_L_DAY,
  away: (lt, t) => { const s = efSunArc(t); const L = s.x < 540 ? flipLight(EF_L_DAY) : EF_L_DAY; return Object.assign({}, L, { keyTint: [1.08, 1.0 - 0.06 * s.dusk, 0.94 - 0.14 * s.dusk] }); },
});

// ---------------------------------------------------------------- the terrace (hook, button): shared
const EF_HOOK_CAM = { x: 540, y: 1100, zoom: 2.4 };            // frame 0 and the last frame (the loop)
const EF_ST = { x: 465, y: 1587, s: 1 };                       // him on the terrace: head centre at (465, 1117)
const EF_RAIL = 1330;                                          // the balustrade's rail behind him (hip height)
const EF_PH = { x: 622, y: 985, h: 142 };                      // the phone held up beside his head (world)
// the view behind him: sky, the Sun high on the left, Paris, the tower on the right with its tip just under the phone
function efTerraceFar(cam, t, o = {}) {
  efFar(cam, EF_HOOK_CAM, 0.12);
  efSky(t, { sunX: 150, sunY: 300, sunR: 64, horizon: 1270, clouds: [[0, 330, 520, 0.9], [2, 980, 700, 0.8], [3, 120, 760, 0.7]], dusk: o.dusk || 0 });
  efStrip(EF_CITY.far, -200, 1300, 1.2);
  efTower(ctx, 905, 2470, 1600, { sunSide: -1, grow: o.grow || 0, lean: o.lean || 0, hot: o.hot || 0 });
  efStrip(EF_CITY.mid, -500, 1420, 0.9);
  efStrip(EF_CITY.treesFar, -300, 1440, 1.1);
  efFar(cam, EF_HOOK_CAM, 0.4);
  efStrip(EF_CITY.trees, -700, 1480, 1.25);
  applyCam(cam);
  efTerrace(ctx, -400, 1500, EF_RAIL, t, { pigeons: [[748, -1, 2], [200, 1, 5]] });
  efLamp(ctx, 150, EF_RAIL + 160, 1.25);
}
// the hero on the terrace. o: {face, ph (0..1 the phone up), sunburn, lean, sweat, shade (the phone as a sunshade)}
function efHeroTerrace(cam, t, o = {}) {
  const st = { x: EF_ST.x + (o.dx || 0), y: EF_ST.y, s: 1, blink: o.blink || 0 };
  let pose = JSON.parse(JSON.stringify(POSES.stand));
  pose.lean = o.lean || 0;
  const up = clamp(o.ph != null ? o.ph : 1);
  // the phone: down at his side (up 0) .. held up beside his head (up 1); elbow and wrist given (armAt), never IK
  const phUp = [EF_PH.x + (o.phDX || 0), EF_PH.y + (o.phDY || 0)], phDown = [EF_ST.x + 131, EF_ST.y - 238];
  const ph = [lerp(phDown[0], phUp[0], up), lerp(phDown[1], phUp[1], up)];
  const wr = [ph[0] - 6, ph[1] + EF_PH.h * 0.36];
  const elUp = [612, 1160], elDown = [EF_ST.x + 110, EF_ST.y - 277];
  const el = [lerp(elDown[0], elUp[0], up) + 30 * Math.sin(Math.PI * up), lerp(elDown[1], elUp[1], up)];
  pose = armAt(pose, 'R', ikLocal(st, el[0], el[1]), ikLocal(st, wr[0], wr[1]));
  pose.armL = { a: 0.25, b: 0.25 };
  pose.handR = 'open';
  st.pose = pose; st.face = o.face || FACES.grin;
  applyCam(cam);
  const r = charLayer(cam, st, t, { pal: EFPAL, post: (lc, rr, s2) => {
    efBeret(lc, s2, rr);
    efSunburn(lc, s2, rr, o.sunburn != null ? o.sunburn : 0.3);
    efSweat(lc, s2, rr, o.sweat || 0, t);
    efPhone(lc, ph[0], ph[1], EF_PH.h, { face: 'ruler', rot: o.phRot || 0 });
    efGrip(lc, ph[0], ph[1], EF_PH.h, o.phRot || 0, EFPAL, false);
  } });
  softDot(gctx, ph[0], ph[1], 90, '#FFF2C8', 0.22);   // the screen's light
  return { st, r, ph };
}

// ================================================================ HOOK: hold up your phone (CU, him left)
SC.hook = (lt, t, shot) => {
  const c = cu();
  const cam = Object.assign({}, EF_HOOK_CAM, { zoom: EF_HOOK_CAM.zoom + 0.06 * E.inOutSine(clamp(lt / 1.2)) });
  efTerraceFar(cam, t);
  const wig = popK(t, 0, c.phone_end + 0.3, 0.001, 0.25);
  efHeroTerrace(cam, t, { ph: 1, phRot: 0.07 * Math.sin(t * 14) * wig, phDY: -10 * Math.sin(t * 7) * wig, face: Object.assign({}, FACES.grin, { lookX: 0.15, lookY: 0.1 }),
    blink: popK(t, 0.95, 1.05, 0.04, 0.04) * 0.95 });
  return { glow: 0.85 };
};

// ================================================================ GROW: the tip grows the phone's length (low angle, his arm)
const EF_GROW_CAM = { x: 540, y: 960, zoom: 1 };
SC.grow = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 540, y: 960 + 30 * E.inOutSine(clamp(lt / D)), zoom: 1 + 0.05 * clamp(lt / D) };
  const g = 0.176 * E.inOutCubic(ramp(t, c.that - 0.1, c.much_end + 0.15, (x) => x));
  const flare = ramp(t, c.summer - 0.15, c.summer + 0.4, E.outCubic);
  efFar(cam, EF_GROW_CAM, 0.15);
  efSky(t, { sunX: 170, sunY: 470 - 30 * flare, sunR: 70 + 26 * flare, horizon: 1720, clouds: [[2, 860, 520, 0.9], [1, 160, 980, 0.7]] });
  efStrip(EF_CITY.far, -100, 1760, 1.4);
  efFar(cam, EF_GROW_CAM, 0.3);
  const TX = 470, TB = 2500, TH = 1700;
  const M = efTower(ctx, TX, TB, TH, { sunSide: -1, grow: g, hot: 0.35 * flare, ghost: ramp(t, c.that, c.that + 0.2) });
  efTowerGlow(M, TH, -1, 0.7 * flare);
  efStrip(EF_CITY.trees, -400, 1990, 1.6);
  // the bracket and the tag: the old tip to the new tip
  const yOld = TB - TH, yNew = M.Y(1);
  efBracket(ctx, TX + 66, yOld, yNew, ramp(t, c.that, c.much_end + 0.1, E.outCubic));
  // heat shimmer over the tower once the Sun flares
  if (flare > 0.01) for (let i = 0; i < 7; i++) {
    const yy = 1200 + i * 90, xx = TX + 160 * Math.sin(i * 1.7);
    line(ctx, xx, yy, xx + 10 * Math.sin(t * 9 + i), yy - 50, 4, rgba('#FFF0D0', 0.18 * flare));
  }
  // his forearm and phone from the bottom right, the phone's bottom level with the old tip, beside it
  applyCam(cam);
  const sway = 6 * Math.sin(t * 2.2);
  const pc = efArmFromBehind(ctx, 1110, 1640, 655 + sway, 742, 300);
  void pc;
  efTag('UP TO ~15 cm', 250, 690, '#FFD447', popK(t, c.much_end - 0.05, shot.end + 1, 0.12, 0.1), 46, -0.05);
  return { glow: 0.9 };
};

// ================================================================ ANSWER: hot iron stretches (wide, high angle from a rooftop)
const EF_ANS_CAM = { x: 540, y: 960, zoom: 1 };
SC.answer = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 540, y: 960 - 20 * lt, zoom: 1.0 + 0.04 * clamp(lt / D) };
  const k = E.outBack(ramp(t, c.stretches - 0.05, c.stretches + 0.75, (x) => x)) * (1 - 0.15 * ramp(t, c.stretches_end + 0.2, shot.end));
  efFar(cam, EF_ANS_CAM, 0.12);
  efSky(t, { sunX: 905, sunY: 330, sunR: 78, horizon: 760, clouds: [[1, 260, 420, 0.8], [0, 760, 600, 0.6]] });
  efStrip(EF_CITY.far, 0, 800, 1.0);
  efFar(cam, EF_ANS_CAM, 0.3);
  efStrip(EF_CITY.mid, -620, 920, 0.62);        // the city fills the plain behind the tower (round 2: a flat beige band read as desert)
  efStrip(EF_CITY.mid, -300, 1060, 0.85);
  efStrip(EF_CITY.mid, -980, 1300, 0.95);
  efStrip(EF_CITY.treesFar, -400, 1330, 0.9);
  const TX = 520, TB = 1600, TH = 1150;
  const M = efTower(ctx, TX, TB, TH, { sunSide: 1, stretch: k, hot: 0.4, wobble: 3 * k * Math.sin(t * 20) * popK(t, c.stretches, c.stretches + 0.5) });
  efTowerGlow(M, TH, 1, 0.6);
  efTowerFace(ctx, M, TH, ramp(t, c.stretches - 0.1, c.stretches + 0.2), 'sleepy', t, popK(t, c.stretches, c.stretches_end + 0.3, 0.2, 0.3));
  efStrip(EF_CITY.treesFar, -200, 1500, 1.0);
  efStrip(EF_CITY.mid, -800, 1640, 1.1);
  efStrip(EF_CITY.trees, -100, 1660, 1.0);
  // the rooftop we stand on: a zinc mansard edge across the bottom, chimney pots, a pigeon
  applyCam(cam);
  ctx.fillStyle = EF.zincSh; ctx.beginPath(); ctx.moveTo(-300, 1760); ctx.lineTo(1400, 1700); ctx.lineTo(1400, 2600); ctx.lineTo(-300, 2600); ctx.closePath(); ctx.fill();
  ctx.fillStyle = EF.zinc; ctx.beginPath(); ctx.moveTo(-300, 1790); ctx.lineTo(1400, 1730); ctx.lineTo(1400, 2600); ctx.lineTo(-300, 2600); ctx.closePath(); ctx.fill();
  for (let x = -260; x < 1400; x += 60) line(ctx, x, 1790 - (x + 300) * 0.035, x - 40, 2300, 3, rgba(EF.zincHi, 0.5));
  rrect(ctx, 70, 1500, 130, 260, 6); ctx.fillStyle = '#E4D3B2'; ctx.fill();
  rrect(ctx, 60, 1490, 150, 26, 6); ctx.fillStyle = '#D0BC97'; ctx.fill();
  for (let i = 0; i < 4; i++) { rrect(ctx, 76 + i * 32, 1440, 22, 54, 5); ctx.fillStyle = '#D9773F'; ctx.fill(); }
  efPigeon(ctx, 930, 1724, 1.6, -1, t, 3);
  return { glow: 0.9 };
};

// ================================================================ CAT: like a cat in a sunbeam (the cafe terrace, medium)
const EF_CAT_CAM = { x: 540, y: 960, zoom: 1 };
SC.cat = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 620 + 20 * E.inOutSine(clamp(lt / D)), y: 1170, zoom: 1.5 + 0.06 * clamp(lt / D) };
  const k = E.outBack(ramp(t, c.cat - 0.1, c.cat + 0.75, (x) => x));
  const kt = E.outBack(ramp(t, c.sunbeam - 0.25, c.sunbeam + 0.5, (x) => x));
  efFar(cam, EF_CAT_CAM, 0.12);
  efSky(t, { sunX: 960, sunY: 250, sunR: 60, horizon: 1150, clouds: [[3, 300, 330, 0.7]] });
  efStrip(EF_CITY.far, 0, 1150, 1.0);
  const M = efTower(ctx, 500, 1330, 760, { sunSide: 1, stretch: kt, hot: 0.4 });
  efTowerFace(ctx, M, 760, kt, 'sleepy', t, popK(t, c.sunbeam - 0.2, c.sunbeam + 0.6, 0.15, 0.3));
  efStrip(EF_CITY.mid, -200, 1340, 1.0);
  efStrip(EF_CITY.trees, 300, 1380, 0.9);
  applyCam(cam);
  // the cafe: shade under a red awning, the pavement, a wicker chair, the table
  ctx.fillStyle = '#2A1B22'; ctx.fillRect(-300, 300, 1700, 140);
  for (let i = -6; i < 30; i++) {           // the awning's stripes and scalloped edge
    ctx.fillStyle = i % 2 ? '#D8323F' : '#F6EBDD';
    ctx.fillRect(i * 64, 300, 64, 170);
    ctx.beginPath(); ctx.arc(i * 64 + 32, 470, 32, 0, Math.PI); ctx.fill();
  }
  paint(() => { ctx.font = '900 64px Montserrat'; ctx.textAlign = 'center'; ctx.fillStyle = '#1D1420'; ctx.fillText('CAFÉ', 540, 400); });
  const pg = ctx.createLinearGradient(0, 1380, 0, 2400);
  pg.addColorStop(0, '#CDB894'); pg.addColorStop(1, '#9D8865');
  ctx.fillStyle = pg; ctx.fillRect(-300, 1380, 1700, 1100);
  // the sunbeam: a soft warm shaft from the upper right onto the table (thin layers, so its edges are soft)
  const beam = 0.8 + 0.12 * Math.sin(t * loopW(1.5));
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 6; i++) {
    const w0 = 30 + i * 22, w1 = 70 + i * 40;
    ctx.fillStyle = rgba('#FFE2A0', 0.045 * beam);
    ctx.beginPath(); ctx.moveTo(1010 - w0, 470); ctx.lineTo(1010 + w0, 470); ctx.lineTo(745 + w1, 1330); ctx.lineTo(745 - w1, 1330); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  // the hero, seated behind the table on the left, fanning himself with the menu
  const st = { x: 420, y: 1560, s: 1.0, blink: popK(t, 7.6, 7.7, 0.04, 0.04) * 0.95 };
  let pose = JSON.parse(JSON.stringify(POSES.sit));
  const fan = Math.sin(t * 16) * (1 - ramp(t, c.cat + 0.1, c.cat + 0.3));
  const look = ramp(t, c.cat - 0.1, c.cat + 0.2);
  pose = ikReach(pose, 'R', ikLocal(st, 520 + 18 * fan, 1130 + 10 * fan), -1);
  pose.armL = { a: 0.55, b: 0.6 };
  st.pose = pose;
  st.face = Object.assign({}, lerpFace(FACES.calm, FACES.startled, ramp(t, c.sunbeam - 0.1, c.sunbeam + 0.2) * 0.8),
    { lookX: lerp(0.3, 0.9, look), lookY: lerp(-0.2, 0.5, look) });
  const r = charLayer(cam, st, t, { pal: EFPAL, post: (lc, rr, s2) => {
    efBeret(lc, s2, rr); efSunburn(lc, s2, rr, 0.45); efSweat(lc, s2, rr, 1, t);
    // the menu card in his right hand
    const wr = toWorld(s2, rr.wrR);
    lc.save(); lc.translate(wr[0] + 10, wr[1] - 60); lc.rotate(-0.25 + 0.3 * fan);
    rrect(lc, -50, -70, 100, 130, 8); lc.fillStyle = '#FFF4DE'; lc.fill();
    paint(() => { lc.font = '900 22px Montserrat'; lc.textAlign = 'center'; lc.fillStyle = '#B5312C'; lc.fillText('MENU', 0, -30); for (let i = 0; i < 4; i++) { lc.fillStyle = '#8A7A66'; lc.fillRect(-34, -8 + i * 16, 68, 5); } });
    lc.restore();
  } });
  void r;
  // the table: a round marble top on a cast-iron stand
  rrect(ctx, 600, 1380, 30, 460, 10); ctx.fillStyle = '#26232B'; ctx.fill();
  ctx.beginPath(); ctx.ellipse(615, 1350, 330, 56, 0, 0, 7); ctx.fillStyle = '#E9E6E1'; ctx.fill();
  ctx.beginPath(); ctx.ellipse(615, 1342, 322, 46, 0, 0, 7); ctx.fillStyle = '#F7F5F1'; ctx.fill();
  // a cafe glass on the table
  rrect(ctx, 400, 1262, 44, 70, 8); ctx.fillStyle = '#6B3A1E'; ctx.fill();
  rrect(ctx, 400, 1262, 44, 14, 6); ctx.fillStyle = '#F4E6CC'; ctx.fill();
  // the cat, on the table in the beam
  efCat(ctx, 700, 1335, 1.55, t, { stretch: k, happy: k > 0.3 ? 1 : 0, look: -1 });
  softDot(gctx, 760, 1260, 160, '#FFD27A', 0.25 * beam);
  return { glow: 0.85 };
};

// ================================================================ PIECES: 18,000 pieces, each a hair longer (on the tower)
const EF_PC_HERO = { x: 640, y: 1500, s: 1 };
const EF_BAR = { a: [120, 1180], b: [520, 1180], w: 70 };     // the bar beside him that grows (its end at b)
SC.pieces = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const hairT = c.hair - shot.start;
  const cam = camKeys(lt, [[0, 560, 1180, 1.05], [c.pieces - shot.start, 520, 1180, 1.12], [c.each - shot.start - 0.1, 470, 1190, 1.35],
    [hairT + 0.2, 520, 1150, 1.5], [D, 520, 1150, 1.55]]);
  // the city far below (high angle): the painted map, tipped away, with haze
  screenSpace();
  ctx.fillStyle = '#D7E6F2'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.translate(W / 2 - (cam.x - 540) * 0.2, 980 - (cam.y - 1180) * 0.2); ctx.scale(1.25 + 0.1 * (cam.zoom - 1), 0.82 + 0.06 * (cam.zoom - 1)); ctx.rotate(-0.12);
  ctx.drawImage(EF_BELOW, -900, -900); ctx.restore();
  const hz = ctx.createLinearGradient(0, 0, 0, H);
  hz.addColorStop(0, rgba('#CFE6FA', 0.75)); hz.addColorStop(0.45, rgba('#E8F2FA', 0.25)); hz.addColorStop(1, rgba('#FFE9C8', 0.15));
  ctx.fillStyle = hz; ctx.fillRect(0, 0, W, H);
  applyCam(cam);
  // the lattice round him: big diagonals and horizontals, with plates where they meet
  const lit = (i) => popK(t, c.eighteen + 0.06 * i, c.eighteen + 0.06 * i + 0.25, 0.05, 0.15);   // a ripple: piece after piece lights up
  const beams = [[[-200, 700], [700, 1640], 60], [[1300, 650], [400, 1600], 60], [[-200, 1640], [1300, 1640], 84], [[-200, 820], [1300, 820], 56],
    [[860, 300], [860, 2200], 90], [[-80, 300], [-80, 2200], 90]];
  beams.forEach(([a, b, w], i) => efGirder(ctx, a, b, w, { hot: 0.25 + 0.6 * lit(i) }));
  for (const p of [[860, 820], [860, 1640], [-80, 820], [-80, 1640], [250, 1170]]) efPlate(ctx, p[0], p[1], 46);
  // the bar beside him: it heats on "iron pieces", then its end slides out on "each one"
  const heat = ramp(t, c.iron - 0.1, c.pieces_end, E.inOutSine);
  const ext = 26 * E.outBack(ramp(t, c.each, c.one1 + 0.5, (x) => x));
  efPlate(ctx, EF_BAR.a[0], EF_BAR.a[1], 52);
  const B = efGirder(ctx, EF_BAR.a, EF_BAR.b, EF_BAR.w, { hot: 0.3 + 0.7 * heat, ext });
  efPlate(ctx, EF_BAR.b[0] + 64, EF_BAR.b[1], 44);
  // the gap at its end, marked
  if (ext > 1) {
    line(ctx, EF_BAR.b[0] + 2, EF_BAR.b[1] - 62, EF_BAR.b[0] + 2, EF_BAR.b[1] + 62, 4, rgba('#FFFFFF', 0.85));
    softDot(gctx, B[0], B[1], 50, '#FFB347', 0.6 * heat);
  }
  // him: standing on the low girder, his left hand gripping the diagonal, the right plucking a hair, then holding it at the gap
  const st = { x: EF_PC_HERO.x, y: 1640 - 42, s: 1, blink: 0 };
  let pose = JSON.parse(JSON.stringify(POSES.stand));
  pose.lean = -0.06;
  pose = ikReach(pose, 'L', ikLocal(st, 585, 850), -1);
  const pluck = ramp(t, c.each - 0.15, c.each + 0.25, E.inOutCubic) * (1 - ramp(t, c.hair - 0.25, c.hair + 0.05, E.inOutCubic));
  const show = ramp(t, c.hair - 0.25, c.hair + 0.1, E.outBack);
  const headTop = [st.x + 10, st.y - 545];
  const atGap = [EF_BAR.b[0] + 40, EF_BAR.b[1] + 20];
  const rest = [st.x + 150, st.y - 300];
  const tgt = show > 0.01 ? [lerp(headTop[0], atGap[0], show), lerp(headTop[1], atGap[1], show)] : [lerp(rest[0], headTop[0], pluck), lerp(rest[1], headTop[1], pluck)];
  pose = ikReach(pose, 'R', ikLocal(st, tgt[0], tgt[1]), show > 0.5 ? 1 : -1);
  st.pose = pose;
  const ow = popK(t, c.hair - 0.3, c.hair + 0.25, 0.05, 0.15);
  let face = lerpFace(Object.assign({}, FACES.nervous, { lookX: -0.4, lookY: 0.6 }), FACES.shock, ow * 0.85);
  if (t > c.hair + 0.25) face = Object.assign({}, FACES.calm, { lookX: -0.9, lookY: 0.2, browY: 0.7 });
  st.face = face;
  const r = charLayer(cam, st, t, { pal: EFPAL, post: (lc, rr, s2) => {
    efBeret(lc, s2, rr); efSunburn(lc, s2, rr, 0.5); efSweat(lc, s2, rr, 1, t);
    const wr = toWorld(s2, rr.wrR);
    if (pluck > 0.2 || show > 0.01) efHair(lc, wr[0] - 6, wr[1] - 30, 46, -1.2 + 1.1 * show, 1);
  } });
  void r;
  // OW! and the counter
  if (ow > 0.01) { screenSpace(); bigWord('OW!', 820, 760, 110, '#FF5A6E', ow, 0.12); applyCam(cam); }
  const n = Math.round(18038 * E.outCubic(ramp(t, c.eighteen, c.pieces + 0.2, (x) => x)));
  efTag(`${n.toLocaleString('en-US')} PIECES`, 540, 520, '#FFD447', popK(t, c.eighteen - 0.05, c.each - 0.1, 0.12, 0.12), 50, -0.03);
  efTag('+ ONE HAIR', 300, 1520, '#C8A8FF', popK(t, c.longer - 0.05, shot.end + 1, 0.12, 0.1), 40, 0.05);
  return { glow: 0.85, focus: [540, 760] };
};

// ================================================================ STACK: stack it all up: one phone (the top third, low angle)
SC.stack = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 540, y: 980 + 120 * (1 - E.outCubic(clamp(lt / D))), zoom: 1 };
  screenSpace();
  efSky(t, { sunX: 930, sunY: 470, sunR: 60, horizon: 2400, clouds: [[0, 230, 600, 0.8], [3, 900, 980, 0.7]] });
  applyCam(cam);
  const TX = 540, TB = 3330, TH = 2690;
  const M = efTower(ctx, TX, TB, TH, { sunSide: 1, hot: 0.5, noAntenna: false });
  efTowerGlow(M, TH, 1, 0.55);
  // slivers of iron stream up both edges of the tower and pile up on the tip as a phone-sized block
  const tip = [M.X(1, 0), M.Y(1)];
  const pile = ramp(t, c.stack + 0.2, c.one2, (x) => x);   // 0..1: how full the stack is
  const SH = 260, SW = 124;
  for (let i = 0; i < 26; i++) {
    const t0 = c.stack - 0.1 + i * ((c.one2 - c.stack) / 26), u = ramp(t, t0, t0 + 0.55, E.inCubic);
    if (u <= 0 || u >= 1) continue;
    const side = i % 2 ? 1 : -1, v0 = 0.45 + 0.02 * (i % 5);
    const p0 = M.P(v0, side * 0.7), y = lerp(p0[1], tip[1] - SH * (i / 26), u), x = lerp(p0[0], tip[0] + side * 30 * (1 - u), u);
    efSliver(ctx, x, y, 34, 10, 1);
  }
  const phoneK = ramp(t, c.phone2 - 0.1, c.phone2 + 0.08, (x) => x);
  if (pile > 0.01 && phoneK < 1) {             // the block so far (glowing bars, bottom up)
    const nb = Math.floor(pile * 18);
    for (let j = 0; j < nb; j++) efSliver(ctx, tip[0], tip[1] - 8 - j * (SH / 18), SW, SH / 18 - 3, 1);
  }
  if (phoneK > 0) {                             // ...it becomes his phone, standing on the tip: clunk
    const drop = (1 - E.outBounce(phoneK)) * 120;
    efPhone(ctx, tip[0], tip[1] - SH / 2 - 4 - drop, SH, { face: 'ruler' });
    if (phoneK < 1) softDot(gctx, tip[0], tip[1] - SH / 2, 260, '#FFFFFF', 0.8 * (1 - phoneK));
    softDot(gctx, tip[0], tip[1] - SH / 2, 150, '#FFF2C8', 0.3);
  }
  efTag('+15 cm', TX + 210, tip[1] - SH / 2 - (cam.y - 960), '#7DFFB8', popK(t, c.phone2 + 0.1, shot.end + 1, 0.12, 0.1), 52, -0.05);
  return { glow: 0.9 };
};

// ================================================================ LEAN: the sunny side stretches more (medium-wide, eye level)
SC.lean = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 540, y: 1000, zoom: 1.02 + 0.05 * clamp(lt / D) };
  const flare = popK(t, c.sunny - 0.1, c.sunny + 0.8, 0.15, 0.4);
  const hot = ramp(t, c.side - 0.2, c.side + 0.35, E.outCubic);
  const more = ramp(t, c.stretches2 - 0.1, c.more_end + 0.1, E.inOutCubic);
  screenSpace();
  efSky(t, { sunX: 950, sunY: 470, sunR: 82 + 30 * flare, horizon: 1600, clouds: [[1, 240, 460, 0.7], [2, 380, 820, 0.6]] });
  efStrip(EF_CITY.far, 0, 1640, 1.2);
  applyCam(cam);
  const TX = 520, TB = 1660, TH = 1180;
  const M = efTower(ctx, TX, TB, TH, { sunSide: 1, hot: 0.2 + 0.8 * hot, lean: -26 * more });
  efTowerGlow(M, TH, 1, hot);
  // the shady side: a cool wash on the left half
  if (hot > 0.01) {
    ctx.save(); ctx.globalCompositeOperation = 'source-atop';
    ctx.restore();
  }
  screenSpace();
  efStrip(EF_CITY.mid, -100, 1800, 1.0);
  efStrip(EF_CITY.trees, -400, 1820, 1.2);
  applyCam(cam);
  // little up-arrows on the sunny side as it stretches
  for (let i = 0; i < 4; i++) {
    const v = 0.15 + i * 0.18, p = M.P(v, 1.35), a = popK(t, c.stretches2 + i * 0.08, shot.end + 1, 0.12, 0.1);
    if (a > 0.01) { const y = p[1] - 18 * Math.sin(t * 8 + i); line(ctx, p[0] + 30, y + 30, p[0] + 30, y - 30, 8, '#FFB347'); ctx.beginPath(); ctx.moveTo(p[0] + 14, y - 18); ctx.lineTo(p[0] + 30, y - 40); ctx.lineTo(p[0] + 46, y - 18); ctx.closePath(); ctx.fillStyle = '#FFB347'; ctx.fill(); }
  }
  efTag('SUNNY SIDE', 790, 960, '#FFB347', popK(t, c.side - 0.05, shot.end + 1, 0.12, 0.1), 40, 0.04);
  efTag('SHADY SIDE', 280, 960, '#7FE9FF', popK(t, c.side + 0.25, shot.end + 1, 0.12, 0.1), 40, -0.04);
  return { glow: 0.95 };
};

// ================================================================ AWAY: the top leans away from the Sun (time-lapse, high angle)
// the Sun's path through the shot: from low left (morning) over the top to low right (evening)
function efSunArc(t) {
  const c = TLd.cues, sh = (TLd.shots || []).find((s) => s.id === 'away') || { start: c.so, end: c.honestly };
  const u = clamp((t - sh.start + 0.2) / (sh.end - sh.start + 0.2));
  const a = Math.PI * (0.92 - 0.84 * u);
  return { u, x: 540 + 470 * Math.cos(a), y: 1060 - 640 * Math.sin(a), dusk: clamp((u - 0.62) / 0.38) };
}
SC.away = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const pk = E.inOutCubic(ramp(t, c.leans - 0.3, c.sun_end, (x) => x));
  const cam = { x: 540, y: lerp(990, 820, pk), zoom: 1.0 + 0.55 * pk };
  const S = efSunArc(t);
  screenSpace();
  efSky(t, { sunX: S.x, sunY: S.y, sunR: 66, horizon: 1180, clouds: [[3, 200, 520, 0.6], [1, 880, 600, 0.6]], dusk: S.dusk * 0.8 });
  efStrip(EF_CITY.far, 0, 1220, 1.0);
  applyCam(cam);
  // the Champ de Mars below (high angle) with the tower's shadow swinging away from the Sun
  efChampDeMars(540, 1330, 1900, 900);
  efStrip(EF_CITY.trees, -200, 1340, 0.9);
  const TX = 540, TB = 1520, TH = 900;
  const sx = (S.x - 540) / 470;               // -1 sun left .. 1 sun right
  const leanPx = -70 * sx * ramp(t, c.leans - 0.2, c.leans + 0.3);   // exaggerated: the top leans AWAY
  ctx.save(); ctx.translate(TX, TB); ctx.scale(1, 0.32); ctx.rotate(Math.atan2(-sx, 0.6) * 0.9);
  ctx.fillStyle = 'rgba(30,60,30,0.2)'; ctx.beginPath(); ctx.moveTo(-120, 0); ctx.lineTo(0, 900); ctx.lineTo(120, 0); ctx.closePath(); ctx.fill(); ctx.restore();
  const M = efTower(ctx, TX, TB, TH, { sunSide: sx >= 0 ? 1 : -1, hot: 0.6, lean: leanPx });
  efTowerGlow(M, TH, sx >= 0 ? 1 : -1, 0.6);
  // the top's path: a dashed loop drawn as the Sun goes round
  const tip = M.P(0.86, 0), u = S.u;
  ctx.save(); ctx.setLineDash([12, 10]); ctx.lineWidth = 5; ctx.strokeStyle = rgba('#FFD447', 0.9);
  ctx.beginPath();
  const cx0 = TX, cy0 = M.Y(0.86);
  for (let i = 0; i <= 40 * u; i++) { const a = Math.PI * (i / 40); const px = cx0 + 70 * Math.cos(a) * 1.0, py = cy0 - 26 * Math.sin(a); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
  ctx.stroke(); ctx.restore();
  // him on the top platform, holding on, his beret flying
  const st = { x: tip[0], y: M.Y(EF_TW.p3[1]) + 2, s: 0.2, blink: 0 };
  let pose = JSON.parse(JSON.stringify(POSES.flinch)); pose.lean = 0.25 * (leanPx / 70);
  st.pose = pose; st.face = FACES.shock;
  charLayer(cam, st, t, { pal: EFPAL, post: (lc, rr, s2) => efBeret(lc, s2, rr) });
  efTag('THE TOP DRAWS A ~15 cm LOOP', 540, 492, '#FFD447', popK(t, c.leans + 0.1, shot.end + 1, 0.12, 0.1), 34, -0.02);
  efTag('(drawn x100)', 540, 552, '#FFFFFF', popK(t, c.leans + 0.3, shot.end + 1, 0.12, 0.1), 26, -0.02);
  return { glow: 0.95 };
};

// ================================================================ BUTTON: honestly? same. -> frame 1
SC.button = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const aS = c.same - shot.start, aE = c.shade - shot.start;
  const cam = camKeys(lt, [[0, 520, 1050, 1.6], [aS, 520, 1080, 1.75], [aE, 540, 1100, 2.25], [D - 0.25, EF_HOOK_CAM.x, EF_HOOK_CAM.y, EF_HOOK_CAM.zoom + 0.0], [D, EF_HOOK_CAM.x, EF_HOOK_CAM.y, EF_HOOK_CAM.zoom]]);
  efTerraceFar(cam, t, { lean: 22 });
  const shade = ramp(t, c.shade - 0.05, c.shade + 0.35, E.outCubic);
  const lean = 0.22 * (1 - shade) * ramp(t, c.honestly - 0.2, c.honestly + 0.3, E.outBack);   // he leans away from the Sun, like the tower
  const dead = ramp(t, c.honestly - 0.1, c.honestly + 0.2);
  let face = Object.assign({}, FACES.annoyed, { lookX: 0, lookY: 0, blink: 0.35 });
  if (shade > 0.5) face = Object.assign({}, FACES.grin, { lookX: 0.15, lookY: 0.1 });
  efHeroTerrace(cam, t, { ph: shade, face: dead > 0 ? face : FACES.calm, sunburn: 0.95 - 0.65 * shade, lean, dx: 0, sweat: 1 - shade,
    blink: popK(t, c.same + 0.3, c.same + 0.4, 0.04, 0.04) * 0.95 });
  return { glow: 0.85 };
};

// ================================================================ the cover (outside the timeline: src/cover.sh)
SC.cover = (lt, t, shot) => {
  // the hook's picture (his grin, the ruler phone held up beside the tower's tip) with the question above his head, inside the
  // middle square Instagram crops to (y 420-1500)
  const cam = { x: 545, y: 1080, zoom: 2.28 };
  efTerraceFar(cam, 1.0);
  efHeroTerrace(cam, 1.0, { ph: 1, face: Object.assign({}, FACES.grin, { lookX: 0.15, lookY: 0.1, eyeOpen: 1.2 }), sunburn: 0.3 });
  screenSpace();
  rrect(gctx, 40, 420, 640, 360, 40); gctx.fillStyle = 'rgba(0,0,0,1)'; gctx.fill();   // no bloom under the words
  bigWord('TALLER', 345, 560, 178, '#FFD447', 1, -0.05);
  bigWord('IN SUMMER?', 345, 700, 104, '#FFFFFF', 1, -0.05);
  return { glow: 0.85, noCaptions: true };
};

function initScenes2() {
  efWorldInit();
  efBelowInit();
}
