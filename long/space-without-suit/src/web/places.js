// What If You Went to Space WITHOUT a Suit? (long-form): the other places.
// - the station's corridor (a tube of white modules, handrails, warm lights) where his sister, the commander, flies;
// - Pip's bedroom at night on Earth: a window on the stars, a goldfish bowl on the sill, Pip with a tablet;
// - 1960: Joe Kittinger's open gondola under a giant balloon, nineteen miles up, the black sky and the curve of the
//   Earth below; his gloved hand that swells (old film);
// - 1966: a NASA vacuum chamber in Houston, a suited man inside, engineers at the round window (old film);
// - a giant thermos in section (its walls with nothing between them); the movies' exploding astronaut on a screen;
// - the palm of a hand with the air pressing on it.
// World coords = screen coords at zoom 1 unless a function says it draws in screen space.
'use strict';

// ---------------------------------------------------------------- the station's corridor (screen space)
// o: {k (how far down the corridor we are: moves the rings), red 0..1 (the alarm), sis: {x, y, s, face, fly 0..1, reach}}
function corridor(t, o = {}) {
  screenSpace();
  const cx = 960, cy = 470, red = o.red || 0, travel = o.k || 0;
  const g = ctx.createRadialGradient(cx, cy, 20, cx, cy, 1200); g.addColorStop(0, '#FFE7C2'); g.addColorStop(0.25, '#C9CFDD'); g.addColorStop(1, '#3C4562');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // rings receding into the distance (each ring a module joint), moving toward us as we travel
  for (let i = 9; i >= 0; i--) {
    const z = ((i - travel * 3) % 10 + 10) % 10 + 0.4, sc = 1 / z;
    const rx = 1500 * sc, ry = 980 * sc, a = clamp(1.4 - z * 0.12);
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 7); ctx.lineWidth = Math.max(2, 80 * sc); ctx.strokeStyle = `rgba(150,160,190,${0.7 * a})`; ctx.stroke();
    ctx.lineWidth = Math.max(1, 26 * sc); ctx.strokeStyle = `rgba(232,236,246,${0.8 * a})`; ctx.stroke();
    // handrails at 4 and 8 o'clock, and a light on top
    for (const ang of [0.6, 2.55]) { const x = cx + Math.cos(ang) * rx * 0.85, y = cy + Math.sin(ang) * ry * 0.85; rrect(ctx, x - 70 * sc, y - 10 * sc, 140 * sc, 20 * sc, 10 * sc); ctx.fillStyle = `rgba(232,184,48,${a})`; ctx.fill(); }
    softDot(ctx, cx, cy - ry * 0.92, 260 * sc, '#FFF2D8', 0.5 * a);
    if (red > 0.01) softDot(gctx, cx + rx * 0.7, cy - ry * 0.7, 220 * sc, '#FF2A3A', red * a * (0.5 + 0.5 * Math.sin(t * 10 + i)));
  }
  // cable bundles along the walls
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx + s * 1100, -100); ctx.quadraticCurveTo(cx + s * 300, cy - 40, cx + s * 30, cy); ctx.lineWidth = 20; ctx.strokeStyle = 'rgba(60,70,100,0.5)'; ctx.stroke(); }
  if (red > 0.01) { ctx.fillStyle = `rgba(255,30,50,${0.12 * red * (0.5 + 0.5 * Math.sin(t * 10))})`; ctx.fillRect(0, 0, W, H); }
  if (o.sis) sisFly(o.sis, t);
}
// his sister flying head first toward us (screen space): the rig, turned flat, arms reaching forward
function sisFly(S, t) {
  const st = { x: S.x, y: S.y, s: S.s, face: S.face || FACES.stern, noLegs: false, seed: 3,
    pose: { hipY: -222, lean: 0, armL: { a: 2.6, b: 0.25 }, armR: { a: 2.5, b: 0.35 }, legL: { a: 0.08, b: -0.2 }, legR: { a: 0.14, b: -0.35 }, hand: 'open', feetFront: 1 } };
  lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.clearRect(0, 0, W, H);
  lctx.translate(S.x, S.y - 300 * S.s); lctx.rotate(S.rot || 0); lctx.translate(-S.x, -(S.y - 300 * S.s));
  drawCharacter(lctx, st, t, SISPAL);
  sisHair(lctx, st);
  // speed lines behind her
  lctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (let i = 0; i < 8; i++) { const a = i * 0.8 + 0.3, r0 = 260 * S.s, r1 = r0 + 300 * S.s; line(ctx, S.x + Math.cos(a) * r0, S.y - 300 * S.s + Math.sin(a) * r0, S.x + Math.cos(a) * r1, S.y - 300 * S.s + Math.sin(a) * r1, 4, `rgba(255,255,255,${0.35 * (S.fly || 1)})`); }
  ctx.drawImage(layerC, 0, 0); occludeGlow();
}

// ---------------------------------------------------------------- Pip's bedroom at night (world units)
// o: {pip: {face, tablet 0..1 (holding it up), screen}, fishT, moon, station 0..1 (the bright dot crossing the window)}
let PIP_ROOM = null;
function pipPaintRoom() {
  const cv = mkCanvas(W * 2, H * 2), c = cv.getContext('2d'); c.scale(2, 2);
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2A2550'); g.addColorStop(1, '#141230'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  // wallpaper stars
  const r = mulberry32(12);
  for (let i = 0; i < 60; i++) { const x = r() * W, y = r() * 760; c.save(); c.translate(x, y); c.rotate(r()); c.fillStyle = 'rgba(255,220,150,0.12)'; c.beginPath(); for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5, rr = k % 2 ? 4 : 10; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } c.closePath(); c.fill(); c.restore(); }
  // the window frame (right): its inside is drawn live
  rrect(c, 1020, 110, 760, 560, 18); c.fillStyle = '#4A3A6A'; c.fill();
  // curtains
  for (const [x, s] of [[990, -1], [1810, 1]]) { c.beginPath(); c.moveTo(x, 80); c.quadraticCurveTo(x + s * 60, 380, x - s * 10, 720); c.lineTo(x + s * 120, 720); c.quadraticCurveTo(x + s * 150, 380, x + s * 110, 80); c.closePath(); c.fillStyle = '#7A4A9A'; c.fill(); }
  // the sill and a shelf with a desk lamp; the bed (left) with a blanket
  rrect(c, 980, 668, 840, 40, 10); c.fillStyle = '#E8D8C0'; c.fill();
  rrect(c, -40, 760, 900, 380, 40); c.fillStyle = '#5A3A8A'; c.fill();
  rrect(c, -40, 740, 900, 70, 30); c.fillStyle = '#FF86A6'; c.fill();
  for (let i = 0; i < 6; i++) circle(c, 80 + i * 140, 900, 26, 'rgba(255,212,71,0.35)');
  rrect(c, 60, 640, 240, 130, 50); c.fillStyle = '#F4EEF8'; c.fill();                                  // the pillow
  const fg = c.createLinearGradient(0, 860, 0, H); fg.addColorStop(0, '#3A2A50'); fg.addColorStop(1, '#1A1428'); c.fillStyle = fg; c.fillRect(860, 860, W, 300);
  // posters: a rocket, a fish
  rrect(c, 440, 170, 230, 300, 12); c.fillStyle = '#F4EEE0'; c.fill();
  c.save(); c.translate(555, 320); c.fillStyle = '#FF5A6E'; c.beginPath(); c.moveTo(0, -110); c.quadraticCurveTo(46, -40, 34, 70); c.lineTo(-34, 70); c.quadraticCurveTo(-46, -40, 0, -110); c.fill(); circle(c, 0, -20, 20, '#7FE9FF'); c.fillStyle = '#FFD447'; c.beginPath(); c.moveTo(-20, 70); c.lineTo(0, 120); c.lineTo(20, 70); c.fill(); c.restore();
  return cv;
}
function pipRoom(cam, t, o = {}) {
  if (!PIP_ROOM) PIP_ROOM = pipPaintRoom();
  screenSpace(); ctx.fillStyle = '#141230'; ctx.fillRect(0, 0, W, H);
  applyCam(cam);
  ctx.drawImage(PIP_ROOM, 0, 0, W, H);
  // the night sky in the window, the moon, and (o.station) a bright dot crossing it
  ctx.save(); rrect(ctx, 1040, 130, 720, 520, 10); ctx.clip();
  spaceField(ctx, 1040, 130, 720, 520, t, { starS: 1.2 });
  const sg = ctx.createLinearGradient(0, 420, 0, 650); sg.addColorStop(0, 'rgba(60,40,120,0)'); sg.addColorStop(1, 'rgba(120,80,160,0.6)'); ctx.fillStyle = sg; ctx.fillRect(1040, 420, 720, 230);
  for (let i = 0; i < 9; i++) { const x = 1040 + i * 85, h = 40 + 70 * hash(i * 3); ctx.fillStyle = '#1A1630'; ctx.fillRect(x, 650 - h, 70, h); if (hash(i) > 0.4) { ctx.fillStyle = '#FFD98A'; ctx.fillRect(x + 20, 650 - h + 14, 12, 12); } }
  circle(ctx, 1630, 230, 44, '#F4EED8'); softDot(gctx, 1630, 230, 120, '#F4EED8', 0.6);
  if (o.station > 0.01) { const sx = lerp(1060, 1760, o.station), sy = 300 - 60 * Math.sin(o.station * Math.PI); circle(ctx, sx, sy, 6, '#FFFFFF'); softDot(gctx, sx, sy, 40, '#FFFFFF', 0.9); }
  ctx.restore();
  for (const x of [1400]) line(ctx, x, 130, x, 650, 14, '#4A3A6A');
  line(ctx, 1040, 390, 1760, 390, 14, '#4A3A6A');
  // the goldfish bowl on the sill
  fishBowl(ctx, 1210, 590, 1, t, o);
  // a night light
  circle(ctx, 1700, 640, 22, '#FFE08A'); softDot(gctx, 1700, 640, 120, '#FFD98A', 0.7); softDot(ctx, 1700, 640, 200, '#FFD98A', 0.15);
  if (o.pip) pipKid(cam, t, o.pip);
}
// the bowl (x, y the middle of its water; s 1 = 200 px across), with the fish swimming in it
function fishBowl(c, x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  ellipse(c, 0, 92, 70, 12, 'rgba(0,0,0,0.3)');
  c.beginPath(); c.arc(0, 0, 100, 0, 7); c.fillStyle = 'rgba(170,220,255,0.10)'; c.fill();
  c.save(); c.beginPath(); c.arc(0, 0, 100, 0, 7); c.clip();
  const wg = c.createLinearGradient(0, -60, 0, 100); wg.addColorStop(0, 'rgba(110,190,255,0.55)'); wg.addColorStop(1, 'rgba(40,90,200,0.7)'); c.fillStyle = wg; c.fillRect(-110, -60, 220, 170);
  rrect(c, -80, 70, 160, 30, 10); c.fillStyle = '#E8C890'; c.fill();                                  // gravel
  for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-50 + i * 40, 90); c.quadraticCurveTo(-60 + i * 40 + 12 * Math.sin(t * 2 + i), 30, -46 + i * 40, -10); c.lineWidth = 6; c.strokeStyle = '#3FA35C'; c.stroke(); }
  const fx = 40 * Math.sin((o.fishT === undefined ? t : o.fishT) * 0.7), fy = 15 * Math.sin(t * 1.3);
  goldfish(c, fx, fy, 0.5, t, { flip: Math.cos(t * 0.7) < 0 });
  for (let i = 0; i < 4; i++) { const ph = (t * 0.4 + i * 0.25) % 1; circle(c, fx + 20 + 6 * Math.sin(t * 3 + i), fy - 10 - 70 * ph, 3 + 2 * ph, `rgba(230,245,255,${0.8 * (1 - ph)})`); }
  c.restore();
  // the glass: the rim and two highlights
  c.beginPath(); c.ellipse(0, -62, 62, 10, 0, 0, 7); c.lineWidth = 5; c.strokeStyle = 'rgba(220,240,255,0.8)'; c.stroke();
  c.beginPath(); c.arc(0, 0, 100, 0, 7); c.lineWidth = 4; c.strokeStyle = 'rgba(220,240,255,0.55)'; c.stroke();
  c.beginPath(); c.arc(0, 0, 86, Math.PI * 1.1, Math.PI * 1.4); c.lineWidth = 9; c.lineCap = 'round'; c.strokeStyle = 'rgba(255,255,255,0.6)'; c.stroke();
  if (o.photo > 0.01) {   // the selfie, printed and leaning on the bowl
    c.save(); c.translate(130, 40); c.rotate(0.12); const k = E.outBack(clamp(o.photo), 1.7); c.scale(k, k);
    rrect(c, -60, -76, 120, 152, 6); c.fillStyle = '#FFFFFF'; c.fill();
    c.save(); rrect(c, -52, -68, 104, 116, 4); c.clip(); spaceField(c, -52, -68, 104, 116, 0); earthLimb(c, 20, 150, 140, 0, { glowCtx: false, line: 0.03 });
    c.save(); c.translate(-14, -12); c.scale(0.24, 0.24); alHelmet(c, 0, 0, 1, 0); c.restore(); c.save(); c.translate(22, -6); c.scale(0.22, 0.22); alHelmet(c, 0, 0, 1, 0); c.restore(); c.restore();
    c.restore();
  }
  c.restore();
}
// Pip (kitchen.js's KPIP palette, in pyjamas) sitting on her bed, holding a tablet
const PIP_PJ = Object.assign({}, PAL, { coat: '#FF86A6', coatSh: '#D8607E', coatHi: '#FFB8CB', coatDk: '#B03A66', strap: '#FF86A6', strapSh: '#D8607E', pants: '#7A5AD8', pantsSh: '#5A40A8', pj: true });
function pipKid(cam, t, P) {
  const st = { x: P.x || 720, y: P.y || 840, s: P.s || 0.5, face: P.face || FACES.happy, noLegs: true, seed: 9,
    pose: { hipY: -34, lean: 0, armL: { a: 0.3, b: 0.2 }, armR: { a: 0.3, b: 0.2 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, hand: 'open', feetFront: 1 } };
  st.pose = ikReach(st.pose, 'L', [-40, -150], -1); st.pose = ikReach(st.pose, 'R', [40, -150], 1);
  lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.clearRect(0, 0, W, H);
  camTransform(lctx, cam, 1);
  const r = drawCharacter(lctx, st, t, PIP_PJ);
  lctx.save(); lctx.translate(st.x, st.y); lctx.scale(st.s, st.s);
  if (typeof pigtails2 === 'function') pigtails2(lctx, r, st, t); else pipTails(lctx, r, st, t);
  // the tablet she holds up, its back to us with its screen glow on her face
  const k = P.tablet === undefined ? 1 : P.tablet;
  if (k > 0.01) { rrect(lctx, -80, -250, 160, 110, 12); lctx.fillStyle = '#2A2E44'; lctx.fill(); circle(lctx, 0, -195, 6, '#5A607E'); }
  lctx.restore();
  lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.globalCompositeOperation = 'source-atop';
  lctx.fillStyle = 'rgba(40,30,90,0.28)'; lctx.fillRect(0, 0, W, H);
  const [hx, hy] = toScreen(cam, st.x, st.y - 280 * st.s);
  const g = lctx.createRadialGradient(hx, hy + 40 * cam.zoom, 10, hx, hy, 260 * cam.zoom); g.addColorStop(0, `rgba(170,220,255,${0.35 * k})`); g.addColorStop(1, 'rgba(170,220,255,0)');
  lctx.fillStyle = g; lctx.fillRect(0, 0, W, H);
  lctx.globalCompositeOperation = 'source-over';
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(layerC, 0, 0); occludeGlow();
  return { st, r };
}
// Pip's pigtails (kitchen.js's pigtails2, in case it is not loaded)
function pipTails(c, r, st, t) {
  const [hx, hy] = r.head;
  c.save(); c.translate(hx + (st.headDX || 0), hy + (st.headDY || 0)); c.rotate(r.lean + (st.headRot || 0));
  for (const s of [-1, 1]) {
    const sw = 0.12 * Math.sin(t * 7 + s);
    c.save(); c.translate(s * 60, -36); c.rotate(s * (0.5 + sw));
    ellipse(c, s * 34, 6, 40, 26, PAL.hair, s * 0.2); ellipse(c, s * 52, 14, 22, 16, PAL.hair, s * 0.4);
    circle(c, s * 2, 2, 13, '#FFD447');
    c.restore();
  }
  c.beginPath(); c.moveTo(-60, -20); c.quadraticCurveTo(-40, -2, -20, -24); c.quadraticCurveTo(0, -4, 20, -26); c.quadraticCurveTo(42, -4, 60, -20);
  c.lineTo(56, -52); c.lineTo(-56, -52); c.closePath(); c.fillStyle = PAL.hair; c.fill();
  c.restore();
}

// ---------------------------------------------------------------- 1960: the open gondola, nineteen miles up (world units)
// o: {swell 0..1 (his right hand), look (his head turn), alt (the altimeter's reading)}
function gondola(cam, t, o = {}) {
  screenSpace();
  const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#02030A'); sky.addColorStop(0.7, '#0A1430'); sky.addColorStop(1, '#2A5AA8');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  applyCam(cam);
  // the Earth's curve far below with its thin blue line
  earthLimb(ctx, 960, 3900, 3000, t, { line: 0.012 });
  // the balloon above: a huge pale envelope going out of the top of the frame, and its rigging
  ctx.beginPath(); ctx.moveTo(760, -900); ctx.quadraticCurveTo(560, -200, 900, 120); ctx.lineTo(1020, 120); ctx.quadraticCurveTo(1360, -200, 1160, -900); ctx.closePath();
  ctx.fillStyle = 'rgba(220,226,240,0.85)'; ctx.fill();
  for (let i = 0; i < 6; i++) line(ctx, 800 + i * 64, -700, 900 + i * 24, 120, 3, 'rgba(160,170,200,0.6)');
  for (const dx of [-90, -30, 30, 90]) line(ctx, 960 + dx * 0.3, 120, 960 + dx, 360, 4, '#4A4E5A');
  // the gondola: an open box with a rail, a bench; him standing in the door in a pressure suit and helmet
  rrect(ctx, 820, 360, 280, 240, 10); ctx.fillStyle = '#B8B2A4'; ctx.fill();
  rrect(ctx, 840, 380, 240, 200, 6); ctx.fillStyle = '#3A3830'; ctx.fill();
  ctx.font = '900 30px Montserrat'; ctx.textAlign = 'center'; ctx.fillStyle = '#E8E2D0'; ctx.fillText('EXCELSIOR', 960, 640);
  // the man: a pale pressure suit, a helmet with a visor
  const mx = 960, my = 560;
  rrect(ctx, mx - 60, my - 170, 120, 170, 40); ctx.fillStyle = '#C8C0A8'; ctx.fill();
  circle(ctx, mx, my - 210, 62, '#D8D2C0'); circle(ctx, mx, my - 206, 44, '#20283A'); ellipse(ctx, mx - 14, my - 222, 14, 8, 'rgba(255,255,255,0.5)', -0.4);
  // his left arm resting; his right arm up, the glove: it swells
  line(ctx, mx - 50, my - 140, mx - 90, my - 40, 34, '#C8C0A8'); circle(ctx, mx - 92, my - 30, 22, '#8A8070');
  line(ctx, mx + 50, my - 140, mx + 120, my - 220, 34, '#C8C0A8');
  const sw = o.swell || 0;
  ctx.save(); ctx.translate(mx + 132, my - 240); ctx.rotate(-0.6);
  ellipse(ctx, 0, 0, 24 + 30 * sw, 28 + 34 * sw, '#E8B898');                       // the bare hand inside the failed glove
  for (let i = 0; i < 4; i++) ellipse(ctx, -16 + i * 11 * (1 + 0.6 * sw), -30 - 22 * sw, 6 + 6 * sw, 14 + 10 * sw, '#E8B898');
  ctx.restore();
  if (sw > 0.05) { softDot(gctx, mx + 132, my - 240, 90 + 90 * sw, '#FF6A5A', 0.4 * sw); }
}

// ---------------------------------------------------------------- 1966: the vacuum chamber in Houston (world units)
// o: {hose 0..1 (it comes loose), fog 0..1 (the visor fogs), fall 0..1 (he sags), air 0..1 (the air rushing back), eng 0..1 (the engineers react)}
function chamber66(cam, t, o = {}) {
  screenSpace(); ctx.fillStyle = '#1A1A18'; ctx.fillRect(0, 0, W, H);
  applyCam(cam);
  // the steel wall of the chamber, rivets, and the round window we look through
  ctx.fillStyle = '#6A6E70'; ctx.fillRect(-400, -200, W + 800, H + 400);
  for (let y = -160; y < H + 200; y += 90) for (let x = -360; x < W + 400; x += 90) circle(ctx, x, y, 5, '#4A4E50');
  const wx = 860, wy = 470, wr = 380;
  circle(ctx, wx, wy, wr + 50, '#3A3E40'); circle(ctx, wx, wy, wr + 30, '#8A8E90');
  ctx.save(); ctx.beginPath(); ctx.arc(wx, wy, wr, 0, 7); ctx.clip();
  // inside: a pale room, a treadmill-like platform, the suited man; the hose from his chest to the wall
  const ig = ctx.createLinearGradient(0, wy - wr, 0, wy + wr); ig.addColorStop(0, '#C8CCC4'); ig.addColorStop(1, '#8A8E86'); ctx.fillStyle = ig; ctx.fillRect(wx - wr, wy - wr, 2 * wr, 2 * wr);
  rrect(ctx, wx - 260, wy + 200, 520, 60, 10); ctx.fillStyle = '#4A4E4A'; ctx.fill();
  const fall = o.fall || 0, mx = wx + 40, my = wy + 200;
  ctx.save(); ctx.translate(mx, my); ctx.rotate(-0.5 * fall); ctx.translate(-mx, -my);
  for (const s of [-1, 1]) line(ctx, mx + s * 34, my - 160, mx + s * 40, my - 10, 52, '#E2DCC8');            // legs
  rrect(ctx, mx - 80, my - 330, 160, 190, 50); ctx.fillStyle = '#E8E2D0'; ctx.fill();                            // torso
  rrect(ctx, mx - 50, my - 300, 100, 70, 12); ctx.fillStyle = '#B8B2A0'; ctx.fill();                             // the chest unit
  for (const s of [-1, 1]) line(ctx, mx + s * 76, my - 300, mx + s * 110, my - 180 + 40 * fall, 40, '#E2DCC8');   // arms
  circle(ctx, mx, my - 390, 74, '#E8E2D0'); circle(ctx, mx, my - 386, 56, '#202428');                              // the helmet and visor
  const fog = o.fog || 0;
  if (fog > 0.01) circle(ctx, mx, my - 386, 56, `rgba(235,235,230,${0.8 * fog})`);
  ellipse(ctx, mx - 18, my - 404, 16, 9, 'rgba(255,255,255,0.45)', -0.4);
  ctx.restore();
  // the hose: from the chest unit to the wall; it comes loose and whips
  const hk = o.hose || 0, ax = mx + 40, ay = my - 270;
  const ex = lerp(wx + 330, ax + 140 + 60 * Math.sin(t * 20) * hk, hk), ey = lerp(wy - 40, ay + 40 + 40 * Math.cos(t * 17) * hk, hk);
  ctx.beginPath(); ctx.moveTo(ax, ay); ctx.quadraticCurveTo(lerp(ax + 160, ax + 80, hk), lerp(ay - 120, ay + 60, hk), ex, ey); ctx.lineWidth = 18; ctx.strokeStyle = '#3A3E3A'; ctx.stroke();
  if (hk > 0.05) for (let i = 0; i < 6; i++) softDot(ctx, ax + 20 + i * 18 * hk, ay + 6 * Math.sin(i + t * 8), 18 + 10 * i * hk, '#FFFFFF', 0.35 * (1 - i / 6) * Math.min(1, hk * 2) * (1 - (o.air || 0)));
  // the air rushing back in: swirls
  if (o.air > 0.01) for (let i = 0; i < 20; i++) { const a = t * 3 + i, rr = 60 + 300 * hash(i); softDot(ctx, wx + Math.cos(a) * rr, wy + Math.sin(a) * rr * 0.6, 50, '#FFFFFF', 0.12 * o.air); }
  ctx.restore();
  // the window's glass
  ctx.beginPath(); ctx.arc(wx, wy, wr - 10, Math.PI * 1.1, Math.PI * 1.45); ctx.lineWidth = 16; ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.stroke();
  for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283; circle(ctx, wx + Math.cos(a) * (wr + 40), wy + Math.sin(a) * (wr + 40), 9, '#2A2E30'); }
  // engineers outside, seen from behind on the right (silhouettes in white shirts), and a big valve wheel
  const eng = o.eng || 0;
  for (const [x, y, s, d] of [[1460, 900, 1, 0], [1700, 930, 0.92, 0.3]]) {
    const lean = -0.15 * eng;
    ctx.save(); ctx.translate(x, y); ctx.rotate(lean); ctx.scale(s, s);
    rrect(ctx, -110, -330, 220, 360, 70); ctx.fillStyle = '#E8E4DA'; ctx.fill();
    circle(ctx, 0, -400, 74, '#2A2018'); ellipse(ctx, 0, -360, 70, 40, '#C8987A');
    rrect(ctx, -12, -330, 24, 120, 6); ctx.fillStyle = '#2A2E3A'; ctx.fill();
    ctx.restore();
  }
  const vx = 1580, vy = 420, va = (o.valve || 0) * 6;
  circle(ctx, vx, vy, 120, '#9A2A1E'); circle(ctx, vx, vy, 96, '#6A6E70');
  for (let i = 0; i < 5; i++) { const a = va + i * 1.256; line(ctx, vx, vy, vx + Math.cos(a) * 110, vy + Math.sin(a) * 110, 18, '#9A2A1E'); }
  circle(ctx, vx, vy, 26, '#3A3E40');
}

// ---------------------------------------------------------------- the thermos in section (screen space)
// k 0..1 pops it in; heat 0..1 (orange heat arrows bounce back off the gap); x, y its middle
function thermos(x, y, s, k, t, o = {}) {
  if (k <= 0.01) return;
  const sc = s * E.outBack(clamp(k), 1.6);
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  rrect(ctx, -170, -330, 340, 640, 60); ctx.fillStyle = '#C8102E'; ctx.fill();                                    // the outer wall
  rrect(ctx, -150, -310, 300, 600, 50); ctx.fillStyle = '#08091A'; ctx.fill();                                    // the gap: nothing
  rrect(ctx, -110, -280, 220, 540, 40); ctx.fillStyle = '#D8DCE6'; ctx.fill();                                    // the inner wall
  rrect(ctx, -96, -250, 192, 496, 34); const cg = ctx.createLinearGradient(0, -250, 0, 246); cg.addColorStop(0, '#8A4A1E'); cg.addColorStop(1, '#4A2410'); ctx.fillStyle = cg; ctx.fill();
  rrect(ctx, -120, -400, 240, 90, 22); ctx.fillStyle = '#2A2E44'; ctx.fill();                                     // the lid
  for (let i = 0; i < 3; i++) { const ph = (t * 0.6 + i / 3) % 1; ctx.beginPath(); ctx.moveTo(-30 + i * 30, -420 - 120 * ph); ctx.quadraticCurveTo(-10 + i * 30 + 20 * Math.sin(t * 3 + i), -460 - 120 * ph, -30 + i * 30, -500 - 120 * ph); ctx.lineWidth = 8; ctx.strokeStyle = `rgba(255,255,255,${0.5 * (1 - ph)})`; ctx.stroke(); }
  // heat: arrows from the coffee that hit the gap and bounce back
  const ht = o.heat || 0;
  if (ht > 0.01) for (let i = 0; i < 6; i++) {
    const yy = -200 + i * 80, sd = i % 2 ? 1 : -1, ph = (t * 1.2 + i * 0.17) % 1;
    const xx = sd * (40 + 90 * Math.sin(ph * Math.PI));
    line(ctx, sd * 30, yy, xx, yy - 10, 8, `rgba(255,154,60,${ht})`);
    ctx.save(); ctx.translate(xx, yy - 10); ctx.rotate(sd > 0 ? (ph < 0.5 ? 0 : Math.PI) : (ph < 0.5 ? Math.PI : 0)); ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-4, -10); ctx.lineTo(-4, 10); ctx.closePath(); ctx.fillStyle = `rgba(255,154,60,${ht})`; ctx.fill(); ctx.restore();
  }
  ctx.restore();
}

// ---------------------------------------------------------------- the movies' version: a screen with an exploding astronaut (screen space)
function movieScreen(x, y, s, k, t, o = {}) {
  if (k <= 0.01) return;
  const sc = s * E.outBack(clamp(k), 1.6);
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  rrect(ctx, -330, -200, 660, 400, 18); ctx.fillStyle = '#15182A'; ctx.fill();
  ctx.save(); rrect(ctx, -310, -180, 620, 360, 10); ctx.clip();
  spaceField(ctx, -310, -180, 620, 360, t);
  const b = o.boom || 0;
  if (b < 0.3) {   // a cartoon astronaut, cheeks bulging, about to blow
    const bl = 1 + 1.6 * Math.pow(b / 0.3, 1.5);
    circle(ctx, 0, 10, 60 * bl, '#F2B892'); circle(ctx, -20, 0, 10, '#FFFFFF'); circle(ctx, 20, 0, 10, '#FFFFFF'); circle(ctx, -20, 0, 5, '#111'); circle(ctx, 20, 0, 5, '#111');
  } else {         // BOOM: a comic burst
    const kk = E.outBack(clamp((b - 0.3) / 0.3), 2);
    ctx.save(); ctx.scale(kk, kk); ctx.beginPath();
    for (let i = 0; i < 24; i++) { const a = i / 24 * 6.283, rr = i % 2 ? 90 : 170; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    ctx.closePath(); ctx.fillStyle = '#FFD447'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = '#FF5A2E'; ctx.stroke();
    ctx.font = '400 90px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#C8102E'; ctx.fillText('BOOM!', 0, 4);
    ctx.restore();
  }
  ctx.restore();
  ctx.font = '800 28px Montserrat'; ctx.textAlign = 'center'; ctx.fillStyle = '#C8CEE0'; ctx.fillText('IN THE MOVIES', 0, 236);
  ctx.restore();
}

// ---------------------------------------------------------------- the air pressing on a palm (screen space)
// k 0..1; press 0..1 (the air arrows push down, the body's arrows push up)
function palmPress(x, y, s, k, t, o = {}) {
  if (k <= 0.01) return;
  const sc = s * E.outBack(clamp(k), 1.5);
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  // the palm, from the side-front: a flat hand, fingers to the right
  ctx.fillStyle = '#F2B892';
  rrect(ctx, -220, -40, 280, 110, 50); ctx.fill();
  for (let i = 0; i < 4; i++) { rrect(ctx, 40, -34 + i * 26, 170 - Math.abs(i - 1.2) * 22, 26, 13); ctx.fill(); }
  rrect(ctx, -120, -96, 120, 50, 25); ctx.fill();                                                                 // the thumb
  rrect(ctx, -380, -20, 180, 80, 30); ctx.fillStyle = '#2E4D9A'; ctx.fill();                                     // his sleeve
  const p = o.press || 0;
  for (let i = 0; i < 7; i++) {
    const ax = -180 + i * 60, d = 40 * Math.sin(t * 4 + i) * 0.15;
    // the air pushing down: blue arrows from above
    const ay0 = -360 + d, ay1 = -80;
    line(ctx, ax, ay0, ax, ay1 - 20 * (1 - p), 10, `rgba(127,233,255,${p})`);
    ctx.beginPath(); ctx.moveTo(ax - 16, ay1 - 30 * (1 - p) - 6); ctx.lineTo(ax + 16, ay1 - 30 * (1 - p) - 6); ctx.lineTo(ax, ay1 - 30 * (1 - p) + 18); ctx.closePath(); ctx.fillStyle = `rgba(127,233,255,${p})`; ctx.fill();
    // the body pushing back: orange arrows from inside the hand, upward
    const bk = o.back || 0;
    if (bk > 0.01) { line(ctx, ax, 20, ax, -40, 8, `rgba(255,154,60,${bk})`); ctx.beginPath(); ctx.moveTo(ax - 13, -36); ctx.lineTo(ax + 13, -36); ctx.lineTo(ax, -56); ctx.closePath(); ctx.fillStyle = `rgba(255,154,60,${bk})`; ctx.fill(); }
  }
  ctx.restore();
}
