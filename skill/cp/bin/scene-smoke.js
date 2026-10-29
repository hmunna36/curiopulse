// scene-smoke.js (29 Oct 2026, wombat-cubes): run a Short's shots in Node, no browser, while the render gate is shut.
// A Proxy canvas context accepts every call; the page's scripts load in scene.html's order; then renderFrame(f) runs for
// the frames given. It draws nothing (no picture to look at): it catches ReferenceError / TypeError / a bad cue in scene
// code, so the first stills after the gate opens are about the picture, not about crashes. The light stage is off (no WebGL).
// usage: node ~/.claude/skills/cp/bin/scene-smoke.js <src/web dir> <.work/timeline.json> "0,9,18,...,last"
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const [webDir, tlPath, framesArg] = process.argv.slice(2);
const TL = JSON.parse(fs.readFileSync(tlPath, 'utf8'));

function mockCtx(canvas) {
  const grad = { addColorStop() {} };
  const state = { canvas, filter: 'none', globalAlpha: 1, globalCompositeOperation: 'source-over', lineWidth: 1, font: '10px sans',
    fillStyle: '#000', strokeStyle: '#000', textAlign: 'left', textBaseline: 'alphabetic', lineCap: 'butt', lineJoin: 'miter',
    lineDashOffset: 0, shadowBlur: 0, shadowColor: '', imageSmoothingEnabled: true };
  const fns = {
    createLinearGradient: () => grad, createRadialGradient: () => grad, createConicGradient: () => grad,
    createPattern: () => ({ setTransform() {} }),
    measureText: (s) => ({ width: String(s).length * 10, actualBoundingBoxAscent: 8, actualBoundingBoxDescent: 2 }),
    getImageData: (x, y, w, h) => ({ data: new Uint8ClampedArray(Math.max(1, w * h * 4)), width: w, height: h }),
    createImageData: (w, h) => ({ data: new Uint8ClampedArray(Math.max(1, (w.width || w) * (h || w.height) * 4)), width: w.width || w, height: h || w.height }),
    getTransform: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0, inverse() { return this; } }),
    isPointInPath: () => false, getLineDash: () => [],
  };
  return new Proxy(state, {
    get(o, k) {
      if (k in fns) return fns[k];
      if (k in o) return o[k];
      if (typeof k === 'symbol') return undefined;
      return function () {};   // any drawing method
    },
    set(o, k, v) { o[k] = v; return true; },
  });
}
function mockCanvas(w = 300, h = 150) {
  const c = { width: w, height: h, style: {} };
  c.getContext = (kind) => (kind === '2d' ? (c._ctx = c._ctx || mockCtx(c)) : null);
  c.toDataURL = () => 'data:,';
  return c;
}
const mainCanvas = mockCanvas(1080, 1920);
const sandbox = {
  console, Math, JSON, Date, Promise, Uint8ClampedArray, Float32Array, Uint8Array, Int32Array, Array, Object, Map, Set, WeakMap,
  Number, String, Boolean, Symbol, Error, TypeError, RangeError, Proxy, Reflect, parseInt, parseFloat, isFinite, isNaN,
  setTimeout, clearTimeout, performance: { now: () => 0 },
  document: {
    createElement: (n) => (n === 'canvas' ? mockCanvas() : { style: {}, appendChild() {} }),
    getElementById: () => mainCanvas,
    fonts: { load: () => Promise.resolve(), ready: Promise.resolve() },
    body: { appendChild() {} },
  },
  Image: function () {}, Path2D: function () { return new Proxy({}, { get: () => function () {} }); },
  OffscreenCanvas: function (w, h) { return mockCanvas(w, h); },
  CanvasRenderingContext2D: function () {},
  navigator: { userAgent: 'node' },
};
sandbox.CanvasRenderingContext2D.prototype = Object.create(null);
for (const m of ['fill', 'stroke', 'fillRect', 'strokeRect', 'drawImage', 'fillText', 'strokeText', 'save', 'restore', 'clip',
  'beginPath', 'moveTo', 'lineTo', 'arc', 'ellipse', 'rect', 'closePath', 'quadraticCurveTo', 'bezierCurveTo', 'setTransform',
  'translate', 'rotate', 'scale', 'transform', 'clearRect', 'putImageData', 'setLineDash', 'roundRect', 'arcTo', 'resetTransform'])
  sandbox.CanvasRenderingContext2D.prototype[m] = function () {};
sandbox.window = sandbox;
sandbox.self = sandbox;
sandbox.globalThis = sandbox;
sandbox.TL = TL;
vm.createContext(sandbox);
const html = fs.readFileSync(path.join(webDir, 'scene.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
for (const s of scripts) {
  const code = fs.readFileSync(path.join(webDir, s), 'utf8');
  try { vm.runInContext(code, sandbox, { filename: s }); }
  catch (e) { console.log(`LOAD ${s}: ${e.message}`); }
}
setTimeout(() => {
  if (!sandbox.READY) { console.log('NOT READY (init failed?)'); }
  const frames = framesArg.split(',').map(Number);
  let bad = 0;
  for (const f of frames) {
    try { sandbox.renderFrame(f); }
    catch (e) { bad++; console.log(`f${f} (${(f / 30).toFixed(2)} s): ${e.stack.split('\n').slice(0, 3).join(' | ')}`); }
  }
  console.log(`smoke: ${frames.length - bad}/${frames.length} frames ran`);
}, 50);
