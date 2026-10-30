// A campsite at night: pines, a tent lit from inside, a string of bulbs, a campfire; far to the left a pond with reeds
// (where the mosquitoes live). The hero stands by the fire with his sleeves pushed up (`CAMPPAL`); his friend sits in a
// camp chair under a blanket with a mug (`campFriend`). The land is painted once into a canvas (`initCamp`) and drawn
// under the camera, sharp or out of focus. Everything is in world coords except the sky. Loaded before scenes.js.
'use strict';

const CAMP = { GY: 1300, HX: 360, FX: 650, FRX: 880, X0: -1300, Y0: 380, BW: 2800, BH: 1820, bg: null, soft: null, stars: null };
const CAMPPAL = Object.assign({}, PAL, { shortSleeve: true });
const FRPAL = Object.assign({}, PAL, {
  skin: '#C98F63', skinSh: '#9C6440', skinHi: '#E3B089', hair: '#2B1C14', hairHi: '#4A3626',
  coat: '#7B61D6', coatSh: '#553FA6', coatHi: '#A691F0', coatDk: '#3D2C80', strap: '#7B61D6', strapSh: '#6A52C2',
  pants: '#3A3F58', pantsSh: '#262A40', shoe: '#3FB8A8', shoeSh: '#23806F',
});

function campPine(c, x, base, h, w, col) {
  c.fillStyle = col;
  c.fillRect(x - w * 0.06, base - h * 0.2, w * 0.12, h * 0.22);
  for (let i = 0; i < 4; i++) {
    const y0 = base - h * (0.16 + i * 0.2), ww = w * (0.5 - i * 0.1), hh = h * 0.34;
    c.beginPath(); c.moveTo(x - ww, y0); c.quadraticCurveTo(x - ww * 0.3, y0 - hh * 0.5, x, y0 - hh); c.quadraticCurveTo(x + ww * 0.3, y0 - hh * 0.5, x + ww, y0);
    c.quadraticCurveTo(x, y0 + hh * 0.12, x - ww, y0); c.fill();
  }
}

function initCamp() {
  const rng = mulberry32(8123), G = CAMP.GY;
  CAMP.stars = [...Array(90)].map(() => ({ x: rng(), y: rng() * 0.62, r: 0.8 + rng() * 1.9, ph: rng() * 9 }));
  const cv = mkCanvas(CAMP.BW, CAMP.BH), c = cv.getContext('2d');
  c.translate(-CAMP.X0, -CAMP.Y0);
  // a far ridge, two rows of pines
  c.fillStyle = '#101C46';
  c.beginPath(); c.moveTo(-1400, 1190);
  for (let x = -1400; x <= 1600; x += 60) c.lineTo(x, 1090 - 70 * Math.sin(x * 0.0031 + 1) - 40 * Math.sin(x * 0.0083));
  c.lineTo(1600, 1300); c.lineTo(-1400, 1300); c.closePath(); c.fill();
  for (let x = -1340; x <= 1560; x += 86) campPine(c, x + (rng() - 0.5) * 50, 1180, 300 + rng() * 170, 150 + rng() * 60, '#0C1638');
  for (let x = -1300; x <= 1560; x += 132) {
    if (x > -40 && x < 330 && rng() < 0.5) continue;
    campPine(c, x + (rng() - 0.5) * 70, 1215, 470 + rng() * 260, 220 + rng() * 90, '#081028');
  }
  // the ground
  const gg = c.createLinearGradient(0, 1190, 0, 2200); gg.addColorStop(0, '#132A46'); gg.addColorStop(0.2, '#0E2038'); gg.addColorStop(1, '#070F20');
  c.fillStyle = gg; c.fillRect(-1400, 1195, 3000, 1100);
  c.fillStyle = '#132A46'; c.beginPath(); c.moveTo(-1400, 1215);
  for (let x = -1400; x <= 1600; x += 80) c.lineTo(x, 1196 + 10 * Math.sin(x * 0.011));
  c.lineTo(1600, 1240); c.lineTo(-1400, 1240); c.closePath(); c.fill();
  // trodden earth round the fire
  c.save(); c.translate(CAMP.FX - 110, G + 34); c.scale(1, 0.2);
  const eg = c.createRadialGradient(0, 0, 40, 0, 0, 560); eg.addColorStop(0, 'rgba(120,84,60,0.75)'); eg.addColorStop(0.6, 'rgba(70,56,60,0.45)'); eg.addColorStop(1, 'rgba(70,56,60,0)');
  c.fillStyle = eg; c.beginPath(); c.arc(0, 0, 560, 0, 7); c.fill(); c.restore();
  // grass tufts
  c.lineCap = 'round';
  for (let i = 0; i < 260; i++) {
    const x = -1380 + rng() * 2960, y = 1215 + Math.pow(rng(), 1.6) * 900, h = 10 + rng() * 22 + (y - 1215) * 0.02;
    if (Math.abs(x - (CAMP.FX - 110)) < 420 && y > G - 40 && y < G + 130) continue;
    c.strokeStyle = rng() < 0.5 ? 'rgba(46,96,96,0.55)' : 'rgba(30,66,88,0.6)'; c.lineWidth = 2.5 + (y - 1215) * 0.004;
    for (let k = -1; k <= 1; k++) { c.beginPath(); c.moveTo(x + k * 5, y); c.quadraticCurveTo(x + k * 9, y - h * 0.6, x + k * 14, y - h); c.stroke(); }
  }
  // the pond, far left, with the moon on it
  c.save(); c.translate(-800, 1352); c.scale(1, 0.2);
  const pg = c.createRadialGradient(0, 0, 30, 0, 0, 360); pg.addColorStop(0, '#3A5AA6'); pg.addColorStop(0.7, '#1E3470'); pg.addColorStop(1, '#14224E');
  c.fillStyle = pg; c.beginPath(); c.arc(0, 0, 360, 0, 7); c.fill(); c.restore();
  for (let i = 0; i < 7; i++) { c.fillStyle = `rgba(220,232,255,${0.35 - i * 0.04})`; rrect(c, -860 - i * 6 + (i % 2) * 30, 1322 + i * 9, 120 - i * 10, 4, 2); c.fill(); }
  // cattails round the pond
  for (let i = 0; i < 22; i++) {
    const x = -1160 + i * 34 + rng() * 22, far = i % 3 === 0, y0 = far ? 1318 : 1392 + rng() * 26, h = (far ? 150 : 250) + rng() * 120, bend = (rng() - 0.5) * 40;
    c.strokeStyle = far ? '#16305A' : '#1C4A52'; c.lineWidth = far ? 4 : 6;
    c.beginPath(); c.moveTo(x, y0); c.quadraticCurveTo(x + bend * 0.4, y0 - h * 0.5, x + bend, y0 - h); c.stroke();
    c.strokeStyle = far ? '#2A2440' : '#5A3A2A'; c.lineWidth = far ? 10 : 15;
    c.beginPath(); c.moveTo(x + bend * 0.86, y0 - h * 0.88); c.lineTo(x + bend * 0.62, y0 - h * 0.7); c.stroke();
    c.strokeStyle = far ? '#16305A' : '#1C4A52'; c.lineWidth = far ? 5 : 8;
    c.beginPath(); c.moveTo(x + 8, y0); c.quadraticCurveTo(x + 40, y0 - h * 0.4, x + 70 + bend, y0 - h * 0.62); c.stroke();
  }
  // the tent: a dome with a lit doorway
  const tx = 150, tb = G - 8;
  c.beginPath(); c.moveTo(tx - 210, tb); c.bezierCurveTo(tx - 170, tb - 330, tx + 170, tb - 330, tx + 210, tb); c.closePath();
  const tg = c.createLinearGradient(tx - 210, 0, tx + 210, 0); tg.addColorStop(0, '#1C7C86'); tg.addColorStop(0.55, '#2AA6A0'); tg.addColorStop(1, '#125866');
  c.fillStyle = tg; c.fill();
  c.strokeStyle = 'rgba(8,30,44,0.55)'; c.lineWidth = 4;
  for (const dx of [-110, 110]) { c.beginPath(); c.moveTo(tx + dx * 1.4, tb); c.quadraticCurveTo(tx + dx * 0.9, tb - 200, tx, tb - 247); c.stroke(); }
  c.beginPath(); c.moveTo(tx - 70, tb); c.quadraticCurveTo(tx - 50, tb - 150, tx, tb - 190); c.quadraticCurveTo(tx + 50, tb - 150, tx + 70, tb); c.closePath();
  const dg = c.createLinearGradient(0, tb - 190, 0, tb); dg.addColorStop(0, '#FFE2A0'); dg.addColorStop(1, '#F29A3C');
  c.fillStyle = dg; c.fill();
  c.beginPath(); c.moveTo(tx - 70, tb); c.quadraticCurveTo(tx - 50, tb - 150, tx, tb - 190); c.quadraticCurveTo(tx - 22, tb - 90, tx - 34, tb); c.closePath(); c.fillStyle = '#F0803C'; c.fill();
  c.strokeStyle = 'rgba(200,220,255,0.35)'; c.lineWidth = 2.5;
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(tx + s * 150, tb - 190); c.lineTo(tx + s * 290, tb + 6); c.stroke(); }
  // his pack against a log
  c.fillStyle = '#3A2418'; rrect(c, 458, G - 6, 150, 34, 17); c.fill(); c.fillStyle = '#5A3A26'; rrect(c, 458, G - 6, 150, 13, 7); c.fill();
  // the two poles the string of bulbs hangs from
  c.strokeStyle = '#0A1230'; c.lineWidth = 14;
  for (const [px, py] of [[-70, 560], [1150, 540]]) { c.beginPath(); c.moveTo(px, 1240); c.lineTo(px, py); c.stroke(); }
  CAMP.bg = cv;
  const sv = mkCanvas(CAMP.BW, CAMP.BH), sc = sv.getContext('2d');
  sc.filter = 'blur(9px)'; sc.drawImage(cv, 0, 0); sc.filter = 'none';
  CAMP.soft = sv;
}

function campBulb(u) { return [lerp(-70, 1150, u), lerp(560, 540, u) + 96 * 4 * u * (1 - u)]; }

// the campsite behind everything. o: {soft 0..1 (out of focus, for close-ups), fire 0..1, lights 0..1}
function campBack(cam, t, o = {}) {
  const soft = o.soft || 0, fire = o.fire === undefined ? 1 : o.fire;
  screenSpace();
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#04071A'); sky.addColorStop(0.4, '#0C1640'); sky.addColorStop(0.72, '#1B2A62'); sky.addColorStop(1, '#16224E');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  for (const s of CAMP.stars) {
    const x = (((s.x * 1400 - cam.x * 0.05) % 1400) + 1400) % 1400 - 160, y = s.y * 1500 - (cam.y - 960) * 0.04 + 140;
    const tw = 0.55 + 0.45 * Math.sin(t * 1.7 + s.ph);
    circle(ctx, x, y, s.r, rgba('#DCE6FF', (0.3 + 0.5 * tw) * (1 - 0.5 * soft)));
  }
  // the moon: far away, so it moves half as much as the land (and is out of frame in the close-ups)
  const mz = lerp(1, cam.zoom, 0.55), mx = 540 + (300 - lerp(540, cam.x, 0.55)) * mz, my = 960 + (520 - lerp(960, cam.y, 0.55)) * mz, mr = 60 * (0.6 + 0.4 * mz);
  if (mx > -300 && mx < W + 300 && my > -300) {
    softDot(ctx, mx, my, 7 * mr, '#8FA8FF', 0.16); softDot(gctx, mx, my, 3 * mr, '#B8C8FF', 0.3);
    circle(ctx, mx, my, mr, '#F1EEDA');
    for (const [dx, dy, r] of [[-0.3, -0.22, 0.21], [0.36, 0.16, 0.15], [-0.06, 0.42, 0.11], [0.42, -0.4, 0.1]]) circle(ctx, mx + dx * mr, my + dy * mr, r * mr, 'rgba(190,188,170,0.55)');
  }
  // the land
  applyCam(cam);
  if (soft < 0.999) ctx.drawImage(CAMP.bg, CAMP.X0, CAMP.Y0);
  if (soft > 0.001) { ctx.globalAlpha = clamp(soft); ctx.drawImage(CAMP.soft, CAMP.X0, CAMP.Y0); ctx.globalAlpha = 1; }
  // the string of bulbs
  const L = o.lights === undefined ? 1 : o.lights;
  if (L > 0.01) {
    ctx.beginPath();
    for (let i = 0; i <= 30; i++) { const [x, y] = campBulb(i / 30); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.lineWidth = 3; ctx.strokeStyle = rgba('#0A1230', 1 - 0.6 * soft); ctx.stroke();
    for (let i = 1; i < 14; i++) {
      const [x, y] = campBulb(i / 14), col = ['#FFD98A', '#FF9A6E', '#9FE8FF', '#FFC0D8'][i % 4], tw = 0.75 + 0.25 * Math.sin(t * 2.3 + i * 1.9);
      softDot(ctx, x, y + 12, 26 + 46 * soft, col, (0.85 - 0.5 * soft) * tw * L);
      if (soft < 0.6) circle(ctx, x, y + 12, 8, rgba('#FFF6DC', (1 - soft) * L));
      softDot(gctx, x, y + 12, 42 + 30 * soft, col, 0.5 * tw * L);
    }
  }
  // out-of-focus lights far behind a close-up (main layer only, so they never bloom over a face)
  if (soft > 0.3) {
    screenSpace();
    for (let i = 0; i < 12; i++) {
      const x = (((hash(i * 3.3) * 1500 - cam.x * 0.9) % 1300) + 1300) % 1300 - 110, y = 380 + hash(i * 7.1) * 900 - (cam.y - 960) * 0.3;
      softDot(ctx, x, y, 50 + 70 * hash(i * 1.7), ['#FFB870', '#7FA8FF', '#FF9A6E', '#9FE8FF'][i % 4], 0.085 * soft * (0.7 + 0.3 * Math.sin(t * 1.3 + i)));
    }
    applyCam(cam);
  }
  // the tent glows from inside
  softDot(gctx, 150, CAMP.GY - 90, 150, '#FFB060', 0.3 + 0.04 * Math.sin(t * 2.1));
  // firelight on the ground
  if (fire > 0.01) {
    const fl = 0.86 + 0.1 * Math.sin(t * 11) + 0.06 * Math.sin(t * 23.7);
    ctx.save(); ctx.translate(CAMP.FX, CAMP.GY + 36); ctx.scale(1, 0.3); softDot(ctx, 0, 0, 620, '#FF8A3C', 0.34 * fire * fl); ctx.restore();
    softDot(ctx, CAMP.FX, CAMP.GY - 90, 520, '#FF7A2C', 0.1 * fire * fl);
  }
}

// one tongue of flame: base (x, y), width w, height h
function campFlame(c, x, y, w, h, t, seed, col) {
  const sw = w * 0.35 * Math.sin(t * 7.3 + seed * 2.1) + w * 0.18 * Math.sin(t * 13.1 + seed), hh = h * (0.86 + 0.14 * Math.sin(t * 9.7 + seed * 3.3));
  c.beginPath(); c.moveTo(x - w, y);
  c.bezierCurveTo(x - w * 1.25, y - hh * 0.45, x - w * 0.2 + sw * 0.4, y - hh * 0.6, x + sw, y - hh);
  c.bezierCurveTo(x + w * 0.3 + sw * 0.3, y - hh * 0.55, x + w * 1.25, y - hh * 0.4, x + w, y);
  c.closePath(); c.fillStyle = col; c.fill();
}
// the campfire: stones, logs, flames, sparks (under the camera). k = 0..1 its size
function campFire(t, k = 1) {
  const x = CAMP.FX, y = CAMP.GY + 44, c = ctx;
  for (let i = 0; i < 9; i++) { const a = Math.PI * (i / 8), sx = x - Math.cos(a) * 104, sy = y + 8 + Math.sin(a) * 26; ellipse(c, sx, sy, 24, 17, i % 2 ? '#4A5070' : '#3A405E'); ellipse(c, sx - 5, sy - 5, 12, 6, 'rgba(255,170,110,0.28)'); }
  for (const [a, col] of [[-0.42, '#4A2C1A'], [0.42, '#5A3620'], [0, '#3E2414']]) {
    c.save(); c.translate(x, y - 8); c.rotate(a); rrect(c, -92, -16, 184, 32, 14); c.fillStyle = col; c.fill();
    ellipse(c, 90, 0, 9, 15, '#FFB05A'); ellipse(c, -90, 0, 9, 15, '#C8703A'); c.restore();
  }
  const F = [[-34, 76, 150, 1, '#FF5A2A'], [36, 70, 132, 2, '#FF6A2A'], [0, 92, 214, 3, '#FF7A2A'], [-16, 58, 150, 4, '#FFB02A'], [20, 54, 128, 5, '#FFB83A'], [2, 34, 96, 6, '#FFE890']];
  for (const [dx, w, h, sd, col] of F) campFlame(c, x + dx, y - 14, w * 0.5 * k, h * k, t, sd, col);
  gctx.save();
  for (const [dx, w, h, sd] of F.slice(0, 3)) campFlame(gctx, x + dx, y - 14, w * 0.5 * k, h * k, t, sd, 'rgba(255,120,40,0.55)');
  gctx.restore();
  softDot(gctx, x, y - 80, 230 * k, '#FF8A3C', 0.42);
  for (let i = 0; i < 14; i++) {
    const u = (((t * (0.35 + 0.3 * hash(i * 2.3)) + hash(i * 7.7)) % 1) + 1) % 1;
    const sx = x + (hash(i * 3.9) - 0.5) * 90 + 40 * Math.sin(u * 6 + i), sy = y - 60 - 430 * u * k;
    circle(c, sx, sy, 3.2 * (1 - u) + 1, rgba('#FFD070', 0.9 * (1 - u))); softDot(gctx, sx, sy, 16, '#FFA040', 0.7 * (1 - u));
  }
}

// a character standing in this light: warm from the fire's side, the night on the rest
function campChar(cam, st, t, o = {}) {
  const fire = o.fire === undefined ? 1 : o.fire;
  const r = charLayer(cam, st, t, {
    pal: o.pal || CAMPPAL, ambient: o.ambient === undefined ? 0.13 : o.ambient, aura: o.aura,
    post: (c, r, s2) => {
      if (o.post) o.post(c, r, s2);
      c.save(); c.globalCompositeOperation = 'source-atop';
      const fl = 0.9 + 0.1 * Math.sin(t * 11) + 0.05 * Math.sin(t * 23.7);
      const g = c.createRadialGradient(CAMP.FX, CAMP.GY - 60, 30, CAMP.FX, CAMP.GY - 60, 700);
      g.addColorStop(0, rgba('#FF9A3C', 0.6 * fire * fl)); g.addColorStop(0.45, rgba('#FF7A2C', 0.24 * fire * fl)); g.addColorStop(1, rgba('#FF7A2C', 0));
      c.fillStyle = g; c.fillRect(-3000, -1000, 7000, 5000);
      c.restore();
    },
  });
  // the glow layer does not know what is in front: cut his shape out of whatever glows behind him
  if (o.occlude !== false) {
    gctx.save(); gctx.setTransform(1, 0, 0, 1, 0, 0); gctx.globalCompositeOperation = 'destination-out';
    gctx.drawImage(layerC, 0, 0, W / 2, H / 2); gctx.restore();
  }
  return r;
}
// a point given in a rig's head space -> world coords
function headPt(st, r, p) {
  const a = r.lean + (st.headRot || 0), cs = Math.cos(a), sn = Math.sin(a);
  return toWorld(st, [r.head[0] + (st.headDX || 0) + p[0] * cs - p[1] * sn, r.head[1] + (st.headDY || 0) + p[0] * sn + p[1] * cs]);
}
// into a rig's head space (for hats, glasses, things on his face): call inside a charLayer post
function headSpace(c, r, st, fn) {
  c.save(); c.translate(st.x, st.y); c.scale(st.s, st.s);
  c.translate(r.head[0] + (st.headDX || 0), r.head[1] + (st.headDY || 0)); c.rotate(r.lean + (st.headRot || 0));
  fn(c); c.restore();
}
// into a rig's own space (feet at 0, 0)
function rigSpace(c, st, fn) { c.save(); c.translate(st.x, st.y); c.scale(st.s, st.s); fn(c); c.restore(); }

// ---------------------------------------------------------------- the friend: a camp chair, a blanket, a mug
const FRIEND = { s: 0.92, drop: 84 };
function friendPose(sip, t, wave = 0) {
  let p = JSON.parse(JSON.stringify(POSES.stand));
  p.lean = 0.015 * Math.sin(t * 1.3);
  const mug = [lerp(70, 30, sip), p.hipY + lerp(-78, -190, sip)];
  p = ikReach(p, 'R', mug, -1);
  p = ikReach(p, 'L', wave > 0 ? [lerp(-126, -150, wave), p.hipY + lerp(-36, -250, wave)] : [-126, p.hipY - 36], 1);
  p.hand = 'open';
  return p;
}
// o: {sip 0..1, face, headRot, headDX, headDY, wave 0..1 (the free hand up), halo 0..1, x}
function campFriend(cam, t, o = {}) {
  const s = FRIEND.s, x = o.x === undefined ? CAMP.FRX : o.x, sip = o.sip || 0;
  const st = { x, y: CAMP.GY + FRIEND.drop, s, pose: friendPose(sip, t, o.wave || 0), noLegs: true, face: o.face || FACES.calm,
    headRot: o.headRot || 0, headDX: o.headDX || 0, headDY: (o.headDY || 0) + 2 * Math.sin(t * 1.9) };
  const g = -FRIEND.drop / s, hip = st.pose.hipY;      // rig-local y of the ground, of the hips
  applyCam(cam);
  // the chair's back and its crossed legs
  rigSpace(ctx, st, (c) => {
    c.strokeStyle = '#8A93B4'; c.lineWidth = 9; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-112, hip - 150); c.lineTo(-128, g); c.moveTo(112, hip - 150); c.lineTo(128, g); c.stroke();
    c.beginPath(); c.moveTo(-120, hip + 26); c.lineTo(104, g); c.moveTo(120, hip + 26); c.lineTo(-104, g); c.stroke();
    rrect(c, -118, hip - 196, 236, 190, 22); c.fillStyle = '#2E6A4A'; c.fill(); rrect(c, -118, hip - 196, 236, 30, 14); c.fillStyle = '#3F8A60'; c.fill();
    rrect(c, -150, hip - 44, 60, 16, 8); c.fillStyle = '#20263F'; c.fill(); rrect(c, 90, hip - 44, 60, 16, 8); c.fill();
  });
  const r = campChar(cam, st, t, { pal: FRPAL, ambient: o.ambient, post: (c, rr) => {
    rigSpace(c, st, (cc) => {
      // the blanket over his knees, and his shoes under its hem
      for (const sx of [-52, 52]) { cc.beginPath(); cc.ellipse(sx, g - 6, 36, 20, 0, 0, 7); cc.fillStyle = FRPAL.shoeSh; cc.fill(); cc.beginPath(); cc.ellipse(sx, g - 10, 32, 15, 0, 0, 7); cc.fillStyle = FRPAL.shoe; cc.fill(); rrect(cc, sx - 36, g + 4, 72, 10, 5); cc.fillStyle = FRPAL.sole; cc.fill(); }
      cc.beginPath(); cc.moveTo(-88, hip - 10); cc.lineTo(88, hip - 10); cc.quadraticCurveTo(134, hip + 20, 128, hip + 70);
      cc.lineTo(116, g - 22); cc.quadraticCurveTo(60, g - 8, 0, g - 20); cc.quadraticCurveTo(-60, g - 8, -116, g - 22); cc.lineTo(-128, hip + 70);
      cc.quadraticCurveTo(-134, hip + 20, -88, hip - 10); cc.closePath();
      cc.fillStyle = '#C8384A'; cc.fill();
      cc.save(); cc.clip();
      cc.strokeStyle = 'rgba(60,10,24,0.55)'; cc.lineWidth = 12;
      for (let i = -3; i <= 3; i++) { cc.beginPath(); cc.moveTo(i * 42, hip - 20); cc.lineTo(i * 46, g); cc.stroke(); }
      for (let j = 0; j < 4; j++) { cc.beginPath(); cc.moveTo(-150, hip + 24 + j * 36); cc.lineTo(150, hip + 24 + j * 36); cc.stroke(); }
      cc.strokeStyle = 'rgba(255,220,160,0.35)'; cc.lineWidth = 3;
      for (let i = -3; i <= 3; i++) { cc.beginPath(); cc.moveTo(i * 42 + 12, hip - 20); cc.lineTo(i * 46 + 12, g); cc.stroke(); }
      cc.restore();
      // the mug in his right hand, with steam
      const wr = rr.wrR, d = rr.armDirR, mx = wr[0] + d[0] * 14 - 4, my = wr[1] + d[1] * 14 - 12;
      cc.save(); cc.translate(mx, my); cc.rotate(-0.5 * sip);
      cc.lineWidth = 8; cc.strokeStyle = '#E8E2D0'; cc.beginPath(); cc.arc(26, 2, 14, -1.3, 1.3); cc.stroke();
      rrect(cc, -24, -28, 48, 54, 9); cc.fillStyle = '#F4F0E6'; cc.fill(); rrect(cc, -24, -8, 48, 12, 0); cc.fillStyle = '#FF5A6E'; cc.fill();
      ellipse(cc, 0, -27, 22, 6, '#5A3420');
      cc.restore();
      circle(cc, mx - 22, my + 6, 9, FRPAL.skin); circle(cc, mx - 16, my + 20, 9, FRPAL.skin);
    });
    headSpace(c, rr, st, (cc) => {
      friendHat(cc);                                   // a beanie with a pom-pom, round glasses (mlab.js)
    });
  } });
  applyCam(cam);
  // steam off the mug (when it is not at his mouth)
  if (sip < 0.5) {
    const hw = toWorld(st, r.wrR);
    for (let i = 0; i < 3; i++) { const u = (((t * 0.5 + i / 3) % 1) + 1) % 1; softDot(ctx, hw[0] - 6 + 14 * Math.sin(u * 6 + i), hw[1] - 60 - 70 * u, 14 + 12 * u, '#FFFFFF', 0.2 * (1 - u) * (1 - 2 * sip)); }
  }
  // a halo: nothing has bitten him
  if (o.halo > 0.01) {
    const hp = toWorld(st, [r.head[0], r.head[1] - 132]);
    both((c, gl) => { c.beginPath(); c.ellipse(hp[0], hp[1] + 6 * Math.sin(t * 3), 62 * s, 16 * s, 0, 0, 7); c.lineWidth = (gl ? 22 : 9) * clamp(o.halo); c.strokeStyle = rgba('#FFE46B', (gl ? 0.5 : 1) * clamp(o.halo)); c.stroke(); });
  }
  return { st, r };
}
