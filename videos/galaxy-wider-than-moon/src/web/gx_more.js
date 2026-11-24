// There's a GALAXY in Your Sky Wider Than the Moon: the eye up close, the light's trip, the time ribbon (25 Nov 2026).
'use strict';

// ================================================================ his right eye, extreme close-up (screen space)
// o: {cx, cy (the eye's centre), s (size: 1 = an eye 500 px wide), blink 0..1, look [x, y], specks 0..1 (light falling in),
//     pool 0..1 (the light gathered in the pupil), squeeze 0..1, t}
function gxEyeECU(t, o = {}) {
  screenSpace();
  const cx = o.cx != null ? o.cx : 540, cy = o.cy != null ? o.cy : 930, s = o.s || 1;
  // his skin, lit from the upper left; the moonlight's cool edge on the right
  const g = ctx.createRadialGradient(cx - 380 * s, cy - 520 * s, 60 * s, cx, cy, 1500 * s);
  g.addColorStop(0, PAL.skinHi); g.addColorStop(0.35, PAL.skin); g.addColorStop(1, PAL.skinSh);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const g2 = ctx.createLinearGradient(W, 0, W - 360, 0);
  g2.addColorStop(0, 'rgba(120,140,255,0.32)'); g2.addColorStop(1, 'rgba(120,140,255,0)');
  ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);
  // his hair at the top edge, the goggles' strap across it
  ctx.fillStyle = PAL.hair; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W, 0); ctx.lineTo(W, cy - 640 * s);
  ctx.quadraticCurveTo(cx, cy - 760 * s, 0, cy - 600 * s); ctx.closePath(); ctx.fill();
  line(ctx, 0, cy - 690 * s, W, cy - 760 * s, 46 * s, GX.strap);
  const bl = clamp(o.blink || 0), sq = clamp(o.squeeze || 0);
  const rx = 250 * s, ry = 285 * s * (1 - 0.35 * sq);
  paint(() => {
    // the brow
    ctx.save(); ctx.lineCap = 'round'; ctx.lineWidth = 64 * s; ctx.strokeStyle = PAL.hair;
    ctx.beginPath(); ctx.moveTo(cx - 300 * s, cy - 400 * s + 40 * sq * s); ctx.quadraticCurveTo(cx, cy - 470 * s + 60 * sq * s, cx + 300 * s, cy - 380 * s + 50 * sq * s); ctx.stroke(); ctx.restore();
    // cheek blush, a crease under the eye
    ellipse(ctx, cx - 250 * s, cy + 420 * s, 150 * s, 90 * s, 'rgba(255,110,110,0.22)');
    ctx.save(); ctx.lineWidth = 9 * s; ctx.strokeStyle = 'rgba(190,110,80,0.35)'; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.ellipse(cx, cy + 30 * s, rx * 1.02, ry * 1.06, 0, 0.25 * Math.PI, 0.75 * Math.PI); ctx.stroke(); ctx.restore();
    if (bl >= 0.93) {   // shut: a lash curve
      ctx.save(); ctx.lineCap = 'round'; ctx.lineWidth = 26 * s; ctx.strokeStyle = '#5A2E22';
      ctx.beginPath(); ctx.moveTo(cx - rx, cy - 4 * s); ctx.quadraticCurveTo(cx, cy + 150 * s, cx + rx, cy - 4 * s); ctx.stroke();
      for (let i = 0; i < 7; i++) { const u = (i + 0.5) / 7, lx = lerp(cx - rx * 0.9, cx + rx * 0.9, u), ly2 = cy + 4 * s + 130 * s * Math.sin(Math.PI * u) * 0.55; line(ctx, lx, ly2, lx + (u - 0.5) * 60 * s, ly2 + 50 * s, 12 * s, '#5A2E22'); }
      ctx.restore();
      return;
    }
    // the eye white, its soft shadow under the lid
    ellipse(ctx, cx, cy, rx, ry, '#FFFFFF');
    ctx.save(); ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.clip();
    const sh = ctx.createLinearGradient(0, cy - ry, 0, cy + ry);
    sh.addColorStop(0, 'rgba(150,160,200,0.45)'); sh.addColorStop(0.3, 'rgba(150,160,200,0)'); ctx.fillStyle = sh; ctx.fillRect(cx - rx, cy - ry, 2 * rx, 2 * ry);
    const lk = o.look || [0.25, -0.35];
    const px = cx + lk[0] * 70 * s, py = cy + lk[1] * 80 * s, pr = 128 * s;
    // the iris (at this size the rig's dark pupil gets a warm brown iris round it), then the pupil
    circle(ctx, px, py, pr * 1.55, '#7A4524');
    for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2; line(ctx, px + Math.cos(a) * pr * 0.95, py + Math.sin(a) * pr * 0.95, px + Math.cos(a) * pr * 1.5, py + Math.sin(a) * pr * 1.5, 5 * s, i % 2 ? 'rgba(170,100,50,0.55)' : 'rgba(60,28,14,0.45)'); }
    ctx.save(); ctx.lineWidth = 10 * s; ctx.strokeStyle = '#3A1E10'; ctx.beginPath(); ctx.arc(px, py, pr * 1.55, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    circle(ctx, px, py, pr, PAL.pupil);
    // a tiny smudge reflected in it: all it catches of the galaxy
    ctx.save(); ctx.translate(px + pr * 0.35, py - pr * 0.1); ctx.rotate(-0.6); ellipse(ctx, 0, 0, 22 * s, 7 * s, 'rgba(210,200,255,0.55)'); ellipse(ctx, 0, 0, 7 * s, 3 * s, 'rgba(255,245,220,0.9)'); ctx.restore();
    // the light it has gathered: a small violet pool in the pupil
    const pool = clamp(o.pool || 0);
    if (pool > 0.01) { softDot(ctx, px, py, pr * 0.9 * pool, '#B9A8FF', 0.85); circle(ctx, px, py, pr * 0.22 * pool, rgba('#FFF2CC', 0.9)); }
    circle(ctx, px - 44 * s, py - 52 * s, 38 * s, '#FFFFFF');
    circle(ctx, px + 46 * s, py + 40 * s, 14 * s, 'rgba(255,255,255,0.8)');
    // the upper lid closing
    if (bl > 0.01 || sq > 0.01) {
      const k = Math.max(bl, 0.32 * sq), lidY = cy - ry + 2 * ry * k;
      ctx.fillStyle = mixH(PAL.skin, PAL.skinSh, 0.3); ctx.fillRect(cx - rx - 4, cy - ry - 4, 2 * rx + 8, lidY - (cy - ry) + 4);
      line(ctx, cx - rx, lidY, cx + rx, lidY, 18 * s, '#6A3526');
      if (sq > 0.01) { const by = cy + ry - 2 * ry * 0.2 * sq; ctx.fillStyle = mixH(PAL.skin, PAL.skinSh, 0.3); ctx.fillRect(cx - rx - 4, by, 2 * rx + 8, ry); }
    }
    ctx.restore();
    // the lashes on top
    ctx.save(); ctx.lineCap = 'round'; ctx.lineWidth = 14 * s; ctx.strokeStyle = '#5A2E22';
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); ctx.restore();
  });
  // the glow of the gathered light (bloom)
  const pool = clamp(o.pool || 0);
  if (pool > 0.01 && bl < 0.93) { const lk = o.look || [0.25, -0.35]; softDot(gctx, cx + lk[0] * 70 * s, cy + lk[1] * 80 * s, 120 * s * pool, '#B9A8FF', 0.8); }
}
// light falling into the eye: specks from the upper right toward (tx, ty). k 0..1 (how many), seed
function gxSpecks(t, tx, ty, k, o = {}) {
  if (k <= 0.01) return;
  screenSpace();
  const n = Math.round((o.n || 26) * clamp(k)), rnd = mulberry32(o.seed || 5);
  for (let i = 0; i < n; i++) {
    const sx = (o.x0 != null ? o.x0 : 980) + (rnd() - 0.5) * 360, sy = (o.y0 != null ? o.y0 : 330) + (rnd() - 0.5) * 240;
    const ph = rnd(), sp = 0.8 + 0.6 * rnd();
    const u = ((t * sp * (o.rate || 1.4) + ph) % 1);
    const x = lerp(sx, tx + (rnd() - 0.5) * 40, E.inQuad(u)), y = lerp(sy, ty + (rnd() - 0.5) * 40, E.inQuad(u));
    const r = (o.r || 7) * (1 - 0.5 * u), a = Math.min(1, u * 6) * (1 - Math.max(0, u - 0.92) / 0.08);
    circle(ctx, x, y, r, rgba('#F2ECFF', 0.95 * a));
    softDot(gctx, x, y, r * 4, '#B9A8FF', 0.8 * a);
    line(ctx, x, y, x + (sx - tx) * 0.04, y + (sy - ty) * 0.04, r * 0.8, rgba('#C9B8FF', 0.45 * a));
  }
}

// ================================================================ space: Andromeda from outside, its light on the way
// o: {gx, gy, gs (the galaxy's scale), gsy (how face-on: 1 as from Earth, ~2.4 more face-on), ang, photon: {x, y, r, k,
//     tail: [dx, dy]}, us: {x, y, s, k} (our galaxy, small), streak 0..1 (stars streaking past), sx, sy (star drift)}
function gxSpace(t, o = {}) {
  screenSpace();
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#03051E'); g.addColorStop(0.5, '#0B0F44'); g.addColorStop(1, '#1A1460');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // nebula haze
  for (const [x, y, r, col, a] of [[220, 520, 520, '#5A3AD0', 0.16], [900, 1300, 600, '#2A6AE0', 0.12], [400, 1600, 420, '#C04AB0', 0.1]]) softDot(ctx, x, y, r, col, a);
  const st = o.streak || 0;
  if (st > 0.01) {   // the stars streak past toward the edges (we race along with the light)
    const rnd = mulberry32(88);
    for (let i = 0; i < 160; i++) {
      const a = rnd() * Math.PI * 2, d0 = 60 + rnd() * 900, ph = rnd();
      const u = ((t * 1.6 + ph) % 1), d = d0 * (0.3 + 1.6 * u);
      const x = 540 + Math.cos(a) * d, y = 900 + Math.sin(a) * d, L = 40 + 160 * u * st;
      line(ctx, x, y, x + Math.cos(a) * L, y + Math.sin(a) * L, 1.5 + 2 * u, rgba('#DCE6FF', 0.55 * st * u));
    }
  } else {
    ctx.save(); ctx.globalAlpha = 0.9;
    ctx.drawImage(GX_STARS, -300 - (o.sx || 0) * 0.2, -200 - (o.sy || 0) * 0.2);
    ctx.restore();
  }
  if (o.gs) {
    // Andromeda, more face-on than from Earth: its painted disk stretched across its short axis
    screenSpace();
    paint(() => {
      ctx.save(); ctx.translate(o.gx, o.gy); ctx.rotate(o.ang || -0.4); ctx.scale(1, o.gsy || 2.2);
      ctx.globalCompositeOperation = 'lighter';
      const k = GX_K * o.gs;
      ctx.drawImage(GX_GAL, -GX_GW / 2 * k, -GX_GH / 2 * k, GX_GW * k, GX_GH * k);
      ctx.restore();
    });
    softDot(gctx, o.gx, o.gy, 150 * o.gs, '#FFE9C0', 0.85);
    softDot(gctx, o.gx, o.gy, 420 * o.gs, '#9C8CFF', 0.3);
  }
  if (o.us && o.us.k > 0.01) {   // our galaxy, far away, small: a little spiral with a bar
    const u = o.us;
    screenSpace();
    ctx.save(); ctx.translate(u.x, u.y); ctx.rotate(0.5); ctx.scale(u.s * E.outBack(clamp(u.k)), u.s * E.outBack(clamp(u.k)) * 0.55);
    softDot(ctx, 0, 0, 90, '#BFD0FF', 0.55); softDot(ctx, 0, 0, 30, '#FFF0D0', 1);
    ctx.lineWidth = 9; ctx.strokeStyle = 'rgba(200,215,255,0.55)';
    for (const s of [0, Math.PI]) { ctx.beginPath(); for (let i = 0; i < 40; i++) { const a = s + i * 0.12, r = 14 + i * 2; i ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.stroke(); }
    ctx.restore();
    softDot(gctx, u.x, u.y, 70 * u.s, '#CFE0FF', 0.6 * clamp(u.k));
  }
  if (o.photon && o.photon.k > 0.01) gxPhoton(o.photon.x, o.photon.y, o.photon.r, o.photon.k, o.photon.tail || [-1, -1], t);
}
// the ball of light: a white-violet core, a halo, a comet tail pointing back where it came from
function gxPhoton(x, y, r, k, tail, t) {
  screenSpace();
  const d = Math.hypot(tail[0], tail[1]) || 1, ux = tail[0] / d, uy = tail[1] / d;
  for (let i = 12; i >= 1; i--) {
    const q = i / 12, tx = x + ux * r * 9 * q, ty = y + uy * r * 9 * q;
    circle(ctx, tx, ty, r * (1 - q * 0.8), rgba('#C9B8FF', 0.22 * (1 - q) * k));
  }
  softDot(ctx, x, y, r * 3, '#B9A8FF', 0.5 * k);
  circle(ctx, x, y, r, rgba('#FFFFFF', k));
  softDot(gctx, x, y, r * 5, '#C9B8FF', 0.95 * k);
  softDot(gctx, x, y, r * 2, '#FFFFFF', k);
  // a twinkle cross
  const L = r * (2.6 + 0.6 * Math.sin(t * 18));
  line(ctx, x - L, y, x + L, y, r * 0.22, rgba('#FFFFFF', 0.8 * k)); line(ctx, x, y - L, x, y + L, r * 0.22, rgba('#FFFFFF', 0.8 * k));
}
// a big counter board in screen space: the label over the number
function gxCounter(x, y, k, num, label, col = '#FFD447') {
  if (k <= 0.01) return;
  screenSpace();
  ctx.save(); ctx.translate(x, y); const sc = E.outBack(clamp(k)); ctx.scale(sc, sc);
  rrect(ctx, -330, -100, 660, 200, 40); ctx.fillStyle = 'rgba(10,12,40,0.86)'; ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = col; ctx.stroke();
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); gctx.translate(x, y); rrect(gctx, -350, -120, 700, 240, 56); gctx.fillStyle = '#000'; gctx.fill(); gctx.restore();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = '900 34px Montserrat'; ctx.fillStyle = '#B9C8FF'; ctx.fillText(label, 0, -52);
  ctx.font = '900 92px Montserrat'; ctx.fillStyle = col; ctx.fillText(num, 0, 26);
  ctx.restore();
}

// ================================================================ the time ribbon (screen space)
// o: {x0, x1, y (the ribbon), k (drawn on 0..1), photonU (where the light is, 0..1 along it, or null), people 0..1 (the
//     PEOPLE flag pops), empty 0..1 ("NO PEOPLE YET" under the empty stretch), you 0..1 (the YOU end), cam: {zoom, cx}}
function gxRibbon(t, o = {}) {
  screenSpace();
  const z = (o.cam && o.cam.zoom) || 1, ccx = (o.cam && o.cam.cx) || 540, ccy = (o.cam && o.cam.cy) || o.y;
  const X = (u) => 540 + (lerp(o.x0, o.x1, u) - ccx) * z, Y = (yy) => 960 + (yy - ccy) * z;
  const y = Y(o.y), k = clamp(o.k != null ? o.k : 1);
  // the ribbon: violet at the far past, gold at tonight, with ticks
  const xa = X(0), xb = X(1), xe = lerp(xa, xb, k);
  const g = ctx.createLinearGradient(xa, 0, xb, 0);
  g.addColorStop(0, '#7A5CFF'); g.addColorStop(0.85, '#C77DFF'); g.addColorStop(1, '#FFD447');
  rrect(ctx, xa, y - 22 * z, Math.max(1, xe - xa), 44 * z, 22 * z); ctx.fillStyle = g; ctx.fill();
  gctx.save(); gctx.globalAlpha = 0.45; rrect(gctx, xa, y - 22 * z, Math.max(1, xe - xa), 44 * z, 22 * z); gctx.fillStyle = '#8F6BFF'; gctx.fill(); gctx.restore();
  for (let i = 1; i < 10; i++) { const u = i / 10; if (u > k) break; line(ctx, X(u), y - 34 * z, X(u), y + 34 * z, 4 * z, 'rgba(255,255,255,0.5)'); }
  // the far end: Andromeda, where the light set off
  const a0 = X(0);
  softDot(ctx, a0, y - 150 * z, 90 * z, '#C9B8FF', 0.5);
  ctx.save(); ctx.translate(a0, y - 150 * z); ctx.rotate(-0.5); ctx.scale(1, 0.35); softDot(ctx, 0, 0, 80 * z, '#E6DCFF', 0.9); softDot(ctx, 0, 0, 26 * z, '#FFF6D8', 1); ctx.restore();
  softDot(gctx, a0, y - 150 * z, 60 * z, '#FFE9C0', 0.7);
  gxTagZ('2,500,000 YEARS AGO', a0 + 230 * z, y + 110 * z, '#C9B8FF', 1, 34 * z);
  // "NO PEOPLE YET" under the empty stretch
  if ((o.empty || 0) > 0.01) gxTagZ('NO PEOPLE YET...', X(0.42), y - 120 * z, '#FFFFFF', o.empty, 40 * z);
  // the PEOPLE flag at 88 % (300,000 years ago): a pole, a flag, a little person
  if ((o.people || 0) > 0.01) {
    const px = X(0.88), pk = E.outBack(clamp(o.people), 1.6), h = 230 * z * pk;
    line(ctx, px, y - 20 * z, px, y - 20 * z - h, 7 * z, '#E8E6F2');
    ctx.save(); ctx.translate(px, y - 20 * z - h); ctx.scale(pk, pk);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-170 * z, 30 * z); ctx.lineTo(0, 64 * z); ctx.closePath(); ctx.fillStyle = '#FF9A3C'; ctx.fill();
    ctx.restore();
    // the little person beside the pole, arms up
    const fx = px + 46 * z, fy = y - 26 * z, s = z * pk;
    circle(ctx, fx, fy - 92 * s, 18 * s, '#F2B892');
    line(ctx, fx, fy - 74 * s, fx, fy - 30 * s, 14 * s, '#FF9A3C');
    line(ctx, fx, fy - 64 * s, fx - 24 * s, fy - 100 * s, 9 * s, '#F2B892'); line(ctx, fx, fy - 64 * s, fx + 24 * s, fy - 100 * s, 9 * s, '#F2B892');
    line(ctx, fx, fy - 32 * s, fx - 14 * s, fy, 10 * s, '#2F3A78'); line(ctx, fx, fy - 32 * s, fx + 14 * s, fy, 10 * s, '#2F3A78');
    gxTagZ('PEOPLE!', px - 20 * z, y + 110 * z, '#FF9A3C', clamp(o.people), 40 * z);
  }
  // the near end: tonight (a small gold dot and TONIGHT)
  if (k > 0.98) { circle(ctx, X(1), y, 30 * z, '#FFD447'); softDot(gctx, X(1), y, 60 * z, '#FFD447', 0.8); }
  if (o.photonU != null) gxPhoton(X(o.photonU), y, 20 * z, 1, [-1, 0], t);
}
// a tag whose size is given (zoomed scenes)
function gxTagZ(txt, x, y, col, k, size) { gxTag(txt, x, y, col, k, Math.max(12, size)); }
