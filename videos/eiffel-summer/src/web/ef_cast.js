// The EIFFEL TOWER Gets Taller in Summer: the cast and the props (10 Nov 2026). The hero as a summer tourist in Paris (a coral
// shirt with his backpack straps, khaki trousers, a navy beret, sunburn that grows), his phone (a ruler app on its screen, or
// its back with the camera), his forearm and hand seen from behind, a ginger cafe cat that can stretch, a single hair, glowing
// slivers of iron, girders with rivets, the city seen from high on the tower, and the label pills.
'use strict';

const EFPAL = Object.assign({}, PAL, {
  coat: '#FF7F5C', coatSh: '#E0573A', coatHi: '#FFB096', coatDk: '#B9432A',
  strap: '#2B4C7E', strapSh: '#1C3358', shortSleeve: true,
  pants: '#D9C597', pantsSh: '#B8A16E',
});

// his head's frame in world space (for things worn on the head: beret, sunburn, sweat). Call fn(c) in head units.
function efOnHead(c, st, r, fn) {
  const hp = toWorld(st, r.head);
  c.save(); c.translate(hp[0] + (st.headDX || 0) * st.s, hp[1] + (st.headDY || 0) * st.s); c.rotate(r.lean + (st.headRot || 0)); c.scale(st.s, st.s);
  fn(c);
  c.restore();
}
// the beret: navy felt, tilted, with its little stalk
function efBeret(c, st, r) {
  efOnHead(c, st, r, (x) => {
    x.save(); x.translate(10, -64); x.rotate(-0.2);
    ellipse(x, 0, 6, 74, 24, '#1A2550');
    ellipse(x, -4, -2, 68, 20, '#24336B');
    ellipse(x, -18, -10, 30, 7, rgba('#4A5FA8', 0.8));
    rrect(x, -3, -30, 6, 12, 3); x.fillStyle = '#1A2550'; x.fill();
    x.restore();
  });
}
// sunburn: red cheeks and a red nose (paint), 0..1
function efSunburn(c, st, r, k) {
  if (k <= 0.01) return;
  efOnHead(c, st, r, (x) => paint(() => {
    ellipse(x, -36, 22, 19, 12, rgba('#FF3B3B', 0.42 * k));
    ellipse(x, 36, 22, 19, 12, rgba('#FF3B3B', 0.42 * k));
    ellipse(x, 0, 15, 11, 9, rgba('#FF3030', 0.5 * k));
    ellipse(x, 0, -44, 46, 9, rgba('#FF5A4A', 0.25 * k));   // a pink forehead line under the beret
  }));
}
function efSweat(c, st, r, k, t) {
  if (k <= 0.01) return;
  efOnHead(c, st, r, (x) => {
    const u = (t * 0.9) % 1;
    sweatDrop(x, 58, -20 + 30 * u, 1.1, k);
  });
}

// ---------------------------------------------------------------- the phone
// upright, centred at (x, y), height h. o: {face: 'ruler' | 'back', rot, glow}
function efPhone(c, x, y, h, o = {}) {
  const w = h * 0.48;
  c.save(); c.translate(x, y); c.rotate(o.rot || 0);
  rrect(c, -w / 2, -h / 2, w, h, w * 0.17); c.fillStyle = '#20232F'; c.fill();
  if (o.face === 'back') {
    rrect(c, -w / 2 + w * 0.08, -h / 2 + w * 0.08, w * 0.5, w * 0.5, w * 0.12); c.fillStyle = '#2E3343'; c.fill();
    for (const [px, py] of [[0.2, 0.2], [0.2, 0.42], [0.42, 0.3]]) {
      circle(c, -w / 2 + w * px + w * 0.04, -h / 2 + w * py + w * 0.02, w * 0.1, '#0E1018');
      circle(c, -w / 2 + w * px + w * 0.02, -h / 2 + w * py, w * 0.035, '#5D6B8F');
    }
    paint(() => { c.globalAlpha = 0.5; circle(c, w * 0.02, h * 0.08, w * 0.12, '#3A4054'); c.globalAlpha = 1; });
  } else {
    const ix = -w / 2 + w * 0.07, iy = -h / 2 + w * 0.07, iw = w * 0.86, ih = h - w * 0.14;
    paint(() => {
      rrect(c, ix, iy, iw, ih, w * 0.12); c.fillStyle = '#FFF7DF'; c.fill();
      // a ruler along the left edge: 15 cm, a long tick every cm, numbers every 5
      const n = 15;
      c.strokeStyle = '#2A2A36'; c.fillStyle = '#2A2A36';
      for (let i = 0; i <= n * 2; i++) {
        const yy = iy + ih - 6 - ((ih - 12) * i) / (n * 2), L = i % 2 === 0 ? (i % 10 === 0 ? iw * 0.42 : iw * 0.28) : iw * 0.15;
        c.lineWidth = Math.max(1, h * 0.006); c.beginPath(); c.moveTo(ix, yy); c.lineTo(ix + L, yy); c.stroke();
      }
      c.font = `900 ${Math.round(h * 0.075)}px Montserrat`; c.textAlign = 'left'; c.textBaseline = 'middle';
      for (const i of [5, 10, 15]) c.fillText(String(i), ix + iw * 0.47, iy + ih - 6 - ((ih - 12) * i) / n);
      c.font = `900 ${Math.round(h * 0.1)}px Montserrat`; c.textAlign = 'center'; c.fillStyle = '#E8473C';
      c.save(); c.translate(ix + iw * 0.72, iy + ih * 0.5); c.rotate(-Math.PI / 2); c.fillText('15 cm', 0, 0); c.restore();
    });
  }
  c.restore();
}
// a hand gripping the phone's lower half (drawn after the phone): fingers wrapped round the far edge, the thumb on the near
function efGrip(c, x, y, h, rot, pal = EFPAL, back = false) {
  const w = h * 0.48;
  c.save(); c.translate(x, y); c.rotate(rot || 0);
  const s = h / 150;
  if (back) {   // seen from behind the phone: four fingertips over the top edge of its back, lower half held
    for (let i = 0; i < 4; i++) { rrect(c, w / 2 - 14 * s, h * 0.06 + i * 15 * s, 26 * s, 13 * s, 6 * s); c.fillStyle = pal.skin; c.fill(); }
    rrect(c, -w / 2 - 12 * s, h * 0.12, 24 * s, 34 * s, 10 * s); c.fillStyle = pal.skin; c.fill();
  } else {
    rrect(c, -w / 2 - 10 * s, h * 0.1, 22 * s, 42 * s, 10 * s); c.fillStyle = pal.skin; c.fill();   // thumb on the near edge
    for (let i = 0; i < 3; i++) { rrect(c, w / 2 - 12 * s, h * 0.08 + i * 15 * s, 22 * s, 13 * s, 6 * s); c.fillStyle = pal.skinSh; c.fill(); }
  }
  c.restore();
}
// his forearm and hand seen from behind, rising from the bottom-right corner to the wrist at (wx, wy), holding the phone
// upright (its back to us). Returns the phone's centre.
function efArmFromBehind(c, ex, ey, wx, wy, ph, pal = EFPAL) {
  capsuleShaded(c, [ex, ey], [wx, wy], 92, pal.skin, pal.skinSh, pal.skinHi, pal);
  // the cuff of the short sleeve at the bottom
  const dx = wx - ex, dy = wy - ey, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
  line(c, ex - ux * 20, ey - uy * 20, ex + ux * 30, ey + uy * 30, 120, pal.coatSh);
  line(c, ex + ux * 10, ey + uy * 10, ex + ux * 26, ey + uy * 26, 112, pal.coatHi);
  const cx = wx + ux * 40, cy = wy + uy * 40 - ph * 0.22;
  ellipse(c, wx + ux * 26, wy + uy * 26, 56, 62, pal.skin);   // the back of the hand
  efPhone(c, cx, cy, ph, { face: 'back' });
  efGrip(c, cx, cy, ph, 0, pal, true);
  return [cx, cy];
}

// ---------------------------------------------------------------- the cafe cat (ginger, side view, facing right)
// (x, y): the table under its middle; s: scale; o: {stretch 0..1, flip, happy 0..1, look, tailT}
function efCat(c, x, y, s, t, o = {}) {
  const k = clamp(o.stretch || 0), flip = o.flip || 1;
  actor(() => {
    c.save(); c.translate(x, y); c.scale(s * flip, s);
    const L = (a, b) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
    const R = L([-44, -50], [-50, -84]), F = L([42, -46], [56, -26]), Hd = L([76, -80], [104, -40]);
    const fur = '#F08A3C', furSh = '#C8621E', belly = '#FFE1C2';
    // tail: curled round the paws when sitting, straight up and quivering in the stretch
    const q = k * 3 * Math.sin(t * loopW(14));
    c.beginPath(); c.moveTo(R[0] - 10, R[1] - 4);
    const tA = L([-110, -20], [-74, -190]), tB = L([-90, 6], [-66 + q, -250]);
    c.quadraticCurveTo(tA[0], tA[1], tB[0], tB[1]);
    c.lineWidth = 16; c.lineCap = 'round'; c.strokeStyle = furSh; c.stroke();
    c.lineWidth = 11; c.strokeStyle = fur; c.stroke();
    // legs: hind (straight up into the hips when stretching), front (reaching far forward)
    const hindA = L([-40, 0], [-56, 0]), hindB = L([-24, 0], [-38, 0]);
    const frA = L([30, 0], [130, 0]), frB = L([48, 0], [112, 2]);
    for (const [p, q2] of [[hindA, R], [hindB, R], [frA, F], [frB, F]]) capsuleShaded(c, [q2[0], q2[1] + 6], p, 16, fur, furSh, null, PAL);
    for (const p of [hindA, hindB, frA, frB]) ellipse(c, p[0] + 4, p[1] - 3, 12, 6, belly);
    // body: a fat capsule from the hips to the shoulders, cream belly
    capsuleShaded(c, R, F, 56, fur, furSh, null, PAL);
    ellipse(c, (R[0] + F[0]) / 2, (R[1] + F[1]) / 2 + 14, 36, 12, belly, Math.atan2(F[1] - R[1], F[0] - R[0]));
    // stripes
    for (let i = 0; i < 4; i++) {
      const u = 0.2 + i * 0.18, px = lerp(R[0], F[0], u), py = lerp(R[1], F[1], u);
      line(c, px - 3, py - 26, px + 6, py - 12, 6, furSh);
    }
    // head
    c.save(); c.translate(Hd[0], Hd[1]); c.rotate(lerp(0, 0.35, k));
    for (const ex of [-14, 14]) { c.beginPath(); c.moveTo(ex - 13, -16); c.lineTo(ex + (ex > 0 ? 6 : -6), -48); c.lineTo(ex + 13, -18); c.closePath(); c.fillStyle = fur; c.fill(); }
    for (const ex of [-14, 14]) { c.beginPath(); c.moveTo(ex - 6, -20); c.lineTo(ex + (ex > 0 ? 4 : -4), -38); c.lineTo(ex + 6, -20); c.closePath(); c.fillStyle = '#FFB3A0'; c.fill(); }
    circle(c, 0, 0, 33, fur);
    c.restore();
    c.restore();
  });
  // the face (paint)
  c.save(); c.translate(x, y); c.scale(s * flip, s);
  const Hd = [lerp(76, 104, k), lerp(-80, -40, k)];
  c.translate(Hd[0], Hd[1]); c.rotate(lerp(0, 0.35, k));
  paint(() => {
    ellipse(c, 10, 12, 18, 12, '#FFE1C2');
    const happy = clamp(o.happy != null ? o.happy : k);
    for (const ex of [-12, 14]) {
      if (happy > 0.5) { c.beginPath(); c.arc(ex, 0, 7, Math.PI * 1.15, Math.PI * 1.85); c.lineWidth = 3.5; c.strokeStyle = '#3A2010'; c.lineCap = 'round'; c.stroke(); }
      else { ellipse(c, ex, -1, 7, 9, '#B7E36A'); ellipse(c, ex + (o.look || 0) * 2, -1, 2.2, 7, '#1C1208'); }
    }
    c.beginPath(); c.moveTo(6, 8); c.lineTo(14, 8); c.lineTo(10, 13); c.closePath(); c.fillStyle = '#E8707A'; c.fill();
    c.beginPath(); c.moveTo(10, 13); c.quadraticCurveTo(6, 19, 2, 16); c.moveTo(10, 13); c.quadraticCurveTo(14, 19, 18, 16);
    c.lineWidth = 2.5; c.strokeStyle = '#3A2010'; c.stroke();
    for (const sy of [-1, 1]) for (let i = 0; i < 3; i++) line(c, 24, 10 + i * 4, 44, 6 + i * 7, 1.6, rgba('#FFFFFF', 0.9));
  });
  c.restore();
}

// ---------------------------------------------------------------- iron up close
// a girder from a to b, width w: a box section with flanges and two rows of rivets. o: {hot 0..1, ext (px it has grown at b)}
function efGirder(c, a, b, w, o = {}) {
  const ext = o.ext || 0;
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
  const B = [b[0] + ux * ext, b[1] + uy * ext];
  const quad = (o1, o2, col) => { c.beginPath(); c.moveTo(a[0] + nx * o1, a[1] + ny * o1); c.lineTo(B[0] + nx * o1, B[1] + ny * o1); c.lineTo(B[0] + nx * o2, B[1] + ny * o2); c.lineTo(a[0] + nx * o2, a[1] + ny * o2); c.closePath(); c.fillStyle = col; c.fill(); };
  quad(-w / 2, w / 2, EF.iron);
  quad(-w / 2, -w / 2 + w * 0.16, EF.ironHi);
  quad(w / 2 - w * 0.16, w / 2, EF.ironSh);
  // the web: a lattice of thin diagonal straps inside
  c.save(); c.strokeStyle = EF.ironLine; c.lineWidth = Math.max(2, w * 0.05); c.beginPath();
  const step = w * 0.9, n = Math.floor((L + ext) / step);
  for (let i = 0; i < n; i++) {
    const p0 = [a[0] + ux * i * step, a[1] + uy * i * step], p1 = [p0[0] + ux * step, p0[1] + uy * step];
    c.moveTo(p0[0] + nx * w * 0.32, p0[1] + ny * w * 0.32); c.lineTo(p1[0] - nx * w * 0.32, p1[1] - ny * w * 0.32);
    c.moveTo(p0[0] - nx * w * 0.32, p0[1] - ny * w * 0.32); c.lineTo(p1[0] + nx * w * 0.32, p1[1] + ny * w * 0.32);
  }
  c.stroke(); c.restore();
  // rivets along both flanges
  paint(() => {
    for (let d = w * 0.3; d < L + ext - w * 0.2; d += w * 0.32) for (const sgn of [-1, 1]) {
      const px = a[0] + ux * d + nx * sgn * w * 0.42, py = a[1] + uy * d + ny * sgn * w * 0.42;
      circle(c, px, py, w * 0.055, EF.ironDk); circle(c, px - w * 0.015, py - w * 0.015, w * 0.025, EF.ironHi);
    }
  });
  const hot = o.hot || 0;
  if (hot > 0.01) {
    c.save(); c.globalAlpha = 0.55 * hot; quad(-w / 2, w / 2, EF.hot); c.restore();
    for (let d = 0; d < L + ext; d += w * 0.8) softDot(gctx, a[0] + ux * d, a[1] + uy * d, w * 0.9, EF.hot2, 0.3 * hot);
  }
  return B;
}
// a rivet plate where girders meet
function efPlate(c, x, y, r) {
  c.beginPath(); for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + 0.3; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } c.closePath();
  c.fillStyle = EF.ironSh; c.fill();
  paint(() => { for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + 0.3; circle(c, x + Math.cos(a) * r * 0.6, y + Math.sin(a) * r * 0.6, r * 0.09, EF.ironDk); } });
}
// a single hair: a thin dark wiggle (paint)
function efHair(c, x, y, len, rot, k = 1) {
  if (k <= 0.01) return;
  paint(() => {
    c.save(); c.translate(x, y); c.rotate(rot);
    c.beginPath(); c.moveTo(0, 0);
    for (let i = 1; i <= 12; i++) c.lineTo((len * i) / 12, 5 * Math.sin(i * 1.3));
    c.lineCap = 'round'; c.lineWidth = 9; c.strokeStyle = 'rgba(255,255,255,0.9)'; c.stroke();
    c.lineWidth = 4.5; c.strokeStyle = '#2A1B14'; c.stroke();
    c.restore();
  });
}
// a glowing sliver of iron (the growth of one piece), a short bar
function efSliver(c, x, y, w, h, a = 1) {
  rrect(c, x - w / 2, y - h / 2, w, h, Math.min(w, h) / 2); c.fillStyle = rgba('#FFC27A', a); c.fill();
  softDot(gctx, x, y, Math.max(w, h) * 0.8, '#FF9A3C', 0.5 * a);
}

// ---------------------------------------------------------------- the city from high on the tower, painted once
let EF_BELOW = null;
function efBelowInit() {
  const S = 1800, cv = mkCanvas(S, S), x = cv.getContext('2d'), rnd = mulberry32(77);
  x.fillStyle = '#D9CDB0'; x.fillRect(0, 0, S, S);
  // blocks of roofs in a loose grid with streets
  for (let gy = 0; gy < S; gy += 120) for (let gx = 0; gx < S; gx += 150) {
    const ox = gx + (rnd() - 0.5) * 20, oy = gy + (rnd() - 0.5) * 20;
    x.fillStyle = rnd() < 0.5 ? '#8C9CB4' : '#9DADC2'; x.fillRect(ox + 10, oy + 10, 130, 100);
    x.fillStyle = '#EFE3C8'; x.fillRect(ox + 34, oy + 34, 82, 52);   // the courtyard
    x.fillStyle = '#6C7E99'; x.fillRect(ox + 10, oy + 10, 130, 8);
  }
  // the Champ de Mars: a long lawn down the middle with paths and tree rows
  x.fillStyle = '#5DB043'; x.fillRect(S * 0.36, 0, S * 0.28, S);
  x.fillStyle = '#EBD9AA'; x.fillRect(S * 0.36, 0, S * 0.025, S); x.fillRect(S * 0.615, 0, S * 0.025, S); x.fillRect(S * 0.49, 0, S * 0.02, S);
  for (let yy = 10; yy < S; yy += 34) for (const xx of [S * 0.35, S * 0.65]) { x.fillStyle = '#2F7A30'; x.beginPath(); x.arc(xx, yy, 15, 0, 7); x.fill(); x.fillStyle = '#4E9C40'; x.beginPath(); x.arc(xx - 3, yy - 3, 9, 0, 7); x.fill(); }
  // the Seine across the top, with a bridge
  x.fillStyle = '#3C8FCB'; x.beginPath(); x.moveTo(0, 120); x.bezierCurveTo(S * 0.3, 60, S * 0.6, 260, S, 150); x.lineTo(S, 260); x.bezierCurveTo(S * 0.6, 360, S * 0.3, 170, 0, 230); x.closePath(); x.fill();
  x.fillStyle = '#E6D9BC'; x.fillRect(S * 0.46, 80, S * 0.08, 220);
  EF_BELOW = cv;
}

// ---------------------------------------------------------------- labels (screen space)
function efTag(txt, x, y, col, k, size = 40, rot = 0) {
  if (k <= 0.01) return;
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(E.outBack(clamp(k)), E.outBack(clamp(k)));
  ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + size * 1.1, h = size * 1.55;
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = 'rgba(14,16,32,0.86)'; ctx.fill();
  // no bloom over a label: a black patch in the glow layer under it (the Sun's glow washed two of them out, round 1)
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); gctx.translate(x, y); gctx.rotate(rot);
  rrect(gctx, -w / 2 - 14, -h / 2 - 14, w + 28, h + 28, h / 2 + 14); gctx.fillStyle = 'rgba(0,0,0,1)'; gctx.fill(); gctx.restore();
  ctx.lineWidth = 4; ctx.strokeStyle = col; ctx.stroke();
  ctx.fillStyle = col; ctx.fillText(txt, 0, size * 0.04);
  ctx.restore();
}
// a measuring bracket (world space): a vertical span from y0 to y1 at x, with end ticks; k draws it on
function efBracket(c, x, y0, y1, k, col = '#FFD447', w = 6) {
  if (k <= 0.01) return;
  const y = lerp(y0, y1, clamp(k));
  c.save(); c.lineCap = 'round';
  line(c, x, y0, x, y, w, col); line(c, x - 16, y0, x + 16, y0, w, col);
  if (k > 0.98) line(c, x - 16, y1, x + 16, y1, w, col);
  c.restore();
  softDot(gctx, x, (y0 + y) / 2, Math.abs(y - y0) * 0.5 + 10, col, 0.35);
}
