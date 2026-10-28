// The test and its world. THE TEST is the lilac chaser (Jeremy Hinton, 2005; Michael Bach's page): twelve blurry pink
// dots in a ring round a small black cross on plain grey, one dot off at a time, the gap stepping round clockwise. It
// is drawn AFTER the light and the lens (main.js post.overlay), so its grey and its pink are exactly these numbers on
// every frame, and nothing on it is green. Bach's stimulus in proportion: dot radius 0.18 of the ring's, a solid core
// to 0.3 of the dot, then a soft edge; 12 dots; one gap. Here a lap takes 12 steps of 4 frames (1.6 s).
// The world round it: grey morning fog; the hiker close under the ring, head and shoulders, his eyes up on the cross.
'use strict';

const GD = { CX: 540, CY: 722, R: 270, GREY: [196, 196, 196], DOT: [255, 0, 255], A: 0.58, CORE: 0.3, DOTR: 0.183 };
const GD_GREY = '#C4C4C4';
let GD_LAYER = null, GD_LX = null;
function gdInitLayer() {
  if (GD_LAYER) return;
  GD_LAYER = mkCanvas(W, H); GD_LX = GD_LAYER.getContext('2d');
}
// which dot is off on video frame f (the hook's clock); `fromEnd` runs the clock back from the end of the Short, so the
// last frame's gap is the one just before frame 1's and the loop goes round without a jump
function gdGap(f, fromEnd = false) {
  const st = cu().lc_step || 4, n = cu().lc_n || 12, N = Math.round(TLd.duration * FPS);
  const k = fromEnd ? Math.floor((f - N) / st) : Math.floor(f / st);
  return ((k % n) + n) % n;
}
// the dot's angle: dot 0 at the top, then clockwise
const gdAng = (i) => -Math.PI / 2 + (i / 12) * Math.PI * 2;
// the ring itself into context c: dots (all but `gap`; gap < 0 = none off) and the cross. o: {a: dot strength 0..1,
// mult: [12] per-dot strength, cross: 0..1, crossW}
function gdRing(c, cx, cy, R, gap, o = {}) {
  const r = R * GD.DOTR, [dr, dg, db] = GD.DOT, a0 = GD.A * (o.a === undefined ? 1 : o.a);
  for (let i = 0; i < 12; i++) {
    if (i === gap) continue;
    const a = a0 * (o.mult ? o.mult[i] : 1);
    if (a <= 0.002) continue;
    const x = cx + Math.cos(gdAng(i)) * R, y = cy + Math.sin(gdAng(i)) * R;
    const g = c.createRadialGradient(x, y, r * GD.CORE, x, y, r);
    g.addColorStop(0, `rgba(${dr},${dg},${db},${a})`); g.addColorStop(1, `rgba(${dr},${dg},${db},0)`);
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
  }
  const ck = o.cross === undefined ? 1 : o.cross;
  if (ck > 0.01) {
    const s = Math.max(9, R * 0.06) * ck, w = o.crossW || Math.max(3, R * 0.014);
    c.fillStyle = '#000000';
    c.fillRect(cx - s, cy - w / 2, 2 * s, w); c.fillRect(cx - w / 2, cy - s, w, 2 * s);
  }
}
// The test on screen (call it from post.overlay, after the lens). o: {f: video frame, fromEnd, k: 0 full .. 1 shrunk
// into the card, card: [cx, cy, R], fade: [y0, y1] where the full field melts into the scene below, show: 0..1}
function gdTest(o) {
  gdInitLayer();
  const k = clamp(o.k || 0), show = o.show === undefined ? 1 : clamp(o.show);
  if (show <= 0.001) return;
  const card = o.card || [540, 585, 120];
  const cx = lerp(GD.CX, card[0], E.inOutCubic(k)), cy = lerp(GD.CY, card[1], E.inOutCubic(k)), R = lerp(GD.R, card[2], E.inOutCubic(k));
  const x = GD_LX;
  x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; x.filter = 'none';
  x.clearRect(0, 0, W, H);
  // the field: the whole upper frame (full), shrinking to a rounded card round the ring
  const pad = R * 0.62, kk = E.inOutCubic(k);
  const fx0 = lerp(-40, cx - R - pad, kk), fx1 = lerp(W + 40, cx + R + pad, kk), fy0 = lerp(-40, cy - R - pad, kk);
  const fade = o.fade || [1104, 1228];
  const fy1 = lerp(fade[1] + 40, cy + R + pad, kk), rad = lerp(0, 44, kk);
  rrect(x, fx0, fy0, fx1 - fx0, fy1 - fy0, rad); x.fillStyle = GD_GREY; x.fill();
  gdRing(x, cx, cy, R, o.gap, { a: o.a, mult: o.mult });
  // the vignette the scene below already has, so the field meets it without a seam (full field only)
  if (k < 0.999 && typeof VIGNETTE !== 'undefined' && VIGNETTE) {
    x.globalCompositeOperation = 'source-atop'; x.globalAlpha = 1 - k; x.drawImage(VIGNETTE, 0, 0); x.globalAlpha = 1;
  }
  // the bottom edge melts into the fog round his head (full field only)
  if (k < 0.999) {
    x.globalCompositeOperation = 'destination-in';
    const g = x.createLinearGradient(0, fade[0], 0, fade[1]);
    g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, `rgba(0,0,0,${k})`);
    x.fillStyle = g; x.fillRect(0, 0, W, H);
  }
  x.globalCompositeOperation = 'source-over';
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = show;
  ctx.drawImage(GD_LAYER, 0, 0);
  // the card's frame (once shrunk): a dark bezel, like a phone
  if (k > 0.02) {
    ctx.globalAlpha = show * clamp(k * 1.6);
    rrect(ctx, fx0 - 10, fy0 - 10, fx1 - fx0 + 20, fy1 - fy0 + 20, rad + 10); ctx.lineWidth = 14; ctx.strokeStyle = '#141826'; ctx.stroke();
  }
  ctx.restore();
  return { cx, cy, R, box: [fx0, fy0, fx1, fy1] };
}

// ---------------------------------------------------------------- the fog
// plain grey (the test's own grey) with a little life low down, where his head is: lighter drifts, two far pines.
let GD_FOG = null;
function gdInitFog() {
  if (GD_FOG) return;
  GD_FOG = mkCanvas(W, H);
  const x = GD_FOG.getContext('2d');
  x.fillStyle = GD_GREY; x.fillRect(0, 0, W, H);
  // far pines in the fog, lower corners only (nothing near the ring)
  const pine = (px, py, h, col) => {
    x.fillStyle = col; x.beginPath(); x.moveTo(px, py - h);
    for (let i = 1; i <= 5; i++) { const u = i / 5, w = h * 0.32 * u; x.lineTo(px - w, py - h + h * u * 0.92); x.lineTo(px - w * 0.55, py - h + h * u * 0.92 - h * 0.05); }
    x.lineTo(px - 8, py); x.lineTo(px + 8, py);
    for (let i = 5; i >= 1; i--) { const u = i / 5, w = h * 0.32 * u; x.lineTo(px + w * 0.55, py - h + h * u * 0.92 - h * 0.05); x.lineTo(px + w, py - h + h * u * 0.92); }
    x.closePath(); x.fill();
  };
  pine(70, 1980, 760, '#B4B4B6'); pine(190, 2000, 620, '#BABABC');
  pine(1010, 1990, 720, '#B2B2B4'); pine(905, 2010, 560, '#B9B9BB');
  // the ground mist: a lighter band at the very bottom
  const g = x.createLinearGradient(0, 1500, 0, H);
  g.addColorStop(0, 'rgba(214,214,216,0)'); g.addColorStop(1, 'rgba(214,214,216,0.75)');
  x.fillStyle = g; x.fillRect(0, 1500, W, H - 1500);
}
function gdFogBack(t) {
  gdInitFog();
  screenSpace();
  ctx.drawImage(GD_FOG, 0, 0);
  // drifting wisps low down (slow; they never reach the ring)
  for (let i = 0; i < 5; i++) {
    const u = ((t * (0.018 + 0.006 * i) + i * 0.23) % 1.2) - 0.1, x = -260 + u * 1600, y = 1420 + 90 * i + 20 * Math.sin(t * 0.5 + i);
    ellipse(ctx, x, y, 300, 46, 'rgba(222,222,224,0.22)');
  }
}

// ---------------------------------------------------------------- the hiker under the test
// his outfit for the fog: the yellow coat, NAVY straps (nothing green on the screen while the test runs)
const GDPAL = Object.assign({}, PAL, { strap: '#2F3A78', strapSh: '#1E2654' });
const GDH = { X: 540, Y: 1462, S: 2.45 };          // where his head's centre sits (world = screen in these shots), his size
// his faces (lookY -1: up at the cross, 720 px above his eyes)
const GF = {
  stare: { eyeOpen: 1.18, pupil: 0.8, lookX: 0.0, lookY: -1.0, browY: 0.55, browTilt: 0.25, mouth: 'flat', mouthOpen: 0.25, blink: 0, cross: 0 },
  see: { eyeOpen: 1.32, pupil: 0.7, lookX: 0.0, lookY: -1.0, browY: 1.15, browTilt: 0.2, mouth: 'o', mouthOpen: 0.32, blink: 0, cross: 0 },
  sus: { eyeOpen: 0.82, pupil: 0.85, lookX: 0.0, lookY: -1.0, browY: -0.25, browTilt: -0.75, mouth: 'flat', mouthOpen: -0.2, blink: 0.18, cross: 0 },
  strain: { eyeOpen: 1.42, pupil: 0.62, lookX: 0.0, lookY: -1.0, browY: 1.25, browTilt: 1.05, mouth: 'grimace', mouthOpen: 1, blink: 0, cross: 0 },
  awe: { eyeOpen: 1.45, pupil: 0.55, lookX: 0.0, lookY: -1.0, browY: 1.55, browTilt: 0.3, mouth: 'o', mouthOpen: 0.85, blink: 0, cross: 0 },
  shut: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: -0.2, browY: -0.4, browTilt: -0.3, mouth: 'flat', mouthOpen: -0.1, blink: 1, cross: 0, squeeze: 1 },
  grin: { eyeOpen: 1.35, pupil: 0.75, lookX: 0.0, lookY: -0.55, browY: 1.2, browTilt: -0.1, mouth: 'grin', mouthOpen: 0.85, blink: 0, cross: 0 },
};
// his head-and-shoulders: A = {face, s, bob, headRot, headDX, headDY, veins 0..1 (red-rimmed eyes), tremble 0..1}
function gdHero(t, A) {
  // the stand pose's head centre is 470 rig units above his feet (rig(): hipY -222, head 248 above the hips)
  const s = A.s || GDH.S, hy0 = -rig(POSES.stand).head[1];
  const st = { x: GDH.X, y: GDH.Y + hy0 * s + (A.bob || 0), s, pose: POSES.stand, face: A.face,
    blink: 0, headDX: A.headDX || 0, headDY: A.headDY || 0, headRot: A.headRot || 0, noLegs: true, seed: 3 };
  const cam = { x: W / 2, y: H / 2, zoom: 1, rot: 0 };
  const r = charLayer(cam, st, t, {
    pal: GDPAL,
    post: (lc, rr, s2) => {
      // the red-rimmed eyes of a man who must not blink: thin veins in the whites, from the outer corners
      const v = clamp(A.veins || 0);
      if (v < 0.02 || (A.face.blink || 0) > 0.6) return;
      const [hx, hy] = rr.head;
      lc.save(); lc.translate(s2.x + (hx + (A.headDX || 0)) * s2.s, s2.y + (hy + (A.headDY || 0)) * s2.s); lc.rotate(rr.lean + (A.headRot || 0)); lc.scale(s2.s, s2.s);
      paint(() => {
        const ry = 16 * A.face.eyeOpen;
        for (const sd of [-1, 1]) {
          lc.save(); lc.beginPath(); lc.ellipse(sd * 24, -2, 14 * Math.min(1.15, 0.9 + A.face.eyeOpen * 0.1), ry, 0, 0, 7); lc.clip();
          lc.strokeStyle = `rgba(225,70,80,${0.6 * v})`; lc.lineWidth = 0.9; lc.lineCap = 'round';
          for (const k of [0, 2]) {                     // two veins from the outer corner, one from the inner
            const y0 = -2 + (k - 1) * ry * 0.38;
            lc.beginPath(); lc.moveTo(sd * 38, y0); lc.quadraticCurveTo(sd * 32, y0 + 2 - k, sd * 28, y0 + (k - 1) * 2.5); lc.stroke();
          }
          lc.beginPath(); lc.moveTo(sd * 10, 2); lc.quadraticCurveTo(sd * 14, 0, sd * 17, 3); lc.stroke();
          lc.restore();
        }
      });
      lc.restore();
    },
  });
  const [hx, hy] = r.head;
  return { head: [st.x + hx * st.s, st.y + hy * st.s], r, st };
}
