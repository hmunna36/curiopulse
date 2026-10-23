// What Happens If You Stop Eating? (long-form): the hut's continuity as a function of video time, so every shot agrees
// on what day it is, how far the candle has burned, how cold the room is and what he is wearing. Everything comes from
// the cues (make_timeline.py): d1, d2, d3, d5, d6, d7 (the clock's day jumps), sunUp (the storm breaks).
'use strict';

const DAY_KEYS = [['d1', 1], ['d2', 2], ['d3', 3], ['d5', 5], ['d6', 6], ['d7', 7]];
function dayAt(t) {
  const c = TLd.cues;
  let d = 0;
  for (const [k, n] of DAY_KEYS) if (c[k] !== undefined && t >= c[k]) d = n;
  return d;
}
// a value that moves smoothly from day to day: tab[d] at each day (0..7), eased over 1.2 s after the jump
function dayVal(t, tab) {
  const c = TLd.cues;
  let v = tab[0], prev = tab[0];
  for (const [k, n] of DAY_KEYS) {
    if (c[k] === undefined || t < c[k]) break;
    prev = v; v = tab[n];
    const k2 = ramp(t, c[k], c[k] + 1.2, E.inOutSine);
    v = lerp(prev, v, k2);
  }
  return v;
}
function hutState(t) {
  const c = TLd.cues, d = dayAt(t);
  const sun = c.sunUp === undefined ? 0 : ramp(t, c.sunUp, c.sunUp + 1.5, E.inOutSine);
  const S = {
    day: d,
    tallyK: (() => { let k = 1; for (const [kk] of DAY_KEYS) if (c[kk] !== undefined && t >= c[kk]) k = ramp(t, c[kk] + 0.3, c[kk] + 0.9); return k; })(),
    candle: dayVal(t, [1, 0.88, 0.76, 0.64, 0.55, 0.42, 0.3, 0.28]),
    fire: dayVal(t, [1, 0.95, 0.75, 0.6, 0.5, 0.4, 0.25, 0.6]),
    cold: dayVal(t, [0, 0.1, 0.25, 0.35, 0.45, 0.55, 0.75, 0.4]) * (1 - sun),
    frost: dayVal(t, [0.12, 0.2, 0.3, 0.4, 0.48, 0.56, 0.7, 0.6]),
    storm: 1 - sun, sun,
    hero: {
      beanie: c.d2 === undefined ? 0 : ramp(t, c.d2 + 0.2, c.d2 + 0.7),
      blanket: c.d5 === undefined ? 0 : ramp(t, c.d5 + 0.2, c.d5 + 0.9),
      stubble: dayVal(t, [0, 0.12, 0.28, 0.42, 0.55, 0.7, 0.82, 0.9]),
      bags: dayVal(t, [0, 0.1, 0.25, 0.35, 0.45, 0.6, 0.75, 0.6]),
      hollow: dayVal(t, [0, 0, 0.15, 0.25, 0.35, 0.5, 0.65, 0.6]),
      blue: dayVal(t, [0, 0, 0.1, 0.2, 0.3, 0.4, 0.6, 0.1]) * (1 - sun),
      breath: dayVal(t, [0, 0, 0.4, 0.6, 0.8, 0.9, 1, 0]) * (1 - sun),
    },
  };
  return S;
}
// the hut as it is at time t, with this shot's own changes merged in (o.hero merges into the state's hero)
function hutNow(cam, t, o = {}) {
  const S = hutState(t);
  const hero = Object.assign({}, S.hero, o.hero || {});
  return hutScene(cam, t, Object.assign({ day: S.day, tallyK: S.tallyK, candle: S.candle, fire: S.fire, cold: S.cold, frost: S.frost, storm: S.storm, sun: S.sun,
    choc: { glow: 0.35 }, lemon: { rind: 1 } }, o, { hero }));
}
// cameras on the hut: his head at screen point (sx, sy) at this zoom; a world point at a screen point
function hutHeadCam(zoom, sx = W / 2, sy = H / 2, h = {}) {
  const hp = hutHead(h);
  return { x: hp[0] - (sx - W / 2) / zoom, y: hp[1] - (sy - H / 2) / zoom, zoom, rot: 0 };
}
function ptCam(P, zoom, sx = W / 2, sy = H / 2) { return { x: P[0] - (sx - W / 2) / zoom, y: P[1] - (sy - H / 2) / zoom, zoom, rot: 0 }; }
function mixCam(a, b, k) { return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), zoom: Math.exp(lerp(Math.log(a.zoom), Math.log(b.zoom), k)), rot: lerp(a.rot || 0, b.rot || 0, k) }; }
function shakeCam(cam, t, amp) { const [dx, dy] = shake(t, amp, 18, 3); return Object.assign({}, cam, { x: cam.x + dx / cam.zoom, y: cam.y + dy / cam.zoom }); }
// a slow drift so no frame is ever locked (a few px over the shot)
function driftCam(cam, lt, amt = 1) { return Object.assign({}, cam, { x: cam.x + amt * 14 * Math.sin(lt * 0.35) / cam.zoom, y: cam.y + amt * 8 * Math.sin(lt * 0.27 + 1) / cam.zoom }); }
