// Can You ROLL Your Tongue? Short: the tongue.
//   tongueFront(c, T, t)          his tongue stuck out, seen from the front, in HEAD units (the mirror hero's head: the
//                                 middle of the head is the origin, the mouth at y 44). T: {out 0..1, kL, kR (the curl of
//                                 the screen-left / screen-right edge: 0 flat .. 1 up into a tube), flop 0..1 (a sad,
//                                 wide droop), sway (head units sideways at the tip), xray 0..1, fib: {L, X, V} (the three
//                                 directions of muscle, lit 0..1), noBone 0..1 (a dashed bone with a cross), glowEdges 0..1}
//                                 Returns named points (head units): tip, edgeL, edgeR, hole, root
//   tongueSlice(x, y, r, k, t, o) a slice of tongue in a round window (screen space): flat -> U -> tube as k goes 0 -> 1;
//                                 o: {edges 0..1 (the two edges glow), arrows 0..1, kL, kR (one side alone), label}
//   miniFace(c, x, y, s, o)       a little round face with its tongue out (any units): the book's family tree, photos
'use strict';

const TG = { col: '#EF6F7E', sh: '#D4566A', hi: '#FF9FAA', ridge: '#F8838F', dark: '#9C2C44', hollow: '#6E1328', mouth: '#4A1020', lip: '#B9524C' };
const TG_Y0 = 51;                                             // where it leaves his lips (head units)

// the outline's key points for a description T
function tongueGeo(T) {
  const out = clamp(T.out === undefined ? 1 : T.out), fl = clamp(T.flop || 0), sw = T.sway || 0;
  const L = 52 * out * (1 + 0.1 * fl), y0 = TG_Y0;
  const k = { L: clamp(T.kL || 0), R: clamp(T.kR || 0) };
  const wide = 1 + 0.14 * fl;
  const side = (s) => {
    const kk = s < 0 ? k.L : k.R;
    return {
      root: [s * 16.5 * (1 - 0.28 * kk), y0],
      mid: [s * 20.5 * (1 - 0.43 * kk) * wide + 0.45 * sw, y0 + 0.48 * L],
      near: [s * 15.5 * (1 - 0.46 * kk) * wide + 0.8 * sw, y0 + 0.86 * L],
      kk,
    };
  };
  const A = side(-1), B = side(1);
  const tip = [sw + 0.15 * (B.kk - A.kk) * 6, y0 + L];
  return { L, y0, A, B, tip, k, fl, out };
}
function tonguePath(c, G) {
  const P = [G.A.root, G.A.mid, G.A.near, G.tip, G.B.near, G.B.mid, G.B.root];
  smoothPath(c, P);
  c.lineTo(G.B.root[0], G.y0 - 6); c.lineTo(G.A.root[0], G.y0 - 6); c.closePath();
}
// a point along one edge, u 0 (root) .. 1 (near the tip), pulled toward the middle by `inset`
function tgEdge(G, s, u, inset = 0) {
  const S = s < 0 ? G.A : G.B;
  const p = u < 0.55 ? [lerp(S.root[0], S.mid[0], u / 0.55), lerp(S.root[1], S.mid[1], u / 0.55)] : [lerp(S.mid[0], S.near[0], (u - 0.55) / 0.45), lerp(S.mid[1], S.near[1], (u - 0.55) / 0.45)];
  return [p[0] - s * inset, p[1]];
}

function tongueFront(c, T, t) {
  const G = tongueGeo(T);
  if (G.out < 0.02) return null;
  const ka = (G.k.L + G.k.R) / 2, asym = G.k.L - G.k.R;
  // the open mouth behind it, and the upper lip over its root
  paint(() => {
    ellipse(c, 0, TG_Y0 - 1, 19, 8.5, TG.mouth);
    ellipse(c, 0, TG_Y0 - 5.5, 12.5, 2.8, '#FFFFFF');                 // the top teeth
  });
  // the tongue itself
  actor(() => { tonguePath(c, G); c.fillStyle = TG.col; c.fill(); });
  paint(() => {
    c.save(); tonguePath(c, G); c.clip();
    // the channel between the edges (a tube's hollow shows darker), or the plain middle groove when flat
    if (ka > 0.03) {
      const pL = [], pR = [];
      for (let i = 0; i <= 10; i++) { const u = i / 10; pL.push(tgEdge(G, -1, u, 6 + 7 * G.k.L)); pR.push(tgEdge(G, 1, u, 6 + 7 * G.k.R)); }
      c.beginPath(); pL.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); for (let i = pR.length - 1; i >= 0; i--) c.lineTo(pR[i][0], pR[i][1]); c.closePath();
      c.fillStyle = rgba(TG.dark, 0.25 + 0.55 * ka); c.fill();
    }
    line(c, 0.3 * (T.sway || 0), TG_Y0 + 4, 0.6 * (T.sway || 0), TG_Y0 + 0.66 * G.L, 2.4, rgba(TG.dark, 0.45 * (1 - ka)));
    // the curled edges: a light ridge along each side, wider the more it curls
    for (const s of [-1, 1]) {
      const kk = s < 0 ? G.k.L : G.k.R;
      if (kk < 0.03) continue;
      const bw = 3 + 8 * kk, o = [], i2 = [];
      for (let i = 0; i <= 12; i++) { const u = i / 12; o.push(tgEdge(G, s, u, -0.5)); i2.push(tgEdge(G, s, u, bw)); }
      c.beginPath(); o.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); for (let i = i2.length - 1; i >= 0; i--) c.lineTo(i2[i][0], i2[i][1]); c.closePath();
      c.fillStyle = TG.ridge; c.fill();
      c.beginPath(); i2.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.lineWidth = 1.6; c.strokeStyle = rgba(TG.dark, 0.6 * kk); c.stroke();
      const hl = []; for (let i = 1; i <= 9; i++) hl.push(tgEdge(G, s, i / 12, 0.4 * bw));
      c.beginPath(); hl.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.lineWidth = 1.4; c.strokeStyle = rgba('#FFFFFF', 0.35 * kk); c.stroke();
    }
    // a shine on the flat top
    ellipse(c, -6 + 0.5 * (T.sway || 0), TG_Y0 + 0.3 * G.L, 4.5, 8, rgba('#FFFFFF', 0.22 * (1 - ka)), -0.15);
    c.restore();
    // the end of the tube: a dark hole with a rim (offset toward the side that curls more)
    if (ka > 0.05) {
      const hx = G.tip[0] + 2.5 * asym, hy = G.tip[1] - 7 - 3 * ka;
      const rx = 9.5 * ka * (1 - 0.45 * Math.abs(asym)), ry = 6.5 * ka * (1 - 0.3 * Math.abs(asym));
      ellipse(c, hx, hy + 1, rx + 3.2, ry + 2.6, TG.ridge);
      ellipse(c, hx, hy, rx, ry, TG.hollow);
      ellipse(c, hx - rx * 0.3, hy - ry * 0.35, rx * 0.35, ry * 0.25, rgba('#FFB0BA', 0.35 * ka));
    }
    // the upper lip over the root, the lower lip's corners at the sides
    c.beginPath(); c.moveTo(-20, TG_Y0 - 2); c.quadraticCurveTo(0, TG_Y0 - 11, 20, TG_Y0 - 2); c.lineWidth = 3.2; c.lineCap = 'round'; c.strokeStyle = TG.lip; c.stroke();
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 19.5, TG_Y0 - 1); c.quadraticCurveTo(s * 19, TG_Y0 + 5, s * 15.5, TG_Y0 + 7); c.lineWidth = 2.6; c.strokeStyle = TG.lip; c.stroke(); }
  });
  // the x-ray: the inside of the tongue, with no bone in it, and muscle running three ways
  const xr = clamp(T.xray || 0);
  if (xr > 0.01) tongueXray(c, G, T, t, xr);
  // glowing edges (the "both edges" beat)
  const ge = clamp(T.glowEdges || 0);
  if (ge > 0.01) for (const s of [-1, 1]) {
    const pts = []; for (let i = 0; i <= 12; i++) pts.push(tgEdge(G, s, i / 12, -1));
    paint(() => { c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.lineWidth = 3.4; c.lineCap = 'round'; c.strokeStyle = rgba('#FFD447', ge); c.stroke(); });
    for (const u of [0.25, 0.55, 0.85]) { const p = tgEdge(G, s, u, -1); softDotLocal(c, p[0], p[1], 9, '#FFD447', 0.5 * ge); }
  }
  return { G, tip: G.tip, edgeL: tgEdge(G, -1, 0.6), edgeR: tgEdge(G, 1, 0.6), root: [0, TG_Y0], hole: [G.tip[0], G.tip[1] - 8] };
}

// the inside: a dark see-through tongue, fibres lengthwise (pink), across (yellow), up-and-down (cyan dots), a dashed bone
function tongueXray(c, G, T, t, xr) {
  const f = T.fib || {}, fl = clamp(f.L || 0), fx = clamp(f.X || 0), fv = clamp(f.V || 0);
  paint(() => {
    c.save(); tonguePath(c, G); c.clip();
    c.fillStyle = rgba('#3A0C24', 0.78 * xr); c.fillRect(-40, TG_Y0 - 10, 80, G.L + 20);
    const pulse = 0.75 + 0.25 * Math.sin(t * 6);
    // lengthwise
    for (let j = -3; j <= 3; j++) {
      const pts = []; for (let i = 0; i <= 10; i++) { const u = i / 10; const e = tgEdge(G, j < 0 ? -1 : 1, u, 0); pts.push([lerp(0, e[0], Math.abs(j) / 3.4), e[1] + (Math.abs(j) < 0.1 ? 0 : 0)]); }
      pts.push([G.tip[0] * (1 - Math.abs(j) / 3.4), G.tip[1] - 3]);
      c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.lineWidth = 2.2; c.strokeStyle = rgba('#FF7FA0', xr * (0.25 + 0.75 * fl * pulse)); c.stroke();
    }
    // across
    for (let i = 1; i <= 7; i++) {
      const u = i / 8, a = tgEdge(G, -1, u, 1.5), b = tgEdge(G, 1, u, 1.5);
      c.beginPath(); c.moveTo(a[0], a[1]); c.quadraticCurveTo(0, a[1] + 3, b[0], b[1]); c.lineWidth = 2; c.strokeStyle = rgba('#FFD447', xr * (0.18 + 0.82 * fx * pulse)); c.stroke();
    }
    // up and down: seen end-on, a field of dots
    for (let i = 1; i <= 7; i++) for (let j = -2; j <= 2; j++) {
      const u = (i - 0.5) / 8, a = tgEdge(G, -1, u, 3), b = tgEdge(G, 1, u, 3);
      circle(c, lerp(a[0], b[0], (j + 2.5) / 5), a[1], 1.25, rgba('#7FE9FF', xr * (0.15 + 0.85 * fv * pulse)));
    }
    c.restore();
    // the outline, lit
    tonguePath(c, G); c.lineWidth = 1.8; c.strokeStyle = rgba('#FFB3C6', 0.85 * xr); c.stroke();
  });
  // the glow of the lit fibres
  const g = Math.max(fl, fx, fv) * xr;
  if (g > 0.02) softDotLocal(c, 0, TG_Y0 + G.L * 0.5, 34, fl > fx ? '#FF7FA0' : fx > fv ? '#FFD447' : '#7FE9FF', 0.35 * g);
  // where a bone would be: a dashed bone, struck out
  const nb = clamp(T.noBone || 0);
  if (nb > 0.01) paint(() => {
    c.save(); c.translate(0, TG_Y0 + G.L * 0.5); c.scale(nb, nb);
    c.setLineDash([3, 2.4]); c.lineWidth = 1.7; c.strokeStyle = 'rgba(255,255,255,0.9)';
    c.beginPath(); c.moveTo(-3.2, -15); c.lineTo(-3.2, 15); c.moveTo(3.2, -15); c.lineTo(3.2, 15); c.stroke();
    for (const e of [-1, 1]) for (const sd of [-1, 1]) { c.beginPath(); c.arc(sd * 4.2, e * 17.5, 4, 0, 7); c.stroke(); }
    c.setLineDash([]);
    c.restore();
  });
}
// a soft glow in the current transform of c (head units): mirrors softDot for a context that is not the screen
function softDotLocal(c, x, y, r, col, a) {
  const m = c.getTransform(), X = m.a * x + m.c * y + m.e, Y = m.b * x + m.d * y + m.f, sc = Math.hypot(m.a, m.b);
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); softDot(gctx, X, Y, r * sc, col, a); gctx.restore();
}

// ---------------------------------------------------------------- a slice of tongue (screen space)
function tongueSlice(x, y, r, k, t, o = {}) {
  const kL = o.kL === undefined ? k : o.kL, kR = o.kR === undefined ? k : o.kR;
  const s = E.outBack(clamp(o.pop === undefined ? 1 : o.pop), 1.6);
  if (s <= 0.01) return;
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // the window (o.bare: no window, the band alone, for a panel)
  if (!o.bare) { ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fillStyle = '#26102A'; ctx.fill(); }
  paint(() => {
    ctx.save();
    if (!o.bare) {
      ctx.beginPath(); ctx.arc(0, 0, r - 2, 0, 7); ctx.clip();
      const g = ctx.createRadialGradient(0, -r * 0.3, 10, 0, 0, r); g.addColorStop(0, '#4A1F4E'); g.addColorStop(1, '#1A0A20'); ctx.fillStyle = g; ctx.fillRect(-r, -r, 2 * r, 2 * r);
    }
    // the band: one arc per half, bending up by its own curl; flat -> U -> a closed tube
    const Lh = r * 0.78, th = r * 0.27, cy = r * 0.32 - r * 0.3 * Math.max(kL, kR);
    const half = (sd, kk) => {
      const pts = [], kap = lerp(0.0002, Math.PI / Lh, kk);   // at 1 each half bends through half a turn: the ends meet on top
      for (let i = 0; i <= 24; i++) { const u = (i / 24) * Lh, a = u * kap; pts.push(kap < 0.001 ? [sd * u, cy] : [sd * Math.sin(a) / kap, cy - (1 - Math.cos(a)) / kap]); }
      return pts;
    };
    const HL = half(-1, kL), HR = half(1, kR), band = HL.slice().reverse().concat(HR.slice(1));
    for (const [w, col] of [[th + 8, '#1A0610'], [th, TG.col]]) {
      ctx.beginPath(); band.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = col; ctx.stroke();
    }
    // the top surface (inside of the curl) a little darker, the muscle as dots across the band
    ctx.beginPath(); band.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1] - th * 0.22) : ctx.moveTo(p[0], p[1] - th * 0.22))); ctx.lineWidth = th * 0.3; ctx.strokeStyle = rgba(TG.dark, 0.35); ctx.stroke();
    for (let i = 3; i < band.length - 3; i += 4) circle(ctx, band[i][0], band[i][1] + th * 0.12, th * 0.09, rgba('#FFD0D8', 0.7));
    // the two edges, glowing
    const ed = clamp(o.edges || 0);
    if (ed > 0.01) for (const Hh of [HL, HR]) {
      const seg = Hh.slice(Hh.length - 7);
      ctx.beginPath(); seg.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.lineWidth = th * 0.92; ctx.lineCap = 'round'; ctx.strokeStyle = rgba('#FFD447', ed); ctx.stroke();
      const p = Hh[Hh.length - 4]; softDot(gctx, x + p[0] * s, y + p[1] * s, th * 1.1 * s, '#FFD447', 0.45 * ed);
    }
    // arrows: both edges go UP
    const ar = clamp(o.arrows || 0);
    if (ar > 0.01) for (const [p, sd] of [[HL[HL.length - 1], -1], [HR[HR.length - 1], 1]]) {
      const ax = p[0] + sd * th * 1.25, ay = p[1] + th * 0.2, bob = 6 * Math.sin(t * 9);
      ctx.save(); ctx.translate(ax, ay - bob); ctx.scale(ar, ar);
      for (const [w, col] of [[12, '#0B0B1A'], [6, '#FFD447']]) { ctx.beginPath(); ctx.moveTo(0, 26); ctx.lineTo(0, -16); ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.strokeStyle = col; ctx.stroke(); ctx.beginPath(); ctx.moveTo(-14, -6); ctx.lineTo(0, -24); ctx.lineTo(14, -6); ctx.lineJoin = 'round'; ctx.stroke(); }
      ctx.restore();
    }
    ctx.restore();
    if (!o.bare) { ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.lineWidth = 7; ctx.strokeStyle = '#FFB3C6'; ctx.stroke(); }
    if (o.label) { ctx.font = '900 30px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 7; ctx.strokeStyle = '#0B0B1A'; ctx.strokeText(o.label, 0, r - 34); ctx.fillStyle = '#FFFFFF'; ctx.fillText(o.label, 0, r - 34); }
  });
  ctx.restore();
}

// ---------------------------------------------------------------- a little face with its tongue out (any units; about 2s wide)
// o: {k (curl), skin, hair ('cap' | 'bun' | 'none'), moustache, glasses, look: [x, y], eyes ('open' | 'shut' | 'smug'), blush}
function miniFace(c, x, y, s, o = {}) {
  c.save(); c.translate(x, y); c.scale(s / 70, s / 70);
  const skin = o.skin || '#F4C9A4', hair = o.hairCol || '#3A2418';
  actor(() => {
    if (o.hair === 'bun') circle(c, 0, -76, 26, hair);
    circle(c, 0, 0, 70, skin);
  });
  paint(() => {
    if (o.hair !== 'none') { c.beginPath(); c.moveTo(-66, -6); c.quadraticCurveTo(-70, -66, 0, -72); c.quadraticCurveTo(70, -66, 66, -6); c.quadraticCurveTo(40, -44, 0, -40); c.quadraticCurveTo(-40, -44, -66, -6); c.closePath(); c.fillStyle = hair; c.fill(); }
    ellipse(c, -38, 22, 12, 7, 'rgba(255,110,110,0.3)'); ellipse(c, 38, 22, 12, 7, 'rgba(255,110,110,0.3)');
    if (o.blush) { ellipse(c, -36, 20, 20, 12, rgba('#FF3A4A', 0.6 * o.blush)); ellipse(c, 36, 20, 20, 12, rgba('#FF3A4A', 0.6 * o.blush)); }
    const lk = o.look || [0, 0];
    for (const sd of [-1, 1]) {
      if (o.eyes === 'shut') { c.beginPath(); c.moveTo(sd * 24 - 12, -4); c.quadraticCurveTo(sd * 24, 6, sd * 24 + 12, -4); c.lineWidth = 5; c.strokeStyle = '#3A2418'; c.lineCap = 'round'; c.stroke(); continue; }
      ellipse(c, sd * 24, -4, 12, 14, '#FFFFFF'); circle(c, sd * 24 + lk[0] * 4, -4 + lk[1] * 5, 6.5, '#15132A'); circle(c, sd * 24 + lk[0] * 4 - 2, -7 + lk[1] * 5, 2.2, '#FFFFFF');
      if (o.eyes === 'smug') { c.save(); c.beginPath(); c.ellipse(sd * 24, -4, 13, 15, 0, 0, 7); c.clip(); c.fillStyle = mixHex(skin, '#C08060', 0.25); c.fillRect(sd * 24 - 14, -20, 28, 13); c.restore(); line(c, sd * 24 - 13, -7, sd * 24 + 13, -7, 3, '#5A3020'); }
    }
    if (o.glasses) { c.lineWidth = 4; c.strokeStyle = o.glasses; for (const sd of [-1, 1]) { c.beginPath(); c.arc(sd * 24, -4, 19, 0, 7); c.stroke(); } line(c, -5, -6, 5, -6, 4, o.glasses); }
    ellipse(c, 0, 16, 7, 5, 'rgba(190,110,80,0.5)');
    if (o.moustache) for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(0, 26); c.quadraticCurveTo(sd * 16, 20, sd * 32, 32); c.quadraticCurveTo(sd * 16, 38, 0, 33); c.closePath(); c.fillStyle = o.moustache; c.fill(); }
  });
  // the tongue (head units: these faces share the hero's proportions)
  if (o.tongue !== false) tongueFront(c, { out: 1, kL: o.k || 0, kR: o.kR === undefined ? (o.k || 0) : o.kR, flop: o.flop || 0 }, 0);
  c.restore();
}
