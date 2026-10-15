// Why Do Your Ears RING After a Concert? Short: the gig. The front row of a rock show: the stage far behind him (painted
// once, soft), coloured beams from the truss, the crowd's heads and arms, a speaker stack right beside his ear, and the
// hero in a black band tee, headbanging with rock horns up. Also the ring itself (thin lines out of his ears), his head
// as a glass dome with his brain at its amplifier inside, foam earplugs, and a finger wiggling in his ear.
// World units = the frame at zoom 1. The rig's feet are at (CN.hx, CN.floor); rig-local heights (feet at 0): hip -222,
// shoulders -370, head middle -470.
'use strict';

const CN = { hx: 540, floor: 1800, s: 1 };
const CN_HEADY = CN.floor - 470;                  // the head's middle, world y (standing, still)
let CN_STAGE = null;
// a black band tee (the rig's coat with the zip and the straps taken into the cloth), bare forearms
const CNPAL = Object.assign({}, PAL, { coat: '#2A2A40', coatSh: '#1C1C2E', coatHi: '#3C3C5A', coatDk: '#2A2A40', strap: '#2A2A40', strapSh: '#2A2A40', shortSleeve: true });

// ---------------------------------------------------------------- the hall, painted once (soft: it is far away)
function initConcert() {
  const Wc = 900, Hc = 760, cv = mkCanvas(Wc, Hc), c = cv.getContext('2d'), rng = mulberry32(77);
  const g = c.createLinearGradient(0, 0, 0, Hc);
  g.addColorStop(0, '#0A0820'); g.addColorStop(0.45, '#1A1240'); g.addColorStop(0.75, '#2A1548'); g.addColorStop(1, '#120A26');
  c.fillStyle = g; c.fillRect(0, 0, Wc, Hc);
  // the truss across the top, and the cans hanging from it
  c.fillStyle = '#05040E'; c.fillRect(0, 70, Wc, 16); c.fillRect(0, 104, Wc, 10);
  for (let x = 0; x < Wc; x += 26) { c.beginPath(); c.moveTo(x, 86); c.lineTo(x + 13, 104); c.lineTo(x + 26, 86); c.strokeStyle = '#05040E'; c.lineWidth = 3; c.stroke(); }
  for (let i = 0; i < 9; i++) { const x = 40 + i * 104; rrect(c, x - 12, 112, 24, 30, 5); c.fillStyle = '#0C0A1A'; c.fill(); }
  // haze: big soft blobs of coloured smoke
  for (let i = 0; i < 26; i++) {
    const x = rng() * Wc, y = 180 + rng() * 420, r = 60 + rng() * 150, col = ['#7A3AD8', '#D83A9A', '#3A7AD8', '#E0A040'][i % 4];
    const sg = c.createRadialGradient(x, y, 0, x, y, r); sg.addColorStop(0, rgba(col, 0.16)); sg.addColorStop(1, rgba(col, 0));
    c.fillStyle = sg; c.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  // the stage: a riser, the drum kit, two players and amp stacks, all as dark shapes against the haze
  c.fillStyle = '#0B0818'; c.fillRect(0, 520, Wc, 240);
  c.fillStyle = '#150F2C'; c.fillRect(0, 510, Wc, 14);
  for (const x of [80, 740]) { rrect(c, x, 360, 110, 150, 6); c.fillStyle = '#07060F'; c.fill(); rrect(c, x + 6, 300, 98, 60, 6); c.fill(); }
  // drum kit
  c.fillStyle = '#0A0716'; c.beginPath(); c.ellipse(450, 470, 70, 46, 0, 0, 7); c.fill();
  for (const [x, y, r] of [[370, 440, 34], [530, 440, 34], [330, 470, 30], [580, 470, 30]]) { c.beginPath(); c.ellipse(x, y, r, r * 0.42, 0, 0, 7); c.fill(); }
  for (const x of [300, 610]) { c.fillRect(x - 2, 380, 4, 100); c.beginPath(); c.ellipse(x, 380, 44, 8, 0, 0, 7); c.fill(); }
  c.beginPath(); c.arc(450, 392, 26, 0, 7); c.fill(); c.fillRect(424, 410, 52, 60);
  // the two players
  for (const [x, lean] of [[230, -0.12], [660, 0.1]]) {
    c.save(); c.translate(x, 520); c.rotate(lean);
    c.fillStyle = '#08060F';
    c.beginPath(); c.moveTo(-34, 0); c.lineTo(-24, -120); c.lineTo(24, -120); c.lineTo(34, 0); c.closePath(); c.fill();
    c.beginPath(); c.arc(0, -146, 24, 0, 7); c.fill();
    c.save(); c.translate(0, -78); c.rotate(-0.5); rrect(c, -70, -9, 140, 18, 8); c.fill(); c.beginPath(); c.ellipse(-42, 0, 34, 24, 0, 0, 7); c.fill(); c.restore();
    c.restore();
  }
  CN_STAGE = cv;
}
// the lamps on the truss and where their beams point, as a function of time (they sweep on the beat)
function cnLamps(t, lights) {
  const out = [], cols = ['#B45CFF', '#FF4FA8', '#4FB8FF', '#FFB040', '#B45CFF', '#FF4FA8', '#4FB8FF', '#FFB040', '#B45CFF'];
  for (let i = 0; i < 9; i++) {
    const sw = 0.55 * Math.sin(t * 1.7 + i * 0.9) + 0.25 * Math.sin(t * 3.1 + i * 2.1);
    out.push({ i, col: cols[i], ang: Math.PI / 2 + sw * (i % 2 ? 1 : -1), on: lights * (0.6 + 0.4 * Math.sin(t * 5.3 + i * 1.3)) });
  }
  return out;
}
// o: {lights 0..1 (the show; 0 = the house lights after the last chord), strobe 0..1, crowd 0..1 (arms up), soft}
function cnBack(cam, t, o = {}) {
  const lights = o.lights === undefined ? 1 : o.lights, c = ctx;
  screenSpace();
  c.fillStyle = '#05040C'; c.fillRect(0, 0, W, H);
  // the hall far behind: parallax 0.3 against the camera, drawn large and soft
  const px = (cam.x - CN.hx) * 0.3, py = (cam.y - CN_HEADY) * 0.3, z = 0.55 + 0.45 * Math.min(1, cam.zoom / 2.6);
  const ww = 1500 * z * 1.25, hh = 1266 * z * 1.25;
  c.save(); c.translate(W / 2 - px * cam.zoom * 0.25, H * 0.42 - py * cam.zoom * 0.25); c.globalAlpha = 0.35 + 0.65 * lights + 0.18 * (1 - lights);
  c.drawImage(CN_STAGE, -ww / 2, -hh * 0.55, ww, hh);
  c.restore();
  // house lights after the show: a cold wash
  if (lights < 0.99) { c.fillStyle = `rgba(30,44,90,${0.42 * (1 - lights)})`; c.fillRect(0, 0, W, H); }
  // the beams (glow layer only: light in the haze)
  const L = cnLamps(t, lights), top = H * 0.42 - (-hh * 0.55 + 0.17 * hh) * -1;
  const lampY = H * 0.42 - hh * 0.55 + (128 / 760) * hh, lampX0 = W / 2 - ww / 2;
  for (const l of L) {
    if (l.on < 0.02) continue;
    const x = lampX0 + ((40 + l.i * 104) / 900) * ww - px * cam.zoom * 0.25, y = lampY - py * cam.zoom * 0.25;
    const len = 2100, a = l.ang, spread = 0.09;
    gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); gctx.globalCompositeOperation = 'lighter';
    const gr = gctx.createLinearGradient(x, y, x + Math.cos(a) * len, y + Math.sin(a) * len);
    gr.addColorStop(0, rgba(l.col, 0.55 * l.on)); gr.addColorStop(1, rgba(l.col, 0));
    gctx.fillStyle = gr; gctx.beginPath(); gctx.moveTo(x, y);
    gctx.lineTo(x + Math.cos(a - spread) * len, y + Math.sin(a - spread) * len); gctx.lineTo(x + Math.cos(a + spread) * len, y + Math.sin(a + spread) * len);
    gctx.closePath(); gctx.fill(); gctx.restore();
    softDot(gctx, x, y, 46, l.col, 0.9 * l.on); circle(c, x, y, 7, rgba('#FFFFFF', 0.7 * l.on));
  }
  if ((o.strobe || 0) > 0.01) { c.fillStyle = `rgba(255,240,255,${0.10 * o.strobe})`; c.fillRect(0, 0, W, H); }
  void top;
}
// the crowd round him: heads and raised arms as dark shapes, in the world (behind him); bob on the beat
function cnCrowd(cam, t, o = {}) {
  applyCam(cam);
  const c = ctx, up = o.crowd === undefined ? 1 : o.crowd, bob = o.bob || 0;
  const P = [[150, 1430, 1.05, 1], [300, 1470, 1.1, 0], [830, 1440, 1.08, 1], [990, 1475, 1.12, 0], [60, 1520, 1.2, 0], [1060, 1380, 0.95, 1], [-60, 1400, 1.0, 1]];
  P.forEach(([x, y, s, arm], i) => {
    const b = bob * (8 + 4 * (i % 3)) * (i % 2 ? 1 : 0.7);
    c.save(); c.translate(x, y + b); c.scale(s, s);
    c.fillStyle = '#0E0A1C';
    c.beginPath(); c.moveTo(-110, 400); c.quadraticCurveTo(-104, 90, -46, 74); c.lineTo(46, 74); c.quadraticCurveTo(104, 90, 110, 400); c.closePath(); c.fill();
    c.beginPath(); c.ellipse(0, 0, 58, 66, 0, 0, Math.PI * 2); c.fill();
    paint(() => { c.beginPath(); c.ellipse(0, 0, 58, 66, 0, Math.PI * 1.1, Math.PI * 1.75); c.lineWidth = 5; c.strokeStyle = 'rgba(200,140,255,0.32)'; c.stroke(); });
    if (arm && up > 0.02) {
      const sd = i % 4 < 2 ? 1 : -1, ay = lerp(60, -190, up) + 12 * Math.sin(t * 7 + i);
      line(c, sd * 70, 110, sd * 100, ay + 40, 34, '#0E0A1C'); circle(c, sd * 102, ay + 20, 26, '#0E0A1C');
      line(c, sd * 96, ay + 8, sd * 90, ay - 44, 11, '#0E0A1C'); line(c, sd * 116, ay + 8, sd * 124, ay - 40, 11, '#0E0A1C');   // horns
    }
    c.restore();
  });
}
// the speaker stack beside him (world): a cabinet with two big cones; pump 0..1 pushes the cones out
function cnSpeaker(cam, x, y, s, t, pump = 0) {
  applyCam(cam);
  const c = ctx;
  c.save(); c.translate(x, y); c.scale(s, s);
  rrect(c, -170, -420, 340, 840, 22); c.fillStyle = '#121220'; c.fill();
  rrect(c, -156, -406, 312, 812, 16); c.fillStyle = '#1B1B2C'; c.fill();
  paint(() => { for (let yy = -390; yy < 400; yy += 18) line(c, -150, yy, 150, yy, 2, 'rgba(255,255,255,0.03)'); });
  for (const [cy, r] of [[-200, 128], [190, 128]]) {
    const k = 1 + 0.06 * pump;
    circle(c, 0, cy, r + 14, '#0A0A14');
    circle(c, 0, cy, r * k, '#26263C');
    paint(() => {
      for (let i = 1; i <= 3; i++) { c.beginPath(); c.arc(0, cy, r * k * (1 - i * 0.2), 0, 7); c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,0.35)'; c.stroke(); }
      const hg = c.createRadialGradient(-r * 0.3, cy - r * 0.3, 4, 0, cy, r * k); hg.addColorStop(0, 'rgba(255,255,255,0.10)'); hg.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = hg; c.beginPath(); c.arc(0, cy, r * k, 0, 7); c.fill();
    });
    circle(c, 0, cy, 34 * (1 + 0.12 * pump), '#3A3A56');
  }
  // the brand plate: a small lit logo
  rrect(c, -46, -20, 92, 30, 8); c.fillStyle = '#0C0C16'; c.fill();
  paint(() => { c.font = '900 20px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#C9C9E6'; c.fillText('LOUD', 0, -4); });
  c.restore();
}
// sound leaving a cone: fat rings (world), k = how loud
function cnBlast(cam, x, y, t, k, dir = 1) {
  if (k <= 0.02) return;
  applyCam(cam);
  for (let i = 0; i < 3; i++) {
    const u = (((t * 2.6 + i / 3) % 1) + 1) % 1, r = 60 + u * 300, a = k * (1 - u);   // t can be negative (the loop)
    for (const cc of [ctx, gctx]) {
      cc.beginPath(); cc.arc(x, y, r, -0.9 * dir + (dir < 0 ? Math.PI : 0), 0.9 * dir + (dir < 0 ? Math.PI : 0), dir < 0);
      cc.lineWidth = cc === ctx ? 9 * a + 1 : 18 * a; cc.strokeStyle = cc === ctx ? rgba('#FFB4E0', 0.55 * a) : rgba('#FF6AC8', 0.7 * a); cc.stroke();
    }
  }
}

// ---------------------------------------------------------------- him
// arms as {e: elbow, w: wrist} (rig-local)
const CN_ARM = {
  hornsR: { e: [150, -432], w: [132, -560] },          // rock horns up beside his head
  downR: { e: [96, -262], w: [92, -158] },
  downL: { e: [-104, -272], w: [-74, -176] },
  pumpL: { e: [-150, -400], w: [-112, -520] },          // the other fist up
  earL: { e: [-150, -392], w: [-88, -466] },            // a finger in his left ear
  earR: { e: [150, -392], w: [88, -466] },
  plugL: { e: [-146, -398], w: [-82, -470] },           // pushing an earplug in
  plugR: { e: [146, -398], w: [82, -470] },
};
function cnSt(A = {}) {
  let p = { hipY: -222 + (A.bob || 0), lean: A.lean || 0, armL: { a: 0.2, b: 0.1 }, armR: { a: 0.2, b: 0.1 }, legL: { a: 0.07, b: 0 }, legR: { a: 0.07, b: 0 }, hand: 'fist', feetFront: 0 };
  const aL = A.armL || CN_ARM.downL, aR = A.armR || CN_ARM.hornsR;
  p = armAt(p, 'L', aL.e, aL.w); p = armAt(p, 'R', aR.e, aR.w);
  return { x: CN.hx + (A.dx || 0), y: CN.floor + (A.dy || 0), s: CN.s, pose: p, face: A.face || FACES.calm, headDX: A.headDX || 0, headDY: A.headDY || 0, headRot: A.headRot || 0, frizz: A.frizz || 0, noLegs: true, seed: 4 };
}
function cnHeadPt(st, lx, ly) {
  const r = rig(st.pose), a = r.lean + (st.headRot || 0), cs = Math.cos(a), sn = Math.sin(a);
  const hx = r.head[0] + (st.headDX || 0) + lx * cs - ly * sn, hy = r.head[1] + (st.headDY || 0) + lx * sn + ly * cs;
  return [st.x + hx * st.s, st.y + hy * st.s];
}
// a fist with the index and little fingers up: rock horns (rig units, at the wrist, pointing along d)
function cnHorns(c, wr, d, pal, k = 1) {
  const a = Math.atan2(d[1], d[0]), hx = wr[0] + d[0] * 16, hy = wr[1] + d[1] * 16;
  c.save(); c.translate(hx, hy); c.rotate(a + Math.PI / 2);   // local: -y = where the fingers point
  // the two fingers, straight up from the fist's corners (the little one shorter)
  for (const [x, len, w] of [[-15, 44, 12], [15, 36, 11]]) { rrect(c, x - w / 2, -16 - len * k, w, len * k + 12, w / 2); c.fillStyle = pal.skin; c.fill(); }
  rrect(c, -24, -22, 48, 40, 14); c.fillStyle = pal.skin; c.fill();
  paint(() => {
    // the two folded fingers between them, and the thumb across the front
    for (const x of [-5, 5]) { c.beginPath(); c.arc(x, -20, 6, Math.PI, 0); c.lineWidth = 3; c.strokeStyle = pal.skinSh; c.stroke(); }
    rrect(c, -18, -2, 30, 11, 5); c.fillStyle = pal.skinSh; c.fill(); rrect(c, -17, -3, 28, 9, 4); c.fillStyle = pal.skin; c.fill();
  });
  c.restore();
}
// black in the glow layer where he stands, so the beams behind him do not shine through him (world, after him)
function cnOcclude(cam, H) {
  const st = H.st, r = rig(st.pose), P = (p) => [st.x + p[0] * st.s, st.y + p[1] * st.s];
  camTransform(gctx, cam, 0.5);
  gctx.save(); gctx.fillStyle = '#000000'; gctx.strokeStyle = '#000000'; gctx.lineCap = 'round';
  gctx.beginPath(); gctx.ellipse(H.head[0], H.head[1] - 4, 72, 82, 0, 0, Math.PI * 2); gctx.fill();
  const sl = P(r.shL), sr = P(r.shR), hip = P(r.P);
  gctx.beginPath(); gctx.moveTo(sl[0] - 20, sl[1] - 10); gctx.lineTo(sr[0] + 20, sr[1] - 10); gctx.lineTo(sr[0] + 14, hip[1] + 60); gctx.lineTo(sl[0] - 14, hip[1] + 60); gctx.closePath(); gctx.fill();
  for (const k of ['L', 'R']) { const a = P(r['sh' + k]), b = P(r['el' + k]), w = P(r['wr' + k]); gctx.lineWidth = 46; gctx.beginPath(); gctx.moveTo(a[0], a[1]); gctx.lineTo(b[0], b[1]); gctx.lineTo(w[0], w[1]); gctx.stroke(); gctx.beginPath(); gctx.arc(w[0] + r['armDir' + k][0] * 30, w[1] + r['armDir' + k][1] * 30, 40, 0, 7); gctx.fill(); }
  gctx.restore();
}
// the band print on his tee (rig units): a yellow bolt in a ring
function cnTeeLogo(c) {
  paint(() => {
    c.save(); c.translate(0, -118);
    c.beginPath(); c.arc(0, 0, 34, 0, 7); c.lineWidth = 7; c.strokeStyle = '#FFD447'; c.stroke();
    c.beginPath(); c.moveTo(6, -26); c.lineTo(-12, 4); c.lineTo(2, 4); c.lineTo(-6, 26); c.lineTo(14, -6); c.lineTo(0, -6); c.closePath(); c.fillStyle = '#FFD447'; c.fill();
    c.restore();
  });
}
// a foam earplug (rig units at an ear: side -1 / 1), k = how far in
function cnPlug(c, ear, side, k) {
  if (k <= 0.01) return;
  const out = (1 - k) * 22;
  c.save(); c.translate(ear[0] + side * (6 + out), ear[1]); c.rotate(side * 0.2);
  rrect(c, -13, -17, 26, 34, 11); c.fillStyle = '#FF8A2C'; c.fill();
  paint(() => { line(c, -9, -6, 9, -6, 2.5, 'rgba(160,60,10,0.5)'); line(c, -9, 5, 9, 5, 2.5, 'rgba(160,60,10,0.5)'); });
  c.restore();
}
// the head as a glass dome with the brain at its amplifier inside (rig units, head-local after the head's transform).
// g: 0..1 how far the glass has wiped down over the head; B: {mood, look, knob 0..11, level, ring, reach, t}
function cnGlassHead(c, face, pal, g, B) {
  if (g <= 0.01) return;
  c.save();
  c.beginPath(); c.ellipse(0, 0, 66, 72, 0, 0, Math.PI * 2); c.clip();
  c.beginPath(); c.rect(-80, -80, 160, 10 + 150 * g); c.clip();
  paint(() => {
    const gg = c.createRadialGradient(-18, -30, 6, 0, -6, 84); gg.addColorStop(0, '#2C3A78'); gg.addColorStop(0.6, '#18204A'); gg.addColorStop(1, '#0C1030');
    c.fillStyle = gg; c.fillRect(-80, -80, 160, 160);
  });
  // the brain and its amplifier, small, in the top half
  const t = B.t || 0;
  c.save(); c.translate(32, -34); erAmp(c, 0.122, t, { knob: B.knob, level: B.level, wave: B.wave === undefined ? 0.6 : B.wave, ring: B.ring || 0, noise: 0, small: true }); c.restore();
  const kp = erKnobPt(32, -34, 0.122, B.knob, 0.6);
  const bx = -22, by = -36, bs = 0.165;
  erBrain(c, bx, by, bs, t, { mood: B.mood || 'grin', look: B.look || [0.8, 0], armR: B.reach > 0.01 ? [lerp(176, (kp[0] - bx) / bs, B.reach), lerp(118, (kp[1] - by) / bs, B.reach)] : undefined, still: true });
  // glass: a rim and a shine
  paint(() => {
    c.beginPath(); c.ellipse(-26, -40, 16, 26, -0.5, 0, 7); c.fillStyle = 'rgba(255,255,255,0.10)'; c.fill();
    c.beginPath(); c.ellipse(0, 0, 64, 70, 0, Math.PI * 1.05, Math.PI * 1.6); c.lineWidth = 4; c.strokeStyle = 'rgba(200,230,255,0.55)'; c.stroke();
  });
  c.restore();
  // his eyes and mouth stay on the glass
  paint(() => { c.save(); c.beginPath(); c.ellipse(0, 0, 66, 72, 0, 0, Math.PI * 2); c.clip(); drawFace(c, face, pal); c.restore(); });
  paint(() => { c.beginPath(); c.ellipse(0, 0, 64, 70, 0, 0, Math.PI * 2); c.lineWidth = 3.5; c.strokeStyle = rgba('#BFE8FF', 0.7 * g); c.stroke(); });
}
// A: {face, armL, armR, bob, lean, headRot, headDX, headDY, frizz, horns 0..1 (the fingers up), finger 0..1 (the finger in
// his ear), wiggle, plugs 0..1 (both earplugs in), glass 0..1, brain {..}, flyHair 0..1, ambient}
function cnHero(cam, t, A = {}) {
  const pal = A.pal || CNPAL, st = cnSt(A);
  const r = charLayer(cam, st, t, {
    pal, ambient: A.ambient === undefined ? 0.03 : A.ambient,
    post: (lc, rr, s2) => {
      lc.save(); lc.translate(s2.x, s2.y); lc.scale(s2.s, s2.s);
      lc.save(); lc.translate(rr.P[0], rr.P[1]); lc.rotate(s2.pose.lean); cnTeeLogo(lc); lc.restore();
      // the head's own transform (as drawHead has it)
      const hx = rr.head[0] + (s2.headDX || 0), hy = rr.head[1] + (s2.headDY || 0), ha = rr.lean + (s2.headRot || 0);
      // flying hair on the bang: strands thrown up off the crown
      const fh = A.flyHair || 0;
      if (fh > 0.02) {
        lc.save(); lc.translate(hx, hy); lc.rotate(ha);
        for (let i = -3; i <= 3; i++) {
          const x0 = i * 15, y0 = -60 + Math.abs(i) * 4, len = (26 + 10 * (i % 2 ? 1 : 0)) * fh;
          lc.beginPath(); lc.moveTo(x0 - 6, y0 + 6); lc.quadraticCurveTo(x0 + i * 3, y0 - len * 0.6, x0 + i * 6, y0 - len); lc.quadraticCurveTo(x0 + i * 2 + 6, y0 - len * 0.5, x0 + 8, y0 + 6); lc.closePath();
          lc.fillStyle = pal.hair; lc.fill();
        }
        lc.restore();
      }
      if (A.glass > 0.01) { lc.save(); lc.translate(hx, hy); lc.rotate(ha); cnGlassHead(lc, s2.face, pal, A.glass, A.brain || {}); lc.restore(); }
      // hands in front of the head: drawn again on top (the head is drawn last in the rig)
      for (const [k, sd] of [['L', -1], ['R', 1]]) {
        const wr = rr['wr' + k], d = rr['armDir' + k], el = rr['el' + k];
        const isHorns = k === 'R' && (A.horns || 0) > 0.02, isEar = k === 'L' && (A.finger || 0) > 0.02, isPlug = (A.plugHands || 0) > 0.02;
        if (!isHorns && !isEar && !isPlug) continue;
        line(lc, el[0], el[1], wr[0], wr[1], 36, pal.skin);
        if (isHorns) cnHorns(lc, wr, d, pal, A.horns);
        else {
          const hx2 = wr[0] + d[0] * 14, hy2 = wr[1] + d[1] * 14;
          circle(lc, hx2, hy2, 21, pal.skin);
          if (isEar) {   // the index finger into the ear, wiggling
            const wg = (A.wiggle || 0) * 5 * Math.sin(t * 38);
            const ear = [hx + sd * 62 * Math.cos(ha), hy + sd * 62 * Math.sin(ha) + 2];
            line(lc, hx2, hy2 - 6, lerp(hx2, ear[0] - sd * 4, A.finger) + wg, lerp(hy2 - 26, ear[1], A.finger), 11, pal.skin);
          }
        }
      }
      // earplugs (on top of his fingers: they are what the beat is about)
      if ((A.plugs || 0) > 0.01) { lc.save(); lc.translate(hx, hy); lc.rotate(ha); cnPlug(lc, [-62, 2], -1, A.plugs); cnPlug(lc, [62, 2], 1, A.plugs); lc.restore(); }
      lc.restore();
    },
  });
  const P = (lx, ly) => cnHeadPt(st, lx, ly);
  return { st, r, s: st.s, head: P(0, 0), top: P(0, -84), chin: P(0, 68), earR: P(62, 2), earL: P(-62, 2), P };
}

// ---------------------------------------------------------------- the ring: thin bright lines out of his ears
// (world, at an ear point; side -1 = his left ear on screen-left), k = how loud, t = time
function ringLines(cam, ear, side, t, k, size = 1) {
  if (k <= 0.02) return;
  applyCam(cam);
  for (let i = 0; i < 3; i++) {
    const u = (((t * 1.6 + i / 3) % 1) + 1) % 1, r = (26 + u * 120) * size, a = k * (1 - 0.7 * u);
    const P = [];
    for (let j = 0; j <= 30; j++) {
      const an = -0.8 + 1.6 * (j / 30), rr = r + 4 * size * Math.sin(j * 2.2 + t * 60 + i);
      P.push([ear[0] + side * Math.cos(an) * rr, ear[1] + Math.sin(an) * rr]);
    }
    paint(() => poly(ctx, P, 4.5 * size, rgba('#FFF3B0', 0.95 * a)));
    poly(gctx, P, 10 * size, rgba('#FFD447', 0.85 * a));
  }
}
