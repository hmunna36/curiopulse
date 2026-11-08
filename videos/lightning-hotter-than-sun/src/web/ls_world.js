// Lightning Is 5x HOTTER Than the Sun's Surface: the summit camp in a thunderstorm at night.
// World units are pixels at zoom 1 (lib.js). A "site" says where things stand, so the boom shot can look from the other
// side (the bolt on the left, the hero on the right) with the same drawing code.
'use strict';

const LS_SITE_A = { crest: 1500, heroX: 420, rodX: 700, rodTip: 930, tentX: 70, fireX: 236, bagX: 150, flagEnd: [40, 1290] };
const LS_SITE_B = { crest: 1500, heroX: 720, rodX: 330, rodTip: 930, tentX: 1040, fireX: 930, bagX: 1010, flagEnd: [1060, 1290], mirror: true };
let LS_BOLT_A = null, LS_BOLT_B = null, LS_BOLT_TALL = null, LS_BOLT_DUNE = null;
let LS_RIDGE_FAR = null, LS_RIDGE_MID = null, LS_ROCKS = null, LS_STARS = null;

// the channel's x at world height y (the main channel's points run top to bottom)
function lsChannelX(b, y) {
  const P = b.main;
  for (let i = 1; i < P.length; i++) {
    const a = P[i - 1], c = P[i];
    if ((y >= a[1] && y <= c[1]) || (y <= a[1] && y >= c[1])) return lerp(a[0], c[0], (y - a[1]) / ((c[1] - a[1]) || 1));
  }
  return y < P[0][1] ? P[0][0] : P[P.length - 1][0];
}
// a bolt whose last `straight` units come down onto (x2, y2) nearly plumb, so a marshmallow can sit beside it
function lsMakeBolt(seed, x1, y1, x2, y2, opt = {}) {
  const st = opt.straight || 0;
  const b = makeBolt(seed, x1, y1, x2 + (opt.lean || 0), y2 - st, opt);
  if (st > 0) {
    const rng = mulberry32(seed + 7), tail = [];
    const n = 6;
    for (let i = 1; i <= n; i++) tail.push([x2 + (opt.lean || 0) * (1 - i / n) + (i < n ? (rng() - 0.5) * 10 : 0), y2 - st + (st * i) / n]);
    b.main = b.main.concat(tail);
    b.x2 = x2; b.y2 = y2;
  }
  return b;
}

function lsInit() {
  LS_BOLT_A = lsMakeBolt(311, 520, -1700, LS_SITE_A.rodX, LS_SITE_A.rodTip, { disp: 330, depth: 7, branches: 9, straight: 170, lean: -14 });
  LS_BOLT_B = lsMakeBolt(377, 520, -1700, LS_SITE_B.rodX, LS_SITE_B.rodTip, { disp: 330, depth: 7, branches: 9, straight: 170, lean: 12 });
  LS_BOLT_TALL = lsMakeBolt(523, 800, -3300, 746, 1210, { disp: 420, depth: 8, branches: 12, straight: 360, lean: 4 });
  LS_BOLT_DUNE = makeBolt(611, 380, -1500, 640, 1312, { disp: 300, depth: 7, branches: 8 });
  LS_RIDGE_FAR = makeRidge(14, 0, 150, 30);
  LS_RIDGE_MID = makeRidge(23, 0, 95, 30);
  const rng = mulberry32(919);
  LS_ROCKS = [...Array(26)].map((_, i) => ({ u: -1.25 + i * 0.1 + (rng() - 0.5) * 0.05, r: 34 + rng() * 70, sq: 0.45 + rng() * 0.3, seed: 40 + i, rot: (rng() - 0.5) * 0.4 }));
  LS_STARS = [...Array(40)].map(() => ({ x: rng() * W, y: rng() * 500, r: 1 + rng() * 2 }));
}

// the bolt's brightness: always on, with a fast flicker (loop-safe) and a surge at a strike cue
function lsBoltI(t, surge = 0) {
  return 0.92 + 0.12 * Math.sin(t * loopW(41)) + 0.08 * Math.sin(t * loopW(67) + 1.3) + surge;
}
// the sky's lightning wash 0..1
function lsSkyFlash(t, cuesAt = []) {
  let f = 0.32 + 0.06 * Math.sin(t * loopW(29));
  for (const c of cuesAt) if (t >= c) f += 0.75 * Math.exp(-(t - c) * 7);
  return clamp(f, 0, 1.2);
}

// ---------------------------------------------------------------- the storm sky (screen space with parallax)
// o: {flash, bgdy (camera height: + = the horizon rises, a high angle), dusk (0..1 an orange horizon: the desert)}
function lsSky(cam, t, o = {}) {
  const f = o.flash || 0, dusk = o.dusk || 0;
  screenSpace();
  const g = ctx.createLinearGradient(0, 0, 0, H);
  const lift = clamp(f, 0, 1);
  g.addColorStop(0, mixH(mixH('#060A22', '#2A1446', dusk), '#4F5FC0', lift * 0.45));
  g.addColorStop(0.45, mixH(mixH('#111A4E', '#5A2A6A', dusk), '#7D8BE6', lift * 0.5));
  g.addColorStop(0.7, mixH(mixH('#2C2A72', '#E0683A', dusk), '#A9B2FF', lift * 0.42));
  g.addColorStop(1, mixH(mixH('#0B0F2C', '#FFB15A', dusk), '#2E3880', lift * 0.3));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // a few stars through the gaps (only when the sky is dark)
  for (const s of LS_STARS) softDot(ctx, s.x, s.y, s.r * 2.2, '#CFE0FF', 0.25 * (1 - lift) * (1 - dusk));
  const pc = parallax(cam, 0.3);
  pc.y += (o.bgdy || 0) * 0.3;
  camTransform(ctx, pc, 1);
  const drift = t * 14;
  ctx.globalAlpha = 1;
  ctx.drawImage(ENV.cloudsBack, -460 - drift, -260);
  if (f > 0.01) {
    ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = clamp(f * 0.85);
    ctx.drawImage(ENV.cloudsBackLit, -460 - drift, -260);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  }
  ctx.drawImage(ENV.cloudsFront, -560 + drift * 1.5, -420);
}

// far ridges far below the summit (parallax 0.5): we are above them
function lsRidges(cam, t, o = {}) {
  const f = o.flash || 0;
  const pc = parallax(cam, 0.5);
  pc.y += (o.bgdy || 0) * 0.5;
  camTransform(ctx, pc, 1);
  const base = o.ridgeY || 1350;
  const ridge = (pts, dy, col, colLit) => {
    ctx.fillStyle = mixH(col, colLit, f * 0.45);
    ctx.beginPath(); ctx.moveTo(pts[0][0] - 400, H + 1600);
    for (const p of pts) ctx.lineTo(p[0] * 1.6 - 400, base + dy + p[1]);
    ctx.lineTo(pts[pts.length - 1][0] * 1.6 - 400, H + 1600); ctx.closePath(); ctx.fill();
  };
  ridge(LS_RIDGE_FAR, 0, '#141B4C', '#3C4796');
  // valley mist between the ridges
  for (let i = 0; i < 6; i++) softDot(ctx, -200 + i * 320, base + 150, 260, '#5A66B8', 0.10 + 0.05 * f);
  ridge(LS_RIDGE_MID, 140, '#0D1238', '#2A3276');
}

// ---------------------------------------------------------------- the summit itself (world)
function lsCrestY(site, x) {
  const d = (x - (site.heroX + site.rodX) / 2) / 820;
  return site.crest + d * d * 420 + 10 * vnoise(x / 60, 3) + 6 * vnoise(x / 23, 7);
}
function lsRock(c, x, y, r, sq, seed, rot, f, lit) {
  const rng = mulberry32(seed);
  const pts = [...Array(9)].map((_, i) => {
    const a = Math.PI + (i / 8) * Math.PI;
    const rr = r * (0.82 + rng() * 0.3);
    return [x + Math.cos(a + rot) * rr, y + Math.sin(a + rot) * rr * sq];
  });
  c.beginPath(); c.moveTo(x - r * 1.05, y + 6);
  for (const p of pts) c.lineTo(p[0], p[1]);
  c.lineTo(x + r * 1.05, y + 6); c.closePath();
  c.fillStyle = mixH('#1C2350', '#4A58A8', f * 0.4); c.fill();
  // the wet top catches the bolt's light (lit: -1 left, 1 right)
  c.beginPath();
  for (let i = 0; i < pts.length; i++) { const p = pts[i]; i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); }
  c.lineWidth = 4; c.strokeStyle = rgba('#AFC4FF', 0.22 + 0.4 * f); c.lineCap = 'round'; c.stroke();
}
// o: {flash, t}
function lsGround(cam, site, t, o = {}) {
  const f = o.flash || 0;
  applyCam(cam);
  const x0 = cam.x - (W / 2) / cam.zoom - 200, x1 = cam.x + (W / 2) / cam.zoom + 200;
  // the summit's mass
  const g = ctx.createLinearGradient(0, site.crest - 60, 0, site.crest + 900);
  g.addColorStop(0, mixH('#232B5E', '#5A68BE', f * 0.45));
  g.addColorStop(0.3, mixH('#151B44', '#323C8A', f * 0.3));
  g.addColorStop(1, '#070A1E');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(x0, site.crest + 2400);
  for (let x = x0; x <= x1; x += 16) ctx.lineTo(x, lsCrestY(site, x));
  ctx.lineTo(x1, site.crest + 2400); ctx.closePath(); ctx.fill();
  // a wet sheen along the crest
  ctx.beginPath();
  for (let x = x0; x <= x1; x += 16) (x === x0 ? ctx.moveTo(x, lsCrestY(site, x)) : ctx.lineTo(x, lsCrestY(site, x)));
  ctx.lineWidth = 4; ctx.strokeStyle = rgba('#9FB4FF', 0.25 + 0.5 * f); ctx.stroke();
  // boulders along the crest (behind the hero)
  for (const r of LS_ROCKS) {
    const x = (site.heroX + site.rodX) / 2 + r.u * 900;
    if (x < x0 - 200 || x > x1 + 200) continue;
    if (Math.abs(x - site.heroX) < 120 || Math.abs(x - site.rodX) < 90) continue;
    lsRock(ctx, x, lsCrestY(site, x) + 8, r.r, r.sq, r.seed, r.rot, f);
  }
  // puddles that mirror the bolt
  for (const px of [site.heroX - 170, site.rodX + 150]) {
    const y = lsCrestY(site, px) + 30;
    ellipse(ctx, px, y, 70, 9, rgba('#0A0F2A', 0.9));
    ellipse(ctx, px, y - 1, 56, 5, rgba('#BFD4FF', 0.18 + 0.45 * f));
    softDot(gctx, px, y, 50, '#9FC4FF', 0.12 + 0.25 * f);
  }
}

// the tent with a lantern inside (practical light), drawn behind everything else on the summit
function lsTent(site, t, f) {
  const x = site.tentX, y = lsCrestY(site, x) + 4, s = site.mirror ? -1 : 1;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, 1);
  ctx.fillStyle = '#C8501E';
  ctx.beginPath(); ctx.moveTo(-150, 0); ctx.lineTo(0, -190); ctx.lineTo(150, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#9A3814';
  ctx.beginPath(); ctx.moveTo(0, -190); ctx.lineTo(150, 0); ctx.lineTo(60, 0); ctx.closePath(); ctx.fill();
  // the lit door
  const flick = 0.85 + 0.15 * Math.sin(t * loopW(9)) + 0.05 * Math.sin(t * loopW(23));
  ctx.fillStyle = mixH('#FF9A3C', '#FFD27A', 0.5 * flick);
  ctx.beginPath(); ctx.moveTo(-58, 0); ctx.lineTo(0, -120); ctx.lineTo(42, 0); ctx.closePath(); ctx.fill();
  ctx.restore();
  softDot(gctx, x, y - 50, 120, '#FFB25A', 0.55 * flick);
  softDot(ctx, x, y - 30, 260, '#FF9A3C', 0.10 * flick);
  // guy lines + a pole for the flags
  line(ctx, x - 150 * s, y, x - 210 * s, y + 10, 2, rgba('#E9E3FF', 0.35));
  line(ctx, site.flagEnd[0], site.flagEnd[1], site.flagEnd[0], lsCrestY(site, site.flagEnd[0]) + 6, 6, '#3A2A1E');
}

// prayer flags on a line from the rod down to the tent's pole, snapping in the wind
function lsFlags(site, t, f, blast = 0) {
  const a = [site.rodX, site.rodTip + 140], b = site.flagEnd;
  const n = 15, cols = ['#2F7BFF', '#F4F4F4', '#E8383D', '#2BB673', '#FFD447'];
  const pt = (u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u) + Math.sin(Math.PI * u) * 90 + 6 * Math.sin(t * loopW(5) + u * 6)];
  ctx.beginPath();
  for (let i = 0; i <= 30; i++) { const p = pt(i / 30); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
  ctx.lineWidth = 2.5; ctx.strokeStyle = '#DCD6C8'; ctx.stroke();
  for (let i = 1; i < n; i++) {
    const u = i / n, p = pt(u);
    const wob = Math.sin(t * loopW(11) + i * 1.7) * 0.25 + blast * 0.9 * (site.mirror ? 1 : -1);
    ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(wob);
    ctx.fillStyle = mixH(cols[i % 5], '#FFFFFF', f * 0.15);
    ctx.beginPath(); ctx.moveTo(-17, 0); ctx.lineTo(17, 0); ctx.lineTo(15 + 4 * Math.sin(t * loopW(13) + i), 44); ctx.lineTo(-15, 44); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
}

// the rained-out campfire: wet logs, a few dying embers, a wisp of steam
function lsFire(site, t, f) {
  const x = site.fireX, y = lsCrestY(site, x) + 30;
  for (let i = 0; i < 7; i++) {
    const a = Math.PI + (i / 6) * Math.PI;
    ellipse(ctx, x + Math.cos(a) * 62, y + 8 + Math.sin(a) * -12, 20, 13, i % 2 ? '#3B4266' : '#2C3254');
  }
  ctx.save(); ctx.translate(x, y);
  for (const [r, col] of [[0.35, '#5A3420'], [-0.35, '#4A2A18'], [0.05, '#61391F']]) {
    ctx.save(); ctx.rotate(r); rrect(ctx, -70, -12, 140, 24, 12); ctx.fillStyle = col; ctx.fill();
    ellipse(ctx, 70, 0, 10, 12, '#C99A6A'); ctx.restore();
  }
  ctx.restore();
  for (let i = 0; i < 4; i++) {
    const k = 0.5 + 0.5 * Math.sin(t * loopW(3 + i) + i * 2);
    softDot(gctx, x - 30 + i * 20, y - 6, 22, '#FF7A2A', 0.35 * k);
    circle(ctx, x - 30 + i * 20, y - 6, 3, mixH('#5A2A18', '#FF8A3A', k));
  }
  smoke(83, x, y - 10, -2, t, { rate: 9, life: 2.2, rise: 260, size: 22, alpha: 0.28, wind: 40, col: '#C9D2EE' });
}

// the bag of marshmallows on a rock (paint: the label)
function lsBag(c, x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  rrect(c, -46, -86, 92, 92, 16); c.fillStyle = '#F4F1FF'; c.fill();
  c.beginPath(); c.moveTo(-46, -78); c.lineTo(-30, -104); c.lineTo(30, -104); c.lineTo(46, -78); c.closePath(); c.fillStyle = '#E2DDF5'; c.fill();
  rrect(c, -36, -110, 72, 12, 5); c.fillStyle = '#FF6E9A'; c.fill();
  paint(() => {
    c.font = '900 20px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = '#FF4F86'; c.fillText('MALLOWS', 0, -52);
    for (let i = 0; i < 3; i++) { rrect(c, -30 + i * 22, -30, 16, 18, 6); c.fillStyle = '#FFFFFF'; c.fill(); }
  });
  c.restore();
}

// the lightning rod on its cairn (world): a copper spike on a steel pole
function lsRod(site, t, f) {
  const x = site.rodX, tip = site.rodTip, base = lsCrestY(site, x) + 6;
  // the cairn
  const stones = [[0, 0, 74, 26], [-8, -40, 60, 22], [10, -74, 48, 19], [-4, -102, 36, 16]];
  for (const [dx, dy, rx, ry] of stones) {
    ellipse(ctx, x + dx, base + dy, rx, ry, mixH('#2A3366', '#5866B8', f * 0.4));
    ellipse(ctx, x + dx - 6, base + dy - ry * 0.45, rx * 0.8, ry * 0.4, rgba('#9FB4FF', 0.12 + 0.35 * f));
  }
  // the pole
  if (base - 108 - tip - 40 > 10) {
    rrect(ctx, x - 9, tip + 40, 18, base - 100 - tip - 40, 6); ctx.fillStyle = '#8D96B8'; ctx.fill();
    rrect(ctx, x - 4, tip + 44, 5, base - 108 - tip - 40, 3); ctx.fillStyle = '#E7EDFF'; ctx.fill();
  }
  // the glass ball and the copper spike
  circle(ctx, x, tip + 120, 22, '#5FA8E0');
  circle(ctx, x - 7, tip + 112, 7, '#DFF4FF');
  ctx.fillStyle = '#E08A3C';
  ctx.beginPath(); ctx.moveTo(x - 10, tip + 44); ctx.lineTo(x, tip); ctx.lineTo(x + 10, tip + 44); ctx.closePath(); ctx.fill();
  // the tip glows where the bolt lands
  softDot(gctx, x, tip, 90, '#E6F4FF', 0.9);
  sparks(901 + Math.floor(t * 6), x, tip, Math.floor(t * 6) / 6, t, 6, { speed: 520, life: 0.35, w: 3 });
}

// ---------------------------------------------------------------- the marshmallow and the stick (world, in his layer)
// toast: 0 white .. 0.5 golden .. 1 charcoal; puff: 1 = its size (it swells as it heats); fire 0..1; crumble 0..1
function lsMallow(c, x, y, s, rot, o, t) {
  const toast = o.toast || 0, puff = o.puff || 1, fire = o.fire || 0;
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s * puff, s * puff);
  const col = toast < 0.5 ? mixH('#FFFDF6', '#F0B860', toast / 0.5) : mixH('#F0B860', '#2A1A14', (toast - 0.5) / 0.5);
  const dark = toast < 0.5 ? mixH('#E9E4F2', '#C98A3A', toast / 0.5) : mixH('#C98A3A', '#120A08', (toast - 0.5) / 0.5);
  rrect(c, -22, -26, 44, 52, 14); c.fillStyle = col; c.fill();
  ellipse(c, 0, -24, 22, 7, dark);
  if (toast > 0.25) {               // blisters
    for (const [bx, by, br] of [[-9, -6, 6], [8, 6, 5], [-4, 14, 4]]) ellipse(c, bx, by, br, br * 0.8, rgba(dark, 0.8));
  }
  if (o.crumble > 0) {              // flakes falling off
    for (let i = 0; i < 6; i++) {
      const k = o.crumble, a = i * 1.1;
      circle(c, Math.cos(a) * 18 + Math.sin(i) * 6 * k, 20 + k * (40 + i * 18), 4, '#1A0E0A');
    }
  }
  c.restore();
  if (fire > 0.01) lsFlame(x, y - 18 * s * puff, s * (0.6 + 0.8 * fire), t, fire);
}
// a little cartoon flame (main + glow)
function lsFlame(x, y, s, t, k) {
  const fl = (i) => 1 + 0.18 * Math.sin(t * loopW(23) + i * 2.1) + 0.1 * Math.sin(t * loopW(37) + i);
  for (const [c, m] of [[gctx, 1.4], [ctx, 1]]) {
    for (let i = 0; i < 3; i++) {
      const dx = (i - 1) * 14 * s, hh = (70 - Math.abs(i - 1) * 22) * s * fl(i) * m;
      c.fillStyle = c === gctx ? rgba('#FF8A2A', 0.75 * k) : (i === 1 ? '#FFD54A' : '#FF8A2A');
      c.beginPath(); c.moveTo(x + dx - 16 * s * m, y + 8 * s);
      c.quadraticCurveTo(x + dx - 18 * s * m, y - hh * 0.5, x + dx + 4 * s * Math.sin(t * 9 + i), y - hh);
      c.quadraticCurveTo(x + dx + 18 * s * m, y - hh * 0.5, x + dx + 16 * s * m, y + 8 * s);
      c.closePath(); c.globalAlpha = c === ctx ? clamp(k * 1.5) : 1; c.fill(); c.globalAlpha = 1;
    }
  }
  softDot(gctx, x, y - 20 * s, 70 * s, '#FFB03A', 0.6 * k);
}
function lsStick(c, a, b, burnt = 0) {
  line(c, a[0], a[1], b[0], b[1], 7, mixH('#8A5A2E', '#2A1A12', burnt));
  line(c, a[0] - 1, a[1] - 1, lerp(a[0], b[0], 0.85) - 1, lerp(a[1], b[1], 0.85) - 1, 2.5, rgba('#D9A46A', 0.6 * (1 - burnt)));
}

// ---------------------------------------------------------------- the hero on the summit
// hand: [x, y] world target of his right wrist; o: {face, frizz, soot, lean, dx, pose (override), left: 'bag' | 'thumb' | null}
function lsHeroPose(st, hand, o = {}) {
  let p = JSON.parse(JSON.stringify(o.base || POSES.stand));
  p.lean = o.lean || 0;
  if (hand) p = ikReach(p, 'R', ikLocal(st, hand[0], hand[1]), -1);
  p.armL = o.armL || { a: 0.28, b: 0.38 };
  p.handR = 'open'; p.handL = 'open';
  return p;
}
