// Why Can't You See Your Own EYES Move in a Mirror? 👀 Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;
const pulseOf = (t, times, len = 0.16) => times.reduce((m, f) => Math.max(m, clamp((t - f) / 0.03) * clamp((f + len - t) / 0.05)), 0);
const bumpAt = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);
const meLerp2 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the bathroom in the morning: the window is on the left (the key), the room behind him out of focus
const MORN_LIGHT = { ...flipLight(LIGHTS.day), pool: 0.44, halo: 0.1, dof: 0.9 };
// the editing room in his head: a desk lamp up on the left, the light table's cool glow behind the strip
const EDIT_LIGHT = { ...LIGHTS.candle, rim: [0.62, 0.86, 1.0], rimAmt: 0.9, pool: 0.5 };
// his own view of the phone: the bathroom's daylight, the screen's cold light on his hand
const PHONE_LIGHT = { ...flipLight(LIGHTS.day), pool: 0.5, dof: 0.6 };

// ---------------------------------------------------------------- his eyes over time: the jumps
// In the mirror the eyes never travel: from one frame to the next they are simply somewhere else (the cut his
// brain makes). jumps: [[time, lx, ly]]: the look from that time on.
function lookAt(t, jumps, start) {
  let L = start;
  for (const j of jumps) { if (t >= j[0]) L = [j[1], j[2]]; else break; }
  return L;
}
const LOOK_R = [0.85, 0.05], LOOK_L = [-0.85, 0.05];
function hookJumps() {
  const c = cu();
  return [[c.left, ...LOOK_L], [c.right, ...LOOK_R], [c.see + 0.06, ...LOOK_L], [c.move - 0.03, ...LOOK_R], [c.nope - 0.04, 0, 0.05],
    [c.every - 0.02, -0.7, 0.1], [c.jump - 0.02, 0.7, 0.05], [c.like - 0.03, 0, 0.0]];
}

// ================================================================ the mirror: frame 1 and round it
// tt = seconds since frame 1 (negative = the last frames of the Short, on their way here)
function hookA(tt) {
  const c = cu();
  const L = lookAt(tt, hookJumps(), LOOK_R);
  const lean = ramp(tt, c.see - 0.2, c.move, E.inOutCubic) * (1 - ramp(tt, c.nope_end, c.your2 + 0.3, E.inOutCubic));
  const squint = 0.4 * lean + 0.1;
  const shake = Math.sin((tt - c.nope) * 22) * clamp((tt - c.nope) / 0.06) * clamp((c.nope_end + 0.25 - tt) / 0.2);
  const blink = pulseOf(tt, [c.nope + 0.36], 0.12);
  const face = { browY: lerp(0.35, 0.05, lean) + 0.3 * ramp(tt, c.your2, c.brain + 0.2), browTilt: lerp(0.05, -0.5, lean), mouth: 'flat', mouthOpen: 0.1 - 0.3 * lean };
  return {
    face, eyes: { lx: L[0], ly: L[1], squint, blink },
    headDY: 0.6 * Math.sin(tt * 2.1) - 3 * lean, bob: Math.sin(tt * 2.1), headRot: 0.05 * shake + 0.012 * Math.sin(tt * 1.3),
  };
}
function hookCam(tt) {
  const c = cu();
  return camKeys(tt, [[-0.45, 540, 1028, 7.0], [0, 540, 1028, 7.1], [c.left, 540, 1028, 7.35], [c.see, 540, 1026, 7.5], [c.move_end, 540, 1024, 8.2],
    [c.nope + 0.25, 540, 1026, 7.9], [c.your2 - 0.05, 540, 1016, 7.5], [c.brain + 0.4, 540, 1004, 5.4], [c.sneaky - 0.1, 540, 1000, 5.5]], E.inOutCubic);
}

// the window on his forehead, into the editing room; the edit shot starts where the dive ends
const WIN_HP = [0, -62], WIN_R = 30;           // the window's middle and its radius on his face (head units)
const EDIT_C0 = [540, 1010], EDIT_Z0 = 1.05;   // the room's point in the middle of the window, and the zoom the edit starts at
let HOOK_WIN = null;
function edWindow(P, R, z, t, S) {
  if (R < 2) return;
  screenSpace();
  ctx.beginPath(); ctx.arc(P[0], P[1], R, 0, 7); ctx.fillStyle = '#160F2C'; ctx.fill();   // one opaque fill first (the light's shape map)
  ctx.save(); gctx.save();
  ctx.beginPath(); ctx.arc(P[0], P[1], R, 0, 7); ctx.clip();
  gctx.beginPath(); gctx.arc(P[0] / 2, P[1] / 2, R / 2, 0, 7); gctx.clip();
  const cam = { x: EDIT_C0[0] - (P[0] - 540) / z, y: EDIT_C0[1] - (P[1] - 960) / z, zoom: z };
  edRoom(cam, t, S);
  ctx.restore(); gctx.restore();
  screenSpace();
  paint(() => { ctx.beginPath(); ctx.arc(P[0], P[1], R, 0, 7); ctx.lineWidth = Math.max(5, R * 0.045); ctx.strokeStyle = 'rgba(200,168,255,0.95)'; ctx.stroke(); });
}

// ---------------------------------------------------------------- the editing room's state (shared by the window and the shots)
const EF = ['R', 'R', 'L', 'L', 'S', 'S', 'R', 'R', 'L', 'L', 'R', 'R'];   // the strip: his eyes in the mirror, frame by frame
const SM0 = 4, SM1 = 5;                                                     // the smeared frames (mid-jump)
const X0_STOP = 540 - 4.5 * ED.PITCH;                                       // the strip stops with the smear in the middle
function editS(t) {
  const c = cu();
  const d = c.mid - t, run = d >= 0.4 ? 300 * (d - 0.2) : d > 0 ? 300 * d * d / 0.8 : 0;   // the film runs, then stops on "Mid-jump"
  const x0 = X0_STOP + run;
  const cutL = x0 + (SM0 - 0.5) * ED.PITCH, cutR = x0 + (SM1 + 0.5) * ED.PITCH;
  const loc = (wx, wy) => [(wx - ED.BX) / ED.BS, (wy - ED.BY) / ED.BS];
  const reach = ramp(t, c.blurry - 0.1, c.smear_end, E.inOutCubic) * (1 - ramp(t, c.snip_end + 0.15, c.snip_end + 0.5, E.inOutCubic));
  const restL = [-176, 118], restR = [176, 118];
  const tgtL = loc(cutL, ED.SY + ED.FH / 2 + 70), tgtR = loc(cutR, ED.SY + ED.FH / 2 + 70);
  const winSnips = [c.cuts, c.every - 0.02, c.jump - 0.02];          // in the window: a snip at every jump of his eyes
  // the cuts land in the pauses, just after their words: the left one after "so,", the right one after "SNIP."
  const openR = t < c.mid ? 0.8 * (1 - pulseOf(t, winSnips, 0.12)) : 0.85 * (1 - ramp(t, c.snip_end, c.snip_end + 0.06));
  const openL = t < c.mid ? 0.8 : 0.85 * (1 - ramp(t, c.so1_end - 0.02, c.so1_end + 0.04));
  const mood = t < c.mid ? 'think' : t < c.blurry ? 'calm' : t < c.snip_end ? 'squint' : 'grin';
  return {
    frames: EF, x0, cutL, cutR,
    gone: t >= c.snip_end ? { i0: SM0, i1: SM1, k: ramp(t, c.snip_end + 0.03, c.snip_end + 0.42, E.inCubic), dir: 1 } : null,
    glowI: t > c.blurry - 0.1 && t < c.snip_end ? [SM0, SM1] : null,
    brain: { mood, look: t < c.mid ? [0.3, -1] : [0, -1], armL: meLerp2(restL, tgtL, reach), armR: meLerp2(restR, tgtR, reach),
      scisL: { open: openL, rot: -Math.PI / 2, size: 2.1 }, scisR: { open: openR, rot: -Math.PI / 2, size: 2.1 } },
  };
}
// a white cut line across the strip at x (world), flashing
function cutFlash(x, k) {
  if (k <= 0.01) return;
  const y0 = ED.SY - ED.FH / 2 - 60, y1 = ED.SY + ED.FH / 2 + 60;
  for (const [cc, w, a] of [[ctx, 10, 0.95], [gctx, 26, 0.7]]) line(cc, x, y0, x, y1, w, rgba('#FFFFFF', a * k));
  softDot(gctx, x, ED.SY, 260, '#FFD447', 0.4 * k);
}

SC.hook = (lt, t, shot) => {
  const c = cu(), A = hookA(t), cam = hookCam(t);
  const win = ramp(t, c.your2 - 0.05, c.brain + 0.2, E.outBack);
  const dive = ramp(t, c.sneaky - 0.25, shot.end, E.inOutCubic);
  const camD = dive > 0.001 && HOOK_WIN ? scaledCam(cam, HOOK_WIN, 1 + 4.5 * E.inCubic(dive)) : cam;
  mirRoom(camD, t);
  const Hh = meHero(camD, t, A);
  HOOK_WIN = Hh.hp(WIN_HP);
  if (win > 0.001) {
    const P0 = toScreen(camD, ...HOOK_WIN);
    const zf = dive > 0.001 ? 1 + 4.5 * E.inCubic(dive) : 1;
    const R = lerp(0, WIN_R * cam.zoom, win) * zf + 1300 * E.inCubic(ramp(t, shot.end - 0.25, shot.end));
    const P = meLerp2(P0, [540, 960], E.inOutCubic(ramp(t, c.sneaky, shot.end)));
    const z = lerp(WIN_R * cam.zoom * 2 / 860, EDIT_Z0, E.inOutCubic(ramp(t, c.sneaky - 0.25, shot.end)));
    edWindow(P, R, z, t, editS(t));
  }
  return { glow: 0.85, zblur: 0.16 * E.inCubic(dive), zcx: 540, zcy: 960 };
};

// ================================================================ the editing room: the smear, SNIP
SC.edit = (lt, t, shot) => {
  const c = cu(), T0 = shot.start;
  const cam = camKeys(t, [[T0, EDIT_C0[0], EDIT_C0[1], EDIT_Z0], [c.mid, 540, 900, 1.25], [c.blurry, 540, 830, 1.6], [c.smear_end, 540, 820, 1.66],
    [c.so1, 540, 850, 1.55], [c.snip_end + 0.3, 540, 880, 1.4], [shot.end, 540, 885, 1.36]], E.inOutCubic);
  const sh = bumpAt(t, c.snip_end, 9) + 0.6 * bumpAt(t, c.so1_end, 10);
  cam.y += 7 * sh * Math.sin((t - c.snip_end) * 47);
  const S = editS(t);
  edRoom(cam, t, S);
  applyCam(cam);
  cutFlash(S.cutL, popK(t, c.so1_end + 0.02, c.so1_end + 0.32, 0.02, 0.25));
  cutFlash(S.cutR, popK(t, c.snip_end + 0.05, c.snip_end + 0.35, 0.02, 0.25));
  // labels (screen space)
  const top = toScreen(cam, 540, ED.SY - ED.FH / 2 - 80);
  tagPill('BLUR', 540, Math.max(560, top[1]), '#8FB8FF', popK(t, c.blurry - 0.05, c.snip_end - 0.05, 0.1, 0.1), 50);
  bigWord('SNIP!', 540, 600, 170, '#FF5A6E', E.outBack(clamp((t - c.snip) / 0.18), 2) * clamp((shot.end + 0.5 - t) / 0.3), -0.06);
  return { glow: 0.9, flash: 0.12 * (1 - ramp(lt, 0, 0.12)) + 0.1 * bumpAt(t, c.snip_end, 10) };
};

// ================================================================ the selfie camera: it runs late, so the jump shows
function phoneEyes(t) {
  const c = cu();
  const t0 = c.jump2, u = clamp((t - t0) / 0.45);                           // the late picture: the eyes SLIDE across
  const from = [-0.8, 0.15], to = [0.8, 0.15];
  if (t < t0) return { lx: from[0], ly: from[1] };
  if (u >= 1) return { lx: to[0], ly: to[1] };
  const e = E.inOutCubic(u);
  return { lx: lerp(from[0], to[0], e), ly: from[1], smear: { x0: from[0], x1: lerp(from[0], to[0], e), k: Math.sin(Math.PI * u) * 0.9, at: 1 } };
}
function stopwatch(x, y, r, t, k) {
  if (k <= 0.01) return;
  screenSpace();
  const s = E.outBack(clamp(k), 2);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -12, -r - 22, 24, 18, 5); ctx.fillStyle = '#FFD447'; ctx.fill();
  circle(ctx, 0, 0, r + 6, '#0B0B1A'); circle(ctx, 0, 0, r, '#FFD447'); circle(ctx, 0, 0, r - 8, '#FFF8E0');
  const a = -Math.PI / 2 + t * 5;
  line(ctx, 0, 0, Math.cos(a) * (r - 14), Math.sin(a) * (r - 14), 6, '#E8404E'); circle(ctx, 0, 0, 6, '#0B0B1A');
  ctx.restore();
}
const PH = { x: 540, y: 935, w: 560, h: 1040 };
SC.selfie = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  // his bathroom, out of focus behind the phone
  screenSpace();
  ctx.fillStyle = '#17566A'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalAlpha = 1; ctx.translate(540, 960); ctx.scale(1.5, 1.5); ctx.translate(-540, -900); ctx.drawImage(MIR_DAY, 0, 0); ctx.restore();
  ctx.fillStyle = 'rgba(6,22,34,0.42)'; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 9; i++) { const r = mulberry32(60 + i); softDot(ctx, r() * W, 200 + r() * 1500, 90 + 120 * r(), i % 2 ? '#FFE2A0' : '#BFF0FF', 0.10); }
  softDot(gctx, 140, 560, 420, '#FFE2A0', 0.18);
  const F = phoneEyes(t);
  const sway = 6 * Math.sin(t * 1.7);
  mePhoneHandBack(PH.x + sway, PH.y, PH.w, PH.h);
  const ph = mePhone(PH.x + sway, PH.y + 3 * Math.sin(t * 2.2), PH.w, PH.h, t, F, { rec: 1 });
  mePhoneHand(PH.x + sway, PH.y, PH.w, PH.h);
  // the slide, marked: streaks behind both irises while they travel
  if (F.smear && F.smear.k > 0.05) {
    const s3 = ph.sw / 150, ey = ph.sy + ph.sh * 0.43 + ME_EYE.y * s3;
    for (const e of [-1, 1]) for (let i = 0; i < 3; i++) {
      const xi = PH.x + sway + (e * ME_EYE.x + F.lx * 6.6) * s3, yy = ey + (i - 1) * 16;
      paint(() => line(ctx, xi - 30 - 70 * F.smear.k, yy, xi - 26, yy, 6, rgba('#FFFFFF', 0.85 * F.smear.k)));
    }
  }
  // LATE: a stopwatch on the phone's corner
  stopwatch(PH.x + PH.w / 2 - 70 + sway, PH.y - PH.h / 2 + 150, 46, t, popK(t, c.late - 0.08, shot.end + 1, 0.12, 0.1));
  tagPill('LATE', PH.x + sway, PH.y - PH.h / 2 + 150, '#FFD447', popK(t, c.late - 0.05, c.jump2 - 0.1, 0.12, 0.1), 44);
  // his brain's snip happens first (his own eyes jumped), then the late picture shows the slide
  snipMark(PH.x - PH.w / 2 + 110 + sway, PH.y - PH.h / 2 + 150, popK(t, c.so2 - 0.02, shot.end + 1, 0.05, 0.1), -0.5, 1);
  okTick(PH.x - PH.w / 2 + 160 + sway, PH.y - PH.h / 2 + 196, 22, ramp(t, c.so2 + 0.25, c.so2 + 0.4));
  tagPill('THERE!', PH.x + 150 + sway, PH.y + 210, '#4DFFB4', popK(t, c.after - 0.05, shot.end + 1, 0.12, 0.1), 48);
  return { glow: 0.85, flash: 0.14 * (1 - ramp(lt, 0, 0.12)), push: { k: 1 + 0.04 * ramp(lt, 0, D, E.inOutSine || ((x) => x)), cx: 540, cy: 900 } };
};

// ================================================================ the patch: the next picture stretched back over the hole
const PF = ['F', 'H', 'H', 'C1', 'C2', 'C3'];
SC.patch = (lt, t, shot) => {
  const c = cu(), T0 = shot.start;
  const x0 = 540 - 2 * ED.PITCH;
  const cam = camKeys(t, [[T0, 560, 900, 0.93], [c.patches, 545, 890, 0.97], [shot.end, 540, 890, 1.0]], E.inOutCubic);
  const k = ramp(t, c.patches - 0.05, c.hole + 0.15, E.inOutCubic);
  const loc = (wx, wy) => [(wx - ED.BX) / ED.BS, (wy - ED.BY) / ED.BS];
  const push = Math.sin(Math.PI * k);
  edRoom(cam, t, {
    frames: PF, x0, stretch: { i: 3, back: 2, k },
    brain: { mood: k > 0.5 ? 'grin' : 'think', look: [0.2, -1], armR: meLerp2([176, 118], loc(x0 + 2 * ED.PITCH, ED.SY + ED.FH / 2 + 60), Math.max(push, 0.25)), armL: [-170, 110] },
  });
  applyCam(cam);
  // the holes: a dashed red edge until they are filled
  const hk = 1 - ramp(t, c.patches + 0.1, c.hole + 0.1);
  if (hk > 0.01) paint(() => { ctx.save(); ctx.setLineDash([16, 12]); ctx.strokeStyle = rgba('#FF5A6E', 0.95 * hk); ctx.lineWidth = 6; ctx.strokeRect(x0 + 0.5 * ED.PITCH + 8, ED.SY - ED.FH / 2 - 26, 2 * ED.PITCH - 16, ED.FH + 52); ctx.restore(); });
  const hole = toScreen(cam, x0 + 1.5 * ED.PITCH, ED.SY);
  tagPill('HOLE', hole[0], hole[1], '#FF5A6E', popK(t, T0 + 0.15, c.patches + 0.05, 0.12, 0.1), 48, '#FFFFFF');
  for (const [j, tt] of [[2, c.patches + 0.18], [1, c.patches + 0.42]]) { const p = toScreen(cam, x0 + j * ED.PITCH, ED.SY - ED.FH / 2); sparkle(p[0] + 60, p[1] + 20, 26, popK(t, tt, tt + 0.5, 0.08, 0.3)); }
  const top = toScreen(cam, x0 + 2 * ED.PITCH, ED.SY - ED.FH / 2 - 90);
  tagPill('PATCH', top[0], Math.max(560, top[1]), '#4DFFB4', popK(t, c.patches + 0.2, shot.end + 1, 0.12, 0.1), 52);
  return { glow: 0.9, flash: 0.14 * (1 - ramp(lt, 0, 0.12)) };
};

// ================================================================ the clock: snap your eyes to it; the first tick hangs
const CLK = { x: 772, y: 652, r: 146 };
function clockA(t) {
  const c = cu();
  const L = lookAt(t, [[c.clock_on + 0.1, 0.92, -0.62]], [-0.15, 0.05]);
  const sus = ramp(t, c.first - 0.1, c.first + 0.25) ;
  return {
    face: { browY: 0.3 - 0.35 * sus, browTilt: -0.7 * sus, mouth: 'flat', mouthOpen: 0.1 - 0.4 * sus },
    eyes: { lx: L[0], ly: L[1], squint: 0.35 * sus, blink: pulseOf(t, [c.tick2 + 0.1], 0.1) },
    headDY: 0.6 * Math.sin(t * 2.1), bob: Math.sin(t * 2.1), headRot: -0.04 * ramp(t, c.clock_on, c.clock_on + 0.3),
  };
}
SC.clock = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 610, 1004, 3.2], [D, 606, 1004, 3.32]], E.inOutCubic);
  mirRoom(cam, t);
  const Hh = meHero(cam, t, clockA(t));
  // the clock on the tiles, off to one side, drawn after him so it stays sharp (screen space: the camera hardly moves)
  const ck = E.outBack(clamp((t - c.clock_on) / 0.22), 2.2);
  if (ck > 0.01) {
    screenSpace();
    const sec = tickSec(t, [c.tick1, c.tick2, c.tick3, c.tick4]);
    ctx.save(); ctx.translate(CLK.x, CLK.y); ctx.scale(ck, ck); ctx.translate(-CLK.x, -CLK.y);
    meClock(ctx, CLK.x, CLK.y, CLK.r, sec, t);
    ctx.restore();
    for (const f of [c.tick1, c.tick2, c.tick3]) {                       // a ring on every tick
      const k = popK(t, f, f + 0.35, 0.02, 0.3);
      if (k > 0.01) paint(() => { ctx.beginPath(); ctx.arc(CLK.x, CLK.y, CLK.r + 20 + 40 * (t - f), 0, 7); ctx.lineWidth = 6; ctx.strokeStyle = rgba('#FFD447', 0.8 * k); ctx.stroke(); });
    }
  }
  applyCam(cam);
  tagPill('1st TICK', CLK.x, CLK.y + CLK.r + 76, '#FFD447', popK(t, c.first - 0.05, shot.end + 1, 0.12, 0.1), 48);
  tagPill('LONGER?', CLK.x, CLK.y + CLK.r + 170, '#FF9A3C', popK(t, c.too - 0.05, shot.end + 1, 0.12, 0.1), 48);
  // a sweat drop on "right?"
  const sk = popK(t, c.right2 - 0.1, shot.end + 1, 0.1, 0.1);
  if (sk > 0.01) { const P = toScreen(cam, ...Hh.hp([58, -30 + 22 * clamp((t - c.right2) * 0.8)])); screenSpace(); sweatDrop(ctx, P[0], P[1], 1.0, sk); }
  return { glow: 0.85, flash: 0.14 * (1 - ramp(lt, 0, 0.12)) };
};

// ================================================================ the button: three times a second; not convinced? (into frame 1)
function buttonJumps() {
  const c = cu(), P = [[-0.85, 0.2], [0.8, -0.35], [-0.5, -0.6], [0.85, 0.4], [0, 0.6], [-0.85, -0.25], [0.7, 0.15], [-0.3, -0.5]];
  const out = [];
  for (let k = 0; k < P.length; k++) { const tk = c.it + 0.12 + k / 3; if (tk > c.second_end + 0.05) break; out.push([tk, ...P[k]]); }
  return out;
}
// the editing room in the button: the film racing, a snip with each jump, both hands, sweating
function buttonEditS(t, J) {
  const c = cu();
  const ev = J.filter((j, i) => i % 2 === 0).map((j) => j[0]), od = J.filter((j, i) => i % 2 === 1).map((j) => j[0]);
  const x0 = X0_STOP + 260 - 520 * Math.max(0, t - c.it) % (2 * ED.PITCH);
  return {
    frames: EF, x0,
    brain: { mood: 'worried', look: [0, -1], armL: [-150, -250], armR: [150, -250], bob: 4 * Math.sin(t * 30),
      scisL: { open: 0.8 * (1 - pulseOf(t, od, 0.12)), rot: -Math.PI / 2, size: 2.1 }, scisR: { open: 0.8 * (1 - pulseOf(t, ev, 0.12)), rot: -Math.PI / 2, size: 2.1 } },
  };
}
SC.button = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0;
  const J = buttonJumps();
  let L = lookAt(t, J, [0.85, 0.05]);
  const ask = ramp(t, c.not - 0.15, c.not + 0.1);
  if (t > c.not - 0.15) L = [0, 0.02];
  const back = ramp(t, shot.end - 0.5, shot.end, E.inOutCubic);
  const H0 = hookA(-0.45);
  const eyes = { lx: L[0], ly: L[1], squint: lerp(0.55 * ask, H0.eyes.squint, back), blink: 0 };
  if (back > 0.5) { eyes.lx = H0.eyes.lx; eyes.ly = H0.eyes.ly; }   // the look snaps back too: it never travels
  const face = { browY: lerp(0.35 - 0.3 * ask, H0.face.browY, back), browTilt: lerp(-0.85 * ask, H0.face.browTilt, back), mouth: 'flat', mouthOpen: lerp(0.1 - 0.35 * ask, H0.face.mouthOpen, back) };
  const A = { face, eyes, headDY: 0.6 * Math.sin(t * 2.1), bob: Math.sin(t * 2.1), headRot: lerp(0.07 * ask, H0.headRot, back) };
  const c0 = hookCam(-0.45);
  const cam = camKeys(lt, [[0, 540, 1004, 5.5], [c.second_end - T0, 540, 1006, 5.7], [c.not - T0, 540, 1024, 6.6], [Math.max(c.not - T0 + 0.3, D - 0.5), 540, 1026, 6.8], [D, c0.x, c0.y, c0.zoom]], E.inOutCubic);
  mirRoom(cam, t);
  const Hh = meHero(cam, t, A);
  // the window on his forehead again: the editor, snipping at every jump
  const win = ramp(t, T0, T0 + 0.22, E.outBack) * (1 - ramp(t, c.not - 0.2, c.not + 0.05, E.inCubic));
  if (win > 0.001) edWindow(toScreen(cam, ...Hh.hp(WIN_HP)), WIN_R * cam.zoom * win, WIN_R * cam.zoom * 2 / 860, t, buttonEditS(t, J));
  tagPill('3 A SECOND', 540, 548, '#FFD447', popK(t, c.three - 0.05, c.not - 0.15, 0.12, 0.1), 52);
  return { glow: 0.85, flash: 0.14 * (1 - ramp(lt, 0, 0.12)) };
};
SC.loop = (lt, t, shot) => {
  const tt = t - TLd.duration, A = hookA(tt), cam = hookCam(tt);
  mirRoom(cam, t);
  meHero(cam, t, A);
  return { glow: 0.85 };
};

// ================================================================ the cover (rendered by src/cover.sh from a one-shot timeline)
SC.cover = (lt, t) => {
  const cam = { x: 540, y: 1040, zoom: 5.6, rot: 0 };
  mirRoom(cam, 0.4);
  meHero(cam, 0.4, { face: { browY: 0.1, browTilt: -0.35 }, eyes: { lx: 0.85, ly: 0.05, squint: 0.1, smear: { x0: -0.85, x1: 0.85, k: 0.85, at: 1 } } });
  screenSpace();
  bigWord("YOU'VE NEVER SEEN", 540, 1250, 108, '#FFFFFF', 1, -0.03);
  bigWord('YOUR EYES MOVE', 540, 1395, 138, '#FFD447', 1, -0.03);
  return { glow: 0.85, noCaptions: true };
};

setLights({ hook: MORN_LIGHT, loop: MORN_LIGHT, cover: MORN_LIGHT, edit: EDIT_LIGHT, patch: EDIT_LIGHT, selfie: PHONE_LIGHT, clock: MORN_LIGHT, button: MORN_LIGHT });

function initScenes2() {
  initMirror();
}
