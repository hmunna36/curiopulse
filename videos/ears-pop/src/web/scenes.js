// Why Do Your Ears POP on a Plane? Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;
// e^(-k (t - t0)) after t0, else 0
const decay = (t, t0, k) => (t >= t0 ? Math.exp(-(t - t0) * k) : 0);

// ---------------------------------------------------------------- the section shots: camera + labels
const SEC_SY = 900;                                   // a section shot's focus point sits here on screen (above the captions)
const CAPY = 1470;                                    // captions sit lower than the house 1330 in this Short: the tray, the baby and the tube need the room
function secCam(t, keys, ease) { const k = camKeys(t, keys, ease); k.y += (960 - SEC_SY) / k.zoom; return k; }
// a label pill with a leader to a world point
function secLabel(cam, txt, px, py, wx, wy, k, col, size = 44) {
  if (k <= 0) return;
  const p = toScreen(cam, wx, wy);
  leader([px, py + (p[1] > py ? size * 0.8 : -size * 0.8)], p, clamp(k * 1.4), col);
  pill(px, py, txt, col, k, size);
}
// the cabin-pressure readout: a little plane (nose up = climbing, down = landing), the words, and an arrow that keeps falling / rising
function pressureHud(x, y, k, dir, t) {
  if (k <= 0) return;
  const col = dir < 0 ? '#7FE9FF' : '#FF5A6E', s = E.outBack(clamp(k), 1.8);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -300, -62, 600, 124, 62); ctx.fillStyle = 'rgba(8,12,34,0.9)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = col; ctx.stroke();
  // the plane
  ctx.save(); ctx.translate(-228, 0 + 5 * Math.sin(t * 6)); ctx.rotate(dir < 0 ? -0.42 : 0.36); ctx.fillStyle = '#FFFFFF';
  ctx.beginPath(); ctx.moveTo(-44, 5); ctx.lineTo(36, -5); ctx.quadraticCurveTo(52, 0, 36, 7); ctx.lineTo(-44, 13); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-6, 2); ctx.lineTo(-28, -30); ctx.lineTo(-14, -30); ctx.lineTo(16, 0); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-6, 8); ctx.lineTo(-28, 36); ctx.lineTo(-14, 36); ctx.lineTo(16, 8); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-40, 6); ctx.lineTo(-52, -14); ctx.lineTo(-42, -14); ctx.lineTo(-30, 6); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.font = '900 30px Montserrat'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = 'rgba(210,222,255,0.92)'; ctx.fillText('CABIN', -160, -22);
  ctx.font = '400 54px Anton'; ctx.fillStyle = col; ctx.fillText('PRESSURE', -160, 22);
  // the arrow: marching down (dropping) or up (rising)
  const ph = (t * 1.5) % 1, ay = (dir < 0 ? 1 : -1) * lerp(-22, 22, ph);
  ctx.globalAlpha = Math.sin(Math.PI * ph) * 0.5 + 0.5;
  ctx.translate(222, ay); ctx.scale(1, dir < 0 ? 1 : -1);
  ctx.beginPath(); ctx.moveTo(-13, -34); ctx.lineTo(13, -34); ctx.lineTo(13, 0); ctx.lineTo(32, 0); ctx.lineTo(0, 36); ctx.lineTo(-32, 0); ctx.lineTo(-13, 0); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  ctx.restore();
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); rrect(gctx, x - 300 * s, y - 62 * s, 600 * s, 124 * s, 62 * s); gctx.lineWidth = 12; gctx.strokeStyle = rgba(col, 0.55); gctx.stroke(); gctx.restore();
}
// "POP!" with a ring of sparks
function popWord(x, y, t, t0, size = 150, col = '#FFD447', rot = -0.08) {
  if (t < t0) return;
  const d = t - t0, k = E.outBack(clamp(d / 0.14), 2.6) * (1 - ramp(t, t0 + 0.55, t0 + 0.8));
  if (k <= 0) return;
  shockLines(x, y, size * 0.9, inv(t0, t0 + 0.4, t), 14, '#FFFFFF', 31);
  bigWord('POP!', x, y, size, col, k, rot);
  softDot(gctx, x, y, size * 1.6, col, 0.5 * decay(t, t0, 4));
}

// ---------------------------------------------------------------- 3. pocket: in through the ear, to the eardrum, to the pocket of air behind it
SC.pocket = (lt, t, shot) => {
  const c = cu();
  const cam = secCam(t, [
    [shot.start, -650, 0, 1.12], [c.eardrum + 0.12, -40, -4, 1.72], [c.eardrum_end + 0.08, -20, -6, 1.8],
    [c.pocket + 0.12, 112, -16, 2.18], [shot.end, 122, -18, 2.36],
  ], E.inOutCubic);
  const hiP = ramp(t, c.pocket - 0.12, c.pocket + 0.25);
  earSection(cam, t, { bulge: 0.06 * Math.sin(t * 5), canal: 1, pocket: 1, nose: 1, hiDrum: ramp(t, c.eardrum - 0.1, c.eardrum + 0.15) * (1 - ramp(t, c.tiny, c.pocket)), hiPocket: hiP, jit: 0.25 * hiP });
  screenSpace();
  const kd = ramp(t, c.eardrum - 0.04, c.eardrum + 0.16, E.outBack) * (1 - ramp(t, c.pocket - 0.25, c.pocket - 0.05));
  secLabel(cam, 'EARDRUM', 330, 560, 6, -70, kd, '#FF86A6', 50);
  const kp = ramp(t, c.pocket - 0.04, c.pocket + 0.16, E.outBack);
  secLabel(cam, 'AIR POCKET', 650, 520, 150, -70, kp, '#7FE9FF', 50);
  return { capY: CAPY, glow: 0.85, zblur: 0.35 * (1 - ramp(lt, 0, 0.35)), zcx: 540, zcy: SEC_SY, flash: 0.3 * (1 - ramp(lt, 0, 0.14)) };
};

// ---------------------------------------------------------------- 4. climb: the cabin pressure drops, the air in the pocket swells, the eardrum bulges
SC.climb = (lt, t, shot) => {
  const c = cu();
  const cam = secCam(t, [
    [shot.start, 122, -18, 2.36], [c.cabin + 0.1, -150, 0, 1.3], [c.drops_end, -140, 0, 1.34],
    [c.swells + 0.15, 30, -6, 1.74], [shot.end, 40, -8, 1.9],
  ], E.inOutCubic);
  const thin = ramp(t, c.pressure, c.drops_end + 0.25, E.inOutSine);
  const sw = 0.22 * ramp(t, c.drops, c.so, E.inOutSine) + 0.78 * springStep(t - (c.swells - 0.06), 2.6, 0.4);
  const [qx, qy] = shake(t, 5 * decay(t, c.swells, 4), 30, 3);
  cam.sx = qx; cam.sy = qy;
  earSection(cam, t, { bulge: sw, canal: lerp(1, 0.42, thin), pocket: 1, nose: 1, jit: 0.3 + 1.2 * ramp(t, c.so, c.swells + 0.2),
    hiPocket: 0.25 + 0.6 * ramp(t, c.so, c.swells), hiDrum: clamp(sw), push: 1, pushK: ramp(t, c.so - 0.1, c.so + 0.3) });
  screenSpace();
  pressureHud(540, 500, ramp(t, c.as, c.as + 0.25), -1, t);
  const ks = ramp(t, c.swells - 0.02, c.swells + 0.16, E.outBack);
  if (ks > 0) { const d = toScreen(cam, -38, -10); shockLines(d[0], d[1], 150, inv(c.swells, c.swells + 0.45, t), 12, '#FFE3D0', 5); }
  return { capY: CAPY, glow: 0.88 };
};

// ---------------------------------------------------------------- 5. tube: down the tube to the back of the nose; it burps the extra out
SC.tube = (lt, t, shot) => {
  const c = cu();
  const cam = secCam(t, [
    [shot.start, 40, -8, 1.9], [c.tiny2, 120, 40, 1.72], [c.tube + 0.18, 372, 330, 1.52], [c.back, 470, 470, 1.36],
    [c.nose + 0.12, 640, 640, 1.2], [c.burps + 0.34, 330, 320, 0.98], [c.out_end, 320, 310, 1.0], [shot.end, 250, 220, 1.12],
  ], E.inOutCubic);
  const open = springStep(t - c.vent, 5, 0.5) * (1 - ramp(t, c.snap + 0.1, c.snap + 0.3));
  const leave = ramp(t, c.vent + 0.1, c.out_end, E.inOutSine);
  const bulge = 1 - 0.72 * leave - 0.28 * springStep(t - c.snap, 5, 0.3);
  const [qx, qy] = shake(t, 9 * decay(t, c.snap, 7), 30, 4);
  cam.sx = qx; cam.sy = qy;
  earSection(cam, t, { bulge, tube: open, canal: 0.42, pocket: lerp(1, 0.42, leave), nose: 1, jit: 1.5 * (1 - leave),
    hiPocket: 0.5 * (1 - leave), hiDrum: 0.8 * (1 - leave) + decay(t, c.snap, 5), push: 1, pushK: 1 - leave,
    hiTube: ramp(t, c.tiny2, c.tube + 0.1) * (1 - ramp(t, c.burps, c.burps + 0.4)) + 0.6 * clamp(open),
    hiNose: ramp(t, c.back, c.nose) * (1 - ramp(t, c.burps + 0.3, c.extra)),
    flows: [[c.vent, 1, 18, 0.62], [c.vent + 0.5, 1, 12, 0.62]] });
  screenSpace();
  const kt = ramp(t, c.tube - 0.05, c.tube + 0.15, E.outBack) * (1 - ramp(t, c.back - 0.05, c.back + 0.15));
  { const p = earTubeP(0.5); secLabel(cam, 'TINY TUBE', 300, 1000, p[0] - 14, p[1] + 10, kt, '#FF9A3C', 50); }
  const kn = ramp(t, c.back - 0.02, c.back + 0.18, E.outBack) * (1 - ramp(t, c.burps - 0.1, c.burps + 0.1));
  secLabel(cam, 'BACK OF YOUR NOSE', 520, 1130, 760, 700, kn, '#FF86A6', 44);
  headMap(826, 560, 1.0, ramp(t, c.tothe - 0.1, c.tothe + 0.15) * (1 - ramp(t, c.burps - 0.05, c.burps + 0.15)), ramp(t, c.tothe, c.nose_end, E.inOutSine), t);
  // the burp, where the air comes out
  const kb = ramp(t, c.vent + 0.3, c.vent + 0.46, E.outBack) * (1 - ramp(t, c.out, c.out_end));
  if (kb > 0) { const z = toScreen(cam, EAR.Z[0], EAR.Z[1]); speech('burp!', Math.min(z[0] + 120, 800), z[1] - 150, kb, '#7A4FD0', 84, 0.06); }
  { const d = toScreen(cam, -70, -20); popWord(Math.max(d[0] - 40, 250), d[1] - 190, t, c.snap, 150); }
  return { capY: CAPY, glow: 0.88, flash: 0.12 * decay(t, c.snap, 12) };
};

// ---------------------------------------------------------------- 7. squeeze: on the way down the pocket shrinks, the eardrum is sucked in, the suction clamps the tube
SC.squeeze = (lt, t, shot) => {
  const c = cu();
  const cam = secCam(t, [
    [shot.start, -60, 0, 1.36], [c.shrinks, 20, -4, 1.62], [c.shrinks_end + 0.1, 40, -4, 1.7],
    [c.suction + 0.25, 372, 350, 1.5], [c.shut, 410, 410, 1.62], [shot.end, 414, 416, 1.7],
  ], E.inOutCubic);
  const fillK = ramp(t, shot.start - 0.3, c.pocket2, E.inOutSine);
  const suck = 0.25 * fillK + 0.75 * springStep(t - (c.shrinks - 0.08), 2.8, 0.42);
  const sq = ramp(t, c.suction - 0.12, c.suction + 0.3);
  const clampK = springStep(t - c.clamps, 6, 0.4);
  const [qx, qy] = shake(t, 6 * decay(t, c.clamps, 6) + 7 * decay(t, c.shut, 7), 30, 5);
  cam.sx = qx; cam.sy = qy;
  earSection(cam, t, { bulge: -suck, shrink: clamp(suck), tube: 0, canal: lerp(0.42, 1.5, fillK), pocket: 0.42, nose: 1.4,
    hiDrum: 0.6 * clamp(suck), push: -1, pushK: 1 - 0.5 * ramp(t, c.andthe, c.suction),
    squeeze: sq * (0.75 + 0.25 * clampK), hiTube: 0 });
  screenSpace();
  pressureHud(540, 500, 1 - ramp(t, c.andthe - 0.1, c.andthe + 0.15), 1, t);
  const ks = ramp(t, c.shrinks - 0.02, c.shrinks + 0.14, E.outBack);
  if (ks > 0) { const d = toScreen(cam, 36, 8); shockLines(d[0], d[1], 140, inv(c.shrinks, c.shrinks + 0.45, t), 12, '#FFB0BC', 6); }
  { const p = toScreen(cam, ...earTubeP(0.68)), snapT = c.lock - 0.02;                       // it swings in on "shut" and clicks home just after the word
    padlock(p[0] + 150, p[1] - 96, 1.25 * (1 + 0.12 * decay(t, snapT, 14)), ramp(t, c.shut, c.shut + 0.16), 0, t, 1 - ramp(t, snapT - 0.05, snapT, E.inCubic));
    if (t > snapT) shockLines(p[0] + 150, p[1] - 80, 96, inv(snapT, snapT + 0.3, t), 10, '#FFE07A', 7); }
  return { capY: CAPY, glow: 0.88, flash: 0.25 * (1 - ramp(lt, 0, 0.12)), zblur: 0.2 * (1 - ramp(lt, 0, 0.3)), zcx: 540, zcy: SEC_SY };
};

// ---------------------------------------------------------------- 9. yank: the little muscle yanks it open; air rushes in; the eardrum pops back
SC.yank = (lt, t, shot) => {
  const c = cu();
  const cam = secCam(t, [
    [shot.start, 400, 470, 1.42], [c.yanks, 384, 446, 1.5], [c.open - 0.02, 300, 300, 1.06], [c.pop2 + 0.22, 170, 120, 1.24], [shot.end, 160, 110, 1.3],
  ], E.inOutCubic);
  const pull = springStep(t - c.yanks, 4.2, 0.38);
  const open = springStep(t - (c.yanks + 0.05), 4, 0.45);
  const fillK = ramp(t, c.yanks + 0.35, c.open_end, E.inOutSine);
  const bulge = -1 + 0.6 * fillK + 0.4 * springStep(t - c.pop2, 5, 0.3);
  const [qx, qy] = shake(t, 9 * decay(t, c.yanks, 7) + 9 * decay(t, c.pop2, 7), 30, 6);
  cam.sx = qx; cam.sy = qy;
  const S = earSection(cam, t, { bulge, shrink: clamp(-bulge), tube: open, pull, canal: 1.5, pocket: lerp(0.42, 1.5, fillK), nose: 1.4,
    hiMuscle: ramp(t, c.muscle - 0.1, c.muscle + 0.15) * (0.6 + 0.4 * Math.sin(t * 14)) * (1 - ramp(t, c.open, c.open_end)),
    hiDrum: 0.5 * (1 - fillK) + decay(t, c.pop2, 5), hiPocket: 0.7 * fillK * (1 - ramp(t, c.pop2 + 0.2, c.pop2 + 0.5)),
    squeeze: 1 - ramp(t, c.yanks, c.yanks + 0.12), push: -1, pushK: 0.6 * (1 - fillK), hiTube: 0.7 * clamp(open) * (1 - ramp(t, c.pop2, c.pop2 + 0.3)),
    flows: [[c.yanks + 0.12, -1, 18, 0.6], [c.yanks + 0.5, -1, 14, 0.6]] });
  screenSpace();
  { const p = toScreen(cam, ...earTubeP(0.68)); padlock(p[0] + 150, p[1] - 96, 1.25 * cam.zoom / 1.42, 1, ramp(t, c.yanks + 0.02, c.yanks + 0.5), t); }
  const km = ramp(t, c.muscle - 0.05, c.muscle + 0.15, E.outBack) * (1 - ramp(t, c.itopen, c.open));
  { const m = toScreen(cam, S.mus.mid[0], S.mus.mid[1]); if (km > 0) { leader([300, 1190], [m[0] - 30, m[1] + 40], clamp(km * 1.4), '#FF86A6'); pill(300, 1228, 'LITTLE MUSCLE', '#FF86A6', km, 42); }
    if (t > c.yanks) shockLines(m[0], m[1], 110, inv(c.yanks, c.yanks + 0.4, t), 12, '#FFD8E2', 8); }
  { const d = toScreen(cam, -40, -20); popWord(Math.max(d[0] - 60, 250), d[1] - 200, t, c.pop2, 150); }
  return { capY: CAPY, glow: 0.9, flash: 0.14 * decay(t, c.pop2, 12) + 0.2 * (1 - ramp(lt, 0, 0.1)) };
};

// ================================================================ the cabin shots
function blinkAt(t, seed = 1, every = 3.1) { const p = ((t + seed * 1.37) % every) / every; return p > 0.955 ? 1 : 0; }
const FACE_GRIP = Object.assign({}, FACES.nervous, { lookX: -0.7, lookY: 0.1, eyeOpen: 1.2, browY: 1.0, browTilt: 1.0, mouth: 'grimace', mouthOpen: 1 });
const FACE_WINCE = Object.assign({}, FACES.worried, { blink: 0.22, eyeOpen: 1.12, pupil: 0.75, lookX: 0, lookY: -0.9, browY: 1.0, browTilt: 1.3, mouth: 'wavy', mouthOpen: 0.4 });
const FACE_UPWAIT = Object.assign({}, FACES.worried, { lookX: 0, lookY: -1, eyeOpen: 1.32, pupil: 0.7, browY: 1.3, browTilt: 0.8, mouth: 'o', mouthOpen: 0.25 });
const FACE_OUCH = Object.assign({}, FACES.nervous, { blink: 1, squeeze: 1, browY: -0.5, browTilt: -1.0, mouth: 'grimace', mouthOpen: 1 });
const FACE_AHH = Object.assign({}, FACES.grin, { blink: 1, browY: 1.0, browTilt: 0.5, mouthOpen: 0.6 });
const FACE_SHY = Object.assign({}, FACES.nervous, { lookX: 0.95, lookY: 0.2, eyeOpen: 1.1, pupil: 0.8, browY: 0.9, browTilt: 1.2, mouth: 'wavy', mouthOpen: 0.3 });
const FACE_CRY = Object.assign({}, FACES.shock, { blink: 1, squeeze: 1, browY: 0.7, browTilt: 1.3, mouth: 'scream', mouthOpen: 1 });
const FACE_DEAD = Object.assign({}, FACES.annoyed, { lookX: 0, lookY: 0, blink: 0.45, browTilt: -0.2, browY: 0 });

// where his ears are (world), for the camera and the bursts
function heroEar(S, sd) { return toWorld(S.st, [S.r.head[0] + (S.st.headDX || 0) + sd * 64, S.r.head[1] + (S.st.headDY || 0) + 2]); }
// a comic star burst (screen space): pops, then fades
function popStar(x, y, R, t, t0, col = '#FFF3B0', seed = 0) {
  const d = t - t0;
  if (d < 0 || d > 0.5) return;
  const k = E.outBack(clamp(d / 0.1), 2.4), a = 1 - ramp(t, t0 + 0.22, t0 + 0.5);
  for (const [cc, sc, al] of [[gctx, 0.5, 0.7], [ctx, 1, 1]]) {
    cc.save(); cc.setTransform(sc, 0, 0, sc, 0, 0); cc.translate(x, y); cc.rotate(0.2 + seed); cc.scale(k, k); cc.globalAlpha = a * al;
    cc.beginPath();
    for (let i = 0; i < 20; i++) { const an = i / 20 * Math.PI * 2, r = i % 2 ? R * 0.48 : R * (0.92 + 0.14 * hash(i + seed * 7)); if (i) cc.lineTo(Math.cos(an) * r, Math.sin(an) * r); else cc.moveTo(Math.cos(an) * r, Math.sin(an) * r); }
    cc.closePath(); cc.fillStyle = cc === ctx ? col : '#FFD447'; cc.fill();
    if (cc === ctx) { cc.lineWidth = 6; cc.lineJoin = 'round'; cc.strokeStyle = '#0B0B1A'; cc.stroke(); }
    cc.restore();
  }
}
// a speech bubble whose tail points down to the RIGHT (fx.js's speech() points left)
function speechR(txt, x, y, k, col = '#7A4FD0', size = 84, rot = -0.06) {
  if (k <= 0) return;
  const s = E.outBack(clamp(k), 2.4);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.font = `400 ${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + 64, h = size * 1.3;
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = '#FFFFFF'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(w * 0.2, h / 2 - 6); ctx.lineTo(w * 0.36, h / 2 + 42); ctx.lineTo(w * 0.02, h / 2 - 6); ctx.fill();
  ctx.lineWidth = 7; ctx.strokeStyle = '#0B0B1A'; rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.stroke();
  ctx.fillStyle = col; ctx.fillText(txt, 0, 4);
  ctx.restore();
}
// big shaking letters (the wail, the sneeze)
function loudWord(txt, x, y, size, col, k, t, spread = 0.72, amp = 7) {
  if (k <= 0) return;
  const n = txt.length;
  for (let i = 0; i < n; i++) {
    const u = n > 1 ? i / (n - 1) : 0.5, sz = size * (0.8 + 0.4 * u);
    bigWord(txt[i], x + (i - (n - 1) / 2) * size * spread + amp * Math.sin(t * 40 + i * 2.1), y - 26 * Math.sin(u * 2.2) + amp * Math.cos(t * 33 + i * 1.7), sz, col, k, -0.1 + 0.06 * Math.sin(t * 25 + i));
  }
}

// ---------------------------------------------------------------- 1. hook: take-off; the pressure builds in his ears ... POP
SC.hook = (lt, t, shot) => {
  const c = cu();
  const pitch = -0.15 * E.outBack(clamp((t + 0.14) / 0.62), 1.3);                  // the nose comes up on frame 1
  const jolt = decay(t, c.pop, 7), after = ramp(t, c.pop, c.pop + 0.06);
  const [qx, qy] = shake(t, 9 * (1 - 0.65 * ramp(t, 0.5, 2.4)) + 18 * jolt, 26, 2);
  const base = camKeys(t, [[0, 540, 972, 1.34], [c.takes, 540, 968, 1.4], [c.ears, 540, 956, 1.6], [c.go_end, 540, 952, 1.84], [c.pop, 540, 952, 1.96],
    [c.pop + 0.1, 540, 954, 1.7], [shot.end, 540, 956, 1.78]], E.inOutSine);
  const cam = { x: base.x, y: base.y, zoom: base.zoom, rot: pitch, sx: qx, sy: qy };
  const build = Math.max(0.55 * ramp(t, 0.0, 0.3), ramp(t, c.and - 0.7, c.go_end, E.inOutSine)) * (1 - after);
  let face = lerpFace(FACE_GRIP, FACE_WINCE, ramp(t, c.and - 0.35, c.ears));
  face = lerpFace(face, FACE_UPWAIT, ramp(t, c.go - 0.05, c.go_end));
  face = lerpFace(face, FACES.startled, after);
  face = lerpFace(face, Object.assign({}, FACES.confused, { lookX: -0.8, lookY: 0.2, browY: 1.2 }), ramp(t, c.pop_end + 0.2, c.pop_end + 0.42));
  const S = cabinScene(cam, t, { rot: cam.rot, alt: 0.5 * ramp(t, 0.1, 3.9, E.inOutSine), speed: 1.5, ding: decay(t, 0, 3),
    hero: { face, tremble: 0.04 * (1 - jolt), up: 0.5 * decay(t, c.pop, 4.5), frizz: 0.55 * decay(t, c.pop, 3.2), headDY: -20 * jolt + 2.5 * build * Math.sin(t * 34),
      headDX: -9 * clamp(1 - t / 0.6), headRot: -0.05 * clamp(1 - t / 0.8), lean: -0.07 * (1 - ramp(t, 0.1, 0.9, E.inOutSine)), throb: build, red: 0.5 * build },
    bag: { puff: 0.06 + 0.94 * ramp(t, 0.3, c.go_end, E.inOutSine), dx: -30 * ramp(t, 0.04, 0.6, E.outBack), hop: 18 * jolt, rot: -0.05 * ramp(t, 0.04, 0.5) },
    bottle: { dx: -26 * ramp(t, 0.1, 0.8, E.outBack), rot: -0.1 * decay(t, 0.15, 2.2) * Math.sin(t * 15), hop: 12 * jolt },
    suit: { sleep: 1, tilt: 0.12 }, mum: { blink: blinkAt(t, 2), lookX: -0.4, lookY: 0.6, smile: 0.3 }, baby: { blink: 1, tilt: 0.1 },
  });
  // the POP: a burst at each ear
  screenSpace();
  for (const sd of [-1, 1]) {
    const e = toScreen(cam, ...heroEar(S, sd));
    popStar(e[0] + sd * 34, e[1] - 6, 118, t, c.pop, '#FFF3B0', sd + 2);
    shockLines(e[0] + sd * 30, e[1], 96, inv(c.pop, c.pop + 0.4, t), 9, '#FFFFFF', 20 + sd);
  }
  cabLight(t, 1);
  return { capY: CAPY, glow: 0.85, flash: 0.2 * decay(t, c.pop, 11), zblur: 0.1 * decay(t, c.pop, 10), zcx: 540, zcy: 900 };
};

// ---------------------------------------------------------------- 2. burp: "Relax. Your ear just burped."; then the dive into that ear
SC.burp = (lt, t, shot) => {
  const c = cu();
  const earW = [CAB.hx - 64 * CAB.hs, CAB.seatY - 280 * CAB.hs];
  const dive = ramp(t, shot.end - 0.26, shot.end, E.inCubic), aim = ramp(t, shot.end - 0.26, shot.end - 0.04, E.outCubic);
  const base = camKeys(t, [[shot.start, 540, 978, 2.02], [c.burp, 538, 976, 2.1], [shot.end - 0.26, 532, 974, 2.2]], E.inOutSine);
  const [qx, qy] = shake(t, 2.2 + 5 * decay(t, c.burp, 8), 24, 3);
  const cam = { x: lerp(base.x, earW[0], aim), y: lerp(base.y, earW[1], aim), zoom: base.zoom * (1 + 3.4 * dive), rot: -0.1, sx: qx, sy: qy };
  const rel = ramp(t, c.relax, c.relax + 0.35), hear = ramp(t, c.burp, c.burp + 0.08), shy = ramp(t, c.yourear + 0.1, c.just + 0.1);
  let face = lerpFace(FACES.startled, Object.assign({}, FACES.calm, { lookX: 0, lookY: 0, blink: 0.35, browY: 0.5, mouth: 'o', mouthOpen: 0.35 }), rel);
  face = lerpFace(face, Object.assign({}, FACES.startled, { lookX: -1, lookY: 0, mouth: 'flat', mouthOpen: 0.2, eyeOpen: 1.3 }), hear);
  face = lerpFace(face, FACE_SHY, shy);
  const S = cabinScene(cam, t, { rot: -0.1, alt: 0.55, speed: 1.2,
    hero: { face, headDY: 5 * rel * (1 - hear) - 7 * decay(t, c.burp, 9), headRot: -0.03 * hear * (1 - shy) + 0.03 * shy, red: 0.75 * shy, tremble: 0.012 },
    bag: { puff: 1, dx: -30, rot: -0.05 }, bottle: { dx: -26 }, suit: { sleep: 1, tilt: 0.12 }, mum: { lookX: -0.4, lookY: 0.6, smile: 0.3 }, baby: { blink: 1, tilt: 0.1 },
  });
  screenSpace();
  const e = toScreen(cam, earW[0], earW[1]);
  // his ear burps (a little puff), and says so
  const kb = ramp(t, c.burp, c.burp + 0.12, E.outBack) * (1 - ramp(t, shot.end - 0.3, shot.end - 0.14));
  speechR('burp', e[0] - 130, e[1] - 128, kb, '#7A4FD0', 92, -0.08);
  for (let i = 0; i < 5; i++) { const d = t - c.burp - i * 0.03; if (d > 0 && d < 0.6) softDot(ctx, e[0] - 30 - 120 * d - 14 * i, e[1] + 6 - 50 * d + 8 * Math.sin(i * 2), 20 + 46 * d, '#CFE6D8', 0.5 * (1 - d / 0.6)); }
  const hd = toScreen(cam, ...toWorld(S.st, S.r.head));
  sweatDrop(ctx, hd[0] + 150, hd[1] - 70 + 60 * ramp(t, c.just, shot.end), 1.5, shy * (1 - dive));
  cabLight(t, 1);
  return { capY: CAPY, glow: 0.85, flash: 0.22 * (1 - ramp(lt, 0, 0.1)) + 0.5 * ramp(t, shot.end - 0.1, shot.end), zblur: 0.6 * dive * dive, zcx: 540, zcy: 960 };
};

// ---------------------------------------------------------------- 6. landing: the cabin tips down, hands on his ears, the bottle crumples
SC.landing = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const tip = 0.13 * E.outBack(clamp((lt + 0.1) / 0.5), 1.4);
  const [qx, qy] = shake(t, 7 + 9 * decay(t, c.crunch, 8), 26, 9);
  const cam = { x: 540, y: 968 - 14 * lt / D, zoom: 1.3 + 0.2 * ramp(lt, 0, D, E.inOutSine), rot: tip, sx: qx, sy: qy };
  const crush = 0.75 * ramp(t, c.landing + 0.05, c.worse + 0.2, E.inOutSine) + 0.25 * springStep(t - c.crunch, 6, 0.4);
  const S = cabinScene(cam, t, { rot: tip, alt: 0.5 - 0.12 * lt / D, speed: 1.2, ding: decay(lt, 0, 3),
    hero: { face: FACE_OUCH, ears: 1, tremble: 0.03, throb: 1, red: 0.85, headRot: 0.03 * Math.sin(t * 9), headDY: 3 * Math.sin(t * 30) },
    bag: { puff: 0.04, dx: 26 * ramp(lt, 0, 0.45, E.outBack), rot: 0.05 }, bottle: { crush, dx: 22 * ramp(lt, 0.05, 0.5, E.outBack), hop: 8 * decay(t, c.crunch, 9) },
    suit: { ears: 1, wince: 1 }, mum: { wince: 1, brow: 0.5 }, baby: { wobble: 0.6, lookY: -0.5, brow: 0.6 },
  });
  screenSpace();
  // the squeeze on the bottle: little arrows, then a crunch
  const b = toScreen(cam, S.st.x + 100, CAB.trayY - 62);
  if (t > c.crunch) shockLines(b[0], b[1], 84, inv(c.crunch, c.crunch + 0.35, t), 9, '#DCEBFF', 12);
  cabLight(t, 0.9);
  return { capY: CAPY, glow: 0.85, flash: 0.3 * (1 - ramp(lt, 0, 0.12)), zblur: 0.14 * (1 - ramp(lt, 0, 0.25)), zcx: 540, zcy: 900 };
};

// ---------------------------------------------------------------- 8. swallow: a gulp, then a huge yawn
SC.swallow = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const yawn = ramp(t, c.or + 0.05, c.yawn + 0.3, E.inOutSine);
  const gulp = Math.exp(-(((t - c.gulp + 0.12) / 0.11) ** 2));                     // the swallow: the chin tucks, once
  const [qx, qy] = shake(t, 2.5, 24, 10);
  const cam = { x: 540, y: 976 + 6 * yawn, zoom: 1.92 + 0.1 * lt / D, rot: 0.1, sx: qx, sy: qy };
  let face = lerpFace(FACE_OUCH, Object.assign({}, FACES.calm, { lookX: 0, lookY: 0.9, blink: 0.7, mouth: 'flat', mouthOpen: 0.1, browY: 0.6, browTilt: 0.6 }), ramp(t, c.swallow - 0.12, c.swallow + 0.05));
  face = lerpFace(face, FACES.yawn, yawn);
  const S = cabinScene(cam, t, { rot: 0.1, alt: 0.36, speed: 1.1,
    hero: { face, ears: 1 - ramp(t, c.swallow - 0.2, c.swallow + 0.1), stretch: yawn, headDY: 12 * gulp - 8 * yawn, headRot: -0.05 * yawn, throb: 0.8 * (1 - 0.4 * yawn), red: 0.6 * (1 - yawn) },
    bag: { puff: 0.04, dx: 26, rot: 0.05 }, bottle: { crush: 1, dx: 22 }, suit: { ears: 1, wince: 1 }, mum: { wince: 1 }, baby: { wobble: 0.7, lookY: -0.5 },
  });
  screenSpace();
  const hd = toScreen(cam, ...toWorld(S.st, S.r.head));
  const kg = ramp(t, c.gulp - 0.1, c.gulp + 0.04, E.outBack) * (1 - ramp(t, c.or + 0.1, c.or + 0.28));
  bigWord('GULP', hd[0] + 215, hd[1] + 110, 96, '#4DFFB4', kg, 0.1);
  cabLight(t, 0.9);
  return { capY: CAPY, glow: 0.85, flash: 0.28 * (1 - ramp(lt, 0, 0.1)) };
};

// ---------------------------------------------------------------- 10. baby: he shows the baby how; the baby stares; then it cries
// a green tick in a disc, with words (screen space)
function tickPill(x, y, txt, k, size = 44) {
  if (k <= 0) return;
  pill(x + 34, y, txt, '#4DFFB4', k, size);
  const s = E.outBack(clamp(k), 2), w = ctx.measureText ? 0 : 0;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.font = `900 ${size}px Montserrat`; const tw = ctx.measureText(txt).width + size * 1.1;
  ctx.translate(x + 34 - tw / 2 - size * 0.62, y); ctx.scale(s, s);
  circle(ctx, 0, 0, size * 0.74, '#17B978'); ctx.beginPath(); ctx.moveTo(-size * 0.34, 0); ctx.lineTo(-size * 0.08, size * 0.26); ctx.lineTo(size * 0.36, -size * 0.26);
  ctx.lineWidth = size * 0.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#FFFFFF'; ctx.stroke();
  ctx.restore();
}
function babyState(S) {                                // where the baby's head, ears and mouth are (world)
  const [bx, by, bs] = S.babyAt; return { head: [bx, by - 186 * bs], mouth: [bx, by - 152 * bs], ear: (sd) => [bx + sd * 66 * bs, by - 180 * bs], eyes: [bx, by - 190 * bs], s: bs };
}
function babyThrob(cam, S, k, t) {
  if (k <= 0.01) return;
  const B = babyState(S); screenSpace();
  for (const sd of [-1, 1]) {
    const p = toScreen(cam, ...B.ear(sd)), z = cam.zoom * B.s;
    softDot(ctx, p[0], p[1], 44 * z, '#FF4D5E', 0.4 * k * (0.7 + 0.3 * Math.sin(t * 16))); softDot(gctx, p[0], p[1], 56 * z, '#FF4D5E', 0.5 * k);
    for (let i = 0; i < 3; i++) {
      const ph = ((t * 2.2 + i / 3) % 1), rr = (22 + 44 * ph) * z, a = k * (1 - ph);
      ctx.beginPath(); ctx.arc(p[0] + sd * 6 * z, p[1], rr, sd > 0 ? -0.8 : Math.PI - 0.8, sd > 0 ? 0.8 : Math.PI + 0.8); ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.strokeStyle = rgba('#FF7A6E', 0.9 * a); ctx.stroke();
    }
  }
}
SC.baby = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(t, [[shot.start, 720, 1016, 1.2], [c.purpose_end, 740, 1020, 1.24], [c.crying + 0.2, 800, 1040, 1.36], [shot.end, 806, 1042, 1.42]], E.inOutCubic);
  const cryK = springStep(t - (c.crying - 0.02), 3.2, 0.45), wob = ramp(t, c.purpose_end - 0.1, c.crying - 0.05) * (1 - clamp(cryK * 2));
  const [qx, qy] = shake(t, 7 * clamp(cryK) * (0.6 + 0.4 * Math.sin(t * 31)), 28, 12);
  cam.rot = 0.07; cam.sx = qx; cam.sy = qy;
  const demo = ramp(t, c.cant - 0.25, c.dothat + 0.1, E.inOutSine) * (1 - ramp(t, c.purpose_end - 0.05, c.purpose_end + 0.3));     // he yawns at the baby: like THIS
  const back = clamp(cryK);                                                           // and recoils when it goes off
  let face = lerpFace(Object.assign({}, FACES.grin, { lookX: 1, lookY: 0.5, mouthOpen: 0.6, browY: 1 }), FACES.yawn, demo);
  face = lerpFace(face, Object.assign({}, FACES.confused, { lookX: 1, lookY: 0.5, browY: 1.0 }), ramp(t, c.purpose_end, c.purpose_end + 0.25) * (1 - demo));
  face = lerpFace(face, Object.assign({}, FACES.shock, { lookX: 1, lookY: 0.4 }), back);
  const popped = ramp(t, c.pop3, c.pop3 + 0.05);
  const S = cabinScene(cam, t, { rot: 0.07, alt: 0.3, speed: 1.0,
    hero: { face, stretch: 0.85 * demo, ears: back * ramp(t, c.crying + 0.15, c.crying + 0.4), headDX: 10 * (1 - back) - 12 * back, headRot: 0.07 * (1 - back) - 0.05 * back - 0.05 * demo, lean: -0.05 * back, frizz: 0.4 * decay(t, c.crying, 3) },
    bag: { puff: 0.04, dx: 26, rot: 0.05 }, bottle: { crush: 1, dx: 22 },
    mum: { lookX: -0.2, lookY: 0.9, wince: back, smile: 0.4 * (1 - back), brow: 0.6 }, gran: { ears: back, wince: back, sleep: 1 - clamp(cryK * 3) },
    baby: { cry: cryK, wobble: wob, lookX: -1 * (1 - wob), lookY: -0.2, blink: Math.exp(-(((t - (c.purpose + 0.3)) / 0.07) ** 2)), brow: 0.4, tilt: -0.08 * (1 - back) },
  });
  const B = babyState(S);
  applyCam(cam);
  tearJets(ctx, B.eyes[0], B.eyes[1], B.s * 1.25, t, clamp(cryK));
  screamArcs(ctx, B.mouth[0], B.mouth[1], t, 0.9 * clamp(cryK));
  babyThrob(cam, S, 1 - popped, t);
  screenSpace();
  const bh = toScreen(cam, ...B.head);
  // "?": it has no idea what he wants
  const kq = ramp(t, c.purpose - 0.05, c.purpose + 0.12, E.outBack) * (1 - ramp(t, c.but - 0.2, c.but));
  bigWord('?', bh[0] - 128, bh[1] - 64, 150, '#FFFFFF', kq, -0.16);
  loudWord('WAAAH!', 700, 640, 104, '#FF5A6E', ramp(t, c.crying, c.crying + 0.14, E.outBack) * (1 - ramp(t, c.can - 0.1, c.can + 0.1)), t);
  tickPill(548, 640, 'TUBE: OPEN', ramp(t, c.open2 - 0.04, c.open2 + 0.14), 48);
  for (const sd of [-1, 1]) { const e = toScreen(cam, ...B.ear(sd)); popStar(e[0] + sd * 26, e[1] - 4, 84, t, c.pop3, '#DFFFEF', sd + 5); }
  cabLight(t, 0.9);
  return { capY: CAPY, glow: 0.85, flash: 0.25 * (1 - ramp(lt, 0, 0.1)) + 0.1 * decay(t, c.pop3, 12) };
};

// ---------------------------------------------------------------- 11. button: the whole row suffers; the baby, ears clear, is doing it right
function rowSign(cam, k, t) {
  if (k <= 0) return;
  const p = toScreen(cam, 940, 452), z = cam.zoom, s = E.outBack(clamp(k), 1.8) * z;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(p[0], p[1]); ctx.rotate(cam.rot || 0); ctx.scale(s, s);
  rrect(ctx, -150, -52, 300, 104, 20); ctx.fillStyle = '#0E1230'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#FFD447'; ctx.stroke();
  ctx.font = '400 84px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFD447'; ctx.fillText('ROW 12', 0, 6);
  ctx.restore();
  softDot(gctx, p[0], p[1], 210 * z, '#FFD447', 0.4 * clamp(k) * (0.85 + 0.15 * Math.sin(t * 7)));
}
SC.button = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(t, [[shot.start, 938, 956, 0.88], [c.inrow, 938, 960, 0.92], [c.twelve_end, 938, 964, 0.95], [c.technically + 0.1, 900, 1050, 1.36], [c.doing, 896, 1058, 1.5], [shot.end, 896, 1062, 1.6]], E.inOutCubic);
  const hush = ramp(t, c.hush, c.hush + 0.08), loud = 1 - hush;
  const [qx, qy] = shake(t, 6 * loud * (0.6 + 0.4 * Math.sin(t * 31)), 28, 13);
  cam.rot = 0.07; cam.sx = qx; cam.sy = qy;
  const smug = ramp(t, c.doing - 0.25, c.doing + 0.05), lookAround = ramp(t, c.hush + 0.15, c.technically + 0.3) * (1 - smug);
  const lower = ramp(t, c.hush + 0.3, c.technically + 0.5, E.inOutSine);            // the row lowers its hands, slowly
  const S = cabinScene(cam, t, { rot: 0.07, alt: 0.24, speed: 1.0,
    hero: { face: lerpFace(FACE_OUCH, Object.assign({}, FACES.confused, { lookX: 1, lookY: 0.4, browY: 1.2 }), lower), ears: 1 - lower, lean: -0.05 * loud, headDX: -8 * loud, tremble: 0.02 * loud },
    bag: { puff: 0.04, dx: 26, rot: 0.05 }, bottle: { crush: 1, dx: 22 },
    suit: { ears: 1 - lower, wince: loud, angry: 1, lookX: 1, lookY: 0.2 }, gran: { ears: 1 - lower, wince: loud, angry: 0.8 * lower, lookX: -1, lookY: 0.3 },
    mum: { lookX: -0.1, lookY: 1, wince: loud, brow: 0.9, smile: -0.5 * loud, mouthO: 0.5 * lower * (1 - smug) },
    baby: { cry: loud, lookX: Math.sin((t - c.hush) * 9) * lookAround, lookY: -0.1, blink: Math.exp(-(((t - (c.hush + 0.2)) / 0.06) ** 2)), smug, medal: ramp(t, c.right - 0.02, c.right + 0.16), brow: 0.6 * lookAround, tilt: 0.06 * smug, bounce: 5 * smug * Math.abs(Math.sin(t * 6)) },
  });
  const B = babyState(S);
  applyCam(cam);
  tearJets(ctx, B.eyes[0], B.eyes[1], B.s * 1.25, t, loud);
  screamArcs(ctx, B.mouth[0], B.mouth[1], t, loud);
  screenSpace();
  rowSign(cam, ramp(t, c.inrow - 0.1, c.inrow + 0.15) * (1 - ramp(t, c.technically, c.technically + 0.3)), t);
  const bh = toScreen(cam, ...B.head);
  loudWord('WAAAH!', 540, bh[1] - 372 * cam.zoom, 96 + 30 * cam.zoom, '#FF5A6E', loud * ramp(lt, 0, 0.12, E.outBack), t);
  // its ears are clear: a sparkle at each
  for (const sd of [-1, 1]) {
    const e = toScreen(cam, ...B.ear(sd)), tw = ramp(t, c.technically, c.technically + 0.2) * (0.6 + 0.4 * Math.sin(t * 8 + sd));
    for (const cc of [ctx, gctx]) for (let i = 0; i < 4; i++) { const a = i * Math.PI / 4 + t * 1.5; line(cc, e[0] + sd * 30 - Math.cos(a) * 22 * tw, e[1] - 34 - Math.sin(a) * 22 * tw, e[0] + sd * 30 + Math.cos(a) * 22 * tw, e[1] - 34 + Math.sin(a) * 22 * tw, cc === gctx ? 10 : 4.5, rgba('#DFFFEF', clamp(tw * 1.4))); }
  }
  if (t > c.right) shockLines(bh[0] - 40, bh[1] + 150 * cam.zoom, 110, inv(c.right, c.right + 0.4, t), 12, '#FFE680', 17);
  cabLight(t, 0.9);
  return { capY: CAPY, glow: 0.85, flash: 0.2 * (1 - ramp(lt, 0, 0.1)) };
};

// ---------------------------------------------------------------- 12. sub: he cries too (pop!), the sun finds him, ACHOO, subscribe, "bless you"; then it all starts again
function nextCard(k, t) {
  if (k <= 0) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(540, 520); ctx.rotate(-0.04); ctx.scale(k, k);
  rrect(ctx, -300, -84, 600, 168, 24); ctx.fillStyle = '#FFF6D8'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#FFD447'; ctx.stroke();
  ctx.font = '800 36px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#6A5A2A'; ctx.fillText('NEXT UP', -52, -44);
  ctx.font = '400 78px Anton'; ctx.fillStyle = '#1A1C2C'; ctx.fillText('SUN SNEEZE', -52, 24);
  // a little sun
  ctx.translate(214, 2); ctx.rotate(t * 0.8);
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; line(ctx, Math.cos(a) * 44, Math.sin(a) * 44, Math.cos(a) * 62, Math.sin(a) * 62, 9, '#FF9A3C'); }
  circle(ctx, 0, 0, 36, '#FFC23A'); circle(ctx, -8, -8, 12, '#FFE699');
  ctx.restore();
}
SC.sub = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cryK = (1 - ramp(t, c.pop4 - 0.04, c.pop4 + 0.06)) * ramp(lt, -0.1, 0.08);
  const sun = ramp(t, c.sunlight - 0.15, c.sunlight + 0.3, E.inOutSine) * (1 - 0.5 * ramp(t, c.achoo + 0.3, c.bless));
  const tick = ramp(t, c.makes, c.sneeze_end, E.inCubic) * (t < c.achoo ? 1 : 0);        // the tickle builds: ah ... ah ...
  const sn = t - c.achoo, achoo = sn >= 0 ? Math.exp(-sn * 6) : 0, loop = ramp(t, c.loop, TLd.duration, E.inCubic);
  const tip = 0.07 * (1 - loop) - 0.11 * loop;
  const [qx, qy] = shake(t, 5 * cryK + 14 * achoo + 7 * loop, 28, 14);
  const cam = camKeys(t, [[shot.start, 540, 1000, 1.46], [c.pop4 + 0.1, 540, 996, 1.52], [c.sneeze, 540, 992, 1.6], [c.achoo + 0.05, 540, 1000, 1.5], [shot.end, 540, 1004, 1.56]], E.inOutSine);
  cam.rot = tip; cam.sx = qx; cam.sy = qy;
  const relief = ramp(t, c.pop4 + 0.02, c.pop4 + 0.2) * (1 - ramp(t, c.sunlight - 0.1, c.sunlight + 0.2));
  let face = lerpFace(FACE_CRY, FACE_AHH, ramp(t, c.pop4, c.pop4 + 0.12));
  face = lerpFace(face, Object.assign({}, FACES.confused, { lookX: -0.9, lookY: -0.5, blink: 0.45, browY: 0.2, browTilt: -0.4, mouth: 'flat', mouthOpen: 0.2 }), ramp(t, c.sunlight - 0.1, c.sunlight + 0.25));
  face = lerpFace(face, Object.assign({}, FACES.worried, { lookX: 0, lookY: -1, blink: 0.6, browY: 1.3, browTilt: 1.2, mouth: 'o', mouthOpen: 0.5 + 0.5 * Math.abs(Math.sin(t * 9)) }), tick);
  face = lerpFace(face, Object.assign({}, FACE_OUCH, { mouth: 'scream', mouthOpen: 1 }), sn >= 0 ? 1 - ramp(t, c.achoo + 0.22, c.achoo + 0.5) : 0);
  face = lerpFace(face, Object.assign({}, FACES.grin, { lookX: 0.9, lookY: 0.2, mouthOpen: 0.5, browY: 1.0, browTilt: 0.8, blink: 0.15 }), ramp(t, c.bless - 0.15, c.bless + 0.15));
  face = lerpFace(face, FACE_GRIP, loop);
  const S = cabinScene(cam, t, { rot: tip, alt: 0.2 + 0.0 * lt, speed: 1.0 + 0.6 * loop, sun, ding: decay(t, c.loop, 3) * (t > c.loop ? 1 : 0),
    hero: { face, cry: cryK, tremble: 0.04 * cryK, headDY: -16 * tick * (0.6 + 0.4 * Math.sin(t * 9)) + 46 * achoo * Math.cos(sn * 9) - 6 * loop,
      headRot: -0.1 * tick + 0.1 * achoo, lean: 0.0, up: 0.0, frizz: 0.5 * achoo + 0.2 * loop, red: 0.5 * cryK + 0.3 * tick },
    bag: { puff: 0.04 + 0.2 * loop, dx: 26 - 50 * loop, rot: 0.05, hop: 26 * achoo }, bottle: { crush: 1, dx: 22 - 40 * loop, hop: 34 * achoo, rot: 0.2 * achoo },
    mum: { lookX: -1, lookY: 0.2, smile: 0.5, brow: 0.5 }, baby: { smug: 1, medal: 1, lookX: -1, tilt: 0.06 }, suit: { lookX: 1, angry: 1, lookY: 0.2 },
  });
  applyCam(cam);
  const hw = toWorld(S.st, [S.r.head[0], S.r.head[1] + (S.st.headDY || 0)]);
  tearJets(ctx, hw[0], hw[1] - 2, CAB.hs * 1.15, t, cryK, 24, 0.3);
  // the sunbeam: from the window on the left, across his face
  if (sun > 0.01) {
    for (const [cc, a] of [[ctx, 0.34], [gctx, 0.09]]) {
      cc.save(); cc.globalCompositeOperation = 'lighter';
      const g = cc.createLinearGradient(340, 640, 640, 1000); g.addColorStop(0, `rgba(255,214,130,${a * sun})`); g.addColorStop(1, `rgba(255,214,130,${a * 0.25 * sun})`);
      cc.beginPath(); cc.moveTo(300, 540); cc.lineTo(390, 520); cc.lineTo(760, 1010); cc.lineTo(470, 1120); cc.closePath(); cc.fillStyle = g; cc.fill();
      cc.restore();
    }
  }
  screenSpace();
  const hd = toScreen(cam, hw[0], hw[1]);
  // he cried: his ears pop too
  for (const sd of [-1, 1]) { const e = toScreen(cam, ...heroEar(S, sd)); popStar(e[0] + sd * 30, e[1] - 6, 104, t, c.pop4, '#DFFFEF', sd + 9); }
  loudWord('WAAH!', 540, 560, 120, '#8FB8FF', cryK * ramp(lt, 0, 0.12, E.outBack), t, 0.72, 6);
  nextCard(ramp(t, c.nextup - 0.05, c.nextup + 0.22, E.outBack) * (1 - ramp(t, c.achoo - 0.12, c.achoo)), t);
  // ACHOO: spray, the word, everything on the tray jumps
  if (sn >= 0 && sn < 0.7) {
    for (let i = 0; i < 16; i++) { const a = Math.PI / 2 + (hash(i + 3) - 0.5) * 1.5, v = 500 + 600 * hash(i + 11), x = hd[0] + Math.cos(a) * v * sn, y = hd[1] + 70 + Math.sin(a) * v * sn; circle(ctx, x, y, 5 + 5 * hash(i), rgba('#DCF2FF', 0.85 * (1 - sn / 0.7))); }
    shockLines(hd[0], hd[1] + 40, 190, inv(c.achoo, c.achoo + 0.4, t), 14, '#FFFFFF', 19);
  }
  loudWord('ACHOO!', 540, 600, 128, '#7FE9FF', ramp(t, c.achoo, c.achoo + 0.1, E.outBack) * (1 - ramp(t, c.subscribe + 0.15, c.subscribe + 0.4)), t, 0.7, 5);
  // "bless you": a tissue, offered from the next seat
  const kt = ramp(t, c.bless - 0.2, c.bless + 0.15, E.outBack) * (1 - loop);
  if (kt > 0) {
    const x = lerp(1140, 840, kt), y = 930;
    line(ctx, 1140, y + 50, x + 40, y + 12, 44, PAX.mum.topSh); line(ctx, 1140, y + 46, x + 40, y + 8, 34, PAX.mum.top);
    circle(ctx, x + 22, y + 4, 26, PAX.mum.skinSh); circle(ctx, x + 20, y + 2, 22, PAX.mum.skin);
    ctx.beginPath(); ctx.moveTo(x - 30, y - 34 + 4 * Math.sin(t * 9)); ctx.lineTo(x + 26, y - 26); ctx.lineTo(x + 30, y + 22); ctx.lineTo(x - 6, y + 34 + 4 * Math.sin(t * 8)); ctx.lineTo(x - 40, y + 10); ctx.closePath();
    ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#B8C4E6'; ctx.lineJoin = 'round'; ctx.stroke();
  }
  cabLight(t, 0.9, 0.5 * sun);
  return { capY: CAPY, glow: 0.85, flash: 0.22 * (1 - ramp(lt, 0, 0.1)) + 0.12 * decay(t, c.pop4, 12) + 0.16 * achoo + 0.14 * loop };
};

// ---------------------------------------------------------------- the cover (rendered on its own, not in the timeline)
SC.cover = (lt, t, shot) => {
  const cam = { x: 540, y: 984, zoom: 1.72, rot: -0.1 };
  const S = cabinScene(cam, 2.9, { rot: -0.1, alt: 0.5, noTray: true,
    hero: { face: Object.assign({}, FACES.startled, { lookY: -0.15, mouthOpen: 0.9 }), up: 0.3, frizz: 0.55, tremble: 0 } });
  screenSpace();
  // a burst at each ear, well clear of his face (it has to read at thumbnail size)
  for (const sd of [-1, 1]) { const e = toScreen(cam, ...heroEar(S, sd)); popStar(e[0] + sd * 124, e[1] - 26, 112, 0.2, 0, '#FFF3B0', sd + 2); }
  cabLight(0, 1);
  bigWord('WHY DO YOUR', 540, 474, 118, '#FFFFFF', 1, -0.03);
  bigWord('EARS POP?', 540, 632, 190, '#FFD447', 1, -0.03);
  softDot(gctx, 540, 600, 420, '#FFD447', 0.2);
  return { capY: CAPY, glow: 0.85, noCaptions: true, noSubscribe: true, grain: 0 };
};

function initScenes2() {
  initEar(); initCabin();
}
