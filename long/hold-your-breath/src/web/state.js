// What If You Hold Your Breath TOO Long? (long-form): the kitchen's continuity. kState(t) says, for any moment of the
// film, how he looks (cheeks, colour, face, hands, props), how Pip looks, and what the candles are doing, all from the
// timeline's cues; every kitchen shot draws kitScene(cam, t, kState(t)) with its own camera, so a cut never jumps.
'use strict';

const cue = (n, d = 1e9) => { const v = TLd.cues[n]; return v === undefined ? d : v; };
const since = (t, n) => t - cue(n);
const env2 = (t, a, b, r = 0.2) => Math.min(ramp(t, a, a + r), 1 - ramp(t, b - r, b));
const popK = (t, a, d = 0.3) => E.outBack(clamp((t - a) / d), 2);

// how far into his first hold (0..1 over the 45 seconds) at time t
function hold1(t) { return clamp((t - cue('now')) / Math.max(1, cue('out') - cue('now'))); }

function kState(t) {
  const c = TLd.cues;
  const H = { face: FACES.calm, puff: 0, flush: 0, hat: [1, 0, 0], L: [-70, -60], R: [70, -60] };
  const P = { face: FACES.smug, puff: 0, hat: [1, 0, 0], L: [-70, -60], R: [70, -60] };
  const cake = { lit: 1, lean: 0, out: -1 };
  let dusk = clamp(inv(cue('dusk0'), cue('dusk1'), t));
  // ---------------------------------------------------------------- act 1: the first hold, in real time
  if (t < cue('out')) {
    const inh = ramp(t, 0.0, cue('now'), E.inOutCubic);          // the breath in (frame 1 is mid-breath)
    const k = hold1(t);
    H.puff = inh * (1 + 0.15 * k);
    H.face = t < cue('now') ? lerpFace(FACES.startled, FACES.hold, inh)
      : (k < 0.45 ? lerpFace(FACES.hold, FACES.smug, env2(t, cue('ten') - 0.2, cue('ten') + 1.6, 0.3))
        : lerpFace(FACES.strain, FACES.bulge, clamp((k - 0.7) / 0.3)));
    if (k >= 0.45 && k < 0.6) H.face = lerpFace(FACES.hold, FACES.strain, (k - 0.45) / 0.15);
    H.flush = clamp((k - 0.2) * 1.4);
    H.purple = k > 0.92 ? 1 : 0;
    H.wob = clamp((k - 0.55) * 2.5);
    H.sweat = clamp((k - 0.65) * 3);
    H.tremble = 0.06 * clamp((k - 0.8) * 5);
    // the thumbs-up on "Ten seconds. Easy."
    const th = env2(t, cue('ten') - 0.15, cue('ten') + 1.8, 0.25);
    if (th > 0) { H.R = [lerp(70, 120, th), lerp(-60, -190, th)]; H.hand = th > 0.5 ? 'thumbR' : 'open'; }
    // his hand on his chest when it burns
    const bu = env2(t, cue('burn') - 0.1, cue('out') - 0.2, 0.3);
    if (bu > 0) H.L = [lerp(-70, -10, bu), lerp(-60, -150, bu)];
    P.puff = 0.8; P.face = lerpFace(FACES.smug, FACES.hold, 0.3);
    cake.lean = 0.04 * Math.sin(t * 3);
  } else if (t < cue('round2')) {
    // ---------------------------------------------------------------- he is out: the blast, then gasping
    const a = since(t, 'out');
    const blast = 1 - ramp(a, 0, 0.5);
    H.puff = 0;
    H.face = a < 0.6 ? FACES.gasp : (a < 3 ? lerpFace(FACES.gasp, FACES.pant, ramp(a, 0.6, 1.2)) : FACES.annoyed);
    H.flush = lerp(1, 0.15, ramp(a, 0.4, 4));
    H.headDY = -10 * blast;
    H.hat = [1, -0.5 * blast, 40 * Math.max(0, Math.sin(Math.min(a, 0.6) / 0.6 * Math.PI))];
    H.shake = a < 2.5 ? 0.25 * (1 - a / 2.5) : 0;
    // squinting at Pip when her nose is found out
    if (t >= cue('nose2') - 0.2 && t < cue('you') - 0.1) H.face = Object.assign({}, FACES.suspicious || FACES.annoyed, { lookX: 0.9 });
    // "And you? Breathe." he looks at us and breathes, big
    if (t >= cue('you') - 0.1) { const br = 0.5 + 0.5 * Math.sin((t - cue('you')) * 3.2); H.face = lerpFace(FACES.calm, FACES.gasp, 0.35 * br); H.face = Object.assign({}, H.face, { lookX: 0, lookY: 0 }); H.dy = -4 * br; }
    cake.lit = 1 - ramp(a, 0.05, 0.35);
    cake.lean = 1.1 * (1 - ramp(a, 0.3, 0.8)) * ramp(a, 0, 0.08);
    cake.out = a - 0.25;
    P.puff = 0.8; P.face = Object.assign({}, FACES.smug, { lookX: -0.7 });
    // her nose: it flares (the cheat)
    P.nose = env2(t, cue('nose2') - 0.75, cue('you'), 0.15);
  } else if (t < cue('belly')) {
    // ---------------------------------------------------------------- round two: the trick, the whistle
    const a = since(t, 'round2'), st = since(t, 'whistleT');
    cake.lit = 0;
    H.goggles = ramp(a, 0.2, 0.5);
    const panting = t >= cue('pant0') && t < cue('whistleT');
    if (panting) { H.face = FACES.pant; H.dy = -6 * Math.abs(Math.sin(t * 13)); H.shake = 0.12; H.flush = 0.3; }
    else if (t >= cue('whistleT')) { H.face = st < 1.4 ? Object.assign({}, FACES.startled, { lookX: 0.8 }) : Object.assign({}, FACES.annoyed, { lookX: 0.8 }); H.puff = 0; }
    else H.face = Object.assign({}, FACES.proud, { lookX: 0.2 });
    P.puff = 0; P.whistleBlow = env2(t, cue('whistleT') - 0.25, cue('whistleT') + 0.9, 0.18);
    P.face = P.whistleBlow > 0.3 ? Object.assign({}, FACES.annoyed, { lookX: -0.8, mouth: 'o', mouthOpen: 0.5 }) : Object.assign({}, FACES.deadpan, { lookX: -0.8 });
    P.R = P.whistleBlow > 0 ? [lerp(70, 20, P.whistleBlow), lerp(-60, -240, P.whistleBlow)] : P.R;
  } else if (t < cue('best')) {
    // ---------------------------------------------------------------- the slow way: eyes shut, the cloth, the kicks
    const a = since(t, 'belly');
    cake.lit = 0;
    H.goggles = 0;
    const tb = since(t, 'bellyIn');
    const bel = env2(t, cue('bellyIn') - 0.6, cue('sixty') - 0.4, 0.4);
    if (bel > 0) { H.L = [lerp(-70, -20, bel), lerp(-60, -20, bel)]; H.dy = -6 * Math.max(0, Math.sin(Math.max(0, tb) * 1.6)) * bel; }
    const holding = t >= cue('sixty') - 0.4;
    if (holding) {
      const k = clamp(inv(cue('sixty'), cue('best'), t));
      H.puff = 0.7; H.face = Object.assign({}, FACES.calmK); H.flush = 0.15 + 0.6 * k;
      const kick = cue('kicks', []).reduce((m, x) => Math.max(m, t >= x ? Math.exp(-(t - x) * 7) : 0), 0);
      H.dy = -10 * kick; H.headDY = -6 * kick; H.kick = kick;
      if (t >= cue('ninety')) H.face = lerpFace(FACES.calmK, FACES.strain, clamp((t - cue('ninety')) / 2) * 0.8 + 0.2 * kick);
      H.cloth = ramp(t, cue('splat') - 0.08, cue('splat') + 0.06, E.outBack);
      H.wob = 0.4 * kick;
    } else H.face = FACES.calmK;
    P.puff = 0; P.face = Object.assign({}, FACES.deadpan, { lookX: -0.7 });
    P.stopwatch = env2(t, cue('sixty') - 0.4, cue('clothUp') - 0.2, 0.25);
    if (P.stopwatch > 0) P.R = [lerp(70, 50, P.stopwatch), lerp(-60, -220, P.stopwatch)];
    if (t >= cue('ninety') - 0.3 && t < cue('best')) { const sw2 = env2(t, cue('ninety') - 0.3, cue('best') - 0.3, 0.3); P.stopwatch = sw2; P.R = [lerp(70, 50, sw2), lerp(-60, -220, sw2)]; P.face = Object.assign({}, FACES.worriedK, { lookX: -0.8 }); }
    const up = env2(t, cue('clothUp'), cue('splat') + 0.3, 0.25);
    if (up > 0) { P.face = Object.assign({}, FACES.glee, { lookX: -0.8 }); P.L = [lerp(-70, -150, up), lerp(-60, -260, up)]; P.clothUp = up; }
  } else {
    // ---------------------------------------------------------------- his best, the cake; then dusk and the candles
    const a = since(t, 'best');
    H.puff = 0; H.cloth = t < cue('best') + 0.4 ? 1 - ramp(a, 0, 0.4) : 0;
    H.face = a < 0.5 ? FACES.gasp : FACES.proud;
    H.flush = lerp(0.75, 0, ramp(a, 0.3, 3));
    H.up = env2(t, cue('best') + 0.4, cue('cake') - 0.2, 0.3);
    if (t >= cue('cake') - 0.1 && t < cue('human')) H.face = Object.assign({}, FACES.annoyed, { lookX: 0.8 });
    P.eat = t >= cue('best') - 1 && t < cue('human') + 2 ? 1 : 0;
    P.face = P.eat ? Object.assign({}, FACES.chew, { mouthOpen: 0.25 + 0.2 * Math.abs(Math.sin(t * 9)) }) : FACES.calm;
    cake.lit = 0; cake.slice = P.eat || t > cue('cake') ? 1 : 0;
    // act 3 at home (dusk): calm, breathing; the count; Pip relights her candles one by one; the final blow
    if (t >= cue('land') - 0.5) {
      H.face = FACES.calm; P.face = Object.assign({}, FACES.soft, { lookX: -0.4 });
      const br = Math.sin((t - cue('land')) * 2 * Math.PI / 4.2);
      H.dy = -3 * br; P.dy = -2 * Math.sin((t - cue('land')) * 2 * Math.PI / 3.2);
      const cnt = env2(t, cue('count') + 0.2, cue('counted') + 0.6, 0.5);   // the count: a hand on his belly, like the slow way
      if (cnt > 0) { H.L = [lerp(-70, -20, cnt), lerp(-60, -20, cnt)]; H.dy = -3 * br - 5 * cnt * Math.max(0, br); H.face = Object.assign({}, FACES.calmK); }
      const L = cue('lights', []);
      cake.litEach = [...Array(7)].map((_, i) => (L[i] !== undefined ? ramp(t, L[i], L[i] + 0.25) : 0));
      cake.lit = 1;
      // Pip reaches to the cake with a long match while she lights them
      const lighting = L.length ? env2(t, L[0] - 0.8, L[6] + 0.6, 0.4) : 0;
      if (lighting > 0) { P.L = [lerp(-70, -260, lighting), lerp(-60, -150, lighting)]; P.matchK = lighting; }
      if (t >= cue('counted') - 0.3) H.face = Object.assign({}, FACES.soft, { lookX: 0.6 });
      if (t >= cue('turn')) { P.puff = ramp(t, cue('pipBreath') - 0.3, cue('pipBreath') + 0.3); P.face = Object.assign({}, FACES.hold, { lookX: -0.2 }); }
      if (t >= cue('button') - 0.2) H.face = FACES.laugh;
      if (t >= cue('blow') - 0.15) {
        const b = since(t, 'blow');
        P.puff = 0; P.face = b < 1.4 ? FACES.blow : FACES.glee; P.lean = -0.08 * env2(b, 0, 1.4, 0.2);
        cake.lean = -1.0 * env2(b, 0, 0.9, 0.15);
        cake.lit = 1 - ramp(b, 0.15, 0.6); cake.out = b - 0.4;
        H.face = FACES.laugh;
      }
    }
  }
  return { dusk, hero: H, pip: P, cake };
}
