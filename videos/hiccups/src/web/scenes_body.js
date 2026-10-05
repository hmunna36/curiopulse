// Why Do We Get HICCUPS? Short: the shots inside his body (3-5) and in the pond (7-8). See scenes.js for the conventions.
'use strict';

// a quick jab that rings down: 0 before p - 0.06, 1 at p, then decaying
const jab = (t, p, k = 7) => (t < p - 0.06 ? 0 : t < p ? inv(p - 0.06, p, t) : Math.exp(-(t - p) * k));
function bxBg(t, c1 = '#1A3A72', c2 = '#040A1E') {
  darkBg(c1, c2);
  screenSpace();
  for (let i = 0; i < 26; i++) {
    const x = (hash(i * 3.3) * W + 18 * Math.sin(t * 0.5 + i)) % W, y = ((hash(i * 7.1) * H - t * (14 + 22 * hash(i))) % H + H) % H;
    softDot(ctx, x, y, 5 + 9 * hash(i + 2), '#8FD0FF', 0.10);
  }
}
// a burst of short lines round a local point (screen space), k 0..1
function bxStar(v, x, y, r, k, n = 10, col = '#FFFFFF', seed = 1) { const p = bxPt(v, x, y); screenSpace(); shockLines(p[0], p[1], r, k, n, col, seed); }

// ---------------------------------------------------------------- 3. door: into his throat. A pair of doors slams shut on his own breath
SC.door = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  bxBg(t);
  const v = sectionCam(lt, [[0, 0, -676, 1.75, 780], [0.62, 0, -566, 4.3, 800], [D, 0, -560, 4.7, 800]]);
  const [qx, qy] = shake(t, 20 * decay(t, c.slam1, 7) + 13 * decay(t, c.bump1, 8), 30, 31);
  v.x += qx; v.y += qy;
  const shut = t >= c.slam1;
  const k = shut ? Math.min(1.07, springStep(t - c.slam1, 10, 0.5)) : 0.06 + 0.04 * Math.sin(t * 5);
  // "your own breath": a puff comes down the throat, sees the doors too late, and flattens itself on them
  const pu = inv(c.onyour - 0.16, c.bump1, t), hitP = t >= c.bump1;
  const py = hitP ? -560 - 17 - 26 * 0.62 - 12 : lerp(-790, -560 - 17 - 26 - 12, 0.62 * pu + 0.38 * E.inCubic(pu)) + (hitP ? 0 : 5 * Math.sin(t * 9));
  const sq = hitP ? 0.42 + 0.58 * Math.exp(-(t - c.bump1) * 6) * Math.abs(Math.cos((t - c.bump1) * 16)) : 0;
  chestXray(v, t, {
    door: k, doorHit: decay(t, c.slam1, 6) + 0.8 * decay(t, c.bump1, 7), air: 0.9 * (1 - 0.5 * ramp(t, c.onyour - 0.3, c.onyour)), flow: 0.55 * t + 0.3 * ramp(t, shot.start, c.slam1, E.inCubic),
    jam: shut ? ramp(t, c.slam1, c.slam1 + 0.45) : 0, sign: t >= c.sign - 0.14 ? inv(c.sign - 0.14, c.sign + 0.5, t) : 0,
    signSwing: (t >= c.sign ? 0.34 * Math.exp(-(t - c.sign) * 2.2) * Math.sin((t - c.sign) * 9) : 0) + 0.5 * decay(t, c.bump1, 5) * Math.sin((t - c.bump1) * 20),
    puffs: pu > 0 ? [{ y: py, r: 27, sq, dizzy: hitP ? 1 : 0, scared: hitP ? 0 : ramp(t, c.bump1 - 0.3, c.bump1 - 0.1), look: [0, 1], a: clamp(pu * 6) }] : [],
  });
  bxStar(v, 0, -560, 34 * v.s, inv(c.slam1, c.slam1 + 0.4, t), 14, '#FFE9A6', 33);
  bxStar(v, 0, -590, 30 * v.s, inv(c.bump1, c.bump1 + 0.4, t), 12, '#BFF3FF', 34);
  // dizzy stars round the puff
  if (hitP) {
    const p = bxPt(v, 0, py - 30);
    screenSpace();
    for (let i = 0; i < 3; i++) { const a = t * 5 + i * 2.1; bigWord('✦', p[0] + Math.cos(a) * 120, p[1] - 30 + Math.sin(a) * 34, 54, '#FFD447', clamp((t - c.bump1) * 5), a); }
  }
  return { glow: 0.85, zblur: 0.55 * (1 - ramp(lt, 0, 0.42)) + 0.05 * decay(t, c.slam1, 9), zcx: 540, zcy: 800, flash: 0.25 * (1 - ramp(lt, 0, 0.12)) + 0.16 * decay(t, c.slam1, 12) };
};

// ---------------------------------------------------------------- 4. fizz: the stomach balloons, and pokes the muscle under the lungs
SC.fizz = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  bxBg(t, '#1C3468', '#050A1E');
  const tp = c.poking - shot.start;
  const v = sectionCam(lt, [[0, 156, 150, 2.5, 800], [c.stomach_end - shot.start, 152, 128, 2.72, 800], [tp + 0.3, 40, 64, 2.08, 800], [D, 36, 56, 2.14, 800]]);
  const pk = Math.max(jab(t, c.poke1), jab(t, c.poke2), jab(t, c.poke3));
  const [qx, qy] = shake(t, 9 * pk, 30, 41);
  v.x += qx; v.y += qy;
  const sw = ramp(t, c.swells - 0.1, c.stomach_end, E.inOutCubic) * (1 + 0.04 * Math.sin(t * 9));
  const mood = t >= c.poke1 ? 1 : 0;
  chestXray(v, t, { swell: sw, fill: lerp(0.3, 0.8, ramp(t, shot.start - 0.2, c.swells + 0.4)), pour: 1 - ramp(t, c.swells, c.swells + 0.5), poke: pk * (t >= c.poke1 - 0.06 ? 1 : 0), mood, door: 0.06, air: 0.35, flow: 0.4 * t, diaGlow: 0.8 * pk });
  for (const [p, sd] of [[c.poke1, 51], [c.poke2, 52], [c.poke3, 53]]) bxStar(v, 176, bxDiaY(176, { poke: 1 }) + 20, 26 * v.s, inv(p, p + 0.3, t), 9, '#FFE9A6', sd);
  // labels (the muscle gets its name on screen, not in the narration)
  const sp = bxPt(v, 232, 160), dp = bxPt(v, -40, bxDiaY(-40, {}) - 2);
  bxLabel('STOMACH', 286, 1128, ramp(t, c.stomach - 0.08, c.stomach + 0.16, E.outBack), '#FF86A6', sp[0], sp[1], 40);
  bxLabel('DIAPHRAGM', 470, 452, ramp(t, c.breathing - 0.06, c.breathing + 0.18, E.outBack), '#FF7A6E', dp[0] + 30, dp[1] - 34, 40);
  // "!" over the muscle's face each time it is poked
  const fp = bxPt(v, -112, bxDiaY(-112, {}) - 70);
  screenSpace();
  for (const [p, i] of [[c.poke1, 0], [c.poke2, 1], [c.poke3, 2]]) {
    const kk = jab(t, p, 4);
    if (kk > 0.14) bigWord(i === 2 ? '!!' : '!', fp[0] + 70 * i - 40, fp[1] - 40 * (1 - kk), 92, '#FFD447', Math.min(1, kk * 1.6), -0.1 + 0.1 * i);
  }
  return { glow: 0.85, flash: 0.2 * (1 - ramp(lt, 0, 0.1)), zblur: 0.12 * (1 - ramp(lt, 0, 0.25)) };
};

// ---------------------------------------------------------------- 5. jerk: the muscle snaps down, air rushes in, the cords snap shut. Air hits the door.
SC.jerk = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, L = (x) => x - shot.start;
  bxBg(t, '#1C3468', '#050A1E');
  const v = sectionCam(lt, [[0, 36, 56, 2.14, 800], [L(c.jerk) - 0.08, 30, 30, 2.1, 810], [L(c.jerk) + 0.5, 0, -170, 1.68, 880], [L(c.andyour), 0, -186, 1.74, 880],
    [L(c.vocal) + 0.5, 0, -552, 3.6, 800], [L(c.slam2), 0, -556, 3.86, 800], [D, 0, -562, 4.3, 800]]);
  const hits = [c.bump2, c.bump2 + 0.14, c.bump2 + 0.28];
  const [qx, qy] = shake(t, 22 * decay(t, c.jerk, 6) + 20 * decay(t, c.slam2, 7) + 12 * (decay(t, hits[0], 9) + decay(t, hits[1], 9) + decay(t, hits[2], 9)), 30, 61);
  v.x += qx; v.y += qy;
  const drop = t >= c.jerk ? springStep(t - c.jerk, 6.5, 0.42) : 0.04 * Math.sin(t * 6);
  const shut = t >= c.slam2;
  const k = shut ? Math.min(1.07, springStep(t - c.slam2, 10, 0.5)) : 0.06 + 0.05 * Math.sin(t * 6) + 0.1 * ramp(t, c.snap - 0.1, c.slam2);
  // three puffs of air arrive one after another and pile up on the shut doors
  const puffs = hits.map((h, i) => {
    const u = inv(h - 0.5, h, t), land = -560 - 17 - 24 * 0.62 - i * 30;
    const hit = t >= h;
    return { y: hit ? land : lerp(-800, land - 10, E.inCubic(u)), x: [0, -11, 9][i], r: 24 - i * 1.5, sq: hit ? 0.4 + 0.6 * Math.exp(-(t - h) * 6) * Math.abs(Math.cos((t - h) * 16)) : 0, dizzy: hit ? 1 : 0, scared: hit ? 0 : ramp(t, h - 0.25, h - 0.08), look: [0, 1], a: clamp(u * 6) };
  }).filter((p) => p.a > 0);
  chestXray(v, t, {
    swell: 1, fill: 0.8, mood: t >= c.jerk ? 2 : 1, drop, door: k, doorHit: decay(t, c.slam2, 6) + 0.7 * (decay(t, hits[0], 8) + decay(t, hits[1], 8) + decay(t, hits[2], 8)),
    air: 0.45 + 0.55 * ramp(t, c.jerk, c.jerk + 0.12), flow: 0.4 * t + 1.7 * ramp(t, c.jerk, c.jerk + 0.7, E.outCubic) + 0.5 * Math.max(0, t - c.jerk), jam: shut ? ramp(t, c.slam2, c.slam2 + 0.4) : 0,
    lungGlow: decay(t, c.jerk, 1.6), diaGlow: decay(t, c.jerk, 3), puffs,
  });
  // the pull: chevrons racing down the windpipe when the muscle jerks
  const pull = ramp(t, c.jerk, c.jerk + 0.1) * (1 - ramp(t, c.jerk + 0.75, c.jerk + 1.15));
  if (pull > 0.01) {
    screenSpace();
    for (let i = 0; i < 5; i++) {
      const u = ((t - c.jerk) * 1.9 + i / 5) % 1, p = bxPt(v, 0, lerp(-730, -330, u)), s = v.s * (u < 0.52 ? 26 : 14), a = pull * Math.sin(Math.PI * u);
      ctx.beginPath(); ctx.moveTo(p[0] - s, p[1] - s * 0.7); ctx.lineTo(p[0], p[1]); ctx.lineTo(p[0] + s, p[1] - s * 0.7);
      ctx.lineWidth = 0.34 * s; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = `rgba(160,240,255,${0.95 * a})`; ctx.stroke();
      softDot(gctx, p[0], p[1], s * 2, '#7FE9FF', 0.6 * a);
    }
  }
  bxStar(v, 0, bxDiaY(0, { drop: 1 }), 150 * v.s, inv(c.jerk, c.jerk + 0.45, t), 16, '#FFD0C8', 62);
  bxStar(v, 0, -560, 34 * v.s, inv(c.slam2, c.slam2 + 0.4, t), 14, '#FFE9A6', 63);
  hits.forEach((h, i) => bxStar(v, 0, -590 - i * 26, 30 * v.s, inv(h, h + 0.35, t), 10, '#BFF3FF', 64 + i));
  const lp = bxPt(v, -22, -560);
  bxLabel('VOCAL CORDS', 292, 474, ramp(t, c.vocal + 0.42, c.vocal + 0.66, E.outBack), '#C8A8FF', lp[0], lp[1] - 14, 40);
  return { glow: 0.85, flash: 0.22 * decay(t, c.jerk, 10) + 0.16 * decay(t, c.slam2, 12), zblur: 0.07 * decay(t, c.jerk, 8), zcx: 540, zcy: 900 };
};

// the hedge, on screen: a stamp that lands big and then keeps its corner
function ideaStamp(t, t0) {
  const k = inv(t0, t0 + 0.22, t);
  if (k <= 0) return;
  const set = ramp(t, t0 + 0.9, t0 + 1.5, E.inOutCubic);
  stamp('UNPROVEN', lerp(700, 792, set), lerp(520, 452, set), k, '#FF5A6E', lerp(-0.1, 0.07, set), lerp(104, 58, set));
}

// ---------------------------------------------------------------- 7. pond: into the glass, into a pond. One idea: tadpoles
SC.pond = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  pdBack(t, { sink: 520 * ramp(lt, 0, 1.7, E.outCubic), soda: 1 - ramp(lt, 0.03, 0.42), dx: 46 * lt });
  // a school of small ones crosses behind, right to left, on "tadpoles"
  const sc = inv(c.wegot - 0.2, shot.end + 0.6, t);
  for (let i = 0; i < 7; i++) {
    const x = 1240 - sc * (1500 + 260 * hash(i)) - i * 46, y = 620 + 520 * hash(i * 3.1 + 1) + 16 * Math.sin(t * 3 + i);
    ctx.save(); ctx.globalAlpha = 0.5 + 0.3 * hash(i + 4); pdTadpole(ctx, x, y, 0.2 + 0.12 * hash(i * 7), t, { dir: -1, ph: i * 1.7, look: [0.5, 0] }); ctx.restore();
  }
  // the one from his glass swims in from the upper left and pulls up in front of us
  const u = ramp(t, shot.start, c.one + 0.15, E.outCubic), hp = c.hicpair, j = hicJ(t, hp, 7, 20);
  const x = lerp(-420, 606, u), y = lerp(520, 944, E.outBack(u, 0.9)) + 14 * Math.sin(t * 2.2) - 18 * j;
  const grin = ramp(t, c.tadpoles - 0.05, c.tadpoles + 0.2);
  pdTadpole(ctx, x, y, 1.5, t, { dir: 1, wag: lerp(1.0, 0.4, u) + 0.5 * grin * Math.max(0, Math.sin((t - c.tadpoles) * 9)) * (1 - ramp(t, c.tadpoles_end, c.tadpoles_end + 0.2)), tilt: -0.34 * (1 - u), look: [lerp(0.8, 0.2, u), lerp(0.2, -0.5, ramp(t, c.wegot, c.wegot + 0.3))],
    blink: blinkAt(t, 9, 1.7), smile: grin, mouth: clamp(Math.abs(j) * 1.4), flare: 0.5 * grin });
  softDot(gctx, x + 40, y - 20, 300, '#9CFFB0', 0.12);
  // "we got it from": a dotted line from the tadpole up to ... him
  const ak = ramp(t, c.wegot - 0.05, c.from + 0.1, E.inOutCubic), pk = ramp(t, c.wegot - 0.12, c.wegot + 0.12, E.outBack);
  screenSpace();
  if (ak > 0.01) {
    const A = [x - 40, y - 172], B = [356, 690], M = [(A[0] + B[0]) / 2 + 90, (A[1] + B[1]) / 2 - 10];
    ctx.save(); ctx.setLineDash([16, 14]); ctx.lineDashOffset = -t * 60; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.strokeStyle = '#FFD447';
    ctx.beginPath(); ctx.moveTo(A[0], A[1]);
    const n = 24; for (let i = 1; i <= Math.round(n * ak); i++) { const q = i / n; ctx.lineTo((1 - q) * (1 - q) * A[0] + 2 * q * (1 - q) * M[0] + q * q * B[0], (1 - q) * (1 - q) * A[1] + 2 * q * (1 - q) * M[1] + q * q * B[1]); }
    ctx.stroke(); ctx.restore();
    if (ak > 0.97) { ctx.beginPath(); ctx.moveTo(B[0] - 34, B[1] + 4); ctx.lineTo(B[0] - 2, B[1] - 4); ctx.lineTo(B[0] + 8, B[1] + 30); ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#FFD447'; ctx.stroke(); }
  }
  pdPortrait(270, 590, 112, pk, t, j);
  ideaStamp(t, c.one - 0.02);
  // both of them, at the same moment: hic
  if (t >= hp) {
    screenSpace();
    hicBurst('hic', 430, 472, springStep(t - hp, 6, 0.45), t, 62, '#FF5A6E', -0.1);
    hicBurst('hic', Math.min(x + 250, 800), y - 190, springStep(t - hp - 0.02, 6, 0.45), t, 66, '#4DFFB4', 0.12);
  }
  return { glow: 0.8, zblur: 0.5 * (1 - ramp(lt, 0, 0.4)), zcx: 540, zcy: 900, flash: 0.2 * (1 - ramp(lt, 0, 0.1)) };
};

// ---------------------------------------------------------------- 8. gulp: water in, out over the gills, and the same door shut
// the tadpole's pump: a gulp every 1.25 s from cues.gulp1. Returns {mouth, floor, inK, outK, flow}
function pdPump(t) {
  const c = cu(), P = 1.25, k = Math.floor((t - c.gulp1) / P), tau = t - c.gulp1 - k * P;
  if (t < c.gulp1) return { mouth: 0, floor: 0, inK: 0, outK: 0, flow: 0 };
  return {
    mouth: ramp(tau, 0, 0.14) * (1 - ramp(tau, 0.6, 0.74)), floor: ramp(tau, 0.02, 0.5, E.inOutSine) * (1 - ramp(tau, 0.76, 1.05, E.inOutSine)),
    inK: ramp(tau, 0, 0.1) * (1 - ramp(tau, 0.55, 0.75)), outK: ramp(tau, 0.72, 0.84) * (1 - ramp(tau, 1.1, 1.25)),
    flow: k + 0.46 * ramp(tau, 0, 0.62, E.inOutSine) + 0.54 * ramp(tau, 0.72, 1.2, E.outCubic),
  };
}
SC.gulp = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, L = (x) => x - shot.start;
  pdBack(t, { sink: 520, dx: 46 * (c.they - 20.3) + 20 * lt, dim: 0.22 });
  const v = sectionCam(lt, [[0, -44, 16, 1.56, 812], [L(c.with) - 0.12, -50, 14, 1.64, 812], [L(c.same) + 0.2, -30, -26, 3.0, 800], [L(c.shut2_end) + 0.02, -30, -28, 3.2, 800], [L(c.tadhic) + 0.06, -70, 6, 1.56, 812], [D, -70, 6, 1.6, 812]]);
  const j = hicJ(t, c.tadhic, 7, 20), kn = jab(t, c.knock, 6);
  const [qx, qy] = shake(t, 9 * kn + 9 * decay(t, c.tadhic, 7), 30, 81);
  v.x += qx; v.y += qy;
  const pm = pdPump(t), near = ramp(t, c.with - 0.1, c.same + 0.2);
  pdTadCut(v, t, {
    mouth: Math.max(pm.mouth, clamp(Math.abs(j) * 1.5)), floor: pm.floor, inK: pm.inK, outK: pm.outK, flow: pm.flow, door: 1,
    knock: ramp(t, c.with, c.with + 0.3) * (1 - ramp(t, c.shut2_end, c.shut2_end + 0.15)), doorHit: 0.8 * kn + 0.25 * near * Math.max(0, Math.sin(t * 14)) * (t < c.shut2_end ? 1 : 0),
    look: [lerp(-0.6, 0.9, near), lerp(0.2, 0.5, near)], blink: blinkAt(t, 5, 2.1), hic: j,
  });
  // labels
  const gp = pdPt(v, 40, 232), lp = pdPt(v, 150, -56), dp = pdPt(v, -38, -28);
  bxLabel('GILLS', 752, 1150, ramp(t, c.gills - 0.06, c.gills + 0.16, E.outBack) * (1 - ramp(t, c.with - 0.15, c.with)), '#FF86A6', gp[0], gp[1], 44);
  bxLabel('LUNG: STAYS DRY', 632, 1096, ramp(t, c.door3 - 0.05, c.door3 + 0.18, E.outBack) * (1 - ramp(t, c.shut2_end, c.shut2_end + 0.1)), '#FF86A6', lp[0], lp[1] + 40, 38);
  // "that same door": his own, in a round frame, next to the tadpole's
  const ik = ramp(t, c.same - 0.08, c.same + 0.16, E.outBack) * (1 - ramp(t, c.shut2_end, c.shut2_end + 0.1));
  if (ik > 0.01) {
    screenSpace();
    ctx.save(); ctx.translate(262, 566); ctx.scale(ik, ik);
    ctx.beginPath(); ctx.arc(0, 0, 138, 0, 7); ctx.fillStyle = '#7FE9FF'; ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, 126, 0, 7); ctx.fillStyle = '#122A5C'; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.fillStyle = '#E7B6C6'; ctx.fillRect(-84, -140, 168, 280); ctx.fillStyle = '#0B1F3F'; ctx.fillRect(-66, -140, 132, 280);
    for (const sd of [-1, 1]) { rrect(ctx, sd * 66 - (sd > 0 ? 0 : 12), -18, 12, 36, 3); ctx.fillStyle = '#5B6B86'; ctx.fill(); }
    bxDoorPair(ctx, 0, 0, 66, 1, 0.5 * kn);
    ctx.restore();
    ctx.restore();
    pill(262, 742, 'YOURS', '#7FE9FF', ik, 38);
    pill(dp[0] + 6, dp[1] + 150, 'ITS', '#B9E08A', ik, 38);
  }
  const ks = pdPt(v, -56, -24);
  screenSpace();
  shockLines(ks[0], ks[1], 26 * v.s, inv(c.knock, c.knock + 0.35, t), 10, '#BFF3FF', 83);
  ideaStamp(t, c.one - 0.02);
  // the tadpole's own hiccup
  if (t >= c.tadhic) {
    const d = t - c.tadhic, mp = pdPt(v, -330, 16);
    screenSpace();
    ctx.beginPath(); ctx.arc(mp[0] - 60 - 160 * d, mp[1] - 220 * d, 22 + 70 * d, 0, 7); ctx.fillStyle = 'rgba(190,240,255,0.2)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(220,250,255,0.9)'; ctx.stroke();
    hicBurst('hic', 330, 520, springStep(d, 6, 0.45), t, 88, '#4DFFB4', -0.1);
  }
  return { glow: 0.8, flash: 0.16 * (1 - ramp(lt, 0, 0.1)) + 0.12 * decay(t, c.tadhic, 12) };
};
