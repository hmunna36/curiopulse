// Why Do We Get GOOSEBUMPS? Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;
const after = (t, t0) => (t > t0 ? t - t0 : -1);
// e^(-k (t - t0)) after t0, else 0
const decay = (t, t0, k) => (t >= t0 ? Math.exp(-(t - t0) * k) : 0);
function blinkAt(t, seed = 1, every = 3.1) { const p = ((t + seed * 1.37) % every) / every; return p > 0.955 ? 1 : 0; }

const FACE_TV = Object.assign({}, FACES.nervous, { lookX: 0, lookY: 0.15, eyeOpen: 1.32, pupil: 0.62, browY: 1.1, browTilt: 1.0, mouth: 'wavy', mouthOpen: 0.3 });
const FACE_DEADPAN = Object.assign({}, FACES.annoyed, { lookX: 0, lookY: 0, blink: 0.48, browTilt: -0.2, browY: 0 });
const FACE_BLISS = Object.assign({}, FACES.grin, { blink: 1, browY: 1.0, browTilt: 0.5, mouthOpen: 0.55 });
const FACE_STRAIN = Object.assign({}, FACES.nervous, { blink: 1, squeeze: 1, browY: -0.5, browTilt: -1.0, mouth: 'grimace', mouthOpen: 1 });

// ---------------------------------------------------------------- 1. hook: the jump scare, the dive, the hairs rise
SC.hook = (lt, t, shot) => {
  const c = cu();
  if (t < c.armcut) {
    const sc = t - c.scare;
    const up = E.outBack(clamp(sc / 0.1), 1.4) * (1 - ramp(t, c.scare + 0.5, c.scare + 1.0, E.inOutCubic));
    const frizz = 0.9 * springStep(sc, 5, 0.42) * (1 - 0.55 * ramp(t, 1.0, 2.6));
    let face = lerpFace(FACES.shock, FACE_TV, ramp(t, c.scare + 0.55, c.scare + 0.95));
    face = lerpFace(face, Object.assign({}, FACE_TV, { lookX: 0.9, lookY: 0.9, browY: 0.6 }), ramp(t, c.and_your - 0.25, c.and_your + 0.02));
    const jolt = decay(t, c.scare, 7);
    const base = camKeys(t, [[0, 540, 1010, 1.72], [0.22, 540, 990, 1.48], [1.3, 546, 1012, 1.56], [c.and_your - 0.1, 566, 1040, 1.8]], E.inOutSine);
    const dive = ramp(t, c.and_your - 0.08, c.armcut, E.inCubic);
    const [qx, qy] = shake(t, 16 * jolt, 30, 2);
    const rg = rig(couchPose({ hug: 1, t }));                       // where his forearm is: the dive lands on it
    const fa = [ROOM.hx + (rg.elR[0] * 0.45 + rg.wrR[0] * 0.55) * ROOM.hs, ROOM.seatY + (rg.elR[1] * 0.45 + rg.wrR[1] * 0.55) * ROOM.hs];
    const dpos = ramp(t, c.and_your - 0.08, c.armcut - 0.02, E.outCubic);            // the aim arrives first, then the zoom
    const cam = { x: lerp(base.x, fa[0], dpos), y: lerp(base.y, fa[1], dpos), zoom: base.zoom * (1 + 3.4 * dive), rot: 0, sx: qx, sy: qy };
    const jump = clamp(sc / 0.9);
    const { st, r } = couchScene(cam, t, {
      hero: { face, up, hug: 1, frizz, tremble: 0.035 * (1 - up), headDY: -16 * jolt, bristle: springStep(sc - 0.04, 5, 0.4) * (1 - 0.35 * ramp(t, 1.0, 2.2)), lean: 0.02 * Math.sin(t * 31) * (1 - dive) },
      bucket: { jump, spill: clamp(sc / 0.3) }, popT: sc,
    });
    applyCam(cam);
    // one piece lands on his head and stays
    const land = c.headpop;
    if (t > land - 0.25) {
      const k = clamp((t - (land - 0.25)) / 0.25), hd = toWorld(st, r.head);
      popcorn(ctx, hd[0] + 14, lerp(hd[1] - 420, hd[1] - 92 * st.s - 20 * frizz, E.inCubic(k)) - 14 * Math.sin(Math.PI * clamp((t - land) / 0.22)) * (t > land ? 1 : 0), 13, 0.4);
    }
    // shiver marks around him after the scare
    const hd = toScreen(cam, ...toWorld(st, r.chest));
    shockLines(hd[0], hd[1] - 60, 250 * cam.zoom / 1.5, inv(c.scare + 0.02, c.scare + 0.5, t), 14, '#DCE6FF', 3);
    tvLight(t, 1);
    return { glow: 0.85, flash: 0.1 * decay(t, c.scare, 9), zblur: 0.5 * dive * dive, zcx: 540, zcy: 960 };
  }
  // the macro arm: hairs lying flat ... they twitch on "does" ... and RISE on "this"
  const D = shot.end - c.armcut, la = t - c.armcut;
  armBg(t, tvFlick(t));
  const stir = ramp(la, 0.1, 0.6), tense = ramp(t, c.does - 0.15, c.does + 0.25);
  // before the rise the hairs stir (a draught), then tremble as it comes
  const tease = (u, j) => 0.05 * stir * (0.5 + 0.5 * Math.sin(t * 5 + u / 130 + j * 6)) + 0.14 * tense * (0.5 + 0.5 * Math.sin(t * 27 + j * 9));
  const rise = (u, j) => Math.max(tease(u, j), springStep(t - (c.rise + (u + 880) / 1760 * 0.4 + j * 0.07), 5.5, 0.4));
  const bumpK = (u, j) => springStep(t - (c.rise + 0.03 + (u + 900) / 1800 * 0.4 + j * 0.1), 4, 0.6);
  const zs = 1.2 + 0.16 * ramp(la, 0, D, E.inOutSine);
  macroArm({ x: 540 - 40 * la / D, y: 940, rot: -0.1, s: zs, t, rise, bumpK, shiver: 7 * decay(t, c.rise, 3.2) + 1.6 * tense * (t < c.rise ? 1 : 0), light: tvFlick(t) });
  // the chill creeping up the arm: a cold shimmer that sweeps along it before the hairs go
  if (t < c.rise) { const p = ((la * 0.8) % 1), a = Math.sin(Math.PI * p); softDot(ctx, lerp(-100, 1180, p), 760 - 60 * p, 300, '#9FC4FF', (0.05 + 0.06 * tense) * a); softDot(gctx, lerp(-100, 1180, p), 760 - 60 * p, 240, '#7FA8FF', (0.04 + 0.04 * tense) * a); }
  tvLight(t, 0.7);
  const wave = inv(c.rise, c.rise + 0.45, t);
  if (wave > 0 && wave < 1) softDot(gctx, lerp(60, 1020, wave) + 120, 690, 220, '#8FB4FF', 0.11 * Math.sin(Math.PI * wave));   // a faint cool sheen just ahead of the wave
  return { glow: 0.8, zblur: 0.22 * (1 - ramp(la, 0, 0.3)) + 0.05 * decay(t, c.rise, 6), zcx: 540, zcy: 900, flash: 0.3 * (1 - ramp(la, 0, 0.12)),
    push: { k: 1 + 0.03 * decay(t, c.rise, 5), cx: 540, cy: 900 } };
};

// ---------------------------------------------------------------- 2. react: "Congrats. You're a plucked goose."
function gooseOnArm(t, o) {
  armBg(t, tvFlick(t));
  macroArm({ x: 540, y: 1192, rot: -0.1, s: 1.3, t, rise: () => 1, bumpK: () => 1, light: tvFlick(t) });
  const land = o.land, d = t - land;
  const drop = d < 0 ? E.inCubic(clamp((t - (land - 0.22)) / 0.22)) : 1;
  let sq = d >= 0 ? Math.exp(-d * 9) * Math.cos(d * 22) : 0;
  if (o.hop !== undefined && t > o.hop) sq = -0.5 * Math.exp(-(t - o.hop) * 8) * Math.cos((t - o.hop) * 20);   // startled by the title
  screenSpace();
  drawGoose(ctx, o.gx || 765, lerp(300, 956, drop), 0.78, t, { squash: sq, look: o.look, lid: o.lid, wing: o.wing, feathers: d });
  tvLight(t, 0.6);
}
SC.react = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const look = 1 - ramp(t, c.congrats_end, c.congrats_end + 0.2) * (1 - ramp(t, c.youre - 0.05, c.youre + 0.15));   // a glance down at the bumps
  gooseOnArm(t, { land: shot.start + 0.2, look, lid: 0.45, wing: ramp(t, c.goose, c.goose + 0.15) * (1 - ramp(t, c.goose_end, c.goose_end + 0.2)) });
  return { glow: 0.8, push: { k: 1 + 0.05 * lt / D, cx: 600, cy: 800 }, flash: 0.25 * (1 - ramp(lt, 0, 0.1)) };
};

// ---------------------------------------------------------------- 3. name: GOOSE / BUMPS
SC.name = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const blink = Math.exp(-(((t - (c.hence_end + 0.12)) / 0.07) ** 2));              // one slow blink in the pause
  gooseOnArm(t, { land: -9, look: 1 - 0.6 * ramp(t, c.goosebumps - 0.05, c.goosebumps + 0.1) * (1 - ramp(t, c.goosebumps_end, c.goosebumps_end + 0.2)),
    lid: Math.max(0.5 - 0.3 * ramp(t, c.goosebumps, c.goosebumps + 0.15), blink), wing: 0.6 * decay(t, c.goosebumps + 0.22, 4), gx: 765, hop: c.goosebumps });
  screenSpace();
  const k1 = ramp(t, c.goosebumps - 0.04, c.goosebumps + 0.16, E.outBack);
  const k2 = ramp(t, c.goosebumps + 0.22, c.goosebumps + 0.42, E.outBack);
  bigWord('GOOSE', 276, 590, 132, '#FFD447', k1, -0.07);
  bigWord('BUMPS', 276, 732, 132, '#FFFFFF', k2, -0.07);
  if (k1 > 0) softDot(gctx, 276, 660, 260, '#FFD447', 0.25 * k1);
  return { glow: 0.85, push: { k: 1 + 0.04 * lt / D, cx: 540, cy: 800 }, noCaptions: t > c.goosebumps - 0.08 };
};

// ---------------------------------------------------------------- 4. mech: every hair has its own tiny muscle; the nerve yanks them all
SC.mech = (lt, t, shot) => {
  const c = cu();
  const cam = camKeys(t, [
    [shot.start, -40, 96, 1.26], [c.own - 0.1, -10, 110, 1.34], [c.tiny + 0.25, 52, 112, 1.74], [c.muscle_end + 0.05, 52, 112, 1.8],
    [c.scared + 0.2, 0, 200, 0.93], [c.nerves, 0, 212, 0.93], [shot.end, 0, 226, 1.0],
  ], E.inOutCubic);
  const fire = c.yank + 0.03;
  const k = (i) => 0.45 * springStep(t - fire, 4.2, 0.3) + (t > fire ? 0.025 * Math.sin(t * 40 + i * 2) : 0);
  const hotK = ramp(t, c.tiny - 0.1, c.tiny + 0.2) * (1 - ramp(t, c.scared - 0.2, c.scared + 0.1)) * (0.75 + 0.25 * Math.sin(t * 12));
  const [qx, qy] = shake(t, 9 * decay(t, fire, 6), 30, 4);
  cam.sx = qx; cam.sy = qy;
  const F = skinSection(cam, t, { k, bump: () => 0, fire, hot: 3, hotK,
    nerveGlow: ramp(t, c.nerves - 0.1, c.nerves + 0.15) * (1 - ramp(t, c.once_end, c.once_end + 0.3)) });
  screenSpace();
  const km = ramp(t, c.tiny - 0.05, c.tiny + 0.2, E.outBack) * (1 - ramp(t, c.scared - 0.25, c.scared - 0.05));
  if (km > 0) { const m = toScreen(cam, F[3].M[0], F[3].M[1]); pill(690, 560, 'TINY MUSCLE', '#FF86A6', km, 50); leader([690, 602], [m[0] + 30, m[1] - 34], km, '#FF86A6'); }
  // the triggers: a ghost for "scared", a snowflake for "cold"
  const jit = 10 * decay(t, fire, 5) * Math.sin(t * 60);
  ghostIcon(262 + jit, 486, 1.15, ramp(t, c.scared - 0.28, c.scared - 0.05), t);
  flakeIcon(790 - jit, 496, 1.1, ramp(t, c.cold - 0.05, c.cold + 0.2), t);
  const kn = ramp(t, c.nerves - 0.05, c.nerves + 0.2, E.outBack) * (1 - ramp(t, c.yank - 0.1, c.yank + 0.1));
  if (kn > 0) { const n = toScreen(cam, -330, nerveY(-330)); pill(250, n[1] - 76, 'NERVE', '#FFB83D', kn, 48); }
  // the yank: a flash at every muscle
  if (t > fire) for (const f of F) { const m = toScreen(cam, f.M[0], f.M[1]); shockLines(m[0], m[1], 60, inv(fire, fire + 0.35, t), 9, '#FFD8E2', 5); }
  return { glow: 0.9, zblur: 0.1 * (1 - ramp(lt, 0, 0.3)) + 0.05 * decay(t, fire, 9), zcx: 540, zcy: 900 };
};

// ---------------------------------------------------------------- 5. bump: the hair stands up, the skin bunches into a bump
SC.bump = (lt, t, shot) => {
  const c = cu();
  const cam = camKeys(t, [[shot.start, 70, 36, 1.46], [c.up_end, 46, 14, 1.6], [c.bunches + 0.2, 40, 4, 1.74], [shot.end, 34, -4, 1.86]], E.inOutSine);
  const up = springStep(t - (c.stands - 0.06), 2.5, 0.4);
  const k = () => 0.45 + 0.55 * up;
  const bk = springStep(t - (c.bunches - 0.02), 3.0, 0.45);
  const F = skinSection(cam, t, { k, bump: () => bk });
  screenSpace();
  // where the hair was lying: a ghost of it, and the arc it swung through
  const f = F[3], P = toScreen(cam, f.P[0], f.P[1]), L = SKIN.hair * cam.zoom;
  const a0 = -Math.PI / 2 + lerp(SKIN.aRel, SKIN.aUp, 0.45), a1 = -Math.PI / 2 + f.a;
  const ka = ramp(t, c.stands - 0.02, c.stands + 0.3) * (1 - ramp(t, c.skin - 0.1, c.skin + 0.25));
  if (ka > 0.01) {
    ctx.setLineDash([16, 14]); line(ctx, P[0], P[1], P[0] + Math.cos(a0) * L, P[1] + Math.sin(a0) * L, 7, `rgba(255,255,255,${0.35 * ka})`); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(P[0], P[1], L * 0.86, a0, a1, true); ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.strokeStyle = rgba('#FFD447', 0.95 * ka); ctx.stroke();
    const hx = P[0] + Math.cos(a1) * L * 0.86, hy = P[1] + Math.sin(a1) * L * 0.86, ta = a1 - Math.PI / 2;
    for (const s of [-0.5, 0.5]) line(ctx, hx, hy, hx - Math.cos(ta + s) * 34, hy - Math.sin(ta + s) * 34, 10, rgba('#FFD447', 0.95 * ka));
    gctx.beginPath(); gctx.arc(P[0], P[1], L * 0.86, a0, a1, true); gctx.lineWidth = 22; gctx.strokeStyle = rgba('#FFD447', 0.6 * ka); gctx.stroke();
  }
  // BUMP! with an arrow down to it
  const kb = ramp(t, c.bump - 0.04, c.bump + 0.18, E.outBack);
  if (kb > 0) {
    bigWord('BUMP!', 300, 600, 136, '#FFD447', kb, -0.08);
    const B = toScreen(cam, f.P[0] - 34, f.P[1] + 4), bx = B[0] - 8, by = B[1] - 34;          // the near shoulder of the bump
    line(ctx, 330, 690, bx, by, 9, rgba('#FFD447', kb)); for (const s of [-0.45, 0.45]) { const aa = Math.atan2(by - 690, bx - 330); line(ctx, bx, by, bx - Math.cos(aa + s) * 30, by - Math.sin(aa + s) * 30, 9, rgba('#FFD447', kb)); }
  }
  if (t > c.bunches) shockLines(P[0], P[1] + 10, 110, inv(c.bunches, c.bunches + 0.4, t), 10, '#FFE9D8', 8);
  return { glow: 0.9, zblur: 0.14 * (1 - ramp(lt, 0, 0.25)), zcx: P[0], zcy: P[1] };
};

// ---------------------------------------------------------------- 6. fur: for furry animals it's genius (warm air)
SC.fur = (lt, t, shot) => {
  const c = cu();
  const cam = camKeys(t, [[shot.start, 500, 930, 1.0], [c.fluffed - 0.1, 500, 936, 1.06], [c.traps + 0.3, 500, 930, 1.1], [shot.end, 500, 926, 1.14]], E.inOutSine);
  yardBg(cam, t);
  const fl = springStep(t - (c.fluffed - 0.04), 3.2, 0.36);            // POOF: the fur stands
  const warm = ramp(t, c.traps + 0.05, c.warm + 0.25), happy = ramp(t, c.traps - 0.1, c.traps + 0.3);
  ellipse(ctx, 440, 1198, 240, 30, 'rgba(40,60,130,0.35)');
  coldWind(ctx, t, 440, 960, 1 - 0.25 * clamp(fl));
  drawCat(ctx, 440, 1190, 1.22, t, { puff: fl, happy, shiver: 5 * (1 - clamp(fl)), warm, lookX: -0.4 * (1 - happy) });
  snowflakes(t, 0.8);
  screenSpace();
  bulbIcon(800, 520, 1.0, ramp(t, c.genius - 0.05, c.genius + 0.2) * (1 - ramp(t, c.fluffed + 0.1, c.fluffed + 0.35)), t);
  if (t > c.fluffed - 0.04) shockLines(...toScreen(cam, 440, 900), 330, inv(c.fluffed - 0.04, c.fluffed + 0.4, t), 16, '#FFE2C0', 9);
  const kw = ramp(t, c.warm - 0.05, c.warm + 0.2, E.outBack);
  if (kw > 0) { pill(800, 600, 'WARM AIR', '#FF9A3C', kw, 46); leader([790, 640], toScreen(cam, 640, 880), kw, '#FF9A3C'); }
  return { glow: 0.85, zblur: 0.1 * (1 - ramp(lt, 0, 0.3)) + 0.05 * decay(t, c.fluffed - 0.04, 7), zcx: 480, zcy: 900 };
};

// ---------------------------------------------------------------- 7. huge: a scared cat looks HUGE (the dog thinks again)
SC.huge = (lt, t, shot) => {
  const c = cu();
  const poof = springStep(t - (c.huge - 0.03), 3.3, 0.33);
  const scared = ramp(t, c.scaredcat - 0.2, c.scaredcat + 0.05);
  const [qx, qy] = shake(t, 15 * decay(t, c.huge, 5), 28, 6);
  const cam = camKeys(t, [[shot.start, 590, 936, 1.02], [c.look, 580, 930, 1.05], [c.huge + 0.18, 560, 890, 0.93], [shot.end, 560, 890, 0.96]], E.inOutCubic);
  cam.sx = qx; cam.sy = qy;
  yardBg(cam, t);
  // the dog: slides in on "and makes a", snarls ... and once the cat is HUGE, thinks again
  const kin = ramp(t, shot.start + 0.03, shot.start + 0.5, E.outCubic);
  const fear = ramp(t, c.huge + 0.22, c.huge + 0.36);
  const out = ramp(t, c.huge_end - 0.15, shot.end + 0.15, E.inCubic);
  const dx = lerp(1420, 960, kin) + 90 * fear + 520 * out + 5 * Math.sin(t * 30) * (1 - fear) * kin;
  dogShadow(ctx, dx, 720, 1.0, t, { snarl: kin * (1 - fear), fear });
  const inhale = ramp(t, c.look - 0.05, c.huge - 0.05) * (1 - clamp(poof * 3));
  const s = 1.05 * (1 - 0.08 * inhale) * (1 + 0.42 * poof);
  ellipse(ctx, 400, 1198, 240 * (1 + 0.4 * clamp(poof)), 30, 'rgba(40,60,130,0.35)');
  drawCat(ctx, 400, 1190, s, t, { puff: 1 + 0.9 * poof, scared, lookX: 0.9 * scared, tailUp: scared, shiver: 4 * scared * (1 - clamp(poof)) });
  snowflakes(t, 0.8);
  screenSpace();
  if (t > c.huge - 0.03) shockLines(...toScreen(cam, 400, 820), 420, inv(c.huge - 0.03, c.huge + 0.45, t), 18, '#FFE2C0', 11);
  // the dog's second thoughts
  const kq = ramp(t, c.huge + 0.3, c.huge + 0.5, E.outBack) * (1 - out);
  if (kq > 0) { const d = toScreen(cam, dx - 40, 560); bigWord('!?', Math.min(d[0], 900), d[1] - 60, 130, '#FFFFFF', kq, 0.12); }
  return { glow: 0.85, zblur: 0.1 * decay(t, c.huge - 0.03, 7), zcx: 400, zcy: 850, flash: 0.18 * decay(t, c.huge - 0.03, 12) };
};

// ---------------------------------------------------------------- the couch, for the last third
const BTN = { x: 792, y: 590, R: 182 };
// his ancestors' fur: spikes round his head, body and arms (drawn under him) and a fur tint over his clothes (drawn on
// him, see furTint). It lets go on "lost": the spikes drop, the tint fades.
const FURCOL = '#8A5A30';
function furSuit(t, st, drop) {
  if (drop >= 1) return;
  const len = 46, r = rig(st.pose);
  ctx.save(); ctx.globalAlpha = clamp(1 - drop * 1.25); ctx.translate(0, 480 * drop * drop);
  furRing(ctx, st.x, st.y - 318 * st.s, 76 * st.s, 84 * st.s, 22, len * 0.75, FURCOL, t, 7, -Math.PI * 1.25, Math.PI * 0.25);
  furRing(ctx, st.x, st.y - 126 * st.s, 96 * st.s, 116 * st.s, 24, len, FURCOL, t, 8, -Math.PI * 1.05, Math.PI * 0.05);
  ctx.translate(st.x, st.y); ctx.scale(st.s, st.s);
  ctx.fillStyle = FURCOL;
  for (const k of ['L', 'R']) for (const [a, b] of [[r['sh' + k], r['el' + k]], [r['el' + k], r['wr' + k]]]) {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    for (const sd of [-1, 1]) for (let i = 0; i < 5; i++) {
      const u = (i + 0.5) / 5, bx = a[0] + dx * u + nx * sd * 17, by = a[1] + dy * u + ny * sd * 17, l = 30 * (0.7 + 0.6 * hash(i + sd * 3 + (k === 'L' ? 9 : 0)));
      ctx.beginPath(); ctx.moveTo(bx - dx / L * 11, by - dy / L * 11); ctx.lineTo(bx + nx * sd * l, by + ny * sd * l); ctx.lineTo(bx + dx / L * 11, by + dy / L * 11); ctx.closePath(); ctx.fill();
    }
  }
  ctx.restore();
}
function furTint(drop) {
  return (lc, rr) => {
    const a = clamp(1 - drop * 1.4);
    if (a <= 0.01) return;
    lc.save(); lc.globalCompositeOperation = 'source-atop';
    lc.fillStyle = rgba(FURCOL, 0.92 * a); lc.fillRect(-400, -181, 800, 260);
    for (let i = 0; i < 46; i++) {                                // short darker strokes: a pelt, not a sweater
      const x = -150 + hash(i + 1) * 300, y = -170 + hash(i + 40) * 180;
      line(lc, x, y, x + 5 * (hash(i + 7) - 0.5), y + 16, 4, `rgba(70,40,18,${0.5 * a})`);
    }
    lc.restore();
  };
}
// the callout: a leader from the back of his neck to the control panel with the big red button
function buttonCallout(cam, t, st, k, o = {}) {
  if (k <= 0) return;
  const nk = toScreen(cam, st.x + 34, st.y - 236 * st.s);
  leader([nk[0], nk[1]], [BTN.x - BTN.R * 0.8, BTN.y + BTN.R * 0.6], clamp(k * 1.5), '#7FE9FF');
  fluffButton(BTN.x, BTN.y, BTN.R, t, Object.assign({ k }, o));
}

// ---------------------------------------------------------------- 8. joke: "You lost the fur... but kept the button."
SC.joke = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 620, y: 1010, zoom: 1.5 + 0.06 * ramp(lt, 0, D, E.inOutSine), rot: 0 };
  const drop = ramp(t, c.lost + 0.02, c.fur2 + 0.25, E.inCubic);
  const claws = 1 - ramp(t, c.lost, c.lost + 0.3, E.inOutCubic);                 // he was doing the cat
  const kb = ramp(t, c.kept - 0.08, c.kept + 0.2);
  let face = lerpFace(Object.assign({}, FACES.shock, { browY: -0.4, browTilt: -1.1, mouth: 'grimace', eyeOpen: 1.2 }), Object.assign({}, FACES.worried, { lookX: 0, lookY: 1, mouth: 'flat', mouthOpen: 0.2, browY: 0.9 }), ramp(t, c.lost, c.lost + 0.25));
  face = lerpFace(face, Object.assign({}, FACE_DEADPAN, { lookX: 0.95, lookY: -0.8, blink: 0.2, browY: 0.6 }), kb);
  const sc = couchScene(cam, t, {
    hero: { face, up: claws, hug: 1, headDY: 6 * drop * (1 - kb), headRot: 0.05 * kb, tremble: 0.03 * claws, bristle: 0.2 },
    under: (c2, st) => furSuit(t, st, drop),
    post: furTint(drop),
  });
  // loose tufts drifting down after the fur lets go
  applyCam(cam);
  if (t > c.lost) for (let i = 0; i < 9; i++) {
    const d = t - c.lost - i * 0.03; if (d < 0) continue;
    const x = ROOM.hx + (hash(i + 3) - 0.5) * 420 + 40 * Math.sin(d * 3 + i), y = ROOM.seatY - 380 + hash(i + 9) * 260 + 300 * d * d + 60 * d;
    ctx.save(); ctx.translate(x, y); ctx.rotate(d * 3 * (i % 2 ? 1 : -1)); ctx.globalAlpha = clamp(1.6 - d * 1.6);
    furRing(ctx, 0, 0, 5, 5, 5, 20, FURCOL, 0, i); ctx.restore();
  }
  tvLight(t, 0.9);
  screenSpace();
  buttonCallout(cam, t, sc.st, kb, { press: 0 });
  if (t > c.button) shockLines(BTN.x, BTN.y, 170, inv(c.button, c.button + 0.4, t), 12, '#FF9AA6', 12);
  return { glow: 0.85, zblur: 0.1 * (1 - ramp(lt, 0, 0.25)), zcx: 440, zcy: 880 };
};

// ---------------------------------------------------------------- 9. music: a note presses it; the same old alarm
SC.music = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(t, [[shot.start, 548, 952, 2.05], [c.music2 + 0.15, 552, 956, 1.98], [c.press + 0.05, 620, 1010, 1.56], [shot.end, 620, 1010, 1.62]], E.inOutCubic);
  const hp = ramp(lt, 0.02, 0.3);
  const hit = c.hit;                                             // the note lands on the button, just after "press it."
  const press = decay(t, hit, 5.5), chill = ramp(t, hit, hit + 0.25);
  const alarm = ramp(t, c.trip - 0.05, c.same) * (1 - 0.0 * lt);
  const bob = Math.sin(t * 7.2) * (1 - 0.6 * chill);
  let face = lerpFace(Object.assign({}, FACE_DEADPAN, { lookX: 0.95, lookY: -0.8, blink: 0.2 }), FACE_BLISS, ramp(lt, 0.15, 0.5));
  face = lerpFace(face, Object.assign({}, FACES.startled, { mouth: 'grin', mouthOpen: 0.7, browY: 1.3, lookY: -0.2 }), chill * (1 - ramp(t, c.scientists, c.scientists + 0.4)));
  face = lerpFace(face, Object.assign({}, FACE_BLISS, { tear: ramp(t, c.emotions, c.emotions_end + 0.3) }), ramp(t, c.scientists, c.scientists + 0.4));
  const frizz = 0.5 * chill * (0.8 + 0.2 * Math.sin(t * 30)) * (1 - 0.4 * ramp(t, c.scientists, c.big)) + 0.25 * alarm;
  const sc = couchScene(cam, t, {
    hero: { face, hug: 1, headRot: 0.07 * bob, headDX: 5 * bob, frizz, bristle: 0.2 + 0.8 * chill, tremble: 0.03 * chill, lean: 0.015 * bob },
    headphones: hp,
  });
  applyCam(cam);
  // the shiver that runs down his arms when it lands
  const hd = toWorld(sc.st, sc.r.head);
  if (t > hit) shockLines(...toScreen(cam, sc.st.x, sc.st.y - 150 * sc.st.s), 250, inv(hit, hit + 0.5, t), 14, '#DCE6FF', 13);
  // notes rising from the headphones
  const cols = ['#7FE9FF', '#FFD447', '#FF86A6', '#4DFFB4', '#C8A8FF'];
  for (let i = 0; i < 9; i++) {
    const p = ((t * 0.55 + i / 9) % 1), sd = i % 2 ? 1 : -1;
    const x = hd[0] + sd * (92 + 150 * p) + 26 * Math.sin(p * 7 + i), y = hd[1] - 30 - 330 * p;
    const a = Math.sin(Math.PI * p) * hp;
    for (const [cc, al] of [[ctx, a], [gctx, a * 0.7]]) { cc.save(); cc.globalAlpha = al; musicNote(cc, x, y, 0.62 + 0.3 * p, cols[i % 5], 0.3 * Math.sin(p * 5 + i), i % 3 === 0 ? 1 : 0); cc.restore(); }
  }
  tvLight(t, 0.8);
  screenSpace();
  buttonCallout(cam, t, sc.st, 1, { press, alarm });
  // THE note: an arc from his ear to the button
  const fly = inv(hit - 0.5, hit, t);
  if (fly > 0 && fly < 1) {
    const from = toScreen(cam, hd[0] + 90, hd[1] - 20), e = E.inCubic(fly);
    const x = lerp(from[0], BTN.x, fly), y = lerp(from[1], BTN.y - 60, e) - 250 * Math.sin(Math.PI * fly);
    for (const cc of [ctx, gctx]) { cc.save(); cc.setTransform(cc === gctx ? 0.5 : 1, 0, 0, cc === gctx ? 0.5 : 1, 0, 0); musicNote(cc, x, y, 1.5, '#7FE9FF', -0.3 + fly * 0.8, 1); cc.restore(); }
  }
  if (t > hit) shockLines(BTN.x, BTN.y - 20, 150, inv(hit, hit + 0.4, t), 12, '#FFFFFF', 14);
  // hedged, on screen too
  const kh = ramp(t, c.scientists - 0.05, c.scientists + 0.2, E.outBack);
  if (kh > 0) pill(BTN.x - 10, BTN.y + BTN.R + 64, 'ONE IDEA', '#8FB8FF', kh, 40);
  // big emotions: his heart swells
  const ke = ramp(t, c.big - 0.05, c.emotions + 0.15, E.outBack) * (1 - 0.0);
  if (ke > 0) { const ch = toScreen(cam, sc.st.x - 150, sc.st.y - 330 * sc.st.s); heartIcon(ch[0], ch[1], 2.0 * ke * (1 + 0.12 * Math.sin(t * 13)), 1); }
  return { glow: 0.9, flash: 0.14 * decay(t, hit, 12), push: { k: 1 + 0.13 * ramp(t, c.trip - 0.15, c.alarm + 0.1, E.inOutCubic), cx: 780, cy: 650 } };
};

// ---------------------------------------------------------------- 10. command: some people can do it on command
SC.command = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  armBg(t, 0.5);
  const st = (t0, u, j) => t - (t0 + (u + 880) / 1760 * 0.16 + j * 0.05);
  const rise = (u, j) => clamp(springStep(st(c.sw_on1, u, j), 6, 0.45) * (1 - ramp(st(c.sw_off, u, j), 0, 0.16)) + springStep(st(c.sw_on2, u, j), 6, 0.45), 0, 1.3);
  const on = t >= c.sw_on2 ? 1 : (t >= c.sw_on1 && t < c.sw_off ? 1 : 0);
  const kick = decay(t, c.sw_on1, 9) + decay(t, c.sw_off, 9) + decay(t, c.sw_on2, 9);
  macroArm({ x: 540, y: 1090 - 20 * lt / D, rot: -0.1, s: 1.3 + 0.05 * lt / D, t, rise, bumpK: rise, shiver: 5 * kick, light: 0.5 });
  screenSpace();
  const ks = ramp(lt, 0.05, 0.3);
  lightSwitch(290 + 3 * kick * Math.sin(t * 60), 552, 1.22, on, t, ks);
  // ON / OFF next to it
  const kw = ramp(t, c.sw_on1 - 0.02, c.sw_on1 + 0.14, E.outBack);
  if (kw > 0) bigWord(on ? 'ON' : 'OFF', 590, 590, 170, on ? '#4DFFB4' : '#9AA3B8', kw * (1 + 0.14 * kick), -0.05);
  for (const tk of [c.sw_on1, c.sw_off, c.sw_on2]) if (t > tk) shockLines(290, 552, 190, inv(tk, tk + 0.3, t), 8, '#FFFFFF', 15);
  const kp = ramp(t, c.people - 0.05, c.people + 0.2, E.outBack);
  if (kp > 0) pill(772, 432, 'STUDY: 32 PEOPLE', '#FFD447', kp, 34);
  return { glow: 0.85, zblur: 0.12 * (1 - ramp(lt, 0, 0.25)), zcx: 540, zcy: 900, flash: 0.2 * (1 - ramp(lt, 0, 0.1)) };
};

// ---------------------------------------------------------------- 11. showoffs: he tries. Nothing.
function strainPost(k) {
  return (lc, rr, s2) => {                   // his face goes red with the effort
    if (k <= 0.01) return;
    const [hx, hy] = rr.head;
    lc.save(); lc.globalCompositeOperation = 'source-atop'; ellipse(lc, hx + (s2.headDX || 0), hy + (s2.headDY || 0), 70, 80, `rgba(255,50,40,${0.3 * k})`); lc.restore();
  };
}
SC.showoffs = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 540, y: 990, zoom: 2.0 + 0.08 * lt / D, rot: 0 };
  const give = ramp(t, c.showoffs - 0.02, c.showoffs + 0.14);                     // he gives up on "Show-offs."
  const strain = 1 - give;
  const face = lerpFace(FACE_STRAIN, Object.assign({}, FACE_DEADPAN, { lookX: 0.4, lookY: -0.3, blink: 0.5, browTilt: -0.6 }), give);
  const sc = couchScene(cam, t, {
    hero: { face, hug: 1, tremble: 0.06 * strain, headRot: 0.02 * Math.sin(t * 70) * strain, headDY: -6 * strain + 8 * give, bristle: 0.0, lean: 0.01 * Math.sin(t * 55) * strain },
    post: strainPost(strain * ramp(lt, 0, 0.25)),
  });
  applyCam(cam);
  const hd = toWorld(sc.st, sc.r.head);
  for (const [dx, d0] of [[78, 0.1], [-74, 0.3]]) sweatDrop(ctx, hd[0] + dx, hd[1] - 40 + 90 * clamp((lt - d0) / 0.9), 1.1, clamp((lt - d0) * 5) * strain);
  // effort lines
  if (strain > 0.1) for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.36, r0 = 120 + 10 * Math.sin(t * 40 + i), r1 = r0 + 34; line(ctx, hd[0] + Math.cos(a) * r0, hd[1] - 20 + Math.sin(a) * r0, hd[0] + Math.cos(a) * r1, hd[1] - 20 + Math.sin(a) * r1, 5, `rgba(255,120,110,${0.8 * strain})`); }
  tvLight(t, 0.8);
  return { glow: 0.8, flash: 0.2 * (1 - ramp(lt, 0, 0.1)) };
};

// ---------------------------------------------------------------- 12. sub: the tease, the click, ONE hair, the loop
SC.sub = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(t, [[shot.start, 540, 1000, 1.52], [c.sub_in, 540, 1004, 1.6], [shot.end, 540, 1010, 1.72]], E.inOutSine);
  const lift = ramp(t, c.sub_in - 0.1, c.sub_in + 0.35, E.inOutCubic);           // he holds his forearm up to watch it
  const one = springStep(t - c.onehair, 7, 0.35);                                 // the hair
  const proud = ramp(t, c.onehair + 0.12, c.onehair + 0.3) * (1 - ramp(t, c.loopflash - 0.02, c.loopflash + 0.06));
  const scare = ramp(t, c.loopflash, c.loopflash + 0.08);
  const pop = decay(t, c.pop_end, 5);
  let face = lerpFace(Object.assign({}, FACE_DEADPAN, { lookX: 0, lookY: -0.9, blink: 0.25, browY: 0.5 }), Object.assign({}, FACES.confused, { lookX: 0.2, lookY: -0.6 }), pop);
  face = lerpFace(face, Object.assign({}, FACES.calm, { lookX: 0.95, lookY: 0.1, browY: 0.6, browTilt: 0.5, mouth: 'flat', mouthOpen: 0.1 }), lift);
  face = lerpFace(face, Object.assign({}, FACES.grin, { lookX: 0.95, lookY: 0.1, mouthOpen: 0.75, browY: 1.1 }), proud);
  face = lerpFace(face, FACES.shock, scare);
  const base = couchPose({ hug: 1, t });
  const raised = ikReach(base, 'R', [128, -246], 1);
  const sc = couchScene(cam, t, {
    hero: { face, hug: 1, pose: raised, poseK: lift * (1 - scare), up: 0.35 * scare, headRot: 0.05 * lift - 0.04 * pop * Math.sin(t * 40), bristle: 0.05, frizz: 0.6 * scare },
    post: (lc, rr) => {
      if (one <= 0.01) return;
      // exactly one hair, standing proud on the raised forearm, with a sparkle on its tip
      const el = rr.elR, wr = rr.wrR, bx = lerp(el[0], wr[0], 0.5) + 18, by = lerp(el[1], wr[1], 0.5);
      line(lc, bx, by, bx + 46 * Math.min(one, 1.2), by - 6 * one, 4.6, '#3B2416');
    },
  });
  applyCam(cam);
  if (one > 0.01) {
    const p = toWorld(sc.st, [lerp(sc.r.elR[0], sc.r.wrR[0], 0.5) + 66, lerp(sc.r.elR[1], sc.r.wrR[1], 0.5) - 7]);
    const tw = decay(t, c.onehair, 2.2);
    for (const cc of [ctx, gctx]) { for (let i = 0; i < 4; i++) { const a = i * Math.PI / 4 + t * 2; line(cc, p[0] - Math.cos(a) * 26 * tw, p[1] - Math.sin(a) * 26 * tw, p[0] + Math.cos(a) * 26 * tw, p[1] + Math.sin(a) * 26 * tw, cc === gctx ? 9 : 4, rgba('#FFE680', clamp(tw * 1.5))); } }
    const ps = toScreen(cam, p[0], p[1]);
    pill(Math.min(ps[0] + 60, 826), ps[1] - 96, '1 HAIR!', '#FFD447', ramp(t, c.onehair + 0.05, c.onehair + 0.22, E.outBack) * (1 - scare), 42);
    applyCam(cam);
  }
  // his ears go "pop" on the word
  const hd = toScreen(cam, ...toWorld(sc.st, sc.r.head));
  if (t > c.pop) for (const sd of [-1, 1]) shockLines(hd[0] + sd * 118, hd[1] + 4, 34, inv(c.pop, c.pop + 0.35, t), 7, '#7FE9FF', 16 + sd);
  tvLight(t, 0.9);
  screenSpace();
  // the tease card
  const kn = ramp(t, c.nextup - 0.05, c.nextup + 0.22, E.outBack) * (1 - ramp(t, c.sub_in - 0.05, c.sub_in + 0.25));
  if (kn > 0) {
    ctx.save(); ctx.translate(540, 520); ctx.rotate(-0.04); ctx.scale(kn, kn);
    rrect(ctx, -300, -84, 600, 168, 24); ctx.fillStyle = '#FFF6D8'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#FFD447'; ctx.stroke();
    ctx.font = '800 36px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#6A5A2A'; ctx.fillText('NEXT UP', 0, -44);
    ctx.font = '400 78px Anton'; ctx.fillStyle = '#1A1C2C'; ctx.fillText('EARS POP', -44, 24);
    // a little plane
    ctx.translate(196 + 6 * Math.sin(t * 5), 20 + 4 * Math.sin(t * 7)); ctx.rotate(-0.25); ctx.fillStyle = '#2A6FD6';
    ctx.beginPath(); ctx.moveTo(-44, 6); ctx.lineTo(40, -4); ctx.quadraticCurveTo(54, 0, 40, 6); ctx.lineTo(-44, 14); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-6, 2); ctx.lineTo(-30, -30); ctx.lineTo(-16, -30); ctx.lineTo(16, 0); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-6, 8); ctx.lineTo(-30, 38); ctx.lineTo(-16, 38); ctx.lineTo(16, 8); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-40, 6); ctx.lineTo(-54, -14); ctx.lineTo(-44, -14); ctx.lineTo(-30, 6); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  return { glow: 0.82, flash: 0.14 * ramp(t, c.loopflash, TLd.duration, E.inCubic) };
};

// ---------------------------------------------------------------- the cover (rendered on its own, not in the timeline)
SC.cover = (lt, t, shot) => {
  armBg(1.3, 0.8);
  macroArm({ x: 540, y: 1400, rot: -0.1, s: 1.45, t: 1.3, rise: () => 1, bumpK: () => 1, light: 0.8 });
  screenSpace();
  drawGoose(ctx, 690, 1168, 0.84, 1.3, { look: 1, lid: 0.42, wing: 0 });
  bigWord('GOOSEBUMPS', 540, 486, 176, '#FFD447', 1, -0.03);
  softDot(gctx, 540, 486, 420, '#FFD447', 0.22);
  bigWord('WHY?!', 300, 1440, 210, '#FFFFFF', 1, -0.06);
  return { glow: 0.85, noCaptions: true, noSubscribe: true, grain: 0 };
};

function initScenes2() {
  initRoom(); initArm(); initSkin(); initCat();
}
