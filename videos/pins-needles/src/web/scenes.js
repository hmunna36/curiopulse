// Why Does Your Foot Fall ASLEEP? Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside
// the shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
// Worlds: studio.js (the meditation studio, the classmates, the gong, the hero's outfit and bare feet, the pins),
// nerve.js (the x-ray leg, the nerve, the fibres, the scope), brainy.js (the brain at its TV).
'use strict';

const cu = () => TLd.cues;
const decay = (t, t0, k) => (t >= t0 ? Math.exp(-(t - t0) * k) : 0);
function blinkAt(t, seed = 1, every = 3.1) { const p = ((t + seed * 1.37) % every) / every; return p > 0.955 ? 1 : 0; }
const FACE_SERENE = Object.assign({}, FACES.calm, { blink: 1, browY: 0.5, browTilt: 0.1, mouth: 'flat', mouthOpen: 0.9 });
const FACE_UHOH = Object.assign({}, FACES.worried, { lookX: 0.75, lookY: 1, eyeOpen: 1.2, browY: 1.0, browTilt: 1.1, mouth: 'wavy', mouthOpen: 0.3 });
const FACE_DEAD = Object.assign({}, FACES.annoyed, { lookX: 0, lookY: 0, blink: 0.42, browTilt: -0.3, browY: -0.1 });
const FACE_OW = Object.assign({}, FACES.shock, { blink: 1, squeeze: 1, browY: 0.7, browTilt: 1.3, mouth: 'scream', mouthOpen: 1 });
const FACE_STRAIN = Object.assign({}, FACES.nervous, { blink: 1, squeeze: 0.7, browY: 0.9, browTilt: 1.2, mouth: 'grimace', mouthOpen: 1 });
const FACE_SMUG = Object.assign({}, FACES.grin, { blink: 1, browY: 0.7, browTilt: 0.3, mouthOpen: 0.45 });

// ---------------------------------------------------------------- small graphics
function secLabel(cam, txt, px, py, wx, wy, k, col, size = 44) {
  if (k <= 0) return;
  const p = toScreen(cam, wx, wy);
  leader([px, py + (p[1] > py ? size * 0.8 : -size * 0.8)], p, clamp(k * 1.4), col);
  pill(px, py, txt, col, k, size);
}
function tickPill(x, y, txt, k, size = 44) {
  if (k <= 0) return;
  pill(x + 34, y, txt, '#4DFFB4', k, size);
  const s = E.outBack(clamp(k), 2);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.font = `900 ${size}px Montserrat`; const tw = ctx.measureText(txt).width + size * 1.1;
  ctx.translate(x + 34 - tw / 2 - size * 0.62, y); ctx.scale(s, s);
  circle(ctx, 0, 0, size * 0.74, '#17B978'); ctx.beginPath(); ctx.moveTo(-size * 0.34, 0); ctx.lineTo(-size * 0.08, size * 0.26); ctx.lineTo(size * 0.36, -size * 0.26);
  ctx.lineWidth = size * 0.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#FFFFFF'; ctx.stroke();
  ctx.restore();
}
function loudWord(txt, x, y, size, col, k, t, spread = 0.62, amp = 7) {
  if (k <= 0) return;
  const n = txt.length;
  for (let i = 0; i < n; i++) {
    const u = n > 1 ? i / (n - 1) : 0.5, sz = size * (0.82 + 0.36 * u);
    bigWord(txt[i], x + (i - (n - 1) / 2) * size * spread + amp * Math.sin(t * 40 + i * 2.1), y - 22 * Math.sin(u * 2.4) + amp * Math.cos(t * 33 + i * 1.7), sz, col, k, -0.08 + 0.06 * Math.sin(t * 25 + i));
  }
}
// a halo: a gold ring seen from slightly above (world space)
function haloRing(x, y, rx, k, t) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.2), bob = 3 * Math.sin(t * 3);
  both((c, glow) => { c.beginPath(); c.ellipse(x, y + bob, rx * s, rx * 0.3 * s, 0, 0, 7); c.lineWidth = glow ? rx * 0.3 : rx * 0.17; c.strokeStyle = rgba(glow ? '#FFD447' : '#FFE9A8', glow ? 0.7 : 1); c.stroke(); });
}

// ---------------------------------------------------------------- the studio shots
const HERO = { x: 430, y: 1150, s: 1.0 };
function studioSet(cam, t, o = {}) {
  studioBack(cam, t);
  studioMat(215, 1026, 250, '#3E7A9A', '#234A60'); studioMat(668, 1016, 230, '#8A5AA8', '#56366C');
  studioMat(HERO.x, HERO.y + 6, 330, '#E0623C', '#96381E');
  drawYogi(215, 1016, 0.64, YOGIS.a, t, o.a || {});
  drawGong(t, o.swing || 0, o.ring || 0);
  if (!o.noB) drawYogi(668, 1006, 0.6, YOGIS.b, t, o.b || {});
}
// the rig leg R as a world polyline (for the wash)
function legPolyR(S) { const r = S.r; return [heroPt(S, r.hipR), heroPt(S, r.knR), heroPt(S, r.anR), heroPt(S, [r.anR[0] + 6, r.anR[1] + 24])]; }
// a rubber leg: the knee swings by d (rad) while the foot stays about where it was
function rubberLeg(pose, d, drop = 0) { const p = Object.assign({}, pose); p.legR = { a: pose.legR.a + d + drop, b: pose.legR.b - 2.12 * d - drop * 1.6 }; return p; }

SC.hook = (lt, t, shot) => {
  const c = cu(), kc = decay(t, c.crash, 2.4), hit = t >= c.crash;
  const fallK = E.inCubic(inv(c.buckle, c.crash, t)), slide = ramp(t, c.crash, c.crash + 0.5, E.outCubic);
  // the hero first (the camera opens on his knee): he gets up (already rising on frame 1) with one leg fast asleep, finds it
  // is rubber, puts his weight on it ... and tips into the gong
  const up = smooth(clamp((lt + 0.2) / 0.9));
  const wob = ramp(t, c.wobble, c.wobble + 0.5) * (1 - fallK), amp = 0.06 + 0.36 * ramp(t, c.wobble, c.buckle, E.inCubic);
  let pose = Object.assign({}, POSES.stand, { hipY: lerp(-112, -222, up) + 5 * wob * Math.sin(t * 19), lean: 0.02 * Math.sin(t * 2) + 0.07 * wob * Math.sin(t * 9.5) });
  pose.armL = { a: lerp(0.95, 0.24, up) + 0.75 * wob + 0.2 * wob * Math.sin(t * 15), b: lerp(0.5, 0.2, up) + 0.3 * wob };
  pose.armR = { a: lerp(0.95, 0.24, up) + 0.6 * wob - 0.2 * wob * Math.sin(t * 15), b: lerp(0.5, 0.2, up) + 0.4 * wob };
  pose = ikPlant(pose, 'L', [-52, -16.5]); pose = ikPlant(pose, 'R', [56, -16.5]);
  pose = rubberLeg(pose, amp * Math.sin(t * 19) * ramp(lt, 0.35, 0.8) + 0.05 * Math.sin(t * 31), 0.55 * fallK);
  if (fallK > 0) pose = lerpPose(pose, Object.assign({}, POSES.fall, { hipY: pose.hipY, legL: pose.legL, legR: pose.legR }), fallK);
  const rot = 1.0 * fallK + 0.3 * slide, pivot = [HERO.x - 52 * HERO.s, HERO.y];
  const st = { x: HERO.x + 34 * fallK + 26 * slide, y: HERO.y + 96 * slide, s: HERO.s, pose,
    face: hit ? FACES.dazed : fallK > 0.02 ? FACES.shock : t > c.wobble ? lerpFace(FACE_UHOH, FACES.nervous, ramp(t, c.up, c.and)) : lerpFace(FACE_SERENE, FACES.grin, ramp(lt, 0.5, 0.8)),
    frizz: hit ? 0.8 * kc + 0.25 : 0, headRot: hit ? 0.25 * Math.sin((t - c.crash) * 20) * kc : 0.05 * wob * Math.sin(t * 9.5 - 0.6) };
  if (!hit && fallK < 0.02 && t < c.wobble) st.face = Object.assign({}, st.face, { blink: lt < 0.5 ? 1 : blinkAt(t, 2) });
  // the camera: frame 1 is close on the sleeping knee; it pulls out to the room in under a second
  const r0 = rig(pose), kn0 = heroPt({ st, r: r0, rot, pv: pivot }, r0.knR);
  const sh = shake(t, 30 * kc, 26, 3), open = 1 - E.inOutCubic(clamp(lt / 0.95));
  const wx = lerp(515, 612, ramp(t, c.buckle - 0.2, c.crash + 0.1, E.inOutCubic)), wz = 1.32 - 0.05 * ramp(lt, 0, 3, E.inOutSine) + 0.03 * ramp(t, c.crash, c.crash + 0.4);
  const cam = { x: lerp(wx, kn0[0] - 18, open), y: lerp(900, kn0[1] - 70, open), zoom: lerp(wz, 2.9, open), rot: 0, sx: sh[0], sy: sh[1] };
  const swing = hit ? 0.2 * Math.sin((t - c.crash) * 13) * decay(t, c.crash, 1.5) : 0.012 * Math.sin(t * 2.2) + 0.05 * Math.exp(-t * 3) * Math.sin(t * 13);
  studioSet(cam, t, {
    swing, ring: hit ? kc : 0.25 * Math.exp(-t * 2.5),
    a: hit ? { eyes: 2, look: 1, hop: 26 * decay(t, c.crash, 6) * Math.abs(Math.sin((t - c.crash) * 14)) } : {},
    b: hit ? { eyes: t > c.crash + 0.3 ? 3 : 2, look: 1, hop: 20 * decay(t, c.crash + 0.03, 6) } : {},
  });
  gongRings(t, c.crash, 5);
  const S = heroLayer(cam, st, t, { rot, pivot, post: (cc, r) => legTint(cc, r, 0.9) });
  const lp = legPolyR(S), kn = lp[1], foot = lp[2];
  legWash(lp, 25 * HERO.s, 0, 0.1 + 0.3 * ramp(t, c.wobble, c.buckle), t, 2);
  kneeFace(kn[0], kn[1] - 2, 1.15, 1, hit ? 'shock' : 'sleep', t);
  zzz(kn[0] + 12, kn[1] - 26, t + 3, 0, 0.95 * (1 - ramp(t, c.buckle, c.crash)), 0.5);
  fizzStars(foot[0], foot[1], 90, t, 0.5 + 0.4 * wob, 3, 7);
  // the hit
  const hp = heroPt(S, S.r.head), hs = toScreen(cam, hp[0], hp[1]);
  shockLines(hs[0], hs[1], 120, inv(c.crash, c.crash + 0.45, t), 12, '#FFE9A8', 4);
  screenSpace();
  loudWord('GONNNG', 420, 590, 150, '#FFD447', E.outBack(clamp((t - c.crash) / 0.14), 2.2) * (hit ? 1 : 0), t, 0.6, 9 * kc + 2);
  return { glow: 0.8, flash: hit ? 0.42 * decay(t, c.crash, 9) : 0 };
};

// the floor, close: sitting where he landed, the dead leg held up in both hands. A serene little face on the knee.
function floorHero(cam, t, o) {
  // he sits where he landed: the good leg bent up, the dead one lying out to the side along the floor. lift 0..1 raises
  // its knee (the shin droops from it), hold 0..1 puts both hands under that knee, swing rocks the limp shin
  const st = { x: 470, y: 1236, s: 1.22 };
  let pose = { hipY: -34, lean: 0.2 * (o.hold || 0) + (o.lean || 0), armL: { a: 0.45, b: -0.1 }, armR: { a: 0.45, b: -0.1 }, legL: { a: 2.25, b: -1.95 },
    legR: { a: lerp(1.5, 2.2, o.lift || 0), b: lerp(-0.05, -1.6, o.lift || 0) + (o.swing || 0) }, hand: 'open', feetFront: 0 };
  const r0 = rig(pose);
  if (o.hold > 0.01) {
    const pa = ikReach(pose, 'R', [r0.knR[0] + 4, r0.knR[1] + 28]), pb = ikReach(pose, 'L', [r0.knR[0] - 30, r0.knR[1] + 32]);
    pose = lerpPose(pose, Object.assign({}, pose, { armR: pa.armR, armL: pb.armL }), o.hold);
  }
  if (o.arms) pose = lerpPose(pose, Object.assign({}, pose, o.arms), o.armsK === undefined ? 1 : o.armsK);
  st.pose = o.twitch ? twitch(pose, t, o.twitch, 4) : pose;
  Object.assign(st, { face: o.face, frizz: o.frizz || 0, headRot: o.headRot || 0, headDX: o.headDX || 0, headDY: o.headDY || 0 });
  return heroLayer(cam, st, t, { shade: 0.16, post: o.tint ? (cc, r) => legTint(cc, r, o.tint, !!o.tintShin) : null });
}
SC.floor = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 560, y: 1062, zoom: 1.2 + 0.07 * lt / D, rot: 0 };
  const since = t - c.crash;
  studioSet(cam, t, {
    swing: 0.2 * Math.sin(since * 13) * Math.exp(-since * 1.5), ring: Math.exp(-since * 2.4),
    a: { eyes: t > c.leg ? 3 : 1, look: 1, peekSide: 1 }, b: { eyes: 3, look: 1 },
  });
  const lift = ramp(t, c.lift, c.lift + 0.32, E.outBack) * (1 - ramp(t, c.drop, c.drop + 0.12, E.inCubic));
  const dropB = decay(t, c.drop + 0.12, 9) * Math.sin((t - c.drop - 0.12) * 30);
  const sw = lift * (0.2 * Math.sin(t * 3.3) + 0.25 * decay(t, c.lift + 0.3, 3) * Math.sin((t - c.lift) * 11)) + 0.2 * dropB;
  const look = ramp(t, c.is - 0.15, c.is + 0.05);          // he looks at the leg ... then at us
  const face = t < c.lift + 0.15 ? FACES.dazed : lerpFace(Object.assign({}, FACES.confused, { lookX: 0.8, lookY: 0.9 }), FACE_DEAD, look);
  const S = floorHero(cam, t, { lift, hold: lift, swing: sw, face: Object.assign({}, face, { blink: Math.max(face.blink || 0, blinkAt(t, 1, 2.3)) }), frizz: 0.25, headRot: 0.05 * (1 - look), tint: 0.85, tintShin: true });
  const lp = legPolyR(S), kn = lp[1];
  legWash(lp, 25 * 1.22, 0, 0.08, t, 2);
  // the knee, meditating: closed eyes, a small smile, a halo
  const ko = ramp(t, c.om, c.om + 0.2) * (1 - ramp(t, c.drop, c.drop + 0.1));
  kneeFace(kn[0], kn[1] - 4, 1.5, 1, t >= c.om && t < c.drop + 0.1 ? 'serene' : t >= c.drop + 0.1 ? 'shock' : 'sleep', t);
  if (ko > 0.01) { haloRing(kn[0], kn[1] - 62, 44, ko, t); softDot(gctx, kn[0], kn[1] - 10, 110, '#FFE9A8', 0.3 * ko); }
  zzz(kn[0] + 26, kn[1] - 40, t + 3, 0, 0.9 * (1 - ko) * (1 - ramp(t, c.drop, c.drop + 0.1)), 0.5);
  // dizzy stars right after the landing
  const dz = 1 - ramp(lt, 0.25, 0.7);
  if (dz > 0.01) { const hp = heroPt(S, S.r.head); for (let i = 0; i < 3; i++) { const an = t * 7 + i * 2.1; fizzStar(hp[0] + Math.cos(an) * 92, hp[1] - 96 + Math.sin(an) * 22, 17 * dz, dz, '#FFE9A8'); } }
  if (t >= c.drop + 0.12) { const f = lp[2], d = t - c.drop - 0.12; for (let i = 0; i < 5; i++) softDot(ctx, f[0] + (i - 2) * 34 * (1 + d * 3), f[1] + 34 - d * 40, 26 + d * 60, '#D8C8B8', 0.3 * clamp(1 - d / 0.35)); }
  const kk = decay(t, c.drop + 0.12, 10);
  return { glow: 0.78, push: { k: 1 + 0.012 * kk, cx: 700, cy: 1150 }, flash: 0.18 * Math.exp(-lt * 9) };
};

SC.fizz = (lt, t, shot) => {
  const c = cu();
  const jab = c.jabs.filter((j) => t >= j).length, last = jab ? c.jabs[jab - 1] : -9, jk = decay(t, last, 11);
  const sh = shake(t, 9 * jk + 3 * ramp(t, c.fizz, c.pins), 30, 5);
  const cam = { x: lerp(585, 622, ramp(lt, 0, 1.6)), y: lerp(1040, 1072, ramp(lt, 0, 1.6)), zoom: lerp(1.3, 1.46, ramp(lt, 0, 1.4, E.inOutCubic)), rot: 0, sx: sh[0], sy: sh[1] };
  studioSet(cam, t, { ring: 0, a: { eyes: 3, look: 1 }, b: { eyes: 3, look: 1 } });
  const fz = ramp(t, c.then, c.fizz_end + 0.25, E.inOutSine), pins = t >= c.pins - 0.02;
  const face = pins ? lerpFace(FACES.shock, FACE_OW, jk) : lerpFace(FACE_UHOH, Object.assign({}, FACES.nervous, { lookX: 0.8, lookY: 0.9 }), fz);
  const flinch = ramp(t, c.pins - 0.05, c.pins + 0.1, E.outBack);
  const S = floorHero(cam, t, { lift: 0, hold: 0, face, twitch: pins ? 0.08 + 0.2 * jk : 0.05 * fz, frizz: pins ? 0.55 + 0.4 * jk : 0.3 * fz,
    headRot: pins ? 0.09 * Math.sin(t * 34) * (0.4 + jk) : 0, headDY: pins ? -8 * jk : 0, lean: -0.1 * flinch + 0.06 * fz,
    arms: { armL: { a: 1.25, b: 1.3 }, armR: { a: 1.5 + 0.2 * Math.sin(t * 13), b: 1.2 } }, armsK: 0.25 * fz + 0.75 * flinch, tint: 0.7 });
  const lp = legPolyR(S);
  legWash(lp, 25 * 1.22, 0, 0.2 + 0.8 * fz, t, 2);
  kneeFace(lp[1][0], lp[1][1] - 2, 1.5, 1, t >= c.fizz - 0.1 ? 'shock' : 'sleep', t);
  fizzStars((lp[1][0] + lp[2][0]) / 2 + 30, lp[2][1] - 16, 170, t, 0.5 + 0.5 * fz, 3, 10);
  // the pins and the needles, one jab after another, all along the leg and into the foot
  const acc = polyLen(lp), L = acc[acc.length - 1];
  c.jabs.forEach((tj, i) => {
    if (t < tj) return;
    const u = [0.9, 0.42, 0.7, 0.22, 1.0, 0.56, 0.32, 0.8, 0.14, 0.64, 0.48, 0.96][i], p = polyAt(lp, acc, u * L);
    const foot = u > 0.86, ang = foot ? Math.PI + [0.35, -0.3, 0.05][i % 3] : Math.PI / 2 + [0.42, -0.36, 0.14, -0.5, 0, 0.3, -0.2, 0.5, -0.42, 0.2, -0.1, 0.36][i];
    const tip = foot ? [p[0] + 30, p[1] + 6] : [p[0], p[1] - 24];
    drawPin(tip[0], tip[1], ang, 118, i % 3 === 1 ? 1 : 0, PIN_COLS[i % PIN_COLS.length], (t - tj) / 0.2, t);
    const d = t - tj; if (d < 0.3) fizzStar(tip[0], tip[1], 34 * (1 - d / 0.3), 1 - d / 0.3, '#FFF3B0');
  });
  return { glow: 0.8, capY: 1480, flash: 0.14 * jk * (pins ? 1 : 0) };
};

// ---------------------------------------------------------------- inside the leg
const LEG_SY = 870;                                       // an x-ray shot's focus sits here on screen, above the captions
function legCam(lt, keys) { const k = camKeys(lt, keys); k.y += (960 - LEG_SY) / k.zoom; return k; }
function xrayBg(t) {
  darkBg('#15356A', '#030712');
  screenSpace();
  for (let i = 0; i < 7; i++) softDot(ctx, (i * 251 + 90) % W, 420 + ((i * 337) % 900), 240, i % 2 ? '#2A6AD8' : '#3FB8FF', 0.06);
}
SC.squash = (lt, t, shot) => {
  const c = cu(), s0 = shot.start, G = legGeo(0);
  xrayBg(t);
  const kcl = ramp(t, c.clamp, c.clamp + 0.22, E.outBack), sh = shake(t, 10 * decay(t, c.clamp + 0.1, 8), 28, 2);
  const cam = legCam(lt, [[0, 455, 930, 1.0], [c.yousq - s0 - 0.25, 455, 930, 1.05], [c.squashed - s0 + 0.25, G.Q[0] - 10, G.Q[1] + 6, 1.95],
    [c.andthe - s0 - 0.05, G.Q[0] - 10, G.Q[1] + 6, 2.05], [c.tiny - s0 + 0.35, G.Q[0] - 60, G.Q[1] + 30, 3.0], [shot.end - s0, G.Q[0] - 90, G.Q[1] + 44, 3.2]]);
  cam.sx = sh[0]; cam.sy = sh[1];
  XR_GK = Math.min(1, 1.15 / cam.zoom);
  applyCam(cam);
  xrayLeg(G, t);
  const na = ramp(t, c.yousq - 0.3, c.yousq + 0.1), vs = ramp(t, c.andthe - 0.1, c.tiny + 0.1);
  legArtery(G, t, lerp(1, 0.3, ramp(t, c.yousq - 0.3, c.yousq + 0.2)) * (1 - ramp(t, c.andthe - 0.2, c.andthe + 0.2)));
  legNerve(G, t, { a: 0.28 + 0.72 * na, pinch: kcl, vess: vs, drain: ramp(t, c.vessels, c.feed_end) });
  legPulses(G, t, { a: na, block: 0.5 * ramp(t, c.tiny, c.feed_end) });
  legSqueeze(G, t, clamp(kcl));
  // labels
  const flow = ramp(t, c.circ + 0.1, c.circ + 0.32) * (1 - ramp(t, c.yousq - 0.1, c.yousq + 0.08));
  tickPill(540, 560, 'BLOOD: STILL FLOWING', flow, 46);
  const nl = ramp(t, c.nerve, c.nerve + 0.2) * (1 - ramp(t, c.andthe - 0.1, c.andthe + 0.1));
  const np = polyAt(G.nerve, G.acc, (G.uq - 0.13) * G.acc[G.acc.length - 1]);
  secLabel(cam, 'NERVE', 300, 560, np[0], np[1], nl, '#FFB23F', 62);
  const vl = ramp(t, c.tiny + 0.1, c.tiny + 0.32), vp = polyAt(G.nerve, G.acc, (G.uq + 0.045) * G.acc[G.acc.length - 1]);
  secLabel(cam, 'ITS BLOOD SUPPLY', 560, 520, vp[0] + 12, vp[1] - 12, vl, '#FF5A6E', 46);
  return { glow: 0.9, flash: 0.15 * Math.exp(-lt * 8), zblur: 0.1 * (1 - ramp(lt, 0, 0.25)), zcx: 540, zcy: 900 };
};
SC.quiet = (lt, t, shot) => {
  const c = cu(), s0 = shot.start, D = shot.end - s0, G = legGeo(0);
  xrayBg(t);
  const cam = legCam(lt, [[0, G.Q[0] - 90, G.Q[1] + 44, 3.2], [0.9, 430, 950, 1.3], [D, 420, 960, 1.12]]);
  XR_GK = Math.min(1, 1.15 / cam.zoom);
  applyCam(cam);
  const dead = ramp(t, c.starved + 0.1, c.quiet_end, E.inOutSine);
  xrayLeg(G, t);
  legArtery(G, t, 0.3);
  legNerve(G, t, { pinch: 1, vess: 1, drain: 1, dead });
  legPulses(G, t, { block: ramp(t, c.starved - 0.2, c.starved + 0.3), dead });
  legSqueeze(G, t, 1);
  // the foot goes dark with it
  const f = G.A; softDot(ctx, (f[0] + G.T[0]) / 2, (f[1] + G.T[1]) / 2, 230, '#020510', 0.5 * dead);
  zzz(G.T[0] - 20, G.T[1] - 40, t, c.quiet, 0.9, 0.9);
  return { glow: 0.9 - 0.25 * dead, desat: 0.25 * dead };
};
SC.reboot = (lt, t, shot) => {
  const c = cu(), s0 = shot.start, D = shot.end - s0;
  const open = E.inOutCubic(inv(c.unfold, c.unfold + 0.6, t)), G = legGeo(open);
  xrayBg(t);
  const bad = t >= c.badly, kb = decay(t, c.badly, 3), sh = shake(t, 14 * decay(t, c.badly, 5), 30, 6);
  const cam = legCam(lt, [[0, 430, 950, 1.12], [c.unfold - s0 + 0.7, 500, 1000, 0.86], [c.andnerve - s0, 520, 1010, 0.9], [D, 540, 1020, 0.98]]);
  cam.sx = sh[0]; cam.sy = sh[1];
  XR_GK = 1;
  applyCam(cam);
  xrayLeg(G, t);
  legArtery(G, t, 0.3 + 0.5 * ramp(t, c.blood, c.rushes), 1 + 1.5 * ramp(t, c.blood, c.back));
  const refill = ramp(t, c.blood + 0.1, c.back_end + 0.2, E.inOutSine), wake = ramp(t, c.nerve2, c.reboots_end);
  legNerve(G, t, { pinch: 1 - open, vess: 1, drain: 1, refill, dead: bad ? 0 : 1 - 0.6 * wake, flick: bad ? 0.5 * kb : wake, hot: bad ? 0.25 : 0.2 * wake });
  legSqueeze(G, t, 1 - ramp(t, c.unfold, c.unfold + 0.2));
  if (bad) { legSparks(G, t, 0.5 + 0.5 * kb, 5); legPulses(G, t, { n: 8, speed: 1.3, gk: 0.45 }); legPulses(G, t * -1 + 40, { n: 5, speed: 0.9, a: 0.8, gk: 0.45 }); }
  if (t < c.unfold + 0.2) zzz(G.T[0] - 20, G.T[1] - 40, t, c.quiet, 0.9 * (1 - ramp(t, c.unfold, c.unfold + 0.2)), 0.9);
  // the reboot bar (screen space): fills as she says "reboots...", then errors out on "badly"
  const kbar = ramp(t, c.andnerve - 0.1, c.andnerve + 0.15);
  if (kbar > 0) {
    screenSpace();
    const x = 250, y = 520, w = 580, h = 118, s = E.outBack(clamp(kbar), 1.7), fill = bad ? 0.83 : 0.83 * ramp(t, c.nerve2, c.reboots_end + 0.2, E.inOutSine);
    const jx = bad ? (hash(Math.floor(t * 30)) - 0.5) * 16 * kb : 0;
    ctx.save(); ctx.translate(540 + jx, y + h / 2); ctx.scale(s, s); ctx.translate(-540, -(y + h / 2));
    rrect(ctx, x, y, w, h, 24); ctx.fillStyle = 'rgba(6,12,30,0.9)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = bad ? '#FF5A6E' : '#FFB23F'; ctx.stroke();
    ctx.font = '900 34px Montserrat'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = bad ? '#FF5A6E' : '#FFE9A8';
    ctx.fillText(bad ? 'NERVE: ERROR' : 'REBOOTING NERVE' + '.'.repeat(1 + Math.floor(t * 4) % 3), x + 30, y + 38);
    rrect(ctx, x + 28, y + 68, w - 56, 28, 14); ctx.fillStyle = '#1B2748'; ctx.fill();
    rrect(ctx, x + 28, y + 68, (w - 56) * fill, 28, 14); ctx.fillStyle = bad ? '#FF5A6E' : '#FFB23F'; ctx.fill();
    ctx.textAlign = 'right'; ctx.fillStyle = '#FFFFFF'; ctx.fillText(bad ? '!!' : Math.round(fill * 100) + '%', x + w - 28, y + 38);
    ctx.restore();
    gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); rrect(gctx, x, y, w, h, 24); gctx.lineWidth = 12; gctx.strokeStyle = rgba(bad ? '#FF3A4A' : '#FF9A2A', 0.5 * kbar); gctx.stroke(); gctx.restore();
  }
  return { glow: 0.9, glitch: bad ? 0.55 * kb : 0, flash: bad ? 0.3 * decay(t, c.badly, 12) : 0 };
};

// ---------------------------------------------------------------- the brain's control room
SC.brain = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  brainRoom(t);
  const ns = t >= c.nosignal, lost = t >= c.lost;
  const gl = ns ? decay(t, c.nosignal, 6) : 0.35 + 0.65 * ramp(t, c.nosignal - 0.35, c.nosignal);
  tvSet(96, 560, 490, 370, t, lost ? 'lost' : ns ? 'nosignal' : 'feed', { glitch: lost ? decay(t, c.lost, 7) : gl });
  const tap = ns && !lost ? Math.max(0, Math.sin((t - c.nosignal) * 19)) : 0;
  const lk = lost ? [Math.sin((t - c.lost) * 9), 0.2] : [-1, 0.1];
  brainGuy(770, 790, 0.82, t, {
    mood: lost ? 'shrug' : ns ? 'worried' : 'calm', look: lk, lean: lost ? 0.03 * Math.sin(t * 9) : ns ? -0.13 : -0.04,
    armL: lost ? [-196, -52] : ns ? [-232 - 22 * tap, -40 + 10 * tap] : null, armR: lost ? [196, -52] : null, sweat: ns && !lost ? ramp(t, c.nosignal + 0.2, c.nosignal + 0.5) : 0,
  });
  brainDesk(968, t);
  if (tap > 0.6) shockLines(600, 742, 34, 0.5, 6, '#FFFFFF', 3);
  screenSpace();
  bigWord('?', 786, 560, 150, '#FFD447', E.outBack(clamp((t - c.lost - 0.05) / 0.16), 2.4) * (lost ? 1 : 0), 0.12 * Math.sin(t * 6));
  return { glow: 0.8, push: { k: 1 + 0.045 * lt / D, cx: 420, cy: 760 }, flash: 0.12 * Math.exp(-lt * 9) };
};
SC.tv = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  brainRoom(t);
  tvSet(96, 560, 490, 370, t, 'static');
  const th = t >= c.think, ne = t >= c.needles2;
  brainGuy(770, 790, 0.82, t, {
    mood: ne ? 'shrug' : th ? 'think' : 'squint', look: ne ? [0, 0] : th ? [0.5, -0.9] : [-1, 0.1], lean: ne ? 0.02 * Math.sin(t * 7) : th ? 0.06 : -0.16,
    armR: ne ? [196, -52] : th ? [36, 108] : null, armL: ne ? [-196, -52] : null,
  });
  brainDesk(968, t);
  // the thought: a pin, a needle, a question mark
  const kb = ramp(t, c.think, c.think + 0.3);
  thoughtBubble(450, 478 + 6 * Math.sin(t * 2), 420, 200, kb, 700, 660);
  if (kb > 0.6) {
    screenSpace();
    const kp = E.outBack(clamp((t - c.needles2) / 0.16), 2.2) * (ne ? 1 : 0);
    if (!ne) for (let i = 0; i < 3; i++) circle(ctx, 400 + i * 50, 480, 13 * (0.6 + 0.4 * Math.sin(t * 8 - i * 1.2)), '#B7BDD6');
    if (kp > 0) {
      ctx.save(); ctx.translate(450, 478); ctx.scale(kp, kp); ctx.translate(-450, -478);
      drawPin(326, 524, 2.3, 112, 0, '#FF5A6E', 1, 0); drawPin(448, 528, 0.85, 112, 1, '#7FE9FF', 1, 0);
      ctx.restore();
      bigWord('?', 574, 482, 156, '#C8A8FF', kp, 0.14);
    }
  }
  stamp('BEST GUESS', 380, 1120, ramp(t, c.needles2_end + 0.02, c.needles2_end + 0.25), '#C8A8FF', -0.1, 84);
  return { glow: 0.8, push: { k: 1 + 0.05 * lt / D, cx: 600, cy: 700 }, flash: 0.12 * Math.exp(-lt * 9) };
};

// ---------------------------------------------------------------- the nerve up close
function fibPt(i, x) { const y = fibY(i, x), cs = Math.cos(FIB.rot), sn = Math.sin(FIB.rot), dx = x - 540, dy = y - FIB.y0; return [540 + dx * cs - dy * sn, FIB.y0 + dx * sn + dy * cs]; }
SC.rec = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#3A1A0C', '#0A0406');
  const cam = camKeys(lt, [[0, 520, 990, 1.0], [c.recorded_end - shot.start, 540, 960, 1.04], [c.firing - shot.start + 0.5, 600, 944, 1.34], [c.hundreds - shot.start, 600, 944, 1.38], [D, 570, 930, 1.22]]);
  applyCam(cam);
  const act = 0.55 + 0.4 * ramp(t, c.firing, c.themselves_end);
  fibreBundle(t + 3, act);
  const kn = ramp(t, c.needle_in, c.needle_in + 0.4), tip = fibPt(2, 640), far = electrode(tip[0], tip[1], kn, t);
  // the wire up to the scope
  const ks = ramp(t, c.recorded - 0.05, c.recorded + 0.25), px = 150, py = 430, pw = 700, ph = 250;
  if (kn > 0.5) {
    const a = toScreen(cam, far[0], far[1]); screenSpace();
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(a[0] + 40, py + ph + 150, px + pw - 60, py + ph - 6); ctx.lineWidth = 7; ctx.strokeStyle = '#1B2238'; ctx.lineCap = 'round'; ctx.stroke();
  }
  scopePanel(px, py, pw, ph, t, ks, act);
  if (ks > 0.9) {
    screenSpace();
    ctx.font = '700 23px Montserrat'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = 'rgba(190,255,225,0.8)';
    ctx.fillText('A HUMAN NERVE · OCHOA & TOREBJÖRK, 1980', px + 28, py + 36);
    // the counter
    const kc = ramp(t, c.hundreds - 0.05, c.second_end - 0.1, E.outCubic);
    if (t >= c.hundreds - 0.05) {
      const n = Math.round(300 * kc), pop = 1 + 0.12 * decay(t, c.second_end - 0.1, 8);
      ctx.save(); ctx.translate(px + pw - 150, py + ph + 96); ctx.scale(pop, pop);
      rrect(ctx, -170, -62, 340, 124, 26); ctx.fillStyle = 'rgba(6,12,30,0.92)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#FFD447'; ctx.stroke();
      ctx.font = '400 92px Anton'; ctx.textAlign = 'right'; ctx.fillStyle = '#FFD447'; ctx.fillText(String(n), 20, 6);
      ctx.font = '900 30px Montserrat'; ctx.textAlign = 'left'; ctx.fillStyle = '#FFFFFF'; ctx.fillText('A', 38, -22); ctx.fillText('SECOND', 38, 16);
      ctx.restore();
      softDot(gctx, px + pw - 150, py + ph + 96, 200, '#FFD447', 0.25);
    }
  }
  return { glow: 0.9, capY: 1400, flash: 0.14 * Math.exp(-lt * 9), zblur: 0.08 * (1 - ramp(lt, 0, 0.25)) };
};

// ---------------------------------------------------------------- the foot, close
function footStage(t) {
  screenSpace();
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1B1533'); g.addColorStop(0.6, '#2C2046'); g.addColorStop(1, '#231A38');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  softDot(ctx, 880, 520, 520, '#FFA44A', 0.16); softDot(gctx, 940, 420, 300, '#FFA44A', 0.3);
  const fl = ctx.createLinearGradient(0, 1130, 0, 1800); fl.addColorStop(0, '#4A3226'); fl.addColorStop(1, '#1C1210');
  ctx.fillStyle = fl; ctx.fillRect(0, 1130, W, 800);
  rrect(ctx, 0, 1120, W, 14, 0); ctx.fillStyle = '#1A1024'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(40, 1168); ctx.lineTo(1040, 1168); ctx.lineTo(1160, 1290); ctx.lineTo(-80, 1290); ctx.closePath(); ctx.fillStyle = '#E0623C'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(-80, 1290); ctx.lineTo(1160, 1290); ctx.lineTo(1160, 1312); ctx.lineTo(-80, 1312); ctx.closePath(); ctx.fillStyle = '#96381E'; ctx.fill();
}
const FOOT_PINS = [[250, -30, Math.PI, 0], [150, -92, Math.PI * 0.72, 1], [60, -128, Math.PI * 0.62, 0], [-78, -70, 0.1, 0], [200, 0, Math.PI * 1.28, 1], [296, -52, Math.PI * 1.08, 0], [10, -2, Math.PI * 1.55, 0], [-40, -150, 0.5, 1], [226, -66, Math.PI * 0.86, 0]];
SC.nothing = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  footStage(t);
  const cam = { x: 540, y: 960, zoom: 1.0 + 0.06 * lt / D, rot: 0 };
  applyCam(cam);
  ellipse(ctx, 470, 1206, 330, 30, 'rgba(20,8,6,0.4)');
  const F = bigFoot(340, 1200, 1.42, t, {});
  legWash(F.poly, F.w * 0.86, 0.3, 0.75, t, 4);
  fizzStars(F.top[0] + 60, F.top[1] + 20, 230, t, 0.9, 6, 9);
  // the pins: there ... then dashed ... then gone. They were never there.
  FOOT_PINS.forEach(([px, py, ang, kind], i) => {
    const g = ramp(t, c.nothing + 0.12 + i * 0.085, c.nothing + 0.5 + i * 0.085);
    const tip = [340 + px * 1.42, 1200 + py * 1.42];
    drawPin(tip[0], tip[1], ang, 150, kind, PIN_COLS[i % PIN_COLS.length], 1, t, g > 0.02 ? Math.min(0.985, g) + (g >= 1 ? 1 : 0) : 0);
    const d = t - (c.nothing + 0.5 + i * 0.085); if (d > 0 && d < 0.25) fizzStar(tip[0] - Math.cos(ang) * 70, tip[1] - Math.sin(ang) * 70, 30 * (1 - d / 0.25), 1 - d / 0.25, '#DDE6FF');
  });
  tickPill(520, 560, '0 PINS · 0 NEEDLES', ramp(t, c.skin, c.skin + 0.22), 50);
  return { glow: 0.8, flash: 0.12 * Math.exp(-lt * 9) };
};
SC.harmless = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  footStage(t);
  const cam = { x: 540, y: 960, zoom: 1.06 - 0.05 * lt / D, rot: 0 };
  applyCam(cam);
  const wig = ramp(t, c.wiggle - 0.05, c.wiggle + 0.2), fade = 1 - ramp(t, c.wiggle, c.toes_end + 0.4);
  const lift = 26 * wig * (0.5 + 0.5 * Math.sin(t * 7));
  ellipse(ctx, 470, 1206, 330 - lift * 2, 30 - lift * 0.3, 'rgba(20,8,6,0.4)');
  const F = bigFoot(340, 1200, 1.42, t, { wig, lift: 0 });
  legWash(F.poly, F.w * 0.86, 0.3 * fade, 0.55 * fade, t, 4);
  fizzStars(F.top[0] + 60, F.top[1] + 20, 230, t, 0.8 * fade, 6, 9);
  if (wig > 0.1) for (let i = 0; i < 3; i++) {             // wiggle marks over the toes
    const a = -0.9 + i * 0.45, r0 = 120 + 14 * Math.sin(t * 15 + i), p0 = [F.toe[0] + 30 + Math.cos(a) * r0, F.toe[1] - 10 + Math.sin(a) * r0];
    line(ctx, p0[0], p0[1], p0[0] + Math.cos(a) * 34, p0[1] + Math.sin(a) * 34, 8, rgba('#FFFFFF', 0.85 * wig));
  }
  tickPill(520, 560, 'HARMLESS', ramp(t, c.shield, c.shield + 0.22), 72);
  return { glow: 0.8, flash: 0.12 * Math.exp(-lt * 9) };
};

// ---------------------------------------------------------------- the button: he tries to look enlightened
function phoneCard(x, y, k, t) {                           // the next Short's tease: a phone playing back a voice memo
  if (k <= 0) return;
  const s = E.outBack(clamp(k), 2);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.rotate(0.1 + 0.03 * Math.sin(t * 5)); ctx.scale(s, s);
  rrect(ctx, -78, -138, 156, 276, 26); ctx.fillStyle = '#10142A'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#DDE6FF'; ctx.stroke();
  rrect(ctx, -64, -112, 128, 214, 12); ctx.fillStyle = '#1D2A55'; ctx.fill();
  for (let i = 0; i < 9; i++) { const hh = 12 + 52 * Math.abs(Math.sin(t * 9 + i * 1.3) * Math.sin(i * 0.9 + 1)); rrect(ctx, -56 + i * 13, -30 - hh / 2, 8, hh, 4); ctx.fillStyle = i % 2 ? '#FF9A3C' : '#FFD447'; ctx.fill(); }
  circle(ctx, 0, 62, 20, '#FF5A6E'); ctx.beginPath(); ctx.moveTo(-6, 52); ctx.lineTo(10, 62); ctx.lineTo(-6, 72); ctx.closePath(); ctx.fillStyle = '#FFFFFF'; ctx.fill();
  ctx.restore();
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); softDot(gctx, x, y, 150, '#FF9A3C', 0.3 * clamp(k)); gctx.restore();
  bigWord('?!', x + 96, y - 128, 96, '#C8A8FF', s, 0.2);
}
SC.zen = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const hit = t >= c.gong2, kc = decay(t, c.gong2, 2.4), zap = t >= c.zap2;
  const fallK = E.inCubic(inv(c.zap2 + 0.3, c.gong2, t));
  const sh = shake(t, 30 * kc + 6 * decay(t, c.zap2, 8), 26, 3);
  const cam = { x: lerp(520, 505, ramp(lt, 0, 5)) + 118 * fallK, y: lerp(905, 885, ramp(lt, 0, 5)), zoom: 1.18 + 0.1 * ramp(lt, 0.2, 6, E.inOutSine) - 0.06 * fallK, rot: 0, sx: sh[0], sy: sh[1] };
  const shh = ramp(t, c.shh, c.shh + 0.16, E.outBack) * (1 - ramp(t, c.zap2, c.zap2 + 0.15));
  studioSet(cam, t, {
    swing: hit ? 0.2 * Math.sin((t - c.gong2) * 13) : 0.012 * Math.sin(t * 2.2), ring: hit ? kc : 0,
    a: hit || zap ? { eyes: 2, look: 1, hop: 22 * decay(t, c.zap2, 7) } : { eyes: t > c.halo + 0.5 ? (t > c.nextup ? 3 : 1) : 0, look: 1, peekSide: 1, shh },
    b: hit || zap ? { eyes: 2, look: -1 } : { eyes: t > c.halo + 0.9 ? 3 : 0, look: -1, shh },
  });
  gongRings(t, c.gong2, 5);
  // he drops into the pose, floats, glows ... and the foot keeps fizzing
  const sit = ramp(t, c.sit, c.sit + 0.3, E.inCubic), land = decay(t, c.sit + 0.3, 9);
  const lev = ramp(t, c.halo, c.halo + 0.5, E.outBack) * (1 - ramp(t, c.zap2, c.zap2 + 0.18, E.inCubic));
  const pulse = Math.pow(Math.max(0, Math.sin(t * 5.1 + 1)), 8);                        // a jab in the foot now and then
  const seated = sit > 0.62;
  let pose, face;
  if (!seated) {
    pose = Object.assign({}, POSES.stand, { hipY: lerp(-222, -62, sit) });
    pose = ikPlant(pose, 'L', [-58, -16.5]); pose = ikPlant(pose, 'R', [58, -16.5]);
    pose = lerpPose(pose, Object.assign({}, POSE_LOTUS, { hipY: pose.hipY, legL: pose.legL, legR: pose.legR }), sit);
    face = FACES.grin;
  } else {
    pose = Object.assign({}, POSE_LOTUS, { hipY: -62 + 10 * land * Math.sin((t - c.sit - 0.3) * 22) });
    if (zap) pose = lerpPose(pose, Object.assign({}, POSES.zap, { hipY: pose.hipY, legL: pose.legL, legR: pose.legR }), ramp(t, c.zap2, c.zap2 + 0.08));
    else pose = twitch(pose, t, 0.05 * pulse, 6);
    const peek = ramp(t, c.recorded2 - 0.2, c.recorded2) * (1 - ramp(t, c.subscribe - 0.1, c.subscribe + 0.1));
    const shy = ramp(t, c.shh, c.shh + 0.15);
    face = lerpFace(lerpFace(FACE_SERENE, FACE_SMUG, ramp(t, c.halo, c.halo + 0.3)), FACE_STRAIN, 0.85 * pulse);
    if (peek > 0) face = lerpFace(face, Object.assign({}, FACES.confused, { lookX: 1, lookY: -0.5 }), peek);
    if (shy > 0) face = lerpFace(face, Object.assign({}, FACES.nervous, { lookX: 0.2, lookY: 0.2 }), shy);
    if (zap) face = hit ? FACES.dazed : FACES.shock;
  }
  const st = { x: HERO.x + 96 * fallK, y: HERO.y - 50 * lev - 5 * lev * Math.sin(t * 2.6), s: HERO.s, pose, face, noLegs: seated,
    frizz: zap ? 0.9 : 0.3 * pulse, headRot: zap ? 0.2 * Math.sin(t * 30) * decay(t, c.zap2, 4) : 0.02 * Math.sin(t * 1.3) };
  // shadow on the mat (it shrinks as he floats)
  applyCam(cam);
  ellipse(ctx, HERO.x + 60 * fallK, HERO.y + 14, 150 - 50 * lev, 22 - 8 * lev, 'rgba(20,8,6,0.45)');
  if (lev > 0.05) softDot(gctx, st.x, st.y - 200, 330, '#FFE9A8', 0.12 * lev);
  let legs = null;
  const S = heroLayer(cam, st, t, { rot: 1.05 * fallK, pivot: [HERO.x + 70, HERO.y], post: seated ? (cc, r) => { legs = crossLegs(cc, r, YOGA, t); } : null });
  const hp = heroPt(S, S.r.head);
  haloRing(hp[0], hp[1] - 112, 62, lev * (zap ? 1 - ramp(t, c.zap2, c.zap2 + 0.2) : 1), t);
  // the fizzing foot
  const fp = seated && legs ? heroPt(S, legs.footR) : heroPt(S, S.r.anR);
  fizzStars(fp[0], fp[1], 62, t, 0.45 + 0.55 * pulse, 3, 6);
  if (pulse > 0.3 && seated) softDot(gctx, fp[0], fp[1], 70, '#7FE9FF', 0.6 * pulse);
  if (zap) {
    const d = t - c.zap2, rng = mulberry32(Math.floor(t * 30) + 9);
    if (d < 0.5) for (let i = 0; i < 5; i++) { const an = -Math.PI / 2 + (rng() - 0.5) * 2.6, pts = jagged(rng, fp[0], fp[1], fp[0] + Math.cos(an) * 120, fp[1] + Math.sin(an) * 120, 40, 3); poly(ctx, pts, 5, rgba('#FFF6C8', 1 - d / 0.5)); poly(gctx, pts, 9, rgba('#7FE9FF', 0.9 * (1 - d / 0.5))); }
  }
  const hs = toScreen(cam, hp[0], hp[1]);
  shockLines(hs[0], hs[1], 120, inv(c.gong2, c.gong2 + 0.45, t), 12, '#FFE9A8', 4);
  // the next Short's tease
  phoneCard(770, 590, ramp(t, c.recorded2 - 0.25, c.recorded2 - 0.05) * (1 - ramp(t, c.subscribe - 0.25, c.subscribe - 0.1, E.inCubic)), t);
  return { glow: 0.8, flash: (hit ? 0.42 * decay(t, c.gong2, 9) : 0) + 0.12 * Math.exp(-lt * 9) };
};

// ---------------------------------------------------------------- the cover (rendered from a one-shot timeline: build.sh, "cover")
SC.cover = (lt, t, shot) => {
  const tt = 9.4, cam = { x: 606, y: 1024, zoom: 1.86, rot: 0 };
  studioSet(cam, 3.3, { ring: 0, a: { eyes: 2, look: 1 }, noB: true });
  const S = floorHero(cam, tt, { lift: 0, hold: 0, face: Object.assign({}, FACES.shock, { lookX: 0.7, lookY: 0.8, eyeOpen: 1.4 }), frizz: 0.9, headRot: -0.05, lean: -0.1,
    arms: { armL: { a: 1.25, b: 1.3 }, armR: { a: 1.5, b: 0.25 } }, armsK: 1, tint: 0.7 });
  const lp = legPolyR(S), acc = polyLen(lp), L = acc[acc.length - 1];
  legWash(lp, 25 * 1.22, 0, 1, tt, 2);
  kneeFace(lp[1][0], lp[1][1] - 2, 1.5, 1, 'shock', tt);
  fizzStars((lp[1][0] + lp[2][0]) / 2 + 30, lp[2][1] - 16, 170, 3.1, 1, 3, 10);
  [0.9, 0.42, 0.68, 0.2, 1.0, 0.55, 0.8].forEach((u, i) => {
    const p = polyAt(lp, acc, u * L), foot = u > 0.86, ang = foot ? Math.PI + [0.3, -0.25][i % 2] : Math.PI / 2 + [0.42, -0.36, 0.14, -0.5, 0, 0.3, -0.2][i];
    const tip = foot ? [p[0] + 30, p[1] + 6] : [p[0], p[1] - 24];
    drawPin(tip[0], tip[1], ang, 112, i % 3 === 1 ? 1 : 0, PIN_COLS[i % PIN_COLS.length], 1.2, tt);
    fizzStar(tip[0], tip[1], 20, 0.9, '#FFF3B0');
  });
  screenSpace();
  bigWord('PINS &', 700, 596, 188, '#FFD447', 1, -0.05);
  bigWord('NEEDLES?!', 690, 796, 146, '#FFFFFF', 1, -0.05);
  return { glow: 0.8, noCaptions: true, noSubscribe: true };
};

function initScenes2() {
  initStudio();
}
