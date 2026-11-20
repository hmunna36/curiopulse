// THE LOOK (the cinematic look, 8 Oct 2026; reference/visual.md "The light").
// timeline.json carries look: 'cine' (the house look: publish.json "look", default 'cine') or 'classic' (the picture
// as it was until 7 Oct 2026). In 'cine' a scene draws exactly what it always drew; shapemap.js notes every shape, and
// lightstage.js lights the picture up to three times a frame: the set behind the hero (the moment he is about to be
// drawn on it), then the hero and whatever is in front of him, then the lens over the finished frame. Captions, the
// subscribe button and the watermark are drawn after all of it, so they stay crisp.
// A scene tells the look four things, all optional (the defaults are safe):
//   setLights({shot id: LIGHTS.<place> or {...}})   the light of each place
//   actor(fn)       what fn draws is a character (the hiker is one already): rim light + the full drawn shadow
//   paint(fn)       what fn draws is paint on a surface (a face, a label, a pattern): no edge, no shadow of its own
//   sunRays(x, y)   a sun or a window at that world point sends rays past whatever stands in front of it
'use strict';
const LOOK_WANT = (window.TL && window.TL.look) || 'classic';
const CINE = LOOK_WANT === 'cine' && typeof LS !== 'undefined' && !!LS;
const LOOK_BOLD = !!(window.TL && window.TL.lookBold);        // a stronger setting of the same look (not the house setting)
window.LOOK_STATUS = CINE ? `cine (light stage on: ${LS.renderer})`
  : LOOK_WANT === 'cine' ? `classic (cine was asked for, but the light stage is off: ${window.LOOK_ERROR || 'reason unknown'})` : 'classic';
const LK_P = CanvasRenderingContext2D.prototype;
let LK = { hero: null, plate: false, onLayer: false, t: 0, lt: 0, shot: '', rays: null };

// ---------------------------------------------------------------- the light rig
// Directions are in screen terms: x right, y DOWN, z toward the viewer; `key` points from the scene to the lamp
// ([-0.5, -0.6, 0.6] = up and to the left, in front), `rimFrom` is where the back light sits ([0.8, -0.5] = right, above).
// Tints multiply colour in linear light (1 = unchanged). Amounts are 0..1 unless noted.
const LIGHT = {
  key: [-0.50, -0.62, 0.60], keyTint: [1.07, 1.02, 0.94],          // the key light and the colour it gives lit surfaces
  shadowTint: [0.72, 0.74, 0.97], shadowDeep: 1.3,                 // a shadow deepens the colour it falls on (power), then this mild tint
  rimFrom: [0.80, -0.50], rim: [0.55, 0.78, 1.0], rimAmt: 1.25,    // the rim on a character's outline
  form: 1.0, cast: 0.8, ao: 0.22,                                  // the drawn shadow on the far side, dropped shadows, tucked-under darkness
  steep: 2.1, toonAt: 0.50, toonSoft: 0.10, castSoft: 0.42,        // where the shadow's edge sits and how soft it is
  props: 0.5, propsRim: 0.0,                                       // things that are not characters: half the drawn shadow, no rim
  spill: 0.5,                                                      // glow-layer light on its neighbours
  pool: 0.55, poolTint: [0.46, 0.45, 0.74],                        // how far the set falls off away from the hero, and toward what
  halo: 0.16, haloColor: null,                                     // the glow behind his head (null = the rim's colour)
  beams: 0.0, beamColor: [1.0, 0.86, 0.62], dof: 0.0,              // shafts of light in haze; extra softness of the set in close-ups
  bloomAt: 0.58, bloom: 0.14, halation: 0.20, fringe: 1.3, grain: 0.0, contrast: 0.26, sat: 1.05, split: 1.0,   // the lens
};
// The light of a place. Start from one of these (`setLights({hook: LIGHTS.lanterns})`), change what the place needs
// (`{...LIGHTS.candle, rim: [1, 0.4, 0.3]}`), mirror it when the lamp is on the other side (`flipLight(LIGHTS.day)`).
const LIGHTS = {
  room: {},                                                        // the house rig as it is: a lit interior
  lanterns: { key: [-0.30, -0.78, 0.55], keyTint: [1.10, 1.02, 0.90], shadowTint: [0.70, 0.64, 0.92], rimFrom: [0.90, -0.30], rim: [1.0, 0.50, 0.20], rimAmt: 1.35, haloColor: [1.0, 0.55, 0.35], halo: 0.10, pool: 0.62 },   // a night outdoors under warm lamps
  candle: { key: [-0.48, -0.60, 0.62], keyTint: [1.10, 1.03, 0.90], shadowTint: [0.72, 0.70, 0.96], rimFrom: [0.90, -0.30], rim: [0.50, 0.70, 1.0], rimAmt: 1.3, haloColor: [1.0, 0.72, 0.45], halo: 0.16, pool: 0.72 },   // a dim room, one warm lamp, a cool window behind
  day: { key: [0.45, -0.66, 0.60], keyTint: [1.05, 1.03, 0.98], shadowTint: [0.76, 0.82, 1.0], shadowDeep: 1.25, rimFrom: [-0.85, -0.40], rim: [0.80, 0.92, 1.0], rimAmt: 0.8, pool: 0.3, poolTint: [0.66, 0.70, 0.86], halo: 0.06 },   // daylight, outdoors or by a big window
  sunset: { key: [0.58, -0.42, 0.62], keyTint: [1.10, 1.0, 0.88], shadowTint: [0.86, 0.66, 0.78], rimFrom: [0.95, 0.15], rim: [1.0, 0.56, 0.20], rimAmt: 1.3, propsRim: 0.22, pool: 0.4, poolTint: [0.42, 0.40, 0.78] },   // a low sun on the right
  night: { key: [-0.40, -0.70, 0.58], keyTint: [0.94, 0.99, 1.08], shadowTint: [0.62, 0.66, 1.0], shadowDeep: 1.45, rimFrom: [0.85, -0.40], rim: [0.55, 0.70, 1.0], rimAmt: 1.3, pool: 0.8, poolTint: [0.34, 0.38, 0.72] },   // moonlight, a dark bedroom
  inside: { key: [-0.45, -0.65, 0.60], shadowTint: [0.76, 0.66, 0.88], rim: [1.0, 0.62, 0.72], pool: 0.5 },   // inside the body
  screen: { key: [-0.62, -0.42, 0.62], keyTint: [0.98, 1.08, 0.96], shadowTint: [0.68, 0.62, 0.98], rimFrom: [0.85, -0.35], rim: [1.0, 0.45, 0.85], rimAmt: 0.9, pool: 0.6, poolTint: [0.34, 0.36, 0.80] },   // a control room lit by its monitors
  water: { key: [-0.20, -0.82, 0.54], keyTint: [0.96, 1.06, 1.04], shadowTint: [0.62, 0.78, 0.92], rim: [0.60, 1.0, 0.90], rimAmt: 0.9, pool: 0.6, poolTint: [0.36, 0.52, 0.66] },   // under water
  diagram: { form: 0.7, cast: 0.7, props: 0.4, pool: 0.3, halo: 0, rimAmt: 0.8 },   // a graphic shot: labels, charts, a clean explainer board
};
function flipLight(L) { const o = Object.assign({}, LIGHT, L); return Object.assign({}, L, { key: [-o.key[0], o.key[1], o.key[2]], rimFrom: [-o.rimFrom[0], o.rimFrom[1]] }); }
const LOOK_LIGHTS = {};
// shot id -> light notes: an object, or (lt, t) => object for a light that changes inside the shot (a flash, a fire flaring)
function setLights(map) { Object.assign(LOOK_LIGHTS, map); }
function lookLight() {
  let n = LOOK_LIGHTS[LK.shot];
  if (typeof n === 'function') n = n(LK.lt, LK.t);
  const L = Object.assign({}, LIGHT, n || {});
  if (LOOK_BOLD) {
    L.pool = Math.min(1, L.pool * 1.3); L.poolTint = [0.30, 0.31, 0.62]; L.halo *= 1.7; L.rimAmt *= 1.5; L.bloom *= 1.7; L.halation *= 1.7;
    L.contrast = 0.36; L.shadowDeep = 1.55; L.beams = Math.max(L.beams, 0.30); L.spill *= 1.5;
  }
  return L;
}

// ---------------------------------------------------------------- the three moments of a frame (main.js calls them)
function lookRawBack() {           // put the light stage's picture back on the main canvas
  ID_RAW++;
  LK_P.save.call(ctx); LK_P.setTransform.call(ctx, 1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'copy'; ctx.filter = 'none';
  LK_P.drawImage.call(ctx, LS.canvas, 0, 0);
  LK_P.restore.call(ctx);
  ID_RAW--;
}
function lookClearIds(x) { x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, W, H); x.restore(); }
function lookPoolOf(h) { return h ? [h.x, h.y + 120 * h.sc, 560 + 300 * h.sc] : [W / 2, H * 0.43, 980]; }
function lookHaloOf(h) { return h ? [h.x + 30 * h.sc, h.y - 20 * h.sc, 300 + 210 * h.sc] : null; }

function lookFrameStart(f) {       // before the scene draws
  if (!CINE) return;
  const t = f / FPS, shot = typeof shotAt === 'function' ? shotAt(t) : null;
  LK = { hero: null, plate: false, onLayer: false, t, lt: shot ? t - shot.start : 0, shot: shot ? shot.id : '', rays: null };
  ID_N = 0; ID_DECAL = 0; ID_ACTOR = 0; ID_RAW = 0; idBreak();
  ctx.__idReset(); lctx.__idReset();
  lookClearIds(ictx); lookClearIds(ilctx);
}
// the set is complete and the hero is about to go on top of it: light it (and soften it if the shot asks for that)
function lookPlate() {
  LK.plate = true;
  const L = lookLight(), h = LK.hero;
  LS.light(mainC, idC, glowC, L, { plate: true, blur: clamp((h.sc - 0.72) * 3.1, 0, 7.5) * L.dof, pool: lookPoolOf(h), halo: lookHaloOf(h), time: LK.t });
  lookRawBack();
  lookClearIds(ictx); idBreak();
}
function lookScene(f) {            // the scene has finished drawing (before the glow layer is added)
  if (!CINE) return;
  LS.light(mainC, idC, glowC, lookLight(), { plate: !LK.plate, blur: 0, pool: lookPoolOf(LK.hero), halo: null, time: LK.t });
  lookRawBack();
  ID_RAW = 1;                      // the map is closed: what main.js draws from here on (glow, vignette, grain, captions) is not a thing
}
function lookFinal(f) {            // after the glow and the vignette, before grain and captions
  if (!CINE) return;
  LS.lens(mainC, lookLight(), f, LK.rays);
  lookRawBack();
}

if (CINE) {
  idMirror(ctx, ictx); idMirror(lctx, ilctx);
  // the character layer lands on the main canvas: first the set gets its light, then the layer's shapes join the map
  const mapped = ctx.drawImage;     // shapemap.js's hook (a solid image becomes a flat thing)
  ctx.drawImage = function (src, ...a) {
    if (ID_RAW > 0 || src !== layerC) return mapped.call(this, src, ...a);
    if (LK.onLayer && !LK.plate) lookPlate();
    const r = LK_P.drawImage.call(this, src, ...a);
    if (this.globalAlpha > 0.25 && this.globalCompositeOperation === 'source-over') LK_P.drawImage.call(ictx, idLC, ...a);   // (a layer fading in is lit from 25 % on)
    return r;
  };
  const lclear = lctx.clearRect;
  lctx.clearRect = function (...a) { LK.onLayer = false; return lclear.apply(this, a); };
}
// character.js calls these around the rig's own drawing
function lookHeroBegin(c, st) {
  if (!CINE || !c.__idMap) return false;
  const m = LK_P.getTransform.call(c), p = m.transformPoint(new DOMPoint(st.x, st.y - 250 * st.s));
  const h = { x: p.x, y: p.y, sc: Math.hypot(m.a, m.b) * st.s };
  if (!LK.hero || h.sc > LK.hero.sc) LK.hero = h;
  if (c === lctx) LK.onLayer = true;
  else if (c === ctx && !LK.plate) lookPlate();
  ID_ACTOR++;
  return true;
}
function lookHeroEnd(on) { if (on) ID_ACTOR--; }

// ---------------------------------------------------------------- what a scene can tell the look (no-ops in the classic look)
function actor(fn) { ID_ACTOR++; try { return fn(); } finally { ID_ACTOR--; } }
function paint(fn) { ID_DECAL++; try { return fn(); } finally { ID_DECAL--; } }
// call it with the camera applied; amt 0..1.5; o: {reach: how far around the source counts, in frame widths (0.55), color: [r, g, b]}
function sunRays(x, y, amt = 1, o = {}) {
  if (!CINE) return;
  const p = LK_P.getTransform.call(ctx).transformPoint(new DOMPoint(x, y));
  LK.rays = { x: p.x, y: p.y, amt, reach: o.reach, color: o.color };
}
