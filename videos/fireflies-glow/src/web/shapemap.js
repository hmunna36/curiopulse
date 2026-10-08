// THE SHAPE MAP (the cinematic look, 8 Oct 2026; reference/visual.md "The light").
// Every opaque shape a scene draws on the main canvas (ctx) or on the character layer (lctx) is drawn a second time,
// flat, into a hidden canvas, in a colour that is its serial number. The light stage (lightstage.js) reads that map:
// it tells where one thing ends and the next begins, and which of two neighbours was drawn later (= is in front).
// Left out, because they are paint on the surface below and not things: shapes under 10 px, lines thinner than 14 px,
// anything see-through, blurred, drawn with a blend mode or inside a clip(), and whatever a scene wraps in paint(fn)
// (look.js). A solid image or lettering drawn over mapped shapes becomes one flat thing that is never lit (it hides
// what is under it). Nothing here changes what the scene draws.
'use strict';
const idC = mkCanvas(W, H), ictx = idC.getContext('2d');
const idLC = mkCanvas(W, H), ilctx = idLC.getContext('2d');
ictx.imageSmoothingEnabled = false; ilctx.imageSmoothingEnabled = false;
let ID_N = 0;                                   // serial number of the last shape of this frame
const ID_FLAGS = new Uint8Array(256 * 256 * 4); // per number: [0] = edge rounding in px, [1] = bits (1 a character, 2 flat/huge)
let ID_DECAL = 0;                               // > 0 while what is drawn is paint on a surface (a face, a label's text)
let ID_ACTOR = 0;                               // > 0 while a character is being drawn
let ID_RAW = 0;                                 // > 0 while the look itself draws (nothing is mapped)
const ID_MIN = 10, ID_CAP = 58;

function idColour(id) { const r = id & 255, g = id >> 8; return `rgb(${r},${g},${((r * 167 + 13) ^ (g * 59 + 77)) & 255})`; }
let ID_LAST = { id: -1, key: null, actor: 0 };   // the last numbered shape: the next one of the same paint joins it
function idBreak() { ID_LAST.id = -1; }
function idNew(minDim, w, h, known, flat, key) {
  const big = flat || (known && ID_ACTOR === 0 && ((w > W * 0.8 && h > H * 0.42) || w * h > W * H * 0.5));   // a character is never 'the wall'
  const cap = ID_ACTOR > 0 ? ID_CAP * 1.25 : ID_CAP, r = Math.round(Math.max(0, Math.min(cap, (minDim - 14) * 0.46)));
  // Shapes of the same paint drawn one straight after the other are one thing (the two segments of a limb, the puffs of
  // a cloud, the lobes of a bush): the flat picture shows no line between them, so the light must not invent one.
  if (key && !big && ID_N > 0 && ID_LAST.id === ID_N && ID_LAST.key === key && ID_LAST.actor === ID_ACTOR) {
    if (r > ID_FLAGS[ID_N * 4]) ID_FLAGS[ID_N * 4] = r;
    return ID_N;
  }
  if (ID_N >= 65000) return 0;
  const id = ++ID_N;
  ID_FLAGS[id * 4] = r;
  ID_FLAGS[id * 4 + 1] = (ID_ACTOR > 0 ? 1 : 0) | (big ? 2 : 0);
  ID_FLAGS[id * 4 + 3] = 255;
  ID_LAST = { id: big ? -1 : id, key: key || null, actor: ID_ACTOR };
  return id;
}
function idOpaque(style) {
  if (typeof style === 'string') {
    if (style[0] === '#') return true;
    const m = /,\s*([\d.]+)\)$/.exec(style);
    return !m || +m[1] >= 0.9;
  }
  return style instanceof CanvasGradient && !style.__soft;
}

// An image a scene draws (a cached wall, a desk, a sprite) hides whatever is under it. If it is mostly solid it joins
// the map as one flat, unlit thing (so a desk in front of the hero is not lit as if it were his jacket); a soft overlay
// (smoke, a light cone, rain) is left out and the shapes under it keep their light. Judged once per image, on a
// 24 px copy.
const ID_SOLID = new WeakMap();
const idProbe = mkCanvas(24, 24), idProbeX = idProbe.getContext('2d', { willReadFrequently: true });
const idSprC = mkCanvas(W, H), idSprX = idSprC.getContext('2d');
function idSolid(src) {
  let v = ID_SOLID.get(src);
  if (v !== undefined) return v;
  try {
    idProbeX.clearRect(0, 0, 24, 24); idProbeX.drawImage(src, 0, 0, 24, 24);
    const d = idProbeX.getImageData(0, 0, 24, 24).data;
    let some = 0, solid = 0;
    for (let i = 3; i < d.length; i += 4) { if (d[i] > 12) some++; if (d[i] > 230) solid++; }
    if (some === 0) return false;                  // nothing on it yet (a layer drawn later): ask again next time
    v = solid / some >= 0.6;
  } catch (e) { v = false; }
  ID_SOLID.set(src, v);
  return v;
}

function idMirror(c, m) {
  const P = CanvasRenderingContext2D.prototype;
  let M = null, x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  const tf = () => M || (M = P.getTransform.call(c));
  const add = (x, y) => { const t = tf(), X = t.a * x + t.c * y + t.e, Y = t.b * x + t.d * y + t.f; if (X < x0) x0 = X; if (X > x1) x1 = X; if (Y < y0) y0 = Y; if (Y > y1) y1 = Y; };
  for (const k of ['setTransform', 'resetTransform', 'translate', 'scale', 'rotate', 'transform']) {
    const f = P[k]; c[k] = function (...a) { M = null; f.apply(m, a); return f.apply(this, a); };
  }
  const sv = P.save, rs = P.restore;
  c.save = function () { cstack.push(clipped); sv.call(m); return sv.call(this); };
  c.restore = function () { M = null; if (cstack.length) clipped = cstack.pop(); rs.call(m); return rs.call(this); };
  const path = {
    beginPath() { x0 = y0 = 1e9; x1 = y1 = -1e9; }, closePath() {},
    moveTo(x, y) { add(x, y); }, lineTo(x, y) { add(x, y); },
    quadraticCurveTo(a, b, x, y) { add(a, b); add(x, y); }, bezierCurveTo(a, b, c2, d, x, y) { add(a, b); add(c2, d); add(x, y); },
    arcTo(a, b, c2, d) { add(a, b); add(c2, d); },
    arc(x, y, r) { add(x - r, y - r); add(x + r, y - r); add(x - r, y + r); add(x + r, y + r); },
    ellipse(x, y, rx, ry) { const r = Math.max(rx, ry); add(x - r, y - r); add(x + r, y - r); add(x - r, y + r); add(x + r, y + r); },
    rect(x, y, w, h) { add(x, y); add(x + w, y); add(x, y + h); add(x + w, y + h); },
    roundRect(x, y, w, h) { add(x, y); add(x + w, y); add(x, y + h); add(x + w, y + h); },
  };
  for (const k of Object.keys(path)) {
    const f = P[k], note = path[k]; c[k] = function (...a) { note(...a); f.apply(m, a); return f.apply(this, a); };
  }
  let clipped = false; const cstack = [];
  const clip = P.clip; c.clip = function (...a) { clipped = true; clip.apply(m, a); return clip.apply(this, a); };
  for (const k of ['createLinearGradient', 'createRadialGradient', 'createConicGradient']) {
    const f = P[k];
    c[k] = function (...a) {
      const g = f.apply(this, a), stop = g.addColorStop.bind(g);
      g.__soft = false;
      g.addColorStop = (o, col) => { if (!idOpaque(col)) g.__soft = true; stop(o, col); };
      return g;
    };
  }
  const plain = (t) => ID_RAW === 0 && ID_DECAL === 0 && !clipped && t.globalCompositeOperation === 'source-over' && t.globalAlpha > 0.9 && (t.filter === 'none' || !t.filter);
  const fill = P.fill;
  c.fill = function (...a) {
    const r = fill.apply(this, a);
    if (!plain(this) || !idOpaque(this.fillStyle)) return r;
    const p2 = a[0] instanceof Path2D, w = x1 - x0, h = y1 - y0, mn = p2 ? 60 : Math.min(w, h);
    if (!(mn >= ID_MIN)) return r;
    const id = idNew(mn, w, h, !p2, false, typeof this.fillStyle === 'string' ? this.fillStyle : null); if (!id) return r;
    m.fillStyle = idColour(id); fill.apply(m, a);
    return r;
  };
  const stroke = P.stroke;
  c.stroke = function (...a) {
    const r = stroke.apply(this, a);
    if (!plain(this) || !idOpaque(this.strokeStyle) || this.getLineDash().length) return r;
    const t = tf(), lw = this.lineWidth * Math.sqrt(Math.abs(t.a * t.d - t.b * t.c));
    if (lw < 14) return r;                                             // a thin line is ink, not a thing
    const p2 = a[0] instanceof Path2D, w = x1 - x0 + lw, h = y1 - y0 + lw;
    const id = idNew(p2 ? lw : Math.min(Math.max(w, h), lw), w, h, !p2, false, typeof this.strokeStyle === 'string' ? this.strokeStyle : null); if (!id) return r;
    m.lineWidth = this.lineWidth; m.lineCap = this.lineCap; m.lineJoin = this.lineJoin; m.miterLimit = this.miterLimit;
    m.strokeStyle = idColour(id); stroke.apply(m, a);
    return r;
  };
  const fillRect = P.fillRect;
  c.fillRect = function (x, y, w, h) {
    const r = fillRect.call(this, x, y, w, h);
    if (!plain(this) || !idOpaque(this.fillStyle)) return r;
    const t = tf(), s = Math.sqrt(Math.abs(t.a * t.d - t.b * t.c)), dw = Math.abs(w) * s, dh = Math.abs(h) * s;
    if (Math.min(dw, dh) < ID_MIN) return r;
    const id = idNew(Math.min(dw, dh), dw, dh, true, false, typeof this.fillStyle === 'string' ? this.fillStyle : null); if (!id) return r;
    m.fillStyle = idColour(id); fillRect.call(m, x, y, w, h);
    return r;
  };
  const clearRect = P.clearRect;
  c.clearRect = function (...a) { clearRect.apply(m, a); return clearRect.apply(this, a); };
  // a solid image over mapped shapes: its silhouette, in its own number, flat (never lit, never 'behind')
  const drawImage = P.drawImage;
  c.drawImage = function (src, ...a) {
    const r = drawImage.call(this, src, ...a);
    if (ID_N === 0 || !plain(this) || src === mainC || !idSolid(src)) return r;
    const id = idNew(0, W, H, true, true); if (!id) return r;
    idSprX.setTransform(1, 0, 0, 1, 0, 0); idSprX.globalCompositeOperation = 'source-over'; idSprX.clearRect(0, 0, W, H);
    idSprX.setTransform(tf()); drawImage.call(idSprX, src, ...a);
    idSprX.setTransform(1, 0, 0, 1, 0, 0); idSprX.globalCompositeOperation = 'source-in'; idSprX.fillStyle = idColour(id); idSprX.fillRect(0, 0, W, H);
    sv.call(m); P.setTransform.call(m, 1, 0, 0, 1, 0, 0); drawImage.call(m, idSprC, 0, 0); rs.call(m);
    return r;
  };
  // lettering a scene draws (a label, a big word): flat and unlit too, so no shadow or rim runs across it
  const px = (t) => { const k = /([\d.]+)px/.exec(t.font); const q = tf(); return (k ? +k[1] : 10) * Math.sqrt(Math.abs(q.a * q.d - q.b * q.c)); };
  const text = (t) => { m.font = t.font; m.textAlign = t.textAlign; m.textBaseline = t.textBaseline; if ('letterSpacing' in t) m.letterSpacing = t.letterSpacing; };
  const fillText = P.fillText;
  c.fillText = function (...a) {
    const r = fillText.apply(this, a);
    if (ID_N === 0 || !plain(this) || !idOpaque(this.fillStyle) || px(this) < 26) return r;
    const id = idNew(0, 0, 0, true, true); if (!id) return r;
    text(this); m.fillStyle = idColour(id); fillText.apply(m, a);
    return r;
  };
  const strokeText = P.strokeText;
  c.strokeText = function (...a) {
    const r = strokeText.apply(this, a);
    if (ID_N === 0 || !plain(this) || !idOpaque(this.strokeStyle) || px(this) < 26) return r;
    const id = idNew(0, 0, 0, true, true); if (!id) return r;
    text(this); m.lineWidth = this.lineWidth; m.lineJoin = this.lineJoin; m.miterLimit = this.miterLimit; m.strokeStyle = idColour(id); strokeText.apply(m, a);
    return r;
  };
  c.__idMap = m;                                   // character.js draws flat limbs only on a mapped canvas
  c.__idReset = () => { clipped = false; cstack.length = 0; M = null; };      // each frame starts clean
}
