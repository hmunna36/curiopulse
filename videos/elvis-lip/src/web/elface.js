// elvis-lip (24 Nov 2026): his face, able to curl ONE side of the upper lip (an Elvis snarl, the fang showing) while that
// side's eye squints, plus the gags drawn on his face: the leash from the lip to the eye, the glass cheek with the lip's
// lifting muscle and the eye's ring muscle, the LIFT spark that spills over, and the name tag that unrolls into a scroll.
// Built on wink-other-eye's woface.js (one-eye squints, the lids, the crow's feet). drawFace below REPLACES the rig's
// (character.js; a function declaration loaded later wins), so every shot's face gets it.
// Face fields (all optional, head units; s = -1 his right side = screen-left, +1 his left side = screen-right):
//   sqR / sqL 0..1      a squint: the upper lid comes down (to 0.5), the lower lid comes up (to 0.32), crow's feet, cheek up
//   snarlL / snarlR 0..1  the upper lip lifts on that side: the fang, a sliver of gum, the nose wing up, the nose tip pulled
//                       toward it, the fold from the nose to the mouth corner deepens, bunny lines beside the nose
//   strain 0..1         effort: the other brow climbs (fighting to keep the eye open), a sweat bead at the temple
//   holdBlink           the automatic blinks are ignored
//   leash: {k, yank}    a red dog leash clipped from the lip's corner to the eye's lower lid (screen-right), yanked taut
//   xr: {k, lift, spark, spill, cinch}   the glass cheek (screen-right): the lip's lifting muscle from the lip and nose wing up to
//                       the inner corner of the eye, bunching with `lift`; the LIFT spark climbing it (spark 0..1); at the top it
//                       spills over (spill 0..1) into the ring muscle round the eye, which cinches (cinch 0..1)
//   tag: {k}            a small HELLO name tag stuck on the muscle (the scroll itself is drawn by elScroll in el_world.js)
'use strict';

const EL_LIDLINE = '#6A3526', EL_LIP = '#C25A55', EL_GUM = '#F08A94', EL_MUS = '#D8455E', EL_MUS_HI = '#FF8AA0';

function elLidGeom(f, s) {
  const blBase = f.holdBlink ? (f.blinkSet || 0) : (f.blink || 0);
  const sq = clamp((s < 0 ? f.sqR : f.sqL) || 0), sh = clamp((s < 0 ? f.shutR : f.shutL) || 0);
  const up = Math.max(blBase, sh, 0.5 * sq), lo = 0.32 * sq * (1 - sh);
  return { up, lo, sq, sh };
}
function elSnarl(f, s) { return clamp((s < 0 ? f.snarlR : f.snarlL) || 0); }

function drawFace(c, f, pal) {
  const snL = elSnarl(f, 1), snR = elSnarl(f, -1);
  // cheeks: they lift with a squint, and more with a snarl
  for (const s of [-1, 1]) {
    const g = elLidGeom(f, s), sn = elSnarl(f, s);
    ellipse(c, s * 38, 24 - 6 * g.sq - 5 * sn, 11 + 2 * g.sq + 2 * sn, 7 + sn, `rgba(255,110,110,${0.28 + 0.12 * g.sq + 0.1 * sn})`);
  }
  const lid = pal.skin[0] === '#' && pal.skinSh[0] === '#' ? mixHex(pal.skin, pal.skinSh, 0.3) : pal.skinSh;
  const st = f.strain || 0;
  for (const s of [-1, 1]) {
    const g = elLidGeom(f, s), ex = s * 24, ey = -2, ry = 16 * (f.eyeOpen || 1) * (1 + (s < 0 ? 0.12 * st : 0)), bl = g.up;
    if (bl >= 0.93) {
      c.beginPath(); c.moveTo(ex - 14, ey - 1); c.quadraticCurveTo(ex, ey + 9, ex + 14, ey - 1);
      c.lineWidth = 4.5; c.strokeStyle = '#5A2E22'; c.lineCap = 'round'; c.stroke();
      line(c, ex + s * 13, ey - 1, ex + s * 18, ey - 5, 3, '#5A2E22');
      for (let i = -1; i <= 1; i++) line(c, ex + s * 17, ey + i * 6, ex + s * (24 + 2 * Math.abs(i)), ey - 2 + i * 9, 2.4, 'rgba(120,60,40,0.55)');
    } else {
      ellipse(c, ex, ey, 14 * Math.min(1.15, 0.9 + (f.eyeOpen || 1) * 0.1), ry, '#FFFFFF');
      const lx = (f.lookX || 0) * 5, ly = (f.lookY || 0) * Math.min(7, ry * 0.45);
      circle(c, ex + lx, ey + ly, 7.5 * (f.pupil || 1), pal.pupil);
      circle(c, ex + lx - 2.2, ey + ly - 2.8, 2.6, '#FFFFFF');
      if (bl > 0.01 || g.lo > 0.01) {
        c.save(); c.beginPath(); c.ellipse(ex, ey, 15, ry + 1, 0, 0, Math.PI * 2); c.clip();
        if (bl > 0.01) {
          c.fillStyle = lid; c.fillRect(ex - 16, ey - ry - 2, 32, (2 * ry + 2) * bl + 1);
          line(c, ex - 15, ey - ry + (2 * ry) * bl, ex + 15, ey - ry + (2 * ry) * bl, 3.5, EL_LIDLINE);
        }
        if (g.lo > 0.01) {
          const yl = ey + ry - (2 * ry) * g.lo;
          c.fillStyle = lid; c.beginPath(); c.moveTo(ex - 16, ey + ry + 2); c.lineTo(ex - 16, yl + 3); c.quadraticCurveTo(ex, yl - 3, ex + 16, yl + 3); c.lineTo(ex + 16, ey + ry + 2); c.closePath(); c.fill();
          c.beginPath(); c.moveTo(ex - 15, yl + 3); c.quadraticCurveTo(ex, yl - 3, ex + 15, yl + 3); c.lineWidth = 2.6; c.strokeStyle = 'rgba(150,70,50,0.7)'; c.stroke();
        }
        c.restore();
      }
      if (g.sq > 0.08) for (let i = -1; i <= 1; i++)
        line(c, ex + s * 18, ey + i * 6, ex + s * (25 + 3 * Math.abs(i)), ey - 2 + i * 9, 2.3, `rgba(120,60,40,${0.6 * g.sq})`);
    }
    // the brow: the squinting side comes down (Raman et al. 2025: the same-side brow drops in a one-sided snarl); with strain
    // the OTHER brow climbs, as if that would hold the eye open
    const other = s < 0 ? snL : snR;
    const by = -30 - ((f.browY || 0) + ((s < 0 ? f.browR : f.browL) || 0)) * 8 + 5 * g.sq + 4 * elSnarl(f, s) - 9 * st * other;
    if (!f.noBrows) line(c, s * 11, by - (f.browTilt || 0) * 7 + 3 * g.sq, s * 37, by + (f.browTilt || 0) * 3 - 2 * st * other, 7.5, pal.hair);
  }
  // effort: a bead of sweat at the temple on the snarling side
  if (st > 0.3) {
    const k = clamp((st - 0.3) / 0.5), sx = snR > snL ? -1 : 1;
    c.save(); c.scale(sx, 1);
    c.beginPath(); c.moveTo(52, -30); c.quadraticCurveTo(58, -18, 52, -14); c.quadraticCurveTo(46, -18, 52, -30);
    c.fillStyle = `rgba(170,225,255,${0.95 * k})`; c.fill(); circle(c, 50.5, -19, 1.6, `rgba(255,255,255,${k})`);
    c.restore();
  }
  // the nose: its tip is pulled toward the snarling side, that side's wing lifts and flares
  const ndx = 3.2 * (snL - snR);
  for (const s of [-1, 1]) {   // the fold from the nose wing to the mouth corner, and the bunny lines beside the nose
    const sn = elSnarl(f, s);
    if (sn > 0.05) {
      c.beginPath(); c.moveTo(s * 11 + ndx * 0.5, 17 - 4 * sn); c.quadraticCurveTo(s * 25, 26 - 2 * sn, s * 23, 39 - 3 * sn);
      c.lineWidth = 2.8; c.strokeStyle = `rgba(150,70,50,${0.75 * sn})`; c.lineCap = 'round'; c.stroke();
      for (let i = 0; i < 2; i++) line(c, s * (3.5 + i * 1.6) + ndx * 0.3, 4 + i * 3.2, s * (6 + i * 1.6) + ndx * 0.3, 2.2 + i * 3.2, 1.5, `rgba(130,62,44,${0.4 * sn})`);
    }
  }
  ellipse(c, ndx, 16, 8, 6, 'rgba(190,110,80,0.55)');
  for (const s of [-1, 1]) {   // the wing crease: it rides up on the snarling side
    const sn = elSnarl(f, s);
    c.beginPath(); c.arc(s * 7 + ndx * 0.8, 18.5 - 4 * sn, 3.6 + 1.2 * sn, s < 0 ? 1.9 : -0.6, s < 0 ? 3.7 : 1.2);
    c.lineWidth = 1.8; c.strokeStyle = `rgba(150,72,50,${0.35 + 0.35 * sn})`; c.stroke();
  }
  ellipse(c, -2 + ndx, 14, 3, 2, 'rgba(255,230,210,0.8)');
  elMouth(c, f, pal, snL, snR);
  if (f.xr) elGlassCheek(c, f, pal);
  if (f.leash) elLeash(c, f);
  if (f.tag) elTag(c, f);
}

// the mouth: a relaxed line, or a snarl on one side (the upper lip lifted off the teeth, the fang, a sliver of gum)
function elMouth(c, f, pal, snL, snR) {
  c.save(); c.translate(0, 40);
  const mo = f.mouthOpen || 0;
  if (f.mouth === 'o' && snL + snR < 0.05) {
    ellipse(c, 0, 0, 7 + 5 * mo, 8 + 8 * mo, pal.mouth); ellipse(c, 0, 5 + 3 * mo, 5 + 3 * mo, 3 + 2 * mo, pal.tongue);
    c.restore(); return;
  }
  if (f.mouth === 'grin' && snL + snR < 0.05) {
    c.beginPath(); c.moveTo(-30, -6); c.quadraticCurveTo(0, 26 * mo + 6, 30, -6); c.closePath(); c.fillStyle = pal.mouth; c.fill();
    c.save(); c.clip(); c.fillStyle = pal.teeth; c.fillRect(-30, -7, 60, 9); ellipse(c, 0, 16 * mo, 12, 6, pal.tongue); c.restore();
    c.restore(); return;
  }
  // the lower lip line (stays put) and the upper lip line, lifted on each snarling side
  const up = (x) => {   // the upper lip's height at x: lifted toward each snarling side's canine (x = +-11)
    const kL = snL * Math.exp(-Math.pow((x - 11) / 8.5, 2)) + snL * 0.45 * clamp((x - 2) / 16);
    const kR = snR * Math.exp(-Math.pow((x + 11) / 8.5, 2)) + snR * 0.45 * clamp((-x - 2) / 16);
    return -15 * Math.min(1.1, kL + kR);
  };
  const xs = []; for (let x = -18; x <= 18.01; x += 2) xs.push(x);
  const lowY = (x) => 1.5 + 2.2 * (1 - (x * x) / 324);
  const gap = Math.max(snL, snR);
  if (gap > 0.04) {
    // the opening: from the lifted upper lip down to the lower lip
    c.beginPath(); xs.forEach((x, i) => (i ? c.lineTo(x, up(x)) : c.moveTo(x, up(x))));
    for (let i = xs.length - 1; i >= 0; i--) c.lineTo(xs[i], lowY(xs[i]) - 0.6);
    c.closePath(); c.fillStyle = pal.mouth; c.fill();
    c.save(); c.clip();
    // gum, then the row of upper teeth, then the fang(s) hanging lower
    c.beginPath(); xs.forEach((x, i) => (i ? c.lineTo(x, up(x) + 0.5) : c.moveTo(x, up(x) + 0.5)));
    for (let i = xs.length - 1; i >= 0; i--) c.lineTo(xs[i], up(xs[i]) + 3.2);
    c.closePath(); c.fillStyle = EL_GUM; c.fill();
    c.beginPath(); xs.forEach((x, i) => (i ? c.lineTo(x, up(x) + 2.6) : c.moveTo(x, up(x) + 2.6)));
    for (let i = xs.length - 1; i >= 0; i--) c.lineTo(xs[i], Math.min(lowY(xs[i]) - 1, up(xs[i]) + 8.5));
    c.closePath(); c.fillStyle = pal.teeth; c.fill();
    for (const x of [-7, -2.5, 2.5, 7]) line(c, x, up(x) + 3, x, up(x) + 8, 0.9, 'rgba(160,150,170,0.55)');
    c.restore();
    for (const s of [-1, 1]) {
      const sn = elSnarl(f, s); if (sn < 0.15) continue;
      const x = s * 11, y0 = up(x) + 2.6, L = 6 + 6 * sn;
      c.beginPath(); c.moveTo(x - 2.8, y0); c.lineTo(x + 2.8, y0); c.lineTo(x + 0.5 * s, y0 + L); c.closePath();
      c.fillStyle = '#FFFFFF'; c.fill(); c.lineWidth = 1; c.strokeStyle = 'rgba(140,130,150,0.7)'; c.stroke();
    }
  }
  // the lips as lines over the opening: the upper one thick and curled where it lifts, the lower one plain
  c.beginPath(); xs.forEach((x, i) => (i ? c.lineTo(x, up(x)) : c.moveTo(x, up(x))));
  c.lineWidth = 4.6 + 1.6 * gap; c.strokeStyle = gap > 0.04 ? EL_LIP : pal.mouth; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke();
  if (gap > 0.04) {
    c.beginPath(); for (let i = 0; i < xs.length; i++) { const x = xs[i]; (i ? c.lineTo : c.moveTo).call(c, x, lowY(x)); }
    c.lineWidth = 4.2; c.strokeStyle = EL_LIP; c.stroke();
    for (const s of [-1, 1]) {   // the curl: a little rolled edge where the lip lifts highest
      const sn = elSnarl(f, s); if (sn < 0.2) continue;
      c.beginPath(); c.arc(s * 11, up(s * 11) - 2, 4.5, Math.PI * 1.05, Math.PI * 1.95); c.lineWidth = 2.2; c.strokeStyle = 'rgba(120,40,40,0.6)'; c.stroke();
    }
  }
  c.restore();
}

// ---------------------------------------------------------------- the glass cheek: the lifting muscle and the eye's ring
// the muscle runs from the inner corner of the eye (the side of the nose, up by the eye) down to the nose wing and the lip
function elMusclePath(f) {
  const lift = clamp((f.xr && f.xr.lift) || 0), ndx = 3.2 * ((f.snarlL || 0) - (f.snarlR || 0));
  return { top: [9.5, -9], wing: [9 + ndx * 0.8, 18 - 4.5 * lift], lip: [12, 37 - 12 * lift], lift };
}
function elGlassCheek(c, f, pal) {
  const X = f.xr, k = clamp(X.k || 0);
  if (k <= 0.01) return;
  const P = elMusclePath(f), lift = P.lift, spark = X.spark || 0, spill = clamp(X.spill || 0), cinch = clamp(X.cinch || 0);
  c.save();
  // the glass: a cool sheen over the cheek and round the eye (paint: no edge, no shadow)
  c.globalAlpha = 0.55 * k;
  c.beginPath(); c.ellipse(20, 6, 34, 44, -0.2, 0, Math.PI * 2); c.fillStyle = '#1B3F8C'; c.fill();
  c.globalAlpha = k;
  c.lineWidth = 1.8; c.strokeStyle = 'rgba(170,225,255,0.85)'; c.beginPath(); c.ellipse(20, 6, 34, 44, -0.2, 0, Math.PI * 2); c.stroke();
  // the eye's ring muscle: a band round the eye that tightens like a drawstring
  const rr = 23 - 4 * cinch, glow = 0.45 + 0.55 * Math.max(cinch, spill);
  c.beginPath(); c.ellipse(24, -2, rr + 4, rr * 0.86 + 4, 0, 0, Math.PI * 2); c.ellipse(24, -2, rr - 4, rr * 0.86 - 4, 0, 0, Math.PI * 2, true);
  c.fillStyle = mixH('#B83A6E', '#FF7A3C', Math.max(cinch, spill * 0.7)); c.fill('evenodd');
  for (let i = 0; i < 16; i++) {   // its fibres run round the eye
    const a = (i / 16) * Math.PI * 2;
    line(c, 24 + Math.cos(a) * (rr - 3), -2 + Math.sin(a) * (rr * 0.86 - 3), 24 + Math.cos(a + 0.2) * (rr + 3), -2 + Math.sin(a + 0.2) * (rr * 0.86 + 3), 1, `rgba(255,215,230,${0.55 * glow})`);
  }
  // the drawstring's two ends at the outer corner: they pull when it cinches
  const kx = 24 + rr + 4, kn = 4 + 8 * cinch;
  line(c, kx, -2, kx + kn, -6 - 2 * cinch, 1.8, '#FFE9B0'); line(c, kx, -2, kx + kn, 2 + 2 * cinch, 1.8, '#FFE9B0');
  // the lifting muscle: a spindle from the top (by the eye) splitting to the wing and the lip; it bunches when it pulls
  const spindle = (a, b, w) => {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), an = Math.atan2(b[1] - a[1], b[0] - a[0]);
    c.save(); c.translate((a[0] + b[0]) / 2, (a[1] + b[1]) / 2); c.rotate(an);
    c.beginPath(); c.moveTo(-L / 2, 0); c.quadraticCurveTo(0, -w, L / 2, 0); c.quadraticCurveTo(0, w, -L / 2, 0); c.closePath();
    c.fillStyle = mixH(EL_MUS, EL_MUS_HI, lift); c.fill(); c.lineWidth = 1.2; c.strokeStyle = '#FFD0DC'; c.stroke();
    for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(-L / 2 + 3, 0); c.quadraticCurveTo(0, i * w * 0.45, L / 2 - 3, 0); c.lineWidth = 0.9; c.strokeStyle = 'rgba(255,220,230,0.8)'; c.stroke(); }
    c.restore();
  };
  spindle(P.top, P.wing, 5 + 3 * lift);
  spindle(P.top, P.lip, 6.5 + 4 * lift);
  circle(c, P.top[0], P.top[1], 2.8, '#FFE9B0');   // where it is tied on: right by the eye
  // the LIFT spark: up the muscle from the lip to the top, then over the brim into the ring
  if (spark > 0.001 && spark < 1.0) {
    const u = E.inOutSine(clamp(spark)), x = lerp(P.lip[0], P.top[0], u), y = lerp(P.lip[1], P.top[1], u);
    circle(c, x, y, 3.8, '#FFF6C8'); circle(c, x, y, 2.2, '#FFFFFF');
  }
  if (spill > 0.01) {   // the overflow: little sparks arc from the top of the muscle into the ring
    for (let i = 0; i < 6; i++) {
      const u = clamp(spill * 1.4 - i * 0.07), a = -2.4 + i * 0.45;
      if (u <= 0 || u >= 1) continue;
      const tx = 24 + Math.cos(a) * rr, ty = -2 + Math.sin(a) * rr * 0.86;
      const x = lerp(P.top[0], tx, u), y = lerp(P.top[1], ty, u) - 9 * Math.sin(Math.PI * u);
      circle(c, x, y, 2.4, '#FFE47A');
    }
  }
  c.restore();
}

// ---------------------------------------------------------------- the leash: from the lip's corner up to the eye's lower lid
function elLeash(c, f) {
  const L = f.leash, k = clamp(L.k || 0), yank = clamp(L.yank || 0);
  if (k <= 0.01) return;
  const a = [17, 36], b = [27, 12 - 2 * yank], sag = (1 - yank) * 9;
  const mid = [lerp(a[0], b[0], 0.5) + 9 + sag, lerp(a[1], b[1], 0.5) + sag * 0.4];
  const u = E.outCubic(k);
  const pt = (s) => [ (1 - s) * (1 - s) * a[0] + 2 * (1 - s) * s * mid[0] + s * s * b[0], (1 - s) * (1 - s) * a[1] + 2 * (1 - s) * s * mid[1] + s * s * b[1] ];
  c.save(); c.lineCap = 'round';
  c.beginPath(); for (let i = 0; i <= 16; i++) { const p = pt(u * i / 16); (i ? c.lineTo : c.moveTo).call(c, p[0], p[1]); }
  c.lineWidth = 6.4; c.strokeStyle = '#7A1020'; c.stroke(); c.lineWidth = 4.4; c.strokeStyle = '#E8384F'; c.stroke();
  // the handle loop at the lip end, the clip at the eye end
  c.beginPath(); c.ellipse(a[0] + 4, a[1] + 6, 7, 5, 0.5, 0, Math.PI * 2); c.lineWidth = 3.6; c.strokeStyle = '#E8384F'; c.stroke();
  if (u > 0.95) {
    rrect(c, b[0] - 2.6, b[1] - 1, 5.2, 6.5, 2); c.fillStyle = '#D7DDE8'; c.fill();
    c.lineWidth = 1; c.strokeStyle = '#6B7488'; c.stroke(); circle(c, b[0], b[1] + 4.5, 1, '#6B7488');
  }
  c.restore();
}

// ---------------------------------------------------------------- the name tag on the muscle (head units)
function elTag(c, f) {
  const k = clamp(f.tag.k || 0);
  if (k <= 0.01) return;
  c.save(); c.translate(31, 26); c.rotate(-0.12); c.scale(E.outBack(k, 2.2), E.outBack(k, 2.2));
  rrect(c, -14, -9, 28, 18, 3); c.fillStyle = '#FFFFFF'; c.fill(); c.lineWidth = 1; c.strokeStyle = '#C8C8D0'; c.stroke();
  rrect(c, -14, -9, 28, 6.5, 3); c.fillStyle = '#E8384F'; c.fill();
  c.fillStyle = '#FFFFFF'; c.font = '900 4.2px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('HELLO', 0, -5.8);
  c.fillStyle = '#2A1A10'; c.font = '700 3.4px Montserrat'; c.fillText('my name is', 0, 0.2);
  line(c, -10, 5, 10, 5, 0.8, '#9A9AA8');
  c.restore();
}

// where a point of his head (head units) lands in world coordinates, for a hiker drawn with st
function elHeadPt(st, lx, ly) {
  const r = rig(st.pose), a = r.lean + (st.headRot || 0), cs = Math.cos(a), sn = Math.sin(a);
  const hx = r.head[0] + (st.headDX || 0), hy = r.head[1] + (st.headDY || 0);
  return [st.x + st.s * (hx + lx * cs - ly * sn), st.y + st.s * (hy + lx * sn + ly * cs)];
}
