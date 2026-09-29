// Hypnic-jerk Short, part 2: inside. The handover between the stay-awake and sleep systems,
// brain waves slowing, the glitch, the burst down the spine, BAM, the falling feeling, the
// panic button, and what is actually happening.
'use strict';

const BRAIN = { x: 540, y: 690, s: 1.2 };
const RAS = [100, 175];   // brainstem core: the stay-awake (arousal) system
const VLPO = [8, 102];    // hypothalamus: the sleep switch
const WAKEP = [800, 1140], SLEEPP = [280, 1140];
function brainPt(p, b = BRAIN) { return [b.x + p[0] * b.s, b.y + p[1] * b.s]; }
let CORTEX = null;
function initScenes3() {
  const rng = mulberry32(55);
  CORTEX = [...Array(9)].map((_, i) => [-250 + i * 58 + rng() * 20, -200 + Math.abs(i - 4) * 22 + rng() * 30]);
}

// ---------------------------------------------------------------- UI pieces
function station(x, y, kind, on, k, t, red = 0) {
  if (k <= 0.001) return;
  const col = red > 0 ? mixHex(kind === 'wake' ? '#FFA640' : '#7FB4FF', '#FF3A4A', red) : (kind === 'wake' ? '#FFA640' : '#7FB4FF');
  const hex = kind === 'wake' ? '#FFA640' : '#7FB4FF';
  const s = 1.22 * E.outBack(clamp(k), 1.8);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -190, -86, 380, 172, 34); ctx.fillStyle = 'rgba(8,12,34,0.92)'; ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = on > 0.5 || red > 0 ? col : rgba(hex, 0.35 + 0.65 * on); ctx.stroke();
  // icon
  ctx.save(); ctx.translate(-118, 0);
  if (kind === 'wake') {
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + t * 0.6; line(ctx, Math.cos(a) * 38, Math.sin(a) * 38, Math.cos(a) * 52, Math.sin(a) * 52, 7, rgba('#FFC060', 0.3 + 0.7 * on)); }
    circle(ctx, 0, 0, 30, rgba('#FFB347', 0.35 + 0.65 * on));
  } else {
    ctx.beginPath(); ctx.arc(0, 0, 38, 0, Math.PI * 2); ctx.arc(16, -10, 32, 0, Math.PI * 2, true);
    ctx.fillStyle = rgba('#AFC8FF', 0.35 + 0.65 * on); ctx.fill('evenodd');
    for (const [sx, sy] of [[30, -34], [44, 18]]) circle(ctx, sx, sy, 4, rgba('#DDE8FF', 0.3 + 0.7 * on));
  }
  ctx.restore();
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.font = '900 34px Montserrat'; ctx.fillStyle = rgba('#FFFFFF', 0.5 + 0.5 * on);
  ctx.fillText(kind === 'wake' ? 'STAY-AWAKE' : 'SLEEP', -58, -22);
  ctx.font = '700 27px Montserrat'; ctx.fillStyle = rgba(hex, 0.55 + 0.45 * on);
  ctx.fillText(kind === 'wake' ? 'brainstem' : 'hypothalamus', -58, 24);
  ctx.restore();
  if (on > 0.05) {
    gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); gctx.translate(x, y); gctx.scale(s, s);
    rrect(gctx, -190, -86, 380, 172, 34); gctx.lineWidth = 14; gctx.strokeStyle = rgba(red > 0.3 ? '#FF3A4A' : hex, 0.7 * on); gctx.stroke();
    gctx.restore();
  }
}
// thin leader line from a panel to its spot in the brain
function leader(a, b, k, col) {
  if (k <= 0) return;
  screenSpace();
  const x = lerp(a[0], b[0], clamp(k)), y = lerp(a[1], b[1], clamp(k));
  ctx.setLineDash([10, 10]); line(ctx, a[0], a[1], x, y, 3, rgba(col, 0.8)); ctx.setLineDash([]);
  if (k >= 1) { circle(ctx, b[0], b[1], 9, col); softDot(gctx, b[0], b[1], 40, col, 0.9); }
}
// AWAKE <----o----> ASLEEP
function slider(k, a = 1, jitter = 0, t = 0) {
  if (a <= 0.01) return;
  screenSpace();
  const x0 = 200, x1 = 880, y = 250;
  ctx.globalAlpha = a;
  rrect(ctx, x0 - 20, y - 16, x1 - x0 + 40, 32, 16);
  const g = ctx.createLinearGradient(x0, 0, x1, 0);
  g.addColorStop(0, '#FF9A3C'); g.addColorStop(1, '#5E8BFF');
  ctx.fillStyle = g; ctx.fill();
  ctx.font = '900 36px Montserrat'; ctx.textBaseline = 'middle';
  ctx.textAlign = 'left'; ctx.fillStyle = '#FFB36B'; ctx.fillText('AWAKE', x0 - 20, y - 56);
  ctx.textAlign = 'right'; ctx.fillStyle = '#9DBBFF'; ctx.fillText('ASLEEP', x1 + 20, y - 56);
  const kx = lerp(x0, x1, clamp(k + jitter * vnoise(t * 40, 3)));
  circle(ctx, kx, y, 32, '#FFFFFF'); circle(ctx, kx, y, 22, mixHex('#FF9A3C', '#5E8BFF', clamp(k)));
  softDot(gctx, kx, y, 70, '#FFFFFF', 0.6 * a);
  ctx.globalAlpha = 1;
}
// the "control" orb: a gold light with a spinning ring
function orb(x, y, s, t, a = 1) {
  if (a <= 0.01) return;
  screenSpace();
  softDot(ctx, x, y, 60 * s, '#FFE27A', 0.5 * a);
  circle(ctx, x, y, 20 * s, rgba('#FFF6D0', a));
  ctx.save(); ctx.translate(x, y); ctx.rotate(t * 3); ctx.scale(1, 0.4);
  ctx.beginPath(); ctx.arc(0, 0, 36 * s, 0, Math.PI * 2); ctx.lineWidth = 5 * s; ctx.strokeStyle = rgba('#FFD447', a); ctx.stroke();
  ctx.restore();
  softDot(gctx, x, y, 110 * s, '#FFD447', a);
}
function orbPath(k) { // WAKE panel -> over the top -> SLEEP panel
  const a = [WAKEP[0], WAKEP[1] - 150], c = [540, 800], b = [SLEEPP[0], SLEEPP[1] - 150];
  const u = clamp(k);
  return [(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * c[1] + u * u * b[1]];
}
// warm arousal rays from the brainstem up into the cortex (brain-local)
function arousalRays(b, t, a, red = 0) {
  if (a <= 0.01) return;
  const col = mixHex('#FFB347', '#FF3A4A', red);
  for (let i = 0; i < CORTEX.length; i++) {
    const p = CORTEX[i];
    local(ctx, b.x, b.y, b.s);
    ctx.beginPath(); ctx.moveTo(RAS[0], RAS[1]); ctx.quadraticCurveTo(RAS[0] - 30, (RAS[1] + p[1]) / 2, p[0], p[1]);
    ctx.lineWidth = 5; ctx.strokeStyle = rgba('#FFB347', 0.35 * a); ctx.stroke();
    const ph = (t * 0.9 + i / CORTEX.length) % 1;
    const u = ph, qx = (1 - u) * (1 - u) * RAS[0] + 2 * u * (1 - u) * (RAS[0] - 30) + u * u * p[0];
    const qy = (1 - u) * (1 - u) * RAS[1] + 2 * u * (1 - u) * ((RAS[1] + p[1]) / 2) + u * u * p[1];
    circle(ctx, qx, qy, 7, rgba('#FFF2C0', a));
    local(gctx, b.x, b.y, b.s, 0, true); softDot(gctx, qx, qy, 30, col, a);
  }
  screenSpace();
}
function sleepWaves(b, t, a) {
  if (a <= 0.01) return;
  local(ctx, b.x, b.y, b.s);
  for (let i = 0; i < 4; i++) {
    const ph = (t * 0.45 + i / 4) % 1;
    ctx.beginPath(); ctx.arc(VLPO[0], VLPO[1], 20 + ph * 320, 0, Math.PI * 2);
    ctx.lineWidth = 6; ctx.strokeStyle = rgba('#8FB8FF', 0.45 * a * (1 - ph)); ctx.stroke();
  }
  screenSpace();
}
function darkBg(c1 = '#141A48', c2 = '#04050F') {
  screenSpace();
  const bg = ctx.createRadialGradient(540, 760, 60, 540, 900, 1300);
  bg.addColorStop(0, c1); bg.addColorStop(1, c2);
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
}
// the whole "control room" state at time t (shared by handover + glitch)
function controlRoom(t, o) {
  darkBg();
  headProfile(BRAIN.x - 48, BRAIN.y - 70, 1.02, 0.28);
  drawBrain(BRAIN.x, BRAIN.y, BRAIN.s, t, { act: o.act, calm: o.calm, alarm: o.alarm || 0 });
  arousalRays(BRAIN, t, o.rays, o.red || 0);
  sleepWaves(BRAIN, t, o.waves);
  leader([WAKEP[0], WAKEP[1] - 105], brainPt(RAS), o.leadW, '#FFA640');
  leader([SLEEPP[0], SLEEPP[1] - 105], brainPt(VLPO), o.leadS, '#7FB4FF');
  station(...WAKEP, 'wake', o.wakeOn, o.wakeK, t, o.red || 0);
  station(...SLEEPP, 'sleep', o.sleepOn, o.sleepK, t);
  slider(o.slider, o.sliderA, o.jitter || 0, t);
  const [ox, oy] = orbPath(o.orbK);
  orb(ox, oy, 1.6 + 0.2 * Math.sin(t * 6), t, o.orbA);
}

// ================================================================= 6. the handover
SC.handover = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const fly = E.inOutCubic(inv(c.passes, c.sleepsys + 0.1, t));
  const o = {
    act: lerp(1, 0.45, fly), calm: fly,
    rays: ramp(t, c.stay - 0.2, c.stay + 0.3) * (1 - 0.85 * fly) + 0.25 * (1 - fly),
    waves: ramp(t, c.sleepsys - 0.1, c.sleepsys + 0.4),
    leadW: ramp(t, c.stay - 0.1, c.stay + 0.35), leadS: ramp(t, c.sleepsys - 0.2, c.sleepsys + 0.2),
    wakeOn: 1 - fly, wakeK: ramp(t, c.handover - 0.1, c.handover + 0.25), sleepOn: ramp(t, c.sleepsys - 0.1, c.sleepsys + 0.3),
    sleepK: ramp(t, c.handover + 0.15, c.handover + 0.45), slider: lerp(0.08, 0.9, fly), sliderA: ramp(t, c.handover - 0.1, c.handover + 0.3),
    orbK: fly, orbA: ramp(t, c.handover + 0.2, c.handover + 0.5),
  };
  controlRoom(t, o);
  const enter = 1 - E.outCubic(inv(0, 0.2, lt));
  return { grain: 1, zblur: -0.1 * enter, zcx: 540, zcy: 700, push: { k: 1 + 0.07 * E.inOutSine(clamp(lt / D)), cx: 540, cy: 820 } };
};

// ================================================================= 7. brain waves slow, muscles go loose
SC.relax = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const push = E.inOutSine(clamp(lt / D));
  const cam = { x: 540, y: lerp(1020, 990, push), zoom: lerp(0.93, 1.0, push), rot: 0.01 };
  const { st, r } = xrayBed(cam, t, {});
  const loose = E.inOutSine(inv(c.muscles - 0.1, c.loose + 0.35, t));
  muscles(cam, st, r, lerp(0.75, 0.06, loose), t);
  zzz(540 + 120, 360, t, c.loose - 0.2, ramp(t, c.loose, c.loose + 0.3), 1.2);
  const state = (tau) => E.inOutSine(inv(c.slow - 0.25, c.slow + 1.1, tau));
  const lab = state(t) < 0.5 ? 'AWAKE' : 'DRIFTING OFF';
  const labCol = state(t) < 0.5 ? '#FFB36B' : '#9DBBFF';
  const pk = E.outBack(inv(shot.start, shot.start + 0.25, t), 1.6);
  if (pk > 0) {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(540, 390); ctx.scale(pk, pk); ctx.translate(-540, -390);
    drawEEG(90, 240, 900, 300, t, state, mixHex('#FFB36B', '#8FB8FF', state(t)), lab);
    ctx.restore();
  }
  pill(540, 640, 'MUSCLE TONE', loose > 0.5 ? '#8FB8FF' : '#FF9A3C', ramp(t, c.muscles - 0.15, c.muscles + 0.1), 36);
  const enter = 1 - E.outCubic(inv(0, 0.16, lt));
  return { grain: 1, blur: enter > 0.02 ? [0, 140 * enter] : null, flash: 0.3 * enter, push: { k: 1 + 0.05 * E.inOutSine(clamp(lt / D)), cx: 540, cy: 900 } };
};

// ================================================================= 8. but the handover can glitch
SC.glitch = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, g = c.glitch;
  const hit = t >= g - 0.05 ? Math.exp(-(t - g + 0.05) * 3.5) : 0;
  const stut = t >= g - 0.05 ? 0.5 * Math.abs(Math.sin((t - g) * 38)) * Math.exp(-(t - g) * 2.2) : 0;
  const build = ramp(t, g + 0.45, shot.end, E.inCubic);
  const o = {
    act: 0.45 + 0.4 * hit + 0.4 * build, calm: 1 - 0.6 * build - 0.3 * hit, alarm: 0.5 * build,
    rays: 0.1 + 0.6 * hit + 0.9 * build, red: clamp(hit + build), waves: 1 - build,
    leadW: 1, leadS: 1, wakeOn: clamp(0.8 * hit + build), wakeK: 1, sleepOn: 1 - 0.7 * build, sleepK: 1,
    slider: 0.9 - 0.55 * stut - 0.25 * build, sliderA: 1, jitter: 0.08 * hit + 0.05 * build,
    orbK: 1 - 0.55 * stut, orbA: 1,
  };
  // camera leans toward the brainstem as it charges up
  const push = E.inCubic(inv(g + 0.4, shot.end, t));
  ctx.save();
  controlRoom(t, o);
  ctx.restore();
  const [rx, ry] = brainPt(RAS);
  if (t >= g - 0.05) {
    const fr = Math.floor(t * FPS);
    for (let i = 0; i < 3; i++) sparks(700 + fr + i * 13, rx, ry, t - 0.05 - i * 0.03, t, 8, { speed: 520, life: 0.35, grav: 200, cols: ['#FF5A6E', '#FFD447', '#FFFFFF'] });
    softDot(gctx, rx, ry, 120 + 140 * build, '#FF3A4A', clamp(0.8 * hit + build));
    pill(540, 380, 'GLITCH!', '#FF5A6E', ramp(t, g, g + 0.15) * (1 - ramp(t, g + 0.9, g + 1.1)), 44);
  }
  return {
    grain: 1, glitch: clamp(0.9 * Math.exp(-Math.max(0, t - g) * 5) * (t >= g - 0.04 ? 1 : 0) + 0.18 * build * Math.abs(vnoise(t * 9, 4))),
    zblur: 0.06 * push, zcx: rx, zcy: ry, tint: '#FF3A4A', tintA: 0.12 * build,
    push: { k: 1.07 + 0.12 * push, cx: rx, cy: ry },
  };
};

// ================================================================= 9. a burst of signals, brainstem -> spine
function spinePath(bx, by, bs) {
  const P = [];
  const x0 = bx + 104 * bs, y0 = by + 290 * bs;
  for (let i = 0; i <= 40; i++) {
    const k = i / 40;
    P.push([x0 + 26 * Math.sin(k * 3.2) * bs - 30 * k * k * bs, y0 + k * 1500 * bs]);
  }
  return P;
}
SC.burst = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, b0 = c.burst;
  // camera tilts down the spine with the signal wavefront
  const tilt = E.inOutCubic(inv(c.burst + 0.3, c.spine + 0.25, t));
  const oy = -lerp(0, 1040, tilt);
  const B = { x: 470, y: 660 + oy, s: 0.95 };
  darkBg('#160F3A', '#040312');
  // soft body silhouette behind the spine (side view)
  local(ctx, B.x, B.y, B.s);
  ctx.beginPath(); ctx.moveTo(-160, 330); ctx.bezierCurveTo(-230, 700, -220, 1300, -180, 1800);
  ctx.lineTo(320, 1800); ctx.bezierCurveTo(330, 1300, 360, 700, 250, 330); ctx.closePath();
  ctx.fillStyle = 'rgba(80,110,220,0.08)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(127,200,255,0.25)'; ctx.stroke();
  screenSpace();
  headProfile(B.x - 48 * 0.8, B.y - 70 * 0.8, 0.8 * B.s / 0.95, 0.4);
  const fire = t >= b0 ? Math.exp(-(t - b0) * 2.5) : 0;
  drawBrain(B.x, B.y, B.s, t, { act: 0.7 + 0.3 * fire, calm: 0.3, alarm: 0.25 + 0.5 * fire });
  const P = spinePath(B.x, B.y, B.s);
  // vertebrae + cord
  for (let i = 2; i < P.length; i += 3) {
    const [px, py] = P[i];
    rrect(ctx, px - 14, py - 26, 96, 48, 16); ctx.fillStyle = 'rgba(200,214,245,0.30)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(220,230,255,0.55)'; ctx.stroke();
    rrect(ctx, px + 34, py - 12, 60, 24, 10); ctx.fillStyle = 'rgba(200,214,245,0.22)'; ctx.fill();
  }
  poly(ctx, P, 48, 'rgba(150,80,110,0.9)'); poly(ctx, P, 34, '#ECC4AA'); poly(ctx, P.map(([x, y]) => [x - 6, y]), 7, 'rgba(255,240,225,0.8)');
  // nerves branching off the cord
  for (let i = 4; i < P.length; i += 4) {
    const [px, py] = P[i];
    for (const s of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(px, py); ctx.quadraticCurveTo(px + s * 70, py + 20, px + s * 150, py + 60);
      ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(236,196,170,0.5)'; ctx.stroke();
    }
  }
  const [rx, ry] = [B.x + RAS[0] * B.s, B.y + RAS[1] * B.s];
  if (t >= b0) {
    const k = (t - b0) / 0.6;
    if (k < 1) ring(rx, ry, 30 + 260 * E.outCubic(k), 30 + 260 * E.outCubic(k), 8 * (1 - k), '#FFD447', 0.9 * (1 - k));
    softDot(gctx, rx, ry, 160, '#FFD447', 0.9 * fire + 0.3);
    // the volley: a dense train of signals racing down the cord, then a steady stream
    const cordP = [[rx, ry], ...P];
    signals(cordP, t, { once: true, t0: b0, speed: 520, n: 12, gap: 78, col: '#FFD447', r: 14 });
    signals(cordP, t, { n: 6, speed: 520, col: '#FFB347', r: 9, a: 0.8 * ramp(t, b0 + 1.4, b0 + 1.8) });
    // branch sparks where the wavefront passes
    const acc = polyLen(cordP), front = (t - b0) * 520;
    for (let i = 4; i < P.length; i += 4) {
      const s0 = acc[Math.min(acc.length - 1, i + 1)];
      const d = front - s0;
      if (d > 0 && d < 260) {
        const [px, py] = P[i];
        for (const s of [-1, 1]) {
          const u = clamp(d / 160);
          const qx = px + s * 150 * u, qy = py + 60 * u * u;
          circle(ctx, qx, qy, 8, '#FFF3C0'); softDot(gctx, qx, qy, 36, '#FFD447', 1 - d / 260);
        }
      }
    }
  }
  pill(760, B.y + 170 * B.s + 40, 'BRAINSTEM', '#FFB347', ramp(t, c.brainstem - 0.1, c.brainstem + 0.15), 38);
  pill(300, 1100, 'SPINAL CORD', '#ECC4AA', ramp(t, c.spine - 0.15, c.spine + 0.1), 38);
  const enter = 1 - E.outCubic(inv(0, 0.18, lt));
  return { grain: 1, flash: (t >= b0 ? 0.3 * Math.exp(-(t - b0) * 10) : 0) + 0.3 * enter, blur: tilt > 0 && tilt < 1 ? [0, -30 * Math.sin(Math.PI * tilt)] : null };
};

// ================================================================= 10. BAM: every muscle fires at once
SC.bam = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, bm = c.bam;
  const hit = t >= bm ? t - bm : -1;
  const [shx, shy] = hit >= 0 ? shake(t, 40 * Math.exp(-hit * 5), 28, 6) : [0, 0];
  const cam = { x: 540, y: 980, zoom: 0.96 * (hit >= 0 ? 1 + 0.08 * Math.exp(-hit * 7) : 1), rot: 0, sx: shx, sy: shy };
  const jk = hit >= 0 ? E.outBack(clamp(hit / 0.08), 1.4) * (1 - 0.7 * ramp(hit, 0.6, 2.4)) : 0;
  const pose = twitch(lerpPose(POSES.sleep, POSES.jolt, clamp(jk, 0, 1.1)), t, hit >= 0 && hit < 2 ? 0.1 * (1 - hit / 2) : 0);
  const { st, r } = xrayBed(cam, t, { pose });
  // nerve routes light up from the spine out to every limb just before the hit
  const N = nervePaths(st, r);
  const pre = inv(bm - 0.3, bm, t);
  applyCam(cam);
  for (const L of N.limbs) {
    const acc = polyLen(L), Lt = acc[acc.length - 1];
    const sh = Lt * clamp(pre * 1.05);
    const upto = [];
    for (let s = 0; s <= sh; s += 20) upto.push(polyAt(L, acc, s));
    if (upto.length > 1) { poly(ctx, upto, 6, 'rgba(255,230,140,0.9)'); poly(gctx, upto, 16, 'rgba(255,210,90,0.8)'); }
  }
  screenSpace();
  const tension = hit >= 0 ? clamp(1.05 - 0.45 * ramp(hit, 0.3, 2.6)) * (0.8 + 0.2 * Math.abs(Math.sin(hit * 18))) : 0.1 + 0.2 * pre;
  muscles(cam, st, r, tension, t, hit >= 0 ? 0.6 : 0);
  if (hit >= 0 && hit < 0.5) { const [bx, by] = toScreen(cam, 540, 900); shockLines(bx, by, 420, hit / 0.5, 18, '#FF5A6E', 11); }
  if (hit >= 0) {
    for (const s of r ? ['L', 'R'] : []) {
      for (const j of ['wr', 'an']) { const p = toWorld(st, r[j + s]); const [px, py] = toScreen(cam, p[0], p[1]); sparks(900 + (j === 'wr' ? 1 : 2) + (s === 'L' ? 10 : 20), px, py, bm, t, 10, { speed: 700, life: 0.4, grav: 0, spread: Math.PI, cols: ['#FF5A6E', '#FFD447', '#FFFFFF'] }); }
    }
  }
  const enter = 1 - E.outCubic(inv(0, 0.15, lt));
  return { grain: 1, flash: (hit >= 0 ? 0.55 * Math.exp(-hit * 12) : 0) + 0.25 * enter, tint: '#FF2A3A', tintA: hit >= 0 ? 0.18 * Math.exp(-hit * 2) : 0 };
};

// ================================================================= 11. the falling feeling (dream)
function dreamWorld(cam, t, o = {}) {
  screenSpace();
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#2A1060'); g.addColorStop(0.5, '#15103F'); g.addColorStop(1, '#060818');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // stars streaking upward: we are falling fast
  const sp = o.speed === undefined ? 1 : o.speed;
  for (const s of STARS) {
    const y = ((s.y * 2400 - t * 2600 * (0.4 + s.z) * sp) % 2400 + 2400) % 2400 - 200;
    const x = s.x * W;
    const len = 30 + 120 * s.z * sp;
    line(ctx, x, y, x, y + len, s.r * 1.2, `rgba(210,200,255,${0.25 + 0.5 * s.z})`);
    if (s.z > 0.8) line(gctx, x, y, x, y + len, s.r * 3, `rgba(170,150,255,0.5)`);
  }
  // cloud wisps rushing past
  for (let i = 0; i < 7; i++) {
    const y = ((i * 420 - t * 1800 * sp) % 2600 + 2600) % 2600 - 400;
    const x = hash(i * 3.1) * W;
    softDot(ctx, x, y, 240 + 120 * hash(i), '#6F5BD8', 0.22);
  }
  // the dreamer, tumbling
  const rot = (o.rot0 || 0) + t * 1.4;
  const st = { x: 0, y: 0, s: 1, pose: twitch(POSES.fall, t, 0.12), face: FACES.shock, frizz: 0.5, soot: 0, seed: 3 };
  charLayer({ x: 0, y: -250, zoom: cam.zoom, rot: 0.35 * Math.sin(rot), sx: (cam.sx || 0) + (o.dx || 0), sy: (cam.sy || 0) + (o.dy || 0) }, st, t, { pal: PJ, ambient: 0.05 });
  // his pillow tumbling after him
  screenSpace();
  ctx.save(); ctx.translate(W / 2 + 290 + (o.dx || 0) + 40 * Math.sin(t * 1.7), 560 + (o.dy || 0) + 30 * Math.sin(t * 2.3)); ctx.rotate(t * 2.1);
  rrect(ctx, -110, -60, 220, 120, 46);
  const pg = ctx.createLinearGradient(-110, -60, 110, 60); pg.addColorStop(0, '#F4F6FF'); pg.addColorStop(1, '#AAB3DA');
  ctx.fillStyle = pg; ctx.fill(); ctx.restore();
  // wind lines around him
  for (let i = 0; i < 10; i++) {
    const x = W / 2 + (hash(i + 7) - 0.5) * 700 + (o.dx || 0);
    const y = (((hash(i) * 1600 - t * 3400 * sp) % 1600) + 1600) % 1600 + 160 + (o.dy || 0);
    line(ctx, x, y, x, y + 140, 5, 'rgba(255,255,255,0.45)');
  }
}
SC.dream = (lt, t, shot) => {
  const D = shot.end - shot.start;
  const cam = { x: 0, y: 0, zoom: lerp(1.25, 1.4, lt / D), rot: 0 };
  const [sx, sy] = shake(t, 10, 12, 4);
  cam.sx = sx; cam.sy = sy;
  dreamWorld(cam, t, {});
  pill(540, 300, 'FALLING...?', '#C8A8FF', ramp(lt, 0.2, 0.4), 44);
  const enter = 1 - E.outCubic(inv(0, 0.2, lt));
  return { grain: 1, blur: enter > 0.02 ? [0, 160 * enter] : null, flash: 0.35 * enter };
};

// ================================================================= 12. the brain panics and slams the button
function brainFaceX(f, t) {
  // big cartoon eyes (brain-local coords); f: lookX, lookY, squint 0..1, panic 0..1, shout 0..1
  const pan = f.panic || 0, sq = f.squint || 0;
  const blink = (t % 2.7) < 0.09 && pan < 0.3 ? 0.12 : 1;
  for (const sx of [-80, 40]) {
    const ew = 44 + 12 * pan, eh = (54 + 14 * pan) * blink * (1 - 0.45 * sq);
    ellipse(ctx, sx, -40, ew, eh, '#FFFFFF');
    ctx.lineWidth = 6; ctx.strokeStyle = BR.dk; ctx.beginPath(); ctx.ellipse(sx, -40, ew, Math.max(1, eh), 0, 0, 7); ctx.stroke();
    const pr = lerp(20, 9, pan) * Math.min(1, blink * 1.2);
    const px = sx + 14 * (f.lookX || 0), py = -40 + 20 * (f.lookY || 0) * (1 - 0.45 * sq);
    circle(ctx, px, py, pr, '#15132A'); circle(ctx, px - 6, py - 7, pr * 0.35, '#FFFFFF');
    // brows
    const by = -40 - eh - 18 - 18 * pan;
    const tilt = sq * 16 - pan * 10;
    line(ctx, sx - 34, by + (sx < 0 ? tilt : -tilt), sx + 34, by + (sx < 0 ? -tilt : tilt), 11, BR.dk);
  }
  // mouth: flat -> wobbly -> screaming oval
  if (pan > 0.4) {
    const h = 30 + 50 * (f.shout || 0) + 8 * Math.sin(t * 30) * pan;
    ellipse(ctx, -20, 70, 34 + 12 * (f.shout || 0), h / 2 + 10, '#5A1522');
    ellipse(ctx, -20, 70 + h / 4, 20, 10, '#E0616C');
  } else {
    ctx.beginPath(); ctx.moveTo(-70, 64);
    ctx.bezierCurveTo(-40, 64 - 8 * sq, 0, 70 + 6 * pan, 30, 60 - 6 * sq);
    ctx.lineWidth = 9; ctx.strokeStyle = '#5A1522'; ctx.lineCap = 'round'; ctx.stroke();
  }
  // sweat
  if (pan > 0.2) for (const [x, y, d] of [[150, -120, 0], [-190, -90, 0.4], [120, 40, 0.8]]) {
    const k = ((t * 1.3 + d) % 1);
    sweatDrop(ctx, x + 10 * k, y + 60 * k, 1.6, pan * (1 - k));
  }
}
function toneGauge(x, y, R, v, t, a = 1) { // v: 1 = tense, 0 = limp
  if (a <= 0.01) return;
  screenSpace();
  ctx.globalAlpha = a;
  rrect(ctx, x - R - 60, y - R - 70, 2 * R + 120, R + 170, 40); ctx.fillStyle = 'rgba(8,12,34,0.9)'; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(143,184,255,0.5)'; ctx.stroke();
  for (let i = 0; i < 40; i++) {
    const u = i / 39, ang = Math.PI + u * Math.PI;
    const col = mixHex('#FF5A3C', '#5E8BFF', u);
    line(ctx, x + Math.cos(ang) * (R - 34), y + Math.sin(ang) * (R - 34), x + Math.cos(ang) * R, y + Math.sin(ang) * R, 12, col);
  }
  ctx.font = '900 30px Montserrat'; ctx.textBaseline = 'middle';
  ctx.textAlign = 'left'; ctx.fillStyle = '#FF7A5C'; ctx.fillText('TENSE', x - R - 30, y + 44);
  ctx.textAlign = 'right'; ctx.fillStyle = '#7FA4FF'; ctx.fillText('LIMP', x + R + 30, y + 44);
  ctx.textAlign = 'center'; ctx.fillStyle = '#DDE6FF'; ctx.font = '900 36px Montserrat'; ctx.fillText('MUSCLE TONE', x, y - R - 30);
  const ang = Math.PI + (1 - clamp(v)) * Math.PI + 0.03 * vnoise(t * 20, 2);
  line(ctx, x, y, x + Math.cos(ang) * (R - 50), y + Math.sin(ang) * (R - 50), 12, '#FFFFFF');
  circle(ctx, x, y, 22, '#FFFFFF'); circle(ctx, x, y, 10, '#15132A');
  ctx.globalAlpha = 1;
}
// little falling stick figure inside the thought bubble
function tinyFaller(x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(0.4 * Math.sin(t * 6));
  ctx.strokeStyle = '#1A1C2C'; ctx.lineWidth = 9; ctx.lineCap = 'round';
  circle(ctx, 0, -60, 26, '#1A1C2C');
  ctx.beginPath(); ctx.moveTo(0, -34); ctx.lineTo(0, 30);
  ctx.moveTo(0, -20); ctx.lineTo(-50, -70); ctx.moveTo(0, -20); ctx.lineTo(50, -70);
  ctx.moveTo(0, 30); ctx.lineTo(-34, 80); ctx.moveTo(0, 30); ctx.lineTo(38, 74); ctx.stroke();
  for (let i = 0; i < 3; i++) { line(ctx, -80 + i * 80, -130 - (t * 400 + i * 40) % 80, -80 + i * 80, -90 - (t * 400 + i * 40) % 80, 5, 'rgba(26,28,44,0.5)'); }
  ctx.restore();
}
SC.panic = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const slam = c.slams, btnT = slam - 0.4;
  if (t < btnT) {
    const pan = E.outCubic(inv(c.panics - 0.05, c.panics + 0.15, t));
    const shout = E.outBack(inv(c.wait, c.wait + 0.15, t), 2) * (1 - 0.3 * inv(c.fallingq + 0.9, btnT, t));
    const [sx, sy] = shake(t, 3 + 22 * pan + 20 * shout, 26, 5);
    darkBg(mixHex('#141A48', '#4A0A1A', 0.6 * pan), '#04050F');
    const bx = 540 + sx, by = 560 + sy + 20 * Math.sin(t * 2) * (1 - pan);
    const tone = 1 - E.inOutSine(inv(c.idea + 0.4, c.limp + 0.5, t));
    toneGauge(540, 1180, 220, tone, t, ramp(lt, 0.05, 0.35));
    drawBrain(bx, by, 0.9, t, { act: 0.4 + 0.6 * pan, calm: 0.6 * (1 - pan), alarm: 0.7 * pan });
    local(ctx, bx, by, 0.9);
    const look = inv(c.idea - 0.1, c.idea + 0.4, t) * (1 - inv(c.panics - 0.1, c.panics + 0.1, t));
    brainFaceX({ lookX: -0.2 * look, lookY: 0.95 * look, squint: E.inOutSine(inv(c.idea + 0.8, c.limp, t)) * (1 - pan), panic: pan, shout }, t);
    screenSpace();
    // "Wait - are we FALLING?!" thought bubble
    const bk = inv(c.wait - 0.05, c.wait + 0.25, t);
    if (bk > 0) {
      thoughtBubble(720, 330, 400, 290, bk, 620, 440);
      tinyFaller(720, 340, 0.9 * E.outBack(clamp(bk), 2), t);
    }
    alarm(t, 0.9 * inv(c.panics, c.panics + 0.2, t), 540, 140);
    return { grain: 1, flash: 0.25 * Math.exp(-Math.max(0, t - c.panics) * 10) * (t >= c.panics ? 1 : 0),
      push: { k: 1 + 0.08 * E.inOutSine(inv(shot.start, btnT, t)), cx: 540, cy: 700 } };
  }
  // the panic button
  const k = t - btnT;
  const cover = E.inOutCubic(clamp(k / 0.25));
  const press = t >= slam ? Math.exp(-(t - slam) * 6) * 0.9 + 0.1 : 0;
  const hitK = t >= slam ? t - slam : -1;
  const [sx, sy] = hitK >= 0 ? shake(t, 46 * Math.exp(-hitK * 5) + 4, 30, 7) : shake(t, 4, 20, 7);
  darkBg('#3A0A18', '#050208');
  alarm(t, t >= slam ? 1 : 0.4, 540, 170);
  panicButton(540 + sx, 880 + sy, 1.45, press, cover, t, t >= slam ? 1 : 0.3);
  // the fist comes down from above and SLAMS
  const fy = t < slam ? lerp(-600, 620, E.inCubic(inv(slam - 0.3, slam, t))) : 620 + 40 * press - 30 * ramp(t, slam + 0.35, slam + 0.8);
  fist(540 + sx, fy + sy, 1.35, 0);
  if (hitK >= 0 && hitK < 0.5) shockLines(540, 800, 300, hitK / 0.5, 16, '#FFD447', 21);
  return { grain: 1, flash: hitK >= 0 ? 0.6 * Math.exp(-hitK * 12) : 0, tint: '#FF1A30', tintA: hitK >= 0 ? 0.15 : 0, blur: t < slam && t > slam - 0.3 ? [0, 90] : null };
};

// ================================================================= 13. reality check (split screen)
SC.reality = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const jt = c.happening + 0.45;
  // top: the brain's version
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H / 2 - 6); ctx.clip();
  gctx.save(); gctx.beginPath(); gctx.rect(0, 0, W / 2, H / 4 - 3); gctx.clip();
  dreamWorld({ x: 0, y: 0, zoom: 0.8, rot: 0 }, t, { dy: -470, speed: 1 });
  screenSpace(); ctx.fillStyle = `rgba(255,20,50,${0.1 + 0.06 * Math.sin(t * 14)})`; ctx.fillRect(0, 0, W, H / 2);
  ctx.restore(); gctx.restore();
  // bottom: what is actually happening
  ctx.save(); ctx.beginPath(); ctx.rect(0, H / 2 + 6, W, H / 2); ctx.clip();
  gctx.save(); gctx.beginPath(); gctx.rect(0, H / 4 + 3, W / 2, H / 4); gctx.clip();
  const jk = t >= jt ? t - jt : -1;
  const cam = { x: 560, y: 720, zoom: 1.2, rot: 0.02, sx: 0, sy: H / 4 + 40 + (jk >= 0 ? shake(t, 24 * Math.exp(-jk * 6), 26, 3)[1] : 0) };
  const pose = jk >= 0 ? lerpPose(POSES.sleep, POSES.jolt, clamp(E.outBack(clamp(jk / 0.07), 1.4) * (1 - ramp(jk, 0.3, 0.9)), 0, 1.1)) : POSES.sleep;
  const face = jk >= 0 ? lerpFace(FACES.sleepy, FACES.startled, clamp(jk / 0.08)) : FACES.sleepy;
  bedTopScene(cam, t, { pose, face, hop: jk >= 0 ? Math.exp(-jk * 5) * 0.6 : 0, lift: 0.1 * (0.5 + 0.5 * Math.sin(t * 2.4)) + (jk >= 0 ? 0.5 * Math.exp(-jk * 4) : 0), kick: jk >= 0 ? Math.exp(-jk * 3) : 0 });
  if (jk < 0) zzz(620, 400, t, shot.start, 1, 0.9);
  ctx.restore(); gctx.restore();
  // divider + labels
  screenSpace();
  ctx.fillStyle = '#05060F'; ctx.fillRect(0, H / 2 - 6, W, 12);
  pill(540, 170, 'WHAT YOUR BRAIN THINKS', '#FF5A6E', ramp(lt, 0.05, 0.25), 40);
  pill(540, H - 330, "WHAT'S ACTUALLY HAPPENING", '#4DFFB4', ramp(lt, 0.3, 0.5), 40);
  const enter = 1 - E.outCubic(inv(0, 0.15, lt));
  return { grain: 1, capY: H / 2, flash: 0.35 * enter + (jk >= 0 ? 0.2 * Math.exp(-jk * 12) : 0) };
};
