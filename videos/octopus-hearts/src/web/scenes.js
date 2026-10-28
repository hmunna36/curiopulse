// Why Does an Octopus Have THREE Hearts? 🐙 Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js. Every beat comes from a cue: cu().name (timeline.json).
// The set: a reef four metres down (reef.js); the octopus (octo.js) on its rock; the hiker snorkelling (diver.js).
'use strict';

const cu = () => TLd.cues;
const DUR = () => TL.duration;

setLights({ hook: LIGHTS.water, xray: LIGHTS.water, third: LIGHTS.water, you: LIGHTS.water, swim: LIGHTS.water, walk: LIGHTS.water,
  button: LIGHTS.water, cover: LIGHTS.water });

// ---------------------------------------------------------------- the set and the cast's home marks
const OCT = { x: 625, y: 1022, s: 1 };          // the octopus's hub on top of its rock
const HERO = { x: 438, y: 1428, s: 1 };          // his head lands at ~(448, 958)
const DISC0 = [577, 942];                        // the stethoscope's chest piece on the octopus's mantle (world)
let OH_W = null;
const ohW = () => OH_W || (OH_W = { bob: loopW(1.6), blink: loopW(0.9) });

// a label in screen space: a pill with a dashed leader to a screen point; k pops it
function ohTag(x, y, text, col, k, to, size = 40) {
  if (k <= 0.01) return;
  if (to) thinLeader([x, y], to, k, col);
  pill(x, y, text, col, k, size);
}
// a world point -> screen
const ohS = (cam, p) => toScreen(cam, p[0], p[1]);
// octopus-local point -> world
const ohO = (o, p) => [o.x + p[0] * o.s, o.y + p[1] * o.s];

// the octopus's heart pulses at time t (the gill hearts lead the big one)
function ohHearts(t) { const g = ocPulse(t, 0.12); return { gl: g, gr: g, big: ocPulse(t, 0) }; }

// ---------------------------------------------------------------- frame 1, as a function of time (valid at negative time:
// the end of the Short plays the same picture, so the loop is seamless)
function hookCam(tt) {
  const k = ramp(tt, 0, 3.9, E.inOutSine);
  const sh = shake(tt, 4 * popK(tt, cu().three, cu().three + 0.35, 0.02, 0.3), 30, 3);
  return { x: 560 + 4 * k + sh[0] / 2.5, y: 956 - 10 * k + sh[1] / 2.5, zoom: 2.55 - 0.1 * k, rot: 0 };
}
function hookArms(tt) {
  const c = cu(), A = OC_POSES.sit(), B = OC_POSES.count();
  const tk = [c.has - 0.05, c.has + 0.38, c.three - 0.12];
  for (const [j, i] of [[0, 5], [1, 6], [2, 7]]) A[i] = ocMix([A[i]], [B[i]], ramp(tt, tk[j], tk[j] + 0.28, E.outBack))[0];
  return A;
}
function hookDraw(cam, tt, t, o = {}) {
  const c = cu();
  reefBack(cam, t); reefSand(cam, t); reefRock(cam, t);
  // the octopus: watching him, then (on "An octopus has...") turning to us, smug, counting its hearts on three arms
  const turn = ramp(tt, c.octo - 0.1, c.octo + 0.25), proud = ramp(tt, c.three, c.three + 0.2);
  const look = [lerp(-0.75, 0.05, turn), lerp(0.1, 0.25, turn)];
  const mood = tt < c.octo ? 'calm' : (tt < c.three ? 'smug' : 'proud');
  const blinkO = popK(tt, 1.0, 1.16, 0.06, 0.06);
  const arms = hookArms(tt);
  applyCam(cam);
  const P = octoDraw(ctx, OCT.x, OCT.y + 2 * Math.sin(t * ohW().bob), OCT.s, t, { arms, look, mood, blink: blinkO, inflate: 0.15 * popK(tt, c.three, c.three + 0.4, 0.05, 0.3) });
  // the hearts it holds up, one on each raised arm tip, popping as each arm arrives
  const tk = [c.has - 0.05, c.has + 0.38, c.three - 0.12], tips = [];
  for (const [j, i] of [[0, 5], [1, 6], [2, 7]]) tips.push({ p: [570 + 50 * j, 794 + 6 * Math.abs(j - 1)], k: ramp(tt, tk[j] + 0.16, tk[j] + 0.4, E.outBack), j });
  // the hiker: holding the stethoscope to it; "one heart": his free hand up with one heart; THREE: eyes wide
  const st0 = ramp(tt, c.three, c.three + 0.12), raise = ramp(tt, c.one - 0.05, c.one + 0.25, E.outBack) * (1 - ramp(tt, c.three + 0.4, c.three + 0.7));
  const face = lerpFace(lerpFace(FACES.calm, { ...FACES.calm, lookX: 0.9, lookY: -0.1, mouth: 'flat', mouthOpen: 0.2 }, 1), FACES.startled, st0);
  face.lookX = lerp(0.9, 0.7, st0); face.blink = popK(tt, 2.3, 2.46, 0.06, 0.06);
  const hero = dvHero(cam, t, { x: HERO.x, y: HERO.y + 3 * Math.sin(t * ohW().bob + 1), s: HERO.s, face, disc: DISC0,
    headRot: -0.04 * st0, headDY: -6 * st0, bubbles: 0.25, gasp: ramp(tt, c.three + 0.05, c.three + 0.7) * (1 - ramp(tt, c.three + 0.7, c.three + 0.9)) });
  // his single heart over his raised hand
  const hand = ohS(cam, [HERO.x - 22, HERO.y - 634]);
  reefFront(cam, t, { kelp: true });
  return { tips, hand, raise, P };
}
// the hearts that pop over the hands: screen space, in the overlay
function hookHearts(cam, tt, H) {
  const c = cu();
  if (H.raise > 0.02) { const pk = 1 + 0.15 * Math.max(0, Math.sin((tt - c.one) * 9)) * popK(tt, c.one, c.three, 0.05, 0.1); heartIcon(H.hand[0], H.hand[1], 1.5 * H.raise * pk, 1);
    bigWord('×1', H.hand[0] + 112, H.hand[1] + 6, 96, '#FFFFFF', E.outBack(clamp(H.raise)), 0.06); }
  for (const tp of H.tips) {
    if (tp.k <= 0.01) continue;
    const s = ohS(cam, tp.p), pk = 1 + 0.2 * ocPulse(tt, 0.1 * (2 - tp.j));
    heartIcon(s[0], s[1], 1.3 * tp.k * pk, 1);
  }
  const k3 = popK(tt, c.three, 99, 0.12, 0.1);
  if (k3 > 0.01) { const s3 = ohS(cam, [712, 800]); bigWord('×3', s3[0], s3[1] + 4, 110, '#FFD447', E.outBack(clamp(k3)), -0.06); }
}

SC.hook = (lt, t, shot) => {
  const cam = hookCam(lt);
  const H = hookDraw(cam, lt, t);
  return { glow: 0.8, overlay: () => hookHearts(cam, lt, H) };
};

// ---------------------------------------------------------------- the glass octopus: two hearts just for its gills
SC.xray = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, tt = t;
  const gill = ohO(OCT, [-36, -116]), eff = ohO(OCT, [-28, -128]), big = ohO(OCT, OC_ORG.big);
  const cam0 = hookCam(T0 - 0.0);
  const cam = camKeys(t, [[T0, cam0.x, cam0.y, cam0.zoom], [c.just, 612, 930, 3.3], [c.its, 612, 930, 3.3], [c.squeezes, gill[0] - 6, gill[1] + 8, 4.1],
    [c.gills2_end, gill[0] - 6, gill[1] + 8, 4.1], [c.floppy, eff[0] + 8, eff[1] + 26, 4.0], [shot.end, big[0] - 30, big[1] + 10, 3.9]]);
  reefBack(cam, t, { dim: 0.25 }); reefSand(cam, t); reefRock(cam, t);
  applyCam(cam);
  // the blood's clock: normal, then the squeeze (fast through the gills), then floppy (droop, dawdle)
  const sq = ramp(t, c.squeezes - 0.1, c.squeezes + 0.25) * (1 - ramp(t, c.comes - 0.2, c.comes + 0.2));
  const sqz = sq * (0.5 + 0.5 * Math.sin((t - c.squeezes) * 13));
  const sag = ramp(t, c.out - 0.1, c.floppy + 0.35, E.outBack);
  const lightGill = 0.35 + 0.65 * popK(t, c.two - 0.05, 99, 0.2, 0.1), lightBig = 0.35;
  const hs = ohHearts(t);
  const o = { arms: OC_POSES.sit(), look: [-0.7, 0.1], xray: 1, hearts: hs, sag, squeeze: [sqz, sqz * 0.6], gillRate: 1 + 2.5 * sq, lightGill, lightBig, flowT: t };
  octoDraw(ctx, OCT.x, OCT.y + 2 * Math.sin(t * ohW().bob), OCT.s, t, o);
  // the gill hearts glow
  applyCam(cam); octoHeartGlow(gctx, OCT.x, OCT.y + 2 * Math.sin(t * ohW().bob), OCT.s, { hearts: { gl: hs.gl * lightGill, gr: hs.gr * lightGill, big: 0.2 } });
  // he leans in from the left edge, eyes through the mask on the glass octopus
  const face = { ...FACES.calm, lookX: 0.95, lookY: -0.2, eyeOpen: 1.2, pupil: 0.8, mouth: 'o', mouthOpen: 0.3, browY: 0.8 };
  face.blink = popK(t, 8.4, 8.56, 0.06, 0.06);
  dvHero(cam, t, { x: HERO.x + 50, y: HERO.y + 3 * Math.sin(t * ohW().bob + 1), s: HERO.s, face, disc: DISC0, headRot: 0.12, bubbles: 0.2, fog: false });
  reefFront(cam, t, { kelp: false });
  const flash = 0.6 * (1 - ramp(lt, 0, 0.35));
  return {
    glow: 0.9, flash,
    overlay: () => {
      const gL = ohS(cam, ohO(OCT, OC_ORG.gh[0])), gR = ohS(cam, ohO(OCT, OC_ORG.gh[1]));
      const kG = popK(t, c.just, c.its - 0.1, 0.12, 0.12);
      ohTag(300, 1060, 'GILL HEART', '#FF86A6', kG, [gL[0] - 10, gL[1] + 10], 40);
      ohTag(790, 1060, 'GILL HEART', '#FF86A6', kG, [gR[0] + 10, gR[1] + 10], 40);
      const kC = popK(t, c.blue, c.comes - 0.15, 0.12, 0.12), bv = ohS(cam, ohO(OCT, [-20, -40]));
      ohTag(540, 560, 'COPPER, NOT IRON', '#7FE9FF', kC, null, 40);
      const kF = popK(t, c.floppy - 0.05, 99, 0.12, 0.1), fp = ohS(cam, ohO(OCT, [-30, -112 + 40 * sag]));
      ohTag(330, 560, 'LOW PRESSURE', '#C8A8FF', kF, [fp[0], fp[1]], 40);
    },
  };
};

// ---------------------------------------------------------------- heart number three: the punch, out to every arm
SC.third = (lt, t, shot) => {
  const c = cu(), T0 = shot.start;
  const big = ohO(OCT, OC_ORG.big);
  const cam = camKeys(t, [[T0, big[0] - 30, big[1] + 10, 3.9], [c.three2, big[0] - 10, big[1] + 30, 3.5], [c.pumps + 0.1, big[0] - 10, big[1] + 30, 3.4],
    [c.over, 560, 1010, 1.75], [shot.end, 560, 1010, 1.68]]);
  const sh = shake(t, 10 * popK(t, c.pumps, c.pumps + 0.5, 0.02, 0.45), 26, 5);
  cam.x += sh[0] / cam.zoom; cam.y += sh[1] / cam.zoom;
  reefBack(cam, t, { dim: 0.2 }); reefSand(cam, t); reefRock(cam, t);
  applyCam(cam);
  const punch = Math.max(popK(t, c.pumps - 0.04, c.pumps + 0.55, 0.06, 0.45), 0.6 * popK(t, c.again - 0.05, c.again + 0.35, 0.06, 0.3));
  const sag = 1 - ramp(t, c.pumps - 0.05, c.pumps + 0.3);
  const hs = ohHearts(t);
  // the arms fling out with the blast, then settle
  const fl = popK(t, c.pumps, c.over + 0.4, 0.12, 0.6);
  const arms = OC_POSES.sit().map((A, i) => Object.assign({}, A, { a: A.a * (1 + 0.25 * fl), tip: A.tip * (1 - 0.6 * fl), wave: A.wave + 0.2 * fl }));
  const tips = ramp(t, c.pumps + 0.15, c.pumps + 0.6) * (1 - 0.6 * ramp(t, c.again_end, shot.end));
  const o = { arms, look: [-0.5, 0.1], xray: 1, hearts: hs, sag, punch, glowTips: tips, lightGill: 0.6, lightBig: ramp(t, c.so3, c.three2), flowT: t, mood: 'proud' };
  octoDraw(ctx, OCT.x, OCT.y, OCT.s, t, o);
  applyCam(cam); octoHeartGlow(gctx, OCT.x, OCT.y, OCT.s, o);
  // the blast reaches him: hair and bubbles blown back, eyes wide
  const wow = ramp(t, c.pumps + 0.1, c.pumps + 0.3);
  const face = lerpFace({ ...FACES.calm, lookX: 0.9, lookY: -0.2 }, { ...FACES.startled, lookX: 0.7 }, wow);
  dvHero(cam, t, { x: HERO.x + 50 - 40 * wow, y: HERO.y, s: HERO.s, face, disc: DISC0, headRot: 0.12 - 0.16 * wow, bubbles: 0.3 + 0.7 * wow, gasp: popK(t, c.pumps + 0.1, c.pumps + 0.8, 0.05, 0.3) });
  reefFront(cam, t);
  return {
    glow: 0.95, zblur: 0.06 * popK(t, c.pumps, c.pumps + 0.3, 0.02, 0.25), zcx: 540, zcy: 900,
    overlay: () => {
      const b = ohS(cam, big);
      ohTag(540, 560, 'BODY HEART', '#FF5A6E', popK(t, c.three2 - 0.05, c.over, 0.12, 0.12), [b[0], b[1] - 20], 44);
    },
  };
};

// ---------------------------------------------------------------- you do this too: two pumps, glued together
SC.you = (lt, t, shot) => {
  const c = cu(), T0 = shot.start;
  const chest = [HERO.x + 6, HERO.y - 322];
  const cam = camKeys(t, [[T0, 520, 1060, 1.9], [c.yours, 500, 1080, 2.15], [shot.end, 492, 1086, 2.25]]);
  reefBack(cam, t); reefSand(cam, t); reefRock(cam, t);
  // the octopus (back in its skin), reaching an arm tip to tap his chest
  const poke = ramp(t, c.you2 - 0.1, c.do_ === undefined ? c.too - 0.2 : c.too, E.outBack) * (1 - ramp(t, c.yours + 0.2, c.yours + 0.6));
  const arms = OC_POSES.sit();
  const tgt = [(chest[0] + 70 - OCT.x) / OCT.s, (chest[1] - 30 - OCT.y) / OCT.s];
  arms[2] = ocMix([arms[2]], [ocReachArm(2, tgt, 0.9)], poke)[0];
  applyCam(cam);
  const nod = 0.05 * Math.sin(Math.max(0, t - c.glued) * 12) * popK(t, c.glued, c.together_end, 0.05, 0.2);
  octoDraw(ctx, OCT.x, OCT.y + 2 * Math.sin(t * ohW().bob), OCT.s, t, { arms, look: [-0.8, 0.5], mood: t < c.glued ? 'calm' : 'smug', rot: nod });
  // him: looks down at his chest, then at us, sheepish
  const down = ramp(t, c.you2, c.you2 + 0.3) * (1 - ramp(t, c.glued - 0.1, c.glued + 0.2));
  const face = lerpFace({ ...FACES.calm, lookX: 0.6, lookY: 0 }, { ...FACES.worried, lookX: 0.1, lookY: 1, mouth: 'o', mouthOpen: 0.3 }, down);
  if (t > c.glued) Object.assign(face, { mouth: 'grin', mouthOpen: 0.5, lookX: 0, lookY: 0, browY: 0.6 });
  dvHero(cam, t, { x: HERO.x, y: HERO.y + 3 * Math.sin(t * ohW().bob + 1), s: HERO.s, face, disc: null, scope: true, headRot: 0.12 * down, headDY: 8 * down, bubbles: 0.2,
    handL: [HERO.x - 40, HERO.y - 250], post: (lc) => {} });
  applyCam(cam);
  const win = ramp(t, c.do_ === undefined ? c.too - 0.15 : c.too, (c.too) + 0.3);
  const beat = ocPulse(t, 0);
  dvHeartWindow(ctx, chest[0], chest[1], 92, win, beat, ramp(t, c.tape, c.tape + 0.14), ramp(t, c.two2 - 0.05, c.pumps2 + 0.2), t);
  reefFront(cam, t);
  return {
    glow: 0.8, push: { k: 1 + 0.03 * lt / (shot.end - shot.start), cx: 540, cy: 900 },
    overlay: () => {
      const L = ohS(cam, [chest[0] - 80, chest[1] - 90]), R = ohS(cam, [chest[0] + 86, chest[1] + 72]);
      const kl = popK(t, c.two2, 99, 0.12, 0.1);
      ohTag(250, 600, 'TO LUNGS', '#AEB4FF', kl, [L[0], L[1]], 40);
      ohTag(740, 1150, 'TO BODY', '#FF8FA6', kl, [R[0], R[1]], 40);
    },
  };
};

// ---------------------------------------------------------------- when it swims, the big heart stops (for a moment)
function ohEcg(t, x, y, w, h, k, flat0, flat1) {
  if (k <= 0.01) return;
  const c = ctx; screenSpace();
  c.save(); c.translate(x, y); const s = E.outBack(clamp(k)); c.scale(s, s);
  rrect(c, -w / 2, -h / 2, w, h, 22); c.fillStyle = 'rgba(6,16,28,0.86)'; c.fill(); c.lineWidth = 4; c.strokeStyle = 'rgba(120,255,190,0.7)'; c.stroke();
  c.font = '900 30px Montserrat'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = '#FF7A90'; c.fillText('BIG HEART', -w / 2 + 26, -h / 2 + 32);
  const flatNow = t >= flat0 && t < flat1;
  c.fillStyle = flatNow ? '#FF5A6E' : '#4DFFB4'; c.textAlign = 'right'; c.fillText(flatNow ? 'PAUSED' : 'BEATING', w / 2 - 26, -h / 2 + 32);
  // the trace: the last 2.4 s, newest on the right
  const span = 2.4, x0 = -w / 2 + 24, x1 = w / 2 - 24, yb = 18;
  c.beginPath();
  for (let i = 0; i <= 220; i++) {
    const u = i / 220, tt = t - span * (1 - u);
    let v = 0;
    if (!(tt >= flat0 && tt < flat1)) for (const b of cu().beats) { const d = tt - b; if (d > -0.05 && d < 0.18) v += d < 0.02 ? -Math.sin((d + 0.05) / 0.07 * Math.PI) * 1.0 : Math.exp(-(((d - 0.08) / 0.03) ** 2)) * 0.4; }
    c.lineTo(lerp(x0, x1, u), yb + v * 46);
  }
  c.lineWidth = 6; c.strokeStyle = flatNow ? '#FF5A6E' : '#4DFFB4'; c.lineJoin = 'round'; c.stroke();
  circle(c, x1, yb, 8, flatNow ? '#FF5A6E' : '#4DFFB4');
  c.restore();
}
function swimOcto(t) {   // where the octopus is: on its rock, then jetting up and right, then gliding down to the sand
  const c = cu(), j = ramp(t, c.swims - 0.05, c.big + 0.1, E.outCubic), back = ramp(t, c.restart, cu().walk - 0.3, E.inOutSine);
  const x = lerp(OCT.x, 900, j), y = lerp(OCT.y, 700, j);
  return { x: lerp(x, 880, back * 0), y: lerp(y, y + 60, back), j, back };
}
SC.swim = (lt, t, shot) => {
  const c = cu(), T0 = shot.start;
  const O = swimOcto(t);
  const cam = camKeys(t, [[T0, 560, 990, 1.65], [c.swims, 560, 990, 1.6], [c.big - 0.1, 700, 850, 1.38], [c.stops, 880, 610, 2.5], [c.for - 0.05, 884, 614, 2.6], [c.restart + 0.35, 690, 860, 1.36], [shot.end, 680, 880, 1.36]]);
  const sh = shake(t, 6 * popK(t, c.swims, c.swims + 0.4, 0.02, 0.35), 26, 9);
  cam.x += sh[0] / cam.zoom; cam.y += sh[1] / cam.zoom;
  reefBack(cam, t); reefSand(cam, t); reefRock(cam, t);
  applyCam(cam);
  // the octopus: puffs up (inflate), JETS (arms trail, siphon blast), glides; turns to glass on "its big heart"
  const inf = ramp(t, c.octo2 - 0.1, c.swims, E.inOutSine) * (1 - ramp(t, c.swims, c.swims + 0.2));
  const jet = popK(t, c.swims - 0.05, c.big + 0.25, 0.08, 0.35);
  const arms = ocMix(OC_POSES.sit(), OC_POSES.jet(), Math.max(jet, 0.7 * O.j * (1 - O.back)));
  const rot = lerp(0, -0.85, ramp(t, c.swims - 0.1, c.swims + 0.25)) * (1 - ramp(t, c.big, c.stops, E.inOutSine) * 0.6) * (1 - O.back);
  const xr = t >= c.heart_s - 0.12 ? 1 : 0;
  const flat = t >= c.pause0 && t < c.restart;
  const hs = ohHearts(t);
  if (flat) hs.big = 0;
  const thump = popK(t, c.restart, c.restart + 0.4, 0.04, 0.35);
  const o = { arms, rot, look: [-0.4, 0.3], mood: flat ? 'focus' : 'calm', inflate: inf, siphon: jet, xray: xr, hearts: hs, flat, punch: 0.6 * thump, flowT: flat ? c.pause0 + (t - c.pause0) * 0.15 : t, lightBig: 1, lightGill: 1, sag: flat ? 0.6 : 0 };
  octoDraw(ctx, O.x, O.y, OCT.s, t, o);
  if (xr) { applyCam(cam); octoHeartGlow(gctx, O.x, O.y, OCT.s, o); }
  // the stethoscope's chest piece stays stuck to its mantle: the tube stretches across the water
  const ang = rot, mx = -48, my = -82;
  const disc = [O.x + (mx * Math.cos(ang) - my * Math.sin(ang)) * OCT.s, O.y + (mx * Math.sin(ang) + my * Math.cos(ang)) * OCT.s];
  // him: yanked forward, then (STOPS) panics, then sags with relief
  const yank = ramp(t, c.swims, c.swims + 0.35, E.outBack) * (1 - 0.6 * ramp(t, c.big, c.stops));
  const panic = popK(t, c.stops, c.restart + 0.1, 0.1, 0.25), relief = ramp(t, c.restart + 0.1, c.restart + 0.5);
  let face = lerpFace({ ...FACES.calm, lookX: 0.9, lookY: -0.6 }, { ...FACES.shock, lookX: 0.8, lookY: -0.8 }, panic);
  if (relief > 0.5) face = { ...FACES.grin, lookX: 0.8, lookY: -0.7, mouthOpen: 0.6 };
  dvHero(cam, t, { x: HERO.x + 30 * yank, y: HERO.y - 20 * yank, s: HERO.s, face, disc: [lerp(DISC0[0], disc[0], ramp(t, c.swims - 0.05, c.swims + 0.05)), lerp(DISC0[1], disc[1], ramp(t, c.swims - 0.05, c.swims + 0.05))],
    discK: 1, headRot: 0.08 * yank - 0.05 * panic, sag: 0.2, bubbles: 0.25 + 0.6 * panic, gasp: popK(t, c.stops + 0.05, c.stops + 0.75, 0.05, 0.3), bendR: -1 });
  reefFront(cam, t);
  return {
    glow: 0.9, blur: jet > 0.3 ? [10 * jet, -8 * jet] : null, flash: 0.35 * popK(t, c.heart_s - 0.12, c.heart_s + 0.1, 0.02, 0.18),
    overlay: () => {
      const kE = popK(t, c.heart_s - 0.2, 99, 0.15, 0.1);
      ohEcg(t, 540, 560, 640, 170, kE, c.pause0, c.restart);
    },
  };
};

// ---------------------------------------------------------------- so it would rather walk (on two arms, wrapped up)
SC.walk = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0;
  const k = inv(T0, shot.end, t);
  const ox = lerp(460, 740, k), ph = (t - T0) * 9.5;
  const oy = RF_SAND_Y - 136 + 10 * Math.abs(Math.sin(ph));
  const cam = { x: lerp(520, 590, E.inOutSine(k)), y: 1262, zoom: 2.05, rot: 0 };
  reefBack(cam, t); reefSand(cam, t); reefRock(cam, t);
  applyCam(cam);
  // him, floating behind on the left, deadpan, watching it go
  const face = { ...FACES.annoyed, lookX: 0.8, lookY: 0.4, blink: 0.35 };
  dvHero(cam, t, { x: cam.x - 150, y: HERO.y + 30, s: 0.8, face, disc: null, scope: true, handL: null, bubbles: 0.15 });
  applyCam(cam);
  octoDraw(ctx, ox, oy, 1.05, t, { arms: ocWalkPose(ph), look: [0.6, 0.1], mood: 'smug', rot: 0.06 * Math.sin(ph), sy: 1 + 0.04 * Math.sin(ph * 2) });
  // little puffs of sand at each step
  applyCam(cam);
  for (let i = 0; i < 7; i++) { const ts = T0 + (i + 0.5) * (Math.PI / 9.5); if (t < ts || t > ts + 0.5) continue; const u = (t - ts) / 0.5, sx = lerp(460, 740, inv(T0, shot.end, ts)) + (i % 2 ? 40 : -40);
    softDot(ctx, sx, RF_SAND_Y + 4 - 16 * u, 14 + 26 * u, '#E8DDB0', 0.5 * (1 - u)); }
  reefFront(cam, t, { kelp: false });
  return { glow: 0.8 };
};

// ---------------------------------------------------------------- three hearts... and it still skips cardio
SC.button = (lt, t, shot) => {
  const c = cu(), D = DUR(), tt = t - D;   // tt < 0: the picture of frame 1 at the very end
  if (t >= c.loop_in) {   // the loop: frame 1's own picture, played at negative time
    const cam = hookCam(tt);
    const H = hookDraw(cam, tt, t);
    return { glow: 0.8, overlay: () => hookHearts(cam, tt, H) };
  }
  const cam = camKeys(t, [[shot.start, 660, 1150, 1.45], [c.and_b, 670, 1155, 1.45], [c.skips + 0.1, 728, 1196, 1.95], [c.loop_in, 734, 1200, 2.02]]);
  reefBack(cam, t); reefSand(cam, t); reefRock(cam, t);
  reefTreadmill(cam, t, 810, RF_SAND_Y + 8, { s: 1.35, flip: true });
  applyCam(cam);
  // the octopus, lounging on its rock, three lazy hearts above it
  const glance = ramp(t, c.skips - 0.1, c.skips + 0.2);
  const o = { arms: OC_POSES.lounge(), rot: -0.22, look: [lerp(0.1, 0.9, glance), lerp(-0.2, 0.3, glance)], mood: glance > 0.5 ? 'smug' : 'lazy' };
  octoDraw(ctx, OCT.x, OCT.y + 6, OCT.s, t, o);
  // (he is off catching his breath: the loop brings him back with the stethoscope)
  reefFront(cam, t, { kelp: false });
  return {
    glow: 0.8,
    overlay: () => {
      const top = ohS(cam, ohO(OCT, [0, -222]));
      for (let i = 0; i < 3; i++) { const k = ramp(t, c.three3 + i * 0.12, c.three3 + i * 0.12 + 0.3, E.outBack) * (1 - ramp(t, c.skips - 0.25, c.skips - 0.05)), bob = 10 * Math.sin(t * 2 + i * 2);
        heartIcon(top[0] + (i - 1) * 90, top[1] + bob - Math.abs(i - 1) * -12, 0.95 * k * (1 + 0.15 * ocPulse(t, 0.06 * i)), 1); }
    },
  };
};

// ---------------------------------------------------------------- the cover: the octopus holds up three hearts, he stares
SC.cover = (lt, t, shot) => {
  const c = cu(), tt = c.three + 0.32;
  const cam = { x: 560, y: 930, zoom: 2.25, rot: 0 };
  const H = hookDraw(cam, tt, tt);
  return { glow: 0.8, overlay: () => { hookHearts(cam, tt, H); bigWord('3 HEARTS?!', 540, 1390, 150, '#FFD447', 1, -0.05); }, noCaptions: true };
};

function initScenes2() { initReef(); }
