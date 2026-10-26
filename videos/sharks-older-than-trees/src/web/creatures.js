// The cast and the props of sharks-older-than-trees (27 Oct 2026): the shark (one smug shark, there through every age),
// its fins, a sauropod, the fireball, the tally rock, the NEW KID sticker, the YEARS AGO counter and the tags.
'use strict';

// ---------------------------------------------------------------- the shark
// Local "shark units" (= world units at s 1): facing RIGHT, the snout at +300, the tail tip at about -420, the middle of
// the body on y 0, up = -y. o: {flip (1 faces right, -1 faces left), rot (the body's angle in local terms: -1 = snout up),
// look: [x, y] (-1..1, in screen terms), blink 0..1, brow -1 (cross) .. 1 (up), browL (the brow's tilt), grin 0..1 (the
// toothy grin), smirk 0..1, open 0..1 (the mouth drops), fin (the near pectoral fin's wave, radians), tail (wag, radians),
// shades 0..1 (sunglasses dropping on), dim (an underwater ghost: 0..1), pal}
const SK_PAL = { top: '#5E7FA0', topDk: '#4A6886', belly: '#E9F0F4', fin: '#526F8E', gill: '#3A5470', eye: '#FFFFFF',
  pupil: '#141428', mouth: '#5A1F2C', tooth: '#FFFFFF', gum: '#C94A5E' };
const SK_BODY_TOP = [[300, 12], [282, -20], [232, -50], [150, -76], [40, -88], [-70, -80], [-170, -58], [-250, -32], [-300, -14]];
const SK_BODY_BOT = [[-300, 12], [-240, 28], [-140, 50], [-20, 66], [100, 66], [196, 54], [254, 38], [290, 24]];
function skSmooth(c, pts, start = true) {
  if (start) c.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
    c.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
  }
  const L = pts[pts.length - 1]; c.lineTo(L[0], L[1]);
}
// world -> the shark's local frame (for the pupils): undo the flip and the rotation
function skLocalVec(o, vx, vy) {
  const fx = vx * (o.flip || 1), a = -(o.rot || 0);
  return [fx * Math.cos(a) - vy * Math.sin(a), fx * Math.sin(a) + vy * Math.cos(a)];
}
function skShark(c, x, y, s, t, o = {}) {
  const P = o.pal || SK_PAL;
  c.save(); c.translate(x, y); c.scale((o.flip || 1) * s, s); c.rotate(o.rot || 0);
  const tail = (o.tail || 0) + 0.08 * Math.sin(t * 3.1);
  actor(() => {
    // the tail (behind the body), wagging about the stalk
    c.save(); c.translate(-298, 0); c.rotate(tail);
    c.beginPath(); c.moveTo(8, -14); c.quadraticCurveTo(-40, -70, -126, -176); c.quadraticCurveTo(-92, -60, -62, 2);
    c.quadraticCurveTo(-92, 46, -112, 92); c.quadraticCurveTo(-52, 52, 8, 14); c.closePath();
    c.fillStyle = P.fin; c.fill();
    c.restore();
    // the far pectoral fin, a little of it, behind the body
    c.save(); c.translate(70, 52); c.rotate(-0.35 + 0.5 * (o.fin || 0) * 0.3);
    c.beginPath(); c.moveTo(20, 0); c.quadraticCurveTo(-10, 60, -78, 104); c.quadraticCurveTo(-30, 44, -36, 6); c.closePath();
    c.fillStyle = P.topDk; c.fill(); c.restore();
    // the dorsal fins
    c.beginPath(); c.moveTo(46, -84); c.quadraticCurveTo(6, -150, -34, -214); c.quadraticCurveTo(-34, -130, -76, -76); c.closePath();
    c.fillStyle = P.fin; c.fill();
    c.beginPath(); c.moveTo(-196, -46); c.lineTo(-222, -88); c.lineTo(-238, -38); c.closePath(); c.fillStyle = P.fin; c.fill();
    // the body: one shape, then the white belly painted on it
    c.beginPath(); skSmooth(c, SK_BODY_TOP); skSmooth(c, SK_BODY_BOT, false); c.closePath();
    c.fillStyle = P.top; c.fill();
  });
  paint(() => {
    c.beginPath(); c.moveTo(294, 20);
    skSmooth(c, [[294, 20], [236, 14], [150, 22], [40, 30], [-80, 30], [-190, 20], [-290, 6]], false);
    skSmooth(c, [[-290, 6], [-240, 28], [-140, 50], [-20, 66], [100, 66], [196, 54], [254, 38], [294, 20]], false);
    c.closePath(); c.fillStyle = P.belly; c.fill();
    // a darker back (countershading) and the gill slits
    c.beginPath(); skSmooth(c, [[250, -36], [160, -70], [40, -84], [-80, -74], [-180, -50], [-250, -26]]);
    c.lineWidth = 16; c.strokeStyle = rgba(P.topDk, 0.55); c.stroke();
    for (let k = 0; k < 5; k++) {
      const gx = 148 - k * 17;
      c.beginPath(); c.moveTo(gx + 4, -36); c.quadraticCurveTo(gx - 8, 0, gx + 2, 34);
      c.lineWidth = 4.5; c.strokeStyle = P.gill; c.stroke();
    }
    circle(c, 280, -4, 4, P.gill);                                   // the nostril
    // the mouth: a long smirk, or the grin with a row of teeth
    const grin = clamp(o.grin || 0), smirk = clamp(o.smirk || 0), open = clamp(o.open || 0);
    if (grin > 0.02 || open > 0.02) {
      const dn = 26 * Math.max(grin, open) * (1 - 0.4 * grin);
      c.beginPath(); c.moveTo(296, 24); c.quadraticCurveTo(250, 36 + dn * 1.2, 186, 30 - 10 * grin); c.quadraticCurveTo(240, 34, 296, 24);
      c.fillStyle = P.mouth; c.fill();
      c.beginPath(); c.moveTo(296, 24); c.quadraticCurveTo(250, 36 + dn * 1.2, 186, 30 - 10 * grin); c.quadraticCurveTo(240, 34, 296, 24);
      c.save(); c.clip();
      for (let k = 0; k < 8; k++) {
        const tx = 284 - k * 12.5, ty = 26 + 1.5 * k * (1 - grin * 0.5);
        c.beginPath(); c.moveTo(tx - 5.5, ty - 2); c.lineTo(tx, ty + 11 * (0.4 + 0.6 * grin)); c.lineTo(tx + 5.5, ty - 2); c.closePath();
        c.fillStyle = P.tooth; c.fill();
      }
      c.restore();
      c.beginPath(); c.moveTo(296, 24); c.quadraticCurveTo(250, 36 + dn * 1.2, 186, 30 - 10 * grin);
      c.lineWidth = 4; c.strokeStyle = '#2A1420'; c.stroke();
    } else {
      c.beginPath(); c.moveTo(294, 24); c.quadraticCurveTo(246, 38, 192, 36 - 12 * smirk);
      c.lineWidth = 5; c.strokeStyle = '#2A1F34'; c.stroke();
      if (smirk > 0.05) { c.beginPath(); c.arc(192, 30 - 12 * smirk, 5, 0.3, 2.4); c.lineWidth = 3; c.stroke(); }
    }
    // the eye (a cartoon eye: the comedy lives here), the lid, the brow
    const ex = 214, ey = -24, look = o.look || [0, 0], lv = skLocalVec(o, look[0], look[1]);
    ellipse(c, ex, ey, 21, 19, P.eye);
    circle(c, ex + lv[0] * 7, ey + lv[1] * 6, 10.5, P.pupil);
    circle(c, ex + lv[0] * 7 + 3.5, ey + lv[1] * 6 - 4, 3.2, '#FFFFFF');
    const bl = clamp(o.blink || 0);
    if (bl > 0.02) {   // the lid comes down over the eye (inside its outline)
      c.save(); c.beginPath(); c.ellipse(ex, ey, 22, 20, 0, 0, Math.PI * 2); c.clip();
      c.fillStyle = P.top; c.fillRect(ex - 23, ey - 21, 46, 41 * bl);
      line(c, ex - 22, ey - 20 + 40 * bl, ex + 22, ey - 20 + 40 * bl, 4, '#26344A');
      c.restore();
    }
    const br = o.brow || 0, tilt = o.browL || 0;
    c.save(); c.translate(ex - 2, ey - 30 - 9 * br); c.rotate(-0.12 + tilt);
    c.beginPath(); c.moveTo(-24, 4); c.quadraticCurveTo(0, -6, 26, 2); c.lineWidth = 8; c.lineCap = 'round'; c.strokeStyle = '#26344A'; c.stroke();
    c.restore();
    // shades: two dark lenses on a bar, dropping into place
    const sd = clamp(o.shades || 0);
    if (sd > 0.01) {
      const oy = -60 * (1 - E.outBack(sd));
      c.save(); c.translate(0, oy);
      c.beginPath(); c.moveTo(150, ey - 12); c.lineTo(270, ey - 16); c.lineWidth = 6; c.strokeStyle = '#151520'; c.stroke();
      rrect(c, ex - 30, ey - 22, 60, 38, 14); c.fillStyle = '#16161F'; c.fill();
      line(c, ex - 18, ey - 12, ex - 4, ey - 16, 4, 'rgba(255,255,255,0.55)');
      c.restore();
    }
  });
  // a black silhouette in the glow layer: glints and the sun behind it must not shine through it
  if (o.occlude !== false) {
    gctx.save(); gctx.translate(x, y); gctx.scale((o.flip || 1) * s, s); gctx.rotate(o.rot || 0);
    gctx.beginPath(); skSmooth(gctx, SK_BODY_TOP); skSmooth(gctx, SK_BODY_BOT, false); gctx.closePath();
    gctx.fillStyle = '#000'; gctx.fill();
    gctx.beginPath(); gctx.moveTo(46, -84); gctx.quadraticCurveTo(6, -150, -34, -214); gctx.quadraticCurveTo(-34, -130, -76, -76); gctx.closePath(); gctx.fill();
    gctx.restore();
  }
  // the near pectoral fin, in front of the belly; it waves
  actor(() => {
    c.save(); c.translate(102, 50); c.rotate(-0.2 + (o.fin || 0));
    c.beginPath(); c.moveTo(4, 0); c.quadraticCurveTo(-24, 74, -108, 128); c.quadraticCurveTo(-58, 58, -62, 10); c.closePath();
    c.fillStyle = P.fin; c.fill();
    c.restore();
  });
  c.restore();
}
// a point of the shark's local frame in world terms (for leaders, splashes, the shades)
function skPt(x, y, s, o, lx, ly) {
  const a = o.rot || 0, ca = Math.cos(a), sa = Math.sin(a);
  const rx = lx * ca - ly * sa, ry = lx * sa + ly * ca;
  return [x + rx * s * (o.flip || 1), y + ry * s];
}

// the water in front of a shark: a soft patch of the sea's own colour below its waterline hides what is under water
// (never a clip of the shark itself: reference/visual.md), then a ring of ripples and foam where it breaks the surface
let SK_PATCH = null;
function skWaterFront(cam, t, S, sun, x, yw, rx, o = {}) {
  const deep = o.deep === undefined ? 340 : o.deep;
  // The water between the camera and the shark: the sea's own gradient, opaque, over what is under the surface. It is
  // painted into a canvas of its own and laid on as an IMAGE: a solid image is one flat, unlit thing in the shape map
  // and hides what is under it (a fill inside a clip, or a see-through fill, left the shark's outline lit through the
  // water). Same paint as the sea behind it, so it shows no edge; it stays right of the coast, and o.x0 keeps it off
  // anything at the shore (the big tree's roots).
  if (!SK_PATCH) SK_PATCH = mkCanvas(W, H);
  const px = SK_PATCH.getContext('2d');
  px.setTransform(1, 0, 0, 1, 0, 0); px.clearRect(0, 0, W, H);
  camTransform(px, cam, 1);
  const xl = Math.max(x - rx * 1.2, o.x0 === undefined ? -1e9 : o.x0), xr = x + rx * 2.2;
  px.save();
  px.beginPath(); px.moveTo(4000, -2000); px.lineTo(4000, 4000); px.lineTo(SH_COAST[0][0], 4000);   // the sea: right of the coast
  for (const [cx2, cy2] of SH_COAST) px.lineTo(cx2, cy2);
  px.lineTo(SH_COAST[SH_COAST.length - 1][0], -2000); px.closePath(); px.clip();
  px.beginPath(); px.rect(xl, yw, xr - xl, deep + 900); px.clip();
  const g = px.createLinearGradient(0, SH.hz, 0, SH.gy + 420);
  g.addColorStop(0, S.pal.sea1); g.addColorStop(1, S.pal.sea2);
  px.fillStyle = g; px.fillRect(xl, yw, xr - xl, deep + 900);
  shWaveLines(cam, t, S, sun, yw + 6, yw + deep + 900, [xl - 60, xr + 60], px);
  px.restore();
  screenSpace(); ctx.drawImage(SK_PATCH, 0, 0);
  applyCam(cam);
  paint(() => {
    // the ripple ring and a lip of foam round the body
    const w = o.ring === undefined ? rx * 0.42 : o.ring, ph = t * 2.2, cx = x + (o.dx || 0);
    for (let k = 0; k < 3; k++) {
      const u = ((ph * 0.35 + k / 3) % 1), rr = w * (0.7 + 1.1 * u);
      ctx.beginPath(); ctx.ellipse(cx, yw + 2, rr, rr * 0.16, 0, 0, Math.PI * 2);
      ctx.lineWidth = 3.5 * (1 - u) + 1; ctx.strokeStyle = rgba(S.pal.foam, 0.6 * (1 - u)); ctx.stroke();
    }
    ctx.beginPath(); ctx.ellipse(cx, yw, w * 0.62, w * 0.1, 0, 0, Math.PI * 2);
    ctx.lineWidth = 7; ctx.strokeStyle = rgba(S.pal.foam, 0.85); ctx.stroke();
  });
}
// a splash where something breaks the surface (k 0..1 after the moment), world units
function skSplash(c, x, y, k, s = 1, col = '#FFF4E2', seed = 7) {
  if (k <= 0 || k >= 1) return;
  const r = mulberry32(seed);
  paint(() => {
    for (let i = 0; i < 18; i++) {
      const a = -Math.PI / 2 + (r() - 0.5) * 2.2, v = (180 + 260 * r()) * s;
      const px = x + Math.cos(a) * v * k, py = y + Math.sin(a) * v * k + 520 * s * k * k;
      circle(c, px, py, (5 + 9 * r()) * s * (1 - 0.6 * k), rgba(col, 0.9 * (1 - k * k)));
    }
    c.beginPath(); c.ellipse(x, y, 160 * s * (0.4 + k), 22 * s * (0.4 + k), 0, 0, Math.PI * 2);
    c.lineWidth = 6 * (1 - k); c.strokeStyle = rgba(col, 0.8 * (1 - k)); c.stroke();
  });
}
// a fin cutting the water (circling sharks): world units, dir +1 moving right
function skFin(c, x, y, s, t, dir, pal = SK_PAL, foam = '#FFF4E2') {
  actor(() => {
    c.save(); c.translate(x, y); c.scale(dir * s, s);
    c.beginPath(); c.moveTo(40, 0); c.quadraticCurveTo(10, -60, -14, -120); c.quadraticCurveTo(-14, -60, -60, 0); c.closePath();
    c.fillStyle = pal.fin; c.fill(); c.restore();
  });
  paint(() => {
    for (const sd of [-1, 1]) line(c, x + 40 * s * dir, y + 2, x - 150 * s * dir, y + sd * 22 * s + 4, 4 * s, rgba(foam, 0.7));
    ctx.beginPath(); ctx.ellipse(x - 8 * s * dir, y + 2, 64 * s, 9 * s, 0, 0, Math.PI * 2); ctx.lineWidth = 4 * s; ctx.strokeStyle = rgba(foam, 0.8); ctx.stroke();
  });
}

// ---------------------------------------------------------------- the sauropod (the dinosaurs came...)
// Feet on y 0, facing right, about 2,000 units from tail to head. o: {walk (phase, radians), bend 0..1 (the neck comes down
// in front of it to sniff), look, blink, smile}
const DN_PAL = { body: '#7D9A57', belly: '#BCCB8C', dark: '#5D7840', spot: '#6A8648', eye: '#FFFFFF', pupil: '#1A1A22' };
function dnSauropod(c, x, y, s, t, o = {}) {
  const P = DN_PAL, ph = o.walk || 0, bend = clamp(o.bend || 0);
  c.save(); c.translate(x, y); c.scale(s, s);
  const bob = 8 * Math.abs(Math.sin(ph));
  const leg = (lx, lift, col) => {
    const up = Math.max(0, Math.sin(lift)) * 34, sw = 30 * Math.cos(lift);
    c.beginPath(); c.moveTo(lx - 44, -300 - bob); c.lineTo(lx - 38 + sw, -up); c.lineTo(lx + 40 + sw, -up); c.lineTo(lx + 46, -300 - bob); c.closePath();
    c.fillStyle = col; c.fill();
    ellipse(c, lx + sw + 2, -up - 4, 48, 14, col);
  };
  actor(() => {
    leg(-180, ph + Math.PI, P.dark); leg(200, ph, P.dark);                    // the far legs
    // the tail
    c.beginPath(); c.moveTo(-240, -400 - bob); c.quadraticCurveTo(-600, -360, -1040, -170 + 20 * Math.sin(t * 2));
    c.quadraticCurveTo(-620, -300, -250, -290 - bob); c.closePath(); c.fillStyle = P.body; c.fill();
    // the body
    ellipse(c, 0, -390 - bob, 330, 168, P.body);
    // the neck: a thick curve from the shoulders to the head; `bend` brings it down in front
    const n0 = [230, -470 - bob], n2 = [lerp(560, 700, bend), lerp(-1180, -470, bend)], n1 = [lerp(330, 640, bend), lerp(-980, -930, bend)];
    const N = 22, pts = [];
    for (let i = 0; i <= N; i++) { const u = i / N; pts.push([(1 - u) * (1 - u) * n0[0] + 2 * u * (1 - u) * n1[0] + u * u * n2[0], (1 - u) * (1 - u) * n0[1] + 2 * u * (1 - u) * n1[1] + u * u * n2[1]]); }
    for (let i = 0; i < N; i++) line(c, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], lerp(150, 70, i / N), P.body);
    // the head
    const hd = pts[N], ha = Math.atan2(pts[N][1] - pts[N - 2][1], pts[N][0] - pts[N - 2][0]) * 0.35 + (bend > 0.5 ? 0.25 : 0);
    c.save(); c.translate(hd[0], hd[1]); c.rotate(ha);
    ellipse(c, 40, 0, 92, 52, P.body);
    c.restore();
    leg(-150, ph, P.body); leg(230, ph + Math.PI, P.body);                    // the near legs
    o.head = [x + (hd[0] + 40 * Math.cos(ha)) * s, y + (hd[1] + 40 * Math.sin(ha)) * s];
    o.headA = ha;
  });
  paint(() => {
    ellipse(c, 10, -300 - bob, 260, 60, rgba(P.belly, 0.75));
    for (const [sx2, sy2, r2] of [[-120, -470, 30], [-30, -500, 24], [70, -480, 28], [150, -450, 20], [-210, -430, 22]]) ellipse(c, sx2, sy2 - bob, r2, r2 * 0.7, P.spot);
    const hd = [(o.head[0] - x) / s, (o.head[1] - y) / s], ha = o.headA;
    c.save(); c.translate(hd[0], hd[1]); c.rotate(ha);
    ellipse(c, 34, -16, 15, 15, P.eye);
    const lk = o.look || [1, 0];
    circle(c, 34 + 6 * lk[0], -16 + 5 * lk[1], 7.5, P.pupil);
    if ((o.blink || 0) > 0.05) { c.fillStyle = P.body; c.fillRect(16, -34, 38, 36 * clamp(o.blink)); }
    c.beginPath(); c.moveTo(70, 18); c.quadraticCurveTo(96, 28, 118, 12); c.lineWidth = 5; c.strokeStyle = '#2E3A22'; c.lineCap = 'round'; c.stroke();
    circle(c, 112, -4, 4, '#2E3A22');
    c.restore();
  });
  c.restore();
}
// a giant three-toed footprint pressed in the ground, smoking (world units)
function dnFootprint(c, x, y, s, k, t) {
  if (k <= 0) return;
  paint(() => {
    ellipse(c, x, y, 120 * s, 30 * s, 'rgba(60,44,34,0.55)');
    for (const dx of [-70, 0, 70]) ellipse(c, x + dx * s, y - 26 * s, 26 * s, 12 * s, 'rgba(60,44,34,0.55)');
  });
  for (let i = 0; i < 6; i++) {
    const u = ((t * 0.5 + i / 6) % 1);
    softDot(c, x + (i - 2.5) * 30 * s + 30 * Math.sin(t * 2 + i) * u * s, y - 30 * s - 360 * u * s, (40 + 70 * u) * s, '#8E8A86', 0.35 * (1 - u) * k);
  }
}

// ---------------------------------------------------------------- the fireball (screen space): a glowing rock on a long tail
function skFireball(x0, y0, x1, y1, k, tail = 0.35) {
  if (k <= 0 || k > 1) return;
  screenSpace();
  const x = lerp(x0, x1, k), y = lerp(y0, y1, k), dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
  const tl = L * tail;
  for (const [cc, sc] of [[ctx, 1], [gctx, 1]]) {   // screenSpace(): gctx is already at half scale
    const g = cc.createLinearGradient(x * sc, y * sc, (x - ux * tl) * sc, (y - uy * tl) * sc);
    g.addColorStop(0, 'rgba(255,240,200,0.95)'); g.addColorStop(0.25, 'rgba(255,160,60,0.8)'); g.addColorStop(1, 'rgba(255,80,40,0)');
    cc.strokeStyle = g; cc.lineCap = 'round';
    cc.lineWidth = 46; cc.beginPath(); cc.moveTo(x * sc, y * sc); cc.lineTo((x - ux * tl) * sc, (y - uy * tl) * sc); cc.stroke();
  }
  circle(ctx, x, y, 34, '#FFF2D0'); softDot(ctx, x, y, 110, '#FFB050', 0.6); softDot(gctx, x, y, 150, '#FFB050', 1);
}

// ---------------------------------------------------------------- the tally rock: five scratches, one per extinction
// world units; n = how many marks are drawn so far (fractional = the next one drawing on)
function tallyRock(c, x, y, s, n, pal) {
  c.beginPath(); c.moveTo(x - 210 * s, y); c.quadraticCurveTo(x - 230 * s, y - 150 * s, x - 120 * s, y - 196 * s);
  c.quadraticCurveTo(x + 40 * s, y - 236 * s, x + 190 * s, y - 170 * s); c.quadraticCurveTo(x + 250 * s, y - 80 * s, x + 220 * s, y); c.closePath();
  c.fillStyle = pal.rock; c.fill();
  paint(() => {
    line(c, x - 160 * s, y - 40 * s, x - 60 * s, y - 70 * s, 4 * s, rgba(pal.rockDk, 0.6));
    for (let i = 0; i < 5; i++) {
      const k = clamp(n - i);
      if (k <= 0) break;
      let a, b;
      if (i < 4) { const mx = x + (-110 + i * 56) * s; a = [mx, y - 160 * s]; b = [mx - 8 * s, y - 40 * s]; }
      else { a = [x - 150 * s, y - 70 * s]; b = [x + 100 * s, y - 140 * s]; }
      const e = [lerp(a[0], b[0], E.outCubic(k)), lerp(a[1], b[1], E.outCubic(k))];
      line(c, a[0], a[1], e[0], e[1], 15 * s, '#F4EEE6');
      line(c, a[0] + 3 * s, a[1] + 3 * s, e[0] + 3 * s, e[1] + 3 * s, 4 * s, 'rgba(90,80,70,0.6)');
    }
  });
}

// ---------------------------------------------------------------- the NEW KID sticker (world units, paint on the trunk)
function newKid(c, x, y, s, rot, k) {
  if (k <= 0) return;
  const sc = s * lerp(1.45, 1, E.outBack(clamp(k * 1.25)));
  paint(() => {
    c.save(); c.translate(x, y); c.rotate(rot + 0.1 * (1 - clamp(k * 1.4))); c.scale(sc, sc);
    rrect(c, -64, -44, 128, 92, 9); c.fillStyle = 'rgba(0,0,0,0.25)'; c.fill();
    rrect(c, -62, -46, 124, 88, 9); c.fillStyle = '#FFFFFF'; c.fill();
    rrect(c, -62, -46, 124, 30, 9); c.fillStyle = '#E8343F'; c.fill();
    c.fillRect(-62, -26, 124, 10);
    c.fillStyle = '#FFFFFF'; c.font = '900 17px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('HELLO', 0, -31);
    c.fillStyle = '#1C2B6E'; c.font = '400 31px Anton'; c.fillText('NEW KID', 0, 13);
    c.restore();
  });
}

// ---------------------------------------------------------------- the YEARS AGO counter (screen space, under the top band)
function yearsHud(k, val, mode, t) {
  if (k <= 0) return;
  screenSpace();
  const s = lerp(0.7, 1, E.outBack(clamp(k))), y = 560;
  ctx.save(); ctx.translate(540, y); ctx.scale(s, s); ctx.globalAlpha = clamp(k * 2);
  rrect(ctx, -300, -82, 600, 164, 30); ctx.fillStyle = 'rgba(12,10,30,0.82)'; ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = mode === 'ff' ? '#4DFFB4' : '#C8A8FF'; ctx.stroke();
  const num = Math.round(val).toLocaleString('en-US');
  ctx.font = '400 92px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const wNum = ctx.measureText(num).width, sz = Math.min(1, 470 / wNum);
  ctx.save(); ctx.translate(26, -10); ctx.scale(sz, sz);
  ctx.fillStyle = '#FFFFFF'; ctx.fillText(num, 0, 0); ctx.restore();
  ctx.font = '800 30px Montserrat'; ctx.fillStyle = mode === 'ff' ? '#4DFFB4' : '#C8A8FF'; ctx.fillText('YEARS AGO', 26, 56);
  // the rewind / fast-forward icon, blinking
  const on = 0.55 + 0.45 * Math.sign(Math.sin(t * 14));
  ctx.fillStyle = rgba(mode === 'ff' ? '#4DFFB4' : '#C8A8FF', on);
  const dir = mode === 'ff' ? 1 : -1;
  for (const ox of [-250, -214]) {
    ctx.beginPath(); ctx.moveTo(ox - 16 * dir, -28); ctx.lineTo(ox + 16 * dir, 0); ctx.lineTo(ox - 16 * dir, 28); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

// ---------------------------------------------------------------- a tag: a dark pill with a coloured dot and words
// (screen space). sub: a second, smaller line. lead: [x, y] a dashed leader to a point.
function shTag(txt, x, y, k, col, sub, lead) {
  if (k <= 0) return;
  screenSpace();
  if (lead) thinLeader([x, y + (sub ? 46 : 30)], lead, clamp(k * 1.3 - 0.2), col);
  const s = lerp(0.6, 1, E.outBack(clamp(k)));
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.font = '900 42px Montserrat'; const w1 = ctx.measureText(txt).width;
  ctx.font = '800 26px Montserrat'; const w2 = sub ? ctx.measureText(sub).width : 0;
  const w = Math.max(w1, w2) + 84, h = sub ? 108 : 70;
  rrect(ctx, -w / 2, -h / 2, w, h, 22); ctx.fillStyle = 'rgba(12,12,28,0.84)'; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = col; ctx.stroke();
  circle(ctx, -w / 2 + 28, sub ? -16 : 0, 9, col);
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.font = '900 42px Montserrat'; ctx.fillStyle = '#FFFFFF'; ctx.fillText(txt, -w / 2 + 50, sub ? -16 : 2);
  if (sub) { ctx.font = '800 26px Montserrat'; ctx.fillStyle = col; ctx.fillText(sub, -w / 2 + 50, 26); }
  ctx.restore();
}
