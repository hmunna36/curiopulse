// "Can You Wag Your Fingers Like WIPERS?" Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds
// inside the shot, t = seconds in the video) and returns post options for main.js. Every beat comes from a cue
// (cu().name, timeline.json); the fingers, wipers and legs move on timeline.json's `wag` arrays (one value per frame).
'use strict';

const cu = () => TLd.cues;
const ffBump = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);

// ---------------------------------------------------------------- the light of each place
// the cab: the dome lamp and the fairy lights warm from the upper left, the windscreen's cool blue as the rim
const CAB_LIGHT = { ...LIGHTS.candle, pool: 0.3 };
// the driver's view: the cool windscreen in front of his hands, the warm cab behind (the key from above)
const POV_LIGHT = { ...LIGHTS.lanterns, rim: [0.55, 0.75, 1.0], rimAmt: 0.8, pool: 0.25 };
// outside under the awning: the lantern on the right, the dusk sky as the rim
const BACK_LIGHT = { ...flipLight(LIGHTS.lanterns), rim: [0.55, 0.7, 1.0], rimAmt: 0.85, pool: 0.3 };
setLights({ hook: POV_LIGHT, button: POV_LIGHT, answer: CAB_LIGHT, slow: CAB_LIGHT, ref: CAB_LIGHT, refup: CAB_LIGHT,
  copy: CAB_LIGHT, pair: BACK_LIGHT, sync: BACK_LIGHT, cover: CAB_LIGHT });

// ---------------------------------------------------------------- the motion (timeline.json `wag`, one value a frame)
function ffWag(t) {
  const Wg = TLd.wag, n = Wg.ph.length, x = clamp(t * 30, 0, n - 1), i = Math.min(n - 2, Math.floor(x)), u = x - i;
  const L = (a) => a[i] + (a[i + 1] - a[i]) * u;
  const ph = L(Wg.ph), psi = L(Wg.psi), amp = L(Wg.amp);
  return { ph, psi, amp, f: L(Wg.f), aR: amp * Math.sin(ph), aL: amp * Math.sin(ph + psi), pw: L(Wg.pw), pl: L(Wg.pl), chi: L(Wg.chi) };
}
const ffSweep = (t) => 1.63 + 0.95 * Math.sin(ffWag(t).pw);   // round the upright: + = the blades lean right, as the fingers do
// ghost fingers of the last frames when the wagging is fast
function ffTrail(t, side) {
  const w = ffWag(t);
  if (w.f < 1.3) return [];
  const out = [];
  for (const d of [0.1, 0.067, 0.033]) { const p = ffWag(Math.max(0, t - d)); out.push(side === 'L' ? p.aL : p.aR); }
  return out;
}

// ---------------------------------------------------------------- his faces
const FF = {
  calm: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0.5, browY: 0.2, browTilt: 0, mouth: 'grin', mouthOpen: 0.25, blink: 0, cross: 0 },
  huh: { eyeOpen: 1.28, pupil: 0.8, lookX: 0, lookY: 0.7, browY: 1.25, browTilt: 0.35, mouth: 'o', mouthOpen: 0.45, blink: 0, cross: 0 },
  focus: { eyeOpen: 1.05, pupil: 0.95, lookX: 0, lookY: 0.75, browY: 0.45, browTilt: 1.1, mouth: 'grimace', mouthOpen: 0.6, blink: 0, cross: 0 },
  proud: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0.6, browY: 0.9, browTilt: -0.3, mouth: 'grin', mouthOpen: 0.85, blink: 0, cross: 0 },
  side: { eyeOpen: 1.05, pupil: 1, lookX: 0.9, lookY: 0.1, browY: 0.6, browTilt: 0.3, mouth: 'flat', mouthOpen: 0.2, blink: 0, cross: 0 },
  sideDown: { eyeOpen: 1.05, pupil: 1, lookX: 0.8, lookY: 0.8, browY: 0.4, browTilt: 0.1, mouth: 'flat', mouthOpen: 0.2, blink: 0, cross: 0 },
  awk: { eyeOpen: 1.15, pupil: 0.85, lookX: 0.95, lookY: -0.1, browY: 1.1, browTilt: 0.6, mouth: 'grimace', mouthOpen: 0.55, blink: 0, cross: 0 },
};
const ffFace = (a, b, k) => lerpFace(a, b, clamp(k));

// ---------------------------------------------------------------- small graphics (screen space)
function ffPill(txt, x, y, col, k, size = 46, ink = '#0B0B1A', arrow = 0) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + size * 0.9 + (arrow ? size * 0.9 : 0), h = size * 1.45;
  rrect(ctx, -w / 2 - 4, -h / 2 - 4, w + 8, h + 8, h / 2 + 4); ctx.fillStyle = '#0B0B1A'; ctx.fill();
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = col; ctx.fill();
  paint(() => {
    ctx.fillStyle = ink; ctx.fillText(txt, arrow ? arrow * -size * 0.42 : 0, 2);
    if (arrow) {   // a small arrow on the side it points to
      const ax = arrow * (w / 2 - size * 0.55);
      ctx.beginPath(); ctx.moveTo(ax + arrow * size * 0.32, 0); ctx.lineTo(ax - arrow * size * 0.2, -size * 0.32); ctx.lineTo(ax - arrow * size * 0.2, size * 0.32); ctx.closePath(); ctx.fillStyle = ink; ctx.fill();
    }
  });
  ctx.restore();
}
function ffBurst(x, y, r, k, col = '#FFD447') {
  if (k <= 0.01) return;
  screenSpace();
  const s = E.outBack(clamp(k), 2);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath();
  for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2, rr = i % 2 ? r * 0.55 : r; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  ctx.closePath(); ctx.fillStyle = '#0B0B1A'; ctx.fill();
  ctx.beginPath();
  for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2, rr = (i % 2 ? r * 0.55 : r) - 10; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  ctx.restore();
  softDot(gctx, x, y, r * 1.2, col, 0.35 * k);
}
function ffHeart(x, y, s, k) {
  if (k <= 0.01) return;
  screenSpace();
  const sc = s * E.outBack(clamp(k), 2.4);
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.beginPath(); ctx.moveTo(0, 30); ctx.bezierCurveTo(-60, -10, -34, -58, 0, -26); ctx.bezierCurveTo(34, -58, 60, -10, 0, 30); ctx.closePath();
  ctx.lineWidth = 9; ctx.strokeStyle = '#0B0B1A'; ctx.stroke(); ctx.fillStyle = '#FF5A8A'; ctx.fill();
  paint(() => ellipse(ctx, -16, -22, 9, 6, 'rgba(255,255,255,0.7)', -0.6));
  ctx.restore();
  softDot(gctx, x, y, 90 * s, '#FF5A8A', 0.4 * k);
}

// ================================================================ the driver's view (hook, button)
const POVH = { L: [334, 1528], R: [704, 1528], s: 2.05 };
function povCam(tt) { return camKeys(tt, [[-1, 540, 1214, 1.06], [0, 540, 1214, 1.06], [3.3, 540, 1210, 1.09], [4.6, 540, 1200, 1.13]], E.inOutSine); }
// tt = seconds since frame 1 (negative = the last frames, on their way back to frame 1)
function povDraw(t, cam, o = {}) {
  const hist = [];
  for (let k = 0; k <= 12; k++) { const d = k * 0.05; hist.push([d, ffSweep(Math.max(0, t - d))]); }
  ffPOV(cam, t, { sw: ffSweep(t), hist, dice: 0.08 + 0.1 * clamp((ffWag(t).f - 1) / 1.6) });
  ffPOVWheel(cam);
  applyCam(cam);
  const w = ffWag(t);
  const faceK = o.face || 0, mood = o.mood || 'calm', tr = o.tremble || 0;
  for (const [k, th] of [['L', 1], ['R', -1]]) {
    const p = POVH[k];
    ctx.save(); ctx.translate(p[0], p[1]);
    actor(() => ffPointer(ctx, { a: k === 'L' ? w.aL : w.aR, view: 'back', th, s: POVH.s, sleeve: PAL, trail: ffTrail(t, k), face: faceK, mood,
      look: k === 'L' ? 1 : -1, tremble: tr, t }));
    ctx.restore();
  }
  return w;
}
SC.hook = (lt, t, shot) => {
  const c = cu(), cam = povCam(t);
  const w = povDraw(t, cam);
  // the flip: a snap ring between the hands
  const fk = popK(t, c.flip - 0.02, c.flip + 0.32, 0.06, 0.2);
  if (fk > 0.01) {
    const m = toScreen(cam, 530, 1180);
    screenSpace();
    ctx.beginPath(); ctx.arc(m[0], m[1], 60 + 220 * inv(c.flip - 0.02, c.flip + 0.32, t), 0, 7); ctx.lineWidth = 10 * fk; ctx.strokeStyle = 'rgba(255,212,71,0.9)'; ctx.stroke();
    softDot(gctx, m[0], m[1], 260, '#FFD447', 0.35 * fk);
  }
  return { glow: 0.85 };
};
SC.button = (lt, t, shot) => {
  const c = cu(), D = TLd.duration, tt = t - D;
  const cam = povCam(tt);
  // the twins on his nails cheer in the mirror, then worry as he tries to flip it back; gone before the loop
  const fk = popK(t, shot.start + 0.15, c.settle - 0.05, 0.12, 0.18);
  const mood = t < c.strain ? 'cheer' : 'worried';
  povDraw(t, cam, { face: fk, mood, tremble: popK(t, c.strain, c.settle, 0.1, 0.25) });
  // a sweat drop as he strains
  const sk = popK(t, c.strain + 0.1, c.settle - 0.05, 0.1, 0.15);
  if (sk > 0.01) { const p = toScreen(cam, 560, 1010); sweatDrop(ctx, p[0], p[1], 2.2, sk); }
  return { glow: 0.85 };
};

// ================================================================ the cab from the dashboard (answer .. copy)
// his seat level FCY; S = his scale. Hands: wrists at rig-local (+-HX, HY)
const FCH = { x: 540, seatY: 1560, s: 1.7, HX: 118, HY: -205, fs: 1.22 };
function cabHero(cam, t, o = {}) {
  const S = FCH.s, sep = o.sep === undefined ? 1 : o.sep;
  const st = { x: FCH.x, y: FCH.seatY + 34 * S, s: S, face: o.face || FF.calm, noLegs: true, headRot: o.headRot || 0,
    headDX: o.headDX || 0, headDY: (o.headDY || 0) + 1.4 * Math.sin(t * loopW(2.3)), seed: 3 };
  let pose = { ...POSES.sit, hand: 'open' };
  const hx = FCH.HX * sep, hy = FCH.HY + (o.lift || 0);
  pose = armAt(pose, 'L', [-hx - 12, hy + 118], [-hx, hy]);   // elbows down by his sides, forearms up
  pose = armAt(pose, 'R', [hx + 12, hy + 118], [hx, hy]);
  st.pose = pose;
  // the seat behind him follows his head
  const w = ffWag(t);
  let tips = null;
  const r = charLayer(cam, st, t, { pal: PAL, post: (lc, rr, s2) => {
    tips = {};
    for (const [k, th] of [['L', 1], ['R', -1]]) {
      const wr = [s2.x + rr['wr' + k][0] * S, s2.y + rr['wr' + k][1] * S];
      const ho = { a: k === 'L' ? w.aL : w.aR, view: 'palm', th, s: FCH.fs, trail: ffTrail(t, k), face: o.faceK || 0, mood: o.mood || 'calm',
        look: (o.look === undefined ? 1 : o.look) * (k === 'L' ? 1 : -1), tremble: o.tremble || 0, t, glowTip: o.glowTip || 0 };
      lc.save(); lc.translate(wr[0], wr[1] + 8 * S); ffPointer(lc, ho); lc.restore();
      const tp = ffTipWorld(ho);
      tips[k] = [wr[0] + tp[0], wr[1] + 8 * S + tp[1]];
    }
  } });
  applyCam(cam);
  const headW = [st.x + (r.head[0] + st.headDX) * S, st.y + (r.head[1] + st.headDY) * S];
  return { st, r, w, tips, headW, head: toScreen(cam, headW[0], headW[1]), sc: cam.zoom * S };
}
function cabDraw(t, cam, o = {}) {
  ffCabin(cam, t, o);
  const Hh = cabHero(cam, t, o);
  ffCabinFront(cam, t, o.front || {});
  return Hh;
}
// IN / OUT tags over the fingertips: which way each finger is swinging (toward the middle = IN)
function ffTags(cam, Hh, t, kIn, kOut) {
  const w0 = ffWag(t - 0.03), w1 = ffWag(t + 0.03);
  for (const k of ['L', 'R']) {
    const v = (k === 'L' ? w1.aL - w0.aL : w1.aR - w0.aR);
    const inward = k === 'L' ? v > 0 : v < 0;
    const kk = inward ? kIn : kOut;
    if (kk <= 0.01) continue;
    const p = toScreen(cam, Hh.tips[k][0], Hh.tips[k][1] - 64);
    ffPill(inward ? 'IN' : 'OUT', p[0], p[1] - 34, inward ? '#4DFFB4' : '#FF5A6E', kk, 58, '#0B0B1A', v > 0 ? 1 : -1);
  }
}

SC.answer = (lt, t, shot) => {
  const c = cu();
  const cam = camKeys(t, [[shot.start, 540, 1262, 1.29], [c.hands, 540, 1259, 1.31], [c.twins, 540, 1256, 1.33], [shot.end, 540, 1255, 1.34]], E.inOutSine);
  const fk = ramp(t, c.faces, c.faces + 0.25, E.outBack);
  let face = ffFace(FF.huh, FF.huh, 1);
  face = ffFace(face, FF.side, ramp(t, c.twins_end - 0.2, c.twins_end + 0.2));
  const mood = t < c.clingy + 0.15 ? 'calm' : 'love';
  // he jolts back as he sees them flip, then leans in to look (snapRamp: a wind-up and an overshoot)
  const jolt = snapRamp(t, c.flipped - 0.05, c.flipped + 0.2) * (1 - ramp(t, c.flipped + 0.7, c.flipped + 1.1, E.inOutSine));
  const lean = snapRamp(t, c.faces, c.faces + 0.25, { over: 1.3 });
  const Hh = cabDraw(t, cam, { face, faceK: fk, mood, look: 1, headDY: -14 * jolt + 6 * lean, headRot: -0.05 * jolt });
  // the heart between the twins on TWINS
  const hk = popK(t, c.heart - 0.15, shot.end + 1, 0.15, 0.1);   // fully in on the hitstop's frame
  if (hk > 0.01 && Hh.tips) {
    const a = toScreen(cam, ...Hh.tips.L), b = toScreen(cam, ...Hh.tips.R);
    ffHeart((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 20, 1.6, hk);
  }
  return { glow: 0.85, focus: Hh.tips ? toScreen(cam, (Hh.tips.L[0] + Hh.tips.R[0]) / 2, (Hh.tips.L[1] + Hh.tips.R[1]) / 2 + 40) : null };
};

SC.slow = (lt, t, shot) => {
  const c = cu();
  // a higher, closer view of his hands: the fingers back to slow wipers; IN / OUT on each swing
  const cam = camKeys(t, [[shot.start, 540, 1296, 1.46], [c.in, 540, 1292, 1.5], [shot.end, 540, 1290, 1.52]], E.inOutSine);
  const face = ffFace(FF.focus, FF.focus, 1);
  const Hh = cabDraw(t, cam, { face, faceK: 1, mood: 'strain', look: 1 });
  ffTags(cam, Hh, t, ramp(t, c.in - 0.05, c.in + 0.2), ramp(t, c.out - 0.05, c.out + 0.2));
  return { glow: 0.85 };
};

// the round window on his head: the referee inside (screen space)
function ffWindow(wc, R, t, ro) {
  if (R <= 1) return;
  screenSpace();
  ctx.beginPath(); ctx.arc(wc[0], wc[1], R, 0, 7); ctx.fillStyle = '#2A1440'; ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(wc[0], wc[1], R, 0, 7); ctx.clip();
  gctx.save(); gctx.beginPath(); gctx.arc(wc[0], wc[1], R, 0, 7); gctx.clip();
  const g = ctx.createRadialGradient(wc[0], wc[1] - R * 0.2, R * 0.1, wc[0], wc[1], R);
  g.addColorStop(0, '#7A3E9A'); g.addColorStop(1, '#2A1440');
  ctx.fillStyle = g; ctx.fillRect(wc[0] - R, wc[1] - R, R * 2, R * 2);
  // a spotlight on the referee
  softDot(gctx, wc[0], wc[1] - R * 0.15, R * 0.9, '#FFE7B0', 0.25);
  paint(() => { for (let i = 0; i < 9; i++) { const a = i * 0.7 + 0.3; circle(ctx, wc[0] + Math.cos(a) * R * 0.75, wc[1] + Math.sin(a) * R * 0.6, R * 0.02, 'rgba(255,200,255,0.35)'); } });
  actor(() => ffRef(ctx, wc[0], wc[1] + R * 0.66, R / 245, t, ro));
  ctx.restore(); gctx.restore();
  screenSpace();
  ctx.lineWidth = Math.max(10, R * 0.08); ctx.strokeStyle = '#B8C2D6'; ctx.beginPath(); ctx.arc(wc[0], wc[1], R, 0, 7); ctx.stroke();
  paint(() => { for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + 0.39; circle(ctx, wc[0] + Math.cos(a) * R, wc[1] + Math.sin(a) * R, Math.max(3, R * 0.03), '#5A6480'); } });
}
// the referee's state from the fingers: it points the way they swing, blows on every turn
function refState(t, extra = {}) {
  const c = cu(), w = ffWag(t);
  const pt = clamp(1.8 * Math.sin(w.ph));
  const tw = c.tweet.reduce((m, x) => Math.max(m, ffBump(t, x, 10)), 0);
  return Object.assign({ pt, blow: tw, look: pt * 0.6 }, extra);
}

SC.ref = (lt, t, shot) => {
  const c = cu();
  const cam = camKeys(t, [[shot.start, 540, 1150, 1.0], [shot.end, 540, 1140, 1.04]], E.inOutSine);
  const Hh = cabDraw(t, cam, { face: FF.focus, faceK: 1, mood: 'strain', look: 1 });
  const R = 265 * E.outBack(ramp(t, c.window, c.window + 0.3));
  const wc = [Hh.head[0], Hh.head[1] - 360];
  // a cord of light from his head up into the window
  if (R > 5) { screenSpace(); ctx.beginPath(); ctx.moveTo(Hh.head[0] - 30, Hh.head[1] - 120); ctx.lineTo(wc[0] - 60, wc[1] + R * 0.8); ctx.lineTo(wc[0] + 60, wc[1] + R * 0.8); ctx.lineTo(Hh.head[0] + 30, Hh.head[1] - 120); ctx.closePath(); ctx.fillStyle = 'rgba(200,160,255,0.28)'; ctx.fill(); }
  ffWindow(wc, R, t, refState(t));
  return { glow: 0.85 };
};

SC.refup = (lt, t, shot) => {
  const c = cu();
  // into the window: the referee fills the frame; its arms flail faster and faster, then it gives up
  const cam = camKeys(t, [[shot.start, 540, 1000, 1.1], [shot.end, 540, 990, 1.14]], E.inOutSine);
  const Hh = cabDraw(t, cam, { face: FF.focus, faceK: 1, mood: 'strain', look: 1 });
  const R = 470;
  const wc = [540, 905];
  const gv = ramp(t, c.gives, c.gives + 0.35, E.outCubic);
  ffWindow(wc, R, t, refState(t, { sweat: ramp(t, c.faster2, c.faster2 + 0.4), dizzy: ramp(t, c.theref, c.theref + 0.2) * (1 - gv * 0.0),
    flag: ramp(t, c.flag, c.flag + 0.25, E.outBack), slump: gv, pt: gv > 0.3 ? 0 : clamp(1.8 * Math.sin(ffWag(t).ph)) }));
  return { glow: 0.85, focus: [540, 905] };
};

SC.copy = (lt, t, shot) => {
  const c = cu();
  // his hands, extreme close: they snap into the mirror and the twins high-five on COPY
  const cam = camKeys(t, [[shot.start, 540, 1186, 1.76], [c.five, 540, 1180, 1.82], [shot.end, 540, 1178, 1.84]], E.inOutSine);
  const sep = 0.5;
  const mood = t < c.flip3 ? 'strain' : 'cheer';
  const Hh = cabDraw(t, cam, { face: FF.proud, faceK: 1, mood, look: 1, sep, lift: 62, glowTip: popK(t, c.five, c.five + 0.5, 0.05, 0.2) });
  const fk = popK(t, c.five - 0.02, c.five + 0.55, 0.05, 0.2);
  if (fk > 0.01 && Hh.tips) {
    const a = toScreen(cam, ...Hh.tips.L), b = toScreen(cam, ...Hh.tips.R);
    ffBurst((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 70, 82, fk);
  }
  return { glow: 0.9 };
};

// ================================================================ outside on the back step (pair, sync)
const FBP = { hx: 372, gx: 712, s: 1.16 };
function stepDraw(t, cam, o = {}) {
  ffBack(cam, t);
  const w = ffWag(t), S = FBP.s;
  const sH = Math.sin(w.pl), sG = Math.sin(w.pl + w.chi);
  // the hero on the bumper: his legs on his own layer, under him
  const st = { x: FBP.hx, y: FB.stepY + 34 * S, s: S, face: o.face || FF.sideDown, noLegs: true, headRot: o.headRot || 0, seed: 5,
    headDY: 1.2 * Math.sin(t * loopW(2.1)) };
  let pose = { ...POSES.sit, hand: 'open' };
  pose = armAt(pose, 'L', [-112, -120], [-108, -40]);
  pose = armAt(pose, 'R', [112, -120], [108, -40]);
  st.pose = pose;
  charLayer(cam, st, t, { pal: PAL, pre: (lc) => actor(() => ffSwingLegs(lc, FBP.hx, FB.stepY + 6, S, sH, { pants: PAL.pants, pantsSh: PAL.pantsSh, shoe: PAL.shoe, sole: PAL.sole })) });
  applyCam(cam);
  actor(() => ffGran(ctx, FBP.gx, FB.stepY + 6, S, t, Object.assign({ sw: sG }, o.gran || {})));
  ffBackFront(cam, t);
  return { w, sH, sG };
}
SC.pair = (lt, t, shot) => {
  const c = cu();
  const cam = camKeys(t, [[shot.start, 548, 1290, 1.12], [c.side, 548, 1286, 1.16], [shot.end, 548, 1282, 1.18]], E.inOutSine);
  const lookUp = ramp(t, c.side, c.side + 0.3);
  const face = ffFace(FF.sideDown, FF.side, lookUp);
  stepDraw(t, cam, { face, gran: { lookX: -0.9, lookY: lerp(0.8, 0, lookUp), smile: 0.3, mug: 0.15 } });
  return { glow: 0.85 };
};
SC.sync = (lt, t, shot) => {
  const c = cu();
  const cam = camKeys(t, [[shot.start, 572, 1318, 1.32], [c.sync, 572, 1322, 1.38], [shot.end, 572, 1320, 1.4]], E.inOutSine);
  const k = ramp(t, c.sync + 0.1, c.sync + 0.35);
  const face = ffFace(FF.side, FF.awk, k);
  const turn = snapRamp(t, c.sync + 0.1, c.sync + 0.32);
  const S = stepDraw(t, cam, { face, headRot: 0.09 * turn, gran: { lookX: -0.95, lookY: -0.1, brow: k, smile: k > 0.5 ? -0.2 : 0.3, mouthO: 0, mug: 0.15, tilt: -0.08 * turn } });
  // drops fly off the boots when they kick together
  const sk = popK(t, c.splash, c.splash + 0.6, 0.05, 0.25);
  if (sk > 0.01) {
    screenSpace();
    const rng = mulberry32(77), u = inv(c.splash, c.splash + 0.6, t);
    for (let i = 0; i < 18; i++) {
      const bx = (i % 2 ? FBP.gx : FBP.hx) + (rng() - 0.5) * 120, vx = (rng() - 0.5) * 260, vy = -120 - rng() * 220;
      const p = toScreen(cam, bx + vx * u, FB.stepY + 170 + vy * u + 520 * u * u);
      circle(ctx, p[0], p[1], 4 + rng() * 6, 'rgba(210,235,255,0.85)');
    }
  }
  return { glow: 0.85 };
};

// ================================================================ the cover (src/cover.sh): his face, the clingy twins and a heart
SC.cover = (lt, t, shot) => {
  const c = cu(), T = c.heart + 0.32;
  const cam = { x: 540, y: 1205, zoom: 1.3, rot: 0 };
  const Hh = cabDraw(T, cam, { face: ffFace(FF.huh, FF.proud, 0.35), faceK: 1, mood: 'love', look: 1 });
  if (Hh.tips) {
    const a = toScreen(cam, ...Hh.tips.L), b = toScreen(cam, ...Hh.tips.R);
    ffHeart((a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 80, 1.3, 1);
  }
  screenSpace();
  bigWord('LIKE WIPERS?', 540, 520, 118, '#7FE9FF', 1, -0.03);
  return { glow: 0.85 };
};

function initScenes2() {
  initFFVan();
}
