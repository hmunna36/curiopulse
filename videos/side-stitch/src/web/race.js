// A charity fun run at night: the road, the banner, the crowd's lights; the hero in a running top with a bib;
// the giant needle that "stitches" his side. Everything here draws under the current camera (world coords),
// except the sky (screen space).
'use strict';

const RUNPAL = Object.assign({}, PAL, {
  coat: '#FF6B4A', coatSh: '#C9432A', coatHi: '#FF9C80', coatDk: '#8E2A18', strap: '#F4F0E6', strapSh: '#B9B4A8',
  pants: '#232B5C', pantsSh: '#161B40', shortSleeve: true,
});
const RACE_VP = [540, 1010];          // the road's vanishing point
let RC_BOKEH = null, RC_TREES = null, RC_CROWD = null;

function initRace() {
  const rng = mulberry32(4107);
  RC_BOKEH = [...Array(46)].map(() => ({ x: rng(), y: rng(), r: 14 + rng() * 40, c: ['#FFB870', '#7FE9FF', '#FF86A6', '#FFD447'][Math.floor(rng() * 4)], ph: rng() * 9 }));
  RC_TREES = [...Array(9)].map((_, i) => ({ x: -80 + i * 150 + rng() * 60, h: 240 + rng() * 200, w: 150 + rng() * 90 }));
  RC_CROWD = [...Array(26)].map((_, i) => ({ u: rng(), side: i % 2 ? 1 : -1, h: 0.8 + rng() * 0.5, ph: rng() * 9, ph2: rng() }));
}

// tt = seconds of running (drives everything that streams past); o: {banner: 0..1.4 scale of the arch, word, speed}
function raceBack(cam, tt, o = {}) {
  const sp = o.speed === undefined ? 1 : o.speed;       // 1 = running, 0 = standing still
  const dist = o.dist === undefined ? tt * sp : o.dist; // how far he has run (drives the streaming)
  screenSpace();
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#070A20'); sky.addColorStop(0.45, '#1A1E52'); sky.addColorStop(0.56, '#3B2A66'); sky.addColorStop(1, '#0A0D24');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 40; i++) {
    const x = hash(i * 3.1) * W, y = hash(i * 7.7) * 760, tw = 0.5 + 0.5 * Math.sin(tt * 2 + i);
    circle(ctx, x, y, 1.6 + 1.6 * hash(i), rgba('#DCE6FF', 0.25 + 0.4 * tw));
  }
  applyCam(cam);
  const [vx, vy] = RACE_VP;
  // far trees + a glow on the horizon
  softDot(ctx, vx, vy, 620, '#6B4AA8', 0.5);
  softDot(gctx, vx, vy - 20, 380, '#7A56C8', 0.35);
  for (const tr of RC_TREES) {
    ctx.fillStyle = '#0B0E2A';
    ctx.beginPath(); ctx.ellipse(tr.x, vy - tr.h * 0.55, tr.w * 0.5, tr.h * 0.6, 0, 0, 7); ctx.fill();
    ctx.fillRect(tr.x - 9, vy - tr.h * 0.3, 18, tr.h * 0.3 + 4);
  }
  // ground + road
  ctx.fillStyle = '#0B1030'; ctx.fillRect(-600, vy, 2400, 1400);
  const rd = ctx.createLinearGradient(0, vy, 0, 1920);
  rd.addColorStop(0, '#2A2F5E'); rd.addColorStop(1, '#151A3C');
  ctx.fillStyle = rd;
  ctx.beginPath(); ctx.moveTo(vx - 70, vy); ctx.lineTo(vx + 70, vy); ctx.lineTo(1380, 2000); ctx.lineTo(-300, 2000); ctx.closePath(); ctx.fill();
  // lane dashes streaming toward the camera (perspective: y = vy + 900 * z^2)
  for (let i = 0; i < 9; i++) {
    const z0 = ((i / 9 + dist * 0.55) % 1 + 1) % 1, z1 = Math.min(1.15, z0 + 0.05);
    const y0 = vy + 1000 * z0 * z0, y1 = vy + 1000 * z1 * z1, w0 = 4 + 26 * z0 * z0, w1 = 4 + 26 * z1 * z1;
    ctx.fillStyle = rgba('#F4F0E6', 0.16 + 0.5 * z0);
    ctx.beginPath(); ctx.moveTo(vx - w0, y0); ctx.lineTo(vx + w0, y0); ctx.lineTo(vx + w1, y1); ctx.lineTo(vx - w1, y1); ctx.closePath(); ctx.fill();
  }
  // road edges
  for (const s of [-1, 1]) line(ctx, vx + s * 70, vy, vx + s * 840, 2000, 7, rgba('#FFD447', 0.5));
  // the crowd behind barriers: silhouettes with phone lights, streaming past
  for (const p of RC_CROWD) {
    const z = ((p.u + dist * 0.4) % 1 + 1) % 1, zz = 0.12 + z * z;
    const y = vy + 960 * zz, x = vx + p.side * (130 + 960 * zz) * 1.02, s = (0.25 + 1.9 * zz) * p.h;
    const a = clamp(z * 6) * clamp((1 - z) * 5);
    if (a <= 0.01) continue;
    const hop = 10 * s * Math.abs(Math.sin(tt * 5 + p.ph));
    ctx.fillStyle = rgba('#080A22', a);
    ctx.beginPath(); ctx.ellipse(x, y - 150 * s - hop, 34 * s, 40 * s, 0, 0, 7); ctx.fill();
    rrect(ctx, x - 46 * s, y - 118 * s - hop, 92 * s, 150 * s, 30 * s); ctx.fill();
    if (p.ph2 > 0.45) {   // a raised phone
      const px = x - p.side * 50 * s, py = y - 190 * s - hop;
      rrect(ctx, px - 9 * s, py - 16 * s, 18 * s, 32 * s, 4 * s); ctx.fillStyle = rgba('#DDF2FF', 0.9 * a); ctx.fill();
      softDot(gctx, px, py, 46 * s, '#9FD8FF', 0.55 * a);
    }
  }
  // the arch
  const b = o.banner === undefined ? 1 : o.banner;
  if (b > 0.02) {
    for (const c of [ctx]) {
      c.save(); c.translate(vx, vy); c.scale(b, b);
      for (const s of [-1, 1]) { rrect(c, s * 400 - 16, -560, 32, 620, 10); c.fillStyle = '#C9CEE8'; c.fill(); rrect(c, s * 400 - 16, -560, 12, 620, 6); c.fillStyle = '#8A90B8'; c.fill(); }
      rrect(c, -430, -600, 860, 150, 26); c.fillStyle = '#FF3D6E'; c.fill();
      rrect(c, -430, -600, 860, 34, 16); c.fillStyle = '#FF7A9C'; c.fill();
      c.lineWidth = 8; c.strokeStyle = '#7A1034'; rrect(c, -430, -600, 860, 150, 26); c.stroke();
      c.font = '400 108px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#FFF6DC';
      c.fillText(o.word || 'FUN RUN', 0, -518);
      c.restore();
    }
    gctx.save(); gctx.translate(vx, vy); gctx.scale(b, b);
    rrect(gctx, -430, -600, 860, 150, 26); gctx.fillStyle = 'rgba(255,61,110,0.35)'; gctx.fill();
    // a string of bulbs under the banner
    for (let i = 0; i <= 12; i++) {
      const u = i / 12, x = -400 + 800 * u, y = -430 + 46 * Math.sin(Math.PI * u), on = 0.55 + 0.45 * Math.sin(tt * 6 + i * 1.7);
      softDot(gctx, x, y, 34, i % 2 ? '#FFD447' : '#7FE9FF', 0.8 * on);
    }
    gctx.restore();
    ctx.save(); ctx.translate(vx, vy); ctx.scale(b, b);
    for (let i = 0; i <= 12; i++) {
      const u = i / 12, x = -400 + 800 * u, y = -430 + 46 * Math.sin(Math.PI * u);
      circle(ctx, x, y, 9, i % 2 ? '#FFE9A0' : '#C8F6FF');
    }
    ctx.restore();
  }
  // out-of-focus lights
  screenSpace();
  for (const k of RC_BOKEH) {
    const x = ((k.x * 1300 + (k.x < 0.5 ? -1 : 1) * dist * 90) % 1300 + 1300) % 1300 - 110, y = 520 + k.y * 620;
    const tw = 0.6 + 0.4 * Math.sin(tt * 1.7 + k.ph);
    softDot(ctx, x, y, k.r, k.c, 0.10 * tw);
    softDot(gctx, x, y, k.r * 0.8, k.c, 0.12 * tw);
  }
}

// running toward the camera; k = how much of the run is left in him (1 running .. 0 standing)
function runPose(tt, k = 1) {
  const ph = tt * 12.5, sw = Math.sin(ph);
  let p = walkPlanted(tt, { speed: 12.5, lift: 74 * k, bob: 18 * k, stance: 46, sway: 0.055 * k });
  p.armL = { a: lerp(0.2, 0.42 + 0.3 * sw, k), b: lerp(0.12, 2.25 + 0.3 * sw, k) };
  p.armR = { a: lerp(0.2, 0.42 - 0.3 * sw, k), b: lerp(0.12, 2.25 - 0.3 * sw, k) };
  p.lean += 0.02 * k * Math.sin(ph * 0.5);
  return p;
}
// both hands on the sore spot under his right ribs (screen left), bent over it by k
function clutchPose(base, k, t) {
  if (k <= 0) return base;
  let p = JSON.parse(JSON.stringify(base));
  p.lean = lerp(p.lean, -0.17, k);
  p.hipY = lerp(p.hipY, -212, k);
  const q = ikReach(ikReach(p, 'L', [-78 + 3 * Math.sin(t * 9), p.hipY - 78], -1), 'R', [-30, p.hipY - 52], -1);
  return lerpPose(base, Object.assign(q, { lean: p.lean, hipY: p.hipY }), k);
}
// the sore spot in world coords for a hero state
function sorePt(st) { const r = rig(st.pose); return toWorld(st, r.U(-82, -74)); }

// the bib on his chest, and the row of stitches the needle leaves (drawn in charLayer's post: camera space -> rig space)
function runnerPost(n) {
  return (c, r, st) => {
    c.save(); c.translate(st.x, st.y); c.scale(st.s, st.s); c.translate(r.P[0], r.P[1]); c.rotate(r.lean);
    rrect(c, -50, -128, 100, 84, 8); c.fillStyle = '#FBF7EA'; c.fill();
    c.lineWidth = 3; c.strokeStyle = '#B9B4A8'; c.stroke();
    for (const [x, y] of [[-42, -120], [42, -120], [-42, -52], [42, -52]]) circle(c, x, y, 3.5, '#8A90B8');
    c.font = '400 58px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#1A1C2C'; c.fillText('12', 0, -83);
    // stitches down his side
    for (let i = 0; i < Math.floor(n); i++) {
      const y = -112 + i * 22, x = -70 - (i % 2) * 2;
      c.lineCap = 'round'; c.lineWidth = 5; c.strokeStyle = '#FFFFFF';
      c.beginPath(); c.moveTo(x - 9, y - 7); c.lineTo(x + 9, y + 7); c.moveTo(x + 9, y - 7); c.lineTo(x - 9, y + 7); c.stroke();
    }
    c.restore();
  };
}

// a giant sewing needle whose point sits `d` world units short of S, coming in along angle `a`; thread trails from its eye
function bigNeedle(S, d, a, t, k = 1, sc = 1) {
  if (k <= 0) return;
  const ux = Math.cos(a), uy = Math.sin(a), L = 500 * sc, w = 15 * sc;
  const tip = [S[0] - ux * d, S[1] - uy * d], back = [tip[0] - ux * L, tip[1] - uy * L];
  const nx = -uy, ny = ux;
  both((c, g) => {
    c.save(); c.globalAlpha = k * (g ? 0.5 : 1);
    // thread from the eye, snaking off toward the top left
    c.beginPath();
    const e = [back[0] + ux * 44 * sc, back[1] + uy * 44 * sc];
    c.moveTo(e[0], e[1]);
    for (let i = 1; i <= 20; i++) {
      const u = i / 20;
      c.lineTo(e[0] - ux * 620 * u * sc + nx * 46 * sc * Math.sin(u * 9 - t * 7) * u, e[1] - uy * 620 * u * sc + ny * 46 * sc * Math.sin(u * 9 - t * 7) * u - 120 * u * u * sc);
    }
    c.lineWidth = (g ? 16 : 8) * sc; c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = g ? 'rgba(255,70,110,0.22)' : '#FF4A6E'; c.stroke();
    if (!g) {
      // the needle: a long tapered blade with an eye
      const gr = c.createLinearGradient(tip[0] + nx * w, tip[1] + ny * w, tip[0] - nx * w, tip[1] - ny * w);
      gr.addColorStop(0, '#8E97B8'); gr.addColorStop(0.45, '#F6F9FF'); gr.addColorStop(1, '#AEB6D2');
      c.beginPath(); c.moveTo(tip[0], tip[1]);
      c.lineTo(tip[0] - ux * L * 0.3 + nx * w, tip[1] - uy * L * 0.3 + ny * w);
      c.lineTo(back[0] + nx * w * 1.15, back[1] + ny * w * 1.15);
      c.quadraticCurveTo(back[0] - ux * w * 1.6, back[1] - uy * w * 1.6, back[0] - nx * w * 1.15, back[1] - ny * w * 1.15);
      c.lineTo(tip[0] - ux * L * 0.3 - nx * w, tip[1] - uy * L * 0.3 - ny * w);
      c.closePath(); c.fillStyle = gr; c.fill();
      c.lineWidth = 3 * sc; c.strokeStyle = '#3A4064'; c.stroke();
      c.save(); c.translate(back[0] + ux * 44 * sc, back[1] + uy * 44 * sc); c.rotate(a);
      c.beginPath(); c.ellipse(0, 0, 26 * sc, 6.5 * sc, 0, 0, 7); c.fillStyle = '#141838'; c.fill(); c.restore();
    } else {
      line(c, tip[0], tip[1], back[0], back[1], w * 1.2, 'rgba(210,225,255,0.16)');
      softDot(c, tip[0], tip[1], 34 * sc, '#FFFFFF', 0.3);
    }
    c.restore();
  });
}

// red pain rings at a world point
function painRings(S, t, t0, k = 1, n = 3, col = '#FF4A5E') {
  if (k <= 0) return;
  for (let i = 0; i < n; i++) {
    const u = (((t - t0) * 1.5 + i / n) % 1 + 1) % 1;
    both((c, g) => {
      c.beginPath(); c.arc(S[0], S[1], 22 + 120 * u, 0, 7);
      c.lineWidth = (g ? 16 : 7) * (1 - u) + 1; c.strokeStyle = rgba(col, (g ? 0.5 : 0.85) * (1 - u) * k); c.stroke();
    });
  }
  both((c, g) => softDot(c, S[0], S[1], g ? 70 : 34, col, (g ? 0.5 : 0.75) * k));
}

// a comic burst with a word (screen space)
function owBurst(x, y, s, k, word = 'OW!', col = '#FF4A5E', rot = -0.12) {
  if (k <= 0) return;
  const sc = E.outBack(clamp(k), 2.6) * s;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  ctx.beginPath();
  for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2, r = i % 2 ? 150 : 96 + 14 * (i % 3); ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r * 1.15, Math.sin(a) * r * 0.82); }
  ctx.closePath(); ctx.fillStyle = '#FFF6DC'; ctx.fill(); ctx.lineWidth = 9; ctx.lineJoin = 'round'; ctx.strokeStyle = '#1A1030'; ctx.stroke();
  ctx.font = '400 104px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = col; ctx.fillText(word, 0, 6);
  ctx.restore();
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); softDot(gctx, x, y, 190 * sc, col, 0.35); gctx.restore();
}

// ---- the hook as one function of tt = seconds since frame 1 (negative = the last frames of the Short: the loop)
function hookState(tt) {
  const c = TLd.cues;
  const hit = ramp(tt, c.stab, c.stab + 0.16, E.outBack);                 // the big stab
  const run = 1 - ramp(tt, c.stab + 0.05, c.stab + 1.0, E.inOutCubic);    // he runs out of run
  const clutch = ramp(tt, c.stab + 0.02, c.stab + 0.34, E.outCubic);
  const bend = ramp(tt, c.ribs - 0.05, c.ribs + 0.5, E.inOutCubic);
  let pose = clutchPose(runPose(tt, run), clutch, tt);
  pose.lean -= 0.06 * bend; pose.hipY += 16 * bend;
  const st = { x: 540 + 10 * Math.sin(tt * 6.2) * run, y: 1570, s: 1.25, pose };
  // the small pokes before the stab: the needle is already at work on frame 1
  const pokes = [0.12, 0.62, 1.12].filter((p) => p < c.stab - 0.3);
  let poke = 0, nst = 0;
  for (const p of pokes) { poke = Math.max(poke, Math.exp(-Math.pow((tt - p) / 0.07, 2))); if (tt > p) nst++; }
  if (tt > c.stab) nst++;
  const up = ramp(tt, c.relax + 0.1, c.relax + 0.55, E.inOutCubic), ask = ramp(tt, c.guess - 0.1, c.guess + 0.2);
  pose.lean += 0.05 * bend * up; pose.hipY -= 8 * bend * up;
  let face = tt < c.stab ? lerpFace(FACES.grin, FACES.nervous, 0.55 * poke + 0.25 * clamp(nst / 3))
    : lerpFace(FACES.shock, FACES.nervous, ramp(tt, c.stab + 0.5, c.stab + 0.9));
  face = Object.assign({}, face, { lookX: tt < c.stab ? -0.5 * clamp(nst / 2) : -0.7, lookY: tt < c.stab ? 0.2 : 0.8 });
  face = lerpFace(lerpFace(face, FACES.annoyed, up), FACES.confused, ask);
  if (up > 0) face = Object.assign({}, face, { lookX: lerp(face.lookX, 0, up), lookY: lerp(face.lookY, -0.2, up) + 0.9 * ask, blink: 0.3 * up * (1 - ask) });
  st.face = face;
  st.headDX = -8 * hit * (1 - bend); st.headDY = 6 * hit + 4 * bend - 6 * up; st.headRot = -0.1 * clutch * (1 - 0.7 * up);
  // needle distance from the spot: hovering, poking, then in
  const hover = 120 + 26 * Math.sin(tt * 5);
  const d = tt < c.stab - 0.25 ? hover * (1 - poke) - 6 * poke
    : lerp(hover, -34, ramp(tt, c.stab - 0.25, c.stab, E.inCubic)) + 140 * ramp(tt, c.stab + 0.5, c.stab + 1.1, E.inOutCubic);
  const gone = 1 - ramp(tt, c.ribs - 0.3, c.ribs + 0.1);
  return { st, hit, run, clutch, bend, poke, nst, d, gone, dist: tt < c.stab ? tt : c.stab + (1 - Math.exp(-(tt - c.stab) * 2.2)) / 2.2 };
}
function hookCam(tt) {
  const c = TLd.cues;
  const k = camKeys(tt, [[-1, 520, 1130, 1.5], [0, 520, 1130, 1.5], [1.0, 540, 1150, 1.22], [c.stab - 0.1, 540, 1150, 1.2], [c.stab + 0.14, 500, 1170, 1.42],
    [c.ribs - 0.1, 510, 1170, 1.36], [c.ribs + 0.6, 480, 1190, 1.62], [c.relax, 480, 1195, 1.68], [c.relax + 0.7, 520, 1120, 1.36], [c.guess + 0.25, 520, 1120, 1.34],
    [TLd.shots[2].start, 452, 1212, 3.2]]);
  const sh = shake(tt, 16 * Math.exp(-Math.max(0, tt - c.stab) * 5) * (tt > c.stab ? 1 : 0), 30, 3);
  k.x += sh[0]; k.y += sh[1];
  return k;
}
function hookDraw(tt, t) {
  const c = TLd.cues, h = hookState(tt), cam = hookCam(tt);
  raceBack(cam, tt, { banner: 1 / (1 + 0.16 * Math.max(-1, h.dist)), dist: h.dist });
  charLayer(cam, h.st, t, { pal: RUNPAL, ambient: 0.1, post: runnerPost(h.nst) });
  applyCam(cam);
  const S = sorePt(h.st);
  bigNeedle(S, h.d, 0.62, tt, h.gone, 1);
  if (tt > c.stab) painRings(S, tt, c.stab, clamp((tt - c.stab) * 6) * (0.55 + 0.45 * h.bend));
  // small sparks on each poke
  if (h.poke > 0.2) both((cc, g) => softDot(cc, S[0], S[1], g ? 44 : 22, '#FFFFFF', (g ? 0.35 : 0.7) * h.poke));
  screenSpace();
  const P = toScreen(cam, S[0], S[1]);
  shockLines(P[0], P[1], 90, inv(c.stab, c.stab + 0.4, tt), 12, '#FFFFFF', 4);
  owBurst(815, 700, 0.95, inv(c.stab + 0.02, c.stab + 0.22, tt) * (1 - ramp(tt, c.ribs - 0.25, c.ribs)), 'OW!');
  return { h, cam, S: P };
}
