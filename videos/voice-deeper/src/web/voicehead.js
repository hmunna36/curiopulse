// His head from the front, see-through (voice-recording): the skull with his own eyes in the sockets, a jaw that
// talks, the voice box in the neck, an ear canal + eardrum + cochlea on each side, and the two routes his own voice
// takes to them: ROUTE 1 through the air (out of the mouth, round the cheeks, into the ear canals; cyan) and ROUTE 2
// through the skull (voice box -> neck -> jaw -> the bone round the inner ear; orange). Plus a hand-held microphone,
// rings that stay trapped inside the head, and a two-row scope (the thin fast air signal, the fat slow skull signal).
// Units: the rig's head units (the head is an ellipse 64 x 70 round its centre), so vhSkull() also fits on the rig.
// Loaded after phone.js, before scenes.js.
'use strict';

const VH = { mouth: [0, 41], larynx: [0, 118], ear: [69, 5], drum: [55, 8], coch: [45, 14], air: '#7FE9FF', bone: '#FF9A3C', cream: '#F7EBCD', creamSh: '#D6BE8E' };

function vhDense(P, n = 12) {
  const out = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    for (let j = 0; j < n; j++) {
      const u = j / n, u2 = u * u, u3 = u2 * u;
      out.push([0, 1].map((d) => 0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * u + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * u2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * u3)));
    }
  }
  out.push(P[P.length - 1]);
  return out;
}
const vhMirror = (P) => P.map((p) => [-p[0], p[1]]);
function vhMk(P) { const R = vhDense(P), L = vhMirror(R); return { R: { pts: R, acc: polyLen(R) }, L: { pts: L, acc: polyLen(L) } }; }
// route 1: out of the mouth, down past the chin, out and up round the cheek, into the ear canal
const VH_AIR = vhMk([[0, 43], [14, 68], [40, 86], [72, 84], [90, 58], [90, 28], [81, 11], [69, 6]]);
// route 2: voice box, up the neck, the angle of the jaw, up the jaw's branch, into the bone round the inner ear
const VH_BONE = vhMk([[0, 116], [0, 88], [14, 71], [34, 57], [46, 40], [48, 26], [45, 15]]);
// the short hop from the mouth into a microphone held at the chin
const VH_MICPOS = [30, 80];
const VH_TOMIC = (() => { const R = vhDense([[0, 43], [6, 58], [18, 70], [28, 78]]); return { pts: R, acc: polyLen(R) }; })();

// run fn(c, isGlow) under the head's transform on the main and the glow layer. o: {x, y, s, rot}
function vhBoth(o, fn) {
  for (const [c, k] of [[ctx, 1], [gctx, 0.5]]) {
    c.save(); c.setTransform(k, 0, 0, k, 0, 0); c.translate(o.x, o.y); if (o.rot) c.rotate(o.rot); c.scale(o.s, o.s);
    fn(c, c === gctx);
    c.restore();
  }
}
const vhPt = (o, p) => [o.x + p[0] * o.s, o.y + p[1] * o.s];          // head-local -> screen (no rotation)

function vhHairPath(c) {
  c.beginPath();
  c.moveTo(-66, 10); c.quadraticCurveTo(-74, -54, -30, -70); c.quadraticCurveTo(12, -88, 48, -64); c.quadraticCurveTo(76, -44, 66, 10);
  c.quadraticCurveTo(60, -22, 32, -36); c.quadraticCurveTo(2, -26, -20, -42); c.quadraticCurveTo(-52, -30, -66, 10); c.closePath();
}

// shoulders, neck and the top of the spine, as a see-through body
function vhBody(c) {
  const fill = 'rgba(46,88,196,0.26)', edge = 'rgba(127,233,255,0.55)';
  c.beginPath(); c.moveTo(-250, 330); c.quadraticCurveTo(-236, 150, -150, 126); c.quadraticCurveTo(-70, 108, -27, 96); c.lineTo(-25, 52); c.lineTo(25, 52); c.lineTo(27, 96);
  c.quadraticCurveTo(70, 108, 150, 126); c.quadraticCurveTo(236, 150, 250, 330); c.closePath();
  c.fillStyle = fill; c.fill(); c.lineWidth = 2.2; c.strokeStyle = edge; c.stroke();
  for (let i = 0; i < 6; i++) { const y = 62 + i * 19; rrect(c, -13, y, 26, 13, 5); c.fillStyle = 'rgba(247,235,205,0.34)'; c.fill(); }   // vertebrae, behind the voice box
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 24, 138); c.quadraticCurveTo(s * 90, 128, s * 168, 150); c.lineWidth = 9; c.lineCap = 'round'; c.strokeStyle = 'rgba(247,235,205,0.30)'; c.stroke(); }   // collarbones
}

// the head's skin as glass: outline, ears, the hair so it is still him
function vhSkin(c, glow, o = {}) {
  const edge = o.edge || 'rgba(127,233,255,0.9)';
  if (glow) { c.beginPath(); c.ellipse(0, 0, 64, 70, 0, 0, Math.PI * 2); c.lineWidth = 3; c.strokeStyle = rgba(o.edgeGlow || '#7FE9FF', 0.35 + 0.5 * (o.rim || 0)); c.stroke(); return; }
  for (const s of [-1, 1]) { c.beginPath(); c.ellipse(s * 64, 3, 13, 18, 0, 0, Math.PI * 2); c.fillStyle = 'rgba(46,88,196,0.34)'; c.fill(); c.lineWidth = 2.2; c.strokeStyle = edge; c.stroke(); }
  c.beginPath(); c.ellipse(0, 0, 64, 70, 0, 0, Math.PI * 2); c.fillStyle = 'rgba(40,78,186,0.34)'; c.fill();
  c.beginPath(); c.ellipse(0, 0, 64, 70, 0, 0, Math.PI * 2); c.lineWidth = 2.6; c.strokeStyle = edge; c.stroke();
}
// his hair, on top of everything (so it is still him)
function vhHair(c) {
  vhHairPath(c); c.fillStyle = 'rgba(42,27,20,0.96)'; c.fill();
  line(c, -26, -58, 6, -68, 5, 'rgba(90,64,48,0.9)');
}

// the skull, front view. o: {jd (jaw drop 0..8), look: [x, y] (-1..1), open (eye 0..1.3), vib (px of shimmer), a (alpha), t, hot 0..1 (it rings: warm tint)}
function vhSkull(c, o = {}) {
  const jd = o.jd || 0, a = o.a === undefined ? 0.94 : o.a, look = o.look || [0, 0], hot = o.hot || 0;
  c.save(); c.globalAlpha *= a;
  const vib = o.vib || 0;
  if (vib > 0.01) c.translate(vib * Math.sin((o.t || 0) * 88), vib * 0.5 * Math.cos((o.t || 0) * 71));
  const bone = c.createRadialGradient(-16, -30, 6, 0, 0, 84);
  const hk = 0.42 * clamp(hot);
  bone.addColorStop(0, hk > 0.01 ? mixHex('#FFFDF2', '#FFE7B0', hk) : '#FFFDF2'); bone.addColorStop(0.55, hk > 0.01 ? mixHex(VH.cream, '#FFC978', hk) : VH.cream); bone.addColorStop(1, hk > 0.01 ? mixHex(VH.creamSh, '#F29A3A', hk) : VH.creamSh);
  // the lower jaw first (it hangs behind the upper teeth), hinged up by the ears
  c.beginPath();
  c.moveTo(-50, 6); c.quadraticCurveTo(-52, 34 + jd, -34, 56 + jd); c.quadraticCurveTo(0, 70 + jd, 34, 56 + jd); c.quadraticCurveTo(52, 34 + jd, 50, 6);
  c.lineTo(38, 8); c.quadraticCurveTo(38, 36 + jd, 26, 44 + jd); c.quadraticCurveTo(0, 50 + jd, -26, 44 + jd); c.quadraticCurveTo(-38, 36 + jd, -38, 8); c.closePath();
  c.fillStyle = bone; c.fill(); c.lineWidth = 1.6; c.strokeStyle = 'rgba(120,90,40,0.55)'; c.stroke();
  for (let i = -3; i <= 3; i++) { rrect(c, i * 7.2 - 3.2, 39.5 + jd, 6.4, 7, 2); c.fillStyle = '#FFFFFF'; c.fill(); c.lineWidth = 0.8; c.strokeStyle = 'rgba(120,90,40,0.5)'; c.stroke(); }
  // cranium + cheekbones + upper jaw
  c.beginPath();
  c.moveTo(-55, -8); c.bezierCurveTo(-56, -52, -30, -66, 0, -66); c.bezierCurveTo(30, -66, 56, -52, 55, -8);
  c.quadraticCurveTo(54, 10, 44, 16); c.quadraticCurveTo(36, 20, 32, 30); c.lineTo(27, 37); c.lineTo(-27, 37); c.lineTo(-32, 30); c.quadraticCurveTo(-36, 20, -44, 16); c.quadraticCurveTo(-54, 10, -55, -8); c.closePath();
  c.fillStyle = bone; c.fill(); c.lineWidth = 1.8; c.strokeStyle = 'rgba(120,90,40,0.6)'; c.stroke();
  c.beginPath(); c.moveTo(-34, -52); c.quadraticCurveTo(-6, -64, 22, -56); c.lineWidth = 3; c.lineCap = 'round'; c.strokeStyle = 'rgba(255,255,255,0.55)'; c.stroke();   // a sheen on the dome
  for (let i = -3; i <= 3; i++) { rrect(c, i * 7.6 - 3.4, 30, 6.8, 8, 2); c.fillStyle = '#FFFFFF'; c.fill(); c.lineWidth = 0.8; c.strokeStyle = 'rgba(120,90,40,0.5)'; c.stroke(); }
  // nose hole
  c.beginPath(); c.moveTo(0, 8); c.quadraticCurveTo(-9, 20, -5, 25); c.quadraticCurveTo(0, 22, 5, 25); c.quadraticCurveTo(9, 20, 0, 8); c.closePath(); c.fillStyle = '#1A2456'; c.fill();
  // the sockets, with his eyes still in them
  const open = o.open === undefined ? 1 : o.open;
  for (const s of [-1, 1]) {
    c.beginPath(); c.ellipse(s * 23, -5, 16, 14.5, s * 0.12, 0, Math.PI * 2); c.fillStyle = '#16204E'; c.fill();
    c.save(); c.beginPath(); c.ellipse(s * 23, -5, 16, 14.5, s * 0.12, 0, Math.PI * 2); c.clip();
    c.beginPath(); c.ellipse(s * 23, -4.5, 13, 13 * Math.min(1.08, open), 0, 0, Math.PI * 2); c.fillStyle = '#FFFFFF'; c.fill();
    circle(c, s * 23 + look[0] * 5, -4.5 + look[1] * 4.6, 6, '#15132A'); circle(c, s * 23 + look[0] * 5 - 1.8, -4.5 + look[1] * 4.6 - 2.2, 2, '#FFFFFF');
    c.restore();
    // his eyebrows, floating where they always were
    const by = -27 - (o.browY || 0) * 6, bt = o.browTilt || 0;
    line(c, s * 11, by - bt * 6, s * 36, by + bt * 3, 6.5, 'rgba(42,27,20,0.95)');
  }
  c.restore();
}

// ear canal, eardrum, and the inner ear's little snail (in the bone, just inside the ear). o: {airHit, boneHit (0..1 flashes), t}
function vhEars(c, glow, o = {}) {
  for (const s of [-1, 1]) {
    const hitA = clamp(o.airHit || 0), hitB = clamp(o.boneHit || 0), cx = s * VH.coch[0], cy = VH.coch[1];
    if (glow) {
      if (hitA > 0.01) softDot(c, s * 60, 7, 13, VH.air, 0.5 * hitA);
      if (hitB > 0.01) softDot(c, cx, cy, 15, VH.bone, 0.5 * hitB);
      continue;
    }
    line(c, s * 72, 5, s * 57, 8, 8.5, '#0C1440'); line(c, s * 72, 5, s * 57, 8, 5, hitA > 0.01 ? mixHex('#22306E', VH.air, 0.6 * hitA) : '#22306E');   // the canal
    line(c, s * 55, 1, s * 55, 15, 3, '#FFD447');                                                          // the eardrum
    circle(c, cx, cy, 11.5, '#3A2E7A'); c.beginPath(); c.arc(cx, cy, 11.5, 0, Math.PI * 2); c.lineWidth = 1.2; c.strokeStyle = 'rgba(200,168,255,0.8)'; c.stroke();                                                                    // the pocket in the bone
    c.beginPath();
    for (let i = 0; i <= 40; i++) { const u = i / 40, a = u * Math.PI * 4.4 + (s > 0 ? Math.PI : 0), r = 8.6 * (1 - 0.8 * u); const px = cx + Math.cos(a) * r * s, py = cy + Math.sin(a) * r; if (i === 0) c.moveTo(px, py); else c.lineTo(px, py); }
    c.lineWidth = 3.1; c.lineCap = 'round'; c.strokeStyle = mixHex(mixHex('#E8D4FF', '#FFFFFF', 0.7 * hitA), VH.bone, 0.75 * hitB); c.stroke();
  }
}

// the voice box in the neck: a little shield with two folds that buzz when he talks
function vhLarynx(c, glow, t, talk) {
  const [x, y] = VH.larynx, buzz = talk * (0.5 + 0.5 * Math.sin(t * 150));
  if (glow) { softDot(c, x, y, 20, '#FFD447', 0.35 * talk * (0.6 + 0.4 * Math.sin(t * 60))); return; }
  rrect(c, -8, y + 12, 16, 60, 6); c.fillStyle = 'rgba(255,170,190,0.45)'; c.fill();                 // windpipe
  for (let i = 0; i < 4; i++) line(c, -7, y + 24 + i * 12, 7, y + 24 + i * 12, 2, 'rgba(255,255,255,0.35)');
  c.beginPath(); c.moveTo(-17, y - 16); c.quadraticCurveTo(0, y - 24, 17, y - 16); c.quadraticCurveTo(20, y + 6, 0, y + 18); c.quadraticCurveTo(-20, y + 6, -17, y - 16); c.closePath();
  c.fillStyle = '#FF86A6'; c.fill(); c.lineWidth = 1.8; c.strokeStyle = '#B8405E'; c.stroke();
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * (1.2 + 2.4 * buzz), y - 10); c.quadraticCurveTo(s * (5 + 3 * buzz), y, s * (1.2 + 2.4 * buzz), y + 9); c.lineWidth = 2.6; c.strokeStyle = '#FFF2C0'; c.stroke(); }
}

// one route, drawn along a dense polyline R = {pts, acc}: a soft tube, with marching dashes (air: thin, quick) or
// fat marching beads (bone: slow), and an arrowhead where it has got to.
// o: {col, w, k (draw-on 0..1), a, t, speed (units/s; 0 = still), kind: 'air' | 'bone', guide (alpha of the dashed plan)}
function vhRoute(c, glow, R, o) {
  const L = R.acc[R.acc.length - 1], k = clamp(o.k === undefined ? 1 : o.k), a = o.a === undefined ? 1 : o.a, w = o.w || 4;
  const trace = (upTo) => {
    c.beginPath();
    for (let i = 0; i < R.pts.length; i++) { if (R.acc[i] > upTo) { const p = polyAt(R.pts, R.acc, upTo); c.lineTo(p[0], p[1]); break; } if (i) c.lineTo(R.pts[i][0], R.pts[i][1]); else c.moveTo(R.pts[i][0], R.pts[i][1]); }
  };
  c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
  if (!glow && (o.guide || 0) > 0.01) { c.setLineDash([4, 6]); trace(L); c.lineWidth = w * 0.45; c.lineCap = 'butt'; c.strokeStyle = rgba(o.col, o.guide); c.stroke(); c.setLineDash([]); c.lineCap = 'round'; }
  if (k > 0.001 && a > 0.01) {
    trace(L * k);
    if (glow) { c.lineWidth = w * 1.9; c.strokeStyle = rgba(o.col, 0.26 * a); c.stroke(); }
    else {
      c.lineWidth = w; c.strokeStyle = rgba(o.col, 0.55 * a); c.stroke();
      if (o.speed) {
        if (o.kind === 'air') { c.setLineDash([w * 2.0, w * 3.2]); c.lineWidth = w * 0.72; c.strokeStyle = rgba('#FFFFFF', 0.95 * a); }
        else { c.setLineDash([0.01, w * 2.7]); c.lineWidth = w * 1.3; c.strokeStyle = rgba('#FFE9C4', 0.98 * a); }
        c.lineDashOffset = -o.t * o.speed; c.stroke(); c.setLineDash([]);
      }
      if (k < 0.995 || o.head) {                           // the arrowhead
        const p = polyAt(R.pts, R.acc, L * k), hw = w * (o.kind === 'air' ? 2.3 : 1.7);
        c.save(); c.translate(p[0], p[1]); c.rotate(p[2]); c.beginPath(); c.moveTo(hw * 1.5, 0); c.lineTo(-hw * 0.6, -hw); c.lineTo(-hw * 0.6, hw); c.closePath(); c.fillStyle = rgba(o.kind === 'air' ? '#E9FBFF' : '#FFD9A8', a); c.fill(); c.restore();
      }
    }
  }
  c.restore();
}

// rings that start in the middle of the head and never get out: clipped to the head. amp 0..1
function vhTrapped(c, glow, t, amp, o = {}) {
  if (amp <= 0.01) return;
  c.save(); c.beginPath(); c.ellipse(0, 0, 63, 69, 0, 0, Math.PI * 2); c.clip();
  const n = o.n || 4, cy = o.cy === undefined ? 14 : o.cy;
  for (let i = 0; i < n; i++) {
    const p = ((t * (o.speed || 1.25) + i / n) % 1), r = 8 + 78 * p, al = amp * (1 - p) * 0.95;
    c.beginPath(); c.arc(0, cy, r, 0, Math.PI * 2); c.lineWidth = (glow ? 6 : 3.4) * (1 - 0.4 * p); c.strokeStyle = rgba(o.col || VH.bone, glow ? al * 0.3 : al * 0.85); c.stroke();
  }
  c.restore();
}

// the whole head. o: {x, y, s, t, talk 0..1, jd, look, open, skullA, vib, hot,
//   air: {k, a, guide, flow}, bone: {k, a, guide, flow}, airHit, boneHit, rim, trapped 0..1, mic 0..1 (a microphone at his chin), micIn 0..1,
//   noBody, micSway}
function vhHead(o) {
  const t = o.t, talk = o.talk || 0, air = o.air || {}, bone = o.bone || {};
  const jd = o.jd === undefined ? 5.5 * talk * (0.35 + 0.65 * Math.abs(Math.sin(t * 13.5))) : o.jd;
  vhBoth(o, (c, glow) => {
    if (!glow && !o.noBody) vhBody(c);
    vhLarynx(c, glow, t, talk);
    vhSkin(c, glow, { rim: o.rim || 0, edgeGlow: o.edgeGlow });
    if (!glow) vhSkull(c, { jd, look: o.look, open: o.open, a: o.skullA, vib: o.vib, t, hot: o.hot, browY: o.browY, browTilt: o.browTilt });
    vhEars(c, glow, { airHit: o.airHit, boneHit: o.boneHit, t });
    if ((o.trapped || 0) > 0.01) vhTrapped(c, glow, t, o.trapped);
    if (!glow) vhHair(c);
    // route 2 inside, then route 1 outside
    for (const sd of ['L', 'R']) vhRoute(c, glow, VH_BONE[sd], { col: VH.bone, w: 5, k: bone.k, a: bone.a, guide: bone.guide, t, speed: bone.flow ? 34 : 0, kind: 'bone' });
    for (const sd of ['L', 'R']) vhRoute(c, glow, VH_AIR[sd], { col: VH.air, w: 2.9, k: air.k, a: air.a, guide: air.guide, t, speed: air.flow ? 78 : 0, kind: 'air' });
    // the mouth breathes little wavefronts when he talks
    if (talk > 0.05 && !glow && (o.mouthWaves === undefined || o.mouthWaves)) for (let i = 0; i < 3; i++) { const p = ((t * 2.6 + i / 3) % 1); c.beginPath(); c.arc(VH.mouth[0], VH.mouth[1] + 6, 9 + 15 * p, 0.3, Math.PI - 0.3); c.lineWidth = 1.7; c.strokeStyle = rgba(VH.air, 0.6 * talk * (1 - p)); c.stroke(); }
    if ((o.mic || 0) > 0.01) vhMic(c, glow, o.mic, t, o.micIn || 0);
  });
}

// a hand-held microphone that slides up to his chin from the lower right. k = 0..1 in, lit 0..1 = it hears the air route
function vhMic(c, glow, k, t, lit = 0) {
  const e = E.outBack(clamp(k), 1.4), mx = VH_MICPOS[0] + 120 * (1 - e), my = VH_MICPOS[1] + 150 * (1 - e), ang = -0.62;
  c.save(); c.translate(mx, my); c.rotate(ang);
  if (glow) { softDot(c, 0, 0, 22, VH.air, 0.35 * lit); c.restore(); return; }
  // the hop from the mouth into it
  rrect(c, -8.5, 12, 17, 64, 7); const hg = c.createLinearGradient(-8.5, 0, 8.5, 0); hg.addColorStop(0, '#5A6288'); hg.addColorStop(0.5, '#2A2F4A'); hg.addColorStop(1, '#171A2C'); c.fillStyle = hg; c.fill();
  rrect(c, -10, 12, 20, 10, 4); c.fillStyle = '#FF5A6E'; c.fill();
  rrect(c, -3.5, 36, 7, 14, 3); c.fillStyle = lit > 0.3 ? '#4DFFB4' : '#8A93B8'; c.fill();
  const g = c.createRadialGradient(-6, -8, 2, 0, 0, 20); g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.5, '#C9D1E6'); g.addColorStop(1, '#6C7699');
  circle(c, 0, 0, 18.5, '#3A4060'); c.beginPath(); c.arc(0, 0, 17, 0, Math.PI * 2); c.fillStyle = g; c.fill();
  c.save(); c.beginPath(); c.arc(0, 0, 17, 0, Math.PI * 2); c.clip();
  for (let i = -3; i <= 3; i++) { line(c, i * 6 - 20, -20, i * 6 + 20, 20, 1.1, 'rgba(40,46,80,0.55)'); line(c, i * 6 + 20, -20, i * 6 - 20, 20, 1.1, 'rgba(40,46,80,0.55)'); }
  c.restore();
  c.beginPath(); c.arc(0, 0, 17, 0, Math.PI * 2); c.lineWidth = 1.6; c.strokeStyle = lit > 0.05 ? mixHex('#2A2F4A', VH.air, clamp(lit)) : '#2A2F4A'; c.stroke();
  c.restore();
}

// the scope: two signals side by side (screen space). x, y = top-left; o: {k (pop-in), deep 0..1 (the skull row swells), t, rowA, rowB (0..1 each row on)}
function vhScope(x, y, w, h, o) {
  const k = o.k === undefined ? 1 : o.k;
  if (k <= 0.01) return;
  const c = ctx, s = E.outBack(clamp(k), 1.5), t = o.t, deep = o.deep || 0;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.translate(x + w / 2, y + h / 2); c.scale(s, s); c.translate(-w / 2, -h / 2);
  rrect(c, 0, 0, w, h, 26); c.fillStyle = 'rgba(8,12,34,0.9)'; c.fill(); c.lineWidth = 4; c.strokeStyle = 'rgba(127,233,255,0.5)'; c.stroke();
  const rows = [['AIR', VH.air, o.rowA === undefined ? 1 : o.rowA], ['SKULL', VH.bone, o.rowB === undefined ? 1 : o.rowB]];
  rows.forEach(([name, col, on], i) => {
    const cy = h * (i === 0 ? 0.27 : 0.70), x0 = 190, x1 = w - 28;
    c.globalAlpha = 0.35 + 0.65 * on;
    c.font = '900 40px Montserrat'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = col; c.fillText(name, 28, cy + 2);
    line(c, x0, cy, x1, cy, 2, 'rgba(255,255,255,0.14)');
    c.beginPath();
    for (let px = x0; px <= x1; px += 3) {
      const u = (px - x0) / (x1 - x0), env = Math.sin(Math.PI * u) ** 0.6 * on;
      const yy = i === 0
        ? cy + env * 15 * Math.sin(u * 64 - t * 26) * (0.7 + 0.3 * Math.sin(u * 9 + t * 5))                    // thin, fast
        : cy + env * (24 + 26 * deep) * Math.sin(u * (17 - 5 * deep) - t * 9);                                     // fat, slow
      if (px === x0) c.moveTo(px, yy); else c.lineTo(px, yy);
    }
    c.lineWidth = i === 0 ? 4 : 9 + 5 * deep; c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = col; c.stroke();
    c.globalAlpha = 1;
  });
  c.restore();
  // the traces glow
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0);
  softDot(gctx, x + w * 0.62, y + h * 0.27, w * 0.34, VH.air, 0.16 * clamp(k)); softDot(gctx, x + w * 0.62, y + h * 0.70, w * 0.38, VH.bone, (0.2 + 0.25 * deep) * clamp(k));
  gctx.restore();
}
