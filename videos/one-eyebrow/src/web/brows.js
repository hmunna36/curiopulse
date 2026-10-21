// one-eyebrow (22 Oct 2026): the topic is his eyebrows, so his head is drawn again over the rig's, in head units (origin at
// the head's middle, as mirror.js's mirInHead gives it):
//   ebHeadBase(c, pal, H, t) the skin, the hair pushed back by a pink spa headband (it gives him a forehead to lift his brows
//                            into; the rig's brows sit at its hairline), the rig's face without its brows and mouth
//   ebHeadFront(c, pal, H, t, glass)  his own larger brows (each on its own), the forehead lines, a mouth with a corner each
//   ebBrow(c, s, B, t)       one brow: s = -1 screen-left (his right), +1 screen-right (his left)
//   ebWrinkles, ebMouth      the forehead lines a lift makes; a mouth whose corners rise or droop on their own
//   ebString(c, a, b, o)     a puppet string from a to b, taut or slack
//   ebHandle(c, x, y, s, o)  a wooden puppet handle (a cross of two bars)
//   ebDome / ebBrain         his forehead and hair as glass, and the brain's two halves inside it, each holding its strings
//   ebFinger(lc, st, rr, pal, F)   his hand at his temple: the index finger pointing at a brow, or pressing it down
// Brow and corner states are by SCREEN side throughout: l = screen-left (his right), r = screen-right (his left).
'use strict';

const EB = { y: -26, x0: 8, x1: 41, rise: 14 };          // a brow at rest, from x0 to x1 out from the middle; rise = up at lift 1
const EB_BAND = '#FF8FB4', EB_BAND_SH = '#E86A96', EB_BAND_HI = '#FFC6DA';
const EB_GLASS = '#0E1A3E', EB_SKY = '#7FE9FF', EB_ORANGE = '#FFB04A', EB_PINK = '#FF9EC0';
const EB_HALF = { l: { col: '#7FE9FF', dk: '#2F8FB0' }, r: { col: '#FFB04A', dk: '#C0731E' } };   // whose string is whose

// ---------------------------------------------------------------- a brow
// B: {lift 0..1.2, tilt (+ = the inner end up, worried; - = down, cross), arch (+ = rounder), shake (a tremble, 0..1),
//     press 0..1 (a finger pushing it down: it flattens and drops)}
function ebBrowGeo(s, B = {}, t = 0) {
  const k = (B.lift || 0) - 0.5 * (B.press || 0), tilt = B.tilt || 0, sh = (B.shake || 0) * Math.sin(t * 61 + s * 1.7) * 1.4;
  const yIn = EB.y - k * EB.rise - tilt * 3.5 + sh + 3 * (B.press || 0);
  const yOut = EB.y + 2.5 - k * EB.rise * 0.82 + tilt * 1.6 + sh * 0.6 + 2 * (B.press || 0);
  const arch = 3.4 + 3.2 * Math.max(0, k) + 4 * (B.arch || 0) - 2.5 * (B.press || 0);
  const a = [s * EB.x0, yIn], b = [s * EB.x1, yOut], m = [s * (EB.x0 + EB.x1) / 2, (yIn + yOut) / 2 - arch * 2];
  return { a, b, m, k };
}
function ebBrowAt(G, u) {   // a point and the normal on the brow's curve, u 0 (inner end) .. 1 (outer end)
  const { a, b, m } = G, v = 1 - u;
  const p = [v * v * a[0] + 2 * u * v * m[0] + u * u * b[0], v * v * a[1] + 2 * u * v * m[1] + u * u * b[1]];
  const d = [2 * v * (m[0] - a[0]) + 2 * u * (b[0] - m[0]), 2 * v * (m[1] - a[1]) + 2 * u * (b[1] - m[1])], L = Math.hypot(d[0], d[1]) || 1;
  return { p, n: [-d[1] / L, d[0] / L] };
}
function ebBrow(c, s, B = {}, t = 0, col = '#2A1B14') {
  const G = ebBrowGeo(s, B, t), N = 14, top = [], bot = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N, { p, n } = ebBrowAt(G, u);
    const w = lerp(10.2, 3.6, Math.pow(u, 1.35)) * (1 - 0.18 * (B.press || 0));
    const sg = n[1] < 0 ? 1 : -1;   // the side of the normal that points up
    top.push([p[0] + n[0] * w * 0.55 * sg, p[1] + n[1] * w * 0.55 * sg]); bot.push([p[0] - n[0] * w * 0.45 * sg, p[1] - n[1] * w * 0.45 * sg]);
  }
  c.beginPath(); c.moveTo(top[0][0], top[0][1]);
  for (const q of top) c.lineTo(q[0], q[1]);
  for (let i = bot.length - 1; i >= 0; i--) c.lineTo(bot[i][0], bot[i][1]);
  c.closePath(); c.fillStyle = col; c.fill();
  // a few hairs at the inner end, so it reads as a brow and not a stroke
  for (let i = 0; i < 3; i++) { const q = ebBrowAt(G, 0.04 + i * 0.05).p; line(c, q[0], q[1] + 2.5, q[0] + s * 1.2, q[1] - 4.2, 1.6, col); }
  return G;
}
// the lines a lift puts in the forehead above one brow (k 0..1)
function ebWrinkles(c, s, k, B = {}) {
  if (k <= 0.12) return;
  const a = clamp((k - 0.12) / 0.55), G = ebBrowGeo(s, B, 0);
  for (let i = 0; i < 3; i++) {
    const dy = 7.5 + i * 5.2, al = a * (0.62 - i * 0.12);
    if (G.a[1] - dy < -51) continue;   // never under the band
    c.beginPath(); c.moveTo(s * 5, G.a[1] - dy + 1.5); c.quadraticCurveTo(s * 21, G.m[1] - dy * 0.92, s * (35 - i * 3), G.b[1] - dy + 0.5);
    c.lineWidth = 2.1 - i * 0.3; c.lineCap = 'round'; c.strokeStyle = `rgba(176,96,66,${al})`; c.stroke();
  }
}

// ---------------------------------------------------------------- a mouth with a corner each
// M: {l, r: how far each corner rises (+) or droops (-), 0..1; open 0..1 (an 'o' of surprise); twist (-1..1: pulled sideways,
//     the strain face); tongue 0..1 (its tip poking out of the pulled corner)}
function ebMouth(c, pal, M = {}) {
  const l = M.l || 0, r = M.r || 0, tw = M.twist || 0, op = M.open || 0;
  const y0 = 40, xl = -15 - 2 * Math.max(0, l) + 6 * tw, xr = 15 + 2 * Math.max(0, r) + 6 * tw;
  const yl = y0 - 7.5 * l + 1.5 * Math.abs(tw), yr = y0 - 7.5 * r + 1.5 * Math.abs(tw);
  if (op > 0.05) {   // surprise: a small round mouth
    ellipse(c, 6 * tw, y0 + 1, 6 + 4 * op, 6.5 + 7 * op, pal.mouth);
    ellipse(c, 6 * tw, y0 + 4.5 + 3 * op, 4 + 2.5 * op, 2.4 + 1.6 * op, pal.tongue);
    return;
  }
  const mid = (yl + yr) / 2 + 3.5 + 2.2 * Math.max(0, (l + r) / 2);
  if ((M.tongue || 0) > 0.02) {   // the tip of his tongue out of one corner, from concentrating
    const sd = tw >= 0 ? 1 : -1, tx = sd > 0 ? xr - 2 : xl + 2, ty = sd > 0 ? yr + 2 : yl + 2;
    ellipse(c, tx + sd * 3 * M.tongue, ty + 2.5 * M.tongue, 4.6 * M.tongue + 0.5, 3.8 * M.tongue + 0.4, pal.tongue, sd * 0.5);
  }
  c.beginPath(); c.moveTo(xl, yl); c.quadraticCurveTo(lerp(xl, xr, 0.5), mid, xr, yr);
  c.lineWidth = 5.2; c.lineCap = 'round'; c.strokeStyle = pal.mouth; c.stroke();
  // a dimple at a corner that is up, a crease at one that droops
  for (const [x, y, k, sd] of [[xl, yl, l, -1], [xr, yr, r, 1]]) {
    if (k > 0.25) { c.beginPath(); c.arc(x + sd * 3.4, y - 1.5, 3.2, sd > 0 ? -1.2 : Math.PI - 0.9, sd > 0 ? 0.9 : Math.PI + 1.2); c.lineWidth = 1.7; c.strokeStyle = 'rgba(150,70,50,0.55)'; c.stroke(); }
    if (k < -0.25) line(c, x + sd * 1.5, y + 1, x + sd * 3.5, y + 7 * clamp(-k), 1.8, 'rgba(150,70,50,0.5)');
  }
}

// ---------------------------------------------------------------- his head, again (head units)
// H: {face (the rig's face fields; its brows and mouth are left out), brows: {l, r}, mouth (ebMouth), band 0..1 (the headband
//     on), flush 0..1 (red from straining), sweat 0..1}
function ebHeadPath(c) { c.beginPath(); c.ellipse(0, 0, 64, 70, 0, 0, Math.PI * 2); }
function ebHairPath(c) {
  c.beginPath();
  c.moveTo(-66, 10);
  c.quadraticCurveTo(-74, -54, -30, -70);
  c.quadraticCurveTo(12, -88, 48, -64);
  c.quadraticCurveTo(76, -44, 66, 10);
  // the inner edge, pushed back: up the temple and across under the band
  c.quadraticCurveTo(59, -22, 53, -44);
  c.quadraticCurveTo(0, -62, -53, -44);
  c.quadraticCurveTo(-59, -22, -66, 10);
  c.closePath();
}
function ebHeadBase(c, pal, H = {}, t = 0) {
  // the skin: the rig's head again (the same ellipse and gradient)
  ebHeadPath(c);
  const g = c.createRadialGradient(-24, -26, 8, 0, 0, 78);
  g.addColorStop(0, pal.skinHi); g.addColorStop(0.45, pal.skin); g.addColorStop(1, pal.skinSh);
  c.fillStyle = g; c.fill();
  // the hair, pushed back
  ebHairPath(c); c.fillStyle = pal.hair; c.fill();
  // the headband, round the head under the tuft of hair
  c.beginPath();
  c.moveTo(-60, -37); c.quadraticCurveTo(0, -67, 60, -37);
  c.lineTo(61, -49); c.quadraticCurveTo(0, -81, -61, -49); c.closePath();
  c.fillStyle = EB_BAND; c.fill();
  paint(() => {
    line(c, -20, -70, 4, -74, 3, rgba(pal.hairHi, 0.9));   // the hair's shine, in the tuft above the band
    c.beginPath(); c.moveTo(-56, -45.5); c.quadraticCurveTo(0, -75, 56, -45.5); c.lineWidth = 2.6; c.strokeStyle = rgba(EB_BAND_HI, 0.85); c.stroke();
    c.beginPath(); c.moveTo(-58, -39.5); c.quadraticCurveTo(0, -68.5, 58, -39.5); c.lineWidth = 2.2; c.strokeStyle = rgba(EB_BAND_SH, 0.9); c.stroke();
    for (let i = 0; i < 26; i++) {   // the towelling
      const u = (i + 0.5) / 26, x = lerp(-56, 56, u), y = -43 - 26 * (1 - Math.pow((x / 60), 2)) * 0.92 + (hash(i * 3) - 0.5) * 4;
      circle(c, x, y, 1.15, rgba(EB_BAND_SH, 0.7));
    }
    // the face: the rig's own, with its brows and mouth left out
    const f = Object.assign({}, H.face || FACES.calm, { noBrows: true, mouth: 'none' });
    drawFace(c, f, pal);
    const fl = H.flush || 0;
    if (fl > 0.02) for (const s of [-1, 1]) ellipse(c, s * 36, 22, 15, 9, `rgba(255,70,80,${0.32 * fl})`);
  });
}
// what lies on his face in front of the glass: the forehead lines (not on glass), the brows, the mouth, a sweat drop
function ebHeadFront(c, pal, H = {}, t = 0, glass = 0) {
  paint(() => {
    const B = H.brows || {};
    if (glass < 0.5) { ebWrinkles(c, -1, (B.l && B.l.lift) || 0, B.l); ebWrinkles(c, 1, (B.r && B.r.lift) || 0, B.r); }
    ebBrow(c, -1, B.l || {}, t); ebBrow(c, 1, B.r || {}, t);
    ebMouth(c, pal, H.mouth || {});
  });
  if ((H.sweat || 0) > 0.02) sweatDrop(c, 47, -30 + 8 * H.sweat, 0.42, clamp(H.sweat * 3));
}

// ---------------------------------------------------------------- strings and the handle
// a string from a to b (any units). o: {slack (how far it sags), col, w, glow (into the glow layer, world units only), k (drawn
// on from a, 0..1)}
function ebString(c, a, b, o = {}) {
  const k = o.k === undefined ? 1 : clamp(o.k);
  if (k <= 0.01) return;
  const sl = o.slack || 0, m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + sl];
  const N = 16, pts = [];
  for (let i = 0; i <= N * k; i++) { const u = i / N, v = 1 - u; pts.push([v * v * a[0] + 2 * u * v * m[0] + u * u * b[0], v * v * a[1] + 2 * u * v * m[1] + u * u * b[1]]); }
  c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (const p of pts) c.lineTo(p[0], p[1]);
  c.lineWidth = (o.w || 1.6) + 1.2; c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = 'rgba(30,20,40,0.55)'; c.stroke();
  c.lineWidth = o.w || 1.6; c.strokeStyle = o.col || '#F6EEDB'; c.stroke();
  return pts[pts.length - 1];
}
// a puppet handle: a long bar across and a short one along it (world units; about 120 x 60 at s = 1)
function ebHandle(c, x, y, s, o = {}) {
  c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.scale(s, s);
  rrect(c, -62, -7, 124, 14, 7); c.fillStyle = '#B97A45'; c.fill();
  rrect(c, -9, -34, 18, 62, 8); c.fillStyle = '#A76A38'; c.fill();
  paint(() => {
    line(c, -56, -3, 54, -3, 2.5, 'rgba(255,214,160,0.55)');
    for (const e of [-1, 1]) circle(c, e * 54, 2, 4.2, '#6E4320');
    circle(c, 0, 20, 4.2, '#6E4320');
    for (const yy of [-24, -12]) line(c, -5, yy, 5, yy + 2, 1.6, 'rgba(110,66,30,0.6)');   // the grain
  });
  c.restore();
}

// ---------------------------------------------------------------- the glass forehead and the brain's two halves (head units)
// the outline of his hair and the top of his head, above the brows (y < cut)
function ebDomePath(c, cut = -31) {
  c.beginPath();
  c.moveTo(-63, cut);
  c.quadraticCurveTo(-74, -54, -30, -70);
  c.quadraticCurveTo(12, -88, 48, -64);
  c.quadraticCurveTo(76, -44, 63, cut);
  c.closePath();
}
// where each half's hand is (held up, like a puppeteer's), and the ends of its strings (head units)
const EB_FIST = { l: [-17, -73], r: [17, -73] };
const EB_BROW_PT = (s, B, u = 0.42) => ebBrowAt(ebBrowGeo(s, B || {}, 0), u).p;
const EB_CORNER = (s, M) => [s * (15 + 2 * Math.max(0, (s < 0 ? M.l : M.r) || 0)), 40 - 7.5 * ((s < 0 ? M.l : M.r) || 0)];
// D: {k 0..1 (the glass pops on from his forehead), halves 0..1, pull {l, r} 0..1 (a half tugs its strings), dim {l} 0..1
//     (a half goes dark: a stroke), browStr 0..1 (the brow strings drawn on), mouthStr 0..1, mouthPull {l, r} (a half tugs its
//     mouth string), brows, mouth (to tie the strings to where the brows and corners are)}
function ebDome(c, t, D) {
  const k = clamp(D.k);
  if (k <= 0.01) return;
  const sc = E.outBack(k, 1.4);
  c.save(); c.translate(0, -44); c.scale(sc, sc); c.translate(0, 44);
  ebDomePath(c); c.fillStyle = '#1C3A80'; c.fill();
  paint(() => {
    const g = c.createRadialGradient(-20, -62, 4, 0, -52, 70);
    g.addColorStop(0, 'rgba(140,200,255,0.42)'); g.addColorStop(0.6, 'rgba(60,110,220,0.14)'); g.addColorStop(1, 'rgba(10,20,70,0.35)');
    ebDomePath(c); c.fillStyle = g; c.fill();
    ebDomePath(c); c.lineWidth = 3; c.lineJoin = 'round'; c.strokeStyle = rgba(EB_SKY, 0.95); c.stroke();
    line(c, -40, -60, -24, -71, 2.6, 'rgba(230,245,255,0.55)');   // a glint on the glass
  });
  c.restore();
}
function ebBrainBody(c, t, D) {   // the two halves (drawn under the strings)
  const hk = clamp(D.halves);
  if (hk <= 0.01) return;
  for (const [sd, key] of [[-1, 'l'], [1, 'r']]) {
    const s = E.outBack(clamp(hk * 1.15 - (sd > 0 ? 0.15 : 0)), 1.6);
    if (s <= 0.01) continue;
    const dim = clamp((D.dim && D.dim[key]) || 0), pull = Math.max(clamp((D.pull && D.pull[key]) || 0), 0.7 * clamp((D.mouthPull && D.mouthPull[key]) || 0));
    const cx = sd * 22.5, cy = -52.5;
    const body = mixH(EB_PINK, '#8F8AA0', dim), dk = mixH('#D9668F', '#5E5A70', dim);
    const fist = ebFistAt(key, D);
    // the arm up to the fist that holds the strings
    line(c, sd * 9, -63, fist[0], fist[1] + 2, 3.2, body);
    c.save(); c.translate(cx, cy); c.scale(s * 0.95, s * 0.95);
    // the half: a lobe, its flat side to the middle
    c.beginPath(); c.moveTo(-sd * 1.5, -15); c.bezierCurveTo(sd * 16, -19, sd * 26, -8, sd * 23, 4); c.bezierCurveTo(sd * 21, 13, sd * 6, 15, -sd * 1.5, 12); c.closePath();
    c.fillStyle = body; c.fill();
    paint(() => {
      for (const [x0, y0, x1, y1, x2, y2] of [[2, -9, 9, -13, 15, -8], [5, -2, 12, -5, 19, -1], [3, 6, 10, 3, 17, 7]]) {
        c.beginPath(); c.moveTo(sd * x0, y0); c.quadraticCurveTo(sd * x1, y1, sd * x2, y2); c.lineWidth = 1.6; c.strokeStyle = rgba(dk, 0.7); c.stroke();
      }
      // a face: dots for eyes (shut lines when it is dark), a mouth that grits when it pulls
      const ex = sd * 11, ey = 1;
      if (dim > 0.5) { for (const e of [-1, 1]) line(c, ex + e * 3.6 - 1.7, ey - 3.5, ex + e * 3.6 + 1.7, ey - 3.5, 1.5, '#3A3550'); line(c, ex - 2.4, ey + 3, ex + 2.4, ey + 3, 1.3, '#3A3550'); }
      else {
        for (const e of [-1, 1]) { ellipse(c, ex + e * 3.6, ey - 3.5, 1.9, 2.3 - 0.9 * pull, '#2A1830'); circle(c, ex + e * 3.6 - 0.6, ey - 4.3, 0.6, '#FFFFFF'); }
        if (pull > 0.2) { rrect(c, ex - 3.4, ey + 1.2, 6.8, 3.4, 1.4); c.fillStyle = '#FFFFFF'; c.fill(); c.lineWidth = 1; c.strokeStyle = '#2A1830'; c.stroke(); line(c, ex - 3, ey + 2.9, ex + 3, ey + 2.9, 0.8, '#2A1830'); }
        else { c.beginPath(); c.moveTo(ex - 2.6, ey + 2.2); c.quadraticCurveTo(ex, ey + 4.4, ex + 2.6, ey + 2.2); c.lineWidth = 1.3; c.strokeStyle = '#2A1830'; c.stroke(); }
      }
    });
    c.restore();
  }
}
function ebFistAt(key, D) {
  const pull = Math.max(clamp((D.pull && D.pull[key]) || 0), 0.7 * clamp((D.mouthPull && D.mouthPull[key]) || 0)), dim = clamp((D.dim && D.dim[key]) || 0);
  const f0 = EB_FIST[key];
  return [f0[0] * (1 - 0.12 * dim), f0[1] - 3.2 * pull + 9 * dim];
}
// the strings out of each half's fist: forked to BOTH brows, and (D.mouthStr) one crossed to the far corner of the mouth;
// then the fists over them. g: the glow layer in head units (or null)
function ebHalfStrings(c, t, D) {
  const bs = clamp(D.browStr || 0), ms = clamp(D.mouthStr || 0), hk = clamp(D.halves);
  if (hk <= 0.5) return;
  for (const [sd, key] of [[-1, 'l'], [1, 'r']]) {
    const dim = clamp((D.dim && D.dim[key]) || 0), pull = clamp((D.pull && D.pull[key]) || 0), mp = clamp((D.mouthPull && D.mouthPull[key]) || 0);
    const col = mixH(EB_HALF[key].col, '#77738A', dim), fist = ebFistAt(key, D);
    const slackB = (1 - pull) * 2.2 + 8 * dim, knot = [fist[0] * 0.55, fist[1] + 14 + 4 * dim];
    if (bs > 0.01) {
      ebString(c, fist, knot, { col, w: 2.2, k: clamp(bs * 3), slack: 1.5 * dim });
      for (const s of [-1, 1]) ebString(c, knot, EB_BROW_PT(s, (D.brows || {})[s < 0 ? 'l' : 'r']), { col, w: 2.0, slack: slackB, k: clamp(bs * 1.6 - 0.25) });
      if (bs > 0.3) circle(c, knot[0], knot[1], 2.4, col);
    }
    if (ms > 0.01) ebString(c, fist, EB_CORNER(-sd, D.mouth || {}), { col, w: 2.0, slack: (1 - mp) * 3 + 12 * dim, k: ms });
    if (bs > 0.01 || ms > 0.01) { circle(c, fist[0], fist[1], 4.2, mixH(EB_PINK, '#8F8AA0', dim)); c.lineWidth = 1.1; c.strokeStyle = rgba(mixH('#D9668F', '#5E5A70', dim), 0.9); c.stroke(); }
  }
}
// green ticks beside the brows (the doctor's check), k 0..1 each
function ebTicks(c, kl, kr) {
  for (const [s, k] of [[-1, kl], [1, kr]]) {
    if (k <= 0.01) continue;
    const x = s * 54, y = -47, r = 7.5 * E.outBack(clamp(k * 1.6), 2);
    circle(c, x, y, r, '#1FB86A');
    if (k > 0.3) { const q = clamp((k - 0.3) / 0.5); c.beginPath(); c.moveTo(x - 3.6, y + 0.2); c.lineTo(x - 1, y + 3); if (q > 0.4) c.lineTo(lerp(x - 1, x + 4.2, (q - 0.4) / 0.6), lerp(y + 3, y - 3.4, (q - 0.4) / 0.6)); c.lineWidth = 2.2; c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = '#FFFFFF'; c.stroke(); }
  }
}

// ---------------------------------------------------------------- his hand at his temple (rig-local, in charLayer's post)
// F: {on 0..1 (up from below), press 0..1 (0 = the finger points at the screen-right brow from beside it, 1 = it lies on the
//     brow and holds it down), tap 0..1 (a little poke at the brow), B (that brow's state, to sit on it)}
function ebFinger(lc, st, rr, pal, F) {
  const on = clamp(F.on);
  if (on <= 0.01) return null;
  const P = (x, y) => mirHeadLocal(st, x, y);
  const low = 1 - on, L = 120 * low * low;
  const pr = clamp(F.press || 0), tap = F.tap || 0;
  const G = ebBrowGeo(1, F.B || {}, 0);
  // the fingertip: beside the brow's outer half pointing at it, or flat on top of it holding it down
  const tipPoint = [G.b[0] + 9 - 3 * tap, G.b[1] - 6 + 2 * tap], tipPress = [lerp(G.a[0], G.b[0], 0.55), G.m[1] - 1];
  const tipL = [lerp(tipPoint[0], tipPress[0], pr), lerp(tipPoint[1], tipPress[1], pr) + L];
  const knL = [lerp(66, 58, pr), lerp(-14, -26, pr) + L], fistL = [lerp(72, 66, pr), lerp(2, -10, pr) + L];
  const tip = P(tipL[0], tipL[1]), kn = P(knL[0], knL[1]), fist = P(fistL[0], fistL[1]);
  const wr = P(lerp(84, 80, pr), lerp(24, 12, pr) + L), el = rr.elR;
  capsuleShaded(lc, el, wr, 38, pal.coat, pal.coatSh, pal.coatHi, pal);
  line(lc, lerp(el[0], wr[0], 0.86), lerp(el[1], wr[1], 0.86), wr[0], wr[1], 42, pal.coatSh);
  circle(lc, fist[0], fist[1], 17.5, pal.skin);
  line(lc, kn[0], kn[1], tip[0], tip[1], 11.6, pal.skin);
  line(lc, fist[0], fist[1], kn[0], kn[1], 15, pal.skin);
  paint(() => {
    const dx = tip[0] - kn[0], dy = tip[1] - kn[1], Ln = Math.hypot(dx, dy) || 1;
    ellipse(lc, tip[0] - dx / Ln * 3.2, tip[1] - dy / Ln * 3.2, 3.4, 4.4, 'rgba(255,226,214,0.85)', Math.atan2(dy, dx) + Math.PI / 2);
    for (let i = 0; i < 3; i++) line(lc, fist[0] - 4 + i * 5, fist[1] + 6, fist[0] - 1 + i * 5, fist[1] + 14, 2.1, 'rgba(170,88,60,0.45)');   // the curled fingers
    line(lc, kn[0] - 3, kn[1] - 2, kn[0] + 3, kn[1] + 3, 1.7, 'rgba(170,88,60,0.4)');
  });
  return { tip, fist };
}
