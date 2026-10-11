// Why Do Nails on a CHALKBOARD Make You Cringe? Short: the listening test. A sound booth, the hero behind a desk in
// headphones, a clip on his finger wired to a skin meter, a lit sign that says what he is hearing, a score paddle.
//   initLab()                    paints the booth's wall once
//   labRoom(cam, t)              the wall of foam
//   labSign(t, o)                the lit sign: a scraped board, or MODERN MUSIC (it flips)
//   labHero(cam, t, A)           him, from a description A; returns points in world coords
//   labDesk(t), labMeter(t, o)   the desk in front of him; the skin meter on it (a needle, a lamp, a spring)
//   labPaddle(c, x, y, s, o)     the score paddle: a red face that hates it, an amber one that does not mind
//   labBrain(x, y, s, t, k)      his brain in a thought bubble, in a beret, clapping
'use strict';

const LAB = { hx: 560, hy: 1461, hs: 1.3, deskY: 1150, meter: [262, 968] };
let LAB_IMG = null;
function labPaintRoom() {
  const cv = mkCanvas(W, H), c = cv.getContext('2d');
  const g = c.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#2A3466'); g.addColorStop(0.6, '#1B2248'); g.addColorStop(1, '#10142E');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  const rng = mulberry32(12), TS = 120;
  for (let y = -30; y < H; y += TS) for (let x = -30; x < W + TS; x += TS) {   // foam tiles: ridges one way, then the other
    const v = rng(), hz = ((x + y) / TS) % 2 === 0 || rng() > 0.5;
    rrect(c, x + 4, y + 4, TS - 8, TS - 8, 10); c.fillStyle = `rgba(120,140,255,${0.03 + 0.05 * v})`; c.fill();
    for (let i = 0; i < 4; i++) { if (hz) rrect(c, x + 12, y + 14 + i * 26, TS - 24, 11, 5); else rrect(c, x + 14 + i * 26, y + 12, 11, TS - 24, 5); c.fillStyle = 'rgba(6,8,30,0.34)'; c.fill(); }
  }
  return cv;
}
function initLab() { LAB_IMG = labPaintRoom(); }
function labRoom(cam, t) {
  screenSpace(); ctx.fillStyle = '#10142E'; ctx.fillRect(0, 0, W, H);
  applyCam({ x: 540 + (cam.x - 540) * 0.8, y: 960 + (cam.y - 960) * 0.8, zoom: 1.06 + 0.5 * (cam.zoom - 1), rot: 0 });
  ctx.drawImage(LAB_IMG, 0, 0);
  applyCam(cam);
  softDot(gctx, 80, 300, 380, '#8FB8FF', 0.14);
}

// two notes joined by a beam (any context, its own units)
function labNotes(c, x, y, s, col) {
  c.save(); c.translate(x, y); c.scale(s, s);
  ellipse(c, -16, 20, 11, 8, col, -0.4); ellipse(c, 18, 12, 11, 8, col, -0.4);
  line(c, -6, 18, -6, -22, 5, col); line(c, 28, 10, 28, -30, 5, col); line(c, -6, -22, 28, -30, 9, col);
  c.restore();
}
// the lit sign on the wall (world units, camera applied). o: {k: pop-in, flip 0..1 (0 = a scraped board, 1 = MODERN MUSIC)}
function labSign(t, o = {}) {
  const k = clamp(o.k === undefined ? 1 : o.k);
  if (k <= 0.01) return;
  const x = 420, y = 560, w = 440, h = 168, fl = clamp(o.flip || 0), side = fl < 0.5 ? 0 : 1, sy = Math.max(0.04, Math.abs(Math.cos(fl * Math.PI))) * E.outBack(k, 1.6);
  for (const s of [-1, 1]) line(ctx, x + s * 150, y - h / 2 - 150, x + s * 150, y - h / 2, 7, '#0B0F2A');
  ctx.save(); ctx.translate(x, y); ctx.scale(1, sy);
  rrect(ctx, -w / 2 - 12, -h / 2 - 12, w + 24, h + 24, 26); ctx.fillStyle = '#0B0F2A'; ctx.fill();
  rrect(ctx, -w / 2, -h / 2, w, h, 18); ctx.fillStyle = side ? '#2B1E5C' : '#1F2B55'; ctx.fill();
  paint(() => {
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '900 25px Montserrat'; ctx.fillStyle = side ? '#C8A8FF' : '#8FB8FF'; ctx.fillText('NOW PLAYING', 0, -h / 2 + 30);
    if (side) {
      ctx.font = '400 62px Anton'; ctx.fillStyle = '#FFFFFF'; ctx.fillText('MODERN MUSIC', 0, 24);
      labNotes(ctx, -190, 20, 0.72, '#C8A8FF'); labNotes(ctx, 186, 20, 0.72, '#C8A8FF');
    } else {   // a little blackboard with four scratches down it
      rrect(ctx, -98, -34, 196, 104, 8); ctx.fillStyle = '#A26A38'; ctx.fill();
      rrect(ctx, -90, -26, 180, 88, 4); ctx.fillStyle = '#215241'; ctx.fill();
      for (let i = 0; i < 4; i++) line(ctx, -22 + i * 14, -16, -24 + i * 14, 50, 3.4, '#EEF0E6');
      ctx.font = '400 60px Anton'; ctx.fillStyle = '#FF5A6E'; ctx.fillText('?', -150, 22); ctx.fillText('?', 150, 22);
    }
  });
  ctx.restore();
  gctx.save(); gctx.translate(x, y); gctx.scale(1, sy); rrect(gctx, -w / 2, -h / 2, w, h, 18); gctx.fillStyle = side ? 'rgba(160,110,255,0.42)' : 'rgba(90,120,255,0.2)'; gctx.fill(); gctx.restore();
}

// the score paddle (any context; x, y = the middle of its disc). o: {flip 0..1: 0 = hates it (red), 1 = not bad (amber)}
function labPaddle(c, x, y, s, o = {}) {
  const fl = clamp(o.flip || 0), side = fl < 0.5 ? 0 : 1, sx = Math.max(0.05, Math.abs(Math.cos(fl * Math.PI)));
  c.save(); c.translate(x, y); c.scale(s, s);
  line(c, 0, 40, -8, 118, 12, '#C99A62');
  c.save(); c.scale(sx, 1);
  circle(c, 0, 0, 54, '#F6F1E4'); circle(c, 0, 0, 46, side ? '#FFD447' : '#FF5A6E');
  paint(() => {
    c.lineCap = 'round'; c.strokeStyle = '#3A1420';
    if (side) {   // not bad, actually
      circle(c, -16, -8, 5.5, '#3A1420'); circle(c, 16, -8, 5.5, '#3A1420');
      line(c, -26, -24, -8, -22, 5, '#3A1420'); line(c, 8, -28, 26, -22, 5, '#3A1420');
      c.beginPath(); c.moveTo(-15, 18); c.quadraticCurveTo(2, 24, 17, 12); c.lineWidth = 5.5; c.stroke();
    } else {      // make it stop
      for (const q of [-1, 1]) { line(c, q * 16 - 7, -15, q * 16 + 7, -3, 5.5, '#3A1420'); line(c, q * 16 + 7, -15, q * 16 - 7, -3, 5.5, '#3A1420'); }
      c.beginPath(); c.moveTo(-18, 22); c.lineTo(-9, 14); c.lineTo(0, 22); c.lineTo(9, 14); c.lineTo(18, 22); c.lineWidth = 5.5; c.lineJoin = 'round'; c.stroke();
    }
  });
  c.restore(); c.restore();
}

// the desk he sits behind (world units, camera applied): draw it AFTER him
function labDesk(t) {
  ctx.fillStyle = '#9A7450'; ctx.fillRect(-200, LAB.deskY, 1480, 54);
  ctx.fillStyle = '#5A3F2E'; ctx.fillRect(-200, LAB.deskY + 54, 1480, 16);
  ctx.fillStyle = '#2E2330'; ctx.fillRect(-200, LAB.deskY + 70, 1480, 900);
  paint(() => { for (let x = -100; x < 1280; x += 230) line(ctx, x, LAB.deskY + 14, x + 150, LAB.deskY + 14, 5, 'rgba(255,230,190,0.16)'); });
}
// the skin meter (world units, camera applied). o: {level 0..1 (the needle), tremble, lamp 0..1, pop 0..1 (its glass
// is gone and the needle is out on a spring), k: pop-in}
function labMeter(t, o = {}) {
  const [x, y] = LAB.meter, lv = clamp(o.level || 0), pop = clamp(o.pop || 0), k = clamp(o.k === undefined ? 1 : o.k);
  if (k <= 0.01) return;
  const q = E.outBack(k, 1.6);
  for (const c of [ctx, gctx]) { c.save(); c.translate(x, LAB.deskY); c.scale(q, q); c.translate(-x, -LAB.deskY); }
  rrect(ctx, x - 40, y + 96, 80, LAB.deskY - y - 96 + 4, 8); ctx.fillStyle = '#1B2040'; ctx.fill();
  rrect(ctx, x - 150, y - 112, 300, 216, 30); ctx.fillStyle = '#20264C'; ctx.fill();
  rrect(ctx, x - 136, y - 98, 272, 188, 22); ctx.fillStyle = '#343D74'; ctx.fill();
  rrect(ctx, x - 118, y - 84, 236, 132, 16); ctx.fillStyle = '#F4EEDC'; ctx.fill();
  const piv = [x, y + 34], ang = -Math.PI / 2 + lerp(-1.05, 1.05, lv) + (o.tremble || 0) * 0.07 * Math.sin(t * 47);
  paint(() => {
    ctx.lineCap = 'butt';
    for (const [a0, a1, col] of [[-1.15, -0.2, '#34C27A'], [-0.2, 0.45, '#FFC43A'], [0.45, 1.15, '#F0384E']]) { ctx.beginPath(); ctx.arc(piv[0], piv[1], 96, -Math.PI / 2 + a0, -Math.PI / 2 + a1); ctx.lineWidth = 17; ctx.strokeStyle = col; ctx.stroke(); }
    ctx.lineCap = 'round';
    ctx.font = '900 27px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#C9D4FF'; ctx.fillText('SKIN SENSOR', x - 16, y + 70);
  });
  if (pop < 0.02) { paint(() => line(ctx, piv[0], piv[1], piv[0] + Math.cos(ang) * 88, piv[1] + Math.sin(ang) * 88, 7, '#1A1C2C')); circle(ctx, piv[0], piv[1], 11, '#1A1C2C'); }
  else {   // the needle has left, on a spring
    const P = [], n = 26, wob = Math.exp(-(o.popT || 0) * 2.2) * Math.sin((o.popT || 0) * 19), tip = [x + 150 * E.outBack(pop, 1.6) + 60 * wob, y - 40 - 190 * E.outBack(pop, 2.2)];
    for (let i = 0; i <= n; i++) { const u = i / n, bx = lerp(piv[0], tip[0], u), by = lerp(piv[1], tip[1], u); P.push([bx + (i % 2 ? 20 : -20) * Math.sin(Math.PI * u) + 40 * wob * u * u, by]); }
    poly(ctx, P, 7, '#AEB6D8');
    paint(() => line(ctx, tip[0], tip[1], tip[0] + 70 * Math.cos(-1.1 + wob), tip[1] + 70 * Math.sin(-1.1 + wob), 7, '#1A1C2C'));
    circle(ctx, tip[0], tip[1], 12, '#1A1C2C');
    paint(() => { for (const [dx, dy, a] of [[-70, -40, 0.5], [-20, 10, -0.6], [50, -30, 0.2], [84, 24, 1.1]]) { ctx.save(); ctx.translate(x + dx, y - 16 + dy); ctx.rotate(a); line(ctx, -22, 0, 22, 0, 4, 'rgba(26,28,44,0.75)'); line(ctx, 0, -14, 6, 14, 3, 'rgba(26,28,44,0.6)'); ctx.restore(); } });
  }
  const lamp = clamp(o.lamp || 0), on = lamp * (0.5 + 0.5 * Math.sin(t * 22));
  circle(ctx, x + 112, y + 70, 15, mixH('#5A1420', '#FF4D5E', on));
  softDot(gctx, x + 112, y + 70, 90, '#FF3A50', 0.9 * on);
  ctx.restore(); gctx.restore();
}

// ---------------------------------------------------------------- the hero at the desk
function labHeadLocal(st, lx, ly) {
  const r = rig(st.pose), a = r.lean + (st.headRot || 0), cs = Math.cos(a), sn = Math.sin(a);
  return [r.head[0] + (st.headDX || 0) + lx * cs - ly * sn, r.head[1] + (st.headDY || 0) + lx * sn + ly * cs];
}
function labHeadPt(st, lx, ly) { const p = labHeadLocal(st, lx, ly); return [st.x + p[0] * st.s, st.y + p[1] * st.s]; }
function labSt(A = {}) {
  let p = { hipY: -222 + (A.bob || 0), lean: A.lean || 0, armL: { a: 0.16, b: 0.1 }, armR: { a: 0.16, b: 0.1 }, legL: { a: 0.07, b: 0 }, legR: { a: 0.07, b: 0 }, hand: 'fist', feetFront: 0 };
  p = ikReach(p, 'L', [(360 - LAB.hx) / LAB.hs, (LAB.deskY - 22 - LAB.hy) / LAB.hs], -1);          // his left hand flat on the desk, the clip on a finger
  p = armAt(p, 'R', [132, -292 + (A.padUp || 0) * -6], [150 + 8 * (A.padUp || 0), -372 - 34 * (A.padUp || 0)]);   // his right hand holds the paddle up
  return { x: LAB.hx + (A.dx || 0), y: LAB.hy, s: LAB.hs, pose: p, face: A.face || FACES.calm, headDX: A.headDX || 0, headDY: A.headDY || 0, headRot: A.headRot || 0, frizz: A.frizz || 0, seed: 4, noLegs: true };
}
// A: {face, padUp 0..1, paddle: {flip}, zig 0..1 (the screech leaving the headphones), notes 0..1 (music instead),
//   frizz, headDX/DY/Rot, bob, sweat 0..1}
// Returns {st, r, head, top, handL, pad} in world coords
function labHero(cam, t, A = {}) {
  const st = labSt(A), pal = PAL, out = {};
  const r = charLayer(cam, st, t, {
    pal, ambient: 0.06,
    post: (lc, rr, s2) => {
      lc.save(); lc.translate(s2.x, s2.y); lc.scale(s2.s, s2.s);
      // headphones
      const hd = rig(s2.pose);
      lc.save(); lc.translate(hd.head[0] + (s2.headDX || 0), hd.head[1] + (s2.headDY || 0)); lc.rotate(hd.lean + (s2.headRot || 0));
      actor(() => {
        lc.beginPath(); lc.moveTo(-72, -8); lc.bezierCurveTo(-80, -112, 80, -112, 72, -8); lc.lineWidth = 13; lc.lineCap = 'round'; lc.strokeStyle = '#2B2F45'; lc.stroke();
        for (const s of [-1, 1]) { rrect(lc, s * 76 - 17, -30, 34, 66, 14); lc.fillStyle = '#3D4466'; lc.fill(); }
      });
      paint(() => { for (const s of [-1, 1]) { rrect(lc, s * 76 - 8, -18, 16, 42, 7); lc.fillStyle = '#FF5A6E'; lc.fill(); } });
      lc.restore();
      // the paddle in his right hand, and the hand again in front of its stick
      const wr = rr.wrR, d = rr.armDirR, hx = wr[0] + d[0] * 14, hy = wr[1] + d[1] * 14;
      actor(() => labPaddle(lc, hx + 6, hy - 112, 1.0, A.paddle || {}));
      circle(lc, hx, hy, 21.5, pal.skin);
      paint(() => { for (let i = 0; i < 3; i++) line(lc, hx - 13, hy - 9 + i * 8, hx + 13, hy - 11 + i * 8, 2, 'rgba(170,88,60,0.45)'); });
      out.padLocal = [hx + 6, hy - 112];
      // the clip on his left hand
      const wl = rr.wrL, dl = rr.armDirL, lx = wl[0] + dl[0] * 14, ly = wl[1] + dl[1] * 14;
      line(lc, lx - 4, ly + 2, lx - 30, ly + 8, 10, pal.skin);
      rrect(lc, lx - 44, ly - 3, 22, 22, 5); lc.fillStyle = '#C9D4FF'; lc.fill();
      out.clipLocal = [lx - 44, ly + 8];
      lc.restore();
    },
  });
  const P = (lx, ly) => labHeadPt(st, lx, ly), W2 = (p) => [st.x + p[0] * st.s, st.y + p[1] * st.s];
  out.st = st; out.r = r; out.head = P(0, 0); out.top = P(0, -84); out.earL = P(-80, 2); out.earR = P(80, 2); out.temple = P(-52, -30); out.pad = W2(out.padLocal); out.clip = W2(out.clipLocal);
  return out;
}
// the wire from the clip to the meter (world units, camera applied)
function labWire(a) {
  const b = [LAB.meter[0] + 60, LAB.deskY - 6], P = [];
  for (let i = 0; i <= 20; i++) { const u = i / 20; P.push([lerp(a[0], b[0], u), lerp(a[1], b[1], u) + 26 * Math.sin(Math.PI * u) * (1 - 2 * Math.abs(u - 0.5)) + 5 * Math.sin(u * 22)]); }
  poly(ctx, P, 5, '#C9D4FF');
}
// what leaves the headphones (world units, camera applied): jagged screech marks, or notes
function labSound(t, H, zig, notes) {
  const f = Math.floor(t * 30);
  for (const [E0, s] of [[H.earL, -1], [H.earR, 1]]) {
    if (zig > 0.01) {
      const rng = mulberry32(300 + f * 5 + (s > 0 ? 9 : 0));
      for (let i = 0; i < 4; i++) {
        const an = (s > 0 ? 0 : Math.PI) + (i - 1.5) * 0.42, r0 = 34 + rng() * 8, r1 = r0 + 34 + rng() * 40;
        const J = jagged(rng, E0[0] + Math.cos(an) * r0, E0[1] + Math.sin(an) * r0, E0[0] + Math.cos(an) * r1, E0[1] + Math.sin(an) * r1, 18, 2);
        poly(ctx, J, 5, rgba('#FFF3B0', 0.95 * zig)); poly(gctx, J, 11, rgba('#FF5A6E', 0.5 * zig));
      }
    }
    if (notes > 0.01) for (let i = 0; i < 3; i++) {
      const p = (t * 0.7 + i / 3 + (s > 0 ? 0.2 : 0)) % 1, x = E0[0] + s * (44 + 90 * p) + 12 * Math.sin(p * 9 + i), y = E0[1] - 20 - 130 * p;
      paint(() => labNotes(ctx, x, y, 0.6 + 0.3 * p, rgba('#C8A8FF', notes * Math.sin(Math.PI * p))));
    }
  }
}
// his brain, pleased with itself, in a thought bubble (screen space): a beret, two clapping hands, BRAVO!
function labBrain(x, y, s, t, k, tail) {
  if (k <= 0.01) return;
  const q = E.outBack(clamp(k), 1.8) * s, clap = Math.abs(Math.sin(t * 13));
  screenSpace();
  for (const [grow, col] of [[10, '#10142E'], [0, '#F6F8FF']]) {
    ctx.save(); ctx.translate(x, y); ctx.scale(q, q);
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; circle(ctx, Math.cos(a) * 128, Math.sin(a) * 104, 44 + grow, col); }
    ellipse(ctx, 0, 0, 140 + grow, 112 + grow, col);
    ctx.restore();
    if (tail) for (let i = 0; i < 3; i++) { const f = 0.34 + i * 0.24; circle(ctx, lerp(x, tail[0], f), lerp(y + 96 * q, tail[1], f), (22 - i * 6) * q + grow, col); }
  }
  gctx.save(); gctx.translate(x, y); gctx.scale(q, q); ellipse(gctx, 0, 0, 170, 140, '#000000'); gctx.restore();
  ctx.save(); ctx.translate(x, y - 6); ctx.scale(q, q);
  actor(() => {
    for (const [bx, by, rx, ry] of [[-34, -8, 46, 44], [34, -8, 46, 44], [0, -22, 52, 40], [0, 14, 60, 34]]) ellipse(ctx, bx, by, rx, ry, '#F5A3B7');
    ellipse(ctx, 8, -58, 62, 20, '#2B2F45', -0.12); circle(ctx, 16, -78, 8, '#2B2F45');                       // the beret
    for (const sd of [-1, 1]) { const hx = sd * (16 + 30 * clap), hy = 62; line(ctx, sd * 62, 30, hx, hy, 11, '#E48AA4'); circle(ctx, hx, hy, 14, '#F5A3B7'); }
  });
  paint(() => {
    ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(200,96,130,0.6)'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(0, -56); ctx.quadraticCurveTo(-6, -10, 0, 44); ctx.stroke();
    for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sd * 24 - 11, -4); ctx.quadraticCurveTo(sd * 24, -16, sd * 24 + 11, -4); ctx.lineWidth = 5.5; ctx.strokeStyle = '#5A1522'; ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(-14, 16); ctx.quadraticCurveTo(0, 30, 14, 16); ctx.closePath(); ctx.fillStyle = '#5A1522'; ctx.fill();
  });
  ctx.restore();
}
