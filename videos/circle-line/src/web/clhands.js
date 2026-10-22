// The circle-and-line test: his two fingertips' paths (the left one circles; the right one goes up and down and bends
// into an oval when the circle leaks across), their glowing trails, his arms placed from the fingertips, his head as
// glass with the two halves of his brain pulled apart and a bridge between them (each half's plan, the chat, the circle
// that rolls across, the scissors that cut it), a window on his hands, a ghost arm, and small graphics.
// Rig-local units as in office.js (his feet at (OF.hx, OF.floor), up = -y); head units as in foot.js (HEMI).
// The picture is the viewer's mirror: his LEFT hand is on the screen's left (the rig's 'L'), so "your left hand" reads
// on screen the way the viewer does it. The left hand draws the circle (cyan), the right hand the line (orange).
// The right half of his brain (screen right) runs the left hand; the left half (screen left) runs the right hand.
'use strict';

const CL_W = () => 2 * Math.PI * ((window.TLd && TLd.cues.draw_hz) || 1.05);   // rad/s: one cycle of both hands
const CL_C = { L: [-124, -432], R: [124, -432] };       // the middle of each hand's drawing (rig units)
const CL_ELB = { L: [-176, -312], R: [176, -312] };     // the elbow while that hand draws
const CL_R = 42, CL_A = 50;                             // the circle's radius; the line's half length
const CL_PH0 = 0.35;
const CL_CYAN = '#7FE9FF', CL_ORANGE = '#FF9A3C';
// a violet shirt with a collar and buttons (office.js's pyjama-top cut), the house trousers and red shoes
const CLPAL = Object.assign({}, FSPAL, { coat: '#9C86E0', coatSh: '#7560C0', coatHi: '#CBBDFA', coatDk: '#4E3E92' });

// ---------------------------------------------------------------- the two paths
// the fingertips at clock time tt. b = how far the circle has leaked into the line (0 straight .. 1 an oval);
// o.ghost: the left hand is a ghost (same path); o.still: {L, R} 0..1 = that hand stops (eases to its rest point)
function clTips(tt, b, o = {}) {
  const th = CL_PH0 + CL_W() * tt;
  const sq = 1 - 0.1 * b;                                          // the circle gives a little too
  const L = [CL_C.L[0] - CL_R * sq * Math.cos(th), CL_C.L[1] + CL_R * Math.sin(th)];
  const R = [CL_C.R[0] + 0.92 * CL_R * b * Math.cos(th), CL_C.R[1] + CL_A * Math.sin(th)];
  return { L, R, th };
}
// a glowing trail of the last `span` cycles of one fingertip, newest end brightest. P: rig -> screen.
// bF(time) = the bend at that time; side 'L' | 'R'; o: {zoom, span, w, dash, alpha, ghost}
function clTrail(P, tt, bF, side, col, k, o = {}) {
  if (k <= 0.01) return;
  const n = 46, span = (o.span || 0.92) / ((window.TLd && TLd.cues.draw_hz) || 1.05), zoom = o.zoom || 1;
  const pts = [];
  for (let i = 0; i <= n; i++) { const x = tt - span * (1 - i / n); pts.push(P(...clTips(x, bF(x))[side])); }
  const lw = (o.w || 8) * zoom;
  screenSpace();
  for (let i = 1; i <= n; i++) {
    const a = clamp(k) * (o.alpha || 1) * (0.12 + 0.88 * Math.pow(i / n, 1.4));
    for (const [cc, w, cl] of [[ctx, lw * 1.7, rgba('#0B0B1A', 0.55 * a)], [ctx, lw, rgba(col, a)], [gctx, lw * 2.4, rgba(col, 0.5 * a)]]) {
      cc.save(); if (cc === gctx) cc.setTransform(0.5, 0, 0, 0.5, 0, 0);
      if (o.dash) { cc.setLineDash([lw * 1.6, lw * 1.2]); }
      cc.beginPath(); cc.moveTo(pts[i - 1][0], pts[i - 1][1]); cc.lineTo(pts[i][0], pts[i][1]);
      cc.lineWidth = w; cc.lineCap = 'round'; cc.strokeStyle = cl; cc.stroke(); cc.restore();
    }
  }
  // the comet at the fingertip
  const H = pts[n];
  circle(ctx, H[0], H[1], lw * 0.62, rgba('#FFFFFF', clamp(k) * (o.alpha || 1)));
  softDot(gctx, H[0], H[1], lw * 3.2, col, 0.75 * clamp(k) * (o.alpha || 1));
}
// a dashed straight guide where the line should be (what he meant), screen points
function clGuide(P, k, zoom) {
  if (k <= 0.01) return;
  const a = P(CL_C.R[0], CL_C.R[1] - CL_A - 14), b = P(CL_C.R[0], CL_C.R[1] + CL_A + 14);
  screenSpace();
  ctx.save(); ctx.globalAlpha = clamp(k) * 0.9; ctx.setLineDash([12 * zoom / 2.5, 10 * zoom / 2.5]);
  line(ctx, a[0], a[1], b[0], b[1], 3.2 * zoom / 2.5 * 1.4, '#FFFFFF'); ctx.restore();
}

// ---------------------------------------------------------------- his arms, from the fingertips
function clArmFor(side, F) {
  const E0 = CL_ELB[side], C = CL_C[side];
  const e = [E0[0] + 0.28 * (F[0] - C[0]), E0[1] + 0.22 * (F[1] - C[1])];
  const ux = F[0] - e[0], uy = F[1] - e[1], L = Math.hypot(ux, uy) || 1;
  return { e, w: [F[0] - (ux / L) * 70, F[1] - (uy / L) * 70] };
}

// ---------------------------------------------------------------- his head as glass: two halves pulled apart, a bridge
// head units (foot.js's HEMI): the halves are drawn about HEMI[side] moved out by 13 * spread
function clHalfC(side, spread) { const sd = side === 'L' ? -1 : 1; return [HEMI[side][0] + sd * 15 * spread, HEMI[side][1]]; }
const CL_DECK = (x, sp) => 7 - 7 * Math.cos((x / (18 * sp + 2)) * Math.PI / 2);   // the deck's height along x (an arch)
// a glow in the glow layer at a point of the current transform of c
function clGlow(c, x, y, r, col, a) {
  if (a <= 0.01) return;
  const m = c.getTransform(), X = m.a * x + m.c * y + m.e, Y = m.b * x + m.d * y + m.f;
  gctx.save(); gctx.setTransform(1, 0, 0, 1, 0, 0);
  softDot(gctx, X / 2, Y / 2, r * Math.hypot(m.a, m.b) / 2, col, a);
  gctx.restore();
}
// a face on a half (head units about its middle): mood 'smile' | 'talk' | 'wow' | 'calm' | 'proud' | 'sneaky';
// look [-1..1, -1..1]; talk 0..1 (the mouth open)
function clFace(c, x, y, mood, k, look = [0, 0], talk = 0) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2);
  c.save(); c.translate(x, y + 2); c.scale(s, s);
  const wow = mood === 'wow', calm = mood === 'calm', sneaky = mood === 'sneaky';
  for (const sd of [-1, 1]) {
    const eh = wow ? 6.4 : calm ? 1.6 : sneaky ? 3.0 : 5.4;
    ellipse(c, sd * 8, -4, wow ? 5.2 : 4.6, eh, '#FFFFFF');
    if (!calm) circle(c, sd * 8 + look[0] * 1.8, -3.4 + look[1] * 1.6, wow ? 2.2 : 2.6, '#1A0C18');
    const by = wow ? -14 : sneaky ? -9.5 : -12;
    line(c, sd * 3.5, by + (sneaky ? sd * 1.2 : 0), sd * 12.5, by - (wow ? 1.5 : 0) - (sneaky ? sd * 1.2 : 0), 2.2, '#3A1530');
  }
  if (wow) ellipse(c, 0, 9, 3.6, 4.6, '#3A1530');
  else if (mood === 'talk' || talk > 0.05) ellipse(c, 0, 8, 4.6, 1.4 + 4 * clamp(talk), '#3A1530');
  else if (mood === 'proud') { c.beginPath(); c.moveTo(-7, 6); c.quadraticCurveTo(0, 13, 7, 6); c.closePath(); c.fillStyle = '#3A1530'; c.fill(); }
  else if (sneaky) { c.beginPath(); c.moveTo(-6, 8); c.quadraticCurveTo(1, 11, 7, 6); c.lineWidth = 2.2; c.strokeStyle = '#3A1530'; c.lineCap = 'round'; c.stroke(); }
  else { c.beginPath(); c.moveTo(-6, 6); c.quadraticCurveTo(0, calm ? 9 : 12, 6, 6); c.lineWidth = 2.2; c.strokeStyle = '#3A1530'; c.lineCap = 'round'; c.stroke(); }
  c.restore();
}
// a plan on a half: the circle (cyan, a dot going round) or the line (orange, a dot going up and down; bend makes it an
// oval), centred at (x, y), head units
function clPlan(c, x, y, kind, k, tt, bend = 0, o = {}) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2), r = 7.5 * s, th = CL_PH0 + CL_W() * tt;
  c.save(); c.translate(x, y);
  rrect(c, -12 * s, -12 * s, 24 * s, 24 * s, 5 * s); c.fillStyle = rgba('#0B0B1A', 0.75); c.fill();
  c.lineWidth = 1.2; c.strokeStyle = rgba(kind === 'circle' ? CL_CYAN : CL_ORANGE, 0.7); c.stroke();
  const col = kind === 'circle' ? CL_CYAN : (o.col || CL_ORANGE);
  c.lineWidth = 2.4; c.strokeStyle = col; c.lineCap = 'round';
  if (kind === 'circle') { c.beginPath(); c.arc(0, 0, r, 0, 7); c.stroke(); circle(c, -r * Math.cos(th), r * Math.sin(th), 2.2, '#FFFFFF'); }
  else {
    const bw = r * 0.92 * clamp(bend);
    c.beginPath(); c.ellipse(0, 0, Math.max(0.01, bw), r * 1.1, 0, 0, 7); c.stroke();
    circle(c, bw * Math.cos(th), r * 1.1 * Math.sin(th), 2.2, '#FFFFFF');
  }
  c.restore();
  clGlow(c, x, y, 16 * s, col, 0.55 * clamp(k));
}
// g: {k, spread, litL, litR, faceL, faceR, moodL, moodR, lookL, lookR, talkL, talkR, plans, bend, bendCol,
//     bridge (0..1 drawn on), cut (0..1 the halves of the bridge droop), roll (-1 none; 0..1 the circle on its way
//     across, right to left), scissors (0..1 shown), snip (0..1 the blades close), bubble: {side, k, kind}}, tt (the clock)
function clGlass(c, t, g) {
  const k = clamp(g.k);
  c.save();
  c.beginPath(); c.ellipse(0, 0, 65, 71, 0, 0, 7);
  c.fillStyle = rgba('#0C1636', 0.92 * k); c.fill();
  c.lineWidth = 3; c.strokeStyle = rgba('#BFF6FF', 0.85 * k); c.stroke();
  c.restore();
  if (k < 0.2) return;
  const a = clamp((k - 0.2) / 0.5), sp = clamp(g.spread || 0), tt = g.tt === undefined ? t : g.tt;
  paint(() => {
    c.save(); c.globalAlpha = a;
    // the bridge first (the halves sit over its ends)
    const bk = clamp(g.bridge || 0);
    if (bk > 0.01) {
      const x0 = -18 * sp - 4, x1 = 18 * sp + 4, cut = clamp(g.cut || 0);
      for (const sd of [-1, 1]) {
        c.save();
        const anchor = sd < 0 ? x0 : x1;
        c.translate(anchor, CL_DECK(anchor, sp)); c.rotate(sd * -1.05 * E.inCubic(cut)); c.translate(-anchor, -CL_DECK(anchor, sp));
        // this side's half of the deck (the left side draws on first)
        const xa = sd < 0 ? x0 : 0, xb = sd < 0 ? 0 : x1;
        const xe = lerp(x0, x1, bk), xr = Math.min(xb, xe);
        if (xr > xa) {
          c.beginPath();
          for (let i = 0; i <= 12; i++) { const x = lerp(xa, xr, i / 12); c[i ? 'lineTo' : 'moveTo'](x, CL_DECK(x, sp)); }
          for (let i = 12; i >= 0; i--) { const x = lerp(xa, xr, i / 12); c.lineTo(x, CL_DECK(x, sp) + 5); }
          c.closePath(); c.fillStyle = '#C98A4B'; c.fill(); c.lineWidth = 1; c.strokeStyle = '#6E3F1C'; c.stroke();
          // posts and the rail
          for (let x = Math.ceil(xa / 5) * 5; x <= xr; x += 5) line(c, x, CL_DECK(x, sp), x, CL_DECK(x, sp) - 8, 1.6, '#8A5428');
          c.beginPath(); for (let i = 0; i <= 12; i++) { const x = lerp(xa, xr, i / 12); c[i ? 'lineTo' : 'moveTo'](x, CL_DECK(x, sp) - 8); }
          c.lineWidth = 2; c.strokeStyle = '#E2A764'; c.stroke();
        }
        c.restore();
      }
      clGlow(c, 0, CL_DECK(0, sp), 22, '#FFD447', 0.25 * bk * (1 - clamp(g.cut || 0)));
    }
    for (const side of ['L', 'R']) {
      const [cx, cy] = clHalfC(side, sp), sd = side === 'L' ? -1 : 1;
      const lit = clamp(side === 'L' ? g.litL : g.litR), col = side === 'L' ? CL_ORANGE : CL_CYAN;
      c.save(); c.translate(cx - HEMI[side][0], 0);
      hemiPath(c, side); c.fillStyle = mixHex('#5E4A7A', '#FF93B0', lit); c.fill();
      c.lineWidth = 1.6 + 1.6 * lit; c.strokeStyle = lit > 0.05 ? rgba(col, 0.35 + 0.6 * lit) : rgba('#FFFFFF', 0.35); c.stroke();
      const [hx, hy] = HEMI[side];
      c.lineWidth = 1.8; c.strokeStyle = rgba('#7E2748', 0.55); c.lineCap = 'round';
      // the folds; with a face on the half only the top and bottom ones (the middle ones read as a frown)
      const fk = side === 'L' ? clamp(g.faceL || 0) : clamp(g.faceR || 0);
      if (fk > 0.3) {     // a face: two short folds down the outer edge only
        for (const y of [-6, 12]) { c.beginPath(); c.moveTo(hx + sd * 22, hy + y - 7); c.quadraticCurveTo(hx + sd * 27, hy + y, hx + sd * 23, hy + y + 7); c.stroke(); }
      } else for (const [y, w] of [[-24, 14], [-8, 18], [8, 15], [22, 10]]) { c.beginPath(); c.moveTo(hx - sd * 12, hy + y); c.quadraticCurveTo(hx + sd * (w - 6), hy + y - 6, hx + sd * w, hy + y + 2); c.stroke(); }
      c.restore();
      clFace(c, cx, cy + 4, side === 'L' ? (g.moodL || 'smile') : (g.moodR || 'smile'), side === 'L' ? g.faceL : g.faceR,
        side === 'L' ? (g.lookL || [0, 0]) : (g.lookR || [0, 0]), side === 'L' ? (g.talkL || 0) : (g.talkR || 0));
      clPlan(c, cx + sd * 1, cy - 22, side === 'L' ? 'line' : 'circle', clamp(g.plans || 0), tt, side === 'L' ? (g.bend || 0) : 0, { col: g.bendCol });
    }
    // the circle on its way across the bridge (right to left), rolling
    if (g.roll !== undefined && g.roll >= 0 && g.roll <= 1) {
      const xR = 18 * sp + 2, xL = -18 * sp - 2, u = E.inOutSine(g.roll), x = lerp(xR, xL, u);
      const y = (u < 0.08 ? lerp(-36, CL_DECK(x, sp), u / 0.08) : u > 0.92 ? lerp(CL_DECK(x, sp), -36, (u - 0.92) / 0.08) : CL_DECK(x, sp)) - 7.4;
      c.save(); c.translate(x, y); c.rotate(-u * 9);
      c.beginPath(); c.arc(0, 0, 6.6, 0, 7); c.lineWidth = 3; c.strokeStyle = CL_CYAN; c.stroke();
      circle(c, 0, -6.6, 1.9, '#FFFFFF');
      c.restore();
      clGlow(c, x, y, 16, CL_CYAN, 0.85);
    }
    // a chat bubble from one half toward the other
    const bb = g.bubble;
    if (bb && bb.k > 0.01) {
      const sd = bb.side === 'L' ? -1 : 1, [cx, cy] = clHalfC(bb.side, sp), s = E.outBack(clamp(bb.k), 2.2);
      c.save(); c.translate(cx - sd * 14, cy - 46); c.scale(s, s);
      c.beginPath(); c.ellipse(0, 0, 13, 8.5, 0, 0, 7); c.fillStyle = '#FFFFFF'; c.fill();
      c.beginPath(); c.moveTo(sd * 3, 6); c.lineTo(sd * 9, 13); c.lineTo(sd * 8, 5); c.closePath(); c.fill();
      if (bb.kind === 'circle') { c.beginPath(); c.arc(0, 0, 4.2, 0, 7); c.lineWidth = 2; c.strokeStyle = '#1E96D8'; c.stroke(); }
      else if (bb.kind === 'line') line(c, 0, -4.5, 0, 4.5, 2, '#E07020');
      else for (const dx of [-5, 0, 5]) circle(c, dx, 0, 1.6, '#3A1530');
      c.restore();
    }
    // the scissors over the middle of the bridge
    const sk = clamp(g.scissors || 0);
    if (sk > 0.01) {
      const s = E.outBack(sk, 2), open = 0.55 * (1 - E.inCubic(clamp(g.snip || 0)));
      c.save(); c.translate(0, CL_DECK(0, sp) - 2); c.scale(s, s); c.rotate(-0.25);
      for (const sd of [-1, 1]) {
        c.save(); c.rotate(sd * open);
        c.beginPath(); c.moveTo(0, 0); c.lineTo(-3, -24); c.lineTo(1.2, -24); c.lineTo(2.2, 0); c.closePath(); c.fillStyle = '#DCE3EE'; c.fill();
        c.lineWidth = 0.8; c.strokeStyle = '#6A7383'; c.stroke();
        c.beginPath(); c.ellipse(sd * 2, 9, 4.2, 5.6, 0, 0, 7); c.lineWidth = 2.6; c.strokeStyle = '#E2384C'; c.stroke();
        c.restore();
      }
      circle(c, 0, 0, 1.4, '#6A7383');
      c.restore();
    }
    c.restore();
  });
  // the lit halves shine a little
  for (const side of ['L', 'R']) {
    const lit = clamp(side === 'L' ? g.litL : g.litR), [cx, cy] = clHalfC(side, sp);
    clGlow(c, cx, cy, 30, side === 'L' ? CL_ORANGE : CL_CYAN, 0.32 * lit * a);
  }
}
// the cords from a half (pulled apart by spread) to the OTHER side's hand: they cross in his neck. H = fsHero's result.
function clCordPts(H, side, spread) {
  const r = H.r, P = H.S, half = clHalfC(side === 'R' ? 'L' : 'R', spread);
  const start = H.HS(half[0], half[1] + 26), neck = P(r.neck[0], r.neck[1] + 6);
  const sh = r['sh' + side], el = r['el' + side], wr = r['wr' + side];
  return [start, neck, P(sh[0] * 0.55, sh[1] + 8), P(...sh), P(...el), P(...wr), H.fingerS(side)];
}

// ---------------------------------------------------------------- a window on his hands (screen space)
// o: {label, b (the bend), clean (0..1: both shapes come out right), ticks (0..1), tt (the clock), col}
function clWindow(x, y, w, h, k, o = {}) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 1.8);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -w / 2 - 6, -h / 2 - 6, w + 12, h + 12, 30); ctx.fillStyle = '#0B0B1A'; ctx.fill();
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, '#16224E'); g.addColorStop(1, '#0E1534');
  rrect(ctx, -w / 2, -h / 2, w, h, 24); ctx.fillStyle = g; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = rgba(o.col || '#BFF6FF', 0.8); ctx.stroke();
  ctx.restore();
  // the two drawings, at the window's scale (rig units about the hands' middles)
  const sc = (h * 0.62) / (2 * CL_A) * s, tt = o.tt || 0, clean = clamp(o.clean || 0);
  const bF = () => (o.b || 0) * (1 - clean);
  const P = (side) => (lx, ly) => [x + (side === 'L' ? -w * 0.24 : w * 0.24) * s + (lx - CL_C[side][0]) * sc, y + 12 * s + (ly - CL_C[side][1]) * sc];
  clTrail(P('L'), tt, bF, 'L', CL_CYAN, clamp(k), { zoom: sc * 1.1, span: 0.97 });
  clTrail(P('R'), tt, bF, 'R', CL_ORANGE, clamp(k), { zoom: sc * 1.1, span: 0.97 });
  if (o.label) tagPill(o.label, x, y - h / 2 * s - 4, o.labelCol || '#BFF6FF', clamp(k), 30);
  const tk = clamp(o.ticks || 0);
  if (tk > 0.01) { okTick(x - w * 0.24 * s, y + h * 0.36 * s, 26, tk); okTick(x + w * 0.24 * s, y + h * 0.36 * s, 26, clamp(tk * 1.3 - 0.3)); }
}

// ---------------------------------------------------------------- the ghost arm (world -> screen through H)
// from his left shoulder to a fingertip F (rig units), as a phantom limb is usually drawn: a thin glowing outline round
// a dark see-through body. Each part is outlined and filled in turn (upper arm, forearm, hand), so the forearm reads in
// front of the upper arm where they cross.
function clGhostArm(H, F, k, t) {
  if (k <= 0.01) return;
  const arm = clArmFor('L', F), r = H.r, P = H.S, z = H.cam.zoom;
  const sh = P(...r.shL), el = P(...arm.e), wr = P(...arm.w), tip = P(...F);
  const hc = [lerp(wr[0], tip[0], 0.2), lerp(wr[1], tip[1], 0.2)], fb = [lerp(wr[0], tip[0], 0.37), lerp(wr[1], tip[1], 0.37)];
  const shim = 0.8 + 0.2 * Math.sin(t * 7), ow = 3.2 * z;
  const seg = [
    (cc, x, col) => line(cc, sh[0], sh[1], el[0], el[1], 40 * z + x, col),
    (cc, x, col) => line(cc, el[0], el[1], wr[0], wr[1], 36 * z + x, col),
    (cc, x, col) => { circle(cc, hc[0], hc[1], 21 * z + x / 2, col); line(cc, fb[0], fb[1], tip[0], tip[1], 14 * z + x, col); },
  ];
  screenSpace();
  ctx.save(); ctx.globalAlpha = clamp(k);
  for (const f of seg) { f(ctx, ow * 2, rgba('#E6FBFF', shim)); f(ctx, 0, 'rgba(18,34,80,0.9)'); f(ctx, 0, 'rgba(160,225,255,0.14)'); }
  ctx.restore();
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); gctx.globalAlpha = clamp(k) * 0.5;
  for (const f of seg) f(gctx, ow * 5, 'rgba(127,233,255,0.18)');
  gctx.restore();
  softDot(gctx, tip[0], tip[1], 40 * z / 2, '#BFF6FF', 0.45 * clamp(k));
  // little ghostly wisps off the arm
  for (let i = 0; i < 4; i++) {
    const u = ((t * 0.6 + i / 4) % 1), p = [lerp(sh[0], wr[0], i / 4 + 0.1), lerp(sh[1], wr[1], i / 4 + 0.1)];
    circle(ctx, p[0] - 30 * z * u, p[1] - 22 * z * u, 4 * z * (1 - u), rgba('#DFF8FF', 0.45 * clamp(k) * (1 - u)));
  }
}
