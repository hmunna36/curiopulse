// Can You Make SAD Eyebrows on Purpose? 🥺: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js. Every beat comes from a cue: cu().name (timeline.json).
// The world is se_world.js (the campfire, Gran, the dog, his brow head; the shelter), on camp.js and brows.js.
// States are functions of the video time and valid at negative time: the loop shot plays frame 1's state at t - duration,
// so the last frame runs into frame 0.
'use strict';

const cu = () => TLd.cues;
const seDur = () => TLd.duration;

setLights({
  hook: LIGHTS.lanterns, eyes: LIGHTS.lanterns, answer: LIGHTS.lanterns, locked: LIGHTS.lanterns, ropes: LIGHTS.lanterns,
  up: LIGHTS.lanterns, in: LIGHTS.lanterns, both: LIGHTS.lanterns, key: LIGHTS.lanterns, dogs: LIGHTS.lanterns,
  xray: LIGHTS.lanterns, kennel: LIGHTS.day, adopted: LIGHTS.day, button: LIGHTS.lanterns, wet: LIGHTS.lanterns,
  loop: LIGHTS.lanterns, cover: LIGHTS.lanterns,
});

// ---------------------------------------------------------------- his faces (brows, eyes, mouth)
const SE_F = {
  strain: { b: { lift: 0.35, tilt: 0.45, knit: 0.2, shake: 0.9 }, f: { ...FACES.calm, eyeOpen: 0.72, lookX: 0, lookY: -0.7 }, m: { twist: 0.6, tongue: 0.85 }, flush: 0.65 },
  surp: { b: { lift: 1.1, tilt: -0.1, arch: 0.3 }, f: { ...FACES.startled, eyeOpen: 1.35, mouth: 'none' }, m: { open: 0.55 }, flush: 0 },
  rest: { b: { lift: 0.05, tilt: 0 }, f: { ...FACES.calm, lookX: 0, lookY: -0.2 }, m: { l: 0, r: 0 }, flush: 0 },
  cross: { b: { lift: 0.1, tilt: 0.1 }, f: { ...FACES.calm, lookX: 0, lookY: -1, pupil: 0.9, eyeOpen: 1.1, cross: 0.5 }, m: { l: -0.2, r: -0.2 }, flush: 0 },
  angry: { b: { lift: 0, tilt: -1.0, knit: 1.0 }, f: { ...FACES.annoyed, blink: 0, eyeOpen: 0.82, lookX: 0, lookY: 0 }, m: { l: -0.5, r: -0.5 }, flush: 0.25 },
  jam: { b: { lift: 0.32, tilt: 0.5, knit: 0.45, shake: 1.2 }, f: { ...FACES.calm, eyeOpen: 0.7, lookX: 0, lookY: -0.6 }, m: { twist: -0.5, tongue: 0.6 }, flush: 0.8 },
  sad: { b: { lift: 0.12, tilt: 1.75, knit: 0.55, arch: -0.2 }, f: { ...FACES.calm, eyeOpen: 1.05, pupil: 1.15, lookX: 0, lookY: 0.15 }, m: { l: -0.75, r: -0.75 }, flush: 0 },
};
function seMixFace(a, b, k) {
  const L = (x, y) => (typeof x === 'number' || typeof y === 'number' ? lerp(x || 0, y || 0, k) : (k < 0.5 ? x : y));
  const mix = (A, B) => { const o = {}; for (const key of new Set([...Object.keys(A), ...Object.keys(B)])) o[key] = L(A[key], B[key]); return o; };
  return { b: mix(a.b, b.b), f: mix(a.f, b.f), m: mix(a.m, b.m), flush: lerp(a.flush, b.flush, k) };
}
// keys: [[time, preset name], ...]: each change snaps in over d seconds with a small wind-up and overshoot
function seFaceAt(t, keys, d = 0.16) {
  let cur = SE_F[keys[0][1]];
  for (let i = 1; i < keys.length; i++) {
    const [tk, name] = keys[i];
    if (t < tk - 0.12) break;
    const k = clamp(snapRamp(t, tk, tk + d, { pre: 0.1, ant: 0.06, over: 1.3 }), -0.1, 1.15);
    cur = seMixFace(cur, SE_F[name], k);
  }
  return cur;
}

// ---------------------------------------------------------------- the campfire state at time t (valid at negative t)
function seFaceKeys() {
  const c = cu();
  return [[-99, 'strain'], [c.fail, 'surp'], [c.your - 0.05, 'strain'], [c.lock + 0.05, 'cross'], [c.glass, 'rest'], [c.yank_up, 'surp'],
    [c.yank_in, 'angry'], [c.yank_both, 'jam'], [c.sadface, 'sad'], [cu().retry, 'strain'], [c.sad2, 'sad']];
}
function seState(t) {
  const c = cu(), D = seDur();
  const F = seFaceAt(t, seFaceKeys());
  const wob = t < c.fail || (t > c.your - 0.05 && t < c.lock + 0.02) || (t > c.retry && t < c.sad2) ? 1 : 0;      // trying: the brows wobble
  const bw = (s) => {
    const b = { ...F.b };
    if (wob) { b.tilt = (b.tilt || 0) + 0.55 * Math.sin(t * loopW(6.3) + 1.9 * s) + 0.35 * s; b.lift = (b.lift || 0) + 0.3 * Math.sin(t * loopW(4.1) + 2.4 * s) - 0.15 * s; }
    return b;
  };
  const H = {
    face: F.f, brows: { l: bw(-1), r: bw(1) }, mouth: F.m, flush: F.flush, sweat: wob ? 0.8 : 0,
    bob: 1.6 * Math.sin(t * loopW(2.3)), headRot: 0.012 * Math.sin(t * loopW(1.7)),
  };
  // the arrows of the instruction (the ECU of his brows)
  H.arrows = popK(t, c.arrows, c.fail + 0.35, 0.12, 0.12);
  // the padlock: slams on at LOCKED, rattles on BOTH, a tear fills its keyhole, it springs open and falls
  if (t >= c.lock - 0.02 && t < c.retry - 0.05) {
    H.lock = { k: ramp(t, c.lock - 0.02, c.lock + 0.12), open: ramp(t, c.click, c.click + 0.12), fall: ramp(t, c.click + 0.2, c.click + 0.7, E.inCubic),
      shake: popK(t, c.jam - 0.05, c.jam + 0.45, 0.03, 0.2), fill: ramp(t, c.click - 0.1, c.click) };
  }
  // the glass forehead and the ropes
  if (t >= c.glass && t < c.retry - 0.05) {
    H.ropes = {
      k: ramp(t, c.rope_on, c.rope_on + 0.6),
      up: Math.max(popK(t, c.yank_up, c.yank_in - 0.05, 0.1, 0.12), ramp(t, c.sadface - 0.05, c.sadface + 0.1)),
      in: Math.max(popK(t, c.yank_in, c.yank_both - 0.05, 0.1, 0.12), ramp(t, c.sadface - 0.05, c.sadface + 0.1)),
      jam: popK(t, c.yank_both, c.click - 0.1, 0.08, 0.1),
    };
    H.sweat = Math.max(H.sweat, popK(t, c.jam, c.click, 0.15, 0.2));
  }
  H.sadLines = Math.max(ramp(t, c.sadface, c.sadface + 0.25) * (t < c.retry ? 1 : 0), ramp(t, c.sad2, c.sad2 + 0.25));
  // the little rain cloud and its tear (only real sadness has the key)
  if (t >= c.cloud && t < c.retry - 0.05) {
    H.cloud = { k: ramp(t, c.cloud, c.cloud + 0.35), drip: ramp(t, c.tear - 0.3, c.tear), rain: ramp(t, c.sadface + 0.2, c.sadface + 0.5), x: 0 };
    H.drop = { u: ramp(t, c.tear, c.click, (x) => x * x) };
  }
  // the button: a tear wells in his eye as he pictures the wet puppy
  H.tear = t > c.tear2 && t < D + 1 ? ramp(t, c.tear2, c.sad2 + 0.3) : 0;
  H.plateSausage = 0;
  // the sausage on Gran's stick, and who it goes to
  const S = { hero: H, sausage: 1, stick: 'mid' };
  if (t >= c.swing_dog && t < c.retry - 0.2) {
    S.swing = t < c.chomp + 0.1 ? { from: 'mid', to: 'dog', k: E.inOutCubic(ramp(t, c.swing_dog, c.chomp)) } : { from: 'dog', to: 'rest', k: E.inOutCubic(ramp(t, c.chomp + 0.1, c.chomp + 0.6)) };
    S.sausage = t < c.chomp ? 1 : 0;
  }
  if (t >= c.retry - 0.2 && t < c.swing_him) S.swing = { from: 'rest', to: 'mid', k: E.inOutCubic(ramp(t, c.retry - 0.2, c.retry + 0.1)) };
  if (t >= c.swing_him && t < seDur()) S.swing = { from: 'mid', to: 'him', k: E.inOutCubic(ramp(t, c.swing_him, c.swing_him + 0.3)) };
  // the dog: perfect puppy eyes while it begs; chews smugly once it has the sausage; frowns at the end
  const has = t >= c.chomp && t < c.retry - 0.2;
  S.dog = {
    sad: has ? 0 : (t >= c.frown ? 1 - ramp(t, c.frown, c.frown + 0.12) : 1),
    angry: t >= c.frown ? ramp(t, c.frown, c.frown + 0.14) : 0,
    sausage: has && t < c.xon - 0.4 ? 1 : 0, chew: t * 11, smug: has ? 0.7 : 0,
    look: has ? [-0.6, 0] : (t >= c.swing_him ? [-1, -0.2] : [-0.35, -1]), ears: has ? 0.3 : -0.15, wag: has ? 1 : 0.4,
    blink: ((t + 0.4) % 3.1) < 0.09 && !has ? 1 : 0,
  };
  S.gran = { lookX: t >= c.swing_him ? -1 : (t >= c.swing_dog && t < c.retry ? -0.6 : -0.9), lookY: 0.2, smile: 0.7, aww: ramp(t, c.sad2 + 0.05, c.sad2 + 0.3) };
  return S;
}

// ---------------------------------------------------------------- helpers (screen space)
function seTag(txt, x, y, col, k, size = 56, ink = '#0B0B1A', rot = -0.04) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + size * 0.9, h = size * 1.5;
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = col; ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = '#0B0B1A'; ctx.stroke();
  ctx.fillStyle = ink; ctx.fillText(txt, 0, 3);
  ctx.restore();
}
const seScr = (cam, p) => toScreen(cam, p[0], p[1]);
// dashed arrows up from the inner ends of his brows (screen space)
function seArrows(cam, Hh, k, t) {
  if (k <= 0.01) return;
  screenSpace();
  for (const s of [-1, 1]) {
    const B = { lift: 0.2, tilt: 0.2 }, p = seScr(cam, Hh.at(...EB_BROW_PT(s, B, 0.04)));
    const L = 230 * E.outBack(clamp(k * 1.4), 1.6), bob = 10 * Math.sin(t * 14);
    ctx.save(); ctx.setLineDash([22, 16]); ctx.lineDashOffset = -t * 90;
    line(ctx, p[0], p[1] - 30, p[0], p[1] - 30 - L + bob, 12, rgba('#FFD447', clamp(k * 2)));
    ctx.restore();
    const ty = p[1] - 30 - L + bob;
    ctx.beginPath(); ctx.moveTo(p[0] - 30, ty + 10); ctx.lineTo(p[0], ty - 26); ctx.lineTo(p[0] + 30, ty + 10); ctx.closePath(); ctx.fillStyle = rgba('#FFD447', clamp(k * 2)); ctx.fill();
  }
}

// ---------------------------------------------------------------- one campfire frame
function seCampFrame(cam, t, o = {}) {
  const S = seState(t);
  if (o.mod) o.mod(S);
  const F = seCampScene(cam, t, S, o);
  return { S, ...F };
}
// camera keys [lt, x, y, zoom] eased
const seCK = (lt, keys) => camKeys(lt, keys, E.inOutSine);

// ---------------------------------------------------------------- shots
// frame 1: him and the dog close, Gran's sausage between them; the dog's puppy eyes are perfect, his brows wobble
function seHookCam(tt) { return { x: 496, y: 902, zoom: 3.15 + 0.06 * clamp((tt + 0.5) / 2.3), rot: 0 }; }
SC.hook = (lt, t, shot) => {
  const cam = seHookCam(t);
  seCampFrame(cam, t);
  return { glow: 0.8 };
};
SC.loop = (lt, t, shot) => {
  const tt = t - seDur();                 // frame 1's state, from just before it: the last frame runs into frame 0
  const cam = seHookCam(tt);
  seCampFrame(cam, tt);
  return { glow: 0.8 };
};

// ECU of his brows: the instruction's arrows, then the WHOLE brows shoot up
SC.eyes = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = seCK(lt, [[0, 422, 846, 6.0], [D, 422, 840, 6.6]]);
  const F = seCampFrame(cam, t, { soft: 1, mod: (S) => { if (!S.swing) S.stick = [520, 560]; } });
  seArrows(cam, F.Hh, F.S.hero.arrows, t);
  seTag('INNER ENDS', 540, 560, '#FFD447', popK(t, c.inner - 0.05, c.fail + 0.05, 0.1, 0.1), 54);
  shockLines(540, 640, 300, ramp(t, c.fail, c.fail + 0.4), 12, '#FFFFFF', 3);
  return { glow: 0.8, zblur: 0.05 * bumpAt(t, c.fail, 10) };
};
function bumpAt(t, t0, w) { const x = (t - t0) * w; return x < 0 || x > 1 ? 0 : Math.sin(Math.PI * x); }

// a medium: SURPRISED; Gran swings the sausage to the dog (chomp)
SC.answer = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = seCK(lt, [[0, 662, 1000, 1.42], [D, 656, 994, 1.48]]);
  const F = seCampFrame(cam, t);
  const hd = seScr(cam, F.Hh.at(0, -96));
  seTag('SURPRISED', clamp(hd[0] + 90, 300, 760), hd[1] - 60, '#FF9A3C', popK(t, c.tag_surp, shot.end + 1, 0.1, 0.1), 50);
  const dp = seScr(cam, seDogPt(SE.dogX, SE.crateY, SE.dogS, {}, 0, 40));
  if (t > c.chomp) shockLines(dp[0], dp[1], 90, ramp(t, c.chomp, c.chomp + 0.3), 9, '#FFFFFF', 7);
  return { glow: 0.85 };
};

// CU, low: the padlock slams on between his brows on LOCKED
SC.locked = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = seCK(lt, [[0, 432, 900, 3.25], [D, 428, 892, 3.45]]);
  seCampFrame(cam, t, { soft: 1 });
  const lk = seScr(cam, [SE.hx, SE.hy - 470 - 19]);
  shockLines(lk[0], lk[1], 150, ramp(t, c.lock + 0.08, c.lock + 0.45), 10, '#FFE38A', 5);
  return { glow: 0.85, focus: [lk[0], lk[1] + 60] };
};

// his forehead turns to glass: two ropes on each brow
SC.ropes = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = seCK(lt, [[0, 422, 860, 3.6], [D, 422, 832, 5.0]]);
  seCampFrame(cam, t, { soft: 1 });
  seTag('2 ROPES', 540, 520, '#FFD447', popK(t, c.ropes_w, shot.end + 1, 0.1, 0.1), 54);
  return { glow: 0.85 };
};
// ECU, high: the UP ropes yank
SC.up = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = seCK(lt, [[0, 424, 805, 5.5], [D, 424, 800, 5.8]]);
  const F = seCampFrame(cam, t, { soft: 1 });
  seTag('SURPRISED', 540, 1120, '#FF9A3C', popK(t, c.yank_up + 0.08, shot.end + 1, 0.1, 0.1), 56);
  seTag('UP', 250, 560, '#4DFFB4', popK(t, c.up - 0.05, shot.end + 1, 0.1, 0.1), 60);
  return { glow: 0.85 };
};
// CU from the other side: the IN ropes yank
SC.in = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = seCK(lt, [[0, 392, 846, 4.3], [D, 396, 842, 4.55]]);
  seCampFrame(cam, t, { soft: 1 });
  seTag('ANGRY', 560, 1120, '#FF5A6E', popK(t, c.yank_in + 0.08, shot.end + 1, 0.1, 0.1), 60, '#FFFFFF');
  seTag('IN', 830, 600, '#FF5A6E', popK(t, c.in - 0.05, shot.end + 1, 0.1, 0.1), 60, '#FFFFFF');
  return { glow: 0.85 };
};
// both at once: the padlock holds
SC.both = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = seCK(lt, [[0, 430, 872, 3.1], [D, 430, 866, 3.3]]);
  seCampFrame(cam, t, { soft: 1 });
  seTag('UP + IN', 540, 560, '#FFD447', popK(t, c.both - 0.05, shot.end + 1, 0.1, 0.1), 60);
  const lk = seScr(cam, [SE.hx, SE.hy - 470 - 19]);
  shockLines(lk[0], lk[1], 120, ramp(t, c.jam, c.jam + 0.35), 10, '#FFFFFF', 9);
  return { glow: 0.85 };
};
// only real sadness: a cloud's tear in the keyhole, click, SAD
SC.key = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = seCK(lt, [[0, 420, 806, 3.3], [D, 420, 816, 3.55]]);
  seCampFrame(cam, t, { soft: 1 });
  seTag('SAD', 830, 640, '#8FB8FF', popK(t, c.sadface + 0.1, shot.end + 1, 0.1, 0.1), 66);
  const lk = seScr(cam, [SE.hx, SE.hy - 470 - 19]);
  if (t > c.click) shockLines(lk[0], lk[1], 110, ramp(t, c.click, c.click + 0.35), 10, '#9FE8FF', 4);
  return { glow: 0.85 };
};

// the dog with the sausage, smug; then its head as an x-ray: the extra muscle
function seDogCam(lt, D, z0, z1) { return seCK(lt, [[0, 600, 952, z0], [D, 600, 940, z1]]); }
SC.dogs = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = seDogCam(lt, D, 3.0, 3.2);
  seCampFrame(cam, t, { soft: 1, mod: (S) => { S.dog.look = [0, 0]; S.dog.smug = 0.8; S.dog.sausage = 1; S.dog.sad = 0; } });
  return { glow: 0.85, focus: [540, 900] };
};
SC.xray = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = seDogCam(lt, D, 3.3, 4.4);
  seCampFrame(cam, t, { soft: 1, mod: (S) => {
    S.dog.look = [0, 0.1]; S.dog.sausage = 0; S.dog.smug = 0;
    S.dog.xray = ramp(t, c.xon, c.xon + 0.2);
    S.dog.muscle = Math.max(0.35 * ramp(t, c.xon + 0.1, c.xon + 0.4), snapRamp(t, c.pup, c.pup + 0.16));
    S.dog.sad = clamp(snapRamp(t, c.pup, c.pup + 0.16));
    S.dog.ears = -0.1;
  } });
  const k = popK(t, c.muscle - 0.1, shot.end + 1, 0.1, 0.1);
  const l = seScr(cam, seDogPt(SE.dogX, SE.crateY, SE.dogS, {}, -16, -58)), r = seScr(cam, seDogPt(SE.dogX, SE.crateY, SE.dogS, {}, 16, -58));
  if (k > 0.01) { thinLeader([250, 540], l, k, '#FF86A6'); thinLeader([830, 540], r, k, '#FF86A6'); }
  seTag('EXTRA MUSCLE', 540, 500, '#FF86A6', k, 54);
  if (t > c.pup_hit - 0.1) for (const s of [-1, 1]) { const p = seScr(cam, seDogPt(SE.dogX, SE.crateY, SE.dogS, {}, s * 32, -14)); seSparkle(p[0] + s * 60, p[1] - 70, 34 * popK(t, c.pup_hit - 0.05, c.pup_hit + 0.9, 0.06, 0.3)); }
  return { glow: 0.85, focus: [540, 920] };
};
function seSparkle(x, y, r) {
  if (r <= 0.5) return;
  screenSpace();
  both((c, g) => { c.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r * 0.3 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); c.fillStyle = g ? 'rgba(255,240,180,0.8)' : '#FFF3B0'; c.fill(); });
}

// the shelter: the best puppy eyes get adopted faster
SC.kennel = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = seCK(lt, [[0, 540, 1290, 1.16], [D, 540, 1280, 1.24]]);
  seKennels(cam, t, { pup: { sad: ramp(t, c.kpup, c.kpup + 0.2), look: [0, -0.4], ears: -0.1, wag: 0.5 }, door: 0, gone: 0, jaw: 0 });
  return { glow: 0.8 };
};
SC.adopted = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = seCK(lt, [[0, 548, 1270, 1.5], [D, 548, 1262, 1.58]]);
  seKennels(cam, t, { pup: { sad: 1, look: [0.6, -0.3], ears: 0.4, wag: 1 }, door: snapRamp(t, c.door, c.door + 0.22), gone: ramp(t, c.zoom, c.zoom + 0.45, E.inCubic), jaw: ramp(t, c.drop, c.drop + 0.15) });
  stamp('ADOPTED!', 540, 600, ramp(t, c.stamp, c.stamp + 0.14), '#2FBF71', -0.12, 118);
  return { glow: 0.8 };
};

// back at the fire: he tries again, pictures a wet puppy... and wins the sausage
SC.button = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = seCK(lt, [[0, 470, 900, 3.0], [D, 466, 896, 3.12]]);
  seCampFrame(cam, t);
  return { glow: 0.8 };
};
SC.wet = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = seCK(lt, [[0, 520, 930, 2.3], [D, 516, 922, 2.42]]);
  const F = seCampFrame(cam, t);
  const k = popK(t, c.bubble, shot.end + 1, 0.12, 0.1);
  const hd = seScr(cam, F.Hh.at(30, -80));
  seWetPupBubble(650, 590, k, t, hd);
  if (t > c.sad2) for (const s of [-1, 1]) { const p = seScr(cam, F.Hh.at(s * 26, -40)); seSparkle(p[0] + s * 40, p[1] - 50, 26 * popK(t, c.sad2, c.sad2 + 0.7, 0.06, 0.3)); }
  return { glow: 0.85 };
};
// a thought bubble with a soaked puppy shivering in the rain
function seWetPupBubble(x, y, k, t, tail) {
  if (k <= 0.01) return;
  thoughtBubble(x, y, 440, 360, k, tail[0], tail[1]);
  const s = E.outBack(clamp(k), 1.6);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, 196, 154, 0, 0, Math.PI * 2); ctx.clip();
  const g = ctx.createLinearGradient(0, -160, 0, 160); g.addColorStop(0, '#5E7FB8'); g.addColorStop(1, '#2E4478'); ctx.fillStyle = g; ctx.fillRect(-200, -160, 400, 320);
  ellipse(ctx, 0, 130, 190, 40, '#3A5A8A');
  const sh = 3 * Math.sin(t * 60);
  seDog(ctx, sh, 170, 0.78, t, { sad: 1, wet: 1, ears: -0.6, look: [0, -0.5], pal: SE_PUP });
  for (let i = 0; i < 22; i++) { const u = (((t * 1.6 + i * 0.137) % 1) + 1) % 1, xx = -190 + ((i * 53) % 380); line(ctx, xx, -160 + u * 320, xx - 6, -136 + u * 320, 3, 'rgba(200,230,255,0.75)'); }
  ctx.restore();
  ctx.restore();
}

// ---------------------------------------------------------------- the cover: his sad try next to the dog's perfect one
SC.cover = (lt, t) => {
  const c = cu(), tc = 0.6;
  const cam = { x: 496, y: 930, zoom: 2.9, rot: 0, sx: 0, sy: 0 };
  seCampFrame(cam, tc);
  screenSpace();
  bigWord('SAD EYEBROWS?', 540, 1300, 112, '#FFFFFF', 1, -0.03);
  bigWord('TRY IT', 540, 1440, 150, '#FFD447', 1, -0.03);
  return { glow: 0.85, noCaptions: true };
};

function initScenes2() {
  initSeWorld();
}
