// Your HONEY Could Outlive You: the cast's outfits and props (the hero's home shirt, his explorer kit, the old man's
// beard and glasses, the pith helmet, the canteen, the brush and the spoon) and the small graphics (age tags, sparkles).
// Every drawing is in world units under the camera; head props are drawn in HEAD units (drawFace's frame: eyes at
// y -2, brows about -32, nose 16, mouth 40, the hair cap's top about -88).
'use strict';

// ---------------------------------------------------------------- palettes (only the clothes change; face and hair stay)
const HNPAL = Object.assign({}, PAL, {        // at home: a blue button shirt, sleeves rolled up
  coat: '#2F86C9', coatSh: '#1F6299', coatHi: '#86C2EE', coatDk: '#184F7E', pj: true, shortSleeve: true,
});
const HNEXP = Object.assign({}, PAL, {        // the explorer: khaki, brown straps
  coat: '#CDA867', coatSh: '#A58044', coatHi: '#EBD29C', coatDk: '#7F6434', strap: '#7B4A28', strapSh: '#57331A',
  pants: '#6A5A3C', pantsSh: '#4C4029', shoe: '#7A4E2E', shoeSh: '#523320', shortSleeve: true,
});
// the old man: the same shirt, the hair (and brows) going white with age 0..1
function hnOldPal(age) {
  if (age <= 0.001) return HNPAL;
  return Object.assign({}, HNPAL, { hair: mixH('#2A1B14', '#E7E8EE', age), hairHi: mixH('#5A4030', '#FFFFFF', age) });
}

// ---------------------------------------------------------------- head space
// sets c to the hero's head frame (call inside charLayer's post or after drawCharacter; c is under the camera)
function hnHeadT(c, st, r) {
  c.translate(st.x, st.y); c.scale(st.s, st.s);
  c.translate(r.head[0] + (st.headDX || 0), r.head[1] + (st.headDY || 0));
  c.rotate(r.lean + (st.headRot || 0));
}
// the head's centre in world coords
function hnHeadW(st, r) { return [st.x + (r.head[0] + (st.headDX || 0)) * st.s, st.y + (r.head[1] + (st.headDY || 0)) * st.s]; }

// a pith helmet (head units)
function hnHelmet(c, st, r, o = {}) {
  c.save(); hnHeadT(c, st, r);
  const tip = o.tip || 0;
  c.rotate(tip);
  // the crown
  c.beginPath(); c.ellipse(0, -54, 80, 62, 0, Math.PI, Math.PI * 2); c.lineTo(80, -44); c.lineTo(-80, -44); c.closePath();
  c.fillStyle = '#EADCB6'; c.fill();
  // the band
  c.beginPath(); c.moveTo(-80, -50); c.lineTo(80, -50); c.lineTo(80, -38); c.lineTo(-80, -38); c.closePath();
  c.fillStyle = '#8A6838'; c.fill();
  // the brim
  c.beginPath(); c.ellipse(0, -38, 108, 19, 0, 0, Math.PI * 2); c.fillStyle = '#DCCB9E'; c.fill();
  c.beginPath(); c.ellipse(0, -42, 100, 13, 0, Math.PI, Math.PI * 2); c.fillStyle = '#EFE3C2'; c.fill();
  // the vent on top
  c.beginPath(); c.ellipse(0, -114, 14, 7, 0, 0, Math.PI * 2); c.fillStyle = '#CDB98A'; c.fill();
  c.restore();
}

// the old man's beard: length 0..1 (to his belt, then over the counter), moustache included; drawn over the face
function hnBeard(c, st, r, len, t) {
  if (len <= 0.01) return;
  c.save(); hnHeadT(c, st, r);
  const L = 20 + 520 * len, wv = (y) => 6 * Math.sin(y * 0.05 + t * 2.0);
  const W2 = 58 + 22 * clamp(len * 3);
  c.beginPath();
  c.moveTo(-60, 8);
  c.quadraticCurveTo(-W2 - 6, 50 + L * 0.25, -W2 * 0.55 + wv(L * 0.6), 60 + L * 0.7);
  c.quadraticCurveTo(-18 + wv(L), 70 + L, 0 + wv(L), 76 + L);
  c.quadraticCurveTo(18 + wv(L), 70 + L, W2 * 0.55 + wv(L * 0.6), 60 + L * 0.7);
  c.quadraticCurveTo(W2 + 6, 50 + L * 0.25, 60, 8);
  c.quadraticCurveTo(40, 52, 0, 56);
  c.quadraticCurveTo(-40, 52, -60, 8);
  c.closePath();
  c.fillStyle = '#E9EAF0'; c.fill();
  // strands
  for (let i = -3; i <= 3; i++) {
    const x0 = i * 14;
    c.beginPath(); c.moveTo(x0, 62); c.quadraticCurveTo(x0 * 1.2 + wv(L * 0.5), 60 + L * 0.5, x0 * 0.4 + wv(L), 50 + L * 0.95);
    c.lineWidth = 2.5; c.strokeStyle = 'rgba(160,165,185,0.6)'; c.stroke();
  }
  // the moustache
  for (const s of [-1, 1]) {
    c.beginPath(); c.moveTo(0, 30); c.quadraticCurveTo(s * 26, 22, s * 44, 40 + 6 * len); c.quadraticCurveTo(s * 24, 44, 0, 38); c.closePath();
    c.fillStyle = '#F4F5FA'; c.fill();
  }
  c.restore();
}
// round glasses for the old man (paint: they are drawn on the face)
function hnGlasses(c, st, r, k) {
  if (k <= 0.02) return;
  c.save(); hnHeadT(c, st, r);
  paint(() => {
    c.globalAlpha = 1;
    for (const s of [-1, 1]) { c.beginPath(); c.arc(s * 25, -2, 21, 0, Math.PI * 2); c.lineWidth = 4.5 * k; c.strokeStyle = '#3B2B22'; c.stroke(); }
    line(c, -4, -4, 4, -4, 4 * k, '#3B2B22');
  });
  c.restore();
}
// crow's feet at the outer eye corners (paint). The hair cap covers his forehead, so lines there read as stripes in
// white hair (round 1: a "headband" on the old man and the cover)
function hnWrinkles(c, st, r, k) {
  if (k <= 0.02) return;
  c.save(); hnHeadT(c, st, r);
  paint(() => {
    for (const s of [-1, 1]) for (let i = -1; i <= 1; i++) {
      c.beginPath(); c.moveTo(s * 49, -2 + i * 6); c.lineTo(s * (58 + 2 * Math.abs(i)), -4 + i * 10);
      c.lineWidth = 2.6; c.strokeStyle = `rgba(150,80,60,${0.55 * k})`; c.lineCap = 'round'; c.stroke();
    }
  });
  c.restore();
}

// a canteen (world units, centre x, y), blue with a cork and a strap stub
function hnCanteen(c, x, y, s, rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.beginPath(); c.ellipse(0, 0, 34, 38, 0, 0, Math.PI * 2); c.fillStyle = '#2E9AD8'; c.fill();
  c.beginPath(); c.ellipse(0, 0, 25, 29, 0, 0, Math.PI * 2); c.fillStyle = '#4FB7EE'; c.fill();
  rrect(c, -9, -52, 18, 16, 4); c.fillStyle = '#9C6A3C'; c.fill();
  line(c, -30, -16, -38, -40, 6, '#7B4A28');
  ellipse(c, -12, -12, 7, 11, 'rgba(255,255,255,0.55)', -0.4);
  c.restore();
}

// a soft brush (archaeologist): handle + bristles, angle rot
function hnBrush(c, x, y, s, rot) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  rrect(c, -6, -70, 12, 60, 5); c.fillStyle = '#9A5B2E'; c.fill();
  rrect(c, -10, -14, 20, 10, 3); c.fillStyle = '#C9C9D2'; c.fill();
  c.beginPath(); c.moveTo(-12, -4); c.lineTo(12, -4); c.lineTo(15, 24); c.lineTo(-15, 24); c.closePath(); c.fillStyle = '#E8D9A8'; c.fill();
  c.restore();
}
// a spoon (silver) with an optional lump (o.lump 0..1: a black, crusty lump; o.honey: a golden drop)
function hnSpoon(c, x, y, s, rot, o = {}) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  rrect(c, -6, 0, 12, 120, 6); c.fillStyle = '#B9C0CF'; c.fill();
  line(c, -2, 8, -2, 110, 3, 'rgba(255,255,255,0.7)');
  c.beginPath(); c.ellipse(0, -18, 24, 32, 0, 0, Math.PI * 2); c.fillStyle = '#C9D0DE'; c.fill();
  c.beginPath(); c.ellipse(-6, -24, 8, 14, 0, 0, Math.PI * 2); c.fillStyle = 'rgba(255,255,255,0.75)'; c.fill();
  if (o.lump > 0.01) {
    const k = o.lump;
    c.beginPath();
    c.moveTo(-22 * k, -16); c.quadraticCurveTo(-26 * k, -44 * k, -6, -48 * k); c.quadraticCurveTo(10, -58 * k, 20 * k, -40 * k);
    c.quadraticCurveTo(30 * k, -20, 18 * k, -8); c.quadraticCurveTo(0, -2, -22 * k, -16); c.closePath();
    c.fillStyle = '#2A1E17'; c.fill();
    for (const [px, py, pr] of [[-8, -34, 6], [8, -40, 5], [12, -22, 4], [-12, -22, 4]]) ellipse(c, px * k, py * k, pr * k, pr * k * 0.8, '#4A372A');
  }
  c.restore();
}

// ---------------------------------------------------------------- small graphics (screen space)
// a sparkle star (both layers): x, y on screen, size, k 0..1 (pop)
function hnSparkle(x, y, size, k, rot = 0, col = '#FFF6D0') {
  if (k <= 0.01) return;
  const s = size * E.outBack(clamp(k), 2.2);
  const star = (c, sc) => {
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(s * sc, s * sc);
    c.beginPath();
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? 0.22 : 1; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    c.closePath(); c.fillStyle = col; c.fill(); c.restore();
  };
  paint(() => star(ctx, 1));
  star(gctx, 1.2);
}
// an age tag: a dark pill with a coloured rim, a small caption above (screen space, inside the key zone)
function hnTag(x, y, top, big, col, k, rot = 0) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.font = '900 58px Montserrat'; const w = ctx.measureText(big).width + 64;
  ctx.font = '800 30px Montserrat'; const w2 = ctx.measureText(top).width + 40;
  const ww = Math.max(w, w2);
  rrect(ctx, -ww / 2, -62, ww, 118, 30); ctx.fillStyle = 'rgba(10,8,24,0.9)'; ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = col; ctx.stroke();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#FFFFFF'; ctx.font = '800 30px Montserrat'; ctx.fillText(top, 0, -30);
  ctx.fillStyle = col; ctx.font = '900 58px Montserrat'; ctx.fillText(big, 0, 16);
  ctx.restore();
  // a black patch in the glow layer under it (bloom must not wash it out), then its rim's glow
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); gctx.translate(x, y); gctx.rotate(rot); gctx.scale(s, s);
  rrect(gctx, -ww / 2, -62, ww, 118, 30); gctx.fillStyle = '#000000'; gctx.fill();
  gctx.lineWidth = 12; gctx.strokeStyle = rgba(col, 0.45); gctx.stroke();
  gctx.restore();
}
