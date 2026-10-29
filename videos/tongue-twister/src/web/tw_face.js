// Can You Say MIT's HARDEST Tongue Twister? 👅 Short: his talking face, drawn over the rig's in HEAD units (the head's
// centre at 0,0; the rig's mouth sits at 0,40). The rig's own mouth is 'none' while these draw.
//   TW_VIS / twVisAt(tt, rate)  the twister as mouth shapes: P A D | K I D | P O D | K U D | P U D | K O D, on his own
//                               clock (valid at negative time, so the loop's last frames run straight into frame 1)
//   twMouth(c, v, o)            one mouth shape: P (lips pressed, cheeks puffed), A, I, O, U (vowels), D, K, grin, flat,
//                               ooh (dismay), gape (frozen); o: {pal}
//   twKnot(c, k, t)             his tongue out and tied in a knot (k 0..1: out), hanging over his chin
//   twJam(c, k, t, out)         two letters, P and K, squeezing out of his lips at the same time; out 0..1: they pop
//   twPuff(c, k, side)          a little puff of air leaving the lips (a P)
//   twHead(c, st, r, fn)        draw fn in head units, inside a charLayer post (rig-local transform already on)
//   twCountHand(c, wr, n, pal, t)  a raised fist with n fingers up (1-5), at a rig wrist
'use strict';

const TW_VIS = ['P', 'A', 'D', 'K', 'I', 'D', 'P', 'O', 'D', 'K', 'U', 'D', 'P', 'U', 'D', 'K', 'O', 'D'];
// tt = seconds on his clock; rate = words a second (3 shapes a word). Returns {v, i (index in the twister), n (twisters done)}
function twVisAt(tt, rate) {
  const f = tt * rate * 3, i = Math.floor(f);
  return { v: TW_VIS[((i % 18) + 18) % 18], i: ((i % 18) + 18) % 18, n: Math.floor(i / 18), u: f - i };
}

function twHead(c, st, r, fn) {
  c.save(); c.translate(r.head[0] + (st.headDX || 0), r.head[1] + (st.headDY || 0)); c.rotate(r.lean + (st.headRot || 0));
  fn(c);
  c.restore();
}

const TWM = { lip: '#C9606A', lipDk: '#8E3440', in: '#4A1220', teeth: '#FFFFFF', tongue: '#E0616C', tongueDk: '#B23A50', puff: '#FFFFFF' };

function twMouth(c, v, o = {}) {
  const pal = o.pal || PAL;
  paint(() => {
    c.save(); c.translate(0, 40);
    if (v === 'P') {                                  // lips pressed tight, cheeks puffed with held air
      for (const s of [-1, 1]) ellipse(c, s * 34, -12, 15, 12, rgba(pal.skinHi, 0.55));
      ellipse(c, -34, -10, 12, 8, 'rgba(255,110,110,0.32)'); ellipse(c, 34, -10, 12, 8, 'rgba(255,110,110,0.32)');
      c.beginPath(); c.moveTo(-17, 0); c.quadraticCurveTo(0, -5, 17, 0); c.quadraticCurveTo(0, 7, -17, 0); c.closePath();
      c.fillStyle = TWM.lip; c.fill();
      line(c, -15, 0, 15, 0, 2.6, TWM.lipDk);
    } else if (v === 'A' || v === 'O' || v === 'U' || v === 'I' || v === 'K' || v === 'D' || v === 'ooh' || v === 'gape') {
      const S = { A: [17, 15], O: [10, 12], U: [8, 8], I: [19, 8], K: [13, 9], D: [12, 5], ooh: [9, 10], gape: [15, 17] }[v];
      const [rx, ry] = S;
      ellipse(c, 0, 2, rx + 3.5, ry + 3.5, TWM.lip);
      ellipse(c, 0, 2, rx, ry, TWM.in);
      c.save(); c.beginPath(); c.ellipse(0, 2, rx, ry, 0, 0, Math.PI * 2); c.clip();
      if (v !== 'O' && v !== 'U' && v !== 'ooh') { c.fillStyle = TWM.teeth; c.fillRect(-rx, 2 - ry, 2 * rx, Math.min(6, ry * 0.5)); }
      if (v === 'K') ellipse(c, 0, 2 + ry * 0.55, rx * 0.95, ry * 0.75, TWM.tongue);          // the back of the tongue humped up
      else if (v === 'D') { ellipse(c, 0, 2 + ry * 0.2, rx * 0.7, ry * 0.9, TWM.tongue); }     // the tip up behind the teeth
      else ellipse(c, 0, 2 + ry * 0.85, rx * 0.8, ry * 0.5, TWM.tongue);
      c.restore();
    } else if (v === 'grin') {
      c.beginPath(); c.moveTo(-24, -4); c.quadraticCurveTo(0, 22, 24, -4); c.quadraticCurveTo(0, 6, -24, -4); c.closePath(); c.fillStyle = TWM.in; c.fill();
      c.save(); c.clip(); c.fillStyle = TWM.teeth; c.fillRect(-24, -5, 48, 6); c.restore();
      c.beginPath(); c.moveTo(-24, -4); c.quadraticCurveTo(0, 22, 24, -4); c.lineWidth = 3; c.strokeStyle = TWM.lipDk; c.stroke();
    } else if (v === 'smirk') {
      c.beginPath(); c.moveTo(-14, 2); c.quadraticCurveTo(4, 8, 18, -4); c.lineWidth = 4.5; c.strokeStyle = TWM.lipDk; c.lineCap = 'round'; c.stroke();
    } else {                                          // flat
      c.beginPath(); c.moveTo(-13, 0); c.quadraticCurveTo(0, 3, 13, 0); c.lineWidth = 4.5; c.strokeStyle = TWM.lipDk; c.lineCap = 'round'; c.stroke();
    }
    c.restore();
  });
}

// a puff of air leaving the lips: three short arcs and a soft cloud (head units, mouth at 0,40); k 0..1 as it goes
function twPuff(c, k, side = 1) {
  if (k <= 0.01 || k >= 0.99) return;
  paint(() => {
    c.save(); c.translate(0, 40);
    const d = 10 + 34 * E.outCubic(k), a = 0.85 * (1 - k);
    for (let i = -1; i <= 1; i++) {
      c.beginPath(); c.arc(side * 6, 4, d + i * 0, side > 0 ? -0.5 + i * 0.32 - 0.12 : Math.PI - 0.5 + i * 0.32 - 0.12, side > 0 ? -0.5 + i * 0.32 + 0.12 : Math.PI - 0.5 + i * 0.32 + 0.12);
      c.lineWidth = 3.4; c.strokeStyle = `rgba(255,255,255,${a})`; c.lineCap = 'round'; c.stroke();
    }
    circle(c, side * (8 + d * 0.8), 6 + d * 0.15, 5 + 6 * k, `rgba(235,245,255,${0.5 * a})`);
    c.restore();
  });
}

// his tongue out and tied in an overhand knot, hanging over his chin (head units); k 0..1 = how far out
function twKnot(c, k, t) {
  if (k <= 0.01) return;
  const w = 2.2 * Math.sin(t * 11) + 1.2 * Math.sin(t * 17);
  paint(() => {
    c.save(); c.translate(0, 44); c.rotate(0.06 * Math.sin(t * 7)); c.scale(k, k);
    // the path: out of the mouth, down, round the loop, back across, the tip hanging
    const P = [[0, 0], [2, 14], [10, 26], [22, 36 + w * 0.3], [24, 50], [14, 60], [0, 56], [-6, 44], [2, 34], [14, 38], [12, 54], [6, 70 + w], [2, 84 + w]];
    const strokePath = (pts, wd, col) => {
      c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length - 1; i++) { const m = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2]; c.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]); }
      c.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
      c.lineWidth = wd; c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = col; c.stroke();
    };
    strokePath(P.slice(0, 9), 19, '#7A2034'); strokePath(P.slice(0, 9), 14.5, TWM.tongue);   // under-part
    strokePath(P.slice(7), 19, '#7A2034'); strokePath(P.slice(7), 14.5, TWM.tongue);        // the part that crosses over, and the tip
    strokePath(P.slice(7, 12), 2.2, rgba('#B23A50', 0.7));                                  // the groove down its middle
    circle(c, 2, 84 + w, 8.5, TWM.tongue);
    // shine
    c.beginPath(); c.arc(16, 44, 8, -1.3, 0.2); c.lineWidth = 2.6; c.strokeStyle = 'rgba(255,255,255,0.55)'; c.stroke();
    c.restore();
  });
}

// P and K squeezing out of his lips at once (head units, mouth at 0,40); k 0..1 = how far in the jam, out 0..1 = popped
function twJam(c, k, t, out = 0) {
  if (k <= 0.01 || out >= 0.999) return;
  const sq = 0.82 + 0.1 * Math.sin(t * 31), wob = 0.12 * Math.sin(t * 23);
  paint(() => {
    c.save(); c.translate(0, 42);
    const lift = -14 * E.outBack(clamp(k)) - 60 * E.inCubic(out), sc = 1 + 1.6 * E.inCubic(out);
    for (const [L, col, s] of [['P', '#FFD447', -1], ['K', '#7FE9FF', 1]]) {
      c.save(); c.translate(s * 10 * sq * (1 - out) + s * 18 * out, lift); c.rotate(s * (0.2 + wob)); c.scale(sc * sq, sc);
      c.font = '400 30px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.lineWidth = 6; c.strokeStyle = '#0B0B1A'; c.strokeText(L, 0, 0); c.fillStyle = col; c.fillText(L, 0, 0);
      c.restore();
    }
    c.restore();
  });
}

// a raised fist with n fingers up (rig space, at a wrist), the knuckles toward us
function twCountHand(c, wr, n, pal, t, tilt = -0.1) {
  c.save(); c.translate(wr[0], wr[1] - 16); c.rotate(tilt);
  const fing = (x, len, ang) => {
    c.save(); c.translate(x, -8); c.rotate(ang);
    rrect(c, -6.5, -len, 13, len + 6, 6.5); c.fillStyle = pal.skinSh; c.fill();
    rrect(c, -5, -len + 1, 10, len + 3, 5); c.fillStyle = pal.skin; c.fill();
    c.restore();
  };
  // fingers in counting order: index, middle, ring, pinky, then the thumb
  const F = [[-9, 40, -0.06], [4, 44, 0], [16, 40, 0.07], [26, 32, 0.16]];
  for (let i = 0; i < Math.min(4, n); i++) fing(F[i][0], F[i][1], F[i][2]);
  // the fist
  rrect(c, -20, -12, 52, 36, 13); c.fillStyle = pal.skinSh; c.fill();
  rrect(c, -18, -11, 48, 32, 12); c.fillStyle = pal.skin; c.fill();
  paint(() => { for (let i = 0; i < 4; i++) if (i >= n) line(c, -10 + i * 12, -6, -10 + i * 12, 4, 2.4, rgba(pal.skinSh, 0.9)); });
  if (n >= 5) fing(-24, 30, -0.75); else { c.save(); c.translate(-20, 6); c.rotate(-0.3); rrect(c, -6, -14, 12, 22, 6); c.fillStyle = pal.skinSh; c.fill(); c.restore(); }
  c.restore();
}
