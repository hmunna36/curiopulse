// What Happens If You NEVER Sleep? (long-form): the props and faces of his living room, on top of home.js.
// The hero (the hiker rig in HOMEPAL, the blue hoodie) tries to stay awake for good: the coffee pot, his mug, the
// RECORD BOOK (the motif: the thing he wants, then the thing that refuses him, then his pillow), the cat who sleeps
// through everything (the running gag; at the end she sleeps on him), the wall clock, the TV, the donut tower, the
// blanket, and the coat by the door that turns its head on day three. World coords = screen coords at zoom 1.
'use strict';

// ---------------------------------------------------------------- faces of a man who will not sleep
FACES.wired = { eyeOpen: 1.45, pupil: 0.42, lookX: 0, lookY: 0, browY: 1.3, browTilt: 0.15, mouth: 'grin', mouthOpen: 0.75, blink: 0, cross: 0 };
FACES.proud = { eyeOpen: 1.05, pupil: 0.95, lookX: 0.4, lookY: -0.3, browY: 0.5, browTilt: -0.5, mouth: 'grin', mouthOpen: 0.45, blink: 0.25, cross: 0 };
FACES.tired = { eyeOpen: 0.9, pupil: 1, lookX: 0, lookY: 0.3, browY: 0, browTilt: 0.7, mouth: 'flat', mouthOpen: 0.15, blink: 0.55, cross: 0 };
FACES.blank = { eyeOpen: 1.0, pupil: 0.55, lookX: 0, lookY: 0.15, browY: -0.1, browTilt: 0, mouth: 'o', mouthOpen: 0.25, blink: 0.2, cross: 0 };
FACES.wreck = { eyeOpen: 1.2, pupil: 0.5, lookX: 0.2, lookY: -0.4, browY: 0.9, browTilt: 1.3, mouth: 'wavy', mouthOpen: 0.4, blink: 0.1, cross: 0 };
FACES.sob = { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 1.0, browTilt: 1.4, mouth: 'scream', mouthOpen: 0.55, blink: 1, cross: 0, squeeze: 0.8 };
FACES.suspicious = { eyeOpen: 0.75, pupil: 0.8, lookX: 0.9, lookY: 0, browY: -0.4, browTilt: -0.9, mouth: 'flat', mouthOpen: 0, blink: 0.45, cross: 0 };
FACES.peace = { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 0.2, browTilt: -0.2, mouth: 'flat', mouthOpen: 0.5, blink: 1, cross: 0 };

// The face, plus what days without sleep do to it: bags under the eyes (f.bags 0..1), red threads in the whites
// (f.red 0..1), tears down both cheeks (f.tears 0..1, a stream that runs), a slack jaw (f.slack). Head units.
const FACE0 = drawFace;
drawFace = function (c, f, pal) {
  const bags = f.bags || 0, red = f.red || 0, tears = f.tears || 0;
  if (bags > 0.02) for (const s of [-1, 1]) {   // drawn first: the eyes sit on top of them
    const ex = s * 24, ry = 16 * f.eyeOpen;
    c.beginPath(); c.ellipse(ex, -2 + ry * 0.55, 19, 9 + 4 * bags, 0, 0.05, Math.PI - 0.05);
    c.lineWidth = 7 + 5 * bags; c.strokeStyle = `rgba(110,60,120,${0.22 + 0.4 * bags})`; c.lineCap = 'round'; c.stroke();
  }
  FACE0(c, f, pal);
  if (red > 0.02 && f.blink < 0.93) for (const s of [-1, 1]) {   // threads from the corners only (never over the pupil)
    const ex = s * 24, ry = 16 * f.eyeOpen;
    for (const [dx, dy, ex2, ey2] of [[-13, -2, -7, -4], [-13, 3, -8, 6], [13, -1, 8, -5], [12, 4, 7, 7]]) {
      line(c, ex + dx, -2 + dy * ry / 16, ex + ex2, -2 + ey2 * ry / 16, 1.6, `rgba(220,40,60,${0.75 * red})`);
    }
  }
  if (tears > 0.02) for (const s of [-1, 1]) {
    const ex = s * 30;
    c.beginPath(); c.moveTo(ex - 3, 10); c.quadraticCurveTo(ex + s * 6, 30 + 30 * tears, ex + s * 2, 26 + 52 * tears);
    c.lineWidth = 6; c.strokeStyle = `rgba(150,215,255,${0.85 * clamp(tears * 2)})`; c.lineCap = 'round'; c.stroke();
    circle(c, ex + s * 2, 28 + 52 * tears, 5, `rgba(170,225,255,${0.9 * clamp(tears * 2)})`);
  }
};

// ---------------------------------------------------------------- the coffee
const COFFEE = '#5A2E14';
// a glass carafe: (x, y) = the bottom centre; o.tilt (rad; + tips the spout toward +x), o.level 0..1, o.steam
function coffeePot(c, x, y, s, t, o = {}) {
  const tilt = o.tilt || 0, lev = o.level === undefined ? 0.6 : o.level;
  c.save(); c.translate(x, y); c.rotate(tilt); c.scale(s, s);
  const P = new Path2D();
  P.moveTo(-40, -150); P.lineTo(40, -150); P.lineTo(46, -128);
  P.bezierCurveTo(98, -104, 104, -10, 70, 0); P.lineTo(-70, 0); P.bezierCurveTo(-104, -10, -98, -104, -46, -128); P.closePath();
  c.fillStyle = 'rgba(200,225,240,0.20)'; c.fill(P);
  // the coffee: its surface stays level in the world whatever the tilt
  if (lev > 0.01) {
    c.save(); c.clip(P);
    c.translate(0, -130 * lev); c.rotate(-tilt);
    c.fillStyle = COFFEE; c.fillRect(-300, 0, 600, 400);
    c.fillStyle = '#8A4A22'; c.fillRect(-300, 0, 600, 7);
    c.restore();
  }
  c.lineWidth = 6; c.strokeStyle = 'rgba(230,245,255,0.85)'; c.stroke(P);
  line(c, -52, -110, -60, -40, 6, 'rgba(255,255,255,0.45)');   // a glint
  // the black collar, spout and handle
  rrect(c, -50, -176, 100, 30, 8); c.fillStyle = '#1C1C26'; c.fill();
  c.beginPath(); c.moveTo(48, -176); c.lineTo(78, -186); c.lineTo(52, -152); c.closePath(); c.fillStyle = '#1C1C26'; c.fill();
  c.beginPath(); c.moveTo(-50, -168); c.bezierCurveTo(-120, -166, -120, -70, -66, -62); c.lineWidth = 18; c.strokeStyle = '#1C1C26'; c.stroke();
  c.restore();
  if (o.steam) steamWisps(c, x + Math.sin(tilt) * 160 * s, y - Math.cos(tilt) * 190 * s, s, t, o.steam);
}
// three rising curls of steam
function steamWisps(c, x, y, s, t, a = 1) {
  for (let i = 0; i < 3; i++) {
    const ph = (t * 0.6 + i / 3) % 1;
    c.beginPath();
    for (let k = 0; k <= 12; k++) {
      const u = k / 12, yy = y - (20 + 120 * ph) * s - u * 70 * s, xx = x + (i - 1) * 22 * s + 14 * s * Math.sin(u * 5 + t * 3 + i);
      if (k) c.lineTo(xx, yy); else c.moveTo(xx, yy);
    }
    c.lineWidth = 7 * s; c.lineCap = 'round'; c.strokeStyle = `rgba(235,240,255,${0.35 * a * Math.sin(Math.PI * ph)})`; c.stroke();
  }
}
// his mug: (x, y) = bottom centre; o.word on its side, o.level, o.steam
function mug(c, x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.rotate(o.tilt || 0); c.scale(s, s);
  c.beginPath(); c.arc(56, -60, 30, -1.2, 1.2); c.lineWidth = 16; c.strokeStyle = o.col || '#E2424B'; c.stroke();
  rrect(c, -56, -120, 112, 120, 18); c.fillStyle = o.col || '#E2424B'; c.fill();
  ellipse(c, 0, -118, 54, 13, o.colDk || '#A82A33');
  if ((o.level || 0.8) > 0) ellipse(c, 0, -116, 46, 9, COFFEE);
  rrect(c, -44, -98, 22, 80, 10); c.fillStyle = 'rgba(255,255,255,0.18)'; c.fill();
  if (o.word) { c.font = '400 40px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#FFF4DA'; c.fillText(o.word, 4, -58); }
  c.restore();
  if (o.steam) steamWisps(c, x, y - 120 * s, s, t, o.steam);
}

// ---------------------------------------------------------------- the record book (the motif)
// (x, y) = the middle of its bottom edge; w = width of the open spread. open 0 = shut (cover up), 1 = open flat.
// o.left / o.right: what the pages say ({title, big, sub}); o.stamp 0..1 (NO LONGER ACCEPTED), o.glow, o.tilt
function recordBook(c, x, y, w, t, o = {}) {
  const open = clamp(o.open === undefined ? 1 : o.open), h = w * 0.36;
  c.save(); c.translate(x, y); c.rotate(o.tilt || 0);
  if (o.glow > 0) softDot(c, 0, -h * 0.6, w * 0.8, '#FFD27A', 0.25 * o.glow);
  // the shadow it casts
  ellipse(c, 0, 4, w * 0.56, h * 0.12, 'rgba(0,0,0,0.35)');
  if (open < 0.5) {   // shut: the red cover with gold letters (a page block shows at the side)
    const k = 1 - open * 2, cw = w * 0.5;
    rrect(c, -cw / 2 - 6, -h - 4, cw + 12, h + 14, 10); c.fillStyle = '#F4ECD8'; c.fill();
    c.save(); c.scale(Math.max(0.05, k), 1);
    rrect(c, -cw / 2, -h - 12, cw, h + 8, 10); c.fillStyle = '#B8202E'; c.fill();
    rrect(c, -cw / 2 + 14, -h + 2, cw - 28, h - 22, 6); c.lineWidth = 4; c.strokeStyle = '#E8B84A'; c.stroke();
    c.font = `400 ${Math.round(w * 0.075)}px Anton`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#F2C75C';
    c.fillText('THE BOOK OF', 0, -h * 0.66); c.font = `400 ${Math.round(w * 0.12)}px Anton`; c.fillText('RECORDS', 0, -h * 0.38);
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.32; circle(c, Math.cos(a) * w * 0.05, -h * 0.13 + Math.sin(a) * w * 0.02, 5, '#F2C75C'); }
    c.restore();
  } else {            // open: two pages, the spine in the middle
    const k = (open - 0.5) * 2, pw = w / 2;
    rrect(c, -pw - 10, -h - 2, w + 20, h + 14, 8); c.fillStyle = '#8A1620'; c.fill();
    for (const s of [-1, 1]) {
      c.save(); c.scale(s < 0 ? 1 : Math.max(0.05, k), 1);
      c.beginPath(); c.moveTo(0, -h + 6); c.quadraticCurveTo(s * pw * 0.5, -h - 10, s * pw, -h + 2); c.lineTo(s * pw, 0);
      c.quadraticCurveTo(s * pw * 0.5, -10, 0, 4); c.closePath();
      const g = c.createLinearGradient(0, 0, s * pw, 0); g.addColorStop(0, '#D8CDB2'); g.addColorStop(0.12, '#FBF5E6'); g.addColorStop(1, '#F4ECD8');
      c.fillStyle = g; c.fill();
      c.restore();
    }
    if (k > 0.8) {
      const L = o.left || { title: 'LONGEST TIME', big: 'AWAKE', sub: '' }, R = o.right || { title: '', big: '11 DAYS', sub: '' };
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillStyle = '#6A1A22'; c.font = `900 ${Math.round(w * 0.04)}px Montserrat`; c.fillText(L.title, -pw / 2, -h * 0.72);
      c.font = `400 ${Math.round(w * 0.085)}px Anton`; c.fillStyle = '#2A1A1A'; c.fillText(L.big, -pw / 2, -h * 0.47);
      if (L.sub) { c.font = `800 ${Math.round(w * 0.03)}px Montserrat`; c.fillStyle = '#6A5A50'; c.fillText(L.sub, -pw / 2, -h * 0.22); }
      if (R.title) { c.fillStyle = '#6A1A22'; c.font = `900 ${Math.round(w * 0.04)}px Montserrat`; c.fillText(R.title, pw / 2, -h * 0.72); }
      c.font = `400 ${Math.round(w * 0.1)}px Anton`; c.fillStyle = '#B8202E'; c.fillText(R.big, pw / 2, -h * 0.45);
      if (R.sub) { c.font = `800 ${Math.round(w * 0.03)}px Montserrat`; c.fillStyle = '#6A5A50'; c.fillText(R.sub, pw / 2, -h * 0.2); }
      for (let i = 0; i < 4; i++) { line(c, -pw * 0.85, -h * 0.12 + i * 9, -pw * 0.15, -h * 0.12 + i * 9, 3, 'rgba(60,40,30,0.18)'); }
    }
    if ((o.stamp || 0) > 0) {   // the red stamp across the right page
      const sk = o.stamp, sc = lerp(2.2, 1, E.outCubic(clamp(sk * 1.4)));
      c.save(); c.translate(pw / 2, -h * 0.45); c.rotate(-0.2); c.scale(sc, sc); c.globalAlpha = clamp(sk * 3);
      rrect(c, -pw * 0.46, -h * 0.2, pw * 0.92, h * 0.4, 10); c.lineWidth = 9; c.strokeStyle = '#E2242E'; c.stroke();
      c.font = `400 ${Math.round(w * 0.05)}px Anton`; c.fillStyle = '#E2242E'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('NO LONGER', 0, -h * 0.07); c.fillText('ACCEPTED', 0, h * 0.09);
      c.restore();
    }
  }
  c.restore();
}

// ---------------------------------------------------------------- the cat (she sleeps through the whole film)
const CATP = { fur: '#F2923C', dark: '#C96A22', light: '#FFDDB0', ear: '#F7A8B0', line: '#7A3A12', nose: '#E0707E' };
// curled up asleep, seen from the front-ish: (x, y) = where she rests; o.breathe, o.eye 0..1 (one eye opens),
// o.flip (mirror), o.ear (a twitch), o.talk 0..1 (her mouth moves: the hallucination), o.zzz
function catCurl(c, x, y, s, t, o = {}) {
  const F = CATP, br = 1 + 0.03 * Math.sin(t * 1.6) * (o.breathe === undefined ? 1 : o.breathe);
  c.save(); c.translate(x, y); c.scale(s * (o.flip ? -1 : 1), s);
  ellipse(c, 0, 6, 150, 24, 'rgba(0,0,0,0.28)');
  // the body: a loaf curled into a ring
  c.save(); c.scale(1, br);
  c.beginPath(); c.ellipse(0, -62, 150, 70, 0, 0, Math.PI * 2);
  const g = c.createRadialGradient(-40, -100, 10, 0, -60, 170); g.addColorStop(0, '#FFB25E'); g.addColorStop(0.65, F.fur); g.addColorStop(1, '#D97A28');
  c.fillStyle = g; c.fill();
  for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-90 + i * 40, -126); c.quadraticCurveTo(-80 + i * 40, -90, -96 + i * 42, -64); c.lineWidth = 12; c.lineCap = 'round'; c.strokeStyle = F.dark; c.stroke(); }
  c.restore();
  // the tail wraps round the front, over her paws
  c.beginPath(); c.moveTo(140, -40); c.bezierCurveTo(150, 10, 40, 22, -60, 8); c.lineWidth = 34; c.lineCap = 'round'; c.strokeStyle = F.fur; c.stroke();
  for (const u of [0.3, 0.55, 0.8]) { const px = lerp(140, -60, u), py = lerp(-30, 10, u) + 18 * Math.sin(u * 3.2); line(c, px - 4, py - 15, px + 4, py + 15, 9, F.dark); }
  circle(c, -60, 8, 17, F.dark);
  // the head, tucked at the left end, resting on the tail
  c.save(); c.translate(-96, -52 + 2 * Math.sin(t * 1.6)); c.rotate(-0.18);
  for (const s2 of [-1, 1]) {   // ears (the right one twitches now and then)
    const tw = s2 > 0 ? (o.ear || 0) : 0;
    c.save(); c.translate(s2 * 34, -40); c.rotate(s2 * (0.35 + 0.3 * tw));
    c.beginPath(); c.moveTo(-20, 8); c.lineTo(0, -40); c.lineTo(20, 8); c.closePath(); c.fillStyle = F.fur; c.fill();
    c.beginPath(); c.moveTo(-10, 4); c.lineTo(0, -24); c.lineTo(10, 4); c.closePath(); c.fillStyle = F.ear; c.fill();
    c.restore();
  }
  ellipse(c, 0, 0, 62, 52, F.fur);
  ellipse(c, 0, 18, 40, 24, F.light);
  line(c, -14, -40, -8, -22, 7, F.dark); line(c, 0, -44, 0, -24, 7, F.dark); line(c, 14, -40, 8, -22, 7, F.dark);
  const eye = clamp(o.eye || 0);
  for (const s2 of [-1, 1]) {
    const ex = s2 * 24, ey = -2;
    if (s2 > 0 && eye > 0.05) {   // one eye opens: a green slit that widens
      ellipse(c, ex, ey, 13, 2 + 10 * eye, '#CFE86A'); ellipse(c, ex, ey, 3, 2 + 9 * eye, '#1A1A10');
      line(c, ex - 14, ey - 9 * eye - 2, ex + 14, ey - 11 * eye - 2, 4, F.line);
    } else { c.beginPath(); c.arc(ex, ey - 6, 12, 0.25 * Math.PI, 0.75 * Math.PI); c.lineWidth = 4.5; c.strokeStyle = F.line; c.lineCap = 'round'; c.stroke(); }
  }
  c.beginPath(); c.moveTo(-7, 12); c.lineTo(7, 12); c.lineTo(0, 20); c.closePath(); c.fillStyle = F.nose; c.fill();
  const talk = o.talk || 0;
  if (talk > 0.02) ellipse(c, 0, 30, 9, 3 + 9 * talk * Math.abs(Math.sin(t * 16)), '#5A1522');
  else { c.beginPath(); c.moveTo(-10, 26); c.quadraticCurveTo(-4, 31, 0, 25); c.quadraticCurveTo(4, 31, 10, 26); c.lineWidth = 3; c.strokeStyle = F.line; c.stroke(); }
  for (const s2 of [-1, 1]) for (const dy of [-4, 4]) line(c, s2 * 26, 20 + dy, s2 * 66, 14 + dy * 2.2, 2, 'rgba(255,240,220,0.7)');
  c.restore();
  c.restore();
  if (o.zzz) zzz(x + (o.flip ? 1 : -1) * 70 * s, y - 150 * s, t, -10, o.zzz, s * 1.2);
}
// her round bed (behind her)
function catBed(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  ellipse(c, 0, -10, 190, 52, '#6A3A7A'); ellipse(c, 0, -20, 160, 34, '#4A2A5A'); ellipse(c, 0, -26, 150, 26, '#8A5A9A');
  c.restore();
}

// ---------------------------------------------------------------- the wall clock, the moon, the window light
// an analog clock; hrs = hours on the dial (float; the hands follow it), o.spin adds motion blur rings
function wallClock(c, x, y, r, hrs, o = {}) {
  c.save(); c.translate(x, y);
  circle(c, 0, 0, r + 10, '#20264C'); circle(c, 0, 0, r, o.face || '#E8EAF4');
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; line(c, Math.sin(a) * r * 0.8, -Math.cos(a) * r * 0.8, Math.sin(a) * r * 0.92, -Math.cos(a) * r * 0.92, i % 3 ? 3 : 6, '#20264C'); }
  const ah = (hrs / 12) * Math.PI * 2, am = (hrs % 1) * Math.PI * 2;
  line(c, 0, 0, Math.sin(ah) * r * 0.5, -Math.cos(ah) * r * 0.5, 8, '#20264C');
  line(c, 0, 0, Math.sin(am) * r * 0.78, -Math.cos(am) * r * 0.78, 5, '#20264C');
  circle(c, 0, 0, 7, '#E2424B');
  if (o.spin > 0) { c.beginPath(); c.arc(0, 0, r * 0.65, am - 1.4 * o.spin, am); c.lineWidth = r * 0.5; c.strokeStyle = `rgba(32,38,76,${0.25 * o.spin})`; c.stroke(); }
  c.restore();
}
// the moon in the window (night), or the sun coming up (dawn: k 0..1)
function windowSky(t, dawn = 0) {
  const c = ctx;
  c.save(); c.beginPath(); c.rect(92, 190, 260, 400); c.clip();
  if (dawn > 0) {
    const g = c.createLinearGradient(0, 190, 0, 590); g.addColorStop(0, mixHex('#0E1C46', '#FFB27A', dawn)); g.addColorStop(1, mixHex('#22397A', '#FFE2A8', dawn));
    c.globalAlpha = clamp(dawn * 1.5); c.fillStyle = g; c.fillRect(92, 190, 260, 400); c.globalAlpha = 1;
    circle(c, 250, lerp(640, 470, dawn), 46, '#FFE6A0');
    softDot(gctx, 250, lerp(640, 470, dawn), 200, '#FFD07A', 0.6 * dawn);
  }
  if (dawn < 1) {
    circle(c, 280, 270, 30, rgba('#F4F0DC', 1 - dawn)); circle(c, 293, 261, 25, rgba('#13234F', 1 - dawn));   // a crescent
    softDot(gctx, 280, 270, 90, '#DDE6FF', 0.35 * (1 - dawn));
  }
  c.restore();
}

// ---------------------------------------------------------------- the coat on the hook by the door (it looks back)
// (x, y) = the hook; k = how alive it is (0 a coat, 1 a man who turns his head), look = which way the eyes go
function coatHook(c, x, y, s, t, k = 0, look = 0) {
  c.save(); c.translate(x, y); c.scale(s, s);
  circle(c, 0, 0, 9, '#8A8EA8');
  const sway = 0.04 * Math.sin(t * 1.3) + 0.08 * k * Math.sin(t * 2.1);
  c.rotate(sway);
  // the hood or collar becomes a head
  const hk = E.outCubic(clamp(k * 1.2)), turn = look * 30 * hk;
  ellipse(c, turn * 0.2, -10 - 30 * hk, 46 + 6 * hk, 40 + 18 * hk, '#3C2E4A');
  // the coat: a long tapering shape with sleeves
  c.beginPath(); c.moveTo(-50, 0); c.quadraticCurveTo(-96, 160, -84, 420); c.lineTo(84, 420); c.quadraticCurveTo(96, 160, 50, 0); c.closePath();
  const g = c.createLinearGradient(-90, 0, 90, 0); g.addColorStop(0, '#4A3A5E'); g.addColorStop(1, '#2A2038'); c.fillStyle = g; c.fill();
  line(c, 0, 20, 0, 410, 4, 'rgba(0,0,0,0.3)');
  for (const yy of [90, 170, 250]) circle(c, 12, yy, 7, '#1A1424');
  for (const sd of [-1, 1]) {   // sleeves: they hang, then lift a little when it is alive
    const a = sd * (0.12 + 0.35 * hk + 0.05 * Math.sin(t * 2 + sd));
    c.save(); c.translate(sd * 58, 40); c.rotate(a);
    rrect(c, -20, 0, 40, 260, 18); c.fillStyle = '#3A2C4E'; c.fill();
    c.restore();
  }
  if (hk > 0.05) {   // two pale eyes in the dark of the hood
    for (const sd of [-1, 1]) ellipse(c, turn + sd * 16, -28 - 22 * hk, 8 * hk, 5 * hk, '#F4F0C8');
  }
  c.restore();
}

// ---------------------------------------------------------------- the TV (the cereal ad that makes him sob)
// a screen (x, y = centre; w, h), playing a cartoon cereal box that waves at a cartoon kid; k = on
function cerealTV(c, x, y, w, h, t, k = 1) {
  c.save(); c.translate(x, y);
  rrect(c, -w / 2 - 18, -h / 2 - 18, w + 36, h + 36, 14); c.fillStyle = '#14161E'; c.fill();
  c.save(); rrect(c, -w / 2, -h / 2, w, h, 8); c.clip();
  const g = c.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, '#FFE7A0'); g.addColorStop(1, '#FFB66A');
  c.fillStyle = g; c.fillRect(-w / 2, -h / 2, w, h);
  for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2 + t * 0.4; c.beginPath(); c.moveTo(0, h * 0.1); c.arc(0, h * 0.1, w, a, a + 0.2); c.closePath(); c.fillStyle = 'rgba(255,255,255,0.18)'; c.fill(); }
  // the cereal box with a face, hugging a bowl
  const bob = 6 * Math.sin(t * 4);
  c.save(); c.translate(-w * 0.12, h * 0.08 + bob); c.rotate(-0.06);
  rrect(c, -w * 0.12, -h * 0.34, w * 0.24, h * 0.56, 10); c.fillStyle = '#E2424B'; c.fill();
  c.font = `400 ${Math.round(h * 0.09)}px Anton`; c.textAlign = 'center'; c.fillStyle = '#FFD447'; c.fillText('CRUNCH', 0, -h * 0.2);
  for (const sd of [-1, 1]) { circle(c, sd * w * 0.04, -h * 0.05, h * 0.035, '#FFFFFF'); circle(c, sd * w * 0.04, -h * 0.045, h * 0.016, '#1A1020'); }
  c.beginPath(); c.arc(0, h * 0.04, h * 0.05, 0.15 * Math.PI, 0.85 * Math.PI); c.lineWidth = 5; c.strokeStyle = '#1A1020'; c.stroke();
  c.restore();
  // a little bowl that hops into its arms; hearts
  const hb = Math.abs(Math.sin(t * 3)) * 14;
  ellipse(c, w * 0.2, h * 0.24 - hb, w * 0.1, h * 0.05, '#FFFFFF'); ellipse(c, w * 0.2, h * 0.21 - hb, w * 0.085, h * 0.03, '#F2C75C');
  for (let i = 0; i < 3; i++) {   // hearts floating up between them
    const ph = (t * 0.7 + i / 3) % 1, hx = w * 0.05 + (i - 1) * w * 0.07, hy = -h * 0.12 - ph * h * 0.3, hs = (0.6 + 0.4 * ph) * h * 0.0016;
    c.save(); c.translate(hx, hy); c.scale(hs * 40, hs * 40); c.globalAlpha = Math.sin(Math.PI * ph);
    c.beginPath(); c.moveTo(0, 0.65); c.bezierCurveTo(-1.1, -0.05, -0.75, -0.95, 0, -0.45); c.bezierCurveTo(0.75, -0.95, 1.1, -0.05, 0, 0.65);
    c.fillStyle = '#FF4D6D'; c.fill(); c.restore();
  }
  c.restore();
  c.globalAlpha = 1;
  // scan lines + glare
  c.fillStyle = 'rgba(255,255,255,0.06)'; for (let yy = -h / 2; yy < h / 2; yy += 6) c.fillRect(-w / 2, yy, w, 2);
  c.restore();
  softDot(gctx, x, y, w * 0.8, '#FFC870', 0.35 * k);
}

// ---------------------------------------------------------------- day two: donuts, a blanket
function donut(c, x, y, s, col = '#FF86A6', seed = 1) {
  ellipse(c, x, y, 54 * s, 26 * s, '#C88A4A');
  ellipse(c, x, y - 4 * s, 50 * s, 21 * s, col);
  ellipse(c, x, y - 5 * s, 16 * s, 7 * s, '#7A4A22');
  const r = mulberry32(seed);
  for (let i = 0; i < 9; i++) { const a = r() * 6.28, rr = 22 + r() * 18; line(c, x + Math.cos(a) * rr * s, y - 5 * s + Math.sin(a) * rr * 0.42 * s, x + Math.cos(a) * rr * s + 5 * s, y - 5 * s + Math.sin(a) * rr * 0.42 * s, 4 * s, ['#FFD447', '#7FE9FF', '#FFFFFF', '#4DFFB4'][i % 4]); }
}
function donutTower(c, x, y, s, n, t) {
  for (let i = 0; i < n; i++) donut(c, x + 4 * Math.sin(i * 1.7 + t * 0.5), y - i * 30 * s, s, ['#FF86A6', '#C8A8FF', '#7A4A22', '#FFD447'][i % 4], i + 3);
}
// the blanket he is wrapped in (rig space, drawn over him in figure's post): only his face shows
function blanketWrap(c, r, st, t, k = 1, shiver = 0) {
  if (k <= 0) return;
  const [hx, hy] = r.head, sx = shiver * 4 * Math.sin(t * 50);
  c.save(); c.globalAlpha *= clamp(k * 2);
  c.beginPath();
  c.moveTo(hx - 98 + sx, hy - 20); c.quadraticCurveTo(hx - 92 + sx, hy - 118, hx + sx, hy - 122); c.quadraticCurveTo(hx + 92 + sx, hy - 118, hx + 98 + sx, hy - 20);
  c.quadraticCurveTo(hx + 150 + sx, hy + 120, hx + 120 + sx, hy + 300); c.lineTo(hx - 120 + sx, hy + 300); c.quadraticCurveTo(hx - 150 + sx, hy + 120, hx - 98 + sx, hy - 20);
  c.closePath();
  c.fillStyle = '#7A4FB8'; c.fill();
  for (let i = 0; i < 6; i++) line(c, hx - 110 + i * 44 + sx, hy + 40, hx - 100 + i * 40 + sx, hy + 290, 9, 'rgba(255,214,120,0.35)');
  // the opening round his face
  c.globalCompositeOperation = 'destination-out';
  ellipse(c, hx + sx, hy + 6, 66, 74, '#000');
  c.globalCompositeOperation = 'source-over';
  c.beginPath(); c.ellipse(hx + sx, hy + 6, 70, 78, 0, 0, Math.PI * 2); c.lineWidth = 12; c.strokeStyle = '#5A3A94'; c.stroke();
  c.restore();
}

// a pink brain with a face, holding a tiny pillow: it bargains with him ("one little nap?")
function napBrain(c, x, y, s, t, o = {}) {
  c.save(); c.translate(x, y + 6 * Math.sin(t * 2.4)); c.scale(s, s); c.rotate(0.06 * Math.sin(t * 1.7));
  const g = c.createRadialGradient(-30, -40, 10, 0, 0, 130); g.addColorStop(0, '#FFC0DA'); g.addColorStop(1, '#D86A9E');
  c.beginPath(); c.ellipse(0, 0, 120, 88, 0, 0, Math.PI * 2); c.fillStyle = g; c.fill();
  c.lineWidth = 6; c.strokeStyle = '#FFE0EE'; c.stroke();
  const rg = mulberry32(4);
  for (let i = 0; i < 9; i++) { const px = -90 + rg() * 170, py = -60 + rg() * 90; c.beginPath(); c.moveTo(px, py); c.quadraticCurveTo(px + 22, py - 20, px + 44, py + 4); c.lineWidth = 5; c.strokeStyle = 'rgba(140,40,90,0.4)'; c.stroke(); }
  // face: sleepy pleading eyes
  for (const sd of [-1, 1]) {
    ellipse(c, sd * 32, -6, 18, 20, '#FFFFFF'); circle(c, sd * 32, 0, 10, '#2A1030'); circle(c, sd * 32 - 3, -4, 4, '#FFFFFF');
    c.fillStyle = '#E88AB6'; c.fillRect(sd * 32 - 19, -27, 38, 14);   // heavy lids
    line(c, sd * 18, -36, sd * 48, -30 - (o.plead || 0) * 8, 6, '#8A2A60');
  }
  c.beginPath(); c.arc(0, 30, 14, 0.1 * Math.PI, 0.9 * Math.PI); c.lineWidth = 6; c.strokeStyle = '#6A1A44'; c.stroke();
  // the pillow it offers, in two little arms
  const pk = o.pillow === undefined ? 1 : o.pillow;
  if (pk > 0) {
    c.save(); c.translate(140, 30); c.rotate(-0.15); c.scale(pk, pk);
    rrect(c, -60, -36, 120, 72, 30); c.fillStyle = '#F4F6FF'; c.fill();
    line(c, -40, 0, 40, 0, 3, 'rgba(120,130,170,0.4)');
    c.restore();
    for (const sd of [-1, 1]) line(c, 90, 20 + sd * 30, 120, 30 + sd * 26, 10, '#D86A9E');
  }
  c.restore();
}

// ---------------------------------------------------------------- the HUD clock (top left, always on)
// TLd.cues.clock = [[t, "HOUR 16", "kind"], ...]; it flips on each entry. kind: '' white, 'day' yellow, '1964' sepia,
// 'red' red, 'sleep' blue. The flip: the old card folds up, the new one drops in with a bounce.
function clockState(t) {
  const L = (TLd.cues.clock || []);
  let i = -1;
  for (let k = 0; k < L.length; k++) if (t >= L[k][0]) i = k;
  return { i, cur: i >= 0 ? L[i] : null, prev: i > 0 ? L[i - 1] : null, age: i >= 0 ? t - L[i][0] : 0 };
}
const HUD_COL = { '': '#FFFFFF', day: '#FFD447', '1964': '#F2D7A0', red: '#FF5A6E', sleep: '#8FB8FF', gold: '#FFD447' };
function drawHud(t, post) {
  const s = clockState(t);
  if (!s.cur) return;
  const x = 110, y = 118, flip = clamp(s.age / 0.26);
  ctx.save();
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  // the small label above: AWAKE (or what is being counted)
  const lab = s.cur[3] || (s.cur[2] === 'sleep' ? 'ASLEEP' : 'AWAKE FOR');
  ctx.font = '800 26px Montserrat'; ctx.lineJoin = 'round';
  ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(8,8,20,0.85)'; ctx.strokeText(lab, x + 4, y - 78);
  ctx.fillStyle = 'rgba(255,255,255,0.88)'; ctx.fillText(lab, x + 4, y - 78);
  // the number card: a flip with a little overshoot
  const col = HUD_COL[s.cur[2] || ''] || '#FFFFFF';
  const sy = flip < 1 ? E.outBack(flip, 2.4) : 1;
  ctx.translate(x, y); ctx.scale(1, Math.max(0.02, sy));
  ctx.font = '400 74px Anton';
  ctx.lineWidth = 14; ctx.strokeStyle = '#0B0B1A'; ctx.strokeText(s.cur[1], 0, 0);
  ctx.fillStyle = col; ctx.fillText(s.cur[1], 0, 0);
  ctx.restore();
  // a quick flash bar under it on the flip
  if (flip < 1 && s.i > 0) {
    ctx.fillStyle = `rgba(255,255,255,${0.5 * (1 - flip)})`;
    const wd = 260 * (1 - flip);
    ctx.fillRect(x, y + 14, wd, 6);
  }
}
