// One Night on URANUS Lasts 42 Years Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js. Every beat comes from a cue (make_timeline.py).
// The world (un_world.js): Uranus's south pole from his balloon basket (sky, cloud decks, the balloon, him, the clock, the
// year card, the beard); the planet in space with a face and a pillow; the orbit diagram.
'use strict';

const cu = () => TLd.cues;
const unShot = (id) => TLd.shots.find((s) => s.id === id);

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the pole at sunset: the low Sun on the LEFT (warm key and an orange rim from the left), the cyan sky behind; the night:
// starlight from above and the lantern's warm rim from the right; the dawn of 2049: the Sun back up on the left; space:
// the Sun's light from the left, a cool rim; the diagrams: the diagram light
const UN_L_SUNSET = Object.assign({}, flipLight(LIGHTS.sunset), { pool: 0.32, poolTint: [0.36, 0.5, 0.8] });
const UN_L_NIGHT = Object.assign({}, LIGHTS.night, { rimFrom: [0.9, -0.15], rim: [1.0, 0.72, 0.42], rimAmt: 1.35, pool: 0.55 });
const UN_L_DAWN = Object.assign({}, flipLight(LIGHTS.sunset), { keyTint: [1.14, 1.02, 0.86], rimAmt: 1.5, pool: 0.28 });
const UN_L_SPACE = Object.assign({}, LIGHTS.night, { key: [-0.6, -0.5, 0.62], keyTint: [1.04, 1.0, 0.96], rimFrom: [0.9, -0.2], rim: [0.6, 0.9, 1.0], pool: 0.2, halo: 0 });
setLights({
  hook: UN_L_SUNSET, hook_b: UN_L_SUNSET, years: UN_L_SUNSET, loop: UN_L_SUNSET,
  answer: UN_L_SPACE, side: UN_L_SPACE, pole: UN_L_SPACE,
  orbit: LIGHTS.diagram, halftrip: LIGHTS.diagram, trip: LIGHTS.diagram, half: LIGHTS.diagram,
  dark: (lt, t) => (t < cu().click ? UN_L_SUNSET : UN_L_NIGHT), night: UN_L_NIGHT, lapse: UN_L_NIGHT,
  ring: UN_L_DAWN, button: UN_L_DAWN, cover: UN_L_NIGHT,
});

// ---------------------------------------------------------------- the set
const UN_HX = 540, UN_HY = 1500, UN_RIM = 1290, UN_MOUTH = [540, 420];
const UN_SUN_AT = [180, 1000];                 // the Sun on its own layer (p 0.12): low on the left, on the far cloud edge
const UN_CLOCK_RIM = [392, 1272];              // where the clock stands on the rim (the night)
const UN_CARD_RIM = [694, 1272];               // the year card on the rim
// his faces
const UF = {
  smug: Object.assign({}, FACES.grin, { lookX: 0.75, lookY: 0.2, mouthOpen: 0.45, browY: 0.35, browTilt: -0.3 }),
  proud: Object.assign({}, FACES.grin, { lookX: 0.1, lookY: 0.05, mouthOpen: 0.55, browY: 0.45, browTilt: -0.25 }),
  huh: Object.assign({}, FACES.confused, { lookX: 0.1, lookY: 0.0, mouth: 'flat', mouthOpen: 0.15, browY: 0.8, browTilt: 0.8 }),
  pop: Object.assign({}, FACES.startled, { lookX: 0.6, lookY: 0.2, eyeOpen: 1.45, pupil: 0.45, mouth: 'o', mouthOpen: 0.85 }),
  watch: Object.assign({}, FACES.calm, { lookX: -0.85, lookY: 0.1, mouth: 'flat', mouthOpen: 0.1, browY: 0.3 }),
  dark: Object.assign({}, FACES.startled, { lookX: 0.0, lookY: 0.0, eyeOpen: 1.4, pupil: 0.55, mouth: 'flat', mouthOpen: 0.2 }),
  sleep: Object.assign({}, FACES.sleepy, { mouth: 'o', mouthOpen: 0.25 }),
  wake: Object.assign({}, FACES.shock, { lookX: 0.0, lookY: 0.0 }),
  dazed: Object.assign({}, FACES.dazed, { cross: 0, lookX: 0.0, lookY: 0.1, blink: 0.35 }),
  down: Object.assign({}, FACES.worried, { lookX: 0.05, lookY: 1, mouth: 'flat', mouthOpen: 0.15, browY: 0.9 }),
  deadpan: Object.assign({}, FACES.annoyed, { lookX: 0.0, lookY: 0.0, blink: 0.45, browTilt: -0.3, browY: -0.1, mouth: 'flat', mouthOpen: 0 }),
};
function unFaceAt(keys, t) {             // keys: [[t, face]...], 0.12 s blends
  let f = keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t >= keys[i][0]) f = lerpFace(keys[i - 1][1], keys[i][1], clamp((t - keys[i][0]) / 0.12));
  return f;
}
// the whole balloon scene for a world camera. o: {sky: {...unSky options}, deck: {night, dawn}, dy, env (draw the envelope),
// hero: {...unHero options} | null, clockHand: {x, y, s, txt, from, flip} (the clock in his hands, drawn after him),
// clockRim: {...} (the clock on the rim), card: {year, frost} (the year card), frost, beard: L, lamp 0..1, sign, pole (the
// SOUTH POLE signpost), after(cam, hr)}
function unPoleScene(cam, t, o = {}) {
  const dy = o.dy || 0;
  const skyO = Object.assign({ sun: UN_SUN_AT, sunR: 30, dy }, o.sky || {});
  const S = unSky(cam, t, skyO);
  unDecks(cam, o.deckT === undefined ? t : o.deckT, Object.assign({ dy }, o.deck || {}, { mid: o.pole ? () => unSignpost(cam, t) : null }));
  applyCam(cam);
  if (o.env) unEnvelope(ctx, UN_MOUTH[0], UN_MOUTH[1], 1.0, 0);
  const corners = [[UN_HX - 205, UN_RIM - 10], [UN_HX + 205, UN_RIM - 10], [UN_HX - 150, UN_RIM - 30], [UN_HX + 150, UN_RIM - 30]];
  unRigging(ctx, [UN_MOUTH[0], UN_MOUTH[1] + 30], corners, 1);
  unBasketBack(ctx, UN_HX, UN_RIM, 1);
  let hr = null;
  if (o.hero) hr = unHero(cam, t, Object.assign({ x: UN_HX, y: UN_HY, s: 1 }, o.hero));
  applyCam(cam);
  unBasketFront(ctx, UN_HX, UN_RIM, 1, { sign: o.sign, frost: o.frost || 0 });
  unLantern(ctx, UN_HX + 196, UN_RIM - 96, 1, o.lamp || 0, t);
  if (o.card) unYearCard(ctx, UN_CARD_RIM[0], UN_CARD_RIM[1], 0.8, o.card);
  if (o.clockRim) {
    const k = o.clockRim;
    unClock(ctx, UN_CLOCK_RIM[0], UN_CLOCK_RIM[1], 0.8, t, k);
    if ((k.ring || 0) > 0.02) unRingArcs(UN_CLOCK_RIM[0], UN_CLOCK_RIM[1], 0.8, t, k.ring);
  }
  if (hr && (o.beard || 0) > 2) unBeard(ctx, hr.head[0], hr.head[1], 1, o.beard, t, o.beardSway || 0);
  if (o.clockHand) {
    const k = o.clockHand;
    unClock(ctx, k.x, k.y, k.s, t, k);
  }
  if (o.after) o.after(cam, hr, S);
  return { hr, S };
}
// the SOUTH POLE: a striped pole sticking out of the cloud sea with its sign (between the far and the nearest deck)
function unSignpost(cam, t) {
  applyCam(cam);
  const x = 196, top = 1060, bot = 1720;
  rrect(ctx, x - 13, top, 26, bot - top, 10); ctx.fillStyle = '#F4F1EA'; ctx.fill();
  paint(() => {
    ctx.save(); rrect(ctx, x - 13, top, 26, bot - top, 10); ctx.clip();
    for (let y = top - 40; y < bot; y += 56) { ctx.beginPath(); ctx.moveTo(x - 20, y); ctx.lineTo(x + 20, y - 20); ctx.lineTo(x + 20, y + 8); ctx.lineTo(x - 20, y + 28); ctx.closePath(); ctx.fillStyle = '#E5383B'; ctx.fill(); }
    ctx.restore();
  });
  circle(ctx, x, top - 8, 20, '#FFD447');
  const sw = 0.03 * Math.sin(t * loopW(1.3));
  ctx.save(); ctx.translate(x, top + 40); ctx.rotate(sw);
  rrect(ctx, -150, 0, 300, 132, 16); ctx.fillStyle = '#20345E'; ctx.fill();
  ctx.lineWidth = 7; ctx.strokeStyle = '#E9C46A'; ctx.stroke();
  paint(() => {
    ctx.font = '400 56px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFE6A8';
    ctx.fillText('SOUTH POLE', 0, 48);
    ctx.font = '900 26px Montserrat'; ctx.fillStyle = '#9FE8F0'; ctx.fillText('URANUS', 0, 100);
  });
  ctx.restore();
}

// ================================================================ HOOK: your night lasts eight hours.
// CU, eye level, him LEFT of centre in the basket, the clock held up beside his face on the RIGHT (its display: 8 HOURS);
// he winds its knob; the Sun sinks on the far cloud edge behind him on the left. Valid at negative time (the loop).
const UN_HOOK_CAM = { x: 600, y: 1075, zoom: 2.2 };
const UN_HCLOCK = { x: 728, y: 1090, s: 0.8 };
function unHookDraw(tt, o = {}) {
  const c = cu();
  const cam = Object.assign({}, UN_HOOK_CAM, { zoom: UN_HOOK_CAM.zoom + 0.05 * E.inOutSine(clamp(tt / 1.9)) });
  // he winds the knob (his right hand jiggles on it), then holds the clock up proudly on "hours"
  const wind = tt < c.hours ? Math.sin(tt * loopW(9)) : 0;
  const lift = ramp(tt, c.hours - 0.2, c.hours + 0.15, E.outBack);
  const cy = UN_HCLOCK.y - 10 * lift, cx = UN_HCLOCK.x;
  const face = o.face || unFaceAt([[-9, UF.smug], [c.hours - 0.1, UF.proud]], tt);
  const sway = 3 * Math.sin(tt * loopW(1.7));
  unPoleScene(cam, tt, {
    sky: { sunUp: 0.62, night: 0, stars: 0.25 },
    hero: { face, headRot: -0.04 + 0.03 * lift, capSw: 4 * Math.sin(tt * loopW(1.3)),
      armR: { e: [726, 1176], w: [cx + 56 + 6 * wind, cy - 104 + 5 * wind] }, handR: 'fist',
      armL: { e: [570, 1164], w: [cx - 66, cy - 40 + sway] }, handL: 'open' },
    clockHand: { x: cx, y: cy + sway, s: UN_HCLOCK.s, txt: o.txt || '8/HOURS', from: o.from, flip: o.flip },
    lamp: 0,
  });
  return cam;
}
SC.hook = (lt, t, shot) => { unHookDraw(t); return { glow: 0.85 }; };
SC.loop = (lt, t, shot) => { unHookDraw(t - TLd.duration); return { glow: 0.85 }; };

// ================================================================ HOOK_B: On Uranus?
// WIDE, LOW angle: the whole balloon over the pole at sunset against the sky, the rings low over the far clouds, a moon; the
// SOUTH POLE signpost sticks out of the cloud sea; he turns to us with a puzzled look on "Uranus".
SC.hook_b = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 548, y: 900 + 30 * ramp(lt, 0, D, E.inOutSine), zoom: 0.84 + 0.03 * ramp(lt, 0, D, E.inOutSine) };
  const face = unFaceAt([[-9, UF.proud], [c.uranus, UF.huh]], t);
  unPoleScene(cam, t, {
    dy: 400, env: true, pole: true,
    sky: { sunUp: 0.55, night: 0, stars: 0.3, moonAt: [902, 1010] },
    hero: { face, headRot: 0.06 * ramp(t, c.uranus, c.uranus + 0.2), capSw: 5 * Math.sin(t * loopW(1.3)),
      armR: { e: [700, 1180], w: [UN_HCLOCK.x + 50, UN_HCLOCK.y - 100] }, handR: 'fist',
      armL: { e: [560, 1165], w: [UN_HCLOCK.x - 66, UN_HCLOCK.y - 40] }, handL: 'open' },
    clockHand: { x: UN_HCLOCK.x, y: UN_HCLOCK.y, s: UN_HCLOCK.s, txt: '8/HOURS' },
  });
  return { glow: 0.85 };
};

// ================================================================ YEARS: Forty-two years.
// EXTREME CLOSE-UP: the clock's display slams over to 42 YEARS; his eyes pop beside it.
SC.years = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 616, y: 1022, zoom: 2.85 + 0.12 * ramp(lt, 0, D, E.inOutSine) };
  const flip = clamp((t - c.flip42) / 0.16);
  const face = unFaceAt([[-9, UF.huh], [c.flip42 + 0.08, UF.pop]], t);
  const jolt = snapRamp(t, c.flip42 + 0.05, c.flip42 + 0.3, { over: 1.8 });
  unPoleScene(cam, t, {
    sky: { sunUp: 0.5, night: 0, stars: 0.25 },
    hero: { face, headRot: -0.05 * jolt, headDY: -8 * jolt, capSw: 10 * jolt,
      armR: { e: [712, 1172], w: [UN_HCLOCK.x + 56, UN_HCLOCK.y - 104] }, handR: 'fist',
      armL: { e: [560, 1160], w: [UN_HCLOCK.x - 66, UN_HCLOCK.y - 40] }, handL: 'open' },
    clockHand: { x: UN_HCLOCK.x, y: UN_HCLOCK.y, s: UN_HCLOCK.s, txt: '42/YEARS', from: '8/HOURS', flip },
  });
  // a burst behind the display as it lands
  const sp = toScreen(cam, UN_HCLOCK.x, UN_HCLOCK.y - 60);
  shockLines(sp[0], sp[1], 250, inv(c.flip42 + 0.1, c.flip42 + 0.5, t), 12, '#FFE9A8', 4);
  return { glow: 0.85 };
};

// ================================================================ ANSWER + SIDE: the whole planet is lying on its SIDE.
// EXTREME WIDE in space: Uranus, upright, asleep on a pillow, his tiny balloon on its top pole; it topples (a wind-up and an
// overshoot) onto its side. SIDE: MEDIUM, closer: it lands (hitstop), rings upright, TIPPED 98 degrees, his balloon sticks
// out of its side ("!"), it snores on.
const UN_PL = [540, 820];
function unPlanetScene(cam, t, o = {}) {
  const c = cu();
  sbSpaceBg(cam, t, { sun: true, sunAt: [112, 520], sunR: 26 });
  applyCam(cam);
  const k = snapRamp(t, c.tip, c.flop, { over: 1.22, pre: 0.18, ant: 0.06 });
  const tilt = (Math.PI / 2) * k * (98 / 90);
  const R = o.R || 300;
  pePillow(UN_PL[0], UN_PL[1] + R * 0.98, R * 0.95, 1);
  const thud = clamp(1 - (t - c.flop) / 0.25) * (t > c.flop ? 1 : 0);
  unPlanet(UN_PL[0], UN_PL[1] + 10 * thud, R, t, { tilt, light: Math.PI + 0.35, night: 0.55, face: 'sleep', faceO: {}, balloon: 1, balloonS: o.bs || 0.13, rings: 1 });
  // the pillow's front squash under it
  return { tilt, R, thud };
}
SC.answer = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 540, y: 860, zoom: 1.0 + 0.04 * ramp(lt, 0, D, E.inOutSine) };
  unPlanetScene(cam, t, { R: 290 });
  screenSpace();
  zzz(700, 520, t, shot.start + 0.1, 0.9 * (1 - ramp(t, c.tip - 0.2, c.tip)), 1.0);
  return { glow: 0.9 };
};
SC.side = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 640, y: 830, zoom: 1.32 + 0.04 * ramp(lt, 0, D, E.inOutSine) };
  const st = unPlanetScene(cam, t, { R: 290 });
  // TIPPED 98 deg, and a "!" over his balloon when it lands
  const tagK = popK(t, c.flop + 0.1, shot.end + 1, 0.16, 0.1);
  unTag(540, 560, 'TIPPED OVER: 98°', '#7FE9FF', tagK, 50);
  const bp = toScreen(cam, UN_PL[0] + 290 + 40, UN_PL[1] - 150);
  bigWord('!', bp[0], bp[1], 120, '#FFD447', E.outBack(popK(t, c.flop + 0.05, c.flop + 0.9, 0.12, 0.12)));
  screenSpace();
  zzz(420, 640, t, c.flop + 0.35, 0.9, 1.0);
  return { glow: 0.9 };
};

// ================================================================ ORBIT: so as it rolls around the Sun,
// WIDE, HIGH angle: the Sun in the middle, the planet on its side rolling round its orbit, its pole always pointing the same
// way (right); YOU at the pole.
SC.orbit = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 540, y: 900, zoom: 0.98 + 0.05 * ramp(lt, 0, D, E.inOutSine) };
  sbSpaceBg(cam, t, { sun: false });
  const phi = Math.PI * lerp(1.02, 0.68, ramp(t, shot.start, shot.end + 0.2, (x) => x));
  const [px, py, R] = unOrbit(cam, t, { rx: 400, ry: 175, R: 92, phi, face: 'sleep', balloonS: 0.06, sunR: 50 });
  const yp = toScreen(cam, px + R * 1.5, py - R - 30);
  unTag(yp[0], yp[1] - 20, 'YOU', '#FFD447', popK(t, shot.start + 0.15, shot.end + 1, 0.16, 0.1), 40);
  const sp = toScreen(cam, UN_SUN[0], UN_SUN[1] - 120);
  unTag(sp[0], sp[1], 'SUN', '#FFB86A', popK(t, c.sun - 0.1, shot.end + 1, 0.16, 0.1), 36);
  return { glow: 0.95 };
};

// ================================================================ POLE: your pole turns away
// MEDIUM, eye level, riding with the planet: the Sun swings from the right over the top to the left, the shadow sweeps across
// the globe and over his pole; his balloon's lantern clicks on.
SC.pole = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 540, y: 900, zoom: 1.0 };
  sbSpaceBg(cam, t, { sun: false });
  const sweep = ramp(t, c.pole - 0.15, c.away_end + 0.1, E.inOutSine);
  const la = lerp(-0.12, -Math.PI + 0.12, sweep);
  const cx = 360, cy = 930, R = 330;
  // the Sun, far off, on a circle round the planet in the direction of its light
  screenSpace();
  const sx = cx + Math.cos(la) * 760, sy = cy + Math.sin(la) * 760;
  softDot(ctx, sx, sy, 300, '#FFB86A', 0.22); softDot(ctx, sx, sy, 110, '#FFE2A8', 0.6); circle(ctx, sx, sy, 34, '#FFFBEE');
  softDot(gctx, sx, sy, 180, '#FFE2A8', 0.9); softDot(gctx, sx, sy, 60, '#FFFFFF', 0.9);
  applyCam(cam);
  const lamp = ramp(t, c.away_end - 0.05, c.away_end + 0.08);
  unPlanet(cx, cy, R, t, { tilt: Math.PI / 2, light: la, night: 0.9, face: 'sleep', balloon: 1, balloonS: 0.3, lamp, rings: 1 });
  const lp = [cx + R + 150, cy - 120];
  unTag(lp[0] - 30, 560, 'YOU', '#FFD447', popK(t, shot.start + 0.05, shot.end + 1, 0.12, 0.1), 40);
  return { glow: 0.95 };
};

// ================================================================ HALFTRIP: for half the trip.
// WIDE, straight down on the orbit: the planet rides into the right half of its lap, which paints itself navy: NIGHT.
SC.halftrip = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 540, y: 880, zoom: 0.96 + 0.04 * ramp(lt, 0, D, E.inOutSine) };
  sbSpaceBg(cam, t, { sun: false });
  const u = ramp(t, shot.start, c.trip1_end + 0.25, E.inOutSine);
  const phi = lerp(-0.42 * Math.PI, 0.44 * Math.PI, u);
  unOrbit(cam, t, { rx: 360, ry: 330, R: 84, phi, face: 'sleep', balloonS: 0.06, sunR: 48, nightArc: u * 0.97, lamp: 1 });
  unTag(540 + 360 + 10 - 70, 880 - 410, 'NIGHT', '#8FA8FF', popK(t, c.half1, shot.end + 1, 0.16, 0.1), 44);
  return { glow: 0.95 };
};

// ================================================================ TRIP: One trip takes eighty-four years.
// MEDIUM: a lap counter over the orbit while the planet whizzes round once; cut_84: CU on the counter as it lands on 84.
SC.trip = (lt, t, shot) => {
  const c = cu();
  const close = t >= c.cut_84;
  const cam = close ? { x: 540, y: 800, zoom: 1.3 } : { x: 540, y: 960, zoom: 0.92 };
  sbSpaceBg(cam, t, { sun: false });
  const u = ramp(t, c.one - 0.05, c.lap_end, E.inOutSine);
  const phi = Math.PI * 0.5 + u * Math.PI * 2;
  unOrbit(cam, t, { rx: 400, ry: 170, R: 74, phi, face: 'sleep', balloonS: 0.05, sunR: 46 });
  // the trail behind it
  screenSpace();
  const n = Math.round(lerp(0, 84, u));
  const sz = close ? 320 : 190, yy = close ? 600 : 650;
  const land = popK(t, c.lap_end - 0.02, shot.end + 1, 0.12, 0.1);
  bigWord(String(n), 540, yy, sz * (1 + 0.12 * Math.sin(Math.PI * clamp((t - c.lap_end) / 0.25)) * (t > c.lap_end ? 1 : 0)), n >= 84 ? '#FFD447' : '#FFFFFF', 1);
  bigWord('YEARS', 540, yy + sz * 0.72, sz * 0.36, '#FFD447', 1);
  unTag(540, 480, 'ONE TRIP ROUND THE SUN', '#7FE9FF', popK(t, shot.start + 0.1, shot.end + 1, 0.16, 0.1) * (close ? 0 : 1), 36);
  void land;
  return { glow: 0.95 };
};

// ================================================================ HALF: Half of that...
// WIDE: the lap in two halves: 42 YEARS DAY (gold, left) and 42 YEARS NIGHT (navy, right); the night half lights up.
SC.half = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 540, y: 900, zoom: 0.95 + 0.04 * ramp(lt, 0, D, E.inOutSine) };
  sbSpaceBg(cam, t, { sun: false });
  const dayK = ramp(t, shot.start, shot.start + 0.3);
  const nightK = ramp(t, c.night_on - 0.1, c.night_on + 0.3);
  unOrbit(cam, t, { rx: 400, ry: 175, R: 80, phi: 0.05, face: 'sleep', balloonS: 0.06, sunR: 50, day: dayK, nightArc: nightK, lamp: 1 });
  screenSpace();
  bigWord('42', 280, 600, 140, '#FFD447', E.outBack(popK(t, shot.start + 0.05, shot.end + 1, 0.16, 0.1)));
  unTag(280, 705, 'YEARS DAY', '#FFD447', popK(t, shot.start + 0.1, shot.end + 1, 0.16, 0.1), 36);
  bigWord('42', 800, 600, 140, '#9FB4FF', E.outBack(popK(t, c.night_on, shot.end + 1, 0.16, 0.1)));
  unTag(800, 705, 'YEARS NIGHT', '#9FB4FF', popK(t, c.night_on + 0.05, shot.end + 1, 0.16, 0.1), 36);
  return { glow: 0.95 };
};

// ================================================================ DARK: in the DARK.
// CU, LOW angle, him RIGHT: he watches the last sliver of the Sun sink on the left; on DARK it's gone: CLICK, night, his
// eyes wide in the dark, the lantern on.
SC.dark = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 452, y: 1050, zoom: 2.2 + 0.05 * ramp(lt, 0, D, E.inOutSine) };
  const gone = t >= c.click;
  const sunUp = gone ? 0 : lerp(0.32, 0.06, ramp(t, shot.start, c.click, (x) => x));
  const face = gone ? unFaceAt([[c.click, UF.dark], [c.click + 0.5, Object.assign({}, UF.dark, { lookX: 0.4 })]], t) : UF.watch;
  unPoleScene(cam, t, {
    dy: 150,
    sky: { sunUp, night: gone ? 1 : 0.15, stars: gone ? 1 : 0.4 },
    deck: { night: gone ? 0.85 : 0.1 },
    hero: { face, headRot: gone ? 0 : -0.05, capSw: 3 * Math.sin(t * loopW(1.3)),
      armR: { e: [650, 1240], w: [640, 1262] }, armL: { e: [430, 1240], w: [452, 1262] }, handR: 'open', handL: 'open' },
    lamp: gone ? ramp(t, c.click + 0.12, c.click + 0.2) : 0,
  });
  return { glow: 0.9 };
};

// ================================================================ NIGHT: It's been night there since two thousand seven...
// MEDIUM, HIGH angle: asleep, leaning on the rim, snoring; the clock on the rim on the left, the year card (2007) on the
// right; the stars; the lantern.
const UN_SLEEP = { face: UF.sleep, headRot: 0.32, headDY: 26, lean: 0.06,
  armR: { e: [626, 1262], w: [520, 1256] }, armL: { e: [452, 1262], w: [560, 1252] }, handR: 'open', handL: 'open' };
SC.night = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 545, y: 1150 - 20 * ramp(lt, 0, D, E.inOutSine), zoom: 1.6 };
  const breathe = Math.sin(t * loopW(1.1));
  unPoleScene(cam, t, {
    dy: -150,
    sky: { night: 1, stars: 1, sunUp: 0, sun: null, moonAt: [300, 980] },
    deck: { night: 0.9 },
    hero: Object.assign({}, UN_SLEEP, { headDY: 26 + 3 * breathe, capSw: 2 * breathe }),
    lamp: 1, card: { year: 2007 }, clockRim: { txt: '42/YEARS' },
  });
  screenSpace();
  const hp = toScreen(cam, 600, 990);
  zzz(hp[0], hp[1], t, shot.start + 0.05, 0.95, 1.1);
  const tag = toScreen(cam, UN_CARD_RIM[0], UN_CARD_RIM[1] - 150);
  unTag(tag[0], tag[1] - 30, 'SUNSET', '#FF9A3C', popK(t, c.two - 0.1, shot.end + 1, 0.16, 0.1), 34);
  return { glow: 0.9 };
};

// ================================================================ LAPSE: and sunrise? Twenty forty-nine.
// WIDE, eye level: the time-lapse. The stars wheel round the pole, the years race 2007 -> 2049, his beard grows down the
// basket, frost and snow pile up, the moon crosses; the year slams on 2049; then silence, and the far edge starts to glow.
SC.lapse = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const u = ramp(t, c.lapse0, c.y2049, E.inOutSine);
  const cam = { x: 540, y: 1010 - 30 * ramp(lt, 0, D, E.inOutSine), zoom: 0.8 + 0.06 * ramp(lt, 0, D, E.inOutSine) };
  const dawn = 0.55 * ramp(t, c.fortynine_end + 0.05, shot.end, E.inCubic);
  const year = Math.round(lerp(2007, 2049, u));
  unPoleScene(cam, t, {
    dy: 60, env: true,
    sky: { night: 1 - 0.3 * dawn, dawn, stars: 1, trails: u, sun: null, moonAt: [lerp(980, 140, u), lerp(990, 900, u)] },
    deck: { night: 0.85 * (1 - 0.4 * dawn), dawn: dawn * 0.6 }, deckT: t + 30 * u,
    hero: Object.assign({}, UN_SLEEP, { old: u > 0.55 }),
    lamp: 1 - 0.3 * u, card: { year, frost: u }, clockRim: { txt: '42/YEARS', frost: u, web: u }, frost: u,
    beard: 560 * u, beardSway: 0.05 * Math.sin(t * loopW(1.5)),
  });
  screenSpace();
  const hp = toScreen(cam, 600, 990);
  zzz(hp[0], hp[1], t * 2.2, shot.start * 2.2, 0.9 * (1 - ramp(t, c.fortynine_end, shot.end)), 0.9);
  // the year, big: racing, then slammed on 2049
  const slam = t >= c.y2049;
  const sk = slam ? 1 + 0.35 * Math.exp(-(t - c.y2049) * 10) : 1;
  bigWord(String(year), 540, 640, 170 * sk, slam ? '#FFD447' : '#FFFFFF', 1);
  unTag(540, 760, slam ? 'SUNRISE' : 'YEAR', slam ? '#FFD447' : '#BFD8FF', 1, 36);
  return { glow: 0.9 };
};

// ================================================================ RING: (the first ray, the bell)
// EXTREME CLOSE-UP on the frosted, cobwebbed clock on the rim: the first ray of 2049 hits it, it RINGS (the biggest hit),
// frost and snow fly off it.
SC.ring = (lt, t, shot) => {
  const c = cu();
  const cam = { x: 392, y: 1176, zoom: 3.1 };
  const ring = t >= c.ring ? 1 : 0;
  const shake = ring ? 1 : 0;
  unPoleScene(cam, t, {
    dy: 40,
    sky: { night: 0.45, dawn: 0.9, stars: 0.3, sunUp: 0.35, sun: [210, 1070] },
    deck: { night: 0.35, dawn: 0.9 },
    hero: Object.assign({}, UN_SLEEP, { old: true }),
    lamp: 0.5, card: { year: 2049, frost: 1 }, clockRim: { txt: '42/YEARS', frost: 1 - 0.6 * ramp(t, c.ring, c.ring + 0.4), web: 1 - ramp(t, c.ring, c.ring + 0.3), ring },
    frost: 1, beard: 560,
  });
  // the first ray across the frame from the left
  screenSpace();
  const g = ctx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, 'rgba(255,200,120,0.55)'); g.addColorStop(0.6, 'rgba(255,200,120,0.12)'); g.addColorStop(1, 'rgba(255,200,120,0)');
  ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.globalAlpha = ramp(t, c.peek, c.peek + 0.15);
  ctx.beginPath(); ctx.moveTo(0, 700); ctx.lineTo(W, 860); ctx.lineTo(W, 1060); ctx.lineTo(0, 980); ctx.closePath(); ctx.fill(); ctx.restore();
  const cp = toScreen(cam, UN_CLOCK_RIM[0], UN_CLOCK_RIM[1] - 70);
  shockLines(cp[0], cp[1], 300, inv(c.ring, c.ring + 0.45, t), 14, '#FFE9A8', 7);
  void shake;
  return { glow: 0.9 };
};

// ================================================================ BUTTON: Morning... Grandpa.
// MEDIUM-CLOSE, him centre: he jerks bolt upright, a white beard down past the basket, grey hair; dazed on "Morning...";
// on "Grandpa." he looks down at the beard, then back at us, deadpan. The Sun is up on the left.
const UN_BTN_CAM = { x: 540, y: 1120, zoom: 1.7 };
function unButtonDraw(t) {
  const c = cu();
  const up = snapRamp(t, c.slap, c.slap + 0.22, { over: 1.6, pre: 0.06, ant: 0.04 });
  const face = unFaceAt([[-9, UF.wake], [c.morning, UF.dazed], [c.look, UF.down], [c.grandpa_end - 0.05, UF.deadpan]], t);
  const armUp = 1 - ramp(t, c.slap + 0.35, c.morning + 0.1);
  const pose = lerpPose(POSES.stand, POSES.flinch, 0.9 * armUp * clamp(up));
  const nod = popK(t, c.look, c.grandpa_end - 0.08, 0.12, 0.14);     // he looks down at the beard, then back up at us
  unPoleScene(UN_BTN_CAM, t, {
    dy: 30,
    sky: { night: 0.1, dawn: 0.75, stars: 0.15, sunUp: 0.75 + 0.15 * ramp(t, c.slap, c.grandpa), sun: [236, 1060] },
    deck: { night: 0.1, dawn: 0.75 },
    hero: { face, pose, old: true, headDY: 12 * (1 - clamp(up)) + 16 * nod, headRot: 0.02 * Math.sin(t * loopW(2.3)) + 0.06 * nod, capSw: 14 * Math.exp(-Math.max(0, t - c.slap) * 3) * Math.cos((t - c.slap) * 12) + 6 * nod },
    lamp: 0.2, card: { year: 2049, frost: 1 }, clockRim: { txt: '42/YEARS', frost: 0.4, ring: 1 - ramp(t, c.slap, c.slap + 0.05) }, frost: 1,
    beard: 560, beardSway: 0.12 * Math.exp(-Math.max(0, t - c.slap) * 2.5) * Math.sin((t - c.slap) * 9),
  });
}
SC.button = (lt, t, shot) => { unButtonDraw(t); return { glow: 0.85 }; };

// ================================================================ the cover (cover.sh): asleep, bearded, the 42-YEAR NIGHT
SC.cover = (lt, t, shot) => {
  const cam = { x: 545, y: 1050, zoom: 1.45 };
  unPoleScene(cam, 3, {
    dy: -120,
    sky: { night: 1, stars: 1, sun: null, moonAt: [300, 980] },
    deck: { night: 0.9 },
    hero: Object.assign({}, UN_SLEEP, { old: true }),
    lamp: 1, card: { year: 2049, frost: 0.8 }, clockRim: { txt: '42/YEARS', frost: 0.8, web: 0.8 }, frost: 0.8, beard: 560,
  });
  bigWord('42-YEAR', 540, 520, 180, '#FFD447', 1, -0.03);
  bigWord('NIGHT', 540, 705, 215, '#FFFFFF', 1, -0.03);
  return { glow: 0.9, noCaptions: true };
};

function initScenes2() {
  unInit();
}
