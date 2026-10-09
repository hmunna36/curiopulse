// Inside his head: the brain keeps time with a tape measure whose marks are photos. One photo per new thing.
// The brain (a pink character with arms, an instant camera, a sleep mask, a crash helmet), the TIME case, the tape (a
// ribbon along any path, with photos riding on it), the photos and their little pictures, the brain's round window
// for the corner of other scenes, and the room it lives in.
'use strict';

const TAPE = { col: '#FFD447', dk: '#B8860B', tick: '#3A2A10', w: 56, step: 96 };
const PHOTO_BG = { cake: '#4A2F7A', bike: '#8FD8FF', frog: '#C4F4A8', kite: '#9AD6FF', cone: '#FFE3BC', wasp: '#FFF3B0', fish: '#A6ECE4', tent: '#FFCFA6',
  star: '#33307A', ball: '#C6F2FF', desk: '#B4BACB', fall: '#22306A', net: '#22306A' };
const KID_PHOTOS = ['bike', 'frog', 'kite', 'cone', 'wasp', 'fish', 'tent', 'ball', 'star', 'cake'];

// ---------------------------------------------------------------- the little pictures (round (0, 0), about 56 units across)
function tfIcon(c, kind, s = 1) {
  c.save(); c.scale(s, s); c.lineCap = 'round'; c.lineJoin = 'round';
  if (kind === 'cake') {
    rrect(c, -22, -2, 44, 24, 5); c.fillStyle = '#FF8FB5'; c.fill(); rrect(c, -22, -6, 44, 10, 5); c.fillStyle = '#FFE3EE'; c.fill();
    line(c, 0, -8, 0, -20, 4, '#3FA7FF'); ellipse(c, 0, -25, 4, 6, '#FFD447');
  } else if (kind === 'bike') {
    c.lineWidth = 5; c.strokeStyle = '#2A2140';
    for (const x of [-15, 15]) { c.beginPath(); c.arc(x, 10, 11, 0, 7); c.stroke(); }
    c.strokeStyle = '#FF5A6E'; c.beginPath(); c.moveTo(-15, 10); c.lineTo(-3, -8); c.lineTo(12, -8); c.lineTo(15, 10); c.moveTo(-3, -8); c.lineTo(2, 10); c.moveTo(12, -8); c.lineTo(9, -17); c.lineTo(17, -17); c.moveTo(-8, -12); c.lineTo(2, -12); c.stroke();
  } else if (kind === 'frog') {
    ellipse(c, 0, 6, 22, 15, '#3DBE5A'); circle(c, -11, -10, 8, '#3DBE5A'); circle(c, 11, -10, 8, '#3DBE5A');
    circle(c, -11, -11, 4.6, '#FFFFFF'); circle(c, 11, -11, 4.6, '#FFFFFF'); circle(c, -11, -11, 2.2, '#15132A'); circle(c, 11, -11, 2.2, '#15132A');
    c.beginPath(); c.moveTo(-10, 7); c.quadraticCurveTo(0, 15, 10, 7); c.lineWidth = 3; c.strokeStyle = '#1C6B30'; c.stroke();
  } else if (kind === 'kite') {
    c.beginPath(); c.moveTo(4, -24); c.lineTo(20, -6); c.lineTo(2, 12); c.lineTo(-12, -8); c.closePath(); c.fillStyle = '#FF5A6E'; c.fill();
    c.beginPath(); c.moveTo(4, -24); c.lineTo(2, 12); c.lineTo(-12, -8); c.closePath(); c.fillStyle = '#FFD447'; c.fill();
    c.beginPath(); c.moveTo(2, 12); c.quadraticCurveTo(-8, 18, -4, 24); c.quadraticCurveTo(0, 28, -12, 26); c.lineWidth = 3; c.strokeStyle = '#FFFFFF'; c.stroke();
  } else if (kind === 'cone') {
    c.beginPath(); c.moveTo(-12, -2); c.lineTo(12, -2); c.lineTo(0, 26); c.closePath(); c.fillStyle = '#D9A066'; c.fill();
    circle(c, 0, -10, 14, '#FF8FB5'); circle(c, -4, -14, 4, '#FFD6E4');
  } else if (kind === 'wasp') {
    ellipse(c, -9, -12, 9, 6, 'rgba(255,255,255,0.9)', -0.5); ellipse(c, 6, -13, 9, 6, 'rgba(255,255,255,0.9)', 0.5);
    ellipse(c, 0, 4, 18, 11, '#FFC21E'); c.save(); c.beginPath(); c.ellipse(0, 4, 18, 11, 0, 0, 7); c.clip(); c.fillStyle = '#2A2140'; for (const x of [-9, 0, 9]) c.fillRect(x - 2.5, -10, 5, 30); c.restore();
    circle(c, -19, 3, 6, '#2A2140'); line(c, 18, 4, 26, 4, 3, '#2A2140');
  } else if (kind === 'fish') {
    ellipse(c, -3, 0, 18, 11, '#FF9A3C'); c.beginPath(); c.moveTo(12, 0); c.lineTo(26, -11); c.lineTo(26, 11); c.closePath(); c.fillStyle = '#FF9A3C'; c.fill();
    circle(c, -11, -3, 3.4, '#FFFFFF'); circle(c, -11, -3, 1.6, '#15132A');
  } else if (kind === 'tent') {
    c.beginPath(); c.moveTo(0, -20); c.lineTo(24, 18); c.lineTo(-24, 18); c.closePath(); c.fillStyle = '#FF7A3C'; c.fill();
    c.beginPath(); c.moveTo(0, -4); c.lineTo(9, 18); c.lineTo(-9, 18); c.closePath(); c.fillStyle = '#5A2A1A'; c.fill();
  } else if (kind === 'star') {
    c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 9 : 22; c[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fillStyle = '#FFD447'; c.fill();
  } else if (kind === 'ball') {
    circle(c, 0, 0, 20, '#FFFFFF'); c.save(); c.beginPath(); c.arc(0, 0, 20, 0, 7); c.clip();
    c.fillStyle = '#FF5A6E'; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 22, -1.7, -0.6); c.fill(); c.fillStyle = '#3FA7FF'; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 22, 0.4, 1.5); c.fill();
    c.fillStyle = '#FFD447'; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 22, 2.5, 3.6); c.fill(); c.restore();
  } else if (kind === 'desk') {
    rrect(c, -15, -18, 30, 20, 3); c.fillStyle = '#5E6680'; c.fill(); line(c, 0, 2, 0, 9, 4, '#5E6680'); rrect(c, -24, 9, 48, 6, 2); c.fillStyle = '#7A829C'; c.fill();
    line(c, -19, 15, -19, 24, 4, '#7A829C'); line(c, 19, 15, 19, 24, 4, '#7A829C');
  } else if (kind === 'fall' || kind === 'net') {
    // a little man in the air, arms and legs up
    c.strokeStyle = '#FFD447'; c.lineWidth = 5; c.beginPath(); c.moveTo(0, -4); c.lineTo(0, 10); c.moveTo(0, 0); c.lineTo(-13, -12); c.moveTo(0, 0); c.lineTo(13, -12); c.moveTo(0, 10); c.lineTo(-10, 22); c.moveTo(0, 10); c.lineTo(10, 22); c.stroke();
    circle(c, 0, -11, 7, '#FFDCC4');
    c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 2.5; for (const x of [-20, 20]) { c.beginPath(); c.moveTo(x, -22); c.lineTo(x, -8); c.stroke(); }
  }
  c.restore();
}
// a photo: a white card with a picture in it. k pops it in (0..1)
function tfPhoto(c, x, y, kind, k = 1, rot = 0, s = 1) {
  if (k <= 0) return;
  const sc = E.outBack(clamp(k), 2.4) * s;
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(sc, sc);
  rrect(c, -42, -48, 84, 98, 7); c.fillStyle = '#FBF8F0'; c.fill();
  paint(() => { rrect(c, -34, -40, 68, 64, 4); c.fillStyle = PHOTO_BG[kind] || '#8890A8'; c.fill(); c.save(); c.translate(0, -8); tfIcon(c, kind, 0.95); c.restore(); });
  c.restore();
}

// ---------------------------------------------------------------- paths for the tape
function tfDense(P) { return { P, acc: polyLen(P), len: 0 }; }
function tfLine(x0, y0, x1, y1) { const n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 16)); const o = tfDense([...Array(n + 1)].map((_, i) => [lerp(x0, x1, i / n), lerp(y0, y1, i / n)])); o.len = o.acc[o.acc.length - 1]; return o; }
// out of the slot at (sx, sy) heading right, a quarter turn down, then once round a figure of eight whose leftmost
// point is where the turn ends. `loop` is made a whole number of photo steps, so a second lap lands on the first.
function tfEight(sx, sy, R, steps = 12) {
  const loop = steps * TAPE.step, a = loop / 5.2441, lx = sx + R, ly = sy + R, cx = lx + a, cy = ly;
  const P = [];
  for (let i = 0; i <= 8; i++) { const u = (i / 8) * Math.PI / 2; P.push([sx + R * Math.sin(u), sy + R * (1 - Math.cos(u))]); }
  const lead = polyLen(P)[8];
  const n = 220, L = [];
  for (let i = 1; i <= n; i++) { const u = Math.PI + (i / n) * Math.PI * 2, d = 1 + Math.sin(u) * Math.sin(u); L.push([cx + a * Math.cos(u) / d, cy + a * Math.sin(u) * Math.cos(u) / d]); }
  const o = tfDense(P.concat(L));
  // make the lap exactly `loop` long (the closed form above is good to a fraction of a pixel; this removes the rest)
  o.lead = lead; o.len = o.acc[o.acc.length - 1]; o.loop = o.len - lead; o.cx = cx; o.cy = cy; o.a = a;
  return o;
}
// the tape itself: a yellow steel ribbon along path Q from arc length s0 to s1, ruler ticks that travel with the
// tape (`shift` = how much tape has come out), and the metal tab at its end
function tfTape(c, Q, s0, s1, o = {}) {
  const w = o.w || TAPE.w;
  s0 = Math.max(0, s0); s1 = Math.min(Q.len, s1);
  if (s1 - s0 < 2) return;
  const n = Math.max(2, Math.ceil((s1 - s0) / 12)), pts = [];
  for (let i = 0; i <= n; i++) pts.push(polyAt(Q.P, Q.acc, lerp(s0, s1, i / n)));
  c.lineCap = 'butt'; c.lineJoin = 'round';
  c.beginPath(); pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](p[0], p[1])); c.lineWidth = w; c.strokeStyle = TAPE.col; c.stroke();
  paint(() => {
    const sp = TAPE.step / 4, sh = o.shift || 0;
    for (let k = Math.ceil((s0 - sh) / sp); k * sp + sh < s1; k++) {
      const s = k * sp + sh, p = polyAt(Q.P, Q.acc, s), nx = -Math.sin(p[2]), ny = Math.cos(p[2]), L = ((k % 4) + 4) % 4 === 0 ? 0.40 : 0.22;
      line(c, p[0] + nx * w * 0.46, p[1] + ny * w * 0.46, p[0] + nx * w * (0.46 - L), p[1] + ny * w * (0.46 - L), w * 0.055, TAPE.tick);
    }
  });
  if (o.tab !== false && s1 < Q.len - 0.5 || o.tab === true) {
    const p = polyAt(Q.P, Q.acc, s1);
    c.save(); c.translate(p[0], p[1]); c.rotate(p[2]); rrect(c, -4, -w * 0.62, w * 0.2, w * 1.24, 3); c.fillStyle = '#8A93AD'; c.fill(); c.restore();
  }
}
// the photos on a tape that has paid out `L` so far: photo j sits `TAPE.step` apart, the first one nearest the tab.
// On a looping path (Q.loop) the tape runs round and round; only the newest lap is drawn.
function tfTapePhotos(c, Q, L, kinds, o = {}) {
  const st = TAPE.step, s = o.s || 0.6, off = o.off === undefined ? st * 0.55 : o.off;
  const jMax = Math.floor((L - off) / st), lapLen = Q.loop ? Q.loop : Q.len;
  for (let j = Math.max(0, jMax - Math.ceil(lapLen / st)); j <= jMax; j++) {
    let d = L - (off + j * st);                       // how far this photo has travelled from the slot
    if (d < 0) continue;
    if (Q.loop) { if (L - (off + j * st) > Q.lead + Q.loop * (o.laps || 1) - 1) continue; if (d > Q.lead) d = Q.lead + ((d - Q.lead) % Q.loop); }
    else if (d > Q.len) continue;
    const p = polyAt(Q.P, Q.acc, d), k = clamp(d / 34);
    tfPhoto(c, p[0], p[1] - (o.lift || 0), kinds[j % kinds.length], k, 0.08 * Math.sin(j * 2.3), s);
  }
}

// ---------------------------------------------------------------- the TIME case (a builder's tape measure). The slot is at (x + 86 s, y + 40 s)
function tfCase(c, x, y, s = 1, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  rrect(c, -30, -100, 60, 30, 9); c.fillStyle = '#8A93AD'; c.fill();                     // the belt clip
  rrect(c, 56, 12, 36, 56, 7); c.fillStyle = '#3A2A10'; c.fill();                        // the mouth of the slot
  rrect(c, -80, -80, 160, 160, 36); c.fillStyle = '#F2A81E'; c.fill();
  rrect(c, -68, -68, 136, 136, 28); c.fillStyle = '#FFC83A'; c.fill();
  circle(c, 0, -2, 50, '#2A2140');
  paint(() => {
    c.font = '400 44px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#FFD447'; c.fillText('TIME', 0, 0);
    if (o.web > 0) {                                                                      // a cobweb in its corner: it has not been used for a while
      c.strokeStyle = `rgba(235,235,255,${0.75 * o.web})`; c.lineWidth = 2.2;
      for (let i = 0; i <= 4; i++) { const a = Math.PI + i * Math.PI / 8; c.beginPath(); c.moveTo(80, 80); c.lineTo(80 + Math.cos(a) * 120, 80 + Math.sin(a) * 120); c.stroke(); }
      for (const r of [40, 74, 106]) { c.beginPath(); for (let i = 0; i <= 4; i++) { const a = Math.PI + i * Math.PI / 8; c[i ? 'lineTo' : 'moveTo'](80 + Math.cos(a) * r * (i % 2 ? 0.9 : 1), 80 + Math.sin(a) * r * (i % 2 ? 0.9 : 1)); } c.stroke(); }
    }
  });
  c.restore();
  return [x + 86 * s, y + 40 * s];
}

// ---------------------------------------------------------------- an instant camera (round (0, 0), about 110 wide). flash 0..1
function tfCamera(c, x, y, s = 1, flash = 0, rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  rrect(c, -56, -40, 112, 80, 14); c.fillStyle = '#F4EFE6'; c.fill();
  rrect(c, -56, 14, 112, 26, 10); c.fillStyle = '#D9D2C4'; c.fill();
  paint(() => { ['#FF5A6E', '#FFD447', '#4DFFB4', '#3FA7FF'].forEach((col, i) => { c.fillStyle = col; c.fillRect(-56, -4 + i * 4, 112, 4); }); });
  circle(c, 0, -2, 27, '#2A2140'); circle(c, 0, -2, 18, '#16264F');
  paint(() => { circle(c, -6, -8, 6, 'rgba(160,210,255,0.9)'); });
  rrect(c, 28, -34, 22, 16, 4); c.fillStyle = flash > 0.05 ? '#FFFFFF' : '#C9D4F2'; c.fill();
  rrect(c, -48, -50, 26, 12, 4); c.fillStyle = '#FF5A6E'; c.fill();
  c.restore();
}
// the flash itself: a star of light (screen or world, whatever the transform is), k 0..1
function tfFlash(x, y, k, r = 150) {
  if (k <= 0.02) return;
  for (const [c, a] of [[ctx, 0.95], [gctx, 0.8]]) {
    c.save(); c.translate(x, y); c.rotate(0.3);
    c.fillStyle = `rgba(255,255,255,${a * k})`;
    c.beginPath(); for (let i = 0; i < 16; i++) { const an = (i / 16) * Math.PI * 2, rr = (i % 2 ? 0.16 : i % 4 === 0 ? 1 : 0.5) * r * (0.5 + 0.5 * k); c[i ? 'lineTo' : 'moveTo'](Math.cos(an) * rr, Math.sin(an) * rr); } c.closePath(); c.fill();
    c.restore();
  }
  softDot(gctx, x, y, r * 1.2, '#FFFFFF', 0.5 * k);
}

// ---------------------------------------------------------------- the brain
// o: {look: [x, y] -1..1, mood: 'calm' | 'worried' | 'squint' | 'think' | 'shrug' | 'grin' | 'sad' | 'wow', lean, bob,
//  armL / armR: hand targets in the brain's own units (default: at its sides), noArms, shut: eyes closed 0..1,
//  mask: a sleep mask 0..1, helmet: a crash helmet 0..1, cam: {x, y, flash, rot} an instant camera at its eye}
function tfBrain(c, x, y, s, t, o = {}) {
  const mood = o.mood || 'calm', look = o.look || [0, 0];
  const bob = (o.still ? 0 : 5 * Math.sin(t * 2.4)) + (o.bob || 0);
  c.save(); c.translate(x, y + bob); c.scale(s, s); c.rotate(o.lean || 0);
  const arm = (sd, target) => {
    const sx = sd * 138, sy = 30, tx = target ? target[0] : sd * 176, ty = target ? target[1] : 118;
    const mx = (sx + tx) / 2 + sd * 22, my = (sy + ty) / 2 + 30;
    c.beginPath(); c.moveTo(sx, sy); c.quadraticCurveTo(mx, my, tx, ty); c.lineWidth = 17; c.lineCap = 'round'; c.strokeStyle = '#E0688E'; c.stroke();
    circle(c, tx, ty, 21, '#FFA9C0'); circle(c, tx + sd * 12, ty - 14, 9, '#FFA9C0');
  };
  if (!o.noArms) { arm(-1, o.armL); arm(1, o.armR); }
  rrect(c, -12, 96, 58, 74, 22); c.fillStyle = '#D9688A'; c.fill();                      // the stem
  const lumps = [[-150, 20, 62], [-126, -50, 66], [-64, -98, 70], [16, -112, 74], [92, -86, 68], [144, -26, 62], [150, 40, 56], [96, 84, 60], [10, 100, 66], [-84, 88, 62]];
  c.beginPath(); for (const [lx, ly, lr] of lumps) { c.moveTo(lx + lr, ly); c.arc(lx, ly, lr, 0, 7); } c.ellipse(0, 0, 150, 96, 0, 0, 7);
  c.fillStyle = '#FF93B0'; c.fill();
  paint(() => {
    c.lineWidth = 7; c.lineCap = 'round'; c.strokeStyle = 'rgba(176,60,104,0.55)';
    for (const [x0, y0, x1, y1, x2, y2] of [[-150, -24, -108, -66, -70, -26], [-56, -122, -20, -74, 22, -112], [40, -130, 84, -86, 128, -98], [-176, 44, -150, 78, -116, 60], [110, 96, 148, 76, 176, 30], [-30, 122, 6, 100, 44, 126]]) {
      c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x1, y1, x2, y2); c.stroke();
    }
    // the face
    const lx = look[0] * 9, ly = look[1] * 7, shut = o.shut || 0;
    const ry = mood === 'squint' ? 13 : mood === 'worried' || mood === 'wow' ? 34 : mood === 'grin' ? 24 : mood === 'sad' ? 25 : 28;
    for (const ex of [-44, 38]) {
      if ((o.mask || 0) > 0.5) continue;
      if (shut > 0.6) { c.beginPath(); c.moveTo(ex - 22, 2); c.quadraticCurveTo(ex, 18, ex + 22, 2); c.lineWidth = 6; c.strokeStyle = '#7E2748'; c.stroke(); continue; }
      ellipse(c, ex, 4, 25, ry * (1 - 0.5 * shut), '#FFFFFF'); c.lineWidth = 4; c.strokeStyle = '#7E2748'; c.beginPath(); c.ellipse(ex, 4, 25, ry * (1 - 0.5 * shut), 0, 0, 7); c.stroke();
      circle(c, ex + lx, 4 + ly * (ry / 28), mood === 'worried' || mood === 'wow' ? 8 : 10.5, '#231028'); circle(c, ex + lx - 3, 1 + ly * (ry / 28), 3.4, '#FFFFFF');
    }
    const bt = mood === 'worried' || mood === 'sad' ? 1 : mood === 'squint' ? -0.8 : mood === 'think' ? 0.5 : 0, by = mood === 'worried' || mood === 'wow' ? -46 : mood === 'squint' ? -24 : -38;
    if ((o.mask || 0) <= 0.5) { line(c, -70, by + bt * 10, -24, by - bt * 8 + (mood === 'think' ? -10 : 0), 9, '#7E2748'); line(c, 16, by - bt * 8, 64, by + bt * 10, 9, '#7E2748'); }
    if (mood === 'worried' || mood === 'wow') ellipse(c, -2, 64, mood === 'wow' ? 19 : 15, mood === 'wow' ? 17 : 12, '#5A1522');
    else if (mood === 'grin' || mood === 'shrug') { c.beginPath(); c.moveTo(-28, 54); c.quadraticCurveTo(-2, 84, 24, 54); c.closePath(); c.fillStyle = '#5A1522'; c.fill(); }
    else if (mood === 'sad') { c.beginPath(); c.moveTo(-18, 68); c.quadraticCurveTo(0, 54, 18, 68); c.lineWidth = 6; c.strokeStyle = '#5A1522'; c.stroke(); }
    else if (mood === 'squint' || mood === 'think') { c.beginPath(); c.moveTo(-18, 62); c.quadraticCurveTo(0, 54, 18, 64); c.lineWidth = 6; c.strokeStyle = '#5A1522'; c.stroke(); }
    else { c.beginPath(); c.moveTo(-16, 58); c.quadraticCurveTo(0, 68, 16, 58); c.lineWidth = 6; c.strokeStyle = '#5A1522'; c.stroke(); }
  });
  // a sleep mask
  if ((o.mask || 0) > 0.5) {
    line(c, -140, -6, 140, -6, 9, '#2A2140');
    c.beginPath(); c.moveTo(-84, -30); c.quadraticCurveTo(-46, -40, -6, -24); c.quadraticCurveTo(34, -40, 78, -30); c.quadraticCurveTo(92, 6, 62, 30); c.quadraticCurveTo(26, 40, -2, 16); c.quadraticCurveTo(-34, 40, -68, 30); c.quadraticCurveTo(-98, 6, -84, -30); c.closePath();
    c.fillStyle = '#3B4FB8'; c.fill();
    paint(() => { for (const ex of [-44, 38]) { c.beginPath(); c.moveTo(ex - 18, 2); c.quadraticCurveTo(ex, 14, ex + 18, 2); c.lineWidth = 5; c.strokeStyle = '#C8D4FF'; c.stroke(); } });
  }
  // a crash helmet with goggles pushed up
  const hk = o.helmet || 0;
  if (hk > 0.02) {
    const dy = -260 * (1 - E.outBack(clamp(hk), 1.4));
    c.save(); c.translate(0, dy);
    c.beginPath(); c.moveTo(-178, -34); c.quadraticCurveTo(-176, -206, 4, -206); c.quadraticCurveTo(186, -206, 184, -34); c.closePath(); c.fillStyle = '#FF5A3C'; c.fill();
    rrect(c, -190, -52, 386, 30, 12); c.fillStyle = '#C93A22'; c.fill();
    paint(() => { rrect(c, -22, -204, 44, 156, 10); c.fillStyle = '#FFFFFF'; c.fill(); });
    c.restore();
  }
  // the camera, held to its right eye
  if (o.cam) tfCamera(c, o.cam.x === undefined ? 44 : o.cam.x, o.cam.y === undefined ? 6 : o.cam.y, o.cam.s || 0.92, o.cam.flash || 0, o.cam.rot || 0);
  c.restore();
}

// ---------------------------------------------------------------- the brain's round window, for the top left corner of other scenes
const HUD = { X: 232, Y: 586, R: 112, CASE: [392, 560], CS: 0.6 };
// o: {brain: tfBrain options, flash: 0..1, web, alert}. Returns the slot of the case (screen px), where a tape starts.
function tfHud(t, o = {}) {
  screenSpace();
  const { X, Y, R } = HUD;
  circle(ctx, X, Y, R + 15, '#160C2A');
  ctx.save(); ctx.beginPath(); ctx.arc(X, Y, R, 0, 7); ctx.clip();
  const g = ctx.createRadialGradient(X - 30, Y - 40, 10, X, Y, R * 1.2); g.addColorStop(0, '#6A3A8E'); g.addColorStop(1, '#2A1446');
  ctx.fillStyle = g; ctx.fillRect(X - R, Y - R, 2 * R, 2 * R);
  tfBrain(ctx, X - 6, Y + 14, R / 215, t, Object.assign({ noArms: true }, o.brain || {}));
  ctx.restore();
  ctx.lineWidth = 9; ctx.strokeStyle = o.ring || '#C8A8FF'; ctx.beginPath(); ctx.arc(X, Y, R + 5, 0, 7); ctx.stroke();
  const slot = tfCase(ctx, HUD.CASE[0], HUD.CASE[1], HUD.CS, { web: o.web || 0 });
  if (o.flash > 0.02) tfFlash(X + 44, Y - 6, o.flash, 120);
  return slot;
}

// ---------------------------------------------------------------- the room it lives in: shelves of albums, a hanging lamp, a soft floor
let MIND_BG = null;
function initMind() {
  MIND_BG = mkCanvas(W, H);
  const x = MIND_BG.getContext('2d'), rng = mulberry32(417);
  const g = x.createRadialGradient(540, 760, 80, 540, 900, 1300);
  g.addColorStop(0, '#5A2E7A'); g.addColorStop(1, '#120820');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.filter = 'blur(4px)';
  // shelves of albums along the back wall
  for (let row = 0; row < 4; row++) {
    const y = 420 + row * 190;
    x.fillStyle = 'rgba(20,10,36,0.55)'; x.fillRect(40, y + 150, 1000, 16);
    let bx = 60;
    while (bx < 1010) {
      const w = 22 + rng() * 26, h = 96 + rng() * 50, col = ['#8A4FB0', '#B0527E', '#5A68B8', '#3F8FA8', '#B88A3C', '#6E4A9A'][Math.floor(rng() * 6)];
      if (rng() < 0.86) { x.globalAlpha = 0.34; x.fillStyle = col; x.fillRect(bx, y + 150 - h, w, h); x.globalAlpha = 0.25; x.fillStyle = '#FFFFFF'; x.fillRect(bx + w * 0.3, y + 150 - h + 14, w * 0.4, 8); x.globalAlpha = 1; }
      bx += w + 5;
    }
  }
  x.filter = 'none';
  // the floor
  const f = x.createLinearGradient(0, 1210, 0, H); f.addColorStop(0, '#2A1440'); f.addColorStop(1, '#0C0616');
  x.fillStyle = f; x.fillRect(0, 1210, W, H - 1210);
  x.fillStyle = 'rgba(200,168,255,0.12)'; x.fillRect(0, 1210, W, 6);
}
function mindRoom(t) {
  screenSpace();
  ctx.drawImage(MIND_BG, 0, 0);
  // a lamp on a cord, swaying a little (it hangs above the brain: the glow stays off the faces)
  const lx = 540 + 16 * Math.sin(t * 0.9);
  line(ctx, 540, 0, lx, 380, 5, '#1A0E2C');
  ctx.beginPath(); ctx.moveTo(lx - 70, 430); ctx.quadraticCurveTo(lx, 340, lx + 70, 430); ctx.closePath(); ctx.fillStyle = '#2A1A44'; ctx.fill();
  ellipse(ctx, lx, 432, 46, 12, '#FFE7B0');
  softDot(gctx, lx, 440, 170, '#FFC98A', 0.5);
}
