// Dinosaurs Are Older Than FLOWERS: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js. Every beat comes from a cue (make_timeline.py).
'use strict';

const cu = () => TLd.cues;

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the glade: a high sun on the LEFT behind him (rim from the left), the sky as the key from the upper right
const DF_L_DAY = Object.assign({}, LIGHTS.day, { keyTint: [1.04, 1.02, 0.96] });
const DF_L_JUR = Object.assign({}, LIGHTS.day, { keyTint: [1.0, 1.04, 0.96], rim: [0.85, 1.0, 0.75] });
const DF_L_ROAD = Object.assign({}, LIGHTS.diagram, { rimFrom: [0.9, -0.1], rim: [1.0, 0.75, 0.5], rimAmt: 0.9 });
setLights({ hook: DF_L_DAY, answer: DF_L_DAY, green: DF_L_JUR, eat: DF_L_JUR, rex: DF_L_DAY, closer: DF_L_ROAD, button: DF_L_DAY,
  loop: DF_L_DAY, cover: DF_L_DAY });

// ---------------------------------------------------------------- him (any place), with the bouquet in his right hand
// o: {x, y, s, pose, face, armR: {e, w} (world), armL, hand, handL, handR, bq: {x, y, s, rot, eaten}, headRot, headDX, post}
function dfHero(cam, t, o) {
  const st = { x: o.x, y: o.y, s: o.s, seed: 3, headDX: o.headDX || 0, headDY: o.headDY || 0, headRot: o.headRot || 0 };
  let pose = JSON.parse(JSON.stringify(o.pose || POSES.stand));
  if (o.lean != null) pose.lean = o.lean;
  if (o.armR) pose = armAt(pose, 'R', ikLocal(st, o.armR.e[0], o.armR.e[1]), ikLocal(st, o.armR.w[0], o.armR.w[1]));
  if (o.armL) pose = armAt(pose, 'L', ikLocal(st, o.armL.e[0], o.armL.e[1]), ikLocal(st, o.armL.w[0], o.armL.w[1]));
  if (o.hand) pose.hand = o.hand;
  if (o.handR) pose.handR = o.handR;
  if (o.handL) pose.handL = o.handL;
  st.pose = pose; st.face = o.face || FACES.calm;
  applyCam(cam);
  const r = charLayer(cam, st, t, { pal: PAL, post: (lc, rr, s2) => {
    if (o.bq) {
      const b = o.bq;
      dfBouquet(lc, b.x, b.y, b.s, t, { rot: b.rot || 0, eaten: b.eaten || 0, wiggle: b.wiggle || 0 });
      dfGrip(lc, b.x, b.y, b.s, b.rot || 0);
    }
    if (o.post) o.post(lc, rr, s2);
  } });
  applyCam(cam);          // charLayer leaves the main canvas in screen space
  return { st, r };
}
// his fist round the cone at the ribbon (drawn after the bouquet)
function dfGrip(c, x, y, s, rot) {
  c.save(); c.translate(x, y); c.rotate(rot || 0); c.scale(s, s);
  rrect(c, -44, -4, 88, 66, 26); c.fillStyle = PAL.skin; c.fill();
  paint(() => {
    for (let i = 0; i < 3; i++) line(c, -30, 12 + i * 15, 30, 14 + i * 15, 4, rgba(PAL.skinSh, 0.8));
    ellipse(c, -40, 22, 14, 22, PAL.skinSh);
  });
  c.restore();
}

// ================================================================ HOOK: guess what's older: dinosaurs... or your FLOWERS?
// CU, him LEFT, the bouquet held up beside his face, a T. rex looking DOWN into it from the top right, its tiny arms
// reaching for it and falling short. The button returns to this framing, and the loop shot is this picture at tt < 0.
const DF_HOOK_CAM = { x: 600, y: 1150, zoom: 2.05 };
const DF_HST = { x: 468, y: DF_GY, s: 1 };            // his head centre lands at about (468, 1180) -> screen (269, 1022)
// solved for: the snout in the flowers (640, 1012), the chest's arm root at (790, 1170) so the tiny hands stop ~90 short
const DF_REX_HOOK = { hx: 925, hy: 1113, s: 0.6, lean: 0.1, neck: -0.95, head: 1.0 };
// the glade behind the close-ups: trees kept clear of the T. rex's head and arms (mid layer, p 0.7)
const DF_HOOK_MIDS = [[-900, 'm', 520, 5], [-560, 'c', 960, 6], [-300, 'y', 380, 7], [-40, 'm', 600, 8], [250, 'c', 900, 9],
  [1150, 'c', 980, 12], [1420, 'y', 400, 13], [1650, 'm', 620, 14], [1950, 'c', 800, 15]];
// the hook's picture. tt = seconds since the start (negative: the loop's lead-in). o: the button's beats
//   {offer 0..1 (the bouquet goes up to it), flail 0..1, deadpan 0..1 (his face to us, flat), look 0..1 (he turns to us)}
function dfHookDraw(tt, o = {}) {
  const c = cu();
  const cam = Object.assign({}, DF_HOOK_CAM, { zoom: DF_HOOK_CAM.zoom + (o.zoomAdd || 0) });
  dfWorld(cam, tt, { era: 1, bloom: 1, magK: 1, hz: 120, mids: DF_HOOK_MIDS });
  applyCam(cam);
  // the T. rex: hip off to the right, chest by the bouquet, head looking down into it; sniffing; arms straining
  const R = DF_REX_HOOK;
  const sniff = 0.5 + 0.5 * Math.sin(tt * loopW(7.0));
  const snort = o.snort || 0;
  dfRex(ctx, R.hx, R.hy, R.s, tt, { flip: -1, lean: R.lean, neck: R.neck, head: R.head + 0.03 * Math.sin(tt * loopW(2.2)),
    reach: 1, flail: 0.18 + 0.82 * (o.flail || 0), sniff: Math.max(sniff, snort), look: [0.6, 0.7], happy: 0.25 + 0.5 * (o.happy || 0),
    blink: o.blink || 0, noLegs: true });
  // a flowering bush in front of the T. rex's belly and legs (they would hang in the air below the frame line)
  for (const [fx, fy, fs, sd] of [[1130, 1500, 2.5, 3], [930, 1530, 2.1, 1], [1060, 1470, 2.3, 2]]) dfFern(ctx, fx, fy, fs, 900 + sd, tt);
  { const rr = mulberry32(17);
    for (let i = 0; i < 7; i++) {
      const fx = 860 + rr() * 300, fy = 1300 + rr() * 140, fs = 20 + 10 * rr();
      line(ctx, fx, fy + 60, fx, fy, 6, '#3E8A34');
      paint(() => dfFlower(ctx, fx, fy, fs, DFC.meadow[i % 7], i % 3, 1, (rr() - 0.5) * 0.4));
    } }
  // the bouquet in his right hand: up beside his face; a wiggle when it's offered
  const off = o.offer || 0;
  const bx = 584 + 8 * off, by = 1182 - 30 * off + 3 * Math.sin(tt * loopW(2.4));
  const lookK = o.look || 0, dead = o.deadpan || 0;
  let face = Object.assign({}, FACES.grin, { lookX: 0.6, lookY: -0.55 });
  if (lookK > 0) face = lerpFace(face, Object.assign({}, FACES.grin, { lookX: 0.05, lookY: 0.0, browY: 1.0, browTilt: -0.4 }), lookK);
  if (dead > 0) face = lerpFace(face, Object.assign({}, FACES.annoyed, { lookX: 0.0, lookY: 0.05, blink: 0.35, browY: 0.1, browTilt: -0.3 }), dead);
  dfHero(cam, tt, { x: DF_HST.x, y: DF_HST.y, s: 1, face, headRot: -0.04 * lookK,
    armR: { e: [lerp(574, 586, off), lerp(1318, 1292, off)], w: [bx - 4, by + 14] }, handR: 'open',
    bq: { x: bx, y: by, s: 0.55, rot: -0.12 + 0.04 * Math.sin(tt * loopW(2.4)), wiggle: 0.5 + off } });
  // petals blown about by the snort (on "dinosaurs...")
  if (snort > 0.02) {
    const u = clamp(o.snortU || 0);
    for (let i = 0; i < 7; i++) {
      const a = -2.4 + i * 0.32, d = 40 + 120 * u;
      paint(() => ellipse(ctx, 610 + Math.cos(a) * d, 1060 + Math.sin(a) * d + 60 * u * u, 10, 5, DFC.meadow[i % 7], a + u * 4));
    }
  }
  return cam;
}
SC.hook = (lt, t, shot) => {
  const c = cu();
  const look = ramp(t, c.look, c.look + 0.25, E.outBack);
  const snortU = inv(c.dinos + 0.1, c.dinos + 0.75, t);
  const snort = popK(t, c.dinos + 0.05, c.dinos + 0.8, 0.06, 0.2);
  dfHookDraw(t, { look, snort, snortU, happy: snort });
  return { glow: 0.85 };
};
SC.loop = (lt, t, shot) => {
  dfHookDraw(lt - (shot.end - shot.start));
  return { glow: 0.85 };
};

// ================================================================ ANSWER: Dinosaurs. By almost a HUNDRED million years.
// MEDIUM-WIDE, LOW angle: the counter rewinds from 66 to 150 million years ago, the flowers sink back into the ground and
// the magnolias shrink away; his bouquet is the last colour. Tags: DINOSAURS ~230 million / FLOWERS* ~130 million.
function dfYears(t) {
  const c = cu();
  if (t < c.tag_flower) return lerp(66e6, 130e6, E.inOutSine(inv(c.rewind, c.tag_flower, t)));
  return lerp(130e6, 150e6, E.outCubic(inv(c.tag_flower, c.land, t)));
}
SC.answer = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const bloom = 1 - E.inOutSine(inv(c.rewind + 0.1, c.tag_flower + 0.05, t));
  const magK = 1 - E.inOutCubic(inv(c.tag_flower - 0.6, c.tag_flower + 0.3, t));
  const era = 1 - inv(c.tag_flower, c.land, t);
  const cam = { x: 545, y: 1240 - 20 * ramp(lt, 0, D, E.inOutSine), zoom: 1.02 + 0.05 * ramp(lt, 0, D, E.inOutSine) };
  dfWorld(cam, t, { era, bloom, magK, hz: 230 });
  applyCam(cam);
  // him in the middle, the bouquet held up to his chest; he watches the flowers go (looking round), then at the bouquet
  const lookA = Math.sin(t * 2.2) * 0.6;
  const face = t < c.hundred ? Object.assign({}, FACES.startled, { lookX: lookA, lookY: 0.4, mouth: 'o', mouthOpen: 0.5 })
    : Object.assign({}, FACES.worried, { lookX: 0.45, lookY: -0.3, mouthOpen: 0.25 });
  const st = { x: 520, y: DF_GY };
  dfHero(cam, t, { x: st.x, y: st.y, s: 1, face, headRot: 0.05 * Math.sin(t * 2.2),
    armR: { e: [610, 1420], w: [640, 1338] }, handR: 'open',
    bq: { x: 650, y: 1330, s: 0.55, rot: 0.08, wiggle: 0.6 } });
  dfFront(cam, t, { bloom, xs: [[90, 1.6, 1], [1010, 1.7, 2]], fx0: -100, fw: 1300 });
  // the YEARS AGO counter, rewinding; the two tags
  yearsHud(popK(t, c.rewind, c.land + 0.5, 0.15, 0.12), dfYears(t), 'rw', t);
  shTag('DINOSAURS', 300, 760, popK(t, c.tag_dino, shot.end + 1, 0.15, 0.1), '#FF9A3C', '~230 MILLION YRS');
  shTag('FLOWERS*', 790, 760, popK(t, c.tag_flower, shot.end + 1, 0.15, 0.1), '#FF86A6', '~130 MILLION YRS');
  screenSpace();
  if (t > c.tag_flower) {
    ctx.save(); ctx.globalAlpha = clamp((t - c.tag_flower) / 0.3);
    ctx.font = '800 28px Montserrat'; ctx.textAlign = 'center'; ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = 'rgba(10,10,30,0.85)'; ctx.lineWidth = 6;
    ctx.strokeText('*the oldest ones ever found', 790, 845); ctx.fillText('*the oldest ones ever found', 790, 845);
    ctx.restore();
  }
  return { glow: 0.85 };
};

// ================================================================ GREEN: Stegosaurus probably never saw one. Ferns... green...
// WIDE, HIGH angle: the Jurassic valley; a Stegosaurus ambles in from the right; the camera travels over the greens as
// they're named; he spins looking for ANY colour; on the last "GREEN" the Stego's head comes up to sniff the bouquet.
const DF_GREEN_HERO = { x: 470, y: DF_GY };
SC.green = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(t, [[c.amble, 760, 1290, 0.6], [c.never, 720, 1330, 0.64], [c.just - 0.1, 330, 1540, 1.08], [c.ferns_end, 320, 1550, 1.12],
    [c.green1 - 0.1, 900, 1380, 0.86], [c.green1_end, 940, 1360, 0.84], [c.green2 - 0.15, 760, 1290, 0.6], [c.sniff, 700, 1350, 0.72],
    [shot.end, 690, 1360, 0.76]]);
  dfWorld(cam, t, { era: 0, bloom: 0, magK: 0, hz: -250 });
  applyCam(cam);
  // the Stegosaurus: walks in from the right and stops by him; head up to sniff at the end
  const walkK = E.inOutSine(inv(c.amble, c.one_end + 0.3, t));
  const sx = lerp(1520, 1250, walkK);
  const ph = t * 5.2 * (walkK < 1 ? 1 : 0) + (walkK >= 1 ? c.one_end * 5.2 : 0);
  const up = 0.35 * E.inOutCubic(inv(c.sniff - 0.45, c.sniff + 0.2, t));
  const puzzled = ramp(t, c.sniff, c.sniff + 0.3);
  dfStego(ctx, sx, DF_GY + 6, 0.8, t, { flip: -1, walk: ph, headUp: up, headFwd: 40 * up, look: [0.9, 0.2], puzzled,
    blink: popK(t, c.ferns, c.ferns + 0.14, 0.04, 0.05) });
  // him: holding the bouquet out; he spins round looking for any colour (left, right, left)
  const s1 = ramp(t, c.look1, c.look1 + 0.2), s2 = ramp(t, c.look2, c.look2 + 0.2), s3 = ramp(t, c.look3, c.look3 + 0.2);
  const dir = s3 > 0.5 ? 1 : (s2 > 0.5 ? -1 : (s1 > 0.5 ? 1 : -1));
  let face = Object.assign({}, FACES.confused, { lookX: 0.9 * dir, lookY: -0.2 });
  if (t > c.sniff - 0.2) face = Object.assign({}, FACES.nervous, { lookX: 1, lookY: -0.4 });
  const pose = t < c.look1 ? walkPose(0) : POSES.stand;
  // a big fern clump beside him (the camera goes to it on "Just ferns...")
  dfFern(ctx, 215, DF_GY + 30, 2.3, 811, t);
  dfFern(ctx, 120, DF_GY + 60, 1.7, 812, t, DFC.leaf, DFC.fernDk);
  const low = E.inOutCubic(inv(c.sniff - 0.5, c.sniff, t));
  dfHero(cam, t, { x: DF_GREEN_HERO.x, y: DF_GREEN_HERO.y, s: 1, face, pose, headRot: 0.12 * dir * (t > c.look1 && t < c.sniff ? 1 : 0),
    armR: { e: [lerp(575, 560, low), lerp(1430, 1420, low)], w: [lerp(628, 640, low), lerp(1352, 1478, low)] }, handR: 'open',
    bq: { x: lerp(640, 652, low), y: lerp(1340, 1466, low), s: 0.55, rot: lerp(0.1, 0.35, low), wiggle: 0.4 } });
  dfFront(cam, t, { bloom: 0, xs: [[120, 1.8, 1], [1150, 1.9, 2], [-250, 1.5, 3], [1500, 1.7, 4], [700, 1.2, 5]] });
  // NO FLOWERS (YET) stamp on "never"
  const nk = popK(t, c.never, c.one_end, 0.14, 0.12);
  if (nk > 0) { screenSpace(); stamp('NO FLOWERS', 540, 480, nk, '#FF4D5E', -0.1, 92); }
  return { glow: 0.8 };
};

// ================================================================ EAT: No wonder he's EATING them.
// CU, LOW angle: the Stego's beak CHOMPS the bouquet (hitstop), petals burst, it chews; him deadpan with the bare stems.
SC.eat = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 690, y: 1390 + 12 * ramp(lt, 0, D, E.inOutSine), zoom: 1.55 + 0.05 * ramp(lt, 0, D, E.inOutSine) };
  dfWorld(cam, t, { era: 0, bloom: 0, magK: 0, hz: 260 });
  applyCam(cam);
  const chomp = t >= c.chomp;
  const eaten = chomp ? lerp(0.86, 1, ramp(t, c.chomp, c.them_end, (x) => x)) : 0;
  const jaw = chomp ? 0.15 * Math.max(0, Math.sin((t - c.chomp) * 18)) : 0.25 + 0.75 * ramp(t, c.chomp - 0.35, c.chomp - 0.05);
  const chew = t > c.chew ? (t - c.chew) : 0;
  // the Stego, head up at the bouquet (from the right)
  dfStego(ctx, 1430, DF_GY + 6, 0.95, t, { flip: -1, walk: 0, headUp: 0.35, headFwd: chomp ? 0 : 40, jaw, chew, look: [0.6, -0.2],
    blink: chomp ? popK(t, c.chomp, c.chomp + 0.18, 0.03, 0.06) : 0, petals: chomp ? 4 : 0 });
  // him, deadpan, the bare cone in his hand; on "them" he looks at us
  const toUs = ramp(t, c.them - 0.1, c.them + 0.15);
  let face = Object.assign({}, FACES.startled, { lookX: 0.7, lookY: 0.1, mouth: 'o', mouthOpen: 0.4 });
  if (chomp) face = Object.assign({}, FACES.annoyed, { lookX: lerp(0.7, 0.0, toUs), lookY: lerp(0.0, 0.05, toUs), blink: 0.4, mouthOpen: 0 });
  const yank = chomp ? -18 * popK(t, c.chomp, c.chomp + 0.25, 0.03, 0.15) : 0;
  dfHero(cam, t, { x: 535, y: DF_GY, s: 1, face, lean: 0.06, headDX: chomp ? 4 * Math.sin(t * 50) * popK(t, c.chomp, c.chomp + 0.2, 0.02, 0.1) : 0,
    armR: { e: [622, 1408], w: [676 + yank, 1494] }, handR: 'open', bq: { x: 688 + yank, y: 1482, s: 0.55, rot: 0.3, eaten, wiggle: 0.3 } });
  // petals burst on the chomp
  const pk = chomp ? clamp((t - c.chomp) / 0.9) : 0;
  if (pk > 0 && pk < 1) {
    const rr = mulberry32(11);
    for (let i = 0; i < 18; i++) {
      const a = -Math.PI * (0.1 + 0.8 * rr()), sp = 200 + 240 * rr(), x = 740 + Math.cos(a) * sp * pk, y = 1390 + Math.sin(a) * sp * pk + 380 * pk * pk;
      paint(() => ellipse(ctx, x, y, 13, 7, DFC.meadow[i % 7], a + pk * 6));
    }
  }
  const ck = popK(t, c.chomp + 0.02, c.chomp + 0.65, 0.05, 0.15);
  if (ck > 0) { screenSpace(); bigWord('CHOMP!', 690, 500, 128, '#FFD447', E.outBack(clamp(ck * 1.2)), -0.1); }
  return { glow: 0.8 };
};

// ================================================================ REX: But T-rex? Flowers everywhere.
// WIDE, LOW angle: fast-forward to 67 million years ago; the valley BURSTS into bloom; a T. rex stomps in (hitstop),
// then sniffs a magnolia, happy. Him on the left with the bare cone, jaw dropped at the colours.
function dfYearsFF(t) {
  const c = cu();
  return lerp(150e6, 67e6, E.inOutCubic(inv(c.ff, c.trex_end - 0.1, t)));
}
SC.rex = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const bloom = E.outCubic(inv(c.bloom, c.trex_end + 0.2, t));
  const cam = { x: 760 + 30 * ramp(lt, 0, D, E.inOutSine), y: 1200, zoom: 0.66 + 0.04 * ramp(lt, 0, D, E.inOutSine) };
  dfWorld(cam, t, { era: lerp(0.3, 1, bloom), bloom, magK: bloom, hz: 260 });
  applyCam(cam);
  // the T. rex: walks in from the right, the near foot lands on "Flowers" (the stomp), then it leans to sniff a blossom
  const walkK = E.inOutSine(inv(c.ff + 0.2, c.stomp, t));
  const hx = lerp(1900, 1250, walkK), s = 1.1, hy = DF_GY - 560 * s;
  const ph = (t < c.stomp ? t : c.stomp) * 6.0;
  const lift = t < c.stomp ? clamp(Math.sin(ph) * 0.5 + 0.5) * (walkK < 1 ? 0.6 : 0) : 0;
  const sniff = ramp(t, c.everywhere - 0.2, c.everywhere + 0.3);
  dfRex(ctx, hx, hy + (t < c.stomp ? -8 * Math.abs(Math.sin(ph)) : 0), s, t, { flip: -1, lean: 0.12 + 0.18 * sniff, neck: -0.2 + 0.25 * sniff,
    head: 0.05 + 0.35 * sniff, walk: ph, stomp: lift, reach: 0.4, flail: 0.1, sniff: sniff * (0.5 + 0.5 * Math.sin(t * 14)),
    happy: sniff, look: [0.7, 0.4], jaw: popK(t, c.stomp - 0.3, c.stomp + 0.35, 0.1, 0.15) * 0.8 });
  // the blossom it sniffs (on a magnolia branch in front of it)
  if (bloom > 0.1) paint(() => dfFlower(ctx, 820, 900, 34, DFC.mag, 2, bloom, 0.2));
  // dust from the stomp
  const dk = t >= c.stomp ? clamp((t - c.stomp) / 0.9) : 0;
  if (dk > 0 && dk < 1) for (let i = 0; i < 8; i++) {
    const a = Math.PI + i / 7 * Math.PI, d = 80 + 260 * dk;
    ellipse(ctx, 1240 + Math.cos(a) * d * 1.4, DF_GY + 10 + Math.sin(a) * d * 0.3, 60 + 70 * dk, 34 + 30 * dk, rgba('#D8C8A0', 0.75 * (1 - dk)));
  }
  // him on the left, holding the empty cone, jaw dropped at the colours, looking round
  const awe = ramp(t, c.bloom, c.bloom + 0.3);
  const startle = popK(t, c.stomp, c.stomp + 0.5, 0.03, 0.2);
  let face = Object.assign({}, FACES.calm, { lookX: 0.5, lookY: -0.2 });
  if (awe > 0) face = lerpFace(face, Object.assign({}, FACES.startled, { lookX: -0.4 + 0.9 * ramp(t, c.flowers2, c.everywhere), lookY: -0.6, mouth: 'o', mouthOpen: 0.7 }), awe);
  if (startle > 0) face = lerpFace(face, FACES.shock, startle);
  dfHero(cam, t, { x: 330, y: DF_GY, s: 1, face, headDY: -10 * startle,
    armR: { e: [420, 1440], w: [470, 1370] }, handR: 'open', bq: { x: 480, y: 1360, s: 0.55, rot: 0.15, eaten: 1 } });
  dfFront(cam, t, { bloom, xs: [[-120, 2.0, 1], [1700, 2.1, 2]], fx0: -500, fw: 2600 });
  yearsHud(popK(t, c.ff, c.flowers2 + 0.1, 0.12, 0.12), dfYearsFF(t), 'ff', t, 500);
  return { glow: 0.85 };
};

// ================================================================ CLOSER: And it lived closer in time to YOU... than to Stegosaurus!
// The time road at dusk: Stegosaurus 150 million years ago (far left), T. rex 67 (middle), him NOW (right). The camera
// starts on the T. rex and him, the green bracket 66M; then pulls back to the far, tiny Stego and the red bracket 80M.
SC.closer = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const pull = E.inOutCubic(inv(c.br_stego - 0.35, c.br_stego + 0.55, t));
  const cam = { x: lerp(660, 490, pull) - 12 * ramp(lt, 0, 1.2), y: lerp(1000, 930, pull), zoom: lerp(1.55, 1.05, pull) };
  dfRoadBack(cam, t);
  dfRoad(cam, t, {});
  applyCam(cam);
  const xS = dfRoadX(150), xR = dfRoadX(67), xY = dfRoadX(0), y = DF_ROAD.y;
  // the Stego, far left, small; it waves its tail sadly when the red bracket lands
  const sad = ramp(t, c.br_stego + 0.2, c.br_stego + 0.5);
  dfStego(ctx, xS + 20, y + 2, 0.21, t, { flip: 1, walk: 0, headUp: 0.3 * sad, look: [1, -0.3], puzzled: sad, blink: 0 });
  // the T. rex: looks at him on "YOU", turns to look back at the Stego on "Stegosaurus"
  const turn = t > c.stego2 - 0.1;
  const rs = 0.26;
  dfRex(ctx, xR, y - 560 * rs, rs, t, { flip: turn ? -1 : 1, lean: 0.05, neck: -0.3, head: 0.2, reach: 0.3, flail: 0.15,
    happy: turn ? 0 : ramp(t, c.you, c.you + 0.2), look: [1, 0.2], jaw: turn ? 0.5 * popK(t, c.stego2, c.stego2_end + 0.3, 0.06, 0.2) : 0 });
  // him, NOW, at the right end: waves at the T. rex on "YOU"
  const wave = popK(t, c.you - 0.05, c.stego2 + 0.2, 0.1, 0.15);
  const pose = JSON.parse(JSON.stringify(POSES.stand));
  const hs = 0.38;
  const face = Object.assign({}, FACES.grin, { lookX: -0.8, lookY: -0.1 });
  dfHero(cam, t, { x: xY, y: y + 2, s: hs, pose, face,
    armL: wave > 0 ? { e: [xY - 70 * hs, y - 420 * hs], w: [xY - (80 + 20 * Math.sin(t * 16)) * hs, y - 560 * hs] } : null, handL: 'open' });
  // the labels under the road, and the brackets over them
  dfRoadLabel(xS, y + 92, '150M YRS AGO', popK(t, c.br_stego - 0.2, shot.end + 1, 0.12, 0.1), '#7CC452');
  dfRoadLabel(xR, y + 92, '67M YRS AGO', popK(t, c.road + 0.1, shot.end + 1, 0.12, 0.1), '#FF86A6');
  dfRoadLabel(xY - 45, y + 92, 'NOW', popK(t, c.br_you - 0.1, shot.end + 1, 0.12, 0.1), '#7FE9FF');
  dfBracket(xR, xY, 650, inv(c.br_you, c.br_you + 0.45, t), '#4DFFB4', '66M', 'YEARS');
  dfBracket(xS, xR, 650, inv(c.br_stego, c.br_stego + 0.5, t), '#FF5A6E', '80M', 'YEARS');
  return { glow: 0.9 };
};

// ================================================================ BUTTON: So... flowers for T-rex, then? Tiny arms.
SC.button = (lt, t, shot) => {
  const c = cu();
  const offer = snapRamp(t, c.offer, c.offer + 0.35, { over: 1.3 });
  const flail = ramp(t, c.flail, c.flail + 0.12) * (1 - ramp(t, c.arms_end + 0.05, c.loop, (x) => x));
  const look = ramp(t, c.so - 0.15, c.so + 0.15) * (1 - ramp(t, c.offer - 0.15, c.offer + 0.1));
  const dead = ramp(t, c.arms - 0.05, c.arms + 0.15);
  dfHookDraw(t, { offer, flail, look: Math.max(look, 0), deadpan: dead, happy: ramp(t, c.offer, c.offer + 0.3) * (1 - dead) });
  return { glow: 0.85 };
};

// ================================================================ the cover (outside the timeline: src/cover.sh)
SC.cover = (lt, t, shot) => {
  const c = cu();
  dfHookDraw(c.flowers + 0.3, { look: 1 });
  screenSpace();
  rrect(gctx, 70, 410, 560, 330, 40); gctx.fillStyle = 'rgba(0,0,0,1)'; gctx.fill();
  bigWord('WHICH IS', 330, 485, 104, '#FFFFFF', 1, -0.05);
  bigWord('OLDER?', 335, 630, 158, '#FFD447', 1, -0.05);
  return { glow: 0.85, noCaptions: true };
};

function initScenes2() {}
