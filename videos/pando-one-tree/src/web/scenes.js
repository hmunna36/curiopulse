// This Whole Forest Is ONE Tree 🌳 Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the
// shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
// THE CURIOUS KIND (story.md §6): the hero goes there. He hugs one white aspen in Pando and the whole forest turns out to be
// that tree: the camera rises to the whole clone (1 TREE), the ground opens on one root network, a trunk sprouts, the
// count races to 47,000, a scanner reads MATCH, every trunk opens its eyes at him, the whole clone turns gold at once,
// the forest outweighs forty blue whales on a giant balance, and he tries to hug all of it.
// The running device: the trunks' eyes (aspen bark has dark eye-shaped scars): one peeks at him in the hook, every one
// opens and blushes at "them ALL", and they all give him a flat look when his arms stretch (back to closed for the loop).
'use strict';

const cu = () => TLd.cues;
const r2 = (t, a, b, e = E.inOutCubic) => ramp(t, a, b, e);

// ---------------------------------------------------------------- the light of each place
const L_FOREST = { ...LIGHTS.day, pool: 0.26, halo: 0.08 };
const L_CUT = { ...LIGHTS.day, pool: 0.18, halo: 0.04 };
const L_LAND = { ...LIGHTS.day, pool: 0.1, halo: 0, rimAmt: 0.5 };
const L_FALL = flipLight({ ...LIGHTS.sunset, pool: 0.16, halo: 0.04 });
const L_BAL = { ...LIGHTS.day, pool: 0.16, halo: 0.04 };
setLights({
  hook: L_FOREST, answer: L_FOREST, roots: L_CUT, sprout: L_CUT, dna: L_FOREST, hugone: L_FOREST, all: L_FOREST,
  rise: L_LAND, count: L_LAND, valley: L_FALL, flip: L_FALL, gold: L_FALL, weigh: L_BAL, whales: L_BAL, bark: L_BAL,
  button: L_FOREST, loop: L_FOREST, cover: L_FOREST,
});

// ---------------------------------------------------------------- him
const HERO = { x: 568, y: PD.gy };
// the hug: elbows and wrists round the trunk he hugs (world), as an arm wraps round something in front of him
const HUG = { eL: [452, 1292], wL: [536, 1262], eR: [688, 1296], wR: [598, 1280] };
const HF = {
  bliss: Object.assign({}, FACES.grin, { blink: 1, mouthOpen: 0.22, browY: 0.35, browTilt: -0.15 }),
  squeeze: Object.assign({}, FACES.grin, { blink: 1, mouthOpen: 0.5, browY: 0.6, browTilt: -0.25, squeeze: 0.6 }),
  up: Object.assign({}, FACES.calm, { lookX: 0.3, lookY: -1, browY: 0.7, mouth: 'flat', mouthOpen: 0.15 }),
  down: Object.assign({}, FACES.calm, { lookX: 0.2, lookY: 1, browY: 0.5, mouth: 'o', mouthOpen: 0.3 }),
  downShock: Object.assign({}, FACES.startled, { lookX: 0.1, lookY: 1, mouth: 'o', mouthOpen: 0.7 }),
  startledL: Object.assign({}, FACES.startled, { lookX: -1, lookY: 0.1 }),
  huh: Object.assign({}, FACES.confused, { lookX: -0.8, lookY: -0.6, browY: 0.9 }),
  proud: Object.assign({}, FACES.grin, { lookX: 0.9, lookY: -0.2, browY: 0.7 }),
  wow: Object.assign({}, FACES.startled, { lookX: 0.15, lookY: -1, mouth: 'o', mouthOpen: 0.85, browY: 1.3 }),
  strain: Object.assign({}, FACES.nervous, { lookX: 0, lookY: -0.2, squeeze: 0.5, browY: 1.1 }),
  sheep: Object.assign({}, FACES.grin, { lookX: -0.6, lookY: 0.3, browY: 0.9, browTilt: 0.8, mouthOpen: 0.5 }),
  look: Object.assign({}, FACES.calm, { lookX: 1, lookY: -0.4, browY: 0.6, mouth: 'flat', mouthOpen: 0 }),
  lookUpL: Object.assign({}, FACES.startled, { lookX: -0.6, lookY: -1, mouth: 'o', mouthOpen: 0.5, browY: 1.2 }),
};
// A = {x, y, s, hug 0..1, face, headRot, headDX, headDY, pose, armL/armR {e, w} (local), legL/legR, trunk (options: draw
//      the hugged trunk in his layer, in front of him), post(lc, r, st2)}
function pdHero(cam, t, A) {
  const st = { x: A.x, y: A.y, s: A.s || 1, face: A.face, headRot: A.headRot || 0, headDX: A.headDX || 0, headDY: A.headDY || 0, blink: 0 };
  let pose = JSON.parse(JSON.stringify(A.pose || POSES.stand));
  const loc = (p) => ikLocal(st, p[0], p[1]);
  if (A.hug > 0) {
    const restL = { e: [-96, -300], w: [-104, -210] }, restR = { e: [96, -300], w: [104, -210] };
    const hl = armMix(restL, { e: loc(HUG.eL), w: loc(HUG.wL) }, A.hug), hr = armMix(restR, { e: loc(HUG.eR), w: loc(HUG.wR) }, A.hug);
    pose = armAt(armAt(pose, 'L', hl.e, hl.w), 'R', hr.e, hr.w);
  }
  if (A.armL) pose = armAt(pose, 'L', A.armL.e, A.armL.w);
  if (A.armR) pose = armAt(pose, 'R', A.armR.e, A.armR.w);
  if (A.legL) pose.legL = A.legL;
  if (A.legR) pose.legR = A.legR;
  if (A.hand) pose.hand = A.hand;
  if (A.handL) pose.handL = A.handL;
  if (A.handR) pose.handR = A.handR;
  st.pose = pose;
  const r = charLayer(cam, st, t, {
    pal: PAL,
    post: (lc, r, st2) => {
      if (A.trunk) {
        pdTrunk(lc, PDG.hero[PD_HUG], PD.gy, 1, t, A.trunk);
        // his forearms and hands wrap round the FRONT of the trunk, and his cheek is on it: drawn again over it
        actor(() => {
          lc.save(); lc.translate(st2.x, st2.y); lc.scale(st2.s, st2.s);
          for (const k of ['L', 'R']) {
            const el = r['el' + k], wr = r['wr' + k], d = r['armDir' + k];
            capsuleShaded(lc, el, wr, 38, PAL.coat, PAL.coatSh, PAL.coatHi, PAL);
            line(lc, wr[0] - d[0] * 6, wr[1] - d[1] * 6, wr[0] + d[0] * 2, wr[1] + d[1] * 2, 42, PAL.coatSh);
            drawHand(lc, wr, d, 'open', PAL, k === 'L' ? -1 : 1, t);
          }
          drawHead(lc, r, st2.face, st2, PAL, t);
          lc.restore();
        });
      }
      if (A.post) A.post(lc, r, st2);
    },
  });
  // cut him out of the glow layer: no glint shines through him
  gctx.save(); gctx.setTransform(1, 0, 0, 1, 0, 0); gctx.globalCompositeOperation = 'destination-out';
  gctx.drawImage(layerC, 0, 0, W / 2, H / 2); gctx.restore();
  return r;
}
const heroHeadW = (A) => [A.x + (A.headDX || 0), A.y - 470 * (A.s || 1) + (A.headDY || 0)];
const HUGA = (o = {}) => Object.assign({ x: HERO.x, y: HERO.y, s: 1, hug: 1, face: HF.bliss, headRot: 0.2, headDX: -84, headDY: 8 }, o);

// ---------------------------------------------------------------- the hug in the forest (the hook, the loop, hugone, all)
const TIGHT = [548, 1150, 2.6];
function hugForest(cam, t, o = {}) {
  const A = HUGA({ face: o.face || HF.bliss, headDY: 8 + (o.squeeze || 0) * 6, headRot: 0.2 + (o.squeeze || 0) * 0.05,
    trunk: { top: -3000, eyes: o.trunkEyes || 0, look: o.trunkLook || [-0.7, 0.75], mood: o.trunkMood || 'peek', blush: o.blush || 0 } });
  const res = pdForest(cam, t, {
    dy: o.dy || 0, hugTrunkInLayer: true, season: o.season || 0, eyes: o.eyes || 0, eyesFar: o.eyesFar || 0, blush: o.blush || 0,
    mood: o.mood, lookFor: o.lookFor, hero: (c2) => pdHero(c2, t, A),
  });
  return { A, res };
}
// the look of an eye at (x, y) toward his head
const lookAtHim = (x, y) => { const h = heroHeadW(HUGA()), dx = h[0] - x, dy = h[1] - y, d = Math.hypot(dx, dy) || 1; return [dx / d, clamp(dy / d * 1.3, -1, 1)]; };

SC.hook = (lt, t, shot) => {
  const c = cu();
  const cam = camKeys(lt, [[0, ...TIGHT], [shot.end - shot.start, TIGHT[0] - 6, TIGHT[1] - 10, TIGHT[2] + 0.14]], E.inOutSine);
  // beat 1 of the running device: the bark eye above him peeks open, glances down at him, and shuts again
  const peek = popK(t, c.peek, c.peek_end, 0.12, 0.16);
  hugForest(cam, t, { trunkEyes: peek, trunkLook: [lerp(0.2, -0.75, r2(t, c.peek + 0.1, c.peek + 0.35)), 0.8] });
  return {};
};
SC.loop = (lt, t, shot) => {
  const D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, TIGHT[0] + 10, TIGHT[1] + 14, TIGHT[2] - 0.12], [D - 0.04, ...TIGHT]], E.outCubic);
  hugForest(cam, t, {});
  return {};
};
SC.hugone = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 395, 1130, 2.25], [D, 400, 1120, 2.36]], E.inOutSine);
  const sq = Math.sin(Math.PI * clamp(inv(c.squeeze - 0.05, c.squeeze + 0.5, t)));
  const r = hugForest(cam, t, { dy: 250, squeeze: sq, face: sq > 0.3 ? HF.squeeze : HF.bliss, trunkEyes: 0 });
  const h = toScreen(cam, ...heroHeadW(r.A));
  heartIcon(h[0] + 130, h[1] - 170 - 60 * r2(t, c.squeeze, c.squeeze + 0.6), 1.4, popK(t, c.squeeze + 0.05, shot.end + 1, 0.1, 0.1));
  return {};
};
SC.all = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 540, 1180, 0.66], [D, 530, 1190, 0.7]], E.inOutSine);
  // beat 2: every trunk in the forest opens its eyes at him, at once, and blushes
  const open = snapRamp(t, c.eyes, c.eyes + 0.16, { pre: 0.06, ant: 0.1 });
  const blush = r2(t, c.eyes + 0.1, c.eyes + 0.4);
  hugForest(cam, t, { dy: -260, eyes: open, eyesFar: open, blush, mood: 'love', lookFor: lookAtHim, trunkEyes: open, trunkLook: [-0.8, 0.7], trunkMood: 'love' });
  // hearts over the canopy
  for (let i = 0; i < 9; i++) {
    const x = 120 + i * 105 + 30 * Math.sin(i * 2.3), y = 380 + 160 * hash(i * 1.7) - 90 * r2(t, c.hearts + i * 0.03, c.hearts + 0.9);
    heartIcon(x, y, 0.9 + 0.4 * hash(i * 3.1), popK(t, c.hearts + i * 0.035, shot.end + 1, 0.1, 0.1));
  }
  return {};
};

// ---------------------------------------------------------------- the clone from the air
const PANDO_EDGE = [540, 1336];
SC.rise = (lt, t, shot) => {
  const c = cu();
  const cam = camKeys(t, [[shot.start, PANDO_EDGE[0], PANDO_EDGE[1] - 20, 3.0], [c.one - 0.05, 540, 1075, 0.98], [shot.end, 540, 1070, 0.96]], E.inOutCubic);
  pdLand(cam, t, { outline: r2(t, c.lasso, c.lasso + 0.45, E.inOutSine), hero: { x: PANDO_EDGE[0], y: PANDO_EDGE[1], s: 0.12, k: 1 } });
  pdTag('1 TREE', 540, 600, popK(t, c.tag1, shot.end + 1), '#FFE36A', 120);
  return {};
};
// the count from above: numbers pop on crowns, the counter races to 47,000
let PD_ORDER = null;
SC.count = (lt, t, shot) => {
  const c = cu();
  const wide = t >= c.cut_thou;
  const cam = wide ? camKeys(t, [[c.cut_thou, 540, 1110, 1.02], [shot.end, 540, 1105, 0.98]], E.inOutSine)
    : camKeys(t, [[shot.start, 530, 1150, 2.9], [c.cut_thou, 560, 1140, 3.1]], E.inOutSine);
  pdLand(cam, t, { dy: -160, outline: wide ? 1 : 0, lod: !wide ? false : true });
  if (!PD_ORDER) {   // crowns spread apart (none closer than 62 units to one already numbered), nearest the middle first
    const all = PDL.crowns.filter((q) => q.p === 'pando').sort((u, v) => Math.hypot(u.x - 560, u.y - 1140) - Math.hypot(v.x - 560, v.y - 1140));
    PD_ORDER = [];
    for (const q of all) if (PD_ORDER.every((o) => Math.hypot(o.x - q.x, (o.y - q.y) * 1.4) > 62)) PD_ORDER.push(q);
  }
  if (!wide) {
    const n = Math.floor(70 * Math.pow(r2(t, c.about, c.cut_thou, (x) => x), 1.6));
    screenSpace();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    const tN = (i) => c.about + (c.cut_thou - c.about) * Math.pow((i + 1) / 70, 1 / 1.6);   // when crown i got its number
    for (let i = 0; i < n && i < PD_ORDER.length; i++) {
      const q = PD_ORDER[i], s = toScreen(cam, q.x, q.y), pk = E.outBack(clamp((t - tN(i)) / 0.12), 2.2);
      ctx.font = `900 ${Math.round(46 * pk)}px Montserrat`;
      ctx.lineWidth = 9; ctx.strokeStyle = '#0B1426'; ctx.strokeText(String(i + 1), s[0], s[1]);
      ctx.fillStyle = '#FFFFFF'; ctx.fillText(String(i + 1), s[0], s[1]);
    }
  }
  const v = wide ? 47000 : 47000 * Math.pow(r2(t, c.about + 0.05, c.thousand_end, (x) => x), 3);
  pdCounter(v, 'TRUNKS', 540, 560, 1, '#FFE36A', wide ? 170 : 130, wide ? '~' : '');
  return {};
};
SC.valley = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 540, 1080, 0.9], [D, 540, 1090, 0.98]], E.inOutSine);
  pdLand(cam, t, { season: r2(t, c.season, c.season + 0.8), turn: { a: c.p1, b: c.p2 }, outline: r2(t, c.outline, c.outline + 0.5, E.inOutSine), outlineCol: '#FFFFFF' });
  pdTag('PANDO', 540, 600, popK(t, c.outline + 0.35, shot.end + 1), '#FFFFFF', 100);
  return {};
};
SC.flip = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 540, 1130, 1.22], [D, 540, 1145, 1.46]], E.inOutSine);
  const gold = (cr) => clamp((t - (c.flipgold + 0.05 * clamp((cr.x - 140) / 800))) / 0.06);
  pdLand(cam, t, { season: 1, turn: { a: c.p1, b: c.p2 }, pandoGold: gold, outline: 1 - r2(t, c.flipgold - 0.1, c.flipgold, (x) => x), outlineCol: '#FFFFFF' });
  // a burst of sparkle over the clone on the flip
  const k = popK(t, c.flipgold + 0.02, c.flipgold + 0.7, 0.05, 0.4);
  if (k > 0) {
    applyCam(cam);
    for (let i = 0; i < 40; i++) {
      const x = 540 + (hash(i * 1.3) - 0.5) * 760, y = 1150 + (hash(i * 2.7) - 0.5) * 300 - 120 * r2(t, c.flipgold, c.flipgold + 0.7);
      circle(ctx, x, y, 4 + 4 * hash(i), '#FFF6C0'); softDot(gctx, x, y, 26, '#FFE36A', k);
    }
  }
  return {};
};

// ---------------------------------------------------------------- the forest floor: the answer, the cut, the sprout, the scan
SC.answer = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 660, 1290, 1.5], [D, 670, 1300, 1.56]], E.inOutSine);
  const lookUp = r2(t, c.real - 0.1, c.real + 0.2), lookDown = r2(t, c.look, c.look + 0.22);
  let face = lerpFace(HF.huh, HF.up, lookUp);
  face = lerpFace(face, HF.down, lookDown);
  pdForest(cam, t, {
    dy: 220,
    hero: (c2) => pdHero(c2, t, { x: 720, y: PD.gy, s: 1, face, headRot: -0.05 * lookUp + 0.08 * lookDown, headDY: 10 * lookDown,
      armL: { e: [-120, -330], w: [-170, -300] } }),
  });
  return {};
};
function cutState(t) {
  const c = cu();
  return { cut: r2(t, c.open, c.open + 0.35, E.outCubic), glowT: t - c.glow };
}
SC.roots = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 700, 1330, 1.45], [c.open - shot.start, 690, 1360, 1.4], [c.open - shot.start + 0.55, 650, 1610, 0.84], [D, 640, 1640, 0.8]], E.inOutCubic);
  const lift = snapRamp(t, c.lift, c.lift + 0.22) * (1 - r2(t, shot.end - 0.3, shot.end));
  const shock = r2(t, c.open, c.open + 0.15);
  pdForest(cam, t, Object.assign({
    hero: (c2) => pdHero(c2, t, { x: 720, y: PD.gy, s: 1, face: lerpFace(HF.down, HF.downShock, shock), headDY: 12, headRot: 0.06,
      legL: { a: 0.07 + 0.5 * lift, b: -0.9 * lift }, armL: { e: [-110, -320], w: [-150, -250 - 40 * lift] }, armR: { e: [110, -320], w: [150, -250 - 40 * lift] } }),
  }, cutState(t)));
  return {};
};
SC.sprout = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 920, 1520, 1.22], [D, 930, 1500, 1.3]], E.inOutSine);   // his face clear of the watermark
  const SX = 860;
  const rise = r2(t, shot.start, c.pop, E.inQuad);              // the sucker climbs from the root
  // a sapling with leaves pops up first (you can see it is a sprout), then it shoots up into a full trunk
  const sap = E.outBack(r2(t, c.pop, c.pop + 0.35, (x) => x), 1.6), shoot = snapRamp(t, c.pop + 0.36, c.grown, { over: 1.2 });
  const grow = (sap * 420 + Math.max(0, shoot) * 3000) / 3420;
  const jump = r2(t, c.pop, c.pop + 0.12);
  pdForest(cam, t, Object.assign({}, cutState(t), {
    sprout: { x: SX, k: rise },
    after: () => {
      if (grow > 0.001) {
        const gk = Math.max(0, grow), top = PD.gy - 3420 * gk - 10, ww = lerp(0.18, 0.7, Math.min(1, Math.max(0, shoot)));
        // a thin green rim while it shoots up, so the eye finds the new one
        const gl = 1 - r2(t, c.grown, c.grown + 0.5);
        if (gl > 0.01) for (const sd of [-1, 1]) line(gctx, SX + sd * 52 * ww, top + 60, SX + sd * 52 * ww, PD.gy - 20, 10, rgba('#9CFF7A', 0.7 * gl));
        pdTrunk(ctx, { x: SX, w: ww, seed: 4545, eye: 0.3, lean: 0 }, PD.gy, 1, t, { top, bark: '#E6F2D4' });
        // its young crown of round leaves rides up the trunk and out of the frame
        if (gk < 1.05) pdCrown(ctx, SX, top - 30, 70 + 170 * Math.min(1, Math.max(0, shoot)), 4546, t, 0, { n: 14, leaves: 10 });
        // speed lines beside it while it grows
        if (gk < 0.98 && shoot > 0) for (let i = 0; i < 6; i++) { const y = top + 200 + i * 160 + ((t * 2400) % 160); if (y + 90 < PD.gy - 40) line(ctx, SX + (i % 2 ? 90 : -90), y, SX + (i % 2 ? 90 : -90), y + 90, 6, rgba('#FFFFFF', 0.8)); }
      }
      // the soil bursts up where it breaks through
      const bk = r2(t, c.pop, c.pop + 0.5, E.outCubic);
      if (t > c.pop && bk < 1) for (let i = 0; i < 14; i++) {
        const a = -Math.PI * (0.1 + 0.8 * hash(i * 2.1)), d = 220 * bk * (0.5 + hash(i * 3.3));
        ellipse(ctx, SX + Math.cos(a) * d, PD.gy - 10 + Math.sin(a) * d + 300 * bk * bk, 12 + 8 * hash(i), 9, PD_PAL.soil1);
      }
    },
    hero: (c2) => pdHero(c2, t, { x: 1040, y: PD.gy, s: 1, face: lerpFace(HF.look, HF.startledL, jump), headRot: -0.08 * jump, headDX: -6 * jump,
      pose: lerpPose(POSES.stand, POSES.flinch, 0.6 * jump) }),
  }));
  // the SPROUT tag slapped on the new trunk
  const s = toScreen(cam, SX, 1250);
  const tk = snapRamp(t, c.tag2, c.tag2 + 0.14, { pre: 0.04, ant: 0.05 });
  if (tk > 0) pdTag('SPROUT', s[0], s[1], tk, '#7DF09A', 62, -0.12);
  return {};
};
let PD_SCAN = [900, 1180];
SC.dna = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 790, 1240, 1.5], [D, 780, 1235, 1.58]], E.inOutSine);
  const aim = r2(t, c.same2 - 0.25, c.same2 + 0.05);        // the scanner swings from the right trunk to the left one
  const rootK = r2(t, c.scan1, c.scan1 + 0.45, E.inOutSine), match = snapRamp(t, c.match, c.match + 0.16);
  pdForest(cam, t, {
    after: () => {
      // the root under both trunks, lit, from the right trunk's base to the left one's
      const pts = [];
      for (let i = 0; i <= 30; i++) { const u = i / 30; pts.push([lerp(930, 570, u), PD.gy + 24 + 34 * Math.sin(Math.PI * u)]); }
      const m = Math.max(2, Math.floor(30 * rootK));
      if (rootK > 0.01) {
        poly(ctx, pts.slice(0, m + 1), 26, PD_PAL.rootSh); poly(ctx, pts.slice(0, m + 1), 16, PD_PAL.rootLit);
        poly(gctx, pts.slice(0, m + 1), 44, rgba(PD_PAL.rootGlow, 0.8));
      }
    },
    hero: (c2) => pdHero(c2, t, { x: 750, y: PD.gy, s: 1, face: lerpFace(HF.look, Object.assign({}, HF.look, { lookX: -1 }), aim),
      headRot: lerp(0.05, -0.05, aim), handR: aim < 0.5 ? 'point' : 'open', handL: aim < 0.5 ? 'open' : 'point',
      armR: aim < 0.5 ? { e: [80, -330], w: [150, -380] } : { e: [60, -300], w: [110, -240] },
      armL: aim < 0.5 ? { e: [-70, -300], w: [-100, -235] } : { e: [-90, -330], w: [-150, -385] },
      post: (lc, r, st2) => {   // the scanner in the pointing hand
        const k = aim < 0.5 ? 'R' : 'L', wr = r['wr' + k];
        PD_SCAN = [st2.x + wr[0] * st2.s, st2.y + wr[1] * st2.s];
        actor(() => {
          lc.save(); lc.translate(PD_SCAN[0], PD_SCAN[1] - 10);
          lc.fillStyle = '#2E3A4E'; rrect(lc, -26, -60, 52, 76, 10); lc.fill();
          lc.fillStyle = '#5BF08A'; rrect(lc, -18, -52, 36, 30, 6); lc.fill();
          lc.restore();
        });
      } }),
  });
  // the beam and the two readings
  applyCam(cam);
  const tgt = aim < 0.5 ? [940, 1180] : [560, 1180];
  const hand = [PD_SCAN[0], PD_SCAN[1] - 30];
  softDot(gctx, hand[0], hand[1] - 22, 40, '#5BF08A', 0.8);
  const beamA = 0.6 + 0.3 * Math.sin(t * 40);
  line(ctx, hand[0], hand[1] - 20, tgt[0], tgt[1], 5, rgba('#7DF09A', beamA)); line(gctx, hand[0], hand[1] - 20, tgt[0], tgt[1], 16, rgba('#5BF08A', 0.6));
  for (const [x, i] of [[940, 0], [560, 1]]) {
    const sx = toScreen(cam, x, 1100);
    pdHelix(sx[0], sx[1] - 20, 0.9, t, popK(t, c.same2 + i * 0.12, shot.end + 1));
    pdTag('MATCH', sx[0], sx[1] + 90, match, '#7DF09A', 56, i ? 0.06 : -0.06);
  }
  return {};
};
// a little double helix (screen space)
function pdHelix(x, y, s, t, k) {
  if (k <= 0.01) return;
  screenSpace();
  const h = 150 * s * E.outBack(clamp(k));
  for (let i = 0; i <= 12; i++) {
    const u = i / 12, yy = y - h / 2 + u * h, a = u * Math.PI * 2 + t * 3;
    const x1 = x + Math.sin(a) * 34 * s, x2 = x - Math.sin(a) * 34 * s;
    line(ctx, x1, yy, x2, yy, 4, i % 2 ? '#FFD447' : '#7FE9FF');
    circle(ctx, x1, yy, 7 * s, '#FF86A6'); circle(ctx, x2, yy, 7 * s, '#8FB8FF');
  }
}

// ---------------------------------------------------------------- autumn on the floor: him under the gold
SC.gold = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 640, 1100, 2.0], [D, 650, 1090, 2.1]], E.inOutSine);
  pdForest(cam, t, {
    dy: 280, season: 1,
    hero: (c2) => pdHero(c2, t, { x: 520, y: PD.gy, s: 1, face: HF.wow, headRot: -0.12, headDY: 6,
      armL: { e: [-120, -330], w: [-170, -420] }, armR: { e: [120, -330], w: [175, -430] }, hand: 'spread' }),
  });
  // gold leaves raining
  screenSpace();
  for (let i = 0; i < 46; i++) {
    const ph = hash(i * 1.9), x = (hash(i * 3.7) * 1240 - 80) + 60 * Math.sin(t * 3 + i), y = ((t - c.rain + ph * 2.2) * 520) % 2100 - 120;
    if (t < c.rain - ph * 2.2 + 0) continue;
    ellipse(ctx, x, y, 22, 14 * Math.abs(Math.sin(t * 6 + i)) + 4, PD_PAL.leafY[i % 3], t * 2 + i);
  }
  return {};
};

// ---------------------------------------------------------------- the balance
function balTh(t) {
  const c = cu();
  const slam = snapRamp(t, c.slam, c.slam + 0.16, { pre: 0.08, ant: 0.25, over: 1.3 });
  const landed = clamp((whalesN(t) - 3) / 40);
  return -0.38 * slam * (1 - E.inOutSine(landed)) + 0.012 * Math.sin(t * 9) * (1 - slam);
}
function whalesN(t) { const c = cu(); return t < c.drop0 ? 0 : 44 * r2(t, c.drop0, c.level, (x) => x); }
SC.weigh = (lt, t, shot) => {
  const c = cu();
  const close = t >= c.cut_tonnes;
  const cam = close ? camKeys(t, [[c.cut_tonnes, 300, 1180, 1.3], [shot.end, 300, 1220, 1.36]], E.inOutSine)
    : camKeys(t, [[shot.start, 540, 1160, 0.8], [c.cut_tonnes, 540, 1150, 0.84]], E.inOutSine);
  const flinch = r2(t, c.slam, c.slam + 0.12);
  pdBalanceWorld(cam, t, { dy: 220, th: balTh(t), forestK: 1, whales: 0,
    hero: { x: 800, y: 1660, s: 0.55, face: lerpFace(HF.lookUpL, Object.assign({}, FACES.startled, { lookX: -0.8, lookY: -0.6 }), flinch), pose: lerpPose(POSES.stand, POSES.flinch, flinch) } });
  // dust from the slam
  if (t > c.slam) {
    const ends = [PDB.px - PDB.arm * Math.cos(balTh(t)), PDB.py - PDB.arm * Math.sin(balTh(t)) + PDB.chain];
    applyCam(cam);
    for (let i = 0; i < 16; i++) {
      const a = hash(i * 1.3) * Math.PI, d = 220 * r2(t, c.slam, c.slam + 0.6);
      ellipse(ctx, ends[0] + Math.cos(a) * d * 1.4 * (i % 2 ? 1 : -1), ends[1] + 60 - Math.sin(a) * d * 0.4, 30, 18, rgba('#E8D9C0', 0.9 * (1 - r2(t, c.slam + 0.2, c.slam + 0.9))));
    }
  }
  pdTag('~6,000 TONNES', 540, 520, popK(t, c.slam + 0.04, shot.end + 1), '#FF6A5E', 96);
  return {};
};
SC.whales = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 880, 1000, 1.16], [D, 890, 990, 1.22]], E.inOutSine);
  const n = whalesN(t);
  pdBalanceWorld(cam, t, { th: balTh(t), forestK: 1, whales: n,
    hero: { x: 800, y: 1660, s: 0.55, face: Object.assign({}, HF.lookUpL, { lookX: 0.6 }), headRot: 0.08 } });
  pdCounter(Math.min(40, Math.floor(Math.max(0, n - 3))), 'BLUE WHALES', 540, 520, 1, '#8FB8FF', 130);
  return {};
};
SC.bark = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const W39 = pdWhalePos(PDB.px + PDB.arm, PDB.py + PDB.chain, 8, 1);
  const cam = camKeys(lt, [[0, W39[0] + 8, W39[1] - 8, 6.4], [D, W39[0] + 6, W39[1] - 10, 6.9]], E.inOutSine);
  const bk = snapRamp(t, c.barkon, c.barkon + 0.22, { pre: 0.04, ant: 0.05, over: 1.1 });
  const open = r2(t, c.barkon + 0.2, c.barkon + 0.32) * (1 - popK(t, c.blink, c.blink + 0.12, 0.04, 0.06));
  pdBalanceWorld(cam, t, { th: 0, forestK: 1, whales: 44, whaleO: { bark: clamp(bk), eyes: open, look: [-0.2, 0.1], mood: 'flat' } });
  return {};
};

// ---------------------------------------------------------------- the button: he tries to hug the whole forest
SC.button = (lt, t, shot) => {
  const c = cu();
  const close = t >= c.cut_arms;
  const cam = close ? camKeys(t, [[c.cut_arms, 760, 1110, 2.2], [shot.end, 760, 1100, 2.3]], E.inOutSine)
    : camKeys(t, [[shot.start, 760, 1230, 0.98], [c.cut_arms, 760, 1220, 1.02]], E.inOutSine);
  const stretch = r2(t, c.stretch, c.cut_arms + 0.6, E.outCubic) * (1 - snapRamp(t, c.twang, c.twang + 0.18, { over: 2.2 }));
  const strain = r2(t, c.stretch + 0.4, c.stretch + 0.8);
  const twang = r2(t, c.twang, c.twang + 0.12);
  let face = lerpFace(HF.proud, HF.strain, strain);
  face = lerpFace(face, HF.sheep, twang);
  const eyes = r2(t, c.side_eye - 0.3, c.side_eye - 0.1) * (1 - r2(t, shot.end - 0.25, shot.end - 0.05));
  pdForest(cam, t, {
    eyes, mood: 'flat', lookFor: (x, y) => { const dx = 750 - x, dy = 1100 - y, d = Math.hypot(dx, dy) || 1; return [dx / d, clamp(dy / d, -1, 1)]; },
    hero: (c2) => {
      const r = pdHero(c2, t, { x: 750, y: PD.gy, s: 1, face, headRot: 0.03 * Math.sin(t * 30) * strain * (1 - twang),
        pose: lerpPose(POSES.stand, POSES.zap, 0.3 * (1 - twang)),
        armL: armMix({ e: [-150, -365], w: [-200, -370] }, { e: [-100, -300], w: [-60, -420] }, twang),
        armR: armMix({ e: [150, -365], w: [200, -370] }, { e: [100, -300], w: [60, -420] }, twang) });
      pdNoodleArms(c2, t, stretch);
      return r;
    },
  });
  if (close && strain > 0.5 && twang < 0.5) { screenSpace(); const h = toScreen(cam, 750 + 60, PD.gy - 520); sweatDrop(ctx, h[0], h[1], 1.6, 1); }
  return {};
};
// his arms, stretched like noodles round trunk after trunk (k 0..1)
function pdNoodleArms(cam, t, k) {
  if (k <= 0.01) return;
  applyCam(cam);
  const paths = {
    L: [[700, 1188], [640, 1232], [600, 1246], [520, 1252], [430, 1258], [200, 1266], [-40, 1270], [-180, 1262]],
    R: [[800, 1188], [860, 1230], [900, 1246], [980, 1252], [1080, 1258], [1220, 1260], [1300, 1262], [1350, 1250]],
  };
  for (const side of ['L', 'R']) {
    const P = paths[side], L = polyLen(P) * k;
    // walk the path to length L
    const out = [P[0]]; let acc = 0;
    for (let i = 1; i < P.length; i++) {
      const seg = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
      if (acc + seg >= L) { const u = (L - acc) / seg; out.push([lerp(P[i - 1][0], P[i][0], u), lerp(P[i - 1][1], P[i][1], u)]); break; }
      out.push(P[i]); acc += seg;
    }
    const wob = (i) => 6 * Math.sin(t * 25 + i) * k;
    const pts = out.map((p, i) => [p[0], p[1] + wob(i)]);
    actor(() => {
      poly(ctx, pts, 40, PAL.coatSh); poly(ctx, pts, 32, PAL.coat);
      const e = pts[pts.length - 1], b = pts[Math.max(0, pts.length - 2)], d = [e[0] - b[0], e[1] - b[1]], dl = Math.hypot(...d) || 1;
      drawHand(ctx, e, [d[0] / dl, d[1] / dl], 'open', PAL, side === 'L' ? -1 : 1, t);
    });
  }
}

// ---------------------------------------------------------------- the cover: the hug, the claim
SC.cover = (lt, t, shot) => {
  const cam = { x: 600, y: 1120, zoom: 1.55, rot: 0 };
  hugForest(cam, 0.3, { eyes: 1, eyesFar: 1, blush: 0.6, mood: 'love', lookFor: lookAtHim, trunkEyes: 1, trunkLook: [-0.8, 0.7], trunkMood: 'love', dy: 120 });
  pdTag('ALL ONE TREE', 540, 470, 1, '#FFE36A', 140, -0.05);
  return { noCaptions: true };
};

function initScenes2() {
  initPando();
}
