// The living room at night (goosebumps): a couch in front of a TV we never see (it is the camera; its light flickers
// over everything), the hero seated with a bucket of popcorn, popcorn that flies on the jump scare, his "ghost fur",
// the big red FLUFF button in a callout, headphones, music notes, the alarm lamp.
// World coords = screen coords at zoom 1. Loaded before scenes.js (see scene.html).
'use strict';

const ROOM = { seatY: 1250, hx: 540, hs: 1.12, wallA: '#1B2350', wallB: '#0A0E26' };
// home clothes: a soft blue-grey hoodie with the sleeves pushed up (bare forearms: the goosebumps live there)
const HOMEPAL = Object.assign({}, PAL, {
  coat: '#5B7FD6', coatSh: '#3C59A8', coatHi: '#8FB0FF', coatDk: '#2C4488',
  strap: '#5B7FD6', strapSh: '#3C59A8', pants: '#3A3F58', pantsSh: '#262A40',
  shoe: '#E8E4D8', shoeSh: '#B8B2A0', sole: '#8A8576', shortSleeve: true, pj: false, home: true,
});
let ROOM_STATIC = null, ROOM_POP = null;

// the TV's light: a restless blue flicker, a white flash on the jump scare (t = 0) and again at the loop point
function tvFlick(t) {
  const c = TLd.cues, step = hash(Math.floor(t * 5.3) + 3) * 0.35;
  let f = 0.5 + 0.22 * vnoise(t * 8, 3) + step;
  f += 0.7 * Math.exp(-Math.max(0, t - (c.scare || 0)) * 5.5);
  if (c.loopflash !== undefined && t > c.loopflash) f += 0.7 * ramp(t, c.loopflash, TLd.duration, E.inCubic);
  return f;
}

function initRoom() {
  // the static room, drawn once: wall, window, picture, lamp, floor
  const cv = mkCanvas(W, H), c = cv.getContext('2d');
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, ROOM.wallA); g.addColorStop(0.75, ROOM.wallB); g.addColorStop(1, '#05060F');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  for (let x = 30; x < W; x += 90) { c.fillStyle = 'rgba(255,255,255,0.022)'; c.fillRect(x, 0, 44, 1430); }
  // window (left): night sky, a moon, the cross bars, heavy curtains
  const wx = 96, wy = 430, ww = 250, wh = 360;
  rrect(c, wx - 14, wy - 14, ww + 28, wh + 28, 10); c.fillStyle = '#2B3364'; c.fill();
  const sky = c.createLinearGradient(0, wy, 0, wy + wh); sky.addColorStop(0, '#132456'); sky.addColorStop(1, '#27408A');
  c.fillStyle = sky; c.fillRect(wx, wy, ww, wh);
  const rs = mulberry32(5);
  for (let i = 0; i < 26; i++) circle(c, wx + rs() * ww, wy + rs() * wh * 0.8, 1 + rs() * 1.8, `rgba(220,230,255,${0.4 + rs() * 0.5})`);
  softDot(c, wx + 170, wy + 100, 120, '#BFD2FF', 0.35); circle(c, wx + 170, wy + 100, 34, '#EAF0FF'); circle(c, wx + 158, wy + 92, 9, 'rgba(180,195,235,0.7)');
  c.fillStyle = '#2B3364'; c.fillRect(wx + ww / 2 - 6, wy, 12, wh); c.fillRect(wx, wy + wh / 2 - 6, ww, 12);
  for (const s of [-1, 1]) {   // curtains
    const cx = s < 0 ? wx - 44 : wx + ww - 26;
    const cg = c.createLinearGradient(cx, 0, cx + 70, 0); cg.addColorStop(0, '#4A1F3F'); cg.addColorStop(0.5, '#6B2C55'); cg.addColorStop(1, '#3A1832');
    c.fillStyle = cg; rrect(c, cx, wy - 40, 70, wh + 90, 14); c.fill();
    for (let i = 1; i < 4; i++) line(c, cx + i * 17, wy - 30, cx + i * 17, wy + wh + 40, 3, 'rgba(0,0,0,0.22)');
  }
  rrect(c, wx - 60, wy - 56, ww + 120, 22, 10); c.fillStyle = '#20264C'; c.fill();
  // a framed picture (right): the cat, of course
  const px = 742, py = 470, pw = 210, ph = 250;
  rrect(c, px - 14, py - 14, pw + 28, ph + 28, 8); c.fillStyle = '#6A4A2A'; c.fill();
  c.fillStyle = '#243A6A'; c.fillRect(px, py, pw, ph);
  c.save(); c.translate(px + pw / 2, py + ph - 24);
  ellipse(c, 0, -52, 58, 64, '#C8742E'); circle(c, 0, -140, 46, '#D8843A');
  c.beginPath(); c.moveTo(-44, -160); c.lineTo(-34, -206); c.lineTo(-10, -176); c.moveTo(44, -160); c.lineTo(34, -206); c.lineTo(10, -176); c.fillStyle = '#D8843A'; c.fill();
  circle(c, -17, -144, 6, '#1A1A22'); circle(c, 17, -144, 6, '#1A1A22'); ellipse(c, 0, -128, 5, 3.5, '#F29AA8');
  c.restore();
  c.fillStyle = 'rgba(255,255,255,0.06)'; c.beginPath(); c.moveTo(px, py); c.lineTo(px + 90, py); c.lineTo(px, py + 120); c.fill();
  // floor lamp (far right, off)
  line(c, 1010, 1430, 1010, 820, 9, '#1C2148'); ellipse(c, 1010, 1432, 46, 10, '#1C2148');
  c.beginPath(); c.moveTo(958, 830); c.lineTo(1062, 830); c.lineTo(1040, 700); c.lineTo(980, 700); c.closePath(); c.fillStyle = '#2A3060'; c.fill();
  // skirting + floor boards
  c.fillStyle = '#141A3C'; c.fillRect(0, 1404, W, 26);
  const fg = c.createLinearGradient(0, 1430, 0, H); fg.addColorStop(0, '#15122A'); fg.addColorStop(1, '#07060F');
  c.fillStyle = fg; c.fillRect(0, 1430, W, H - 1430);
  for (let i = 0; i < 7; i++) line(c, 0, 1470 + i * i * 12 + i * 30, W, 1470 + i * i * 12 + i * 30, 2, 'rgba(0,0,0,0.3)');
  // a rug under the couch
  ellipse(c, 540, 1560, 520, 90, '#3B2452'); ellipse(c, 540, 1560, 470, 72, '#4A2E66');
  ROOM_STATIC = cv;
  // popcorn: where each piece goes when the bucket jumps
  const rng = mulberry32(21);
  ROOM_POP = [...Array(30)].map((_, i) => {
    let a = (rng() - 0.5) * 2.3; a = -Math.PI / 2 + a + 0.3 * Math.sign(a);            // fanned out to both sides: his face stays readable
    const v = 900 + rng() * 900;
    return { vx: Math.cos(a) * v * 0.55, vy: Math.sin(a) * v, x0: (rng() - 0.5) * 110, r: 8 + rng() * 6, rot: rng() * 6, spin: (rng() - 0.5) * 16, d: rng() * 0.07, seed: i };
  });
}

function roomBack(cam, t) {
  applyCam(cam);
  ctx.drawImage(ROOM_STATIC, 0, 0);
  softDot(gctx, 266, 530, 150, '#9FB8FF', 0.5);                 // the moon blooms
}

// the couch: back + cushions (behind the hero) ...
function couchBack(t) {
  const c = ctx;
  for (const s of [-1, 1]) { rrect(c, 540 + s * 380 - 60, 1380, 120, 60, 10); c.fillStyle = '#0C1F24'; c.fill(); }   // feet
  const g = c.createLinearGradient(0, 890, 0, 1320); g.addColorStop(0, '#2D7686'); g.addColorStop(1, '#17434D');
  rrect(c, 150, 890, 780, 440, 70); c.fillStyle = g; c.fill();
  for (const s of [-1, 1]) {   // back cushions
    const x = s < 0 ? 176 : 546;
    const cg = c.createLinearGradient(0, 920, 0, 1240); cg.addColorStop(0, '#3A8C9C'); cg.addColorStop(1, '#1E5562');
    rrect(c, x, 916, 358, 330, 56); c.fillStyle = cg; c.fill();
    c.beginPath(); c.moveTo(x + 50, 934); c.quadraticCurveTo(x + 179, 922, x + 308, 934); c.lineWidth = 5; c.strokeStyle = 'rgba(190,240,250,0.16)'; c.lineCap = 'round'; c.stroke();
  }
  // seat cushions
  const sg = c.createLinearGradient(0, 1210, 0, 1340); sg.addColorStop(0, '#3F97A8'); sg.addColorStop(1, '#22606E');
  for (const x of [172, 546]) { rrect(c, x, 1212, 362, 128, 34); c.fillStyle = sg; c.fill(); }
  line(c, 196, 1222, 510, 1222, 4, 'rgba(200,245,255,0.14)'); line(c, 570, 1222, 884, 1222, 4, 'rgba(200,245,255,0.14)');
}
// ... and its arms + base (in front of the cushions, behind his shins)
function couchFront(t) {
  const c = ctx;
  rrect(c, 150, 1322, 780, 78, 22); c.fillStyle = '#12363E'; c.fill();
  for (const s of [-1, 1]) {
    const x = s < 0 ? 96 : 838;
    const g = c.createLinearGradient(x, 0, x + 146, 0); g.addColorStop(0, '#2A7080'); g.addColorStop(1, '#184650');
    rrect(c, x, 1030, 146, 372, 62); c.fillStyle = g; c.fill();
    rrect(c, x + 12, 1040, 122, 70, 34); c.fillStyle = 'rgba(190,240,250,0.10)'; c.fill();
  }
}

// seated legs: thighs toward the camera (foreshortened), shins down, shoes front-on. Rig-local (x, y, s like st).
function couchLegs(c, x, y, s, pal) {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (const sd of [-1, 1]) {
    const g = c.createLinearGradient(0, 30, 0, 215); g.addColorStop(0, pal.pants); g.addColorStop(1, pal.pantsSh);
    rrect(c, sd * 41 - 25, 30, 50, 180, 20); c.fillStyle = g; c.fill();
    rrect(c, sd * 39 - 31, -26, 62, 78, 28); c.fillStyle = pal.pants; c.fill();
    ellipse(c, sd * 39, 22, 26, 14, 'rgba(255,255,255,0.05)');
    drawShoe(c, [sd * 41, 196], sd, pal, 1, false);
  }
  c.restore();
}

// his pose on the couch. o: {hug 0..1 (hands on the bucket in his lap), up 0..1 (arms thrown up), rest 0..1 (hands on the
// knees), lean, t, tremble}
function couchPose(o) {
  const base = { hipY: -34, lean: o.lean || 0, armL: { a: 0.3, b: 0.2 }, armR: { a: 0.3, b: 0.2 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, hand: 'open', feetFront: 1 };
  let hug = ikReach(base, 'L', [-82, -92], -1); hug = ikReach(hug, 'R', [82, -92], -1);
  let rest = ikReach(base, 'L', [-52, -40], -1); rest = ikReach(rest, 'R', [52, -40], -1);
  const up = Object.assign({}, base, { armL: { a: 2.35, b: 0.45 }, armR: { a: 2.2, b: 0.6 }, hand: 'spread' });
  let p = lerpPose(rest, hug, clamp(o.hug === undefined ? 1 : o.hug));
  if (o.up > 0) p = lerpPose(p, up, clamp(o.up));
  if (o.pose) p = lerpPose(p, o.pose, clamp(o.poseK === undefined ? 1 : o.poseK));
  if (o.tremble) p = twitch(p, o.t || 0, o.tremble, 11);
  return p;
}

// a piece of popcorn
function popcorn(c, x, y, r, rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot);
  circle(c, r * 0.45, r * 0.35, r * 0.8, '#E3BE78'); circle(c, -r * 0.5, r * 0.2, r * 0.75, '#F1D9A2');
  circle(c, 0, -r * 0.35, r * 0.85, '#FFF3D6'); circle(c, -r * 0.15, -r * 0.5, r * 0.3, '#FFFFFF');
  c.restore();
}
// the bucket (rig-local: centre of its top edge), with a heap that empties as `spill` goes to 1
function popBucket(c, x, y, s, rot, spill = 0) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  const heap = 1 - 0.75 * spill;
  for (const [px, py, r] of [[-44, -6, 13], [-18, -18, 15], [12, -22, 15], [40, -8, 13], [-30, 2, 12], [0, -4, 15], [28, 4, 12]]) popcorn(c, px, py * heap + 8 * spill, r);
  c.beginPath(); c.moveTo(-78, 0); c.lineTo(78, 0); c.lineTo(58, 138); c.lineTo(-58, 138); c.closePath();
  c.save(); c.clip();
  c.fillStyle = '#F4F1EA'; c.fillRect(-80, 0, 160, 140);
  for (let i = -3; i <= 3; i++) if (i % 2 === 0) { c.beginPath(); c.moveTo(i * 22 - 11, 0); c.lineTo(i * 22 + 11, 0); c.lineTo(i * 16.5 + 8, 140); c.lineTo(i * 16.5 - 8, 140); c.closePath(); c.fillStyle = '#E2424B'; c.fill(); }
  const sh = c.createLinearGradient(-78, 0, 78, 0); sh.addColorStop(0, 'rgba(255,255,255,0.12)'); sh.addColorStop(0.6, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,30,0.32)');
  c.fillStyle = sh; c.fillRect(-80, 0, 160, 140);
  c.restore();
  rrect(c, -82, -8, 164, 16, 8); c.fillStyle = '#FFFFFF'; c.fill();
  c.restore();
}

// short hairs along the outside of both bare forearms (rig space; k = how erect), for the dive into the arm
function armBristles(c, r, k, a = 1) {
  for (const key of ['L', 'R']) {
    const s = key === 'L' ? -1 : 1, el = r['el' + key], wr = r['wr' + key];
    const dx = wr[0] - el[0], dy = wr[1] - el[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
    let nx = -uy, ny = ux; if (nx * s < 0) { nx = -nx; ny = -ny; }          // the outward side
    for (let i = 0; i < 9; i++) {
      const u = 0.14 + i * 0.085, bx = el[0] + dx * u + nx * 17, by = el[1] + dy * u + ny * 17;
      const lift = lerp(0.25, 1.3, k) + 0.1 * Math.sin(i * 2.1), len = (9 + 2 * (i % 3)) * (1 + 0.55 * k);
      const hx = ux * Math.cos(lift) + nx * Math.sin(lift), hy = uy * Math.cos(lift) + ny * Math.sin(lift);
      line(c, bx, by, bx + hx * len, by + hy * len, 1.8 + 0.5 * k, `rgba(60,34,22,${0.8 * a})`);
      if (k > 0.3) circle(c, bx - nx * 5, by - ny * 5, 2.6, `rgba(255,236,220,${0.7 * a * (k - 0.3)})`);   // a bump at its root
    }
  }
}

// headphones on his head (rig space, after translate/scale): band over the hair, two cups on the ears
function headphones(c, r, st, k) {
  if (k <= 0) return;
  const [hx, hy] = r.head;
  c.save(); c.translate(hx + (st.headDX || 0), hy + (st.headDY || 0) - 60 * (1 - E.outBack(clamp(k)))); c.rotate(r.lean + (st.headRot || 0)); c.globalAlpha = clamp(k * 2);
  c.beginPath(); c.arc(0, -4, 78, Math.PI * 1.06, Math.PI * 1.94); c.lineWidth = 15; c.strokeStyle = '#20242F'; c.lineCap = 'round'; c.stroke();
  c.beginPath(); c.arc(0, -4, 78, Math.PI * 1.2, Math.PI * 1.5); c.lineWidth = 4; c.strokeStyle = 'rgba(255,255,255,0.25)'; c.stroke();
  for (const s of [-1, 1]) {
    rrect(c, s * 70 - 19, -30, 38, 70, 17); c.fillStyle = '#20242F'; c.fill();
    rrect(c, s * 76 - 10, -22, 20, 54, 10); c.fillStyle = '#FF5A6E'; c.fill();
  }
  c.restore();
}

// a music note (screen or world space under the current transform); kind 0 = quaver, 1 = beamed pair
function musicNote(c, x, y, s, col, rot = 0, kind = 0, a = 1) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); c.globalAlpha *= a;
  c.fillStyle = col; c.strokeStyle = col; c.lineCap = 'round';
  ellipse(c, 0, 0, 17, 12.5, col, -0.4);
  c.lineWidth = 6; c.beginPath(); c.moveTo(14, -3); c.lineTo(14, -72); c.stroke();
  if (kind === 0) { c.beginPath(); c.moveTo(14, -72); c.quadraticCurveTo(46, -62, 40, -30); c.lineWidth = 7; c.stroke(); }
  else { ellipse(c, 52, -12, 17, 12.5, col, -0.4); c.beginPath(); c.moveTo(66, -15); c.lineTo(66, -84); c.stroke(); c.beginPath(); c.moveTo(14, -72); c.lineTo(66, -84); c.lineWidth = 12; c.stroke(); }
  c.restore();
}

// the big red button in a round callout (screen space). k = pop-in, press 0..1, alarm 0..1 (a spinning beacon on top)
function fluffButton(x, y, R, t, o = {}) {
  const k = o.k === undefined ? 1 : o.k;
  if (k <= 0) return;
  const s = E.outBack(clamp(k), 1.7), press = o.press || 0, alarm = o.alarm || 0;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.scale(s, s);
  // the callout disc: a dark control panel
  ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2);
  const pg = ctx.createRadialGradient(-R * 0.3, -R * 0.4, 10, 0, 0, R); pg.addColorStop(0, '#2B3466'); pg.addColorStop(1, '#0E1230');
  ctx.fillStyle = pg; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = alarm > 0.05 ? mixHex('#7FE9FF', '#FF5A6E', clamp(alarm)) : '#7FE9FF'; ctx.stroke();
  for (let i = 0; i < 4; i++) { const a = Math.PI / 4 + i * Math.PI / 2; circle(ctx, Math.cos(a) * R * 0.8, Math.sin(a) * R * 0.8, 6, '#59618F'); }
  // the button: bezel, the red dome (sinks when pressed)
  const by = 6, d = 14 * press, br = R * 0.5;
  ellipse(ctx, 0, by + 26, br * 1.25, br * 0.62, '#12162E');
  ellipse(ctx, 0, by + 18, br * 1.22, br * 0.6, '#9AA3C4'); ellipse(ctx, 0, by + 14, br * 1.12, br * 0.54, '#5A6288');
  ctx.fillStyle = '#A01826'; ctx.beginPath(); ctx.ellipse(0, by + 10, br, br * 0.46, 0, 0, Math.PI); ctx.lineTo(-br, by - 22 + d); ctx.ellipse(0, by - 22 + d, br, br * 0.46, 0, Math.PI, 0, true); ctx.closePath(); ctx.fill();
  const dg = ctx.createRadialGradient(-br * 0.3, by - 34 + d, 4, 0, by - 22 + d, br); dg.addColorStop(0, '#FF98A0'); dg.addColorStop(0.35, '#FF3B4E'); dg.addColorStop(1, '#C01A2C');
  ctx.fillStyle = dg; ctx.beginPath(); ctx.ellipse(0, by - 22 + d, br, br * 0.46, 0, 0, Math.PI * 2); ctx.fill();
  ellipse(ctx, -br * 0.3, by - 32 + d, br * 0.36, br * 0.1, 'rgba(255,255,255,0.55)', -0.1);
  // the plate under it
  rrect(ctx, -R * 0.56, R * 0.5, R * 1.12, R * 0.3, 8); ctx.fillStyle = '#F4EFDC'; ctx.fill();
  ctx.font = `400 ${R * 0.25}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#1A1C2C';
  ctx.fillText(o.label || 'FLUFF UP', 0, R * 0.665);
  // the plate above: what it used to drive
  if (o.top) { ctx.font = `800 ${R * 0.15}px Montserrat`; ctx.fillStyle = 'rgba(190,205,255,0.85)'; ctx.fillText(o.top, 0, -R * 0.7); }
  ctx.restore();
  const glowA = 0.35 + 0.25 * Math.sin(t * 5) + 0.6 * press + 0.5 * alarm * (0.5 + 0.5 * Math.sin(t * 22));
  softDot(gctx, x, y - 10 * s, R * 0.8 * s, '#FF3B4E', clamp(glowA) * clamp(k));
  if (alarm > 0.02) {   // beacon rays sweeping round
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y - 10);
    for (let i = 0; i < 2; i++) {
      const a = t * 9 + i * Math.PI;
      const rg = ctx.createRadialGradient(0, 0, R * 0.3, 0, 0, R * 2.6); rg.addColorStop(0, `rgba(255,70,90,${0.4 * alarm})`); rg.addColorStop(1, 'rgba(255,70,90,0)');
      ctx.fillStyle = rg; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R * 2.6, a - 0.22, a + 0.22); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
}

// the whole couch scene. o: {cam, hero: {face, hug, up, lean, tremble, frizz, headDX, headDY, headRot, bristle, pose, poseK},
//  bucket: {show, jump 0..1, spill}, popT (time since the scare; pieces fly), headphones 0..1, fur: fn(c, st, r),
//  flick (override), noBucket, post: fn(lctx, r, st) in rig space}
function couchScene(cam, t, o = {}) {
  const h = o.hero || {}, c = ctx;
  roomBack(cam, t);
  couchBack(t);
  const st = { x: ROOM.hx + (h.dx || 0), y: ROOM.seatY + (h.dy || 0), s: ROOM.hs, face: h.face || FACES.calm, frizz: h.frizz || 0,
    headDX: h.headDX || 0, headDY: h.headDY || 0, headRot: h.headRot || 0, noLegs: true, seed: 4 };
  st.pose = couchPose(Object.assign({ t }, h));
  couchFront(t);
  if (o.under) { applyCam(cam); o.under(c, st); }
  couchLegs(c, st.x, st.y, st.s, HOMEPAL);
  // the bucket sits in his lap, between his hands (drawn after the body, before the arms would be ideal; the hands
  // overlap its rim from the layer above, so draw it first and the character layer on top, then its front again)
  const b = o.bucket || {};
  const bj = b.jump || 0, bx = st.x + (b.dx || 0), by = st.y - 152 * st.s - 46 * Math.sin(Math.PI * bj) * (b.amp === undefined ? 1 : b.amp), brot = (b.rot || 0) + 0.22 * Math.sin(Math.PI * bj) * (b.tilt === undefined ? 1 : b.tilt);
  const r = charLayer(cam, st, t, {
    pal: HOMEPAL, ambient: o.ambient === undefined ? 0.22 : o.ambient,
    post: (lc, rr, s2) => {
      lc.save(); lc.translate(s2.x, s2.y); lc.scale(s2.s, s2.s);
      if (h.bristle !== undefined) armBristles(lc, rr, h.bristle, h.bristleA === undefined ? 1 : h.bristleA);
      if (o.headphones) headphones(lc, rr, s2, o.headphones);
      if (o.post) o.post(lc, rr, s2);
      lc.restore();
    },
  });
  applyCam(cam);
  if (b.show !== false) {
    popBucket(c, bx, by, st.s * 0.86, brot, b.spill || 0);
    // his hands again, over the bucket's sides
    c.save(); c.translate(st.x, st.y); c.scale(st.s, st.s);
    if ((h.up || 0) < 0.4 && (h.hug === undefined || h.hug > 0.6)) for (const k of ['L', 'R']) drawHand(c, r['wr' + k], r['armDir' + k], 'open', HOMEPAL, k === 'L' ? -1 : 1, t);
    c.restore();
  }
  // popcorn in the air
  if (o.popT !== undefined && o.popT > 0) {
    for (const p of ROOM_POP) {
      const tau = o.popT - p.d;
      if (tau < 0) continue;
      const x = st.x + p.x0 + p.vx * tau, y = st.y - 170 * st.s + p.vy * tau + 0.5 * 2700 * tau * tau;
      if (y > 1700) continue;
      popcorn(c, x, y, p.r * 1.25, p.rot + p.spin * tau);
    }
  }
  return { st, r, bucket: [bx, by] };
}
// the TV's light over the whole frame (call last, in the shot): additive blue from below, stronger with the flicker
function tvLight(t, amt = 1) {
  const f = tvFlick(t) * amt;
  screenSpace();
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(540, 1750, 80, 540, 1500, 1250);
  g.addColorStop(0, `rgba(110,150,255,${clamp(0.2 * f)})`); g.addColorStop(0.6, `rgba(70,100,220,${clamp(0.08 * f)})`); g.addColorStop(1, 'rgba(40,60,160,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.restore();
  softDot(gctx, 540, 1800, 700, '#5F86FF', clamp(0.16 * f));
}
