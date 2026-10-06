// Why Do We Get DÉJÀ VU? Short: the lab, the fortune teller's table and the way back to frame 1 (lab, psychic, button),
// plus the cover.
'use strict';

const FACE_VR = Object.assign({}, FACES.calm, { mouth: 'grin', mouthOpen: 0.45, browY: 0.8, browTilt: -0.3 });
const FACE_WHAT = Object.assign({}, FACES.confused, { eyeOpen: 1.32, pupil: 0.62, lookX: 0, lookY: -0.8, browY: 1.3, browTilt: 0.9, mouth: 'o', mouthOpen: 0.32 });
const FACE_OMM = Object.assign({}, FACES.calm, { blink: 1, browY: 1.1, browTilt: 0.5, mouth: 'o', mouthOpen: 0.3 });
const FACE_OHNO = Object.assign({}, FACES.annoyed, { eyeOpen: 1.05, lookX: 0, lookY: 0.95, blink: 0.25, browY: 0.2, browTilt: -0.3, mouth: 'flat', mouthOpen: 0.1 });
const FACE_PEER = Object.assign({}, FACES.startled, { eyeOpen: 1.36, pupil: 0.6, lookX: 0, lookY: 1, browY: 1.3, browTilt: 0.5, mouth: 'o', mouthOpen: 0.4 });

// ---------------------------------------------------------------- 10. lab: sure of it ... and no better than a coin
SC.lab = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const pick = springStep(t - c.arrow, 3.6, 0.5), res = ramp(t, c.wrong, c.wrong + 0.3);
  const lift = ramp(t, c.wrong + 0.18, c.wrong + 0.42, E.outBack);      // the headset goes up on his forehead: what?
  const [qx, qy] = shake(t, 12 * decay(t, c.wrong, 7) + 8 * decay(t, c.land, 8), 30, 13);
  const cam = camKeys(t, [[shot.start, 540, 1104, 1.22], [c.people, 540, 1092, 1.12], [c.wrong, 540, 1090, 1.15], [shot.end, 540, 1092, 1.19]], E.inOutCubic);
  cam.sx = qx; cam.sy = qy;
  applyCam(cam);
  labRoom(t);
  labScreen(150, 560, 780, 440, t, { pick: clamp(pick), result: res, walk: ramp(t, c.wrong - 0.4, c.wrong + 0.3, E.inOutSine) });
  // the coin's flight
  const tossed = t >= c.toss, fl = inv(c.toss, c.land, t), landed = t >= c.land;
  const coinX = lerp(716, 664, fl), coinY = landed ? 926 + 14 * decay(t, c.land, 9) * Math.cos((t - c.land) * 30) : lerp(1210, 926, fl) - 420 * Math.sin(Math.PI * fl);
  // him
  const sag = res * (1 - ramp(t, c.toss - 0.2, c.toss));
  let pose = STAND();
  pose = lerpPose(pose, ikReach(pose, 'L', [-216, -590 + 150 * sag], 1), clamp(pick, 0, 1.1) * (1 - 0.75 * ramp(t, c.toss - 0.25, c.toss + 0.05)));
  const flick = Math.sin(Math.PI * inv(c.toss - 0.14, c.toss + 0.2, t));
  pose = lerpPose(pose, ikReach(pose, 'R', [150, -330 - 90 * flick], 1), ramp(t, c.toss - 0.3, c.toss - 0.05) * (1 - 0.4 * ramp(t, c.land - 0.3, c.land)));
  const st0 = { x: 540, y: 1700, s: 1.2 };
  const hl = ikLocal(st0, coinX, coinY);
  let face = lerpFace(FACE_VR, FACE_WHAT, lift);
  if (tossed) face = Object.assign({}, face, { lookX: clamp((hl[0]) / 160, -1, 1), lookY: clamp((hl[1] + 470) / 160, -1, 1), mouth: landed ? 'flat' : 'o', mouthOpen: 0.3 });
  const st = Object.assign({}, st0, { pose, face, headRot: -0.07 * clamp(pick) * (1 - res) + 0.06 * res * (1 - lift), headDY: 6 * sag });
  charLayer(cam, st, t, { ambient: 0.16, post: (lc, r, s2) => labHeadsetUp(lc, r, s2, lift) });
  applyCam(cam);
  if (tossed) labCoin(coinX, coinY, 112, landed ? 0 : (t - c.toss) * 19, landed ? '50/50' : null);
  const kb = springStep(t - c.badge, 4.6, 0.42) * (1 - ramp(t, c.wrong + 0.05, c.wrong + 0.3, E.inCubic));
  const ks = toScreen(cam, coinX, coinY);
  screenSpace();
  shockLines(ks[0], ks[1], 150, inv(c.land, c.land + 0.4, t), 14, '#FFE9A0', 21);
  return {
    glow: 0.85, flash: 0.22 * (1 - ramp(lt, 0, 0.1)) + 0.1 * decay(t, c.wrong, 12), tint: '#FF8A96', tintA: 0.16 * decay(t, c.wrong, 3) * res,
    overlay: () => mindBurst('100% SURE', 752, 930, kb, t, 62, '#19A974', 0.07, '#0A2A1C'),
  };
};
// the headset can sit up on his forehead: a variant of labHeadset with a lift (0..1)
function labHeadsetUp(c, r, st, lift) {
  const s2 = Object.assign({}, st, { headDY: (st.headDY || 0) - 50 * lift });
  labHeadset(c, r, s2, -0.1 * lift);
}

// ---------------------------------------------------------------- the first frame again: the door, his palm coming up to it
// tt = seconds before the video's start (<= 0). The hook at t = 0 is exactly this at tt = 0.
function doorView(cam, tt) {
  const hs = hookState(tt);
  const face = Object.assign({}, FACE_PUSH, { lookX: 0.1, lookY: 0, blink: 0 });
  const st = Object.assign({}, hs.st, { pose: hs.pose, face, headDY: 0, frizz: 0, headRot: 0 });
  return cafeScene(cam, tt, { door: hs.open, bell: 0, hero: { st, outside: true }, palm: [hs.palm[0], hs.palm[1], hs.reach], wire: { ks: Array(8).fill(1), a: 0 } });
}

// ---------------------------------------------------------------- 11 + 12. psychic, button: the ball says no ... then shows a door
const RF = 1244;                                                  // the ball's radius when it is the whole frame
function fortuneShot(lt, t, shot) {
  const c = cu(), DUR = TLd.duration, [bx, by] = FT.ball;
  const tt = clamp(t - DUR, -0.45, 0);
  if (t >= c.loop) { doorView({ x: CAM_DOOR[0], y: CAM_DOOR[1], zoom: CAM_DOOR[2], rot: 0 }, tt); return { glow: 0.8 }; }
  const push = 1 + 0.08 * ramp(t, c.so2, c.psychic_end, E.inOutSine) + 0.16 * ramp(t, c.wait, c.dive, E.inOutSine);
  const u = ramp(t, c.dive, c.loop, E.inOutCubic);
  const K = push * Math.pow(RF / FT.R / 1.24, u);
  const [qx, qy] = shake(t, 10 * decay(t, c.ballx, 8), 30, 17);
  const cam = { x: bx, y: by, zoom: K, rot: 0, sx: bx - 540 + qx, sy: by - 960 + qy };
  const m = (FT.R * K) / RF;
  const camIn = { x: CAM_DOOR[0], y: CAM_DOOR[1], zoom: CAM_DOOR[2] * m, rot: 0, sx: (1 - m) * (bx - 540) + qx, sy: (1 - m) * (by - 960) + qy };
  applyCam(cam);
  fortuneBack(t);
  // him: the act, the verdict, the turban, then the look into the ball
  const no = ramp(t, c.ballx, c.ballx + 0.1), droop = springStep(t - c.droop, 3.2, 0.55), peer = ramp(t, c.flicker + 0.05, c.flicker + 0.3, E.outBack);
  const slip = clamp(droop, 0, 1.15) * (1 - 0.86 * clamp(peer));
  const wig = (1 - no) * 1;
  const tl = [-168 - 10 * Math.sin(t * 5) * wig, -292 + 16 * Math.cos(t * 5) * wig + 50 * clamp(droop) * (1 - clamp(peer))];
  const tr = [168 + 10 * Math.sin(t * 5 + 1) * wig, -292 + 16 * Math.cos(t * 5 + 1) * wig + 50 * clamp(droop) * (1 - clamp(peer))];
  let pose = STAND();
  pose = ikReach(pose, 'L', tl, 1); pose = ikReach(pose, 'R', tr, 1);
  pose = lerpPose(pose, ikReach(pose, 'L', [-78, -520], 1), clamp(peer));          // one hand pushes the turban back up
  pose.hand = no > 0.5 ? 'open' : 'spread';
  let face = Object.assign({}, FACE_OMM, { mouthOpen: 0.3 + 0.2 * Math.sin(t * 9) });
  face = lerpFace(face, FACE_OHNO, no);
  face = lerpFace(face, FACE_PEER, clamp(peer));
  const st = { x: 540, y: 1470 + 10 * clamp(peer), s: 1.3, pose, face, noLegs: true, headRot: 0.06 * Math.sin(t * 2.6) * (1 - no) + 0.03 * clamp(droop) * (1 - clamp(peer)), headDY: 8 * clamp(droop) * (1 - clamp(peer)) + 12 * clamp(peer) };
  charLayer(cam, st, t, { ambient: 0.14, post: (lc, r, s2) => turban(lc, r, s2, slip, t) });
  applyCam(cam);
  fortuneTable(t);
  const view = ramp(t, c.flicker + 0.08, c.flicker + 0.34);
  const stat = t >= c.flicker && t < c.flicker + 0.34 ? 1 - 0.6 * view : 0;
  fortuneBall(t, () => {
    if (view > 0) doorView(camIn, tt);
    applyCam(cam);
    if (view < 1) { ctx.globalAlpha = 1 - view; ctx.fillStyle = '#12082A'; ctx.fillRect(bx - FT.R, by - FT.R, 2 * FT.R, 2 * FT.R); ctx.globalAlpha = 1; ballMist(t, 1 - view); }
    if (no > 0 && view < 1) {                                   // the verdict
      const k = lerp(2, 1, E.outCubic(no)), a = (1 - view) * clamp(no * 3);
      ctx.save(); ctx.translate(bx, by); ctx.scale(k, k); ctx.lineCap = 'round';
      for (const [lw, col] of [[52, `rgba(40,4,14,${a})`], [32, `rgba(255,58,74,${a})`]]) { ctx.lineWidth = lw; ctx.strokeStyle = col; ctx.beginPath(); ctx.moveTo(-60, -60); ctx.lineTo(60, 60); ctx.moveTo(60, -60); ctx.lineTo(-60, 60); ctx.stroke(); }
      ctx.restore();
      softDot(gctx, bx, by, 150, '#FF3A4A', 0.3 * a);
    }
    if (stat > 0) {                                             // static, as the picture comes through
      const rng = mulberry32(Math.floor(t * FPS) * 13 + 5);
      for (let i = 0; i < 46; i++) { ctx.fillStyle = `rgba(230,236,255,${0.5 * stat * rng()})`; ctx.fillRect(bx - FT.R, by - FT.R + rng() * 2 * FT.R, 2 * FT.R, 3 + rng() * 9); }
    }
  }, 1 - ramp(t, c.dive, c.dive + 0.55), cam);
  const bs = toScreen(cam, bx, by);
  screenSpace();
  shockLines(bs[0], bs[1], 170 * K, inv(c.ballx, c.ballx + 0.4, t), 14, '#FF8A96', 23);
  shockLines(bs[0], bs[1], 170 * K, inv(c.flicker, c.flicker + 0.4, t), 14, '#FFE9A0', 29);
  return {
    glow: 0.85, capY: 1470, flash: (shot.id === 'psychic' ? 0.22 * (1 - ramp(lt, 0, 0.1)) : 0) + 0.12 * decay(t, c.flicker, 9),
    zblur: 0.22 * Math.sin(Math.PI * u), zcx: bs[0], zcy: bs[1], glitch: 0.4 * decay(t, c.flicker, 6) * ramp(t, c.flicker, c.flicker + 0.05),
  };
}
SC.psychic = fortuneShot;
SC.button = fortuneShot;

// ---------------------------------------------------------------- the cover (rendered on its own, not in the timeline)
SC.cover = (lt, t, shot) => {
  const tt = 3.2, cam = { x: 524, y: 1052, zoom: 1.62, rot: 0 };
  const st = Object.assign({}, HERO, { pose: lerpPose(POSES.stand, POSES.flinch, 0.6), face: Object.assign({}, FACE_DEJA, { mouthOpen: 0.7 }), frizz: 0.3, headDY: -4 });
  const ghosts = [-2, 2, -1, 1].map((k) => ({ st: Object.assign({}, st, { x: HERO.x + 74 * k }), a: 0.62 - 0.2 * Math.abs(k) }));
  const S = cafeScene(cam, tt, { hero: { st }, ghosts, wire: { ks: Array(8).fill(1), a: 0.3 } });
  const head = toScreen(cam, S.head[0], S.head[1]);
  screenSpace();
  const tg = ctx.createLinearGradient(0, 380, 0, 820); tg.addColorStop(0, 'rgba(6,10,28,0.62)'); tg.addColorStop(1, 'rgba(6,10,28,0)'); ctx.fillStyle = tg; ctx.fillRect(0, 0, W, 820);
  shockLines(head[0], head[1], 230, 0.3, 16, '#FFFFFF', 5);
  return {
    glow: 0.8, noCaptions: true, noSubscribe: true, grain: 0, desat: 0.25, tint: '#9FD8FF', tintA: 0.12,
    overlay: () => {
      bigWord('WHY DO WE GET', 540, 474, 118, '#FFFFFF', 1, -0.03);
      for (const [dx, a] of [[-30, 0.22], [30, 0.22], [-15, 0.4], [15, 0.4]]) { ctx.globalAlpha = a; bigWord('DÉJÀ VU?', 540 + dx, 644, 212, '#7FE9FF', 1, -0.04); }
      ctx.globalAlpha = 1; bigWord('DÉJÀ VU?', 540, 644, 212, '#FFD447', 1, -0.04);
    },
  };
};
