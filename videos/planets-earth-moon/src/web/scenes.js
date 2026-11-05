// Could Every PLANET Fit Between You and the Moon? 🌕 Short: the shots. Each SC.<id>(lt, t, shot) draws one frame
// (lt = seconds inside the shot, t = seconds in the video) and returns post options for main.js.
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
// The world (pe_world.js): the seven planets stacked from Earth up to the Moon at true scale, the Moon at its farthest;
// the hero in jupiter-no-ground's spacesuit with a jetpack, a cosmic-sized stand-in who handles planets like bowling balls.
'use strict';

const cu = () => TLd.cues;
const peShot = (id) => TLd.shots.find((s) => s.id === id);
const peSince = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);
const peHop = (t, t0, d = 0.32) => (t > t0 && t < t0 + d ? Math.sin(Math.PI * (t - t0) / d) : 0);   // one hop 0..1..0

// ---------------------------------------------------------------- the light of each place
// space: the Sun is low on the upper left (the key, warm), the blue of space behind (a cool rim from the right)
const PE_L = { key: [-0.62, -0.45, 0.64], keyTint: [1.08, 1.02, 0.92], shadowTint: [0.6, 0.64, 1.0], shadowDeep: 1.3,
  rimFrom: [0.85, -0.3], rim: [0.55, 0.72, 1.0], rimAmt: 1.2, pool: 0.22, poolTint: [0.4, 0.45, 0.85], halo: 0.06 };
setLights({ hook: PE_L, giants: PE_L, catch: PE_L, button: PE_L, cover: PE_L });

// ---------------------------------------------------------------- cameras
// a camera whose zoom eases in log space while x/y follow the view width (scale-trees' camLog): one move, not a race
function peCamLog(t, t0, t1, A, B, ease = E.inOutCubic) {
  const u = ease(inv(t0, t1, t)), z = Math.exp(lerp(Math.log(A.zoom), Math.log(B.zoom), u));
  const w = Math.abs(1 / B.zoom - 1 / A.zoom) < 1e-6 ? u : (1 / z - 1 / A.zoom) / (1 / B.zoom - 1 / A.zoom);
  return { x: lerp(A.x, B.x, w), y: lerp(A.y, B.y, w), zoom: z, rot: 0 };
}
const PE_CAM_HOOK = { x: 695, y: -1447, zoom: 3.65 };   // frame 0: his head at about (700, 990)
const PE_CAM_HOOK2 = { x: 621, y: -1473, zoom: 2.6 };  // on "the Moon?": up along Neptune to the Moon
const PE_CAM_FULL = { x: 600, y: -800, zoom: 0.64 };
const PE_CAM_GIANTS = { x: 607, y: -591, zoom: 0.9 };
const PE_CAM_RINGS = { x: 830, y: -1000, zoom: 1.25 };
const PE_CAM_TOP = { x: 690, y: -1618, zoom: 1.5 };
const PE_CAM_OUT = { x: 670, y: -1485, zoom: 1.75 };   // after the POP: in on the hero and Neptune asleep outside
const PE_OUT = [PE_X + 220, -1500];                     // where Neptune sleeps

// ---------------------------------------------------------------- the tower
// S: {moonY, wob, hop: {k: dy}, puff: {k: s}, faces: {k: mood | [mood, opts]}, nep: {dx, dy, sx, sy, rot, cap, capRot, out},
//     rings: {on, dx, dy, rot, spin, s}, bare, tan, ghost}
function peTower(cam, t, S) {
  applyCam(cam);
  const w = S.wob || 0;
  for (const c of [ctx, gctx]) { c.translate(PE_X, 0); c.rotate(w); c.translate(-PE_X, 0); }
  const pos = (k) => {
    if (k === 'moon') return [PE_X, S.moonY === undefined ? PE_MOON_FAR : S.moonY];
    let x = PE_X, y = PE_Y[k] - ((S.hop && S.hop[k]) || 0);
    if (k === 'neptune' && S.nep) { x += S.nep.dx || 0; y += S.nep.dy || 0; }
    return [x, y];
  };
  const face = (k, R, x, y) => {
    const f = S.faces && S.faces[k];
    if (!f || R * cam.zoom < 16) return;
    const [mood, o] = Array.isArray(f) ? f : [f, {}];
    peFace(x, y, R, mood, o);
  };
  const ring = S.rings || { on: 1 };
  const sat = pos('saturn'), Rs = PE_R.saturn;
  const rx = sat[0] + (ring.dx || 0), ry = sat[1] + (ring.dy || 0), rrot = PE_RING_ROT + (ring.rot || 0);
  if (ring.on > 0.01 && !ring.flying) peRings(rx, ry, Rs * (ring.s || 1), 'back', { rot: rrot });
  // the planets, bottom up
  const E0 = pos('earth');
  peGlobe(PE_TEX.earth, E0[0], E0[1], PE_R.earth);
  for (const k of PE_ORDER) {
    if (k === 'neptune' && S.nep && S.nep.hide) continue;
    const [x, y] = pos(k), R = PE_R[k] * ((S.puff && S.puff[k]) || 1);
    if (k === 'neptune' && S.nep) {
      const n = S.nep;
      peGlobe(PE_TEX.neptune, x, y, R, { sx: n.sx || 1, sy: n.sy || 1, rot: n.rot || 0 });
      face(k, R * Math.min(n.sx || 1, 1.15), x, y + R * (1 - (n.sy || 1)) * 0.25);
      continue;
    }
    if (k === 'saturn') {
      peGlobe(S.bare ? PE_TEX.saturnBare : PE_TEX.saturn, x, y, R, { sy: 0.93 });
      if (S.tan > 0.01) paint(() => {          // the tan line where the rings were
        ctx.save(); ctx.translate(x, y); ctx.rotate(PE_RING_ROT);
        ctx.beginPath(); ctx.ellipse(0, 0, R * 0.985, R * 0.985 * Math.sin(PE_EL), 0, 0.02, Math.PI - 0.02);
        ctx.lineWidth = R * 0.075; ctx.strokeStyle = `rgba(255,246,222,${0.85 * S.tan})`; ctx.stroke(); ctx.restore();
      });
      face(k, R, x, y);
      continue;
    }
    const img = PE_TEX[k];
    peGlobe(img, x, y, R);
    face(k, R, x, y);
  }
  if (ring.on > 0.01) {
    if (ring.flying) peRings(rx, ry, Rs * (ring.s || 1), 'all', { rot: rrot + (ring.spin || 0) });
    else peRings(rx, ry, Rs * (ring.s || 1), 'front', { rot: rrot });
  }
  // the Moon (moonlight in the glow layer)
  const M = pos('moon');
  softDot(gctx, M[0], M[1], PE_R.moon * 3.2, '#DDE6FF', 0.55);
  peGlobe(PE_TEX.moon, M[0], M[1], PE_R.moon, { occ: false });
  if (S.nep && S.nep.cap > 0.01 && !S.nep.hide) {
    const [x, y] = pos('neptune'), n = S.nep;
    peNightcap(x, y - PE_R.neptune * ((n.sy || 1) - 1), PE_R.neptune, n.cap, t, { rot: (n.rot || 0) + (n.capRot || 0) });
  }
  return { pos, rings: { x: rx, y: ry, rot: rrot } };
}
// where the outer edge of Saturn's rings is at ring angle phi (0 = the tip on the major axis), world
function peRingPoint(rx, ry, rot, phi, R = PE_R.saturn) {
  const a = SB_RING.outer * R, b = a * Math.sin(PE_EL);
  const lx = a * Math.cos(phi), ly = b * Math.sin(phi);
  return [rx + lx * Math.cos(rot) - ly * Math.sin(rot), ry + lx * Math.sin(rot) + ly * Math.cos(rot)];
}
// how squashed Neptune is under a Moon at moonY (sitting on Uranus): {sy, sx, cy}
function peSqueeze(moonY) {
  const top = PE_Y.uranus - PE_R.uranus, room = top - (moonY + PE_R.moon), d = 2 * PE_R.neptune;
  if (room >= d) return { sy: 1, sx: 1, dy: 0 };
  const sy = room / d, sx = 1 / Math.sqrt(sy);
  return { sy, sx, dy: (top - room / 2) - PE_Y.neptune };
}

// ---------------------------------------------------------------- the hero
const PE_S = 0.55;                                       // his size against the planets (a cosmic stand-in)
const PF = {
  strain: Object.assign({}, FACES.nervous, { lookX: -1, lookY: -0.2, blink: 0.7, eyeOpen: 0.9, browY: 1.0, browTilt: 1.2, mouth: 'grimace', mouthOpen: 0.95 }),
  phew: Object.assign({}, FACES.grin, { lookX: -0.6, lookY: -0.1, blink: 0.35, mouthOpen: 0.5, browY: 0.6, browTilt: -0.2 }),
  proud: Object.assign({}, FACES.grin, { lookX: -0.5, lookY: 0.3, mouthOpen: 0.75, browY: 0.7, browTilt: -0.3 }),
  uhoh: Object.assign({}, FACES.nervous, { lookX: -0.8, lookY: 0.2, browY: 0.9, browTilt: 0.9, mouth: 'wavy', mouthOpen: 0.4 }),
  sly: Object.assign({}, FACES.grin, { lookX: -0.9, lookY: 0.4, mouthOpen: 0.45, browY: 0.4, browTilt: -0.45 }),
  tug: Object.assign({}, FACES.nervous, { lookX: -1, lookY: 0.6, blink: 0.55, browY: 0.9, browTilt: 1.1, mouth: 'grimace', mouthOpen: 0.9 }),
  oops: Object.assign({}, FACES.startled, { lookX: 0.7, lookY: -0.6, mouth: 'o', mouthOpen: 0.7, eyeOpen: 1.3 }),
  down: Object.assign({}, FACES.calm, { lookX: 0, lookY: 1, mouth: 'flat', mouthOpen: 0.15, browY: 0.4 }),
  meh: Object.assign({}, FACES.annoyed, { lookX: 0, lookY: 0.1, blink: 0.42, browTilt: -0.3, browY: -0.2, mouth: 'flat', mouthOpen: 0 }),
  whee: Object.assign({}, FACES.startled, { lookX: 0, lookY: 0.8, mouth: 'o', mouthOpen: 0.9, eyeOpen: 1.3, browY: 1.3 }),
  look: Object.assign({}, FACES.calm, { lookX: 1, lookY: 0.5, mouth: 'o', mouthOpen: 0.35, browY: 0.7 }),
  oh: Object.assign({}, FACES.startled, { lookX: -0.9, lookY: 0.9, mouth: 'o', mouthOpen: 0.7, eyeOpen: 1.3, browY: 1.2 }),
  shrug: Object.assign({}, FACES.calm, { lookX: 0.6, lookY: 0.5, blink: 0.3, mouth: 'flat', mouthOpen: 0.1, browY: 0.8, browTilt: -0.4 }),
};
function peFaceAt(keys, t) {                             // keys: [[t, face]...], 0.12 s blends
  let f = keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t >= keys[i][0]) f = lerpFace(keys[i - 1][1], keys[i][1], clamp((t - keys[i][0]) / 0.12));
  return f;
}
// a world point -> his rig-local coordinates (feet at (x, y), scale s, turned rot about his middle)
function peLocal(x, y, s, rot, P) {
  const mid = [x, y - 300 * s], vx = P[0] - mid[0], vy = P[1] - mid[1], c = Math.cos(-rot), sn = Math.sin(-rot);
  return [(mid[0] + vx * c - vy * sn - x) / s, (mid[1] + vx * sn + vy * c - y) / s];
}
// the feet that put rig-local point p at world point P for a turn rot
function peFeetFor(p, P, s, rot) {
  const v = [p[0] * s, (p[1] + 300) * s], c = Math.cos(rot), sn = Math.sin(rot);
  const mid = [P[0] - (v[0] * c - v[1] * sn), P[1] - (v[0] * sn + v[1] * c)];
  return [mid[0], mid[1] + 300 * s];
}
// H: {x, y, rot, face, pose, armL, armR, handL, handR, thrust, tape: {case: 'L'|'R'}, post}
function peHero(cam, t, H) {
  const pose = JSON.parse(JSON.stringify(H.pose || JP_POSE.float));
  pose.lean = H.lean || 0;
  return jpHero(cam, t, {
    x: H.x, y: H.y, s: PE_S, rot: H.rot || 0, face: H.face || PF.phew, pose, headRot: H.headRot || 0,
    armL: H.armL, armR: H.armR, handL: H.handL || 'open', handR: H.handR || 'open', sweat: H.sweat || 0,
    pre: (lc, rr) => peJetpack(lc, rr, H.thrust || 0, t),
    post: (lc, rr, st, ps) => {
      if (H.tape) { const sd = H.tape.side || 'L', w = rr['wr' + sd], d = rr['armDir' + sd]; peTapeCase(lc, [w[0] + d[0] * 22, w[1] + d[1] * 22], 1.1); }
      if (H.post) H.post(lc, rr, st, ps);
    },
  });
}
// the jetpack's glow in the glow layer (world), at his shoulders
function peJetGlow(hr, thrust) {
  if (thrust < 0.05) return;
  for (const sx of [-70, 70]) { const p = hr.wp([sx, -150]); softDot(gctx, p[0], p[1], 34 * thrust, '#FFB060', 0.6 * thrust); }
}

// ---------------------------------------------------------------- the hook: the shove, the click, the pull-back
// Neptune's slide into its slot (valid at negative time: the loop shows him shoving a moment before frame 0)
function peNepSlide(t) {
  const c = cu(), t0 = -0.9, p = clamp((t - t0) / (c.click - t0));
  const stair = p - Math.sin(2 * Math.PI * 3 * p) / (2 * Math.PI * 3);       // three shoves, a stop after each
  if (t < c.click) return 52 * (1 - stair);
  return -4 * Math.exp(-(t - c.click) * 9) * Math.sin((t - c.click) * 30);   // the click: a small knock and settle
}
function peHookCam(t) {
  const c = cu();
  const shove = t < c.click ? Math.sin(t * 2 * Math.PI * 3 / (c.click + 0.9)) : 0;
  const up = ramp(t, c.moon_w - 0.45, c.q_end + 0.1, E.inOutCubic);
  const k = { x: lerp(PE_CAM_HOOK.x, PE_CAM_HOOK2.x, up) - 6 * ramp(t, -1, 0.5), y: lerp(PE_CAM_HOOK.y, PE_CAM_HOOK2.y, up) + 1.5 * shove,
    zoom: Math.exp(lerp(Math.log(PE_CAM_HOOK.zoom), Math.log(PE_CAM_HOOK2.zoom), up)) * (1 + 0.025 * ramp(t, -1, c.moon_w - 0.45, E.inOutSine)) };
  const knock = t >= c.click ? peSince(t, c.click, 14) * 7 : 0;
  k.x += knock * Math.sin((t - c.click) * 80);
  if (t < c.pull0) return k;
  return peCamLog(t, c.pull0, c.pull1, k, PE_CAM_FULL);
}
function peHookTower(t) {
  const c = cu();
  const dx = peNepSlide(t);
  const capOff = t >= c.click ? clamp((t - c.click) / 0.9) : 0;
  const hop = {};
  PE_ORDER.forEach((k, i) => { hop[k] = 40 * peHop(t, c.side0 - 0.05 + i * 0.13, 0.3); });
  const wt = t - c.barely - 0.05;
  const wob = wt > 0 ? 0.045 * Math.sin(wt * 13) * Math.exp(-wt * 2.6) : 0;
  const worried = t >= c.barely + 0.05 && t < c.barely + 1.2;
  const turn = { dx: 0.3 * (1 - ramp(t, c.click + 0.3, c.click + 0.8)), k: 0.86, look: [0.9, 0.1] };
  const nepMood = t < c.click ? ['grumpy', turn] : t < c.click + 0.5 ? ['eek', turn] : worried ? ['worried', { sweat: 1 }] : 'grumpy';
  const faces = { jupiter: worried ? 'worried' : 'happy', saturn: worried ? 'eek' : 'smug', uranus: worried ? 'worried' : 'happy', neptune: nepMood };
  return { moonY: PE_MOON_FAR, wob, hop, faces, nep: { dx, cap: t < c.click ? 1 : 0, capRot: 0 }, rings: { on: 1 }, capOff };
}
// the nightcap that pops off at the click and drifts away
function peCapAway(t, base) {
  const c = cu(), u = t - c.click;
  if (u < 0 || u > 2.2) return;
  const x = base[0] + 120 * u + 20 * u * u, y = base[1] - 210 * u + 30 * u * u;
  peNightcap(x, y + PE_R.neptune * 0.86, PE_R.neptune, 1, t, { rot: 1.4 * u });
}
function peHookHero(cam, t, T) {
  const c = cu(), dx = T.nep.dx;
  const C = [PE_X + dx + PE_R.neptune * Math.cos(0.08), PE_Y.neptune + PE_R.neptune * Math.sin(0.08)];
  const relax = ramp(t, c.click + 0.05, c.click + 0.7, E.outCubic);
  const rot = lerp(-1.02, -0.2, relax) + (t < c.click ? 0.03 * Math.sin(t * 2 * Math.PI * 3 / (c.click + 0.9)) : 0);
  const pushP = [0, -588];
  let [x, y] = peFeetFor(pushP, C, PE_S, rot);
  // after the click he drifts back to float beside Neptune, then reaches to steady the wobble
  const back = ramp(t, c.click + 0.05, c.click + 0.9, E.outCubic);
  x += 70 * back; y += -40 * back;
  const steady = ramp(t, c.barely + 0.12, c.barely + 0.35, E.outBack) * (1 - ramp(t, c.barely + 1.1, c.barely + 1.5));
  const armsUp = { L: { e: [-112, -462], w: [-54, -556] }, R: { e: [112, -462], w: [54, -556] } };
  const armsDown = { L: { e: [-118, -300], w: [-108, -210] }, R: { e: [118, -300], w: [110, -212] } };
  const mix = (a, b, k) => ({ e: [lerp(a.e[0], b.e[0], k), lerp(a.e[1], b.e[1], k)], w: [lerp(a.w[0], b.w[0], k), lerp(a.w[1], b.w[1], k)] });
  let armL = mix(armsUp.L, armsDown.L, relax), armR = mix(armsUp.R, armsDown.R, relax);
  if (steady > 0.01) {                                  // one finger on Neptune's side
    const tgt = peLocal(x, y, PE_S, rot, [PE_X + PE_R.neptune + 4, PE_Y.neptune + 30]);
    armL = mix(armL, { e: [lerp(-118, tgt[0], 0.5) - 20, lerp(-300, tgt[1], 0.5)], w: [tgt[0] + 26, tgt[1]] }, steady);
  }
  const face = peFaceAt([[-5, PF.strain], [c.click + 0.08, PF.oops], [c.click + 0.45, PF.phew], [c.pull1 - 0.3, PF.proud], [c.barely, PF.uhoh], [c.barely + 1.0, PF.phew]], t);
  const thrust = t < c.click ? 0.85 + 0.15 * Math.sin(t * 9) : 0.25 * peSince(t, c.click, 4);
  const hr = peHero(cam, t, { x, y, rot, face, armL, armR, handL: steady > 0.5 ? 'point' : 'spread', handR: 'spread', thrust, sweat: t < c.click ? 0.8 : 0 });
  peJetGlow(hr, thrust);
  return hr;
}
function peHookDraw(t) {
  const c = cu(), cam = peHookCam(t);
  { const u = ramp(t, cu().pull0, cu().pull1, E.inOutSine); peSpace(cam, t, [lerp(60, 118, u), lerp(330, 560, u)], 24); }
  const T = peHookTower(t);
  peTower(cam, t, T);
  applyCam(cam);
  peCapAway(t, [PE_X, PE_Y.neptune - PE_R.neptune * 0.86]);
  peHookHero(cam, t, T);
  // labels: MOON (on the word), then MOON and YOU on the whole tower
  const M = toScreen(cam, PE_X, PE_MOON_FAR), Ea = toScreen(cam, PE_X, 0);
  const kMoon = popK(t, c.moon_w - 0.05, c.click - 0.05);
  if (kMoon > 0) { peTag(M[0] + 110, M[1] - 10, 'MOON', '#DDE6FF', kMoon, 40); thinLeader([M[0] + 52, M[1] - 6], [M[0] + 14, M[1]], kMoon, '#DDE6FF'); }
  const kFull = popK(t, c.fit - 0.1, 99) * ramp(t, c.fit - 0.1, c.fit + 0.2);
  if (kFull > 0) {
    peTag(M[0] + 120, M[1] - 4, 'MOON', '#DDE6FF', kFull, 36); thinLeader([M[0] + 64, M[1] - 2], [M[0] + 10, M[1]], kFull, '#DDE6FF');
    peTag(Ea[0] + 128, Ea[1] + 4, 'YOU', '#FFD447', kFull, 40); thinLeader([Ea[0] + 78, Ea[1] + 2], [Ea[0] + 16, Ea[1]], kFull, '#FFD447');
  }
  // the CLICK: a little burst where Neptune meets the slot
  const kc = popK(t, c.click, c.click + 0.28, 0.04, 0.12);
  if (kc > 0) { const P = toScreen(cam, PE_X + PE_R.neptune * 0.15, PE_Y.neptune + PE_R.neptune * 0.98); shockLines(P[0], P[1], 120, kc, 9, '#BFF0FF', 4); }
  return cam;
}
SC.hook = (lt, t) => {
  const c = cu();
  peHookDraw(t);
  const kick = peSince(t, c.click, 10);
  return { glow: 0.85, push: { k: 1 + 0.018 * kick, cx: 540, cy: 900 }, zblur: 0.08 * ramp(t, c.pull0, c.pull0 + 0.4) * (1 - ramp(t, c.pull1 - 0.6, c.pull1)) };
};

// ---------------------------------------------------------------- the giants: 2/3 of the gap, then the rings come OFF
function peGiantsCam(t) {
  const c = cu(), sh = peShot('giants');
  let cam = peCamLog(t, sh.start, c.hog - 0.1, PE_CAM_FULL, PE_CAM_GIANTS);
  if (t > c.and2 - 0.25) cam = peCamLog(t, c.and2 - 0.25, c.take, PE_CAM_GIANTS, PE_CAM_RINGS);
  cam.zoom *= 1 + 0.03 * ramp(t, c.take, sh.end, E.inOutSine);
  cam.x -= 75 * ramp(t, c.off + 0.1, c.off + 0.6, E.inOutCubic);     // after the yank: back toward Saturn's red face
  const yank = peSince(t, c.off + 0.05, 12) * (t > c.off ? 9 : 0);
  cam.x += yank * Math.sin((t - c.off) * 70);
  return cam;
}
function peGiantsDraw(t) {
  const c = cu(), cam = peGiantsCam(t);
  peSpace(cam, t);
  const puffK = ramp(t, c.hog, c.hog + 0.22, E.outBack) * (1 - ramp(t, c.and2 - 0.2, c.and2 + 0.2));
  const pierced = t >= c.and2 && t < c.off + 0.25;
  const offU = t - c.off - 0.06;
  const ringsGone = offU > 0;
  const faces = {
    jupiter: pierced ? ['side', { look: [0.9, -0.7] }] : ringsGone ? 'happy' : t >= c.jup ? 'smug' : 'happy',
    saturn: ringsGone ? ['blush', {}] : t >= c.sat1 ? 'proud' : 'happy',
    uranus: pierced ? ['side', { look: [0.9, 0.8] }] : ringsGone ? 'happy' : 'grumpy',
    neptune: 'grumpy', mars: 'worried', venus: 'worried',
  };
  let rings = { on: 1 };
  if (ringsGone) {
    const u = offU, sp = u * u;                          // a yank, then a frisbee throw off to the upper right
    rings = { on: 1, flying: true, dx: 300 * u + 2400 * sp, dy: -220 * u - 1500 * sp, spin: -2.6 * u - 6 * sp, s: 1 - 0.35 * clamp(u / 0.8) };
  } else if (t > c.off - 0.18) {
    const u = clamp((t - (c.off - 0.18)) / 0.24);          // the tug before the yank
    rings = { on: 1, dx: 22 * E.outCubic(u), dy: -16 * E.outCubic(u) };
  }
  const T = { moonY: PE_MOON_FAR, faces, puff: { jupiter: 1 + 0.045 * puffK, saturn: 1 + 0.045 * puffK }, nep: { dx: 0 }, rings, bare: ringsGone, tan: ringsGone ? 1 : 0 };
  const tw = peTower(cam, t, T);
  const sh = peShot('giants');
  // the tape: its case in his raised LEFT hand at Saturn's top right, its hook pulled down to Jupiter's bottom
  const tapeX = PE_X + PE_R.jupiter + 12;
  const satTop = [tapeX, PE_Y.saturn - PE_R.saturn * 0.93 - 4];
  const tapeBot = [tapeX, PE_Y.jupiter + PE_R.jupiter];
  const L0 = { e: [-176, -430], w: [-128, -552] }, R0 = { e: [128, -316], w: [150, -238] };
  const caseRig = [-140, -578];
  const feetTape = peFeetFor(caseRig, satTop, PE_S, 0.06);
  // ... then to the rings' right edge on "take", both fists on it, a tug and the YANK on "OFF"
  const grabP = peRingPoint(PE_X, PE_Y.saturn, PE_RING_ROT, 0.42);
  const tug = ramp(t, c.off - 0.18, c.off + 0.06, E.outCubic);
  const tipRot = 0.12 + 0.3 * tug;
  const grab = [-30, -420];
  const feetTip = peFeetFor(grab, [grabP[0] + 22 * tug, grabP[1] - 16 * tug], PE_S, tipRot);
  const arrive = ramp(t, sh.start, c.jup + 0.5, E.outCubic);
  const fromUp = [feetTape[0] + 420, feetTape[1] - 640];
  const toTip = ramp(t, c.and2, c.take + 0.05, E.inOutCubic);
  let hx = lerp(lerp(fromUp[0], feetTape[0], arrive), feetTip[0], toTip), hy = lerp(lerp(fromUp[1], feetTape[1], arrive), feetTip[1], toTip);
  let rot = lerp(0.06, tipRot, toTip);
  const mix = (a, b, k) => ({ e: [lerp(a.e[0], b.e[0], k), lerp(a.e[1], b.e[1], k)], w: [lerp(a.w[0], b.w[0], k), lerp(a.w[1], b.w[1], k)] });
  const LT = { e: [-120, -380], w: [-60, -428] }, RT = { e: [80, -360], w: [0, -412] };
  let armL = mix(L0, LT, toTip), armR = mix(R0, RT, toTip);
  if (ringsGone) {                                       // the throw's follow-through: arms up and out, a little spin back
    const u = clamp(offU / 0.35), v = clamp(offU / 0.9);
    armL = mix(LT, { e: [-150, -420], w: [-150, -560] }, u); armR = mix(RT, { e: [150, -420], w: [196, -540] }, u);
    rot = tipRot - 0.45 * E.outBack(v); hx = feetTip[0] - 30 * E.outCubic(v); hy = feetTip[1] - 20 * E.outCubic(v);
  }
  const face = peFaceAt([[-5, PF.phew], [c.jup, PF.sly], [c.thirds, PF.proud], [c.and2, PF.down], [c.rings - 0.1, PF.tug], [c.off + 0.06, PF.oops], [c.off + 0.6, PF.proud]], t);
  const thrust = 0.6 * (1 - arrive) + 0.6 * ramp(t, c.and2, c.and2 + 0.2) * (1 - ramp(t, c.take - 0.1, c.take + 0.2)) + 0.5 * clamp(1 - Math.abs(t - c.off) / 0.4);
  const tapeK = ramp(t, c.hog - 0.05, c.thirds + 0.12, E.inOutCubic) * (1 - ramp(t, c.and2 - 0.1, c.and2 + 0.12, E.inCubic));
  applyCam(cam);
  if (tapeK > 0.01) peTape(satTop, tapeBot, tapeK, 50, cam.zoom);
  const hr = peHero(cam, t, { x: hx, y: hy, rot, face, armL, armR, handL: toTip > 0.5 && !ringsGone ? 'fist' : 'open', handR: toTip > 0.5 && !ringsGone ? 'fist' : 'open', thrust, tape: toTip < 0.5 && t < c.and2 + 0.1 ? { side: 'L' } : null });
  peJetGlow(hr, thrust);
  // 2/3: a big figure beside the tape
  const k23 = ramp(t, c.thirds - 0.04, c.thirds + 0.24, E.outBack) * (1 - ramp(t, c.and2 - 0.25, c.and2 - 0.05, E.inCubic));
  if (k23 > 0.01) {
    const top = toScreen(cam, satTop[0], satTop[1]), bot = toScreen(cam, tapeBot[0], tapeBot[1]);
    screenSpace(); bigWord('2/3', top[0] + 132, (top[1] + bot[1]) / 2 + 30, 150, '#FFD447', k23, -0.06);
  }
  return cam;
}
SC.giants = (lt, t) => {
  const c = cu();
  peGiantsDraw(t);
  return { glow: 0.85, zblur: 0.05 * peSince(t, c.off + 0.06, 8) };
};

// ---------------------------------------------------------------- the catch: the Moon has to be FAR, and it swings
function peMoonPath(t) {
  const c = cu();
  // in and out on "in and out every month": down to a squeeze, back up; the button brings it all the way in
  const down = ramp(t, c.inout - 0.05, c.out1 + 0.05, E.inOutSine), up = ramp(t, c.out1 + 0.12, c.month_end + 0.1, E.inOutSine);
  const deep = PE_MOON_FAR + 120 * (down - up);
  if (t < c.so + 0.05) return deep;
  // the close night: down slowly into Neptune, then (after the POP) all the way in with a bounce
  const pre = PE_MOON_FAR + 128 * ramp(t, c.so + 0.05, c.pop, E.inCubic);
  if (t < c.pop) return pre;
  return lerp(pre, PE_MOON_CLOSE, E.outBounce(clamp((t - c.pop) / 0.42)));
}
function peTopDraw(t, cam, o = {}) {
  const c = cu();
  peSpace(cam, t, [70, 330], 22);
  const moonY = peMoonPath(t);
  const sq = peSqueeze(moonY);
  const popped = t >= c.pop;
  // Neptune: squeezed, then POP out to the right, then asleep outside where its ghost stood
  let nep = { dx: 0, dy: sq.dy, sx: sq.sx, sy: sq.sy, cap: 0 };
  const out = PE_OUT;
  if (popped) {
    const u = clamp((t - c.pop) / 0.55), e = E.outCubic(u);
    const spin = (1 - e) * 3.2;
    const st = 1 - 0.25 * Math.exp(-(t - c.pop) * 10) * Math.cos((t - c.pop) * 34);
    nep = { dx: lerp(0, out[0] - PE_X, e), dy: lerp(sq.dy, out[1] - PE_Y.neptune, e) - 120 * Math.sin(Math.PI * u) * (1 - u), sx: 2 - st, sy: st, rot: spin,
      cap: ramp(t, c.sleeps - 0.08, c.sleeps + 0.12, E.outBack), capRot: -0.25 };
  }
  const squeezing = !popped && sq.sy < 0.99;
  const dangerSwing = t >= c.whole && t < c.so;
  const nepFace = popped ? (t >= c.sleeps - 0.05 ? ['sleep', {}] : ['eek', {}]) : squeezing ? ['squeeze', { sweat: 1 }] : dangerSwing ? ['eek', { look: [0.9, -0.2], sweat: ramp(t, c.nep, c.nep + 0.2) }] : 'grumpy';
  const faces = { neptune: nepFace, uranus: squeezing || (popped && t < c.pop + 0.35) ? 'worried' : popped ? null : 'happy' };   // its face would sit under the captions once the camera moves in
  const T = { moonY, faces, nep, rings: { on: 0 }, bare: true, tan: 1 };
  if (popped && t > c.sleeps - 0.1) { applyCam(cam); pePillow(out[0] - 4, out[1] + PE_R.neptune * 0.9, 112, ramp(t, c.sleeps - 0.1, c.sleeps + 0.12, E.outBack)); }
  const tw = peTower(cam, t, T);
  if (popped && t > c.sleeps) { screenSpace(); const Z = toScreen(cam, out[0] + 60, out[1] - 70); zzz(Z[0], Z[1], t, c.sleeps + 0.15, 1, 0.8); }
  applyCam(cam);
  return { moonY, tw };
}
function peTopHero(cam, t, moonY) {
  const c = cu();
  const feet = [PE_X - 2, moonY - PE_R.moon - 1];
  const ride = Math.abs(peMoonPath(t + 0.04) - peMoonPath(t - 0.04)) / 0.08;      // how fast the Moon moves (world/s)
  const wind = clamp(ride / 220);
  let armL = { e: [-150, -310], w: [-118, -228] }, armR = { e: [150, -310], w: [118, -228] };
  const brow = ramp(t, c.one - 0.1, c.one + 0.15, E.outBack) * (1 - ramp(t, c.moon2 - 0.1, c.moon2 + 0.1));
  if (brow > 0.01) armR = { e: [lerp(150, 120, brow), lerp(-310, -420, brow)], w: [lerp(118, 40, brow), lerp(-228, -520, brow)] };
  const thumb = ramp(t, c.far - 0.05, c.far + 0.15, E.outBack) * (1 - ramp(t, c.drifts - 0.1, c.drifts + 0.1));
  if (thumb > 0.01) armL = { e: [lerp(-150, -170, thumb), lerp(-310, -400, thumb)], w: [lerp(-118, -190, thumb), lerp(-228, -500, thumb)] };
  if (wind > 0.02) {                                   // arms windmilling while it moves
    const ph = t * 11;
    armL = { e: [-150 - 40 * wind, -330 - 60 * wind * Math.sin(ph)], w: [-200 * wind - 118 * (1 - wind), -420 * wind + 120 * wind * Math.sin(ph + 1) - 228 * (1 - wind)] };
    armR = { e: [150 + 40 * wind, -330 - 60 * wind * Math.cos(ph)], w: [200 * wind + 118 * (1 - wind), -420 * wind + 120 * wind * Math.cos(ph + 1) - 228 * (1 - wind)] };
  }
  const shrug = ramp(t, c.outside - 0.05, c.outside + 0.15, E.outBack);
  if (shrug > 0.01 && t < c.loop) { armL = { e: [-170, -330], w: [-230, -400 + 20 * (1 - shrug)] }; armR = { e: [170, -330], w: [230, -400 + 20 * (1 - shrug)] }; }
  const face = peFaceAt([[-5, PF.down], [c.one + 0.1, PF.down], [c.moon2, PF.meh], [c.far, PF.proud], [c.drifts, PF.whee], [c.out1 + 0.1, PF.meh],
    [c.whole, PF.look], [c.nep, PF.oh], [c.so, PF.down], [c.pop - 0.02, PF.oops], [c.nep2, PF.look], [c.outside, PF.shrug]], t);
  const lean = 0.06 * Math.sin(t * 2.3) + (wind > 0 ? 0.08 * Math.sin(t * 9) * wind : 0) + (t > c.pop ? 0.18 * peSince(t, c.pop + 0.05, 5) * Math.sin((t - c.pop) * 20) : 0);
  const pose = JSON.parse(JSON.stringify(POSES.stand)); pose.hipY = -222;
  const hop = t > c.pop ? 30 * Math.abs(Math.sin((t - c.pop) * 9)) * peSince(t, c.pop + 0.1, 4) : 0;
  return peHero(cam, t, { x: feet[0], y: feet[1] - hop, rot: lean, face, pose, armL, armR, handL: thumb > 0.5 ? 'fist' : 'open', handR: 'open', thrust: 0 });
}
function peTopCam(t) {
  const c = cu(), sh = peShot('catch');
  const k = 1 + 0.05 * ramp(t, sh.start, c.so, E.inOutSine);
  let cam = { x: PE_CAM_TOP.x, y: PE_CAM_TOP.y + 20 * ramp(t, c.so, c.pop, E.inOutSine), zoom: PE_CAM_TOP.zoom * k, rot: 0 };
  if (t > c.pop + 0.2) cam = peCamLog(t, c.pop + 0.2, c.outside + 0.15, cam, PE_CAM_OUT);
  const thud = t > c.pop ? peSince(t, c.pop + 0.3, 10) * 10 : 0;
  cam.y += thud * Math.sin((t - c.pop) * 50);
  return cam;
}
SC.catch = (lt, t) => {
  const c = cu(), cam = peTopCam(t);
  const { moonY } = peTopDraw(t, cam);
  peTopHero(cam, t, moonY);
  // FAR: the gap above Neptune, ticked
  const M = toScreen(cam, PE_X, PE_MOON_FAR);
  const kMoon = popK(t, c.moon2 - 0.06, c.far - 0.06);
  if (kMoon > 0) { peTag(M[0] + 150, M[1] - 6, 'MOON', '#DDE6FF', kMoon, 40); thinLeader([M[0] + 92, M[1] - 4], [M[0] + 14, M[1]], kMoon, '#DDE6FF'); }
  const kFar = popK(t, c.far - 0.06, c.drifts - 0.05);
  if (kFar > 0) {
    const nt = toScreen(cam, PE_X, PE_Y.neptune - PE_R.neptune);
    peTag(M[0] + 160, M[1] - 10, 'FAR ↑', '#7FE9FF', kFar, 50);
    peBracket(M[0] + 44, M[1] + 4, nt[1] - 2, -1, '#4DFFB4', kFar, 5);
  }
  // the swing, bracketed, and a whole Neptune beside it
  const fb = toScreen(cam, PE_X, PE_MOON_FAR + PE_R.moon), cb = toScreen(cam, PE_X, PE_MOON_CLOSE + PE_R.moon);
  const bx = toScreen(cam, PE_X + PE_R.neptune + 30, 0)[0];
  const kB = ramp(t, c.by - 0.05, c.by + 0.35, E.outCubic) * (1 - ramp(t, c.so + 0.2, c.so + 0.45));
  if (kB > 0.01) {
    screenSpace();
    paint(() => { ctx.setLineDash([10, 10]); line(ctx, fb[0] + 26, fb[1], bx - 4, fb[1], 3, 'rgba(127,233,255,0.75)'); line(ctx, cb[0] + 120, cb[1], bx - 4, cb[1], 3, 'rgba(127,233,255,0.75)'); ctx.setLineDash([]); });
    peBracket(bx, fb[1], cb[1], 1, '#7FE9FF', kB, 7);
  }
  const kG = ramp(t, c.whole - 0.08, c.whole + 0.42, E.outBack) * (1 - ramp(t, c.so - 0.1, c.so + 0.15, E.inCubic));
  if (kG > 0.01) {
    const gx = PE_X + PE_R.neptune + 30 + 34 + PE_R.neptune, gy = (PE_MOON_FAR + PE_MOON_CLOSE) / 2 + PE_R.moon;
    const slide = (1 - E.outCubic(clamp((t - c.whole + 0.08) / 0.4))) * 180;
    applyCam(cam);
    paint(() => {
      ctx.save(); ctx.globalAlpha = 0.9;
      ctx.translate(gx + slide, gy);
      ctx.beginPath(); ctx.arc(0, 0, PE_R.neptune, 0, 7); ctx.fillStyle = 'rgba(70,120,230,0.32)'; ctx.fill();
      ctx.setLineDash([16 / cam.zoom, 12 / cam.zoom]); ctx.lineWidth = 5 / cam.zoom; ctx.strokeStyle = '#9FC2FF'; ctx.stroke(); ctx.setLineDash([]);
      ctx.restore();
    });
    peFace(gx + slide, gy, PE_R.neptune * 0.9, 'smug', { lidCol: 'rgba(60,90,180,0.5)' });
    const G = toScreen(cam, gx + slide, gy - PE_R.neptune);
    peTag(G[0], G[1] - 50, '= 1 NEPTUNE', '#9FC2FF', ramp(t, c.nep - 0.05, c.nep + 0.2, E.outCubic), 40);
  }
  return { glow: 0.85, push: { k: 1 + 0.02 * ramp(lt, 0, 8), cx: 400, cy: 1000 } };
};

// ---------------------------------------------------------------- the button: a close night, the POP, asleep outside
SC.button = (lt, t, shot) => {
  const c = cu();
  if (t >= c.loop) {                                     // the loop: the hook's own drawing a moment before frame 0
    peHookDraw(t - TLd.duration);
    return { glow: 0.85 };
  }
  const cam = peTopCam(t);
  const { moonY } = peTopDraw(t, cam);
  peTopHero(cam, t, moonY);
  const kp = popK(t, c.pop, c.pop + 0.3, 0.04, 0.14);
  if (kp > 0) { const P = toScreen(cam, PE_X + PE_R.neptune * 0.7, PE_Y.neptune - 20); shockLines(P[0], P[1], 150, kp, 11, '#FFFFFF', 7); }
  return { glow: 0.85, push: { k: 1.02 + 0.03 * ramp(lt, 0, shot.end - shot.start), cx: 420, cy: 1050 } };
};

// ---------------------------------------------------------------- the cover: the whole tower, ALL 7 FIT?
SC.cover = (lt, t) => {
  const cam = { x: 585, y: -1395, zoom: 0.6, rot: 0 };       // the tower under the words: the Moon at about y 820, Earth near the bottom
  peSpace(cam, 1.0, [60, 300], 0);
  const T = { moonY: PE_MOON_FAR, faces: { jupiter: 'smug', saturn: 'proud', uranus: 'happy', neptune: ['grumpy', { dx: 0.3, k: 0.86, look: [0.9, 0.1] }] }, nep: { dx: 0, cap: 1 }, rings: { on: 1 } };
  peTower(cam, 1.0, T);
  applyCam(cam);
  const C = [PE_X + PE_R.neptune * Math.cos(0.08), PE_Y.neptune + PE_R.neptune * Math.sin(0.08)];
  const [x, y] = peFeetFor([0, -588], C, PE_S, -1.02);
  peHero(cam, 1.0, { x, y, rot: -1.02, face: PF.strain, armL: { e: [-112, -462], w: [-54, -556] }, armR: { e: [112, -462], w: [54, -556] }, handL: 'spread', handR: 'spread', thrust: 0.9 });
  const M = toScreen(cam, PE_X, PE_MOON_FAR), Ea = toScreen(cam, PE_X, 0);
  peTag(M[0] - 120, M[1] - 6, 'MOON', '#DDE6FF', 1, 40); thinLeader([M[0] - 62, M[1] - 4], [M[0] - 10, M[1]], 1, '#DDE6FF');
  peTag(Ea[0] + 120, Ea[1] + 4, 'YOU', '#FFD447', 1, 44); thinLeader([Ea[0] + 66, Ea[1] + 2], [Ea[0] + 14, Ea[1]], 1, '#FFD447');
  screenSpace();
  bigWord('ALL 7', 540, 520, 200, '#FFD447', 1, -0.04);
  bigWord('FIT?', 540, 712, 190, '#FFFFFF', 1, -0.04);
  return { glow: 0.85, noCaptions: true };
};

function initScenes2() {
  peInitWorld();
}
