// There's a GALAXY in Your Sky Wider Than the Moon 🌌 Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt =
// seconds inside the shot, t = seconds in the video) and returns post options for main.js. Every beat comes from a cue:
// cu().name (timeline.json), never a typed-in time.
// THE CURIOUS KIND (story.md §6): the hero goes there. On a hilltop camp at night he looks up through his camera goggles at
// the Andromeda galaxy, drawn at its true size beside the Moon (nearly six Moons long); flipped up, his own eyes see a
// smudge; his eye grabs light for a blink, the camera for minutes; the galaxy blooms back; six Moons are lined up across
// it; its light left 2.5 million years ago, long before people; and he says sorry to the Moon.
// The running device: the Moon, a character (direction.md rule 5): proud on frame 0, a side-eye at the giant on "Moon.",
// measured by its own clones (squished on SIX), and it sulks under a cloud on the button (back to proud for the loop).
'use strict';

const cu = () => TLd.cues;
const r2 = (t, a, b, e = E.inOutCubic) => ramp(t, a, b, e);

// ---------------------------------------------------------------- the light of each place
// moonlight from the upper left (cool), the galaxy's glow as a violet-white rim from the right; the set falls off gently
const L_CAMP = { ...LIGHTS.night, pool: 0.34, poolTint: [0.42, 0.44, 0.86], rimFrom: [0.85, -0.45], rim: [0.86, 0.78, 1.0], rimAmt: 1.15, halo: 0.08, haloColor: [0.75, 0.7, 1.0] };
const L_EYE = { ...LIGHTS.night, pool: 0.12, rimAmt: 0.6, halo: 0 };
const L_SKY = { ...LIGHTS.diagram, pool: 0.12, rimAmt: 0.9 };
const L_SPACE = { ...LIGHTS.night, pool: 0.15, rimAmt: 0.7, halo: 0 };
setLights({
  hook: L_CAMP, wide: L_CAMP, answer: L_CAMP, squint: L_CAMP, blink: L_EYE, rec: L_CAMP, bloom: L_CAMP,
  line: L_SKY, count: L_SKY, six: L_SKY, trip: L_SPACE, timeline: L_SPACE, button: L_CAMP, loop: L_CAMP, cover: L_CAMP,
});

// ---------------------------------------------------------------- him (any place)
// A: {x, y, s, pose, face, lean, armL/armR {e, w} (WORLD points), hand, handL, handR, gog (gxGoggles options), headRot,
//     headDX, headDY, redrawL / redrawR (draw that forearm and hand again over his head: a hand at his goggles), post}
function gxHero(cam, t, A) {
  const st = { x: A.x, y: A.y, s: A.s || 1, seed: 3, headDX: A.headDX || 0, headDY: A.headDY || 0, headRot: A.headRot || 0 };
  let pose = JSON.parse(JSON.stringify(A.pose || POSES.stand));
  if (A.lean != null) pose.lean = A.lean;
  if (A.armR) pose = armAt(pose, 'R', ikLocal(st, A.armR.e[0], A.armR.e[1]), ikLocal(st, A.armR.w[0], A.armR.w[1]));
  if (A.armL) pose = armAt(pose, 'L', ikLocal(st, A.armL.e[0], A.armL.e[1]), ikLocal(st, A.armL.w[0], A.armL.w[1]));
  if (A.hand) pose.hand = A.hand;
  if (A.handR) pose.handR = A.handR;
  if (A.handL) pose.handL = A.handL;
  st.pose = pose; st.face = A.face || FACES.calm;
  applyCam(cam);
  const r = charLayer(cam, st, t, { pal: PAL, post: (lc, rr, s2) => {
    if (A.gog) gxGoggles(lc, s2, rr, Object.assign({ t }, A.gog));
    for (const k of ['L', 'R']) {
      if (!A['redraw' + k]) continue;
      actor(() => {
        lc.save(); lc.translate(s2.x, s2.y); lc.scale(s2.s, s2.s);
        const el = rr['el' + k], wr = rr['wr' + k], d = rr['armDir' + k];
        capsuleShaded(lc, el, wr, 38, PAL.coat, PAL.coatSh, PAL.coatHi, PAL);
        line(lc, wr[0] - d[0] * 6, wr[1] - d[1] * 6, wr[0] + d[0] * 2, wr[1] + d[1] * 2, 42, PAL.coatSh);
        drawHand(lc, wr, d, pose['hand' + k] || pose.hand || 'open', PAL, k === 'L' ? -1 : 1, t);
        lc.restore();
      });
    }
    if (A.post) A.post(lc, rr, s2);
  } });
  // cut him out of the glow layer: no star or bulb shines through him
  gctx.save(); gctx.setTransform(1, 0, 0, 1, 0, 0); gctx.globalCompositeOperation = 'destination-out';
  gctx.drawImage(layerC, 0, 0, W / 2, H / 2); gctx.restore();
  applyCam(cam);
  return { st, r };
}
// his head centre on screen
const heroHeadS = (cam, A) => toScreen(cam, A.x + (A.headDX || 0) * (A.s || 1), A.y - 470 * (A.s || 1) + (A.headDY || 0) * (A.s || 1));
const HF = {
  awe: Object.assign({}, FACES.startled, { mouth: 'o', mouthOpen: 0.75, browY: 1.25, browTilt: 0.2, lookX: 0.2, lookY: -1 }),
  huh: Object.assign({}, FACES.confused, { lookX: 0.45, lookY: -1, browY: 0.9, browTilt: 0.9, mouth: 'wavy', mouthOpen: 0.3 }),
  squint: Object.assign({}, FACES.annoyed, { lookX: 0.45, lookY: -1, blink: 0.5, squeeze: 0.5, browY: -0.4, browTilt: -0.7, mouth: 'flat', mouthOpen: 0.1 }),
  slits: Object.assign({}, FACES.annoyed, { lookX: 0.45, lookY: -1, blink: 0.8, squeeze: 1, browY: -0.7, browTilt: -0.9, mouth: 'grimace', mouthOpen: 1 }),
  set: Object.assign({}, FACES.grin, { mouthOpen: 0.35, browY: 0.6, browTilt: -0.3, lookX: 0.2, lookY: -0.6 }),
  wow: Object.assign({}, FACES.startled, { mouth: 'o', mouthOpen: 0.95, browY: 1.5, lookX: -0.1, lookY: -1 }),
  grin: Object.assign({}, FACES.grin, { mouthOpen: 0.7, browY: 0.7, lookX: -0.3, lookY: -0.4 }),
  sheep: Object.assign({}, FACES.grin, { lookX: -0.8, lookY: -0.7, browY: 0.9, browTilt: 0.85, mouthOpen: 0.45 }),
};

// ---------------------------------------------------------------- the sky as one call (sky camera sk in sky space)
// o: {hz, e (exposure), moon (gxMoon face options; false: no Moon), bats, starsA}
function gxSky(sk, t, o = {}) {
  const hz = o.hz != null ? o.hz : 2400;
  gxSkyGrad(hz);
  gxStars(sk, t, { hz, a: o.starsA });
  if (o.bats) { screenSpace(); wkFlock(t, Object.assign({ n: 5, s: 0.9, draw: gxBat, seed: 4 }, o.bats)); }
  const gp = toScreen(sk, GXS.gal[0], GXS.gal[1]);
  if (o.gal !== false) gxGalaxy(gp[0], gp[1], sk.zoom, GXS.galAng, o.e != null ? o.e : 1, { glow: o.glow });
  const mp = toScreen(sk, GXS.moon[0], GXS.moon[1]);
  if (o.moon !== false) gxMoon(mp[0], mp[1], GXS.moonR * sk.zoom, t, o.moon || {});
  return { gp, mp };
}

// ================================================================ HOOK: frame 0. CU, eye level, him left of centre
const HK_CAM = { x: 474, y: 1430, zoom: 2.9 };            // his head (world 440, 1430) lands at (440, 960)
const HK_SK = { x: 391.7, y: 993.3, zoom: 1.2 };          // the galaxy's middle at (790, 800), the Moon at (353, 440)
const HK_A = { x: 440, y: 1900, s: 1 };
// the hook's picture as a function of tt = seconds since the video started (negative: the loop's lead-in)
function gxHookDraw(tt) {
  const c = cu();
  const pz = 0.1 * E.inOutSine(clamp(tt / 2.0));
  const cam = Object.assign({}, HK_CAM, { zoom: HK_CAM.zoom + pz, y: HK_CAM.y - 8 * pz });
  const sk = Object.assign({}, HK_SK, { zoom: HK_SK.zoom + 0.02 * pz, y: HK_SK.y + 10 * pz });
  gxSky(sk, tt, { hz: 1900, e: 1, moon: { face: 'proud', look: [0.4, 0.2] } });
  gxValley(tt, { hz: 1440, ms: 0.85, dx: 160, moonX: 300 });
  // the focus twist: his left hand at the left lens, turning it a little (mid-action from frame 0)
  const tw = Math.sin(tt * loopW(2.6)) * 0.5 + 0.5;
  const wr = [HK_A.x - 70 + 4 * tw, 1452 + 6 * tw], el = [HK_A.x - 150, 1640];
  const glint = c.glint != null ? r2(tt, c.glint, c.glint + 0.4) : 0;
  gxHero(cam, tt, Object.assign({}, HK_A, { face: HF.awe, armL: { e: el, w: wr }, handL: 'open', redrawL: true,
    gog: { up: 0, refl: 1, glint, fill: 0.15 } }));
  return cam;
}
SC.hook = (lt, t, shot) => { gxHookDraw(t); return { glow: 0.85 }; };
SC.loop = (lt, t, shot) => { gxHookDraw(lt - (shot.end - shot.start)); return { glow: 0.85 }; };

// ================================================================ WIDE: LOW angle, him small on the crest under the whole sky
SC.wide = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, u = E.inOutSine(clamp(lt / D));
  const sk = { x: 540, y: 960 - 20 * u, zoom: 1.0 + 0.04 * u };
  const side = r2(t, c.side, c.side + 0.25);
  gxSky(sk, t, { hz: 1480, e: 1, moon: { face: side > 0.5 ? 'side' : 'proud', look: [lerp(0.3, 1, side), lerp(0.2, 0.5, side)] },
    bats: { t0: shot.start - 0.2, t1: shot.end + 0.6, x0: -120, y0: 520, x1: 1200, y1: 400 } });
  const cam = { x: 540, y: 960 - 10 * u, zoom: 1.0 + 0.03 * u };
  applyCam(cam);
  gxPine(ctx, 900, 1490, 360, 160); gxPine(ctx, 1010, 1495, 460, 190);
  gxHill(ctx, -200, 1300, 1470, t, { tufts: 40, rocks: 5, seed: 7 });
  gxTent(ctx, 190, 1480, 0.62, t);
  gxLantern(ctx, 380, 1478, 0.7, t);
  gxCampProps(ctx, 820, 1600, 0.75, t);
  gxHero(cam, t, { x: 610, y: 1484, s: 0.85, face: HF.awe, gog: { up: 0, refl: 1, fill: 0.15 } });
  return { glow: 0.9, capY: 1530 };
};

// ================================================================ ANSWER: MEDIUM, eye level, him right: goggles UP, the galaxy shrinks
SC.answer = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, u = E.inOutSine(clamp(lt / D));
  const sk = { x: 677.8 - 6 * u, y: 1126.7, zoom: 0.9 };
  const e = 1 - r2(t, c.shrink, c.shrink + 0.5, E.inOutCubic);
  const smirk = t > c.smirk;
  gxSky(sk, t, { hz: 1190, e, moon: { face: smirk ? 'smirk' : 'proud', look: smirk ? [0.8, 0.5] : [0.4, 0.2] } });
  gxValley(t, { hz: 1190, ms: 1.0, dx: -60, moonX: 140, mirrorGal: { x: 470, y: 720, s: 0.9, ang: GXS.galAng, e } });
  const cam = { x: 558 + 4 * u, y: 1469, zoom: 1.55 + 0.04 * u };
  applyCam(cam);
  gxHill(ctx, 200, 1300, 1880, t, { tufts: 18, rocks: 2, seed: 11 });
  // the flip: his right hand comes up to the right lens, pushes the goggles up, and drops again
  const up = snapRamp(t, c.flip, c.flip + 0.28, { pre: 0.08, ant: 0.06, over: 1.4 });
  const reach = popK(t, c.flip - 0.18, c.flip + 0.45, 0.16, 0.25);
  const restE = [790, 1660], restW = [800, 1760], topE = [830, 1520], topW = [745, lerp(1440, 1385, clamp(up))];
  const armR = { e: [lerp(restE[0], topE[0], reach), lerp(restE[1], topE[1], reach)], w: [lerp(restW[0], topW[0], reach), lerp(restW[1], topW[1], reach)] };
  const face = t < c.never + 0.25 ? HF.awe : HF.huh;
  gxHero(cam, t, { x: 700, y: 1900, s: 1, face, armR, handR: 'open', redrawR: reach > 0.3, gog: { up: clamp(up, -0.1, 1.05), refl: 1 - up, fill: 0.15 * (1 - up) } });
  return { glow: 0.85 };
};

// ================================================================ SQUINT: CU, LOW angle: his squint at the smudge, ALL YOU SEE
SC.squint = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const closer = t >= c.cut_dim;
  const u = closer ? E.inOutSine(clamp((t - c.cut_dim) / (shot.end - c.cut_dim))) : E.inOutSine(clamp(lt / (c.cut_dim - shot.start)));
  const sk = closer ? { x: 600 - (770 - 540) / 1.5, y: 860 - (640 - 960) / 1.5 - 6 * u, zoom: 1.5 + 0.05 * u } : { x: 600 - (800 - 540) / 1.25, y: 860 - (680 - 960) / 1.25 - 6 * u, zoom: 1.25 + 0.04 * u };
  gxSky(sk, t, { hz: 2600, e: 0, moon: false });
  const cam = closer ? { x: 590, y: 1462 - 4 * u, zoom: 3.6 + 0.12 * u } : { x: 560, y: 1462, zoom: 2.7 + 0.08 * u };
  const k = r2(t, c.squint, c.just_end, E.inOutSine);
  let face = lerpFace(HF.huh, HF.squint, clamp(lt / 0.5));
  face = lerpFace(face, HF.squint, k);
  if (closer) face = lerpFace(HF.squint, HF.slits, r2(t, c.cut_dim, c.dim, E.inOutSine));
  const sweat = closer ? r2(t, c.dim, c.dim + 0.3) : 0;
  // "Your eyes are just...": he rubs his eyes with both fists (as if that would help), then squints harder
  const rub = closer ? 0 : popK(t, c.squint - 0.06, c.cut_dim - 0.14, 0.16, 0.14);
  let arms = {};
  if (rub > 0.01) {
    const wob = (k) => [7 * Math.cos(t * 19 + k), 6 * Math.sin(t * 19 + k)];
    const mixP = (p, q, k) => [lerp(p[0], q[0], k), lerp(p[1], q[1], k)];
    const wl = wob(0), wr = wob(2.2);
    arms = { armL: { e: mixP([446, 1628], [404, 1600], rub), w: mixP([418, 1713], [508 + wl[0], 1440 + wl[1]], rub) },
             armR: { e: mixP([634, 1628], [676, 1600], rub), w: mixP([662, 1713], [572 + wr[0], 1440 + wr[1]], rub) },
             handL: 'fist', handR: 'fist', redrawL: rub > 0.3, redrawR: rub > 0.3 };
    if (rub > 0.3) face = Object.assign({}, HF.squint, { blink: 1, squeeze: 1, mouth: 'wavy', mouthOpen: 0.4, browY: 0.6, browTilt: 0.8 });
  }
  gxHero(cam, t, Object.assign({ x: 540, y: 1900, s: 1, face, headRot: -0.05, gog: { up: 1, refl: 0 } }, arms, {
    post: sweat > 0.01 ? (lc, rr, s2) => gxOnHead(lc, s2, rr, (x) => sweatDrop(x, 58, -30 + 30 * sweat, 1.3, sweat)) : null }));
  // the smudge: a dashed ring and ALL YOU SEE
  const gp = toScreen(sk, GXS.gal[0], GXS.gal[1]);
  const rk = r2(t, c.ring, c.ring + 0.35, E.outBack);
  if (rk > 0.01) {
    screenSpace();
    paint(() => { ctx.save(); ctx.setLineDash([14, 12]); ctx.lineDashOffset = -t * 30; ctx.lineWidth = 5; ctx.strokeStyle = rgba('#FFFFFF', 0.85 * rk);
      ctx.beginPath(); ctx.arc(gp[0], gp[1], 90 * rk * sk.zoom / 1.25, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); });
    gxTag('ALL YOU SEE', clamp(gp[0] - 20, 250, 790), gp[1] - 150 * sk.zoom / 1.25, '#FFFFFF', rk, 38);
  }
  return { glow: 0.8 };
};

// ================================================================ BLINK: the extreme close-up of his eye
SC.blink = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, u = E.inOutSine(clamp(lt / D));
  const bl = Math.max(popK(t, c.shut, c.open, 0.066, 0.1), 0);
  const sp = (t < c.shut) ? r2(t, c.specks, c.specks + 0.4) : 0;
  const pool = (t > c.specks && t < c.shut) ? ((t - c.specks) * 3.3) % 1 : 0;
  gxEyeECU(t, { cx: 540, cy: 960 - 20 * u, s: 1 + 0.05 * u, blink: bl, look: [0.32, -0.4], pool: E.outCubic(pool) * sp });
  gxSpecks(t, 540 + 0.32 * 70, 960 - 0.4 * 80, sp, { n: 30, rate: 1.6 });
  // the stopwatch: a tenth of a second, over and over
  const wk = r2(t, shot.start + 0.15, shot.start + 0.45, E.outBack);
  const sweep = t < c.shut ? ((t - shot.start) * 2.5) % 1 : 1;
  gxWatch(250, 560, 95, sweep, '0.1 s', wk, '#7FE9FF');
  gxTag('YOUR EYE', 650, 520, '#7FE9FF', r2(t, shot.start + 0.3, shot.start + 0.6, E.outBack), 44);
  // the snap: shut, the specks gone
  if (bl > 0.9) { screenSpace(); shockLines(540, 960, 330, inv(c.shut, c.shut + 0.35, t), 12, '#FFFFFF', 3); }
  return { glow: 0.8 };
};

// ================================================================ REC: MEDIUM-CLOSE, HIGH angle, him left: the camera goggles
function gxRecBack(cam, t) {
  // looking down at the hilltop: grass all the way up, the tent and the lantern behind him, the mug on its rock
  screenSpace();
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#22356A'); g.addColorStop(1, '#14224E');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  applyCam(cam);
  gxHill(ctx, -300, 1400, 700, t, { tufts: 0, rocks: 0, seed: 31 });
  const rnd = mulberry32(57);
  for (let i = 0; i < 70; i++) {   // the grass seen from above: tufts, small flowers and pebbles all over
    const gx = 200 + rnd() * 600, gy = 1100 + rnd() * 820, k = rnd();
    if (k < 0.12) { ellipse(ctx, gx, gy, 14, 9, GX.rock); ellipse(ctx, gx - 3, gy - 3, 8, 5, GX.rockHi); continue; }
    if (k < 0.22) { for (let j = 0; j < 5; j++) circle(ctx, gx + 6 * Math.cos(j * 1.26), gy + 6 * Math.sin(j * 1.26), 4, '#E7E2FF'); circle(ctx, gx, gy, 3.5, '#FFD447'); continue; }
    for (let j = -2; j <= 2; j++) line(ctx, gx, gy, gx + j * 7 + 2 * Math.sin(t * loopW(1.1) + i), gy - 26 - 6 * Math.abs(j % 2), 4, j % 2 ? GX.grassHi : GX.grass);
  }
  gxTent(ctx, 690, 1300, 0.62, t);
  gxLantern(ctx, 300, 1350, 0.7, t);
  gxCampProps(ctx, 650, 1690, 0.6, t);
}
SC.rec = (lt, t, shot) => {
  const c = cu();
  const closer = t >= c.cut_min;
  const u = closer ? E.inOutSine(clamp((t - c.cut_min) / (shot.end - c.cut_min))) : E.inOutSine(clamp(lt / (c.cut_min - shot.start)));
  const cam = closer ? { x: 470, y: 1452, zoom: 3.3 + 0.1 * u } : { x: 486, y: 1507, zoom: 2.6 + 0.06 * u };
  gxRecBack(cam, t);
  // the goggles snap down (his right hand pulls them), REC, the glass filling with light
  const down = snapRamp(t, c.down, c.down + 0.22, { pre: 0.06, ant: 0.05, over: 1.3 });
  const reach = popK(t, c.down - 0.2, c.down + 0.4, 0.14, 0.25);
  const restE = [530, 1660], restW = [545, 1760], topE = [570, 1500], topW = [492, lerp(1385, 1440, clamp(down))];
  const armR = { e: [lerp(restE[0], topE[0], reach), lerp(restE[1], topE[1], reach)], w: [lerp(restW[0], topW[0], reach), lerp(restW[1], topW[1], reach)] };
  const rec = t >= c.rec ? 1 : 0;
  const fill = r2(t, c.run0, c.run1, E.inOutSine);
  gxHero(cam, t, { x: 440, y: 1900, s: 1, face: HF.set, armR, handR: 'open', redrawR: reach > 0.3, headRot: 0.04,
    gog: { up: 1 - clamp(down, 0, 1.08), rec, fill, refl: 0.6 } });
  // light pouring into the lenses
  if (t > c.rec) {
    const h = heroHeadS(cam, { x: 440, y: 1900, s: 1 });
    gxSpecks(t, h[0], h[1], r2(t, c.rec, c.rec + 0.4), { n: closer ? 34 : 22, x0: 900, y0: 380, rate: 1.5, r: closer ? 9 : 6, seed: 9 });
  }
  // the stopwatch races to ten minutes
  const run = r2(t, c.run0, c.run1, E.inOutSine), mins = Math.min(10, Math.floor(run * 10 + 1e-6)), secs = Math.floor((run * 600) % 60);
  const wk = r2(t, c.rec, c.rec + 0.3, E.outBack);
  gxWatch(830, 600, 105, (run * 10) % 1, `${mins}:${String(secs).padStart(2, '0')}`, wk, '#4DFFB4');
  gxTag(t >= c.tag10 ? 'CAMERA: 10 MIN' : 'CAMERA', 830, 775, '#4DFFB4', t >= c.tag10 ? r2(t, c.tag10, c.tag10 + 0.3, E.outBack) : wk, 32);
  return { glow: 0.85 };
};

// ================================================================ BLOOM: WIDE, eye level: the galaxy grows across the sky
SC.bloom = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, u = E.inOutSine(clamp(lt / D));
  const sk = { x: 600 - (590 - 540) / 0.8, y: 860 - (640 - 960) / 0.8 - 12 * u, zoom: 0.8 + 0.02 * u };
  const e = r2(t, c.exp0, c.exp1, E.inOutCubic);
  const jaw = r2(t, c.jaw, c.jaw + 0.2, E.outBack);
  const g = gxSky(sk, t, { hz: 1150, e, moon: { face: jaw > 0.3 ? 'shock' : 'proud', jaw, look: [0.6, 0.4] } });
  gxValley(t, { hz: 1000, ms: 0.9, dx: 40, moonX: g.mp[0], mirrorGal: { x: g.gp[0], y: g.gp[1], s: sk.zoom, ang: GXS.galAng, e } });
  const cam = { x: 540, y: 960, zoom: 1.0 + 0.02 * u };
  applyCam(cam);
  gxHill(ctx, -200, 1300, 1380, t, { tufts: 40, rocks: 5, seed: 17 });
  gxTent(ctx, 215, 1420, 0.75, t);
  gxLantern(ctx, 430, 1404, 0.7, t);
  gxCampProps(ctx, 900, 1520, 0.7, t);
  const lean = -0.1 * r2(t, c.exp0, c.exp0 + 0.6, E.outCubic);
  gxHero(cam, t, { x: 690, y: 1400, s: 0.82, face: HF.wow, lean, gog: { up: 0, refl: 1, fill: 0.5 + 0.5 * e, rec: 1 },
    armL: { e: [592, 1140], w: [548, 1218] }, armR: { e: [788, 1140], w: [832, 1218] }, hand: 'spread' });
  return { glow: 0.9, capY: 1530 };
};

// ================================================================ the Moons beside the galaxy (sky only)
const GX_SLOTS = [0, 1, 2, 3, 4, 5].map((i) => -1 + (2 * i + 1) / 6.1);   // six Moons end to end, as long as the galaxy
// a sky camera that puts the galaxy's middle at screen (px, py) at zoom z
const gxSkAt = (px, py, z) => ({ x: GXS.gal[0] - (px - 540) / z, y: GXS.gal[1] - (py - 960) / z, zoom: z });
// the ruler: a dashed line along the galaxy, tip to tip, and dotted drops from both tips to the row of Moons beside it
function gxRuler(sk, k, t, drop = 0) {
  if (k <= 0.01) return;
  const a = toScreen(sk, ...gxAxis(-1)), b = toScreen(sk, ...gxAxis(1));
  const e = [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  const ra = toScreen(sk, ...gxRow(-1)), rb = toScreen(sk, ...gxRow(1));
  screenSpace();
  paint(() => {
    ctx.save(); ctx.setLineDash([18, 14]); ctx.lineDashOffset = -t * 40; line(ctx, a[0], a[1], e[0], e[1], 5, 'rgba(255,255,255,0.9)'); ctx.restore();
    const n = [-(b[1] - a[1]), b[0] - a[0]], d = Math.hypot(n[0], n[1]) || 1, nx = n[0] / d * 30, ny = n[1] / d * 30;
    line(ctx, a[0] - nx, a[1] - ny, a[0] + nx, a[1] + ny, 6, '#FFFFFF');
    if (k > 0.98) line(ctx, b[0] - nx, b[1] - ny, b[0] + nx, b[1] + ny, 6, '#FFFFFF');
    if (drop > 0.01) {
      ctx.save(); ctx.setLineDash([8, 10]);
      for (const [p, q] of [[a, ra], [b, rb]]) line(ctx, p[0], p[1], lerp(p[0], q[0], drop), lerp(p[1], q[1], drop), 4, 'rgba(255,236,170,0.85)');
      ctx.restore();
    }
  });
}
// the Moon's clones in the row: pops[i] 0..1 for the clones in slots 2..6
function gxMoonRow(sk, t, o) {
  const R = GXS.moonR * sk.zoom;
  for (let i = 1; i < 6; i++) {
    const k = o.pops[i - 1] || 0;
    if (k <= 0.01) continue;
    const p = toScreen(sk, ...gxRow(GX_SLOTS[i]));
    const s = Math.max(0.01, k);
    gxMoon(p[0], p[1], R * s, t, { face: o.cloneFace || 'calm', look: o.cloneLook || [-0.8, 0.2], glow: 0.3 * s, edge: true,
      num: k > 0.6 ? i + 1 : 0, numK: o.nums ? r2(k, 0.6, 1) : 0 });
  }
}
SC.line = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, u = E.inOutSine(clamp(lt / D));
  const sk = gxSkAt(470 + 6 * u, 740 - 6 * u, 0.9 + 0.03 * u);
  gxSky(sk, t, { hz: 2400, e: 1, moon: false });
  gxRuler(sk, r2(t, c.ruler, c.ruler + 0.7, E.inOutCubic), t, r2(t, c.slide, c.slide + 0.5, E.inOutCubic));
  // the Moon, nervous, slides from its place to the first spot of the row, under the galaxy's tip
  const sl = snapRamp(t, c.slide, c.slide + 0.55, { pre: 0.1, ant: 0.08, over: 1.2 });
  const from = GXS.moon, to = gxRow(GX_SLOTS[0]);
  const mp = toScreen(sk, lerp(from[0], to[0], sl), lerp(from[1], to[1], sl));
  gxMoon(mp[0], mp[1], GXS.moonR * sk.zoom, t, { face: t < c.ruler + 0.3 ? 'side' : 'nervous', look: [0.9, -0.4], edge: true, glow: lerp(1, 0.4, sl),
    sweat: r2(t, c.slide + 0.4, c.slide + 0.7) });
  return { glow: 0.9 };
};
function gxCountSky(t, o) {
  const c = cu();
  const sk = o.sk;
  gxSky(sk, t, { hz: 2400, e: 1, moon: false });
  gxRuler(sk, 1, t, 1);
  const pops = [c.m2, c.m3, c.m456, c.m456 + 0.04, c.m456 + 0.08].map((a) => snapRamp(t, a, a + 0.22, { pre: 0.05, ant: 0.1, over: 1.8 }));
  gxMoonRow(sk, t, { pops, nums: true, cloneFace: t >= c.m456 ? 'shock' : 'calm', cloneLook: t >= c.m456 ? [0, 0] : [-0.9, 0.2] });
  const p = toScreen(sk, ...gxRow(GX_SLOTS[0]));
  const squash = t >= c.m456 ? r2(t, c.m456, c.m456 + 0.2, E.outBack) * 0.55 : 0;
  const face = t >= c.m456 ? 'squish' : 'nervous';
  gxMoon(p[0], p[1] + squash * 14, GXS.moonR * sk.zoom, t, { face, look: t >= c.m456 ? [0, 0] : [0.9, -0.2], squash, edge: true, glow: 0.4,
    blush: t >= c.m3 ? 0.8 : 0.3, sweat: t >= c.m2 ? 1 : 0.6, num: 1, numK: r2(t, c.m1, c.m1 + 0.25, E.outBack) });
}
SC.count = (lt, t, shot) => {
  const D = shot.end - shot.start, u = E.inOutSine(clamp(lt / D));
  gxCountSky(t, { sk: gxSkAt(430 - 4 * u, 720 - 4 * u, 0.85 + 0.025 * u) });
  return { glow: 0.9 };
};
SC.six = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, u = E.inOutSine(clamp(lt / D));
  gxCountSky(t, { sk: gxSkAt(440, 760, 0.82 + 0.012 * u) });
  gxTag('≈ 6 MOONS WIDE', 390, 590, '#FFD447', r2(t, c.tag6, c.tag6 + 0.3, E.outBack), 54);
  gxTag('*in long-exposure photos', 370, 680, '#DDE3FF', r2(t, c.tag6 + 0.1, c.tag6 + 0.4, E.outBack), 26, 0, 'rgba(14,16,40,0.7)');
  return { glow: 0.9 };
};

// ================================================================ TRIP: space, the light leaves Andromeda
SC.trip = (lt, t, shot) => {
  const c = cu();
  const closer = t >= c.cut_two;
  if (!closer) {
    const u = E.inOutSine(clamp(lt / (c.cut_two - shot.start)));
    const k = 0.12 + 0.5 * r2(t, c.launch, c.cut_two, E.outCubic);
    const ph = [lerp(360, 860, k), lerp(640, 1450, k)];
    gxSpace(t, { gx: 380 - 20 * u, gy: 700, gs: 1.2 + 0.05 * u, gsy: 2.0, ang: -0.45, sx: 30 * u,
      photon: { x: ph[0], y: ph[1], r: lerp(10, 22, k), k: r2(t, c.launch, c.launch + 0.15), tail: [-1, -1.6] },
      us: { x: 870, y: 1470, s: 0.9, k: r2(t, shot.start + 0.2, shot.start + 0.5, E.outBack) } });
    gxTag('US', 870, 1580, '#BFD0FF', r2(t, shot.start + 0.3, shot.start + 0.6, E.outBack), 40);
  } else {
    gxSpace(t, { streak: 1, photon: { x: 540 + 10 * Math.sin(t * 3), y: 960, r: 38, k: 1, tail: [-1, -1.4] } });
    const n = Math.round(2500000 * r2(t, c.count0, c.ago_end, E.inOutSine));
    gxCounter(540, 560, r2(t, c.cut_two, c.cut_two + 0.3, E.outBack), n.toLocaleString('en-US'), 'YEARS ON THE WAY', '#FFD447');
  }
  return { glow: 0.95 };
};

// ================================================================ TIMELINE: the time ribbon; the light lands in his goggles
SC.timeline = (lt, t, shot) => {
  const c = cu();
  if (t < c.cut_you) {
    const u = E.inOutSine(clamp(lt / (c.cut_you - shot.start)));
    gxSpace(t, { sx: 20 * u });
    const pu = r2(t, shot.start + 0.15, c.cut_you - 0.05, E.inOutSine);
    gxRibbon(t, { x0: 200, x1: 920, y: 900, k: r2(t, shot.start, shot.start + 0.35, E.outCubic), photonU: pu,
      empty: popK(t, c.before, c.peopleflag + 0.35, 0.2, 0.15), people: r2(t, c.peopleflag, c.peopleflag + 0.35),
      cam: { zoom: 1.1 + 0.06 * u, cx: 560, cy: 960 } });
  } else {
    // the YOU end: his face, the light flying in to his left lens: ding
    const cam = { x: 540, y: 1470, zoom: 3.2 };
    gxSky({ x: 430, y: 1000, zoom: 1.3 }, t, { hz: 2600, e: 1, moon: false });
    const land = r2(t, c.cut_you, c.land, E.inQuad), hit = popK(t, c.land, c.land + 0.4, 0.04, 0.25);
    const r = gxHero(cam, t, { x: 540, y: 1900, s: 1, face: hit > 0.3 ? HF.grin : HF.awe, gog: { up: 0, refl: 1, fill: 0.3 + 0.7 * hit, glint: r2(t, c.land, c.land + 0.3) } });
    const h = heroHeadS(cam, { x: 540, y: 1900, s: 1 });
    const lens = [h[0] - 27 * 3.2, h[1] + 2 * 3.2];
    if (t < c.land) gxPhoton(lerp(120, lens[0], land), lerp(300, lens[1], land), lerp(14, 26, land), 1, [-1, -1.3], t);
    if (hit > 0.01) { screenSpace(); shockLines(lens[0], lens[1], 70, inv(c.land, c.land + 0.4, t), 10, '#FFF2CC', 5); }
    gxTag('TONIGHT', 540, 520, '#FFD447', r2(t, c.land, c.land + 0.3, E.outBack), 50);
  }
  return { glow: 0.9 };
};

// ================================================================ BUTTON: MEDIUM, him right waving, the Moon upper left sulks
SC.button = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, u = E.inOutSine(clamp(lt / D));
  const sk = { x: 403.7, y: 818 - 6 * u, zoom: 1.55 };
  const bk = r2(t, c.blanket, c.blanket + 0.35, E.outCubic);
  gxSky(sk, t, { hz: 1500, e: 1, moon: { face: 'sulk', look: [0.6, 0.7], cloud: bk } });
  gxValley(t, { hz: 1500, ms: 0.9, dx: 200, moonX: 280 });
  const cam = { x: 640, y: 1500, zoom: 1.7 + 0.03 * u };
  applyCam(cam);
  gxHill(ctx, 100, 1400, 1840, t, { tufts: 14, rocks: 1, seed: 41 });
  // a sheepish wave toward the Moon: his left hand up, waggling
  const wv = Math.sin(t * 14) * 0.5 + 0.5, up = r2(t, shot.start, c.wave + 0.2, E.outBack);
  const armL = { e: [lerp(645, 615, up), lerp(1650, 1500, up)], w: [lerp(655, 595 - 18 * wv, up), lerp(1760, 1405, up)] };
  gxHero(cam, t, { x: 725, y: 1900, s: 1, face: HF.sheep, armL, handL: 'open', headRot: -0.06, gog: { up: 0, refl: 1, fill: 0.2 } });
  return { glow: 0.85, focus: toScreen(sk, GXS.moon[0], GXS.moon[1]) };
};

// ================================================================ the cover (cover.jpg: the YouTube thumbnail, the Instagram cover)
SC.cover = (lt, t, shot) => {
  gxHookDraw(0.6);
  gxTag('6 MOONS WIDE', 545, 628, '#FFD447', 1, 84, -0.04);
  return { noCaptions: true };
};

function initScenes2() {
  gxWorldInit();
}
