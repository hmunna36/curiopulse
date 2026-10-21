// Why Can't You TICKLE Yourself? Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the
// shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;
// the strongest of a list of pulses at time t: each is on for `len` seconds, with soft edges
const pulseOf = (t, times, len = 0.16) => times.reduce((m, f) => Math.max(m, clamp((t - f) / 0.03) * clamp((f + len - t) / 0.05)), 0);
// a decaying bump after a moment
const bumpAt = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the living room at night: the TV in front of him is the key (cool, from the front, a little to the right), the warm
// floor lamp far left behind him is the rim (vulcan-salute's room)
const TV_LIGHT = (lt, t) => ({ ...LIGHTS.night, key: [0.30, -0.42, 0.85], keyTint: [0.9 + 0.04 * tvFlick(t), 0.98, 1.1 + 0.05 * tvFlick(t)],
  rimFrom: [-0.85, -0.35], rim: [1.0, 0.70, 0.42], rimAmt: 1.2, pool: 0.62, halo: 0.12, haloColor: [0.6, 0.75, 1.0], dof: 0.8 });
// the brain's room: lit by its screen
const ROOM_LIGHT = { ...LIGHTS.screen, pool: 0.3, halo: 0, rim: [1.0, 0.55, 0.85] };
// the lab: cool monitors from the left, a cyan rim
const LAB_LIGHT = { ...LIGHTS.screen, key: [-0.2, -0.5, 0.84], pool: 0.4, halo: 0.08, rim: [0.5, 0.85, 1.0], rimAmt: 0.9 };

// the palm's middle (raised-hand units, canonical) and the window on his forehead
const PALM_C = [0, -46];
const WIN_Y = -52;                    // head units: the middle of the window
const ROOM_F = [540, 900];            // the brain's-room point at the middle of the window (the room view after the dive)
const BOOK_F = [500, 1150];           // ... and in the hook: the brain and its book

// ================================================================ the living room: frame 1 and round it
// his state at tt = seconds since frame 1 (negative = the last frames of the Short, on their way here)
function hookA(tt) {
  const c = cu();
  // the tickle: eager from frame 1, harder on "Right now", it peters out; he stops on "Nothing"
  const hard = ramp(tt, c.right1 - 0.1, c.right1 + 0.1) * (1 - ramp(tt, c.now_end + 0.1, c.now_end + 0.4));
  // "Nothing, right?": he keeps going, slow and bored (no held stare before 12 s), and stops as the window opens
  const stop = ramp(tt, c.your1 - 0.15, c.your1 + 0.1);
  const w = (0.85 + 0.35 * hard) * (1 - 0.6 * ramp(tt, c.now_end + 0.15, c.nothing)) * (1 - stop);
  const wg = tkWiggle(tt, w, 1 + 0.35 * hard);
  const poke = { tip: [PALM_C[0] + wg[0], PALM_C[1] + wg[1]], k: 1, bend: 0.5 + 0.5 * Math.sin(tt * 23) * w };
  // his face: eager -> meh -> flat at us ("Nothing, right?") -> eyes up at his own forehead
  let face = lerpFace(TF.eager, TF.meh, ramp(tt, c.now_end + 0.05, c.nothing - 0.05));
  face = lerpFace(face, TF.flat, ramp(tt, c.right2 - 0.08, c.right2 + 0.1));
  face = lerpFace(face, TF.up, ramp(tt, c.your1 - 0.12, c.your1 + 0.12));
  face = { ...face, blink: Math.max(face.blink || 0, pulseOf(tt, [1.2, c.right2_end + 0.05], 0.12)) };
  // a shrug on "right?": shoulders and head
  const shrug = ramp(tt, c.right2 - 0.12, c.right2 + 0.1, E.outBack) * (1 - ramp(tt, c.right2_end + 0.1, c.right2_end + 0.4));
  const A = {
    face, poke, H: { view: 0, spread: { L: -0.05, R: -0.02, M: 0.02, I: 0.05 } },
    lean: 0.03 * (1 - stop), bob: -7 * shrug + 1.2 * Math.sin(tt * 2.3),
    headDX: 3 * Math.sin(tt * 1.7), headDY: 1.2 * Math.sin(tt * 2.3) - 5 * shrug, headRot: 0.05 * shrug - 0.04 * ramp(tt, c.your1, c.your1 + 0.3),
    handRot: 0.02 * Math.sin(tt * 2.1),
  };
  return { A, w, stop, shrug };
}
function hookCam(tt) {
  const c = cu();
  const k = camKeys(tt, [[-0.4, 640, 1010, 3.15], [0, 640, 1010, 3.15], [0.6, 642, 1004, 3.27], [c.right1, 643, 1001, 3.33],
    [c.nothing, 628, 1010, 3.2], [c.right2_end, 622, 1008, 3.22], [c.your1 + 0.2, 566, 950, 3.45], [c.spoiler_end + 0.4, 556, 940, 3.65]], E.inOutCubic);
  if (tt >= 0 && tt < 0.6) { const u = E.outCubic(tt / 0.6); k.zoom = lerp(3.15, 3.27, u); k.x = lerp(640, 642, u); k.y = lerp(1010, 1004, u); }   // the first push is quick off the mark
  const sh = shake(tt, 1.6 * pulseOf(tt, [c.right1], 0.3), 26, 3);
  k.sx = sh[0]; k.sy = sh[1];
  return k;
}
function roomDraw(t, o) {
  roomBack(o.cam, t);
  if (o.behind) { applyCam(o.cam); o.behind(); }
  const Hh = tkHero(o.cam, t, o.A);
  applyCam(o.cam);
  if (o.after) o.after(Hh);
  return Hh;
}
// scratch marks beside the tickling fingertip (screen space): little arcs that say "scritch"
function scritch(P, t, k, seed = 1) {
  if (k <= 0.01) return;
  screenSpace();
  for (let i = 0; i < 3; i++) {
    const ph = (t * 3.1 + i / 3 + hash(seed + i) * 0.3) % 1, a = -0.6 + i * 0.9 + 0.2 * Math.sin(t * 7 + i);
    const r0 = 70 + 46 * ph, r1 = r0 + 30;
    const al = Math.sin(Math.PI * ph) * k;
    if (al < 0.05) continue;
    const q = [P[0] + Math.cos(a) * r0, P[1] + Math.sin(a) * r0], e = [P[0] + Math.cos(a) * r1, P[1] + Math.sin(a) * r1];
    ctx.save(); ctx.globalAlpha = al;
    line(ctx, q[0], q[1], e[0], e[1], 12, '#3A1A2E'); line(ctx, q[0], q[1], e[0], e[1], 7, '#FFE58A');
    ctx.restore();
  }
}

// ---------------------------------------------------------------- the brain's room (room space, under fmView)
// the room's state at video time t: o for tkRoom
function roomState(t) {
  const c = cu();
  // the book (hook): read, bored; SPOILERS slaps on; it goes down on "keeps"
  const book = (1 - ramp(t, c.keeps - 0.1, c.keeps + 0.25, E.inCubic));
  const sticker = ramp(t, c.spoiler - 0.05, c.spoiler + 0.12);
  // the copier: a slip on "copy", more on "every move"
  const slip1 = ramp(t, c.copy1 - 0.05, c.copy1 + 0.45, E.outCubic);
  const stackN = Math.floor(clamp((t - c.every) / (c.move_end - c.every + 0.2)) * 4);
  // the forecast ring, the landing, the tick
  const target = ramp(t, c.exactly - 0.05, c.exactly + 0.2) * (1 - ramp(t, c.no2 - 0.2, c.no2 - 0.1));
  const lift = ramp(t, c.where - 0.2, c.where + 0.1) * (1 - ramp(t, c.lands - 0.12, c.lands + 0.02, E.inCubic));
  const pipOn = ramp(t, c.no2 - 0.2, c.no2 - 0.1);
  const match = ramp(t, c.lands + 0.02, c.lands + 0.2) * (1 - pipOn);
  // the knob: the touch comes in on "surprise", the brain turns it down on "turns ... down"
  const sig = ramp(t, c.surprise - 0.1, c.surprise_end - 0.05);
  const turn = ramp(t, c.turns - 0.05, c.down + 0.15, E.inOutCubic);
  // Pip's finger: ??? and the alarm; the knob spins to MAX by itself
  const other = ramp(t, c.no2 - 0.15, c.no2 + 0.25, E.outCubic);
  const alarm = other > 0.5 ? 1 : 0;
  let level = 0.85 * sig * (1 - turn) + 0.06;
  if (t > c.no2 - 0.2) level = lerp(0.06, 1, ramp(t, c.no2, c.warning + 0.25, E.outBack));
  // the brain: bored with the book, busy with the copy, smug at the tick, yawning at the knob, panicking at the alarm
  let mood = 'calm', look = [0, 0.7], shut = 0.35, armL = null, armR = null, thumbR = false;
  if (t < c.keeps) { look = [0.1, 0.8]; shut = 0.4; armL = [-120, 30]; armR = [120, 30]; if (t > c.spoiler + 0.1) { look = [0, 0]; shut = 0.5; } }
  else if (t < c.knows) { mood = 'think'; look = [-0.8, 0.2]; shut = 0; armL = [lerp(-176, -238, slip1), lerp(118, -10, slip1)]; }
  else if (t < c.no1) { mood = match > 0.5 ? 'grin' : 'think'; look = [0, -1]; shut = 0; armL = [-238, -10]; if (match > 0.5) { thumbR = true; armR = [176, 40]; } }
  else if (t < c.no2 - 0.2) { mood = 'calm'; look = [0.8, 0.5]; shut = 0.55; armR = [150, 40]; }
  else { mood = 'wow'; look = [0, -1]; shut = 0; armL = [-200, -60]; armR = [200, -60]; }
  // how strongly the touch is felt: full when it arrives, turned down with the knob; full again for Pip's finger
  const felt = t > c.no2 - 0.2 ? level : ramp(t, c.surprise_end - 0.12, c.surprise_end + 0.04) * level;
  // the hand on the knob (from "No surprise?" until Pip), and FEELING over it from the knob shot on
  const turnHand = ramp(t, c.no1 - 0.1, c.surprise_end, E.inOutCubic) * (1 - ramp(t, c.no2 - 0.3, c.no2 - 0.15));
  const labelK = ramp(t, c.no1 - 0.3, c.no1 - 0.1);
  return { book, sticker, slip1, stackN, target, lift, match, sig, turn, level, felt, turnHand, labelK, other, alarm, brain: { mood, look, shut, armL, armR, thumbR } };
}
// the room itself. o = roomState(t), plus {wig, bend, busy}
function tkRoom(t, o) {
  fmRoom(t);
  // the title hides while the camera is pushed in on the copier (it would sit on the watermark's corner) and in the
  // knob shot (it would sit under the app's top bar)
  const c = cu(), titleOn = t < c.copy1 - 0.15 || (t > c.knows && t < c.no1 - 0.1);
  tkPalmScreen(t, { wig: o.wig || [0, 0], bend: o.bend || 0, finger: 1, target: o.target, other: o.other, alarm: o.alarm, felt: o.felt,
    title: o.alarm ? '???' : titleOn ? 'YOUR PALM' : ' ' });
  // the touch's way in: a cable from the screen to the knob, and the touch running down it
  const ca = [700, 862], cb = [TKR.KN[0] - 20, TKR.KN[1] - 96];
  line(ctx, ca[0], ca[1], cb[0], cb[1], 12, '#2A1D3E');
  if (o.sig > 0.01 && o.sig < 0.99) { const p = [lerp(ca[0], cb[0], o.sig), lerp(ca[1], cb[1], o.sig)]; circle(ctx, p[0], p[1], 16, '#FFD447'); softDot(gctx, p[0], p[1], 60, '#FFD447', 0.8); }
  actor(() => erBrain(ctx, TKR.BX, TKR.BY, TKR.BS, t, o.brain));
  fmDesk(TKR.DESK, t);
  tkPrinter(TKR.PR[0], TKR.PR[1], 1.25, t, { busy: o.busy || 0 });
  // the copies: the first in the brain's hand, more fly out of the copier onto a stack
  for (let i = 0; i < 3; i++) {
    const k = clamp((o.stackK || 0) * 3 - i);
    if (k <= 0.01) continue;
    const from = [TKR.PR[0], TKR.PR[1] - 30], to = [TKR.PR[0] - 20 + i * 14, TKR.PR[1] - 150 - i * 16];
    const u = E.outCubic(k), p = [lerp(from[0], to[0], u), lerp(from[1], to[1], u) - 60 * Math.sin(Math.PI * u)];
    tkSlip(p[0], p[1], 0.62, lerp(0.4, 0.06 * (i % 2 ? 1 : -1), u), 'COPY', '#2C6BD8', 1, t);
  }
  if (o.slip1 > 0.01 && o.book < 0.5) {
    const arm = o.brain.armL || [-176, 118];
    const hand = [TKR.BX + arm[0] * TKR.BS, TKR.BY + arm[1] * TKR.BS];
    const from = [TKR.PR[0], TKR.PR[1] - 40], p = [lerp(from[0], hand[0], o.slip1), lerp(from[1], hand[1] - 92, o.slip1)];
    tkSlip(p[0], p[1], 0.92, -0.08, 'COPY', '#2C6BD8', 1, t);
  }
  const grip = tkKnob(TKR.KN[0], TKR.KN[1], 62, o.level, t, { glow: o.alarm, labelK: o.labelK === undefined ? 1 : o.labelK });
  // the brain's hand turning it: its arm again, over the knob, the hand on the pointer's end
  if (o.turnHand > 0.01) {
    const sh = [TKR.BX + 138 * TKR.BS, TKR.BY + 30 * TKR.BS], hd = [lerp(sh[0] + 40, grip[0], o.turnHand), lerp(sh[1] + 60, grip[1], o.turnHand)];
    actor(() => {
      ctx.beginPath(); ctx.moveTo(sh[0], sh[1]); ctx.quadraticCurveTo((sh[0] + hd[0]) / 2 + 10, (sh[1] + hd[1]) / 2 + 40, hd[0], hd[1]);
      ctx.lineWidth = 17 * TKR.BS; ctx.lineCap = 'round'; ctx.strokeStyle = '#E0688E'; ctx.stroke();
      circle(ctx, hd[0], hd[1], 22 * TKR.BS, '#FFA9C0');
      circle(ctx, hd[0] + 12, hd[1] - 14, 9 * TKR.BS, '#FFA9C0');
    });
  }
  // the book, held up in front of the brain (hook)
  if (o.book > 0.01) tkBook(TKR.BX, TKR.BY + 150, 0.82, o.book, t, { sticker: o.sticker, rot: 0.04 });
  // the tick when the finger lands on the forecast
  if (o.match > 0.01) {
    const [sx, sy, sw] = TKR.SCR, q = E.outBack(clamp(o.match), 2.2), X = sx + sw - 110, Y = sy + 110;
    ctx.save(); ctx.translate(X, Y); ctx.scale(q, q);
    circle(ctx, 0, 0, 62, '#0B2A1E'); circle(ctx, 0, 0, 54, '#4DFFB4');
    paint(() => { ctx.beginPath(); ctx.moveTo(-26, 2); ctx.lineTo(-6, 22); ctx.lineTo(28, -20); ctx.lineWidth = 13; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#0B2A1E'; ctx.stroke(); });
    ctx.restore();
    softDot(gctx, X, Y, 100, '#4DFFB4', 0.5 * o.match);
  }
  // the alarm beacon on the brain's head
  if (o.alarm) {
    const on = Math.sin(t * 26) > 0, bx = TKR.BX, by = TKR.BY - 150 * TKR.BS;
    rrect(ctx, bx - 30, by - 36, 60, 46, 16); ctx.fillStyle = on ? '#FF3B4E' : '#8A1A28'; ctx.fill();
    if (on) softDot(gctx, bx, by - 12, 180, '#FF3B4E', 0.9);
  }
}
// the room inside a round window at screen point P, radius R (screen px); s = the room's scale inside it
function tkWindow(P, R, s, t, o, F = ROOM_F) {
  if (R < 1) return;
  screenSpace();
  // an opaque disc first, outside any clip: the light engine then knows this is a new thing in front of his head
  ctx.beginPath(); ctx.arc(P[0], P[1], R, 0, 7); ctx.fillStyle = '#2B1440'; ctx.fill();
  ctx.save(); gctx.save();
  ctx.beginPath(); ctx.arc(P[0], P[1], R, 0, 7); ctx.clip();
  gctx.beginPath(); gctx.arc(P[0], P[1], R, 0, 7); gctx.clip();
  fmView({ s, x: P[0] - F[0] * s, y: P[1] - F[1] * s });
  tkRoom(t, o);
  ctx.restore(); gctx.restore();
  screenSpace();
  paint(() => { ctx.beginPath(); ctx.arc(P[0], P[1], R, 0, 7); ctx.lineWidth = Math.max(4, R * 0.04); ctx.strokeStyle = 'rgba(255,170,220,0.95)'; ctx.stroke(); });
}
// the window's size and the camera's extra push in the hook (from "Your brain" to the dive)
function hookWin(t) {
  const c = cu();
  const open = ramp(t, c.your1 - 0.05, c.your1 + 0.35, E.outBack);
  const grow = ramp(t, c.your1 + 0.2, c.read + 0.1, E.inOutCubic);
  return { open, grow, R: open * lerp(110, 300, grow), k: 1 + 0.55 * grow };
}

// ================================================================ shots
SC.hook = (lt, t, shot) => {
  const c = cu(), S = hookA(t), cam0 = hookCam(t), Wn = hookWin(t);
  const st0 = tkSt(S.A), FH = vsHeadPt(st0, 0, WIN_Y);
  const cam = scaledCam(cam0, FH, Wn.k);
  const Hh = roomDraw(t, { cam, A: S.A });
  // scritch marks by the fingertip while he tickles
  if (Hh.P) { const p = Hh.hp(S.A.poke.tip), P = toScreen(cam, p[0], p[1]); scritch(P, t, S.w * (1 - Wn.open)); }
  // the window on his forehead: the brain reading THE TICKLE
  if (Wn.R > 1) {
    const P = toScreen(cam, FH[0], FH[1]), ro = roomState(t);
    tkWindow(P, Wn.R, Wn.R / 250, t, ro, BOOK_F);
  }
  // captions under the window while it is open (the chunk "Your brain read / the spoiler." sits there whole)
  return { glow: 0.85, flash: 0.06 * bumpAt(t, c.nothing, 8) + 0.1 * bumpAt(t, c.spoiler, 9), capY: t >= c.your1 - 0.02 ? 1570 : 1330 };
};

SC.brain = (lt, t, shot) => {
  const c = cu(), DIVE = 0.55, ro = roomState(t);
  const wg = tkWiggle(t, 0.7 * (1 - ro.lift) * (1 - ro.match * 0.9)), lift = ro.lift;
  ro.wig = [wg[0], wg[1] - 26 * lift]; ro.bend = 0.4 + 0.4 * Math.sin(t * 23);
  ro.busy = ramp(t, c.keeps, c.keeps + 0.05) * (1 - ramp(t, c.move_end + 0.1, c.move_end + 0.2));
  ro.stackK = ramp(t, c.every - 0.05, c.move_end + 0.15);
  if (lt < DIVE) {
    // the dive: through the window on his forehead, which fills the frame
    const u = E.inOutCubic(lt / DIVE), tt = shot.start - 0.001;
    const S = hookA(tt), cam0 = hookCam(tt), Wn = hookWin(tt);
    const st0 = tkSt(S.A), FH = vsHeadPt(st0, 0, WIN_Y);
    const k = Wn.k * (1 + 5 * E.inCubic(u));
    const cam = scaledCam(cam0, FH, k);
    roomDraw(t, { cam, A: S.A });
    const P0 = toScreen(scaledCam(cam0, FH, Wn.k), FH[0], FH[1]);
    const R = lerp(Wn.R, 1250, E.inCubic(u));
    const s = lerp(Wn.R / 250, 1, u);
    const P = [lerp(P0[0], ROOM_F[0], u), lerp(P0[1], ROOM_F[1], u)];
    const F = [lerp(BOOK_F[0], ROOM_F[0], u), lerp(BOOK_F[1], ROOM_F[1], u)];
    tkWindow(P, R, s, t, ro, F);
    return { glow: 0.85, zblur: 0.2 * E.inCubic(u), zcx: P[0], zcy: P[1], capY: 1580 };
  }
  // the room: in on the copier and the copy, then up to the screen for the forecast
  const D = shot.end - shot.start;
  const cam = sectionCam(t, [[shot.start + DIVE, 540, 900, 1.0, 900], [c.copy1, 420, 1040, 1.22, 1150], [c.move_end, 410, 1030, 1.24, 1150],
    [c.exactly - 0.1, 540, 620, 1.15, 720], [c.lands_end, 540, 630, 1.18, 724]]);
  fmView(cam);
  tkRoom(t, ro);
  void D;
  return { glow: 0.85, flash: 0.18 * (1 - clamp((lt - DIVE) / 0.2)) + 0.08 * bumpAt(t, c.lands, 10), capY: 1580 };
};

SC.knob = (lt, t, shot) => {
  const c = cu(), ro = roomState(t);
  ro.wig = tkWiggle(t, 0.5); ro.bend = 0.4;
  // closer on the desk: the meter, the knob and the brain's hand on it
  const cam = sectionCam(t, [[shot.start, 640, 1000, 1.3, 960], [c.turns, 690, 1110, 1.55, 980], [shot.end, 700, 1120, 1.6, 980]]);
  fmView(cam);
  tkRoom(t, ro);
  // the brain yawns at the boring touch: z z z
  screenSpace();
  const zk = ramp(t, c.down - 0.1, c.down + 0.2);
  if (zk > 0.01) { const p = [cam.x + (TKR.BX + 60) * cam.s, cam.y + (TKR.BY - 150) * cam.s]; zzz(p[0], p[1], t, c.down - 0.1, zk, 1.8); }
  return { glow: 0.85, flash: 0.12 * bumpAt(t, shot.start, 10), capY: 1580 };
};

// ---------------------------------------------------------------- the payoff: Pip's finger
function payA(t) {
  const c = cu();
  const pipIn = ramp(t, c.but - 0.1, c.else + 0.2, E.outCubic);                  // she leans in from the right
  const reach = ramp(t, c.else + 0.1, c.finger2 + 0.1, E.inOutCubic);              // her finger goes out to his palm
  const touch = ramp(t, c.finger2 + 0.05, c.finger2 + 0.15);                       // it lands
  const jolt = ramp(t, c.finger2 + 0.08, c.finger2 + 0.2, E.outBack);              // he jumps
  const laugh = ramp(t, c.fall - 0.25, c.fall + 0.05);                              // he cracks up
  const fallK = ramp(t, c.apart - 0.1, c.apart + 0.45, E.inCubic);                  // and falls apart: sinks and keels over
  const myPoke = 1 - ramp(t, c.finger2, c.finger2 + 0.25, E.inCubic);              // his own hand drops away
  const wgMine = tkWiggle(t, 0.45 * myPoke);
  const pipWig = tkWiggle(t + 0.3, touch * 1.2, 1.2);
  let face = lerpFace(TF.meh, TF.jolt, jolt);
  face = lerpFace(face, TF.laugh, laugh);
  const A = {
    face, H: { view: 0, spread: { L: -0.08 * jolt, R: -0.04 * jolt, M: 0.04 * jolt, I: 0.1 * jolt } },
    poke: myPoke > 0.02 ? { tip: [PALM_C[0] + wgMine[0], PALM_C[1] + wgMine[1] + 40 * (1 - myPoke)], k: myPoke > 0.98 ? 1 : myPoke, bend: 0.3 } : null,
    armL: TK_ARM.restL, handL: 'open',
    shake: laugh, lean: -0.1 * laugh - 0.16 * fallK, bob: 6 * laugh + 1.2 * Math.sin(t * 2.3), dy: 90 * fallK,
    headDX: 3 * Math.sin(t * 1.7), headDY: -6 * jolt * (1 - laugh) + 10 * laugh, headRot: -0.12 * laugh - 0.15 * fallK,
  };
  return { A, pipIn, reach, touch, jolt, laugh, fallK, pipWig };
}
SC.payoff = (lt, t, shot) => {
  const c = cu(), S = payA(t), D = shot.end - shot.start;
  // a little wider than the hook: room for Pip on the right
  const cam = camKeys(t, [[shot.start, 640, 1060, 2.2], [c.finger2, 650, 1050, 2.3], [c.no2, 640, 1010, 2.6], [c.and_you, 640, 1050, 2.35], [shot.end, 630, 1070, 2.2]]);
  const sh = shake(t, 4 * S.laugh + 3 * pulseOf(t, [c.finger2 + 0.08], 0.25), 22, 5);
  cam.sx = sh[0]; cam.sy = sh[1];
  let Hh = null;
  Hh = roomDraw(t, { cam, A: S.A, after: (H2) => {
    // Pip: from the right edge, leaning in, her finger on his palm (it wiggles once there)
    if (S.pipIn > 0.01 && H2.P) {
      const palm = H2.hp([PALM_C[0] + S.pipWig[0], PALM_C[1] + S.pipWig[1]]);
      const face = S.laugh > 0.3 ? PIPF.glee : PIPF.sneak;
      tkPip(cam, t, { x: lerp(1100, 884, S.pipIn), y: 1268 + 40 * S.fallK, s: 0.6, rot: lerp(-0.1, -0.42, S.pipIn), face, reach: palm, k: S.reach });
    }
  } });
  // the window: what the brain sees (no forecast, ???), and its knob spinning to MAX
  const wk = popK(t, c.no2 - 0.12, c.and_you - 0.05, 0.14, 0.12);
  if (wk > 0.01) {
    const st0 = tkSt(S.A), FH = vsHeadPt(st0, 0, WIN_Y), P = toScreen(cam, FH[0], FH[1]);
    tkWindow([clamp(P[0], 420, 700), P[1] - 170], 270 * E.outBack(wk, 1.6), 0.93 * E.outBack(wk, 1.6), t, roomState(t), [540, 830]);
  }
  // he falls apart: HA HA
  if (S.laugh > 0.01 && Hh) { const P = toScreen(cam, Hh.head[0], Hh.head[1]); haMarks(P[0], P[1] - 120, t, S.laugh, 3, 70); }
  void D;
  return { glow: 0.85, flash: 0.1 * bumpAt(t, c.finger2 + 0.08, 10) + 0.08 * bumpAt(t, c.fall, 9) };
};
// laughter marks ("HA" letters popping off a laughing head), screen space (the long-form's haMarks)
function haMarks(x, y, t, k = 1, seed = 1, size = 64) {
  if (k <= 0) return;
  screenSpace();
  for (let i = 0; i < 4; i++) {
    const ph = (t * 1.6 + i / 4 + hash(seed + i) * 0.2) % 1, side = i % 2 ? 1 : -1;
    const px = x + side * (100 + 110 * ph), py = y - 20 - 150 * ph;
    const s = Math.sin(Math.PI * ph) * k;
    if (s < 0.05) continue;
    ctx.save(); ctx.translate(px, py); ctx.rotate(side * 0.25); ctx.scale(s, s);
    ctx.font = `400 ${size * (0.8 + 0.4 * ph)}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    ctx.lineWidth = 10; ctx.strokeStyle = '#0B0B1A'; ctx.strokeText('HA', 0, 0); ctx.fillStyle = '#FFD447'; ctx.fillText('HA', 0, 0);
    ctx.restore();
  }
}

// ---------------------------------------------------------------- the lab: the robot copies his tickle, late
const STICK = [598, 1236];            // the handle's knob at rest (world)
function labA(t) {
  const c = cu();
  const arrive = ramp(t, c.scientists - 0.1, c.robot1 + 0.35, E.outCubic);           // the robot swings in
  const move = ramp(t, c.copy2 - 0.2, c.copy2 + 0.1);                                  // he works the handle
  const delay = 0.2 * ramp(t, c.fifth - 0.05, c.late - 0.05);                          // a fifth of a second
  const ramp1 = ramp(t, c.and_sud - 0.1, c.it3, E.inCubic), giggle = ramp(t, c.tickled - 0.12, c.tickled + 0.08);
  const wav = (tt) => Math.sin(tt * 2 * Math.PI * 2.0);                                // 2 Hz, as in the study
  const hand = move * 24 * wav(t), foam = move * 24 * wav(t - delay);
  let face = lerpFace(TF.eager, TF.meh, ramp(t, c.copy2, c.tickle2_end));
  face = lerpFace(face, TF.twitchy, ramp1);
  face = lerpFace(face, TF.laugh, giggle);
  const A = {
    face, H: { view: 0, spread: { L: -0.05, R: -0.02, M: 0.02, I: 0.05 } }, armL: { e: [-30, -232], w: [STICK[0] - 540 + hand - 2, STICK[1] - 1500 + 6] },
    handL: 'fist', goggles: 1, shake: 0.85 * giggle, lean: -0.05 * giggle, bob: 5 * giggle + 1.2 * Math.sin(t * 2.3),
    headDX: 3 * Math.sin(t * 1.7), headDY: 6 * giggle, headRot: -0.1 * giggle + 0.03 * ramp1 * Math.sin(t * 30), tv: 0.15,
  };
  return { A, arrive, move, delay, hand, foam, ramp1, giggle };
}
SC.lab = (lt, t, shot) => {
  const c = cu(), S = labA(t);
  const cam = camKeys(t, [[shot.start, 640, 1030, 1.85], [c.copy2, 642, 1020, 1.92], [c.fifth - 0.1, 650, 990, 2.0], [c.late_end, 648, 994, 2.02],
    [c.and_sud, 630, 1000, 2.1], [c.tickled, 610, 1010, 2.3], [shot.end, 606, 1014, 2.36]]);
  const sh = shake(t, 3.5 * S.giggle, 24, 7); cam.sx = sh[0]; cam.sy = sh[1];
  tkLabBack(cam, t);
  const Hh = tkHero(cam, t, Object.assign({}, S.A, {
    prop: (lc) => tkJoystick(lc, STICK[0] - 540, STICK[1] - 1500 + 78, S.hand, t),   // the handle in front of his chest, under his fist
  }));
  applyCam(cam);
  // the robot: from the right, its foam on his palm, copying the handle (late)
  if (Hh.P) {
    const palm = Hh.hp([PALM_C[0], PALM_C[1]]), base = [890, 1250];
    const tip0 = [palm[0] + 40, palm[1] + 10], far = [1180, 900];
    const tip = [lerp(far[0], tip0[0], S.arrive) + S.foam * 0.9 * S.arrive, lerp(far[1], tip0[1], S.arrive) - 4 * Math.abs(S.foam) * 0.1];
    const R = tkRobot(base, tip, t, { L1: 220, L2: 210 });
    // the lag, drawn: a dashed ghost where the foam would be in step with the handle; the real foam trails it
    const gk = ramp(t, c.fifth, c.second, E.outCubic) * S.arrive;
    if (gk > 0.01) {
      const fa = Math.atan2(R.tip[1] - R.el[1], R.tip[0] - R.el[0]), now = lerp(far[0], tip0[0], S.arrive) + S.hand * 0.9;
      const g = [now + Math.cos(fa) * 40, tip[1] + Math.sin(fa) * 40];
      paint(() => {
        ctx.save(); ctx.setLineDash([9, 7]); ctx.lineDashOffset = -t * 30;
        ctx.beginPath(); ctx.arc(g[0], g[1], 29 * gk, 0, 7); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,134,182,0.95)'; ctx.stroke();
        ctx.restore();
      });
    }
  }
  // the panel: DELAY 0.0 s -> 0.2 s; under it the TICKLE bar, low until "suddenly"
  const val = (Math.round(S.delay * 10) / 10).toFixed(1) + ' s';
  const lvl = 0.12 + 0.1 * S.move * Math.abs(Math.sin(t * 7)) * (1 - S.ramp1) + 0.45 * S.ramp1 + 0.45 * S.giggle;
  tkReadout(540, 590, val, ramp(t, c.robot1, c.robot1 + 0.3), S.delay > 0.15 ? 1 : 0, Math.min(1, lvl), t);
  // HA HA when it tickles
  if (S.giggle > 0.01) { const P = toScreen(cam, Hh.head[0], Hh.head[1]); haMarks(P[0], P[1] - 100, t, S.giggle, 7, 66); }
  return { glow: 0.85, flash: 0.14 * bumpAt(t, shot.start, 10) + 0.08 * bumpAt(t, c.tickled, 9) };
};

// ================================================================ the button: no robot; back to tickling (frame 1)
function buttonA(t) {
  const c = cu(), tt = t - TL.duration, S = hookA(tt);
  const look = ramp(t, c.no3 - 0.15, c.no3 + 0.1) * (1 - ramp(t, c.luck_end + 0.05, TL.duration - 0.5));
  const shrug = ramp(t, c.good - 0.1, c.good + 0.15, E.outBack) * (1 - ramp(t, c.luck_end - 0.05, c.luck_end + 0.25));
  let face = lerpFace(S.A.face, TF.flat, look);
  face = lerpFace(face, TF.sheepish, shrug);
  const A = Object.assign({}, S.A, { face, bob: S.A.bob - 9 * shrug, headDY: S.A.headDY - 6 * shrug, headRot: S.A.headRot + 0.08 * shrug });
  // his tickle pauses while he looks at us, then he goes straight back to it
  const w = 1 - look;
  const wg = tkWiggle(tt, 0.85 * w);
  A.poke = { tip: [PALM_C[0] + wg[0], PALM_C[1] + wg[1]], k: 1, bend: 0.5 + 0.5 * Math.sin(tt * 23) * w };
  return { A, look, shrug, w };
}
SC.button = (lt, t, shot) => {
  const c = cu(), B = buttonA(t), tt = t - TL.duration;
  const cam = hookCam(tt);
  const zin = ramp(t, c.no3 - 0.05, c.no3 + 0.25, E.outCubic) * (1 - ramp(t, c.luck_end, TL.duration - 0.45, E.inOutCubic));
  cam.zoom *= 1 - 0.06 * zin; cam.y -= 30 * zin;
  const Hh = roomDraw(t, { cam, A: B.A });
  if (Hh.P) { const p = Hh.hp(B.A.poke.tip), P = toScreen(cam, p[0], p[1]); scritch(P, t, B.w * ramp(t, c.luck_end, c.luck_end + 0.2)); }
  // the thought bubble: the robot, crossed out on "No robot?"
  const bk = popK(t, c.no3 - 0.12, c.luck + 0.1, 0.14, 0.12);
  if (bk > 0.01) {
    const P = toScreen(cam, Hh.head[0], Hh.head[1]);
    thoughtBubble(350, 640, 380, 290, bk, P[0] + 40, P[1] - 190);
    screenSpace(); ctx.save(); ctx.translate(350, 640); const q = E.outBack(clamp(bk), 1.6); ctx.scale(q, q); tkMiniRobot(0, 14, 1.55, t); ctx.restore();
    bigX(350, 640, 0.62, ramp(t, c.robot2_end - 0.05, c.robot2_end + 0.12));
  }
  return { glow: 0.85, flash: 0.06 * bumpAt(t, c.robot2_end, 9) };
};
// the last 0.4 s: the hook at negative time, so the cut to frame 1 is one move
SC.loop = (lt, t, shot) => {
  const tt = t - TL.duration, S = hookA(tt), cam = hookCam(tt);
  const Hh = roomDraw(t, { cam, A: S.A });
  if (Hh.P) { const p = Hh.hp(S.A.poke.tip), P = toScreen(cam, p[0], p[1]); scritch(P, t, S.w); }
  return { glow: 0.85 };
};

// ================================================================ the cover (src/cover.sh): him tickling his palm, TRY IT
SC.cover = (lt, t) => {
  const wg = tkWiggle(0.55, 0.9);
  const A = { face: lerpFace(TF.eager, TF.meh, 0.35), poke: { tip: [PALM_C[0] + wg[0], PALM_C[1] + wg[1]], k: 1, bend: 0.6 }, H: { view: 0, spread: { L: -0.05, R: -0.02, M: 0.02, I: 0.05 } }, headRot: 0.02 };
  const cam = { x: 636, y: 1000, zoom: 2.75, rot: 0 };
  const Hh = roomDraw(1.0, { cam, A });
  if (Hh.P) { const p = Hh.hp(A.poke.tip), P = toScreen(cam, p[0], p[1]); scritch(P, 0.4, 1); }
  bigWord('TRY IT', 540, 1330, 210, '#FFD447', 1, -0.04);
  return { glow: 0.85, noCaptions: true };
};

setLights({ hook: TV_LIGHT, brain: (lt, t) => (lt < 0.45 ? TV_LIGHT(lt, t) : ROOM_LIGHT), knob: ROOM_LIGHT, payoff: TV_LIGHT,
  lab: LAB_LIGHT, button: TV_LIGHT, loop: TV_LIGHT, cover: TV_LIGHT });

function initScenes2() {
  initRoom();
  initTkLab();
}
