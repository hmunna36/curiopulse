// Original character "hiker": flat-vector rig with 2.5D shading.
// Local coords: feet on y=0, up is -y, ~560 units tall. Upper body hangs off the
// pelvis (0, hipY) and can lean. Angles: 0 = limb pointing down, + = outward.
'use strict';

const PAL = {
  skin: '#F2B892', skinSh: '#CF8663', skinHi: '#FFDCC4',
  hair: '#2A1B14', hairHi: '#5A4030',
  coat: '#FFC23A', coatSh: '#DE8C16', coatHi: '#FFE699', coatDk: '#B06C0C',
  strap: '#1CB3A4', strapSh: '#117F74',
  pants: '#2F3A78', pantsSh: '#1E2654',
  shoe: '#EF4638', shoeSh: '#B02A22', sole: '#F4F0E6', sock: '#E4E7F0',
  pupil: '#15132A', mouth: '#5A1522', tongue: '#E0616C', teeth: '#FFFFFF',
};
const XPAL = Object.assign({}, PAL, {
  skin: 'rgba(40,90,190,0.30)', skinSh: 'rgba(40,90,190,0.30)', skinHi: 'rgba(40,90,190,0.30)',
  hair: 'rgba(40,90,190,0.25)', hairHi: 'rgba(40,90,190,0.25)',
  coat: 'rgba(40,90,190,0.30)', coatSh: 'rgba(40,90,190,0.30)', coatHi: 'rgba(40,90,190,0.30)', coatDk: 'rgba(40,90,190,0.30)',
  strap: 'rgba(40,90,190,0.25)', strapSh: 'rgba(40,90,190,0.25)',
  pants: 'rgba(40,90,190,0.30)', pantsSh: 'rgba(40,90,190,0.30)',
  shoe: 'rgba(40,90,190,0.30)', shoeSh: 'rgba(40,90,190,0.30)', sole: 'rgba(40,90,190,0.30)', sock: 'rgba(40,90,190,0.30)',
  outline: 'rgba(127,233,255,0.85)', xray: true,
});

const POSES = {
  stand: { hipY: -222, lean: 0, armL: { a: 0.2, b: 0.12 }, armR: { a: 0.2, b: 0.12 }, legL: { a: 0.07, b: 0 }, legR: { a: 0.07, b: 0 }, hand: 'open', feetFront: 0 },
  flinch: { hipY: -218, lean: 0, armL: { a: 0.75, b: 1.2 }, armR: { a: 0.75, b: 1.2 }, legL: { a: 0.1, b: 0 }, legR: { a: 0.1, b: 0 }, hand: 'open', feetFront: 0 },
  zap: { hipY: -228, lean: 0, armL: { a: 2.15, b: 0.1 }, armR: { a: 2.15, b: 0.1 }, legL: { a: 0.3, b: 0 }, legR: { a: 0.3, b: 0 }, hand: 'spread', feetFront: 0 },
  sit: { hipY: -34, lean: -0.05, armL: { a: 0.45, b: -0.1 }, armR: { a: 0.45, b: -0.1 }, legL: { a: 2.25, b: -1.95 }, legR: { a: 2.25, b: -1.95 }, hand: 'open', feetFront: 1 },
  // lying on the back (overhead view): arms resting along the body, legs straight
  sleep: { hipY: -222, lean: 0, armL: { a: 0.3, b: 0.1 }, armR: { a: 0.26, b: 0.16 }, legL: { a: 0.05, b: 0 }, legR: { a: 0.08, b: -0.02 }, hand: 'open', feetFront: 1 },
  // the hypnic jerk: arms fling out, legs kick, fingers spread
  jolt: { hipY: -222, lean: 0, armL: { a: 2.05, b: 0.55 }, armR: { a: 1.2, b: -0.4 }, legL: { a: 0.3, b: -0.35 }, legR: { a: 0.22, b: 0.28 }, hand: 'spread', feetFront: 1 },
  // sitting up in bed, scratching the head
  scratch: { hipY: -34, lean: 0.04, armL: { a: 0.45, b: -0.1 }, armR: { a: 2.7, b: 1.18 }, legL: { a: 2.25, b: -1.95 }, legR: { a: 2.25, b: -1.95 }, hand: 'open', feetFront: 1 },
  // free fall: limbs thrown up and out
  fall: { hipY: -222, lean: 0, armL: { a: 2.3, b: 0.35 }, armR: { a: 2.05, b: 0.55 }, legL: { a: 0.45, b: -0.6 }, legR: { a: 0.25, b: 0.5 }, hand: 'spread', feetFront: 1 },
  sitThumb: { hipY: -34, lean: -0.02, armL: { a: 0.45, b: -0.1 }, armR: { a: 0.85, b: 1.95 }, legL: { a: 2.25, b: -1.95 }, legR: { a: 2.25, b: -1.95 }, hand: 'thumbR', feetFront: 1 },
};
function lerpPose(p, q, k) {
  const L = (a, b) => lerp(a, b, k);
  const J = (a, b) => ({ a: L(a.a, b.a), b: L(a.b, b.b) });
  return { hipY: L(p.hipY, q.hipY), lean: L(p.lean, q.lean), armL: J(p.armL, q.armL), armR: J(p.armR, q.armR),
    legL: J(p.legL, q.legL), legR: J(p.legR, q.legR), hand: k < 0.5 ? p.hand : q.hand, feetFront: L(p.feetFront, q.feetFront) };
}

const FACES = {
  worried: { eyeOpen: 1.15, pupil: 0.85, lookX: 0, lookY: -1, browY: 0.8, browTilt: 1, mouth: 'o', mouthOpen: 0.45, blink: 0, cross: 0 },
  shock: { eyeOpen: 1.35, pupil: 0.55, lookX: 0, lookY: 0, browY: 1.4, browTilt: 0.3, mouth: 'scream', mouthOpen: 1, blink: 0, cross: 0 },
  dazed: { eyeOpen: 0.8, pupil: 0.9, lookX: 0, lookY: 0.2, browY: -0.2, browTilt: 0.2, mouth: 'wavy', mouthOpen: 0.3, blink: 0.45, cross: 1 },
  grin: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 0.5, browTilt: -0.2, mouth: 'grin', mouthOpen: 1, blink: 0, cross: 0 },
  nervous: { eyeOpen: 1.25, pupil: 0.7, lookX: 0.2, lookY: -1, browY: 1, browTilt: 1.2, mouth: 'grimace', mouthOpen: 1, blink: 0, cross: 0 },
  calm: { eyeOpen: 1, pupil: 1, lookX: 0.15, lookY: -0.2, browY: 0.1, browTilt: 0.1, mouth: 'flat', mouthOpen: 0.3, blink: 0, cross: 0 },
  sleepy: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: -0.1, browTilt: -0.1, mouth: 'flat', mouthOpen: 0.1, blink: 1, cross: 0 },
  drowsy: { eyeOpen: 0.9, pupil: 1, lookX: 0, lookY: 0.4, browY: -0.3, browTilt: -0.1, mouth: 'flat', mouthOpen: 0.1, blink: 0.62, cross: 0 },
  startled: { eyeOpen: 1.4, pupil: 0.5, lookX: 0, lookY: 0, browY: 1.5, browTilt: 0.4, mouth: 'o', mouthOpen: 0.8, blink: 0, cross: 0 },
  confused: { eyeOpen: 1.1, pupil: 0.85, lookX: -0.8, lookY: -0.3, browY: 0.7, browTilt: 0.9, mouth: 'wavy', mouthOpen: 0.3, blink: 0, cross: 0 },
  annoyed: { eyeOpen: 1, pupil: 0.95, lookX: 0.5, lookY: -0.8, browY: -0.2, browTilt: -0.7, mouth: 'flat', mouthOpen: 0, blink: 0.4, cross: 0 },
  out: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: -0.2, browTilt: 0.2, mouth: 'flat', mouthOpen: 0.2, blink: 1, cross: 0 },
  // a full yawn: jaw dropped (the head stretches down), eyes squeezed shut, brows up. Blend toward it with lerpFace;
  // jaw/squeeze/tear are 0 on every other face (lerpFace treats a missing number as 0 via faceNum)
  yawn: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 1.2, browTilt: 0.7, mouth: 'yawn', mouthOpen: 1, blink: 1, cross: 0, jaw: 1, squeeze: 1, tear: 0 },
};
// procedural walk toward camera: knees alternate, arms counter-swing, body bobs
function walkPose(t, speed = 7) {
  const ph = Math.sin(t * speed), q = Math.cos(t * speed);
  const p = JSON.parse(JSON.stringify(POSES.stand));
  p.legL = { a: 0.07 + 0.05 * Math.max(0, ph), b: -0.35 * Math.max(0, ph) };
  p.legR = { a: 0.07 + 0.05 * Math.max(0, -ph), b: -0.35 * Math.max(0, -ph) };
  p.armL = { a: 0.2 + 0.12 * ph, b: 0.25 + 0.15 * Math.max(0, ph) };
  p.armR = { a: 0.2 - 0.12 * ph, b: 0.25 + 0.15 * Math.max(0, -ph) };
  p.hipY = -222 + 5 * Math.abs(q);
  return p;
}
function lerpFace(p, q, k) {
  const o = {};
  for (const key of new Set([...Object.keys(p), ...Object.keys(q)])) {
    const a = p[key], b = q[key];
    if (typeof a === 'number' || typeof b === 'number') o[key] = lerp(a || 0, b || 0, k);
    else o[key] = k < 0.5 ? a : b;
  }
  // a yawn mouth opens from a closed one: keep the 'yawn' mouth once the jaw is moving
  if ((p.mouth === 'yawn' || q.mouth === 'yawn') && (o.jaw || 0) > 0.12) o.mouth = 'yawn';
  return o;
}

const DIR = (side, th) => [side * Math.sin(th), Math.cos(th)];

// joints in local coordinates
function rig(pose) {
  const P = [0, pose.hipY], cs = Math.cos(pose.lean), sn = Math.sin(pose.lean);
  const U = (x, y) => [P[0] + x * cs - y * sn, P[1] + x * sn + y * cs];
  const r = { P, U, lean: pose.lean };
  for (const [s, k] of [[-1, 'L'], [1, 'R']]) {
    const arm = pose['arm' + k], leg = pose['leg' + k];
    const sh = U(74 * s, -148);
    const d1 = DIR(s, arm.a + pose.lean * s), d2 = DIR(s, arm.a + arm.b + pose.lean * s);
    const el = [sh[0] + d1[0] * 100, sh[1] + d1[1] * 100];
    const wr = [el[0] + d2[0] * 90, el[1] + d2[1] * 90];
    const hip = [36 * s, pose.hipY + 4];
    const e1 = DIR(s, leg.a), e2 = DIR(s, leg.a + leg.b);
    const kn = [hip[0] + e1[0] * 104, hip[1] + e1[1] * 104];
    const an = [kn[0] + e2[0] * 98, kn[1] + e2[1] * 98];
    r['sh' + k] = sh; r['el' + k] = el; r['wr' + k] = wr; r['hip' + k] = hip; r['kn' + k] = kn; r['an' + k] = an;
    r['armDir' + k] = d2;
  }
  r.neck = U(0, -176);
  r.head = U(0, -248);
  r.heart = U(16, -108);
  r.chest = U(0, -100);
  return r;
}

function capsuleShaded(c, a, b, w, base, shade, hi, pal) {
  line(c, a[0], a[1], b[0], b[1], w, shade);
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L, ny = dx / L; // normal
  const o = nx < 0 ? -1 : 1; // push the lit part toward screen-left
  line(c, a[0] - nx * o * w * 0.12, a[1] - ny * o * w * 0.12, b[0] - nx * o * w * 0.12, b[1] - ny * o * w * 0.12, w * 0.72, base);
  if (hi) line(c, a[0] - nx * o * w * 0.28, a[1] - ny * o * w * 0.28, b[0] - nx * o * w * 0.28, b[1] - ny * o * w * 0.28, w * 0.16, hi);
  if (pal.outline) {
    c.lineWidth = 3; c.strokeStyle = pal.outline;
    const h = w / 2;
    c.beginPath(); c.moveTo(a[0] + nx * h, a[1] + ny * h); c.lineTo(b[0] + nx * h, b[1] + ny * h);
    c.moveTo(a[0] - nx * h, a[1] - ny * h); c.lineTo(b[0] - nx * h, b[1] - ny * h); c.stroke();
  }
}

function fillOut(c, fill, pal) {
  c.fillStyle = fill; c.fill();
  if (pal.outline) { c.lineWidth = 3; c.strokeStyle = pal.outline; c.stroke(); }
}

function drawHand(c, wr, d, kind, pal, side, t) {
  const hx = wr[0] + d[0] * 14, hy = wr[1] + d[1] * 14;
  if (kind === 'spread') {
    for (let i = -2; i <= 2; i++) {
      const ang = Math.atan2(d[1], d[0]) + i * 0.38;
      line(c, hx, hy, hx + Math.cos(ang) * 34, hy + Math.sin(ang) * 34, 11, pal.skinSh);
      line(c, hx, hy, hx + Math.cos(ang) * 32, hy + Math.sin(ang) * 32, 7, pal.skin);
    }
  }
  circle(c, hx, hy, 21, pal.skinSh);
  circle(c, hx - 2, hy - 2, 18, pal.skin);
  if (pal.outline) { c.beginPath(); c.arc(hx, hy, 21, 0, 7); c.lineWidth = 3; c.strokeStyle = pal.outline; c.stroke(); }
  if (kind === 'thumb') { // thumbs-up: thumb sticks straight up
    rrect(c, hx - 7, hy - 44, 15, 34, 7); c.fillStyle = pal.skinSh; c.fill();
    rrect(c, hx - 6, hy - 43, 11, 31, 6); c.fillStyle = pal.skin; c.fill();
    line(c, hx - 14, hy - 4, hx + 14, hy - 4, 2.5, pal.skinSh);
    line(c, hx - 14, hy + 5, hx + 14, hy + 5, 2.5, pal.skinSh);
  } else if (kind === 'open') {
    const tx = hx - side * 15, ty = hy - 10;
    circle(c, tx, ty, 8, pal.skinSh); circle(c, tx, ty, 6, pal.skin);
  }
}

function drawShoe(c, an, side, pal, front, missing) {
  if (missing) { // sock only
    ellipse(c, an[0] + side * 4, an[1] + 10, 22, 16, pal.sock);
    return;
  }
  c.save(); c.translate(an[0], an[1]);
  if (front > 0.5) {
    rrect(c, -30, -8, 60, 42, 18); fillOut(c, pal.shoeSh, pal);
    rrect(c, -27, -8, 54, 34, 16); c.fillStyle = pal.shoe; c.fill();
    rrect(c, -31, 24, 62, 12, 6); c.fillStyle = pal.sole; c.fill();
    line(c, -10, 2, 10, 2, 3, '#FFFFFF'); line(c, -10, 10, 10, 10, 3, '#FFFFFF');
  } else {
    c.scale(side, 1);
    c.beginPath(); c.moveTo(-18, -10); c.lineTo(20, -12); c.quadraticCurveTo(54, -8, 58, 14); c.lineTo(-22, 16); c.closePath();
    fillOut(c, pal.shoe, pal);
    c.beginPath(); c.moveTo(20, -12); c.quadraticCurveTo(54, -8, 58, 14); c.lineTo(30, 14); c.closePath();
    c.fillStyle = pal.shoeSh; c.fill();
    rrect(c, -24, 12, 84, 12, 6); c.fillStyle = pal.sole; c.fill();
    line(c, 4, -8, 12, 0, 3, '#FFFFFF'); line(c, 12, -9, 20, -1, 3, '#FFFFFF');
  }
  c.restore();
}

// hair spikes for the "zapped" look (drawn behind the head)
function drawFrizz(c, frizz, pal, t, seed) {
  if (frizz <= 0.01) return;
  const rng = mulberry32(seed || 3);
  c.fillStyle = pal.hair;
  c.beginPath();
  const n = 15;
  for (let i = 0; i <= n; i++) {
    const a = -Math.PI + 0.25 + (i / n) * (Math.PI - 0.5);
    const len = (48 + rng() * 38) * frizz * (1 + 0.08 * vnoise(t * 25 + i, 5));
    const tx = Math.cos(a) * (66 + len), ty = -20 + Math.sin(a) * (70 + len);
    const w = 0.12;
    c.moveTo(Math.cos(a - w) * 58, -20 + Math.sin(a - w) * 64);
    c.lineTo(tx, ty);
    c.lineTo(Math.cos(a + w) * 58, -20 + Math.sin(a + w) * 64);
  }
  c.fill();
  if (pal.outline) { c.lineWidth = 2; c.strokeStyle = pal.outline; c.stroke(); }
}

function drawHead(c, r, face, st, pal, t) {
  const [hx, hy] = r.head;
  c.save(); c.translate(hx + (st.headDX || 0), hy + (st.headDY || 0)); c.rotate(r.lean + (st.headRot || 0));
  drawFrizz(c, st.frizz || 0, pal, t, st.seed);
  // ears
  for (const s of [-1, 1]) {
    ellipse(c, s * 62, 2, 13, 18, pal.skinSh);
    ellipse(c, s * 62, 2, 7, 11, pal.xray ? pal.skin : '#B8704F');
  }
  // head (a yawn drops the jaw: the lower half stretches down)
  const jd = 34 * (face.jaw || 0);
  c.beginPath(); c.ellipse(0, 0, 64, 70, 0, Math.PI, Math.PI * 2); c.ellipse(0, 0, 64 - jd * 0.18, 70 + jd, 0, 0, Math.PI);
  if (pal.xray) fillOut(c, pal.skin, pal);
  else {
    const g = c.createRadialGradient(-24, -26, 8, 0, jd * 0.4, 78 + jd * 0.6);
    g.addColorStop(0, pal.skinHi); g.addColorStop(0.45, pal.skin); g.addColorStop(1, pal.skinSh);
    c.fillStyle = g; c.fill();
  }
  if (!pal.xray) {
    // hair cap with front quiff
    const fz = st.frizz || 0;
    c.beginPath();
    c.moveTo(-66, 10);
    c.quadraticCurveTo(-74, -54, -30, -70 - fz * 6);
    c.quadraticCurveTo(12, -88 - fz * 10, 48, -64);
    c.quadraticCurveTo(76, -44, 66, 10);
    c.quadraticCurveTo(60, -22, 32, -36);
    c.quadraticCurveTo(2, -26, -20, -42);
    c.quadraticCurveTo(-52, -30, -66, 10);
    c.closePath();
    c.fillStyle = pal.hair; c.fill();
    line(c, -26, -58, 6, -68, 5, rgba(pal.hairHi, 0.9));
    // soot
    const so = st.soot || 0;
    if (so > 0) {
      ellipse(c, -34, 22, 18, 10, `rgba(35,28,40,${0.45 * so})`, 0.3);
      ellipse(c, 28, -18, 14, 8, `rgba(35,28,40,${0.35 * so})`, -0.4);
      ellipse(c, 10, 40, 10, 6, `rgba(35,28,40,${0.3 * so})`);
    }
    drawFace(c, face, pal);
  }
  c.restore();
}

function drawFace(c, f, pal) {
  // cheeks
  ellipse(c, -38, 24, 11, 7, 'rgba(255,110,110,0.28)');
  ellipse(c, 38, 24, 11, 7, 'rgba(255,110,110,0.28)');
  // eyes
  const lid = pal.skin[0] === '#' && pal.skinSh[0] === '#' ? mixHex(pal.skin, pal.skinSh, 0.3) : pal.skinSh;
  for (const s of [-1, 1]) {
    const ex = s * 24, ey = -2, ry = 16 * f.eyeOpen;
    if (f.blink >= 0.93) { // closed: a soft lash curve, no eye white
      c.beginPath(); c.moveTo(ex - 14, ey - 1); c.quadraticCurveTo(ex, ey + 10, ex + 14, ey - 1);
      c.lineWidth = 4.5; c.strokeStyle = '#5A2E22'; c.lineCap = 'round'; c.stroke();
      line(c, ex + s * 13, ey - 1, ex + s * 18, ey - 5, 3, '#5A2E22');
    } else {
      ellipse(c, ex, ey, 14 * Math.min(1.15, 0.9 + f.eyeOpen * 0.1), ry, '#FFFFFF');
      const lx = f.cross > 0.5 ? -s * 5 : f.lookX * 5, ly = f.lookY * Math.min(7, ry * 0.45);
      circle(c, ex + lx, ey + ly, 7.5 * f.pupil, pal.pupil);
      circle(c, ex + lx - 2.2, ey + ly - 2.8, 2.6, '#FFFFFF');
      if (f.blink > 0.01) { // upper lid, skin-toned, with a lash line on its edge
        c.save(); c.beginPath(); c.ellipse(ex, ey, 15, ry + 1, 0, 0, Math.PI * 2); c.clip();
        c.fillStyle = lid; c.fillRect(ex - 16, ey - ry - 2, 32, (2 * ry + 2) * f.blink + 1);
        line(c, ex - 15, ey - ry + (2 * ry) * f.blink, ex + 15, ey - ry + (2 * ry) * f.blink, 3.5, '#6A3526');
        c.restore();
      }
    }
    // brow
    const by = -30 - f.browY * 8;
    line(c, s * 11, by - f.browTilt * 7, s * 37, by + f.browTilt * 3, 7.5, pal.hair);
  }
  // a squeezed-shut yawn: creases at the outer eye corners, and a tear
  const sq = f.squeeze || 0;
  if (sq > 0.05) for (const s of [-1, 1]) for (let i = -1; i <= 1; i++)
    line(c, s * 42, -2 + i * 7, s * (50 + 3 * Math.abs(i)), -4 + i * 11, 2.5, `rgba(120,60,40,${0.5 * sq})`);
  const tr = f.tear || 0;
  if (tr > 0.02) { // a tear rolling down from the left eye's outer corner
    const ty = 6 + 30 * tr;
    c.beginPath(); c.moveTo(-40, ty - 12); c.quadraticCurveTo(-33, ty, -40, ty + 7); c.quadraticCurveTo(-47, ty, -40, ty - 12);
    c.fillStyle = `rgba(170,225,255,${0.95 * clamp(tr * 4)})`; c.fill();
    circle(c, -42, ty, 2, `rgba(255,255,255,${clamp(tr * 4)})`);
  }
  // nose
  ellipse(c, 0, 16, 8, 6, 'rgba(190,110,80,0.55)');
  ellipse(c, -2, 14, 3, 2, 'rgba(255,230,210,0.8)');
  // mouth
  const mo = f.mouthOpen;
  c.save(); c.translate(0, 40);
  if (f.mouth === 'o') {
    ellipse(c, 0, 0, 7 + 5 * mo, 8 + 8 * mo, pal.mouth);
    ellipse(c, 0, 5 + 3 * mo, 5 + 3 * mo, 3 + 2 * mo, pal.tongue);
  } else if (f.mouth === 'scream') {
    const h = 14 + 22 * mo;
    rrect(c, -24, -8, 48, h, 16); c.fillStyle = pal.mouth; c.fill();
    c.save(); rrect(c, -24, -8, 48, h, 16); c.clip();
    c.fillStyle = pal.teeth; c.fillRect(-24, -8, 48, 8);
    ellipse(c, 0, h - 6, 15, 8, pal.tongue); c.restore();
  } else if (f.mouth === 'grin') {
    c.beginPath(); c.moveTo(-32, -8); c.quadraticCurveTo(0, 34 * mo + 4, 32, -8); c.closePath();
    c.fillStyle = pal.mouth; c.fill();
    c.save(); c.clip(); c.fillStyle = pal.teeth; c.fillRect(-32, -9, 64, 10);
    ellipse(c, 0, 18 * mo, 13, 7, pal.tongue); c.restore();
  } else if (f.mouth === 'wavy') {
    c.beginPath(); c.moveTo(-18, 0);
    c.bezierCurveTo(-10, -8, -4, 8, 2, 0); c.bezierCurveTo(8, -8, 14, 8, 20, 0);
    c.lineWidth = 5; c.strokeStyle = pal.mouth; c.lineCap = 'round'; c.stroke();
  } else if (f.mouth === 'flat') {
    c.beginPath(); c.moveTo(-14, 0); c.quadraticCurveTo(0, 4 + mo * 4, 14, 0);
    c.lineWidth = 5; c.strokeStyle = pal.mouth; c.lineCap = 'round'; c.stroke();
  } else if (f.mouth === 'yawn') { // tall open oval, upper teeth, uvula, tongue; slides down with the jaw
    const jd2 = 34 * (f.jaw || 0), rx = 15 + 9 * mo, ry = 6 + 28 * mo;
    c.translate(0, -2 + jd2 * 0.66);
    ellipse(c, 0, 0, rx + 3, ry + 3, 'rgba(150,70,60,0.45)');
    ellipse(c, 0, 0, rx, ry, pal.mouth);
    c.save(); c.beginPath(); c.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); c.clip();
    c.fillStyle = pal.teeth; c.fillRect(-rx, -ry, 2 * rx, 6 * mo + 1);
    ellipse(c, 0, -ry + 12 * mo, 4 * mo, 7 * mo, '#C4405A');                 // uvula
    ellipse(c, 0, ry - 2, rx * 0.8, 9 + 8 * mo, pal.tongue);                 // tongue
    line(c, 0, ry - 10 - 6 * mo, 0, ry, 2, 'rgba(150,40,60,0.5)');
    c.restore();
  } else if (f.mouth === 'grimace') {
    rrect(c, -26, -9, 52, 20, 8); c.fillStyle = pal.teeth; c.fill();
    c.lineWidth = 3.5; c.strokeStyle = pal.mouth; c.stroke();
    line(c, -24, 1, 24, 1, 2.5, pal.mouth);
    for (const x of [-13, 0, 13]) line(c, x, -8, x, 10, 2, 'rgba(90,21,34,0.6)');
  }
  c.restore();
}

// Draw the whole character into context c (already in world transform).
// st: {x, y, s, pose, face, frizz, soot, shoeMissingL, headDX, headDY, headRot, xray, seed}
function drawCharacter(c, st, t, pal = PAL) {
  const pose = st.pose, face = st.face;
  const r = rig(pose);
  c.save(); c.translate(st.x, st.y); c.scale(st.s, st.s);
  // legs (skipped when they are under the covers)
  if (!st.noLegs) {
    for (const [s, k] of [[-1, 'L'], [1, 'R']]) {
      capsuleShaded(c, r['hip' + k], r['kn' + k], 50, pal.pants, pal.pantsSh, null, pal);
      capsuleShaded(c, r['kn' + k], r['an' + k], 45, pal.pants, pal.pantsSh, null, pal);
    }
    for (const [s, k] of [[-1, 'L'], [1, 'R']]) drawShoe(c, r['an' + k], s, pal, pose.feetFront, pal.pj || (k === 'L' && st.shoeMissingL));
  }
  // upper body (pelvis space)
  c.save(); c.translate(r.P[0], r.P[1]); c.rotate(pose.lean);
  if (!pal.bare) ellipse(c, 0, -170, 72, 26, pal.coatDk); // hood bunched behind the neck
  c.beginPath();
  c.moveTo(-60, -166); c.lineTo(60, -166);
  c.quadraticCurveTo(86, -163, 86, -136);
  c.lineTo(73, -52); c.lineTo(84, 10);
  c.quadraticCurveTo(0, 26, -84, 10);
  c.lineTo(-73, -52); c.lineTo(-86, -136);
  c.quadraticCurveTo(-86, -163, -60, -166); c.closePath();
  if (pal.xray) fillOut(c, pal.coat, pal);
  else {
    const g = c.createLinearGradient(-86, 0, 86, 0);
    g.addColorStop(0, pal.coatHi); g.addColorStop(0.25, pal.coat); g.addColorStop(0.7, pal.coat); g.addColorStop(1, pal.coatSh);
    c.fillStyle = g; c.fill();
    if (pal.bare) { // bare shoulders (bath): collarbones + a soft chest shade
      c.beginPath(); c.moveTo(-52, -150); c.quadraticCurveTo(-26, -140, -6, -148); c.moveTo(52, -150); c.quadraticCurveTo(26, -140, 6, -148);
      c.lineWidth = 5; c.strokeStyle = rgba(pal.skinSh, 0.55); c.lineCap = 'round'; c.stroke();
      ellipse(c, 0, -60, 60, 70, rgba(pal.skinSh, 0.18));
    } else if (pal.pj) { // pajama top: button placket + collar
      line(c, 0, -160, 0, 16, 5, pal.coatDk);
      for (let y = -140; y < 10; y += 34) { circle(c, 8, y, 6, pal.coatHi); circle(c, 8, y, 3, pal.coatDk); }
      for (const s of [-1, 1]) {
        c.beginPath(); c.moveTo(s * 4, -168); c.lineTo(s * 40, -168); c.lineTo(s * 12, -132); c.closePath();
        c.fillStyle = pal.coatHi; c.fill();
      }
    } else {
      // zipper, pockets, straps, collar
      line(c, 0, -160, 0, 16, 4, pal.coatDk);
      rrect(c, -5, -150, 10, 18, 3); c.fillStyle = '#9B9FB0'; c.fill();
      rrect(c, -64, -40, 44, 12, 5); c.fillStyle = pal.coatSh; c.fill();
      rrect(c, 20, -40, 44, 12, 5); c.fillStyle = pal.coatSh; c.fill();
      for (const s of [-1, 1]) {
        c.beginPath(); c.moveTo(s * 40, -166); c.quadraticCurveTo(s * 52, -110, s * 44, -64);
        c.lineWidth = 16; c.strokeStyle = pal.strapSh; c.lineCap = 'round'; c.stroke();
        c.lineWidth = 11; c.strokeStyle = pal.strap; c.stroke();
        rrect(c, s * 44 - 10, -104, 20, 12, 3); c.fillStyle = '#20263F'; c.fill();
        c.beginPath(); c.moveTo(s * 4, -168); c.lineTo(s * 30, -168); c.lineTo(s * 10, -140); c.closePath();
        c.fillStyle = pal.coatHi; c.fill();
      }
    }
    const so = st.soot || 0;
    if (so > 0) {
      ellipse(c, -30, -110, 26, 14, `rgba(35,28,40,${0.35 * so})`, 0.4);
      ellipse(c, 40, -20, 20, 12, `rgba(35,28,40,${0.3 * so})`, -0.3);
    }
  }
  // neck
  rrect(c, -17, -196, 34, 36, 10); c.fillStyle = pal.skinSh; c.fill();
  if (pal.outline) { c.lineWidth = 3; c.strokeStyle = pal.outline; c.stroke(); }
  c.restore();
  // arms (in front of torso)
  for (const [s, k] of [[-1, 'L'], [1, 'R']]) {
    capsuleShaded(c, r['sh' + k], r['el' + k], 42, pal.coat, pal.coatSh, pal.xray ? null : pal.coatHi, pal);
    capsuleShaded(c, r['el' + k], r['wr' + k], 38, pal.coat, pal.coatSh, pal.xray ? null : pal.coatHi, pal);
    const wr = r['wr' + k], d = r['armDir' + k];
    line(c, wr[0] - d[0] * 6, wr[1] - d[1] * 6, wr[0] + d[0] * 2, wr[1] + d[1] * 2, 42, pal.coatSh);
    let hk = pose.hand;
    if (hk === 'thumbR') hk = k === 'R' ? 'thumb' : 'open';
    drawHand(c, wr, d, hk, pal, s, t);
  }
  drawHead(c, r, face, st, pal, t);
  c.restore();
  return r;
}

// map a local rig point to world coords
function toWorld(st, p) { return [st.x + p[0] * st.s, st.y + p[1] * st.s]; }

// ---------- x-ray skeleton + heart ----------
function drawBones(c, st, r, t, heartScale, alpha) {
  const col = `rgba(225,240,255,${0.92 * alpha})`, col2 = `rgba(160,200,255,${0.7 * alpha})`;
  c.save(); c.translate(st.x, st.y); c.scale(st.s, st.s);
  const bone = (a, b, w) => {
    line(c, a[0], a[1], b[0], b[1], w, col);
    circle(c, a[0], a[1], w * 0.75, col); circle(c, b[0], b[1], w * 0.75, col);
  };
  for (const k of ['L', 'R']) {
    bone(r['sh' + k], r['el' + k], 11); bone(r['el' + k], r['wr' + k], 9);
    bone(r['hip' + k], r['kn' + k], 13); bone(r['kn' + k], r['an' + k], 11);
    const wr = r['wr' + k], d = r['armDir' + k];
    for (let i = -2; i <= 2; i++) {
      const ang = Math.atan2(d[1], d[0]) + i * 0.3;
      line(c, wr[0] + d[0] * 6, wr[1] + d[1] * 6, wr[0] + Math.cos(ang) * 36, wr[1] + Math.sin(ang) * 36, 4, col2);
    }
  }
  c.save(); c.translate(r.P[0], r.P[1]); c.rotate(r.lean);
  for (let i = 0; i < 11; i++) rrect(c, -7, -170 + i * 15.5, 14, 11, 4), (c.fillStyle = col, c.fill()); // spine
  for (let i = 0; i < 6; i++) { // ribs
    const y = -150 + i * 15, w = 58 - Math.abs(i - 2) * 5;
    c.beginPath(); c.moveTo(-6, y); c.quadraticCurveTo(-w, y - 8, -w + 8, y + 16);
    c.moveTo(6, y); c.quadraticCurveTo(w, y - 8, w - 8, y + 16);
    c.lineWidth = 6; c.strokeStyle = col2; c.lineCap = 'round'; c.stroke();
  }
  line(c, -70, -150, -8, -158, 7, col); line(c, 70, -150, 8, -158, 7, col); // clavicles
  c.beginPath(); c.moveTo(-44, -10); c.quadraticCurveTo(0, -34, 44, -10); c.quadraticCurveTo(30, 22, 0, 16);
  c.quadraticCurveTo(-30, 22, -44, -10); c.fillStyle = col2; c.fill(); // pelvis
  c.restore();
  // skull
  const [hx, hy] = r.head;
  c.save(); c.translate(hx, hy); c.rotate(r.lean);
  ellipse(c, 0, -6, 52, 58, col);
  ellipse(c, -20, -6, 13, 15, `rgba(10,20,60,${0.85 * alpha})`);
  ellipse(c, 20, -6, 13, 15, `rgba(10,20,60,${0.85 * alpha})`);
  ellipse(c, 0, 14, 5, 7, `rgba(10,20,60,${0.8 * alpha})`);
  rrect(c, -24, 30, 48, 20, 8); c.fillStyle = col; c.fill();
  for (const x of [-12, 0, 12]) line(c, x, 31, x, 48, 2, `rgba(10,20,60,${0.6 * alpha})`);
  c.restore();
  c.restore();
}

function drawHeart(c, g, st, r, s, alpha) {
  const [x, y] = toWorld(st, r.heart);
  const k = st.s * s * 30;
  const heartPath = (cc) => {
    cc.beginPath();
    cc.moveTo(x, y + k * 0.9);
    cc.bezierCurveTo(x - k * 1.3, y + k * 0.1, x - k * 0.9, y - k * 1.0, x, y - k * 0.35);
    cc.bezierCurveTo(x + k * 0.9, y - k * 1.0, x + k * 1.3, y + k * 0.1, x, y + k * 0.9);
  };
  heartPath(c); c.fillStyle = `rgba(255,70,95,${0.95 * alpha})`; c.fill();
  heartPath(g); g.fillStyle = `rgba(255,60,90,${0.8 * alpha})`; g.fill();
  ellipse(c, x - k * 0.4, y - k * 0.35, k * 0.22, k * 0.14, `rgba(255,200,210,${0.7 * alpha})`, -0.6);
}

// skin-surface paths (local coords) for the flash-over current
function skinPaths(r) {
  const out = [];
  const [hx, hy] = r.head;
  for (const s of [-1, 1]) {
    const k = s < 0 ? 'L' : 'R';
    const P = [];
    for (let a = -90; a <= 60; a += 10) { // over the head
      const rad = (a * Math.PI) / 180;
      P.push([hx + s * Math.cos(rad) * 66, hy + Math.sin(rad) * 72]);
    }
    P.push(r.U(s * 19, -186), r.U(s * 40, -170), r.U(s * 80, -150)); // neck → shoulder
    // down the torso side
    P.push(r.U(s * 76, -110), r.U(s * 73, -52), r.U(s * 84, 10));
    // outer leg edge
    const off = (a, b, d) => {
      const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
      return [[a[0] - (dy / L) * d * -s, a[1] + (dx / L) * d * -s], [b[0] - (dy / L) * d * -s, b[1] + (dx / L) * d * -s]];
    };
    const [h1, k1] = off(r['hip' + k], r['kn' + k], 25), [k2, a2] = off(r['kn' + k], r['an' + k], 22);
    P.push(h1, k1, k2, a2, [r['an' + k][0] + s * 30, r['an' + k][1] + 22], [r['an' + k][0] + s * 70, r['an' + k][1] + 26]);
    out.push(P);
    // inner leg edge
    const [i1, i2] = off(r['hip' + k], r['kn' + k], -25), [i3, i4] = off(r['kn' + k], r['an' + k], -22);
    out.push([r.U(s * 50, -120), r.U(s * 30, -40), [s * 6, r.P[1] + 14], i1, i2, i3, i4, [r['an' + k][0] - s * 10, r['an' + k][1] + 24]]);
    // along the raised arm (top edge) out to the fingers
    const sh = r['sh' + k], el = r['el' + k], wr = r['wr' + k], d = r['armDir' + k];
    const n1 = [-d[1] * s, d[0] * s];
    out.push([r.U(s * 60, -164), [sh[0] + n1[0] * -21, sh[1] + n1[1] * -21], [el[0] + n1[0] * -20, el[1] + n1[1] * -20],
      [wr[0] + n1[0] * -19, wr[1] + n1[1] * -19], [wr[0] + d[0] * 48, wr[1] + d[1] * 48]]);
  }
  return out;
}
