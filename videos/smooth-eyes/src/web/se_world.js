// Can You Move Your Eyes SMOOTHLY? Short (21 Nov 2026): what this Short adds on top of one-eye's meadow (oneeye.js,
// trail.js, eyes.js):
//   seHop(tt, hops, stops, dur)      eyes that JUMP between stops: {lx, smear, from, to, u, last} at time tt
//   seHopMarks(c, F, H, t)           head units, over the eyes: a dotted hop arc from the old stop to the new one and a
//                                    faint ghost iris left behind at each stop (the strobe of a saccade)
//   seGlideTrail(c, xs, ly, k)       head units: a smooth unbroken trace under each iris (the glide)
//   seHand(x, y, s, o)               screen space: the foreground hand, index finger UP, palm to us, his yellow cuff;
//                                    (x, y) is the fingertip; o = {rot, ghost (dashed outline only, the dark), k (rise
//                                    in from below 0..1), drop 0..1, glow}
//   seFingerAt(cam, r, F)            where the fingertip sits on screen for a finger offset F = [fx, fy] in head units
//   seViewfinder(t, o)               screen space: a camera viewfinder (corner brackets, REC, a level line)
//   seScanpath(pts, k, t)            screen space: dots where the eyes landed, joined by straight jumps
//   seTow(eyes, tip, k, t, o)        screen space: two dotted tow lines from the pupils to the fingertip, beads pulling
//   seDarkBg(t)                      the pitch-dark frame: saturated deep navy, never black
//   seNerve(a, b, k, beads, t)       screen space: a dashed glowing line from the fingertip down and up to his head
//   seButterEyes(x, y, s, t, o)      the butterfly in the dark: only its two tiny eyes (o.look, o.blink)
//   seStamp(txt, x, y, k, col, rot)  a small rubber-stamp label
'use strict';

const SEC = { cyan: '#7FE9FF', cyanDk: '#1C8FB8', gold: '#FFD447', red: '#FF5A6E', navy0: '#14307A', navy1: '#081A4C',
  navy2: '#040E30', glide: '#5CF2C0', hop: '#FFD447' };

// ---------------------------------------------------------------- the jumping eyes
// hops: the times of the jumps; stops: the look before the first hop, then after each (stops.length = hops.length + 1)
function seHop(tt, hops, stops, dur = 0.07) {
  let i = 0;
  while (i < hops.length && tt >= hops[i] + dur) i++;
  const last = i > 0 ? hops[i - 1] : -99;
  if (i < hops.length && tt >= hops[i]) {
    const u = (tt - hops[i]) / dur;
    const from = stops[i], to = stops[i + 1];
    return { lx: lerp(from, to, E.inOutSine(u)), smear: { x0: from, x1: to, k: 1 - 0.4 * u, at: u }, from, to, u, last: hops[i], i: i + 1 };
  }
  return { lx: stops[i], smear: null, from: i > 0 ? stops[i - 1] : stops[0], to: stops[i], u: 1, last, i };
}
// head units: the hop arc (from the old stop to the new one, over each eye) and the ghost left behind at the old stop
function seHopMarks(c, F, H, t, o = {}) {
  if (!H) return;
  const age = H.last > -50 ? (o.tt - H.last) : 99;
  const k = age < 0.55 ? 1 - age / 0.55 : 0;
  if (k <= 0.01 && !H.smear) return;
  paint(() => {
    for (const s of [-1, 1]) {
      const ex = s * OE_EYE.x, ey = OE_EYE.y;
      const x0 = ex + H.from * OE_EYE.SPAN, x1 = ex + H.to * OE_EYE.SPAN, y = ey + (F.ly || 0) * 5.2;
      // the ghost iris at the old stop (inside the eye)
      c.save(); c.beginPath(); c.ellipse(ex, ey, OE_EYE.rx, OE_EYE.ry * (F.open || 1), 0, 0, Math.PI * 2); c.clip();
      circle(c, x0, y, OE_EYE.IR * 0.92, rgba('#7A5230', 0.1 * k));
      c.beginPath(); c.arc(x0, y, OE_EYE.IR * 0.98, 0, 7); c.setLineDash([2.6, 2.0]); c.lineWidth = 1.6;
      c.strokeStyle = rgba('#3A2A20', 0.7 * k); c.stroke(); c.setLineDash([]);
      // speed lines behind the iris while it jumps and just after
      const sl = H.smear ? 1 : clamp(1 - age / 0.16);
      if (sl > 0.01 && Math.abs(x1 - x0) > 0.6) {
        const d = Math.sign(x1 - x0), px = ex + lerp(H.from, H.to, H.smear ? H.u : 1) * OE_EYE.SPAN;
        for (const dy of [-4.5, 0, 4.5]) line(c, px - d * (OE_EYE.IR + 1.5), y + dy, px - d * (OE_EYE.IR + 1.5 + 7 - Math.abs(dy) * 0.6), y + dy, 1.5, rgba('#3A2A20', 0.6 * sl));
      }
      c.restore();
      // the hop arc: a flat dotted bounce from the old iris to the new one, over the top of the iris
      if (Math.abs(x1 - x0) > 0.6) {
        const R = OE_EYE.IR, base = y - R - 1.2, top = base - 6.5;
        const n = 9, prog = H.smear ? H.u : 1, a = 0.95 * Math.max(k, H.smear ? 1 : 0), dr = o.dot || 1.6;
        for (let i = 0; i <= n; i++) {
          const u = i / n; if (u > prog + 0.001) break;
          const px = lerp(x0, x1, u), py = base + 4 * (top - base) * u * (1 - u);
          circle(c, px, py, dr * 1.35, rgba('#0B0B1A', 0.35 * a)); circle(c, px, py, dr, rgba(SEC.hop, a));
        }
        if (prog >= 0.99) {
          const d = Math.sign(x1 - x0), ax = x1 + d * 0.6, ay = base + 0.6, h = dr * 2.0;
          c.beginPath(); c.moveTo(ax + d * h * 0.7, ay + h * 0.7); c.lineTo(ax - d * h * 0.9, ay - h * 0.3); c.lineTo(ax + d * h * 0.1, ay - h * 1.3); c.closePath();
          c.fillStyle = rgba('#0B0B1A', 0.35 * a); c.fill();
          c.beginPath(); c.moveTo(ax + d * h * 0.55, ay + h * 0.5); c.lineTo(ax - d * h * 0.7, ay - h * 0.25); c.lineTo(ax + d * h * 0.05, ay - h * 1.05); c.closePath();
          c.fillStyle = rgba(SEC.hop, a); c.fill();
        }
      }
    }
  });
}
// head units: the smooth trace of the glide under each iris (xs: the lx the iris has swept, from .. to)
function seGlideTrail(c, F, x0, x1, k) {
  if (k <= 0.01 || Math.abs(x1 - x0) < 0.02) return;
  paint(() => {
    for (const s of [-1, 1]) {
      const ex = s * OE_EYE.x, ey = OE_EYE.y, y = ey + (F.ly || 0) * 5.2 + OE_EYE.IR * 1.25;
      c.save(); c.beginPath(); c.ellipse(ex, ey, OE_EYE.rx + 6, OE_EYE.ry + 6, 0, 0, Math.PI * 2); c.clip();
      c.beginPath(); c.moveTo(ex + x0 * OE_EYE.SPAN, y); c.lineTo(ex + x1 * OE_EYE.SPAN, y);
      c.lineWidth = 3.4; c.lineCap = 'round'; c.strokeStyle = rgba('#0B3A2A', 0.45 * k); c.stroke(); c.lineWidth = 2.4; c.strokeStyle = rgba(SEC.glide, 0.95 * k); c.stroke();
      c.restore();
    }
  });
}

// ---------------------------------------------------------------- the foreground hand (screen space)
// Palm to the camera, the index finger up, three fingers curled with their tips showing, the thumb across them, the
// wrist into his yellow cuff. s = 1: the finger is 96 px wide and 300 px from the knuckle to the tip.
function seHandPath(c, s) {
  // the whole outline (for the ghost): finger, fist, wrist, as one closed path in hand units (tip at 0,0)
  c.beginPath();
  c.moveTo(-48, 6); c.arc(0, 6, 48, Math.PI, 0);           // the fingertip
  c.lineTo(48, 300);                                         // the finger's right side down to the knuckle
  c.quadraticCurveTo(150, 280, 160, 360); c.quadraticCurveTo(168, 470, 120, 540);
  c.lineTo(110, 700); c.lineTo(-120, 700); c.lineTo(-128, 540);
  c.quadraticCurveTo(-176, 470, -158, 380); c.quadraticCurveTo(-140, 300, -48, 300);
  c.closePath();
}
function seHand(x, y, s, o = {}) {
  const k = o.k === undefined ? 1 : clamp(o.k), drop = clamp(o.drop || 0);
  if (k <= 0.001) return;
  const dy = (1 - E.outCubic(k)) * 900 + E.inCubic(drop) * 1000;
  screenSpace();
  const c = ctx;
  c.save(); c.translate(x, y + dy); c.rotate(o.rot || 0); c.scale(s, s);
  if (o.ghost) {
    const g = clamp(o.ghost);
    seHandPath(c, s);
    c.setLineDash([16, 12]); c.lineDashOffset = -(o.t || 0) * 40; c.lineWidth = 7; c.strokeStyle = rgba(SEC.cyan, 0.9 * g); c.stroke(); c.setLineDash([]);
    c.fillStyle = rgba('#3FA8FF', 0.08 * g); c.fill();
    c.save(); c.translate(-6, 600); c.rotate(0.42); rrect(c, -150, -40, 300, 1500, 120); c.setLineDash([16, 12]); c.lineWidth = 6; c.strokeStyle = rgba(SEC.cyan, 0.55 * g); c.stroke(); c.setLineDash([]); c.restore();
    // the curled fingers, as dashes
    for (const [cx, cy] of [[-96, 410], [-16, 440], [64, 420]]) { c.beginPath(); c.arc(cx, cy, 40, Math.PI * 1.05, Math.PI * 1.95); c.setLineDash([10, 9]); c.lineWidth = 5; c.strokeStyle = rgba(SEC.cyan, 0.65 * g); c.stroke(); c.setLineDash([]); }
    c.restore();
    // its glow (the glow layer is in screen space at half scale already)
    gctx.save(); gctx.translate(x, y + dy); gctx.rotate(o.rot || 0); gctx.scale(s, s);
    seHandPath(gctx, s); gctx.lineWidth = 26; gctx.strokeStyle = rgba(SEC.cyan, 0.35 * g); gctx.stroke();
    gctx.restore();
    softDot(gctx, x, y + dy, 120 * s, SEC.cyan, 0.5 * g);
    return;
  }
  const P = OEPAL;
  actor(() => {
    // the forearm in his yellow sleeve, coming toward the lens from the bottom left
    c.save(); c.translate(-6, 600); c.rotate(0.42);
    rrect(c, -150, -40, 300, 1500, 120); c.fillStyle = P.coat; c.fill();
    rrect(c, -150, -40, 86, 1500, 60); c.fillStyle = P.coatSh; c.fill();
    rrect(c, 96, -40, 54, 1500, 40); c.fillStyle = P.coatHi; c.fill();
    rrect(c, -164, -54, 328, 84, 34); c.fillStyle = P.coatDk; c.fill();          // the cuff
    rrect(c, -150, -46, 300, 24, 12); c.fillStyle = P.coatHi; c.fill();
    c.restore();
    // the wrist
    rrect(c, -112, 470, 214, 120, 50); c.fillStyle = P.skinSh; c.fill();
    // the palm and the fist (palm to us)
    c.beginPath(); c.moveTo(-150, 360); c.quadraticCurveTo(-170, 470, -112, 540); c.lineTo(112, 540); c.quadraticCurveTo(168, 470, 152, 360);
    c.quadraticCurveTo(140, 290, 40, 296); c.lineTo(-60, 296); c.quadraticCurveTo(-142, 300, -150, 360); c.closePath();
    c.fillStyle = P.skin; c.fill();
    // the index finger, up
    c.beginPath(); c.moveTo(-48, 330); c.lineTo(-48, 6); c.arc(0, 6, 48, Math.PI, 0); c.lineTo(48, 330); c.closePath(); c.fillStyle = P.skin; c.fill();
    c.beginPath(); c.moveTo(-48, 330); c.lineTo(-48, 6); c.arc(0, 6, 48, Math.PI, Math.PI * 1.32); c.lineTo(-30, 330); c.closePath(); c.fillStyle = P.skinSh; c.fill();
    // three curled fingers across the palm: their tips toward us
    for (const [cx, cy, w] of [[-92, 404, 72], [-14, 416, 76], [66, 404, 70]]) {
      rrect(c, cx - w / 2, cy - 44, w, 96, 34); c.fillStyle = P.skinSh; c.fill();
      rrect(c, cx - w / 2 + 6, cy - 40, w - 12, 82, 30); c.fillStyle = P.skin; c.fill();
    }
    // the thumb across the curled fingers
    c.beginPath(); c.moveTo(-150, 468); c.quadraticCurveTo(-60, 430, 40, 470); c.quadraticCurveTo(70, 486, 40, 510); c.quadraticCurveTo(-60, 520, -140, 528); c.closePath();
    c.fillStyle = P.skinSh; c.fill();
    c.beginPath(); c.moveTo(-146, 474); c.quadraticCurveTo(-60, 440, 34, 476); c.quadraticCurveTo(56, 488, 32, 502); c.quadraticCurveTo(-60, 510, -140, 516); c.closePath();
    c.fillStyle = P.skin; c.fill();
  });
  paint(() => {
    // creases, the pad of the fingertip, a highlight
    c.lineCap = 'round';
    for (const yy of [150, 238]) { c.beginPath(); c.moveTo(-26, yy); c.quadraticCurveTo(0, yy + 8, 26, yy); c.lineWidth = 4; c.strokeStyle = rgba('#B8644A', 0.55); c.stroke(); }
    ellipse(c, 10, 28, 22, 30, rgba(P.skinHi, 0.55));
    for (const cx of [-92, -14, 66]) { c.beginPath(); c.moveTo(cx - 20, 392); c.quadraticCurveTo(cx, 404, cx + 20, 392); c.lineWidth = 3.4; c.strokeStyle = rgba('#B8644A', 0.5); c.stroke(); }
  });
  c.restore();
  if ((o.glow || 0) > 0.01) softDot(gctx, x, y + dy, 90 * s, '#FFF2C0', 0.45 * o.glow);
}
// the fingertip on screen: F = [fx, fy] in head units from the middle of his head (the finger is nearer the lens than
// his face, so it is drawn bigger: `near` x his zoom)
function seFingerAt(cam, r, F) {
  return toScreen(cam, ...r.rp(oeHeadLocal(r.st, F[0], F[1])));
}

// ---------------------------------------------------------------- the viewfinder and the scanpath (screen space)
function seViewfinder(t, o = {}) {
  screenSpace();
  const x0 = 110, x1 = 970, y0 = o.y0 || 330, y1 = o.y1 || 1150, L = 90, w = 9;
  const col = '#FFFFFF';
  paint(() => {
    for (const [x, y, sx, sy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) {
      line(ctx, x, y, x + sx * L, y, w, rgba('#0B0B1A', 0.35)); line(ctx, x, y, x, y + sy * L, w, rgba('#0B0B1A', 0.35));
      line(ctx, x, y, x + sx * L, y, w - 3, col); line(ctx, x, y, x, y + sy * L, w - 3, col);
    }
    // the centre cross
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    line(ctx, cx - 26, cy, cx + 26, cy, 4, rgba(col, 0.85)); line(ctx, cx, cy - 26, cx, cy + 26, 4, rgba(col, 0.85));
    // REC
    const on = Math.floor(t * 2) % 2 === 0;
    if (on) { circle(ctx, x0 + 44, y0 + 54, 15, '#FF2E44'); softDot(gctx, x0 + 44, y0 + 54, 30, '#FF2E44', 0.6); }
    ctx.font = '900 46px Montserrat'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 8; ctx.lineJoin = 'round'; ctx.strokeStyle = rgba('#0B0B1A', 0.5); ctx.strokeText('REC', x0 + 72, y0 + 56);
    ctx.fillStyle = '#FFFFFF'; ctx.fillText('REC', x0 + 72, y0 + 56);
  });
}
function seScanpath(pts, k, t) {
  if (k <= 0.01 || !pts.length) return;
  screenSpace();
  paint(() => {
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
      line(ctx, ax, ay, bx, by, 10, rgba('#0B0B1A', 0.4 * k)); line(ctx, ax, ay, bx, by, 6, rgba(SEC.hop, 0.95 * k));
    }
    for (let i = 0; i < pts.length; i++) {
      const [x, y] = pts[i], r = i === pts.length - 1 ? 26 : 20;
      circle(ctx, x, y, r + 5, rgba('#0B0B1A', 0.45 * k)); circle(ctx, x, y, r, rgba(SEC.hop, k));
      circle(ctx, x, y, r * 0.45, rgba('#FFFFFF', k));
      softDot(gctx, x, y, r * 2.2, SEC.hop, 0.45 * k);
    }
  });
}

// ---------------------------------------------------------------- the tow lines (screen space)
// eyes: [[x, y], [x, y]] the pupils on screen; tip: the fingertip; k draws them on; o.taut, o.pull (beads move to the eyes)
function seTow(eyes, tip, k, t, o = {}) {
  if (k <= 0.01) return;
  screenSpace();
  paint(() => {
    for (const [ex, ey] of eyes) {
      const mx = (ex + tip[0]) / 2, my = (ey + tip[1]) / 2 + 40 * (1 - (o.taut || 0.8));
      const n = 26, upto = Math.floor(n * clamp(k));
      for (let i = 0; i <= upto; i++) {
        const u = i / n, px = (1 - u) * (1 - u) * tip[0] + 2 * u * (1 - u) * mx + u * u * ex, py = (1 - u) * (1 - u) * tip[1] + 2 * u * (1 - u) * my + u * u * ey;
        circle(ctx, px, py, 10, rgba('#0B0B1A', 0.4)); circle(ctx, px, py, 7, SEC.glide); softDot(gctx, px, py, 14, SEC.glide, 0.35);
      }
      // a bead pulling along it toward the eye
      const bu = ((t * 1.1) % 1);
      if (k >= 0.99) {
        const px = (1 - bu) * (1 - bu) * tip[0] + 2 * bu * (1 - bu) * mx + bu * bu * ex, py = (1 - bu) * (1 - bu) * tip[1] + 2 * bu * (1 - bu) * my + bu * bu * ey;
        circle(ctx, px, py, 11, '#FFFFFF'); softDot(gctx, px, py, 26, SEC.glide, 0.8);
      }
    }
    // the clip on the fingertip
    if (k > 0.6) { circle(ctx, tip[0], tip[1], 16, '#0B0B1A'); circle(ctx, tip[0], tip[1], 11, SEC.glide); circle(ctx, tip[0] - 3, tip[1] - 3, 4, '#FFFFFF'); }
  });
}

// ---------------------------------------------------------------- the dark
function seDarkBg(t) {
  screenSpace();
  const g = ctx.createRadialGradient(540, 900, 80, 540, 900, 1250);
  g.addColorStop(0, SEC.navy0); g.addColorStop(0.55, SEC.navy1); g.addColorStop(1, SEC.navy2);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
// a dashed glowing nerve from the fingertip down out of frame and back up to his head: pts = a polyline (screen)
function seNerve(pts, k, beads, t) {
  if (k <= 0.01) return;
  screenSpace();
  const segs = []; let L = 0;
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(d); L += d; }
  const at = (u) => {
    let d = u * L;
    for (let i = 0; i < segs.length; i++) {
      if (d <= segs[i] || i === segs.length - 1) { const v = clamp(d / segs[i]); return [lerp(pts[i][0], pts[i + 1][0], v), lerp(pts[i][1], pts[i + 1][1], v)]; }
      d -= segs[i];
    }
    return pts[pts.length - 1];
  };
  paint(() => {
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.setLineDash([18, 14]); ctx.lineDashOffset = -t * 60; ctx.lineWidth = 7; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.strokeStyle = rgba('#FF93B0', 0.85 * k); ctx.stroke(); ctx.setLineDash([]);
  });
  gctx.save(); gctx.beginPath(); gctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) gctx.lineTo(pts[i][0], pts[i][1]);
  gctx.lineWidth = 22; gctx.strokeStyle = rgba('#FF93B0', 0.3 * k); gctx.stroke(); gctx.restore();
  for (const u of beads || []) {
    if (u < 0 || u > 1) continue;
    const [x, y] = at(u);
    circle(ctx, x, y, 15, '#FFFFFF'); softDot(gctx, x, y, 44, '#FF93B0', 0.95);
  }
}
// the butterfly in the dark: two tiny eyes that blink and look
function seButterEyes(x, y, s, t, o = {}) {
  screenSpace();
  const bl = clamp(o.blink || 0), look = o.look || [0, 0];
  paint(() => {
    for (const sd of [-1, 1]) {
      const ex = x + sd * 15 * s, ey = y;
      ellipse(ctx, ex, ey, 11 * s, 13 * s * (1 - 0.9 * bl), '#FFFFFF');
      if (bl < 0.7) circle(ctx, ex + look[0] * 4 * s, ey + look[1] * 4 * s, 5.4 * s, '#14102A');
    }
  });
  softDot(gctx, x, y, 34 * s, '#C8E4FF', 0.25);
}
// a small rubber stamp
function seStamp(txt, x, y, k, col = SEC.red, rot = -0.1, size = 54) {
  if (k <= 0.01) return;
  const e = E.outBack(clamp(k), 2.2) * (1 + 0.5 * (1 - clamp(k)));
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(e, e); ctx.globalAlpha = clamp(k * 1.5);
  ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + size * 0.8, h = size * 1.45;
  rrect(ctx, -w / 2, -h / 2, w, h, 12); ctx.lineWidth = 8; ctx.strokeStyle = col; ctx.stroke();
  ctx.fillStyle = col; ctx.fillText(txt, 0, 3);
  ctx.restore();
}

// ---------------------------------------------------------------- blinks (acting, ship bar 7d)
// the big eyes are drawn over the rig's own, so acting.js's automatic blinks never show: blink them here, on the cue
// list `blinks` (make_timeline.py), 0.15 s each, both lids together
function seBlinkK(t) {
  const bs = (TLd && TLd.cues && TLd.cues.blinks) || [];
  let k = 0;
  for (const b of bs) { const u = (t - b) / 0.15; if (u > 0 && u < 1) k = Math.max(k, Math.sin(Math.PI * u)); }
  return k;
}
const _seOeEyes = oeEyes;
oeEyes = function (c, pal, F = {}, t = 0) {
  const bk = seBlinkK(t);
  if (bk > 0.01) F = Object.assign({}, F, { shutR: Math.max(F.shutR || 0, bk), shutL: Math.max(F.shutL || 0, bk) });
  return _seOeEyes(c, pal, F, t);
};
