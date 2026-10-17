// Why Do You Feel TWO Noses? (Cross Your Fingers) Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt =
// seconds inside the shot, t = seconds in the video) and returns post options for main.js:
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
// the bathroom in the morning: the window is on the left (the key), the room behind him is out of focus
const MORN_LIGHT = { ...flipLight(LIGHTS.day), pool: 0.44, halo: 0.1, dof: 0.9 };
// the brain's room: lit by its screen
const ROOM_LIGHT = { ...LIGHTS.screen, pool: 0.3, halo: 0, rim: [1.0, 0.55, 0.85] };

// ---------------------------------------------------------------- his faces
const MF = {
  // cross-eyed, down at his own nose: a test
  feel: { eyeOpen: 1.04, pupil: 0.95, lookX: 0, lookY: 0.95, browY: 0.7, browTilt: 0.35, mouth: 'o', mouthOpen: 0.12, blink: 0.04, cross: 1 },
  // ... wait. TWO?
  two: { eyeOpen: 1.32, pupil: 0.6, lookX: 0, lookY: 0.9, browY: 1.5, browTilt: 0.7, mouth: 'o', mouthOpen: 0.3, blink: 0, cross: 1 },
  // up at us: you try it
  us: { eyeOpen: 1.08, pupil: 0.95, lookX: 0, lookY: 0, browY: 1.1, browTilt: -0.3, mouth: 'flat', mouthOpen: 1.2, blink: 0.06, cross: 0 },
  // which one is which?
  puzzled: { eyeOpen: 1.12, pupil: 0.85, lookX: -0.6, lookY: 0.7, browY: 0.9, browTilt: 1.0, mouth: 'wavy', mouthOpen: 0.3, blink: 0, cross: 0 },
  puzzledR: { eyeOpen: 1.12, pupil: 0.85, lookX: 0.6, lookY: 0.7, browY: 0.9, browTilt: 1.0, mouth: 'wavy', mouthOpen: 0.3, blink: 0, cross: 0 },
  // up at his own forehead
  up: { eyeOpen: 1.15, pupil: 0.85, lookX: 0, lookY: -1, browY: 1.3, browTilt: 0.4, mouth: 'o', mouthOpen: 0.22, blink: 0, cross: 0 },
  // a month of this
  bored: { eyeOpen: 0.84, pupil: 1, lookX: 0.2, lookY: 0.1, browY: -0.2, browTilt: -0.3, mouth: 'flat', mouthOpen: -0.4, blink: 0.42, cross: 0 },
  annoyed: { eyeOpen: 1, pupil: 0.95, lookX: -0.5, lookY: -0.6, browY: -0.3, browTilt: -0.8, mouth: 'flat', mouthOpen: -0.5, blink: 0.35, cross: 0 },
  sleepy: { eyeOpen: 0.9, pupil: 1, lookX: 0, lookY: 0.3, browY: -0.4, browTilt: -0.1, mouth: 'flat', mouthOpen: 0.1, blink: 0.72, cross: 0 },
  grim: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: -0.6, browTilt: -1.1, mouth: 'flat', mouthOpen: -0.6, blink: 0.12, cross: 0 },
  // it worked
  joy: { eyeOpen: 1.2, pupil: 0.8, lookX: 0, lookY: 0.5, browY: 1.4, browTilt: 0.3, mouth: 'grin', mouthOpen: 0.7, blink: 0, cross: 1 },
  // deadpan, at us
  flat: { eyeOpen: 0.9, pupil: 1, lookX: 0, lookY: 0, browY: 0.1, browTilt: -0.4, mouth: 'flat', mouthOpen: -0.4, blink: 0.38, cross: 0 },
  // fingers crossed: hopeful
  hope: { eyeOpen: 1.1, pupil: 0.95, lookX: 0.35, lookY: -0.5, browY: 1.3, browTilt: 0.8, mouth: 'grin', mouthOpen: 0.5, blink: 0, cross: 0 },
};
const ELBOW = [128, -252];                                   // his right elbow (rig-local) while the hand is up at his face

// the rub: his fingers slide up and down his nose on a clock that goes round a whole number of times in the Short
const rubW = () => loopW(2 * Math.PI * (cu().rub_hz || 2.6));
const rubAt = (t, amp) => ({ dy: amp * Math.sin(rubW() * t), dx: 0.4 * amp * Math.sin(rubW() * t * 0.5 + 0.7) });

// ---------------------------------------------------------------- him at the mirror with his crossed hand
// A: mirHero's description, plus H (the hand: fingers.js) and elbow; the arm is put where the hand needs it
function xHero(cam, t, A) {
  const pal = A.pal || MIRPAL, H = A.H || {};
  const st0 = mirSt({ face: A.face, headDX: A.headDX, headDY: A.headDY, headRot: 0, bob: A.bob });
  const p = xHandPts(H);
  const wr = mirHeadLocal(st0, p.wrist[0], p.wrist[1]);
  const el = A.elbow || [ELBOW[0] + (H.dx || 0) * 0.35, ELBOW[1] + (A.bob || 0) + (H.dy || 0) * 0.3];
  const B = Object.assign({}, A, { headRot: 0, armR: { e: el, w: wr }, finger: null, nose: A.nose || { nostK: 0.72 } });
  B.post = (lc, rr, s2) => {
    // the forearm again in front of his head (the rig draws the head last), its cuff, then the hand in head units
    capsuleShaded(lc, rr.elR, rr.wrR, 40, pal.coat, pal.coatSh, pal.coatHi, pal);
    const d = rr.armDirR;
    line(lc, rr.wrR[0] - d[0] * 12, rr.wrR[1] - d[1] * 12, rr.wrR[0] - d[0] * 2, rr.wrR[1] - d[1] * 2, 46, pal.coatSh);
    mirInHead(lc, s2, (hc) => xHand(hc, pal, H, t));
    if (A.post) A.post(lc, rr, s2);
  };
  const out = mirHero(cam, t, B);
  out.hand = p;
  out.hp = (q) => mirHeadPt(out.st, q[0], q[1]);         // a head-unit point -> world
  return out;
}
function mirDraw(t, o) {
  mirRoom(o.cam, t, { night: o.night });
  if (o.under) { applyCam(o.cam); o.under(); }
  const Hh = xHero(o.cam, t, o.A);
  applyCam(o.cam);
  if (o.after) o.after(Hh);
  return Hh;
}

// ---------------------------------------------------------------- small graphics (screen space)
// a small filled tag
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
// a curved arrow from a to b, bowing by `bow` px (screen space): how the middle finger goes over
function curvedArrow(a, b, bow, k, col = '#FFD447') {
  if (k <= 0.01) return;
  screenSpace();
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
  const cx = mx - (dy / L) * bow, cy = my + (dx / L) * bow, u = clamp(k);
  const P = (s) => [(1 - s) * (1 - s) * a[0] + 2 * (1 - s) * s * cx + s * s * b[0], (1 - s) * (1 - s) * a[1] + 2 * (1 - s) * s * cy + s * s * b[1]];
  const pts = []; for (let i = 0; i <= 24; i++) pts.push(P(u * i / 24));
  const e = pts[pts.length - 1], e0 = pts[pts.length - 3], ang = Math.atan2(e[1] - e0[1], e[0] - e0[0]);
  for (const [cc, w, cl] of [[ctx, 20, '#0B0B1A'], [ctx, 11, col], [gctx, 22, rgba(col, 0.45)]]) {
    cc.beginPath(); pts.forEach((p, i) => (i ? cc.lineTo(p[0], p[1]) : cc.moveTo(p[0], p[1])));
    cc.lineWidth = w; cc.lineCap = 'round'; cc.lineJoin = 'round'; cc.strokeStyle = cl; cc.stroke();
    if (u > 0.6) {
      cc.save(); cc.translate(e[0], e[1]); cc.rotate(ang);
      const hs = w * 1.1;
      cc.beginPath(); cc.moveTo(hs * 1.3, 0); cc.lineTo(-hs * 0.8, -hs * 1.1); cc.lineTo(-hs * 0.8, hs * 1.1); cc.closePath(); cc.fillStyle = cl; cc.fill(); cc.restore();
    }
  }
}
// motion ticks round a point: the rub (screen space)
function rubTicks(x, y, s, t, k) {
  if (k <= 0.01) return;
  screenSpace();
  const ph = Math.sin(rubW() * t);
  for (const sd of [-1, 1]) for (let i = 0; i < 2; i++) {
    const xx = x + sd * (150 + i * 40) * s, yy = y + (ph * 26 - 30 + i * 52) * s;
    for (const [cc, w, cl] of [[ctx, 16, '#0B0B1A'], [ctx, 9, '#FFFFFF'], [gctx, 16, 'rgba(255,255,255,0.4)']]) line(cc, xx, yy, xx + sd * 46 * s, yy - 12 * s, w * k, cl);
  }
}
// a green tick in a disc
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
// two arrows chasing each other round a point: they swap
function swapArrows(x, y, r, k, rot) {
  if (k <= 0.01) return;
  screenSpace();
  for (const [cc, w, col] of [[ctx, 20, '#0B0B1A'], [ctx, 12, '#FFD447'], [gctx, 22, 'rgba(255,212,71,0.5)']]) {
    cc.save(); cc.translate(x, y); cc.rotate(rot); cc.scale(clamp(k, 0, 1.1), clamp(k, 0, 1.1));
    for (const a0 of [0, Math.PI]) {
      cc.beginPath(); cc.arc(0, 0, r, a0 + 0.35, a0 + Math.PI - 0.55); cc.lineWidth = w; cc.lineCap = 'round'; cc.strokeStyle = col; cc.stroke();
      const a1 = a0 + Math.PI - 0.55, hx = Math.cos(a1) * r, hy = Math.sin(a1) * r;
      cc.save(); cc.translate(hx, hy); cc.rotate(a1 + Math.PI / 2);
      cc.beginPath(); cc.moveTo(w * 1.5, 0); cc.lineTo(-w * 0.9, -w * 1.25); cc.lineTo(-w * 0.9, w * 1.25); cc.closePath(); cc.fillStyle = col; cc.fill(); cc.restore();
    }
    cc.restore();
  }
}
// a thought bubble with a dark edge (screen space); the tail goes to (tx, ty)
function thinkBubble(x, y, w, h, k, tx, ty) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 1.6), n = 14;
  screenSpace();
  for (const [grow, col] of [[9, '#10142E'], [0, '#F6F8FF']]) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; circle(ctx, Math.cos(a) * w * 0.44, Math.sin(a) * h * 0.42, Math.min(w, h) * 0.2 + grow, col); }
    ellipse(ctx, 0, 0, w * 0.47 + grow, h * 0.45 + grow, col);
    ctx.restore();
    for (let i = 0; i < 3; i++) { const f = 0.3 + i * 0.25; circle(ctx, lerp(x, tx, f), lerp(y + h * 0.4 * s, ty, f), (24 - i * 6) * s + grow, col); }
  }
  gctx.save(); gctx.translate(x, y); gctx.scale(s, s); ellipse(gctx, 0, 0, w * 0.56, h * 0.55, '#000000'); gctx.restore();   // no bloom through it
}
// his face in a round frame (screen space), any face, the crossed hand on his nose, the felt nose beside it
function faceDisc(x, y, r, t, face, k, H, felt) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 1.8);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  paint(() => {
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.clip();
    ctx.fillStyle = '#2A8A8E'; ctx.fillRect(-r, -r, 2 * r, 2 * r);
    const st = mirSt({ face }), q = r / 104;
    ctx.scale(q, q); ctx.translate(-MIR_HEAD[0], -MIR_HEAD[1] - 26);
    drawCharacterRig(ctx, st, t, MIRPAL);
    ctx.translate(st.x, st.y);
    mirInHead(ctx, st, (c) => { mirNose(c, MIRPAL, {}, t); if (H) xHand(c, MIRPAL, H, t); });
    ctx.restore();
    ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.lineWidth = 8; ctx.strokeStyle = '#BFF0FF'; ctx.stroke();
  });
  ctx.restore();
  void felt;
}

// ================================================================ the window on his forehead: the brain's room inside
const WIN = { y: -50, r: 27 };                                 // head units
const ROOM_F = [540, 1060];                                    // the room point at the middle of the window
// draw the room inside a round window at screen point P, radius R (screen px); s = the room's scale inside it
function roomWindow(P, R, s, t, o) {
  if (R < 1) return;
  screenSpace();
  // an opaque disc first, outside any clip: the light engine then knows this is a new thing in front of his head
  // (drawing inside a clip is left out of its shape map, and his head's shading showed through the window)
  ctx.beginPath(); ctx.arc(P[0], P[1], R, 0, 7); ctx.fillStyle = '#2B1440'; ctx.fill();
  ctx.save(); gctx.save();
  ctx.beginPath(); ctx.arc(P[0], P[1], R, 0, 7); ctx.clip();
  gctx.beginPath(); gctx.arc(P[0], P[1], R, 0, 7); gctx.clip();
  fmView({ s, x: P[0] - ROOM_F[0] * s, y: P[1] - ROOM_F[1] * s });
  roomDraw(t, o);
  ctx.restore(); gctx.restore();
  screenSpace();
  paint(() => { ctx.beginPath(); ctx.arc(P[0], P[1], R, 0, 7); ctx.lineWidth = Math.max(4, R * 0.05); ctx.strokeStyle = 'rgba(255,170,220,0.95)'; ctx.stroke(); });
}

// ================================================================ the brain's room (room space; call fmView first)
// o: {screen: fmScreen options, brain: erBrain options, zzz, bulb: [k, lit]}
function roomDraw(t, o = {}) {
  fmRoom(t);
  const E0 = fmScreen(t, o.screen || {});
  fmDesk(1440, t);
  actor(() => erBrain(ctx, FM.BX, FM.BY, FM.BS, t, o.brain || {}));
  if (o.zzz > 0.01) fmZzz(FM.BX + 120, FM.BY - 110, t, o.zzz);
  if (o.bulb && o.bulb[0] > 0.01) fmBulb(FM.BX + 236, FM.BY - 150, 1.35, o.bulb[0], o.bulb[1], t);   // beside its head: an idea
  return E0;
}

// ================================================================ the mirror: frame 1 and round it
// tt = seconds since frame 1 (negative = the last frames of the Short, on their way here)
function hookA(tt) {
  const c = cu();
  const arrive = ramp(tt, -0.4, -0.06, E.inOutCubic);                         // the crossed fingers come down onto his nose
  const amp = lerp(2.4, 4.2, ramp(tt, c.rub - 0.1, c.rub + 0.3)) * (1 - 0.6 * ramp(tt, c.your_f - 0.2, c.your_f + 0.2));
  const rb = rubAt(tt, amp * arrive);
  const two = ramp(tt, c.two1 - 0.04, c.two1 + 0.1);
  let face = lerpFace(MF.feel, MF.two, two);
  face = lerpFace(face, MF.feel, ramp(tt, c.cross1 - 0.1, c.cross1 + 0.2) * (1 - ramp(tt, c.gap_end, c.gap_end + 0.2)));
  face = lerpFace(face, MF.us, ramp(tt, c.gap_end - 0.05, c.gap_end + 0.18));
  face = lerpFace(face, MF.puzzled, ramp(tt, c.swapped - 0.05, c.swapped + 0.15));
  face = lerpFace(face, MF.puzzledR, ramp(tt, c.seats, c.seats + 0.25));
  face = lerpFace(face, MF.up, ramp(tt, c.nobody - 0.05, c.nobody + 0.2));
  face = { ...face, blink: Math.max(face.blink || 0, pulseOf(tt, [c.gap_end + 0.25], 0.12)) };
  const H = { cross: 1, dx: rb.dx, dy: rb.dy, lift: 1 - arrive };
  const A = {
    face, H,
    headDY: 1.1 * Math.sin(tt * 2.3) - 2.5 * bumpAt(tt, c.two1, 6), bob: 1.0 * Math.sin(tt * 2.3),
  };
  const felt = ramp(tt, c.two1 - 0.05, c.two1 + 0.16) * (1 - ramp(tt, c.your_f - 0.25, c.your_f));
  const win = ramp(tt, c.nobody - 0.02, c.nobody + 0.26, E.outBack);
  return { A, felt, win, rubAmp: amp * arrive };
}
function hookCam(tt) {
  const c = cu();
  const k = camKeys(tt, [[-0.4, 540, 1062, 4.3], [0, 540, 1062, 4.4], [0.35, 540, 1058, 4.9], [c.cross1 - 0.1, 540, 1058, 4.95], [c.fingers1 + 0.2, 548, 1080, 4.4],
    [c.gap - 0.2, 540, 1066, 4.75], [c.your_f, 540, 1070, 4.25], [c.seats_end, 540, 1068, 4.15], [c.nobody + 0.1, 540, 1020, 4.5], [c.brain1_end, 540, 1004, 5.2]], E.inOutCubic);
  if (tt >= 0 && tt < 0.35) { const u = E.outCubic(tt / 0.35); k.zoom = lerp(4.4, 4.9, u); k.y = lerp(1062, 1058, u); }   // the first push is quick off the mark
  return k;
}

// the badges: INDEX and MIDDLE, at their old seats, then swapped (screen space), with leaders to the fingertips
function seatBadges(t, Hh, cam) {
  const c = cu();
  const k = popK(t, c.your_f - 0.05, c.nobody - 0.05, 0.12, 0.15);
  if (k <= 0.01) return;
  const sw = ramp(t, c.swapped - 0.02, c.seats + 0.25, E.inOutCubic);
  const TI = toScreen(cam, ...Hh.hp(Hh.hand.tipI)), TM = toScreen(cam, ...Hh.hp(Hh.hand.tipM));
  const yL = 975, xA = 232, xB = 846;                         // the left and right seats: beside his face, clear of the captions
  const xI = lerp(xB, xA, sw), xM = lerp(xA, xB, sw), arc = Math.sin(Math.PI * sw) * 70;
  thinLeader([xI, yL - 34 + arc], [TI[0], TI[1] + 10], k, '#7FE9FF');
  thinLeader([xM, yL - 34 - arc], [TM[0], TM[1] + 10], k, '#C8A8FF');
  tagPill('INDEX', xI, yL + arc, '#7FE9FF', k, 42);
  tagPill('MIDDLE', xM, yL - arc, '#C8A8FF', k, 42);
}

// ================================================================ shots
SC.hook = (lt, t, shot) => {
  const c = cu(), S = hookA(t), cam = hookCam(t);
  const Hh = mirDraw(t, { cam, A: S.A, after: (H) => {
    // the felt nose, to the left of the index's tip
    const N = H.hp([-50, 20]);
    feltNose(N[0], N[1], 1.0, S.felt, t);
  } });
  // how the middle goes over the index
  const KM = toScreen(cam, ...Hh.hp([Hh.hand.kM[0] - 26, Hh.hand.kM[1] - 6])), TM = toScreen(cam, ...Hh.hp([Hh.hand.tipM[0] + 30, Hh.hand.tipM[1] + 22]));
  curvedArrow(KM, TM, -130, popK(t, c.cross1 - 0.05, c.rub, 0.3, 0.12));
  // the rub
  const NS = toScreen(cam, ...Hh.nose);
  rubTicks(NS[0], NS[1] + 10, cam.zoom / 4.5, t, popK(t, c.rub - 0.05, c.gap_end + 0.15, 0.1, 0.12));
  // TWO
  tagPill('TWO?!', 820, 640, '#FFD447', popK(t, c.two1 + 0.02, c.cross1 + 0.1, 0.1, 0.12), 58);
  seatBadges(t, Hh, cam);
  // the window on his forehead: the brain asleep at its desk, its screen showing the fingers side by side
  if (S.win > 0.01) {
    const P = toScreen(cam, ...Hh.hp([0, WIN.y])), R = WIN.r * cam.zoom * S.win;
    roomWindow(P, R, (2 * R) / 1040, t, { screen: { cross: 0, badges: 1 }, brain: { mood: 'calm', shut: 1, look: [0, 0.6] }, zzz: 1 });
  }
  return { glow: 0.85, flash: 0.08 * bumpAt(t, c.two1, 7) };
};

// the room shot: the dive through the window, then the brain at its screen
SC.room = (lt, t, shot) => {
  const c = cu(), DIVE = 0.62;
  const wake = ramp(t, c.thinks - 0.1, c.thinks + 0.1);
  const brain = {
    mood: t < c.thinks - 0.05 ? 'calm' : t < c.both1 - 0.1 ? 'grin' : t < c.always - 0.05 ? 'think' : 'grin', shut: 1 - wake,
    look: t < c.thinks ? [0, 0.6] : [-0.2, -1],
    armL: wake > 0 ? [lerp(-176, -238, wake), lerp(118, -150, E.outBack(wake))] : null,
    thumbR: t > c.always - 0.05,
    armR: t > c.always - 0.05 ? [200, lerp(118, -40, ramp(t, c.always - 0.05, c.always + 0.2, E.outBack))] : null,
  };
  const scr = {
    cross: 0, badges: 1,
    edges: ramp(t, c.outside - 0.05, c.edges1 + 0.25),
    balls: ramp(t, c.touched - 0.05, c.once + 0.05),
    count: ramp(t, c.two2 - 0.05, c.two2 + 0.2), countTxt: '2 THINGS',
    flash: bumpAt(t, c.once, 6),
  };
  const ro = { screen: scr, brain, zzz: 1 - wake };
  if (lt < DIVE) {
    // the dive: his face from the end of the hook, the camera pushes into the window on his forehead
    const u = lt / DIVE, S = hookA(t), cam0 = hookCam(t);
    const FH = mirHeadPt(mirSt({ face: S.A.face, headDX: S.A.headDX, headDY: S.A.headDY, bob: S.A.bob }), 0, WIN.y);
    const k = 1 + 7 * E.inCubic(u);
    const cam = scaledCam(cam0, FH, k);
    mirDraw(t, { cam, A: S.A });
    const P0 = toScreen(cam, FH[0], FH[1]);
    const R = WIN.r * cam.zoom;
    const s = lerp((2 * WIN.r * cam0.zoom) / 1040 * k, 1, E.inOutCubic(u));
    const P = [lerp(P0[0], ROOM_F[0], E.inOutCubic(u)), lerp(P0[1], ROOM_F[1], E.inOutCubic(u))];
    roomWindow(P, Math.max(R, 30), s, t, ro);
    return { glow: 0.85, zblur: 0.25 * E.inCubic(u), zcx: P[0], zcy: P[1], capY: lerp(1330, 1560, ramp(u, 0.6, 1)) };
  }
  const D = shot.end - shot.start;
  // the view: the whole room, then in to the screen for the edges and the marbles
  const pz = ramp(t, c.both1 - 0.2, c.touched, E.inOutCubic), pin = ramp(lt, DIVE, DIVE + 0.5, E.inOutCubic);
  const z = lerp(lerp(1, 1.12, pin) + 0.03 * (lt - DIVE) / D, 1.3, pz), F = [540, lerp(lerp(1060, 990, pin), 860, pz)];
  fmView({ s: z, x: 540 - F[0] * z, y: lerp(lerp(1060, 1000, pin), 900, pz) - F[1] * z });
  roomDraw(t, ro);
  // him, still rubbing, in a round window
  const hk = ramp(lt, DIVE + 0.1, DIVE + 0.4);                 // him still rubbing: the viewer's test stays in sight
  const rb = rubAt(t, 3.6);
  faceDisc(206, 1210, 128, t, MF.feel, hk, { cross: 1, dx: rb.dx, dy: rb.dy }, 0);
  return { glow: 0.85, flash: 0.22 * (1 - clamp((lt - DIVE) / 0.2)), capY: 1560 };
};

// ================================================================ back on his hand: crossed, both edges on ONE nose
SC.macro = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0;
  const cr = ramp(t, c.cross2 - 0.05, c.them + 0.25, E.inOutCubic);
  const on = ramp(t, c.both2 - 0.1, c.touch + 0.1, E.inOutCubic);
  const rb = rubAt(t, 2.2 * on);
  const H = { cross: cr, dx: lerp(30, 0, on) + rb.dx, dy: lerp(22, 0, on) + rb.dy, edges: ramp(lt, 0.0, 0.25) };
  const two = ramp(t, c.two3 - 0.05, c.two3 + 0.12);
  let face = lerpFace(MF.feel, MF.two, two);
  face = { ...face, blink: Math.max(face.blink || 0, pulseOf(t, [c.so - 0.1], 0.1)) };
  const A = { face, H, headDY: 1.0 * Math.sin(t * 2.3) - 2 * bumpAt(t, c.two3, 6), bob: Math.sin(t * 2.3), nose: { nostK: 0.72 } };
  const cam = camKeys(lt, [[0, 560, 1080, 7.2], [c.touch - T0, 548, 1066, 8.0], [c.nose2_end - T0, 545, 1062, 8.3], [c.so - T0, 548, 1046, 6.4], [D, 548, 1046, 6.2]]);
  let Hh = null;
  mirDraw(t, { cam, A, after: (Hx) => {
    Hh = Hx;
    const N = Hx.hp([-50, 20]);
    feltNose(N[0], N[1], 1.0, ramp(t, c.two3 - 0.04, c.two3 + 0.14), t);
  } });
  // ONE nose
  const NS = toScreen(cam, ...Hh.nose);
  tagPill('ONE NOSE', 690, NS[1] + 190, '#4DFFB4', popK(t, c.one - 0.04, c.so - 0.1, 0.1, 0.12), 48);
  // the name worth having, as a label
  tagPill("ARISTOTLE'S ILLUSION", 540, 515, '#C8A8FF', popK(t, c.edges2 - 0.1, c.counts - 0.15, 0.12, 0.12), 40);
  tagPill('~350 BC', 540, 598, '#FFFFFF', popK(t, c.touch - 0.05, c.counts - 0.15, 0.12, 0.12), 32);
  // what the brain makes of it: a nose against each outside edge
  const bk = ramp(t, c.so - 0.08, c.so + 0.2);
  if (bk > 0.01) {
    thinkBubble(540, 600, 640, 470, bk, 470, 880);
    screenSpace();
    const q = 0.64 * E.outBack(clamp(bk), 1.6);
    paint(() => twoNoseFace(540, 618, 1.95 * q / 0.64, t, ramp(t, c.counts - 0.05, c.two3 + 0.1)));
    tagPill('2 NOSES', 540, 830, '#FF5A6E', popK(t, c.two3 - 0.02, shot.end + 1, 0.1, 0.1), 46, '#FFFFFF');
  }
  return { glow: 0.85, flash: 0.22 * (1 - ramp(lt, 0, 0.12)) + 0.1 * bumpAt(t, c.two3, 8) };
};
// what the brain makes of it: his own face with a nose on each side (screen space, centred on x, y; s = head scale).
// k 0..1 splits the one nose into two
function twoNoseFace(x, y, s, t, k) {
  const st = mirSt({ face: { ...MF.two, cross: 0, lookX: 0, lookY: 0.2, mouth: 'o', mouthOpen: 0.35 } });
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.translate(-MIR_HEAD[0], -MIR_HEAD[1] - 10);
  ctx.save(); ctx.beginPath(); ctx.rect(MIR_HEAD[0] - 120, MIR_HEAD[1] - 110, 240, 200); ctx.clip();
  drawCharacterRig(ctx, st, t, MIRPAL);
  ctx.translate(st.x, st.y);
  const d = 21 * E.outBack(clamp(k), 1.8);
  mirInHead(ctx, st, (c) => { for (const sd of (k > 0.02 ? [-1, 1] : [0])) { c.save(); c.translate(sd * d, 0); mirNose(c, MIRPAL, { nostK: 0.8 }, t); c.restore(); } });
  ctx.restore();
  ctx.restore();
}
// the screen's drawing on its own (for the bubble): the fingers side by side with a nose against each outside edge
function fmScreenMini(t, o) {
  const H0 = FMH, c = ctx;
  const bM = [H0.cx - H0.gap / 2, H0.base], bI = [H0.cx + H0.gap / 2, H0.base], tM = [bM[0], H0.base - H0.len], tI = [bI[0], H0.base - H0.len];
  rrect(c, H0.cx - 150, H0.base - 40, 300, 150, 60); c.fillStyle = '#F2B48C'; c.fill(); c.lineWidth = 6; c.strokeStyle = '#8A4A3A'; c.stroke();
  for (const x of [H0.cx - 150 + 8, H0.cx + 150 - 50]) { rrect(c, x, H0.base - 10, 42, 70, 21); c.fillStyle = '#E8A57E'; c.fill(); }
  const eI = fmFinger(c, bI, tI, H0.w, '#F2B48C', 1, o.edges || 0, t), eM = fmFinger(c, bM, tM, H0.w, '#F6BE98', -1, o.edges || 0, t);
  const nk = o.noses || 0;
  if (nk > 0.01) for (const [e, sd] of [[eM, -1], [eI, 1]]) { const s = 2.7 * E.outBack(clamp(nk), 1.8); fmNose(c, e[0] + sd * 15 * s, e[1] + 10, s); }
}

// ================================================================ six months
// a tear-off calendar on the tiles (world units under the camera): month m (1..6), a page tearing off at tear 0..1
function wallCal(x, y, s, m, tear) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  actor(() => { rrect(ctx, -46, -64, 92, 128, 8); ctx.fillStyle = '#F7F3EA'; ctx.fill(); });
  paint(() => {
    rrect(ctx, -46, -64, 92, 30, 8); ctx.fillStyle = '#E2463C'; ctx.fill();
    for (const xx of [-22, 22]) circle(ctx, xx, -64, 5, '#3A2A2A');
    ctx.font = '900 15px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFFFFF'; ctx.fillText('MONTH', 0, -48);
    ctx.font = '900 66px Anton, Montserrat'; ctx.fillStyle = '#2A2440'; ctx.fillText(String(m), 0, 6);
    if (tear > 0.01 && tear < 1) {   // the page before, curling off and falling
      ctx.save(); ctx.translate(30 * tear, 40 * tear * tear); ctx.rotate(0.9 * tear);
      rrect(ctx, -46, -34, 92, 98, 6); ctx.fillStyle = '#FFFDF6'; ctx.fill();
      ctx.font = '900 66px Anton, Montserrat'; ctx.fillStyle = 'rgba(42,36,64,0.85)'; ctx.fillText(String(Math.max(1, m - 1)), 0, 6);
      ctx.restore();
    }
  });
  ctx.restore();
}
SC.months = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0;
  // the months tear off between "kept" and "MONTHS"
  const flips = [c.kept, c.two4 + 0.1, c.crossed1, c.upto, c.six];
  let m = 1; for (const f of flips) if (t >= f) m++;
  const lastF = flips.filter((f) => t >= f).pop(), tear = lastF === undefined ? 0 : clamp((t - lastF) / 0.35);
  const night = m % 2 === 0 && t < c.until;
  const faces = [MF.bored, MF.annoyed, MF.sleepy, MF.grim, MF.bored, MF.grim];
  let face = faces[Math.min(5, m - 1)];
  const caught = ramp(t, c.caught - 0.05, c.caught + 0.25);
  face = lerpFace(face, MF.up, ramp(t, c.until - 0.1, c.until + 0.15) * (1 - caught));
  face = lerpFace(face, MF.joy, ramp(t, c.on_end - 0.05, c.on_end + 0.25));
  // the hand: up beside his face, taped; at the end it goes to his nose
  const toNose = ramp(t, c.on_end - 0.1, c.on_end + 0.3, E.inOutCubic);
  const rb = rubAt(t, 2.6 * toNose);
  const H = { cross: 1, tape: 1, dx: lerp(64, 0, toNose) + rb.dx, dy: lerp(8, 0, toNose) + rb.dy };
  const A = { face, H, headDY: Math.sin(t * 2.3), bob: Math.sin(t * 2.3), nose: { nostK: 0.5 } };
  const cam = camKeys(lt, [[0, 520, 1040, 3.3], [c.until - T0 - 0.2, 526, 1036, 3.35], [c.brains - T0, 540, 1002, 4.25], [c.on_end - T0 + 0.1, 540, 1008, 4.2], [D, 540, 1040, 4.1]]);
  mirDraw(t, { cam, A, night, under: () => { applyCam(mirBgCam(cam)); wallCal(190, 1000, 1.6, m, tear); } });
  // MONTH tag
  tagPill(m >= 6 ? 'SIX MONTHS' : `MONTH ${m}`, 540, 520, m >= 6 ? '#FFD447' : '#FFFFFF', popK(t, c.kept - 0.08, c.until - 0.1, 0.12, 0.12), m >= 6 ? 56 : 46);
  // the brain catches on: a window on his forehead, its screen's drawing crosses, the light comes on
  const win = popK(t, c.until - 0.05, c.on_end + 0.35, 0.28, 0.2);
  if (win > 0.01) {
    const st = mirSt({ face, headDY: A.headDY, bob: A.bob }), FH = mirHeadPt(st, 0, WIN.y - 16);
    const P = toScreen(cam, FH[0], FH[1]), R = (WIN.r + 21) * cam.zoom * E.outBack(clamp(win), 1.6);
    roomWindow(P, R, (2 * R) / 980, t, { screen: { cross: ramp(t, c.brains - 0.05, c.caught + 0.1), badges: 1 }, brain: { mood: t > c.caught ? 'wow' : 'think', look: [0, -1] }, bulb: [ramp(t, c.caught - 0.05, c.caught + 0.15), ramp(t, c.caught, c.caught + 0.12)] });
  }
  const NS = toScreen(cam, ...mirHeadPt(mirSt({ face, headDY: A.headDY, bob: A.bob }), 0, 22));
  okTick(NS[0] + 190, NS[1] - 40, 52, ramp(t, c.on_end + 0.15, c.on_end + 0.35));
  tagPill('ONE NOSE', NS[0] + 190, NS[1] + 60, '#4DFFB4', ramp(t, c.on_end + 0.2, c.on_end + 0.4), 38);
  return { glow: 0.85, flash: 0.22 * (1 - ramp(lt, 0, 0.12)) + 0.12 * pulseOf(t, flips, 0.06) };
};

// ================================================================ the button: still two? keep your fingers crossed
SC.button = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0, E0 = hookA(-0.4);
  const lift = ramp(t, c.keep - 0.12, c.fingers3 + 0.15, E.inOutCubic);             // the crossed fingers go up, for luck
  const amp = 3.4 * (1 - lift);
  const rb = rubAt(t, amp);
  let face = lerpFace(MF.feel, MF.flat, ramp(t, c.still - 0.05, c.still + 0.18));
  face = lerpFace(face, MF.hope, ramp(t, c.keep - 0.1, c.keep + 0.2));
  face = lerpFace(face, E0.A.face, ramp(t, shot.end - 0.3, shot.end - 0.02));
  const H = { cross: 1, dx: rb.dx, dy: rb.dy, lift };
  const A = { face, H, headDY: 1.1 * Math.sin(t * 2.3), bob: Math.sin(t * 2.3) };
  const cam = camKeys(lt, [[0, 540, 1060, 4.6], [c.keep - T0, 540, 1050, 4.25], [D, 540, 1062, 4.3]]);
  mirDraw(t, { cam, A, after: (H2) => {
    const N = H2.hp([-50, 20]);
    feltNose(N[0], N[1], 1.0, popK(t, c.two5 - 0.04, c.keep, 0.12, 0.15), t);
  } });
  return { glow: 0.85, flash: 0.22 * (1 - ramp(lt, 0, 0.12)) };
};

SC.loop = (lt, t, shot) => {
  const tt = t - TLd.duration, S = hookA(tt), cam = hookCam(tt);
  mirDraw(t, { cam, A: S.A });
  return { glow: 0.85 };
};

// ================================================================ the cover (rendered by src/cover.sh from a one-shot timeline)
SC.cover = (lt, t) => {
  const cam = { x: 540, y: 1068, zoom: 4.15, rot: 0 };
  const A = { face: MF.two, H: { cross: 1 }, headDY: -1 };
  mirDraw(0.4, { cam, A, after: (H) => { const N = H.hp([-50, 20]); feltNose(N[0], N[1], 1.0, 1, 0.4); } });
  screenSpace();
  bigWord('TWO', 540, 560, 230, '#FFD447', 1, -0.04);
  bigWord('NOSES?', 540, 1380, 190, '#FFFFFF', 1, -0.03);
  return { glow: 0.85, noCaptions: true };
};

setLights({ hook: MORN_LIGHT, loop: MORN_LIGHT, cover: MORN_LIGHT, room: (lt, t) => (lt < 0.62 ? MORN_LIGHT : ROOM_LIGHT), macro: MORN_LIGHT, months: MORN_LIGHT, button: MORN_LIGHT });

function initScenes2() {
  initMirror();
}
