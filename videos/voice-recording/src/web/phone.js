// The phone (voice-recording): seen from his own eyes (a voice message on its screen, his thumb on PLAY), and from
// the front (its back, in his hand), the stranger's voice coming out of it (jagged rings, a scribble bubble), and
// the phone-light on his face. Loaded after room.js, before scenes.js.
'use strict';

const PHN = { w: 600, h: 1140, r: 80, btn: [-160, -30], avatar: [-170, -262] };
const PHN_BARS = [...Array(22)].map((_, i) => 0.25 + 0.75 * Math.abs(Math.sin(i * 1.7 + 0.6) * Math.cos(i * 0.63 + 1.1)));

// the hero's face in a round avatar (under the current transform). The rig is ~560 tall; head + shoulders fill the disc.
function avatarFace(c, x, y, R, face, t, ring = '#7FE9FF', bg = '#27408A') {
  c.save();
  c.beginPath(); c.arc(x, y, R, 0, Math.PI * 2); c.closePath();
  const g = c.createLinearGradient(0, y - R, 0, y + R); g.addColorStop(0, bg); g.addColorStop(1, '#131C4A');
  c.fillStyle = g; c.fill();
  c.save(); c.clip();
  const s = R / 104;
  drawCharacter(c, { x, y: y + 470 * s + R * 0.16, s, pose: POSES.stand, face, noLegs: true, seed: 4 }, t, HOMEPAL);
  c.restore();
  c.beginPath(); c.arc(x, y, R, 0, Math.PI * 2); c.lineWidth = Math.max(3, R * 0.07); c.strokeStyle = ring; c.stroke();
  c.restore();
}

// the phone from his own eyes (screen space). cam: {x, y, s, rot} = where the phone's centre sits and its scale.
// o: {prog 0..1 (playhead), playing, press 0..1 (the PLAY button dips), amp 0..1 (how loud the phone is right now),
//     ident 0..1 (the sender's name lights up), face, thumb 0..1 (1 = on the button), glowK}
function povPhone(t, cam, o = {}) {
  const c = ctx, s = cam.s, prog = clamp(o.prog || 0), amp = o.amp || 0, press = o.press || 0;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.translate(cam.x, cam.y); c.rotate(cam.rot || 0); c.scale(s, s);
  // the body and the screen
  rrect(c, -PHN.w / 2 - 6, -PHN.h / 2 - 4, PHN.w + 12, PHN.h + 20, PHN.r + 6); c.fillStyle = 'rgba(0,0,10,0.45)'; c.fill();
  rrect(c, -PHN.w / 2, -PHN.h / 2, PHN.w, PHN.h, PHN.r); c.fillStyle = '#10121C'; c.fill();
  c.lineWidth = 5; c.strokeStyle = '#3A4060'; c.stroke();
  const sg = c.createLinearGradient(0, -PHN.h / 2, 0, PHN.h / 2); sg.addColorStop(0, '#16205A'); sg.addColorStop(0.5, '#101844'); sg.addColorStop(1, '#0A1030');
  rrect(c, -PHN.w / 2 + 20, -PHN.h / 2 + 20, PHN.w - 40, PHN.h - 40, PHN.r - 18); c.fillStyle = sg; c.fill();
  c.save(); rrect(c, -PHN.w / 2 + 20, -PHN.h / 2 + 20, PHN.w - 40, PHN.h - 40, PHN.r - 18); c.clip();
  // status row + header
  c.textBaseline = 'middle'; c.textAlign = 'left'; c.font = '800 28px Montserrat'; c.fillStyle = 'rgba(190,205,255,0.7)'; c.fillText('23:47', -232, -506);
  rrect(c, 178, -518, 54, 24, 7); c.lineWidth = 3; c.strokeStyle = 'rgba(190,205,255,0.7)'; c.stroke(); rrect(c, 183, -513, 30, 14, 3); c.fillStyle = 'rgba(190,205,255,0.7)'; c.fill();
  rrect(c, -60, -528, 120, 30, 15); c.fillStyle = '#05060F'; c.fill();
  c.fillStyle = 'rgba(255,255,255,0.05)'; c.fillRect(-300, -470, 600, 96);
  c.textAlign = 'center'; c.font = '800 34px Montserrat'; c.fillStyle = 'rgba(200,214,255,0.9)'; c.fillText('VOICE MESSAGE', 0, -420);
  // older messages, faint
  for (const [x, y, w] of [[-250, 170, 330], [-80, 270, 330], [-250, 370, 240]]) { rrect(c, x, y, w, 70, 34); c.fillStyle = 'rgba(160,180,255,0.09)'; c.fill(); }
  // the sender: his own face, his own name
  const idk = clamp(o.ident || 0);
  avatarFace(c, PHN.avatar[0], PHN.avatar[1], 84, o.face || FACES.grin, t, idk > 0.01 ? mixHex('#7FE9FF', '#FFD447', idk) : '#7FE9FF');
  c.textAlign = 'left'; c.font = '900 74px Montserrat'; c.fillStyle = idk > 0.01 ? mixHex('#FFFFFF', '#FFD447', idk) : '#FFFFFF';
  c.save(); c.translate(-60, -282); c.scale(1 + 0.16 * idk, 1 + 0.16 * idk); c.fillText('YOU', 0, 0); c.restore();
  c.font = '700 30px Montserrat'; c.fillStyle = 'rgba(170,190,255,0.75)'; c.fillText('just now', -58, -224);
  // the message bubble: PLAY, the waveform, the length
  const bg2 = c.createLinearGradient(0, -130, 0, 70); bg2.addColorStop(0, '#3550D8'); bg2.addColorStop(1, '#2337A6');
  rrect(c, -256, -134, 512, 208, 64); c.fillStyle = bg2; c.fill();
  c.beginPath(); c.moveTo(-250, 20); c.quadraticCurveTo(-270, 80, -290, 86); c.quadraticCurveTo(-240, 90, -214, 62); c.closePath(); c.fill();
  const [bx, by] = PHN.btn, br = 66 * (1 - 0.14 * press);
  circle(c, bx, by, br + 8, 'rgba(255,255,255,0.18)'); circle(c, bx, by, br, o.playing ? '#4DFFB4' : '#7FE9FF');
  c.fillStyle = '#0B1030';
  if (o.playing) { rrect(c, bx - 26, by - 30, 18, 60, 5); c.fill(); rrect(c, bx + 8, by - 30, 18, 60, 5); c.fill(); }
  else { c.beginPath(); c.moveTo(bx - 20, by - 34); c.lineTo(bx + 34, by); c.lineTo(bx - 20, by + 34); c.closePath(); c.fill(); }
  for (let i = 0; i < PHN_BARS.length; i++) {
    const x = -66 + i * 13.4, u = i / (PHN_BARS.length - 1), near = Math.exp(-(((u - prog) / 0.09) ** 2));
    const h = 12 + 96 * PHN_BARS[i] * (1 + 0.55 * amp * near * (0.6 + 0.4 * Math.sin(t * 46 + i * 2.3)));
    rrect(c, x - 4, by - h / 2, 8, h, 4); c.fillStyle = u <= prog ? '#FFFFFF' : 'rgba(255,255,255,0.36)'; c.fill();
  }
  if (o.playing) circle(c, -66 + prog * 13.4 * (PHN_BARS.length - 1), by, 12, '#4DFFB4');
  c.textAlign = 'right'; c.font = '700 26px Montserrat'; c.fillStyle = 'rgba(255,255,255,0.75)'; c.fillText(`0:0${Math.min(7, Math.floor(prog * 7.4))} / 0:07`, 226, 50);
  c.restore();
  // the ripple from the tap
  if (press > 0.02) { c.beginPath(); c.arc(PHN.btn[0], PHN.btn[1], 66 + 150 * (1 - press), 0, Math.PI * 2); c.lineWidth = 10 * press; c.strokeStyle = `rgba(160,255,220,${0.9 * press})`; c.stroke(); }
  // his thumb, from the lower right
  const th = clamp(o.thumb === undefined ? 0 : o.thumb);
  const tip = [lerp(330, PHN.btn[0] + 14, E.outCubic(th)), lerp(330, PHN.btn[1] + 22, E.outCubic(th))], base = [470, 820];
  c.lineCap = 'round';
  c.lineWidth = 150; c.strokeStyle = PAL.skinSh; c.beginPath(); c.moveTo(base[0], base[1]); c.lineTo(tip[0], tip[1]); c.stroke();
  c.lineWidth = 132; c.strokeStyle = PAL.skin; c.beginPath(); c.moveTo(base[0] - 6, base[1] - 4); c.lineTo(tip[0] - 4, tip[1] - 4); c.stroke();
  const ta = Math.atan2(tip[1] - base[1], tip[0] - base[0]);
  c.save(); c.translate(tip[0], tip[1]); c.rotate(ta); ellipse(c, 16, -6, 42, 34, 'rgba(255,236,224,0.55)'); c.restore();
  c.restore();
  // the screen glows (bloom layer)
  const gk = o.glowK === undefined ? 1 : o.glowK;
  const gp = [cam.x + PHN.btn[0] * s, cam.y + PHN.btn[1] * s];
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0);
  softDot(gctx, cam.x, cam.y - 40 * s, 520 * s, '#3550D8', 0.32 * gk);
  softDot(gctx, gp[0], gp[1], 150 * s, o.playing ? '#4DFFB4' : '#7FE9FF', (0.5 + 0.4 * press) * gk);
  gctx.restore();
}

// the phone in his hand, from the front: we see its back (rig space; call inside charLayer's post after translate/scale).
// (px, py) = its centre, rot = tilt. The screen faces him: a cold rim of light on the edge that points at his face.
function heldPhone(c, px, py, rot, t, o = {}) {
  const w = 62, h = 122;
  c.save(); c.translate(px, py); c.rotate(rot);
  rrect(c, -w / 2 - 3, -h / 2 - 3, w + 6, h + 6, 15); c.fillStyle = `rgba(150,200,255,${0.55 + 0.25 * (o.amp || 0)})`; c.fill();   // light spilling round the edge
  const g = c.createLinearGradient(-w / 2, 0, w / 2, 0); g.addColorStop(0, '#2B3048'); g.addColorStop(1, '#161927');
  rrect(c, -w / 2, -h / 2, w, h, 13); c.fillStyle = g; c.fill();
  rrect(c, -w / 2 + 7, -h / 2 + 7, 26, 30, 8); c.fillStyle = '#0C0E18'; c.fill();
  circle(c, -w / 2 + 15, -h / 2 + 16, 5, '#2E3A66'); circle(c, -w / 2 + 25, -h / 2 + 28, 5, '#2E3A66'); circle(c, -w / 2 + 15, -h / 2 + 16, 2, '#7FA0FF');
  circle(c, 0, 8, 7, 'rgba(255,255,255,0.10)');
  c.restore();
}
// fingers wrapped round the phone's back (rig space, on top of it)
function phoneFingers(c, px, py, rot, pal, side = 1) {
  c.save(); c.translate(px, py); c.rotate(rot);
  for (let i = 0; i < 4; i++) {
    const y = -8 + i * 17;
    line(c, side * 36, y + 3, side * 6, y, 15, pal.skinSh); line(c, side * 36, y + 2, side * 8, y - 1, 11, pal.skin);
  }
  c.restore();
}

// the stranger's voice: jagged rings from (x, y) in the current space. amp 0..1, seed. Squeaky = thin, spiky, fast.
function squeakRings(x, y, t, amp, o = {}) {
  if (amp <= 0.01) return;
  const col = o.col || '#BFF0FF', n = o.n || 4, R = o.R || 300, a0 = o.a0 === undefined ? 0 : o.a0, a1 = o.a1 === undefined ? Math.PI * 2 : o.a1;
  for (let i = 0; i < n; i++) {
    const p = ((t * (o.speed || 2.3) + i / n) % 1), r = 40 + R * p, al = amp * Math.sin(Math.PI * p) * 0.9;
    if (al <= 0.01) continue;
    for (const [cc, w, a] of [[ctx, 5, al], [gctx, 11, al * 0.6]]) {
      cc.beginPath();
      const steps = 46;
      for (let k = 0; k <= steps; k++) {
        const ang = a0 + (a1 - a0) * k / steps, jag = 1 + 0.085 * (k % 2 ? 1 : -1) * (0.6 + 0.4 * Math.sin(t * 31 + i * 3 + k));
        const px = x + Math.cos(ang) * r * jag, py = y + Math.sin(ang) * r * jag;
        if (k === 0) cc.moveTo(px, py); else cc.lineTo(px, py);
      }
      cc.lineWidth = w; cc.lineJoin = 'miter'; cc.strokeStyle = rgba(col, a); cc.stroke();
    }
  }
}

// a jagged speech bubble with scribble for words (screen space): somebody squeaky is talking, and it isn't English
function scribbleBubble(x, y, w, h, k, t, o = {}) {
  if (k <= 0.01) return;
  const c = ctx, s = E.outBack(clamp(k), 2.2), col = o.col || '#FFFFFF', ink = o.ink || '#1A1C2C';
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.translate(x, y); c.rotate((o.rot || 0) + 0.03 * Math.sin(t * 23)); c.scale(s, s);
  c.beginPath();
  const n = 22;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, rr = (i % 2 ? 1.0 : 0.84) + 0.04 * Math.sin(t * 40 + i * 5);
    const px = Math.cos(a) * w / 2 * rr, py = Math.sin(a) * h / 2 * rr;
    if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
  }
  c.closePath(); c.fillStyle = col; c.fill(); c.lineWidth = 7; c.lineJoin = 'round'; c.strokeStyle = ink; c.stroke();
  if (o.tail) { c.beginPath(); c.moveTo(o.tail[0] * 0.25, o.tail[1] * 0.25 - 14); c.lineTo(o.tail[0], o.tail[1]); c.lineTo(o.tail[0] * 0.25 + 26, o.tail[1] * 0.25 + 6); c.closePath(); c.fillStyle = col; c.fill(); c.stroke(); c.beginPath(); c.ellipse(o.tail[0] * 0.2 + 8, o.tail[1] * 0.2 - 4, 30, 22, 0, 0, 7); c.fillStyle = col; c.fill(); }
  // the "words": zigzag scribble, rewritten a few times a second
  const fr = Math.floor(t * 9);
  for (let r = 0; r < (o.rows || 2); r++) {
    const rows = o.rows || 2, yy = (r - (rows - 1) / 2) * h * 0.26, ww = w * (0.56 - 0.1 * ((r + fr) % 2));
    c.beginPath();
    const m = 9;
    for (let i = 0; i <= m; i++) { const px = -ww / 2 + ww * i / m, py = yy + (i % 2 ? -1 : 1) * h * 0.07 * (0.6 + 0.8 * hash(i + r * 9 + fr * 3)); if (i === 0) c.moveTo(px, py); else c.lineTo(px, py); }
    c.lineWidth = 8; c.lineCap = 'round'; c.strokeStyle = o.inkCol || '#2B3FA0'; c.stroke();
  }
  c.restore();
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); softDot(gctx, x, y, w * 0.6, '#BFF0FF', 0.22 * clamp(k)); gctx.restore();
}

// the phone's light on him and the room (screen space; call last): cold, from where the phone is
function phoneLight(x, y, amt = 1, R = 620) {
  screenSpace();
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(x, y, 20, x, y, R);
  g.addColorStop(0, `rgba(120,160,255,${clamp(0.20 * amt)})`); g.addColorStop(0.5, `rgba(80,110,230,${clamp(0.08 * amt)})`); g.addColorStop(1, 'rgba(40,60,160,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.restore();
  softDot(gctx, x, y, R * 0.55, '#6F96FF', clamp(0.18 * amt));
}
