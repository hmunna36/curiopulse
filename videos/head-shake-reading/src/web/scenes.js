// Why Can You Read While Shaking Your HEAD? Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds
// inside the shot, t = seconds in the video) and returns post options for main.js.
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
// World files: bed.js (blind-spot's bedroom, seen from his phone), shake.js (the turned head, the ear's driver, the
// cords, the labels), ward.js (1948).
'use strict';

const cu = () => TLd.cues;
E.linear = E.linear || ((x) => x);
E.inBack = E.inBack || ((x, s = 1.7) => (s + 1) * x * x * x - s * x * x);
// the strongest of a list of pulses at time t: each is on for `len` seconds, with soft edges
const pulseOf = (t, times, len = 0.16) => times.reduce((m, f) => Math.max(m, clamp((t - f) / 0.03) * clamp((f + len - t) / 0.05)), 0);
// a decaying bump after a moment
const bumpAt = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);
function faceSeq(t, seq) {
  let f = seq[0][1];
  for (let i = 1; i < seq.length; i++) {
    const [t1, g] = seq[i];
    if (t >= t1 + 0.12) f = g;
    else if (t > t1) f = lerpFace(f, g, (t - t1) / 0.12);
  }
  return f;
}
// a small filled tag (screen space)
function tagPill(txt, x, y, col, k, size = 40, ink = '#0B0B1A') {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + size * 0.9, h = size * 1.5;
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = col; ctx.fill();
  paint(() => { ctx.fillStyle = ink; ctx.fillText(txt, 0, 2); });
  ctx.restore();
}

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// his bedroom at midnight: the phone's cool light from the front and above (the key), the bedside lamp low on the left
// behind him (a warm rim); inside his ear soft and pink; 1948 lit by the tall window on the left
const BED_LIGHT = { ...LIGHTS.night, key: [-0.28, -0.62, 0.73], keyTint: [0.94, 1.0, 1.10], rimFrom: [-0.9, 0.2], rim: [1.0, 0.70, 0.42], rimAmt: 1.1, pool: 0.5, halo: 0.1, haloColor: [0.62, 0.74, 1.0], dof: 0.6 };
const EAR_LIGHT = { ...LIGHTS.inside, pool: 0.22, halo: 0 };
const WARD_LIGHT = { ...flipLight(LIGHTS.day), pool: 0.32, halo: 0.05 };
setLights({ hook: BED_LIGHT, ears: BED_LIGHT, again: BED_LIGHT, payoff: BED_LIGHT, button: BED_LIGHT, cover: BED_LIGHT, speed: EAR_LIGHT, weird: WARD_LIGHT });

// ---------------------------------------------------------------- his faces
const HF = {
  strain: { eyeOpen: 0.86, pupil: 1, lookX: 0, lookY: 0, browY: 0.15, browTilt: 1.0, mouth: 'wavy', mouthOpen: 0.3, blink: 0, cross: 0, squint: 0.4 },
  calm: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 0.3, browTilt: 0.1, mouth: 'flat', mouthOpen: 0.35, blink: 0, cross: 0, squint: 0 },
  smug: { eyeOpen: 0.94, pupil: 1, lookX: 0, lookY: 0, browY: 0.5, browTilt: -0.25, mouth: 'smirk', mouthOpen: 0.3, blink: 0, cross: 0, squint: 0.1 },
  wow: { eyeOpen: 1.22, pupil: 1, lookX: 0, lookY: 0, browY: 1.2, browTilt: 0.3, mouth: 'o', mouthOpen: 0.4, blink: 0, cross: 0, squint: 0 },
  dizzy: { eyeOpen: 1.12, pupil: 1, lookX: 0, lookY: 0, browY: 0.9, browTilt: 0.9, mouth: 'wavy', mouthOpen: 0.4, blink: 0, cross: 0, squint: 0 },
  deadpan: { eyeOpen: 0.8, pupil: 1, lookX: 0, lookY: 0, browY: -0.1, browTilt: -0.1, mouth: 'flat', mouthOpen: 0.05, blink: 0, cross: 0, squint: 0.15 },
  grin: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 0.6, browTilt: -0.1, mouth: 'grin', mouthOpen: 0.6, blink: 0, cross: 0, squint: 0.1 },
};

// ================================================================ the bedroom, seen from his phone
const HS_FR = { x: 540, y: 1077, zoom: 3.4 };      // the hook and the button: his face, close
const HS_FE = { x: 512, y: 1060, zoom: 2.9 };      // room for the window on his ear
const HS_FA = { x: 490, y: 1050, zoom: 3.15 };     // again: the arrows round his head
const WINO = [-112, -42];                          // the window's middle from his head's middle (world units)
const WIN_R = 60;
// the phone swinging in his hand: its angle as seen from his head (rad), the frame's slide (px) and its speed (px/s)
// (its rhythm comes from the timeline, so audio.py puts a whoosh on each swing: cues ph_f, ph_ph0)
const PH = { amp: 0.11, px: 56, blur: 0.022 };
function phoneSwing(t, t0, t1, rin = 0.4, rout = 0.12) {
  const env = E.inOutSine(clamp((t - t0) / rin)) * clamp((t1 - t) / rout);
  const w = 2 * Math.PI * cu().ph_f, ph = w * t + cu().ph_ph0;
  return { a: PH.amp * env * Math.sin(ph), x: PH.px * env * Math.sin(ph), v: PH.px * env * w * Math.cos(ph), env };
}
// the head shaking "no", eased in from t0
function yawShake(t, t0, amp = 0.4, f = cu().yaw_f) {
  if (t < t0) return 0;
  return amp * E.inOutSine(clamp((t - t0) / 0.3)) * Math.sin(2 * Math.PI * f * (t - t0));
}
function camMix(a, b, k) { return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), zoom: lerp(a.zoom, b.zoom, k), rot: 0 }; }

// the hook's state as a function of tt = seconds since frame 1 (negative = the last frames of the Short, on their way
// back here): the phone swings from tt = -0.5, stops on "Now", and he gently shakes his head from "gently"
function hookState(tt) {
  const c = cu();
  const ph = phoneSwing(tt, -0.5, c.now + 0.02);
  // his eyes chase the phone a beat late (and too little): the frame is the phone, so off-centre pupils = not on us
  const lagA = phoneSwing(tt - 0.12, -0.5, c.now + 0.02).a;
  let yaw = yawShake(tt, c.yaw_t0);
  const face = tt < 0 ? lerpFace(HF.smug, HF.strain, ramp(tt, -0.5, -0.1)) : faceSeq(tt, [[-1, HF.strain], [c.now - 0.05, HF.calm], [c.head1 - 0.1, HF.smug]]);
  // the pupils swing a beat behind the frame (a cartoon of the chase: the lagged swing, scaled up so it reads)
  const gaze = ph.env > 0.02 ? [0.4 * lagA / PH.amp + yaw, 0.02] : [0, 0];
  const smear = ph.env > 0.02 ? { k: clamp(Math.abs(ph.v) / 1600), dx: -Math.sign(ph.v) * 12 } : null;
  return { yaw, gaze, face, ph, smear };
}
// the whole bedroom frame. o: {cam, yaw, pitch, gaze, face, smear, cross, win (0..1), driver ({mood, wheel...}),
// cords (0..1), taut, arrows ({head, eyes} 0..1), zzz}
// his right arm (screen left) reaches out to the phone: we ARE the phone, so his hand stays at one point just past the
// frame's bottom-left corner whatever the camera does, and the arm swings when the phone does
const PHONE_HAND = [-70, 2010];
function phoneArm(cam) {
  const wx = cam.x + (PHONE_HAND[0] - W / 2 - (cam.sx || 0)) / cam.zoom, wy = cam.y + (PHONE_HAND[1] - H / 2 - (cam.sy || 0)) / cam.zoom;
  const w = [(wx - BD.hx) / BD.hs, (wy - BD.hy) / BD.hs], sh = [-74, -370];
  return { e: [lerp(sh[0], w[0], 0.48) - 40, lerp(sh[1], w[1], 0.48) + 4], w };
}
function bedFrame(t, o) {
  const cam = o.cam;
  bdRoom(cam, t);
  applyCam(cam);
  const S = {
    armR: BD_ARM.duvet, armL: phoneArm(cam), palm: 0, face: o.face, bob: 1.2 * Math.sin(t * loopW(2.3)), lean: 0,
    headDX: o.headDX || 0, headDY: o.headDY || 0, headRot: o.headRot || 0,
    turn: { yaw: o.yaw || 0, pitch: o.pitch || 0, gaze: o.gaze || [0, 0], smear: o.smear, cross: o.cross || 0 },
  };
  const Hh = bdHero(cam, t, S);
  applyCam(cam);
  bdDuvet(t);
  // the phone arm again, in front of the duvet (drawn on the main canvas after it: a sleeve coming at us)
  const wp = (p) => [Hh.st.x + p[0] * Hh.st.s, Hh.st.y + p[1] * Hh.st.s];
  const shW = wp(Hh.r.shL), elW = wp(Hh.r.elL), wrW = wp(Hh.r.wrL);
  line(ctx, lerp(shW[0], elW[0], 0.55), lerp(shW[1], elW[1], 0.55), elW[0], elW[1], 40, BDPAL.coat);
  line(ctx, elW[0], elW[1], wrW[0], wrW[1], 40, BDPAL.coat);
  const head = bdHeadPt(Hh.st, 0, 0), P = [head[0] - (o.headDX || 0) + WINO[0], head[1] + WINO[1]];
  let wheelPts = null;
  if ((o.win || 0) > 0.01) {
    applyCam(cam);
    // a short stem from the window to his ear (the near side of his head)
    const ear = hsEarPt(Hh.st, -1);
    paint(() => { const k = clamp(o.win); line(ctx, P[0] + 30, P[1] + 34, lerp(P[0] + 30, ear[0], k), lerp(P[1] + 34, ear[1], k), 5, '#FFE9D2'); });
    const D = o.driver || {}, ds = 0.53, dx = P[0], dy = P[1] - 7;
    hsWindow(P, WIN_R, o.win, () => {
      hsDriver(ctx, dx, dy, ds, D, t);
      if (D.mood === 'doze') zzz(dx + 4, dy - 30, t, (o.zzz0 || 0), 1, 0.12);
    });
    wheelPts = hsWheelPts(dx, dy, ds, D.wheel || 0);
  }
  if ((o.cords || 0) > 0.01 && wheelPts) {
    applyCam(cam);
    const eyes = hsEyePts(Hh.st);
    const tau = o.taut === undefined ? 1 : o.taut, brow = bdHeadPt(Hh.st, -6, -62);
    hsCord(wheelPts[0], eyes[0], o.cords, tau, t, '#FFB347', 3.2);
    hsCord(wheelPts[1], eyes[1], o.cords, tau, t, '#FFB347', 3.2, brow);
    if (o.pulse > 0.01) {   // a spark that runs along each cord to the eye (the order going out)
      for (let i = 0; i < 2; i++) { const a = wheelPts[i], b = eyes[i], u = clamp(o.pulse); softDot(gctx, lerp(a[0], b[0], u), lerp(a[1], b[1], u), 14, '#FFE08A', 0.9); circle(ctx, lerp(a[0], b[0], u), lerp(a[1], b[1], u), 5, '#FFF4C8'); }
    }
  }
  return { Hh, P, head };
}

// ---------------------------------------------------------------- hook: shake the phone, then shake your head
SC.hook = (lt, t, shot) => {
  const c = cu(), H = hookState(t);
  const push = ramp(t, 0, shot.end, E.inOutSine);
  const cam = { ...HS_FR, zoom: HS_FR.zoom + 0.08 * push, sx: H.ph.x, sy: 0.18 * H.ph.x * Math.sin(t * 9) };
  bedFrame(t, { cam, yaw: H.yaw, gaze: H.gaze, face: H.face, smear: H.smear });
  // SHARP? no: the tag lands on "HEAD" as his head shakes and his eyes stay put
  return { glow: 0.85, blur: [H.ph.v * PH.blur, 0] };
};
// the hook at negative time (the loop's last frames)
function loopTail(t, D) {
  const tt = t - D, H = hookState(tt);
  const cam = { ...HS_FR, sx: H.ph.x, sy: 0.18 * H.ph.x * Math.sin(tt * 9) };
  return { cam, H };
}

// ---------------------------------------------------------------- ears: the answer, the window on his ear
function earsState(t) {
  const c = cu();
  const yaw = yawShake(t, c.yaw_t0);
  const face = faceSeq(t, [[-1, HF.smug], [c.ears - 0.1, HF.calm], [c.eyes1 - 0.1, HF.smug]]);
  const win = ramp(t, c.ears - 0.06, c.ears + 0.32);
  const cords = ramp(t, c.steering - 0.05, c.steering + 0.45, E.outCubic);
  return { yaw, face, win, cords, driver: { mood: 'drive', wheel: -1.9 * yaw, look: -0.6 * Math.sign(yaw) } };
}
SC.ears = (lt, t, shot) => {
  const c = cu(), S = earsState(t);
  const k = ramp(t, c.sharp, c.ears - 0.15, E.inOutCubic);
  const cam = camMix({ ...HS_FR, zoom: HS_FR.zoom + 0.08 }, HS_FE, k);
  const B = bedFrame(t, { cam, yaw: S.yaw, gaze: [0, 0], face: S.face, win: S.win, driver: S.driver, cords: S.cords, taut: 1 });
  // labels: SHARP pops on "Sharp", INNER EAR under the window
  tagPill('SHARP!', 760, 560, '#4DFFB4', popK(t, c.sharp - 0.02, c.ears - 0.25, 0.08, 0.12), 46);
  const wp = toScreen(cam, B.P[0], B.P[1]);
  tagPill('INNER EAR', wp[0], wp[1] + WIN_R * cam.zoom + 52, '#FFB347', ramp(t, c.ears + 0.2, c.ears + 0.45), 34);
  return { glow: 0.85 };
};

// ---------------------------------------------------------------- again: HEAD goes right, the ear rolls your EYES left
function againState(t) {
  const c = cu();
  const shake = yawShake(t, c.yaw_t0);
  // on "Head goes right" he turns to the right and holds it while the line plays out, then shakes again
  const hold = ramp(t, c.head2 - 0.05, c.right2_end, E.inOutCubic) * (1 - ramp(t, c.left_end + 0.05, c.left_end + 0.3, E.inOutSine));
  const yaw = lerp(shake, 0.5, hold);
  const face = faceSeq(t, [[-1, HF.smug], [c.head2 - 0.05, HF.calm], [c.left - 0.08, HF.wow], [c.left_end + 0.1, HF.smug]]);
  return { yaw, face, hold };
}
SC.again = (lt, t, shot) => {
  const c = cu(), S = againState(t);
  let cam = camMix(HS_FE, HS_FA, ramp(t, c.keep - 0.1, c.head2, E.inOutCubic));
  // the dive into the window at the end of the shot
  const dive = ramp(t, shot.end - 0.3, shot.end, E.inCubic);
  const P = [540 + WINO[0], 1030 + WINO[1]];
  if (dive > 0) cam = scaledCam(cam, P, 1 + 2.4 * dive);
  const pulse = clamp((t - c.rolls) / 0.5);
  bedFrame(t, {
    cam, yaw: S.yaw, gaze: [0, 0], face: S.face, win: 1, cords: 1, taut: 1, pulse: t > c.rolls && t < c.rolls + 0.5 ? pulse : 0,
    driver: { mood: 'drive', wheel: -1.9 * S.yaw, look: -0.6 * Math.sign(S.yaw), sweat: 0 },
  });
  // the arrows round his head: HEAD over the top to the right, EYES under the chin to the left
  const hp = toScreen(cam, 540, 1030);
  const R = 270 * cam.zoom / HS_FA.zoom;
  hsArrow(hp[0], hp[1], R, -2.25, -0.95, ramp(t, c.head2 - 0.05, c.right2_end), '#FFD447', 'HEAD', 46);
  hsArrow(hp[0], hp[1], R, 0.95, 2.25, ramp(t, c.eyes2 - 0.15, c.left + 0.1), '#7FE9FF', 'EYES', 46);
  return { glow: 0.85, zblur: 0.3 * dive, zcx: toScreen(cam, P[0], P[1])[0], zcy: toScreen(cam, P[0], P[1])[1], flash: 0.25 * ramp(t, shot.end - 0.06, shot.end) };
};

// ---------------------------------------------------------------- speed: inside, the driver yanks the wheel, 0.01 s
SC.speed = (lt, t, shot) => {
  const c = cu();
  // his ear, inside: a warm pink room with soft lumps
  screenSpace();
  const g = ctx.createRadialGradient(540, 980, 80, 540, 980, 1200);
  g.addColorStop(0, '#9A3A66'); g.addColorStop(0.6, '#5A1E44'); g.addColorStop(1, '#2A0C22');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const rng = mulberry32(7);
  for (let i = 0; i < 14; i++) { const x = rng() * W, y = rng() * H, r = 60 + rng() * 140; ellipse(ctx, x + 14 * Math.sin(t * 1.3 + i), y, r, r * 0.7, 'rgba(255,140,190,0.07)'); }
  motes(t, 0.4);
  // the wheel goes back and forth fast (his head is still shaking); the push in
  const wf = 2.4, wheel = 0.9 * Math.sin(2 * Math.PI * wf * lt), wv = Math.cos(2 * Math.PI * wf * lt);
  const zoomIn = 1 + 0.06 * ramp(lt, 0, shot.end - shot.start, E.inOutSine);
  const DX = 540, DY = 1130, DS = 3.0 * zoomIn;
  // the two eyes at the top, on their cords, rolled the other way from the wheel
  const eyes = [[350, 735], [730, 735]];
  for (const [ex, ey] of eyes) {
    circle(ctx, ex, ey, 86, '#2A0C22'); circle(ctx, ex, ey, 80, '#FFFFFF');
    paint(() => {
      const px = ex - 34 * Math.sin(wheel) * 1.1;
      circle(ctx, px, ey + 6, 36, HS_IRIS_DK); circle(ctx, px, ey + 6, 31, HS_IRIS); circle(ctx, px, ey + 6, 17, '#120A0C'); circle(ctx, px - 10, ey - 6, 8, '#FFFFFF');
      ctx.beginPath(); ctx.arc(ex, ey, 80, Math.PI * 1.15, Math.PI * 1.85); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(120,60,40,0.4)'; ctx.stroke();
    });
  }
  const wp = hsWheelPts(DX, DY, DS, wheel);
  const pups = eyes.map(([ex, ey]) => [ex - 34 * Math.sin(wheel) * 1.1, ey + 6]);
  hsCord(wp[0], pups[0], 1, 1, t, '#FFB347', 9); hsCord(wp[1], pups[1], 1, 1, t, '#FFB347', 9);
  hsDriver(ctx, DX, DY, DS, { mood: 'speed', wheel, sweat: ramp(lt, 0.4, 1.0), blurW: wv }, t);
  // speed lines round him
  paint(() => { for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + 0.3, r0 = 330, r1 = 400 + 30 * Math.sin(t * 20 + i); line(ctx, DX + Math.cos(a) * r0, DY - 60 + Math.sin(a) * r0 * 0.8, DX + Math.cos(a) * r1, DY - 60 + Math.sin(a) * r1 * 0.8, 6, 'rgba(255,220,240,0.35)'); } });
  // 0.01 s
  const kS = ramp(t, c.hundredth - 0.05, c.hundredth + 0.25);
  hsStopwatch(255, 530, 58, kS, null, t, { hand: 0.35 + 6 * clamp((t - c.hundredth) / 1.4) });
  bigWord('0.01 s', 590, 540, 132, '#FFD447', kS, -0.04);
  tagPill('FASTER THAN A BLINK', 540, 660, '#FF86A6', ramp(t, c.second - 0.05, c.second + 0.2), 34);
  return { glow: 0.9, capY: 1480, push: { k: 1.0, cx: 540, cy: 960 }, flash: 0.35 * bumpAt(lt, 0, 12) };
};

// ---------------------------------------------------------------- payoff: shake the phone, the ear feels nothing
SC.payoff = (lt, t, shot) => {
  const c = cu();
  const t0 = c.shake2 - 0.1, t1 = c.too + 0.03;
  const ph = phoneSwing(t, t0, t1, 0.25, 0.06);
  // his eyes chase it: late, and later still on "chase"
  const lag = 0.13 + 0.07 * ramp(t, c.chase - 0.1, c.chase + 0.3);
  const lagA = phoneSwing(t - lag, t0, t1, 0.25, 0.06).a;
  const after = ramp(t, c.too, c.too + 0.16, E.outBack);
  const gaze = ph.env > 0.02 ? [0.42 * lagA / PH.amp, 0.02] : [0, 0];
  const smear = ph.env > 0.02 ? { k: clamp(Math.abs(ph.v) / 1500), dx: -Math.sign(ph.v) * 14 } : null;
  const face = faceSeq(t, [[-1, HF.calm], [c.shake2 + 0.1, HF.strain], [c.too, HF.dizzy]]);
  const cam = { ...HS_FE, sx: ph.x, sy: 0.18 * ph.x * Math.sin(t * 9) };
  const B = bedFrame(t, {
    cam, yaw: 0.04 * Math.sin(t * 3), gaze, face, smear, cross: 0.85 * after, win: 1, cords: 1, taut: 0, zzz0: c.ears2 - 0.2,
    driver: { mood: 'doze', wheel: 0 },
    headDY: -6 * bumpAt(t, c.too, 7),
  });
  // NOTHING over the window, TOO SLOW over his head
  const wp = toScreen({ ...cam, sx: 0, sy: 0 }, B.P[0], B.P[1]);
  const kN = popK(t, c.nothing - 0.05, c.too - 0.12, 0.2, 0.1), kT = popK(t, c.too - 0.02, shot.end + 1, 0.1, 0.1);
  // the labels sit on the glass, not in the shaking room: drawn after the blur
  return { glow: 0.85, blur: [ph.v * PH.blur, 0], overlay: () => {
    tagPill('FEELS NOTHING', Math.max(250, wp[0] + 20), wp[1] + WIN_R * cam.zoom + 56, '#FF5A6E', kN, 34);
    hsBurst('TOO SLOW!', 560, 560, kT, '#FF5A6E', 84);
  } };
};

// ---------------------------------------------------------------- weird: 1948, his head jammed between the bars
SC.weird = (lt, t, shot) => {
  const c = cu();
  const pov = t >= c.even - 0.06;
  if (!pov) {
    const camA = { x: 540, y: 1090, zoom: 1.75 }, camB = { x: 540, y: 1060, zoom: 2.35 };
    let cam = camMix(camA, camB, ramp(t, shot.start, c.jammed + 0.1, E.inOutSine));
    const clank = bumpAt(t, c.jammed + 0.05, 8);
    const sh = shake(t, 14 * clank, 30, 4); cam.sx = sh[0]; cam.sy = sh[1];
    wdRoom(cam, t);
    applyCam(cam);
    wdBedBack(t);
    // he leans back into the bars on "his head" and the bars squeeze on "jammed"
    const sq = ramp(t, c.jammed - 0.05, c.jammed + 0.12, E.outBack);
    const face = faceSeq(t, [[-1, HF.calm], [c.jammed + 0.02, HF.wow], [c.bars + 0.05, HF.deadpan]]);
    const lift = ramp(t, c.read - 0.12, c.read + 0.3, E.outBack);
    const wob = ramp(t, c.his_head - 0.1, c.his_head + 0.1) * (1 - sq);
    const S = {
      armR: { e: [118, -300 - 20 * lift], w: [70, -268 - 34 * lift] }, armL: { e: [-118, -300 - 20 * lift], w: [-70, -268 - 34 * lift] }, palm: 0, face, bob: 1.0 * Math.sin(t * 2.1), lean: 0,
      headDY: 8 * sq - 10 * ramp(t, c.his_head - 0.1, c.jammed - 0.05) * (1 - sq),
      turn: { yaw: 0.2 * wob * Math.sin(2 * Math.PI * 2.4 * (t - c.his_head)), pitch: 0.05, gaze: [0, 0.05 + 0.3 * lift * (1 - sq * 0.5)], squash: sq },
    };
    const Hh = wdHero(cam, t, S);
    applyCam(cam);
    wdBlanket();
    wdBook(540, 1185 - 34 * lift, -0.02 - 0.03 * lift, 0);
    wdClampBars(bdHeadPt(Hh.st, 0, 0), sq, t);
    stamp('1948', 330, 540, ramp(t, c.doctor - 0.05, c.doctor + 0.25), '#B3123A', -0.14, 120);
    tagPill('A DOCTOR', 340, 668, '#E9C97A', ramp(t, c.doctor + 0.1, c.doctor + 0.35), 34);
    return { glow: 0.7, desat: 0.9, tint: '#E2C29A', tintA: 0.55, overlay: () => wdOldFilm(t, 1) };
  }
  // his view of the page: each heartbeat makes it jump
  const jump = c.beats.reduce((m, b) => Math.max(m, t >= b ? Math.exp(-(t - b) * 11) : 0), 0);
  wdPage(t, jump);
  const beat = c.beats.reduce((m, b) => Math.max(m, t >= b ? Math.exp(-(t - b) * 9) : 0), 0);
  heartIcon(250, 600, 2.1 + 0.8 * beat, 1);
  const pk = ramp(t, c.even - 0.06, shot.end, E.inOutSine);
  return { glow: 0.7, desat: 0.85, tint: '#E2C29A', tintA: 0.5, overlay: () => wdOldFilm(t, 1), blur: [0, -380 * jump * 0.12], push: { k: 1 + 0.06 * pk, cx: 540, cy: 900 } };
};

// ---------------------------------------------------------------- button: still reading? nod yes. (then the loop)
SC.button = (lt, t, shot) => {
  const c = cu(), D = shot.end;
  // the last 0.5 s: the hook at negative time (the phone starts to swing, his face goes back to the strain)
  if (t >= D - 0.5) {
    const L = loopTail(t, D);
    bedFrame(t, { cam: L.cam, yaw: L.H.yaw, gaze: L.H.gaze, face: L.H.face, smear: L.H.smear });
    return { glow: 0.85, blur: [L.H.ph.v * PH.blur, 0] };
  }
  const nod = t >= c.nod ? 0.2 * Math.sin(2 * Math.PI * c.nod_f * (t - c.nod)) * clamp((c.yes_end + 0.45 - t) / 0.25) : 0;
  const face = faceSeq(t, [[-1, HF.calm], [c.still - 0.05, HF.smug], [c.nod - 0.05, HF.grin], [c.yes_end + 0.3, HF.smug]]);
  // a slow push that hands back to the hook's framing before the loop's last half second
  const cam = { ...HS_FR, zoom: HS_FR.zoom + 0.06 * ramp(t, shot.start, D - 1.2, E.inOutSine) * (1 - ramp(t, D - 1.2, D - 0.5, E.inOutSine)) };
  bedFrame(t, { cam, yaw: 0, pitch: nod, gaze: [0, 0], face });
  return { glow: 0.85 };
};

// ---------------------------------------------------------------- the cover: his head turned, his eyes on you
SC.cover = (lt, t, shot) => {
  const cam = { x: 500, y: 1040, zoom: 3.45 };
  bedFrame(t, {
    cam, yaw: 0.42, gaze: [0, 0], face: HF.smug, win: 1, cords: 1, taut: 1,
    driver: { mood: 'drive', wheel: -0.8, look: -0.6 },
  });
  // the words inside Instagram's middle square (y 420-1500), clear of the window and his face
  bigWord('YOUR EARS', 560, 470, 128, '#FFD447', 1, -0.04);
  bigWord('MOVE YOUR EYES', 545, 1300, 104, '#FFFFFF', 1, -0.02);
  return { glow: 0.85, noCaptions: true };
};

function initScenes2() { initBed(); initWard(); }
