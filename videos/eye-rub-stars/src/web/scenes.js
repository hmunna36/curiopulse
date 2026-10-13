// Why Do You See STARS When You Rub Your Eyes? Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the
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
// 0..1: in at t0, out at t1 (things pop in and pop out; nothing fades)
const popK = (t, t0, t1, i = 0.08, o = 0.1) => Math.min(clamp((t - t0) / i), clamp((t1 - t) / o));

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// his desk at two in the morning: the monitor and the moon in front and to the left (a cool key from above), a warm lamp
// far right (the rim); the room behind him is out of focus in the close shots
const DESK_LIGHT = { ...LIGHTS.night, key: [-0.38, -0.66, 0.62], keyTint: [0.98, 1.0, 1.06], rim: [1.0, 0.74, 0.46], rimFrom: [0.85, -0.35], rimAmt: 1.15, pool: 0.5, halo: 0.08, haloColor: [0.6, 0.7, 1.0], dof: 1.0 };

// ---------------------------------------------------------------- his faces
const EF = {
  rub: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 1.25, browTilt: 0.9, mouth: 'wavy', mouthOpen: 0.3, blink: 1, cross: 0 },
  wow: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 1.6, browTilt: 0.5, mouth: 'o', mouthOpen: 0.75, blink: 1, cross: 0 },
  ooh: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 1.3, browTilt: 0.3, mouth: 'grin', mouthOpen: 0.55, blink: 1, cross: 0 },
  huh: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 1.0, browTilt: 1.1, mouth: 'o', mouthOpen: 0.3, blink: 1, cross: 0 },
  yawn: { ...FACES.yawn, browY: 1.3 },
  tired: { eyeOpen: 0.86, pupil: 1, lookX: 0, lookY: 0.3, browY: -0.25, browTilt: -0.1, mouth: 'flat', mouthOpen: 0.1, blink: 0.5, cross: 0 },
  dead: { eyeOpen: 0.86, pupil: 1, lookX: 0, lookY: 0, browY: -0.3, browTilt: -0.3, mouth: 'flat', mouthOpen: -0.4, blink: 0.34, cross: 0 },
};

// ---------------------------------------------------------------- small things
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
// a dashed leader from a label to its spot, with a small dot and no glow (kit's leader() blooms where it lands)
function thinLeader(a, b, k, col) {
  if (k <= 0.01) return;
  screenSpace();
  const x = lerp(a[0], b[0], clamp(k)), y = lerp(a[1], b[1], clamp(k));
  paint(() => { ctx.setLineDash([9, 9]); line(ctx, a[0], a[1], x, y, 3, rgba(col, 0.85)); ctx.setLineDash([]); if (k >= 1) circle(ctx, b[0], b[1], 7, col); });
}
// where a star may show: not on his face, his fists and forearms, or his chest (screen space; H from dkHero)
function starKeep(H, cam) {
  const K = cam.zoom * H.K, hd = toScreen(cam, H.head[0], H.head[1] - 8 * H.K), sh = toScreen(cam, H.head[0], H.head[1] + 92 * H.K);
  const caps = ['L', 'R'].filter((k) => H['fist' + k]).map((k) => [toScreen(cam, H['el' + k][0], H['el' + k][1]), toScreen(cam, H['fist' + k][0], H['fist' + k][1])]);
  return (x, y) => {
    let v = clamp((Math.hypot((x - hd[0]) / (86 * K), (y - hd[1]) / (104 * K)) - 1) / 0.16);
    for (const [a, b] of caps) {
      const dx = b[0] - a[0], dy = b[1] - a[1], u = clamp(((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy + 1e-6));
      v = Math.min(v, clamp((Math.hypot(x - a[0] - u * dx, y - a[1] - u * dy) - 36 * K) / (14 * K)));
    }
    if (y > sh[1]) v = Math.min(v, clamp((Math.abs(x - sh[0]) - 112 * K) / (22 * K)));
    return v;
  };
}

// ================================================================ the desk: frame 1 and round it
const SEC0 = { P: [520, 850], R: 345 };                         // how the next shot opens: where the eyeball is, and its radius (px)
const RUB_HZ = 2.7;
// the opening as a function of tt = seconds since frame 1 (negative = the last frames of the Short, on their way here)
function hookA(tt) {
  const c = cu();
  const app = clamp(-tt / 0.4), on = 1 - E.inCubic(app);                     // his fists come up from his chin and land on frame 1
  const ph = Math.PI * 2 * RUB_HZ * Math.max(0, tt), slow = 1 - 0.5 * ramp(tt, c.stars_end, c.relax + 0.4);
  const go = ramp(tt, 0, 0.12, E.inOutSine);                                 // the rub starts from where his fists landed (the loop joins on frame 0)
  const amp = (tt < 0 ? 0 : 4.4 * slow * go) * (1 - 0.6 * ramp(tt, c.eyeball - 0.2, c.eyeball + 0.2));
  const offL = [amp * Math.cos(ph), amp * 0.8 * Math.sin(ph)], offR = [-amp * Math.cos(ph + 0.5), amp * 0.8 * Math.sin(ph + 0.5)];
  const eL = dkArmMix(DK_ARM.chinL, DK_ARM.eyesL, on), eR = dkArmMix(DK_ARM.chinR, DK_ARM.eyesR, on);
  const armL = { e: [eL.e[0] + 0.5 * offL[0], eL.e[1] + 0.3 * offL[1]], f: [eL.f[0] + offL[0], eL.f[1] + offL[1]] };
  const armR = { e: [eR.e[0] + 0.5 * offR[0], eR.e[1] + 0.3 * offR[1]], f: [eR.f[0] + offR[0], eR.f[1] + offR[1]] };
  let face = tt < 0 ? lerpFace(EF.yawn, EF.rub, on) : EF.rub;
  face = lerpFace(face, EF.wow, ramp(tt, c.stars - 0.08, c.stars + 0.1));
  face = lerpFace(face, EF.ooh, ramp(tt, c.relax - 0.05, c.relax + 0.25));
  face = lerpFace(face, EF.huh, ramp(tt, c.eyeball - 0.1, c.eyeball + 0.15));
  const A = {
    armL, armR, fistL: { ang: 0.32 * Math.sin(ph) - 0.1 }, fistR: { ang: -0.32 * Math.sin(ph + 0.5) + 0.1 }, face,
    bob: tt < 0 ? -3 * Math.sin(Math.PI * on) : 1.4 * Math.sin(tt * 2.6), lean: 0, headRot: tt < 0 ? 0 : 0.022 * slow * Math.sin(ph * 0.5),
    headDX: tt < 0 ? 0 : 1.2 * slow * go * Math.cos(ph), headDY: (tt < 0 ? 5 * (1 - on) : 0) - 3 * bumpAt(tt, c.stars, 5),
  };
  // the stars: two sparks at once, a few as the dark comes, all of them on "stars"
  const starsK = tt <= 0 ? 0 : Math.max(0.12 * ramp(tt, 0, 0.3) + 0.18 * ramp(tt, 0.5, c.dark), 0.3 + 0.3 * ramp(tt, c.dark, c.fills + 0.15), 0.6 + 0.4 * ramp(tt, c.stars - 0.1, c.stars + 0.12));
  const dark = tt < 0 ? 0 : 0.3 * ramp(tt, 0, 0.5) + 0.7 * ramp(tt, c.dark - 0.2, c.dark + 0.3);
  const press = [0.5 + 0.5 * Math.sin(ph), 0.5 + 0.5 * Math.sin(ph + 0.5)];
  return { A, starsK: Math.min(1, starsK), dark, press, ph, on };
}
function hookCam(tt) {
  const c = cu();
  const k = camKeys(tt, [[-0.4, 540, 1042, 4.26], [0, 540, 1038, 4.4], [0.3, 540, 1036, 4.72], [1.25, 540, 1032, 4.4], [c.fills + 0.1, 540, 1024, 3.5], [c.stars + 0.25, 540, 1018, 3.16],
    [c.gotin_end, 540, 1020, 3.26], [c.eyeball1 + 0.35, 540, 1010, 5.5], [c.brain0, 546, 1002, 6.3], [c.dive, 548, 1000, 6.42]], E.inOutCubic);
  if (tt >= 0 && tt < 0.3) { const u = E.outCubic(tt / 0.3); k.zoom = lerp(4.4, 4.72, u); k.y = lerp(1038, 1036, u); }   // the first push is quick off the mark
  const sh = 7 * bumpAt(tt, c.stars, 7);
  if (tt >= 0) { k.x += sh * vnoise(tt * 34, 3) / k.zoom * 3; k.y += sh * vnoise(tt * 31, 8) / k.zoom * 3; }
  return k;
}
// light that reaches his fists and bounces off: four streaks, two from the lamp's side, two from the moon's (screen space)
function hookBeams(tt, H, cam) {
  const c = cu();
  const FR = toScreen(cam, H.fistR[0], H.fistR[1]), FL = toScreen(cam, H.fistL[0], H.fistL[1]);
  const B = [[FR, [1180, 300], '#FFE08A', [1120, 1230]], [FL, [-100, 380], '#CFE0FF', [-60, 1180]], [FR, [1200, 640], '#FFE08A', [1000, 1500]], [FL, [-120, 760], '#CFE0FF', [80, 1520]]];
  screenSpace();
  for (let i = 0; i < B.length; i++) {
    const [F, S0, col, S1] = B[i], t0 = c.nolight + 0.04 + 0.2 * i, d = tt - t0, fly = 0.2, bounce = 0.34;
    if (d < 0 || d > fly + bounce) continue;
    const dx = F[0] - S0[0], dy = F[1] - S0[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, hit = [F[0] - ux * 62, F[1] - uy * 62];
    const seg = (P, Q, a, w) => { for (const [cc, m, al] of [[ctx, 1, 1], [gctx, 1.9, 0.55]]) line(cc, P[0], P[1], Q[0], Q[1], w * m, rgba(col, a * al)); };
    if (d < fly) {
      const u = d / fly, u0 = Math.max(0, u - 0.3), hx = hit[0] - S0[0], hy = hit[1] - S0[1];
      seg([S0[0] + hx * u0, S0[1] + hy * u0], [S0[0] + hx * u, S0[1] + hy * u], 1, 13);
    } else {
      const u = (d - fly) / bounce, u0 = Math.max(0, u - 0.4), bx = S1[0] - hit[0], by = S1[1] - hit[1];
      seg([hit[0] + bx * 0.5 * u0, hit[1] + by * 0.5 * u0], [hit[0] + bx * 0.5 * u, hit[1] + by * 0.5 * u], 1 - u, 11);
      const q = E.outCubic(u);                                                  // the knock where it lands
      for (let j = 0; j < 5; j++) { const a = Math.atan2(-uy, -ux) + (j - 2) * 0.5; line(ctx, hit[0] + Math.cos(a) * (10 + 26 * q), hit[1] + Math.sin(a) * (10 + 26 * q), hit[0] + Math.cos(a) * (24 + 44 * q), hit[1] + Math.sin(a) * (24 + 44 * q), 6, rgba('#FFFFFF', 1 - u)); }
      softDot(gctx, hit[0], hit[1], 60, col, 0.6 * (1 - u));
    }
  }
}
// the rub, drawn: short arcs outside each fist that swing with it, and the first two sparks at his temples (camera applied)
function rubMarks(H, tt, S) {
  const c = cu(), K = H.K, a0 = 1 - ramp(tt, c.stars_end, c.relax);
  paint(() => {
    for (const [sd, F, ph] of [[-1, H.fistL, S.ph], [1, H.fistR, S.ph + 0.5]]) {
      const sw = Math.sin(ph), al = 0.75 * a0 * (0.35 + 0.65 * Math.abs(Math.cos(ph)));
      for (let i = 0; i < 2; i++) {
        const r = (33 + 9 * i) * K, mid = (sd > 0 ? 0 : Math.PI) + sd * 0.5 * sw;
        ctx.beginPath(); ctx.arc(F[0], F[1], r, mid - 0.42 + 0.1 * i, mid + 0.42 - 0.1 * i); ctx.lineWidth = (3.2 - i) * K; ctx.lineCap = 'round'; ctx.strokeStyle = `rgba(255,255,255,${al * (1 - 0.35 * i)})`; ctx.stroke();
      }
    }
  });
}
// the first sparks: small stars that pop right beside his fists in the first second and a half, where the eye already is
// (the big field starts far above his head at this zoom). [when, x, y in head units, size, colour]
const HOOK_SPARKS = [[0.03, 70, -34, 9, '#FFD447'], [0.14, -72, -22, 8, '#7FE9FF'], [0.34, 79, 6, 7, '#C8A8FF'], [0.5, -77, -48, 9, '#FFFFFF'], [0.72, 67, -60, 8, '#4DFFB4'],
  [0.9, -81, 4, 7, '#FF86A6'], [1.12, 83, -26, 8, '#FFD447'], [1.3, -69, -62, 8, '#7FE9FF'], [1.5, 74, -46, 7, '#FFFFFF']];
function hookSparks(tt, H, cam) {
  const K = cam.zoom * H.K;
  for (let i = 0; i < HOOK_SPARKS.length; i++) {
    const [t0, hx, hy, r, col] = HOOK_SPARKS[i], d = tt - t0;
    if (d < 0 || d > 0.36) continue;
    const P = toScreen(cam, ...dkHeadPt(H.st, hx, hy - 10 * d));
    phStar(P[0], P[1], r * K, col, popK(d, 0, 0.36, 0.06, 0.12), 1, 0.5 * i + 1.2 * d, 'star');
  }
}
// the desk, him, the stars, and what is inside his head. o: {cam, S: a state from hookA, xray: fn(H) -> X or null, after: fn(H)}
function hookDraw(tt, t, o) {
  const c = cu(), S = o.S, cam = o.cam;
  dkRoom(cam, t, { dark: S.dark });
  applyCam(cam);
  const H = dkHero(cam, t, S.A);
  applyCam(cam);
  dkDesk();
  if (tt >= 0 && tt < c.relax) rubMarks(H, tt, S);
  if (tt >= 0 && tt < 2) hookSparks(tt, H, cam);
  const hs = toScreen(cam, H.head[0], H.head[1]);
  const fade = 1 - 0.75 * ramp(tt, c.eyeball - 0.1, c.eyeball + 0.3);
  phField(t, S.starsK, hs, starKeep(H, cam), { a: fade, burst: bumpAt(tt, c.stars, 5) });
  if (tt > c.nolight - 0.1 && tt < c.eyeball + 0.4) hookBeams(tt, H, cam);
  applyCam(cam);
  const X = o.xray ? o.xray(H) : null;
  if (X) dkXray(H.st, X, t);
  if (o.after) o.after(H);
  return H;
}

// ================================================================ shots
SC.hook = (lt, t, shot) => {
  const c = cu(), S = hookA(t), cam = hookCam(t);
  const dive = ramp(t, c.dive, shot.end, E.inCubic);
  const st0 = dkSt(S.A), EYE = dkHeadPt(st0, DK_EYE.x, DK_EYE.y);
  if (dive > 0) {   // into his eyeball: it ends where the next shot's eyeball is, at its size
    const P0 = toScreen(cam, EYE[0], EYE[1]);
    Object.assign(cam, scaledCam(cam, EYE, 1 + (SEC0.R / (17.5 * cam.zoom) - 1) * dive));
    cam.sx = (SEC0.P[0] - P0[0]) * dive; cam.sy = (SEC0.P[1] - P0[1]) * dive;
  }
  const xk = ramp(t, c.eyeball - 0.1, c.eyeball + 0.22);
  const ringing = t > c.dialed + 0.16 ? 0.55 + 0.45 * Math.abs(Math.sin(t * 9)) : 0, pick = ramp(t, c.ring2 + 0.1, c.ring2 + 0.2);
  const H = hookDraw(t, t, { cam, S, xray: (Hh) => xk > 0 ? {
    k: xk, press: S.press, fists: [[S.A.armL.f[0] - 0, S.A.armL.f[1] + 470], [S.A.armR.f[0], S.A.armR.f[1] + 470]],
    call: t > c.dialed && t < c.ring2 ? ((t - c.dialed) / 0.4) % 1 : undefined, ring: ringing, pick,
    mood: pick > 0.5 ? 'squint' : t > c.dialed + 0.16 ? 'worried' : 'calm', look: t > c.dialed + 0.16 ? [1, -0.2] : [0, 0.6], shut: t > c.dialed + 0.16 ? 0 : 1,
  } : null, after: (Hh) => {   // ... asleep
    if (xk < 0.9 || t > c.dialed + 0.16) return;
    const Z = dkHeadPt(Hh.st, 6, -98);
    applyCam(cam); zzz(Z[0], Z[1], t, c.eyeball + 0.1, 1, 0.085);
  } });
  // for whoever watches with the sound off: the phone rings
  const PH0 = toScreen(cam, ...dkHeadPt(H.st, 50, -92));
  tagPill('RING! RING!', clamp(PH0[0] + 30, 560, 770), PH0[1] - 26, '#FFD447', ramp(t, c.dialed + 0.2, c.dialed + 0.36) * (1 - pick) * (1 - dive), 46);
  const burst = bumpAt(t, c.stars, 8);
  return { glow: 0.85, capY: t < c.eyeball - 0.12 ? 1330 : 1480, zblur: 0.36 * dive, zcx: lerp(540, SEC0.P[0], dive), zcy: lerp(960, SEC0.P[1], dive), flash: 0.2 * burst };
};

// ================================================================ inside the eyeball: the back wall and who lives on it
const INSIDE_LIGHT = { ...LIGHTS.inside, pool: 0.22, halo: 0 };
function secBg(t, dark = 0) { darkBg(mixH('#1C3F7C', '#0C1434', dark), '#050919'); motes(t, 0.3); }
SC.sensors = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0;
  secBg(t);
  const V = eyeKeys(lt, [[0, 0, 0, 1.15, SEC0.P[0], SEC0.P[1]], [c.back - T0 + 0.4, 130, 0, 1.44, 560, 850], [c.lined - T0 + 0.45, 140, 0, 1.5, 560, 850],
    [c.light2 - T0 + 0.28, 20, 0, 1.04, 548, 850], [c.one - T0, 40, 0, 1.08, 548, 850], [c.LIGHT - T0, 104, 0, 1.28, 560, 850], [D, 104, 0, 1.34, 560, 850]]);
  const sh = 9 * bumpAt(t, c.LIGHT, 6);
  V.x += sh * vnoise(t * 36, 2); V.y += sh * vnoise(t * 33, 6);
  const beam = ramp(t, c.light2 - 0.12, c.light2 + 0.3, E.inOutSine), hitT = c.light2 + 0.26, shout = t >= c.LIGHT - 0.02 && t < c.LIGHT_end + 0.06;
  const sens = [...Array(6)].map((_, i) => {
    const pop = ramp(t, c.lined - 0.04 + 0.085 * i, c.lined + 0.14 + 0.085 * i), mid = i === 2 || i === 3, lit = t > hitT ? (mid ? 1 : 0.45) : 0;
    const echo = pulseOf(t, [c.echo[i === 0 ? 0 : 1]], 0.2) * (i === 0 || i === 5 ? 1 : 0);
    let mood = t < hitT ? 'calm' : t < c.one - 0.05 ? (mid ? 'ready' : 'calm') : 'ready';
    if (shout || echo > 0.5) mood = 'shout';
    const hop = 18 * Math.max(pulseOf(t, [c.know + 0.075 * i], 0.17), pulseOf(t, [c.one + 0.06 * (5 - i)], 0.15));   // a wave down the wall, and back
    const crouch = 0.34 * ramp(t, c.word, c.word_end + 0.22, E.inOutSine) * (t < c.LIGHT - 0.02 ? 1 : 0);          // they take a breath
    return { pop, mood, hop, squish: crouch, look: t < c.light2 - 0.2 ? [0.7 * Math.sin(t * 2.2 + i), 0.4 * Math.cos(t * 1.7 + i * 2)] : [-1, 0], fire: shout ? 1 : Math.max(echo, lit * (0.55 + 0.25 * Math.sin(t * 9 + i))), jit: shout ? 3 : 0 };
  });
  const wall = ramp(t, c.back - 0.05, c.back + 0.22) * (1 - ramp(t, c.lined - 0.1, c.lined + 0.3)) * (0.7 + 0.3 * Math.sin(t * 12));
  const go = (t - c.LIGHT) / 0.75;
  eyeOn(V, () => eyeDraw(t, { sens, beam, beamA: 0.9 - 0.5 * ramp(t, c.LIGHT - 0.1, c.LIGHT), wall, pulses: [[go, go > 0 && go < 1 ? 1 : 0], [go - 0.25, go > 0.25 && go < 1.25 ? 1 : 0], [go - 0.5, go > 0.5 && go < 1.5 ? 0.9 : 0]] }));
  // what things are
  const rk = ramp(t, c.back - 0.02, c.back + 0.16) * (1 - ramp(t, c.lined - 0.16, c.lined - 0.02)), R0 = eyePt(V, 210, 176);
  leader([430, 1196], R0, rk >= 0.99 ? 1 : rk, '#FFB08A'); pill(318, 1206, 'THE RETINA', '#FFB08A', rk, 42);
  const sk = ramp(t, c.light2 - 0.03, c.light2 + 0.15) * (1 - ramp(t, c.one - 0.2, c.one - 0.04)), S0 = eyePt(V, 96, -292);
  leader([590, 536], [S0[0], S0[1] + 6], sk >= 0.99 ? 1 : sk, '#FF9A3C'); pill(462, 506, 'LIGHT SENSORS', '#FF9A3C', sk, 42);
  // the one word they know
  const C0 = eyePt(V, -92, 0);
  eyeShout('LIGHT!', C0[0], C0[1] + 6 * Math.sin(t * 50), 132, popK(t, c.LIGHT - 0.03, c.LIGHT_end + 0.14, 0.1), 1, -0.05, '#FFD447', 3);
  c.echo.forEach((f, j) => { const P = eyePt(V, 60, j ? 210 : -210); eyeShout('light!', P[0] - 150, P[1], 54, popK(t, f, f + 0.26), 1, j ? 0.1 : -0.1, '#FFE680', 7 + j); });
  const arrive = ramp(lt, 0, 0.3);
  return { glow: 0.9, capY: 1440, zblur: 0.3 * (1 - arrive), zcx: SEC0.P[0], zcy: SEC0.P[1], flash: 0.24 * (1 - ramp(lt, 0, 0.16)) + 0.2 * bumpAt(t, c.LIGHT, 8) };
};

// ================================================================ the lid shuts, a knuckle presses: squished, and they shout anyway
SC.squeeze = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0;
  const lid = ramp(t, T0 + 0.02, c.rub2 + 0.2, E.inOutCubic);
  secBg(t, 0.7 * lid);
  const V = eyeKeys(lt, [[0, -110, 0, 1.0, 560, 850], [c.eye3 - T0, -170, 0, 0.9, 560, 850], [c.they - T0, -170, 0, 0.92, 560, 850], [c.squished - T0 + 0.3, 150, 0, 1.4, 560, 850],
    [c.shout - T0 + 0.1, 120, 0, 1.26, 556, 850], [D, 96, 0, 1.2, 552, 850]]);
  const fk = ramp(t, c.rub2 - 0.02, c.eye3 + 0.06, E.outCubic), ph = Math.PI * 2 * RUB_HZ * t, pr = fk * fk;
  const squash = pr * (0.72 + 0.28 * Math.sin(ph)), sqz = ramp(t, c.squished - 0.06, c.squished + 0.16, E.outBack);
  const hitB = bumpAt(t, c.squished, 7);
  V.x += 8 * hitB * vnoise(t * 36, 2); V.y += 8 * hitB * vnoise(t * 33, 6);
  const FIRE = [c.shout, c.shout + 0.16, c.anyway, c.anyway + 0.2, ...c.chorus], ORDER = [2, 4, 1, 3, 0, 5, 2];
  const sens = [...Array(6)].map((_, i) => {
    const mine = FIRE.filter((f, j) => ORDER[j % ORDER.length] === i), on = pulseOf(t, mine, 0.3), after = t > c.shout ? 0.35 + 0.2 * Math.sin(t * 17 + i * 2) : 0;
    let mood = t < c.rub2 + 0.25 ? 'calm' : t < c.squished - 0.05 ? 'ready' : 'oof';
    if (on > 0.4) mood = 'shout';
    return { pop: 1, mood, look: [-0.8, 0.5 * Math.sin(t * 5 + i)], squish: clamp(sqz, 0, 1.12) * (0.82 + 0.18 * Math.sin(ph + i)), fire: Math.max(on, after), jit: 1.5 * sqz + 2.5 * on };
  });
  const stream = t > c.shout ? [0, 1, 2, 3].map((j) => [((t - c.shout) * 1.5 + j / 4) % 1, 1]) : [];
  eyeOn(V, () => eyeDraw(t, { sens, lid, dark: 0.92 * lid, squash, fist: { k: fk, y: 44 * pr * Math.sin(ph) }, pulses: stream }));
  // the words
  eyeShout('SQUISH!', 430, 690, 104, popK(t, c.squished, c.and2 - 0.02, 0.1), 1, -0.1, '#FF5A6E', 5);
  FIRE.forEach((f, j) => {
    const i = ORDER[j % ORDER.length], P = eyeSensorAt(i, squash), S0 = eyePt(V, P.x - 150 - 26 * (j % 2), P.y * 0.94);
    eyeShout('LIGHT!', clamp(S0[0], 200, 700), clamp(S0[1], 500, 1210), j < 4 ? 70 : 56, popK(t, f, f + 0.36), 1, (j % 2 ? 0.1 : -0.1), '#FFD447', 11 + j);
  });
  return { glow: 0.9, capY: 1440, flash: 0.2 * (1 - ramp(lt, 0, 0.12)) + 0.14 * hitB + 0.1 * bumpAt(t, c.shout, 8) };
};

// ================================================================ the other end of the line
SC.brain = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0;
  darkBg('#182B5E', '#04061A'); motes(t, 0.25);
  const W0 = [T0 + 0.06, T0 + 0.3, c.cant - 0.02];
  const words = W0.map((f) => [popK(t, f, f + 0.42), 1]);
  const shr = ramp(t, c.cant - 0.05, c.cant + 0.2) * (1 - ramp(t, c.so - 0.1, c.so + 0.12));
  const br = ramp(t, c.paints - 0.14, c.paints + 0.12, E.outBack), stars = ramp(t, c.paints + 0.05, c.fireworks_end + 0.1, E.inOutSine);
  const mood = t < c.cant - 0.05 ? 'worried' : t < c.so ? 'shrug' : t < c.paints ? 'think' : 'grin';
  const look = t < c.cant - 0.05 ? [-1, 0] : t < c.so ? [Math.sin((t - c.cant) * 9), -0.2] : t < c.paints ? [0.3, -0.8] : [0.6, -1];
  brainRoom(t, { mood, look, ear: 1, words, shrug: shr, q: ramp(t, c.check - 0.04, c.check + 0.12) * (1 - ramp(t, c.so, c.so + 0.14)), brush: clamp(br, 0, 1.1), stars, pops: c.pops,
    pulses: [0, 1, 2].map((j) => [((t - T0) * 1.3 + j / 3) % 1, 0.9]) });
  const pop = c.pops.reduce((m, f) => Math.max(m, bumpAt(t, f, 9)), 0);
  return { glow: 0.9, push: { k: 1 + 0.045 * lt / D, cx: 540, cy: 860 }, flash: 0.22 * (1 - ramp(lt, 0, 0.12)) + 0.1 * pop };
};

// ================================================================ a study in the 1660s: Isaac Newton, and a bodkin
const STUDY_LIGHT = { ...flipLight(LIGHTS.candle), rim: [0.55, 0.7, 1.0], rimFrom: [-0.85, -0.35], rimAmt: 1.0, pool: 0.6, halo: 0.1, haloColor: [1.0, 0.72, 0.45], dof: 0.8 };
const NF = {
  keen: { eyeOpen: 1.1, pupil: 0.9, lookX: -0.9, lookY: -0.5, browY: 0.9, browTilt: -0.3, mouth: 'flat', mouthOpen: 1.2, blink: 0, cross: 0 },
  aim: { eyeOpen: 1.24, pupil: 0.72, lookX: -1, lookY: 0, browY: 1.1, browTilt: 1.0, mouth: 'grimace', mouthOpen: 1, blink: 0, cross: 0 },
  eep: { eyeOpen: 1.42, pupil: 0.5, lookX: -0.8, lookY: 0, browY: 1.6, browTilt: 0.5, mouth: 'o', mouthOpen: 0.5, blink: 0, cross: 0 },
  joy: { eyeOpen: 1.3, pupil: 0.75, lookX: 0.9, lookY: -0.3, browY: 1.5, browTilt: 0.2, mouth: 'grin', mouthOpen: 0.9, blink: 0, cross: 0 },
  caught: { eyeOpen: 1.3, pupil: 0.62, lookX: 0, lookY: 0.1, browY: 1.3, browTilt: 0.2, mouth: 'flat', mouthOpen: -0.2, blink: 0, cross: 0 },
  sorry: { eyeOpen: 1.0, pupil: 0.9, lookX: 0, lookY: 0.2, browY: 0.9, browTilt: 1.2, mouth: 'grimace', mouthOpen: 1, blink: 0, cross: 0 },
};
const NW_ARM = { show: { e: [-124, -316], f: [-98, -404] }, aim: { e: [-138, -348], f: [-106, -450] } };
function newtA(t) {
  const c = cu();
  const aim = ramp(t, c.by - 0.05, c.needle + 0.05, E.inOutCubic), inn = ramp(t, c.behind, c.eyeball4 + 0.2, E.inOutSine);
  const arm = dkArmMix(NW_ARM.show, NW_ARM.aim, aim), wob = (1 - aim) * 3 * Math.sin(t * 3.1);
  const tip0 = [arm.f[0] + 14 + wob, arm.f[1] - 74], tip1 = [-43 + 5 * inn, -471];
  let face = lerpFace(NF.keen, NF.aim, ramp(t, c.sliding - 0.1, c.sliding + 0.15));
  face = lerpFace(face, NF.eep, ramp(t, c.eyeball4, c.eyeball4 + 0.2));
  face = lerpFace(face, NF.joy, ramp(t, c.saw - 0.1, c.saw + 0.12));
  face = { ...face, blink: Math.max(face.blink || 0, pulseOf(t, [c.newton_end + 0.1, c.poke + 0.12], 0.11)) };
  return {
    dx: -70, armL: arm, fistL: { ang: -0.5 + 0.2 * aim }, armR: DK_ARM.deskR, face,
    bodkin: { tip: [lerp(tip0[0], tip1[0], aim), lerp(tip0[1], tip1[1], aim)], in: inn },
    bob: 1.4 * Math.sin(t * 2.4), headRot: -0.05 * aim + 0.03 * ramp(t, c.saw, c.saw + 0.2), headDX: -1.5 * bumpAt(t, c.poke, 7) * Math.sin(t * 50), headDY: -3 * bumpAt(t, c.saw, 5),
  };
}
SC.newton = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0;
  const cam = camKeys(lt, [[0, 492, 1052, 2.26], [c.this_end - T0, 500, 1046, 2.44], [c.needle - T0 + 0.2, 512, 1040, 2.86], [c.eyeball4 - T0 + 0.3, 516, 1038, 3.0], [c.saw - T0, 522, 1040, 2.9], [D, 524, 1040, 2.96]], E.inOutCubic);
  stRoom(cam, t);
  applyCam(cam);
  const H = newtHero(cam, t, newtA(t));
  applyCam(cam);
  stDesk(t);
  // who, and when
  pill(446, 512, 'ISAAC NEWTON, 1660s', '#FFD98A', ramp(t, c.isaac - 0.02, c.isaac + 0.16), 42);
  const bk = ramp(t, c.needle - 0.03, c.needle + 0.14) * (1 - ramp(t, c.saw - 0.25, c.saw - 0.1)), N0 = toScreen(cam, H.fistL[0] + 26 * H.K, H.fistL[1] - 14 * H.K);
  thinLeader([262, 1152], N0, bk >= 0.99 ? 1 : bk, '#DCE3EE'); pill(376, 1186, 'A BODKIN: A BLUNT NEEDLE', '#DCE3EE', bk, 32);
  // what he saw
  const wk = ramp(t, c.saw - 0.06, c.saw + 0.2), n = 6 * ramp(t, c.colored - 0.05, c.rings_end, E.inOutSine);
  ringVision(826, 742, 138, wk, n, t);
  if (wk > 0.5) { screenSpace(); paint(() => { ctx.font = '900 30px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = 'rgba(255,236,190,0.9)'; ctx.fillText('WHAT HE SAW', 826, 924); }); }
  const TP = toScreen(cam, H.eyeL[0], H.eyeL[1]), Kn = cam.zoom;
  [[-64, -62, 9, '#FFD447'], [-92, -34, 7, '#7FE9FF'], [-50, -88, 6, '#C8A8FF'], [-84, -70, 8, '#FFFFFF']].forEach(([dx, dy, r, col], i) => {
    const f = c.own + 0.05 + 0.3 * i, d = t - f;
    if (d >= 0 && d < 0.55 && t < c.saw) phStar(TP[0] + dx * Kn, TP[1] + dy * Kn, r * Kn, col, popK(d, 0, 0.5), 1, 0.4 * i, 'star');
  });
  const pk = bumpAt(t, c.poke, 8);
  if (pk > 0.05) { const E0 = toScreen(cam, H.eyeL[0] - 22 * H.K, H.eyeL[1]); shockLines(E0[0], E0[1], 60, 1 - pk, 8, '#FFFFFF', 4); }
  return { glow: 0.85, flash: 0.22 * (1 - ramp(lt, 0, 0.12)) + 0.06 * bumpAt(t, c.colored, 8) };
};
SC.dont = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0;
  const cam = camKeys(lt, [[0, 462, 1046, 4.0], [D, 464, 1046, 4.22]], E.outCubic);
  stRoom(cam, t);
  applyCam(cam);
  const A = newtA(shot.start - 0.02), drop = ramp(t, c.that_end + 0.02, c.that_end + 0.4, E.inCubic);
  let face = lerpFace(NF.eep, NF.caught, ramp(t, c.not - 0.05, c.not + 0.1));
  face = lerpFace(face, NF.sorry, ramp(t, c.that_end, c.that_end + 0.15));
  A.face = { ...face, blink: pulseOf(t, [c.that + 0.12], 0.1) };
  A.bodkin = { tip: [-38, -471], in: 1, drop };
  A.bob = 0; A.headRot = -0.05 * (1 - ramp(t, c.not - 0.05, c.not + 0.12)); A.headDX = 0; A.headDY = 0;
  if (drop > 0.02) { A.armL = dkArmMix(NW_ARM.aim, NW_ARM.show, clamp(drop * 1.2)); A.fistL = { ang: -0.3 }; }
  const H = newtHero(cam, t, A);
  applyCam(cam);
  stDesk(t);
  const xk = ramp(t, c.that - 0.03, c.that + 0.12) * (1 - ramp(t, c.that_end + 0.25, c.that_end + 0.4)), B0 = toScreen(cam, H.fistL[0] + 34 * H.K, H.fistL[1] - 12 * H.K);
  bigX(B0[0], B0[1], 0.5, xk);
  const sw = ramp(t, c.that_end + 0.1, c.that_end + 0.3);
  if (sw > 0.01) { const S0 = toScreen(cam, H.head[0] + 66 * H.K, H.head[1] - 40 * H.K); screenSpace(); sweatDrop(ctx, S0[0], S0[1] + 30 * sw, 2.2, sw); }
  return { glow: 0.85, flash: 0.26 * (1 - ramp(lt, 0, 0.1)) + 0.1 * bumpAt(t, c.that, 9) };
};

// ================================================================ asleep in orbit: cosmic rays, and the same call
const ORBIT_LIGHT = { ...flipLight(LIGHTS.night), rim: [0.5, 0.76, 1.0], rimAmt: 1.2, pool: 0.45, halo: 0.08, dof: 0.6 };
const AF = {
  asleep: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 0.2, browTilt: 0.2, mouth: 'flat', mouthOpen: 1.2, blink: 1, cross: 0 },
  huh: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 1.5, browTilt: 0.6, mouth: 'o', mouthOpen: 0.35, blink: 1, cross: 0 },
  ugh: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 0.4, browTilt: -0.6, mouth: 'wavy', mouthOpen: 0.3, blink: 1, cross: 0 },
};
SC.astro = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0;
  const cam = camKeys(lt, [[0, 516, 868, 2.0], [c.flashes - T0 + 0.25, 536, 826, 2.5], [c.shut_end - T0, 540, 820, 2.6], [c.zipping - T0 - 0.15, 548, 812, 2.8], [c.through - T0 + 0.25, 574, 772, 4.3], [D, 575, 770, 4.5]], E.inOutCubic);
  orRoom(cam, t);
  // the rays, and what each one sets off: [when, which eye (0 = screen left, 1 = right), how far off the eye it passes]
  const RAYS = [[c.zip1, 1, 0], [c.cosmic + 0.12, 0, 60], [c.zip2, 1, 0], [c.through - 0.02, 0, 0], [c.eyeballs + 0.16, 1, 0], [c.making - 0.04, 0, 0]];
  const POPS = [[c.flashes, 0], [c.likethis + 0.12, 1], [c.with + 0.3, 0]];
  const flash = [0, 1].map((i) => Math.max(...RAYS.filter((r) => r[1] === i && r[2] === 0).map((r) => bumpAt(t, r[0] + 0.02, 5)), ...POPS.filter((p) => p[1] === i).map((p) => bumpAt(t, p[0], 5))));
  const jolt = Math.max(...POPS.map((p) => bumpAt(t, p[0], 7)), ...RAYS.filter((r) => r[2] === 0).map((r) => bumpAt(t, r[0] + 0.02, 7)));
  const xk = ramp(t, c.zipping - 0.05, c.zipping + 0.25);
  let face = lerpFace(AF.asleep, AF.huh, clamp(jolt * 1.6));
  face = lerpFace(face, AF.ugh, ramp(t, c.same, c.same + 0.2));
  const fl = 5 * Math.sin(t * 1.3), A = {
    pal: ASTROPAL, dx: 40, dy: -250, hand: 'open', noLegs: true, face, lean: 0.09 + 0.025 * Math.sin(t * 0.9),
    armL: { e: [-124, -292 + 0.5 * fl], f: [-190, -322 + fl] }, armR: { e: [124, -292 - 0.5 * fl], f: [192, -318 - fl] },
    bob: 5 * Math.sin(t * 1.1), headRot: 0.03 * Math.sin(t * 0.8), headDY: -4 * jolt, headDX: 0,
  };
  applyCam(cam);
  const H = astroHero(cam, t, A);
  const EL = toScreen(cam, H.eyeL[0], H.eyeL[1]), ER = toScreen(cam, H.eyeR[0], H.eyeR[1]), K = cam.zoom, dir = [0.515, 0.857];
  if (t < c.flashes) { applyCam(cam); zzz(H.head[0] + 50, H.head[1] - 70, t, T0 - 0.6, 1 - ramp(t, c.flashes - 0.2, c.flashes), 0.6); }
  // his head, glass again: a ray through an eyeball, a flash, and the phone
  applyCam(cam);
  const ringing = t > c.same ? 0.55 + 0.45 * Math.abs(Math.sin(t * 9)) : 0, pick = ramp(t, c.ring4 + 0.1, c.ring4 + 0.2);
  if (xk > 0) dkXray(H.st, { k: xk, press: [0, 0], flash, mask: 1, ring: ringing, pick, mood: pick > 0.5 ? 'squint' : t > c.same ? 'worried' : 'calm', look: t > c.same ? [1, -0.2] : [0, 0.6] }, t);
  // flashes he sees with the mask on (before his head turns to glass)
  if (xk < 1) for (const [i, P] of [[0, EL], [1, ER]]) if (flash[i] > 0.03) phStar(P[0], P[1], 13 * K, i ? '#BFF0FF' : '#FFF3B0', clamp(flash[i] * 3), clamp(flash[i] * 1.6) * (1 - xk), 0.3 * i, 'star');
  for (const [t0, i, off] of RAYS) { const P = i ? ER : EL; cosmicRay(t, t0, [P[0] + off, P[1] - off * 0.2], dir, '#BFF0FF'); }
  // what they are, and how sure anyone is (the name sits by a ray's path, above his head)
  const ck = ramp(t, c.cosmic - 0.03, c.cosmic + 0.14) * (1 - ramp(t, c.zipping - 0.2, c.zipping - 0.05));
  const RP = [ER[0] - (ER[1] - 590) * dir[0] / dir[1], 590];                 // a point on the ray's line, above his head
  thinLeader([612, 548], [RP[0] + 14, RP[1]], ck >= 0.99 ? 1 : ck, '#C8A8FF'); pill(746, 540, 'COSMIC RAYS', '#C8A8FF', ck, 42);
  const hk = ramp(t, c.probably - 0.02, c.probably + 0.14) * (1 - ramp(t, c.zipping - 0.2, c.zipping - 0.05));
  tagPill('HOW? STILL DEBATED', 746, 612, '#FFD447', hk, 30);
  const PH0 = toScreen(cam, ...dkHeadPt(H.st, 50, -98));
  tagPill('RING! RING!', clamp(PH0[0] + 30, 560, 770), PH0[1] - 26, '#FFD447', ramp(t, c.same + 0.06, c.same + 0.2) * (1 - pick), 46);
  const zf = RAYS.reduce((m, r) => Math.max(m, bumpAt(t, r[0] + 0.02, 10)), 0);
  return { glow: 0.85, capY: t < c.zipping - 0.1 ? 1330 : 1470, flash: 0.22 * (1 - ramp(lt, 0, 0.12)) + 0.1 * zf };
};

// ================================================================ the button: gently
function buttonA(t) {
  const c = cu(), LOOP = c.loop;
  const ph = Math.PI * 2 * 1.5 * t, soft = 1 - ramp(t, c.thatphone - 0.2, c.thatphone + 0.1);
  const back = ramp(t, c.yawn - 0.05, LOOP, E.inOutSine);                     // on his way back to frame 1: both fists to his chin, a yawn
  let armR = { e: DK_ARM.softR.e, f: [DK_ARM.softR.f[0] + 1.6 * soft * Math.cos(ph), DK_ARM.softR.f[1] + 1.4 * soft * Math.sin(ph)] };
  armR = dkArmMix(armR, DK_ARM.chinR, back);
  const armL = dkArmMix(DK_ARM.deskL, DK_ARM.chinL, back);
  let face = { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 0.3, browTilt: 0.2, mouth: 'flat', mouthOpen: 1.6, blink: 1, cross: 0 };
  face = lerpFace(face, EF.tired, ramp(t, c.thatphone - 0.12, c.thatphone + 0.06));
  face = lerpFace(face, EF.dead, ramp(t, c.never - 0.05, c.never + 0.1));
  face = lerpFace(face, EF.yawn, back);
  if (face.mouth === 'yawn') face = { ...face, mouthOpen: Math.max(0.1, face.mouthOpen) };   // a yawn's mouth cannot be less than shut (a blend from a flat mouth passes through negative sizes)
  return {
    armL, armR, fistL: back > 0.02 ? { ang: -0.1 } : null, fistR: back > 0.5 ? { ang: 0.1 } : { knuckle: true, ang: 0.12 * soft * Math.sin(ph) }, face,
    bob: 1.4 * Math.sin(t * 2.6) * (1 - back), headRot: 0.03 * soft * (1 - back), headDY: 5 * back, headDX: 0, back,
  };
}
SC.button = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, A = buttonA(t), k0 = hookCam(-0.4);
  const cam = camKeys(lt, [[0, 540, 1076, 3.0], [c.thatphone - T0, 540, 1074, 3.2], [c.yawn - T0, 540, 1072, 3.3]], E.inOutSine);
  const b = E.inOutCubic(clamp((t - (c.yawn + 0.25)) / (c.loop - c.yawn - 0.25)));
  cam.x = lerp(cam.x, k0.x, b); cam.y = lerp(cam.y, k0.y, b); cam.zoom = lerp(cam.zoom, k0.zoom, b);
  dkRoom(cam, t, { dark: 0 });
  applyCam(cam);
  const H = dkHero(cam, t, A);
  applyCam(cam);
  dkDesk();
  // three small stars by his eye, in the pause
  const ER = toScreen(cam, H.eyeR[0], H.eyeR[1]), K = cam.zoom;
  [[62, -46, 15, '#FFD447'], [92, -6, 10, '#7FE9FF'], [70, 30, 8, '#C8A8FF']].forEach(([dx, dy, r, col], i) => {
    const f = c.twinkle + 0.08 * i, d = t - f;
    if (d >= 0 && d < 0.75) phStar(ER[0] + dx * K, ER[1] + dy * K, r * K, col, clamp(d / 0.1), 1 - ramp(d, 0.4, 0.75), 0.4 * i, 'star');
  });
  // the tag on his other eye
  const nk = ramp(t, c.never - 0.03, c.never + 0.14) * (1 - ramp(t, c.yawn + 0.1, c.yawn + 0.25)), EL = toScreen(cam, H.eyeL[0] - 12 * K, H.eyeL[1]);
  thinLeader([330, 694], EL, nk >= 0.99 ? 1 : nk, '#FFD447'); pill(256, 660, 'NO UPGRADES', '#FFD447', nk, 34);
  return { glow: 0.85, capY: 1150, flash: 0.22 * (1 - ramp(lt, 0, 0.12)) };
};

SC.loop = (lt, t, shot) => {
  const tt = t - TLd.duration, S = hookA(tt), cam = hookCam(tt);
  hookDraw(tt, t, { cam, S });
  return { glow: 0.85, flash: 0.2 * (1 - ramp(lt, 0, 0.1)) };
};

// ================================================================ the cover (rendered by src/cover.sh from a one-shot timeline)
SC.cover = (lt, t) => {
  const S = hookA(0.08), cam = { x: 540, y: 1094, zoom: 3.9, rot: 0 };
  S.starsK = 1; S.dark = 0.8;
  dkRoom(cam, 0.5, { dark: S.dark });
  applyCam(cam);
  const H = dkHero(cam, 0.5, { ...S.A, face: EF.wow });
  applyCam(cam);
  dkDesk();
  phField(1.3, 1, toScreen(cam, H.head[0], H.head[1]), starKeep(H, cam), { a: 1, spread: 0.8 });
  screenSpace();
  bigWord('SEEING', 540, 1196, 132, '#FFFFFF', 1, -0.03);
  bigWord('STARS?', 540, 1368, 228, '#FFD447', 1, -0.03);
  return { glow: 0.85, noCaptions: true };
};

setLights({ hook: DESK_LIGHT, loop: DESK_LIGHT, cover: DESK_LIGHT, button: DESK_LIGHT, sensors: INSIDE_LIGHT, squeeze: INSIDE_LIGHT, brain: { ...LIGHTS.screen, pool: 0.3, halo: 0 },
  newton: STUDY_LIGHT, dont: STUDY_LIGHT, astro: ORBIT_LIGHT });

function initScenes2() {
  initDesk();
  initStars();
  initPlaces();
}
