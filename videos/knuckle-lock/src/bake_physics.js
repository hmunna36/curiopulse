// Bake this Short's 2D physics before frame 0, so every frame can render on its own (stills, ranges, the full encode).
// usage: node bake_physics.js <work_dir>        (build.sh runs it after make_timeline.py when src/physics.js exists)
//
// Why baked: render.js drives one page, but renderFrame(f) must be a pure function of f, because stills
// ("0,45,120"), shot ranges ("300-420") and the full encode all jump straight to their frames. A simulation stepped
// once per rendered frame would only be right in a full 0..N render. So the whole sim runs here, at a fixed 240 Hz,
// and the page only looks positions up (web/toolkit.js: physAt, physBody, physHits).
//
// Reads src/physics.js + <work>/timeline.json, steps matter-js 0.20 (web/vendor/matter-js, MIT), writes
// <work>/physics.json: { <name>: {t0, hz, ids, meta, frames, hits} }
//   meta:   per body id {kind: 'circle', r} | {kind: 'rect', w, h} | {kind: 'poly', verts}, plus from: the video time
//           a held body was released (draw it only from then on)
//   frames: one entry per 1/hz s (hz = 60) from t0: [x, y, angle, x, y, angle, ...] for the tracked bodies, in the
//           order of ids (world px, y down; radians)
//   hits:   collisions [{t, a, b, speed}]: video seconds, the two body ids ('ground' for static ones), the closing
//           speed along the contact normal in px/s (sfxkit.phys_hits turns them into impact sounds)
// render.js hands physics.json to the page as window.PHYS.
//
// src/physics.js (per video) exports one function per simulation; it gets helpers and returns {t0, dur, gravity}:
//   module.exports = {
//     drop: ({ M, cues, ball, box, poly, ground, vel, spin, at, hold, release }) => {
//       ground(540, 1520, 900, 40);                              // static: centre x, y, width, height [, angle]
//       const a = ball('a', 470, 700, 34, { restitution: 0.5 }); // tracked: id, x, y, radius [, matter options]
//       vel(a, 160, -420); spin(a, 3);                           // start velocity (px/s) and spin (rad/s)
//       at(cues.kick, () => vel(a, -300, -600));                 // anything at a video time (a kick on a cue)
//       const b = hold(box('b', 600, 900, 40, 14));              // frozen + ghostly until...
//       at(cues.chop, () => release(b, 200, -900, 6));           // ...thrown at a cue (the scene hides it before)
//       return { t0: cues.drop, dur: 3.0, gravity: 2600 };       // start (video s), length (s), gravity (px/s^2)
//     },
//   };
// Bodies are in world px (the 1080x1920 frame at zoom 1). Gravity: ~2600 px/s^2 reads as real for hiker-sized props
// (he is ~560 px tall at s = 1); matter's default would be 1000.
'use strict';
const fs = require('fs');
const path = require('path');

const SRC = __dirname;
const Matter = require(path.join(SRC, 'web/vendor/matter-js/matter.min.js'));
const SIM_HZ = 240, OUT_HZ = 60, BASE = 60;   // matter 0.20 velocities are px per 1000/60 ms

const work = process.argv[2];
if (!work) { console.error('usage: node bake_physics.js <work_dir>'); process.exit(2); }
const specFile = path.join(SRC, 'physics.js');
if (!fs.existsSync(specFile)) { console.log('bake_physics: no src/physics.js, nothing to bake'); process.exit(0); }
const tl = JSON.parse(fs.readFileSync(path.join(work, 'timeline.json'), 'utf8'));
const specs = require(specFile);
const r2 = (v) => Math.round(v * 100) / 100, r4 = (v) => Math.round(v * 10000) / 10000;
const out = {};

for (const [name, spec] of Object.entries(specs)) {
  Matter.Common._nextId = 0;          // the same ids and seeded randomness on every bake
  Matter.Common._seed = 0;
  const engine = Matter.Engine.create({ enableSleeping: false });
  engine.positionIterations = 10;
  engine.velocityIterations = 8;
  const world = engine.world, tracked = [], meta = {}, timed = [];
  let simT = 0;
  const add = (b) => { Matter.Composite.add(world, b); return b; };
  const track = (id, b, m) => {
    if (meta[id]) throw new Error(`physics.js ${name}: body id "${id}" used twice`);
    b.label = id; tracked.push(b); meta[id] = m; return b;
  };
  const api = {
    M: Matter, Matter, tl, cues: tl.cues, world, engine, add,
    ball: (id, x, y, r, o = {}) => track(id, add(Matter.Bodies.circle(x, y, r, o)), { kind: 'circle', r }),
    box: (id, x, y, w, h, o = {}) => track(id, add(Matter.Bodies.rectangle(x, y, w, h, o)), { kind: 'rect', w, h }),
    poly: (id, x, y, verts, o = {}) => {
      const b = add(Matter.Bodies.fromVertices(x, y, [verts.map(([vx, vy]) => ({ x: vx, y: vy }))], o));
      return track(id, b, { kind: 'poly', verts: b.vertices.map((v) => [r2(v.x - b.position.x), r2(v.y - b.position.y)]) });
    },
    ground: (x, y, w, h, angle = 0, o = {}) => add(Matter.Bodies.rectangle(x, y, w, h, Object.assign({ isStatic: true, angle, label: 'ground' }, o))),
    wall: (x, y, w, h, angle = 0, o = {}) => add(Matter.Bodies.rectangle(x, y, w, h, Object.assign({ isStatic: true, angle, label: 'wall' }, o))),
    track,                                   // track(id, anyMatterBody, meta) for bodies made with M directly
    vel: (b, vx, vy) => Matter.Body.setVelocity(b, { x: vx / BASE, y: vy / BASE }),
    spin: (b, w) => Matter.Body.setAngularVelocity(b, w / BASE),
    at: (t, f) => timed.push([t, f]),
    // hold(b): frozen and ghostly (no collisions) until release(b, vx, vy, spin) at a cue: things that appear or get
    // thrown mid-scene. (Never create a body with isStatic: true and free it later: matter loses its mass.)
    hold: (b) => { Matter.Body.setStatic(b, true); b.isSensor = true; if (meta[b.label]) meta[b.label].from = 1e9; return b; },
    release: (b, vx = 0, vy = 0, w = 0) => {
      Matter.Body.setStatic(b, false); b.isSensor = false;
      if (meta[b.label]) meta[b.label].from = r4(simT);          // the page hides a held body until t >= from
      Matter.Body.setVelocity(b, { x: vx / BASE, y: vy / BASE }); Matter.Body.setAngularVelocity(b, w / BASE);
    },
  };
  const cfg = spec(api) || {};
  const t0 = cfg.t0 || 0, dur = cfg.dur || 3;
  engine.gravity.x = 0; engine.gravity.y = 1;
  engine.gravity.scale = (cfg.gravity === undefined ? 2600 : cfg.gravity) / 1e6;   // px/ms^2

  const hits = [];
  simT = t0;
  Matter.Events.on(engine, 'collisionStart', (ev) => {
    for (const p of ev.pairs) {
      if (p.isSensor || p.bodyA.isSensor || p.bodyB.isSensor) continue;   // held (ghost) bodies make no sound
      const A = p.bodyA.parent || p.bodyA, B = p.bodyB.parent || p.bodyB;
      const va = Matter.Body.getVelocity(A), vb = Matter.Body.getVelocity(B), n = p.collision.normal;
      const speed = Math.abs((va.x - vb.x) * n.x + (va.y - vb.y) * n.y) * BASE;
      if (speed < 20) continue;
      const last = hits.length && hits[hits.length - 1];
      if (last && last.a === A.label && last.b === B.label && simT - last.t < 0.06) { last.speed = Math.max(last.speed, speed); continue; }
      hits.push({ t: simT, a: A.label, b: B.label, speed });
    }
  });
  const snap = () => tracked.flatMap((b) => [r2(b.position.x), r2(b.position.y), r4(b.angle)]);
  const frames = [snap()];
  timed.sort((a, b) => a[0] - b[0]);
  const steps = Math.round(dur * SIM_HZ), per = SIM_HZ / OUT_HZ;
  for (let s = 1; s <= steps; s++) {
    simT = t0 + s / SIM_HZ;
    while (timed.length && timed[0][0] <= simT) timed.shift()[1]();
    Matter.Engine.update(engine, 1000 / SIM_HZ);
    if (s % per === 0) frames.push(snap());
  }
  out[name] = { t0, hz: OUT_HZ, ids: tracked.map((b) => b.label), meta, frames,
    hits: hits.map((h) => ({ t: r4(h.t), a: h.a, b: h.b, speed: Math.round(h.speed) })) };
  console.log(`bake_physics: ${name}: ${tracked.length} bodies, ${frames.length} frames (${t0.toFixed(2)}-${(t0 + dur).toFixed(2)} s), ${hits.length} hits`);
}
fs.writeFileSync(path.join(work, 'physics.json'), JSON.stringify(out));
console.log(`wrote ${path.join(work, 'physics.json')}`);
