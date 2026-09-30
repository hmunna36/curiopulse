// Onion-tears Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;
const pop = (t, a, d = 0.35) => ramp(t, a, a + d, E.outBack);
const FACE_SOB = { eyeOpen: 0.75, pupil: 0.8, lookX: 0, lookY: 0.3, browY: 1.3, browTilt: 1.4, mouth: 'scream', mouthOpen: 0.75, blink: 0.5, cross: 0 };
const FACE_WEEPY = { eyeOpen: 0.95, pupil: 0.9, lookX: 0, lookY: 0.2, browY: 0.9, browTilt: 1.2, mouth: 'wavy', mouthOpen: 0.3, blink: 0.35, cross: 0 };
const FACE_DEADPAN = { eyeOpen: 0.9, pupil: 1, lookX: 0, lookY: 0, browY: -0.1, browTilt: -0.3, mouth: 'flat', mouthOpen: 0, blink: 0.5, cross: 0 };
const FACE_YAWN = { eyeOpen: 0.9, pupil: 1, lookX: 0, lookY: 0, browY: 0.6, browTilt: 0.2, mouth: 'o', mouthOpen: 1.6, blink: 1, cross: 0 };

// chop rhythm: 0..1 knife height, fast on the "chop chop chop" cues
function chopK(t, rate = 2.6) {
  const u = (t * rate) % 1;
  return u < 0.35 ? E.outCubic(u / 0.35) : 1 - E.inCubic((u - 0.35) / 0.65);
}
// onion bits flying off the board after each chop (world coords)
function flyingBits(t, times, x, y, seed = 4) {
  for (let j = 0; j < times.length; j++) {
    const d = t - times[j];
    if (d < 0 || d > 0.9) continue;
    const rng = mulberry32(seed + j * 13);
    for (let i = 0; i < 6; i++) {
      const vx = (rng() - 0.3) * 700, vy = -500 - rng() * 500, g = 2600;
      const px = x + vx * d, py = y + vy * d + 0.5 * g * d * d, a = rng() * 6 + d * 12, r = 10 + rng() * 10;
      ctx.save(); ctx.translate(px, py); ctx.rotate(a);
      ctx.beginPath(); ctx.arc(0, 0, r, 0, 2.4); ctx.lineWidth = 7; ctx.strokeStyle = '#F4EBCF'; ctx.lineCap = 'round'; ctx.stroke();
      ctx.restore();
    }
  }
}
// juice droplets bursting from (x, y): n drops, speed v, over dur seconds (world coords)
function juiceBurst(x, y, t0, t, n, v, seed = 7, dur = 1.1, spread = 1.3) {
  const d = t - t0;
  if (d < 0 || d > dur) return;
  const rng = mulberry32(seed);
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (rng() - 0.5) * spread * 2, sp = v * (0.35 + rng() * 0.8);
    const px = x + Math.cos(a) * sp * d, py = y + Math.sin(a) * sp * d + 0.5 * 1500 * d * d;
    const r = 3 + rng() * 7, al = clamp(1.2 - d / dur);
    circle(ctx, px, py, r, rgba('#E9FFF0', 0.9 * al));
    softDot(gctx, px, py, r * 3, '#9CFFC0', 0.5 * al);
  }
}
function tissueBox(x, y, k, t, pop) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y + (1 - E.outBack(clamp(k), 1.6)) * 400);
  rrect(ctx, -110, -70, 220, 140, 14); ctx.fillStyle = '#7FD1C8'; ctx.fill();
  for (let i = 0; i < 4; i++) circle(ctx, -70 + i * 46, 20, 12, 'rgba(255,255,255,0.35)');
  rrect(ctx, -60, -76, 120, 16, 8); ctx.fillStyle = '#2B6F68'; ctx.fill();
  const p = E.outBack(clamp(pop), 2.4);
  ctx.beginPath(); ctx.moveTo(-40, -70); ctx.quadraticCurveTo(-60, -70 - 120 * p, 0, -70 - 150 * p); ctx.quadraticCurveTo(50, -70 - 120 * p, 40, -70);
  ctx.closePath(); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#D5DCE6'; ctx.stroke();
  ctx.restore();
}
// soap bubbles orbiting a point (world coords)
function suds(x, y, R, t, k, n = 16) {
  if (k <= 0) return;
  for (let i = 0; i < n; i++) {
    const a = t * 2.2 + i / n * 6.283, rr = R * (0.8 + 0.25 * Math.sin(t * 3 + i));
    const px = x + Math.cos(a) * rr * 1.25, py = y + Math.sin(a) * rr * 0.6, r = (10 + 12 * hash(i)) * k;
    ctx.beginPath(); ctx.arc(px, py, r, 0, 7); ctx.fillStyle = 'rgba(220,245,255,0.35)'; ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.stroke();
    circle(ctx, px - r * 0.35, py - r * 0.35, r * 0.25, 'rgba(255,255,255,0.95)');
    softDot(gctx, px, py, r * 2, '#BFF0FF', 0.3 * k);
  }
}

// ---------------------------------------------------------------- 1. hook: the TV chef
SC.hook = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const chopsEnd = c.chops[2] + 0.35, stop = c.suddenly;
  const rate = t < c.chops[0] ? 3.2 : 4.2;
  let ch = t < stop ? chopK(t, rate) : lerp(chopK(stop, rate), 0.2, ramp(t, stop, stop + 0.3));
  const [sx, sy] = shake(t, t < stop ? 5 * ch : 0, 30);
  const cam = camKeys(lt, [[0, 610, 1195, 2.05], [0.9, 590, 1190, 1.7], [1.8, 540, 1160, 1.28], [c.suddenly - 0.1, 540, 1160, 1.3], [D, 520, 1030, 1.9]]);
  cam.sx = sx; cam.sy = sy;
  applyCam(cam);
  kitchenBg(t);
  const wet = ramp(t, 1.8, c.sobbing, E.inOutSine);
  const face = t < c.suddenly ? lerpFace(FACES.grin, FACE_WEEPY, ramp(t, 2.4, 3.8)) : lerpFace(FACE_WEEPY, FACES.nervous, ramp(t, c.suddenly, c.suddenly + 0.4));
  const hatK = ramp(t, c.tv - 0.05, c.tv + 0.3, E.outBack);
  const hits = [0.12, 0.5, 0.88, 1.26, 1.64, 2.0, ...c.chops];
  const nSl = 3 + hits.filter((h) => h < t).length;
  heroChopping(cam, t, { chop: ch, face, wet, hat: hatK, pal: hatK > 0.5 ? PAL_CHEF : PAL, onion: 'whole', slices: nSl, gas: ramp(t, 0.8, 3.5) * 0.8 });
  flyingBits(t, hits, 690, 1280);
  screenSpace();
  return { glow: 0.7, blur: t < stop ? [0, 3 * Math.abs(Math.cos(t * rate * 6.28))] : null, zblur: 0.05 * (1 - ramp(lt, 0, 0.4)) };
};

// ---------------------------------------------------------------- 2. SOBBING
SC.sob = (lt, t, shot) => {
  const c = cu();
  const [sx, sy] = shake(t, 10 * (1 - ramp(lt, 0, 1.2)), 26);
  const cam = { x: 520 + 0 * lt, y: 1040, zoom: 2.05 + 0.1 * lt, rot: 0.02 * Math.sin(lt * 9), sx, sy };
  applyCam(cam);
  kitchenBg(t);
  heroChopping(cam, t, { chop: 0.1, face: FACE_SOB, wet: 1, fountain: 0.6 + 0.4 * ramp(lt, 0, 0.3), hat: 1, pal: PAL_CHEF, onion: 'whole', slices: 12, st: { headRot: 0.04 * Math.sin(lt * 14) } });
  screenSpace();
  bigWord('ONION', 540, 510, 150, '#FFD447', pop(lt, 0.05, 0.3), -0.05);
  bigWord('TEARS?!', 540, 650, 150, '#7FE9FF', pop(lt, 0.2, 0.3), 0.04);
  return { glow: 0.8, flash: 0.5 * (1 - ramp(lt, 0, 0.18)), push: { k: 1 + 0.04 * lt, cx: 540, cy: 900 } };
};

// ---------------------------------------------------------------- 3. deadpan: it's an onion
SC.react = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const two = t >= c.nobody - 0.12;
  const cam = two ? camKeys(t - c.nobody, [[-0.2, 540, 1150, 1.25], [2, 540, 1140, 1.3]])
    : { x: 560, y: 1180, zoom: 2.3 + 0.1 * lt, rot: 0 };
  applyCam(cam);
  kitchenBg(t);
  const r = heroChopping(cam, t, { chop: 0.05, face: two ? lerpFace(FACE_WEEPY, FACE_DEADPAN, ramp(t, c.died, c.died + 0.3)) : FACE_WEEPY, wet: 1, hat: 1, pal: PAL_CHEF,
    onion: 'whole', onionFace: t > c.died_end + 0.1 ? 'wink' : 'smug', onionFaceK: ramp(t, c.its_onion + 0.3, c.its_onion + 0.6), slices: 12 });
  if (!two) { // tears dripping into shot from above
    for (let i = 0; i < 3; i++) {
      const ph = ((lt * 0.8 + i / 3) % 1);
      circle(ctx, 470 + i * 50, lerp(1030, 1290, E.inCubic(ph)), 9, rgba('#AEE8FF', 0.9));
    }
  }
  return { glow: 0.6, zblur: two ? 0.1 * (1 - ramp(t, c.nobody - 0.12, c.nobody + 0.2)) : 0 };
};

// ---------------------------------------------------------------- 8. bless you (tissue)
SC.bless = (lt, t, shot) => {
  const c = cu();
  const cam = { x: 540, y: 1100, zoom: 1.6 + 0.05 * lt, rot: 0 };
  applyCam(cam);
  kitchenBg(t);
  heroChopping(cam, t, { chop: 0.05, face: lerpFace(FACE_WEEPY, FACE_DEADPAN, 0.5), wet: 1, hat: 1, pal: PAL_CHEF, onion: 'whole', slices: 12, knife: false });
  tissueBox(760, 1250, ramp(lt, 0, 0.3), t, ramp(t, c.bless, c.bless + 0.25));
  return { glow: 0.6 };
};

// ---------------------------------------------------------------- 11. rinse cycle
SC.rinse = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 520, y: 1030, zoom: 2.1 + 0.12 * lt / D, rot: 0 };
  applyCam(cam);
  kitchenBg(t);
  const rin = ramp(t, c.rinsing, c.rinsing + 0.3);
  const r = heroChopping(cam, t, { chop: 0.05, face: t < c.youre2 ? FACE_DEADPAN : lerpFace(FACE_DEADPAN, FACES.annoyed, 0.4), wet: 1, hat: 1, pal: PAL_CHEF, onion: 'whole', slices: 12, knife: false });
  for (const [ex, ey] of r.eyes) { // heavy streams down the cheeks
    for (let i = 0; i < 5; i++) {
      const ph = (lt * 1.3 + i / 5) % 1;
      circle(ctx, ex + 3, ey + 20 + ph * 200, 10, rgba('#AEE8FF', 0.9 * (1 - ph)));
    }
  }
  for (const [ex, ey] of r.eyes) suds(ex, ey, 60, t, rin, 10);
  screenSpace();
  bigWord('RINSE CYCLE', 540, 480, 120, '#7FE9FF', pop(t, c.rinsing, 0.3), -0.04);
  return { glow: 0.7 };
};

// ---------------------------------------------------------------- 13. blunt knife vs TV chef
SC.blunt = (lt, t, shot) => {
  const c = cu();
  if (t < c.or_chop - 0.05) { // macro: the blunt knife squishes the onion
    const cam = { x: 560, y: 1170, zoom: 2.4 + 0.08 * lt, rot: 0 };
    applyCam(cam);
    kitchenBg(t);
    kitchenCounter(); cuttingBoard();
    const press = ramp(t, c.blunt, c.blunt + 0.6, E.inOutCubic);
    onionBulb(ctx, KIT.onionX, KIT.onionY, KIT.onionR, t, { squash: press * 0.9 });
    knife(ctx, 800, lerp(1100, 1162, press), Math.PI + 0.02, 0.85, 'blunt');
    juiceBurst(KIT.onionX, KIT.onionY - 50, c.blunt + 0.35, t, 28, 700, 3);
    screenSpace();
    stamp('BLUNT', 540, 560, ramp(t, c.blunt, c.blunt + 0.25), '#FF5A6E', -0.12, 110);
    return { glow: 0.7 };
  }
  // the TV chef, full speed: a fountain of droplets
  const lt2 = t - c.or_chop;
  const [sx, sy] = shake(t, 6, 30);
  const cam = { x: 540, y: 1150, zoom: 1.3 + 0.06 * lt2, rot: 0, sx, sy };
  applyCam(cam);
  kitchenBg(t);
  const ch = chopK(t, 6);
  heroChopping(cam, t, { chop: ch, face: lerpFace(FACES.grin, FACE_SOB, ramp(t, c.sprays, c.more)), wet: ramp(t, c.or_chop, c.more), hat: 1, pal: PAL_CHEF, onion: 'whole', slices: 16,
    fountain: ramp(t, c.more, c.more + 0.3) * 0.8 });
  const more = ramp(t, c.more - 0.2, c.more + 0.2);
  for (let j = 0; j < 14; j++) juiceBurst(KIT.onionX, KIT.onionY - 40, c.or_chop + j * 0.17, t, 10 + Math.round(18 * more), 900 + 700 * more, 20 + j);
  screenSpace();
  bigWord('MORE!', 540, 520, 200, '#FF5A6E', pop(t, c.more, 0.3), -0.06);
  return { glow: 0.75, blur: [0, 5 * ch] };
};

// ---------------------------------------------------------------- 14. button: the onion wins (holds under the subscribe cue)
SC.button = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const giveUp = ramp(t, c.or_just, c.or_just + 0.5);
  const cam = camKeys(t, [[c.sharp - 0.6, 600, 1190, 1.7], [c.slow, 620, 1210, 1.9], [c.or_just - 0.1, 620, 1210, 1.9], [c.or_just + 0.5, 540, 1245, 1.33], [c.tomorrow, 540, 1235, 1.45], [shot.end, 545, 1226, 1.62]]);
  applyCam(cam);
  kitchenBg(t);
  const slow = t > c.slow && t < c.or_just ? E.inOutSine(inv(c.slow, c.or_just - 0.2, t)) : (t >= c.or_just ? 1 : 0);
  let face = FACES.calm;
  if (t >= c.or_just) face = lerpFace(FACES.calm, FACE_SOB, giveUp);
  if (t >= c.tomorrow) face = lerpFace(FACE_SOB, FACE_WEEPY, ramp(t, c.tomorrow, c.tomorrow + 0.4));
  const yawnW = TLd.words.filter((w) => /yawning/i.test(w.w || w.word || '')).map((w) => w.start);
  const yawnT = yawnW.length > 1 ? yawnW[yawnW.length - 1] : shot.end - 1.5;
  if (t >= yawnT - 0.2) face = lerpFace(FACE_WEEPY, FACE_YAWN, ramp(t, yawnT - 0.2, yawnT + 0.3));
  const r = heroChopping(cam, t, {
    chop: t < c.or_just ? 0.25 * (1 - slow) + 0.02 : 0, face, wet: t < c.or_just ? 0.3 : 1, onion: 'whole',
    onionFace: t > c.win ? 'proud' : 'smug', onionFaceK: ramp(t, c.onion_win - 0.3, c.onion_win), crown: ramp(t, c.win, c.win + 0.45),
    onionRot: t > c.win ? 0.12 * Math.sin((t - c.win) * 7) * (0.4 + 0.6 * Math.abs(Math.sin((t - c.win) * 0.9))) : 0,
    onionHop: t > c.win ? Math.abs(Math.sin((t - c.win) * 3.5)) * 26 * clamp(1 - (t - c.win) / 9) : 0,
    slices: 4 + Math.round(3 * slow), gleam: t < c.slow ? inv(c.sharp, c.sharp + 0.8, t) : 0, knife: t < c.or_just + 0.2,
    fountain: t > c.or_just && t < c.tomorrow ? 0.5 * giveUp : 0,
  });
  if (t > c.win) shockLines(...toScreen(cam, KIT.onionX, KIT.onionY - 150), 120, inv(c.win, c.win + 0.5, t), 10, '#FFD447');
  return { glow: 0.7 };
};

// ---------------------------------------------------------------- placeholders (replaced by the world files)
for (const id of ['trap', 'rooms', 'mix', 'name', 'eyes', 'brain', 'spray']) {
  if (!SC[id]) SC[id] = (lt, t, shot) => { darkBg(); screenSpace(); bigWord(id.toUpperCase(), 540, 800, 160, '#FFFFFF', 1); return {}; };
}

function initScenes2() {
  initKitchen();
  initInside(); initEye(); initLab();
}

// ---------------------------------------------------------------- the cover (rendered from a one-shot timeline copy)
SC.cover = (lt, t, shot) => {
  const cam = { x: 540, y: 1100, zoom: 1.6, rot: 0 };
  applyCam(cam);
  kitchenBg(t);
  heroChopping(cam, 0.4, { chop: 0.1, face: FACE_SOB, wet: 1, fountain: 1, hat: 1, pal: PAL_CHEF, onion: 'whole', onionFace: 'evil', onionFaceK: 1, slices: 10, gas: 0.7, knife: false });
  screenSpace();
  bigWord('ONION', 540, 520, 200, '#FFD447', 1, -0.05);
  bigWord('ATTACK!', 540, 1445, 210, '#FF5A6E', 1, 0.04);
  return { glow: 0.75, noCaptions: true, noSubscribe: true };
};
