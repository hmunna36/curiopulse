// Can a Shrimp's Snap Get as HOT as the SUN? 🦐 Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds
// inside the shot, t = seconds in the video) and returns post options for main.js. Every beat comes from a cue: cu().name.
// The set: octopus-hearts' reef four metres down (reef.js) with the rock moved up beside him; the hiker snorkelling
// (diver.js, no stethoscope); the pistol shrimp, its claw, the slow-motion bubble and the flash (ss_shrimp.js).
'use strict';

const cu = () => TLd.cues;
const DUR = () => TL.duration;

const ssPopLight = (lt, t) => {
  const c = cu(), f = popK(t, c.collapse - 0.02, c.collapse + 0.6, 0.02, 0.5);
  return { ...LIGHTS.water, rimAmt: 0.9 + 2.2 * f, rim: [1.0, 0.95, 0.8] };
};
setLights({ hook: (lt, t) => { const c = cu(), f = popK(t, c.bang0 - 0.02, c.bang0 + 0.5, 0.02, 0.45); return { ...LIGHTS.water, rimAmt: 0.9 + 2.0 * f, rim: [1.0, 0.95, 0.8] }; },
  slowmo: LIGHTS.water, pop: ssPopLight, flash: LIGHTS.water, navy: LIGHTS.water, button: LIGHTS.water, cover: LIGHTS.water });

// ---------------------------------------------------------------- the set and the cast's home marks (world px)
RF_ROCK.x = 762; RF_ROCK.top = 968;
const SS_HERO = { x: 452, y: 1330, s: 1 };     // his head lands at ~(462, 860)
const SS_SH = { x: 696, y: 966, s: 0.8 };      // the shrimp on the rock, facing his snapping hand
const SS_HAND = [626, 888];                    // where his snapping wrist goes (dvHero's disc target; the wrist lands 14 px left, 12 down)
const SS_HAND_DOWN = [566, 1010];              // the hand dropped after the blast
let SS_W = null;
const ssW = () => SS_W || (SS_W = { bob: loopW(1.6), sway: loopW(1.1) });
const ssS = (cam, p) => toScreen(cam, p[0], p[1]);
const ssJ = () => ssJetW(SS_SH.x, SS_SH.y, SS_SH.s);           // the jet's mouth (world)
const ssB = (d = 32) => { const J = ssJ(); return [J[0] - d, J[1] - 2]; };   // the bubble's centre, d px in front

function ssTag(x, y, text, col, k, to, size = 40) {
  if (k <= 0.01) return;
  if (to) thinLeader([x, y], to, k, col);
  pill(x, y, text, col, k, size);
}

// ---------------------------------------------------------------- the hero with his snapping hand. A: dvHero's options
// plus snap (0 cocked .. 1 snapped), hand (false: no snapping hand, the rig's own), shades 0..1
function ssHero(cam, t, A) {
  const post = (lc, rr, s2) => {
    if (A.shades > 0.01) {
      lc.save(); lc.translate(s2.x, s2.y); lc.scale(s2.s, s2.s);
      const [hx, hy] = rr.head; lc.translate(hx + (s2.headDX || 0), hy + (s2.headDY || 0)); lc.rotate(rr.lean + (s2.headRot || 0));
      ssShades(lc, A.shades); lc.restore();
    }
    if (A.hand !== false) {
      const wr = [s2.x + rr.wrR[0] * s2.s, s2.y + rr.wrR[1] * s2.s];
      ssSnapHand(lc, wr, rr.armDirR, A.snap || 0, 0.92 * s2.s);
    }
  };
  const face = A.face || FACES.calm;
  return dvHero(cam, t, Object.assign({ scope: false, disc: SS_HAND, bendR: 1, post }, A, { face, post }));
}

// ---------------------------------------------------------------- frame 1, as a function of time (valid at negative
// time: the end of the Short plays the same picture, so the loop is seamless)
function hookCam(tt) {
  const c = cu();
  const k = ramp(tt, 0, 1.6, E.inOutSine), after = ramp(tt, c.bang0 + 0.3, c.hot, E.inOutSine);
  const sh = shake(tt, 14 * popK(tt, c.bang0, c.bang0 + 0.5, 0.02, 0.45), 28, 3);
  return { x: 540 + 4 * k + 8 * after + sh[0] / 2.7, y: 949 - 4 * k + 14 * after + sh[1] / 2.7, zoom: 2.7 + 0.1 * k - 0.32 * after, rot: 0.01 * sh[0] / 14 };
}
function hookState(tt) {
  const c = cu();
  const blast = popK(tt, c.bang0, c.bang0 + 1.1, 0.04, 0.5);
  const cock = ramp(tt, c.cock, c.cock + 0.2, E.outBack) * (1 - ramp(tt, c.bang0, c.bang0 + 0.035));
  const blow = popK(tt, c.bang0 + 0.55, c.sun - 0.2, 0.15, 0.2);       // it blows the "smoke" off its pistol
  const lids = Math.max(popK(tt, c.cute - 0.06, c.bang0 - 0.02, 0.1, 0.04), 0.7 * popK(tt, c.bang0 + 0.3, 99, 0.2, 0.1));
  const drop = tt >= c.bang0 + 0.04 ? 1 : 0;   // the blast knocks his arms out
  return { blast, cock, blow, lids, drop, snap: ramp(tt, c.snap1, c.snap1 + 0.05) };
}
function hookDraw(cam, tt, t, o = {}) {
  const c = cu(), S = hookState(tt);
  reefBack(cam, t); reefSand(cam, t); reefRock(cam, t);
  // the hiker: snaps (proud little grin), the blast pushes him back with his hair and bubbles streaming, then he gapes
  const shock = ramp(tt, c.bang0, c.bang0 + 0.06), daze = ramp(tt, c.bang0 + 0.7, c.bang0 + 1.0);
  let face = lerpFace({ ...FACES.calm, lookX: 0.75, lookY: 0.1 }, { ...FACES.grin, lookX: 0.8, lookY: 0.3, mouthOpen: 0.4 }, ramp(tt, c.snap1, c.snap1 + 0.1) * (1 - shock));
  if (shock > 0) face = lerpFace(face, { ...FACES.startled, lookX: 0.6, lookY: 0.4 }, shock);
  if (daze > 0) face = lerpFace(face, { ...FACES.worried, lookX: 0.8, lookY: 0.55, mouth: 'o', mouthOpen: 0.5, browY: 1.1 }, daze);
  // he follows the thermometer up as it climbs, and goes wide-eyed at the Sun
  const up = ramp(tt, c.gets, c.gets + 0.3) * (1 - ramp(tt, c.sun_end + 0.1, c.sun_end + 0.4));
  if (up > 0) face = lerpFace(face, { ...FACES.worried, lookX: 0.85, lookY: -0.8, mouth: 'o', mouthOpen: 0.45, browY: 1.2 }, up);
  if (tt > c.sun) face = lerpFace(face, { ...FACES.startled, lookX: 0.8, lookY: -0.6 }, ramp(tt, c.sun, c.sun + 0.15) * (1 - ramp(tt, c.sun_end + 0.1, c.sun_end + 0.4)));
  face.blink = Math.max(face.blink || 0, popK(tt, c.bang0 + 1.5, c.bang0 + 1.66, 0.06, 0.06), popK(tt, 4.4, 4.56, 0.06, 0.06));
  const push = S.blast;
  ssHero(cam, t, { x: SS_HERO.x - 34 * push, y: SS_HERO.y + 3 * Math.sin(t * ssW().bob + 1) + 10 * push, s: SS_HERO.s, face,
    headRot: -0.12 * push, headDX: -8 * push, bubbles: 0.2 + 0.6 * push, gasp: popK(tt, c.bang0 + 0.02, c.bang0 + 0.7, 0.04, 0.3), snap: S.snap,
    fog: false, disc: S.drop > 0 ? null : SS_HAND, hand: S.drop > 0 ? false : true });
  // the shrimp: watches him, unimpressed on "Cute", cocks, SNAPS, then blows on its claw like a gunslinger
  applyCam(cam);
  const look = tt < c.bang0 + 0.3 ? [-1, -0.2] : (tt < c.this - 0.1 ? [-0.8, 0.1] : [-0.15, 0.25]);
  ssShrimp(ctx, SS_SH.x, SS_SH.y + 2 * Math.sin(t * ssW().bob), SS_SH.s, t, { cock: S.cock, lids: S.lids, look, wide: 0.6 * popK(tt, c.cock, c.bang0, 0.05, 0.05),
    blink: popK(tt, 0.7, 0.86, 0.06, 0.06), rot: -0.05 * S.blow, glow: popK(tt, c.bang0, c.bang0 + 0.7, 0.02, 0.6) });
  // the smoke off the barrel: a little stream of bubbles from the claw tip
  const J = ssJ();
  if (S.blow > 0.01) rfBubbles(ctx, J[0] - 14, J[1] - 8, t, Math.round(2 + 5 * S.blow), 120 * S.blow, 5, 9, 8);
  // the flash and the shock ring at the bubble, in front of the claw
  const B = ssB(), fk = (tt - c.bang0) / 0.5;
  ssFlash(ctx, B[0], B[1], fk, 30, t, 3);
  applyCam(cam); ssFlashGlow(B[0], B[1], fk, 30);
  // his snap: a tiny "tk" puff at his fingers
  const sp = (tt - c.snap1) / 0.35;
  if (sp > 0 && sp < 1) { const hp = [SS_HAND[0] - 18, SS_HAND[1] - 96]; applyCam(cam);
    for (let i = 0; i < 3; i++) { const by = hp[1] - 30 * sp - i * 8, bx = hp[0] + (i - 1) * 9; ctx.beginPath(); ctx.arc(bx, by, 3 + i, 0, 7); ctx.lineWidth = 1.5; ctx.strokeStyle = `rgba(230,255,252,${0.9 * (1 - sp)})`; ctx.stroke(); } }
  reefFront(cam, t, { kelp: true });
  return { S, B };
}
function hookOverlay(cam, tt, t) {
  const c = cu();
  // the thermometer: the snap's heat climbs (nearly to the top), then the Sun pops on top of it
  const kT = popK(tt, c.gets - 0.1, 99, 0.15, 0.1), lev = 0.86 * ramp(tt, c.gets, c.hot + 0.5, E.inOutCubic);
  const x = 905, yTop = 476, yBot = 760;
  ssThermo(x, yTop, yBot, kT, lev, ramp(tt, c.sun - 0.05, c.sun + 0.25), t);
  const ly = lerp(yBot, yTop + 14, lev);
  ssTag(690, ly, 'SNAP ~4,700°C', '#FF8A4C', ramp(tt, c.hot, c.hot + 0.2), [x - 30, ly], 38);
  ssTag(640, yTop - 46, "SUN'S SURFACE ~5,500°C", '#FFD447', ramp(tt, c.sun + 0.05, c.sun + 0.25), null, 34);
}
SC.hook = (lt, t, shot) => {
  const c = cu(), cam = hookCam(lt);
  hookDraw(cam, lt, t);
  return { glow: 0.85, flash: 0.42 * popK(lt, c.bang0, c.bang0 + 0.16, 0.01, 0.14), overlay: () => hookOverlay(cam, lt, t) };
};

// ---------------------------------------------------------------- SLOW-MO: the claw shuts, the jet, the bubble
// claw angle, jet and bubble radius over the two passes (and the collapse, for the pop shot)
const SS_RMAX = 13;
function ssSlow(t) {
  const c = cu();
  // pass 1: open at the cut, shuts on "bang" (slowly), jet, the bubble grows to "BUBBLE"
  // pass 2: rewind on "The claw" (the bubble shrinks back, the finger re-opens), slams on "slams", the jet tears the water
  // open into the bubble to "open"; it holds, then crushes itself (pop shot)
  const rw = ramp(t, c.the_claw - 0.05, c.slams - 0.08, E.inOutSine);
  let ang, jet, R;
  if (t < c.the_claw - 0.05) {
    const sh = ramp(t, c.bangw - 0.05, c.bangw + 0.45, E.inCubic);
    ang = lerp(1.45, 0.04, sh); jet = ramp(t, c.bangw + 0.3, c.claw, E.outCubic);
    R = SS_RMAX * 0.85 * E.outCubic(ramp(t, c.bangw + 0.45, c.bubble + 0.2));
  } else if (t < c.slams - 0.08) {
    ang = lerp(0.04, 1.45, rw); jet = 1 - rw; R = SS_RMAX * 0.85 * (1 - rw);
  } else {
    const sh = ramp(t, c.slams - 0.08, c.slams + 0.22, E.inCubic);
    ang = lerp(1.45, 0.04, sh); jet = ramp(t, c.slams + 0.1, c.fast + 0.2, E.outCubic) * (1 - 0.6 * ramp(t, c.collapse, c.collapse + 0.3));
    const grow = E.outCubic(ramp(t, c.rips - 0.05, c.open_end, (x) => x));
    const crush = ramp(t, c.crushes - 0.05, c.collapse);
    R = SS_RMAX * grow * Math.pow(Math.max(0, 1 - crush * crush), 0.55);
  }
  return { ang, jet, R, rw, crush: ramp(t, c.crushes - 0.05, c.collapse) };
}
function slowCam(t, T0) {
  const c = cu(), B = ssB(), H = ssHingeW(SS_SH.x, SS_SH.y, SS_SH.s);
  const mid = [lerp(B[0], H[0], 0.55), lerp(B[1], H[1], 0.5) + 2];
  const h0 = hookCam(T0);
  return camKeys(t, [[T0, h0.x, h0.y, h0.zoom], [T0 + 0.4, mid[0] + 8, mid[1] - 6, 8.2], [c.bubble, mid[0] + 4, mid[1] - 5, 8.7], [c.the_claw, mid[0] + 8, mid[1] - 6, 8.35],
    [c.open_end, mid[0] + 2, mid[1] - 4, 8.85], [c.collapse, B[0] + 10, B[1] - 2, 9.5]], E.inOutCubic);
}
function slowDraw(cam, t, o = {}) {
  const c = cu(), Q = ssSlow(t);
  reefBack(cam, t, { dim: 0.18 }); reefSand(cam, t); reefRock(cam, t);
  applyCam(cam);
  // the shrimp, drawn whole (the camera is inside its claw)
  ssShrimp(ctx, SS_SH.x, SS_SH.y, SS_SH.s, t, { cock: clamp((Q.ang - 0.04) / 1.41), look: [-1, 0], lids: 0.5, glow: o.glow || 0 });
  // the jet and the bubble
  const J = ssJ(), B = ssB();
  ssJet(ctx, J, 34, Q.jet, t);
  ssBubble(ctx, B[0], B[1], Q.R, t, { crush: o.crushArrows ? Q.crush : 0, unit: 1 / cam.zoom });
  return Q;
}
function slowBadge(t, k, rewind) {
  if (k <= 0.01) return;
  screenSpace();
  const c = ctx; c.save(); c.translate(540, 500); const s = E.outBack(clamp(k)); c.scale(s, s);
  rrect(c, -170, -34, 340, 68, 34); c.fillStyle = 'rgba(8,16,30,0.82)'; c.fill(); c.lineWidth = 3; c.strokeStyle = rewind ? '#FFD447' : '#7FE9FF'; c.stroke();
  const blink = Math.sin(t * 8) > -0.2;
  if (blink) circle(c, -126, 0, 11, rewind ? '#FFD447' : '#FF4D5E');
  c.font = '900 34px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#FFFFFF';
  c.fillText(rewind ? '◀◀ REWIND' : 'SLOW-MO', 14, 2);
  c.restore();
}
SC.slowmo = (lt, t, shot) => {
  const c = cu(), cam = slowCam(t, shot.start);
  const Q = slowDraw(cam, t);
  // "isn't the claw": a red cross where the fingers meet; "It's a BUBBLE": a ring round the bubble
  const H = ssHingeW(SS_SH.x, SS_SH.y, SS_SH.s), tipW = [H[0] - 40, H[1] + 10];
  return {
    glow: 0.85, flash: 0.35 * (1 - ramp(lt, 0, 0.3)), blur: lt < 0.4 ? [14 * (1 - lt / 0.4), 0] : null,
    overlay: () => {
      slowBadge(t, popK(t, shot.start + 0.3, c.the_claw - 0.05, 0.15, 0.1), false);
      slowBadge(t, popK(t, c.the_claw - 0.05, c.slams - 0.05, 0.1, 0.1), true);
      slowBadge(t, popK(t, c.slams - 0.05, 99, 0.1, 0.1), false);
      const tp = ssS(cam, tipW);
      const kx = popK(t, c.claw - 0.05, c.its - 0.05, 0.12, 0.12);
      if (kx > 0.01) bigX(tp[0], tp[1], 1.2, kx);
      const B = ssS(cam, ssB()), kb = popK(t, c.bubble - 0.05, c.the_claw - 0.1, 0.15, 0.12);
      if (kb > 0.01) { screenSpace(); ctx.beginPath(); ctx.arc(B[0], B[1], (Q.R * cam.zoom + 26) * E.outBack(clamp(kb)), 0, 7); ctx.lineWidth = 7; ctx.strokeStyle = '#7FE9FF'; ctx.setLineDash([18, 12]); ctx.stroke(); ctx.setLineDash([]); }
      ssTag(330, 790, '~90 KM/H JET', '#7FE9FF', popK(t, c.fast, c.open - 0.1, 0.12, 0.12), null, 40);
    },
  };
};

// ---------------------------------------------------------------- the bubble crushes itself: white-hot, BANG; pull back
SC.pop = (lt, t, shot) => {
  const c = cu(), T0 = shot.start;
  const back = ramp(t, c.nearly2 - 0.15, c.five + 0.2, E.inOutCubic);
  const slow = slowCam(t, -99), wide = { x: 540, y: 948, zoom: 2.5 };
  const sh = shake(t, 22 * popK(t, c.collapse, c.collapse + 0.6, 0.02, 0.5), 30, 4);
  const cam = { x: lerp(slow.x, wide.x, back) + sh[0] / slow.zoom, y: lerp(slow.y, wide.y, back) + sh[1] / slow.zoom, zoom: Math.exp(lerp(Math.log(slow.zoom), Math.log(wide.zoom), back)), rot: 0 };
  const fk = (t - c.collapse) / 0.9;
  let Q;
  if (back < 0.02) {
    Q = slowDraw(cam, t, { crushArrows: true, glow: popK(t, c.collapse, c.collapse + 1.2, 0.02, 0.8) });
  } else {
    reefBack(cam, t); reefSand(cam, t); reefRock(cam, t);
    // the hiker in the wash of it: hair standing, mask lenses lit, staring at the readout
    const face = { ...FACES.startled, lookX: 0.7, lookY: 0.2, mouth: 'o', mouthOpen: 0.7 };
    face.blink = popK(t, c.degrees + 0.3, c.degrees + 0.46, 0.06, 0.06);
    ssHero(cam, t, { x: SS_HERO.x - 10, y: SS_HERO.y + 6, s: SS_HERO.s, face, headRot: -0.06, bubbles: 0.5, hand: false, disc: null, fog: false });
    applyCam(cam);
    ssShrimp(ctx, SS_SH.x, SS_SH.y, SS_SH.s, t, { cock: 0, look: [-0.3, 0.2], lids: 0.6, glow: popK(t, c.collapse, c.collapse + 2.4, 0.02, 1.2), rot: -0.05 });
    Q = { R: 0 };
  }
  applyCam(cam);
  const B = ssB();
  ssFlash(ctx, B[0], B[1], fk, 11, t, 5);
  applyCam(cam); ssFlashGlow(B[0], B[1], fk, 11);
  // the afterglow hangs at the spot, white-hot, while the readout climbs
  const hotK = popK(t, c.collapse, c.degrees_end + 0.4, 0.02, 0.4);
  applyCam(cam); softDot(gctx, B[0], B[1], 9 + 5 * Math.sin(t * 40), '#FFFFFF', 0.8 * hotK);
  return {
    glow: 0.95, flash: 0.7 * popK(t, c.collapse, c.collapse + 0.26, 0.01, 0.24), zblur: Math.max(0.08 * popK(t, c.collapse, c.collapse + 0.4, 0.02, 0.3), 0.14 * Math.sin(Math.PI * back)), zcx: 540, zcy: 960,
    overlay: () => {
      // the readout: 0 -> 4,700 °C on "Nearly five thousand degrees"
      const k = popK(t, c.nearly2 - 0.05, 99, 0.15, 0.1), n = Math.round(4700 * E.outCubic(ramp(t, c.nearly2, c.degrees + 0.2)) / 10) * 10;
      if (k > 0.01) { bigWord(n.toLocaleString('en-US') + '°C', 740, 500, 130, '#FF8A4C', E.outBack(clamp(k)), -0.04); }
      ssTag(740, 604, 'FOR A SPLIT SECOND', '#FFD447', popK(t, c.five, 99, 0.15, 0.1), null, 34);
    },
  };
};

// ---------------------------------------------------------------- it even flashes: SHRIMPOLUMINESCENCE (and shades)
SC.flash = (lt, t, shot) => {
  const c = cu(), T0 = shot.start;
  const cam = camKeys(t, [[T0, 540, 948, 2.5], [c.sci, 532, 940, 2.42], [shot.end, 530, 934, 2.38]]);
  reefBack(cam, t); reefSand(cam, t); reefRock(cam, t);
  // the hiker: deadpan, slides sunglasses down over his mask after the flash
  const shades = ramp(t, c.flashes_end + 0.02, c.flashes_end + 0.28);
  const face = { ...FACES.annoyed, lookX: 0.75, lookY: 0.35, blink: 0 };
  if (t > c.shrimpo) Object.assign(face, { mouth: 'flat', browY: 0.6, lookX: 0.2, lookY: 0.1 });
  ssHero(cam, t, { x: SS_HERO.x - 12, y: SS_HERO.y + 3 * Math.sin(t * ssW().bob + 1), s: SS_HERO.s, face, headRot: 0.03, bubbles: 0.2, hand: false, disc: null, shades });
  applyCam(cam);
  // the shrimp: snaps (a little blue-white flash), then turns to us and flexes on its big word
  const sn = ramp(t, c.flashes - 0.25, c.flashes - 0.05) * (1 - ramp(t, c.flashes + 0.02, c.flashes + 0.05));
  const flex = ramp(t, c.shrimpo - 0.1, c.shrimpo + 0.3, E.outBack);
  ssShrimp(ctx, SS_SH.x, SS_SH.y + 2 * Math.sin(t * ssW().bob), SS_SH.s, t, { cock: sn + 0.6 * flex, flex, look: t < c.named ? [-1, 0] : [0.2, 0.3], lids: t < c.named ? 0.4 : 0.6,
    rot: -0.06 * flex, glow: popK(t, c.flashes + 0.02, c.flashes + 0.6, 0.02, 0.4) });
  const B = ssB(), fk = (t - c.flashes - 0.03) / 0.45;
  ssFlash(ctx, B[0], B[1], fk, 16, t, 8); applyCam(cam); ssFlashGlow(B[0], B[1], fk, 16);
  reefFront(cam, t, { kelp: true });
  return {
    glow: 0.9, flash: 0.16 * popK(t, c.flashes + 0.03, c.flashes + 0.2, 0.01, 0.16),
    overlay: () => {
      const k = ramp(t, c.shrimpo - 0.05, c.shrimpo + 0.25);
      neonWord('SHRIMPO-', 610, 490, 110, '#FF8A4C', k, t);
      neonWord('LUMINESCENCE', 610, 640, 100, '#7FE9FF', ramp(t, c.shrimpo + 0.35, c.shrimpo + 0.6), t);
    },
  };
};

// ---------------------------------------------------------------- World War Two: a reef of crackle, a sub's scrambled sonar
const SS_CRK = [];   // where each crackle flash goes (world), seeded once
function ssCrk(i) {
  if (!SS_CRK[i]) { const r = mulberry32(i * 17 + 3); SS_CRK[i] = [70 + r() * 1000, 1040 + r() * 380]; }
  return SS_CRK[i];
}
SC.navy = (lt, t, shot) => {
  const c = cu(), T0 = shot.start;
  const cam = camKeys(t, [[T0, 530, 934, 2.38], [T0 + 0.55, 560, 880, 1.0], [shot.end, 556, 872, 0.96]]);
  reefBack(cam, t); reefSand(cam, t); reefRock(cam, t);
  applyCam(cam);
  // the submarine glides in high on the right, its sonar pinging
  const sx = lerp(1300, 720, ramp(t, T0 + 0.3, shot.end, E.outCubic)), sy = 500 + 6 * Math.sin(t * 1.3);
  ssSub(ctx, sx, sy, 0.9, t);
  applyCam(cam);
  for (let i = 0; i < 3; i++) { const u = ((t - c.two) * 0.9 - i * 0.33); if (u <= 0 || u >= 1) continue;
    ctx.beginPath(); ctx.arc(sx - 270, sy + 4, 40 + 520 * u, Math.PI * 0.55, Math.PI * 1.45); ctx.lineWidth = 6; ctx.strokeStyle = `rgba(160,255,210,${0.6 * (1 - u)})`; ctx.stroke(); }
  // the shrimp's rock and the reef: crackle flashes everywhere
  ssShrimp(ctx, SS_SH.x, SS_SH.y, SS_SH.s, t, { cock: 0.3, look: [0.2, -0.6], lids: 0.4 });
  for (let i = 0; i < c.crackles.length; i++) {
    const tc = c.crackles[i], k = (t - tc) / 0.22; if (k < 0 || k >= 1) continue;
    const P = ssCrk(i); ssFlash(ctx, P[0], P[1], k, 34, t, i % 9 + 1); applyCam(cam); ssFlashGlow(P[0], P[1], k, 40); applyCam(cam);
  }
  // the hiker, small in front, hands over his ears
  const ears = ramp(t, c.crackle - 0.1, c.crackle + 0.2, E.outBack);
  const face = lerpFace({ ...FACES.calm, lookX: 0.5, lookY: -0.6 }, { ...FACES.nervous, lookX: 0.3, lookY: -0.8 }, ears);
  dvHero(cam, t, { x: 300, y: 1560, s: 1.0, face, scope: false, disc: [300 + 62 * ears + 30 * (1 - ears), 1560 - 474 * ears - 300 * (1 - ears)], handL: [300 - 56, 1560 - 478], bubbles: 0.3,
    bendR: -1, bendL: 1, pose: Object.assign({}, DV_FLOAT, { hand: 'open' }) });
  reefFront(cam, t, { kelp: false });
  const noise = ramp(t, c.scrambled - 0.1, c.navys, E.inOutSine);
  return {
    glow: 0.9, blur: lt < 0.5 ? [0, -10 * (1 - lt / 0.5)] : null,
    overlay: () => {
      ssSonar(340, 760, 135, popK(t, c.two - 0.05, 99, 0.15, 0.1), t, noise);
      const kq = popK(t, c.sonar - 0.05, 99, 0.12, 0.1);
      if (kq > 0.01) bigWord('???', 340, 760, 120, '#9CFFC4', E.outBack(clamp(kq)), 0.05);
    },
  };
};

// ---------------------------------------------------------------- the button: a snap-off stand-off, then frame 1
SC.button = (lt, t, shot) => {
  const c = cu(), D = DUR(), tt = t - D;   // tt < 0: the picture of frame 1 at the very end
  if (t >= c.loop_in) {
    const cam = hookCam(tt);
    hookDraw(cam, tt, t);
    return { glow: 0.85, overlay: () => hookOverlay(cam, tt, t) };
  }
  const h0 = hookCam(-1);
  const cam = camKeys(t, [[shot.start, 640, 900, 1.2], [shot.start + 0.5, h0.x + 14, h0.y - 4, h0.zoom - 0.08], [c.snapoff, h0.x + 6, h0.y - 2, h0.zoom - 0.03], [c.loop_in, h0.x, h0.y, h0.zoom]]);
  reefBack(cam, t); reefSand(cam, t); reefRock(cam, t);
  // him: hand up, cocky squint (the challenge); on "snap-off" the shrimp cocks, he gulps and goes back to calm
  const cocky = ramp(t, c.so, c.so + 0.3), gulp = ramp(t, c.snapoff - 0.05, c.snapoff + 0.25), calm = ramp(t, c.snapoff_end + 0.15, c.loop_in);
  let face = lerpFace({ ...FACES.calm, lookX: 0.75, lookY: 0.1 }, { ...FACES.annoyed, lookX: 0.85, lookY: 0.25, mouth: 'grin', mouthOpen: 0.3, blink: 0.35 }, cocky);
  if (gulp > 0) face = lerpFace(face, { ...FACES.nervous, lookX: 0.85, lookY: 0.3 }, gulp);
  if (calm > 0) face = lerpFace(face, { ...FACES.calm, lookX: 0.75, lookY: 0.1 }, calm);
  ssHero(cam, t, { x: SS_HERO.x, y: SS_HERO.y + 3 * Math.sin(t * ssW().bob + 1), s: SS_HERO.s, face, bubbles: 0.2 + 0.5 * popK(t, c.snapoff, c.snapoff + 0.5, 0.05, 0.3), snap: 0 });
  applyCam(cam);
  const cock = ramp(t, c.challenge, c.challenge + 0.3, E.outBack) * (1 - ramp(t, c.snapoff_end + 0.1, c.loop_in));
  ssShrimp(ctx, SS_SH.x, SS_SH.y + 2 * Math.sin(t * ssW().bob), SS_SH.s, t, { cock, look: [-1, -0.2], lids: 0.75 * ramp(t, c.never, c.never + 0.2) * (1 - calm),
    wide: 0, rot: -0.04 * cock });
  // a lone bubble drifts between them like a tumbleweed
  applyCam(cam);
  const u = ramp(t, c.never - 0.2, c.snapoff, (x) => x), bx = lerp(640, 470, u), by = 1010 - 40 * u + 12 * Math.sin(t * 5);
  if (u > 0 && u < 1) { ctx.beginPath(); ctx.arc(bx, by, 9, 0, 7); ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(230,255,252,0.85)'; ctx.stroke(); circle(ctx, bx - 3, by - 3, 2.5, 'rgba(255,255,255,0.9)'); }
  reefFront(cam, t, { kelp: true });
  return { glow: 0.85, blur: lt < 0.45 ? [-12 * (1 - lt / 0.45), 0] : null };
};

// ---------------------------------------------------------------- the cover: the snap's flash in his face
SC.cover = (lt, t, shot) => {
  const c = cu(), tt = c.bang0 + 0.07;
  const cam = { x: 505, y: 940, zoom: 2.25, rot: 0 };
  hookDraw(cam, tt, tt);
  return { glow: 0.9, overlay: () => { bigWord('SUN-HOT', 540, 1250, 190, '#FFD447', 1, -0.05); bigWord('SNAP?!', 540, 1440, 190, '#FF8A4C', 1, 0.03); }, noCaptions: true };
};

function initScenes2() { initReef(); }
