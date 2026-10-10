// Inside a sunbeam: light as ribbons (a wave with a face at its front: red long and lazy, blue short and twitchy), the
// air as molecules (two little balls with an eye each), and the dark air they travel through.
// A ribbon's wave is fixed in the world: its body passes through the points its head passed, like a snake.
'use strict';

const HUE = { R: '#FF3A3A', O: '#FF9A3C', Y: '#FFE04A', G: '#4DE07A', B: '#3F9BFF', V: '#A070FF', W: '#FFFFFF' };
// wavelength and height of each colour's wave (px): red long and lazy, violet short and quick
const WAVES = { R: [300, 62], O: [252, 40], Y: [214, 36], G: [178, 33], B: [112, 27], V: [92, 24], W: [300, 0] };

// a straight path down the screen at x (arclength = world y)
const downPath = (x) => (s) => [x, s, Math.PI / 2];
// a path along a polyline (arclength from its first point); beyond the ends it runs straight on
function polyPath(pts) {
  const acc = polyLen(pts), L = acc[acc.length - 1];
  const f = (s) => {
    if (s <= 0) { const a = Math.atan2(pts[1][1] - pts[0][1], pts[1][0] - pts[0][0]); return [pts[0][0] + Math.cos(a) * s, pts[0][1] + Math.sin(a) * s, a]; }
    if (s >= L) { const n = pts.length, a = Math.atan2(pts[n - 1][1] - pts[n - 2][1], pts[n - 1][0] - pts[n - 2][0]); return [pts[n - 1][0] + Math.cos(a) * (s - L), pts[n - 1][1] + Math.sin(a) * (s - L), a]; }
    return polyAt(pts, acc, s);
  };
  f.acc = acc; f.len = L;
  return f;
}
// the point of a ribbon at arclength s (the wave is a function of s, so it stays where it is in the world)
function ribbonAt(path, s, lam, amp, ph = 0) {
  const [x, y, a] = path(s), off = amp * Math.sin((2 * Math.PI * s) / lam + ph);
  return [x - Math.sin(a) * off, y + Math.cos(a) * off, a];
}
// a ribbon of light. o: {col, lam, amp, ph, len (body), w (width at the head), face: 'lazy' | 'twitchy' | 'dot' | 'ouch' | null,
// t, twitch 0..1 (a shiver along the body), a (alpha), look: [dx, dy], glow, blink}
function lightRibbon(path, sHead, o) {
  const col = o.col, lam = o.lam, len = o.len || 420, w = o.w || 24, a = o.a === undefined ? 1 : o.a, tw = o.twitch || 0, t = o.t || 0;
  if (a <= 0.01) return null;
  const amp = o.amp, n = Math.max(8, Math.ceil(len / 7)), P = [];
  for (let i = 0; i <= n; i++) {
    const u = (i / n) * len, s = sHead - u;
    const p = ribbonAt(path, s, lam, amp, o.ph || 0);
    if (tw > 0) { const j = tw * 7 * Math.sin(t * 46 + u * 0.21) * Math.min(1, u / 30); p[0] += -Math.sin(p[2]) * j; p[1] += Math.cos(p[2]) * j; }
    P.push(p);
  }
  paint(() => {
    if (o.edge) {
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (let i = n; i >= 1; i--) { ctx.beginPath(); ctx.moveTo(P[i][0], P[i][1]); ctx.lineTo(P[i - 1][0], P[i - 1][1]); ctx.lineWidth = w * (1 - 0.72 * (i / n)) + 9; ctx.strokeStyle = rgba(o.edge, 0.8 * a); ctx.stroke(); }
      circle(ctx, P[0][0], P[0][1], w * 0.98 + 5, rgba(o.edge, 0.8 * a));
    }
    for (const [c, k, al] of [[gctx, 2.1, 0.5 * (o.glow === undefined ? 1 : o.glow)], [ctx, 1, 1]]) {
      c.lineCap = 'round'; c.lineJoin = 'round';
      for (let i = n; i >= 1; i--) {
        const ww = w * (1 - 0.72 * (i / n)) * k;
        c.beginPath(); c.moveTo(P[i][0], P[i][1]); c.lineTo(P[i - 1][0], P[i - 1][1]);
        c.lineWidth = ww; c.strokeStyle = rgba(col, a * al * (c === ctx ? 1 - (o.edge ? 0.15 : 0.55) * (i / n) : 1 - 0.7 * (i / n))); c.stroke();
      }
    }
    // a bright core along the front half
    ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]);
    for (let i = 1; i <= n / 2; i++) ctx.lineTo(P[i][0], P[i][1]);
    ctx.lineWidth = w * 0.22; ctx.strokeStyle = rgba('#FFFFFF', (o.core === undefined ? 0.42 : o.core) * a); ctx.stroke();
  });
  const H = P[0];
  if (o.face) ribbonFace(H[0], H[1], w * 0.98, col, o.face, t, a, o.look || [Math.cos(H[2]), Math.sin(H[2])], o.blink || 0);
  return H;
}
function ribbonFace(x, y, r, col, kind, t, a, look, blink) {
  const c = ctx;
  paint(() => {
    circle(c, x, y, r, rgba(col, a)); softDot(gctx, x, y, r * 2.6, col, 0.55 * a);
    c.globalAlpha = a;
    const ex = r * 0.4, ey = -r * 0.12, er = r * 0.34;
    const jx = kind === 'twitchy' ? 1.6 * Math.sin(t * 61) : 0, jy = kind === 'twitchy' ? 1.6 * Math.cos(t * 53) : 0;
    for (const s of [-1, 1]) {
      if (kind === 'ouch') {                                        // eyes screwed shut: > <
        c.lineWidth = r * 0.13; c.strokeStyle = '#15132A'; c.lineCap = 'round';
        c.beginPath(); c.moveTo(x + s * (ex + er * 0.7), y + ey - er * 0.6); c.lineTo(x + s * (ex - er * 0.5), y + ey); c.lineTo(x + s * (ex + er * 0.7), y + ey + er * 0.6); c.stroke();
        continue;
      }
      circle(c, x + s * ex, y + ey, er * (kind === 'twitchy' ? 1.18 : 1), '#FFFFFF');
      const pr = er * (kind === 'twitchy' ? 0.34 : 0.56);
      circle(c, x + s * ex + look[0] * er * 0.36 + jx, y + ey + look[1] * er * 0.36 + jy, pr, '#15132A');
      const lid = kind === 'lazy' ? Math.max(0.56, blink) : blink;
      if (lid > 0.02) {                                             // an eyelid in the ribbon's own colour
        c.save(); c.beginPath(); c.arc(x + s * ex, y + ey, er * 1.05, 0, 7); c.clip();
        c.fillStyle = col; c.fillRect(x + s * ex - er * 1.2, y + ey - er * 1.2, er * 2.4, er * 2.4 * lid);
        c.restore();
        line(c, x + s * ex - er, y + ey - er * 1.2 + er * 2.4 * lid, x + s * ex + er, y + ey - er * 1.2 + er * 2.4 * lid, r * 0.09, '#15132A');
      }
    }
    c.lineCap = 'round'; c.strokeStyle = '#15132A'; c.lineWidth = r * 0.12;
    c.beginPath();
    if (kind === 'lazy') { c.moveTo(x - r * 0.26, y + r * 0.46); c.quadraticCurveTo(x + r * 0.02, y + r * 0.64, x + r * 0.34, y + r * 0.4); }
    else if (kind === 'twitchy') { c.moveTo(x - r * 0.34, y + r * 0.5); c.lineTo(x - r * 0.17, y + r * 0.4); c.lineTo(x, y + r * 0.52); c.lineTo(x + r * 0.17, y + r * 0.4); c.lineTo(x + r * 0.34, y + r * 0.5); }
    else if (kind === 'ouch') { c.ellipse(x, y + r * 0.5, r * 0.2, r * 0.17, 0, 0, 7); }
    else { c.moveTo(x - r * 0.2, y + r * 0.46); c.quadraticCurveTo(x, y + r * 0.58, x + r * 0.2, y + r * 0.46); }
    c.stroke();
    c.globalAlpha = 1;
  });
}

// an air molecule: two balls, an eye on each. o: {rot, look: [dx, dy], hit 0..1 (it has just been smacked: squashed, eyes
// in spirals), glow 0..1 (it keeps shining blue), blink, shrug 0..1, a, col}
function airMol(x, y, s, t, o = {}) {
  const c = ctx, hit = clamp(o.hit || 0), a = o.a === undefined ? 1 : o.a;
  if (a <= 0.01) return;
  const col = o.col || '#B9C6F6', sh = '#7C8DD2';
  const rot = (o.rot || 0) + 0.5 * hit * Math.sin(t * 40), sq = 1 - 0.22 * hit;
  if (o.glow > 0.01) softDot(gctx, x, y, 150 * s * (0.8 + 0.2 * o.glow), '#3F9BFF', 0.75 * o.glow * a);
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s * (2 - sq), s * sq); c.globalAlpha = a;
  actor(() => { circle(c, -25, 0, 34, sh); circle(c, 25, 0, 34, col); circle(c, -25, 0, 30, col); });
  paint(() => {
    ellipse(c, -37, -16, 9, 6, 'rgba(255,255,255,0.6)', -0.5); ellipse(c, 13, -17, 9, 6, 'rgba(255,255,255,0.6)', -0.5);
    line(c, 0, -22, 0, 22, 3, 'rgba(90,105,180,0.55)');          // where the two atoms meet
    const lk = o.look || [0, 0];
    for (const sd of [-1, 1]) {
      const ex = sd * 15, ey = -3;
      if (hit > 0.3) {                                              // a spiral for an eye
        c.beginPath();
        for (let k = 0; k <= 22; k++) { const an = k * 0.55 + t * 14 * sd, rr = 1 + k * 0.36; c.lineTo(ex + Math.cos(an) * rr, ey + Math.sin(an) * rr); }
        c.lineWidth = 2.6; c.strokeStyle = '#27305A'; c.stroke();
      } else if ((o.blink || 0) > 0.9) line(c, ex - 7, ey, ex + 7, ey, 3.2, '#27305A');
      else { circle(c, ex, ey, 8.6, '#FFFFFF'); circle(c, ex + lk[0] * 3.2, ey + lk[1] * 3.2, 4.3, '#1A2046'); circle(c, ex + lk[0] * 3.2 - 1.3, ey + lk[1] * 3.2 - 1.5, 1.4, '#FFFFFF'); }
    }
    c.lineCap = 'round'; c.lineWidth = 3; c.strokeStyle = '#27305A'; c.beginPath();
    if (hit > 0.3) { c.moveTo(-9, 15); c.bezierCurveTo(-4, 9, 1, 21, 5, 15); c.lineTo(9, 13); }
    else if ((o.shrug || 0) > 0.5) { c.moveTo(-6, 15); c.lineTo(6, 14); }
    else { c.moveTo(-6, 13); c.quadraticCurveTo(0, 18, 6, 13); }
    c.stroke();
  });
  c.restore();
}

// what a smack leaves: a ring, a star, rays of blue in every direction
function scatterBurst(x, y, t0, t, seed = 1, big = 1) {
  const d = t - t0;
  if (d < 0 || d > 0.75) return;
  const k = d / 0.75, rng = mulberry32(seed * 13 + 5);
  paint(() => {
    softDot(gctx, x, y, 190 * big * (0.6 + k), '#7FC0FF', 0.9 * (1 - k) * (1 - k));
    for (const [c, w, a] of [[ctx, 8 * (1 - k), 0.95], [gctx, 16 * (1 - k), 0.6]]) { c.beginPath(); c.arc(x, y, (34 + 210 * E.outCubic(k)) * big, 0, 7); c.lineWidth = w; c.strokeStyle = rgba('#8FC8FF', a * (1 - k)); c.stroke(); }
    for (let j = 0; j < 10; j++) {
      const a = (j / 10) * 6.283 + rng() * 0.5, r0 = (44 + 200 * E.outCubic(k) * (0.6 + 0.6 * rng())) * big, r1 = r0 + 54 * (1 - k) * big;
      for (const [c, w] of [[ctx, 7], [gctx, 15]]) line(c, x + Math.cos(a) * r0, y + Math.sin(a) * r0, x + Math.cos(a) * r1, y + Math.sin(a) * r1, w * (1 - k), rgba('#4FA4FF', 0.95 * (1 - k)));
    }
    if (d < 0.16) {
      ctx.save(); ctx.translate(x, y); const s = (0.7 + 4 * d) * big; ctx.scale(s, s); ctx.rotate(0.3);
      ctx.fillStyle = rgba('#FFFFFF', 1 - d / 0.16); ctx.beginPath();
      for (let j = 0; j < 16; j++) { const a = (j / 16) * 6.283, r = j % 2 ? 22 : 58; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
      ctx.closePath(); ctx.fill(); ctx.restore();
    }
  });
}

// the air, far off: dim pairs of dots drifting by on a grid that never ends (parallax p)
function airFar(cam, t, p = 0.45, a = 1) {
  const c = ctx, cx = cam.x * p, cy = cam.y * p, G = 190;
  screenSpace();
  paint(() => {
    const i0 = Math.floor((cx - 640) / G), i1 = Math.ceil((cx + 640) / G), j0 = Math.floor((cy - 1060) / G), j1 = Math.ceil((cy + 1060) / G);
    for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
      const h = hash(i * 7.31 + j * 13.7);
      if (h < 0.42) continue;
      const x = 540 + (i * G + 150 * hash(i * 3.1 + j * 1.7) - cx), y = 960 + (j * G + 150 * hash(i * 5.3 + j * 9.1) - cy), an = 6.28 * hash(i + j * 31.7) + 0.3 * Math.sin(t * 0.7 + i);
      const r = 5 + 5 * h, dx = Math.cos(an) * r * 0.8, dy = Math.sin(an) * r * 0.8;
      circle(c, x - dx, y - dy, r, rgba('#8FA6DE', 0.26 * a)); circle(c, x + dx, y + dy, r, rgba('#8FA6DE', 0.26 * a));
    }
  });
}
function airBg(cam, t, a = 1) {
  darkBg('#173A7C', '#030819');
  airFar(cam, t, 0.3, 0.6 * a);
  airFar({ x: cam.x + 97, y: cam.y + 53 }, t, 0.55, a);
}

// a small pill of text with a leader to a point (screen space); k = pop 0..1
function tagPill(txt, x, y, k, col = '#7FE9FF', to = null, size = 40) {
  if (k <= 0.01) return;
  screenSpace();
  if (to) { ctx.setLineDash([9, 9]); line(ctx, x, y, lerp(x, to[0], clamp(k)), lerp(y, to[1], clamp(k)), 3.5, rgba(col, 0.85)); ctx.setLineDash([]); if (k >= 0.99) circle(ctx, to[0], to[1], 8, col); }
  pill(x, y, txt, col, k, size);
}
