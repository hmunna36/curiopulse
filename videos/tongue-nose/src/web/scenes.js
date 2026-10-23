// Why Can't Your Tongue Touch Your NOSE? 👅 Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds
// inside the shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;
const pulseOf = (t, times, len = 0.16) => times.reduce((m, f) => Math.max(m, clamp((t - f) / 0.03) * clamp((f + len - t) / 0.05)), 0);
const bumpAt = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);
const tnLerp2 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the bathroom in the morning: the window is on the left (the key), the room behind him out of focus
const MORN_LIGHT = { ...flipLight(LIGHTS.day), pool: 0.44, halo: 0.1, dof: 0.9 };
// inside: the glass head on a dark field
const SIDE_LIGHT = { ...LIGHTS.diagram, rim: [0.6, 0.9, 1.0], rimAmt: 0.6 };
const CROWD_LIGHT = { ...LIGHTS.diagram, pool: 0.24 };

// ---------------------------------------------------------------- his faces
const MF = {
  // cross-eyed, down at his own tongue: trying hard
  strain: { eyeOpen: 0.92, pupil: 0.95, lookX: 0, lookY: 1, browY: 0.95, browTilt: 1.0, mouth: 'none', mouthOpen: 0, blink: 0.12, cross: 1 },
  // up at us, the tongue still up: your turn
  us: { eyeOpen: 1.12, pupil: 0.95, lookX: 0, lookY: 0, browY: 1.25, browTilt: -0.25, mouth: 'none', mouthOpen: 0, blink: 0, cross: 0 },
  // yanked back by the leash
  yank: { eyeOpen: 1.38, pupil: 0.6, lookX: 0, lookY: 0.4, browY: 1.45, browTilt: 0.3, mouth: 'none', mouthOpen: 0, blink: 0, cross: 0 },
  // "Made it?": the tongue in, eyebrows up at us
  ask: { eyeOpen: 1.08, pupil: 1, lookX: 0, lookY: 0, browY: 1.1, browTilt: -0.45, mouth: 'flat', mouthOpen: -0.2, blink: 0, cross: 0 },
  // "Show-off.": a suspicious squint
  squint: { eyeOpen: 0.52, pupil: 1, lookX: 0.15, lookY: 0, browY: -0.35, browTilt: -0.9, mouth: 'flat', mouthOpen: -0.35, blink: 0.25, cross: 0 },
  // "Didn't?": kind
  kind: { eyeOpen: 1.04, pupil: 1, lookX: 0, lookY: 0, browY: 0.75, browTilt: 0.85, mouth: 'flat', mouthOpen: -0.1, blink: 0, cross: 0 },
};

// the strained tremble: a clock that goes round a whole number of times in the Short (audio.py uses the same clock)
const strW = () => loopW(2 * Math.PI * (cu().strain_hz || 7));
const tremble = (t) => 0.6 * Math.sin(strW() * t) + 0.4 * Math.sin(strW() * 1.5 * t + 1.3);

// ---------------------------------------------------------------- him at the mirror with his tongue up at his nose
// A: mirHero's description plus T (tnTongueUp's description, or null = tongue in), flag 0..1, leash {k, taut, yank},
// post(lc, rr, s2) more drawing in rig-local units. Returns mirHero's points plus hp (head units -> world) and tg
function tnHero(cam, t, A) {
  const m = A.T ? clamp(A.T.m === undefined ? (A.T.out === undefined ? 1 : A.T.out) : A.T.m) : 0;
  const B = Object.assign({}, A, { nose: A.nose || { nostK: 0.55 }, face: { ...A.face, jaw: TN_JAW * m } });   // the jaw drops with the mouth
  let tg = null;
  B.post = (lc, rr, s2) => {
    mirInHead(lc, s2, (c) => {
      if (A.T) tg = tnTongueUp(c, A.T, t);
      if (A.leash && tg) tnLeash(c, tg.strapTop, t, A.leash);
      tnFlag(c, t, A.flag === undefined ? 1 : A.flag);
    });
    if (A.post) A.post(lc, rr, s2);
  };
  const out = mirHero(cam, t, B);
  out.tg = tg;
  out.hp = (q) => mirHeadPt(out.st, q[0], q[1]);
  return out;
}
function mirDraw(t, o) {
  mirRoom(o.cam, t, { night: o.night });
  if (o.under) { applyCam(o.cam); o.under(); }
  const Hh = tnHero(o.cam, t, o.A);
  applyCam(o.cam);
  if (o.after) o.after(Hh);
  return Hh;
}

// ---------------------------------------------------------------- small graphics (screen space)
function tagPill(txt, x, y, col, k, size = 40, ink = '#0B0B1A') {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + size * 0.9, h = size * 1.5;
  rrect(ctx, -w / 2 - 4, -h / 2 - 4, w + 8, h + 8, h / 2 + 4); ctx.fillStyle = '#0B0B1A'; ctx.fill();
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = col; ctx.fill();
  ctx.fillStyle = ink; ctx.fillText(txt, 0, 2);
  ctx.restore();
}
function okTick(x, y, r, k) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  circle(ctx, 0, 0, r + 6, '#FFFFFF'); circle(ctx, 0, 0, r, '#12B25C');
  ctx.beginPath(); ctx.moveTo(-r * 0.45, 0); ctx.lineTo(-r * 0.1, r * 0.36); ctx.lineTo(r * 0.5, -r * 0.34); ctx.lineWidth = r * 0.24; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#FFFFFF'; ctx.stroke();
  ctx.restore();
  softDot(gctx, x, y, r * 2.4, '#4DFFB4', 0.5 * clamp(k));
}
function sparkle(x, y, r, k, col = '#FFF6C8') {
  if (k <= 0.01) return;
  for (const [cc, rr, cl] of [[ctx, r, col], [gctx, r * 1.6, rgba(col, 0.6)]]) {
    cc.save(); cc.translate(x, y); cc.scale(k, k);
    cc.beginPath(); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, R = i % 2 ? rr * 0.28 : rr; cc.lineTo(Math.cos(a) * R, Math.sin(a) * R); } cc.closePath(); cc.fillStyle = cl; cc.fill();
    cc.restore();
  }
}
// effort: a sweat drop that runs down his temple (screen space)
function effortDrop(Hh, cam, t, k) {
  if (k <= 0.01) return;
  const run = ((t * 0.55) % 1 + 1) % 1, P = toScreen(cam, ...Hh.hp([56, -12 + 16 * run]));
  screenSpace();
  sweatDrop(ctx, P[0], P[1], cam.zoom / 3.2, k * Math.min(1, (1 - run) * 4));
}
// a measuring mark between two screen points (the gap to the nose)
function gapMark(a, b, k) {
  if (k <= 0.01 || b[1] - a[1] < 4) return;
  screenSpace();
  const x = a[0];
  ctx.save(); ctx.globalAlpha = clamp(k);
  for (const [w, col] of [[11, '#0B0B1A'], [5, '#FFD447']]) { line(ctx, x, a[1], x, b[1], w, col); line(ctx, x - 16, a[1], x + 16, a[1], w, col); line(ctx, x - 16, b[1], x + 16, b[1], w, col); }
  ctx.restore();
  softDot(gctx, x, (a[1] + b[1]) / 2, 60, '#FFD447', 0.35 * k);
}

// ================================================================ the mirror: frame 1 and round it
// tt = seconds since frame 1 (negative = the last frames of the Short, on their way here)
function hookA(tt) {
  const c = cu();
  // how close the tip gets: a hair short all along; little lunges; the biggest just before "Close"
  const lunge = (t0, a) => a * Math.sin(Math.PI * clamp((tt - t0) / 0.5));
  let reach = 0.86 + lunge(0.5, 0.03) + lunge(1.3, 0.035) + lunge(c.try1_end + 0.05, 0.075) * (tt < c.close + 0.4 ? 1 : 0);
  reach = Math.max(reach, tt > c.try1_end + 0.3 && tt < c.leash ? 0.9 : 0);
  // the leash: clipped on at "Your tongue's", yanked on LEASH (the tongue is pulled back), then he lifts it again
  const clip = ramp(tt, c.your2 - 0.05, c.your2 + 0.12);
  const yank = ramp(tt, c.leash - 0.02, c.leash + 0.1, E.outCubic) * (1 - ramp(tt, c.lift - 0.1, c.lift_tongue + 0.1, E.inOutCubic));
  reach = lerp(reach, 0.6, yank);
  const lift = ramp(tt, c.lift - 0.1, c.lift_tongue + 0.15, E.inOutCubic);
  reach = lerp(reach, 0.88, lift * (1 - yank));
  const tug = ramp(tt, c.tug - 0.12, c.tug + 0.12);
  let face = MF.strain;
  face = lerpFace(face, MF.us, ramp(tt, c.try1 - 0.15, c.try1 + 0.1) * (1 - ramp(tt, c.try1_end + 0.05, c.try1_end + 0.25)));
  face = lerpFace(face, MF.yank, ramp(tt, c.leash, c.leash + 0.08) * (1 - ramp(tt, c.lift - 0.2, c.lift + 0.1)));
  face = { ...face, blink: Math.max(face.blink || 0, pulseOf(tt, [c.right + 0.25], 0.12)) };
  const q = 0.55 + 0.45 * Math.max(lunge(c.try1_end + 0.05, 1) * (tt < c.close + 0.4 ? 1 : 0), tug);
  const T = { reach, point: 0.25 + 0.15 * tug, quiver: q * (1 - 0.6 * yank), sway: 0.5 * Math.sin(tt * 2.1), strap: tug, taut: Math.max(tug, 0.7 * yank) };
  const A = {
    face, T, flag: 1,
    leash: { k: clip * (1 - ramp(tt, c.tug - 0.1, c.under, E.inOutCubic)), taut: Math.max(yank, lift), yank: bumpAt(tt, c.leash, 6) },
    headDY: 0.8 * Math.sin(tt * 2.3) + 3 * bumpAt(tt, c.leash, 7), bob: Math.sin(tt * 2.3) + 2 * bumpAt(tt, c.leash, 7),
    headRot: -0.025 * lunge(c.try1_end + 0.05, 1),
  };
  return { A, gap: popK(tt, c.close - 0.05, c.your2 + 0.1, 0.1, 0.1), tug };
}
function hookCam(tt) {
  const c = cu();
  const k = camKeys(tt, [[-0.45, 540, 1056, 5.3], [0, 540, 1056, 5.4], [0.45, 540, 1060, 5.8], [c.try1, 540, 1056, 5.55], [c.try1_end + 0.1, 540, 1062, 6.0],
    [c.close + 0.3, 540, 1062, 6.4], [c.your2, 540, 1066, 6.0], [c.leash + 0.25, 540, 1110, 4.3], [c.lift - 0.05, 540, 1110, 4.3], [c.feel, 540, 1074, 7.2], [c.under_end, 532, 1078, 7.6]], E.inOutCubic);
  if (tt >= 0 && tt < 0.45) { const u = E.outCubic(tt / 0.45); k.zoom = lerp(5.4, 5.8, u); k.y = lerp(1056, 1060, u); }   // the first push is quick off the mark
  const sh = bumpAt(tt, c.leash, 8);
  k.y += 6 * sh * Math.sin((tt - c.leash) * 50);
  return k;
}

// the window on his cheek, into the side view; the side shot starts where the dive ends
const SIDE_F0 = [712, 960], SIDE_Z0 = 2.5;
const WIN_HP = [-47, 40];                      // the window's middle on his face (head units): his cheek, screen left
function sideWindow(P, R, z, t, so) {
  if (R < 2) return;
  screenSpace();
  ctx.beginPath(); ctx.arc(P[0], P[1], R, 0, 7); ctx.fillStyle = '#0B1230'; ctx.fill();
  ctx.save(); gctx.save();
  ctx.beginPath(); ctx.arc(P[0], P[1], R, 0, 7); ctx.clip();
  gctx.beginPath(); gctx.arc(P[0] / 2, P[1] / 2, R / 2, 0, 7); gctx.clip();
  const cam = { x: SIDE_F0[0] - (P[0] - 540) / z, y: SIDE_F0[1] - (P[1] - 960) / z, zoom: z };
  sdBg(cam, t); applyCam(cam); sdSection(t, so);
  ctx.restore(); gctx.restore();
  screenSpace();
  paint(() => { ctx.beginPath(); ctx.arc(P[0], P[1], R, 0, 7); ctx.lineWidth = Math.max(5, R * 0.04); ctx.strokeStyle = 'rgba(159,230,255,0.95)'; ctx.stroke(); });
}
// the side view's state at time t (shared by the window in the hook and the side shot)
function sideState(t) {
  const c = cu();
  const stretch = ramp(t, c.stretches - 0.1, c.skinny_end, E.inOutCubic);
  const strain = 0.5 + 0.5 * Math.max(ramp(t, c.tied - 0.2, c.tied + 0.2) * (1 - ramp(t, c.back_end, c.no)), stretch);
  return {
    reach: 0.82 + 0.06 * strain, squeeze: stretch, rings: popK(t, c.stretches - 0.15, c.thats + 0.3, 0.15, 0.2), ringPh: t * 9,
    front: Math.max(popK(t, c.front - 0.08, c.back - 0.05, 0.1, 0.25), 0.9 * popK(t, c.tug - 0.1, c.down, 0.1, 0.3)),
    back: popK(t, c.back - 0.08, c.no, 0.1, 0.3),
    taut: Math.max(ramp(t, c.tied - 0.1, c.tied + 0.15) * (1 - ramp(t, c.no - 0.1, c.no + 0.2)), ramp(t, c.skinny - 0.1, c.skinny_end)),
    noBone: ramp(t, c.bones - 0.1, c.bones + 0.25, E.outBack) * (1 - ramp(t, c.stretches - 0.2, c.stretches + 0.05)),
    quiver: 0.6, gapMark: popK(t, c.skinny - 0.05, c.thats + 0.4, 0.1, 0.1), eye: { lookX: 1, lookY: 1 },
  };
}

SC.hook = (lt, t, shot) => {
  const c = cu(), S = hookA(t), cam = hookCam(t);
  const win = ramp(t, c.under - 0.05, c.under + 0.25, E.outBack);
  const dive = ramp(t, c.under_end - 0.3, shot.end, E.inOutCubic);
  const camD = dive > 0.001 && HOOK_WIN ? scaledCam(cam, HOOK_WIN, 1 + 4.5 * E.inCubic(dive)) : cam;
  const Hh = mirDraw(t, { cam: camD, A: S.A });
  HOOK_WIN = Hh.hp(WIN_HP);
  // the gap: a measuring mark between the tip of his tongue and his nose
  if (Hh.tg) { const a = toScreen(camD, ...Hh.hp([Hh.tg.tip[0] + 15, TN_NOSE_Y])), b = toScreen(camD, ...Hh.hp([Hh.tg.tip[0] + 15, Hh.tg.tip[1]])); gapMark(a, b, S.gap); }
  // effort: a sweat drop on his temple
  effortDrop(Hh, camD, t, 1 - ramp(t, c.under - 0.1, c.under + 0.1));
  // the window on his cheek: the side view, then the dive through it
  if (win > 0.001) {
    const P0 = toScreen(camD, ...HOOK_WIN);
    const zf = dive > 0.001 ? 1 + 4.5 * E.inCubic(dive) : 1;
    const R = lerp(0, 25 * cam.zoom, win) * zf + 1300 * E.inCubic(ramp(t, shot.end - 0.25, shot.end));
    const P = tnLerp2(P0, [540, 960], E.inOutCubic(ramp(t, c.under_end - 0.2, shot.end)));
    const z = lerp(0.62, SIDE_Z0, E.inOutCubic(ramp(t, c.under - 0.05, shot.end)));
    sideWindow(P, R, z, t, sideState(t));
  }
  return { glow: 0.85, flash: 0.06 * bumpAt(t, c.leash, 8), zblur: 0.16 * E.inCubic(dive), zcx: 540, zcy: 960 };
};
let HOOK_WIN = null;

// ================================================================ the side view: tied down, front and back; no bones; it squeezes
SC.side = (lt, t, shot) => {
  const c = cu(), T0 = shot.start;
  const cam = camKeys(t, [[T0, SIDE_F0[0], SIDE_F0[1], SIDE_Z0], [c.tied + 0.25, 470, 960, 1.42], [c.front - 0.1, 480, 966, 1.46], [c.front + 0.3, 650, 1010, 2.25],
    [c.back - 0.05, 640, 1030, 2.1], [c.back_end + 0.15, 570, 1090, 2.0], [c.no, 590, 1010, 1.9], [c.bones + 0.3, 590, 990, 2.05],
    [c.stretches, 676, 940, 2.3], [c.skinny_end, 708, 904, 2.6], [shot.end, 712, 900, 2.65]], E.inOutCubic);
  sdBg(cam, t); applyCam(cam);
  const S = sideState(t);
  const R = sdSection(t, S);
  // labels (screen space)
  const tp = (p) => toScreen(cam, p[0], p[1]);
  { const P = tp(R.front); tagPill('FRONT', clamp(P[0] + 190, 240, 840), clamp(P[1] + 40, 520, 1170), '#FFD447', popK(t, c.front - 0.05, c.no - 0.1, 0.1, 0.12), 46); }
  { const P = tp(R.hyoid); tagPill('BACK', clamp(P[0] - 30, 230, 840), clamp(P[1] - 150, 520, 1170), '#FFD447', popK(t, c.back - 0.05, c.no - 0.1, 0.1, 0.12), 46); }
  { const P = tp(R.mid); tagPill('0 BONES', clamp(P[0] - 60, 250, 830), P[1] - 190, '#BFF0FF', popK(t, c.bones - 0.03, c.stretches - 0.05, 0.1, 0.12), 46); }
  { const P = tp(R.tip); tagPill('LONGER', clamp(P[0] + 150, 260, 820), P[1] + 40, '#4DFFB4', popK(t, c.skinny - 0.05, shot.end + 1, 0.1, 0.1), 42); }
  return { glow: 0.9, flash: 0.12 * (1 - ramp(lt, 0, 0.12)) };
};

// ================================================================ pointy: yours went pointy (the mirror again)
function pointyA(t) {
  const c = cu();
  const pt = ramp(t, c.yours - 0.1, c.pointy + 0.1, E.inOutCubic);
  return { face: MF.strain, T: { reach: 0.87 + 0.02 * pt, point: lerp(0.15, 1, pt), quiver: 0.75, sway: 0.4 * Math.sin(t * 2.1) }, flag: 1, headDY: 0.8 * Math.sin(t * 2.3), bob: Math.sin(t * 2.3) };
}
SC.pointy = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 540, 1066, 6.6], [D, 540, 1062, 7.1]], E.inOutCubic);
  const A = pointyA(t);
  const Hh = mirDraw(t, { cam, A });
  // the tongue it started as, dashed: it got narrower and longer
  const pk = popK(t, c.went - 0.1, shot.end + 1, 0.12, 0.1);
  if (pk > 0.01 && Hh.tg) {
    screenSpace();
    const G0 = tnGeo({ reach: 0.84, point: 0 });
    const pts = []; for (let i = 0; i <= 16; i++) pts.push(G0.at(i / 16, -1)); for (let i = 16; i >= 0; i--) pts.push(G0.at(i / 16, 1));
    const sp = pts.map((p) => toScreen(cam, ...Hh.hp(p)));
    ctx.save(); ctx.setLineDash([12, 10]); poly(ctx, sp, 4, rgba('#FFFFFF', 0.85 * pk)); ctx.setLineDash([]); ctx.restore();
    // two arrows squeezing in at its sides
    const mid = toScreen(cam, ...Hh.hp([0, 46]));
    for (const s of [-1, 1]) {
      const x0 = mid[0] + s * 170, x1 = mid[0] + s * 96, y = mid[1];
      for (const [w, col] of [[14, '#0B0B1A'], [7, '#FFD447']]) { line(ctx, x0, y, x1, y, w * pk, col); line(ctx, x1 + s * 18, y - 16, x1, y, w * pk, col); line(ctx, x1 + s * 18, y + 16, x1, y, w * pk, col); }
    }
  }
  return { glow: 0.85, flash: 0.14 * (1 - ramp(lt, 0, 0.12)) };
};

// ================================================================ the crowd: one in ten make it; half of people born super-bendy
const CROWD = (() => {
  const skins = ['#F4C9A4', '#C98E66', '#8D5A3B', '#F1D2B6', '#E0AC84', '#A86E4A', '#F6D7C3', '#7A4A30', '#D9A07A', '#F0C29C'];
  const hairs = ['#3A2418', '#1A1210', '#C46A2A', '#2A1B14', '#E6C266', '#151010', '#8A4B2A', '#2E2A26', '#5A3420', '#B7B7BF'];
  const xs = [186, 363, 540, 717, 894], ys = [640, 900];
  const out = [];
  for (let i = 0; i < 10; i++) out.push({ x: xs[i % 5], y: ys[Math.floor(i / 5)], skin: skins[i], hairCol: hairs[i], bun: i === 3 || i === 8, glasses: i === 6 ? '#2A2440' : null, hair: i === 9 ? 'none' : 'cap', ph: i * 1.7 });
  return out;
})();
const CROWD_WIN = 7;                       // the one who makes it
const BENDY_WIN = [0, 2, 4, 6, 8];         // five of the super-bendy ten
SC.crowd = (lt, t, shot) => {
  const c = cu(), T0 = shot.start;
  darkBg('#162A4E', '#060B18');
  screenSpace();
  for (let i = 0; i < 7; i++) { const rng = mulberry32(140 + i); softDot(ctx, rng() * W, 200 + rng() * 1500, 140 + 140 * rng(), '#5A8CFF', 0.06); }
  // the chart: a dark board with a clip; from "Doctors" it has a title
  const bk = ramp(lt, 0, 0.25, E.outBack);
  const board = (cc, f) => { rrect(cc, (540 - 478 * bk) * f, 486 * f, 956 * bk * f, 570 * f, 40 * f); };
  ctx.save(); board(ctx, 1); ctx.fillStyle = '#1F3360'; ctx.fill(); ctx.restore();
  paint(() => { board(ctx, 1); ctx.lineWidth = 6; ctx.strokeStyle = '#8FB8FF'; ctx.stroke(); });
  const clipK = ramp(t, c.doctors - 0.12, c.doctors + 0.12, E.outBack);
  if (clipK > 0.01) {
    ctx.save(); ctx.translate(540, 486); ctx.scale(clipK, clipK);
    rrect(ctx, -110, -34, 220, 62, 16); ctx.fillStyle = '#B9C2CF'; ctx.fill();
    paint(() => { rrect(ctx, -60, -58, 120, 40, 14); ctx.lineWidth = 9; ctx.strokeStyle = '#DDE4EE'; ctx.stroke(); });
    ctx.restore();
  }
  // the faces: the first ten; from "Half" a second ten (born super-bendy) flip in
  const flip = ramp(t, c.half - 0.12, c.half + 0.25, E.inOutCubic);
  const second = flip > 0.5, sx = Math.max(0.03, Math.abs(Math.cos(Math.PI * flip)));
  CROWD.forEach((F, i) => {
    const pop = ramp(lt, 0.05 + 0.045 * i, 0.3 + 0.045 * i);
    let reach = 0.42 + 0.22 * hash(i * 3.3) + 0.05 * Math.sin(t * 3 + F.ph), win = 0;
    if (!second && i === CROWD_WIN) { const g = ramp(t, c.long - 0.05, c.make + 0.1, E.inOutCubic); reach = lerp(reach, 1.05, g); win = ramp(t, c.make + 0.05, c.make + 0.15); }
    if (second && BENDY_WIN.includes(i)) { const j = BENDY_WIN.indexOf(i), g = ramp(t, c.can2 - 0.25 + 0.06 * j, c.can2 + 0.05 + 0.06 * j, E.inOutCubic); reach = lerp(reach, 1.05, g); win = ramp(t, c.can2 + 0.08 + 0.06 * j, c.can2 + 0.18 + 0.06 * j); }
    const dim = !second && t > c.about - 0.1 && i !== CROWD_WIN ? 0.35 * ramp(t, c.about - 0.1, c.about + 0.2) : 0;
    ctx.save(); ctx.translate(F.x, F.y); ctx.scale(sx, 1); ctx.translate(-F.x, -F.y);
    const skin = second ? CROWD[(i + 3) % 10].skin : F.skin, hairCol = second ? CROWD[(i + 6) % 10].hairCol : F.hairCol;
    tnMini(ctx, F.x, F.y, 84, t, { reach, point: 0.4, skin, hairCol, bun: second ? !F.bun : F.bun, glasses: second ? null : F.glasses, hair: F.hair, win, pop, ph: F.ph, bendy: second ? 0.6 : 0 });
    ctx.restore();
    if (dim > 0.01) { ctx.save(); ctx.globalAlpha = dim; circle(ctx, F.x, F.y, 90, '#0B1530'); ctx.restore(); }
    if (win > 0.01) { sparkle(F.x + 1, F.y + 38, 13, popK(t, (second ? c.can2 : c.make) + 0.02, shot.end + 1, 0.1, 0.1), '#FFE58A'); okTick(F.x + 64, F.y - 64, 26, win); sparkle(F.x - 52, F.y - 70, 22, popK(t, (second ? c.can2 : c.make) + 0.05, (second ? c.can2 : c.make) + 0.6, 0.1, 0.25)); }
  });
  // the labels
  tagPill('10 PEOPLE', 540, 1150, '#FFFFFF', popK(lt, 0.2, c.make - T0 - 0.1, 0.12, 0.1), 44);
  tagPill('1 IN 10', 540, 1150, '#FFD447', popK(t, c.one10 - 0.05, c.half - 0.15, 0.12, 0.1), 58);
  tagPill("GORLIN'S SIGN", 540, 486, '#7FE9FF', popK(t, c.named - 0.05, shot.end + 1, 0.12, 0.1), 40);
  tagPill('BORN SUPER-BENDY', 540, 1150, '#C8A8FF', popK(t, c.born - 0.08, c.can2 + 0.25, 0.12, 0.1), 42);
  tagPill('5 IN 10', 540, 1150, '#FFD447', popK(t, c.can2 + 0.25, shot.end + 1, 0.12, 0.1), 58);
  return { glow: 0.85, flash: 0.16 * (1 - ramp(lt, 0, 0.12)) + 0.08 * bumpAt(t, c.half, 10), push: { k: 1 + 0.035 * ramp(lt, 0, shot.end - T0), cx: 540, cy: 780 } };
};

// ================================================================ the button: made it? show-off. didn't? one more try (into frame 1)
SC.button = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0, H0 = hookA(-0.45);
  const out = ramp(t, c.more - 0.05, c.try2 + 0.15, E.outBack);
  let face = lerpFace(MF.ask, MF.squint, ramp(t, c.showoff - 0.1, c.showoff + 0.1));
  face = lerpFace(face, MF.kind, ramp(t, c.didnt - 0.15, c.didnt + 0.05));
  face = lerpFace(face, MF.strain, ramp(t, c.one2 - 0.05, c.try2 + 0.05));
  if (out > 0.05) face = { ...face, mouth: 'none' };
  const A = {
    face: lerpFace(face, H0.A.face, ramp(t, shot.end - 0.25, shot.end)), flag: 1,
    T: out > 0.03 ? { out, reach: 0.86 * out, point: 0.25, quiver: 0.55 * out, sway: 0.5 * Math.sin(t * 2.1) } : null,
    headDY: 0.8 * Math.sin(t * 2.3), bob: Math.sin(t * 2.3), headRot: 0.05 * ramp(t, c.showoff - 0.1, c.showoff + 0.15) * (1 - ramp(t, c.didnt - 0.15, c.didnt + 0.1)),
  };
  const c0 = hookCam(-0.45);
  const cam = camKeys(lt, [[0, 540, 1046, 3.6], [c.showoff - T0, 540, 1040, 4.1], [c.didnt - T0, 540, 1044, 3.9], [Math.max(c.didnt - T0 + 0.2, D - 0.55), 540, 1046, 4.1], [D, c0.x, c0.y, c0.zoom]], E.inOutCubic);
  mirDraw(t, { cam, A });
  return { glow: 0.85, flash: 0.16 * (1 - ramp(lt, 0, 0.12)) };
};
SC.loop = (lt, t, shot) => {
  const tt = t - TLd.duration, S = hookA(tt), cam = hookCam(tt);
  const Hh = mirDraw(t, { cam, A: S.A });
  effortDrop(Hh, cam, t, 1);
  return { glow: 0.85 };
};

// ================================================================ the cover (rendered by src/cover.sh from a one-shot timeline)
SC.cover = (lt, t) => {
  const cam = { x: 540, y: 1104, zoom: 5.0, rot: 0 };
  const A = { face: MF.strain, T: { reach: 0.9, point: 0.35, quiver: 0, sway: 0 }, flag: 1, headDY: 0 };
  mirDraw(0.4, { cam, A });
  screenSpace();
  bigWord('ONLY 1 IN 10', 540, 1290, 120, '#FFD447', 1, -0.03);
  bigWord('CAN DO THIS', 540, 1430, 128, '#FFFFFF', 1, -0.03);
  return { glow: 0.85, noCaptions: true };
};

setLights({ hook: MORN_LIGHT, loop: MORN_LIGHT, cover: MORN_LIGHT, side: SIDE_LIGHT, pointy: MORN_LIGHT, crowd: CROWD_LIGHT, button: MORN_LIGHT });

function initScenes2() {
  initMirror();
}
