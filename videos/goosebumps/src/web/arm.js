// The macro forearm (goosebumps): skin, fine hairs that lie flat and swing upright, the bumps at their roots; the
// plucked goose that lands on it; the light switch of "on command". Loaded before scenes.js (see scene.html).
'use strict';

const ARM = { hairs: null, bumps: null, gbumps: null, tilt: 0.5 };
const ARM_HAIR = '#472A1A';

function armHW(u) { return 236 - 46 * (u + 800) / 1600 + 16 * Math.exp(-(((u + 380) / 320) ** 2)); }   // half-width along the forearm

function initArm() {
  const rng = mulberry32(31);
  ARM.hairs = []; ARM.bumps = [];
  // goose skin is regular: a jittered grid of follicles; most carry a visible hair, all of them a bump
  let row = 0;
  for (let v = -0.86; v <= 0.9; v += 0.145, row++) {
    for (let u = -960 + (row % 2) * 37; u <= 960; u += 74) {
      const p = { u: u + (rng() - 0.5) * 34, v: v + (rng() - 0.5) * 0.07, j: rng(), r: 0.8 + rng() * 0.35 };
      ARM.bumps.push(p);
      if (p.v < 0.52 && rng() < 0.7) ARM.hairs.push({ u: p.u, v: p.v, len: 56 + rng() * 34, bend: (rng() - 0.5) * 0.7, j: p.j, lay: 0.16 + rng() * 0.16, own: true });
    }
  }
  for (let u = -960; u <= 960; u += 33) ARM.hairs.push({ u: u + (rng() - 0.5) * 20, v: -1 + rng() * 0.07, len: 58 + rng() * 34, bend: (rng() - 0.5) * 0.7, j: rng(), lay: 0.16 + rng() * 0.16 });
  ARM.hairs.sort((a, b) => a.v - b.v);
  ARM.gbumps = [];
  for (let gy = -0.9; gy <= 0.9; gy += 0.2) for (let gx = -0.95 + (Math.round(gy * 5) % 2) * 0.07; gx <= 0.95; gx += 0.145) ARM.gbumps.push({ x: gx + (rng() - 0.5) * 0.05, y: gy + (rng() - 0.5) * 0.06, r: 0.8 + rng() * 0.4 });
}

// one goosebump at (x, y): a lit dome with a shadow under it. k = how raised, r = its radius, fy = foreshortening
function skinBump(c, x, y, r, k, fy = 1, hi = '#FFEBDC', sh = 'rgba(150,72,48,') {
  if (k <= 0.02) return;
  const kk = Math.min(1.15, k);
  ellipse(c, x + r * 0.26, y + r * 0.4 * fy, r * 1.06, r * 0.84 * fy, sh + (0.24 * kk) + ')');
  const g = c.createRadialGradient(x - r * 0.3, y - r * 0.38 * fy, 0.5, x, y, r);
  g.addColorStop(0, rgba(hi, 0.62 * Math.min(1, kk))); g.addColorStop(0.6, rgba(hi, 0.26 * Math.min(1, kk))); g.addColorStop(1, rgba(hi, 0));
  c.fillStyle = g; c.beginPath(); c.ellipse(x, y, r, r * fy, 0, 0, Math.PI * 2); c.fill();
}

// the forearm, in its own frame (axis along x, elbow to the left, wrist to the right).
// o: {x, y, rot, s, t, rise: (u, j) => k (0 lying ... 1 upright; may overshoot), bumpK: (u, j) => k, shiver, light (TV flicker 0..1+)}
function macroArm(o) {
  const c = ctx, t = o.t || 0, rise = o.rise || (() => 0), bumpK = o.bumpK || rise, tau = ARM.tilt;
  const sh = o.shiver ? shake(t, o.shiver, 34, 5) : [0, 0];
  c.save(); c.translate(o.x + sh[0], o.y + sh[1]); c.rotate(o.rot || 0); c.scale(o.s || 1, o.s || 1);
  // the skin
  const path = () => {
    c.beginPath();
    for (let u = -1000; u <= 1000; u += 40) c.lineTo(u, -armHW(u));
    for (let u = 1000; u >= -1000; u -= 40) c.lineTo(u, armHW(u));
    c.closePath();
  };
  path();
  const g = c.createLinearGradient(0, -240, 0, 240);
  g.addColorStop(0, '#FFD9BF'); g.addColorStop(0.16, '#F6C29E'); g.addColorStop(0.55, '#EDB08A'); g.addColorStop(0.86, '#CF8663'); g.addColorStop(1, '#A9634A');
  c.fillStyle = g; c.fill();
  c.save(); path(); c.clip();
  // soft form: a warm core light and the TV's cold rim along the top
  softDot(c, -260, -70, 520, '#FFE3CC', 0.22);
  const rim = c.createLinearGradient(0, -250, 0, -120); rim.addColorStop(0, `rgba(150,185,255,${clamp(0.32 * (o.light === undefined ? 0.6 : o.light))})`); rim.addColorStop(1, 'rgba(150,185,255,0)');
  c.fillStyle = rim; c.fillRect(-1000, -260, 2000, 150);
  // faint skin texture: creases across the forearm
  for (let i = 0; i < 9; i++) { const u = -820 + i * 205; c.beginPath(); c.moveTo(u, -armHW(u)); c.quadraticCurveTo(u + 26, 0, u + 6, armHW(u)); c.lineWidth = 2; c.strokeStyle = 'rgba(170,96,70,0.10)'; c.stroke(); }
  // the bumps (more of them than hairs: goose skin)
  for (const b of ARM.bumps) {
    const k = bumpK(b.u, b.j);
    if (k <= 0.02) continue;
    const fy = 0.45 + 0.55 * Math.sqrt(Math.max(0, 1 - b.v * b.v));
    skinBump(c, b.u, b.v * armHW(b.u), 14 * b.r, k, fy);
  }
  c.restore();
  // the hairs: each lies along the arm (toward the wrist) and swings up to stand on its bump
  for (const h of ARM.hairs) {
    const k = rise(h.u, h.j), kb = bumpK(h.u, h.j);
    const hw = armHW(h.u), x = h.u, y = h.v * hw;
    const ny = h.v * Math.cos(tau) - Math.sqrt(Math.max(0, 1 - h.v * h.v)) * Math.sin(tau);   // the surface normal, seen a little from above
    const fy = 0.45 + 0.55 * Math.sqrt(Math.max(0, 1 - h.v * h.v));
    const a = lerp(h.lay, 1.36, k) + 0.05 * Math.sin(t * 9 + h.j * 20) * clamp(k);
    const dx = Math.cos(a), dy = ny * Math.sin(a), L = h.len * (0.9 + 0.1 * clamp(k));
    const tx = x + dx * L, ty = y + dy * L;
    const mx = x + dx * L * 0.5 + h.bend * 14 * (1 - 0.7 * clamp(k)), my = y + dy * L * 0.5 - 10 * (1 - clamp(k)) * (ny < 0 ? 1 : -1);
    // a tapered, slightly curved hair: thick and dark at the root, a fine lighter tip
    const P = [];
    for (let i = 0; i <= 6; i++) { const u = i / 6, m = 1 - u; P.push([m * m * x + 2 * m * u * mx + u * u * tx, m * m * y + 2 * m * u * my + u * u * ty]); }
    c.beginPath();
    for (let pass = 0; pass < 2; pass++) for (let q = 0; q <= 6; q++) {
      const i = pass ? 6 - q : q, a0 = P[Math.max(0, i - 1)], a1 = P[Math.min(6, i + 1)];
      const ex = a1[0] - a0[0], ey = a1[1] - a0[1], el = Math.hypot(ex, ey) || 1, w = lerp(2.7, 0.45, Math.pow(i / 6, 0.8)) * (pass ? -1 : 1);
      c.lineTo(P[i][0] - ey / el * w, P[i][1] + ex / el * w);
    }
    c.closePath(); c.fillStyle = ARM_HAIR; c.fill();
    c.beginPath(); c.moveTo(P[3][0], P[3][1]); c.lineTo(P[4][0], P[4][1]); c.lineTo(P[5][0], P[5][1]); c.lineTo(P[6][0], P[6][1]);
    c.lineWidth = 1.1; c.lineCap = 'round'; c.strokeStyle = 'rgba(170,120,84,0.85)'; c.stroke();
    if (h.own) ellipse(c, x, y, 3.2, 2.4 * fy, 'rgba(110,56,36,0.55)');          // the pore it grows from
  }
  c.restore();
}

// the out-of-focus room behind the macro arm
function armBg(t, light = 0.6) {
  darkBg('#1C2554', '#060818');
  screenSpace();
  softDot(ctx, 200, 520, 420, '#2F7E90', 0.22); softDot(ctx, 900, 640, 380, '#3A8C9C', 0.16);      // the couch, far out of focus
  softDot(ctx, 240, 380, 200, '#BFD2FF', 0.18);                                                    // the window
  for (let i = 0; i < 9; i++) softDot(ctx, (i * 263 + 90) % W, 340 + ((i * 419) % 1200), 60 + (i % 3) * 40, i % 2 ? '#6F8CFF' : '#4FB6C8', 0.07);
  softDot(gctx, 240, 380, 160, '#9FB8FF', 0.25);
  const g = ctx.createLinearGradient(0, 1300, 0, H); g.addColorStop(0, 'rgba(90,130,255,0)'); g.addColorStop(1, `rgba(90,130,255,${clamp(0.2 * light)})`);
  ctx.fillStyle = g; ctx.fillRect(0, 1300, W, H - 1300);
}

// ---------------------------------------------------------------- the plucked goose
// feet at (x, y), facing left; s = scale (about 720 units tall). o: {look: -1..1 (eye: down at the arm ... at the camera),
// lid 0..1, squash, wing 0..1 (a shrug), feathers: time since landing (a few drift down)}
function drawGoose(c, x, y, s, t, o = {}) {
  const sq = o.squash || 0, skin = '#F6C8A8', skinSh = '#D9976F', org = '#F7A233', orgSh = '#D6781A';
  c.save(); c.translate(x, y); c.scale(s * (1 + 0.12 * sq), s * (1 - 0.16 * sq));
  const bob = 5 * Math.sin(t * 2.3);
  // legs + webbed feet
  for (const lx of [-46, 44]) {
    line(c, lx, -120, lx, -10, 17, orgSh); line(c, lx - 2, -120, lx - 2, -10, 10, org);
    c.beginPath(); c.moveTo(lx + 8, -18); c.lineTo(lx - 70, 4); c.lineTo(lx - 38, 2); c.lineTo(lx - 50, 18); c.lineTo(lx - 8, 7); c.lineTo(lx + 16, 16); c.lineTo(lx + 14, -8); c.closePath();
    c.fillStyle = org; c.fill();
  }
  // tail stub, with the two feathers they missed
  const ty = -276 + bob;
  for (const [a, l] of [[-0.75, 96], [-0.35, 84]]) {
    c.save(); c.translate(196, ty - 20); c.rotate(a + 0.06 * Math.sin(t * 3 + a * 5));
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(l * 0.5, -22, l, 0); c.quadraticCurveTo(l * 0.5, 22, 0, 0); c.fillStyle = '#FFFFFF'; c.fill();
    line(c, 0, 0, l * 0.92, 0, 3, 'rgba(170,180,205,0.9)');
    c.restore();
  }
  c.beginPath(); c.moveTo(170, ty - 40); c.quadraticCurveTo(250, ty - 70, 240, ty - 6); c.quadraticCurveTo(214, ty + 26, 170, ty + 26); c.closePath(); c.fillStyle = skinSh; c.fill();
  // the body: an egg of plucked, bumpy skin
  c.save(); c.translate(6, -252 + bob); c.rotate(-0.1);
  const g = c.createRadialGradient(-70, -70, 20, 0, 0, 240); g.addColorStop(0, '#FFE6D2'); g.addColorStop(0.55, skin); g.addColorStop(1, skinSh);
  c.beginPath(); c.ellipse(0, 0, 208, 156, 0, 0, Math.PI * 2); c.fillStyle = g; c.fill();
  c.save(); c.clip();
  for (const b of ARM.gbumps) skinBump(c, b.x * 200, b.y * 150, 12 * b.r, 1, 1, '#FFF4EA', 'rgba(170,96,62,');
  c.restore();
  // the folded wing: a bare little flap (it shrugs)
  const wg = o.wing || 0;
  c.save(); c.translate(40, -14); c.rotate(0.2 - 0.4 * wg);
  c.beginPath(); c.moveTo(-96, -30); c.quadraticCurveTo(-10, -86, 104, -34); c.quadraticCurveTo(150, 10, 96, 34); c.quadraticCurveTo(0, 62, -86, 22); c.closePath();
  c.fillStyle = '#F2BE9C'; c.fill(); c.lineWidth = 6; c.strokeStyle = 'rgba(190,120,86,0.8)'; c.stroke();
  for (const [bx, by] of [[-40, -10], [10, -24], [50, 0], [0, 16], [70, -22], [-66, 6]]) skinBump(c, bx, by, 11, 1, 1, '#FFF4EA', 'rgba(170,96,62,');
  c.restore();
  c.restore();
  // the neck: bare skin at the bottom, a feather ruff, white feathers up to the head
  const N = [[-134, -344 + bob], [-206, -410 + bob * 0.8], [-178, -478 + bob * 0.6], [-196, -548 + bob * 0.5]];
  const at = (u) => { const m = 1 - u; return [m * m * m * N[0][0] + 3 * m * m * u * N[1][0] + 3 * m * u * u * N[2][0] + u * u * u * N[3][0], m * m * m * N[0][1] + 3 * m * m * u * N[1][1] + 3 * m * u * u * N[2][1] + u * u * u * N[3][1]]; };
  const nk = (c0, w, a, b) => {
    c.beginPath();
    for (let i = 0; i <= 24; i++) { const [px, py] = at(lerp(a, b, i / 24)); i ? c.lineTo(px, py) : c.moveTo(px, py); }
    c.lineCap = 'round'; c.lineWidth = w; c.strokeStyle = c0; c.stroke();
  };
  nk(skinSh, 92, 0, 0.5); nk(skin, 78, 0, 0.5);
  for (const u of [0.1, 0.24, 0.38]) { const [px, py] = at(u); skinBump(c, px - 14, py, 10, 1, 1, '#FFF4EA', 'rgba(170,96,62,'); skinBump(c, px + 18, py + 12, 10, 1, 1, '#FFF4EA', 'rgba(170,96,62,'); }
  nk('#CFD6E6', 98, 0.5, 1); nk('#FFFFFF', 86, 0.5, 1);
  // the ruff: a ring of feather tips where the plucking stopped
  const [rx, ry] = at(0.5);
  for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(rx + i * 15 - 13, ry - 8); c.lineTo(rx + i * 15, ry + 30 - Math.abs(i) * 3); c.lineTo(rx + i * 15 + 13, ry - 8); c.closePath(); c.fillStyle = '#FFFFFF'; c.fill(); }
  // head: beak first, then the white head over its root
  const hx = -204, hy = -586 + bob * 0.5;
  c.beginPath(); c.moveTo(hx - 52, hy - 34); c.quadraticCurveTo(hx - 150, hy - 26, hx - 206, hy + 14); c.quadraticCurveTo(hx - 140, hy + 40, hx - 52, hy + 38); c.closePath(); c.fillStyle = org; c.fill();
  c.beginPath(); c.moveTo(hx - 200, hy + 14); c.quadraticCurveTo(hx - 130, hy + 10, hx - 56, hy + 18); c.lineWidth = 5; c.strokeStyle = orgSh; c.stroke();
  ellipse(c, hx - 122, hy - 6, 7, 4, orgSh);
  ellipse(c, hx, hy, 92, 78, '#CFD6E6'); ellipse(c, hx - 5, hy - 5, 88, 73, '#FFFFFF');
  // a tuft on top
  for (const [a, l] of [[-1.95, 40], [-1.55, 52], [-1.15, 36]]) line(c, hx + 14, hy - 66, hx + 14 + Math.cos(a) * l, hy - 66 + Math.sin(a) * l, 12, '#FFFFFF');
  // the eye: deadpan (a heavy lid), looking down at the arm or straight at you
  const look = o.look === undefined ? 1 : o.look, ex = hx - 34, ey = hy - 12, er = 27;
  circle(c, ex, ey, er, '#FFFFFF'); c.beginPath(); c.arc(ex, ey, er, 0, Math.PI * 2); c.lineWidth = 4.5; c.strokeStyle = '#2A2A36'; c.stroke();
  circle(c, ex - 6 * (1 - look) + 2 * look, ey + 11 * (1 - look) + 2, 13, '#15131F'); circle(c, ex - 6 * (1 - look) - 2, ey + 11 * (1 - look) - 3, 4.5, '#FFFFFF');
  const lid = o.lid === undefined ? 0.45 : o.lid;
  c.save(); c.beginPath(); c.arc(ex, ey, er + 1, 0, Math.PI * 2); c.clip();
  c.fillStyle = '#DDE3F0'; c.fillRect(ex - er - 2, ey - er - 2, 2 * er + 4, (2 * er + 2) * lid);
  line(c, ex - er - 2, ey - er - 2 + (2 * er + 2) * lid, ex + er + 2, ey - er - 2 + (2 * er + 2) * lid, 5, '#2A2A36');
  c.restore();
  line(c, ex - 34, ey - 40, ex + 26, ey - 34, 8, '#8E97AE');                                       // a flat, unimpressed brow
  c.restore();
  // a few feathers still drifting down
  if (o.feathers !== undefined) {
    for (let i = 0; i < 6; i++) {
      const d = o.feathers - i * 0.12;
      if (d < 0) continue;
      const fx = x + (-300 + i * 120 + 40 * Math.sin(d * 2.2 + i)) * s, fy = y + (-700 + 170 * d + 60 * (i % 3)) * s;
      if (fy > y - 20 * s) continue;
      c.save(); c.translate(fx, fy); c.rotate(0.9 * Math.sin(d * 2.6 + i * 2)); c.scale(s, s);
      c.beginPath(); c.moveTo(-40, 0); c.quadraticCurveTo(0, -22, 42, 0); c.quadraticCurveTo(0, 22, -40, 0); c.fillStyle = 'rgba(255,255,255,0.95)'; c.fill();
      line(c, -40, 0, 36, 0, 3, 'rgba(170,180,205,0.9)');
      c.restore();
    }
  }
}

// ---------------------------------------------------------------- the light switch ("on command")
// (x, y) = centre of the plate, on 0..1 (rocker), k = pop-in
function lightSwitch(x, y, s, on, t, k = 1) {
  if (k <= 0) return;
  const c = ctx, sc = E.outBack(clamp(k), 1.6) * s;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.translate(x, y); c.rotate(-0.05); c.scale(sc, sc);
  rrect(c, -92, -128, 196, 268, 30); c.fillStyle = 'rgba(0,0,20,0.45)'; c.fill();
  const pg = c.createLinearGradient(0, -130, 0, 130); pg.addColorStop(0, '#FFFBF0'); pg.addColorStop(1, '#D9D2BE');
  rrect(c, -98, -134, 196, 268, 30); c.fillStyle = pg; c.fill();
  circle(c, 0, -108, 7, '#B9B19C'); circle(c, 0, 108, 7, '#B9B19C');
  // the rocker: the pressed half is in shade
  rrect(c, -44, -78, 88, 156, 16); c.fillStyle = '#C9C2AE'; c.fill();
  const top = c.createLinearGradient(0, -74, 0, 0), bot = c.createLinearGradient(0, 0, 0, 74);
  top.addColorStop(0, on > 0.5 ? '#CFC8B4' : '#FFFFFF'); top.addColorStop(1, on > 0.5 ? '#E4DDCA' : '#F1EBDB');
  bot.addColorStop(0, on > 0.5 ? '#FFFFFF' : '#DCD5C2'); bot.addColorStop(1, on > 0.5 ? '#F4EEDF' : '#C2BBA6');
  rrect(c, -38, -72, 76, 72, 12); c.fillStyle = top; c.fill();
  rrect(c, -38, 0, 76, 72, 12); c.fillStyle = bot; c.fill();
  line(c, -38, 0, 38, 0, 3, 'rgba(120,112,96,0.6)');
  // the lamp: green when on
  circle(c, 0, on > 0.5 ? -44 : 40, 9, on > 0.5 ? '#4DFFB4' : '#8E8774');
  c.restore();
  if (on > 0.5) softDot(gctx, x, y - 44 * sc, 60 * sc, '#4DFFB4', 0.9);
}
