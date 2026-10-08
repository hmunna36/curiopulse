// Why Do Mosquitoes Bite YOU More? Short: the shots on the skin and in the lab (skin, more, study, years, cheese, feet).
// Loaded after scenes.js (helpers: cu, shotOf, comicBurst, inLabel, tickPill). Every beat comes from a cue.
'use strict';

// the night, far out of focus, behind a forearm
function armBg(t, c1 = '#1A2760', c2 = '#050818', warm = 1) {
  darkBg(c1, c2);
  screenSpace();
  softDot(ctx, 930, 1500, 620, '#FF8A3C', 0.2 * warm); softDot(ctx, 140, 560, 380, '#6F8CFF', 0.16);
  for (let i = 0; i < 10; i++) softDot(ctx, (i * 263 + 90) % W, 380 + ((i * 419) % 1100), 60 + (i % 3) * 44, i % 2 ? '#FFB870' : '#7FA8FF', 0.07 * (0.7 + 0.3 * Math.sin(t * 1.1 + i)));
}

// ---------------------------------------------------------------- it lands, it sniffs: beads of oil, a cloud of acids
const SKIN_ARM = { x: 560, y: 1150, rot: -0.1, s: 1.3, tone: 'you', warm: 0.85, cool: 0.7 };
SC.skin = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, s0 = shot.start;
  armBg(t);
  const cam = camKeys(lt, [[0, 540, 960, 1.0], [c.leading - s0 - 0.25, 548, 962, 1.05], [c.leading - s0 + 0.3, 612, 972, 1.42], [D, 630, 976, 1.52]]);
  const jolt = t > c.then + 0.24 ? Math.exp(-(t - c.then - 0.24) * 9) : 0;
  cam.y += 10 * jolt;
  applyCam(cam);
  const A = Object.assign({ t }, SKIN_ARM);
  A.oil = (u, j) => (u > -40 && u < 780 ? ramp(t, c.oily - 0.1 + 0.45 * j, c.oily + 0.25 + 0.45 * j, E.outBack) : 0);
  A.bites = [[-520, -0.2, 1], [-650, 0.42, 0.9], [540, 0.5, 0.8]];
  macroArm(A);
  // the cloud of acids off the oil
  const top = marmPt(A, 380, -0.35), ak = ramp(t, c.acids - 0.15, c.acids + 0.6);
  acidPlume(marmPt(A, 60, -0.3)[0], marmPt(A, 820, -0.3)[0], top[1], 540, t, { n: 24, k: ak, rate: 0.4, s: 1.42, spread: 100 });
  // the mosquito: in from the left, down on the skin, sniffing
  const L = marmPt(A, -150, -0.86), ms = 1.7;
  const u = inv(c.then - 0.15, c.then + 0.24, t), e = E.outCubic(u), landed = u >= 1;
  const mx = lerp(L[0] - 760, L[0], e), my = lerp(L[1] - 480, L[1] - 74 * ms, e) + 30 * Math.sin(u * 8) * (1 - u);
  const sn = ramp(t, c.sniff - 0.05, c.sniff + 0.1) * (1 - ramp(t, c.leading + 0.2, c.leading + 0.5));
  const love = t > c.acids + 0.05;
  mozzie(ctx, mx, my + (landed ? 5 * Math.sin(t * 20) * sn : 0), ms, t, { fly: landed ? 0 : 1, rot: landed ? -0.1 : 0.15, prob: landed ? 0.95 + 0.25 * sn * Math.sin(t * 20) : 0.4, probLen: landed ? 76 : 84,
    sniff: sn + (love ? 0.6 : 0), face: love ? 'love' : sn > 0.3 ? 'happy' : 'calm', look: [0.8, 0.5], lid: sn > 0.3 ? 0.5 : 0, glow: 0.5 });
  if (landed && jolt > 0.05) both((cc, g) => { cc.beginPath(); cc.ellipse(L[0], L[1], 150 * (1 - jolt) + 30, 30 * (1 - jolt) + 8, -0.1, 0, 7); cc.lineWidth = g ? 12 : 5; cc.strokeStyle = rgba('#FFFFFF', (g ? 0.3 : 0.6) * jolt); cc.stroke(); });
  // sniff, sniff: two little arcs off its antennae
  const hd = [mx + 80 * ms, my - 52 * ms];
  for (let i = 0; i < 2; i++) {
    const q = inv(c.sniff + i * 0.24, c.sniff + i * 0.24 + 0.3, t);
    if (q > 0 && q < 1) both((cc, g) => { cc.beginPath(); cc.arc(hd[0] + 20, hd[1], 30 + 60 * q, -0.9, 0.5); cc.lineWidth = g ? 14 : 6; cc.lineCap = 'round'; cc.strokeStyle = rgba('#7FE9FF', (g ? 0.4 : 0.9) * (1 - q)); cc.stroke(); });
  }
  if (love) for (let i = 0; i < 3; i++) { const q = (((t - c.acids) * 0.9 + i / 3) % 1); mozHeart(hd[0] - 10 + 40 * Math.sin(q * 5 + i * 2), hd[1] - 50 - 150 * q, 1.1 + 0.5 * q, 1 - q); }
  // labels
  screenSpace();
  pill(560, 520, 'LEADING SUSPECT', '#7FE9FF', ramp(t, c.leading - 0.05, c.leading + 0.2) * (1 - ramp(t, c.oily - 0.12, c.oily + 0.04)), 46);
  const bead = toScreen(cam, ...marmPt(A, 300, -0.42));
  inLabel('OILY ACIDS', 610, 520, bead[0], bead[1] - 20, '#FFD447', ramp(t, c.oily + 0.04, c.oily + 0.3), 56);
  pill(610, 612, 'carboxylic acids', '#BFF0FF', ramp(t, c.acids + 0.05, c.acids + 0.3), 34);
  return { glow: 0.85, zblur: 0.25 * (1 - ramp(lt, 0, 0.25)), flash: 0.25 * (1 - ramp(lt, 0, 0.18)) };
};

// ---------------------------------------------------------------- two arms: his friend's trickle, his geyser
SC.more = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const SEAM = 960, wayK = ramp(t, c.way - 0.06, c.way + 0.2, E.outBack), sh = shake(t, 9 * (t > c.way ? Math.exp(-(t - c.way) * 4) : 0), 30, 4);
  // ---- top: the friend's arm. A molecule now and then; the only visitor gets bored and leaves
  ctx.save(); screenSpace(); ctx.beginPath(); ctx.rect(0, 0, W, SEAM); ctx.clip();
  armBg(t, '#143050', '#040A18', 0.2);
  const cam1 = { x: 540, y: 960, zoom: 1 + 0.03 * lt / D, rot: 0 };
  applyCam(cam1);
  const F = { x: 540, y: 760, rot: 0.05, s: 0.74, t, tone: 'friend', warm: 0.25, cool: 0.9 };
  F.oil = (u, j) => (j > 0.86 && u > -300 && u < 500 ? 0.75 : 0);
  macroArm(F);
  acidPlume(260, 760, 630, 190, t, { n: 3, k: 1, rate: 0.22, s: 0.95, spread: 30, seed: 5 });
  const bored = ramp(t, c.make - 0.1, c.make + 0.2), gone = ramp(t, c.way - 0.1, c.way + 0.6, E.inCubic);
  mozzie(ctx, 780 + 520 * gone, 520 - 150 * gone + 8 * Math.sin(t * 7), 0.62, t, { fly: 1, flip: gone < 0.08, face: bored > 0.5 ? 'meh' : 'calm', look: [0.7, 0.4], lid: 0.2, prob: 0.3, glow: 0.5 });
  ctx.restore();
  // ---- bottom: his arm. It pours out; they pour in
  ctx.save(); screenSpace(); ctx.beginPath(); ctx.rect(0, SEAM, W, H - SEAM); ctx.clip();
  armBg(t, '#5A2A2A', '#140608', 1.2);
  const cam2 = { x: 540 + sh[0], y: 960 + sh[1], zoom: 1 + 0.03 * lt / D, rot: 0 };
  applyCam(cam2);
  const Y = { x: 540, y: 1560, rot: -0.05, s: 0.74, t, tone: 'you', warm: 1, cool: 0.35 };
  Y.oil = (u, j) => (u > -520 && u < 560 ? 0.7 + 0.5 * wayK * j : 0);
  Y.bites = [[-640, -0.1, 1], [640, 0.1, 1], [700, -0.5, 0.8]];
  macroArm(Y);
  const mk = 0.3 + 0.7 * ramp(t, c.make - 0.1, c.way + 0.25);
  acidPlume(180, 860, 1424, 300 + 90 * wayK, t, { n: 34, k: mk, rate: 0.6 + 0.5 * wayK, s: 1.0 + 0.12 * wayK, spread: 130, seed: 2 });
  mozSwarm(ctx, 560, 1230, t, { n: 18, rx: 300, ry: 120, s: 1.25, seed: 11, k: ramp(t, c.make + 0.1, c.more_end + 0.1), from: [1500, 1080] });
  ctx.restore();
  // ---- the seam, and who is who
  screenSpace();
  const g = ctx.createLinearGradient(0, SEAM - 110, 0, SEAM + 110);
  g.addColorStop(0, 'rgba(4,6,20,0)'); g.addColorStop(0.3, 'rgba(4,6,20,0.92)'); g.addColorStop(0.7, 'rgba(4,6,20,0.92)'); g.addColorStop(1, 'rgba(4,6,20,0)');
  ctx.fillStyle = g; ctx.fillRect(0, SEAM - 110, W, 220);
  pill(330, 512, 'YOUR FRIEND', '#7FE9FF', ramp(lt, 0.05, 0.3), 46);
  pill(210, 1098, 'YOU', '#FF9A3C', ramp(lt, 0.25, 0.5), 60);
  return { glow: 0.85, capY: SEAM, flash: 0.25 * (1 - ramp(lt, 0, 0.18)) + 0.16 * (t > c.way ? Math.exp(-(t - c.way) * 9) : 0) };
};

// ---------------------------------------------------------------- the study: two worn sleeves, and who the mosquitoes pick
const OLF_N = 30, OLF_LOST = [7, 19];
// where mosquito i of the two-tube box is at time t: [x, y, flip, alpha]
function olfMini(i, t) {
  const c = cu(), h1 = hash(i * 7.31 + 2), h2 = hash(i * 3.17 + 5), h3 = hash(i * 5.3 + 1);
  const [cx, cy] = OLF.cage, start = [cx + (h1 - 0.5) * 240, cy + (h2 - 0.5) * 110];
  const idle = [start[0] + 16 * Math.sin(t * (5 + 4 * h1) + i), start[1] + 12 * Math.sin(t * (6 + 3 * h2) + i * 2)];
  const rel = c.volunteer - 0.2 + 1.5 * (i / OLF_N);
  const orbit = (B, k = 1) => [B[0] + (58 + 46 * h1) * k * Math.cos(t * (2.4 + 2 * h2) + i * 1.3), B[1] - 6 + (40 + 36 * h2) * k * Math.sin(t * (3.1 + 2 * h1) + i * 0.7)];
  const along = (P, u) => { const n = P.length - 1, f = clamp(u) * n, k = Math.min(n - 1, Math.floor(f)), q = f - k; return [lerp(P[k][0], P[k + 1][0], q), lerp(P[k][1], P[k + 1][1], q)]; };
  const lost = OLF_LOST.includes(i);
  const first = lost ? OLF.L : OLF.R, entry = [first[0], first[1] + OLF.bh / 2 + 20];
  const u = inv(rel, rel + 0.85, t);
  if (u <= 0) return [idle[0], idle[1], Math.sin(t * 3 + i) > 0, 1];
  let p;
  if (u < 1) p = along([idle, [cx, cy - 76], [OLF.fork[0], OLF.fork[1] + 20], entry, orbit(first)], E.inOutSine(u));
  else p = orbit(first);
  let flip = first[0] < OLF.fork[0];
  if (lost) {                                           // the ones that tried the other sleeve think again
    const back = c.attractive - 0.2 + 0.3 * h3, v = inv(back, back + 0.9, t);
    if (v > 0) { p = v < 1 ? along([orbit(OLF.L), [OLF.L[0], OLF.L[1] + OLF.bh / 2 + 20], [OLF.fork[0], OLF.fork[1] + 10], [OLF.R[0], OLF.R[1] + OLF.bh / 2 + 20], orbit(OLF.R)], E.inOutSine(v)) : orbit(OLF.R); flip = false; }
  }
  return [p[0], p[1], flip, 1];
}
function studyDraw(t, cam, o = {}) {
  const c = cu();
  labBack(cam, t);
  applyCam(cam);
  const lure = ramp(t, c.volunteer, c.hundred + 0.2);
  olfBox(t, { door: ramp(t, c.volunteer - 0.3, c.volunteer - 0.1), glowR: lure, glowL: 0.12 });
  for (let i = 0; i < 4; i++) scentRibbon(OLF.R[0] - 60 + i * 40, OLF.R[1] - 40, 150, t, '#FFD447', lure * 0.8, i, 5, 16);
  scentRibbon(OLF.L[0], OLF.L[1] - 40, 80, t, '#FFD447', 0.25 * lure, 9, 3, 8);
  for (let i = 0; i < OLF_N; i++) { const [x, y, flip, a] = olfMini(i, t); mozMini(ctx, x, y, 0.92, t, i, flip, a); }
  const sh = shotOf('study').start;
  const big = ramp(t, c.hundred - 0.02, c.hundred + 0.12);
  olfTag(OLF.L, 'friend', 19, Object.assign({}, FACES.calm, { blink: 0 }), t, ramp(t, sh + 0.12, sh + 0.4), '#7FE9FF');
  olfTag(OLF.R, 'you', 33, lerpFace(FACES.nervous, FACES.shock, big), t, ramp(t, sh + 0.28, sh + 0.56), '#FF9A3C');
  if (lure > 0.3) for (let i = 0; i < 3; i++) { const q = (((t - c.volunteer) * 0.8 + i / 3) % 1); mozHeart(OLF.R[0] - 70 + i * 70 + 20 * Math.sin(q * 5 + i), OLF.R[1] - 120 - 110 * q, 0.9 + 0.4 * q, (1 - q) * clamp((lure - 0.3) * 3)); }
}
SC.study = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, s0 = shot.start;
  const cam = camKeys(lt, [[0, 540, 950, 1.1], [c.hundred - s0 - 0.3, 540, 946, 1.12], [c.hundred - s0 + 0.12, 600, 905, 1.22], [D, 612, 898, 1.26]]);
  studyDraw(t, cam);
  screenSpace();
  pill(540, 1500, 'ROCKEFELLER UNIVERSITY · 2022', '#7FE9FF', ramp(lt, 0.1, 0.35), 34);
  const hk = ramp(t, c.hundred - 0.03, c.hundred + 0.16, E.outBack) * (1 - ramp(lt, D - 0.2, D));
  const R = toScreen(cam, OLF.R[0], OLF.R[1]), Lp = toScreen(cam, OLF.L[0], OLF.L[1]);
  bigWord('100×', R[0], R[1] + 6, 196, '#FFD447', hk, -0.05);
  bigWord('1×', Lp[0], Lp[1] + 6, 120, '#7FE9FF', ramp(t, c.hundred + 0.12, c.hundred + 0.3, E.outBack) * (1 - ramp(lt, D - 0.2, D)), 0.04);
  return { glow: 0.85, flash: 0.25 * (1 - ramp(lt, 0, 0.18)) + 0.22 * (t > c.hundred ? Math.exp(-(t - c.hundred) * 9) : 0) };
};
SC.years = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 612, 898, 1.26], [0.45, 640, 850, 1.44], [D, 648, 846, 1.5]]);
  studyDraw(t, cam);
  screenSpace();
  const f1 = c.stayed + 0.08, f2 = c.way2 + 0.1;
  const year = 1 + (t >= f1 ? 1 : 0) + (t >= f2 ? 1 : 0), flip = t >= f2 ? inv(f2, f2 + 0.34, t) : t >= f1 ? inv(f1, f1 + 0.34, t) : 0;
  yearCard(236, 800, 1.02, year, flip, ramp(lt, 0.02, 0.26));
  pill(540, 1500, 'ROCKEFELLER UNIVERSITY · 2022', '#7FE9FF', 1 - ramp(t, c.years - 0.15, c.years), 34);
  stamp('STILL A MAGNET', 540, 1340, inv(c.years - 0.02, c.years + 0.18, t), '#FF4D5E', -0.06, 84);
  return { glow: 0.85, flash: 0.14 * (t > c.years ? Math.exp(-(t - c.years) * 9) : 0) };
};

// ---------------------------------------------------------------- his arm = a wedge of smelly cheese
const CH_ARM = { x: -380, y: 1010, rot: 0.02, s: 0.62, tone: 'you', warm: 0.7, cool: 0.5 };
function tableBg(t) {
  screenSpace();
  const bg = ctx.createRadialGradient(540, 760, 60, 540, 900, 1300);
  bg.addColorStop(0, '#4A2A3A'); bg.addColorStop(0.5, '#22142A'); bg.addColorStop(1, '#07050E');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
}
SC.cheese = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, s0 = shot.start;
  tableBg(t);
  const cam = camKeys(lt, [[0, 330, 930, 1.12], [c.make2 - s0 - 0.2, 348, 926, 1.16], [c.cheese1 - s0 + 0.12, 716, 928, 1.08], [D, 734, 922, 1.15]]);
  applyCam(cam);
  // the table
  const tg = ctx.createLinearGradient(0, 1118, 0, 1700); tg.addColorStop(0, '#7A4A2A'); tg.addColorStop(0.08, '#5A3420'); tg.addColorStop(1, '#1A0C0C');
  ctx.fillStyle = tg; ctx.fillRect(-1400, 1118, 3600, 900);
  ctx.fillStyle = 'rgba(255,200,140,0.16)'; ctx.fillRect(-1400, 1118, 3600, 7);
  softDot(ctx, 900, 1010, 520, '#FFC878', 0.2 * ramp(t, c.make2 - 0.3, c.cheese1)); softDot(gctx, 900, 980, 300, '#FFC060', 0.14 * ramp(t, c.make2 - 0.3, c.cheese1));
  const A = Object.assign({ t }, CH_ARM);
  A.oil = (u, j) => (u > 100 && u < 980 ? 0.75 : 0);
  A.bites = [[420, -0.3, 1], [760, 0.35, 0.9]];
  ctx.save(); ctx.translate(A.x, A.y + 150 * A.s); ctx.scale(1, 0.14); softDot(ctx, 300, 0, 900, '#000000', 0.5); ctx.restore();
  macroArm(A); macroHand(A);
  acidPlume(-40, 440, 880, 330, t, { n: 12, k: 1, rate: 0.4, s: 1.05, spread: 70, seed: 1 });
  // the cheese: the same molecules come off it
  const stink = ramp(t, c.stink - 0.1, c.stink + 0.3), hop = t > c.cheese1 ? Math.exp(-(t - c.cheese1) * 6) : 0;
  cheeseWedge(ctx, 900, 1124, 1.15, t, { face: stink > 0.4 ? 'happy' : 'smug', look: [-0.8, 0], squash: hop * Math.sin((t - c.cheese1) * 30) });
  acidPlume(760, 1010, 936, 330, t, { n: 12, k: ramp(t, c.make2 - 0.4, c.cheese1 + 0.1), rate: 0.4, s: 1.05, spread: 70, seed: 7 });
  for (let i = 0; i < 3; i++) scentRibbon(800 + i * 86, 946 - i * 16, 300, t, '#9BE86A', stink, i + 3, 8, 40);
  // one mosquito cannot tell them apart
  const look = Math.sin((t - s0) * 3.2) > 0 ? -1 : 1, lv = t > c.stink;
  mozzie(ctx, lerp(380, 640, ramp(lt, 0.9, D, E.inOutSine)), 610 + 10 * Math.sin(t * 6), 0.7, t, { fly: 1, flip: !lv && look < 0, face: lv ? 'love' : 'calm', look: [0.8, 0.6], bib: true, glow: 0.5, prob: 0.5 });
  screenSpace();
  const eq = toScreen(cam, 606, 1010);
  bigWord('=', eq[0], eq[1] - 30, 280, '#7FE9FF', ramp(t, c.cheese1 + 0.1, c.cheese1 + 0.3, E.outBack), 0);
  return { glow: 0.85, flash: 0.25 * (1 - ramp(lt, 0, 0.18)) };
};

// ---------------------------------------------------------------- the experiment: cheese on one pan, a foot on the other
const FT_N = 10;
function feetTilt(t) {
  const c = cu();
  const a = ramp(t, c.loved + 0.25, c.cheese2 + 0.25, E.inOutSine), b = ramp(t, c.asmuch + 0.35, c.feet + 0.1, E.inOutSine);
  return 0.012 + 0.1 * a - 0.112 * b;
}
SC.feet = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, s0 = shot.start;
  const cam = { x: 540, y: lerp(905, 892, ramp(lt, 0, D)), zoom: lerp(1.0, 1.07, ramp(lt, 0, D, E.inOutSine)), rot: 0 };
  labBack(cam, t, { c1: '#1E3A5A', lamp: '#5A8AC8' });
  applyCam(cam);
  const tilt = springFollow(feetTilt, t, { f: 1.5, z: 0.3, t0: s0 }) + 0.004 * Math.sin(t * 2.2);
  const drop = ramp(lt, 0.0, 0.42, E.outBack);
  const pans = labScale(t, tilt, { py: 650, half: 300, drop: 300 });
  // what is on the pans (each arrives with a bounce)
  const [PL, PR] = pans;
  const k1 = ramp(lt, 0.1, 0.42, E.outBack), k2 = ramp(lt, 0.34, 0.7, E.outBack);
  if (k1 > 0) cheeseWedge(ctx, PL[0], PL[1] - 6 - 520 * (1 - Math.min(1, k1)), 0.9, t, { face: t > c.cheese2 ? 'happy' : 'smug', look: [0.8, -0.4] });
  if (k2 > 0) bareFoot(ctx, PR[0] + 112, PR[1] - 6 - 300 * (1 - Math.min(1, k2)), 1.0, t, { pal: CAMPPAL, legDX: 190, legLen: 760, wig: 0.6 + 0.4 * ramp(t, c.human, c.feet) });
  for (let i = 0; i < 2; i++) scentRibbon(PL[0] - 50 + i * 80, PL[1] - 190, 170, t, '#9BE86A', 0.8 * k1, i + 1, 6, 22);
  for (let i = 0; i < 2; i++) scentRibbon(PR[0] - 96 + i * 50, PR[1] - 60, 170, t, '#9BE86A', 0.8 * k2, i + 5, 6, 22);
  // the cage they come out of
  const up = ramp(t, c.loved + 0.25, c.loved + 0.75, E.inCubic), cgx = 540, cgy = 486 - 700 * (1 - drop) - 560 * up;
  const cage = (front) => {
    const cc = ctx;
    if (!front) { line(cc, cgx, cgy - 76, cgx, -400, 5, '#8A93B4'); rrect(cc, cgx - 118, cgy - 76, 236, 152, 18); cc.fillStyle = '#0B2034'; cc.fill(); cc.fillStyle = 'rgba(150,220,255,0.08)'; cc.fill(); return; }
    cc.save(); rrect(cc, cgx - 118, cgy - 76, 236, 152, 18); cc.clip(); cc.strokeStyle = 'rgba(190,235,255,0.2)'; cc.lineWidth = 2;
    for (let i = -6; i <= 6; i++) { cc.beginPath(); cc.moveTo(cgx + i * 20, cgy - 80); cc.lineTo(cgx + i * 20, cgy + 80); cc.stroke(); }
    for (let j = -4; j <= 4; j++) { cc.beginPath(); cc.moveTo(cgx - 120, cgy + j * 20); cc.lineTo(cgx + 120, cgy + j * 20); cc.stroke(); }
    cc.restore();
    rrect(cc, cgx - 118, cgy - 76, 236, 152, 18); cc.lineWidth = 6; cc.strokeStyle = rgba(LABC.glass, 0.75); cc.stroke();
    const d = ramp(t, c.malaria - 0.12, c.malaria + 0.1);
    cc.save(); cc.translate(cgx - 60, cgy + 76); cc.rotate(1.4 * d); rrect(cc, 0, -6, 120, 12, 6); cc.fillStyle = d > 0.5 ? '#4DFFB4' : '#FF5A6E'; cc.fill(); cc.restore();
  };
  cage(false);
  // the mosquitoes: out of the cage, a cloud that hesitates, then half to the cheese and half to the foot
  let nA = 0, nB = 0;
  for (let i = 0; i < 2 * FT_N; i++) {
    const A = i % 2 === 0, j = Math.floor(i / 2), h1 = hash(i * 7.3 + 1), h2 = hash(i * 3.1 + 2);
    const inCage = [cgx + (h1 - 0.5) * 180 + 10 * Math.sin(t * 7 + i), cgy + (h2 - 0.5) * 100 + 8 * Math.sin(t * 8 + i * 2)];
    const hov = [540 + (h1 - 0.5) * 420 + 30 * Math.sin(t * 3.1 + i), 790 + (h2 - 0.5) * 150 + 24 * Math.sin(t * 4.3 + i * 1.7)];
    const o1 = inv(c.malaria + 0.02 + 0.03 * i, c.malaria + 0.5 + 0.03 * i, t);
    const go = A ? c.loved - 0.15 + 0.06 * j : c.asmuch + 0.05 + 0.07 * j, o2 = inv(go, go + 0.6, t);
    const tgt = A ? [PL[0] - 80 + 170 * h1, PL[1] - 190 - 70 * h2 + 6 * Math.sin(t * 9 + i)] : [PR[0] - 120 + 190 * h1, PR[1] - 150 - 70 * h2 + 6 * Math.sin(t * 9 + i)];
    let p = inCage;
    if (o1 > 0) p = [lerp(inCage[0], hov[0], E.outCubic(o1)), lerp(inCage[1], hov[1], E.outCubic(o1))];
    if (o2 > 0) p = [lerp(hov[0], tgt[0], E.inOutCubic(o2)), lerp(hov[1], tgt[1], E.inOutCubic(o2))];
    if (o2 >= 1) { if (A) nA++; else nB++; }
    mozMini(ctx, p[0], p[1], 1.0, t, i, o2 > 0 ? A : Math.sin(t * 2.6 + i) > 0);
  }
  cage(true);
  for (const [n, P, t0] of [[nA, PL, c.cheese2], [nB, PR, c.feet]]) if (n > 4) for (let i = 0; i < 3; i++) { const q = (((t - t0) * 0.9 + i / 3) % 1 + 1) % 1; mozHeart(P[0] - 70 + i * 60, P[1] - 290 - 90 * q, 0.9 + 0.4 * q, (1 - q) * 0.9); }
  // the score, the verdict
  screenSpace();
  const sL = toScreen(cam, PL[0] - 60, PL[1] - 420), sR = toScreen(cam, PR[0] + 30, PR[1] - 420);
  const punchA = Math.exp(-Math.pow((t - c.cheese2 - 0.1) / 0.12, 2)), punchB = Math.exp(-Math.pow((t - c.feet - 0.1) / 0.12, 2));
  bigWord(String(nA), sL[0], sL[1], 120 * (1 + 0.2 * punchA), '#FFD447', nA > 0 ? 1 : 0, -0.04);
  bigWord(String(nB), sR[0], sR[1], 120 * (1 + 0.2 * punchB), '#FFD447', nB > 0 ? 1 : 0, 0.04);
  pill(540, 1148, 'IG NOBEL PRIZE · 2006', '#C8A8FF', ramp(t, c.exp_end + 0.02, c.exp_end + 0.26) * (1 - ramp(t, c.loved - 0.2, c.loved)), 40);
  stamp('A TIE', 540, 500, inv(c.feet + 0.12, c.feet + 0.3, t), '#4DFFB4', -0.08, 140);
  return { glow: 0.85, flash: 0.25 * (1 - ramp(lt, 0, 0.18)) + 0.14 * (t > c.feet + 0.14 ? Math.exp(-(t - c.feet - 0.14) * 9) : 0) };
};
