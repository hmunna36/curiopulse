// Can You Make a W With Your FINGERS? Short: the fingers' group chat, drawn in screen space.
//   fwAvatar(x, y, r, who, o)     a member's round avatar: a finger with a face ('I' 'M' 'R' 'L'), or the brain ('B')
//   fwChatCard(x, y, w, S, t)     the card: header FINGERS (4), the members row, messages, typing dots, SEEN BY
//   fwBubble(x, y, txt, k, o)     one message bubble (pops in with k)
// S = {k (the card pops in), members: 0..1, typing: 0..1, msg: 0..1, seenL, seenR (0..1), eyesR (the ring finger's
//      avatar goes wide-eyed), brainIn (BRAIN joins), out (the OUT word lights up)}
'use strict';

const FW_COL = { I: '#7FE9FF', M: '#FF9A3C', R: '#FFD447', L: '#4DFFB4', B: '#FF86A6' };
const FW_NAME = { I: 'POINTER', M: 'MIDDLE', R: 'RING', L: 'PINKY', B: 'BRAIN' };

function fwFingerIcon(c, r, mood, t, seed = 0) {
  // a finger standing up in the avatar, with a nail and a face
  const w = r * 0.62, h = r * 1.35;
  c.save(); c.translate(0, r * 0.32);
  rrect(c, -w / 2, -h * 0.82, w, h, w / 2); c.fillStyle = '#F2B892'; c.fill();
  c.lineWidth = Math.max(1.5, r * 0.05); c.strokeStyle = 'rgba(150,76,50,0.9)'; c.stroke();
  ellipse(c, 0, -h * 0.62, w * 0.3, w * 0.36, '#F9D6CC');
  // the face
  const wide = mood === 'wide', ey = -h * 0.36, ex = w * 0.2;
  for (const s of [-1, 1]) {
    ellipse(c, s * ex, ey, r * (wide ? 0.13 : 0.09), r * (wide ? 0.16 : 0.11), '#FFFFFF');
    circle(c, s * ex + (wide ? r * 0.03 : 0), ey + (wide ? 0 : r * 0.01), r * (wide ? 0.06 : 0.05), '#15132A');
  }
  c.beginPath();
  if (mood === 'wide') c.ellipse(0, -h * 0.17, r * 0.07, r * 0.08, 0, 0, 7), c.fillStyle = '#5A1522', c.fill();
  else { c.arc(0, -h * 0.22, r * 0.1, 0.15 * Math.PI, 0.85 * Math.PI); c.lineWidth = Math.max(1.2, r * 0.04); c.strokeStyle = '#5A1522'; c.stroke(); }
  c.restore();
}
function fwBrainIcon(c, r, t) {
  // a pink brain with a face
  c.save(); c.translate(0, r * 0.05);
  c.fillStyle = '#FF9DB9';
  for (const [x, y, rr] of [[-0.32, -0.12, 0.32], [0, -0.26, 0.34], [0.32, -0.12, 0.32], [-0.2, 0.14, 0.3], [0.2, 0.14, 0.3]]) { c.beginPath(); c.arc(x * r, y * r, rr * r, 0, 7); c.fill(); }
  c.lineWidth = Math.max(1.2, r * 0.045); c.strokeStyle = 'rgba(150,40,80,0.7)'; c.lineCap = 'round';
  c.beginPath(); c.moveTo(0, -0.5 * r); c.lineTo(0, 0.3 * r); c.stroke();
  c.beginPath(); c.arc(-0.3 * r, -0.12 * r, 0.14 * r, 0.3, 2.6); c.stroke();
  c.beginPath(); c.arc(0.3 * r, -0.12 * r, 0.14 * r, 0.5, 2.8); c.stroke();
  for (const s of [-1, 1]) { ellipse(c, s * 0.16 * r, 0.06 * r, 0.08 * r, 0.1 * r, '#FFFFFF'); circle(c, s * 0.16 * r + 0.02 * r, 0.07 * r, 0.045 * r, '#15132A'); }
  c.beginPath(); c.arc(0, 0.2 * r, 0.09 * r, 0.1 * Math.PI, 0.9 * Math.PI); c.stroke();
  c.restore();
}
function fwAvatar(x, y, r, who, o = {}) {
  const k = o.k === undefined ? 1 : o.k;
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2);
  const c = ctx;
  c.save(); c.translate(x, y); c.scale(s, s);
  circle(c, 0, 0, r + 4, '#0B0E1C');
  circle(c, 0, 0, r, FW_COL[who]);
  c.save(); c.beginPath(); c.arc(0, 0, r - 3, 0, 7); c.clip();
  circle(c, 0, 0, r - 3, mixH(FW_COL[who], '#1A1F38', 0.62));
  if (who === 'B') fwBrainIcon(c, r * 0.95, o.t || 0); else fwFingerIcon(c, r, o.mood, o.t || 0);
  c.restore();
  if (o.dot) { circle(c, r * 0.72, r * 0.72, r * 0.24, '#0B0E1C'); circle(c, r * 0.72, r * 0.72, r * 0.16, '#4DFFB4'); }
  if (o.ring) { c.beginPath(); c.arc(0, 0, r + 9, 0, 7); c.lineWidth = 5; c.strokeStyle = rgba(FW_COL[who], o.ring); c.stroke(); }
  c.restore();
}
// a message bubble with its tail on the left; parts = [[text, colour], ...] (one line)
function fwBubble(x, y, parts, k, o = {}) {
  if (k <= 0.01) return { w: 0, h: 0 };
  const s = E.outBack(clamp(k), 2.2), size = o.size || 40, c = ctx;
  c.save(); c.translate(x, y); c.scale(s, s);
  c.font = `900 ${size}px Montserrat`; c.textBaseline = 'middle';
  const widths = parts.map((p) => c.measureText(p[0]).width), tw = widths.reduce((a, b) => a + b, 0);
  const pad = size * 0.55, w = tw + pad * 2 + (o.arrow ? size * 1.1 : 0), h = size * 1.75;
  c.beginPath(); c.moveTo(0, h * 0.62); c.lineTo(-size * 0.42, h * 0.98); c.lineTo(size * 0.55, h * 0.84); c.closePath(); c.fillStyle = o.bg || '#2A3358'; c.fill();
  rrect(c, 0, 0, w, h, h * 0.42); c.fillStyle = o.bg || '#2A3358'; c.fill();
  let px = pad;
  for (let i = 0; i < parts.length; i++) { c.fillStyle = parts[i][1]; c.fillText(parts[i][0], px, h / 2 + 2); px += widths[i]; }
  if (o.arrow) {
    // a pointing arrow at the end (no emoji fonts in the renderer)
    const ax = px + size * 0.2, ay = h / 2;
    c.beginPath(); c.moveTo(ax, ay - size * 0.12); c.lineTo(ax + size * 0.5, ay - size * 0.12); c.lineTo(ax + size * 0.5, ay - size * 0.32); c.lineTo(ax + size * 0.85, ay);
    c.lineTo(ax + size * 0.5, ay + size * 0.32); c.lineTo(ax + size * 0.5, ay + size * 0.12); c.lineTo(ax, ay + size * 0.12); c.closePath(); c.fillStyle = o.arrowCol || '#4DFFB4'; c.fill();
  }
  c.restore();
  return { w: w * s, h: h * s };
}
function fwTyping(x, y, k, t) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2), c = ctx;
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.moveTo(0, 42); c.lineTo(-16, 62); c.lineTo(22, 52); c.closePath(); c.fillStyle = '#2A3358'; c.fill();
  rrect(c, 0, 0, 132, 70, 30); c.fillStyle = '#2A3358'; c.fill();
  for (let i = 0; i < 3; i++) { const b = 0.5 + 0.5 * Math.sin(t * 12 - i * 1.1); circle(c, 36 + i * 30, 35 - 6 * b, 9, `rgba(220,226,255,${0.45 + 0.5 * b})`); }
  c.restore();
}
// the whole card, wide and short (it sits across the top, above his hat and the fingertips). x, y = its top-left corner
function fwChatCard(x, y, w, S, t) {
  const k = clamp(S.k || 0);
  if (k <= 0.01) return null;
  const c = ctx, s = E.outBack(k, 1.6);
  const h1 = 120, h2 = S.msgArea === undefined ? 112 : S.msgArea, h = h1 + h2;
  screenSpace();
  c.save(); c.translate(x + w / 2, y); c.scale(s, s); c.translate(-w / 2, 0);
  rrect(c, -6, -6, w + 12, h + 12, 40); c.fillStyle = '#0A0D1A'; c.fill();
  rrect(c, 0, 0, w, h, 36); c.fillStyle = '#151A2E'; c.fill();
  paint(() => {
    // the group's avatar (an open hand), its name and the member count
    circle(c, 56, 60, 36, '#1CB3A4');
    c.save(); c.translate(56, 66); c.scale(0.84, 0.84);
    c.fillStyle = '#F2B892';
    rrect(c, -20, -10, 40, 34, 10); c.fill();
    for (const [dx, hh] of [[-15, 30], [-5, 38], [5, 40], [15, 34]]) { rrect(c, dx - 4.6, -10 - hh + 8, 9.2, hh, 4.6); c.fill(); }
    c.save(); c.translate(22, 4); c.rotate(0.7); rrect(c, -4.5, -20, 9, 22, 4.5); c.fill(); c.restore();
    c.restore();
    c.font = '900 40px Montserrat'; c.textBaseline = 'middle'; c.textAlign = 'left'; c.fillStyle = '#FFFFFF'; c.fillText('FINGERS', 106, 46);
    c.font = '700 22px Montserrat'; c.fillStyle = '#8FA0C8';
    c.fillText(S.brainIn > 0.5 ? '4 members + BRAIN' : '4 members', 108, 84);
  });
  // the members: four finger avatars with names, on the right of the header row
  const mk = clamp(S.members === undefined ? 1 : S.members);
  ['I', 'M', 'R', 'L'].forEach((m, i) => {
    const ax = w - 372 + i * 92, ay = 50;
    const kk = clamp((mk - i * 0.12) / 0.64);
    const lit = m === 'R' ? (S.eyesR || 0) : m === 'L' ? (S.out || 0) : 0;
    fwAvatar(ax, ay - 6 * lit, 34, m, { k: kk, dot: true, mood: lit > 0.5 ? 'wide' : null, t, ring: 0.9 * lit });
    paint(() => { c.font = '800 17px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = rgba(lit > 0.5 ? FW_COL[m] : '#C9D3F0', kk); c.fillText(FW_NAME[m], ax, ay + 50); c.textAlign = 'left'; });
  });
  // the message row: BRAIN types, then the message; on the right, who has SEEN it
  if (h2 > 0) {
    paint(() => line(c, 20, h1, w - 20, h1, 2, 'rgba(143,160,200,0.18)'));
    const my = h1;
    fwAvatar(56, my + 56, 32, 'B', { k: clamp((S.brainIn || 0) * 1.4), t });
    fwTyping(104, my + 18, (S.typing || 0) * (1 - clamp((S.msg || 0) * 3)), t);
    fwBubble(104, my + 14, [['@Pinky ', '#4DFFB4'], ['go ', '#FFFFFF'], ['OUT', S.out > 0.5 ? '#4DFFB4' : '#FFFFFF']], S.msg || 0, { size: 33, arrow: true, bg: '#2A3358' });
    const sk = Math.max(S.seenL || 0, S.seenR || 0);
    if (sk > 0.01) {
      paint(() => { c.font = '800 20px Montserrat'; c.textBaseline = 'middle'; c.textAlign = 'center'; c.fillStyle = rgba('#8FA0C8', clamp(sk * 2)); c.fillText('SEEN BY', w - 128, my + 24); c.textAlign = 'left'; });
      fwAvatar(w - 162, my + 68, 28, 'L', { k: S.seenL || 0, t });
      fwAvatar(w - 94, my + 68, 28, 'R', { k: S.seenR || 0, t, mood: 'wide', ring: 0.9 * clamp((S.seenR || 0) * 2 - 1) });
    }
  }
  c.restore();
  return { x, y, w, h: h * s };
}
