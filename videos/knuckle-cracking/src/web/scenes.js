// What Happens When You CRACK Your Knuckles? Short: the shots in his room. Each SC.<id>(lt, t, shot) draws one frame
// (lt = seconds inside the shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
// The shots inside the knuckle are in scenes_in.js, the doctor and the lightbox in scenes_doc.js.
'use strict';

const cu = () => TLd.cues;
// e^(-k (t - t0)) after t0, else 0
const decay = (t, t0, k) => (t >= t0 ? Math.exp(-(t - t0) * k) : 0);
function blinkAt(t, seed = 1, every = 3.1) { const p = ((t + seed * 1.37) % every) / every; return p > 0.955 ? 1 : 0; }

const FACE_FOCUS = Object.assign({}, FACES.calm, { lookX: 0, lookY: 0.95, browY: -0.2, browTilt: -0.55, eyeOpen: 1.02, mouth: 'flat', mouthOpen: 0.15, blink: 0.1 });
const FACE_STRAIN = Object.assign({}, FACES.nervous, { lookX: 0, lookY: 0.9, eyeOpen: 0.92, pupil: 0.9, browY: -0.5, browTilt: -0.95, mouth: 'grimace', mouthOpen: 1, blink: 0.5 });
const FACE_BLISS = Object.assign({}, FACES.grin, { blink: 1, browY: 1.3, browTilt: 0.5, mouthOpen: 1 });
const FACE_CAUGHT = Object.assign({}, FACES.startled, { lookX: 0.95, lookY: -0.1, mouth: 'grimace', mouthOpen: 1, eyeOpen: 1.45, pupil: 0.48, browY: 1.5, browTilt: 0.6 });
const FACE_DEADPAN = Object.assign({}, FACES.annoyed, { lookX: 0, lookY: 0, blink: 0.34, browY: -0.1, browTilt: -0.15, mouth: 'flat', mouthOpen: 0 });
const FACE_SORRY = Object.assign({}, FACES.grin, { lookX: 0, lookY: 0, eyeOpen: 1.08, pupil: 0.9, browY: 1.35, browTilt: 1.2, mouthOpen: 0.62 });
const FACE_SIDE = Object.assign({}, FACES.nervous, { lookX: 0.95, lookY: -0.1, eyeOpen: 1.15, pupil: 0.8, browY: 0.9, browTilt: 0.9, mouth: 'wavy', mouthOpen: 0.3 });

// where frame 1 is shot from: close on his face and his locked fingers
const CAM_HANDS = [520, 944, 1.96];
// which knuckle each small tick comes from, in order
const CRK_ORDER = [1, 6, 2, 5, 3, 4];

// His state while he locks his fingers and pushes, as a function of tt = seconds since frame 1 (negative = his hands
// are on their way up: the last frames of the Short are tt < 0, so the picture loops). Returns denHero options.
function lockState(tt) {
  const c = cu();
  const up = tt >= 0 ? 1 : ramp(tt, -0.42, -0.05, E.inOutCubic);
  const wig = tt >= 0 ? 1 - ramp(tt, 0, 0.55) : ramp(tt, -0.2, -0.02);
  let flex = 0.86 * ramp(tt, c.push - 0.1, c.push + 0.42, E.inOutSine) + 0.14 * ramp(tt, c.and, c.crack - 0.03, E.inCubic);
  const hot = [0, 0, 0, 0, 0, 0, 0, 0];
  let pulse = 0;
  c.crk.forEach((tk, i) => { hot[CRK_ORDER[i]] = decay(tt, tk, 9); pulse += decay(tt, tk, 14); });
  flex = clamp(flex + 0.1 * pulse);
  const strain = ramp(tt, c.push - 0.05, c.push + 0.3);
  const face = lerpFace(FACE_FOCUS, FACE_STRAIN, strain);
  if (tt >= 0 && strain < 0.5) face.blink = Math.max(face.blink, blinkAt(tt, 2, 1.9));
  flex = clamp(flex + 0.5 * (tt >= 0 ? Math.exp(-7 * tt) : ramp(tt, -0.12, 0)));        // a first squeeze as the fingers lock (it starts in the last frames of the loop)
  return {
    face, up, flex, wig, hot, wt: tt,
    headDY: 5 * flex + 3 * pulse, headRot: -0.03 * flex + 0.012 * Math.sin(tt * 26) * strain, lean: 0.012 * Math.sin(tt * 2.2),
    lift: 6 * Math.sin(Math.min(Math.max(tt, 0), 0.5) * Math.PI) * (tt < 0.5 ? 1 : 0),
  };
}

// ---------------------------------------------------------------- 1. hook: he locks his fingers and pushes; the knuckles tick
SC.hook = (lt, t, shot) => {
  const c = cu(), S = lockState(t);
  const cam = camKeys(t, [[0, ...CAM_HANDS], [0.36, 520, 941, 2.2], [c.push, 522, 946, 2.3], [shot.end, 524, 950, 2.42]], E.inOutSine);
  let pulse = 0; c.crk.forEach((tk) => { pulse += decay(t, tk, 16); });
  const [qx, qy] = shake(t, 5 * pulse, 30, 3);
  cam.sx = qx; cam.sy = qy;
  const h = denScene(cam, t, { hero: S });
  screenSpace();
  c.crk.forEach((tk, i) => {
    const p = h.knuckles[CRK_ORDER[i]];
    if (!p) return;
    const ps = toScreen(cam, p[0], p[1]);
    denTick(ps[0], ps[1], t - tk, cam.zoom, i);
  });
  const hs = toScreen(cam, h.clasp[0], h.clasp[1]);
  return { glow: 0.8, capY: 1470, zblur: 0.05 * decay(t, 0.02, 9), zcx: hs[0], zcy: hs[1] };
};

// the x-ray over his raised hand (under the camera): a panel with the bones of a hand in it, a scan line, a tag
function scanPanel(cx, cy, k, t, tick) {
  if (k <= 0.01) return;
  const c = ctx, w = 236, h2 = 276;
  c.save(); c.translate(cx - 420 * (1 - E.outCubic(clamp(k))), cy); c.rotate(-0.04);
  rrect(c, -w / 2, -h2 / 2, w, h2, 20); c.fillStyle = '#041225'; c.fill();
  c.save(); rrect(c, -w / 2, -h2 / 2, w, h2, 20); c.clip();
  const g = c.createRadialGradient(0, 0, 10, 0, 0, 190); g.addColorStop(0, '#0C3358'); g.addColorStop(1, '#03101F'); c.fillStyle = g; c.fillRect(-w / 2, -h2 / 2, w, h2);
  if (typeof xrHand === 'function') xrHand(c, null, 4, 104, 0.74, { flip: true, soft: 0.5 });
  const sy = -h2 / 2 + ((t * 0.9) % 1) * h2;
  c.fillStyle = 'rgba(127,233,255,0.22)'; c.fillRect(-w / 2, sy, w, 10);
  c.restore();
  c.lineWidth = 7; c.strokeStyle = '#7FE9FF'; rrect(c, -w / 2, -h2 / 2, w, h2, 20); c.stroke();
  c.font = '900 22px Montserrat'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = '#7FE9FF'; c.fillText('X-RAY', -w / 2 + 16, -h2 / 2 + 24);
  circle(c, w / 2 - 24, -h2 / 2 + 24, 7, Math.floor(t * 3) % 2 ? '#FF5A6E' : '#5A1522');
  c.restore();
  // its glow
  gctx.save(); gctx.translate(cx - 420 * (1 - E.outCubic(clamp(k))), cy); gctx.rotate(-0.04);
  gctx.lineWidth = 12; gctx.strokeStyle = 'rgba(127,233,255,0.45)'; rrect(gctx, -w / 2, -h2 / 2, w, h2, 20); gctx.stroke();
  gctx.restore();
}

// a pill with a green tick (screen space)
function okPill(x, y, k, text, col = '#4DFFB4', size = 46) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.rotate(-0.03); ctx.scale(s, s);
  ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  const tw = ctx.measureText(text).width, w = tw + size * 2.5, h = size * 1.75;
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = 'rgba(6,26,22,0.94)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = col; ctx.stroke();
  ctx.fillStyle = col; ctx.fillText(text, -w / 2 + size * 0.62, 2);
  const tx = w / 2 - size * 1.2;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.2; ctx.beginPath(); ctx.moveTo(tx - size * 0.3, 2); ctx.lineTo(tx - size * 0.02, size * 0.3); ctx.lineTo(tx + size * 0.46, -size * 0.34); ctx.stroke();
  ctx.restore();
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); softDot(gctx, x, y, 200, col, 0.25 * clamp(k)); gctx.restore();
}

// ---------------------------------------------------------------- 2. crack: CRACK! Mom in the doorway. "No bones were harmed."
SC.crack = (lt, t, shot) => {
  const c = cu(), S = lockState(t);
  const hit = t - c.crack;                                                // seconds since the big one
  const out = ramp(t, c.crack, c.crack + 0.13, E.outCubic);               // the camera jumps back
  const cam = camKeys(t, [[shot.start, 524, 950, 2.42], [c.crack, 524, 950, 2.46], [c.crack + 0.13, 610, 884, 1.2], [c.no - 0.12, 616, 884, 1.22], [c.harmed + 0.1, 446, 902, 1.42], [shot.end, 430, 904, 1.47]], E.inOutCubic);
  const [qx, qy] = shake(t, 26 * decay(t, c.crack, 5) + 12 * decay(t, c.door, 7), 30, 5);
  cam.sx = qx; cam.sy = qy;
  const door = ramp(t, c.door - 0.03, c.door + 0.09, E.outCubic);
  const shout = ramp(t, c.mom - 0.08, c.mom + 0.06) * (1 - 0.75 * ramp(t, c.no - 0.2, c.no + 0.1));
  let hero = S;
  if (hit >= 0) {
    const caught = ramp(t, c.door, c.door + 0.07), dead = ramp(t, c.no - 0.22, c.no - 0.04, E.inOutCubic);
    let face = lerpFace(FACE_BLISS, FACE_CAUGHT, caught);
    face = lerpFace(face, FACE_DEADPAN, dead);
    if (dead >= 1) face = Object.assign({}, face, { blink: Math.max(face.blink, blinkAt(t, 4, 1.6)) });
    const hot = [0, 1, 2, 3, 4, 5, 6, 7].map(() => decay(t, c.crack, 6));
    hero = {
      face, hot, up: 1 - ramp(t, c.door + 0.02, c.door + 0.3, E.inOutCubic), flex: 1 - ramp(t, c.crack + 0.08, c.crack + 0.4),
      apart: ramp(t, c.door, c.door + 0.16, E.outCubic) * (1 - ramp(t, c.door + 0.2, c.door + 0.4)),
      headDY: -12 * decay(t, c.crack, 6) * Math.cos(hit * 24) - 10 * decay(t, c.door, 7), headRot: 0.07 * caught * (1 - dead) - 0.05 * decay(t, c.crack, 4),
      headDX: 6 * caught * (1 - dead), jolt: decay(t, c.crack, 7) * Math.cos(hit * 22) + 0.9 * decay(t, c.door, 8),
      frizz: 0.35 * decay(t, c.crack, 2.2), warm: door,
      scan: { k: ramp(t, c.no - 0.2, c.no + 0.12, E.inOutCubic) },
    };
  }
  const h = denScene(cam, t, { hero, door, mom: door > 0 ? { shout, tap: shout < 0.3 } : null, jump: decay(t, c.crack, 5) * Math.abs(Math.cos(hit * 11)) });
  // the x-ray slides over his raised hand
  const sk = ramp(t, c.no - 0.08, c.no + 0.2);
  scanPanel(h.handL[0] - 2, h.handL[1] - 30, sk, t);
  screenSpace();
  // every knuckle goes at once
  if (hit >= 0 && hit < 0.5 && h.knuckles.length) h.knuckles.forEach((p, i) => { const ps = toScreen(cam, p[0], p[1]); denTick(ps[0], ps[1], hit, cam.zoom * 1.5, i, ''); });
  const hs = toScreen(cam, h.clasp[0], h.clasp[1]);
  shockLines(hs[0], hs[1], 150, inv(0, 0.42, hit), 14, '#FFFFFF', 4);
  denCrackWord(430, 548, hit - 0.1, 0.76);          // once the camera is back: over his head, never on his face
  // Mom's line
  const ms = toScreen(cam, DEN.door[0] + DEN.door[2] * 0.5, 690);
  const bk = springStep(t - c.mom, 5, 0.45) * (1 - ramp(t, c.harmed - 0.3, c.harmed));
  denShout(Math.min(ms[0] - 126, 742), ms[1] - 152, bk, [["YOU'LL GET", '#0B0B1A', 52], ['ARTHRITIS!', '#E3182B', 66]], ms[0] - 10, ms[1] - 40, { w: 178, h: 100, size: 62, wob: 0.03 * Math.sin(t * 30) * shout });
  // the verdict on his bones
  const ps = toScreen(cam, h.handL[0], h.handL[1]);
  okPill(Math.max(ps[0] + 16, 330), ps[1] - 268 * cam.zoom / 1.45, springStep(t - c.harmed + 0.06, 5, 0.5), 'NOT BROKEN');
  return {
    glow: 0.84, flash: 0.3 * decay(t, c.crack, 14) + 0.14 * decay(t, c.door, 12), noCaptions: t < c.no - 0.1,
    zblur: 0.1 * decay(t, c.crack, 16) + 0.12 * ramp(t, shot.end - 0.14, shot.end, E.inCubic), zcx: hit < 1 ? hs[0] : ps[0], zcy: hit < 1 ? hs[1] : ps[1] - 40,
  };
};

// a stamp that lands on something (screen space)
function mythStamp(x, y, k, txt = 'MYTH', col = '#E3182B', size = 104, rot = -0.2, alpha = 1) {
  if (k <= 0.01) return;
  const s = lerp(2.6, 1, E.outCubic(clamp(k * 1.6)));
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.globalAlpha = clamp(k * 4) * alpha;
  ctx.font = `400 ${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + 56, h = size * 1.3;
  rrect(ctx, -w / 2, -h / 2, w, h, 16); ctx.fillStyle = 'rgba(255,255,255,0.62)'; ctx.fill();
  ctx.lineWidth = 11; ctx.strokeStyle = col; ctx.stroke();
  rrect(ctx, -w / 2 + 12, -h / 2 + 12, w - 24, h - 24, 9); ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = col; ctx.fillText(txt, 0, 6);
  ctx.restore();
}

// ---------------------------------------------------------------- 9. button: Mom, arms crossed. "Sorry, Mom." He locks his fingers again (the loop)
SC.button = (lt, t, shot) => {
  const c = cu(), DUR = TLd.duration, tt = t - DUR;
  const cam = camKeys(t, [[shot.start, 616, 884, 1.2], [c.sorry, 610, 884, 1.24], [c.loop - 0.06, 606, 886, 1.26], [DUR - 0.05, ...CAM_HANDS], [DUR, ...CAM_HANDS]], E.inOutCubic);
  const stampT = shot.start + 0.3;
  const shut = ramp(t, c.loop - 0.08, c.loop + 0.14, E.inCubic);          // she pulls the door shut behind her
  const door = 1 - shut;
  const [qx, qy] = shake(t, 9 * decay(t, stampT, 9) + 7 * decay(t, c.loop + 0.14, 10), 30, 9);
  cam.sx = qx; cam.sy = qy;
  const sorry = ramp(t, c.sorry - 0.12, c.sorry + 0.08, E.inOutCubic) * (1 - ramp(t, c.mom_end + 0.25, c.loop - 0.02, E.inOutCubic));
  const slump = ramp(t, c.hmph, c.hmph + 0.18, E.inOutCubic);
  let hero;
  if (tt > -0.44) hero = Object.assign({}, lockState(tt), { warm: door * 0.6 });
  else {
    let face = lerpFace(FACE_SIDE, FACE_SORRY, sorry);
    face = lerpFace(face, FACE_FOCUS, ramp(t, c.loop - 0.12, c.loop + 0.04));
    hero = {
      face: Object.assign({}, face, { blink: Math.max(face.blink || 0, blinkAt(t, 6, 2.2) * (1 - sorry)) }),
      up: 0, shrug: sorry * (0.86 + 0.14 * Math.sin(t * 9)), headRot: 0.06 * (1 - sorry) + 0.05 * sorry * Math.sin(t * 5), headDX: 5 * (1 - sorry),
      headDY: -4 * sorry, warm: door,
    };
  }
  const h = denScene(cam, t, { hero, door, mom: door > 0.02 ? { cross: 1 - slump * 0.0, tap: slump < 0.5, slump, look: -1 } : null });
  screenSpace();
  // her line from before, and what the doctor's fifty years did to it
  const ms = toScreen(cam, DEN.door[0] + DEN.door[2] * 0.5, 690);
  const gone = 1 - ramp(t, c.hmph - 0.05, c.hmph + 0.1);
  const bx = Math.min(ms[0] - 126, 742), by = ms[1] - 152;
  denShout(bx, by, gone, [["YOU'LL GET", '#0B0B1A', 52], ['ARTHRITIS!', '#E3182B', 66]], ms[0] - 10, ms[1] - 40, { w: 178, h: 100, size: 62 });
  mythStamp(bx + 56, by + 62, ramp(t, stampT, stampT + 0.16), 'MYTH', '#E3182B', 96, -0.2, gone);
  const hk = springStep(t - c.hmph - 0.04, 5, 0.5) * door;
  denShout(Math.min(ms[0] - 96, 760), ms[1] - 150, hk, [['HMPH.', '#0B0B1A', 60]], ms[0] - 10, ms[1] - 40, { w: 120, h: 70, size: 60, rot: 0.04 });
  const hs = toScreen(cam, h.clasp[0], h.clasp[1]);
  const back = ramp(t, c.loop - 0.06, DUR - 0.05, E.inOutCubic);
  return { glow: 0.84, flash: 0.22 * (1 - ramp(lt, 0, 0.08)) + 0.1 * decay(t, stampT, 12), capY: lerp(1330, 1470, back), zblur: 0.1 * back * (1 - ramp(t, DUR - 0.09, DUR - 0.02)), zcx: hs[0], zcy: hs[1] };
};

// ---------------------------------------------------------------- the cover (rendered on its own, not in the timeline)
const FACE_COVER = Object.assign({}, FACES.startled, { mouth: 'grimace', mouthOpen: 1, lookX: 0, lookY: 0.75, eyeOpen: 1.42, pupil: 0.5, browY: 1.5, browTilt: 0.7 });
SC.cover = (lt, t, shot) => {
  const tt = 2.3, cam = { x: 540, y: 1002, zoom: 1.62, rot: -0.02 };
  const hot = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
  const h = denScene(cam, tt, { hero: { face: FACE_COVER, up: 1, flex: 1, hot, frizz: 0.35, headDY: -6 }, led: 1 });
  const hs = toScreen(cam, h.clasp[0], h.clasp[1]);
  screenSpace();
  // rays behind the words, sparks on the knuckles
  for (const [cc, sc] of [[ctx, 1], [gctx, 0.5]]) {
    cc.save(); cc.setTransform(sc, 0, 0, sc, 0, 0); cc.translate(hs[0], hs[1]);
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + 0.1, r0 = 150 + 14 * (i % 2), r1 = 250 + 60 * (i % 3);
      cc.lineCap = 'round'; cc.lineWidth = cc === gctx ? 18 : 10; cc.strokeStyle = cc === gctx ? 'rgba(255,230,120,0.5)' : '#FFFFFF';
      cc.beginPath(); cc.moveTo(Math.cos(a) * r0, Math.sin(a) * r0 * 0.8); cc.lineTo(Math.cos(a) * r1, Math.sin(a) * r1 * 0.8); cc.stroke();
    }
    cc.restore();
  }
  h.knuckles.forEach((p, i) => { if (i % 2 === 0) { const ps = toScreen(cam, p[0], p[1]); denTick(ps[0], ps[1], 0.1, cam.zoom * 1.5, i, ''); } });
  bigWord("WHAT'S THAT", 540, 1236, 114, '#FFFFFF', 1, -0.03);
  bigWord('CRACK?!', 548, 1416, 212, '#FFD447', 1, 0.02);
  return { glow: 0.86, noCaptions: true, noSubscribe: true, grain: 0 };
};

function initScenes2() {
  initDen();
  if (typeof initJoint === 'function') initJoint();
  if (typeof initClinic === 'function') initClinic();
  }
