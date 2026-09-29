// Brain-freeze Short: the 13 shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js. Every beat comes from a cue in timeline.json.
'use strict';

const cu = () => TLd.cues;
const pop = (t, a, d = 0.35) => ramp(t, a, a + d, E.outBack);
// label pill: text first (kit.js's pill takes x, y, text, col, k, size)
const tag = (txt, x, y, k, col, size = 44) => pill(x, y, txt, col, k, size);

// ---------------------------------------------------------------- shared bits
// frost creeping in from the screen edges (screen space)
function frostVignette(a, seed = 4) {
  if (a <= 0.01) return;
  screenSpace();
  const g = ctx.createRadialGradient(540, 900, 380, 540, 900, 1150);
  g.addColorStop(0, 'rgba(200,240,255,0)'); g.addColorStop(1, `rgba(215,245,255,${0.55 * a})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const rng = mulberry32(seed);
  ctx.lineWidth = 3; ctx.strokeStyle = `rgba(255,255,255,${0.7 * a})`;
  for (let i = 0; i < 26; i++) {
    const side = i % 4, u = rng();
    let x = side === 0 ? u * W : side === 1 ? W : side === 2 ? u * W : 0;
    let y = side === 0 ? 0 : side === 1 ? u * H : side === 2 ? H : u * H;
    let ang = Math.atan2(900 - y, 540 - x);
    ctx.beginPath(); ctx.moveTo(x, y);
    for (let k = 0; k < 5; k++) { ang += (rng() - 0.5) * 0.9; const L = (30 + rng() * 60) * a; x += Math.cos(ang) * L; y += Math.sin(ang) * L; ctx.lineTo(x, y); }
    ctx.stroke();
  }
}
// ice shards bursting out of a point (screen space)
function shards(x, y, t0, t, n = 26, seed = 2) {
  const d = t - t0;
  if (d < 0 || d > 0.9) return;
  const rng = mulberry32(seed);
  screenSpace();
  for (let i = 0; i < n; i++) {
    const a = rng() * 6.28, v = 700 + rng() * 1300, px = x + Math.cos(a) * v * d, py = y + Math.sin(a) * v * d + 900 * d * d;
    const s = (8 + rng() * 18) * (1 - d / 0.9), rot = a + d * 10;
    ctx.save(); ctx.translate(px, py); ctx.rotate(rot);
    ctx.beginPath(); ctx.moveTo(-s, 0); ctx.lineTo(0, -s * 0.5); ctx.lineTo(s * 1.4, 0); ctx.lineTo(0, s * 0.5); ctx.closePath();
    ctx.fillStyle = 'rgba(225,248,255,0.95)'; ctx.fill(); ctx.restore();
    softDot(gctx, px, py, s * 3, '#BFF0FF', 0.7);
  }
}
// map pin (screen space), tip at (x, y)
function mapPin(x, y, s, k, col = '#FF4D5E') {
  if (k <= 0) return;
  const drop = (1 - E.outBack(clamp(k), 2.2)) * -260;
  screenSpace();
  ctx.save(); ctx.translate(x, y + drop); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-18, -40, -46, -60, -46, -96); ctx.arc(0, -96, 46, Math.PI, 0); ctx.bezierCurveTo(46, -60, 18, -40, 0, 0);
  ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#3A0614'; ctx.stroke();
  circle(ctx, 0, -96, 17, '#FFFFFF');
  ctx.restore();
  softDot(gctx, x, y + drop - 96 * s, 90 * s, col, 0.6);
}
// a stopwatch (screen space); spin = hand turns, label under it
function stopwatch(x, y, r, spin, label, col, k) {
  if (k <= 0) return;
  const s = E.outBack(clamp(k), 2);
  screenSpace(); ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -16, -r - 34, 32, 26, 6); ctx.fillStyle = '#C9D3E0'; ctx.fill();
  circle(ctx, 0, 0, r + 12, '#C9D3E0'); circle(ctx, 0, 0, r, '#FBFCFF');
  for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28; line(ctx, Math.sin(a) * r * 0.8, -Math.cos(a) * r * 0.8, Math.sin(a) * r * 0.92, -Math.cos(a) * r * 0.92, 4, '#6A6F85'); }
  const a = spin * 6.28;
  line(ctx, 0, 0, Math.sin(a) * r * 0.78, -Math.cos(a) * r * 0.78, 7, col); circle(ctx, 0, 0, 9, '#1A1C2C');
  ctx.font = '400 58px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = 9; ctx.strokeStyle = '#0B0B1A'; ctx.strokeText(label, 0, r + 60); ctx.fillStyle = col; ctx.fillText(label, 0, r + 60);
  ctx.restore();
}
// pressure gauge (screen space): v 0..1
function gauge(x, y, r, v, k, t) {
  if (k <= 0) return;
  const s = E.outBack(clamp(k), 2);
  screenSpace(); ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  circle(ctx, 0, 0, r + 14, '#2A3148'); circle(ctx, 0, 0, r, '#F4F1E8');
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.arc(0, 0, r * 0.78, Math.PI * (0.75 + i * 0.5), Math.PI * (0.75 + (i + 1) * 0.5));
    ctx.lineWidth = r * 0.16; ctx.strokeStyle = ['#4DD08A', '#FFC23A', '#FF3A4A'][i]; ctx.stroke();
  }
  const a = Math.PI * (0.75 + 1.5 * clamp(v)) + (v > 0.95 ? 0.05 * Math.sin(t * 60) : 0);
  line(ctx, 0, 0, Math.cos(a) * r * 0.8, Math.sin(a) * r * 0.8, 8, '#1A1C2C'); circle(ctx, 0, 0, 12, '#1A1C2C');
  ctx.font = '900 30px Montserrat'; ctx.textAlign = 'center'; ctx.fillStyle = '#1A1C2C'; ctx.fillText('PRESSURE', 0, r * 0.45);
  ctx.restore();
  if (v > 0.9) softDot(gctx, x, y, r * 1.6, '#FF3A4A', 0.6);
}
// steam puffs (screen space)
function steam(x, y, t0, t, n = 6) {
  const d = t - t0;
  if (d < 0 || d > 1.4) return;
  screenSpace();
  for (let i = 0; i < n; i++) {
    const p = clamp(d / 1.4), a = -Math.PI / 2 + (i - (n - 1) / 2) * 0.35;
    const px = x + Math.cos(a) * 240 * p + 20 * Math.sin(t * 6 + i), py = y + Math.sin(a) * 260 * p;
    softDot(ctx, px, py, 40 + 60 * p, '#FFFFFF', 0.5 * (1 - p));
  }
}

// face presets for this Short
const F_SLURP = Object.assign({}, FACES.calm, { mouth: 'o', mouthOpen: 0.05, blink: 0.55, lookY: 0.3, browY: 0.4, browTilt: -0.3 });
const F_DEAD = { eyeOpen: 0.9, pupil: 1, lookX: 0, lookY: 0, browY: -0.35, browTilt: -0.5, mouth: 'flat', mouthOpen: 0, blink: 0.48, cross: 0 };
const F_UP = Object.assign({}, FACES.worried, { lookY: -1, mouth: 'o', mouthOpen: 0.2 });

// ================================================================= 1. hook: mid-slurp in the diner
SC.hook = (lt, t, shot) => {
  const c = cu();
  const push = E.outCubic(clamp(t / 1.4));
  let cam = camKeys(t, [[0, 640, 1080, 1.62], [c.forehead - 0.35, 575, 1010, 1.8], [c.forehead + 0.35, 530, 925, 2.35], [shot.end, 528, 912, 2.5]]);
  cam.zoom *= 1 + 0.04 * push;
  const [sx, sy] = shake(t, 5 * (1 - ramp(t, c.and_then, c.forehead)) + 10 * ramp(t, c.gasp, c.gasp + 0.3), 18, 3);
  cam.sx = sx; cam.sy = sy;
  applyCam(cam);
  dinerBg(t, { flicker: t > c.gasp });
  const lvl = lerp(0.92, 0.3, ramp(t, 0, c.forehead, E.inOutSine));
  let face = F_SLURP;
  if (t > c.and_then) face = lerpFace(F_SLURP, F_UP, ramp(t, c.and_then, c.forehead));
  if (t > c.gasp) face = lerpFace(face, FACES.startled, ramp(t, c.gasp, c.gasp + 0.15));
  const frost = 0.12 * ramp(t, 1.5, c.forehead) + 0.25 * ramp(t, c.forehead - 0.1, c.freezes, E.inCubic);
  const straw = t > c.gasp ? 1 - ramp(t, c.gasp, c.gasp + 0.3) : clamp(0.55 + t * 1.2);
  heroAtCounter(cam, t, { level: lvl, straw, frost, st: { face, headDY: -3 * Math.sin(t * 9) * (1 - ramp(t, c.and_then, c.forehead)), headRot: -0.04 } });
  frostVignette(0.55 * ramp(t, 1.2, c.freezes, E.inCubic), 6);   // the cold creeps in while he slurps
  // slurp lines at the straw (sound made visible)
  const m = toScreen(cam, HERO.x + 30, HERO.y - 700);
  if (t < c.and_then) for (let i = 0; i < 3; i++) {
    const ph = (t * 3 + i / 3) % 1;
    screenSpace(); line(ctx, m[0] + 90 + 40 * ph, m[1] + 40 - 30 * i, m[0] + 120 + 60 * ph, m[1] + 30 - 36 * i, 6, rgba('#FFFFFF', 0.6 * (1 - ph)));
  }
  return { glow: 0.9, zblur: 0.14 * (1 - ramp(t, 0, 0.3)), zcx: 560, zcy: 1000 };
};

// ================================================================= 2. FREEZES: ice explodes over his forehead
SC.freeze = (lt, t, shot) => {
  const c = cu();
  const [sx, sy] = shake(lt, 26 * (1 - ramp(lt, 0, 0.9)), 26, 5);
  const cam = { x: 525, y: 930, zoom: 2.75 - 0.25 * ramp(lt, 0, 1.5), rot: 0.02 * Math.sin(lt * 20) * (1 - ramp(lt, 0, 0.8)), sx, sy };
  applyCam(cam);
  dinerBg(t, { flicker: true });
  heroAtCounter(cam, t, { level: 0.3, straw: 0, frost: 0.3 + 0.7 * ramp(lt, 0, 0.22, E.outBack), glassFrost: ramp(lt, 0, 0.3), st: { face: FACES.shock, headRot: -0.05 * (1 - ramp(lt, 0, 0.6)), frizz: 0.35 * (1 - ramp(lt, 0, 0.5)) } });
  const f = toScreen(cam, HERO.x, HERO.y - 745);
  shards(f[0], f[1], shot.start, t, 34, 9);
  snowflakes(t, 0.7);
  frostVignette(ramp(lt, 0, 0.3));
  return { glow: 0.95, flash: 0.75 * (1 - ramp(lt, 0, 0.3)), tint: '#BFE8FF', tintA: 0.25, zblur: 0.2 * (1 - ramp(lt, 0, 0.35)), zcx: f[0], zcy: f[1] };
};

// ================================================================= 3. the deadpan: "Your forehead. The milkshake went in your MOUTH."
SC.stare = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 575, y: 1040, zoom: 1.75 + 0.1 * lt / D, rot: 0 };
  applyCam(cam);
  dinerBg(t);
  let face = F_DEAD;   // eyes roll up to the forehead, over to the shake, then down at his mouth
  face = lerpFace(face, Object.assign({}, F_DEAD, { lookY: -1, lookX: -0.2, blink: 0.3 }), ramp(t, c.fh1 + 0.1, c.fh1 + 0.35) * (1 - ramp(t, c.milkshake2 - 0.2, c.milkshake2)));
  if (t > c.milkshake2 - 0.2) face = lerpFace(face, Object.assign({}, F_DEAD, { lookX: 1, lookY: 0.3 }), ramp(t, c.milkshake2 - 0.2, c.milkshake2 + 0.1));
  if (t > c.mouth1 + 0.1) face = lerpFace(face, Object.assign({}, F_DEAD, { lookY: 1, lookX: 0.4 }), ramp(t, c.mouth1 + 0.1, c.mouth1 + 0.4));
  const { st, r } = heroAtCounter(cam, t, { level: 0.3, straw: 0, frost: 1, glassFrost: 0.5, st: { face } });
  const fh = toScreen(cam, HERO.x, HERO.y - 750), mo = toScreen(cam, HERO.x, HERO.y - 645);
  // "Your forehead" — a label on the frozen forehead
  const kF = pop(t, c.fh1);
  leader([250, 470], [fh[0] - 60, fh[1] - 10], ramp(t, c.fh1, c.fh1 + 0.3), '#BFF0FF');
  tag('FOREHEAD', 250, 440, kF, '#BFF0FF', 44);
  // the milkshake's actual route: glass -> straw -> mouth
  const g = toScreen(cam, DIN.glassX, DIN.glassTop + 60);
  const route = [[g[0], g[1]], [g[0] - 10, g[1] - 190], [mo[0] + 60, mo[1] - 40], [mo[0] + 16, mo[1]]];
  const rk = ramp(t, c.milkshake2, c.mouth1 + 0.05, E.inOutCubic);
  if (rk > 0) {
    const pts = hsPart(route, 0, rk);
    screenSpace(); ctx.setLineDash([18, 14]); poly(ctx, pts, 8, '#FF86A6'); ctx.setLineDash([]); poly(gctx, pts, 16, 'rgba(255,134,166,0.6)');
    const hd = pts[pts.length - 1]; circle(ctx, hd[0], hd[1], 12, '#FF86A6');
  }
  tag('MOUTH', 820, 640, pop(t, c.mouth1), '#4DFFB4', 50);
  leader([820, 675], [mo[0] + 30, mo[1] + 10], ramp(t, c.mouth1, c.mouth1 + 0.3), '#4DFFB4');
  bigWord('?', fh[0] + 150, fh[1] - 90, 190, '#FF5A6E', pop(t, c.mouth1 + 0.45, 0.3), 0.15);
  return { glow: 0.8 };
};

// ================================================================= 4. name: BRAIN FREEZE -> the endless medical name
function titleBrainFreeze(t, t0, y, sc = 1) {
  const k1 = pop(t, t0, 0.3), k2 = pop(t, t0 + 0.22, 0.3);
  bigWord('BRAIN', 540, y, 250 * sc, '#BFF0FF', k1, -0.05);
  bigWord('FREEZE', 540, y + 230 * sc, 250 * sc, '#7FE9FF', k2, 0.04);
  if (k2 > 0.5) for (let i = 0; i < 9; i++) { // icicles under FREEZE
    const x = 540 - 300 * sc + i * 75 * sc, L = (30 + 40 * hash(i)) * sc * clamp((k2 - 0.5) * 2);
    ctx.beginPath(); ctx.moveTo(x - 12 * sc, y + 330 * sc); ctx.lineTo(x + 12 * sc, y + 330 * sc); ctx.lineTo(x, y + 330 * sc + L); ctx.closePath();
    ctx.fillStyle = 'rgba(215,245,255,0.95)'; ctx.fill();
  }
  softDot(gctx, 540, y + 110 * sc, 420 * sc, '#7FE9FF', 0.35 * k1);
}
function heroHead(cam, t, face, frost, extra = {}) {
  const st = Object.assign({ x: 540, y: 1735, s: 1.45, pose: POSE_COUNTER, face }, extra);
  applyCam(cam);
  charLayer(cam, st, t, { ambient: 0.1, post: (cc, r) => frostHead(cc, st, r, frost, t, 3) });
  return st;
}
SC.name = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#153A56', '#040A14');
  snowflakes(t, 0.5);
  const cam = { x: 540, y: 960, zoom: 1 + 0.05 * lt / D, rot: 0 };
  const dz = ramp(t, c.gang, c.gang + 0.5);
  const face = t < c.doctors ? Object.assign({}, FACES.grin, { mouthOpen: 0.6 }) : lerpFace(FACES.confused, FACES.dazed, dz);
  const st = heroHead(cam, t, face, 1, { headRot: 0.1 * dz * Math.sin(t * 3) });
  screenSpace();
  if (dz > 0.5) sweatDrop(ctx, 690, 1000, 1.6, dz);
  const up = ramp(t, c.doctors - 0.1, c.doctors + 0.35, E.inOutCubic);
  titleBrainFreeze(t, c.brain1 - 0.05, lerp(470, 250, up), lerp(1, 0.55, up));
  // the medical name on a hospital chart banner
  const bk = ramp(t, c.doctors, c.doctors + 0.4, E.outCubic);
  if (bk > 0) {
    const bx = 540, by = 700, bw = 1000 * bk, bh = 330;
    ctx.save(); ctx.translate(bx, by); ctx.rotate(-0.03);
    rrect(ctx, -bw / 2, -bh / 2, bw, bh, 20); ctx.fillStyle = '#F7F4EC'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = '#C8A8FF'; ctx.stroke();
    ctx.font = '900 34px Montserrat'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#6A6F85';
    if (bk > 0.9) ctx.fillText('OFFICIAL MEDICAL NAME:', -bw / 2 + 40, -bh / 2 + 46);
    const typ = (word, t0, t1, y) => {
      const n = Math.floor(word.length * clamp(inv(t0, t1, t)));
      if (n <= 0) return;
      ctx.font = '400 118px Anton'; ctx.textAlign = 'center'; ctx.fillStyle = '#4A2C8A';
      const txt = word.slice(0, n), w = ctx.measureText(word).width, sc = Math.min(1, (bw - 60) / w);
      ctx.save(); ctx.translate(0, y); ctx.scale(sc, sc); ctx.fillText(txt + (n < word.length ? '' : ''), 0, 0); ctx.restore();
    };
    typ('SPHENOPALATINE', c.sphen, c.sphen + 1.1, -10);
    typ('GANGLIONEURALGIA', c.gang, c.gang + 1.2, 110);
    ctx.restore();
    softDot(gctx, bx, by, 520, '#C8A8FF', 0.25 * bk);
  }
  return { glow: 0.9, push: { k: 1 + 0.03 * lt / D, cx: 540, cy: 800 } };
};

// ================================================================= 5. fine: the long name gets crumpled; BRAIN FREEZE stamped back
SC.fine = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#153A56', '#040A14');
  snowflakes(t, 0.5);
  const cam = { x: 540, y: 960, zoom: 1.05, rot: 0 };
  const face = t < c.brain2 ? Object.assign({}, FACES.annoyed, { lookX: 0, lookY: -0.6 }) : Object.assign({}, FACES.grin, { mouthOpen: 0.5 });
  heroHead(cam, t, face, 1, { headDY: -6 * Math.sin(ramp(t, c.brain2, c.brain2 + 0.4) * Math.PI) });
  screenSpace();
  titleBrainFreeze(t, -1, 250, 0.55);
  // the banner crumples into a ball and bonks off screen
  const cr = ramp(t, c.sigh + 0.15, c.sigh + 0.55, E.inOutCubic), fly = ramp(t, c.sigh + 0.55, c.lets + 0.9, E.inCubic);
  if (fly < 1) {
    ctx.save(); ctx.translate(540 + 700 * fly, 700 - 500 * fly + 900 * fly * fly); ctx.rotate(-0.03 + 4 * fly);
    const bw = lerp(1000, 180, cr), bh = lerp(330, 170, cr);
    rrect(ctx, -bw / 2, -bh / 2, bw, bh, lerp(20, 80, cr)); ctx.fillStyle = '#F7F4EC'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = '#C8A8FF'; ctx.stroke();
    if (cr > 0.3) { const rng = mulberry32(3); for (let i = 0; i < 8; i++) line(ctx, (rng() - 0.5) * bw * 0.8, (rng() - 0.5) * bh * 0.8, (rng() - 0.5) * bw * 0.8, (rng() - 0.5) * bh * 0.8, 3, '#B8B2A6'); }
    if (cr < 0.5) { ctx.font = '400 90px Anton'; ctx.textAlign = 'center'; ctx.fillStyle = rgba('#4A2C8A', 1 - cr * 2); ctx.fillText('SPHENO…', 0, 30); }
    ctx.restore();
  }
  stamp('BRAIN FREEZE', 540, 730, ramp(t, c.brain2 - 0.05, c.brain2 + 0.2), '#7FE9FF', -0.08, 110);
  return { glow: 0.9, push: { k: 1 + 0.03 * lt / D, cx: 540, cy: 800 }, flash: 0.25 * (1 - ramp(t, c.brain2 + 0.05, c.brain2 + 0.3)) * (t > c.brain2 + 0.05 ? 1 : 0) };
};

// ================================================================= 6. how: inside the head — palate, vessels panic, squeeze, fling open
function vesselState(t, c) {
  let v = 1;
  v = lerp(v, 0.3, ramp(t, c.squeeze, c.tight + 0.2, E.inOutCubic));
  v = lerp(v, 2.2, ramp(t, c.fling, c.fling + 0.35, E.outBack));
  return v;
}
SC.how = (lt, t, shot) => {
  const c = cu(), s0 = shot.start;
  darkBg('#2A0E24', '#07030A');
  const cam = sectionCam(t, [[s0, 40, -40, 1.22, 920], [c.cold - 0.1, 40, -40, 1.3, 920], [c.roof + 0.1, 190, 110, 2.6, 860],
    [c.blood1 - 0.1, 190, 110, 2.6, 860], [c.vessels + 0.3, 195, 70, 3.1, 820]]);
  const panic = ramp(t, c.panic - 0.1, c.panic + 0.2) * (1 - ramp(t, c.fling + 0.4, c.fling + 1));
  headSection(cam, t, { shake: ramp(t, c.cold - 0.25, c.roof + 0.2), cold: ramp(t, c.roof, c.mouth2 + 0.5), vessel: vesselState(t, c), panic, flow: ramp(t, c.fling, c.fling + 0.3) });
  const P = (x, y) => hsScreen(cam, x, y);
  const pal = P(170, 104), ves = P(190, 52);
  tag('ROOF OF MOUTH', 540, 1520, pop(t, c.roof) * (1 - ramp(t, c.blood1 - 0.2, c.blood1)), '#FFD447', 46);
  leader([540, 1480], [pal[0], pal[1] + 10], ramp(t, c.roof, c.roof + 0.3) * (1 - ramp(t, c.blood1 - 0.2, c.blood1)), '#FFD447');
  tag('BLOOD VESSELS', 540, 360, pop(t, c.vessels), '#FF5A6E', 46);
  if (panic > 0.2) {
    for (let i = 0; i < 3; i++) bigWord('!', ves[0] - 220 + i * 220, ves[1] - 240 + 20 * Math.sin(t * 20 + i), 150, '#FF5A6E', panic, 0.2 * Math.sin(t * 17 + i));
    screenSpace(); sweatDrop(ctx, ves[0] + 300, ves[1] - 120, 2, panic);
  }
  bigWord('SQUEEZE!', 540, 560, 150, '#FF5A6E', pop(t, c.squeeze) * (1 - ramp(t, c.fling - 0.1, c.fling)), -0.05);
  bigWord('WIDE OPEN!', 540, 560, 150, '#FF9A3C', pop(t, c.fling), 0.04);
  const [sx, sy] = shake(t, 12 * ramp(t, c.fling, c.fling + 0.1) * (1 - ramp(t, c.fling + 0.1, c.fling + 0.6)), 24, 8);
  return { glow: 1, push: { k: 1 + 0.02 * (lt / (shot.end - s0)), cx: 540 + sx, cy: 900 + sy }, zblur: 0.1 * (1 - ramp(lt, 0, 0.3)) + 0.12 * ramp(t, c.fling, c.fling + 0.05) * (1 - ramp(t, c.fling + 0.05, c.fling + 0.35)), zcx: ves[0], zcy: ves[1] };
};

// ================================================================= 7. rush: the artery at the front of the brain + flow/pain traces
function bump(u) { return u <= 0 ? 0 : u >= 1 ? 0 : Math.pow(Math.sin(Math.PI * Math.pow(u, 0.8)), 0.7); }
function tracePanel(t, c, k) {
  if (k <= 0) return;
  screenSpace();
  const x0 = 90, y0 = 150, w = 900, h = 420, s = E.outBack(clamp(k), 1.6);
  ctx.save(); ctx.translate(540, y0 + h / 2); ctx.scale(s, s); ctx.translate(-540, -(y0 + h / 2));
  rrect(ctx, x0, y0, w, h, 26); ctx.fillStyle = 'rgba(6,10,24,0.9)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#2E4A6A'; ctx.stroke();
  for (let i = 1; i < 6; i++) line(ctx, x0 + i * w / 6, y0 + 20, x0 + i * w / 6, y0 + h - 20, 2, 'rgba(90,140,200,0.15)');
  const gx0 = x0 + 40, gw = w - 80, base = y0 + h - 50, amp = 250;
  const shape = (u) => bump(inv(0.12, 0.88, u));
  const draw = (p, col, off, lw) => {
    if (p <= 0) return;
    const pts = [];
    for (let u = 0; u <= p; u += 0.01) pts.push([gx0 + u * gw, base - off - amp * shape(u)]);
    poly(ctx, pts, lw, col); poly(gctx, pts.map(([a, b]) => [a, b]), lw * 2.5, rgba(col, 0.6));
    const e = pts[pts.length - 1]; circle(ctx, e[0], e[1], lw * 1.3, '#FFFFFF');
  };
  const p1 = ramp(t, c.blood2 - 0.2, c.rush_end + 0.3, (x) => x), p2 = ramp(t, c.pain1, c.rush_end + 0.3, (x) => x) ;
  draw(p1, '#FF5A6E', 0, 8);
  draw(p2 * 1, '#FF9A3C', -6, 6);
  ctx.font = '900 34px Montserrat'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#FF5A6E'; ctx.fillText('BLOOD RUSH', x0 + 40, y0 + 44);
  if (p2 > 0) { ctx.fillStyle = '#FF9A3C'; ctx.fillText('OUCH', x0 + 330, y0 + 44); }
  ctx.restore();
  // "just as long as the rush": the matching bracket
  const bk = ramp(t, c.long, c.long + 0.4);
  if (bk > 0) {
    const a = gx0 + 0.12 * gw, b = gx0 + 0.88 * gw, y = y0 + h + 30;
    line(ctx, a, y, lerp(a, b, bk), y, 7, '#4DFFB4'); line(ctx, a, y - 20, a, y + 20, 7, '#4DFFB4');
    if (bk >= 1) line(ctx, b, y - 20, b, y + 20, 7, '#4DFFB4');
    tag('SAME TIMING', 540, y + 70, pop(t, c.rush), '#4DFFB4', 40);
  }
}
SC.rush = (lt, t, shot) => {
  const c = cu(), s0 = shot.start;
  darkBg('#2A0E24', '#07030A');
  const cam = sectionCam(t, [[s0, 195, 70, 3.1, 820], [c.blood2, 150, -40, 2.2, 1080], [c.front, 170, -150, 2.2, 1120], [c.lasted, 150, -110, 1.9, 1140]]);
  const rush = ramp(t, c.rushing - 0.1, c.rushing + 0.4) * (1 - ramp(t, c.rush_end, c.rush_end + 0.6));
  headSection(cam, t, { cold: 1, vessel: 2.0 - 0.8 * ramp(t, s0, c.rush_end), flow: 1, rush, pressure: 0 });
  const fr = hsScreen(cam, 205, -160);
  tag('FRONT OF THE BRAIN', 540, 1560, pop(t, c.front) * (1 - ramp(t, c.pain1 - 0.2, c.pain1)), '#FFD447', 40);
  leader([540, 1520], fr, ramp(t, c.front, c.front + 0.3) * (1 - ramp(t, c.pain1 - 0.2, c.pain1)), '#FFD447');
  tracePanel(t, c, ramp(t, c.study - 0.05, c.study + 0.3));
  tag('ONE STUDY · 2012', 540, 110, pop(t, c.study), '#4DFFB4', 34);
  return { glow: 1, zblur: 0.08 * (1 - ramp(lt, 0, 0.3)) };
};

// ================================================================= 8. why: warm blood to protect the brain... overdoes it
function shield(x, y, s, k) {
  if (k <= 0) return;
  const sc = E.outBack(clamp(k), 2) * s;
  screenSpace(); ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.beginPath(); ctx.moveTo(0, -80); ctx.quadraticCurveTo(50, -60, 70, -64); ctx.quadraticCurveTo(70, 30, 0, 86); ctx.quadraticCurveTo(-70, 30, -70, -64); ctx.quadraticCurveTo(-50, -60, 0, -80);
  ctx.fillStyle = '#4DD08A'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = '#0B3A24'; ctx.stroke();
  line(ctx, -26, 2, -6, 26, 12, '#FFFFFF'); line(ctx, -6, 26, 32, -22, 12, '#FFFFFF');
  ctx.restore(); softDot(gctx, x, y, 140 * s, '#4DFFB4', 0.5 * clamp(k));
}
SC.why = (lt, t, shot) => {
  const c = cu(), s0 = shot.start, D = shot.end - s0;
  darkBg('#2A0E24', '#07030A');
  const over = ramp(t, c.overdoes, c.overdoes + 0.2);
  const cam = sectionCam(t, [[s0, 120, -120, 1.9, 1100], [c.flooding, 30, -100, 1.35, 980], [c.itjust, 30, -110, 1.3, 1000]]);
  const [sx, sy] = shake(t, 18 * over * (1 - ramp(t, c.overdoes + 0.3, shot.end)), 26, 4);
  cam.x += sx; cam.y += sy;
  const warm = ramp(t, c.flooding, c.warm + 0.6);
  headSection(cam, t, { cold: 1 - 0.3 * warm, vessel: 1.8, flow: 1, rush: 0.5 + 0.5 * warm, warm, pressure: over });
  stamp('ONE IDEA', 540, 190, ramp(t, c.scientists - 0.05, c.scientists + 0.2), '#7FE9FF', -0.1, 80);
  tag('WARM BLOOD', 300, 1560, pop(t, c.warm), '#FF9A3C', 42);
  const br = hsScreen(cam, 160, -250);
  shield(br[0] + 120, br[1] - 90, 1.1, pop(t, c.protect) * (1 - ramp(t, c.overdoes, c.overdoes + 0.2)));
  gauge(830, 400, 120, lerp(0.2, 0.62, ramp(t, c.itjust, c.overdoes - 0.05)) + 0.4 * over, pop(t, c.itjust - 0.1), t);
  bigWord('TOO MUCH!', 470, 600, 150, '#FF5A6E', pop(t, c.overdoes + 0.05, 0.25), -0.08);
  const top = hsScreen(cam, 40, -360);
  steam(top[0], top[1], c.overdoes + 0.05, t, 7);
  return { glow: 1, push: { k: 1 + 0.03 * lt / D, cx: 540, cy: 900 } };
};

// ================================================================= 9. twist: the nerve carries the call, the brain blames the forehead
SC.twist = (lt, t, shot) => {
  const c = cu(), s0 = shot.start;
  if (t >= c.fh2 - 0.07) { // hard cut: his frozen forehead, with the pin in it, deadpan
    const lt2 = t - (c.fh2 - 0.07);
    const cam = { x: 525, y: 960, zoom: 2.1 + 0.08 * lt2, rot: 0 };
    applyCam(cam); dinerBg(t);
    heroAtCounter(cam, t, { level: 0.3, straw: 0, frost: 1, glassFrost: 0.5, st: { face: F_DEAD } });
    const fh = toScreen(cam, HERO.x + 10, HERO.y - 760);
    mapPin(fh[0], fh[1], 1.1, 1);
    return { glow: 0.8 };
  }
  darkBg('#1E0A20', '#050208');
  const cam = sectionCam(t, [[s0, 60, -40, 1.22, 920], [c.nerve, 40, 0, 1.4, 900], [c.brain4, 60, -100, 1.3, 960]]);
  const nerveShow = ramp(t, c.pain2 - 0.1, c.pain2 + 0.3);
  const nerve = inv(c.travels, c.face + 0.5, t);
  const fore = ramp(t, c.blames, c.wrong + 0.1, E.inOutCubic);
  headSection(cam, t, { cold: 1, vessel: 1.6, flow: 1, rush: 0.4, nerveShow, nerve: nerve < 1 ? nerve : 0, nerveFore: fore, brainLit: ramp(t, c.brain4 - 0.1, c.brain4 + 0.2) });
  const g = hsScreen(cam, -58, 2);
  tag('TRIGEMINAL NERVE', 540, 1560, pop(t, c.nerve), '#FF9A3C', 40);
  leader([540, 1520], g, ramp(t, c.nerve, c.nerve + 0.3), '#FF9A3C');
  // the call: a phone-style ring at the brain
  const b = hsScreen(cam, -40, -170);
  if (t > c.brain4 - 0.1 && t < c.blames + 0.6) { screenSpace(); ctx.lineWidth = 6; for (let i = 0; i < 3; i++) { const p = ((t * 2 + i / 3) % 1); ctx.beginPath(); ctx.arc(b[0], b[1], 60 + 140 * p, 0, 7); ctx.strokeStyle = rgba('#FFD447', 0.8 * (1 - p)); ctx.stroke(); } }
  const fh = hsScreen(cam, 262, -205);
  mapPin(fh[0], fh[1], 1.1, ramp(t, c.wrong - 0.1, c.wrong + 0.3));
  tag('WRONG SPOT', 540, 380, pop(t, c.spot), '#FF5A6E', 52);
  return { glow: 1, tint: '#8FA8FF', tintA: 0.12, push: { k: 1 + 0.02 * lt / (c.fh2 - s0), cx: 540, cy: 900 } };
};

// ================================================================= 10. kid: the science-fair poster, then the race 5 s vs 30 s
function posterBoard(t, c, k) {
  screenSpace();
  const s = E.outBack(clamp(k), 1.5);
  ctx.save(); ctx.translate(540, 760); ctx.scale(s, s); ctx.rotate(-0.02);
  // tri-fold board
  for (const [x, w, sk] of [[-470, 250, 0.08], [-220, 440, 0], [220, 250, -0.08]]) {
    ctx.save(); ctx.transform(1, sk, 0, 1, 0, 0);
    rrect(ctx, x, -420, w, 820, 12); ctx.fillStyle = '#F4F0FF'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#8FB8FF'; ctx.stroke();
    ctx.restore();
  }
  ctx.font = '400 74px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#E8335A'; ctx.fillText('DOES GULPING', 0, -330); ctx.fillText('MAKE IT WORSE?', 0, -245);
  // a hand-drawn chart and ice cream on the side panels
  ctx.save(); ctx.transform(1, 0.08, 0, 1, 0, 0);
  ctx.beginPath(); ctx.moveTo(-400, -120); ctx.lineTo(-300, 40); ctx.lineTo(-500, 40); ctx.closePath(); ctx.fillStyle = '#E8B06A'; ctx.fill();
  circle(ctx, -400, -150, 70, '#FF9CC4'); circle(ctx, -430, -175, 22, '#FFFFFF');
  ctx.restore();
  ctx.save(); ctx.transform(1, -0.08, 0, 1, 0, 0);
  for (let i = 0; i < 3; i++) { rrect(ctx, 260 + i * 60, 60 - (i + 1) * 70, 40, (i + 1) * 70, 6); ctx.fillStyle = ['#7FE9FF', '#FFD447', '#FF5A6E'][i]; ctx.fill(); }
  ctx.restore();
  for (let i = 0; i < 5; i++) { rrect(ctx, -170, -120 + i * 60, 340 - (i % 2) * 90, 16, 8); ctx.fillStyle = '#C9C4DA'; ctx.fill(); }
  ctx.restore();
  // the rosette: AGE 13
  const rk = pop(t, c.kid - 0.05);
  if (rk > 0) {
    ctx.save(); ctx.translate(820, 1030); ctx.scale(rk, rk); ctx.rotate(0.15);
    for (const dx of [-30, 30]) { ctx.beginPath(); ctx.moveTo(dx - 26, 40); ctx.lineTo(dx + 26, 40); ctx.lineTo(dx + 20 * Math.sign(dx), 190); ctx.lineTo(dx, 160); ctx.closePath(); ctx.fillStyle = '#2F6BFF'; ctx.fill(); }
    for (let i = 0; i < 16; i++) { const a = i / 16 * 6.28; circle(ctx, Math.cos(a) * 92, Math.sin(a) * 92, 30, '#FFC23A'); }
    circle(ctx, 0, 0, 100, '#FFD447'); circle(ctx, 0, 0, 80, '#FFF3C4');
    ctx.font = '400 50px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#8A5A00';
    ctx.fillText('AGE', 0, -26); ctx.font = '400 80px Anton'; ctx.fillText('13', 0, 30);
    ctx.restore(); softDot(gctx, 820, 1030, 200, '#FFD447', 0.5 * clamp(rk));
  }
  if (t > c.tested - 0.05) stamp('TESTED!', 300, 1060, ramp(t, c.tested - 0.05, c.tested + 0.2), '#4DD08A', -0.14, 100);
}
// the two of him at a table (the gulper on the left, the slow one on the right)
const POSE_GULP = { hipY: -222, lean: 0, armL: { a: 1.35, b: 1.5 }, armR: { a: 1.35, b: 1.5 }, legL: { a: 0.07, b: 0 }, legR: { a: 0.07, b: 0 }, hand: 'open', feetFront: 0 };
const POSE_SPOON = { hipY: -222, lean: 0, armL: { a: 0.35, b: 0.9 }, armR: { a: 0.55, b: 2.0 }, legL: { a: 0.07, b: 0 }, legR: { a: 0.07, b: 0 }, hand: 'open', feetFront: 0 };
function bowl(x, y, s, fill, tilt = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); ctx.scale(s, s);
  if (fill > 0.02) { circle(ctx, -24, -14, 34 * Math.sqrt(fill), '#FFF1D6'); circle(ctx, 22, -18, 32 * Math.sqrt(fill), '#FF9CC4'); circle(ctx, 0, -40 * Math.sqrt(fill), 30 * Math.sqrt(fill), '#8A5030'); }
  ctx.beginPath(); ctx.moveTo(-86, -10); ctx.quadraticCurveTo(-80, 70, 0, 74); ctx.quadraticCurveTo(80, 70, 86, -10); ctx.closePath();
  const g = ctx.createLinearGradient(-86, 0, 86, 0); g.addColorStop(0, '#E8F2FF'); g.addColorStop(1, '#8FA8C8'); ctx.fillStyle = g; ctx.fill();
  ellipse(ctx, 0, -10, 86, 16, '#C8D8EC');
  ctx.restore();
}
function raceScene(t, c, o) {
  // a school gym at night: floor lines + banners
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#16213E'); g.addColorStop(1, '#0A0F20');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 8; i++) softDot(ctx, 70 + i * 135, 180, 90, i % 2 ? '#FFD447' : '#7FE9FF', 0.12);
  line(ctx, 540, 0, 540, 1250, 6, 'rgba(255,255,255,0.15)');
  const cam = CAM0;
  const gulpT = o.gulpT, fillL = 1 - ramp(t, gulpT, gulpT + 5 / 6, (x) => x);  // a sped-up 5 s
  const fillR = 1 - 0.25 * ramp(t, gulpT, gulpT + 6, (x) => x);
  const stL = { x: 280, y: 1500, s: 1.25, pose: POSE_GULP, face: o.faceL, headRot: -0.12 * (fillL < 1 && fillL > 0 ? 1 : 0) };
  const stR = { x: 800, y: 1500, s: 1.25, pose: POSE_SPOON, face: o.faceR };
  applyCam(cam);
  let rL = null, rR = null;
  charLayer(cam, stL, t, { ambient: 0.08, post: (cc, r) => { rL = r; frostHead(cc, stL, r, o.frostL || 0, t, 6); } });
  applyCam(cam);
  charLayer(cam, stR, t, { ambient: 0.08, post: (cc, r) => { rR = r; } });
  screenSpace();
  // the gulper's bowl up at his mouth; the slow one's bowl on the table + a spoon
  const mL = toWorld(stL, [rL.head[0], rL.head[1] + 50]);
  bowl(mL[0] + 26, mL[1] + 50, 1.15, fillL, -0.7 * (fillL > 0.02 ? 1 : 0.3));
  // table
  rrect(ctx, -20, 1250, W + 40, 40, 10); ctx.fillStyle = '#C08A52'; ctx.fill();
  ctx.fillStyle = '#7A5230'; ctx.fillRect(-20, 1290, W + 40, 700);
  bowl(850, 1228, 1.25, fillR);
  const wr = toWorld(stR, rR.wrR);
  line(ctx, wr[0], wr[1], wr[0] - 30, wr[1] + 70, 10, '#D8E2EE'); ellipse(ctx, wr[0] - 34, wr[1] + 80, 18, 12, '#D8E2EE');
  stopwatch(280, 440, 105, t > gulpT ? (t - gulpT) * 1.2 : 0, '5 SEC', '#FF86A6', o.swL);
  stopwatch(800, 440, 105, t > gulpT ? (t - gulpT) * 0.2 : 0, '30 SEC', '#7FE9FF', o.swR);
  return { stL, stR, rL, rR };
}
SC.kid = (lt, t, shot) => {
  const c = cu(), s0 = shot.start;
  if (t < c.icecream - 0.07) {
    darkBg('#1C2448', '#070A18');
    motes(t, 0.6);
    posterBoard(t, c, ramp(lt, 0, 0.4));
    return { glow: 0.9, push: { k: 1 + 0.1 * E.inOutSine(inv(s0, c.icecream, t)), cx: 540 + 60 * Math.sin(lt * 0.8), cy: 820 }, zblur: 0.1 * (1 - ramp(lt, 0, 0.3)) };
  }
  screenSpace();
  raceScene(t, c, { gulpT: c.five, faceL: t < c.five ? FACES.calm : Object.assign({}, FACES.grin, { mouth: 'o', mouthOpen: 0.8, blink: 0.6 }), faceR: Object.assign({}, FACES.calm, { blink: 0.5, mouth: 'grin', mouthOpen: 0.3 }), swL: pop(t, c.five - 0.1), swR: pop(t, c.thirty - 0.1) });
  bigWord('VS', 540, 440, 110, '#FFD447', pop(t, c.or30), 0);
  return { glow: 0.9, flash: 0.3 * (1 - ramp(t, c.icecream - 0.07, c.icecream + 0.15)) };
};

// ================================================================= 11. result: twice the headaches, published
function bars(t, c) {
  const k = ramp(t, c.twice - 0.1, c.twice + 0.5, E.outCubic);
  if (k <= 0) return;
  screenSpace();
  const base = 700, u = 11;
  for (const [x, v, col, lab] of [[280, 27, '#FF5A6E', '27%'], [800, 13, '#7FE9FF', '13%']]) {
    const h = v * u * k;
    rrect(ctx, x - 90, base - h, 180, h, 14); ctx.fillStyle = col; ctx.fill();
    rrect(gctx, (x - 90), base - h, 180, h, 14); gctx.fillStyle = rgba(col, 0.35); gctx.fill();
    ctx.font = '400 90px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 12; ctx.strokeStyle = '#0B0B1A'; ctx.strokeText(lab, x, base - h - 60); ctx.fillStyle = '#FFFFFF'; ctx.fillText(lab, x, base - h - 60);
  }
  ctx.font = '900 30px Montserrat'; ctx.fillStyle = '#C9D3E0'; ctx.textAlign = 'center';
  ctx.fillText('GOT A HEADACHE', 540, base + 40);
  bigWord('2X', 540, 330, 190, '#FFD447', pop(t, c.twice + 0.25, 0.3), -0.1);
}
function journal(t, c) {
  const k = ramp(t, c.published - 0.15, c.published + 0.2, E.outBack);
  if (k <= 0) return;
  screenSpace();
  const s = lerp(1.8, 1, clamp(k)), a = clamp(k * 3);
  const dr = inv(c.published, c.published + 3, t);
  ctx.save(); ctx.translate(540, 820 - 30 * dr); ctx.rotate(0.05 - 0.07 * dr); ctx.scale(s * (1 + 0.08 * dr), s * (1 + 0.08 * dr)); ctx.globalAlpha = a;
  rrect(ctx, -300, -400, 600, 800, 12); ctx.fillStyle = '#F7F4EC'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = '#1A1C2C'; ctx.stroke();
  ctx.fillStyle = '#1A3A6A'; ctx.fillRect(-300, -400, 600, 150);
  ctx.font = '400 74px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFFFFF'; ctx.fillText('MEDICAL JOURNAL', 0, -325);
  ctx.font = '700 30px Montserrat'; ctx.fillStyle = '#1A1C2C'; ctx.fillText('DECEMBER 2002', 0, -200);
  ctx.font = '400 56px Anton'; ctx.fillText('ICE CREAM HEADACHES:', 0, -120); ctx.fillText('A RANDOMISED TRIAL', 0, -55);
  // a cone on the cover
  ctx.beginPath(); ctx.moveTo(-70, 60); ctx.lineTo(70, 60); ctx.lineTo(0, 300); ctx.closePath(); ctx.fillStyle = '#E8B06A'; ctx.fill();
  circle(ctx, 0, 30, 90, '#FF9CC4'); circle(ctx, -30, 0, 26, '#FFFFFF');
  ctx.restore();
  for (let i = 0; i < 10; i++) { // sparkles around the journal
    const p = (t * 0.7 + hash(i)) % 1, x = 540 + Math.cos(i * 2.4) * (330 + 40 * hash(i + 2)), y = 800 + Math.sin(i * 2.4) * 460;
    const r = 18 * Math.sin(Math.PI * p);
    if (t > c.published) { line(ctx, x - r, y, x + r, y, 5, '#FFF4C4'); line(ctx, x, y - r, x, y + r, 5, '#FFF4C4'); softDot(gctx, x, y, 40, '#FFD447', 0.7 * Math.sin(Math.PI * p)); }
  }
  stamp('PUBLISHED!', 560, 1110, ramp(t, c.published + 0.35, c.published + 0.55), '#4DD08A', -0.12, 110);
}
SC.result = (lt, t, shot) => {
  const c = cu();
  screenSpace();
  const fz = ramp(t, c.gulpers, c.gulpers + 0.25, E.outBack);
  raceScene(t, c, { gulpT: -10, frostL: fz, faceL: t < c.gulpers ? FACES.calm : FACES.shock, faceR: Object.assign({}, FACES.grin, { mouthOpen: 0.4 }), swL: 0, swR: 0 });
  const hd = [280, 1500 - 470 * 1.25 - 40];
  shards(hd[0], hd[1], c.gulpers, t, 20, 4);
  screenSpace();
  const dim = ramp(t, c.published - 0.2, c.published + 0.1);
  if (dim > 0) { ctx.fillStyle = `rgba(4,6,16,${0.6 * dim})`; ctx.fillRect(0, 0, W, H); }
  if (t < c.published - 0.1) bars(t, c);
  journal(t, c);
  return { glow: 0.9, flash: 0.3 * (1 - ramp(t, c.gulpers, c.gulpers + 0.2)) * (t > c.gulpers ? 1 : 0) };
};

// ================================================================= 12. fix: tongue to the roof of the mouth, warm it back up
SC.fix = (lt, t, shot) => {
  const c = cu(), s0 = shot.start;
  darkBg('#2A0E24', '#07030A');
  const cam = sectionCam(t, [[s0, 60, -20, 1.3, 920], [c.press, 190, 120, 2.5, 860]]);
  const tongue = ramp(t, c.press, c.tongue + 0.5, E.inOutCubic);
  const warmK = ramp(t, c.roof2, c.up_end + 0.3);
  headSection(cam, t, { cold: 1 - warmK, tongue, tongueWarm: warmK, vessel: lerp(1.6, 1, warmK), flow: 1 - warmK });
  // melt drips
  if (warmK > 0.05) {
    screenSpace();
    for (let i = 0; i < 6; i++) {
      const p = ((t * 0.8 + i / 6) % 1), q = hsScreen(cam, 80 + i * 40, 100);
      circle(ctx, q[0], q[1] + p * 60, 7, rgba('#BFF0FF', (1 - p) * warmK));
    }
  }
  bigWord('THE FIX', 540, 330, 170, '#4DFFB4', pop(t, c.fix) * (1 - ramp(t, c.press, c.press + 0.2)), -0.05);
  tag('TONGUE UP', 540, 330, pop(t, c.tongue), '#FF86A6', 50);
  tag('WARM IT UP', 540, 470, pop(t, c.warmup), '#FF9A3C', 50);
  return { glow: 1, push: { k: 1 + 0.03 * lt / (shot.end - s0), cx: 540, cy: 900 } };
};

// ================================================================= 13. final: "just slow down"... then the SLURP again
SC.final = (lt, t, shot) => {
  const c = cu();
  const hit = t >= c.freeze2;
  let cam = camKeys(t, [[shot.start, 560, 1060, 1.45], [c.down_end, 560, 1040, 1.6], [c.slurp2, 560, 1030, 1.75]]);
  if (hit) cam = { x: 528, y: 930, zoom: 2.55 - 0.15 * ramp(t, c.freeze2, shot.end), rot: 0 };
  const [sx, sy] = shake(t, (hit ? 24 * (1 - ramp(t, c.freeze2, c.freeze2 + 0.7)) : 0) + 6 * ramp(t, c.slurp2, c.slurp2 + 0.1) * (t < c.freeze2 ? 1 : 0), 24, 9);
  cam.sx = sx; cam.sy = sy;
  applyCam(cam);
  dinerBg(t, { flicker: hit });
  let face = Object.assign({}, FACES.calm, { mouth: 'grin', mouthOpen: 0.25, blink: 0.35 });
  if (t > c.eye_shake) face = Object.assign({}, FACES.grin, { lookX: 1, lookY: 0.6, mouthOpen: 0.5, browTilt: 0.8, browY: 0.8 });
  if (t > c.slurp2) face = Object.assign({}, F_SLURP, { blink: 0.2, mouthOpen: 0.1 });
  if (hit) face = FACES.shock;
  const nod = -8 * Math.sin(ramp(t, c.slow, c.down_end) * Math.PI * 2);
  const shrug = Math.sin(Math.PI * ramp(t, c.or, c.slow)) ;  // "Or, you know..." — a head tilt + raised brows
  if (t < c.eye_shake) face = lerpFace(face, Object.assign({}, face, { browY: 1.2, browTilt: 0.6, lookX: -0.5 }), shrug);
  const level = lerp(0.85, 0.08, ramp(t, c.slurp2, c.freeze2, E.inCubic));
  const straw = t > c.slurp2 && !hit ? 1 : 0;
  heroAtCounter(cam, t, { level, straw, frost: hit ? ramp(t, c.freeze2, c.freeze2 + 0.2, E.outBack) : 0, glassFrost: hit ? 1 : 0, strawOut: t < c.slurp2 - 0.2,
    st: { face, headDY: nod, headRot: (t > c.eye_shake && t < c.slurp2 ? 0.08 : 0) - 0.12 * shrug } });
  if (hit) { const f = toScreen(cam, HERO.x, HERO.y - 745); shards(f[0], f[1], c.freeze2, t, 34, 11); frostVignette(ramp(t, c.freeze2, c.freeze2 + 0.3)); snowflakes(t, 0.6); }
  if (t > c.slurp2 && !hit) bigWord('SLUUURP', 700, 520, 130, '#FF86A6', pop(t, c.slurp2, 0.2), -0.12);
  return { glow: hit ? 1.1 : 0.85, flash: hit ? 0.75 * (1 - ramp(t, c.freeze2, c.freeze2 + 0.3)) : 0, tint: hit ? '#BFE8FF' : undefined, tintA: hit ? 0.25 : 0, noCaptions: t > c.slurp2 };
};

function initScenes2() {
  initDiner();
  initHead();
}

// ================================================================= the cover (rendered from a one-shot timeline, see README)
SC.cover = (lt, t, shot) => {
  const cam = { x: 528, y: 900, zoom: 2.05, rot: 0.02 };
  applyCam(cam);
  dinerBg(1.3, { flicker: false });
  heroAtCounter(cam, 1.3, { level: 0.3, straw: 0, frost: 1, glassFrost: 1, st: { face: FACES.shock, frizz: 0.3 } });
  frostVignette(0.8, 9);
  snowflakes(1.3, 0.6);
  screenSpace();
  bigWord('BRAIN', 540, 470, 230, '#BFF0FF', 1, -0.06);
  bigWord('FREEZE?!', 540, 680, 230, '#7FE9FF', 1, 0.03);
  softDot(gctx, 540, 580, 460, '#7FE9FF', 0.3);
  return { glow: 1.0, tint: '#BFE8FF', tintA: 0.18, noCaptions: true };
};
