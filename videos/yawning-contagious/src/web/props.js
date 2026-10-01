// Yawning Short: props. The cold pack on his forehead, the lab monitor playing a yawn, the study's bar chart,
// the dog (it catches our yawns), the book of yawns, and a "pointing at you" hand. Nothing here is timed: the shots
// pass the state in (scenes.js).
'use strict';

// ---------------------------------------------------------------- the cold pack (drawn in the hero's rig space)
// call from charLayer's post callback after translate(st.x, st.y); scale(st.s); r = the rig (r.head = head centre)
function coldPack(c, r, t, k = 1, warm = false) {
  if (k <= 0.01) return;
  const [hx, hy] = r.head;
  c.save(); c.translate(hx, hy - 50); c.scale(k, k);
  // elastic band around the head
  c.beginPath(); c.ellipse(0, 6, 68, 16, 0, 0, Math.PI); c.lineWidth = 8; c.strokeStyle = warm ? '#B0402A' : '#2C5FA8'; c.stroke();
  // the gel pack
  rrect(c, -58, -22, 116, 40, 16);
  const g = c.createLinearGradient(0, -22, 0, 18);
  if (warm) { g.addColorStop(0, '#FFB08A'); g.addColorStop(1, '#E2553A'); }
  else { g.addColorStop(0, '#BFF0FF'); g.addColorStop(0.5, '#5CC8F0'); g.addColorStop(1, '#2C7FC8'); }
  c.fillStyle = g; c.fill(); c.lineWidth = 4; c.strokeStyle = warm ? '#8A2A1A' : '#1D4E8A'; c.stroke();
  ellipse(c, -24, -12, 22, 6, 'rgba(255,255,255,0.6)', -0.1);
  // gel bubbles
  for (let i = 0; i < 4; i++) circle(c, -30 + i * 20, 6 + 4 * Math.sin(i * 2 + t * 2), 4, 'rgba(255,255,255,0.45)');
  c.restore();
}
// frost sparkle + cold mist around the pack (world coords under the current camera)
function coldMist(x, y, t, a = 1) {
  if (a <= 0.01) return;
  for (let i = 0; i < 9; i++) {
    const ph = ((t * 0.5 + i / 9) % 1), px = x + Math.sin(i * 2.3) * 90 + Math.sin(t + i) * 10, py = y - 20 - ph * 140;
    circle(ctx, px, py, 3 + 3 * Math.sin(i), rgba('#E6FAFF', 0.7 * a * Math.sin(Math.PI * ph)));
    softDot(gctx, px, py, 18, '#9FE8FF', 0.6 * a * Math.sin(Math.PI * ph));
  }
  softDot(gctx, x, y, 110, '#7FE9FF', 0.35 * a);
}

// ---------------------------------------------------------------- the lab monitor (world coords)
// a screen showing someone yawning on a loop; drawFn(c, cx, cy, s) draws the content
function labMonitor(x, y, w, h, t, drawFn) {
  const c = ctx;
  rrect(c, x - 14, y - 14, w + 28, h + 28, 22); c.fillStyle = '#1A1F33'; c.fill();
  c.save(); rrect(c, x, y, w, h, 12); c.clip();
  const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#2B3F78'); g.addColorStop(1, '#141E40');
  c.fillStyle = g; c.fillRect(x, y, w, h);
  drawFn(c, x + w / 2, y + h, t);
  // scanlines + glare
  c.fillStyle = 'rgba(255,255,255,0.04)'; for (let sy = y; sy < y + h; sy += 6) c.fillRect(x, sy, w, 2);
  const gl = c.createLinearGradient(x, y, x + w, y + h); gl.addColorStop(0, 'rgba(255,255,255,0.12)'); gl.addColorStop(0.4, 'rgba(255,255,255,0)');
  c.fillStyle = gl; c.fillRect(x, y, w, h);
  c.restore();
  rrect(gctx, x, y, w, h, 12); gctx.fillStyle = 'rgba(120,170,255,0.18)'; gctx.fill();
  // stand
  c.fillStyle = '#1A1F33'; c.fillRect(x + w / 2 - 16, y + h + 14, 32, 60); rrect(c, x + w / 2 - 80, y + h + 70, 160, 16, 8); c.fill();
  // red REC dot
  circle(c, x + 30, y + 28, 9, (Math.floor(t * 2) % 2) ? '#FF4D5E' : '#7A1A24');
}

// ---------------------------------------------------------------- the study's chart (screen space)
// k1, k2: bar growth 0..1; faces yawn on the warm bar
function packChart(t, k1, k2, pop, yWarm) {
  const c = ctx;
  screenSpace();
  if (pop <= 0.01) return;
  const base = 1040, scale = 960; // px per 100 %
  c.save(); c.globalAlpha = clamp(pop * 1.5);
  c.translate(540, 760); c.scale(1.18, 1.18); c.translate(-540, -760);
  gctx.save(); gctx.translate(540 / 2, 760 / 2); gctx.scale(1.18, 1.18); gctx.translate(-540 / 2, -760 / 2);
  c.font = '900 50px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#E6ECFF';
  c.fillText('CAUGHT A YAWN', 540, 470);
  line(c, 170, base, 910, base, 6, 'rgba(220,230,255,0.6)');
  const bars = [[330, 0.41 * k1, '#FF7A4A', '#FFB08A', 'WARM PACK', '41%'], [750, 0.09 * k2, '#3FB8FF', '#BFF0FF', 'COLD PACK', '9%']];
  for (const [x, v, col, hi, lab, num] of bars) {
    const h = v * scale, kk = x === 330 ? k1 : k2;
    if (h > 1) {
      rrect(c, x - 110, base - h, 220, h, 18);
      const g = c.createLinearGradient(x - 110, 0, x + 110, 0); g.addColorStop(0, hi); g.addColorStop(0.5, col); g.addColorStop(1, mixHex(col, '#000000', 0.25));
      c.fillStyle = g; c.fill();
      rrect(gctx, x - 110, base - h, 220, h, 18); gctx.fillStyle = rgba(col, 0.35); gctx.fill();
    }
    const nk = E.outBack(clamp(kk * 1.3 - 0.2));
    if (nk > 0) { c.save(); c.translate(x, base - h - 70); c.scale(nk, nk); c.font = '400 112px Anton'; c.textAlign = 'center'; c.lineJoin = 'round';
      c.lineWidth = 15; c.strokeStyle = '#0B0B1A'; c.strokeText(num, 0, 0); c.fillStyle = x === 330 ? '#FFB08A' : '#BFF0FF'; c.fillText(num, 0, 0); c.restore(); }
    c.font = '900 44px Montserrat'; c.fillStyle = x === 330 ? '#FFB08A' : '#BFF0FF'; c.fillText(lab, x, base + 48);
  }
  c.font = '700 26px Montserrat'; c.fillStyle = 'rgba(200,210,240,0.75)'; c.fillText('Gallup & Gallup, 2007', 540, 1135);
  c.restore(); gctx.restore();
}

// ---------------------------------------------------------------- the dog (world coords)
// st: {x, y = floor, s, yawn 0..1, tilt (head), lookX, wag, blink}
function drawDog(c, st, t) {
  const s = st.s || 1, yw = clamp(st.yawn || 0);
  const fur = '#D9A066', furSh = '#A8703C', white = '#FFF4E6', ear = '#7A4A26';
  c.save(); c.translate(st.x, st.y); c.scale(s, s);
  ellipse(c, 0, 4, 150, 22, 'rgba(0,0,0,0.35)');
  // tail (wagging) behind the body
  const wag = Math.sin(t * (st.wag || 0) * 14) * 0.5 * Math.min(1, st.wag || 0);
  c.save(); c.translate(70, -60); c.rotate(-0.9 + wag);
  line(c, 0, 0, 0, -90, 22, furSh); line(c, 0, -60, 0, -96, 18, white); c.restore();
  // sitting body: haunches + chest
  ellipse(c, -70, -60, 70, 64, furSh); ellipse(c, 70, -60, 70, 64, furSh);
  c.beginPath(); c.moveTo(-80, -10); c.quadraticCurveTo(-100, -200, 0, -250); c.quadraticCurveTo(100, -200, 80, -10); c.closePath();
  const bg = c.createLinearGradient(-90, 0, 90, 0); bg.addColorStop(0, mixHex(fur, '#FFFFFF', 0.2)); bg.addColorStop(1, furSh);
  c.fillStyle = bg; c.fill();
  c.beginPath(); c.moveTo(-40, -30); c.quadraticCurveTo(-50, -170, 0, -200); c.quadraticCurveTo(50, -170, 40, -30); c.closePath(); c.fillStyle = white; c.fill();
  // front legs + paws
  for (const sd of [-1, 1]) { rrect(c, sd * 34 - 18, -120, 36, 120, 16); c.fillStyle = fur; c.fill(); ellipse(c, sd * 34, -4, 26, 14, white); }
  // collar + tag
  c.beginPath(); c.ellipse(0, -232, 70, 18, 0, 0.1, Math.PI - 0.1); c.lineWidth = 14; c.strokeStyle = '#E8384F'; c.stroke();
  circle(c, 0, -210, 13, '#FFD447'); softDot(gctx, 0, -210, 24, '#FFD447', 0.4);
  // head
  c.save(); c.translate(0, -320); c.rotate(st.tilt || 0);
  const jd = 40 * yw;
  // ears (lift a little in the yawn)
  for (const sd of [-1, 1]) {
    c.save(); c.translate(sd * 78, -40); c.rotate(sd * (0.25 - 0.35 * yw));
    c.beginPath(); c.ellipse(sd * 14, 60, 34, 74, sd * 0.15, 0, Math.PI * 2); c.fillStyle = ear; c.fill(); c.restore();
  }
  c.beginPath(); c.ellipse(0, 0, 104, 96, 0, Math.PI, Math.PI * 2); c.ellipse(0, 0, 104 - jd * 0.1, 96 + jd * 0.5, 0, 0, Math.PI);
  const hg = c.createRadialGradient(-30, -40, 10, 0, 0, 130); hg.addColorStop(0, mixHex(fur, '#FFFFFF', 0.3)); hg.addColorStop(1, furSh);
  c.fillStyle = hg; c.fill();
  // muzzle (drops with the yawn)
  ellipse(c, 0, 46 + jd * 0.5, 62, 46 + jd * 0.45, white);
  // eyes
  for (const sd of [-1, 1]) {
    const ex = sd * 40, ey = -18;
    if (yw > 0.35) { c.beginPath(); c.moveTo(ex - sd * 14, ey - 8); c.lineTo(ex + sd * 10, ey); c.lineTo(ex - sd * 14, ey + 8); c.lineWidth = 6; c.strokeStyle = '#2A1A10'; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(); }
    else if ((st.blink || 0) > 0.9) { c.beginPath(); c.moveTo(ex - 14, ey); c.quadraticCurveTo(ex, ey + 8, ex + 14, ey); c.lineWidth = 6; c.strokeStyle = '#2A1A10'; c.stroke(); }
    else { circle(c, ex, ey, 17, '#2A1A10'); circle(c, ex + (st.lookX || 0) * 5 - 5, ey - 6, 6, '#FFFFFF'); }
    line(c, sd * 26, -48 - 10 * yw, sd * 54, -44 - 14 * yw + sd * 0, 7, furSh);
  }
  // nose
  ellipse(c, 0, 18 + jd * 0.15, 22, 15, '#1E1410'); ellipse(c, -6, 13 + jd * 0.15, 8, 4, 'rgba(255,255,255,0.5)');
  if (yw > 0.05) { // the yawn: a tall mouth, curled tongue
    const my = 64 + jd * 0.55, rx = 26 + 16 * yw, ry = 8 + 40 * yw;
    ellipse(c, 0, my, rx, ry, '#3A0E16');
    c.save(); c.beginPath(); c.ellipse(0, my, rx, ry, 0, 0, Math.PI * 2); c.clip();
    for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(sd * rx * 0.7, my - ry + 2); c.lineTo(sd * rx * 0.55, my - ry + 18 * yw); c.lineTo(sd * rx * 0.4, my - ry + 2); c.fillStyle = '#FFFFFF'; c.fill(); }
    // the tongue curls up at the tip
    c.beginPath(); c.moveTo(-rx * 0.7, my + ry); c.quadraticCurveTo(-rx * 0.6, my + ry * 0.1, 0, my + ry * 0.05 - 10 * yw); c.quadraticCurveTo(rx * 0.6, my + ry * 0.1, rx * 0.7, my + ry); c.closePath();
    c.fillStyle = '#FF7A90'; c.fill(); line(c, 0, my + ry * 0.2, 0, my + ry, 3, 'rgba(160,40,70,0.5)');
    c.restore();
  } else {
    c.beginPath(); c.moveTo(0, 32); c.lineTo(0, 50); c.moveTo(-26, 52); c.quadraticCurveTo(-12, 62, 0, 50); c.quadraticCurveTo(12, 62, 26, 52);
    c.lineWidth = 5; c.strokeStyle = '#1E1410'; c.lineCap = 'round'; c.stroke();
  }
  c.restore();
  c.restore();
}
function dogHead(st) { const s = st.s || 1; return [st.x, st.y - 320 * s]; }

// ---------------------------------------------------------------- the book of yawns (screen space)
// k: open 0..1; glow: which "yawn" words are lit (0..1 each); y: page centre
function yawnBook(x, y, w, t, open, lit, s = 1) {
  const c = ctx;
  c.save(); c.translate(x, y); c.scale(s, s);
  const hw = w / 2, h = w * 0.66;
  // cover edge + pages
  rrect(c, -hw - 16, -h / 2 - 12, w + 32, h + 34, 16); c.fillStyle = '#5A2E8A'; c.fill();
  for (const sd of [-1, 1]) {
    c.beginPath(); c.moveTo(0, -h / 2 + 6); c.quadraticCurveTo(sd * hw * 0.5, -h / 2 - 18, sd * hw, -h / 2); c.lineTo(sd * hw, h / 2);
    c.quadraticCurveTo(sd * hw * 0.5, h / 2 - 14, 0, h / 2 + 8); c.closePath();
    const g = c.createLinearGradient(0, 0, sd * hw, 0); g.addColorStop(0, '#CFC4AE'); g.addColorStop(0.12, '#F6EEDC'); g.addColorStop(1, '#FFF8EA');
    c.fillStyle = g; c.fill();
  }
  // lines of text (grey bars), with "yawn" words that light up
  const words = [];
  const rng = mulberry32(8);
  for (const sd of [-1, 1]) for (let row = 0; row < 9; row++) {
    let lx = sd < 0 ? -hw + 34 : 30;
    const ly = -h / 2 + 46 + row * (h - 80) / 8;
    while (lx < (sd < 0 ? -30 : hw - 34)) {
      const ww = 30 + rng() * 60;
      if (lx + ww > (sd < 0 ? -30 : hw - 34)) break;
      words.push([lx, ly, ww]);
      lx += ww + 14;
    }
  }
  for (const [lx, ly, ww] of words) { rrect(c, lx, ly - 7, ww, 14, 7); c.fillStyle = 'rgba(70,60,50,0.35)'; c.fill(); }
  // the yawn words
  const spots = [[-hw + 50, -h / 2 + 46 + 2 * (h - 80) / 8], [40, -h / 2 + 46 + 1 * (h - 80) / 8], [-hw + 120, -h / 2 + 46 + 5 * (h - 80) / 8],
    [70, -h / 2 + 46 + 4 * (h - 80) / 8], [-hw + 60, -h / 2 + 46 + 7 * (h - 80) / 8], [120, -h / 2 + 46 + 7 * (h - 80) / 8]];
  spots.forEach(([sx, sy], i) => {
    const k = clamp(lit[i] || 0);
    if (k <= 0.01) return;
    c.font = `900 ${30 + 6 * k}px Montserrat`; c.textAlign = 'left'; c.textBaseline = 'middle';
    const tw = c.measureText(i % 2 ? 'yawning' : 'yawn').width;
    rrect(c, sx - 8, sy - 22, tw + 16, 44, 8); c.fillStyle = rgba('#FFD447', 0.45 * k); c.fill();
    c.fillStyle = mixHex('#5A4A3A', '#B8860B', k); c.fillText(i % 2 ? 'yawning' : 'yawn', sx, sy + 1);
    softDot(gctx, x + (sx + 40) * s, y + sy * s, 60 * s, '#FFD447', 0.6 * k);
  });
  c.restore();
}

// ---------------------------------------------------------------- "you": the I-want-YOU point (screen space)
// his right hand comes in from the lower right: sleeve, fist with curled fingers and thumb, the index finger angled
// up-left and out of the screen at the viewer (the tip a little bigger: it's closer to us)
function pointAtYou(x, y, s, t, pal = PAL) {
  const c = ctx;
  c.save(); c.translate(x, y); c.scale(s, s);
  // fist
  c.save(); c.rotate(-0.25);
  rrect(c, -62, -52, 124, 108, 40);
  const g = c.createLinearGradient(-60, -50, 60, 60); g.addColorStop(0, pal.skinHi); g.addColorStop(0.5, pal.skin); g.addColorStop(1, pal.skinSh);
  c.fillStyle = g; c.fill(); c.lineWidth = 4; c.strokeStyle = rgba(pal.skinSh, 0.9); c.stroke();
  // curled fingers along the front
  for (let i = 0; i < 3; i++) {
    rrect(c, -50 + i * 36, 14, 34, 40, 14); c.fillStyle = pal.skin; c.fill(); c.lineWidth = 3.5; c.strokeStyle = pal.skinSh; c.stroke();
  }
  // thumb across the front
  line(c, 48, -6, -4, 10, 30, pal.skinSh); line(c, 46, -8, -2, 8, 24, pal.skin);
  ellipse(c, -4, 6, 9, 7, 'rgba(255,235,225,0.9)');
  c.restore();
  // the index finger: from the knuckle up-left and out at us, tip a little bigger
  const bx = -30, by = -40, tx = -84, ty = -88;
  c.save();
  const ang = Math.atan2(ty - by, tx - bx), L = Math.hypot(tx - bx, ty - by);
  c.translate(bx, by); c.rotate(ang);
  c.beginPath(); c.moveTo(0, -22); c.lineTo(L, -31); c.arc(L, 0, 31, -Math.PI / 2, Math.PI / 2); c.lineTo(0, 22); c.closePath();
  const fg = c.createLinearGradient(0, -31, 0, 31); fg.addColorStop(0, pal.skinHi); fg.addColorStop(0.55, pal.skin); fg.addColorStop(1, pal.skinSh);
  c.fillStyle = fg; c.fill(); c.lineWidth = 4; c.strokeStyle = rgba(pal.skinSh, 0.9); c.stroke();
  for (const k of [0.35, 0.68]) { c.beginPath(); c.arc(L * k, 0, 18, -0.7, 0.7); c.lineWidth = 3; c.strokeStyle = rgba(pal.skinSh, 0.8); c.stroke(); }
  ellipse(c, L - 2, -12, 14, 10, 'rgba(255,240,236,0.95)');   // the nail
  ellipse(c, L + 2, -15, 6, 3.5, '#FFFFFF');
  c.restore();
  // "you!" lines around the fingertip
  for (let i = 0; i < 6; i++) {
    const a = -2.9 + i * 0.42, r0 = 50 + 4 * Math.sin(t * 20 + i);
    line(c, tx + Math.cos(a) * r0, ty + Math.sin(a) * r0, tx + Math.cos(a) * (r0 + 26), ty + Math.sin(a) * (r0 + 26), 6, 'rgba(255,255,255,0.85)');
  }
  c.restore();
}

// ---------------------------------------------------------------- the detective's magnifying glass (world coords)
// held in his right hand (wrist `hand`) over his right eye (`eye`); the lens shows the eye blown up and suspicious.
// R = lens radius in world units; k = 0..1 pop-in; squint = how far the lid comes down
function magnifier(c, hand, eye, R, k, t, squint = 0.45, pal = PAL) {
  if (k <= 0.01) return;
  const ex = eye[0], ey = eye[1];
  const dx = hand[0] - ex, dy = hand[1] - ey, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
  c.save(); c.translate(ex, ey); c.scale(k, k); c.translate(-ex, -ey);
  // handle from the rim to his hand
  line(c, ex + ux * (R + 4), ey + uy * (R + 4), hand[0], hand[1], 16, '#3A2414');
  line(c, ex + ux * (R + 4), ey + uy * (R + 4), hand[0], hand[1], 10, '#7A4E2A');
  // the magnified eye
  c.save(); c.beginPath(); c.arc(ex, ey, R, 0, Math.PI * 2); c.clip();
  const sk = c.createRadialGradient(ex - R * 0.3, ey - R * 0.3, 2, ex, ey, R * 1.2);
  sk.addColorStop(0, pal.skinHi); sk.addColorStop(1, pal.skin);
  c.fillStyle = sk; c.fillRect(ex - R, ey - R, 2 * R, 2 * R);
  const er = R * 0.62;
  ellipse(c, ex, ey + R * 0.08, er, er * 0.82, '#FFFFFF');
  const look = 0.06 * Math.sin(t * 1.7);
  circle(c, ex + look * er, ey + R * 0.12, er * 0.46, '#3A2414');
  circle(c, ex + look * er, ey + R * 0.12, er * 0.3, pal.pupil);
  circle(c, ex + look * er - er * 0.15, ey - er * 0.05, er * 0.12, '#FFFFFF');
  // the suspicious lid + lash line
  const lidY = ey + R * 0.08 - er * 0.82 + 2 * er * 0.82 * squint;
  c.fillStyle = mixHex(pal.skin, pal.skinSh, 0.25); c.fillRect(ex - R, ey - R, 2 * R, lidY - (ey - R));
  line(c, ex - er * 1.05, lidY, ex + er * 1.05, lidY, R * 0.09, '#5A2E22');
  // the brow, down at the middle
  line(c, ex - er * 1.1, ey - R * 0.62, ex + er * 1.05, ey - R * 0.78, R * 0.16, pal.hair);
  c.restore();
  // glass + rim
  c.beginPath(); c.arc(ex, ey, R, 0, Math.PI * 2); c.fillStyle = 'rgba(190,230,255,0.16)'; c.fill();
  c.beginPath(); c.arc(ex - R * 0.25, ey - R * 0.25, R * 0.6, Math.PI * 1.05, Math.PI * 1.5); c.lineWidth = R * 0.08; c.strokeStyle = 'rgba(255,255,255,0.7)'; c.stroke();
  c.beginPath(); c.arc(ex, ey, R + 3, 0, Math.PI * 2); c.lineWidth = 12; c.strokeStyle = '#7A5A08'; c.stroke();
  c.beginPath(); c.arc(ex, ey, R + 3, 0, Math.PI * 2); c.lineWidth = 7; c.strokeStyle = '#F2C640'; c.stroke();
  softDot(gctx, ex - R * 0.3, ey - R * 0.3, R * 0.6, '#FFFFFF', 0.25);
  c.restore();
}
