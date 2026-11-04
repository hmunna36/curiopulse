// Why does a word go WEIRD when you repeat it: the props of this Short.
// - wwWord: a big word drawn letter by letter that cracks, drifts apart and wobbles (the word losing its meaning)
// - wwSpoon: the MEANING, a little spoon with a face, arms and feet (moods, a suitcase, a nightcap, a bathrobe, a walk)
// - wwHouse: the meaning's little house in his head: a door that opens, a doorbell labelled SPOON, a porch lamp, a NOBODY HOME
//   sign, a MEANING doormat
// - wwBrainRoom / wwButtonPost / wwWire: the circuit inside his head (SOUND button - wire - MEANING house), the wire frays
// - wwCard: the LAB RESULTS clipboard; wwTag: a pill label; wwCounter: the REPS counter; wwPop: a little "spoon!" bubble
// - wwHand: handwriting ("door") that can bend; wwPage: a sheet of lined paper with it
// Everything takes the canvas it draws on; screen or world coordinates are the caller's. Nothing here is timed.
'use strict';

const WW = { gold: '#FFD447', ink: '#141428', silver: '#DDE3EE', silverSh: '#8E98AE', silverHi: '#FFFFFF', steel: '#AEBBD4', steelSh: '#5E6C8C', outline: '#262B42' };

// ---------------------------------------------------------------- the big word
// (x, y) = its centre in screen space. o: {k pop 0..1, brk 0..1 (letters drift apart), crack 0..1, wob 0..1 (a live
// wobble), t, col, seed, grey 0..1, thump 0..1 (a beat: a quick swell), dead 0..1 (hollow letters: no meaning)}
function wwWord(txt, x, y, size, o = {}) {
  const k = o.k === undefined ? 1 : o.k;
  if (k <= 0.01) return;
  const brk = clamp(o.brk || 0), t = o.t || 0, wob = o.wob || 0, seed = o.seed || 3, th = o.thump || 0;
  const col = mixH(o.col || WW.gold, '#B3AACF', clamp((o.grey === undefined ? brk : o.grey) * 0.85));
  const sc0 = E.outBack(clamp(k), 2.2) * (1 + 0.12 * th);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(x, y); ctx.scale(sc0, sc0);
  ctx.font = `400 ${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  const chars = [...txt], ws = chars.map((ch) => ctx.measureText(ch).width), total = ws.reduce((a, b) => a + b, 0);
  const gap = size * 0.06 + brk * size * 0.22;
  let px = -(total + gap * (chars.length - 1)) / 2;
  const pos = [];
  chars.forEach((ch, i) => {
    const h1 = hash(i * 7.31 + seed), h2 = hash(i * 3.17 + seed * 2), h3 = hash(i * 5.73 + seed * 3), h4 = hash(i * 1.91 + seed * 5);
    const cx = px + ws[i] / 2;
    px += ws[i] + gap;
    if (ch === ' ') return;
    const dx = brk * (h1 - 0.5) * size * 0.55 + wob * size * 0.05 * Math.sin(t * 9.1 + i * 2.1);
    const dy = brk * (h2 - 0.5) * size * 0.9 + wob * size * 0.07 * Math.sin(t * 7.3 + i * 1.7) + brk * size * 0.12 * Math.sin(t * 2.2 + i * 1.3);
    const rot = brk * (h3 - 0.5) * 1.5 + wob * 0.16 * Math.sin(t * 8.3 + i * 2.9) + (ch === 'O' ? brk * (h4 > 0.5 ? 1 : -1) * t * 0.8 : 0);
    const sc = 1 + brk * (h4 - 0.5) * 0.55 + wob * 0.06 * Math.sin(t * 11 + i);
    const flip = ch === 'S' || ch === 'N' ? 1 - 2 * clamp((brk - 0.55) * 3) * (h1 > 0.5 ? 1 : 0) : 1;
    pos.push([cx + dx, dy]);
    ctx.save(); ctx.translate(cx + dx, dy); ctx.rotate(rot); ctx.scale(sc * flip, sc);
    ctx.fillStyle = 'rgba(0,0,12,0.55)'; ctx.fillText(ch, 0, size * 0.06);
    ctx.lineWidth = size * 0.14; ctx.strokeStyle = '#0B0B1A'; ctx.strokeText(ch, 0, 0);
    const dead = clamp(o.dead || 0);
    ctx.fillStyle = col; ctx.fillText(ch, 0, 0);
    if (dead > 0.01) {        // hollow: the inside of each letter goes dark, only an outline of the sound is left
      ctx.save(); ctx.globalAlpha = 0.78 * dead; ctx.fillStyle = '#1C1830'; ctx.scale(0.86, 0.9); ctx.fillText(ch, 0, 0); ctx.restore();
    }
    ctx.restore();
  });
  // a crack across the whole word: a zigzag drawn on, white with a dark edge
  const cr = clamp(o.crack || 0);
  if (cr > 0.01) {
    const L = total + gap * (chars.length - 1), rng = mulberry32(seed * 91 + 7);
    const P = [];
    for (let i = 0; i <= 9; i++) P.push([-L * 0.52 + L * 1.04 * i / 9, (rng() - 0.5) * size * 0.34 + (i % 2 ? 1 : -1) * size * 0.06]);
    const n = cr * 9;
    ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]);
    for (let i = 1; i <= Math.ceil(n); i++) {
      const u = Math.min(1, n - (i - 1)), a = P[i - 1], b = P[i];
      ctx.lineTo(lerp(a[0], b[0], u), lerp(a[1], b[1], u));
    }
    ctx.lineWidth = size * 0.07; ctx.strokeStyle = '#0B0B1A'; ctx.lineCap = 'round'; ctx.stroke();
    ctx.lineWidth = size * 0.028; ctx.strokeStyle = '#FFF6E0'; ctx.stroke();
  }
  ctx.restore();
  // its glow: the word "means" something while it glows
  const gl = (1 - brk) * (o.glow === undefined ? 1 : o.glow) * k;
  if (gl > 0.01) { gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); softDot(gctx, x, y, size * 1.9, o.col || WW.gold, 0.22 * gl); gctx.restore(); }
  return pos;
}

// ---------------------------------------------------------------- the meaning: a little spoon
// feet at (x, y) in the canvas c's current space, height about 250 * s. o: {mood 'happy'|'sleepy'|'cross'|'shock'|'wave',
// walk (a phase in turns; 0 = standing), wave 0..1, suitcase 0..1, cap 0..1 (nightcap), robe 0..1, look -1..1, dir 1|-1,
// t, sit 0..1}
function wwSpoon(c, x, y, s, o = {}) {
  const t = o.t || 0, dir = o.dir || 1, wk = o.walk || 0, walking = Math.abs(wk) > 0.001;
  const step = walking ? Math.sin(wk * Math.PI * 2) : 0, bob = walking ? Math.abs(Math.cos(wk * Math.PI * 2)) * 6 : 1.5 * Math.sin(t * 3.1);
  c.save(); c.translate(x, y); c.scale(s * dir, s);
  actor(() => {
    // legs and feet
    for (const sd of [-1, 1]) {
      const fx = sd * 16 + (walking ? sd * step * 14 : 0), fy = walking ? -Math.max(0, sd * step) * 10 : 0;
      line(c, sd * 8, -52 - bob, fx, fy - 8, 8, WW.outline);
      ellipse(c, fx + 7, fy - 5, 15, 8, '#E0565E');
    }
    // the handle (the body), tapering down, with a dark outline
    c.beginPath(); c.moveTo(-15, -150 - bob); c.quadraticCurveTo(-11, -90 - bob, -10, -50 - bob); c.quadraticCurveTo(0, -42 - bob, 10, -50 - bob);
    c.quadraticCurveTo(11, -90 - bob, 15, -150 - bob); c.closePath();
    c.lineWidth = 7; c.strokeStyle = WW.outline; c.stroke();
    c.fillStyle = WW.steelSh; c.fill();
    c.beginPath(); c.moveTo(-9, -146 - bob); c.quadraticCurveTo(-6, -90 - bob, -5, -56 - bob); c.lineTo(2, -56 - bob); c.quadraticCurveTo(1, -90 - bob, 1, -146 - bob); c.closePath();
    c.fillStyle = WW.steel; c.fill();
    // a bathrobe over the handle
    if ((o.robe || 0) > 0.01) {
      c.beginPath(); c.moveTo(-26, -150 - bob); c.lineTo(26, -150 - bob); c.lineTo(32, -60 - bob); c.lineTo(-32, -60 - bob); c.closePath();
      c.fillStyle = '#5FA8D8'; c.fill();
      line(c, -2, -150 - bob, 6, -60 - bob, 5, '#3E7FAE'); line(c, -30, -104 - bob, 30, -104 - bob, 6, '#F2D35A');
    }
    // arms
    const wv = clamp(o.wave || 0), cs = clamp(o.suitcase || 0);
    const armY = -128 - bob;
    const hL = [-46, armY + 26 - wv * 70 + 6 * wv * Math.sin(t * 14)], hR = cs > 0.01 ? [34, armY + 46] : [44, armY + 28];
    line(c, -12, armY, hL[0], hL[1], 7, WW.outline); circle(c, hL[0], hL[1], 9, WW.outline); circle(c, hL[0], hL[1], 6.5, '#F4F6FF');
    line(c, 12, armY, hR[0], hR[1], 7, WW.outline); circle(c, hR[0], hR[1], 9, WW.outline); circle(c, hR[0], hR[1], 6.5, '#F4F6FF');
    // the suitcase in its right hand
    if (cs > 0.01) {
      c.save(); c.translate(hR[0] + 4, hR[1] + 6); c.scale(cs, cs);
      rrect(c, -22, 0, 44, 32, 5); c.fillStyle = '#8A5A34'; c.fill(); rrect(c, -22, 12, 44, 5, 2); c.fillStyle = '#5E3A20'; c.fill();
      c.beginPath(); c.arc(0, 0, 7, Math.PI, 0); c.lineWidth = 4; c.strokeStyle = '#3A2414'; c.stroke();
      rrect(c, -10, 20, 14, 9, 2); c.fillStyle = '#E0C068'; c.fill();
      c.restore();
    }
    // the bowl (the head)
    const hx = 0, hy = -205 - bob;
    c.beginPath(); c.ellipse(hx, hy, 48, 60, 0, 0, 7);
    c.lineWidth = 8; c.strokeStyle = WW.outline; c.stroke();
    const g = c.createRadialGradient(hx - 16, hy - 22, 6, hx, hy, 66);
    g.addColorStop(0, '#F4F7FF'); g.addColorStop(0.45, WW.steel); g.addColorStop(1, WW.steelSh);
    c.fillStyle = g; c.fill();
    // a nightcap
    if ((o.cap || 0) > 0.01) {
      const k2 = clamp(o.cap);
      c.save(); c.translate(hx, hy - 46); c.scale(k2, k2);
      c.beginPath(); c.moveTo(-44, 6); c.quadraticCurveTo(0, -30, 44, 6); c.quadraticCurveTo(30, -50, 62, -74); c.quadraticCurveTo(10, -40, -44, 6); c.closePath();
      c.fillStyle = '#4C6BD8'; c.fill(); rrect(c, -48, -2, 96, 18, 9); c.fillStyle = '#F4F6FF'; c.fill(); circle(c, 64, -76, 11, '#F4F6FF');
      c.restore();
    }
    // the face: paint (no edge, no shadow)
    paint(() => {
      const mood = o.mood || 'happy', lk = (o.look || 0) * 6;
      ellipse(c, hx - 28, hy + 14, 9, 6, 'rgba(255,120,140,0.45)'); ellipse(c, hx + 28, hy + 14, 9, 6, 'rgba(255,120,140,0.45)');
      for (const sd of [-1, 1]) {
        const ex = hx + sd * 17 + lk, ey = hy - 8;
        if (mood === 'sleepy') { c.beginPath(); c.moveTo(ex - 9, ey); c.quadraticCurveTo(ex, ey + 6, ex + 9, ey); c.lineWidth = 4; c.strokeStyle = WW.ink; c.lineCap = 'round'; c.stroke(); }
        else {
          const ry = mood === 'shock' ? 13 : mood === 'cross' ? 7 : 10;
          ellipse(c, ex, ey, 8, ry, '#FFFFFF'); circle(c, ex + lk * 0.4, ey + (mood === 'cross' ? 1 : 2), 5, WW.ink); circle(c, ex + lk * 0.4 - 1.5, ey, 1.6, '#FFFFFF');
          if (mood === 'cross') line(c, ex - 10, ey - 12 + sd * 0, ex + 10, ey - 8 - sd * 4, 4, WW.ink);
        }
      }
      c.lineCap = 'round';
      if (mood === 'shock') ellipse(c, hx, hy + 30, 8, 11, '#5A1522');
      else if (mood === 'cross' || mood === 'sleepy') { line(c, hx - 10, hy + 30, hx + 10, hy + 28, 4, WW.ink); }
      else { c.beginPath(); c.moveTo(hx - 14, hy + 24); c.quadraticCurveTo(hx, hy + 40, hx + 14, hy + 24); c.lineWidth = 4; c.strokeStyle = WW.ink; c.stroke(); }
      // the shine on the bowl
      c.beginPath(); c.ellipse(hx - 22, hy - 30, 7, 16, -0.5, 0, 7); c.fillStyle = 'rgba(255,255,255,0.75)'; c.fill();
    });
  });
  c.restore();
}

// ---------------------------------------------------------------- the meaning's house (in his head)
// ground centre (x, y), s scale (the house is about 520 * s wide). o: {open 0..1 (the door), lamp 0..1, sign 0..1 (NOBODY
// HOME drops down and swings), ring 0..1 (the bell's flash), press 0..1 (the button pushed in), inside: fn(c) draws who
// stands in the doorway (in house units, the doorway's floor at (0, 0)), t, dark 0..1 (the windows go out)}
function wwHouse(c, x, y, s, o = {}) {
  const t = o.t || 0, open = clamp(o.open || 0), lamp = o.lamp === undefined ? 1 : o.lamp, dark = clamp(o.dark || 0);
  c.save(); c.translate(x, y); c.scale(s, s);
  // the wall, with siding
  rrect(c, -250, -350, 500, 350, 8); c.fillStyle = '#E8CFA0'; c.fill();
  for (let yy = -330; yy < 0; yy += 34) line(c, -246, yy, 246, yy, 3, 'rgba(120,80,40,0.22)');
  // the roof
  c.beginPath(); c.moveTo(-292, -338); c.lineTo(0, -520); c.lineTo(292, -338); c.closePath(); c.fillStyle = '#C24A3A'; c.fill();
  line(c, -296, -336, 296, -336, 14, '#8E2E24');
  // a round attic window
  circle(c, 0, -420, 40, '#6A3A2A'); circle(c, 0, -420, 31, mixH('#FFD98A', '#2A2440', dark));
  line(c, -31, -420, 31, -420, 5, '#6A3A2A'); line(c, 0, -451, 0, -389, 5, '#6A3A2A');
  // the right-hand window
  rrect(c, 120, -270, 96, 96, 8); c.fillStyle = '#6A3A2A'; c.fill();
  rrect(c, 128, -262, 80, 80, 4); c.fillStyle = mixH('#FFD98A', '#2A2440', dark); c.fill();
  line(c, 168, -262, 168, -182, 5, '#6A3A2A'); line(c, 128, -222, 208, -222, 5, '#6A3A2A');
  // the doorway: a warm room behind
  rrect(c, -84, -262, 168, 262, 10); c.fillStyle = '#5A3424'; c.fill();
  rrect(c, -74, -252, 148, 252, 6); c.fillStyle = mixH('#FFB868', '#1A1020', clamp(dark + (1 - open) * 0.2)); c.fill();
  if (open > 0.02 && o.inside) { c.save(); c.beginPath(); c.rect(-74, -252, 148, 252); c.clip(); c.translate(0, 0); o.inside(c); c.restore(); }
  // the door leaf swings inward: it narrows toward its hinge on the left
  const dw = 148 * (1 - 0.86 * E.inOutSine(open));
  c.beginPath(); c.moveTo(-74, -252); c.lineTo(-74 + dw, -252 + 14 * open); c.lineTo(-74 + dw, 0 - 6 * open); c.lineTo(-74, 0); c.closePath();
  c.fillStyle = '#6A4AB8'; c.fill();
  if (dw > 40) {
    rrect(c, -74 + dw * 0.14, -228, dw * 0.72, 90, 6); c.lineWidth = 5; c.strokeStyle = '#4E3290'; c.stroke();
    rrect(c, -74 + dw * 0.14, -120, dw * 0.72, 96, 6); c.stroke();
    circle(c, -74 + dw * 0.86, -128, 9, '#F2D35A');
  }
  // the NOBODY HOME sign on the door (it drops down on its string and swings)
  const sg = clamp(o.sign || 0);
  if (sg > 0.01) {
    const sw = Math.sin(t * 7) * 0.25 * Math.exp(-3 * Math.max(0, (o.signT || 0))) ;
    c.save(); c.translate(0, -262 + lerp(-120, 0, E.outBounce ? E.outBounce(sg) : E.outBack(sg))); c.rotate(sw);
    line(c, -34, 0, 0, -26, 3, '#3A2414'); line(c, 34, 0, 0, -26, 3, '#3A2414'); circle(c, 0, -26, 4, '#F2D35A');
    rrect(c, -78, 0, 156, 84, 8); c.fillStyle = '#F4ECD6'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#8A5A34'; c.stroke();
    paint(() => {
      c.font = '900 30px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#C0392B';
      c.fillText('NOBODY', 0, 26); c.fillText('HOME', 0, 58);
    });
    c.restore();
  }
  // the porch lamp
  const lx = -150, ly = -230;
  line(c, lx, ly - 34, lx, ly - 10, 6, '#3A2A2A');
  rrect(c, lx - 18, ly - 12, 36, 46, 8); c.fillStyle = '#3A2A2A'; c.fill();
  rrect(c, lx - 12, ly - 6, 24, 34, 5); c.fillStyle = mixH('#FFE6A0', '#3A3448', clamp(1 - lamp)); c.fill();
  if (lamp > 0.02) { softDot(gctx, lx * s + x, (ly + 10) * s + y, 120 * s, '#FFC870', 0.5 * lamp); }
  // the doorbell: a brass plate, a button, the word on its label
  const bx = 150, by = -120, pr = clamp(o.press || 0), rg = clamp(o.ring || 0);
  rrect(c, bx - 40, by - 52, 80, 104, 12); c.fillStyle = '#C89A3C'; c.fill();
  circle(c, bx, by - 14, 24, '#7A5A20'); circle(c, bx, by - 14 + 3 * pr, 19 - 2 * pr, rg > 0.05 ? mixH('#FFF2B0', '#FF7A5A', 0.2) : '#F4ECD6');
  rrect(c, bx - 34, by + 20, 68, 24, 5); c.fillStyle = '#F4ECD6'; c.fill();
  paint(() => { c.font = '900 17px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#3A2414'; c.fillText(o.bellLabel || 'SPOON', bx, by + 33); });
  if (rg > 0.01) {
    for (let i = 0; i < 3; i++) {
      const r = 34 + 22 * i + 30 * rg;
      c.beginPath(); c.arc(bx, by - 14, r, -0.9, 0.9); c.lineWidth = 6 - i; c.strokeStyle = rgba('#FFE46B', (1 - rg) * 0.95); c.lineCap = 'round'; c.stroke();
      c.beginPath(); c.arc(bx, by - 14, r, Math.PI - 0.9, Math.PI + 0.9); c.stroke();
    }
    softDot(gctx, bx * s + x, (by - 14) * s + y, 110 * s, '#FFE46B', 0.6 * (1 - rg));
  }
  // the doormat with the word on it
  c.beginPath(); c.moveTo(-110, 4); c.lineTo(110, 4); c.lineTo(126, 40); c.lineTo(-126, 40); c.closePath(); c.fillStyle = '#7A3A2A'; c.fill();
  paint(() => { c.font = '900 24px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#F2D35A'; c.fillText('MEANING', 0, 23); });
  c.restore();
}

// ---------------------------------------------------------------- inside his head: the room, the button post, the wire
let WW_ROOM = null;
function initWwRoom() {
  WW_ROOM = mkCanvas(1080, 1920);
  const c = WW_ROOM.getContext('2d'), rng = mulberry32(4411);
  const g = c.createLinearGradient(0, 0, 0, 1920);
  g.addColorStop(0, '#2A0F3A'); g.addColorStop(0.5, '#4A1A52'); g.addColorStop(1, '#22092E');
  c.fillStyle = g; c.fillRect(0, 0, 1080, 1920);
  // folds of the brain as soft walls
  for (let row = 0; row < 9; row++) {
    const y0 = 160 + row * 210;
    c.beginPath(); c.moveTo(-40, y0);
    for (let x = -40; x <= 1120; x += 30) c.lineTo(x, y0 + 46 * Math.sin(x * 0.012 + row * 1.7) + 24 * Math.sin(x * 0.031 + row));
    c.lineWidth = 34; c.strokeStyle = `rgba(255,120,170,${0.05 + 0.04 * rng()})`; c.stroke();
    c.lineWidth = 6; c.strokeStyle = 'rgba(255,170,210,0.08)'; c.stroke();
  }
  for (let i = 0; i < 40; i++) softDot(c, rng() * 1080, rng() * 1920, 20 + rng() * 60, rng() < 0.5 ? '#FF7AB8' : '#9A7AFF', 0.06 + 0.06 * rng());
  // the floor
  const fg = c.createLinearGradient(0, 1240, 0, 1920); fg.addColorStop(0, '#3A1446'); fg.addColorStop(1, '#16061E');
  c.fillStyle = fg; c.fillRect(0, 1240, 1080, 680);
}
function wwBrainRoom(t) {
  screenSpace();
  ctx.drawImage(WW_ROOM, 0, 0);
  for (let i = 0; i < 18; i++) {
    const u = ((hash(i * 3.7) + t * 0.05 * (0.5 + hash(i))) % 1);
    softDot(ctx, 60 + hash(i * 9.1) * 960, 1700 - u * 1400, 6 + 8 * hash(i), '#FFB8E0', 0.25 * Math.sin(Math.PI * u));
  }
}
// the SOUND doorbell on its post: base at (x, y), s. o: {press 0..1, glow 0..1}
function wwButtonPost(c, x, y, s, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  rrect(c, -18, -260, 36, 260, 10); c.fillStyle = '#6A4AB8'; c.fill();
  rrect(c, -70, -380, 140, 150, 18); c.fillStyle = '#C89A3C'; c.fill();
  const pr = clamp(o.press || 0), gl = clamp(o.glow || 0);
  circle(c, 0, -318, 46, '#7A5A20'); circle(c, 0, -318 + 5 * pr, 38 - 3 * pr, mixH('#F4ECD6', '#FFF2A0', gl));
  rrect(c, -62, -262, 124, 30, 6); c.fillStyle = '#F4ECD6'; c.fill();
  paint(() => { c.font = '900 24px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#3A2414'; c.fillText('SPOON', 0, -246); });
  ellipse(c, 0, 4, 70, 14, 'rgba(0,0,0,0.35)');
  c.restore();
  if (gl > 0.01) softDot(gctx, x, y - 318 * s, 160 * s, '#FFE46B', 0.5 * gl);
}
// the wire from a to b, sagging by sag; fray 0..1 at the middle (copper strands, a gap), spark 0..1, t
function wwWire(c, a, b, sag, o = {}) {
  const fray = clamp(o.fray || 0), t = o.t || 0;
  const pt = (u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u) + sag * 4 * u * (1 - u)];
  const gapU = 0.035 * fray;
  const seg = (u0, u1) => {
    c.beginPath();
    for (let i = 0; i <= 24; i++) { const p = pt(lerp(u0, u1, i / 24)); i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); }
    c.lineWidth = 26; c.strokeStyle = '#1A1A2A'; c.lineCap = 'round'; c.stroke();
    c.lineWidth = 16; c.strokeStyle = '#E2463A'; c.stroke();
    c.lineWidth = 4; c.strokeStyle = 'rgba(255,200,190,0.55)'; c.stroke();
  };
  seg(0, 0.5 - gapU); seg(0.5 + gapU, 1);
  if (fray > 0.01) {
    // copper strands splaying out of both ends, and the thin last threads that still hold
    for (const sd of [-1, 1]) {
      const e = pt(0.5 + sd * gapU), d = pt(0.5 + sd * (gapU + 0.01));
      const ang = Math.atan2(e[1] - d[1], e[0] - d[0]);
      for (let i = 0; i < 7; i++) {
        const a2 = ang + (i - 3) * 0.22 * fray, L = (18 + 14 * hash(i + sd * 5)) * fray;
        line(c, e[0], e[1], e[0] + Math.cos(a2) * L, e[1] + Math.sin(a2) * L, 3, '#E8A050');
      }
    }
    const l = pt(0.5 - gapU), r = pt(0.5 + gapU);
    c.beginPath(); c.moveTo(l[0], l[1]); c.quadraticCurveTo((l[0] + r[0]) / 2, (l[1] + r[1]) / 2 + 26 * fray, r[0], r[1]);
    c.lineWidth = 2.5; c.strokeStyle = '#E8A050'; c.stroke();
    const sp = clamp(o.spark || 0);
    if (sp > 0.01) {
      const m = pt(0.5), rng = mulberry32(Math.floor(t * 30) + 7);
      for (let i = 0; i < 9; i++) {
        const a2 = rng() * Math.PI * 2, L = (20 + rng() * 60) * sp;
        line(c, m[0], m[1], m[0] + Math.cos(a2) * L, m[1] + Math.sin(a2) * L, 3, '#FFF2A0');
        line(gctx, m[0], m[1], m[0] + Math.cos(a2) * L, m[1] + Math.sin(a2) * L, 6, 'rgba(255,220,120,0.8)');
      }
      softDot(gctx, m[0], m[1], 120 * sp, '#FFD070', 0.7);
    }
  }
  return pt;
}

// ---------------------------------------------------------------- labels and the card (screen space)
function wwTag(txt, x, y, k, col, o = {}) {
  if (k <= 0.01) return;
  screenSpace();
  const size = o.size || 46, s = E.outBack(clamp(k), 2.2);
  ctx.save(); ctx.font = `900 ${size}px Montserrat`;
  const w = ctx.measureText(txt).width + size * 0.9, h = size * 1.45;
  ctx.restore();
  if (o.to) thinLeader([x, y + h * 0.5 * Math.sign(o.to[1] - y)], o.to, clamp(k * 1.5 - 0.3), col);
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s);
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = o.bg || '#141428'; ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = col; ctx.stroke();
  ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = o.fg || col;
  ctx.fillText(txt, 0, size * 0.05);
  ctx.restore();
}
// the LAB RESULTS clipboard: rows [{txt, mark: 'tick'|'cross', k}], k = the card's pop
function wwCard(x, y, k, rows, t) {
  if (k <= 0.01) return;
  screenSpace();
  const s = E.outBack(clamp(k), 1.8), w = 520, h = 96 + rows.length * 84;
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.03); ctx.scale(s, s);
  rrect(ctx, -w / 2 + 10, -h / 2 + 14, w, h, 22); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();
  rrect(ctx, -w / 2, -h / 2, w, h, 22); ctx.fillStyle = '#B07A44'; ctx.fill();
  rrect(ctx, -w / 2 + 18, -h / 2 + 22, w - 36, h - 40, 10); ctx.fillStyle = '#FBF7EC'; ctx.fill();
  rrect(ctx, -70, -h / 2 - 16, 140, 40, 10); ctx.fillStyle = '#9AA4B8'; ctx.fill();
  ctx.font = '900 38px Montserrat'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#2A2440';
  ctx.fillText('LAB RESULTS', -w / 2 + 44, -h / 2 + 64);
  line(ctx, -w / 2 + 44, -h / 2 + 96, w / 2 - 44, -h / 2 + 96, 3, '#C9C2B0');
  rows.forEach((r, i) => {
    const ry = -h / 2 + 140 + i * 84, kk = clamp(r.k || 0);
    ctx.font = '900 44px Montserrat'; ctx.fillStyle = '#2A2440'; ctx.textAlign = 'left';
    ctx.fillText(r.txt, -w / 2 + 44, ry);
    if (kk > 0.01) {
      const mx = w / 2 - 80, ms = E.outBack(kk, 2.6);
      ctx.save(); ctx.translate(mx, ry); ctx.scale(ms, ms);
      circle(ctx, 0, 0, 30, r.mark === 'tick' ? '#2FBF7A' : '#E8414F');
      ctx.lineWidth = 9; ctx.strokeStyle = '#FFFFFF'; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
      if (r.mark === 'tick') { ctx.moveTo(-14, 1); ctx.lineTo(-4, 12); ctx.lineTo(15, -11); } else { ctx.moveTo(-11, -11); ctx.lineTo(11, 11); ctx.moveTo(11, -11); ctx.lineTo(-11, 11); }
      ctx.stroke(); ctx.restore();
    }
  });
  ctx.restore();
}
// the REPS counter: a pill with x N (screen space). k pop, n the count, hit 0..1 (a bump when it ticks)
function wwCounter(x, y, k, n, hit, col = '#FFD447') {
  if (k <= 0.01) return;
  screenSpace();
  const s = E.outBack(clamp(k), 2) * (1 + 0.14 * hit);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -118, -46, 236, 92, 46); ctx.fillStyle = '#141428'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = col; ctx.stroke();
  ctx.font = '900 30px Montserrat'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#B8BCD8'; ctx.fillText('REPS', -92, 2);
  ctx.font = '400 62px Anton'; ctx.textAlign = 'right'; ctx.fillStyle = col; ctx.fillText(String(n), 92, 4);
  ctx.restore();
}
// a "spoon!" said: a small white word that pops from the mouth and floats off (screen space). u 0..1 its life
function wwPop(txt, x, y, u, dir = 1, size = 52) {
  if (u <= 0 || u >= 1) return;
  const s = E.outBack(clamp(u * 5), 2.4) * (1 - 0.35 * u);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(x + dir * 150 * E.outCubic(u), y - 110 * E.outCubic(u)); ctx.rotate(dir * (-0.12 + 0.2 * u)); ctx.scale(s, s);
  ctx.globalAlpha = clamp((1 - u) * 3);
  ctx.font = `italic 900 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = 10; ctx.strokeStyle = '#141428'; ctx.lineJoin = 'round'; ctx.strokeText(txt, 0, 0);
  ctx.fillStyle = '#FFFFFF'; ctx.fillText(txt, 0, 0);
  ctx.restore();
}

// ---------------------------------------------------------------- handwriting
// "door" (or any of d o r) in pencil: baseline (x, y), x-height h. o: {k 0..1 written so far, bend 0..1, seed, col, lw}
function wwHand(c, txt, x, y, h, o = {}) {
  const k = o.k === undefined ? 1 : o.k, bend = clamp(o.bend || 0), seed = o.seed || 1, col = o.col || '#3A3A52';
  const n = txt.length;
  let px = x;
  c.save(); c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = col; c.lineWidth = o.lw || h * 0.16;
  for (let i = 0; i < n; i++) {
    const ch = txt[i], adv = ch === 'r' ? 0.72 * h : ch === 'd' ? 1.12 * h : 1.02 * h;
    const kk = clamp(k * n - i);
    if (kk <= 0) break;
    const r1 = hash(seed * 13.1 + i * 3.3), r2 = hash(seed * 7.7 + i * 5.1), r3 = hash(seed * 2.9 + i * 9.7);
    const rot = bend * (r1 - 0.5) * 1.1, sy = 1 + bend * (r2 - 0.5) * 0.9, sx = 1 + bend * (r3 - 0.5) * 0.7, dy = bend * (r2 - 0.5) * h * 0.7;
    c.save(); c.translate(px + adv * 0.5, y - h * 0.5 + dy); c.rotate(rot); c.scale(sx * (ch === 'r' && bend > 0.6 && r1 > 0.4 ? -1 : 1), sy);
    c.beginPath();
    if (ch === 'o') c.ellipse(0, 0, h * 0.42, h * 0.5, 0, 0, Math.PI * 2 * Math.min(1, kk * 1.2));
    else if (ch === 'd') {
      c.ellipse(-h * 0.08, 0, h * 0.4, h * 0.5, 0, 0, Math.PI * 2 * Math.min(1, kk * 1.5));
      if (kk > 0.5) { c.moveTo(h * 0.34, -h * (0.5 + 1.1 * Math.min(1, (kk - 0.5) * 2))); c.quadraticCurveTo(h * (0.34 + 0.5 * bend * (r3 - 0.5)), 0, h * 0.34, h * 0.5); }
    } else if (ch === 'r') {
      c.moveTo(-h * 0.22, -h * 0.5); c.lineTo(-h * 0.22, h * 0.5);
      if (kk > 0.5) { c.moveTo(-h * 0.22, -h * 0.1); c.quadraticCurveTo(-h * 0.05, -h * 0.55, h * 0.3, -h * 0.4); }
    } else if (ch === 'p') { c.moveTo(-h * 0.3, -h * 0.5); c.lineTo(-h * 0.3, h * 1.1); c.moveTo(0, 0); c.ellipse(0.05 * h, 0, h * 0.36, h * 0.5, 0, 0, Math.PI * 2); }
    else if (ch === 's') { c.moveTo(h * 0.3, -h * 0.4); c.bezierCurveTo(-h * 0.5, -h * 0.7, -h * 0.5, 0, 0, 0); c.bezierCurveTo(h * 0.5, 0, h * 0.5, h * 0.7, -h * 0.32, h * 0.4); }
    else if (ch === 'n') { c.moveTo(-h * 0.3, -h * 0.5); c.lineTo(-h * 0.3, h * 0.5); c.moveTo(-h * 0.3, -h * 0.1); c.quadraticCurveTo(h * 0.3, -h * 0.9, h * 0.3, h * 0.5); }
    c.stroke();
    c.restore();
    px += adv;
  }
  c.restore();
  return px;
}
// a sheet of lined paper (local space: centre (0, 0), w x h) with `lines` lines of `word` written on it; fill 0..1 how much
// is written, bend(lineIndex) 0..1 how wrong each line looks
function wwPage(c, w, h, o = {}) {
  const fill = clamp(o.fill === undefined ? 1 : o.fill), nl = o.lines || 9, word = o.word || 'door';
  rrect(c, -w / 2, -h / 2, w, h, 6); c.fillStyle = '#FBF8EE'; c.fill();
  const lh = (h - 80) / nl;
  for (let i = 0; i < nl; i++) line(c, -w / 2 + 16, -h / 2 + 60 + (i + 1) * lh, w / 2 - 16, -h / 2 + 60 + (i + 1) * lh, 2, 'rgba(110,150,210,0.55)');
  line(c, -w / 2 + 70, -h / 2 + 8, -w / 2 + 70, h / 2 - 8, 2.5, 'rgba(230,90,110,0.55)');
  paint(() => {
    c.font = `900 ${Math.round(lh * 0.42)}px Montserrat`; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = '#5A6A8A';
    c.fillText(o.title || 'COPY:  DOOR', -w / 2 + 84, -h / 2 + 34);
    const xh = lh * 0.42, perLine = o.perLine || 3, total = nl * perLine;
    let done = fill * total;
    for (let i = 0; i < nl && done > 0; i++) {
      let px = -w / 2 + 84;
      for (let j = 0; j < perLine && done > 0; j++) {
        const kk = clamp(done); done -= 1;
        const b = o.bend ? o.bend(i, j) : 0;
        px = wwHand(c, word, px, -h / 2 + 60 + (i + 1) * lh - lh * 0.16, xh, { k: kk, bend: b, seed: i * 7 + j * 3 + 1, lw: Math.max(2.5, xh * 0.17) }) + xh * 0.9;
      }
    }
  });
}
