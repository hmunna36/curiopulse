// The Tree That Wore SNAKESKIN (Then Became Coal) 🐍 Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds
// inside the shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
// THE CURIOUS KIND (story.md §6): the hero goes there. He leans on a trunk in a coal swamp 300 million years ago, the camera
// cranes up all 40 m of it and pulls back until it stands whole; he plucks a leaf off a young one (a fresh diamond); the swamp
// falls into the water and is buried and squashed into coal; he shovels it into a steam engine; in a coal mine a stump falls
// out of the ceiling onto his hard hat; and the last shot pushes into that stump's diamonds and lands on frame 0.
'use strict';

const cu = () => TLd.cues;
const r2 = (t, a, b, e = E.inOutCubic) => ramp(t, a, b, e);
const bumpAt = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the swamp: hazy sun high on the right through the canopy, warm rim from the right, greenish shadows, shafts in the haze
const L_SWAMP = { ...LIGHTS.day, key: [0.5, -0.64, 0.58], keyTint: [1.06, 1.04, 0.92], shadowTint: [0.72, 0.84, 0.86], shadowDeep: 1.25,
  rimFrom: [0.88, -0.42], rim: [1.0, 0.9, 0.6], rimAmt: 0.95, pool: 0.32, poolTint: [0.56, 0.66, 0.6], halo: 0.08, beams: 0.32, beamColor: [1.0, 0.93, 0.7] };
const L_CAB = { ...flipLight(LIGHTS.lanterns), key: [-0.28, -0.78, 0.56], rim: [1.0, 0.55, 0.18], rimAmt: 1.45, pool: 0.5 };   // the firebox on the left
const L_MINE = { ...LIGHTS.night, key: [0.1, -0.86, 0.5], keyTint: [1.06, 1.0, 0.9], rim: [1.0, 0.82, 0.5], rimAmt: 1.1, pool: 0.72, halo: 0.12, haloColor: [1.0, 0.8, 0.5] };
setLights({ hook: L_SWAMP, leaf: L_SWAMP, swamp: L_SWAMP, coal: { ...LIGHTS.diagram, keyTint: [1.04, 1.0, 0.94] }, trains: L_CAB, mine: L_MINE, button: L_MINE, loop: L_SWAMP, cover: L_SWAMP });

// ---------------------------------------------------------------- a camera between keys, its zoom eased in log space
// (a pull back from 2.5 to 0.11 then reads as one steady move); keys [t, x, y, zoom]
function camLog(t, keys, ease = E.inOutCubic) {
  let k = keys[0];
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1], b = keys[i];
    if (t >= b[0]) { k = b; continue; }
    if (t > a[0]) {
      const u = ease(inv(a[0], b[0], t)), z = Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), u));
      // x and y follow the zoom: the point that stays put on screen slides from a's to b's focus as the zoom changes
      const wz = (1 / z - 1 / a[3]) / ((1 / b[3] - 1 / a[3]) || 1e-9);
      const uu = Math.abs(1 / b[3] - 1 / a[3]) > 1e-6 ? clamp(wz) : u;
      k = [t, lerp(a[1], b[1], uu), lerp(a[2], b[2], uu), z];
    }
    break;
  }
  return { x: k[1], y: k[2], zoom: k[3], rot: 0 };
}

// ---------------------------------------------------------------- the hero
const HERO = { x: 520, y: ST.gy };
const HF = {
  squint: Object.assign({}, FACES.calm, { lookX: 1, lookY: 0.15, browY: -0.25, browTilt: -0.7, mouth: 'flat', mouthOpen: 0.04, eyeOpen: 0.72 }),
  flinch: Object.assign({}, FACES.startled, { lookX: -0.5, lookY: 0.1 }),
  up: Object.assign({}, FACES.startled, { lookX: 0.6, lookY: -1, mouth: 'o', mouthOpen: 0.7, browY: 1.3 }),
  approve: Object.assign({}, FACES.grin, { lookX: 0.7, lookY: -0.6, browY: 0.7, browTilt: -0.3, mouthOpen: 0.55 }),
  look: Object.assign({}, FACES.calm, { lookX: -1, lookY: 0.1, browY: 0.4, mouth: 'flat', mouthOpen: 0.1 }),
  oops: Object.assign({}, FACES.nervous, { lookX: -0.8, lookY: 0.3 }),
  sheepish: Object.assign({}, FACES.grin, { lookX: 0.9, lookY: 0.2, browY: 0.9, browTilt: 0.9, mouthOpen: 0.4 }),
  duck: Object.assign({}, FACES.shock, { lookX: 1, lookY: -0.6 }),
  dazed: Object.assign({}, FACES.dazed),
};
// A: {x, y, s, pose, face, headRot, headDX, headDY, armL / armR: {e, w} WORLD points, handL / handR, pal, post(lc, r, st),
//     pre(lc), soot, hat (0..1), lamp (0..1 its beam), noLegs}
function heroDraw(cam, t, A) {
  const st = { x: A.x, y: A.y, s: A.s || 1, face: A.face || FACES.calm, headRot: A.headRot || 0, headDX: A.headDX || 0, headDY: A.headDY || 0,
    blink: 0, soot: A.soot || 0, noLegs: A.noLegs };
  let pose = JSON.parse(JSON.stringify(A.pose || POSES.stand));
  const loc = (p) => ikLocal(st, p[0], p[1]);
  if (A.armL) pose = armAt(pose, 'L', loc(A.armL.e), loc(A.armL.w));
  if (A.armR) pose = armAt(pose, 'R', loc(A.armR.e), loc(A.armR.w));
  if (A.handL) pose.handL = A.handL;
  if (A.handR) pose.handR = A.handR;
  st.pose = pose;
  const r = charLayer(cam, st, t, { pal: A.pal || PAL, pre: A.pre, post: (lc, rr, st2) => {
    if (A.hat > 0) stHardHat(lc, rr, st2, A);
    if (A.post) A.post(lc, rr, st2);
  } });
  // cut him out of the glow layer: no sun or lamp shines through him
  gctx.save(); gctx.setTransform(1, 0, 0, 1, 0, 0); gctx.globalCompositeOperation = 'destination-out';
  gctx.drawImage(layerC, 0, 0, W / 2, H / 2); gctx.restore();
  return r;
}
// a rig point in world units (no drawing): 'head', 'wrR', 'wrL', ...
function heroPt(A, key, rr) {
  const s = A.s || 1;
  if (key === 'head') return [A.x + (A.headDX || 0) + rr.head[0] * s, A.y + (A.headDY || 0) + rr.head[1] * s];
  return [A.x + rr[key][0] * s, A.y + rr[key][1] * s];
}

// ---------------------------------------------------------------- the swamp, whole: backdrop, three layers of forest, horsetails,
// the bank, the big tree, the young pole tree, the hero, what stands in front of him
// o: {fall(tree, i, L), btAng, btSink, pole: {...}, hero(cam) -> rig, after(cam), fg: 0..1 foreground fronds, drag: dragonfly}
function swampDraw(cam, t, o = {}) {
  const bd = stBackdrop(cam, t);
  for (const L of ST_LAYERS) stLayer(cam, t, L, { fall: o.fall, afterTree: o.afterTree });
  const lcH = stLayerCam(cam, 0.28);
  applyCam(lcH);
  for (const hz of ST_HORSE) stHorsetail(ctx, hz.x, ST.gy, hz.h, hz.seed, t);
  stBank(cam, t);
  applyCam(cam);
  // the big tree (it may topple: the swamp shot)
  ctx.save();
  if (o.btAng) { ctx.translate(BT.x, BT.by); ctx.rotate(o.btAng); ctx.translate(-BT.x, -BT.by); }
  stTrunk(ctx, BT.x, BT.by + (o.btSink || 0), BT.trunk, BT.half, cam, { litFn: o.litFn });
  stCrown(ctx, BT.x, BT.by + (o.btSink || 0) - BT.trunk, ST.treeH, BT.half, 7, t, { kind: 'lep' });
  ctx.restore();
  let pole = null;
  if (o.pole !== false) pole = stPole(ctx, t, o.pole || {});
  // the sun's rays past the canopy and trunks
  screenSpace();
  if (bd.sun[1] > -2400) sunRays(bd.sun[0], bd.sun[1], 0.55, { reach: 0.9 });
  let rr = null;
  if (o.hero) { applyCam(cam); rr = o.hero(cam, pole); }
  applyCam(cam);
  if (o.after) { o.after(cam, pole); applyCam(cam); }
  if (o.drag) o.drag(cam);
  return { bd, pole, rr };
}

// ================================================================ the hook + the answer (one continuous shot)
// tt = seconds since frame 1; valid at negative tt (the loop's last frames are frame 0's picture)
const HOOK_CAM0 = [636, 1112, 2.5];
function hookCam(tt) {
  const c = cu();
  if (tt <= 0) return { x: HOOK_CAM0[0] - 4 * tt, y: HOOK_CAM0[1], zoom: HOOK_CAM0[2] + 0.06 * tt, rot: 0 };
  return camLog(tt, [[0, ...HOOK_CAM0], [c.snake_end, 640, 1108, 2.6], [c.tree - 0.05, 644, 1110, 2.62],
    [c.youve + 0.1, 860, -8900, 0.62], [c.a_tree - 0.05, 870, -9050, 0.66], [c.tall_end - 0.6, 760, -4005, 0.115], [c.tall_end + 0.05, 760, -4005, 0.115],
    [c.snakeskin_end - 0.25, 610, 1135, 1.2], [c.a_tree + 9, 600, 1130, 1.26]]);
}
function hookA(tt) {
  const c = cu();
  // his hand flat on the bark at chest height; he leans in, squinting at the diamonds
  const A = { x: HERO.x, y: HERO.y, face: HF.squint, headRot: 0.1, headDX: 16, headDY: 6 };
  const handOn = { e: [660, 1258], w: [716, 1200] };
  let flinch = 0, gust = 0, thumb = 0;
  if (tt >= 0) {
    gust = Math.sin(Math.PI * clamp(inv(c.flick - 0.1, c.flick + 0.36, tt)));
    flinch = r2(tt, c.flick + 0.02, c.flick + 0.12, E.outBack) * (1 - r2(tt, c.flick + 0.55, c.tree - 0.1));
    thumb = r2(tt, c.snakeskin_end - 0.32, c.snakeskin_end - 0.1, E.outBack);
  }
  A.headDX += -22 * flinch; A.headRot += -0.14 * flinch; A.headDY += -6 * flinch;
  let f = lerpFace(HF.squint, HF.flinch, flinch);
  if (tt >= 0) f = lerpFace(f, HF.up, r2(tt, c.tree - 0.1, c.tree + 0.1) * (1 - r2(tt, c.tall_end, c.snakeskin - 0.2)));
  f = lerpFace(f, HF.approve, thumb);
  A.face = f;
  const off = { e: [652, 1288], w: [668, 1250] };   // the hand jerks off the bark in the flinch
  const tup = { e: [640, 1262], w: [662, 1188] };   // the thumbs-up to the tree
  let arm = handOn;
  arm = armMix(arm, off, flinch);
  arm = armMix(arm, tup, thumb);
  A.armR = arm; A.handR = thumb > 0.5 ? 'thumb' : flinch > 0.4 ? 'open' : 'spread';
  A.headRot += 0.12 * thumb; A.headDX += -6 * thumb;
  return { A, gust, flinch, thumb };
}
// the gust's leaf brushing his cheek: one of the pole's long leaves, in front of his face (his layer's post)
function hookLeaf(lc, k) {
  if (k <= 0.01) return;
  // a tapered blade from the pole on his left, swished across his cheek and nose by the gust
  const bx = POLE.x + 40, by = 1060;
  const dir = lerp(-0.7, 0.08, k), len = 330;
  const P = [];
  for (let i = 0; i <= 14; i++) {
    const u = i / 14, a = dir + 0.35 * u * u;
    P.push([bx + Math.cos(dir) * len * u, by + Math.sin(a) * len * u + 18 * u * u]);
  }
  const wAt = (u) => 13 * (1 - Math.pow(u, 1.6)) + 1.5;
  lc.beginPath();
  for (let i = 0; i <= 14; i++) { const p = P[i], q = P[Math.min(14, i + 1)], o = P[Math.max(0, i - 1)], nx = -(q[1] - o[1]), ny = q[0] - o[0], L = Math.hypot(nx, ny) || 1; lc.lineTo(p[0] + nx / L * wAt(i / 14), p[1] + ny / L * wAt(i / 14)); }
  for (let i = 14; i >= 0; i--) { const p = P[i], q = P[Math.min(14, i + 1)], o = P[Math.max(0, i - 1)], nx = -(q[1] - o[1]), ny = q[0] - o[0], L = Math.hypot(nx, ny) || 1; lc.lineTo(p[0] - nx / L * wAt(i / 14), p[1] - ny / L * wAt(i / 14)); }
  lc.closePath(); lc.fillStyle = STC.leaf; lc.fill();
  paint(() => { poly(lc, P.slice(0, 12), 2.5, STC.leafHi); });
}
function hookDraw(tt, t, o = {}) {
  const c = cu();
  const cam = o.cam || hookCam(tt);
  const st = hookA(tt);
  const out = swampDraw(cam, t, {
    pole: { gust: st.gust * 0.9 },
    hero: (cam2) => heroDraw(cam2, t, Object.assign({}, st.A, { post: (lc) => hookLeaf(lc, st.gust) })),
  });
  return { cam, st, out };
}
function stTimer(k, frac) {
  if (k <= 0) return;
  screenSpace();
  const x = 540, y = 600, R = 74 * lerp(0.6, 1, E.outBack(clamp(k)));
  ctx.lineWidth = 16;
  ctx.strokeStyle = 'rgba(12,12,28,0.8)'; ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.stroke();
  ctx.strokeStyle = '#FFD447'; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(x, y, R, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * (1 - frac)); ctx.stroke();
  ctx.font = '900 76px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = 8; ctx.strokeStyle = '#0B0B1A'; const n = String(Math.max(1, Math.ceil(2 * (1 - frac))));
  ctx.strokeText(n, x, y + 4); ctx.fillStyle = '#FFFFFF'; ctx.fillText(n, x, y + 4);
}
function stTag(txt, x, y, k, col, sub, lead) {
  if (k <= 0) return;
  screenSpace();
  if (lead) thinLeader([x, y + (sub ? 46 : 30)], lead, clamp(k * 1.3 - 0.2), col);
  const s = lerp(0.6, 1, E.outBack(clamp(k)));
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.font = '900 42px Montserrat'; const w1 = ctx.measureText(txt).width;
  ctx.font = '800 26px Montserrat'; const w2 = sub ? ctx.measureText(sub).width : 0;
  const w = Math.max(w1, w2) + 84, h = sub ? 108 : 70;
  rrect(ctx, -w / 2, -h / 2, w, h, 22); ctx.fillStyle = 'rgba(12,12,28,0.84)'; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = col; ctx.stroke();
  circle(ctx, -w / 2 + 28, sub ? -16 : 0, 9, col);
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.font = '900 42px Montserrat'; ctx.fillStyle = '#FFFFFF'; ctx.fillText(txt, -w / 2 + 50, sub ? -16 : 2);
  if (sub) { ctx.font = '800 26px Montserrat'; ctx.fillStyle = col; ctx.fillText(sub, -w / 2 + 50, 26); }
  ctx.restore();
}
SC.hook = (lt, t) => {
  const c = cu();
  const { cam } = hookDraw(t, t);
  // the crane's speed smears the frame vertically (the trunk rushing past)
  const c2 = hookCam(t + 1 / 30);
  const vy = (c2.y - cam.y) * cam.zoom;
  const blurY = clamp(-vy * 0.55, -170, 170);
  return { glow: 0.8, blur: Math.abs(blurY) > 2 ? [0, blurY] : null, overlay: () => {
    // "You've got two seconds.": a ring drains
    stTimer(popK(t, c.youve - 0.05, c.a_tree + 0.05), clamp(inv(c.youve + 0.2, c.a_tree - 0.1, t)));
    // "Forty metres tall": a measure line up the whole tree, and him for scale
    const kM = r2(t, c.forty - 0.1, c.forty + 0.5, E.outCubic) * (1 - r2(t, c.tall_end + 0.05, c.tall_end + 0.25));
    if (kM > 0) {
      screenSpace();
      const a = toScreen(cam, BT.x - 1250, ST.gy), b = toScreen(cam, BT.x - 1250, ST.gy - ST.treeH);
      const yb = lerp(a[1], b[1], kM);
      ctx.setLineDash([14, 10]); line(ctx, a[0], a[1], a[0], yb, 5, rgba('#FFD447', 0.95)); ctx.setLineDash([]);
      line(ctx, a[0] - 22, a[1], a[0] + 22, a[1], 5, '#FFD447');
      if (kM > 0.95) line(ctx, b[0] - 22, b[1], b[0] + 22, b[1], 5, '#FFD447');
      stTag('40 m', a[0] + 118, (a[1] + b[1]) / 2, r2(t, c.forty, c.forty + 0.25, E.outBack) * (1 - r2(t, c.tall_end + 0.05, c.tall_end + 0.2)), '#FFD447', 'TALL');
      const hp = toScreen(cam, HERO.x, HERO.y - 300);
      stTag('HIM', hp[0] + 200, hp[1] - 40, r2(t, c.metres + 0.1, c.metres + 0.35, E.outBack) * (1 - r2(t, c.tall_end + 0.05, c.tall_end + 0.2)), '#7FE9FF', null, [hp[0] + 14, hp[1]]);
    }
  } };
};

// ================================================================ the leaf: "Every diamond is where a leaf fell off."
function leafA(t) {
  const c = cu();
  const A = { x: HERO.x, y: HERO.y, face: HF.look, headRot: -0.08, headDX: -10 };
  const grab = r2(t, c.where - 0.05, c.leaf + 0.15);
  const tug = Math.sin(Math.PI * clamp(inv(c.fell1, c.pop, t))) * (t < c.pop ? 1 : 0);
  const popK2 = r2(t, c.pop, c.pop + 0.16, E.outBack);
  const back = r2(t, c.pop + 0.38, c.pop + 0.7);            // he presses it back on, sheepish
  const rest = { e: [-96, -300], w: [-104, -210] };
  const reach = { e: [424, 1236], w: [366, 1150] };
  const pull = { e: [440, 1244], w: [398, 1166] };
  const out = { e: [446, 1240], w: [440, 1140] };          // yanked free, the leaf up in front of him
  let arm = armMix({ e: [HERO.x - 96, HERO.y - 300], w: [HERO.x - 104, HERO.y - 210] }, reach, grab);
  arm = armMix(arm, pull, tug);
  arm = armMix(arm, out, popK2);
  arm = armMix(arm, reach, back);
  A.armL = arm;
  let f = HF.look;
  f = lerpFace(f, Object.assign({}, HF.look, { mouth: 'grimace', mouthOpen: 0.6, browY: 0.7 }), tug);
  f = lerpFace(f, HF.oops, popK2 * (1 - back));
  f = lerpFace(f, HF.sheepish, back);
  A.face = f;
  A.headRot += -0.06 * tug + 0.1 * back;
  return { A, grab, tug, popK: popK2, back };
}
function heldLeaf(lc, wr, ang, k) {
  // the plucked leaf in his hand: long and grassy, its pale base where it tore off
  const len = 200, bx = wr[0], by = wr[1];
  const ex = bx + Math.cos(ang) * len, ey = by + Math.sin(ang) * len;
  const mx = bx + Math.cos(ang) * len * 0.5, my = by + Math.sin(ang) * len * 0.5 - 18;
  lc.beginPath(); lc.moveTo(bx, by); lc.quadraticCurveTo(mx, my, ex, ey);
  lc.lineWidth = 10; lc.strokeStyle = STC.leaf; lc.lineCap = 'round'; lc.stroke();
  paint(() => { circle(lc, bx, by, 7, '#C8E890'); });
}
SC.leaf = (lt, t, shot) => {
  const c = cu();
  const cam = camKeys(t, [[shot.start, 410, 1175, 1.7], [c.pop, 400, 1170, 1.86], [shot.end, 398, 1168, 1.9]], E.inOutSine);
  const st = leafA(t);
  const lit = r2(t, c.diamond - 0.05, c.diamond + 0.45, E.outCubic) * (1 - r2(t, c.where, c.where + 0.3));
  let base = null;
  swampDraw(cam, t, {
    pole: { lit, plucked: st.popK > 0 ? 1 : 0, pull: st.tug },
    litFn: (row, k, cx, y) => (lit > 0 && row > 2 && row < 26 ? clamp(lit * 1.4 - row / 30) : 0),
    hero: (cam2, pole) => {
      base = pole && pole.pluckBase;
      return heroDraw(cam2, t, Object.assign({}, st.A, { post: (lc, rr, s2) => {
        if (st.popK > 0) {
          const wr = [HERO.x + rr.wrL[0], HERO.y + rr.wrL[1]];
          const ang = lerp(-2.2, -1.75, st.popK) + 0.4 * st.back;
          heldLeaf(lc, wr, ang, 1);
        }
      } }));
    },
    after: () => {
      if (base && st.popK > 0) {   // the fresh scar: a ring pops out of it
        const k = clamp((t - c.pop) / 0.35);
        if (k < 1) { ctx.lineWidth = 6 * (1 - k); ctx.strokeStyle = rgba('#E8FFB0', 1 - k); ctx.beginPath(); ctx.arc(base[0], base[1] + 6, 14 + 50 * k, 0, 7); ctx.stroke(); }
      }
    },
  });
  const shakeK = bumpAt(t, c.pop, 14);
  return { glow: 0.8, push: { k: 1 + 0.02 * shakeK, cx: 540, cy: 900 } };
};


// ================================================================ the swamp falls: "Three hundred million years ago, whole swamps of them fell over..."
const FALL_DUR = 0.72;
function fallTime(tr, i, L) {
  const c = cu(), tp = c.topple;
  if (L.dz < 1) return tp[(i * 2) % tp.length] + 0.05 * (i % 3);
  if (L.dz < 2) return tp[(i + 1) % tp.length] - 0.12 + 0.1 * hash(i + 4);
  return 13.25 + 2.0 * hash(i * 3.7 + 1);
}
function fallState(t, tr, i, L) {
  const t0 = fallTime(tr, i, L), k = clamp((t - t0) / FALL_DUR);
  if (k <= 0) return null;
  const dir = hash(i * 1.3 + L.dz * 7) < 0.5 ? -1 : 1;
  const after = Math.max(0, t - t0 - FALL_DUR);
  const ang = tr.lean + dir * ((Math.PI / 2 - 0.08) * E.inCubic(k) + (after > 0 ? 0.035 * Math.exp(-after * 6) * Math.sin(after * 30) : 0));
  return { ang, sink: 50 * clamp(after / 0.6), dir, tHit: t0 + FALL_DUR };
}
function swampA(t) {
  const c = cu();
  if (t < c.pop + 0.9) return leafA(t).A;   // still pressing the leaf back on
  const A = { x: HERO.x, y: HERO.y, face: HF.sheepish, headRot: 0.04 };
  const look = r2(t, c.whole - 0.3, c.whole);
  const duck = r2(t, c.over - 0.08, c.over + 0.12, E.outBack);
  let f = lerpFace(HF.sheepish, Object.assign({}, HF.up, { lookX: -0.6 }), look);
  f = lerpFace(f, HF.duck, duck);
  A.face = f;
  // the shrug, then hands over his head as the big one goes
  const shrug = Math.sin(Math.PI * clamp(inv(c.pop + 0.9, c.million + 0.3, t)));
  A.armL = armMix({ e: [HERO.x - 96, HERO.y - 300], w: [HERO.x - 104, HERO.y - 210] }, { e: [HERO.x - 150, HERO.y - 330], w: [HERO.x - 190, HERO.y - 400] }, shrug);
  A.armR = armMix({ e: [HERO.x + 96, HERO.y - 300], w: [HERO.x + 104, HERO.y - 210] }, { e: [HERO.x + 150, HERO.y - 330], w: [HERO.x + 190, HERO.y - 400] }, shrug);
  if (duck > 0) {
    A.armL = armMix(A.armL, { e: [HERO.x - 120, HERO.y - 480], w: [HERO.x - 30, HERO.y - 560] }, duck);
    A.armR = armMix(A.armR, { e: [HERO.x + 120, HERO.y - 480], w: [HERO.x + 30, HERO.y - 560] }, duck);
    const P = JSON.parse(JSON.stringify(POSES.stand));
    P.hipY = lerp(-222, -170, duck); P.legL = { a: lerp(0.07, 0.5, duck), b: lerp(0, -0.95, duck) }; P.legR = { a: lerp(0.07, 0.5, duck), b: lerp(0, -0.95, duck) };
    A.pose = P; A.headDY = 30 * duck;
  }
  return A;
}
SC.swamp = (lt, t, shot) => {
  const c = cu();
  const cam0 = camLog(t, [[shot.start, 398, 1168, 1.9], [c.pop + 0.95, 400, 1160, 1.86], [c.ago_end, 700, -560, 0.3], [c.over, 760, -520, 0.31], [shot.end, 770, -500, 0.315]]);
  const sh = bumpAt(t, c.crash, 7);
  const cam = Object.assign({}, cam0, { sx: 18 * sh * Math.sin(t * 61), sy: 14 * sh * Math.cos(t * 53) });
  const btK = clamp((t - c.over) / (c.crash - c.over));
  const btAng = (Math.PI / 2 - 0.06) * E.inCubic(btK);
  const A = swampA(t);
  const stLeaf = leafA(t);
  swampDraw(cam, t, {
    pole: { plucked: 1 },
    btAng,
    fall: (tr, i, L) => fallState(t, tr, i, L),
    clear: r2(t, c.pop + 0.9, c.ago_end),
    afterTree: (tr, i, L, f, lc) => {
      if (!f) return;
      const k = (t - f.tHit) / 0.9;
      if (k > 0 && k < 1) for (const d of [0.2, 0.38, 0.56, 0.74, 0.9]) stSplash(ctx, tr.x + f.dir * tr.h * d, ST.gy, k, tr.h / 2600, i * 7 + d * 10);
    },
    hero: (cam2) => heroDraw(cam2, t, Object.assign({}, A, { post: (lc, rr) => {
      if (t < c.pop + 0.95) {   // the leaf pressed back to the scar... and let go
        const wr = [HERO.x + rr.wrL[0], HERO.y + rr.wrL[1]];
        heldLeaf(lc, wr, lerp(-2.2, -1.75, stLeaf.popK) + 0.4 * stLeaf.back, 1);
      }
    } })),
    after: () => {
      // the leaf drops from the scar to the mud, rocking
      const k = clamp((t - (c.pop + 0.95)) / 0.6);
      if (k > 0) {
        const x = 330 + 40 * k, y = 1150 + 380 * E.inQuad(k), a = -1.75 + 1.4 * k + 0.4 * Math.sin(k * 9);
        heldLeaf(ctx, [x, y], a, 1);
      }
      // the big tree hits the water beside him: splashes all along it
      const kb = (t - c.crash) / 0.9;
      if (kb > 0 && kb < 1) for (const d of [0.12, 0.3, 0.5, 0.7, 0.9]) stSplash(ctx, BT.x + ST.treeH * d, ST.gy, kb, 2.6, 50 + d * 10);
    },
    drag: () => {   // the giant dragonfly (wings 70 cm across) bolts past the lens, away from the falling trees
      const k = clamp((t - (c.whole - 0.35)) / 1.1);
      if (k > 0 && k < 1) { screenSpace(); stDragonfly(ctx, lerp(-260, 1340, E.inOutSine(k)), 760 - 160 * Math.sin(Math.PI * k), 1.5, t, -0.1 + 0.08 * Math.sin(k * 12)); }
    },
  });
  return { glow: 0.8, push: { k: 1 + 0.03 * clamp((t - c.three) / 4), cx: 540, cy: 1100 } };
};

// ================================================================ buried, squashed: "got buried... and squashed into COAL."
const CUT_LAYERS = [['#7A7266', 110], ['#B8A070', 84], ['#6E665C', 100], ['#A89060', 86]];
function cutState(t) {
  const c = cu();
  const surf = 700, pourT = [c.got + 0.08, c.buried - 0.02, c.buried + 0.24, c.buried_end + 0.02];
  const layers = [];
  let y = surf + 26;
  // newest on top: pour them in order, each pushing everything below it down
  const hs = CUT_LAYERS.map(([col, h], i) => [col, h * E.outCubic(clamp((t - pourT[i]) / 0.3))]);
  const squash = [c.stomp[0], c.stomp[1], c.stomp[2]].reduce((a, ts, i) => a + E.outBack(clamp((t - ts) / 0.16)), 0) / 3;
  for (let i = hs.length - 1; i >= 0; i--) { const h = hs[i][1] * (1 - 0.18 * squash); layers.push([y, h, hs[i][0]]); y += h; }
  const peatH = lerp(300, 64, squash);
  return { surf, peatTop: y, peatH, layers, black: clamp(squash * 1.15), gloss: clamp((t - (c.coal + 0.05)) / 0.7), squash };
}
SC.coal = (lt, t, shot) => {
  const c = cu();
  const S = cutState(t);
  stCutaway(t, S);
  // him on the surface, small: wading at first, then stomping the layers down
  let jump = 0;
  for (const ts of c.stomp) { const u = (t - (ts - 0.24)) / 0.24; if (u > 0 && u < 1) jump = Math.max(jump, Math.sin(Math.PI * u)); }
  const camH = { x: 540, y: 960, zoom: 1 };
  const A = { x: 540, y: S.surf + 4 - 90 * jump, s: 0.5, face: lerpFace(HF.look, Object.assign({}, FACES.annoyed, { lookY: 0.8, lookX: 0 }), r2(t, c.squashed - 0.3, c.squashed)) };
  const stompK = r2(t, c.squashed - 0.3, c.squashed);
  A.armL = armMix({ e: [540 - 48, A.y - 150], w: [540 - 52, A.y - 105] }, { e: [540 - 80, A.y - 170], w: [540 - 60, A.y - 120] }, stompK);
  A.armR = armMix({ e: [540 + 48, A.y - 150], w: [540 + 52, A.y - 105] }, { e: [540 + 80, A.y - 170], w: [540 + 60, A.y - 120] }, stompK);
  if (jump > 0) { const P = JSON.parse(JSON.stringify(POSES.stand)); P.legL = { a: 0.3 * jump, b: -0.6 * jump }; P.legR = { a: 0.3 * jump, b: -0.6 * jump }; A.pose = P; }
  heroDraw(camH, t, A);
  // dust puffs where he lands
  screenSpace();
  for (const ts of c.stomp) { const k = (t - ts) / 0.4; if (k > 0 && k < 1) for (const sgn of [-1, 1]) softDot(ctx, 540 + sgn * (40 + 110 * k), S.surf + 10, 30 + 40 * k, '#C8C0A8', 0.6 * (1 - k)); }
  const fl = 0.55 * (1 - clamp((t - shot.start) / 0.18));
  return { glow: 0.75, flash: fl, push: { k: 1 + 0.02 * lt / (shot.end - shot.start), cx: 540, cy: 900 }, overlay: () => {
    stPushArrows(popK(t, c.squashed - 0.1, c.coal + 0.2), t);
    // the glint on the seam
    const g = popK(t, c.glint - 0.05, c.glint + 0.35);
    if (g > 0) { screenSpace(); stStarGlint(860, S.peatTop + S.peatH / 2, g); }
  } };
};
function stStarGlint(x, y, k) {
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  ctx.beginPath(); for (let j = 0; j < 8; j++) { const rr = j % 2 ? 10 : 46, b = j * Math.PI / 4; ctx.lineTo(Math.cos(b) * rr, Math.sin(b) * rr); }
  ctx.closePath(); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.restore();
  softDot(gctx, x, y, 70 * k, '#CFE0FF', 0.9);
}

// ================================================================ "Steam trains burned them... by the TON."
const CAB_HERO = { x: 470, y: LOCO.floor };
const SCOOP = { L: { e: [500, 1300], w: [560, 1330] }, R: { e: [600, 1330], w: [640, 1392] } };
const SWING = { L: { e: [420, 1270], w: [380, 1250] }, R: { e: [500, 1310], w: [462, 1290] } };
function cabState(t) {
  const c = cu();
  const swing = r2(t, c.burned - 0.1, c.burned + 0.3) * (1 - r2(t, c.whoosh_fire + 0.15, c.by + 0.1));
  const scoop0 = 0.5 + 0.5 * Math.sin((t - 19.07) * 9);
  const throwK = clamp((t - (c.burned + 0.3)) / 0.35);
  const dump = clamp((t - (c.ton + 0.03)) / (c.dump - c.ton));
  return { swing, scoop0, throwK, dump };
}
SC.trains = (lt, t, shot) => {
  const c = cu();
  const S = cabState(t);
  const camK = camLog(t, [[shot.start, -220, 1180, 0.52], [c.burned - 0.1, 470, 1190, 1.15], [c.ton, 480, 1196, 1.2], [shot.end, 490, 1200, 1.24]]);
  const sh = bumpAt(t, c.dump - 0.15, 8);
  const cam = Object.assign({}, camK, { sx: 14 * sh * Math.sin(t * 57), sy: 10 * sh * Math.cos(t * 49) + 4 * Math.sin(t * 31) });
  stLocoBack(cam, t);
  stSmoke(cam, t);
  stLoco(cam, t, { wheel: -t * 11, fire: popK(t, c.whoosh_fire - 0.04, c.whoosh_fire + 0.5, 0.06, 0.4) });
  stTender(cam, t, { heap: S.dump });
  applyCam(cam);
  const A = { x: CAB_HERO.x, y: CAB_HERO.y, soot: 0.55 + 0.45 * S.dump, face: lerpFace(Object.assign({}, FACES.calm, { lookX: -1, lookY: 0.3, mouth: 'flat' }), Object.assign({}, FACES.grin, { lookX: -1 }), S.throwK * (1 - S.dump)) };
  A.face = lerpFace(A.face, Object.assign({}, FACES.startled, { lookX: 1, lookY: -0.7 }), r2(t, c.ton - 0.05, c.ton + 0.1) * (1 - r2(t, c.dump - 0.05, c.dump + 0.1)));
  A.face = lerpFace(A.face, Object.assign({}, FACES.dazed, { cross: 0, blink: 0.3 }), r2(t, c.dump - 0.02, c.dump + 0.12));
  const sc = { L: armMix(SCOOP.L, { e: [SCOOP.L.e[0] + 20, SCOOP.L.e[1] - 30], w: [SCOOP.L.w[0] + 30, SCOOP.L.w[1] - 50] }, S.scoop0 * (1 - S.swing)), R: armMix(SCOOP.R, { e: [SCOOP.R.e[0] + 20, SCOOP.R.e[1] - 30], w: [SCOOP.R.w[0] + 30, SCOOP.R.w[1] - 50] }, S.scoop0 * (1 - S.swing)) };
  A.armL = armMix(sc.L, SWING.L, S.swing); A.armR = armMix(sc.R, SWING.R, S.swing);
  A.headRot = -0.12 * S.swing;
  heroDraw(cam, t, Object.assign({}, A, { post: (lc, rr) => {
    // the shovel: a long handle through both hands, the blade beyond the lower one
    const wl = [CAB_HERO.x + rr.wrL[0], CAB_HERO.y + rr.wrL[1]], wrr = [CAB_HERO.x + rr.wrR[0], CAB_HERO.y + rr.wrR[1]];
    const dx = wl[0] - wrr[0], dy = wl[1] - wrr[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
    const tip = [wl[0] + ux * 150, wl[1] + uy * 150];
    line(lc, wrr[0] - ux * 60, wrr[1] - uy * 60, tip[0], tip[1], 12, '#8A6038');
    lc.save(); lc.translate(tip[0], tip[1]); lc.rotate(Math.atan2(uy, ux));
    rrect(lc, -6, -34, 74, 68, 10); lc.fillStyle = '#4A4E58'; lc.fill(); lc.restore();
    if (S.throwK < 0.05 && S.dump <= 0) stLump(lc, tip[0] + ux * 30, tip[1] + uy * 30 - 22, 2.1, 7, true, 0.3);
    // his hands again over the handle
    drawHand(lc, wl, [ux, uy], 'open', PAL, -1, t); drawHand(lc, wrr, [ux, uy], 'open', PAL, 1, t);
  } }));
  // the lump flying into the fire
  if (S.throwK > 0 && S.throwK < 1) {
    applyCam(cam);
    const p0 = [330, 1220], p1 = [LOCO.cabX0 + 95, LOCO.floor - 280];
    stLump(ctx, lerp(p0[0], p1[0], S.throwK), lerp(p0[1], p1[1], S.throwK) - 60 * Math.sin(Math.PI * S.throwK), 2.1 * (1 - 0.4 * S.throwK), 7, true, S.throwK * 5);
  }
  stAvalanche(cam, t, S.dump, CAB_HERO.x);
  return { glow: 0.85 };
};
function stLumpInset(k, t) {
  screenSpace();
  const x = 300, y = 640, R = 130 * lerp(0.5, 1, E.outBack(clamp(k)));
  circle(ctx, x, y, R + 8, '#FFD447');
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.clip();
  ctx.fillStyle = '#2A2830'; ctx.fillRect(x - R, y - R, 2 * R, 2 * R);
  stLump(ctx, x, y + 6, 4.2 * R / 130, 7, true, 0.3);
  ctx.restore();
  thinLeader([x + R * 0.7, y + R * 0.7], [x + R * 1.5, y + R * 1.6], clamp(k * 1.5), '#FFD447');
}

// ================================================================ the mine: "And miners still find their stumps in the ceiling... and sometimes, they FALL."
// the projection with a pitch (looking up by p): tunnel units -> screen
function mineProj(MC) {
  const cp = Math.cos(MC.pitch || 0), sp = Math.sin(MC.pitch || 0), z0 = MC.z0 || MINE.z0;
  return (X, Y, Z) => {
    const yy = Y - MINE.eye, zz = Z + z0;
    const fz = Math.max(40, zz * cp + yy * sp), fy = yy * cp - zz * sp;
    return [540 + (MC.cx || 0) + MINE.f * X / fz, MC.cy - MINE.f * fy / fz];
  };
}
function minePt(X, Y, Z, MC) { return mineProj(MC)(X, Y, Z); }
const MINE_STUMP_ABOVE = 0;   // MINE_STUMPS[0] is right above him
MINE_STUMPS[0] = [10, 70, 118];
MINE_STUMPS.push([-300, -420, 130], [240, -250, 120]);
function mineHero(MC, A, t) {
  // he stands at X 0, Z 0: his feet and his scale from the projection
  const P = mineProj(MC);
  const feet = P(A.X || 0, 0, A.Z || 0), head = P(A.X || 0, 560, A.Z || 0);
  const s = (feet[1] - head[1]) / 560;
  const cam = { x: 540, y: 1560, zoom: s, sx: feet[0] - 540, sy: feet[1] - 960 };
  const r = heroDraw(cam, t, Object.assign({}, A, { x: 540, y: 1560 }));
  return { cam, r, s, feet };
}
const MINE_HAT = { hat: 1 };
SC.mine = (lt, t, shot) => {
  const c = cu();
  const pitch = lerp(0.06, 0.48, r2(t, c.stumps - 0.25, c.ceiling1 + 0.1, E.inOutSine)) - 0.36 * r2(t, c.ceiling1_end + 0.05, c.sometimes + 0.35, E.inOutSine);
  const MC = { cy: 950 + 260 * clamp(pitch / 0.48), pitch, z0: MINE.z0 + 120 * (1 - r2(t, shot.start, c.stumps)) };
  const wig = clamp((t - c.wiggle) / (c.drop - c.wiggle));
  const dropK = clamp((t - c.drop) / (c.bonk - c.drop));
  const P = mineProj(MC);
  // the lamp: it lights the stump it points at
  const litOf = (i) => (i === 2 ? popK(t, c.stumps + 0.05, c.ceiling1_end + 0.3) : 0) + (i === 0 ? r2(t, c.sometimes - 0.3, c.sometimes) : 0) + (i === 1 ? popK(t, c.ceiling1 - 0.2, c.ceiling1_end + 0.2) : 0);
  stMine(t, MC, { lit: litOf, wiggle: { i: 0, k: wig > 0 && dropK <= 0 ? t : 0 }, skip: dropK > 0 ? 0 : -1 });
  // him: walking in with his lamp, looking up; then the bonk
  const lookUp = r2(t, c.stumps - 0.3, c.stumps) * (1 - r2(t, c.ceiling1_end, c.sometimes)) + r2(t, c.sometimes - 0.2, c.sometimes + 0.1);
  const bonk = r2(t, c.bonk - 0.02, c.bonk + 0.1, E.outBack);
  const A = { X: 0, Z: 0, face: lerpFace(Object.assign({}, FACES.calm, { lookX: 0.3, lookY: -0.2 }), Object.assign({}, FACES.worried, { lookX: 0.1, lookY: -1 }), lookUp), hat: 1, dent: bonk, headRot: 0 };
  A.face = lerpFace(A.face, HF.dazed, bonk);
  A.headDY = 26 * bonk * (1 - 0.6 * r2(t, c.bonk + 0.1, c.bonk + 0.3));
  if (bonk > 0) { const PP = JSON.parse(JSON.stringify(POSES.stand)); PP.hipY = -222 + 30 * bonk; PP.legL = { a: 0.2 * bonk, b: -0.5 * bonk }; PP.legR = { a: 0.2 * bonk, b: -0.5 * bonk }; A.pose = PP; }
  const H0 = mineHero(MC, A, t);
  const headS = toScreen(H0.cam, 540, 1560 - 470);
  // the beam from his lamp (screen): ahead and up, following the camera's pitch
  const lampP = [headS[0], headS[1] - 70 * H0.s];
  const beamA = -Math.PI / 2 - 0.25 + 0.35 * (1 - lookUp);
  stBeam(lampP, beamA, 900, 1);
  // the falling stump: out of the roof, onto his hat
  if (dropK > 0) {
    const st0 = MINE_STUMPS[0], top = P(st0[0], MINE.h, st0[1]);
    const sc = H0.s * 0.9;
    const yb = lerp(top[1] + 40 * sc, headS[1] - 104 * H0.s, E.inQuad(dropK));
    stFallingStump(ctx, top[0], yb, sc, 0.04 * Math.sin(t * 30) * (1 - dropK));
  }
  const kb = popK(t, c.bonk, c.bonk + 0.32, 0.05, 0.12);
  return { glow: 0.9, overlay: () => {
    stTag('KETTLEBOTTOMS', 540, 560, popK(t, c.ceiling1 - 0.05, c.sometimes - 0.15), '#FFD447', 'FOSSIL STUMPS IN THE ROOF');
    stDust(P(MINE_STUMPS[0][0], MINE.h, MINE_STUMPS[0][1])[0], P(MINE_STUMPS[0][0], MINE.h, MINE_STUMPS[0][1])[1], wig * (1 - dropK), t);
    stBurst('BONK!', 820, 900, kb, '#FFD447', 84);
  } };
};

// ================================================================ the button: "Snake, tree, coal... ceiling hazard. What a career."
const BTN_STUMP = { X: 330, Z: 60 };
function buttonDraw(t) {
  const c = cu();
  const MC = { cy: 690, pitch: 0.04, z0: 760, cx: -40 };
  stMine(t, MC, { lit: (i) => 0, skip: 0 });
  const P = mineProj(MC);
  // the stump, upright on the floor beside him (it bounced off his hat)
  const base = P(BTN_STUMP.X, 0, BTN_STUMP.Z), top = P(BTN_STUMP.X, 280, BTN_STUMP.Z);
  const ss = (base[1] - top[1]) / 280;
  // him, sitting, dazed: counting its career on his fingers
  const counts = [c.b_snake, c.b_tree, c.b_coal, c.b_ceiling];
  const n = counts.reduce((a, ts) => a + (t >= ts - 0.05 ? 1 : 0), 0);
  const raise = r2(t, c.b_snake - 0.25, c.b_snake) * (1 - r2(t, c.what - 0.2, c.what + 0.1));
  const pat = r2(t, c.what, c.career, E.inOutSine) * (1 - r2(t, c.pat + 0.3, c.loop0 - 0.02, E.inOutSine));
  const tap = Math.max(0, Math.sin((t - c.pat) * 18)) * clamp((t - c.pat + 0.6) / 0.2) * (1 - clamp((t - c.pat - 0.2) / 0.2));
  const A = { X: -40, Z: 0, pose: POSES.sit, hat: 1, dent: 1, hatTilt: -0.12, face: lerpFace(HF.dazed, Object.assign({}, FACES.calm, { lookX: 1, lookY: 0.2, browY: 0.6, mouth: 'flat', mouthOpen: 0.15, blink: 0.25 }), r2(t, c.b_snake, c.b_snake + 0.4)) };
  A.face = lerpFace(A.face, Object.assign({}, FACES.calm, { lookX: 1, lookY: 0.1, browY: 0.9, browTilt: -0.4, mouth: 'flat', blink: 0.35 }), pat);
  const feet = P(-40, 0, 0), headTop = P(-40, 560, 0);
  const s = (feet[1] - headTop[1]) / 560;
  const cam = { x: 540, y: 1560, zoom: s, sx: feet[0] - 540, sy: feet[1] - 960 };
  const toW = (sxy) => [540 + (sxy[0] - feet[0]) / s, 1560 + (sxy[1] - feet[1]) / s];
  const stumpTopW = toW([top[0], top[1]]);
  const raiseW = { e: [540 + 130, 1560 - 300], w: [540 + 150, 1560 - 430] };
  const patW = { e: [540 + 150, 1560 - 250], w: [stumpTopW[0] - 20, stumpTopW[1] - 30 - 18 * tap] };
  let armR = armMix({ e: [540 + 90, 1560 - 150], w: [540 + 130, 1560 - 90] }, raiseW, raise);
  armR = armMix(armR, patW, pat);
  A.armR = armR;
  A.headRot = 0.08 * Math.sin(t * 2.2) * (1 - pat);
  // the stump first (he leans on its far side? no: it stands beside him, drawn before him: behind)
  screenSpace();
  stFallingStump(ctx, base[0], base[1], ss, 0.02);
  heroDraw(cam, t, Object.assign({}, A, { x: 540, y: 1560, post: (lc, rr) => {
    if (raise > 0.3 && pat < 0.5) {
      const wr = rr.wrR, d = rr.armDirR;
      stCountHand(lc, [540 + wr[0], 1560 + wr[1]], d, Math.max(1, n), PAL);
    }
  } }));
  const headS = toScreen(cam, 540, 1560 - 282);
  return { base, top, ss, headS, s };
}

// "Snake, tree, coal... ceiling hazard.": the stump's career, as a row of icons that pop on their words (screen space)
function stCareer(t, fade) {
  const c = cu();
  const ts = [c.b_snake, c.b_tree, c.b_coal, c.b_ceiling], xs = [195, 405, 615, 825], y = 478;
  const out = r2(t, c.loop0 - 0.25, c.loop0 + 0.05);
  screenSpace();
  for (let i = 0; i < 4; i++) {
    const k = clamp((t - ts[i] + 0.04) / 0.22) * (1 - out) * fade;
    if (k <= 0) continue;
    if (i > 0) {   // the arrow from the last one
      const ka = clamp((t - ts[i] + 0.1) / 0.2);
      ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.strokeStyle = rgba('#FFFFFF', 0.9 * ka * (1 - out));
      const x0 = xs[i - 1] + 66, x1 = lerp(x0, xs[i] - 66, ka);
      ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x1 - 14, y - 12); ctx.lineTo(x1, y); ctx.lineTo(x1 - 14, y + 12); ctx.stroke();
    }
    ctx.save(); ctx.translate(xs[i], y); const sc = lerp(0.4, 1, E.outBack(k)); ctx.scale(sc, sc);
    circle(ctx, 0, 0, 64, 'rgba(12,12,28,0.86)'); ctx.lineWidth = 6; ctx.strokeStyle = ['#C8A8FF', '#4DFFB4', '#FF9A3C', '#FF5A6E'][i]; ctx.beginPath(); ctx.arc(0, 0, 64, 0, 7); ctx.stroke();
    if (i === 0) {          // a snake: an S with a head and an eye
      ctx.lineWidth = 14; ctx.strokeStyle = '#7ED957'; ctx.beginPath(); ctx.moveTo(-34, 26); ctx.bezierCurveTo(-8, 44, 20, 26, 0, 4); ctx.bezierCurveTo(-20, -18, 6, -36, 26, -24); ctx.stroke();
      circle(ctx, 30, -26, 12, '#7ED957'); circle(ctx, 33, -29, 3.5, '#0B0B1A');
      line(ctx, 40, -22, 52, -20, 3, '#FF5A6E');
    } else if (i === 1) {   // a scale tree: a trunk with diamonds and a forked crown
      rrect(ctx, -9, -10, 18, 50, 6); ctx.fillStyle = '#8E8650'; ctx.fill();
      for (let k2 = 0; k2 < 3; k2++) { ctx.fillStyle = '#4A4426'; ctx.beginPath(); ctx.moveTo(0, k2 * 14 - 2); ctx.lineTo(5, k2 * 14 + 4); ctx.lineTo(0, k2 * 14 + 10); ctx.lineTo(-5, k2 * 14 + 4); ctx.closePath(); ctx.fill(); }
      line(ctx, 0, -8, -22, -30, 7, '#8E8650'); line(ctx, 0, -8, 22, -30, 7, '#8E8650');
      for (const [bx, by] of [[-24, -34], [24, -34], [-6, -40], [8, -42]]) circle(ctx, bx, by, 13, '#5E9A3C');
    } else if (i === 2) {   // a lump of coal
      stLump(ctx, 0, 4, 1.9, 7, true, 0.2);
    } else {                // a warning sign
      ctx.beginPath(); ctx.moveTo(0, -38); ctx.lineTo(40, 32); ctx.lineTo(-40, 32); ctx.closePath(); ctx.fillStyle = '#FFD447'; ctx.fill();
      ctx.lineWidth = 5; ctx.strokeStyle = '#0B0B1A'; ctx.stroke();
      rrect(ctx, -5, -16, 10, 30, 4); ctx.fillStyle = '#0B0B1A'; ctx.fill(); circle(ctx, 0, 22, 5, '#0B0B1A');
    }
    ctx.restore();
  }
}

SC.button = (lt, t, shot) => {
  const c = cu(), D = TLd.duration;
  if (t >= D - 0.17) {   // the loop: frame 0's picture
    const { cam } = hookDraw(t - D, t);
    return { glow: 0.8 };
  }
  const B = buttonDraw(t);
  // the push into the stump's diamonds (the match cut onto the living bark of frame 0)
  const pk = E.inCubic(clamp((t - c.loop0) / (D - 0.17 - c.loop0)));
  const cx = B.base[0] + 10, cy = B.base[1] - 0.3 * (B.base[1] - B.top[1]);
  const starK = clamp(1 - (t - shot.start) / 2.2);
  return { glow: 0.9, push: { k: 1 + 2.6 * pk, cx, cy }, zblur: 0.12 * pk, zcx: cx, zcy: cy, overlay: () => {
    stStars(B.headS[0], B.headS[1] - 150 * B.s, starK * (1 - pk), t, 0.9 * B.s);
    stCareer(t, 1 - pk);
  } };
};
setLights({ button: (lt, t) => (t >= TLd.duration - 0.17 ? L_SWAMP : L_MINE) });

// ================================================================ the cover: him at the scaly trunk, looking up; SNAKE OR TREE?
SC.cover = (lt, t) => {
  const c = cu();
  const cam = { x: 640, y: 1000, zoom: 1.5, rot: 0 };
  const st = hookA(0);
  const A = Object.assign({}, st.A, { face: HF.up, headRot: 0.08 });
  swampDraw(cam, t, { pole: {}, hero: (cam2) => heroDraw(cam2, t, A) });
  screenSpace();
  bigWord('SNAKE', 540, 560, 190, '#C8A8FF', 1, -0.05);
  bigWord('OR TREE?', 540, 760, 150, '#4DFFB4', 1, -0.05);
  return { glow: 0.8, noCaptions: true };
};

function initScenes2() {
  initStWorld();
}
