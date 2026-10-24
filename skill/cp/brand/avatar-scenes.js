'use strict';
// Channel avatar candidates: the hiker's face, built from the same rig as every Short. The avatar is the square y 560-1640.
const AV = { cx: 540, cy: 1100 };
const NATPAL = Object.assign({}, PAL, { coat: '#22B3C4', coatSh: '#147C92', coatHi: '#86E4EE', coatDk: '#0F5E74', strap: '#E7C27C', strapSh: '#B08A46' });
function bgRadial(c0, c1, c2) {
  screenSpace();
  const g = ctx.createRadialGradient(AV.cx, AV.cy - 60, 40, AV.cx, AV.cy, 760);
  g.addColorStop(0, c0); g.addColorStop(0.55, c1); g.addColorStop(1, c2);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function rays(col, a, n = 16) {
  screenSpace();
  ctx.save(); ctx.translate(AV.cx, AV.cy - 40);
  for (let i = 0; i < n; i++) { ctx.rotate(Math.PI * 2 / n); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(900, -70); ctx.lineTo(900, 70); ctx.closePath(); ctx.fillStyle = rgba(col, i % 2 ? a : a * 0.4); ctx.fill(); }
  ctx.restore();
}
function hat(c) {
  c.beginPath(); c.ellipse(0, -44, 108, 21, 0, 0, 7); c.fillStyle = '#CDB37A'; c.fill();
  c.beginPath(); c.ellipse(0, -50, 76, 64, 0, Math.PI, 0); c.closePath(); c.fillStyle = '#EAD6A2'; c.fill();
  paint(() => { rrect(c, -76, -60, 152, 13, 6); c.fillStyle = '#6E4A2A'; c.fill(); c.beginPath(); c.ellipse(-22, -86, 20, 9, -0.35, 0, 7); c.fillStyle = 'rgba(255,248,226,0.6)'; c.fill(); });
}
function qmark(x, y, s, col, rot) {
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.font = `400 ${s}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.lineWidth = s * 0.16; ctx.strokeStyle = '#0B0B1A'; ctx.strokeText('?', 0, 0); ctx.fillStyle = col; ctx.fillText('?', 0, 0);
  ctx.restore();
  softDot(gctx, x, y, s * 0.9, col, 0.6);
}
function hero(face, pal, o = {}) {
  const s = o.s || 3.3, st = { x: AV.cx + (o.dx || 0), y: AV.cy + 470 * s - 40 + (o.dy || 0), s, face, headRot: o.rot || 0 };
  const pose = JSON.parse(JSON.stringify(POSES.stand));
  charLayer(CAM0, Object.assign({}, st, { pose }), 0, { pal, post: (lc, r) => {
    if (!o.hat) return;
    lc.save(); lc.translate(st.x, st.y); lc.scale(st.s, st.s); lc.translate(r.head[0], r.head[1]); lc.rotate(o.rot || 0); hat(lc); lc.restore();
  } });
}
const WOW = { eyeOpen: 1.32, pupil: 0.62, lookX: 0, lookY: 0, browY: 1.45, browTilt: 0.3, mouth: 'o', mouthOpen: 0.62, blink: 0, cross: 0 };
const CURIOUS = { eyeOpen: 1.18, pupil: 0.9, lookX: 0.55, lookY: -0.5, browY: 1.2, browTilt: -0.35, mouth: 'o', mouthOpen: 0.25, blink: 0, cross: 0 };
SC.a = () => { bgRadial('#3FE0D0', '#0E9AAE', '#06455A'); rays('#FFFFFF', 0.07); hero(WOW, NATPAL, { hat: true, s: 4.1, dy: 150 }); qmark(838, 820, 170, '#FFD447', 0.22); return { glow: 0.8, noCaptions: true }; };
SC.b = () => { bgRadial('#FFC163', '#FF7A3C', '#B8361E'); rays('#FFF2C4', 0.1); hero(CURIOUS, PAL, { s: 4.3, dy: 90, rot: -0.08 }); qmark(838, 820, 170, '#FFFFFF', 0.2); return { glow: 0.8, noCaptions: true }; };
SC.c = () => { bgRadial('#2C5BD8', '#122A78', '#060B26'); screenSpace(); softDot(ctx, 300, 760, 380, '#FF9A3C', 0.45); softDot(ctx, 820, 1400, 420, '#3FA8FF', 0.4); hero(WOW, NATPAL, { hat: true, s: 4.1, dy: 150 }); qmark(838, 820, 170, '#FF9A3C', 0.22); return { glow: 0.8, noCaptions: true }; };
setLights({ a: LIGHTS.day, b: LIGHTS.day, c: LIGHTS.lanterns });
function initScenes2() {}
// the banner's hiker: the same face as the picture, no "?" (the banner draws its own), a plain background to feather away
SC.h = () => { bgRadial('#FFB257', '#FF8A3E', '#F06A32'); hero(CURIOUS, PAL, { s: 4.3, dy: 90, rot: -0.08 }); return { glow: 0.8, noCaptions: true }; };
